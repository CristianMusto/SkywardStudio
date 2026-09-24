import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../../shared/view-part';
import { SkyRef } from '../../../shared/sky-ref';
import { CaseStudy } from '../case-study/case-study';
import { ServiceDetail } from '../service-detail/service-detail';
import { ProcessStep } from '../process-step/process-step';
import { Crew } from '../crew/crew';
import { AboutDetail } from '../about-detail/about-detail';
import { ContactDetails } from '../contact-details/contact-details';
import { ContactForm } from '../contact-form/contact-form';

/** Planet page shell: header, horizon, body, prev/next. */
@Component({
  selector: 'sky-planet-screen',
  imports: [SkyRef, CaseStudy, ServiceDetail, ProcessStep, Crew, AboutDetail, ContactDetails, ContactForm],
  templateUrl: './planet-screen.html',
  styleUrl: './planet-screen.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class PlanetScreen extends ViewPart {}
