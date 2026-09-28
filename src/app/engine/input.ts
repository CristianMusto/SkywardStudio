/** Pointer, wheel, keyboard and zoom controls for the galaxy map and the system view. */
import { DMAX, DMIN, PL, SYS, STR, clamp } from './data';
import type { EngineCtx, Vec3 } from './types';

/** Radians of yaw per pixel dragged horizontally. */
const YAW_PER_PX = 0.0055;
/** Radians of pitch per pixel dragged vertically. */
const PITCH_PER_PX = 0.0045;
const PITCH_MIN = -0.6;
const PITCH_MAX = 1.45;
/** Pan limits in galaxy units. */
const PAN_RADIUS = 1500;
const PAN_HEIGHT = 600;
/** Drag distance (px) that completes the first tutorial step. */
const COACH_DRAG_PX = 140;
/** A pointer that moves less than this and lifts within TAP_MS counts as a tap. */
const TAP_PX = 5;
const TAP_MS = 500;
const WHEEL_ZOOM = 0.0013;
/** Zoom factor of the + / − buttons and keys. */
const ZOOM_STEP = 0.7;
/** Spin speed given by Q / E. */
const KEY_SPIN = 0.05;

const ARROWS = ['arrowright', 'arrowdown', 'arrowleft', 'arrowup'];

interface PointerDown {
  x: number;
  y: number;
  t: number;
}

interface Basis {
  r: Vec3;
  u: Vec3;
}

/** Fields and methods of the engine that the input module reads or writes. */
interface InputCtx extends EngineCtx {
  sky: HTMLElement;
  /** Active pointers by id, with their last position. */
  ptr: Map<number, { x: number; y: number }>;
  down: PointerDown | null;
  drag: boolean;
  /** Current spin velocity (yaw per frame). */
  vel: number;
  /** True while the drag pans instead of rotating (right button or Shift). */
  rot: boolean;
  /** Distance between two fingers at the last move, or null. */
  pinch: number | null;
  /** Focal length of the last frame. */
  F?: number;
  /** System whose hover card must stay hidden until the pointer leaves it. */
  noCard: number | null;
  /** Element that opened the screenshot viewer, focused again on close. */
  shotFrom?: HTMLElement | null;
  basis(): Basis;
  zoomBy(factor: number): void;
  zoomIn(): void;
  zoomOut(): void;
  clear(): void;
  recenter(): void;
  lostHome(): void;
  openMap(): void;
  openList(): void;
  land(): void;
}

const isArrow = (k: string) => ARROWS.includes(k);
/** +1 for right/down, −1 for left/up. */
const arrowDir = (k: string) => (k === 'arrowright' || k === 'arrowdown' ? 1 : -1);
/** Next index in a ring of `count`, starting from nothing when `current` is −1. */
const step = (current: number, dir: number, count: number) =>
  current < 0 ? (dir > 0 ? 0 : count - 1) : (current + dir + count) % count;

export const input = {
  pDown(this: InputCtx, e: PointerEvent): void {
    if (this.egg || this.state.intro || this.approach) return;
    this.down = { x: e.clientX, y: e.clientY, t: performance.now() };
    this.sky.setPointerCapture?.(e.pointerId);
    this.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.drag = true;
    this.vel = 0;
    this.rot = e.button === 2 || e.shiftKey;
    this.tgt.yaw = null;
    this.idle = performance.now();
    this.sky.style.cursor = 'grabbing';
    this.pinch = null;
  },

  pMove(this: InputCtx, e: PointerEvent): void {
    const last = this.ptr.get(e.pointerId);
    if (!last) return;
    if (this.ptr.size === 1) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (this.cs === 0) {
        this.cDrag = (this.cDrag ?? 0) + Math.abs(dx) + Math.abs(dy);
        if (this.cDrag > COACH_DRAG_PX) this.coachGo(1);
      }
      if (this.rot || e.shiftKey) panCamera(this, dx, dy);
      else rotateCamera(this, dx, dy);
    }
    last.x = e.clientX;
    last.y = e.clientY;
    if (this.ptr.size === 2) {
      const [a, b] = [...this.ptr.values()];
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch) {
        this.zoomBy(this.pinch / spread);
        this.coachAct(1);
      }
      this.pinch = spread;
    }
    this.idle = performance.now();
  },

  pUp(this: InputCtx, e: PointerEvent): void {
    const start = this.down;
    this.down = null;
    const isTap =
      !!start &&
      e.type === 'pointerup' &&
      Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_PX &&
      performance.now() - start.t < TAP_MS;
    // A tap on empty space closes the card or the hover preview.
    if (isTap && this.state.phase === 'map') {
      if (this.state.sel >= 0) this.clear();
      else if (this.state.hover >= 0) this.setState({ hover: -1 });
    }
    this.ptr.delete(e.pointerId);
    if (!this.ptr.size) {
      this.drag = false;
      this.sky.style.cursor = 'grab';
    }
    this.pinch = null;
    this.idle = performance.now();
  },

  wheel(this: InputCtx, e: WheelEvent): void {
    e.preventDefault();
    if (this.egg || this.state.intro || this.approach) return;
    this.coachAct(1);
    this.zoomBy(Math.exp(e.deltaY * WHEEL_ZOOM));
    this.idle = performance.now();
  },

  zoomBy(this: InputCtx, factor: number): void {
    this.tgt.dist = clamp(this.tgt.dist * factor, DMIN, DMAX);
  },

  zoomIn(this: InputCtx): void {
    this.zoomBy(ZOOM_STEP);
    this.idle = performance.now();
  },

  zoomOut(this: InputCtx): void {
    this.zoomBy(1 / ZOOM_STEP);
    this.idle = performance.now();
  },

  /** Deselects, flies back to the overview and returns focus to the system's button. */
  clear(this: InputCtx): void {
    const { hover, sel } = this.state;
    const system = hover >= 0 ? hover : sel;
    this.fly(-1);
    this.cardHot = false;
    clearTimeout(this.hvT);
    this.noCard = system;
    this.setState({ sel: -1, hover: -1, list: false });
    const button = system >= 0 ? this.btns[system] : null;
    if (!button) return;
    button.focus({ preventScroll: true });
    const release = () => {
      this.noCard = null;
      button.removeEventListener('blur', release);
      button.removeEventListener('pointerleave', release);
    };
    button.addEventListener('blur', release);
    button.addEventListener('pointerleave', release);
  },

  recenter(this: InputCtx): void {
    this.fly(-1);
    this.setState({ sel: -1, live: STR.mapRecentered });
  },

  key(this: InputCtx, e: KeyboardEvent): void {
    // A modal dialog (e.g. keyboard shortcuts) handles its own keys, Esc included.
    if (document.querySelector('dialog[open]')) return;
    if (this.state['shot']) {
      if (e.key === 'Escape') closeShot(this, e);
      return;
    }
    if (this.state.lost) {
      if (e.key === 'Escape') this.lostHome();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName ?? '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (this.state.intro) return;

    const k = e.key.toLowerCase();
    switch (this.state.phase) {
      case 'page':
        return pageKeys(this, e, k);
      case 'arrive':
        return systemKeys(this, e, k, target);
      case 'map':
        return mapKeys(this, e, k);
    }
  },
};

function rotateCamera(ctx: InputCtx, dx: number, dy: number): void {
  ctx.cam.yaw -= dx * YAW_PER_PX;
  ctx.vel = -dx * YAW_PER_PX;
  ctx.cam.pitch = ctx.tgt.pitch = clamp(ctx.cam.pitch + dy * PITCH_PER_PX, PITCH_MIN, PITCH_MAX);
}

/** Moves the look-at point along the screen axes, kept inside a cylinder around the galaxy. */
function panCamera(ctx: InputCtx, dx: number, dy: number): void {
  const { r, u } = ctx.basis();
  const unitsPerPx = ctx.cam.dist / (ctx.F || 800);
  const T = ctx.cam.T;
  for (let axis = 0; axis < 3; axis++) T[axis] += (-r[axis] * dx + u[axis] * dy) * unitsPerPx;
  const radius = Math.hypot(T[0], T[2]);
  if (radius > PAN_RADIUS) {
    T[0] *= PAN_RADIUS / radius;
    T[2] *= PAN_RADIUS / radius;
  }
  T[1] = clamp(T[1], -PAN_HEIGHT, PAN_HEIGHT);
  ctx.tgt.T = [T[0], T[1], T[2]];
}

function closeShot(ctx: InputCtx, e: KeyboardEvent): void {
  e.preventDefault();
  ctx.setState({ shot: null });
  const opener = ctx.shotFrom;
  if (opener) setTimeout(() => opener.focus({ preventScroll: true }), 30);
}

/** Planet page: Esc / M closes, ← → move between planets (skipping empty orbits). */
function pageKeys(ctx: InputCtx, e: KeyboardEvent, k: string): void {
  const { sel, psel } = ctx.state;
  const planets = PL[SYS[sel].id] ?? [];
  if (k === 'escape' || k === 'm') {
    e.preventDefault();
    ctx.closePage();
    return;
  }
  if (k === 'arrowleft' && psel > 0 && !planets[psel - 1].ghost) {
    ctx.goPlanet(psel - 1);
    return;
  }
  if (k === 'arrowright') {
    const next = planets[psel + 1];
    if (next && !next.ghost) ctx.goPlanet(psel + 1);
  }
}

/** System view: arrows pick a planet, Enter lands, Esc steps back, M returns to the map. */
function systemKeys(ctx: InputCtx, e: KeyboardEvent, k: string, target: HTMLElement | null): void {
  const { sel, psel } = ctx.state;
  const planets = PL[SYS[sel].id] ?? [];
  if (k === 'escape') {
    e.preventDefault();
    if (psel >= 0) ctx.setState({ psel: -1, landMsg: '' });
    else ctx.back();
    return;
  }
  if (k === 'm') {
    e.preventDefault();
    ctx.back();
    return;
  }
  if (isArrow(k) && planets.length) {
    e.preventDefault();
    ctx.setState({ psel: step(psel, arrowDir(k), planets.length), landMsg: '' });
    return;
  }
  // Enter lands only when focus is not on a button (buttons handle Enter themselves).
  const onButton = !!target && target !== document.body && !!target.closest?.('button');
  if (k === 'enter' && psel >= 0 && !onButton) {
    e.preventDefault();
    ctx.land();
  }
}

/** Galaxy map: M / L / Esc switch views, + − zoom, Q E spin, R / 0 recenter, arrows cycle systems. */
function mapKeys(ctx: InputCtx, e: KeyboardEvent, k: string): void {
  const { list, sel } = ctx.state;
  if (k === 'm') {
    e.preventDefault();
    if (list) ctx.openMap();
    else if (sel >= 0) ctx.clear();
    return;
  }
  if (k === 'l') {
    e.preventDefault();
    if (!list) ctx.openList();
    return;
  }
  if (k === 'escape') {
    if ((ctx.cs ?? -1) >= 0) ctx.coachDone();
    else if (list) ctx.openMap();
    else if (sel >= 0) ctx.clear();
    return;
  }
  if (list) return;
  switch (k) {
    case '+':
    case '=':
      return ctx.zoomIn();
    case '-':
    case '_':
      return ctx.zoomOut();
    case 'q':
    case 'e':
      ctx.vel = k === 'q' ? -KEY_SPIN : KEY_SPIN;
      ctx.idle = performance.now();
      return;
    case 'r':
    case '0':
      return ctx.recenter();
  }
  if (isArrow(k)) {
    e.preventDefault();
    const next = step(sel, arrowDir(k), SYS.length);
    ctx.select(next);
    ctx.btns[next]?.focus();
    return;
  }
  if (k === 'enter' && sel >= 0 && document.activeElement === ctx.btns[sel]) {
    e.preventDefault();
    ctx.jump();
  }
}
