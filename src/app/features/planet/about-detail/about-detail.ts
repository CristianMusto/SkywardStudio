import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';

/** About planets: memoji, blocks, logos and links. */
@Component({
  selector: 'sky-about-detail',
  imports: [SkyRef],
  templateUrl: './about-detail.html',
  styleUrl: './about-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class AboutDetail extends ViewPart {}
