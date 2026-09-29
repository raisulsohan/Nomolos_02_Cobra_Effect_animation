(function () {
  'use strict';
  const F = FILM, { TAU, clamp, lerp, tone, smooth } = F, PR = F.props || (F.props = {});

  PR.cobraColors = P => ({
    body: tone(P.ink, P.sheet2, .22), hi: tone(P.ink, P.sheet, .16), belly: tone(P.ink, P.cream, .42),
    mark: P.cream, band: tone(P.ink, P.sheet2, .05), eye: tone(P.ink, P.amber, .35), glint: P.rim, tongue: P.ink,
  });

  const girth = u => u < .06 ? lerp(.66, .8, u / .06) : u < .42 ? lerp(.8, 1, (u - .06) / .36) : lerp(1, .07, Math.pow((u - .42) / .58, 1.15));

  function edges(pts, wOf) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, h = wOf(i / (n - 1)) / 2;
      L.push([pts[i][0] + nx * h, pts[i][1] + ny * h]); R.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
    }
    return [L, R];
  }
  function ribbonPath(x, L, R) {
    x.beginPath(); x.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < L.length; i++) x.lineTo(L[i][0], L[i][1]);
    for (let i = R.length - 1; i >= 0; i--) x.lineTo(R[i][0], R[i][1]);
    x.closePath();
  }

  function sideHead(x, P, C, tip, dir, w, eye, tongue) {
    const [dx, dy] = dir, nx = -dy, ny = dx, L = w * 1.55, H = w * .56;
    const at = (a, b) => [tip[0] - dx * a + nx * b, tip[1] - dy * a + ny * b];
    if (tongue > 0) {
      const len = w * 1.1 * Math.sin(Math.PI * clamp(tongue)), base = at(w * .05, 0), end = [base[0] + dx * len, base[1] + dy * len];
      x.strokeStyle = C.tongue; x.lineCap = 'round'; x.lineWidth = w * .07;
      x.beginPath(); x.moveTo(base[0], base[1]); x.lineTo(end[0], end[1]);
      for (const s of [1, -1]) { x.moveTo(end[0], end[1]); x.lineTo(end[0] + dx * w * .22 + nx * s * w * .12, end[1] + dy * w * .22 + ny * s * w * .12); }
      x.stroke();
    }
    x.fillStyle = C.body; x.beginPath();
    const p0 = at(0, 0), p1 = at(L * .25, -H * .95), p2 = at(L, -H * .8), p3 = at(L, H * .8), p4 = at(L * .25, H * .95);
    x.moveTo(p0[0], p0[1]); x.quadraticCurveTo(at(0, -H * .7)[0], at(0, -H * .7)[1], p1[0], p1[1]);
    x.quadraticCurveTo(at(L * .6, -H * 1.12)[0], at(L * .6, -H * 1.12)[1], p2[0], p2[1]);
    x.lineTo(p3[0], p3[1]); x.quadraticCurveTo(at(L * .6, H * 1.05)[0], at(L * .6, H * 1.05)[1], p4[0], p4[1]);
    x.quadraticCurveTo(at(0, H * .7)[0], at(0, H * .7)[1], p0[0], p0[1]); x.fill();
    const m0 = at(w * .08, H * .28), m1 = at(L * .62, H * .42);
    x.strokeStyle = C.band; x.lineWidth = w * .05; x.beginPath(); x.moveTo(m0[0], m0[1]); x.lineTo(m1[0], m1[1]); x.stroke();
    const e = at(L * .36, -H * .38);
    if (eye > 0) {
      x.fillStyle = C.eye; x.beginPath(); x.arc(e[0], e[1], w * .13, 0, TAU); x.fill();
      x.fillStyle = C.glint; x.beginPath(); x.arc(e[0] - w * .03, e[1] - w * .04, w * .045, 0, TAU); x.fill();
    } else { x.strokeStyle = C.belly; x.lineWidth = w * .05; x.beginPath(); x.moveTo(e[0] - dx * w * .12, e[1] - dy * w * .12); x.lineTo(e[0] + dx * w * .12, e[1] + dy * w * .12); x.stroke(); }
  }

  PR.cobraBody = (x, P, pts, o = {}) => {
    const [u0, u1] = o.range || [0, 1], gu = o.widthFn || (u => girth(u0 + (u1 - u0) * u));
    const w = o.w || 26, C = PR.cobraColors(P), [L, R] = edges(pts, u => gu(u) * w);
    x.save();
    ribbonPath(x, L, R); x.fillStyle = C.body; x.fill();
    if (o.belly) {
      x.save(); ribbonPath(x, L, R); x.clip();
      const side = (o.belly > 0 ? L : R).slice(0, Math.round((L.length - 1) * (o.bellyTo ?? 1)) + 1);
      x.strokeStyle = C.belly; x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = w * .34;
      x.beginPath(); side.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
      x.restore();
    }
    x.save(); ribbonPath(x, L, R); x.clip(); x.strokeStyle = C.hi; x.lineWidth = w * .06; x.globalAlpha = .55;
    let acc = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc < w * .9) continue; acc = 0;
      const u = i / (pts.length - 1); if (u0 + (u1 - u0) * u > .9) break;
      const a = pts[i - 1], b = pts[i + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = gu(u) * w * .42;
      x.beginPath(); x.arc(pts[i][0], pts[i][1], r, ang + Math.PI * .62, ang + Math.PI * 1.38); x.stroke();
    }
    x.restore();
    if (o.head !== 'none') {
      const a = pts[0], b = pts[Math.min(3, pts.length - 1)], l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
      sideHead(x, P, C, [a[0] + (a[0] - b[0]) / l * w * 1.2, a[1] + (a[1] - b[1]) / l * w * 1.2], [(a[0] - b[0]) / l, (a[1] - b[1]) / l], w, o.eye ?? 1, o.tongue || 0);
    }
    x.restore();
  };

  PR.slitherPath = (head, len, o = {}) => {
    const amp = o.amp ?? len * .07, k = o.k ?? TAU / (len * .55), n = o.n || 48, dir = o.dir || 1, pts = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), X = head[0] - dir * u * len;
      const damp = smooth(u / .12) * (1 - .35 * u);
      pts.push([X, head[1] + Math.sin(k * X + (o.phase || 0)) * amp * damp]);
    }
    return pts;
  };

  PR.slitherAlong = (path, head, len, o = {}) => {
    const amp = o.amp ?? len * .06, k = o.k ?? TAU / (len * .6), n = o.n || 48, pts = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), sp = head - u * len, a = path(sp), b = path(sp + 1), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const w = Math.sin(k * sp) * amp * smooth(u / .12) * (1 - .35 * u);
      pts.push([a[0] - dy / l * w, a[1] + dx / l * w]);
    }
    return pts;
  };
  PR.downAndAlong = (top, groundY, dir = 1, r = 34) => {
    const v = Math.max(0, groundY - r - top[1]), arc = Math.PI / 2 * r;
    return s => {
      if (s <= v) return [top[0], top[1] + s];
      if (s <= v + arc) { const a = (s - v) / r; return [top[0] + dir * (r - r * Math.cos(a)), top[1] + v + r * Math.sin(a)]; }
      return [top[0] + dir * (r + s - v - arc), groundY];
    };
  };

  PR.cobraRear = (x, P, o = {}) => {
    const w = o.w || 26, C = PR.cobraColors(P), rise = clamp(o.rise ?? 1), hood = clamp(o.hood ?? 1), sway = o.sway || 0, back = o.view === 'back';
    const line = (pts) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); };
    x.save(); x.lineJoin = 'round'; x.lineCap = 'round';
    const RX = w * 3.1, RY = RX * .42, N = 126, TURNS = 1.75, A1 = Math.PI * 1.5, A0 = A1 - TURNS * TAU;
    const coil = [], cw = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, a = A0 + u * TURNS * TAU, r = lerp(1, .42, u);
      coil.push([Math.cos(a) * RX * r, -w * .55 + Math.sin(a) * RY * r - u * w * .5]);
      cw.push(w * (u < .22 ? lerp(.1, 1, Math.pow(u / .22, .7)) : 1));
    }
    const piece = (from, to) => {
      const pts = coil.slice(from, to + 1), ws = cw.slice(from, to + 1);
      const [L, R] = edges(pts, u => ws[Math.round(u * (ws.length - 1))]);
      ribbonPath(x, L, R); x.fillStyle = C.body; x.fill();
      x.save(); ribbonPath(x, L, R); x.clip();
      x.strokeStyle = C.hi; x.lineWidth = w * .22; x.globalAlpha = .5;
      line(pts.map((p, i) => [p[0], p[1] - ws[i] * .2])); x.stroke(); x.restore();
      x.strokeStyle = C.band; x.lineWidth = w * .045; x.globalAlpha = .75;
      for (const E of [L, R]) { line(E); x.stroke(); }
      x.globalAlpha = 1;
    };
    for (let i = 0; i < N; i += 18) piece(i, Math.min(N, i + 20));
    if (rise > .02) {
      const H = w * 6.2 * smooth(rise), base = coil[N], top = [sway * w * 1.2, base[1] - H];
      const c1 = [base[0] + w * 1.1, base[1] - w * .05], c2 = [top[0] + w * .25 * (1 - rise), top[1] + H * .5];
      const M = 44, col = [];
      for (let i = 0; i <= M; i++) { const u = i / M, p = 1 - u; col.push([p * p * p * base[0] + 3 * p * p * u * c1[0] + 3 * p * u * u * c2[0] + u * u * u * top[0], p * p * p * base[1] + 3 * p * p * u * c1[1] + 3 * p * u * u * c2[1] + u * u * u * top[1]]); }
      const len = [0]; for (let i = 1; i <= M; i++) len.push(len[i - 1] + Math.hypot(col[i][0] - col[i - 1][0], col[i][1] - col[i - 1][1]));
      const Lt = len[M], Lh = Math.min(Lt * .92, w * 4.3), HW = w * lerp(1, 3.3, smooth(hood));
      const prof = v => v < 0 || v > 1 ? 0 : v < .34 ? Math.pow(Math.sin(Math.PI / 2 * (v + .05) / .39), .75) : 1 - smooth((v - .34) / .66);
      const vOf = i => (Lt - len[i]) / Lh, widthAt = i => w + (HW - w) * prof(vOf(i));
      const [L, R] = edges(col, u => widthAt(Math.round(u * M)));
      const capR = widthAt(M) / 2, capY = w * .6;
      const outline = () => { ribbonPath(x, L, R); x.moveTo(top[0] + capR, top[1]); x.ellipse(top[0], top[1], capR, capY, 0, 0, TAU); };
      outline(); x.fillStyle = C.body; x.fill('nonzero');
      x.save(); outline(); x.clip('nonzero');
      if (!back) {
        const bw = i => w * .44 + (widthAt(i) - w) * .38;
        const [BL, BR] = edges(col, u => bw(Math.round(u * M)));
        ribbonPath(x, BL, BR); x.fillStyle = C.belly; x.fill();
        x.beginPath(); x.ellipse(top[0], top[1] + w * .05, bw(M) / 2, capY * .8, 0, 0, TAU); x.fill();
        x.strokeStyle = C.band; x.lineWidth = w * .035; x.globalAlpha = .45;
        for (let i = 3; i < M; i += 2) if (vOf(i) > .95) { x.beginPath(); x.moveTo(BL[i][0], BL[i][1]); x.lineTo(BR[i][0], BR[i][1]); x.stroke(); }
        x.globalAlpha = smooth((hood - .25) / .4); x.lineWidth = w * .14;
        for (const v of [.3, .46]) { let i = 0; while (i < M && vOf(i) > v) i++; x.beginPath(); x.moveTo(BL[i][0], BL[i][1]); x.quadraticCurveTo(col[i][0], col[i][1] + w * .12, BR[i][0], BR[i][1]); x.stroke(); }
        x.globalAlpha = 1;
      } else {
        x.strokeStyle = C.hi; x.lineWidth = w * .2; x.globalAlpha = .45; line(col.slice(0, M - 3)); x.stroke(); x.globalAlpha = 1;
        if (hood > .15) {
          let i = 0; while (i < M && vOf(i) > .34) i++;
          const s = smooth((hood - .15) / .6), cx = col[i][0], cy = col[i][1], hw = widthAt(i) / 2, rx = hw * .3 * s, ry = w * .42 * s, ex = hw * .42 * s;
          x.strokeStyle = C.mark; x.lineWidth = w * .2 * s;
          for (const d of [-1, 1]) { x.beginPath(); x.ellipse(cx + d * ex, cy, rx, ry, 0, 0, TAU); x.stroke(); }
          x.beginPath(); x.moveTo(cx - ex + rx * .6, cy + ry * .9); x.quadraticCurveTo(cx, cy + ry * 2.4, cx + ex - rx * .6, cy + ry * .9); x.stroke();
        }
      }
      x.restore();
      x.strokeStyle = C.band; x.lineWidth = w * .045; x.globalAlpha = .75;
      line(L); x.stroke(); line(R); x.stroke();
      x.beginPath(); x.ellipse(top[0], top[1], capR, capY, 0, Math.PI, TAU); x.stroke(); x.globalAlpha = 1;
      const hx = top[0], hy = top[1] - w * .22;
      if (o.tongue > 0 && !back) {
        const tl = w * .8 * Math.sin(Math.PI * clamp(o.tongue)), ty = hy + w * .42;
        x.strokeStyle = C.tongue; x.lineWidth = w * .07;
        x.beginPath(); x.moveTo(hx, ty); x.lineTo(hx, ty + tl);
        for (const d of [-1, 1]) { x.moveTo(hx, ty + tl); x.lineTo(hx + d * w * .13, ty + tl + w * .2); } x.stroke();
      }
      x.fillStyle = C.body; x.beginPath(); x.ellipse(hx, hy, w * .64, w * .52, 0, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(hx, hy + w * .24, w * .4, w * .3, 0, 0, TAU); x.fill();
      if (!back) for (const d of [-1, 1]) {
        x.fillStyle = C.eye; x.beginPath(); x.arc(hx + d * w * .36, hy - w * .06, w * .12, 0, TAU); x.fill();
        x.fillStyle = C.glint; x.beginPath(); x.arc(hx + d * w * .36 - w * .03, hy - w * .1, w * .04, 0, TAU); x.fill();
      }
    }
    x.restore();
  };
})();
