import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EngineStore } from '../../core/engine.store';
import { PlanetScreen } from '../../features/planet/planet-screen/planet-screen';

/** A planet page (case study, service, process step, about, contact). Route /:lang/:system/:planet */
@Component({
  selector: 'sky-planet-page',
  imports: [PlanetScreen],
  templateUrl: './planet.html',
  styleUrl: './planet.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class PlanetPage {
  protected readonly store = inject(EngineStore);
  protected readonly txt = this.store.txt;
  protected readonly call = this.store.call;
}
