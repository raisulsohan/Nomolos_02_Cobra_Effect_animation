(function () {
  'use strict';
  const F = FILM, CS = F.cases, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, easeIO, easeOutBack, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-29'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { policy: 2.028, corporate: 2.683, school: 4.072, artificial: 7.385, machine: 9.378,
    maximize: 10.352, score: 11.019, loophole: 12.763, intended: 14.238 };
  const SC = [[800, T.policy, 'parliament'], [2000, T.corporate, 'office'], [3200, T.school, 'class'], [4500, T.artificial, 'screen']];
  const cam = F.bits.cam([[0, 300, -150, PORT ? .5 : .78], [T.policy + .3, 820, -170, PORT ? .52 : .8], [T.corporate + .4, 2010, -170, PORT ? .52 : .8], [T.school + .4, 3210, -170, PORT ? .52 : .8],
    [T.artificial + .4, 4500, -180, PORT ? .55 : .82], [T.machine, 4500, -240, PORT ? .8 : 1.3], [DUR, 4520, -250, PORT ? .84 : 1.36]]);
  const up = (t, t0) => easeOutBack(clamp((t - t0 + .15) / .45), 1.5);

  function ground(x) {
    x.fillStyle = mix(P.sheetShade, P.ink, .25); x.fillRect(-1200, 0, 7600, 1200);
    x.fillStyle = mix(P.sheet, P.sheetShade, .5); x.fillRect(-1200, -8, 7600, 12);
    for (let k = 0; k < 6; k++) CS.cobraCurve(x, { ...P, ink: mix(P.ink, P.sheet2, .2) }, { x: -900 + k * 1300, y: 90, w: 1300, h: 260, width: 20 });
  }
  function plate(x, cx, s, fn) { if (s <= 0) return; x.save(); x.translate(cx, 0); x.scale(1, s); fn(x); x.restore(); }
  function parliament(x) {
    const st = P.sheet;
    x.fillStyle = st; x.fillRect(-300, -260, 600, 260); x.fillStyle = mix(st, P.ink, .1); x.fillRect(-320, -280, 640, 24);
    x.beginPath(); x.arc(0, -280, 120, Math.PI, 0); x.fill(); x.fillRect(-10, -440, 20, 50);
    x.fillStyle = mix(st, P.ink, .25); for (let k = -4; k <= 4; k++) x.fillRect(k * 64 - 12, -240, 24, 220);
    x.fillStyle = P.card; x.fillRect(180, -200, 190, 250); x.fillStyle = P.ink; for (let r = 0; r < 5; r++) { x.strokeStyle = P.ink; x.lineWidth = 3; x.strokeRect(200, -170 + r * 42, 22, 22); x.fillRect(236, -162 + r * 42, 110, 6); }
  }
  function office(x, t) {
    x.fillStyle = mix(P.sheet2, P.cream, .15); x.fillRect(-280, -420, 560, 420);
    x.fillStyle = mix(P.window, P.cream, .3); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) x.fillRect(-240 + c * 100, -390 + r * 90, 60, 50);
    x.fillStyle = P.card; x.fillRect(120, -300, 260, 200);
    x.strokeStyle = P.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(140, -120); x.lineTo(360, -120); x.stroke();
    x.setLineDash([12, 8]); x.strokeStyle = P.amber; x.beginPath(); x.moveTo(140, -260); x.lineTo(360, -260); x.stroke(); x.setLineDash([]);
    x.strokeStyle = P.ink; x.lineWidth = 6; x.beginPath(); x.moveTo(150, -130); x.lineTo(210, -160); x.lineTo(270, -150); x.lineTo(340, -262); x.stroke();
  }
  function classroom(x) {
    x.fillStyle = mix(P.wall, P.cream, .2); x.fillRect(-300, -320, 600, 320); x.fillStyle = P.roof; x.beginPath(); x.moveTo(-330, -320); x.lineTo(0, -430); x.lineTo(330, -320); x.fill();
    x.fillStyle = mix(P.sheet2, P.ink, .2); x.fillRect(-260, -290, 300, 150);
    x.fillStyle = P.card; x.fillRect(100, -300, 220, 300); x.strokeStyle = P.ink; x.lineWidth = 2.5;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { x.beginPath(); x.arc(140 + c * 44, -270 + r * 38, 12, 0, TAU); if ((r * 3 + c) % 4 === 1) { x.fillStyle = P.ink; x.fill(); } x.stroke(); }
  }
  function screen(x, t) {
    const sw = 620, sh = 400, tt = t - T.artificial;
    x.fillStyle = mix(P.ink, P.sheet2, .3); x.fillRect(-sw / 2 - 20, -sh - 90, sw + 40, sh + 40); x.fillRect(-20, -70, 40, 70); x.fillRect(-120, -12, 240, 12);
    x.save(); x.beginPath(); x.rect(-sw / 2, -sh - 70, sw, sh); x.clip();
    x.fillStyle = mix(P.glass, P.sheet2, .35); x.fillRect(-sw / 2, -sh - 70, sw, sh);
    const oy = -sh / 2 - 70;
    x.strokeStyle = F.rgba(F.hex(P.cream), .35); x.lineWidth = 3; x.setLineDash([10, 8]); x.beginPath(); x.moveTo(-sw / 2, oy - 120); x.lineTo(sw / 2, oy - 120); x.moveTo(-sw / 2, oy + 120); x.lineTo(sw / 2, oy + 120); x.stroke(); x.setLineDash([]);
    for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? P.cream : P.ink; x.fillRect(sw / 2 - 40, oy - 120 + k * 30, 16, 30); }
    const LC = [-80, oy + 10], R0 = 70, loopT = Math.max(0, t - T.machine), ang = loopT * 4.2;
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6, since = ((ang - a) % TAU + TAU) % TAU, on = t < T.machine ? 1 : since > 1.2 ? 1 : 0; if (!on) continue; x.fillStyle = P.amber; x.beginPath(); x.arc(LC[0] + Math.cos(a) * R0, LC[1] + Math.sin(a) * R0, 11, 0, TAU); x.fill(); }
    let bx, by, bh;
    if (t < T.machine) { const u = clamp(tt / (T.machine - T.artificial)); bx = lerp(-sw / 2 - 30, LC[0] - R0, u); by = LC[1]; bh = 0; }
    else { bx = LC[0] + Math.cos(ang + Math.PI) * R0; by = LC[1] + Math.sin(ang + Math.PI) * R0; bh = ang + Math.PI + Math.PI / 2; }
    x.save(); x.translate(bx, by); x.rotate(bh); x.fillStyle = P.cream; x.beginPath(); x.moveTo(22, 0); x.lineTo(-14, -11); x.lineTo(-14, 11); x.closePath(); x.fill(); x.restore();
    if (t > T.machine) { x.strokeStyle = F.rgba(F.hex(P.cream), .3); x.lineWidth = 4; x.beginPath(); x.arc(LC[0], LC[1], R0, ang + Math.PI - 1.6, ang + Math.PI - .1); x.stroke(); }
    const sc = Math.floor(Math.max(0, loopT) * 820) * 10;
    x.fillStyle = F.rgba([0, 0, 0], .35); x.fillRect(-sw / 2 + 16, -sh - 56, 300, 64);
    x.fillStyle = P.amber; x.font = '900 40px NSC'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('SCORE ' + String(sc).padStart(5, '0'), -sw / 2 + 30, -sh - 23);
    x.restore();
  }
  function draw(ctx, t) {
    L.background(ctx);
    L.sheet(ctx, cam(t), 1, [0, 0], x => {
      ground(x);
      plate(x, SC[0][0], up(t, SC[0][1]), parliament);
      plate(x, SC[1][0], up(t, SC[1][1]), y => office(y, t));
      plate(x, SC[2][0], up(t, SC[2][1]), classroom);
      plate(x, SC[3][0], up(t, SC[3][1]), y => screen(y, t));
    }, { flatShadow: [12, 16, 14, .4] });
    L.grade(ctx, t);
  }
  F.scene('seq-29', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
