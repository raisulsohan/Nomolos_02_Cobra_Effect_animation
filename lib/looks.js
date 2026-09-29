(function () {
  'use strict';
  const F = FILM, { canvas, rng, hash, TAU } = F;

  const PAL = {
    paper: {
      bgTop: '#6d8c87', bgBot: '#4b6663', sheet: '#eee1c4', sheetShade: '#e2d3b2', sheet2: '#87a39c', sheetDim: '#c9c2ad',
      ink: '#2c2824', amber: '#e39e37', amberDark: '#a8661f', red: '#b5372b', cream: '#f2e6cc', rim: '#fff6df', glow: '#ffd9a0',
      wall: '#e2cfa8', roof: '#9a5238', window: '#f3c264', door: '#5a3e2c', glass: '#a9c6cf', facade: '#5b7079', awningA: '#b5372b', awningB: '#f0e3c6',
      coat: '#4d5b68', coat2: '#8a6044', trouser: '#3a3a40', skin: '#dcb58f', cap: '#3a3a40', lampGlass: '#f7d38a',
      wood: '#8a603f', woodDark: '#6b4a30', rubber: '#5c2620', eraser: '#d8736a', eraserDark: '#b85a52', sleeve: '#3f5d78',
      card: '#f6ecd5', parchment: '#e8d3a8', parchmentEdge: '#b98e55', quill: '#f4efe4', quillShade: '#cfc6b3', nib: '#6b5a44',
    },
    flat: {
      bgTop: '#0c1422', bgBot: '#18243a', sheet: '#ecdfc2', sheetShade: '#c7b28a', sheet2: '#28344a', sheetDim: '#9d9280',
      ink: '#1b2130', amber: '#f2a33a', amberDark: '#b3681c', red: '#c9352b', cream: '#f5ecd8', rim: '#fff1d0', glow: '#ffd08a',
      wall: '#d7c7a6', roof: '#8a4b36', window: '#f6c66e', door: '#4a3528', glass: '#a8cbe0', facade: '#5f6f86', awningA: '#c9352b', awningB: '#efe3c6',
      coat: '#44536b', coat2: '#7a4f3a', trouser: '#2c3445', skin: '#d8b08a', cap: '#2c3445', lampGlass: '#ffd48a',
      wood: '#7a5436', woodDark: '#5a3b25', rubber: '#5a1f1a', eraser: '#d86b62', eraserDark: '#a9504a', sleeve: '#35516b',
      card: '#f5ecd8', parchment: '#e6cf9f', parchmentEdge: '#a9804a', quill: '#f2eee6', quillShade: '#c9c1b0', nib: '#5a4a38',
    },
    lightbox: {
      bgTop: '#04041a', bgBot: '#0f0c28', sheet: '#3c4499', sheetShade: '#343b88', sheet2: '#191a44', sheetDim: '#2a2f6e',
      ink: '#0a0a18', amber: '#ffb34d', amberDark: '#b86a1c', red: '#ff4a3d', cream: '#ffe3b0', rim: '#ffc978', glow: '#ffae4a',
      wall: '#171638', roof: '#120f2c', window: '#ffc56a', door: '#0c0b1d', glass: '#58c8ff', facade: '#141433', awningA: '#1d1636', awningB: '#241c42',
      coat: '#0f0f24', coat2: '#131028', trouser: '#0b0b1c', skin: '#1a1530', cap: '#0b0b1c', lampGlass: '#ffe0a0',
      wood: '#1a1426', woodDark: '#110d1c', rubber: '#241018', eraser: '#3a1c2c', eraserDark: '#2a1420', sleeve: '#16163a',
      card: '#1c1d45', parchment: '#2a2350', parchmentEdge: '#171238', quill: '#2a2748', quillShade: '#1b1934', nib: '#0e0c1a',
    },
  };
  const POSE = 15;
  const pose = t => Math.floor(t * POSE + 1e-6) / POSE;
  let FIBRE = null, GRAIN = null;

  const LOOKS = new Map();
  function look(name, W, H, opts = {}) {
    if (Object.keys(opts).length) return makeLook(name, W, H, opts);
    const key = `${name}|${W}|${H}`;
    if (!LOOKS.has(key)) LOOKS.set(key, makeLook(name, W, H, opts));
    return LOOKS.get(key);
  }
  function makeLook(name, W, H, opts = {}) {
    const P = { ...PAL[name], ...(opts.palette || {}) };
    const [layer, lx] = canvas(W, H), [tmp, tx] = canvas(W, H);
    FIBRE = FIBRE || F.fibreTile(7);
    GRAIN = GRAIN || F.grainTiles(4, 9);
    const bg = (() => {
      if (name === 'paper') return F.mottledBackdrop(W, H, P.bgTop, P.bgBot, opts.seed || 3);
      const [c, x] = canvas(W, H);
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.bgTop); g.addColorStop(1, P.bgBot);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      if (name === 'flat') {
        const b = x.createLinearGradient(0, 0, W * .7, H); b.addColorStop(0, 'rgba(255,214,160,.10)'); b.addColorStop(.5, 'rgba(255,214,160,0)');
        x.fillStyle = b; x.fillRect(0, 0, W, H);
      } else {
        const r = rng(5);
        for (let i = 0; i < 420 * W * H / 2073600; i++) { x.fillStyle = `rgba(255,240,220,${.15 + r() * .5})`; const s = r() < .9 ? 1 : 2; x.fillRect(r() * W, r() * H * .95, s, s); }
        const v = x.createRadialGradient(W / 2, H * .55, 0, W / 2, H * .55, Math.max(W, H) * .52);
        v.addColorStop(0, 'rgba(110,80,190,.12)'); v.addColorStop(1, 'rgba(110,80,190,0)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
      }
      return c;
    })();
    const vig = F.vignette(W, H, name === 'lightbox' ? .55 : name === 'flat' ? .5 : .38);

    function clearLayer() {
      if (lx.reset) { lx.reset(); return; }
      lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalAlpha = 1; lx.globalCompositeOperation = 'source-over'; lx.filter = 'none';
      lx.lineCap = 'butt'; lx.lineJoin = 'miter'; lx.setLineDash([]); lx.lineDashOffset = 0; lx.lineWidth = 1; lx.miterLimit = 10;
      lx.font = '10px sans-serif'; lx.textAlign = 'start'; lx.textBaseline = 'alphabetic'; lx.shadowBlur = 0; lx.shadowColor = 'rgba(0,0,0,0)'; lx.shadowOffsetX = lx.shadowOffsetY = 0;
      lx.clearRect(0, 0, W, H);
    }
    function fibre(s, m, a) {
      const fs = Math.min(s * .5, 1.5);
      const pat = tx.createPattern(FIBRE, 'repeat'); pat.setTransform(new DOMMatrix([fs, 0, 0, fs, m.e, m.f]));
      tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalAlpha = 1; tx.globalCompositeOperation = 'source-over'; tx.filter = 'none';
      tx.clearRect(0, 0, W, H); tx.fillStyle = pat; tx.fillRect(0, 0, W, H);
      lx.save(); lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-atop'; lx.globalAlpha = a; lx.drawImage(tmp, 0, 0); lx.restore();
    }
    let rimColor = null;
    function rim(a, w, shift = [1, 1.25]) {
      tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalAlpha = 1; tx.filter = 'none'; tx.globalCompositeOperation = 'source-over';
      tx.clearRect(0, 0, W, H); tx.drawImage(layer, 0, 0);
      tx.globalCompositeOperation = 'source-in'; tx.fillStyle = rimColor || P.rim; tx.fillRect(0, 0, W, H);
      tx.globalCompositeOperation = 'destination-out'; tx.drawImage(layer, w * shift[0], w * shift[1]); tx.globalCompositeOperation = 'source-over';
      lx.save(); lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-atop'; lx.globalAlpha = a; lx.drawImage(tmp, 0, 0); lx.restore();
    }
    function composite(ctx, o) {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
      if (o.shadow !== false) {
        if (name === 'lightbox') {
          tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalAlpha = 1; tx.globalCompositeOperation = 'source-over'; tx.clearRect(0, 0, W, H); tx.drawImage(layer, 0, 0);
          tx.globalCompositeOperation = 'source-in'; tx.fillStyle = o.glowColor || P.glow; tx.fillRect(0, 0, W, H); tx.globalCompositeOperation = 'source-over';
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.glow ?? .6; ctx.filter = `blur(${o.glowBlur ?? 14}px)`; ctx.drawImage(tmp, 0, 0);
        } else {
          const d = name === 'flat' ? (o.flatShadow || [16, 22, 16, .45]) : (o.paperShadow || [5, 7, 5, .34]);
          ctx.filter = `blur(${d[2]}px) brightness(0)`; ctx.globalAlpha = d[3] * (o.shadowAlpha ?? 1); ctx.drawImage(layer, d[0], d[1]);
        }
        ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(layer, 0, 0);
      ctx.restore();
    }

    const L = {
      name, P, W, H, pose,
      background(ctx) { const tgt = F.route(ctx, 'bg'); if (!tgt) return; tgt.save(); tgt.setTransform(1, 0, 0, 1, 0, 0); tgt.drawImage(bg, 0, 0); tgt.restore(); },
      sheet(ctx, cam, p, R, fn, o = {}) {
        const tgt = F.route(ctx, 'sheet');
        clearLayer();
        const s = F.sheet(lx, cam, p, W, H, R, o.shake || [0, 0]), m = lx.getTransform();
        fn(lx, s);
        if (name !== 'flat' && o.fibre !== 0) fibre(s, m, o.fibre ?? (name === 'paper' ? .85 : .4));
        rimColor = o.rimColor || null;
        if (name !== 'flat' && o.rim !== false) rim(o.rimAlpha ?? (name === 'paper' ? .45 : .7), o.rimWidth ?? 2.2, o.rimShift);
        if (tgt) composite(tgt, o);
        return s;
      },
      boil(t, id, amp = 1) {
        const k = pose(t) * POSE | 0, a = (name === 'paper' ? 1 : .5) * amp;
        return [(hash(k, id, 1) - .5) * 1.4 * a, (hash(k, id, 2) - .5) * 1.4 * a, (hash(k, id, 3) - .5) * .008 * a];
      },
      grade(ctx0, t) {
        const f = name === 'paper' ? Math.floor(t * POSE + 1e-6) : Math.round(t * F.FPS);
        let ctx = F.route(ctx0, 'grade');
        if (ctx) {
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
          ctx.drawImage(vig, 0, 0);
          if (name === 'paper') { const e = hash(f, 41) - .5; ctx.fillStyle = e > 0 ? `rgba(255,245,225,${e * .05})` : `rgba(20,15,10,${-e * .05})`; ctx.fillRect(0, 0, W, H); }
          ctx.restore();
        }
        ctx = F.route(ctx0, 'grain'); if (!ctx) return;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
        const gx = (f * 97) % 256, gy = (f * 57) % 256, pat = ctx.createPattern(GRAIN[f % GRAIN.length], 'repeat');
        ctx.globalAlpha = name === 'flat' ? .7 : 1; ctx.setTransform(1, 0, 0, 1, gx, gy); ctx.fillStyle = pat; ctx.fillRect(-gx, -gy, W, H);
        ctx.restore();
      },
    };
    return L;
  }

  Object.assign(F, { PAL, look, pose, POSE });
})();
