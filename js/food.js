/* Tasarım Stüdyosu v5.5 — Gıda şablonları.
   Her şablon tek bir tasarım sistemine oturur: kenar payı, 1,333 oranlı yazı ölçeği, stil başına yazı tipi çifti,
   ₺ ve kuruşu küçük yazan fiyat bileşeni, “lezzet” fotoğraf ayarı. Şablonlar ölçüye göre (kare, 4:5, story,
   yatay banner, A4 / Trendyol) yeniden kurulur; küçültülmez. */
(function () {
  'use strict';
  const R = window.Render, L = window.Library, ART = window.FoodArt;
  if (!R || !L || !ART) return;
  const r1 = (v) => Math.round(v * 10) / 10;
  let gseq = 0;
  const gid = () => 'fg' + (++gseq).toString(36) + Math.random().toString(36).slice(2, 6);

  // ---------------------------------------------------------------- palet ve stiller
  const PAL = {
    domates: { bg: '#FFF4E8', ink: '#2B1A12', a: '#E2392B', b: '#F4B400', c: '#FFD9C4', d: '#2B1A12' },
    zeytin: { bg: '#F2F0E4', ink: '#1E2914', a: '#5B7B3A', b: '#C8A24A', c: '#DCE4C6', d: '#1E2914' },
    kahve: { bg: '#F6EEE4', ink: '#2A1B12', a: '#8A5A3B', b: '#D99A5B', c: '#E9D7C3', d: '#2A1B12' },
    gece: { bg: '#15110E', ink: '#F7EFE4', a: '#E8B04B', b: '#D2552B', c: '#2A231D', d: '#0B0907' },
    pembe: { bg: '#FFF0F3', ink: '#3B1220', a: '#E2557A', b: '#7A3E9A', c: '#FFD2DD', d: '#3B1220' },
    taze: { bg: '#F1F8EB', ink: '#173117', a: '#2E9E4F', b: '#F28C28', c: '#D3ECC4', d: '#173117' },
    sokak: { bg: '#FFD23F', ink: '#141414', a: '#E2392B', b: '#141414', c: '#FFE68C', d: '#141414' },
    deniz: { bg: '#EAF7FB', ink: '#0E2A35', a: '#0E9CC0', b: '#FF7A59', c: '#C9EEF7', d: '#0E2A35' },
    krem: { bg: '#FBF6EE', ink: '#2C2420', a: '#B4532A', b: '#6E7F35', c: '#EFE2CF', d: '#2C2420' },
    bordo: { bg: '#5A1420', ink: '#FFF4E6', a: '#F2C14E', b: '#FF8F6B', c: '#73202E', d: '#3A0C14' },
    orman: { bg: '#1D3326', ink: '#F4EFE3', a: '#E7B65A', b: '#A9C46C', c: '#284535', d: '#12221A' },
    limon: { bg: '#FFF9D9', ink: '#2A2610', a: '#E9A800', b: '#2E9E4F', c: '#FFEFA3', d: '#2A2610' },
    lacivert: { bg: '#F3F1EA', ink: '#141B33', a: '#C9A94E', b: '#F2C230', c: '#2B3A6B', d: '#14214A' },
    mor: { bg: '#F4F0FA', ink: '#1E1436', a: '#C9A94E', b: '#E8C66A', c: '#4A3A8C', d: '#2C2166' },
    turkuaz: { bg: '#EEF8F8', ink: '#0D2A2E', a: '#C9A94E', b: '#7FE0D8', c: '#1E7F86', d: '#0F5A62' },
    zumrut: { bg: '#EEF6F1', ink: '#0E2A1E', a: '#C9A94E', b: '#E8C66A', c: '#1F6E4F', d: '#0F4A35' },
    fusya: { bg: '#FBEFF5', ink: '#3A0C26', a: '#C9A94E', b: '#FFD1E6', c: '#B0196B', d: '#7A0E4A' },
    murdum: { bg: '#F6EFF7', ink: '#2A0E30', a: '#C9A94E', b: '#E8C66A', c: '#6E2A7A', d: '#481556' },
    retro: { bg: '#F6EADB', ink: '#16120F', a: '#E8473E', b: '#F2C14E', c: '#EBA7B5', d: '#16120F' },
    gokyuzu: { bg: '#EAF6FB', ink: '#13137A', a: '#4FA8E6', b: '#5BC8EA', c: '#9ED8F2', d: '#13137A' },
    mavi: { bg: '#3389CC', ink: '#FFFFFF', a: '#FFFFFF', b: '#5BC8EA', c: '#2E86C9', d: '#13137A' },
    nane: { bg: '#DCEFEA', ink: '#0E5A45', a: '#8A7A40', b: '#8FCFC0', c: '#BFE3DA', d: '#0E5A45' },
    kum: { bg: '#F2D3B3', ink: '#0F3D2E', a: '#165A40', b: '#E9BF97', c: '#F6E2CC', d: '#0F3D2E' },
    mermer: { bg: '#F1F0EE', ink: '#7A5A44', a: '#1FB25A', b: '#7A5A44', c: '#E4E2DE', d: '#2A2A2A' },
    okul: { bg: '#FBF8F1', ink: '#1B2A4A', a: '#B8872F', b: '#1B2A4A', c: '#EEE6D3', d: '#1B2A4A' },
    bordo: { bg: '#FFFDF8', ink: '#5B1A22', a: '#B8872F', b: '#5B1A22', c: '#F3E9E0', d: '#5B1A22' },
    zumrut2: { bg: '#F7FAF6', ink: '#14532D', a: '#B8872F', b: '#14532D', c: '#E3EFE1', d: '#14532D' },
    mavi2: { bg: '#F4F8FD', ink: '#1E3A8A', a: '#F59E0B', b: '#1E3A8A', c: '#DBEAFE', d: '#1E3A8A' },
    turuncu2: { bg: '#FFF8F1', ink: '#7C2D12', a: '#EA580C', b: '#7C2D12', c: '#FFEDD5', d: '#7C2D12' },
    hafta: { bg: '#FBFAF6', ink: '#0F5A45', a: '#8E8A4A', b: '#6B5A1E', c: '#EFE8D6', d: '#0F5A45' },
    duo: { bg: '#E9E6E1', ink: '#FFFFFF', a: '#C8662E', b: '#1E2A44', c: '#D9D4CC', d: '#1E2A44' },
    ilim: { bg: '#0F3326', ink: '#FFFFFF', a: '#D9B97A', b: '#E8D2A0', c: '#1E4A38', d: '#0B2A1F' },
    iftar: { bg: '#F3F5F8', ink: '#1D3A5E', a: '#FFFFFF', b: '#1D3A5E', c: '#E8EEF4', d: '#163152' },
    asure: { bg: '#FFFFFF', ink: '#333333', a: '#D9443A', b: '#9A8F86', c: '#E9EEF1', d: '#2E3A44' },
    altin: { bg: '#F4F3F1', ink: '#5A5A5A', a: '#A9822E', b: '#C9A94E', c: '#ECEBE8', d: '#1A1A1A' },
    ihtida: { bg: '#F7F7F7', ink: '#1E1A5E', a: '#FCC844', b: '#A79B8E', c: '#45CCE0', d: '#1E1A5E' },
    kazan: { bg: '#1A2E8A', ink: '#FFFFFF', a: '#5ED3C0', b: '#FFFFFF', c: '#2E4AB0', d: '#0E1B5E' },
    firca: { bg: '#FFFFFF', ink: '#0E4C9C', a: '#0E4C9C', b: '#2EE6FF', c: '#DCEBF8', d: '#0E3A7A' },
    sifa: { bg: '#2E6B3A', ink: '#FFFFFF', a: '#FFFFFF', b: '#3DD6C0', c: '#5A8A5A', d: '#1E4A2A' },
    nafile: { bg: '#1E3A6B', ink: '#FFFFFF', a: '#FFFFFF', b: '#1E4F9E', c: '#3A6EA8', d: '#13265A' },
    akika: { bg: '#3E7A1E', ink: '#FFFFFF', a: '#FFFFFF', b: '#5DBB1E', c: '#7AB04A', d: '#24501A' },
    adak: { bg: '#4A5A6A', ink: '#FFFFFF', a: '#FFFFFF', b: '#7A8696', c: '#9AA6B4', d: '#2E3A46' },
    hardal: { bg: '#E3B23C', ink: '#2A2208', a: '#C8941F', b: '#D9A52C', c: '#F5E2A8', d: '#2A2208' },
  };
  const ST = {
    modern: { head: ['Inter', 900, 0, -0.025], sub: ['Inter', 700], body: ['Inter', 400], label: ['Inter', 700, 1, 0.16], price: ['Inter', 900], script: ['Inter', 800, 0, -0.01], btnR: 0.5, decor: 'dots' },
    sokak: { head: ['TeX Gyre Heros Cn', 700, 1, 0], sub: ['Inter', 800, 1, 0.02], body: ['Inter', 500], label: ['Inter', 800, 1, 0.12], price: ['TeX Gyre Heros Cn', 700], script: ['TeX Gyre Chorus', 500], btnR: 0.12, decor: 'burst' },
    rustik: { head: ['Lora', 700, 0, -0.01], sub: ['Lora', 400, 0, 0, 1], body: ['Inter', 400], label: ['Inter', 600, 1, 0.24], price: ['Lora', 700], script: ['TeX Gyre Chorus', 500], btnR: 0.2, decor: 'leaf' },
    luks: { head: ['GFS Baskerville', 400, 1, 0.08], sub: ['Lora', 400, 0, 0, 1], body: ['Lora', 400], label: ['Lora', 700, 1, 0.26], price: ['Lora', 600], script: ['TeX Gyre Chorus', 500], btnR: 0, decor: 'line' },
    eglenceli: { head: ['Poppins', 700, 0, -0.015], sub: ['Poppins', 500], body: ['Poppins', 400], label: ['Poppins', 700, 1, 0.1], price: ['Poppins', 700], script: ['TeX Gyre Chorus', 500], btnR: 0.5, decor: 'blob' },
    vakur: { head: ['Lora', 600, 0, -0.015], sub: ['Inter', 700], body: ['Inter', 400], label: ['Inter', 700, 1, 0.14], price: ['Lora', 700], script: ['TeX Gyre Chorus', 500], btnR: 0.3, decor: 'none' },
    minimal: { head: ['Inter', 300, 0, -0.03], sub: ['Inter', 600], body: ['Inter', 400], label: ['Inter', 600, 1, 0.28], price: ['Inter', 600], script: ['Lora', 400, 0, 0, 1], btnR: 0.5, decor: 'none' },
  };
  const LEZZET = { warmth: 8, saturate: 110, contrast: 104, sharpen: 10 };
  const lum = (c) => window.Tools.lum(c);
  const CR = (a, b) => window.Tools.contrast(a, b);
  const on = (bg, a, b) => { const best = [a, b, '#FFFFFF', '#14110E'].sort((x, y) => CR(y, bg) - CR(x, bg)); return CR(a, bg) >= 4.5 ? a : CR(b, bg) >= 4.5 ? b : best[0]; };
  const mixHex = (a, b, t) => { const x = window.Tools.rgb(a), y = window.Tools.rgb(b); return '#' + [x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  // yazı rengi zeminde okunmuyorsa tonunu koyulaştır / açarak okunur yap (rengin karakteri korunur)
  function legible(fill, bg, size, weight, u) {
    if (typeof fill !== 'string' || !/^#/.test(fill) || typeof bg !== 'string') return fill;
    const need = size >= u * 3.7 || (size >= u * 2.6 && weight >= 700) ? 3.1 : 4.6;
    if (CR(fill, bg) >= need) return fill;
    const toward = CR('#000000', bg) > CR('#FFFFFF', bg) ? '#000000' : '#FFFFFF';
    for (let t = 0.12; t <= 0.96; t += 0.12) { const c = mixHex(fill, toward, t); if (CR(c, bg) >= need) return c; }
    return toward === '#000000' ? '#14110E' : '#FFFFFF';
  }

  // ---------------------------------------------------------------- bağlam ve yapı taşları
  function ctx(P, W, H, style, k = 1) {
    const u = Math.min(W, H) / 100, ar = W / H;
    const mode = ar > 1.6 ? 'wide' : ar > 1.15 ? 'land' : ar >= 0.9 ? 'sq' : ar >= 0.62 ? 'por' : 'story';
    const M = u * (mode === 'wide' ? 8 : mode === 'story' ? 8.5 : 7.5);
    const base = k * u * (mode === 'story' ? 3.9 : mode === 'por' ? 3.4 : mode === 'wide' ? 4.6 : 3.3);
    const lab = Math.max(base * 0.8, u * 2.4);
    const ts = { cap: lab, label: lab, body: Math.max(base, u * 2.9), lead: base * 1.333, h3: base * 1.777, h2: base * 2.369, h1: base * 3.157, d1: base * 4.209, d2: base * 5.61, mega: base * 7.48 };
    const L = [];
    return { P, W, H, u, mode, M, ts, L, st: ST[style] || ST.modern, style, add: (l) => (L.push(Object.assign({ visible: true, opacity: 1, rotation: 0 }, l)), L[L.length - 1]) };
  }
  function T(c, role, name, text, x, y, w, size, fill, o = {}) {
    const [ff, fw, up, ls, it] = c.st[role] || c.st.body;
    const lh = o.lineHeight || (role === 'head' ? (size > c.u * 9 ? 0.96 : 1.04) : role === 'body' ? 1.42 : size > c.u * 5 ? 1.12 : 1.3);
    if ((role === 'head' || role === 'sub' || role === 'body') && typeof text === 'string' && !/[\n\t]/.test(text) && text.trim().split(/\s+/).length >= 3) text = text.replace(/ +(\S+)\s*$/, '\u00A0$1');
    const bgc = o.on || c.bg || c.P.bg; delete o.on;
    fill = legible(fill, bgc, size, o.fontWeight || fw, c.u);
    const l = c.add(Object.assign({ type: 'text', name, text, x, y, w, h: size * 1.2, fontSize: r1(size), fill, fontFamily: ff, fontWeight: fw, uppercase: !!up, italic: !!it, letterSpacing: r1(size * (ls || 0)), lineHeight: lh, align: 'left' }, o));
    R.layoutText(l);
    if (o.fit !== false && !o.curve) fitWords(l, o.maxLines || (role === 'head' ? (c.mode === 'story' || c.mode === 'por' ? 4 : 3) : role === 'label' || role === 'script' ? 1 : 0));
    return l;
  }
  // kelime ortadan bölünmesin, satır sayısı taşmasın: gerekirse yazıyı küçült
  function fitWords(l, maxLines) {
    for (let i = 0; i < 14; i++) {
      const txt = R.plain(l.text).replace(/\t/g, ' '), words = txt.split(/[^\S\u00A0\u202F]+/).filter(Boolean);
      const longest = Math.max(0, ...words.map((w) => R.measure(l.uppercase ? w.toLocaleUpperCase('tr-TR') : w, l)));
      const tooWide = longest > l.w * 0.97, tooMany = maxLines && (l._lines || []).length > maxLines;
      if (!tooWide && !tooMany) return;
      const f = tooWide ? Math.max(0.6, (l.w * 0.96) / longest) : 0.92;
      l.fontSize = r1(l.fontSize * f); l.letterSpacing = r1((l.letterSpacing || 0) * f);
      R.layoutText(l);
    }
  }
  const rect = (c, name, x, y, w, h, fill, o = {}) => c.add(Object.assign({ type: 'rect', name, x, y, w, h, fill, radius: 0 }, o));
  const ell = (c, name, x, y, w, h, fill, o = {}) => c.add(Object.assign({ type: 'ellipse', name, x, y, w, h, fill }, o));
  const pth = (c, name, d, x, y, w, h, fill, o = {}) => c.add(Object.assign({ type: 'path', name, d, vw: 100, vh: 100, x, y, w, h, fill }, o));
  const BURST = (() => { let d = ''; for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 43 : 50; d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2); } return d + 'Z'; })();
  const LEAF = 'M50 0 C 85 20, 95 60, 50 100 C 5 60, 15 20, 50 0 Z';
  const BLOB = 'M50 2 C 78 2, 98 22, 96 50 C 94 80, 74 98, 48 97 C 20 96, 2 76, 4 48 C 6 20, 24 2, 50 2 Z';
  function art(c, kind, x, y, w, h, o = {}) {
    const pr = c.prod;
    if (pr && pr.src) {
      const m = Math.min(w, h), cut = pr.cut !== false;
      return c.add(Object.assign({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', src: pr.src, nw: pr.nw || 800, nh: pr.nh || 800, fit: cut ? 'contain' : 'cover', radius: cut ? 0 : r1(m * 0.06), x, y, w, h, filters: pr.food === false ? {} : Object.assign({}, LEZZET), shadow: cut ? { x: 0, y: r1(m * 0.035), blur: r1(m * 0.06), color: 'rgba(20,10,0,0.38)' } : { x: 0, y: r1(m * 0.03), blur: r1(m * 0.08), color: 'rgba(0,0,0,0.3)' } }, o));
    }
    if (c.catArt) kind = c.catArt;
    const TH0 = window.FoodTheme, ca = TH0 && TH0.CART[kind] ? TH0.cart(kind) : null;
    if (ca) return c.add(Object.assign({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', src: ca, nw: 800, nh: 800, fit: 'contain', x, y, w, h, filters: {}, shadow: { x: 0, y: r1(Math.min(w, h) * 0.02), blur: r1(Math.min(w, h) * 0.05), color: 'rgba(0,0,0,0.22)' } }, o));
    return c.add(Object.assign({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', src: ART.url(kind), nw: 800, nh: 800, fit: 'contain', x, y, w, h, filters: Object.assign({}, LEZZET), shadow: { x: 0, y: r1(Math.min(w, h) * 0.03), blur: r1(Math.min(w, h) * 0.07), color: 'rgba(40,20,0,0.28)' } }, o));
  }
  // ₺ küçük, tam kısım büyük, kuruş üstte küçük
  function parsePrice(v) {
    const s = String(v || '').trim();
    const cur = (s.match(/₺|TL|\$|€|£/) || ['₺'])[0];
    const num = s.replace(/₺|TL|\$|€|£/g, '').trim();
    const m = num.match(/^([\d.]+)(?:,(\d{1,2}))?$/);
    return m ? { cur: cur === 'TL' ? '₺' : cur, int: m[1], dec: m[2] ? ',' + m[2] : '' } : { cur: '', int: num || s, dec: '' };
  }
  function layoutPrice(ls) {
    const int = ls.find((l) => l.priceRole === 'int'), cur = ls.find((l) => l.priceRole === 'cur'), dec = ls.find((l) => l.priceRole === 'dec');
    if (!int || !int.priceBox) return 0;
    const b = int.priceBox, s = int.fontSize;
    const mw = (l) => (l && R.plain(l.text) ? Math.ceil(R.measure(String(R.plain(l.text)), l)) + 2 : 0);
    const wc = mw(cur), wi = mw(int), wd = mw(dec), gap = s * 0.04, tw = wc + (wc ? gap : 0) + wi + (wd ? gap * 0.4 + wd : 0);
    const x0 = b.align === 'center' ? b.x - tw / 2 : b.align === 'right' ? b.x - tw : b.x;
    if (cur) { cur.x = r1(x0); cur.y = r1(b.y + s * 0.1); cur.w = wc + 2; cur.h = r1(cur.fontSize * 1.05); }
    int.x = r1(x0 + wc + (wc ? gap : 0)); int.y = r1(b.y); int.w = wi + 2; int.h = r1(s * 1.02);
    if (dec) { dec.x = r1(int.x + wi + gap * 0.4); dec.y = r1(b.y + s * 0.1); dec.w = Math.max(4, wd + 2); dec.h = r1(dec.fontSize * 1.05); }
    return tw;
  }
  function price(c, val, x, y, size, fill, align = 'left', o = {}) {
    const p = parsePrice(val), [ff, fw] = c.st.price, g = gid();
    fill = legible(fill, o.on || c.bg || c.P.bg, size * 0.46, fw, c.u); delete o.on;
    const mk = (role, text, fs, name) => c.add(Object.assign({ type: 'text', name, text, x, y, w: 10, h: fs, fontSize: r1(fs), fill, fontFamily: ff, fontWeight: fw, lineHeight: 1, align: 'left', group: g, priceRole: role, letterSpacing: r1(fs * -0.01) }, o));
    const ls = [mk('cur', p.cur, size * 0.46, 'Fiyat ₺'), mk('int', p.int, size, 'Fiyat'), mk('dec', p.dec, size * 0.42, 'Fiyat kuruş')];
    ls[1].priceBox = { x, y, align };
    const w = layoutPrice(ls);
    return { ls, w, h: size * 1.02, g };
  }
  function oldPrice(c, val, x, y, size, fill, align = 'left') { return T(c, 'body', 'Eski fiyat', val, x, y, size * 6, size, fill, { strike: true, opacity: 0.6, bind: 'old', align, fontWeight: 500 }); }
  function button(c, text, x, y, size, fill, ink, align = 'left', o = {}) {
    const g = gid(), [ff] = c.st.sub;
    const t = T(c, 'sub', 'Buton yazısı', text, 0, 0, 400 * c.u, size, ink, { on: o.outline ? undefined : fill, group: g, bind: 'cta', align: 'center', lineHeight: 1.1, uppercase: c.style === 'sokak' || c.style === 'luks', letterSpacing: c.style === 'luks' ? r1(size * 0.18) : c.style === 'sokak' ? r1(size * 0.04) : 0, fontWeight: c.style === 'luks' ? 600 : 700 });
    const tw = Math.ceil(R.measure(t.uppercase ? text.toLocaleUpperCase('tr-TR') : text, t)), padX = size * 1.5, padY = size * 0.8, bw = tw + padX * 2, bh = size * 1.1 + padY * 2;
    const bx = align === 'center' ? x - bw / 2 : align === 'right' ? x - bw : x;
    const bg = rect(c, 'Buton zemini', bx, y, bw, bh, fill, { radius: r1(bh * c.st.btnR), group: g, stroke: o.outline ? ink : null, strokeWidth: o.outline ? r1(size * 0.1) : 0 });
    if (o.outline) bg.fill = 'rgba(0,0,0,0)';
    c.L.splice(c.L.indexOf(t), 1); c.L.push(t);
    Object.assign(t, { x: r1(bx), w: r1(bw), y: r1(y + padY - size * 0.02) });
    R.layoutText(t);
    void ff;
    return { w: bw, h: bh, ls: [bg, t] };
  }
  function badge(c, text, sub, cx, cy, size, fill, ink, rot = -8) {
    const g = gid(); size = Math.max(size, c.u * 22);
    pth(c, 'Rozet', c.style === 'minimal' || c.style === 'luks' ? 'M50 0A50 50 0 1 1 49.99 0Z' : BURST, cx - size / 2, cy - size / 2, size, size, fill, { group: g, rotation: rot, shadow: { x: 0, y: r1(size * 0.04), blur: r1(size * 0.1), color: 'rgba(0,0,0,0.22)' } });
    size = Math.max(size, c.u * 22);
    const t = T(c, 'head', 'İndirim', text, cx - size * 0.45, 0, size * 0.9, size * (text.length > 4 ? 0.24 : 0.3), ink, { on: fill, align: 'center', group: g, rotation: rot, bind: 'discount', uppercase: false, letterSpacing: 0, lineHeight: 0.95, fontFamily: c.st.price[0], fontWeight: c.st.price[1] });
    let s2 = null;
    if (sub) s2 = T(c, 'label', 'Rozet yazısı', sub, cx - size * 0.45, 0, size * 0.9, Math.max(size * 0.1, c.u * 2.4), ink, { on: fill, align: 'center', group: g, rotation: rot });
    const th = t.h + (s2 ? s2.h + size * 0.02 : 0);
    t.y = r1(cy - th / 2); if (s2) s2.y = r1(t.y + t.h + size * 0.02);
    return g;
  }
  function decor(c, kind) {
    const { W, H, u, P } = c;
    const k = kind || c.st.decor;
    if (k === 'dots') { let d = ''; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) d += `M${x * 18 + 4} ${y * 18 + 4}a3 3 0 1 0 0.1 0Z`; pth(c, 'Süs · nokta', d, W - 26 * u, 6 * u, 20 * u, 20 * u, P.a, { opacity: 0.35, vw: 100, vh: 100 }); }
    if (k === 'leaf') { pth(c, 'Süs · yaprak', LEAF, -4 * u, H - 30 * u, 18 * u, 30 * u, P.b, { opacity: 0.22, rotation: -30 }); pth(c, 'Süs · yaprak', LEAF, W - 14 * u, -6 * u, 16 * u, 26 * u, P.b, { opacity: 0.18, rotation: 150 }); }
    if (k === 'blob') { pth(c, 'Süs · leke', BLOB, -12 * u, -10 * u, 42 * u, 38 * u, P.c, { opacity: 0.9 }); pth(c, 'Süs · leke', BLOB, W - 30 * u, H - 26 * u, 44 * u, 40 * u, P.c, { opacity: 0.7 }); }
    if (k === 'line') { rect(c, 'Süs · çerçeve', 3 * u, 3 * u, W - 6 * u, H - 6 * u, 'rgba(0,0,0,0)', { stroke: P.a, strokeWidth: r1(0.25 * u), opacity: 0.7 }); }
    if (k === 'burst') { pth(c, 'Süs · ışın', BURST, W * 0.5 - 70 * u, H * 0.45 - 70 * u, 140 * u, 140 * u, P.c, { opacity: 0.35 }); }
  }
  function contact(c, y, fill, align = 'center', x, w) {
    const { u, W, M } = c;
    return T(c, 'body', 'İletişim', 'www.markaniz.com   •   0 (555) 000 00 00', x != null ? x : M, y, w != null ? w : W - 2 * M, c.ts.cap, fill, { align, fontWeight: 500, maxLines: 1 });
  }
  // dikey yığın: metin blokları sabit, görsel blok kalan alanı kullanır
  function stack(c, blocks, top, bottom, align = 'center') {
    const fixed = blocks.reduce((a, b) => a + (b.flex ? 0 : b.h) + (b.gap || 0), 0);
    const fl = blocks.filter((b) => b.flex), avail = bottom - top;
    const fh = fl.length ? Math.max(fl[0].min || 0, Math.min(fl[0].max || 1e9, (avail - fixed) / fl.length)) : 0;
    const total = fixed + fh * fl.length;
    let y = top + Math.max(0, align === 'end' ? avail - total : align === 'start' ? 0 : (avail - total) / 2);
    blocks.forEach((b) => {
      if (b.flex) { const at = b.at; const ls = b.make(y, fh); ls.forEach((l) => { c.L.splice(c.L.indexOf(l), 1); }); c.L.splice(at, 0, ...ls); b.h = fh; }
      else (b.ls || []).forEach((l) => { l.y = r1(l.y + y); if (l.priceBox) l.priceBox.y += y; });
      y += b.h + (b.gap || 0);
    });
    return { top: top + Math.max(0, align === 'end' ? avail - total : align === 'start' ? 0 : (avail - total) / 2), bottom: y };
  }
  const tb = (l, gap = 0) => ({ ls: [l], h: l.h, gap });
  const grp = (ls, h, gap = 0) => ({ ls, h, gap });

  // ---------------------------------------------------------------- ARKETİPLER
  // 1) KAHRAMAN: büyük ürün, üstte başlık, fiyat rozeti, altta buton
  function hero(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = f.bg || P.bg;
    decor(c, f.decor);
    const ink = on(c.bg, P.ink, '#FFFFFF');
    if (mode === 'wide' || mode === 'land') {
      const colW = W * (mode === 'wide' ? 0.5 : 0.52) - M, s = Math.min(H * 0.9, W * 0.44);
      ell(c, 'Tabak gölgesi', W * 0.74 - s * 0.5, H / 2 - s * 0.5, s, s, P.c);
      art(c, f.art, W * 0.74 - s * 0.47, H / 2 - s * 0.47, s * 0.94, s * 0.94);
      if (f.discount) badge(c, f.discount, /%|₺/.test(f.discount) ? 'İNDİRİM' : '', W * 0.74 + s * 0.38, H / 2 - s * 0.32, s * 0.3, P.a, on(P.a, '#FFFFFF', P.ink));
      const bl = [];
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, colW, ts.label, P.a), ts.body * 0.6));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, colW, ts.d1, ink, { bind: 'product', maxLines: 2 }), ts.body * 0.7));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, colW * 0.9, ts.body, ink, { opacity: 0.8, bind: 'desc' }), ts.body * 1.1));
      if (f.price) { const p = price(c, f.price, M, 0, mode === 'wide' ? ts.h2 : ts.h1, P.a); const o = f.old ? oldPrice(c, f.old, M + p.w + ts.body, p.h * 0.45, ts.body, ink) : null; bl.push(grp(p.ls.concat(o ? [o] : []), p.h, ts.body)); }
      if (f.cta) { const b = button(c, f.cta, M, 0, ts.body * 0.95, P.d === c.bg ? P.a : P.d, on(P.d === c.bg ? P.a : P.d, '#FFFFFF', P.ink)); bl.push(grp(b.ls, b.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    const big = mode === 'story' ? 1 : mode === 'por' ? 0.92 : 0.8;
    const bl = [];
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, W - 2 * M, ts.label, P.a, { align: 'center' }), ts.body * 0.5));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, W - 2 * M, mode === 'sq' ? ts.d1 : ts.d2 * 0.92, ink, { align: 'center', bind: 'product' }), ts.body * 0.5));
    if (f.sub && mode !== 'sq') bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, W * 0.14, 0, W * 0.72, ts.lead * 0.85, ink, { align: 'center', opacity: 0.8, bind: 'desc' }), ts.body * 0.4));
    const at = c.L.length;
    bl.push({ flex: true, at, min: W * 0.26, max: W * big, gap: ts.body * 0.4, make: (y, h) => { const s = Math.min(h, W * big); const x0 = (W - s) / 2, y0 = y + (h - s) / 2; const ls = [ell(c, 'Tabak gölgesi', x0 + s * 0.06, y0 + s * 0.06, s * 0.88, s * 0.88, P.c), art(c, f.art, x0, y0, s, s)]; c._art = { x: x0, y: y0, s }; return ls; } });
    if (f.price) { const p = price(c, f.price, W / 2, 0, ts.d1 * 0.9, P.a, 'center'); const o = f.old ? oldPrice(c, f.old, W / 2 + p.w / 2 + ts.body * 0.6, p.h * 0.5, ts.body, ink) : null; bl.push(grp(p.ls.concat(o ? [o] : []), p.h, ts.body * 0.8)); }
    if (f.cta) { const b = button(c, f.cta, W / 2, 0, ts.body, P.d === c.bg ? P.a : P.d, on(P.d === c.bg ? P.a : P.d, '#FFFFFF', P.ink), 'center'); bl.push(grp(b.ls, b.h)); }
    stack(c, bl, M, H - M - ts.cap * 2.6);
    contact(c, H - M * 0.78 - ts.cap * 1.45, ink);
    if (f.discount && c._art) { const a = c._art; badge(c, f.discount, /%|₺/.test(f.discount) ? 'İNDİRİM' : '', a.x + a.s * 0.86, a.y + a.s * 0.16, Math.max(a.s * 0.3, 20 * c.u), P.a, on(P.a, '#FFFFFF', P.ink)); }
  }
  // 2) BÖLÜNMÜŞ: renkli panel + ürün sınırın üstünde
  function split(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = P.bg;
    const panel = f.panel || P.a, pink = on(panel, '#FFFFFF', P.ink), ink = on(P.bg, P.ink, '#FFFFFF');
    if (mode === 'wide' || mode === 'land' || mode === 'sq') {
      const pw = mode === 'sq' ? W * 0.56 : W * 0.5;
      rect(c, 'Renk paneli', 0, 0, pw, H, panel);
      decor(c, 'none');
      const s = mode === 'sq' ? W * 0.58 : Math.min(H * 0.86, W * 0.42);
      ell(c, 'Tabak gölgesi', pw - s * 0.3, H / 2 - s * 0.46 + (mode === 'sq' ? H * 0.06 : 0), s * 0.92, s * 0.92, P.c);
      art(c, f.art, pw - s * 0.34, H / 2 - s / 2 + (mode === 'sq' ? H * 0.06 : 0), s, s);
      const cw = pw - M * 1.6 - (mode === 'sq' ? s * 0.2 : s * 0.3), bl = [], bg0 = c.bg; c.bg = panel;
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, cw, ts.label, pink, { opacity: 0.85 }), ts.body * 0.6));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, mode === 'sq' ? ts.h1 : ts.d1 * 0.9, pink, { bind: 'product' }), ts.body * 0.8));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, cw * 0.95, ts.body, pink, { opacity: 0.85, bind: 'desc' }), ts.body * 1.2));
      if (f.price) { const p = price(c, f.price, M, 0, ts.h1, pink); bl.push(grp(p.ls, p.h, ts.body)); }
      if (f.cta) { const b = button(c, f.cta, M, 0, ts.body * 0.92, pink, panel); bl.push(grp(b.ls, b.h)); }
      stack(c, bl, M, H - M); c.bg = bg0;
      if (mode === 'sq') { const t = T(c, 'script', 'El yazısı', f.script || 'taze lezzet', pw + M * 0.6, M * 0.8, W - pw - M * 1.4, ts.h3, P.a, { align: 'right', rotation: -6 }); void t; }
      return;
    }
    const ph = H * (mode === 'story' ? 0.46 : 0.5);
    rect(c, 'Renk paneli', 0, 0, W, ph, panel);
    const bl = [], bg1 = c.bg; c.bg = panel;
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, W - 2 * M, ts.label, pink, { opacity: 0.85 }), ts.body * 0.6));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, W - 2 * M, ts.d2 * 0.9, pink, { bind: 'product', maxLines: 2 }), ts.body * 0.6));
    if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, W * 0.8, ts.lead * 0.85, pink, { opacity: 0.85, bind: 'desc', maxLines: 2 })));
    const tr = stack(c, bl, M * 1.1, ph, 'start'); c.bg = bg1;
    // alt kısım: fiyat + buton + iletişim için gereken yükseklik
    const bl2 = [];
    if (f.price) { const p = price(c, f.price, W / 2, 0, ts.d1, P.a, 'center'); const o = f.old ? oldPrice(c, f.old, W / 2 + p.w / 2 + ts.body * 0.5, p.h * 0.5, ts.body, ink) : null; bl2.push(grp(p.ls.concat(o ? [o] : []), p.h, ts.body * 0.8)); }
    if (f.cta) { const b = button(c, f.cta, W / 2, 0, ts.body, panel, pink, 'center'); bl2.push(grp(b.ls, b.h)); }
    const need = bl2.reduce((x, b) => x + b.h + (b.gap || 0), 0) + ts.cap * 2.6 + M;
    const artTop = Math.max(tr.bottom + ts.body * 0.4, ph - W * 0.36);
    const s = Math.max(W * 0.3, Math.min(W * (mode === 'story' ? 0.86 : 0.7), H - artTop - need - ts.body * 0.6));
    const at = c.L.length;
    ell(c, 'Tabak gölgesi', (W - s * 0.92) / 2, artTop + s * 0.05, s * 0.92, s * 0.92, P.c);
    art(c, f.art, (W - s) / 2, artTop, s, s);
    const moved = c.L.splice(at); c.L.splice(c.L.indexOf(bl2.length ? bl2[0].ls[0] : c.L[c.L.length - 1]), 0, ...moved);
    stack(c, bl2, artTop + s + ts.body * 0.4, H - M - ts.cap * 2.6, 'start');
    contact(c, H - M * 0.78 - ts.cap * 1.45, ink);
    if (f.discount) badge(c, f.discount, /%|₺/.test(f.discount) ? 'İNDİRİM' : '', W - M - W * 0.11, artTop + s * 0.15, W * 0.24, P.b, on(P.b, '#FFFFFF', P.ink));
  }
  // 3) KOYU SAHNE: koyu zemin, spot ışık, büyük ürün, altta beyaz yazı
  function scene(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = P.d; c.artOverlapOk = true;
    if (CR(P.d, '#FFFFFF') < 7) c.bg = mixHex(P.d, '#000000', 0.4);
    // geniş ölçüde spot ışık ürünün arkasında durur (yazının arkası koyu kalsın, okunur olsun)
    const wideS = Math.min(H * 0.92, W * 0.46), spotX = (mode === 'wide' || mode === 'land') ? W - M - wideS / 2 : W * 0.5;
    const spotR = (mode === 'wide' || mode === 'land') ? Math.max(wideS * 1.5, H * 1.4) * 0.5 : Math.max(W, H) * 0.55;
    ell(c, 'Spot ışık', spotX - spotR, H * (mode === 'wide' ? 0.5 : 0.4) - spotR, spotR * 2, spotR * 2, { type: 'radial', colors: [P.c, (() => { const h = String(c.bg).replace('#', ''); return 'rgba(' + [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0).join(',') + ',0)'; })()] }, { opacity: 0.95 });
    const ink = '#FFFFFF';
    if (mode === 'wide' || mode === 'land') {
      const s = wideS;
      art(c, f.art, W - M - s, (H - s) / 2, s, s, { shadow: { x: 0, y: s * 0.04, blur: s * 0.12, color: 'rgba(0,0,0,0.55)' } });
      const cw = W - s - M * 2.4, bl = [];
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, cw, ts.label, P.a), ts.body * 0.6));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, ts.d1, ink, { bind: 'product', maxLines: 2 }), ts.body * 0.8));
      if (f.sub) bl.push(tb(T(c, 'sub', 'Alt başlık', f.sub, M, 0, cw * 0.9, ts.lead * 0.8, ink, { opacity: 0.75, bind: 'desc' }), ts.body * 1.1));
      if (f.price) { const p = price(c, f.price, M, 0, ts.h1, P.a); bl.push(grp(p.ls, p.h, ts.body)); }
      if (f.cta) { const b = button(c, f.cta, M, 0, ts.body * 0.9, P.a, on(P.a, '#FFFFFF', '#14110E')); bl.push(grp(b.ls, b.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    const at0 = c.L.length;
    const shade = rect(c, 'Alt karartma', 0, H * 0.4, W, H * 0.6, { type: 'linear', angle: 90, colors: ['rgba(0,0,0,0)', P.d] });
    const bl = [];
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, W - 2 * M, ts.label, P.a), ts.body * 0.5));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, W - 2 * M, mode === 'sq' ? ts.d1 : ts.d2 * 0.9, ink, { bind: 'product' }), ts.body * 0.6));
    if (f.sub) bl.push(tb(T(c, 'sub', 'Alt başlık', f.sub, M, 0, W * 0.75, ts.lead * 0.78, ink, { opacity: 0.75, bind: 'desc' }), ts.body * 0.9));
    const rowL = [];
    let rh = 0;
    if (f.price) { const p = price(c, f.price, M, 0, ts.h1, P.a); rowL.push(...p.ls); rh = Math.max(rh, p.h); }
    if (f.cta) { const b = button(c, f.cta, W - M, 0, ts.body * 0.9, P.a, on(P.a, '#FFFFFF', '#14110E'), 'right'); b.ls.forEach((l) => (l.y += Math.max(0, (rh - b.h) / 2))); rowL.push(...b.ls); rh = Math.max(rh, b.h); }
    if (rowL.length) bl.push(grp(rowL, rh));
    const res = stack(c, bl, M, H - M, 'end');
    const ay0 = mode === 'story' ? H * 0.1 : M * 0.5;
    const s = Math.min(W * (mode === 'story' ? 0.98 : mode === 'por' ? 0.9 : 0.78), (res.top - ay0) * 1.12);
    const a = art(c, f.art, (W - s) / 2, Math.max(ay0, res.top - s * 0.94), s, s, { shadow: { x: 0, y: s * 0.04, blur: s * 0.12, color: 'rgba(0,0,0,0.55)' } });
    c.L.splice(c.L.indexOf(a), 1); c.L.splice(at0, 0, a);
    shade.y = r1(res.top - ts.body * 4); shade.h = r1(H - shade.y);
  }
  // 4) TABAK: üstten çekim, tabak ortada, kavisli başlık
  function plate(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = P.bg;
    decor(c, f.decor || 'leaf');
    const ink = on(P.bg, P.ink, '#FFFFFF');
    if (mode === 'wide' || mode === 'land') {
      const s = Math.min(H * 1.05, W * 0.5);
      art(c, f.art, W - s * 0.82, (H - s) / 2, s, s);
      const cw = W - s * 0.82 - M * 2.2, bl = [];
      if (f.script) bl.push(tb(T(c, 'script', 'El yazısı', f.script, M, 0, cw, ts.h2, P.a), 0));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, ts.d1, ink, { bind: 'product', maxLines: 2 }), ts.body * 0.8));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, cw * 0.9, ts.body, ink, { opacity: 0.8, bind: 'desc' }), ts.body));
      if (f.price) { const p = price(c, f.price, M, 0, ts.h1, P.a); bl.push(grp(p.ls, p.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    const tTop = M;
    const t1 = f.script ? T(c, 'script', 'El yazısı', f.script, M, tTop, W - 2 * M, ts.h2, P.a, { align: 'center' }) : null;
    const t2 = T(c, 'head', 'Başlık', f.title, M, (t1 ? t1.y + t1.h * 0.82 : tTop), W - 2 * M, mode === 'sq' ? ts.h1 * 1.1 : ts.d1, ink, { align: 'center', bind: 'product' });
    const sub = f.sub && mode !== 'sq' ? T(c, 'body', 'Alt başlık', f.sub, W * 0.15, t2.y + t2.h + ts.body * 0.5, W * 0.7, ts.lead * 0.8, ink, { align: 'center', opacity: 0.8, bind: 'desc' }) : null;
    const top = (sub ? sub.y + sub.h : t2.y + t2.h) + ts.body * 0.6;
    const bottomH = (f.price ? ts.d1 : 0) + ts.cap * 3.4 + M;
    const s = Math.min(W * (mode === 'story' ? 1.02 : 0.86), H - top - bottomH);
    const at = c.L.length;
    art(c, f.art, (W - s) / 2, top, s, s);
    c.L.splice(at, 0, c.L.pop());
    if (f.price) { price(c, f.price, W / 2, top + s + ts.body * 0.3, ts.d1 * 0.9, P.a, 'center'); }
    if (f.discount) badge(c, f.discount, '', (W + s) / 2 - s * 0.12, top + s * 0.12, s * 0.26, P.a, on(P.a, '#FFFFFF', P.ink), 10);
    contact(c, H - M * 0.78 - ts.cap * 1.45, ink);
  }
  // 5) MENÜ: yemek adı …… fiyat satırları
  function menu(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = P.bg;
    decor(c, f.decor || (c.st.decor === 'burst' ? 'none' : c.st.decor));
    const ink = on(P.bg, P.ink, '#FFFFFF'), items = f.items || [];
    const wide = mode === 'wide' || mode === 'land';
    let colX = M, colW = W - 2 * M, artBox = null;
    if (wide) { const s = Math.min(H * 0.86, W * 0.36); artBox = { x: W - M - s, y: (H - s) / 2, s }; colW = W - s - M * 3; }
    else if (f.art) { const s = mode === 'story' ? W * 0.5 : W * 0.34; artBox = { x: W - s * 0.78, y: -s * 0.18, s }; }
    if (artBox) art(c, f.art, artBox.x, artBox.y, artBox.s, artBox.s);
    const bl = [];
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, colX, 0, colW * (artBox && !wide ? 0.66 : 1), ts.label, P.a), ts.body * 0.4));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, colX, 0, colW * (artBox && !wide ? 0.66 : 1), wide ? ts.h1 : mode === 'sq' ? ts.h1 : ts.d1, ink, { bind: 'product' }), ts.body * 0.4));
    if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, colX, 0, colW * 0.7, ts.body * 0.92, ink, { opacity: 0.75 }), ts.body * 1.1));
    rect(c, 'Ayraç', colX, 0, colW, Math.max(1, u * 0.25), ink, { opacity: 0.25 });
    bl.push(grp([c.L[c.L.length - 1]], u * 0.25, ts.body * 1.1));
    const n = items.length, fs = mode === 'sq' || wide ? ts.lead * 0.82 : ts.lead;
    const pc = P.a;
    items.forEach((it, i) => {
      const t = T(c, 'sub', 'Menü ' + (i + 1), `${it[0]}\t{${pc}|${it[1]}}`, colX, 0, colW, fs, ink, { fontWeight: c.st.sub[1], leader: 'dots', leaderOpacity: 0.35 });
      const ls = [t]; let h = t.h;
      if (it[2] && !(wide && n > 4)) { const d = T(c, 'body', 'Menü açıklama ' + (i + 1), it[2], colX, t.h + fs * 0.05, colW * 0.78, fs * 0.66, ink, { opacity: 0.65 }); ls.push(d); h += d.h + fs * 0.05; }
      bl.push(grp(ls, h, i < n - 1 ? fs * (mode === 'story' ? 1.1 : 0.8) : ts.body));
    });
    if (f.note) bl.push(tb(T(c, 'script', 'Not', f.note, colX, 0, colW, ts.h3 * 0.9, P.a, { align: wide ? 'left' : 'center' })));
    stack(c, bl, M + (artBox && !wide ? artBox.s * 0.18 : 0), H - M - ts.cap * 2.6);
    contact(c, H - M * 0.78 - ts.cap * 1.45, ink, wide ? 'left' : 'center', colX, colW);
  }
  // 6) KAMPANYA: dev indirim sayısı
  function offer(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = f.bg || (CR(P.a, '#FFFFFF') >= 3.6 || CR(P.a, P.ink) >= 6 ? P.a : P.d);
    if (CR(c.bg, '#FFFFFF') < 4.6 && CR(c.bg, '#14110E') < 4.6) c.bg = mixHex(c.bg, '#000000', 0.18);
    const ink = on(c.bg, '#FFFFFF', P.ink);
    pth(c, 'Süs · ışın', BURST, W * 0.5 - 70 * u, H * 0.45 - 70 * u, 140 * u, 140 * u, mixHex(c.bg, ink === '#FFFFFF' ? '#000000' : '#FFFFFF', 0.12), { opacity: 0.6 });
    const big = f.big || '%30';
    if (mode === 'wide' || mode === 'land') {
      const s = Math.min(H * 0.9, W * 0.32);
      art(c, f.art, W - M - s, (H - s) / 2, s, s);
      const cw = W - s - M * 3, bl = [];
      // Ü, İ, Ş gibi harflerin noktaları/çengelleri satır kutusunun üstüne çıkar: etiketle arasına pay bırak
      const accent = (fs) => (/[ÂÇĞÎİÖŞÛÜ]/.test(String(big).toLocaleUpperCase('tr-TR')) ? fs * 0.14 : 0);
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, cw, ts.label, ink), ts.body * 0.2 + accent(ts.mega * (mode === 'wide' ? 0.62 : 0.8))));
      bl.push(tb(T(c, 'head', 'Büyük oran', big, M, 0, cw, ts.mega * (mode === 'wide' ? 0.62 : 0.8), on(c.bg, P.b, ink), { bind: 'discount', uppercase: false, lineHeight: 0.9, letterSpacing: 0 }), ts.body * 0.3));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, ts.h2, ink, { bind: 'product' }), ts.body * 0.6));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, cw, ts.body, ink, { opacity: 0.85 })));
      stack(c, bl, M, H - M);
      return;
    }
    const bl = [];
    const accentC = /[ÂÇĞÎİÖŞÛÜ]/.test(String(big).toLocaleUpperCase('tr-TR')) ? ts.mega * (mode === 'sq' ? 0.95 : 1.15) * 0.14 : 0;
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, W - 2 * M, ts.label, ink, { align: 'center' }), ts.body * 0.2 + accentC));
    bl.push(tb(T(c, 'head', 'Büyük oran', big, M, 0, W - 2 * M, ts.mega * (mode === 'sq' ? 0.95 : 1.15), on(c.bg, P.b, ink), { align: 'center', bind: 'discount', uppercase: false, lineHeight: 0.88, letterSpacing: 0 }), ts.body * 0.35));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, W - 2 * M, mode === 'sq' ? ts.h2 : ts.h1, ink, { align: 'center', bind: 'product' }), ts.body * 0.6));
    const at = c.L.length;
    bl.push({ flex: true, at, min: W * 0.25, max: W * (mode === 'story' ? 0.8 : 0.5), gap: ts.body * 0.6, make: (y, h) => { const s = h; return [art(c, f.art, (W - s) / 2, y, s, s)]; } });
    if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, W * 0.12, 0, W * 0.76, ts.body, ink, { align: 'center', opacity: 0.9 }), ts.body * 0.8));
    if (f.cta) { const b = button(c, f.cta, W / 2, 0, ts.body, on(c.bg, P.d, '#FFFFFF'), c.bg, 'center'); bl.push(grp(b.ls, b.h)); }
    stack(c, bl, M, H - M - ts.cap * 2.6);
    contact(c, H - M * 0.78 - ts.cap * 1.45, ink);
  }
  // 7) PAKETLİ ÜRÜN (pazar yeri): stüdyo zemin, podyum, özellikler
  function pack(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = f.dark ? P.d : '#FFFFFF';
    const dark = !!f.dark, ink = dark ? '#FFFFFF' : P.ink;
    const wide = mode === 'wide' || mode === 'land';
    const feats = f.feats || [];
    const podium = (ax, ay, s) => { ell(c, 'Podyum', ax + s * 0.08, ay + s * 0.86, s * 0.84, s * 0.16, P.c); rect(c, 'Podyum gövdesi', ax + s * 0.08, ay + s * 0.94, s * 0.84, s * 0.14, { type: 'linear', angle: 90, colors: [P.c, c.bg] }); return art(c, f.art, ax, ay, s, s * 0.94); };
    if (wide) {
      const s = Math.min(H * 0.8, W * 0.36);
      podium(W - M - s, (H - s * 1.08) / 2, s);
      const cw = W - s - M * 3, bl = [];
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, M, 0, cw, ts.label, P.a), ts.body * 0.5));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, ts.h1, ink, { bind: 'product' }), ts.body * 0.8));
      feats.forEach((t, i) => { const d = ell(c, 'İşaret', M, ts.body * 0.2, ts.body * 0.7, ts.body * 0.7, P.a); const tt = T(c, 'sub', 'Özellik ' + (i + 1), t, M + ts.body * 1.2, 0, cw - ts.body * 1.2, ts.body * 0.92, ink, { fontWeight: 600 }); bl.push(grp([d, tt], tt.h, ts.body * 0.4)); });
      if (f.price) { const p = price(c, f.price, M, 0, ts.h1, P.a); bl[bl.length - 1].gap = ts.body; bl.push(grp(p.ls, p.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    if (f.tag) T(c, 'label', 'Üst etiket', f.tag, M, M * 0.8, W - 2 * M, ts.label, P.a, { align: 'center' });
    const t = T(c, 'head', 'Başlık', f.title, M, M * 0.8 + ts.label * 1.8, W - 2 * M, mode === 'sq' ? ts.h2 : ts.h1, ink, { align: 'center', bind: 'product' });
    const top = t.y + t.h + ts.body * 0.8;
    const fs = mode === 'sq' ? ts.cap : ts.label, chipH = feats.length ? fs * 2.4 + ts.body * 0.8 : 0, prH = f.price ? ts.d1 * 0.8 + ts.body : 0;
    const s = Math.min(W * (mode === 'story' ? 0.8 : mode === 'por' ? 0.72 : 0.6), (H - top - M - chipH - prH) / 1.1);
    const art0 = podium((W - s) / 2, top + (mode === 'sq' ? 0 : ts.body), s);
    // özellik çipleri: ürünün altında, yan yana
    const fy = art0.y + s * 1.08 + ts.body * 0.6;
    const chips = feats.map((txt, i) => { const l = T(c, 'sub', 'Özellik ' + (i + 1), txt, 0, 0, W, fs, ink, { on: P.c, fontWeight: 600, align: 'center' }); return { l, w: Math.ceil(R.measure(txt, l)) + fs * 2 }; });
    const cwMax = Math.max(0, ...chips.map((x) => x.w)); chips.forEach((x) => (x.w = cwMax));
    const gap = fs * 0.8, tw = cwMax * chips.length + gap * Math.max(0, chips.length - 1);
    let x = (W - tw) / 2;
    chips.forEach(({ l, w }) => { const cg = gid(); l.group = cg; const bg = rect(c, 'Özellik zemini', x, fy, w, fs * 2.4, P.c, { radius: fs * 1.2, group: cg }); c.L.splice(c.L.indexOf(bg), 1); c.L.splice(c.L.indexOf(l), 0, bg); Object.assign(l, { x: r1(x), w: r1(w), y: r1(fy + fs * 0.62) }); R.layoutText(l); x += w + gap; });
    const py = fy + (feats.length ? fs * 2.4 + ts.body * 0.8 : 0);
    if (f.price) { const p = price(c, f.price, W / 2, py, ts.d1 * 0.8, P.a, 'center'); if (f.old) oldPrice(c, f.old, W / 2 + p.w / 2 + ts.body * 0.5, py + p.h * 0.45, ts.body, ink); }
    if (f.discount) badge(c, f.discount, /%|₺/.test(f.discount) ? 'İNDİRİM' : '', art0.x + s * 0.88, art0.y + s * 0.12, s * 0.26, P.a, on(P.a, '#FFFFFF', P.ink), 8);
  }
  // ================================================================ v5.6 yeni düzenler (örnek görsellerdeki tasarım dillerinden)
  R.MASKS.diamond = 'M50 0 L100 50 L50 100 L0 50 Z';
  R.MASKS.swoosh = 'M0 0 H100 V80 C74 100 38 72 0 94 Z';
  R.MASKS.slant = 'M0 0 H100 V64 L0 100 Z';
  const MPATH = { arch: R.MASKS.arch, diamond: R.MASKS.diamond, swoosh: R.MASKS.swoosh, slant: R.MASKS.slant, blob: R.MASKS.blob, rounded: R.MASKS.rounded };
  // çerçeveli fotoğraf: kesilmemiş gerçek foto çerçeveyi doldurur, dekupe ürün renkli zeminin içinde durur
  function framed(c, kind, x, y, w, h, mask, panel, o = {}) {
    const pr = c.prod;
    if (pr && pr.src && pr.cut === false) return [c.add({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', src: pr.src, nw: pr.nw || 800, nh: pr.nh || 800, fit: 'cover', mask, x: r1(x), y: r1(y), w: r1(w), h: r1(h), filters: pr.food === false ? {} : Object.assign({}, LEZZET) })];
    const bgL = mask === 'circle' ? ell(c, 'Süs · çerçeve zemini', x, y, w, h, panel) : pth(c, 'Süs · çerçeve zemini', MPATH[mask] || MPATH.rounded, x, y, w, h, panel);
    const s = Math.min(w, h) * (o.fill || 0.84);
    const a = art(c, kind, x + (w - s) / 2, y + (h - s) / 2 + (o.dy || 0) * h, s, s);
    return [bgL, a];
  }
  function shift(ls, dx, dy) { ls.forEach((l) => { l.x = r1(l.x + dx); l.y = r1(l.y + dy); if (l.priceBox) { l.priceBox.x += dx; l.priceBox.y += dy; } }); }
  const words = (s) => String(s || '').trim().split(/\s+/);
  // başlığı satırlara böl: her satır en fazla n kelime
  function lines(s, n) { const w = words(s), out = []; for (let i = 0; i < w.length; i += n) out.push(w.slice(i, i + n).join(' ')); return out; }
  // yazıyı verilen genişliğe tam sığdır (tek satır)
  function fitW(l, w, max) { const t = l.uppercase ? R.plain(l.text).toLocaleUpperCase('tr-TR') : R.plain(l.text); const m = R.measure(t, Object.assign({}, l, { fontSize: 100, letterSpacing: (l.letterSpacing / l.fontSize) * 100 })) || 1; const fs = Math.min(max || 1e9, (w / m) * 100 * 0.98); l.letterSpacing = r1((l.letterSpacing / l.fontSize) * fs); l.fontSize = r1(fs); l.w = r1(w); R.layoutText(l); return l; }
  const SPARK = 'M50 0C53 36 64 47 100 50C64 53 53 64 50 100C47 64 36 53 0 50C36 47 47 36 50 0Z';
  const ASTER = 'M44 0H56V36L87 18L93 28L62 46V54L93 72L87 82L56 64V100H44V64L13 82L7 72L38 54V46L7 28L13 18L44 36Z';

  // 8) ÇERÇEVE: koyu zemin, ince çizgi çerçeve, başlık çerçeveyi keser, ürün çerçeveden taşar, beyaz fiyat kutusu
  function frame(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = lum(P.d) < 0.12 ? P.d : mixHex(P.d, '#000000', 0.45);
    const ink = '#FFFFFF', line = mixHex('#FFFFFF', P.a, 0.15);
    ell(c, 'Spot ışık', W * 0.5 - Math.max(W, H) * 0.6, H * 0.45 - Math.max(W, H) * 0.6, Math.max(W, H) * 1.2, Math.max(W, H) * 1.2, { type: 'radial', colors: [mixHex(c.bg, P.a, 0.28), c.bg] }, { opacity: 0.9 });
    const wide = mode === 'wide' || mode === 'land';
    const fx0 = wide ? M * 0.7 : M * 0.75, fw = W - fx0 * 2;
    // başlık: küçük el yazısı + büyük başlık (el yazısı, kalınlaştırılmış)
    const scr = f.script || f.tag;
    const t0 = scr ? T(c, 'script', 'El yazısı', scr, M, M * 0.6, W - 2 * M, wide ? ts.h3 : ts.h2, P.a, { align: 'center', maxLines: 1 }) : null;
    const big = T(c, 'script', 'Başlık', f.title, M * 0.6, (t0 ? t0.y + t0.h * 0.82 : M), W - 1.2 * M, wide ? ts.d1 : mode === 'sq' ? ts.d1 * 1.05 : ts.d2, ink, { align: 'center', bind: 'product', maxLines: 2, lineHeight: 0.98, fx: { outline: { width: 0, color: ink } }, shadow: { x: 0, y: r1(u * 0.4), blur: r1(u * 1.2), color: 'rgba(0,0,0,0.5)' } });
    big.fx = { outline: { width: r1(big.fontSize * 0.028), color: ink } };
    const lastLine = big.y + big.h - big.fontSize * 0.55;
    const fy = lastLine;
    // alt satır: fiyat kutusu + açıklama
    const rowH = ts.h1 * 1.25, rowY = H - M * 0.9 - ts.cap * 2.2 - rowH;
    const fh = rowY - ts.body * 1.6 - fy;
    const frm = rect(c, 'Süs · çerçeve', fx0, fy, fw, fh, 'rgba(0,0,0,0)', { stroke: line, strokeWidth: r1(u * 0.55) });
    c.L.splice(c.L.indexOf(frm), 1); c.L.splice(c.L.indexOf(t0 || big), 0, frm); // çerçeve çizgisi başlığın altında kalsın
    // başlığın arkasında çizgiyi kesen boşluk
    const gapW = Math.min(fw * 0.96, (big._lines ? Math.max(...big._lines.map((s) => R.measure(s, big))) : big.w) + ts.body * 2);
    const gapL = rect(c, 'Süs · çerçeve boşluğu', W / 2 - gapW / 2, fy - u * 1.5, gapW, u * 3, c.bg);
    c.L.splice(c.L.indexOf(gapL), 1); c.L.splice(c.L.indexOf(big), 0, gapL);
    // ürün: çerçevenin alt kenarından taşar
    const at = c.L.length;
    const s = Math.min(fw * (wide ? 0.42 : 0.86), (fy + fh) - (big.y + big.h) + fh * 0.08);
    const ax = wide ? W - fx0 - s * 1.05 : (W - s) / 2, ay = Math.min(fy + fh + s * 0.1 - s, rowY - ts.body - s);
    art(c, f.art, ax, Math.max(big.y + big.h + u, ay), s, s);
    const moved = c.L.splice(at); c.L.splice(c.L.indexOf(t0 || big), 0, ...moved);
    // fiyat kutusu + açıklama
    let px = W / 2;
    const p = f.price ? price(c, f.price, 0, 0, ts.h1 * 0.92, c.bg, 'left', { on: '#FFFFFF' }) : null;
    const boxW = p ? p.w + ts.body * 2 : 0;
    const descW = Math.min(W * 0.42, W - 2.4 * M - boxW - ts.body * 1.5);
    const desc = f.sub ? T(c, 'body', 'Alt başlık', f.sub, 0, 0, descW, ts.body * 0.95, ink, { opacity: 0.9, bind: 'desc', maxLines: 3, fontWeight: 600 }) : null;
    const totalW = boxW + (desc ? ts.body * 1.2 + Math.min(descW, Math.max(...(desc._lines || ['']).map((s) => R.measure(s, desc))) + 4) : 0);
    px = (W - totalW) / 2;
    if (p) {
      const bx = rect(c, 'Fiyat zemini', px, rowY, boxW, rowH, '#FFFFFF', { radius: r1(u * 0.6) });
      c.L.splice(c.L.indexOf(bx), 1); c.L.splice(c.L.indexOf(p.ls[0]), 0, bx);
      shift(p.ls, px + ts.body, rowY + (rowH - p.h) / 2);
    }
    if (desc) { desc.x = r1(px + boxW + ts.body * 1.2); desc.y = r1(rowY + (rowH - desc.h) / 2); desc.w = r1(Math.max(...(desc._lines || ['']).map((s2) => R.measure(s2, desc))) + 4); R.layoutText(desc); }
    contact(c, H - M * 0.6 - ts.cap * 1.4, ink, 'center');
    if (f.discount) badge(c, f.discount, /%|₺/.test(f.discount) ? 'İNDİRİM' : '', ax + s * 0.88, Math.max(big.y + big.h + u, ay) + s * 0.2, s * 0.26, P.a, on(P.a, '#FFFFFF', P.ink));
    c.artOverlapOk = false;
  }

  // 9) RETRO BLOKLAR: renk blokları, kemer çerçeve, konuşma balonu, yuvarlak fiyat, iri başlık
  function retro(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = P.bg;
    const dk = lum(P.ink) < 0.2 ? P.ink : '#16120F', cream = lum(P.bg) > 0.75 ? P.bg : '#F6EADB';
    const pink = P.c, yel = P.b;
    const wide = mode === 'wide' || mode === 'land';
    if (wide) {
      rect(c, 'Renk paneli', W * 0.5, 0, W * 0.5, H, dk);
      rect(c, 'Süs · blok', W * 0.5, H * 0.62, W * 0.22, H * 0.38, pink);
      const s = Math.min(H * 0.86, W * 0.4);
      framed(c, f.art, M, (H - s) / 2, s * 0.86, s, 'arch', yel);
      const cw = W * 0.5 - M * 1.4, bl = [], bg0 = c.bg; c.bg = dk;
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, W * 0.5 + M * 0.7, 0, cw, ts.label, pink), ts.body * 0.5));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, W * 0.5 + M * 0.7, 0, cw, ts.d1 * 0.9, cream, { bind: 'product', maxLines: 3 }), ts.body * 0.6));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, W * 0.5 + M * 0.7, 0, cw * 0.9, ts.body, cream, { opacity: 0.85, bind: 'desc', maxLines: 2 }), ts.body));
      if (f.cta) { const b = button(c, f.cta, W * 0.5 + M * 0.7, 0, ts.body * 0.9, yel, on(yel, dk, '#FFFFFF')); bl.push(grp(b.ls, b.h)); }
      stack(c, bl, M, H - M); c.bg = bg0;
      if (f.price) { const d = s * 0.34; ell(c, 'Fiyat zemini', M + s * 0.62, H / 2 + s * 0.18, d, d, dk); const p = price(c, f.price, 0, 0, d * 0.34, cream, 'center', { on: dk }); shift(p.ls, M + s * 0.62 + d / 2, H / 2 + s * 0.18 + (d - p.h) / 2); }
      return;
    }
    const st = mode === 'story', por = mode === 'por';
    // bloklar
    const bandY = H * (st ? 0.6 : por ? 0.6 : 0.6);
    rect(c, 'Renk paneli', 0, bandY, W, H - bandY, dk);
    rect(c, 'Süs · blok', W * 0.52, bandY - H * 0.16, W * 0.48, H * 0.16, pink);
    rect(c, 'Süs · blok', 0, H - H * 0.1, W * 0.16, H * 0.1, cream === c.bg ? yel : cream);
    // halkalar ve yıldız
    const rr = W * 0.07;
    ell(c, 'Süs · halka', W - M - rr * 2, M * 0.7, rr * 1.6, rr * 1.6, 'rgba(0,0,0,0)', { stroke: dk, strokeWidth: r1(u * 1.6) });
    ell(c, 'Süs · halka', W - M - rr * 4.2, M * 0.7, rr * 1.6, rr * 1.6, 'rgba(0,0,0,0)', { stroke: dk, strokeWidth: r1(u * 1.6) });
    pth(c, 'Süs · yıldız', SPARK, W * 0.62, bandY - H * 0.105, W * 0.05, W * 0.05, dk);
    pth(c, 'Süs · yıldız', BURST, M * 0.4, H - H * 0.1 + H * 0.012, W * 0.09, W * 0.09, yel, { opacity: 1 });
    // kemer çerçeveli fotoğraf
    c.noGhost = true;
    const aw = W * (st ? 0.6 : por ? 0.52 : 0.46), ah = Math.min(H * (st ? 0.44 : 0.5), aw * 1.35), ax = M, ay = bandY - ah + H * 0.08;
    framed(c, f.art, ax, ay, aw, ah, 'arch', yel, { dy: 0.04 });
    // konuşma balonu: etiket
    if (f.tag) {
      const bt = T(c, 'sub', 'Üst etiket', f.tag, 0, 0, W * 0.5, ts.body * (st ? 0.9 : 1.05), dk, { on: '#FFFFFF', uppercase: true, fontWeight: 900, align: 'center', maxLines: 1, lineHeight: 1 });
      const tw0 = R.measure(String(f.tag).toLocaleUpperCase('tr-TR'), bt), bw = tw0 + ts.body * 1.6, bh = bt.h + ts.body * 1.1;
      const bx = Math.min(ax + aw * 0.62, W - M - bw), by = ay + ah * 0.08; c._bubble = by + bh;
      const g = gid();
      rect(c, 'Balon zemini', bx, by, bw, bh, '#FFFFFF', { radius: r1(bh * 0.3), stroke: dk, strokeWidth: r1(u * 0.5), group: g });
      pth(c, 'Süs · balon ucu', 'M0 0L100 0L20 100Z', bx + bw * 0.12, by + bh - u * 0.4, bw * 0.16, bh * 0.4, '#FFFFFF', { stroke: dk, strokeWidth: r1(u * 0.5), group: g });
      c.L.splice(c.L.indexOf(bt), 1); c.L.push(bt);
      Object.assign(bt, { x: r1(bx), w: r1(bw), y: r1(by + (bh - bt.h) / 2), group: g }); R.layoutText(bt);
    }
    // yuvarlak fiyat
    if (f.price) { const d = W * 0.19, cx = ax + aw * 0.06, cy = ay + ah * 0.66; ell(c, 'Fiyat zemini', cx, cy, d, d, dk, { stroke: cream, strokeWidth: r1(u * 0.6) }); const p = price(c, f.price, 0, 0, d * 0.36, cream, 'center', { on: dk }); shift(p.ls, cx + d / 2, cy + (d - p.h) / 2); }
    // sağ üst: kısa açıklama + iletişim
    const rx = ax + aw + M * 0.6, rw = W - rx - M;
    const bl = [];
    if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, rx, 0, rw, ts.body * (st ? 1.25 : 0.9), dk, { bind: 'desc', maxLines: 4, align: 'right' }), ts.body * 0.8));
    bl.push(tb(T(c, 'label', 'İletişim', 'www.markaniz.com', rx, 0, rw, ts.cap, dk, { align: 'right' })));
    if (st || por) { bl.forEach((b) => b.ls.forEach((l) => { l.x = r1(M); l.w = r1(W - 2 * M); l.align = 'right'; R.layoutText(l); })); stack(c, bl, M * 0.7 + rr * 1.9, ay - ts.body, 'end'); }
    else stack(c, bl, Math.max(M * 0.7 + rr * 1.9, c._bubble ? c._bubble + ts.body * 0.6 : 0), bandY - H * 0.18, 'end');
    // konuşma balonu iletişim / açıklama yazısının üstüne binmesin: gerekirse aşağı kaydır
    if (f.tag && (st || por)) {
      const bz = c.L.filter((l) => /^Balon zemini$|^Süs · balon ucu$/.test(l.name) || (l.name === 'Üst etiket')), z = bz.find((l) => l.name === 'Balon zemini');
      const txt = c.L.filter((l) => l.type === 'text' && (l.name === 'İletişim' || l.name === 'Alt başlık'));
      if (z) { let need = 0; txt.forEach((l) => { const tw = Math.max(...(l._lines || ['']).map((x) => R.measure(x, l))), lx = l.align === 'right' ? l.x + l.w - tw : l.x; if (lx < z.x + z.w && lx + tw > z.x && l.y < z.y + z.h && l.y + l.h > z.y) need = Math.max(need, l.y + l.h + ts.body * 0.4 - z.y); }); if (need > 0) bz.forEach((l) => { l.y = r1(l.y + need); }); }
    }
    // iri başlık koyu bandın içinde, sağa yaslı
    const bg0 = c.bg; c.bg = dk;
    const hx = W * 0.2, hw = W - hx - M;
    const bl2 = [tb(T(c, 'head', 'Başlık', f.title, hx, 0, hw, st ? ts.d2 : ts.d1 * 1.05, cream, { bind: 'product', align: 'right', maxLines: 3, uppercase: true, lineHeight: 0.92 }), ts.body * 0.5)];
    if (f.script || f.cta) bl2.push(tb(T(c, 'label', 'El yazısı', f.script || f.cta, hx, 0, hw, ts.label, pink, { align: 'right' })));
    stack(c, bl2, bandY + ts.body * 1.2, H - M * 0.8, 'center'); c.bg = bg0;
  }

  // 10) ÇİZİM DESENLİ: tek renk zemin + çizgi desen, eşkenar dörtgen fotoğraf, kutulu başlık kelimeleri
  function doodle(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.noTex = true; c.noGhost = true;
    const base = lum(P.b) > 0.35 && lum(P.b) < 0.75 ? P.b : P.a;
    c.bg = mixHex(base, '#000000', 0.08);
    const TH = window.FoodTheme;
    if (TH && TH.doodles) c.add({ type: 'image', name: 'Süs · çizim deseni', src: TH.doodles(Math.round(W), Math.round(H), lum(c.bg) > 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.22)', c.cat), nw: Math.round(W), nh: Math.round(H), fit: 'fill', x: 0, y: 0, w: W, h: H });
    const ink = on(c.bg, P.ink, '#FFFFFF'), boxC = mixHex(c.bg, '#FFFFFF', 0.55), boxInk = on(boxC, P.ink, '#14110E');
    const wide = mode === 'wide' || mode === 'land';
    const titleLines = lines(f.title, words(f.title).length > 3 ? 2 : 1).slice(0, 3);
    const boxed = (x, y, w, align) => {
      let yy = y; const out = [];
      titleLines.forEach((ln) => {
        const t = T(c, 'head', 'Başlık', ln, x, yy, w, (wide ? ts.h1 : mode === 'sq' ? ts.h2 * 1.1 : mode === 'por' ? ts.h1 : ts.d1 * 0.92), boxInk, { on: boxC, align, uppercase: true, maxLines: 1, lineHeight: 1, bind: 'product' });
        const tw = R.measure(ln.toLocaleUpperCase('tr-TR'), t) + t.fontSize * 0.5, bx = align === 'center' ? x + (w - tw) / 2 : x;
        const b = rect(c, 'Süs · kutu', bx, yy - t.fontSize * 0.05, tw, t.h + t.fontSize * 0.1, boxC, { stroke: boxInk, strokeWidth: r1(u * 0.45) });
        c.L.splice(c.L.indexOf(b), 1); c.L.splice(c.L.indexOf(t), 0, b);
        out.push(b, t); yy += t.h + t.fontSize * 0.25;
      });
      return { ls: out, h: yy - y };
    };
    if (wide) {
      const s = Math.min(H * 0.95, W * 0.38);
      pth(c, 'Süs · çerçeve', R.MASKS.diamond, W - M - s * 1.04 - s * 0.06, (H - s * 1.08) / 2, s * 1.08, s * 1.08, 'rgba(0,0,0,0)', { stroke: ink, strokeWidth: r1(u * 0.5), opacity: 0.6 });
      framed(c, f.art, W - M - s, (H - s) / 2, s, s, 'diamond', mixHex(c.bg, '#FFFFFF', 0.3), { fill: 0.7 });
      const cw = W - s - M * 2.8, bl = [], LX = M * 1.25;
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, LX, 0, cw, ts.label, ink), ts.body * 0.6));
      const bx = boxed(LX, 0, cw, 'left'); bl.push(grp(bx.ls, bx.h, ts.body * 0.4));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, LX, 0, cw * 0.9, ts.body, ink, { bind: 'desc', maxLines: 2 }), ts.body * 0.8));
      if (f.price) { const p = price(c, f.price, LX, 0, ts.h1, ink); bl.push(grp(p.ls, p.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    const bl = [];
    bl.push(tb(T(c, 'script', 'El yazısı', f.script || f.tag || 'lezzet', M, 0, W - 2 * M, ts.h2, ink, { align: 'center' }), ts.body * 0.3));
    const bx = boxed(M, 0, W - 2 * M, 'center'); bl.push(grp(bx.ls, bx.h, ts.body * 0.2));
    if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, W * 0.14, 0, W * 0.72, ts.body * 0.92, ink, { align: 'center', opacity: 0.9, bind: 'desc', maxLines: 2 }), ts.body * 0.6));
    const at = c.L.length;
    bl.push({ flex: true, at, min: W * 0.3, max: W * (mode === 'story' ? 0.84 : 0.66), gap: ts.body * 0.4, make: (y, h) => {
      const s = Math.min(h, W * 0.84), x0 = (W - s) / 2;
      const o = pth(c, 'Süs · çerçeve', R.MASKS.diamond, x0 - s * 0.05, y - s * 0.05, s * 1.1, s * 1.1, 'rgba(0,0,0,0)', { stroke: ink, strokeWidth: r1(u * 0.5), opacity: 0.55 });
      const fr = framed(c, f.art, x0, y, s, s, 'diamond', mixHex(c.bg, '#FFFFFF', 0.3), { fill: 0.68 });
      c._dia = { x: x0, y, s };
      return [o, ...fr];
    } });
    const rowL = []; let rh = 0;
    if (f.price) { const p = price(c, f.price, W / 2, 0, ts.h1, ink, 'center'); rowL.push(...p.ls); rh = p.h; }
    if (rowL.length) bl.push(grp(rowL, rh, ts.body * 0.4));
    stack(c, bl, M * 0.8, H - M - ts.cap * 2.4);
    contact(c, H - M * 0.7 - ts.cap * 1.45, ink);
    if (f.discount && c._dia) { const d = c._dia; const g = badge(c, f.discount, /%/.test(f.discount) ? 'İNDİRİM' : '', d.x + d.s * 0.93, d.y + d.s * 0.7, d.s * 0.24, '#FFFFFF', P.ink, 0); void g; }
  }

  // 11) AFİŞ YAZISI: kanvası dolduran dev başlık, üstüne binen ürün, eğik şerit, yuvarlak çıkartma
  function poster(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = lum(P.bg) > 0.8 ? P.bg : '#FBF3E6';
    c.artOverlapOk = true; c.noGhost = true;
    const ink = lum(P.ink) < 0.25 ? P.ink : '#141210', red = CR(P.a, c.bg) > 2.5 ? P.a : '#E8473E';
    const wide = mode === 'wide' || mode === 'land';
    T(c, 'label', 'Üst etiket', f.tag || 'Yeni', M, M * 0.6, W * 0.45, ts.cap, ink);
    T(c, 'label', 'İletişim', 'www.markaniz.com', W / 2, M * 0.6, W / 2 - M, ts.cap, ink, { align: 'right' });
    // dev başlık: iki dengeli satır
    const wl = words(f.title);
    let cut = 1, best = 1e9; for (let i = 1; i < wl.length; i++) { const d = Math.abs(wl.slice(0, i).join(' ').length - wl.slice(i).join(' ').length); if (d < best) { best = d; cut = i; } }
    const ls = wl.length > 1 ? [wl.slice(0, cut).join(' '), wl.slice(cut).join(' ')] : [wl[0]];
    const st = mode === 'story'; // hikâyede ürün başlığın altına iner, yazının üstüne binmez
    const s = wide ? Math.min(H * 0.9, W * 0.34) : W * (st ? 0.62 : mode === 'por' ? 0.5 : 0.44);
    const top = M * 0.6 + ts.cap * 2.6, bot = H - M * 0.6 - ts.cap * 2.6 - (wide ? 0 : ts.h1 * 1.4);
    const colW = wide ? W - s - M * 1.6 : W - 1.2 * M;
    const mk = (txt, i, w, maxFs) => fitW(c.add({ type: 'text', name: 'Başlık', text: txt, x: M * 0.6, y: 0, w, h: 10, fontSize: 100, fontFamily: c.st.head[0], fontWeight: 900, uppercase: true, letterSpacing: -3, lineHeight: 0.86, align: 'left', fill: i ? red : ink, bind: i ? undefined : 'product' }), w, maxFs);
    const bandH = ts.h2 * 1.3;
    const maxFs = (bot - top - bandH * 1.3 - (st ? s * 0.9 : 0)) / (ls.length * 0.9) * (wide ? 0.82 : 1);
    const h1 = mk(ls[0], 0, colW, Math.min(maxFs, wide ? H * 0.3 : W * 0.3));
    const h2 = ls[1] ? mk(ls[1], 1, colW - (wide || st ? 0 : s * 0.86), Math.min(maxFs, wide ? H * 0.3 : W * 0.3)) : null;
    const used = h1.h + (h2 ? h2.h : 0) + bandH * 1.3 + (st ? s * 0.95 : 0);
    let y = top + Math.max(0, (bot - top - used) / 2 - (wide || st ? 0 : s * 0.12));
    h1.y = r1(y); y += h1.h + bandH * 0.15;
    const bandY = y; y += bandH * 1.15;
    if (h2) { h2.y = r1(y); }
    // eğik şerit başlık satırlarının arasında
    const g = gid(), bfill = red;
    rect(c, 'Şerit', -W * 0.1, bandY, W * 1.2, bandH, mixHex(bfill, '#000', 0.06), { rotation: -4, group: g });
    T(c, 'sub', 'Şerit yazısı', (f.script || f.sub || 'taptaze').toLocaleUpperCase('tr-TR'), M, bandY + bandH * 0.22, W * 0.6, bandH * 0.48, '#FFFFFF', { on: bfill, rotation: -4, group: g, letterSpacing: r1(bandH * 0.06), maxLines: 1, bind: 'desc' });
    pth(c, 'Süs · yıldız', ASTER, W * 0.7, bandY + bandH * 0.13, bandH * 0.74, bandH * 0.74, '#FFFFFF', { rotation: -4, group: g });
    // ürün: ikinci satırın sağ ucuna biner
    let ax = wide ? W - s - M * 0.3 : Math.min(W - s * 0.92, (h2 ? h2.x + R.measure(String(h2.text).toLocaleUpperCase('tr-TR'), h2) : W) - s * 0.06); let ay = wide ? (H - s) / 2 : h2 ? Math.min(h2.y + h2.h * 0.5 - s * 0.5, bot - s * 0.85) : bandY;
    if (st) { ax = (W - s) / 2; ay = Math.min((h2 ? h2.y + h2.h : bandY + bandH * 1.2) + ts.body * 0.4, bot - s * 0.9); }
    art(c, f.art, ax, ay, s, s, { shadow: { x: 0, y: r1(s * 0.04), blur: r1(s * 0.08), color: 'rgba(0,0,0,0.35)' } });
    badge(c, f.discount || 'YENİ', '', ax + s * 0.1, ay + s * 0.12, s * 0.28, '#2FA84F', '#FFFFFF', -12);
    if (!wide) {
      const by = H - M * 0.6 - ts.cap * 2.4 - ts.h1 * 1.15;
      if (f.price) price(c, f.price, M, by, ts.h1, ink);
      if (f.cta) button(c, f.cta, W - M, by + ts.h1 * 0.05, ts.body * 0.9, ink, c.bg, 'right');
    }
    T(c, 'label', 'Alt bilgi', (f.sub || '').slice(0, 60) || 'Her gün taze', M, H - M * 0.6 - ts.cap * 1.3, W - 2 * M, ts.cap, ink, { align: 'center', maxLines: 1 });
  }

  // 12) KAVİS: üstte geniş fotoğraf alanı kavisli kesimle biter, altta el yazısı + kalın başlık, fiyat şeritleri, fırça kutu
  function curve(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = lum(P.bg) > 0.8 ? P.bg : '#FFFFFF';
    const ink = on(c.bg, P.ink, '#14110E'), acc = CR(P.a, c.bg) > 2.6 ? P.a : P.d;
    const wide = mode === 'wide' || mode === 'land';
    const TH = window.FoodTheme;
    if (wide) {
      framed(c, f.art, W * 0.46, 0, W * 0.54, H, 'swoosh', { type: 'linear', angle: 135, colors: [mixHex(P.a, '#000', 0.1), mixHex(P.d, '#000', 0.2)] }, { fill: 0.78 });
      const cw = W * 0.46 - M * 1.4, bl = [];
      if (f.script) bl.push(tb(T(c, 'script', 'El yazısı', f.script, M, 0, cw, ts.h2, acc), 0));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, M, 0, cw, ts.d1 * 0.9, ink, { bind: 'product', maxLines: 2 }), ts.body * 0.6));
      if (f.sub) bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, cw * 0.95, ts.body, ink, { opacity: 0.8, bind: 'desc', maxLines: 2 }), ts.body));
      if (f.price) { const p = price(c, f.price, M, 0, ts.h1, acc); bl.push(grp(p.ls, p.h)); }
      stack(c, bl, M, H - M);
      return;
    }
    const ph = H * (mode === 'story' ? 0.5 : mode === 'por' ? 0.5 : 0.52);
    framed(c, f.art, 0, 0, W, ph, 'swoosh', { type: 'linear', angle: 135, colors: [mixHex(P.a, '#000', 0.05), mixHex(P.d, '#000', 0.25)] }, { fill: 0.78, dy: -0.02 });
    // kavis boyunca vurgu çizgisi
    pth(c, 'Süs · kavis', 'M0 96 C38 74 74 102 100 82', 0, ph * 0.02, W, ph, 'rgba(0,0,0,0)', { stroke: acc, strokeWidth: r1(u * 1.2) });
    const lx = M, lw = W * (mode === 'sq' ? 0.5 : 0.56);
    const bl = [];
    if (f.script) bl.push(tb(T(c, 'script', 'El yazısı', f.script, lx, 0, lw, ts.h2, acc, { maxLines: 1 }), -ts.body * 0.1));
    bl.push(tb(T(c, 'head', 'Başlık', f.title, lx, 0, lw, mode === 'sq' ? ts.h1 : ts.d1 * 0.85, ink, { bind: 'product', maxLines: 3 }), ts.body * 0.6));
    if (f.sub && mode !== 'sq') bl.push(tb(T(c, 'body', 'Alt başlık', f.sub, lx, 0, lw * 0.95, ts.body * 0.9, ink, { opacity: 0.75, bind: 'desc', maxLines: 3 })));
    const res = stack(c, bl, ph + ts.body * 0.4, H - M - ts.h2 * 1.6 - ts.cap * 2.2, 'start');
    // sağ sütun: eğik fiyat şeritleri (özellik / menü satırları)
    const rows = (f.items && f.items.length ? f.items.map((r) => [r[0], r[1]]) : (f.feats || []).map((t) => [t, ''])).slice(0, mode === 'sq' ? 2 : 3);
    if (rows.length) {
      const rx = lx + lw + ts.body, rw = W - rx - M * 0.6, rhh = ts.h3 * 1.25, ry0 = ph + ts.body * 0.8;
      rows.forEach((r, i) => {
        const y = ry0 + i * (rhh + ts.body * 0.4), g = gid();
        pth(c, 'Şerit zemini', 'M8 0H100L92 100H0Z', rx, y, rw, rhh, acc, { group: g });
        T(c, 'sub', 'Şerit yazısı', r[0], rx + rw * 0.08, y + (rhh - ts.body * 1.1) / 2, rw * (r[1] ? 0.56 : 0.86), ts.body * 0.82, '#FFFFFF', { on: acc, group: g, maxLines: 1, uppercase: true, fontWeight: 800 });
        if (r[1]) T(c, 'sub', 'Şerit fiyatı', r[1], rx + rw * 0.6, y + (rhh - ts.body * 1.1) / 2, rw * 0.32, ts.body * 0.9, '#FFFFFF', { on: acc, group: g, align: 'right', maxLines: 1, fontWeight: 900 });
      });
    }
    // fırça kutu: fiyat ya da buton
    const by = Math.max(res.bottom + ts.body * 0.6, H - M - ts.h2 * 1.5 - ts.cap * 2.2), bw = W * 0.42, bh = ts.h2 * 1.5;
    if (TH) c.add({ type: 'image', name: 'Süs · fırça', src: TH.texture('brush', 600, 200, mixHex(ink, '#000', 0.1), null, 4), nw: 600, nh: 200, fit: 'fill', x: lx - bw * 0.04, y: by - bh * 0.1, w: bw, h: bh * 1.2 });
    const bg0 = c.bg; c.bg = ink;
    if (f.price) { const p = price(c, f.price, 0, 0, ts.h2 * 0.9, '#FFFFFF', 'center', { on: ink }); shift(p.ls, lx + bw * 0.48, by + (bh - p.h) / 2 + bh * 0.05); }
    else if (f.cta) T(c, 'sub', 'Buton yazısı', f.cta, lx, by + bh * 0.3, bw, ts.body, '#FFFFFF', { align: 'center', uppercase: true, bind: 'cta' });
    c.bg = bg0;
    contact(c, H - M * 0.7 - ts.cap * 1.4, ink, 'right', W * 0.54, W * 0.46 - M);
  }

  // 13) KÖŞEGEN ŞERİT: eğik kesimli fotoğraf, renkli köşegen bant, koyu panelde özellik listesi, 3 hücreli alt bilgi
  function band(c, f) {
    const { W, H, u, M, mode, P, ts } = c;
    c.bg = '#FFFFFF';
    const dk = lum(P.d) < 0.2 ? P.d : '#1C1E2B', acc = lum(P.b) > 0.45 ? P.b : (lum(P.a) > 0.4 ? P.a : '#F5C02A');
    const wide = mode === 'wide' || mode === 'land';
    pth(c, 'Süs · köşegen bant', 'M0 30 L100 70 L100 88 L0 48 Z', -W * 0.05, H * 0.1, W * 1.1, H * 0.7, acc);
    const feats = (f.feats && f.feats.length ? f.feats : ['Taze', 'Hızlı', 'Güvenli']).slice(0, 3);
    if (wide) {
      framed(c, f.art, 0, 0, W * 0.5, H, 'slant', { type: 'linear', angle: 135, colors: [mixHex(P.a, '#fff', 0.1), mixHex(P.d, '#000', 0.1)] }, { fill: 0.74 });
      rect(c, 'Renk paneli', W * 0.5, 0, W * 0.5, H, dk);
      const cw = W * 0.5 - M * 1.6, bl = [], bg0 = c.bg; c.bg = dk;
      if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, W * 0.5 + M * 0.8, 0, cw, ts.label, acc), ts.body * 0.5));
      bl.push(tb(T(c, 'head', 'Başlık', f.title, W * 0.5 + M * 0.8, 0, cw, ts.h1, '#FFFFFF', { bind: 'product', maxLines: 2 }), ts.body * 0.8));
      if (f.price) { const p = price(c, f.price, W * 0.5 + M * 0.8, 0, ts.h1, acc); bl.push(grp(p.ls, p.h)); }
      stack(c, bl, M, H - M); c.bg = bg0;
      return;
    }
    const ph = H * 0.42;
    framed(c, f.art, 0, 0, W, ph, 'slant', { type: 'linear', angle: 160, colors: [mixHex(P.a, '#fff', 0.15), mixHex(P.d, '#000', 0.05)] }, { fill: 0.7, dy: -0.02 });
    // logo kutusu
    const lg = rect(c, 'Süs · logo zemini', W - M - W * 0.16, 0, W * 0.16, W * 0.15, acc);
    void lg;
    T(c, 'label', 'Marka', 'MARKA', W - M - W * 0.16, W * 0.058, W * 0.16, ts.cap, on(acc, dk, '#FFFFFF'), { align: 'center' });
    // koyu panel (sağ) + sol sütun
    const fy = H - Math.max(H * 0.1, ts.cap * 5), py = ph * 0.86, px = W * 0.47;
    rect(c, 'Renk paneli', px, py, W - px - M * 0.6, fy - py - ts.body * 0.8, dk);
    const bg0 = c.bg; c.bg = dk;
    const pw = W - px - M * 0.6 - ts.body * 2.4, bl = [];
    const G = ts.body * 0.7;
    bl.push(tb(T(c, 'head', 'Başlık', f.title, px + ts.body * 1.2, 0, pw, mode === 'sq' ? ts.h2 : ts.h1, '#FFFFFF', { bind: 'product', maxLines: 3 }), G * 0.5));
    const ul = rect(c, 'Süs · çizgi', px + ts.body * 1.2, 0, pw * 0.5, u * 0.5, '#FFFFFF'); bl.push(grp([ul], u * 0.5, G * 0.5));
    if (f.tag) bl.push(tb(T(c, 'label', 'Üst etiket', f.tag, px + ts.body * 1.2, 0, pw, ts.label * 1.1, acc), G));
    feats.forEach((ft, i) => {
      const hs = ts.h3 * 1.1, g = gid();
      const hx = pth(c, 'Özellik zemini', R.MASKS.hexagon, px + ts.body * 1.2, 0, hs, hs, acc, { group: g });
      const ht = T(c, 'sub', 'Özellik numarası', String(i + 1), px + ts.body * 1.2, hs * 0.22, hs, hs * 0.48, dk, { on: acc, align: 'center', group: g, fontWeight: 900 });
      const tt = T(c, 'sub', 'Özellik', ft, px + ts.body * 1.2 + hs + ts.body * 0.6, (hs - ts.body * 1.2) / 2, pw - hs - ts.body * 0.6, ts.body, '#FFFFFF', { maxLines: 2, group: g });
      bl.push(grp([hx, ht, tt], Math.max(hs, tt.h), G));
    });
    // koyu panele sığmayan özellik satırını çıkar (alt bilgi şeridinin altına taşmasın)
    { const avail = fy - ts.body * 1.8 - (py + ts.body * 1.2); let tot = () => bl.reduce((a, b) => a + b.h + (b.gap || 0), 0);
      while (tot() > avail && bl.length > 3) { const b = bl.pop(); (b.ls || b.layers || []).forEach((l) => { const k = c.L.indexOf(l); if (k >= 0) c.L.splice(k, 1); }); } }
    stack(c, bl, py + ts.body * 1.2, fy - ts.body * 1.8, 'start'); c.bg = bg0;
    // sol sütun: el yazısı, açıklama, fiyat
    const lw = px - M * 1.6, bl2 = [];
    if (f.script) bl2.push(tb(T(c, 'script', 'El yazısı', f.script, M, 0, lw, ts.h2, mixHex(dk, P.a, 0.2), { maxLines: 1 }), ts.body * 0.6));
    if (f.sub) bl2.push(tb(T(c, 'body', 'Alt başlık', f.sub, M, 0, lw, ts.body * 0.92, dk, { bind: 'desc', maxLines: 5 }), ts.body * 0.6));
    if (f.price) { const p = price(c, f.price, M, 0, ts.h1, dk); bl2.push(grp(p.ls, p.h, ts.body * 0.6)); }
    if (f.old) bl2.push(tb(oldPrice(c, f.old, M, 0, ts.body, '#2A2A2A')));
    stack(c, bl2, ph + ts.body * 0.4, fy - ts.body * 0.8, 'center');
    // alt bilgi: 3 hücre
    const cw3 = W / 3, cells = [['Sipariş', '0 (555) 000 00 00'], ['Adres', 'Mahalle, Şehir'], ['Web', 'www.markaniz.com']];
    cells.forEach(([a, b], i) => {
      const fill = i === 1 ? acc : dk, inkc = on(fill, '#FFFFFF', '#14110E');
      rect(c, 'Süs · alt bilgi zemini', i * cw3, fy, cw3, H - fy, fill);
      const ix = i * cw3 + (i === 0 ? c.M * 0.9 : i === 2 ? ts.body * 0.4 : ts.body * 0.4), iw = cw3 - c.M * 0.9 - ts.body * 0.4;
      T(c, 'label', 'Alt bilgi başlığı', a, ix, fy + (H - fy) * 0.42 - ts.cap * 1.35, iw, ts.cap * 0.95, inkc, { on: fill, align: 'center', opacity: 0.8 });
      T(c, 'sub', 'İletişim', b, ix, fy + (H - fy) * 0.42 + ts.cap * 0.05, iw, ts.cap * 1.0, inkc, { on: fill, align: 'center', maxLines: 1, fontWeight: 700 });
    });
  }

  const ARCH = { hero, split, scene, plate, menu, offer, pack, frame, retro, doodle, poster, curve, band };
  // ================================================================ BAĞIŞ · KAMPANYA (kullanıcının kendi tasarımlarından birebir)
  let Food_loadCharity = null;
  const SMP = {"asure-ikram":[800,700],"asure-kase":[380,360],"asure-masa":[470,880],"hafta-medine":[1131,730],"iftar-koy":[320,250],"iftar-sofra1":[284,290],"iftar-sofra2":[284,290],"iftar-sofra3":[290,290],"ihtida-talebeler":[1131,440],"ilim-yuvasi":[377,1100],"kumanya-gonullu":[740,790],"kurban-adak":[1080,1040],"kurban-akika":[1080,1070],"kurban-dua":[840,980],"kurban-grup":[1200,569],"kurban-kalabalik":[1080,348],"kurban-kecili-kiz":[1000,799],"kurban-nafile":[1060,1080],"kurban-pencere":[550,680],"kurban-sifa":[1080,920],"kurban-telefon":[820,1000],"kurban-uc-cocuk":[820,740],"paylas-doga":[458,900],"paylas-erzak":[810,580],"ramazan-cocuk":[553,967],"ramazan-gonullu":[575,572],"ramazan-gulen":[568,965],"ramazan-kucuk":[526,978],"ranza-cocuklar":[880,730],"ranza-yatak":[608,450],"sukur-koc":[940,620],"talebe-namaz":[840,880],"talebe-sinif":[840,530]};
  const TH_ = () => window.FoodTheme;
  const IMG = (c, name, src, x, y, w, h, o = {}) => c.add(Object.assign({ type: 'image', name, src, nw: Math.max(1, Math.round(o.nw || w)), nh: Math.max(1, Math.round(o.nh || h)), fit: 'fill', x: r1(x), y: r1(y), w: r1(w), h: r1(h), filters: {} }, o));
  // tasarımlarda kullanılan Google yazı tipleri; yoksa (internetsiz) gömülü en yakın yazı tipine düşer
  const CF = { 'DM Serif Display': [400], Montserrat: [400, 500, 600, 700, 800, 900], Caveat: [600, 700], 'Kaushan Script': [400], 'Alex Brush': [400], Oswald: [500, 700], Cinzel: [700], 'Crimson Pro': [400, 600], 'Playfair Display': [400, 700], 'Archivo Black': [400], Raleway: [800] };
  const FB = { 'DM Serif Display': ['Lora', 700], Montserrat: ['Inter', 0], Caveat: ['TeX Gyre Chorus', 500], 'Kaushan Script': ['TeX Gyre Chorus', 500], 'Alex Brush': ['TeX Gyre Chorus', 500], Oswald: ['TeX Gyre Heros Cn', 700], Cinzel: ['GFS Baskerville', 400], 'Crimson Pro': ['Lora', 0], 'Playfair Display': ['Lora', 0], 'Archivo Black': ['Inter', 900], Raleway: ['Inter', 0] };
  const fontOk = (fam, w, it) => { const db = R.FONT_DB[fam]; if (!db || !db.faces || !db.faces.length) return false; try { return document.fonts.check(`${it ? 'italic ' : ''}${w} 40px "${fam}"`); } catch (e) { return false; } };
  function FF(fam, w, it) {
    if (!FB[fam]) return [fam, w];
    if (fam === 'DM Serif Display' || fam === 'Kaushan Script' || fam === 'Alex Brush' || fam === 'Ms Madi' || fam === 'Archivo Black') w = 400;
    if (fontOk(fam, w, it)) return [fam, w];
    const [f2, w2] = FB[fam]; return [f2, w2 || w];
  }
  let cfP = null;
  Food_loadCharity = function () {
    if (cfP) return cfP;
    cfP = (async () => {
      const Fo = window.Fonts; if (!Fo || !Fo.ensureFamily) return false;
      const jobs = Object.entries(CF).map(async ([fam, ws]) => { try { await Fo.ensureFamily(fam); await Promise.all(ws.map((w) => R.ensureFont(fam, w, false))); if (fam === 'Raleway' || fam === 'Crimson Pro' || fam === 'Montserrat') await R.ensureFont(fam, fam === 'Raleway' ? 800 : 400, true); } catch (e) {} });
      await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 7000))]);
      document.dispatchEvent(new CustomEvent('ts-charity-fonts'));
      Promise.all(jobs).then(() => document.dispatchEvent(new CustomEvent('ts-charity-fonts')));
      return true;
    })();
    return cfP;
  };
  // serbest yazı (okunurluk ayarı yapmaz; tasarımın kendi renkleri)
  function TX(c, name, text, x, y, w, size, fill, o = {}) {
    const ml = o.maxLines; delete o.maxLines;
    const [fam, fw] = FF(o.fontFamily || 'Montserrat', o.fontWeight || 400, o.italic); o.fontFamily = fam; o.fontWeight = fw;
    // tasarım koçunun kurallarını baştan uygula: en küçük yazı boyutu, küçük büyük harfte harf aralığı
    if (!/^Süs/.test(name)) { const mn = Math.min(c.W, c.H); size = Math.max(size, mn * 0.0225); if (o.uppercase && size < mn * 0.05 && (o.letterSpacing || 0) < size * 0.03) o.letterSpacing = r1(size * 0.08); }
    const l = c.add(Object.assign({ type: 'text', name, text, x: r1(x), y: r1(y), w: r1(w), h: size * 1.2, fontSize: r1(size), fill, fontFamily: 'Montserrat', fontWeight: 400, lineHeight: 1.18, align: 'left', letterSpacing: 0, uppercase: false, italic: false }, o));
    R.layoutText(l); if (o.fit !== false) fitWords(l, ml || 0);
    return l;
  }
  // fotoğraf yeri: yüklenen ürün / örnek fotoğraf / temsili çizim
  function slot(c, f, x, y, w, h, o = {}) {
    const pr = c.prod, key = o.photo || f.photo;
    const base = { type: 'image', name: 'Ürün fotoğrafı', role: 'photo', x: r1(x), y: r1(y), w: r1(w), h: r1(h), filters: o.filters || {} };
    if (o.mask) base.mask = o.mask; if (o.alphaMask) base.alphaMask = o.alphaMask; if (o.name) base.name = o.name; if (o.radius) base.radius = o.radius; if (o.shadow) base.shadow = o.shadow; if (o.opacity != null) base.opacity = o.opacity;
    if (pr && pr.src) return c.add(Object.assign(base, { src: pr.src, nw: pr.nw || 800, nh: pr.nh || 800, fit: pr.cut === false ? 'cover' : (o.fit === 'cover' && !o.cutCover ? 'contain' : o.fit || 'contain') }));
    if (key && SMP[key]) return c.add(Object.assign(base, { src: 'samples/bagis/' + key + '.webp', nw: SMP[key][0], nh: SMP[key][1], fit: o.fit || 'contain' }));
    const TH = TH_(), src = TH && TH.CART[f.art] ? TH.cart(f.art) : ART.url(f.art || 'coffee');
    return c.add(Object.assign(base, { src, nw: 800, nh: 800, fit: 'contain' }));
  }
  // altın mühür: kıvrık yazı + simge
  function seal(c, cx, cy, d, text, fill, ink, ik, o = {}) {
    const g = gid(), TH = TH_();
    ell(c, 'Mühür', cx - d / 2, cy - d / 2, d, d, fill, Object.assign({ group: g, shadow: { x: 0, y: r1(d * 0.02), blur: r1(d * 0.06), color: 'rgba(0,0,0,0.18)' } }, o.ring ? { stroke: o.ring, strokeWidth: r1(d * 0.03) } : {}));
    ell(c, 'Süs · mühür halkası', cx - d * 0.33, cy - d * 0.33, d * 0.66, d * 0.66, 'rgba(0,0,0,0)', { stroke: ink, strokeWidth: r1(d * 0.012), group: g });
    if (TH && ik) IMG(c, 'Süs · mühür simgesi', TH.icon(ik, ink), cx - d * 0.25, cy - d * 0.25, d * 0.5, d * 0.5, { fit: 'contain', group: g, nw: 400, nh: 400 });
    const sf = FF('Montserrat', 700), fs = d * 0.082, t = c.add({ type: 'text', name: 'Süs · mühür yazısı', text, x: 0, y: 0, w: d, h: fs, fontSize: r1(fs), fontFamily: sf[0], fontWeight: sf[1], fill: ink, align: 'center', letterSpacing: r1(fs * 0.02), group: g, lineHeight: 1 });
    const r = d * 0.385; let tw = R.measure(text, t) || d;
    const maxW = r * Math.PI * 1.88; if (tw > maxW) { const k = maxW / tw; t.fontSize = r1(fs * k); t.letterSpacing = r1(t.letterSpacing * k); tw = R.measure(text, t); }
    const th = Math.min(Math.PI * 1.9, tw / r);
    t.curve = r1((th / (Math.PI * 1.9)) * 100); R.layoutText(t);
    t.x = r1(cx - d / 2); t.y = r1(cy - r - t.fontSize * 0.95);
    return g;
  }
  const zig = (c, x, y, w, col, sw) => pth(c, 'Süs · zikzak', 'M0 70L12.5 20L25 70L37.5 20L50 70L62.5 20L75 70L87.5 20L100 70', x, y, w, w * 0.16, 'rgba(0,0,0,0)', { stroke: col, strokeWidth: r1(sw), vw: 100, vh: 100 });
  const pill = (c, name, x, y, w, h, fill, o = {}) => rect(c, name, x, y, w, h, fill, Object.assign({ radius: r1(h / 2) }, o));
  const ARROW = 'M8 92C2 60 30 40 50 46C66 50 60 70 46 66C30 62 40 24 88 10M88 10L74 10M88 10L84 24';
  // yatay ölçü için ortak düzen: fotoğraf sağda, yazılar solda
  function cWide(c, f, look) {
    const { W, H, u, M, ts } = c, bgc = look.bg;
    c.bg = bgc;
    if (look.bgImg) IMG(c, 'Süs · zemin', look.bgImg(Math.round(W), Math.round(H)), 0, 0, W, H);
    const s = Math.min(H * 0.92, W * 0.42);
    slot(c, f, W - M - s, (H - s) / 2, s, s, { fit: 'contain' });
    const cw = W - s - M * 2.6, bl = [];
    if (f.tag) bl.push(tb(TX(c, 'Üst etiket', f.tag, M, 0, cw, ts.label, look.acc, { fontWeight: 700, uppercase: true, letterSpacing: r1(ts.label * 0.12) }), ts.body * 0.4));
    bl.push(tb(TX(c, 'Başlık', f.title, M, 0, cw, H * 0.13, look.ink, { fontFamily: 'DM Serif Display', maxLines: 2, lineHeight: 1.05, bind: 'product' }), ts.body * 0.5));
    if (f.title2) bl.push(tb(TX(c, 'Başlık 2', f.title2, M, 0, cw, H * 0.1, look.acc, { fontFamily: 'DM Serif Display', maxLines: 1 }), ts.body * 0.5));
    if (f.sub) bl.push(tb(TX(c, 'Alt başlık', f.sub, M, 0, cw * 0.95, H * 0.042, look.ink, { maxLines: 2, opacity: 0.9, bind: 'desc' }), ts.body * 0.6));
    if (f.price) bl.push(tb(TX(c, 'Fiyat', (f.priceLabel ? f.priceLabel + ': ' : '') + f.price, M, 0, cw, H * 0.065, look.acc, { fontFamily: 'DM Serif Display', maxLines: 1 })));
    stack(c, bl, M, H - M);
  }

  // R1) RAMAZAN GECESİ: yıldız ışıkları, hilal, mühür
  function cRamazan(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const base = P.d, lite = mixHex(P.c, '#FFFFFF', 0.12), gold = '#A99B5C';
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: base, ink: '#FFFFFF', acc: '#E8D9A0', bgImg: (w, h) => TH.night(w, h, base, lite) });
    c.bg = base;
    IMG(c, 'Süs · gece', TH.night(Math.round(W), Math.round(H), base, lite), 0, 0, W, H);
    IMG(c, 'Süs · desen', TH.girih(Math.round(W), Math.round(H * 0.42), '#FFFFFF'), 0, H * 0.58, W, H * 0.42, { opacity: 0.1 });
    IMG(c, 'Süs · yıldız ışıkları', TH.garland(Math.round(W), Math.round(W * 0.2)), 0, 0, W, W * 0.2);
    const st = mode === 'story', por = mode === 'por';
    const t = TX(c, 'Başlık', f.title, M, st ? H * 0.12 : W * 0.075, W - 2 * M, W * (st ? 0.1 : 0.088), '#FFFFFF', { fontFamily: 'DM Serif Display', align: 'center', lineHeight: 1.12, maxLines: 3, letterSpacing: r1(-W * 0.001), bind: 'product' });
    const py = t.y + t.h + W * (st ? 0.1 : 0.06);
    zig(c, st ? W * 0.45 : W * 0.077, py, W * 0.1, '#FFFFFF', u * 0.35);
    const pw = W * 0.255;
    let subEnd = py;
    if (st) { const sb = TX(c, 'Alt başlık', f.sub, W * 0.12, py + W * 0.04, W * 0.76, W * 0.034, '#FFFFFF', { align: 'center', lineHeight: 1.32, maxLines: 4, bind: 'desc' }); subEnd = sb.y + sb.h; }
    else TX(c, 'Alt başlık', f.sub, W * 0.077, py + W * 0.04, pw, Math.max(u * 2.7, W * 0.022), '#FFFFFF', { lineHeight: 1.32, maxLines: 7, bind: 'desc' });
    if (!st) seal(c, W - W * 0.077 - W * 0.073, py + W * 0.08, W * 0.15, f.seal || 'Yakın gönüllerin uzak sofrası • Yakın gönüllerin uzak sofrası •', gold, '#FFFFFF', 'hilal');
    // hilal + figür
    const cw = W * (st ? 0.86 : 0.6), cy0 = H * (st ? 0.66 : por ? 0.64 : 0.62);
    IMG(c, 'Süs · hilal', TH.crescent('#EEF0FA'), (W - cw) / 2, cy0 - cw * 0.5, cw, cw, { nw: 800, nh: 800, fit: 'contain' });
    const pBot = cy0 + cw * 0.38, pTop = (st ? subEnd : t.y + t.h) + W * 0.025, ph = pBot - pTop, pwid = Math.min(W * (st ? 0.62 : 0.5), ph * 0.75);
    if (st) seal(c, W * 0.86, H - W * 0.2, W * 0.17, f.seal || 'Yakın gönüllerin uzak sofrası • Yakın gönüllerin uzak sofrası •', gold, '#FFFFFF', 'hilal');
    slot(c, f, (W - pwid) / 2, pTop, pwid, ph, { fit: 'contain' });
    if (f.price) {
      const pf = Math.max(u * 3, W * 0.03), pt = TX(c, 'Fiyat', f.price, 0, 0, W * 0.4, pf * 1.4, '#FFFFFF', { fontFamily: 'DM Serif Display', maxLines: 1 });
      const lb = TX(c, 'Fiyat etiketi', f.priceLabel || 'Kumanya bedeli', 0, 0, W * 0.4, pf * 0.8, '#FFFFFF', { opacity: 0.85, maxLines: 1 });
      lb.x = pt.x = r1(W * 0.077); lb.y = r1(H - M - pt.h - lb.h); pt.y = r1(lb.y + lb.h);
    }
  }

  // R2) KURBAN DİKEY: etiket kutusu + iri başlık + el yazısı, fırça kalp, alt rozet şeridi
  function cKalp(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const dark = lum(P.bg) < 0.45, navy = '#13137A', light = dark ? '#FFFFFF' : navy;
    const boxFill = dark ? '#FFFFFF' : '#4FA8E6', boxInk = dark ? navy : '#FFFFFF';
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: light, acc: dark ? '#FFFFFF' : '#2E86C9', bgImg: (w, h) => TH.mist(w, h, P.bg) });
    c.bg = P.bg;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), P.bg), 0, 0, W, H);
    const st = mode === 'story', sq = H / W < 1.15;
    const bx = W * 0.08, bw = W * 0.84, by = H * (st ? 0.09 : sq ? 0.045 : 0.06), bh = W * (st ? 0.145 : sq ? 0.1 : 0.12);
    rect(c, 'Kutu zemini', bx, by, bw, bh, boxFill, { radius: r1(bh * 0.28) });
    const lt = TX(c, 'Üst etiket', f.tag, bx + bw * 0.04, by, bw * 0.92, bh * 0.56, boxInk, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1 });
    lt.y = r1(by + (bh - lt.h) / 2);
    const big = TX(c, 'Başlık', f.title, M, by + bh + W * 0.005, W - 2 * M, W * (st ? 0.135 : sq ? 0.095 : 0.11), light, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1, lineHeight: 1, bind: 'product' });
    const sc = TX(c, 'El yazısı', f.script || '', W * 0.5, big.y + big.h * 0.78, W * 0.44, W * (st ? 0.095 : 0.075), light, { fontFamily: 'Caveat', fontWeight: 700, align: 'center', rotation: -5, maxLines: 1, fx: { outline: { width: r1(W * 0.0008), color: light } } });
    const top = sc.y + sc.h + W * 0.02;
    const fy = H - W * (st ? 0.3 : sq ? 0.22 : 0.25);
    const tby = fy - W * (st ? 0.34 : sq ? 0.14 : 0.17);
    const hs = Math.min(W * 0.96, (tby - top) * 1.08);
    if (c.prod || !f.photo) IMG(c, 'Süs · kalp', TH.brushHeart('#5BC8EA'), (W - hs) / 2, top + hs * 0.1, hs, hs, { nw: 800, nh: 800, fit: 'contain' });
    slot(c, f, (W - hs * 0.86) / 2, top, hs * 0.86, (tby - top) * 1.02, { fit: 'contain' });
    const pf = W * (st ? 0.044 : 0.032);
    const p1 = TX(c, 'Alt başlık', f.sub, W * 0.1, tby + W * 0.03, W * 0.8, pf, light, { align: 'center', fontWeight: 800, maxLines: 1, bind: 'desc' });
    if (f.sub2) TX(c, 'Açıklama', f.sub2, W * 0.12, p1.y + p1.h, W * 0.76, pf, light, { align: 'center', maxLines: st ? 4 : 2, lineHeight: 1.2 });
    // alt şerit
    const barY = H - W * (st ? 0.18 : 0.14), barFill = dark ? '#FFFFFF' : '#4FA8E6', barInk = dark ? navy : '#FFFFFF';
    pth(c, 'Alt bilgi zemini', 'M0 18C0 6 8 0 18 0H82C92 0 100 6 100 18V100H0Z', 0, barY, W, H - barY, barFill);
    const feats = f.feats || ['Kurbanlarınız itina ile kesilir', 'Kurban Cenab-ı Hakk’a yaklaşmaya bir vesiledir •', 'Videosu anında iletilir'];
    const d1 = W * (st ? 0.16 : 0.12);
    [[0.15, 'koyun', feats[0]], [0.85, 'video', feats[2]]].forEach(([fx, ik, tx]) => {
      const cx = W * fx, g = gid();
      // rozet şeridin üst kenarına oturur, yazı rozetin altında kalır (üst üste binmez, alttan taşmaz)
      const ry = barY - d1 * 0.5;
      pth(c, 'Süs · rozet', BURST, cx - d1 / 2, ry, d1, d1, '#4FA8E6', { group: g });
      ell(c, 'Süs · rozet içi', cx - d1 * 0.4, ry + d1 * 0.1, d1 * 0.8, d1 * 0.8, '#FFFFFF', { group: g });
      IMG(c, 'Süs · rozet simgesi', TH.icon(ik, navy), cx - d1 * 0.3, ry + d1 * 0.2, d1 * 0.6, d1 * 0.6, { fit: 'contain', group: g, nw: 300, nh: 300 });
      TX(c, 'Alt bilgi', tx, cx - W * 0.14, ry + d1 + W * 0.004, W * 0.28, W * (st ? 0.034 : 0.026), barInk, { align: 'center', maxLines: 2, lineHeight: 1.1, fontWeight: 600 });
    });
    seal(c, W / 2, Math.min(barY + (H - barY) * 0.12, H - W * (st ? 0.135 : 0.108)), W * (st ? 0.24 : 0.19), feats[1] || 'Kurban Cenab-ı Hakk’a yaklaşmaya bir vesiledir •', '#FFFFFF', '#3FA9DD', 'koyun', { ring: '#3FA9DD' });
  }

  // R3) KURBAN KARE (nane): iki renkli serif başlık, paragraf, mühür, hisse bedeli etiketi, fotoğraf, ülke şeridi
  function cNane(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const g1 = P.d, gold = P.a;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: g1, acc: gold, bgImg: (w, h) => TH.mist(w, h, P.bg) });
    c.bg = P.bg;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), P.bg, 6), 0, 0, W, H);
    const st = mode === 'story';
    const hs = W * (st ? 0.1 : 0.085);
    const t1 = TX(c, 'Başlık', f.title, M * 0.6, H * (st ? 0.08 : 0.075), W - 1.2 * M, hs, g1, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 2, lineHeight: 1.02, letterSpacing: r1(-hs * 0.02), bind: 'product' });
    const t2 = TX(c, 'Başlık 2', f.title2 || '', M * 0.6, t1.y + t1.h, W - 1.2 * M, hs, gold, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 2, lineHeight: 1.02, letterSpacing: r1(-hs * 0.02) });
    const py = t2.y + t2.h + W * 0.07;
    const pf = Math.max(u * 2.7, W * 0.024);
    const p1 = TX(c, 'Alt başlık', f.sub, W * 0.08, py, W * 0.44, pf, g1, { maxLines: 3, lineHeight: 1.3, bind: 'desc' });
    const p2 = f.sub2 ? TX(c, 'Açıklama', f.sub2, W * 0.08, p1.y + p1.h + pf * 0.8, W * 0.44, pf, g1, { maxLines: 4, lineHeight: 1.3, fontWeight: 600 }) : p1;
    const sd = W * 0.15;
    seal(c, W * 0.835, py + sd * 0.4, sd, f.seal || 'Kurbanın MANA’sı paylaşmaktır! • PAYLAŞ! •', gold, '#FFFFFF', 'koyun');
    // fotoğraf (alttan şeride kadar)
    const fy = H - W * 0.06, phTop = Math.max(p2.y + p2.h + W * 0.015, py + sd);
    slot(c, f, W * 0.04, phTop, W * 0.92, fy - phTop - W * 0.005, { fit: 'contain' });
    // hisse bedeli etiketi
    if (f.price) {
      const g = gid(), sx = W * 0.71, sy = py + sd * 1.0 + W * 0.02, sw = W * 0.27, sh = W * 0.13;
      pth(c, 'Fiyat zemini', BLOB, sx, sy, sw, sh, '#FFFFFF', { group: g, rotation: -4, opacity: 0.95 });
      const a = TX(c, 'Fiyat etiketi', f.priceLabel || 'Hisse Bedeli', sx, sy + sh * 0.14, sw, W * 0.036, gold, { fontFamily: 'DM Serif Display', align: 'center', group: g, rotation: -4, maxLines: 1 });
      TX(c, 'Fiyat', f.price, sx, a.y + a.h * 0.92, sw, W * 0.04, gold, { fontFamily: 'DM Serif Display', align: 'center', group: g, rotation: -4, maxLines: 1 });
    }
    // ülke şeridi
    rect(c, 'Alt bilgi zemini', W * 0.012, fy, W * 0.976, H - fy - W * 0.012, '#FFFFFF', { radius: r1(W * 0.012) });
    { const ft = TX(c, 'Süs · ülke listesi', f.foot || 'Haiti - Dominik - Guatemala - Honduras - El Salvador - Meksika - Panama - Brezilya - Venezuela - Şili - Arjantin', W * 0.02, fy, W * 0.96, W * 0.019, gold, { align: 'center', fontWeight: 500, fit: false }); fitW(ft, W * 0.96, W * 0.024); ft.x = r1(W * 0.02); ft.y = r1(fy + (H - fy - ft.h) / 2); }
  }

  // R4) KURBAN TÜRÜ: tam fotoğraf, parlayan etiket, alıntı
  function cTur(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    c.bg = '#EDEDED';
    const inset = W * 0.012, rr = W * 0.02;
    const card = rect(c, 'Süs · kart', inset, inset, W - 2 * inset, H - 2 * inset, P.d, { radius: r1(rr) });
    void card;
    slot(c, f, inset, inset, W - 2 * inset, H - 2 * inset, { fit: 'cover', cutCover: true, radius: r1(rr) });
    rect(c, 'Süs · karartma', inset, inset, W - 2 * inset, (H - 2 * inset) * 0.6, { type: 'linear', angle: 90, colors: ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)'] }, { radius: r1(rr) });
    const wide = mode === 'wide' || mode === 'land';
    const lw = wide ? W * 0.5 : W * 0.8, lh = W * (wide ? 0.06 : 0.1), lx = wide ? M : (W - lw) / 2, ly = wide ? M : H * (mode === 'story' ? 0.1 : 0.08);
    const glow = P.b;
    rect(c, 'Etiket zemini', lx, ly, lw, lh, glow, { radius: r1(lh * 0.32), fx: { glow: { color: glow, blur: r1(lh * 0.35), opacity: 0.8 } } });
    const lt = TX(c, 'Başlık', f.title, lx, ly, lw, lh * 0.58, '#FFFFFF', { fontFamily: 'Montserrat', fontWeight: 800, align: 'center', uppercase: true, maxLines: 1, bind: 'product', shadow: { x: 0, y: r1(u * 0.2), blur: r1(u * 0.6), color: 'rgba(0,0,0,0.3)' } });
    lt.y = r1(ly + (lh - lt.h) / 2);
    TX(c, 'Alt başlık', f.sub, lx + lw * 0.0, ly + lh + (wide ? H * 0.06 : W * 0.05), wide ? W * 0.5 : lw, wide ? H * 0.04 : W * (mode === 'story' ? 0.046 : 0.042), '#FFFFFF', { fontFamily: 'Montserrat', fontWeight: 600, lineHeight: 1.28, maxLines: wide ? 6 : 7, bind: 'desc', shadow: { x: 0, y: r1(u * 0.3), blur: r1(u * 1.2), color: 'rgba(0,0,0,0.55)' } });
  }

  // R5) KUMANYA YARDIMI: fotoğraf + beyaz suluboya geçiş, fırça başlıklar, fırça fiyat, el yazısı
  function cKumanya(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    if (c.mode === 'wide' || c.mode === 'land') { c.noTex = true; c.noGhost = true; c.artOverlapOk = true; return cWide(c, f, { bg: '#FFFFFF', ink: P.a, acc: P.a }); }
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    c.bg = '#FFFFFF';
    const blue = P.a, cyan = P.b;
    const wide = mode === 'wide' || mode === 'land';
    slot(c, f, 0, 0, wide ? W * 0.62 : W, wide ? H : H * 0.82, { fit: 'cover', cutCover: true });
    IMG(c, 'Süs · beyaz geçiş', TH.enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="b"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="3"/><feDisplacementMap in="SourceGraphic" scale="14"/><feGaussianBlur stdDeviation="2.2"/></filter></defs><path d="M100 30C80 32 72 46 74 58C60 60 48 72 50 84C30 86 14 92 0 100H100Z" fill="#fff" filter="url(#b)"/></svg>`), 0, 0, W, H, { nw: 400, nh: 400 });
    // fırça başlıklar
    const lines2 = lines(f.title, words(f.title).length > 1 ? 1 : 1).slice(0, 2);
    let y = H * 0.08;
    lines2.forEach((ln, i) => {
      const fs = W * 0.07, t = TX(c, 'Başlık', ln, W * 0.06, y, W * 0.6, fs, '#FFFFFF', { fontWeight: 800, uppercase: true, maxLines: 1, bind: i ? undefined : 'product' });
      const tw = R.measure(ln.toLocaleUpperCase('tr-TR'), t);
      const b = IMG(c, 'Süs · fırça', TH.texture('brush', 600, 200, blue, null, 3 + i), -W * 0.02, y - fs * 0.32, tw + W * 0.14, fs * 1.75, { nw: 600, nh: 200 });
      c.L.splice(c.L.indexOf(b), 1); c.L.splice(c.L.indexOf(t), 0, b);
      y += fs * 1.35;
    });
    // fiyat
    const rx = W * 0.55, rw = W * 0.4;
    const k1 = TX(c, 'Fiyat etiketi', f.priceLabel || 'Kumanya\nBedeli', rx, H * 0.52, rw, W * 0.05, blue, { fontWeight: 800, align: 'right', lineHeight: 1.1, maxLines: 2 });
    if (f.price) {
      const by = k1.y + k1.h + W * 0.015, bh = W * 0.11;
      IMG(c, 'Süs · fırça', TH.texture('brush', 600, 200, blue, null, 6), W * 0.66, by, W * 0.36, bh, { nw: 600, nh: 200 });
      TX(c, 'Fiyat', f.price, W * 0.66, by + bh * 0.2, W * 0.3, W * 0.06, cyan, { fontWeight: 800, align: 'right', maxLines: 1 });
    }
    // el yazısı
    const s1 = TX(c, 'El yazısı', f.script || 'Yardımlarınız', W * 0.3, H * 0.76, W * 0.64, W * 0.09, blue, { fontFamily: 'Alex Brush', align: 'right', maxLines: 1, fx: { outline: { width: r1(W * 0.0015), color: blue } } });
    const hw = f.hl || 'Umut', parts = String(f.script2 || 'Birer Umut Olsun').split(hw);
    const fs2 = W * 0.08, y2 = s1.y + s1.h * 0.95;
    const probe = { type: 'text', fontFamily: 'Alex Brush', fontSize: fs2, letterSpacing: 0 };
    const w0 = R.measure(parts[0] || '', probe), w1 = R.measure(hw, probe) + fs2 * 0.5, w2 = R.measure(parts[1] || '', probe);
    let x = W * 0.94 - (w0 + w1 + w2);
    if (parts[0]) { TX(c, 'El yazısı 2', parts[0], x, y2, w0 + 4, fs2, blue, { fontFamily: 'Alex Brush', maxLines: 1, fit: false }); x += w0; }
    IMG(c, 'Süs · fırça', TH.texture('brush', 600, 200, blue, null, 9), x - fs2 * 0.1, y2 + fs2 * 0.05, w1 + fs2 * 0.2, fs2 * 1.15, { nw: 600, nh: 200 });
    TX(c, 'Vurgu', hw, x, y2, w1, fs2, cyan, { fontFamily: 'Alex Brush', align: 'center', maxLines: 1, fit: false }); x += w1;
    if (parts[1]) TX(c, 'El yazısı 3', parts[1], x, y2, w2 + 4, fs2, blue, { fontFamily: 'Alex Brush', maxLines: 1, fit: false });
  }

  // R6) PAYLAŞTIKÇA: bulanık fotoğraf, üst üste fırça etiketler, ürün grubu
  function cPaylas(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    if (c.mode === 'wide' || c.mode === 'land') { c.noTex = true; c.noGhost = true; c.artOverlapOk = true; return cWide(c, f, { bg: '#FFFFFF', ink: P.a, acc: P.a }); }
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true; c.bg = '#FFFFFF';
    const blue = P.a;
    slot(c, f, 0, 0, W * 0.72, H * 0.78, { fit: 'cover', photo: 'paylas-doga', filters: { blur: r1(u * 0.5) }, cutCover: true });
    IMG(c, 'Süs · beyaz geçiş', TH.enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="b"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="4" seed="7"/><feDisplacementMap in="SourceGraphic" scale="12"/><feGaussianBlur stdDeviation="2"/></filter></defs><path d="M62 0H100V100H0V74C20 72 34 66 44 58C58 50 56 28 62 0Z" fill="#fff" filter="url(#b)"/></svg>`), 0, 0, W, H, { nw: 400, nh: 400 });
    const rows = [[f.title || 'Mutluluk', 'b'], [f.script || 'Paylaştıkça', 's'], [f.script2 || 'Çoğalır', 's']];
    let y = H * 0.09; const bx = W * 0.44, bw = W * 0.6, bh = W * 0.15;
    rows.forEach(([tx, k], i) => {
      IMG(c, 'Süs · fırça', TH.texture('brush', 600, 200, blue, null, 11 + i), bx, y, bw, bh, { nw: 600, nh: 200 });
      TX(c, i ? 'El yazısı' : 'Başlık', tx, bx + bw * 0.1, y + bh * (k === 'b' ? 0.26 : 0.18), bw * 0.82, k === 'b' ? W * 0.06 : W * 0.07, '#FFFFFF', k === 'b' ? { fontWeight: 800, uppercase: true, align: 'center', maxLines: 1, bind: 'product' } : { fontFamily: 'Kaushan Script', align: 'center', maxLines: 1, fx: { outline: { width: r1(W * 0.0015), color: '#FFFFFF' } } });
      y += bh * 1.12;
    });
    const s = W * 0.86;
    slot(c, f, W - s - W * 0.02, H - s * 0.78, s, s * 0.72, { fit: 'contain', photo: 'paylas-erzak' });
  }

  // R7) RANZA PROJESİ: sıcak duvar, iki yanda fiyat sütunu, alt simge satırı, teşekkür yazısı
  function cRanza(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const green = P.a, dk = P.d;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: dk, acc: green });
    c.bg = P.bg;
    rect(c, 'Süs · duvar', 0, 0, W, H, { type: 'linear', angle: 120, colors: [mixHex(P.bg, '#FFFFFF', 0.25), P.bg, mixHex(P.bg, '#000', 0.06)] });
    pth(c, 'Süs · ışık', 'M55 0H75L100 30V60Z', 0, 0, W, H * 0.7, 'rgba(255,255,255,0.18)');
    const st = mode === 'story';
    const a = TX(c, 'Üst etiket', f.tag, M, H * 0.035, W - 2 * M, W * 0.045, dk, { fontWeight: 800, uppercase: true, align: 'center', maxLines: 1 });
    const b = TX(c, 'Başlık', f.title, M, a.y + a.h * 0.95, W - 2 * M, W * 0.095, green, { fontWeight: 900, uppercase: true, align: 'center', maxLines: 1, letterSpacing: r1(W * 0.002), bind: 'product' });
    const p = TX(c, 'Alt başlık', f.sub, W * 0.18, b.y + b.h + W * 0.008, W * 0.64, W * 0.029, dk, { align: 'center', maxLines: 3, lineHeight: 1.25, fontWeight: 600, bind: 'desc' });
    const ctaW = W * 0.43, ctaH = W * 0.06, ctaY = p.y + p.h + W * 0.02;
    const g = gid();
    pill(c, 'Buton zemini', (W - ctaW) / 2, ctaY, ctaW, ctaH, green, { group: g });
    IMG(c, 'Süs · kalp simgesi', TH.icon('kalp', '#FFFFFF'), (W - ctaW) / 2 + ctaH * 0.3, ctaY + ctaH * 0.18, ctaH * 0.64, ctaH * 0.64, { group: g, fit: 'contain', nw: 200, nh: 200 });
    TX(c, 'Buton yazısı', f.cta || 'Bu iyiliğe ortak olur musunuz?', (W - ctaW) / 2 + ctaH, ctaY + ctaH * 0.2, ctaW - ctaH * 1.2, W * 0.026, '#FFFFFF', { fontWeight: 600, align: 'center', group: g, maxLines: 1, bind: 'cta' });
    const iy = H - W * 0.235;
    const top = ctaY + ctaH + W * 0.01, ph = iy - top;
    slot(c, f, W * 0.15, top, W * 0.7, ph, { fit: 'contain' });
    const items = f.items || [['1 Ranza bedeli', '12.500 TL', 'Desteğinizle bir öğrencinin hayatına dokunun.'], ['1 Hisse bedeli', '2.500 TL', 'Küçük bir katkı, büyük bir değişim sağlar.']];
    [[0.135, items[0]], [0.865, items[1]]].forEach(([fx, it]) => {
      if (!it) return;
      const cx = W * fx, cy = top + ph * 0.16, d = W * 0.085, g2 = gid();
      ell(c, 'Süs · simge zemini', cx - d / 2, cy - d / 2, d, d, green, { group: g2 });
      IMG(c, 'Süs · simge', TH.icon('ev', '#FFFFFF'), cx - d * 0.3, cy - d * 0.3, d * 0.6, d * 0.6, { group: g2, fit: 'contain', nw: 200, nh: 200 });
      const l1 = TX(c, 'Fiyat etiketi', it[0].replace(/ (\S+)$/, '\n$1'), cx - W * 0.105, cy + d * 0.62, W * 0.21, W * 0.033, dk, { fontWeight: 800, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05 });
      const pw = W * 0.17, py = l1.y + l1.h + W * 0.008, phh = W * 0.05;
      rect(c, 'Fiyat zemini', cx - pw / 2, py, pw, phh, green, { radius: r1(phh * 0.25) });
      TX(c, 'Fiyat', it[1], cx - pw / 2, py + phh * 0.14, pw, W * 0.03, '#FFFFFF', { fontWeight: 800, align: 'center', maxLines: 1 });
      if (it[2]) TX(c, 'Açıklama', it[2], cx - W * 0.105, py + phh + W * 0.012, W * 0.21, W * 0.022, dk, { align: 'center', maxLines: 3, lineHeight: 1.25, fontWeight: 600 });
    });
    rect(c, 'Süs · alt geçiş', 0, iy - W * 0.08, W, H - iy + W * 0.08, { type: 'linear', angle: 90, colors: ['rgba(255,255,255,0)', '#FFFFFF'] });
    const feats = (f.feats || ['Eğitime destek', 'Geleceğe yatırım', 'Birlikte güçlüyüz', 'Bir gülümsemeye ortak ol']).slice(0, 4);
    const icons = ['kitap', 'el', 'kalp', 'ev'];
    feats.forEach((ft, i) => {
      const cx = W * [0.135, 0.378, 0.622, 0.865][i], d = W * 0.055;
      IMG(c, 'Süs · simge', TH.icon(icons[i], dk), cx - d / 2, iy, d, d, { fit: 'contain', nw: 200, nh: 200 });
      TX(c, 'Özellik', ft, cx - W * 0.105, iy + d * 1.05, W * 0.21, W * 0.024, dk, { fontWeight: 800, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05 });
      if (i) rect(c, 'Süs · ayraç', cx - W * 0.1215, iy, u * 0.15, d * 1.6, dk, { opacity: 0.3 });
    });
    TX(c, 'El yazısı', f.script || 'Destekleriniz için teşekkür ederiz.', M, H - W * 0.075, W - 2 * M, W * 0.05, dk, { fontFamily: 'Kaushan Script', align: 'center', maxLines: 1, fx: { outline: { width: r1(W * 0.0012), color: dk } } });
  }

  // R8) RANZA SADE: mermer, iki satır kahverengi başlık, oklu fiyatlar
  function cOklu(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const br = P.ink, gr = P.a;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: br, acc: gr });
    c.bg = P.bg;
    IMG(c, 'Süs · mermer', TH.texture('marble', Math.round(W), Math.round(H), '#FFFFFF', null, 4), 0, 0, W, H, { opacity: 0.9 });
    rect(c, 'Süs · mermer tonu', 0, 0, W, H, 'rgba(120,120,120,0.06)');
    const a = TX(c, 'Üst etiket', f.tag, M, H * 0.07, W - 2 * M, W * 0.05, '#1A1A1A', { align: 'center', uppercase: true, maxLines: 1, letterSpacing: r1(W * 0.002) });
    const b = TX(c, 'Başlık', f.title, W * 0.25, a.y + a.h + W * 0.01, W * 0.5, W * 0.1, br, { fontFamily: 'Poppins', fontWeight: 700, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.08, bind: 'product' });
    const items = f.items || [['1 Ranza bedeli', '12.500 TL'], ['1 Hisse bedeli', '2500 TL']];
    const py = H * 0.24;
    [[0.05, 'left', items[0], ARROW, 1], [0.7, 'right', items[1], ARROW, -1]].forEach(([fx, al, it, ar, sgn], i) => {
      if (!it) return;
      const x = W * fx, w = W * 0.25;
      const l = TX(c, 'Fiyat etiketi', it[0].replace(/ (\S+)$/, '\n$1'), x, py + (i ? -W * 0.02 : W * 0.02), w, W * 0.04, br, { fontFamily: 'Poppins', fontWeight: 700, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05 });
      TX(c, 'Fiyat', it[1], x, l.y + l.h, w, W * 0.04, gr, { fontFamily: 'Poppins', fontWeight: 700, align: 'center', maxLines: 1 });
      pth(c, 'Süs · ok', ar, i ? W * 0.62 : W * 0.06, i ? py + W * 0.09 : py + W * 0.12, W * 0.16, W * 0.2, 'rgba(0,0,0,0)', { stroke: br, strokeWidth: r1(u * 0.35), rotation: i ? 0 : 180, flipX: !i });
    });
    const top = b.y + b.h + W * 0.02, bot = H - W * 0.2;
    slot(c, f, W * 0.15, top, W * 0.7, bot - top, { fit: 'contain' });
    TX(c, 'Alt başlık', f.sub, W * 0.08, bot + W * 0.02, W * 0.84, W * 0.03, br, { fontFamily: 'Poppins', fontWeight: 700, uppercase: true, align: 'center', maxLines: 3, lineHeight: 1.3, bind: 'desc' });
  }

  // R9) HAYIRLI HAFTALAR: kalın + el yazısı başlık, sisli fotoğraf, "Bu hafta" sekmesi, alıntı, logo
  function cHafta(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const g1 = P.d, ol = P.a, br = P.b;
    if (mode === 'wide' || mode === 'land') return cWide(c, Object.assign({}, f, { title: [f.title, f.script].filter(Boolean).join(' ') }), { bg: P.bg, ink: g1, acc: ol });
    c.bg = P.bg;
    // ölçüler gönderilen A4 tasarımdan (1131 × 1600) alındı; s = yazı ölçeği
    const s = Math.min(W, H / 1.4147) / 1131, X = (v) => v * W / 1131, Y = (v) => v * H / 1600;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), '#FBFAF6', 2), 0, 0, W, H);
    IMG(c, 'Süs · suluboya', TH.enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="4" seed="9"/><feDisplacementMap in="SourceGraphic" scale="22"/><feGaussianBlur stdDeviation="4"/></filter></defs><path d="M4 30C20 18 46 22 60 16C76 10 92 20 98 34V78C80 90 60 82 40 88C22 92 8 84 2 70Z" fill="#D9C79A" opacity=".55" filter="url(#b)"/></svg>`), 0, Y(330), W, Y(860), { nw: 400, nh: 400 });
    // fotoğraf (kenarları bulut gibi erir)
    const bgPh = slot(c, f, 0, Y(380), W, Y(820), { fit: 'cover', cutCover: true, opacity: 0.95, name: 'Arka plan resmi' });
    bgPh.fade = { t: 0.1, b: 0.24, l: 0.02, r: 0.02, soft: 0.07, cloud: true, seed: 5 };
    // başlık: kalın sans + imza el yazısı
    const t = TX(c, 'Başlık', f.title || 'Hayırlı', X(150), Y(92), W - X(300), 104 * s, g1, { fontFamily: 'Poppins', fontWeight: 700, align: 'center', maxLines: 1, lineHeight: 1, letterSpacing: r1(-1.5 * s), bind: 'product' });
    const sc = TX(c, 'El yazısı', f.script || 'Haftalar', X(150), 0, W - X(300), 300 * s, ol, { fontFamily: 'Ms Madi', align: 'center', maxLines: 1, lineHeight: 1, fit: false });
    fitW(sc, Math.min(W - X(240), X(660)), 330 * s); sc.x = r1((W - sc.w) / 2); sc.y = r1(t.y + t.h - sc.fontSize * (/^[ÜÖÇŞİĞÂ]/.test(f.script || '') ? -0.02 : 0.26));
    // “Bu hafta” sekmesi: kutu yazıya göre büyür, taşmaz
    // uzun sekme başlığında (ör. “Üç Aylar vesilesiyle”) kutu sola doğru genişler, yazı küçülmez
    const tagLen = (f.tag || 'Bu hafta').length, dLen = Math.max(0, ...String(f.date || '').split('\n').map((x) => x.length)), dFs = Math.max(19 * s, Math.min(W, H) * 0.0225);
    // tarih satırı (ör. “3 Cemaziyelahir 1448”) bölünmez: kutu ona göre sola genişler, yazı taşmaz
    const tx = Math.max(X(470), Math.min(X(815) - Math.max(0, tagLen - 9) * 23 * s, W - X(78) - (dLen * dFs * 0.56 + 48 * s))), tw = W - tx - X(78), g = gid();
    const hd = TX(c, 'Sekme başlığı', f.tag || 'Bu hafta', tx + X(8), Math.max(Y(424), sc.y + sc.h * 0.92), tw - X(16), 44 * s, g1, { fontFamily: 'Poppins', fontWeight: 600, align: 'center', group: g, maxLines: 1, lineHeight: 1.1 });
    const hb = rect(c, 'Sekme başlığı zemini', tx - X(6), hd.y - 8 * s, tw + X(4), hd.h + 16 * s, '#FFFFFF', { radius: r1(14 * s), group: g, shadow: { x: 0, y: r1(3 * s), blur: r1(10 * s), color: 'rgba(0,0,0,0.12)' } });
    const bodyY = hb.y + hb.h - 6 * s;
    const s1 = TX(c, 'Alt başlık', f.sub || '', tx + 20 * s, bodyY + 20 * s, tw - 34 * s, 22 * s, '#FFFFFF', { fontFamily: 'Poppins', fontWeight: 400, maxLines: 5, lineHeight: 1.35, group: g, bind: 'desc' });
    const dt = f.date ? TX(c, 'Tarih', f.date, tx + 22 * s, s1.y + s1.h + 8 * s, tw - 40 * s, 19 * s, '#FFFFFF', { fontFamily: 'Poppins', fontWeight: 300, italic: true, maxLines: 3, lineHeight: 1.2, group: g }) : s1;
    const body = rect(c, 'Sekme zemini', tx, bodyY, tw, dt.y + dt.h + 22 * s - bodyY, g1, { radius: r1(12 * s), group: g });
    [body, hb].forEach((l) => { c.L.splice(c.L.indexOf(l), 1); c.L.splice(c.L.indexOf(hd), 0, l); });
    // alıntı
    const q = TX(c, 'Alıntı', f.quote || '', X(40), Y(1208), W - X(80), 37 * s, br, { fontFamily: 'Oswald', fontWeight: 600, align: 'center', maxLines: 5, lineHeight: 1.22 });
    // logo kutusu
    const lw = X(370), lh = Math.min(Y(190), 190 * s * 1.1), ly = Math.max(q.y + q.h + Y(40), H - lh - Y(20));
    rect(c, 'Logo zemini', (W - lw) / 2, ly, lw, lh, '#FFFFFF', { opacity: 0.85 });
    const lg = TX(c, 'Logo', f.logo || 'LOGO', (W - lw) / 2, ly + lh * 0.24, lw, 64 * s, g1, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1, lineHeight: 1 });
    TX(c, 'Logo alt yazısı', f.logoSub || 'Kurum adı', (W - lw) / 2, lg.y + lg.h + 6 * s, lw, 16 * s, g1, { fontFamily: 'Poppins', fontWeight: 500, align: 'center', maxLines: 1 });
  }

  // R10) TALEBE (çift ton): gri kenarlık, iki tonlu fotoğraf, serif başlık + el yazısı, büyük harf alıntı
  function cDuo(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const wide = mode === 'wide' || mode === 'land';
    if (wide) return cWide(c, Object.assign({}, f, { sub: f.quote || f.sub }), { bg: P.b, ink: '#F1EEE9', acc: '#E8823F' });
    c.bg = P.bg;
    const ins = W * 0.035, S = Math.min(W, H);
    rect(c, 'Süs · fotoğraf zemini', ins, ins, W - 2 * ins, H - 2 * ins, P.b);
    slot(c, f, ins, ins, W - 2 * ins, H - 2 * ins, { fit: 'cover', cutCover: true, filters: { duotone: [P.b, '#E8823F'], contrast: 125, brightness: 135 } });
    rect(c, 'Süs · karartma', ins, ins, W - 2 * ins, H - 2 * ins, { type: 'linear', angle: 90, colors: ['rgba(20,28,48,0.15)', 'rgba(20,28,48,0.0)', 'rgba(20,28,48,0.6)'] });
    const t = TX(c, 'Başlık', f.title, M, H * (mode === 'sq' ? 0.12 : 0.18), W - 2 * M, S * 0.1, '#F1EEE9', { fontFamily: f.italic ? 'Raleway' : 'Montserrat', fontWeight: f.italic ? 800 : 400, italic: !!f.italic, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05, letterSpacing: r1(W * 0.003), bind: 'product' });
    const ly = t.y + t.h + S * 0.03;
    rect(c, 'Süs · çizgi', W * 0.09, ly, W * 0.82, u * 0.3, '#F1EEE9');
    if (f.script) TX(c, 'El yazısı', f.script, W * 0.3, ly - S * 0.035, W * 0.4, S * 0.055, '#2A2A3A', { fontFamily: 'Ms Madi', align: 'center', maxLines: 1, uppercase: true });
    // alıntı ve açıklama alt alta: sığmazsa ikisi birlikte küçülür
    const bottom = H - ins - S * 0.05, top = Math.max(ly + S * 0.08, H * (mode === 'sq' ? 0.42 : 0.5));
    let q = null, a = null;
    for (const k of [1, 0.9, 0.8, 0.72, 0.64, 0.56]) {
      if (q) c.L.splice(c.L.indexOf(q), 1); if (a) c.L.splice(c.L.indexOf(a), 1); a = null;
      q = TX(c, 'Alıntı', f.quote || f.sub, W * 0.1, top, W * 0.8, S * 0.042 * k, '#F1EEE9', { fontWeight: 500, uppercase: true, align: 'center', maxLines: 6, lineHeight: 1.35, bind: 'desc' });
      let end = q.y + q.h;
      if (f.sub2) { a = TX(c, 'Açıklama', f.sub2, W * 0.1, end + S * 0.045 * k, W * 0.8, S * 0.024 * k, '#F1EEE9', { fontWeight: 500, uppercase: true, align: 'center', maxLines: 5, lineHeight: 1.55 }); end = a.y + a.h; }
      if (end <= bottom) break;
    }
  }

  // R11) İLİM YUVASI: solda fotoğraf, sağda koyu yeşil degrade sütun
  function cIlim(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    if (c.mode === 'wide' || c.mode === 'land') { c.noTex = true; c.noGhost = true; c.artOverlapOk = true; return cWide(c, f, { bg: P.d, ink: '#FFFFFF', acc: P.a }); }
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    c.bg = P.d;
    const gold = P.a, gold2 = P.b, wht = '#FFFFFF';
    const px = W * 0.5;
    slot(c, f, 0, 0, W * 0.6, H, { fit: 'cover', cutCover: true });
    rect(c, 'Süs · degrade', W * 0.36, 0, W * 0.64, H, { type: 'linear', angle: 0, colors: ['rgba(15,51,38,0)', P.bg, P.d] });
    const x = px + W * 0.02, w = W - x - W * 0.055;
    const wide = mode === 'wide' || mode === 'land';
    const sf = wide ? 0.6 : mode === 'sq' ? 0.7 : mode === 'por' ? 0.85 : 1;
    const bl = [];
    if (f.script) bl.push(tb(TX(c, 'El yazısı', f.script, x, 0, w, W * 0.03 * sf, wht, { fontFamily: 'Crimson Pro', italic: true, align: 'right', maxLines: 3, lineHeight: 1.2 }), W * 0.04 * sf));
    bl.push(tb(TX(c, 'Başlık', f.title, x, 0, w, W * 0.075 * sf, wht, { fontFamily: 'Cinzel', fontWeight: 700, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05, bind: 'product' }), W * 0.005));
    if (f.title2) bl.push(tb(TX(c, 'Başlık 2', f.title2, x, 0, w, W * 0.075 * sf, gold, { fontFamily: 'Cinzel', fontWeight: 700, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05 }), W * 0.03 * sf));
    const dv = [rect(c, 'Süs · çizgi', x + w * 0.05, 0, w * 0.35, u * 0.2, gold2), rect(c, 'Süs · çizgi', x + w * 0.6, 0, w * 0.35, u * 0.2, gold2), IMG(c, 'Süs · simge', TH.icon('kitap', gold2), x + w * 0.44, -W * 0.025 * sf, w * 0.12, W * 0.05 * sf, { fit: 'contain', nw: 200, nh: 200 })];
    bl.push(grp(dv, W * 0.02, W * 0.035 * sf));
    if (f.sub) bl.push(tb(TX(c, 'Alt başlık', f.sub, x, 0, w, W * 0.032 * sf, wht, { fontFamily: 'Crimson Pro', align: 'center', maxLines: 6, lineHeight: 1.3, bind: 'desc' }), W * 0.035 * sf));
    const items = (f.items || []).slice(0, 2);
    if (items.length) {
      const bw = (w - W * 0.03) / 2, bh = W * 0.15 * sf, ls = [];
      items.forEach((it, i) => {
        const bx = x + i * (bw + W * 0.03), g = gid();
        ls.push(rect(c, 'Kutu zemini', bx, 0, bw, bh, 'rgba(0,0,0,0)', { stroke: gold2, strokeWidth: r1(u * 0.25), radius: r1(W * 0.02), group: g }));
        ls.push(IMG(c, 'Süs · simge', TH.icon(i ? 'el' : 'ev', gold2), bx + bw * 0.38, bh * 0.08, bw * 0.24, bh * 0.3, { fit: 'contain', group: g, nw: 200, nh: 200 }));
        ls.push(TX(c, 'Fiyat etiketi', it[0], bx, bh * 0.42, bw, W * 0.025 * sf, wht, { fontFamily: 'Crimson Pro', align: 'center', group: g, maxLines: 1 }));
        ls.push(TX(c, 'Fiyat', it[1], bx, bh * 0.62, bw, W * 0.038 * sf, gold, { fontFamily: 'Crimson Pro', fontWeight: 600, align: 'center', group: g, maxLines: 1 }));
      });
      bl.push(grp(ls, bh, W * 0.035 * sf));
    }
    if (f.cta) {
      const bh = W * 0.16 * sf, ls = [];
      ls.push(IMG(c, 'Süs · fırça', TH.texture('brush', 600, 200, gold2, null, 5), x - w * 0.02, 0, w * 1.04, bh, { nw: 600, nh: 200 }));
      ls.push(TX(c, 'Buton yazısı', f.cta, x + w * 0.06, bh * 0.2, w * 0.88, W * 0.034 * sf, P.d, { fontFamily: 'Cinzel', fontWeight: 700, uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.05, bind: 'cta' }));
      bl.push(grp(ls, bh, W * 0.03 * sf));
    }
    if (f.quote) bl.push(tb(TX(c, 'Alıntı', f.quote, x, 0, w, W * 0.034 * sf, wht, { fontFamily: 'Crimson Pro', align: 'center', maxLines: 3, lineHeight: 1.25 }), W * 0.01));
    if (f.src) bl.push(tb(TX(c, 'Kaynak', f.src, x, 0, w, W * 0.022 * sf, wht, { fontFamily: 'Crimson Pro', align: 'center', maxLines: 1, opacity: 0.85 })));
    stack(c, bl, M * (wide ? 0.6 : 1.4), H - M * (wide ? 0.6 : 2.2), 'center');
    if (!wide) TX(c, 'Logo', f.logo || 'LOGO', M * 0.6, H - M * 1.4, W * 0.4, W * 0.05, wht, { fontFamily: 'Crimson Pro', fontWeight: 600, maxLines: 1 });
  }

  // R12) İFTAR HİSSE: üstte fotoğraf + kutular, üç yuvarlak fotoğraf, lacivert alt panel, hisse kutuları
  function cIftar(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const navy = P.d;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: '#FFFFFF', ink: navy, acc: navy });
    c.bg = navy;
    const st = mode === 'story', ph = H * (st ? 0.42 : 0.58);
    slot(c, f, 0, 0, W, ph, { fit: 'cover', cutCover: true });
    pth(c, 'Renk paneli', 'M0 30C20 12 40 6 50 6C60 6 80 12 100 30V100H0Z', -W * 0.02, ph - W * 0.12, W * 1.04, H - ph + W * 0.12, navy);
    const bw = W * 0.3, g1 = gid();
    const tg = TX(c, 'Üst etiket', f.tag || 'Ramazan-ı Şerif başlangıcı', W * 0.01, W * 0.055, bw - W * 0.04, W * 0.018, navy, { fontWeight: 800, uppercase: true, align: 'center', group: g1, maxLines: 2, lineHeight: 1.05 });
    const dt = TX(c, 'Tarih', f.date || '19/02', 0, tg.y + tg.h, bw - W * 0.02, W * 0.07, navy, { fontFamily: 'Oswald', fontWeight: 700, align: 'center', group: g1, maxLines: 1, lineHeight: 1 });
    const bh = dt.y + dt.h + W * 0.015 - W * 0.045;
    const bxr = rect(c, 'Kutu zemini', -W * 0.02, W * 0.045, bw, bh, '#FFFFFF', { radius: r1(W * 0.03), group: g1 });
    c.L.splice(c.L.indexOf(bxr), 1); c.L.splice(c.L.indexOf(tg), 0, bxr);
    const lw = W * 0.28, g2 = gid();
    rect(c, 'Logo zemini', (W - lw) / 2, -W * 0.03, lw, W * 0.15, '#FFFFFF', { radius: r1(W * 0.03), group: g2 });
    TX(c, 'Logo', f.logo || 'LOGO', (W - lw) / 2, W * 0.045, lw, W * 0.045, navy, { fontFamily: 'Archivo Black', align: 'center', group: g2, maxLines: 1 });
    const g3 = gid();
    rect(c, 'Kutu zemini', W - bw * 0.85 + W * 0.02, W * 0.045, bw * 0.85, W * 0.12, '#FFFFFF', { radius: r1(W * 0.03), group: g3 });
    TX(c, 'Yer', f.place || 'PANAMA', W - bw * 0.85 + W * 0.02, W * 0.07, bw * 0.85 - W * 0.02, W * 0.055, navy, { fontFamily: 'Oswald', fontWeight: 700, align: 'center', uppercase: true, group: g3, maxLines: 1 });
    TX(c, 'Başlık', f.title, M, ph * 0.36, W - 2 * M, W * 0.072, '#FFFFFF', { fontFamily: 'Archivo Black', uppercase: true, align: 'center', maxLines: 2, lineHeight: 1.0, rotation: 3, bind: 'product', shadow: { x: r1(u * 0.3), y: r1(u * 0.5), blur: r1(u * 0.8), color: 'rgba(0,0,0,0.55)' } });
    const cd = W * (st ? 0.27 : 0.25), cy = ph - cd * 0.62, k = st ? 1.45 : 1; // hikâye boyunda yazılar ve kutular büyür, alt boşluk kalmaz
    ['iftar-sofra1', 'iftar-sofra2', 'iftar-sofra3'].forEach((k, i) => {
      const cx = W * (0.24 + i * 0.26);
      ell(c, 'Süs · çerçeve', cx - cd / 2 - u * 0.6, cy - u * 0.6, cd + u * 1.2, cd + u * 1.2, '#FFFFFF', { shadow: { x: 0, y: r1(u * 0.4), blur: r1(u * 1.2), color: 'rgba(0,0,0,0.3)' } });
      const s = slot(c, Object.assign({}, f, { photo: k }), cx - cd / 2, cy, cd, cd, { fit: 'cover', mask: 'circle', photo: c.prod ? undefined : k });
      s.name = i ? 'Fotoğraf ' + (i + 1) : 'Ürün fotoğrafı'; if (i) delete s.role;
    });
    const qy = cy + cd + W * 0.025;
    const q = TX(c, 'Alıntı', f.quote || '', W * 0.04, qy, W * 0.92, W * 0.0175 * k, '#FFFFFF', { align: 'center', maxLines: st ? 5 : 3, lineHeight: 1.25 });
    const s2 = TX(c, 'Alt başlık', f.sub || '', W * 0.06, q.y + q.h + W * 0.008, W * 0.88, W * 0.024 * k, '#FFFFFF', { fontFamily: 'Archivo Black', uppercase: true, align: 'center', maxLines: st ? 3 : 2, lineHeight: 1.2, bind: 'desc' });
    const n = 4, gw = W * (st ? 0.19 : 0.13), gap = (W - n * gw) / (n + 1), by = s2.y + s2.h + W * (st ? 0.05 : 0.015), priceY = H - W * 0.05, bh2 = Math.max(W * 0.06, Math.min(W * (st ? 0.24 : 0.15), priceY - by - W * (st ? 0.06 : 0.01)));
    for (let i = 0; i < n; i++) {
      const x = gap + i * (gw + gap), g = gid();
      rect(c, 'Hisse kutusu', x, by, gw, bh2, '#FFFFFF', { radius: r1(W * 0.012), group: g });
      TX(c, 'Hisse', (i + 1) + '.HİSSE', x, by + W * 0.01 * k, gw, W * 0.024 * k, '#14110E', { fontFamily: 'Archivo Black', align: 'center', group: g, maxLines: 1 });
    }
    const items = f.items || [['1 Hisse bedeli', '4500 TL'], ['1 İftar bedeli', '18000 TL']];
    items.slice(0, 2).forEach((it, i) => TX(c, 'Fiyat', it[0].toLocaleUpperCase('tr-TR') + ' : ' + it[1], i ? W * 0.5 : W * 0.04, priceY - (st ? W * 0.02 : 0), W * 0.46, W * 0.022 * (st ? 1.3 : 1), '#FFFFFF', { fontFamily: 'Archivo Black', align: 'center', maxLines: 1 }));
  }

  // R13) AŞURE KARE: sağda fotoğraf, solda beyaz geçiş, süslü ayraçlar, iki renkli dar başlık
  function cAsure(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true; c.bg = '#F4F6F7';
    if (mode === 'wide' || mode === 'land') return cWide(c, Object.assign({}, f, { tag: f.title2 }), { bg: '#FFFFFF', ink: '#333333', acc: P.a });
    if (mode === 'por' || mode === 'story') return cZarif(c, Object.assign({ quote: (f.title2 || '') + '\n' + (f.sub || '').split(';')[0], title2: f.title2, feats: [] }, f, { title: f.title }));
    const red = P.a, ink = '#333333';
    slot(c, f, W * 0.28, 0, W * 0.72, H, { fit: 'cover', cutCover: true });
    rect(c, 'Süs · beyaz geçiş', 0, 0, W * 0.75, H, { type: 'linear', angle: 0, colors: ['#FFFFFF', 'rgba(255,255,255,0.92)', 'rgba(255,255,255,0)'] });
    const orn = (y) => { rect(c, 'Süs · ayraç', W * 0.1, y, W * 0.16, u * 0.15, red); pth(c, 'Süs · süsleme', 'M0 50C15 20 35 20 50 50C65 80 85 80 100 50M50 50C40 30 60 30 50 50', W * 0.27, y - W * 0.012, W * 0.05, W * 0.025, 'rgba(0,0,0,0)', { stroke: red, strokeWidth: r1(u * 0.2) }); rect(c, 'Süs · ayraç', W * 0.33, y, W * 0.16, u * 0.15, red); };
    orn(H * 0.09);
    const t1 = TX(c, 'Başlık', f.title, W * 0.06, H * 0.13, W * 0.5, W * 0.06, ink, { fontFamily: 'Oswald', fontWeight: 500, uppercase: true, align: 'center', maxLines: 1, letterSpacing: r1(W * 0.002), bind: 'product' });
    const t2 = TX(c, 'Başlık 2', f.title2 || '', W * 0.06, t1.y + t1.h + W * 0.01, W * 0.5, W * 0.06, red, { fontFamily: 'Oswald', fontWeight: 500, uppercase: true, align: 'center', maxLines: 1, letterSpacing: r1(W * 0.006) });
    orn(t2.y + t2.h + W * 0.03);
    TX(c, 'Alt başlık', f.sub, W * 0.06, t2.y + t2.h + W * 0.07, W * 0.52, W * 0.026, ink, { italic: true, align: 'center', maxLines: 5, lineHeight: 1.45, letterSpacing: r1(W * 0.002), bind: 'desc' });
    if (f.price) TX(c, 'Fiyat', (f.priceLabel || '1 Aşure ücreti') + ' ' + f.price, W * 0.06, H - W * 0.11, W * 0.5, W * 0.036, red, { fontFamily: 'Oswald', fontWeight: 600, align: 'center', maxLines: 1 });
  }

  // R14) AŞURE ZARİF: kumaş zemin, ince çerçeve, altın başlık, vurgu bantları, geometrik çerçeveli yuvarlak fotoğraf, açıklamalar
  function cZarif(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true; c.bg = '#F3F3F2';
    const gold = P.a, gry = '#5A5A5A';
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: '#F3F3F2', ink: gold, acc: gold });
    IMG(c, 'Süs · kumaş', TH.mist(Math.round(W), Math.round(H), '#EFEFEE', 8), 0, 0, W, H);
    const fi = W * 0.05;
    rect(c, 'Süs · çerçeve', fi, fi * (H / W > 1.4 ? 2 : 1), W - 2 * fi, H - 2 * fi * (H / W > 1.4 ? 2 : 1), 'rgba(0,0,0,0)', { stroke: '#111111', strokeWidth: r1(u * 0.35) });
    const top = fi * 2.4;
    const t = TX(c, 'Başlık', f.title, M, top, W - 2 * M, W * 0.075, gold, { fontFamily: 'Playfair Display', fontWeight: 700, align: 'center', maxLines: 2, letterSpacing: r1(-W * 0.002), bind: 'product' });
    let y = t.y + t.h + W * 0.02;
    const ql = String(f.quote || '').split('\n').slice(0, 3);
    ql.forEach((ln, i) => {
      const fs = W * 0.042, l = TX(c, 'Alıntı', ln, W * 0.17, y, W * 0.7, fs, i ? '#FFFFFF' : gry, { fontFamily: 'Playfair Display', maxLines: 1 });
      if (i) { const tw = R.measure(ln, l) + fs * 0.6; const b = rect(c, 'Vurgu bandı', W * 0.17 - fs * 0.3, y - fs * 0.08, tw, l.h + fs * 0.16, gold); c.L.splice(c.L.indexOf(b), 1); c.L.splice(c.L.indexOf(l), 0, b); }
      y += l.h + fs * 0.35;
    });
    // alt blok alttan yığılır, daire ve notlar aradaki boşluğa sığar
    const botY = H - fi * (H / W > 1.4 ? 2.4 : 1.6);
    const sb = TX(c, 'Alt başlık', f.sub, W * 0.12, 0, W * 0.76, W * (H / W > 1.4 ? 0.025 : 0.022), gry, { fontFamily: 'Playfair Display', align: 'center', maxLines: 5, lineHeight: 1.35, bind: 'desc' });
    const b2 = TX(c, 'Başlık 2', f.title2 || '', M, 0, W - 2 * M, W * (H / W > 1.4 ? 0.065 : 0.05), gold, { fontFamily: 'Playfair Display', fontWeight: 700, align: 'center', maxLines: 2, lineHeight: 1.08 });
    sb.y = r1(botY - sb.h); b2.y = r1(sb.y - W * 0.025 - b2.h);
    const top0 = y + W * 0.02, bot0 = b2.y - W * 0.03, hasN = (f.feats || []).length > 0;
    const noteH = hasN ? W * 0.13 : 0;
    const av0 = bot0 - top0 - noteH, cd = Math.max(W * 0.12, Math.min(W * 0.46, (bot0 - top0 - noteH * 1.4) * 0.8, av0 / 1.3)), cx = W / 2, cy = top0 + noteH + av0 / 2; // geometrik çerçeve yazılara binmez
    [0, 22.5].forEach((rot) => pth(c, 'Süs · geometrik çerçeve', 'M50 0L85 15L100 50L85 85L50 100L15 85L0 50L15 15Z', cx - cd * 0.62, cy - cd * 0.62, cd * 1.24, cd * 1.24, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: r1(u * 0.3), rotation: rot }));
    slot(c, f, cx - cd / 2, cy - cd / 2, cd, cd, { fit: 'cover', mask: 'circle', cutCover: true });
    if (hasN) {
      const notes = f.feats.slice(0, 3), np = [[0.06, top0], [0.62, top0], [0.66, cy + cd * 0.72]]; // 3. not geometrik çerçevenin altında
      notes.forEach((nt, i) => {
        const [fx, ny] = np[i];
        if (i === 2 && ny + W * 0.1 > bot0) return;
        TX(c, 'Not', nt, W * fx, ny, W * 0.3, W * 0.022, gry, { fontFamily: 'Playfair Display', align: 'center', maxLines: 4, lineHeight: 1.15 });
      });
    }

  }

  // R15) İHTİDA: köşe dalgaları, kesik çizgiler, uçaklar, iki renkli başlık, alıntı, sarı hap fiyatlar
  function cIhtida(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    if (c.mode === 'wide' || c.mode === 'land') { c.noTex = true; c.noGhost = true; c.artOverlapOk = true; return cWide(c, f, { bg: '#F7F7F7', ink: P.d, acc: P.b }); }
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true; c.bg = '#F7F7F7';
    const cy_ = P.c, navy = P.d, tp = P.b, yel = P.a;
    IMG(c, 'Süs · kâğıt', TH.texture('paper', Math.round(W), Math.round(H), '#FFFFFF', null, 2), 0, 0, W, H, { opacity: 0.6 });
    const blob = 'M0 0H100C96 20 70 18 64 34C58 50 40 44 30 56C20 68 12 90 0 100Z';
    [[0, 0, 0], [W, 0, 90], [W, H, 180], [0, H, 270]].forEach(([x, y, rot]) => pth(c, 'Süs · köşe', blob, x - W * 0.17, y - W * 0.17, W * 0.34, W * 0.34, cy_, { rotation: rot }));
    const dash = (d, x, y, w, h, rot = 0) => pth(c, 'Süs · kesik çizgi', d, x, y, w, h, 'rgba(0,0,0,0)', { stroke: navy, strokeWidth: r1(u * 0.25), dash: true, rotation: rot });
    dash('M0 80C30 60 50 20 100 0', 0, H * 0.02, W * 0.2, W * 0.2); dash('M0 0C40 10 60 60 100 80', W * 0.8, H * 0.02, W * 0.2, W * 0.2);
    const t1 = TX(c, 'Başlık', f.title, M, H * 0.06, W - 2 * M, W * 0.12, tp, { fontFamily: 'Poppins', fontWeight: 700, uppercase: true, align: 'center', maxLines: 1, bind: 'product' });
    const t2 = TX(c, 'Başlık 2', f.title2 || '', M, t1.y + t1.h * 0.92, W - 2 * M, W * 0.1, navy, { fontFamily: 'Poppins', fontWeight: 700, uppercase: true, align: 'center', maxLines: 1 });
    const q = TX(c, 'Alıntı', f.quote || '', W * 0.05, t2.y + t2.h + W * 0.02, W * 0.9, W * 0.032, '#3A3A3A', { fontFamily: 'Poppins', fontWeight: 600, align: 'center', maxLines: 4, lineHeight: 1.3 });
    const s = f.src ? TX(c, 'Kaynak', f.src, W * 0.1, q.y + q.h + W * 0.005, W * 0.8, W * 0.026, '#3A3A3A', { align: 'center', maxLines: 1 }) : q;
    const ay = s.y + s.h + W * 0.04;
    dash('M0 40C30 0 70 0 100 40', W * 0.0, ay, W * 0.42, W * 0.1); dash('M0 40C30 80 70 80 100 40', W * 0.62, ay, W * 0.38, W * 0.1);
    const plane = 'M50 5L58 40L95 55L95 63L58 55L56 80L68 90L68 96L50 91L32 96L32 90L44 80L42 55L5 63L5 55L42 40Z';
    pth(c, 'Süs · uçak', plane, W * 0.25, ay - W * 0.02, W * 0.08, W * 0.08, navy, { rotation: 120 });
    pth(c, 'Süs · uçak', plane, W * 0.68, ay - W * 0.01, W * 0.08, W * 0.08, navy, { rotation: 70 });
    const items = (f.items || [['1 Talebe uçak bileti', '$1000'], ['1 Talebe cep harçlığı', '$100'], ['1 Hisse uçak bileti', '$100']]).slice(0, 3);
    const ph = W * 0.13, gap = W * 0.03, rowsY = H - M * 0.6 - (items.length > 2 ? ph * 2 + gap : ph);
    slot(c, f, 0, ay + W * 0.05, W, rowsY - ay - W * 0.08, { fit: 'contain' });
    items.forEach((it, i) => {
      const two = items.length > 2 && i < 2, pw = W * 0.43, x = two ? (i ? W * 0.52 : W * 0.05) : (W - pw) / 2, y = two ? rowsY : rowsY + (items.length > 2 ? ph + gap : 0);
      const g = gid();
      pill(c, 'Fiyat zemini', x, y, pw, ph, yel, { group: g });
      TX(c, 'Fiyat etiketi', it[0], x, y + ph * 0.14, pw, W * 0.028, '#3A3A3A', { uppercase: true, align: 'center', group: g, maxLines: 1 });
      TX(c, 'Fiyat', it[1], x, y + ph * 0.42, pw, W * 0.05, '#3A3A3A', { fontFamily: 'Poppins', fontWeight: 700, align: 'center', group: g, maxLines: 1 });
    });
  }

  // R16) GERİ SAYIM: iki renkli başlık, dev soluk sayı, "son … gün", mühür, kalabalık fotoğraf
  function cSayac(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const g1 = P.d, gold = P.a;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: g1, acc: gold, bgImg: (w, h) => TH.mist(w, h, P.bg) });
    c.bg = P.bg;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), P.bg, 3), 0, 0, W, H);
    const t1 = TX(c, 'Başlık', f.title, M, H * 0.08, W - 2 * M, W * 0.085, g1, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1, bind: 'product' });
    TX(c, 'Başlık 2', f.title2 || '', M, t1.y + t1.h * 0.95, W - 2 * M, W * 0.085, gold, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1 });
    const t2b = t1.y + t1.h * 0.95 + W * 0.085 * 1.25, fy0 = H - W * 0.06;
    // sayı + fotoğraf bloğu: başlıkla alt şerit arasında ortalanır; sayı fotoğrafın üstünde tam görünür
    const st = H / W > 1.5, numFs = W * (st ? 0.4 : 0.36), phH = st ? Math.min(W * 0.75, fy0 - t2b - numFs) : Math.min(W * 0.42, Math.max(W * 0.3, fy0 - t2b - W * 0.36)), blockH = numFs * 0.75 + phH;
    const ny = t2b + Math.max(W * 0.02, (fy0 - t2b - blockH) / 2);
    TX(c, 'Sayı', f.big || '20', 0, ny, W, numFs, mixHex(P.bg, g1, 0.45), { fontWeight: 700, align: 'center', maxLines: 1, lineHeight: 0.9, opacity: 0.85, letterSpacing: r1(-W * 0.02) });
    const py = ny + numFs * 0.75;
    const ph = slot(c, f, 0, py, W, Math.min(st ? W * 0.6 : phH, fy0 - py), { fit: st ? 'cover' : 'contain', cutCover: st });
    if (st) ph.fade = { t: 0.12, b: 0.18, l: 0.03, r: 0.03, soft: 0.07, cloud: true, seed: 3 };
    const ly = ny + numFs * 0.36;
    TX(c, 'Üst etiket', f.tag || 'Kurban\nBayramına', W * 0.045, ly - W * 0.085, W * 0.22, W * 0.03, g1, { fontWeight: 700, uppercase: true, lineHeight: 1.05, maxLines: 2 });
    TX(c, 'Son', f.pre || 'son', W * 0.045, ly, W * 0.2, W * 0.075, g1, { fontWeight: 700, maxLines: 1, lineHeight: 1 });
    TX(c, 'Gün', f.post || 'gün', W * 0.78, ly, W * 0.18, W * 0.075, mixHex(P.bg, g1, 0.45), { fontWeight: 700, align: 'right', maxLines: 1, lineHeight: 1 });
    seal(c, W * 0.875, ny - W * 0.015, W * 0.13, f.seal || 'Kurbanın MANA’sı paylaşmaktır! • PAYLAŞ! •', gold, '#FFFFFF', 'koyun');
    const fy = fy0;
    rect(c, 'Alt bilgi zemini', 0, fy, W, H - fy, '#FFFFFF');
    { const ft = TX(c, 'Süs · ülke listesi', f.foot || 'Haiti - Dominik - Guatemala - Honduras - El Salvador - Meksika - Panama - Brezilya - Venezuela - Şili - Arjantin', W * 0.02, fy, W * 0.96, W * 0.019, gold, { align: 'center', fontWeight: 500, fit: false }); fitW(ft, W * 0.96, W * 0.024); ft.x = r1(W * 0.02); ft.y = r1(fy + (H - fy - ft.h) / 2); }
  }

  // R17) AŞURE KAZANI: tam fotoğraf, üstte lacivert geçiş, beyaz kalın başlık + el yazısı
  function cKazan(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    if (c.mode === 'wide' || c.mode === 'land') { c.noTex = true; c.noGhost = true; c.artOverlapOk = true; return cWide(c, f, { bg: P.bg, ink: '#FFFFFF', acc: P.a }); }
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true; c.bg = '#FFFFFF';
    const ins = W * 0.045;
    rect(c, 'Süs · fotoğraf zemini', ins, ins, W - 2 * ins, H - 2 * ins, P.c);
    slot(c, f, ins, ins, W - 2 * ins, H - 2 * ins, { fit: 'cover', cutCover: true });
    rect(c, 'Süs · geçiş', ins, ins, W - 2 * ins, (H - 2 * ins) * 0.45, { type: 'linear', angle: 90, colors: [P.bg, 'rgba(26,46,138,0)'] });
    const t = TX(c, 'Başlık', f.title, W * 0.1, H * 0.1, W * 0.8, W * 0.05, '#FFFFFF', { fontFamily: 'Poppins', fontWeight: 700, align: 'center', maxLines: 2, lineHeight: 1.15, bind: 'product' });
    TX(c, 'El yazısı', f.script || '', W * 0.1, t.y + t.h, W * 0.8, W * 0.065, P.a, { fontFamily: 'Kaushan Script', align: 'center', maxLines: 1, fx: { outline: { width: r1(W * 0.0015), color: P.a } } });
    if (f.big) TX(c, 'Adet', f.big, W * 0.06, H * 0.62, W * 0.25, W * 0.032, '#FFFFFF', { rotation: -35, maxLines: 1 });
  }

  // R18) ŞÜKÜR: fiyat sekmesi, fotoğraf, kalp rozet, iki satır serif başlık, altın alt başlık, alt simgeler
  function cSukur(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const g1 = P.d, gold = P.a;
    if (mode === 'wide' || mode === 'land') return cWide(c, f, { bg: P.bg, ink: g1, acc: gold, bgImg: (w, h) => TH.mist(w, h, P.bg) });
    c.bg = P.bg;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), mixHex(P.bg, '#FFFFFF', 0.4), 5), 0, 0, W, H);
    if (f.price) {
      const g = gid(), pw = W * 0.26, ph = W * 0.12;
      pth(c, 'Fiyat zemini', 'M0 0H100V100H22C10 100 0 90 0 78Z', W - pw, 0, pw, ph, g1, { group: g });
      TX(c, 'Fiyat', f.price, W - pw, ph * 0.22, pw * 0.94, W * 0.06, '#FFFFFF', { fontFamily: 'DM Serif Display', align: 'center', group: g, maxLines: 1 });
    }
    const st = mode === 'story';
    slot(c, f, W * 0.12, H * 0.04, W * 0.66, H * 0.36, { fit: 'contain' });
    const hy = H * (st ? 0.42 : 0.41);
    const hb = gid();
    pth(c, 'Süs · kalp rozet', 'M50 92C20 72 4 56 4 36C4 18 18 6 32 6C42 6 48 12 50 18C52 12 58 6 68 6C82 6 96 18 96 36C96 56 80 72 50 92Z', W * 0.04, hy - W * 0.07, W * 0.2, W * 0.16, g1, { group: hb, rotation: -6 });
    TX(c, 'Rozet yazısı', f.tag || 'Kurban\nBerekettir', W * 0.04, hy - W * 0.045, W * 0.2, W * 0.03, '#FFFFFF', { fontFamily: 'DM Serif Display', align: 'center', lineHeight: 1.05, group: hb, rotation: -6, maxLines: 2 });
    const t1 = TX(c, 'Başlık', f.title, W * 0.12, hy, W * 0.76, W * 0.07, g1, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1, letterSpacing: r1(-W * 0.002), bind: 'product' });
    const t2 = TX(c, 'Başlık 2', f.title2 || '', W * 0.12, t1.y + t1.h * 0.85, W * 0.76, W * 0.13, g1, { fontFamily: 'DM Serif Display', align: 'center', maxLines: 1, lineHeight: 0.95 });
    const s1 = TX(c, 'Alt başlık', f.sub, W * 0.1, t2.y + t2.h + W * 0.005, W * 0.8, W * 0.032, gold, { fontWeight: 800, align: 'center', maxLines: 1, bind: 'desc' });
    TX(c, 'Açıklama', f.sub2 || '', W * 0.08, s1.y + s1.h + W * 0.015, W * 0.84, W * 0.023, gold, { align: 'center', maxLines: st ? 6 : 4, lineHeight: 1.28 });
    const iy = H - W * 0.12, d = W * 0.09;
    IMG(c, 'Süs · simge', TH.icon('koyun', g1), W * 0.05, iy, d, d, { fit: 'contain', nw: 200, nh: 200 });
    const feats = f.feats || ['Kurbanlarınız itina ile kesilir', 'Kurban Cenab-ı Hakk’a yaklaşmaya bir vesiledir •', 'Kurban videosu tarafınıza iletilir'];
    TX(c, 'Özellik', feats[0], W * 0.16, iy + d * 0.18, W * 0.2, W * 0.024, g1, { fontWeight: 800, maxLines: 2, lineHeight: 1.15 });
    seal(c, W / 2, iy + d / 2, W * 0.14, feats[1], gold, '#FFFFFF', 'koyun');
    TX(c, 'Özellik', feats[2], W * 0.62, iy + d * 0.18, W * 0.22, W * 0.024, g1, { fontWeight: 800, maxLines: 2, lineHeight: 1.15, align: 'right' });
    IMG(c, 'Süs · simge', TH.icon('video', g1), W * 0.85, iy, d, d, { fit: 'contain', nw: 200, nh: 200 });
  }
  // R19) BAĞIŞ TAKİBİ: hedef, toplanan, ilerleme çubuğu, kalan gün
  function cTakip(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const base = P.d, lite = mixHex(P.c, '#FFFFFF', 0.12), gold = '#D9C27A';
    c.bg = base;
    IMG(c, 'Süs · gece', TH.night(Math.round(W), Math.round(H), base, lite), 0, 0, W, H);
    IMG(c, 'Süs · desen', TH.girih(Math.round(W), Math.round(H * 0.4), '#FFFFFF'), 0, H * 0.6, W, H * 0.4, { opacity: 0.08 });
    const wide = mode === 'wide' || mode === 'land', st = mode === 'story';
    const pr = Object.assign({ goal: 1000, got: 640, unit: 'koli', end: '' }, f.progress || {});
    const pct = Math.max(0, Math.min(1, pr.got / Math.max(1, pr.goal)));
    const fmt = (n) => Number(n).toLocaleString('tr-TR');
    const x0 = wide ? M : W * 0.08, cw = wide ? W * 0.52 : W * 0.84;
    if (!wide) IMG(c, 'Süs · yıldız ışıkları', TH.garland(Math.round(W), Math.round(W * 0.2)), 0, 0, W, W * 0.2);
    let y = wide ? H * 0.08 : st ? H * 0.11 : W * 0.1;
    const t = TX(c, 'Başlık', f.title, x0, y, cw, wide ? H * 0.11 : W * (st ? 0.09 : 0.075), '#FFFFFF', { fontFamily: 'DM Serif Display', align: wide ? 'left' : 'center', maxLines: 2, lineHeight: 1.08, bind: 'product' });
    y = t.y + t.h + W * 0.02;
    const s1 = TX(c, 'Alt başlık', f.sub, x0, y, cw, wide ? H * 0.045 : W * 0.03, '#FFFFFF', { align: wide ? 'left' : 'center', maxLines: 3, lineHeight: 1.3, opacity: 0.9, bind: 'desc' });
    y = s1.y + s1.h + (wide ? H * 0.05 : W * 0.04);
    // sayılar
    const nf = wide ? H * 0.13 : W * (st ? 0.11 : 0.09);
    const g1 = TX(c, 'Toplanan sayı', fmt(pr.got), x0, y, cw * 0.55, nf, gold, { fontFamily: 'DM Serif Display', maxLines: 1, lineHeight: 1 });
    TX(c, 'Hedef sayı', '/ ' + fmt(pr.goal) + ' ' + pr.unit, x0 + cw * 0.45, y + nf * 0.42, cw * 0.55, nf * 0.42, '#FFFFFF', { align: 'right', maxLines: 1, fontWeight: 600, opacity: 0.85 });
    y = g1.y + g1.h + (wide ? H * 0.03 : W * 0.02);
    const bh = wide ? H * 0.05 : W * 0.045, g = gid();
    rect(c, 'İlerleme zemini', x0, y, cw, bh, 'rgba(255,255,255,0.16)', { radius: r1(bh / 2), group: g });
    const bar = rect(c, 'İlerleme çubuğu', x0, y, Math.max(bh, cw * pct), bh, { type: 'linear', angle: 0, colors: [gold, '#F6E7A8'] }, { radius: r1(bh / 2), group: g, shadow: { x: 0, y: 0, blur: r1(bh * 0.8), color: 'rgba(246,231,168,0.55)' } });
    bar.progress = { goal: pr.goal, got: pr.got, unit: pr.unit, end: pr.end, x: r1(x0), w: r1(cw) };
    y += bh + (wide ? H * 0.025 : W * 0.015);
    TX(c, 'Yüzde', '%' + Math.round(pct * 100) + ' tamamlandı', x0, y, cw * 0.5, wide ? H * 0.04 : W * 0.028, '#FFFFFF', { fontWeight: 700, maxLines: 1 });
    const days = pr.end ? Math.max(0, Math.ceil((new Date(pr.end + 'T23:59') - new Date()) / 864e5)) : (f.daysLeft || 12);
    TX(c, 'Kalan gün', 'Son ' + days + ' gün', x0 + cw * 0.5, y, cw * 0.5, wide ? H * 0.04 : W * 0.028, gold, { fontWeight: 800, align: 'right', maxLines: 1 });
    y += W * 0.06;
    // fotoğraf
    if (wide) slot(c, f, W * 0.6, M * 0.4, W * 0.36, H - M * 0.8, { fit: 'contain' });
    else {
      const bot = H - W * (st ? 0.2 : 0.15);
      slot(c, f, W * 0.15, y, W * 0.7, Math.max(W * 0.2, bot - y), { fit: 'contain' });
      const cy = H - W * (st ? 0.16 : 0.12), chh = W * 0.085, cww = W * 0.6, gg = gid();
      pill(c, 'Buton zemini', (W - cww) / 2, cy, cww, chh, gold, { group: gg });
      const bt = TX(c, 'Buton yazısı', f.cta || 'Sen de destek ol', (W - cww) / 2, cy, cww, W * 0.034, base, { fontWeight: 800, align: 'center', maxLines: 1, group: gg, bind: 'cta' });
      bt.y = r1(cy + (chh - bt.h) / 2);
    }
  }
  // R20) TEŞEKKÜR / KESİM RAPORU: kişiye özel ad
  function cTesekkur(c, f) {
    const { W, H, u, M, mode, P, ts } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const g1 = P.d, gold = P.a;
    c.bg = P.bg;
    IMG(c, 'Süs · sis', TH.mist(Math.round(W), Math.round(H), P.bg, 7), 0, 0, W, H);
    const wide = mode === 'wide' || mode === 'land', st = mode === 'story', Sx = wide ? Math.min(W, H * 1.62) : W;
    const fr = (mode === 'wide' || mode === 'land' ? Math.min(W, H) : W) * 0.035;
    rect(c, 'Süs · çerçeve', fr, fr, W - 2 * fr, H - 2 * fr, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: r1(u * 0.35) });
    rect(c, 'Süs · çerçeve', fr * 1.5, fr * 1.5, W - 3 * fr, H - 3 * fr, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: r1(u * 0.15), opacity: 0.7 });
    const colW = wide ? W * 0.55 : W * 0.8, x0 = wide ? M * 1.2 : (W - colW) / 2, al = wide ? 'left' : 'center';
    let y = wide ? M * 1.1 : H * (st ? 0.1 : 0.09);
    const tg = TX(c, 'Üst etiket', f.tag || 'Teşekkür ederiz', x0, y, colW, (wide ? Sx * 0.022 : W * (0.03)), gold, { fontWeight: 700, uppercase: true, align: al, maxLines: 1 });
    y = tg.y + tg.h + W * 0.015;
    const hi = TX(c, 'Hitap', f.hi || 'Sayın', x0, y, colW, (wide ? Sx * 0.03 : W * (0.04)), g1, { fontFamily: 'DM Serif Display', align: al, maxLines: 1 });
    y = hi.y + hi.h;
    const nm = TX(c, 'Bağışçı adı', f.name || 'Ad Soyad', x0, y, colW, (wide ? Sx * 0.07 : W * (st ? 0.12 : 0.1)), g1, { fontFamily: 'Alex Brush', align: al, maxLines: 1, lineHeight: 1.1, bind: 'name' });
    y = nm.y + nm.h + W * 0.01;
    rect(c, 'Süs · çizgi', wide ? x0 : W * 0.3, y, wide ? colW * 0.4 : W * 0.4, u * 0.2, gold);
    y += W * 0.03;
    const tl = TX(c, 'Başlık', f.title, x0, y, colW, (wide ? Sx * 0.035 : W * (0.055)), g1, { fontFamily: 'DM Serif Display', align: al, maxLines: 2, lineHeight: 1.1, bind: 'product' });
    y = tl.y + tl.h + W * 0.02;
    const sb = TX(c, 'Alt başlık', f.sub, x0, y, colW, (wide ? Sx * 0.02 : W * (0.028)), g1, { align: al, maxLines: 4, lineHeight: 1.35, opacity: 0.9, bind: 'desc' });
    y = sb.y + sb.h + W * 0.03;
    if (f.report) {
      const rows = f.report;
      rows.forEach(([k, v]) => {
        const a = TX(c, 'Rapor başlığı', k, x0 + (wide ? 0 : colW * 0.05), y, colW * 0.42, (wide ? Sx : W) * 0.024, gold, { fontWeight: 700, align: wide ? 'left' : 'right', maxLines: 1 });
        TX(c, 'Rapor ' + k.toLocaleLowerCase('tr-TR'), v, x0 + colW * (wide ? 0.42 : 0.53), y, colW * 0.47, (wide ? Sx : W) * 0.024, g1, { fontWeight: 600, maxLines: 1 });
        y = a.y + a.h + (wide ? Sx : W) * 0.008;
      });
      y += W * 0.02;
    }
    if (wide) slot(c, f, W * 0.62, M * 0.6, W * 0.33, H - M * 1.2, { fit: 'contain' });
    else {
      const bot = H - W * 0.2;
      if (bot - y > W * 0.15) slot(c, f, W * 0.2, y, W * 0.6, bot - y, { fit: 'contain' });
      seal(c, W / 2, H - W * 0.12, W * 0.13, f.seal || 'Kurban Cenab-ı Hakk’a yaklaşmaya bir vesiledir •', gold, '#FFFFFF', f.icon || 'koyun');
    }
  }
  // ---------------------------------------------------------------- EĞİTİM: belge (sertifika) ve duyuru
  function cBelge(c, f) {
    const { W, H, u, mode, P } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const ink = P.d, gold = P.a, land = W > H * 1.1;
    c.bg = P.bg;
    IMG(c, 'Süs · zemin dokusu', TH.mist(Math.round(W), Math.round(H), P.bg, 11), 0, 0, W, H);
    const fr = Math.min(W, H) * 0.035;
    rect(c, 'Süs · dış çerçeve', fr, fr, W - 2 * fr, H - 2 * fr, 'rgba(0,0,0,0)', { stroke: ink, strokeWidth: r1(u * 0.9) });
    rect(c, 'Süs · iç çerçeve', fr * 1.7, fr * 1.7, W - 3.4 * fr, H - 3.4 * fr, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: r1(u * 0.25) });
    const ks = Math.min(W, H) * 0.11;
    [[fr * 1.2, fr * 1.2, 0], [W - fr * 1.2 - ks, fr * 1.2, 90], [W - fr * 1.2 - ks, H - fr * 1.2 - ks, 180], [fr * 1.2, H - fr * 1.2 - ks, 270]].forEach(([x, y, r]) => IMG(c, 'Süs · köşe', TH.icon('kose', gold), x, y, ks, ks, { fit: 'contain', rotation: r, nw: 400, nh: 400 }));
    const colW = W * (land ? 0.74 : 0.8), x0 = (W - colW) / 2;
    let y = H * (land ? 0.11 : 0.1);
    if (f.icon) { const isz = Math.min(W, H) * 0.075; IMG(c, 'Simge', TH.icon(f.icon, gold), (W - isz) / 2, y, isz, isz, { fit: 'contain', nw: 400, nh: 400 }); y += isz + u * 1.2; }
    const tg = TX(c, 'Başlık', f.title || 'BAŞARI BELGESİ', x0, y, colW, Math.min(W, H) * (land ? 0.075 : 0.07), ink, { fontFamily: 'Cinzel', fontWeight: 700, align: 'center', maxLines: 1, letterSpacing: r1(u * 0.4), bind: 'product' });
    y = tg.y + tg.h + u * 0.6;
    pth(c, 'Süs · ayraç', 'M0 50H38M62 50H100M50 40L60 50L50 60L40 50Z', W / 2 - colW * 0.22, y, colW * 0.44, u * 3, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: r1(u * 0.25) });
    y += u * 4.2;
    const hi = TX(c, 'Hitap', f.hi || 'Bu belge', x0, y, colW, Math.min(W, H) * 0.03, ink, { fontFamily: 'Crimson Pro', fontWeight: 400, italic: true, align: 'center', maxLines: 1, opacity: 0.85 });
    y = hi.y + hi.h + u * 0.4;
    const nm = TX(c, 'Bağışçı adı', f.name || 'Ad Soyad', x0, y, colW, Math.min(W, H) * (land ? 0.11 : 0.1), ink, { fontFamily: 'Alex Brush', align: 'center', maxLines: 1, lineHeight: 1.15, bind: 'name' });
    y = nm.y + nm.h + u * 0.4;
    rect(c, 'Süs · isim çizgisi', W / 2 - colW * 0.3, y, colW * 0.6, u * 0.18, gold);
    y += u * 2.2;
    const sb = TX(c, 'Alt başlık', f.sub || '', x0 + colW * 0.06, y, colW * 0.88, Math.min(W, H) * 0.03, ink, { fontFamily: 'Crimson Pro', fontWeight: 400, align: 'center', maxLines: 4, lineHeight: 1.35, bind: 'desc' });
    y = sb.y + sb.h;
    // imza alanları ve mühür
    const by = H - fr * 1.7 - H * (land ? 0.17 : 0.15), sw = colW * 0.3;
    const sigs = [f.sign1, f.sign2].filter(Boolean);
    sigs.forEach((t, i) => {
      const sx = sigs.length === 1 ? W / 2 - sw / 2 : i ? x0 + colW - sw : x0;
      rect(c, 'Süs · imza çizgisi', sx, by + H * 0.05, sw, u * 0.15, ink, { opacity: 0.6 });
      TX(c, 'İmza ' + (i + 1), t, sx, by + H * 0.05 + u * 0.9, sw, Math.min(W, H) * 0.022, ink, { fontFamily: 'Montserrat', fontWeight: 600, align: 'center', maxLines: 2, lineHeight: 1.25 });
    });
    if (f.date) TX(c, 'Tarih', f.date, W / 2 - sw / 2, by - H * (sigs.length === 2 ? 0.06 : 0.005), sw, Math.min(W, H) * 0.022, ink, { fontFamily: 'Montserrat', fontWeight: 500, align: 'center', maxLines: 1, opacity: 0.8 });
    const sd = Math.min(W, H) * (land ? 0.14 : 0.16);
    if (sigs.length === 2) seal(c, W / 2, by + H * 0.08, sd, f.seal || 'Başarılarının devamını dileriz •', gold, '#FFFFFF', f.icon || 'madalya');
  }
  function cDuyuru(c, f) {
    const { W, H, u, M, mode, P } = c, TH = TH_();
    c.noTex = true; c.noGhost = true; c.artOverlapOk = true;
    const ink = P.d, acc = P.a, wide = mode === 'wide' || mode === 'land';
    c.bg = P.bg;
    const bandH = H * (wide ? 0.26 : 0.3);
    rect(c, 'Üst bant', 0, 0, W, bandH, ink);
    IMG(c, 'Süs · desen', TH.girih ? TH.girih(Math.round(W), Math.round(bandH), 'rgba(255,255,255,0.07)') : TH.mist(Math.round(W), Math.round(bandH), ink, 3), 0, 0, W, bandH, { opacity: 0.9 });
    pth(c, 'Süs · dalga', 'M0 0H100V60C70 100 30 100 0 60Z', 0, bandH - u * 0.5, W, H * 0.05, ink);
    const isz = Math.min(W, H) * (wide ? 0.12 : 0.13);
    IMG(c, 'Simge', TH.icon(f.icon || 'okul', '#FFFFFF'), M, M * 0.8, isz, isz, { fit: 'contain', nw: 400, nh: 400 });
    const tg = TX(c, 'Üst etiket', f.tag || 'DUYURU', M + isz + u * 2, M * 0.8 + isz * 0.12, W - 2 * M - isz - u * 2, Math.min(W, H) * 0.03, acc, { fontFamily: 'Montserrat', fontWeight: 800, uppercase: true, letterSpacing: r1(u * 0.35), maxLines: 1 });
    const tl = TX(c, 'Başlık', f.title, M + isz + u * 2, tg.y + tg.h + u * 0.4, W - 2 * M - isz - u * 2, Math.min(W, H) * (wide ? 0.065 : 0.075), '#FFFFFF', { fontFamily: 'DM Serif Display', maxLines: 2, lineHeight: 1.05, bind: 'product' });
    let y = Math.max(bandH + H * 0.07, tl.y + tl.h + H * 0.07);
    const sb = TX(c, 'Alt başlık', f.sub || '', M, y, W - 2 * M, Math.min(W, H) * 0.034, ink, { fontFamily: 'Montserrat', fontWeight: 500, maxLines: 4, lineHeight: 1.4, bind: 'desc' });
    y = sb.y + sb.h + H * 0.035;
    const rows = f.rows || [];
    const rh = Math.min(W, H) * (wide ? 0.095 : 0.115), cols = wide ? Math.min(3, rows.length) : 1, cw = (W - 2 * M - (cols - 1) * u * 2) / cols;
    rows.forEach(([ic, k, v], i) => {
      const cx = M + (i % cols) * (cw + u * 2), cy = y + Math.floor(i / cols) * (rh + u * 1.6), g = gid();
      rect(c, 'Bilgi kutusu', cx, cy, cw, rh, P.c, { radius: r1(rh * 0.22), group: g });
      const s2 = rh * 0.62; rect(c, 'Simge zemini', cx + rh * 0.19, cy + rh * 0.19, s2, s2, ink, { radius: r1(s2 * 0.3), group: g });
      IMG(c, 'Simge ' + k, TH.icon(ic, '#FFFFFF'), cx + rh * 0.19 + s2 * 0.18, cy + rh * 0.19 + s2 * 0.18, s2 * 0.64, s2 * 0.64, { fit: 'contain', group: g, nw: 400, nh: 400 });
      const tx = cx + rh * 1.0, tw = cw - rh * 1.15;
      TX(c, 'Bilgi başlığı', k, tx, cy + rh * 0.16, tw, rh * 0.22, acc, { fontFamily: 'Montserrat', fontWeight: 800, uppercase: true, letterSpacing: r1(u * 0.2), maxLines: 1, group: g });
      TX(c, 'Bilgi ' + k.toLocaleLowerCase('tr-TR'), v, tx, cy + rh * 0.44, tw, rh * 0.3, ink, { fontFamily: 'Montserrat', fontWeight: 700, maxLines: 1, group: g });
    });
    y += Math.ceil(rows.length / cols) * (rh + u * 1.6) + H * 0.02;
    if (f.note && y < H * 0.86) { const nt = TX(c, 'Not', f.note, M, y, W - 2 * M, Math.min(W, H) * 0.028, ink, { fontFamily: 'Montserrat', fontWeight: 500, italic: true, maxLines: 3, lineHeight: 1.35, opacity: 0.85 }); y = nt.y + nt.h; }
    rect(c, 'Alt bant', 0, H - H * 0.075, W, H * 0.075, ink);
    TX(c, 'Logo', f.logo || 'Okul adı', M, H - H * 0.075 + H * 0.02, W - 2 * M, Math.min(W, H) * 0.028, '#FFFFFF', { fontFamily: 'Montserrat', fontWeight: 700, align: 'center', maxLines: 1, letterSpacing: r1(u * 0.15) });
  }
  Object.assign(ARCH, { cBelge, cDuyuru, cTakip, cTesekkur, cRamazan, cKalp, cNane, cTur, cKumanya, cPaylas, cRanza, cOklu, cHafta, cDuo, cIlim, cIftar, cAsure, cZarif, cIhtida, cSayac, cKazan, cSukur });


  // ---------------------------------------------------------------- ŞABLONLAR (gıda)
  const SIZES = { a4l: [1754, 1240], sq: [1080, 1080], por: [1080, 1350], story: [1080, 1920], wide: [1920, 600], a4: [1240, 1754], ty: [1200, 1800], fb: [1200, 630] };
  const TPL = [
    ['e-basari', 'Başarı belgesi', 'cBelge', 'vakur', ['okul', 'bordo', 'zumrut2'], { icon: 'madalya', title: 'BAŞARI BELGESİ', hi: 'Bu belge', name: 'Ad Soyad', sub: '2026–2027 eğitim öğretim yılında gösterdiği üstün gayret ve başarıdan dolayı verilmiştir.', date: '12 Haziran 2027', sign1: 'Sınıf Öğretmeni', sign2: 'Okul Müdürü' }, 'a4l', 'sertifika belge başarı takdir öğrenci okul', 'Eğitim'],
    ['e-tesekkur', 'Teşekkür belgesi', 'cBelge', 'vakur', ['zumrut2', 'okul', 'bordo'], { icon: 'kalp', title: 'TEŞEKKÜR BELGESİ', hi: 'Sayın', name: 'Ad Soyad', sub: 'Eğitimimize verdiğiniz değerli katkılardan dolayı teşekkür ederiz.', date: '12 Haziran 2027', sign1: 'Okul Müdürü' }, 'a4l', 'sertifika teşekkür belge veli gönüllü', 'Eğitim'],
    ['e-katilim', 'Katılım sertifikası', 'cBelge', 'vakur', ['mavi2', 'okul', 'zumrut2'], { icon: 'kitap', title: 'KATILIM SERTİFİKASI', hi: 'Bu sertifika', name: 'Ad Soyad', sub: 'Hafızlık ve Kur’an-ı Kerim kursunu başarıyla tamamladığı için verilmiştir.', date: '12 Haziran 2027', sign1: 'Eğitmen', sign2: 'Kurum Müdürü' }, 'a4l', 'sertifika katılım kurs seminer', 'Eğitim'],
    ['e-mezuniyet', 'Mezuniyet töreni', 'cDuyuru', 'vakur', ['okul', 'bordo', 'mavi2'], { icon: 'kep', tag: 'Davetlisiniz', title: 'Mezuniyet Töreni', sub: 'Öğrencilerimizin bu güzel gününde sizleri de aramızda görmekten mutluluk duyarız.', rows: [['takvim', 'Tarih', '20 Haziran 2027'], ['saat', 'Saat', '14:00'], ['konum', 'Yer', 'Okul konferans salonu']], note: 'Tören sonrası ikram yapılacaktır.', logo: 'Okul adı' }, 'por', 'mezuniyet tören davet okul', 'Eğitim'],
    ['e-sinav', 'Sınav duyurusu', 'cDuyuru', 'vakur', ['mavi2', 'turuncu2', 'okul'], { icon: 'kalem', tag: 'Sınav duyurusu', title: 'Deneme Sınavı', sub: '8. sınıf öğrencilerimiz için LGS provası niteliğinde deneme sınavı yapılacaktır.', rows: [['takvim', 'Tarih', '15 Aralık 2026 Cumartesi'], ['saat', 'Saat', '10:00 – 12:15'], ['konum', 'Yer', 'Okul sınav salonları']], note: 'Öğrencilerimizin kurşun kalem ve silgi getirmeleri gerekmektedir.', logo: 'Okul adı' }, 'por', 'sınav deneme lgs duyuru', 'Eğitim'],
    ['e-veli', 'Veli toplantısı', 'cDuyuru', 'vakur', ['zumrut2', 'okul', 'mavi2'], { icon: 'insanlar', tag: 'Sayın veli', title: 'Veli Toplantısı', sub: 'Öğrencilerimizin gelişimini birlikte değerlendirmek için toplantımıza katılımınızı rica ederiz.', rows: [['takvim', 'Tarih', '28 Kasım 2026 Cumartesi'], ['saat', 'Saat', '11:00'], ['konum', 'Yer', 'Sınıflar']], note: 'Katılımınız çocuğumuzun başarısı için çok önemlidir.', logo: 'Okul adı' }, 'por', 'veli toplantı duyuru okul', 'Eğitim'],
    ['e-karne', 'Karne günü', 'cDuyuru', 'vakur', ['turuncu2', 'mavi2', 'zumrut2'], { icon: 'kitap', tag: 'Tebrikler', title: 'Karne Günü', sub: 'Bir dönemin emeği karnelere yansıdı. Bütün öğrencilerimizi tebrik eder, iyi tatiller dileriz.', rows: [['takvim', 'Tarih', '23 Ocak 2027 Cuma'], ['saat', 'Saat', '10:00'], ['konum', 'Yer', 'Okul bahçesi']], note: 'Karneler sınıf öğretmenleri tarafından dağıtılacaktır.', logo: 'Okul adı' }, 'sq', 'karne tatil duyuru okul', 'Eğitim'],
    ['b-takip-koli', 'Bağış takibi · koli', 'cTakip', 'vakur', ['lacivert', 'mor', 'zumrut', 'murdum'], { art: 'koli', photo: 'ramazan-gulen', title: 'Hedefimiz 1.000 Koli', sub: 'Her koli bir ailenin bir aylık sofrası. Hedefe birlikte ulaşalım!', progress: { goal: 1000, got: 640, unit: 'koli' }, cta: 'Sen de bir koli ekle' }, 'story', 'takip hedef ilerleme koli sayaç', 'Bağış · Kampanya'],
    ['b-takip-kurban', 'Bağış takibi · hisse', 'cTakip', 'vakur', ['zumrut', 'lacivert', 'turkuaz'], { art: 'koyun', photo: 'kurban-kalabalik', title: 'Kurban Hissesi Hedefimiz', sub: 'Uzak diyarlardaki kardeşlerimize ulaşacak hisseler', progress: { goal: 350, got: 212, unit: 'hisse' }, cta: 'Hisseni ayır' }, 'sq', 'takip hedef hisse kurban', 'Bağış · Kampanya'],
    ['b-tesekkur', 'Teşekkür kartı', 'cTesekkur', 'vakur', ['nane', 'hafta', 'altin'], { art: 'koyun', photo: 'kurban-pencere', tag: 'Teşekkür ederiz', hi: 'Sayın', name: 'Ad Soyad', title: 'Bağışınız Ulaştı', sub: 'Desteğiniz ihtiyaç sahibi ailelere ulaştırıldı. Allah kabul etsin, hayrınızı çoğaltsın.', seal: 'Kurbanın MANA’sı paylaşmaktır! • PAYLAŞ! •' }, 'por', 'teşekkür bağışçı isim kişiye özel', 'Bağış · Kampanya'],
    ['b-kesildi', 'Kurbanınız kesildi', 'cTesekkur', 'vakur', ['nane', 'zumrut', 'altin'], { art: 'koyun', photo: 'sukur-koc', tag: 'Kesim bildirimi', hi: 'Sayın', name: 'Ad Soyad', title: 'Kurbanınız Kesildi', sub: 'Kurbanınız itina ile kesilmiş, etleri ihtiyaç sahiplerine ulaştırılmıştır. Allah kabul etsin.', report: [['Hisse no', '24'], ['Tarih', '27 Mayıs 2026'], ['Yer', 'Panama']] }, 'por', 'kesim rapor bildirim kurban kesildi', 'Bağış · Kampanya'],
    ['b-ramazan-koli', 'Ramazan kolisi · gece', 'cRamazan', 'vakur', ['lacivert', 'mor', 'turkuaz', 'zumrut', 'fusya', 'murdum'], { art: 'koli', photo: 'ramazan-cocuk', title: 'Bir Koli\nMutluluk', sub: 'İftar ve sahur sofrasına bereket getiren yardım kumanyalarıyla siz de ihtiyaç sahibi bir ailenin mutluluğuna vesile olun.' }, 'sq', 'ramazan koli kumanya iftar gece hilal', 'Bağış · Kampanya'],
    ['b-ramazan-kayit', 'Ramazan · kumanya kayıtları', 'cRamazan', 'vakur', ['mor', 'lacivert', 'murdum'], { art: 'koli', photo: 'ramazan-gonullu', title: 'Kumanya\nKayıtlarımız Başladı!', sub: 'Bir ailenin sofrasına misafir olun!' }, 'sq', 'ramazan kumanya kayıt gönüllü', 'Bağış · Kampanya'],
    ['b-ramazan-bereket', 'Ramazan · koli koli bereket', 'cRamazan', 'vakur', ['murdum', 'fusya', 'mor'], { art: 'koli', photo: 'ramazan-gulen', title: 'Koli Koli\nBereket', sub: 'Bu sene de Ramazan bereketini koli koli dağıtmaya kararlıyız… Siz de vesile olanlardan olun!' }, 'sq', 'ramazan bereket koli', 'Bağış · Kampanya'],
    ['b-ramazan-umut', 'Ramazan · umudu taşıyoruz', 'cRamazan', 'vakur', ['zumrut', 'turkuaz', 'lacivert'], { art: 'koli', photo: 'ramazan-kucuk', title: 'Bu Kolide\nUmudu Taşıyoruz', sub: 'Umudumuz, bu Ramazanda da hiç kimse temel gıdalardan mahrum kalmasın!', price: '₺1.500', priceLabel: 'Kumanya bedeli' }, 'story', 'ramazan umut koli story', 'Bağış · Kampanya'],
    ['b-kurban-mesaj', 'Kurban · bi’ mesajla', 'cKalp', 'vakur', ['gokyuzu', 'mavi'], { art: 'koyun', photo: 'kurban-telefon', tag: 'Bi’ Mesajla', title: 'Kurban', script: 'Kesiyoruz', sub: 'Üç Aylar vesilesi ile', sub2: 'hayatının bereketi için bir kurbana da sen vesile ol!' }, 'story', 'kurban mesaj kalp story', 'Bağış · Kampanya'],
    ['b-kurban-vesile', 'Kurban · vesile oluyoruz', 'cKalp', 'vakur', ['gokyuzu', 'mavi'], { art: 'koyun', photo: 'kurban-kecili-kiz', tag: 'Kurbanlarınıza', title: 'VESİLE', script: 'Oluyoruz', sub: 'Alemler, hürmetine yaratılan', sub2: 'Efendimiz (S.A.V.) niyetine Regaib Kandilinde siz de bir kurbana vesile olmak ister misiniz?' }, 'story', 'kurban vesile kandil', 'Bağış · Kampanya'],
    ['b-kurban-kandil', 'Kurban · kandil', 'cKalp', 'vakur', ['mavi', 'gokyuzu'], { art: 'koyun', photo: 'kurban-uc-cocuk', tag: 'Regaib Kandilinde', title: 'KURBAN', script: 'Kesiyoruz', sub: 'Alemler, hürmetine yaratılan', sub2: 'Efendimiz (S.A.V.) niyetine keseceğimiz kurbana katkıda bulunmak ister misiniz?' }, 'story', 'kurban regaib kandil', 'Bağış · Kampanya'],
    ['b-kurban-kalp', 'Kurban · kalp söyler', 'cKalp', 'vakur', ['mavi', 'gokyuzu'], { art: 'koyun', photo: 'kurban-dua', tag: 'KALP SÖYLER', title: 'Kainat', script: 'Dinler!', sub: 'Uzak diyarlarda, ilim talebeleri için ikram edeceğimiz', sub2: 'kurban etine katkıda bulunmak ister misiniz?' }, 'story', 'kurban talebe dua', 'Bağış · Kampanya'],
    ['b-kurban-paylas', 'Kurban · paylaş yakınlaş', 'cNane', 'vakur', ['nane', 'zumrut'], { art: 'koyun', photo: 'kurban-grup', title: 'Kurbanını Paylaş', title2: 'İyiliğe Yakınlaş!', sub: 'Maddenin MANA ile buluştuğu coğrafyalarda;', sub2: 'bir iyiliğe daha vesile olmak, bir gönülde daha yer edinmek, bir kurban ile mümkün!', price: '3250₺', priceLabel: 'Hisse Bedeli' }, 'sq', 'kurban hisse paylaş', 'Bağış · Kampanya'],
    ['b-kurban-firsat', 'Kurban · fırsat bil', 'cNane', 'vakur', ['nane', 'zumrut'], { art: 'koyun', photo: 'kurban-pencere', title: 'Kurbanı Fırsat Bil', title2: 'İyiliğe Fırsat Bul!', sub: 'Maddenin MANA ile buluştuğu coğrafyalarda;', sub2: 'bir iyiliğe daha vesile olmak, bir gönülde daha yer edinmek, bir kurban ile mümkün!', price: '3250₺', priceLabel: 'Hisse Bedeli' }, 'sq', 'kurban fırsat hisse', 'Bağış · Kampanya'],
    ['b-kurban-sayac', 'Kurban · geri sayım', 'cSayac', 'vakur', ['nane', 'zumrut'], { art: 'koyun', photo: 'kurban-kalabalik', title: 'Bir Bilsen!', title2: 'Ne kadar kaldı?', big: '20', tag: 'Kurban\nBayramına', pre: 'son', post: 'gün' }, 'sq', 'kurban geri sayım gün', 'Bağış · Kampanya'],
    ['b-kurban-sukur', 'Şükür kurbanı', 'cSukur', 'vakur', ['nane', 'zumrut'], { art: 'koyun', photo: 'sukur-koc', price: '3500₺', tag: 'Kurban\nBerekettir', title: 'Asli Bir İhtiyaçtır', title2: 'Şükür!', sub: 'Hayatınızı anlamlandıran bir ibadet!', sub2: 'Şükür Kurbanı\nKişinin maruz kaldığı kaza, bela ve felaketlerden kurtulmasına, hastalığının iyileşmesine veya kavuştuğu güzelliklere şükür niyetiyle Allahü Teala adına kesmiş olduğu kurbana denir.' }, 'sq', 'şükür kurbanı', 'Bağış · Kampanya'],
    ['b-kurban-sifa', 'Kurban türü · şifa', 'cTur', 'vakur', ['sifa', 'nafile', 'akika', 'adak'], { art: 'koyun', photo: 'kurban-sifa', title: 'Şifa Kurbanı', sub: '“Maddi ve yahut manevi hastalıklardan kurtulmak, şifa niyetiyle Allah rızası için kesilen kurbana denir. Zira tıbb-ı nebevideki şifa yöntemlerinden biri de bu niyetle kurban kesmektir.”' }, 'story', 'kurban şifa', 'Bağış · Kampanya'],
    ['b-kurban-nafile', 'Kurban türü · nafile', 'cTur', 'vakur', ['nafile', 'sifa', 'akika', 'adak'], { art: 'koyun', photo: 'kurban-nafile', title: 'Nafile Kurban', sub: '“Kesilmesi için herhangi bir mükellefiyet ve mecburiyeti bulunmayan, vacip olmayan kurbanlara nafile kurban denir.”' }, 'story', 'kurban nafile', 'Bağış · Kampanya'],
    ['b-kurban-akika', 'Kurban türü · akika', 'cTur', 'vakur', ['akika', 'sifa', 'nafile', 'adak'], { art: 'koyun', photo: 'kurban-akika', title: 'Akika Kurbanı', sub: '“Akika kurbanı, yeni doğan bir çocuğun dünyaya geldikten sonra yedinci gününde Allah’a şükür niyetiyle kesilen kurbana verilen isimdir.”' }, 'story', 'kurban akika', 'Bağış · Kampanya'],
    ['b-kurban-adak', 'Kurban türü · adak', 'cTur', 'vakur', ['adak', 'sifa', 'nafile', 'akika'], { art: 'koyun', photo: 'kurban-adak', title: 'Adak Kurban', sub: '“Adak kurbanı, bir kişinin Allah’a adak olarak sunduğu bir kurbandır. Bu özel ibadette, adayan kişinin belirli bir niyetle kurban olarak seçtiği sağlıklı bir hayvan kesilir.”' }, 'story', 'kurban adak', 'Bağış · Kampanya'],
    ['b-kumanya', 'Kumanya yardımı', 'cKumanya', 'vakur', ['firca'], { art: 'koli', photo: 'kumanya-gonullu', title: 'Kumanya Yardımı', price: '$50', priceLabel: 'Kumanya\nBedeli', script: 'Yardımlarınız', script2: 'Birer Umut Olsun', hl: 'Umut' }, 'a4', 'kumanya yardım fırça', 'Bağış · Kampanya'],
    ['b-paylastikca', 'Mutluluk paylaştıkça çoğalır', 'cPaylas', 'vakur', ['firca'], { art: 'koli', photo: 'paylas-erzak', title: 'Mutluluk', script: 'Paylaştıkça', script2: 'Çoğalır' }, 'story', 'paylaşmak erzak fırça story', 'Bağış · Kampanya'],
    ['b-ranza', 'Ranza projesi', 'cRanza', 'vakur', ['kum'], { art: 'kitap', photo: 'ranza-cocuklar', tag: 'El Salvador – Orta Amerika', title: 'Ranza Projesi', sub: 'El Salvador’daki öğrencilerimizin daha konforlu ve güvenli bir ortamda eğitim alabilmesi için 20 adet ranzaya ihtiyacımız var.', cta: 'Bu iyiliğe ortak olur musunuz?', items: [['1 Ranza bedeli', '12.500 TL', 'Desteğinizle bir öğrencinin hayatına dokunun.'], ['1 Hisse bedeli', '2.500 TL', 'Küçük bir katkı, büyük bir değişim sağlar.']], script: 'Destekleriniz için teşekkür ederiz.' }, 'sq', 'ranza proje eğitim hisse', 'Bağış · Kampanya'],
    ['b-ranza-sade', 'Ranza projesi · sade', 'cOklu', 'vakur', ['mermer'], { art: 'kitap', photo: 'ranza-yatak', tag: 'El Salvador', title: 'Ranza\nProjesi', items: [['1 Ranza bedeli', '12.500 TL'], ['1 Hisse bedeli', '2500 TL']], sub: 'El Salvador’daki talebelerimiz için 20 adet ranzaya ihtiyaç duymaktayız, sizler de bu hususta talebelerimize yardımcı olmak ister misiniz?' }, 'sq', 'ranza oklu fiyat mermer', 'Bağış · Kampanya'],
    ['b-kandil-mevlid', 'Mevlid Kandili', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Mevlid', script: 'Kandiliniz', tag: 'Mübarek olsun', sub: 'Âlemlere rahmet Peygamber Efendimizin (s.a.v.) dünyaya teşrif ettiği gece', date: '', quote: '“Biz seni ancak âlemlere rahmet olarak gönderdik.” (Enbiyâ, 107)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'mevlid kandil kandili tebrik özel gün', 'Bağış · Kampanya'],
    ['b-kandil-regaip', 'Regaip Kandili', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Regaip', script: 'Kandiliniz', tag: 'Mübarek olsun', sub: 'Üç Ayların ilk kandili; rahmet ve bağışlanma kapılarının açıldığı gece', date: '', quote: '“Allah’ım! Recep ve Şaban’ı bize mübarek kıl ve bizi Ramazan’a ulaştır.” (Taberânî)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'regaip kandil kandili üç aylar tebrik özel gün', 'Bağış · Kampanya'],
    ['b-kandil-mirac', 'Miraç Kandili', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Miraç', script: 'Kandiliniz', tag: 'Mübarek olsun', sub: 'Namazın müminin miracı olarak hediye edildiği mübarek gece', date: '', quote: '“Kulunu bir gece Mescid-i Haram’dan Mescid-i Aksâ’ya yürüten Allah’ın şanı yücedir.” (İsrâ, 1)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'miraç mirac kandil kandili tebrik özel gün', 'Bağış · Kampanya'],
    ['b-kandil-berat', 'Berat Kandili', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Berat', script: 'Kandiliniz', tag: 'Mübarek olsun', sub: 'Af ve mağfiret gecesi; dualarınızda bizleri de unutmayın', date: '', quote: '“Dua, ibadetin özüdür.” (Tirmizî)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'berat kandil kandili tebrik özel gün', 'Bağış · Kampanya'],
    ['b-hafta', 'Hayırlı haftalar', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Hayırlı', script: 'Haftalar', tag: 'Bu hafta', sub: 'Sevgili Peygamber efendimizin kainata teşrifi', date: '(11 Rebiulevvel 1448)', quote: 'Resûlullah Efendimiz sallallâhü aleyhi ve sellem buyurdular: “Kıyamet gününde insanların bana en yakını (şefâatimi en çok hak edeni), bana en çok salevât getirenleridir.” (Sünen-i Tirmizî)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'hayırlı haftalar özel gün', 'Bağış · Kampanya'],
    ['b-cuma', 'Hayırlı Cumalar', 'cHafta', 'vakur', ['hafta'], { art: 'kitap', photo: 'hafta-medine', title: 'Hayırlı', script: 'Cumalar', tag: 'Cuma', sub: 'Cumanız mübarek, dualarınız makbul olsun', date: '', quote: 'Peygamber Efendimiz (s.a.v.) buyurdu: “Üzerine güneş doğan en hayırlı gün cuma günüdür.” (Müslim)', logo: 'UMA', logoSub: 'La Unión Musulmana En El Salvador' }, 'a4', 'hayırlı cumalar cuma özel gün hadis', 'Bağış · Kampanya'],
    ['b-talebe', 'Talebe-i ulûm', 'cDuo', 'vakur', ['duo'], { art: 'kitap', photo: 'talebe-sinif', title: 'Talebe-i Ulûm', script: 'El Salvador', quote: '‘Bir milletin ıslahı; kötülerin imhasıyla değil, yeni neslin eğitim ve terbiyesiyle mümkündür.’', sub2: '“Bir talebenin yetişmesinde nice emek ve fedakârlık var. Siz de Orta Amerika’da ilim tahsil eden bir talebenin yetişmesine katkıda bulunabilirsiniz.”' }, 'story', 'talebe eğitim çift ton', 'Bağış · Kampanya'],
    ['b-talebe-hadis', 'Talebe · hadis', 'cDuo', 'vakur', ['duo'], { art: 'kitap', photo: 'talebe-namaz', title: '‘Sizin en hayırlınız Kur’an-ı öğrenen ve öğretenizdir’', quote: '(Buhârî, Fezâilü’l-Kur’ân, 21)', sub2: '“Bir talebenin yetişmesinde nice emek ve fedakârlık var. Siz de Orta Amerika’da ilim tahsil eden bir talebenin yetişmesine katkıda bulunabilirsiniz.”' }, 'story', 'hadis talebe', 'Bağış · Kampanya'],
    ['b-ilim', 'İlim yuvasına destek', 'cIlim', 'vakur', ['ilim'], { art: 'kitap', photo: 'ilim-yuvasi', script: '“İlimle Daha Aydınlık Yarınlara”', title: 'Bir İlim Yuvasına', title2: 'Siz de Destek Olun', sub: 'Orta Amerika’da ilim tahsil eden talebelerimizin eğitim gördüğü kursumuzun aylık kira bedeli 2.000 USD’dir. Bir veya birden fazla destek hissesiyle katkıda bulunabilirsiniz.', items: [['Aylık Kira Bedeli', '2.000 USD'], ['1 Destek Hissesi', '100 USD']], cta: 'Kurs Kirasına Destek', quote: '“Hayra vesile olan, hayrı yapan gibidir.”', src: 'Hadîs-i Şerîf — Tirmizi, İlim, 14', logo: 'UMA' }, 'story', 'ilim kira destek hisse', 'Bağış · Kampanya'],
    ['b-iftar', 'İftar hissesi', 'cIftar', 'vakur', ['iftar'], { art: 'koli', photo: 'iftar-koy', tag: 'Ramazanı Şerif başlangıcı', date: '19/02', place: 'Panama', logo: 'CALMA', title: 'İhtidadan\nTekamüle', quote: 'Peygamber Efendimiz sallallâhü aleyhi ve sellem buyurdular: “Allah Azze ve Celle’nin, senin iki elin vasıtasıyla bir kişiye hidâyet etmesi, senin için, üzerine güneşin doğup battığı her şeyden hayırlıdır.” (Taberânî)', sub: 'İslam şerefiyle müşerref olmuş talebelerimizin ilk Ramazan’ı şeriflerinde onlara iftar ikramında bulunmak ister misiniz?', items: [['1 Hisse bedeli', '4500 TL'], ['1 İftar bedeli', '18000 TL']] }, 'sq', 'iftar hisse ramazan', 'Bağış · Kampanya'],
    ['b-asure', 'Aşure · hicri yılbaşı', 'cAsure', 'vakur', ['asure'], { art: 'asure', photo: 'asure-masa', title: 'Hicri Yeni Yılımız', title2: 'Mübarek Olsun', sub: 'Panama’da bu sene 5000 aşure insanların hidayetine vesile olacak; sizler de bir kase aşure ikram etmek ister misiniz?', price: '150 TL', priceLabel: '1 Aşure ücreti' }, 'sq', 'aşure hicri yıl', 'Bağış · Kampanya'],
    ['b-asure-zarif', 'Aşure · zarif', 'cZarif', 'vakur', ['altin'], { art: 'asure', photo: 'asure-kase', title: 'Panama Hisar Ancon', quote: '“Kim ki Aşura Günü\nZerre miktar ile tasadduk ederse\nHz. Allah ona uhud dağı kadar sevap yazar', feats: ['Nuh (a.s) büyük Tufan’dan sonra karaya ayak bastığında elinde kalan son malzemelerle bu tatlıyı yapmıştır', 'Temel olarak su, buğday, nohut, şeker, fasulye, pirinç kullanılarak yapılır', 'Ceviz, çam fıstığı, badem, nar, susam ve tarçın gibi kuruyemiş ve baharatlar ile süslenir'], title2: 'Sizin Adınıza\nBiz Aşure Dağıtabiliriz', sub: 'Hicri Yılınızı ve Muharrem-i Şerif Ayınızı tebrik ederiz. Aşura Günü hasebiyle talebelerimize ve yardıma muhtaç ailelere aşure pişirilip sizin veya geçmişleriniz adına ikram edilecektir.' }, 'story', 'aşure zarif altın', 'Bağış · Kampanya'],
    ['b-ihtida', 'İhtidadan İstanbul’a', 'cIhtida', 'vakur', ['ihtida'], { art: 'kitap', photo: 'ihtida-talebeler', title: 'İhtidadan', title2: 'İstanbul’a', quote: '"Kim bir Mü’mini ilim öğrenmesi için desteklerse, kıyamet günü amel defterine, akan bir nehir kadar sevap yazılır."', src: 'Taberânî, el-Mu‘cemü’l-Evsat', items: [['1 Talebe uçak bileti', '$1000'], ['1 Talebe cep harçlığı', '$100'], ['1 Hisse uçak bileti', '$100']] }, 'a4', 'ihtida uçak bileti talebe', 'Bağış · Kampanya'],
    ['b-asure-kazan', 'Aşure kazanları', 'cKazan', 'vakur', ['kazan'], { art: 'asure', photo: 'asure-ikram', title: 'Dünyanın Dört Bir Yerinde\nAşure Kazanlarımız Kaynıyor,', script: 'Siz de ikram etmek ister misiniz?', big: '40.000 adet' }, 'sq', 'aşure kazan ikram', 'Bağış · Kampanya'],
    // id, ad, arketip, stil, paletler, içerik, varsayılan ölçü, etiketler
    ['g-burger-sokak', 'Burger · sokak lezzeti', 'hero', 'sokak', ['sokak', 'domates', 'gece'], { art: 'burger', tag: 'Yeni menü', title: 'Duble Cheeseburger', sub: 'Odun ateşinde 180 g dana köfte, çedar, karamelize soğan', price: '₺249', old: '₺299', discount: '%20', cta: 'Hemen sipariş ver' }, 'sq', 'burger fast food hamburger'],
    ['g-burger-split', 'Burger · ikiye bölünmüş', 'split', 'modern', ['domates', 'sokak', 'kahve'], { art: 'burger', tag: 'Haftanın burgeri', title: 'Smash Burger', sub: 'Çıtır kenarlı iki köfte, özel sos, turşu', price: '₺219,90', cta: 'Sipariş ver', script: 'ateşte pişti' }, 'por', 'burger'],
    ['g-burger-gece', 'Burger · koyu sahne', 'scene', 'sokak', ['gece', 'bordo'], { art: 'burger', tag: 'Gece menüsü', title: 'Gece Acıkanlara', sub: '23:00 – 03:00 arası kapına gelsin', price: '₺199', cta: 'Hemen ara' }, 'story', 'burger gece'],
    ['g-burger-kampanya', 'Burger · 2 al 1 öde', 'offer', 'sokak', ['domates', 'sokak'], { art: 'burger', tag: 'Sadece bu hafta', big: '2 AL\n1 ÖDE', title: 'Tüm burgerlerde', sub: 'Pazartesi – Çarşamba, paket serviste de geçerli', cta: 'Hemen sipariş ver' }, 'sq', 'burger kampanya indirim'],
    ['g-pizza-tabak', 'Pizza · tabak', 'plate', 'rustik', ['domates', 'krem', 'zeytin'], { art: 'pizza', script: 'taş fırından', title: 'Napoli Pizza', sub: 'Elle açılmış hamur, San Marzano domates, taze mozzarella', price: '₺289', discount: '%15' }, 'sq', 'pizza italyan'],
    ['g-pizza-hero', 'Pizza · eğlenceli', 'hero', 'eglenceli', ['sokak', 'domates', 'limon'], { art: 'pizza', tag: 'Paket serviste', title: 'Bol Malzemeli Pizza', sub: 'Sucuk, mantar, biber, zeytin, kaşar', price: '₺259', old: '₺320', discount: '%20', cta: 'Sipariş ver' }, 'por', 'pizza'],
    ['g-pizza-menu', 'Pizza menüsü', 'menu', 'rustik', ['krem', 'domates', 'gece'], { art: 'pizza', tag: 'Taş fırın', title: 'Pizza Menüsü', items: [['Margherita', '₺220', 'Domates, mozzarella, fesleğen'], ['Pepperoni', '₺260', 'Acılı dana pepperoni, mozzarella'], ['Dört Peynir', '₺275', 'Mozzarella, gorgonzola, parmesan, kaşar'], ['Sebzeli', '₺240', 'Mantar, biber, zeytin, mısır'], ['Sucuklu', '₺255', 'Kasap sucuk, kaşar, közlenmiş biber']], note: 'Afiyet olsun' }, 'a4', 'pizza menü fiyat listesi'],
    ['g-kahve-minimal', 'Kahve · minimal', 'hero', 'minimal', ['kahve', 'krem', 'gece'], { art: 'coffee', tag: 'Günün kahvesi', title: 'Flat White', sub: 'Çift shot espresso, ipeksi süt köpüğü', price: '₺95', cta: 'Hemen gel' }, 'sq', 'kahve kafe espresso'],
    ['g-kahve-split', 'Kahve · ikiye bölünmüş', 'split', 'luks', ['kahve', 'gece', 'orman'], { art: 'coffee', tag: 'Kahve molası', title: 'Sabahın İlk Fincanı', sub: 'Taze kavrulmuş çekirdekler, her sabah 07:30’dan itibaren', price: '₺85', cta: 'Menüyü gör', script: 'taze kavrum' }, 'por', 'kahve kafe'],
    ['g-kahve-gece', 'Kahve · koyu sahne', 'scene', 'luks', ['gece', 'orman', 'bordo'], { art: 'coffee', tag: 'Özel harman', title: 'Etiyopya Yirgacheffe', sub: 'Yasemin, bergamot ve limon notaları', price: '₺120', cta: 'Tadına bak' }, 'story', 'kahve özel harman'],
    ['g-kahve-menu', 'Kahve menüsü', 'menu', 'minimal', ['krem', 'kahve', 'gece'], { art: 'coffee', tag: 'Kahve barı', title: 'Kahveler', items: [['Espresso', '₺60'], ['Americano', '₺75'], ['Flat White', '₺95'], ['Latte', '₺95'], ['Cortado', '₺85'], ['Filtre Kahve', '₺70']], note: 'Süt seçenekleri: yulaf, badem' }, 'por', 'kahve menü fiyat listesi'],
    ['g-kahve-kampanya', 'Kahve · ikincisi indirimli', 'offer', 'eglenceli', ['kahve', 'pembe', 'limon'], { art: 'coffee', tag: 'Arkadaşını getir', big: '%50', title: 'İkinci kahve yarı fiyatına', sub: 'Hafta içi 14:00 – 17:00 arası', cta: 'Hemen gel' }, 'sq', 'kahve kampanya indirim'],
    ['g-tatli-hero', 'Tatlı · eğlenceli', 'hero', 'eglenceli', ['pembe', 'krem', 'deniz'], { art: 'cake', tag: 'Yeni tatlı', title: 'Frambuazlı Cheesecake', sub: 'Kremsi, hafif, taze frambuaz soslu', price: '₺145', discount: 'YENİ', cta: 'Hemen sipariş ver' }, 'por', 'tatlı pasta cheesecake'],
    ['g-tatli-luks', 'Tatlı · lüks', 'scene', 'luks', ['bordo', 'gece'], { art: 'cake', tag: 'Şefin önerisi', title: 'New York Cheesecake', sub: 'Orman meyveleri sosu ile', price: '₺165', cta: 'Rezervasyon' }, 'sq', 'tatlı pasta lüks'],
    ['g-tatli-split', 'Pastane · ikiye bölünmüş', 'split', 'eglenceli', ['pembe', 'limon', 'deniz'], { art: 'cake', tag: 'Pastaneden', title: 'Günün Tatlısı', sub: 'Her sabah taze, sınırlı sayıda', price: '₺120', cta: 'Ayırt', script: 'ev yapımı' }, 'story', 'pastane tatlı'],
    ['g-kahvalti-tabak', 'Kahvaltı · tabak', 'plate', 'rustik', ['krem', 'zeytin', 'domates'], { art: 'breakfast', script: 'hafta sonu', title: 'Serpme Kahvaltı', sub: 'Köy yumurtası, yerel peynirler, bal-kaymak, sınırsız çay', price: '₺450' }, 'por', 'kahvaltı brunch'],
    ['g-kahvalti-menu', 'Kahvaltı menüsü', 'menu', 'rustik', ['krem', 'zeytin', 'orman'], { art: 'breakfast', tag: '08:00 – 14:00', title: 'Kahvaltı', items: [['Serpme kahvaltı (2 kişilik)', '₺850', 'Sınırsız çay ile'], ['Kahvaltı tabağı', '₺380', 'Peynir, zeytin, domates, yumurta'], ['Menemen', '₺180', 'Köy domatesi, sivri biber'], ['Sucuklu yumurta', '₺210', 'Bakır sahanda'], ['Gözleme', '₺160', 'Peynirli, patatesli, ıspanaklı']], note: 'Çay bizden' }, 'a4', 'kahvaltı menü'],
    ['g-simit', 'Fırın · simit', 'hero', 'rustik', ['krem', 'kahve', 'domates'], { art: 'simit', tag: 'Fırından yeni çıktı', title: 'Çıtır Simit', sub: 'Pekmezli, bol susamlı, her saat başı sıcak', price: '₺15', cta: 'Uğra, al' }, 'sq', 'fırın simit ekmek'],
    ['g-kruvasan', 'Fırın · kruvasan', 'split', 'minimal', ['krem', 'kahve', 'limon'], { art: 'croissant', tag: 'Fransız fırını', title: 'Tereyağlı Kruvasan', sub: '27 kat, %82 tereyağı, her sabah taze', price: '₺75', cta: 'Kahveyle al', script: 'günaydın' }, 'sq', 'fırın kruvasan'],
    ['g-firin-menu', 'Fırın menüsü', 'menu', 'minimal', ['krem', 'kahve', 'zeytin'], { art: 'croissant', tag: 'Her sabah taze', title: 'Fırın', items: [['Simit', '₺15'], ['Açma', '₺20'], ['Poğaça', '₺22'], ['Tereyağlı kruvasan', '₺75'], ['Ekşi maya ekmek', '₺90'], ['Tarçınlı çörek', '₺65']] }, 'por', 'fırın menü'],
    ['g-salata', 'Salata · tabak', 'plate', 'minimal', ['taze', 'krem', 'limon'], { art: 'salad', script: 'hafif ve taze', title: 'Akdeniz Salatası', sub: 'Mevsim yeşillikleri, çeri domates, beyaz peynir, zeytinyağı', price: '₺185' }, 'sq', 'salata sağlıklı vegan'],
    ['g-salata-split', 'Sağlıklı · ikiye bölünmüş', 'split', 'modern', ['taze', 'limon', 'deniz'], { art: 'salad', tag: 'Fit menü', title: 'Günün Bowl’u', sub: '450 kalori, 32 g protein', price: '₺210', cta: 'Sipariş ver', script: 'taze ve hafif' }, 'por', 'salata sağlıklı fit'],
    ['g-zeytinyagi', 'Zeytinyağı · pazar yeri', 'pack', 'luks', ['zeytin', 'orman', 'gece'], { art: 'oil', tag: 'Erken hasat', title: 'Natürel Sızma Zeytinyağı', feats: ['Soğuk sıkım', '1 L cam şişe', 'Asit < %0,5'], price: '₺389', old: '₺459', discount: '%15' }, 'ty', 'zeytinyağı yöresel pazar yeri'],
    ['g-zeytinyagi-hero', 'Zeytinyağı · rustik', 'hero', 'rustik', ['zeytin', 'krem', 'orman'], { art: 'oil', tag: 'Ayvalık’tan', title: 'Erken Hasat Zeytinyağı', sub: 'Elle toplanan zeytinlerden, aynı gün sıkım', price: '₺389', cta: 'Hemen sipariş ver' }, 'por', 'zeytinyağı yöresel'],
    ['g-bal', 'Bal · pazar yeri', 'pack', 'rustik', ['kahve', 'limon', 'krem'], { art: 'honey', tag: 'Yayla balı', title: 'Süzme Çiçek Balı', feats: ['850 g', 'Katkısız', 'Analizli'], price: '₺520', discount: 'YENİ' }, 'sq', 'bal yöresel pazar yeri'],
    ['g-bal-koyu', 'Bal · koyu', 'pack', 'luks', ['gece', 'orman'], { art: 'honey', tag: 'Kestane balı', title: 'Karadeniz Kestane Balı', feats: ['500 g', 'Ham bal', 'Cam kavanoz'], price: '₺640', dark: true }, 'sq', 'bal yöresel lüks'],
    ['g-dondurma', 'Dondurma · eğlenceli', 'hero', 'eglenceli', ['deniz', 'pembe', 'limon'], { art: 'icecream', tag: 'Yaz geldi', title: 'Maraş Dondurması', sub: 'Keçi sütü, salep, gerçek meyve', price: '₺40', discount: '2+1', cta: 'Hemen gel' }, 'story', 'dondurma yaz tatlı'],
    ['g-dondurma-kampanya', 'Dondurma · kampanya', 'offer', 'eglenceli', ['pembe', 'deniz'], { art: 'icecream', tag: 'Sıcak günlere', big: '3 TOP\n₺99', title: 'Dilediğin üç tat', sub: 'Külah ya da kap, tüm şubelerde', cta: 'Hemen gel' }, 'por', 'dondurma kampanya'],
    ['g-corba', 'Çorba · tabak', 'plate', 'rustik', ['krem', 'domates', 'orman'], { art: 'soup', script: 'günün çorbası', title: 'Süzme Mercimek', sub: 'Tereyağlı pul biberli, limon ve kıtır ekmek ile', price: '₺95' }, 'por', 'çorba lokanta günün menüsü'],
    ['g-limonata', 'Limonata · ikiye bölünmüş', 'split', 'eglenceli', ['limon', 'deniz', 'taze'], { art: 'lemonade', tag: 'Ev yapımı', title: 'Naneli Limonata', sub: 'Taze sıkım limon, nane, az şeker', price: '₺65', cta: 'Serinle', script: 'buz gibi' }, 'sq', 'limonata içecek yaz'],
    ['g-icecek-gece', 'İçecek · koyu sahne', 'scene', 'modern', ['orman', 'gece'], { art: 'lemonade', tag: 'Yaz menüsü', title: 'Serinleten Lezzetler', sub: 'Limonata, ice latte, smoothie', price: '₺65', cta: 'Menüyü gör' }, 'wide', 'içecek banner'],
    ['g-gunun-menusu', 'Günün menüsü', 'menu', 'modern', ['domates', 'krem', 'taze'], { art: 'soup', tag: 'Bugün', title: 'Günün Menüsü', items: [['Mercimek çorbası', '₺95'], ['Izgara köfte', '₺290', 'Piyaz ve közlenmiş biber ile'], ['Tavuk sote', '₺240', 'Pilav ile'], ['Zeytinyağlı fasulye', '₺160'], ['Sütlaç', '₺110', 'Fırında']], note: 'Paket servis için arayın' }, 'por', 'günün menüsü lokanta'],
    ['g-paket-servis', 'Paket servis', 'offer', 'sokak', ['sokak', 'domates', 'taze'], { art: 'pizza', tag: 'Kapında 30 dakikada', big: 'ÜCRETSİZ\nTESLİMAT', title: '₺300 üzeri siparişlerde', sub: 'Telefonla ya da WhatsApp’tan sipariş ver', cta: '0 (555) 000 00 00' }, 'story', 'paket servis teslimat sipariş'],
    ['g-acilis', 'Açılış · indirim', 'offer', 'luks', ['bordo', 'orman', 'gece'], { art: 'cake', tag: 'Kapılarımızı açıyoruz', big: '%30', title: 'Açılışa özel indirim', sub: 'İlk hafta tüm menüde', cta: 'Rezervasyon yap' }, 'sq', 'açılış restoran kafe indirim'],
    ['g-banner-burger', 'Web banner · burger', 'hero', 'sokak', ['sokak', 'domates'], { art: 'burger', tag: 'Online sipariş', title: 'Burgerler Kapında', sub: 'İlk siparişe %20 indirim', price: '₺199', discount: '%20', cta: 'Sipariş ver' }, 'wide', 'banner web burger'],
    ['g-cerceve-gece', 'Çerçeve · koyu', 'frame', 'luks', ['lacivert', 'gece', 'bordo'], { art: 'burger', script: 'Lezzetin en güzeli', title: 'Çıtır Tavuk Tabağı', sub: 'Çıtır panko kaplama, üç çeşit sos ve taze lahana', price: '₺289', cta: 'Sipariş ver' }, 'sq', 'koyu çerçeve zarif el yazısı'],
    ['g-cerceve-tatli', 'Çerçeve · tatlı', 'frame', 'luks', ['bordo', 'mor', 'gece'], { art: 'cake', script: 'şefin önerisi', title: 'Frambuazlı Cheesecake', sub: 'Kremsi doku, taze frambuaz sosu', price: '₺165', discount: '%15' }, 'por', 'tatlı zarif koyu'],
    ['g-retro-burger', 'Retro bloklar · burger', 'retro', 'modern', ['retro', 'sokak'], { art: 'burger', tag: 'Hemen dene!', title: 'Yeni Menümüz', sub: 'Çift köfte, eriyen cheddar, ev yapımı sos', price: '₺229', script: 'Lezzeti hisset' }, 'sq', 'retro blok renkli eğlenceli'],
    ['g-retro-kahve', 'Retro bloklar · kahve', 'retro', 'modern', ['retro', 'kahve'], { art: 'coffee', tag: 'Kahve molası!', title: 'Soğuk Kahve Sezonu', sub: 'Cold brew, ice latte, frappe', price: '₺95', script: 'Serinle' }, 'por', 'retro kahve blok'],
    ['g-desen-salata', 'Çizim desenli · salata', 'doodle', 'sokak', ['hardal', 'taze'], { art: 'salad', tag: 'Fit menü', script: 'sağlıklı lezzet', title: 'Kapına Sağlıklı Yemek', sub: 'Her gün taze hazırlanır, aynı gün teslim', price: '₺185', discount: '%45' }, 'story', 'desen çizim hardal sağlıklı'],
    ['g-desen-kahvalti', 'Çizim desenli · kahvaltı', 'doodle', 'sokak', ['hardal', 'domates', 'taze'], { art: 'breakfast', script: 'hafta sonu', title: 'Eve Kahvaltı Servisi', sub: 'Sıcak simit, peynir tabağı, sınırsız çay', price: '₺450', discount: '%20' }, 'sq', 'desen kahvaltı paket'],
    ['g-afis-bowl', 'Dev yazı · bowl', 'poster', 'modern', ['retro', 'domates'], { art: 'salad', tag: 'Her gün taze', title: 'Bowl Sezonu Başladı', script: 'taze ve hafif', sub: 'Bowl çeşitleri ₺185’ten başlayan fiyatlarla', price: '₺185', cta: 'Sipariş ver', discount: 'YENİ' }, 'sq', 'dev yazı afiş tipografi'],
    ['g-afis-pizza', 'Dev yazı · pizza', 'poster', 'modern', ['retro', 'sokak'], { art: 'pizza', tag: 'Taş fırın', title: 'Pizza Gecesi', script: 'ikincisi yarı fiyatına', sub: 'Her cuma 18:00 – 23:00', price: '₺220', cta: 'Hemen sipariş', discount: '%50' }, 'por', 'dev yazı pizza'],
    ['g-kavis-kahve', 'Kavisli · kahve', 'curve', 'modern', ['kahve', 'krem', 'gece'], { art: 'coffee', script: 'Güne enerjik başla', title: 'Kahve Menüsü', sub: 'Taze kavrulmuş çekirdek, özenle demlendi', items: [['Latte', '₺90'], ['Americano', '₺75'], ['Mocha', '₺95']], price: '₺75' }, 'por', 'kavis kahve menü fiyat listesi'],
    ['g-kavis-bal', 'Kavisli · bal', 'curve', 'rustik', ['kahve', 'limon'], { art: 'honey', script: 'yayladan sofraya', title: 'Doğal Çiçek Balı', sub: 'Katkısız, analizli, cam kavanozda', feats: ['850 g kavanoz', 'Analiz raporlu', 'Ücretsiz kargo'], price: '₺450' }, 'story', 'kavis bal'],
    ['g-serit-zeytin', 'Köşegen şerit · zeytinyağı', 'band', 'modern', ['zeytin', 'limon'], { art: 'oil', tag: 'Neden biz?', script: 'Ege’den', title: 'Erken Hasat Zeytinyağı', sub: 'Kendi bahçemizden, elle toplanan zeytinlerden soğuk sıkım. Düşük asit, yoğun aroma.', feats: ['Soğuk sıkım', 'Asit %0,3', 'Cam şişe 1 L'], price: '₺389', old: '₺450' }, 'a4', 'kurumsal el ilanı köşegen a4'],
    ['g-serit-firin', 'Köşegen şerit · fırın', 'band', 'modern', ['krem', 'kahve', 'limon'], { art: 'croissant', tag: 'Hizmetlerimiz', script: 'her sabah', title: 'Toptan Unlu Mamul', sub: 'Kafe ve otellere her sabah taze teslimat. Simit, poğaça, kruvasan ve ekmek çeşitleri.', feats: ['Sabah 06:00 teslim', 'Toptan fiyat', 'Günlük üretim'], price: '₺15' }, 'por', 'kurumsal toptan'],
    ['g-banner-kahve', 'Web banner · kahve', 'split', 'minimal', ['kahve', 'krem'], { art: 'coffee', tag: 'Kahve aboneliği', title: 'Her ay taze çekirdek', sub: 'Kargo ücretsiz, istediğin zaman iptal', price: '₺349', cta: 'Abone ol' }, 'wide', 'banner web kahve'],
  ];
  const DECO = /^(Süs|Tabak gölgesi|Spot ışık|Alt karartma|Renk paneli|Podyum|Ayraç)/;
  function problems(c) {
    const { W, H, M } = c, ts = c.L.filter((l) => l.type === 'text' && l.visible !== false && !DECO.test(l.name || ''));
    let bad = 0;
    ts.forEach((l) => { if (l.y < -1 || l.y + l.h > H - M * 0.2 || l.x < -1 || l.x + l.w > W + 1) bad++; });
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j]; if (a.group && a.group === b.group) continue;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h * 0.9, b.y + b.h * 0.9) - Math.max(a.y + a.h * 0.1, b.y + b.h * 0.1);
      if (ox > 2 && oy > 2) bad++;
    }
    if (!c.artOverlapOk) c.L.filter((l) => l.role === 'photo').forEach((a) => {
      const ax = a.x + a.w * 0.16, ay = a.y + a.h * 0.16, aw = a.w * 0.68, ah = a.h * 0.68;
      ts.forEach((l) => { if (l.group && /Rozet|İndirim/.test(l.name)) return; const ox = Math.min(l.x + l.w, ax + aw) - Math.max(l.x, ax), oy = Math.min(l.y + l.h, ay + ah) - Math.max(l.y, ay); if (ox > l.fontSize && oy > l.fontSize * 0.4) bad++; });
    });
    const rs = c.L.filter((l) => l.type !== 'text' && !DECO.test(l.name || '') && l.role !== 'photo' && !/Rozet/.test(l.name || ''));
    rs.forEach((l) => { if (l.y + l.h > H + 1 && l.h < H * 0.5) bad++; });
    // buton / çip zemini başka bir yazının üstüne binmesin
    rs.filter((r) => /Buton zemini|Özellik zemini/.test(r.name || '')).forEach((r) => ts.forEach((l) => { if (l.group && l.group === r.group) return; if (/Özellik/.test(l.name) && /Özellik zemini/.test(r.name)) return; const ox = Math.min(l.x + l.w, r.x + r.w) - Math.max(l.x, r.x), oy = Math.min(l.y + l.h, r.y + r.h) - Math.max(l.y, r.y); if (ox > 2 && oy > 2) bad++; }));
    c.L.filter((l) => l.name === 'Rozet').forEach((rz) => ts.forEach((t) => { if (t.group === rz.group) return; const x = rz.x + rz.w * 0.1, y = rz.y + rz.h * 0.1, w = rz.w * 0.8, h = rz.h * 0.8; const ox = Math.min(x + w, t.x + t.w) - Math.max(x, t.x), oy = Math.min(y + h, t.y + t.h) - Math.max(y, t.y); if (ox > 2 && oy > 2) bad++; }));
    return bad;
  }
  // ---------------------------------------------------------------- tema: doku, ışık, arka plan kelimesi, ürünün çevresinde süsler
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  function enrich(c) {
    const TH = window.FoodTheme; if (!TH || c.plain) return;
    const { W, H, u, P, mode } = c, cat = TH.CATS[c.cat] || TH.CATS.genel, rnd = hash(c.tid + c.cat + W + 'x' + H);
    const bg = typeof c.bg === 'string' ? c.bg : P.bg, dark = lum(bg) < 0.32;
    const photo = c.L.find((l) => l.role === 'photo');
    const texts = c.L.filter((l) => l.type === 'text' && !DECO.test(l.name || ''));
    const solid = c.L.filter((l) => /Buton zemini|Özellik zemini|Fiyat zemini/.test(l.name || ''));
    const IMG = (name, src, x, y, w, h, o = {}) => Object.assign({ type: 'image', name, src, nw: Math.max(1, Math.round(w)), nh: Math.max(1, Math.round(h)), fit: 'fill', x: r1(x), y: r1(y), w: r1(w), h: r1(h), visible: true, opacity: 1, rotation: 0, filters: {} }, o);
    const under = [], over = [];
    // 1) zemin dokusu ve ışık (stile göre)
    const st = c.style, scene = c.artOverlapOk;
    const tex = (k, op, c1, o = {}) => under.push(IMG('Süs · doku', TH.texture(k, Math.round(W), Math.round(H), c1, null, 3 + (rnd() * 9 | 0)), 0, 0, W, H, Object.assign({ opacity: op, locked: false }, o)));
    if (c.noTex) {}
    else if (scene) { tex('rays', 0.35, mixHex(P.c, '#FFFFFF', 0.25)); tex('bokeh', 0.9, P.a); }
    else if (st === 'sokak') { tex('rays', dark ? 0.25 : 0.55, '#FFFFFF'); tex('halftone', 0.16, dark ? '#FFFFFF' : P.ink); }
    else if (st === 'rustik') tex('paper', dark ? 0.35 : 0.55, '#FFFFFF');
    else if (st === 'luks') tex(dark ? 'marble' : 'paper', dark ? 0.45 : 0.5, '#FFFFFF');
    else if (st === 'eglenceli') tex('bokeh', 0.8, '#FFFFFF');
    else if (st === 'modern') tex('stripes', dark ? 0.05 : 0.06, dark ? '#FFFFFF' : P.ink);
    // 2) arka plan kelimesi (ürünün arkasında, çok soluk)
    if (photo && cat.g && st !== 'minimal' && mode !== 'wide' && !c.noGhost) {
      const word = cat.g, fam = c.st.head[0], fw = Math.max(700, c.st.head[1]);
      const probe = { type: 'text', text: word, fontFamily: fam, fontWeight: fw, fontSize: 100, uppercase: true, letterSpacing: st === 'luks' ? 12 : -2 };
      const wpx = R.measure(word, probe) || 300, fs = Math.min(((W * 0.96) / wpx) * 100, photo.h * 0.62);
      const gw = c.add({ type: 'text', name: 'Süs · arka yazı', text: word, x: 0, y: 0, w: W, h: fs, fontSize: r1(fs), fontFamily: fam, fontWeight: fw, uppercase: true, letterSpacing: r1(probe.letterSpacing * fs / 100), lineHeight: 0.9, align: 'center', fill: dark ? '#FFFFFF' : P.ink, opacity: dark ? 0.07 : 0.06 });
      R.layoutText(gw); gw.y = r1(photo.y + photo.h * 0.5 - gw.h * 0.55);
      c.L.splice(c.L.indexOf(gw), 1); under.push(gw);
    }
    // 3) ürünün arkasında ışık halesi ve temas gölgesi
    if (photo && !c.charity) {
      const s = Math.max(photo.w, photo.h), cx = photo.x + photo.w / 2, cy = photo.y + photo.h / 2;
      const halo = dark ? mixHex(P.a, '#FFFFFF', 0.35) : '#FFFFFF';
      under.push(IMG('Süs · ışık', TH.texture('glow', 400, 400, halo), cx - s * 0.8, cy - s * 0.8, s * 1.6, s * 1.6, { opacity: dark ? 0.35 : st === 'minimal' ? 0.55 : 0.75 }));
      if (st === 'eglenceli' && !scene) under.push(IMG('Süs · leke', TH.texture('splash', 400, 400, mixHex(P.a, bg, 0.72)), cx - s * 0.62, cy - s * 0.6, s * 1.24, s * 1.2, { opacity: 1, rotation: Math.round(rnd() * 40 - 20) }));
      const sh = TH.enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".6" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="10" rx="50" ry="10" fill="url(#g)"/></svg>`);
      if (!/Tabak gölgesi/.test(c.L.map((l) => l.name).join('|'))) c.L.splice(c.L.indexOf(photo), 0, IMG('Temas gölgesi', sh, cx - photo.w * 0.4, photo.y + photo.h * 0.86, photo.w * 0.8, photo.h * 0.12, { opacity: dark ? 0.9 : 0.6 }));
    }
    // 4) serpiştirilmiş süsler
    if (photo && cat.m && cat.m.length) {
      const busy = texts.concat(solid).map((l) => ({ x: l.x - u * 1.2, y: l.y - u * 1.2, w: l.w + u * 2.4, h: l.h + u * 2.4 }));
      const hit = (x, y, w, h) => busy.some((b) => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
      const placed = [];
      const free = (x, y, s) => !hit(x, y, s, s) && x > -s * 0.35 && y > -s * 0.35 && x + s < W + s * 0.35 && y + s < H + s * 0.35 && !placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.s + s) * 0.55);
      const S = Math.max(photo.w, photo.h), cx = photo.x + photo.w / 2, cy = photo.y + photo.h / 2;
      const n = c.noTex ? 5 : mode === 'wide' ? 6 : 9, a0 = rnd() * Math.PI * 2;
      const pi = c.L.indexOf(photo);
      for (let i = 0; i < n; i++) {
        const [key, variant] = cat.m[i % cat.m.length];
        const src = TH.sprite(key, variant); if (!src) continue;
        let ok = false, x = 0, y = 0, s = S * (0.07 + rnd() * 0.08) * (key === 'sesame' || key === 'sprinkle' || key === 'pepper' ? 0.55 : 1);
        for (let tr = 0; tr < 6 && !ok; tr++) {
          const a = a0 + (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.6, d = S * (0.48 + rnd() * 0.22);
          x = cx + Math.cos(a) * d - s / 2; y = cy + Math.sin(a) * d * 0.92 - s / 2; ok = free(x, y, s);
        }
        if (!ok) continue;
        placed.push({ x, y, s });
        const front = i % 3 === 1;
        const lay = IMG('Süs · ' + key, src, x, y, s, s, { fit: 'contain', rotation: Math.round(rnd() * 360 - 180), shadow: { x: 0, y: r1(s * 0.06), blur: r1(s * 0.12), color: 'rgba(0,0,0,0.25)' } });
        (front ? over : under).push(lay);
      }
      // ön planda bulanık iri süsler: derinlik hissi
      if ((!scene || mode !== 'wide') && !c.noTex) {
        const corners = [[-0.06, 0.62], [0.82, 0.04], [0.8, 0.74], [-0.04, 0.08]];
        let k2 = 0;
        for (const [fx, fy] of corners) {
          if (k2 >= 2) break;
          const [key, variant] = cat.m[(k2 + 1) % cat.m.length]; const src = TH.sprite(key, variant); if (!src) continue;
          const s = Math.min(W, H) * (0.16 + rnd() * 0.06), x = W * fx, y = H * fy;
          if (!free(x, y, s)) continue;
          placed.push({ x, y, s }); k2++;
          over.push(IMG('Süs · ' + key + ' (ön)', src, x, y, s, s, { fit: 'contain', rotation: Math.round(rnd() * 360 - 180), opacity: 0.95, filters: { blur: r1(s * 0.035) } }));
        }
      }
      c.L.splice(pi + 1, 0, ...over);
    }
    c.L.unshift(...under);
    // 5) ince film greni: baskı hissi
    if (!c.charity) c.L.push(IMG('Süs · gren', TH.texture('grain', Math.round(W), Math.round(H), null, null, 7), 0, 0, W, H, { opacity: dark ? 0.22 : 0.16, locked: true }));
  }
  // rozet başlığa / fiyata binmesin: en yakın boş yere kaydır
  function fixBadges(c) {
    const { W, H, M } = c;
    c.L.filter((l) => l.name === 'Rozet').forEach((rz) => {
      const mem = c.L.filter((l) => l.group && l.group === rz.group);
      const others = c.L.filter((l) => l.type === 'text' && l.visible !== false && l.group !== rz.group);
      const hits = (dx, dy) => { const x = rz.x + dx + rz.w * 0.06, y = rz.y + dy + rz.h * 0.06, w = rz.w * 0.88, h = rz.h * 0.88;
        if (x < M * 0.3 || y < M * 0.3 || x + w > W - M * 0.3 || y + h > H - M * 0.3) return 1e9;
        let a = 0; others.forEach((t) => { const ox = Math.min(x + w, t.x + t.w) - Math.max(x, t.x), oy = Math.min(y + h, t.y + t.h) - Math.max(y, t.y); if (ox > 0 && oy > 0) a += ox * oy; }); return a; };
      if (!hits(0, 0)) return;
      let best = [0, 0, hits(0, 0)];
      const st = rz.w * 0.12;
      for (let r = 1; r <= 14 && best[2]; r++) for (const [ux, uy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const v = hits(ux * r * st, uy * r * st); if (v < best[2]) best = [ux * r * st, uy * r * st, v]; if (!v) break;
      }
      if (best[0] || best[1]) mem.forEach((l) => { l.x = r1(l.x + best[0]); l.y = r1(l.y + best[1]); });
    });
  }
  // hikâye (9:16) boyunda kendine özgü düzeni olmayan bağış şablonları: 4:5 düzen ortalanır,
  // zemin / tam boy fotoğraf / şeritler üstten ve alttan uzatılır → küçük yazı ve boş alan kalmaz
  const STORY_WRAP = new Set(['cTesekkur', 'cNane', 'cKumanya', 'cPaylas', 'cAsure', 'cZarif', 'cIhtida', 'cRanza', 'cOklu', 'cSukur', 'cHafta', 'cIftar']);
  function storyWrap(res, W, H, H2) {
    const off = (H - H2) / 2, out = [];
    res.layers.forEach((l) => {
      const top = l.y <= 1, bot = l.y + l.h >= H2 - 1, full = l.w >= W * 0.9 && !l.rotation;
      l.y = r1(l.y + off);
      if (full && (top || bot) && (l.type === 'image' || l.type === 'rect')) {
        if (top) { l.h = r1(l.h + off); l.y = 0; }
        if (bot) l.h = r1(H - l.y);
        if (l.type === 'image' && l.fit !== 'cover') { l.fit = 'cover'; }
        if (l.fade) { l.fade = Object.assign({}, l.fade); }
      } else if (full && bot && l.type === 'path') {
        out.push([l, { type: 'rect', name: (l.name || 'Zemin') + ' · uzantı', x: l.x, y: r1(l.y + l.h - 1), w: l.w, h: r1(H - (l.y + l.h) + 1), fill: l.fill, visible: true, opacity: l.opacity ?? 1, rotation: 0, radius: 0 }]);
      } else if (full && top && l.type === 'path') {
        out.push([l, { type: 'rect', name: (l.name || 'Zemin') + ' · uzantı', x: l.x, y: 0, w: l.w, h: r1(l.y + 1), fill: l.fill, visible: true, opacity: l.opacity ?? 1, rotation: 0, radius: 0 }]);
      }
    });
    out.forEach(([l, ext]) => { const i = res.layers.indexOf(l); res.layers.splice(i, 0, ext); });
    return res;
  }
  function buildAt(def, P, W, H, prod, patch) {
    if (def[8] && H / W > 1.6 && STORY_WRAP.has(def[2])) { const H2 = Math.round(W * 1.25); return storyWrap(buildAt(def, P, W, H2, prod, patch), W, H, H2); }
    let best = null;
    const TH = window.FoodTheme, own = TH ? TH.ART2CAT[def[5].art] : null;
    const cat = (prod && prod.cat) || own || 'genel';
    let content = def[5];
    if (def[8]) { if (patch) content = Object.assign({}, def[5], patch); else if (prod && prod.texts && prod.texts.title) content = Object.assign({}, def[5], { title: prod.texts.title, sub: prod.texts.sub || def[5].sub }); }
    else if (TH && prod && (prod.cat && prod.cat !== own || prod.texts)) content = TH.contentFor(cat, def[5], TPL.indexOf(def), prod.texts);
    for (const k of [1, 0.93, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56]) {
      const c = ctx(P, W, H, def[3], k);
      c.prod = prod && prod.src ? prod : null; c.cat = cat; c.tid = def[0];
      if (def[8]) { c.charity = true; c.plain = !['cRamazan', 'cKalp'].includes(def[2]); }
      if (!c.prod && TH && TH.CATS[cat] && TH.CATS[cat].art) c.catArt = TH.CATS[cat].art;
      ARCH[def[2]](c, content);
      c.L.forEach((l) => { if (l.type === 'text') R.layoutText(l); });
      fixBadges(c);
      const pb = problems(c);
      if (!best || pb < best.pb) best = { c, pb };
      if (!pb) break;
    }
    try { enrich(best.c); } catch (e) { console.warn('enrich', e); }
    return { layers: best.c.L, bg: best.c.bg || P.bg };
  }
  const NEW = TPL.map((d) => {
    const [w, h] = SIZES[d[6]] || SIZES.sq;
    const pals = d[4].map((k) => PAL[k]);
    const t = { id: d[0], cat: d[8] || 'Gıda', name: d[1], w, h, palettes: pals, tags: (d[8] === 'Eğitim' ? 'eğitim okul ' : d[8] ? 'bağış kampanya yardım ' : 'gıda yemek ') + d[7], food: true, arch: d[2], style: d[3] };
    t.buildAt = (P, W, H, prod, patch) => buildAt(d, P, W, H, prod === undefined ? Food.product : prod, patch);
    t.build = (P) => t.buildAt(P, w, h).layers;
    return t;
  });
  // eski yemek şablonlarından önce
  L.templates.unshift(...NEW);
  L.cats = ['Bağış · Kampanya', 'Eğitim', 'Gıda', ...L.cats.filter((c) => c !== 'Gıda' && c !== 'Bağış · Kampanya' && c !== 'Eğitim')];

  // herhangi bir ölçüde kur
  L.instantiateAt = function (t, pi = 0, customP, W, H, prod, patch) {
    if (!t.buildAt || !W || !H) return L.instantiate(t, pi, customP);
    if (prod === undefined) prod = Food.product;
    const P = Object.assign({}, t.palettes[0], customP || t.palettes[Math.max(0, Math.min(t.palettes.length - 1, pi))]);
    if (customP && !customP.d) P.d = customP.ink; if (customP && !customP.c) P.c = customP.c || '#EEE';
    const r = t.buildAt(P, W, H, prod || null, patch);
    const layers = JSON.parse(JSON.stringify(r.layers));
    if (customP && (customP._fh || customP._fb)) layers.forEach((l) => { if (l.type === 'text' && !l.priceRole) l.fontFamily = (l.name === 'Başlık' || l.name === 'Büyük oran' ? customP._fh : customP._fb) || l.fontFamily; });
    const meta = { template: t.id, palette: customP ? 'brand' : pi, size: [W, H] };
    if (prod && prod.cat) meta.cat = prod.cat;
    if (patch) meta.patch = patch;
    if (customP && !customP._fh && !customP._fb) { meta.palette = 'custom'; meta.customP = Object.fromEntries(Object.entries(customP).filter(([k]) => /^(bg|ink|a|b|c|d)$/.test(k))); }
    return { width: W, height: H, background: { type: 'solid', color: r.bg }, layers, name: t.name, meta };
  };
  // eski instantiate gıda şablonlarında da palet / ölçü bilgisini taşısın
  const orig = L.instantiate;
  L.instantiate = function (t, pi = 0, customP) { return t.buildAt ? L.instantiateAt(t, pi, customP, t.w, t.h) : orig(t, pi, customP); };

  // ---------------------------------------------------------------- fiyat bileşeni yardımcıları
  const Food = { PAL, ST, SIZES, ARCH, parsePrice, templates: NEW, SAMPLES: SMP, loadCharity: () => Food_loadCharity() };
  Food.reflowPrices = function (d) {
    const groups = {};
    (d.layers || []).forEach((l) => { if (l.priceRole && l.group) (groups[l.group] = groups[l.group] || []).push(l); });
    Object.values(groups).forEach((ls) => layoutPrice(ls));
  };
  Food.applyPrice = function (d, val) {
    if (!val) return 0;
    const p = parsePrice(val); let n = 0;
    (d.layers || []).forEach((l) => { if (!l.priceRole) return; const v = p[l.priceRole]; if (v != null && R.plain(l.text) !== v) { l.text = v; n++; } });
    Food.reflowPrices(d);
    return n ? 1 : 0;
  };
  // ölçü değişince gıda şablonunu yeniden kur, yazıları ve fotoğrafı taşı
  Food.rebuild = function (d, W, H) {
    const id = d.meta && d.meta.template, t = L.templates.find((x) => x.id === id);
    if (!t || !t.buildAt) return null;
    const pi = d.meta.palette, bp = pi === 'custom' && d.meta.customP ? d.meta.customP : pi === 'brand' && window.P5 && window.P5.brandPalette ? window.P5.brandPalette() : null;
    const nd = R.normalize(L.instantiateAt(t, bp ? 0 : +pi || 0, bp, W, H, undefined, d.meta.patch));
    const byName = {}; d.layers.forEach((l) => { (byName[l.name] = byName[l.name] || []).push(l); });
    const used = {};
    nd.layers.forEach((l) => {
      const src = (byName[l.name] || [])[used[l.name] = (used[l.name] || 0)]; used[l.name]++;
      if (!src) return;
      if (l.type === 'text' && src.type === 'text') { l.text = src.text; ['fill', 'fontFamily', 'fontWeight'].forEach((k) => { if (src[k] != null) l[k] = src[k]; }); }
      if (l.type === 'image' && src.type === 'image' && l.role === 'photo') { l.src = src.src; l.nw = src.nw; l.nh = src.nh; if (src.filters) l.filters = src.filters; ['focus', 'fade', 'zoom'].forEach((k) => { if (src[k] != null) l[k] = src[k]; }); }
      if (l.visible !== src.visible) l.visible = src.visible;
    });
    nd.background = d.background;
    nd.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
    Food.reflowPrices(nd);
    return nd;
  };
  // ---------------------------------------------------------------- renkleri görselden çıkar
  const hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
  const fromHsl = (h, s, l) => { h = ((h % 360) + 360) % 360; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  function pixels(src) {
    return new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { const c = document.createElement('canvas'), n = 72; c.width = n; c.height = n; const x = c.getContext('2d'); x.drawImage(im, 0, 0, n, n); try { res({ px: x.getImageData(0, 0, n, n).data, n }); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = src; });
  }
  // ürün fotoğrafı: zemini (kenar renkleri) atla, ürünün baskın tonlarından iştah açıcı bir palet kur
  Food.paletteFromImage = async function (src) {
    const r = await pixels(src); if (!r) return null;
    const { px, n } = r, edge = {};
    const key = (i) => ((px[i] >> 5) << 6) | ((px[i + 1] >> 5) << 3) | (px[i + 2] >> 5);
    for (let k = 0; k < n; k++) [[k, 0], [k, n - 1], [0, k], [n - 1, k]].forEach(([x, y]) => { const i = (y * n + x) * 4; if (px[i + 3] > 100) edge[key(i)] = (edge[key(i)] || 0) + 1; });
    const bins = new Array(24).fill(0).map(() => ({ w: 0, s: 0, l: 0 }));
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 100) continue; if ((edge[key(i)] || 0) > n * 0.25) continue;
      const [h, s, l] = hsl(px[i], px[i + 1], px[i + 2]); if (s < 0.18 || l < 0.08 || l > 0.94) continue;
      const b = bins[Math.floor(h / 15) % 24], w = s * (1 - Math.abs(l - 0.5));
      b.w += w; b.s += s * w; b.l += l * w;
    }
    const order = bins.map((b, i) => ({ i, ...b })).filter((b) => b.w > 0).sort((a, b) => b.w - a.w);
    if (!order.length) return null;
    const h1 = order[0].i * 15 + 7, s1 = Math.min(0.85, Math.max(0.45, order[0].s / order[0].w));
    const o2 = order.find((b) => Math.min(Math.abs(b.i - order[0].i), 24 - Math.abs(b.i - order[0].i)) >= 3);
    const h2 = o2 ? o2.i * 15 + 7 : h1 + 35;
    const P = { bg: fromHsl(h1, 0.55, 0.955), ink: fromHsl(h1, 0.45, 0.12), a: fromHsl(h1, s1, 0.44), b: fromHsl(h2, Math.min(0.8, s1), 0.5), c: fromHsl(h1, 0.6, 0.86), d: fromHsl(h1, 0.4, 0.1) };
    if (CR(P.a, P.bg) < 3.2) P.a = fromHsl(h1, s1, 0.36);
    return P;
  };
  // örnek tasarım: zemin, yazı ve vurgu renklerini olduğu gibi al; koyu / açık ve canlı / sade havasını çıkar
  Food.paletteFromReference = async function (src) {
    const r = await pixels(src); if (!r) return null;
    const { px } = r, buckets = {};
    let lum = 0, sat = 0, cnt = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 100) continue;
      const k = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4), b = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0 });
      b.n++; b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2];
      const [, s, l] = hsl(px[i], px[i + 1], px[i + 2]); lum += l; sat += s; cnt++;
    }
    const cols = Object.values(buckets).map((b) => ({ n: b.n, c: '#' + [b.r / b.n, b.g / b.n, b.b / b.n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase() })).sort((a, b) => b.n - a.n);
    const picked = []; cols.forEach((x) => { if (picked.length < 8 && picked.every((p) => window.Tools.contrast(p.c, x.c) > 1.35)) picked.push(x); });
    const bg = picked[0].c;
    const sorted = picked.slice(1).map((x) => ({ ...x, s: hsl(...[1, 3, 5].map((k) => parseInt(x.c.slice(k, k + 2), 16)))[1] }));
    const ink = sorted.slice().sort((a, b) => CR(b.c, bg) - CR(a.c, bg))[0];
    const acc = sorted.filter((x) => x !== ink).sort((a, b) => b.s * Math.log(b.n + 2) - a.s * Math.log(a.n + 2));
    const a = acc[0] ? acc[0].c : ink ? ink.c : '#E2392B';
    const P = { bg, ink: ink && CR(ink.c, bg) >= 4.5 ? ink.c : on(bg, '#14110E', '#FFFFFF'), a, b: acc[1] ? acc[1].c : mixHex(a, '#000000', 0.3), c: mixHex(a, bg, 0.72), d: lum / cnt < 0.4 ? mixHex(bg, '#000000', 0.35) : (ink ? ink.c : '#14110E') };
    P.mood = { dark: lum / cnt < 0.42, vivid: sat / cnt > 0.35 };
    return P;
  };
  // şablon fontlarını önceden yükle (ölçüler doğru çıksın)
  Food.FACES = [['Poppins', 300, 1], ['Poppins', 600], ['Poppins', 800], ['Ms Madi', 400], ['Oswald', 500], ['Oswald', 600], ['Oswald', 700], ['Montserrat', 400], ['Montserrat', 600], ['Montserrat', 700], ['Montserrat', 800], ['DM Serif Display', 400], ['Playfair Display', 400], ['Playfair Display', 700], ['Crimson Pro', 400], ['Crimson Pro', 600], ['Crimson Pro', 400, 1], ['Cinzel', 700], ['Caveat', 700], ['Kaushan Script', 400], ['Alex Brush', 400], ['Archivo Black', 400], ['Inter', 200], ['Inter', 300], ['Inter', 400], ['Inter', 500], ['Inter', 600], ['Inter', 700], ['Inter', 800], ['Inter', 900], ['Poppins', 400], ['Poppins', 500], ['Poppins', 700], ['Lora', 400], ['Lora', 600], ['Lora', 700], ['Lora', 400, 1], ['TeX Gyre Heros Cn', 700], ['GFS Baskerville', 400], ['TeX Gyre Chorus', 500]];
  Food.load = function () {
    if (Food._p) return Food._p;
    const ok = R.FONT_DB && R.FONT_DB['TeX Gyre Heros Cn'];
    const p = Promise.all(Food.FACES.map(([f, w, i]) => (R.ensureFont ? R.ensureFont(f, w, !!i) : Promise.resolve()).catch(() => {}))).then(() => true);
    if (ok) Food._p = p;
    return p;
  };
  document.addEventListener('ts-fonts-ready', () => Food.load());
  window.Food = Food;
})();
