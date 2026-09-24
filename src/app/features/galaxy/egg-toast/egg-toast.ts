import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** Black hole easter-egg message. */
@Component({
  selector: 'sky-egg-toast',
  imports: [],
  templateUrl: './egg-toast.html',
  styleUrl: './egg-toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class EggToast extends ViewPart {}
