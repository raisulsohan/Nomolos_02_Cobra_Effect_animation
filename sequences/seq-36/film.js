(function () {
  'use strict';
  const F = FILM, E = F.emperor, PR = F.props, B = F.bits, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-36'), DUR = C.duration;
  const L = F.look('lightbox', W, H), P = L.P;
  const T = { found: 0.205, s139: C.s('S139').t0, potion: 1.944, immortal: 3.263, killed: 4.961, s140: C.s('S140').t0, next: 6.755 };
  const [TX, TY] = E.HALL.throne, [CX, CY] = E.HALL.candle, ES = 2.6, CS = 2.2, FY = E.HALL.floor, SV = [40, FY];
  const REACH = [.35, 1.2], DRINK = [T.potion - .2, T.potion + .7], SLIP = T.immortal + .55, OUT = T.killed + .02, CROWN = [T.killed + .25, T.killed + .85];
  const Z0 = PORT ? .66 : 1, cam0 = t => ({ x: PORT ? -60 : 0, y: PORT ? 0 : -20, z: Z0 * lerp(1, 1.04, smooth(t / T.killed)) });
  const cam = t => { const a = cam0(t), k = easeIO((t - T.killed - .3) / (T.next - T.killed - .1)); return { x: lerp(a.x, SV[0] + 90, k), y: lerp(a.y, FY - 90, k), z: a.z * Math.pow(2.1, k) }; };
  const flame = t => t < OUT ? 1 + .05 * Math.sin(t * 9) : 0;
  const light = t => lerp(1, .06, smooth((t - OUT) / .12));
  const CROWN_END = [SV[0] + 70, FY - 6];
  function draw(ctx, t) {
    const c = cam(t), fade = smooth((t - T.next - .15) / (DUR - T.next - .1));
    L.background(ctx);
    let em = null, pool = 0;
    L.sheet(ctx, c, 1, [0, 0], x => {
      E.hall(x, P, .8 * light(t));
      const dropped = t >= SLIP, armK = t < DRINK[0] ? smooth((t - REACH[0]) / (REACH[1] - REACH[0])) * (1 - smooth((t - T.s139) / .4)) : 0;
      em = E.enthroned(x, P, { x: TX, y: TY, s: ES, col: P.ink, arm: dropped ? .15 : armK, cup: dropped ? 0 : smooth((t - DRINK[0]) / (DRINK[1] - DRINK[0])) * (1 - smooth((t - SLIP + .3) / .3)), crown: t < CROWN[0] });
      E.servant(x, P, { x: SV[0] + 60, y: FY, s: 2.3, col: P.ink, lift: smooth((t - .05) / .5) * (1 - smooth((t - T.s139) / .6)) });
      E.candle(x, P, CX, CY, CS, flame(t));
      const cupAt = (() => {
        if (t < DRINK[0] - .1) return null;
        if (t < SLIP) return { p: [em.hand[0] + 8, em.hand[1] - 8], a: -.3 * smooth((t - DRINK[0]) / .4) };
        const u = clamp((t - SLIP) / .35), start = [em.hand[0] + 8, em.hand[1] - 8], land = [em.hand[0] + 50, FY - 10];
        if (u < 1) return { p: [lerp(start[0], land[0], u), lerp(start[1], land[1], u * u)], a: u * 2 };
        const r = t - SLIP - .35, d = 140 * (1 - Math.exp(-r * 2.4));
        return { p: [land[0] + d, land[1]], a: 2 + d / 12 };
      })();
      pool = t > SLIP + .3 ? smooth((t - SLIP - .3) / .9) : 0;
      if (pool > 0) { x.fillStyle = mix(E.SILVER, P.sheet, .25); x.beginPath(); x.ellipse(em.hand[0] + 110, FY + 8, 120 * pool, 14 * pool, 0, 0, TAU); x.fill(); }
      if (cupAt) { x.save(); x.translate(cupAt.p[0], cupAt.p[1]); x.rotate(cupAt.a); x.fillStyle = mix(P.amberDark, P.ink, .3); x.beginPath(); x.moveTo(-14, -16); x.lineTo(14, -16); x.lineTo(8, 8); x.lineTo(-8, 8); x.fill(); if (t < SLIP) { x.fillStyle = E.SILVER; x.beginPath(); x.ellipse(0, -15, 13, 3.5, 0, 0, TAU); x.fill(); } x.restore(); }
      if (t >= CROWN[0]) {
        const u = clamp((t - CROWN[0]) / (CROWN[1] - CROWN[0])), hp = [em.head[0] - 2 * ES, em.head[1] - 14 * ES];
        const p = [lerp(hp[0], CROWN_END[0], u), lerp(hp[1], CROWN_END[1], u * u) - (u > .85 ? Math.sin((u - .85) / .15 * Math.PI) * 12 : 0)];
        E.crown(x, p[0], p[1], ES * .62, lerp(0, Math.PI, easeOutBack(u, 1.2)), mix(P.ink, P.sheet, .35), mix(E.SILVER, P.sheet, .3));
      }
    }, { glow: .5 * light(t) + .2 });
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]);
    if (flame(t) > 0) PR.glow(ctx, CX, CY - 106 * CS, 330, P.glow, .45, 'lightbox');
    PR.glow(ctx, SV[0] + 60 + 38 * 2.3, FY - 105 * 2.3, 110, E.SILVER, .5 * smooth((t - .1) / .5) * (1 - smooth((t - T.s139) / .5)), 'lightbox');
    if (pool > 0) PR.glow(ctx, em.hand[0] + 110, FY, 360, E.SILVER, .42 * pool, 'lightbox');
    ctx.restore();
    if (fade > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${.92 * fade})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    B.words(L, ctx, 'NEXT', smooth((t - T.next + .05) / .3), { y: .3, size: PORT ? 150 : 170, band: false });
    L.grade(ctx, t);
  }
  F.scene('seq-36', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
