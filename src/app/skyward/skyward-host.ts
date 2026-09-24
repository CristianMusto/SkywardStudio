import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, PLATFORM_ID, afterEveryRender, afterNextRender, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { planetsFor, type Lang } from '../content';
import { ReactShim } from './sky-vn';

/** Settings of the mockup (its Tweaks). */
export const SKYWARD_PROPS: Record<string, unknown> = {"intro":"first visit","quality":"auto","routes":true,"density":3000,"constellations":60,"galaxies":22,"milkyWay":true,"blackHole":true,"motion":3,"forceReducedMotion":false};

type Engine = Record<string, any>;
type Factory = (react: unknown, base: unknown, pl: unknown, send: unknown) => new (host: HostApi) => Engine;
interface HostApi { props: Record<string, unknown>; schedule(prev: unknown, cb?: () => void): void }

/** Sends the contact form through Web3Forms. Field names come from the mockup (nome, email, msg). */
async function send(fv: { nome: string; email: string; msg: string }, lang: Lang): Promise<boolean> {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: environment.web3formsKey, subject: 'Skyward · ' + fv.nome, from_name: 'Skyward website', name: fv.nome, email: fv.email, message: fv.msg, language: lang, botcheck: '' }),
    });
    const data = await res.json();
    return res.ok && !!data.success;
  } catch { return false; }
}

/**
 * Runs the Skyward Mappa engine inside Angular: the engine keeps its own state and hash routing,
 * Angular renders the converted template with the values it returns.
 */
export abstract class SkywardHost {
  protected readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private tick = signal(0);
  private engine?: Engine;
  private pending: { prev: unknown; cbs: (() => void)[] } | null = null;
  protected vals = computed<any>(() => { this.tick(); return this.engine ? this.engine['renderVals']() : {}; });

  protected constructor(lang: Lang, createEngine: Factory, title: string) {
    inject(Title).setTitle(title);
    if (!this.browser) return;
    document.documentElement.lang = lang;
    const host: HostApi = {
      props: SKYWARD_PROPS,
      schedule: (prev, cb) => {
        if (!this.pending) this.pending = { prev, cbs: [] };
        if (cb) this.pending.cbs.push(cb);
        this.tick.update(n => n + 1);
      },
    };
    class DCLogic {
      props = host.props;
      state: Record<string, unknown> = {};
      setState(u: any, cb?: () => void) {
        const prev = this.state;
        const patch = typeof u === 'function' ? u(prev, this.props) : u;
        if (patch != null) this.state = { ...prev, ...patch };
        host.schedule(prev, cb);
      }
      forceUpdate(cb?: () => void) { host.schedule(this.state, cb); }
    }
    const Component = createEngine(ReactShim, DCLogic, planetsFor(lang), send);
    this.engine = new Component(host);
    afterNextRender(() => this.engine?.['componentDidMount']?.());
    afterEveryRender(() => {
      const p = this.pending; if (!p || !this.engine) return;
      this.pending = null;
      this.engine['componentDidUpdate']?.(this.engine['props'], p.prev);
      p.cbs.forEach(f => f());
    });
    inject(DestroyRef).onDestroy(() => this.engine?.['componentWillUnmount']?.());
  }

  /** Text holes: nothing for null/undefined/booleans, like the mockup. */
  protected txt(v: unknown): string { return v == null || typeof v === 'boolean' ? '' : String(v); }
  protected call(fn: unknown, ev: Event) { if (typeof fn === 'function') fn(ev); }
}
