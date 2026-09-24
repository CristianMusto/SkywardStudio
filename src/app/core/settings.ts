/** Engine settings (the mockup's Tweaks). Change them here to tune the galaxy. */
export const SKYWARD_SETTINGS: Record<string, unknown> = {
  /** 'first visit' | 'always' | 'never' */
  intro: 'first visit',
  /** 'auto' | 'high' | 'medium' | 'low' */
  quality: 'auto',
  routes: true,
  density: 3000,
  constellations: 60,
  galaxies: 22,
  milkyWay: true,
  blackHole: true,
  motion: 3,
  forceReducedMotion: false,
};
