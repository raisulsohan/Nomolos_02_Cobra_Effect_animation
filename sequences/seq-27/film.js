(function () {
  'use strict';
  const F = FILM, PR = F.props, M = F.motion, B = F.bits, HN = F.hanoi, FARM = F.farm, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-27'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;
  const T = { practical: 5.163, rational: 9.95, s118: C.s('S118').t0, incentive: 11.978, s119: C.s('S119').t0,
    s120: C.s('S120').t0, rule: 19.773, paid: 20.872, wanted: 23.016 };
  const SUIT = '#d9ceb4', HC = HN.cast(P);
  const SITTERS = [
    { x: -1050, look: { coat: SUIT, trouser: mix(SUIT, P.ink, .12), skin: '#e0bf9c', head: 'bare', hair: '#2e2622', moustache: '#2e2622', shoe: P.ink, shadow: 0 }, word: 'PRACTICAL', at: 0 },
    { x: -650, look: HC.resident, word: 'PRACTICAL', at: 0 },
    { x: -250, look: FARM.breeder(P), word: 'RATIONAL', at: 1 },
    { x: 150, look: HC.catcher, word: 'RATIONAL', at: 1 },
  ];
  const FW = 280, FH = 340, FY = -560, CASE = [900, 0];
  const Z = PORT ? .62 : .9;
  const cam = B.cam([[0, -1300, -330, Z * 1.05], [T.s116 = C.s('S116').t0, -450, -330, Z * .86], [T.s119, -450, -330, Z * .88], [T.s120 - .1, 860, -330, Z], [DUR, 880, -300, Z * 1.08]]);

  const coinX = t => -450 + Math.sin((t - T.s118 - .4) * 1.05 - Math.PI / 2) * 620 * smooth((t - T.s118) / .8);
  const coinK = t => F.env(t, T.s118 - .1, T.s118 + .5, T.s119 + .4, T.s119 + 1);
  function wallAndFloor(x) {
    x.fillStyle = mix(P.wall, P.cream, .4); x.fillRect(-2600, -1600, 5200, 1600);
    x.fillStyle = mix(P.wall, P.wood, .25); x.fillRect(-2600, -90, 5200, 90);
    x.fillStyle = mix(P.wood, P.cream, .15); x.fillRect(-2600, 0, 5200, 700);
    x.strokeStyle = mix(P.wood, P.ink, .2); x.lineWidth = 3; for (let k = -30; k < 30; k++) { x.beginPath(); x.moveTo(k * 120, 0); x.lineTo(k * 150, 700); x.stroke(); }
  }
  function portrait(x, s, i, t) {
    const tp = M.pose(t), cx = s.x;
    x.fillStyle = mix(P.wood, P.amberDark, .3); x.fillRect(cx - FW / 2 - 22, FY - 22, FW + 44, FH + 44);
    x.fillStyle = mix(P.sheet2, P.cream, .45); x.fillRect(cx - FW / 2, FY, FW, FH);
    x.save(); x.beginPath(); x.rect(cx - FW / 2, FY, FW, FH); x.clip();
    const p = { ...M.idle({ x: 0, seed: 90 + i })(tp), yaw: Math.PI / 2 }, ck = coinK(t);
    p.headYaw = Math.PI / 2 - clamp((coinX(t) - cx) / 500, -1, 1) * .75 * ck;
    x.translate(cx, FY + FH + 330); x.scale(6, 6); M.draw(x, P, p, { ...s.look, shadow: 0 });
    x.restore();
    const on = smooth((t - (s.at ? T.rational : T.practical)) / .3), brass = mix(P.amberDark, P.wood, .2);
    x.fillStyle = mix(brass, P.ink, .25); x.fillRect(cx - 118, FY + FH + 44, 236, 56);
    x.fillStyle = mix(brass, P.amber, on * .6); x.fillRect(cx - 114, FY + FH + 40, 228, 56);
    if (on > 0) { x.globalAlpha = on; x.fillStyle = P.ink; x.font = '900 34px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.word, cx, FY + FH + 70); x.globalAlpha = 1; }
  }
  function coin(x, t) {
    const k = coinK(t); if (k <= 0) return;
    const cx = coinX(t), top = -1300, cy = -460, a = Math.atan2(cx - (-450), top - cy);
    x.globalAlpha = k; x.strokeStyle = mix(P.ink, P.cream, .3); x.lineWidth = 2; x.beginPath(); x.moveTo(-450, top); x.lineTo(cx, cy); x.stroke();
    PR.coin(x, P, 'paper', cx, cy, 24, .15 + .1 * Math.sin(t * 3)); x.globalAlpha = 1;
  }
  function vitrine(x, t) {
    const [vx] = CASE, rise = smooth((t - T.rule + .2) / 1.4);
    x.save(); x.globalAlpha = .34 * smooth((t - T.s120 + .3) / 1); x.translate(vx + 80, -200); x.scale(3.6, 3.6);
    const sh = mix(P.ink, P.wall, .25); PR.cobraRear(x, { ...P, ink: sh, sheet: sh, cream: sh, rim: sh, amber: sh, skin: sh }, { w: 18, rise: .35 + .65 * rise, hood: rise, view: 'back', sway: Math.sin(t * 1.3) * .05 });
    x.restore();
    x.fillStyle = mix(P.wall, P.ink, .12); x.fillRect(vx - 90, -260, 180, 260); x.fillStyle = mix(P.wall, P.cream, .1); x.fillRect(vx - 110, -280, 220, 26);
    x.save(); x.translate(vx, -420); PR.poster(x, P, 'paper', { w: 150, h: 200, ink: 1, print: 1, reward: 1, cobra: 1, coin: 1 }); x.restore();
    x.fillStyle = F.rgba(F.hex(P.glass), .18); x.fillRect(vx - 105, -560, 210, 280); x.strokeStyle = F.rgba(F.hex(P.rim), .8); x.lineWidth = 3; x.strokeRect(vx - 105, -560, 210, 280);
    x.strokeStyle = F.rgba(F.hex(P.rim), .5); x.beginPath(); x.moveTo(vx - 80, -540); x.lineTo(vx - 30, -500); x.stroke();
    for (let k = 0; k < 16; k++) {
      const tk = T.paid - .2 + k * .22, u = (t - tk) / .5; if (u < 0) continue;
      const side = k % 2 ? 1 : -1, ex = vx + side * (130 + (k % 5) * 18), ey = 12 + (k % 3) * 8;
      if (u < 1) PR.coin(x, P, 'paper', lerp(vx + side * 90, ex, u), lerp(-270, ey, u * u), 11, .6 + .4 * Math.sin(u * 12));
      else PR.coin(x, P, 'paper', ex, ey, 11, 1);
    }
  }
  function draw(ctx, t) {
    const c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => { wallAndFloor(x); SITTERS.forEach((s, i) => portrait(x, s, i, t)); vitrine(x, t); coin(x, t); });
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); PR.glow(ctx, CASE[0], -420, 420, P.glow, .22 * smooth((t - T.s119) / 1.5), 'paper'); ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-27', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
