(function () {
  'use strict';
  const F = FILM, PR = F.props, M = F.motion, B = F.bits, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-25'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;
  const S9 = F.getScene('seq-09').api, S3 = F.getScene('seq-03').api, T9 = S9.DUR, FL = S3.FL, DESK = S3.DESK, WIN = S9.WIN;
  const T = { reward: 1.207, not: 1.012, goal: 1.713, s105: C.s('S105').t0, proxy: 3.176, s106: C.s('S106').t0,
    chasing: 6.469, expect: 8.764, s107: C.s('S107').t0, price: 11.743, no: 13.607, reduce: 15.22,
    s108: C.s('S108').t0, paid: 17.88, s109: C.s('S109').t0, generally: 20.739 };
  const GOAL_AT = [338, -118 - 22], TAG = () => S9.tailTie(T9 + 5), DOOR = [-640, FL], SIGN = [-640, -300];

  const A = S9.cam(T9), tg = TAG(), ZF = PORT ? .72 : 1;
  const AZ = 6.8 * ZF, ARCH = [DOOR[0], DOOR[1] - 230];
  const cam = B.cam([
    [0, A.x, A.y, A.z], [T.not, A.x + 18, A.y - 12, A.z * 1.05], [T.s105 + .5, tg[0] - 10, tg[1] - 20, A.z * 1.3], [T.s106 + .1, tg[0] - 12, tg[1] - 20, A.z * 1.32],
    [T.s106 + 1.3, -180, 20, 1.35 * ZF], [T.s107 - .1, -170, 10, 1.4 * ZF], [T.s107 + 1.1, -420, -120, 1.35 * ZF], [T.s109 - .1, -440, -150, 1.45 * ZF],
    [T.s109 + 1.6, ARCH[0], ARCH[1], AZ], [DUR, ARCH[0], ARCH[1], AZ * 1.02],
  ]);

  function coin(x, t) {
    if (t > T.s106 + .2) return;
    let p;
    if (t < T.not) { const u = easeIO(clamp((t - .2) / (T.not - .2))); p = [lerp(170, 300, u), lerp(20, -60, u) - Math.sin(u * Math.PI) * 30]; }
    else if (t < T.s105 + .1) { const u = easeIO(clamp((t - T.not - .15) / (T.s105 - T.not))); p = [lerp(300, tg[0] - 30, u), lerp(-60, tg[1] - 60, u)]; }
    else { const u = easeIO(clamp((t - T.s105 - .1) / .5)); p = [lerp(tg[0] - 30, tg[0] - 6, u), lerp(tg[1] - 60, tg[1] - 8, u)]; }
    PR.coin(x, P, 'paper', p[0], p[1] + Math.sin(t * 5) * 2, 9, t < T.s105 + .5 ? .15 : .8);
  }
  function tag(x, cx, cy, text, k, a = 0, s = 1) {
    if (k <= 0) return;
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(s * k, s); x.globalAlpha = clamp(k * 3);
    x.strokeStyle = mix(P.ink, P.card, .3); x.lineWidth = 1; x.beginPath(); x.moveTo(0, -14); x.lineTo(0, -4); x.stroke();
    const tw = text.length * 9 + 18; x.fillStyle = P.amber; x.beginPath(); x.moveTo(-tw / 2, -4); x.lineTo(tw / 2, -4); x.lineTo(tw / 2, 16); x.lineTo(-tw / 2, 16); x.closePath(); x.fill();
    x.fillStyle = P.ink; x.font = '900 15px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 0, 6.5);
    x.restore();
  }

  const QS = 2.45, LOOKS = F.rulers.crowd(P, 8), FARM = F.farm;
  const RUN = Array.from({ length: 7 }, (_, i) => {
    const t0 = T.s106 + .6 + i * .55, to = -130 + (i % 4) * 34 - Math.floor(i / 4) * 60, boy = i === 2 || i === 5;
    const g = M.gait({ from: (-760 - i * 20) / QS, to: to / QS, t0, gait: 'run', until: t0 + 1.25, arms: [[.55, 1.4], [.55, 1.4]] });
    const look = i === 1 || i === 4 ? { ...FARM.breeder(P) } : { ...LOOKS[i].look };
    return { g, t0, arrive: t0 + 1.25, s: boy ? QS * .72 : QS, look };
  });
  const SLOTS = Array.from({ length: 21 }, (_, k) => { const row = Math.floor(k / 5), col = k % 5; return [120 + col * 44 + (row % 2) * 22, DESK.top - 4 - row * 26, k % 3 === 1]; });
  const slotT = k => RUN[k % RUN.length].arrive + Math.floor(k / RUN.length) * .5 + (k % 2) * .08;
  function runners(x, tp) {
    RUN.forEach((r, i) => {
      if (tp < r.t0) return;
      const pose = tp < r.arrive + .1 ? r.g(tp) : { ...M.idle({ x: r.g(r.arrive + .1).hip[0], seed: 70 + i })(tp) };
      x.save(); x.translate(0, FL + 6); x.scale(r.s, r.s);
      const PJ = M.draw(x, P, pose, { ...r.look, dir: 1, shadow: 0, prop: tp < r.arrive ? (xx, J) => { const wr = J.arms[1].wr; PR.basket(xx, P, wr[0] + 4, wr[1] + 16, .36, 1); tag(xx, wr[0] + 16, wr[1] + 4, '', .8, 0, .5); } : null });
      x.restore();
    });
  }
  function heap(x, t) {
    SLOTS.forEach(([sx, sy, isBasket], k) => {
      const t0 = slotT(k), u = clamp((t - t0) / .45); if (u <= 0) return;
      const r = RUN[k % RUN.length], fx = -120, fy = FL - 120, px = lerp(fx, sx, u), py = lerp(fy, sy, u) - Math.sin(u * Math.PI) * 160;
      x.save(); x.translate(px, py); x.rotate((1 - u) * 3 * (k % 2 ? 1 : -1));
      if (isBasket) { PR.basket(x, P, 0, 12, .5, 1); tag(x, 18, -6, '', 1, .3, .6); }
      else { const pts = []; for (let j = 0; j < 20; j++) { const v = j / 19; pts.push([-34 + v * 68, Math.sin(v * 5 + k) * 5]); } PR.cobraBody(x, P, pts, { w: 9, eye: 0 }); tag(x, 30, 2, '', 1, .5, .5); }
      x.restore();
    });
    const pk = clamp((t - T.price) / .3); if (pk > 0) tag(x, 210, DESK.top - 150 + Math.sin(t * 4) * 2, '1', pk, Math.sin((t - T.price) * 5) * .4 * Math.exp(-(t - T.price)), 1.4);
  }

  function sign(x, t) {
    const [sx, sy] = SIGN, sw = 400, sh = 170;
    x.fillStyle = mix(P.wood, P.ink, .15); x.fillRect(sx - sw / 2 - 8, sy - sh / 2 - 8, sw + 16, sh + 16);
    x.fillStyle = mix(P.card, P.cream, .3); x.fillRect(sx - sw / 2, sy - sh / 2, sw, sh);
    x.fillStyle = P.ink; x.textAlign = 'center'; x.textBaseline = 'middle';
    const paint = (txt, y, k, size = 40) => { if (k <= 0) return; x.save(); x.beginPath(); x.rect(sx - sw / 2, y - 30, sw * k, 60); x.clip(); x.font = `900 ${size}px NSC`; x.fillText(txt, sx, y); x.restore(); };
    const peel = smooth((t - T.no) / .5), fall = clamp((t - T.no - .3) / .7), repaint = clamp((t - T.program108) / 1.1);
    paint(repaint > 0 ? 'COBRAS' : 'COBRA', sy - 52, 1);
    if (fall < 1) { x.save(); x.translate(sx, sy + 2 + fall * fall * 500); x.rotate(peel * .25 + fall * 1.2); x.globalAlpha = 1 - smooth((fall - .6) / .4); x.font = '900 40px NSC'; x.fillText('REDUCTION', 0, 0); x.restore(); }
    paint('BOUGHT', sy + 2, repaint);
    paint('PROGRAMME', sy + 56, 1 - clamp(repaint * 2));
    paint('HERE', sy + 56, clamp(repaint * 2 - 1));
  }
  T.program108 = 17.252;

  const EXT_S = 290 / 1700;
  function outside(x, t) {
    const k = smooth((t - T.s109) / .8); if (k <= 0) return;
    x.save(); x.beginPath(); F.city.archPath(x, DOOR[0], FL, 290, 440); x.clip();
    x.translate(ARCH[0], ARCH[1]); x.scale(EXT_S, EXT_S);
    x.fillStyle = mix(P.bgTop, P.cream, .55); x.fillRect(-2000, -1600, 4000, 3200);
    x.fillStyle = mix(P.sheet2, P.cream, .3); x.beginPath(); x.moveTo(-2000, 200); x.quadraticCurveTo(-400, -500, 600, -250); x.quadraticCurveTo(1200, -120, 2000, -300); x.lineTo(2000, 1600); x.lineTo(-2000, 1600); x.fill();
    const lane = u => [lerp(-900, 900, u) + Math.sin(u * 7) * 140, lerp(900, -260, Math.pow(u, .8))];
    x.strokeStyle = mix(P.sheetDim, P.cream, .3); x.lineWidth = 140; x.lineCap = 'round'; x.beginPath(); for (let u = 0; u <= 1; u += .02) { const p = lane(u); x.lineTo(p[0], p[1]); } x.stroke();
    const n = Math.floor(lerp(10, 60, smooth((t - T.s109) / (DUR - T.s109))));
    for (let i = n - 1; i >= 0; i--) {
      const u = i / 62, p = lane(u), s = lerp(2.4, .7, u), bob = Math.abs(Math.sin(t * 6 + i)) * 6 * s;
      x.fillStyle = mix(LOOKS[i % 8].look.coat, P.ink, .1 + u * .3); x.beginPath(); x.ellipse(p[0], p[1] - 40 * s, 12 * s, 34 * s, 0, 0, TAU); x.fill();
      x.beginPath(); x.arc(p[0], p[1] - 84 * s, 11 * s, 0, TAU); x.fill();
      PR.basket(x, P, p[0] + 16 * s, p[1] - 30 * s - bob, .3 * s, 1);
    }
    x.restore();
  }

  function draw(ctx, t) {
    const c = cam(t), tp = L.pose(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => {
      S9.office(x, T9 + t);
      sign(x, t);
      outside(x, t);
      tag(x, GOAL_AT[0], GOAL_AT[1], 'GOAL', smooth((t - .3) / .35), Math.sin(t * 2) * .05, 1.1);
      coin(x, t);
      tag(x, tg[0] + 2, tg[1] + 3, 'PROXY', smooth((t - T.proxy + .1) / .25), 0, .9);
      heap(x, t); runners(x, tp);
    });
    L.sheet(ctx, c, 1.12, [0, 0], x => S3.punkah(x, P, T9 + t), { shadowAlpha: .6 });
    L.grade(ctx, t);
  }

  F.scene('seq-25', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
