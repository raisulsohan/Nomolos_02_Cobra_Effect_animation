(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-14'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, CAST = HN.cast(P);
  const T = { notices: 1.41, streets: 3.657, rats: C.s('S076').t0, alive: C.s('S077').t0,
    scurry: C.s('S078').t0, health: 8.912, with: C.s('S079').t0, tails: 10.407 };

  const FS = 3, GRATE = 60, STOP = -40;
  const walk = M.gait({ from: -250, to: STOP / FS, t0: .15, gait: 'stroll', until: T.streets, arms: [null, [.2, 1.7]] });
  const idle = M.idle({ x: STOP / FS, seed: 4 });

  const Z = PORT ? .62 : .92;
  const cam = B.cam([
    [0, -160, -300, Z], [T.streets, -40, -270, Z * 1.08], [T.rats + .2, 20, -150, PORT ? 1.05 : 1.5],
    [T.health + .4, 30, -160, PORT ? 1.02 : 1.45], [T.with + .5, 230, -40, PORT ? 1.9 : 2.4], [DUR, 330, -40, PORT ? 1.95 : 2.45],
  ]);

  const HOUSES = []; { let xx = -1500, i = 0; while (xx < 1700) { const hw = 200 + hash(i, 61) * 90; HOUSES.push([xx + hw / 2, hw, 520 + hash(i, 62) * 200, i]); xx += hw + 4; i++; } }
  function facade(x, cx, hw, hh, i) {
    const wall = mix(mix(P.wall, P.amber, .15 + hash(i, 63) * .2), P.cream, hash(i, 64) * .25), l = cx - hw / 2, base = -40;
    x.fillStyle = wall; x.fillRect(l, base - hh, hw, hh);
    x.fillStyle = P.roof; x.beginPath(); x.moveTo(l - 10, base - hh + 6); x.lineTo(l + 16, base - hh - 30); x.lineTo(l + hw - 16, base - hh - 30); x.lineTo(l + hw + 10, base - hh + 6); x.fill();
    const shut = mix(P.sheet2, P.ink, .15);
    for (let f = 0; f < 2; f++) { const fy = base - hh + 50 + f * 170;
      for (const u of [.28, .72]) { x.fillStyle = mix(wall, P.ink, .35); x.fillRect(l + hw * u - 22, fy, 44, 110); x.fillStyle = shut; x.fillRect(l + hw * u - 30, fy, 12, 110); x.fillRect(l + hw * u + 18, fy, 12, 110); }
      x.fillStyle = mix(wall, P.ink, .3); x.fillRect(l + 6, fy + 118, hw - 12, 8); }
    x.fillStyle = mix(wall, P.ink, .55); x.fillRect(l + hw * .15, base - 150, hw * .7, 150);
    x.fillStyle = mix(P.awningA, wall, .35); x.beginPath(); x.moveTo(l + hw * .1, base - 170); x.lineTo(l + hw * .9, base - 170); x.lineTo(l + hw * .95, base - 140); x.lineTo(l + hw * .05, base - 140); x.fill();
  }
  function street(x, tp) {
    x.fillStyle = mix(P.sheet, P.sheetShade, .3); x.fillRect(-2200, -1600, 4400, 1560);
    HOUSES.forEach(h => facade(x, ...h));
    x.fillStyle = mix(P.sheetDim, P.cream, .25); x.fillRect(-2200, -40, 4400, 70);
    x.fillStyle = mix(P.sheetDim, P.ink, .12); x.fillRect(-2200, 30, 4400, 600);
    x.strokeStyle = mix(P.sheetDim, P.ink, .45); x.lineWidth = 6; for (const y of [120, 160]) { x.beginPath(); x.moveTo(-2200, y); x.lineTo(2200, y); x.stroke(); }
    x.fillStyle = mix(P.woodDark, P.ink, .3); x.fillRect(820, -760, 14, 790); x.fillRect(820, -760, -160, 10);
    x.strokeStyle = mix(P.ink, P.sheetDim, .3); x.lineWidth = 2; x.beginPath(); x.moveTo(-2200, -740); x.lineTo(2200, -738); x.stroke();
    x.fillStyle = P.ink; x.fillRect(GRATE - 44, -6, 88, 8);
    x.fillStyle = mix(P.sheetDim, P.ink, .5); for (let k = -3; k <= 3; k++) x.fillRect(GRATE + k * 12 - 2, -8, 4, 10);
    x.save(); x.translate(1180, -30); x.scale(2.6, 2.6);
    const vp = M.idle({ x: 0, seed: 9 })(tp), PJ = M.draw(x, P, vp, { coat: '#6f7a5a', trouser: '#4a4036', skin: '#b88a62', head: 'cap', headColor: '#d9ccaa', dir: -1, shadow: 0 });
    const sh = PJ.sh || [0, -70]; x.strokeStyle = P.woodDark; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-48, -72); x.lineTo(48, -72); x.stroke();
    for (const s of [-1, 1]) { x.strokeStyle = mix(P.ink, P.wood, .3); x.lineWidth = .8; x.beginPath(); x.moveTo(s * 44, -72); x.lineTo(s * 40, -30); x.moveTo(s * 44, -72); x.lineTo(s * 48, -30); x.stroke(); PR.basket(x, P, s * 44, -10, .32, -1); }
    x.restore();
  }

  function residentPose(tp) {
    let p = tp < T.streets ? walk(tp) : idle(tp);
    if (tp >= T.streets) p = { ...p, arms: [p.arms[0], [.2, 1.7]] };
    p.head = (p.head || 0) + .16 * smooth((tp - T.streets + .3) / .4) - .1 * smooth((tp - T.alive) / .3);
    const f0 = F.env(tp, T.scurry + .5, T.scurry + .7, T.scurry + .95, T.scurry + 1.15), f1 = F.env(tp, T.scurry + 1.3, T.scurry + 1.5, T.scurry + 1.75, T.scurry + 1.95);
    if (f0 > 0 || f1 > 0) p = { ...p, feet: p.feet.map((f, i) => M.foot(f.ax ?? f.at[0], 0, (i ? f1 : f0) * 7)), hip: [p.hip[0], p.hip[1] - 2 * Math.max(f0, f1)] };
    const start = smooth((tp - T.tails + .1) / .25);
    p.lean = (p.lean || 0) - .1 * start;
    return p;
  }
  function resident(x, tp) {
    x.save(); x.scale(FS, FS);
    const PJ = M.draw(x, P, residentPose(tp), { ...CAST.resident, dir: 1 });
    const wr = PJ.arms[1].wr, top = [wr[0] - 4, -132];
    x.strokeStyle = mix(P.woodDark, P.ink, .2); x.lineWidth = 1.6; x.beginPath(); x.moveTo(wr[0], wr[1] + 4); x.lineTo(top[0], top[1]); x.stroke();
    x.fillStyle = mix(P.cream, P.card, .4); x.beginPath(); x.moveTo(top[0] - 44, top[1] + 18);
    for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; x.lineTo(top[0] + Math.cos(a) * 44, top[1] + 18 + Math.sin(a) * 24); }
    for (let k = 8; k >= 0; k--) x.quadraticCurveTo(top[0] - 44 + k * 11 + 5.5, top[1] + 24, top[0] - 44 + k * 11, top[1] + 18);
    x.fill();
    x.strokeStyle = mix(P.cream, P.ink, .25); x.lineWidth = 1; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(top[0], top[1] - 6); x.lineTo(top[0] + k * 17, top[1] + 21); x.stroke(); }
    x.restore();
  }

  const NR = 6, FEET = STOP;
  const popAt = i => i === 0 ? T.rats : T.scurry + (i - 1) * .12;
  function ratAt(i, t) {
    const pk = smooth((t - popAt(i)) / .25);
    if (pk <= 0) return null;
    const away = t - T.with - .05 - hash(i, 71) * .15;
    if (away > 0) {
      const d = away < .3 ? away * away / .6 * 420 : (away - .15) * 420;
      return { x: GRATE + 30 + i * 34 + d, y: 2 + (i % 3) * 12, dir: 1, ph: d * .12, run: 1, sit: 0, tail: 0, front: true };
    }
    if (i === 0 && t < T.scurry + .5) {
      const sit = smooth((t - T.alive) / .25), tw = Math.sin(t * 40) * .4 * sit;
      return { x: GRATE, y: lerp(18, 0, pk), dir: -1, ph: 0, run: 0, sit: sit * .9 + tw * .05, tail: 0, front: true, clip: pk < 1 };
    }
    if (t < T.scurry + .15 + i * .12) return { x: GRATE + (i - 3) * 16, y: lerp(18, 0, pk), dir: -1, ph: 0, run: 0, sit: 0, tail: 0, front: true, clip: pk < 1 };
    const th = (t - T.scurry - .15 - i * .12) * 5.2 + i * TAU / NR, rx = 150, ry = 26;
    return { x: FEET + Math.cos(th) * rx, y: Math.sin(th) * ry + 4, dir: -Math.sin(th) >= 0 ? 1 : -1, ph: th * 7, run: 1, sit: 0, tail: 0, front: Math.sin(th) > -.2 };
  }
  function rats(x, t, front) {
    for (let i = 0; i < NR; i++) {
      const r = ratAt(i, t); if (!r || r.front !== front) continue;
      x.save(); if (r.clip) { x.beginPath(); x.rect(-4000, -4000, 8000, 4000 - 2); x.clip(); }
      HN.rat(x, P, { x: r.x, y: r.y, s: 1.9, dir: r.dir, ph: r.ph, run: r.run, sit: r.sit, tail: r.tail });
      x.restore();
    }
  }

  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => { street(x, tp); rats(x, tp, false); resident(x, tp); rats(x, tp, true); });
    L.grade(ctx, t);
  }

  F.scene('seq-14', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { cam } });
})();
