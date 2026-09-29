(function () {
  'use strict';
  const F = FILM, PR = F.props, FARM = F.farm, M = F.motion, RU = F.rulers, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-08'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, CAST = RU.cast(P);
  const T = {
    gov: 0.305, company: 1.381, parent: 2.506, eventually: 2.872, wall: 4.47,
    s26: C.s('S026').t0, something: 6.595, s27: C.s('S027').t0, make: 8.172,
    s28: C.s('S028').t0, order: 9.368, s29: C.s('S029').t0, stand: 11.135, everyone: 11.628, time: 12.385,
    s30: C.s('S030').t0, beg: 13.436, s31: C.s('S031').t0, goodwill: 14.823, thin: 15.66, fast: 15.973,
    s32: C.s('S032').t0, cleverest: 18.263, s33: C.s('S033').t0, pay: 19.749,
    s34: C.s('S034').t0, reward: 21.216, want: 22.545, step: 22.997, let: 24.319, self: 25.178, work: 26.219,
  };

  const HO = { x0: -760, x1: 300, wt: 22, g: 300, sh: 170, slab: 16, k: .8, vx: -230 };
  const ROOM = [0, 1, 2].map(i => RU.room(HO, i));
  const EDGE = HO.x1;
  const FLAG = { x: 326, base: 306, top: -12, w: 104, h: 58 };
  const HORIZON = 250;

  function sky(x) {
    const g = x.createLinearGradient(0, -900, 0, HORIZON + 40);
    g.addColorStop(0, '#34445e'); g.addColorStop(.55, '#6d7f93'); g.addColorStop(.86, '#c9a488'); g.addColorStop(1, '#e2b891');
    x.fillStyle = g; x.fillRect(-3000, -1400, 7000, 2000);
  }
  function hills(x) {
    x.fillStyle = mix('#7c8a7c', '#34445e', .35);
    x.beginPath(); x.moveTo(-2400, 420);
    for (let X = -2400; X <= 3400; X += 60) x.lineTo(X, 205 - 34 * Math.sin(X / 310) - 18 * Math.sin(X / 97 + 1.3) - 10 * hash(Math.round(X / 60), 51));
    x.lineTo(3400, 420); x.closePath(); x.fill();
    x.fillStyle = mix('#5f705f', '#34445e', .3);
    for (let k = 0; k < 44; k++) { const X = -2200 + k * 130 + hash(k, 52) * 70, r = 16 + hash(k, 53) * 14; x.beginPath(); x.arc(X, 226 - r * .6, r, 0, TAU); x.fill(); x.fillRect(X - 2, 226 - r * .2, 4, r * .6); }
  }
  function field(x) {
    const g = x.createLinearGradient(0, HORIZON, 0, 520);
    g.addColorStop(0, '#9aa17a'); g.addColorStop(1, '#b3ad82');
    x.fillStyle = g; x.fillRect(-2400, HORIZON, 5800, 900);
    x.fillStyle = mix('#9aa17a', P.ink, .08);
    for (let k = 0; k < 70; k++) { const X = -900 + k * 41 + hash(k, 61) * 30, Y = HORIZON + 12 + hash(k, 62) * 200; x.fillRect(X, Y, 10 + hash(k, 63) * 8, 2); }
    x.fillStyle = mix('#b3ad82', P.ink, .18); x.fillRect(HO.x0 - 20, HO.g, HO.x1 + HO.wt - HO.x0 + 40, 7);
  }
  function flagpole(x, t) {
    x.fillStyle = mix(P.wood, P.ink, .35); x.fillRect(FLAG.x - 3, FLAG.top, 6, FLAG.base - FLAG.top);
    x.fillStyle = mix(P.amberDark, P.ink, .45); x.beginPath(); x.arc(FLAG.x, FLAG.top - 4, 5.5, 0, TAU); x.fill();
    x.fillStyle = mix(P.wood, P.ink, .5); x.fillRect(FLAG.x - 9, FLAG.base - 6, 18, 8);
    const stir = .35 + .65 * smooth((t - (T.something - .1)) / .5) * (1 - .6 * smooth((t - (T.something + 1.6)) / 1.5)) + .7 * smooth((t - (T.want - .1)) / .4) * (1 - smooth((t - (T.want + 1.2)) / 1.4));
    const wave = (u, v) => [FLAG.x + 3 + u * FLAG.w, FLAG.top + 2 + v * FLAG.h + stir * u * 6 * Math.sin(u * 5.5 - t * 5.2)];
    const band = (v0, v1, col) => { x.fillStyle = col; x.beginPath(); for (let k = 0; k <= 12; k++) { const p = wave(k / 12, v0); k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } for (let k = 12; k >= 0; k--) { const p = wave(k / 12, v1); x.lineTo(p[0], p[1]); } x.closePath(); x.fill(); };
    band(0, .36, '#56657a'); band(.36, .64, P.cream); band(.64, 1, '#56657a');
  }

  const LIGHT_ON = [T.parent, T.company, T.gov].map(t => t + .05), DIM = [T.step + .35, T.step + 1.1];
  const light = t => LIGHT_ON.map(t0 => smooth((t - t0) / .22) * (1 - .55 * smooth((t - DIM[0]) / (DIM[1] - DIM[0]))));
  const DROP = [T.s26 + .05, T.s26 + 1.0];
  const drop = t => { const u = clamp((t - DROP[0]) / (DROP[1] - DROP[0])); return u * u; };

  const FZ = .04, FS = 1.25 * (1 - (1 - HO.k) * FZ);
  const XO = 268, XT = 236, FST = FS * RU.TODDLER;
  const G2 = i => ROOM[i].at(0, ROOM[i].floor, FZ)[1];
  const WALL_S = (ROOM[0].at(HO.x1, 0, FZ)[0] - XO) / FS;
  const toS = (i, p) => [(p[0] - XO) / FS, (p[1] - G2(i)) / FS];
  const K = (b, o) => ({ ...b, ...o });
  const reachP = (b, i, pt, hand) => { const p = { ...b, arms: b.arms.slice(), hands: (b.hands || [null, null]).slice() }; M.reach(p, i, pt); if (hand) p.hands[i] = hand; return p; };
  const over = (p, i) => { const a = p.arms[i].map(v => v < -Math.PI / 2 ? v + TAU : v); p.arms = p.arms.map((v, j) => j === i ? a : v); return p; };
  const ramp = (t, a, b) => smooth((t - a) / (b - a));
  const REL = { pose: 'relaxed', k: .45 }, OPEN = { pose: 'open', k: .8 }, GRIP = { pose: 'grip' }, FIST = { pose: 'fist' };
  const WALLHAND = { pose: 'open', k: .95, wrist: -1.25 };
  const ST = M.stand(0), SH = M.joints(ST).sh;
  const HANDWALL = reachP(ST, 1, [WALL_S - 1.4, SH[1] + 1], WALLHAND);
  const seq = parts => t => { let k = 0; while (k < parts.length - 1 && t >= parts[k + 1][0]) k++; return parts[k][1](t); };
  const leaveAt = i => { const top = RU.wallTop(HO, 0), y = G2(i) + (SH[1] + 1) * FS, u = Math.sqrt(clamp((y - top) / (HO.g - top))); return DROP[0] + u * (DROP[1] - DROP[0]); };
  function wallKeys(i, headOut) {
    const lv = leaveAt(i);
    return [
      [T.wall, HANDWALL], [T.wall + .12, K(HANDWALL, { hip: [-1.8, M.HIP + .3], head: -.1 })], [T.wall + .42, HANDWALL],
      [T.wall + .82, K(HANDWALL, { head: -.36, lean: -.02 })], [lv, K(HANDWALL, { head: -.36, lean: -.02 })],
      [lv + .2, reachP(K(ST, { lean: .13, head: -.12 }), 1, [WALL_S + 2, SH[1] + 9], OPEN)], [lv + .65, K(ST, { head: 0 })], [Math.max(T.s26 + 1.5, lv + .9), K(ST, { head: headOut })],
    ];
  }
  const approach = (walk, t) => { const p = walk(t), k = ramp(t, T.wall - .4, T.wall); if (k <= 0) return p; p.arms = [p.arms[0], M.mixPose(K(p, {}), HANDWALL, k).arms[1]]; if (k > .5) p.hands = [p.hands[0], WALLHAND]; return p; };

  const HOOK = [255, -168];
  const LANT = (() => {
    const x0 = (55 - XO) / FS, B0 = M.stand(x0);
    const speak = K(B0, { arms: [B0.arms[0], [.95, 1.95]], hands: [B0.hands[0], { pose: 'open', k: .6 }], head: -.04 });
    const pre = M.keys([[T.gov + .02, B0], [T.gov + .25, speak], [T.gov + .47, K(speak, { arms: [B0.arms[0], [.85, 1.7]] })], [1.0, B0]], { lag: { arms: .05 } });
    const walk = M.gait({ from: x0, to: 0, t0: 1.1, until: T.wall, gait: 'walk' });
    const flagS = toS(2, [FLAG.x + 50, FLAG.top + 30]), d = [flagS[0] - SH[0], flagS[1] - SH[1]], dl = Math.hypot(d[0], d[1]);
    const point = reachP(K(ST, { lean: .06, head: .24 }), 1, [SH[0] + d[0] / dl * 34, SH[1] + d[1] / dl * 34], { pose: 'point' });
    const cock = reachP(K(ST, { lean: -.02, head: .1 }), 1, [SH[0] + 6, SH[1] + 14], FIST);
    const bail = toS(2, HOOK), up = over(reachP(K(ST, { head: -.32 }), 1, [bail[0], bail[1] + 5.4], GRIP), 1), lift = over(reachP(K(ST, { head: -.28 }), 1, [bail[0], bail[1] + 2], GRIP), 1);
    const outA = reachP(K(ST, { lean: .07, head: .2 }), 1, [SH[0] + 27, SH[1] + 6], GRIP), outB = reachP(K(ST, { lean: .09, head: .12 }), 1, [SH[0] + 29, SH[1] + 1], GRIP);
    const side = reachP(K(ST, { head: .06 }), 1, [5, -33], GRIP);
    const hookUp = over(reachP(K(ST, { head: -.3 }), 1, [bail[0], bail[1] + 2], GRIP), 1), let_ = over(reachP(K(ST, { head: -.3 }), 1, [bail[0], bail[1] + 8], OPEN), 1);
    const main = M.keys([
      ...wallKeys(2, .16),
      [T.s27 + .15, K(ST, { head: .16 })], [T.s27 + .6, K(ST, { head: .18, arms: [[-.42, -.1], [-.5, -.18]], hands: [REL, REL] })],
      [T.s28 - .02, K(ST, { head: .18, arms: [[-.42, -.1], [-.5, -.18]], hands: [REL, REL] })],
      [T.order - .12, cock], [T.order + .06, point], [T.order + .16, reachP(point, 1, [SH[0] + d[0] / dl * 35.5, SH[1] + d[1] / dl * 35.5], { pose: 'point' })], [T.order + .3, point],
      [T.s29 + .02, point], [T.s29 + .5, up], [T.s29 + .58, up], [T.s29 + .72, lift], [T.s29 + .95, reachP(K(ST, { head: .05 }), 1, [SH[0] + 18, SH[1] - 8], GRIP)], [T.s29 + 1.22, outA], [12.05, outA], [12.5, outB],
      [T.s30 + .05, outB], [T.s30 + .55, side],
    ], { lag: { arms: .04, head: .04 } });
    const hold = M.idle({ seed: 81, base: side, t0: T.s30 + .55 });
    const back = M.keys([[T.step + .1, side], [T.step + .6, hookUp], [T.step + .68, hookUp], [T.step + .82, let_], [T.step + 1.15, K(ST, { head: .05 })]], { lag: { arms: .04 } });
    const turn = M.turn({ x: 0, t0: T.step + 1.2, from: 0, to: Math.PI, dur: 1.1 });
    const f = seq([[-1, pre], [1.1, t => approach(walk, t)], [T.wall, main], [T.s30 + .55, t => { const p = hold(t); p.arms = [p.arms[0], side.arms[1]]; p.hands = [p.hands[0], GRIP]; return p; }], [T.step + .1, back], [T.step + 1.2, turn]]);
    f.hook = { up: T.s29 + .58, off: T.s29 + .72, on: T.step + .72 }; f.walk = walk;
    return f;
  })();

  const TIE = [FLAG.x, FLAG.top + FLAG.h + 12];
  const BOSS = (() => {
    const x0 = (90 - XO) / FS, AWAY = -Math.PI / 2 - .45, B0 = K(M.stand(0), { yaw: AWAY, root: [x0, 0] }), bIdle = M.idle({ seed: 82, base: B0 });
    const turn0 = M.turn({ x: 0, t0: T.company + .02, from: AWAY, to: 0, dur: .85 }), turnIn = t => K(turn0(t), { root: [x0, 0] }); turnIn.end = turn0.end;
    const WALK0 = T.company + .9, walk = M.gait({ from: x0, to: 0, t0: WALK0, until: T.wall, gait: 'brisk' });
    const fold = (() => { const p = K(ST, { head: .1 }); M.reach(p, 1, [SH[0] + 7, SH[1] + 11]); M.reach(p, 0, [SH[0] + 9, SH[1] + 9]); p.hands = [FIST, FIST]; return p; })();
    const STB = K(ST, { arms: [[-.02, .06], ST.arms[1]] });
    const aha = K(STB, { head: -.06, arms: [STB.arms[0], [.95, 3.0]], hands: [ST.hands[0], { pose: 'point' }] });
    const HIP0 = ST.hip, pocket = [HIP0[0] + 7, HIP0[1] + 3];
    const inPocket = reachP(K(STB, { head: .2 }), 1, pocket, { pose: 'pinch', k: .8 }), show = reachP(K(STB, { head: .05 }), 1, [SH[0] + 17, SH[1] + 3], { pose: 'pinch', k: 1 });
    const out = reachP(K(STB, { lean: .05, head: .12 }), 1, [SH[0] + 29, SH[1] + 1], { pose: 'pinch', k: 1 });
    const main = M.keys([
      ...wallKeys(1, .12),
      [T.s27 + .2, K(ST, { head: .1 })], [T.s27 + .75, fold], [T.cleverest - .38, fold], [T.cleverest - .06, aha], [T.cleverest + .16, aha],
      [T.cleverest + .36, inPocket], [T.cleverest + .44, inPocket], [T.cleverest + .9, show], [T.pay - .2, show], [T.pay + .05, out], [T.s34 + .02, out],
    ], { lag: { arms: .04, head: .04 } });
    const EDGE_S = 16, tieS = toS(1, TIE);
    const step = M.gait({ from: 0, to: EDGE_S, t0: T.s34 + .02, until: T.s34 + .62, gait: 'walk', style: { step: 16 } });
    const lean = p => K(p, { lean: .35, bend: .04, head: .16 });
    const reachTie = (t, extra = [0, 0]) => { const p = lean(step(t)); M.reach(p, 1, [tieS[0] - 5.2 + extra[0], tieS[1] + .6 + extra[1]]); p.hands = [p.hands[0], GRIP]; return p; };
    const KNOT = [T.s34 + .62, T.want - .25];
    const stepBack = M.gait({ from: -14, to: EDGE_S, t0: T.step, until: T.step + .62, gait: 'walk', style: { step: 16 } });
    const handsUp = [[.55, 2.55], [.62, 2.62]], PALMS = { pose: 'open', k: .9, wrist: -1.1 };
    const turn1 = M.turn({ x: 0, t0: T.step + 1.25, from: 0, to: Math.PI, dur: 1.1 }), turn = t => K(turn1(t), { root: [-14, 0] });
    const f = seq([
      [-1, t => t < T.company + .02 ? bIdle(t) : t < turnIn.end ? turnIn(t) : M.stand(x0)], [WALK0, t => approach(walk, t)], [T.wall, main],
      [T.s34 + .02, t => {
        const k = ramp(t, T.s34 + .02, T.s34 + .5), lp = lean(step(t));
        if (t < KNOT[0]) { const p = M.mixPose(K(out, { hip: lp.hip, feet: lp.feet }), reachTie(t), k); p.hip = lp.hip; p.feet = lp.feet; p.lean = lerp(out.lean, lp.lean, k); p.hands = [out.hands[0], k > .8 ? GRIP : { pose: 'pinch', k: 1 }]; return p; }
        if (t < KNOT[1]) { const a = TAU * 2 * (t - KNOT[0]) / (KNOT[1] - KNOT[0]); return reachTie(t, [2.4 * Math.cos(a) - 2.4, 2.4 * Math.sin(a)]); }
        const p = reachTie(t), u = ramp(t, KNOT[1] + .05, T.step - .02); p.hands = [p.hands[0], u > .3 ? OPEN : p.hands[1]];
        const rest = K(M.stand(EDGE_S), {}); const q = M.mixPose(p, rest, u); q.hands = p.hands; return q;
      }],
      [T.step, t => { const p = stepBack(2 * T.step + .62 - t), k = ramp(t, T.step, T.step + .25) * (1 - ramp(t, T.step + .75, T.step + 1.15));
        if (k > 0) { p.arms = M.mixPose(p, K(p, { arms: handsUp }), k).arms; if (k > .4) p.hands = [PALMS, PALMS]; } return p; }],
      [T.step + 1.25, turn],
    ]);
    f.handsUp = { handsUp, PALMS }; f.KNOT = KNOT; f.walk = walk;
    return f;
  })();

  const BOWL = T.beg + .72;
  const MOTHER = (() => {
    const x0 = (205 - XO) / FS, B0 = M.stand(x0), WALK0 = T.parent + .35;
    const wind = (() => { const p = K(B0, { head: .28 }); M.reach(p, 1, [x0 + 12, -44]); M.reach(p, 0, [x0 + 10, -45]); p.hands = [GRIP, GRIP]; return p; })();
    const B0h = K(B0, { arms: [[.1, .42], B0.arms[1]], hands: [GRIP, REL] });
    const pre = M.keys([[0, wind], [T.parent + .04, wind], [T.parent + .3, B0h]], { lag: { arms: .05 } });
    const walk = M.gait({ from: x0, to: 0, t0: WALK0, until: T.wall, gait: 'walk', style: { step: 26 }, arms: [[.1, .42], null], hands: [GRIP, null] });
    const RIB = K(ST, { arms: [[.12, .42], ST.arms[1]], hands: [GRIP, REL] });
    const clasp = (() => { const p = K(ST, { head: .2 }); M.reach(p, 0, [SH[0] + 6, SH[1] + 10]); M.reach(p, 1, [SH[0] + 7, SH[1] + 11]); p.hands = [GRIP, GRIP]; return p; })();
    const bow = K(clasp, { lean: .26, head: .42, bend: .06 }), back = K(ST, { arms: [[.28, .7], [-.65, -.35]], hands: [{ pose: 'pinch', k: 1 }, GRIP], lean: .04, head: .1 });
    const fling = K(ST, { arms: [[.28, .7], [.95, 1.05]], hands: [{ pose: 'pinch', k: 1 }, { pose: 'open', k: .6 }], lean: .1, head: .16 });
    const after = K(ST, { arms: [[.3, .75], [1.15, 1.35]], hands: [{ pose: 'pinch', k: 1 }, OPEN], lean: .06, head: .1 });
    const holdEnd = K(ST, { arms: [[.3, .75], [.12, .3]], hands: [{ pose: 'pinch', k: 1 }, REL], head: .08 });
    const drop = K(ST, { arms: [[.1, .2], [.1, .22]], hands: [OPEN, REL], head: .32 }), sad = K(drop, { hands: [REL, REL] });
    const main = M.keys([
      ...wallKeys(0, .02).map(([t, p]) => [t, K(p, { arms: [RIB.arms[0], p.arms[1]], hands: [GRIP, p.hands[1]] })]),
      [T.s30, K(RIB, { head: .02 })], [T.beg - .12, clasp], [T.beg + .06, bow], [T.beg + .22, bow], [T.beg + .34, K(clasp, { head: .12 })],
      [BOWL - .22, back], [BOWL, fling], [BOWL + .2, after], [BOWL + .65, holdEnd], [T.fast + .35, holdEnd], [T.fast + .5, drop], [T.fast + .9, sad],
    ], { lag: { arms: .04, head: .04 } });
    const turn = M.turn({ x: 0, t0: T.step + .4, from: 0, to: Math.PI * .92, dur: 1.1 });
    const f = seq([[-1, pre], [WALK0, t => approach(walk, t)], [T.wall, main], [T.step + .4, turn]]); f.walk = walk; return f;
  })();
  const TODDLER = (() => {
    const x0 = (176 - XT) / FST, B0 = K(M.stand(x0), { head: -.12 });
    const walk = M.gait({ from: x0, to: 0, t0: T.parent + .38, until: T.wall + .12, gait: 'walk', style: { step: 30, bob: 2.4 } });
    const look = M.keys([[T.wall + .12, M.stand(0)], [T.wall + .6, K(M.stand(0), { head: -.34 })], [T.s27, K(M.stand(0), { head: -.34 })], [T.s27 + .5, K(M.stand(0), { head: .05 })],
      [T.beg - .3, K(M.stand(0), { head: .05 })], [T.beg, K(M.stand(0), { head: -.3 })], [T.fast + .4, K(M.stand(0), { head: -.3 })], [T.fast + .9, K(M.stand(0), { head: 0 })], [T.step + .8, K(M.stand(0), { head: -.4 })]]);
    const idle = M.idle({ seed: 91, base: M.stand(0), t0: T.wall + .2 });
    return seq([[-1, () => B0], [T.parent + .38, walk], [T.wall + .12, t => { const p = idle(t), q = look(t); p.head = q.head; return p; }]]);
  })();
  const LOOKS = { minister: CAST.minister, boss: CAST.boss, mother: CAST.mother, toddler: CAST.toddler };
  function figure(x, i, pose, look, o = {}) {
    x.save(); x.translate(o.x ?? XO, G2(i) - (o.lift || 0)); const s = o.s ?? FS; x.scale(s, s);
    const PJ = M.draw(x, P, pose, { ...look, ...o.draw });
    x.restore(); return PJ;
  }

  const ROWS = [{ y: 290, s: 1.06 }, { y: 305, s: 1.12 }, { y: 320, s: 1.18 }];
  const SQ = PORT ? .78 : 1, CX = x => PORT ? 560 + (x - 800) * SQ : x;
  const PEOPLE = [[0, 820, 0], [0, 870, 1], [0, 1010, 0], [0, 1060, 1], [1, 760, 0], [1, 812, 1], [1, 950, 0], [1, 1002, 1], [2, 860, 0], [2, 912, 1], [2, 1080, 0], [2, 1132, 1]]
    .map(([row, x, left], i) => ({ row, x0: CX(x), yaw0: left ? Math.PI : 0, B: x > 940, i, look: RU.crowd(P, 12)[i].look }));
  const PICKER = PEOPLE[8];
  const SITTERS = new Set([PEOPLE[3], PEOPLE[6], PEOPLE[11]]);
  const MARCH = { step: 30, arms: .48, lean: 0, bend: 0, head: 0, bob: 1.4 };
  const SEAT = 5;
  const PICK = [T.s31 + .24, T.goodwill + .23];
  const TIMES = {
    march: 9.72, stopB: 11.55, reB: 12.3, stopB2: 13.9, stopA: 12.36,
    riseA: T.goodwill + .02, follow: T.goodwill + .15, walkEnd: T.fast + .28, sitAgain: T.fast + .45, stepUp: T.pay + .35, riseUp: T.step + .4, run: T.step + .75,
  };
  const SPOT = [[26, 80, 136, 192], [44, 100, 156, 214], [60, 118, 176, 236]].map(r => r.map(d => FLAG.x + d * (PORT ? .9 : 1)));
  PEOPLE.forEach(c => {
    const s = ROWS[c.row].s, U = w => w / s, plan = [];
    let x = c.x0;
    const walk = (dist, until, style, gait = 'walk') => { plan.push({ do: 'walk', dist: U(dist * SQ), until, gait, style }); x -= dist * SQ; };
    plan.push({ do: 'wait', until: 7.8 + hash(c.i, 71) * .35 });
    if (c.yaw0 === 0) plan.push({ do: 'turn', to: Math.PI, dur: 1.1 }); else plan.push({ do: 'wait', for: 1.1 });
    plan.push({ do: 'wait', until: TIMES.march });
    if (c.B) {
      walk(66, TIMES.stopB, MARCH); plan.push({ do: 'wait', until: TIMES.reB + hash(c.i, 72) * .1 }); walk(32, TIMES.stopB2, MARCH);
      plan.push({ do: 'wait', until: TIMES.follow + hash(c.i, 73) * .2 }); walk(42, TIMES.walkEnd, { step: 26 });
    } else {
      walk(100, TIMES.stopA, MARCH); plan.push({ do: 'sit', seat: SEAT, dur: 1.0 });
      plan.push({ do: 'wait', until: c === PICKER ? PICK[1] : TIMES.riseA + hash(c.i, 73) * .15 }, { do: 'rise', dur: 1.0 });
    }
    if (SITTERS.has(c)) plan.push({ do: 'wait', until: TIMES.sitAgain + hash(c.i, 74) * .15 }, { do: 'sit', seat: SEAT, dur: 1.0 }, { do: 'wait', until: TIMES.riseUp }, { do: 'rise', dur: 1.0 });
    else { plan.push({ do: 'wait', until: TIMES.stepUp + hash(c.i, 75) * .12 }); walk(24, TIMES.stepUp + 1.45 + hash(c.i, 75) * .12, { step: 24 }); plan.push({ do: 'wait', until: TIMES.run + hash(c.i, 76) * .3 }); }
    c.xRun = x; c.plan = plan;
  });
  ROWS.forEach((r, ri) => PEOPLE.filter(c => c.row === ri).sort((a, b) => a.xRun - b.xRun).forEach((c, k) => {
    const d = c.xRun - SPOT[ri][k], s = r.s;
    c.plan.push({ do: 'run', dist: d / s, until: (SITTERS.has(c) ? 26.75 : 26.35) + hash(c.i, 77) * .2, gait: d > 330 ? 'run' : 'jog' }, { do: 'wait', until: DUR + 2 });
    c.perf = M.perform(c.plan, { x: 0, yaw: c.yaw0, seed: 500 + c.i });
    c.arrive = c.perf.parts[c.perf.parts.length - 2].t1;
  }));
  function crowdPose(c, tp) {
    const p = c.perf(tp);
    const chat = (1 - ramp(tp, 7.7, 8.1)) * .07 * Math.sin(TAU * (tp * .9 + hash(c.i, 78))), up = ramp(tp, 8.1 + hash(c.i, 79) * .3, 8.7) * (1 - ramp(tp, TIMES.march - .35, TIMES.march));
    const coin = ramp(tp, T.pay + .05 + hash(c.i, 80) * .2, T.pay + .45) * (1 - ramp(tp, T.let - .2, T.let + .1)), aim = ramp(tp, c.arrive - .25, c.arrive + .1);
    p.head = (p.head || 0) + chat - .26 * up - .36 * coin - .34 * aim;
    if (aim > 0) {
      const ph = TAU * (tp * 1.3 + hash(c.i, 81)), a = [[2.5 + .18 * Math.sin(ph), 2.75 + .15 * Math.sin(ph)], [2.62 - .18 * Math.sin(ph), 2.9 - .12 * Math.sin(ph)]];
      p.arms = M.mixPose(p, K(p, { arms: a }), aim).arms; if (aim > .5) p.hands = [OPEN, OPEN];
      p.hip = [p.hip[0], p.hip[1] + 1.1 * aim * Math.max(0, Math.sin(ph * 2))];
    }
    if (c.B) {
      const k = ramp(tp, TIMES.stopB + .1, TIMES.stopB + .4) * (1 - ramp(tp, TIMES.reB - .1, TIMES.reB + .1)) + ramp(tp, TIMES.stopB2 + .1, TIMES.stopB2 + .4) * (1 - ramp(tp, TIMES.follow - .2, TIMES.follow));
      if (k > 0) p.headYaw = (p.headYaw ?? p.yaw) + .6 * k * Math.sin(TAU * (tp * .45 + hash(c.i, 82)));
    }
    if (c === PICKER && tp > PICK[0] - .3 && tp < DROP_ROLL + .4) {
      const s = ROWS[c.row].s, toL = w => [((w[0] - c.x0) / s - p.root[0]) * Math.cos(p.yaw), (w[1] - ROWS[c.row].y) / s];
      const reach = K(p, { arms: p.arms.slice() }), tgt = toL([X_STOP - 3, RY - RR - 3]); M.reach(reach, 0, tgt);
      const kR = ramp(tp, PICK[0] - .3, PICK[0]), kH = ramp(tp, PICK[1], PICK[1] + .55), kD = ramp(tp, DROP_ROLL - .05, DROP_ROLL + .3);
      const holdArm = [.45, 1.2], a0 = kH > 0 ? M.mixPose(reach, K(p, { arms: [holdArm, p.arms[1]] }), kH).arms[0] : M.mixPose(p, reach, kR).arms[0];
      p.arms = [M.mixPose(K(p, { arms: [a0, p.arms[1]] }), p, kD).arms[0], p.arms[1]];
      if (kR > .6 && kD < .3) p.hands = [GRIP, p.hands[1]]; else if (kD >= .3) p.hands = [OPEN, p.hands[1]];
    }
    return p;
  }
  function crowd(x, tp, rows) {
    PEOPLE.filter(c => rows.includes(c.row)).sort((a, b) => a.row - b.row).forEach(c => {
      const r = ROWS[c.row];
      x.save(); x.translate(c.x0, r.y); x.scale(r.s, r.s); M.draw(x, P, crowdPose(c, tp), { ...c.look, prop: c.prop && ((xx, PJ) => c.prop(xx, PJ, tp)) }); x.restore();
    });
  }

  const norm2 = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const gripOf = (pose, i, off = 5.6) => { const a = M.joints(pose).arms[i], d = norm2([a.wr[0] - a.el[0], a.wr[1] - a.el[1]]); return [a.wr[0] + d[0] * off, a.wr[1] + d[1] * off]; };
  const W_ = (i, s, o = XO, sc = FS) => [o + s[0] * sc, G2(i) + s[1] * sc];
  const LZ = .5, LS = FS * ROOM[2].s(LZ) / ROOM[2].s(FZ);
  const inHand = t => t >= LANT.hook.up && t < LANT.hook.on;
  function lanternAt(tp) {
    if (!inHand(tp)) return { bail: HOOK, s: LS, swing: 0 };
    const g = W_(2, gripOf(LANT(tp), 1)), g0 = W_(2, gripOf(LANT(tp - 1 / 30), 1)), k = ramp(tp, LANT.hook.off, LANT.hook.off + .3) * (1 - ramp(tp, LANT.hook.on - .25, LANT.hook.on));
    return { bail: g, s: lerp(LS, FS, k), swing: FARM.hang(g0, g, .02) };
  }
  function lantern(x, tp) {
    const L0 = lanternAt(tp), top = ROOM[2].at(0, ROOM[2].ceil, LZ)[1];
    x.fillStyle = mix(P.ink, P.wood, .3); x.fillRect(HOOK[0] - .8, top, 1.6, HOOK[1] - top + 1);
    x.fillRect(HOOK[0] - 3, HOOK[1] - 1, 6, 2);
    x.save(); x.translate(L0.bail[0], L0.bail[1]); x.rotate(L0.swing); FARM.lantern(x, P, L0.s, 1); x.restore();
  }
  const glassAt = tp => { const L0 = lanternAt(tp); return [L0.bail[0] - Math.sin(L0.swing) * FARM.GLASS[1] * L0.s, L0.bail[1] + Math.cos(L0.swing) * FARM.GLASS[1] * L0.s]; };
  const groupX = (B, tp) => { const g = PEOPLE.filter(c => c.B === B); return g.reduce((s, c) => s + c.x0 + c.perf.at(tp).x * ROWS[c.row].s, 0) / g.length; };
  const BEAM = { on: [T.s29 + 1.05, T.s29 + 1.3], off: [T.s30 + .05, T.s30 + .35], swing: [12.05, 12.5], a: groupX(false, T.s29 + 1.2) - 12, b: groupX(true, 12.5) };
  const beamOn = t => ramp(t, BEAM.on[0], BEAM.on[1]) * (1 - ramp(t, BEAM.off[0], BEAM.off[1]));
  function beam(ctx, c, t) {
    const k = beamOn(t); if (k <= 0) return;
    const tp = M.pose(t), g = glassAt(tp), bx = lerp(BEAM.a, BEAM.b, easeIO(clamp((t - BEAM.swing[0]) / (BEAM.swing[1] - BEAM.swing[0])))), by = 306, bw = 118 * (PORT ? .85 : 1), bh = 16;
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); ctx.globalCompositeOperation = 'screen';
    const gr = ctx.createLinearGradient(g[0], g[1], bx, by); gr.addColorStop(0, `rgba(255,214,150,${.42 * k})`); gr.addColorStop(1, `rgba(255,214,150,${.14 * k})`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g[0] - 3, g[1]); ctx.lineTo(g[0] + 3, g[1]); ctx.lineTo(bx + bw, by); ctx.ellipse(bx, by, bw, bh, 0, 0, Math.PI); ctx.lineTo(bx - bw, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,220,160,${.22 * k})`; ctx.beginPath(); ctx.ellipse(bx, by, bw, bh, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  const RR = 5.5, RY = 326;
  const pickerAt = tp => { const p = PICKER.perf(tp), s = ROWS[PICKER.row].s, c = Math.cos(p.yaw); return { p, s, c, feet: PICKER.x0 + (p.root[0] + p.feet[0].at[0] * c) * s }; };
  const X_STOP = pickerAt(PICK[0]).feet - 16, X_LAND = X_STOP - 22, LAND = BOWL + .5, STOP = PICK[0] - .02;
  const DROP_ROLL = T.fast + .3, DROP_END = T.fast + .45;
  function motherGrip(tp, i) { return W_(0, gripOf(MOTHER(tp), i)); }
  function pickerGrip(tp) {
    const q = pickerAt(tp), gp = gripOf(crowdPose(PICKER, tp), 0);
    return [PICKER.x0 + (q.p.root[0] + gp[0] * q.c) * q.s, ROWS[PICKER.row].y + gp[1] * q.s];
  }
  const RELEASE = motherGrip(BOWL, 1);
  const flight = u => [lerp(RELEASE[0], X_LAND, u), lerp(RELEASE[1], RY - RR, u) - 180 * u * (1 - u)];
  function rollAt(tp) {
    if (tp < T.parent + .1) { const a = motherGrip(tp, 0), b = motherGrip(tp, 1); return { at: [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2], spin: tp * 3, where: 'near' }; }
    if (tp < T.beg - .12) return { at: motherGrip(tp, 0), spin: 0, where: 'far' };
    if (tp < T.beg + .34) { const a = motherGrip(tp, 0), b = motherGrip(tp, 1); return { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], spin: 0, where: 'near' }; }
    if (tp < BOWL) return { at: motherGrip(tp, 1), spin: 0, where: 'near' };
    if (tp < LAND) { const u = (tp - BOWL) / (LAND - BOWL); return { at: flight(u), spin: u * 7, where: 'air' }; }
    if (tp < PICK[1]) { const u = clamp((tp - LAND) / (STOP - LAND)), e = 1 - (1 - u) * (1 - u), x = lerp(X_LAND, X_STOP, e); return { at: [x, RY - RR], spin: 7 + (x - X_LAND) / RR, where: 'ground' }; }
    if (tp < DROP_ROLL) return { at: pickerGrip(tp), spin: 0, where: 'picker' };
    const g = pickerGrip(DROP_ROLL), u = clamp((tp - DROP_ROLL) / .22);
    return { at: [g[0] - 4 * u, lerp(g[1], RY - RR, u * u)], spin: 0, where: 'dropped' };
  }
  const RIB = '#dd7f8c';
  function roll(x, at, spin) {
    x.save(); x.translate(at[0], at[1]); x.rotate(-spin);
    x.fillStyle = RIB; x.beginPath(); x.arc(0, 0, RR, 0, TAU); x.fill();
    x.strokeStyle = mix(RIB, P.ink, .3); x.lineWidth = .9; x.beginPath(); x.arc(0, 0, RR * .62, 0, TAU); x.stroke();
    x.fillStyle = mix(P.wood, P.cream, .4); x.beginPath(); x.arc(0, 0, RR * .3, 0, TAU); x.fill();
    x.fillStyle = mix(RIB, P.ink, .45); x.fillRect(-.6, -RR, 1.2, RR * .7);
    x.restore();
  }
  function ribbonPts(tp) {
    const drop = ramp(tp, DROP_END, DROP_END + .3), h = motherGrip(Math.min(tp, DROP_END), 0), a = [lerp(h[0], h[0] + 6, drop), lerp(h[1], RY - 1, drop * drop)];
    const settle = ramp(tp, LAND - .05, LAND + .35), uEnd = clamp((tp - BOWL) / (LAND - BOWL)), pts = [a];
    for (let k = 0; k <= 24; k++) { const q = flight(uEnd * k / 24); pts.push([q[0], lerp(q[1], RY - 1, settle)]); }
    if (tp >= LAND) {
      const r = rollAt(tp);
      if (r.where === 'picker' || r.where === 'dropped') { pts.push([Math.min(r.at[0] - 8, X_STOP), RY - 1]); pts.push(r.at); }
      else pts.push([r.at[0], RY - 1]);
    }
    return pts;
  }
  const MID = (RELEASE[0] + X_STOP) / 2;
  function ribbon(x, tp) {
    if (tp < BOWL) return;
    const pts = ribbonPts(tp), thin = ramp(tp, T.thin - .3, T.fast - .02), broken = tp >= T.fast;
    const span = Math.max(50, (X_STOP - RELEASE[0]) / 4), wAt = p => lerp(6.5, lerp(1.1, 6.5, smooth(Math.abs(p[0] - MID) / span)), thin);
    const gap = broken ? 5 + 7 * smooth((tp - T.fast) / .15) : 0;
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = RIB;
    for (let k = 1; k < pts.length; k++) {
      const p0 = pts[k - 1], p1 = pts[k];
      if (broken && Math.max(p0[0], p1[0]) > MID - gap && Math.min(p0[0], p1[0]) < MID + gap) {
        const cut = (q, e) => { const u = clamp((e - p0[0]) / ((p1[0] - p0[0]) || 1e-6)); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)]; };
        const L = p0[0] < p1[0] ? [p0, p1] : [p1, p0];
        if (L[0][0] < MID - gap) { const e = cut(null, MID - gap); x.lineWidth = wAt(L[0]); x.beginPath(); x.moveTo(L[0][0], L[0][1]); x.lineTo(e[0], e[1]); x.stroke(); }
        if (L[1][0] > MID + gap) { const e = cut(null, MID + gap); x.lineWidth = wAt(L[1]); x.beginPath(); x.moveTo(e[0], e[1]); x.lineTo(L[1][0], L[1][1]); x.stroke(); }
        continue;
      }
      x.lineWidth = wAt(p0); x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke();
    }
    x.strokeStyle = mix(RIB, P.cream, .25); x.lineWidth = .8;
    if (thin > .15) for (let k = 0; k < 8; k++) {
      if (broken) { const sd = k % 2 ? 1 : -1, ex = MID + sd * gap; x.beginPath(); x.moveTo(ex, RY - 1); x.lineTo(ex + sd * (2 + 4 * hash(k, 93)), RY - 1 + (hash(k, 94) - .5) * 5); x.stroke(); }
      else { const px = MID + (hash(k, 91) - .5) * span * 1.2, off = (hash(k, 92) - .5) * 7 * thin; x.beginPath(); x.moveTo(px - 6, RY - 1 + off * .3); x.quadraticCurveTo(px, RY - 1 + off, px + 6, RY - 1 + off * .2); x.stroke(); }
    }
    x.restore();
  }

  const CR = 9, SL = 20;
  const COIN_OUT = T.cleverest + .44;
  const spinAt = t => 1.7 * t + (t > T.pay ? 26 * (1 - Math.exp(-(t - T.pay) * 1.4)) / 1.4 : 0);
  function coinAt(tp) {
    if (tp < BOSS.KNOT[0]) {
      const pose = BOSS(tp), g = W_(1, gripOf(pose, 1, 6.2)), pocket = W_(1, [pose.hip[0] + 7, pose.hip[1] + 3]);
      const g0 = W_(1, gripOf(BOSS(tp - 1 / 30), 1, 6.2)), sw = clamp(-(g[0] - g0[0]) * .03, -.4, .4);
      const at = [g[0] - Math.sin(sw) * (SL + CR), Math.min(g[1] + Math.cos(sw) * (SL + CR), pocket[1])];
      return { top: g, at, swing: sw };
    }
    const u = tp - BOSS.KNOT[1], sw = tp < BOSS.KNOT[1] ? .06 * Math.sin(TAU * 2 * (tp - BOSS.KNOT[0]) / (BOSS.KNOT[1] - BOSS.KNOT[0])) : .2 * Math.exp(-u * .9) * Math.sin(u * 4.2);
    const L2 = SL - 5;
    return { top: TIE, at: [TIE[0] - Math.sin(sw) * (L2 + CR), TIE[1] + Math.cos(sw) * (L2 + CR)], swing: sw };
  }
  function coinString(x, tp) {
    const c = coinAt(tp);
    x.save(); x.strokeStyle = mix(P.ink, P.cream, .25); x.lineWidth = 1; x.beginPath(); x.moveTo(c.top[0], c.top[1]); x.lineTo(c.at[0] + Math.sin(c.swing) * CR, c.at[1] - Math.cos(c.swing) * CR); x.stroke();
    if (tp >= BOSS.KNOT[0]) { x.fillStyle = mix(P.ink, P.cream, .3); x.fillRect(TIE[0] - 4, TIE[1] - 2, 8, 3.5); }
    x.restore();
  }
  function coin(x, tp) {
    if (tp < COIN_OUT) return;
    const c = coinAt(tp), ph = spinAt(tp), sx = Math.cos(ph);
    coinString(x, tp);
    x.save(); x.translate(c.at[0], c.at[1]); x.rotate(c.swing); x.scale(Math.max(.1, Math.abs(sx)), 1);
    PR.coin(x, P, 'paper', 0, 0, CR, 0);
    x.restore();
  }

  const inWorld = (xx, o, s, root, fn) => { xx.save(); xx.translate(-(root ? root[0] : 0), 0); xx.scale(1 / s, 1 / s); xx.translate(-o[0], -o[1]); fn(xx); xx.restore(); };
  function people(x, t, tp) {
    if (!inHand(tp)) lantern(x, tp); else { const top = ROOM[2].at(0, ROOM[2].ceil, LZ)[1]; x.fillStyle = mix(P.ink, P.wood, .3); x.fillRect(HOOK[0] - .8, top, 1.6, HOOK[1] - top + 1); x.fillRect(HOOK[0] - 3, HOOK[1] - 1, 6, 2); }
    const mo = [XO, G2(2)];
    figure(x, 2, LANT(tp), LOOKS.minister, { draw: { prop: inHand(tp) ? (xx => inWorld(xx, mo, FS, null, w => lantern(w, tp))) : undefined } });
    figure(x, 1, BOSS(tp), LOOKS.boss);
    figure(x, 0, TODDLER(tp), LOOKS.toddler, { x: XT, s: FST, lift: 2 });
    const r = rollAt(tp), oo = [XO, G2(0)], draw = xx => inWorld(xx, oo, FS, null, w => roll(w, r.at, r.spin));
    figure(x, 0, MOTHER(tp), LOOKS.mother, { draw: r.where === 'far' ? { behind: draw } : r.where === 'near' ? { prop: draw } : {} });
  }
  PICKER.prop = (xx, PJ, tp) => { const r = rollAt(tp); if (r.where !== 'picker') return; const p = PICKER.perf(tp); inWorld(xx, [PICKER.x0, ROWS[PICKER.row].y], ROWS[PICKER.row].s, p.root, w => roll(w, r.at, r.spin)); };

  const K16 = [
    [0, [-240, 20, 1.66]], [T.wall + .2, [-238, 20, 1.72]], [T.s26 + .05, [-238, 20, 1.72]],
    [T.s26 + 1.95, [520, 80, 1.2]], [T.s28 - .1, [505, 76, 1.21]], [T.s28 + 1.3, [480, 40, 1.25]],
    [T.s30 - .05, [490, 44, 1.25]], [T.s30 + 1.15, [560, 96, 1.24]], [T.goodwill, [560, 96, 1.24]], [T.fast - .15, [540, 170, 1.55]], [T.s32 + .1, [538, 166, 1.57]],
    [T.s32 + 1.45, [520, 110, 1.95]], [T.step + .5, [522, 108, 2.0]], [T.step + 2.6, [450, 96, 1.36]], [DUR, [446, 96, 1.4]],
  ];
  const K45 = [
    [0, [70, 18, 2.1]], [T.wall + .2, [72, 18, 2.18]], [T.s26 + .05, [72, 18, 2.18]],
    [T.s26 + 1.95, [560, 130, 1.5]], [T.s28 - .1, [555, 125, 1.51]], [T.s28 + 1.3, [540, 70, 1.54]],
    [T.s30 - .05, [542, 74, 1.54]], [T.s30 + 1.15, [565, 150, 1.5]], [T.goodwill, [565, 150, 1.5]], [T.fast - .15, [540, 190, 1.75]], [T.s32 + .1, [536, 186, 1.77]],
    [T.s32 + 1.45, [470, 80, 2.1]], [T.step + .5, [472, 78, 2.14]], [T.step + 2.6, [470, 60, 1.45]], [DUR, [466, 60, 1.5]],
  ];
  const KEYS = PORT ? K45 : K16;
  function cam(t) {
    const xy = F.keyed(t, KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, KEYS.map(([k, v]) => [k, v[2]]), true);
    return { x: xy[0], y: xy[1], z };
  }

  function world(x, t) {
    const tp = M.pose(t), st = { light: light(t), drop: drop(t) };
    field(x);
    crowd(x, tp, [0]);
    flagpole(x, t);
    if (tp >= BOSS.KNOT[0]) coin(x, tp);
    RU.house(x, P, HO, st, 'back');
    people(x, t, tp);
    RU.house(x, P, HO, st, 'front');
    crowd(x, tp, [1]);
    ribbon(x, tp);
    { const r = rollAt(tp); if (r.where === 'air' || r.where === 'ground' || r.where === 'dropped') roll(x, r.at, r.spin); }
    crowd(x, tp, [2]);
    if (tp < BOSS.KNOT[0]) coin(x, tp);
  }
  function glows(ctx, c, t) {
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]);
    const l = light(t);
    for (let i = 0; i < 3; i++) if (l[i] > .01) { const p = RU.lampAt(HO, i); PR.glow(ctx, p[0], p[1] + 10, 260, '#ffd9a0', .28 * l[i], 'paper'); PR.glow(ctx, p[0], p[1] + 8, 40, '#fff2cf', .55 * l[i], 'paper'); }
    const g = glassAt(M.pose(t)); PR.glow(ctx, g[0], g[1], 70, '#ffd9a0', .35, 'paper'); PR.glow(ctx, g[0], g[1], 14, '#fff2cf', .7, 'paper');
    if (t >= T.let - .5) { const c = coinAt(M.pose(t)); PR.glow(ctx, c.at[0], c.at[1], 30, '#e8d27a', .25 * ramp(t, T.let - .5, T.let + .5), 'paper'); }
    ctx.restore();
  }
  function draw(ctx, t) {
    const c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, .12, [0, 0], x => sky(x), { rim: false, shadow: false });
    L.sheet(ctx, c, .5, [0, 0], x => hills(x), { rimAlpha: .25 });
    L.sheet(ctx, c, 1, [0, 0], x => world(x, t));
    glows(ctx, c, t);
    beam(ctx, c, t);
    L.grade(ctx, t);
  }

  const falls = (f, g, pan = 0) => (f.falls || []).map(fl => ({ t: fl.t, type: 'footstep', g, pan }));
  const crowdSteps = (who, kinds, g) => who.flatMap(c => c.perf.parts.filter(p => kinds.includes(p.do)).flatMap(p => falls(p.fn, g, .3)));

  F.scene('seq-08', { W, H, duration: DUR, draw, grain: 'none',
    label: C.label,
    api: { DUR, cam, draw, HO, FLAG, world, glows, beam, coinAt, TIE, geo: { FS, XO, XT, FST, G2, ROWS, PEOPLE }, poses: { minister: LANT, boss: BOSS, mother: MOTHER, toddler: TODDLER, ...Object.fromEntries(PEOPLE.map(c => ['c' + c.i, tp => crowdPose(c, tp)])) } } });
})();
