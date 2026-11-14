/* Tasarım sahnesini (JSON) SVG'ye çevirir, PNG/JPG/SVG dışa aktarır. */
(function () {
  const R = {};
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  R.esc = esc;
  const uid = () => Math.random().toString(36).slice(2, 10);
  R.uid = uid;

  const FONTS = ['Arial', 'Helvetica', 'Segoe UI', 'Arial Black', 'Impact', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Courier New', 'Comic Sans MS', 'Palatino Linotype', 'Garamond', 'Calibri', 'Cambria', 'Consolas', 'Franklin Gothic Medium', 'Lucida Console'];
  R.FONTS = FONTS;
  // yazı tipi aileleri: gömülü + kütüphaneden indirilen + yüklenen (her ağırlık ve italik ayrı yüz)
  const FONT_DB = {};
  R.FONT_DB = FONT_DB;
  const fontStack = (f) => {
    f = f || 'Arial';
    const c = FONT_DB[f] && FONT_DB[f].cat;
    const serif = c ? c === 'serif' : /georgia|times|garamond|palatino|cambria/i.test(f);
    const mono = c ? c === 'mono' : /courier|consolas|lucida console/i.test(f);
    const fb = mono ? 'monospace' : serif ? 'serif' : 'sans-serif';
    return `'${f.replace(/'/g, '')}', ${f === 'Segoe UI' ? "'Segoe UI', Roboto, 'Helvetica Neue', " : ''}${fb}`;
  };
  R.fontStack = fontStack;

  // ---- Renk yardımcıları
  function parseColor(c) {
    if (!c || c === 'none' || c === 'transparent') return { hex: '#000000', a: 0 };
    c = String(c).trim();
    let m = c.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map((x) => x + x).join('');
      if (h.length === 8) return { hex: '#' + h.slice(0, 6), a: parseInt(h.slice(6), 16) / 255 };
      return { hex: '#' + h.slice(0, 6), a: 1 };
    }
    m = c.match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
      const hex = '#' + p.slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
      return { hex, a: p.length > 3 ? p[3] : 1 };
    }
    // isimli renkler
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = c;
    const v = cv.fillStyle;
    if (v.startsWith('#')) return { hex: v, a: 1 };
    return parseColor(v);
  }
  R.parseColor = parseColor;
  R.toHex = (c) => parseColor(c).hex;
  R.rgba = (hex, a) => {
    const { hex: h } = parseColor(hex);
    const n = parseInt(h.slice(1), 16);
    return a >= 1 ? h : `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${+a.toFixed(3)})`;
  };

  // ---- Metin ölçümü ve satır kırma
  const mctx = document.createElement('canvas').getContext('2d');
  function fontCss(l) {
    return `${l.italic ? 'italic ' : ''}${l.fontWeight || 400} ${l.fontSize || 32}px ${fontStack(l.fontFamily)}`;
  }
  function measure(text, l) {
    mctx.font = fontCss(l);
    const ls = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text) ? 0 : l.letterSpacing || 0;
    return mctx.measureText(text).width + ls * Math.max(0, [...text].length - 1);
  }
  R.measure = measure;
  // Karışık stil: **kalın**, {#E2197C|renkli}, {#E2197C*|renkli ve kalın}
  const RICH = /\*\*([^*]+)\*\*|\{(#[0-9a-fA-F]{3,8})(\*?)\|([^}]*)\}/g;
  R.hasRich = (t) => /\*\*[^*]+\*\*|\{#[0-9a-fA-F]{3,8}\*?\|[^}]*\}/.test(String(t || ''));
  R.plain = (t) => String(t ?? '').replace(RICH, (m, b, c, cb, ct) => (b != null ? b : ct));
  // düz metindeki her karakterin stili (dizinler R.plain çıktısına göre)
  function richStyles(t) {
    const st = []; let last = 0, m; const src = String(t ?? '');
    RICH.lastIndex = 0;
    while ((m = RICH.exec(src))) {
      for (let i = last; i < m.index; i++) st.push(null);
      const s = m[1] != null ? { b: 1 } : { c: m[2], b: m[3] ? 1 : 0 };
      const body = m[1] != null ? m[1] : m[4];
      for (let i = 0; i < body.length; i++) st.push(s);
      last = m.index + m[0].length;
    }
    for (let i = last; i < src.length; i++) st.push(null);
    return st;
  }
  function wrap(l) {
    let txt = R.plain(l.text);
    if (l.uppercase) txt = txt.toLocaleUpperCase('tr-TR');
    const maxW = Math.max(10, l.w || 100);
    const out = [];
    for (const para of txt.split('\n')) {
      if (!para) { out.push(''); continue; }
      if (para.includes('\t')) { out.push(para); continue; } // fiyat satırı: sol ⇥ sağ, kırılmaz
      const words = para.split(/([^\S\u00A0\u202F]+)/);
      let line = '';
      for (const w of words) {
        const test = line + w;
        if (line && measure(test.trimEnd(), l) > maxW && w.trim()) {
          out.push(line.trimEnd());
          line = w.trimStart();
          // çok uzun tek kelime: harf harf böl
          while (measure(line, l) > maxW && line.length > 1) {
            let i = line.length - 1;
            while (i > 1 && measure(line.slice(0, i), l) > maxW) i--;
            out.push(line.slice(0, i));
            line = line.slice(i);
          }
        } else line = test;
      }
      out.push(line.trimEnd());
    }
    return out;
  }
  R.wrap = wrap;
  R.layoutText = function (l) {
    if (+l.curve) {
      // yaya yazı: tek satır, yay yüksekliği kadar kutu
      let t = R.plain(l.text).replace(/\s*\n\s*/g, ' ');
      if (l.uppercase) t = t.toLocaleUpperCase('tr-TR');
      l._lines = [t];
      const tw = measure(t, l), th = Math.min(Math.PI * 1.9, (Math.abs(+l.curve) / 100) * Math.PI * 1.9);
      const r = tw / Math.max(0.05, th);
      l._arc = { r, th, tw };
      const sag = r * (1 - Math.cos(Math.min(Math.PI, th / 2)));
      l.h = Math.max(1, Math.round((l.fontSize || 32) * 1.25 + sag));
      return l;
    }
    l._arc = null;
    l._lines = wrap(l);
    l.h = Math.max(1, Math.round(l._lines.length * (l.fontSize || 32) * (l.lineHeight || 1.2)));
    return l;
  };

  // ---- Akış düzeni: metin bloklarını gerçek ölçüyle sırayla yerleştir
  R.reflow = function (d) {
    const flows = d.meta && d.meta.flows;
    if (!flows || !Object.keys(flows).length) return false;
    const W = d.width, H = d.height, m = Math.min(W, H) * 0.04;
    let did = false;
    for (const [g, f] of Object.entries(flows)) {
      const mem = d.layers.filter((l) => l.flow === g && l.visible !== false && !l.rotation);
      if (!mem.length) continue;
      const map = {};
      mem.forEach((l) => (map[l.fo] = map[l.fo] || []).push(l));
      const blocks = Object.keys(map).sort((a, b) => a - b).map((k) => map[k]);
      const gap = +f.gap || Math.min(W, H) * 0.03;
      for (let attempt = 0; attempt < 12; attempt++) {
        blocks.forEach((b) => b.forEach((l) => l.type === 'text' && R.layoutText(l)));
        const box = (b) => { const t = Math.min(...b.map((l) => l.y)); return { t, h: Math.max(...b.map((l) => l.y + l.h)) - t }; };
        const ref = f.ref && d.layers.find((l) => l.id === f.ref && l.visible !== false);
        let over;
        if (f.anchor === 'bottom') {
          let cur = ref ? ref.y - gap : +f.y;
          for (let i = blocks.length - 1; i >= 0; i--) { const bx = box(blocks[i]); const dy = cur - bx.h - bx.t; blocks[i].forEach((l) => (l.y += dy)); cur -= bx.h + gap; }
          over = (f.min != null ? +f.min : m) - (cur + gap);
        } else {
          let cur = +f.y;
          for (const b of blocks) { const bx = box(b); const dy = cur - bx.t; b.forEach((l) => (l.y += dy)); cur += bx.h + gap; }
          const limit = ref ? ref.y - gap : f.max != null ? +f.max : H - m;
          over = cur - gap - limit;
        }
        did = true;
        if (over <= 0.5) break;
        const texts = blocks.flat().filter((l) => l.type === 'text' && l.role !== 'cta' && l.role !== 'badge');
        if (!texts.length) break;
        const big = texts.reduce((a, b) => (b.fontSize > a.fontSize ? b : a));
        if (big.fontSize <= 10) break;
        big.fontSize = Math.round(big.fontSize * 0.92 * 10) / 10;
        big.letterSpacing = (big.letterSpacing || 0) * 0.92;
      }
      blocks.flat().forEach((l) => { l.y = Math.round(l.y * 10) / 10; });
    }
    return did;
  };

  // ---- Normalizasyon (yapay zekadan gelen eksik alanları tamamlar)
  const DEF = { x: 0, y: 0, w: 100, h: 100, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' };
  R.normalize = function (d) {
    d = d || {};
    d.width = Math.max(16, Math.round(+d.width || 1080));
    d.height = Math.max(16, Math.round(+d.height || 1080));
    if (!d.background) d.background = { type: 'solid', color: '#ffffff' };
    if (typeof d.background === 'string') d.background = { type: 'solid', color: d.background };
    d.layers = (d.layers || []).filter(Boolean).map((l) => {
      l = Object.assign({}, DEF, l);
      if (!l.id) l.id = uid();
      ['x', 'y', 'w', 'h', 'rotation', 'opacity'].forEach((k) => (l[k] = +l[k] || (k === 'opacity' ? (l[k] === 0 ? 0 : 1) : 0)));
      if (l.w <= 0) l.w = 10;
      if (l.h <= 0) l.h = 10;
      if (!l.name) l.name = TYPE_NAMES[l.type] || l.type;
      if (l.type === 'text') {
        l.fontSize = +l.fontSize || 32;
        l.fontFamily = l.fontFamily || 'Arial';
        l.fontWeight = +l.fontWeight || 400;
        l.lineHeight = +l.lineHeight || 1.2;
        l.letterSpacing = +l.letterSpacing || 0;
        l.align = l.align || 'left';
        if (l.fill == null) l.fill = '#111111';
        R.layoutText(l);
      }
      if (l.type === 'line') { // eski/LLM uyumluluğu
        l.type = 'path'; l.d = 'M0 50 L100 50'; l.vw = 100; l.vh = 100; l.fill = 'none';
        l.stroke = l.stroke || l.fill || '#111'; l.strokeWidth = l.strokeWidth || 4;
      }
      if (l.type === 'path') { l.vw = +l.vw || 100; l.vh = +l.vh || 100; l.d = l.d || 'M0 0 L100 100'; }
      if (l.type === 'image') { l.fit = l.fit || 'cover'; l.filters = l.filters || {}; }
      if (l.type === 'circle') l.type = 'ellipse';
      if (l.type === 'rectangle') l.type = 'rect';
      return l;
    });
    return d;
  };
  const TYPE_NAMES = { rect: 'Dikdörtgen', ellipse: 'Elips', text: 'Metin', image: 'Görsel', path: 'Şekil', group: 'Grup', adjust: 'Ayar katmanı' };
  R.TYPE_NAMES = TYPE_NAMES;

  // ---- Boya (dolgu / kenar)
  function paint(fill, defs, p) {
    if (fill == null || fill === 'none' || fill === '') return { attr: 'none', op: 1 };
    if (typeof fill === 'object' && fill.type === 'image' && fill.src) {
      const id = p + 'pt' + uid(), src = (paint.images && paint.images[fill.src]) || fill.src;
      defs.push(`<pattern id="${id}" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${esc(src)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>`);
      return { attr: `url(#${id})`, op: 1 };
    }
    if (typeof fill === 'object') {
      const id = p + 'g' + uid();
      const a = ((+fill.angle || 0) * Math.PI) / 180;
      const cx = Math.cos(a) / 2, cy = Math.sin(a) / 2;
      const cols = (fill.colors && fill.colors.length ? fill.colors : ['#000', '#fff']);
      const stops = cols.map((c, i) => {
        const pc = parseColor(c);
        const off = fill.stops && fill.stops[i] != null ? fill.stops[i] : cols.length === 1 ? 0 : i / (cols.length - 1);
        return `<stop offset="${off}" stop-color="${pc.hex}" stop-opacity="${pc.a}"/>`;
      }).join('');
      if (fill.type === 'radial') defs.push(`<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.6">${stops}</radialGradient>`);
      else defs.push(`<linearGradient id="${id}" x1="${0.5 - cx}" y1="${0.5 - cy}" x2="${0.5 + cx}" y2="${0.5 + cy}">${stops}</linearGradient>`);
      return { attr: `url(#${id})`, op: 1 };
    }
    const pc = parseColor(fill);
    return { attr: pc.hex, op: pc.a };
  }

  const MASKS = {
    rounded: 'M15 0 H85 Q100 0 100 15 V85 Q100 100 85 100 H15 Q0 100 0 85 V15 Q0 0 15 0 Z',
    hexagon: 'M25 2 L75 2 L100 50 L75 98 L25 98 L0 50 Z',
    triangle: 'M50 0 L100 100 L0 100 Z',
    star: 'M50 0 L61.8 34.5 L97.6 34.5 L68.8 55.9 L79.4 90.5 L50 69.1 L20.6 90.5 L31.2 55.9 L2.4 34.5 L38.2 34.5 Z',
    heart: 'M50 92 C20 70 0 52 0 30 C0 13 13 2 27 2 C38 2 46 8 50 17 C54 8 62 2 73 2 C87 2 100 13 100 30 C100 52 80 70 50 92 Z',
    arch: 'M0 100 V50 C0 22 22 0 50 0 C78 0 100 22 100 50 V100 Z',
    blob: 'M52 2 C76 0 98 18 99 44 C100 70 84 96 56 99 C30 101 4 86 1 58 C-2 30 26 4 52 2 Z',
    drop: 'M50 0 C50 0 100 46 100 68 C100 86 77 100 50 100 C23 100 0 86 0 68 C0 46 50 0 50 0 Z',
    ticket: 'M0 0 H100 V38 A12 12 0 0 0 100 62 V100 H0 V62 A12 12 0 0 0 0 38 Z',
    scallop: 'M50 0 C58 0 62 8 69 10 C77 12 85 7 91 13 C96 19 92 27 94 35 C96 43 100 46 100 50 C100 54 96 57 94 65 C92 73 96 81 91 87 C85 93 77 88 69 90 C62 92 58 100 50 100 C42 100 38 92 31 90 C23 88 15 93 9 87 C4 81 8 73 6 65 C4 57 0 54 0 50 C0 46 4 43 6 35 C8 27 4 19 9 13 C15 7 23 12 31 10 C38 8 42 0 50 0 Z',
    cloud: 'M26 92 C10 92 0 80 2 66 C3 54 12 46 22 46 C20 30 32 18 46 20 C54 8 72 6 82 18 C90 26 92 36 90 44 C98 48 101 58 99 68 C97 82 86 92 72 92 Z',
    brush: 'M4 8 C20 2 40 6 60 3 C74 1 88 4 97 2 C99 20 96 40 99 58 C100 74 96 88 98 97 C80 99 62 95 44 98 C28 100 14 96 3 98 C1 82 5 64 2 46 C0 32 4 20 4 8 Z',
    octagon: 'M30 0 H70 L100 30 V70 L70 100 H30 L0 70 V30 Z',
  };
  R.MASKS = MASKS;
  R.ensureImageSizes = async function (d) {
    const jobs = (d.layers || []).filter((l) => l.type === 'image' && l.src && !(l.nw && l.nh)).map((l) => new Promise((res) => {
      const im = new Image();
      im.onload = () => { l.nw = im.naturalWidth; l.nh = im.naturalHeight; res(true); };
      im.onerror = () => res(false);
      im.src = l.src;
    }));
    const r = await Promise.all(jobs);
    return r.some(Boolean);
  };

  // ---- Yazı tipi aileleri
  R.registerFamily = function (family, faces, meta = {}) {
    const e = FONT_DB[family] || (FONT_DB[family] = { family, faces: [], cat: meta.cat || 'sans', src: meta.src || 'lib', desc: meta.desc || '' });
    Object.assign(e, { cat: meta.cat || e.cat, src: meta.src || e.src, desc: meta.desc || e.desc });
    for (const f of faces || []) {
      if (e.faces.some((x) => x.url === f.url)) continue;
      const face = Object.assign({}, f);
      try { face._ff = new FontFace(family, `url(${f.url})`, Object.assign({ weight: String(f.weight || 400), style: f.style || 'normal' }, f.range ? { unicodeRange: f.range } : {})); document.fonts.add(face._ff); } catch (er) {}
      e.faces.push(face);
    }
    if (!FONTS.includes(family)) FONTS.push(family);
    return e;
  };
  // bir ailenin gerçekten sahip olduğu ağırlıklar (değişken fontlarda aralık)
  R.fontWeights = function (family) {
    const e = FONT_DB[family]; if (!e || !e.faces.length) return null;
    const ws = new Set(), it = new Set();
    e.faces.forEach((f) => { const p = String(f.weight).split(/\s+/).map(Number); if (p.length === 2) { for (let w = Math.ceil(p[0] / 100) * 100; w <= p[1]; w += 100) { ws.add(w); if (f.style === 'italic') it.add(w); } } else { ws.add(p[0]); if (f.style === 'italic') it.add(p[0]); } });
    return { weights: [...ws].sort((a, b) => a - b), italic: [...it].sort((a, b) => a - b) };
  };
  R.ensureFont = function (family, weight = 400, italic = false) {
    if (!FONT_DB[family] || !document.fonts || !document.fonts.load) return Promise.resolve();
    const spec = `${italic ? 'italic ' : ''}${weight} 40px "${String(family).replace(/"/g, '')}"`;
    return Promise.race([document.fonts.load(spec, 'AaĞğŞşİıÖöÜüÇç₺0').catch(() => {}), new Promise((r) => setTimeout(r, 6000))]);
  };
  // yazı tipleri yüklendikten sonra: bölünemeyen (boşluksuz / bitişik boşluklu) parça kutudan geniş kalmışsa yazıyı küçült
  R.fitUnbreakable = function (d) {
    let n = 0;
    for (const l of (d && d.layers) || []) {
      if (l.type !== 'text' || l.curve || !l.w || !l.text) continue;
      for (let i = 0; i < 10; i++) {
        const words = R.plain(l.text).split(/[^\S\u00A0\u202F]+/).filter(Boolean);
        const longest = Math.max(0, ...words.map((w) => R.measure(l.uppercase ? w.toLocaleUpperCase('tr-TR') : w, l)));
        if (longest <= l.w * 1.005) break;
        const f = Math.max(0.6, (l.w * 0.97) / longest);
        l.fontSize = Math.round(l.fontSize * f * 10) / 10; l.letterSpacing = Math.round((l.letterSpacing || 0) * f * 10) / 10; n++;
        R.layoutText(l);
      }
    }
    return n;
  };
  R.ensureDocFonts = async function (d) {
    const seen = new Set(), jobs = [];
    for (const l of (d && d.layers) || []) {
      if (l.type !== 'text' || !FONT_DB[l.fontFamily]) continue;
      const ws = [l.fontWeight || 400]; if (/\*\*|<b>/i.test(l.text || '')) ws.push(700);
      for (const w of ws) { const k = l.fontFamily + '|' + w + '|' + !!l.italic; if (seen.has(k)) continue; seen.add(k); jobs.push(R.ensureFont(l.fontFamily, w, !!l.italic)); }
    }
    await Promise.all(jobs);
    return jobs.length;
  };
  // ---- Özel yazı tipleri
  R.customFonts = [];
  R.loadFonts = async function (list) {
    for (const f of list || []) {
      const wt = String(f.weight || 400), stl = f.style || 'normal';
      if (R.customFonts.find((x) => x.family === f.family && String(x.weight || 400) === wt && (x.style || 'normal') === stl)) continue;
      try {
        const ff = new FontFace(f.family, `url(${f.url})`, { weight: wt, style: stl });
        await ff.load();
        document.fonts.add(ff);
        R.customFonts.push(f);
        if (!FONTS.includes(f.family)) FONTS.unshift(f.family);
      } catch (e) { console.warn('font yüklenemedi', f); }
    }
  };

  const FILTER_KEYS = ['brightness', 'contrast', 'saturate', 'hue', 'grayscale', 'sepia', 'invert', 'blur', 'warmth', 'shadows', 'highlights', 'sharpen', 'vibrance'];
  R.FILTER_KEYS = FILTER_KEYS;
  function filterDef(l, defs, p) {
    const f = l.filters || {};
    const sh = l.shadow;
    const hasAdj = l.type === 'image' && (FILTER_KEYS.some((k) => k !== 'blur' && f[k] != null && f[k] !== (k === 'brightness' || k === 'contrast' || k === 'saturate' ? 100 : 0)) || (f.duotone && f.duotone.length === 2));
    const blur = +f.blur || 0;
    const fx = l.fx || {};
    const hasFx = !!(fx.glow || fx.outline || fx.inner || fx.overlay);
    if (!hasAdj && !blur && !(sh && (sh.blur || sh.x || sh.y)) && !hasFx) return '';
    const id = p + 'f' + uid();
    let prims = '', last = 'SourceGraphic';
    if (hasAdj) {
      const b = (f.brightness ?? 100) / 100, c = (f.contrast ?? 100) / 100;
      const sl = b * c, ic = 0.5 - 0.5 * c;
      prims += `<feComponentTransfer in="${last}" result="bc"><feFuncR type="linear" slope="${sl}" intercept="${ic}"/><feFuncG type="linear" slope="${sl}" intercept="${ic}"/><feFuncB type="linear" slope="${sl}" intercept="${ic}"/></feComponentTransfer>`;
      last = 'bc';
      if (f.shadows || f.highlights) { // gölgeleri aç / ışıkları geri kazan (ton eğrisi)
        const S = (f.shadows || 0) / 100, Hh = (f.highlights || 0) / 100, tv = [];
        for (let i = 0; i <= 16; i++) { const x = i / 16; tv.push(Math.max(0, Math.min(1, x + S * 1.3 * x * (1 - x) * (1 - x) + Hh * 1.3 * x * x * (1 - x))).toFixed(4)); }
        prims += `<feComponentTransfer in="${last}" result="tone"><feFuncR type="table" tableValues="${tv.join(' ')}"/><feFuncG type="table" tableValues="${tv.join(' ')}"/><feFuncB type="table" tableValues="${tv.join(' ')}"/></feComponentTransfer>`; last = 'tone';
      }
      const sat = ((f.saturate ?? 100) / 100) * (1 - (f.grayscale || 0) / 100) * (1 + (f.vibrance || 0) / 250);
      prims += `<feColorMatrix in="${last}" type="saturate" values="${Math.max(0, sat)}" result="sat"/>`; last = 'sat';
      if (f.warmth) { const t = f.warmth / 100; prims += `<feColorMatrix in="${last}" type="matrix" values="${(1 + 0.14 * t).toFixed(3)} 0 0 0 ${(0.02 * t).toFixed(3)} 0 ${(1 + 0.03 * t).toFixed(3)} 0 0 0 0 0 ${(1 - 0.16 * t).toFixed(3)} 0 ${(-0.02 * t).toFixed(3)} 0 0 0 1 0" result="warm"/>`; last = 'warm'; }
      if (f.sharpen) { const a = (f.sharpen / 100) * 0.9; prims += `<feConvolveMatrix in="${last}" order="3" kernelMatrix="0 ${-a} 0 ${-a} ${1 + 4 * a} ${-a} 0 ${-a} 0" edgeMode="duplicate" preserveAlpha="true" result="shp"/>`; last = 'shp'; }
      if (f.hue) { prims += `<feColorMatrix in="${last}" type="hueRotate" values="${f.hue}" result="hue"/>`; last = 'hue'; }
      if (f.sepia) {
        const s = f.sepia / 100, i = 1 - s;
        const m = [0.393 * s + i, 0.769 * s, 0.189 * s, 0, 0, 0.349 * s, 0.686 * s + i, 0.168 * s, 0, 0, 0.272 * s, 0.534 * s, 0.131 * s + i, 0, 0, 0, 0, 0, 1, 0];
        prims += `<feColorMatrix in="${last}" type="matrix" values="${m.map((v) => +v.toFixed(4)).join(' ')}" result="sep"/>`; last = 'sep';
      }
      if (f.duotone && f.duotone.length === 2) {
        const a = parseColor(f.duotone[0]).hex, b = parseColor(f.duotone[1]).hex;
        const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16) / 255;
        prims += `<feColorMatrix in="${last}" type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" result="lum"/><feComponentTransfer in="lum" result="duo"><feFuncR type="table" tableValues="${ch(a, 0).toFixed(3)} ${ch(b, 0).toFixed(3)}"/><feFuncG type="table" tableValues="${ch(a, 1).toFixed(3)} ${ch(b, 1).toFixed(3)}"/><feFuncB type="table" tableValues="${ch(a, 2).toFixed(3)} ${ch(b, 2).toFixed(3)}"/></feComponentTransfer>`;
        last = 'duo';
      }
      if (f.invert) {
        const v = f.invert / 100;
        prims += `<feComponentTransfer in="${last}" result="inv"><feFuncR type="table" tableValues="${v} ${1 - v}"/><feFuncG type="table" tableValues="${v} ${1 - v}"/><feFuncB type="table" tableValues="${v} ${1 - v}"/></feComponentTransfer>`; last = 'inv';
      }
    }
    if (blur) { prims += `<feGaussianBlur in="${last}" stdDeviation="${blur}" result="bl"/>`; last = 'bl'; }
    if (hasFx) {
      // katman efektleri: alttakiler (parıltı, dış kontur, gölge) + kaynak + üsttekiler (iç gölge, renk kaplama)
      const col = (c, d) => parseColor(c || d);
      const under = [];
      if (sh && (sh.blur || sh.x || sh.y)) {
        const pc = col(sh.color, 'rgba(0,0,0,0.35)');
        prims += `<feGaussianBlur in="SourceAlpha" stdDeviation="${(sh.blur || 0) / 2}" result="sb"/><feOffset in="sb" dx="${sh.x || 0}" dy="${sh.y || 0}" result="so"/><feFlood flood-color="${pc.hex}" flood-opacity="${pc.a}"/><feComposite in2="so" operator="in" result="shd"/>`;
        under.push('shd');
      }
      if (fx.glow) {
        const g = fx.glow, pc = col(g.color, '#FFFFFF');
        prims += `<feMorphology in="SourceAlpha" operator="dilate" radius="${Math.max(0, (+g.spread || 0))}" result="gd"/><feGaussianBlur in="gd" stdDeviation="${Math.max(0.5, +g.blur || 12)}" result="gb"/><feFlood flood-color="${pc.hex}" flood-opacity="${(g.opacity ?? 0.9) * pc.a}"/><feComposite in2="gb" operator="in" result="glw"/>`;
        under.push('glw');
        if (g.strong) under.push('glw');
      }
      if (fx.outline) {
        const o = fx.outline, pc = col(o.color, '#FFFFFF');
        prims += `<feMorphology in="SourceAlpha" operator="dilate" radius="${Math.max(0.5, +o.width || 6)}" result="od"/><feFlood flood-color="${pc.hex}" flood-opacity="${pc.a}"/><feComposite in2="od" operator="in" result="otl"/>`;
        under.push('otl');
      }
      let top = last;
      if (fx.overlay) {
        const pc = col(fx.overlay.color, '#E2197C');
        prims += `<feFlood flood-color="${pc.hex}" flood-opacity="${(fx.overlay.opacity ?? 1) * pc.a}"/><feComposite in2="SourceAlpha" operator="in" result="ovc"/><feMerge result="ovm"><feMergeNode in="${top}"/><feMergeNode in="ovc"/></feMerge><feComposite in="ovm" in2="SourceAlpha" operator="in" result="ov"/>`;
        top = 'ov';
      }
      if (fx.inner) {
        const n = fx.inner, pc = col(n.color, 'rgba(0,0,0,0.6)');
        prims += `<feComponentTransfer in="SourceAlpha" result="ia"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer><feGaussianBlur in="ia" stdDeviation="${Math.max(0.5, +n.blur || 6)}" result="ib"/><feOffset in="ib" dx="${n.x ?? 3}" dy="${n.y ?? 3}" result="io"/><feFlood flood-color="${pc.hex}" flood-opacity="${pc.a}"/><feComposite in2="io" operator="in" result="ic"/><feComposite in="ic" in2="SourceAlpha" operator="in" result="ii"/><feMerge result="inn"><feMergeNode in="${top}"/><feMergeNode in="ii"/></feMerge>`;
        top = 'inn';
      }
      prims += `<feMerge>${under.map((u) => `<feMergeNode in="${u}"/>`).join('')}<feMergeNode in="${top}"/></feMerge>`;
      defs.push(`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">${prims}</filter>`);
      return `url(#${id})`;
    }
    if (sh && (sh.blur || sh.x || sh.y)) {
      const pc = parseColor(sh.color || 'rgba(0,0,0,0.35)');
      prims += `<feDropShadow in="${last}" dx="${sh.x || 0}" dy="${sh.y || 0}" stdDeviation="${(sh.blur || 0) / 2}" flood-color="${pc.hex}" flood-opacity="${pc.a}"/>`;
    }
    defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">${prims}</filter>`);
    return `url(#${id})`;
  }

  function strokeAttrs(l) {
    if (!l.stroke || l.stroke === 'none' || !(+l.strokeWidth > 0)) return '';
    const pc = parseColor(l.stroke);
    let s = ` stroke="${pc.hex}" stroke-opacity="${pc.a}" stroke-width="${l.strokeWidth}"`;
    if (l.dash === 'dot') s += ` stroke-dasharray="0.01 ${l.strokeWidth * 2}" stroke-linecap="round"`;
    else if (l.dash === 'long') s += ` stroke-dasharray="${l.strokeWidth * 6} ${l.strokeWidth * 3}"`;
    else if (l.dash) s += ` stroke-dasharray="${l.strokeWidth * 3} ${l.strokeWidth * 2}"`;
    return s;
  }

  function layerTransform(l) {
    const w = l.w, h = l.h;
    const sx = l.flipX ? -1 : 1, sy = l.flipY ? -1 : 1;
    let tf = `translate(${l.x + w / 2} ${l.y + h / 2})`;
    if (l.rotation) tf += ` rotate(${l.rotation})`;
    if (+l.skewX) tf += ` skewX(${+l.skewX})`;
    if (+l.skewY) tf += ` skewY(${+l.skewY})`;
    if (sx < 0 || sy < 0) tf += ` scale(${sx} ${sy})`;
    return tf + ` translate(${-w / 2} ${-h / 2})`;
  }
  R.layerTransform = layerTransform;

  function layerSVG(l, defs, p, opts) {
    if (!l.visible && !opts.showHidden) return '';
    const w = l.w, h = l.h;
    const tf = layerTransform(l);
    const filt = filterDef(l, defs, p);
    const style = l.blend && l.blend !== 'normal' ? ` style="mix-blend-mode:${l.blend}"` : '';
    let inner = '';
    const fp = paint(l.fill, defs, p);
    const fillA = `fill="${fp.attr}"${fp.op < 1 ? ` fill-opacity="${fp.op}"` : ''}`;
    if (l.type === 'rect') {
      const r = Math.min(+l.radius || 0, w / 2, h / 2);
      inner = `<rect width="${w}" height="${h}" rx="${r}" ${fillA}${strokeAttrs(l)}/>`;
    } else if (l.type === 'ellipse') {
      inner = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" ${fillA}${strokeAttrs(l)}/>`;
    } else if (l.type === 'path') {
      const cap = l.fill === 'none' ? ' stroke-linecap="round" stroke-linejoin="round"' : ' stroke-linejoin="round"';
      let bool = '';
      if (l.bool && l.bool.d) {
        const bid = p + 'b' + uid();
        if (l.bool.op === 'intersect') { defs.push(`<clipPath id="${bid}" clipPathUnits="userSpaceOnUse"><path d="${esc(l.bool.d)}"/></clipPath>`); bool = ` clip-path="url(#${bid})"`; }
        else { defs.push(`<mask id="${bid}" maskUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000"><rect x="-100000" y="-100000" width="200000" height="200000" fill="#fff"/><path d="${esc(l.bool.d)}" fill="#000"/></mask>`); bool = ` mask="url(#${bid})"`; }
      }
      inner = `<svg width="${w}" height="${h}" viewBox="0 0 ${l.vw} ${l.vh}" preserveAspectRatio="none" overflow="visible"><path d="${esc(l.d)}" ${fillA}${strokeAttrs(l)}${cap}${l.evenodd ? ' fill-rule="evenodd"' : ''} vector-effect="non-scaling-stroke"${bool}/></svg>`;
    } else if (l.type === 'image') {
      const src = (opts.images && opts.images[l.src]) || l.src;
      const cid = p + 'c' + uid();
      const r = Math.min(+l.radius || 0, w / 2, h / 2);
      const mask = l.mask || 'none';
      let clip;
      if (mask === 'circle') clip = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"/>`;
      else if (MASKS[mask]) clip = `<path d="${MASKS[mask]}" transform="scale(${w / 100} ${h / 100})"/>`;
      else clip = `<rect width="${w}" height="${h}" rx="${r}"/>`;
      defs.push(`<clipPath id="${cid}">${clip}</clipPath>`);
      let img;
      const z = Math.max(1, +l.zoom || 1);
      if (l.crop && l.nw && l.nh) {
        // kaynak görselin bir bölgesini kullan (logo, barkod, ürün fotoğrafı)
        const c = l.crop, sx = c.x * l.nw, sy = c.y * l.nh, sw = Math.max(1, c.w * l.nw), sh = Math.max(1, c.h * l.nh);
        const par = l.fit === 'cover' ? 'xMidYMid slice' : l.fit === 'fill' ? 'none' : 'xMidYMid meet';
        img = `<svg width="${w}" height="${h}" viewBox="${sx.toFixed(1)} ${sy.toFixed(1)} ${sw.toFixed(1)} ${sh.toFixed(1)}" preserveAspectRatio="${par}"><image href="${esc(src)}" width="${l.nw}" height="${l.nh}"/></svg>`;
      } else if (l.nw && l.nh && l.fit !== 'fill') {
        const sc = (l.fit === 'contain' ? Math.min(w / l.nw, h / l.nh) : Math.max(w / l.nw, h / l.nh)) * z;
        const iw = l.nw * sc, ih = l.nh * sc;
        let ix = ((w - iw) / 2) * (1 + (+l.ox || 0)), iy = ((h - ih) / 2) * (1 + (+l.oy || 0));
        // akıllı kadraj: yüz / ilgi noktası çerçevenin ortasına (dikeyde biraz yukarı) gelsin; her ölçüde yeniden hesaplanır
        if (l.focus && !+l.ox && !+l.oy && l.fit !== 'contain') { const cl = (v, a, b) => Math.max(a, Math.min(b, v)); ix = cl(w / 2 - l.focus.x * iw, w - iw, 0); iy = cl(h * 0.42 - l.focus.y * ih, h - ih, 0); }
        img = `<image href="${esc(src)}" x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${iw.toFixed(2)}" height="${ih.toFixed(2)}" preserveAspectRatio="none"/>`;
      } else {
        const par = l.fit === 'contain' ? 'xMidYMid meet' : l.fit === 'fill' ? 'none' : 'xMidYMid slice';
        img = `<image href="${esc(src)}" width="${w}" height="${h}" preserveAspectRatio="${par}"/>`;
      }
      if (l.alphaMask) {
        const mid = p + 'm' + uid(), msrc = (opts.images && opts.images[l.alphaMask]) || l.alphaMask;
        defs.push(`<mask id="${mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><image href="${esc(msrc)}" width="${w}" height="${h}" preserveAspectRatio="none"/></mask>`);
        img = `<g mask="url(#${mid})">${img}</g>`;
      }
      if (l.fade) {
        // yumuşak / bulutsu kenar: resim değişse de kenarlar zemine erir
        const fd = l.fade, fid = p + 'f' + uid(), gid2 = p + 'g' + uid(), m = Math.min(w, h);
        const t = (+fd.t || 0) * h, b = (+fd.b || 0) * h, lft = (+fd.l || 0) * w, rgt = (+fd.r || 0) * w, bl = (fd.soft || 0.06) * m;
        const turb = fd.cloud ? `<feTurbulence type="fractalNoise" baseFrequency="${(3 / m).toFixed(4)}" numOctaves="4" seed="${fd.seed || 4}"/><feDisplacementMap in="SourceGraphic" scale="${(m * 0.12).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="${bl.toFixed(1)}"/>` : `<feGaussianBlur stdDeviation="${bl.toFixed(1)}"/>`;
        defs.push(`<filter id="${fid}" filterUnits="userSpaceOnUse" x="${-w}" y="${-h}" width="${w * 3}" height="${h * 3}">${turb}</filter><mask id="${gid2}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect x="${lft.toFixed(1)}" y="${t.toFixed(1)}" width="${Math.max(1, w - lft - rgt).toFixed(1)}" height="${Math.max(1, h - t - b).toFixed(1)}" fill="#fff" filter="url(#${fid})"/></mask>`);
        img = `<g mask="url(#${gid2})">${img}</g>`;
      }
      inner = `<g clip-path="url(#${cid})">${img}</g>`;
      if (l.stroke && +l.strokeWidth > 0) {
        const outline = mask === 'circle' ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"` : MASKS[mask] ? `<svg width="${w}" height="${h}" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible"><path d="${MASKS[mask]}" vector-effect="non-scaling-stroke"` : `<rect width="${w}" height="${h}" rx="${r}"`;
        inner += outline + ` fill="none"${strokeAttrs(l)}/>` + (MASKS[mask] ? '</svg>' : '');
      }
    } else if (l.type === 'text') {
      R.layoutText(l);
      const fs = l.fontSize, lh = fs * l.lineHeight;
      const anchor = l.align === 'center' ? 'middle' : l.align === 'right' ? 'end' : 'start';
      const ax = l.align === 'center' ? w / 2 : l.align === 'right' ? w : 0;
      const base = (lh - fs) / 2 + fs * 0.8;
      const st = l.stroke && +l.strokeWidth > 0 ? strokeAttrs(l) + ' paint-order="stroke"' : '';
      const deco = l.underline && l.strike ? ' text-decoration="underline line-through"' : l.underline ? ' text-decoration="underline"' : l.strike ? ' text-decoration="line-through"' : '';
      const rich = R.hasRich(l.text) ? richStyles(l.text) : null;
      let plainSrc = R.plain(l.text); if (l.uppercase) plainSrc = plainSrc.toLocaleUpperCase('tr-TR');
      let cur = 0;
      const lineHTML = (ln) => {
        if (!rich || !ln) return esc(ln) || ' ';
        // satırın düz metindeki yerini bul ve karakter stillerini parçalara ayır
        let at = plainSrc.indexOf(ln, cur); if (at < 0) at = cur;
        cur = at + ln.length;
        let out = '', run = '', rs;
        const flush = () => { if (!run) return; const a = rs ? `${rs.c ? ` fill="${esc(rs.c)}"` : ''}${rs.b ? ' font-weight="800"' : ''}` : ''; out += a ? `<tspan${a}>${esc(run)}</tspan>` : esc(run); run = ''; };
        for (let k = 0; k < ln.length; k++) { const sk = rich[at + k] || null; if (sk !== rs) { flush(); rs = sk; } run += ln[k]; }
        flush();
        return out;
      };
      let tspans;
      // Arapça / İbranice: sağdan sola yaz, harfler birleşsin diye harf aralığı uygulanmaz
      const rtl = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(plainSrc);
      const tattrs = `xml:space="preserve" font-family="${esc(fontStack(l.fontFamily))}" font-size="${fs}" font-weight="${l.fontWeight}"${l.italic ? ' font-style="italic"' : ''} letter-spacing="${rtl ? 0 : l.letterSpacing || 0}"${rtl ? ' direction="rtl" unicode-bidi="embed"' : ''}`;
      if (l._arc) {
        const { r, th } = l._arc, up = +l.curve > 0, cx = w / 2, bl = fs * 0.95;
        const cy = up ? bl + r : h - fs * 0.3 - r;
        const a0 = up ? -Math.PI / 2 - th / 2 : Math.PI / 2 + th / 2, a1 = up ? -Math.PI / 2 + th / 2 : Math.PI / 2 - th / 2;
        const P = (a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
        const pid = p + 'tp' + uid();
        defs.push(`<path id="${pid}" d="M${P(a0)} A${r.toFixed(2)} ${r.toFixed(2)} 0 ${th > Math.PI ? 1 : 0} ${up ? 1 : 0} ${P(a1)}" fill="none"/>`);
        inner = `<text ${tattrs} text-anchor="middle" ${fillA}${st}${deco}><textPath href="#${pid}" startOffset="50%">${lineHTML(l._lines[0])}</textPath></text>`;
      } else {
        // fiyat satırı: "Ürün<TAB>₺100" → sol yaslı ad, sağ yaslı fiyat, arası noktalı çizgi
        let leaders = '';
        const lstyle = l.leader || 'dots';
        tspans = l._lines.map((ln, i) => {
          const y = (base + i * lh).toFixed(2);
          if (!ln.includes('\t')) return `<tspan x="${ax}" y="${y}">${lineHTML(ln)}</tspan>`;
          const k = ln.lastIndexOf('\t'), L = ln.slice(0, k).replace(/\t/g, ' '), Rt = ln.slice(k + 1);
          const lw = L ? measure(L, l) : 0, rw = Rt ? measure(Rt, l) : 0, gap = fs * 0.35, x1 = lw + gap, x2 = w - rw - gap;
          if (lstyle !== 'none' && x2 - x1 > fs * 0.5) {
            const ly = (+y - fs * 0.12).toFixed(2), sw = Math.max(1, fs * (lstyle === 'line' ? 0.05 : 0.09));
            const da = lstyle === 'dots' ? `stroke-dasharray="0 ${(fs * 0.3).toFixed(2)}" stroke-linecap="round"` : lstyle === 'dash' ? `stroke-dasharray="${(fs * 0.35).toFixed(2)} ${(fs * 0.25).toFixed(2)}"` : '';
            leaders += `<line x1="${x1.toFixed(2)}" y1="${ly}" x2="${x2.toFixed(2)}" y2="${ly}" stroke="${fillA.match(/fill="([^"]*)"/) ? fillA.match(/fill="([^"]*)"/)[1] : '#000'}" stroke-opacity="${l.leaderOpacity ?? 0.55}" stroke-width="${sw.toFixed(2)}" ${da}/>`;
          }
          return `<tspan x="0" y="${y}" text-anchor="start">${lineHTML(L)}</tspan><tspan x="${w}" y="${y}" text-anchor="end">${lineHTML(Rt)}</tspan>`;
        }).join('');
        const anc = rtl ? (anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : anchor) : anchor;
        inner = leaders + `<text ${tattrs} text-anchor="${anc}" ${fillA}${st}${deco}>${tspans}</text>`;
      }
      if (l.bgFill && l.bgFill !== 'none') {
        const bp = paint(l.bgFill, defs, p), pd = l.bgPad ?? fs * 0.3;
        inner = `<rect x="${-pd}" y="${-pd}" width="${w + 2 * pd}" height="${h + 2 * pd}" rx="${l.radius || 0}" fill="${bp.attr}" fill-opacity="${bp.op}"/>` + inner;
      }
    }
    if (l.fx && (l.fx.echo || l.fx.glitch) && inner && l.type !== 'image') {
      const mk = (col) => { const pc = parseColor(col), sid = p + 'sc' + uid(); defs.push(`<filter id="${sid}" x="-10%" y="-10%" width="120%" height="120%"><feFlood flood-color="${pc.hex}" flood-opacity="${pc.a}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`); return sid; };
      let behind = '';
      if (l.fx.glitch) {
        const o = Math.max(1, +l.fx.glitch.offset || 6);
        behind += `<g filter="url(#${mk(l.fx.glitch.a || '#00E5FF')})" transform="translate(${-o} 0)">${inner}</g><g filter="url(#${mk(l.fx.glitch.b || '#FF2D9B')})" transform="translate(${o} 0)">${inner}</g>`;
      }
      if (l.fx.echo) {
        const e = l.fx.echo, n = Math.max(1, Math.min(6, +e.count || 3)), g = +e.gap || 8, ang = ((+e.angle || 45) * Math.PI) / 180, sid = mk(e.color || '#E2197C');
        for (let i = n; i >= 1; i--) behind += `<g filter="url(#${sid})" opacity="${(1 - i / (n + 1)).toFixed(2)}" transform="translate(${(Math.cos(ang) * g * i).toFixed(2)} ${(Math.sin(ang) * g * i).toFixed(2)})">${inner}</g>`;
      }
      inner = behind + inner;
    }
    if (l.fx && l.fx.long && inner && l.type !== 'image') {
      const lg = l.fx.long, pc = parseColor(lg.color || 'rgba(0,0,0,0.35)');
      const len = Math.max(1, Math.min(400, +lg.length || 30)), ang = ((+lg.angle || 45) * Math.PI) / 180;
      const n = Math.min(60, Math.ceil(len)), sid = p + 'ls' + uid();
      defs.push(`<filter id="${sid}" x="-10%" y="-10%" width="120%" height="120%"><feFlood flood-color="${pc.hex}" flood-opacity="${pc.a}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`);
      let copies = '';
      for (let i = n; i >= 1; i--) { const d = (len * i) / n; copies += `<g transform="translate(${(Math.cos(ang) * d).toFixed(2)} ${(Math.sin(ang) * d).toFixed(2)})">${inner}</g>`; }
      inner = `<g filter="url(#${sid})"${lg.fade ? ' opacity="0.85"' : ''}>${copies}</g>` + inner;
    }
    const op = l.visible === false ? 0.25 : l.opacity;
    return `<g data-id="${l.id}" transform="${tf}"${op < 1 ? ` opacity="${op}"` : ''}${filt ? ` filter="${filt}"` : ''}${style}>${inner}</g>`;
  }

  function bleedLayers(d, b) {
    // Kenara değen (döndürülmemiş, metin olmayan) katmanları taşma payına uzat
    const W = d.width, H = d.height, e = 1.5;
    return d.layers.map((l) => {
      if (l.type === 'text' || l.rotation || !b) return l;
      const c = Object.assign({}, l);
      if (c.x <= e) { c.w += c.x + b; c.x = -b; }
      if (c.y <= e) { c.h += c.y + b; c.y = -b; }
      if (c.x + c.w >= W - e) c.w = W + b - c.x;
      if (c.y + c.h >= H - e) c.h = H + b - c.y;
      return c;
    });
  }

  R.renderSVG = function (d, opts = {}) {
    const p = opts.prefix || 'r' + uid() + '_';
    paint.images = opts.images || null;
    const defs = [];
    const W = d.width, H = d.height, b = opts.bleed || 0;
    const bp = paint(d.background && (d.background.type === 'solid' ? d.background.color : d.background), defs, p);
    let body = `<rect x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" fill="${bp.attr}"${bp.op < 1 ? ` fill-opacity="${bp.op}"` : ''}/>`;
    const layers = b ? bleedLayers(d, b) : d.layers || [];
    for (const l of layers) {
      if (l.type === 'adjust') {
        // ayar katmanı: altındaki her şeye filtre uygular (aslı bozulmaz)
        if (l.visible === false) continue;
        const fid = filterDef(Object.assign({}, l, { type: 'image', shadow: null, fx: null }), defs, p);
        if (!fid) continue;
        const op = +l.opacity;
        body = op < 1 ? `${body}<g opacity="${op}" filter="${fid}" data-id="${l.id}">${body}</g>` : `<g filter="${fid}" data-id="${l.id}">${body}</g>`;
        continue;
      }
      body += layerSVG(l, defs, p, opts);
    }
    const vw = W + 2 * b, vh = H + 2 * b;
    const size = opts.fit ? `width="100%" height="100%"` : `width="${vw * (opts.scale || 1)}" height="${vh * (opts.scale || 1)}"`;
    const style = opts.fontCSS ? `<style>${opts.fontCSS}</style>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${-b} ${-b} ${vw} ${vh}" ${size}${opts.cls ? ` class="${opts.cls}"` : ''} style="isolation:isolate">${style}${opts.clip !== false ? `<defs><clipPath id="${p}root"><rect x="${-b}" y="${-b}" width="${vw}" height="${vh}"/></clipPath>${defs.join('')}</defs><g clip-path="url(#${p}root)">${body}</g>` : `<defs>${defs.join('')}</defs>${body}`}</svg>`;
  };

  // ---- Dışa aktarma
  const dataCache = {};
  async function toDataURL(src) {
    if (!src || src.startsWith('data:')) return src;
    if (dataCache[src]) return dataCache[src];
    const r = await fetch(src);
    const b = await r.blob();
    const u = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
    dataCache[src] = u;
    return u;
  }
  R.inlineImages = async function (d) {
    const images = {};
    for (const l of d.layers) if (l.type === 'image' && l.src) {
      try { images[l.src] = await toDataURL(l.src); } catch (e) { console.warn('görsel alınamadı', l.src); }
      if (l.alphaMask) { try { images[l.alphaMask] = await toDataURL(l.alphaMask); } catch (e) {} }
    }
    for (const l of d.layers) if (l.fill && typeof l.fill === 'object' && l.fill.type === 'image' && l.fill.src && !images[l.fill.src]) {
      try { images[l.fill.src] = await toDataURL(l.fill.src); } catch (e) {}
    }
    return images;
  };
  const faceCache = {};
  async function fontCSS(d) {
    const used = new Set(d.layers.filter((l) => l.type === 'text').map((l) => l.fontFamily));
    let css = '';
    // kütüphane aileleri: kullanılan ağırlık/italik için en yakın yüzleri göm (Türkçe karakter dahil)
    const want = {};
    for (const l of d.layers) {
      if (l.type !== 'text' || !FONT_DB[l.fontFamily]) continue;
      const k = l.fontFamily; want[k] = want[k] || new Set();
      want[k].add((+l.fontWeight || 400) + (l.italic ? 'i' : '')); if (/\*\*|<b>/i.test(l.text || '')) want[k].add(700 + (l.italic ? 'i' : ''));
    }
    for (const fam of Object.keys(want)) {
      const faces = FONT_DB[fam].faces, pick = new Set();
      for (const key of want[fam]) {
        const it = key.endsWith('i'), w = parseInt(key, 10);
        let pool = faces.filter((f) => (f.style === 'italic') === it); if (!pool.length) pool = faces;
        const dist = (f) => { const p = String(f.weight).split(/\s+/).map(Number); return p.length === 2 ? (w < p[0] ? p[0] - w : w > p[1] ? w - p[1] : 0) : Math.abs(p[0] - w); };
        const best = Math.min(...pool.map(dist)); pool.filter((f) => dist(f) === best).forEach((f) => pick.add(f));
      }
      for (const f of pick) {
        try { faceCache[f.url] = faceCache[f.url] || (await toDataURL(f.url)); css += `@font-face{font-family:'${fam.replace(/'/g, '')}';font-weight:${f.weight};font-style:${f.style};${f.range ? 'unicode-range:' + f.range + ';' : ''}src:url(${faceCache[f.url]});}`; } catch (e) {}
      }
    }
    for (const f of R.customFonts) {
      if (!used.has(f.family)) continue;
      try { css += `@font-face{font-family:'${f.family}';font-weight:${f.weight || 400};font-style:${f.style || 'normal'};src:url(${await toDataURL(f.url)});}`; } catch (e) {}
    }
    return css;
  }
  R.exportSVGString = async function (d, extra = {}) {
    await R.ensureDocFonts(d).catch(() => {});
    const images = await R.inlineImages(d);
    return R.renderSVG(d, Object.assign({ images, prefix: 'x_', fontCSS: await fontCSS(d) }, extra));
  };
  R.exportCanvas = async function (d, scale = 1, bgForJpg, extra = {}) {
    const svg = await R.exportSVGString(d, extra);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('SVG çizilemedi')); img.src = url; });
    const b = extra.bleed || 0;
    const c = document.createElement('canvas');
    c.width = Math.round((d.width + 2 * b) * scale); c.height = Math.round((d.height + 2 * b) * scale);
    const ctx = c.getContext('2d');
    if (bgForJpg) { ctx.fillStyle = bgForJpg; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    return c;
  };
  R.exportBlob = async function (d, fmt = 'png', scale = 1) {
    if (fmt === 'svg') return new Blob([await R.exportSVGString(d)], { type: 'image/svg+xml' });
    if (fmt === 'json') return new Blob([JSON.stringify(R.clean(d), null, 2)], { type: 'application/json' });
    const c = await R.exportCanvas(d, scale, fmt === 'jpg' ? '#ffffff' : null);
    return await new Promise((res) => c.toBlob(res, fmt === 'jpg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png', 0.92));
  };
  R.thumbnail = async function (d, max = 360) {
    try {
      const sc = Math.min(1, max / Math.max(d.width, d.height));
      const c = await R.exportCanvas(d, sc, '#ffffff');
      return c.toDataURL('image/jpeg', 0.8);
    } catch (e) { return null; }
  };
  // iOS uygulaması (Xcode kabuğu) içinde mi?
  R.native = () => !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.tsNative);
  R.isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const blobB64 = (blob) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
  R.download = async function (blob, name) {
    if (window.TS_CLOUD && window.Cloud) return window.Cloud.download(blob, name);
    if (R.native()) {
      // yerel uygulama: iOS "Kaydet / Paylaş" penceresi açılır (Fotoğraflar, Dosyalar, AirDrop…)
      window.webkit.messageHandlers.tsNative.postMessage({ cmd: 'save', name, mime: blob.type || 'application/octet-stream', data: await blobB64(blob) });
      return;
    }
    if (R.isIOS() && navigator.canShare) {
      // iPhone Safari / ana ekran uygulaması: indirme yerine paylaş sayfası (Görüntüyü Kaydet, Dosyalara Kaydet)
      const file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
      if (navigator.canShare({ files: [file] })) {
        const go = async () => { try { await navigator.share({ files: [file] }); } catch (e) { if (e.name !== 'AbortError') plain(); } };
        // paylaşım kullanıcı dokunuşu ister: uzun işlemden sonra küçük bir onay balonu göster
        if (window.App && window.App.dialog) {
          window.App.dialog(`<div class="d-body" style="text-align:center"><h3>Dosya hazır</h3><p class="muted">${name.replace(/[<>&]/g, '')}</p></div><div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="iosSave">Kaydet / Paylaş</button></div>`, { onOpen: (box, close) => { box.querySelector('#iosSave').onclick = () => { go(); close(); }; } });
        } else go();
        return;
      }
    }
    plain();
    function plain() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
  };
  R.clean = function (d) {
    return JSON.parse(JSON.stringify(d, (k, v) => (k.startsWith('_') ? undefined : v)));
  };

  // Yapay zekaya göndermek için görseli küçült (Claude ~1568 px ve 5 MB sınırı)
  R.downscale = function (src, max = 1568, q = 0.86) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * sc); c.height = Math.round(im.naturalHeight * sc);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', q));
      };
      im.onerror = () => res(null);
      im.src = src;
    });
  };

  // Kenarlarına 0-1 cetveli eklenmiş kopya (yapay zekanın kırpma koordinatlarını isabetli vermesi için)
  R.withRuler = function (src, max = 1500) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        const w = Math.round(im.naturalWidth * sc), h = Math.round(im.naturalHeight * sc), m = 34;
        const c = document.createElement('canvas'); c.width = w + m; c.height = h + m;
        const x = c.getContext('2d');
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(im, m, m, w, h);
        x.font = 'bold 13px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
        for (let i = 0; i <= 10; i++) {
          const f = i / 10, px = m + f * w, py = m + f * h;
          x.fillStyle = '#d0006f'; x.fillText(f.toFixed(1), Math.min(px, c.width - 14), m / 2); x.save(); x.translate(m / 2, Math.min(py, c.height - 10)); x.fillText(f.toFixed(1), 0, 0); x.restore();
          x.strokeStyle = 'rgba(255,0,140,0.28)'; x.lineWidth = 1;
          x.beginPath(); x.moveTo(px, m); x.lineTo(px, m + h); x.stroke();
          x.beginPath(); x.moveTo(m, py); x.lineTo(m + w, py); x.stroke();
        }
        res(c.toDataURL('image/jpeg', 0.88));
      };
      im.onerror = () => res(null);
      im.src = src;
    });
  };

  // ---- Referans görselden renk paleti çıkarma
  R.extractPalette = function (src, n = 6) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const s = 64; c.width = s; c.height = s;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, s, s);
        const px = ctx.getImageData(0, 0, s, s).data;
        const buckets = {};
        for (let i = 0; i < px.length; i += 4) {
          if (px[i + 3] < 128) continue;
          const k = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4);
          const b = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0 });
          b.n++; b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2];
        }
        const arr = Object.values(buckets).map((b) => [b.r / b.n, b.g / b.n, b.b / b.n, b.n]).sort((a, b) => b[3] - a[3]);
        const picked = [];
        for (const c of arr) {
          if (picked.every((p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) > 60)) picked.push(c);
          if (picked.length >= n) break;
        }
        res(picked.map((c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()));
      };
      img.onerror = () => res([]);
      img.src = src;
    });
  };

  window.Render = R;
})();
