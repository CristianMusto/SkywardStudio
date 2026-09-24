import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';

/** Direct contact rows (email). */
@Component({
  selector: 'sky-contact-details',
  imports: [],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ContactDetails extends ViewPart {}
