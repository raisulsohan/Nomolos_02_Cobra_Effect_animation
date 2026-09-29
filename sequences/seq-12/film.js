(function () {
  'use strict';
  const F = FILM, HN = F.hanoi, B = F.bits, M = F.motion, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO } = F, mix = F.city.mix;
  const C = F.cues('seq-12'), DUR = C.duration;
  const LF = F.look('flat', W, H), LB = F.look('lightbox', W, H), PF = LF.P, PB = LB.P;
  const SEC = HN.SEC, HERO = SEC.houses[SEC.hero];

  const T = {
    french: 2.274, rule: 4.081, and: 4.306, sewer: 7.156, city: 8.519,
    it62: C.s('S062').t0, showpiece: 9.625, it63: C.s('S063').t0, rats63: 14.824,
    pipes: C.s('S064').t0, and65: C.s('S065').t0, terrifying: 25.681, bubonic: C.s('S066').t0,
  };
  const FLIP = [T.and, T.and + 1.3];
  const DRAW = [T.sewer - .1, T.city + .6];
  const NIGHT = [T.it63 + .35, T.it63 + 2];
  const CLIMB = [T.and65 + .3, T.and65 + 1.9], OUT = CLIMB[1] + .35, WALK = [OUT, T.terrifying + .5];

  const mapCam = t => ({ x: PORT ? -60 : -80, y: PORT ? 20 : -20, z: (PORT ? .5 : .66) * lerp(1, 1.06, smooth(t / FLIP[1])) });
  const FULL = PORT ? [0, 200, .5] : [0, 140, .565];
  const ENG = [120, SEC.main.y1 - 6];
  const secCam = B.cam([
    [FLIP[0], ...FULL], [T.it62 - .1, ...FULL],
    [T.it62 + 1.4, PORT ? 210 : 230, 340, PORT ? 1.25 : 1.55],
    [T.it63 + .3, PORT ? 230 : 250, 350, PORT ? 1.3 : 1.6],
    [T.it63 + 2.1, PORT ? 430 : 460, SEC.low.y0 + 50, PORT ? 1.45 : 1.8],
    [T.pipes - .05, PORT ? 440 : 470, SEC.low.y0 + 55, PORT ? 1.48 : 1.84],
    [T.pipes + 2, ...FULL], [T.and65 + .1, FULL[0], FULL[1], FULL[2] * 1.02],
    [T.and65 + 1.9, HERO.x - 40, PORT ? -40 : -60, PORT ? 1.25 : 1.45],
    [T.bubonic, HERO.x - 60, PORT ? -60 : -90, PORT ? 1.35 : 1.62],
  ]);

  const runD = (t, t0, rise) => t < t0 ? 0 : t - t0 < rise ? (t - t0) * (t - t0) / (2 * rise) : t - t0 - rise / 2;
  const LANES = [
    { y: SEC.main.y1 - 6, dir: 1, s: 1.35, n: 26, v: 240, t0: T.pipes + .3, seed: 1 },
    { y: SEC.main.y1 - 14, dir: -1, s: 1.15, n: 22, v: 210, t0: T.pipes + .5, seed: 2 },
    { y: SEC.low.y1 - 6, dir: 1, s: 1.6, n: 24, v: 260, t0: T.pipes, seed: 3 },
    { y: SEC.low.y1 - 14, dir: -1, s: 1.35, n: 20, v: 230, t0: T.pipes + .2, seed: 4 },
  ];
  const span = SEC.x1 - SEC.x0 + 400;
  function rats(x, P, t, tp, lb) {
    LANES.forEach((ln, li) => {
      for (let i = 0; i < ln.n; i++) {
        const h1 = hash(i, ln.seed, 1), h2 = hash(i, ln.seed, 2);
        let px = SEC.x0 - 200 + (i + h1 * .6) / ln.n * span + ln.dir * ln.v * (.8 + .4 * h2) * runD(t, ln.t0, .8);
        px = ((px - (SEC.x0 - 200)) % span + span) % span + SEC.x0 - 200;
        const low = li >= 2, eye = low ? smooth((t - T.rats63 - h1 * .5) / .12) : 1;
        const body = low ? smooth((t - T.rats63 - .35 - h2 * .5) / .4) : smooth((t - T.pipes - h1 * 1.2) / .4);
        if (eye <= 0 && body <= 0) continue;
        const moving = t > ln.t0, ph = moving ? (px * .09) : 0;
        if (body < 1 && low) {
          x.fillStyle = F.rgba(F.hex(P.amber), eye * (1 - body)); const ey = ln.y - 12 * ln.s;
          x.beginPath(); x.arc(px - 3, ey, 2.4, 0, F.TAU); x.arc(px + 3, ey, 2.4, 0, F.TAU); x.fill();
        }
        if (body > 0) { x.globalAlpha = body; HN.rat(x, P, { x: px, y: ln.y, s: ln.s, dir: ln.dir, ph, run: moving ? 1 : 0, eyes: 1 }); x.globalAlpha = 1; }
      }
    });
  }

  const PX = SEC.pipeX(SEC.hero), [LX, LY] = HN.LAMP();
  function hero(t) {
    if (t < CLIMB[0]) return null;
    if (t < OUT) { const k = easeIO((t - CLIMB[0]) / (OUT - CLIMB[0])); return { x: PX, y: lerp(SEC.main.y0 + 10, 0, k), up: true, ph: t * 14 }; }
    const k = easeIO(clamp((t - WALK[0]) / (WALK[1] - WALK[0])));
    return { x: lerp(PX - 6, LX + 46, k), y: -2, up: false, ph: k < 1 ? t * 16 : 0, run: k < 1 ? 1 : 0 };
  }
  const shadowK = t => smooth((t - OUT) / (WALK[1] - OUT + .6));
  function heroRat(x, P, t) {
    const r = hero(t); if (!r) return;
    if (r.up) { x.save(); x.translate(r.x, r.y); x.rotate(-Math.PI / 2); HN.rat(x, P, { x: 0, y: 0, s: 1.3, ph: r.ph, eyes: 1 }); x.restore(); }
    else HN.rat(x, P, { x: r.x, y: r.y, s: 1.3, dir: -1, ph: r.ph, run: r.run, eyes: 1 });
  }
  function shadow(x, P, t) {
    const r = hero(t); if (!r || r.up) return;
    const k = shadowK(t), g = smooth((t - T.bubonic) / .5), l = HERO.x - HERO.w / 2 + 12, top = -HERO.h / 2 + 8;
    x.save(); x.beginPath(); x.rect(l, top, HERO.w - 24, -top - 2); x.clip();
    const m = lerp(1.3, 5.2, k), sx = LX + (r.x - LX) * lerp(1.1, .6, k), sy = lerp(-10, -34, k);
    x.globalAlpha = lerp(.35, .7, k);
    HN.rat(x, P, { x: sx, y: sy, s: 1.3 * m, dir: -1, ph: r.ph, run: r.run, col: mix(P.ink, HN.GREEN, g * .5) });
    x.restore();
  }
  const outAt = i => i === SEC.hero ? 99 : T.bubonic + .15 + Math.abs(i - SEC.hero) * .22;
  const lit = t => i => t < T.bubonic ? 1 : 1 - smooth((t - outAt(i)) / .12);

  const CAST = HN.cast(PF), ES = 1.25, idle = M.idle({ x: 0, seed: 5 });
  const pointPose = (() => { const p = M.stand(0); M.reach(p, 1, [40, -70]); return p; })();
  function engineer(x, P, t) {
    const tp = M.pose(t), k = smooth((tp - T.showpiece + .2) / .45);
    const pose = M.mixPose(idle(tp), { ...idle(tp), arms: [idle(tp).arms[0], pointPose.arms[1]] }, k);
    x.save(); x.translate(ENG[0], ENG[1]); x.scale(ES, ES);
    const PJ = M.draw(x, P, pose, CAST.engineer);
    const wr = PJ.arms[1].wr, tgt = [(SEC.plaque[0] - 44 - ENG[0]) / ES, (SEC.plaque[1] + 10 - ENG[1]) / ES];
    const a = lerp(Math.PI / 2 + .25, Math.atan2(tgt[1] - wr[1], tgt[0] - wr[0]), k);
    x.strokeStyle = mix(P.woodDark, P.ink, .3); x.lineWidth = 2.4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(wr[0] - Math.cos(a) * 6, wr[1] - Math.sin(a) * 6); x.lineTo(wr[0] + Math.cos(a) * 60, wr[1] + Math.sin(a) * 60); x.stroke();
    x.restore();
  }

  function flipScale(x, sy) { x.scale(1, Math.max(.001, sy)); }
  function draw(ctx, t) {
    const n = B.blend(t, NIGHT[0], NIGHT[1]), u = easeIO((t - FLIP[0]) / (FLIP[1] - FLIP[0]));
    if (n < 1) {
      LF.background(ctx);
      if (u < .5) LF.sheet(ctx, mapCam(t), 1, [0, 0], x => { flipScale(x, Math.cos(u * Math.PI)); HN.map(x, PF, { french: B.blend(t, T.french, T.rule + .2) }); });
      if (u > .5) LF.sheet(ctx, secCam(t), 1, [0, 0], x => {
        flipScale(x, -Math.cos(u * Math.PI));
        HN.section(x, PF, { draw: B.blend(t, DRAW[0], DRAW[1]), look: 'flat' });
        if (t > DRAW[0]) { x.globalAlpha = smooth((t - DRAW[1] + .6) / .5); HN.plaque(x, PF, SEC.plaque[0], SEC.plaque[1]); x.globalAlpha = 1; }
        if (t > DRAW[1] - .6) { x.globalAlpha = smooth((t - DRAW[1] + .6) / .5); engineer(x, PF, t); x.globalAlpha = 1; }
      }, { flatShadow: [10, 14, 12, .35] });
      B.words(LF, ctx, 'HANOI, 1902', F.env(t, 0, .35, 2.7, 3.2));
      LF.grade(ctx, t);
    }
    if (n > 0) {
      const c = secCam(t), tp = LB.pose(t);
      ctx.save(); ctx.globalAlpha = n; LB.background(ctx); ctx.restore();
      LB.sheet(ctx, c, 1, [0, 0], x => {
        HN.section(x, PB, { draw: 1, look: 'lightbox', lit: lit(t), hero: true });
        HN.plaque(x, PB, SEC.plaque[0], SEC.plaque[1]);
        shadow(x, PB, tp);
        HN.lamp(x, PB, 1);
        rats(x, PB, t, tp, true);
        heroRat(x, PB, tp);
      }, { alpha: n, glow: .55 * n });
      ctx.save(); F.sheet(ctx, c, 1, W, H, [0, 0]); ctx.globalAlpha = n;
      PR.glow(ctx, LX, LY, 150, PB.glow, .35, 'lightbox');
      ctx.restore();
      B.words(LB, ctx, 'BUBONIC PLAGUE', smooth((t - T.bubonic) / .3), { color: '#dfe7a4' });
      if (n >= 1) LB.grade(ctx, t);
    }
  }

  F.scene('seq-12', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label,
    api: { mapCam, secCam, FULL } });
})();
