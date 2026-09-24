/** Contact form: validation and submit. */
import { STR } from './data';
import type { Engine, FormField } from './types';

const FIELDS: readonly FormField[] = ['nome', 'email', 'msg'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface FormCtx extends Engine {
  fCheck(name: string, value: string): string;
}

type FieldEl = HTMLInputElement | HTMLTextAreaElement;

export const contactForm = {
  /** Returns the error message for a field, or '' when valid. */
  fCheck(this: FormCtx, name: string, value: string): string {
    const v = (value || '').trim();
    if (name === 'nome') return v ? '' : STR.enterYourName;
    if (name === 'email') return !v ? STR.enterYourEmail : EMAIL.test(v) ? '' : STR.checkTheEmailE;
    if (name === 'msg') return v.length >= 10 ? '' : STR.tellMeInA;
    return '';
  },

  /** Updates the value; re-validates only fields that already show an error. */
  fIn(this: FormCtx, e: Event): void {
    const { name, value } = e.target as FieldEl;
    const n = name as FormField;
    this.setState(st => ({
      fv: { ...st.fv, [n]: value },
      ferr: st.ferr[n] ? { ...st.ferr, [n]: this.fCheck(n, value) } : st.ferr,
      fstate: st.fstate === 'sent' ? 'idle' : st.fstate,
    }));
  },

  fBlur(this: FormCtx, e: Event): void {
    const { name, value } = e.target as FieldEl;
    if (!value) return;
    this.setState(st => ({ ferr: { ...st.ferr, [name]: this.fCheck(name, value) } }));
  },

  fSubmit(this: FormCtx, e: Event): void {
    e.preventDefault();
    if (this.state.fstate === 'sending') return;
    const fv = this.state.fv;
    const errors: Partial<Record<FormField, string>> = {};
    for (const n of FIELDS) errors[n] = this.fCheck(n, fv[n]);
    this.setState({ ferr: errors });
    const bad = FIELDS.find(n => errors[n]);
    if (bad) {
      document.getElementById('f-' + bad)?.focus();
      return;
    }
    this.setState({ fstate: 'sending', live: STR.sending });
    void this.deps
      .send(fv)
      .then(ok =>
        this.setState(
          ok
            ? { fstate: 'sent', fv: { nome: '', email: '', msg: '' }, ferr: {}, live: STR.messageSent }
            : { fstate: 'idle', live: STR.sendingFailedTryAgain },
        ),
      );
  },
};
