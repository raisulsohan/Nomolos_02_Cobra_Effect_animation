(function () {
  'use strict';
  const F = FILM, CS = F.cases, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-30'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P, CAST = F.rulers.cast(P);
  const T = { reward: 0.603, measurement: 1.093, meaning: 2.261, handed: 3.89, game: 5.019,
    s124: C.s('S124').t0, sooner: 6.08, they: 7.11, will: 7.315 };
  const GY = H * (PORT ? .74 : .8), SX = W * (PORT ? .3 : .36), RX = W * (PORT ? .52 : .5), RS = PORT ? 1.35 : 1.65;
  const stretch = t => 1.1 * easeIO((t - T.sooner) / (T.will + .4 - T.sooner));
  const droop = t => smooth((t - T.they) / .8);
  const TOSS = [T.reward - .1, T.measurement + .45], BOSS = [W * (PORT ? .8 : .72), GY], BFS = PORT ? 2 : 2.5;
  const topAt = t => [RX, GY - 180 * (1 + stretch(t)) * RS];
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  const CROWD = F.rulers.crowd(P, 12);
  function boss(x, tp) {
    let p = M.idle({ x: 0, seed: 101 })(tp); const k = F.env(tp, TOSS[0] - .3, TOSS[0], TOSS[0] + .3, TOSS[0] + .7);
    p = at(p, 1, [lerp(20, 44, k), lerp(-40, -66, k)]);
    x.save(); x.translate(BOSS[0], BOSS[1]); x.scale(BFS, BFS); const PJ = M.draw(x, P, p, { ...CAST.boss, dir: -1 }); x.restore();
    return [BOSS[0] - PJ.arms[1].wr[0] * BFS, BOSS[1] + PJ.arms[1].wr[1] * BFS];
  }
  function coin(x, t, hand) {
    const u = clamp((t - TOSS[0]) / (TOSS[1] - TOSS[0])), top = topAt(t);
    if (u <= 0) { PR.coin(x, P, 'flat', hand[0] - 6, hand[1], 13, .3); return; }
    const p = u < 1 ? [lerp(hand[0], top[0], u), lerp(hand[1], top[1] - 14, u) - Math.sin(u * Math.PI) * 180] : [top[0], top[1] - 14];
    PR.coin(x, P, 'flat', p[0], p[1], 13, u < 1 ? .5 + .5 * Math.sin(u * 10) : 1);
    if (u >= 1) PR.glow(x, top[0], top[1] - 14, 60, P.glow, .25 * F.env(t, TOSS[1], TOSS[1] + .1, TOSS[1] + .6, TOSS[1] + 1.2), 'flat');
  }
  function crowd(x, t) {
    const tp = M.pose(t);
    CROWD.forEach((c, i) => {
      const side = i % 2 ? 1 : -1, k = smooth((t - T.handed - i * .08) / .6); if (k <= 0) return;
      const home = RX + side * (70 + Math.floor(i / 2) * 44), px = lerp(RX + side * (W * .6), home, easeIO(k));
      let p = M.idle({ x: 0, seed: 110 + i })(tp); const grab = smooth((t - T.game - i * .05) / .4);
      p = at(p, 1, [lerp(20, 36, grab), lerp(-40, -66 - 6 * Math.sin(t * 9 + i) * smooth((t - T.sooner) / .3), grab)]);
      x.save(); x.translate(px, GY); x.scale(1.25 * c.s, 1.25 * c.s); M.draw(x, P, p, { ...c.look, dir: -side, shadow: 0 }); x.restore();
    });
  }
  function draw(ctx, t) {
    const tp = M.pose(t);
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      x.fillStyle = mix(P.sheet2, P.ink, .2); x.fillRect(0, GY, W, H - GY);
      CS.pot(x, P, SX, GY - 76 * RS, RS);
      CS.seedling(x, P, { x: SX, y: GY - 80 * RS, h: 120 * RS, droop: droop(t), k: 1 - .45 * droop(t) });
      x.save(); x.translate(RX, GY); x.scale(RS, RS); CS.ruler(x, P, { x: 0, y: 0, len0: 180, stretch: stretch(t), target: 1, pull: F.env(t, T.sooner, T.sooner + .3, DUR, DUR + 1) }); x.restore();
      const hand = boss(x, tp);
      crowd(x, t);
      coin(x, t, hand);
    }, { flatShadow: [10, 14, 12, .4] });
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); PR.glow(ctx, SX, GY - 80 * RS - 100 * RS, 120, P.cream, .18 * F.env(t, T.meaning - .2, T.meaning + .2, T.meaning + .8, T.meaning + 1.4), 'flat'); ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-30', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
