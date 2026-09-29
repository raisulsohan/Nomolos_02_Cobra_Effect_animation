(function () {
  'use strict';
  const F = FILM, { clamp, TAU } = F;
  const G = (F.goal = {});
  const arcPts = (cx, cy, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const CITY = [
    [[-58, 0], [58, 0]],
    [[-52, 0], [-52, -26], [-48, -26], [-48, -29], [-43, -29], [-43, -26], [-37, -26], [-37, -29], [-32, -29], [-32, -26], [-28, -26], [-28, 0]],
    [[-26, 0], [-26, -20], [-2, -20], [-2, 0]],
    [[-24, -20], ...arcPts(-14, -20, 10, Math.PI, TAU), [-4, -20]],
    [[-14, -30], [-14, -35]],
    [[1, 0], [1, -52], [2.5, -56], [5.5, -56], [7, -52], [7, 0]],
    [[0, -46], [8, -46]],
    [[10, 0], [10, -34], [32, -34], [32, 0]],
    [[17, 0], [17, -9], ...arcPts(21, -9, 4, Math.PI, TAU, 6), [25, 0]],
    [[13, -24], [13, -28], [16, -28], [16, -24]], [[26, -24], [26, -28], [29, -28], [29, -24]],
    [[34, 0], [34, -18], [52, -18], [52, 0]],
    [[36, -18], ...arcPts(43, -18, 7, Math.PI, TAU, 8), [50, -18]],
    [[-45, -14], [-45, -19], [-41, -19], [-41, -14]], [[-19, -8], [-19, -13], ...arcPts(-14, -13, 5, Math.PI, TAU, 6), [-9, -13], [-9, -8]],
  ];
  const LEN = CITY.map(p => p.reduce((s, q, i) => i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0, 0)), TOTAL = LEN.reduce((a, b) => a + b, 0);
  G.CITY = { w: 116, h: 58 };
  function partial(x, pts, len) {
    x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && len > 0; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), u = Math.min(1, len / d);
      x.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u); len -= d;
    }
  }
  G.city = (x, P, o) => {
    const k = clamp(o.k ?? 1), s = o.s ?? 1, a = clamp(o.alpha ?? 1); if (k <= 0 || a <= 0) return;
    const m = x.getTransform(), px = Math.hypot(m.a, m.b) * s || 1;
    const path = () => { x.beginPath(); let left = k * TOTAL; CITY.forEach((p, i) => { if (left > 0) partial(x, p, left); left -= LEN[i]; }); };
    x.save(); x.translate(o.x, o.y); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
    if (o.blur) x.filter = `blur(${o.blur}px)`;
    const dash = (o.dash ?? 5) / px;
    path(); x.setLineDash([]); x.globalAlpha = .22 * a; x.strokeStyle = '#5a4630'; x.lineWidth = 4.2 / px; x.stroke();
    path(); x.setLineDash([dash, dash * .75]); x.globalAlpha = .55 * a; x.strokeStyle = '#ffe9b8'; x.lineWidth = 7 / px; x.shadowColor = 'rgba(255,236,190,.9)'; x.shadowBlur = 14; x.stroke();
    x.shadowBlur = 0; x.globalAlpha = a; x.strokeStyle = '#fff6e2'; x.lineWidth = 2.3 / px; x.stroke();
    x.restore();
  };
})();
