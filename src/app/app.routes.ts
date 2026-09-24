import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'it' },
  { path: 'it', loadComponent: () => import('./skyward/skyward-it').then(m => m.SkywardIt) },
  { path: 'en', loadComponent: () => import('./skyward/skyward-en').then(m => m.SkywardEn) },
  { path: '**', redirectTo: 'it' },
];
