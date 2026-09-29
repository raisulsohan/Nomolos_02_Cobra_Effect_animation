(function () {
  'use strict';
  const F = FILM, PR = F.props, MAP = F.citymap, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, easeIO, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-07'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const S4 = F.getScene('seq-04').api, CH = S4.CH;
  const T = { city: 0.368, before: 3.096, s23: C.s('S023').t0, cobra: 6.554, s24: C.s('S024').t0, everywhere: 11.182 };

  const gone = i => hash(i, 77) < .52;
  const more = t => smooth((t - .3) / 4.3);
  const MAP_END = S4.cam(9);

  const cw = CH.w, chh = CH.h, pad = cw * .1, AX0 = pad, AX1 = cw - pad * .6, AY0 = chh - pad * .9, AY1 = pad * 1.5;
  const X = u => lerp(AX0, AX1, u), Y = v => lerp(AY0, AY1, v);
  const CURVE = [[0, .82], [.1, .8], [.22, .66], [.34, .5], [.46, .38], [.56, .36], [.66, .44], [.76, .6], [.85, .76], [.92, .86]];
  const BEFORE_V = .82, FELL = 4;
  function curvePts(rx, ry, rw, rh, upto = 1) {
    const pts = F.rope.smooth(CURVE.map(([u, v]) => [rx + u * rw, ry + (1 - v) * rh]), 90), n = Math.max(2, Math.round(pts.length * clamp(upto)));
    return pts.slice(0, n);
  }
  const lenFrac = (() => { const pts = curvePts(AX0, AY1, AX1 - AX0, AY0 - AY1), L2 = []; let s = 0; pts.forEach((p, i) => { if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); L2.push(s); }); return { at: i => L2[i] / s, n: pts.length }; })();
  function cobraLine(x, pts, width, col, rear, t, o = {}) {
    const s = width / 9 * (o.big ?? 1.4), r = smooth(clamp(rear)), e = pts[pts.length - 1], b = pts[Math.max(0, pts.length - 6)];
    const dl = Math.hypot(e[0] - b[0], e[1] - b[1]) || 1, d = [(e[0] - b[0]) / dl, (e[1] - b[1]) / dl];
    const up = 34 * s * r, bend = [e[0] + d[0] * 14 * s * r, e[1] + d[1] * 14 * s * r], neckTop = [bend[0] + 4 * s * r, e[1] - up];
    x.strokeStyle = col; x.lineWidth = width; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
    if (r > 0) x.quadraticCurveTo(bend[0] + d[0] * 6 * s * r, bend[1], neckTop[0], neckTop[1]);
    x.stroke(); x.lineCap = 'butt'; x.lineJoin = 'miter';
    if (r <= 0) return;
    const hood = r * 19 * s, hr = smooth((rear - .3) / .7), sway = o.sway || 0;
    x.save(); x.translate(neckTop[0], neckTop[1]); x.rotate(sway);
    x.fillStyle = col;
    const hb = 12 * s, hw = -12 * s * r, ht = -22 * s * r;
    x.beginPath(); x.moveTo(-width * .5, hb);
    x.quadraticCurveTo(-width * .5, hb - 8 * s, -hood * .7, hw + 6 * s); x.quadraticCurveTo(-hood * 1.05, hw - 3 * s, -hood * .55, ht);
    x.quadraticCurveTo(0, ht - 4 * s * r, hood * .55, ht);
    x.quadraticCurveTo(hood * 1.05, hw - 3 * s, hood * .7, hw + 6 * s); x.quadraticCurveTo(width * .5, hb - 8 * s, width * .5, hb); x.closePath(); x.fill();
    if (hr > 0) {
      x.beginPath(); x.ellipse(0, ht - 5 * s, 7.5 * s * hr, 5.2 * s * hr, 0, 0, TAU); x.fill();
      const fl = ((t * 1.5) % 1), tg = fl < .3 ? Math.sin(Math.PI * fl / .3) : 0;
      if (tg > 0 && rear >= 1) {
        const ty = ht - 10 * s; x.strokeStyle = col; x.lineWidth = 1.6 * s; x.lineCap = 'round';
        x.beginPath(); x.moveTo(0, ty); x.lineTo(0, ty - 8 * tg * s); x.moveTo(0, ty - 8 * tg * s); x.lineTo(-3 * s, ty - 11 * tg * s); x.moveTo(0, ty - 8 * tg * s); x.lineTo(3 * s, ty - 11 * tg * s); x.stroke(); x.lineCap = 'butt';
      }
    }
    x.restore();
  }
  const DRAW = [T.city - .1, T.before + 1.2];
  const REAR = [T.cobra - .75, T.cobra - .1];
  function chart(x, t) {
    MAP.chart(x, P, { w: cw, h: chh, draw: 0, label: 1 });
    const bk = smooth((t - (T.before - .15)) / .3);
    if (bk > 0) {
      x.save(); x.globalAlpha = bk; x.setLineDash([12, 9]); x.strokeStyle = mix(P.card, P.ink, .45); x.lineWidth = 3;
      x.beginPath(); x.moveTo(AX0, Y(BEFORE_V)); x.lineTo(AX1, Y(BEFORE_V)); x.stroke(); x.setLineDash([]);
      x.fillStyle = mix(P.card, P.ink, .7); x.font = `600 ${chh * .085}px NS`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText('BEFORE', X(.5), Y(BEFORE_V) - 10);
      x.restore();
    }
    const d0 = lenFrac.at(Math.round((lenFrac.n - 1) * FELL / (CURVE.length - 1))), d = lerp(d0, 1, easeIO(clamp((t - DRAW[0]) / (DRAW[1] - DRAW[0]))));
    const pts = curvePts(AX0, AY1, AX1 - AX0, AY0 - AY1);
    let n = 2; while (n < pts.length && lenFrac.at(n - 1) < d) n++;
    cobraLine(x, pts.slice(0, n), cw * .022, P.ink, smooth((t - REAR[0]) / (REAR[1] - REAR[0])), t, { sway: Math.sin(t * 2.1) * .04 * smooth((t - REAR[1]) / .4) });
  }

  const TW = cw, TH = chh, GAPX = 50, GAPY = 46;
  const KINDS = ['ledger', 'news', 'chalk', 'screen', 'phone', 'chart'];
  function tile(x, kind, seed, t) {
    const r = F.rng(seed);
    const box = (fill, edge) => { x.fillStyle = edge; x.fillRect(-6, -6, TW + 12, TH + 12); x.fillStyle = fill; x.fillRect(0, 0, TW, TH); };
    let col = P.ink, width = 7, rect = [TW * .12, TH * .22, TW * .76, TH * .62], mark = P.cream;
    if (kind === 'ledger') {
      box(mix(P.card, P.parchment, .5), mix(P.parchmentEdge, P.ink, .2));
      x.strokeStyle = mix(P.glass, P.card, .4); x.lineWidth = 1.5; for (let y = 26; y < TH; y += 18) { x.beginPath(); x.moveTo(0, y); x.lineTo(TW, y); x.stroke(); }
      x.strokeStyle = mix(P.parchmentEdge, P.ink, .1); x.lineWidth = 2; x.beginPath(); x.moveTo(40, 0); x.lineTo(40, TH); x.stroke();
      col = mix(P.ink, P.coat, .4); width = 5;
    } else if (kind === 'news') {
      box(mix(P.card, P.sheetShade, .35), mix(P.sheetShade, P.ink, .3));
      x.fillStyle = mix(P.ink, P.card, .2); x.fillRect(16, 12, TW - 32, 22);
      x.fillStyle = mix(P.card, P.ink, .35); for (let c = 0; c < 2; c++) for (let y = 48; y < TH - 14; y += 11) x.fillRect(16 + c * 70, y, 58 - r() * 14, 4);
      x.strokeStyle = mix(P.card, P.ink, .5); x.lineWidth = 2; x.strokeRect(166, 48, TW - 184, TH - 64);
      rect = [180, 64, TW - 212, TH - 96]; width = 5;
    } else if (kind === 'chalk') {
      box(mix('#2f4a3c', P.ink, .2), mix(P.wood, P.ink, .1));
      col = mix(P.cream, '#ffffff', .2); mark = '#2f4a3c'; width = 6;
    } else if (kind === 'screen') {
      box(mix(P.bgTop, P.ink, .2), mix(P.facade, P.ink, .45));
      x.strokeStyle = mix(P.bgTop, P.glass, .25); x.lineWidth = 1; for (let gx = 30; gx < TW; gx += 40) { x.beginPath(); x.moveTo(gx, 10); x.lineTo(gx, TH - 10); x.stroke(); } for (let gy = 30; gy < TH; gy += 40) { x.beginPath(); x.moveTo(10, gy); x.lineTo(TW - 10, gy); x.stroke(); }
      col = P.amber; mark = mix(P.bgTop, P.ink, .2); width = 6;
    } else if (kind === 'phone') {
      x.fillStyle = mix(P.sheet2, P.ink, .1); x.fillRect(0, 0, TW, TH);
      const pw = TH * .56, px = (TW - pw) / 2;
      x.fillStyle = P.ink; x.beginPath(); x.roundRect(px - 8, 6, pw + 16, TH - 12, 18); x.fill();
      x.fillStyle = mix(P.bgTop, P.glass, .12); x.fillRect(px, 22, pw, TH - 44);
      rect = [px + 14, 60, pw - 28, TH - 110]; col = mix(P.glass, '#ffffff', .2); mark = P.ink; width = 5;
    } else {
      box(P.card, mix(P.card, P.ink, .25));
      x.strokeStyle = mix(P.card, P.ink, .6); x.lineWidth = 3; x.beginPath(); x.moveTo(30, 20); x.lineTo(30, TH - 26); x.lineTo(TW - 20, TH - 26); x.stroke();
    }
    cobraLine(x, curvePts(...rect), width, col, 1, t + seed);
  }
  const WALL = []; for (let r = -4; r <= 4; r++) for (let c = -5; c <= 5; c++) if (r || c) WALL.push([c, r, KINDS[Math.floor(hash(c + 9, r + 9, 5) * KINDS.length)], (c + 9) * 31 + r + 9]);
  function wall(x, t, a) {
    if (a <= 0) return;
    x.save(); x.globalAlpha = a;
    WALL.forEach(([c, r, kind, seed]) => { x.save(); x.translate(c * (TW + GAPX), r * (TH + GAPY)); tile(x, kind, seed, t); x.restore(); });
    x.restore();
  }

  const FOCUS = [X(.62), Y(.62)];
  const CH0 = PORT ? [W * .5 - 230, H * .74] : [W - 96 - 420, 70];
  const S_IN = PORT ? 2.3 : 3.2, S_WALL = PORT ? .34 : .42, IN_AT = [W / 2 + (FOCUS[0] - cw / 2) * (PORT ? 2.3 : 3.2), H * (PORT ? .47 : .5)], WALL_AT = [W / 2 + (FOCUS[0] - cw / 2) * S_WALL, H * .42];
  const PUSH = [T.s23 - .75, T.s23 + .6], BACK = [T.s24 + .1, T.everywhere - .2];
  function chartT(t) {
    const base = { s: 1, sx: CH0[0] + FOCUS[0], sy: CH0[1] + FOCUS[1] };
    let s = 1, sx = base.sx, sy = base.sy;
    if (t > PUSH[0]) { const u = easeIO(clamp((t - PUSH[0]) / (PUSH[1] - PUSH[0]))); s = Math.pow(S_IN, u); sx = lerp(base.sx, IN_AT[0], u); sy = lerp(base.sy, IN_AT[1], u); }
    if (t > PUSH[1]) s *= lerp(1, 1.05, smooth((t - PUSH[1]) / (BACK[0] - PUSH[1])));
    if (t > BACK[0]) { const u = easeIO(clamp((t - BACK[0]) / (BACK[1] - BACK[0]))), s0 = S_IN * 1.05; s = s0 * Math.pow(S_WALL / s0, u); sx = lerp(IN_AT[0], WALL_AT[0], u); sy = lerp(IN_AT[1], WALL_AT[1], u); }
    if (t > BACK[1]) s *= lerp(1, .985, smooth((t - BACK[1]) / 1));
    return { s, ox: sx - s * FOCUS[0], oy: sy - s * FOCUS[1] };
  }
  function mcam(t) {
    const u = easeIO(clamp((t - PUSH[0]) / (PUSH[1] - PUSH[0])));
    return { x: MAP_END.x + u * 180, y: MAP_END.y - u * 120, z: MAP_END.z * lerp(1, 1.45, u) };
  }
  const WALL_IN = [BACK[0] - .05, BACK[0] + .7];
  const TITLE = [T.cobra - .02, T.cobra + .3];

  function draw(ctx, t) {
    const wa = smooth((t - WALL_IN[0]) / (WALL_IN[1] - WALL_IN[0]));
    L.background(ctx);
    if (wa < 1) {
      L.sheet(ctx, mcam(t), 1, [0, 0], x => MAP.draw(x, P, { snakes: i => gone(i) ? 0 : 1, more: more(t), t: M_pose(t) }), { alpha: 1 - wa });
      const veil = .5 * smooth((t - PUSH[0]) / (PUSH[1] - PUSH[0])) * (1 - wa);
      if (veil > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = F.rgba(F.hex(P.bgTop), veil); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    }
    const c = chartT(t);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      x.save(); x.translate(c.ox, c.oy); x.scale(c.s, c.s);
      wall(x, t, wa);
      chart(x, t);
      x.restore();
    }, { flatShadow: [10, 14, 12, .4] });
    const k = smooth((t - TITLE[0]) / (TITLE[1] - TITLE[0]));
    if (k > 0) L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      const band = x.createLinearGradient(0, H * .7, 0, H); band.addColorStop(0, F.rgba(F.hex(P.bgTop), 0)); band.addColorStop(.45, F.rgba(F.hex(P.bgTop), .72 * k)); band.addColorStop(1, F.rgba(F.hex(P.bgTop), .8 * k));
      x.fillStyle = band; x.fillRect(0, H * .7, W, H * .3);
      const size = PORT ? 92 : 112, sc = lerp(1.12, 1, easeIO(k));
      x.save(); x.translate(W / 2, H * (PORT ? .87 : .86)); x.scale(sc, sc); x.globalAlpha = k;
      x.font = `900 ${size}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = P.cream; x.fillText('THE COBRA EFFECT', 0, 0);
      x.restore();
    }, { flatShadow: [6, 8, 10, .5] });
    L.grade(ctx, t);
  }
  const M_pose = t => F.motion.pose(t);

  F.scene('seq-07', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { chartT, mcam, chart, tile, CURVE } });
})();
