import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyVn } from '../../../shared/sky-vn';

/** First-visit tutorial steps. */
@Component({
  selector: 'sky-coach',
  imports: [SkyVn],
  templateUrl: './coach.html',
  styleUrl: './coach.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class Coach extends ViewPart {}
