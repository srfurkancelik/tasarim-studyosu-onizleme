/* Tasarım Stüdyosu — katmanlı dosya içe aktarma.
   PSD (Photoshop): her katman ayrı katman; yazı katmanları düzenlenebilir yazı olur.
   SVG (Illustrator'dan "Farklı Kaydet → SVG"): şekiller, yollar, yazılar ve görseller ayrı katman olur. */
(function () {
  'use strict';
  const R = window.Render;

  // =================================================================== PSD
  class Rd {
    constructor(buf) { this.v = new DataView(buf); this.u8 = new Uint8Array(buf); this.p = 0; }
    u8_() { return this.v.getUint8(this.p++); }
    i16() { const x = this.v.getInt16(this.p); this.p += 2; return x; }
    u16() { const x = this.v.getUint16(this.p); this.p += 2; return x; }
    i32() { const x = this.v.getInt32(this.p); this.p += 4; return x; }
    u32() { const x = this.v.getUint32(this.p); this.p += 4; return x; }
    f64() { const x = this.v.getFloat64(this.p); this.p += 8; return x; }
    str(n) { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(this.u8[this.p + i]); this.p += n; return s; }
    bytes(n) { const b = this.u8.subarray(this.p, this.p + n); this.p += n; return b; }
    pascal(pad) { const n = this.u8_(); const s = this.str(n); let t = n + 1; while (t % pad) { this.p++; t++; } return s; }
    uni() { const n = this.u32(); let s = ''; for (let i = 0; i < n; i++) { const c = this.u16(); if (c) s += String.fromCharCode(c); } return s; }
    key() { const n = this.u32(); return this.str(n || 4); }
    skip() { const n = this.u32(); this.p += n; }
  }

  // Photoshop eylem tanımlayıcısı (yazı katmanının içeriği burada)
  function descriptor(r) {
    const o = {};
    r.uni(); r.key(); // sınıf adı ve kimliği
    const n = r.u32();
    for (let i = 0; i < n; i++) { const k = r.key().trim(); o[k] = item(r); }
    return o;
  }
  function item(r) {
    const t = r.str(4);
    switch (t) {
      case 'TEXT': return r.uni();
      case 'long': return r.i32();
      case 'doub': return r.f64();
      case 'bool': return !!r.u8_();
      case 'enum': return { type: r.key(), val: r.key() };
      case 'UntF': { const u = r.str(4); return { unit: u, val: r.f64() }; }
      case 'UnFl': { const u = r.str(4); const c = r.u32(); const a = []; for (let i = 0; i < c; i++) a.push(r.f64()); return { unit: u, vals: a }; }
      case 'Objc': case 'GlbO': return descriptor(r);
      case 'VlLs': { const c = r.u32(); const a = []; for (let i = 0; i < c; i++) a.push(item(r)); return a; }
      case 'tdta': { const len = r.u32(); return r.bytes(len); }
      case 'type': case 'GlbC': r.uni(); return r.key();
      case 'obj ': { const c = r.u32(); for (let i = 0; i < c; i++) { const kt = r.str(4); if (kt === 'prop') { r.uni(); r.key(); r.key(); } else if (kt === 'Clss') { r.uni(); r.key(); } else if (kt === 'Enmr') { r.uni(); r.key(); r.key(); r.key(); } else if (kt === 'rele') { r.uni(); r.key(); r.u32(); } else if (kt === 'Idnt' || kt === 'indx') r.u32(); else if (kt === 'name') { r.uni(); r.key(); r.uni(); } } return null; }
      case 'alis': { const len = r.u32(); r.p += len; return null; }
      default: throw new Error('Bilinmeyen tanımlayıcı türü: ' + t);
    }
  }

  // EngineData (yazı stili) — metin biçimli; ihtiyacımız olan değerleri düzenli ifadeyle alıyoruz
  function engineInfo(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    const num = (re) => { const m = s.match(re); return m ? parseFloat(m[1]) : null; };
    const fontSize = num(/\/FontSize\s+([\d.]+)/);
    const leading = num(/\/Leading\s+([\d.]+)/);
    const tracking = num(/\/Tracking\s+(-?[\d.]+)/);
    const just = num(/\/Justification\s+(\d)/);
    let color = null;
    const cm = s.match(/\/FillColor\s*<<\s*\/Type\s+1\s+\/Values\s+\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
    if (cm) color = '#' + [cm[2], cm[3], cm[4]].map((v) => Math.round(Math.max(0, Math.min(1, +v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
    // yazı tipi adı UTF-16BE (þÿ ile başlar)
    let font = null;
    const fm = s.match(/\/FontSet\s*\[\s*<<\s*\/Name\s*\(\xFE\xFF((?:[\s\S](?!\)))*[\s\S])\)/);
    if (fm) { const b = fm[1]; let n = ''; for (let i = 0; i + 1 < b.length; i += 2) n += String.fromCharCode((b.charCodeAt(i) << 8) | b.charCodeAt(i + 1)); font = n.replace(/\\/g, ''); }
    const faux = /\/FauxBold\s+true/.test(s);
    return { fontSize, leading, tracking, align: just === 1 ? 'right' : just === 2 ? 'center' : 'left', color, font, faux };
  }

  function mapFont(ps) {
    if (!ps) return { family: 'Arial', weight: 400, italic: false };
    const n = ps.replace(/-/g, ' ');
    const weight = /black|heavy|ultra/i.test(n) ? 900 : /extrabold|extra bold/i.test(n) ? 800 : /semibold|demi/i.test(n) ? 600 : /bold/i.test(n) ? 700 : /medium/i.test(n) ? 500 : /light|thin/i.test(n) ? 300 : 400;
    const italic = /italic|oblique/i.test(n);
    let fam = n.replace(/\b(MT|PS|Std|Pro|LT|Regular|Roman|Book|Bold|Black|Heavy|Medium|Light|Thin|Italic|Oblique|SemiBold|Semibold|ExtraBold|Demi|Condensed|Cond)\b/gi, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
    if (!fam) fam = 'Arial';
    const known = (R.FONTS || []).find((f) => f.toLowerCase() === fam.toLowerCase());
    return { family: known || fam, weight, italic };
  }

  // PackBits (RLE)
  function unpack(src, out, oOff, len) {
    let i = 0, o = 0;
    while (o < len && i < src.length) {
      let n = src[i++]; if (n > 127) n -= 256;
      if (n >= 0) { for (let k = 0; k <= n && o < len; k++) out[oOff + o++] = src[i++]; }
      else if (n !== -128) { const b = src[i++]; for (let k = 0; k < 1 - n && o < len; k++) out[oOff + o++] = b; }
    }
  }
  async function inflate(bytes) {
    const ds = new DecompressionStream('deflate');
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer());
  }
  async function readChannel(r, w, h, depth, len) {
    const end = r.p + len;
    const comp = r.u16();
    const size = w * h, out = new Uint8Array(size);
    if (!size) { r.p = end; return out; }
    if (comp === 0) { if (depth === 8) out.set(r.bytes(size)); else { for (let i = 0; i < size; i++) { out[i] = r.u8[r.p] ; r.p += 2; } } }
    else if (comp === 1) {
      const counts = []; for (let y = 0; y < h; y++) counts.push(r.u16());
      let off = 0;
      for (let y = 0; y < h; y++) { unpack(r.bytes(counts[y]), out, off, w); off += w; }
    } else if (comp === 2 || comp === 3) {
      const z = await inflate(r.bytes(end - r.p));
      if (comp === 3) { for (let y = 0; y < h; y++) for (let x = 1; x < w; x++) z[y * w + x] = (z[y * w + x] + z[y * w + x - 1]) & 255; }
      out.set(z.subarray(0, size));
    }
    r.p = end;
    return out;
  }
  const BLEND = { norm: 'normal', mul: 'multiply', scrn: 'screen', over: 'overlay', dark: 'darken', lite: 'lighten', diff: 'difference', smud: 'exclusion', 'hue': 'hue', sat: 'saturation', colr: 'color', lum: 'luminosity', sLit: 'soft-light', hLit: 'hard-light', 'div': 'color-dodge', idiv: 'color-burn', pass: 'normal' };

  async function parsePSD(buf) {
    const r = new Rd(buf);
    if (r.str(4) !== '8BPS') throw new Error('Bu bir PSD dosyası değil');
    const ver = r.u16();
    if (ver !== 1) throw new Error('Büyük belge (PSB) biçimi desteklenmiyor; Photoshop\'ta “Farklı Kaydet → PSD” ile kaydet.');
    r.p += 6;
    const nch = r.u16(), H = r.u32(), W = r.u32(), depth = r.u16(), mode = r.u16();
    if (depth !== 8) throw new Error(depth + ' bit derinlik desteklenmiyor: Photoshop\'ta Görüntü → Mod → 8 Bit/Kanal yapıp tekrar kaydet.');
    if (![1, 3, 4].includes(mode)) throw new Error('Renk modu desteklenmiyor: RGB, CMYK ya da gri tonlamalı olmalı');
    r.skip(); // renk modu verisi
    r.skip(); // görüntü kaynakları
    const lmLen = r.u32(), lmEnd = r.p + lmLen;
    const layers = [];
    if (lmLen) {
      const liLen = r.u32(), liEnd = r.p + liLen;
      if (liLen) {
        let count = r.i16(); count = Math.abs(count);
        for (let i = 0; i < count; i++) {
          const L = { top: r.i32(), left: r.i32(), bottom: r.i32(), right: r.i32(), ch: [] };
          const c = r.u16();
          for (let k = 0; k < c; k++) L.ch.push({ id: r.i16(), len: r.u32() });
          r.str(4); L.blend = r.str(4).trim(); L.opacity = r.u8_() / 255; L.clip = r.u8_(); L.flags = r.u8_(); r.p++;
          const exLen = r.u32(), exEnd = r.p + exLen;
          const mLen = r.u32(); if (mLen >= 18) { const mt = r.i32(), ml = r.i32(), mb = r.i32(), mr = r.i32(); L.mask = { top: mt, left: ml, bottom: mb, right: mr }; r.p += mLen - 16; } else r.p += mLen;
          r.skip(); // karışım aralıkları
          L.name = r.pascal(4);
          while (r.p + 12 <= exEnd) {
            const sig = r.str(4); if (sig !== '8BIM' && sig !== '8B64') break;
            const key = r.str(4); const len = r.u32(); const st = r.p;
            try {
              if (key === 'luni') L.name = r.uni();
              else if (key === 'lsct' || key === 'lsdk') L.section = r.u32();
              else if (key === 'TySh') {
                r.u16(); const tf = [r.f64(), r.f64(), r.f64(), r.f64(), r.f64(), r.f64()];
                r.u16(); r.u32();
                const d = descriptor(r);
                L.text = { transform: tf, desc: d };
              }
            } catch (e) { /* bozuk ek bilgi: katmanın kendisi yine okunur */ }
            r.p = st + len;
          }
          r.p = exEnd;
          layers.push(L);
        }
        for (const L of layers) {
          const w = L.right - L.left, h = L.bottom - L.top;
          L.data = {};
          for (const c of L.ch) {
            if (c.id === -2 || c.id === -3) { L.data[c.id] = await readChannel(r, L.mask ? L.mask.right - L.mask.left : 0, L.mask ? L.mask.bottom - L.mask.top : 0, depth, c.len); continue; }
            L.data[c.id] = await readChannel(r, w, h, depth, c.len);
          }
        }
      }
      r.p = liEnd;
    }
    r.p = lmEnd;
    // birleşik görüntü (katmansız PSD'ler için)
    let merged = null;
    if (!layers.length && r.p < r.u8.length) {
      const comp = r.u16(); const size = W * H; merged = [];
      if (comp === 1) {
        const counts = []; for (let i = 0; i < H * nch; i++) counts.push(r.u16());
        for (let c = 0; c < nch; c++) { const out = new Uint8Array(size); let off = 0; for (let y = 0; y < H; y++) { unpack(r.bytes(counts[c * H + y]), out, off, W); off += W; } merged.push(out); }
      } else if (comp === 0) { for (let c = 0; c < nch; c++) merged.push(r.bytes(size * (depth / 8)).filter((_, i) => depth === 8 || i % 2 === 0)); }
    }
    return { W, H, mode, layers, merged };
  }

  function toCanvas(w, h, ch, mode) {
    const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h);
    if (!w || !h) return c;
    const ctx = c.getContext('2d'), id = ctx.createImageData(w, h), px = id.data;
    const A = ch[-1], n = w * h;
    for (let i = 0; i < n; i++) {
      let rr, gg, bb;
      if (mode === 3) { rr = ch[0] ? ch[0][i] : 0; gg = ch[1] ? ch[1][i] : rr; bb = ch[2] ? ch[2][i] : rr; }
      else if (mode === 4) { const C = 255 - ch[0][i], Mg = 255 - ch[1][i], Y = 255 - ch[2][i], K = 255 - (ch[3] ? ch[3][i] : 255); rr = 255 - Math.min(255, C + K); gg = 255 - Math.min(255, Mg + K); bb = 255 - Math.min(255, Y + K); }
      else { rr = gg = bb = ch[0] ? ch[0][i] : 0; }
      px[i * 4] = rr; px[i * 4 + 1] = gg; px[i * 4 + 2] = bb; px[i * 4 + 3] = A ? A[i] : 255;
    }
    ctx.putImageData(id, 0, 0);
    return c;
  }

  async function importPSD(buf, upload, onProgress) {
    const P = await parsePSD(buf);
    const out = [];
    const base = { rotation: 0, visible: true, locked: false };
    if (!P.layers.length) {
      if (!P.merged) throw new Error('PSD içinde katman bulunamadı');
      const ch = {}; P.merged.forEach((a, i) => (ch[i] = a)); if (P.mode === 3 && P.merged.length > 3) ch[-1] = P.merged[3];
      const c = toCanvas(P.W, P.H, ch, P.mode);
      const u = await upload(c.toDataURL('image/png'), 'psd-arka-plan.png');
      out.push(Object.assign({ type: 'image', name: 'Arka plan', src: u, nw: P.W, nh: P.H, fit: 'fill', x: 0, y: 0, w: P.W, h: P.H, opacity: 1, blend: 'normal', filters: {} }, base));
      return { width: P.W, height: P.H, layers: out, notes: ['Bu PSD tek katmanlı (düzleştirilmiş); tek görsel olarak açıldı.'] };
    }
    let hiddenDepth = 0; const notes = [];
    let idx = 0;
    for (const L of P.layers) {
      idx++; onProgress && onProgress(idx, P.layers.length);
      // klasör sınırları: 1/2 = klasör açılışı (kayıtta sondan gelir), 3 = klasör sonu
      if (L.section === 3) continue;
      if (L.section === 1 || L.section === 2) continue;
      const w = L.right - L.left, h = L.bottom - L.top;
      const visible = !(L.flags & 2);
      const blend = BLEND[L.blend] || 'normal';
      if (L.text && L.text.desc && L.text.desc['Txt']) {
        const tf = L.text.transform, sc = Math.sqrt(Math.abs(tf[0] * tf[3] - tf[1] * tf[2])) || 1;
        const eng = L.text.desc.EngineData ? engineInfo(L.text.desc.EngineData) : {};
        const f = mapFont(eng.font);
        const fs = Math.max(4, Math.round(((eng.fontSize || Math.max(8, h * 0.75)) * sc) * 10) / 10);
        const text = String(L.text.desc['Txt']).replace(/\r/g, '\n').replace(/\n+$/, '');
        const lines = text.split('\n').length;
        const lh = eng.leading ? Math.max(0.8, Math.min(2.5, (eng.leading * sc) / fs)) : 1.2;
        const t = Object.assign({ type: 'text', name: L.name || text.slice(0, 20), text, fontSize: fs, fontFamily: f.family, fontWeight: eng.faux ? 700 : f.weight, italic: f.italic, align: eng.align || 'left', fill: eng.color || '#000000', lineHeight: +lh.toFixed(2), letterSpacing: eng.tracking ? +((eng.tracking / 1000) * fs).toFixed(2) : 0, x: L.left, y: L.top, w: Math.max(w * 1.08, fs), h: Math.max(h, fs * lines * lh), opacity: L.opacity, blend }, base, { visible });
        if (Math.abs(tf[1]) > 0.01 || Math.abs(tf[2]) > 0.01) t.rotation = +(Math.atan2(tf[1], tf[0]) * 180 / Math.PI).toFixed(1);
        // nokta yazı: satırlar kaymasın diye kutuyu en uzun satıra göre genişlet, hizalamaya göre konumla
        try { const longest = Math.max(...text.split('\n').map((ln) => R.measure(ln, t))); t.w = Math.max(t.w, longest * 1.06 + fs * 0.2); } catch (e) {}
        if (t.align === 'center') t.x = L.left + w / 2 - t.w / 2; else if (t.align === 'right') t.x = L.left + w - t.w;
        out.push(t);
        // aslına sadık görünüm için yazının resmi gizli katman olarak dursun
        if (w > 0 && h > 0) {
          const c = toCanvas(w, h, L.data, P.mode);
          const u = await upload(c.toDataURL('image/png'), 'psd-yazi.png');
          out.splice(out.length - 1, 0, Object.assign({ type: 'image', name: (L.name || 'Yazı') + ' (orijinal görüntü)', src: u, nw: w, nh: h, fit: 'fill', x: L.left, y: L.top, w, h, opacity: L.opacity, blend: 'normal', filters: {} }, base, { visible: false, locked: true }));
        }
        continue;
      }
      if (w <= 0 || h <= 0) continue; // boş katman, ayar katmanı vb.
      const c = toCanvas(w, h, L.data, P.mode);
      // katman maskesi: görünür alana uygula
      const mk = L.data[-2];
      if (mk && L.mask && mk.length) {
        const mw = L.mask.right - L.mask.left, mh = L.mask.bottom - L.mask.top;
        const ctx = c.getContext('2d'), id = ctx.getImageData(0, 0, w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const mx = x + L.left - L.mask.left, my = y + L.top - L.mask.top;
          const mv = mx >= 0 && my >= 0 && mx < mw && my < mh ? mk[my * mw + mx] : 255;
          id.data[(y * w + x) * 4 + 3] = (id.data[(y * w + x) * 4 + 3] * mv) / 255;
        }
        ctx.putImageData(id, 0, 0);
      }
      const u = await upload(c.toDataURL('image/png'), 'psd-katman.png');
      out.push(Object.assign({ type: 'image', name: L.name || 'Katman', src: u, nw: w, nh: h, fit: 'fill', x: L.left, y: L.top, w, h, opacity: L.opacity, blend, filters: {} }, base, { visible }));
      if (L.clip) notes.push(`“${L.name}” kırpma maskesi kullanıyor; ayrı katman olarak açıldı.`);
      if (!visible) hiddenDepth++;
    }
    if (hiddenDepth) notes.push(`${hiddenDepth} gizli katman da aktarıldı (Katmanlar sekmesinden açabilirsin).`);
    return { width: P.W, height: P.H, layers: out, notes };
  }

  // =================================================================== SVG
  function parseColor(v) {
    if (!v || v === 'none' || v === 'transparent') return 'none';
    if (/^url\(/.test(v)) return null; // gradyan: sonra çözülür
    return v;
  }
  function absPath(d, m) {
    // yolu mutlak komutlara çevir ve dönüşüm matrisini uygula
    const toks = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) || [];
    let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, out = '';
    const T = (x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
    const S = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
    const num = () => parseFloat(toks[i++]);
    const pt = (x, y) => { const [X, Y] = T(x, y); return X.toFixed(2) + ' ' + Y.toFixed(2); };
    while (i < toks.length) {
      if (/[a-z]/i.test(toks[i])) cmd = toks[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? cx : 0, oy = rel ? cy : 0;
      if (C === 'Z') { out += 'Z'; cx = sx; cy = sy; continue; }
      if (C === 'M') { cx = ox + num(); cy = oy + num(); sx = cx; sy = cy; out += 'M' + pt(cx, cy); cmd = rel ? 'l' : 'L'; }
      else if (C === 'L') { cx = ox + num(); cy = oy + num(); out += 'L' + pt(cx, cy); }
      else if (C === 'H') { cx = (rel ? cx : 0) + num(); out += 'L' + pt(cx, cy); }
      else if (C === 'V') { cy = (rel ? cy : 0) + num(); out += 'L' + pt(cx, cy); }
      else if (C === 'C') { const a = [ox + num(), oy + num(), ox + num(), oy + num()]; cx = ox + num(); cy = oy + num(); out += 'C' + pt(a[0], a[1]) + ' ' + pt(a[2], a[3]) + ' ' + pt(cx, cy); }
      else if (C === 'S') { const a = [ox + num(), oy + num()]; cx = ox + num(); cy = oy + num(); out += 'S' + pt(a[0], a[1]) + ' ' + pt(cx, cy); }
      else if (C === 'Q') { const a = [ox + num(), oy + num()]; cx = ox + num(); cy = oy + num(); out += 'Q' + pt(a[0], a[1]) + ' ' + pt(cx, cy); }
      else if (C === 'T') { cx = ox + num(); cy = oy + num(); out += 'T' + pt(cx, cy); }
      else if (C === 'A') { const rx = num() * S, ry = num() * S, rot = num(), la = num(), sw = num(); cx = ox + num(); cy = oy + num(); out += `A${rx.toFixed(2)} ${ry.toFixed(2)} ${rot} ${la} ${m.a * m.d - m.b * m.c < 0 ? 1 - sw : sw} ` + pt(cx, cy); }
      else { i++; }
    }
    return out;
  }
  function pathBox(d) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden';
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.appendChild(p); document.body.appendChild(svg);
    const b = p.getBBox(); svg.remove();
    return b;
  }
  function shiftPath(d, dx, dy) {
    // yalnızca mutlak komutlar (absPath çıktısı); A komutunda yalnız son iki sayı nokta
    return d.replace(/([MLCSQTA])([^MLCSQTAZ]*)/g, (all, c, args) => {
      const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (c === 'A') { n[5] -= dx; n[6] -= dy; }
      else for (let k = 0; k < n.length; k += 2) { n[k] -= dx; n[k + 1] -= dy; }
      return c + n.map((v) => +v.toFixed(2)).join(' ');
    });
  }

  async function importSVG(text, upload) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const src = doc.documentElement;
    if (src.nodeName.toLowerCase() !== 'svg') throw new Error('Geçerli bir SVG değil');
    // canlı DOM'a koy: getCTM ve getComputedStyle için
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden';
    const svg = document.importNode(src, true); host.appendChild(svg); document.body.appendChild(host);
    try {
      const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
      const W = vb.length === 4 && vb[2] ? vb[2] : parseFloat(svg.getAttribute('width')) || 1000;
      const H = vb.length === 4 && vb[3] ? vb[3] : parseFloat(svg.getAttribute('height')) || 1000;
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      const vx = vb.length === 4 ? vb[0] : 0, vy = vb.length === 4 ? vb[1] : 0;
      const root = svg.getScreenCTM();
      const rootInv = root.inverse();
      const rel = (el) => rootInv.multiply(el.getScreenCTM());
      const layers = [];
      const grad = (u) => { const id = (u.match(/#([^)'"]+)/) || [])[1]; const g = id && svg.querySelector('#' + CSS.escape(id)); if (!g) return null; const stops = [...g.querySelectorAll('stop')].map((s) => getComputedStyle(s).stopColor || s.getAttribute('stop-color')); if (!stops.length) return null; const nn = (a, d) => { const v = g.getAttribute(a); return v == null ? d : (String(v).endsWith('%') ? parseFloat(v) / 100 : +v); }; const ang = Math.atan2(nn('y2', 0) - nn('y1', 0), nn('x2', 1) - nn('x1', 0)) * 180 / Math.PI; return { type: g.nodeName.toLowerCase().startsWith('radial') ? 'radial' : 'linear', angle: +ang.toFixed(1), colors: stops }; };
      const paint = (el, prop) => { const v = getComputedStyle(el)[prop]; if (!v || v === 'none') return 'none'; if (/^url\(/.test(v)) return grad(v) || '#888888'; return R.toHex(v); };
      let n = 0;
      const walk = async (el) => {
        for (const ch of el.children) {
          const tag = ch.nodeName.toLowerCase();
          if (['defs', 'clippath', 'mask', 'style', 'title', 'desc', 'metadata', 'symbol', 'pattern', 'lineargradient', 'radialgradient', 'filter'].includes(tag)) continue;
          const cs = getComputedStyle(ch);
          if (cs.display === 'none') continue;
          const m = rel(ch);
          const op = (+cs.opacity || 1) * (+cs.fillOpacity || 1);
          const nm = ch.getAttribute('id') || ch.getAttribute('data-name') || '';
          if (tag === 'g' || tag === 'a' || tag === 'switch') { await walk(ch); continue; }
          if (tag === 'text') {
            const fs = parseFloat(cs.fontSize) || 16;
            const sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
            const bb = ch.getBBox();
            const p0 = new DOMPoint(bb.x, bb.y).matrixTransform(m);
            const txt = [...ch.querySelectorAll('tspan')].length ? [...new Set([...ch.querySelectorAll('tspan')].map((t) => t.textContent))].join('\n') : ch.textContent;
            const anchor = cs.textAnchor;
            layers.push({ type: 'text', name: nm || 'Yazı: ' + txt.trim().slice(0, 18), text: txt.trim(), x: p0.x - vx, y: p0.y - vy, w: bb.width * sc * 1.08 + fs * 0.2, h: bb.height * sc, fontSize: +(fs * sc).toFixed(1), fontFamily: (cs.fontFamily || 'Arial').split(',')[0].replace(/['"]/g, '').trim(), fontWeight: +cs.fontWeight || 400, italic: cs.fontStyle === 'italic', fill: paint(ch, 'fill'), align: anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left', lineHeight: 1.2, letterSpacing: parseFloat(cs.letterSpacing) || 0, opacity: op, rotation: +(Math.atan2(m.b, m.a) * 180 / Math.PI).toFixed(1) || 0 });
            continue;
          }
          if (tag === 'image') {
            const href = ch.getAttribute('href') || ch.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (!href) continue;
            const x = +ch.getAttribute('x') || 0, y = +ch.getAttribute('y') || 0, w = +ch.getAttribute('width'), h = +ch.getAttribute('height');
            const a = new DOMPoint(x, y).matrixTransform(m), b = new DOMPoint(x + w, y + h).matrixTransform(m);
            let url = href;
            if (href.startsWith('data:')) url = await upload(href, 'svg-gorsel.png');
            layers.push({ type: 'image', name: nm || 'Görsel', src: url, x: Math.min(a.x, b.x) - vx, y: Math.min(a.y, b.y) - vy, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y), fit: 'fill', opacity: op, filters: {} });
            continue;
          }
          let d = null;
          if (tag === 'path') d = ch.getAttribute('d');
          else if (tag === 'rect') { const x = +ch.getAttribute('x') || 0, y = +ch.getAttribute('y') || 0, w = +ch.getAttribute('width'), h = +ch.getAttribute('height'); let rx = +ch.getAttribute('rx') || +ch.getAttribute('ry') || 0; rx = Math.min(rx, w / 2, h / 2);
            if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6) { // eksene paralel: düzenlenebilir dikdörtgen
              const a = new DOMPoint(x, y).matrixTransform(m), b = new DOMPoint(x + w, y + h).matrixTransform(m);
              layers.push({ type: 'rect', name: nm || 'Dikdörtgen', x: Math.min(a.x, b.x) - vx, y: Math.min(a.y, b.y) - vy, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y), radius: rx * Math.abs(m.a), fill: paint(ch, 'fill'), stroke: paint(ch, 'stroke'), strokeWidth: (parseFloat(cs.strokeWidth) || 0) * Math.abs(m.a), opacity: op });
              continue;
            }
            d = `M${x + rx} ${y}H${x + w - rx}${rx ? `A${rx} ${rx} 0 0 1 ${x + w} ${y + rx}` : ''}V${y + h - rx}${rx ? `A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}` : ''}H${x + rx}${rx ? `A${rx} ${rx} 0 0 1 ${x} ${y + h - rx}` : ''}V${y + rx}${rx ? `A${rx} ${rx} 0 0 1 ${x + rx} ${y}` : ''}Z`; }
          else if (tag === 'circle' || tag === 'ellipse') {
            const cx = +ch.getAttribute('cx') || 0, cy = +ch.getAttribute('cy') || 0, rx = +(ch.getAttribute('r') || ch.getAttribute('rx')), ry = +(ch.getAttribute('r') || ch.getAttribute('ry'));
            if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6) {
              const a = new DOMPoint(cx - rx, cy - ry).matrixTransform(m), b = new DOMPoint(cx + rx, cy + ry).matrixTransform(m);
              layers.push({ type: 'ellipse', name: nm || 'Elips', x: Math.min(a.x, b.x) - vx, y: Math.min(a.y, b.y) - vy, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y), fill: paint(ch, 'fill'), stroke: paint(ch, 'stroke'), strokeWidth: (parseFloat(cs.strokeWidth) || 0) * Math.abs(m.a), opacity: op });
              continue;
            }
            d = `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
          } else if (tag === 'line') d = `M${ch.getAttribute('x1')} ${ch.getAttribute('y1')}L${ch.getAttribute('x2')} ${ch.getAttribute('y2')}`;
          else if (tag === 'polygon' || tag === 'polyline') { const pts = (ch.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number); d = 'M' + pts.slice(0, 2).join(' ') + pts.slice(2).reduce((s, v, k) => s + (k % 2 ? ' ' + v : 'L' + v), '') + (tag === 'polygon' ? 'Z' : ''); }
          if (!d) continue;
          const ad = absPath(d, m);
          const bb = pathBox(ad);
          if (!bb.width && !bb.height) continue;
          const sw = (parseFloat(cs.strokeWidth) || 0) * (Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1);
          const pad = paint(ch, 'stroke') !== 'none' ? sw / 2 : 0;
          const bx = bb.x - pad, by = bb.y - pad, bw = Math.max(1, bb.width + 2 * pad), bh = Math.max(1, bb.height + 2 * pad);
          layers.push({ type: 'path', name: nm || ({ path: 'Yol', rect: 'Dikdörtgen', circle: 'Daire', ellipse: 'Elips', line: 'Çizgi', polygon: 'Çokgen', polyline: 'Çizgi' }[tag]) + ' ' + (++n), d: shiftPath(ad, bx, by), vw: +bw.toFixed(2), vh: +bh.toFixed(2), x: bx - vx, y: by - vy, w: bw, h: bh, fill: paint(ch, 'fill'), stroke: paint(ch, 'stroke'), strokeWidth: sw, evenodd: cs.fillRule === 'evenodd', opacity: op });
        }
      };
      await walk(svg);
      return { width: Math.round(W), height: Math.round(H), layers, notes: [] };
    } finally { host.remove(); }
  }


  // =========================================================
  // ILLUSTRATOR (.ai) / PDF → SVG (PDF uyumlu .ai dosyaları)
  // =========================================================
  function latin1(u8) { let out = ''; for (let i = 0; i < u8.length; i += 0x8000) out += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return out; }
  async function inflate(u8) {
    const run = async (fmt, data) => new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream(fmt))).arrayBuffer());
    try { return await run('deflate', u8); } catch (e) { try { return await run('deflate-raw', u8.subarray(2)); } catch (e2) { return new Uint8Array(0); } }
  }
  class PLex {
    constructor(s, p = 0) { this.s = s; this.p = p; }
    ws() { const s = this.s; for (;;) { const c = s.charCodeAt(this.p); if (c === 32 || c === 10 || c === 13 || c === 9 || c === 12 || c === 0) this.p++; else if (c === 37) { while (this.p < s.length && s[this.p] !== '\n' && s[this.p] !== '\r') this.p++; } else break; } }
    next() {
      this.ws(); const s = this.s; if (this.p >= s.length) return null;
      const c = s[this.p];
      if (c === '<' && s[this.p + 1] === '<') { this.p += 2; return { t: '<<' }; }
      if (c === '>' && s[this.p + 1] === '>') { this.p += 2; return { t: '>>' }; }
      if (c === '[' || c === ']' || c === '{' || c === '}') { this.p++; return { t: c }; }
      if (c === '<') { const e = s.indexOf('>', this.p); let h = s.slice(this.p + 1, e).replace(/[^0-9a-fA-F]/g, ''); if (h.length % 2) h += '0'; this.p = e + 1; let v = ''; for (let i = 0; i < h.length; i += 2) v += String.fromCharCode(parseInt(h.substr(i, 2), 16)); return { t: 'str', v }; }
      if (c === '(') {
        let depth = 1, v = ''; this.p++;
        while (this.p < s.length) {
          let ch = s[this.p++];
          if (ch === '\\') {
            const n = s[this.p++];
            const map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
            if (map[n] != null) v += map[n];
            else if (n >= '0' && n <= '7') { let o = n; while (o.length < 3 && s[this.p] >= '0' && s[this.p] <= '7') o += s[this.p++]; v += String.fromCharCode(parseInt(o, 8) & 255); }
            else if (n === '\r') { if (s[this.p] === '\n') this.p++; }
            else if (n !== '\n') v += n;
            continue;
          }
          if (ch === '(') depth++;
          if (ch === ')' && --depth === 0) break;
          v += ch;
        }
        return { t: 'str', v };
      }
      if (c === '/') { let e = this.p + 1; while (e < s.length && !/[\s\/\[\]<>(){}%]/.test(s[e])) e++; const v = s.slice(this.p + 1, e).replace(/#([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16))); this.p = e; return { t: 'name', v }; }
      let e = this.p; while (e < s.length && !/[\s\/\[\]<>(){}%]/.test(s[e])) e++;
      if (e === this.p) e++;
      const w = s.slice(this.p, e); this.p = e;
      if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(w)) return { t: 'num', v: parseFloat(w) };
      return { t: 'kw', v: w };
    }
    value(tok) {
      tok = tok || this.next(); if (!tok) return null;
      if (tok.t === 'num') {
        const save = this.p, a = this.next(), b = a && a.t === 'num' ? this.next() : null;
        if (b && b.t === 'kw' && b.v === 'R') return { r: tok.v };
        this.p = save; return tok.v;
      }
      if (tok.t === 'name') return { n: tok.v };
      if (tok.t === 'str') return { s: tok.v };
      if (tok.t === '[') { const a = []; for (;;) { const t = this.next(); if (!t || t.t === ']') break; a.push(this.value(t)); } return a; }
      if (tok.t === '<<') { const d = {}; for (;;) { const t = this.next(); if (!t || t.t === '>>') break; if (t.t === 'name') d[t.v] = this.value(); } return d; }
      if (tok.t === 'kw') return tok.v === 'true' ? true : tok.v === 'false' ? false : tok.v === 'null' ? null : { k: tok.v };
      return null;
    }
  }
  async function pdfToSVG(buf, pageIndex = 0) {
    const u8 = new Uint8Array(buf), S = latin1(u8);
    if (!/%PDF-/.test(S.slice(0, 1024))) throw new Error('Bu .ai dosyası PDF uyumlu kaydedilmemiş. Illustrator’da “Farklı Kaydet → Illustrator” penceresinde “PDF uyumlu dosya oluştur” işaretli olarak kaydet ya da SVG olarak kaydet.');
    const objs = new Map();
    const re = /(\d+)\s+(\d+)\s+obj\b/g; let m;
    while ((m = re.exec(S))) {
      const lx = new PLex(S, re.lastIndex); let val;
      try { val = lx.value(); } catch (e) { continue; }
      lx.ws(); let stream = null;
      if (S.startsWith('stream', lx.p)) {
        let a = lx.p + 6; if (S[a] === '\r') a++; if (S[a] === '\n') a++;
        let len = val && typeof val.Length === 'number' ? val.Length : -1;
        let e = len >= 0 && S.startsWith('endstream', S.indexOf('endstream', a + len) === -1 ? -1 : a + len) ? a + len : S.indexOf('endstream', a);
        if (len >= 0 && /^\s*endstream/.test(S.substr(a + len, 12))) e = a + len;
        else { e = S.indexOf('endstream', a); while (e > a && (S[e - 1] === '\n' || S[e - 1] === '\r')) e--; }
        stream = [a, e]; re.lastIndex = e;
      }
      objs.set(+m[1], { val, stream });
    }
    const R_ = (v) => { let g = 0; while (v && typeof v === 'object' && 'r' in v && g++ < 20) { const o = objs.get(v.r); v = o ? o.val : null; } return v; };
    const decodeCache = new Map();
    async function streamBytes(o) {
      if (!o || !o.stream) return new Uint8Array(0);
      if (decodeCache.has(o)) return decodeCache.get(o);
      let data = u8.subarray(o.stream[0], o.stream[1]);
      const d = o.val || {}; let f = R_(d.Filter); f = Array.isArray(f) ? f.map((x) => R_(x).n) : f ? [f.n] : [];
      let parms = R_(d.DecodeParms); if (Array.isArray(parms)) parms = R_(parms[0]);
      for (const fl of f) {
        if (fl === 'ASCII85Decode' || fl === 'A85') {
          const t = latin1(data).replace(/\s+/g, ''), e = t.indexOf('~>'), body = (e >= 0 ? t.slice(0, e) : t).replace(/^<~/, '');
          const o = []; let grp = [];
          for (let i = 0; i < body.length; i++) {
            const c = body[i]; if (c === 'z' && !grp.length) { o.push(0, 0, 0, 0); continue; }
            grp.push(c.charCodeAt(0) - 33);
            if (grp.length === 5) { let v = 0; for (const g of grp) v = v * 85 + g; o.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255); grp = []; }
          }
          if (grp.length) { const n = grp.length; while (grp.length < 5) grp.push(84); let v = 0; for (const g of grp) v = v * 85 + g; const b4 = [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]; o.push(...b4.slice(0, n - 1)); }
          data = Uint8Array.from(o); continue;
        }
        if (fl === 'ASCIIHexDecode' || fl === 'AHx') { const h = latin1(data).replace(/[^0-9a-fA-F]/g, ''); const o = new Uint8Array(h.length >> 1); for (let i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16); data = o; continue; }
        if (fl === 'FlateDecode') {
          data = await inflate(data);
          const pr = parms && R_(parms.Predictor);
          if (pr >= 10) {
            const cols = R_(parms.Columns) || 1, colors = R_(parms.Colors) || 1, bpc = R_(parms.BitsPerComponent) || 8, bpp = Math.max(1, (colors * bpc) >> 3), rl = Math.ceil((cols * colors * bpc) / 8);
            const rows = Math.floor(data.length / (rl + 1)), out = new Uint8Array(rows * rl);
            for (let y = 0; y < rows; y++) { const t = data[y * (rl + 1)], src = y * (rl + 1) + 1, o2 = y * rl; for (let x = 0; x < rl; x++) { const a = x >= bpp ? out[o2 + x - bpp] : 0, b = y ? out[o2 - rl + x] : 0, c = x >= bpp && y ? out[o2 - rl + x - bpp] : 0, raw = data[src + x]; let v = raw; if (t === 1) v = raw + a; else if (t === 2) v = raw + b; else if (t === 3) v = raw + ((a + b) >> 1); else if (t === 4) { const p0 = a + b - c, pa = Math.abs(p0 - a), pb = Math.abs(p0 - b), pc = Math.abs(p0 - c); v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); } out[o2 + x] = v & 255; } }
            data = out;
          }
        } else if (fl === 'DCTDecode' || fl === 'JPXDecode') break;
      }
      decodeCache.set(o, data); return data;
    }
    // sıkıştırılmış nesne akışları
    for (const [, o] of [...objs]) {
      if (!o.val || !o.val.Type || o.val.Type.n !== 'ObjStm') continue;
      const ds = latin1(await streamBytes(o)), first = R_(o.val.First), n = R_(o.val.N);
      const hl = new PLex(ds); const pairs = [];
      for (let i = 0; i < n; i++) { const a = hl.next(), b = hl.next(); if (!a || !b) break; pairs.push([a.v, b.v]); }
      for (const [num, off] of pairs) if (!objs.has(num)) { try { objs.set(num, { val: new PLex(ds, first + off).value(), stream: null }); } catch (e) {} }
    }
    const objOf = (ref) => (ref && ref.r != null ? objs.get(ref.r) : null);
    const pages = [];
    const roots = [...S.matchAll(/\/Root\s+(\d+)\s+\d+\s+R/g)];
    const walkP = (node, g = 0) => { node = R_(node); if (!node || g > 40) return; const t = node.Type && node.Type.n; if (t === 'Page' || (!t && !node.Kids)) pages.push(node); else (R_(node.Kids) || []).forEach((k) => walkP(k, g + 1)); };
    if (roots.length) { const cat = R_({ r: +roots[roots.length - 1][1] }); if (cat && cat.Pages) walkP(cat.Pages); }
    if (!pages.length) for (const [, o] of objs) if (o.val && o.val.Type && o.val.Type.n === 'Page') pages.push(o.val);
    const page = pages[Math.max(0, Math.min(pages.length - 1, pageIndex))];
    if (!page) throw new Error('Dosyada sayfa bulunamadı');
    const inh = (k) => { let p = page, g = 0; while (p && g++ < 30) { if (p[k] != null) return R_(p[k]); p = R_(p.Parent); } return null; };
    const box = (inh('CropBox') || inh('MediaBox') || [0, 0, 1000, 1000]).map(R_);
    const x0 = Math.min(box[0], box[2]), y0 = Math.min(box[1], box[3]), W = Math.abs(box[2] - box[0]), H = Math.abs(box[3] - box[1]), y1 = y0 + H;
    const F = [1, 0, 0, -1, -x0, y1];
    const mul = (a, b) => [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3], a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5]];
    const ap = (mt, x, y) => [mt[0] * x + mt[2] * y + mt[4], mt[1] * x + mt[3] * y + mt[5]];
    const hex2 = (v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0');
    const rgbHex = (r, g, b) => '#' + hex2(r) + hex2(g) + hex2(b);
    const toHex = (cs, c) => {
      const n = c.length;
      if (cs && cs.kind === 'sep') { const t = c[0] ?? 1; if (cs.c0 && cs.c1) return toHex({ kind: cs.alt }, cs.c1.map((v, i) => cs.c0[i] + t * (v - cs.c0[i]))); return rgbHex(1 - t, 1 - t, 1 - t); }
      const kind = (cs && cs.kind) || (n === 4 ? 'cmyk' : n === 3 ? 'rgb' : 'gray');
      if (kind === 'cmyk' && n >= 4) return rgbHex((1 - c[0]) * (1 - c[3]), (1 - c[1]) * (1 - c[3]), (1 - c[2]) * (1 - c[3]));
      if (kind === 'rgb' && n >= 3) return rgbHex(c[0], c[1], c[2]);
      if (kind === 'idx' && cs.lut) { const i = Math.round(c[0] || 0) * cs.base, l = cs.lut; return cs.bn === 4 ? rgbHex((1 - l[i] / 255) * (1 - l[i + 3] / 255), (1 - l[i + 1] / 255) * (1 - l[i + 3] / 255), (1 - l[i + 2] / 255) * (1 - l[i + 3] / 255)) : cs.bn === 3 ? rgbHex(l[i] / 255, l[i + 1] / 255, l[i + 2] / 255) : rgbHex(l[i] / 255, l[i] / 255, l[i] / 255); }
      if (kind === 'pattern') return cs.color || '#888888';
      return rgbHex(c[0] ?? 0, c[0] ?? 0, c[0] ?? 0);
    };
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const out = [], images = [];
    let count = 0, truncated = false;
    const fontCache = new Map();
    async function csOf(name, res) {
      if (['DeviceRGB', 'RGB', 'CalRGB'].includes(name)) return { kind: 'rgb' };
      if (['DeviceCMYK', 'CMYK'].includes(name)) return { kind: 'cmyk' };
      if (['DeviceGray', 'G', 'CalGray'].includes(name)) return { kind: 'gray' };
      if (name === 'Pattern') return { kind: 'pattern' };
      let v = R_((R_(res && res.ColorSpace) || {})[name]);
      return csFromVal(v);
    }
    async function csFromVal(v) {
      v = R_(v);
      if (v && v.n) return csOf(v.n, null);
      if (!Array.isArray(v)) return { kind: 'rgb' };
      const t = R_(v[0]).n;
      if (t === 'ICCBased') { const st = R_(v[1]); const n = st && R_(st.N); return { kind: n === 4 ? 'cmyk' : n === 1 ? 'gray' : 'rgb' }; }
      if (t === 'Separation' || t === 'DeviceN') {
        const alt = await csFromVal(v[2]), fn = R_(v[3]);
        if (fn && R_(fn.FunctionType) === 2) return { kind: 'sep', alt: alt.kind, c0: (R_(fn.C0) || [0]).map(R_), c1: (R_(fn.C1) || [1]).map(R_) };
        if (R_(v[1]) && R_(v[1]).n === 'Black') return { kind: 'sep', alt: 'cmyk', c0: [0, 0, 0, 0], c1: [0, 0, 0, 1] };
        return { kind: 'sep' };
      }
      if (t === 'Indexed') { const base = await csFromVal(v[1]); const bn = base.kind === 'cmyk' ? 4 : base.kind === 'gray' ? 1 : 3; let lut = R_(v[3]); lut = lut && lut.s != null ? Uint8Array.from(lut.s, (ch) => ch.charCodeAt(0)) : await streamBytes(objOf(v[3])); return { kind: 'idx', base: bn, bn, lut }; }
      if (t === 'Pattern') return { kind: 'pattern' };
      if (t === 'CalRGB' || t === 'Lab') return { kind: 'rgb' };
      return { kind: 'gray' };
    }
    async function patternColor(name, res) {
      try {
        const pat = R_((R_(res && res.Pattern) || {})[name]); const sh = R_(pat && pat.Shading); const fn = R_(sh && sh.Function);
        const f0 = Array.isArray(fn) ? R_(fn[0]) : fn; const cs = await csFromVal(sh.ColorSpace);
        let c0 = f0 && R_(f0.C0), c1 = f0 && R_(f0.C1);
        if (!c0 && f0 && f0.Functions) { const fs = R_(f0.Functions); c0 = R_(R_(fs[0]).C0); c1 = R_(R_(fs[fs.length - 1]).C1); }
        if (c0 && c1) return { kind: 'pattern', color: toHex(cs, c0.map((v, i) => (R_(v) + R_(c1[i])) / 2)), grad: [toHex(cs, c0.map(R_)), toHex(cs, c1.map(R_))] };
      } catch (e) {}
      return { kind: 'pattern', color: '#888888' };
    }
    async function fontOf(ref, name) {
      const key = ref && ref.r != null ? ref.r : name;
      if (fontCache.has(key)) return fontCache.get(key);
      const f = R_(ref) || {};
      const base = ((R_(f.BaseFont) || {}).n || 'Arial').replace(/^[A-Z]{6}\+/, '');
      const two = (R_(f.Subtype) || {}).n === 'Type0';
      const cmap = new Map();
      const tu = objOf(f.ToUnicode);
      if (tu) {
        const t = latin1(await streamBytes(tu));
        const u16 = (h) => { let r = ''; for (let i = 0; i + 3 < h.length; i += 4) r += String.fromCharCode(parseInt(h.substr(i, 4), 16)); if (h.length === 2) r = String.fromCharCode(parseInt(h, 16)); return r; };
        for (const blk of t.match(/beginbfchar([\s\S]*?)endbfchar/g) || []) for (const mm of blk.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) cmap.set(parseInt(mm[1], 16), u16(mm[2]));
        for (const blk of t.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
          for (const mm of blk.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(<[0-9a-fA-F]+>|\[[^\]]*\])/g)) {
            const lo = parseInt(mm[1], 16), hi = parseInt(mm[2], 16);
            if (mm[3][0] === '<') { const h = mm[3].slice(1, -1); const st = parseInt(h.slice(-4), 16), pre = h.length > 4 ? u16(h.slice(0, -4)) : ''; for (let c = lo; c <= hi && c - lo < 65536; c++) cmap.set(c, pre + String.fromCharCode(st + c - lo)); }
            else [...mm[3].matchAll(/<([0-9a-fA-F]+)>/g)].forEach((x, i) => cmap.set(lo + i, u16(x[1])));
          }
        }
      }
      const widths = new Map(); let dw = 1000;
      if (two) {
        const df = R_((R_(f.DescendantFonts) || [])[0]) || {};
        dw = R_(df.DW) || 1000; const w = R_(df.W) || [];
        for (let i = 0; i < w.length;) { const c = R_(w[i]), n2 = R_(w[i + 1]); if (Array.isArray(n2)) { n2.forEach((v, k) => widths.set(c + k, R_(v))); i += 2; } else { const wv = R_(w[i + 2]); for (let k = c; k <= n2; k++) widths.set(k, wv); i += 3; } }
      } else {
        const fc = R_(f.FirstChar) || 0, ws = R_(f.Widths) || []; ws.forEach((v, i) => widths.set(fc + i, R_(v)));
        const fd = R_(f.FontDescriptor); dw = (fd && R_(fd.MissingWidth)) || 500;
      }
      const lower = base.toLowerCase();
      const fam = base.split(/[-,]/)[0].replace(/(MT|PS|Std|Pro)$/,'').replace(/([a-z])([A-Z])/g, '$1 $2').trim() || 'Arial';
      const weight = /black|heavy|ultra/.test(lower) ? 900 : /extrabold|extra ?bold/.test(lower) ? 800 : /semibold|demi/.test(lower) ? 600 : /bold/.test(lower) ? 700 : /medium/.test(lower) ? 500 : /light|thin/.test(lower) ? 300 : 400;
      const ft = { fam, weight, italic: /italic|oblique/.test(lower), two, cmap, widths, dw, type3: (R_(f.Subtype) || {}).n === 'Type3' };
      fontCache.set(key, ft); return ft;
    }
    async function addImage(xo, gs) {
      const d = xo.val; let src = null;
      const filt = R_(d.Filter), fl = Array.isArray(filt) ? filt.map((x) => R_(x).n) : filt ? [filt.n] : [];
      const w = R_(d.Width), h = R_(d.Height);
      const smaskO = objOf(d.SMask);
      const toCanvasData = async () => {
        if (fl.includes('DCTDecode')) {
          const img = await createImageBitmap(new Blob([await streamBytes(xo)], { type: 'image/jpeg' }));
          const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0);
          const id = x.getImageData(0, 0, c.width, c.height);
          const cs = await csFromVal(d.ColorSpace);
          if (cs.kind === 'cmyk') { /* Adobe JPEG CMYK genelde ters: renkleri koru */ }
          return { c, x, id };
        }
        if (fl.length && !fl.every((f2) => f2 === 'FlateDecode')) return null;
        const data = await streamBytes(xo), bpc = R_(d.BitsPerComponent) || 8;
        const cs = d.ImageMask ? { kind: 'gray' } : await csFromVal(d.ColorSpace);
        const nc = cs.kind === 'cmyk' ? 4 : cs.kind === 'rgb' ? 3 : 1;
        const c = new OffscreenCanvas(w, h), x = c.getContext('2d'), id = x.createImageData(w, h), o = id.data;
        const rl = Math.ceil((w * nc * bpc) / 8);
        const get = (y, i) => { if (bpc === 8) return data[y * rl + i]; const bit = i * bpc, by = data[y * rl + (bit >> 3)]; return ((by >> (8 - bpc - (bit & 7))) & ((1 << bpc) - 1)) * (255 / ((1 << bpc) - 1)); };
        for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
          const j = (y * w + xx) * 4;
          if (cs.kind === 'idx') { const i = get(y, xx) / (bpc === 8 ? 1 : 255 / ((1 << bpc) - 1)), hx = toHex(cs, [Math.round(i)]); o[j] = parseInt(hx.slice(1, 3), 16); o[j + 1] = parseInt(hx.slice(3, 5), 16); o[j + 2] = parseInt(hx.slice(5, 7), 16); }
          else if (nc === 4) { const C = get(y, xx * 4) / 255, M = get(y, xx * 4 + 1) / 255, Y = get(y, xx * 4 + 2) / 255, K = get(y, xx * 4 + 3) / 255; o[j] = 255 * (1 - C) * (1 - K); o[j + 1] = 255 * (1 - M) * (1 - K); o[j + 2] = 255 * (1 - Y) * (1 - K); }
          else if (nc === 3) { o[j] = get(y, xx * 3); o[j + 1] = get(y, xx * 3 + 1); o[j + 2] = get(y, xx * 3 + 2); }
          else { const v = get(y, xx); o[j] = o[j + 1] = o[j + 2] = v; }
          o[j + 3] = 255;
        }
        return { c, x, id };
      };
      try {
        const r = await toCanvasData(); if (!r) return;
        if (smaskO) {
          const md = await streamBytes(smaskO), mw = R_(smaskO.val.Width), mh = R_(smaskO.val.Height);
          const o = r.id.data; for (let y = 0; y < r.c.height; y++) for (let x = 0; x < r.c.width; x++) { const sy = Math.floor((y * mh) / r.c.height), sx = Math.floor((x * mw) / r.c.width); o[(y * r.c.width + x) * 4 + 3] = md[sy * mw + sx] ?? 255; }
        }
        r.x.putImageData(r.id, 0, 0);
        const blob = await r.c.convertToBlob({ type: smaskO || !fl.includes('DCTDecode') ? 'image/png' : 'image/jpeg', quality: 0.92 });
        src = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
      } catch (e) { return; }
      const M = mul(mul([1, 0, 0, -1, 0, 1], gs.ctm), F);
      out.push(`<image x="0" y="0" width="1" height="1" preserveAspectRatio="none" transform="matrix(${M.map((v) => +v.toFixed(5)).join(' ')})"${gs.fa < 1 ? ` opacity="${gs.fa}"` : ''} href="${src}"/>`);
      count++;
    }
    async function run(content, res, gs0) {
      const lx = new PLex(content); let ops = [];
      let gs = gs0; const stack = [];
      let path = '', cur = null, start = null, text = null, run_ = null;
      const pt = (x, y) => { const a = ap(gs.ctm, x, y); return [a[0] - x0, y1 - a[1]]; };
      const f2 = (v) => +v.toFixed(2);
      const flushRun = () => { if (run_ && run_.t.trim()) { out.push(`<text x="${f2(run_.x)}" y="${f2(run_.y)}" font-size="${f2(run_.size)}" font-family="${esc(run_.font.fam)}" font-weight="${run_.font.weight}"${run_.font.italic ? ' font-style="italic"' : ''} fill="${run_.fill}"${gs.fa < 1 ? ` fill-opacity="${gs.fa}"` : ''}>${esc(run_.t.replace(/\s+$/, ''))}</text>`); count++; } run_ = null; };
      const paint = (fill, stroke, eo) => {
        if (!path) return;
        if (count > 1500) { truncated = true; path = ''; return; }
        const sc = Math.sqrt(Math.abs(gs.ctm[0] * gs.ctm[3] - gs.ctm[1] * gs.ctm[2])) || 1;
        const fc = fill ? gs.fill : 'none', sc2 = stroke ? gs.stroke : 'none';
        const gr = fill && gs.fcs && gs.fcs.grad;
        let fillAttr = fc;
        if (gr) { const id = 'g' + count; out.push(`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${gr[0]}"/><stop offset="1" stop-color="${gr[1]}"/></linearGradient>`); fillAttr = `url(#${id})`; }
        out.push(`<path d="${path}" fill="${fillAttr}"${eo ? ' fill-rule="evenodd"' : ''}${stroke ? ` stroke="${sc2}" stroke-width="${f2(Math.max(0.1, gs.lw * sc))}"${gs.sa < 1 ? ` stroke-opacity="${gs.sa}"` : ''}` : ''}${fill && gs.fa < 1 ? ` fill-opacity="${gs.fa}"` : ''}/>`);
        count++; path = '';
      };
      const show = (str) => {
        const fnt = gs.font; if (!fnt || !text) return;
        let codes = [];
        if (fnt.two) for (let i = 0; i + 1 < str.length; i += 2) codes.push((str.charCodeAt(i) << 8) | str.charCodeAt(i + 1));
        else codes = [...str].map((c) => c.charCodeAt(0));
        const trm = mul(mul([gs.fs * gs.th, 0, 0, gs.fs, 0, gs.rise], text.tm), gs.ctm);
        const [px, py] = [trm[4] - x0, y1 - trm[5]];
        const size = Math.hypot(trm[2], trm[3]);
        let s2 = '', adv = 0;
        for (const c of codes) {
          const u = fnt.cmap.get(c) ?? (fnt.two ? '' : String.fromCharCode(c));
          s2 += u;
          const wv = (fnt.widths.get(c) ?? fnt.dw) / 1000;
          adv += (wv * gs.fs + gs.tc + (c === 32 && !fnt.two ? gs.tw : 0)) * gs.th;
        }
        const startX = px;
        text.tm = mul([1, 0, 0, 1, adv, 0], text.tm);
        const e = mul(mul([gs.fs * gs.th, 0, 0, gs.fs, 0, gs.rise], text.tm), gs.ctm);
        const endX = e[4] - x0;
        const fill = gs.fill;
        if (run_ && Math.abs(run_.y - py) < size * 0.35 && Math.abs(run_.size - size) < 0.5 && run_.font === fnt && run_.fill === fill && startX - run_.end < size * 1.2 && startX - run_.end > -size * 0.5) {
          if (startX - run_.end > size * 0.18 && !/\s$/.test(run_.t) && !/^\s/.test(s2)) run_.t += ' ';
          run_.t += s2; run_.end = endX;
        } else { flushRun(); run_ = { x: startX, y: py, size, font: fnt, fill, t: s2, end: endX }; }
      };
      for (;;) {
        const tok = lx.next(); if (!tok) break;
        if (tok.t !== 'kw') { ops.push(lx.value(tok)); continue; }
        const op = tok.v, a = ops; ops = [];
        const n = (i) => +R_(a[i]) || 0;
        switch (op) {
          case 'q': stack.push(gs); gs = { ...gs }; break;
          case 'Q': if (stack.length) gs = stack.pop(); break;
          case 'cm': gs.ctm = mul([n(0), n(1), n(2), n(3), n(4), n(5)], gs.ctm); break;
          case 'w': gs.lw = n(0); break;
          case 'gs': { const eg = R_((R_(res.ExtGState) || {})[a[0] && a[0].n]); if (eg) { if (eg.ca != null) gs.fa = +R_(eg.ca); if (eg.CA != null) gs.sa = +R_(eg.CA); if (eg.LW != null) gs.lw = +R_(eg.LW); } break; }
          case 'm': { cur = start = pt(n(0), n(1)); path += `M${f2(cur[0])} ${f2(cur[1])}`; break; }
          case 'l': { cur = pt(n(0), n(1)); path += `L${f2(cur[0])} ${f2(cur[1])}`; break; }
          case 'c': { const p1 = pt(n(0), n(1)), p2 = pt(n(2), n(3)); cur = pt(n(4), n(5)); path += `C${f2(p1[0])} ${f2(p1[1])} ${f2(p2[0])} ${f2(p2[1])} ${f2(cur[0])} ${f2(cur[1])}`; break; }
          case 'v': { const p2 = pt(n(0), n(1)), c0 = cur || p2; cur = pt(n(2), n(3)); path += `C${f2(c0[0])} ${f2(c0[1])} ${f2(p2[0])} ${f2(p2[1])} ${f2(cur[0])} ${f2(cur[1])}`; break; }
          case 'y': { const p1 = pt(n(0), n(1)); cur = pt(n(2), n(3)); path += `C${f2(p1[0])} ${f2(p1[1])} ${f2(cur[0])} ${f2(cur[1])} ${f2(cur[0])} ${f2(cur[1])}`; break; }
          case 'h': path += 'Z'; cur = start; break;
          case 're': { const x = n(0), y = n(1), w = n(2), h = n(3); const q = [pt(x, y), pt(x + w, y), pt(x + w, y + h), pt(x, y + h)]; path += `M${q.map((p) => f2(p[0]) + ' ' + f2(p[1])).join('L')}Z`; cur = start = q[0]; break; }
          case 'f': case 'F': paint(true, false, false); break;
          case 'f*': paint(true, false, true); break;
          case 'S': paint(false, true, false); break;
          case 's': path += 'Z'; paint(false, true, false); break;
          case 'B': paint(true, true, false); break;
          case 'B*': paint(true, true, true); break;
          case 'b': path += 'Z'; paint(true, true, false); break;
          case 'b*': path += 'Z'; paint(true, true, true); break;
          case 'n': path = ''; break;
          case 'g': gs.fcs = { kind: 'gray' }; gs.fill = toHex(gs.fcs, [n(0)]); break;
          case 'G': gs.scs = { kind: 'gray' }; gs.stroke = toHex(gs.scs, [n(0)]); break;
          case 'rg': gs.fcs = { kind: 'rgb' }; gs.fill = toHex(gs.fcs, [n(0), n(1), n(2)]); break;
          case 'RG': gs.scs = { kind: 'rgb' }; gs.stroke = toHex(gs.scs, [n(0), n(1), n(2)]); break;
          case 'k': gs.fcs = { kind: 'cmyk' }; gs.fill = toHex(gs.fcs, [n(0), n(1), n(2), n(3)]); break;
          case 'K': gs.scs = { kind: 'cmyk' }; gs.stroke = toHex(gs.scs, [n(0), n(1), n(2), n(3)]); break;
          case 'cs': gs.fcs = await csOf(a[0] && a[0].n, res); gs.fill = '#000000'; break;
          case 'CS': gs.scs = await csOf(a[0] && a[0].n, res); gs.stroke = '#000000'; break;
          case 'sc': case 'scn': case 'SC': case 'SCN': {
            const fillOp = op[0] === 's'; const nm = a.find((x) => x && x.n);
            const nums = a.filter((x) => typeof x === 'number');
            if (nm) { const pc = await patternColor(nm.n, res); if (fillOp) { gs.fcs = pc; gs.fill = pc.color; } else { gs.scs = pc; gs.stroke = pc.color; } }
            else if (fillOp) gs.fill = toHex(gs.fcs, nums); else gs.stroke = toHex(gs.scs, nums);
            break;
          }
          case 'BT': text = { tm: [1, 0, 0, 1, 0, 0], tlm: [1, 0, 0, 1, 0, 0] }; break;
          case 'ET': text = null; break;
          case 'Tf': { const fr = (R_(res.Font) || {})[a[0] && a[0].n]; gs.font = await fontOf(fr, a[0] && a[0].n); gs.fs = n(1); break; }
          case 'Tc': gs.tc = n(0); break;
          case 'Tw': gs.tw = n(0); break;
          case 'Tz': gs.th = n(0) / 100; break;
          case 'TL': gs.tl = n(0); break;
          case 'Ts': gs.rise = n(0); break;
          case 'Td': if (text) { text.tlm = mul([1, 0, 0, 1, n(0), n(1)], text.tlm); text.tm = text.tlm.slice(); } break;
          case 'TD': if (text) { gs.tl = -n(1); text.tlm = mul([1, 0, 0, 1, n(0), n(1)], text.tlm); text.tm = text.tlm.slice(); } break;
          case 'Tm': if (text) { text.tlm = [n(0), n(1), n(2), n(3), n(4), n(5)]; text.tm = text.tlm.slice(); } break;
          case 'T*': if (text) { text.tlm = mul([1, 0, 0, 1, 0, -gs.tl], text.tlm); text.tm = text.tlm.slice(); } break;
          case 'Tj': if (a[0] && a[0].s != null) show(a[0].s); break;
          case "'": if (text) { text.tlm = mul([1, 0, 0, 1, 0, -gs.tl], text.tlm); text.tm = text.tlm.slice(); } if (a[0] && a[0].s != null) show(a[0].s); break;
          case '"': gs.tw = n(0); gs.tc = n(1); if (text) { text.tlm = mul([1, 0, 0, 1, 0, -gs.tl], text.tlm); text.tm = text.tlm.slice(); } if (a[2] && a[2].s != null) show(a[2].s); break;
          case 'TJ': for (const it of a[0] || []) { if (it && it.s != null) show(it.s); else if (typeof it === 'number' && text) text.tm = mul([1, 0, 0, 1, (-it / 1000) * gs.fs * gs.th, 0], text.tm); } break;
          case 'Do': {
            const ref = (R_(res.XObject) || {})[a[0] && a[0].n]; const xo = objOf(ref); if (!xo || !xo.val) break;
            const st = R_(xo.val.Subtype) && R_(xo.val.Subtype).n;
            if (st === 'Image') await addImage(xo, gs);
            else if (st === 'Form') {
              flushRun();
              const mt = (R_(xo.val.Matrix) || [1, 0, 0, 1, 0, 0]).map(R_);
              const g2 = { ...gs, ctm: mul(mt, gs.ctm) };
              await run(latin1(await streamBytes(xo)), R_(xo.val.Resources) || res, g2);
            }
            break;
          }
          case 'BI': { const e = content.indexOf('EI', lx.p); lx.p = e < 0 ? content.length : e + 2; break; }
          default: break;
        }
      }
      flushRun();
    }
    const res = inh('Resources') || {};
    let contents = R_(page.Contents); if (!Array.isArray(contents)) contents = [page.Contents];
    let txt = '';
    for (const c of contents) txt += latin1(await streamBytes(objOf(c))) + '\n';
    if (/saved without PDF Content/i.test(txt) || !txt.trim()) throw new Error(/saved without PDF Content/i.test(txt) ? 'Bu .ai dosyası PDF içeriği olmadan kaydedilmiş. Illustrator’da “PDF uyumlu dosya oluştur” işaretli kaydet ya da SVG olarak kaydet.' : 'Bu sayfada okunabilir içerik bulunamadı (taranmış/şifreli PDF olabilir).');
    await run(txt, res, { ctm: [1, 0, 0, 1, 0, 0], fill: '#000000', stroke: '#000000', lw: 1, fa: 1, sa: 1, fcs: { kind: 'gray' }, scs: { kind: 'gray' }, font: null, fs: 12, tc: 0, tw: 0, th: 1, tl: 0, rise: 0 });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(2)} ${+H.toFixed(2)}" width="${+W.toFixed(2)}" height="${+H.toFixed(2)}">${out.join('')}</svg>`;
    return { svg, truncated, count, pages: pages.length };
  }
  window.Importers = { parsePSD, importPSD, importSVG, pdfToSVG, absPath, pathBox, shiftPath };
})();
