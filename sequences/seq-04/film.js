(function () {
  'use strict';
  const F = FILM, MAP = F.citymap, { W, H, portrait: PORT } = F.format();
  const { clamp, smooth, easeIO, lerp, hash, easeOutBack } = F;
  const C = F.cues('seq-04'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { population: 0.518, fall: 1.553, end: 1.812 };

  const GONE = MAP.SNAKES.map((_, i) => i).filter(i => hash(i, 77) < .52).sort((a, b) => hash(a, 78) - hash(b, 78));
  const goneAt = new Map(GONE.map((i, k) => [i, lerp(T.population, T.end, k / (GONE.length - 1))]));
  const snakes = t => i => { const g = goneAt.get(i); if (g == null) return 1; const k = (t - g) / .16; return k < 0 ? 1 : k < .35 ? 1 + .25 * (k / .35) : Math.max(0, 1.25 * (1 - (k - .35) / .65)); };

  const CH = PORT ? { x: W * .5 - 230, y: H * .74, w: 460, h: 250 } : { x: W - 96 - 420, y: 70, w: 420, h: 250 };
  const LINE = [[0, .82], [.2, .8], [.45, .66], [.7, .5], [1, .38]];

  function cam(t) { const k = easeIO(clamp(t / 2.1)); return { x: PORT ? 20 : -120, y: PORT ? 170 : 20, z: (PORT ? .66 : .98) * lerp(1, 1.04, k) }; }

  function draw(ctx, t) {
    L.background(ctx);
    L.sheet(ctx, cam(t), 1, [0, 0], x => MAP.draw(x, P, { snakes: snakes(L.pose(t)), t: L.pose(t) }));
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      x.save(); x.translate(CH.x, CH.y);
      MAP.chart(x, P, { w: CH.w, h: CH.h, points: LINE, draw: smooth((t - T.population + .2) / (T.end - T.population + .3)), label: smooth(t / .25) });
      x.restore();
    }, { flatShadow: [10, 14, 12, .4] });
    L.grade(ctx, t);
  }

  F.scene('seq-04', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { cam, CH, LINE } });
})();
