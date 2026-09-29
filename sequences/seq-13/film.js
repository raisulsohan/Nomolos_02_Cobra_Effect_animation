(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-13'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, CAST = HN.cast(P);

  const T = {
    puts: 2.727, rats68: 3.723, clerk: 7.253, dead: 9.002, they: 9.926,
    hand: 11.428, just: C.s('S070').t0, tail70: 13.288, bring: C.s('S071').t0, tail71: 14.785, paid: 15.492,
    clean: C.s('S072').t0, before: C.s('S073').t0, thousands: 19.769, program: C.s('S074').t0, roaring: 22.436,
  };
  const FS = 3, TOP = -150;
  const RES = -390, CLK = -40, POSTER = [200, -345], TALLY = [320, TOP - 26], TRAYS = [100, 160, 220], REPORT = [-390, -430];
  const CUT = [T.just + .08, T.tail70 + .25], FALL = [T.tail70 + .25, T.tail70 + .75];

  const Z = PORT ? .7 : 1;
  const cam = B.cam([
    [0, 0, -280, Z], [T.puts, 0, -280, Z * 1.03], [T.clerk - .2, -40, -250, Z * 1.08], [T.they, -60, -260, Z * 1.1],
    [T.hand, 20, -300, Z * 1.25], [T.just + .1, POSTER[0], POSTER[1], PORT ? 2.4 : 3.1],
    [T.bring - .05, POSTER[0] - 10, POSTER[1] + 10, PORT ? 2.45 : 3.15], [T.bring + .5, 60, TOP - 20, PORT ? 2.3 : 2.7],
    [T.clean + .1, 55, TOP - 25, PORT ? 2.35 : 2.8], [T.clean + .9, 40, -230, PORT ? 1.2 : 1.7],
    [T.before + .1, 40, -235, PORT ? 1.2 : 1.7], [T.before + 1.5, 90, -260, Z * 1.02],
    [T.program + .2, 90, -260, Z * 1.02], [T.program + 1.6, -120, -300, PORT ? .95 : 1.42],
  ]);

  const wood = P.wood, plaster = mix(P.wall, P.cream, .3);
  function room(x) {
    x.fillStyle = plaster; x.fillRect(-1800, -1400, 3600, 1400);
    x.fillStyle = mix(plaster, P.wood, .25); x.fillRect(-1800, -70, 3600, 70);
    for (let i = -30; i < 30; i++) for (let j = 0; j < 16; j++) { x.fillStyle = (i + j) % 2 ? mix(P.cream, P.roof, .15) : mix(P.roof, P.ink, .1); x.fillRect(i * 60, j * 40, 60, 40); }
    const wx = -120, wy = -470;
    x.fillStyle = mix(P.glass, P.cream, .4); x.fillRect(wx - 90, wy, 180, 250);
    for (const s of [-1, 1]) { x.fillStyle = mix(P.sheet2, P.ink, .1); x.fillRect(wx + s * 90 + (s < 0 ? -80 : 0), wy, 80, 250);
      x.strokeStyle = mix(P.sheet2, P.ink, .4); x.lineWidth = 3; for (let yy = wy + 12; yy < wy + 245; yy += 14) { x.beginPath(); x.moveTo(wx + s * 90 + (s < 0 ? -76 : 4), yy); x.lineTo(wx + s * 90 + (s < 0 ? -4 : 76), yy); x.stroke(); } }
    x.strokeStyle = mix(plaster, P.ink, .3); x.lineWidth = 8; x.strokeRect(wx - 90, wy, 180, 250);
    x.fillStyle = mix(P.cream, P.window, .35); x.fillRect(470, -330, 190, 330);
    x.fillStyle = mix(plaster, P.ink, .3); x.fillRect(456, -340, 14, 340); x.fillRect(660, -340, 14, 340); x.fillRect(456, -352, 218, 14);
    x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(-680, -520, 150, 110); x.fillStyle = mix(P.sheet2, P.cream, .5); x.fillRect(-670, -510, 130, 90);
  }
  function counter(x) {
    x.fillStyle = mix(wood, P.ink, .12); x.fillRect(-560, TOP + 8, 1000, -TOP - 8);
    x.strokeStyle = mix(wood, P.ink, .35); x.lineWidth = 4; for (let px = -530; px < 420; px += 120) x.strokeRect(px, TOP + 24, 96, -TOP - 40);
    x.fillStyle = mix(wood, P.cream, .15); x.fillRect(-580, TOP - 6, 1040, 16);
  }

  const HEAP = []; { let k = 0; for (let r = 0; r < 8; r++) for (let i = 0; i < 9 - r; i++) HEAP.push({ x: 60 + (i - (8 - r) / 2) * 30 + (hash(k, 3) - .5) * 10, y: TOP - 6 - r * 19, a: (hash(k, 4) - .5) * .7, d: hash(k++, 5) > .5 ? 1 : -1 }); }
  const heapIn = i => T.clerk + (i / HEAP.length) * (T.they - T.clerk);
  const heapGone = t => smooth((t - T.just - .3) / .3);
  function heap(x, t) {
    const g = heapGone(t); if (g >= 1) return;
    x.globalAlpha = 1 - g;
    HEAP.forEach((h, i) => {
      const k = clamp((t - heapIn(i)) / .22); if (k <= 0) return;
      x.save(); x.translate(h.x, h.y - (1 - k * k) * 160); x.rotate(h.a);
      HN.rat(x, P, { x: 0, y: 0, s: 1.45, dir: h.d, run: 0, limp: 1 });
      x.restore();
    });
    x.globalAlpha = 1;
  }

  const idleR = M.idle({ x: 0, seed: 2 }), idleC = M.idle({ x: 0, seed: 7 });
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  function resident(tp) {
    let p = idleR(tp);
    const sign = F.env(tp, .2, .6, 2.1, 2.5), wig = Math.sin(tp * 22) * 2.5 * sign;
    const take = smooth((tp - T.hand) / .5), hold = smooth((tp - T.hand - .5) / .4);
    const tgt = [lerp(lerp(24, 36 + wig, sign), lerp(38, 30, hold), take), lerp(lerp(-40, -57, sign), lerp(-57, -64, hold), take)];
    p = at(p, 1, tgt);
    p.head = (p.head || 0) + .12 * F.env(tp, T.they - .1, T.they + .3, T.they + .7, T.they + .9) - .22 * F.env(tp, T.they + .8, T.they + 1.1, T.hand + .3, T.hand + .7)
      - .2 * smooth((tp - T.roaring + .4) / .5);
    p.lean = (p.lean || 0) - .07 * smooth((tp - T.roaring + .4) / .5);
    return { p, sign, take: hold };
  }
  function clerk(tp) {
    let p = idleC(tp);
    const recoil = F.env(tp, T.dead - .3, T.dead + .3, T.just, T.just + .4);
    p.lean = (p.lean || 0) - .12 * recoil; p.head = (p.head || 0) - .1 * recoil;
    const dust = F.env(tp, T.clean + .5, T.clean + .7, T.clean + 1.3, T.clean + 1.5), ph = Math.sin(tp * 26) * 3 * dust;
    const slide = F.env(tp, T.paid - .3, T.paid, T.paid + .3, T.paid + .6);
    p = at(p, 1, [lerp(26, 42, slide) + ph, lerp(-42, -58, Math.max(slide, dust * .9))]);
    if (dust > 0) p = at(p, 0, [24 - ph, -56]);
    return p;
  }
  function figure(x, pose, look, px, draw) {
    x.save(); x.translate(px, 0); x.scale(FS, FS); const PJ = M.draw(x, P, pose, look); if (draw) draw(PJ); x.restore();
  }

  const CROWD = F.rulers.crowd(P, 10);
  const queueN = t => 1 + Math.floor(9 * smooth((t - T.before) / (T.program + 1.5 - T.before)));
  const tally = t => t < T.clean ? 0 : 1 + Math.floor(clamp((t - T.clean) / 2) * 8) + Math.floor(1400 * Math.pow(clamp((t - T.before) / (T.program - T.before)), 1.6)) + Math.floor(Math.max(0, t - T.program) * 3100);
  const bundles = t => Math.floor(clamp((t - T.before - .3) / 3) * 12);
  function trays(x, t) {
    TRAYS.forEach((tx, i) => {
      x.fillStyle = mix(P.wood, P.cream, .35); x.fillRect(tx - 26, TOP - 12, 52, 10);
      const n = clamp(bundles(t) - i * 4, 0, 4);
      for (let b = 0; b < n; b++) for (let k = 0; k < 5; k++) HN.tail(x, P, tx - 22 + b * 3, TOP - 14 - b * 4 - k * .8, 44, -.05 + k * .03, 2);
    });
    if (t > T.clean + .1 && bundles(t) < 1) HN.tail(x, P, TRAYS[0] - 20, TOP - 14, 42, .02);
  }

  function report(x, t) {
    const k = smooth((t - T.program - .2) / .35); if (k <= 0) return;
    x.save(); x.translate(REPORT[0], REPORT[1] - (1 - k) * 60); x.globalAlpha = k;
    const rw = 280, rh = 200; x.fillStyle = mix(P.card, P.cream, .4); x.fillRect(-rw / 2, -rh / 2, rw, rh);
    x.strokeStyle = mix(P.card, P.ink, .6); x.lineWidth = 3; x.beginPath(); x.moveTo(-rw * .4, -rh * .3); x.lineTo(-rw * .4, rh * .38); x.lineTo(rw * .42, rh * .38); x.stroke();
    x.strokeStyle = P.ink; x.lineWidth = 4; x.lineJoin = 'round'; x.beginPath();
    const pts = [[-.38, .3], [-.2, .24], [-.05, .12], [.1, .05], [.22, -.22], [.3, .02], [.4, .08]]; pts.forEach(([u, v], i) => (i ? x.lineTo : x.moveTo).call(x, u * rw, v * rh)); x.stroke();
    x.fillStyle = P.amberDark; x.beginPath(); x.arc(.22 * rw, -.22 * rh, 6, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.font = '900 25px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('20,000+ IN ONE DAY', 0, -rh * .39);
    x.fillStyle = mix(P.ink, P.card, .3); x.beginPath(); x.arc(0, -rh / 2 + 6, 5, 0, TAU); x.fill();
    x.restore();
  }

  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => {
      room(x);
      const pk = smooth((t - T.puts) / .35);
      if (pk > 0) {
        x.save(); x.translate(POSTER[0], POSTER[1] - (1 - pk) * 40); x.globalAlpha = pk;
        HN.poster(x, P, 'paper', { w: 170, h: 230, rat: 1, coin: 1, cut: B.blend(t, CUT[0], CUT[1]), fall: easeIO((t - FALL[0]) / (FALL[1] - FALL[0])) });
        x.restore();
      }
      report(x, t);
      for (let i = 0; i < 10; i++) {
        const k = smooth((t - T.before - .1 - i * .32) / .3); if (k <= 0 || i >= queueN(t) + 1) continue;
        x.globalAlpha = k; const cr = CROWD[i];
        figure(x, M.idle({ x: 0, seed: 20 + i })(tp), { ...cr.look, dir: -1, shadow: 0 }, 540 + i * 92, null);
        x.globalAlpha = 1;
      }
      const R = resident(tp);
      figure(x, R.p, { ...CAST.resident, dir: 1 }, RES, PJ => {
        const wr = PJ.arms[1].wr;
        if (R.sign > 0) { x.strokeStyle = P.ink; x.lineWidth = 1.6; x.beginPath(); x.moveTo(wr[0] + 2, wr[1]); x.lineTo(wr[0] + 7, wr[1] + 9); x.stroke(); }
        if (R.take > 0) HN.scissors(x, P, { x: wr[0] + 4, y: wr[1] + 1, a: -.35, s: .32, open: .5 + .4 * Math.sin(tp * 9) * (1 - R.take) });
      });
      figure(x, clerk(tp), { ...CAST.clerk, dir: 1 }, CLK, null);
      counter(x);
      x.fillStyle = mix(P.card, P.cream, .3); x.fillRect(RES + 30, TOP - 7, 60, 5);
      heap(x, t);
      trays(x, t);
      PR.tally(x, P, 'paper', TALLY[0], TALLY[1], .55, tally(t));
    });
    if (t > CUT[0] - .5 && t < FALL[1] + .4) L.sheet(ctx, c, 1, [0, 0], x => {
      const u = B.blend(t, CUT[0], CUT[1]), away = smooth((t - FALL[0]) / .5), rs = 230 * .0105;
      const sx = POSTER[0] - .18 * 170 - 12 * rs + u * 40 * rs, sy = POSTER[1] + .13 * 230 - 11 * rs;
      HN.scissors(x, P, { x: sx + 120 * (1 - smooth((t - CUT[0] + .5) / .5)) + 120 * away, y: sy - 4, a: Math.PI + .05, s: .7, open: .15 + .45 * Math.abs(Math.sin(u * 9)) });
    }, { paperShadow: [4, 6, 5, .35] });
    if (t > T.bring && t < T.clean + .8) L.sheet(ctx, c, 1, [0, 0], x => {
      const d = smooth((t - T.tail71 + .25) / .3), s = smooth((t - T.paid + .2) / .5), gone = smooth((t - T.clean - .1) / .45);
      if (gone < 1) HN.tail(x, P, lerp(90, lerp(90, TRAYS[0] - 20, gone), 1), lerp(TOP - 110, TOP - 9, d) - gone * 6, 42, lerp(.5, .02, d));
      if (s > 0) PR.coin(x, P, 'paper', lerp(-10, 140, s), TOP - 4, 11, 1);
    });
    L.grade(ctx, t);
  }

  F.scene('seq-13', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label, api: { cam } });
})();
