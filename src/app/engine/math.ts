import { TEMP } from './constants';

/** '#7FE6F2' -> '127,230,242' */
export const hexRgb = (hex: string): string =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');

/** 'Web design' -> 'web-design' */
export const slug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

function readSeed(): number {
  let s = 0;
  try {
    s = Number(sessionStorage.getItem('skyward.seed') ?? 0) || 0;
  } catch {
    /* storage blocked */
  }
  if (!s) {
    s = 1 + Math.floor(Math.random() * 2147483646);
    try {
      sessionStorage.setItem('skyward.seed', String(s));
    } catch {
      /* storage blocked */
    }
  }
  return s;
}

/** Seeded PRNG (mulberry32): the same galaxy for the whole session. */
export const rnd: () => number = (() => {
  let s = readSeed();
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

/** Standard normal sample (Box-Muller). */
export const gauss = (): number => {
  let u = 0;
  while (!u) u = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * rnd());
};

/** Random star colour, weighted by TEMP. */
export const pickT = (): string => {
  let r = rnd();
  for (const [c, w] of TEMP) if ((r -= w) <= 0) return c;
  return TEMP[2][0];
};
