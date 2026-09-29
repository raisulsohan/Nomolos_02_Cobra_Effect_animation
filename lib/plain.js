(function () {
  'use strict';
  const F = FILM, { TAU, clamp, lerp, hash } = F, PR = F.props, mix = F.city.mix;
  const PL = (F.plain = {});
  PL.SHADOW = [Math.cos(.62), Math.sin(.62), 26];

  PL.ground = (x, P, o) => {
    const g = x.createLinearGradient(0, o.top, 0, o.top + 1400);
    g.addColorStop(0, mix(P.sheet, P.sheetShade, .15)); g.addColorStop(1, mix(P.sheet, P.sheetShade, .55));
    x.fillStyle = g; x.beginPath(); x.roundRect(o.x0, o.top, o.x1 - o.x0, o.y1 - o.top, 40); x.fill();
    x.fillStyle = mix(P.sheet, P.rim, .2); x.fillRect(o.x0 + 30, o.top + 3, o.x1 - o.x0 - 60, 4);
    for (let k = 0; k < 900; k++) {
      const X = o.x0 + 40 + hash(k, 81) * (o.x1 - o.x0 - 80), Y = o.top + 30 + hash(k, 82) * (o.y1 - o.top - 60);
      x.fillStyle = hash(k, 83) < .7 ? mix(P.sheet, '#8f9a6a', .35 + hash(k, 84) * .2) : mix(P.sheet, P.ink, .12);
      x.fillRect(X, Y, 5 + hash(k, 85) * 8, 2);
    }
    for (let k = 0; k < 26; k++) {
      const X = o.x0 + 80 + hash(k, 86) * (o.x1 - o.x0 - 160), Y = o.top + 60 + hash(k, 87) * (o.y1 - o.top - 120), r = 9 + hash(k, 88) * 9;
      if (o.clear && o.clear(X, Y, r)) continue;
      x.fillStyle = 'rgba(40,36,30,.16)'; x.beginPath(); x.ellipse(X + PL.SHADOW[0] * r, Y + PL.SHADOW[1] * r, r * 1.3, r * .8, .62, 0, TAU); x.fill();
      x.fillStyle = mix('#6f7a5a', P.sheet, .15); x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill();
      x.fillStyle = mix('#6f7a5a', P.rim, .25); x.beginPath(); x.arc(X - r * .3, Y - r * .3, r * .45, 0, TAU); x.fill();
    }
  };

  PL.shadow = (x, P, o) => {
    const s = o.s || 1, L = PL.SHADOW[2] * s;
    x.fillStyle = 'rgba(38,32,26,.2)';
    x.beginPath(); x.ellipse(o.x + PL.SHADOW[0] * L * .5, o.y + PL.SHADOW[1] * L * .5, L * .55, 4.2 * s, .62, 0, TAU); x.fill();
  };

  PL.person = (x, P, o) => {
    const s = o.s || 1, run = clamp(o.run || 0), ph = o.ph || 0, lk = o.look || {};
    const coat = lk.coat || P.coat, hair = lk.headColor || lk.hair || '#2a211c';
    x.save(); x.translate(o.x, o.y); x.rotate(o.h || 0); x.scale(s, s);
    if (run > 0) {
      const f = Math.sin(ph) * 6.5 * run;
      x.fillStyle = mix(P.ink, P.wood, .3);
      x.beginPath(); x.ellipse(f, -3, 3.2, 1.9, 0, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(-f, 3, 3.2, 1.9, 0, 0, TAU); x.fill();
    }
    const sw = Math.sin(ph) * 4.2 * run;
    x.fillStyle = mix(coat, P.ink, .22);
    x.beginPath(); x.ellipse(-sw * .9 + .5, -7.2, 3, 2.2, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(sw * .9 + .5, 7.2, 3, 2.2, 0, 0, TAU); x.fill();
    x.fillStyle = coat; x.beginPath(); x.ellipse(0, 0, 4.4, 7.4, 0, 0, TAU); x.fill();
    x.fillStyle = mix(coat, P.rim, .22); x.beginPath(); x.ellipse(-1, -2.2, 2.4, 4, 0, 0, TAU); x.fill();
    x.fillStyle = hair; x.beginPath(); x.arc(1.2, 0, 3.7, 0, TAU); x.fill();
    x.fillStyle = mix(hair, P.rim, .25); x.beginPath(); x.arc(.4, -1.1, 1.4, 0, TAU); x.fill();
    x.restore();
  };

  PL.arrow = (x, P, o) => {
    const u = clamp(o.u ?? 1); if (u <= 0) return;
    const { x0, x1, y, w, hw, hl } = o, xl = lerp(x0, x1, u), col = o.col || mix(P.sheet2, P.ink, .25);
    x.save();
    x.beginPath(); x.rect(x0 - 2, y - hw, xl - x0 + 2, hw * 2); x.clip();
    x.fillStyle = col; x.beginPath();
    x.moveTo(x0, y - w / 2); x.lineTo(x1 - hl, y - w / 2); x.lineTo(x1 - hl, y - hw / 2); x.lineTo(x1, y); x.lineTo(x1 - hl, y + hw / 2); x.lineTo(x1 - hl, y + w / 2); x.lineTo(x0, y + w / 2); x.closePath(); x.fill();
    x.fillStyle = mix(col, P.rim, .18); x.fillRect(x0, y - w / 2, x1 - hl - x0, 3);
    x.restore();
    if (u < 1) {
      const r = 5 + 9 * Math.sqrt(1 - u);
      x.fillStyle = 'rgba(38,32,26,.22)'; x.beginPath(); x.roundRect(xl - r + 4, y - hw / 2 + 5, r * 2, hw, r); x.fill();
      x.fillStyle = mix(col, P.ink, .15); x.beginPath(); x.roundRect(xl - r, y - hw / 2, r * 2, hw, r); x.fill();
      x.fillStyle = mix(col, P.rim, .3); x.fillRect(xl - r * .6, y - hw / 2 + 2, r * .5, hw - 4);
    }
  };

  PL.coin = (x, P, o) => {
    const tilt = clamp(o.tilt || 0);
    x.save(); x.translate(o.x, o.y); x.rotate(o.rot || 0);
    x.fillStyle = 'rgba(38,32,26,.24)'; x.beginPath(); x.ellipse(PL.SHADOW[0] * (3 + tilt * 10), PL.SHADOW[1] * (3 + tilt * 10), o.r, o.r * lerp(1, .3, tilt), 0, 0, TAU); x.fill();
    PR.coin(x, P, 'flat', 0, 0, o.r, tilt * .8);
    x.restore();
  };
})();
