// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Values exposed to the template. */
import { h } from './vnode';
import { HOME, LOGO, PC, PL, SYS, STR, TILT, clamp, hexRgb } from './data';

export const view = {
  renderVals() {
    const { vw, vh, sel, hover, list, phase, visited, zoomed, here, intro, coach, audio, eggMsg } =
        this.state,
      mob = vw < 760,
      red = this.reduced;
    const systems = SYS.map((s, i) => {
      const isSel = sel === i,
        isHov = hover === i,
        vis = !!visited[i] && i !== here,
        isHere = i === here;
      return {
        ...s,
        selected: isSel && !s.home,
        isHere,
        listColor: isHere ? s.hex : '#A9A3C2',
        tf: 'translate(-22px,-22px)',
        dir: 'row',
        align: 'left',
        op: sel >= 0 && !isSel ? 0.5 : 1,
        ringBorder: isSel ? '1.5px solid ' + s.hex : '1px solid rgba(' + s.tint + ',.7)',
        ringOp: !s.home && (isSel || isHov) ? 1 : 0,
        ringScale: isSel || isHov ? 1 : 0.6,
        core: isSel || isHov ? s.core + 2 : s.core,
        coreBg: s.home || (vis && !isSel) ? 'transparent' : s.hex,
        coreBorder: !s.home && vis && !isSel ? '2px solid ' + s.hex : '0 solid transparent',
        glow: s.home
          ? 'none'
          : '0 0 ' +
            (isHov || isSel ? 24 : 16) +
            'px ' +
            (isHov || isSel ? 7 : 4) +
            'px rgba(' +
            s.tint +
            ',' +
            (isHov || isSel ? 0.6 : 0.42) +
            ')',
        hud: s.code + ' · ' + s.min + ' min' + (vis ? STR.visited : ''),
        aria:
          s.name +
          (isHere ? STR.youAreHere : '') +
          ', ' +
          s.desc +
          STR.distance3 +
          s.min +
          STR.minutes +
          (vis ? STR.visited2 : ''),
        listMeta: isHere ? STR.youAreHere2 : s.meta + ' · ' + s.min + ' min' + (vis ? STR.visited : ''),
        ref: el => {
          this.btns[i] = el;
        },
        wrapRef: el => {
          this.wraps[i] = el;
        },
        haloRef: el => {
          this.halos[i] = el;
        },
        holdRef: el => {
          this.holds[i] = el;
        },
        noMenu: e => e.preventDefault(),
        onDown: e => {
          if (e.button !== 0) return;
          this.holdFired = null;
          this.hold = { i, start: performance.now() };
        },
        onUp: () => {
          if (this.hold && this.hold.i === i) {
            this.hold = null;
            const g = this.holds[i];
            if (g) {
              g.style.opacity = '0';
              g.lastElementChild && g.lastElementChild.setAttribute('stroke-dashoffset', '169.6');
            }
          }
        },
        onClick: () => {
          const hf = this.holdFired;
          this.holdFired = null;
          if (hf && hf.i === i && performance.now() - hf.t < 400) return;
          if (i === HOME) {
            this.goHome();
            return;
          }
          if (sel === i) this.jump();
          else this.select(i);
        },
        onEnter: e => {
          if (e && e.pointerType === 'touch') return;
          if (this.noCard === i && (!e || e.type === 'focus')) return;
          clearTimeout(this.hvT);
          this.setState({ hover: i });
        },
        onLeave: e => {
          if (e && e.pointerType === 'touch') return;
          clearTimeout(this.hvT);
          this.hvT = setTimeout(() => {
            if (!this.cardHot) this.setState(st => (st.hover === i ? { hover: -1 } : null));
          }, 260);
        },
        onJump: () => {
          if (i === HOME) {
            this.goHome();
            return;
          }
          this.select(i);
          setTimeout(() => this.jump(), 0);
        },
      };
    });
    const ci = this.cardIdx(),
      S = ci >= 0 ? SYS[ci] : SYS[0],
      vis = ci >= 0 && !!visited[ci];
    let cardLeft = 'auto',
      cardRight = 'clamp(16px,3vw,32px)',
      cardTop = Math.max(80, (vh - 360) / 2) + 'px',
      cardBottom = 'auto',
      cardWidth = '340px',
      cardRadius = '6px',
      cardAnim = (red ? 'skFade' : 'skCardIn') + ' 240ms cubic-bezier(.2,.7,.2,1)';
    if (mob) {
      cardLeft = '0px';
      cardRight = '0px';
      cardTop = 'auto';
      cardBottom = '0px';
      cardWidth = 'auto';
      cardRadius = '16px 16px 0 0';
      cardAnim = (red ? 'skFade' : 'skSheetIn') + ' 280ms cubic-bezier(.2,.7,.2,1)';
    }
    let arrive = {};
    if ((phase === 'arrive' || phase === 'page') && sel >= 0) {
      const list0 = PL[SYS[sel].id] || [],
        n = list0.length,
        leftW = mob ? 0 : Math.min(460, vw * 0.36),
        cx = mob ? vw / 2 : leftW + (vw - leftW) / 2 + 10,
        cy = mob ? Math.max(200, vh * 0.34) : Math.max(170, vh * 0.36);
      const Rmax = mob
        ? Math.min(vw / 2 - 56, (vh * 0.2) / TILT)
        : Math.min((vw - leftW) / 2 - 70, (vh * 0.36) / TILT);
      const rx = list0.map((_, i) => Math.max(60, Rmax * (n === 1 ? 1 : 0.4 + (0.6 * i) / (n - 1))));
      this.lay = { cx, cy, rx };
      const ell = r =>
        'M' +
        (cx - r).toFixed(1) +
        ' ' +
        cy.toFixed(1) +
        ' A' +
        r.toFixed(1) +
        ' ' +
        (r * TILT).toFixed(1) +
        ' 0 1 0 ' +
        (cx + r).toFixed(1) +
        ' ' +
        cy.toFixed(1) +
        ' A' +
        r.toFixed(1) +
        ' ' +
        (r * TILT).toFixed(1) +
        ' 0 1 0 ' +
        (cx - r).toFixed(1) +
        ' ' +
        cy.toFixed(1) +
        ' ';
      let od = '',
        gd = '';
      list0.forEach((p, i) => {
        if (p.ghost) gd += ell(rx[i]);
        else od += ell(rx[i]);
      });
      const ps = this.state.psel,
        ph = this.state.phover,
        S0 = SYS[sel];
      const planets = list0.map((p, i) => {
        const on = ps === i,
          hv = ph === i,
          idx = String(i + 1).padStart(2, '0');
        return {
          ...p,
          idx,
          selected: on,
          half: p.size / 2,
          hit: Math.max(44, p.size + 8),
          ringW: p.size * 1.9,
          ringH: p.size * 0.62,
          ring: false,
          tint: p.ghost ? '242,238,230' : hexRgb(p.c[1]),
          core: p.ghost ? 12 : Math.round(clamp(p.size * 0.3, 9, 14)) + (hv ? 2 : 0),
          coreM:
            '-' +
            (Math.round(clamp(p.size * 0.3, 9, 14)) + (hv ? 2 : 0)) / 2 +
            'px 0 0 -' +
            (Math.round(clamp(p.size * 0.3, 9, 14)) + (hv ? 2 : 0)) / 2 +
            'px',
          coreBg: p.ghost ? 'transparent' : p.c[1],
          coreBorder: p.ghost ? '1.5px dashed rgba(242,238,230,.7)' : '0 solid transparent',
          coreGlow: p.ghost
            ? 'none'
            : '0 0 ' +
              (hv ? 24 : 16) +
              'px ' +
              (hv ? 7 : 4) +
              'px rgba(' +
              hexRgb(p.c[1]) +
              ',' +
              (hv ? 0.6 : 0.42) +
              ')',
          haloSize: p.size + 20,
          haloM: '-' + (p.size + 20) / 2 + 'px 0 0 -' + (p.size + 20) / 2 + 'px',
          haloRef: el => {
            this.phalos[i] = el;
          },
          glowOp: on ? 0 : 1,
          solidOp: on ? 1 : 0,
          solidScale: on ? 1 : 0.3,
          ringD: (on ? p.size : Math.round(clamp(p.size * 0.3, 9, 14))) + 14,
          ringM:
            '-' +
            ((on ? p.size : Math.round(clamp(p.size * 0.3, 9, 14))) + 14) / 2 +
            'px 0 0 -' +
            ((on ? p.size : Math.round(clamp(p.size * 0.3, 9, 14))) + 14) / 2 +
            'px',
          ringCol: on ? S0.hex : 'rgba(' + (p.ghost ? '242,238,230' : hexRgb(p.c[1])) + ',.7)',
          ringOp: on || hv ? 1 : 0,
          bg: p.ghost
            ? 'rgba(11,10,31,.4)'
            : 'radial-gradient(circle at 34% 30%,' + p.c[0] + ' 0%,' + p.c[1] + ' 40%,' + p.c[2] + ' 100%)',
          border: p.ghost ? '1.5px dashed rgba(242,238,230,.55)' : '0 solid transparent',
          dot: p.ghost ? 'transparent' : p.c[1],
          shadow: p.ghost
            ? 'none'
            : '0 0 30px 6px rgba(' + hexRgb(p.c[1]) + ',.4), inset -6px -8px 14px rgba(0,0,0,.35)',
          idxColor: on ? S0.hex : '#A9A3C2',
          rowBg: on ? 'rgba(36,31,77,.85)' : 'transparent',
          aria: idx + ' ' + p.name + ', ' + p.kind,
          wrapRef: el => {
            this.pwraps[i] = el;
          },
          onSel: () => this.setState({ psel: on ? -1 : i, landMsg: '' }),
          onEnter: () => this.setState({ phover: i }),
          onLeave: () => this.setState(st => (st.phover === i ? { phover: -1 } : null)),
        };
      });
      const P0 = ps >= 0 ? planets[ps] : null,
        ss = Math.max(70, Math.min(130, Rmax * 0.32));
      arrive = {
        planets,
        orbitsD: od,
        ghostD: gd,
        orbitSelD: ps >= 0 ? ell(rx[ps]) : '',
        mapCx: cx,
        mapCy: cy,
        mapCxPct: ((cx / vw) * 100).toFixed(1) + '%',
        mapCyPct: ((cy / vh) * 100).toFixed(1) + '%',
        starSize: ss,
        starMargin: '-' + ss / 2 + 'px 0 0 -' + ss / 2 + 'px',
        starRef: el => {
          this.starEl = el;
        },
        colTop: mob ? Math.round(cy + Rmax * TILT + 90) + 'px' : 'clamp(88px,13vh,130px)',
        colW: mob ? 'calc(100% - 40px)' : leftW - 56 + 'px',
        planetOnMob: !!P0,
        planetOnDesk: false,
        pl: P0 ? { ...P0, cta: P0.ghost ? STR.jumpToContact : STR.landOn + P0.name } : {},
        panelPos: mob ? 'fixed' : 'absolute',
        panelLeft: mob ? '16px' : 'auto',
        panelW: mob ? 'auto' : '340px',
        landMsg: this.state.landMsg,
        land: this.land,
        closePlanet: () => this.setState({ psel: -1, landMsg: '' }),
      };
    }
    const ce = h,
      dot = (anim, extra) =>
        ce('span', {
          style: Object.assign(
            {
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 10,
              height: 10,
              margin: -5,
              borderRadius: '50%',
              background: '#7FE6F2',
              boxShadow: '0 0 12px 3px rgba(127,230,242,.5)',
              animation: anim,
            },
            extra || {},
          ),
        });
    const CS = [
      { t: STR.dragToRotate, d: mob ? STR.dragWithOneFinger : STR.holdTheMouseButton },
      { t: STR.zoomIn, d: mob ? STR.pinchWithTwoFingers : STR.useTheScrollWheel },
      { t: STR.enterASystem, d: mob ? STR.tapASystemTo : STR.hoverASystemTo },
    ];
    let coachIcon = null;
    if (coach === 0)
      coachIcon = ce(
        'span',
        { key: 'c0', style: { position: 'relative', width: 56, height: 56 } },
        dot('skDrag 1.8s ease-in-out infinite'),
      );
    else if (coach === 1)
      coachIcon = ce(
        'span',
        { key: 'c1', style: { position: 'relative', width: 56, height: 56 } },
        dot('skPinchA 1.8s ease-in-out infinite'),
        dot('skPinchB 1.8s ease-in-out infinite'),
      );
    else if (coach === 2)
      coachIcon = ce(
        'svg',
        { key: 'c2', width: 44, height: 44, viewBox: '0 0 44 44' },
        ce('circle', { cx: 22, cy: 22, r: 18, fill: 'none', stroke: 'rgba(242,238,230,.2)', strokeWidth: 2 }),
        ce('circle', {
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
        ce('circle', { cx: 22, cy: 22, r: 4, fill: '#7FE6F2' }),
      );
    let page = {},
      pagePrev = null,
      pageNext = null;
    if (phase === 'page' && sel >= 0) {
      const sy = SYS[sel],
        L0 = PL[sy.id] || [],
        j = Math.max(0, this.state.psel),
        p = L0[j] || L0[0],
        prev = j > 0 ? L0[j - 1] : null,
        nx = L0[j + 1],
        hasNext = !!nx && !nx.ghost,
        isC = sy.id === 'contact',
        ix = n => String(n).padStart(2, '0'),
        c = p.c || PC.ice;
      const tp = p.type || 'about',
        L1 = L0.filter(q => !q.ghost);
      page = {
        isCase: tp === 'case',
        isService: tp === 'service',
        isStep: tp === 'step',
        isCrew: tp === 'crew',
        isAbout: tp === 'about',
        isContact: tp === 'contact',
        isForm: tp === 'form',
        showIntro: tp !== 'form',
        rows: p.rows || [],
        goCase: () => this.openDirect(0, 0),
        rail:
          tp === 'step'
            ? L1.map((q, qi) => ({
                idx: ix(qi + 1),
                name: q.name,
                kind: q.kind,
                cur: qi === j ? 'step' : 'false',
                dot: qi === j ? sy.hex : qi < j ? 'rgba(' + sy.tint + ',.45)' : 'transparent',
                dotBorder: qi <= j ? sy.hex : 'rgba(242,238,230,.5)',
                border: qi === j ? sy.hex : 'rgba(242,238,230,.18)',
                bg: qi === j ? 'rgba(36,31,77,.85)' : 'rgba(21,19,46,.5)',
                go: () => this.goPlanet(qi),
              }))
            : [],
        idx: ix(j + 1),
        total: ix(L0.filter(q => !q.ghost).length),
        name: p.name,
        kind: p.kind,
        desc: p.desc,
        sysName: sy.name,
        sysCode: sy.code,
        hex: sy.hex,
        horizon: 'radial-gradient(circle at 50% 0%,' + c[1] + ' 0%,' + c[2] + ' 7%,#07060F 38%)',
        glow:
          '0 -10px 140px 18px rgba(' +
          sy.tint +
          ',.32), inset 0 3px 0 ' +
          c[0] +
          ', inset 0 26px 70px rgba(255,255,255,.16)',
        ground: c[2],
        hasPrev: !!prev && !prev.ghost,
        prevIdx: prev ? ix(j) : '',
        prevName: prev ? prev.name : '',
        nextIdx: hasNext ? ix(j + 2) : isC ? STR.galaxy : 'SYS-05',
        nextName: hasNext ? nx.name : isC ? STR.galaxyMap : STR.contact,
      };
      Object.assign(page, {
        hasPhoto: tp === 'about' && ['me', 'experience', 'approach'].includes(p.key),
        photoHex: c[1],
        phMe: p.key === 'me',
        phExp: p.key === 'experience',
        phAppr: p.key === 'approach',
        photoSrc:
          { experience: 'assets/about/cristian-laptop.png', approach: 'assets/about/cristian-idea.png' }[
            p.key
          ] || 'assets/about/cristian.png',
        photoAlt:
          { experience: STR.cristianSMemojiBrown, approach: STR.cristianSMemojiWith }[p.key] ||
          STR.cristianSMemojiWaving,
        showIntro: !!p.lead,
        lead: p.lead || '',
        body: p.body || '',
        hasBody: !!p.body,
        items: p.items || [],
        happens: p.happens || '',
        gets: p.gets || [],
        blocks: p.blocks || [],
      });
      pagePrev = () => this.goPlanet(j - 1);
      pageNext = () => {
        if (hasNext) this.goPlanet(j + 1);
        else if (isC) this.setState({ phase: 'arrive' }, () => this.back());
        else this.toContatti();
      };
    }
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    const extra = {
      shotOn: !!this.state.shot,
      shotSrc: this.state.shot ? this.state.shot.src : '',
      shotAlt: this.state.shot ? this.state.shot.alt : '',
      openShot: e => {
        const d = e.currentTarget.dataset;
        this.shotFrom = e.currentTarget;
        this.setState({ shot: { src: d.src, alt: d.alt } });
      },
      closeShot: e => {
        if (e) e.stopPropagation();
        this.setState({ shot: null });
        const b = this.shotFrom;
        if (b) setTimeout(() => b.focus({ preventScroll: true }), 30);
      },
      shotImgRef: el => {
        if (el && this.state.shot && el.getAttribute('src') !== this.state.shot.src)
          el.setAttribute('src', this.state.shot.src);
      },
      shotCloseRef: el => {
        if (el && el !== this.shotBtn) {
          this.shotBtn = el;
          setTimeout(() => el.focus(), 40);
        }
        if (!el) this.shotBtn = null;
      },
      lostBtnRef: el => {
        if (el && el !== this.lostBtn) {
          this.lostBtn = el;
          setTimeout(() => {
            this.lostTrap(true);
            el.focus();
          }, 60);
        }
        if (!el && this.lostBtn) {
          this.lostBtn = null;
          this.lostTrap(false);
        }
      },
      kbdDisp: coarse ? 'none' : 'inline',
      lostOn: !!this.state.lost,
      lostPath: this.state.lost || '',
      lostHome: this.lostHome,
      lostJumps: SYS.filter(s => s.id !== 'home').map(s => ({
        name: s.name,
        hex: s.hex,
        code: s.code,
        go: () => {
          const i = SYS.indexOf(s);
          this.lostTrap(false);
          this.setState({ lost: null });
          this.routePath = '/' + s.id;
          this.deps.navigate('/' + s.id, true);
          this.openDirect(i, -1);
        },
      })),
      showWordmark: !mob,
      showRecenterLabel: !mob,
      crumbDisplay: mob ? 'none' : 'flex',
      navRef: el => {
        this.navEl = el;
      },
      bhRef: el => {
        this.bhBtn = el;
      },
      bhClick: this.bhClick,
      eggMsg,
      zoomRef: el => {
        this.zoomEl = el;
      },
      pageRef: el => {
        this.pageEl = el;
      },
      pageTitleRef: el => {
        this.pageTitle = el;
      },
      audioOn: audio,
      audioAria: audio ? STR.audioOnTurnOff : STR.audioOffTurnOn,
      audioWave: audio ? 'M13 7.5a3.5 3.5 0 0 1 0 5M15.2 5.2a6.6 6.6 0 0 1 0 9.6' : 'M13 8l4 4M17 8l-4 4',
      toggleAudio: this.toggleAudio,
      introOn: !!intro,
      introReady: intro === 'ready',
      introBg: intro === 'warp' ? 'rgba(7,6,15,0)' : '#07060F',
      introContentOp: intro === 'warp' ? 0 : 1,
      introContentTf: intro === 'warp' ? 'scale(1.12)' : 'none',
      showSkip: intro === 'boot' || intro === 'ready',
      introHint: STR.holdToLaunch,
      introRingRef: el => {
        this.introRing = el;
      },
      introDown: this.introDown,
      introUp: this.introUp,
      introCancel: this.introCancel,
      introClick: this.introClick,
      skipIntro: this.skipIntro,
      noMenu: e => e.preventDefault(),
      coachOn: coach >= 0 && phase === 'map' && !intro && !list && this.cardIdx() < 0,
      coachCount: coach + 1 + ' / 3',
      coachTitle: coach >= 0 ? CS[coach].t : '',
      coachText: coach >= 0 ? CS[coach].d : '',
      coachIcon,
      coachNextLabel: coach < 2 ? STR.next : STR.start,
      coachNext: () => (coach < 2 ? this.coachGo(coach + 1) : this.coachDone()),
      coachSkip: this.coachDone,
      coachTop: mob ? '136px' : 'auto',
      coachBottom: mob ? 'auto' : '132px',
      coachLeft: mob ? '50%' : 'auto',
      coachRight: mob ? 'auto' : 'clamp(16px,3vw,32px)',
      coachTf: mob ? 'translateX(-50%)' : 'none',
      fv: this.state.fv,
      fIn: this.fIn,
      fBlur: this.fBlur,
      fSubmit: this.fSubmit,
      fSending: this.state.fstate === 'sending',
      fSent: this.state.fstate === 'sent',
      fBtn: this.state.fstate === 'sending' ? STR.sending2 : STR.sendMessage,
      fBtnOp: this.state.fstate === 'sending' ? 0.7 : 1,
      fe: Object.fromEntries(
        ['nome', 'email', 'msg'].map(n => {
          const m = this.state.ferr[n];
          const help = { nome: '', email: STR.iLlReplyTo, msg: STR.aFewLinesIs }[n];
          return [
            n,
            {
              inv: !!m,
              msg: m || help,
              color: m ? '#FF8FB1' : '#A9A3C2',
              border: m ? '1.5px solid #FF8FB1' : '1px solid rgba(242,238,230,.35)',
            },
          ];
        }),
      ),
      logoDemo: (() => {
        const lp = this.state.logoPlay,
          hx = SYS[1].hex;
        return ce(
          'svg',
          {
            key: 'lg' + lp,
            viewBox: '0 0 1000 1000',
            role: 'img',
            'aria-label': STR.skywardLogo,
            style: { width: '100%', height: '100%' },
          },
          ce(
            'g',
            {
              transform: 'matrix(1.577362,0,0,1.577362,-316.787463,-268.230134)',
              fill: '#F2EEE6',
              fillOpacity: 0,
              stroke: hx,
              strokeWidth: 5,
              strokeLinejoin: 'round',
            },
            LOGO.map((d, i) =>
              ce('path', {
                key: i,
                d,
                pathLength: 1,
                style: {
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation:
                    'skDraw 1800ms ' +
                    i * 180 +
                    'ms cubic-bezier(.65,0,.25,1) forwards, skFillIn 600ms ' +
                    (1700 + i * 180) +
                    'ms ease-out forwards',
                },
              }),
            ),
          ),
        );
      })(),
      logoReplay: () => this.setState(st => ({ logoPlay: st.logoPlay + 1 })),
      tySw: SYS.map((s, i) => ({
        name: s.name,
        hex: s.hex,
        on: i === this.state.tyI,
        ring: i === this.state.tyI ? '2px solid ' + s.hex : '1px solid rgba(242,238,230,.25)',
        glow: 'rgba(' + s.tint + ',.45)',
        pick: () => this.setState({ tyI: i }),
      })),
      tyHex: SYS[this.state.tyI].hex,
      tyName: SYS[this.state.tyI].name.toUpperCase(),
      tyCode: SYS[this.state.tyI].code,
      tyHexLabel: SYS[this.state.tyI].hex,
      tyW: this.state.tyW,
      tyWIn: e => this.setState({ tyW: +e.target.value }),
      tyCr: (() => {
        const L = h => {
          const c = [1, 3, 5]
            .map(i => parseInt(h.slice(i, i + 2), 16) / 255)
            .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        };
        const a = L(SYS[this.state.tyI].hex),
          b = L('#0B0A1F');
        return ((a + 0.05) / (b + 0.05)).toFixed(1) + ':1';
      })(),
      miniGalRef: el => this.attachMini('gal', el),
      switchLang: e => {
        e.preventDefault();
        if (this.langBusy) return;
        this.langBusy = true;
        const a = e.currentTarget.getAttribute('href'),
          to = /^it\//.test(a) ? 'it' : 'en';
        try {
          localStorage.setItem('skyward.lang', to);
          sessionStorage.setItem('skyward.langSwitch', '1');
        } catch (_) {}
        this.setState({ live: to === 'it' ? 'Switching to Italian.' : 'Passaggio all’inglese.' });
        const v = this.veil(to === 'it' ? 'ITALIANO' : 'ENGLISH');
        const d = this.reduced ? 1 : 280;
        requestAnimationFrame(() => {
          v.style.opacity = '1';
          const t = v.firstElementChild;
          if (t) t.style.transform = 'none';
        });
        setTimeout(() => {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
          requestAnimationFrame(() => this.deps.switchLang(to, this.routePath || '/'));
        }, d + 60);
      },
      aboutGalRef: this.aboutGalRef,
      miniJumpRef: el => this.attachMini('jump', el),
      mChips: SYS.map((s, i) => ({
        name: s.name,
        hex: s.hex,
        on: i === this.state.miniSel,
        ring: i === this.state.miniSel ? '1.5px solid ' + s.hex : '1px solid rgba(242,238,230,.25)',
        bg: i === this.state.miniSel ? 'rgba(36,31,77,.85)' : 'transparent',
        pick: () => this.setState({ miniSel: i }),
      })),
      mSelHex: SYS[this.state.miniSel].hex,
      jumpDemo: this.jumpDemo,
      jumpBusy: this.state.jumpBusy,
      jumpOp: this.state.jumpBusy ? 0.6 : 1,
      jumpLabel: this.state.jumpBusy ? STR.jumping : STR.startTheJumpTo + SYS[this.state.miniSel].name,
      showPage: phase === 'page' && sel >= 0,
      page,
      closePage: this.closePage,
      pagePrev,
      pageNext,
    };
    return {
      ...arrive,
      ...extra,
      arriveAnim: this.arriveAnimVal || 'skFade 420ms ease-out',
      orbSvgRef: el => {
        this.orbSvg = el;
      },
      vw,
      vh,
      skyRef: el => {
        this.sky = el;
      },
      arriveRef: el => {
        this.arrive = el;
      },
      pIdleRef: el => {
        this.pIdle = el;
      },
      heroRef: el => {
        this.hero = el;
      },
      hintRef: el => {
        this.hint = el;
      },
      pActRef: el => {
        this.pAct = el;
      },
      origRef: el => {
        this.orig = el;
      },
      live: this.state.live,
      showMap: phase === 'map' && !intro,
      showArrive: phase === 'arrive',
      systems,
      routesOpacity: list ? 0 : 1,
      showHint: vw >= 1100 && sel < 0 && !list,
      ctrlTop: mob ? '76px' : 'auto',
      ctrlBottom: mob ? 'auto' : 'max(28px,env(safe-area-inset-bottom))',
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
      recenter: this.recenter,
      listOn: list,
      listLabel: mob ? (list ? STR.map : STR.list) : list ? STR.mapView2 : STR.listView,
      listKey: mob ? '' : list ? 'M' : 'L',
      toggleList: list ? this.openMap : this.openList,
      goContatti: () => {
        this.setState({ list: false });
        this.select(4);
        setTimeout(() => this.btns[4] && this.btns[4].focus(), 30);
      },
      clearSel: this.clear,
      goHome: this.goHome,
      jump: this.jump,
      backToMap: this.back,
      cardOn: ci >= 0 && !list && phase === 'map',
      cardEnter: () => {
        this.cardHot = true;
        clearTimeout(this.hvT);
      },
      cardLeave: () => {
        this.cardHot = false;
        clearTimeout(this.hvT);
        this.hvT = setTimeout(() => {
          if (!this.cardHot) this.setState({ hover: -1 });
        }, 260);
      },
      cardLeft,
      cardRight,
      cardTop,
      cardBottom,
      cardWidth,
      cardRadius,
      cardAnim,
      heroEyebrow: here === HOME ? STR.skywardDesignDevelopment : STR.youAreHere3 + SYS[here].name,
      sel: {
        ...S,
        cta: ci === HOME ? STR.backToHome : ci === here ? STR.enter + S.name : STR.jumpTo + S.name,
        route: ci === here ? STR.currentPosition : STR.route + SYS[here].name + ' → ' + S.name,
        visitLabel: ci === here ? STR.youAreHere2 : vis ? 'visited' : STR.notVisited,
        visitColor: vis || ci === here ? S.hex : '#A9A3C2',
        visitBorder: vis ? 'rgba(' + S.tint + ',.55)' : 'rgba(242,238,230,.22)',
      },
    };
  },
};
