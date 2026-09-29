(function () {
  'use strict';
  const F = FILM, PR = F.props, M = F.motion, GOAL = F.goal, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, easeOut, easeIn, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-09'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;
  const S3 = F.getScene('seq-03').api, FL = S3.FL, DESK = S3.DESK;
  const T = {
    reward: 0.901, define: 2.134, exactly: 2.444, rewarding: 3.836,
    s42: C.s('S042').t0, something: 5.317, vague: 5.657, fewer: 6.327, city: 7.287, cityEnd: 7.697,
    s43: C.s('S043').t0, distant: 8.677, fuzzy: 9.497, measure: 10.577, front: 11.427, deskEnd: 12.107,
    s44: C.s('S044').t0, hold: 14.397, in: 15.437, hand: 15.837, handEnd: 16.257,
    s45: C.s('S045').t0, dead: 16.727, cobra: 16.897,
    s46: C.s('S046').t0, neat: 17.66, countable: 17.867, standIn: 18.256, thing: 18.927, wantEnd: 20.147,
  };
  const ramp = (t, a, b) => smooth((t - a) / (b - a));

  const SC = { px: 24, py: -19, arm: 60, drop: 46, cut: [-67, -27, 182, 82.9] };
  const LAND = T.dead - .005, TIP = .2;
  function beamA(t) {
    if (t < LAND) return 0;
    const u = t - LAND; return TIP * (1 - Math.exp(-4.2 * u) * (Math.cos(9 * u) + .47 * Math.sin(9 * u)));
  }
  const panSway = (t, side) => t < LAND ? 0 : side * .16 * Math.exp(-4 * (t - LAND)) * Math.sin(10.5 * (t - LAND));
  function hookAt(t, side) { const a = beamA(t); return [SC.px + side * SC.arm * Math.cos(a) - Math.sin(a) * 1, SC.py + side * SC.arm * Math.sin(a) + Math.cos(a) * 1]; }
  function panAt(t, side) { const h = hookAt(t, side), s = panSway(t, side); return [h[0] - Math.sin(s) * SC.drop, h[1] + Math.cos(s) * SC.drop, s]; }
  const BRASS = mix(P.amberDark, P.wood, .35);
  function scaleBack(x, t) {
    x.fillStyle = BRASS; x.fillRect(20, DESK.top - 90, 8, 76);
    x.save(); x.translate(SC.px, SC.py); x.rotate(beamA(t)); x.fillRect(-64, -3, 128, 6); x.restore();
    for (const side of [-1, 1]) {
      const h = hookAt(t, side), p = panAt(t, side), s = p[2];
      x.save(); x.translate(p[0], p[1]); x.rotate(s);
      x.strokeStyle = BRASS; x.lineWidth = 2; x.beginPath(); const hl = [(h[0] - p[0]) * Math.cos(-s) - (h[1] - p[1]) * Math.sin(-s), (h[0] - p[0]) * Math.sin(-s) + (h[1] - p[1]) * Math.cos(-s)];
      x.moveTo(hl[0], hl[1]); x.lineTo(-18, -2); x.moveTo(hl[0], hl[1]); x.lineTo(18, -2); x.stroke();
      x.fillStyle = BRASS; x.beginPath(); x.ellipse(0, 0, 26, 6, 0, 0, TAU); x.fill();
      x.restore();
    }
    x.fillStyle = mix(BRASS, P.ink, .25); x.fillRect(-4, DESK.top - 18, 56, 6);
  }
  function scaleLip(x, t, side) {
    const p = panAt(t, side);
    x.save(); x.translate(p[0], p[1]); x.rotate(p[2]);
    x.fillStyle = mix(BRASS, P.ink, .12); x.beginPath(); x.ellipse(0, 0, 26, 6, 0, 0, Math.PI); x.ellipse(0, 1.2, 24, 4, 0, Math.PI, 0, true); x.fill();
    x.restore();
  }
  function deskNoScale(x, t, tally) {
    const [cx, cy, cw, ch] = SC.cut;
    x.save(); x.beginPath(); x.rect(-5000, -5000, 10000, 10000); x.rect(cx, cy, cw, ch); x.clip('evenodd');
    S3.desk(x, P, t, { tally });
    x.restore();
  }

  const CARD = { x0: 116, y0: -4, x1: 176, y1: 47 }, LINE = { x0: 121, x1: 171, y: 37 };
  const SET = [0, .62];
  const cardLift = t => 26 * (1 - easeOut(clamp((t - SET[0]) / (SET[1] - SET[0])), 2));
  const WRITE = [T.cobra + .05, T.cobra + .5];
  const ANSWER = 'DEAD COBRA', ANSWER_FONT = '600 8.6px NS';
  const answerW = 54.5;
  const answerX0 = () => (LINE.x0 + LINE.x1) / 2 - answerW / 2;
  const nibX = t => answerX0() + answerW * clamp((t - WRITE[0]) / (WRITE[1] - WRITE[0]));
  function holder(x) {
    x.fillStyle = mix(BRASS, P.ink, .1); x.fillRect(CARD.x0 - 3, CARD.y1 - 1, CARD.x1 - CARD.x0 + 6, 5);
    x.fillStyle = mix(BRASS, P.ink, .3); x.fillRect(CARD.x0 + 4, CARD.y1 + 4, 6, 5); x.fillRect(CARD.x1 - 10, CARD.y1 + 4, 6, 5);
  }
  function card(x, t) {
    x.save(); x.translate(0, -cardLift(t));
    x.fillStyle = mix(P.card, P.cream, .35); x.fillRect(CARD.x0, CARD.y0, CARD.x1 - CARD.x0, CARD.y1 - CARD.y0);
    x.fillStyle = P.ink; x.font = '900 11.5px NSC'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText('PAY FOR:', LINE.x0, CARD.y0 + 17);
    x.fillStyle = mix(P.card, P.ink, .45); x.fillRect(LINE.x0, LINE.y, LINE.x1 - LINE.x0, 1.1);
    x.font = ANSWER_FONT;
    if (t > WRITE[0]) {
      x.save(); x.beginPath(); x.rect(answerX0() - 2, LINE.y - 14, nibX(t) - answerX0() + 2, 18); x.clip();
      x.fillStyle = mix(P.ink, '#1d2a4a', .5); x.textAlign = 'left'; x.fillText(ANSWER, answerX0(), LINE.y - 2.2);
      x.restore();
    }
    x.restore();
    holder(x);
  }
  const HOOK = [CARD.x1 + 12, DESK.top - 12];
  function tagShape(x, P, cx, cy, a, n) {
    x.save(); x.translate(cx, cy); x.rotate(a);
    x.strokeStyle = mix(P.cream, P.ink, .35); x.lineWidth = .8; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 5); x.stroke();
    x.fillStyle = P.amber; x.beginPath(); x.moveTo(-5, 5); x.lineTo(5, 5); x.lineTo(11, 9); x.lineTo(11, 20); x.lineTo(-11, 20); x.lineTo(-11, 9); x.closePath(); x.fill();
    x.fillStyle = mix(P.amber, P.ink, .4); x.beginPath(); x.arc(0, 7.6, 1.1, 0, TAU); x.fill();
    x.fillStyle = P.ink; x.font = '900 8.4px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(`No. ${n}`, 0, 14.6);
    x.restore();
  }
  function tagsOnHook(x, t, gone) {
    x.strokeStyle = mix(BRASS, P.ink, .2); x.lineWidth = 1.6; x.beginPath(); x.moveTo(HOOK[0], HOOK[1] - 2.5); x.lineTo(HOOK[0], HOOK[1] + 1); x.lineTo(HOOK[0] - 2, HOOK[1] + 1); x.stroke();
    for (const n of [3, 2, 1]) { if (n === 1 && gone) continue; tagShape(x, P, HOOK[0], HOOK[1], .04 * (n - 2) + .015 * Math.sin(t * 1.3 + n), n); }
  }

  const SUIT = '#d9ceb4', SKIN_O = '#e0bf9c', HAIR = '#2e2622', LOOK_O = { coat: SUIT, trouser: mix(SUIT, P.ink, .12), skin: SKIN_O, head: 'bare', hair: HAIR, moustache: HAIR, shoe: mix(P.wood, P.ink, .5), shadow: 0 };
  const OX = 212, OY = DESK.top + 100, OS = 2.5, YAW = Math.PI;
  const toS = ([X, Y]) => [-(X - OX) / OS, (Y - OY) / OS], toW = ([x, y]) => [OX - x * OS, OY + y * OS];
  const PEN = mix(P.ink, P.wood, .4), PEN_AT = [181, 45], PEN_END = [202, 42];
  const REST = [186, 45], POISE = [(LINE.x0 + LINE.x1) / 2 - 54.5 / 2 + .5, LINE.y - 4.2];
  const REL = { pose: 'relaxed', k: .45 }, PINCH = { pose: 'pinch', k: 1 }, OPEN = { pose: 'open', k: .75 }, WRITE_H = k => ({ pose: 'write', pen: PEN, k }), RESTH = { pose: 'rest', k: .6 };
  const K = (b, o) => ({ ...b, ...o });
  const UPPER = 16, FORE = 15;
  function reachNat(p, i, to) {
    const sh = M.joints(p).sh, dx = to[0] - sh[0], dy = to[1] - sh[1], L = Math.min(Math.hypot(dx, dy) || 1e-6, UPPER + FORE - .01);
    const base = Math.atan2(dy, dx), A = Math.acos(clamp((UPPER * UPPER + L * L - FORE * FORE) / (2 * UPPER * L), -1, 1));
    const arm = b => {
      const el = [sh[0] + Math.cos(b) * UPPER, sh[1] + Math.sin(b) * UPPER], wa = Math.atan2(to[1] - el[1], to[0] - el[0]), wr = [el[0] + Math.cos(wa) * FORE, el[1] + Math.sin(wa) * FORE];
      const u = Math.atan2(el[0] - sh[0], el[1] - sh[1]), f = Math.atan2(wr[0] - el[0], wr[1] - el[1]);
      return { u, f, flex: ((f - u) % TAU + TAU * 1.5) % TAU - Math.PI };
    };
    const c1 = arm(base - A), c2 = arm(base + A), c = c1.flex >= 0 ? (c2.flex >= 0 && c2.flex < c1.flex ? c2 : c1) : c2;
    p.arms = p.arms.map((a, j) => j === i ? [c.u, c.f] : a);
    return p;
  }
  function toolNat(p, i, tip, hand) {
    const tl = F.hands.TIP[hand.pose] || [0, 0]; let wr = [tip[0] + 8, tip[1] - 4];
    for (let it = 0; it < 14; it++) { reachNat(p, i, wr); const r = -p.arms[i][1] + F.hands.bend(hand), c = Math.cos(r), sn = Math.sin(r); wr = [tip[0] - (tl[0] * c - tl[1] * sn), tip[1] - (tl[0] * sn + tl[1] * c)]; }
    reachNat(p, i, wr); p.hands = (p.hands || [null, null]).map((h, j) => j === i ? hand : h);
    return p;
  }
  const withArm = (p, i, W, hand) => { const q = K(p, { arms: p.arms.slice(), hands: (p.hands || [REL, REL]).slice() }); reachNat(q, i, toS(W)); if (hand) q.hands[i] = hand; return q; };
  const withPen = (p, nib, k) => { const q = K(p, { arms: p.arms.slice(), hands: (p.hands || [REL, REL]).slice() }); toolNat(q, 0, toS(nib), WRITE_H(k)); return q; };
  const wristFor = (p, nib) => toW(M.joints(withPen(p, nib, .45)).arms[0].wr);
  const lerpW = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const cityHand = t => { const g = goalAt(t); return [g.at[0] + 30 * g.s, g.at[1] + g.bob + 3]; };
  const PEN_REST = [168, 50];
  const bump = (t, c) => Math.exp(-Math.pow((t - c) / .12, 2));
  const hover = t => [POISE[0] + 1.2 * Math.sin(1.7 * t), POISE[1] - 4.5 * (bump(t, T.exactly + .1) + bump(t, T.rewarding - .5)) - 1.2 * Math.sin(2.3 * t) * .5];
  const WRITE_Y = LINE.y - 2.4, writeNib = t => [nibX(t), WRITE_Y + .5 * Math.sin((t - WRITE[0]) * 28) * (t < WRITE[1] ? 1 : 0)];
  const TAG_AT = [HOOK[0] + 1, HOOK[1] + 6];
  const TIE_AT = t => tailTie(t);
  const TIE = [WRITE[1] + .28, T.countable + .1, T.countable + .5, T.countable + .7];
  const PLAN = [
    [0, SET[1], 'wrist', t => [CARD.x1 + 1.5, CARD.y0 + 22 - cardLift(t)], null, PINCH],
    [SET[1], 1.05, 'wrist', () => [CARD.x1 + 1.5, CARD.y0 + 22], REST, REL],
    [1.05, 1.38, 'wrist', REST, { nib: PEN_AT }, REL],
    [1.38, T.define, 'nib', PEN_AT, POISE, 'pen'],
    [T.define, T.vague + .15, 'nib', hover, null, 'pen'],
    [T.vague + .15, T.vague + .6, 'nib', () => hover(T.vague + .15), PEN_REST, 'pen'],
    [T.vague + .6, T.deskEnd + .4, 'nib', PEN_REST, null, 'pen'],
    [T.deskEnd + .4, T.deskEnd + .95, 'nib', PEN_REST, POISE, 'pen'],
    [T.deskEnd + .95, WRITE[0], 'nib', hover, null, 'pen'],
    [WRITE[0], WRITE[1], 'nib', writeNib, null, 'write'],
    [WRITE[1], TIE[0], 'nib', () => writeNib(WRITE[1]), PEN_AT, 'pen'],
    [TIE[0], TIE[1], 'wrist', { nib: PEN_AT }, TAG_AT, PINCH],
    [TIE[1], TIE[2], 'wrist', TAG_AT, TIE_AT, PINCH],
    [TIE[2], TIE[3], 'wrist', t => { const a = TAU * (t - TIE[2]) / (TIE[3] - TIE[2]), q = TIE_AT(t); return [q[0] + 2.2 * Math.sin(a), q[1] - 2.2 * (1 - Math.cos(a))]; }, null, PINCH],
    [TIE[3], TIE[3] + .5, 'wrist', TIE_AT, REST, REL],
    [TIE[3] + .5, 99, 'wrist', REST, null, REL],
  ];
  const LEAN = [[0, .22], [SET[1], .16], [1.05, .03], [1.42, .02], [1.8, .2], [T.define, .3], [T.something, .3], [T.vague + .2, .12], [T.cityEnd - .4, .14], [T.cityEnd + .15, .24], [T.s43 + .2, .42], [T.distant + .3, .3], [T.distant + 1.0, .1],
    [T.deskEnd + .4, .16], [T.deskEnd + .95, .3], [WRITE[0] - .1, .3], [WRITE[0] + .1, .34], [WRITE[1], .26], [TIE[0] - .1, .04], [TIE[0] + .05, .06], [TIE[1], .2], [TIE[2], .5], [TIE[3], .5], [TIE[3] + .5, .14]];
  const HEAD = [[0, .1], [SET[1], .2], [1.4, .28], [T.something, .25], [T.vague + .2, -.4], [T.cityEnd, -.3], [T.s43 + .2, .05], [T.distant + .15, -.3], [T.fuzzy, -.42], [T.measure - .2, -.2], [T.measure + .2, .32], [T.deskEnd, .3],
    [T.s44 + .8, .3], [T.hold, .38], [T.in, .2], [T.dead - .3, -.1], [T.dead, .12], [WRITE[0], .35], [WRITE[1], .32], [TIE[2], .4], [TIE[3] + .5, .3]];
  const HYAW = [[0, YAW], [T.fuzzy - .3, YAW], [T.fuzzy + .3, YAW - .85], [T.measure - .3, YAW - .85], [T.measure + .1, YAW]];
  const oIdle = M.idle({ seed: 61, base: K(M.stand(0), { yaw: YAW }) });
  function nearPoint(v, t, p) { const q = typeof v === 'function' ? v(t) : v; return q && q.nib ? wristFor(p, q.nib) : q; }
  function officialPose(tp) {
    const p = { ...oIdle(tp) };
    p.lean = (p.lean || 0) + F.keyed(tp, LEAN); p.head = F.keyed(tp, HEAD); p.headYaw = F.keyed(tp, HYAW);
    p.arms = p.arms.slice(); p.hands = [REL, RESTH];
    const up = ramp(tp, T.cityEnd - .45, T.cityEnd + .1) * (1 - ramp(tp, T.distant + .25, T.distant + .95));
    const shW = toW(M.joints(p).sh), REST_FAR = [shW[0] - 14, 47];
    const ch = cityHand(Math.min(tp, T.distant + .1)), farTo = up > 0 ? [lerp(REST_FAR[0], ch[0], 1 - (1 - up) * (1 - up)), lerp(REST_FAR[1], ch[1], up * up)] : REST_FAR;
    reachNat(p, 1, toS(farTo)); p.hands[1] = up > .5 ? OPEN : RESTH;
    const s = PLAN.find(s => tp >= s[0] && tp < s[1]) || PLAN.at(-1), [t0, t1, kind, from, to, hand] = s, u = easeIO(clamp((tp - t0) / (t1 - t0)));
    if (kind === 'nib') {
      const a = nearPoint(from, tp, p), b = to ? nearPoint(to, tp, p) : a, nib = lerpW(a, b, to ? u : 0);
      return withPen(p, nib, hand === 'write' ? .45 + .08 * Math.sin(tp * 30) : .45);
    }
    const a = nearPoint(from, tp, p), b = to ? nearPoint(to, tp, p) : a;
    reachNat(p, 0, toS(to ? lerpW(a, b, u) : a)); p.hands[0] = hand;
    return p;
  }
  const penInHand = tp => { const s = PLAN.find(s => tp >= s[0] && tp < s[1]); return !!s && (s[2] === 'nib'); };
  const tagInHand = tp => tp >= TIE[1] && tp < TIE[3];
  function official(x, tp, part) {
    x.save(); x.translate(OX, OY); x.scale(OS, OS);
    const PJ = M.draw(x, P, officialPose(tp), { ...LOOK_O, part });
    x.restore();
    return PJ;
  }
  function penOnLedger(x, tp) {
    if (penInHand(tp)) return;
    x.strokeStyle = PEN; x.lineWidth = 1.7; x.lineCap = 'round'; x.beginPath(); x.moveTo(PEN_AT[0], PEN_AT[1]); x.lineTo(PEN_END[0], PEN_END[1]); x.stroke(); x.lineCap = 'butt';
  }
  function tagInFingers(x, tp) {
    if (!tagInHand(tp)) return;
    const J = M.joints(officialPose(tp)), wr = toW(J.arms[0].wr), sw = .12 * Math.sin((tp - TIE[1]) * 9) * Math.exp(-(tp - TIE[1]) * 3);
    tagShape(x, P, wr[0] - 4, wr[1] + 3, sw, 1);
  }

  const CLOTH = mix('#4a5a78', P.cream, .22), CLOTH_D = mix(CLOTH, P.ink, .3), CLOTH_L = mix(CLOTH, P.cream, .3);
  const BH0 = 27, BSC = 1.2, BH = BH0 * BSC;
  function bundleShape(x, sq = 0, fall = 0) {
    const h = BH0 * (1 - .22 * sq) * (1 - fall), wd = 17 * (1 + .12 * sq), top = BH0 * (1 - .22 * sq) - h;
    if (h < 1) return;
    x.save(); x.scale(BSC, BSC); x.translate(0, top);
    x.fillStyle = CLOTH; x.beginPath(); x.moveTo(-3, 1); x.bezierCurveTo(-wd, 5, -wd - 1, h, 0, h); x.bezierCurveTo(wd + 1, h, wd, 5, 3, 1); x.closePath(); x.fill();
    x.fillStyle = CLOTH_D; x.beginPath(); x.moveTo(3, 1); x.bezierCurveTo(wd, 5, wd + 1, h, 0, h); x.bezierCurveTo(8, h - 2, 9, 9, 3, 1); x.fill();
    x.strokeStyle = CLOTH_L; x.lineWidth = .9; x.beginPath(); x.moveTo(-1.5, 3); x.quadraticCurveTo(-7, h * .45, -5, h - 5); x.stroke();
    const e = 1 - fall;
    x.fillStyle = CLOTH; x.beginPath(); x.moveTo(-1, 0); x.lineTo(-7 - 6 * fall, -6 * e); x.lineTo(-3, -2.5 * e); x.lineTo(0, -8 * e); x.lineTo(3, -2.5 * e); x.lineTo(7 + 6 * fall, -5 * e); x.lineTo(1, 0); x.closePath(); x.fill();
    if (fall < .5) { x.fillStyle = CLOTH_D; x.beginPath(); x.arc(0, .5, 2.6 * (1 - fall * 2), 0, TAU); x.fill(); }
    x.restore();
  }
  function clothOpen(x, px, py, v) {
    if (v <= 0) return;
    const d = 11 * v, w = lerp(16, 27, v);
    x.fillStyle = CLOTH;
    x.beginPath(); x.moveTo(px - w, py - 1.5); x.quadraticCurveTo(px - w - 4, py + 1, px - w - 5, py + 2 + d); x.lineTo(px - w + 4, py + 3 + d * .6);
    x.quadraticCurveTo(px - 6, py + 2.5 + d * .3, px + 1, py + 3 + d * .9); x.quadraticCurveTo(px + 8, py + 2.5 + d * .3, px + w - 4, py + 3 + d * .6);
    x.lineTo(px + w + 5, py + 2 + d); x.quadraticCurveTo(px + w + 4, py + 1, px + w, py - 1.5); x.closePath(); x.fill();
    x.fillStyle = CLOTH_D; x.beginPath(); x.moveTo(px - 4, py + 2.5); x.quadraticCurveTo(px + 1, py + 3 + d * .9, px + 6, py + 2.5); x.closePath(); x.fill();
  }
  const OPEN_T = [T.cobra - .02, T.cobra + .3];
  function cobraPts(t) {
    const [px, py] = panAt(t, 1);
    return F.rope.smooth([[px - 29, py + 13], [px - 27.5, py + 5], [px - 22, py - 1], [px - 12, py - 3.5], [px - 2, py - 1.5], [px + 8, py - 4.5], [px + 17, py - 2.5],
      [px + 24, py + 1], [px + 28, Math.min(py + 8, DESK.top - 18)], [px + 31, DESK.top - 15], [px + 38, DESK.top - 14.5]], 40);
  }
  function tailTie(t) { const q = cobraPts(Math.max(t, LAND + .6)); return q[Math.round(q.length * .9)]; }
  function onPan(x, t) {
    if (t < LAND) return;
    const [px, py] = panAt(t, 1), sq = smooth((t - LAND) / .07) * (1 - .5 * smooth((t - LAND - .07) / .15)), u = clamp((t - OPEN_T[0]) / (OPEN_T[1] - OPEN_T[0]));
    const v = smooth((u - .25) / .75);
    clothOpen(x, px, py, v);
    if (u > .2) PR.cobraBody(x, P, cobraPts(t), { w: 6.2, belly: 1, eye: 0 });
    x.save(); x.translate(px, py - 1 - BH * (1 - .22 * sq)); bundleShape(x, sq, easeIn(u, 2)); x.restore();
  }
  function tagOnTail(x, t) {
    if (t < TIE[3]) return;
    const q = tailTie(t), sw = .1 * Math.sin((t - TIE[3]) * 8) * Math.exp(-(t - TIE[3]) * 2.5);
    tagShape(x, P, q[0], q[1] + 1, sw, 1);
  }

  const QS = 2.45, HX = 30, HY = FL + 6, H0 = (-372 - HX) / QS;
  const LOOK_H = { coat: mix('#4d6b58', P.cream, .2), trouser: mix(P.cream, P.sheet, .25), skin: mix(P.skin, P.wood, .45), head: 'turban', headColor: mix(P.amberDark, P.cream, .4) };
  const GRIP = { pose: 'grip' }, OPEN_H = { pose: 'open', k: .7 };
  const reachS = (b, i, pt, hand) => { const p = K(b, { arms: b.arms.slice(), hands: (b.hands || [REL, REL]).slice() }); reachNat(p, i, pt); if (hand) p.hands[i] = hand; return p; };
  const both = (b, pF, pN, hand, o = {}) => reachS(reachS(K(b, o), 0, pF, hand), 1, pN, hand);
  const hGait = M.gait({ from: H0, to: 0, t0: T.s44 + .08, until: T.in - .06, gait: 'walk', style: { step: 30 }, hands: [GRIP, null] });
  const SHOULDER_GRIP = p => [p.hip[0] - 4.5 + 20 * Math.sin(p.lean || 0), p.hip[1] - 28];
  const hWalkIn = tp => { const p = hGait(tp); reachNat(p, 0, SHOULDER_GRIP(p)); p.hands = [GRIP, p.hands[1]]; return p; };
  const HB = hWalkIn(T.in - .06);
  const HT = { lift: [T.in - .04, T.in + .4], up: T.in + .6, down: T.dead - .42, rel: T.dead - .12, after: T.dead + .12, rest: T.dead + .6 };
  const hKeys = M.keys([
    [HT.lift[0], HB],
    [HT.lift[1], both(HB, [12, -61], [14, -57], GRIP, { head: .12 })],
    [HT.up, both(HB, [13, -67], [15, -63], GRIP, { head: -.3 })],
    [HT.down, both(K(HB, { hip: [2.5, M.HIP + 8], lean: .38 }), [17, -31], [18, -28], GRIP, { head: .05 })],
    [HT.rel, both(K(HB, { lean: -.16 }), [15, -99], [17, -97], GRIP, { head: -.45 })],
    [HT.after, both(K(HB, { lean: -.1 }), [14, -98], [16, -96], OPEN_H, { head: -.4 })],
    [HT.rest, K(HB, { head: -.25, arms: [[.08, .2], [.1, .24]], hands: [REL, REL] })],
  ], { lag: { arms: .03, head: .04 } });
  const hTurn = M.turn({ x: 0, t0: HT.rest + .12, from: 0, to: Math.PI, dur: 1.05 });
  const hOut = M.gait({ from: 0, to: 120, t0: hTurn.end, until: DUR - .25, gait: 'walk', style: { step: 30 }, yaw: Math.PI });
  function hunterPose(tp) {
    if (tp < HT.lift[0]) return hWalkIn(tp);
    if (tp < HT.lift[1]) {
      const p = hKeys(tp), k = smooth((tp - HT.lift[0]) / (HT.lift[1] - HT.lift[0]));
      const a0 = SHOULDER_GRIP(HB), n0 = M.joints(HB).arms[1].wr, s = Math.sin(Math.PI * k);
      reachNat(p, 0, [lerp(a0[0], 12, k) + 7 * s, lerp(a0[1], -61, k) + 2 * s]); reachNat(p, 1, [lerp(n0[0], 14, k) + 3 * s, lerp(n0[1], -57, k)]);
      p.hands = [GRIP, k > .5 ? GRIP : REL]; return p;
    }
    if (tp < HT.rest + .12) return hKeys(tp);
    if (tp < hTurn.end) return hTurn(tp);
    return hOut(tp);
  }
  const handsW = tp => M.joints(hunterPose(tp)).arms.map(a => [HX + a.wr[0] * QS, HY + a.wr[1] * QS]);
  const fistW = tp => { const a = M.joints(hunterPose(tp)).arms[0]; return [HX + (a.wr[0] + 4.5 * Math.sin(a.fore)) * QS, HY + (a.wr[1] + 4.5 * Math.cos(a.fore)) * QS]; };
  const heldKnot = tp => { const h = handsW(tp); return [(h[0][0] + h[1][0]) / 2 + 1, (h[0][1] + h[1][1]) / 2 - 14]; };
  const LAND_KNOT = () => { const [px, py] = panAt(LAND, 1); return [px, py - 1 - BH]; };
  function bundleState(tp) {
    if (tp < HT.lift[0]) {
      const f = fistW(tp), f1 = fistW(tp + .04), f0 = fistW(tp - .04), vx = (f1[0] - f0[0]) / .08;
      return { at: f, a: 1.15 + clamp(vx / 1400, -.12, .12), where: 'behind' };
    }
    if (tp < HT.rel) {
      const k = smooth((tp - HT.lift[0]) / (HT.lift[1] - HT.lift[0])), a = lerpW(fistW(tp), heldKnot(tp), k);
      return { at: a, a: lerp(1.15, 0, k) - .3 * Math.sin(Math.PI * k), where: k < .55 ? 'behind' : 'prop' };
    }
    if (tp < LAND) {
      const u = (tp - HT.rel) / (LAND - HT.rel), r = heldKnot(HT.rel), l = LAND_KNOT();
      return { at: [lerp(r[0], l[0], u), lerp(r[1], l[1], u) - 22 * 4 * u * (1 - u)], a: .5 * u, where: 'air' };
    }
    return { where: 'pan' };
  }
  const inWorld = (xx, fn) => { xx.save(); xx.scale(1 / QS, 1 / QS); xx.translate(-HX, -HY); fn(); xx.restore(); };
  const drawBundle = (x, b) => { x.save(); x.translate(b.at[0], b.at[1]); x.rotate(b.a); bundleShape(x); x.restore(); };
  function hunter(x, tp) {
    if (tp < T.s44) return;
    const b = bundleState(tp), o = { ...LOOK_H };
    if (b.where === 'behind') o.behind = xx => inWorld(xx, () => drawBundle(xx, b));
    if (b.where === 'prop') o.prop = xx => inWorld(xx, () => drawBundle(xx, b));
    x.save(); x.translate(HX, HY); x.scale(QS, QS); M.draw(x, P, hunterPose(tp), o); x.restore();
    if (b.where === 'air') drawBundle(x, b);
  }

  const WIN = { x: 240, y: -250, w: 200, h: 150 }, BARS = mix(P.wood, P.ink, .1);
  const G0 = [120, -58], GH = [82, -8], FAR = [338, -118], VIA = [210, -178];
  const FORM = [T.something + .05, T.cityEnd - .1], DRAW_DOWN = [T.cityEnd + .15, T.s43 + .2], AWAY = [T.distant, T.fuzzy + .75];
  const THROUGH = [AWAY[1] - .35, AWAY[1] + .05];
  function goalAt(t) {
    const bob = Math.sin(TAU * .8 * t) * 1.6;
    if (t < DRAW_DOWN[0]) return { at: G0, s: .9, blur: 0, alpha: 1, k: clamp((t - FORM[0]) / (FORM[1] - FORM[0])), bob };
    if (t < AWAY[0]) { const u = easeIO(clamp((t - DRAW_DOWN[0]) / (DRAW_DOWN[1] - DRAW_DOWN[0]))); return { at: [lerp(G0[0], GH[0], u), lerp(G0[1], GH[1], u)], s: .9, blur: 0, alpha: 1, k: 1, bob: bob * (1 + 1.5 * u) }; }
    const u = easeIO(clamp((t - AWAY[0]) / (AWAY[1] - AWAY[0]))), a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
    return { at: [a * GH[0] + b * VIA[0] + c * FAR[0], a * GH[1] + b * VIA[1] + c * FAR[1]], s: lerp(.9, .52, u), blur: 1.4 * ramp(t, T.fuzzy - .1, T.fuzzy + .7), alpha: lerp(1, .95, u), k: 1, bob: bob * (1 - u) };
  }
  function goal(x, t, where) {
    if (t < FORM[0]) return;
    const g = goalAt(t), th = clamp((t - THROUGH[0]) / (THROUGH[1] - THROUGH[0])), a = where === 'window' ? th : 1 - th;
    if (a <= 0) return;
    if (where === 'window') {
      x.save(); x.beginPath(); x.rect(WIN.x, WIN.y, WIN.w, WIN.h); x.clip();
      const hz = x.createLinearGradient(0, WIN.y + 40, 0, WIN.y + WIN.h); hz.addColorStop(0, 'rgba(150,135,112,0)'); hz.addColorStop(1, `rgba(150,135,112,${.38 * a})`);
      x.fillStyle = hz; x.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
    }
    GOAL.city(x, P, { x: g.at[0], y: g.at[1] + g.bob, s: g.s, k: g.k, blur: g.blur, alpha: g.alpha * a });
    if (where === 'window') { x.fillStyle = BARS; for (let k = 0; k < 5; k++) x.fillRect(248 + k * 44, -250, 8, 150); x.restore(); }
  }

  const V = PORT ? {
    A0: [180, -52, 3.5], A1: [186, -58, 3.6], A: [178, -85, 2.5], B: [60, 60, 2.45], C: [95, 35, 3.0],
  } : {
    A0: [170, -44, 3.2], A1: [178, -50, 3.3], A: [250, -90, 2.8], B: [110, 90, 2.35], C: [120, 30, 3.3],
  };
  const KEYS = [
    [0, V.A0], [T.s43 + 1.2, V.A1], [T.s44, [V.A1[0] + 2, V.A1[1], V.A1[2] * 1.005]], [T.s44 + 1.45, V.B], [T.in - .25, [V.B[0] - 4, V.B[1] - 4, V.B[2] * 1.02]],
    [T.dead - .3, V.C], [T.standIn + .12, [V.C[0] + 2, V.C[1], V.C[2] * 1.01]], [T.thing + 1.25, V.A], [DUR, [V.A[0] + 1, V.A[1], V.A[2] * 1.005]],
  ];
  function cam(t) {
    const xy = F.keyed(t, KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, KEYS.map(([k, v]) => [k, v[2]]), true);
    return { x: xy[0], y: xy[1], z };
  }

  const TALLY_T = T.cobra + .05;
  function office(x, t) {
    const tp = M.pose(t);
    S3.room(x, P, t);
    goal(x, t, 'window');
    official(x, tp, 'far'); official(x, tp, 'body');
    deskNoScale(x, t, clamp((t - TALLY_T) / .25));
    penOnLedger(x, tp);
    scaleBack(x, t); onPan(x, t); scaleLip(x, t, -1); scaleLip(x, t, 1);
    const behind = tp >= TIE[1] && tp < TIE[3] + .6 && toW(M.joints(officialPose(tp)).arms[0].wr)[0] < CARD.x1 + 3;
    if (behind) { official(x, tp, 'near'); tagInFingers(x, tp); }
    card(x, t); tagsOnHook(x, t, tp >= TIE[1]);
    if (!behind) { official(x, tp, 'near'); tagInFingers(x, tp); }
    tagOnTail(x, t);
    S3.heap(x, P, t);
    hunter(x, tp);
  }
  function draw(ctx, t) {
    const c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => office(x, t));
    L.sheet(ctx, c, 1.12, [0, 0], x => S3.punkah(x, P, t), { shadowAlpha: .6 });
    if (t >= FORM[0] && t < THROUGH[1]) L.sheet(ctx, c, 1, [0, 0], x => goal(x, t, 'room'), { shadow: false, rim: false, fibre: 0 });
    L.grade(ctx, t);
  }

  F.scene('seq-09', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { cam, office, goalAt, beamA, panAt, tailTie, CARD, WIN, DUR, poses: { official: officialPose, hunter: hunterPose } } });
})();
