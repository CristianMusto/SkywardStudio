import { work } from './work';
import { services } from './services';
import { process } from './process';
import { about } from './about';
import { contact } from './contact';
import type { Lang, PlanetData } from './types';

export * from './types';

/** Planet palettes: [light, mid, dark]. */
export const PC: Record<string, string[]> = {
  cyan: ['#E4FBFF', '#5FC8D8', '#0E3A48'],
  gold: ['#FFF4D6', '#E6B04E', '#4A300C'],
  coral: ['#FFE2DA', '#E2654F', '#4A1510'],
  green: ['#E6FFE9', '#5DC878', '#0F3A1C'],
  violet: ['#F0E8FF', '#9C7CF0', '#241452'],
  sand: ['#FFF0E0', '#D69A6A', '#3E2410'],
  ice: ['#F4F8FF', '#9FB6E6', '#1C2A4A'],
};

export const CONTENT: Record<string, PlanetData[]> = {
  work: work,
  services: services,
  process: process,
  about: about,
  contact: contact,
};

const pick = (v: unknown, lang: Lang): unknown => {
  if (Array.isArray(v)) return v.map(x => pick(x, lang));
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>,
      keys = Object.keys(o);
    if (keys.length === 2 && 'en' in o && 'it' in o) return o[lang];
    const out: Record<string, unknown> = {};
    for (const k of keys)
      out[k] = k === 'c' && typeof o[k] === 'string' ? PC[o[k] as string] : pick(o[k], lang);
    return out;
  }
  return v;
};

/** Content in the shape the mockup engine expects (its PL constant). */
export const planetsFor = (lang: Lang) => pick(CONTENT, lang) as Record<string, Record<string, unknown>[]>;
