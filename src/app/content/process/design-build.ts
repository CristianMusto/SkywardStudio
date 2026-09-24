import type { PlanetData } from '../types';

export const designBuild: PlanetData = {
  key: 'design-build',
  name: {
    en: 'Design & build',
    it: 'Design e sviluppo',
  },
  type: 'step',
  kind: '3–6 weeks',
  desc: {
    en: 'I design and build the site in short iterations.',
    it: 'Progetto e sviluppo il sito in brevi iterazioni.',
  },
  c: 'coral',
  size: 40,
  happens: {
    en: 'I design the pages and develop them in parallel. I share progress at agreed milestones, and we review each one together before moving on.',
    it: 'Progetto le pagine e le sviluppo in parallelo. Condivido i progressi a milestone concordate e le rivediamo insieme prima di andare avanti.',
  },
  gets: [
    {
      en: 'Milestone reviews',
      it: 'Revisioni alle milestone',
    },
    {
      en: 'Final designs',
      it: 'Design definitivi',
    },
    {
      en: 'A working website',
      it: 'Un sito funzionante',
    },
  ],
};
