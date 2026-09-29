(function () {
  'use strict';
  const F = FILM, MAP = F.citymap, PL = F.plain, M = F.motion, PR = F.props, CS = F.cases, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-26'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { reversal: 0.539, s111: C.s('S111').t0, fewer: 3.804, result: 5.219, bred: 7.555, reward: 9.723,
    poured: 10.65, dried: 13.088, s113: C.s('S113').t0, fail: 15.365, s114: C.s('S114').t0, pointed: 17.419, people: 18.629 };
  const CW = PORT ? 900 : 980, CHH = PORT ? 560 : 540, CX = W / 2 - CW / 2 + (PORT ? 0 : 60), CY = PORT ? 330 : 250;
  const pad = CW * .1, AX0 = pad, AX1 = CW - pad * .6, AY0 = CHH - pad * .9, AY1 = pad * 1.5, X = u => lerp(AX0, AX1, u), Y = v => lerp(AY0, AY1, v);
  const PUSH = [T.fewer - .2, T.fewer + .5], RISE = [T.result, T.bred + .3], BURST = T.dried + .35, SWING = [T.pointed - .5, T.pointed + .5];
  const lineV = (u, t) => {
    const flat = .7, push = easeIO((t - PUSH[0]) / (PUSH[1] - PUSH[0])), rise = easeIO((t - RISE[0]) / (RISE[1] - RISE[0]));
    const down = flat - .32 * push * Math.exp(-Math.pow((u - .45) / .28, 2));
    const cv = F.lerp(...(() => { let a = CS.CURVE[0], b = CS.CURVE[CS.CURVE.length - 1]; for (let i = 1; i < CS.CURVE.length; i++) if (CS.CURVE[i][0] >= u) { a = CS.CURVE[i - 1]; b = CS.CURVE[i]; break; } const k = (u - a[0]) / Math.max(1e-6, b[0] - a[0]); return [a[1], b[1], clamp(k)]; })());
    return lerp(down, cv - .06, rise);
  };
  const CAGES = [.62, .7, .78, .86, .93];
  const fill = (t, i) => clamp((t - T.bred - .2 - i * .25) / 3.2);
  function chart(x, t) {
    x.save(); x.translate(CX, CY);
    MAP.chart(x, P, { w: CW, h: CHH, draw: 0, label: 1 });
    x.strokeStyle = P.ink; x.lineWidth = CW * .016; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
    for (let u = 0; u <= .93; u += .01) { const px = X(u), py = Y(lineV(u, t)); u ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    CAGES.forEach((u, i) => {
      const k = smooth((t - RISE[1] + .3 - i * .08) / .4); if (k <= 0) return;
      const cx = X(u), cy = Y(lineV(u, t)) - 8, s = 58, burst = smooth((t - BURST - i * .06) / .25);
      x.save(); x.globalAlpha = k; x.translate(cx, cy);
      x.fillStyle = mix(P.wood, P.cream, .25); x.fillRect(-s / 2, -s, s, s);
      const n = Math.round(fill(t, i) * 3); for (let j = 0; j < n && burst < 1; j++) { const pts = PR.slitherPath([-s * .3 + j * 8, -8 - j * 14], 44, { amp: 4, k: TAU / 26, phase: j + i }); PR.cobraBody(x, P, pts, { w: 6, eye: 0 }); }
      x.fillStyle = mix(P.wood, P.ink, .2); for (let b = 0; b <= 5; b++) { x.save(); x.translate(-s / 2 + b * s / 5, -s); x.rotate(burst * (b - 2.5) * .5); x.translate(0, -burst * 30); x.fillRect(-2, 0, 4, s); x.restore(); }
      x.restore();
    });
    x.restore();
  }
  function coins(x, t) {
    const t0 = T.bred - .2, t1 = T.dried + .3;
    for (let k = 0; k < 60; k++) {
      const tk = t0 + k * .1 + (k > 44 ? (k - 44) * .12 : 0); if (tk > t1) break;
      const u = (t - tk) / .7; if (u < 0 || u > 1) continue;
      const i = k % CAGES.length, cx = CX + X(CAGES[i]), cy = CY + Y(lineV(CAGES[i], tk + .7)) - 70;
      PR.coin(x, P, 'flat', cx + (hash(k, 2) - .5) * 20, lerp(CY - 300, cy, u * u), 17, .3 + .7 * Math.abs(Math.sin(u * 8)));
    }
  }
  function pouring(x, t) {
    const u0 = t - BURST; if (u0 <= 0) return;
    for (let k = 0; k < 36; k++) {
      const i = k % CAGES.length, d = u0 - (k / 36) * 1.2; if (d <= 0) continue;
      const sx = CX + X(CAGES[i]) + (hash(k, 3) - .5) * 60, sy = CY + CHH - 20, py = sy + d * d * 900, px = sx + (hash(k, 4) - .5) * d * 380;
      if (py > H + 60) continue;
      const pts = PR.slitherPath([px, py], 70, { amp: 6, k: TAU / 40, phase: k + t * 5, dir: hash(k, 5) < .5 ? 1 : -1 });
      PR.cobraBody(x, P, pts, { w: 9, eye: 0 });
    }
  }
  const PIV = [CX + CW * .5, CY + CHH * .46];
  function arrowAng(t) {
    const shud = F.env(t, T.fail - .3, T.fail - .1, T.s114 - .1, T.s114 + .1) * Math.sin(t * 55) * .06;
    const sw = easeOutBack(clamp((t - SWING[0]) / (SWING[1] - SWING[0])), 1.3);
    return lerp(Math.PI / 2, ANG_END, sw) + shud;
  }
  const OFF = [CX + (PORT ? 90 : 110), CY - 2], ANG_END = (a => a < Math.PI / 2 ? a + TAU : a)(Math.atan2(OFF[1] - 110 - PIV[1], OFF[0] - PIV[0]));
  const ARROWK = t => smooth((t - .15) / .5);
  function arrow(x, t) {
    const k = ARROWK(t); if (k <= 0) return;
    const push = F.env(t, PUSH[0], PUSH[1], T.result - .2, T.result + .3) * 70;
    x.save(); x.translate(PIV[0], PIV[1]); x.rotate(arrowAng(t)); x.translate(push, 0); x.scale(k, k);
    PL.arrow(x, P, { x0: -230, x1: 200, y: 0, w: 46, hw: 110, hl: 90, u: 1 });
    const hk = smooth((t - T.people + .4) / .6); if (hk > 0) { x.save(); x.translate(250, 0); x.rotate(-arrowAng(t)); PR.cobraRear(x, P, { w: 30, rise: hk, hood: hk, view: 'back', sway: Math.sin(t * 2) * .1 }); x.restore(); }
    x.restore();
  }
  function officials(x, t) {
    const k = smooth((t - T.s113 - .2) / .8); if (k <= 0) return;
    const ink = mix(P.ink, P.sheet2, .2), look = { coat: ink, trouser: ink, skin: ink, head: 'bare', hair: ink, shoe: ink, shadow: 0 }, tp = M.pose(t);
    [[OFF[0] - 40, 'bare'], [OFF[0] + 40, 'topi']].forEach(([px, head], i) => {
      const p = M.idle({ x: 0, seed: 80 + i })(tp), back = smooth((t - T.people + .2) / .4); p.lean = (p.lean || 0) - .1 * back;
      x.save(); x.globalAlpha = k; x.translate(px, OFF[1]); x.scale(2.2, 2.2); M.draw(x, P, p, { ...look, head, headColor: ink, dir: 1 }); x.restore();
    });
  }
  function draw(ctx, t) {
    const z = (PORT ? 1 : .86) * lerp(1, 1.04, smooth(t / DUR));
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z }, 1, [W / 2, H / 2], x => {
      x.save(); x.translate(W / 2, H * (PORT ? .82 : .95)); x.scale(PORT ? .5 : .62, PORT ? .5 : .62);
      MAP.draw(x, P, { snakes: () => 1, more: smooth((t - BURST - .3) / 1.6), t: 0 }); x.restore(); x.fillStyle = F.rgba(F.hex(P.bgTop), .45); x.fillRect(-W, -H, 3 * W, 3 * H);
      chart(x, t); coins(x, t); pouring(x, t); officials(x, t); arrow(x, t);
    }, { flatShadow: [12, 16, 14, .4] });
    L.grade(ctx, t);
  }
  F.scene('seq-26', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
