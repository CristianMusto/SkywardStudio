/**
 * First-visit tutorial, three steps:
 * 0 = drag to rotate, 1 = zoom, 2 = enter a system (ends the tutorial).
 */
import type { EngineCtx } from './types';

const SEEN_KEY = 'skyward.coachSeen';
/** Interactions needed on a step before moving to the next one. */
const ACTIONS_PER_STEP = 5;
const LAST_STEP = 2;

export const coach = {
  wantCoach(this: EngineCtx): boolean {
    if (this.shot || this.langIn) return false;
    if (/[?&]return=1/.test(location.search)) return false;
    if ((this.props['intro'] ?? 'always') === 'always') return true;
    try {
      return localStorage.getItem(SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  },

  startCoach(this: EngineCtx): void {
    const { lost, phase, intro } = this.state;
    if (lost || intro || phase !== 'map' || !this.wantCoach()) return;
    this.coachGo(0);
  },

  coachGo(this: EngineCtx, step: number): void {
    this.cs = step;
    this.cDrag = 0;
    this.cAct = 0;
    this.setState({ coach: step });
  },

  coachDone(this: EngineCtx): void {
    this.cs = -1;
    this.setState({ coach: -1 });
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage blocked */
    }
  },

  /** Counts an interaction for the given step; advances when there are enough. */
  coachAct(this: EngineCtx, step: number): void {
    if (this.cs !== step) return;
    if (step === LAST_STEP) {
      this.coachDone();
      return;
    }
    this.cAct = (this.cAct ?? 0) + 1;
    if (this.cAct > ACTIONS_PER_STEP) this.coachGo(step + 1);
  },
};
