import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** Process planet: stage rail, what happens, what you get. */
@Component({
  selector: 'sky-process-step',
  imports: [],
  templateUrl: './process-step.html',
  styleUrl: './process-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ProcessStep extends ViewPart {}
