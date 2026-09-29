(function () {
  'use strict';
  const F = FILM, PR = F.props, M = F.motion, B = F.bits, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-31'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, CAST = F.rulers.cast(P);
  const T = { be: C.s('S126').t0, careful: 4.036, because: C.s('S127').t0, get: 7.331, even: C.s('S128').t0, last: 9.288, wanted: 10.798 };
  const TOP = -120, BOX = [60, TOP], MOM = -150, FS = 3.3;
  const DROP = [T.get - .15, T.get + .15], CRACK = [T.get + .2, T.get + .5], RISE = [T.even + .1, T.even + 1.5];
  const Z = PORT ? .9 : 1.25;
  const cam = B.cam([[0, 40, -230, Z], [T.be - .1, 40, -230, Z * 1.02], [T.be + .9, 20, -250, Z * 1.35], [T.even, 30, -260, Z * 1.4], [DUR, 40, -300, Z * 1.25]]);
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  function mother(x, tp) {
    const k = smooth((tp - T.be + .3) / .6), off = smooth((tp - T.last + .6) / .4), hes = Math.sin(tp * 3.2) * 2.5 * F.env(tp, T.be + .6, T.be + 1, T.get - .5, T.get - .3);
    let p = M.idle({ x: 0, seed: 120 })(tp);
    p = at(p, 1, [lerp(20, lerp(62, 36, off), k), lerp(-40, lerp(-66 + hes, -52, off), k)]);
    p.lean = (p.lean || 0) - .12 * off; p.head = (p.head || 0) + .08 * k - .12 * off;
    x.save(); x.translate(MOM, 0); x.scale(FS, FS); const PJ = M.draw(x, P, p, { ...CAST.mother, dir: 1 }); x.restore();
    return [MOM + PJ.arms[1].wr[0] * FS, PJ.arms[1].wr[1] * FS];
  }
  function table(x) {
    x.fillStyle = mix(P.wall, P.cream, .3); x.fillRect(-2000, -1400, 4000, 1400);
    x.fillStyle = mix(P.sheetDim, P.wood, .2); x.fillRect(-2000, 0, 4000, 800);
    x.fillStyle = P.wood; x.fillRect(-120, TOP, 400, 14); x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(-100, TOP + 14, 12, -TOP - 14); x.fillRect(248, TOP + 14, 12, -TOP - 14);
  }
  function box(x, t) {
    const sh = F.env(t, CRACK[0] - .05, CRACK[0], CRACK[1] + .1, CRACK[1] + .3) * Math.sin(t * 70) * 3 + F.env(t, RISE[0], RISE[0] + .1, RISE[0] + .3, RISE[0] + .5) * Math.sin(t * 60) * 4;
    const lid = Math.max(F.env(t, CRACK[0], CRACK[0] + .12, CRACK[1], CRACK[1] + .2) * .2, easeOutBack(clamp((t - RISE[0]) / .35), 1.4) * 1.9);
    const [bx, by] = BOX, bw = 124, bh = 76, wood = mix(P.wood, P.cream, .15), dark = mix(wood, P.ink, .3);
    x.save(); x.translate(bx + sh, by);
    const r = clamp((t - RISE[0] - .15) / (RISE[1] - RISE[0]));
    if (r > 0) { x.save(); x.beginPath(); x.rect(-600, -1200, 1200, 1200 - bh); x.rect(-bw / 2, -bh - 1, bw, bh * .85); x.clip(); x.translate(0, -bh * .2); x.scale(1.7, 1.7); PR.cobraRear(x, P, { w: 22, rise: easeIO(r), hood: smooth((r - .4) / .5), view: 'front', sway: Math.sin(t * 1.6) * .06 * r, tongue: r > .9 ? (Math.sin(t * 7) > .6 ? 1 : 0) : 0 }); x.restore(); }
    x.fillStyle = wood; x.fillRect(-bw / 2, -bh, bw, bh);
    x.strokeStyle = dark; x.lineWidth = 3; x.strokeRect(-bw / 2 + 8, -bh + 10, bw - 16, bh - 18);
    x.save(); x.translate(-bw / 2, -bh); x.rotate(-lid); x.fillStyle = mix(wood, P.cream, .15); x.fillRect(0, -12, bw, 12); x.fillStyle = P.ink; x.fillRect(bw / 2 - 20, -10, 40, 4); x.restore();
    x.restore();
  }
  function coin(x, t, hand) {
    if (t > DROP[1] + .05) return;
    const u = clamp((t - DROP[0]) / (DROP[1] - DROP[0])), sx = hand[0] + 8, sy = hand[1] + 6, ex = BOX[0], ey = BOX[1] - 76 - 8;
    const k = smooth((t - T.be + .3) / .6); if (k <= 0) return;
    PR.coin(x, P, 'paper', lerp(sx, ex, u), lerp(sy, ey + 16, u * u), 12, lerp(.9, 1, u));
  }
  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => { table(x); const hand = mother(x, tp); box(x, t); coin(x, t, hand); });
    B.words(L, ctx, 'BE CAREFUL WHAT YOU PAY FOR', smooth((t - T.careful + .05) / .35), { y: PORT ? .1 : .12, size: PORT ? 64 : 84 });
    L.grade(ctx, t);
  }
  F.scene('seq-31', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
