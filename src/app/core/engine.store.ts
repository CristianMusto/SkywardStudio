import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  afterEveryRender,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { planetsFor, type Lang } from '../content';
import type { EngineHost } from '../engine/base';
import type { PlanetView } from '../engine/types';
import { SkywardEngine, initData } from '../engine/engine';
import { ENGINE_STRINGS } from '../i18n/engine-strings';
import { UI_STRINGS, type UiStrings } from '../i18n/ui-strings';
import type { EngineView } from '../shared/view-part';
import { sendContact } from './contact.service';
import { SKYWARD_SETTINGS } from './settings';

const TITLES: Record<Lang, string> = {
  it: 'Skyward · La tua idea, in orbita.',
  en: 'Skyward · Your idea, in orbit.',
};

/**
 * Owns the SkywardEngine for one language and bridges it to Angular:
 * state changes re-render through a signal, and engine locations map to router URLs.
 * Provided by the Shell, so pages share one engine while the user navigates.
 */
@Injectable()
export class EngineStore {
  readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  readonly lang: Lang = inject(ActivatedRoute).snapshot.paramMap.get('lang') === 'en' ? 'en' : 'it';
  readonly strings = signal<UiStrings>(UI_STRINGS[this.lang]).asReadonly();

  private readonly tick = signal(0);
  private engine?: SkywardEngine;
  private pending: { prev: unknown; cbs: (() => void)[] } | null = null;
  readonly view = computed<EngineView>(() => {
    this.tick();
    return this.engine ? this.engine.renderVals() : {};
  });

  constructor() {
    inject(Title).setTitle(TITLES[this.lang]);
    if (!this.browser) return;

    const host: EngineHost = {
      props: SKYWARD_SETTINGS,
      schedule: (prev, cb) => {
        if (!this.pending) this.pending = { prev, cbs: [] };
        if (cb) this.pending.cbs.push(cb);
        this.tick.update(n => n + 1);
      },
    };
    initData(ENGINE_STRINGS[this.lang], planetsFor(this.lang) as unknown as Record<string, PlanetView[]>);
    this.engine = new SkywardEngine(host, {
      send: values => sendContact(values, this.lang),
      navigate: (path, replace) =>
        this.router.navigateByUrl('/' + this.lang + (path === '/' ? '' : path), { replaceUrl: replace }),
      switchLang: (to, path) => {
        this.doc.location.href = this.doc.baseURI + to + (path === '/' ? '/' : path);
      },
    });
    this.engine.routePath = this.pathOf(this.router.url);

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.engine?.onRoute(this.pathOf(this.router.url)));

    afterNextRender(() => this.engine?.componentDidMount());
    afterEveryRender(() => {
      const p = this.pending;
      if (!p || !this.engine) return;
      this.pending = null;
      this.engine.componentDidUpdate(this.engine.props, p.prev);
      p.cbs.forEach(f => f());
    });
    inject(DestroyRef).onDestroy(() => this.engine?.componentWillUnmount());
  }

  /** '/it/work/skyward?x#y' -> '/work/skyward' */
  private pathOf(url: string): string {
    const segs = url.split(/[?#]/)[0].split('/').filter(Boolean).slice(1);
    return '/' + segs.join('/');
  }

  /** Text holes: nothing for null/undefined/booleans. */
  readonly txt = (v: unknown): string => (v == null || typeof v === 'boolean' ? '' : String(v));

  /** Forwards DOM events to engine handlers. */
  readonly call = (fn: unknown, ev: Event): void => {
    if (typeof fn === 'function') fn(ev);
  };
}
