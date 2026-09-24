import type { Sfx } from './audio';
import type { ContactValues, EngineBase } from './base';

export type Vec3 = [number, number, number];
/** [light, mid, dark] */
export type Palette = [string, string, string];

export type Phase = 'map' | 'jump' | 'arrive' | 'page';
export type FormField = keyof ContactValues;
export type FormStatus = 'idle' | 'sending' | 'sent';

/** A star system on the galaxy map. */
export interface StarSystem {
  id: string;
  code: string;
  name: string;
  /** Reading time in minutes, also the jump length. */
  min: number;
  desc: string;
  meta: string;
  hex: string;
  /** Same colour as hex, as "r,g,b" for rgba(). */
  tint: string;
  core: number;
  /** Position in galaxy space. */
  p: Vec3;
}

/** A planet as the engine receives it (content already resolved to one language). */
export interface PlanetView {
  key: string;
  name: string;
  kind: string;
  desc: string;
  c?: Palette;
  size: number;
  type?: string;
  ghost?: boolean;
  [field: string]: unknown;
}

/**
 * Engine state. Fields listed here are typed; the rest are still being typed (step 1b)
 * and live behind the index signature.
 */
export interface EngineState {
  phase: Phase;
  /** Selected system index, -1 for none. */
  sel: number;
  /** Hovered system index, -1 for none. */
  hover: number;
  /** Selected planet index inside the selected system, -1 for none. */
  psel: number;
  phover: number;
  /** System the ship is currently at. */
  here: number;
  visited: Record<number, boolean>;
  /** List view instead of the map. */
  list: boolean;
  /** Path that led to the 404 screen, or null. */
  lost: string | null;
  landMsg: string;
  /** Tutorial step, -1 when hidden. */
  coach: number;
  intro: unknown;
  audio: boolean;
  /** Text announced by the aria-live region. */
  live: string;
  fstate: FormStatus;
  fv: ContactValues;
  ferr: Partial<Record<FormField, string>>;
  [field: string]: any;
}

export type Engine = EngineBase<EngineState>;

export interface Camera {
  yaw: number;
  pitch: number;
  dist: number;
  /** Point the camera looks at. */
  T: Vec3;
}

export interface CameraTarget extends Omit<Camera, 'yaw'> {
  /** null = keep the current yaw. */
  yaw: number | null;
}

/** A jump in progress (warp tunnel). */
export interface Warp {
  start: number;
  dur: number;
  /** Screen point the jump starts from. */
  sx: number;
  sy: number;
  end: [number, number];
  tint: string;
  name: string;
  /** Light years shown on the HUD. */
  ly: number;
  /** Canvas snapshot taken before the jump, faded out during the entry. */
  snap: HTMLCanvasElement | null;
  ss?: number;
  dir?: 1 | -1;
  dest?: boolean;
  entry?: number;
  lastS?: number;
  /** Runs when the jump ends (used by the jump back Home). */
  land?: () => void;
}

/** Where a URL path points in the galaxy. */
export interface RouteTarget {
  /** System index, -1 for the galaxy map. */
  system: number;
  /** Planet index, -1 for the system map. */
  planet: number;
  /** The path when it does not exist (404), otherwise null. */
  bad: string | null;
}

/**
 * The part of SkywardEngine that typed modules rely on.
 * Grows as the remaining modules are typed.
 */
export interface EngineCtx extends Engine {
  readonly reduced: boolean;
  routePath: string;
  popping?: boolean;
  shot: string | null;
  langIn: boolean;

  cam: Camera;
  tgt: CameraTarget;
  idle: number;
  warp: Warp | null;
  warpP: object[];
  egg: unknown;
  W: number;
  H: number;
  cv: HTMLCanvasElement;
  /** Screen position of each system, updated every frame. */
  scr?: [number, number][];
  orb: unknown[];
  orb0: unknown;
  ospd: number;
  emerge?: { start: number; s0: number } | null;
  emergeScale?: number;
  arriveAnimVal?: string;
  cardHot?: boolean;
  hvT?: ReturnType<typeof setTimeout>;

  /** Tutorial progress. */
  cs?: number;
  cDrag?: number;
  cAct?: number;

  btns: (HTMLElement | null)[];
  pwraps: (HTMLElement | null)[];
  arrive: HTMLElement | null;
  pageTitle?: HTMLElement | null;
  pageEl?: HTMLElement | null;
  zoomEl?: HTMLElement | null;

  spawn(fast: boolean): object;
  sfx(type: Sfx, dur?: number): void;

  fly(system: number): void;
  select(system: number): void;
  cardIdx(): number;
  jump(): void;
  arriveNow(): void;

  parseRoute(): RouteTarget;
  pathForState(): string | null;
  applyRoute(): void;
  lostTrap(on: boolean): void;
  openDirect(system: number, planet: number): void;
  openPage(planet: number, animate?: boolean): void;
  closePage(): void;
  goPlanet(planet: number): void;
  toContatti(): void;
  goHome(): void;
  back(): void;

  wantCoach(): boolean;
  startCoach(): void;
  coachGo(step: number): void;
  coachDone(): void;
  coachAct(step: number): void;
}
