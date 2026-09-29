(function () {
  'use strict';
  const F = FILM, PR = F.props, CITY = F.city, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash } = F, tone = CITY.mix;
  const C = F.cues('seq-01'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P;

  const T = {
    snakes: 1.373, venom: 2.16, ones: 2.755,
    s3: C.s('S003').t0, streets: 4.593, gardens: 6.043, constant: 7.705, danger: 8.269,
  };
  T.trackEnd = DUR - .47;

  const G = 340, SK = tone(P.skin, P.wood, .45);
  const HOUSES = [
    { x: -1300, w: 560, h: 520, roof: 'flat', door: .3, balcony: .72, tone: .4, seed: 1 },
    { x: -740, w: 470, h: 600, roof: 'dome', door: .5, tone: .15, seed: 2, domeR: 110 },
    { x: -270, w: 560, h: 480, roof: 'flat', door: .58, balcony: .22, tone: .5, seed: 3 },
    { x: 290, w: 520, h: 560, roof: 'flat', door: .42, tone: .25, seed: 4 },
    { x: 810, w: 700, h: 520, roof: 'flat', tone: .35, seed: 5, balcony: .82, arch: { at: 340, w: 230, h: 310 } },
    { x: 1510, w: 610, h: 600, roof: 'dome', door: .58, tone: .1, seed: 6, domeR: 120, domeAt: .4 },
    { x: 2120, w: 600, h: 500, roof: 'flat', balcony: .5, door: .2, tone: .45, seed: 7 },
    { x: 2720, w: 560, h: 560, roof: 'flat', door: .6, tone: .3, seed: 8 },
  ];
  const doorX = i => HOUSES[i].x + HOUSES[i].w * HOUSES[i].door;
  const ARCH = HOUSES[4].x + HOUSES[4].arch.at, FAMILY = doorX(5);

  const Z = PORT ? 1.08 : 1;
  function camera(t) {
    const down = easeIO(clamp(t / 2.2));
    const track = smooth(clamp((t - 3.7) / (T.trackEnd - 3.7)));
    const push = smooth(clamp((t - 7.2) / (T.trackEnd - 7.2)));
    return { x: lerp(0, 1960, track) + (PORT ? 120 : 0) * (1 - track), y: lerp(PORT ? -400 : -520, PORT ? 30 : 10, down) + 110 * push, z: Z * lerp(.93, 1, down) * lerp(1, PORT ? 1.2 : 1.3, push) };
  }
  const R = [0, 0];

  const TOP = i => G - HOUSES[i].h - 38;
  const WIN = (i, lx, j) => { const hs = HOUSES[i]; return [hs.x + lx, G - hs.h + 70 + j * 150 + 62, 34, 62]; };
  const SNAKES = [
    { kind: 'edge', head: [300, TOP(2)], dir: -1, v: 110, t0: 1.37, len: 220, w: 13, edge: 290 },
    { kind: 'step', head: [doorX(2) - 50, G - 6], dir: -1, v: 110, t0: 1.55, len: 230, w: 15, edge: doorX(2) - 68 },
    { kind: 'window', win: WIN(3, 325, 1), dir: 1, v: 80, t0: 1.62, len: 200, w: 13 },
    { kind: 'edge', head: [-730, TOP(0)], dir: -1, v: 100, t0: 1.45, len: 200, w: 12.5, edge: -740 },
    { kind: 'edge', head: [800, TOP(4)], dir: 1, v: 95, t0: 1.72, len: 200, w: 12.5, edge: 810 },
    { kind: 'window', win: WIN(2, 504, 1), dir: 1, v: 75, t0: 1.9, len: 190, w: 12.5 },
    { kind: 'window', win: WIN(1, 411, 1), dir: -1, v: 78, t0: 2.15, len: 190, w: 12.5 },
    { kind: 'step', head: [doorX(3) + 50, G - 6], dir: 1, v: 100, t0: 2.3, len: 220, w: 14, edge: doorX(3) + 68 },
    { kind: 'edge', head: [1520, TOP(4)], dir: -1, v: 90, t0: 4.3, len: 200, w: 12.5, edge: 1510 },
    { kind: 'edge', head: [2110, TOP(6)], dir: 1, v: 90, t0: 5.2, len: 200, w: 12.5, edge: 2120 },
    { kind: 'lane', head: [607, G + 72], dir: -1, v: 170, t0: 3.95, len: 290, w: 19 },
    { kind: 'lane', head: [2000, G + 62], dir: -1, v: 150, t0: 7.3, len: 310, w: 19 },
  ];
  function snake(x, s, t) {
    const tp = L.pose(t); if (tp < s.t0) return;
    const tau = tp - s.t0, d = s.kind === 'window' ? s.v * (tau < .5 ? tau * tau : tau - .25) : s.v * tau, flick = (tau * 1.3) % 1, tongue = flick < .35 ? flick / .35 : 0;
    x.save();
    if (s.kind === 'window') {
      const [cx, bot, ww, wh] = s.win;
      x.beginPath(); x.rect(-5000, -5000, 1e4, 1e4); CITY.archPath(x, cx, bot, ww, wh); x.clip('evenodd');
      const along = PR.downAndAlong([cx, bot - wh * .5], G - 6, s.dir), path = sp => along(Math.max(sp, -wh * .3));
      PR.cobraBody(x, P, PR.slitherAlong(path, d, s.len, { amp: s.len * .05 }), { w: s.w, belly: s.dir, tongue });
    } else {
      if (s.kind === 'edge' || s.kind === 'step') { x.beginPath(); if (s.dir > 0) x.rect(s.edge, -5000, 1e5, 1e4); else x.rect(s.edge - 1e5, -5000, 1e5, 1e4); x.clip(); }
      const hx = s.head[0] + s.dir * d, pts = PR.slitherPath([hx, s.head[1]], s.len, { dir: s.dir, amp: s.len * .06, k: F.TAU / (s.len * .6) });
      PR.cobraBody(x, P, pts, { w: s.w, belly: s.dir, tongue });
    }
    x.restore();
  }

  const M = F.motion;
  const tremble = (t, id, a = 1.4) => { const k = Math.floor(t * 15 + 1e-6); return [(hash(k, id, 1) - .5) * a, (hash(k, id, 2) - .5) * a * .5]; };
  const SARI = tone('#3f4f7a', P.sheet2, .15), CREAM = tone(P.cream, P.sheet, .25), OCHRE = tone(P.amberDark, P.wood, .6);
  const WS = 2.3, W0 = 200, WSTOP = 505, STOP = T.streets - .05;
  const wWalk = M.gait({ from: 0, to: (WSTOP - W0) / WS, t0: 1.0, until: STOP, gait: 'walk', hands: [null, { pose: 'grip' }] });
  const wEnd = wWalk(STOP), wFx = wEnd.feet.map(f => f.at[0]);
  const wShock = M.keys([
    [STOP, { ...wEnd, feet: [M.foot(wFx[0]), M.foot(wFx[1])] }],
    [STOP + .16, { ...wEnd, hip: [wEnd.hip[0] - 3.5, wEnd.hip[1] - .6], lean: -.06, head: -.14, feet: [M.foot(wFx[0] - 4.5, .1, 2.2), M.foot(wFx[1])], arms: [[.05, 1.6], wEnd.arms[1]] }],
    [STOP + .32, { ...wEnd, hip: [wEnd.hip[0] - 7, wEnd.hip[1] + .2], lean: -.1, head: -.06, feet: [M.foot(wFx[0] - 9), M.foot(wFx[1])], arms: [[.25, 2.9], wEnd.arms[1]], hands: [{ pose: 'open', k: .15 }, wEnd.hands[1]] }],
  ]);
  const wStill = M.idle({ seed: 11, base: wShock(STOP + .32), t0: STOP + .32 });
  const womanPose = tp => tp < STOP ? wWalk(tp) : tp < STOP + .32 ? wShock(tp) : wStill(tp);
  const CS = 1.45, C0 = W0 - 60;
  const cWalk = M.gait({ from: 0, to: (WSTOP - W0) / CS, t0: 1.0, until: STOP, gait: 'walk', style: { step: 24, bob: 1.4 }, hands: [{ pose: 'grip' }, null] });
  const cStill = M.idle({ seed: 12, base: cWalk(STOP), t0: STOP });
  function woman(x, t) {
    const tp = L.pose(t), shock = smooth((tp - STOP) / .22), [jx, jy] = tremble(tp, 11, 1.6 * shock);
    const p = { ...womanPose(tp) }, pl = womanPose(tp - 1 / M.RATE), POTC = [p.hip[0] + 9, pl.hip[1] + 5];
    M.reach(p, 1, [POTC[0] + 2, POTC[1] - 10]);
    const wx = W0 + p.hip[0] * WS;
    const c = { ...(tp < STOP ? cWalk(tp) : cStill(tp)) }, [cx, cy] = tremble(tp, 12, 1.4 * shock);
    const sari = [(wx - 36.8 - C0) / CS, -44];
    M.reach(c, 0, sari);
    if (shock > .02) { M.reach(c, 1, [lerp(c.hip[0] + 2, sari[0], shock), lerp(-40, -50, shock)]); c.hands = [c.hands[0], { pose: 'grip' }]; }
    x.save(); x.translate(C0 + cx, G + 34 + cy); x.scale(CS, CS);
    M.draw(x, P, c, { coat: CREAM, trouser: tone(P.coat2, P.cream, .3), skin: SK, head: 'bare' });
    x.restore();
    x.save(); x.translate(W0 + jx, G + 42 + jy); x.scale(WS, WS);
    M.draw(x, P, p, { kind: 'woman', coat: OCHRE, trouser: SARI, skin: SK, head: 'drape', headColor: SARI, prop: xx => CITY.pot(xx, P, POTC[0], POTC[1], 8.5) });
    x.restore();
  }
  const GS = 1.45, G0 = T.gardens - .3, G1 = G0 + 1.5, GEND = 866;
  const gWalk = M.gait({ from: 0, to: 54 / GS, t0: G0, until: G1, gait: 'walk', style: { step: 19, lift: 2.6, lean: -.08, head: -.1, bob: 1.3 }, yaw: Math.PI,
    arms: [[2.55, 2.85], [2.75, 2.95]], hands: [{ pose: 'fist' }, { pose: 'fist' }] });
  function gardener(x, t) {
    const tp = L.pose(t), k = smooth((tp - G0) / 1.5), [jx] = tremble(tp, 21, 1.1 * k);
    const p = gWalk(G0 + G1 - tp);
    const rake = (xx, PJ) => {
      const wn = PJ.arms[1].wr, wf = PJ.arms[0].wr, dx = wn[0] - wf[0], dy = wn[1] - wf[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, a = [wf[0] - ux * 14, wf[1] - uy * 14], b = [wn[0] + ux * 30, wn[1] + uy * 30];
      xx.strokeStyle = P.wood; xx.lineWidth = 2.4; xx.lineCap = 'round'; xx.beginPath(); xx.moveTo(a[0], a[1]); xx.lineTo(b[0], b[1]); xx.stroke();
      xx.lineWidth = 1.8; for (let i = -3; i <= 3; i++) { const c = [b[0] - uy * i * 2.6, b[1] + ux * i * 2.6]; xx.beginPath(); xx.moveTo(c[0], c[1]); xx.lineTo(c[0] + ux * 7 + uy * 2, c[1] + uy * 7 - ux * 2); xx.stroke(); }
      xx.lineCap = 'butt';
    };
    x.save(); x.translate(GEND + jx, G - 38); x.scale(GS, GS);
    M.draw(x, P, p, { coat: CREAM, trouser: CREAM, skin: SK, head: 'turban', headColor: tone(P.amberDark, P.cream, .35), prop: rake });
    x.restore();
  }
  function family(x, t) {
    const tp = L.pose(t), fear = smooth((tp - (T.constant - .5)) / .5), [jx, jy] = tremble(tp, 31, 1.2 * fear), [bx, by] = tremble(tp, 32, 1.5 * fear);
    const fr = lerp(.2, .9, fear), fo = lerp(.5, 2.1, fear), out = lerp(.12, .3, fear);
    const boy = M.idle({ seed: 31, base: { ...M.stand(0), yaw: Math.PI / 2, head: -.06 * fear, arms: [[fr, fo, out], [fr, fo, out]], hands: [{ pose: 'open', k: .3 * fear }, { pose: 'open', k: .3 * fear }] } })(tp);
    x.save(); x.translate(FAMILY - 18 + bx, G - 2 + by); x.scale(1.45, 1.45);
    M.draw(x, P, boy, { coat: tone('#4d6b58', P.cream, .2), trouser: CREAM, skin: SK, head: 'bare', shadow: .15 });
    x.restore();
    const man = M.idle({ seed: 32, base: { ...M.stand(0), yaw: Math.PI / 2, head: .04 * fear, arms: [[.1, .22], [lerp(.15, .25, fear), lerp(.25, .5, fear), lerp(.15, .55, fear)]], hands: [{ pose: 'relaxed', k: .4 }, { pose: 'open', k: .25 }] } })(tp);
    x.save(); x.translate(FAMILY + 20 + jx, G - 4 + jy); x.scale(2.25, 2.25);
    M.draw(x, P, man, { coat: CREAM, trouser: CREAM, skin: SK, head: 'turban', headColor: CREAM, beard: tone(P.cream, P.rim, .5), shadow: .15 });
    x.restore();
  }

  function far(x) {
    x.fillStyle = tone(P.sheetDim, P.bgTop, .35);
    for (let i = 0; i < 14; i++) {
      const bx = -1500 + i * 330 + hash(i, 3) * 80, bh = 140 + hash(i, 4) * 120, bw = 260 + hash(i, 5) * 80;
      x.fillRect(bx, -120 - bh, bw, bh + 400);
      if (i % 3 === 1) { x.beginPath(); x.ellipse(bx + bw / 2, -120 - bh, bw * .28, bw * .34, 0, Math.PI, 0); x.fill(); }
    }
  }
  function mid(x, t) {
    const MIDS = [[-1400, 420, -260, 'flat'], [-990, 380, -330, 'dome'], [-620, 430, -250, 'flat'], [-210, 360, -310, 'flat'], [130, 420, -350, 'dome'], [540, 400, -270, 'flat'], [930, 460, -300, 'flat'], [1380, 420, -330, 'dome'], [1790, 380, -260, 'flat'], [2160, 440, -300, 'flat']];
    for (const [bx, bw, top, roof] of MIDS) { x.save(); x.translate(bx, 260); CITY.house(x, P, { w: bw, h: 260 - top, roof, tone: .7, seed: bx | 0, rows: 1, domeR: 90 }); x.restore(); }
    CITY.tree(x, P, -60, 150, 1.35, 4);
    CITY.washing(x, P, 560, 900, -250, 1, 6);
  }
  const CY = 0.62;
  function courtyard(x, t) {
    x.fillStyle = tone(tone(P.wall, P.sheet, .6), P.bgTop, .18); x.fillRect(420, -300, 720, 640);
    x.fillStyle = tone(P.wall, P.sheet, .45); for (let k = 0; k < 3; k++) { x.beginPath(); CITY.archPath(x, 520 + k * 150, G - 64, 70, 130); x.fill(); }
    x.fillStyle = tone(P.wall, P.ink, .1); x.fillRect(420, G - 64, 720, 300);
    CITY.tree(x, P, 980, G - 60, .5, 9);
    CITY.well(x, P, 700, G - 44, .62);
    const tp = L.pose(t);
    x.save(); x.translate(765, G - 40); x.scale(.72, .72);
    PR.cobraRear(x, P, { rise: .42, hood: smooth((tp - T.gardens - .1) / .4) * .7, sway: Math.sin(tp * 3) * .15, tongue: ((tp * 1.4) % 1) });
    x.restore();
    gardener(x, t);
  }
  function lane(x, t, cam) {
    x.fillStyle = tone(P.wall, P.ink, .16); x.fillRect(-2000, G, 6000, 900);
    x.strokeStyle = tone(P.wall, P.ink, .24); x.lineWidth = 2;
    for (let yy = G + 40, k = 0; yy < G + 900; yy += 40 + k * 14, k++) { x.beginPath(); x.moveTo(-2000, yy); x.lineTo(4000, yy); x.stroke(); }
    for (const hs of HOUSES) { x.save(); x.translate(hs.x, G); CITY.house(x, P, hs); x.restore(); }
    { const A = HOUSES[4].arch, dx = clamp((ARCH - cam.x) * .07, -34, 34), ow = A.w, oh = A.h, iw = ow * .8, ih = oh * .86;
      x.save(); x.beginPath(); CITY.archPath(x, ARCH, G, ow, oh); CITY.archPath(x, ARCH - dx, G - 26, iw, ih); x.fillStyle = tone(P.wall, P.ink, .28); x.fill('evenodd');
      x.beginPath(); x.moveTo(ARCH - ow / 2, G); x.lineTo(ARCH + ow / 2, G); x.lineTo(ARCH - dx + iw / 2, G - 26); x.lineTo(ARCH - dx - iw / 2, G - 26); x.closePath(); x.fillStyle = tone(P.wall, P.ink, .16); x.fill(); x.restore(); }
    for (const s of SNAKES) if (s.kind !== 'lane' && s.kind !== 'step') snake(x, s, t);
    for (const s of SNAKES) if (s.kind === 'step') snake(x, s, t);
    for (const [i, hs] of HOUSES.entries()) if (hs.door != null) { x.save(); x.translate(0, G); CITY.step(x, P, doorX(i)); x.restore(); }
    family(x, t);
    woman(x, t);
    for (const s of SNAKES) if (s.kind === 'lane') snake(x, s, t);
  }
  function front(x, t) {
    const tp = L.pose(t); if (tp < T.venom - .2 || tp > T.s3 + .6) return;
    const rise = smooth((tp - (T.venom - .16)) / .45) * (1 - smooth((tp - T.s3) / .45)), hood = smooth((tp - T.venom) / .34) * (1 - smooth((tp - T.s3) / .3));
    const k = PORT ? 1.2 : 1;
    x.save(); x.translate(PORT ? 40 : -330, (PORT ? 700 : 620) + 260 * smooth((tp - T.s3) / .5)); x.scale(2.3 * k, 2.3 * k);
    PR.cobraRear(x, P, { rise, hood, sway: Math.sin(tp * 2.2) * .12, tongue: tp > T.ones ? clamp((tp - T.ones) / .32) : 0 });
    x.restore();
  }

  function draw(ctx, t) {
    const cam = camera(t);
    L.background(ctx);
    L.sheet(ctx, cam, .5, R, x => far(x), { rim: false });
    L.sheet(ctx, cam, .78, R, x => mid(x, t));
    L.sheet(ctx, cam, CY, R, x => courtyard(x, t));
    L.sheet(ctx, cam, 1, R, x => lane(x, t, cam));
    const veil = .34 * smooth((t - (T.venom - .1)) / .35) * (1 - smooth((t - T.s3) / .4));
    if (veil > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = F.rgba(F.hex(P.bgBot), veil); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    L.sheet(ctx, cam, 1.35, R, x => front(x, t));
    L.grade(ctx, t);
  }

  F.scene('seq-01', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { HOUSES, G, camera, T, snake, lane, mid, far, courtyard } });
})();
