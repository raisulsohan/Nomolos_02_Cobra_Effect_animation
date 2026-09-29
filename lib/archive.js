(function () {
  'use strict';
  const F = FILM, { TAU, clamp, lerp, smooth, rng } = F, mix = F.city.mix;
  const A = (F.archive = {});
  A.FRONT = 250; A.DEPTH = 400; A.SV = .68;
  const at = A.at = (u, v, h = 0) => [u, A.FRONT - v * A.SV - h];
  A.plane = (x, u, v, h = 0, a = 0) => { const [X, Y] = at(u, v, h), c = Math.cos(a), s = Math.sin(a); x.transform(c, A.SV * s, -s, A.SV * c, X, Y); };
  A.col = P => {
    const brass = mix(P.amberDark, P.wood, .35);
    return {
      wood: P.wood, woodDark: P.woodDark, top: mix(P.wood, P.cream, .16), edge: mix(P.woodDark, P.ink, .2),
      brass, brassLight: mix(brass, P.cream, .38), brassDark: mix(brass, P.ink, .3),
      manila: mix(P.parchment, P.wood, .12), manilaDark: mix(P.parchment, P.wood, .38), box: mix(P.parchment, P.wood, .28),
      cloth: mix(P.sleeve, P.ink, .38), clothLight: mix(P.sleeve, P.ink, .12), gilt: mix(P.amber, P.parchment, .45),
      page: mix(P.card, P.parchment, .22), pageEdge: mix(P.parchment, P.wood, .25), paper: P.card, line: mix(P.ink, P.card, .45),
    };
  };
  const poly = (x, pts) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
  A.poly = poly;

  A.wall = (x, P) => {
    const y0 = at(0, A.DEPTH)[1];
    x.fillStyle = P.wall; x.fillRect(-3200, -2200, 6400, y0 + 2240);
    const r = rng(41);
    for (let i = 0; i < 60; i++) {
      const cx = -3000 + r() * 6000, cy = -2000 + r() * (y0 + 1900), rx = 40 + r() * 150, ry = rx * (.4 + r() * .4);
      x.fillStyle = mix(P.wall, r() < .5 ? P.cream : P.wood, .025 + r() * .03); x.beginPath(); x.ellipse(cx, cy, rx, ry, r() * 3, 0, TAU); x.fill();
    }
    x.fillStyle = mix(P.wall, P.wood, .3); x.fillRect(-3200, y0 - 16, 6400, 16);
  };

  A.desk = (x, P, u0 = -2400, u1 = 2800) => {
    const C = A.col(P), [, yb] = at(0, A.DEPTH), yf = A.FRONT;
    x.fillStyle = C.top; x.fillRect(u0, yb, u1 - u0, yf - yb);
    const r = rng(9);
    x.strokeStyle = mix(C.top, P.woodDark, .35); x.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const y = yb + 8 + r() * (yf - yb - 16), a = u0 + r() * (u1 - u0) * .8, b = a + 200 + r() * 700;
      x.beginPath(); x.moveTo(a, y); x.bezierCurveTo(a + (b - a) * .3, y - 3, a + (b - a) * .7, y + 3, b, y + r() * 2); x.stroke();
    }
    x.fillStyle = C.edge; x.fillRect(u0, yf, u1 - u0, 20);
    x.fillStyle = mix(C.edge, P.cream, .15); x.fillRect(u0, yf, u1 - u0, 4);
    x.fillStyle = C.wood; x.fillRect(u0, yf + 20, u1 - u0, 1400);
    x.fillStyle = C.woodDark;
    for (let u = u0 + 60; u < u1 - 200; u += 520) {
      x.fillRect(u, yf + 60, 460, 150); x.fillStyle = mix(C.wood, P.cream, .06); x.fillRect(u + 14, yf + 74, 432, 122); x.fillStyle = C.woodDark;
      x.fillStyle = C.brass; x.beginPath(); x.ellipse(u + 230, yf + 135, 26, 9, 0, 0, TAU); x.fill(); x.fillStyle = C.woodDark;
      x.fillRect(u, yf + 250, 460, 900); x.fillStyle = mix(C.wood, P.cream, .04); x.fillRect(u + 20, yf + 270, 420, 900); x.fillStyle = C.woodDark;
    }
  };

  A.lamp = (x, P, u, v, on = 0) => {
    const C = A.col(P), [bx, by] = at(u, v);
    x.fillStyle = C.brassDark; x.beginPath(); x.ellipse(bx, by, 70, 16, 0, 0, TAU); x.fill();
    x.fillStyle = C.brass; x.beginPath(); x.ellipse(bx, by - 8, 64, 14, 0, 0, TAU); x.fill();
    x.fillStyle = C.brassLight; x.beginPath(); x.ellipse(bx - 14, by - 11, 30, 5, 0, 0, TAU); x.fill();
    const SH = 410, ARM = 170;
    x.fillStyle = C.brass; x.fillRect(bx - 8, by - SH, 16, SH - 8);
    x.fillStyle = C.brassLight; x.fillRect(bx - 6, by - SH, 4, SH - 8);
    x.beginPath(); x.arc(bx, by - SH, 15, 0, TAU); x.fillStyle = C.brass; x.fill();
    x.save(); x.translate(bx, by - SH); x.rotate(.42);
    x.fillStyle = C.brass; x.fillRect(0, -7, ARM, 14); x.restore();
    const hx = bx + ARM * Math.cos(.42), hy = by - SH + ARM * Math.sin(.42);
    x.save(); x.translate(hx, hy); x.rotate(-.35); x.scale(1.3, 1.3);
    const bulb = [hx + Math.sin(.35) * 75, hy + Math.cos(.35) * 75];
    if (on > 0) { x.fillStyle = F.rgba(F.hex(P.glow), .9 * on); x.beginPath(); x.ellipse(0, 58, 50, 12, 0, 0, TAU); x.fill(); }
    x.fillStyle = mix(P.cream, P.parchment, .3);
    x.beginPath(); x.moveTo(-24, -8); x.lineTo(24, -8); x.lineTo(56, 58); x.quadraticCurveTo(0, 70, -56, 58); x.closePath(); x.fill();
    x.fillStyle = mix(P.cream, P.parchment, .6); x.beginPath(); x.moveTo(8, -8); x.lineTo(24, -8); x.lineTo(56, 58); x.quadraticCurveTo(40, 62, 30, 63); x.closePath(); x.fill();
    x.fillStyle = C.brass; x.fillRect(-26, -14, 52, 8);
    x.fillStyle = C.brassDark; x.beginPath(); x.ellipse(0, 58, 56, 11, 0, 0, Math.PI); x.fill();
    x.restore();
    return bulb;
  };

  A.shelf = (x, P, o = {}) => {
    const C = A.col(P), u0 = o.u0 ?? 780, u1 = o.u1 ?? 1360, boards = o.boards || [-190, -430], bw = 124, bh = 170, rings = [];
    for (const [k, yb] of boards.entries()) {
      x.fillStyle = C.woodDark; x.fillRect(u0 - 20, yb, u1 - u0 + 40, 18);
      x.fillStyle = mix(C.woodDark, P.cream, .18); x.fillRect(u0 - 20, yb, u1 - u0 + 40, 4);
      for (const bxk of [u0 + 10, u1 - 30]) { x.fillStyle = C.woodDark; poly(x, [[bxk, yb + 18], [bxk + 20, yb + 18], [bxk + 20, yb + 60]]); x.fill(); }
      const r = rng(70 + k);
      for (let i = 0, u = u0; u + bw <= u1 + 1; i++, u += bw + 6) {
        const h = bh - (r() < .3 ? 14 : 0), tone = mix(C.box, P.wood, r() * .18);
        x.fillStyle = tone; x.fillRect(u, yb - h, bw, h);
        x.fillStyle = mix(tone, P.cream, .25); x.fillRect(u, yb - h, bw, 5);
        x.fillStyle = mix(tone, P.ink, .15); x.fillRect(u + bw - 8, yb - h, 8, h);
        x.fillStyle = P.card; x.fillRect(u + 22, yb - h + 26, bw - 44, 44);
        x.strokeStyle = C.line; x.lineWidth = 2.4; x.lineCap = 'round';
        for (let l = 0; l < 3; l++) { const y = yb - h + 38 + l * 11, e = u + 30 + (bw - 64) * (.5 + r() * .5); x.beginPath(); x.moveTo(u + 30, y); x.lineTo(e, y); x.stroke(); }
        x.lineCap = 'butt';
        const rc = [u + bw / 2, yb - h + 104];
        x.strokeStyle = C.brassDark; x.lineWidth = 5; x.beginPath(); x.arc(rc[0], rc[1] + 8, 13, 0, TAU); x.stroke();
        x.fillStyle = C.brass; x.beginPath(); x.arc(rc[0], rc[1] - 4, 6, 0, TAU); x.fill();
        if (k === 0) rings.push([rc[0], rc[1] + 8]);
      }
    }
    return { boards, rings };
  };

  const PW = 290, PH = 370, TIP = .94, PLATE = { x: 27, y: -PH * TIP + 44, w: 236, h: 177 }, CAP = { x: 85, y: PLATE.y + PLATE.h + 16, w: 120, h: 30 };
  A.BOOK = { PW, PH, TIP, PLATE, CAP, LEDGE: 34 };
  const top = (xx, k = 14) => -PH * TIP + k * Math.pow(1 - Math.min(1, Math.abs(xx) / PW), 3);
  function pagePath(x, side, w = 1) {
    x.beginPath(); x.moveTo(0, top(0)); x.lineTo(0, -4);
    for (let i = 0; i <= 12; i++) { const xx = side * PW * i / 12; x.lineTo(xx * w, -4 * Math.pow(1 - i / 12, 3)); }
    for (let i = 12; i >= 0; i--) { const xx = side * PW * i / 12; x.lineTo(xx * w, top(xx)); }
    x.closePath();
  }
  function textLines(x, P, x0, x1, y0, y1, seed, a = .45) {
    const r = rng(seed); x.strokeStyle = F.rgba(F.hex(P.ink), a); x.lineWidth = 3; x.lineCap = 'round';
    for (let y = y0, n = 0; y < y1; y += 17, n++) {
      if (r() < .1 && n > 2) { n = 0; continue; }
      const end = r() < .15 ? x0 + (x1 - x0) * (.3 + r() * .4) : x1 - r() * 12;
      x.beginPath(); x.moveTo(x0 + (n === 0 ? 18 : 0), y); x.lineTo(end, y); x.stroke();
    }
    x.lineCap = 'butt';
  }
  A.book = (x, P, o = {}) => {
    const C = A.col(P), open = clamp(o.open ?? 1), cphi = Math.cos(Math.PI * (1 - open));
    x.fillStyle = C.cloth; x.beginPath(); x.roundRect(-PW - 12, top(PW) - 10, PW + 12, PH * TIP + 18, 5); x.fill();
    if (cphi > 0) { x.beginPath(); x.roundRect(0, top(PW) - 10, (PW + 12) * cphi, PH * TIP + 18, 5); x.fill(); }
    x.fillStyle = C.pageEdge; x.beginPath(); pagePath(x, -1, 1.02); x.fill();
    x.fillStyle = C.page; pagePath(x, -1); x.fill();
    x.save(); pagePath(x, -1); x.clip();
    textLines(x, P, -PW + 30, -30, top(-PW) + 46, -38, 11);
    const g = x.createLinearGradient(-60, 0, 0, 0); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, 'rgba(60,40,20,.28)'); x.fillStyle = g; x.fillRect(-60, -PH, 60, PH);
    x.restore();
    if (cphi > 0) {
      x.fillStyle = C.pageEdge; x.beginPath(); pagePath(x, 1, 1.02 * cphi); x.fill();
      x.fillStyle = C.page; pagePath(x, 1, cphi); x.fill();
      x.save(); pagePath(x, 1, cphi); x.clip(); x.scale(cphi, 1);
      if (o.plate) { x.save(); x.translate(PLATE.x, PLATE.y); o.plate(x, PLATE.w, PLATE.h); x.restore(); }
      const k = clamp(o.caption ?? 0);
      x.strokeStyle = F.rgba(F.hex(P.ink), .18 + .32 * k); x.lineWidth = 1.5; x.strokeRect(CAP.x, CAP.y, CAP.w, CAP.h);
      if (k > 0) {
        x.save(); x.font = '600 21px NS'; x.textAlign = 'center'; x.textBaseline = 'middle';
        if (x.letterSpacing !== undefined) x.letterSpacing = '3px';
        x.fillStyle = F.rgba(F.hex(P.ink), .92 * smooth(k * 1.4)); x.fillText(o.captionText || 'DELHI', CAP.x + CAP.w / 2 + 1.5, CAP.y + CAP.h / 2 + 1);
        if (k < 1) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = F.rgba(F.hex(C.page), 1 - smooth(k)); x.fillRect(CAP.x + CAP.w * k, CAP.y, CAP.w, CAP.h); }
        x.restore();
      }
      textLines(x, P, 30, PW - 30, CAP.y + CAP.h + 30, -38, 12);
      const g2 = x.createLinearGradient(0, 0, 60, 0); g2.addColorStop(0, 'rgba(60,40,20,.28)'); g2.addColorStop(1, 'rgba(60,40,20,0)'); x.fillStyle = g2; x.fillRect(0, -PH, 60, PH);
      x.restore();
    } else {
      x.fillStyle = C.cloth; x.beginPath(); x.roundRect((PW + 12) * cphi, top(PW) - 10, -(PW + 12) * cphi, PH * TIP + 18, 5); x.fill();
      x.fillStyle = C.clothLight; x.fillRect((PW + 12) * cphi + 6, top(PW) - 4, -(PW + 12) * cphi * .08, PH * TIP + 6);
    }
    x.fillStyle = mix(C.cloth, P.ink, .3); x.fillRect(-4, top(0) - 4, 8, PH * TIP + 6);
  };
  A.closedBook = (x, P, flat = 0) => {
    const C = A.col(P), f = clamp(flat), w = PW + 12, faceH = lerp(PH * TIP + 18, (PH + 18) * A.SV, f), th = 46 * f;
    if (th > .5) {
      x.fillStyle = C.cloth; x.fillRect(-w / 2, -th, w, th);
      x.fillStyle = C.page; x.fillRect(-w / 2 + 4, -th + 6, w - 8, th - 12);
      x.strokeStyle = C.pageEdge; x.lineWidth = 1.2; for (let i = 1; i < 4; i++) { const y = -th + 6 + (th - 12) * i / 4; x.beginPath(); x.moveTo(-w / 2 + 6, y); x.lineTo(w / 2 - 6, y); x.stroke(); }
    }
    x.fillStyle = C.cloth; x.beginPath(); x.roundRect(-w / 2, -th - faceH, w, faceH, 5); x.fill();
    x.strokeStyle = C.gilt; x.lineWidth = 2.5; x.strokeRect(-w / 2 + 22, -th - faceH + faceH * .08, w - 44, faceH * .84);
    x.fillStyle = mix(C.cloth, P.cream, .1); x.fillRect(-w / 2 + 4, -th - faceH + 3, w - 8, 4);
    return th;
  };
  A.stand = (x, P, part = 'all') => {
    const C = A.col(P), L = A.BOOK.LEDGE;
    if (part !== 'front') { x.fillStyle = mix(C.wood, P.ink, .15); for (const s of [-1, 1]) { x.save(); x.translate(s * (PW - 30), -L); x.rotate(-s * .06); x.fillRect(-9, -PH * .7, 18, PH * .7); x.restore(); } }
    if (part !== 'back') {
      x.fillStyle = C.woodDark; x.fillRect(-PW - 34, -L - 4, 2 * PW + 68, 20);
      x.fillStyle = mix(C.wood, P.cream, .15); x.fillRect(-PW - 34, -L - 4, 2 * PW + 68, 5);
      x.fillStyle = C.woodDark; x.fillRect(-PW - 20, -L + 16, 40, L - 16); x.fillRect(PW - 20, -L + 16, 40, L - 16);
    }
  };

  const BAL = A.BAL = { col: 440, arm: 262, drop: 215, pr: 170, ry: 29 };
  A.balanceAt = (u, v, beam = 0, sway = [0, 0]) => {
    const [bx, by] = at(u, v), pv = [bx, by - BAL.col], c = Math.cos(beam), s = Math.sin(beam);
    const hook = [-1, 1].map(k => [pv[0] + k * BAL.arm * c, pv[1] + k * BAL.arm * s]);
    const pan = hook.map((h, i) => [h[0] - Math.sin(sway[i]) * BAL.drop, h[1] + Math.cos(sway[i]) * BAL.drop, sway[i]]);
    return { base: [bx, by], pv, hook, pan, beam };
  };
  A.balanceBack = (x, P, g) => {
    const C = A.col(P), [bx, by] = g.base;
    x.fillStyle = C.woodDark; x.fillRect(bx - 170, by - 50, 340, 50);
    x.fillStyle = mix(C.woodDark, P.cream, .16); x.fillRect(bx - 170, by - 50, 340, 6);
    x.fillStyle = C.brassDark; x.beginPath(); x.ellipse(bx, by - 46, 84, 16, 0, 0, TAU); x.fill();
    x.fillStyle = C.brass; x.beginPath(); x.ellipse(bx, by - 52, 74, 13, 0, 0, TAU); x.fill();
    x.fillStyle = C.brass; x.fillRect(bx - 11, g.pv[1], 22, by - 52 - g.pv[1]);
    x.fillStyle = C.brassLight; x.fillRect(bx - 7, g.pv[1] + 10, 5, by - 62 - g.pv[1]);
    for (const yy of [by - 120, g.pv[1] + 40]) { x.fillStyle = C.brassDark; x.fillRect(bx - 17, yy, 34, 9); }
    x.save(); x.translate(g.pv[0], g.pv[1]); x.rotate(g.beam);
    x.fillStyle = C.brass; poly(x, [[-BAL.arm - 8, -4], [-20, -9], [20, -9], [BAL.arm + 8, -4], [BAL.arm + 8, 4], [20, 8], [-20, 8], [-BAL.arm - 8, 4]]); x.fill();
    x.fillStyle = C.brassLight; x.fillRect(-BAL.arm, -5, 2 * BAL.arm, 3);
    for (const k of [-1, 1]) { x.beginPath(); x.arc(k * BAL.arm, 0, 9, 0, TAU); x.fillStyle = C.brassDark; x.fill(); }
    x.fillStyle = C.brassDark; poly(x, [[-4, -8], [0, -86], [4, -8]]); x.fill();
    x.restore();
    x.fillStyle = C.brassDark; x.beginPath(); x.arc(g.pv[0], g.pv[1], 13, 0, TAU); x.fill();
    for (let i = 0; i < 2; i++) {
      const h = g.hook[i], [px, py, s] = g.pan[i], c = Math.cos(s), sn = Math.sin(s), rim = k => [px + k * BAL.pr * c, py + k * BAL.pr * sn];
      x.strokeStyle = C.brassDark; x.lineWidth = 3; x.setLineDash([7, 4]);
      for (const k of [-.94, 0, .94]) { const r = rim(k); x.beginPath(); x.moveTo(h[0], h[1]); x.lineTo(r[0], r[1] - (k === 0 ? BAL.ry * .7 : 0)); x.stroke(); }
      x.setLineDash([]);
      x.save(); x.translate(px, py); x.rotate(s);
      x.fillStyle = C.brassDark; x.beginPath(); x.ellipse(0, 0, BAL.pr, 24 + BAL.ry, 0, 0, Math.PI); x.fill();
      x.fillStyle = C.brass; x.beginPath(); x.ellipse(0, 0, BAL.pr, BAL.ry, 0, 0, TAU); x.fill();
      x.fillStyle = mix(C.brass, P.ink, .12); x.beginPath(); x.ellipse(0, 3, BAL.pr - 12, BAL.ry - 6, 0, 0, TAU); x.fill();
      x.restore();
    }
  };
  A.balanceLip = (x, P, g, i) => {
    const C = A.col(P), [px, py, s] = g.pan[i];
    x.save(); x.translate(px, py); x.rotate(s);
    x.fillStyle = C.brass; x.beginPath(); x.ellipse(0, 0, BAL.pr, BAL.ry, 0, 0, Math.PI); x.ellipse(0, 3, BAL.pr - 7, BAL.ry - 4, 0, Math.PI, 0, true); x.fill();
    x.fillStyle = C.brassLight; x.beginPath(); x.ellipse(0, 1, BAL.pr - 3, BAL.ry - 1, 0, Math.PI * .62, Math.PI * .92); x.ellipse(0, 3, BAL.pr - 7, BAL.ry - 4, 0, Math.PI * .92, Math.PI * .62, true); x.fill();
    x.restore();
  };

  A.folder = (x, P, u, v, h, w, d, th, o = {}) => {
    const C = A.col(P), cov = clamp(o.cover ?? 0), phi = Math.PI * cov, [X0, Y0] = at(u, v, h);
    const Yf = Y0 + d * A.SV;
    x.fillStyle = C.manilaDark; x.fillRect(X0, Y0, w, d * A.SV);
    x.fillStyle = mix(C.manilaDark, P.ink, .25); x.fillRect(X0, Yf, w, 4);
    if (th > 4) {
      x.fillStyle = C.paper; x.fillRect(X0 + 8, Yf - th + 2, w - 16, th - 2);
      x.strokeStyle = C.pageEdge; x.lineWidth = 1.5; for (let y = Yf - th + 6; y < Yf; y += 5) { x.beginPath(); x.moveTo(X0 + 10, y); x.lineTo(X0 + w - 10, y + (y % 3)); x.stroke(); }
      x.fillStyle = C.page; x.fillRect(X0 + 8, Y0 - th + 6, w - 16, d * A.SV);
    }
    if (o.inside && cov > .5) { x.save(); x.translate(X0, Y0 - th); x.transform(1, 0, 0, A.SV, 0, 0); o.inside(x); x.restore(); }
    x.save(); x.transform(Math.cos(phi), -Math.sin(phi), 0, A.SV, X0, Y0 - th - 2);
    const out = phi < Math.PI / 2;
    x.fillStyle = out ? C.manila : mix(C.manila, P.cream, .25); x.fillRect(0, 0, w, d);
    x.fillStyle = mix(C.manila, P.ink, .12); x.fillRect(0, d - 6, w, 6);
    if (out) {
      x.fillStyle = mix(C.manila, P.wood, .22); poly(x, [[w * .55, -1], [w * .85, -1], [w * .9, -16], [w * .6, -16]]); x.fill();
      if (o.label) {
        const lw = w * .74, lh = 118, lx = (w - lw) / 2, ly = d * .3;
        x.fillStyle = P.card; x.fillRect(lx, ly, lw, lh);
        x.strokeStyle = F.rgba(F.hex(P.ink), .55); x.lineWidth = 2; x.strokeRect(lx + 6, ly + 6, lw - 12, lh - 12);
        x.fillStyle = P.ink; x.font = '900 46px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle';
        o.label.forEach((s, i) => x.fillText(s, w / 2, ly + lh / 2 + (i - (o.label.length - 1) / 2) * 46));
      }
    }
    x.restore();
    const tp = o.tape == null ? null : clamp(o.tape);
    if (tp != null && tp > 0) {
      const slide = tp < .5 ? (1 - tp * 2) * w * .7 : 0, a = tp < .5 ? smooth(tp * 2) : 1, tx = X0 + w * .5 + slide;
      x.save(); x.globalAlpha = a;
      const tapeC = mix(P.parchment, P.wood, .45);
      x.fillStyle = tapeC; x.fillRect(tx - 9, Y0 - th - 2, 18, d * A.SV + th + 2);
      x.fillStyle = mix(tapeC, P.ink, .2); x.fillRect(tx - 9, Yf - th - 2, 18, 3);
      const bow = tp >= .5 ? (tp - .5) * 2 : 0, cy = Yf - th * .45, loose = 1 - bow;
      x.strokeStyle = tapeC; x.lineWidth = 9; x.lineCap = 'round';
      if (bow > 0) for (const k of [-1, 1]) { x.beginPath(); x.ellipse(tx + k * 22 * bow, cy - 6, 22 * bow, 12 * bow, k * .3, 0, TAU); x.stroke(); }
      for (const k of [-1, 1]) { x.beginPath(); x.moveTo(tx, cy); x.quadraticCurveTo(tx + k * (18 + 40 * loose), cy + 26, tx + k * (26 + 70 * loose), cy + 40 + 8 * loose); x.stroke(); }
      x.fillStyle = mix(tapeC, P.ink, .15); x.beginPath(); x.arc(tx, cy, 9, 0, TAU); x.fill();
      x.lineCap = 'butt'; x.restore();
    }
  };
  A.engrave = (src, rect, o = {}) => {
    const [cx, cy, cw, ch] = rect.map(Math.round), period = o.period || 5;
    const [sc, sx] = F.canvas(cw, ch); sx.drawImage(src, cx, cy, cw, ch, 0, 0, cw, ch);
    const d = sx.getImageData(0, 0, cw, ch).data, n = cw * ch, lum = new Float32Array(n);
    let lo = 1, hi = 0;
    for (let i = 0; i < n; i++) { const l = (.3 * d[i * 4] + .59 * d[i * 4 + 1] + .11 * d[i * 4 + 2]) / 255; lum[i] = l; }
    const hist = new Uint32Array(256); for (let i = 0; i < n; i++) hist[Math.min(255, lum[i] * 255 | 0)]++;
    for (let k = 0, acc = 0; k < 256; k++) { acc += hist[k]; if (acc > n * .02 && lo === 1) lo = k / 255; if (acc > n * .97) { hi = k / 255; break; } }
    const L = i => clamp((lum[i] - lo) / Math.max(.05, hi - lo));
    const edge = new Float32Array(n);
    for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) {
      const i = y * cw + x, gx = L(i + 1) - L(i - 1) + .5 * (L(i - cw + 1) - L(i - cw - 1) + L(i + cw + 1) - L(i + cw - 1)), gy = L(i + cw) - L(i - cw) + .5 * (L(i + cw - 1) - L(i - cw - 1) + L(i + cw + 1) - L(i - cw + 1));
      edge[i] = Math.hypot(gx, gy);
    }
    const vig = (x, y) => {
      const u = x / cw * 2 - 1, v = y / ch * 2 - 1, wob = .04 * Math.sin(x * .031 + y * .017) + .03 * Math.sin(y * .047 - x * .011);
      const r = Math.pow(Math.pow(Math.abs(u), 4) + Math.pow(Math.abs(v), 4), .25) + wob;
      return 1 - smooth((r - .78) / .2);
    };
    const mk = () => { const [c, x] = F.canvas(cw, ch); return [c, x, x.createImageData(cw, ch)]; };
    const [pc, px, pim] = mk(), [gc, gx, gim] = mk(), [mc, mx, mim] = mk();
    const ink = F.hex(o.ink || '#2c2824'), lead = F.hex(o.lead || '#5f5b55');
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = y * cw + x, j = i * 4, v = vig(x, y), dk = 1 - L(i), e = clamp(edge[i] * 2.2);
      const ph = (y + 1.6 * Math.sin(x * .021 + y * .008)) / period, f = Math.abs(ph - Math.floor(ph) - .5) * 2;
      const line = clamp((dk * 1.08 - f) * 2.4 + .35), a = Math.max(line * (dk > .06 ? 1 : 0), e) * v;
      pim.data[j] = ink[0]; pim.data[j + 1] = ink[1]; pim.data[j + 2] = ink[2]; pim.data[j + 3] = 255 * clamp(a * .96);
      const e2 = clamp(edge[Math.min(n - 1, i + 2 * cw + 3)] * 1.6), grain = .55 + .45 * F.hash(x >> 1, y >> 1, 7);
      const hp = (x + y) / 9, hf = Math.abs(hp - Math.floor(hp) - .5) * 2, hatch = dk > .4 ? clamp((dk - .4) * 1.8 - hf * 1.2 + .25) * .7 : 0;
      const g = Math.max(e * 1.5, e2 * .9, hatch) * grain * v;
      gim.data[j] = lead[0]; gim.data[j + 1] = lead[1]; gim.data[j + 2] = lead[2]; gim.data[j + 3] = 255 * clamp(g);
      mim.data[j] = mim.data[j + 1] = mim.data[j + 2] = 255; mim.data[j + 3] = 255 * v;
    }
    px.putImageData(pim, 0, 0); gx.putImageData(gim, 0, 0); mx.putImageData(mim, 0, 0);
    return { print: pc, pencil: gc, mask: mc, w: cw, h: ch };
  };

  A.profile = (x, P, o = {}) => {
    const skin = mix(P.skin, P.wood, .08), shade = mix(skin, P.ink, .16), hair = mix(P.ink, P.wood, .25), shirt = mix(P.coat, P.cream, .18);
    x.fillStyle = shirt; poly(x, [[-74, 12], [-72, -8], [-60, -20], [-26, -29], [22, -29], [48, -21], [62, -8], [66, 12]]); x.fill();
    x.fillStyle = mix(shirt, P.ink, .2); poly(x, [[-10, -30], [4, -18], [20, -30]]); x.fill();
    x.save(); x.translate(0, -30); x.rotate(-.05 * clamp(o.back || 0)); x.translate(0, 30);
    x.fillStyle = shade; x.fillRect(-14, -54, 28, 26);
    x.fillStyle = skin; x.beginPath();
    x.moveTo(-13, -50); x.bezierCurveTo(-36, -56, -40, -92, -12, -101); x.bezierCurveTo(6, -107, 23, -97, 24, -86);
    x.lineTo(27, -79); x.quadraticCurveTo(24.5, -75.5, 26.5, -72.5); x.lineTo(37.5, -63.5); x.quadraticCurveTo(38.5, -60, 31, -59.2);
    x.lineTo(30.5, -57.5); x.quadraticCurveTo(33.5, -55.6, 30.4, -53.6); x.lineTo(29.6, -52.4); x.quadraticCurveTo(32.4, -50.4, 29.4, -48.2);
    x.quadraticCurveTo(29.5, -44.5, 25.5, -43); x.quadraticCurveTo(17, -40.5, 12, -42); x.lineTo(11, -32); x.lineTo(-12, -32); x.closePath(); x.fill();
    x.fillStyle = hair; x.beginPath();
    x.moveTo(-13, -52); x.bezierCurveTo(-38, -58, -41, -94, -12, -102.5); x.bezierCurveTo(7, -108.5, 24, -98, 24.5, -88.5);
    x.quadraticCurveTo(12, -95, 1, -90); x.quadraticCurveTo(-8, -86, -10, -74); x.quadraticCurveTo(-12, -62, -13, -52); x.fill();
    x.fillStyle = shade; x.beginPath(); x.ellipse(-4.5, -71, 5, 8, .15, 0, TAU); x.fill();
    x.fillStyle = mix(skin, P.ink, .3); x.beginPath(); x.ellipse(-3.8, -70.5, 2.2, 4.5, .15, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.beginPath(); x.moveTo(15.5, -74); x.quadraticCurveTo(19.5, -76.6, 23.5, -74.4); x.quadraticCurveTo(19.5, -72.6, 15.5, -74); x.fill();
    x.fillStyle = mix(skin, P.ink, .45); x.fillRect(12, -61, 4, 1.6);
    const b = smooth(clamp(o.brow || 0));
    x.save(); x.translate(19, -79.5 - 5.5 * b); x.rotate(-.26 * b);
    x.fillStyle = hair; x.beginPath(); x.moveTo(-6.5, 1.2); x.quadraticCurveTo(0, -2.4 - 1.6 * b, 6.5, -.2); x.quadraticCurveTo(0, -.2 - 1.2 * b, -6.5, 2.2); x.fill();
    x.restore();
    x.restore();
  };

  A.copy = (x, P, kind, w, h, pic) => {
    const C = A.col(P), ink = a => F.rgba(F.hex(P.ink), a), r = rng(kind.length * 7 + 3);
    const bars = (x0, x1, y0, y1, gap, a, lw = 2.2) => { x.strokeStyle = ink(a); x.lineWidth = lw; for (let y = y0; y < y1; y += gap) { x.beginPath(); x.moveTo(x0, y); x.lineTo(x1 - r() * (x1 - x0) * .2, y); x.stroke(); } };
    const put = (px, py, pw) => { const ph = pw * .75; x.fillStyle = mix(P.card, P.cream, .5); x.fillRect(px, py, pw, ph); x.save(); x.translate(px, py); pic(x, pw, ph); x.restore(); x.strokeStyle = ink(.35); x.lineWidth = 1.2; x.strokeRect(px, py, pw, ph); };
    if (kind === 'newspaper') {
      x.fillStyle = mix(P.card, P.sheetDim, .45); x.fillRect(0, 0, w, h);
      x.fillStyle = ink(.8); x.fillRect(w * .08, h * .06, w * .84, h * .09); x.fillStyle = ink(.4); x.fillRect(w * .08, h * .18, w * .84, 2);
      put(w * .08, h * .24, w * .5); bars(w * .63, w * .92, h * .26, h * .6, 8, .35, 1.8); bars(w * .08, w * .45, h * .66, h * .94, 8, .35, 1.8); bars(w * .52, w * .92, h * .66, h * .94, 8, .35, 1.8);
    } else if (kind === 'textbook') {
      x.fillStyle = C.cloth; x.fillRect(-6, -6, w + 12, h + 12);
      x.fillStyle = C.page; x.fillRect(0, 0, w / 2 - 2, h); x.fillRect(w / 2 + 2, 0, w / 2 - 2, h);
      bars(w * .06, w * .44, h * .1, h * .9, 10, .35, 2); put(w * .56, h * .12, w * .38); bars(w * .56, w * .94, h * .66, h * .9, 10, .35, 2);
      x.fillStyle = 'rgba(60,40,20,.25)'; x.fillRect(w / 2 - 8, 0, 16, h);
    } else if (kind === 'magazine') {
      x.fillStyle = mix(P.sheet2, P.card, .35); x.fillRect(0, 0, w, h);
      x.fillStyle = P.card; x.fillRect(w * .08, h * .05, w * .84, h * .14); x.fillStyle = ink(.85); x.fillRect(w * .14, h * .08, w * .72, h * .08);
      put(w * .08, h * .25, w * .84); bars(w * .1, w * .7, h * .9, h * .97, 7, .5, 2);
    } else if (kind === 'postcard') {
      x.fillStyle = mix(P.card, P.cream, .5); x.fillRect(0, 0, w, h); put(w * .06, h * .08, Math.min(w * .7, h * .84 / .75));
      x.strokeStyle = ink(.5); x.lineWidth = 1.5; x.setLineDash([4, 3]); x.strokeRect(w * .8, h * .06, w * .14, h * .2); x.setLineDash([]);
    } else {
      x.fillStyle = mix(P.card, P.parchment, .3); x.fillRect(0, 0, w, h);
      x.fillStyle = ink(.85); x.fillRect(w * .1, h * .05, w * .8, h * .13); put(w * .2, h * .24, w * .6); x.fillStyle = ink(.6); x.fillRect(w * .15, h * .8, w * .7, h * .06);
    }
    x.strokeStyle = ink(.25); x.lineWidth = 1; x.strokeRect(0, 0, w, h);
  };

  A.paper = (x, P, kind, w, h, seed = 1) => {
    const C = A.col(P), r = rng(seed), ink = a => F.rgba(F.hex(P.ink), a);
    x.fillStyle = kind === 'receipt' ? mix(P.card, P.parchment, .5) : kind === 'report' ? P.card : mix(P.card, P.cream, .4);
    x.fillRect(0, 0, w, h);
    x.strokeStyle = mix(C.pageEdge, P.ink, .1); x.lineWidth = 1.2; x.strokeRect(.5, .5, w - 1, h - 1);
    const lines = (x0, x1, y0, y1, gap, a, lw = 2.4) => { x.strokeStyle = ink(a); x.lineWidth = lw; x.lineCap = 'round'; for (let y = y0; y < y1; y += gap) { x.beginPath(); x.moveTo(x0, y); x.lineTo(x1 - r() * (x1 - x0) * .25, y); x.stroke(); } x.lineCap = 'butt'; };
    const stamp = (cx, cy, rad) => { x.save(); x.translate(cx, cy); x.rotate(r() - .5); x.strokeStyle = ink(.55); x.lineWidth = 3; x.beginPath(); x.arc(0, 0, rad, 0, TAU); x.stroke(); x.lineWidth = 1.6; x.beginPath(); x.arc(0, 0, rad * .72, 0, TAU); x.stroke(); x.fillStyle = ink(.45); x.fillRect(-rad * .5, -3, rad, 6); x.restore(); };
    const scrawl = (x0, y0, len) => { x.strokeStyle = ink(.7); x.lineWidth = 2.2; x.beginPath(); x.moveTo(x0, y0); for (let i = 1; i <= 8; i++) x.quadraticCurveTo(x0 + len * (i - .5) / 8, y0 + (i % 2 ? -12 : 10) * r(), x0 + len * i / 8, y0 + (r() - .5) * 6); x.stroke(); };
    if (kind === 'letter') { lines(w * .12, w * .5, h * .08, h * .16, 9, .5, 2); lines(w * .12, w * .88, h * .24, h * .74, 12, .42); scrawl(w * .5, h * .84, w * .32); stamp(w * .24, h * .84, w * .1); }
    else if (kind === 'list') {
      x.fillStyle = ink(.6); x.fillRect(w * .1, h * .07, w * .8, 5);
      for (let c = 0; c < 3; c++) { const cx = w * (.12 + c * .28); x.strokeStyle = ink(.5); x.lineWidth = 2.2; for (let y = h * .16; y < h * .9; y += 11) { x.beginPath(); for (let d = 0; d < 3 + (r() * 2 | 0); d++) { x.moveTo(cx + d * 8, y - 4); x.lineTo(cx + d * 8 + 2, y + 4); } x.stroke(); } }
      x.strokeStyle = ink(.3); x.lineWidth = 1; for (const c of [.38, .66]) { x.beginPath(); x.moveTo(w * c, h * .14); x.lineTo(w * c, h * .92); x.stroke(); }
    } else if (kind === 'report') { x.fillStyle = ink(.75); x.fillRect(w * .1, h * .07, w * .8, h * .06); lines(w * .1, w * .9, h * .2, h * .9, 8, .38, 2); x.fillStyle = ink(.35); x.fillRect(w * .1, h * .16, w * .8, 2); }
    else { x.fillStyle = ink(.65); x.fillRect(w * .15, h * .08, w * .7, 6); lines(w * .15, w * .85, h * .2, h * .42, 10, .4, 2); x.strokeStyle = ink(.4); x.lineWidth = 1.5; x.strokeRect(w * .12, h * .5, w * .76, h * .2); scrawl(w * .18, h * .6, w * .4); stamp(w * .7, h * .82, w * .13); }
  };
})();
