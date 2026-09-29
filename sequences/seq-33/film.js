(function () {
  'use strict';
  const F = FILM, E = F.emperor, B = F.bits, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-33'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { emperor: 2.214, unified: 2.935, powerful: 4.511, s133: C.s('S133').t0, conquered: 6.492 };
  const R = PORT ? 440 : 400, MC = [W / 2, H * (PORT ? .66 : .64)];
  const rise = t => easeIO((t - T.emperor) / 2.2), unify = t => easeIO((t - T.unified) / .9);
  const march = t => easeIO((t - T.conquered + .2) / 1.7), border = t => smooth((t - T.conquered - .6) / 1.1);
  function soldiers(x, t) {
    const m = march(t); if (m <= 0) return;
    for (let d = 0; d < 9; d++) {
      const a = d / 9 * TAU + .2, rr = lerp(.1, .72, m) * R, cx = Math.cos(a) * rr / 1.05, cy = Math.sin(a) * rr / 1.25;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) E.soldier(x, P, cx + (c - 1) * 14 - Math.cos(a) * r * 18, cy + r * 12 - Math.sin(a) * r * 14, 1.25, t * 12 + c + r);
    }
  }
  function draw(ctx, t) {
    const z = lerp(1, 1.05, smooth(t / DUR));
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z }, 1, [W / 2, H / 2], x => {
      const sil = mix(P.sheet2, P.sheetDim, .3);
      E.enthroned(x, P, { x: W / 2 + 80, y: H * (PORT ? .82 : 1.04) + (1 - rise(t)) * 800, s: PORT ? 4.2 : 5, col: sil });
    }, { shadow: false });
    L.sheet(ctx, { x: W / 2, y: H / 2, z }, 1, [W / 2, H / 2], x => {
      x.save(); x.translate(MC[0], MC[1]);
      E.kingdoms(x, P, { R, u: unify(t), border: border(t) });
      const cap = [E.CAPITAL[0] * R, E.CAPITAL[1] * R]; x.fillStyle = P.amber; x.beginPath(); x.arc(cap[0], cap[1], 12 * smooth((t - T.unified - .6) / .4), 0, TAU); x.fill();
      soldiers(x, t);
      x.restore();
    }, { flatShadow: [12, 16, 14, .45] });
    L.grade(ctx, t);
  }
  F.scene('seq-33', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { R, MC } });
})();
