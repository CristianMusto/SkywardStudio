/** Ambient drone and sound effects, synthesised with Web Audio (no audio files). */
import { STR, rnd } from './data';
import type { Engine } from './types';

export type Sfx = 'blip' | 'jump' | 'egg' | 'land';

interface AudioCtx extends Engine {
  ac?: AudioContext;
  master?: GainNode;
  noise?: AudioBuffer;
  audioInit(): boolean;
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export const audio = {
  /** Builds the audio graph once. Returns false when Web Audio is unavailable. */
  audioInit(this: AudioCtx): boolean {
    if (this.ac) return true;
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return false;
    const ac = (this.ac = new AC());
    const m = (this.master = ac.createGain());
    m.gain.value = 0;
    m.connect(ac.destination);

    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.Q.value = 0.7;
    const dg = ac.createGain();
    dg.gain.value = 0.22;
    lp.connect(dg);
    dg.connect(m);

    const voices: [number, OscillatorType, number][] = [
      [55, 'sine', 0.5],
      [82.41, 'triangle', 0.22],
      [110.2, 'sine', 0.12],
    ];
    for (const [fq, tp, g] of voices) {
      const o = ac.createOscillator(),
        gg = ac.createGain();
      o.type = tp;
      o.frequency.value = fq;
      o.detune.value = (rnd() - 0.5) * 14;
      gg.gain.value = g;
      o.connect(gg);
      gg.connect(lp);
      o.start();
    }
    const lfo = ac.createOscillator(),
      lg = ac.createGain();
    lfo.frequency.value = 0.07;
    lg.gain.value = 160;
    lfo.connect(lg);
    lg.connect(lp.frequency);
    lfo.start();

    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate),
      data = nb.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = rnd() * 2 - 1;
    this.noise = nb;
    return true;
  },

  toggleAudio(this: AudioCtx): void {
    const on = !this.state.audio;
    if (on && !this.audioInit()) return;
    const ac = this.ac,
      master = this.master;
    if (!ac || !master) return;
    if (ac.state === 'suspended') void ac.resume();
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(on ? 0.5 : 0, now, 0.25);
    try {
      localStorage.setItem('skyward.audio', on ? '1' : '0');
    } catch {
      /* storage blocked */
    }
    this.setState({ audio: on, live: on ? STR.audioOn : STR.audioOff });
  },

  sfx(this: AudioCtx, type: Sfx, dur?: number): void {
    const ac = this.ac,
      m = this.master;
    if (!this.state.audio || !ac || !m) return;
    const t = ac.currentTime;
    if (type === 'blip') {
      const o = ac.createOscillator(),
        g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g);
      g.connect(m);
      o.start(t);
      o.stop(t + 0.2);
      return;
    }
    const D = dur || 1.4;
    const src = ac.createBufferSource();
    src.buffer = this.noise ?? null;
    src.loop = true;
    const bp = ac.createBiquadFilter();
    bp.type = type === 'egg' ? 'lowpass' : 'bandpass';
    bp.Q.value = type === 'egg' ? 1 : 1.4;
    const g = ac.createGain();
    if (type === 'jump') {
      bp.frequency.setValueAtTime(260, t);
      bp.frequency.exponentialRampToValueAtTime(2600, t + D * 0.55);
      bp.frequency.exponentialRampToValueAtTime(180, t + D);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.32, t + D * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    } else if (type === 'egg') {
      bp.frequency.setValueAtTime(900, t);
      bp.frequency.exponentialRampToValueAtTime(60, t + D * 0.7);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.42, t + D * 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    } else {
      bp.frequency.setValueAtTime(1600, t);
      bp.frequency.exponentialRampToValueAtTime(300, t + D);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + D * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    }
    src.connect(bp);
    bp.connect(g);
    g.connect(m);
    src.start(t);
    src.stop(t + D + 0.1);
    const o = ac.createOscillator(),
      og = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(type === 'egg' ? 120 : 90, t);
    o.frequency.exponentialRampToValueAtTime(type === 'egg' ? 28 : type === 'land' ? 60 : 360, t + D * 0.8);
    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(0.1, t + D * 0.3);
    og.gain.exponentialRampToValueAtTime(0.0001, t + D);
    o.connect(og);
    og.connect(m);
    o.start(t);
    o.stop(t + D + 0.1);
  },
};
