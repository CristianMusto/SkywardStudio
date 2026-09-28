/**
 * Adaptive quality: lowers or raises the render scale from the measured frame time.
 * Add ?perf=1 to the URL to show a small readout (fps, quality, resolution) for testing on devices.
 */
import type { Engine } from './types';

/**
 * Frame time (ms) above which quality drops (under ~42 fps), and below which it can rise again.
 * The rise threshold sits just under one 60 Hz frame: most phone browsers are capped at 60 fps,
 * so a lower value (e.g. 12.5 ms = 80 fps) would never be reached there.
 */
const SLOW_MS = 24;
const FAST_MS = 17.5;
/** Consecutive fast checks needed before raising quality, to avoid bouncing between two levels. */
const FAST_CHECKS = 2;
/** Minimum time between quality changes (ms). */
const ADJUST_EVERY = 2500;
const HUD_EVERY = 500;
const PERF_FLAG = /[?&]perf=1\b/;

interface QualityCtx extends Engine {
  q?: number;
  stride: number;
  pt: number;
  /** Smoothed frame time (ms). */
  ema: number;
  qT?: number;
  /** Fast checks in a row. */
  qFast?: number;
  shot: string | null;
  warp: unknown;
  dpr?: number;
  cv?: HTMLCanvasElement;
  perfEl?: HTMLElement | null;
  perfT?: number;
  /** Worst frame time since the last readout. */
  perfWorst?: number;
  sizeCanvas(): void;
  setQ(q: number): void;
}

export const quality = {
  /** q in 0.4..1: render scale; stride = draw every n-th star (1 = all). */
  setQ(this: QualityCtx, q: number): void {
    this.q = q;
    this.stride = q >= 0.95 ? 1 : q >= 0.65 ? 2 : 3;
  },

  perf(this: QualityCtx, t: number): void {
    const frame = this.pt ? t - this.pt : 16;
    this.pt = t;
    if (frame > 0 && frame < 250) this.ema = this.ema ? this.ema * 0.94 + frame * 0.06 : frame;
    perfHud(this, t, frame);
    if (this.shot || (this.props['quality'] ?? 'auto') !== 'auto') return;
    if (t - (this.qT ?? 0) <= ADJUST_EVERY || this.state.phase === 'page' || this.warp || this.state.intro)
      return;
    this.qT = t;
    const q = this.q ?? 1;
    if (this.ema > SLOW_MS && q > 0.4) {
      this.qFast = 0;
      this.setQ(Math.max(0.4, +(q - 0.2).toFixed(2)));
      this.sizeCanvas();
    } else if (this.ema < FAST_MS && q < 1) {
      this.qFast = (this.qFast ?? 0) + 1;
      if (this.qFast < FAST_CHECKS) return;
      this.qFast = 0;
      this.setQ(Math.min(1, +(q + 0.1).toFixed(2)));
      this.sizeCanvas();
    } else {
      this.qFast = 0;
    }
  },
};

/** Readout for ?perf=1: average and worst fps, quality level, star stride and canvas resolution. */
function perfHud(ctx: QualityCtx, t: number, frame: number): void {
  if (ctx.perfEl === null) return;
  if (ctx.perfEl === undefined) {
    if (!PERF_FLAG.test(location.search)) {
      ctx.perfEl = null;
      return;
    }
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      "position:fixed;left:8px;bottom:8px;z-index:2147483001;padding:6px 10px;border-radius:4px;background:rgba(5,4,12,.85);color:#7FE6F2;font:500 12px/1.5 'Martian Mono',monospace;white-space:pre;pointer-events:none";
    document.body.appendChild(el);
    ctx.perfEl = el;
  }
  if (frame > 0 && frame < 1000) ctx.perfWorst = Math.max(ctx.perfWorst ?? 0, frame);
  if (t - (ctx.perfT ?? 0) < HUD_EVERY) return;
  ctx.perfT = t;
  const avg = ctx.ema ? 1000 / ctx.ema : 0;
  const worst = ctx.perfWorst ? 1000 / ctx.perfWorst : 0;
  ctx.perfWorst = 0;
  const canvas = ctx.cv ? `${ctx.cv.width}×${ctx.cv.height}` : '–';
  ctx.perfEl.textContent =
    `fps ${avg.toFixed(0)} (min ${worst.toFixed(0)})\n` +
    `quality ${(ctx.q ?? 1).toFixed(2)} · stride ${ctx.stride}\n` +
    `dpr ${(ctx.dpr ?? 1).toFixed(2)} · ${canvas}`;
}
