(function () {
  'use strict';
  const F = FILM, PR = F.props, CITY = F.city, HAND = F.hand, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, TAU, keyed } = F, mix = CITY.mix;
  const C = F.cues('seq-03'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;

  const T = { beautifully: 1.171, s10: C.s('S010').t0, pour: 2.811, s11: C.s('S011').t0, paid: 4.515 };
  const TIPS = [T.s10 + .04, T.s10 + .44, T.s10 + .84];
  const DROPS = [T.paid - .27, T.paid - .18, T.paid - .09];

  const FL = 300, DESK = { x0: -60, x1: 640, top: 70 }, TRAY = { x: 90, y: 250, w: 300 };
  const SK = mix(P.skin, P.wood, .45), CREAM = mix(P.cream, P.sheet, .25);
  function room(x, P, t) {
    x.fillStyle = mix(P.wall, P.sheet, .25); x.fillRect(-1600, -900, 3200, 1900);
    x.fillStyle = mix(P.wall, P.ink, .08); x.fillRect(-1600, 120, 3200, 14);
    x.fillStyle = mix(P.wall, P.ink, .2); x.fillRect(-1600, FL, 3200, 700);
    x.fillStyle = mix(P.wall, P.ink, .14); x.beginPath(); CITY.archPath(x, -640, FL, 330, 470); x.fill();
    x.fillStyle = mix(P.rim, P.cream, .3); x.beginPath(); CITY.archPath(x, -640, FL, 290, 440); x.fill();
    x.fillStyle = mix(P.wall, P.rim, .35); x.fillRect(-785, FL - 110, 290, 110);
    x.fillStyle = mix(P.rim, P.cream, .2); x.fillRect(240, -250, 200, 150);
    x.fillStyle = mix(P.wood, P.ink, .1); for (let k = 0; k < 5; k++) x.fillRect(248 + k * 44, -250, 8, 150);
    x.fillStyle = P.wood; x.fillRect(-330, -200, 220, 150); x.fillStyle = P.card; x.fillRect(-316, -188, 90, 60); x.fillRect(-210, -170, 80, 100);
  }
  function punkah(x, P, t) {
    const a = Math.sin(t * 2.4) * .16;
    x.strokeStyle = mix(P.cream, P.ink, .4); x.lineWidth = 3;
    for (const px of [-40, 520]) { x.beginPath(); x.moveTo(px, -900); x.lineTo(px, -330); x.stroke(); }
    x.save(); x.translate(240, -330); x.rotate(a);
    x.fillStyle = P.wood; x.fillRect(-300, -10, 600, 18);
    x.fillStyle = mix(P.cream, P.sheet, .5); x.fillRect(-296, 8, 592, 90);
    x.fillStyle = mix(P.cream, P.ink, .15); for (let k = 0; k < 30; k++) x.fillRect(-296 + k * 20, 98, 10, 16);
    x.restore();
  }
  const M = F.motion, QS = 2.45;
  const POUR = [T.s10 + .05, T.s10 + .36, T.s10 + 1.45, T.s10 + 1.75];
  const tipAt = tp => smooth((tp - POUR[0]) / (POUR[1] - POUR[0])) * (1 - smooth((tp - POUR[2]) / (POUR[3] - POUR[2])));
  const FRONT = TRAY.x - TRAY.w / 2 - 83;
  const QUEUE = [
    [FRONT, 'coat2', 'turban'], [FRONT - 160, 'cream', 'cap'], [FRONT - 320, 'green', 'turban'], [FRONT - 480, 'cream', 'turban'], [FRONT - 640, 'sleeve', 'cap'],
  ];
  const coatOf = (P, c) => ({ coat2: mix(P.coat2, P.cream, .3), cream: CREAM, green: mix('#4d6b58', P.cream, .2), sleeve: mix(P.sleeve, P.cream, .25) })[c];
  const WALK = [.15, 1.45], LIDT = [1.45, 1.56, 1.86, 2.1];
  const HOLD = [[.6, 1.35], [.38, 1.08]], GRIP = [{ pose: 'grip' }, { pose: 'grip' }];
  const qWalk = M.gait({ from: 0, to: 160 / QS, t0: WALK[0], until: WALK[1], gait: 'walk', style: { step: 33 }, arms: HOLD, hands: GRIP });
  const qStill = QUEUE.map((q, i) => M.idle({ seed: 40 + i, base: qWalk(WALK[1]), t0: WALK[1] }));
  const qPose = (i, tp) => tp < WALK[1] ? qWalk(tp) : qStill[i](tp);
  const BASE = [3, 21];
  const rotV = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const lerpV = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const seg = (tp, a, b) => smooth(clamp((tp - a) / (b - a)));
  function frontPose(tp) {
    const p = { ...qPose(0, tp) }, k = tipAt(tp), rot = k * 2.05;
    const kb = tp < LIDT[1] ? 0 : tp < LIDT[2] ? seg(tp, LIDT[1], LIDT[2]) : 1 - seg(tp, LIDT[2], LIDT[3]);
    p.hip = [p.hip[0] - 3 * kb + 7 * k, p.hip[1] + 12 * kb]; p.lean = (p.lean || 0) + 1.25 * kb + .12 * k;
    p.arms = [[lerp(lerp(HOLD[0][0], .1, kb), 1.55, k), lerp(lerp(HOLD[0][1], 1.7, kb), 1.9, k)], p.arms[1]];
    const wf = M.joints(p).arms[0].wr, at = v => [wf[0] + v[0], wf[1] + v[1]];
    const rim = at(rotV([2 + 4 * k, 3 + 9 * k], rot)), knob = at([BASE[0], BASE[1] - 29]), floor = [p.hip[0] + 23, -7.5];
    const target = tp < LIDT[0] || tp >= LIDT[3] ? rim : tp < LIDT[1] ? lerpV(rim, knob, seg(tp, LIDT[0], LIDT[1])) : tp < LIDT[2] ? lerpV(knob, floor, seg(tp, LIDT[1], LIDT[2])) : lerpV(floor, rim, seg(tp, LIDT[2], LIDT[3]));
    M.reach(p, 1, target);
    p.hands = GRIP; p.wf = wf; p.rot = rot;
    return p;
  }
  function frontBasket(tp) {
    const p = frontPose(tp), b = rotV(BASE, p.rot);
    return { x: FRONT - 160 + (p.wf[0] + b[0]) * QS, y: FL + 6 + (p.wf[1] + b[1]) * QS, rot: p.rot, s: QS * .42 };
  }
  const LID_FLOOR = [FRONT + 49, FL + 5];
  function lidAt(tp, p) {
    if (tp < LIDT[1]) return null;
    if (tp >= LIDT[2]) return { x: LID_FLOOR[0], y: LID_FLOOR[1], rot: 0 };
    const w = M.joints(p).arms[1].wr; return { x: FRONT - 160 + (w[0] + 2) * QS, y: FL + 6 + (w[1] + 7) * QS, rot: 0 };
  }
  function lid(x, P, l, s) {
    const reed = mix(P.wood, P.cream, .35), dark = mix(reed, P.ink, .25);
    x.save(); x.translate(l.x, l.y); x.rotate(l.rot); x.scale(s, s);
    x.fillStyle = reed; x.beginPath(); x.ellipse(0, -2, 43, 9, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(0, -8, 30, 10, 0, Math.PI, 0); x.fill(); x.fillStyle = dark; x.beginPath(); x.arc(0, -17, 4, 0, TAU); x.fill();
    x.restore();
  }
  function queue(x, P, t) {
    const tp = L.pose(t);
    let frontP = null;
    QUEUE.slice().reverse().forEach(([qx, coat, head], ri) => {
      const i = QUEUE.length - 1 - ri, front = i === 0;
      const p = front ? frontPose(tp) : qPose(i, tp);
      if (front) frontP = p;
      const o = { coat: coatOf(P, coat), trouser: CREAM, skin: SK, head, headColor: head === 'cap' ? mix(P.ink, P.coat, .3) : mix(P.amberDark, P.cream, .35 + i * .06) };
      o.prop = (xx, PJ) => { const w = PJ.arms[0].wr; xx.save(); xx.translate(w[0], w[1]); xx.rotate(front ? p.rot : 0); PR.basket(xx, P, BASE[0], BASE[1], .42, front && tp >= LIDT[1] ? -1 : 1); xx.restore(); if (front) snakes(xx, w, p.rot, tp); };
      x.save(); x.translate(qx - 160, FL + 6); x.scale(QS, QS); M.draw(x, P, p, o); x.restore();
    });
    const l = lidAt(tp, frontP); if (l) lid(x, P, l, QS * .42);
  }
  const N_COBRA = 5, SNAKE_R = 3.5, SNAKE_N = 19, TRAY_TOP = TRAY.y - 24;
  const SIM_T0 = POUR[0] - .08, SIM_T1 = POUR[3] + .8;
  function basketWorld(t) {
    const b = frontBasket(Math.max(t, SIM_T0)), c = Math.cos(b.rot), sn = Math.sin(b.rot);
    return { b, W: q => [b.x + (q[0] * c - q[1] * sn) * b.s, b.y + (q[0] * sn + q[1] * c) * b.s],
      inv: q => { const dx = (q[0] - b.x) / b.s, dy = (q[1] - b.y) / b.s; return [dx * c + dy * sn, -dx * sn + dy * c]; } };
  }
  const WALLS = [[[-30, 0], [-40, -52]], [[30, 0], [40, -52]], [[-30, 0], [30, 0]]];
  function world(t) {
    const now = basketWorld(t), next = basketWorld(t + 1 / 240), hold = now.b.rot < .7, move = q => next.W(now.inv(q));
    const x0 = TRAY.x - TRAY.w / 2;
    return { capsules: [...WALLS.map(([a, b]) => ({ a: now.W(a), b: now.W(b), r: 2 * now.b.s, move, hold, fr: .12 })),
        { a: [x0 - 1, TRAY_TOP - 12], b: [x0 - 1, TRAY_TOP + 2], r: 2, fr: .3 }],
      planes: [{ y: TRAY_TOP, x0: x0 - 3, x1: TRAY.x + TRAY.w / 2, fr: .5 }, { y: FL, fr: .5 }] };
  }
  const PILE = (() => { const bw = basketWorld(SIM_T0); return Array.from({ length: N_COBRA }, (_, i) => {
    const y = -(SNAKE_R + 1.2 + i * (2 * SNAKE_R + 3.2)), half = 26 - i * .6, dir = i % 2 ? -1 : 1, pts = [];
    for (let k = 0; k < SNAKE_N; k++) { const u = k / (SNAKE_N - 1), a = Math.PI * 3 * u; pts.push(bw.W([dir * half * Math.cos(a), y + Math.sin(a)])); }
    return { pts, r: SNAKE_R };
  }); })();
  const SIM = F.rope.run({ ropes: PILE, t0: SIM_T0, t1: SIM_T1, rate: 30, world, self: false, bend: .6 });
  const OUT = [], LAND = [], REST = [];
  SIM.frames.forEach((fr, k) => {
    const bw = basketWorld(fr.t), prev = k ? SIM.frames[k - 1].ropes : fr.ropes; let rest = 0;
    fr.ropes.forEach((pts, i) => {
      if (OUT[i] == null && pts.some(q => bw.inv(q)[1] < -54)) OUT[i] = fr.t;
      if (LAND[i] == null && pts.some(q => q[1] >= TRAY_TOP - SNAKE_R - 1)) LAND[i] = fr.t;
      const still = pts.every((q, j) => Math.hypot(q[0] - prev[i][j][0], q[1] - prev[i][j][1]) < .35), down = pts.every(q => q[1] > TRAY_TOP - 26);
      if (LAND[i] != null && still && down) rest++;
    });
    REST[k] = rest;
  });
  function heap(x, P, t) {
    x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(TRAY.x - TRAY.w / 2 - 16, TRAY.y, TRAY.w + 32, 50);
    x.fillStyle = mix(P.wood, P.cream, .2); x.fillRect(TRAY.x - TRAY.w / 2, TRAY.y - 24, TRAY.w, 26);
  }
  function snakes(xx, w, rot, tp) {
    if (tp < SIM_T0) return;
    xx.save(); xx.translate(w[0], w[1]); xx.rotate(rot); xx.translate(BASE[0], BASE[1]); xx.scale(.42, .42);
    xx.beginPath(); xx.rect(-5000, -5000, 10000, 10000); xx.moveTo(-49, -62); xx.lineTo(-37, 7); xx.lineTo(37, 7); xx.lineTo(49, -62); xx.closePath(); xx.clip('evenodd');
    xx.scale(1 / .42, 1 / .42); xx.translate(-BASE[0], -BASE[1]); xx.rotate(-rot); xx.translate(-w[0], -w[1]); xx.scale(1 / QS, 1 / QS); xx.translate(-(FRONT - 160), -(FL + 6));
    SIM.at(tp).forEach((pts, i) => PR.cobraBody(xx, P, F.rope.smooth(pts, 40), { w: 9, belly: i % 2 ? 1 : -1, eye: 0 }));
    xx.restore();
  }
  function clerk(x, P, t) {
    const tp = L.pose(t), nod = Math.sin(clamp((tp - T.beautifully) / .45) * Math.PI) * .5;
    const p = M.idle({ seed: 9, base: { ...M.stand(0), yaw: Math.PI / 2, arms: [[.3, .55, .22], [.3, .55, .22]], hands: [{ pose: 'relaxed', k: .3 }, { pose: 'relaxed', k: .3 }] } })(tp);
    x.save(); x.translate(360, DESK.top + 40 * 2.5 + nod * 3); x.scale(2.5, 2.5);
    M.draw(x, P, p, { coat: CREAM, trouser: CREAM, skin: SK, head: 'cap', headColor: mix(P.ink, P.coat, .3), shadow: 0 });
    x.restore();
  }
  function desk(x, P, t, o = {}) {
    x.fillStyle = mix(P.wood, P.cream, .12); x.fillRect(DESK.x0 - 16, DESK.top - 14, DESK.x1 - DESK.x0 + 32, 18);
    x.fillStyle = P.wood; x.fillRect(DESK.x0, DESK.top + 4, DESK.x1 - DESK.x0, FL - DESK.top - 4);
    x.fillStyle = P.woodDark; for (let k = 0; k < 3; k++) x.fillRect(DESK.x0 + 20 + k * 230, DESK.top + 30, 200, 190);
    x.fillStyle = mix(P.wood, P.cream, .1); for (let k = 0; k < 3; k++) x.fillRect(DESK.x0 + 32 + k * 230, DESK.top + 42, 176, 166);
    x.fillStyle = P.card; x.beginPath(); x.moveTo(160, DESK.top - 14); x.lineTo(300, DESK.top - 14); x.lineTo(310, DESK.top - 30); x.lineTo(150, DESK.top - 30); x.fill();
    x.strokeStyle = mix(P.card, P.ink, .4); x.lineWidth = 1.5; x.beginPath(); x.moveTo(230, DESK.top - 30); x.lineTo(230, DESK.top - 14); x.stroke();
    const brass = mix(P.amberDark, P.wood, .35);
    x.fillStyle = brass; x.fillRect(20, DESK.top - 90, 8, 76); x.fillRect(-40, DESK.top - 92, 128, 6);
    for (const px of [-36, 84]) { x.strokeStyle = brass; x.lineWidth = 2; x.beginPath(); x.moveTo(px, DESK.top - 88); x.lineTo(px - 18, DESK.top - 44); x.moveTo(px, DESK.top - 88); x.lineTo(px + 18, DESK.top - 44); x.stroke(); x.fillStyle = brass; x.beginPath(); x.ellipse(px, DESK.top - 42, 26, 6, 0, 0, TAU); x.fill(); }
    x.fillStyle = mix(brass, P.ink, .25); x.fillRect(-4, DESK.top - 18, 56, 6);
    PR.tally(x, P, 'paper', 520, DESK.top - 44, .62, o.tally ?? 0);
  }
  const tallyAt = t => 36 + (L.pose(t) < SIM_T0 ? 0 : REST[SIM.index(L.pose(t))]);

  const CU = { wrist: [-330, 190], hs: 5.2 };
  function closeup(x, P, t) {
    const tp = L.pose(t);
    x.fillStyle = mix(P.wall, P.sheet, .15); x.fillRect(-1600, -900, 3200, 1800);
    x.fillStyle = mix(P.wood, P.cream, .12); x.fillRect(-1600, 330, 3200, 30);
    x.fillStyle = P.wood; x.fillRect(-1600, 360, 3200, 700);
    PR.glow(x, -300, -200, 700, P.glow, .25, 'paper');
    const n = DROPS.filter(d => tp > d + .12).length, close = smooth((tp - T.paid + .04) / .22);
    const hold = [-30, -12], palm = [CU.wrist[0] - CU.hs * hold[0], CU.wrist[1] + CU.hs * hold[1]], R = 40;
    const o = { pose: 'cup', k: close, skin: SK, sleeve: CREAM, cuff: null, arm: 170 };
    const hand = layer => { x.save(); x.translate(CU.wrist[0], CU.wrist[1]); x.scale(-CU.hs, CU.hs); F.people.hand(x, P, { ...o, layer }); x.restore(); };
    hand('back');
    for (let i = 0; i < n; i++) PR.coin(x, P, 'paper', palm[0] + (i % 2 ? 6 : -4), palm[1] + 2 - i * R * .16, R, .55);
    DROPS.forEach((d, i) => {
      const k = (tp - d) / .12; if (k < 0 || k >= 1) return;
      PR.coin(x, P, 'paper', palm[0] + (1 - k) * 24, lerp(-760, palm[1] + 2 - i * R * .16, easeIO(k)), R, lerp(.2, .55, k));
    });
    hand('front');
  }

  const Z = PORT ? 1.15 : 1.45;
  function cam(t) {
    const d = smooth(t / T.s11), p = easeIO(clamp((t - T.s11) / .45));
    return { x: lerp(PORT ? 40 : -20, 20, d) + lerp(0, 60, p), y: lerp(PORT ? -20 : -40, -20, d) + lerp(0, 150, p), z: Z * lerp(1, 1.06, d) * Math.pow(2.2, p) };
  }
  function cucam(t) { const k = smooth((t - T.s11 - .15) / .55); return { x: CU.wrist[0] + CU.hs * 34 - (PORT ? 0 : 20), y: CU.wrist[1] - 60, z: (PORT ? 1.1 : 1.35) * lerp(.85, 1, k) }; }
  const DISSOLVE = [T.s11 + .22, T.s11 + .5];

  function draw(ctx, t) {
    const dz = smooth((t - DISSOLVE[0]) / (DISSOLVE[1] - DISSOLVE[0]));
    L.background(ctx);
    if (dz < 1) {
      const c = cam(t);
      L.sheet(ctx, c, 1, [0, 0], x => { room(x, P, t); clerk(x, P, t); desk(x, P, t, { tally: tallyAt(t) }); heap(x, P, t); queue(x, P, t); });
      L.sheet(ctx, c, 1.12, [0, 0], x => punkah(x, P, t), { shadowAlpha: .6 });
    }
    if (dz > 0) L.sheet(ctx, cucam(t), 1, [0, 0], x => closeup(x, P, t), { alpha: dz, shadowAlpha: dz });
    L.grade(ctx, t);
  }

  F.scene('seq-03', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { room, desk, clerk, punkah, heap, queue, FL, DESK, TRAY, cam } });
})();
