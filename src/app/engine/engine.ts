// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
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

export { initData } from './data';

/** The Skyward galaxy engine: state, camera and canvas fields; behaviour lives in the modules imported above. */
export class SkywardEngine extends EngineBase {
  declare renderVals: () => Record<string, any>;
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
  ];

  state = {
    tyI: 1,
    tyW: 78,
    logoPlay: 0,
    miniSel: 1,
    jumpBusy: false,
    fv: { nome: '', email: '', msg: '' },
    ferr: {},
    fstate: 'idle',
    intro: null,
    coach: -1,
    audio: false,
    eggMsg: '',
    psel: -1,
    phover: -1,
    landMsg: '',
    here: HOME,
    visited: { [HOME]: true },
    vw: typeof window !== 'undefined' ? window.innerWidth : 1280,
    vh: typeof window !== 'undefined' ? window.innerHeight : 800,
    sel: -1,
    hover: -1,
    list: false,
    phase: 'map',
    live: '',
    zoomed: false,
  };
  btns = [];
  phalos = [];
  holds = [];
  hold = null;
  holdFired = false;
  wraps = [];
  pwraps = [];
  orb = [];
  ospd = 1;
  lay = null;
  halos = [];
  sky = null;
  arrive = null;
  ptr = new Map();
  drag = false;
  vel = 0;
  idle = 0;
  cxOff = 0;
  nextShoot = 4;
  shoot = null;
  cam = { yaw: 0.7, pitch: 0.52, dist: DHOME, T: [0, 0, 0] };
  tgt = { yaw: null, pitch: 0.52, dist: DHOME, T: [0, 0, 0] };
  swY = 0;
  swP = 0;
  shot = (() => {
    try {
      const m = /[?&]shot=([\w-]+)/.exec(location.search);
      return m ? m[1] : null;
    } catch (e) {
      return null;
    }
  })();
  langIn = (() => {
    try {
      return sessionStorage.getItem('skyward.langSwitch') === '1';
    } catch (e) {
      return false;
    }
  })();

  get reduced() {
    return (
      !!this.shot ||
      !!this.props.forceReducedMotion ||
      (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  }
  get motion() {
    return this.props.motion ?? 1;
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
