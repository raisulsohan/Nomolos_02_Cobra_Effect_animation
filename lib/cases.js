(function () {
  'use strict';
  const F = FILM, { TAU, clamp, smooth, lerp } = F, mix = F.city.mix, PR = F.props;
  const CS = (F.cases = {});
  CS.CURVE = [[0, .82], [.1, .8], [.22, .66], [.34, .5], [.46, .38], [.56, .36], [.66, .44], [.76, .6], [.85, .76], [.92, .86]];

  CS.pot = (x, P, cx, cy, s = 1) => {
    const tc = mix(P.roof, P.amberDark, .35);
    x.fillStyle = mix(tc, P.ink, .2); x.fillRect(cx - 44 * s, cy - 6 * s, 88 * s, 12 * s);
    x.fillStyle = tc; x.beginPath(); x.moveTo(cx - 40 * s, cy + 6 * s); x.lineTo(cx + 40 * s, cy + 6 * s); x.lineTo(cx + 30 * s, cy + 70 * s); x.lineTo(cx - 30 * s, cy + 70 * s); x.closePath(); x.fill();
    x.fillStyle = mix(P.woodDark, P.ink, .3); x.fillRect(cx - 40 * s, cy - 2 * s, 80 * s, 4 * s);
  };
  CS.seedling = (x, P, o) => {
    const h = o.h || 120, d = clamp(o.droop || 0), k = clamp(o.k ?? 1), col = o.col || P.cream;
    x.save(); x.translate(o.x || 0, o.y || 0);
    const top = [Math.sin(d * 1.1) * h * .45, -h * (1 - d * .38)], mid = [d * h * .06, -h * .55];
    const leaf = (sgn) => { const a = -Math.PI / 2 + sgn * (.9 + d * 1.2); const L = h * .42 * (1 - d * .15);
      const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L], c1 = [top[0] + Math.cos(a - sgn * .5) * L * .6, top[1] + Math.sin(a - sgn * .5) * L * .6], c2 = [top[0] + Math.cos(a + sgn * .5) * L * .6, top[1] + Math.sin(a + sgn * .5) * L * .6];
      x.moveTo(top[0], top[1]); x.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); x.quadraticCurveTo(c2[0], c2[1], top[0], top[1]); };
    const path = () => { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(mid[0], mid[1], top[0], top[1]); leaf(1); leaf(-1); };
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.globalAlpha = .35 * k; x.strokeStyle = col; x.lineWidth = 10; x.filter = `blur(${o.blur ?? 6}px)`; path(); x.stroke(); x.filter = 'none';
    x.globalAlpha = k; x.setLineDash([9, 7]); x.lineWidth = 3.4; path(); x.stroke(); x.setLineDash([]);
    x.restore();
  };

  CS.ruler = (x, P, o) => {
    const L0 = o.len0 || 300, s = 1 + (o.stretch || 0), len = L0 * s, w0 = o.w || 44, wd = w0 / Math.sqrt(s), amber = P.amber, n = 10;
    x.save(); x.translate(o.x || 0, o.y || 0);
    x.fillStyle = mix(amber, P.ink, .25); x.beginPath(); x.roundRect(-wd / 2 + 3, -len + 3, wd, len, 5); x.fill();
    x.fillStyle = amber; x.beginPath(); x.roundRect(-wd / 2, -len, wd, len, 5); x.fill();
    x.strokeStyle = mix(amber, P.ink, .7); x.lineWidth = 2.2;
    for (let i = 0; i <= n * 2; i++) { const y = -len * i / (n * 2), major = i % 2 === 0; x.beginPath(); x.moveTo(-wd / 2, y); x.lineTo(-wd / 2 + (major ? wd * .55 : wd * .3), y); x.stroke(); }
    x.fillStyle = mix(amber, P.ink, .75); x.font = `900 ${Math.min(18, wd * .38)}px NSC`; x.textAlign = 'right'; x.textBaseline = 'middle';
    for (let i = 2; i <= n; i += 2) x.fillText(String(i), wd / 2 - 4, -len * i / n);
    if (o.target > 0) {
      const r = 26 * smooth(o.target); x.save(); x.translate(0, -len);
      [[1, P.red], [.66, P.cream], [.33, P.red]].forEach(([f, c]) => { x.fillStyle = c === P.red ? mix(P.amberDark, P.ink, .2) : P.cream; x.beginPath(); x.arc(0, 0, r * f, 0, TAU); x.fill(); });
      x.restore();
    }
    if (o.pull > 0) {
      x.strokeStyle = F.rgba(F.hex(P.cream), .6 * o.pull); x.lineWidth = 2;
      for (const dx of [-wd * .9, wd * .9, -wd * .5, wd * .5]) { x.beginPath(); x.moveTo(dx, -len - 10); x.lineTo(dx * 1.2, -len - 44 - Math.abs(dx) * .3); x.stroke(); }
    }
    x.restore();
    return -len * 1;
  };

  CS.cobraCurve = (x, P, o) => {
    const pts = F.rope.smooth(CS.CURVE.map(([u, v]) => [o.x + u * o.w, o.y + (1 - v) * o.h]), 60), n = Math.max(2, Math.round(pts.length * clamp(o.upto ?? 1)));
    x.strokeStyle = o.col || P.ink; x.lineWidth = o.width || 6; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); pts.slice(0, n).forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
    x.lineCap = 'butt'; x.lineJoin = 'miter';
  };

  CS.book = (x, P, o) => {
    const s = o.s || 1, cover = mix('#2f5a4a', P.ink, .1), gold = mix(P.cream, P.amber, .35);
    x.save(); x.translate(o.x || 0, o.y || 0); x.rotate(o.a || 0); x.scale(s, s);
    x.fillStyle = mix(cover, P.ink, .35); x.fillRect(-92, -128, 190, 262);
    x.fillStyle = mix(P.card, P.cream, .4); x.fillRect(-86, -124, 180, 254);
    x.fillStyle = cover; x.fillRect(-96, -132, 184, 262);
    x.fillStyle = mix(cover, P.ink, .25); x.fillRect(-96, -132, 14, 262);
    x.strokeStyle = gold; x.lineWidth = 2; x.strokeRect(-74, -118, 148, 234);
    x.fillStyle = gold; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 23px NSC'; x.fillText('DER KOBRA-', 0, -86); x.fillText('EFFEKT', 0, -60);
    CS.cobraCurve(x, { ...P, ink: gold }, { x: -52, y: -34, w: 104, h: 70, width: 5 });
    x.font = '600 14px NS'; x.fillText('HORST SIEBERT', 0, 70); x.font = '900 16px NSC'; x.fillText('2001', 0, 94);
    x.restore();
  };

  CS.arcText = (x, text, cx, cy, r, a, size, col) => {
    x.save(); x.font = `900 ${size}px NSC`; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
    const ws = [...text].map(c => x.measureText(c).width), total = ws.reduce((p, q) => p + q, 0) * 1.08;
    let ang = a - total / r / 2;
    [...text].forEach((c, i) => { const da = ws[i] * 1.08 / r; ang += da / 2; x.save(); x.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); x.rotate(ang + Math.PI / 2); x.fillText(c, 0, 0); x.restore(); ang += da / 2; });
    x.restore();
  };

  CS.cast = P => ({
    paleo: { coat: '#9a8a68', trouser: '#5a5040', skin: '#d8b08a', head: 'topi', headColor: '#b8a47a', hair: '#3a2c22', shoe: mix(P.wood, P.ink, .5), shadow: 0 },
    farmer: { coat: '#56657a', trouser: '#3d3a44', skin: '#b88a62', head: 'cap', headColor: '#c9b98f', shoe: mix(P.wood, P.ink, .5), shadow: 0 },
    banker: { coat: '#3b4556', trouser: '#2c3240', skin: '#d8b28c', head: 'bare', hair: '#4a3a2c', shoe: P.ink, shadow: 0 },
    lead: { coat: '#6a5566', trouser: '#3a3a40', skin: '#c89b72', head: 'bare', hair: '#2a211c', shoe: P.ink, shadow: 0 },
  });

  const DINO = [[-230, -30], [-170, -52], [-110, -84], [-50, -118], [10, -126], [60, -118], [96, -140], [124, -190], [146, -236], [172, -250], [196, -244], [190, -232], [164, -226],
    [140, -180], [118, -120], [104, -86], [96, -40], [100, 0], [80, 0], [70, -46], [30, -58], [-10, -58], [-26, 0], [-48, 0], [-50, -52], [-110, -52], [-170, -36], [-230, -30]];
  CS.dino = (x, P, o) => {
    const s = o.s || 1, sh = clamp(o.shatter || 0), n = o.n || 20, col = P.cream, pts = F.rope.smooth(DINO, 180);
    x.save(); x.translate(o.x || 0, o.y || 0); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
    const per = Math.floor(pts.length / n);
    for (let i = 0; i < n; i++) {
      const seg = pts.slice(i * per, i === n - 1 ? pts.length : (i + 1) * per + 1); if (seg.length < 2) continue;
      const d = clamp((sh - (i % 7) * .04) / .8), mx = seg[0][0], my = seg[0][1];
      x.save(); x.translate(mx + (F.hash(i, 9) - .5) * 60 * d, my + d * d * 520); x.rotate((F.hash(i, 8) - .5) * 3 * d); x.translate(-mx, -my);
      x.globalAlpha = (o.alpha ?? 1) * (1 - smooth((d - .7) / .3));
      const path = () => { x.beginPath(); seg.forEach((p, j) => j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); };
      x.strokeStyle = col; x.globalAlpha *= .4; x.lineWidth = 9; x.filter = 'blur(5px)'; path(); x.stroke(); x.filter = 'none'; x.globalAlpha /= .4;
      x.setLineDash([10, 8]); x.lineWidth = 3.4; path(); x.stroke(); x.setLineDash([]);
      x.restore();
    }
    x.restore();
  };
  CS.bone = (x, P, cx, cy, len, a, col) => {
    const c = col || mix(P.cream, P.wood, .25), r = len * .16;
    x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = c;
    x.fillRect(-len / 2 + r, -r * .55, len - 2 * r, r * 1.1);
    for (const s of [-1, 1]) { x.beginPath(); x.arc(s * (len / 2 - r), -r * .5, r * .75, 0, TAU); x.arc(s * (len / 2 - r), r * .5, r * .75, 0, TAU); x.fill(); }
    x.strokeStyle = mix(c, P.ink, .3); x.lineWidth = Math.max(1, len * .015); x.beginPath(); x.moveTo(-len * .2, -r * .2); x.lineTo(len * .1, r * .1); x.stroke();
    x.restore();
  };

  CS.emblem = (x, P, kind, cx, cy, r, look = 'flat') => {
    x.save(); x.translate(cx, cy);
    x.fillStyle = mix(P.card, P.cream, .3); x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
    x.strokeStyle = mix(P.amber, P.ink, .2); x.lineWidth = r * .08; x.stroke();
    const ink = P.ink, u = r / 40; x.strokeStyle = ink; x.fillStyle = ink; x.lineWidth = 3 * u; x.lineCap = 'round';
    if (kind === 'tail') { x.beginPath(); x.moveTo(-22 * u, 10 * u); x.quadraticCurveTo(0, -18 * u, 24 * u, -4 * u); x.stroke(); }
    else if (kind === 'coin') { PR.coin(x, P, look, 0, 0, 20 * u, 0); }
    else if (kind === 'clipboard') { x.fillStyle = mix(P.wood, P.cream, .2); x.fillRect(-16 * u, -22 * u, 32 * u, 44 * u); x.fillStyle = ink; x.fillRect(-8 * u, -26 * u, 16 * u, 8 * u); for (const y of [-8, 2, 12]) { x.beginPath(); x.moveTo(-10 * u, y * u); x.lineTo(10 * u, y * u); x.stroke(); } }
    else if (kind === 'report') { x.fillStyle = P.card; x.fillRect(-16 * u, -22 * u, 32 * u, 44 * u); x.strokeRect(-16 * u, -22 * u, 32 * u, 44 * u); x.font = `900 ${22 * u}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('A+', 0, 2 * u); }
    else if (kind === 'stopwatch') { x.beginPath(); x.arc(0, 4 * u, 18 * u, 0, TAU); x.stroke(); x.fillRect(-4 * u, -22 * u, 8 * u, 6 * u); x.beginPath(); x.moveTo(0, 4 * u); x.lineTo(8 * u, -6 * u); x.stroke(); }
    x.restore();
  };
})();
