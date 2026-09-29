(function () {
  'use strict';
  const F = FILM, mix = F.city.mix, { hash, clamp } = F;
  const R = (F.rulers = {});
  R.TODDLER = .52;

  R.cast = P => ({
    minister: { coat: mix('#2f3542', P.coat, .1), trouser: mix('#2a2c33', P.ink, .1), skin: '#d8b28c', head: 'bare', hair: '#a19c93', shoe: mix(P.ink, P.wood, .25) },
    boss: { coat: mix('#5a6e7c', P.coat, .15), trouser: '#3b3f47', skin: '#c99d74', head: 'bare', hair: '#3a2a20', hem: 0, shoe: mix(P.wood, P.ink, .55) },
    mother: { kind: 'woman', coat: '#5d8a78', trouser: mix('#8a6044', P.ink, .1), skin: '#c8966c', head: 'bare', hair: '#2b1d17', shoe: mix(P.wood, P.ink, .4) },
    toddler: { coat: '#a393c0', trouser: '#6f6488', skin: '#d2a27a', head: 'bare', hair: '#3a2a20', hem: 0, shoe: mix(P.wood, P.ink, .4) },
  });

  const COATS = ['#6f7a5a', '#8a5a44', '#56657a', '#9a8a68', '#6a5566', '#4f6b6a', '#7d6a55', '#5c5f6b', '#8c7358', '#607a86', '#735048', '#86826c'];
  const TROU = ['#3a3a40', '#4a4036', '#2f3845', '#50483e', '#3d3a44'];
  const SKIN = ['#dcb58f', '#c89b72', '#a97c55', '#e3c3a0', '#8f6444', '#b88a62'];
  const HAIR = ['#2a211c', '#3a2a20', '#1f1a17', '#5a4533', '#8c8479', '#2b1d17'];
  R.crowd = (P, n = 12) => Array.from({ length: n }, (_, i) => {
    const woman = hash(i, 301) < .42, s = .9 + hash(i, 302) * .14;
    const hat = hash(i, 303), head = woman ? (hat < .35 ? 'drape' : 'bare') : hat < .3 ? 'cap' : 'bare';
    const look = { coat: COATS[(i * 5 + 3) % COATS.length], trouser: TROU[i % TROU.length], skin: SKIN[(i * 7 + 1) % SKIN.length], head, hair: HAIR[(i * 3 + 2) % HAIR.length],
      headColor: head === 'drape' ? mix(COATS[(i * 5 + 8) % COATS.length], P.cream, .35) : head === 'cap' ? mix(P.ink, P.coat, .4) : undefined,
      shoe: mix(P.wood, P.ink, .35 + hash(i, 304) * .3), hem: woman ? undefined : hash(i, 305) < .55 ? 0 : undefined };
    if (woman) look.kind = 'woman';
    return { look, s, seed: 400 + i, woman };
  });

  R.room = (o, i) => {
    const floor = o.g - i * o.sh, ceil = floor - (o.sh - o.slab), cy = (floor + ceil) / 2;
    const s = z => 1 - (1 - o.k) * z;
    const at = (X, Y, z) => [o.vx + (X - o.vx) * s(z), cy + (Y - cy) * s(z)];
    return { i, floor, ceil, cy, s, at, vx: o.vx, xl: o.x0 + o.wt, xr: o.x1 };
  };
  const quad = (x, pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); };
  R.quad = quad;
  R.box = (x, rm, a, b, h, z0, z1, c, yBase) => {
    const y0 = yBase ?? rm.floor, y1 = y0 - h, A = rm.at, sideX = (a + b) / 2 > rm.vx ? a : b;
    quad(x, [A(sideX, y0, z0), A(sideX, y1, z0), A(sideX, y1, z1), A(sideX, y0, z1)], c.side);
    if (y1 > rm.cy) quad(x, [A(a, y1, z0), A(b, y1, z0), A(b, y1, z1), A(a, y1, z1)], c.top);
    quad(x, [A(a, y0, z0), A(b, y0, z0), A(b, y1, z0), A(a, y1, z0)], c.front);
  };

  const ROOMS = [
    { wall: '#e6cdb4', floor: '#9a6c48', ceil: '#efe0cc' },
    { wall: '#dcd2b2', floor: '#7d5a3f', ceil: '#ece2c8' },
    { wall: '#cdd2c2', floor: '#4f5a70', ceil: '#e6e6d8' },
  ];
  R.ROOMS = ROOMS;
  R.lampAt = (o, i) => { const rm = R.room(o, i), X = [o.x1 - 250, o.x1 - 300, o.x1 - 420][i]; return rm.at(X, rm.ceil + 34, .3); };
  R.wallTop = (o, d) => { const top = o.g - 3 * o.sh; return top + (o.g - top) * d; };

  R.house = (x, P, o, st, part) => {
    const light = st.light || [1, 1, 1], yTop = R.wallTop(o, st.drop || 0);
    if (part === 'back') for (let i = 0; i < 3; i++) {
      const rm = R.room(o, i), C = ROOMS[i], A = rm.at, xl = rm.xl, xr = rm.xr;
      quad(x, [A(xl, rm.ceil, 1), A(xr, rm.ceil, 1), A(xr, rm.floor, 1), A(xl, rm.floor, 1)], C.wall);
      quad(x, [A(xl, rm.floor, 0), A(xr, rm.floor, 0), A(xr, rm.floor, 1), A(xl, rm.floor, 1)], C.floor);
      x.save(); x.strokeStyle = mix(C.floor, P.ink, .25); x.lineWidth = 1.1;
      for (let X = xl + 30; X < xr; X += 34) { const a = A(X, rm.floor, 0), b = A(X, rm.floor, 1); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
      x.restore();
      quad(x, [A(xl, rm.ceil, 0), A(xr, rm.ceil, 0), A(xr, rm.ceil, 1), A(xl, rm.ceil, 1)], C.ceil);
      quad(x, [A(xl, rm.ceil, 0), A(xl, rm.ceil, 1), A(xl, rm.floor, 1), A(xl, rm.floor, 0)], mix(C.wall, P.ink, .1));
      if (yTop < rm.floor) { const t0 = Math.max(rm.ceil, yTop); quad(x, [A(xr, t0, 0), A(xr, t0, 1), A(xr, rm.floor, 1), A(xr, rm.floor, 0)], mix(C.wall, P.ink, .16)); }
      x.fillStyle = mix(C.wall, P.ink, .22); { const a = A(xl, rm.floor - 8, 1), b = A(xr, rm.floor, 1); x.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      furnish(x, P, o, rm, st);
    }
    if (part === 'front') {
      const top = R.wallTop(o, 0), ridge = top - 78;
      for (let i = 0; i < 3; i++) {
        const rm = R.room(o, i), k = .62 * (1 - clamp(light[i]));
        if (k > .001) { x.fillStyle = F.rgba(F.hex('#161b28'), k); x.fillRect(rm.xl, rm.ceil, rm.xr - rm.xl, rm.floor - rm.ceil); }
      }
      for (let i = 1; i <= 3; i++) {
        const y0 = o.g - i * o.sh, h = o.slab;
        x.fillStyle = mix(P.wall, P.ink, .12); x.fillRect(o.x0, y0, o.x1 - o.x0, h);
        x.fillStyle = mix(P.wall, P.ink, .3); x.fillRect(o.x0, y0 + h - 3, o.x1 - o.x0, 3);
      }
      x.fillStyle = mix(P.wall, P.ink, .12); x.fillRect(o.x0, top, o.wt, o.g - top);
      x.fillStyle = mix(P.wall, P.ink, .3); x.fillRect(o.x0 + o.wt - 3, top, 3, o.g - top);
      x.fillStyle = mix(P.roof, P.ink, .15); x.fillRect(o.x0 + 90, ridge - 44, 40, 60);
      quad(x, [[o.x0 - 26, top + 4], [o.x1 + o.wt + 26, top + 4], [o.x1 + o.wt - 60, ridge], [o.x0 + 60, ridge]], P.roof);
      x.save(); x.strokeStyle = mix(P.roof, P.ink, .3); x.lineWidth = 1.4;
      for (let k = 1; k < 4; k++) { const y = top + 4 - k * (top + 4 - ridge) / 4, f = k / 4; x.beginPath(); x.moveTo(o.x0 - 26 + 86 * f, y); x.lineTo(o.x1 + o.wt + 26 - 86 * f, y); x.stroke(); }
      x.restore();
      if (yTop < o.g) {
        x.save(); x.beginPath(); x.rect(o.x1 - 2, top - 2, o.wt + 4, o.g - top + 2); x.clip();
        const dy = yTop - top;
        x.fillStyle = mix(P.wall, P.ink, .08); x.fillRect(o.x1, yTop, o.wt, o.g - top);
        x.fillStyle = mix(P.wall, P.ink, .28); x.fillRect(o.x1, yTop, 3, o.g - top); x.fillRect(o.x1 + o.wt - 3, yTop, 3, o.g - top);
        for (let i = 1; i < 3; i++) { const y = o.g - i * o.sh + dy; x.fillStyle = mix(P.wall, P.ink, .32); x.fillRect(o.x1, y + o.slab / 2 - 1, o.wt, 2); x.fillStyle = mix(P.ink, P.wood, .4); x.fillRect(o.x1 + 3, y + o.slab / 2 - 6, 4, 12); x.fillRect(o.x1 + o.wt - 7, y + o.slab / 2 - 6, 4, 12); }
        x.restore();
      }
    }
  };
  function furnish(x, P, o, rm, st) {
    const A = rm.at, X1 = o.x1, i = rm.i, ink = P.ink;
    const sky = (a, b, y0, y1) => {
      const p0 = A(a, y0, 1), p1 = A(b, y1, 1), g = x.createLinearGradient(0, p0[1], 0, p1[1]);
      g.addColorStop(0, '#3f5270'); g.addColorStop(1, '#c99a78'); x.fillStyle = g; x.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
      x.fillStyle = mix(P.wood, ink, .2); const m = (p0[0] + p1[0]) / 2, h = (p0[1] + p1[1]) / 2;
      x.fillRect(m - 1.5, p0[1], 3, p1[1] - p0[1]); x.fillRect(p0[0], h - 1.5, p1[0] - p0[0], 3);
      x.lineWidth = 4; x.strokeStyle = mix(P.wood, ink, .1); x.strokeRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
    };
    if (i === 2) {
      sky(X1 - 640, X1 - 560, rm.ceil + 22, rm.floor - 30); sky(X1 - 440, X1 - 360, rm.ceil + 22, rm.floor - 30);
      for (const px of [X1 - 700, X1 - 480, X1 - 160]) { x.fillStyle = mix(ROOMS[2].wall, ink, .08); const a = A(px, rm.ceil, 1), b = A(px + 26, rm.floor, 1); x.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      const pole = A(X1 - 520, rm.floor, .7), top = A(X1 - 520, rm.ceil + 18, .7);
      x.fillStyle = mix(P.wood, ink, .3); x.fillRect(pole[0] - 2, top[1], 4, pole[1] - top[1]);
      x.fillStyle = '#56657a'; x.fillRect(pole[0] + 2, top[1] + 4, 46, 16); x.fillStyle = P.cream; x.fillRect(pole[0] + 2, top[1] + 20, 46, 14); x.fillStyle = '#56657a'; x.fillRect(pole[0] + 2, top[1] + 34, 46, 16);
      R.box(x, rm, X1 - 300, X1 - 252, 64, .3, .5, { top: mix(P.wood, P.cream, .2), front: P.wood, side: mix(P.wood, ink, .25) });
      { const a = A(X1 - 304, rm.floor - 64, .28), b = A(X1 - 248, rm.floor - 64, .28); x.fillStyle = mix(P.wood, ink, .35); x.fillRect(a[0], a[1] - 4, b[0] - a[0], 5); }
    }
    if (i === 1) {
      sky(X1 - 700, X1 - 610, rm.ceil + 30, rm.floor - 50);
      { const a = A(X1 - 520, rm.ceil + 30, 1), b = A(X1 - 430, rm.floor - 60, 1); x.fillStyle = P.card; x.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); x.lineWidth = 2; x.strokeStyle = mix(P.wood, ink, .2); x.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
        x.fillStyle = mix(P.coat, P.cream, .2); const n = 5, bw = (b[0] - a[0]) / (n * 1.6); for (let k = 0; k < n; k++) { const h = (b[1] - a[1]) * (.2 + .13 * k); x.fillRect(a[0] + bw * (.6 + k * 1.6), b[1] - 4 - h, bw, h); } }
      { const c = A(X1 - 180, rm.ceil + 44, 1); x.fillStyle = P.cream; x.beginPath(); x.arc(c[0], c[1], 13, 0, F.TAU); x.fill(); x.lineWidth = 2.5; x.strokeStyle = mix(P.wood, ink, .3); x.stroke();
        x.lineWidth = 1.6; x.strokeStyle = ink; x.beginPath(); x.moveTo(c[0], c[1]); x.lineTo(c[0], c[1] - 8); x.moveTo(c[0], c[1]); x.lineTo(c[0] + 6, c[1] + 2); x.stroke(); }
      R.box(x, rm, X1 - 820, X1 - 760, 96, .45, .75, { top: '#8a8f86', front: '#77807a', side: '#5d6660' });
      R.box(x, rm, X1 - 420, X1 - 280, 46, .3, .62, { top: mix(P.wood, P.cream, .25), front: P.wood, side: mix(P.wood, ink, .25) });
      { const p = A(X1 - 400, rm.floor - 46, .5); x.fillStyle = P.card; x.fillRect(p[0], p[1] - 3, 34, 4); x.fillRect(p[0] + 6, p[1] - 6, 30, 3);
        const l = A(X1 - 300, rm.floor - 46, .55); x.fillStyle = mix(P.ink, P.wood, .3); x.fillRect(l[0] - 1, l[1] - 26, 2, 26); x.fillRect(l[0] - 7, l[1] - 2, 14, 3);
        x.fillStyle = '#56657a'; x.beginPath(); x.moveTo(l[0] - 10, l[1] - 22); x.lineTo(l[0] + 10, l[1] - 22); x.lineTo(l[0] + 5, l[1] - 32); x.lineTo(l[0] - 5, l[1] - 32); x.closePath(); x.fill(); }
    }
    if (i === 0) {
      sky(X1 - 480, X1 - 390, rm.ceil + 26, rm.floor - 56);
      { const a = A(X1 - 496, rm.ceil + 18, 1), b = A(X1 - 374, rm.floor - 44, 1); x.fillStyle = '#b98f86'; x.fillRect(a[0], a[1], 14, b[1] - a[1]); x.fillRect(b[0] - 14, a[1], 14, b[1] - a[1]); x.fillRect(a[0], a[1] - 4, b[0] - a[0], 6); }
      { const a = A(X1 - 230, rm.ceil + 40, 1), b = A(X1 - 170, rm.ceil + 84, 1); x.fillStyle = mix(P.wood, ink, .2); x.fillRect(a[0] - 3, a[1] - 3, b[0] - a[0] + 6, b[1] - a[1] + 6); x.fillStyle = '#9fb3a3'; x.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); x.fillStyle = '#7d9384'; x.beginPath(); x.moveTo(a[0], b[1]); x.lineTo((a[0] + b[0]) / 2, a[1] + 14); x.lineTo(b[0], b[1]); x.fill(); }
      quad(x, [A(X1 - 620, rm.floor, .2), A(X1 - 300, rm.floor, .2), A(X1 - 300, rm.floor, .85), A(X1 - 620, rm.floor, .85)], '#b7826a');
      quad(x, [A(X1 - 606, rm.floor, .28), A(X1 - 314, rm.floor, .28), A(X1 - 314, rm.floor, .77), A(X1 - 606, rm.floor, .77)], '#cf9f7c');
      { const c = A(X1 - 640, rm.floor - 30, .55), s = rm.s(.55); x.fillStyle = mix(P.wood, P.cream, .15); x.beginPath(); x.ellipse(c[0], c[1], 38 * s, 16 * s, 0, 0, Math.PI); x.fill();
        x.fillStyle = mix(P.wood, ink, .2); x.fillRect(c[0] - 40 * s, c[1] - 3, 80 * s, 5); x.lineWidth = 3; x.strokeStyle = mix(P.wood, ink, .3); x.beginPath(); x.arc(c[0], c[1] - 40 * s, 52 * s, Math.PI * .38, Math.PI * .62); x.stroke(); }
      R.box(x, rm, X1 - 150, X1 - 112, 26, .45, .65, { top: mix(P.wood, P.cream, .2), front: P.wood, side: mix(P.wood, ink, .25) });
      { const b = A(X1 - 131, rm.floor - 26, .55); x.fillStyle = '#b08a55'; x.beginPath(); x.ellipse(b[0], b[1] - 5, 17, 7, 0, 0, F.TAU); x.fill(); x.fillStyle = '#8f6c3e'; x.fillRect(b[0] - 17, b[1] - 6, 34, 7);
        [['#c98a8a', -8], ['#8fb2c9', 1], ['#e8dcc0', 9]].forEach(([c, dx]) => { x.fillStyle = c; x.beginPath(); x.arc(b[0] + dx, b[1] - 10, 4.5, 0, F.TAU); x.fill(); }); }
    }
    const L = R.lampAt(o, i), c0 = A(0, rm.ceil, .3)[1], lit = clamp((st.light || [1, 1, 1])[i]);
    x.fillStyle = mix(ink, P.wood, .3); x.fillRect(L[0] - .8, c0, 1.6, L[1] - c0);
    x.fillStyle = lit > .5 ? '#fff0c8' : mix(P.cream, ink, .4); x.beginPath(); x.arc(L[0], L[1] + 7, 5, 0, F.TAU); x.fill();
    x.fillStyle = i === 2 ? '#56657a' : i === 1 ? '#6f7a5a' : '#b98f86'; x.beginPath(); x.moveTo(L[0] - 6, L[1]); x.lineTo(L[0] + 6, L[1]); x.lineTo(L[0] + 15, L[1] + 9); x.lineTo(L[0] - 15, L[1] + 9); x.closePath(); x.fill();
  }
})();
