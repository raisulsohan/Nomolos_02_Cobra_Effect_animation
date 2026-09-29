(function () {
  'use strict';
  const F = FILM, { TAU, clamp, smooth, lerp, rng } = F, PR = F.props, mix = F.city.mix;

  const MONEY = { paper: '#b3aa45', flat: '#cbbf57', lightbox: '#e2d36e' };
  PR.money = look => MONEY[look] || MONEY.paper;

  PR.coin = (x, P, look, cx, cy, r, tilt = 0) => {
    const m = PR.money(look), ry = r * lerp(1, .22, tilt);
    if (tilt > 0) { x.fillStyle = mix(m, P.ink, .35); x.beginPath(); x.ellipse(cx, cy + r * .14 * tilt, r, ry, 0, 0, TAU); x.fill(); }
    x.fillStyle = m; x.beginPath(); x.ellipse(cx, cy, r, ry, 0, 0, TAU); x.fill();
    x.strokeStyle = mix(m, P.ink, .3); x.lineWidth = Math.max(1, r * .1); x.beginPath(); x.ellipse(cx, cy, r * .74, ry * .74, 0, 0, TAU); x.stroke();
    x.fillStyle = mix(m, P.rim, .45); x.beginPath(); x.ellipse(cx - r * .3, cy - ry * .32, r * .2, ry * .14, -.5, 0, TAU); x.fill();
  };
  PR.coinStack = (x, P, look, cx, base, r, n) => {
    for (let i = 0; i < n; i++) PR.coin(x, P, look, cx + ((i * 7919) % 5 - 2) * r * .02, base - r * .22 - i * r * .2, r, 1);
  };

  PR.poster = (x, P, look, o) => {
    const { w, h } = o, paper = mix(P.card, P.parchment, .35), ink = P.ink, pr = clamp(o.print ?? 1), inkK = clamp(o.ink ?? 1);
    x.save();
    x.fillStyle = paper; x.fillRect(-w / 2, -h / 2, w, h);
    x.strokeStyle = mix(paper, ink, .55); x.lineWidth = w * .012; x.strokeRect(-w / 2 + w * .04, -h / 2 + w * .04, w - w * .08, h - w * .08);
    if (!o.bare) {
      const rows = [[-.36, .52], [-.29, .7], [.3, .64], [.36, .7], [.42, .5]];
      rows.forEach(([ry, rw], i) => {
        const k = clamp(inkK * rows.length - i); if (k <= 0) return;
        const y = ry * h, x0 = -rw * w / 2, x1 = x0 + rw * w * k;
        x.strokeStyle = mix(paper, ink, lerp(.6, .75, pr)); x.lineWidth = h * lerp(.008, .018, pr); x.lineCap = 'round'; x.beginPath();
        for (let px = x0; px <= x1; px += w * .02) x.lineTo(px, y + Math.sin(px * .35 + i) * h * .006 * (1 - pr));
        x.stroke();
      });
      if (o.reward > 0) {
        x.globalAlpha = smooth(o.reward); x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.font = `900 ${h * .15}px NSC`; x.fillText('REWARD', 0, -h * .19 + (1 - smooth(o.reward)) * h * .02); x.globalAlpha = 1;
      }
      if (o.cobra > 0) {
        x.globalAlpha = smooth(o.cobra);
        const pts = []; for (let i = 0; i < 30; i++) { const u = i / 29; pts.push([-w * .36 + u * w * .38, h * .06 + Math.sin(u * 7) * h * .025 + u * h * .03]); }
        PR.cobraBody(x, P, pts, { w: h * .035, eye: 0 });
        x.strokeStyle = ink; x.lineWidth = h * .012; x.beginPath(); x.moveTo(w * .07, h * .08); x.lineTo(w * .15, h * .08); x.moveTo(w * .12, h * .06); x.lineTo(w * .15, h * .08); x.lineTo(w * .12, h * .1); x.stroke();
        x.globalAlpha = 1;
      }
      if (o.coin > 0) { const s = smooth(o.coin); PR.coin(x, P, look, w * .27, h * .08, h * .085 * (s * 1.15 - .15 * smooth((o.coin - .5) * 2)), 0); }
    }
    if (o.stamp > 0) {
      const s = smooth(o.stamp); x.save(); x.rotate(-.22); x.globalAlpha = .88 * s; x.scale(lerp(1.3, 1, s), lerp(1.3, 1, s));
      x.strokeStyle = ink; x.lineWidth = h * .022; x.strokeRect(-w * .44, -h * .1, w * .88, h * .2);
      x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${h * .13}px NSC`; x.fillText('CANCELLED', 0, h * .008);
      x.restore();
    }
    x.restore();
  };

  PR.basket = (x, P, cx, base, s = 1, lid = 1) => {
    x.save(); x.translate(cx, base); x.scale(s, s);
    const reed = mix(P.wood, P.cream, .35), dark = mix(reed, P.ink, .25);
    x.fillStyle = reed; x.beginPath(); x.moveTo(-40, -52); x.quadraticCurveTo(-46, -8, -30, 0); x.lineTo(30, 0); x.quadraticCurveTo(46, -8, 40, -52); x.closePath(); x.fill();
    x.strokeStyle = dark; x.lineWidth = 2;
    for (let y = -46; y < 0; y += 8) { x.beginPath(); x.moveTo(-42 + (y + 46) * .05, y); x.lineTo(42 - (y + 46) * .05, y); x.stroke(); }
    for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(k * 11, -52); x.lineTo(k * 8.5, 0); x.stroke(); }
    x.fillStyle = dark; x.beginPath(); x.ellipse(0, -52, 41, 7, 0, 0, TAU); x.fill();
    if (lid < 0) { x.restore(); return; }
    x.save(); x.translate(38, -54); x.rotate(-(1 - lid) * 1.9); x.translate(-38, 0);
    x.fillStyle = reed; x.beginPath(); x.ellipse(0, -2, 43, 9, 0, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(0, -8, 30, 10, 0, Math.PI, 0); x.fill(); x.fillStyle = dark; x.beginPath(); x.arc(0, -17, 4, 0, TAU); x.fill();
    x.restore(); x.restore();
  };

  PR.tally = (x, P, look, cx, cy, s, value) => {
    x.save(); x.translate(cx, cy); x.scale(s, s);
    const brass = mix(P.amberDark, P.wood, .35), face = mix(P.card, P.cream, .3);
    x.fillStyle = mix(brass, P.ink, .25); x.beginPath(); x.roundRect(-78, -34, 156, 68, 14); x.fill();
    x.fillStyle = brass; x.beginPath(); x.roundRect(-74, -38, 148, 68, 12); x.fill();
    x.fillStyle = mix(brass, P.rim, .35); x.fillRect(-64, -34, 128, 5);
    const digits = 4, v = Math.max(0, value);
    for (let i = 0; i < digits; i++) {
      const place = Math.pow(10, digits - 1 - i), d = Math.floor(v / place) % 10, frac = (v / place) % 1, roll = i === digits - 1 ? frac : (v % place) / place > .9 ? ((v % place) / place - .9) * 10 : 0;
      const wx = -51 + i * 34;
      x.save(); x.beginPath(); x.rect(wx - 14, -26, 28, 44); x.clip();
      x.fillStyle = face; x.fillRect(wx - 14, -26, 28, 44);
      x.fillStyle = P.ink; x.font = '900 30px NSC'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(String(d), wx, -4 - roll * 44); x.fillText(String((d + 1) % 10), wx, 40 - roll * 44);
      x.restore();
    }
    x.fillStyle = mix(brass, P.ink, .35); x.beginPath(); x.arc(84, -10, 9, 0, TAU); x.fill();
    x.restore();
  };
})();
