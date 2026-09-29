(function () {
  'use strict';
  const F = FILM, CS = F.cases, HN = F.hanoi, G = F.goal, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-22'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;
  const T = { people: 1.853, buying97: 3.493, outcome: 3.962, safety: C.s('S098').t0, discovery: C.s('S099').t0, growth: C.s('S100').t0,
    what: C.s('S101').t0, buying: 8.893, number: 9.522 };
  const FS = 2.6, TOP = -128, C0 = 360, C1 = 1080, SUIT = '#d9ceb4';
  const HC = HN.cast(P), CC = CS.cast(P);
  const QUEUE = [
    { x: 250, look: { coat: SUIT, trouser: mix(SUIT, P.ink, .12), skin: '#e0bf9c', head: 'bare', hair: '#2e2622', moustache: '#2e2622', shoe: mix(P.wood, P.ink, .5), shadow: 0 } },
    { x: 110, look: HC.resident }, { x: -30, look: CC.paleo }, { x: -170, look: CC.banker }, { x: -310, look: CC.lead },
  ];
  const BOXES = [[500, T.safety, 'SAFETY'], [720, T.discovery, 'DISCOVERY'], [940, T.growth, 'GROWTH']], TAGS = ['10,000', '1,200', '3,500,000'];
  const OPEN = [T.buying - .1, T.buying + .3];
  const payAt = i => T.people + .1 + i * .42;
  const Z = PORT ? .76 : .88;
  const cam = B.cam([[0, 300, -300, Z], [T.outcome, 360, -300, Z * 1.02], [T.safety + .3, 700, -250, Z * 1.45], [T.what, 720, -250, Z * 1.5], [DUR, 640, -260, Z * 1.38]]);

  function shop(x) {
    x.fillStyle = mix(P.wall, P.cream, .25); x.fillRect(-1600, -1400, 3600, 1400);
    x.fillStyle = mix(P.wood, P.cream, .2); for (const y of [-520, -380]) x.fillRect(C0 + 40, y, C1 - C0 - 80, 12);
    x.fillStyle = mix(P.sheetDim, P.wood, .2); x.fillRect(-1600, 0, 3600, 700);
    x.fillStyle = mix(P.wood, P.ink, .1); x.fillRect(C0, TOP + 10, C1 - C0, -TOP - 10);
    x.strokeStyle = mix(P.wood, P.ink, .35); x.lineWidth = 4; for (let px = C0 + 20; px < C1 - 60; px += 120) x.strokeRect(px, TOP + 30, 100, -TOP - 50);
    x.fillStyle = mix(P.wood, P.cream, .15); x.fillRect(C0 - 20, TOP - 6, C1 - C0 + 40, 16);
  }
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  function customers(x, tp) {
    QUEUE.forEach((q, i) => {
      let p = M.idle({ x: 0, seed: 60 + i })(tp);
      const toss = F.env(tp, payAt(i) - .3, payAt(i), payAt(i) + .15, payAt(i) + .5);
      p = at(p, 1, [lerp(20, 42, toss), lerp(-40, -60, toss)]);
      const stare = smooth((tp - T.buying - .1) / .4); p.head = (p.head || 0) + .12 * stare; p.lean = (p.lean || 0) + .05 * stare;
      x.save(); x.translate(q.x, 0); x.scale(FS, FS); M.draw(x, P, p, { ...q.look, dir: 1 }); x.restore();
    });
  }
  function coins(x, t) {
    QUEUE.forEach((q, i) => {
      for (let k = 0; k < 3; k++) {
        const t0 = payAt(i) + k * .07, u = clamp((t - t0) / .45); if (u <= 0) continue;
        const sx = q.x + 110, sy = -150, ex = C0 + 30 + i * 16 + k * 4, ey = TOP - 8 - k * 4;
        if (u < 1) PR.coin(x, P, 'paper', lerp(sx, ex, u), lerp(sy, ey, u) - Math.sin(u * Math.PI) * 120, 10, .5 + .5 * Math.sin(u * 9));
        else PR.coin(x, P, 'paper', ex, ey, 10, 1);
      }
    });
  }
  function box(x, bx, k, label, open, tag) {
    const e = easeOutBack(clamp(k), 1.2), px = lerp(C1 + 200, bx, e), bw = 190, bh = 150, top = TOP - bh - 4;
    const card = mix(P.parchment, P.wood, .15), dark = mix(card, P.ink, .25);
    if (open > 0) {
      const ty = top + 30 - 80 * easeOutBack(open, 1.5);
      x.fillStyle = P.amber; x.beginPath(); x.moveTo(px - 70, ty - 32); x.lineTo(px + 56, ty - 32); x.lineTo(px + 76, ty); x.lineTo(px + 56, ty + 32); x.lineTo(px - 70, ty + 32); x.closePath(); x.fill();
      x.fillStyle = P.cream; x.beginPath(); x.arc(px + 56, ty, 6, 0, TAU); x.fill();
      x.fillStyle = P.ink; x.font = `900 ${tag.length > 7 ? 30 : 38}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tag, px - 6, ty + 2);
    }
    x.fillStyle = card; x.fillRect(px - bw / 2, top, bw, bh);
    x.fillStyle = dark; x.fillRect(px - bw / 2, top, bw, 10);
    x.save(); x.translate(px - bw / 2, top); x.rotate(-open * 2.2); x.fillStyle = mix(card, P.cream, .15); x.fillRect(0, -6, bw / 2, 8); x.restore();
    x.save(); x.translate(px + bw / 2, top); x.rotate(open * 2.2); x.fillStyle = mix(card, P.cream, .15); x.fillRect(-bw / 2, -6, bw / 2, 8); x.restore();
    x.fillStyle = mix(P.card, P.cream, .5); x.fillRect(px - 80, top + 22, 160, 112);
    if (label === 'SAFETY') G.city(x, P, { x: px, y: top + 88, s: .95, k: 1, blur: 2, dash: 4 });
    else if (label === 'DISCOVERY') CS.dino(x, { ...P, cream: mix(P.cream, P.ink, .45) }, { x: px + 6, y: top + 92, s: .22 });
    else { x.strokeStyle = mix(P.cream, P.ink, .45); x.lineWidth = 3; x.setLineDash([6, 5]); x.beginPath(); x.moveTo(px - 50, top + 86); x.lineTo(px - 10, top + 60); x.lineTo(px + 10, top + 72); x.lineTo(px + 48, top + 40); x.stroke(); x.setLineDash([]); }
    x.fillStyle = P.ink; x.font = `900 ${label.length > 7 ? 26 : 30}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, px, top + 114);
  }
  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t), open = easeIO((t - OPEN[0]) / (OPEN[1] - OPEN[0]));
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => {
      shop(x); customers(x, tp); coins(x, t);
      BOXES.forEach(([bx, t0, label], i) => { const k = (t - t0 + .05) / .45; if (k > 0) box(x, bx, k, label, clamp(open - i * .08), TAGS[i]); });
    });
    L.grade(ctx, t);
  }
  F.scene('seq-22', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
