import type { PlanetData } from '../types';

export const experience: PlanetData = {
  key: 'experience',
  name: {
    en: 'Experience',
    it: 'Esperienza',
  },
  type: 'about',
  kind: {
    en: 'Background',
    it: 'Percorso',
  },
  desc: {
    en: 'Where I have worked so far.',
    it: 'Dove ho lavorato finora.',
  },
  c: 'sand',
  size: 28,
  lead: {
    en: 'Four years of web development, between editorial and tech.',
    it: 'Quattro anni di sviluppo web, tra editoria e tecnologia.',
  },
  blocks: [
    {
      n: '01',
      t: 'NSS Magazine',
      d: {
        en: 'Web development for NSS, a fashion magazine based in Milan.',
        it: 'Sviluppo web per NSS, magazine di moda con sede a Milano.',
      },
      hasLogo: true,
      isNss: true,
      logo: 'assets/about/nss-logo.png',
      logoW: 1340,
      logoH: 460,
      hasLink: true,
      href: 'https://www.nssmag.com/it',
      linkLabel: 'nssmag.com',
      linkAria: {
        en: 'nssmag.com, NSS Magazine website (opens in a new tab)',
        it: 'nssmag.com, sito di NSS Magazine (si apre in una nuova scheda)',
      },
    },
    {
      n: '02',
      t: 'TXT Group',
      d: {
        en: 'Currently working at a TXT Group company in Milan.',
        it: 'Attualmente lavoro in una società del gruppo TXT a Milano.',
      },
      hasLogo: true,
      isTxt: true,
      logo: 'assets/about/txt-logo.png',
      logoW: 770,
      logoH: 372,
      hasLink: true,
      href: 'https://www.txtgroup.com/it/',
      linkLabel: 'txtgroup.com',
      linkAria: {
        en: 'txtgroup.com, TXT Group website (opens in a new tab)',
        it: 'txtgroup.com, sito di TXT Group (si apre in una nuova scheda)',
      },
    },
    {
      n: '03',
      t: 'Skyward',
      d: {
        en: 'My own studio for web design and development.',
        it: 'Il mio studio di web design e sviluppo.',
      },
      hasLogo: true,
      isSky: true,
      logo: 'assets/logo-light.svg',
      logoW: 1000,
      logoH: 1000,
    },
  ],
};
