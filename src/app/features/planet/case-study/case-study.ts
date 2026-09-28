import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';
import { SkyVn } from '../../../shared/sky-vn';

/** Skyward case study: logbook, interactive demos and sketchbook. */
@Component({
  selector: 'sky-case-study',
  imports: [SkyRef, SkyVn],
  templateUrl: './case-study.html',
  styleUrl: './case-study.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class CaseStudy extends ViewPart {
  /** The design system's back link (public/design-system-back.html) returns to this exact page and language. */
  protected rememberReturn(): void {
    try {
      sessionStorage.setItem('skyward.dsReturn', location.pathname + location.search);
    } catch {
      /* storage blocked: the back page falls back to the Italian case study */
    }
  }
}
