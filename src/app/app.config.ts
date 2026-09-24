import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';
import { reloadOnStaleChunk } from './core/stale-chunk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withNavigationErrorHandler(e => reloadOnStaleChunk(e.error))),
  ],
};
