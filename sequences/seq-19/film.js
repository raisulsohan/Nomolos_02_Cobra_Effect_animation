(function () {
  'use strict';
  const F = FILM, CS = F.cases, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-19'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, CAST = CS.cast(P);
  const T = { fragment: 3.454, handed: 5.098, hoping: 5.99, s94: C.s('S094').t0, smashing: 9.451,
    intact: 10.52, pieces: 12.275, destroying: 13.56, save: 16.642, multiply: 17.585 };
  const FS = 2.4, TOP = -112, PAL = -380, FAR0 = -40, HOME = 420, STONE = 930;
  const HITS = [T.smashing, T.smashing + .9, T.intact + .75], BACK = [T.pieces - .4, T.pieces + .9];
  const walk = M.gait({ from: FAR0 / FS, to: HOME / FS, t0: T.hoping - .2, gait: 'brisk', until: T.s94 + .7 });

  const Z = PORT ? .85 : 1.3;
  const cam = B.cam([
    [0, -190, -290, Z], [T.fragment, -200, -270, Z * 1.12], [T.hoping - .3, -190, -280, Z * 1.05], [T.s94 + .3, 520, -250, Z],
    [T.smashing - .45, STONE + 40, -160, Z * 1.5], [BACK[0], STONE + 40, -160, Z * 1.53], [BACK[1], -200, -290, Z * 1.02], [DUR, -200, -300, Z * 1.08],
  ]);

  function hills(x) {
    const cols = [mix(P.sheet2, P.cream, .35), mix(P.sheet2, P.cream, .15), mix(P.sheet2, P.ink, .05)];
    cols.forEach((c, k) => {
      x.fillStyle = c; x.beginPath(); x.moveTo(-3000, 0);
      for (let px = -3000; px <= 3000; px += 60) x.lineTo(px, -420 + k * 110 - Math.sin(px * .0016 + k * 2) * 140 - Math.sin(px * .005 + k) * 30);
      x.lineTo(3000, 0); x.fill();
      x.strokeStyle = mix(c, P.ink, .12); x.lineWidth = 3;
      for (let j = 1; j < 5; j++) { x.beginPath(); for (let px = -3000; px <= 3000; px += 60) x.lineTo(px, -420 + k * 110 + j * 26 - Math.sin(px * .0016 + k * 2) * 140 * (1 - j * .12)); x.stroke(); }
    });
  }
  function ground(x) {
    x.fillStyle = mix(P.sheetDim, P.wood, .15); x.fillRect(-3000, 0, 6000, 900);
    x.fillStyle = mix(P.woodDark, P.ink, .1); x.fillRect(-470, -380, 10, 380); x.fillRect(-40, -380, 10, 380);
    x.fillStyle = mix(P.awningB, P.cream, .2); x.beginPath(); x.moveTo(-500, -380); x.lineTo(0, -380); x.lineTo(20, -330); x.lineTo(-520, -330); x.fill();
    x.fillStyle = mix(P.wall, P.wood, .2); x.fillRect(620, -360, 900, 360); x.fillStyle = mix(P.roof, P.ink, .1); x.fillRect(610, -372, 920, 16);
    x.fillStyle = mix(P.sheetDim, P.ink, .3); x.beginPath(); x.ellipse(STONE, -18, 90, 26, 0, 0, TAU); x.fill(); x.fillRect(STONE - 90, -18, 180, 18);
  }
  function table(x) { x.fillStyle = P.wood; x.fillRect(-330, TOP, 260, 12); x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(-320, TOP + 12, 10, -TOP - 12); x.fillRect(-90, TOP + 12, 10, -TOP - 12); }

  const NP = 20, hitsDone = t => HITS.filter(h => t >= h).length, piecesAt = t => [0, 6, 13, 20][hitsDone(t)];
  function yardBone(x, t) {
    const n = piecesAt(t);
    if (n === 0) { CS.bone(x, P, STONE, -52, 150, .04); return; }
    for (let i = 0; i < n; i++) { const a = hash(i, 11) * TAU; CS.bone(x, P, STONE + (hash(i, 12) - .5) * 150, -44 - hash(i, 13) * 8, 14 + hash(i, 14) * 16, a); }
  }
  function hammerShadow(x, t) {
    if (t < T.smashing - .8 || t > BACK[0] + .3) return;
    let a = -2.1; for (const h of HITS) { const u = (t - (h - .45)) / .45; if (u > 0 && u < 1) a = lerp(-2.1, -.35, u * u); else if (t >= h && t < h + .35) a = lerp(-.35, -2.1, smooth((t - h) / .35)); }
    x.save(); x.globalAlpha = .45; x.fillStyle = mix(P.ink, P.wall, .2);
    x.translate(STONE - 180, -330); x.rotate(a + Math.PI / 2);
    x.fillRect(-6, 0, 12, 230); x.fillRect(-34, 210, 68, 40);
    x.restore();
    x.save(); x.globalAlpha = .3 * (piecesAt(t) ? 0 : 1); x.fillStyle = mix(P.ink, P.wall, .2); x.fillRect(STONE - 20, -130, 190, 22); x.restore();
  }
  function tablePieces(x, t) {
    const lk = smooth((t - BACK[1] + .5) / .5); if (lk <= 0) return;
    for (let i = 0; i < NP; i++) { const k = smooth((t - BACK[1] + .5 - i * .03) / .3); if (k <= 0) continue; x.globalAlpha = k; CS.bone(x, P, -310 + (i % 10) * 20, TOP - 6 - Math.floor(i / 10) * 12, 16, hash(i, 15) * TAU); }
    x.globalAlpha = 1;
    const nc = Math.floor(NP * clamp((t - T.fossils - 0) / (T.multiply + .5 - T.fossils)));
    PR.coinStack(x, P, 'paper', -120, TOP, 12, nc);
  }
  T.fossils = 14.618;

  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  const idleP = M.idle({ x: 0, seed: 12 }), idleF = M.idle({ x: 0, seed: 13 });
  function paleo(x, tp) {
    let p = idleP(tp);
    const give = F.env(tp, T.handed - .3, T.handed, T.handed + .5, T.handed + .9);
    p = at(p, 1, [lerp(22, 44, give), lerp(-40, -47, give)]);
    const bow = smooth((tp - T.save + .2) / .6); p.head = (p.head || 0) + .25 * bow; p.lean = (p.lean || 0) + .05 * bow;
    x.save(); x.translate(PAL, 0); x.scale(FS, FS); M.draw(x, P, p, { ...CAST.paleo, dir: 1 }); x.restore();
  }
  function farmer(x, tp) {
    if (tp > T.hoping - .2 && tp < BACK[0] + .3) {
      x.save(); x.scale(FS, FS); M.draw(x, P, walk(tp), { ...CAST.farmer, dir: 1 }); x.restore(); return;
    }
    let p = idleF(tp);
    const lay = F.env(tp, T.fragment - .4, T.fragment, T.handed - .2, T.handed + .2);
    p = at(p, 1, [lerp(22, 42, lay), lerp(-40, -47, lay)]);
    x.save(); x.translate(FAR0, 0); x.scale(FS, FS); const PJ = M.draw(x, P, p, { ...CAST.farmer, dir: -1 }); x.restore();
    if (tp < T.handed && lay > .05) CS.bone(x, P, FAR0 - PJ.arms[1].wr[0] * FS - 8, PJ.arms[1].wr[1] * FS + 4, 30, .3);
  }
  function fragment(x, t) {
    if (t > T.handed - .2 && t < BACK[0]) CS.bone(x, P, -150, TOP - 5, 30, .3);
    const s = clamp((t - T.handed) / .45); if (s > 0 && t < T.hoping - .3) PR.coin(x, P, 'paper', lerp(-270, -110, easeIO(s)), TOP - 3, 11, 1);
  }

  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, .45, [0, 0], x => hills(x), { fibre: .6 });
    L.sheet(ctx, c, 1, [0, 0], x => {
      ground(x); hammerShadow(x, t); yardBone(x, t);
      paleo(x, tp); farmer(x, tp); table(x); fragment(x, t); tablePieces(x, t);
    });
    L.sheet(ctx, c, 1, [0, 0], x => CS.dino(x, P, { x: -200, y: -430, s: .72, shatter: smooth((t - T.destroying) / 1.4) }), { rim: false, paperShadow: [4, 6, 6, .12] });
    L.grade(ctx, t);
  }

  F.scene('seq-19', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
