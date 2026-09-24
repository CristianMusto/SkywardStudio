// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Pointer, wheel, keyboard and zoom controls. */
import { DMAX, DMIN, PL, SYS, STR, clamp } from './data';

export const input = {
  pDown(e) {
    if (this.egg || this.state.intro || this.approach) return;
    this.down = { x: e.clientX, y: e.clientY, t: performance.now() };
    this.sky.setPointerCapture && this.sky.setPointerCapture(e.pointerId);
    this.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.drag = true;
    this.vel = 0;
    this.rot = e.button === 2 || e.shiftKey;
    this.tgt.yaw = null;
    this.idle = performance.now();
    this.sky.style.cursor = 'grabbing';
    this.pinch = null;
  },

  pMove(e) {
    const p = this.ptr.get(e.pointerId);
    if (!p) return;
    if (this.ptr.size === 1) {
      const dx = e.clientX - p.x,
        dy = e.clientY - p.y;
      if (this.cs === 0) {
        this.cDrag = (this.cDrag || 0) + Math.abs(dx) + Math.abs(dy);
        if (this.cDrag > 140) this.coachGo(1);
      }
      if (!(this.rot || e.shiftKey)) {
        this.cam.yaw -= dx * 0.0055;
        this.vel = -dx * 0.0055;
        this.cam.pitch = this.tgt.pitch = clamp(this.cam.pitch + dy * 0.0045, -0.6, 1.45);
      } else {
        const { r, u } = this.basis(),
          k = this.cam.dist / (this.F || 800),
          T = this.cam.T;
        for (let j = 0; j < 3; j++) {
          T[j] += (-r[j] * dx + u[j] * dy) * k;
        }
        const L = Math.hypot(T[0], T[2]);
        if (L > 1500) {
          T[0] *= 1500 / L;
          T[2] *= 1500 / L;
        }
        T[1] = clamp(T[1], -600, 600);
        this.tgt.T = [...T];
      }
    }
    p.x = e.clientX;
    p.y = e.clientY;
    if (this.ptr.size === 2) {
      const [a, b] = [...this.ptr.values()],
        d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch) {
        this.zoomBy(this.pinch / d);
        this.coachAct(1);
      }
      this.pinch = d;
    }
    this.idle = performance.now();
  },

  pUp(e) {
    const d0 = this.down;
    this.down = null;
    if (
      d0 &&
      e.type === 'pointerup' &&
      Math.hypot(e.clientX - d0.x, e.clientY - d0.y) < 5 &&
      performance.now() - d0.t < 500 &&
      this.state.phase === 'map'
    ) {
      if (this.state.sel >= 0) this.clear();
      else if (this.state.hover >= 0) this.setState({ hover: -1 });
    }
    this.ptr.delete(e.pointerId);
    if (!this.ptr.size) {
      this.drag = false;
      this.sky.style.cursor = 'grab';
    }
    this.pinch = null;
    this.idle = performance.now();
  },

  wheel(e) {
    e.preventDefault();
    if (this.egg || this.state.intro || this.approach) return;
    this.coachAct(1);
    this.zoomBy(Math.exp(e.deltaY * 0.0013));
    this.idle = performance.now();
  },

  zoomBy(k) {
    this.tgt.dist = clamp(this.tgt.dist * k, DMIN, DMAX);
  },

  clear() {
    const i = this.state.hover >= 0 ? this.state.hover : this.state.sel;
    this.fly(-1);
    this.cardHot = false;
    clearTimeout(this.hvT);
    this.noCard = i;
    this.setState({ sel: -1, hover: -1, list: false });
    if (i >= 0 && this.btns[i]) {
      const b = this.btns[i];
      b.focus({ preventScroll: true });
      const off = () => {
        this.noCard = null;
        b.removeEventListener('blur', off);
        b.removeEventListener('pointerleave', off);
      };
      b.addEventListener('blur', off);
      b.addEventListener('pointerleave', off);
    }
  },

  recenter() {
    this.fly(-1);
    this.setState({ sel: -1, live: STR.mapRecentered });
  },

  zoomIn() {
    this.zoomBy(0.7);
    this.idle = performance.now();
  },

  zoomOut() {
    this.zoomBy(1 / 0.7);
    this.idle = performance.now();
  },

  key(e) {
    if (this.state.shot) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.setState({ shot: null });
        const b = this.shotFrom;
        if (b) setTimeout(() => b.focus({ preventScroll: true }), 30);
      }
      return;
    }
    if (this.state.lost) {
      if (e.key === 'Escape') this.lostHome();
      return;
    }
    const st = this.state;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const k = e.key.toLowerCase();
    if (st.intro) return;
    if (st.phase === 'page') {
      const L0 = PL[SYS[st.sel].id] || [];
      if (k === 'escape' || k === 'm') {
        e.preventDefault();
        this.closePage();
        return;
      }
      if (k === 'arrowleft' && st.psel > 0 && !L0[st.psel - 1].ghost) {
        this.goPlanet(st.psel - 1);
        return;
      }
      if (k === 'arrowright') {
        const nx = L0[st.psel + 1];
        if (nx && !nx.ghost) this.goPlanet(st.psel + 1);
        return;
      }
      return;
    }
    if (st.phase === 'arrive') {
      const pl = PL[SYS[st.sel].id] || [];
      if (k === 'escape') {
        e.preventDefault();
        if (st.psel >= 0) this.setState({ psel: -1, landMsg: '' });
        else this.back();
        return;
      }
      if (k === 'm') {
        e.preventDefault();
        this.back();
        return;
      }
      if (['arrowright', 'arrowdown', 'arrowleft', 'arrowup'].includes(k) && pl.length) {
        e.preventDefault();
        const dir = k === 'arrowright' || k === 'arrowdown' ? 1 : -1;
        this.setState({
          psel: st.psel < 0 ? (dir > 0 ? 0 : pl.length - 1) : (st.psel + dir + pl.length) % pl.length,
          landMsg: '',
        });
        return;
      }
      if (
        k === 'enter' &&
        st.psel >= 0 &&
        (e.target === document.body || !e.target.closest || !e.target.closest('button'))
      ) {
        e.preventDefault();
        this.land();
        return;
      }
      return;
    }
    if (st.phase !== 'map') return;
    if (k === 'm') {
      e.preventDefault();
      if (st.list) this.openMap();
      else if (st.sel >= 0) this.clear();
      return;
    }
    if (k === 'l') {
      e.preventDefault();
      if (!st.list) this.openList();
      return;
    }
    if (k === 'escape' && this.cs >= 0) {
      this.coachDone();
      return;
    }
    if (k === 'escape') {
      if (st.list) this.openMap();
      else if (st.sel >= 0) this.clear();
      return;
    }
    if (st.list) return;
    if (k === '+' || k === '=') {
      this.zoomIn();
      return;
    }
    if (k === '-' || k === '_') {
      this.zoomOut();
      return;
    }
    if (k === 'q') {
      this.vel = -0.05;
      this.idle = performance.now();
      return;
    }
    if (k === 'e') {
      this.vel = 0.05;
      this.idle = performance.now();
      return;
    }
    if (k === 'r' || k === '0') {
      this.recenter();
      return;
    }
    const n = SYS.length;
    if (['arrowright', 'arrowdown', 'arrowleft', 'arrowup'].includes(k)) {
      e.preventDefault();
      const dir = k === 'arrowright' || k === 'arrowdown' ? 1 : -1;
      const i = st.sel < 0 ? (dir > 0 ? 0 : n - 1) : (st.sel + dir + n) % n;
      this.select(i);
      this.btns[i] && this.btns[i].focus();
      return;
    }
    if (k === 'enter' && st.sel >= 0 && document.activeElement === this.btns[st.sel]) {
      e.preventDefault();
      this.jump();
    }
  },
};
