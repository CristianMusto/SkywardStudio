import { RenderMode, type ServerRoute } from '@angular/ssr';

// /it and /en are prerendered (head, meta, fonts); the galaxy itself starts in the browser.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'it', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
