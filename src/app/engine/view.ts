/**
 * renderVals(): turns engine state into the flat values the Angular templates read.
 * Split by screen: galaxy systems and card, system view (planets), planet pages,
 * tutorial, overlays (screenshot viewer, 404), contact form and case-study demos.
 */
import { h } from './vnode';
import { HOME, LOGO, PC, PL, SYS, STR, TILT, clamp, hexRgb } from './data';
import type { EngineCtx, FormField, Palette, PlanetView, StarSystem } from './types';

const MOBILE = 760;
const WIDE = 1100;
const MUTED = '#A9A3C2';
const GHOST_TINT = '242,238,230';
const ERROR = '#FF8FB1';
const HOLD_RING = 169.6;
/** A click right after a hold-jump is ignored (ms). */
const HOLD_CLICK_GUARD = 400;
const HOVER_OUT_MS = 260;
const WORK_SYSTEM = 0;
const CONTACT_SYSTEM = 4;
const CARD_EASE = 'cubic-bezier(.2,.7,.2,1)';
const FORM_FIELDS: FormField[] = ['nome', 'email', 'msg'];

type Ref<T extends Element = HTMLElement> = (el: T | null) => void;
type Vals = Record<string, unknown>;

/** Page content fields a planet can carry (see content/). */
interface PlanetContent extends PlanetView {
  rows?: unknown[];
  lead?: string;
  body?: string;
  items?: unknown[];
  happens?: string;
  gets?: unknown[];
  blocks?: unknown[];
}

interface ViewCtx extends EngineCtx {
  wraps: (HTMLElement | null)[];
  halos: (HTMLElement | null)[];
  holds: (HTMLElement | null)[];
  phalos: (HTMLElement | null)[];
  hold: { i: number; start: number } | null;
  holdFired: { i: number; t: number } | null;
  noCard: number | null;
  lay: { cx: number; cy: number; rx: number[] } | null;
  starEl?: HTMLElement | null;
  orbSvg?: Element | null;
  sky?: HTMLElement | null;
  pIdle?: Element | null;
  pAct?: Element | null;
  hero?: HTMLElement | null;
  hint?: HTMLElement | null;
  orig?: HTMLElement | null;
  navEl?: HTMLElement | null;
  bhBtn?: HTMLElement | null;
  introRing?: Element | null;
  shotFrom?: HTMLElement | null;
  shotBtn?: HTMLElement | null;
  lostBtn?: HTMLElement | null;
  langBusy?: boolean;
  raf: number;

  land(): void;
  lostHome(): void;
  bhClick(): void;
  toggleAudio(): void;
  introDown(e: PointerEvent): void;
  introUp(): void;
  introCancel(): void;
  introClick(): void;
  skipIntro(): void;
  fIn(e: Event): void;
  fBlur(e: Event): void;
  fSubmit(e: Event): void;
  attachMini(kind: 'gal' | 'jump', el: HTMLCanvasElement | null): void;
  aboutGalRef(el: HTMLCanvasElement | null): void;
  jumpDemo(): void;
  veil(label?: string): HTMLDivElement;
  zoomIn(): void;
  zoomOut(): void;
  recenter(): void;
  openMap(): void;
  openList(): void;
  clear(): void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
/** "-Wpx 0 0 -Wpx" centres an absolutely positioned box of size w on its anchor. */
const centreMargin = (w: number) => `-${w / 2}px 0 0 -${w / 2}px`;
const glowShadow = (tint: string, strong: boolean) =>
  `0 0 ${strong ? 24 : 16}px ${strong ? 7 : 4}px rgba(${tint},${strong ? 0.6 : 0.42})`;
/** SVG path of a tilted orbit ellipse with horizontal radius r. */
const orbitPath = (cx: number, cy: number, r: number) => {
  const ry = (r * TILT).toFixed(1);
  const rx = r.toFixed(1);
  const left = `${(cx - r).toFixed(1)} ${cy.toFixed(1)}`;
  const right = `${(cx + r).toFixed(1)} ${cy.toFixed(1)}`;
  return `M${left} A${rx} ${ry} 0 1 0 ${right} A${rx} ${ry} 0 1 0 ${left} `;
};

export const view = {
  renderVals(this: ViewCtx): Vals {
    const { vw, vh, sel, list, phase, here, intro, coach, audio, eggMsg } = this.state;
    const mobile = vw < MOBILE;
    const cardIndex = this.cardIdx();
    const cardSystem = cardIndex >= 0 ? SYS[cardIndex] : SYS[0];
    const cardVisited = cardIndex >= 0 && !!this.state.visited[cardIndex];
    const arrive = phase === 'arrive' || phase === 'page' ? arriveVals(this, mobile) : {};
    const page = phase === 'page' && sel >= 0 ? pageVals(this) : { page: {}, pagePrev: null, pageNext: null };

    return {
      ...arrive,
      ...overlayVals(this),
      ...introVals(this),
      ...coachVals(this, mobile),
      ...formVals(this),
      ...caseStudyVals(this),
      ...page,
      showWordmark: !mobile,
      showRecenterLabel: !mobile,
      crumbDisplay: mobile ? 'none' : 'flex',
      navRef: ((el: HTMLElement | null) => (this.navEl = el)) as Ref,
      bhRef: ((el: HTMLElement | null) => (this.bhBtn = el)) as Ref,
      bhClick: this.bhClick,
      eggMsg,
      zoomRef: ((el: HTMLElement | null) => (this.zoomEl = el)) as Ref,
      pageRef: ((el: HTMLElement | null) => (this.pageEl = el)) as Ref,
      pageTitleRef: ((el: HTMLElement | null) => (this.pageTitle = el)) as Ref,
      audioOn: audio,
      audioAria: audio ? STR.audioOnTurnOff : STR.audioOffTurnOn,
      audioWave: audio ? 'M13 7.5a3.5 3.5 0 0 1 0 5M15.2 5.2a6.6 6.6 0 0 1 0 9.6' : 'M13 8l4 4M17 8l-4 4',
      toggleAudio: this.toggleAudio,
      switchLang: (e: MouseEvent) => switchLanguage(this, e),
      showPage: phase === 'page' && sel >= 0,
      closePage: this.closePage,

      arriveAnim: this.arriveAnimVal || 'skFade 420ms ease-out',
      orbSvgRef: ((el: Element | null) => (this.orbSvg = el)) as Ref<Element>,
      vw,
      vh,
      skyRef: ((el: HTMLElement | null) => (this.sky = el)) as Ref,
      arriveRef: ((el: HTMLElement | null) => (this.arrive = el)) as Ref,
      pIdleRef: ((el: Element | null) => (this.pIdle = el)) as Ref<Element>,
      heroRef: ((el: HTMLElement | null) => (this.hero = el)) as Ref,
      hintRef: ((el: HTMLElement | null) => (this.hint = el)) as Ref,
      pActRef: ((el: Element | null) => (this.pAct = el)) as Ref<Element>,
      origRef: ((el: HTMLElement | null) => (this.orig = el)) as Ref,
      live: this.state.live,
      showMap: phase === 'map' && !intro,
      showArrive: phase === 'arrive',
      systems: systemVals(this),
      routesOpacity: list ? 0 : 1,
      showHint: vw >= WIDE && sel < 0 && !list,
      ctrlTop: mobile ? '76px' : 'auto',
      ctrlBottom: mobile ? 'auto' : 'max(28px,env(safe-area-inset-bottom))',
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
      recenter: this.recenter,
      listOn: list,
      listLabel: mobile ? (list ? STR.map : STR.list) : list ? STR.mapView2 : STR.listView,
      listKey: mobile ? '' : list ? 'M' : 'L',
      toggleList: list ? this.openMap : this.openList,
      // Hero shortcuts: jump straight into Work or Contact with the usual animation.
      heroWork: () => jumpTo(this, WORK_SYSTEM),
      heroContact: () => jumpTo(this, CONTACT_SYSTEM),
      clearSel: this.clear,
      goHome: this.goHome,
      jump: this.jump,
      backToMap: this.back,

      ...cardVals(this, mobile, vh),
      cardOn: cardIndex >= 0 && !list && phase === 'map',
      heroEyebrow: here === HOME ? STR.skywardDesignDevelopment : STR.youAreHere3 + SYS[here].name,
      sel: {
        ...cardSystem,
        cta:
          cardIndex === HOME
            ? STR.backToHome
            : cardIndex === here
              ? STR.enter + cardSystem.name
              : STR.jumpTo + cardSystem.name,
        route:
          cardIndex === here ? STR.currentPosition : STR.route + SYS[here].name + ' → ' + cardSystem.name,
        visitLabel: cardIndex === here ? STR.youAreHere2 : cardVisited ? STR.visitedLabel : STR.notVisited,
        visitColor: cardVisited || cardIndex === here ? cardSystem.hex : MUTED,
        visitBorder: cardVisited ? `rgba(${cardSystem.tint},.55)` : 'rgba(242,238,230,.22)',
      },
    };
  },
};

/** Selects a system and starts the jump (same as picking it on the map and pressing Enter). */
function jumpTo(ctx: ViewCtx, system: number): void {
  // Clear a leftover hover: the jump targets the card's system, and hover wins over sel there.
  clearTimeout(ctx.hvT);
  ctx.setState({ list: false, hover: -1 });
  ctx.select(system);
  setTimeout(() => ctx.jump(), 0);
}

/** One entry per system on the galaxy map and in the list view. */
function systemVals(ctx: ViewCtx) {
  const { sel, hover, visited, here } = ctx.state;
  return SYS.map((s, i) => {
    const selected = sel === i;
    const hovered = hover === i;
    const active = selected || hovered;
    const wasVisited = !!visited[i] && i !== here;
    const isHere = i === here;
    const minutes = `${s.code} · ${s.min} min`;
    return {
      ...s,
      selected: selected && !s.home,
      isHere,
      listColor: isHere ? s.hex : MUTED,
      tf: 'translate(-22px,-22px)',
      dir: 'row',
      align: 'left',
      op: sel >= 0 && !selected ? 0.5 : 1,
      ringBorder: selected ? '1.5px solid ' + s.hex : `1px solid rgba(${s.tint},.7)`,
      ringOp: !s.home && active ? 1 : 0,
      ringScale: active ? 1 : 0.6,
      core: active ? s.core + 2 : s.core,
      // Visited systems show a hollow dot.
      coreBg: s.home || (wasVisited && !selected) ? 'transparent' : s.hex,
      coreBorder: !s.home && wasVisited && !selected ? '2px solid ' + s.hex : '0 solid transparent',
      glow: s.home ? 'none' : glowShadow(s.tint, active),
      hud: minutes + (wasVisited ? STR.visited : ''),
      aria:
        s.name +
        (isHere ? STR.youAreHere : '') +
        ', ' +
        s.desc +
        STR.distance3 +
        s.min +
        STR.minutes +
        (wasVisited ? STR.visited2 : ''),
      listMeta: isHere ? STR.youAreHere2 : `${s.meta} · ${s.min} min` + (wasVisited ? STR.visited : ''),
      ref: ((el: HTMLElement | null) => (ctx.btns[i] = el)) as Ref,
      wrapRef: ((el: HTMLElement | null) => (ctx.wraps[i] = el)) as Ref,
      haloRef: ((el: HTMLElement | null) => (ctx.halos[i] = el)) as Ref,
      holdRef: ((el: HTMLElement | null) => (ctx.holds[i] = el)) as Ref,
      noMenu: (e: Event) => e.preventDefault(),
      onDown: (e: PointerEvent) => {
        if (e.button !== 0) return;
        ctx.holdFired = null;
        ctx.hold = { i, start: performance.now() };
      },
      onUp: () => {
        if (ctx.hold?.i !== i) return;
        ctx.hold = null;
        const ring = ctx.holds[i];
        if (ring) {
          ring.style.opacity = '0';
          ring.lastElementChild?.setAttribute('stroke-dashoffset', String(HOLD_RING));
        }
      },
      onClick: () => {
        const fired = ctx.holdFired;
        ctx.holdFired = null;
        if (fired && fired.i === i && performance.now() - fired.t < HOLD_CLICK_GUARD) return;
        if (i === HOME) {
          ctx.goHome();
          return;
        }
        if (sel === i) ctx.jump();
        else ctx.select(i);
      },
      onEnter: (e?: PointerEvent | FocusEvent) => {
        if (e && (e as PointerEvent).pointerType === 'touch') return;
        if (ctx.noCard === i && (!e || e.type === 'focus')) return;
        clearTimeout(ctx.hvT);
        ctx.setState({ hover: i });
      },
      onLeave: (e?: PointerEvent | FocusEvent) => {
        if (e && (e as PointerEvent).pointerType === 'touch') return;
        clearTimeout(ctx.hvT);
        ctx.hvT = setTimeout(() => {
          if (!ctx.cardHot) ctx.setState(st => (st.hover === i ? { hover: -1 } : null));
        }, HOVER_OUT_MS);
      },
      onJump: () => {
        if (i === HOME) {
          ctx.goHome();
          return;
        }
        ctx.select(i);
        setTimeout(() => ctx.jump(), 0);
      },
    };
  });
}

/** System card: a side panel on desktop, a bottom sheet on mobile. */
function cardVals(ctx: ViewCtx, mobile: boolean, vh: number): Vals {
  const reduced = ctx.reduced;
  const hover = {
    cardEnter: () => {
      ctx.cardHot = true;
      clearTimeout(ctx.hvT);
    },
    cardLeave: () => {
      ctx.cardHot = false;
      clearTimeout(ctx.hvT);
      ctx.hvT = setTimeout(() => {
        if (!ctx.cardHot) ctx.setState({ hover: -1 });
      }, HOVER_OUT_MS);
    },
  };
  if (mobile)
    return {
      ...hover,
      cardLeft: '0px',
      cardRight: '0px',
      cardTop: 'auto',
      cardBottom: '0px',
      cardWidth: 'auto',
      cardRadius: '16px 16px 0 0',
      cardAnim: `${reduced ? 'skFade' : 'skSheetIn'} 280ms ${CARD_EASE}`,
    };
  return {
    ...hover,
    cardLeft: 'auto',
    cardRight: 'clamp(16px,3vw,32px)',
    cardTop: Math.max(80, (vh - 360) / 2) + 'px',
    cardBottom: 'auto',
    cardWidth: '340px',
    cardRadius: '6px',
    cardAnim: `${reduced ? 'skFade' : 'skCardIn'} 240ms ${CARD_EASE}`,
  };
}

/** System view: orbit layout (also stored in ctx.lay for the overlay) and planet entries. */
function arriveVals(ctx: ViewCtx, mobile: boolean): Vals {
  const { vw, vh, sel, psel, phover } = ctx.state;
  if (sel < 0) return {};
  const system = SYS[sel];
  const planetsData = (PL[system.id] ?? []) as PlanetContent[];
  const count = planetsData.length;
  const leftW = mobile ? 0 : Math.min(460, vw * 0.36);
  const cx = mobile ? vw / 2 : leftW + (vw - leftW) / 2 + 10;
  const cy = mobile ? Math.max(200, vh * 0.34) : Math.max(170, vh * 0.36);
  const maxRadius = mobile
    ? Math.min(vw / 2 - 56, (vh * 0.2) / TILT)
    : Math.min((vw - leftW) / 2 - 70, (vh * 0.36) / TILT);
  const rx = planetsData.map((_, i) =>
    Math.max(60, maxRadius * (count === 1 ? 1 : 0.4 + (0.6 * i) / (count - 1))),
  );
  ctx.lay = { cx, cy, rx };

  let orbitsD = '';
  let ghostD = '';
  planetsData.forEach((p, i) => {
    if (p.ghost) ghostD += orbitPath(cx, cy, rx[i]);
    else orbitsD += orbitPath(cx, cy, rx[i]);
  });

  const planets = planetsData.map((p, i) => planetVals(ctx, p, i, psel === i, phover === i, system));
  const current = psel >= 0 ? planets[psel] : null;
  const starSize = Math.max(70, Math.min(130, maxRadius * 0.32));
  return {
    planets,
    orbitsD,
    ghostD,
    orbitSelD: psel >= 0 ? orbitPath(cx, cy, rx[psel]) : '',
    mapCx: cx,
    mapCy: cy,
    mapCxPct: ((cx / vw) * 100).toFixed(1) + '%',
    mapCyPct: ((cy / vh) * 100).toFixed(1) + '%',
    starSize,
    starMargin: centreMargin(starSize),
    starRef: ((el: HTMLElement | null) => (ctx.starEl = el)) as Ref,
    colTop: mobile ? Math.round(cy + maxRadius * TILT + 90) + 'px' : 'clamp(88px,13vh,130px)',
    colW: mobile ? 'calc(100% - 40px)' : leftW - 56 + 'px',
    planetOnMob: !!current,
    planetOnDesk: false,
    pl: current ? { ...current, cta: current.ghost ? STR.jumpToContact : STR.landOn + current.name } : {},
    panelPos: mobile ? 'fixed' : 'absolute',
    panelLeft: mobile ? '16px' : 'auto',
    panelW: mobile ? 'auto' : '340px',
    landMsg: ctx.state.landMsg,
    land: ctx.land,
    closePlanet: () => ctx.setState({ psel: -1, landMsg: '' }),
  };
}

function planetVals(
  ctx: ViewCtx,
  p: PlanetContent,
  i: number,
  on: boolean,
  hovered: boolean,
  system: StarSystem,
) {
  const idx = pad2(i + 1);
  const palette = (p.c ?? PC['ice']) as Palette;
  const tint = p.ghost ? GHOST_TINT : hexRgb(palette[1]);
  const smallCore = Math.round(clamp(p.size * 0.3, 9, 14));
  const core = smallCore + (hovered ? 2 : 0);
  const ring = (on ? p.size : smallCore) + 14;
  return {
    ...p,
    idx,
    selected: on,
    half: p.size / 2,
    hit: Math.max(44, p.size + 8),
    ringW: p.size * 1.9,
    ringH: p.size * 0.62,
    ring: false,
    tint,
    core: p.ghost ? 12 : core,
    coreM: centreMargin(core),
    coreBg: p.ghost ? 'transparent' : palette[1],
    coreBorder: p.ghost ? '1.5px dashed rgba(242,238,230,.7)' : '0 solid transparent',
    coreGlow: p.ghost ? 'none' : glowShadow(tint, hovered),
    haloSize: p.size + 20,
    haloM: centreMargin(p.size + 20),
    haloRef: ((el: HTMLElement | null) => (ctx.phalos[i] = el)) as Ref,
    glowOp: on ? 0 : 1,
    solidOp: on ? 1 : 0,
    solidScale: on ? 1 : 0.3,
    ringD: ring,
    ringM: centreMargin(ring),
    ringCol: on ? system.hex : `rgba(${tint},.7)`,
    ringOp: on || hovered ? 1 : 0,
    bg: p.ghost
      ? 'rgba(11,10,31,.4)'
      : `radial-gradient(circle at 34% 30%,${palette[0]} 0%,${palette[1]} 40%,${palette[2]} 100%)`,
    border: p.ghost ? '1.5px dashed rgba(242,238,230,.55)' : '0 solid transparent',
    dot: p.ghost ? 'transparent' : palette[1],
    shadow: p.ghost ? 'none' : `0 0 30px 6px rgba(${tint},.4), inset -6px -8px 14px rgba(0,0,0,.35)`,
    idxColor: on ? system.hex : MUTED,
    rowBg: on ? 'rgba(36,31,77,.85)' : 'transparent',
    aria: `${idx} ${p.name}, ${p.kind}`,
    wrapRef: ((el: HTMLElement | null) => (ctx.pwraps[i] = el)) as Ref,
    onSel: () => ctx.setState({ psel: on ? -1 : i, landMsg: '' }),
    onEnter: () => ctx.setState({ phover: i }),
    onLeave: () => ctx.setState(st => (st.phover === i ? { phover: -1 } : null)),
  };
}

const PHOTOS: Record<string, string> = {
  experience: 'assets/about/cristian-laptop.png',
  approach: 'assets/about/cristian-idea.png',
};

/** Planet page content, the step rail and prev / next navigation. */
function pageVals(ctx: ViewCtx): Vals {
  const { sel, psel } = ctx.state;
  const system = SYS[sel];
  const planets = (PL[system.id] ?? []) as PlanetContent[];
  const j = Math.max(0, psel);
  const p = planets[j] ?? planets[0];
  const prev = j > 0 ? planets[j - 1] : null;
  const next = planets[j + 1];
  const hasNext = !!next && !next.ghost;
  const isContact = system.id === 'contact';
  const palette = p.c ?? PC['ice'];
  const type = p.type || 'about';
  const real = planets.filter(q => !q.ghost);
  const photoAlts: Record<string, string> = {
    experience: STR.cristianSMemojiBrown,
    approach: STR.cristianSMemojiWith,
  };

  const page = {
    isCase: type === 'case',
    isService: type === 'service',
    isStep: type === 'step',
    isCrew: type === 'crew',
    isAbout: type === 'about',
    isContact: type === 'contact',
    isForm: type === 'form',
    rows: p.rows || [],
    goCase: () => ctx.openDirect(0, 0),
    rail:
      type === 'step'
        ? real.map((q, qi) => ({
            idx: pad2(qi + 1),
            name: q.name,
            kind: q.kind,
            cur: qi === j ? 'step' : 'false',
            dot: qi === j ? system.hex : qi < j ? `rgba(${system.tint},.45)` : 'transparent',
            dotBorder: qi <= j ? system.hex : 'rgba(242,238,230,.5)',
            border: qi === j ? system.hex : 'rgba(242,238,230,.18)',
            bg: qi === j ? 'rgba(36,31,77,.85)' : 'rgba(21,19,46,.5)',
            go: () => ctx.goPlanet(qi),
          }))
        : [],
    idx: pad2(j + 1),
    total: pad2(real.length),
    name: p.name,
    kind: p.kind,
    desc: p.desc,
    sysName: system.name,
    sysCode: system.code,
    hex: system.hex,
    horizon: `radial-gradient(circle at 50% 0%,${palette[1]} 0%,${palette[2]} 7%,#07060F 38%)`,
    glow: `0 -10px 140px 18px rgba(${system.tint},.32), inset 0 3px 0 ${palette[0]}, inset 0 26px 70px rgba(255,255,255,.16)`,
    ground: palette[2],
    hasPrev: !!prev && !prev.ghost,
    prevIdx: prev ? pad2(j) : '',
    prevName: prev ? prev.name : '',
    nextIdx: hasNext ? pad2(j + 2) : isContact ? STR.galaxy : 'SYS-05',
    nextName: hasNext ? next.name : isContact ? STR.galaxyMap : STR.contact,
    hasPhoto: type === 'about' && ['me', 'experience', 'approach'].includes(p.key),
    photoHex: palette[1],
    phMe: p.key === 'me',
    phExp: p.key === 'experience',
    phAppr: p.key === 'approach',
    photoSrc: PHOTOS[p.key] || 'assets/about/cristian.png',
    photoAlt: photoAlts[p.key] || STR.cristianSMemojiWaving,
    showIntro: !!p.lead,
    lead: p.lead || '',
    body: p.body || '',
    hasBody: !!p.body,
    items: p.items || [],
    happens: p.happens || '',
    gets: p.gets || [],
    blocks: p.blocks || [],
  };
  return {
    page,
    pagePrev: () => ctx.goPlanet(j - 1),
    pageNext: () => {
      if (hasNext) ctx.goPlanet(j + 1);
      else if (isContact) ctx.setState({ phase: 'arrive' }, () => ctx.back());
      else ctx.toContatti();
    },
  };
}

/** Screenshot viewer and the 404 screen, both with focus management. */
function overlayVals(ctx: ViewCtx): Vals {
  const shot = ctx.state['shot'] as { src: string; alt: string } | null;
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  return {
    shotOn: !!shot,
    shotSrc: shot ? shot.src : '',
    shotAlt: shot ? shot.alt : '',
    openShot: (e: Event) => {
      const opener = e.currentTarget as HTMLElement;
      ctx.shotFrom = opener;
      ctx.setState({ shot: { src: opener.dataset['src'], alt: opener.dataset['alt'] } });
    },
    closeShot: (e?: Event) => {
      e?.stopPropagation();
      ctx.setState({ shot: null });
      const opener = ctx.shotFrom;
      if (opener) setTimeout(() => opener.focus({ preventScroll: true }), 30);
    },
    shotImgRef: ((el: HTMLImageElement | null) => {
      const current = ctx.state['shot'] as { src: string } | null;
      if (el && current && el.getAttribute('src') !== current.src) el.setAttribute('src', current.src);
    }) as Ref<HTMLImageElement>,
    shotCloseRef: ((el: HTMLElement | null) => {
      if (el && el !== ctx.shotBtn) {
        ctx.shotBtn = el;
        setTimeout(() => el.focus(), 40);
      }
      if (!el) ctx.shotBtn = null;
    }) as Ref,
    lostBtnRef: ((el: HTMLElement | null) => {
      if (el && el !== ctx.lostBtn) {
        ctx.lostBtn = el;
        setTimeout(() => {
          ctx.lostTrap(true);
          el.focus();
        }, 60);
      }
      if (!el && ctx.lostBtn) {
        ctx.lostBtn = null;
        ctx.lostTrap(false);
      }
    }) as Ref,
    kbdDisp: coarse ? 'none' : 'inline',
    lostOn: !!ctx.state.lost,
    lostPath: ctx.state.lost || '',
    lostHome: ctx.lostHome,
    lostJumps: SYS.filter(s => s.id !== 'home').map(s => ({
      name: s.name,
      hex: s.hex,
      code: s.code,
      go: () => {
        const i = SYS.indexOf(s);
        ctx.lostTrap(false);
        ctx.setState({ lost: null });
        ctx.routePath = '/' + s.id;
        ctx.deps.navigate('/' + s.id, true);
        ctx.openDirect(i, -1);
      },
    })),
  };
}

function introVals(ctx: ViewCtx): Vals {
  const intro = ctx.state.intro;
  const warping = intro === 'warp';
  return {
    introOn: !!intro,
    introReady: intro === 'ready',
    introBg: warping ? 'rgba(7,6,15,0)' : '#07060F',
    introContentOp: warping ? 0 : 1,
    introContentTf: warping ? 'scale(1.12)' : 'none',
    showSkip: intro === 'boot' || intro === 'ready',
    introHint: STR.holdToLaunch,
    introRingRef: ((el: Element | null) => (ctx.introRing = el)) as Ref<Element>,
    introDown: ctx.introDown,
    introUp: ctx.introUp,
    introCancel: ctx.introCancel,
    introClick: ctx.introClick,
    skipIntro: ctx.skipIntro,
    noMenu: (e: Event) => e.preventDefault(),
  };
}

/** Tutorial bubble: step texts and an animated icon per step. */
function coachVals(ctx: ViewCtx, mobile: boolean): Vals {
  const { coach, phase, intro, list } = ctx.state;
  const steps = [
    { t: STR.dragToRotate, d: mobile ? STR.dragWithOneFinger : STR.holdTheMouseButton },
    { t: STR.zoomIn, d: mobile ? STR.pinchWithTwoFingers : STR.useTheScrollWheel },
    { t: STR.enterASystem, d: mobile ? STR.tapASystemTo : STR.hoverASystemTo },
  ];
  return {
    coachOn: coach >= 0 && phase === 'map' && !intro && !list && ctx.cardIdx() < 0,
    coachCount: coach + 1 + ' / 3',
    coachTitle: coach >= 0 ? steps[coach].t : '',
    coachText: coach >= 0 ? steps[coach].d : '',
    coachIcon: coachIcon(coach),
    coachNextLabel: coach < 2 ? STR.next : STR.start,
    coachNext: () => (coach < 2 ? ctx.coachGo(coach + 1) : ctx.coachDone()),
    coachSkip: ctx.coachDone,
    coachTop: mobile ? '136px' : 'auto',
    coachBottom: mobile ? 'auto' : '132px',
    coachLeft: mobile ? '50%' : 'auto',
    coachRight: mobile ? 'auto' : 'clamp(16px,3vw,32px)',
    coachTf: mobile ? 'translateX(-50%)' : 'none',
  };
}

/** Animated gesture icons (vnodes, so their CSS animations survive re-renders). */
function coachIcon(step: number) {
  const dot = (animation: string) =>
    h('span', {
      style: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 10,
        height: 10,
        margin: -5,
        borderRadius: '50%',
        background: '#7FE6F2',
        boxShadow: '0 0 12px 3px rgba(127,230,242,.5)',
        animation,
      },
    });
  const box = { position: 'relative', width: 56, height: 56 };
  if (step === 0) return h('span', { key: 'c0', style: box }, dot('skDrag 1.8s ease-in-out infinite'));
  if (step === 1)
    return h(
      'span',
      { key: 'c1', style: box },
      dot('skPinchA 1.8s ease-in-out infinite'),
      dot('skPinchB 1.8s ease-in-out infinite'),
    );
  if (step === 2)
    return h(
      'svg',
      { key: 'c2', width: 44, height: 44, viewBox: '0 0 44 44' },
      h('circle', { cx: 22, cy: 22, r: 18, fill: 'none', stroke: 'rgba(242,238,230,.2)', strokeWidth: 2 }),
      h('circle', {
        cx: 22,
        cy: 22,
        r: 18,
        fill: 'none',
        stroke: '#7FE6F2',
        strokeWidth: 2.5,
        strokeLinecap: 'round',
        strokeDasharray: 113,
        transform: 'rotate(-90 22 22)',
        style: { animation: 'skHoldRing 1.8s ease-in-out infinite' },
      }),
      h('circle', { cx: 22, cy: 22, r: 4, fill: '#7FE6F2' }),
    );
  return null;
}

/** Contact form values; errors replace the helper text under each field. */
function formVals(ctx: ViewCtx): Vals {
  const { fv, fstate, ferr } = ctx.state;
  const sending = fstate === 'sending';
  const help: Record<FormField, string> = { nome: '', email: STR.iLlReplyTo, msg: STR.aFewLinesIs };
  return {
    fv,
    fIn: ctx.fIn,
    fBlur: ctx.fBlur,
    fSubmit: ctx.fSubmit,
    fSending: sending,
    fSent: fstate === 'sent',
    fBtn: sending ? STR.sending2 : STR.sendMessage,
    fBtnOp: sending ? 0.7 : 1,
    fe: Object.fromEntries(
      FORM_FIELDS.map(field => {
        const error = ferr[field];
        return [
          field,
          {
            inv: !!error,
            msg: error || help[field],
            color: error ? ERROR : MUTED,
            border: error ? `1.5px solid ${ERROR}` : '1px solid rgba(242,238,230,.35)',
          },
        ];
      }),
    ),
  };
}

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Case study demos: logo stroke replay, colour/type playground, mini galaxy and jump. */
function caseStudyVals(ctx: ViewCtx): Vals {
  const st = ctx.state;
  const tyIndex = st['tyI'] as number;
  const miniSel = st['miniSel'] as number;
  const jumpBusy = !!st['jumpBusy'];
  const tySystem = SYS[tyIndex];
  const contrast = (luminance(tySystem.hex) + 0.05) / (luminance('#0B0A1F') + 0.05);
  return {
    logoDemo: logoDemo(st['logoPlay'] as number),
    logoReplay: () => ctx.setState(s => ({ logoPlay: (s['logoPlay'] as number) + 1 })),
    tySw: SYS.map((s, i) => ({
      name: s.name,
      hex: s.hex,
      on: i === tyIndex,
      ring: i === tyIndex ? '2px solid ' + s.hex : '1px solid rgba(242,238,230,.25)',
      glow: `rgba(${s.tint},.45)`,
      pick: () => ctx.setState({ tyI: i }),
    })),
    tyHex: tySystem.hex,
    tyName: tySystem.name.toUpperCase(),
    tyCode: tySystem.code,
    tyHexLabel: tySystem.hex,
    tyW: st['tyW'],
    tyWIn: (e: Event) => ctx.setState({ tyW: +(e.target as HTMLInputElement).value }),
    tyCr: contrast.toFixed(1) + ':1',
    miniGalRef: ((el: HTMLCanvasElement | null) => ctx.attachMini('gal', el)) as Ref<HTMLCanvasElement>,
    miniJumpRef: ((el: HTMLCanvasElement | null) => ctx.attachMini('jump', el)) as Ref<HTMLCanvasElement>,
    aboutGalRef: ctx.aboutGalRef,
    mChips: SYS.map((s, i) => ({
      name: s.name,
      hex: s.hex,
      on: i === miniSel,
      ring: i === miniSel ? '1.5px solid ' + s.hex : '1px solid rgba(242,238,230,.25)',
      bg: i === miniSel ? 'rgba(36,31,77,.85)' : 'transparent',
      pick: () => ctx.setState({ miniSel: i }),
    })),
    mSelHex: SYS[miniSel].hex,
    jumpDemo: ctx.jumpDemo,
    jumpBusy,
    jumpOp: jumpBusy ? 0.6 : 1,
    jumpLabel: jumpBusy ? STR.jumping : STR.startTheJumpTo + SYS[miniSel].name,
  };
}

/** The logo drawn as a stroke, then filled. A new key restarts the animation. */
function logoDemo(play: number) {
  return h(
    'svg',
    {
      key: 'lg' + play,
      viewBox: '0 0 1000 1000',
      role: 'img',
      'aria-label': STR.skywardLogo,
      style: { width: '100%', height: '100%' },
    },
    h(
      'g',
      {
        transform: 'matrix(1.577362,0,0,1.577362,-316.787463,-268.230134)',
        fill: '#F2EEE6',
        fillOpacity: 0,
        stroke: SYS[1].hex,
        strokeWidth: 5,
        strokeLinejoin: 'round',
      },
      LOGO.map((d, i) =>
        h('path', {
          key: i,
          d,
          pathLength: 1,
          style: {
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: `skDraw 1800ms ${i * 180}ms cubic-bezier(.65,0,.25,1) forwards, skFillIn 600ms ${1700 + i * 180}ms ease-out forwards`,
          },
        }),
      ),
    ),
  );
}

/** Fades in a veil, then asks the host to load the other language at the same path. */
function switchLanguage(ctx: ViewCtx, e: MouseEvent): void {
  e.preventDefault();
  if (ctx.langBusy) return;
  ctx.langBusy = true;
  const href = (e.currentTarget as HTMLElement).getAttribute('href') ?? '';
  const to = /^it\//.test(href) ? 'it' : 'en';
  try {
    localStorage.setItem('skyward.lang', to);
    sessionStorage.setItem('skyward.langSwitch', '1');
  } catch {
    /* storage blocked */
  }
  // Announced in the language being switched to.
  ctx.setState({ live: to === 'it' ? 'Switching to Italian.' : 'Passaggio all’inglese.' });
  const veil = ctx.veil(to === 'it' ? 'ITALIANO' : 'ENGLISH');
  const fadeMs = ctx.reduced ? 1 : 280;
  requestAnimationFrame(() => {
    veil.style.opacity = '1';
    const label = veil.firstElementChild as HTMLElement | null;
    if (label) label.style.transform = 'none';
  });
  setTimeout(() => {
    cancelAnimationFrame(ctx.raf);
    ctx.raf = 0;
    requestAnimationFrame(() => ctx.deps.switchLang(to, ctx.routePath || '/'));
  }, fadeMs + 60);
}
