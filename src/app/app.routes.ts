import type { Routes } from '@angular/router';
import { langMatch } from './core/lang.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'it' },
  {
    path: ':lang',
    canMatch: [langMatch],
    loadComponent: () => import('./layout/shell/shell').then(m => m.Shell),
    children: [
      { path: '', loadComponent: () => import('./pages/galaxy/galaxy').then(m => m.GalaxyPage) },
      { path: ':system', loadComponent: () => import('./pages/system/system').then(m => m.SystemPage) },
      {
        path: ':system/:planet',
        loadComponent: () => import('./pages/planet/planet').then(m => m.PlanetPage),
      },
      // Unknown deeper paths: the engine shows the 404 overlay over the galaxy.
      { path: '**', loadComponent: () => import('./pages/galaxy/galaxy').then(m => m.GalaxyPage) },
    ],
  },
  { path: '**', redirectTo: 'it' },
];
