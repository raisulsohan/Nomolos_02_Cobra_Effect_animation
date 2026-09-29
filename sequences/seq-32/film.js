(function () {
  'use strict';
  const F = FILM, PL = F.plain, G = F.goal, PR = F.props, E = F.emperor, B = F.bits, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-32'), DUR = C.duration;
  const LF = F.look('flat', W, H), LB = F.look('lightbox', W, H), PF = LF.P, PB = LB.P;
  const T = { thousand: 2.34, crowd: 4.028, steering: 5.366, wrong: 6.8, meaning: 8.396,
    s130: C.s('S130').t0, single: 12.049, s131: C.s('S131').t0, chasing: 14.649, anything: 16.844, swallowing: 19.617, destroy: 22.124 };
  const TURN = [T.thousand, T.meaning + .3], NIGHT = [T.s130 + .5, T.single], HALL = [T.s131 - .35, T.s131 + .6];
  const ONE = [-160, 150];
  const angle = t => Math.PI * .96 * easeIO((t - TURN[0]) / (TURN[1] - TURN[0]));

  const LOOKS = F.rulers.crowd(PF, 12);
  const PEOPLE = Array.from({ length: 170 }, (_, i) => {
    const a = hash(i, 1) * TAU, lane = (hash(i, 2) - .5) * 1400, dir = [Math.cos(a), Math.sin(a) * .7];
    return { a: Math.atan2(dir[1], dir[0]), o: [-dir[1] * lane, dir[0] * lane], v: 50 + hash(i, 3) * 40, ph0: hash(i, 4) * 3000, look: LOOKS[i % 12].look, s: .85 + hash(i, 5) * .25 };
  });
  const personAt = (p, t) => { const d = ((p.ph0 + p.v * t) % 3000) - 1500; return { x: p.o[0] + Math.cos(p.a) * d, y: p.o[1] + Math.sin(p.a) * d, h: p.a, ph: d * TAU / 46 }; };
  function plain(x, P, t, lb) {
    PL.ground(x, P, { x0: -3000, y0: -2000, x1: 3000, y1: 2000, top: -2000 });
    if (!lb) { G.city(x, P, { x: 1250, y: 60, s: 3.2, k: 1, blur: 4 }); }
    const ak = lb ? 1 - smooth((t - NIGHT[0]) / (NIGHT[1] - NIGHT[0])) : 1;
    const q = PEOPLE.map(p => ({ p, ...personAt(p, t) })).sort((a, b) => a.y - b.y);
    if (lb) { x.fillStyle = F.rgba([4, 4, 26], .8 * smooth((t - NIGHT[0]) / (NIGHT[1] - NIGHT[0]))); x.fillRect(-3000, -2000, 6000, 4000); }
    else { const g = x.createLinearGradient(-2200, 0, 400, 0); g.addColorStop(0, F.rgba(F.hex(P.bgTop), .7)); g.addColorStop(1, F.rgba(F.hex(P.bgTop), 0)); x.fillStyle = g; x.fillRect(-3000, -2000, 3400, 4000); }
    x.globalAlpha = ak; for (const o of q) PL.shadow(x, P, { x: o.x, y: o.y, s: o.p.s * 1.8 });
    for (const o of q) PL.person(x, P, { x: o.x, y: o.y, h: o.h, s: o.p.s * 1.8, look: o.p.look, run: .5, ph: o.ph }); x.globalAlpha = 1;
    PL.person(x, P, { x: ONE[0], y: ONE[1], h: .3, s: 1.9, look: { coat: mix(P.coat, P.cream, .15) }, run: 0 });
  }
  function arrow(x, P, t) {
    const k = smooth((t - T.s130 - .2) / 2.4), s = lerp(1, .02, k), c = [lerp(0, ONE[0], k), lerp(0, ONE[1], k)];
    if (s <= .03) return;
    x.save(); x.translate(c[0], c[1]); x.rotate(angle(t)); x.scale(s, s); PL.arrow(x, P, { x0: -620, x1: 560, y: 0, w: 70, hw: 170, hl: 140, u: 1 }); x.restore();
  }
  const pcam = B.cam([[0, 60, 0, PORT ? .42 : .6], [T.s130, 20, 30, PORT ? .45 : .64], [T.single + .3, ONE[0], ONE[1], PORT ? 3 : 4.2], [HALL[1], ONE[0], ONE[1], PORT ? 3.4 : 4.8]]);

  const FIG = [PORT ? -170 : -260, 300], FS = PORT ? 2.2 : 2.6;
  const reachK = t => F.env(t, T.chasing - .2, T.chasing + .5, T.anything + .5, T.anything + 1.2), cupK = t => smooth((t - T.swallowing + .6) / .8);
  function hall(x, P, t) {
    x.fillStyle = mix(P.sheet2, P.ink, .2); x.fillRect(-2000, -1400, 4000, 1700);
    x.fillStyle = mix(P.sheet2, P.sheet, .15); for (let k = -6; k < 7; k++) x.fillRect(k * 260 - 12, -1400, 24, 1700);
    x.fillStyle = mix(P.sheet2, P.ink, .45); x.fillRect(-2000, 300, 4000, 500);
    const hk = smooth((t - T.swallowing) / .9);
    if (hk > 0) { x.save(); x.globalAlpha = .55 * hk; x.translate(FIG[0] - 60, 120); x.scale(4.2, 4.2); x.beginPath(); x.rect(-200, -400, 400, 368); x.clip(); const sh = mix(P.ink, P.sheet2, .1); PR.cobraRear(x, { ...P, ink: sh, sheet: sh, cream: sh, rim: sh, amber: sh, skin: sh }, { w: 18, rise: hk, hood: hk, view: 'back' }); x.restore(); }
    const r = E.robed(x, P, { x: FIG[0], y: FIG[1], s: FS, col: P.ink, arm: reachK(t), cup: cupK(t) });
    if (cupK(t) > 0) { x.save(); x.translate(r.hand[0] + 6, r.hand[1] - 6); x.fillStyle = mix(P.amberDark, P.ink, .4); x.beginPath(); x.moveTo(-12, -14); x.lineTo(12, -14); x.lineTo(7, 6); x.lineTo(-7, 6); x.fill(); x.fillStyle = E.SILVER; x.beginPath(); x.ellipse(0, -13, 11, 3, 0, 0, TAU); x.fill(); x.restore(); }
    return r;
  }
  const orbAt = t => { const d = smooth((t - T.chasing) / (T.anything + .6 - T.chasing)); return [FIG[0] + lerp(170, 330, d) * FS / 2.6 * (PORT ? .8 : 1), FIG[1] - lerp(340, 330, d) + Math.sin(t * 2.2) * 12]; };

  function draw(ctx, t) {
    const n = B.blend(t, NIGHT[0], NIGHT[1]), hallK = B.blend(t, HALL[0], HALL[1]), c = pcam(t), tp = F.motion.pose(t);
    if (hallK < 1) {
      if (n < 1) { LF.background(ctx); LF.sheet(ctx, c, 1, [0, 0], x => { plain(x, PF, tp, false); arrow(x, PF, t); }, { flatShadow: [10, 14, 12, .35] });
        ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); PR.glow(ctx, 1250, 0, 600, PF.glow, .25, 'flat'); ctx.restore(); LF.grade(ctx, t); }
      if (n > 0) {
        ctx.save(); ctx.globalAlpha = n; LB.background(ctx); ctx.restore();
        LB.sheet(ctx, c, 1, [0, 0], x => { plain(x, PB, tp, true); arrow(x, PB, t); }, { alpha: n, glow: .5 * n });
        ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); ctx.globalAlpha = n; PR.glow(ctx, ONE[0], ONE[1], 60, PB.glow, .6 * smooth((t - T.single + .6) / .8), 'lightbox'); ctx.restore();
        if (n >= 1 && hallK <= 0) LB.grade(ctx, t);
      }
    }
    if (hallK > 0) {
      const hc = { x: PORT ? -40 : 0, y: PORT ? 60 : 40, z: (PORT ? .8 : 1) * lerp(1, 1.06, smooth((t - HALL[0]) / (DUR - HALL[0]))) };
      ctx.save(); ctx.globalAlpha = hallK; LB.background(ctx); ctx.restore();
      let r = null;
      LB.sheet(ctx, hc, 1, [0, 0], x => { r = hall(x, PB, t); }, { alpha: hallK, glow: .5 * hallK });
      ctx.save(); F.sheet(ctx, hc, 1, W, H, [0, 0]); ctx.globalAlpha = hallK;
      PR.glow(ctx, FIG[0] + 6 * FS, FIG[1] - 118 * FS, 40, PB.glow, .7, 'lightbox');
      const ok = F.env(t, T.chasing - .6, T.chasing - .2, T.swallowing - .8, T.swallowing - .3); if (ok > 0) { const o = orbAt(t); PR.glow(ctx, o[0], o[1], 70, PB.cream, .9 * ok, 'lightbox'); }
      if (cupK(t) > 0) PR.glow(ctx, r.hand[0] + 6, r.hand[1] - 19, 50, E.SILVER, .6 * cupK(t), 'lightbox');
      ctx.restore();
      LB.grade(ctx, t);
    }
  }
  F.scene('seq-32', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
