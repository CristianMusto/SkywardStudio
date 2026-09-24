import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';

/** Intro: logo draw, system checks, hold to launch. */
@Component({
  selector: 'sky-intro-screen',
  imports: [SkyRef],
  templateUrl: './intro-screen.html',
  styleUrl: './intro-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class IntroScreen extends ViewPart {}
