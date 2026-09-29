(function () {
  'use strict';
  const F = FILM, E = F.emperor, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-35'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { sent: 0.299, find: 1.344, medicine: 2.919, live: 4.205, forever: 4.439 };
  const R = PORT ? 360 : 380, MC = PORT ? [W * .4, H * .6] : [W * .36, H * .56], ISLE = PORT ? [W * .82, H * .3] : [W * .84, H * .34];
  const go = t => clamp((t - T.sent) / (DUR - T.sent));
  function sea(x) {
    x.fillStyle = mix(P.glass, P.sheet2, .55); x.fillRect(MC[0] + R * .55, -200, W * 2, H + 400);
    x.strokeStyle = F.rgba(F.hex(P.cream), .12); x.lineWidth = 2; for (let k = 0; k < 14; k++) { const y = 60 + k * 90; x.beginPath(); for (let px = MC[0] + R * .6; px < W + 200; px += 40) x.lineTo(px, y + Math.sin(px * .02 + k) * 5); x.stroke(); }
  }
  function mountains(x) {
    x.fillStyle = mix(P.sheetShade, P.ink, .25);
    for (let k = 0; k < 9; k++) { const mx = MC[0] - R * .75 + (k % 3) * 60, my = MC[1] - R * .3 + Math.floor(k / 3) * 90; x.beginPath(); x.moveTo(mx - 40, my + 30); x.lineTo(mx, my - 30); x.lineTo(mx + 40, my + 30); x.fill(); }
  }
  function travellers(x, t) {
    const g = go(t), cap = [MC[0] + E.CAPITAL[0] * R, MC[1] + E.CAPITAL[1] * R];
    for (let k = 0; k < 6; k++) {
      const a = Math.PI * (.85 + k * .08), d = easeIO(clamp(g * 1.6 - k * .05)) * R * 1.05, px = cap[0] + Math.cos(a) * d, py = cap[1] + Math.sin(a) * d * .8;
      if (d > 2) { x.save(); x.translate(px, py); x.scale(-1, 1); E.rider(x, P, 0, 0, 1.5, t * 14 + k); x.restore(); }
    }
    for (let k = 0; k < 5; k++) {
      const u = easeIO(clamp(g * 1.3 - k * .06)), sx = lerp(MC[0] + R * .6, ISLE[0] - 120 + k * 10, u), sy = lerp(MC[1] - 60 + k * 40, ISLE[1] + 60 + k * 36, u);
      if (u > .02) E.ship(x, P, sx, sy, 1.6, t * 3 + k);
    }
  }
  function isle(x, t) {
    const k = smooth((t - T.medicine + .1) / .6); if (k <= 0) return;
    x.globalAlpha = k; x.fillStyle = mix(P.sheet, P.cream, .2); x.beginPath(); x.ellipse(ISLE[0], ISLE[1], 90, 34, 0, 0, TAU); x.fill();
    x.fillStyle = mix(P.sheetShade, P.ink, .2); x.beginPath(); x.moveTo(ISLE[0] - 50, ISLE[1] - 10); x.lineTo(ISLE[0] - 10, ISLE[1] - 60); x.lineTo(ISLE[0] + 40, ISLE[1] - 10); x.fill();
    const b = smooth((t - T.live + .3) / .5); if (b > 0) { x.globalAlpha = b; E.bottle(x, P, ISLE[0], ISLE[1] - 130 + Math.sin(t * 2) * 5, 2.4); }
    x.globalAlpha = 1;
  }
  function draw(ctx, t) {
    const z = lerp(1, 1.05, smooth(t / DUR));
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z }, 1, [W / 2, H / 2], x => {
      sea(x); x.save(); x.translate(MC[0], MC[1]); E.kingdoms(x, P, { R, u: 1, border: 1 }); x.restore();
      mountains(x); isle(x, t); travellers(x, t);
    }, { flatShadow: [12, 16, 14, .4] });
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const ik = smooth((t - T.medicine) / .6), bk = smooth((t - T.live + .3) / .5), zz = (W / 2) * (1 - z);
    if (ik > 0) PR.glow(ctx, zz + ISLE[0] * z, (H / 2) * (1 - z) + ISLE[1] * z, 260, P.glow, .35 * ik, 'flat');
    if (bk > 0) PR.glow(ctx, zz + ISLE[0] * z, (H / 2) * (1 - z) + (ISLE[1] - 130) * z, 160, E.SILVER, .6 * bk, 'flat');
    ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-35', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
