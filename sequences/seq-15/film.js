(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-15'), DUR = C.duration;
  const LP = F.look('paper', W, H), LB = F.look('lightbox', W, H), PP = LP.P, PB = LB.P;
  const SEC = HN.SEC, CH = Math.max(1, SEC.hero - 2), HS = SEC.houses[CH], PXD = SEC.pipeX(CH);
  const T = { dead: C.s('S081').t0, single: 4.073, finished: 5.902, but: C.s('S082').t0, snipped: 8.629,
    dropped: 9.4, sewer: 10.456, breed: 11.794, produce: 12.302, whole: 12.811,
    crop: 13.32, so: C.s('S083').t0 };

  const FS = 1.2, SX = PXD - 150, TABLE = SX + 62, TOP = -30, LAMP = [TABLE + 26, TOP - 16];
  const TOSS = [T.dropped, T.dropped + .45], FALL = [TOSS[1], TOSS[1] + .8], NIGHT = [T.dropped + .5, T.sewer + .7];
  const MAIN = SEC.main;

  const k = PORT ? .82 : 1;
  const cam = B.cam([
    [0, SX + 50, -85, 3.1 * k], [T.dead - .1, SX + 55, -80, 3.3 * k], [T.dead + .7, TABLE, TOP - 22, 6.2 * k], [T.finished + .5, TABLE + 2, TOP - 22, 6.4 * k],
    [T.but + .7, SX + 60, -95, 3 * k], [T.dropped, SX + 70, -95, 3.05 * k], [FALL[0] + .2, PXD, 60, 2.6 * k], [FALL[1] + .4, PXD + 40, MAIN.y0 + 70, 2.7 * k],
    [T.whole, PXD + 140, MAIN.y0 + 90, 2 * k], [T.so - .05, PXD + 170, MAIN.y0 + 95, 1.9 * k], [T.so + .9, PXD - 20, 100, 1.45 * k], [DUR, PXD - 25, 90, 1.47 * k],
  ]);

  const CAST = HN.cast(PP), seat = M.seatedPose(0, 16), idle = M.idle({ base: seat, seed: 6 });
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  function catcherPose(tp) {
    let p = idle(tp);
    const click = F.env(tp, .1, .4, T.but - .3, T.but), hold = F.env(tp, T.but + .1, T.but + .6, TOSS[0] + .1, TOSS[1]), toss = F.env(tp, TOSS[0], TOSS[0] + .2, TOSS[1] + .1, TOSS[1] + .6);
    const bead = Math.sin(tp * 18) * 2 * click * (tp < T.finished ? 1 : 0);
    const tgt = [lerp(lerp(22, 40 + bead, click), 32, hold) + 26 * toss, lerp(lerp(-26, -24, click), -44, hold) + 6 * toss];
    p = at(p, 1, tgt); p = at(p, 0, [tgt[0] - 4 * hold - 8 * (1 - hold), tgt[1] + 2]);
    const lookDown = smooth((tp - T.so + .3) / .5);
    p.lean = (p.lean || 0) + .1 * toss + .35 * lookDown; p.head = (p.head || 0) + .1 * click + .3 * lookDown;
    return p;
  }
  function catcher(x, P, tp, look) {
    x.save(); x.translate(SX, 0); x.scale(FS, FS);
    const PJ = M.draw(x, P, catcherPose(tp), look);
    x.restore();
    return [SX + PJ.arms[1].wr[0] * FS, PJ.arms[1].wr[1] * FS];
  }

  function table(x, P, tp) {
    x.fillStyle = mix(P.wood, P.ink, .15); x.fillRect(TABLE - 38, TOP, 76, 5); x.fillRect(TABLE - 34, TOP + 5, 5, -TOP - 5); x.fillRect(TABLE + 29, TOP + 5, 5, -TOP - 5);
    HN.abacus(x, P, TABLE - 12, TOP - 11, .2, smooth((tp - T.single) / .5) * .75);
    x.save(); x.translate(TABLE + 12, TOP - 13); x.rotate(-.12);
    x.fillStyle = P.woodDark; x.fillRect(-15, -12, 30, 22); x.fillStyle = mix(P.ink, P.sheet2, .25); x.fillRect(-13.5, -10.5, 27, 19);
    const ch = mix(P.cream, P.sheet2, .2), sk = smooth((tp - T.dead) / 1.2);
    x.globalAlpha = sk; x.strokeStyle = ch; x.fillStyle = ch; x.lineWidth = .7;
    HN.rat(x, { ...P, ink: ch, sheetDim: ch, skin: ch }, { x: -7, y: -1, s: .18, run: 0, col: ch });
    x.beginPath(); x.moveTo(-2, -3); x.lineTo(3, -3); x.moveTo(1.5, -4.5); x.lineTo(3, -3); x.lineTo(1.5, -1.5); x.stroke();
    x.beginPath(); x.arc(8, -3, 2.4, 0, TAU); x.stroke();
    x.globalAlpha = smooth((tp - T.finished) / .3); x.lineWidth = .9; x.beginPath(); x.moveTo(-10, 3); x.lineTo(11, 3); x.stroke();
    x.restore();
    HN.lampAt(x, P, LAMP[0], LAMP[1], .55);
  }

  const snip = t => smooth((t - T.snipped) / .12);
  function heldRat(x, P, t, hand) {
    if (t < T.but || t > FALL[1]) return;
    let rx = hand[0] + 4, ry = hand[1] + 2, rot = 0;
    if (t > TOSS[0]) { const u = clamp((t - TOSS[0]) / (TOSS[1] - TOSS[0])); rx = lerp(hand[0] + 4, PXD, u); ry = lerp(hand[1], -2, u) - Math.sin(u * Math.PI) * 30; rot = u * 1.6; }
    if (t > FALL[0]) { const u = easeIO((t - FALL[0]) / (FALL[1] - FALL[0])); rx = PXD; ry = lerp(-2, MAIN.y1 - 6, u); rot = Math.PI / 2; }
    x.save(); x.translate(rx, ry); x.rotate(rot); HN.rat(x, P, { x: 0, y: 0, s: 1, ph: t * 20, run: t > T.but + .3 && t < FALL[0] ? .5 : 0, tail: 1 - snip(t) }); x.restore();
  }
  function wallShadow(x, P, t) {
    const k = F.env(t, T.but + .4, T.but + .9, TOSS[0], TOSS[0] + .3); if (k <= 0) return;
    const l = HS.x - HS.w / 2 + 12, top = -HS.h / 2 + 8;
    x.save(); x.beginPath(); x.rect(l, top, HS.w - 24, -top - 2); x.clip(); x.globalAlpha = .55 * k;
    const cx = SX + 70, cy = -118, s = 3.6, sp = mix(P.ink, P.coat2, .2);
    HN.rat(x, P, { x: cx, y: cy, s, dir: 1, ph: t * 20, run: .5, tail: 1 - snip(t), col: sp });
    if (snip(t) > 0 && snip(t) < 1.5) HN.tail(x, P, cx - 12 * s, cy - 6 * s + (t - T.snipped) * 260, 30 * s, 1.2 + (t - T.snipped) * 3, 2.6 * s);
    const sc = clamp((t - T.snipped + .6) / .6), op = t < T.snipped ? .55 : .05 + .5 * smooth((t - T.snipped - .2) / .3);
    HN.scissors(x, P, { x: cx - 12 * s - 30 + 30 * sc, y: cy - 5 * s + 70, a: -.45, s: 1.6, open: op });
    x.restore();
  }
  function evening(x, P) {
    const g = x.createRadialGradient(LAMP[0], LAMP[1], 10, LAMP[0], LAMP[1], 420);
    g.addColorStop(0, 'rgba(255,214,150,.12)'); g.addColorStop(.35, 'rgba(40,28,40,.12)'); g.addColorStop(1, 'rgba(20,16,32,.62)');
    x.fillStyle = g; x.fillRect(SEC.x0, -1200, SEC.x1 - SEC.x0, 2400);
  }

  const BREED = [[0, 0], [T.breed, 1], [T.produce, 3], [T.whole, 11]];
  const nRats = t => 1 + BREED.reduce((a, [tt, n]) => t >= tt ? n : a, 0);
  function sewerRats(x, P, t) {
    if (t < FALL[1]) return;
    const n = nRats(t);
    for (let i = 0; i < n; i++) {
      const born = i === 0 ? FALL[1] : BREED.find(([, m]) => m >= i)[0] + hash(i, 81) * .3, k = smooth((t - born) / .3);
      if (k <= 0) continue;
      const hx = PXD + (i === 0 ? 0 : (i % 2 ? 1 : -.4) * (40 + i * 28 + hash(i, 82) * 30)) + Math.sin(t * 1.3 + i) * 8;
      x.globalAlpha = k; HN.rat(x, P, { x: hx, y: MAIN.y1 - 6 - (i % 3) * 5, s: 1.45 - (i % 3) * .1, dir: hash(i, 83) < .5 ? -1 : 1, ph: t * 8 + i, run: .35, tail: i === 0 ? 0 : 1, eyes: 1 }); x.globalAlpha = 1;
    }
  }
  function crop(x, P, t) {
    const k0 = T.crop - .3; if (t < k0) return;
    x.strokeStyle = mix(HN.ratCol(P), P.rim, .35); x.lineCap = 'round';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) {
      const px = PXD - 260 + i * 34 + r * 11, g = smooth((t - k0 - hash(i, r, 84) * .9 - r * .12) / .5); if (g <= 0) continue;
      const hgt = g * (26 + r * 6 + hash(i, r, 85) * 8), base = MAIN.y1 - 8 - r * 7, sw = Math.sin(t * 2 + i * .7) * 3;
      x.lineWidth = 2.2 - r * .4; x.beginPath(); x.moveTo(px, base); x.quadraticCurveTo(px + sw * .5, base - hgt * .6, px + sw + 5, base - hgt); x.stroke();
    }
  }

  function draw(ctx, t) {
    const c = cam(t), tp = LP.pose(t), n = B.blend(t, NIGHT[0], NIGHT[1]);
    if (n < 1) {
      LP.background(ctx);
      LP.sheet(ctx, c, 1, [0, 0], x => {
        HN.section(x, PP, { draw: 1, look: 'paper', lit: i => i === CH ? 1 : .6 });
        wallShadow(x, PP, tp);
        const hand = catcher(x, PP, tp, { ...CAST.catcher, dir: 1 });
        table(x, PP, tp);
        heldRat(x, PP, tp, hand);
        evening(x, PP);
      });
      ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); PR.glow(ctx, LAMP[0], LAMP[1], 110, PP.glow, .4, 'paper'); ctx.restore();
      LP.grade(ctx, t);
    }
    if (n > 0) {
      ctx.save(); ctx.globalAlpha = n; LB.background(ctx); ctx.restore();
      LB.sheet(ctx, c, 1, [0, 0], x => {
        HN.section(x, PB, { draw: 1, look: 'lightbox', lit: i => i === CH ? 1 : .8 });
        const hand = catcher(x, PB, tp, { coat: PB.coat, trouser: PB.trouser, skin: PB.skin, head: 'bare', hair: PB.ink, shoe: PB.ink, shadow: 0, dir: 1 });
        table(x, PB, tp);
        heldRat(x, PB, tp, hand);
        crop(x, PB, tp);
        sewerRats(x, PB, tp);
      }, { alpha: n, glow: .55 * n });
      ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); ctx.globalAlpha = n; PR.glow(ctx, LAMP[0], LAMP[1], 120, PB.glow, .35, 'lightbox'); ctx.restore();
      if (n >= 1) LB.grade(ctx, t);
    }
  }

  F.scene('seq-15', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { cam, CH } });
})();
