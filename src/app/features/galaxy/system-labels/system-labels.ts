import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';

/** Clickable labels placed over each star system. */
@Component({
  selector: 'sky-system-labels',
  imports: [SkyRef],
  templateUrl: './system-labels.html',
  styleUrl: './system-labels.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SystemLabels extends ViewPart {}
