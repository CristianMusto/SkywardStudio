import { Component, ViewEncapsulation } from '@angular/core';
// @ts-ignore generated JS engine
import { createEngine } from './engine-en.js';
import { SkyRef } from './sky-ref';
import { SkyVn } from './sky-vn';
import { SkywardHost } from './skyward-host';

@Component({
  selector: 'sky-skyward-en',
  imports: [SkyRef, SkyVn],
  templateUrl: './skyward-en.html',
  styleUrl: './skyward-en.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
})
export class SkywardEn extends SkywardHost {
  constructor() { super('en', createEngine, 'Skyward · Your idea, in orbit.'); }
}
