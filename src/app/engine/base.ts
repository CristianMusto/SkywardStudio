/** What the Angular host gives the engine. */
export interface EngineHost {
  props: Record<string, unknown>;
  /** Called on every state change: the host re-renders, then runs componentDidUpdate and the callbacks. */
  schedule(prevState: unknown, cb?: () => void): void;
}

export interface ContactValues {
  nome: string;
  email: string;
  msg: string;
}

export interface EngineDeps {
  send(values: ContactValues): Promise<boolean>;
  /** Updates the URL for a new engine location ('/', '/work', '/work/skyward'). */
  navigate(path: string, replace: boolean): void;
  /** Full reload in the other language, keeping the current path. */
  switchLang(lang: 'it' | 'en', path: string): void;
}

type Patch<S> = Partial<S> | ((prev: S, props: Record<string, unknown>) => Partial<S> | null) | null;

/** Minimal state container with the API the mockup engine was written against. */
export class EngineBase<S extends object = Record<string, any>> {
  readonly props: Record<string, unknown>;
  state = {} as S;
  readonly deps: EngineDeps;
  private readonly host: EngineHost;

  constructor(host: EngineHost, deps: EngineDeps) {
    this.host = host;
    this.props = host.props;
    this.deps = deps;
    const bound = (new.target as unknown as { BOUND?: readonly string[] }).BOUND ?? [];
    const self = this as unknown as Record<string, (...a: unknown[]) => unknown>;
    for (const name of bound) self[name] = self[name].bind(this);
  }

  setState(update: Patch<S>, cb?: () => void): void {
    const prev = this.state;
    const patch = typeof update === 'function' ? update(prev, this.props) : update;
    if (patch != null) this.state = { ...prev, ...patch };
    this.host.schedule(prev, cb);
  }

  forceUpdate(cb?: () => void): void {
    this.host.schedule(this.state, cb);
  }
}
