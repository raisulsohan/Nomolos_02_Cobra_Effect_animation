(function () {
  'use strict';
  const F = FILM, { TAU, clamp, smooth, lerp, hash } = F, mix = F.city.mix, PR = F.props;
  const HN = (F.hanoi = {});

  HN.cast = P => ({
    resident: { coat: '#ece6d6', trouser: '#e2dac6', skin: '#e2c09c', head: 'topi', headColor: '#e9dcbc', moustache: '#6b4a32', hair: '#6b4a32', shoe: mix(P.wood, P.ink, .45), shadow: 0 },
    engineer: { coat: '#e8e2d2', trouser: '#dcd4c0', skin: '#e0bd98', head: 'bare', hair: '#4a3a2c', moustache: '#4a3a2c', shoe: mix(P.wood, P.ink, .45), shadow: 0 },
    clerk: { coat: '#9aa6a8', trouser: '#3d4046', skin: '#dcb996', head: 'bare', hair: '#3a2c22', shoe: mix(P.wood, P.ink, .5), shadow: 0 },
    catcher: { coat: '#7a5a3e', trouser: '#3e3a36', skin: '#b98a60', head: 'bare', hair: '#1f1a17', shoe: mix(P.wood, P.ink, .5), shadow: 0 },
  });
  HN.ratCol = P => mix(P.ink, P.sheetDim, .32);
  HN.GREEN = '#9fb83a';

  const RIVER = [[-2700, -980], [-1500, -900], [-600, -840], [250, -700], [850, -470], [1230, -110], [1400, 360], [1640, 860], [2700, 1400]];
  const r1 = F.rng(1902);
  const OLD = [];
  for (let gy = -620; gy < -110; gy += 44) for (let gx = -760; gx < 260; gx += 40) {
    if (Math.hypot(gx + 40, gy + 60) < 150) continue;
    OLD.push([gx + (r1() - .5) * 8, gy + (r1() - .5) * 8, 28 + r1() * 12, 30 + r1() * 12, r1()]);
  }
  const FR = [];
  for (let gy = 140; gy < 760; gy += 150) for (let gx = 140; gx < 1180; gx += 170) FR.push([gx, gy, r1()]);
  const VILLAS = FR.filter(b => b[2] < .55).map(b => [b[0] + 20 + b[2] * 60, b[1] + 22, 40 + b[2] * 26, 30 + b[2] * 14]);
  HN.PALACE = [-560, 140];
  function ratMark(x, P, cx, cy, a, k) {
    if (k <= 0) return;
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(k, k);
    x.fillStyle = P.ink; x.beginPath(); x.ellipse(0, 0, 11, 6, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(10, 0, 6, 4, 0, 0, TAU); x.fill();
    x.strokeStyle = P.ink; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, 0); x.quadraticCurveTo(-20, 6, -26, 0); x.stroke();
    x.restore();
  }
  HN.map = (x, P, o = {}) => {
    const land = mix(P.sheet, P.sheetShade, .42), street = mix(P.sheet, P.cream, .35);
    x.fillStyle = land; x.fillRect(-3000, -2000, 6000, 4000);
    x.lineCap = 'round'; x.lineJoin = 'round';
    const path = () => { x.beginPath(); RIVER.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); };
    x.strokeStyle = mix(P.glass, land, .35); path(); x.lineWidth = 300; x.stroke();
    x.strokeStyle = P.glass; path(); x.lineWidth = 240; x.stroke();
    x.strokeStyle = mix(P.glass, P.cream, .35); path(); x.lineWidth = 6; x.stroke();
    x.fillStyle = mix(land, P.cream, .25); x.beginPath(); x.ellipse(1160, -150, 38, 170, -.5, 0, TAU); x.fill();
    x.strokeStyle = mix(land, P.ink, .25); x.lineWidth = 10; x.beginPath(); RIVER.forEach((p, i) => (i ? x.lineTo : x.moveTo).call(x, p[0] - 150, p[1] + 150)); x.stroke();
    x.save(); x.translate(-1250, -300); x.rotate(-.06);
    x.strokeStyle = mix(land, P.ink, .4); x.lineWidth = 12; x.strokeRect(-230, -230, 460, 460);
    for (const [bx, by] of [[-230, -230], [230, -230], [230, 230], [-230, 230]]) { x.fillStyle = mix(land, P.ink, .4); x.beginPath(); x.moveTo(bx, by - 34); x.lineTo(bx + 34, by); x.lineTo(bx, by + 34); x.lineTo(bx - 34, by); x.fill(); }
    x.fillStyle = mix(P.wall, P.roof, .3); x.fillRect(-40, -60, 80, 120);
    x.restore();
    x.fillStyle = street; x.fillRect(-790, -650, 1080, 560);
    for (const [bx, by, bw, bh, s] of OLD) { x.fillStyle = mix(P.wall, P.roof, .2 + s * .55); x.fillRect(bx, by, bw, bh); }
    x.fillStyle = street; x.fillRect(100, 100, 1140, 700);
    for (const [bx, by, s] of FR) {
      x.fillStyle = mix(land, P.cream, .12); x.fillRect(bx, by, 150, 130);
      x.fillStyle = mix('#6f8a62', land, .35);
      for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(bx + 10 + k * 32, by + 8, 7, 0, TAU); x.arc(bx + 10 + k * 32, by + 122, 7, 0, TAU); x.fill(); }
    }
    x.save(); x.translate(-40, 40); x.rotate(.12);
    x.fillStyle = mix(land, P.ink, .12); x.beginPath(); x.ellipse(0, 0, 118, 214, 0, 0, TAU); x.fill();
    x.fillStyle = P.glass; x.beginPath(); x.ellipse(0, 0, 104, 200, 0, 0, TAU); x.fill();
    x.fillStyle = land; x.beginPath(); x.ellipse(-8, 30, 12, 9, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(20, -150, 16, 12, 0, 0, TAU); x.fill();
    x.strokeStyle = land; x.lineWidth = 5; x.beginPath(); x.moveTo(20, -150); x.quadraticCurveTo(50, -170, 96, -178); x.stroke();
    x.restore();
    const fr = o.french ?? 1;
    const block = (bx, by, bw, bh, k, col) => {
      if (k <= 0) return; const s = F.easeOutBack(clamp(k), 2.2), up = 14 * s;
      x.fillStyle = F.rgba(F.hex(P.ink), .25 * clamp(k)); x.fillRect(bx + up * .9, by + up * .9, bw, bh);
      x.fillStyle = mix(col, P.ink, .2); x.fillRect(bx, by - up + bh, bw, up);
      x.fillStyle = col; x.fillRect(bx, by - up, bw, bh);
      x.fillStyle = mix(col, P.roof, .45); x.fillRect(bx + bw * .15, by - up + bh * .15, bw * .7, bh * .18);
    };
    VILLAS.forEach((v, i) => block(v[0], v[1], v[2], v[3], clamp((fr - i / VILLAS.length * .6) / .4), P.cream));
    const [px, py] = HN.PALACE, pk = clamp(fr * 1.6);
    x.fillStyle = mix(land, P.cream, .3); x.fillRect(px - 150, py - 110, 300, 250);
    block(px - 90, py - 45, 180, 70, pk, P.cream); block(px - 30, py - 90, 60, 60, clamp(pk * 1.2 - .2), mix(P.cream, P.amber, .12));
    for (const r of (o.rats || [])) ratMark(x, P, r[0], r[1], r[2], r[3]);
  };
  HN.ratMark = ratMark;

  const SEC = (HN.SEC = { x0: -1700, x1: 1700, main: { y0: 250, y1: 450 }, low: { y0: 640, y1: 770 }, houses: [], shafts: [-1050, -150, 900], hero: 0, plaque: [260, 330] });
  { let xx = SEC.x0, i = 0; while (xx < SEC.x1) { const w = 250 + hash(i, 31) * 70, h = 290 + hash(i, 32) * 120; SEC.houses.push({ x: xx + w / 2, w, h }); xx += w + 8; i++; } }
  SEC.hero = SEC.houses.findIndex(h => h.x > 520);
  SEC.pipeX = i => SEC.houses[i].x + SEC.houses[i].w * .3;
  HN.house = (x, P, hs, i, o = {}) => {
    const { x: cx, w, h } = hs, l = cx - w / 2, lit = o.lit ? o.lit(i) : 0;
    const wall = mix(P.wall, P.roof, hash(i, 33) * .25), back = mix(wall, P.ink, .2);
    x.fillStyle = wall; x.fillRect(l, -h, w, h);
    x.fillStyle = back; x.fillRect(l + 12, -h + 14, w - 24, h / 2 - 20); x.fillRect(l + 12, -h / 2 + 8, w - 24, h / 2 - 8);
    x.fillStyle = P.roof; x.beginPath(); x.moveTo(l - 14, -h + 4); x.lineTo(cx - w * .18, -h - 58); x.lineTo(cx + w * .18, -h - 58); x.lineTo(l + w + 14, -h + 4); x.closePath(); x.fill();
    x.strokeStyle = mix(P.roof, P.ink, .3); x.lineWidth = 2; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(l - 14 + k * 5, -h + 4 - k * 14); x.lineTo(l + w + 14 - k * 5, -h + 4 - k * 14); x.stroke(); }
    for (const fy of [-h + 40, -h / 2 + 30]) for (const u of [.3, .7]) {
      x.fillStyle = lit > 0 ? mix(mix(back, P.ink, .3), P.window, lit) : mix(back, P.ink, .3); x.fillRect(l + w * u - 17, fy, 34, 46);
      x.strokeStyle = mix(wall, P.ink, .35); x.lineWidth = 3; x.beginPath(); x.moveTo(l + w * u, fy); x.lineTo(l + w * u, fy + 46); x.stroke();
    }
    x.fillStyle = mix(wall, P.ink, .35); x.fillRect(l, -h / 2 - 2, w, 10);
    x.fillStyle = mix(wall, P.ink, .25); x.fillRect(l, -h, 12, h); x.fillRect(l + w - 12, -h, 12, h);
  };
  HN.family = (x, P, hs, o = {}) => {
    const { x: cx, w } = hs, l = cx - w / 2;
    x.fillStyle = mix(P.wood, P.cream, .3); x.fillRect(l + 22, -12, w * .62, 10);
    const blanket = mix(P.coat2, P.cream, .15);
    [[.2, 1], [.4, .92], [.58, .7]].forEach(([u, s], k) => {
      const bx = l + 30 + u * w * .6, by = -12;
      x.fillStyle = blanket; x.beginPath(); x.ellipse(bx, by - 8 * s, 34 * s, 11 * s, 0, Math.PI, 0); x.fill();
      x.fillStyle = mix(P.skin, P.ink, .1); x.beginPath(); x.arc(bx - 38 * s, by - 7 * s, 7 * s, 0, TAU); x.fill();
      x.fillStyle = P.hairDark || mix(P.ink, P.coat2, .2); x.beginPath(); x.arc(bx - 40 * s, by - 9 * s, 6 * s, Math.PI * .6, Math.PI * 1.7); x.fill();
    });
    x.fillStyle = P.ink; x.fillRect(SEC.pipeX(SEC.hero) - 16, -3, 32, 5);
  };
  HN.LAMP = () => { const hs = SEC.houses[SEC.hero]; return [hs.x - hs.w * .1, -26]; };
  HN.lamp = (x, P, lit = 1) => { const [lx, ly] = HN.LAMP(); HN.lampAt(x, P, lx, ly, 1, lit); };
  HN.lampAt = (x, P, lx, ly, s = 1, lit = 1) => {
    x.save(); x.translate(lx, ly); x.scale(s, s); x.translate(-lx, -ly);
    x.fillStyle = mix(P.amberDark, P.wood, .3); x.beginPath(); x.ellipse(lx, ly + 20, 13, 6, 0, 0, TAU); x.fill(); x.fillRect(lx - 3, ly + 6, 6, 14);
    x.fillStyle = mix(P.lampGlass, P.cream, 1 - lit); x.beginPath(); x.ellipse(lx, ly, 5, 9, 0, 0, TAU); x.fill();
    x.restore();
  };
  HN.section = (x, P, o = {}) => {
    const d = o.draw ?? 1, soil = o.look === 'lightbox' ? mix(P.sheet2, P.ink, .3) : mix(P.sheetShade, P.ink, .12);
    x.fillStyle = soil; x.fillRect(SEC.x0 - 400, 0, SEC.x1 - SEC.x0 + 800, 1400);
    x.strokeStyle = mix(soil, P.ink, .12); x.lineWidth = 3;
    for (let k = 0; k < 6; k++) { x.beginPath(); for (let px = SEC.x0 - 400; px <= SEC.x1 + 400; px += 100) x.lineTo(px, 120 + k * 190 + Math.sin(px * .004 + k) * 14); x.stroke(); }
    x.fillStyle = mix(P.sheetDim, P.ink, .2); x.fillRect(SEC.x0 - 400, -8, SEC.x1 - SEC.x0 + 800, 12);
    SEC.houses.forEach((hs, i) => HN.house(x, P, hs, i, o));
    if (o.hero) HN.family(x, P, SEC.houses[SEC.hero]);
    if (d <= 0) return;
    const line = o.look === 'flat' ? mix(P.cream, P.sheetShade, .15) : mix(P.rim, P.sheet, .3), dark = mix(P.ink, P.sheet2, .35), brick = mix(soil, P.roof, .55);
    const span = (y0, y1, k, pad) => {
      if (k <= 0) return; const hw = (SEC.x1 - SEC.x0) / 2 * k + pad, c = (SEC.x0 + SEC.x1) / 2;
      x.fillStyle = brick; x.fillRect(c - hw, y0 - 18, hw * 2, y1 - y0 + 36);
      x.fillStyle = dark; x.fillRect(c - hw, y0, hw * 2, y1 - y0);
      x.strokeStyle = mix(brick, P.ink, .25); x.lineWidth = 2;
      for (let yy = y0 - 12; yy < y0; yy += 6) { x.beginPath(); x.moveTo(c - hw, yy); x.lineTo(c + hw, yy); x.stroke(); }
      x.strokeStyle = mix(dark, brick, .45); x.lineWidth = 5;
      for (let px = Math.ceil((c - hw) / 140) * 140; px < c + hw; px += 140) { x.beginPath(); x.moveTo(px - 60, y1); x.quadraticCurveTo(px - 60, y0 + 6, px, y0 + 6); x.quadraticCurveTo(px + 60, y0 + 6, px + 60, y1); x.stroke(); }
      x.fillStyle = mix(dark, P.glass, .35); x.fillRect(c - hw, y1 - 16, hw * 2, 10);
      x.fillStyle = mix(brick, P.ink, .15); x.fillRect(c - hw, y1 - 6, hw * 2, 6);
      x.strokeStyle = line; x.lineWidth = 3; x.beginPath(); x.moveTo(c - hw, y0); x.lineTo(c + hw, y0); x.moveTo(c - hw, y1); x.lineTo(c + hw, y1); x.stroke();
    };
    span(SEC.main.y0, SEC.main.y1, clamp(d / .4), 0);
    span(SEC.low.y0, SEC.low.y1, clamp((d - .25) / .4), 0);
    const pipe = (px, y0, y1, k, wd) => {
      if (k <= 0) return; const yy = lerp(y0, y1, k);
      x.fillStyle = brick; x.fillRect(px - wd / 2 - 7, y0, wd + 14, yy - y0);
      x.fillStyle = dark; x.fillRect(px - wd / 2, y0, wd, yy - y0);
      x.strokeStyle = line; x.lineWidth = 2.5; x.beginPath(); x.moveTo(px - wd / 2, y0); x.lineTo(px - wd / 2, yy); x.moveTo(px + wd / 2, y0); x.lineTo(px + wd / 2, yy); x.stroke();
    };
    SEC.shafts.forEach((px, i) => pipe(px, SEC.main.y1, SEC.low.y0, clamp((d - .45 - i * .05) / .2), 60));
    const n = SEC.houses.length, order = SEC.houses.map((_, i) => i).sort((a, b) => Math.abs(SEC.houses[a].x) - Math.abs(SEC.houses[b].x));
    order.forEach((i, r) => pipe(SEC.pipeX(i), 2, SEC.main.y0, clamp((d - .5 - r * .45 / n) / .12), 26));
  };
  HN.plaque = (x, P, cx, cy) => {
    const b = mix(P.amberDark, P.wood, .25);
    x.fillStyle = mix(b, P.ink, .3); x.fillRect(cx - 44, cy - 28, 88, 56);
    x.fillStyle = b; x.fillRect(cx - 40, cy - 25, 80, 50);
    x.fillStyle = mix(b, P.ink, .45); x.fillRect(cx - 28, cy - 14, 56, 5); for (const yy of [-2, 7, 14]) x.fillRect(cx - 30, cy + yy, 60, 3);
  };

  HN.rat = (x, P, o = {}) => {
    const s = o.s || 1, dir = o.dir || 1, ph = o.ph || 0, run = o.run ?? 1, sit = clamp(o.sit || 0), limp = clamp(o.limp || 0);
    const col = o.col || HN.ratCol(P), tl = o.tail ?? 1;
    x.save(); x.translate(o.x || 0, o.y || 0); x.scale(dir * s, s);
    if (limp > 0) { x.translate(0, -4 * limp); x.rotate(Math.PI * limp); x.translate(0, 4 * limp); }
    const bob = run * Math.abs(Math.sin(ph)) * 1.6;
    x.translate(0, -bob);
    x.rotate(-sit * 1.05);
    const tip = [-12 - 30 * tl, -3 + Math.sin(ph * .5 + 1) * 3 * run];
    x.strokeStyle = mix(col, P.skin, .45); x.lineCap = 'round';
    if (tl > .05) { x.lineWidth = 2.6; x.beginPath(); x.moveTo(-11, -6); x.quadraticCurveTo(-14 - 12 * tl, 2, tip[0], tip[1]); x.stroke(); }
    else { x.lineWidth = 3.4; x.beginPath(); x.moveTo(-11, -6); x.lineTo(-14, -5); x.stroke(); }
    x.strokeStyle = mix(col, P.ink, .25); x.lineWidth = 2.6;
    const leg = (hx, a) => { x.beginPath(); x.moveTo(hx, -4); x.lineTo(hx + Math.sin(a) * 4 * run, 0); x.stroke(); };
    if (sit < .5) { leg(-7, ph); leg(6, ph + Math.PI); leg(-5, ph + Math.PI); leg(8, ph); }
    x.fillStyle = col; x.beginPath(); x.ellipse(-1, -8, 12.5, 7, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(8, -13); x.quadraticCurveTo(16, -12.5, 21, -8); x.quadraticCurveTo(15, -4.5, 7, -4); x.closePath(); x.fill();
    x.fillStyle = mix(col, P.skin, .5); x.beginPath(); x.arc(21, -8, 1.4, 0, TAU); x.fill();
    x.fillStyle = mix(col, P.skin, .3); x.beginPath(); x.ellipse(8, -15, 3.2, 4, -.3, 0, TAU); x.fill();
    if (limp < .5) { x.fillStyle = o.eyes > 0 ? mix(P.ink, P.amber, o.eyes) : P.ink; x.beginPath(); x.arc(14, -10, o.eyes > 0 ? 1.7 : 1.2, 0, TAU); x.fill(); }
    x.strokeStyle = mix(col, P.cream, .4); x.lineWidth = .8; x.beginPath(); x.moveTo(20, -8); x.lineTo(27, -11); x.moveTo(20, -8); x.lineTo(27, -6); x.stroke();
    x.restore();
  };
  HN.tail = (x, P, cx, cy, len, a, w = 2.6) => {
    x.save(); x.translate(cx, cy); x.rotate(a);
    x.strokeStyle = mix(HN.ratCol(P), P.skin, .45); x.lineWidth = w; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * .45, len * .12, len, 0); x.stroke();
    x.restore();
  };

  HN.scissors = (x, P, o = {}) => {
    const s = o.s || 1, op = clamp(o.open ?? .5) * .5, steel = mix(P.sheetDim, P.cream, .35), dark = mix(steel, P.ink, .45);
    x.save(); x.translate(o.x || 0, o.y || 0); x.rotate(o.a || 0); x.scale(s, s);
    for (const sg of [-1, 1]) {
      x.save(); x.rotate(sg * op);
      x.fillStyle = steel; x.beginPath(); x.moveTo(0, -3 * sg); x.lineTo(64, -1 * sg); x.lineTo(64, 1 * sg); x.lineTo(0, 3 * sg); x.closePath(); x.fill();
      x.strokeStyle = dark; x.lineWidth = 5; x.beginPath(); x.ellipse(-20, 7 * sg, 12, 8, 0, 0, TAU); x.stroke();
      x.restore();
    }
    x.fillStyle = dark; x.beginPath(); x.arc(0, 0, 3, 0, TAU); x.fill();
    x.restore();
  };

  HN.poster = (x, P, look, o) => {
    const { w, h } = o, paper = mix(P.card, P.parchment, .35), ink = P.ink, fall = clamp(o.fall || 0), cut = clamp(o.cut || 0);
    x.save();
    x.fillStyle = paper; x.fillRect(-w / 2, -h / 2, w, h);
    x.strokeStyle = mix(paper, ink, .55); x.lineWidth = w * .012; x.strokeRect(-w / 2 + w * .04, -h / 2 + w * .04, w - w * .08, h - w * .08);
    x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${h * .15}px NSC`; x.fillText('REWARD', 0, -h * .22);
    for (const [ry, rw] of [[.33, .64], [.39, .7]]) { x.strokeStyle = mix(paper, ink, .7); x.lineWidth = h * .016; x.beginPath(); x.moveTo(-rw * w / 2, ry * h); x.lineTo(rw * w / 2, ry * h); x.stroke(); }
    const rk = clamp(o.rat ?? 1);
    if (rk > 0) {
      x.globalAlpha = smooth(rk);
      const rs = h * .0105, rx = -w * .18, ry = h * .13;
      HN.tail(x, P, rx - 12 * rs, ry - 5 * rs, 30 * rs, .05, rs * 2.4);
      x.save(); x.translate(0, fall * h * .9); x.rotate(fall * .5); x.globalAlpha = smooth(rk) * (1 - smooth((fall - .5) / .45));
      HN.rat(x, P, { x: rx, y: ry, s: rs, run: 0, tail: 0, col: ink });
      x.restore();
      if (cut > 0 && fall < 1) { x.strokeStyle = paper; x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(rx - 12 * rs, ry - 10 * rs); x.lineTo(rx - 12 * rs + cut * 40 * rs, ry - 13 * rs); x.stroke(); x.setLineDash([]); }
      x.strokeStyle = ink; x.lineWidth = h * .012; x.beginPath(); x.moveTo(w * .06, h * .1); x.lineTo(w * .15, h * .1); x.moveTo(w * .12, h * .08); x.lineTo(w * .15, h * .1); x.lineTo(w * .12, h * .12); x.stroke();
      x.globalAlpha = 1;
    }
    if (o.coin > 0) PR.coin(x, P, look, w * .27, h * .1, h * .08 * smooth(o.coin), 0);
    x.restore();
  };

  HN.abacus = (x, P, cx, cy, s, slide = 0) => {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    const wood = P.wood, bead = mix(P.woodDark, P.roof, .4);
    x.fillStyle = wood; x.fillRect(-90, -50, 180, 10); x.fillRect(-90, 40, 180, 10); x.fillRect(-90, -50, 10, 100); x.fillRect(80, -50, 10, 100);
    x.fillStyle = mix(wood, P.ink, .25); x.fillRect(-80, -20, 160, 4);
    for (let r = 0; r < 5; r++) {
      const yy = -32 + r * 17 + (r > 0 ? 6 : 0);
      x.strokeStyle = mix(P.sheetDim, P.ink, .3); x.lineWidth = 1.5; x.beginPath(); x.moveTo(-80, yy); x.lineTo(80, yy); x.stroke();
      for (let b = 0; b < 5; b++) { const moved = r === 3 && b === 4 ? slide : 0; const bx = -70 + b * 13 + moved * 90 + (b < 2 ? 70 : 0); x.fillStyle = bead; x.beginPath(); x.ellipse(bx, yy, 6.5, 5.5, 0, 0, TAU); x.fill(); }
    }
    x.restore();
  };
})();
