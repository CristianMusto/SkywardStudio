import type { CanMatchFn } from '@angular/router';

/** Only matches /it/... and /en/... */
export const langMatch: CanMatchFn = (_route, segments) =>
  segments[0]?.path === 'it' || segments[0]?.path === 'en';
