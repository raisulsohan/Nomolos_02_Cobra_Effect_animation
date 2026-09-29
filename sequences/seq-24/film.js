(function () {
  'use strict';
  const F = FILM, PR = F.props, CS = F.cases, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-24'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { fix: 1.748, manufacturing: 2.383, destroy: 4.83 };
  const MX = -260, MY = 0, BELT = { y: 250, x0: -60, x1: 1400 };
  const hum = t => t < T.fix + .3 ? 0 : 1;
  function machine(x, t) {
    const sh = hum(t) * Math.sin(t * 60) * 1.6, body = mix(P.sheet2, P.cream, .18), dark = mix(P.sheet2, P.ink, .3);
    x.save(); x.translate(MX + sh, MY);
    x.fillStyle = dark; x.fillRect(-300, 250, 600, 30);
    x.fillStyle = body; x.beginPath(); x.roundRect(-280, -260, 560, 520, 26); x.fill();
    x.fillStyle = mix(body, P.ink, .12); x.fillRect(-280, 160, 560, 18);
    x.fillStyle = dark; x.beginPath(); x.moveTo(-70, -380); x.lineTo(70, -380); x.lineTo(30, -260); x.lineTo(-30, -260); x.fill();
    x.fillStyle = P.ink; x.fillRect(-40, -386, 80, 10);
    x.fillStyle = P.card; x.beginPath(); x.roundRect(-220, -190, 250, 250, 16); x.fill();
    CS.cobraCurve(x, P, { x: -200, y: -150, w: 210, h: 150, width: 12 });
    x.fillStyle = P.ink; x.beginPath(); x.arc(-200 + .92 * 210, -150 + (1 - .86) * 150 - 6, 16, 0, TAU); x.fill();
    x.strokeStyle = P.ink; x.lineWidth = 14; x.lineCap = 'round'; x.beginPath(); x.moveTo(-200, -170); x.lineTo(10, 40); x.moveTo(10, -170); x.lineTo(-200, 40); x.stroke();
    for (let i = 0; i < 3; i++) { const on = hum(t) && ((t * 3 + i * .33) % 1) < .5; x.fillStyle = on ? P.amber : mix(P.amber, P.ink, .6); x.beginPath(); x.arc(110 + i * 50, -170, 14, 0, TAU); x.fill(); }
    x.fillStyle = P.cream; x.beginPath(); x.arc(170, -60, 60, 0, TAU); x.fill(); x.strokeStyle = P.ink; x.lineWidth = 6;
    const a = -2.4 + hum(t) * (1.6 + Math.sin(t * 9) * .15); x.beginPath(); x.moveTo(170, -60); x.lineTo(170 + Math.cos(a) * 46, -60 + Math.sin(a) * 46); x.stroke();
    x.fillStyle = P.ink; x.beginPath(); x.roundRect(200, 120, 110, 110, 12); x.fill();
    x.restore();
  }
  function conveyor(x, t) {
    const band = mix(P.sheet, P.sheetShade, .45), off = (t * 160) % 60;
    x.fillStyle = band; x.fillRect(BELT.x0, BELT.y - 18, BELT.x1 - BELT.x0, 36);
    x.strokeStyle = mix(band, P.ink, .25); x.lineWidth = 3; for (let px = BELT.x0 + off; px < BELT.x1; px += 60) { x.beginPath(); x.moveTo(px, BELT.y - 18); x.lineTo(px - 10, BELT.y + 18); x.stroke(); }
    x.fillStyle = mix(P.sheet2, P.cream, .1); for (let px = BELT.x0 + 30; px < BELT.x1; px += 120) { x.beginPath(); x.arc(px, BELT.y + 30, 16, 0, TAU); x.fill(); }
  }
  function coins(x, t) { for (let k = 0; k < 3; k++) { const u = clamp((t - T.fix - k * .18) / .35); if (u > 0 && u < 1) PR.coin(x, P, 'flat', MX, -560 + u * 250, 22, .6); } }
  function cobras(x, t) {
    for (let k = 0; k < 7; k++) {
      const t0 = T.manufacturing + k * .52; if (t < t0) continue;
      const hx = MX + 290 + (t - t0) * 260, pts = PR.slitherPath([hx, BELT.y - 30], 210, { amp: 12, k: TAU / 120, phase: t * 6 });
      x.save(); x.beginPath(); x.rect(MX + 250, -2000, 4000, 4000); x.clip();
      PR.cobraBody(x, P, pts, { w: 26, eye: 1 }); x.restore();
    }
  }
  const cam = t => ({ x: PORT ? 0 : 230, y: PORT ? -20 : 10, z: (PORT ? .9 : 1.2) * lerp(1, 1.06, smooth(t / DUR)) });
  function draw(ctx, t) {
    L.background(ctx);
    L.sheet(ctx, cam(t), 1, [0, 0], x => { conveyor(x, t); cobras(x, t); machine(x, t); coins(x, t); }, { flatShadow: [12, 16, 14, .4] });
    L.grade(ctx, t);
  }
  F.scene('seq-24', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
