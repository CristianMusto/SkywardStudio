// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Mount, unmount, update hooks and screenshot mode. */
import { STR } from './data';

export const lifecycle = {
  veil(label) {
    const v = document.createElement('div');
    v.setAttribute('aria-hidden', 'true');
    v.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;background:#0B0A1F;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity 280ms cubic-bezier(.4,0,.2,1);will-change:opacity';
    if (label) {
      const t = document.createElement('span');
      t.textContent = label;
      t.style.cssText =
        "font:400 12px 'Martian Mono',monospace;letter-spacing:.14em;color:#A9A3C2;transform:translateY(6px);transition:transform 280ms cubic-bezier(.2,.7,.2,1)";
      v.appendChild(t);
    }
    document.body.appendChild(v);
    return v;
  },

  componentDidMount() {
    if (this.langIn) {
      try {
        sessionStorage.removeItem('skyward.langSwitch');
      } catch (e) {}
      const de = document.documentElement;
      if (!de.hasAttribute('data-sk-veil')) de.setAttribute('data-sk-veil', '');
      const go = () => {
        de.style.setProperty('--sk-veil', '0');
        setTimeout(
          () => {
            de.removeAttribute('data-sk-veil');
            de.style.removeProperty('--sk-veil');
          },
          this.reduced ? 0 : 640,
        );
      };
      Promise.race([
        document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
        new Promise(r => setTimeout(r, 900)),
      ]).then(() => {
        let n = 0;
        const s = () => {
          if (++n < 5) requestAnimationFrame(s);
          else setTimeout(go, 80);
        };
        requestAnimationFrame(s);
      });
    }
    document.documentElement.lang = STR.langCode;
    this.onResize = () => {
      this.setState({ vw: innerWidth, vh: innerHeight });
      this.sizeCanvas();
    };
    this.onKey = e => this.key(e);
    addEventListener('resize', this.onResize);
    addEventListener('keydown', this.onKey);
    this.cv = document.createElement('canvas');
    this.cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const el = this.sky;
    if (el) {
      el.appendChild(this.cv);
      el.addEventListener('pointerdown', this.pDown);
      el.addEventListener('pointermove', this.pMove);
      el.addEventListener('pointerup', this.pUp);
      el.addEventListener('pointercancel', this.pUp);
      el.addEventListener('wheel', this.wheel, { passive: false });
      el.addEventListener('contextmenu', e => e.preventDefault());
    }
    this.ctx = this.cv.getContext('2d');
    const qp = this.shot ? 'high' : (this.props.quality ?? 'auto'),
      low = innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4;
    this.setQ(qp === 'high' ? 1 : qp === 'low' ? 0.4 : low ? 0.7 : 1);
    this.sizeCanvas();
    this.sprites = {};
    this.seed();
    this.t0 = performance.now();
    this.last = this.t0;
    this.idle = this.t0 - 5000;

    let pref = false;
    try {
      pref = localStorage.getItem('skyward.audio') === '1';
    } catch (e) {}
    if (pref) {
      this.onFirst = () => {
        removeEventListener('pointerdown', this.onFirst, true);
        removeEventListener('keydown', this.onFirst, true);
        if (!this.state.audio) this.toggleAudio();
      };
      addEventListener('pointerdown', this.onFirst, true);
      addEventListener('keydown', this.onFirst, true);
    }
    const dl = this.parseRoute();
    if (dl.bad) {
      this.setState({ lost: '/' + dl.bad, live: STR.pageNotFound });
    } else if (dl.system >= 0) this.openDirect(dl.system, dl.planet);
    else if (this.wantIntro()) {
      this.revealAt = Infinity;
      this.setState({ intro: 'boot' });
      this.introT = setTimeout(
        () =>
          this.setState(st =>
            st.intro === 'boot' ? { intro: 'ready', live: STR.readyPressTheButton } : null,
          ),
        this.reduced ? 300 : 1900,
      );
    } else setTimeout(() => this.startCoach(), 1200);
    if (this.shot) this.runShot();
    const loop = t => {
      this.raf = requestAnimationFrame(loop);
      if (document.hidden) {
        this.last = t;
        this.pt = 0;
        return;
      }
      this.perf(t);
      this.frame(t);
    };
    this.raf = requestAnimationFrame(loop);
  },

  runShot() {
    const s = this.shot,
      q = new URLSearchParams(location.search),
      T = (fn, ms) => setTimeout(fn, ms);
    window.__skyReady = false;
    if (s === 'coach') T(() => this.coachGo(0), 500);
    if (s === 'card') T(() => this.select(+(q.get('sys') || 0)), 500);
    if (s === 'list') T(() => this.openList(), 500);
    if (s === 'formerr')
      T(() => {
        this.fSubmit({ preventDefault() {} });
        const a = document.activeElement;
        if (a && a.blur) a.blur();
      }, 900);
    if (s === 'formsent') T(() => this.setState({ fstate: 'sent' }), 900);
    T(
      () => {
        try {
          let t = performance.now();
          for (let k = 0; k < 90; k++) {
            t += 16.7;
            this.frame(t);
          }
        } catch (e) {
          console.warn(e);
        }
        window.__skyReady = true;
      },
      s === 'intro' ? 2600 : 3200,
    );
  },

  componentWillUnmount() {
    if (this.aboutRO) this.aboutRO.disconnect();
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.miniRaf);
    clearTimeout(this.introT);
    clearTimeout(this.eggT);
    if (this.ac) this.ac.close();
    removeEventListener('resize', this.onResize);
    removeEventListener('keydown', this.onKey);
  },

  componentDidUpdate(pp) {
    const p = this.props;
    if (
      pp.density !== p.density ||
      pp.galaxies !== p.galaxies ||
      pp.constellations !== p.constellations ||
      pp.milkyWay !== p.milkyWay
    )
      this.seed();
    if (pp.quality !== p.quality) {
      const q = p.quality ?? 'auto';
      this.setQ(q === 'high' ? 1 : q === 'low' ? 0.4 : 0.85);
      this.sizeCanvas();
    }
    this.syncRoute();
  },
};
