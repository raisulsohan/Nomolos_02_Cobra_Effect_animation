(function () {
  'use strict';
  const F = FILM, CS = F.cases, PR = F.props, { W, H, portrait: PORT } = F.format();
  const { clamp, lerp, smooth, hash, TAU } = F, mix = F.city.mix;
  const C = F.cues('seq-18'), DUR = C.duration;
  const L = F.look('flat', W, H), P = L.P;
  const T = { shape: 0.689, light: 3.029, examples: 3.792 };
  const R = Math.min(W, H) * (PORT ? .4 : .38), CX = W / 2, CY = H * .5;
  const LAND = [[-100, 45, 32], [-75, 10, 18], [-60, -15, 22], [-65, -40, 12], [15, 50, 20], [20, 5, 26], [25, -25, 18], [80, 25, 22], [100, 50, 36], [115, 35, 16], [105, 10, 12], [135, -25, 18], [45, 25, 14]];
  const r1 = F.rng(92), LIGHTS = Array.from({ length: 34 }, (_, i) => [(r1() * 360) - 180, (r1() - .5) * 120, r1()]);
  const rot = t => -40 + t * 14;
  const proj = (lon, lat, t) => { const a = (lon - rot(t)) * Math.PI / 180, b = lat * Math.PI / 180; return [Math.cos(b) * Math.sin(a), -Math.sin(b), Math.cos(b) * Math.cos(a)]; };
  function globe(x, t) {
    const sea = mix(P.sheet2, P.ink, .25), land = mix(P.sheet2, P.cream, .22);
    x.fillStyle = sea; x.beginPath(); x.arc(CX, CY, R, 0, TAU); x.fill();
    x.save(); x.beginPath(); x.arc(CX, CY, R, 0, TAU); x.clip();
    x.strokeStyle = F.rgba(F.hex(P.cream), .08); x.lineWidth = 2;
    for (let lon = -180; lon < 180; lon += 30) { x.beginPath(); for (let lat = -90; lat <= 90; lat += 6) { const [px, py, pz] = proj(lon, lat, t); if (pz > 0) x.lineTo(CX + px * R, CY + py * R); else x.moveTo(CX + px * R, CY + py * R); } x.stroke(); }
    x.fillStyle = land;
    for (const [lon, lat, s] of LAND) for (let k = 0; k < 7; k++) {
      const [px, py, pz] = proj(lon + (hash(k, lon | 0) - .5) * s * 1.2, lat + (hash(k, lat | 0, 2) - .5) * s * .8, t); if (pz <= 0) continue;
      const rr = R * s / 180 * (.5 + hash(k, s) * .4); x.beginPath(); x.ellipse(CX + px * R, CY + py * R, rr * Math.max(.2, pz), rr, 0, 0, TAU); x.fill();
    }
    x.restore();
    const g = x.createRadialGradient(CX - R * .4, CY - R * .45, R * .1, CX, CY, R); g.addColorStop(0, 'rgba(255,240,210,.12)'); g.addColorStop(1, 'rgba(0,0,10,.35)');
    x.fillStyle = g; x.beginPath(); x.arc(CX, CY, R, 0, TAU); x.fill();
  }
  const lightsOn = (t, i) => smooth((t - T.light - LIGHTS[i][2] * (DUR - T.light - .3)) / .15);
  function draw(ctx, t) {
    L.background(ctx);
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      globe(x, t);
      const sk = smooth((t - T.shape) / .5);
      if (sk > 0) { x.save(); x.globalAlpha = .75 * sk; CS.cobraCurve(x, { ...P, ink: P.amber }, { x: CX - R * 1.1, y: CY - R * .5, w: R * 2.3, h: R * .95, width: R * .045, upto: smooth((t - T.shape) / 1.1) }); x.restore(); }
      LIGHTS.forEach(([lon, lat], i) => { const k = lightsOn(t, i), [px, py, pz] = proj(lon, lat, t); if (k <= 0 || pz <= 0) return; x.fillStyle = F.rgba(F.hex(P.glow), k * pz); x.beginPath(); x.arc(CX + px * R, CY + py * R, 5 + 3 * pz, 0, TAU); x.fill(); });
    }, { flatShadow: [12, 16, 14, .4] });
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    LIGHTS.forEach(([lon, lat], i) => { const k = lightsOn(t, i), [px, py, pz] = proj(lon, lat, t); if (k > 0 && pz > 0) PR.glow(ctx, CX + px * R, CY + py * R, 34, P.glow, .5 * k * pz, 'flat'); });
    ctx.restore();
    L.grade(ctx, t);
  }
  F.scene('seq-18', { W, H, duration: DUR, draw, grain: 'none', ready: F.fonts('NSC', 'NS'), label: C.label });
})();
