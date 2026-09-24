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
  skyward/
    engine-it.js / engine-en.js      motore del mockup (generato, non modificare a mano)
    skyward-it.html / skyward-en.html template del mockup convertito in Angular (generato)
    skyward-*.css                    stati hover/focus del mockup (generato)
    skyward-host.ts                  collega il motore ad Angular, invio modulo (Web3Forms)
    sky-ref.ts, sky-vn.ts            supporto per ref e icone animate del mockup
  content/                           pianeti (pagine) in IT + EN, uno per file
public/assets/                       immagini, logo, memoji
public/design-system.html           design system, linkato dal case study
```

Indirizzi: `/it/` e `/en/`; dentro, le pagine usano l'hash come nel mockup (`/it/#/about/experience`).

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

