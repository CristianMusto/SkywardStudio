import { Directive, input } from '@angular/core';
import type { UiStrings } from '../i18n/ui-strings';

/**
 * Values returned by SkywardEngine.renderVals().
 * Kept as `any` until the engine is typed (step 1b): with an index signature,
 * strict templates would reject every `v?.name` access (TS4111).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EngineView = any;

/** Base for every screen component: receives the engine view (v) and the UI strings (t). */
@Directive()
export abstract class ViewPart {
  readonly vm = input.required<EngineView>({ alias: 'v' });
  readonly tr = input.required<UiStrings>({ alias: 't' });

  /** Text holes: nothing for null/undefined/booleans. */
  protected txt(v: unknown): string {
    return v == null || typeof v === 'boolean' ? '' : String(v);
  }

  /** Forwards DOM events to engine handlers. */
  protected call(fn: unknown, ev: Event): void {
    if (typeof fn === 'function') fn(ev);
  }
}
