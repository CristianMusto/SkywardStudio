/** Moving around the galaxy: selecting a system, jumping to it and arriving. */
import { DHOME, DSYS, HOME, PL, STR, SYS, TILT, rnd } from './data';
import type { EngineCtx } from './types';

/** Camera distance when orbiting a system. */
const ARRIVE_DIST = 220;
/** Camera distance the arrival animation starts from. */
const EMERGE_DIST = 45;
const SYSTEM_PITCH = 0.34;
const GALAXY_PITCH = 0.52;
const MOBILE_BREAKPOINT = 760;

/** Copies the canvas so the jump can fade the old view out. Returns null if the canvas is tainted. */
export function snapshotCanvas(source: HTMLCanvasElement): HTMLCanvasElement | null {
  try {
    const copy = document.createElement('canvas');
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext('2d')?.drawImage(source, 0, 0);
    return copy;
  } catch {
    return null;
  }
}

export const navigation = {
  /** Points the camera at a system, or back at the galaxy when system < 0. */
  fly(this: EngineCtx, system: number): void {
    if (system >= 0) {
      this.tgt.T = [...SYS[system].p];
      this.tgt.dist = DSYS;
      this.tgt.pitch = SYSTEM_PITCH;
    } else {
      const here = this.state.here;
      this.tgt.T = here === HOME ? [0, 0, 0] : (SYS[here].p.map(v => v * 0.7) as [number, number, number]);
      this.tgt.dist = DHOME;
      this.tgt.pitch = GALAXY_PITCH;
    }
    this.idle = performance.now() - 1500;
  },

  select(this: EngineCtx, system: number): void {
    this.fly(system);
    if (system >= 0) this.sfx('blip');
    const s = SYS[system];
    this.setState({
      sel: system,
      live: s ? `${s.name}, ${s.code}${STR.distance2}${s.min}${STR.minutesEnterToJump}` : '',
    });
  },

  openList(this: EngineCtx): void {
    this.setState({ list: true, sel: -1, live: STR.listViewMTo });
  },

  openMap(this: EngineCtx): void {
    this.setState({ list: false, live: STR.mapView });
  },

  /** System shown in the card: the hovered one on the map, otherwise the selected one. */
  cardIdx(this: EngineCtx): number {
    const { phase, list, hover, sel } = this.state;
    return phase === 'map' && !list && hover >= 0 ? hover : sel;
  },

  jump(this: EngineCtx): void {
    const target = this.cardIdx();
    if (target < 0) return;
    this.cardHot = false;
    clearTimeout(this.hvT);

    // Commit the hovered system as selected first, then jump.
    if (target !== this.state.sel || this.state.hover >= 0) {
      this.setState({ sel: target, hover: -1 }, () => this.jump());
      return;
    }
    if (target === HOME) {
      this.goHome();
      return;
    }

    const system = SYS[target];
    if (target === this.state.here || this.reduced) {
      this.setState({
        list: false,
        phase: 'jump',
        ...(this.reduced ? { live: STR.jumpingTo + system.name + '.' } : {}),
      });
      this.arriveNow();
      return;
    }

    this.setState({ list: false, phase: 'jump', live: STR.jumpingTo + system.name + '.' });
    for (const particle of this.warpP) Object.assign(particle, this.spawn(true));
    this.coachAct(2);

    // Longer trips for systems with more to read.
    const duration = Math.min(2600, 1600 + 250 * system.min);
    this.sfx('jump', duration / 1000);

    const from = this.scr?.[target] ?? [this.W / 2, this.H / 2];
    this.warp = {
      start: performance.now(),
      dur: duration,
      sx: from[0],
      sy: from[1],
      end: [this.W / 2, this.H / 2],
      tint: system.tint,
      name: system.name,
      ly: system.min * 1.3 + rnd() * 0.4,
      snap: snapshotCanvas(this.cv),
      ss: arrivalStarSize(this.W, this.H),
      dir: rnd() < 0.5 ? -1 : 1,
      dest: true,
      entry: 800,
    };
  },

  /** Lands on the selected planet, or jumps to Contact from the empty "your project" orbit. */
  land(this: EngineCtx): void {
    const { sel, psel } = this.state;
    const planet = (PL[SYS[sel].id] ?? [])[psel];
    if (!planet) return;
    if (planet.ghost) this.toContatti();
    else this.openPage(psel, true);
  },

  /** End of a jump: switch to the system map and focus its title. */
  arriveNow(this: EngineCtx): void {
    const system = this.state.sel;
    this.orb = [];
    this.orb0 = null;
    this.ospd = 1;
    this.setState({ psel: -1, phover: -1, landMsg: '' });

    this.tgt.dist = ARRIVE_DIST;
    this.cam.dist = this.reduced ? ARRIVE_DIST : EMERGE_DIST;
    if (!this.reduced) this.emerge = { start: performance.now(), s0: Math.max(1, this.emergeScale || 6) };
    this.arriveAnimVal = this.emerge ? 'none' : 'skFade 420ms ease-out';
    this.emergeScale = 0;

    this.setState(
      st => ({
        phase: 'arrive',
        visited: { ...st.visited, [system]: true },
        live: STR.arrivedAt + SYS[system].name + '.',
      }),
      () => setTimeout(() => this.arrive?.focus(), 30),
    );
  },
};

/** Size of the destination star at the end of the jump, matched to the system map layout. */
function arrivalStarSize(vw: number, vh: number): number {
  const mobile = vw < MOBILE_BREAKPOINT;
  const indexWidth = mobile ? 0 : Math.min(460, vw * 0.36);
  const orbitRadius = mobile
    ? Math.min(vw / 2 - 56, (vh * 0.2) / TILT)
    : Math.min((vw - indexWidth) / 2 - 70, (vh * 0.36) / TILT);
  return Math.max(70, Math.min(130, orbitRadius * 0.32));
}
