/**
 * Routing bridge between the engine and the Angular Router.
 * Paths have no language prefix: '/', '/work', '/work/skyward'.
 * - Engine -> URL: syncRoute() after every state change.
 * - URL -> engine: onRoute() on links, back/forward and deep links.
 */
import { DHOME, HOME, PC, PL, STR, SYS, slug } from './data';
import { snapshotCanvas } from './navigation';
import type { EngineCtx, PlanetView, RouteTarget } from './types';

const planetSlug = (p: PlanetView): string => p.key || slug(p.name);
const FULL_TURN = Math.PI * 2;

export const router = {
  parseRoute(this: EngineCtx): RouteTarget {
    let path = '';
    try {
      path = decodeURIComponent((this.routePath || '').replace(/^\/+/, ''));
    } catch {
      /* malformed escape: treat as unknown path */
    }
    const [systemId, planetKey] = path.split('/');
    const system = SYS.findIndex(s => s.id === systemId);
    if (system < 0 || system === HOME) {
      const known = !systemId || systemId === 'home';
      return { system: -1, planet: -1, bad: known ? null : path };
    }
    const planet = planetKey
      ? (PL[systemId] ?? []).findIndex(p => !p.ghost && planetSlug(p) === planetKey)
      : -1;
    return { system, planet, bad: planetKey && planet < 0 ? path : null };
  },

  /** Path for the current state, or null while in transit (intro, jump, black hole). */
  pathForState(this: EngineCtx): string | null {
    const { intro, phase, sel, psel } = this.state;
    if (intro || this.warp || this.egg) return null;
    if (phase === 'map') return '/';
    if (sel < 0) return null;
    const id = SYS[sel].id;
    if (phase === 'arrive') return '/' + id;
    if (phase === 'page') {
      const planet = (PL[id] ?? [])[psel];
      return planet ? `/${id}/${planetSlug(planet)}` : '/' + id;
    }
    return null;
  },

  syncRoute(this: EngineCtx): void {
    const path = this.pathForState();
    if (path == null || (this.routePath || '/') === path) return;
    this.routePath = path;
    this.deps.navigate(path, !!this.popping);
  },

  onRoute(this: EngineCtx, path: string): void {
    if ((this.routePath || '/') === path) return;
    this.routePath = path;
    this.applyRoute();
  },

  /** Moves the engine to the location in routePath, animating when possible. */
  applyRoute(this: EngineCtx): void {
    const st = this.state;
    if (st.intro || this.warp || this.egg || st.phase === 'jump') return;

    const { system, planet, bad } = this.parseRoute();
    if (bad) {
      this.setState({ lost: '/' + bad });
      return;
    }
    if (st.lost) {
      this.lostTrap(false);
      this.setState({ lost: null });
    }

    // Changes made while applying a URL replace history instead of pushing.
    this.popping = true;
    setTimeout(() => (this.popping = false), 80);

    if (system < 0) {
      if (st.phase === 'page') this.setState({ phase: 'arrive' }, () => this.back());
      else if (st.phase === 'arrive') this.back();
      return;
    }
    if (st.phase === 'map') {
      if (planet >= 0) {
        this.openDirect(system, planet);
      } else {
        this.setState({ hover: -1 });
        this.select(system);
        setTimeout(() => this.jump(), 30);
      }
      return;
    }
    if (st.sel === system) {
      if (planet >= 0) {
        if (st.phase === 'page') this.goPlanet(planet);
        else this.openPage(planet, true);
      } else if (st.phase === 'page') {
        this.closePage();
      }
      return;
    }
    this.openDirect(system, planet);
  },

  /** Makes everything except the 404 dialog inert (on) or restores it (off). */
  lostTrap(this: EngineCtx, on: boolean): void {
    const main = document.querySelector('main');
    if (!main) return;
    const dialog = main.querySelector('[role=alertdialog]');
    for (const child of Array.from(main.children)) {
      if (on && dialog && child.contains(dialog)) continue;
      child.toggleAttribute('inert', on);
    }
  },

  lostHome(this: EngineCtx): void {
    this.lostTrap(false);
    this.setState({ lost: null, live: STR.backOnTheGalaxy });
    this.routePath = '/';
    this.deps.navigate('/', true);
    if (this.state.phase !== 'map') this.goHome();
    else setTimeout(() => this.startCoach(), 900);
  },

  /** Jumps straight to a system (and optionally a planet), with no warp. Used for deep links. */
  openDirect(this: EngineCtx, system: number, planet: number): void {
    const pos = SYS[system].p;
    this.orb = [];
    this.orb0 = null;
    this.ospd = 1;
    this.tgt.T = [...pos];
    this.cam.T = [...pos];
    this.tgt.dist = this.cam.dist = 220;
    this.tgt.pitch = this.cam.pitch = 0.34;
    const onPage = planet >= 0;
    this.setState(
      st => ({
        sel: system,
        hover: -1,
        list: false,
        phase: onPage ? 'page' : 'arrive',
        psel: planet,
        phover: -1,
        visited: { ...st.visited, [system]: true },
        live: (onPage ? PL[SYS[system].id][planet].name + ', ' : '') + SYS[system].name + '.',
      }),
      () =>
        setTimeout(() => {
          const heading = onPage ? this.pageTitle : this.arrive;
          heading?.focus({ preventScroll: true });
        }, 80),
    );
  },

  /** Opens a planet page; with animate, the planet grows to fill the screen first. */
  openPage(this: EngineCtx, index: number, animate = false): void {
    const planet = (PL[SYS[this.state.sel].id] ?? [])[index];
    if (!planet || planet.ghost) return;

    const show = () =>
      this.setState(
        { phase: 'page', psel: index, landMsg: '', live: STR.landingOn + planet.name + '.' },
        () => {
          if (this.pageEl) this.pageEl.scrollTop = 0;
          setTimeout(() => this.pageTitle?.focus({ preventScroll: true }), 80);
        },
      );

    this.sfx('land', 0.8);
    const origin = this.pwraps[index];
    const zoom = this.zoomEl;
    if (!animate || this.reduced || !origin || !zoom?.animate) {
      show();
      return;
    }

    const rect = origin.getBoundingClientRect();
    const size = Math.max(24, rect.width);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Scale needed for the disc to cover the farthest corner of the viewport.
    const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const scale = (reach * 2) / size + 0.5;
    const [light, mid, dark] = planet.c ?? PC['ice'];

    Object.assign(zoom.style, {
      left: `${cx - size / 2}px`,
      top: `${cy - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      display: 'block',
      background: `radial-gradient(circle at 34% 30%, ${light} 0%, ${mid} 40%, ${dark} 100%)`,
    });
    const grow = zoom.animate([{ transform: 'scale(1)' }, { transform: `scale(${scale.toFixed(2)})` }], {
      duration: 760,
      easing: 'cubic-bezier(.7,0,.3,1)',
      fill: 'forwards',
    });
    grow.onfinish = () => {
      show();
      const fade = zoom.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 420,
        easing: 'ease-out',
        fill: 'forwards',
      });
      fade.onfinish = () => {
        zoom.style.display = 'none';
        grow.cancel();
        fade.cancel();
      };
    };
  },

  closePage(this: EngineCtx): void {
    const system = SYS[this.state.sel];
    this.setState({ phase: 'arrive', live: STR.system + (system?.name ?? '') + '.' }, () =>
      setTimeout(() => this.arrive?.focus({ preventScroll: true }), 40),
    );
  },

  goPlanet(this: EngineCtx, index: number): void {
    this.setState({ psel: index }, () => {
      if (this.pageEl) this.pageEl.scrollTop = 0;
      this.pageTitle?.focus({ preventScroll: true });
    });
  },

  /** Leaves the current system and jumps to Contact. */
  toContatti(this: EngineCtx): void {
    const contact = SYS.findIndex(s => s.id === 'contact');
    this.setState({ psel: -1, phase: 'map', here: this.state.sel, sel: -1 }, () => {
      this.select(contact);
      setTimeout(() => this.jump(), 60);
    });
  },

  goHome(this: EngineCtx): void {
    const landHome = () =>
      this.setState({ phase: 'map', here: HOME, sel: -1, list: false, live: STR.homeStartingMap }, () => {
        this.fly(-1);
        // Return to the default yaw by the shortest turn.
        this.tgt.yaw = 0.7 + Math.round((this.cam.yaw - 0.7) / FULL_TURN) * FULL_TURN;
        this.tgt.pitch = 0.52;
        this.tgt.dist = DHOME;
        this.tgt.T = [0, 0, 0];
      });

    if (this.state.here === HOME || this.reduced) {
      landHome();
      return;
    }

    const from = this.scr?.[HOME] ?? [this.W / 2, this.H / 2];
    this.setState({ sel: HOME, list: false, phase: 'jump', live: STR.returningHome });
    for (const particle of this.warpP) Object.assign(particle, this.spawn(true));
    this.sfx('jump', 1.5);
    this.warp = {
      start: performance.now(),
      dur: 1500,
      sx: from[0],
      sy: from[1],
      end: [this.W / 2, this.H * 0.4],
      tint: SYS[HOME].tint,
      name: 'Home',
      ly: 1.2,
      snap: snapshotCanvas(this.cv),
      land: landHome,
    };
  },

  /** Back from a system to the galaxy map, keeping the ship at that system. */
  back(this: EngineCtx): void {
    const system = this.state.sel;
    this.setState(
      {
        psel: -1,
        phover: -1,
        landMsg: '',
        phase: 'map',
        here: system,
        sel: -1,
        live: STR.mapYouAreHere + SYS[system].name + '.',
      },
      () => {
        this.fly(-1);
        setTimeout(() => this.btns[system]?.focus(), 30);
      },
    );
  },
};
