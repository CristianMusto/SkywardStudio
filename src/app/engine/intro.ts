// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Intro screen and hold-to-launch. */
import { h } from './vnode';
import { DHOME, STR, clamp } from './data';

export const intro = {
  wantIntro() {
    if (this.shot) return this.shot === 'intro';
    if (this.langIn) return false;
    if (/[?&]return=1/.test(location.search)) return false;
    const m = this.props.intro ?? 'always';
    if (m === 'never') return false;
    if (m === 'always') return true;
    try {
      return localStorage.getItem('skyward.introSeen') !== '1';
    } catch (e) {
      return true;
    }
  },

  markIntro() {
    try {
      localStorage.setItem('skyward.introSeen', '1');
    } catch (e) {}
    clearTimeout(this.introT);
  },

  launch() {
    const st = this.state;
    if (st.intro !== 'ready' && st.intro !== 'boot') return;
    this.heroAt = Infinity;
    this.markIntro();
    this.ihold = null;
    this.revealAt = Infinity;
    const done = () => {
      const n = performance.now();
      let ad = 0;
      if (!this.reduced) {
        ad = 4200;
        this.approach = {
          start: n,
          dur: ad,
          d0: 9000,
          d1: DHOME,
          y0: 0.7 - 1.35,
          y1: 0.7,
          p0: 0.95,
          p1: 0.52,
        };
        this.cam.T = [0, 0, 0];
        this.tgt.T = [0, 0, 0];
        this.tgt.yaw = null;
        this.fadeIn = { start: n, dur: 800, a0: 0.45 };
        this.idle = n + ad + 800;
      }
      this.revealAt = n + ad * 0.72;
      this.heroAt = n + ad;
      this.setState({ intro: null, live: STR.galaxyMapYouAre });
      setTimeout(() => this.startCoach(), ad + 900);
    };
    if (this.reduced) {
      done();
      return;
    }
    this.sfx('jump', 2);
    this.setState({ intro: 'warp' });
    this.warpP.forEach(q => Object.assign(q, this.spawn(true)));
    let bx = this.W / 2,
      by = this.H * 0.6;
    const br =
      this.introRing &&
      this.introRing.ownerSVGElement &&
      this.introRing.ownerSVGElement.getBoundingClientRect();
    if (br && br.width) {
      bx = br.left + br.width / 2;
      by = br.top + br.height / 2;
    }
    this.warp = {
      start: performance.now(),
      dur: 2100,
      handoff: 0.62,
      sx: bx,
      sy: by,
      end: [this.W / 2, this.H * 0.4],
      tint: '255,210,160',
      name: 'Skyward',
      ly: 4.6,
      dir: 1,
      land: done,
    };
  },

  skipIntro() {
    this.markIntro();
    this.warp = null;
    this.ihold = null;
    this.revealAt = performance.now();
    this.setState({ intro: null });
    setTimeout(() => this.startCoach(), 900);
  },

  introDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.ihold = { start: performance.now() };
  },

  introUp() {
    const h = this.ihold;
    if (!h) return;
    this.ihold = null;
    this.ipHandled = true;
    if (this.introRing) this.introRing.setAttribute('stroke-dashoffset', '276.5');
    if (performance.now() - h.start < 300) this.launch();
  },

  introCancel() {
    if (!this.ihold) return;
    this.ihold = null;
    this.ipHandled = true;
    if (this.introRing) this.introRing.setAttribute('stroke-dashoffset', '276.5');
  },

  introClick() {
    if (this.ipHandled) {
      this.ipHandled = false;
      return;
    }
    this.launch();
  },

  updIntroHold(t) {
    const h = this.ihold;
    if (!h || !this.introRing) return;
    const k = clamp((t - h.start - 150) / 1200, 0, 1);
    this.introRing.setAttribute('stroke-dashoffset', (276.5 * (1 - k)).toFixed(1));
    if (k >= 1) {
      this.ihold = null;
      this.launch();
    }
  },
};
