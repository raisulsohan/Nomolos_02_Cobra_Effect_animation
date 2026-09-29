(function () {
  'use strict';
  const F = FILM, { TAU, clamp, smooth, lerp, hash } = F, mix = F.city.mix;
  const E = (F.emperor = {});
  E.SILVER = '#dfe4ee';

  E.crown = (x, cx, cy, s, a, col, beads = col) => {
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(s, s);
    x.fillStyle = col; x.beginPath(); x.moveTo(-34, -4); x.lineTo(30, -8); x.lineTo(32, 0); x.lineTo(-32, 4); x.closePath(); x.fill();
    x.fillRect(-9, 0, 18, 12);
    x.strokeStyle = beads; x.lineWidth = 1.2;
    for (const [ex, n] of [[-30, 5], [27, 5]]) for (let k = 0; k < n; k++) {
      const bx = ex + (k - 2) * 1.6 * (ex < 0 ? -1 : 1); x.beginPath(); x.moveTo(bx, 0); x.lineTo(bx + (ex < 0 ? -1 : 1) * .8, 17); x.stroke();
      x.fillStyle = beads; for (let b = 0; b < 4; b++) { x.beginPath(); x.arc(bx + (ex < 0 ? -1 : 1) * .2 * b, 4 + b * 4, 1.3, 0, TAU); x.fill(); }
    }
    x.restore();
  };

  function arm(x, sh, k, cupK, col, w) {
    const a1 = lerp(.35, 1.35, k) - cupK * .2, el = [sh[0] + Math.sin(a1) * 30, sh[1] + Math.cos(a1) * 30];
    const a2 = lerp(.5, 1.5, k) + cupK * 1.9, hd = [el[0] + Math.sin(a2) * 28, el[1] + Math.cos(a2) * 28];
    x.strokeStyle = col; x.lineCap = 'round'; x.lineWidth = w; x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo(el[0], el[1]); x.lineTo(hd[0], hd[1]); x.stroke();
    x.fillStyle = col; x.beginPath(); x.arc(hd[0], hd[1], w * .55, 0, TAU); x.fill();
    return hd;
  }
  E.enthroned = (x, P, o = {}) => {
    const col = o.col || P.ink, s = o.s || 1, lean = o.lean || 0;
    x.save(); x.translate(o.x || 0, o.y || 0); x.scale(s, s);
    x.fillStyle = col; x.fillRect(-70, -8, 150, 8); x.fillRect(-60, -16, 130, 8);
    x.beginPath(); x.moveTo(-54, -16); x.lineTo(-54, -190); x.quadraticCurveTo(-40, -208, -26, -190); x.lineTo(-26, -70); x.lineTo(40, -70); x.lineTo(40, -16); x.fill();
    x.save(); x.translate(-10, -70); x.rotate(lean);
    x.beginPath(); x.moveTo(-24, 0); x.quadraticCurveTo(-30, -60, -8, -96); x.lineTo(14, -96); x.quadraticCurveTo(26, -60, 20, -8); x.lineTo(62, -6); x.lineTo(66, 52); x.lineTo(40, 54); x.lineTo(34, 16); x.lineTo(-20, 16); x.closePath(); x.fill();
    x.beginPath(); x.arc(4, -108, 13, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(12, -102); x.quadraticCurveTo(22, -94, 12, -84); x.lineTo(6, -96); x.fill();
    const head = [4, -108];
    if (o.crown !== false) E.crown(x, 2, -122, .62, -.06, col);
    const hand = arm(x, [6, -86], o.arm || 0, o.cup || 0, col, 10);
    x.restore(); x.restore();
    const L = (p) => [(o.x || 0) + (p[0] * Math.cos(lean) - p[1] * Math.sin(lean) - 10) * s, (o.y || 0) + (p[0] * Math.sin(lean) + p[1] * Math.cos(lean) - 70) * s];
    return { hand: L(hand), head: L(head) };
  };
  E.robed = (x, P, o = {}) => {
    const col = o.col || P.ink, s = o.s || 1;
    x.save(); x.translate(o.x || 0, o.y || 0); x.scale(s, s); x.fillStyle = col;
    x.beginPath(); x.moveTo(-30, 0); x.quadraticCurveTo(-20, -80, -12, -140); x.lineTo(12, -140); x.quadraticCurveTo(24, -80, 38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(2, -154, 13, 0, TAU); x.fill(); x.beginPath(); x.ellipse(-2, -170, 6, 5, 0, 0, TAU); x.fill();
    const hand = arm(x, [6, -132], o.arm || 0, o.cup || 0, col, 10);
    x.restore();
    return { hand: [(o.x || 0) + hand[0] * s, (o.y || 0) + hand[1] * s] };
  };
  E.candle = (x, P, cx, cy, s, flame) => {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = mix(P.ink, P.sheet2, .3); x.fillRect(-16, -6, 32, 6); x.fillRect(-4, -46, 8, 40); x.fillRect(-14, -50, 28, 5);
    x.fillStyle = mix(P.cream, P.sheet, .3); x.fillRect(-6, -96, 12, 46);
    if (flame > 0) { const f = clamp(flame); x.fillStyle = mix(P.amber, P.cream, .5); x.beginPath(); x.moveTo(0, -96 - 22 * f); x.quadraticCurveTo(7 * f, -104, 0, -97); x.quadraticCurveTo(-7 * f, -104, 0, -96 - 22 * f); x.fill(); }
    else { x.strokeStyle = F.rgba(F.hex(P.sheetDim), .5); x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -97); x.quadraticCurveTo(6, -115, -2, -130); x.stroke(); }
    x.restore();
  };

  const r1 = F.rng(221), SEEDS = [[-.5, -.35], [.15, -.45], [.55, -.1], [-.2, .05], [.35, .35], [-.55, .3], [.05, .5]];
  E.CAPITAL = [-.08, .02];
  function cellPoly(i, R) {
    const [sx, sy] = SEEDS[i], pts = [];
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * TAU; let lo = 0, hi = 1.4;
      for (let it = 0; it < 16; it++) {
        const m = (lo + hi) / 2, px = sx + Math.cos(a) * m, py = sy + Math.sin(a) * m;
        const inLand = Math.hypot(px * 1.05, py * 1.25) < .88 + .06 * Math.sin(Math.atan2(py, px) * 5);
        let mine = true; for (let j = 0; j < SEEDS.length; j++) if (j !== i && Math.hypot(px - SEEDS[j][0], py - SEEDS[j][1]) < Math.hypot(px - sx, py - sy)) { mine = false; break; }
        if (inLand && mine) lo = m; else hi = m;
      }
      pts.push([(sx + Math.cos(a) * lo) * R, (sy + Math.sin(a) * lo) * R]);
    }
    return pts;
  }
  const CELLS = new Map();
  E.kingdoms = (x, P, o = {}) => {
    const R = o.R || 500, u = clamp(o.u ?? 1), key = R;
    if (!CELLS.has(key)) CELLS.set(key, SEEDS.map((_, i) => cellPoly(i, R)));
    const cells = CELLS.get(key), tints = [.0, .12, .22, .06, .17, .28, .1];
    cells.forEach((pts, i) => {
      const [sx, sy] = SEEDS[i], d = (1 - smooth(u)) * .28 * R;
      x.save(); x.translate(sx * d / .6, sy * d / .6); x.rotate((1 - smooth(u)) * (hash(i, 3) - .5) * .3);
      x.fillStyle = mix(P.sheet, P.sheetShade, tints[i]); F.polyPath(x, pts); x.fill();
      x.strokeStyle = F.rgba(F.hex(P.ink), .3 * (1 - smooth(u)) + .08); x.lineWidth = 3; x.stroke();
      x.restore();
    });
    const b = clamp(o.border || 0);
    if (b > 0) { x.strokeStyle = F.rgba(F.hex(P.ink), .8 * b); x.lineWidth = 6 + 6 * b; x.beginPath(); for (let k = 0; k <= 72; k++) { const a = k / 72 * TAU, rr = (.88 + .06 * Math.sin(a * 5)) * R; const px = Math.cos(a) * rr / 1.05, py = Math.sin(a) * rr / 1.25; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  };
  E.soldier = (x, P, cx, cy, s, ph) => {
    x.save(); x.translate(cx, cy + Math.abs(Math.sin(ph)) * -1.5 * s); x.scale(s, s); x.fillStyle = P.ink;
    x.fillRect(-3, -14, 6, 12); x.beginPath(); x.arc(0, -17, 3.2, 0, TAU); x.fill(); x.fillRect(-5 + Math.sin(ph) * 2, -2, 3, 6); x.fillRect(2 - Math.sin(ph) * 2, -2, 3, 6);
    x.strokeStyle = P.ink; x.lineWidth = 1.2; x.beginPath(); x.moveTo(4, -2); x.lineTo(6, -24); x.stroke();
    x.restore();
  };
  E.rider = (x, P, cx, cy, s, ph) => {
    x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = P.ink;
    x.beginPath(); x.ellipse(0, -14, 13, 6, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(10, -16); x.lineTo(18, -26); x.lineTo(21, -22); x.lineTo(13, -12); x.fill();
    for (let k = 0; k < 4; k++) { const a = Math.sin(ph + k * 1.6) * .5; x.save(); x.translate(-9 + k * 6, -10); x.rotate(a); x.fillRect(-1, 0, 2.2, 11); x.restore(); }
    x.fillRect(-3, -30, 5, 12); x.beginPath(); x.arc(0, -33, 3, 0, TAU); x.fill();
    x.restore();
  };
  E.ship = (x, P, cx, cy, s, ph) => {
    x.save(); x.translate(cx, cy + Math.sin(ph) * 1.5); x.scale(s, s); x.fillStyle = P.ink;
    x.beginPath(); x.moveTo(-22, -4); x.lineTo(22, -4); x.lineTo(16, 5); x.lineTo(-18, 5); x.closePath(); x.fill();
    x.fillStyle = mix(P.cream, P.sheet, .3); x.beginPath(); x.moveTo(-2, -6); x.lineTo(-2, -34); x.lineTo(14, -10); x.closePath(); x.fill(); x.beginPath(); x.moveTo(-6, -6); x.lineTo(-6, -26); x.lineTo(-18, -10); x.closePath(); x.fill();
    x.restore();
  };
  E.bottle = (x, P, cx, cy, s) => {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    x.fillStyle = mix(P.sheet2, P.ink, .2); x.beginPath(); x.ellipse(0, 0, 14, 16, 0, 0, TAU); x.fill(); x.fillRect(-5, -26, 10, 12); x.fillRect(-7, -30, 14, 5);
    x.fillStyle = E.SILVER; x.beginPath(); x.ellipse(0, 3, 10, 11, 0, 0, TAU); x.fill();
    x.restore();
  };
  E.HALL = { floor: 300, throne: [-160, 300], candle: [260, 300] };
  E.hall = (x, P, light) => {
    const [cx] = E.HALL.candle, fy = E.HALL.floor;
    x.fillStyle = mix(P.sheet2, P.ink, .35); x.fillRect(-2000, -1600, 4000, 1600 + fy);
    if (light > 0) { const g = x.createRadialGradient(cx, fy - 200, 20, cx, fy - 200, 1100); g.addColorStop(0, F.rgba(F.hex(mix(P.sheet, P.amber, .35)), .75 * light)); g.addColorStop(1, F.rgba(F.hex(P.sheet), 0)); x.fillStyle = g; x.fillRect(-2000, -1600, 4000, 1600 + fy); }
    x.fillStyle = mix(P.ink, P.sheet2, .25); x.fillRect(-2000, fy, 4000, 600);
    x.strokeStyle = F.rgba(F.hex(P.sheet), .12); x.lineWidth = 2; for (let k = -12; k < 12; k++) { x.beginPath(); x.moveTo(k * 160, fy); x.lineTo(k * 220, fy + 600); x.stroke(); }
  };

  E.servant = (x, P, o = {}) => {
    const col = o.col || P.ink, s = o.s || 1, lift = clamp(o.lift ?? 1);
    x.save(); x.translate(o.x || 0, o.y || 0); x.scale(s, s); x.fillStyle = col;
    x.beginPath(); x.moveTo(-40, 0); x.quadraticCurveTo(-44, -40, -20, -70); x.lineTo(0, -74); x.quadraticCurveTo(10, -40, 24, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(-6, -86, 11, 0, TAU); x.fill();
    const hy = lerp(-60, -96, lift), hx = lerp(20, 34, lift);
    x.strokeStyle = col; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(-8, -66); x.lineTo(10, lerp(-54, -80, lift)); x.lineTo(hx, hy); x.stroke();
    x.fillStyle = mix(col, P.sheetDim, .3); x.beginPath(); x.ellipse(hx + 4, hy - 4, 22, 5, 0, 0, TAU); x.fill();
    x.fillStyle = E.SILVER; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(hx - 10 + k * 5, hy - 9 - (k % 2) * 3, 3.2, 0, TAU); x.fill(); }
    x.restore();
    return [(o.x || 0) + (hx + 4) * s, (o.y || 0) + (hy - 9) * s];
  };
})();
