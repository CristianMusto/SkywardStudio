/**
 * The two live demos in the Skyward case study: a small rotatable galaxy (leg 04) and a
 * replay of the jump between systems (leg 05). Both share one animation loop that pauses
 * while the canvases are off screen.
 */
import { HOME, RG, SYS, STR, clamp, gauss, pickT, rnd } from './data';
import type { EngineCtx, Vec3 } from './types';

type MiniKind = 'gal' | 'jump';
type ScreenPoint = [number, number, number];

const TAU = 6.283;
const MINI_STARS = 1500;
const JUMP_PARTICLES = 560;
/** Auto-rotation starts after this much idle time (ms). */
const AUTO_SPIN_AFTER = 1500;
/** Tap radius for picking a system in the mini galaxy (px). */
const PICK_RADIUS = 36;
const TAP_PX = 5;
const JUMP_MS = 2200;
/** How long the arrived star stays before the demo resets (ms). */
const HOLD_AFTER_MS = 1500;

interface MiniStar {
  x: number;
  y: number;
  z: number;
  a: number;
  r: number;
  /** "r,g,b" */
  c: string;
}

/** A warp particle (see `spawn` in the scene). */
interface WarpParticle {
  x: number;
  y: number;
  z: number;
  b: number;
  c: string;
}

interface MiniDrag {
  x: number;
  y: number;
  x0: number;
  y0: number;
}

interface MiniRun {
  start: number;
  dur: number;
  tint: string;
  name: string;
}

/** State of one demo canvas. */
interface Mini {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** False while off screen. */
  vis: boolean;
  yaw: number;
  pitch: number;
  drag: MiniDrag | null;
  idle: number;
  parts: WarpParticle[] | null;
  run: MiniRun | null;
  io?: IntersectionObserver;
  last?: number;
  W?: number;
  H?: number;
  /** Device pixel ratio used for the backing store. */
  d?: number;
  /** Screen position of each system in the last frame. */
  scr?: (ScreenPoint | null)[];
}

interface CaseDemoCtx extends EngineCtx {
  minis?: Partial<Record<MiniKind, Mini>>;
  miniRaf: number;
  mStars?: MiniStar[];
  sprite(tint: string, soft: boolean): CanvasImageSource;
  miniLoop(t: number): void;
  miniSeed(): void;
  fitMini(m: Mini): void;
  drawMiniGal(m: Mini, t: number, dt: number): void;
  drawMiniJump(m: Mini, t: number, dt: number): void;
}

const smoothstep = (q: number) => q * q * (3 - 2 * q);

export const caseDemos = {
  /** Registers a demo canvas (called from a template ref). Safe to call again with the same element. */
  attachMini(this: CaseDemoCtx, kind: MiniKind, el: HTMLCanvasElement | null): void {
    if (!el) return;
    this.minis ??= {};
    if (this.minis[kind]?.cv === el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const mini: Mini = {
      cv: el,
      ctx,
      vis: true,
      yaw: 0.7,
      pitch: 0.5,
      drag: null,
      idle: 0,
      parts:
        kind === 'jump'
          ? Array.from({ length: JUMP_PARTICLES }, () => this.spawn(true) as WarpParticle)
          : null,
      run: null,
    };
    if (typeof IntersectionObserver !== 'undefined') {
      mini.io = new IntersectionObserver(entries => {
        mini.vis = entries[0].isIntersecting;
      });
      mini.io.observe(el);
    }
    if (kind === 'gal') {
      this.miniSeed();
      bindGalaxyDrag(this, mini);
    }
    this.minis[kind] = mini;
    if (!this.miniRaf) this.miniRaf = requestAnimationFrame(this.miniLoop);
  },

  miniLoop(this: CaseDemoCtx, t: number): void {
    const minis = this.minis ?? {};
    let running = false;
    for (const kind of Object.keys(minis) as MiniKind[]) {
      const mini = minis[kind];
      if (!mini) continue;
      if (!mini.cv.isConnected) {
        mini.io?.disconnect();
        delete minis[kind];
        continue;
      }
      running = true;
      const dt = Math.min(0.05, (t - (mini.last || t)) / 1000);
      mini.last = t;
      if (!mini.vis || document.hidden) continue;
      this.fitMini(mini);
      if (kind === 'gal') this.drawMiniGal(mini, t, dt);
      else this.drawMiniJump(mini, t, dt);
    }
    this.miniRaf = running ? requestAnimationFrame(this.miniLoop) : 0;
  },

  /** Matches the backing store to the CSS size (capped at 2× DPR). */
  fitMini(this: CaseDemoCtx, m: Mini): void {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = m.cv.clientWidth;
    const h = m.cv.clientHeight;
    if (m.cv.width !== Math.round(w * dpr) || m.cv.height !== Math.round(h * dpr)) {
      m.cv.width = Math.round(w * dpr);
      m.cv.height = Math.round(h * dpr);
    }
    m.W = w;
    m.H = h;
    m.d = dpr;
  },

  /** A lighter three-arm galaxy for the demo, generated once. */
  miniSeed(this: CaseDemoCtx): void {
    if (this.mStars) return;
    const stars: MiniStar[] = [];
    for (let i = 0; i < MINI_STARS; i++) {
      const radius = RG * Math.pow(rnd(), 0.72);
      const arm = i % 3;
      const angle = arm * 2.094 + radius * 0.0046 + gauss() * 0.26 * (1 + radius / RG);
      stars.push({
        x: Math.cos(angle) * radius + gauss() * 26,
        y: gauss() * (38 * (1 - radius / RG) + 9),
        z: Math.sin(angle) * radius + gauss() * 26,
        a: 0.25 + rnd() * 0.6,
        r: rnd() < 0.06 ? 1.6 : 0.9,
        c: pickT(),
      });
    }
    this.mStars = stars;
  },

  drawMiniGal(this: CaseDemoCtx, m: Mini, t: number, dt: number): void {
    const c = m.ctx;
    const W = m.W ?? 0;
    const H = m.H ?? 0;
    c.setTransform(m.d ?? 1, 0, 0, m.d ?? 1, 0, 0);
    if (!m.drag && !this.reduced && t - m.idle > AUTO_SPIN_AFTER) m.yaw += dt * 0.12;
    const P = orbitProjector(m.yaw, m.pitch, W, H);

    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#07060F';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const core = P(0, 0, 0);
    if (core) {
      const size = 760 * core[2];
      c.globalAlpha = 0.4;
      c.drawImage(this.sprite('255,210,160', true), core[0] - size / 2, core[1] - size / 2, size, size);
    }
    for (const star of this.mStars ?? []) {
      const p = P(star.x, star.y, star.z);
      if (!p || p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H) continue;
      c.globalAlpha = star.a;
      c.fillStyle = `rgb(${star.c})`;
      c.fillRect(p[0], p[1], star.r, star.r);
    }

    const sel = this.state['miniSel'] as number;
    const screen = SYS.map(s => P(...s.p));
    m.scr = screen;
    drawMiniRoutes(c, screen, sel, t);
    SYS.forEach((system, i) => {
      const p = screen[i];
      if (!p) return;
      const on = i === sel;
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.9;
      const glow = on ? 50 : 32;
      c.drawImage(this.sprite(system.tint, true), p[0] - glow / 2, p[1] - glow / 2, glow, glow);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      c.fillStyle = system.hex;
      c.beginPath();
      c.arc(p[0], p[1], on ? 4.5 : 3.5, 0, TAU);
      c.fill();
      if (on) {
        c.strokeStyle = system.hex;
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(p[0], p[1], 13, 0, TAU);
        c.stroke();
      }
      c.fillStyle = '#F2EEE6';
      c.font = '600 13px "Bricolage Grotesque", sans-serif';
      c.shadowColor = '#07060F';
      c.shadowBlur = 6;
      c.fillText(system.name, p[0] + 15, p[1] + 4);
      c.shadowBlur = 0;
    });
  },

  drawMiniJump(this: CaseDemoCtx, m: Mini, t: number, dt: number): void {
    const c = m.ctx;
    const W = m.W ?? 0;
    const H = m.H ?? 0;
    c.setTransform(m.d ?? 1, 0, 0, m.d ?? 1, 0, 0);
    const run = m.run;
    let speed = 0.03;
    let k = 0;
    if (run) {
      const elapsed = t - run.start;
      k = elapsed / run.dur;
      speed = jumpSpeed(k);
      if (elapsed > run.dur + HOLD_AFTER_MS) {
        m.run = null;
        this.setState({ jumpBusy: false });
      }
    }

    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#05040C';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    const focal = Math.max(W, H) * 0.16;
    const cx = W / 2;
    const cy = H / 2;
    const velocity = speed * 2.1;
    const dim = run && k > 1 ? 0.35 : 1;
    for (const p of m.parts ?? []) {
      p.z -= velocity * dt;
      if (p.z <= 0.025) {
        Object.assign(p, this.spawn(false));
        continue;
      }
      // Each star is a streak from its current depth to a slightly deeper one.
      const tailZ = Math.min(1.25, p.z + velocity * 0.045 + 0.0015);
      const x1 = cx + (p.x / p.z) * focal;
      const y1 = cy + (p.y / p.z) * focal;
      const x2 = cx + (p.x / tailZ) * focal;
      const y2 = cy + (p.y / tailZ) * focal;
      if ((x1 < 0 && x2 < 0) || (x1 > W && x2 > W) || (y1 < 0 && y2 < 0) || (y1 > H && y2 > H)) continue;
      const near = 1 - p.z;
      const alpha = Math.min(1, p.b * (0.12 + near * near * 1.3)) * dim;
      const width = Math.max(0.5, Math.min(2.4, 0.35 + near * near * 2.2));
      if (Math.abs(x1 - x2) + Math.abs(y1 - y2) < 1.5) {
        c.globalAlpha = alpha;
        c.fillStyle = `rgb(${p.c})`;
        c.fillRect(x1, y1, width, width);
      } else {
        const streak = c.createLinearGradient(x2, y2, x1, y1);
        streak.addColorStop(0, `rgba(${p.c},0)`);
        streak.addColorStop(1, `rgba(${p.c},${alpha})`);
        c.globalAlpha = 1;
        c.strokeStyle = streak;
        c.lineWidth = width;
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x1, y1);
        c.stroke();
      }
    }

    c.textAlign = 'center';
    if (run) {
      drawArrivalStar(this, c, run, k, W, H);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = clamp(k / 0.12, 0, 1) * arrivalFade(k, run.dur);
      c.fillStyle = '#F2EEE6';
      c.font = '500 13px "Martian Mono", monospace';
      c.fillText((k < 1 ? STR.jump : STR.arrival) + run.name.toUpperCase(), W / 2, H - 26);
    } else {
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 0.9;
      c.fillStyle = '#A9A3C2';
      c.font = '400 12px "Martian Mono", monospace';
      c.fillText(STR.awaitingRoute, W / 2, H - 26);
    }
    c.textAlign = 'start';
    c.globalAlpha = 1;
  },

  jumpDemo(this: CaseDemoCtx): void {
    const mini = this.minis?.jump;
    if (!mini || mini.run) return;
    const system = SYS[this.state['miniSel'] as number];
    for (const particle of mini.parts ?? []) Object.assign(particle, this.spawn(true));
    mini.run = { start: performance.now(), dur: this.reduced ? 1 : JUMP_MS, tint: system.tint, name: system.name };
    this.setState({ jumpBusy: true, live: STR.demoJumpTo + system.name + '.' });
    this.sfx('jump', 2.2);
  },
};

/** Drag rotates the mini galaxy; a tap selects the nearest system. */
function bindGalaxyDrag(ctx: CaseDemoCtx, mini: Mini): void {
  const el = mini.cv;
  el.addEventListener('pointerdown', e => {
    el.setPointerCapture?.(e.pointerId);
    mini.drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('pointermove', e => {
    const drag = mini.drag;
    if (!drag) return;
    mini.yaw -= (e.clientX - drag.x) * 0.006;
    mini.pitch = clamp(mini.pitch + (e.clientY - drag.y) * 0.005, 0.05, 1.4);
    drag.x = e.clientX;
    drag.y = e.clientY;
    mini.idle = performance.now();
  });
  el.addEventListener('pointerup', e => {
    const drag = mini.drag;
    mini.drag = null;
    el.style.cursor = 'grab';
    if (!drag || !mini.scr || Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) >= TAP_PX) return;
    const box = el.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    let best = -1;
    let bestDist = PICK_RADIUS;
    mini.scr.forEach((p, i) => {
      if (!p) return;
      const d = Math.hypot(p[0] - px, p[1] - py);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (best >= 0) {
      ctx.setState({ miniSel: best });
      ctx.sfx('blip');
    }
  });
  el.addEventListener('pointercancel', () => {
    mini.drag = null;
  });
}

/** Perspective projection for a camera orbiting the origin at a fixed distance. */
function orbitProjector(yaw: number, pitch: number, W: number, H: number) {
  const dist = 2500;
  const cp = Math.cos(pitch);
  const eye: Vec3 = [dist * cp * Math.sin(yaw), dist * Math.sin(pitch), dist * cp * Math.cos(yaw)];
  const len = Math.hypot(...eye);
  const fw = eye.map(v => -v / len) as Vec3;
  const rawRight: Vec3 = [-fw[2], 0, fw[0]];
  const rightLen = Math.hypot(...rawRight) || 1;
  const right = rawRight.map(v => v / rightLen) as Vec3;
  const up: Vec3 = [
    right[1] * fw[2] - right[2] * fw[1],
    right[2] * fw[0] - right[0] * fw[2],
    right[0] * fw[1] - right[1] * fw[0],
  ];
  const focal = Math.min(W, H) * 1.35;
  const cx = W / 2;
  const cy = H / 2;
  return (x: number, y: number, z: number): ScreenPoint | null => {
    const dx = x - eye[0];
    const dy = y - eye[1];
    const dz = z - eye[2];
    const depth = dx * fw[0] + dy * fw[1] + dz * fw[2];
    if (depth < 4) return null;
    const scale = focal / depth;
    return [
      cx + (dx * right[0] + dy * right[1] + dz * right[2]) * scale,
      cy - (dx * up[0] + dy * up[1] + dz * up[2]) * scale,
      scale,
    ];
  };
}

/** Dotted routes from Home to every system, with the selected one animated in its colour. */
function drawMiniRoutes(c: CanvasRenderingContext2D, screen: (ScreenPoint | null)[], sel: number, t: number): void {
  const home = screen[HOME];
  c.globalCompositeOperation = 'source-over';
  if (!home) return;
  c.globalAlpha = 1;
  c.strokeStyle = 'rgba(169,163,194,.45)';
  c.setLineDash([2, 6]);
  c.lineWidth = 1;
  c.beginPath();
  screen.forEach((p, i) => {
    if (p && i !== HOME) {
      c.moveTo(home[0], home[1]);
      c.lineTo(p[0], p[1]);
    }
  });
  c.stroke();
  const target = screen[sel];
  if (target && sel !== HOME) {
    c.strokeStyle = SYS[sel].hex;
    c.setLineDash([6, 6]);
    c.lineDashOffset = -t / 60;
    c.lineWidth = 1.25;
    c.beginPath();
    c.moveTo(home[0], home[1]);
    c.lineTo(target[0], target[1]);
    c.stroke();
  }
  c.setLineDash([]);
}

/** Warp speed by progress: ease in to full speed, cruise, ease out. */
function jumpSpeed(k: number): number {
  if (k < 0.28) {
    const q = k / 0.28;
    return 0.03 + q * q * q * 0.97;
  }
  if (k < 0.66) return 1;
  if (k < 1) {
    const q = (k - 0.66) / 0.34;
    return Math.pow(1 - q, 2.4) * 0.97 + 0.03;
  }
  return 0.03;
}

/** 1 until 70% of the hold after arrival, then fades to 0. */
function arrivalFade(k: number, dur: number): number {
  const out = k > 1 ? clamp(((k - 1) * dur) / HOLD_AFTER_MS, 0, 1) : 0;
  return out > 0.7 ? 1 - (out - 0.7) / 0.3 : 1;
}

/** The destination star grows in the centre during the last part of the jump. */
function drawArrivalStar(ctx: CaseDemoCtx, c: CanvasRenderingContext2D, run: MiniRun, k: number, W: number, H: number): void {
  const cx = W / 2;
  const cy = H / 2;
  const grow = smoothstep(clamp((k - 0.6) / 0.4, 0, 1));
  const size = 6 + grow * Math.min(W, H) * 0.3;
  c.globalAlpha = (0.25 + 0.75 * grow) * arrivalFade(k, run.dur);
  const glow = size * 2.4;
  c.drawImage(ctx.sprite(run.tint, true), cx - glow / 2, cy - glow / 2, glow, glow);
  const body = c.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  body.addColorStop(0, 'rgba(255,255,255,1)');
  body.addColorStop(0.26, `rgba(${run.tint},1)`);
  body.addColorStop(0.5, `rgba(${run.tint},.35)`);
  body.addColorStop(1, `rgba(${run.tint},0)`);
  c.fillStyle = body;
  c.beginPath();
  c.arc(cx, cy, size / 2, 0, TAU);
  c.fill();
}
