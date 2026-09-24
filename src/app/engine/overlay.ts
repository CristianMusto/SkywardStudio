// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Positions HTML labels over the canvas. */
import { h } from './vnode';
import { SYS, TILT, clamp, rnd } from './data';

export const overlay = {
  place(P, s, mo) {
    if (this.state.phase !== 'map') return;
    const nowP = performance.now(),
      rv = this.revealAt;
    if (this.navEl) this.navEl.style.visibility = this.egg ? 'hidden' : '';
    if (this.pIdle && this.pIdle.parentNode)
      this.pIdle.parentNode.style.visibility = this.egg ? 'hidden' : '';
    if (this.bhBtn) {
      const b = this.bhScr;
      if (b && !this.egg) {
        const sz = clamp(b.R * 2.6, 44, 220);
        this.bhBtn.style.width = this.bhBtn.style.height = sz + 'px';
        this.bhBtn.style.translate = (b.x - sz / 2).toFixed(1) + 'px ' + (b.y - sz / 2).toFixed(1) + 'px';
        this.bhBtn.style.visibility = 'visible';
      } else this.bhBtn.style.visibility = 'hidden';
    }
    const sel = this.state.sel,
      here = this.state.here,
      routes = this.props.routes ?? true,
      o = P(...SYS[here].p);
    let idle = '',
      act = '';
    this.scr = [];
    SYS.forEach((sy, i) => {
      const p = P(...sy.p),
        w = this.wraps[i];
      this.scr[i] = p;
      if (w) {
        if (p) {
          const fl = p[0] > this.W - 175;
          w.style.translate = p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px';
          w.style.visibility = 'visible';
          w.style.flexDirection = fl ? 'row-reverse' : 'row';
          w.style.transform = fl ? 'translate(calc(-100% + 22px),-22px)' : 'translate(-22px,-22px)';
          if (w.lastElementChild && w.lastElementChild.style) {
            w.lastElementChild.style.textAlign = fl ? 'right' : 'left';
            const Rp = sy.home ? clamp(24 * p[2], 7, 260) : 0,
              ex = Math.max(0, Rp - 8);
            w.lastElementChild.style.marginLeft = fl ? '0px' : ex + 'px';
            w.lastElementChild.style.marginRight = fl ? ex + 'px' : '0px';
          }
        } else w.style.visibility = 'hidden';
      }
      if (w && rv != null) {
        const o = rv === Infinity ? 0 : clamp((nowP - rv - 150 - i * 110) / 420, 0, 1),
          v = o >= 1 ? '' : String(o);
        if (w.firstElementChild) w.firstElementChild.style.opacity = v;
        if (w.lastElementChild) w.lastElementChild.style.opacity = v;
      }
      const h = this.halos[i];
      if (h) {
        const kk = 0.5 + 0.5 * Math.sin(s * 1.05 + i * 1.3);
        h.style.opacity = (mo ? 0.35 + 0.5 * kk : 0.6).toFixed(3);
        h.style.transform = 'scale(' + (mo ? 1 + 0.35 * kk : 1.1).toFixed(3) + ')';
      }
      if (p && o && i !== here) {
        const seg =
          'M' +
          o[0].toFixed(1) +
          ' ' +
          o[1].toFixed(1) +
          ' L' +
          p[0].toFixed(1) +
          ' ' +
          p[1].toFixed(1) +
          ' ';
        if (i === sel) act += seg;
        else idle += seg;
      }
    });
    if (this.pIdle) {
      this.pIdle.setAttribute('d', routes ? idle : '');
      if (mo) this.pIdle.style.strokeDashoffset = (-s * 4).toFixed(1);
    }
    if (this.pAct) {
      this.pAct.setAttribute('d', act);
      if (sel >= 0) this.pAct.setAttribute('stroke', SYS[sel].hex);
      if (mo) this.pAct.style.strokeDashoffset = (-s * 14).toFixed(1);
    }
    if (this.pIdle) {
      if (rv != null) {
        const o = rv === Infinity ? 0 : clamp((nowP - rv - 900) / 700, 0, 1);
        this.pIdle.style.opacity = String(o);
        if (rv !== Infinity && nowP - rv > 2600) {
          this.revealAt = null;
          this.pIdle.style.opacity = '';
        }
      }
    }
    if (this.hero && this.heroAt != null) {
      const ha = this.heroAt,
        o = ha === Infinity ? 0 : clamp((nowP - ha - 150) / 650, 0, 1);
      this.hero.style.animation = 'none';
      this.hero.style.opacity = String(o);
      this.hero.style.transform = 'translateY(' + ((1 - o) * 12).toFixed(1) + 'px)';
      if (ha !== Infinity && nowP - ha > 900) {
        this.heroAt = null;
        this.hero.style.opacity = '';
        this.hero.style.transform = '';
      }
    }
    const now = performance.now();
    if (!this.rc || now - this.rcT > 400) {
      this.rcT = now;
      this.rc = [this.hero, this.hint].map(el => (el && el.isConnected ? el.getBoundingClientRect() : null));
    }
    const hit = rc =>
      rc &&
      this.scr.some(
        p => p && p[0] + 170 > rc.left && p[0] - 22 < rc.right && p[1] + 20 > rc.top && p[1] - 22 < rc.bottom,
      );
    const st = this.state;
    if (this.hero)
      this.hero.style.opacity =
        this.egg || (this.approach && performance.now() - this.approach.start < this.approach.dur * 0.65)
          ? '0'
          : st.sel >= 0 || st.zoomed || hit(this.rc[0])
            ? '.22'
            : '1';
    if (this.hint) this.hint.style.opacity = hit(this.rc[1]) ? '0' : '1';
    if (this.orig) {
      if (o) {
        this.orig.style.translate = o[0].toFixed(1) + 'px ' + o[1].toFixed(1) + 'px';
        this.orig.style.visibility = 'visible';
      } else this.orig.style.visibility = 'hidden';
    }
  },

  placePlanets(dt, s, mo) {
    const L = this.lay,
      st = this.state,
      n = L.rx.length,
      E = this.emerge;
    let e = 1,
      eo = 1,
      es = 1;
    if (E) {
      const q = clamp((performance.now() - E.start) / 1300, 0, 1);
      e = 1 - Math.pow(1 - q, 3);
      es = 1 - Math.pow(1 - clamp(q / 0.8, 0, 1), 2.4);
      eo = clamp((q - 0.12) / 0.5, 0, 1);
      if (q >= 1) this.emerge = null;
    }
    if (this.orbSvg) {
      this.orbSvg.style.transformOrigin = L.cx + 'px ' + L.cy + 'px';
      this.orbSvg.style.transform = e < 1 ? 'scale(' + e.toFixed(3) + ')' : '';
      this.orbSvg.style.opacity = eo < 1 ? eo.toFixed(3) : '';
    }
    const tgt = st.psel >= 0 || st.phover >= 0 ? 0 : 1;
    this.ospd += (tgt - this.ospd) * (1 - Math.pow(0.02, dt));
    for (let i = 0; i < n; i++) {
      if (this.orb[i] == null)
        this.orb[i] = (this.orb0 ?? (this.orb0 = rnd() * 6.283)) + i * 2.4 + rnd() * 0.35;
      this.orb[i] += dt * this.ospd * (mo ? (0.16 * Math.min(mo, 2)) / Math.pow(i + 1, 0.75) : 0);
      const a = this.orb[i] + (1 - e) * 2.4,
        x = L.cx + Math.cos(a) * L.rx[i] * e,
        y = L.cy + Math.sin(a) * L.rx[i] * TILT * e,
        dd = (Math.sin(a) + 1) / 2,
        w = this.pwraps[i];
      const hl = this.phalos[i];
      if (hl) {
        const kk = 0.5 + 0.5 * Math.sin(s * 1.05 + i * 1.7);
        hl.style.scale = (mo ? 1 + 0.3 * kk : 1.1).toFixed(3);
      }
      if (w) {
        const lb = w.lastElementChild;
        if (lb && lb.style) {
          const lw = lb.offsetWidth || 120,
            fl = x + w.offsetWidth / 2 + 8 + lw > innerWidth - 16;
          if (lb._fl !== fl) {
            lb._fl = fl;
            lb.style.left = fl ? 'auto' : 'calc(100% + 8px)';
            lb.style.right = fl ? 'calc(100% + 8px)' : 'auto';
            lb.style.textAlign = fl ? 'right' : 'left';
          }
        }
        w.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
        w.style.scale = ((0.8 + 0.28 * dd) * (0.35 + 0.65 * e)).toFixed(3);
        w.style.zIndex = Math.sin(a) > 0 ? '3' : '1';
        w.style.opacity = ((0.7 + 0.3 * dd) * eo).toFixed(3);
      }
    }
    if (this.starEl) {
      const k = (mo ? 1 + 0.05 * Math.sin(s * 1.3) : 1) * (E ? 1 + (E.s0 - 1) * (1 - es) : 1);
      this.starEl.style.scale = k.toFixed(3);
    }
  },
};
