(function () {
  'use strict';
  const F = FILM, PL = F.plain, G = F.goal, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-23'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { crowd: 0.479, number: 2.205, path: 3.37, easiest: 3.826, opposite: 6.412, wanted: 8.122 };
  const TOWN = [1080, -40], TAG = [-1060, 60], ARROW = { x0: -520, x1: 760, y: -40, w: 46, hw: 104, hl: 86 };
  const cam = t => ({ x: lerp(60, -120, smooth((t - T.path) / 5)), y: PORT ? 60 : 20, z: (PORT ? .42 : .7) * lerp(1.06, .95, smooth(t / DUR)) });

  const LOOKS = F.rulers.crowd(P, 64);
  const PEOPLE = LOOKS.map((c, i) => {
    const col = i % 16, row = Math.floor(i / 16), S = [-420 + col * 62 + (hash(i, 1) - .5) * 30, -170 + row * 64 + (hash(i, 2) - .5) * 26 + (row > 1 ? 120 : 0)];
    const E = [TAG[0] + 60 + Math.cos(i * 2.4) * (90 + (i % 5) * 34), TAG[1] + Math.sin(i * 2.4) * (80 + (i % 5) * 30)];
    const via = [lerp(S[0], E[0], .5), 520 + hash(i, 3) * 200];
    const L0 = (() => { let s = 0, p = S; for (let k = 1; k <= 20; k++) { const q = bez(S, via, E, k / 20); s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return s; })();
    return { S, E, via, L0, s: .95 + hash(i, 4) * .2, look: c.look, t0: T.number + .1 + hash(i, 5) * .8 + col * .03, v: 330 + hash(i, 6) * 60 };
  });
  function bez(a, b, c, u) { const m = 1 - u; return [m * m * a[0] + 2 * m * u * b[0] + u * u * c[0], m * m * a[1] + 2 * m * u * b[1] + u * u * c[1]]; }
  const runD = (t, t0, rise) => t < t0 ? 0 : t - t0 < rise ? (t - t0) * (t - t0) / (2 * rise) : t - t0 - rise / 2;
  function personAt(p, t) {
    const d = Math.min(p.L0, p.v * runD(t, p.t0, .5)), u = d / p.L0;
    if (d <= 0) { const turn = smooth((t - T.number + .1) / .35); const h0 = Math.atan2(ARROW.y - p.S[1] + 1, 900) * .2, h1 = Math.atan2(TAG[1] - p.S[1], TAG[0] - p.S[0]); return { x: p.S[0], y: p.S[1], h: lerp(h0, h1 < 0 ? h1 + TAU : h1, turn), run: 0, ph: 0 }; }
    const a = bez(p.S, p.via, p.E, Math.max(0, u - .01)), b = bez(p.S, p.via, p.E, Math.min(1, u + .01)), at = bez(p.S, p.via, p.E, u);
    const arrived = d >= p.L0 ? clamp((t - p.t0 - p.L0 / p.v - .25) / .3) : 0, hRun = Math.atan2(b[1] - a[1], b[0] - a[0]), hTag = Math.atan2(TAG[1] - at[1], TAG[0] - at[0]);
    return { x: at[0], y: at[1], h: arrived > 0 ? lerp(hRun, hTag + (hTag - hRun > Math.PI ? -TAU : hTag - hRun < -Math.PI ? TAU : 0), arrived) : hRun, run: 1 - arrived, ph: d * TAU / 46 };
  }
  function tag(x, t) {
    const k = clamp((t - T.number + .1) / .35); if (k <= 0) return;
    const s = lerp(1.6, 1, easeOutBack(k, 1.6)); x.save(); x.translate(TAG[0], TAG[1]); x.scale(s, s); x.globalAlpha = clamp(k * 2);
    x.fillStyle = F.rgba([0, 0, 0], .25); x.fillRect(-116, -38, 250, 96);
    x.fillStyle = P.amber; x.beginPath(); x.moveTo(-130, -50); x.lineTo(80, -50); x.lineTo(124, 0); x.lineTo(80, 50); x.lineTo(-130, 50); x.closePath(); x.fill();
    x.fillStyle = P.cream; x.beginPath(); x.arc(84, 0, 11, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.font = '900 64px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('10,000', -24, 4);
    x.restore();
  }
  function draw(ctx, t) {
    const c = cam(t), tp = F.motion.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => {
      PL.ground(x, P, { x0: -3200, y0: -2000, x1: 3200, y1: 2000, top: -2000 });
      PL.arrow(x, P, { ...ARROW, u: 1 });
      G.city(x, P, { x: TOWN[0], y: TOWN[1] + 40, s: 3.4, k: 1, blur: 4, alpha: 1 });
      tag(x, t);
      const q = PEOPLE.map(p => ({ p, ...personAt(p, tp) })).sort((a, b) => a.y - b.y);
      for (const o of q) PL.shadow(x, P, { x: o.x, y: o.y, s: o.p.s * 2.4 });
      for (const o of q) PL.person(x, P, { x: o.x, y: o.y, h: o.h, s: o.p.s * 2.4, look: o.p.look, run: o.run, ph: o.ph });
    }, { flatShadow: [10, 14, 12, .35] });
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); PR.glow(ctx, TOWN[0], TOWN[1] - 60, 420, P.glow, .22, 'flat'); ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-23', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
