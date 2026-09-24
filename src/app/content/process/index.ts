import { discovery } from './discovery';
import { direction } from './direction';
import { designBuild } from './design-build';
import { launch } from './launch';
import type { PlanetData } from '../types';

// Order = order of the planets in the system and in the page navigation.
export const process: PlanetData[] = [discovery, direction, designBuild, launch];
