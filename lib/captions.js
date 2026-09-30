(function () {
  'use strict';
  const F = window.FILM;
  const ease = u => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3);
  F.captions = (cues, o = {}) => {
    const W = o.W, H = o.H, size0 = o.size || Math.round(W * .07), lead = o.lead ?? 1.06, font = o.font || 'PB', cy = o.y ?? H * .78;
    const cols = o.colors || [['#fff0d6', '#c8bca4'], ['#e42323', '#6e0000']];
    return (ctx, t) => {
      const c = cues.find(q => t >= q.t0 && t < q.t1); if (!c) return;
      const u = (t - c.t0) / .22, k = ease(u), s = 1.16 - .16 * k, blur = 5 * (1 - k);
      ctx.save(); ctx.translate(W / 2, cy); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, .25 + u * 1.5);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let size = size0, w = 0; ctx.font = `900 ${size}px ${font}`;
      for (const L of c.lines) w = Math.max(w, ctx.measureText(L).width);
      if (w > W * .88) { size = Math.floor(size * W * .88 / w); ctx.font = `900 ${size}px ${font}`; w = 0; for (const L of c.lines) w = Math.max(w, ctx.measureText(L).width); }
      const n = c.lines.length, top = -((n - 1) * size * lead) / 2;
      ctx.save(); ctx.filter = 'blur(20px)'; ctx.fillStyle = 'rgba(0,0,0,.7)';
      ctx.beginPath(); ctx.roundRect(-w / 2 - size * .5, top - size * .66, w + size, (n - 1) * size * lead + size * 1.32, size * .4); ctx.fill(); ctx.restore();
      if (blur > .3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
      c.lines.forEach((L, i) => {
        const y = top + i * size * lead, [a, b] = cols[Math.min(i, cols.length - 1)];
        const g = ctx.createLinearGradient(0, y - size * .45, 0, y + size * .45); g.addColorStop(0, a); g.addColorStop(1, b);
        ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.fillStyle = g; ctx.fillText(L, 0, y);
      });
      ctx.restore();
    };
  };
  const SUB = (W, H) => { const portrait = H > W, size = portrait ? 44 : 46; return { size, lh: size * 1.42, px: size * .42, py: size * .2, foot: { b: portrait ? H - 130 : H - 62, l: portrait ? H - 56 : H - 16 }, head: { t: portrait ? 70 : 54, u: Math.round(H * (portrait ? .18 : .2)) } }; };
  const subFont = (ctx, s) => { ctx.font = `600 ${s.size}px NS`; ctx.letterSpacing = '0.3px'; };
  function subLayout(ctx, lines, pos, W, H) {
    const s = SUB(W, H), n = lines.length, y0 = pos === 't' || pos === 'u' ? s.head[pos] + s.lh / 2 : s.foot[pos === 'l' ? 'l' : 'b'] - (n - .5) * s.lh;
    return lines.map((L, i) => { const y = y0 + i * s.lh, w = ctx.measureText(L).width; return { L, y, box: [W / 2 - w / 2 - s.px, y - s.size * .62 - s.py / 2, W / 2 + w / 2 + s.px, y + s.size * .62 + s.py / 2] }; });
  }
  F.subtitleBoxes = (ctx, lines, pos, W, H) => { ctx.save(); subFont(ctx, SUB(W, H)); const r = subLayout(ctx, lines, pos, W, H).map(l => l.box); ctx.restore(); return r; };
  F.subtitles = (cues, o = {}) => {
    const W = o.W, H = o.H, s = SUB(W, H);
    return (ctx, t) => {
      if (window.SUBS_OFF) return;
      const c = cues.find(q => t >= q.t0 && t < q.t1); if (!c) return;
      const a = Math.min(1, (t - c.t0) / .15, (c.t1 - t) / .15), rise = 8 * (1 - Math.min(1, (t - c.t0) / .2));
      window.__SUBS_DRAWING = true;
      ctx.save(); ctx.globalAlpha = Math.max(0, a); subFont(ctx, s); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const { L, y, box } of subLayout(ctx, c.lines, c.pos, W, H)) {
        ctx.fillStyle = 'rgba(12,10,24,.6)'; ctx.beginPath(); ctx.roundRect(box[0], box[1] + rise, box[2] - box[0], box[3] - box[1], s.size * .22); ctx.fill();
        ctx.fillStyle = '#f6efe2'; ctx.fillText(L, W / 2, y + rise + s.size * .04);
      }
      ctx.restore(); window.__SUBS_DRAWING = false;
    };
  };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const lerpRGB = (a, b, k) => `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(',')})`;
  const hash = (...v) => { let x = 2166136261; for (const ch of v.join('|')) x = Math.imul(x ^ ch.charCodeAt(0), 16777619); x ^= x >>> 16; x = Math.imul(x, 2246822507); x ^= x >>> 13; x = Math.imul(x, 3266489909); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
  const CREAM = [246, 239, 226], GOLD = [255, 200, 64], DIM = [150, 145, 135];
  const IMPACT = .13;
  const INKS = { wet: ['206,38,30', '150,20,16'], dry: ['164,30,26', '112,16,14'] };
  const stampCache = new Map();
  function stampImage(w, font, s, letter, ink) {
    const key = `${w}|${font}|${letter}|${ink}`; if (stampCache.has(key)) return stampCache.get(key);
    const set = g => { g.font = font; g.letterSpacing = letter; g.textBaseline = 'middle'; g.lineJoin = 'round'; };
    const m = document.createElement('canvas').getContext('2d'); set(m);
    const tw = m.measureText(w).width, pad = s * .45, CW = Math.ceil(tw + pad * 2), CH = Math.ceil(s * 1.8), y = CH / 2, [col, rim] = INKS[ink];
    const L = document.createElement('canvas'), lg = L.getContext('2d'); L.width = CW; L.height = CH; set(lg);
    lg.fillStyle = `rgb(${col})`; lg.fillText(w, pad, y);
    lg.globalCompositeOperation = 'source-atop'; lg.lineWidth = s * .09; lg.strokeStyle = `rgba(${rim},.85)`; lg.strokeText(w, pad, y);
    lg.globalCompositeOperation = 'destination-out';
    for (let i = 0, n = Math.round(tw * s / 36); i < n; i++) {
      lg.globalAlpha = .12 + .4 * hash(w, i, 'ga'); lg.beginPath(); lg.arc(pad + hash(w, i, 'gx') * tw, y + (hash(w, i, 'gy') - .5) * s * 1.1, s * (.006 + .014 * hash(w, i, 'gr')), 0, 7); lg.fill();
    }
    for (let i = 0, n = 2 + Math.round(tw / s); i < n; i++) {
      lg.globalAlpha = .18 + .25 * hash(w, i, 'pa'); lg.beginPath(); lg.ellipse(pad + hash(w, i, 'px') * tw, y + (hash(w, i, 'py') - .5) * s * .8, s * (.05 + .07 * hash(w, i, 'pr')), s * (.02 + .03 * hash(w, i, 'pq')), hash(w, i, 'pt') * 3, 0, 7); lg.fill();
    }
    const side = hash(w, 'side') < .5, gr = lg.createLinearGradient(side ? 0 : CW, 0, side ? CW : 0, 0);
    gr.addColorStop(0, 'rgba(0,0,0,.38)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.06)');
    lg.globalAlpha = 1; lg.fillStyle = gr; lg.fillRect(0, 0, CW, CH);
    const cv = document.createElement('canvas'), g = cv.getContext('2d'); cv.width = CW; cv.height = CH; set(g);
    g.lineWidth = s * .13; g.strokeStyle = 'rgba(244,236,220,.82)'; g.strokeText(w, pad, y);
    g.save(); g.filter = `blur(${(s * .035).toFixed(1)}px)`; g.fillStyle = `rgba(${col},.45)`; g.fillText(w, pad, y); g.restore();
    g.drawImage(L, 0, 0);
    const out = { cv, pad, tw }; stampCache.set(key, out); return out;
  }
  const stampRot = wd => (hash(wd.w, wd.t0) - .5) * .08;
  const inFrame = (ctx, wd, cx, y, fn) => { ctx.save(); ctx.translate(cx, y); ctx.rotate(stampRot(wd)); fn(); ctx.restore(); };
  function inkWord(ctx, wd, cx, y, s, t, clip) {
    const font = ctx.font, ls = ctx.letterSpacing, dry = stampImage(wd.w, font, s, ls, 'dry'), wet = clamp01(1 - (t - wd.t1 - .1) / .5), X = -dry.tw / 2 - dry.pad, Y = -dry.cv.height / 2;
    inFrame(ctx, wd, cx, y, () => {
      if (clip) { ctx.beginPath(); clip(ctx, dry.tw); ctx.clip(); }
      ctx.drawImage(dry.cv, X, Y);
      if (wet > 0) { ctx.globalAlpha *= wet; ctx.drawImage(stampImage(wd.w, font, s, ls, 'wet').cv, X, Y); }
    });
  }
  const said = (wd, t, k = .85, min = .12) => clamp01((t - wd.t0) / Math.max(min, (wd.t1 - wd.t0) * k));
  function stampWord(ctx, wd, x, y, w, s, t) {
    const dt = t - wd.t0, u = dt / IMPACT; if (u < 0) return;
    const sc = u < 1 ? 1.7 - .7 * u * u : 1 - .04 * Math.sin(clamp01((dt - IMPACT) / .12) * Math.PI);
    ctx.save(); ctx.globalAlpha *= u < 1 ? .3 + .7 * u : 1; ctx.translate(x + w / 2, y); ctx.scale(sc, sc); inkWord(ctx, wd, 0, 0, s, t); ctx.restore();
  }
  function sprayStages(key, base) {
    key = `spray|${key}`; if (stampCache.has(key)) return stampCache.get(key);
    const W0 = base.width, H0 = base.height, src = base.getContext('2d').getImageData(0, 0, W0, H0).data;
    let seed = Math.floor(hash(key) * 4294967296); const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    const bw = Math.ceil(W0 / 2), noise = new Float32Array(bw * Math.ceil(H0 / 2)).map(rnd), out = [];
    for (let k = 1; k <= 10; k++) {
      const cv = document.createElement('canvas'); cv.width = W0; cv.height = H0; const d = new ImageData(new Uint8ClampedArray(src), W0, H0);
      for (let yy = 0; yy < H0; yy++) for (let xx = 0; xx < W0; xx++) if (noise[(xx >> 1) + (yy >> 1) * bw] > k / 10) d.data[(xx + yy * W0) * 4 + 3] = 0;
      cv.getContext('2d').putImageData(d, 0, 0); out.push(cv);
    }
    stampCache.set(key, out); return out;
  }
  const stampLook = (name, draw, reveal = true) => ({ name, font: s => `900 ${s}px NSC`, size: [48, 46], letter: '2px', tx: w => w.toUpperCase(), draw, reveal });
  const hashV1 = (...v) => { let x = 2166136261; for (const ch of v.join('|')) x = Math.imul(x ^ ch.charCodeAt(0), 16777619); return (x >>> 0) / 4294967296; };
  const stampCacheV1 = new Map(), printSeed = wd => `${wd.w}@${wd.t0}`;
  function stampImageV1(w, font, s, letter, seed = w) {
    const key = `${w}|${font}|${letter}|${seed}`; if (stampCacheV1.has(key)) return stampCacheV1.get(key);
    const cv = document.createElement('canvas'), g = cv.getContext('2d'), set = () => { g.font = font; g.letterSpacing = letter; g.textBaseline = 'middle'; g.lineJoin = 'round'; };
    set(); const tw = g.measureText(w).width, pad = s * .3;
    cv.width = Math.ceil(tw + pad * 2); cv.height = Math.ceil(s * 1.6); set();
    g.lineWidth = s * .2; g.strokeStyle = 'rgba(246,239,226,.95)'; g.strokeText(w, pad, cv.height / 2);
    g.fillStyle = 'rgb(176,32,26)'; g.fillText(w, pad, cv.height / 2);
    g.globalCompositeOperation = 'destination-out';
    const streaks = 1 + Math.floor(hash(seed, 'n') * 3), per = Math.round(tw / 3 / streaks);
    for (let k = 0; k < streaks; k++) {
      const ang = (hash(seed, k, 'side') < .5 ? -1 : 1) * (.17 + .43 * hash(seed, k, 'ang')), cos = Math.cos(ang), sin = Math.sin(ang);
      const len = Math.min(tw * (.5 + .5 * hash(seed, k, 'len')), s * 1.1 / Math.abs(sin)), cx = pad + tw * (.2 + .6 * hash(seed, k, 'cx')), cy = cv.height / 2 + (hash(seed, k, 'cy') - .5) * s * .5;
      for (let i = 0; i < per; i++) {
        const u = (hash(seed, k, i, 'u') - .5) * len, j = (hash(seed, k, i, 'j') - .5) * s * .07;
        g.globalAlpha = .35 + .5 * hash(seed, k, i, 'a'); g.beginPath(); g.arc(cx + cos * u - sin * j, cy + sin * u + cos * j, s * (.015 + .035 * hash(seed, k, i, 'r')), 0, 7); g.fill();
      }
    }
    const out = { cv, pad, tw }; stampCacheV1.set(key, out); return out;
  }
  function stampWordV1(ctx, wd, x, y, w, s, t) {
    const u = (t - wd.t0) / .13; if (u < 0) return;
    const sc = u < 1 ? 1.7 - .7 * u * u : 1 - .04 * Math.sin(clamp01((u - 1) * .13 / .12) * Math.PI), rot = (hashV1(wd.w, wd.t0) - .5) * .08;
    const img = stampImageV1(wd.w, ctx.font, s, ctx.letterSpacing, printSeed(wd));
    ctx.save(); ctx.globalAlpha *= u < 1 ? .3 + .7 * u : 1; ctx.translate(x + w / 2, y); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.drawImage(img.cv, -img.tw / 2 - img.pad, -img.cv.height / 2); ctx.restore();
  }
  function stampSprayWordV1(ctx, wd, x, y, w, s, t) {
    const p = said(wd, t, .9, .22); if (p <= 0) return;
    const font = ctx.font, ls = ctx.letterSpacing, seed = printSeed(wd), img = stampImageV1(wd.w, font, s, ls, seed), st = p < 1 ? sprayStages(`v1|${wd.w}|${font}|${ls}|${seed}`, img.cv) : null;
    ctx.save(); ctx.translate(x + w / 2, y); ctx.rotate((hashV1(wd.w, wd.t0) - .5) * .08);
    ctx.drawImage(st ? st[Math.min(st.length - 1, Math.floor(p * st.length))] : img.cv, -img.tw / 2 - img.pad, -img.cv.height / 2); ctx.restore();
  }
  F.subStyles = {
    stampV1: stampLook('1 · Stamp', stampWordV1),
    stampSpray: stampLook('2 · Stamp spray', stampSprayWordV1),
    stamp: stampLook('3 · Stamp ink', stampWord),
    soak: stampLook('4 · Soak', (ctx, wd, x, y, w, s, t) => {
      const u = (t - wd.t0) / .4; if (u <= 0) return;
      const k = ease(u);
      ctx.save(); ctx.globalAlpha *= .2 + .8 * k; if (k < .99) ctx.filter = `blur(${((1 - k) * s * .2).toFixed(1)}px)`;
      inkWord(ctx, wd, x + w / 2, y, s, t); ctx.restore();
    }),
    spray: stampLook('5 · Spray', (ctx, wd, x, y, w, s, t) => {
      const p = said(wd, t, .9, .22); if (p <= 0) return;
      if (p >= 1) return inkWord(ctx, wd, x + w / 2, y, s, t);
      const st = sprayStages(`ink|${wd.w}|${ctx.font}|${ctx.letterSpacing}`, stampImage(wd.w, ctx.font, s, ctx.letterSpacing, 'wet').cv), img = st[Math.min(st.length - 1, Math.floor(p * st.length))], dry = stampImage(wd.w, ctx.font, s, ctx.letterSpacing, 'dry');
      inFrame(ctx, wd, x + w / 2, y, () => ctx.drawImage(img, -dry.tw / 2 - dry.pad, -dry.cv.height / 2));
    }),
    emboss: stampLook('6 · Emboss', (ctx, wd, x, y, w, s, t) => {
      const u = (t - wd.t0) / .22, cx = x + w / 2;
      if (u < 1) inFrame(ctx, wd, cx, y, () => {
        const o = Math.max(1, s * .03);
        ctx.fillStyle = 'rgba(40,26,14,.5)'; ctx.fillText(wd.w, -w / 2 + o, o);
        ctx.fillStyle = 'rgba(255,249,235,.65)'; ctx.fillText(wd.w, -w / 2 - o, -o);
        ctx.fillStyle = 'rgba(222,210,188,.55)'; ctx.fillText(wd.w, -w / 2, 0);
      });
      if (u > 0) { const h = s * 1.3 * ease(u); inkWord(ctx, wd, cx, y, s, t, g => g.rect(-w / 2 - s, s * .65 - h, w + s * 2, h)); }
    }, false),
    trace: stampLook('7 · Trace', (ctx, wd, x, y, w, s, t) => {
      const u = said(wd, t, 1, .3); if (u <= 0) return;
      const cx = x + w / 2, a = clamp01(u / .7), f = u >= 1 ? 1 : clamp01((u - .55) / .45);
      if (f < 1) inFrame(ctx, wd, cx, y, () => {
        const L = s * 3.6; ctx.setLineDash([L, L * 3]); ctx.lineDashOffset = L * (1 - a);
        ctx.globalAlpha *= 1 - f; ctx.lineWidth = s * .055; ctx.strokeStyle = `rgb(${INKS.wet[0]})`; ctx.strokeText(wd.w, -w / 2, 0);
      });
      if (f > 0) { ctx.save(); ctx.globalAlpha *= f; inkWord(ctx, wd, cx, y, s, t); ctx.restore(); }
    }),
    blot: stampLook('8 · Blot', (ctx, wd, x, y, w, s, t) => {
      const cx = x + w / 2, dt = t - wd.t0, hx = (hash(wd.w, wd.t0, 'bx') - .5) * w * .6;
      if (dt > -.12 && dt < 0) { const q = 1 + dt / .12; inFrame(ctx, wd, cx, y, () => { ctx.fillStyle = `rgb(${INKS.wet[0]})`; ctx.beginPath(); ctx.ellipse(hx, -s * 1.4 * (1 - q * q), s * .07, s * .1, 0, 0, 7); ctx.fill(); }); }
      if (dt < 0) return;
      const R = (w / 2 + Math.abs(hx) + s * .4) * ease(dt / .28);
      inkWord(ctx, wd, cx, y, s, t, g => {
        for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = R * (1 + .16 * (hash(wd.w, i, 'bw') - .5)), px = hx + Math.cos(a) * r, py = Math.sin(a) * r * .8; i ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.closePath();
      });
    }),
    echo: { name: '9 · Echo', font: s => `600 ${s}px NS`, size: [50, 46], draw: (ctx, wd, x, y, w, s, t) => {
      for (let k = 0; k < 3; k++) {
        const u = (t - wd.t0 - k * .09) / .6; if (u <= 0 || u >= 1) continue;
        const sc = 1 + .55 * ease(u);
        ctx.save(); ctx.globalAlpha *= (1 - u) * .9; ctx.translate(x + w / 2, y); ctx.scale(sc, sc); ctx.textAlign = 'center';
        ctx.lineWidth = Math.max(1.5, s * .07 / sc); ctx.strokeStyle = `rgb(${GOLD})`; ctx.shadowColor = 'rgba(255,200,64,.6)'; ctx.shadowBlur = s * .15; ctx.strokeText(wd.w, 0, 0); ctx.restore();
      }
      ctx.strokeText(wd.w, x, y); ctx.fillStyle = t < wd.t0 ? lerpRGB(CREAM, DIM, .55) : t < wd.t1 + .15 ? 'rgb(255,226,150)' : `rgb(${CREAM})`; ctx.fillText(wd.w, x, y);
    } },
  };
  const SUB_FOOT = { w: .93, p: .925 }, SUB_HEAD = { w: .07, p: .075 };
  F.keepClear = F.keepClear || (() => {});
  function stampLayout(ctx, S, cue, W, H) {
    const k = H > W ? 'p' : 'w', n = cue.lines.length; let size = S.size[k === 'p' ? 1 : 0], sp, rows;
    const lay = () => {
      ctx.font = S.font(size); ctx.letterSpacing = S.letter || '0.3px'; ctx.lineWidth = size * .18; sp = ctx.measureText(' ').width;
      rows = cue.lines.map(ws => { const ws2 = S.tx ? ws.map(x => ({ ...x, w: S.tx(x.w) })) : ws, ww = ws2.map(x => ctx.measureText(x.w).width); return { ws: ws2, ww, tot: ww.reduce((s, v) => s + v, 0) + sp * (ws2.length - 1) }; });
    };
    lay();
    const room = W * (S.fit || .88), widest = Math.max(...rows.map(r => r.tot));
    if (widest > room) { size = Math.floor(size * room / widest); lay(); }
    const lh = size * 1.36, pos = cue.pos ?? 'b', top = pos === 't' ? H * SUB_HEAD[k] : pos.head !== undefined ? pos.head * H : (pos.foot ?? SUB_FOOT[k]) * H - n * lh;
    rows.forEach((r, li) => { r.x = W / 2 - r.tot / 2; r.y = top + li * lh + lh / 2; });
    return { size, sp, rows };
  }
  F.styledSubBoxes = (ctx, cue, W, H, style, t) => {
    const S = F.subStyles[style]; ctx.save(); const L = stampLayout(ctx, S, cue, W, H); ctx.restore();
    const e = L.size * .2, v = L.size * .58;
    if (t === undefined || !S.reveal) return L.rows.map(r => [r.x - e, r.y - v, r.x + r.tot + e, r.y + v]);
    const out = [];
    for (const r of L.rows) { let x = r.x; r.ws.forEach((wd, i) => { if (wd.t0 <= t) out.push([x - e, r.y - v, x + r.ww[i] + e, r.y + v]); x += r.ww[i] + L.sp; }); }
    return out;
  };
  F.styledSubs = (cues, o = {}) => {
    const W = o.W, H = o.H;
    return (ctx, t) => {
      if (window.SUBS_OFF) return;
      const S = F.subStyles[window.SUB_STYLE || o.style || 'stampSpray'];
      const c = cues.find(q => t >= q.t0 && t < q.t1); if (!c) return;
      const a = Math.min(1, (t - c.t0) / .15, (c.t1 - t) / .2);
      window.__SUBS_DRAWING = true;
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(8,6,16,.85)';
      const L = stampLayout(ctx, S, c, W, H);
      for (const r of L.rows) { let x = r.x; r.ws.forEach((wd, i) => { S.draw(ctx, wd, x, r.y, r.ww[i], L.size, t); x += r.ww[i] + L.sp; }); }
      ctx.restore(); window.__SUBS_DRAWING = false;
    };
  };
  F.parseSrt = text => text.replace(/\r/g, '').replace(/^﻿/, '').split(/\n\n+/).map(b => b.trim()).filter(Boolean).map(b => {
    const ls = b.split('\n'), m = /(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/.exec(ls[1] || ls[0]); if (!m) return null;
    const s = (h, mi, se, ms) => +h * 3600 + +mi * 60 + +se + +ms / 1000;
    return { t0: s(m[1], m[2], m[3], m[4]), t1: s(m[5], m[6], m[7], m[8]), lines: ls.slice(ls[1] && /-->/.test(ls[1]) ? 2 : 1).map(x => x.trim()).filter(Boolean) };
  }).filter(Boolean);
})();
