(function () {
  'use strict';
  const F = FILM, { TAU, lerp, clamp, smooth } = F, mix = F.city.mix;
  const O = (F.official = {});

  const DK = { fl: 560, fr: 1360, fy: 700, bl: 648, br: 1272, by: 596, th: 26 };
  const deskAt = (u, v) => [lerp(lerp(DK.bl, DK.br, u), lerp(DK.fl, DK.fr, u), v), lerp(DK.by, DK.fy, v)];
  const PQ = [[.36, .3], [.62, .26], [.66, .86], [.38, .9]];
  O.PAPER = PQ.map(([u, v]) => deskAt(u, v));
  O.paperAt = (u, v) => { const [a, b, c, d] = O.PAPER, top = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], bot = [lerp(d[0], c[0], u), lerp(d[1], c[1], u)]; return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)]; };
  O.deskAt = deskAt;
  const quad = (x, pts) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
  const cap = (x, a, b, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * r, ny = dx / l * r;
    x.beginPath(); x.moveTo(a[0] + nx, a[1] + ny); x.lineTo(b[0] + nx, b[1] + ny); x.arc(b[0], b[1], r, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    x.lineTo(a[0] - nx, a[1] - ny); x.arc(a[0], a[1], r, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); x.closePath(); };
  const smoothPath = (x, pts) => F.props.smooth(x, pts);
  function limb(x, pts, ws, col) {
    const L = [], R = [];
    pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      L.push([p[0] - dy / l * ws[i] / 2, p[1] + dx / l * ws[i] / 2]); R.push([p[0] + dy / l * ws[i] / 2, p[1] - dx / l * ws[i] / 2]); });
    x.fillStyle = col; x.beginPath(); L.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) x.lineTo(R[i][0], R[i][1]); x.closePath(); x.fill();
    for (let i = 0; i < pts.length; i++) { x.beginPath(); x.arc(pts[i][0], pts[i][1], ws[i] / 2, 0, TAU); x.fill(); }
  }

  function cuff(x, C, el, wr) { const dx = wr[0] - el[0], dy = wr[1] - el[1], l = Math.hypot(dx, dy) || 1, a = [wr[0] - dx / l * 16, wr[1] - dy / l * 16], b = [wr[0] - dx / l * 4, wr[1] - dy / l * 4];
    x.fillStyle = C.shirtS; cap(x, a, b, 24); x.fill(); x.fillStyle = C.shirt; cap(x, a, [b[0] - dx / l * 3, b[1] - dy / l * 3], 22.5); x.fill(); }
  function colours(P) {
    const skin = '#e3b894', suit = '#e2d6bc';
    return {
      skin, skinS: mix(skin, '#8a4f36', .28), skinD: mix(skin, '#6e3a28', .45), skinL: mix(skin, '#fff4e6', .35),
      hair: '#3a2a22', hairL: '#5a4436', suit, suitS: mix(suit, '#6a5a44', .28), suitD: mix(suit, '#4a3e30', .45),
      shirt: '#f4efe4', shirtS: '#d9d1c0', tie: '#5a2e2a', tieS: '#3e1f1c', nail: '#f3d3c3',
      wood: '#8a5a3a', woodL: '#a26f4a', woodD: '#6a4228', woodDD: '#4e301d', brass: '#b8893a', brassL: '#e0b25a', ink: '#1c1a22',
    };
  }

  function finger(x, C, a, b, w, nail = true) {
    x.fillStyle = C.skinS; cap(x, a, b, w / 2 + 1.2); x.fill();
    x.fillStyle = C.skin; cap(x, a, b, w / 2); x.fill();
    if (nail) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; x.fillStyle = C.nail;
      x.beginPath(); x.ellipse(b[0] - dx / l * w * .28, b[1] - dy / l * w * .28, w * .3, w * .38, Math.atan2(dy, dx) + Math.PI / 2, 0, TAU); x.fill(); }
  }
  const place = (x, at, ang, s, flip) => { x.save(); x.translate(at[0], at[1]); x.rotate(ang); x.scale(s, flip ? -s : s); };
  const bez = (x, pts) => {
    const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], s0 = m(pts[n - 1], pts[0]);
    x.beginPath(); x.moveTo(...s0);
    for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); x.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
    x.closePath();
  };
  const crease = (x, C, pts, w = 1.5) => { x.strokeStyle = C.skinS; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(...pts[0]);
    if (pts.length === 3) x.quadraticCurveTo(...pts[1], ...pts[2]); else pts.slice(1).forEach(p => x.lineTo(...p)); x.stroke(); x.lineCap = 'butt'; };
  const nail = (x, C, c, rx, ry, a) => { x.fillStyle = C.nail; x.beginPath(); x.ellipse(c[0], c[1], rx, ry, a, 0, TAU); x.fill(); };
  function cuffLocal(x, C, sleeve) {
    x.fillStyle = sleeve; x.beginPath(); x.moveTo(-70, -27); x.lineTo(-10, -25); x.lineTo(-10, 25); x.lineTo(-70, 28); x.closePath(); x.fill();
    x.fillStyle = C.shirt; x.beginPath(); x.moveTo(-12, -23); x.lineTo(3, -22); x.lineTo(3, 22); x.lineTo(-12, 23); x.closePath(); x.fill();
    x.fillStyle = C.shirtS; x.fillRect(-12, 14, 15, 9);
  }
  const PEN_TIP = [106, 29];
  function penHandLocal(x, C, penIn, k) {
    if (penIn) {
      const a = [16, -50], b = PEN_TIP, d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d), u = [d[0] / l, d[1] / l], nrm = [-u[1], u[0]];
      x.fillStyle = C.ink; x.beginPath(); x.moveTo(a[0] + nrm[0] * 3.4, a[1] + nrm[1] * 3.4); x.lineTo(b[0] - u[0] * 11 + nrm[0] * 3.4, b[1] - u[1] * 11 + nrm[1] * 3.4);
      x.lineTo(...b); x.lineTo(b[0] - u[0] * 11 - nrm[0] * 3.4, b[1] - u[1] * 11 - nrm[1] * 3.4); x.lineTo(a[0] - nrm[0] * 3.4, a[1] - nrm[1] * 3.4); x.closePath(); x.fill();
      x.fillStyle = '#5a5262'; x.beginPath(); x.moveTo(a[0] + nrm[0] * 1.2, a[1] + nrm[1] * 1.2); x.lineTo(b[0] - u[0] * 14 + nrm[0] * 1.2, b[1] - u[1] * 14 + nrm[1] * 1.2); x.lineTo(b[0] - u[0] * 14 + nrm[0] * 2.6, b[1] - u[1] * 14 + nrm[1] * 2.6); x.lineTo(a[0] + nrm[0] * 2.6, a[1] + nrm[1] * 2.6); x.closePath(); x.fill();
      x.fillStyle = '#b8ab98'; x.beginPath(); x.moveTo(...b); x.lineTo(b[0] - u[0] * 10 + nrm[0] * 3, b[1] - u[1] * 10 + nrm[1] * 3); x.lineTo(b[0] - u[0] * 10 - nrm[0] * 3, b[1] - u[1] * 10 - nrm[1] * 3); x.closePath(); x.fill();
    }
    const f = k * 1.5;
    const S = [[0, -18], [19, -25], [38, -33], [53, -36], [63, -34], [78, -21 + f * .4], [90, -4 + f], [98, 7 + f], [101, 13 + f], [97, 17 + f], [86, 5 + f], [80, 1], [77, 9],
      [71, 25], [65, 30], [58, 33], [51, 33], [46, 30], [41, 26], [36, 18], [19, 20], [0, 19]];
    x.fillStyle = C.skin; bez(x, S); x.fill();
    x.save(); bez(x, S); x.clip();
    x.fillStyle = C.skinS; x.beginPath(); x.moveTo(-5, 8); x.quadraticCurveTo(24, 3, 44, 12); x.quadraticCurveTo(62, 20, 76, 12); x.lineTo(90, 60); x.lineTo(-5, 60); x.closePath(); x.fill();
    x.fillStyle = C.skinL; x.beginPath(); x.moveTo(8, -20); x.quadraticCurveTo(34, -34, 58, -32); x.quadraticCurveTo(36, -26, 10, -15); x.closePath(); x.fill();
    x.restore();
    crease(x, C, [[46, -11], [53, -1], [59, 9]]); crease(x, C, [[55, -22], [66, -9], [75, 4]]); crease(x, C, [[62, -31], [66, -27], [67, -22]], 1.3);
    nail(x, C, [96.5, 10.5 + f], 3, 4.4, -.6);
    nail(x, C, [66, 27], 3.4, 2.6, .5); nail(x, C, [55, 30], 3.4, 2.6, .2); nail(x, C, [45.5, 26.5], 3, 2.4, -.2);
  }
  function flatHandLocal(x, C, k) {
    const tip = (len) => len * (1 - k * .12);
    const fingers = [[-15, tip(88), 10.5], [-4, tip(96), 11], [7, tip(90), 10.5], [17, tip(76), 9]];
    x.fillStyle = C.skin;
    bez(x, [[0, -20], [26, -24], [52, -22], [56, 0], [52, 24], [26, 26], [0, 21]]); x.fill();
    for (const [y, L, w] of fingers) { x.beginPath(); x.moveTo(44, y - w / 2); x.lineTo(L - w / 2, y - w / 2 + .5); x.arc(L - w / 2, y + .5, w / 2, -Math.PI / 2, Math.PI / 2); x.lineTo(44, y + w / 2); x.closePath(); x.fill(); }
    x.beginPath(); x.moveTo(8, -18); x.quadraticCurveTo(30, -34, 54, -30); x.arc(54, -25, 5.5, -Math.PI / 2, Math.PI / 2); x.quadraticCurveTo(30, -22, 14, -8); x.closePath(); x.fill();
    x.fillStyle = C.skinS; x.beginPath(); x.moveTo(0, 12); x.quadraticCurveTo(26, 16, 50, 16); x.lineTo(50, 22); x.quadraticCurveTo(26, 26, 0, 21); x.closePath(); x.fill();
    x.fillStyle = C.skinL; x.beginPath(); x.moveTo(6, -12); x.quadraticCurveTo(28, -18, 48, -14); x.quadraticCurveTo(28, -10, 8, -6); x.closePath(); x.fill();
    for (let i = 0; i < 3; i++) { const y = (fingers[i][0] + fingers[i + 1][0]) / 2 + 1; crease(x, C, [[52, y], [Math.min(fingers[i][1], fingers[i + 1][1]) - 8, y + .5]], 1.3); }
    crease(x, C, [[22, -14], [40, -22], [50, -24]], 1.3);
    for (const [y, L, w] of fingers) nail(x, C, [L - w * .55, y + .5], w * .3, w * .26, 0);
    nail(x, C, [55.5, -25], 2.6, 2.2, 0);
  }
  function pinchHand(x, C, at0, coins) {
    const [cx, cy] = at0;
    x.fillStyle = C.skin; smoothPath(x, [[cx - 30, cy - 34], [cx + 30, cy - 36], [cx + 36, cy + 4], [cx + 16, cy + 22], [cx - 24, cy + 20], [cx - 38, cy - 4]]); x.fill();
    if (coins) for (let i = 0; i < 4; i++) { x.fillStyle = mix('#b3aa45', '#000', .25); x.beginPath(); x.ellipse(cx + 2, cy + 30 - i * 4, 18, 8, 0, 0, TAU); x.fill(); x.fillStyle = '#c8bd52'; x.beginPath(); x.ellipse(cx + 2, cy + 27 - i * 4, 18, 8, 0, 0, TAU); x.fill(); }
    [[-22, 14, -26, 44, 14], [-6, 18, -6, 50, 15], [10, 18, 12, 48, 14.5], [24, 12, 28, 38, 13]].forEach(([ax, ay, bx, by, w]) => finger(x, C, [cx + ax, cy + ay], [cx + bx, cy + by], w));
    finger(x, C, [cx + 30, cy - 6], [cx + 48, cy + 20], 15);
    return [cx, cy - 40];
  }

  O.draw = (x, P, o = {}) => {
    const C = colours(P), t = o.t || 0, down = o.headDown ?? 1, breath = Math.sin(t * 1.6) * 1.6;
    x.save();
    x.fillStyle = C.woodD; smoothPath(x, [[820, 600], [812, 380], [840, 318], [960, 300], [1080, 318], [1108, 380], [1100, 600]]); x.fill();
    x.fillStyle = C.woodDD; smoothPath(x, [[846, 600], [840, 392], [864, 340], [960, 326], [1056, 340], [1080, 392], [1074, 600]]); x.fill();
    const sy = 478 - breath;
    x.fillStyle = C.suitS; smoothPath(x, [[790, 640], [794, sy + 34], [830, sy - 4], [900, sy - 20], [1020, sy - 20], [1090, sy - 4], [1126, sy + 34], [1130, 640]]); x.fill();
    x.fillStyle = C.suit; smoothPath(x, [[812, 640], [814, sy + 36], [846, sy + 2], [906, sy - 16], [1014, sy - 16], [1074, sy + 2], [1104, sy + 36], [1108, 640]]); x.fill();
    x.fillStyle = C.shirt; x.beginPath(); x.moveTo(918, sy - 16); x.lineTo(1002, sy - 16); x.lineTo(978, 590); x.lineTo(942, 590); x.closePath(); x.fill();
    x.fillStyle = C.suitS; x.beginPath(); x.moveTo(906, sy - 14); x.lineTo(946, 600); x.lineTo(924, 600); x.lineTo(884, sy + 10); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(1014, sy - 14); x.lineTo(974, 600); x.lineTo(996, 600); x.lineTo(1036, sy + 10); x.closePath(); x.fill();
    x.fillStyle = C.tie; x.beginPath(); x.moveTo(950, sy - 4); x.lineTo(970, sy - 4); x.lineTo(976, 580); x.lineTo(960, 596); x.lineTo(944, 580); x.closePath(); x.fill();
    x.fillStyle = C.tieS; x.beginPath(); x.moveTo(948, sy - 16); x.lineTo(972, sy - 16); x.lineTo(968, sy); x.lineTo(952, sy); x.closePath(); x.fill();
    x.fillStyle = C.shirtS; x.beginPath(); x.moveTo(930, sy - 18); x.lineTo(960, sy - 4); x.lineTo(946, sy + 8); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(990, sy - 18); x.lineTo(960, sy - 4); x.lineTo(974, sy + 8); x.closePath(); x.fill();
    x.fillStyle = C.skinS; x.fillRect(934, 420 - breath, 52, 50);
    const hx = 960, hy = 372 + down * 10 - breath;
    x.fillStyle = C.skinS; x.beginPath(); x.ellipse(hx - 60, hy + 6, 10, 17, -.15, 0, TAU); x.fill(); x.beginPath(); x.ellipse(hx + 60, hy + 6, 10, 17, .15, 0, TAU); x.fill();
    x.fillStyle = C.skin; x.beginPath(); x.ellipse(hx, hy, 58, 70, 0, 0, TAU); x.fill();
    x.fillStyle = C.skinS; x.beginPath(); x.ellipse(hx + 26, hy + 8, 26, 54, .1, -.9, 1.9); x.fill();
    x.fillStyle = C.hair; smoothPath(x, [[hx - 57, hy + 2], [hx - 63, hy - 36], [hx - 42, hy - 72], [hx - 2, hy - 86], [hx + 44, hy - 74], [hx + 64, hy - 40], [hx + 58, hy - 2], [hx + 50, hy - 30], [hx + 22, hy - 46], [hx - 14, hy - 48], [hx - 30, hy - 40], [hx - 48, hy - 26]]); x.fill();
    x.fillStyle = C.hairL; smoothPath(x, [[hx - 18, hy - 82], [hx + 30, hy - 78], [hx + 50, hy - 58], [hx + 14, hy - 62]]); x.fill();
    x.strokeStyle = C.hair; x.lineWidth = 3; x.beginPath(); x.moveTo(hx - 26, hy - 80); x.quadraticCurveTo(hx - 18, hy - 64, hx - 24, hy - 44); x.stroke();
    const fy = hy + down * 6;
    x.strokeStyle = C.hair; x.lineWidth = 5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(hx - 40, fy - 10); x.quadraticCurveTo(hx - 24, fy - 18, hx - 10, fy - 12); x.stroke();
    x.beginPath(); x.moveTo(hx + 10, fy - 12); x.quadraticCurveTo(hx + 24, fy - 18, hx + 40, fy - 10); x.stroke();
    const blink = ((t * .37) % 1) > .96 ? 1 : 0;
    x.strokeStyle = '#3a2620'; x.lineWidth = 3.4;
    for (const d of [-1, 1]) {
      const ex = hx + d * 24, ey = fy + 2;
      if (!blink) { x.fillStyle = '#2a1c18'; x.beginPath(); x.ellipse(ex, ey + 3, 6.5, 3.6, 0, 0, Math.PI); x.fill(); }
      x.beginPath(); x.moveTo(ex - 12, ey + 1); x.quadraticCurveTo(ex, ey - 4 + blink * 6, ex + 12, ey + 1); x.stroke();
    }
    x.fillStyle = C.skinS; x.beginPath(); x.moveTo(hx - 3, fy - 4); x.quadraticCurveTo(hx + 12, fy + 22, hx + 10, fy + 30); x.quadraticCurveTo(hx, fy + 36, hx - 10, fy + 30); x.quadraticCurveTo(hx - 8, fy + 14, hx - 3, fy - 4); x.fill();
    x.fillStyle = C.skinD; x.beginPath(); x.ellipse(hx + 5, fy + 31, 5, 2.4, 0, 0, TAU); x.fill();
    x.fillStyle = C.hair; smoothPath(x, [[hx - 34, fy + 44], [hx - 22, fy + 34], [hx, fy + 36], [hx + 22, fy + 34], [hx + 34, fy + 44], [hx + 20, fy + 44], [hx, fy + 42], [hx - 20, fy + 44]]); x.fill();
    x.fillStyle = C.skinD; x.beginPath(); x.ellipse(hx, fy + 52, 9, 2.6, 0, 0, TAU); x.fill();
    x.lineCap = 'butt';

    x.fillStyle = C.woodL; quad(x, [deskAt(0, 0), deskAt(1, 0), deskAt(1, 1), deskAt(0, 1)]); x.fill();
    x.strokeStyle = mix(C.woodL, C.wood, .5); x.lineWidth = 1.4;
    for (let k = 1; k < 9; k++) { const a = deskAt(k / 9, 0), b = deskAt(k / 9, 1); x.globalAlpha = .35; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); }
    x.globalAlpha = 1;
    const L0 = deskAt(.97, .06);
    x.fillStyle = C.brass; x.beginPath(); x.ellipse(L0[0], L0[1], 28, 9, 0, 0, TAU); x.fill(); x.fillRect(L0[0] - 5, L0[1] - 26, 10, 26);
    x.fillStyle = C.brassL; x.beginPath(); x.ellipse(L0[0], L0[1] - 40, 24, 18, 0, 0, TAU); x.fill();
    x.fillStyle = C.brass; x.fillRect(L0[0] - 12, L0[1] - 60, 24, 6);
    x.fillStyle = 'rgba(255,240,210,.55)'; smoothPath(x, [[L0[0] - 10, L0[1] - 60], [L0[0] - 16, L0[1] - 78], [L0[0] - 8, L0[1] - 118], [L0[0] + 8, L0[1] - 118], [L0[0] + 16, L0[1] - 78], [L0[0] + 10, L0[1] - 60]]); x.fill();
    x.fillStyle = '#fff1c0'; x.beginPath(); x.ellipse(L0[0], L0[1] - 76, 5, 11, 0, 0, TAU); x.fill();
    F.props.glow(x, L0[0], L0[1] - 76, 160, '#ffcf80', .45, 'flat');
    const B0 = deskAt(.84, .72), bw = 56, bh = 30, bd = 14;
    x.fillStyle = C.woodDD; x.fillRect(B0[0] - bw / 2, B0[1] - bh, bw, bh);
    x.fillStyle = C.woodD; quad(x, [[B0[0] - bw / 2, B0[1] - bh], [B0[0] + bw / 2, B0[1] - bh], [B0[0] + bw / 2 - 4, B0[1] - bh - bd], [B0[0] - bw / 2 + 4, B0[1] - bh - bd]]); x.fill();
    x.fillStyle = C.brass; x.fillRect(B0[0] - 5, B0[1] - bh + 4, 10, 8);
    const I0 = deskAt(.1, .44);
    x.fillStyle = C.ink; x.beginPath(); x.ellipse(I0[0], I0[1], 20, 8, 0, 0, Math.PI); x.lineTo(I0[0] - 20, I0[1] - 26); x.lineTo(I0[0] + 20, I0[1] - 26); x.closePath(); x.fill();
    x.fillStyle = '#34303e'; x.beginPath(); x.ellipse(I0[0], I0[1] - 26, 20, 7, 0, 0, TAU); x.fill();
    x.fillStyle = '#0c0b10'; x.beginPath(); x.ellipse(I0[0], I0[1] - 26, 9, 3.2, 0, 0, TAU); x.fill();
    if (o.penInPot) { x.strokeStyle = C.ink; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(I0[0], I0[1] - 26); x.lineTo(I0[0] - 34, I0[1] - 124); x.stroke(); x.lineCap = 'butt'; }
    O.INKPOT = [I0[0], I0[1] - 26]; O.BOX = [B0[0], B0[1] - bh - bd / 2];
    x.fillStyle = 'rgba(40,20,10,.18)'; quad(x, O.PAPER.map(p => [p[0] + 5, p[1] + 5])); x.fill();
    x.fillStyle = '#f3ecdc'; quad(x, O.PAPER); x.fill();
    x.strokeStyle = '#cfc4ad'; x.lineWidth = 1.5; quad(x, O.PAPER); x.stroke();
    const ink = clamp(o.ink ?? 1), rows = [[.12, .5], [.2, .8], [.3, .74], [.38, .82], [.46, .6], [.62, .8], [.7, .76], [.78, .5]];
    x.strokeStyle = '#3c3340'; x.lineWidth = 1.3; x.lineCap = 'round';
    rows.forEach(([v, len], i) => { const f = clamp(ink * rows.length - i); if (f <= 0) return; x.beginPath();
      for (let j = 0; j <= 24; j++) { const u = .1 + len * .8 * f * j / 24, p = O.paperAt(u, v); p[1] += Math.sin((i * 9 + j) * 1.7) * .8; j ? x.lineTo(...p) : x.moveTo(...p); } x.stroke(); });
    x.lineCap = 'butt';
    if (o.coins) { const K = deskAt(.7, .72); for (let i = 0; i < 5; i++) { x.fillStyle = mix('#b3aa45', '#000', .3); x.beginPath(); x.ellipse(K[0], K[1] - i * 5, 22, 9, 0, 0, TAU); x.fill(); x.fillStyle = '#c8bd52'; x.beginPath(); x.ellipse(K[0], K[1] - i * 5 - 3, 22, 9, 0, 0, TAU); x.fill(); } }

    const nib = O.paperAt(...(o.nib || [.5, .4]));
    const leftAt = O.paperAt(.97, .52);
    const shR = [858, sy + 26], shL = [1062, sy + 26];
    const HS = 1.12;
    const elL = deskAt(.74, .86), wrL = [leftAt[0] + 58, leftAt[1] + 8];
    limb(x, [shL, [lerp(shL[0], elL[0], .5) + 10, lerp(shL[1], elL[1], .5)], elL], [66, 62, 58], C.suitS);
    limb(x, [elL, wrL], [58, 48], C.suit);
    { const a = Math.atan2(wrL[1] - elL[1], wrL[0] - elL[0]); place(x, wrL, a, HS, true); cuffLocal(x, C, C.suit); x.restore();
      place(x, wrL, Math.PI + .12, HS, true); flatHandLocal(x, C, .3); x.restore(); }
    const elR = deskAt(.22, .9);
    const r = o.right || 'write';
    let wrR;
    if (r === 'write' || r.pose === 'write') {
      let a = 0; wrR = [nib[0] - 110, nib[1] - 20];
      for (let it = 0; it < 12; it++) { a = Math.atan2(wrR[1] - elR[1], wrR[0] - elR[0]); const c = Math.cos(a), s2 = Math.sin(a); wrR = [nib[0] - (PEN_TIP[0] * c - PEN_TIP[1] * s2) * HS, nib[1] - (PEN_TIP[0] * s2 + PEN_TIP[1] * c) * HS]; }
      limb(x, [shR, [lerp(shR[0], elR[0], .5) - 10, lerp(shR[1], elR[1], .5)], elR], [66, 62, 58], C.suitS);
      limb(x, [elR, wrR], [58, 48], C.suit);
      place(x, wrR, a, HS, false); cuffLocal(x, C, C.suit); penHandLocal(x, C, true, o.fk || 0); x.restore();
    } else {
      const hand = r.at; wrR = [hand[0] - 8, hand[1] - 40];
      limb(x, [shR, [lerp(shR[0], elR[0], .5) - 10, lerp(shR[1], elR[1], .5)], elR], [66, 62, 58], C.suitS);
      limb(x, [elR, wrR], [58, 46], C.suit);
      cuff(x, C, elR, wrR);
      pinchHand(x, C, hand, r.pose === 'pinch');
    }

    x.fillStyle = C.wood; quad(x, [deskAt(0, 1), deskAt(1, 1), [DK.fr, DK.fy + DK.th], [DK.fl, DK.fy + DK.th]]); x.fill();
    x.fillStyle = C.woodD; x.fillRect(DK.fl + 8, DK.fy + DK.th, DK.fr - DK.fl - 16, 1080);
    x.fillStyle = C.woodDD; x.fillRect(DK.fl + 8, DK.fy + DK.th, DK.fr - DK.fl - 16, 8);
    x.strokeStyle = C.woodDD; x.lineWidth = 4;
    for (const [a, b] of [[DK.fl + 40, DK.fl + 260], [DK.fr - 260, DK.fr - 40]]) { x.strokeRect(a, DK.fy + DK.th + 30, b - a, 90); x.fillStyle = C.brass; x.fillRect((a + b) / 2 - 20, DK.fy + DK.th + 70, 40, 8); }
    x.strokeRect(DK.fl + 300, DK.fy + DK.th + 30, DK.fr - DK.fl - 600, 250);
    x.restore();
  };
})();
