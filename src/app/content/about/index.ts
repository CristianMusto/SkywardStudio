import { me } from './me';
import { experience } from './experience';
import { approach } from './approach';
import type { PlanetData } from '../types';

// Order = order of the planets in the system and in the page navigation.
export const about: PlanetData[] = [me, experience, approach];
