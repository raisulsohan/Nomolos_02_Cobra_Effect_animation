(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, CS = F.cases, MAP = F.citymap, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-17'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { wipe: 1.048, hanoi: 2.097, grow: 5.008, them: 6.096, exact: C.s('S086').t0,
    trap: 7.183, cobras: 7.902, receipts: 10.128 };
  const ERASE = [T.wipe - .05, T.hanoi + .55], PULL = [T.exact, T.exact + 1.3], SLIDE = [T.exact + .5, T.exact + 1.6], CHART = [T.trap, T.trap + .6], DROP = [T.receipts - .05, T.receipts + .4];

  const r1 = F.rng(85), BASE = Array.from({ length: 26 }, () => [-900 + r1() * 1900, -560 + r1() * 1200, r1() * TAU]);
  const passAt = x => lerp(ERASE[0], ERASE[1], clamp((x + 1400) / 2900));
  const pop = (t, t0) => { const k = clamp((t - t0) / .22); return k <= 0 ? 0 : k < 1 ? easeOutBack(k, 3) : 1; };
  function rats(t) {
    const out = [];
    BASE.forEach(([x, y, a], i) => {
      out.push([x, y, a, 1.25]);
      const t1 = passAt(x); out.push([x + 34, y + 22, a + 1.3, 1.25 * pop(t, t1 + .05)]);
      for (let k = 0; k < 2; k++) { const t2 = T.grow + (hash(i, k, 7) * .8); out.push([x - 30 + k * 70, y - 30 + k * 12, a + 2.1 + k, 1.2 * pop(t, t2)]); }
    });
    return out;
  }
  const eraser = t => { const u = easeIO((t - ERASE[0]) / (ERASE[1] - ERASE[0])); return [lerp(-1500, 1550, u), -60 + Math.sin(u * 7) * 60, -.18 + Math.sin(u * 5) * .05]; };

  const FULL = { x: 0, y: 0, w: W, h: H }, GAP = 40;
  const SPLIT = PORT ? { a: { x: 60, y: 70, w: W - 120, h: H / 2 - 95 }, b: { x: 60, y: H / 2 + 25, w: W - 120, h: H / 2 - 95 } }
    : { a: { x: 70, y: 150, w: W / 2 - 70 - GAP / 2, h: 700 }, b: { x: W / 2 + GAP / 2, y: 150, w: W / 2 - 70 - GAP / 2, h: 700 } };
  const lerpR = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });
  const Z0 = PORT ? .5 : .66;
  function panel(x, r, scale, cx, cy, fn, frame) {
    x.save(); x.beginPath(); x.rect(r.x, r.y, r.w, r.h); x.clip();
    x.translate(r.x + r.w / 2, r.y + r.h / 2); x.scale(scale, scale); x.translate(-cx, -cy); fn(x); x.restore();
    if (frame > 0) { x.strokeStyle = F.rgba(F.hex(P.cream), frame); x.lineWidth = 6; x.strokeRect(r.x, r.y, r.w, r.h); }
  }
  function chartCard(x, r, label, k, t, la = 1) {
    if (k <= 0) return;
    const cw = Math.min(360, r.w * .44), ch = cw * .6, cx = r.x + r.w - cw - 24, cy = r.y + r.h - ch - 24 + (1 - k) * 40;
    x.save(); x.globalAlpha = k; x.translate(cx, cy);
    MAP.chart(x, P, { w: cw, h: ch, draw: 0, label: 0 });
    x.globalAlpha = k * la; x.fillStyle = mix(P.card, P.ink, .75); x.font = `600 ${ch * .1}px NS`; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(label, cw * .1 + 8, cw * .15 - 18); x.globalAlpha = k;
    const pad = cw * .1; CS.cobraCurve(x, P, { x: pad, y: cw * .15, w: cw - pad * 1.6, h: ch - pad * .9 - cw * .15, width: cw * .022, upto: smooth((t - CHART[0] - .1) / .7) });
    x.restore();
    return { x: cx, y: cy, w: cw, h: ch };
  }
  function receipts(x, r, k) {
    if (k <= 0) return;
    const bx = r.x + r.w * .24, by = r.y + r.h * .7 - (1 - easeOutBack(clamp(k), 1.4)) * 260;
    for (let i = 0; i < 6; i++) {
      x.save(); x.translate(bx + i * 7 - 18, by - i * 5); x.rotate(-.12 + i * .05);
      x.fillStyle = mix(P.card, P.cream, .5); x.fillRect(-70, -44, 140, 88); x.strokeStyle = mix(P.card, P.ink, .3); x.lineWidth = 1.5; x.strokeRect(-70, -44, 140, 88);
      x.fillStyle = mix(P.card, P.ink, .6); for (const y of [-20, -6, 8]) x.fillRect(-56, y, 80 + (i * 13) % 30, 4);
      x.font = '900 18px NSC'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText('1902', 60, 26);
      x.restore();
    }
  }

  function stage(ctx, t, o = {}) {
    const pk = easeIO((t - PULL[0]) / (PULL[1] - PULL[0])), sk = easeIO((t - SLIDE[0]) / (SLIDE[1] - SLIDE[0])), j = o.join || 0, fade = o.fade || 0;
    let rb = lerpR(FULL, SPLIT.b, pk), ra = { ...SPLIT.a, x: SPLIT.a.x - (1 - sk) * (PORT ? 0 : W * .6), y: SPLIT.a.y - (1 - sk) * (PORT ? H * .6 : 0) };
    if (j > 0) { const mid = PORT ? { x: 60, y: H / 2 - (H / 2 - 95) / 2 } : { x: W / 2 - SPLIT.a.w / 2, y: 150 }; ra = { ...ra, x: lerp(ra.x, mid.x, j), y: lerp(ra.y, mid.y, j) }; rb = { ...rb, x: lerp(rb.x, mid.x, j), y: lerp(rb.y, mid.y, j) }; }
    const hs = lerp(Z0, rb.w / 2900, pk), hc = [lerp(PORT ? -60 : -80, 0, pk), lerp(PORT ? 20 : -20, 20, pk)];
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      x.globalAlpha = 1 - fade;
      if (sk > 0) panel(x, ra, ra.w / 2300, -80, 0, y => MAP.draw(y, P, { snakes: () => 1, more: 1, t: 0 }), .9);
      panel(x, rb, hs, hc[0], hc[1], y => {
        HN.map(y, P, { french: 1, rats: rats(t) });
        if (t > ERASE[0] - .1 && t < ERASE[1] + .5) { const [ex, ey, ea] = eraser(t); y.save(); y.translate(ex, ey); y.rotate(ea); y.globalAlpha = 1 - smooth((t - ERASE[1]) / .4); PR.eraser(y, P, 560); y.restore(); }
      }, pk);
      x.globalAlpha = 1;
      const ck = smooth((t - CHART[0]) / .4);
      chartCard(x, ra, 'COBRAS', ck * (1 - fade), t, 1 - j); chartCard(x, rb, 'RATS', ck * (1 - fade), t, 1 - j);
      x.globalAlpha = 1 - fade; receipts(x, rb, smooth((t - DROP[0]) / (DROP[1] - DROP[0]))); x.globalAlpha = 1;
    }, { flatShadow: [10, 14, 12, .4] });
    return { ra, rb };
  }
  const cardAt = r => { const cw = Math.min(360, r.w * .44), ch = cw * .6; return { x: r.x + r.w - cw - 24, y: r.y + r.h - ch - 24, w: cw, h: ch }; };

  function draw(ctx, t) { stage(ctx, t); L.grade(ctx, t); }

  F.scene('seq-17', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { stage, cardAt, SPLIT, DUR } });
})();
