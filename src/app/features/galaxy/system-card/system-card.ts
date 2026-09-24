import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** Selected system card (desktop card / mobile sheet). */
@Component({
  selector: 'sky-system-card',
  imports: [],
  templateUrl: './system-card.html',
  styleUrl: './system-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SystemCard extends ViewPart {}
