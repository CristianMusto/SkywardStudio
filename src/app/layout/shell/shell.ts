import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EngineStore } from '../../core/engine.store';
import { SkyRef } from '../../shared/sky-ref';
import { IntroScreen } from '../../features/intro/intro-screen/intro-screen';
import { NotFound } from '../../features/not-found/not-found';

/**
 * Persistent layout for /:lang/**: the galaxy canvas, the intro and the 404 overlay.
 * Owns the EngineStore, so the engine survives navigation between pages.
 */
@Component({
  selector: 'sky-shell',
  imports: [RouterOutlet, SkyRef, IntroScreen, NotFound],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EngineStore],
})
export class Shell {
  protected readonly store = inject(EngineStore);
  protected readonly txt = this.store.txt;
  protected readonly call = this.store.call;
}
