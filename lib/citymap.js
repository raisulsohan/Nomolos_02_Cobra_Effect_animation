(function () {
  'use strict';
  const F = FILM, { TAU, rng, lerp, clamp, smooth } = F, PR = F.props, mix = F.city.mix;
  const M = (F.citymap = {});

  const OUT = [[-760, -260], [-640, -420], [-380, -470], [-80, -440], [220, -470], [480, -400], [600, -250], [640, -40], [610, 200], [480, 380], [180, 450], [-160, 440], [-480, 380], [-700, 200], [-790, -20]];
  const RIVER = [[760, -620], [720, -300], [780, -40], [700, 260], [760, 620]];
  const r0 = rng(202);
  const BLOCKS = [];
  for (let gy = -440; gy < 440; gy += 70) for (let gx = -780; gx < 640; gx += 90) {
    const w = 60 + r0() * 34, h = 44 + r0() * 22, x = gx + r0() * 20, y = gy + r0() * 16 + (gx % 180 ? 10 : 0);
    if (r0() < .08) continue;
    BLOCKS.push([x, y, w, h]);
  }
  const DOMES = [[-120, -40, 40], [260, 120, 26], [-420, 210, 22], [120, -300, 24], [-560, -200, 20], [420, -180, 18]];
  const r1 = rng(303);
  M.SNAKES = Array.from({ length: 34 }, () => [-700 + r1() * 1300, -400 + r1() * 800, r1() * TAU]);
  M.YARDS = [[-330, -120], [180, 260], [-560, 120], [360, -300], [60, -40], [-160, 320]];

  function inside(px, py) { let c = false; for (let i = 0, j = OUT.length - 1; i < OUT.length; j = i++) { const [xi, yi] = OUT[i], [xj, yj] = OUT[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; }

  function mark(x, P, cx, cy, ang, k, wig) {
    if (k <= 0) return;
    x.save(); x.translate(cx, cy); x.rotate(ang); x.scale(k, k);
    const pts = []; for (let i = 0; i < 16; i++) { const u = i / 15; pts.push([22 - u * 44, Math.sin(u * 7 + wig) * 5]); }
    PR.cobraBody(x, P, pts, { w: 6.5, head: 'side' });
    x.restore();
  }

  M.draw = (x, P, o = {}) => {
    const t = o.t || 0;
    x.fillStyle = mix(P.sheet, P.sheetShade, .5); x.fillRect(-2400, -2000, 4800, 4000);
    x.strokeStyle = P.glass; x.lineWidth = 90; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); RIVER.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
    x.strokeStyle = mix(P.glass, P.sheet, .5); x.lineWidth = 8; x.stroke();
    x.fillStyle = mix(P.sheetShade, P.ink, .12); F.polyPath(x, OUT); x.fill();
    x.lineWidth = 14; x.strokeStyle = mix(P.sheetShade, P.ink, .3); x.stroke();
    x.save(); F.polyPath(x, OUT); x.clip();
    x.fillStyle = P.sheet;
    for (const [bx, by, bw, bh] of BLOCKS) if (inside(bx + bw / 2, by + bh / 2)) x.fillRect(bx, by, bw, bh);
    x.fillStyle = mix(P.glass, P.sheet, .45); x.fillRect(-60, 60, 150, 110); x.strokeStyle = P.sheetShade; x.lineWidth = 6; x.strokeRect(-60, 60, 150, 110);
    for (const [dx, dy, dr] of DOMES) { x.fillStyle = mix(P.sheet, P.rim, .4); x.beginPath(); x.arc(dx, dy, dr, 0, TAU); x.fill(); x.fillStyle = P.sheetShade; x.beginPath(); x.arc(dx + dr * .2, dy + dr * .2, dr * .7, 0, TAU); x.fill(); }
    x.restore();
    x.lineCap = 'butt'; x.lineJoin = 'miter';
    M.SNAKES.forEach(([sx, sy, a], i) => {
      const k = typeof o.snakes === 'function' ? o.snakes(i) : 1;
      mark(x, P, sx, sy, a, k, t * 3 + i);
    });
    if (o.more > 0) {
      const r = rng(404);
      for (let i = 0; i < 90; i++) {
        const [yx, yy] = M.YARDS[i % M.YARDS.length], a = r() * TAU, d = (40 + r() * 320) * smooth(clamp(o.more * 1.6 - i / 90 * .6));
        const k = smooth(clamp((o.more - i / 150) * 5));
        mark(x, P, yx + Math.cos(a) * d, yy + Math.sin(a) * d * .8, a + Math.PI / 2, k, t * 3 + i);
      }
    }
  };

  M.chart = (x, P, o) => {
    const { w, h } = o, look = o.look || 'flat', pad = w * .1, ax0 = pad, ax1 = w - pad * .6, ay0 = h - pad * .9, ay1 = pad * 1.5;
    if (F.keepClear) F.keepClear(x, ax0, ay1, ax1, ay0);
    x.fillStyle = P.card; x.fillRect(0, 0, w, h);
    x.strokeStyle = mix(P.card, P.ink, .6); x.lineWidth = 3; x.lineCap = 'butt';
    x.beginPath(); x.moveTo(ax0, ay1 - 10); x.lineTo(ax0, ay0); x.lineTo(ax1, ay0); x.stroke();
    const lab = o.label ?? 1;
    if (lab > 0) { x.globalAlpha = lab; x.fillStyle = mix(P.card, P.ink, .75); x.font = `600 ${h * .1}px NS`; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.fillText('COBRAS', ax0 + 8, ay1 - 18); x.globalAlpha = 1; }
    const X = u => lerp(ax0, ax1, u), Y = v => lerp(ay0, ay1, v);
    if (o.before != null && (o.beforeA ?? 1) > 0) {
      x.save(); x.globalAlpha = o.beforeA ?? 1; x.setLineDash([12, 9]); x.strokeStyle = mix(P.card, P.ink, .45); x.lineWidth = 3;
      x.beginPath(); x.moveTo(ax0, Y(o.before)); x.lineTo(ax1, Y(o.before)); x.stroke(); x.restore();
      if (o.beforeLabel > 0) { x.globalAlpha = o.beforeLabel; x.fillStyle = mix(P.card, P.ink, .7); x.font = `600 ${h * .085}px NS`; x.textAlign = 'right'; x.fillText('BEFORE', ax1, Y(o.before) - 10); x.globalAlpha = 1; x.textAlign = 'left'; }
    }
    const pts = o.points || [[0, .8], [1, .3]], d = clamp(o.draw ?? 1);
    if (d > 0) {
      x.strokeStyle = P.ink; x.lineWidth = w * .022; x.lineCap = 'round'; x.lineJoin = 'round';
      const seg = []; let total = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(X(pts[i][0]) - X(pts[i - 1][0]), Y(pts[i][1]) - Y(pts[i - 1][1])); seg.push(l); total += l; }
      let left = d * total; x.beginPath(); x.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (let i = 1; i < pts.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); x.lineTo(lerp(X(pts[i - 1][0]), X(pts[i][0]), f), lerp(Y(pts[i - 1][1]), Y(pts[i][1]), f)); left -= seg[i - 1]; }
      x.stroke(); x.lineCap = 'butt'; x.lineJoin = 'miter';
    }
  };
})();
