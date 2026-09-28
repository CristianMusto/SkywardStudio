/**
 * The black hole near the galaxy centre: how it is drawn, and the easter egg that pulls
 * the camera in when it is clicked and drops the visitor back Home.
 */
import { DHOME, HOME, STR, clamp } from './data';
import type { EngineCtx, Vec3 } from './types';

const TAU = 6.283;
/** Easter egg length (ms) and the progress where each act starts. */
const EGG_MS = 2800;
const EGG_SWIRL_AT = 0.45;
const EGG_FLASH_AT = 0.72;
const EGG_MSG_MS = 4200;
const REDUCED_MSG_MS = 4000;
const SWIRL_PARTICLES = 280;
/** Accretion disc: rings drawn from 1.6 to 4.2 × the horizon radius. */
const DISC_RINGS = 14;

/** One particle of the accretion disc, in horizon radii and radians. */
interface DiscParticle {
  /** Starting angle. */
  a: number;
  /** Angular speed multiplier. */
  w: number;
  /** Orbit radius. */
  r: number;
  /** Brightness. */
  b: number;
  /** Size. */
  s: number;
}

interface BlackHoleModel {
  p: Vec3;
  /** Disc tilt on screen. */
  tilt: number;
  /** Vertical squash of the disc (0 = edge-on, 1 = face-on). */
  k: number;
  parts: DiscParticle[];
}

interface Egg {
  start: number;
  /** Set once the camera has been moved back Home. */
  reset?: boolean;
}

interface BlackHoleCtx extends EngineCtx {
  bh: BlackHoleModel;
  bhScr?: { x: number; y: number; R: number } | null;
  egg: Egg | null;
  eggT?: ReturnType<typeof setTimeout>;
  hold: unknown;
  vel: number;
  sprite(tint: string, soft: boolean): CanvasImageSource;
}

/** Disc colour by radius: white-hot inside, deep orange outside. */
function discColor(radius: number): string {
  const t = clamp((radius - 1.55) / 2.9, 0, 1);
  return t < 0.25 ? '255,246,226' : t < 0.55 ? '255,208,140' : t < 0.8 ? '255,150,82' : '214,86,52';
}

export const blackHole = {
  bhClick(this: BlackHoleCtx): void {
    if (this.state.phase !== 'map' || this.egg || this.state.intro) return;
    if (this.reduced) {
      showEggMessage(this, STR.aBlackHoleBest, REDUCED_MSG_MS);
      return;
    }
    this.egg = { start: performance.now() };
    this.hold = null;
    this.vel = 0;
    const [bx, by, bz] = this.bh.p;
    this.tgt.T = [bx, by, bz];
    this.tgt.dist = 380;
    this.tgt.yaw = null;
    this.setState({ sel: -1, hover: -1, eggMsg: '', live: STR.beingPulledIn });
    this.sfx('egg', 2.6);
  },

  /** Easter egg overlay in three acts: darkening, swirl into the horizon, white flash back Home. */
  drawEgg(this: BlackHoleCtx, c: CanvasRenderingContext2D, W: number, H: number, t: number): void {
    const egg = this.egg;
    if (!egg) return;
    const k = (t - egg.start) / EGG_MS;
    const hole = this.bhScr ?? { x: W / 2, y: H / 2, R: 30 };
    c.globalCompositeOperation = 'source-over';
    if (k < EGG_SWIRL_AT) drawDarkening(c, W, H, hole, k / EGG_SWIRL_AT);
    else if (k < EGG_FLASH_AT) drawSwirl(c, W, H, (k - EGG_SWIRL_AT) / (EGG_FLASH_AT - EGG_SWIRL_AT));
    else {
      if (!egg.reset) {
        egg.reset = true;
        returnHome(this);
      }
      const q = (k - EGG_FLASH_AT) / (1 - EGG_FLASH_AT);
      c.globalAlpha = Math.max(0, 0.85 * (1 - q * 1.4));
      c.fillStyle = '#F2F6FF';
      c.fillRect(0, 0, W, H);
    }
    c.globalAlpha = 1;
    if (k >= 1) this.egg = null;
  },

  /**
   * Draws the black hole at (x, y) with horizon radius Rp. Back half of the disc first,
   * then the shadow and photon ring, then the front half, so the disc wraps around the hole.
   */
  drawBH(this: BlackHoleCtx, c: CanvasRenderingContext2D, x: number, y: number, Rp: number, s: number, mo: number): void {
    const model = this.bh;
    const tilt = model.tilt;
    const squash = model.k;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const spin = s * (mo ? 0.9 : 0);
    /** Disc-local point → screen. */
    const toScreen = (lx: number, ly: number): [number, number] => [x + lx * cos - ly * sin, y + lx * sin + ly * cos];

    // Dark halo and soft orange glow.
    c.globalCompositeOperation = 'source-over';
    const halo = c.createRadialGradient(x, y, Rp * 0.9, x, y, Rp * 3.2);
    halo.addColorStop(0, 'rgba(3,2,10,.95)');
    halo.addColorStop(0.35, 'rgba(6,5,18,.55)');
    halo.addColorStop(1, 'rgba(11,10,31,0)');
    c.globalAlpha = 1;
    c.fillStyle = halo;
    c.beginPath();
    c.arc(x, y, Rp * 3.2, 0, TAU);
    c.fill();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.5;
    const glow = Rp * 11;
    c.drawImage(this.sprite('255,150,90', true), x - glow / 2, y - glow / 2, glow, glow);
    c.globalAlpha = 0.12;
    c.strokeStyle = 'rgba(200,190,255,1)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(x, y, Rp * 2.6, 0, TAU);
    c.stroke();

    // Two faint jets along the disc axis.
    const jetAlpha = mo ? 0.75 + 0.25 * Math.sin(s * 2.3) : 0.85;
    for (const dir of [-1, 1]) {
      const length = Rp * (3 + (mo ? 0.4 * Math.sin(s * 0.7 + dir) : 0));
      const endX = x + sin * dir * length;
      const endY = y - cos * dir * length;
      const jet = c.createLinearGradient(x, y, endX, endY);
      jet.addColorStop(0, `rgba(170,200,255,${0.22 * jetAlpha})`);
      jet.addColorStop(1, 'rgba(170,200,255,0)');
      c.strokeStyle = jet;
      c.lineWidth = Math.max(1, Rp * 0.18);
      c.lineCap = 'round';
      c.globalAlpha = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(endX, endY);
      c.stroke();
    }

    const drawBand = (from: number, to: number, alpha: number) => {
      for (let i = 0; i < DISC_RINGS; i++) {
        const radius = (1.6 + i * 0.2) * Rp;
        const fade = i / (DISC_RINGS - 1);
        c.strokeStyle = `rgba(${discColor(1.6 + i * 0.2)},${alpha * (1 - fade * 0.7)})`;
        c.lineWidth = Rp * 0.22;
        c.globalAlpha = 1;
        c.beginPath();
        c.ellipse(x, y, radius, radius * squash, tilt, from, to);
        c.stroke();
      }
    };
    /** Draws disc particles on one side; the approaching side (doppler) is brighter. */
    const drawParticles = (front: boolean, alpha: number) => {
      for (const q of model.parts) {
        const angle = q.a + spin * q.w;
        const sa = Math.sin(angle);
        if (front ? sa <= 0 : sa > 0) continue;
        const ca = Math.cos(angle);
        const doppler = 1 + 0.75 * -ca;
        const [px, py] = toScreen(ca * q.r * Rp, sa * q.r * Rp * squash);
        c.globalAlpha = clamp(q.b * alpha * doppler, 0, 1);
        c.fillStyle = `rgb(${discColor(q.r)})`;
        const size = q.s * Math.max(0.6, Rp / 60);
        c.fillRect(px - size / 2, py - size / 2, size, size);
      }
    };

    drawBand(Math.PI, 2 * Math.PI, 0.07);
    drawParticles(false, 0.5);
    drawLensedArc(c, model.parts, Rp, spin, toScreen);
    for (let i = 0; i < 5; i++) {
      const radius = Rp * (1.14 + i * 0.09);
      c.globalAlpha = 0.1 - i * 0.015;
      c.strokeStyle = 'rgb(255,200,130)';
      c.lineWidth = Rp * 0.12;
      c.beginPath();
      c.ellipse(x, y, radius, radius * 0.98, tilt, Math.PI * 1.02, Math.PI * 1.98);
      c.stroke();
    }

    // Event horizon and photon ring.
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(x, y, Rp, 0, TAU);
    c.fill();
    c.globalCompositeOperation = 'lighter';
    const ringAlpha = mo ? 0.85 + 0.15 * Math.sin(s * 3.1) : 0.9;
    c.globalAlpha = ringAlpha;
    c.strokeStyle = 'rgba(255,236,205,1)';
    c.lineWidth = Math.max(1, Rp * 0.045);
    c.beginPath();
    c.arc(x, y, Rp * 1.035, 0, TAU);
    c.stroke();
    c.globalAlpha = 0.35 * ringAlpha;
    c.lineWidth = Math.max(2, Rp * 0.14);
    c.strokeStyle = 'rgba(255,190,120,1)';
    c.beginPath();
    c.arc(x, y, Rp * 1.08, 0, TAU);
    c.stroke();

    drawBand(0, Math.PI, 0.09);
    drawParticles(true, 0.6);
    c.globalAlpha = 1;
  },
};

function showEggMessage(ctx: BlackHoleCtx, message: string, ms: number): void {
  ctx.setState({ eggMsg: message });
  clearTimeout(ctx.eggT);
  ctx.eggT = setTimeout(() => ctx.setState({ eggMsg: '' }), ms);
}

function returnHome(ctx: BlackHoleCtx): void {
  Object.assign(ctx.cam, { yaw: 0.7, pitch: 0.52, dist: DHOME * 1.6, T: [0, 0, 0] });
  ctx.tgt.T = [0, 0, 0];
  ctx.tgt.dist = DHOME;
  ctx.tgt.pitch = 0.52;
  ctx.vel = 0;
  ctx.idle = performance.now();
  ctx.setState({ here: HOME, live: STR.youReBackHome });
  showEggMessage(ctx, STR.pastTheEventHorizon, EGG_MSG_MS);
}

/** Act 1: the screen darkens from the edges towards the black hole. */
function drawDarkening(
  c: CanvasRenderingContext2D,
  W: number,
  H: number,
  hole: { x: number; y: number },
  q: number,
): void {
  const radius = Math.max(W, H) * (1.25 - q * 1.05);
  const shade = c.createRadialGradient(hole.x, hole.y, Math.max(1, radius * 0.2), hole.x, hole.y, radius);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, `rgba(0,0,0,${0.2 + q * 0.8})`);
  c.globalAlpha = 1;
  c.fillStyle = shade;
  c.fillRect(0, 0, W, H);
}

/** Act 2: stars spiral into a growing horizon in the middle of the screen. */
function drawSwirl(c: CanvasRenderingContext2D, W: number, H: number, q: number): void {
  const cx = W / 2;
  const cy = H / 2;
  const maxRadius = Math.max(W, H) * 0.7;
  c.globalAlpha = 1;
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < SWIRL_PARTICLES; i++) {
    const u = (i * 0.618 + q * 1.7) % 1;
    const radius = maxRadius * Math.pow(1 - u, 1.6);
    const angle = i * 2.4 + (1 - u) * 9 + q * 7;
    const size = 1 + (1 - u) * 2.4;
    c.globalAlpha = u * 0.9;
    c.fillStyle = i % 3 ? 'rgb(255,200,140)' : 'rgb(183,164,255)';
    c.fillRect(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.8, size, size);
  }
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 1;
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(cx, cy, 30 + q * 50, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(255,230,200,.9)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(cx, cy, 32 + q * 50, 0, TAU);
  c.stroke();
}

/** Gravitational lensing: the far side of the inner disc, bent over and under the horizon. */
function drawLensedArc(
  c: CanvasRenderingContext2D,
  parts: DiscParticle[],
  Rp: number,
  spin: number,
  toScreen: (lx: number, ly: number) => [number, number],
): void {
  for (const q of parts) {
    if (q.r > 3.4) continue;
    const angle = q.a + spin * q.w;
    if (Math.sin(angle) > 0) continue;
    const ca = Math.cos(angle);
    const rho = (1.12 + (q.r - 1.55) * 0.32) * Rp;
    const doppler = 1 + 0.75 * -ca;
    const arc = Math.sqrt(Math.max(0, 1 - ca * ca));
    const size = q.s * Math.max(0.6, Rp / 70);
    c.fillStyle = `rgb(${discColor(q.r)})`;
    let [px, py] = toScreen(ca * rho, -arc * rho * 0.98);
    c.globalAlpha = clamp(q.b * 0.42 * doppler, 0, 1);
    c.fillRect(px - size / 2, py - size / 2, size, size);
    [px, py] = toScreen(ca * rho * 0.86, arc * rho * 0.8);
    c.globalAlpha = clamp(q.b * 0.16 * doppler, 0, 1);
    c.fillRect(px - size / 2, py - size / 2, size, size);
  }
}
