# Skyward

Sito di Cristian Musto: la home è una galassia, le sezioni sono sistemi stellari e le pagine sono pianeti.
Angular 20, prerender statico, italiano e inglese, pubblicato su GitHub Pages:
https://cristianmusto.github.io/SkywardStudio/

## Avvio

```bash
npm install
npm start          # http://localhost:4200/it
npm run build      # build locale in dist/skyward/browser
```

## Struttura

Il sito è il mockup **Skyward Mappa** portato 1:1: stesso motore (galassia su canvas, salti, orbite, intro, tutorial, audio), stesso markup e stili.

```
src/app/
  layout/shell/               layout persistente /:lang: canvas, intro, 404 (possiede il motore)
  pages/
    galaxy/                   /:lang                  mappa della galassia
    system/                   /:lang/:system          sistema con i pianeti
    planet/                   /:lang/:system/:planet  pagina del pianeta
  layout/site-header/         barra in alto: logo, lingua, audio, mappa/elenco
  features/
    intro/intro-screen/       intro e "tieni premuto per partire"
    galaxy/                   hero, system-labels, map-controls, system-card, system-list, coach, egg-toast
    system/system-map/        mappa del sistema con i pianeti in orbita
    planet/                   planet-page (guscio) + case-study, service-detail, process-step,
                              about-detail, crew, contact-details, contact-form
    not-found/                404
  shared/                     view-part (base dei componenti), sky-ref, sky-vn
  core/                       engine.store (motore <-> router), contact.service, settings, lang.guard
  engine/                     motore della galassia in moduli (scene, navigation, input, router…)
  i18n/                       ui-strings (template) e engine-strings (motore), IT + EN
  content/                    pianeti (pagine), uno per file
public/assets/                immagini, logo, memoji
```

Ogni componente riceve `v` (i valori del motore) e `t` (i testi nella lingua della pagina).

Indirizzi: `/it`, `/it/services`, `/it/about/experience` (e lo stesso con `/en`). Ogni URL è prerenderizzato, quindi i link diretti funzionano su GitHub Pages.

## Stato del refactoring

1. Motore in moduli TypeScript: **fatto**. Riscritti a mano e tipizzati: `types`, `constants`, `math`, `data`, `base`, `vnode`, `quality`, `audio`, `contact-form`, `coach`, `navigation`, `router`. Ancora con `// @ts-nocheck`: gli altri, uno alla volta con `ng build` dopo ciascuno.
2. Un componente per schermata: **fatto**.
3. Routing Angular vero (`/it/about/experience`) con prerender: **fatto**.
4. Un solo template con i18n: **fatto** (testi in `i18n/`).
5. Stili per componente: **fatto** (nessuno stile inline; valori dinamici passati come variabili CSS, es. `[style.--left]`). Prossimo: token condivisi.

## Aggiungere un pianeta (progetto, servizio, fase…)

1. Duplica un file della cartella giusta in `src/app/content/` (es. `services/ui-ux.ts` → `services/branding.ts`).
2. Cambia `key`, testi (`{ en, it }`), palette `c` (cyan, gold, coral, green, violet, sand, ice) e `size`.
3. Aggiungilo all'array nell'`index.ts` della stessa cartella.

Compare sulla mappa del sistema, nell'indice e nella navigazione tra pagine.
Nota: il layout «case» è il diario di bordo di Skyward, scritto nel template. Per un nuovo progetto usa per ora `type: 'service'` (lead, body, items) finché non disegniamo un modello di case study generico.

## Modulo contatti (Web3Forms)

1. Vai su https://web3forms.com, inserisci cristian.musto11@gmail.com e ricevi la access key.
2. Incollala in `src/environments/environment.ts`.

## Pubblicazione

1. Su GitHub: Settings → Pages → Source: **GitHub Actions**.
2. Ogni push su `main` esegue `.github/workflows/deploy.yml`: build con base `/SkywardStudio/`, prerender di tutte le pagine, `404.html` per le route non previste.

