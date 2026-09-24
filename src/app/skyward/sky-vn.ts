import { Component, ElementRef, Input, inject } from '@angular/core';

export interface VNode { t: string; p: Record<string, any>; c: any[] }

/** Minimal createElement used by the mockup engine for its two animated icons. */
export const ReactShim = {
  createElement: (t: string, p: Record<string, any> | null, ...c: any[]): VNode => ({ t, p: p || {}, c: c.flat(Infinity) }),
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const UNITLESS = new Set(['opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'fontWeight', 'lineHeight', 'order', 'zoom', 'fillOpacity', 'strokeOpacity']);
const KEEP_CASE = new Set(['viewBox', 'preserveAspectRatio', 'gradientTransform', 'gradientUnits', 'patternUnits']);

function build(n: any, svg = false): Node {
  if (n == null || typeof n === 'boolean') return document.createTextNode('');
  if (typeof n !== 'object') return document.createTextNode(String(n));
  if (Array.isArray(n)) { const f = document.createDocumentFragment(); n.forEach(c => f.appendChild(build(c, svg))); return f; }
  const isSvg = svg || n.t === 'svg';
  const el = isSvg ? document.createElementNS(SVG_NS, n.t) : document.createElement(n.t);
  for (const [k, v] of Object.entries(n.p || {})) {
    if (k === 'key' || k === 'children' || v == null || v === false || typeof v === 'function') continue;
    if (k === 'style') {
      for (const [sk, sv] of Object.entries(v as Record<string, any>)) {
        const prop = sk.startsWith('--') ? sk : sk.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        (el as HTMLElement).style.setProperty(prop, typeof sv === 'number' && !UNITLESS.has(sk) ? sv + 'px' : String(sv));
      }
      continue;
    }
    const name = k === 'className' ? 'class' : isSvg && !KEEP_CASE.has(k) ? k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) : k;
    el.setAttribute(name, v === true ? '' : String(v));
  }
  for (const c of n.c || []) el.appendChild(build(c, isSvg));
  return el;
}

@Component({ selector: 'sky-vn', template: '', host: { style: 'display:contents' } })
export class SkyVn {
  private host: HTMLElement = inject(ElementRef).nativeElement;
  private key = '';
  @Input() set n(v: any) {
    const k = JSON.stringify(v ?? null);
    if (k === this.key) return;
    this.key = k;
    this.host.replaceChildren();
    if (v != null) this.host.appendChild(build(v));
  }
}
