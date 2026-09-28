/**
 * The Skyward galaxy engine: state, camera and canvas fields.
 * Behaviour lives in the modules below, mixed into the prototype; each module types the
 * part of the engine it uses (its own `…Ctx` interface), so this class only holds data.
 */
import { DHOME, HOME } from './data';
import { EngineBase } from './base';
import { lifecycle } from './lifecycle';
import { quality } from './quality';
import { intro } from './intro';
import { coach } from './coach';
import { router } from './router';
import { contactForm } from './contact-form';
import { caseDemos } from './case-demos';
import { audio } from './audio';
import { blackHole } from './black-hole';
import { input } from './input';
import { scene } from './scene';
import { overlay } from './overlay';
import { navigation } from './navigation';
import { view } from './view';
import type { Camera, CameraTarget, EngineState } from './types';

export { initData } from './data';

/** Reads ?shot=… (screenshot mode for fixed captures). */
function readShot(): string | null {
  try {
    const m = /[?&]shot=([\w-]+)/.exec(location.search);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** True when this load comes from a language switch (the page starts under a veil). */
function readLangSwitch(): boolean {
  try {
    return sessionStorage.getItem('skyward.langSwitch') === '1';
  } catch {
    return false;
  }
}

export class SkywardEngine extends EngineBase<EngineState> {
  // Methods the Angular host calls directly (provided by the modules at runtime).
  declare renderVals: () => Record<string, unknown>;
  declare componentDidMount: () => void;
  declare componentDidUpdate: (props: unknown, prevState: unknown) => void;
  declare componentWillUnmount: () => void;
  declare onRoute: (path: string) => void;

  /** Current path without language, e.g. '/work/skyward'. Set by the host before mount. */
  routePath = '/';

  /** Methods passed to the template as handlers: bound to the instance by EngineBase. */
  static readonly BOUND = [
    'coachDone',
    'skipIntro',
    'introDown',
    'introUp',
    'introCancel',
    'introClick',
    'lostHome',
    'fIn',
    'fBlur',
    'fSubmit',
    'miniLoop',
    'jumpDemo',
    'closePage',
    'toggleAudio',
    'bhClick',
    'pDown',
    'pMove',
    'pUp',
    'wheel',
    'aboutGalRef',
    'clear',
    'recenter',
    'zoomIn',
    'zoomOut',
    'openList',
    'openMap',
    'jump',
    'land',
    'goHome',
    'back',
  ] as const;

  override state: EngineState = {
    // Case study demos
    tyI: 1,
    tyW: 78,
    logoPlay: 0,
    miniSel: 1,
    jumpBusy: false,
    // Contact form
    fv: { nome: '', email: '', msg: '' },
    ferr: {},
    fstate: 'idle',
    // Screens and overlays
    intro: null,
    coach: -1,
    audio: false,
    eggMsg: '',
    lost: null,
    // Navigation
    phase: 'map',
    sel: -1,
    hover: -1,
    psel: -1,
    phover: -1,
    landMsg: '',
    here: HOME,
    visited: { [HOME]: true },
    list: false,
    zoomed: false,
    live: '',
    vw: typeof window !== 'undefined' ? window.innerWidth : 1280,
    vh: typeof window !== 'undefined' ? window.innerHeight : 800,
  };

  // DOM elements collected through template refs, one per system / planet.
  btns: (HTMLElement | null)[] = [];
  wraps: (HTMLElement | null)[] = [];
  halos: (HTMLElement | null)[] = [];
  holds: (HTMLElement | null)[] = [];
  pwraps: (HTMLElement | null)[] = [];
  phalos: (HTMLElement | null)[] = [];
  sky: HTMLElement | null = null;
  arrive: HTMLElement | null = null;

  // Pointer and hold-to-jump.
  ptr = new Map<number, { x: number; y: number }>();
  drag = false;
  hold: { i: number; start: number } | null = null;
  holdFired: { i: number; t: number } | null = null;

  // Camera and motion.
  cam: Camera = { yaw: 0.7, pitch: 0.52, dist: DHOME, T: [0, 0, 0] };
  tgt: CameraTarget = { yaw: null, pitch: 0.52, dist: DHOME, T: [0, 0, 0] };
  vel = 0;
  idle = 0;
  cxOff = 0;
  swY = 0;
  swP = 0;

  // System view layout and planet orbits.
  lay: { cx: number; cy: number; rx: number[] } | null = null;
  orb: (number | null)[] = [];
  ospd = 1;

  // Shooting stars.
  nextShoot = 4;
  shoot: unknown = null;

  readonly shot = readShot();
  readonly langIn = readLangSwitch();

  /** Screenshot mode, the forceReducedMotion setting or the OS preference. */
  get reduced(): boolean {
    return (
      !!this.shot ||
      !!this.props['forceReducedMotion'] ||
      (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  }

  /** Animation intensity from the settings (0 = still, 1 = default). */
  get motion(): number {
    return (this.props['motion'] as number | undefined) ?? 1;
  }
}

Object.assign(
  SkywardEngine.prototype,
  lifecycle,
  quality,
  intro,
  coach,
  router,
  contactForm,
  caseDemos,
  audio,
  blackHole,
  input,
  scene,
  overlay,
  navigation,
  view,
);
