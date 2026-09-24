import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../shared/view-part';

/** Top bar: logo, language, audio, map/list switch. */
@Component({
  selector: 'sky-site-header',
  imports: [],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SiteHeader extends ViewPart {}
