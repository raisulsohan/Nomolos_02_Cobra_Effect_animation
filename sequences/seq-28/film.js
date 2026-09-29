(function () {
  'use strict';
  const F = FILM, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-28'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;
  const T = { more: 2.221, footnote: 3.762 };
  const PW = PORT ? 860 : 1000, PH = PORT ? 1180 : 1300, grow = t => easeIO((t - T.more + .3) / (DUR - T.more + .1));
  function page(x, t) {
    const g = grow(t), paper = mix(P.card, P.cream, .35), ink = mix(P.ink, paper, .35);
    x.fillStyle = mix(paper, P.ink, .12); x.fillRect(-PW / 2 + 8, -PH / 2 + 10, PW, PH);
    x.fillStyle = paper; x.fillRect(-PW / 2, -PH / 2, PW, PH);
    x.save(); x.beginPath(); x.rect(-PW / 2, -PH / 2, PW, PH); x.clip();
    const push = g * PH * 1.1;
    x.fillStyle = ink; x.fillRect(-PW * .38, -PH * .42 - push, PW * .5, 26);
    for (let i = 0; i < 26; i++) { const y = -PH * .34 + i * 34 - push, len = i % 7 === 6 ? .45 : .76 + ((i * 37) % 10) / 100; x.fillRect(-PW * .38, y, PW * len, 9); }
    const s = lerp(1, 7.5, g), fy = lerp(PH * .4, 0, g);
    x.save(); x.translate(-PW * .38, fy); x.scale(s, s);
    x.fillStyle = ink; x.fillRect(0, -26, 120, 2);
    x.font = '600 12px NS'; x.textBaseline = 'middle'; x.fillText('1', 0, -8); x.fillRect(12, -10, 180, 4); x.fillRect(12, 2, 130, 4);
    x.save(); x.translate(lerp(215, 62, g), lerp(6, 30, g)); x.scale(.2 * lerp(1, 2.4, g), .2 * lerp(1, 2.4, g)); PR.cobraRear(x, P, { w: 26, rise: lerp(.55, 1, g), hood: lerp(.6, 1, g), view: 'front', sway: Math.sin(t * 2) * .05 * g }); x.restore();
    x.restore();
    x.restore();
    x.fillStyle = mix(paper, P.ink, .06); x.fillRect(-PW / 2, -PH / 2, 30, PH);
  }
  const cam = t => ({ x: lerp(-60, 0, grow(t)), y: lerp(PH * .3, 0, grow(t)), z: lerp(PORT ? 2.2 : 2.5, PORT ? 1.08 : .8, easeIO(t / 1.2) * .25 + .75 * grow(t)) });
  function draw(ctx, t) { L.background(ctx); L.sheet(ctx, cam(t), 1, [0, 0], x => page(x, t)); L.grade(ctx, t); }
  F.scene('seq-28', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
