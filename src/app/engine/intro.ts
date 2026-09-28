/**
 * Intro screen: the launch button (tap, or hold until the ring fills), the warp into the
 * galaxy and the camera approach that follows.
 */
import { DHOME, STR, clamp } from './data';
import type { EngineCtx } from './types';

const SEEN_KEY = 'skyward.introSeen';
/** Camera approach after the warp (ms). */
const APPROACH_MS = 4200;
const APPROACH_FROM_DIST = 9000;
const FADE_IN_MS = 800;
const WARP_MS = 2100;
/** A press shorter than this launches like a click. */
const TAP_MS = 300;
/** The ring starts filling after HOLD_DELAY and is full after HOLD_MS more. */
const HOLD_DELAY = 150;
const HOLD_MS = 1200;
/** Circumference of the progress ring (its stroke-dasharray). */
const RING_LENGTH = 276.5;
/** Delay before the tutorial appears once the map is visible. */
const COACH_DELAY = 900;

type IntroPhase = 'boot' | 'ready' | 'warp' | null;

/** Fields and methods of the engine that the intro reads or writes. */
interface IntroCtx extends EngineCtx {
  introRing?: SVGCircleElement | null;
  /** Press in progress on the launch button. */
  ihold: { start: number } | null;
  /** Set by pointer up/cancel so the click that follows is ignored. */
  ipHandled?: boolean;
  introT?: ReturnType<typeof setTimeout>;
  heroAt: number | null;
  revealAt: number | null;
  fadeIn?: { start: number; dur: number; a0: number };
  markIntro(): void;
  launch(): void;
}

const resetRing = (ctx: IntroCtx) => ctx.introRing?.setAttribute('stroke-dashoffset', String(RING_LENGTH));

export const intro = {
  /** Screenshot mode, language switches and return links skip the intro; otherwise the `intro` prop decides. */
  wantIntro(this: IntroCtx): boolean {
    if (this.shot) return this.shot === 'intro';
    if (this.langIn) return false;
    if (/[?&]return=1/.test(location.search)) return false;
    const mode = this.props['intro'] ?? 'always';
    if (mode === 'never') return false;
    if (mode === 'always') return true;
    try {
      return localStorage.getItem(SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  },

  markIntro(this: IntroCtx): void {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage blocked */
    }
    clearTimeout(this.introT);
  },

  launch(this: IntroCtx): void {
    const phase = this.state.intro as IntroPhase;
    if (phase !== 'ready' && phase !== 'boot') return;
    this.heroAt = Infinity;
    this.markIntro();
    this.ihold = null;
    this.revealAt = Infinity;

    const arrive = () => {
      const now = performance.now();
      const approachMs = this.reduced ? 0 : APPROACH_MS;
      if (!this.reduced) {
        this.approach = {
          start: now,
          dur: approachMs,
          d0: APPROACH_FROM_DIST,
          d1: DHOME,
          y0: 0.7 - 1.35,
          y1: 0.7,
          p0: 0.95,
          p1: 0.52,
        };
        this.cam.T = [0, 0, 0];
        this.tgt.T = [0, 0, 0];
        this.tgt.yaw = null;
        this.fadeIn = { start: now, dur: FADE_IN_MS, a0: 0.45 };
        this.idle = now + approachMs + FADE_IN_MS;
      }
      // Labels start appearing near the end of the approach, the hero text right after it.
      this.revealAt = now + approachMs * 0.72;
      this.heroAt = now + approachMs;
      this.setState({ intro: null, live: STR.galaxyMapYouAre });
      setTimeout(() => this.startCoach(), approachMs + COACH_DELAY);
    };

    if (this.reduced) {
      arrive();
      return;
    }
    this.sfx('jump', 2);
    this.setState({ intro: 'warp' });
    for (const particle of this.warpP) Object.assign(particle, this.spawn(true));

    // The warp starts from the centre of the launch button.
    let startX = this.W / 2;
    let startY = this.H * 0.6;
    const box = this.introRing?.ownerSVGElement?.getBoundingClientRect();
    if (box?.width) {
      startX = box.left + box.width / 2;
      startY = box.top + box.height / 2;
    }
    this.warp = {
      start: performance.now(),
      dur: WARP_MS,
      handoff: 0.62,
      sx: startX,
      sy: startY,
      end: [this.W / 2, this.H * 0.4],
      tint: '255,210,160',
      name: 'Skyward',
      ly: 4.6,
      dir: 1,
      snap: null,
      land: arrive,
    };
  },

  skipIntro(this: IntroCtx): void {
    this.markIntro();
    this.warp = null;
    this.ihold = null;
    this.revealAt = performance.now();
    this.setState({ intro: null });
    setTimeout(() => this.startCoach(), COACH_DELAY);
  },

  introDown(this: IntroCtx, e: PointerEvent): void {
    if (e.button !== undefined && e.button !== 0) return;
    this.ihold = { start: performance.now() };
  },

  introUp(this: IntroCtx): void {
    const hold = this.ihold;
    if (!hold) return;
    this.ihold = null;
    this.ipHandled = true;
    resetRing(this);
    if (performance.now() - hold.start < TAP_MS) this.launch();
  },

  introCancel(this: IntroCtx): void {
    if (!this.ihold) return;
    this.ihold = null;
    this.ipHandled = true;
    resetRing(this);
  },

  /** Keyboard activation (pointer presses are handled by introDown/introUp). */
  introClick(this: IntroCtx): void {
    if (this.ipHandled) {
      this.ipHandled = false;
      return;
    }
    this.launch();
  },

  /** Called every frame: fills the ring while the button is held and launches when full. */
  updIntroHold(this: IntroCtx, t: number): void {
    const hold = this.ihold;
    if (!hold || !this.introRing) return;
    const progress = clamp((t - hold.start - HOLD_DELAY) / HOLD_MS, 0, 1);
    this.introRing.setAttribute('stroke-dashoffset', (RING_LENGTH * (1 - progress)).toFixed(1));
    if (progress >= 1) {
      this.ihold = null;
      this.launch();
    }
  },
};
