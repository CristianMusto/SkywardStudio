// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Interactive demos in the Skyward case study. */
import { h } from './vnode';
import { HOME, RG, SYS, STR, clamp, gauss, pickT, rnd } from './data';

export const caseDemos = {
  attachMini(kind, el) {
    if (!el) return;
    this.minis = this.minis || {};
    const m = this.minis[kind];
    if (m && m.cv === el) return;
    const o = {
      cv: el,
      ctx: el.getContext('2d'),
      vis: true,
      yaw: 0.7,
      pitch: 0.5,
      drag: null,
      idle: 0,
      parts: kind === 'jump' ? Array.from({ length: 560 }, () => this.spawn(true)) : null,
      run: null,
    };
    if (typeof IntersectionObserver !== 'undefined') {
      o.io = new IntersectionObserver(es => {
        o.vis = es[0].isIntersecting;
      });
      o.io.observe(el);
    }
    if (kind === 'gal') {
      this.miniSeed();
      el.addEventListener('pointerdown', e => {
        el.setPointerCapture && el.setPointerCapture(e.pointerId);
        o.drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
        el.style.cursor = 'grabbing';
      });
      el.addEventListener('pointermove', e => {
        const d = o.drag;
        if (!d) return;
        o.yaw -= (e.clientX - d.x) * 0.006;
        o.pitch = clamp(o.pitch + (e.clientY - d.y) * 0.005, 0.05, 1.4);
        d.x = e.clientX;
        d.y = e.clientY;
        o.idle = performance.now();
      });
      const up = e => {
        const d = o.drag;
        o.drag = null;
        el.style.cursor = 'grab';
        if (d && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 5 && o.scr) {
          const r = el.getBoundingClientRect(),
            px = e.clientX - r.left,
            py = e.clientY - r.top;
          let best = -1,
            bd = 36;
          o.scr.forEach((p, i) => {
            if (p) {
              const dd = Math.hypot(p[0] - px, p[1] - py);
              if (dd < bd) {
                bd = dd;
                best = i;
              }
            }
          });
          if (best >= 0) {
            this.setState({ miniSel: best });
            this.sfx('blip');
          }
        }
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', () => {
        o.drag = null;
      });
    }
    this.minis[kind] = o;
    if (!this.miniRaf) this.miniRaf = requestAnimationFrame(this.miniLoop);
  },

  miniLoop(t) {
    const ms = this.minis || {};
    let any = false;
    for (const k in ms) {
      const m = ms[k];
      if (!m.cv.isConnected) {
        m.io && m.io.disconnect();
        delete ms[k];
        continue;
      }
      any = true;
      const dt = Math.min(0.05, (t - (m.last || t)) / 1000);
      m.last = t;
      if (!m.vis || document.hidden) continue;
      this.fitMini(m);
      if (k === 'gal') this.drawMiniGal(m, t, dt);
      else this.drawMiniJump(m, t, dt);
    }
    this.miniRaf = any ? requestAnimationFrame(this.miniLoop) : 0;
  },

  fitMini(m) {
    const d = Math.min(devicePixelRatio || 1, 2),
      w = m.cv.clientWidth,
      h = m.cv.clientHeight;
    if (m.cv.width !== Math.round(w * d) || m.cv.height !== Math.round(h * d)) {
      m.cv.width = Math.round(w * d);
      m.cv.height = Math.round(h * d);
    }
    m.W = w;
    m.H = h;
    m.d = d;
  },

  miniSeed() {
    if (this.mStars) return;
    this.mStars = [];
    for (let i = 0; i < 1500; i++) {
      const rr = RG * Math.pow(rnd(), 0.72),
        arm = i % 3,
        th = arm * 2.094 + rr * 0.0046 + gauss() * 0.26 * (1 + rr / RG);
      this.mStars.push({
        x: Math.cos(th) * rr + gauss() * 26,
        y: gauss() * (38 * (1 - rr / RG) + 9),
        z: Math.sin(th) * rr + gauss() * 26,
        a: 0.25 + rnd() * 0.6,
        r: rnd() < 0.06 ? 1.6 : 0.9,
        c: pickT(),
      });
    }
  },

  drawMiniGal(m, t, dt) {
    const c = m.ctx,
      W = m.W,
      H = m.H;
    c.setTransform(m.d, 0, 0, m.d, 0, 0);
    if (!m.drag && !this.reduced && t - m.idle > 1500) m.yaw += dt * 0.12;
    const dist = 2500,
      cp = Math.cos(m.pitch),
      C = [dist * cp * Math.sin(m.yaw), dist * Math.sin(m.pitch), dist * cp * Math.cos(m.yaw)],
      l = Math.hypot(...C),
      fw = C.map(v => -v / l);
    let r = [-fw[2], 0, fw[0]];
    const lr = Math.hypot(...r) || 1;
    r = r.map(v => v / lr);
    const u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]];
    const F = Math.min(W, H) * 1.35,
      cx = W / 2,
      cy = H / 2,
      P = (x, y, z) => {
        const dx = x - C[0],
          dy = y - C[1],
          dz = z - C[2],
          zc = dx * fw[0] + dy * fw[1] + dz * fw[2];
        if (zc < 4) return null;
        const q = F / zc;
        return [
          cx + (dx * r[0] + dy * r[1] + dz * r[2]) * q,
          cy - (dx * u[0] + dy * u[1] + dz * u[2]) * q,
          q,
        ];
      };
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#07060F';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const o = P(0, 0, 0);
    if (o) {
      const s = 760 * o[2];
      c.globalAlpha = 0.4;
      c.drawImage(this.sprite('255,210,160', true), o[0] - s / 2, o[1] - s / 2, s, s);
    }
    for (const q of this.mStars) {
      const p = P(q.x, q.y, q.z);
      if (!p || p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H) continue;
      c.globalAlpha = q.a;
      c.fillStyle = 'rgb(' + q.c + ')';
      c.fillRect(p[0], p[1], q.r, q.r);
    }
    const sel = this.state.miniSel;
    m.scr = SYS.map(s => P(...s.p));
    const hp = m.scr[HOME];
    c.globalCompositeOperation = 'source-over';
    if (hp) {
      c.globalAlpha = 1;
      c.strokeStyle = 'rgba(169,163,194,.45)';
      c.setLineDash([2, 6]);
      c.lineWidth = 1;
      c.beginPath();
      m.scr.forEach((p, i) => {
        if (p && i !== HOME) {
          c.moveTo(hp[0], hp[1]);
          c.lineTo(p[0], p[1]);
        }
      });
      c.stroke();
      const sp = m.scr[sel];
      if (sp && sel !== HOME) {
        c.strokeStyle = SYS[sel].hex;
        c.setLineDash([6, 6]);
        c.lineDashOffset = -t / 60;
        c.lineWidth = 1.25;
        c.beginPath();
        c.moveTo(hp[0], hp[1]);
        c.lineTo(sp[0], sp[1]);
        c.stroke();
      }
      c.setLineDash([]);
    }
    SYS.forEach((s, i) => {
      const p = m.scr[i];
      if (!p) return;
      const on = i === sel;
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.9;
      const g = on ? 50 : 32;
      c.drawImage(this.sprite(s.tint, true), p[0] - g / 2, p[1] - g / 2, g, g);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      c.fillStyle = s.hex;
      c.beginPath();
      c.arc(p[0], p[1], on ? 4.5 : 3.5, 0, 6.283);
      c.fill();
      if (on) {
        c.strokeStyle = s.hex;
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(p[0], p[1], 13, 0, 6.283);
        c.stroke();
      }
      c.fillStyle = '#F2EEE6';
      c.font = '600 13px "Bricolage Grotesque", sans-serif';
      c.shadowColor = '#07060F';
      c.shadowBlur = 6;
      c.fillText(s.name, p[0] + 15, p[1] + 4);
      c.shadowBlur = 0;
    });
  },

  drawMiniJump(m, t, dt) {
    const c = m.ctx,
      W = m.W,
      H = m.H;
    c.setTransform(m.d, 0, 0, m.d, 0, 0);
    const R0 = m.run;
    let v = 0.03,
      k = 0;
    if (R0) {
      const el = t - R0.start;
      k = el / R0.dur;
      if (k < 0.28) {
        const q = k / 0.28;
        v = 0.03 + q * q * q * 0.97;
      } else if (k < 0.66) v = 1;
      else if (k < 1) {
        const q = (k - 0.66) / 0.34;
        v = Math.pow(1 - q, 2.4) * 0.97 + 0.03;
      } else v = 0.03;
      if (el > R0.dur + 1500) {
        m.run = null;
        this.setState({ jumpBusy: false });
      }
    }
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#05040C';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    const F = Math.max(W, H) * 0.16,
      cx = W / 2,
      cy = H / 2,
      V = v * 2.1,
      dim = R0 && k > 1 ? 0.35 : 1;
    for (const p of m.parts) {
      p.z -= V * dt;
      if (p.z <= 0.025) {
        Object.assign(p, this.spawn(false));
        continue;
      }
      const z2 = Math.min(1.25, p.z + V * 0.045 + 0.0015),
        x1 = cx + (p.x / p.z) * F,
        y1 = cy + (p.y / p.z) * F,
        x2 = cx + (p.x / z2) * F,
        y2 = cy + (p.y / z2) * F;
      if ((x1 < 0 && x2 < 0) || (x1 > W && x2 > W) || (y1 < 0 && y2 < 0) || (y1 > H && y2 > H)) continue;
      const nr = 1 - p.z,
        al = Math.min(1, p.b * (0.12 + nr * nr * 1.3)) * dim,
        lw = Math.max(0.5, Math.min(2.4, 0.35 + nr * nr * 2.2));
      if (Math.abs(x1 - x2) + Math.abs(y1 - y2) < 1.5) {
        c.globalAlpha = al;
        c.fillStyle = 'rgb(' + p.c + ')';
        c.fillRect(x1, y1, lw, lw);
      } else {
        const g = c.createLinearGradient(x2, y2, x1, y1);
        g.addColorStop(0, 'rgba(' + p.c + ',0)');
        g.addColorStop(1, 'rgba(' + p.c + ',' + al + ')');
        c.globalAlpha = 1;
        c.strokeStyle = g;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x1, y1);
        c.stroke();
      }
    }
    if (R0) {
      const q = clamp((k - 0.6) / 0.4, 0, 1),
        e = q * q * (3 - 2 * q),
        out = k > 1 ? clamp(((k - 1) * R0.dur) / 1500, 0, 1) : 0,
        fade = out > 0.7 ? 1 - (out - 0.7) / 0.3 : 1,
        S = 6 + e * Math.min(W, H) * 0.3;
      c.globalAlpha = (0.25 + 0.75 * e) * fade;
      const h = S * 2.4;
      c.drawImage(this.sprite(R0.tint, true), cx - h / 2, cy - h / 2, h, h);
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.26, 'rgba(' + R0.tint + ',1)');
      g.addColorStop(0.5, 'rgba(' + R0.tint + ',.35)');
      g.addColorStop(1, 'rgba(' + R0.tint + ',0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, S / 2, 0, 6.283);
      c.fill();
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = clamp(k / 0.12, 0, 1) * fade;
      c.textAlign = 'center';
      c.fillStyle = '#F2EEE6';
      c.font = '500 13px "Martian Mono", monospace';
      c.fillText((k < 1 ? STR.jump : 'ARRIVAL · ') + R0.name.toUpperCase(), W / 2, H - 26);
      c.textAlign = 'start';
    } else {
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 0.9;
      c.textAlign = 'center';
      c.fillStyle = '#A9A3C2';
      c.font = '400 12px "Martian Mono", monospace';
      c.fillText(STR.awaitingRoute, W / 2, H - 26);
      c.textAlign = 'start';
    }
    c.globalAlpha = 1;
  },

  jumpDemo() {
    const m = this.minis && this.minis.jump;
    if (!m || m.run) return;
    const s = SYS[this.state.miniSel];
    m.parts.forEach(q => Object.assign(q, this.spawn(true)));
    m.run = { start: performance.now(), dur: this.reduced ? 1 : 2200, tint: s.tint, name: s.name };
    this.setState({ jumpBusy: true, live: STR.demoJumpTo + s.name + '.' });
    this.sfx('jump', 2.2);
  },
};
