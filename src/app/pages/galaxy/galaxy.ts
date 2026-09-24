import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EngineStore } from '../../core/engine.store';
import { SkyRef } from '../../shared/sky-ref';
import { SiteHeader } from '../../layout/site-header/site-header';
import { SystemLabels } from '../../features/galaxy/system-labels/system-labels';
import { Hero } from '../../features/galaxy/hero/hero';
import { MapControls } from '../../features/galaxy/map-controls/map-controls';
import { Coach } from '../../features/galaxy/coach/coach';
import { EggToast } from '../../features/galaxy/egg-toast/egg-toast';
import { SystemCard } from '../../features/galaxy/system-card/system-card';
import { SystemList } from '../../features/galaxy/system-list/system-list';

/** Home: the galaxy map with system labels, card, list and tutorial. Route /:lang */
@Component({
  selector: 'sky-galaxy-page',
  imports: [SkyRef, SiteHeader, SystemLabels, Hero, MapControls, Coach, EggToast, SystemCard, SystemList],
  templateUrl: './galaxy.html',
  styleUrl: './galaxy.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class GalaxyPage {
  protected readonly store = inject(EngineStore);
  protected readonly txt = this.store.txt;
  protected readonly call = this.store.call;
}
