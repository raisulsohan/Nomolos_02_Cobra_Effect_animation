(function () {
  'use strict';
  const F = FILM, PR = F.props, MAP = F.citymap, PL = F.plain, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, keyed, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-10'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const S4 = F.getScene('seq-04').api, S7 = F.getScene('seq-07').api, CH = S4.CH;
  const C7 = F.cues('seq-07'), PUSH7_END = C7.s('S023').t0 + .6;

  const T = {
    quietly: 1.689, changed: 2.041, game: 2.589,
    people: C.s('S048').t0, noLonger: 3.84, what48: 5.008,
    trying: 6.33, what49: 7.033,
    most: C.s('S050').t0, up: 10.104, nicely: 10.274, nicelyEnd: 10.704,
    not: 11.471,
    come: 12.844, apart1: 12.964, apart2: 14.204, spectacular: 14.864, fashion: 15.624,
  };
  const GRID = [T.quietly, T.quietly + .5];
  const FLIP = [T.changed, T.changed + .46];
  const TURN1 = [T.game, .35, .35];
  const TURN2 = [T.trying, .6, .35];
  const TILT = [T.people + .05, T.people + 1.25];
  const PUSH = [T.come - .05, T.come + 1.45];
  const U_MID = PORT ? .55 : .55;

  const gone = i => hash(i, 77) < .52;
  const MA = S7.mcam(0), MB = S7.mcam(PUSH7_END);
  const uAt = t => keyed(t, [[TILT[0], 0], [TILT[1], U_MID], [PUSH[0], U_MID], [PUSH[1], 1]]);
  function mcam(t) {
    const u = uAt(t), drift = lerp(1, 1.02, smooth(t / (TILT[0] - .05)));
    return { x: lerp(MA.x, MB.x, u), y: lerp(MA.y, MB.y, u), z: lerp(MA.z * drift, MB.z, u) };
  }
  const toWorld = (m, sx, sy) => [m.x + (sx - W / 2) / m.z, m.y + (sy - H / 2) / m.z];

  const cw = CH.w, chh = CH.h, pad = cw * .1, AX0 = pad, AX1 = cw - pad * .6, AY0 = chh - pad * .9, AY1 = pad * 1.5;
  const X = u => lerp(AX0, AX1, u), Y = v => lerp(AY0, AY1, v);
  const CA = S7.chartT(0), CB = S7.chartT(PUSH7_END), FX = X(.85), FY = Y(.5);
  function chartAt(u) {
    const s = CA.s * Math.pow(CB.s / CA.s, u);
    const sx = lerp(CA.ox + CA.s * FX, CB.ox + CB.s * FX, u), sy = lerp(CA.oy + CA.s * FY, CB.oy + CB.s * FY, u);
    return { s, ox: sx - s * FX, oy: sy - s * FY };
  }
  const chartT = t => chartAt(uAt(t));
  const SHEET_AT = (() => { const c = chartAt(U_MID); return toWorld(mcam(TILT[1] + 1), c.ox + c.s * cw / 2, c.oy + c.s * chh / 2); })();

  const CELL = 100, GX = [-1100, 900], GY = [-650, 650];
  function grid(x, t) {
    const k = smooth((t - GRID[0]) / (GRID[1] - GRID[0])); if (k <= 0) return;
    const xs = lerp(GX[0], GX[1], k);
    x.save(); x.strokeStyle = mix(P.ink, P.sheet, .45); x.lineWidth = 2.6; x.globalAlpha = .55; x.lineCap = 'butt'; x.setLineDash([]);
    x.beginPath();
    for (let gx = GX[0]; gx <= xs; gx += CELL) { x.moveTo(gx, GY[0]); x.lineTo(gx, GY[1]); }
    for (let gy = GY[0]; gy <= GY[1]; gy += CELL) { x.moveTo(GX[0], gy); x.lineTo(xs, gy); }
    x.stroke(); x.restore();
  }

  const CARD = { x: -400, y: 130, w: 180, h: 120 };
  const CARD_SEEN_FROM = [CARD.x, CARD.y];
  function flipK(t) { return easeIO((t - FLIP[0]) / (FLIP[1] - FLIP[0])); }
  function cobraMark(x, s) {
    const pts = []; for (let i = 0; i < 16; i++) { const u = i / 15; pts.push([22 - u * 44, Math.sin(u * 7 + 1.3) * 5]); }
    x.save(); x.scale(s, s); PR.cobraBody(x, P, pts, { w: 6.5, head: 'side' }); x.restore();
  }
  function card(x, t) {
    const k = flipK(t), lift = Math.sin(Math.PI * k), sy = Math.abs(Math.cos(Math.PI * k)), face = k >= .5;
    x.save(); x.translate(CARD.x, CARD.y - lift * 6); x.scale(1 + lift * .04, Math.max(.02, sy) * (1 + lift * .04));
    x.setLineDash([]); x.lineCap = 'butt'; x.lineJoin = 'miter';
    const paper = mix(P.card, P.parchment, .25);
    x.fillStyle = paper; x.beginPath(); x.roundRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 8); x.fill();
    x.strokeStyle = mix(paper, P.ink, .55); x.lineWidth = 3; x.beginPath(); x.roundRect(-CARD.w / 2 + 9, -CARD.h / 2 + 9, CARD.w - 18, CARD.h - 18, 4); x.stroke();
    if (!face) {
      x.fillStyle = mix(paper, P.parchmentEdge, .6);
      x.save(); x.rotate(Math.PI / 4); x.fillRect(-13, -13, 26, 26); x.restore();
      for (const [cx, cy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) x.fillRect(cx * (CARD.w / 2 - 22) - 3, cy * (CARD.h / 2 - 22) - 3, 6, 6);
    } else {
      x.save(); x.translate(-52, 2); cobraMark(x, 1.35); x.restore();
      x.fillStyle = P.ink; x.fillRect(-11, -8, 22, 4); x.fillRect(-11, 4, 22, 4);
      PR.coin(x, P, 'flat', 46, 0, 21, 0);
    }
    x.restore();
  }

  const CROWD = F.rulers.crowd(P, 32);
  const CELLS = [];
  for (const cx of [-450, -350, -250, -150]) for (const cy of [-350, -250, -150, -50]) CELLS.push([cx, cy]);
  CELLS.push([-250, 50], [-150, 50], [50, -350], [150, -250], [250, -150], [50, -50], [150, 50], [350, 50], [450, -50], [250, 150], [350, 250], [550, -150]);
  const PIECES = CELLS.map(([cx, cy], i) => ({
    x: cx + (hash(i, 21) - .5) * 30, y: cy + (hash(i, 22) - .5) * 30, h0: hash(i, 23) * TAU, look: CROWD[i % CROWD.length].look, s: 2.5 + hash(i, 24) * .3,
  }));
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  function heading(p, i, t) {
    const a1 = Math.atan2(CARD_SEEN_FROM[1] - p.y, CARD_SEEN_FROM[0] - p.x), a2 = Math.atan2(SHEET_AT[1] - p.y, SHEET_AT[0] - p.x);
    const k1 = easeIO((t - TURN1[0] - hash(i, 25) * TURN1[1]) / TURN1[2]), k2 = easeIO((t - TURN2[0] - hash(i, 26) * TURN2[1]) / TURN2[2]);
    const h1 = p.h0 + wrap(a1 - p.h0) * k1;
    return h1 + wrap(a2 - h1) * k2;
  }
  function standee(x, o) {
    const { look: lk, h, s } = o, c = Math.sin(h), sd = Math.cos(h);
    const coat = lk.coat, skin = lk.skin, hair = lk.headColor || lk.hair, trou = lk.trouser;
    x.save(); x.translate(o.x, o.y); x.scale(s, s);
    x.fillStyle = mix(P.wood, P.ink, .35); x.beginPath(); x.ellipse(0, 0, 7.4, 3.6, 0, 0, TAU); x.fill();
    x.fillStyle = mix(P.wood, P.rim, .15); x.beginPath(); x.ellipse(0, -.9, 6.6, 2.9, 0, 0, TAU); x.fill();
    x.fillStyle = trou; x.fillRect(-2.9, -8.6, 5.8, 7.8);
    x.fillStyle = coat; x.beginPath(); x.moveTo(-4.2, -8.2); x.lineTo(-3.6, -16.4); x.quadraticCurveTo(0, -18.2, 3.6, -16.4); x.lineTo(4.2, -8.2); x.closePath(); x.fill();
    x.fillStyle = mix(coat, P.rim, .25); x.fillRect(-4.2 + 8.4 * clamp(sd * .5 + .5) - .9, -16, 1.8, 7.4);
    x.fillStyle = hair; x.beginPath(); x.arc(0, -20.6, 4.1, 0, TAU); x.fill();
    if (c > -.25) {
      const k = clamp((c + .25) / 1.25), w = 4.1 * (.35 + .65 * k), cx = sd * 1.6 * (1 - k * .55);
      x.fillStyle = skin; x.beginPath(); x.ellipse(cx, -19.9, w, 3.3, 0, 0, TAU); x.fill();
      x.fillStyle = mix(skin, P.ink, .55); x.beginPath(); x.arc(cx - 1.3 * k + sd * .5, -20.4, .55, 0, TAU); x.arc(cx + 1.3 * k + sd * .5, -20.4, .55, 0, TAU); x.fill();
    }
    x.restore();
  }
  function pieces(x, t) {
    x.setLineDash([]); x.lineCap = 'butt';
    const order = PIECES.map((p, i) => i).sort((a, b) => PIECES[a].y - PIECES[b].y);
    for (const i of order) { const p = PIECES[i], L = 26 * p.s / 2.6;
      x.fillStyle = 'rgba(38,32,26,.22)'; x.beginPath(); x.ellipse(p.x + PL.SHADOW[0] * L * .5, p.y + PL.SHADOW[1] * L * .5, L * .55, 4.2 * p.s / 2.6, .62, 0, TAU); x.fill(); }
    for (const i of order) { const p = PIECES[i]; standee(x, { x: p.x, y: p.y, h: heading(p, i, t), s: p.s, look: p.look }); }
  }

  const base = u => .33 + .16 * u;
  const U0 = .7, U1 = .94;
  const CLIMB = (() => {
    const c = S7.CURVE, k0 = c.findIndex((p, i) => i && p[1] > c[i - 1][1]) - 1, seg = c.slice(k0), [u0, v0] = seg[0], [u1, v1] = seg.at(-1);
    const pts = F.rope.smooth(seg.map(([u, v]) => [(u - u0) / (u1 - u0), (v - v0) / (v1 - v0)]), 48);
    return k => { k = clamp(k); let i = 1; while (i < pts.length - 1 && pts[i][0] < k) i++; const [xa, ya] = pts[i - 1], [xb, yb] = pts[i]; return clamp(lerp(ya, yb, (k - xa) / Math.max(1e-6, xb - xa))); };
  })();
  const LW = cw * .022;
  const uEndC = t => keyed(t, [[T.noLonger, 0], [T.noLonger + 1.05, .33], [T.most + .15, .33], [T.up + .2, U0 + .03], [T.not, U0 + .03], [T.not + .45, U0 + .07], [T.apart1, U0 + .07], [T.apart1 + .55, U0 + .13], [T.apart2, U0 + .13], [T.apart2 + .7, U1]]);
  const uEndA = t => keyed(t, [[T.what49, 0], [T.what49 + .65, .33], [T.most + .15, .33], [T.up + .2, U0 + .03], [T.not, U0 + .03], [T.not + .45, U0 + .07], [T.apart1, U0 + .07], [T.apart1 + .55, U0 + .13], [T.apart2, U0 + .13], [T.apart2 + .7, U1]]);
  const D0 = t => keyed(t, [[T.nicely, .06], [T.nicelyEnd, .045]]);
  const AMP_A = t => keyed(t, [[T.not, 0], [T.not + .45, .13], [T.apart1, .13], [T.apart1 + .55, .25], [T.apart2, .25], [T.apart2 + .7, .644]]);
  const AMP_C = t => keyed(t, [[T.not, 0], [T.not + .45, .13], [T.apart1, .13], [T.apart1 + .55, .25], [T.apart2, .25], [T.apart2 + .7, .606]]);
  const dev = u => u > U0 ? CLIMB((u - U0) / (1 - U0)) : 0;
  const vA = (u, t) => base(u) - D0(t) + AMP_A(t) * dev(u), vC = (u, t) => base(u) + D0(t) - AMP_C(t) * dev(u);
  const HOOK = t => smooth((t - (T.spectacular + .1)) / .55);
  const INK = t => smooth((t - (T.spectacular + .15)) / .6);
  const FANG = t => smooth((t - T.fashion) / .23);
  const HOOK_DX = [17, 24], HOOK_DY = 12;
  function jaw(which, t) {
    const v = which === 'a' ? vA : vC, uEnd = which === 'a' ? uEndA(t) : uEndC(t), pts = [];
    if (uEnd <= 0) return { pts, hook: [] };
    const n = Math.max(2, Math.ceil(uEnd * 60));
    for (let i = 0; i <= n; i++) { const u = uEnd * i / n; pts.push([X(u), Y(v(u, t))]); }
    const hook = [];
    if (uEnd >= U1 && HOOK(t) > 0) {
      const tip = pts.at(-1), dir = which === 'a' ? 1 : -1, hk = HOOK(t);
      const c = [tip[0] + HOOK_DX[0], tip[1] - dir * 7], e = [tip[0] + HOOK_DX[1], tip[1] + dir * HOOK_DY];
      const m = Math.max(2, Math.ceil(hk * 14));
      for (let i = 1; i <= m; i++) { const q = hk * i / m, a = 1 - q; hook.push([a * a * tip[0] + 2 * a * q * c[0] + q * q * e[0], a * a * tip[1] + 2 * a * q * c[1] + q * q * e[1]]); }
    }
    return { pts, hook };
  }
  const path = (x, pts) => { pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); };
  function creamLine(x, pts) {
    if (pts.length < 2) return;
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); path(x, pts); x.setLineDash([]); x.globalAlpha = .22; x.strokeStyle = '#5a4630'; x.lineWidth = LW * .9; x.stroke();
    x.beginPath(); path(x, pts); x.setLineDash([LW * 1.5, LW * 1.1]); x.globalAlpha = .55; x.strokeStyle = '#ffe9b8'; x.lineWidth = LW * 1.25; x.shadowColor = 'rgba(255,236,190,.9)'; x.shadowBlur = 14; x.stroke();
    x.shadowBlur = 0; x.globalAlpha = 1; x.strokeStyle = '#fff6e2'; x.lineWidth = LW * .6; x.stroke();
    x.restore();
  }
  function amberLine(x, pts) {
    if (pts.length < 2) return;
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.setLineDash([]);
    x.beginPath(); path(x, pts); x.strokeStyle = P.amber; x.lineWidth = LW; x.stroke();
    x.restore();
  }
  function fang(x, at, dir, k, len) {
    if (k <= 0) return;
    const l = len * k;
    x.fillStyle = P.rim; x.beginPath(); x.moveTo(at[0] - 7, at[1]); x.lineTo(at[0] + 4, at[1]); x.quadraticCurveTo(at[0] + 1, at[1] + dir * l * .6, at[0] - 8, at[1] + dir * l); x.quadraticCurveTo(at[0] - 4, at[1] + dir * l * .5, at[0] - 7, at[1]); x.closePath(); x.fill();
  }
  function tongue(x, from, t) {
    const fl = (t * 1.5) % 1, k = fl < .3 ? Math.sin(Math.PI * fl / .3) : 0; if (k <= 0) return;
    x.save(); x.strokeStyle = P.cream; x.lineWidth = LW * .3; x.lineCap = 'round'; x.setLineDash([]);
    const l = 62 * k, [fx, fy] = from;
    x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + l, fy + 3); x.moveTo(fx + l, fy + 3); x.lineTo(fx + l + 14 * k, fy - 6); x.moveTo(fx + l, fy + 3); x.lineTo(fx + l + 13 * k, fy + 12); x.stroke();
    x.restore();
  }
  function sheet(x, t) {
    x.setLineDash([]); x.lineCap = 'butt'; x.lineJoin = 'miter';
    MAP.chart(x, P, { w: cw, h: chh, draw: 0, label: 0 });
    const A = jaw('a', t), Cc = jaw('c', t), ink = INK(t);
    if (ink > 0 && A.hook.length && Cc.hook.length) {
      const i0 = Math.round(U0 * 60), ua = A.pts.slice(i0).concat(A.hook), uc = Cc.pts.slice(i0).concat(Cc.hook);
      const x0 = X(U0), x1 = Math.max(ua.at(-1)[0], uc.at(-1)[0]);
      x.save(); x.beginPath(); x.rect(x0 - 2, -20, lerp(0, x1 - x0 + 4, ink), chh + 40); x.clip();
      x.fillStyle = P.ink; x.beginPath(); path(x, ua); uc.slice().reverse().forEach(p => x.lineTo(p[0], p[1])); x.closePath(); x.fill();
      x.restore();
    }
    creamLine(x, Cc.pts.concat(Cc.hook));
    amberLine(x, A.pts.concat(A.hook));
    if (A.hook.length && Cc.hook.length) {
      const fk = FANG(t);
      fang(x, A.hook.at(-1), 1, fk, 34); fang(x, Cc.hook.at(-1), -1, fk, 20);
      if (fk >= 1) tongue(x, [X(U0) + 18, Y(base(U0)) + 2], t - T.fashion);
    }
    const size = PORT ? 30 : 27, fw = t => smooth(t / .22);
    x.font = `600 ${size}px NS`; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    const kw = fw(t - T.what48), km = fw(t - T.what49);
    if (kw > 0) {
      x.save(); x.globalAlpha = kw; x.translate(X(.02), Y(.6)); x.scale(lerp(1.06, 1, kw), lerp(1.06, 1, kw)); x.lineJoin = 'round';
      x.strokeStyle = '#5a4630'; x.lineWidth = 2.8; x.globalAlpha = .72 * kw; x.strokeText('WHAT YOU WANT', 0, 0);
      x.globalAlpha = kw; x.fillStyle = '#fff6e2'; x.shadowColor = 'rgba(255,236,190,.9)'; x.shadowBlur = 12; x.fillText('WHAT YOU WANT', 0, 0); x.shadowBlur = 0;
      x.restore();
    }
    if (km > 0) { x.save(); x.globalAlpha = km; x.fillStyle = P.amber; x.translate(X(.02), AY0 - 5); x.scale(lerp(1.06, 1, km), lerp(1.06, 1, km)); x.fillText('WHAT YOU MEASURE', 0, 0); x.restore(); }
  }

  function draw(ctx, t) {
    const m = mcam(t), pk = smooth((t - PUSH[0]) / (PUSH[1] - PUSH[0]));
    L.background(ctx);
    L.sheet(ctx, m, 1, [0, 0], x => { x.setLineDash([]); x.lineCap = 'butt'; MAP.draw(x, P, { snakes: i => gone(i) ? 0 : 1, t: L.pose(t) }); grid(x, t); });
    L.sheet(ctx, m, 1, [0, 0], x => pieces(x, t), { flatShadow: [8, 11, 8, .4] });
    const lift = Math.sin(Math.PI * flipK(t));
    L.sheet(ctx, m, 1, [0, 0], x => card(x, t), { flatShadow: [8 + lift * 16, 11 + lift * 22, 8 + lift * 10, .4] });
    if (pk > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = F.rgba(F.hex(P.bgTop), .5 * pk); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const c = chartT(t);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => { x.save(); x.translate(c.ox, c.oy); x.scale(c.s, c.s); sheet(x, t); x.restore(); }, { flatShadow: [10, 14, 12, .4] });
    L.grade(ctx, t);
  }

  F.scene('seq-10', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { mcam, chartT, uAt, PIECES, CARD, jaw, X, Y } });
})();
