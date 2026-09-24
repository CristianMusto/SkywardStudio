/** Adaptive quality: lowers or raises the render scale from the measured frame time. */
import type { Engine } from './types';

interface QualityCtx extends Engine {
  q?: number;
  stride: number;
  pt: number;
  ema: number;
  qT?: number;
  shot: string | null;
  warp: unknown;
  sizeCanvas(): void;
  setQ(q: number): void;
}

export const quality = {
  /** q in 0.4..1: render scale; stride = how many frames between expensive passes. */
  setQ(this: QualityCtx, q: number): void {
    this.q = q;
    this.stride = q >= 0.95 ? 1 : q >= 0.65 ? 2 : 3;
  },

  perf(this: QualityCtx, t: number): void {
    if (this.shot || (this.props['quality'] ?? 'auto') !== 'auto') {
      this.pt = t;
      return;
    }
    const d = this.pt ? t - this.pt : 16;
    this.pt = t;
    if (d > 0 && d < 250) this.ema = this.ema ? this.ema * 0.94 + d * 0.06 : d;
    if (t - (this.qT ?? 0) <= 2500 || this.state.phase === 'page' || this.warp || this.state.intro) return;
    this.qT = t;
    const q = this.q ?? 1;
    if (this.ema > 24 && q > 0.4) {
      this.setQ(Math.max(0.4, +(q - 0.2).toFixed(2)));
      this.sizeCanvas();
    } else if (this.ema < 12.5 && q < 1) {
      this.setQ(Math.min(1, +(q + 0.1).toFixed(2)));
      this.sizeCanvas();
    }
  },
};
