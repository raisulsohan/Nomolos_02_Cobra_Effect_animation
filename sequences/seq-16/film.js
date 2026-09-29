(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, B = F.bits, M = F.motion, PR = F.props, FARM = F.farm, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-16'), DUR = C.duration;
  const L = F.look('lightbox', W, H), P = L.P;
  const T = { farming: 4.378, raising: 5.87, hundred: 6.795, bounty: 7.719 };

  const CW = 104, CHH = 78, WALL = -300;
  const STACKS = [[-560, 4], [-440, 3], [-320, 4], [-200, 2], [200, 3], [320, 4], [440, 3], [560, 4]], POLES = [-380, -260, 260, 380];
  const k = PORT ? .7 : 1;
  const cam = B.cam([[0, 0, -150, 2.1 * k], [T.farming - .6, 0, -170, 1.95 * k], [DUR, 40, -560, .82 * k]]);

  function cage(x, cx, base, seed, t) {
    x.fillStyle = mix(P.wood, P.ink, .1); x.fillRect(cx - CW / 2, base - CHH, CW, CHH);
    x.fillStyle = mix(P.sheet, P.wall, .35); x.fillRect(cx - CW / 2 + 5, base - CHH + 5, CW - 10, CHH - 10);
    for (let r = 0; r < 3; r++) { const d = hash(seed, r) < .5 ? 1 : -1; HN.rat(x, P, { x: cx + (r - 1) * 26 + Math.sin(t * 2 + seed + r) * 4, y: base - 6, s: .72, dir: d, ph: t * 6 + r, run: .3, eyes: 1 }); }
    x.fillStyle = mix(P.wood, P.cream, .2);
    for (let b = 0; b <= 7; b++) x.fillRect(cx - CW / 2 + 3 + b * (CW - 9) / 7, base - CHH + 3, 3, CHH - 6);
    x.fillRect(cx - CW / 2, base - CHH, CW, 4); x.fillRect(cx - CW / 2, base - 4, CW, 4);
  }
  function yard(x, t, near) {
    x.fillStyle = mix(P.wall, P.sheet, .3); x.fillRect(-760, WALL, 1520, -WALL);
    x.fillStyle = mix(P.roof, P.ink, .2); x.fillRect(-780, WALL - 16, 1560, 18);
    x.fillStyle = mix(P.sheetDim, P.ink, .4); x.fillRect(-2000, 0, 4000, 400);
    x.fillStyle = mix(P.bgBot, P.window, .08); x.fillRect(-70, -190, 140, 190);
    x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(-84, -206, 168, 16); x.fillRect(-84, -206, 14, 206); x.fillRect(70, -206, 14, 206);
    STACKS.forEach(([sx, n], i) => { for (let j = 0; j < n; j++) cage(x, sx, -j * CHH, i * 7 + j, near ? t : 0); });
    POLES.forEach(px => { x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(px - 3, -380, 6, 380); x.fillRect(px - 3, -380, 28, 5); });
  }
  const lamps = () => POLES.map(px => [px + 22, -350]);
  function farRow(x, t, n, seed) {
    for (let i = -n; i <= n; i++) {
      const cx = i * 1000 + (hash(i, seed) - .5) * 200;
      x.fillStyle = mix(P.wall, P.sheet, .2); x.fillRect(cx - 420, WALL, 840, -WALL);
      x.fillStyle = mix(P.roof, P.ink, .2); x.fillRect(cx - 430, WALL - 14, 860, 16);
      for (let s = -3; s <= 3; s++) if (s) for (let j = 0; j < 2 + ((s + i + 9) % 3); j++) { x.fillStyle = mix(P.wood, P.ink, .15); x.fillRect(cx + s * 110 - 48, -j * 80 - 76, 96, 72); x.fillStyle = mix(P.sheet, P.window, .25); x.fillRect(cx + s * 110 - 40, -j * 80 - 68, 80, 56); }
    }
  }
  const ROWS = [[.45, -2600, 6, 1], [.6, -1500, 5, 2], [.78, -700, 4, 3]];

  const walk = M.gait({ from: -30, to: 110, t0: T.hundred, gait: 'walk', until: DUR + .6, arms: [[.5, 1.45], [.5, 1.45]] });
  function carrier(x, tp) {
    if (tp < T.hundred) return;
    x.save(); x.translate(0, -2); x.scale(1.9, 1.9);
    const PJ = M.draw(x, P, walk(tp), { coat: P.coat, trouser: P.trouser, skin: P.skin, head: 'cap', headColor: P.coat2, shadow: 0, dir: 1 });
    const wr = PJ.arms[1].wr;
    PR.basket(x, P, wr[0] + 6, wr[1] + 10, .34, -1);
    for (let i = 0; i < 6; i++) HN.tail(x, P, wr[0] - 6 + i * 3, wr[1] - 7, 14, -1.2 - i * .12, 1);
    x.restore();
  }

  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    for (const [p, y, n, seed] of ROWS) L.sheet(ctx, c, p, [0, 0], x => { x.translate(0, y * (1 - p)); farRow(x, tp, n, seed); }, { glow: .5, alpha: .3 + .7 * smooth((t - T.farming - (1 - p) * 3) / 1) });
    ctx.save();
    for (const [p, y, n, seed] of ROWS) { F.sheet(ctx, c, p, W, H, [0, 0]); ctx.translate(0, y * (1 - p)); for (let i = -n; i <= n; i++) PR.glow(ctx, i * 1000 + (hash(i, seed) - .5) * 200, -330, 260, P.glow, .16 * smooth((t - .3 - (1 - p) * 4) / 1), 'lightbox'); }
    ctx.restore();
    L.sheet(ctx, c, 1, [0, 0], x => {
      yard(x, tp, true);
      carrier(x, tp);
      lamps().forEach(([lx, ly]) => { x.save(); x.translate(lx, ly); FARM.lantern(x, P, 1.4, 1); x.restore(); });
    }, { glow: .6 });
    ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); lamps().forEach(([lx, ly]) => PR.glow(ctx, lx, ly + 40, 240, P.glow, .32, 'lightbox')); ctx.restore();
    L.grade(ctx, t);
  }

  F.scene('seq-16', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { cam } });
})();
