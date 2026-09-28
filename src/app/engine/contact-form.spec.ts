import { beforeAll, describe, expect, it, vi } from 'vitest';
import { planetsFor } from '../content';
import { ENGINE_STRINGS } from '../i18n/engine-strings';
import { contactForm } from './contact-form';
import { STR, initData } from './data';
import type { PlanetView } from './types';

const EMPTY = { nome: '', email: '', msg: '' };

/** Engine stand-in with a synchronous setState that supports updater functions. */
function fakeForm(send: (v: unknown) => Promise<boolean> = () => Promise.resolve(true)) {
  const engine: any = {
    state: { fv: { ...EMPTY }, ferr: {}, fstate: 'idle', live: '' },
    props: {},
    deps: { send: vi.fn(send), navigate: vi.fn(), switchLang: vi.fn() },
    setState(patch: any, cb?: () => void) {
      const next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      if (next) this.state = { ...this.state, ...next };
      cb?.();
    },
  };
  for (const [name, fn] of Object.entries(contactForm)) engine[name] = (fn as Function).bind(engine);
  return engine;
}

const input = (name: string, value: string) => ({ target: { name, value } }) as unknown as Event;
const submit = () => ({ preventDefault: vi.fn() }) as unknown as Event;
const flush = () => new Promise(r => setTimeout(r, 0));

beforeAll(() => {
  initData(ENGINE_STRINGS.en, planetsFor('en') as unknown as Record<string, PlanetView[]>);
});

describe('fCheck', () => {
  const form = () => fakeForm();

  it('requires a name', () => {
    expect(form().fCheck('nome', '  ')).toBe(STR.enterYourName);
    expect(form().fCheck('nome', 'Ada')).toBe('');
  });

  it('requires a valid email', () => {
    expect(form().fCheck('email', '')).toBe(STR.enterYourEmail);
    expect(form().fCheck('email', 'ada@example')).toBe(STR.checkTheEmailE);
    expect(form().fCheck('email', 'ada@example.com')).toBe('');
  });

  it('requires at least 10 characters of message', () => {
    expect(form().fCheck('msg', 'short')).toBe(STR.tellMeInA);
    expect(form().fCheck('msg', 'A real project brief')).toBe('');
  });
});

describe('typing and blur', () => {
  it('validates on blur, then re-validates while typing', () => {
    const f = fakeForm();
    f.fBlur(input('email', 'ada@'));
    expect(f.state.ferr.email).toBe(STR.checkTheEmailE);
    f.fIn(input('email', 'ada@example.com'));
    expect(f.state.fv.email).toBe('ada@example.com');
    expect(f.state.ferr.email).toBe('');
  });

  it('does not show errors for untouched fields while typing', () => {
    const f = fakeForm();
    f.fIn(input('nome', ''));
    expect(f.state.ferr.nome).toBeUndefined();
  });
});

describe('fSubmit', () => {
  it('blocks an invalid form and focuses the first invalid field', () => {
    const field = document.createElement('input');
    field.id = 'f-nome';
    document.body.appendChild(field);
    const f = fakeForm();
    f.fSubmit(submit());
    expect(f.deps.send).not.toHaveBeenCalled();
    expect(f.state.ferr.nome).toBe(STR.enterYourName);
    expect(document.activeElement).toBe(field);
    field.remove();
  });

  it('sends a valid form and resets it', async () => {
    const f = fakeForm();
    f.state.fv = { nome: 'Ada', email: 'ada@example.com', msg: 'A real project brief' };
    f.fSubmit(submit());
    expect(f.state.fstate).toBe('sending');
    await flush();
    expect(f.deps.send).toHaveBeenCalledTimes(1);
    expect(f.state.fstate).toBe('sent');
    expect(f.state.fv).toEqual(EMPTY);
  });

  it('keeps the values when sending fails', async () => {
    const f = fakeForm(() => Promise.resolve(false));
    const values = { nome: 'Ada', email: 'ada@example.com', msg: 'A real project brief' };
    f.state.fv = { ...values };
    f.fSubmit(submit());
    await flush();
    expect(f.state.fstate).toBe('idle');
    expect(f.state.fv).toEqual(values);
    expect(f.state.live).toBe(STR.sendingFailedTryAgain);
  });

  it('ignores a second submit while sending', () => {
    const f = fakeForm(() => new Promise(() => {}));
    f.state.fv = { nome: 'Ada', email: 'ada@example.com', msg: 'A real project brief' };
    f.fSubmit(submit());
    f.fSubmit(submit());
    expect(f.deps.send).toHaveBeenCalledTimes(1);
  });
});
