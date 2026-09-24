import { Directive, ElementRef, Input, type OnDestroy, inject } from '@angular/core';

type RefFn = ((el: HTMLElement | null) => void) | undefined | null;

/** Mockup "ref" callbacks: called with the element, and with null when it changes or goes away (same as React). */
@Directive({ selector: '[skyRef]' })
export class SkyRef implements OnDestroy {
  private el: HTMLElement = inject(ElementRef).nativeElement;
  private cur: RefFn;
  @Input() set skyRef(fn: RefFn) {
    if (fn === this.cur) return;
    if (typeof this.cur === 'function') this.cur(null);
    this.cur = fn;
    if (typeof fn === 'function') fn(this.el);
  }
  ngOnDestroy() { if (typeof this.cur === 'function') this.cur(null); }
}
