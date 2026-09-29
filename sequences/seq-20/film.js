(function () {
  'use strict';
  const F = FILM, B = F.bits, M = F.motion, CS = F.cases, { W: FW, H: FH, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeIn, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-20'), DUR = C.duration;
  const L = F.look('flat', FW, FH), P = L.P;
  const T = { targets: 1.632, accounts: 2.956, employees: 4.845, opened: 5.768, millions: 6.104,
    customers: 7.531, number: 8.896 };
  const W = 1920, H = 1080, FLOOR = 900, PILE = [860, FLOOR], BOARD = { x: 560, y: 90, w: 600, h: 700 }, TARGET_Y = 250;
  const prog = t => easeIn(clamp((t - T.opened + .5) / (T.number - T.opened + .5)), 1.6);
  const cam = t => ({ x: W / 2 - (PORT ? 60 : 0), y: H / 2 + (PORT ? 40 : 0), z: (PORT ? .66 : 1) * lerp(1, 1.05, smooth(t / DUR)) });

  const r1 = F.rng(95), CARDS = [];
  for (let i = 0; i < 520; i++) { const v = Math.pow(r1(), .7), hgt = (FLOOR - TARGET_Y) * (1 - v) , half = 380 * v + 30; CARDS.push([PILE[0] + (r1() * 2 - 1) * half * (.3 + .7 * r1()), FLOOR - hgt * r1(), (r1() - .5) * 1.2, hgt]); }
  CARDS.sort((a, b) => b[1] - a[1]);
  function card(x, cx, cy, a, s = 1) {
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(s, s);
    x.fillStyle = mix(P.card, P.cream, .3); x.fillRect(-26, -16, 52, 32); x.strokeStyle = mix(P.card, P.ink, .35); x.lineWidth = 1.5; x.strokeRect(-26, -16, 52, 32);
    x.fillStyle = mix(P.card, P.ink, .6); x.fillRect(-18, 2, 30, 3); x.fillStyle = mix(P.amber, P.ink, .2); x.fillRect(-18, -9, 10, 7);
    x.restore();
  }
  function pile(x, t) {
    const p = prog(t), top = lerp(FLOOR, TARGET_Y, p); if (p < .01) return;
    CARDS.forEach(([cx, cy, a]) => { if (cy < top - 10) return; const sq = (FLOOR - top) / (FLOOR - TARGET_Y + 1); card(x, lerp(PILE[0], cx, clamp(sq * 1.2)), cy, a); });
  }

  const DESKS = [[240, 1], [460, 1], [1260, -1], [1480, -1]], FS = 1.9, OFFICE = { coat: '#e8e4da', trouser: '#39404c', skin: '#d4ad86', head: 'bare', hair: '#2e2622', shoe: P.ink, shadow: 0 };
  const seat = M.seatedPose(0, 24), period = t => lerp(.8, .22, prog(t));
  const at = (p, i, pt) => { const q = { ...p, arms: p.arms.slice() }; M.reach(q, i, pt); return q; };
  function stampPh(t, e) { if (t < T.employees) return 0; const u = (t - T.employees + e * .13) / period(t); return u - Math.floor(u); }
  function clerk(x, t, e) {
    const [dx, dir] = DESKS[e], tp = M.pose(t);
    x.fillStyle = mix(P.sheet2, P.cream, .25); x.fillRect(dx + dir * 40 - 70, FLOOR - 92, 140, 12); x.fillStyle = mix(P.sheet2, P.ink, .1); x.fillRect(dx + dir * 40 - 64, FLOOR - 80, 10, 80); x.fillRect(dx + dir * 40 + 54, FLOOR - 80, 10, 80);
    const ph = stampPh(t, e), up = ph < .5 ? Math.sin(ph * 2 * Math.PI) : 0;
    let p = M.idle({ base: seat, seed: 40 + e })(tp); p = at(p, 1, [38, lerp(-46, -60, up)]); p = at(p, 0, [30, -46]);
    x.save(); x.translate(dx, FLOOR); x.scale(FS, FS); const PJ = M.draw(x, P, p, { ...OFFICE, dir }); x.restore();
    const wr = PJ.arms[1].wr; x.fillStyle = P.ink; x.fillRect(dx + dir * wr[0] * FS - 7, FLOOR + wr[1] * FS - 4, 14, 14);
  }
  function flying(x, t) {
    if (t < T.employees) return;
    const p = prog(t), top = lerp(FLOOR, TARGET_Y, p);
    DESKS.forEach(([dx, dir], e) => {
      for (let k = 0; k < 40; k++) {
        const t0 = T.employees + .3 + k * lerp(.8, .22, clamp(k / 30)) - e * .13, u = (t - t0) / .5; if (u < 0 || u > 1) continue;
        const sx = dx + dir * 80, sy = FLOOR - 100, ex = PILE[0] + (hash(k, e) - .5) * 160, ey = top + 10;
        card(x, lerp(sx, ex, u), lerp(sy, ey, u) - Math.sin(u * Math.PI) * 180, u * 6 * dir, .9);
      }
    });
  }

  function room(x, t) {
    x.fillStyle = mix(P.sheet, P.sheetShade, .35); x.fillRect(-600, -400, 2700, FLOOR + 400);
    x.fillStyle = mix(P.sheetShade, P.ink, .2); x.fillRect(-600, FLOOR, 2700, 500);
    x.strokeStyle = mix(P.sheetShade, P.ink, .3); x.lineWidth = 2; for (let k = -6; k < 20; k++) { x.beginPath(); x.moveTo(k * 150, FLOOR); x.lineTo(k * 190 - 300, FLOOR + 500); x.stroke(); }
    const b = BOARD; x.fillStyle = mix(P.sheet2, P.ink, .1); x.fillRect(b.x, b.y, b.w, b.h); x.fillStyle = mix(P.sheet2, P.cream, .08); x.fillRect(b.x + 14, b.y + 14, b.w - 28, b.h - 28);
    const lk = smooth((t - T.targets) / .4);
    if (lk > 0) {
      x.save(); x.globalAlpha = lk; x.setLineDash([22, 14]); x.strokeStyle = P.amber; x.lineWidth = 6; x.beginPath(); x.moveTo(b.x - 60, TARGET_Y); x.lineTo(b.x + b.w + 60, TARGET_Y); x.stroke(); x.setLineDash([]);
      x.fillStyle = P.amber; x.font = '900 34px NSC'; x.textAlign = 'right'; x.textBaseline = 'bottom'; x.fillText('TARGET', b.x + b.w - 20, TARGET_Y - 10); x.restore();
    }
    const v = Math.round(3500000 * prog(t) / 1000) * 1000;
    x.fillStyle = mix(P.ink, P.sheet2, .3); x.fillRect(b.x + 60, b.y + 30, b.w - 120, 100);
    x.fillStyle = P.amber; x.font = '900 78px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(v.toLocaleString('en-US'), b.x + b.w / 2, b.y + 82);
    const gx = 1640;
    for (let i = 0; i < 4; i++) {
      const px = gx + 60 + i * 60, tp = M.pose(t); x.save(); x.globalAlpha = .35; x.translate(px, FLOOR); x.scale(1.9, 1.9);
      const pale = mix(P.cream, P.sheet, .3); M.draw(x, P, M.idle({ x: 0, seed: 50 + i })(tp), { coat: pale, trouser: pale, skin: pale, head: 'bare', hair: pale, shoe: pale, shadow: 0, dir: -1 }); x.restore();
    }
    x.fillStyle = F.rgba(F.hex(P.glass), .22); x.fillRect(gx, -100, 16, FLOOR + 100); x.fillRect(gx + 16, -100, 600, FLOOR + 100);
    x.fillStyle = mix(P.sheet2, P.ink, .2); x.fillRect(gx - 6, -100, 12, FLOOR + 100);
  }

  function draw(ctx, t) {
    const c = cam(t);
    L.background(ctx);
    L.sheet(ctx, c, 1, [W / 2, H / 2], x => { room(x, t); pile(x, t); for (let e = 0; e < DESKS.length; e++) clerk(x, t, e); flying(x, t); }, { flatShadow: [10, 14, 12, .35] });
    L.grade(ctx, t);
  }

  F.scene('seq-20', { W: FW, H: FH, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
