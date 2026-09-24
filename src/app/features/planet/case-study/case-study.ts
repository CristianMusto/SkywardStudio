import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';
import { SkyVn } from '../../../shared/sky-vn';

/** Skyward case study: logbook, interactive demos and final screens. */
@Component({
  selector: 'sky-case-study',
  imports: [SkyRef, SkyVn],
  templateUrl: './case-study.html',
  styleUrl: './case-study.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class CaseStudy extends ViewPart {}
