/**
 * The galaxy scene: canvas sizing, sprite cache, procedural starfield (seeded, so every
 * visitor sees the same sky), the camera, the per-frame render and the warp tunnel.
 */
import { HOME, NEB, RG, SYS, STR, clamp, gauss, pickT, rnd } from './data';
import type { EngineCtx, Vec3, Warp } from './types';

const TAU = 6.283;
const TWO_PI = 6.28;
/** Hex colours for the bright star-forming spots. */
const HOT_COLORS = ['127,230,242', '255,210,122', '255,122,107', '140,240,160', '195,166,255', '255,160,220'];
const CORE_TINT = '255,210,160';
const BULGE_TINTS = ['255,222,176', '255,236,194'];
const YOUNG_TINT = '196,214,255';
const OLD_TINT = '255,226,180';
const YOUNG_GLOW = '150,180,255';
const OLD_GLOW = '255,200,150';
const ARMS = 3;
/** The system page is static, so it redraws at ~15 fps. */
const PAGE_FRAME_MS = 66;
const EGG_MS = 2800;
const MOBILE = 760;
/** Map shifts left to make room for the system card (desktop only). */
const CARD_SHIFT = -190;
/** Hold-to-jump on a system: delay before the ring starts, and fill time. */
const HOLD_DELAY = 180;
const HOLD_MS = 850;
const HOLD_REDUCED_MS = 500;
const HOLD_RING = 169.6;
const WARP_TAIL_MS = 1100;

/** Screen x, screen y, perspective scale, camera depth. */
type Projected = [number, number, number, number];
type Project = (x: number, y: number, z: number) => Projected | null;

interface Star {
  x: number;
  y: number;
  z: number;
  /** Magnitude (size). */
  m: number;
  a: number;
  c: string;
  /** Twinkle period (s) and phase. */
  p: number;
  ph: number;
}
interface ClusterStar {
  o: Vec3;
  m: number;
  a: number;
  c: string;
  p: number;
  ph: number;
}
type SwarmStar = Omit<ClusterStar, 'c'>;
interface Cluster {
  c: Vec3;
  st: ClusterStar[];
  glow: string;
  /** Glow size. */
  gs: number;
}
interface Nebula {
  p: Vec3;
  s: number;
  a: number;
  c: string;
}
/** A distant galaxy: centre, radius, tilt angles, distance. */
interface Region {
  c: Vec3;
  Rr: number;
  a: number;
  b: number;
  D: number;
}
interface HotSpot {
  p: Vec3;
  c: string;
  sc: number;
}
/** Points on the sky sphere (direction only, drawn at infinity). */
interface Haze {
  d: Vec3;
  s: number;
  a: number;
  c: string;
}
interface SkyStar {
  d: Vec3;
  a: number;
  r: number;
}
interface WarpParticle {
  x: number;
  y: number;
  z: number;
  c: string;
  b: number;
  /** Turns blue-white at high speed. */
  hot: boolean;
}
interface WarpNebula {
  x: number;
  y: number;
  z: number;
  s: number;
  c: string;
  /** Uses the destination tint instead of its own colour. */
  t: boolean;
}
/** The warp streaks that keep fading after the intro hands over to the map. */
interface WarpTail {
  start: number;
  dur: number;
  V0: number;
  cx: number;
  cy: number;
  dir: number;
}
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  life: number;
}
interface Basis {
  /** Camera position, forward, right and up vectors. */
  C: Vec3;
  fw: Vec3;
  r: Vec3;
  u: Vec3;
}

interface SceneCtx extends EngineCtx {
  q?: number;
  dpr: number;
  ctx: CanvasRenderingContext2D | null;
  sprites: Record<string, HTMLCanvasElement>;
  regions: Region[];
  hot: HotSpot[];
  buckets: [string, Star[]][];
  haze: Haze[];
  skyb: SkyStar[];
  clusters: Cluster[];
  nebs: Nebula[];
  swarms: SwarmStar[][];
  bh: {
    p: Vec3;
    R: number;
    tilt: number;
    k: number;
    parts: { r: number; a: number; w: number; s: number; b: number }[];
  };
  bhScr: { x: number; y: number; R: number } | null;
  warpP: WarpParticle[];
  warpNeb: WarpNebula[];
  wtail: WarpTail | null;
  aboutRO: ResizeObserver | null;
  /** Small yaw / pitch sway added on top of the camera. */
  swY: number;
  swP: number;
  t0: number;
  last: number;
  lastDraw?: number;
  /** Motion level from the quality module. */
  motion: number;
  /** Draw every n-th star (quality). */
  stride: number;
  vel: number;
  drag: boolean;
  cxOff: number;
  lay: { cx: number; cy: number; rx: number[] } | null;
  F?: number;
  egg: { start: number } | null;
  nextShoot: number;
  shoot: ShootingStar | null;
  /** Press-and-hold on a system label. */
  hold: { i: number; start: number } | null;
  holds: (HTMLElement | null)[];
  holdFired?: { i: number; t: number };
  fadeIn: { start: number; dur: number; a0?: number; color?: string } | null;
  lastP?: Project;

  spawn(init: boolean): WarpParticle;
  sprite(rgb: string, soft?: boolean): HTMLCanvasElement;
  basis(): Basis;
  drawAboutGal(el: HTMLCanvasElement): void;
  drawWarp(c: CanvasRenderingContext2D, W: number, H: number, t: number, dt: number): void;
  drawBH(c: CanvasRenderingContext2D, x: number, y: number, Rp: number, s: number, mo: number): void;
  drawEgg(c: CanvasRenderingContext2D, W: number, H: number, t: number): void;
  updIntroHold(t: number): void;
  place(P: Project, s: number, mo: number): void;
  placePlanets(dt: number, s: number, mo: number): void;
}

const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)];
/** Uniform random direction on the unit sphere. */
function randomDirection(): Vec3 {
  const u = rnd() * 2 - 1;
  const t = rnd() * TAU;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(t), u, s * Math.sin(t)];
}
/** Rotates v around x by a, then around y by b. */
function rotate([x, y, z]: Vec3, a: number, b: number): Vec3 {
  const y1 = y * Math.cos(a) - z * Math.sin(a);
  const z1 = y * Math.sin(a) + z * Math.cos(a);
  return [x * Math.cos(b) + z1 * Math.sin(b), y1, -x * Math.sin(b) + z1 * Math.cos(b)];
}
const smoothstep = (q: number) => q * q * (3 - 2 * q);
/** Warp speed curve by progress: ease in, cruise, ease out. */
function warpSpeed(k: number): number {
  if (k < 0.28) {
    const q = k / 0.28;
    return 0.015 + q * q * q * 0.985;
  }
  if (k < 0.66) return 1;
  const q = (k - 0.66) / 0.34;
  return Math.pow(1 - q, 2.4) * 0.985 + 0.015;
}
const offscreen = (x1: number, y1: number, x2: number, y2: number, W: number, H: number) =>
  (x1 < -40 && x2 < -40) ||
  (x1 > W + 40 && x2 > W + 40) ||
  (y1 < -40 && y2 < -40) ||
  (y1 > H + 40 && y2 > H + 40);

export const scene = {
  sizeCanvas(this: SceneCtx): void {
    if (!this.cv) return;
    // Lower quality also lowers the resolution; at the lowest level down to about 1× for slow phones.
    const q = this.q ?? 1;
    const scale = q < 0.5 ? 0.5 : q < 0.75 ? 0.72 : 1;
    const dpr = Math.max(0.75, Math.min(devicePixelRatio || 1, 2) * scale);
    this.dpr = dpr;
    this.cv.width = innerWidth * dpr;
    this.cv.height = innerHeight * dpr;
    this.W = innerWidth;
    this.H = innerHeight;
  },

  /** Cached radial sprite: a sharp star (white core) or a soft glow. */
  sprite(this: SceneCtx, rgb: string, soft?: boolean): HTMLCanvasElement {
    const key = rgb + (soft ? 's' : '');
    const cached = this.sprites[key];
    if (cached) return cached;
    const size = soft ? 128 : 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const x = canvas.getContext('2d')!;
    const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    if (soft) {
      g.addColorStop(0, `rgba(${rgb},.9)`);
      g.addColorStop(0.45, `rgba(${rgb},.28)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
    } else {
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.08, `rgba(${rgb},.95)`);
      g.addColorStop(0.25, `rgba(${rgb},.28)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
    }
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);
    return (this.sprites[key] = canvas);
  },

  /**
   * Builds the whole sky. The random calls run in a fixed order from a seeded generator,
   * so changing the order here changes the galaxy.
   */
  seed(this: SceneCtx): void {
    const count = clamp((this.props['density'] as number) ?? 1400, 200, 3000);
    const withNebulae = (this.props['milkyWay'] as boolean) ?? true;
    const buckets: Record<string, Star[]> = {};
    const add = (star: Star) => (buckets[star.c] ??= []).push(star);

    // Spiral arms of the home galaxy.
    for (let i = 0; i < count; i++) {
      const radius = RG * Math.pow(rnd(), 0.72);
      const arm = i % ARMS;
      const angle = arm * 2.094 + radius * 0.0046 + gauss() * 0.26 * (1 + radius / RG);
      add({
        x: Math.cos(angle) * radius + gauss() * 26,
        y: gauss() * (38 * (1 - radius / RG) + 9),
        z: Math.sin(angle) * radius + gauss() * 26,
        m: 0.55 + Math.pow(rnd(), 6) * 3.4,
        a: 0.3 + rnd() * 0.6,
        c: pickT(),
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      });
    }
    // Warm central bulge.
    for (let i = 0; i < Math.round(count * 0.3); i++)
      add({
        x: gauss() * 120,
        y: gauss() * 60,
        z: gauss() * 120,
        m: 0.5 + Math.pow(rnd(), 5) * 2.4,
        a: 0.35 + rnd() * 0.5,
        c: rnd() < 0.6 ? BULGE_TINTS[0] : BULGE_TINTS[1],
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      });

    const galaxyCount = clamp((this.props['galaxies'] as number) ?? 22, 0, 40);
    this.regions = [];
    this.hot = [];
    seedDistantGalaxies(this, count, galaxyCount, add);
    // Hot spots inside the home galaxy, away from the systems.
    for (let n = 0; n < 7; n++) {
      let p: Vec3;
      let tries = 0;
      do {
        const radius = 250 + rnd() * (RG - 300);
        const angle = rnd() * TAU;
        p = [Math.cos(angle) * radius, gauss() * 20, Math.sin(angle) * radius];
        tries++;
      } while (tries < 50 && SYS.some(s => Math.hypot(s.p[0] - p[0], s.p[2] - p[2]) < 220));
      this.hot.push({ p, c: pick(HOT_COLORS), sc: 1 });
    }
    this.buckets = Object.entries(buckets);

    this.haze = Array.from({ length: 60 }, () => {
      const d = randomDirection();
      return { d, s: 0.25 + rnd() * 0.5, a: 0.05 + rnd() * 0.07, c: pick(NEB) };
    });
    this.skyb = Array.from({ length: 2200 }, () => {
      const d = randomDirection();
      return { d, a: 0.12 + Math.pow(rnd(), 3) * 0.5, r: rnd() < 0.08 ? 1.4 : 0.8 };
    });

    const clusterCount = clamp((this.props['constellations'] as number) ?? 30, 0, 60);
    this.clusters = seedHomeClusters(clusterCount);
    this.nebs = [];
    if (withNebulae) {
      for (let i = 0; i < 34; i++) {
        const radius = 120 + rnd() * (RG - 150);
        const arm = i % ARMS;
        const angle = arm * 2.094 + radius * 0.0046 + gauss() * 0.2;
        this.nebs.push({
          p: [Math.cos(angle) * radius, gauss() * 20, Math.sin(angle) * radius],
          s: 130 + rnd() * 300,
          a: 0.05 + rnd() * 0.08,
          c: pick(NEB),
        });
      }
    }
    SYS.forEach(s => this.nebs.push({ p: s.p, s: 220, a: 0.12, c: s.tint }));
    for (const region of this.regions) seedRegionDetail(this, region, withNebulae, clusterCount, galaxyCount);
    for (const spot of this.hot) {
      this.nebs.push({ p: spot.p, s: 220 * spot.sc, a: 0.13, c: spot.c });
      const big = spot.sc > 1;
      const stars: ClusterStar[] = Array.from({ length: 22 }, () => ({
        o: [gauss() * 20 * spot.sc, gauss() * 12 * spot.sc, gauss() * 20 * spot.sc],
        m: (0.8 + Math.pow(rnd(), 3) * 2.2) * (big ? 1.6 : 1),
        a: 0.5 + rnd() * 0.5,
        c: spot.c,
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      }));
      stars.push({ o: [0, 0, 0], m: 3.4 * (big ? 1.5 : 1), a: 1, c: spot.c, p: 12, ph: rnd() * TWO_PI });
      this.clusters.push({ c: spot.p, st: stars, glow: spot.c, gs: 70 * spot.sc });
    }
    // A small swarm of stars around each system.
    this.swarms = SYS.map(() =>
      Array.from({ length: 22 }, () => ({
        o: [gauss() * 20, gauss() * 12, gauss() * 20] as Vec3,
        m: 0.8 + Math.pow(rnd(), 3) * 2.2,
        a: 0.5 + rnd() * 0.5,
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      })),
    );
    this.bh = {
      p: [288, -1613, -2576],
      R: 150,
      tilt: -0.32,
      k: 0.24,
      parts: Array.from({ length: 1100 }, () => {
        const r = 1.55 + Math.pow(rnd(), 1.6) * 2.9;
        return { r, a: rnd() * TAU, w: 0.9 / Math.pow(r, 1.5), s: 0.6 + rnd() * 1.3, b: 0.35 + rnd() * 0.65 };
      }),
    };
    this.warpP = Array.from({ length: 1400 }, () => this.spawn(true));
    this.warpNeb = Array.from({ length: 16 }, () => {
      const angle = rnd() * TAU;
      const radius = 0.5 + rnd() * 1.4;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: 0.1 + rnd() * 0.9,
        s: 0.25 + rnd() * 0.5,
        c: pick(NEB),
        t: rnd() < 0.35,
      };
    });
  },

  /** Static star background behind the About page (redrawn on resize). */
  aboutGalRef(this: SceneCtx, el: HTMLCanvasElement | null): void {
    this.aboutRO?.disconnect();
    this.aboutRO = null;
    if (!el) return;
    const draw = () => this.drawAboutGal(el);
    this.aboutRO = new ResizeObserver(draw);
    this.aboutRO.observe(el);
    draw();
  },

  drawAboutGal(this: SceneCtx, el: HTMLCanvasElement): void {
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    el.width = W * dpr;
    el.height = H * dpr;
    const x = el.getContext('2d');
    if (!x) return;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);
    for (let i = 0; i < Math.round((W * H) / 900); i++) {
      const px = rnd() * W;
      const py = rnd() * H;
      const r = rnd() < 0.9 ? 0.5 + rnd() * 0.6 : 1 + rnd() * 0.8;
      x.fillStyle = `rgba(242,238,230,${0.25 + rnd() * 0.6})`;
      x.beginPath();
      x.arc(px, py, r, 0, TAU);
      x.fill();
    }
  },

  /** Pre-rendered galaxy image (spiral or elliptical), randomly rotated and squashed. */
  galaxy(this: SceneCtx, col: string, spiral: boolean): HTMLCanvasElement {
    const n = 256;
    const src = document.createElement('canvas');
    src.width = src.height = n;
    const x = src.getContext('2d')!;
    const half = n / 2;
    const glow = (cx: number, cy: number, r: number, rgb: string, alpha: number) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, r, 0, TAU);
      x.fill();
    };
    x.globalCompositeOperation = 'lighter';
    if (spiral) {
      glow(half, half, n * 0.46, col, 0.16);
      const pitch = 0.2 + rnd() * 0.08;
      const offset = rnd() * TAU;
      for (let arm = 0; arm < 2; arm++)
        for (let i = 0; i < 340; i++) {
          const th = rnd() * 3.2 * Math.PI;
          const r = n * 0.03 * Math.exp(pitch * th);
          if (r > n * 0.46) continue;
          const an = th + arm * Math.PI + offset + gauss() * 0.12;
          const px = half + Math.cos(an) * r + gauss() * r * 0.06;
          const py = half + Math.sin(an) * r + gauss() * r * 0.06;
          glow(
            px,
            py,
            1.5 + rnd() * 3.5,
            rnd() < 0.25 ? '255,255,255' : col,
            0.25 + rnd() * 0.35 * (1 - r / (n * 0.46)),
          );
        }
      glow(half, half, n * 0.13, '255,244,225', 0.9);
      glow(half, half, n * 0.05, '255,255,255', 0.9);
    } else {
      glow(half, half, n * 0.46, col, 0.35);
      glow(half, half, n * 0.2, '255,240,220', 0.55);
      glow(half, half, n * 0.06, '255,255,255', 0.8);
    }
    const out = document.createElement('canvas');
    out.width = out.height = n;
    const y = out.getContext('2d')!;
    y.translate(half, half);
    y.rotate(rnd() * TAU);
    y.scale(1, spiral ? 0.3 + rnd() * 0.7 : 0.45 + rnd() * 0.5);
    y.drawImage(src, -half, -half);
    return out;
  },

  /** New warp particle; `init` spreads it through the tunnel, otherwise it starts at the far end. */
  spawn(this: SceneCtx, init: boolean): WarpParticle {
    const angle = rnd() * TAU;
    const radius = 0.035 + Math.pow(rnd(), 0.65) * 1.3;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: init ? 0.08 + rnd() * 1.1 : 1.1 + rnd() * 0.15,
      c: pickT(),
      b: 0.35 + Math.pow(rnd(), 2) * 0.65,
      hot: rnd() < 0.45,
    };
  },

  /** Camera position and orientation from yaw, pitch, distance and look-at point. */
  basis(this: SceneCtx): Basis {
    const { dist, T } = this.cam;
    const yaw = this.cam.yaw + this.swY;
    const pitch = this.cam.pitch + this.swP;
    const cp = Math.cos(pitch);
    const C: Vec3 = [
      T[0] + dist * cp * Math.sin(yaw),
      T[1] + dist * Math.sin(pitch),
      T[2] + dist * cp * Math.cos(yaw),
    ];
    const toTarget: Vec3 = [T[0] - C[0], T[1] - C[1], T[2] - C[2]];
    const len = Math.hypot(...toTarget);
    const fw = toTarget.map(v => v / len) as Vec3;
    const flat: Vec3 = [-fw[2], 0, fw[0]];
    const flatLen = Math.hypot(...flat) || 1;
    const r = flat.map(v => v / flatLen) as Vec3;
    const u: Vec3 = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]];
    return { C, fw, r, u };
  },

  /** One animation frame. `t` is the rAF timestamp. */
  frame(this: SceneCtx, t: number): void {
    const c = this.ctx;
    if (!c) return;
    const { W, H } = this;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    const s = (t - this.t0) / 1000;
    const reduced = this.reduced;
    const mo = reduced ? 0 : this.motion;
    const st = this.state;
    if (st.intro === 'boot' || st.intro === 'ready') {
      this.updIntroHold(t);
      return;
    }
    if (st.phase === 'page' && !this.warp && t - (this.lastDraw || 0) < PAGE_FRAME_MS) return;
    this.lastDraw = t;

    updateCamera(this, t, dt, mo);
    const zoomed = this.cam.dist < 900;
    if (zoomed !== st['zoomed']) this.setState({ zoomed });
    if (this.warp) {
      this.drawWarp(c, W, H, t, dt);
      return;
    }

    const layout = (st.phase === 'arrive' || st.phase === 'page') && this.lay ? this.lay : null;
    const { C, fw, r, u } = this.basis();
    const F = (this.F = Math.min(W, H * 1.15) * 0.95);
    const cx = layout ? layout.cx : W / 2 + this.cxOff;
    const cy = layout ? layout.cy : H * 0.4;
    const P: Project = (x, y, z) => {
      const dx = x - C[0];
      const dy = y - C[1];
      const dz = z - C[2];
      const depth = dx * fw[0] + dy * fw[1] + dz * fw[2];
      if (depth < 4) return null;
      const scale = F / depth;
      return [
        cx + (dx * r[0] + dy * r[1] + dz * r[2]) * scale,
        cy - (dx * u[0] + dy * u[1] + dz * u[2]) * scale,
        scale,
        depth,
      ];
    };
    const visible = (p: Projected | null, margin: number): p is Projected =>
      !!p && p[0] > -margin && p[1] > -margin && p[0] < W + margin && p[1] < H + margin;

    c.clearRect(0, 0, W, H);
    drawSkySphere(this, c, { fw, r, u }, F, cx, cy);
    drawNebulae(this, c, P, visible, s, mo);
    this.bhScr = null;
    if (((this.props['blackHole'] as boolean) ?? true) && this.bh) {
      const bp = P(...this.bh.p);
      if (bp) {
        const Rp = clamp(this.bh.R * bp[2], 6, 220);
        if (visible(bp, Rp * 8)) {
          this.drawBH(c, bp[0], bp[1], Rp, s, mo);
          this.bhScr = { x: bp[0], y: bp[1], R: Rp };
        }
        c.globalCompositeOperation = 'lighter';
      }
    }
    drawStars(this, c, P, visible, s, mo);
    c.globalCompositeOperation = 'source-over';
    drawHereRings(this, c, P, s);
    c.globalAlpha = 1;
    drawShootingStar(this, c, W, H, s, dt, mo);
    c.globalAlpha = 1;
    updateHold(this, t);
    drawFadeIn(this, c, W, H, t);
    drawWarpTail(this, c, W, H, t, dt);
    this.drawEgg(c, W, H, t);
    this.lastP = P;
    this.place(P, s, mo);
    if (layout && st.phase === 'arrive') this.placePlanets(dt, s, mo);
  },

  /** Warp tunnel between systems. Ends with `land` or by arriving at the system. */
  drawWarp(this: SceneCtx, c: CanvasRenderingContext2D, W: number, H: number, t: number, dt: number): void {
    const warp = this.warp as Warp & { handoff?: number };
    const elapsed = t - warp.start;
    const k = Math.min(1, elapsed / warp.dur);
    /** Entry: the destination star fills the screen after the jump. */
    const entry = warp.entry ? clamp((elapsed - warp.dur) / warp.entry, 0, 1) : 1;
    const fadeOut = 1 - entry;
    const speed = warpSpeed(k);
    const end = warp.end || [W / 2, H * 0.4];

    if (warp.handoff && k >= warp.handoff) {
      const land = warp.land;
      this.wtail = {
        start: t,
        dur: WARP_TAIL_MS,
        V0: speed * 2.1,
        cx: end[0],
        cy: end[1],
        dir: warp.dir || 1,
      };
      this.warp = null;
      land?.();
      return;
    }

    const velocity = speed * 2.1;
    const move = smoothstep(clamp(k / 0.5, 0, 1));
    let cx = warp.sx + (end[0] - warp.sx) * move;
    let cy = warp.sy + (end[1] - warp.sy) * move;
    const shake = speed > 0.7 && !this.reduced ? (speed - 0.7) * 2.4 : 0;
    cx += (rnd() - 0.5) * shake;
    cy += (rnd() - 0.5) * shake;

    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#05040C';
    c.fillRect(0, 0, W, H);
    // The last frame of the map zooms and fades at the start of the jump.
    if (warp.snap && k < 0.24) {
      const q = k / 0.24;
      const scale = 1 + q * q * 0.9;
      c.globalAlpha = Math.pow(1 - q, 1.5);
      c.save();
      c.translate(warp.sx, warp.sy);
      c.scale(scale, scale);
      c.translate(-warp.sx, -warp.sy);
      c.drawImage(warp.snap, 0, 0, W, H);
      c.restore();
      c.globalAlpha = 1;
    }

    const F = Math.max(W, H) * 0.14 * (1 - 0.2 * speed);
    const roll = ((t - warp.start) / 1000) * 0.1 * (warp.dir || 1);
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const fadeInAlpha = clamp(k / 0.1, 0, 1);
    c.globalCompositeOperation = 'lighter';
    const tunnel = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
    tunnel.addColorStop(0, `rgba(${warp.tint},${(0.07 + 0.1 * speed) * fadeInAlpha})`);
    tunnel.addColorStop(0.35, `rgba(60,70,140,${0.05 * speed})`);
    tunnel.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = tunnel;
    c.fillRect(0, 0, W, H);

    for (const n of this.warpNeb) {
      n.z -= velocity * dt * 0.9;
      if (n.z <= 0.05) {
        n.z = 1;
        const angle = rnd() * TAU;
        const radius = 0.5 + rnd() * 1.4;
        n.x = Math.cos(angle) * radius;
        n.y = Math.sin(angle) * radius;
      }
      const size = clamp((n.s / n.z) * F, 4, Math.max(W, H) * 1.5);
      const rx = n.x * cr - n.y * sr;
      const ry = n.x * sr + n.y * cr;
      const x = cx + (rx / n.z) * F;
      const y = cy + (ry / n.z) * F;
      c.globalAlpha = clamp((1 - n.z) * 0.09, 0, 0.09) * fadeInAlpha;
      c.drawImage(this.sprite(n.t ? warp.tint : n.c, true), x - size / 2, y - size / 2, size, size);
    }

    c.lineCap = 'round';
    const stride = this.stride || 1;
    const blueShift = speed > 0.55;
    const particles = this.warpP;
    for (let i = 0; i < particles.length; i += stride) {
      const p = particles[i];
      p.z -= velocity * dt;
      if (p.z <= 0.025) {
        Object.assign(p, this.spawn(false));
        continue;
      }
      const tailZ = Math.min(1.25, p.z + velocity * 0.045 + 0.0015);
      const rx = p.x * cr - p.y * sr;
      const ry = p.x * sr + p.y * cr;
      const x1 = cx + (rx / p.z) * F;
      const y1 = cy + (ry / p.z) * F;
      const x2 = cx + (rx / tailZ) * F;
      const y2 = cy + (ry / tailZ) * F;
      if (offscreen(x1, y1, x2, y2, W, H)) continue;
      const near = 1 - p.z;
      const alpha = Math.min(1, p.b * (0.12 + near * near * 1.3)) * fadeInAlpha * fadeOut;
      const color = blueShift && p.hot ? '214,228,255' : p.c;
      const length = Math.abs(x1 - x2) + Math.abs(y1 - y2);
      const width = Math.max(0.5, Math.min(2.8, 0.35 + near * near * 2.6));
      if (length < 1.5) {
        c.globalAlpha = alpha;
        c.fillStyle = `rgb(${color})`;
        c.fillRect(x1 - width / 2, y1 - width / 2, width, width);
      } else {
        const streak = c.createLinearGradient(x2, y2, x1, y1);
        streak.addColorStop(0, `rgba(${color},0)`);
        streak.addColorStop(1, `rgba(${color},${alpha})`);
        c.globalAlpha = 1;
        c.strokeStyle = streak;
        c.lineWidth = width;
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x1, y1);
        c.stroke();
      }
    }

    if (warp.dest) {
      const grow = smoothstep(clamp((k - 0.6) / 0.4, 0, 1));
      const size =
        6 + grow * (warp.ss || 100) + (warp.entry ? Math.pow(entry, 2.4) * Math.hypot(W, H) * 2.8 : 0);
      warp.lastS = size;
      c.globalAlpha = 0.25 + 0.75 * grow;
      const glow = size * 2.4;
      c.drawImage(this.sprite(warp.tint, true), cx - glow / 2, cy - glow / 2, glow, glow);
      const body = c.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
      body.addColorStop(0, 'rgba(255,255,255,1)');
      body.addColorStop(0.26, `rgba(${warp.tint},1)`);
      body.addColorStop(0.5, `rgba(${warp.tint},.35)`);
      body.addColorStop(1, `rgba(${warp.tint},0)`);
      c.globalAlpha = 1;
      c.fillStyle = body;
      c.beginPath();
      c.arc(cx, cy, size / 2, 0, TAU);
      c.fill();
    }

    c.globalCompositeOperation = 'source-over';
    const vignette = c.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.75,
    );
    vignette.addColorStop(0, 'rgba(5,4,12,0)');
    vignette.addColorStop(1, `rgba(5,4,12,${(0.35 + 0.35 * speed) * fadeOut})`);
    c.globalAlpha = 1;
    c.fillStyle = vignette;
    c.fillRect(0, 0, W, H);
    if (warp.name) drawWarpHud(c, warp, k, fadeOut, W, H);

    if (k >= 1 && entry >= 1) {
      const land = warp.land;
      this.warp = null;
      if (land) land();
      else {
        this.emergeScale = warp.lastS && warp.ss ? warp.lastS / warp.ss : 1;
        this.arriveNow();
      }
    }
  },
};

/** Other galaxies scattered around, spaced so they don't overlap on screen. */
function seedDistantGalaxies(
  ctx: SceneCtx,
  count: number,
  galaxyCount: number,
  add: (s: Star) => void,
): void {
  let attempts = 0;
  for (let placed = 0; placed < galaxyCount && attempts < 900;) {
    attempts++;
    const u = rnd() * 1.3 - 0.65;
    const t = rnd() * TAU;
    const sn = Math.sqrt(1 - u * u);
    const D = 2600 + Math.pow(rnd(), 0.8) * 6500;
    const Rr = 420 + rnd() * 620;
    const dir: Vec3 = [sn * Math.cos(t), u, sn * Math.sin(t)];
    const angularSize = Math.atan((Rr * 1.15) / D);
    const overlaps = ctx.regions.some(o => {
      const od = o.c.map(v => v / o.D);
      const separation = Math.acos(clamp(dir[0] * od[0] + dir[1] * od[1] + dir[2] * od[2], -1, 1));
      return (
        separation < (angularSize + Math.atan((o.Rr * 1.15) / o.D)) * 1.35 ||
        Math.hypot(dir[0] * D - o.c[0], dir[1] * D - o.c[1], dir[2] * D - o.c[2]) < (Rr + o.Rr) * 1.5
      );
    });
    if (overlaps) continue;
    placed++;
    const a = (rnd() - 0.5) * 1.4;
    const b = rnd() * TAU;
    const centre = dir.map(v => v * D) as Vec3;
    ctx.regions.push({ c: centre, Rr, a, b, D });
    const starCount = Math.round(count * 0.38 * Math.min(1, 10 / Math.max(galaxyCount, 1)) * 1.6);
    const arms = 2 + Math.floor(rnd() * 2);
    for (let i = 0; i < starCount; i++) {
      const radius = Rr * Math.pow(rnd(), 0.72);
      const angle = ((i % arms) * TAU) / arms + (radius / Rr) * 5.3 + gauss() * 0.28 * (1 + radius / Rr);
      const local = rotate(
        [
          Math.cos(angle) * radius + gauss() * 18,
          gauss() * (26 * (1 - radius / Rr) + 6),
          Math.sin(angle) * radius + gauss() * 18,
        ],
        a,
        b,
      );
      add({
        x: centre[0] + local[0],
        y: centre[1] + local[1],
        z: centre[2] + local[2],
        m: 1.2 + Math.pow(rnd(), 5) * 4.5,
        a: 0.4 + rnd() * 0.55,
        c: pickT(),
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      });
    }
    for (let i = 0; i < Math.round(starCount * 0.25); i++)
      add({
        x: centre[0] + gauss() * Rr * 0.1,
        y: centre[1] + gauss() * Rr * 0.05,
        z: centre[2] + gauss() * Rr * 0.1,
        m: 1 + Math.pow(rnd(), 4) * 3,
        a: 0.4 + rnd() * 0.5,
        c: BULGE_TINTS[0],
        p: 9 + rnd() * 14,
        ph: rnd() * TWO_PI,
      });
    for (let n = 0; n < 3; n++) {
      const radius = Rr * (0.25 + rnd() * 0.6);
      const angle = rnd() * TAU;
      const local = rotate([Math.cos(angle) * radius, 0, Math.sin(angle) * radius], a, b);
      ctx.hot.push({
        p: [centre[0] + local[0], centre[1] + local[1], centre[2] + local[2]],
        c: pick(HOT_COLORS),
        sc: Rr / 600,
      });
    }
  }
}

function clusterStars(
  count: number,
  radius: number,
  base: string,
  magnitude: [number, number],
): ClusterStar[] {
  const stars: ClusterStar[] = [];
  for (let i = 0; i < count; i++) {
    const spread = Math.pow(rnd(), 0.8);
    stars.push({
      o: [gauss() * radius * spread, gauss() * radius * 0.6 * spread, gauss() * radius * spread],
      m: magnitude[0] + Math.pow(rnd(), 3) * magnitude[1],
      a: 0.45 + rnd() * 0.5,
      c: rnd() < 0.75 ? base : pickT(),
      p: 9 + rnd() * 14,
      ph: rnd() * TWO_PI,
    });
  }
  return stars;
}

/** Star clusters in the home galaxy, kept away from the systems. Young ones are blue, old ones warm. */
function seedHomeClusters(target: number): Cluster[] {
  const clusters: Cluster[] = [];
  let tries = 0;
  while (clusters.length < target && tries < 600) {
    tries++;
    const radius = 160 + rnd() * (RG - 200);
    const angle = rnd() * TAU;
    const centre: Vec3 = [Math.cos(angle) * radius, gauss() * 18, Math.sin(angle) * radius];
    if (SYS.some(s => Math.hypot(s.p[0] - centre[0], s.p[2] - centre[2]) < 110)) continue;
    const young = rnd() < 0.55;
    const count = 10 + Math.floor(rnd() * 24);
    const size = 10 + rnd() * 30;
    const stars = clusterStars(count, size, young ? YOUNG_TINT : OLD_TINT, [0.7, 3.2]);
    clusters.push({ c: centre, st: stars, glow: young ? YOUNG_GLOW : OLD_GLOW, gs: size * 3.2 });
  }
  return clusters;
}

/** Nebulae, core glow and clusters inside one distant galaxy. */
function seedRegionDetail(
  ctx: SceneCtx,
  region: Region,
  withNebulae: boolean,
  clusterCount: number,
  galaxyCount: number,
): void {
  if (withNebulae) {
    for (let i = 0; i < 10; i++) {
      const radius = region.Rr * Math.pow(rnd(), 0.6);
      const angle = rnd() * TAU;
      ctx.nebs.push({
        p: [
          region.c[0] + Math.cos(angle) * radius,
          region.c[1] + gauss() * 30,
          region.c[2] + Math.sin(angle) * radius,
        ],
        s: region.Rr * (0.35 + rnd() * 0.5),
        a: 0.06 + rnd() * 0.08,
        c: pick(NEB),
      });
    }
  }
  ctx.nebs.push({ p: region.c, s: region.Rr * 0.8, a: 0.22, c: CORE_TINT });
  const perRegion = Math.round((clusterCount * Math.min(1, 10 / Math.max(galaxyCount, 1))) / 4);
  for (let i = 0; i < perRegion; i++) {
    const radius = region.Rr * (0.15 + rnd() * 0.8);
    const angle = rnd() * TAU;
    const centre: Vec3 = [
      region.c[0] + Math.cos(angle) * radius,
      region.c[1] + gauss() * 20,
      region.c[2] + Math.sin(angle) * radius,
    ];
    const young = rnd() < 0.55;
    const count = 10 + Math.floor(rnd() * 18);
    const size = 14 + rnd() * 34;
    const stars = clusterStars(count, size, young ? YOUNG_TINT : OLD_TINT, [1.2, 4]);
    ctx.clusters.push({ c: centre, st: stars, glow: young ? YOUNG_GLOW : OLD_GLOW, gs: size * 3.2 });
  }
}

/** Spin, idle drift, flights to targets, the intro approach and easing towards the target camera. */
function updateCamera(ctx: SceneCtx, t: number, dt: number, mo: number): void {
  const { cam, tgt, state: st } = ctx;
  const reduced = ctx.reduced;
  if (ctx.egg) {
    const progress = (t - ctx.egg.start) / EGG_MS;
    if (progress < 0.45) cam.yaw += dt * (progress / 0.45) * 2.4;
  }
  if (!ctx.drag) {
    cam.yaw += ctx.vel;
    ctx.vel *= Math.pow(0.03, dt);
  }
  if (!reduced && !ctx.drag && t - ctx.idle > (st.sel >= 0 ? 1200 : 2200))
    cam.yaw += dt * (st.sel >= 0 ? 0.11 : 0.03) * Math.min(mo, 2);
  ctx.swY = 0;
  ctx.swP = 0;
  if (tgt.yaw != null && !ctx.drag) {
    const dy = tgt.yaw - cam.yaw;
    cam.yaw += dy * (reduced ? 1 : 1 - Math.pow(0.02, dt));
    if (Math.abs(dy) < 0.001) {
      cam.yaw = tgt.yaw;
      tgt.yaw = null;
    }
  }
  const ease = reduced ? 1 : 1 - Math.pow(0.02, dt);
  const approach = ctx.approach;
  if (approach) {
    const q = clamp((t - approach.start) / approach.dur, 0, 1);
    const e = 1 - Math.pow(1 - q, 3.2);
    // Distance is interpolated in log space so the fly-in feels even.
    const dist = Math.exp(Math.log(approach.d0) + (Math.log(approach.d1) - Math.log(approach.d0)) * e);
    cam.dist = tgt.dist = dist;
    cam.yaw = approach.y0 + (approach.y1 - approach.y0) * e;
    cam.pitch = tgt.pitch = approach.p0 + (approach.p1 - approach.p0) * e;
    ctx.vel = 0;
    if (q >= 1) {
      ctx.approach = null;
      ctx.idle = t;
    }
  }
  for (let i = 0; i < 3; i++) cam.T[i] += (tgt.T[i] - cam.T[i]) * ease;
  cam.dist += (tgt.dist - cam.dist) * ease;
  if (!ctx.drag) cam.pitch += (tgt.pitch - cam.pitch) * ease;
  const shift = st.sel >= 0 && ctx.W >= MOBILE && !st.list && st.phase === 'map' ? CARD_SHIFT : 0;
  ctx.cxOff += (shift - ctx.cxOff) * ease;
}

/** Background stars and haze on the sky sphere (they only rotate, never move closer). */
function drawSkySphere(
  ctx: SceneCtx,
  c: CanvasRenderingContext2D,
  b: Omit<Basis, 'C'>,
  F: number,
  cx: number,
  cy: number,
): void {
  const { fw, r, u } = b;
  const { W, H } = ctx;
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#F2EEE6';
  const sky = ctx.skyb;
  for (let i = 0; i < sky.length; i += ctx.stride) {
    const star = sky[i];
    const depth = star.d[0] * fw[0] + star.d[1] * fw[1] + star.d[2] * fw[2];
    if (depth <= 0.05) continue;
    const x = cx + ((star.d[0] * r[0] + star.d[1] * r[1] + star.d[2] * r[2]) / depth) * F;
    const y = cy - ((star.d[0] * u[0] + star.d[1] * u[1] + star.d[2] * u[2]) / depth) * F;
    if (x < 0 || y < 0 || x > W || y > H) continue;
    c.globalAlpha = star.a;
    c.fillRect(x, y, star.r, star.r);
  }
  c.globalCompositeOperation = 'lighter';
  for (const haze of ctx.haze || []) {
    const depth = haze.d[0] * fw[0] + haze.d[1] * fw[1] + haze.d[2] * fw[2];
    if (depth <= 0.1) continue;
    const x = cx + ((haze.d[0] * r[0] + haze.d[1] * r[1] + haze.d[2] * r[2]) / depth) * F;
    const y = cy - ((haze.d[0] * u[0] + haze.d[1] * u[1] + haze.d[2] * u[2]) / depth) * F;
    const size = (haze.s * F) / depth;
    if (x < -size || y < -size || x > W + size || y > H + size) continue;
    c.globalAlpha = haze.a;
    c.drawImage(ctx.sprite(haze.c, true), x - size / 2, y - size / 2, size, size);
  }
}

type Visible = (p: Projected | null, margin: number) => p is Projected;

function drawNebulae(
  ctx: SceneCtx,
  c: CanvasRenderingContext2D,
  P: Project,
  visible: Visible,
  s: number,
  mo: number,
): void {
  const { W, H } = ctx;
  for (const neb of ctx.nebs) {
    const p = P(neb.p[0], neb.p[1], neb.p[2]);
    if (!visible(p, 900)) continue;
    const size = neb.s * p[2];
    if (size < 6) continue;
    // Nebulae fade out as the camera flies into them.
    const fade = clamp(1.6 - size / (Math.max(W, H) * 2.2), 0, 1);
    c.globalAlpha = neb.a * fade * (1 + (mo ? 0.15 * Math.sin(s * 0.2 + neb.s) : 0));
    c.drawImage(ctx.sprite(neb.c, true), p[0] - size / 2, p[1] - size / 2, size, size);
  }
  const core = P(0, 0, 0);
  if (visible(core, 900)) {
    const size = 560 * core[2];
    c.globalAlpha = 0.32;
    c.drawImage(ctx.sprite(CORE_TINT, true), core[0] - size / 2, core[1] - size / 2, size, size);
  }
}

/** Field stars (by colour bucket), clusters and the swarms around each system. */
function drawStars(
  ctx: SceneCtx,
  c: CanvasRenderingContext2D,
  P: Project,
  visible: Visible,
  s: number,
  mo: number,
): void {
  /** Distant stars are dimmer. */
  const depthFade = (depth: number) => clamp(1.35 - depth / 7500, 0.45, 1);
  const twinkle = (period: number, phase: number, min: number) =>
    mo ? min + (1 - min) * Math.sin((TAU * s) / period + phase) : 1;
  for (const [color, stars] of ctx.buckets) {
    const sprite = ctx.sprite(color);
    c.fillStyle = `rgb(${color})`;
    for (let i = 0; i < stars.length; i += ctx.stride) {
      const star = stars[i];
      const p = P(star.x, star.y, star.z);
      if (!visible(p, 20)) continue;
      const size = Math.min(5, star.m * p[2] * 1.25);
      c.globalAlpha = star.a * depthFade(p[3]) * twinkle(star.p, star.ph, 0.7);
      if (size < 1.3) c.fillRect(p[0], p[1], Math.max(0.6, size), Math.max(0.6, size));
      else {
        const glow = Math.min(48, size * 5);
        c.drawImage(sprite, p[0] - glow / 2, p[1] - glow / 2, glow, glow);
      }
    }
  }
  for (const cluster of ctx.clusters) {
    const pc = P(cluster.c[0], cluster.c[1], cluster.c[2]);
    if (!visible(pc, 400)) continue;
    const glow = cluster.gs * pc[2];
    if (glow > 4) {
      c.globalAlpha = 0.16 * (mo ? 0.8 + 0.2 * Math.sin(s * 0.4 + cluster.gs) : 1);
      c.drawImage(ctx.sprite(cluster.glow, true), pc[0] - glow / 2, pc[1] - glow / 2, glow, glow);
    }
    const step = ctx.stride > 2 ? 2 : 1;
    for (let i = 0; i < cluster.st.length; i += step) {
      const star = cluster.st[i];
      const p = P(cluster.c[0] + star.o[0], cluster.c[1] + star.o[1], cluster.c[2] + star.o[2]);
      if (!p) continue;
      const size = Math.min(7, star.m * p[2] * 1.3);
      const sprite = Math.max(5, Math.min(70, size * 7));
      c.globalAlpha = star.a * depthFade(p[3]) * twinkle(star.p, star.ph, 0.55);
      c.drawImage(ctx.sprite(star.c), p[0] - sprite / 2, p[1] - sprite / 2, sprite, sprite);
    }
  }
  SYS.forEach((system, i) => {
    const sprite = ctx.sprite(system.tint);
    for (const star of ctx.swarms[i]) {
      const p = P(system.p[0] + star.o[0], system.p[1] + star.o[1], system.p[2] + star.o[2]);
      if (!p) continue;
      const size = Math.max(5, Math.min(60, star.m * p[2] * 8));
      c.globalAlpha = star.a * twinkle(star.p, star.ph, 0.6) * depthFade(p[3]);
      c.drawImage(sprite, p[0] - size / 2, p[1] - size / 2, size, size);
    }
  });
}

/** Two expanding rings around the system the ship is at ("you are here"). */
function drawHereRings(ctx: SceneCtx, c: CanvasRenderingContext2D, P: Project, s: number): void {
  const here = SYS[ctx.state.here];
  const p = P(...here.p);
  if (!p || ctx.state.phase !== 'map') return;
  c.strokeStyle = here.hex;
  c.lineWidth = 1.4;
  const base = here.home ? clamp(24 * p[2], 7, 260) + 8 : 16;
  for (let ring = 0; ring < 2; ring++) {
    const phase = ctx.reduced ? 0.35 : (s * 0.55 + ring * 0.5) % 1;
    c.globalAlpha = (1 - phase) * 0.8;
    c.beginPath();
    c.arc(p[0], p[1], base + phase * 48, 0, TAU);
    c.stroke();
  }
}

/** An occasional shooting star, rarer at lower motion levels. */
function drawShootingStar(
  ctx: SceneCtx,
  c: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: number,
  dt: number,
  mo: number,
): void {
  if (mo && s > ctx.nextShoot && !ctx.shoot) {
    const angle = ((200 + rnd() * 35) * Math.PI) / 180;
    const speed = 700 + rnd() * 500;
    ctx.shoot = {
      x: W * (0.3 + rnd() * 0.65),
      y: H * (0.04 + rnd() * 0.35),
      vx: Math.cos(angle) * speed,
      vy: Math.abs(Math.sin(angle) * speed),
      t: 0,
      life: 0.6 + rnd() * 0.4,
    };
    ctx.nextShoot = s + (6 + rnd() * 9) / Math.max(0.3, mo);
  }
  const shot = ctx.shoot;
  if (!shot) return;
  shot.t += dt;
  const progress = shot.t / shot.life;
  const hx = shot.x + shot.vx * shot.t;
  const hy = shot.y + shot.vy * shot.t;
  const tx = hx - shot.vx * 0.13;
  const ty = hy - shot.vy * 0.13;
  const trail = c.createLinearGradient(tx, ty, hx, hy);
  trail.addColorStop(0, 'rgba(242,238,230,0)');
  trail.addColorStop(1, `rgba(242,238,230,${0.85 * Math.sin(Math.PI * Math.min(1, progress))})`);
  c.globalAlpha = 1;
  c.strokeStyle = trail;
  c.lineWidth = 1.3;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(tx, ty);
  c.lineTo(hx, hy);
  c.stroke();
  if (progress >= 1) ctx.shoot = null;
}

/** Press-and-hold on a system: fills its ring, then jumps (or goes Home). */
function updateHold(ctx: SceneCtx, t: number): void {
  const hold = ctx.hold;
  if (!hold) return;
  const ring = ctx.holds[hold.i];
  const progress = clamp((t - hold.start - HOLD_DELAY) / (ctx.reduced ? HOLD_REDUCED_MS : HOLD_MS), 0, 1);
  if (ring) {
    ring.style.opacity = progress > 0 ? '1' : '0';
    ring.lastElementChild?.setAttribute('stroke-dashoffset', (HOLD_RING * (1 - progress)).toFixed(1));
  }
  if (progress < 1) return;
  ctx.coachAct(2);
  ctx.hold = null;
  ctx.holdFired = { i: hold.i, t: performance.now() };
  if (ring) ring.style.opacity = '0';
  if (hold.i === HOME) ctx.goHome();
  else {
    ctx.select(hold.i);
    setTimeout(() => ctx.jump(), 40);
  }
}

function drawFadeIn(ctx: SceneCtx, c: CanvasRenderingContext2D, W: number, H: number, t: number): void {
  const fade = ctx.fadeIn;
  if (!fade) return;
  const q = clamp((t - fade.start) / fade.dur, 0, 1);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = (fade.a0 ?? 1) * Math.pow(1 - q, 1.6);
  c.fillStyle = fade.color ? `rgb(${fade.color})` : '#05040C';
  c.fillRect(0, 0, W, H);
  c.globalAlpha = 1;
  if (q >= 1) ctx.fadeIn = null;
}

function drawWarpTail(
  ctx: SceneCtx,
  c: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  dt: number,
): void {
  const tail = ctx.wtail;
  if (!tail) return;
  const q = clamp((t - tail.start) / tail.dur, 0, 1);
  const velocity = tail.V0 * Math.pow(1 - q, 2.2);
  const fade = Math.pow(1 - q, 1.4);
  const F = Math.max(W, H) * 0.14;
  const roll = ((t - tail.start) / 1000) * 0.1 * tail.dir;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const stride = ctx.stride || 1;
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  const particles = ctx.warpP;
  for (let i = 0; i < particles.length; i += stride) {
    const p = particles[i];
    p.z -= velocity * dt;
    if (p.z <= 0.025) {
      Object.assign(p, ctx.spawn(false));
      continue;
    }
    const tailZ = Math.min(1.25, p.z + velocity * 0.045 + 0.0015);
    const rx = p.x * cr - p.y * sr;
    const ry = p.x * sr + p.y * cr;
    const x1 = tail.cx + (rx / p.z) * F;
    const y1 = tail.cy + (ry / p.z) * F;
    const x2 = tail.cx + (rx / tailZ) * F;
    const y2 = tail.cy + (ry / tailZ) * F;
    if (offscreen(x1, y1, x2, y2, W, H)) continue;
    const near = 1 - p.z;
    const alpha = Math.min(1, p.b * (0.12 + near * near * 1.3)) * fade;
    if (alpha < 0.02) continue;
    const width = Math.max(0.5, Math.min(2.8, 0.35 + near * near * 2.6));
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
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 1;
  if (q >= 1) ctx.wtail = null;
}

/** Destination name, remaining distance and a progress bar at the bottom of the warp. */
function drawWarpHud(
  c: CanvasRenderingContext2D,
  warp: Warp,
  k: number,
  fadeOut: number,
  W: number,
  H: number,
): void {
  const alpha = clamp(k / 0.15, 0, 1) * clamp((1 - k) / 0.12, 0, 1) * fadeOut;
  const progress = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const distance = (warp.ly * (1 - progress)).toFixed(1);
  const baseline = H - Math.max(40, H * 0.08);
  c.globalAlpha = alpha;
  c.textAlign = 'center';
  c.fillStyle = '#F2EEE6';
  c.font = '500 13px "Martian Mono", monospace';
  c.fillText(STR.jump + warp.name.toUpperCase(), W / 2, baseline - 22);
  c.fillStyle = '#A9A3C2';
  c.font = '400 12px "Martian Mono", monospace';
  c.fillText(STR.distance + distance + STR.ly, W / 2, baseline);
  const barWidth = Math.min(220, W * 0.4);
  c.fillStyle = 'rgba(242,238,230,.18)';
  c.fillRect(W / 2 - barWidth / 2, baseline + 12, barWidth, 1);
  c.fillStyle = `rgb(${warp.tint})`;
  c.fillRect(W / 2 - barWidth / 2, baseline + 12, barWidth * progress, 1);
  c.globalAlpha = 1;
  c.textAlign = 'start';
}
