import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EngineStore } from '../../core/engine.store';
import { SystemMap } from '../../features/system/system-map/system-map';

/** A star system with its orbiting planets. Route /:lang/:system */
@Component({
  selector: 'sky-system-page',
  imports: [SystemMap],
  templateUrl: './system.html',
  styleUrl: './system.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SystemPage {
  protected readonly store = inject(EngineStore);
  protected readonly txt = this.store.txt;
  protected readonly call = this.store.call;
}
