(function () {
  'use strict';
  const F = FILM, { TAU, clamp, lerp } = F, mix = F.city.mix;
  const FARM = (F.farm = {});

  FARM.breeder = P => ({
    coat: mix(mix(P.sheet, P.cream, .1), P.ink, .36), trouser: mix(P.sheet, P.cream, .16), skin: mix(P.skin, P.amberDark, .3),
    head: 'cap', headColor: mix(P.cream, P.sheet, .55), shoe: mix(P.wood, P.ink, .3),
  });

  FARM.lantern = (x, P, s = 1, lit = 1) => {
    const metal = mix(P.wood, P.ink, .25), glass = mix(P.lampGlass, P.sheet, .15 * (1 - lit));
    x.save(); x.scale(s, s); x.lineCap = 'round';
    x.strokeStyle = metal; x.lineWidth = .9; x.beginPath(); x.arc(0, 4.6, 4.4, Math.PI * 1.08, Math.PI * 1.92); x.stroke();
    x.fillStyle = metal; x.beginPath(); x.moveTo(-3.8, 5.8); x.quadraticCurveTo(0, 2.6, 3.8, 5.8); x.lineTo(3.4, 6.6); x.lineTo(-3.4, 6.6); x.closePath(); x.fill();
    x.fillStyle = glass; x.beginPath(); x.ellipse(0, 10.6, 3.6, 4.4, 0, 0, TAU); x.fill();
    if (lit > 0) { x.fillStyle = mix(P.rim, '#ffffff', .4); x.beginPath(); x.ellipse(0, 11.4, .9 * lit, 1.8 * lit, 0, 0, TAU); x.fill(); }
    x.strokeStyle = metal; x.lineWidth = .6; x.beginPath(); x.moveTo(-3.4, 7); x.lineTo(-3.4, 14.2); x.moveTo(3.4, 7); x.lineTo(3.4, 14.2); x.stroke();
    x.fillStyle = metal; x.beginPath(); x.moveTo(-4.4, 14.4); x.lineTo(4.4, 14.4); x.lineTo(4, 17.6); x.lineTo(-4, 17.6); x.closePath(); x.fill();
    x.restore();
  };
  FARM.GLASS = [0, 10.6];

  FARM.hang = (prev, now, k = .045) => clamp(-(now[0] - prev[0]) * k, -.5, .5);

  FARM.lampGlow = (ctx, cx, cy, s, a = 1, look = 'lightbox') => {
    const PR = F.props, P = F.PAL[look] || F.PAL.lightbox;
    PR.glow(ctx, cx, cy, 170 * s, P.glow, .2 * a, look);
    PR.glow(ctx, cx, cy, 34 * s, P.lampGlass, .6 * a, look);
  };

  FARM.CAGE_DOOR = (w, h) => ({ x0: 0, x1: w / 2 - 4, y0: -h + 5, y1: -5 });
  FARM.cage = (x, P, o) => {
    const w = o.w ?? 64, h = o.h ?? 42, wood = mix(P.wood, P.cream, .14), dark = mix(P.wood, P.ink, .3), t = o.t || 0;
    if (o.part === 'back') {
      x.fillStyle = mix(P.sheet, P.wall, .55); x.fillRect(-w / 2 + 3, -h + 3, w - 6, h - 6);
      x.save(); x.beginPath(); x.rect(-w / 2 + 4, -h + 4, w - 8, h - 8); x.clip();
      for (let i = 0; i < (o.n ?? 2); i++) {
        const dir = i % 2 ? -1 : 1, head = [dir * (w * .18 + Math.sin(t * 1.3 + i * 2.1 + (o.seed || 0)) * w * .12), -8 - i * 9];
        F.props.cobraBody(x, P, F.props.slitherPath(head, w * .9, { dir, amp: 3.2, k: TAU / (w * .45), phase: t * 4 + i * 1.7 }), { w: 5.4, belly: dir, eye: 0 });
      }
      x.restore();
      return;
    }
    x.fillStyle = dark; x.fillRect(-w / 2, -h, w, 4); x.fillRect(-w / 2, -4, w, 4); x.fillRect(-w / 2, -h, 4, h); x.fillRect(w / 2 - 4, -h, 4, h);
    x.fillStyle = wood; for (let k = 1; k < 4; k++) x.fillRect(-w / 2 + k * (w / 2) / 4 - 1.2, -h + 4, 2.4, h - 8);
    x.strokeStyle = dark; x.lineWidth = 1.6; x.beginPath(); x.arc(0, -h - 1, w * .18, Math.PI, 0); x.stroke();
    const a = Math.PI * .92 * clamp(o.door || 0), c = Math.cos(a), dw = (w / 2 - 4) * c, face = c >= 0;
    x.save(); x.translate(0, 0); x.scale(face ? 1 : -1, 1);
    const ww = Math.abs(dw);
    x.fillStyle = face ? dark : mix(dark, P.ink, .25); x.fillRect(0, -h + 4, 2.5, h - 8); x.fillRect(Math.max(0, ww - 2.5), -h + 4, 2.5, h - 8);
    x.fillStyle = face ? wood : mix(wood, P.ink, .3); for (let k = 1; k < 4; k++) x.fillRect(ww * k / 4 - 1.1, -h + 4, 2.2, h - 8);
    x.fillStyle = face ? dark : mix(dark, P.ink, .25); x.fillRect(0, -h + 4, ww, 2.5); x.fillRect(0, -7, ww, 2.5);
    x.restore();
    const la = 1.9 * clamp(o.latch || 0);
    x.save(); x.translate(w / 2 - 2, -h * .55); x.rotate(la);
    x.strokeStyle = mix(P.wood, P.ink, .55); x.lineWidth = 1.4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 0); x.lineTo(-9, 0); x.lineTo(-9, 2.6); x.stroke(); x.lineCap = 'butt';
    x.restore();
    x.fillStyle = mix(P.wood, P.ink, .55); x.beginPath(); x.arc(w / 2 - 2, -h * .55, 1.3, 0, TAU); x.fill();
  };
  FARM.LATCH = (w, h) => [w / 2 - 7, -h * .55];

  FARM.lit = (P, k = 1) => {
    const Q = F.PAL.paper, warm = c => mix(mix(c, P.glow, .28), P.bgBot, .55 * (1 - k));
    return { ...P, card: warm(Q.card), parchment: warm(Q.parchment), cream: warm(Q.cream), ink: mix(Q.ink, P.ink, .4), sheet: warm(Q.sheet), sheet2: warm(Q.sheet2) };
  };
})();
