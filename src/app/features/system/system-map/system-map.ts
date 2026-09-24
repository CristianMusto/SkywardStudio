import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';

/** System map: orbiting planets, index and planet detail. */
@Component({
  selector: 'sky-system-map',
  imports: [SkyRef],
  templateUrl: './system-map.html',
  styleUrl: './system-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SystemMap extends ViewPart {}
