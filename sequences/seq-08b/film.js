(function () {
  'use strict';
  const F = FILM, PR = F.props, FARM = F.farm, CW = F.clockwork, PL = F.plain, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, easeOut, easeIn, easeOutBack, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-08b'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const S8 = F.getScene('seq-08').api, T8 = S8.DUR;
  const T = {
    powerful: 1.043, s36: C.s('S036').t0, modern: 2.844, runs: 3.342, it: 3.673,
    s37: C.s('S037').t0, tags: [4.15, 5.04, 5.9, 6.82],
    s38: C.s('S038').t0, supervise: 9.02, simply: 10.3, profitable: 11.6,
    s39: C.s('S039').t0, incentive: 13.258, crowd: 14.172, run: 14.655, pointing: 15.955,
  };

  const COIN0 = (() => {
    const c = S8.cam(T8), at = S8.coinAt(F.motion.pose(T8)).at;
    return [W / 2 + c.z * (at[0] - c.x), H / 2 + c.z * (at[1] - c.y)];
  })();
  const SQI = 2 * Math.floor(Math.min(COIN0[0], W - COIN0[0], COIN0[1], H - COIN0[1]));
  const SQ = 206;
  const KC = SQ / SQI;
  const PULL = [.3, 3.7], CROP = [.3, 1.8], BLEND = [.8, 2.3];
  const STAGE_END = 2;
  const [CARD, CX] = F.canvas(W, H);
  let cardAt = null;
  function cardImage(ts) {
    if (cardAt !== ts) {
      if (CX.reset) CX.reset(); else { CX.setTransform(1, 0, 0, 1, 0, 0); CX.globalAlpha = 1; CX.globalCompositeOperation = 'source-over'; CX.filter = 'none'; CX.clearRect(0, 0, W, H); }
      S8.draw(CX, ts); cardAt = ts;
    }
    return CARD;
  }
  function cropAt(t) {
    const u = easeIO((t - CROP[0]) / (CROP[1] - CROP[0])), h = SQI / 2;
    return [lerp(0, COIN0[0] - h, u), lerp(0, COIN0[1] - h, u), lerp(W, COIN0[0] + h, u), lerp(H, COIN0[1] + h, u)];
  }
  const toWorld = p => [(p[0] - COIN0[0]) * KC, (p[1] - COIN0[1]) * KC];

  const HUB = { x: 0, y: 0, r: 188, n: 40, plate: 156 };
  const GR = 78, GN = 16, DRIVE = { x: 0, y: HUB.r + 60, r: 60, n: 13 };
  const LAY = PORT ? {
    gears: [225, 315, 135, 45], plates: [[-270, -500], [270, -500], [-270, 500], [270, 500]], pw: 400, ph: 200,
    tags: [[-325, -335], [325, -335], [-325, 335], [325, 335]], track: 650, lantern: [0, -335],
    beltEnd: [[-150, -430], [150, -430], [-150, 430], [150, 430]], coin: [30, 1450], plainTop: 780, camPlain: [-250, 1465, 1],
  } : {
    gears: [215, 325, 145, 35], plates: [[-700, -290], [700, -290], [-700, 290], [700, 290]], pw: 360, ph: 240,
    tags: [[-420, -48], [420, -48], [-420, 52], [420, 52]], track: 470, lantern: [0, -330],
    beltEnd: [[-545, -250], [545, -250], [-545, 250], [545, 250]], coin: [30, 1210], plainTop: 640, camPlain: [-590, 1220, 1],
  };
  const KINDS = ['shops', 'towers', 'city', 'factory'];
  const WORDS = ['COMMISSIONS', 'BONUSES', 'BOUNTIES', 'SALES TARGETS'];
  const GEARS = LAY.gears.map(d => { const a = d * Math.PI / 180, R = HUB.r + GR; return { x: Math.cos(a) * R, y: Math.sin(a) * R }; });
  const PULLEY_R = 30, END_R = 22;
  const BELTS = GEARS.map((g, i) => ({ a: [g.x, g.y, PULLEY_R], b: [LAY.beltEnd[i][0], LAY.beltEnd[i][1], END_R] }));
  const SOUTH = { a: [DRIVE.x, DRIVE.y, 30], b: [0, LAY.coin[1] - 70, 30] };
  const COIN = LAY.coin;

  const START = T.s36, RISE = .55;
  const hubA = t => .55 * CW.run(t, START, RISE);
  const gearA = (i, t) => -hubA(t) * HUB.r / GR + i * .4;
  const driveA = t => -hubA(t) * HUB.r / DRIVE.r;
  const BELT_V = 380, SOUTH_V = 880;
  const beltS = t => BELT_V * CW.run(t, START, RISE);
  const southS = t => SOUTH_V * CW.run(t, START, RISE);
  const wake = (i, t) => smooth((t - (T.modern + i * .12)) / .45);
  const lit = (i, t) => smooth((t - T.tags[i]) / .25);
  const tagOut = (i, t) => clamp((t - T.tags[i]) / .38);

  const CAM0 = [(W / 2 - COIN0[0]) * KC, (H / 2 - COIN0[1]) * KC, 1 / KC];
  const DOWN = [12.1, 13.5];
  const KEYS = [
    [0, CAM0], [PULL[0], CAM0], [PULL[1], [0, 0, 1]], [DOWN[0], [0, 6, 1.025]],
    [DOWN[1], LAY.camPlain], [DUR, [LAY.camPlain[0] - 18, LAY.camPlain[1], LAY.camPlain[2] * 1.04]],
  ];
  function cam(t) {
    const xy = F.keyed(t, KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, KEYS.map(([k, v]) => [k, v[2]]), true);
    return { x: xy[0], y: xy[1], z };
  }

  function walker(pts) {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = cum.at(-1);
    return { len, at(d) {
      d = clamp(d, 0, len); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
      const k = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
    } };
  }
  const RIDES = BELTS.map((b, i) => walker([[0, 0], [GEARS[i].x, GEARS[i].y], CW.beltAt(b, 0), CW.beltAt(b, 1), [b.b[0], b.b[1]]]));
  const RIDE_T = BELTS.map((b, i) => Array.from({ length: 6 }, (_, k) => T.simply - .35 + i * .12 + k * .42));
  const CR = 11;
  const arrivals = i => RIDE_T[i].map(t0 => t0 + RIDES[i].len / BELT_V);
  const SOUTH_RIDE = walker([[0, 0], [DRIVE.x, DRIVE.y], CW.beltAt(SOUTH, 0), CW.beltAt(SOUTH, 1)]);
  const S_T0 = 11.75, S_END = S_T0 + .35 / 2 + SOUTH_RIDE.len / SOUTH_V, LAND = S_END + .16;
  function southCoin(t) {
    if (t < S_T0) return null;
    if (t < S_END) return { at: SOUTH_RIDE.at(SOUTH_V * CW.run(t, S_T0, .35)), tilt: 0, rot: 0 };
    const e = CW.beltAt(SOUTH, 1), u = clamp((t - S_END) / (LAND - S_END));
    if (t < LAND) return { at: [lerp(e[0], COIN[0], u), lerp(e[1], COIN[1], easeOut(u, 2))], tilt: .9 * Math.sin(u * Math.PI * .5), rot: .6 * u };
    const v = t - LAND;
    return { at: COIN, tilt: .9 * Math.exp(-v * 7) * Math.abs(Math.cos(v * 26)), rot: .6 + 2.6 * (1 - Math.exp(-v * 5)) };
  }

  const PLAIN = { x0: -3200, x1: 3200, top: LAY.plainTop, y1: LAY.plainTop + 3000 };
  const plateOf = i => ({ x: LAY.plates[i][0], y: LAY.plates[i][1], w: LAY.pw, h: LAY.ph });
  const ARROW = { x0: COIN[0] - 2400, x1: COIN[0] - 44, y: COIN[1], w: 46, hw: 104, hl: 86 };
  const LAID = [13.5, 14.1];
  function ground(x, t) {
    PL.ground(x, P, { ...PLAIN, clear: (X, Y, r) => Math.abs(Y - COIN[1]) < 90 + r || (Math.abs(X - COIN[0]) < 120 && Y < COIN[1] + 120) });
    for (let i = 0; i < 4; i++) CW.plate(x, P, plateOf(i));
    CW.track(x, P, LAY.track, -2600, 2600);
    PL.arrow(x, P, { ...ARROW, u: easeIO((t - LAID[0]) / (LAID[1] - LAID[0])) });
  }

  const TRAIN = PORT ? { x: 360, n: 4 } : { x: 520, n: 6 };
  function machine(x, t) {
    const tr = TRAIN.x + 140 * CW.run(t, T.runs, 1.0);
    CW.train(x, P, { x: tr, y: LAY.track, n: TRAIN.n, seed: 2 });
    for (let i = 0; i < 4; i++) {
      const k = tagOut(i, t); if (k <= 0) continue;
      const g = GEARS[i], to = LAY.tags[i], e = easeOutBack(k, 1.3);
      CW.tag(x, P, { x: lerp(g.x, to[0], e), y: lerp(g.y, to[1], e), text: WORDS[i], size: PORT ? 32 : 36, to: [g.x, g.y], hole: to[0] < g.x ? 'right' : 'left' });
    }
    CW.belt(x, P, { ...SOUTH, w: 12, s: southS(t), dash: [7, 63] });
    CW.gear(x, P, { ...DRIVE, a: driveA(t), col: mix(P.sheet, P.sheetShade, .4) });
    for (let i = 0; i < 4; i++) CW.gear(x, P, { ...GEARS[i], r: GR, n: GN, a: gearA(i, t), lit: lit(i, t) });
    CW.gear(x, P, { ...HUB, a: hubA(t), lit: 1 });
    for (let i = 0; i < 4; i++) CW.belt(x, P, { ...BELTS[i], w: 7, s: beltS(t), dash: [3, 21] });
    for (let i = 0; i < 4; i++) {
      CW.pulley(x, P, { x: GEARS[i].x, y: GEARS[i].y, r: PULLEY_R - 3, a: gearA(i, t) });
      CW.pulley(x, P, { x: BELTS[i].b[0], y: BELTS[i].b[1], r: END_R - 3, a: -beltS(t) / END_R });
    }
    CW.pulley(x, P, { x: DRIVE.x, y: DRIVE.y, r: 27, a: driveA(t) });
    CW.pulley(x, P, { x: SOUTH.b[0], y: SOUTH.b[1], r: 27, a: -southS(t) / 30 });
    for (let i = 0; i < 4; i++) CW[KINDS[i]](x, P, { ...plateOf(i), plate: false, wake: wake(i, t), t, seed: i });
    for (let i = 0; i < 4; i++) for (const t0 of RIDE_T[i]) {
      const d = BELT_V * (t - t0); if (d < 0 || d > RIDES[i].len) continue;
      const p = RIDES[i].at(d), s = clamp((RIDES[i].len - d) / 24);
      PR.coin(x, P, 'flat', p[0], p[1], CR * s, 0);
    }
    const sc = southCoin(t);
    if (sc) PL.coin(x, P, { x: sc.at[0], y: sc.at[1], r: CR * 1.7, tilt: sc.tilt, rot: sc.rot });
  }

  function card(x, t) {
    const cr = cropAt(t), a = toWorld([cr[0], cr[1]]), b = toWorld([cr[2], cr[3]]), B = 5.5;
    F.polyPath(x, F.cutPoly([[a[0] - B, a[1] - B], [b[0] + B, a[1] - B], [b[0] + B, b[1] + B], [a[0] - B, b[1] + B]], 14, 1.1, 5));
    x.fillStyle = P.card; x.fill();
    x.imageSmoothingQuality = 'high';
    x.drawImage(cardImage(T8 + Math.min(t, STAGE_END)), cr[0], cr[1], cr[2] - cr[0], cr[3] - cr[1], a[0], a[1], b[0] - a[0], b[1] - a[1]);
  }

  const LS = 6.8, OFF = T.supervise + .02;
  const lampOn = t => 1 - smooth((t - OFF) / .08);
  function lanternAt(t) {
    const sw = .035 * Math.sin(1.25 * t) + .03 * smooth((t - OFF) / .1) * Math.exp(-(t - OFF) * 2.5) * Math.sin(9 * (t - OFF));
    const bail = [LAY.lantern[0], LAY.lantern[1] - FARM.GLASS[1] * LS];
    return { bail, sw, glass: [bail[0] - Math.sin(sw) * FARM.GLASS[1] * LS, bail[1] + Math.cos(sw) * FARM.GLASS[1] * LS] };
  }
  function lantern(x, t) {
    const l = lanternAt(t);
    x.strokeStyle = mix(P.ink, P.wood, .3); x.lineWidth = 3.2; x.setLineDash([7, 4]);
    x.beginPath(); x.moveTo(l.bail[0], l.bail[1] - 3200); x.lineTo(l.bail[0], l.bail[1]); x.stroke(); x.setLineDash([]);
    x.save(); x.translate(l.bail[0], l.bail[1]); x.rotate(l.sw); FARM.lantern(x, P, LS, lampOn(t));
    x.fillStyle = `rgba(27,33,48,${.42 * (1 - lampOn(t))})`; x.beginPath(); x.ellipse(0, FARM.GLASS[1] * LS, 3.6 * LS, 4.4 * LS, 0, 0, TAU); x.fill();
    x.restore();
  }

  const GOLD = '#e8d27a';
  function glows(ctx, c, t) {
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]);
    const g = smooth((t - .1) / .95) * (1 - .3 * smooth((t - 2) / 1.2)), rs = (34 + 46 * smooth((t - .1) / 1.4)) / c.z;
    PR.glow(ctx, 0, 0, rs * 2.2, GOLD, .26 * g, 'flat'); PR.glow(ctx, 0, 0, rs * .7, '#efe08a', .32 * g, 'flat');
    for (let i = 0; i < 4; i++) {
      const pulse = F.env(t, T.tags[i], T.tags[i] + .12, T.tags[i] + .35, T.tags[i] + 1.3);
      PR.glow(ctx, GEARS[i].x, GEARS[i].y, 170, GOLD, .32 * pulse + .07 * lit(i, t), 'flat');
      const hit = arrivals(i).reduce((s, ta) => s + (t >= ta ? Math.exp(-(t - ta) * 3.5) : 0), 0);
      if (hit > .01) PR.glow(ctx, LAY.plates[i][0], LAY.plates[i][1], LAY.pw * .75, P.glow, .2 * Math.min(1, hit), 'flat');
    }
    const on = lampOn(t);
    if (on > 0) {
      const l = lanternAt(t);
      PR.glow(ctx, 0, 0, 620, P.glow, .13 * on * smooth((t - 2.6) / 1.1), 'flat');
      PR.glow(ctx, l.glass[0], l.glass[1], 110, P.glow, .35 * on, 'flat'); PR.glow(ctx, l.glass[0], l.glass[1], 30, '#fff2cf', .7 * on, 'flat');
    }
    const sc = southCoin(t);
    if (sc) PR.glow(ctx, sc.at[0], sc.at[1], 70, GOLD, .3 * smooth((t - S_END) / .4), 'flat');
    ctx.restore();
  }

  const [GC, GX] = F.canvas(W, H);
  function grade(ctx, t) {
    const k = smooth((t - BLEND[0]) / (BLEND[1] - BLEND[0])); if (k <= 0) return;
    if (k >= 1) { L.grade(ctx, T8 + t); return; }
    if (GX.reset) GX.reset(); else { GX.setTransform(1, 0, 0, 1, 0, 0); GX.clearRect(0, 0, W, H); }
    L.grade(GX, T8 + t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.drawImage(GC, 0, 0); ctx.restore();
  }

  const CROWD_FROM = DOWN[0] - .1, V = 215, ACC = .4, GAP = 18;
  const KIT = F.rulers.crowd(P, 48);
  const VIEW = { x0: LAY.camPlain[0] - W / 2, x1: LAY.camPlain[0] + W / 2, y0: LAY.camPlain[1] - H / 2, y1: LAY.camPlain[1] + H / 2 };
  const LANE = 46, NEAR = 420;
  const PEOPLE = (() => {
    const out = [], far = (X, Y, d) => out.every(p => Math.hypot(p.S[0] - X, p.S[1] - Y) > d);
    const free = (X, Y) => Math.abs(Y - COIN[1]) > LANE + 30 && X < COIN[0] - 90 && !(Math.abs(X) < 70 && Y < COIN[1]) && Y > PLAIN.top + 40;
    const N = PORT ? 200 : 230;
    for (let k = 0; out.length < N && k < 4000; k++) {
      const cx = VIEW.x0 - 140 + hash(k, 11) * (VIEW.x1 - VIEW.x0 + 60), cy = VIEW.y0 + 30 + hash(k, 12) * (VIEW.y1 - VIEW.y0 - 60);
      const n = hash(k, 13) < .45 ? 2 : hash(k, 13) < .8 ? 3 : 1, a0 = hash(k, 14) * TAU;
      const mem = Array.from({ length: n }, (_, j) => n === 1 ? [cx, cy] : [cx + Math.cos(a0 + j * TAU / n) * 14, cy + Math.sin(a0 + j * TAU / n) * 14]);
      if (!mem.every(([X, Y]) => free(X, Y) && far(X, Y, 30))) continue;
      mem.forEach(([X, Y], j) => out.push({ S: [X, Y], face: n === 1 ? hash(k, 15) * TAU : Math.atan2(cy - Y, cx - X), seed: k * 3 + j }));
    }
    const NIN = PORT ? 45 : 70;
    for (let k = 0; k < NIN; k++)
      out.push({ S: [VIEW.x0 - 50 - k * 26 - hash(k, 21) * 12, COIN[1] + (hash(k, 22) - .5) * LANE * 1.9], face: 0, seed: 900 + k, entrant: true });
    for (const p of out) {
      const dy = p.S[1] - COIN[1], near = clamp(Math.abs(dy) / NEAR), h = hash(p.seed, 31);
      p.look = KIT[p.seed % KIT.length].look; p.s = 1.2 * (.92 + hash(p.seed, 32) * .16); p.v = V * (.95 + hash(p.seed, 33) * .1);
      p.tTurn = p.entrant ? 0 : T.crowd + .42 * near + .08 * h;
      p.tRun = p.entrant ? T.run - .6 + hash(p.seed, 34) * .1 : T.run + .28 * near + .1 * hash(p.seed, 35);
      const ly = p.entrant ? dy : clamp(dy * .12, -LANE + 6, LANE - 6) + (hash(p.seed, 36) - .5) * 8;
      const M = p.entrant ? [p.S[0] + 40, p.S[1]] : [Math.min(p.S[0] + Math.abs(dy) * .85, COIN[0] - 170), COIN[1] + ly];
      const Q = [M[0] - (M[0] - p.S[0]) * .45, M[1]], bez = [];
      if (M[0] < p.S[0] + 60) bez.push([...p.S]);
      else for (let i = 0; i <= 14; i++) { const u = i / 14, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; bez.push([a * p.S[0] + b * Q[0] + c * M[0], a * p.S[1] + b * Q[1] + c * M[1]]); }
      p.bez = bez; p.eta = p.tRun + ACC / 2 + (walker(bez).len + (COIN[0] - M[0])) / p.v;
    }
    const spots = [];
    for (let r = 36; spots.length < out.length + 40; r += GAP + 2) {
      const n = Math.floor(r * 1.95 / (GAP + 2));
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (.61 + 1.1 * (i + .5 * (r % 2)) / n), X = COIN[0] + Math.cos(a) * r, Y = COIN[1] + Math.sin(a) * r;
        if (Math.hypot(X - SOUTH.b[0], Y - SOUTH.b[1]) < 52 || (Math.abs(X - SOUTH.b[0]) < 46 && Y < SOUTH.b[1])) continue;
        spots.push([X, Y]);
      }
    }
    [...out].sort((a, b) => a.eta - b.eta).forEach((p, i) => { p.spot = spots[i]; p.path = walker([...p.bez, p.spot]); });
    return out;
  })();
  const angTo = (a, b, k) => { let d = ((b - a) % TAU + TAU * 1.5) % TAU - Math.PI; return a + d * k; };
  function personAt(p, t) {
    const d = p.v * CW.run(t, p.tRun, ACC), L0 = p.path.len;
    if (d <= 0) {
      const sway = .14 * Math.sin(.9 * t + p.seed * 1.7), q = p.path.at(4), h0 = Math.atan2(q[1] - p.S[1], q[0] - p.S[0]);
      return { x: p.S[0], y: p.S[1], h: angTo(p.face + sway, h0, smooth((t - p.tTurn) / .28)), run: 0, ph: 0 };
    }
    const at = p.path.at(d), a = p.path.at(d - 5), b = p.path.at(d + 5), hRun = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const arr = d >= L0 ? CW.run(t, p.tRun, ACC) - L0 / p.v : 0;
    const hCoin = Math.atan2(COIN[1] - at[1], COIN[0] - at[0]);
    return { x: at[0], y: at[1], h: d >= L0 ? angTo(hRun, hCoin, smooth(arr / .3)) : hRun, run: clamp(d / 40) * (1 - smooth(arr / .25)), ph: d * TAU / 46 };
  }
  function crowdAt(t) {
    const q = PEOPLE.map(p => ({ p, ...personAt(p, t) }));
    if (t > T.run - .7) for (let it = 0; it < 2; it++)
      for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) {
        const A = q[i], B = q[j], dx = B.x - A.x, dy = B.y - A.y; if (Math.abs(dx) > GAP || Math.abs(dy) > GAP) continue;
        const d = Math.hypot(dx, dy) || .01; if (d >= GAP) continue;
        const k = (GAP - d) * .4 / d; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k;
      }
    return q;
  }
  function crowd(x, t) {
    const c = cam(t), hw = W / 2 / c.z + 40, hh = H / 2 / c.z + 40;
    const q = crowdAt(F.motion.pose(t)).filter(o => Math.abs(o.x - c.x) < hw && Math.abs(o.y - c.y) < hh).sort((a, b) => a.y - b.y);
    for (const o of q) PL.shadow(x, P, { x: o.x, y: o.y, s: o.p.s });
    for (const o of q) PL.person(x, P, { x: o.x, y: o.y, h: o.h, s: o.p.s, look: o.p.look, run: o.run, ph: o.ph });
  }

  function draw(ctx, t) {
    if (t <= PULL[0]) {
      S8.draw(ctx, T8 + t);
      if (t > 0) glows(ctx, cam(t), t);
      return;
    }
    const c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => ground(x, t));
    L.sheet(ctx, c, 1, [0, 0], x => machine(x, t));
    L.sheet(ctx, c, 1, [0, 0], x => card(x, t));
    if (t > CROWD_FROM) L.sheet(ctx, c, 1, [0, 0], x => crowd(x, t), { shadow: false });
    glows(ctx, c, t);
    if (t < DOWN[1]) L.sheet(ctx, c, 1, [0, 0], x => lantern(x, t));
    grade(ctx, t);
  }

  F.scene('seq-08b', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC'), label: C.label,
    api: { DUR, cam, draw, ground, machine, crowd, crowdAt, glows, grade, COIN, ARROW, PLAIN, SOUTH } });
})();
