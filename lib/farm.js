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

  FARM.lit = (P, k = 1) => {
    const Q = F.PAL.paper, warm = c => mix(mix(c, P.glow, .28), P.bgBot, .55 * (1 - k));
    return { ...P, card: warm(Q.card), parchment: warm(Q.parchment), cream: warm(Q.cream), ink: mix(Q.ink, P.ink, .4), sheet: warm(Q.sheet), sheet2: warm(Q.sheet2) };
  };
})();
