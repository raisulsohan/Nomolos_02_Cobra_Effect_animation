(function () {
  'use strict';
  const F = FILM, CS = F.cases, B = F.bits, M = F.motion, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-17b'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const S17 = F.getScene('seq-17').api, S7 = F.getScene('seq-07').api, CH = F.getScene('seq-04').api.CH, C7 = F.cues('seq-07');
  const T = { name: 1, s88: C.s('S088').t0, economist: 1.905, cobra: 3.539, s89: C.s('S089').t0, broader: 5.595,
    people89: 7.099, s90: C.s('S090').t0, target: 10.423, stops: 11.075, s91: C.s('S091').t0, optimize: 13.961,
    watching: 15.194, abandoning: 17.228, goal: 17.901 };
  const JOIN = [.05, 1.2], FADE = [1.1, 1.8], GROW = [1.5, 2.7], BOOK = [T.economist, T.economist + .45];
  const REAR7 = [6.554 - .75, 6.554 - .1], REAR = [T.cobra - .75, T.cobra - .1];
  const SHRINK = [T.s89 + .05, T.s89 + 1.1], OPEN = [T.s90 + .05, T.s90 + .9], STRETCH = [T.stops - .1, T.stops + 1.3];

  const mid = PORT ? { x: 60, y: H / 2 - (H / 2 - 95) / 2, w: W - 120, h: H / 2 - 95 } : { x: W / 2 - S17.SPLIT.a.w / 2, y: 150, w: S17.SPLIT.a.w, h: 700 };
  const C0 = S17.cardAt(mid);
  const BIG = PORT ? { w: W * .78 } : { w: W * .44 }, CX = W / 2 + (PORT ? 0 : W * .06), CY = H * (PORT ? .42 : .46);
  const R = Math.min(W, H) * (PORT ? .38 : .36);
  function card(t) {
    const g = easeIO((t - GROW[0]) / (GROW[1] - GROW[0])), s = easeIO((t - SHRINK[0]) / (SHRINK[1] - SHRINK[0]));
    const bw = lerp(lerp(C0.w, BIG.w, g), R * .95, s), bh = bw * CH.h / CH.w;
    const cx = lerp(lerp(C0.x + C0.w / 2, CX, g), W / 2, s), cy = lerp(lerp(C0.y + C0.h / 2, CY, g), H * .47, s);
    return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
  }
  const t7 = t => lerp(REAR7[0], REAR7[1], clamp((t - REAR[0]) / (REAR[1] - REAR[0]))) + Math.max(0, t - REAR[1]);

  const GY = H * (PORT ? .74 : .8), SX = W * (PORT ? .3 : .36), RX = W * (PORT ? .52 : .5), RS = PORT ? 1.35 : 1.65;
  const stretch = t => .95 * easeIO((t - STRETCH[0]) / (STRETCH[1] - STRETCH[0])) + .55 * easeIO((t - T.optimize) / (T.watching + .6 - T.optimize)) + .2 * smooth((t - T.goal) / 1.5);
  const droop = t => smooth((t - T.abandoning) / 1.4);
  const CAST = F.rulers.cast(P), FS = PORT ? 2 : 2.5, WATCH = [[.72, 'minister', 1], [.8, 'boss', 1], [.89, 'mother', 1], [.94, 'toddler', F.rulers.TODDLER]];
  function watchers(x, t, k) {
    if (k <= 0) return;
    const tp = M.pose(t);
    WATCH.forEach(([u, who, s], i) => {
      const kk = smooth((t - T.s91 - .1 - i * .15) / .5); if (kk <= 0) return;
      const p = { ...M.idle({ x: 0, seed: 30 + i })(tp) }; p.head = (p.head || 0) - .22;
      x.save(); x.globalAlpha = kk * k; x.translate(W * u + (1 - kk) * 120, GY); x.scale(FS * s, FS * s); M.draw(x, P, p, { ...CAST[who], dir: -1, shadow: 0 }); x.restore();
    });
  }
  function rule(x, t, k) {
    if (k <= 0) return;
    x.save(); x.globalAlpha = k;
    x.fillStyle = mix(P.sheet2, P.ink, .2); x.fillRect(0, GY, W, H - GY);
    CS.pot(x, P, SX, GY - 76 * RS, RS);
    CS.seedling(x, P, { x: SX, y: GY - 80 * RS, h: 120 * RS, droop: droop(t), k: 1 - .45 * droop(t) });
    x.save(); x.translate(RX, GY); x.scale(RS, RS);
    CS.ruler(x, P, { x: 0, y: 0, len0: 180, stretch: stretch(t), target: smooth((t - T.target) / .3), pull: F.env(t, STRETCH[0], STRETCH[0] + .3, T.watching + .4, T.watching + .9) });
    x.restore();
    x.restore();
  }

  function draw(ctx, t) {
    const j = easeIO((t - JOIN[0]) / (JOIN[1] - JOIN[0])), fade = smooth((t - FADE[0]) / (FADE[1] - FADE[0])), open = easeIO((t - OPEN[0]) / (OPEN[1] - OPEN[0]));
    S17.stage(ctx, S17.DUR, { join: j, fade });
    const b = card(t), cardK = smooth((t - GROW[0] + .3) / .3) * (1 - open);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      const ck = smooth((t - SHRINK[0] - .3) / .6) * (1 - open);
      if (ck > 0) {
        x.save(); x.globalAlpha = ck; const rr = R * lerp(.8, 1, ck) * (1 + open * .8);
        x.strokeStyle = P.amber; x.lineWidth = 10; x.beginPath(); x.arc(W / 2, H * .47, rr, 0, TAU); x.stroke();
        x.strokeStyle = F.rgba(F.hex(P.amber), .35); x.lineWidth = 2; x.beginPath(); x.arc(W / 2, H * .47, rr - 22, 0, TAU); x.stroke();
        const gk = smooth((t - T.broader) / .4); if (gk > 0) { x.globalAlpha = ck * gk; CS.arcText(x, "GOODHART'S LAW", W / 2, H * .47, rr + 40, -Math.PI / 2, PORT ? 50 : 58, P.cream); }
        x.globalAlpha = ck;
        ['tail', 'coin', 'clipboard', 'report', 'stopwatch'].forEach((kind, i) => {
          const a = [Math.PI * .95, Math.PI * .7, Math.PI * .5, Math.PI * .3, Math.PI * .05][i], ek = easeOutBack(clamp((t - T.people89 + .6 - i * .28) / .3), 2);
          if (ek > .001) CS.emblem(x, P, kind, W / 2 + Math.cos(a) * rr, H * .47 + Math.sin(a) * rr, 46 * ek * (PORT ? .9 : 1));
        });
        x.restore();
      }
      if (cardK > 0 && t > FADE[0]) {
        x.save(); x.globalAlpha = cardK; x.translate(b.x, b.y); x.scale(b.w / CH.w, b.w / CH.w);
        S7.chart(x, t7(t)); x.restore();
      }
      const bIn = clamp((t - BOOK[0]) / (BOOK[1] - BOOK[0])), bk = bIn > 0 ? easeOutBack(bIn, 1.3) * (1 - smooth((t - SHRINK[0]) / .5)) : 0;
      if (bk > 0) CS.book(x, P, { x: PORT ? W * .5 : b.x - 150, y: PORT ? b.y + b.h + 170 : b.y + b.h / 2 - (1 - bk) * 300, s: PORT ? .9 : 1.05, a: -.06 });
      rule(x, t, open);
      watchers(x, t, open);
    }, { flatShadow: [10, 14, 12, .4] });
    B.words(L, ctx, 'THE COBRA EFFECT', F.env(t, T.cobra - .02, T.cobra + .3, SHRINK[0], SHRINK[0] + .4), { y: PORT ? .9 : .9 });
    L.grade(ctx, S17.DUR + t);
  }

  F.scene('seq-17b', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { rule, GY, SX, RX, RS, stretch } });
})();
