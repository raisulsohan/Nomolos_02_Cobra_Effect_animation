(function () {
  'use strict';
  const F = FILM, { TAU, lerp, hash, rng } = F, CITY = (F.city = {});

  const parse = c => c[0] === '#' ? [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const mix = (a, b, k) => { const A = parse(a), B = parse(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  CITY.mix = mix;
  const tone = mix;
  const shade = (c, P, k) => mix(c, P.ink, k);
  const light = (c, P, k) => mix(c, P.rim, k);

  CITY.dome = (x, P, cx, y, r) => {
    x.fillStyle = shade(P.sheet, P, .08); x.fillRect(cx - r * .82, y - r * .32, r * 1.64, r * .34);
    x.fillStyle = P.sheet; x.beginPath(); x.moveTo(cx - r, y - r * .3);
    x.bezierCurveTo(cx - r * 1.05, y - r * 1.25, cx - r * .25, y - r * 1.5, cx, y - r * 1.72);
    x.bezierCurveTo(cx + r * .25, y - r * 1.5, cx + r * 1.05, y - r * 1.25, cx + r, y - r * .3); x.closePath(); x.fill();
    x.fillStyle = shade(P.sheet, P, .12); x.beginPath(); x.moveTo(cx + r * .1, y - r * 1.62);
    x.bezierCurveTo(cx + r * .5, y - r * 1.35, cx + r * 1.02, y - r * 1.2, cx + r, y - r * .3); x.lineTo(cx + r * .35, y - r * .3); x.closePath(); x.fill();
    x.strokeStyle = shade(P.sheet, P, .35); x.lineWidth = Math.max(1.5, r * .04);
    x.beginPath(); x.moveTo(cx, y - r * 1.72); x.lineTo(cx, y - r * 2.05); x.stroke();
    x.fillStyle = shade(P.sheet, P, .35); x.beginPath(); x.arc(cx, y - r * 1.95, r * .07, 0, TAU); x.fill();
  };

  function archPath(x, cx, y, w, h) {
    const s = h - w * .55;
    x.moveTo(cx - w / 2, y); x.lineTo(cx - w / 2, y - s);
    x.quadraticCurveTo(cx - w / 2, y - h + w * .12, cx, y - h);
    x.quadraticCurveTo(cx + w / 2, y - h + w * .12, cx + w / 2, y - s); x.lineTo(cx + w / 2, y); x.closePath();
  }
  CITY.archPath = archPath;

  CITY.house = (x, P, o) => {
    const { w, h } = o, r = rng(o.seed || 1), wall = tone(P.wall, P.sheet, o.tone ?? .3), trim = shade(wall, P, .16);
    x.fillStyle = wall; x.beginPath(); x.rect(0, -h, w, h);
    if (o.arch) archPath(x, o.arch.at, 0, o.arch.w, o.arch.h);
    x.fill('evenodd');
    if (o.arch) {
      x.strokeStyle = trim; x.lineWidth = 7; x.beginPath(); archPath(x, o.arch.at, 0, o.arch.w + 12, o.arch.h + 8); x.stroke();
    }
    x.fillStyle = shade(wall, P, .05); for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(r() * w, -r() * h, 20 + r() * 40, 8 + r() * 14, 0, 0, TAU); x.fill(); }
    x.fillStyle = trim; x.fillRect(0, -16, w, 16); x.fillRect(0, -h + 26, w, 7);
    if (o.roof !== 'none') {
      x.fillStyle = wall; x.fillRect(-4, -h - 22, w + 8, 24);
      x.fillStyle = trim; x.fillRect(-4, -h - 26, w + 8, 6);
      for (let k = 12; k < w - 8; k += 30) x.fillRect(k, -h - 34, 14, 9);
    }
    const rows = o.rows ?? (h > 300 ? 2 : 1), n = o.win ?? Math.max(1, Math.floor(w / 110));
    for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
      const cx = w * (i + .5) / n, cy = -h + 70 + j * 150, ww = 34, wh = 62;
      if (o.door != null && j === rows - 1 && Math.abs(cx - w * o.door) < 70) continue;
      if (o.arch && Math.abs(cx - o.arch.at) < o.arch.w / 2 + 40 && cy + wh > -o.arch.h - 30) continue;
      x.fillStyle = trim; x.beginPath(); archPath(x, cx, cy + wh + 6, ww + 10, wh + 10); x.fill();
      x.fillStyle = shade(P.door, P, .25); x.beginPath(); archPath(x, cx, cy + wh, ww, wh); x.fill();
      x.fillStyle = shade(wall, P, .08); x.fillRect(cx - ww / 2 - 6, cy + wh, ww + 12, 7);
    }
    if (o.balcony != null) {
      const bx = w * o.balcony, by = -h + 140, bw = 96;
      x.fillStyle = trim; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(bx + d * bw * .36, by + 40); x.lineTo(bx + d * bw * .3, by + 64); x.lineTo(bx + d * bw * .44, by + 40); x.fill(); }
      x.fillStyle = light(wall, P, .15); x.fillRect(bx - bw / 2, by - 52, bw, 92);
      x.fillStyle = trim; x.fillRect(bx - bw / 2 - 6, by + 32, bw + 12, 10); x.fillRect(bx - bw / 2 - 8, by - 60, bw + 16, 10);
      x.beginPath(); x.moveTo(bx - bw / 2 - 8, by - 60); x.quadraticCurveTo(bx, by - 96, bx + bw / 2 + 8, by - 60); x.fill();
      x.fillStyle = shade(P.door, P, .2); for (let k = 0; k < 3; k++) { x.beginPath(); archPath(x, bx - bw / 3 + k * bw / 3, by + 22, 20, 52); x.fill(); }
    }
    if (o.door != null) {
      const dx = w * o.door, dw = 96, dh = 232;
      x.fillStyle = trim; x.beginPath(); archPath(x, dx, 0, dw + 16, dh + 12); x.fill();
      x.fillStyle = P.door; x.beginPath(); archPath(x, dx, -2, dw, dh); x.fill();
      x.strokeStyle = shade(P.door, P, .3); x.lineWidth = 2.5; x.beginPath(); x.moveTo(dx, -2); x.lineTo(dx, -dh + 16); x.stroke();
      x.fillStyle = shade(P.door, P, .45); for (const d of [-1, 1]) { x.beginPath(); x.arc(dx + d * 9, -dh * .45, 3, 0, TAU); x.fill(); }
    }
    if (o.roof === 'dome') CITY.dome(x, P, w * (o.domeAt ?? .5), -h - 22, o.domeR ?? Math.min(w * .32, 120));
  };

  CITY.step = (x, P, dx, w = 136) => { x.fillStyle = shade(P.wall, P, .22); x.fillRect(dx - w / 2, -14, w, 14); x.fillStyle = light(P.wall, P, .1); x.fillRect(dx - w / 2, -14, w, 4); };

  CITY.well = (x, P, cx, y, s = 1) => {
    x.save(); x.translate(cx, y); x.scale(s, s);
    const stone = tone(P.wall, P.ink, .12);
    x.fillStyle = shade(stone, P, .12); x.beginPath(); x.ellipse(0, -74, 70, 16, 0, 0, TAU); x.fill();
    x.fillStyle = stone; x.fillRect(-70, -74, 140, 74);
    x.fillStyle = shade(P.ink, P, 0); x.beginPath(); x.ellipse(0, -76, 56, 11, 0, 0, TAU); x.fill();
    x.strokeStyle = shade(stone, P, .2); x.lineWidth = 2;
    for (const yy of [-50, -26]) { x.beginPath(); x.moveTo(-70, yy); x.lineTo(70, yy); x.stroke(); }
    for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(k * 46 + 20, -74); x.lineTo(k * 46 + 20, -50); x.moveTo(k * 46, -50); x.lineTo(k * 46, -26); x.stroke(); }
    x.strokeStyle = P.wood; x.lineWidth = 7;
    x.beginPath(); x.moveTo(-58, -80); x.lineTo(-44, -170); x.moveTo(58, -80); x.lineTo(44, -170); x.moveTo(-50, -168); x.lineTo(50, -168); x.stroke();
    x.fillStyle = P.woodDark; x.beginPath(); x.arc(0, -168, 12, 0, TAU); x.fill();
    x.strokeStyle = shade(P.cream, P, .3); x.lineWidth = 2; x.beginPath(); x.moveTo(0, -156); x.lineTo(0, -96); x.stroke();
    CITY.pot(x, P, 0, -88, 12);
    x.restore();
  };

  CITY.pot = (x, P, cx, cy, r) => {
    const brass = tone(P.amberDark, P.wood, .45);
    x.fillStyle = brass; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.fillRect(cx - r * .38, cy - r * 1.25, r * .76, r * .5);
    x.fillStyle = shade(brass, P, .2); x.beginPath(); x.ellipse(cx, cy - r * 1.25, r * .52, r * .16, 0, 0, TAU); x.fill();
    x.fillStyle = light(brass, P, .35); x.beginPath(); x.ellipse(cx - r * .35, cy - r * .3, r * .18, r * .34, -.4, 0, TAU); x.fill();
  };

  CITY.tree = (x, P, cx, y, s = 1, seed = 3) => {
    x.save(); x.translate(cx, y); x.scale(s, s);
    const r = rng(seed), leaf = tone(P.sheet2, P.ink, .25), leaf2 = tone(P.sheet2, P.ink, .05), bark = tone(P.wood, P.ink, .2);
    x.fillStyle = bark; x.beginPath(); x.moveTo(-14, 0); x.quadraticCurveTo(-8, -120, -26, -210); x.lineTo(-8, -214); x.quadraticCurveTo(4, -140, 16, 0); x.closePath(); x.fill();
    x.strokeStyle = bark; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(-4, -150); x.quadraticCurveTo(40, -200, 70, -230); x.stroke();
    for (let k = 0; k < 16; k++) {
      const a = r() * TAU, d = r() * 110, px = -10 + Math.cos(a) * d * 1.3, py = -270 + Math.sin(a) * d * .6, rr = 38 + r() * 30;
      x.fillStyle = k % 3 ? leaf : leaf2; x.beginPath(); x.ellipse(px, py, rr, rr * .7, r(), 0, TAU); x.fill();
    }
    x.restore();
  };

  CITY.washing = (x, P, x0, x1, y, s = 1, seed = 5) => {
    const r = rng(seed), cols = [tone(P.cream, P.sheet, .2), tone(P.sheet2, P.cream, .3), tone(P.coat2, P.cream, .35), tone(P.facade, P.cream, .25)];
    x.strokeStyle = shade(P.cream, P, .4); x.lineWidth = 1.6 * s; x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo((x0 + x1) / 2, y + 16 * s, x1, y); x.stroke();
    for (let px = x0 + 20 * s; px < x1 - 30 * s; px += (46 + r() * 30) * s) {
      const u = (px - x0) / (x1 - x0), py = y + 16 * s * 4 * u * (1 - u) * .5, cw = (26 + r() * 18) * s, ch = (40 + r() * 34) * s;
      x.fillStyle = cols[(r() * cols.length) | 0]; x.beginPath(); x.moveTo(px, py); x.lineTo(px + cw, py + 2 * s); x.lineTo(px + cw * .92, py + ch); x.lineTo(px + cw * .06, py + ch * .94); x.closePath(); x.fill();
    }
  };
})();
