import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** List view: every system without the map. */
@Component({
  selector: 'sky-system-list',
  imports: [],
  templateUrl: './system-list.html',
  styleUrl: './system-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SystemList extends ViewPart {}
