import { beforeAll, describe, expect, it, vi } from 'vitest';
import { planetsFor } from '../content';
import { ENGINE_STRINGS } from '../i18n/engine-strings';
import { PL, SYS, initData } from './data';
import { router } from './router';
import type { PlanetView } from './types';

/** Minimal engine stand-in: only what parseRoute / pathForState / syncRoute read. */
function fakeEngine(overrides: Record<string, unknown> = {}) {
  const state = { intro: null, phase: 'map', sel: -1, psel: -1, ...((overrides['state'] as object) ?? {}) };
  return {
    routePath: '/',
    warp: null,
    egg: null,
    popping: false,
    deps: { navigate: vi.fn(), send: vi.fn(), switchLang: vi.fn() },
    ...overrides,
    state,
  } as any;
}

const parse = (path: string) => router.parseRoute.call(fakeEngine({ routePath: path }));
const pathFor = (state: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  router.pathForState.call(fakeEngine({ state, ...extra }));

beforeAll(() => {
  initData(ENGINE_STRINGS.en, planetsFor('en') as unknown as Record<string, PlanetView[]>);
});

describe('parseRoute', () => {
  const work = () => SYS.findIndex(s => s.id === 'work');
  const skyward = () => PL['work'].findIndex(p => p.key === 'skyward');

  it('reads the galaxy map from / and /home', () => {
    expect(parse('/')).toEqual({ system: -1, planet: -1, bad: null });
    expect(parse('/home')).toEqual({ system: -1, planet: -1, bad: null });
  });

  it('reads a system', () => {
    expect(parse('/work')).toEqual({ system: work(), planet: -1, bad: null });
  });

  it('reads a planet inside a system', () => {
    expect(parse('/work/skyward')).toEqual({ system: work(), planet: skyward(), bad: null });
  });

  it('marks unknown systems and planets as 404', () => {
    expect(parse('/nowhere').bad).toBe('nowhere');
    expect(parse('/work/nowhere').bad).toBe('work/nowhere');
  });

  it('does not route to empty "your project" orbits', () => {
    const ghost = PL['work'].find(p => p.ghost);
    if (ghost) expect(parse('/work/' + ghost.key).bad).not.toBeNull();
  });

  it('treats a malformed escape as the map instead of throwing', () => {
    expect(() => parse('/%E0%A4%A')).not.toThrow();
  });
});

describe('pathForState', () => {
  it('returns / on the map', () => {
    expect(pathFor({ phase: 'map' })).toBe('/');
  });

  it('returns the system and planet paths', () => {
    const work = SYS.findIndex(s => s.id === 'work');
    const skyward = PL['work'].findIndex(p => p.key === 'skyward');
    expect(pathFor({ phase: 'arrive', sel: work })).toBe('/work');
    expect(pathFor({ phase: 'page', sel: work, psel: skyward })).toBe('/work/skyward');
  });

  it('returns null while in transit', () => {
    expect(pathFor({ phase: 'map', intro: 'ready' })).toBeNull();
    expect(pathFor({ phase: 'map' }, { warp: {} })).toBeNull();
    expect(pathFor({ phase: 'jump', sel: 0 })).toBeNull();
  });

  it('round-trips every real planet through parseRoute', () => {
    SYS.forEach((system, s) => {
      if (system.id === 'home') return;
      (PL[system.id] ?? []).forEach((planet, p) => {
        if (planet.ghost) return;
        const path = pathFor({ phase: 'page', sel: s, psel: p })!;
        expect(parse(path)).toEqual({ system: s, planet: p, bad: null });
      });
    });
  });
});

describe('syncRoute', () => {
  it('pushes a new path once and skips unchanged ones', () => {
    const work = SYS.findIndex(s => s.id === 'work');
    const engine = fakeEngine({ state: { phase: 'arrive', sel: work } });
    router.syncRoute.call(engine);
    router.syncRoute.call(engine);
    expect(engine.deps.navigate).toHaveBeenCalledTimes(1);
    expect(engine.deps.navigate).toHaveBeenCalledWith('/work', false);
  });

  it('replaces history while a URL is being applied', () => {
    const engine = fakeEngine({ state: { phase: 'map' }, routePath: '/work', popping: true });
    router.syncRoute.call(engine);
    expect(engine.deps.navigate).toHaveBeenCalledWith('/', true);
  });
});
