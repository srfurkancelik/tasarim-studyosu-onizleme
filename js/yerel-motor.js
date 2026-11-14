/* Tasarım Stüdyosu v7.0 — yerel tasarım motoru (JavaScript).
   server.py'deki yerel motorun (local_generate / local_edit) birebir karşılığı.
   Telefon önizlemesinde ve sunucuya ulaşılamadığında "yazarak hazırla" bununla çalışır.
   Python sürümüyle aynı sonucu verdiği gelistirme/motor_testi.py ile denetlenir.
   Python'daki karşılıklar: round → pyRound (yarımda çifte), int → trunc, // → floor. */
(function (root) {
  'use strict';
  const M = {};

  // ---------------------------------------------------------------- Python uyumluluk
  const pyRound = (x, nd) => {
    const f = Math.pow(10, nd || 0), v = x * f, r = Math.round(v);
    const yarim = Math.abs(v % 1) === 0.5;
    const out = yarim ? (r % 2 === 0 ? r : r - 1) : r;   // yarımda çifte yuvarla (Python 3)
    return nd ? out / f : out;
  };
  const int = (x) => Math.trunc(x);
  const fdiv = (a, b) => Math.floor(a / b);
  const hex = () => { let s = ''; for (let i = 0; i < 12; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)]; return s; };
  M.rastgele = Math.random;
  const karistir = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(M.rastgele() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const isDigit = (w) => /^[0-9]+$/.test(w);
  const W_HARF = '\\p{L}\\p{N}_';

  // ---------------------------------------------------------------- veriler
  const FORMATS = [
    [['story', 'hikaye', 'reels', 'dikey'], [1080, 1920], 'Instagram Story'],
    [['linkedin'], [1584, 396], 'LinkedIn Kapak'],
    [['youtube', 'thumbnail', 'küçük resim'], [1280, 720], 'YouTube Kapak'],
    [['banner', 'web', 'facebook', 'reklam'], [1200, 628], 'Banner'],
    [['flyer', 'flayer', 'el ilanı', 'broşür', 'afiş', 'poster', 'a4'], [1240, 1754], 'Flyer (A4)'],
    [['instagram', 'post', 'kare', 'gönderi'], [1080, 1080], 'Instagram Post'],
  ];
  const COLOR_WORDS = {
    'kırmızı': '#E63946', 'kirmizi': '#E63946', 'mavi': '#2563EB', 'lacivert': '#1E2A5A',
    'yeşil': '#16A34A', 'yesil': '#16A34A', 'sarı': '#FACC15', 'sari': '#FACC15',
    'turuncu': '#F97316', 'mor': '#7C3AED', 'pembe': '#EC4899', 'siyah': '#111111',
    'beyaz': '#FFFFFF', 'gri': '#6B7280', 'altın': '#D4AF37', 'altin': '#D4AF37',
    'turkuaz': '#14B8A6', 'bordo': '#7F1D1D', 'kahverengi': '#7C4A2D',
    'bej': '#E8DCC4', 'krem': '#F5EFE0', 'lila': '#C4B5FD', 'neon': '#39FF14',
  };
  const STYLES = {
    'lüks': { bg: '#0E0E10', primary: '#D4AF37', accent: '#F5E6B8', text: '#FFFFFF', muted: '#B9B4A6', font: 'Georgia', dark: true },
    'minimal': { bg: '#FAFAF7', primary: '#111111', accent: '#E63946', text: '#111111', muted: '#6B7280', font: 'Helvetica', dark: false },
    'eğlenceli': { bg: '#FFE14D', primary: '#FF3D7F', accent: '#00C2FF', text: '#1A1A1A', muted: '#3A3A3A', font: 'Arial Black', dark: false },
    'kurumsal': { bg: '#0F2747', primary: '#2F80ED', accent: '#56CCF2', text: '#FFFFFF', muted: '#A9BCD6', font: 'Segoe UI', dark: true },
    'doğal': { bg: '#F1ECE1', primary: '#2F5D3A', accent: '#C9A66B', text: '#1F2A1F', muted: '#5C6B5C', font: 'Georgia', dark: false },
    'teknoloji': { bg: '#0A0F1F', primary: '#7C3AED', accent: '#22D3EE', text: '#FFFFFF', muted: '#94A3B8', font: 'Segoe UI', dark: true },
    'modern': { bg: '#FFFFFF', primary: '#FF5A1F', accent: '#1E1B4B', text: '#111827', muted: '#6B7280', font: 'Segoe UI', dark: false },
  };
  const STYLE_WORDS = {
    'lüks': 'lüks', 'luks': 'lüks', 'premium': 'lüks', 'şık': 'lüks', 'elegant': 'lüks',
    'minimal': 'minimal', 'sade': 'minimal', 'eğlenceli': 'eğlenceli', 'renkli': 'eğlenceli',
    'çocuk': 'eğlenceli', 'parti': 'eğlenceli', 'kurumsal': 'kurumsal', 'profesyonel': 'kurumsal',
    'doğal': 'doğal', 'organik': 'doğal', 'kahve': 'doğal', 'teknoloji': 'teknoloji',
    'tech': 'teknoloji', 'yazılım': 'teknoloji', 'oyun': 'teknoloji', 'modern': 'modern',
  };
  const STYLE_ADJ = new Set(['lüks', 'luks', 'premium', 'şık', 'elegant', 'minimal', 'sade', 'eğlenceli', 'renkli', 'kurumsal', 'profesyonel', 'modern', 'dinamik', 'zarif']);
  const ROLE_TR = { title: 'başlık', subtitle: 'alt başlık', cta: 'buton', badge: 'rozet' };
  const LAYOUTS = ['center', 'split', 'diagonal', 'frame', 'magazine'];
  const LAYOUT_TR = { center: 'ortalı', split: 'ikiye bölünmüş', diagonal: 'çapraz', frame: 'çerçeveli', magazine: 'dergi' };
  const STOP = new Set(`için bir bana şu bu ve ile da de hazırla hazirla oluştur olustur tasarla yap
istiyorum lütfen lutfen benim bize tasarım tasarim içerik icerik görsel gorsel olsun
olarak gibi çok daha renkli renk tonlarında tonunda tema temalı stil stilde tarzında`.split(/\s+/));
  const FLAT_FORMATS = new Set(FORMATS.flatMap((f) => f[0]));

  // ---------------------------------------------------------------- renk
  const hexToRgb = (h) => { h = h.replace(/^#/, ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const lum = (h) => { const [r, g, b] = hexToRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const shade = (h, f) => {
    let [r, g, b] = hexToRgb(h);
    if (f < 0) [r, g, b] = [r, g, b].map((c) => int(c * (1 + f)));
    else [r, g, b] = [r, g, b].map((c) => int(c + (255 - c) * f));
    return '#' + [r, g, b].map((c) => c.toString(16).toUpperCase().padStart(2, '0')).join('');
  };
  M.lum = lum; M.shade = shade;

  // ---------------------------------------------------------------- algılama
  M.detectFormat = function (p) {
    const m = /(\d{3,4})\s*[x×*]\s*(\d{3,4})/.exec(p);
    if (m) return [+m[1], +m[2], 'Özel'];
    for (const [keys, size, name] of FORMATS) if (keys.some((k) => p.includes(k))) return [size[0], size[1], name];
    return [1080, 1080, 'Instagram Post'];
  };
  M.detectColors = function (p) {
    const found = [];
    for (const [w, c] of Object.entries(COLOR_WORDS)) {
      const m = new RegExp('(?<![' + W_HARF + 'çğıöşü])' + w, 'u').exec(p);
      if (m && !found.some((x) => x[1] === c)) found.push([m.index, c]);
    }
    found.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
    const cols = found.map((x) => x[1]);
    for (const m of p.matchAll(/#([0-9a-fA-F]{6})\b/g)) cols.push(('#' + m[1]).toUpperCase());
    return cols;
  };
  M.detectStyle = function (p) {
    for (const [w, s] of Object.entries(STYLE_WORDS)) if (p.includes(w)) return s;
    return null;
  };
  M.buildPalette = function (style, colors, refPalette, bg) {
    const base = Object.assign({}, STYLES[style || 'modern']);
    if (bg && /^#[0-9A-Fa-f]{6}$/.test(bg)) base.bg = bg.toUpperCase();
    if (refPalette && refPalette.length && !(colors && colors.length) && !bg) {
      const cols = refPalette.filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c));
      if (cols.length) {
        cols.sort((a, b) => lum(a) - lum(b));
        base.bg = lum(cols[0]) < 0.25 ? cols[0] : shade(cols[0], -0.6);
        const vivid = cols.slice(fdiv(cols.length, 2));
        base.primary = lum(vivid[vivid.length - 1]) < 0.9 ? vivid[vivid.length - 1] : cols[fdiv(cols.length, 2)];
        base.accent = cols[cols.length - 1];
        base.dark = true;
      }
    }
    if (colors && colors.length) {
      base.primary = colors[0];
      if (colors.length > 1) base.accent = colors[1];
    }
    const dark = lum(base.bg) < 0.5;
    base.dark = dark;
    base.text = dark ? '#FFFFFF' : '#111111';
    base.muted = dark ? shade(base.bg, 0.65) : shade(base.text, 0.45);
    base.on_primary = lum(base.primary) > 0.6 ? '#111111' : '#FFFFFF';
    return base;
  };

  M.extractTexts = function (prompt) {
    const texts = {};
    const labels = {
      title: 'başlık|baslik|title',
      subtitle: 'alt\\s*başlık|alt\\s*baslik|açıklama|aciklama|slogan',
      cta: 'buton|button|cta',
      date: 'tarih',
      phone: 'telefon|tel',
      address: 'adres|konum|web',
      badge: 'rozet|etiket',
    };
    for (const [key, pat] of Object.entries(labels)) {
      const m = new RegExp('(?:' + pat + ')\\s*[:=]\\s*["“\']?([^"”\'\\n,;]+)', 'iu').exec(prompt);
      if (m) texts[key] = m[1].trim();
    }
    if ('title' in texts && 'subtitle' in texts && texts.title === texts.subtitle) delete texts.title;
    let quotes = [...prompt.matchAll(/["“”']([^"“”']{2,120})["“”']/g)].map((m) => m[1]);
    const used = new Set(Object.values(texts).map((v) => v.trim().toLowerCase()));
    quotes = quotes.filter((q) => !used.has(q.trim().toLowerCase()));
    for (const q of quotes) for (const k of ['title', 'subtitle', 'cta']) if (!(k in texts)) { texts[k] = q.trim(); break; }
    const pct = /%\s?(\d{1,2})|(\d{1,2})\s?%/.exec(prompt);
    if (pct && !('badge' in texts)) texts.badge = '%' + (pct[1] || pct[2]);
    if (!('title' in texts)) {
      let words = (prompt.match(/[\p{L}\p{N}_çğıöşüÇĞİÖŞÜ%]+/gu) || []).filter((w) => {
        const lw = w.toLowerCase();
        return !STOP.has(lw) && !FORMATS.some(([keys]) => keys.includes(lw)) && !(lw in COLOR_WORDS) && !STYLE_ADJ.has(lw) && !isDigit(w);
      });
      words = words.filter((w) => !FLAT_FORMATS.has(w.toLowerCase())).slice(0, 4);
      texts.title = words.map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(' ') || 'Büyük Fırsat';
    }
    if (!('subtitle' in texts)) texts.subtitle = 'Kaçırılmayacak fırsatlar sizi bekliyor';
    if (!('cta' in texts)) texts.cta = 'Hemen İncele';
    return texts;
  };

  // ---------------------------------------------------------------- katmanlar
  const L = (kind, kw = {}) => {
    const d = { id: hex(), type: kind, name: kind, x: 0, y: 0, w: 100, h: 100, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' };
    return Object.assign(d, kw);
  };
  const T = (text, x, y, w, size, color, font, weight = 700, align = 'left', role = null, kw = {}) => {
    kw = Object.assign({}, kw);
    const lines = Math.max(1, pyRound(text.length * size * 0.55 / Math.max(w, 1) + 0.49));
    const name = 'name' in kw ? kw.name : (role || 'Metin'); delete kw.name;
    const ls = 'ls' in kw ? kw.ls : 0; delete kw.ls;
    return L('text', Object.assign({ name, role, text, x, y, w, h: int(lines * size * 1.15), fontSize: size, fontFamily: font, fontWeight: weight, align, fill: color, lineHeight: 1.15, letterSpacing: ls }, kw));
  };
  const starPath = (points, outer, inner) => {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner, a = Math.PI * i / points - Math.PI / 2;
      pts.push((50 + r * Math.cos(a)).toFixed(1) + ' ' + (50 + r * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join(' L') + ' Z';
  };

  M.makeLayout = function (layout, W, H, pal, tx, image) {
    const s = Math.min(W, H), wide = W / H > 1.6, tall = H / W > 1.3, font = pal.font;
    let layers = [], bg = { type: 'solid', color: pal.bg };
    const pad = int(s * 0.08);
    const cta = (x, y, align = 'left', color = null, txt = null) => {
      const fs = int(s * 0.04);
      const bw = int(Math.max((txt || tx.cta).length * fs * 0.62 + fs * 2.4, s * 0.28));
      const bh = int(fs * 2.4);
      if (align === 'center') x = fdiv(W - bw, 2);
      return [
        L('rect', { name: 'Buton', role: 'cta-bg', x, y, w: bw, h: bh, radius: fdiv(bh, 2), fill: color || pal.primary, shadow: { x: 0, y: int(s * 0.01), blur: int(s * 0.03), color: 'rgba(0,0,0,0.25)' } }),
        T(txt || tx.cta, x, y + (bh - fs * 1.15) / 2, bw, fs, pal.on_primary, font, 700, 'center', 'cta', { name: 'Buton yazısı' }),
      ];
    };
    const badge = (cx, cy, r) => {
      if (!tx.badge) return [];
      return [
        L('path', { name: 'Rozet', role: 'badge-bg', x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, d: starPath(12, 50, 42), vw: 100, vh: 100, fill: pal.accent, rotation: -12 }),
        T(tx.badge, cx - r, cy - r * 0.42, 2 * r, int(r * 0.7), lum(pal.accent) > 0.5 ? '#111111' : '#FFFFFF', font, 900, 'center', 'badge', { rotation: -12, name: 'Rozet yazısı' }),
      ];
    };

    if (layout === 'center') {
      bg = { type: 'linear', angle: 135, colors: [pal.bg, shade(pal.bg, pal.dark ? 0.12 : -0.08)] };
      layers.push(
        L('ellipse', { name: 'Daire büyük', x: W - s * 0.55, y: -s * 0.25, w: s * 0.8, h: s * 0.8, fill: pal.primary, opacity: 0.9 }),
        L('ellipse', { name: 'Daire küçük', x: -s * 0.15, y: H - s * 0.35, w: s * 0.45, h: s * 0.45, fill: pal.accent, opacity: 0.85 }),
        L('ellipse', { name: 'Halka', x: s * 0.1, y: s * 0.12, w: s * 0.18, h: s * 0.18, fill: 'none', stroke: pal.text, strokeWidth: Math.max(2, int(s * 0.006)), opacity: 0.4 }),
      );
      let ty;
      if (image) {
        const iw = int(W * (wide ? 0.5 : 0.62)), ih = !tall ? int(iw * 0.75) : int(iw);
        layers.push(L('image', { name: 'Görsel', role: 'image', src: image, x: fdiv(W - iw, 2), y: int(H * (tall ? 0.12 : 0.08)), w: iw, h: ih, fit: 'cover', radius: int(s * 0.03), shadow: { x: 0, y: int(s * 0.02), blur: int(s * 0.05), color: 'rgba(0,0,0,0.35)' } }));
        ty = int(H * (tall ? 0.12 : 0.08)) + ih + int(s * 0.06);
      } else ty = int(H * (tall ? 0.3 : 0.24));
      const ts = int(s * (!wide ? 0.11 : 0.09));
      layers.push(T(tx.title.toUpperCase(), pad, ty, W - 2 * pad, ts, pal.text, font, 900, 'center', 'title', { name: 'Başlık' }));
      const lines = Math.max(1, pyRound(tx.title.length * ts * 0.6 / (W - 2 * pad) + 0.49));
      const sy = ty + lines * ts * 1.15 + s * 0.03;
      layers.push(T(tx.subtitle, pad * 1.5, sy, W - 3 * pad, int(s * 0.042), pal.muted, font, 400, 'center', 'subtitle', { name: 'Alt başlık' }));
      layers = layers.concat(cta(0, int(Math.min(sy + s * 0.14, H - s * 0.2)), 'center'));
      layers = layers.concat(badge(W - pad - s * 0.1, H * (image ? 0.55 : 0.2), int(s * 0.1)));
    } else if (layout === 'split') {
      if (wide) {
        layers.push(L('rect', { name: 'Renk blok', x: W * 0.55, y: 0, w: W * 0.45, h: H, fill: pal.primary }));
        if (image) layers.push(L('image', { name: 'Görsel', role: 'image', src: image, x: W * 0.55, y: 0, w: W * 0.45, h: H, fit: 'cover' }));
        const tw = W * 0.55 - 2 * pad;
        layers.push(L('rect', { name: 'Çizgi', x: pad, y: pad, w: s * 0.12, h: Math.max(4, s * 0.015), fill: pal.primary }));
        layers.push(T(tx.title, pad, pad + s * 0.08, tw, int(s * 0.13), pal.text, font, 800, 'left', 'title', { name: 'Başlık' }));
        layers.push(T(tx.subtitle, pad, H * 0.58, tw, int(s * 0.05), pal.muted, font, 400, 'left', 'subtitle', { name: 'Alt başlık' }));
        layers = layers.concat(cta(pad, int(H - pad - s * 0.1)));
      } else {
        const ih = H * (H / W < 1.2 ? 0.46 : 0.5);
        layers.push(L('rect', { name: 'Renk blok', x: 0, y: 0, w: W, h: ih, fill: pal.primary }));
        if (image) layers.push(L('image', { name: 'Görsel', role: 'image', src: image, x: 0, y: 0, w: W, h: ih, fit: 'cover' }));
        layers.push(L('rect', { name: 'Vurgu şerit', x: 0, y: ih - s * 0.012, w: W, h: s * 0.024, fill: pal.accent }));
        const tt = T(tx.title, pad, ih + s * 0.07, W - 2 * pad, int(s * 0.1), pal.text, font, 800, 'left', 'title', { name: 'Başlık' });
        layers.push(tt);
        layers.push(T(tx.subtitle, pad, tt.y + tt.h + s * 0.025, W - 2 * pad, int(s * 0.042), pal.muted, font, 400, 'left', 'subtitle', { name: 'Alt başlık' }));
        layers = layers.concat(cta(pad, int(H - pad - s * 0.1)));
        layers = layers.concat(badge(W - pad - s * 0.11, ih, int(s * 0.11)));
      }
    } else if (layout === 'diagonal') {
      layers.push(L('path', { name: 'Çapraz şekil', x: 0, y: 0, w: W, h: H, d: 'M0 0 L62 0 L42 100 L0 100 Z', vw: 100, vh: 100, fill: pal.primary }));
      layers.push(L('path', { name: 'Çapraz çizgi', x: 0, y: 0, w: W, h: H, d: 'M64 0 L68 0 L48 100 L44 100 Z', vw: 100, vh: 100, fill: pal.accent }));
      if (image) layers.unshift(L('image', { name: 'Görsel', role: 'image', src: image, x: W * 0.4, y: 0, w: W * 0.6, h: H, fit: 'cover' }));
      const tw = W * 0.5 - pad, on = pal.on_primary;
      layers.push(T(tx.title.toUpperCase(), pad, H * 0.2, tw, int(s * (!wide ? 0.085 : 0.1)), on, font, 900, 'left', 'title', { name: 'Başlık' }));
      layers.push(T(tx.subtitle, pad, H * 0.58, tw * 0.9, int(s * 0.04), on, font, 400, 'left', 'subtitle', { name: 'Alt başlık', opacity: 0.9 }));
      layers = layers.concat(cta(pad, int(H - pad - s * 0.1), 'left', pal.accent));
      layers = layers.concat(badge(W - pad - s * 0.1, pad + s * 0.1, int(s * 0.1)));
    } else if (layout === 'frame') {
      bg = { type: 'solid', color: pal.bg };
      const m = pad * 0.6;
      layers.push(L('rect', { name: 'Çerçeve', x: m, y: m, w: W - 2 * m, h: H - 2 * m, fill: 'none', stroke: pal.primary, strokeWidth: Math.max(2, int(s * 0.004)) }));
      let top = image ? pad * 1.6 : H * (!wide ? 0.3 : 0.22);
      if (image) {
        const ih = H * (!wide ? 0.42 : 0.7), iw = !wide ? W - 4 * pad : W * 0.4;
        layers.push(L('image', { name: 'Görsel', role: 'image', src: image, x: !wide ? (W - iw) / 2 : W - iw - pad * 1.6, y: top, w: iw, h: ih, fit: 'cover' }));
        if (!wide) top += ih + s * 0.05;
      }
      const tw = !(wide && image) ? (W - 3.2 * pad) : W * 0.45;
      const al = !wide ? 'center' : 'left';
      layers.push(T('— ' + (tx.date || 'YENİ SEZON').toUpperCase() + ' —', pad * 1.6, top, tw, int(s * 0.03), pal.primary, font, 600, al, 'label', { name: 'Etiket', ls: int(s * 0.006) }));
      layers.push(T(tx.title, pad * 1.6, top + s * 0.07, tw, int(s * 0.095), pal.text, 'Georgia', 400, al, 'title', { name: 'Başlık', italic: true }));
      layers.push(T(tx.subtitle, pad * 1.6, top + s * 0.3, tw, int(s * 0.036), pal.muted, font, 400, al, 'subtitle', { name: 'Alt başlık' }));
      layers = layers.concat(cta(pad * 1.6, int(H - pad * 1.6 - s * 0.1), al));
      layers = layers.concat(badge(W - m - s * 0.09, m + s * 0.09, int(s * 0.08)));
    } else { // magazine
      if (image) layers.push(L('image', { name: 'Görsel', role: 'image', src: image, x: 0, y: 0, w: W, h: H, fit: 'cover' }));
      else layers.push(L('ellipse', { name: 'Işık', x: W * 0.3, y: -H * 0.2, w: W, h: W, fill: pal.primary, opacity: 0.55 }));
      layers.push(L('rect', { name: 'Karartma', x: 0, y: H * 0.35, w: W, h: H * 0.65, fill: { type: 'linear', angle: 90, colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)'] } }));
      layers.push(L('rect', { name: 'Etiket kutu', role: 'tag-bg', x: pad, y: H * 0.55, w: s * 0.22, h: s * 0.055, fill: pal.primary, radius: 4 }));
      layers.push(T((tx.badge || 'YENİ').toUpperCase(), pad, H * 0.55 + s * 0.011, s * 0.22, int(s * 0.03), pal.on_primary, font, 800, 'center', 'badge', { name: 'Etiket yazısı' }));
      layers.push(T(tx.title, pad, H * 0.55 + s * 0.09, W - 2 * pad, int(s * 0.1), '#FFFFFF', font, 900, 'left', 'title', { name: 'Başlık' }));
      layers.push(T(tx.subtitle, pad, H - pad - s * 0.17, W - 2 * pad, int(s * 0.04), '#E5E5E5', font, 400, 'left', 'subtitle', { name: 'Alt başlık' }));
      bg = { type: 'solid', color: !image ? '#111111' : pal.bg };
      layers = layers.concat(cta(W - pad - s * 0.32, int(H - pad - s * 0.1), 'left', null, tx.cta));
      const n = layers.length;
      layers[n - 2].x = W - pad - layers[n - 2].w;
      layers[n - 1].x = layers[n - 2].x;
    }
    const extra = ['phone', 'address'].filter((k) => tx[k]).map((k) => tx[k]);
    if (extra.length) layers.push(T(extra.join('  •  '), pad, H - pad * 0.55 - s * 0.03, W - 2 * pad, int(s * 0.026), layout !== 'magazine' ? pal.muted : '#CCCCCC', font, 400, 'center', 'contact', { name: 'İletişim' }));
    for (const l of layers) for (const k of ['x', 'y', 'w', 'h']) l[k] = pyRound(+l[k], 1);
    return [bg, layers];
  };

  M.assignFlows = function (layout, layers, W, H) {
    const s = Math.min(W, H), pad = s * 0.08, by = {};
    for (const l of layers) (by[l.role == null ? 'null' : l.role] = by[l.role == null ? 'null' : l.role] || []).push(l);
    const one = (r) => (by[r] || [null])[0];
    const title = one('title'), sub = one('subtitle'), label = one('label'), ctaBg = one('cta-bg'), cta = one('cta'), tagBg = one('tag-bg'), badge = one('badge');
    const gap = pyRound(s * 0.03, 1);
    const order = [];
    let flow;
    if (layout === 'magazine') {
      if (tagBg) order.push([tagBg].concat(badge ? [badge] : []));
      [title, sub].filter(Boolean).forEach((x) => order.push([x]));
      flow = { anchor: 'bottom', y: ctaBg ? ctaBg.y - gap : H - pad, ref: ctaBg ? ctaBg.id : null, gap, min: pyRound(H * 0.22, 1) };
    } else {
      [label, title, sub].filter(Boolean).forEach((x) => order.push([x]));
      const first = order.length ? order[0][0] : null;
      flow = { anchor: 'top', y: first ? first.y : pad, gap };
      if (layout === 'center' && ctaBg) { order.push([ctaBg].concat(cta ? [cta] : [])); flow.max = pyRound(H - pad * 0.9 - s * 0.04, 1); }
      else if (ctaBg) flow.ref = ctaBg.id;
    }
    order.forEach((blk, i) => blk.forEach((l) => { l.flow = 'main'; l.fo = i; }));
    return order.length ? { main: flow } : {};
  };

  M.applyBrand = function (d, brand) {
    if (!brand || brand.enabled === false) return d;
    const W = d.width, H = d.height, s = Math.min(W, H), pad = s * 0.08;
    const hf = brand.font_heading, bf = brand.font_body;
    for (const l of d.layers) {
      if (l.type !== 'text') continue;
      if ((l.role === 'title' || l.role === 'badge') && hf) l.fontFamily = hf;
      else if (bf && l.role !== 'title' && l.role !== 'badge') l.fontFamily = bf;
    }
    const roles = new Set(d.layers.map((l) => l.role));
    if (brand.logo && !roles.has('logo')) {
      const ratio = parseFloat(brand.logo_ratio || 1) || 1;
      let lh = s * 0.09; const lw = Math.min(lh * ratio, s * 0.32); lh = lw / ratio;
      d.layers.push(L('image', { name: 'Logo', role: 'logo', src: brand.logo, x: pyRound(pad * 0.7, 1), y: pyRound(pad * 0.7, 1), w: pyRound(lw, 1), h: pyRound(lh, 1), fit: 'contain', filters: {} }));
    }
    const contact = ['phone', 'web', 'address'].map((k) => brand[k]).filter(Boolean);
    if (contact.length && !roles.has('contact')) {
      const cy = H - pad * 0.55 - s * 0.03, gap = s * 0.045;
      const movers = d.layers.filter((l) => l.type !== 'image' && !(l.w >= W * 0.9 && l.h >= H * 0.4) && l.y < cy && l.y + l.h > cy - gap && ['cta', 'cta-bg', 'subtitle', 'badge', 'badge-bg', 'label'].includes(l.role));
      if (movers.length) {
        const delta = Math.max(...movers.map((l) => l.y + l.h)) - (cy - gap);
        movers.forEach((l) => { l.y = pyRound(l.y - delta, 1); });
      }
      const pal = (d.meta || {}).palette || {};
      const col = (d.meta || {}).layout === 'magazine' ? '#CCCCCC' : (pal.muted || '#666666');
      d.layers.push(T(contact.join('  •  '), pad, H - pad * 0.55 - s * 0.03, W - 2 * pad, int(s * 0.026), col, bf || pal.font || 'Segoe UI', 400, 'center', 'contact', { name: 'İletişim' }));
    }
    return d;
  };

  M.buildDesign = function (layout, W, H, pal, tx, image, fmt, brand) {
    const [bg, layers] = M.makeLayout(layout, W, H, pal, tx, image);
    const d = { width: W, height: H, background: bg, layers, meta: { layout, palette: pal, texts: tx, image, format: fmt } };
    d.meta.flows = M.assignFlows(layout, layers, W, H);
    if (brand) M.applyBrand(d, brand);
    return d;
  };

  const findRole = (d, role) => d.layers.filter((l) => l.role === role);

  M.localEdit = function (p, raw, d, refPalette) {
    d = clone(d);
    const meta = d.meta = d.meta || {};
    let changed = [];
    const quotes = [...raw.matchAll(/["“”']([^"“”']{1,120})["“”']/g)].map((m) => m[1]);
    let cols = M.detectColors(p);
    const targets = [];
    if (/alt\s*başlı|alt\s*basli|açıklama/.test(p)) targets.push('subtitle');
    else if (/başlı|basli|başlık/.test(p)) targets.push('title');
    if (/buton|button/.test(p)) targets.push('cta');
    if (/rozet|etiket|indirim/.test(p)) targets.push('badge');
    if (/arka\s*plan|zemin|background/.test(p) && cols.length) {
      d.background = { type: 'solid', color: cols[0] }; changed.push('arka plan rengi'); cols = cols.slice(1);
    }
    if (quotes.length && targets.length) {
      findRole(d, targets[0]).forEach((l) => { l.text = quotes[0]; });
      (meta.texts = meta.texts || {})[targets[0]] = quotes[0];
      changed.push((ROLE_TR[targets[0]] || targets[0]) + ' metni');
    }
    if (cols.length && targets.length) {
      for (const t of targets) { const role = t === 'cta' ? 'cta-bg' : t === 'badge' ? 'badge-bg' : t; findRole(d, role).forEach((l) => { l.fill = cols[0]; }); }
      changed.push('renk');
    }
    if (/büyüt|buyut|büyük|daha büyük/.test(p) || /küçült|kucult|küçük/.test(p)) {
      const f = /büyüt|buyut|büyük/.test(p) ? 1.2 : 0.83;
      const roles = targets.length ? targets : ['title', 'subtitle'];
      for (const l of d.layers) if (l.type === 'text' && (roles.includes(l.role) || (p.includes('yazı') && !targets.length))) l.fontSize = pyRound(l.fontSize * f);
      changed.push('yazı boyutu');
    }
    if (/(görsel|resim|foto)[\p{L}\p{N}_]*\s*(kaldır|sil)/u.test(p)) {
      d.layers = d.layers.filter((l) => l.type !== 'image'); meta.image = null; changed.push('görsel kaldırıldı');
    }
    if (/tema|renkler|renkleri|palet/.test(p)) {
      const st = M.detectStyle(p), allc = M.detectColors(p);
      if (st || allc.length) {
        const pal = M.buildPalette(st, allc, refPalette);
        const [bg, layers] = M.makeLayout(meta.layout || 'center', d.width, d.height, pal, meta.texts || M.extractTexts(raw), meta.image);
        d.background = bg; d.layers = layers; meta.palette = pal; changed = ['renk teması'];
      }
    }
    if (/ortala/.test(p)) {
      for (const l of d.layers) if (l.type === 'text') { l.align = 'center'; l.x = (d.width - l.w) / 2; }
      changed.push('hizalama');
    }
    if (!changed.length) return null;
    return [d, 'Güncelledim: ' + changed.join(', ') + '.'];
  };

  M.generate = function (prompt, current, refPalette, reference, count, brand) {
    const p = prompt.toLowerCase();
    const meta = (current || {}).meta || {};
    const hasDesign = !!(current && current.layers && current.layers.length);
    const create = ['hazırla', 'hazirla', 'oluştur', 'olustur', 'tasarla', 'yeni', 'üret', 'uret'];
    const variation = ['varyasyon', 'farklı', 'farkli', 'başka', 'baska', 'alternatif', 'seçenek'].some((w) => p.includes(w));
    count = Math.max(1, Math.min(4, int(count || 1)));
    if (hasDesign && !create.some((w) => p.includes(w)) && !variation) {
      const res = M.localEdit(p, prompt, current, refPalette);
      if (res) return [[res[0]], res[1]];
    }
    let W, H, fmt, tx, pal, image, layouts;
    if (hasDesign && variation && meta.layout) {
      W = current.width; H = current.height; fmt = meta.format || '';
      tx = meta.texts || M.extractTexts(prompt);
      pal = meta.palette || M.buildPalette(null, [], refPalette);
      image = meta.image || reference;
      layouts = karistir(LAYOUTS.filter((l) => l !== meta.layout));
    } else {
      [W, H, fmt] = M.detectFormat(p);
      if (hasDesign && !/\d{3,4}\s*[x×*]\s*\d{3,4}/.test(p) && !FORMATS.some(([keys]) => keys.some((k) => p.includes(k)))) { W = current.width; H = current.height; }
      tx = M.extractTexts(prompt);
      const style = M.detectStyle(p);
      let cols = M.detectColors(p);
      if (!cols.length && brand && brand.colors) cols = brand.colors.filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c || '')).slice(0, 2);
      pal = M.buildPalette(style, cols, refPalette);
      image = reference && !p.includes('görselsiz') && !p.includes('resimsiz') ? reference : null;
      let preferred = null;
      for (const [l, keys] of [['magazine', ['dergi', 'tam ekran', 'fotoğraflı']], ['frame', ['çerçeve', 'zarif', 'davetiye', 'düğün']], ['diagonal', ['dinamik', 'spor', 'çapraz']], ['split', ['ikiye', 'bölünmüş', 'ürün']], ['center', ['ortalı', 'ortala']]])
        if (keys.some((k) => p.includes(k)) && !preferred) preferred = l;
      if (!preferred && (style === 'lüks' || p.includes('davetiye'))) preferred = 'frame';
      let pool = karistir(LAYOUTS.slice());
      if (image && pool.includes('magazine')) pool = ['magazine'].concat(pool.filter((x) => x !== 'magazine'));
      if (preferred) pool = [preferred].concat(pool.filter((x) => x !== preferred));
      layouts = pool;
    }
    const designs = layouts.slice(0, count).map((l) => M.buildDesign(l, W, H, pal, Object.assign({}, tx), image, fmt, brand));
    let reply;
    if (count > 1) reply = `${designs.length} seçenek hazırladım (${fmt || 'Özel'}, ${W}×${H}): ${layouts.slice(0, count).map((l) => LAYOUT_TR[l]).join(', ')}. Beğendiğini seç; sonra “başlığı büyüt”, “arka planı lacivert yap” gibi komutlarla ya da editörde düzenleyebilirsin.`;
    else reply = `${fmt || 'Özel'} formatında (${W}×${H}), ${LAYOUT_TR[layouts[0]]} düzende bir tasarım hazırladım. Başlık: “${tx.title}”. Değiştirmek için örn. “başlığı "Yaz İndirimi" yap”, “arka planı lacivert yap”, “farklı bir varyasyon” yazabilir ya da Düzenle ile editöre geçebilirsin.`;
    return [designs, reply];
  };

  root.YerelMotor = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
