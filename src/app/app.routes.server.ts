import { RenderMode, type ServerRoute } from '@angular/ssr';
import { CONTENT } from './content';

const LANGS = ['it', 'en'];
const SYSTEMS = Object.keys(CONTENT);

// Every real URL is prerendered, so deep links work on GitHub Pages without a server.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LANGS.map(lang => ({ lang }));
    },
  },
  {
    path: ':lang/:system',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LANGS.flatMap(lang => SYSTEMS.map(system => ({ lang, system })));
    },
  },
  {
    path: ':lang/:system/:planet',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LANGS.flatMap(lang =>
        SYSTEMS.flatMap(system =>
          CONTENT[system].filter(p => !p.ghost).map(p => ({ lang, system, planet: p.key })),
        ),
      );
    },
  },
  // Unknown paths inside a language (/:lang/** in app.routes.ts): rendered in the browser,
  // where the engine shows the 404. Must be listed explicitly, otherwise it inherits
  // the prerender settings of ':lang' and fails on the '**' parameter.
  { path: ':lang/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
