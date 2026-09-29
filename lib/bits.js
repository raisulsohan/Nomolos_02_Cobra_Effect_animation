(function () {
  'use strict';
  const F = FILM, { clamp, smooth, lerp, easeIO } = F;
  const B = (F.bits = {});

  B.cam = keys => t => {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], z: keys[0][3] };
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
      return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), z: a[3] * Math.pow(b[3] / a[3], k) };
    }
    const e = keys[keys.length - 1]; return { x: e[1], y: e[2], z: e[3] };
  };
  B.blend = (t, a, b) => smooth((t - a) / (b - a));

  B.words = (L, ctx, text, k, o = {}) => {
    if (k <= 0) return;
    const { W, H, P } = L, PORT = H > W;
    L.sheet(ctx, { x: W / 2, y: H / 2, z: 1 }, 1, [W / 2, H / 2], x => {
      const cy = H * (o.y ?? (PORT ? .86 : .85)), cx = W * (o.x ?? .5);
      let size = o.size || (PORT ? 84 : 100);
      x.font = `${o.weight || 900} ${size}px NSC`;
      const fit = Math.min(1, W * .88 / Math.max(1, x.measureText(text).width)); size *= fit;
      if (o.band !== false) {
        const top = cy - size * 1.6, g = x.createLinearGradient(0, top, 0, cy + size * 1.4);
        g.addColorStop(0, F.rgba(F.hex(P.bgTop), 0)); g.addColorStop(.4, F.rgba(F.hex(P.bgTop), .62 * k)); g.addColorStop(1, F.rgba(F.hex(P.bgTop), .7 * k));
        x.fillStyle = g; x.fillRect(0, top, W, size * 3);
      }
      const sc = lerp(1.1, 1, easeIO(clamp(k)));
      x.save(); x.translate(cx, cy); x.scale(sc, sc); x.globalAlpha = clamp(k);
      x.font = `${o.weight || 900} ${size}px NSC`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = o.color || P.cream;
      x.fillText(text, 0, 0);
      if (o.sub) { x.font = `600 ${size * .34}px NS`; x.fillStyle = F.tone(o.color || P.cream, P.bgTop, .25); x.fillText(o.sub, 0, size * .78); }
      x.restore();
    }, { flatShadow: [6, 8, 10, .5], paperShadow: [4, 6, 5, .3], rim: false, fibre: 0 });
  };
})();
