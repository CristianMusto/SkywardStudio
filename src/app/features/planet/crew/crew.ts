import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** Crew planet (placeholder portraits). */
@Component({
  selector: 'sky-crew',
  imports: [],
  templateUrl: './crew.html',
  styleUrl: './crew.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class Crew extends ViewPart {}
