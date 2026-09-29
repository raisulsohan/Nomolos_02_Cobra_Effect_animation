(function () {
  'use strict';
  const F = FILM, E = F.emperor, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-34'), DUR = C.duration;
  const L = F.look('lightbox', W, H), P = L.P;
  const T = { enemy: 0.865, defeat: 2.379, death: C.s('S135').t0 };
  const [TX, TY] = E.HALL.throne, [CX, CY] = E.HALL.candle, ES = 2.6, CS = 2.2;
  const cam = t => ({ x: PORT ? -40 : 20, y: PORT ? -20 : -40, z: (PORT ? .62 : .95) * lerp(1, 1.06, smooth(t / DUR)) });
  const gutter = t => F.env(t, T.death - .05, T.death + .1, DUR - .3, DUR + 1);
  const flame = t => 1 - .55 * gutter(t) * (.5 + .5 * Math.sin(t * 31)) + .05 * Math.sin(t * 9);
  function draw(ctx, t) {
    const c = cam(t), fl = flame(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => {
      E.hall(x, P, .8 + .2 * fl);
      const sh = F.rgba([4, 3, 14], .55 + .1 * (1 - fl));
      const lean = easeIO((t - T.death) / .9), dk = smooth((t - T.enemy) / 1.3);
      x.save(); x.globalAlpha = dk; x.translate(TX - 330 + lean * 80, TY - 40); x.rotate(.12 * lean); E.robed(x, P, { x: 0, y: 0, s: 3.9, col: sh }); x.restore();
      E.enthroned(x, P, { x: TX - 230 + Math.sin(t * 30) * 2 * gutter(t), y: TY - 60, s: ES * 1.35, col: sh });
      E.enthroned(x, P, { x: TX, y: TY, s: ES, col: P.ink });
      E.candle(x, P, CX, CY, CS, fl);
    }, { glow: .5 });
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); PR.glow(ctx, CX, CY - 106 * CS, 320 * (.8 + .2 * fl), P.glow, .45 * fl, 'lightbox'); ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-34', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
