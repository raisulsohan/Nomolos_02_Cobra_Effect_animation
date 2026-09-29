(function () {
  'use strict';
  const F = FILM, { TAU, clamp, lerp, smooth, hash } = F, PR = F.props, mix = F.city.mix;
  const CW = (F.clockwork = {});

  CW.run = (t, t0, rise) => {
    const u = (t - t0) / rise;
    if (u <= 0) return 0;
    return u < 1 ? rise * (u * u * u - u * u * u * u / 2) : rise * (.5 + (u - 1));
  };

  CW.gear = (x, P, o) => {
    const { r, n } = o, a = o.a || 0, th = o.th || r * .16, rr = r - th * .55, rt = r + th * .45;
    const base = mix(o.col || P.sheet, PR.money('flat'), clamp(o.lit || 0));
    x.save(); x.translate(o.x, o.y);
    x.fillStyle = base; x.beginPath();
    for (let i = 0; i < n; i++) {
      const c = a + i * TAU / n, h = TAU / n;
      const pts = [[c - h * .30, rr], [c - h * .17, rt], [c + h * .17, rt], [c + h * .30, rr], [c + h * .5, rr]];
      for (const [q, rad] of pts) { const X = Math.cos(q) * rad, Y = Math.sin(q) * rad; i === 0 && q === pts[0][0] ? x.moveTo(X, Y) : x.lineTo(X, Y); }
    }
    x.closePath(); x.fill();
    const web = mix(base, P.ink, .16), rim = rr - th * .5;
    x.fillStyle = web; x.beginPath(); x.arc(0, 0, rim, 0, TAU); x.fill();
    if (o.plate) {
      x.fillStyle = mix(base, P.ink, .06); x.beginPath(); x.arc(0, 0, o.plate, 0, TAU); x.fill();
      x.fillStyle = mix(base, P.ink, .3);
      const nb = o.bolts || 12;
      for (let i = 0; i < nb; i++) { const q = a + (i + .5) * TAU / nb, R = (o.plate + rim) / 2; x.beginPath(); x.arc(Math.cos(q) * R, Math.sin(q) * R, th * .22, 0, TAU); x.fill(); }
    } else {
      const ns = o.spokes || 5, ri = rim * .34;
      x.fillStyle = mix(base, P.ink, .55);
      for (let i = 0; i < ns; i++) {
        const q0 = a + i * TAU / ns + .16, q1 = a + (i + 1) * TAU / ns - .16;
        x.beginPath(); x.arc(0, 0, rim * .82, q0, q1); x.arc(0, 0, ri * 1.25, q1 - .12, q0 + .12, true); x.closePath(); x.fill();
      }
      x.fillStyle = mix(base, P.rim, .25); x.beginPath(); x.arc(0, 0, ri, 0, TAU); x.fill();
      x.fillStyle = mix(base, P.ink, .45); x.beginPath(); x.arc(0, 0, ri * .38, 0, TAU); x.fill();
    }
    x.restore();
  };

  CW.pulley = (x, P, o) => {
    const { r } = o, a = o.a || 0, col = o.col || mix(P.sheet, P.ink, .12);
    x.save(); x.translate(o.x, o.y);
    x.fillStyle = mix(col, P.ink, .25); x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(0, 0, r * .78, 0, TAU); x.fill();
    x.strokeStyle = mix(col, P.ink, .35); x.lineWidth = Math.max(1.2, r * .1); x.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const q = a + i * TAU / 4; x.beginPath(); x.moveTo(Math.cos(q) * r * .2, Math.sin(q) * r * .2); x.lineTo(Math.cos(q) * r * .72, Math.sin(q) * r * .72); x.stroke(); }
    x.fillStyle = mix(col, P.ink, .5); x.beginPath(); x.arc(0, 0, r * .2, 0, TAU); x.fill();
    x.restore();
  };

  function tangents(A, B) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), phi = Math.atan2(dy, dx), beta = Math.acos(clamp((A[2] - B[2]) / L, -1, 1));
    return { phi, beta, L };
  }
  function loop(x, A, B) {
    const { phi, beta } = tangents(A, B), u = q => [Math.cos(q), Math.sin(q)];
    const a1 = u(phi + beta), a2 = u(phi - beta);
    x.beginPath();
    x.moveTo(A[0] + A[2] * a1[0], A[1] + A[2] * a1[1]); x.lineTo(B[0] + B[2] * a1[0], B[1] + B[2] * a1[1]);
    x.arc(B[0], B[1], B[2], phi + beta, phi - beta, true);
    x.lineTo(A[0] + A[2] * a2[0], A[1] + A[2] * a2[1]);
    x.arc(A[0], A[1], A[2], phi - beta, phi + beta - TAU, true);
    x.closePath();
  }
  CW.belt = (x, P, o) => {
    const w = o.w || 6, col = o.col || mix(P.ink, P.sheet2, .5);
    x.save(); x.lineJoin = 'round';
    loop(x, o.a, o.b);
    x.strokeStyle = col; x.lineWidth = w; x.stroke();
    x.strokeStyle = mix(col, P.sheet, .35); x.lineWidth = w * .55; x.setLineDash(o.dash || [w * .35, w * 2.2]); x.lineDashOffset = -(o.s || 0); x.stroke();
    x.restore();
  };
  CW.beltAt = (o, u) => {
    const A = o.a, B = o.b, { phi, beta } = tangents(A, B), c = Math.cos(phi + beta), s = Math.sin(phi + beta);
    return [lerp(A[0] + A[2] * c, B[0] + B[2] * c, u), lerp(A[1] + A[2] * s, B[1] + B[2] * s, u)];
  };

  CW.tag = (x, P, o) => {
    const fs = o.size || 34, d = o.hole === 'right' ? -1 : 1;
    x.save(); x.font = `900 ${fs}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const tw = x.measureText(o.text).width, w = tw + fs * 1.5, h = fs * 1.5, e = o.x - d * w / 2, hx = e + d * fs * .42;
    if (o.to) { x.strokeStyle = mix(P.amberDark, P.ink, .2); x.lineWidth = 2; x.beginPath(); x.moveTo(hx, o.y); x.lineTo(o.to[0], o.to[1]); x.stroke(); }
    x.fillStyle = P.card; x.beginPath();
    x.moveTo(e + d * h * .32, o.y - h / 2); x.lineTo(o.x + d * w / 2, o.y - h / 2); x.lineTo(o.x + d * w / 2, o.y + h / 2);
    x.lineTo(e + d * h * .32, o.y + h / 2); x.lineTo(e, o.y + h * .18); x.lineTo(e, o.y - h * .18); x.closePath(); x.fill();
    x.fillStyle = mix(P.card, P.ink, .7); x.beginPath(); x.arc(hx, o.y, fs * .12, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.fillText(o.text, o.x + d * fs * .3, o.y + fs * .04);
    x.restore();
    return { w, h };
  };

  const K = .55;
  function block(x, P, X, Y, w, d, h, roof, face, o = {}) {
    const fh = h * K;
    x.fillStyle = face; x.fillRect(X, Y + d, w, fh);
    if (o.rows) {
      const { cols, rows } = o, gx = w / cols, gy = fh / (rows + .4);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const on = hash(o.seed + i, j, 7) < (o.lit ?? 0);
        x.fillStyle = on ? mix(P.window, P.rim, .2) : mix(face, P.ink, .35);
        x.fillRect(X + i * gx + gx * .22, Y + d + fh * .08 + j * gy + gy * .2, gx * .56, gy * .5);
      }
    }
    x.fillStyle = roof; x.fillRect(X, Y, w, d);
    x.fillStyle = mix(roof, P.rim, .22); x.fillRect(X, Y, w, Math.max(1.5, d * .08));
  }
  const plate = CW.plate = (x, P, o) => {
    const r = Math.min(o.w, o.h) * .08;
    x.fillStyle = mix(P.sheet, P.sheetShade, .25); x.beginPath(); x.roundRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h, r); x.fill();
    x.fillStyle = mix(P.sheet, P.rim, .15); x.beginPath(); x.roundRect(o.x - o.w / 2 + 3, o.y - o.h / 2 + 3, o.w - 6, o.h - 6, r * .8); x.fill();
  }

  CW.shops = (x, P, o) => {
    if (o.plate !== false) plate(x, P, o);
    const X0 = o.x - o.w / 2, Y0 = o.y - o.h / 2, sy = Y0 + o.h * .5;
    x.fillStyle = mix(P.sheet2, P.sheet, .55); x.fillRect(X0 + 10, sy - 12, o.w - 20, 24);
    const aw = [[P.awningA, P.awningB], ['#3f7a6a', P.awningB], [P.amber, P.awningB], ['#5f6f86', P.awningB]];
    const n = 5, bw = (o.w - 40) / n;
    for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
      const X = X0 + 20 + i * bw + 3, w = bw - 6, d = o.h * .2, Y = row ? sy + 16 : sy - 16 - d - 34 * K;
      const roof = mix(P.roof, P.sheet, .25 + hash(i, row, 3) * .3), face = mix(P.wall, P.ink, .12);
      block(x, P, X, Y, w, d, 34, roof, face, { cols: 2, rows: 1, lit: o.wake, seed: i * 3 + row * 11 });
      if (!row) {
        const [a, b] = aw[(i + o.seed) % aw.length], ay = Y + d + 34 * K;
        for (let k = 0; k < 6; k++) { x.fillStyle = k % 2 ? b : a; x.fillRect(X + k * w / 6, ay - 2, w / 6 + .5, 9); }
      }
    }
  };
  CW.towers = (x, P, o) => {
    if (o.plate !== false) plate(x, P, o);
    const X0 = o.x - o.w / 2, Y0 = o.y - o.h / 2;
    const T = [[.08, .5, .2, 150], [.32, .34, .17, 210], [.52, .56, .18, 130], [.74, .28, .18, 185], [.2, .1, .15, 95]];
    for (const [i, [u, v, ww, h]] of [...T.entries()].sort((a, b) => a[1][1] - b[1][1])) {
      const w = o.w * ww, d = w * .8, X = X0 + o.w * u, Y = Y0 + o.h * v - 30;
      const face = mix(P.facade, P.sheet2, hash(i, 5) * .5), roof = mix(P.facade, P.rim, .25);
      block(x, P, X, Y, w, d, h, roof, face, { cols: 3, rows: Math.round(h / 22), lit: o.wake * .85, seed: i * 17 });
    }
  };
  CW.factory = (x, P, o) => {
    if (o.plate !== false) plate(x, P, o);
    const X0 = o.x - o.w / 2, Y0 = o.y - o.h / 2, w = o.w * .62, d = o.h * .34, X = X0 + o.w * .08, Y = Y0 + o.h * .18;
    block(x, P, X, Y, w, d, 70, mix(P.roof, P.sheet2, .35), mix(P.wall, P.roof, .3), { cols: 6, rows: 2, lit: o.wake * .7, seed: 51 });
    x.fillStyle = mix(P.roof, P.ink, .35);
    for (let k = 0; k < 6; k++) x.fillRect(X + k * w / 6 + w / 12, Y + 4, 5, d - 8);
    const cx = X + w + o.w * .12, cy = Y + d * .3, cr = o.w * .045, ch = 150;
    x.fillStyle = mix(P.wall, P.roof, .5); x.fillRect(cx - cr, cy, cr * 2, ch * K);
    x.fillStyle = mix(P.wall, P.roof, .35); x.beginPath(); x.ellipse(cx, cy, cr, cr * .5, 0, 0, TAU); x.fill();
    x.fillStyle = mix(P.ink, P.roof, .3); x.beginPath(); x.ellipse(cx, cy, cr * .62, cr * .3, 0, 0, TAU); x.fill();
    if (o.wake > 0) for (let k = 0; k < 7; k++) {
      const age = ((o.t || 0) - k * .45) % 3.15;
      if (age < 0) continue;
      const u = age / 3.15, a = (1 - u) * .55 * o.wake;
      x.fillStyle = `rgba(236,229,214,${a})`; x.beginPath(); x.arc(cx + u * 120, cy - 6 - u * 70, cr * (.7 + u * 1.8), 0, TAU); x.fill();
    }
    block(x, P, X0 + o.w * .12, Y0 + o.h * .66, o.w * .3, o.h * .14, 30, mix(P.roof, P.sheet, .3), mix(P.wall, P.ink, .1), { cols: 3, rows: 1, lit: o.wake, seed: 60 });
  };
  CW.city = (x, P, o) => {
    if (o.plate !== false) plate(x, P, o);
    x.save(); x.beginPath(); x.roundRect(o.x - o.w / 2 + 6, o.y - o.h / 2 + 6, o.w - 12, o.h - 12, Math.min(o.w, o.h) * .06); x.clip();
    x.translate(o.x, o.y); const s = Math.min((o.w - 12) / 1500, (o.h - 12) / 960); x.scale(s, s);
    F.citymap.draw(x, P, { t: o.t || 0 });
    x.restore();
  };

  CW.track = (x, P, y, x0, x1) => {
    x.fillStyle = mix(P.wood, P.sheet2, .4);
    for (let X = x0; X < x1; X += 16) x.fillRect(X, y - 11, 6, 22);
    x.fillStyle = mix(P.ink, P.sheet2, .3); x.fillRect(x0, y - 7, x1 - x0, 2.5); x.fillRect(x0, y + 4.5, x1 - x0, 2.5);
  };
  CW.train = (x, P, o) => {
    const { y } = o, n = o.n || 6, cols = ['#7a4f3a', '#44536b', '#6f7a5a', '#8a6044', '#5f6f86', '#735048'];
    let X = o.x;
    x.fillStyle = mix(P.ink, P.coat, .2); x.beginPath(); x.roundRect(X - 64, y - 12, 64, 24, [3, 12, 12, 3]); x.fill();
    x.fillStyle = mix(P.ink, P.rim, .12); x.fillRect(X - 64, y - 12, 18, 24);
    x.fillStyle = mix(P.ink, P.amberDark, .3); x.beginPath(); x.arc(X - 18, y, 5, 0, TAU); x.fill();
    X -= 70;
    for (let i = 0; i < n; i++) {
      const c = cols[(i + (o.seed || 0)) % cols.length];
      x.fillStyle = c; x.fillRect(X - 52, y - 11, 52, 22);
      x.fillStyle = mix(c, P.rim, .2); x.fillRect(X - 50, y - 9, 48, 5);
      X -= 58;
    }
  };
})();
