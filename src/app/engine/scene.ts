// @ts-nocheck: typing in progress (step 1b). Generated from the Skyward Mappa engine.
/** Canvas setup, starfield, galaxies and the main frame loop. */
import { h } from './vnode';
import { HOME, NEB, RG, SYS, STR, clamp, gauss, pickT, rnd } from './data';

export const scene = {
  sizeCanvas() {
    if (!this.cv) return;
    const d = Math.max(0.75, Math.min(devicePixelRatio || 1, 2) * ((this.q ?? 1) < 0.75 ? 0.72 : 1));
    this.dpr = d;
    this.cv.width = innerWidth * d;
    this.cv.height = innerHeight * d;
    this.W = innerWidth;
    this.H = innerHeight;
  },

  sprite(rgb, soft) {
    const k = rgb + (soft ? 's' : '');
    if (this.sprites[k]) return this.sprites[k];
    const n = soft ? 128 : 64,
      c = document.createElement('canvas');
    c.width = c.height = n;
    const x = c.getContext('2d'),
      g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    if (soft) {
      g.addColorStop(0, 'rgba(' + rgb + ',.9)');
      g.addColorStop(0.45, 'rgba(' + rgb + ',.28)');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
    } else {
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.08, 'rgba(' + rgb + ',.95)');
      g.addColorStop(0.25, 'rgba(' + rgb + ',.28)');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
    }
    x.fillStyle = g;
    x.fillRect(0, 0, n, n);
    return (this.sprites[k] = c);
  },

  seed() {
    const n = clamp(this.props.density ?? 1400, 200, 3000),
      neb = this.props.milkyWay ?? true,
      arms = 3;
    const buckets = {};
    const add = q => {
      (buckets[q.c] = buckets[q.c] || []).push(q);
    };
    for (let i = 0; i < n; i++) {
      const rr = RG * Math.pow(rnd(), 0.72),
        arm = i % arms,
        th = arm * 2.094 + rr * 0.0046 + gauss() * 0.26 * (1 + rr / RG);
      add({
        x: Math.cos(th) * rr + gauss() * 26,
        y: gauss() * (38 * (1 - rr / RG) + 9),
        z: Math.sin(th) * rr + gauss() * 26,
        m: 0.55 + Math.pow(rnd(), 6) * 3.4,
        a: 0.3 + rnd() * 0.6,
        c: pickT(),
        p: 9 + rnd() * 14,
        ph: rnd() * 6.28,
      });
    }
    for (let i = 0; i < Math.round(n * 0.3); i++)
      add({
        x: gauss() * 120,
        y: gauss() * 60,
        z: gauss() * 120,
        m: 0.5 + Math.pow(rnd(), 5) * 2.4,
        a: 0.35 + rnd() * 0.5,
        c: rnd() < 0.6 ? '255,222,176' : '255,236,194',
        p: 9 + rnd() * 14,
        ph: rnd() * 6.28,
      });
    const rot = (v, a, b) => {
      const [x, y, z] = v,
        y1 = y * Math.cos(a) - z * Math.sin(a),
        z1 = y * Math.sin(a) + z * Math.cos(a);
      return [x * Math.cos(b) + z1 * Math.sin(b), y1, -x * Math.sin(b) + z1 * Math.cos(b)];
    };
    const HOT = ['127,230,242', '255,210,122', '255,122,107', '140,240,160', '195,166,255', '255,160,220'];
    this.regions = [];
    this.hot = [];
    const G = clamp(this.props.galaxies ?? 22, 0, 40);
    let gT = 0;
    for (let g = 0; g < G && gT < 900; ) {
      gT++;
      const u = rnd() * 1.3 - 0.65,
        t = rnd() * 6.283,
        sn = Math.sqrt(1 - u * u),
        D = 2600 + Math.pow(rnd(), 0.8) * 6500,
        Rr = 420 + rnd() * 620;
      const dir = [sn * Math.cos(t), u, sn * Math.sin(t)],
        ang = Math.atan((Rr * 1.15) / D);
      if (
        this.regions.some(o => {
          const od = o.c.map(v => v / o.D),
            sep = Math.acos(clamp(dir[0] * od[0] + dir[1] * od[1] + dir[2] * od[2], -1, 1));
          return (
            sep < (ang + Math.atan((o.Rr * 1.15) / o.D)) * 1.35 ||
            Math.hypot(dir[0] * D - o.c[0], dir[1] * D - o.c[1], dir[2] * D - o.c[2]) < (Rr + o.Rr) * 1.5
          );
        })
      )
        continue;
      g++;
      const a = (rnd() - 0.5) * 1.4,
        b = rnd() * 6.283,
        c = dir.map(v => v * D),
        reg = { c, Rr, a, b, D };
      this.regions.push(reg);
      const m = Math.round(n * 0.38 * Math.min(1, 10 / Math.max(G, 1)) * 1.6),
        ar = 2 + Math.floor(rnd() * 2);
      for (let i = 0; i < m; i++) {
        const rr = Rr * Math.pow(rnd(), 0.72),
          th = ((i % ar) * 6.283) / ar + (rr / Rr) * 5.3 + gauss() * 0.28 * (1 + rr / Rr),
          l = rot(
            [
              Math.cos(th) * rr + gauss() * 18,
              gauss() * (26 * (1 - rr / Rr) + 6),
              Math.sin(th) * rr + gauss() * 18,
            ],
            a,
            b,
          );
        add({
          x: c[0] + l[0],
          y: c[1] + l[1],
          z: c[2] + l[2],
          m: 1.2 + Math.pow(rnd(), 5) * 4.5,
          a: 0.4 + rnd() * 0.55,
          c: pickT(),
          p: 9 + rnd() * 14,
          ph: rnd() * 6.28,
        });
      }
      for (let i = 0; i < Math.round(m * 0.25); i++)
        add({
          x: c[0] + gauss() * Rr * 0.1,
          y: c[1] + gauss() * Rr * 0.05,
          z: c[2] + gauss() * Rr * 0.1,
          m: 1 + Math.pow(rnd(), 4) * 3,
          a: 0.4 + rnd() * 0.5,
          c: '255,222,176',
          p: 9 + rnd() * 14,
          ph: rnd() * 6.28,
        });
      for (let h = 0; h < 3; h++) {
        const rr = Rr * (0.25 + rnd() * 0.6),
          th = rnd() * 6.283,
          l = rot([Math.cos(th) * rr, 0, Math.sin(th) * rr], a, b);
        this.hot.push({
          p: [c[0] + l[0], c[1] + l[1], c[2] + l[2]],
          c: HOT[Math.floor(rnd() * HOT.length)],
          sc: Rr / 600,
        });
      }
    }
    for (let h = 0; h < 7; h++) {
      let p,
        tries = 0;
      do {
        const rr = 250 + rnd() * (RG - 300),
          th = rnd() * 6.283;
        p = [Math.cos(th) * rr, gauss() * 20, Math.sin(th) * rr];
        tries++;
      } while (tries < 50 && SYS.some(s => Math.hypot(s.p[0] - p[0], s.p[2] - p[2]) < 220));
      this.hot.push({ p, c: HOT[Math.floor(rnd() * HOT.length)], sc: 1 });
    }
    this.buckets = Object.entries(buckets);
    this.haze = Array.from({ length: 60 }, () => {
      const u = rnd() * 2 - 1,
        t = rnd() * 6.283,
        s = Math.sqrt(1 - u * u);
      return {
        d: [s * Math.cos(t), u, s * Math.sin(t)],
        s: 0.25 + rnd() * 0.5,
        a: 0.05 + rnd() * 0.07,
        c: NEB[Math.floor(rnd() * NEB.length)],
      };
    });
    this.skyb = Array.from({ length: 2200 }, () => {
      const u = rnd() * 2 - 1,
        t = rnd() * 6.283,
        s = Math.sqrt(1 - u * u);
      return {
        d: [s * Math.cos(t), u, s * Math.sin(t)],
        a: 0.12 + Math.pow(rnd(), 3) * 0.5,
        r: rnd() < 0.08 ? 1.4 : 0.8,
      };
    });
    const N = clamp(this.props.constellations ?? 30, 0, 60),
      cl = [];
    let tries = 0;
    while (cl.length < N && tries < 600) {
      tries++;
      const rr = 160 + rnd() * (RG - 200),
        th = rnd() * 6.283,
        c = [Math.cos(th) * rr, gauss() * 18, Math.sin(th) * rr];
      if (SYS.some(s => Math.hypot(s.p[0] - c[0], s.p[2] - c[2]) < 110)) continue;
      const young = rnd() < 0.55,
        base = young ? '196,214,255' : '255,226,180',
        k = 10 + Math.floor(rnd() * 24),
        rad = 10 + rnd() * 30,
        st = [];
      for (let i = 0; i < k; i++) {
        const dd = Math.pow(rnd(), 0.8);
        st.push({
          o: [gauss() * rad * dd, gauss() * rad * 0.6 * dd, gauss() * rad * dd],
          m: 0.7 + Math.pow(rnd(), 3) * 3.2,
          a: 0.45 + rnd() * 0.5,
          c: rnd() < 0.75 ? base : pickT(),
          p: 9 + rnd() * 14,
          ph: rnd() * 6.28,
        });
      }
      cl.push({ c, st, glow: young ? '150,180,255' : '255,200,150', gs: rad * 3.2 });
    }
    this.clusters = cl;
    this.nebs = [];
    if (neb) {
      for (let i = 0; i < 34; i++) {
        const rr = 120 + rnd() * (RG - 150),
          arm = i % arms,
          th = arm * 2.094 + rr * 0.0046 + gauss() * 0.2;
        this.nebs.push({
          p: [Math.cos(th) * rr, gauss() * 20, Math.sin(th) * rr],
          s: 130 + rnd() * 300,
          a: 0.05 + rnd() * 0.08,
          c: NEB[Math.floor(rnd() * NEB.length)],
        });
      }
    }
    SYS.forEach(s => this.nebs.push({ p: s.p, s: 220, a: 0.12, c: s.tint }));
    for (const reg of this.regions) {
      if (neb) {
        const k = 10;
        for (let i = 0; i < k; i++) {
          const rr = reg.Rr * Math.pow(rnd(), 0.6),
            th = rnd() * 6.283;
          this.nebs.push({
            p: [reg.c[0] + Math.cos(th) * rr, reg.c[1] + gauss() * 30, reg.c[2] + Math.sin(th) * rr],
            s: reg.Rr * (0.35 + rnd() * 0.5),
            a: 0.06 + rnd() * 0.08,
            c: NEB[Math.floor(rnd() * NEB.length)],
          });
        }
      }
      this.nebs.push({ p: reg.c, s: reg.Rr * 0.8, a: 0.22, c: '255,210,160' });
      for (let i = 0; i < Math.round((N * Math.min(1, 10 / Math.max(G, 1))) / 4); i++) {
        const rr = reg.Rr * (0.15 + rnd() * 0.8),
          th = rnd() * 6.283,
          cc = [reg.c[0] + Math.cos(th) * rr, reg.c[1] + gauss() * 20, reg.c[2] + Math.sin(th) * rr],
          young = rnd() < 0.55,
          base = young ? '196,214,255' : '255,226,180',
          k = 10 + Math.floor(rnd() * 18),
          rad = 14 + rnd() * 34,
          st = [];
        for (let j = 0; j < k; j++) {
          const dd = Math.pow(rnd(), 0.8);
          st.push({
            o: [gauss() * rad * dd, gauss() * rad * 0.6 * dd, gauss() * rad * dd],
            m: 1.2 + Math.pow(rnd(), 3) * 4,
            a: 0.45 + rnd() * 0.5,
            c: rnd() < 0.75 ? base : pickT(),
            p: 9 + rnd() * 14,
            ph: rnd() * 6.28,
          });
        }
        this.clusters.push({ c: cc, st, glow: young ? '150,180,255' : '255,200,150', gs: rad * 3.2 });
      }
    }
    for (const h of this.hot) {
      this.nebs.push({ p: h.p, s: 220 * h.sc, a: 0.13, c: h.c });
      const st = Array.from({ length: 22 }, () => ({
        o: [gauss() * 20 * h.sc, gauss() * 12 * h.sc, gauss() * 20 * h.sc],
        m: (0.8 + Math.pow(rnd(), 3) * 2.2) * (h.sc > 1 ? 1.6 : 1),
        a: 0.5 + rnd() * 0.5,
        c: h.c,
        p: 9 + rnd() * 14,
        ph: rnd() * 6.28,
      }));
      st.push({ o: [0, 0, 0], m: 3.4 * (h.sc > 1 ? 1.5 : 1), a: 1, c: h.c, p: 12, ph: rnd() * 6.28 });
      this.clusters.push({ c: h.p, st, glow: h.c, gs: 70 * h.sc });
    }
    this.swarms = SYS.map(s =>
      Array.from({ length: 22 }, () => ({
        o: [gauss() * 20, gauss() * 12, gauss() * 20],
        m: 0.8 + Math.pow(rnd(), 3) * 2.2,
        a: 0.5 + rnd() * 0.5,
        p: 9 + rnd() * 14,
        ph: rnd() * 6.28,
      })),
    );
    this.bh = {
      p: [288, -1613, -2576],
      R: 150,
      tilt: -0.32,
      k: 0.24,
      parts: Array.from({ length: 1100 }, () => {
        const r = 1.55 + Math.pow(rnd(), 1.6) * 2.9;
        return {
          r,
          a: rnd() * 6.283,
          w: 0.9 / Math.pow(r, 1.5),
          s: 0.6 + rnd() * 1.3,
          b: 0.35 + rnd() * 0.65,
        };
      }),
    };
    this.warpP = Array.from({ length: 1400 }, () => this.spawn(true));
    this.warpNeb = Array.from({ length: 16 }, () => {
      const an = rnd() * 6.283,
        rr = 0.5 + rnd() * 1.4;
      return {
        x: Math.cos(an) * rr,
        y: Math.sin(an) * rr,
        z: 0.1 + rnd() * 0.9,
        s: 0.25 + rnd() * 0.5,
        c: NEB[Math.floor(rnd() * NEB.length)],
        t: rnd() < 0.35,
      };
    });
  },

  aboutGalRef(el) {
    if (this.aboutRO) {
      this.aboutRO.disconnect();
      this.aboutRO = null;
    }
    if (!el) return;
    const draw = () => this.drawAboutGal(el);
    this.aboutRO = new ResizeObserver(draw);
    this.aboutRO.observe(el);
    draw();
  },

  drawAboutGal(el) {
    const W = el.clientWidth,
      H = el.clientHeight;
    if (!W || !H) return;
    const d = Math.min(devicePixelRatio || 1, 2);
    el.width = W * d;
    el.height = H * d;
    const x = el.getContext('2d');
    x.setTransform(d, 0, 0, d, 0, 0);
    x.clearRect(0, 0, W, H);
    for (let i = 0; i < Math.round((W * H) / 900); i++) {
      const px = rnd() * W,
        py = rnd() * H,
        r = rnd() < 0.9 ? 0.5 + rnd() * 0.6 : 1 + rnd() * 0.8;
      x.fillStyle = 'rgba(242,238,230,' + (0.25 + rnd() * 0.6) + ')';
      x.beginPath();
      x.arc(px, py, r, 0, 6.283);
      x.fill();
    }
  },

  galaxy(col, spiral) {
    const n = 256,
      src = document.createElement('canvas');
    src.width = src.height = n;
    const x = src.getContext('2d'),
      h = n / 2;
    const glow = (cx, cy, r, rgb, al) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(' + rgb + ',' + al + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, r, 0, 6.283);
      x.fill();
    };
    x.globalCompositeOperation = 'lighter';
    if (spiral) {
      glow(h, h, n * 0.46, col, 0.16);
      const arms = 2,
        b = 0.2 + rnd() * 0.08,
        off = rnd() * 6.283;
      for (let a = 0; a < arms; a++)
        for (let i = 0; i < 340; i++) {
          const th = rnd() * 3.2 * Math.PI,
            r = n * 0.03 * Math.exp(b * th);
          if (r > n * 0.46) continue;
          const an = th + a * Math.PI + off + gauss() * 0.12,
            px = h + Math.cos(an) * r + gauss() * r * 0.06,
            py = h + Math.sin(an) * r + gauss() * r * 0.06;
          glow(
            px,
            py,
            1.5 + rnd() * 3.5,
            rnd() < 0.25 ? '255,255,255' : col,
            0.25 + rnd() * 0.35 * (1 - r / (n * 0.46)),
          );
        }
      glow(h, h, n * 0.13, '255,244,225', 0.9);
      glow(h, h, n * 0.05, '255,255,255', 0.9);
    } else {
      glow(h, h, n * 0.46, col, 0.35);
      glow(h, h, n * 0.2, '255,240,220', 0.55);
      glow(h, h, n * 0.06, '255,255,255', 0.8);
    }
    const c = document.createElement('canvas');
    c.width = c.height = n;
    const y = c.getContext('2d');
    y.translate(h, h);
    y.rotate(rnd() * 6.283);
    y.scale(1, spiral ? 0.3 + rnd() * 0.7 : 0.45 + rnd() * 0.5);
    y.drawImage(src, -h, -h);
    return c;
  },

  spawn(init) {
    const an = rnd() * 6.283,
      rr = 0.035 + Math.pow(rnd(), 0.65) * 1.3;
    return {
      x: Math.cos(an) * rr,
      y: Math.sin(an) * rr,
      z: init ? 0.08 + rnd() * 1.1 : 1.1 + rnd() * 0.15,
      c: pickT(),
      b: 0.35 + Math.pow(rnd(), 2) * 0.65,
      hot: rnd() < 0.45,
    };
  },

  basis() {
    const { dist, T } = this.cam,
      yaw = this.cam.yaw + this.swY,
      pitch = this.cam.pitch + this.swP,
      cp = Math.cos(pitch);
    const C = [
      T[0] + dist * cp * Math.sin(yaw),
      T[1] + dist * Math.sin(pitch),
      T[2] + dist * cp * Math.cos(yaw),
    ];
    let fw = [T[0] - C[0], T[1] - C[1], T[2] - C[2]];
    const l = Math.hypot(...fw);
    fw = fw.map(v => v / l);
    let r = [-fw[2], 0, fw[0]];
    const lr = Math.hypot(...r) || 1;
    r = r.map(v => v / lr);
    const u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]];
    return { C, fw, r, u };
  },

  frame(t) {
    const c = this.ctx;
    if (!c) return;
    const W = this.W,
      H = this.H,
      d = this.dpr;
    c.setTransform(d, 0, 0, d, 0, 0);
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    const s = (t - this.t0) / 1000,
      red = this.reduced,
      mo = red ? 0 : this.motion,
      st = this.state,
      cam = this.cam,
      tg = this.tgt;
    if (st.intro === 'boot' || st.intro === 'ready') {
      this.updIntroHold(t);
      return;
    }
    if (st.phase === 'page' && !this.warp && t - (this.lastDraw || 0) < 66) return;
    this.lastDraw = t;
    if (this.egg) {
      const ek = (t - this.egg.start) / 2800;
      if (ek < 0.45) cam.yaw += dt * (ek / 0.45) * 2.4;
    }
    if (!this.drag) {
      cam.yaw += this.vel;
      this.vel *= Math.pow(0.03, dt);
    }
    if (!red && !this.drag && t - this.idle > (st.sel >= 0 ? 1200 : 2200))
      cam.yaw += dt * (st.sel >= 0 ? 0.11 : 0.03) * Math.min(mo, 2);
    this.swY = 0;
    this.swP = 0;
    if (tg.yaw != null && !this.drag) {
      const dy = tg.yaw - cam.yaw;
      cam.yaw += dy * (red ? 1 : 1 - Math.pow(0.02, dt));
      if (Math.abs(dy) < 0.001) {
        cam.yaw = tg.yaw;
        tg.yaw = null;
      }
    }
    const k = red ? 1 : 1 - Math.pow(0.02, dt);
    if (this.approach) {
      const A = this.approach,
        q = clamp((t - A.start) / A.dur, 0, 1),
        e = 1 - Math.pow(1 - q, 3.2),
        dd = Math.exp(Math.log(A.d0) + (Math.log(A.d1) - Math.log(A.d0)) * e);
      cam.dist = tg.dist = dd;
      cam.yaw = A.y0 + (A.y1 - A.y0) * e;
      cam.pitch = tg.pitch = A.p0 + (A.p1 - A.p0) * e;
      this.vel = 0;
      if (q >= 1) {
        this.approach = null;
        this.idle = t;
      }
    }
    for (let i = 0; i < 3; i++) cam.T[i] += (tg.T[i] - cam.T[i]) * k;
    cam.dist += (tg.dist - cam.dist) * k;
    if (!this.drag) cam.pitch += (tg.pitch - cam.pitch) * k;
    const mob = W < 760;
    this.cxOff += ((st.sel >= 0 && !mob && !st.list && st.phase === 'map' ? -190 : 0) - this.cxOff) * k;
    const z = cam.dist < 900;
    if (z !== st.zoomed) this.setState({ zoomed: z });
    if (this.warp) {
      this.drawWarp(c, W, H, t, dt);
      return;
    }
    const arr = (st.phase === 'arrive' || st.phase === 'page') && this.lay,
      { C, fw, r, u } = this.basis(),
      F = (this.F = Math.min(W, H * 1.15) * 0.95),
      cx = arr ? this.lay.cx : W / 2 + this.cxOff,
      cy = arr ? this.lay.cy : H * 0.4;
    const P = (x, y, zz) => {
      const dx = x - C[0],
        dy = y - C[1],
        dz = zz - C[2],
        zc = dx * fw[0] + dy * fw[1] + dz * fw[2];
      if (zc < 4) return null;
      const q = F / zc;
      return [
        cx + (dx * r[0] + dy * r[1] + dz * r[2]) * q,
        cy - (dx * u[0] + dy * u[1] + dz * u[2]) * q,
        q,
        zc,
      ];
    };
    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#F2EEE6';
    for (let bi = 0, SK = this.skyb; bi < SK.length; bi += this.stride) {
      const b = SK[bi];
      const zc = b.d[0] * fw[0] + b.d[1] * fw[1] + b.d[2] * fw[2];
      if (zc <= 0.05) continue;
      const x = cx + ((b.d[0] * r[0] + b.d[1] * r[1] + b.d[2] * r[2]) / zc) * F,
        y = cy - ((b.d[0] * u[0] + b.d[1] * u[1] + b.d[2] * u[2]) / zc) * F;
      if (x < 0 || y < 0 || x > W || y > H) continue;
      c.globalAlpha = b.a;
      c.fillRect(x, y, b.r, b.r);
    }
    c.globalCompositeOperation = 'lighter';
    for (const b of this.haze || []) {
      const zc = b.d[0] * fw[0] + b.d[1] * fw[1] + b.d[2] * fw[2];
      if (zc <= 0.1) continue;
      const x = cx + ((b.d[0] * r[0] + b.d[1] * r[1] + b.d[2] * r[2]) / zc) * F,
        y = cy - ((b.d[0] * u[0] + b.d[1] * u[1] + b.d[2] * u[2]) / zc) * F,
        sz = (b.s * F) / zc;
      if (x < -sz || y < -sz || x > W + sz || y > H + sz) continue;
      c.globalAlpha = b.a;
      c.drawImage(this.sprite(b.c, true), x - sz / 2, y - sz / 2, sz, sz);
    }
    const vis = (p, m) => p && p[0] > -m && p[1] > -m && p[0] < W + m && p[1] < H + m;
    for (const n of this.nebs) {
      const p = P(n.p[0], n.p[1], n.p[2]);
      if (!vis(p, 900)) continue;
      const sz = n.s * p[2];
      if (sz < 6) continue;
      const fade = clamp(1.6 - sz / (Math.max(W, H) * 2.2), 0, 1);
      c.globalAlpha = n.a * fade * (1 + (mo ? 0.15 * Math.sin(s * 0.2 + n.s) : 0));
      c.drawImage(this.sprite(n.c, true), p[0] - sz / 2, p[1] - sz / 2, sz, sz);
    }
    {
      const p = P(0, 0, 0);
      if (vis(p, 900)) {
        const sz = 560 * p[2];
        c.globalAlpha = 0.32;
        c.drawImage(this.sprite('255,210,160', true), p[0] - sz / 2, p[1] - sz / 2, sz, sz);
      }
    }
    this.bhScr = null;
    if ((this.props.blackHole ?? true) && this.bh) {
      const bp = P(...this.bh.p);
      if (bp) {
        const Rp = clamp(this.bh.R * bp[2], 6, 220);
        if (vis(bp, Rp * 8)) {
          this.drawBH(c, bp[0], bp[1], Rp, s, mo);
          this.bhScr = { x: bp[0], y: bp[1], R: Rp };
        }
        c.globalCompositeOperation = 'lighter';
      }
    }
    const depth = zc => clamp(1.35 - zc / 7500, 0.45, 1);
    for (const [col, arr] of this.buckets) {
      const spr = this.sprite(col);
      c.fillStyle = 'rgb(' + col + ')';
      for (let qi = 0; qi < arr.length; qi += this.stride) {
        const q = arr[qi];
        const p = P(q.x, q.y, q.z);
        if (!vis(p, 20)) continue;
        const px = Math.min(5, q.m * p[2] * 1.25),
          tw = mo ? 0.7 + 0.3 * Math.sin((6.283 * s) / q.p + q.ph) : 1,
          a = q.a * depth(p[3]) * tw;
        c.globalAlpha = a;
        if (px < 1.3) {
          c.fillRect(p[0], p[1], Math.max(0.6, px), Math.max(0.6, px));
        } else {
          const g = Math.min(48, px * 5);
          c.drawImage(spr, p[0] - g / 2, p[1] - g / 2, g, g);
        }
      }
    }
    for (const g of this.clusters) {
      const pc = P(g.c[0], g.c[1], g.c[2]);
      if (!vis(pc, 400)) continue;
      const gs = g.gs * pc[2];
      if (gs > 4) {
        c.globalAlpha = 0.16 * (mo ? 0.8 + 0.2 * Math.sin(s * 0.4 + g.gs) : 1);
        c.drawImage(this.sprite(g.glow, true), pc[0] - gs / 2, pc[1] - gs / 2, gs, gs);
      }
      for (let qi = 0, ST = g.st, sd = this.stride > 2 ? 2 : 1; qi < ST.length; qi += sd) {
        const q = ST[qi];
        const p = P(g.c[0] + q.o[0], g.c[1] + q.o[1], g.c[2] + q.o[2]);
        if (!p) continue;
        const tw = mo ? 0.55 + 0.45 * Math.sin((6.283 * s) / q.p + q.ph) : 1,
          px = Math.min(7, q.m * p[2] * 1.3),
          gg = Math.max(5, Math.min(70, px * 7));
        c.globalAlpha = q.a * depth(p[3]) * tw;
        c.drawImage(this.sprite(q.c), p[0] - gg / 2, p[1] - gg / 2, gg, gg);
      }
    }
    SYS.forEach((sy, i) => {
      const spr = this.sprite(sy.tint);
      for (const q of this.swarms[i]) {
        const p = P(sy.p[0] + q.o[0], sy.p[1] + q.o[1], sy.p[2] + q.o[2]);
        if (!p) continue;
        const tw = mo ? 0.6 + 0.4 * Math.sin((6.283 * s) / q.p + q.ph) : 1,
          gg = Math.max(5, Math.min(60, q.m * p[2] * 8));
        c.globalAlpha = q.a * tw * depth(p[3]);
        c.drawImage(spr, p[0] - gg / 2, p[1] - gg / 2, gg, gg);
      }
    });
    c.globalCompositeOperation = 'source-over';
    {
      const hp = P(...SYS[st.here].p),
        hx = SYS[st.here];
      if (hp && st.phase === 'map') {
        c.strokeStyle = hx.hex;
        c.lineWidth = 1.4;
        const base = hx.home ? clamp(24 * hp[2], 7, 260) + 8 : 16;
        for (let k = 0; k < 2; k++) {
          const ph = red ? 0.35 : (s * 0.55 + k * 0.5) % 1;
          c.globalAlpha = (1 - ph) * 0.8;
          c.beginPath();
          c.arc(hp[0], hp[1], base + ph * 48, 0, 6.283);
          c.stroke();
        }
      }
    }
    c.globalAlpha = 1;
    if (mo && s > this.nextShoot && !this.shoot) {
      const a = ((200 + rnd() * 35) * Math.PI) / 180,
        v = 700 + rnd() * 500;
      this.shoot = {
        x: W * (0.3 + rnd() * 0.65),
        y: H * (0.04 + rnd() * 0.35),
        vx: Math.cos(a) * v,
        vy: Math.abs(Math.sin(a) * v),
        t: 0,
        life: 0.6 + rnd() * 0.4,
      };
      this.nextShoot = s + (6 + rnd() * 9) / Math.max(0.3, mo);
    }
    if (this.shoot) {
      const q = this.shoot;
      q.t += dt;
      const kk = q.t / q.life,
        hx = q.x + q.vx * q.t,
        hy = q.y + q.vy * q.t,
        tx = hx - q.vx * 0.13,
        ty = hy - q.vy * 0.13;
      const g = c.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(242,238,230,0)');
      g.addColorStop(1, 'rgba(242,238,230,' + 0.85 * Math.sin(Math.PI * Math.min(1, kk)) + ')');
      c.globalAlpha = 1;
      c.strokeStyle = g;
      c.lineWidth = 1.3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(tx, ty);
      c.lineTo(hx, hy);
      c.stroke();
      if (kk >= 1) this.shoot = null;
    }
    c.globalAlpha = 1;
    if (this.hold) {
      const hd = this.hold,
        g = this.holds[hd.i],
        k = clamp((t - hd.start - 180) / (red ? 500 : 850), 0, 1);
      if (g) {
        g.style.opacity = k > 0 ? '1' : '0';
        const c2 = g.lastElementChild;
        if (c2) c2.setAttribute('stroke-dashoffset', (169.6 * (1 - k)).toFixed(1));
      }
      if (k >= 1) {
        this.coachAct(2);
        this.hold = null;
        this.holdFired = { i: hd.i, t: performance.now() };
        if (g) g.style.opacity = '0';
        if (hd.i === HOME) this.goHome();
        else {
          this.select(hd.i);
          setTimeout(() => this.jump(), 40);
        }
      }
    }
    if (this.fadeIn) {
      const q = clamp((t - this.fadeIn.start) / this.fadeIn.dur, 0, 1);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = (this.fadeIn.a0 ?? 1) * Math.pow(1 - q, 1.6);
      c.fillStyle = '#05040C';
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
      if (q >= 1) this.fadeIn = null;
    }
    if (this.wtail) {
      const T = this.wtail,
        q = clamp((t - STR.start) / T.dur, 0, 1),
        V = T.V0 * Math.pow(1 - q, 2.2),
        am = Math.pow(1 - q, 1.4),
        F2 = Math.max(W, H) * 0.14,
        roll = ((t - STR.start) / 1000) * 0.1 * T.dir,
        cr = Math.cos(roll),
        sr = Math.sin(roll),
        sd = this.stride || 1;
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round';
      for (let i = 0, PP = this.warpP; i < PP.length; i += sd) {
        const p = PP[i];
        p.z -= V * dt;
        if (p.z <= 0.025) {
          Object.assign(p, this.spawn(false));
          continue;
        }
        const z2 = Math.min(1.25, p.z + V * 0.045 + 0.0015),
          rx = p.x * cr - p.y * sr,
          ry = p.x * sr + p.y * cr,
          x1 = T.cx + (rx / p.z) * F2,
          y1 = T.cy + (ry / p.z) * F2,
          x2 = T.cx + (rx / z2) * F2,
          y2 = T.cy + (ry / z2) * F2;
        if (
          (x1 < -40 && x2 < -40) ||
          (x1 > W + 40 && x2 > W + 40) ||
          (y1 < -40 && y2 < -40) ||
          (y1 > H + 40 && y2 > H + 40)
        )
          continue;
        const nr = 1 - p.z,
          al = Math.min(1, p.b * (0.12 + nr * nr * 1.3)) * am;
        if (al < 0.02) continue;
        const lw = Math.max(0.5, Math.min(2.8, 0.35 + nr * nr * 2.6));
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
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      if (q >= 1) this.wtail = null;
    }
    this.drawEgg(c, W, H, t);
    this.lastP = P;
    this.place(P, s, mo);
    if (arr && st.phase === 'arrive') this.placePlanets(dt, s, mo);
  },

  drawWarp(c, W, H, t, dt) {
    const w = this.warp,
      el = t - w.start,
      k = Math.min(1, el / w.dur),
      red = this.reduced,
      ke = w.entry ? clamp((el - w.dur) / w.entry, 0, 1) : 1,
      fo = 1 - ke;
    let v;
    if (k < 0.28) {
      const q = k / 0.28;
      v = 0.015 + q * q * q * 0.985;
    } else if (k < 0.66) v = 1;
    else {
      const q = (k - 0.66) / 0.34;
      v = Math.pow(1 - q, 2.4) * 0.985 + 0.015;
    }
    if (w.handoff && k >= w.handoff) {
      const L = w.land;
      this.wtail = {
        start: t,
        dur: 1100,
        V0: v * 2.1,
        cx: (w.end || [W / 2, H * 0.4])[0],
        cy: (w.end || [W / 2, H * 0.4])[1],
        dir: w.dir || 1,
      };
      this.warp = null;
      if (L) L();
      return;
    }
    const V = v * 2.1,
      ec = w.end || [W / 2, H * 0.4],
      mq = clamp(k / 0.5, 0, 1),
      em = mq * mq * (3 - 2 * mq);
    let cx = w.sx + (ec[0] - w.sx) * em,
      cy = w.sy + (ec[1] - w.sy) * em;
    const sh = v > 0.7 && !red ? (v - 0.7) * 2.4 : 0;
    cx += (rnd() - 0.5) * sh;
    cy += (rnd() - 0.5) * sh;
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#05040C';
    c.fillRect(0, 0, W, H);
    if (w.snap && k < 0.24) {
      const q = k / 0.24,
        sc = 1 + q * q * 0.9;
      c.globalAlpha = Math.pow(1 - q, 1.5);
      c.save();
      c.translate(w.sx, w.sy);
      c.scale(sc, sc);
      c.translate(-w.sx, -w.sy);
      c.drawImage(w.snap, 0, 0, W, H);
      c.restore();
      c.globalAlpha = 1;
    }
    const F = Math.max(W, H) * 0.14 * (1 - 0.2 * v),
      roll = ((t - w.start) / 1000) * 0.1 * (w.dir || 1),
      cr = Math.cos(roll),
      sr = Math.sin(roll),
      fin = clamp(k / 0.1, 0, 1);
    c.globalCompositeOperation = 'lighter';
    const gv = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
    gv.addColorStop(0, 'rgba(' + w.tint + ',' + (0.07 + 0.1 * v) * fin + ')');
    gv.addColorStop(0.35, 'rgba(60,70,140,' + 0.05 * v + ')');
    gv.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gv;
    c.fillRect(0, 0, W, H);
    for (const n of this.warpNeb) {
      n.z -= V * dt * 0.9;
      if (n.z <= 0.05) {
        n.z = 1;
        const an = rnd() * 6.283,
          rr = 0.5 + rnd() * 1.4;
        n.x = Math.cos(an) * rr;
        n.y = Math.sin(an) * rr;
      }
      const sz = clamp((n.s / n.z) * F, 4, Math.max(W, H) * 1.5),
        rx = n.x * cr - n.y * sr,
        ry = n.x * sr + n.y * cr,
        x = cx + (rx / n.z) * F,
        y = cy + (ry / n.z) * F;
      c.globalAlpha = clamp((1 - n.z) * 0.09, 0, 0.09) * fin;
      c.drawImage(this.sprite(n.t ? w.tint : n.c, true), x - sz / 2, y - sz / 2, sz, sz);
    }
    c.lineCap = 'round';
    const st = this.stride || 1,
      blue = v > 0.55,
      T = 0.045;
    for (let i = 0, PP = this.warpP; i < PP.length; i += st) {
      const p = PP[i];
      p.z -= V * dt;
      if (p.z <= 0.025) {
        Object.assign(p, this.spawn(false));
        continue;
      }
      const z2 = Math.min(1.25, p.z + V * T + 0.0015),
        rx = p.x * cr - p.y * sr,
        ry = p.x * sr + p.y * cr,
        x1 = cx + (rx / p.z) * F,
        y1 = cy + (ry / p.z) * F,
        x2 = cx + (rx / z2) * F,
        y2 = cy + (ry / z2) * F;
      if (
        (x1 < -40 && x2 < -40) ||
        (x1 > W + 40 && x2 > W + 40) ||
        (y1 < -40 && y2 < -40) ||
        (y1 > H + 40 && y2 > H + 40)
      )
        continue;
      const nr = 1 - p.z,
        al = Math.min(1, p.b * (0.12 + nr * nr * 1.3)) * fin * fo,
        col = blue && p.hot ? '214,228,255' : p.c,
        len = Math.abs(x1 - x2) + Math.abs(y1 - y2),
        lw = Math.max(0.5, Math.min(2.8, 0.35 + nr * nr * 2.6));
      if (len < 1.5) {
        c.globalAlpha = al;
        c.fillStyle = 'rgb(' + col + ')';
        c.fillRect(x1 - lw / 2, y1 - lw / 2, lw, lw);
      } else {
        const g = c.createLinearGradient(x2, y2, x1, y1);
        g.addColorStop(0, 'rgba(' + col + ',0)');
        g.addColorStop(1, 'rgba(' + col + ',' + al + ')');
        c.globalAlpha = 1;
        c.strokeStyle = g;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x1, y1);
        c.stroke();
      }
    }
    if (w.dest) {
      const q = clamp((k - 0.6) / 0.4, 0, 1),
        e = q * q * (3 - 2 * q),
        S = 6 + e * (w.ss || 100) + (w.entry ? Math.pow(ke, 2.4) * Math.hypot(W, H) * 2.8 : 0);
      w.lastS = S;
      c.globalAlpha = 0.25 + 0.75 * e;
      const h = S * 2.4;
      c.drawImage(this.sprite(w.tint, true), cx - h / 2, cy - h / 2, h, h);
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.26, 'rgba(' + w.tint + ',1)');
      g.addColorStop(0.5, 'rgba(' + w.tint + ',.35)');
      g.addColorStop(1, 'rgba(' + w.tint + ',0)');
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.beginPath();
      c.arc(cx, cy, S / 2, 0, 6.283);
      c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    const vg = c.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, 'rgba(5,4,12,0)');
    vg.addColorStop(1, 'rgba(5,4,12,' + (0.35 + 0.35 * v) * fo + ')');
    c.globalAlpha = 1;
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
    if (w.name) {
      const ha = clamp(k / 0.15, 0, 1) * clamp((1 - k) / 0.12, 0, 1) * fo,
        pe = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
        dist = (w.ly * (1 - pe)).toFixed(1),
        y0 = H - Math.max(40, H * 0.08);
      c.globalAlpha = ha;
      c.textAlign = 'center';
      c.fillStyle = '#F2EEE6';
      c.font = '500 13px "Martian Mono", monospace';
      c.fillText(STR.jump + w.name.toUpperCase(), W / 2, y0 - 22);
      c.fillStyle = '#A9A3C2';
      c.font = '400 12px "Martian Mono", monospace';
      c.fillText(STR.distance + dist + STR.ly, W / 2, y0);
      const bw = Math.min(220, W * 0.4);
      c.fillStyle = 'rgba(242,238,230,.18)';
      c.fillRect(W / 2 - bw / 2, y0 + 12, bw, 1);
      c.fillStyle = 'rgb(' + w.tint + ')';
      c.fillRect(W / 2 - bw / 2, y0 + 12, bw * pe, 1);
      c.globalAlpha = 1;
      c.textAlign = 'start';
    }
    if (k >= 1 && ke >= 1) {
      const L = w.land;
      this.warp = null;
      if (L) L();
      else {
        this.emergeScale = w.lastS && w.ss ? w.lastS / w.ss : 1;
        this.arriveNow();
      }
    }
  },
};
