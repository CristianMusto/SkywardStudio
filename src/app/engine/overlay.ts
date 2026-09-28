/**
 * Places the HTML layer over the canvas every frame: system labels and halos, route lines,
 * the hero text and the planets orbiting in the system view.
 */
import { SYS, TILT, clamp, rnd } from './data';
import type { EngineCtx } from './types';

/** Screen x, screen y and perspective scale of a projected point. */
type ScreenPoint = [number, number, number];
/** Projects a galaxy-space point; null when it is behind the camera. */
type Project = (x: number, y: number, z: number) => ScreenPoint | null;

/** Labels flip to the left side when closer than this to the right edge. */
const FLIP_MARGIN = 175;
/** Staggered fade-in of system labels after the intro. */
const LABEL_DELAY = 150;
const LABEL_STAGGER = 110;
const LABEL_FADE = 420;
const ROUTES_DELAY = 900;
const ROUTES_FADE = 700;
const REVEAL_END = 2600;
const HERO_DELAY = 150;
const HERO_FADE = 650;
const HERO_END = 900;
const HERO_RISE_PX = 12;
/** How often the hero and hint boxes are measured again (ms). */
const RECT_REFRESH = 400;
/** Planets grow out of the star over this time when entering a system (ms). */
const EMERGE_MS = 1300;
const TAU = Math.PI * 2;

/** Fields and elements of the engine that the overlay reads or writes. */
interface OverlayCtx extends EngineCtx {
  navEl?: HTMLElement | null;
  /** Idle and active route paths in the SVG layer. */
  pIdle?: SVGPathElement | null;
  pAct?: SVGPathElement | null;
  bhBtn?: HTMLElement | null;
  /** Black hole position and radius on screen, set by the scene. */
  bhScr?: { x: number; y: number; R: number } | null;
  /** One label wrapper and halo per system. */
  wraps: (HTMLElement | null)[];
  halos: (HTMLElement | null)[];
  hero?: HTMLElement | null;
  hint?: HTMLElement | null;
  /** Marker for the system the ship is at. */
  orig?: HTMLElement | null;
  /** Start of the label reveal: a timestamp, Infinity = hidden, null = done. */
  revealAt: number | null;
  heroAt: number | null;
  rc?: (DOMRect | null)[];
  rcT: number;

  /** System view layout: centre and orbit radii. */
  lay: { cx: number; cy: number; rx: number[] };
  orbSvg?: SVGElement | null;
  phalos: (HTMLElement | null)[];
  starEl?: HTMLElement | null;
  orb: (number | null)[];
  orb0: number | null;
}

/** Planet label with the side it is currently flipped to. */
type PlanetLabel = HTMLElement & { _fl?: boolean };

const px = (x: number, y: number) => `${x.toFixed(1)}px ${y.toFixed(1)}px`;
const easeOut = (t: number, power: number) => 1 - Math.pow(1 - t, power);

export const overlay = {
  /** Galaxy map pass. `P` projects points, `s` is the time in seconds, `mo` the motion level (0 = reduced). */
  place(this: OverlayCtx, P: Project, s: number, mo: number): void {
    if (this.state.phase !== 'map') return;
    const now = performance.now();
    const reveal = this.revealAt;
    const hiddenByEgg = this.egg ? 'hidden' : '';
    if (this.navEl) this.navEl.style.visibility = hiddenByEgg;
    const routesLayer = this.pIdle?.parentNode as SVGElement | null | undefined;
    if (routesLayer) routesLayer.style.visibility = hiddenByEgg;
    placeBlackHoleButton(this);

    const { sel, here } = this.state;
    const showRoutes = this.props['routes'] ?? true;
    const origin = P(...SYS[here].p);
    let idleD = '';
    let activeD = '';
    const screen: [number, number][] = [];
    this.scr = screen;

    SYS.forEach((system, i) => {
      const p = P(...system.p);
      const wrap = this.wraps[i];
      if (p) screen[i] = [p[0], p[1]];
      if (wrap) placeSystemLabel(this, wrap, p, !!system.home);
      if (wrap && reveal != null) {
        const t = reveal === Infinity ? 0 : clamp((now - reveal - LABEL_DELAY - i * LABEL_STAGGER) / LABEL_FADE, 0, 1);
        const opacity = t >= 1 ? '' : String(t);
        const [dot, label] = [wrap.firstElementChild, wrap.lastElementChild] as (HTMLElement | null)[];
        if (dot) dot.style.opacity = opacity;
        if (label) label.style.opacity = opacity;
      }
      const halo = this.halos[i];
      if (halo) {
        const pulse = 0.5 + 0.5 * Math.sin(s * 1.05 + i * 1.3);
        halo.style.opacity = (mo ? 0.35 + 0.5 * pulse : 0.6).toFixed(3);
        halo.style.transform = `scale(${(mo ? 1 + 0.35 * pulse : 1.1).toFixed(3)})`;
      }
      if (p && origin && i !== here) {
        const seg = `M${origin[0].toFixed(1)} ${origin[1].toFixed(1)} L${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
        if (i === sel) activeD += seg;
        else idleD += seg;
      }
    });

    if (this.pIdle) {
      this.pIdle.setAttribute('d', showRoutes ? idleD : '');
      if (mo) this.pIdle.style.strokeDashoffset = (-s * 4).toFixed(1);
      if (reveal != null) {
        const t = reveal === Infinity ? 0 : clamp((now - reveal - ROUTES_DELAY) / ROUTES_FADE, 0, 1);
        this.pIdle.style.opacity = String(t);
        if (reveal !== Infinity && now - reveal > REVEAL_END) {
          this.revealAt = null;
          this.pIdle.style.opacity = '';
        }
      }
    }
    if (this.pAct) {
      this.pAct.setAttribute('d', activeD);
      if (sel >= 0) this.pAct.setAttribute('stroke', SYS[sel].hex);
      if (mo) this.pAct.style.strokeDashoffset = (-s * 14).toFixed(1);
    }

    fadeInHero(this, now);
    dimCoveredText(this, now);

    if (this.orig) {
      if (origin) {
        this.orig.style.translate = px(origin[0], origin[1]);
        this.orig.style.visibility = 'visible';
      } else this.orig.style.visibility = 'hidden';
    }
  },

  /** System view pass: moves the planets along their orbits. `dt` in seconds. */
  placePlanets(this: OverlayCtx, dt: number, s: number, mo: number): void {
    const layout = this.lay;
    const { psel, phover } = this.state;
    const count = layout.rx.length;
    const emerge = this.emerge;
    let grow = 1;
    let fade = 1;
    let starGrow = 1;
    if (emerge) {
      const q = clamp((performance.now() - emerge.start) / EMERGE_MS, 0, 1);
      grow = easeOut(q, 3);
      starGrow = easeOut(clamp(q / 0.8, 0, 1), 2.4);
      fade = clamp((q - 0.12) / 0.5, 0, 1);
      if (q >= 1) this.emerge = null;
    }
    if (this.orbSvg) {
      this.orbSvg.style.transformOrigin = `${layout.cx}px ${layout.cy}px`;
      this.orbSvg.style.transform = grow < 1 ? `scale(${grow.toFixed(3)})` : '';
      this.orbSvg.style.opacity = fade < 1 ? fade.toFixed(3) : '';
    }
    // Orbits slow to a stop while a planet is selected or hovered.
    const targetSpeed = psel >= 0 || phover >= 0 ? 0 : 1;
    this.ospd += (targetSpeed - this.ospd) * (1 - Math.pow(0.02, dt));

    for (let i = 0; i < count; i++) {
      if (this.orb[i] == null) {
        this.orb0 ??= rnd() * TAU;
        this.orb[i] = this.orb0 + i * 2.4 + rnd() * 0.35;
      }
      const angularSpeed = mo ? (0.16 * Math.min(mo, 2)) / Math.pow(i + 1, 0.75) : 0;
      this.orb[i] = (this.orb[i] as number) + dt * this.ospd * angularSpeed;
      const angle = (this.orb[i] as number) + (1 - grow) * 2.4;
      const x = layout.cx + Math.cos(angle) * layout.rx[i] * grow;
      const y = layout.cy + Math.sin(angle) * layout.rx[i] * TILT * grow;
      /** 0 = far side of the orbit, 1 = near side. */
      const depth = (Math.sin(angle) + 1) / 2;

      const halo = this.phalos[i];
      if (halo) {
        const pulse = 0.5 + 0.5 * Math.sin(s * 1.05 + i * 1.7);
        halo.style.scale = (mo ? 1 + 0.3 * pulse : 1.1).toFixed(3);
      }
      const wrap = this.pwraps[i];
      if (!wrap) continue;
      const label = wrap.lastElementChild as PlanetLabel | null;
      if (label?.style) {
        const labelWidth = label.offsetWidth || 120;
        const flip = x + wrap.offsetWidth / 2 + 8 + labelWidth > innerWidth - 16;
        if (label._fl !== flip) {
          label._fl = flip;
          label.style.left = flip ? 'auto' : 'calc(100% + 8px)';
          label.style.right = flip ? 'calc(100% + 8px)' : 'auto';
          label.style.textAlign = flip ? 'right' : 'left';
        }
      }
      wrap.style.translate = px(x, y);
      wrap.style.scale = ((0.8 + 0.28 * depth) * (0.35 + 0.65 * grow)).toFixed(3);
      wrap.style.zIndex = Math.sin(angle) > 0 ? '3' : '1';
      wrap.style.opacity = ((0.7 + 0.3 * depth) * fade).toFixed(3);
    }

    if (this.starEl) {
      const breathe = mo ? 1 + 0.05 * Math.sin(s * 1.3) : 1;
      const entry = emerge ? 1 + (emerge.s0 - 1) * (1 - starGrow) : 1;
      this.starEl.style.scale = (breathe * entry).toFixed(3);
    }
  },
};

/** Keeps the invisible black-hole button over the black hole, at least 44px wide. */
function placeBlackHoleButton(ctx: OverlayCtx): void {
  const button = ctx.bhBtn;
  if (!button) return;
  const bh = ctx.bhScr;
  if (!bh || ctx.egg) {
    button.style.visibility = 'hidden';
    return;
  }
  const size = clamp(bh.R * 2.6, 44, 220);
  button.style.width = button.style.height = `${size}px`;
  button.style.translate = px(bh.x - size / 2, bh.y - size / 2);
  button.style.visibility = 'visible';
}

/** Moves a system label to its star; near the right edge the text goes to the left of the dot. */
function placeSystemLabel(ctx: OverlayCtx, wrap: HTMLElement, p: ScreenPoint | null, isHome: boolean): void {
  if (!p) {
    wrap.style.visibility = 'hidden';
    return;
  }
  const flip = p[0] > ctx.W - FLIP_MARGIN;
  wrap.style.translate = px(p[0], p[1]);
  wrap.style.visibility = 'visible';
  wrap.style.flexDirection = flip ? 'row-reverse' : 'row';
  wrap.style.transform = flip ? 'translate(calc(-100% + 22px),-22px)' : 'translate(-22px,-22px)';
  const text = wrap.lastElementChild as HTMLElement | null;
  if (!text?.style) return;
  text.style.textAlign = flip ? 'right' : 'left';
  // The Home star is drawn larger, so its label moves out past the star's radius.
  const radius = isHome ? clamp(24 * p[2], 7, 260) : 0;
  const offset = `${Math.max(0, radius - 8)}px`;
  text.style.marginLeft = flip ? '0px' : offset;
  text.style.marginRight = flip ? offset : '0px';
}

function fadeInHero(ctx: OverlayCtx, now: number): void {
  const hero = ctx.hero;
  const start = ctx.heroAt;
  if (!hero || start == null) return;
  const t = start === Infinity ? 0 : clamp((now - start - HERO_DELAY) / HERO_FADE, 0, 1);
  hero.style.animation = 'none';
  hero.style.opacity = String(t);
  hero.style.transform = `translateY(${((1 - t) * HERO_RISE_PX).toFixed(1)}px)`;
  if (start !== Infinity && now - start > HERO_END) {
    ctx.heroAt = null;
    hero.style.opacity = '';
    hero.style.transform = '';
  }
}

/** Dims the hero text and hides the hint when a system label passes over them. */
function dimCoveredText(ctx: OverlayCtx, now: number): void {
  if (!ctx.rc || now - ctx.rcT > RECT_REFRESH) {
    ctx.rcT = now;
    ctx.rc = [ctx.hero, ctx.hint].map(el => (el?.isConnected ? el.getBoundingClientRect() : null));
  }
  const screen = ctx.scr ?? [];
  const covered = (rect: DOMRect | null) =>
    !!rect &&
    screen.some(
      p => p && p[0] + 170 > rect.left && p[0] - 22 < rect.right && p[1] + 20 > rect.top && p[1] - 22 < rect.bottom,
    );
  const [heroRect, hintRect] = ctx.rc;
  const { sel, zoomed } = ctx.state;
  const approaching = !!ctx.approach && now - ctx.approach.start < ctx.approach.dur * 0.65;
  if (ctx.hero) {
    ctx.hero.style.opacity =
      ctx.egg || approaching ? '0' : sel >= 0 || zoomed || covered(heroRect) ? '.22' : '1';
  }
  if (ctx.hint) ctx.hint.style.opacity = covered(hintRect) ? '0' : '1';
}
