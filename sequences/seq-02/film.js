(function () {
  'use strict';
  const F = FILM, PR = F.props, CITY = F.city, M = F.motion, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, keyed, TAU } = F, mix = CITY.mix;
  const C = F.cues('seq-02'), DUR = C.duration;
  const LF = F.look('flat', W, H), LP = F.look('paper', W, H);

  const T = {
    gov: 0.314, reasonable: 2.231, s5: C.s('S005').t0, money: 3.589,
    s6: C.s('S006').t0, cash: 4.573, reward: 4.865, dead: 5.838, bring: 6.714, in: 7.054,
    simple: 7.62, s8: C.s('S008').t0, hunting: 9.593, results: 11.151,
  };
  const TD = T.s6 + 1.0;
  const BLEND = [TD - .45, TD + .1];
  const SETTLE = DUR - .4;

  const GY = 300, WIN = [0, GY - 250];
  function facade(x, P) {
    { const g = x.createLinearGradient(0, -1800, 0, GY); g.addColorStop(0, P.bgTop); g.addColorStop(1, P.bgBot); x.fillStyle = g; x.fillRect(-4000, -2600, 8000, 2600 + GY); }
    x.fillStyle = P.sheet; x.fillRect(-2600, GY, 5200, 900);
    const wall = P.sheet, shade = P.sheetShade;
    x.fillStyle = shade; x.fillRect(-720, GY - 330, 1440, 16);
    x.fillStyle = wall; x.fillRect(-700, GY - 320, 1400, 320);
    for (const d of [-1, 1]) {
      x.fillStyle = wall; x.fillRect(d * 620 - 90, GY - 420, 180, 420);
      x.fillStyle = shade; x.fillRect(d * 620 - 100, GY - 430, 200, 14);
      CITY.dome(x, P, d * 620, GY - 430, 70);
    }
    x.fillStyle = wall; x.fillRect(-230, GY - 440, 460, 440);
    x.fillStyle = shade; x.fillRect(-245, GY - 452, 490, 16);
    CITY.dome(x, P, 0, GY - 452, 190);
    x.fillStyle = shade; for (let k = 0; k < 4; k++) x.fillRect(-300 + k * 10, GY - 8 - k * 10, 600 - k * 20, 10);
    const win = (cx, cy, ww, hh, a = 1) => {
      x.fillStyle = shade; x.beginPath(); CITY.archPath(x, cx, cy + 6, ww + 14, hh + 12); x.fill();
      x.fillStyle = P.window; x.globalAlpha = a; x.beginPath(); CITY.archPath(x, cx, cy, ww, hh); x.fill(); x.globalAlpha = 1;
    };
    for (let i = 0; i < 9; i++) { const cx = -620 + i * 155; if (Math.abs(cx) < 250) continue; win(cx, GY - 40, 56, 110); win(cx, GY - 190, 50, 90, .85); }
    for (const d of [-1, 1]) { win(d * 620, GY - 250, 44, 90); win(d * 620, GY - 60, 60, 120); }
    win(-140, GY - 40, 64, 150); win(140, GY - 40, 64, 150);
    x.fillStyle = shade; x.beginPath(); CITY.archPath(x, WIN[0], WIN[1] + 81, 100, 184); x.fill();
    x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); CITY.archPath(x, WIN[0], WIN[1] + 75, 84, 170); x.fill(); x.restore();
  }
  const T_IN = 1.95, ZF0 = PORT ? .76 : .85, ZF1 = 34, WC = [WIN[0], WIN[1] - 10], PO = .478;
  function fcam(t) {
    const k = easeIO(clamp((t - .15) / (T_IN - .15)));
    return { x: lerp(0, WC[0], k), y: lerp(PORT ? -60 : 20, WC[1], k), z: ZF0 * Math.pow(ZF1 / ZF0, k) };
  }

  const OS = 4.2, SUIT = '#d9ceb4', SKIN_O = '#e0bf9c', HAIR = '#2e2622', MAN_X = -5;
  const EY = -64, VPX = 46, KZ = .38 / 40;
  const sOf = Z => 1 / (1 + KZ * Z);
  const p3 = (X, Z, Hh) => { const s = sOf(Z); return [VPX + (X - VPX) * s, EY + (-Hh - EY) * s]; };
  const TOP = 33;
  const quad = (x, pts) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
  const NP = { X: 27, Z: 16, hw: 11, hd: 8, rot: -.1 };
  const onPaper = (lx, lz) => { const c = Math.cos(NP.rot), s = Math.sin(NP.rot); return p3(NP.X + lx * c - lz * s, NP.Z + lx * s + lz * c, TOP + .05); };
  const PAPER_Q = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => onPaper(a * NP.hw, b * NP.hd));
  const PAPER = { x: NP.X, y: p3(NP.X, NP.Z, TOP)[1], w: 22, h: 5 };
  const NOTE = [PAPER.x * OS, PAPER.y * OS], NOTE_W = PAPER.w * OS, NOTE_H = PAPER.h * OS;
  const ROWS = [[-.36, .52], [-.29, .7], [.3, .64], [.36, .7], [.42, .5]];
  const inkAt = tp => clamp((tp - 1.1) / 2.0);
  const rowPt = (i, f, wob = 0) => { const [ry, rw] = ROWS[i]; return onPaper((-rw / 2 + rw * f) * NP.hw * 2 * .86, -ry * NP.hd * 2 * .86 + wob); };
  function nibAt(tp) {
    const k = inkAt(tp) * ROWS.length, i = Math.min(ROWS.length - 1, Math.floor(k)), f = k >= ROWS.length ? 1 : k - i;
    const p = rowPt(i, f, inkAt(tp) > 0 && inkAt(tp) < 1 ? Math.sin(tp * 38) * .5 : 0);
    return [p[0], p[1] - (inkAt(tp) >= 1 || inkAt(tp) <= 0 ? .8 : 0)];
  }
  const POT_AT = [40, 30], BOX_AT = [27, 34], COIN_AT = [41, 9], LAMP_AT = [64, 26];
  const POT = p3(POT_AT[0], POT_AT[1], TOP + 3.6), BOX = p3(BOX_AT[0], BOX_AT[1], TOP + 4), COINS = p3(COIN_AT[0], COIN_AT[1], TOP), REST = p3(30, 6, TOP + 1);
  const GRIP = [-6.6, -5.6];
  function nibPath(tp) {
    const n = nibAt(Math.min(tp, T.s5)), k = easeIO(clamp((tp - T.s5) / .16));
    return [lerp(n[0], POT[0], k), lerp(n[1], POT[1] - .5, k)];
  }
  function nearWrist(tp) {
    const n = nibAt(Math.min(tp, T.s5)), a = T.s5, b = a + .16, c = a + .3, d = T.money, e = T.money + .3;
    if (tp <= a) return [n[0] + GRIP[0], n[1] + GRIP[1]];
    return keyed(tp, [[a, [n[0] + GRIP[0], n[1] + GRIP[1]]], [b, [POT[0] - 6, POT[1] - 1.5]], [c, [BOX[0] - 3, BOX[1] - 4]], [d, [COINS[0] - 4, COINS[1] - 5]], [e, REST]]);
  }
  function cylinder(x, X, Z, r, hh, side, top) {
    const s = sOf(Z), b = p3(X, Z, TOP), t = p3(X, Z, TOP + hh), rx = r * s, ry = r * s * .38;
    x.fillStyle = side; x.beginPath(); x.ellipse(b[0], b[1], rx, ry, 0, 0, Math.PI); x.lineTo(t[0] - rx, t[1]); x.lineTo(t[0] + rx, t[1]); x.closePath(); x.fill();
    x.fillStyle = top; x.beginPath(); x.ellipse(t[0], t[1], rx, ry, 0, 0, TAU); x.fill();
    return t;
  }
  function office(x, P, t) {
    const tp = LF.pose(t);
    x.save(); x.scale(OS, OS);
    const WALLZ = 64, wy = p3(0, WALLZ, 0)[1], sw = sOf(WALLZ);
    x.fillStyle = mix(P.sheet2, P.sheet, .22); x.fillRect(-400, -260, 800, 260 + wy);
    x.fillStyle = mix(P.sheet2, P.sheet, .12); for (let k = -10; k <= 10; k++) x.fillRect(VPX + k * 44 * sw - 1, -260, 2, 260 + wy);
    x.fillStyle = mix(P.sheet2, P.ink, .3); x.fillRect(-400, wy, 800, 200);
    x.fillStyle = mix(P.sheet2, P.ink, .38); x.fillRect(-400, wy - .8, 800, 1.6);
    x.strokeStyle = mix(P.sheet2, P.ink, .4); x.lineWidth = .35;
    for (let X = -300; X <= 400; X += 14) { const a = p3(X, -70, 0), b = p3(X, WALLZ, 0); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
    for (const Z of [-40, -12, 12, 34, 52]) { const a = p3(-400, Z, 0), b = p3(500, Z, 0); x.globalAlpha = .45; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); x.globalAlpha = 1; }
    x.fillStyle = 'rgba(0,0,0,.18)'; quad(x, [p3(8, -2, 0), p3(88, -2, 0), p3(88, 42, 0), p3(8, 42, 0)]); x.fill();
    x.save(); const bk = p3(-96, WALLZ, 0); x.translate(bk[0], bk[1]); x.scale(sw, sw);
    x.fillStyle = mix(P.wood, P.ink, .2); x.fillRect(0, -104, 46, 104);
    for (let r = 0; r < 4; r++) { const shelf = -104 + 4 + r * 25 + 21; x.fillStyle = mix(P.wood, P.ink, .38); x.fillRect(0, shelf, 46, 2.5);
      for (let b = 0; b < 8; b++) { const bh = 17 - hash(b, r, 2) * 5; x.fillStyle = mix(P.wood, P.cream, .1 + hash(b, r, 3) * .2); x.fillRect(3 + b * 5.3, shelf - bh, 4.2, bh); } }
    x.restore();
    const L0 = p3(...LAMP_AT, TOP + 9); PR.glow(x, L0[0], L0[1], 70, P.glow, .22, 'flat');
    const wood = P.wood, woodD = mix(P.wood, P.ink, .22), woodL = mix(P.wood, P.cream, .14);
    x.fillStyle = woodD;
    quad(x, [p3(10, 40, TOP - 3), p3(12.5, 40, TOP - 3), p3(12.5, 40, 0), p3(10, 40, 0)]); x.fill();
    x.fillStyle = mix(P.wood, P.ink, .42); quad(x, [p3(58, 0, TOP - 3), p3(58, 40, TOP - 3), p3(58, 40, 0), p3(58, 0, 0)]); x.fill();
    const cw = mix(P.wood, P.ink, .15);
    x.save(); x.translate(MAN_X, 0);
    x.fillStyle = cw; x.fillRect(-11, -26, 21, 3); x.fillRect(-10, -26, 2.4, 26); x.fillRect(6.5, -26, 2.4, 26);
    x.save(); x.translate(-10, -26); x.rotate(-.1); x.fillRect(-2.6, -34, 3, 34); x.fillRect(-2.6, -34, 7, 3); x.restore();
    x.restore();
    const nw = nearWrist(tp), holdingCoins = tp > T.s5 + .3 && tp < T.money, penInHand = tp < T.s5 + .16;
    const drawMan = () => {
      const p = M.idle({ seed: 7, base: { ...M.seatedPose(20 + MAN_X, 22), lean: .16, bend: .05, head: .12 } })(tp);
      M.reach(p, 0, p3(14, 22, TOP + .5)); p.hands = [{ pose: 'rest', k: .35 }, null];
      if (penInHand) M.reachTool(p, 1, nibPath(tp), { pose: 'write', k: inkAt(tp) > 0 && inkAt(tp) < 1 ? .5 + .5 * Math.sin(tp * 38) : .3, pen: mix(P.ink, P.wood, .4) });
      else { M.reach(p, 1, nw); p.hands[1] = holdingCoins ? { pose: 'fist' } : { pose: 'relaxed', k: .4 }; }
      M.draw(x, P, p, { coat: SUIT, trouser: mix(SUIT, P.ink, .12), skin: SKIN_O, head: 'bare', hair: HAIR, moustache: HAIR, shoe: mix(P.wood, P.ink, .5), shadow: 0,
        over: xx => {
          if (holdingCoins) for (let i = 0; i < 5; i++) { xx.fillStyle = PR.money('flat'); xx.beginPath(); xx.ellipse(nw[0] + 4, nw[1] + 4.2 - i * .45, 2.1, .8, 0, 0, TAU); xx.fill(); }
        } });
    };
    drawMan();
    x.fillStyle = woodL; quad(x, [p3(10, 0, TOP), p3(84, 0, TOP), p3(84, 40, TOP), p3(10, 40, TOP)]); x.fill();
    x.fillStyle = mix(P.wood, P.cream, .05); quad(x, [p3(10, 38, TOP), p3(84, 38, TOP), p3(84, 40, TOP), p3(10, 40, TOP)]); x.fill();
    x.fillStyle = 'rgba(0,0,0,.16)'; quad(x, PAPER_Q.map(p => [p[0] + .5, p[1] + .45])); x.fill();
    x.fillStyle = mix(P.card, P.cream, .4); quad(x, PAPER_Q); x.fill();
    x.strokeStyle = mix(P.card, P.ink, .25); x.lineWidth = .15; quad(x, PAPER_Q); x.stroke();
    { const k = inkAt(tp) * ROWS.length; x.strokeStyle = mix(P.card, P.ink, .55); x.lineWidth = .16; x.lineCap = 'round';
      for (let i = 0; i < ROWS.length; i++) { const f = clamp(k - i); if (f <= 0) break; x.beginPath();
        for (let j = 0; j <= 18; j++) { const q = rowPt(i, f * j / 18, Math.sin((i * 7 + j) * 1.9) * .16); j ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); } x.stroke(); }
      x.lineCap = 'butt'; }
    { const [X0, Z0] = BOX_AT, bw = 4, bd = 3, bh = 4, top = [p3(X0 - bw, Z0 - bd, TOP + bh), p3(X0 + bw, Z0 - bd, TOP + bh), p3(X0 + bw, Z0 + bd, TOP + bh), p3(X0 - bw, Z0 + bd, TOP + bh)];
      x.fillStyle = mix(P.wood, P.ink, .4); quad(x, [p3(X0 + bw, Z0 - bd, TOP), p3(X0 + bw, Z0 + bd, TOP), top[2], top[1]]); x.fill();
      x.fillStyle = mix(P.wood, P.ink, .3); quad(x, [p3(X0 - bw, Z0 - bd, TOP), p3(X0 + bw, Z0 - bd, TOP), top[1], top[0]]); x.fill();
      x.fillStyle = mix(P.wood, P.cream, .02); quad(x, top); x.fill(); }
    cylinder(x, ...POT_AT, 2.2, 3.6, P.ink, mix(P.ink, P.sheet, .35));
    if (!penInHand) { x.strokeStyle = mix(P.ink, P.wood, .4); x.lineWidth = .8; x.lineCap = 'round'; x.beginPath(); x.moveTo(POT[0], POT[1] + .5); x.lineTo(POT[0] - 3.2, POT[1] - 9); x.stroke(); x.lineCap = 'butt'; }
    { const b = cylinder(x, ...LAMP_AT, 1.8, 3.5, mix(P.amberDark, P.wood, .3), mix(P.amberDark, P.cream, .2)); x.fillStyle = P.lampGlass; x.beginPath(); x.ellipse(b[0], b[1] - 3.2, 2.2, 3, 0, 0, TAU); x.fill(); }
    if (tp >= T.money) cylinder(x, COIN_AT[0], COIN_AT[1], 2.1, 2.3, mix(PR.money('flat'), P.ink, .3), PR.money('flat'));
    x.save(); x.beginPath(); x.rect(-400, -300, 800, 300 - TOP); x.clip(); drawMan(); x.restore();
    x.fillStyle = wood; quad(x, [p3(10, 0, TOP), p3(84, 0, TOP), p3(84, 0, TOP - 3), p3(10, 0, TOP - 3)]); x.fill();
    x.fillStyle = woodD; x.fillRect(10.2, -(TOP - 3), 2.5, TOP - 3); x.fillRect(58, -(TOP - 3), 26, TOP - 3);
    x.fillStyle = mix(P.wood, P.ink, .32); for (const y of [-26, -16, -6]) x.fillRect(61, y, 20, .9);
    x.restore();
  }
  const Z_O = PORT ? 1.95 : 2.15, FO = [PORT ? 33 * OS : 36 * OS, PORT ? -36 * OS : -42 * OS], PO2 = Math.log(Z_O / .3) / Math.log(ZF1 / ZF0);
  function ocam(t) {
    if (t < T_IN) {
      const fc = fcam(t), zo = Z_O * Math.pow(fc.z / ZF1, PO2), S = [W / 2 + fc.z * (WC[0] - fc.x), H / 2 + fc.z * (WC[1] - fc.y)];
      return { x: FO[0] - (S[0] - W / 2) / zo, y: FO[1] - (S[1] - H / 2) / zo, z: zo };
    }
    const b = easeIO(clamp((t - T.s5) / .9));
    return { x: lerp(FO[0], 26 * OS, b), y: lerp(FO[1], -44 * OS, b), z: Z_O * lerp(1, 1.3, b) };
  }

  const G = 340, POST = [0, 40], PW = 220, PH = 300;
  const FILL_W = Math.min(W * .9, H * .95 * PW / PH);
  const LANE = [
    { x: -1500, w: 600, h: 560, roof: 'flat', door: .3, tone: .35, seed: 21 },
    { x: -900, w: 560, h: 620, roof: 'dome', door: .7, tone: .15, seed: 22, domeR: 110 },
    { x: -340, w: 680, h: 540, roof: 'flat', balcony: .85, tone: .45, seed: 23, rows: 1 },
    { x: 340, w: 560, h: 600, roof: 'flat', door: .45, tone: .2, seed: 24 },
    { x: 900, w: 640, h: 540, roof: 'dome', door: .6, tone: .4, seed: 25, domeR: 100 },
  ];
  const SK = mix(LP.P.skin, LP.P.wood, .45), CREAM = mix(LP.P.cream, LP.P.sheet, .25);
  const HUNTERS = [
    { x: -330, y: G + 40, s: 2.2, from: -1, to: -1, dy: 150, kind: 'stick', coat: 'coat2', head: 'turban' },
    { x: -180, y: G + 28, s: 2.2, from: -1, to: -1, dy: -24, kind: 'man', coat: 'cream', head: 'cap' },
    { x: 140, y: G + 50, s: 1.45, from: 1, to: 1, dy: 20, kind: 'boy', coat: 'green', head: 'bare' },
    { x: 300, y: G + 34, s: 2.2, from: 1, to: 1, dy: 120, kind: 'fork', coat: 'cream', head: 'turban' },
    { x: 450, y: G + 22, s: 2.15, from: 1, to: 1, dy: -30, kind: 'stick', coat: 'sleeve', head: 'turban' },
  ];
  const depthScale = (h, y) => h.s * (1 + (y - h.y) * .0024);
  const Q = Math.PI / 2, IN = 320;
  const CARRY = {
    stick: (xx, PJ, P) => { const w = PJ.arms[0].wr; xx.strokeStyle = P.wood; xx.lineWidth = 2.2; xx.lineCap = 'round'; xx.beginPath(); xx.moveTo(w[0] - 1, w[1] - 34); xx.lineTo(w[0] + 2, w[1] + 36); xx.stroke(); xx.lineCap = 'butt'; },
    fork: (xx, PJ, P) => { CARRY.stick(xx, PJ, P); const w = PJ.arms[0].wr; xx.strokeStyle = P.wood; xx.lineWidth = 2.2; xx.lineCap = 'round'; xx.beginPath(); xx.moveTo(w[0] - 1, w[1] - 34); xx.lineTo(w[0] - 6, w[1] - 44); xx.moveTo(w[0] - 1, w[1] - 34); xx.lineTo(w[0] + 4, w[1] - 45); xx.stroke(); xx.lineCap = 'butt'; },
    boy: (xx, PJ, P) => { const w = PJ.arms[0].wr; PR.basket(xx, P, w[0] + 3, w[1] + 17, .34, 1); },
  };
  const HOLD = { stick: [[.3, .5], null], fork: [[.3, .5], null], boy: [[.6, 1.35], [.38, 1.08]] };
  const perfs = HUNTERS.map((h, i) => {
    const a1 = T.s8 - .3 + .08 * i, a0 = a1 - (h.kind === 'boy' ? 2.4 : 1.9), r1 = T.hunting + .12 * i, D = IN / h.s, held = HOLD[h.kind];
    const f = M.perform([
      { do: 'walk', dist: D, until: a1, gait: 'brisk', style: h.kind === 'boy' ? { step: 32 } : undefined },
      { do: 'turn', to: 3 * Q, dur: .6 }, { do: 'wait', until: r1 - .3 }, { do: 'turn', to: h.to > 0 ? 0 : Math.PI, dur: .6 },
      { do: 'walk', dist: 400, gait: 'brisk', style: { step: 44, T: .4 } },
    ], { x: h.from * D, yaw: h.from < 0 ? 0 : Math.PI, t0: a0, seed: 3 + i, arms: held, hands: held && held.map(a => a ? { pose: 'grip' } : null) });
    return { f, a0, off: f.parts[4].t0, carry: CARRY[h.kind] };
  });
  function hunterAt(h, i, tp) {
    const H = perfs[i]; if (tp < H.a0) return null;
    const go = tp >= H.off ? Math.abs(H.f.at(tp).x) * h.s : 0;
    return { H, y: h.y + h.dy * Math.min(1, go / 700) };
  }
  function hunter(x, P, t, h, i) {
    const tp = LP.pose(t), st = hunterAt(h, i, tp); if (!st) return;
    const s = depthScale(h, st.y), coat = { coat2: mix(P.coat2, P.cream, .3), cream: CREAM, green: mix('#4d6b58', P.cream, .2), sleeve: mix(P.sleeve, P.cream, .25) }[h.coat];
    const o = { coat, trouser: CREAM, skin: SK, head: h.head, headColor: h.head === 'cap' ? mix(P.ink, P.coat, .3) : mix(P.amberDark, P.cream, .35) };
    if (h.kind === 'boy') { o.prop = (xx, PJ) => { if (Math.sin(PJ.yaw) > -.3) st.H.carry(xx, PJ, P); }; o.behind = (xx, PJ) => { if (Math.sin(PJ.yaw) <= -.3) st.H.carry(xx, PJ, P); }; }
    else if (st.H.carry) { o.prop = (xx, PJ) => { if (PJ.arms[0].near) st.H.carry(xx, PJ, P); }; o.behind = (xx, PJ) => { if (!PJ.arms[0].near) st.H.carry(xx, PJ, P); }; }
    x.save(); x.translate(h.x, st.y); x.scale(s, s); M.draw(x, P, st.H.f(tp), o); x.restore();
  }
  function hunters(x, P, t) {
    const tp = LP.pose(t);
    HUNTERS.map((h, i) => ({ h, i, st: hunterAt(h, i, tp) })).filter(e => e.st).sort((a, b) => a.st.y - b.st.y).forEach(({ h, i }) => hunter(x, P, t, h, i));
  }
  function lane(x, P, t) {
    x.fillStyle = mix(P.wall, P.ink, .16); x.fillRect(-2600, G, 5200, 900);
    x.strokeStyle = mix(P.wall, P.ink, .24); x.lineWidth = 2;
    for (let yy = G + 40, k = 0; yy < G + 900; yy += 40 + k * 14, k++) { x.beginPath(); x.moveTo(-2600, yy); x.lineTo(2600, yy); x.stroke(); }
    for (const hs of LANE) { x.save(); x.translate(hs.x, G); CITY.house(x, P, hs); x.restore(); }
    for (const [i, hs] of LANE.entries()) if (hs.door != null) { x.save(); x.translate(0, G); CITY.step(x, P, hs.x + hs.w * hs.door); x.restore(); }
    x.fillStyle = mix(P.card, P.wall, .5); x.fillRect(-270, -10, 90, 120); x.fillRect(180, 60, 70, 90);
    hunters(x, P, t);
  }
  function lcam(t) {
    const zFill = FILL_W / PW, zPaste = PORT ? 1.4 : 1.3, zLane = PORT ? .86 : 1;
    const a = easeIO(clamp((t - TD) / (T.in + .15 - TD))), b = easeIO(clamp((t - T.s8) / 1.6));
    const z = zFill * Math.pow(zPaste / zFill, a) * Math.pow(zLane / zPaste, b);
    return { x: POST[0] + lerp(0, PORT ? 20 : 60, b), y: POST[1] + lerp(0, PORT ? -10 : 60, b), z };
  }

  const topK = t => lerp(.86, 1, easeIO(clamp((t - T.s6) / (TD - T.s6))));
  function posterRect(t) {
    if (t < TD) { const w0 = FILL_W * topK(t); return { cx: W / 2, cy: H / 2, w: w0, h: w0 * PH / PW }; }
    const lc = lcam(t), sl = lc.z;
    return { cx: W / 2 + sl * (POST[0] - lc.x), cy: H / 2 + sl * (POST[1] - lc.y), w: PW * sl, h: PH * sl };
  }
  function topShot(x, P, t) {
    const k = topK(t), u = FILL_W / PW * k;
    x.fillStyle = mix(P.wood, P.cream, .1); x.fillRect(0, 0, W, H);
    x.strokeStyle = mix(P.wood, P.ink, .12); x.lineWidth = 3 * u;
    for (let i = -8; i <= 8; i++) { const y = H / 2 + i * 34 * u; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(W * .3, y + 6 * u, W * .6, y - 5 * u, W, y + 3 * u); x.stroke(); }
    const at = (px, py) => [W / 2 + px * u, H / 2 + py * u];
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(...at(-PW / 2 + 6, -PH / 2 + 8), PW * u, PH * u);
    const [cx, cy] = at(PW / 2 + 70, 60);
    for (let i = 4; i >= 0; i--) PR.coin(x, P, 'flat', cx + i * 1.5 * u, cy + i * 2.5 * u, 26 * u, 0);
    const [ix, iy] = at(PW / 2 + 80, -80);
    x.fillStyle = P.ink; x.beginPath(); x.arc(ix, iy, 30 * u, 0, TAU); x.fill();
    x.fillStyle = mix(P.ink, P.sheet, .25); x.beginPath(); x.arc(ix, iy, 17 * u, 0, TAU); x.fill();
    x.strokeStyle = mix(P.ink, P.wood, .4); x.lineWidth = 6 * u; x.lineCap = 'round'; x.beginPath(); x.moveTo(ix, iy); x.lineTo(ix + 110 * u, iy - 70 * u); x.stroke(); x.lineCap = 'butt';
  }
  function poster(ctx, t) {
    const L = LP, r = posterRect(t), tp = L.pose(t), P = L.P;
    const paste = smooth((t - T.simple) / .12);
    const fadeIn = 1;
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      x.save(); x.translate(r.cx, r.cy); x.scale(r.w / PW, r.h / PH);
      PR.poster(x, P, 'paper', { w: PW, h: PH, ink: inkAt(tp), print: smooth((t - T.s6) / .6),
        coin: clamp((tp - T.cash) / .3), reward: clamp((tp - T.reward) / .3), cobra: clamp((tp - T.dead) / .4) });
      x.restore();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy], i) => {
        const k = (t - T.simple - i * .07) / .1; if (k < 0) return;
        const s = r.w / PW, px = r.cx + sx * (r.w / 2 - 14 * s), py = r.cy + sy * (r.h / 2 - 14 * s), pop = lerp(1.7, 1, smooth(k));
        x.save(); x.translate(px, py); x.scale(s * pop, s * pop);
        x.fillStyle = mix(P.ink, P.wood, .3); x.beginPath(); x.arc(0, 0, 7, 0, Math.PI * 2); x.fill();
        x.fillStyle = mix(P.rim, P.cream, .3); x.beginPath(); x.arc(-2.2, -2.2, 2.4, 0, Math.PI * 2); x.fill();
        x.restore();
      });
    }, { alpha: fadeIn, shadowAlpha: lerp(1, .3, paste) * smooth((t - TD + .3) / .4), rimAlpha: .3 });
  }

  function draw(ctx, t) {
    const b = smooth((t - BLEND[0]) / (BLEND[1] - BLEND[0]));
    if (b < 1) {
      LF.background(ctx);
      if (t < T.s6) LF.sheet(ctx, ocam(t), 1, [0, 0], x => office(x, LF.P, t));
      else LF.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => topShot(x, LF.P, t));
      if (t < T_IN) LF.sheet(ctx, fcam(t), 1, [0, 0], x => facade(x, LF.P));
      LF.grade(ctx, t);
    }
    if (b > 0) {
      ctx.save(); ctx.globalAlpha = b; LP.background(ctx); ctx.restore();
      LP.sheet(ctx, lcam(t), 1, [0, 0], x => lane(x, LP.P, t), { alpha: b, shadowAlpha: b });
      if (b >= 1) LP.grade(ctx, t);
    }
    if (t >= T.s6) poster(ctx, t);
  }

  F.scene('seq-02', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { LANE, G, POST, PW, PH, lane, facade, office } });
})();
