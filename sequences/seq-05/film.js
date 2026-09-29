(function () {
  'use strict';
  const F = FILM, PR = F.props, CITY = F.city, FARM = F.farm, M = F.motion, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, TAU } = F, mix = CITY.mix;
  const C = F.cues('seq-05'), DUR = C.duration;
  const L = F.look('lightbox', W, H), P = L.P;
  const S2 = F.getScene('seq-02').api;
  const G = S2.G, R = [0, 0];

  const T = {
    idea: 1.439, s14: C.s('S014').t0, why: 5.007, trouble: 5.674, wild: 6.489, all: 7.268,
    s15: C.s('S015').t0, breed: 8.291, s16: C.s('S016').t0, raise: 9.118, kill: 10.534,
    collect: 11.177, reward: 11.767, s17: C.s('S017').t0, farm: 13.139,
    s18: C.s('S018').t0, printed: 13.907, fangs: 14.942,
  };

  const BS = 2.2;
  const YARD = { x0: 380, x1: 3240, wall: 60 };
  const BASKET = { x: 540, s: .9 };
  const CRATES = [1880, 2010, 2140];
  const HOUSE = { x0: 1800, x1: 2420, top: -330, door: 1870, win: [2385, -30] };
  const XM = 2500;
  const PEG = [2762, 60];
  const STACKS = [[1235, 3], [1355, 3], [1475, 2], [1595, 3], [1715, 4], [2700, 4], [2825, 3], [2950, 4], [3075, 3]];
  const CAGE = { w: 112, h: 58 };
  const NOTE_STACK = 5;
  const NOTE = [STACKS[NOTE_STACK][0], G - STACKS[NOTE_STACK][1] * CAGE.h];
  const POLES = [1655, 2762, 3012];

  const X0 = -330, U = v => v / BS;
  const GRIP = { pose: 'grip' }, LANT = [.42, .92];
  const perf = M.perform([
    { do: 'walk', dist: U(440), until: .72, gait: 'walk' },
    { do: 'turn', to: Math.PI * 1.5, dur: .5 },
    { do: 'wait', until: T.s14 + .2 },
    { do: 'turn', to: 0, dur: .45 },
    { do: 'walk', dist: U(360), until: 4.9, gait: 'brisk' },
    { do: 'wait', until: DUR + 1 },
  ], { x: 0, t0: -3, seed: 5, arms: [LANT, null], hands: [GRIP, null] });
  const HEAD_UP = [T.idea + .05, T.idea + .5];
  const RAISE = [.86, 1.34, T.idea + .12, T.idea + .76];
  const SHAKE = [T.wild - .14, T.all - .2];
  const BEND = [7.92, 8.16, 8.9, 9.3];
  const LID = [8.1, T.breed + .04];
  const lidK = tp => 1 - smooth((tp - LID[0]) / (LID[1] - LID[0]));
  const basketTop = G + 2 - 52 * BASKET.s;
  function knob(k) {
    const a = -(1 - k) * 1.9, c = Math.cos(a), s = Math.sin(a), v = [-38, -17];
    return [BASKET.x + BASKET.s * (38 + v[0] * c - v[1] * s), G + 2 + BASKET.s * (-54 + v[0] * s + v[1] * c)];
  }
  function breederPose(tp) {
    const p = { ...perf(tp) }, root = p.root[0];
    const up = smooth((tp - RAISE[0]) / (RAISE[1] - RAISE[0])) * (1 - smooth((tp - RAISE[2]) / (RAISE[3] - RAISE[2])));
    if (up > 0) p.arms = [[lerp(p.arms[0][0], 2.35, up), lerp(p.arms[0][1], 2.75, up)], p.arms[1]];
    if (tp >= HEAD_UP[0] && tp < T.s14 + .75) {
      const k = smooth((tp - HEAD_UP[0]) / (HEAD_UP[1] - HEAD_UP[0])), hy = lerp(Math.PI * 1.5, Math.PI * 1.86, k);
      p.headYaw = Math.max(p.headYaw ?? p.yaw, hy); p.head = (p.head || 0) - .16 * k * (1 - smooth((tp - T.s14 - .2) / .4));
    }
    const look = smooth((tp - (T.why - .15)) / .35) * (1 - smooth((tp - (T.all - .1)) / .3));
    if (look > 0) { p.head = (p.head || 0) - .34 * look; p.lean = (p.lean || 0) - .05 * look; }
    const down = smooth((tp - 7.3) / .45);
    if (down > 0) p.head = (p.head || 0) + .24 * down;
    if (tp > SHAKE[0] && tp < SHAKE[1]) { const u = (tp - SHAKE[0]) / (SHAKE[1] - SHAKE[0]); p.headYaw = p.yaw + .55 * Math.sin(TAU * u) * Math.sin(Math.PI * u); }
    const side = smooth((tp - 4.72) / .4);
    if (side > 0) p.arms = [[lerp(p.arms[0][0], .12, side), lerp(p.arms[0][1], .22, side)], p.arms[1]];
    const b = smooth((tp - BEND[0]) / (BEND[1] - BEND[0])) * (1 - smooth((tp - BEND[2]) / (BEND[3] - BEND[2]))) ;
    if (b > 0) {
      p.hip = [p.hip[0] - 4 * b, p.hip[1] + 9 * b]; p.lean = (p.lean || 0) + .55 * b; p.bend = (p.bend || 0) + .35 * b; p.head = (p.head || 0) + .25 * b;
      p.feet = p.feet.map(f => f);
      p.arms = [[lerp(p.arms[0][0], -.3, b), lerp(p.arms[0][1], -.15, b)], p.arms[1]];
      const grab = smooth((tp - (BEND[0] + .06)) / .14) * (1 - smooth((tp - (LID[1] + .1)) / .18));
      if (grab > 0) { const kw = knob(lidK(tp)), j = M.joints(p).arms[1].wr, tgt = [U(kw[0] - X0) - root, U(kw[1] - G) - 1.5]; M.reach(p, 1, [lerp(j[0], tgt[0], grab), lerp(j[1], tgt[1], grab)]); p.hands = [p.hands[0], { pose: 'grip' }]; }
    }
    return p;
  }

  const REL = { pose: 'relaxed', k: .4 }, NEAR0 = [.1, .22];
  const SH = M.keys([
    [T.kill - .66, { ...M.stand(0), arms: [[.2, .35], NEAR0], hands: [GRIP, REL] }],
    [T.kill - .06, { ...M.stand(0), hip: [-1.5, M.HIP + .4], lean: -.14, head: -.1, arms: [[3.0, 3.35], [.3, .5]], hands: [GRIP, REL] }],
    [T.kill + .08, { ...M.stand(0), hip: [2, M.HIP + 2.5], lean: .32, bend: .12, head: .2, arms: [[.95, 1.25], [.25, .45]], hands: [GRIP, REL] }, F.easeIn],
    [T.kill + .42, { ...M.stand(0), hip: [2, M.HIP + 2], lean: .28, bend: .1, head: .22, arms: [[.9, 1.2], [.2, .4]], hands: [GRIP, REL] }],
    [T.collect + .15, { ...M.stand(0), arms: [[-.06, .04], NEAR0], hands: [GRIP, REL] }],
  ], { lag: { arms: .03 } });
  const PALM_T = [T.collect - .3, T.collect - .02, T.s17 - .5, T.s17 - .1];
  const DROPS = [T.collect + .12, T.collect + .27, T.collect + .42];
  const CLOSE = [T.reward - .08, T.reward + .16];
  const xmIdle = M.idle({ seed: 8, base: SH(T.collect + .15), t0: T.collect + .15 });
  const PK = [T.s17 - .65, T.s17 - .25, T.s17 - .05, T.s17 + .15, T.s17 + .45];
  const POCKET = { x: 3.5, top: -35, w: 11 };
  function xmPose(tp) {
    const p = { ...(tp < T.collect + .15 ? SH(tp) : xmIdle(tp)) };
    if (tp < PALM_T[0]) return p;
    const out = smooth((tp - PALM_T[0]) / (PALM_T[1] - PALM_T[0]));
    p.arms = [p.arms[0], [lerp(p.arms[1][0], 1.5, out), lerp(p.arms[1][1], 1.62, out)]];
    p.hands = [GRIP, { pose: 'none' }];
    p.cupK = Math.max((1 - out) * .5, smooth((tp - CLOSE[0]) / (CLOSE[1] - CLOSE[0]))) * (1 - .7 * smooth((tp - PK[2]) / .2));
    if (tp >= PK[0]) {
      const hx = p.hip[0] + POCKET.x, wr0 = M.joints(p).arms[1].wr, above = [hx, POCKET.top - 9], inside = [hx, POCKET.top + 1.5];
      const k1 = smooth((tp - PK[0]) / (PK[1] - PK[0])), k2 = smooth((tp - PK[1]) / (PK[2] - PK[1])) * (1 - smooth((tp - PK[2]) / (PK[3] - PK[2])));
      M.reach(p, 1, k2 > 0 ? [lerp(above[0], inside[0], k2), lerp(above[1], inside[1], k2)] : [lerp(wr0[0], above[0], k1), lerp(wr0[1], above[1], k1)]);
      if (tp >= PK[3]) { const k4 = smooth((tp - PK[3]) / (PK[4] - PK[3])); p.arms = [p.arms[0], [lerp(p.arms[1][0], NEAR0[0], k4), lerp(p.arms[1][1], NEAR0[1], k4)]]; }
      if (tp >= PK[4]) p.hands = [GRIP, REL];
    }
    return p;
  }
  const B = FARM.breeder(P);
  const lamps = [];
  const wristX = pose => (pose.root ? pose.root[0] : 0) + M.joints(pose).arms[0].wr[0] * Math.cos(pose.yaw ?? 0);
  function lanternIn(xx, PJ, i, sx, sy, s, rootX, sw, hid) {
    const a = PJ.arms[i], dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], l = Math.hypot(dx, dy) || 1, top = [a.wr[0] + dx / l * 4.4, a.wr[1] + dy / l * 4.4];
    xx.save(); xx.translate(top[0], top[1]); xx.rotate(sw); FARM.lantern(xx, P, 1, 1); xx.restore();
    lamps.push([sx + (rootX + top[0] - Math.sin(sw) * FARM.GLASS[1]) * s, sy + (top[1] + Math.cos(sw) * FARM.GLASS[1]) * s, s / BS, hid ?? 1]);
  }
  function breeder(x, pose, px, prevPose, o2 = {}) {
    const rootX = pose.root ? pose.root[0] : 0, sw = prevPose ? FARM.hang([wristX(prevPose), 0], [wristX(pose), 0], .07) : 0;
    const o = { ...B, ...o2 };
    const lit = o2.lantern !== false;
    o.behind = (xx, PJ) => { if (lit && !PJ.arms[0].near) lanternIn(xx, PJ, 0, px, G, BS, rootX, sw, .3 + .7 * smooth((Math.abs(PJ.arms[0].wr[0] - PJ.hip[0] * Math.cos(PJ.yaw)) - 6) / 9)); if (o2.behind) o2.behind(xx, PJ); };
    o.prop = (xx, PJ) => {
      if (Math.cos(PJ.yaw) > .8) { xx.strokeStyle = mix(o.coat, P.ink, .4); xx.lineWidth = .9; xx.lineCap = 'round'; xx.beginPath(); xx.moveTo(PJ.hip[0] + POCKET.x - POCKET.w / 2, POCKET.top + .3); xx.quadraticCurveTo(PJ.hip[0] + POCKET.x, POCKET.top + 1.4, PJ.hip[0] + POCKET.x + POCKET.w / 2, POCKET.top); xx.stroke(); xx.lineCap = 'butt'; }
      if (lit && PJ.arms[0].near) lanternIn(xx, PJ, 0, px, G, BS, rootX, sw); if (o2.prop) o2.prop(xx, PJ);
    };
    x.save(); x.translate(px, G); x.scale(BS, BS); const PJ = M.draw(x, P, pose, o); x.restore();
    return { ...PJ, rootX };
  }

  const LANE = S2.LANE.slice(0, 3);
  const LAMP = [-175, -70];
  function lane(x) {
    x.fillStyle = mix(P.wall, P.ink, .3); x.fillRect(-2600, G, 6400, 1400);
    for (const hs of LANE) { x.save(); x.translate(hs.x, G); CITY.house(x, P, hs); x.restore(); }
    for (const hs of LANE) if (hs.door != null) { x.save(); x.translate(0, G); CITY.step(x, P, hs.x + hs.w * hs.door); x.restore(); }
    const LP = FARM.lit(P, .55);
    x.fillStyle = LP.card; x.fillRect(-270, -10, 90, 120); x.fillRect(180, 60, 70, 90);
    x.save(); x.translate(S2.POST[0], S2.POST[1]); PR.poster(x, FARM.lit(P, .92), 'lightbox', { w: S2.PW, h: S2.PH, coin: 1, reward: 1, cobra: 1 }); x.restore();
    x.strokeStyle = mix(P.wood, P.ink, .2); x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(LAMP[0] - 34, LAMP[1] - 10); x.lineTo(LAMP[0], LAMP[1] - 10); x.stroke(); x.lineCap = 'butt';
    x.save(); x.translate(LAMP[0], LAMP[1] - 12); x.scale(2, 2); FARM.lantern(x, P, 1, 1); x.restore();
  }

  const MUD = mix(P.wall, P.wood, .35), MUD2 = mix(MUD, P.ink, .25), SLAT = mix(P.wood, P.cream, .12);
  function yardWall(x) {
    x.fillStyle = MUD; x.fillRect(YARD.x0, YARD.wall, YARD.x1 - YARD.x0, G - YARD.wall);
    x.fillStyle = MUD2; x.fillRect(YARD.x0, YARD.wall - 8, YARD.x1 - YARD.x0, 12);
    const r = F.rng(31); x.fillStyle = mix(MUD, P.ink, .1);
    for (let k = 0; k < 26; k++) { x.beginPath(); x.ellipse(YARD.x0 + r() * (YARD.x1 - YARD.x0), YARD.wall + 30 + r() * (G - YARD.wall - 50), 18 + r() * 30, 6 + r() * 8, 0, 0, TAU); x.fill(); }
    x.fillStyle = mix(P.wall, P.ink, .45); x.fillRect(340, -60, 40, G + 60);
  }
  function house(x) {
    const { x0, x1, top } = HOUSE;
    x.fillStyle = mix(MUD, P.sheet, .15); x.fillRect(x0, top, x1 - x0, G - top);
    x.fillStyle = MUD2; x.fillRect(x0 - 10, top - 14, x1 - x0 + 20, 18);
    for (let k = x0 + 30; k < x1 - 20; k += 70) x.fillRect(k, top + 4, 10, 14);
    x.fillStyle = P.door; x.beginPath(); CITY.archPath(x, HOUSE.door, G, 70, 170); x.fill();
    x.fillStyle = mix(P.window, P.amberDark, .25); x.fillRect(HOUSE.win[0] - 22, HOUSE.win[1] - 30, 44, 60);
    x.fillStyle = MUD2; x.fillRect(HOUSE.win[0] - 2, HOUSE.win[1] - 30, 4, 60); x.fillRect(HOUSE.win[0] - 22, HOUSE.win[1] - 2, 44, 4);
  }
  function cage(x, cx, base, seed, occ) {
    const { w: cw, h: ch } = CAGE;
    x.fillStyle = mix(P.wood, P.ink, .1); x.fillRect(cx - cw / 2, base - ch, cw, ch);
    x.fillStyle = mix(P.sheet, P.wall, .55); x.fillRect(cx - cw / 2 + 6, base - ch + 6, cw - 12, ch - 12);
    x.save(); x.beginPath(); x.rect(cx - cw / 2 + 6, base - ch + 6, cw - 12, ch - 12); x.clip();
    for (let k = 0; k < occ; k++) {
      const dir = hash(seed, k, 2) < .5 ? -1 : 1, hx = cx + dir * (18 + hash(seed, k) * 16), hy = base - 13 - k * 9;
      PR.cobraBody(x, P, PR.slitherPath([hx, hy], 92, { dir, amp: 6, k: TAU / 40, phase: seed }), { w: 8, belly: dir, eye: 0 });
    }
    x.restore();
    x.fillStyle = SLAT; for (let k = 0; k <= 7; k++) x.fillRect(cx - cw / 2 + 4 + k * (cw - 12) / 7, base - ch + 4, 3.5, ch - 8);
    x.fillRect(cx - cw / 2, base - ch, cw, 5); x.fillRect(cx - cw / 2, base - 5, cw, 5);
  }
  function stacks(x) {
    STACKS.forEach(([sx, n], i) => { for (let j = 0; j < n; j++) cage(x, sx, G - j * CAGE.h, i * 7 + j, 1 + ((i + j) % 2)); });
    POLES.forEach(px => { x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(px - 3, -40, 6, G + 40); x.fillRect(px - 3, -40, 30, 5); });
    x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(PEG[0] - 3, PEG[1] - 30, 6, G - PEG[1] + 30); x.fillRect(PEG[0] - 3, PEG[1] - 30, 20, 5);
    x.save(); x.translate(PEG[0] + 14, PEG[1] - 26); x.scale(BS, BS); FARM.lantern(x, P, 1, 1); x.restore();
  }
  const POLE_LAMPS = POLES.map(px => [px + 24, -35]);

  const EGGS = [[-20, -3], [-6, -6], [8, -4], [22, -2], [-13, 3], [2, 2], [16, 4]];
  function eggBasket(x, tp) {
    const k = lidK(tp), s = BASKET.s;
    PR.basket(x, P, BASKET.x, G + 2, s, -1);
    if (k < 1) {
      const cy = basketTop - 3, egg = mix(P.cream, P.rim, .3);
      x.save(); x.beginPath(); x.rect(BASKET.x - 45 * s, cy - 40, 90 * s, 40 + 5 * s); x.clip();
      EGGS.forEach(([ex, ey]) => { x.fillStyle = egg; x.beginPath(); x.ellipse(BASKET.x + ex * s, cy + ey * s - 4, 7.5 * s, 9.5 * s, ex * .01, 0, TAU); x.fill(); x.fillStyle = mix(egg, P.ink, .18); x.beginPath(); x.ellipse(BASKET.x + ex * s + 2, cy + ey * s - 1, 4.5 * s, 5 * s, 0, 0, TAU); x.fill(); });
      x.restore();
    }
    x.save(); x.translate(BASKET.x, G + 2); x.scale(s, s);
    const reed = mix(P.wood, P.cream, .35), dark = mix(reed, P.ink, .25);
    x.translate(38, -54); x.rotate(-(1 - k) * 1.9); x.translate(-38, 0);
    x.fillStyle = reed; x.beginPath(); x.ellipse(0, -2, 43, 9, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(0, -8, 30, 10, 0, Math.PI, 0); x.fill(); x.fillStyle = dark; x.beginPath(); x.arc(0, -17, 4, 0, TAU); x.fill();
    x.restore();
  }

  const CR = { w: 124, h: 34 };
  const HATCH = CRATES.flatMap((cx, i) => [-38, -6, 26].map((dx, j) => ({ cx, x: cx + dx + (hash(i, j, 3) - .5) * 8, t: T.raise + .36 + i * .14 + j * .09 + hash(i, j, 4) * .06, dir: hash(i, j, 5) < .5 ? -1 : 1, seed: i * 3 + j })));
  function crate(x, cx, part) {
    const top = G + 8 - CR.h;
    if (part === 'back') { x.fillStyle = mix(P.wood, P.ink, .45); x.fillRect(cx - CR.w / 2, top - 10, CR.w, CR.h + 10); return; }
    x.fillStyle = SLAT; x.fillRect(cx - CR.w / 2, top, CR.w, CR.h);
    x.fillStyle = mix(SLAT, P.ink, .3); x.fillRect(cx - CR.w / 2, top + CR.h * .48, CR.w, 3); x.fillRect(cx - CR.w / 2 + 4, top, 5, CR.h); x.fillRect(cx + CR.w / 2 - 9, top, 5, CR.h);
  }
  function eggAt(x, ex, ey, crack) {
    const egg = mix(P.cream, P.rim, .2);
    x.fillStyle = egg; x.beginPath(); x.ellipse(ex, ey, 8.5, 11, 0, 0, Math.PI); x.fill();
    x.save(); x.translate(ex + 5 * crack, ey - 9 * crack); x.rotate(.9 * crack); x.beginPath(); x.ellipse(0, 0, 8.5, 11, 0, Math.PI, TAU); x.fill(); x.restore();
    if (crack > 0 && crack < .4) { x.strokeStyle = mix(egg, P.ink, .5); x.lineWidth = 1; x.beginPath(); x.moveTo(ex - 7, ey); x.lineTo(ex - 3, ey - 2); x.lineTo(ex, ey + 1); x.lineTo(ex + 4, ey - 2); x.lineTo(ex + 7, ey); x.stroke(); }
  }
  function hatchling(x, h, tp) {
    const u = tp - h.t, top = G + 8 - CR.h, ey = top + 4;
    if (u < 0) { eggAt(x, h.x, ey, 0); return; }
    eggAt(x, h.x, ey, smooth(u / .25));
    const rise = smooth((u - .1) / .35), sway = Math.sin((tp + h.seed * .37) * 5.2) * rise, tongue = ((tp * 1.6 + h.seed * .3) % 1) < .3 ? ((tp * 1.6 + h.seed * .3) % 1) / .3 : 0;
    const pts = []; for (let k = 0; k < 20; k++) { const v = k / 19; pts.push([h.x + h.dir * (1 - v) * 6 + Math.sin(v * 5 + tp * 4 + h.seed) * 3 * v + sway * 3 * (1 - v), ey - rise * 34 * (1 - v) + v * 18]); }
    PR.cobraBody(x, P, pts, { w: 7.5, belly: h.dir, tongue, eye: 1 });
  }
  function crates(x, tp) {
    CRATES.forEach(cx => crate(x, cx, 'back'));
    HATCH.forEach(h => hatchling(x, h, tp));
    CRATES.forEach(cx => crate(x, cx, 'front'));
  }

  const SHADOW = { x: XM - 460, y: G - 20, s: BS * 1.09 };
  function shadow(x, tp) {
    const lit = .12 + .22 * F.env(tp, T.kill - .7, T.kill - .35, T.collect, T.s17);
    const pool = x.createRadialGradient(SHADOW.x + 40, SHADOW.y - 120, 0, SHADOW.x + 40, SHADOW.y - 120, 520);
    pool.addColorStop(0, F.rgba(F.hex(P.glow), lit)); pool.addColorStop(1, F.rgba(F.hex(P.glow), 0));
    x.fillStyle = pool; x.fillRect(HOUSE.x0, HOUSE.top, HOUSE.x1 - HOUSE.x0, G - HOUSE.top);
    if (tp < T.kill - .5 || tp > T.collect + .15) return;
    const dark = mix(mix(MUD, P.sheet, .15), P.ink, .55), o = { coat: dark, trouser: dark, skin: dark, shoe: dark, head: 'cap', headColor: dark, shadow: 0, armEdge: false, behind: (xx, PJ) => stick(xx, PJ, dark, -.5, 0) };
    x.save(); x.beginPath(); x.rect(HOUSE.x0, HOUSE.top, HOUSE.x1 - HOUSE.x0, G - HOUSE.top); x.clip();
    x.translate(SHADOW.x, SHADOW.y); x.scale(SHADOW.s, SHADOW.s); M.draw(x, P, xmPose(tp), o); x.restore();
  }
  function stick(xx, PJ, col, tilt = -.5, i = 1) {
    const a = PJ.arms[i], dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, c = Math.cos(tilt), s = Math.sin(tilt);
    const vx = ux * c - uy * s, vy = ux * s + uy * c;
    xx.strokeStyle = col; xx.lineWidth = 2.2; xx.lineCap = 'round'; xx.beginPath(); xx.moveTo(a.wr[0] - vx * 6, a.wr[1] - vy * 6); xx.lineTo(a.wr[0] + vx * 44, a.wr[1] + vy * 44); xx.stroke(); xx.lineCap = 'butt';
  }

  const COIN_R = 2.6;
  let palmAt = null;
  const RESTS = [[-27, -10], [-31, -11.1], [-24, -12]], COIN_TILT = .78;
  function coins(x, tp, toW) {
    if (tp < DROPS[0] - .3 || tp > PK[2]) return;
    DROPS.forEach((d, i) => {
      const u = tp - d; if (u < -.35) return;
      const rest = toW(...RESTS[i]);
      let y, tilt = COIN_TILT;
      if (u < 0) { const g = 1 - (-u / .35); y = lerp(rest[1] - 160, rest[1], g * g); tilt = .3; }
      else { const b = Math.max(0, Math.sin(Math.PI * clamp(u / .1))) * 1.4 * Math.exp(-u * 8); y = rest[1] - b; }
      PR.coin(x, P, 'lightbox', rest[0], y, COIN_R, tilt);
    });
  }

  function palmHand(x, PJ, k, tp) {
    const inPocket = tp > PK[1] - .1 && tp < PK[3] + .1;
    if (inPocket) { const r = pocketMouth(PJ); x.save(); x.beginPath(); x.rect(-1e5, -1e5, 2e5, 2e5); x.rect(r.x0, r.y, r.w, G + 50 - r.y); x.clip('evenodd'); }
    const a = PJ.arms[1], wr = [XM + (PJ.rootX + a.wr[0]) * BS, G + a.wr[1] * BS], th = Math.atan2(a.wr[1] - a.el[1], a.wr[0] - a.el[0]), hs = M.HANDS * BS;
    const o = { pose: 'cup', k, skin: B.skin, sleeve: B.coat, cuff: null, arm: 70 };
    const hand = layer => { x.save(); x.translate(wr[0], wr[1]); x.rotate(th); x.scale(-hs, hs); F.people.hand(x, P, { ...o, layer }); x.restore(); };
    hand('back');
    const c = Math.cos(th), s = Math.sin(th), toW = (hx, hy) => [wr[0] - hs * hx * c - hs * hy * s, wr[1] - hs * hx * s + hs * hy * c];
    palmAt = toW(-27, -10);
    coins(x, tp, toW);
    hand('front');
    if (inPocket) x.restore();
  }

  function pocketMouth(PJ) { const w = POCKET.w * BS; return { x0: XM + (PJ.rootX + PJ.hip[0] + POCKET.x) * BS - w / 2, y: G + POCKET.top * BS, w }; }

  const NW = 26, NH = 12;
  const NOTE_S = 1.9;
  const NOTE_T = { stand: [T.printed, T.printed + .22], fold: [T.printed + .22, T.printed + .46], morph: [T.printed + .42, T.printed + .56], flare: [T.printed + .56, T.printed + .86] };
  const ph = ([a, b], tp) => smooth((tp - a) / (b - a));
  function engraving(x, w, h, dark) {
    x.strokeStyle = dark; x.lineWidth = .5; x.strokeRect(-w / 2 + 1.6, -h / 2 + 1.6, w - 3.2, h - 3.2);
    x.lineWidth = .3; for (let k = -w / 2 + 4; k < w / 2 - 3; k += 1.6) { if (Math.abs(k) < w * .16) continue; x.beginPath(); x.moveTo(k, -h / 2 + 3.5); x.lineTo(k, h / 2 - 3.5); x.stroke(); }
    x.lineWidth = .7; x.beginPath(); x.ellipse(0, 0, w * .14, h * .32, 0, 0, TAU); x.stroke();
    x.lineWidth = .4; x.beginPath(); x.ellipse(0, 0, w * .09, h * .2, 0, 0, TAU); x.stroke();
  }
  function hoodPath(x, f, s = 1) {
    const hw = lerp(9, 21, f) * s, top = -50 * s, mid = -30 * s, neck = 6 * s;
    x.beginPath(); x.moveTo(-neck, 0); x.lineTo(-neck, -8 * s);
    x.bezierCurveTo(-hw * .7, -14 * s, -hw, mid + 8 * s, -hw, mid);
    x.bezierCurveTo(-hw, mid - 14 * s, -hw * .55, top + 2 * s, 0, top);
    x.bezierCurveTo(hw * .55, top + 2 * s, hw, mid - 14 * s, hw, mid);
    x.bezierCurveTo(hw, mid + 8 * s, hw * .7, -14 * s, neck, -8 * s); x.lineTo(neck, 0); x.closePath();
  }
  function note(x, tp) {
    const [nx, ny] = NOTE, money = PR.money('lightbox'), body = mix(money, P.ink, .3), dark = mix(money, P.ink, .6), back = mix(money, P.ink, .45), hi = mix(money, P.rim, .2);
    x.save(); x.translate(nx, ny); x.scale(NOTE_S, NOTE_S);
    const st = ph(NOTE_T.stand, tp), fo = ph(NOTE_T.fold, tp), mo = ph(NOTE_T.morph, tp);
    if (st <= 0) {
      x.fillStyle = body; x.beginPath(); x.moveTo(-NW, 0); x.lineTo(NW - 5, 0); x.lineTo(NW, -6); x.lineTo(-NW + 5, -6); x.closePath(); x.fill();
      x.strokeStyle = dark; x.lineWidth = .5; x.beginPath(); x.ellipse(0, -3, 4.5, 1.8, 0, 0, TAU); x.stroke();
      x.restore(); return;
    }
    if (mo < 1) {
      x.save(); x.globalAlpha = 1 - mo;
      const h = lerp(6, NH * 2, st), w4 = NW / 2;
      x.save(); x.translate(0, -h / 2); x.scale(1, h / (NH * 2));
      const panel = (cx, sx, face) => { x.save(); x.translate(cx, 0); x.scale(sx, 1); x.fillStyle = face ? body : back; x.fillRect(-w4 / 2 - .2, -NH, w4 + .4, NH * 2); x.restore(); };
      const fL = ph([NOTE_T.fold[0], NOTE_T.fold[0] + .16], tp), fR = ph([NOTE_T.fold[0] + .08, NOTE_T.fold[1]], tp);
      const outer = (side, k) => { const a = Math.PI * k, sx = Math.cos(a), hinge = side * w4, cx = hinge + side * w4 / 2 * sx; panel(cx, Math.abs(sx), sx > 0); };
      x.fillStyle = body; x.fillRect(-w4, -NH, w4 * 2, NH * 2);
      x.save(); x.beginPath(); x.rect(-w4, -NH, w4 * 2, NH * 2); x.clip(); x.translate(0, 0); engraving(x, NW * 2, NH * 2, dark); x.restore();
      outer(-1, fL); outer(1, fR);
      x.restore(); x.restore();
    }
    if (mo > 0) {
      const fl = ph(NOTE_T.flare, tp), jaw = smooth((tp - T.fangs + .02) / .1), rise = lerp(.55, 1, smooth(mo)), sway = Math.sin((tp - T.printed) * 2.6) * .035 * fl;
      x.save(); x.globalAlpha = mo; x.rotate(sway); x.scale(1, rise);
      x.fillStyle = mix(body, P.ink, .2); x.beginPath(); x.ellipse(0, -1.8, 13, 3.6, 0, 0, TAU); x.fill();
      x.fillStyle = body; x.beginPath(); x.ellipse(0, -2.8, 9.5, 2.4, 0, 0, TAU); x.fill();
      hoodPath(x, fl); x.fillStyle = body; x.fill();
      x.save(); hoodPath(x, fl); x.clip();
      x.strokeStyle = dark; x.lineWidth = .3; x.globalAlpha = mo * .55; for (let k = -24; k <= 24; k += 2.6) { if (Math.abs(k) < 5.5) continue; x.beginPath(); x.moveTo(k, -3); x.lineTo(k * 1.05, -52); x.stroke(); }
      x.globalAlpha = mo;
      x.fillStyle = mix(body, P.cream, .22); x.beginPath(); x.ellipse(0, -28, 5.2, 13, 0, 0, TAU); x.fill();
      x.strokeStyle = dark; x.lineWidth = .6; x.beginPath(); x.ellipse(0, -28, 5.2, 13, 0, 0, TAU); x.stroke(); x.beginPath(); x.ellipse(0, -28, 3.2, 8.5, 0, 0, TAU); x.stroke();
      x.fillStyle = dark; x.fillRect(-5, -21, 10, 1.6); x.fillRect(-5, -17, 10, 1.6);
      x.restore();
      const hy = -50;
      const head = () => { x.beginPath(); x.moveTo(-9.5, hy - 1); x.bezierCurveTo(-10, hy - 9.5, 10, hy - 9.5, 9.5, hy - 1); x.bezierCurveTo(9, hy + 4.5, 4.5, hy + 8, 0, hy + 8.5); x.bezierCurveTo(-4.5, hy + 8, -9, hy + 4.5, -9.5, hy - 1); };
      head(); x.fillStyle = mix(body, hi, .12); x.fill();
      x.fillStyle = mix(body, hi, .6); x.beginPath(); x.ellipse(0, hy - 4.2, 6.2, 2.4, 0, 0, TAU); x.fill();
      x.fillStyle = dark; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sd * 1.9, hy + 5.6, .65, .45, 0, 0, TAU); x.fill(); }
      x.strokeStyle = dark; x.lineWidth = .4; x.beginPath(); x.moveTo(0, hy - 7.5); x.lineTo(0, hy - 1.5); x.stroke();
      if (jaw > 0) {
        const gy = hy + 8, gh = 7 * jaw;
        x.fillStyle = P.ink; x.beginPath(); x.moveTo(-7, gy); x.quadraticCurveTo(0, gy - 1, 7, gy); x.quadraticCurveTo(0, gy + gh * 1.5, -7, gy); x.fill();
        x.fillStyle = mix(P.cream, '#ffffff', .6);
        for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 3.4 - .9, gy - .2); x.lineTo(sd * 3.4 + .9, gy - .2); x.lineTo(sd * 3.2, gy + 4.2 * jaw); x.closePath(); x.fill(); }
        x.fillStyle = body; x.beginPath(); x.moveTo(-6.5, gy + gh * .9); x.quadraticCurveTo(0, gy + gh * 1.9, 6.5, gy + gh * .9); x.quadraticCurveTo(0, gy + gh * 1.3, -6.5, gy + gh * .9); x.fill();
      }
      x.restore();
    }
    x.restore();
  }

  const WORDS = [['PRINTED', T.printed], ['MONEY', 14.33], ['WITH', 14.66], ['FANGS', T.fangs]];
  const WALL_TEXT = { x: 2080, y: [-222, -128], size: 72 };
  function wallWords(x, tp) {
    if (tp < WORDS[0][1] - .02) return;
    const ink = PR.money('lightbox'), edge = mix(ink, P.ink, .55);
    x.save(); x.font = `900 ${WALL_TEXT.size}px NSC`; x.textBaseline = 'middle'; x.textAlign = 'left';
    const lines = [WORDS.slice(0, 2), WORDS.slice(2)];
    lines.forEach((ws, li) => {
      const gap = WALL_TEXT.size * .28, widths = ws.map(([wd]) => x.measureText(wd).width), total = widths.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      let cx = WALL_TEXT.x - total / 2;
      ws.forEach(([wd, t0], i) => {
        const k = clamp((tp - t0) / .12);
        if (k > 0) {
          const s = lerp(1.35, 1, easeIO(k)), mx = cx + widths[i] / 2, my = WALL_TEXT.y[li];
          x.save(); x.translate(mx, my); x.scale(s, s); x.globalAlpha = smooth(k);
          x.fillStyle = edge; x.textAlign = 'center'; x.fillText(wd, 3, 4);
          x.fillStyle = ink; x.fillText(wd, 0, 0);
          x.restore();
        }
        cx += widths[i] + gap;
      });
    });
    x.restore();
  }

  function far(x, t) {
    x.fillStyle = mix(P.sheetDim, P.bgTop, .45);
    for (let i = 0; i < 8; i++) { const bx = -1500 + i * 230 + hash(i, 3) * 60, bh = 160 + hash(i, 4) * 120, bw = 190 + hash(i, 5) * 60; x.fillRect(bx, -110 - bh, bw, bh + 700); if (i % 3 === 1) { x.beginPath(); x.ellipse(bx + bw / 2, -110 - bh, bw * .26, bw * .32, 0, Math.PI, 0); x.fill(); } }
    x.fillStyle = mix(P.sheet2, P.bgBot, .3); x.beginPath(); x.moveTo(-2000, 900); for (let fx = -2000; fx <= 4000; fx += 20) x.lineTo(fx, fieldY(fx)); x.lineTo(4000, 900); x.closePath(); x.fill();
    x.fillStyle = mix(P.sheet2, P.ink, .25); for (let k = 0; k < 60; k++) { const gx = 440 + k * 55 + hash(k, 9) * 30, gy = fieldY(gx) + 2 + hash(k, 10) * 5; x.beginPath(); x.moveTo(gx - 6, gy + 8); x.lineTo(gx, gy - 8 - hash(k, 11) * 8); x.lineTo(gx + 6, gy + 8); x.fill(); }
    hunter(x, t);
  }
  function fieldY(x) { const u = (Math.min(x, 1700) - 850) / 900; return -104 + 30 * u * u; }
  const HUNT = { x: PORT ? 515 : 760, s: 1.45, prod: T.trouble + .05, strike: T.wild + .02 };
  HUNT.y = fieldY(HUNT.x);
  const HUNT_LAMP = [HUNT.x - 52, fieldY(HUNT.x - 52) - 17.6 * HUNT.s];
  const HB = [HUNT.strike + .02, HUNT.strike + .5], BACK = 20;
  const hBack = M.gait({ from: 0, to: BACK, t0: HB[0], until: HB[1], gait: 'walk', style: { step: 11, lift: 3, lean: -.12, head: -.12 }, arms: [[.2, .3], [2.4, 2.7]], hands: [{ pose: 'open', k: .3 }, GRIP] });
  const prodArm = k => [.5 + .5 * k, .9 + .4 * k];
  const hIdle = M.idle({ seed: 3, base: { ...M.stand(0), lean: .1, arms: [[.2, .3], prodArm(0)], hands: [{ pose: 'relaxed', k: .4 }, GRIP] } });
  function hunterPose(tp) {
    const S = HUNT.strike;
    if (tp < S) {
      const prod = Math.max(0, Math.sin(Math.PI * clamp((tp - HUNT.prod) / .35))) + Math.max(0, Math.sin(Math.PI * clamp((tp - HUNT.prod - .45) / .35)));
      return { ...hIdle(tp), arms: [[.2, .3], prodArm(prod)] };
    }
    const b = hBack(HB[0] + HB[1] - Math.min(tp, HB[1])), k = smooth((tp - S) / .22), sh = v => v - BACK;
    return { ...b, hip: [sh(b.hip[0]), b.hip[1]], feet: b.feet.map(f => ({ ...f, at: [sh(f.at[0]), f.at[1]], ax: f.ax != null ? sh(f.ax) : f.ax })), arms: [b.arms[0], [lerp(prodArm(0)[0], 2.4, k), lerp(prodArm(0)[1], 2.7, k)]] };
  }
  function hunter(x, t) {
    const tp = M.pose(t); if (tp < HUNT.prod - 1.2 || tp > T.s16) return;
    const hp = hunterPose(tp), dark = mix(P.sheet2, P.ink, .55);
    const o = { coat: dark, trouser: dark, skin: dark, shoe: dark, head: 'turban', headColor: dark, shadow: 0, armEdge: false, prop: (xx, PJ) => stick(xx, PJ, dark, .3) };
    x.save(); x.translate(HUNT.x, HUNT.y); x.scale(HUNT.s, HUNT.s); M.draw(x, P, hp, o); x.restore();
    const rise = smooth((tp - HUNT.prod - .5) / .3), lunge = Math.sin(Math.PI * clamp((tp - HUNT.strike + .06) / .3));
    const CX = HUNT.x + 104, CY = fieldY(CX) + 1;
    x.save(); x.beginPath(); x.rect(HUNT.x - 200, CY - 400, 600, 402); x.clip();
    x.translate(CX - 1.5 * lunge, CY + 26 * (1 - rise)); x.scale(.52, .52); x.rotate(-.12 * lunge);
    if (rise > 0) PR.cobraRear(x, P, { rise: .3 + .7 * rise, hood: rise, sway: Math.sin(tp * 4) * .1 - .25 * lunge, view: 'front' });
    x.restore();
    x.fillStyle = mix(P.sheet2, P.ink, .3);
    for (let k = 0; k < 7; k++) { const gx = HUNT.x + 84 + k * 6, gy = fieldY(gx) + 3; x.beginPath(); x.moveTo(gx - 7, gy); x.lineTo(gx + (k % 2 ? 3 : -3), gy - 22 - (k % 3) * 5); x.lineTo(gx + 7, gy); x.fill(); }
    x.save(); x.translate(HUNT_LAMP[0], HUNT_LAMP[1]); x.scale(HUNT.s, HUNT.s); FARM.lantern(x, P, 1, 1); x.restore();
  }
  function farms(x) {
    for (let i = 0; i < 7; i++) {
      const fx = 1350 + i * 420 + hash(i, 21) * 90, fw = 300 + hash(i, 22) * 80, top = -40 - hash(i, 23) * 40;
      for (let k = 0; k < 4; k++) { const cx = fx + 30 + k * (fw - 60) / 3, n = 3 + ((i + k) % 3); for (let j = 0; j < n; j++) { x.fillStyle = mix(P.wood, P.ink, .1); x.fillRect(cx - 30, top + 100 - (j + 1) * 34, 60, 32); x.fillStyle = mix(P.wood, P.cream, .25); for (let b = 0; b < 6; b++) x.fillRect(cx - 27 + b * 11, top + 102 - (j + 1) * 34, 2.5, 28); } }
      x.fillStyle = mix(P.wall, P.ink, .2); x.fillRect(fx - 10, top + 60, fw + 20, 700);
    }
  }
  const FARM_LAMPS = Array.from({ length: 7 }, (_, i) => [1350 + i * 420 + hash(i, 21) * 90 + 150, -40 - hash(i, 23) * 40 - 30]);

  const K = (t, x, y, z, x4, y4, z4) => [t, PORT ? [x4 ?? x, y4 ?? y, z4 ?? z * .8] : [x, y, z]];
  const PALM = [XM + 78, G - 156];
  const TRACK = [8.5, 9.6];
  const SHOT = PORT ? [1990, 70, 1.9] : [2010, 80, 2.1];
  const KEYS = [
    K(0, 40, 110, 1.75, 40, 95, 1.55),
    K(T.s14 + .1, 50, 112, 1.78, 50, 97, 1.58),
    K(4.75, 440, 150, 1.5, 460, 120, 1.3),
    K(T.breed - .02, 530, 240, 2.1, 530, 220, 1.7),
    K(TRACK[0], 533, 242, 2.12, 533, 222, 1.72),
    K(TRACK[1], SHOT[0], SHOT[1], SHOT[2], SHOT[0], SHOT[1], SHOT[2]),
    K(10.72, SHOT[0] + 20, SHOT[1] - 6, SHOT[2] * 1.07, SHOT[0] + 20, SHOT[1] - 6, SHOT[2] * 1.07),
    K(11.38, PALM[0] + 40, PALM[1] + 6, 10, PALM[0] + 30, PALM[1] + 6, 8),
    K(12.0, PALM[0] + 40, PALM[1] + 5, 10.3, PALM[0] + 30, PALM[1] + 5, 8.2),
    K(13.35, 1980, -60, .95, 2250, -70, 1.0),
    K(DUR, 1980, -62, .975, 2250, -72, 1.025),
  ];
  function keyedCam(t) {
    const xy = F.keyed(t, KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, KEYS.map(([k, v]) => [k, v[2]]), true);
    const u = clamp((t - TRACK[0]) / (TRACK[1] - TRACK[0])), dip = 1 - .62 * Math.sin(Math.PI * u);
    return { x: xy[0], y: xy[1], z: z * dip };
  }
  const ZIN = [T.why - .4, T.trouble + .05], ZOUT = [T.all + .03, T.breed - .02], HP = .5, HUNT_Z = PORT ? 9.5 : 10;
  const HUNT_AT = [HUNT.x + 40, HUNT.y - 58];
  const onScreen = (c, p, X, Y) => { const s = Math.pow(c.z, p); return [W / 2 + s * (X - p * c.x), H / 2 + s * (Y - p * c.y)]; };
  const solveCam = (p, X, Y, sx, sy, z) => { const s = Math.pow(z, p); return { x: (X - (sx - W / 2) / s) / p, y: (Y - (sy - H / 2) / s) / p, z }; };
  const ON_PALM = [[10.72, 11.38], [12.0, 13.35]];
  function cam(t) {
    for (const [a, b] of ON_PALM) if (t > a && t < b) {
      const A = keyedCam(a), Bc = keyedCam(b), sa = onScreen(A, 1, ...PALM), sb = onScreen(Bc, 1, ...PALM), u = easeIO((t - a) / (b - a));
      return solveCam(1, ...PALM, lerp(sa[0], sb[0], u), lerp(sa[1], sb[1], u), A.z * Math.pow(Bc.z / A.z, u));
    }
    if (t <= ZIN[0] || t >= ZOUT[1]) return keyedCam(t);
    const mid = [W / 2, H / 2];
    let u, za, zb, sa, sb;
    if (t < ZIN[1]) { u = easeIO((t - ZIN[0]) / (ZIN[1] - ZIN[0])); za = keyedCam(ZIN[0]).z; zb = HUNT_Z; sa = onScreen(keyedCam(ZIN[0]), HP, ...HUNT_AT); sb = mid; }
    else if (t < ZOUT[0]) { u = (t - ZIN[1]) / (ZOUT[0] - ZIN[1]); za = HUNT_Z; zb = HUNT_Z * 1.08; sa = sb = mid; }
    else { u = easeIO((t - ZOUT[0]) / (ZOUT[1] - ZOUT[0])); za = HUNT_Z * 1.08; zb = keyedCam(ZOUT[1]).z; sa = mid; sb = onScreen(keyedCam(ZOUT[1]), HP, ...HUNT_AT); }
    return solveCam(HP, ...HUNT_AT, lerp(sa[0], sb[0], u), lerp(sa[1], sb[1], u), za * Math.pow(zb / za, u));
  }
  const GATE_X = 400;
  function gateLeaf(x) {
    x.fillStyle = mix(P.wood, P.ink, .35); x.fillRect(GATE_X + 14, 96, 84, G - 96);
    x.fillStyle = mix(P.wood, P.ink, .5); for (let k = 0; k < 3; k++) x.fillRect(GATE_X + 14, 120 + k * 75, 84, 7);
  }
  function gatepost(x) {
    x.fillStyle = mix(MUD, P.ink, .3); x.fillRect(GATE_X - 22, 30, 44, G - 30);
    x.fillStyle = mix(MUD, P.ink, .45); x.fillRect(GATE_X - 28, 18, 56, 16);
  }

  function draw(ctx, t) {
    const c = cam(t), tp = M.pose(t);
    lamps.length = 0; palmAt = null;
    L.background(ctx);
    L.sheet(ctx, c, .5, R, x => far(x, t));
    L.sheet(ctx, c, .65, R, x => farms(x), { glow: .45 });
    if (tp < T.s16) { ctx.save(); F.sheet(ctx, c, .5, W, H, R); FARM.lampGlow(ctx, HUNT_LAMP[0], HUNT_LAMP[1] + FARM.GLASS[1] * HUNT.s, .7); ctx.restore(); }
    ctx.save(); F.sheet(ctx, c, .65, W, H, R); FARM_LAMPS.forEach(([lx, ly]) => FARM.lampGlow(ctx, lx, ly, .6)); ctx.restore();
    L.sheet(ctx, c, 1, R, x => {
      lane(x); yardWall(x); house(x); shadow(x, tp); stacks(x); gateLeaf(x);
      eggBasket(x, tp);
      crates(x, tp);
      note(x, tp); wallWords(x, tp);
      if (tp < 9.4) breeder(x, breederPose(tp), X0, breederPose(tp - 1 / M.RATE));
      else if (tp >= T.kill - .9) {
        const xp = xmPose(tp), PJ = breeder(x, xp, XM, null, { lantern: false, behind: (xx, PJ) => stick(xx, PJ, mix(P.wood, P.cream, .1), -.5, 0) });
        if (tp >= PALM_T[0] && tp < PK[4]) palmHand(x, PJ, xp.cupK, tp);
      }
      gatepost(x);
    });
    ctx.save(); F.sheet(ctx, c, 1, W, H, R);
    FARM.lampGlow(ctx, LAMP[0], LAMP[1] - 12 + FARM.GLASS[1] * 2, 1.1);
    lamps.forEach(([lx, ly, s, a]) => FARM.lampGlow(ctx, lx, ly, s, a * (Math.abs(lx - GATE_X) < 24 ? .4 : 1)));
    POLE_LAMPS.forEach(([lx, ly]) => FARM.lampGlow(ctx, lx, ly, .9));
    FARM.lampGlow(ctx, PEG[0] + 14, PEG[1] - 26 + FARM.GLASS[1] * BS, 1);
    PR.glow(ctx, HOUSE.win[0], HOUSE.win[1], 90, P.window, .3, 'lightbox');
    const eg = 1 - lidK(tp); if (eg > 0) PR.glow(ctx, BASKET.x, basketTop - 6, 60, P.lampGlass, .45 * eg, 'lightbox');
    const warm = palmAt ? 1 - smooth((tp - PK[0]) / .3) : 0;
    if (warm > 0) PR.glow(ctx, palmAt[0] + 8, palmAt[1] - 4, 34, P.glow, .22 * warm, 'lightbox');
    const ng = smooth((tp - T.printed) / .4); if (ng > 0) PR.glow(ctx, NOTE[0], NOTE[1] - 30 * NOTE_S, 70 * NOTE_S, PR.money('lightbox'), .12 * ng, 'lightbox');
    ctx.restore();
    L.grade(ctx, t);
  }

  const STEPS = perf.parts.filter(p => p.do === 'walk').flatMap(p => (p.fn.falls || []).map(f => f.t)).filter(t => t > 0 && t < DUR);
  const PAST_GATE = (() => { for (let k = 0; k < DUR * 30; k++) { const t = k / 30; if (X0 + BS * perf.at(t).x > GATE_X - 30) return t; } return 3.7; })();

  F.scene('seq-05', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { cam, G, YARD, HOUSE, STACKS, CAGE, BASKET, XM, BS, lane, yardWall, house, stacks, far, farms, eggBasket, note, poses: { breeder: breederPose, xm: xmPose, hunter: hunterPose }, perf } });
})();
