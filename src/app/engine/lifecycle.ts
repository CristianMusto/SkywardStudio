/**
 * React-style lifecycle of the engine: mounting the canvas and listeners, the animation loop,
 * cleanup, prop changes, and the screenshot mode used to capture fixed states (?shot=…).
 */
import { STR } from './data';
import type { EngineCtx } from './types';

type Quality = 'high' | 'low' | 'auto';

const AUDIO_KEY = 'skyward.audio';
const LANG_SWITCH_KEY = 'skyward.langSwitch';
/** Below this width, or with ≤ LOW_CORES cores, "auto" quality starts lower. */
const SMALL_SCREEN = 760;
const LOW_CORES = 4;
/** Fade-out of the language-switch veil (ms). */
const VEIL_FADE_MS = 640;
/** The veil waits for fonts at most this long (ms). */
const FONT_WAIT_MS = 900;
/** Frames rendered before the veil lifts, so the first paint is complete. */
const SETTLE_FRAMES = 5;
const BOOT_MS = 1900;
const BOOT_REDUCED_MS = 300;
const COACH_DELAY = 1200;
/** Frames pre-rendered in screenshot mode before signalling readiness. */
const SHOT_FRAMES = 90;
const FRAME_MS = 16.7;

declare global {
  interface Window {
    /** Set to true in screenshot mode when the page is ready to capture. */
    __skyReady?: boolean;
  }
}

/** Fields and methods of the engine used by the lifecycle hooks. */
interface LifecycleCtx extends EngineCtx {
  sky: HTMLElement | null;
  ctx: CanvasRenderingContext2D | null;
  sprites: Record<string, unknown>;
  raf: number;
  miniRaf: number;
  t0: number;
  last: number;
  /** Time spent in the current perf sample, reset while the tab is hidden. */
  pt: number;
  revealAt: number | null;
  introT?: ReturnType<typeof setTimeout>;
  eggT?: ReturnType<typeof setTimeout>;
  ac?: AudioContext | null;
  aboutRO?: ResizeObserver | null;
  onResize?: () => void;
  onKey?: (e: KeyboardEvent) => void;
  onFirst?: () => void;

  key(e: KeyboardEvent): void;
  pDown(e: PointerEvent): void;
  pMove(e: PointerEvent): void;
  pUp(e: PointerEvent): void;
  wheel(e: WheelEvent): void;
  sizeCanvas(): void;
  setQ(level: number): void;
  seed(): void;
  perf(t: number): void;
  frame(t: number): void;
  toggleAudio(): void;
  wantIntro(): boolean;
  openList(): void;
  runShot(): void;
  syncRoute(): void;
  fSubmit(e: { preventDefault(): void }): void;
}

/** Quality level for a `quality` prop value. */
const qualityLevel = (q: Quality, autoLevel: number) => (q === 'high' ? 1 : q === 'low' ? 0.4 : autoLevel);

export const lifecycle = {
  /** Full-screen cover used during language switches, with an optional label. */
  veil(this: LifecycleCtx, label?: string): HTMLDivElement {
    const veil = document.createElement('div');
    veil.setAttribute('aria-hidden', 'true');
    veil.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;background:#0B0A1F;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity 280ms cubic-bezier(.4,0,.2,1);will-change:opacity';
    if (label) {
      const text = document.createElement('span');
      text.textContent = label;
      text.style.cssText =
        "font:400 12px 'Martian Mono',monospace;letter-spacing:.14em;color:#A9A3C2;transform:translateY(6px);transition:transform 280ms cubic-bezier(.2,.7,.2,1)";
      veil.appendChild(text);
    }
    document.body.appendChild(veil);
    return veil;
  },

  componentDidMount(this: LifecycleCtx): void {
    if (this.langIn) liftLanguageVeil(this);
    document.documentElement.lang = STR.langCode;

    this.onResize = () => {
      this.setState({ vw: innerWidth, vh: innerHeight });
      this.sizeCanvas();
    };
    this.onKey = e => this.key(e);
    addEventListener('resize', this.onResize);
    addEventListener('keydown', this.onKey);

    this.cv = document.createElement('canvas');
    this.cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const sky = this.sky;
    if (sky) {
      sky.appendChild(this.cv);
      sky.addEventListener('pointerdown', this.pDown);
      sky.addEventListener('pointermove', this.pMove);
      sky.addEventListener('pointerup', this.pUp);
      sky.addEventListener('pointercancel', this.pUp);
      sky.addEventListener('wheel', this.wheel, { passive: false });
      sky.addEventListener('contextmenu', e => e.preventDefault());
    }
    this.ctx = this.cv.getContext('2d');

    const requested: Quality = this.shot ? 'high' : ((this.props['quality'] as Quality) ?? 'auto');
    const lowEnd = innerWidth < SMALL_SCREEN || (navigator.hardwareConcurrency || 8) <= LOW_CORES;
    this.setQ(qualityLevel(requested, lowEnd ? 0.7 : 1));
    this.sizeCanvas();
    this.sprites = {};
    this.seed();
    this.t0 = performance.now();
    this.last = this.t0;
    this.idle = this.t0 - 5000;

    resumeAudioOnFirstInput(this);
    openInitialView(this);
    if (this.shot) this.runShot();

    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      if (document.hidden) {
        this.last = t;
        this.pt = 0;
        return;
      }
      this.perf(t);
      this.frame(t);
    };
    this.raf = requestAnimationFrame(loop);
  },

  /** Screenshot mode: sets up the requested state, renders a batch of frames and flags readiness. */
  runShot(this: LifecycleCtx): void {
    const shot = this.shot;
    const query = new URLSearchParams(location.search);
    const after = (ms: number, fn: () => void) => setTimeout(fn, ms);
    window.__skyReady = false;
    if (shot === 'coach') after(500, () => this.coachGo(0));
    if (shot === 'card') after(500, () => this.select(+(query.get('sys') || 0)));
    if (shot === 'list') after(500, () => this.openList());
    if (shot === 'formerr')
      after(900, () => {
        this.fSubmit({ preventDefault() {} });
        (document.activeElement as HTMLElement | null)?.blur?.();
      });
    if (shot === 'formsent') after(900, () => this.setState({ fstate: 'sent' }));
    after(shot === 'intro' ? 2600 : 3200, () => {
      try {
        let t = performance.now();
        for (let i = 0; i < SHOT_FRAMES; i++) {
          t += FRAME_MS;
          this.frame(t);
        }
      } catch (err) {
        console.warn(err);
      }
      window.__skyReady = true;
    });
  },

  componentWillUnmount(this: LifecycleCtx): void {
    this.aboutRO?.disconnect();
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.miniRaf);
    clearTimeout(this.introT);
    clearTimeout(this.eggT);
    this.ac?.close();
    if (this.onResize) removeEventListener('resize', this.onResize);
    if (this.onKey) removeEventListener('keydown', this.onKey);
  },

  componentDidUpdate(this: LifecycleCtx, prev: Record<string, unknown>): void {
    const next = this.props as Record<string, unknown>;
    const starfieldChanged = ['density', 'galaxies', 'constellations', 'milkyWay'].some(
      k => prev[k] !== next[k],
    );
    if (starfieldChanged) this.seed();
    if (prev['quality'] !== next['quality']) {
      this.setQ(qualityLevel((next['quality'] as Quality) ?? 'auto', 0.85));
      this.sizeCanvas();
    }
    this.syncRoute();
  },
};

/** After a language switch the page loads under a veil; it fades once fonts and a few frames are ready. */
function liftLanguageVeil(ctx: LifecycleCtx): void {
  try {
    sessionStorage.removeItem(LANG_SWITCH_KEY);
  } catch {
    /* storage blocked */
  }
  const root = document.documentElement;
  if (!root.hasAttribute('data-sk-veil')) root.setAttribute('data-sk-veil', '');
  const lift = () => {
    root.style.setProperty('--sk-veil', '0');
    setTimeout(
      () => {
        root.removeAttribute('data-sk-veil');
        root.style.removeProperty('--sk-veil');
      },
      ctx.reduced ? 0 : VEIL_FADE_MS,
    );
  };
  Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise(r => setTimeout(r, FONT_WAIT_MS)),
  ]).then(() => {
    let frames = 0;
    const tick = () => {
      if (++frames < SETTLE_FRAMES) requestAnimationFrame(tick);
      else setTimeout(lift, 80);
    };
    requestAnimationFrame(tick);
  });
}

/** Browsers only allow audio after a user gesture, so a saved "sound on" waits for the first input. */
function resumeAudioOnFirstInput(ctx: LifecycleCtx): void {
  let wantsAudio = false;
  try {
    wantsAudio = localStorage.getItem(AUDIO_KEY) === '1';
  } catch {
    /* storage blocked */
  }
  if (!wantsAudio) return;
  const onFirst = () => {
    removeEventListener('pointerdown', onFirst, true);
    removeEventListener('keydown', onFirst, true);
    if (!ctx.state.audio) ctx.toggleAudio();
  };
  ctx.onFirst = onFirst;
  addEventListener('pointerdown', onFirst, true);
  addEventListener('keydown', onFirst, true);
}

/** Deep link → that system or planet; unknown path → 404; otherwise the intro or the map with the tutorial. */
function openInitialView(ctx: LifecycleCtx): void {
  const route = ctx.parseRoute();
  if (route.bad) {
    ctx.setState({ lost: '/' + route.bad, live: STR.pageNotFound });
    return;
  }
  if (route.system >= 0) {
    ctx.openDirect(route.system, route.planet);
    return;
  }
  if (!ctx.wantIntro()) {
    setTimeout(() => ctx.startCoach(), COACH_DELAY);
    return;
  }
  ctx.revealAt = Infinity;
  ctx.setState({ intro: 'boot' });
  ctx.introT = setTimeout(
    () =>
      ctx.setState(st => (st.intro === 'boot' ? { intro: 'ready', live: STR.readyPressTheButton } : null)),
    ctx.reduced ? BOOT_REDUCED_MS : BOOT_MS,
  );
}
