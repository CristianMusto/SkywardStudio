import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../shared/view-part';
import { SkyRef } from '../../shared/sky-ref';

/** 404: signal lost, back to the galaxy. */
@Component({
  selector: 'sky-not-found',
  imports: [SkyRef],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class NotFound extends ViewPart {}
