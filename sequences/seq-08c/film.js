(function () {
  'use strict';
  const F = FILM, PL = F.plain, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, easeOut, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-08c'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const B = F.getScene('seq-08b').api, TB = B.DUR;
  const T = { crack: 0.44, logic: 1.79, logicEnd: 2.14, and: 2.673, walk: 3.613 };

  const CY = B.COIN[1], CX = -560;

  const CAM0 = B.cam(TB);
  const LOWER = [T.and + .03, T.and + 1.83];
  const CLOSE = PORT ? { x: CX + 10, y: CY, z: 2.3 } : { x: CX - 30, y: CY + 8, z: 2.5 };
  function cam(t) {
    if (t <= LOWER[0]) return CAM0;
    const u = easeIO(clamp((t - LOWER[0]) / (LOWER[1] - LOWER[0]))), S = [CX, CY];
    const sc = c => [W / 2 + c.z * (S[0] - c.x), H / 2 + c.z * (S[1] - c.y)], a = sc(CAM0), b = sc(CLOSE);
    const z = CAM0.z * Math.pow(CLOSE.z / CAM0.z, u), sx = lerp(a[0], b[0], u), sy = lerp(a[1], b[1], u);
    return { x: S[0] - (sx - W / 2) / z, y: S[1] - (sy - H / 2) / z, z };
  }

  function jag(x0, y0, dir, a0, len, step, seed) {
    const pts = [[x0, y0]]; let a = a0, s = 0, x = x0, y = y0, k = 0;
    while (s < len && k < 200) {
      const st = step * (.7 + hash(k, seed, 1) * .7);
      a += (hash(k, seed, 2) - .5) * .9 + (a0 - a) * .35;
      x += Math.cos(a) * st; y += Math.sin(a) * st; s += st; k++;
      pts.push([x, y]);
    }
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const wob = pts.map((_, i) => .7 + .6 * hash(i, seed, 3));
    return { pts, cum, len: cum.at(-1), wob };
  }
  function pointAt(p, s) {
    let i = 1; while (i < p.cum.length - 1 && p.cum[i] < s) i++;
    const k = clamp((s - p.cum[i - 1]) / ((p.cum[i] - p.cum[i - 1]) || 1)), A = p.pts[i - 1], Bp = p.pts[i];
    return { at: [lerp(A[0], Bp[0], k), lerp(A[1], Bp[1], k)], a: Math.atan2(Bp[1] - A[1], Bp[0] - A[0]) };
  }
  const GROW = [T.crack, T.logic + .02];
  const bursts = (u, n) => { u = clamp(u); if (u >= 1) return 1; const s = Math.floor(u * n), f = u * n - s; return (s + easeOut(clamp(f / .5), 3)) / n; };
  const TOP = B.PLAIN.top + 4, REACH = PORT ? 820 : 700;
  const MAIN = [
    { ...jag(CX, CY, -1, -Math.PI / 2 - .06, CY - TOP, 24, 7), w: 1, grow: t => bursts((t - GROW[0]) / (GROW[1] - GROW[0]), 5) },
    { ...jag(CX, CY, 1, Math.PI / 2 - .05, REACH, 24, 8), w: 1, grow: t => bursts((t - GROW[0] - .05) / (GROW[1] - GROW[0] - .05), 5) },
  ];
  MAIN[0].pts.forEach(p => { p[1] = Math.max(p[1], TOP); });
  const BRANCHES = [[0, .22, .7, 70], [0, .5, -.75, 95], [0, .78, .6, 60], [1, .18, -.65, 85], [1, .42, .8, 110], [1, .7, -.6, 75]].map(([m, f, da, len], i) => {
    const s0 = MAIN[m].len * f, p = pointAt(MAIN[m], s0), when = GROW[0] + (GROW[1] - GROW[0]) * f + .06;
    return { ...jag(p.at[0], p.at[1], 1, p.a + da, len, 13, 30 + i), w: .5, grow: t => easeOut(clamp((t - when) / .35), 2) };
  });
  const OPEN = [T.logicEnd, T.and - .05];
  const width = t => lerp(1.2, 1.8, smooth((t - T.crack) / 1.4)) + 4.6 * smooth((t - OPEN[0]) / (OPEN[1] - OPEN[0]));
  const DARK = mix(P.ink, '#000000', .15), LIP = mix(P.rim, P.sheet, .2);
  function drawPath(x, p, lt, hw) {
    if (lt <= 1) return;
    const n = p.cum.findIndex(c => c >= lt), end = n < 0 ? p.pts.length - 1 : n, pts = p.pts.slice(0, end), last = pointAt(p, lt);
    pts.push(last.at);
    const hwAt = i => { const s = Math.min(p.cum[i] ?? lt, lt); return hw * p.wob[Math.min(i, p.wob.length - 1)] * clamp((lt - s) / 60) * lerp(1, .5, s / p.len); };
    const Lft = [], Rgt = [], hs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, h = hwAt(i);
      Lft.push([pts[i][0] - Math.cos(an) * h, pts[i][1] - Math.sin(an) * h]); Rgt.push([pts[i][0] + Math.cos(an) * h, pts[i][1] + Math.sin(an) * h]); hs.push(h);
    }
    x.fillStyle = DARK; x.beginPath(); Lft.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); for (let i = Rgt.length - 1; i >= 0; i--) x.lineTo(Rgt[i][0], Rgt[i][1]); x.closePath(); x.fill();
    const lit = Math.cos(p.pts.length > 1 ? Math.atan2(p.pts[1][1] - p.pts[0][1], p.pts[1][0] - p.pts[0][0]) + Math.PI / 2 : 0) >= 0 ? Rgt : Lft;
    x.strokeStyle = LIP; x.lineJoin = 'round'; x.lineCap = 'round';
    for (let i = 1; i < lit.length; i++) { const h = Math.min(hs[i - 1], hs[i]); if (h < .45) continue; x.lineWidth = Math.min(1.5, .35 + h * .35); x.beginPath(); x.moveTo(lit[i - 1][0], lit[i - 1][1]); x.lineTo(lit[i][0], lit[i][1]); x.stroke(); }
    const A = B.ARROW;
    x.save(); x.beginPath(); x.rect(A.x0, A.y - A.w / 2, A.x1 - A.x0, A.w); x.clip();
    x.strokeStyle = mix(P.sheet, P.sheetShade, .25); x.lineWidth = 1.8;
    for (const side of [Lft, Rgt]) { x.beginPath(); side.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); }
    x.restore(); x.lineCap = 'butt';
  }
  const CRUMBS = Array.from({ length: 14 }, (_, i) => {
    const m = MAIN[i % 2], s = 20 + hash(i, 51) * 260, p = pointAt(m, s), side = hash(i, 52) < .5 ? -1 : 1, an = p.a + Math.PI / 2;
    return { at: p.at, n: [Math.cos(an) * side, Math.sin(an) * side], t0: OPEN[0] + hash(i, 53) * (OPEN[1] - OPEN[0] - .25), r: 1.3 + hash(i, 54) * 1.4, s };
  });
  function crack(x, t) {
    if (t < T.crack) return;
    const hw = width(t) / 2;
    for (const p of MAIN) drawPath(x, p, p.len * p.grow(t), hw * p.w);
    for (const p of BRANCHES) drawPath(x, p, p.len * p.grow(t), hw * p.w);
    for (const c of CRUMBS) {
      const u = (t - c.t0) / .3; if (u < 0 || u >= 1 || MAIN[0].len * MAIN[0].grow(t) < c.s) continue;
      const d = lerp(hw + 5, 0, easeIO(u)), r = c.r * (1 - u * .7);
      x.fillStyle = mix(P.sheet, P.ink, .3); x.beginPath(); x.arc(c.at[0] + c.n[0] * d, c.at[1] + c.n[1] * d, r, 0, TAU); x.fill();
    }
  }

  const KIT = F.rulers.crowd(P, 48), LANE = 46, GAP = 18, VIEW_L = CAM0.x - W / 2 / CAM0.z;
  const NX = PORT ? 110 : 40;
  const XTRA = Array.from({ length: NX }, (_, k) => {
    const seed = 2000 + k, v = 215 * (.95 + hash(seed, 33) * .1);
    const x0 = (PORT ? CX - 2.2 * 215 : VIEW_L - 90) - k * (PORT ? 6.5 : 14) - hash(seed, 21) * 10;
    return { x0, y: CY + (hash(seed, 22) - .5) * LANE * 1.9, v, s: 1.2 * (.92 + hash(seed, 32) * .16), look: KIT[seed % KIT.length].look };
  });
  function extrasAt(tp, others) {
    const q = [];
    for (const e of XTRA) {
      const o = { x: e.x0 + e.v * tp, y: e.y, h: 0, run: 1, s: e.s, look: e.look };
      for (const b of [...others, ...q]) {
        const dx = o.x - b.x, dy = o.y - b.y; if (Math.abs(dx) > GAP || Math.abs(dy) > GAP) continue;
        const d = Math.hypot(dx, dy) || .01; if (d < GAP) o.y += (dy >= 0 ? 1 : -1) * (GAP - d) * .8;
      }
      o.ph = o.x * TAU / 46;
      q.push(o);
    }
    return q;
  }
  function crowd(x, t) {
    const tb = TB + t, cb = B.cam(tb), hw = W / 2 / cb.z + 40, hh = H / 2 / cb.z + 40;
    const q = B.crowdAt(F.motion.pose(tb)).filter(o => Math.abs(o.x - cb.x) < hw && Math.abs(o.y - cb.y) < hh)
      .map(o => ({ x: o.x, y: o.y, h: o.h, s: o.p.s, look: o.p.look, run: o.run, ph: o.ph }));
    const c = cam(t), vw = W / 2 / c.z + 40, vh = H / 2 / c.z + 40;
    const e = extrasAt(F.motion.pose(t), q).filter(o => Math.abs(o.x - c.x) < vw && Math.abs(o.y - c.y) < vh);
    const all = [...q, ...e].sort((a, b) => a.y - b.y);
    for (const o of all) PL.shadow(x, P, { x: o.x, y: o.y, s: o.s });
    for (const o of all) PL.person(x, P, { x: o.x, y: o.y, h: o.h, s: o.s, look: o.look, run: o.run, ph: o.ph });
  }

  function draw(ctx, t) {
    const tb = TB + t, c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => B.ground(x, tb));
    if (t >= T.crack) L.sheet(ctx, c, 1, [0, 0], x => crack(x, t), { shadow: false });
    L.sheet(ctx, c, 1, [0, 0], x => B.machine(x, tb));
    L.sheet(ctx, c, 1, [0, 0], x => crowd(x, t), { shadow: false });
    B.glows(ctx, c, tb);
    B.grade(ctx, tb);
  }

  F.scene('seq-08c', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC'), label: C.label,
    api: { DUR, cam, crack, CX, CY } });
})();
