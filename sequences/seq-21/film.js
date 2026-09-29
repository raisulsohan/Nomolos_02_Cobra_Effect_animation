(function () {
  'use strict';
  const F = FILM, B = F.bits, { W: FW, H: FH, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-21'), DUR = C.duration;
  const L = F.look('flat', FW, FH), P = L.P;
  const T = { closing: 1.444, close: 2.979, rather: 3.993, fix: 4.594 };
  const COLS = PORT ? 4 : 6, ROWS = PORT ? 5 : 4, TW = 200, TH = 150, GX = 36, GY = 34;
  const BW = COLS * TW + (COLS - 1) * GX, BH = ROWS * TH + (ROWS - 1) * GY, BX = -BW / 2, BY = -BH / 2 + 50;
  const N = COLS * ROWS, ORDER = Array.from({ length: N }, (_, i) => i).sort((a, b) => hash(a, 96) - hash(b, 96));
  const stampT = k => T.closing + .15 + (1 - Math.pow(1 - k / N, 1.6)) * (T.fix + .3 - T.closing);
  const whenOf = Array(N); ORDER.forEach((i, k) => whenOf[i] = stampT(k));
  const tix = i => [BX + (i % COLS) * (TW + GX) + TW / 2, BY + Math.floor(i / COLS) * (TH + GY) + TH / 2];

  function beetle(x, cx, cy, a, s, ph) {
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(s, s);
    x.strokeStyle = P.ink; x.lineWidth = 2.2; x.lineCap = 'round';
    for (const sd of [-1, 1]) for (let l = -1; l <= 1; l++) { const sw = Math.sin(ph + l * 2 + (sd > 0 ? Math.PI : 0)) * 3; x.beginPath(); x.moveTo(l * 7, sd * 6); x.lineTo(l * 8 + sw, sd * 15); x.stroke(); }
    x.fillStyle = mix(P.sheet2, P.ink, .5); x.beginPath(); x.ellipse(0, 0, 14, 10, 0, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.beginPath(); x.ellipse(15, 0, 6, 6, 0, 0, TAU); x.fill();
    x.strokeStyle = mix(P.cream, P.sheet2, .4); x.lineWidth = 1.4; x.beginPath(); x.moveTo(-13, 0); x.lineTo(12, 0); x.stroke();
    x.strokeStyle = P.ink; x.lineWidth = 1.4; x.beginPath(); x.moveTo(19, -3); x.lineTo(25, -8); x.moveTo(19, 3); x.lineTo(25, 8); x.stroke();
    x.restore();
  }
  function ticket(x, i, t) {
    const [cx, cy] = tix(i), st = t - whenOf[i];
    x.fillStyle = mix(P.card, P.cream, .3); x.fillRect(cx - TW / 2, cy - TH / 2, TW, TH);
    x.fillStyle = mix(P.card, P.ink, .5); x.fillRect(cx - TW / 2 + 16, cy - TH / 2 + 18, 90, 8); x.fillRect(cx - TW / 2 + 16, cy - TH / 2 + 34, 130, 5);
    x.fillStyle = mix(P.amber, P.ink, .15); x.font = '900 20px NSC'; x.textAlign = 'right'; x.textBaseline = 'top'; x.fillText('#' + (101 + i * 7), cx + TW / 2 - 12, cy - TH / 2 + 12);
    if (st < .4) beetle(x, cx, cy + 25, 0, 1.3, 0);
    if (st > 0) {
      const k = smooth(st / .08); x.save(); x.translate(cx, cy + 12); x.rotate(-.18 + (hash(i, 3) - .5) * .12); x.scale(lerp(1.25, 1, k), lerp(1.25, 1, k)); x.globalAlpha = .85 * k;
      x.strokeStyle = P.ink; x.lineWidth = 5; x.strokeRect(-82, -26, 164, 52); x.fillStyle = P.ink; x.font = '900 40px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CLOSED', 0, 2);
      x.restore();
    }
  }
  function crawler(x, i, t) {
    const st = t - whenOf[i] - .35; if (st <= 0) return;
    const [cx, cy] = tix(i), a = (hash(i, 5) - .5) * 1.6 + (i % COLS < COLS / 2 ? Math.PI : 0) + Math.PI / 2 * (hash(i, 6) - .5);
    const d = st * 230;
    beetle(x, cx + Math.cos(a) * d, cy + TH / 2 + 10 + Math.sin(a) * d * .6 + Math.min(d, 30), a, 1.3, st * 30);
  }
  function stamp(x, t) {
    if (t < T.closing - .3 || t > whenOf[ORDER[N - 1]] + .5) return;
    let k = 0; while (k < N - 1 && t > stampT(k)) k++;
    const i1 = ORDER[k], i0 = ORDER[Math.max(0, k - 1)], t1 = stampT(k), t0 = k ? stampT(k - 1) : T.closing - .3;
    const u = clamp((t - t0) / (t1 - t0)), [ax, ay] = tix(i0), [bx, by] = tix(i1), lift = t > t1 ? smooth((t - t1) / .1) : Math.sin(u * Math.PI) * .9 + (1 - u) * 0;
    const px = lerp(ax, bx, easeIO(u)), py = lerp(ay, by, easeIO(u)) + 12 - (t < t1 ? 1 - Math.pow(u, 4) : lift) * 80;
    x.save(); x.translate(px, py);
    x.fillStyle = F.rgba([0, 0, 0], .18); x.fillRect(-76, 30, 152, 20);
    x.fillStyle = mix(P.wood, P.ink, .1); x.fillRect(-84, -24, 168, 34); x.fillStyle = P.rubber; x.fillRect(-80, 10, 160, 12);
    x.fillStyle = P.wood; x.beginPath(); x.moveTo(-18, -24); x.lineTo(-12, -80); x.lineTo(12, -80); x.lineTo(18, -24); x.fill(); x.beginPath(); x.arc(0, -94, 24, 0, TAU); x.fill();
    x.restore();
  }
  function draw(ctx, t) {
    const done = ORDER.filter(i => t >= whenOf[i]).length;
    L.background(ctx);
    L.sheet(ctx, { x: 0, y: 0, z: (PORT ? .92 : .98) * lerp(1, 1.04, smooth(t / DUR)) }, 1, [0, 0], x => {
      x.fillStyle = mix(P.wood, P.cream, .3); x.fillRect(BX - 40, BY - 40, BW + 80, BH + 80);
      x.strokeStyle = mix(P.wood, P.ink, .3); x.lineWidth = 12; x.strokeRect(BX - 40, BY - 40, BW + 80, BH + 80);
      for (let i = 0; i < N; i++) ticket(x, i, t);
      for (let i = 0; i < N; i++) crawler(x, i, t);
      stamp(x, t);
      x.fillStyle = mix(P.ink, P.sheet2, .3); x.fillRect(-150, BY - 160, 300, 96);
      x.fillStyle = P.amber; x.font = '900 70px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(done * 10), 0, BY - 110);
    }, { flatShadow: [10, 14, 12, .4] });
    L.grade(ctx, t);
  }
  F.scene('seq-21', { W: FW, H: FH, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
