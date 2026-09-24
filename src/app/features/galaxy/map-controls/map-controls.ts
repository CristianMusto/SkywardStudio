import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';

/** Map hint and zoom / recenter controls. */
@Component({
  selector: 'sky-map-controls',
  imports: [SkyRef],
  templateUrl: './map-controls.html',
  styleUrl: './map-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class MapControls extends ViewPart {}
