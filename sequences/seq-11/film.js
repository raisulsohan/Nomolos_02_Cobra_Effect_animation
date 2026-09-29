(function () {
  'use strict';
  const F = FILM, PR = F.props, A = F.archive, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, easeOut, hash } = F, mix = F.city.mix;
  const C = F.cues('seq-11'), DUR = C.duration;
  const L = F.look('paper', W, H), P = L.P, AC = A.col(P);
  const ramp = (t, a, b) => smooth((t - a) / (b - a));

  const T = {
    cobra: 1.426, moment: 2.349, honesty: 4.536,
    delhi: 6.009, part: 10.734, legendEnd: 11.257,
    historians: 11.725, tie: 13.417, it55: 13.624, records: 14.243,
    s56: C.s('S056').t0, repeated: 15.544, clean: 16.782, not56: 18.226, paperwork: 19.816,
    s57: C.s('S057').t0, were: 21.903, only: 22.387, example: 22.651, you: 23.678, raise: 25.106,
    s58: C.s('S058').t0, not58: 26.686, example58: 27.288,
    s59: C.s('S059').t0, second: 28.753, story: 29.075, documented: 30.341, detail: 30.823,
  };

  const U = { lamp: -960, book: -450, bal: 540, folder: 1100, shelf0: 1020, shelf1: 1600 };
  const V = { lamp: 330, book: 220, bal: 330, folderBack: 340 };
  const FOLD = { w: 260, d: 300 };
  const BO = [U.book, A.at(U.book, V.book)[1] - A.BOOK.LEDGE], PL = A.BOOK.PLATE;
  const PLW = [BO[0] + PL.x, BO[1] + PL.y];

  const S1 = F.getScene('seq-01').api, FREEZE = T.cobra, TL0 = 2.25;
  const laneT = t => TL0 + Math.min(t, FREEZE);
  const CROP = PORT ? [80, 700, 880, 660] : [180, 390, 900, 675], KPIC = PL.w / CROP[2];
  const IMG = [PLW[0] - CROP[0] * KPIC, PLW[1] - CROP[1] * KPIC, W * KPIC, H * KPIC];
  const [picC, picX] = F.canvas(W, H), [outC, outX] = F.canvas(W, H), [mskC, mskX] = F.canvas(W, H);
  function renderLane(tl) {
    const cam = S1.camera(tl), tp = L.pose(tl);
    picX.setTransform(1, 0, 0, 1, 0, 0); picX.clearRect(0, 0, W, H);
    L.background(picX);
    L.sheet(picX, cam, .5, [0, 0], x => S1.far(x), { rim: false });
    L.sheet(picX, cam, .78, [0, 0], x => S1.mid(x, tl));
    L.sheet(picX, cam, .62, [0, 0], x => S1.courtyard(x, tl));
    L.sheet(picX, cam, 1, [0, 0], x => S1.lane(x, tl, cam));
    picX.save(); picX.setTransform(1, 0, 0, 1, 0, 0); picX.fillStyle = F.rgba(F.hex(P.bgBot), .34); picX.fillRect(0, 0, W, H); picX.restore();
    L.sheet(picX, cam, 1.35, [0, 0], x => {
      const k = PORT ? 1.2 : 1;
      x.translate(PORT ? 40 : -330, PORT ? 700 : 620); x.scale(2.3 * k, 2.3 * k);
      PR.cobraRear(x, P, { rise: 1, hood: 1, sway: Math.sin(tp * 2.2) * .12, tongue: (tp * 1.3) % 1 });
    });
  }
  let ENG = null;
  function engraving() {
    if (!ENG) { renderLane(laneT(FREEZE)); ENG = A.engrave(picC, CROP, { ink: P.ink, lead: mix(P.ink, P.card, .35) }); }
    return ENG;
  }
  const [wipC, wipX] = F.canvas(CROP[2], CROP[3]);
  function plate(x, pw, ph, wipe) {
    const E = engraving();
    if (wipe <= 0) { x.drawImage(E.print, 0, 0, pw, ph); return; }
    const cw = E.w, ch = E.h, s = cw * .05, e = lerp(cw + s, cw * .5, wipe);
    const g = wipX.createLinearGradient(e - s, 0, e + s, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    for (const [img, op] of [[E.print, 'destination-in'], [E.pencil, 'destination-out']]) {
      wipX.setTransform(1, 0, 0, 1, 0, 0); wipX.globalCompositeOperation = 'source-over'; wipX.clearRect(0, 0, cw, ch);
      wipX.drawImage(img, 0, 0); wipX.globalCompositeOperation = op; wipX.fillStyle = g; wipX.fillRect(0, 0, cw, ch);
      wipX.globalCompositeOperation = 'source-over';
      x.drawImage(wipC, 0, 0, pw, ph);
    }
  }

  const SHELF = (() => { const [, x] = F.canvas(8, 8); return A.shelf(x, P, { u0: U.shelf0, u1: U.shelf1 }); })();
  const RING = SHELF.rings[0], PIN = [U.book + A.BOOK.PW + 26, A.at(U.book, V.book)[1] - A.BOOK.LEDGE - 4];
  const TH = { n: 64, cast: T.historians + .05, apex: T.it55, floor: A.at(0, 205)[1] };
  const P1 = [RING[0] - 75, RING[1] + 75], P2 = [RING[0] - 38, RING[1] + 8], P3 = [RING[0] - 46, RING[1] + 26];
  const castPath = F.rope.smooth([PIN, [PIN[0] + 360, PIN[1] - 170], [P1[0] - 380, P1[1] + 20], [P1[0] - 120, P1[1] + 8], P1], 60);
  TH.reach = T.tie; TH.short = T.tie + .3; TH.rel = T.tie + .5;
  function threadEnd(t) {
    if (t < TH.cast || t > TH.rel) return null;
    if (t < TH.reach) {
      const k = easeOut((t - TH.cast) / (TH.reach - TH.cast), 1.8), f = k * (castPath.length - 1), i = Math.min(castPath.length - 2, Math.floor(f)), r = f - i;
      return [lerp(castPath[i][0], castPath[i + 1][0], r), lerp(castPath[i][1], castPath[i + 1][1], r)];
    }
    if (t < TH.short) { const k = easeOut((t - TH.reach) / (TH.short - TH.reach), 2.5); return [lerp(P1[0], P2[0], k), lerp(P1[1], P2[1], k)]; }
    const k = F.easeIn((t - TH.short) / (TH.rel - TH.short), 2); return [lerp(P2[0], P3[0], k), lerp(P2[1], P3[1], k)];
  }
  function flightCurve(t, n) {
    const E = threadEnd(t), d = Math.hypot(E[0] - PIN[0], E[1] - PIN[1]), sag = Math.min(150, d * .17);
    const Cp = [(PIN[0] + E[0]) / 2, (PIN[1] + E[1]) / 2 + 2 * sag], raw = [];
    for (let i = 0; i <= 200; i++) { const u = i / 200, v = 1 - u; raw.push([v * v * E[0] + 2 * u * v * Cp[0] + u * u * PIN[0], Math.min(TH.floor - 3, v * v * E[1] + 2 * u * v * Cp[1] + u * u * PIN[1])]); }
    const acc = [0]; for (let i = 1; i < raw.length; i++) acc.push(acc[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
    const out = []; for (let k = 0, j = 0; k < n; k++) { const s = acc.at(-1) * k / (n - 1); while (j < raw.length - 2 && acc[j + 1] < s) j++; const r = (s - acc[j]) / Math.max(1e-6, acc[j + 1] - acc[j]); out.push([lerp(raw[j][0], raw[j + 1][0], r), lerp(raw[j][1], raw[j + 1][1], r)]); }
    return out;
  }
  const THREAD = F.rope.run({
    ropes: [{ pts: flightCurve(TH.rel - 1e-6, TH.n), r: 3, pins: [{ i: TH.n - 1, at: () => PIN }] }],
    t0: TH.rel, t1: DUR, rate: 60, self: false, bend: 1.1, g: 2000,
    world: () => ({ planes: [{ y: TH.floor, x0: PIN[0] - 30, fr: .6 }] }),
  });
  const threadPts = t => t < TH.rel ? flightCurve(t, TH.n) : THREAD.at(t)[0];
  function thread(x, t) {
    const [bx, by] = PIN;
    if (t >= TH.cast) {
      const pts = threadPts(t), sm = F.rope.smooth(pts, 140), tw = mix(P.parchment, P.wood, .45);
      x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
      x.strokeStyle = mix(tw, P.ink, .35); x.lineWidth = 6.5; x.beginPath(); sm.forEach((p, i) => i ? x.lineTo(p[0], p[1] + 1) : x.moveTo(p[0], p[1] + 1)); x.stroke();
      x.strokeStyle = tw; x.lineWidth = 4.4; x.beginPath(); sm.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
      const a = Math.atan2(pts[0][1] - pts[1][1], pts[0][0] - pts[1][0]);
      x.translate(pts[0][0], pts[0][1]); x.rotate(a); x.strokeStyle = mix(tw, P.ink, .2); x.lineWidth = 4; x.beginPath(); x.ellipse(12, 0, 13, 8, 0, 0, F.TAU); x.stroke();
      x.restore();
    }
    x.fillStyle = mix(AC.brass, P.ink, .1); x.beginPath(); x.arc(bx, by, 8, 0, F.TAU); x.fill();
    x.fillStyle = AC.brassLight; x.beginPath(); x.arc(bx - 2.5, by - 2.5, 3, 0, F.TAU); x.fill();
  }

  const COPIES = [
    { kind: 'newspaper', w: 265, h: 195, u: -660, v: 205, a: .07 }, { kind: 'textbook', w: 300, h: 196, u: -390, v: 206, a: -.09 },
    { kind: 'magazine', w: 200, h: 205, u: -70, v: 208, a: .12 }, { kind: 'postcard', w: 210, h: 140, u: 160, v: 170, a: -.15 },
    { kind: 'poster', w: 255, h: 196, u: 380, v: 204, a: .06 },
  ];
  const COPY0 = [-600, 206];
  const copyPic = (x, pw, ph) => x.drawImage(ENG.print, 0, 0, pw, ph);
  function copies(x, t) {
    const neat = ramp(t, T.clean, T.clean + .45);
    COPIES.forEach((c, i) => {
      const k = (t - (T.repeated + i * .22)) / .5; if (k <= 0) return;
      const e = easeOut(k, 3), rowU = -690 + i * 236;
      const u = lerp(lerp(COPY0[0], c.u, e), rowU, neat), v = lerp(lerp(COPY0[1], c.v, e), 206, neat), a = lerp(c.a * e + (1 - e) * .3, 0, neat);
      x.save(); x.globalAlpha = clamp(k * 6); A.plane(x, u, v, 0, a); A.copy(x, P, c.kind, c.w, c.h, copyPic); x.restore();
    });
  }
  const OPEN56 = [T.paperwork, T.paperwork + .38], SHUT57 = [T.only + .06, T.only + .26];
  const folderCover = t => ramp(t, OPEN56[0], OPEN56[1]) * (1 - ramp(t, SHUT57[0], SHUT57[1]));
  function dust(x, t) {
    const k = t - OPEN56[1]; if (k < 0 || k > 1.6) return;
    for (let i = 0; i < 9; i++) {
      const s = 40 + hash(i, 5) * 180, y = 60 + hash(i, 6) * 200, f = clamp((k - hash(i, 7) * .5) / .9);
      x.fillStyle = F.rgba(F.hex(P.ink), .28 * (1 - smooth(f)) * (f > 0 ? 1 : 0)); x.beginPath(); x.arc(s, y - (1 - f) * 90, 2.2, 0, F.TAU); x.fill();
    }
  }

  const THICK = { w: 250, d: 290, th: 72 }, LAND = { book: T.only + .5, folder: T.example + .6, thick: T.not58 + .16 };
  const FLY = { book: [T.only, LAND.book], folder: [SHUT57[1] + .04, LAND.folder] };
  const spring = (t, t0, amp, w = 11, d = 6) => { if (t < t0) return 0; const u = t - t0; return amp * (1 - Math.exp(-d * u) * (Math.cos(w * u) + d / w * Math.sin(w * u))); };
  const kick = (t, t0, amp, w = 10, d = 3) => t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(w * (t - t0));
  const beamA = t => spring(t, LAND.book, -.02) + spring(t, LAND.folder, -.009) + spring(t, LAND.thick, .34, 8, 4.2);
  const sway = t => [kick(t, LAND.book, .05) + kick(t, LAND.folder, .03) - kick(t, LAND.thick, .13, 7, 2.6), kick(t, LAND.thick, .07, 9, 3)];
  const geo = t => A.balanceAt(U.bal, V.bal, beamA(t), sway(t));
  const onPan = (g, i, p) => { const [px, py, s] = g.pan[i], c = Math.cos(s), n = Math.sin(s); return [px + p[0] * c - p[1] * n, py + p[0] * n + p[1] * c]; };
  const G_BOOK = geo(LAND.book), G_FOLD = geo(LAND.folder), G_THICK = geo(LAND.thick);
  const BOOK_START = [BO[0] - (A.BOOK.PW + 12) / 2, BO[1]], BOOK_ON = [0, 14];
    const FOLD_ON = [-FOLD.w / 2 + 34, BOOK_ON[1] - 46 + 4 - FOLD.d * A.SV];
  const THICK_ON = [-THICK.w / 2, 16 - THICK.d * A.SV];
  const folderAt = (x, X0, Y0, w, d, th, o) => A.folder(x, P, X0, 0, A.FRONT - Y0, w, d, th, o);
  const bounce = t => { const u = t - LAND.thick - .12; return u > 0 && u < .34 ? -20 * Math.sin(Math.PI * u / .34) : 0; };
  function loadLeft(x, t) {
    x.translate(0, bounce(t));
    if (t >= LAND.book) { x.save(); x.translate(BOOK_ON[0], BOOK_ON[1]); A.closedBook(x, P, 1); x.restore(); }
    if (t >= LAND.folder) folderAt(x, FOLD_ON[0], FOLD_ON[1], FOLD.w, FOLD.d, 6, { label: ['COBRA', 'BOUNTY'] });
  }
  const TAPE = t => 1 - .5 * ramp(t, T.second, T.second + .25) - .5 * ramp(t, T.story, T.story + .35);
  const THICK_COVER = t => .8 * ramp(t, T.story + .2, T.documented - .1);
  function loadRight(x, t) {
    if (t >= LAND.thick) folderAt(x, THICK_ON[0], THICK_ON[1], THICK.w, THICK.d, THICK.th * (1 - .6 * ramp(t, T.documented, T.documented + .7)), { tape: TAPE(t), cover: THICK_COVER(t) });
  }
  function flying(x, t) {
    if (t >= FLY.book[0] && t < LAND.book) {
      const k = (t - FLY.book[0]) / (LAND.book - FLY.book[0]), e = easeIO(k), to = onPan(G_BOOK, 0, BOOK_ON);
      x.save(); x.translate(lerp(BOOK_START[0], to[0], e), lerp(BOOK_START[1], to[1], e) - 170 * Math.sin(Math.PI * k)); A.closedBook(x, P, smooth(k * 1.3)); x.restore();
    }
    if (t >= FLY.folder[0] && t < LAND.folder) {
      const k = (t - FLY.folder[0]) / (LAND.folder - FLY.folder[0]), e = easeIO(k), from = A.at(U.folder, V.folderBack), to = onPan(G_FOLD, 0, FOLD_ON);
      folderAt(x, lerp(from[0], to[0], e), lerp(from[1], to[1], e) - 330 * Math.sin(Math.PI * k), FOLD.w, FOLD.d, 6, { label: ['COBRA', 'BOUNTY'] });
    }
    if (t >= T.not58 && t < LAND.thick) {
      const k = (t - T.not58) / (LAND.thick - T.not58), to = onPan(G_THICK, 1, THICK_ON);
      folderAt(x, to[0], to[1] - 1100 * (1 - k * k), THICK.w, THICK.d, THICK.th, { tape: 1 });
    }
  }
  function balance(x, t) {
    const g = geo(t);
    A.balanceBack(x, P, g);
    for (const [i, load] of [[0, loadLeft], [1, loadRight]]) { x.save(); x.translate(g.pan[i][0], g.pan[i][1]); x.rotate(g.pan[i][2]); load(x, t); x.restore(); }
    flying(x, t);
    A.balanceLip(x, P, g, 0); A.balanceLip(x, P, g, 1);
  }

  const PAPER_KINDS = ['letter', 'receipt', 'list', 'report', 'receipt', 'letter', 'list'], PAPER_SIZE = { letter: [150, 200], list: [150, 200], report: [160, 214], receipt: [112, 150] };
  const PAPERS = [[520, 300], [400, 250], [300, 315], [460, 215], [320, 230], [560, 255], [380, 190], [860, 250], [980, 200], [1110, 300], [920, 110], [1200, 160], [1060, 70], [1290, 250]]
    .map(([u, v], i) => ({ u, v, side: i < 7 ? -1 : 1, kind: PAPER_KINDS[i % 7], a: (hash(i, 31) - .5) * 1.1, t0: T.documented + (i < 7 ? i : i - 7) * .09 + (i < 7 ? 0 : .045), seed: 50 + i }));
  function papers(x, t) {
    for (const p of PAPERS) {
      const k = (t - p.t0) / .55; if (k <= 0) continue;
      const [pw, ph] = PAPER_SIZE[p.kind], g = geo(Math.min(t, p.t0 + .16));
      let cx, cy, a, q;
      if (k < .3) {
        const e = k / .3, pp = onPan(g, 1, [p.side * lerp(20, A.BAL.pr + 30, e), -26 + 10 * e]);
        cx = pp[0]; cy = pp[1]; a = p.a * .2 * e; q = A.SV;
      } else {
        const e = clamp((k - .3) / .7), from = onPan(g, 1, [p.side * (A.BAL.pr + 30), -16]), to = A.at(p.u, p.v);
        cx = lerp(from[0], to[0], easeOut(e, 1.6)); cy = lerp(from[1], to[1], F.easeIn(e, 1.8)) - 50 * Math.sin(Math.PI * e);
        a = lerp(p.a * .2, p.a, e); q = A.SV + .28 * Math.sin(Math.PI * e) * (hash(p.seed, 2) > .5 ? 1 : -.4);
      }
      x.save(); x.translate(cx, cy); x.transform(Math.cos(a), q * Math.sin(a), -Math.sin(a), q * Math.cos(a), 0, 0); x.translate(-pw / 2, -ph / 2);
      A.paper(x, P, p.kind, pw, ph, p.seed); x.restore();
    }
  }

  const PROF = { in: [T.you, T.you + .6], out: [T.example58, T.example58 + .5] };
  function viewer(x, t) {
    const k = ramp(t, PROF.in[0], PROF.in[1]) * (1 - ramp(t, PROF.out[0], PROF.out[1])); if (k <= 0) return;
    const S = PORT ? H * .5 / 110 : H * .9 / 110, X = lerp(-W / 2 - 110 * S, -W / 2 + (PORT ? 30 : 24.5) * S, k), Y = H / 2 + 14 * S;
    x.save(); x.translate(X, Y); x.scale(S, S);
    A.profile(x, P, { brow: ramp(t, T.raise, T.raise + .34) * (1 - ramp(t, T.example58 - .05, T.example58 + .15)), back: ramp(t, T.raise, T.raise + .5) });
    x.restore();
  }

  function set(x, t) {
    A.wall(x, P);
    A.shelf(x, P, { u0: U.shelf0, u1: U.shelf1 });
    A.desk(x, P);
    A.lamp(x, P, U.lamp, V.lamp, ramp(t, T.honesty, T.honesty + .08));
    balance(x, t);
    const [bx, by] = A.at(U.book, V.book);
    x.save(); x.translate(bx, by);
    A.stand(x, P, 'back');
    const wipe = ramp(t, T.part, T.legendEnd), cap = ramp(t, T.delhi, T.delhi + .34), open = 1 - ramp(t, T.were, T.were + .3);
    if (t < FLY.book[0]) { x.save(); x.translate(0, -A.BOOK.LEDGE); A.book(x, P, { open, caption: cap, plate: (px, pw, ph) => plate(px, pw, ph, wipe) }); x.restore(); }
    A.stand(x, P, 'front');
    x.restore();
    thread(x, t);
    copies(x, t);
    if (t < FLY.folder[0]) A.folder(x, P, U.folder, V.folderBack, 0, FOLD.w, FOLD.d, 6, { label: ['COBRA', 'BOUNTY'], cover: folderCover(t), inside: ix => dust(ix, t) });
    papers(x, t);
  }

  function liveFrame(t) {
    const gray = ramp(t, FREEZE, FREEZE + .5), aOut = 1 - ramp(t, FREEZE + .3, T.moment + .1), aIn = 1 - ramp(t, T.moment - .15, T.moment + .4);
    if (aIn <= 0) return null;
    const E = engraving();
    renderLane(laneT(t));
    outX.setTransform(1, 0, 0, 1, 0, 0); outX.globalAlpha = 1; outX.globalCompositeOperation = 'source-over'; outX.clearRect(0, 0, W, H);
    outX.drawImage(picC, 0, 0);
    if (gray > 0) {
      outX.globalCompositeOperation = 'saturation'; outX.globalAlpha = gray; outX.fillStyle = '#808080'; outX.fillRect(0, 0, W, H);
      outX.globalCompositeOperation = 'color'; outX.globalAlpha = gray * .22; outX.fillStyle = P.parchment; outX.fillRect(0, 0, W, H);
      outX.globalCompositeOperation = 'source-over'; outX.globalAlpha = 1;
    }
    if (aOut < 1) {
      mskX.setTransform(1, 0, 0, 1, 0, 0); mskX.globalAlpha = 1; mskX.globalCompositeOperation = 'source-over'; mskX.clearRect(0, 0, W, H);
      mskX.fillStyle = `rgba(0,0,0,${aOut.toFixed(4)})`; mskX.fillRect(0, 0, W, H);
      if (aIn > aOut) { mskX.globalCompositeOperation = 'lighter'; mskX.globalAlpha = aIn - aOut; mskX.drawImage(E.mask, CROP[0], CROP[1]); }
      mskX.globalAlpha = 1; mskX.globalCompositeOperation = 'source-over';
      outX.globalCompositeOperation = 'destination-in'; outX.drawImage(mskC, 0, 0); outX.globalCompositeOperation = 'source-over';
    }
    return outC;
  }

  const Z0 = 1 / KPIC, C0 = [IMG[0] + IMG[2] / 2, IMG[1] + IMG[3] / 2];
  const KEYS = PORT ? [
    [0, [C0[0], C0[1], Z0]], [T.moment - .15, [C0[0], C0[1], Z0 * 1.02]], [3.6, [-450, -80, 1.62]], [T.delhi - .2, [-450, -80, 1.62]], [11.2, [-430, -100, 1.72]],
    [TH.cast + .03, [-430, -100, 1.72]], [13.3, [1150, -90, 1.0]], [T.s56, [1150, -90, 1.0]], [16.4, [-180, -20, .8]], [T.not56 + .07, [-180, -20, .8]], [19.6, [1230, 30, 1.15]],
    [T.s57, [1230, 30, 1.15]], [22.3, [560, -190, 1.0]], [27.7, [560, -190, 1.0]], [28.7, [800, -100, 1.2]], [T.detail, [800, -100, 1.2]], [31.4, [820, -10, 1.38]],
  ] : [
    [0, [C0[0], C0[1], Z0]], [T.moment - .15, [C0[0], C0[1], Z0 * 1.02]], [3.6, [-540, -130, 1.6]], [T.delhi - .2, [-540, -130, 1.6]], [11.2, [-430, -140, 1.78]],
    [TH.cast + .03, [-430, -140, 1.78]], [13.3, [1180, -90, 1.25]], [T.s56, [1180, -90, 1.25]], [16.4, [-60, -80, .92]], [T.not56 + .07, [-60, -80, .92]], [19.6, [1230, 30, 1.3]],
    [T.s57, [1230, 30, 1.3]], [22.3, [560, -190, 1.12]], [27.7, [560, -190, 1.12]], [28.7, [820, -110, 1.45]], [T.detail, [820, -110, 1.45]], [31.4, [840, -20, 1.65]],
  ];
  function cam(t) {
    const xy = F.keyed(t, KEYS.map(([k, v]) => [k, [v[0], v[1]]])), z = F.keyed(t, KEYS.map(([k, v]) => [k, v[2]]), true);
    return { x: xy[0], y: xy[1], z };
  }

  const BULB = (() => { const [, x] = F.canvas(8, 8); return A.lamp(x, P, U.lamp, V.lamp, 0); })();
  function light(ctx, t, c) {
    const on = ramp(t, T.honesty, T.honesty + .45), bx = W / 2 + c.z * (BULB[0] - c.x), by = H / 2 + c.z * (BULB[1] - c.y);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (on < 1) { ctx.fillStyle = `rgba(38,28,20,${(.2 * (1 - on)).toFixed(4)})`; ctx.fillRect(0, 0, W, H); }
    if (on > 0 && c.z > .4) {
      const r = 900 * c.z, gr = ctx.createRadialGradient(bx, by + 120 * c.z, 0, bx, by + 120 * c.z, r); gr.addColorStop(0, F.rgba(F.hex(P.glow), .22 * on)); gr.addColorStop(1, F.rgba(F.hex(P.glow), 0));
      ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }
  function draw(ctx, t) {
    engraving();
    const c = cam(t), live = liveFrame(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [0, 0], x => set(x, t));
    if (live) L.sheet(ctx, c, 1, [0, 0], x => x.drawImage(live, IMG[0], IMG[1], IMG[2], IMG[3]), { rim: false, shadow: false, fibre: 0 });
    if (t > PROF.in[0] && t < PROF.out[1]) L.sheet(ctx, { x: 0, y: 0, z: 1 }, 1, [0, 0], x => viewer(x, t));
    light(ctx, t, c);
    L.grade(ctx, t);
  }

  F.scene('seq-11', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { T, U, V, cam, set, geo, PAPERS, engraving } });
})();
