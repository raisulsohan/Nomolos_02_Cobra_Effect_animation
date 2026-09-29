(function () {
  'use strict';
  const F = FILM, PR = F.props, CITY = F.city, FARM = F.farm, M = F.motion, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, TAU } = F, mix = CITY.mix;
  const C = F.cues('seq-06'), DUR = C.duration;
  const LP = F.look('paper', W, H), LB = F.look('lightbox', W, H), PP = LP.P, PB = LB.P;
  const S2 = F.getScene('seq-02').api, S3 = F.getScene('seq-03').api, S5 = F.getScene('seq-05').api;
  const T = {
    work: 1.22, cancel: 2.677, breeders: 4.589, worthless: 7.178,
    s20: C.s('S020').t0, only: 9.363, sensible: 9.576, s21: C.s('S021').t0, open: 10.853, cages: 11.295,
  };

  const FL = S3.FL, TRAY = S3.TRAY, QS = 2.45;
  const OPOST = [-330, 10];
  const SUIT = '#d9ceb4', SKIN_O = '#e0bf9c', HAIR = '#2e2622';
  const SMALL = Array.from({ length: 8 }, (_, i) => ({ x: TRAY.x - 110 + i * 30 + hash(i, 1) * 14, y: TRAY.y - 27 - (i % 3) * 4, dir: hash(i, 2) < .5 ? -1 : 1, len: 48 + hash(i, 3) * 16, ph: hash(i, 4) * 6 }));
  function heapOfSmall(x) {
    SMALL.forEach(s => PR.cobraBody(x, PP, PR.slitherPath([s.x, s.y], s.len, { dir: s.dir, amp: 3, k: TAU / (s.len * .7), phase: s.ph }), { w: 5.6, belly: s.dir, eye: 0 }));
  }
  const OX = 330, YAW = Math.PI;
  const O_BASE = { ...M.stand(0), yaw: YAW, arms: [[.1, .22], [.1, .22]], hands: [{ pose: 'relaxed', k: .4 }, { pose: 'relaxed', k: .4 }] };
  const OK = M.keys([
    [.2, O_BASE],
    [.95, { ...O_BASE, hip: [-2.5, M.HIP + 1.2], lean: .42, bend: .22, head: .3, arms: [[.35, .5], [.3, .45]] }],
    [T.work - .1, { ...O_BASE, hip: [-2.5, M.HIP + 1.2], lean: .42, bend: .22, head: .32, arms: [[.35, .5], [.3, .45]] }],
    [T.work + .45, { ...O_BASE, head: -.12, headYaw: YAW - 1.25, arms: [[.1, .25], [.1, .22]] }],
    [T.cancel - .1, { ...O_BASE, head: -.05, headYaw: YAW - 1.1, arms: [[.1, .25], [.1, .22]] }],
  ], { lag: { arms: .05, head: .04 } });
  const oIdle = M.idle({ seed: 21, base: OK(T.cancel - .1), t0: T.cancel - .1 });
  function officialPose(tp) {
    const p = { ...(tp < T.cancel - .1 ? OK(tp) : oIdle(tp)) };
    const u = (tp - (T.work + .55)) / .9;
    if (u > 0 && u < 1) p.head = (p.head || 0) + .16 * Math.sin(TAU * u) * Math.sin(Math.PI * u);
    return p;
  }
  function official(x, tp) {
    x.save(); x.translate(OX, FL + 6); x.scale(QS, QS);
    M.draw(x, PP, officialPose(tp), { coat: SUIT, trouser: mix(SUIT, PP.ink, .12), skin: SKIN_O, head: 'bare', hair: HAIR, shoe: mix(PP.wood, PP.ink, .5) });
    x.restore();
  }
  const STAMP_T = [T.cancel - .34, T.cancel, T.cancel + .1, T.cancel + .5];
  const stampK = t => smooth((t - T.cancel) / .1);
  function office(x, t) {
    const tp = M.pose(t);
    S3.room(x, PP, t);
    x.save(); x.translate(OPOST[0], OPOST[1]);
    PR.poster(x, PP, 'paper', { w: S2.PW, h: S2.PH, coin: 1, reward: 1, cobra: 1, stamp: stampK(t) });
    x.fillStyle = mix(PP.ink, PP.wood, .3); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { x.beginPath(); x.arc(sx * (S2.PW / 2 - 14), sy * (S2.PH / 2 - 14), 7, 0, TAU); x.fill(); });
    x.restore();
    S3.clerk(x, PP, t + 30);
    S3.desk(x, PP, t, { tally: 2140 });
    S3.heap(x, PP, t);
    heapOfSmall(x);
    official(x, tp);
  }
  function stampHand(x, t) {
    if (t < STAMP_T[0] || t > STAMP_T[3] + .05) return;
    const inK = easeIO(clamp((t - STAMP_T[0]) / (STAMP_T[1] - STAMP_T[0] - .04))), outK = easeIO(clamp((t - STAMP_T[2]) / (STAMP_T[3] - STAMP_T[2])));
    const press = t >= STAMP_T[1] - .04 && t < STAMP_T[2];
    const at = [OPOST[0] + lerp(360, 0, inK) + lerp(0, 380, outK), OPOST[1] + lerp(60, 0, inK) + lerp(0, 40, outK)], s = press ? 1 : 1.12;
    x.save(); x.translate(at[0], at[1]); x.rotate(-.22); x.scale(s, s);
    PR.rubberStamp(x, PP, 200, 70, 'paper');
    x.restore();
    const hs = 1.5 * s;
    x.save(); x.translate(at[0] + 42 * hs, at[1] + 2); x.scale(hs, hs);
    F.people.hand(x, PP, { pose: 'grip', skin: SKIN_O, sleeve: SUIT, cuff: mix(SUIT, PP.ink, .15), arm: 170 });
    x.restore();
  }

  const G = S5.G, BS = S5.BS, POST = S2.POST, LAMP = [-175, -70];
  const BRD = FARM.breeder(PB), CAGE = { w: 64, h: 42 };
  const OTHERS = [
    { x: -215, s: BS, yaw: 0, coat: mix(mix(PB.sheet, PB.wood, .3), PB.ink, .3), head: 'turban', seed: 31, down: T.sensible + .45, open: T.cages + .15 },
    { x: -430, s: BS * .9, yaw: 0, coat: mix(mix(PB.sheet, PB.cream, .05), PB.ink, .45), head: 'cap', seed: 32, down: T.sensible + .7, open: T.cages + .45 },
  ];
  const BX = 115;
  const LOOK = [T.s20 - .05, T.s20 + .3], UP = [T.only - .12, T.only + .02], SHRUG = [T.only + .06, T.only + .2, T.only + .34];
  const DOWN = [SHRUG[2] + .02, SHRUG[2] + .66];
  const CAGE_GROUND = [BX - 46, G + 8];
  const LATCH = [T.open - .45, T.open, T.open + .18];
  const DOOR = [T.open + .12, T.open + .62];
  const doorAt = tp => smooth((tp - DOOR[0]) / (DOOR[1] - DOOR[0]));
  const RELEASE = DOOR[0] + .26;
  const OUT_T = T.open + .42;
  const B_BASE = { ...M.stand(0), yaw: Math.PI, arms: [[.12, .2], [.08, .2]], hands: [{ pose: 'grip' }, { pose: 'relaxed', k: .4 }] };
  const BK = M.keys([
    [T.worthless - .1, B_BASE],
    [T.worthless + .4, { ...B_BASE, head: .32, bend: .08 }],
    [LOOK[0], { ...B_BASE, head: .3, bend: .08 }],
    [LOOK[1], { ...B_BASE, head: .36, bend: .06, arms: [[.75, 1.55], [.08, .2]] }],
    [UP[0], { ...B_BASE, head: .3, bend: .06, arms: [[.75, 1.55], [.08, .2]] }],
    [UP[1], { ...B_BASE, head: -.08, headYaw: Math.PI - .15, arms: [[.7, 1.5], [.08, .2]] }],
    [SHRUG[0], { ...B_BASE, head: -.06, headYaw: Math.PI - .15, arms: [[.7, 1.5], [.1, .25]] }],
    [SHRUG[1], { ...B_BASE, head: .1, bend: -.04, headYaw: Math.PI - .1, arms: [[.72, 1.52], [.35, .95, .35]], hands: [{ pose: 'grip' }, { pose: 'open', k: .3 }] }],
    [SHRUG[2], { ...B_BASE, head: .05, arms: [[.6, 1.3], [.1, .25]] }],
    [DOWN[1], { ...B_BASE, hip: [-3, M.HIP + 15], lean: .75, bend: .3, head: .35, arms: [[.9, .9], [.25, .35]] }],
  ], { lag: { arms: .05, head: .04 } });
  const CROUCH = BK(DOWN[1]);
  const bIdle = M.idle({ seed: 33, base: CROUCH, t0: DOWN[1] });
  const handleTop = PJ => { const a = PJ.arms[0], dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], l = Math.hypot(dx, dy) || 1; return [a.wr[0] + dx / l * 3.5, a.wr[1] + dy / l * 3.5]; };
  const HANDLE_UP = CAGE.h + 1 + 64 * .18;
  const GOAL_HAND = [CAGE_GROUND[0], CAGE_GROUND[1] - HANDLE_UP - 3.5 * BS];
  function breederPose(tp) {
    const p = { ...(tp < DOWN[1] ? BK(tp) : bIdle(tp)) };
    const k = smooth((tp - DOWN[0]) / (DOWN[1] - DOWN[0]));
    const stageOf = v => [(v[0] - BX) / BS * -1, (v[1] - G) / BS];
    if (k > 0) {
      const J = M.joints(p), wr = J.arms[0].wr, goal = stageOf(GOAL_HAND);
      M.reach(p, 0, [lerp(wr[0], goal[0], k), lerp(wr[1], goal[1], k)]);
    }
    if (tp >= DOWN[1]) {
      const J = M.joints(p), settle = smooth((tp - DOWN[1]) / .3), goal0 = stageOf(GOAL_HAND), thigh = [J.hip[0] + 9, J.hip[1] + 3];
      const rest = [lerp(goal0[0], thigh[0], settle), lerp(goal0[1], thigh[1], settle)], fw = J.arms[1].wr;
      M.reach(p, 1, [lerp(fw[0], J.hip[0] + 7, settle), lerp(fw[1], J.hip[1] + 5, settle)]); p.hands = [p.hands[0], { pose: 'rest', k: .6 }];
      const LW = FARM.LATCH(CAGE.w, CAGE.h), latchW = [CAGE_GROUND[0] + LW[0] + 4, CAGE_GROUND[1] + LW[1] - 2];
      const edgeW = d => [CAGE_GROUND[0] + (CAGE.w / 2 - 4) * Math.cos(Math.PI * .92 * d) + 3, latchW[1] - 7];
      const kin = smooth((tp - LATCH[0]) / (LATCH[1] - LATCH[0] - .05)), lift = smooth((tp - LATCH[1]) / (LATCH[2] - LATCH[1])) * 7;
      let w0 = [latchW[0], latchW[1] - lift];
      if (tp >= DOOR[0]) w0 = edgeW(doorAt(Math.min(tp, RELEASE)));
      const back = smooth((tp - RELEASE) / .45), tgtW = stageOf(w0), tgt = [lerp(lerp(rest[0], tgtW[0], kin), rest[0], back), lerp(lerp(rest[1], tgtW[1], kin), rest[1], back)];
      M.reach(p, 0, tgt);
      const pk = kin < .6 ? 0 : smooth((tp - (LATCH[1] - .14)) / .12) * (1 - smooth((tp - RELEASE) / .15));
      p.hands = [tp > RELEASE + .15 ? { pose: 'relaxed', k: .45 } : pk > 0 || kin > .6 ? { pose: 'pinch', k: pk } : { pose: 'rest', k: .6 }, p.hands[1]];
    }
    return p;
  }
  function heldBottom() {
    const a = M.joints(breederPose(DOWN[1] - 1e-4)).arms[0], dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], l = Math.hypot(dx, dy) || 1;
    return [BX - (a.wr[0] + dx / l * 3.5) * BS, G + (a.wr[1] + dy / l * 3.5) * BS + HANDLE_UP];
  }
  for (let it = 0; it < 4; it++) { const b = heldBottom(); GOAL_HAND[0] -= b[0] - CAGE_GROUND[0]; GOAL_HAND[1] -= b[1] - CAGE_GROUND[1]; }
  { const b = heldBottom(); CAGE_GROUND[0] = b[0]; CAGE_GROUND[1] = b[1]; }
  const cageDown = tp => tp >= DOWN[1];
  function heldCage(xx, PJ, tp, w0, h0) {
    const top = handleTop(PJ);
    xx.save(); xx.translate(top[0], top[1]); xx.scale(1 / BS, 1 / BS); xx.translate(0, HANDLE_UP);
    FARM.cage(xx, PB, { w: w0, h: h0, part: 'back', t: tp, n: 2, seed: 3 }); FARM.cage(xx, PB, { w: w0, h: h0, part: 'front' });
    xx.restore();
  }
  function breeder(x, tp, part) {
    const p = breederPose(tp);
    const o = { ...BRD, part };
    if (!cageDown(tp)) o.prop = (xx, PJ) => heldCage(xx, PJ, tp, CAGE.w, CAGE.h);
    x.save(); x.translate(BX, G); x.scale(BS, BS); const PJ = M.draw(x, PB, p, o); x.restore();
    return PJ;
  }
  function other(x, o, tp) {
    const base = { ...M.stand(0), yaw: o.yaw, arms: [[.08, .2], [.12, .2]], hands: [{ pose: 'relaxed', k: .4 }, { pose: 'grip' }] };
    const idle = M.idle({ seed: o.seed, base })(tp), bend = smooth((tp - (o.down - .5)) / .5) * (1 - smooth((tp - (o.down + .6)) / .5));
    const p = { ...idle, hip: [idle.hip[0] - 3 * bend, idle.hip[1] + 13 * bend], lean: (idle.lean || 0) + .7 * bend, bend: (idle.bend || 0) + .3 * bend, head: (idle.head || 0) + .3 * bend };
    const down = tp >= o.down, cg = [o.x + 50 * o.s / BS, G];
    if (!down) {
      const k = smooth((tp - (o.down - .5)) / .5), J = M.joints(p), wr = J.arms[1].wr, goal = [(cg[0] - o.x) / o.s, (-HANDLE_UP * o.s / BS) / o.s - 3.5];
      if (k > 0) M.reach(p, 1, [lerp(wr[0], goal[0], k), lerp(wr[1], goal[1], k)]);
    }
    const oo = { ...BRD, coat: o.coat, head: o.head, headColor: mix(PB.cream, PB.sheet, .5) };
    if (!down) oo.prop = (xx, PJ) => { const top = handleTop({ arms: [PJ.arms[1]] }); xx.save(); xx.translate(top[0], top[1]); xx.scale(1 / BS, 1 / BS); xx.translate(0, HANDLE_UP); FARM.cage(xx, PB, { w: CAGE.w, h: CAGE.h, part: 'back', t: tp, n: 2, seed: o.seed }); FARM.cage(xx, PB, { w: CAGE.w, h: CAGE.h, part: 'front' }); xx.restore(); };
    else { const d = smooth((tp - o.open) / .4); x.save(); x.translate(cg[0], cg[1]); x.scale(o.s / BS, o.s / BS); FARM.cage(x, PB, { w: CAGE.w, h: CAGE.h, part: 'back', t: tp, n: 2, seed: o.seed }); FARM.cage(x, PB, { w: CAGE.w, h: CAGE.h, part: 'front', door: d, latch: d }); x.restore(); }
    x.save(); x.translate(o.x, G); x.scale(o.s, o.s); M.draw(x, PB, p, oo); x.restore();
  }
  const OUTPATH = (() => {
    const ox = CAGE_GROUND[0] + 14, fl = CAGE_GROUND[1] - 8, wall = CAGE_GROUND[0] - CAGE.w / 2 + 9, run = ox - wall, gy = CAGE_GROUND[1] + 1.5;
    return s => s <= -run ? [Math.min(ox, wall + (-run - s)), fl - 9] : s <= 0 ? [ox + s, fl] : s <= 12 ? [ox - s * .9, fl + (gy - fl) * s / 12] : [ox - 10.8 - (s - 12), gy];
  })();
  function escaping(x, tp, part) {
    if (tp < OUT_T) return;
    const head = (tp - OUT_T) * 70 + 4, ix = CAGE_GROUND[0] - CAGE.w / 2 + 3, iy = CAGE_GROUND[1] - CAGE.h + 3;
    x.save(); x.beginPath();
    if (part === 'out') x.rect(-1e5, -1e5, 2e5, 2e5);
    x.rect(ix, iy, CAGE.w - 6, CAGE.h - 7); x.clip('evenodd');
    PR.cobraBody(x, PB, PR.slitherAlong(OUTPATH, head, 80, { amp: 3.4, k: TAU / 34 }), { w: 7, belly: 1, tongue: ((tp * 1.6) % 1) < .3 ? ((tp * 1.6) % 1) / .3 : 0 });
    x.restore();
  }
  function lane(x, t) {
    const tp = M.pose(t);
    S5.lane(x); S5.yardWall(x);
    x.save(); x.translate(POST[0], POST[1]); PR.poster(x, FARM.lit(PB, .92), 'lightbox', { w: S2.PW, h: S2.PH, coin: 1, reward: 1, cobra: 1, stamp: 1 }); x.restore();
    OTHERS.slice().reverse().forEach(o => other(x, o, tp));
    if (!cageDown(tp)) breeder(x, tp);
    else { breeder(x, tp, 'far'); breeder(x, tp, 'body'); }
    if (cageDown(tp)) {
      const d = doorAt(tp), l = smooth((tp - LATCH[1]) / (LATCH[2] - LATCH[1]));
      x.save(); x.translate(CAGE_GROUND[0], CAGE_GROUND[1]); FARM.cage(x, PB, { w: CAGE.w, h: CAGE.h, part: 'back', t: tp, n: tp < OUT_T ? 2 : 1, seed: 3 }); x.restore();
      escaping(x, tp, 'in');
      x.save(); x.translate(CAGE_GROUND[0], CAGE_GROUND[1]); FARM.cage(x, PB, { w: CAGE.w, h: CAGE.h, part: 'front', door: d, latch: l }); x.restore();
      escaping(x, tp, 'out');
      breeder(x, tp, 'near');
    }
  }

  const Z0 = PORT ? 1.3 : 2.0, ZP = PORT ? 2.9 : 2.4;
  const OFFICE_KEYS = [[0, [PORT ? -40 : -60, PORT ? 30 : 60, Z0]], [1.85, [PORT ? -45 : -65, PORT ? 26 : 56, Z0 * 1.05]], [2.95, [OPOST[0], OPOST[1], ZP]], [4.3, [OPOST[0], OPOST[1], ZP * 1.07]]];
  function ocam(t) { const xy = F.keyed(t, OFFICE_KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, OFFICE_KEYS.map(([k, v]) => [k, v[2]]), true); return { x: xy[0], y: xy[1], z }; }
  const GROUP = PORT ? [-110, 160, 1.6] : [-60, 190, 1.6], CLOSE = PORT ? [CAGE_GROUND[0] + 12, 300, 4] : [CAGE_GROUND[0] + 18, 300, 4.6];
  const LANE_KEYS = [[4.3, [POST[0], POST[1], ZP * 1.07]], [5.9, GROUP], [T.sensible + .2, [GROUP[0] + 25, GROUP[1] + 8, GROUP[2] * 1.07]], [LATCH[0] + .25, CLOSE], [DUR, [CLOSE[0] - 6, CLOSE[1], CLOSE[2] * 1.06]]];
  function lcam(t) {
    const xy = F.keyed(t, LANE_KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, LANE_KEYS.map(([k, v]) => [k, v[2]]), true);
    const a = T.sensible + .2, b = LATCH[0] + .25;
    if (t > a && t < b) {
      const cA = { x: LANE_KEYS[2][1][0], y: LANE_KEYS[2][1][1], z: LANE_KEYS[2][1][2] }, cB = { x: CLOSE[0], y: CLOSE[1], z: CLOSE[2] }, S = [CAGE_GROUND[0], G - 20];
      const sc = c => [W / 2 + c.z * (S[0] - c.x), H / 2 + c.z * (S[1] - c.y)], sa = sc(cA), sb = sc(cB), u = easeIO((t - a) / (b - a)), zz = cA.z * Math.pow(cB.z / cA.z, u);
      const sx = lerp(sa[0], sb[0], u), sy = lerp(sa[1], sb[1], u);
      return { x: S[0] - (sx - W / 2) / zz, y: S[1] - (sy - H / 2) / zz, z: zz };
    }
    return { x: xy[0], y: xy[1], z };
  }
  const NIGHT = [3.45, 4.35];

  function draw(ctx, t) {
    const n = smooth((t - NIGHT[0]) / (NIGHT[1] - NIGHT[0]));
    if (n < 1) {
      const c = ocam(t);
      LP.background(ctx);
      LP.sheet(ctx, c, 1, [0, 0], x => office(x, t));
      LP.sheet(ctx, c, 1.12, [0, 0], x => S3.punkah(x, PP, t), { shadowAlpha: .6 });
      LP.sheet(ctx, c, 1, [0, 0], x => stampHand(x, t), { paperShadow: [6, 9, 6, .3] });
      LP.grade(ctx, t);
    }
    if (n > 0) {
      const c = lcam(t);
      ctx.save(); ctx.globalAlpha = n; LB.background(ctx); ctx.restore();
      LB.sheet(ctx, c, .5, [0, 0], x => S5.far(x, 99), { alpha: n });
      LB.sheet(ctx, c, 1, [0, 0], x => lane(x, t), { alpha: n, glow: .6 * n });
      ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); ctx.globalAlpha = n;
      FARM.lampGlow(ctx, LAMP[0], LAMP[1] - 12 + FARM.GLASS[1] * 2, 1.1, n);
      PR.glow(ctx, POST[0], POST[1], 260, PB.glow, .12 * n, 'lightbox');
      ctx.restore();
      if (n >= 1) LB.grade(ctx, t);
    }
  }

  F.scene('seq-06', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { ocam, lcam, office, lane, poses: { official: officialPose, breeder: breederPose } } });
})();
