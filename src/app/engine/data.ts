import type { EngineStrings } from '../i18n/engine-strings';
import type { PlanetView, StarSystem } from './types';

export * from './constants';
export * from './math';

/** Engine strings in the page language. */
export let STR: EngineStrings;
/** Planets per system id, in the page language. */
export let PL: Record<string, PlanetView[]>;
/** The six star systems (Home last). */
export let SYS: StarSystem[];

/** Sets the language-dependent data. Call once before creating the engine. */
export function initData(dict: EngineStrings, planets: Record<string, PlanetView[]>): void {
  STR = dict;
  PL = planets;
  SYS = [
    {
      id: 'work',
      code: 'SYS-01',
      name: STR.work,
      min: 4,
      desc: STR.selectedProjectsStartingWith,
      meta: STR.n1Planet,
      hex: '#7FE6F2',
      tint: '127,230,242',
      core: 12,
      p: [380, 40, -210],
    },
    {
      id: 'services',
      code: 'SYS-02',
      name: STR.services,
      min: 3,
      desc: STR.webDesignUiUx,
      meta: STR.n4Planets,
      hex: '#FFD27A',
      tint: '255,210,122',
      core: 11,
      p: [-480, -25, -40],
    },
    {
      id: 'process',
      code: 'SYS-03',
      name: STR.process,
      min: 2,
      desc: STR.fourStagesFromThe,
      meta: STR.n4Stages,
      hex: '#FF7A6B',
      tint: '255,122,107',
      core: 10,
      p: [560, 60, 320],
    },
    {
      id: 'about',
      code: 'SYS-04',
      name: STR.about,
      min: 2,
      desc: STR.whoIAmAnd,
      meta: STR.n3Planets,
      hex: '#8CF0A0',
      tint: '140,240,160',
      core: 10,
      p: [30, -40, 500],
    },
    {
      id: 'contact',
      code: 'SYS-05',
      name: STR.contact,
      min: 1,
      desc: STR.tellMeAboutYour,
      meta: STR.n2Planets,
      hex: '#C3A6FF',
      tint: '195,166,255',
      core: 9,
      p: [-240, 70, -560],
    },
    {
      id: 'home',
      code: 'SYS-00',
      name: 'Home',
      min: 1,
      desc: STR.whereEveryRouteStarts,
      meta: STR.homePlanet,
      hex: '#FFB38A',
      tint: '255,179,138',
      core: 10,
      p: [-40, 0, 90],
    },
  ];
}
