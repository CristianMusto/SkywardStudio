import { Component, ViewEncapsulation } from '@angular/core';
// @ts-ignore generated JS engine
import { createEngine } from './engine-it.js';
import { SkyRef } from './sky-ref';
import { SkyVn } from './sky-vn';
import { SkywardHost } from './skyward-host';

@Component({
  selector: 'sky-skyward-it',
  imports: [SkyRef, SkyVn],
  templateUrl: './skyward-it.html',
  styleUrl: './skyward-it.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
})
export class SkywardIt extends SkywardHost {
  constructor() { super('it', createEngine, 'Skyward · La tua idea, in orbita.'); }
}
