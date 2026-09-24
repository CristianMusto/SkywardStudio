import { webDesign } from './web-design';
import { uiUx } from './ui-ux';
import { webDevelopment } from './web-development';
import { designSystems } from './design-systems';
import type { PlanetData } from '../types';

// Order = order of the planets in the system and in the page navigation.
export const services: PlanetData[] = [webDesign, uiUx, webDevelopment, designSystems];
