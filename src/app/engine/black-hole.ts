// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Black hole rendering and easter egg. */
import { DHOME, HOME, STR, clamp } from './data';

export const blackHole = {
  bhClick() {
    if (this.state.phase !== 'map' || this.egg || this.state.intro) return;
    if (this.reduced) {
      this.setState({ eggMsg: STR.aBlackHoleBest });
      clearTimeout(this.eggT);
      this.eggT = setTimeout(() => this.setState({ eggMsg: '' }), 4000);
      return;
    }
    this.egg = { start: performance.now() };
    this.hold = null;
    this.vel = 0;
    this.tgt.T = [...this.bh.p];
    this.tgt.dist = 380;
    this.tgt.yaw = null;
    this.setState({ sel: -1, hover: -1, eggMsg: '', live: STR.beingPulledIn });
    this.sfx('egg', 2.6);
  },

  drawEgg(c, W, H, t) {
    const e = this.egg;
    if (!e) return;
    const k = (t - e.start) / 2800,
      b = this.bhScr || { x: W / 2, y: H / 2, R: 30 };
    c.globalCompositeOperation = 'source-over';
    if (k < 0.45) {
      const q = k / 0.45,
        rad = Math.max(W, H) * (1.25 - q * 1.05),
        g = c.createRadialGradient(b.x, b.y, Math.max(1, rad * 0.2), b.x, b.y, rad);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,' + (0.2 + q * 0.8) + ')');
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    } else if (k < 0.72) {
      const q = (k - 0.45) / 0.27,
        cx = W / 2,
        cy = H / 2,
        Rm = Math.max(W, H) * 0.7;
      c.globalAlpha = 1;
      c.fillStyle = '#000';
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 280; i++) {
        const u = (i * 0.618 + q * 1.7) % 1,
          r = Rm * Math.pow(1 - u, 1.6),
          a = i * 2.4 + (1 - u) * 9 + q * 7;
        c.globalAlpha = u * 0.9;
        c.fillStyle = i % 3 ? 'rgb(255,200,140)' : 'rgb(183,164,255)';
        const z = 1 + (1 - u) * 2.4;
        c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, z, z);
      }
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(cx, cy, 30 + q * 50, 0, 6.283);
      c.fill();
      c.strokeStyle = 'rgba(255,230,200,.9)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, 32 + q * 50, 0, 6.283);
      c.stroke();
    } else {
      if (!e.reset) {
        e.reset = true;
        Object.assign(this.cam, { yaw: 0.7, pitch: 0.52, dist: DHOME * 1.6, T: [0, 0, 0] });
        this.tgt.T = [0, 0, 0];
        this.tgt.dist = DHOME;
        this.tgt.pitch = 0.52;
        this.vel = 0;
        this.idle = performance.now();
        this.setState({ here: HOME, eggMsg: STR.pastTheEventHorizon, live: STR.youReBackHome });
        clearTimeout(this.eggT);
        this.eggT = setTimeout(() => this.setState({ eggMsg: '' }), 4200);
      }
      const q = (k - 0.72) / 0.28;
      c.globalAlpha = Math.max(0, 0.85 * (1 - q * 1.4));
      c.fillStyle = '#F2F6FF';
      c.fillRect(0, 0, W, H);
    }
    c.globalAlpha = 1;
    if (k >= 1) this.egg = null;
  },

  drawBH(c, x, y, Rp, s, mo) {
    const B = this.bh,
      th = B.tilt,
      k = B.k,
      ct = Math.cos(th),
      st = Math.sin(th),
      rot = s * (mo ? 0.9 : 0);
    const L = (lx, ly) => [x + lx * ct - ly * st, y + lx * st + ly * ct];
    const col = (r, b) => {
      const t = clamp((r - 1.55) / 2.9, 0, 1);
      return t < 0.25 ? '255,246,226' : t < 0.55 ? '255,208,140' : t < 0.8 ? '255,150,82' : '214,86,52';
    };
    c.globalCompositeOperation = 'source-over';
    let g = c.createRadialGradient(x, y, Rp * 0.9, x, y, Rp * 3.2);
    g.addColorStop(0, 'rgba(3,2,10,.95)');
    g.addColorStop(0.35, 'rgba(6,5,18,.55)');
    g.addColorStop(1, 'rgba(11,10,31,0)');
    c.globalAlpha = 1;
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, Rp * 3.2, 0, 6.283);
    c.fill();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.5;
    const ag = Rp * 11;
    c.drawImage(this.sprite('255,150,90', true), x - ag / 2, y - ag / 2, ag, ag);
    c.globalAlpha = 0.12;
    c.strokeStyle = 'rgba(200,190,255,1)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(x, y, Rp * 2.6, 0, 6.283);
    c.stroke();
    const jf = mo ? 0.75 + 0.25 * Math.sin(s * 2.3) : 0.85;
    for (const d of [-1, 1]) {
      const jl = Rp * (3 + (mo ? 0.4 * Math.sin(s * 0.7 + d) : 0)),
        [ex, ey] = L(d * 0, ((-d * jl) / k) * 0.0 + 0);
      const ax = -st * d,
        ay = ct * d;
      const x2 = x + ax * jl,
        y2 = y - ay * jl * -1;
      const jg = c.createLinearGradient(x, y, x + -st * -d * jl, y + ct * -d * jl);
      jg.addColorStop(0, 'rgba(170,200,255,' + 0.22 * jf + ')');
      jg.addColorStop(1, 'rgba(170,200,255,0)');
      c.strokeStyle = jg;
      c.lineWidth = Math.max(1, Rp * 0.18);
      c.lineCap = 'round';
      c.globalAlpha = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + -st * -d * jl, y + ct * -d * jl);
      c.stroke();
    }
    const band = (a0, a1, al) => {
      for (let i = 0; i < 14; i++) {
        const r = (1.6 + i * 0.2) * Rp,
          t = i / 13;
        c.strokeStyle = 'rgba(' + col(1.6 + i * 0.2) + ',' + al * (1 - t * 0.7) + ')';
        c.lineWidth = Rp * 0.22;
        c.globalAlpha = 1;
        c.beginPath();
        c.ellipse(x, y, r, r * k, th, a0, a1);
        c.stroke();
      }
    };
    band(Math.PI, 2 * Math.PI, 0.07);
    for (const q of B.parts) {
      const a = q.a + rot * q.w,
        sa = Math.sin(a);
      if (sa > 0) continue;
      const ca = Math.cos(a),
        dop = 1 + 0.75 * -ca,
        [px, py] = L(ca * q.r * Rp, sa * q.r * Rp * k);
      c.globalAlpha = clamp(q.b * 0.5 * dop, 0, 1);
      c.fillStyle = 'rgb(' + col(q.r) + ')';
      const z = q.s * Math.max(0.6, Rp / 60);
      c.fillRect(px - z / 2, py - z / 2, z, z);
    }
    for (const q of B.parts) {
      if (q.r > 3.4) continue;
      const a = q.a + rot * q.w,
        sa = Math.sin(a);
      if (sa > 0) continue;
      const ca = Math.cos(a),
        rho = (1.12 + (q.r - 1.55) * 0.32) * Rp,
        dop = 1 + 0.75 * -ca;
      let [px, py] = L(ca * rho, -Math.sqrt(Math.max(0, 1 - ca * ca)) * rho * 0.98);
      c.globalAlpha = clamp(q.b * 0.42 * dop, 0, 1);
      c.fillStyle = 'rgb(' + col(q.r) + ')';
      const z = q.s * Math.max(0.6, Rp / 70);
      c.fillRect(px - z / 2, py - z / 2, z, z);
      [px, py] = L(ca * rho * 0.86, Math.sqrt(Math.max(0, 1 - ca * ca)) * rho * 0.8);
      c.globalAlpha = clamp(q.b * 0.16 * dop, 0, 1);
      c.fillRect(px - z / 2, py - z / 2, z, z);
    }
    for (let i = 0; i < 5; i++) {
      const rr = Rp * (1.14 + i * 0.09);
      c.globalAlpha = 0.1 - i * 0.015;
      c.strokeStyle = 'rgb(255,200,130)';
      c.lineWidth = Rp * 0.12;
      c.beginPath();
      c.ellipse(x, y, rr, rr * 0.98, th, Math.PI * 1.02, Math.PI * 1.98);
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(x, y, Rp, 0, 6.283);
    c.fill();
    c.globalCompositeOperation = 'lighter';
    const pr = mo ? 0.85 + 0.15 * Math.sin(s * 3.1) : 0.9;
    c.globalAlpha = pr;
    c.strokeStyle = 'rgba(255,236,205,1)';
    c.lineWidth = Math.max(1, Rp * 0.045);
    c.beginPath();
    c.arc(x, y, Rp * 1.035, 0, 6.283);
    c.stroke();
    c.globalAlpha = 0.35 * pr;
    c.lineWidth = Math.max(2, Rp * 0.14);
    c.strokeStyle = 'rgba(255,190,120,1)';
    c.beginPath();
    c.arc(x, y, Rp * 1.08, 0, 6.283);
    c.stroke();
    band(0, Math.PI, 0.09);
    for (const q of B.parts) {
      const a = q.a + rot * q.w,
        sa = Math.sin(a);
      if (sa <= 0) continue;
      const ca = Math.cos(a),
        dop = 1 + 0.75 * -ca,
        [px, py] = L(ca * q.r * Rp, sa * q.r * Rp * k);
      c.globalAlpha = clamp(q.b * 0.6 * dop, 0, 1);
      c.fillStyle = 'rgb(' + col(q.r) + ')';
      const z = q.s * Math.max(0.6, Rp / 60);
      c.fillRect(px - z / 2, py - z / 2, z, z);
    }
    c.globalAlpha = 1;
  },
};
