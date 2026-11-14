/* Tasarım Stüdyosu v5.3 — yapay zekasız kalite araçları:
   tasarım koçu (tek dokunuşla düzelt), yazı ölçeği, renk uyumu, ürün sahneleri,
   hazır bloklar, tek kaynaktan bilgi doldurma, sade mod. */
(function () {
  'use strict';
  const A = () => window.App, R = window.Render, T = window.Tools;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (...a) => window.icon(...a);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const E = () => A().S.editorApi;
  const UI = () => window.UI;
  const toast = (m, bad) => A().toast(m, bad);
  const brand = () => A().S.brand || {};
  const info = () => Object.assign({ product: 'Ürün adı', price: '₺249', old: '₺299', discount: '%20', cta: 'Hemen sipariş ver', insta: '@markaniz', desc: 'Kısa ve çekici bir açıklama' }, Object.fromEntries(Object.entries(brand().info || {}).filter(([, v]) => v)), { phone: brand().phone || '0 (555) 000 00 00', web: brand().web || 'www.markaniz.com', name: brand().name || 'Markanız', slogan: brand().slogan || '' });
  const r1 = (v) => Math.round(v * 10) / 10;
  const C = {};

  // ---------------------------------------------------------------- renk yardımcıları
  const hex = (c) => ((R.parseColor(c) || {}).hex || '#000000').toUpperCase();
  const rgb = (c) => { const o = T.rgb(c); return [o.r, o.g, o.b]; };
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  function hsl(c) {
    let [r, g, b] = rgb(c).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
    if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
  }
  const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.sqrt((x[0] - y[0]) ** 2 * 0.3 + (x[1] - y[1]) ** 2 * 0.59 + (x[2] - y[2]) ** 2 * 0.11); };
  const readable = (bg, dark = '#14161B', light = '#FFFFFF') => (T.contrast(light, bg) >= T.contrast(dark, bg) ? light : dark);
  C.readable = readable;
  const isSolid = (f) => typeof f === 'string' && f !== 'none' && !/^url|transparent/.test(f) && (R.parseColor(f) || {}).a !== 0;

  // tasarımı metinsiz çizip bir kutunun ortalama rengini bulur
  async function sampler(d, without) {
    const sc = Math.min(1, 420 / Math.max(d.width, d.height));
    const bare = Object.assign({}, d, { layers: d.layers.filter((l) => l.visible !== false && !without(l)) });
    const c = await R.exportCanvas(bare, sc, '#ffffff');
    const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    return (x, y, w, h) => {
      const x0 = Math.max(0, Math.floor(x * sc)), y0 = Math.max(0, Math.floor(y * sc)), x1 = Math.min(c.width, Math.ceil((x + w) * sc)), y1 = Math.min(c.height, Math.ceil((y + h) * sc));
      let r = 0, g = 0, b = 0, n = 0, lo = 1, hi = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * c.width + xx) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; const L = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255; lo = Math.min(lo, L); hi = Math.max(hi, L); }
      if (!n) return null;
      return { avg: toHex(r / n, g / n, b / n), busy: hi - lo > 0.55 };
    };
  }

  // ======================================================================
  // 1) TASARIM KOÇU
  // ======================================================================
  const visible = (d) => d.layers.filter((l) => l.visible !== false && !l.locked);
  const isBgLike = (d, l) => l.w >= d.width * 0.92 && l.h >= d.height * 0.92;
  const texts = (d) => visible(d).filter((l) => l.type === 'text' && R.plain(l.text || '').trim());
  const minText = (d) => Math.max(12, Math.round(Math.min(d.width, d.height) * 0.022));
  const name = (l) => `“${esc((l.type === 'text' ? R.plain(l.text).split('\n')[0] : l.name || 'Öğe').slice(0, 26))}”`;

  async function analyze(d) {
    const out = [], add = (k, sev, title, text, ls, fix) => out.push({ k, sev, title, text, ls: ls || [], fix });
    const W = d.width, H = d.height, M = Math.round(Math.min(W, H) * 0.045);
    const deco = (l) => l.of || /^(Sahne|Podyum|Süs)( · |$)|^(Temas gölgesi|Yansıma|Tabak gölgesi|Spot ışık|Alt karartma|Renk paneli|Podyum gövdesi|Ayraç)$/.test(l.name || '') || (l.role === 'photo' && (l.x < 0 || l.y < 0 || l.x + l.w > d.width || l.y + l.h > d.height));
    const ls = visible(d).filter((l) => !isBgLike(d, l) && l.w > 2 && l.h > 2 && !deco(l));
    const ts = texts(d).filter((l) => !deco(l));
    ts.forEach((l) => R.layoutText(l));

    // a) neredeyse hizalı öğeler (1–2 px'lik kaymalar göze batar)
    const tol = Math.max(2.5, Math.min(W, H) * 0.0065), done = new Set();
    const edges = (l) => {
      if (l.type === 'text') return l.align === 'center' ? [['orta', l.x + l.w / 2]] : l.align === 'right' ? [['sağ', l.x + l.w]] : [['sol', l.x]];
      return [['sol', l.x], ['orta', l.x + l.w / 2], ['sağ', l.x + l.w]];
    };
    // büyük öğeler referanstır; küçük olan büyüğe hizalanır. Bir çiftte yalnız biri taşınır.
    const bySize = ls.filter((l) => !l.rotation).sort((a, b) => b.w * b.h - a.w * a.h);
    for (const l of bySize.slice().reverse()) {
      if (done.has(l.id) || l.group) continue;
      let best = null, ref = null;
      for (const [, v] of edges(l)) {
        const cands = [[W / 2, null]];
        bySize.forEach((o) => { if (o !== l && (o.w * o.h >= l.w * l.h || done.has(o.id))) edges(o).forEach(([, ov]) => cands.push([ov, o])); });
        for (const [c, o] of cands) { const dd = c - v; if (Math.abs(dd) > 0.6 && Math.abs(dd) <= tol && (best == null || Math.abs(dd) < Math.abs(best))) { best = dd; ref = o; } }
      }
      if (best != null) { done.add(l.id); if (ref) done.add(ref.id); const dd = best; add('align', 1, 'Neredeyse hizalı', `${name(l)} ${ref ? name(ref) + ' ile' : 'tuval ortasıyla'} ${Math.abs(dd).toFixed(1)} px kayık — tam hizaya alınacak.`, [l].concat(ref ? [ref] : []), () => { l.x = r1(l.x + dd); }); }
    }
    // b) güvenli kenar payı (gruplar tek parça olarak taşınır)
    const units = [], seenG = new Set();
    ls.forEach((l) => {
      if (l.group) { if (seenG.has(l.group)) return; seenG.add(l.group); const m = ls.filter((x) => x.group === l.group); const x0 = Math.min(...m.map((x) => x.x)), y0 = Math.min(...m.map((x) => x.y)); units.push({ m, x: x0, y: y0, w: Math.max(...m.map((x) => x.x + x.w)) - x0, h: Math.max(...m.map((x) => x.y + x.h)) - y0, text: m.some((x) => x.type === 'text'), rot: m.some((x) => x.rotation), lead: m.find((x) => x.type === 'text') || m[0] }); }
      else units.push({ m: [l], x: l.x, y: l.y, w: l.w, h: l.h, text: l.type === 'text', rot: !!l.rotation, lead: l });
    });
    for (const u of units) {
      if (u.w > W * 0.85 || u.h > H * 0.85 || u.rot) continue;
      const bleedX = u.x <= 0.5 || u.x + u.w >= W - 0.5, bleedY = u.y <= 0.5 || u.y + u.h >= H - 0.5;
      if (!u.text && (bleedX || bleedY)) continue; // taşan süsler bilinçli
      const nx = Math.min(Math.max(u.x, M), W - M - u.w), ny = Math.min(Math.max(u.y, M), H - M - u.h);
      const dx = nx - u.x, dy = ny - u.y;
      if ((Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) && u.w < W - 2 * M && u.h < H - 2 * M) add('margin', u.text ? 3 : 1, 'Kenara çok yakın', `${name(u.lead)}${u.m.length > 1 ? ' grubu' : ''} kenara ${Math.max(0, Math.round(Math.min(u.x, u.y, W - u.x - u.w, H - u.y - u.h)))} px uzaklıkta; telefonda kesilebilir. ${M} px güvenli paya alınacak.`, u.m, () => u.m.forEach((l) => { l.x = r1(l.x + dx); l.y = r1(l.y + dy); }));
    }
    // c) çok fazla yazı tipi
    const fams = {}, famN = {}; ts.forEach((l) => { fams[l.fontFamily] = (fams[l.fontFamily] || 0) + R.plain(l.text).length; famN[l.fontFamily] = (famN[l.fontFamily] || 0) + 1; });
    // tek bir kısa vurgu yazısı (el yazısı imza gibi) üçüncü font sayılmaz
    Object.keys(fams).forEach((f) => { if (Object.keys(fams).length > 2 && famN[f] === 1 && fams[f] <= 22) delete fams[f]; });
    if (Object.keys(fams).length > 2) {
      const big = ts.slice().sort((a, b) => b.fontSize - a.fontSize)[0];
      const head = big.fontFamily, body = Object.entries(fams).filter(([f]) => f !== head).sort((a, b) => b[1] - a[1])[0][0];
      add('fonts', 2, 'Çok fazla yazı tipi', `${Object.keys(fams).length} farklı yazı tipi var (${Object.keys(fams).map(esc).join(', ')}). Profesyonel işlerde en fazla 2 kullanılır: başlıklar ${esc(head)}, metinler ${esc(body)} olacak.`, ts, () => C.unifyFonts(d, head, body));
    }
    // d) küçük yazı
    const mt = minText(d);
    ts.filter((l) => +l.fontSize < mt).forEach((l) => add('small', 2, 'Yazı çok küçük', `${name(l)} ${Math.round(l.fontSize)} px; telefonda okunmaz. En az ${mt} px olacak.`, [l], () => { const k = mt / l.fontSize; l.fontSize = mt; if (l.align === 'center') { const cx = l.x + l.w / 2; l.w = Math.min(W - l.x, l.w * Math.min(k, 1.4)); l.x = r1(cx - l.w / 2); } }));
    // e) kontrast
    try {
      const smp = await sampler(d, (x) => x.type === 'text');
      for (const l of ts) {
        if (!isSolid(l.fill) || (l.stroke && +l.strokeWidth > 1) || (l.shadow && +l.shadow.blur >= l.fontSize * 0.2)) continue;
        const s = smp(l.x, l.y, l.w, l.h); if (!s) continue;
        const cr = T.contrast(hex(l.fill), s.avg), need = +l.fontSize >= 40 || (+l.fontSize >= 28 && +l.fontWeight >= 700) ? 3 : 4.5;
        if (cr < need) {
          const [hh, ss, ll] = hsl(l.fill), dk = [fromHsl(hh, Math.min(ss, 0.6), 0.12), '#14161B'], lt = [fromHsl(hh, Math.min(ss, 0.5), 0.97), '#FFFFFF'];
          const opts = (ll > 0.5 ? [...lt, ...dk] : [...dk, ...lt]).map((c) => [c, T.contrast(c, s.avg)]);
          const nc = (opts.find(([, v]) => v >= need) || opts.sort((a, b) => b[1] - a[1])[0])[0];
          add('contrast', 3, 'Okunması zor', `${name(l)} zeminine göre kontrastı ${(Math.floor(cr * 10) / 10).toFixed(1)}:1 (en az ${need}:1 olmalı). ${s.busy ? 'Zemin karışık; yazının altına yarı saydam bant da eklenebilir. ' : ''}Renk ${T.lum(nc) > 0.5 ? 'açık' : 'koyu'} yapılacak${T.contrast(nc, s.avg) < need ? ' ve okunurluk için hafif gölge eklenecek' : ''}.`, [l], () => { l.fill = nc; if (s.busy || T.contrast(nc, s.avg) < need) l.shadow = { x: 0, y: Math.max(1, l.fontSize * 0.03), blur: Math.max(4, l.fontSize * 0.25), color: nc === '#FFFFFF' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)' }; });
        }
      }
    } catch (e) {}
    // f) yalnız kalan kelime (dul satır)
    ts.forEach((l) => {
      const lines = l._lines || []; if (lines.length < 2 || l.curve || /\n/.test(String(l.text))) return;
      const last = String(lines[lines.length - 1]).trim();
      if (last && !/\s/.test(last) && last.length <= 12 && String(lines[lines.length - 2]).trim().split(/\s+/).length >= 2 && R.measure(String(lines[lines.length - 2]).trim().split(/\s+/).pop() + ' ' + last, l) < l.w * 0.97) add('widow', 1, 'Tek kalan kelime', `${name(l)} son satırda tek kelime (“${esc(last)}”) kalıyor. Son iki kelime birlikte taşınacak.`, [l], () => { const t = String(l.text).replace(/\s+$/, ''); if (/\u00a0\S+$/.test(t)) return; const i = t.lastIndexOf(' '); const two = t.slice(t.slice(0, i).lastIndexOf(' ') + 1); const tw = R.measure(l.uppercase ? two.toLocaleUpperCase('tr-TR') : two, l); const before = l.text; if (i > 0 && t.slice(0, i).trim().includes(' ') && tw < l.w * 0.97) l.text = t.slice(0, i) + '\u00a0' + t.slice(i + 1); R.layoutText(l); const up = (x) => (l.uppercase ? x.toLocaleUpperCase('tr-TR') : x); const okW = String(l.text).split(/[\s\u00a0]+/).filter(Boolean).every((w) => (l._lines || []).some((ln) => String(ln).split(/[\s\u00a0]+/).includes(up(w)))); if (!okW) { l.text = before; R.layoutText(l); } });
    });
    // f2) Türkçe tipografi: düz tırnak → “ ”, kesme → ’; küçük büyük harfli yazıya harf aralığı; “250 TL” → “₺250”
    ts.forEach((l) => {
      const t = String(l.text);
      if (/["']/.test(R.plain(t)) && !/\{#/.test(t)) {
        const nt = t.replace(/(^|[\s(\[{])"/g, '$1“').replace(/"/g, '”').replace(/(\p{L})'(\p{L})/gu, '$1’$2').replace(/(^|\s)'/g, '$1‘').replace(/'/g, '’');
        if (nt !== t) add('quotes', 1, 'Tırnak ve kesme işareti', `${name(l)} içinde düz tırnak (" ') var. Basılı işlerde “kıvrık tırnak” ve ’ kesme işareti kullanılır.`, [l], () => { l.text = nt; });
      }
      const caps = l.uppercase || (R.plain(t).replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '').length > 3 && R.plain(t) === R.plain(t).toLocaleUpperCase('tr-TR'));
      if (caps && +l.fontSize < Math.min(d.width, d.height) * 0.05 && (+l.letterSpacing || 0) < l.fontSize * 0.03 && !l.priceRole) add('caps', 1, 'Büyük harf aralığı', `${name(l)} büyük harfle ve küçük boyutta; harfler sıkışık görünüyor. Harf aralığı açılacak.`, [l], () => { l.letterSpacing = Math.round(l.fontSize * 0.08 * 10) / 10; });
      const m = R.plain(t).match(/(\d[\d.]*(?:,\d{1,2})?)\s?(TL|tl)\b/);
      if (m && !l.priceRole) add('price', 1, 'Fiyat yazımı', `${name(l)} içinde “${esc(m[0])}” yazıyor. Türk lirası simgesiyle “₺${esc(m[1])}” daha düzgün görünür.`, [l], () => { l.text = String(l.text).replace(/(\d[\d.]*(?:,\d{1,2})?)\s?(TL|tl)\b/g, '₺$1'); });
    });
    // g) birbirine çok yakın renkler (gereksiz tonlar)
    const used = {};
    const reg = (c, l, key) => { if (!isSolid(c)) return; const h = hex(c); (used[h] = used[h] || []).push([l, key]); };
    if (d.background && d.background.type === 'solid') reg(d.background.color, null, 'bg');
    visible(d).forEach((l) => { reg(l.fill, l, 'fill'); if (l.stroke && +l.strokeWidth > 0) reg(l.stroke, l, 'stroke'); });
    const cols = Object.keys(used).sort((a, b) => used[b].length - used[a].length);
    const merged = new Set();
    cols.forEach((c, i) => cols.slice(i + 1).forEach((o) => {
      if (merged.has(o) || merged.has(c)) return;
      const dd = dist(c, o);
      if (dd > 0.5 && dd < 9) { merged.add(o); add('colors', 1, 'Neredeyse aynı renkler', `<span class="cc-sw" style="background:${c}"></span><span class="cc-sw" style="background:${o}"></span> ${c} ile ${o} gözle ayırt edilmiyor ama ayrı tonlar; tek renkte birleştirilecek.`, used[o].map((x) => x[0]).filter(Boolean), () => used[o].forEach(([l, k]) => { if (!l) d.background.color = c; else l[k] = c; })); }
    }));
    if (cols.length - merged.size > 7) add('palette', 1, 'Renk sayısı fazla', `${cols.length - merged.size} farklı renk kullanılmış. 3–5 renk daha düzenli görünür. <b>Renk uyumu</b> ile tek dokunuşta uyumlu bir palet uygulayabilirsin.`, [], null);
    // h) dikey aralıklar tutarsız (alt alta dizili yazılar)
    const col = ts.filter((l) => !l.rotation).sort((a, b) => a.y - b.y);
    const groups = [];
    col.forEach((l) => { const g = groups.find((g) => Math.abs(g.key(l)) < tol * 2); if (g) g.items.push(l); else { const a = l.align || 'left'; const ref = a === 'center' ? l.x + l.w / 2 : a === 'right' ? l.x + l.w : l.x; groups.push({ items: [l], key: (o) => (a === 'center' ? o.x + o.w / 2 : a === 'right' ? o.x + o.w : o.x) - ref }); } });
    groups.filter((g) => g.items.length >= 3).forEach((g) => {
      const it = g.items, gaps = it.slice(1).map((l, i) => l.y - (it[i].y + it[i].h));
      if (gaps.some((x) => x < -2)) return;
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length, spread = Math.max(...gaps) - Math.min(...gaps);
      if (spread > Math.max(8, avg * 0.6) && spread < H * 0.25) add('rhythm', 1, 'Aralıklar düzensiz', `Alt alta duran ${it.length} yazının arası ${gaps.map((x) => Math.round(x)).join(', ')} px. Eşit ritim için aralar ${Math.round(avg)} px'e getirilecek.`, it, () => { let y = it[0].y + it[0].h; it.slice(1).forEach((l) => { l.y = r1(y + avg); y = l.y + l.h; }); });
    });
    // i) tuvalden taşan yazı
    ts.forEach((l) => { if (l.rotation) return; if (l.x < -1 || l.y < -1 || l.x + l.w > W + 1 || l.y + l.h > H + 1) add('outside', 3, 'Yazı tuvalden taşıyor', `${name(l)} kısmen tuvalin dışında; indirince kesilir.`, [l], () => { if (l.w > W - 2 * M) l.w = W - 2 * M; R.layoutText(l); l.x = r1(Math.min(Math.max(l.x, M), W - M - l.w)); l.y = r1(Math.min(Math.max(l.y, M), H - M - l.h)); }); });
    // j) yazı ölçeği (çok fazla farklı boyut)
    const sizes = [...new Set(ts.map((l) => Math.round(l.fontSize)))].sort((a, b) => b - a);
    const close = sizes.slice(1).filter((x, i) => sizes[i] / x < 1.1 && sizes[i] - x >= 2);
    if (sizes.length >= 4 && close.length) add('scale', 1, 'Yazı boyutları dağınık', `${sizes.length} farklı boyut var (${sizes.join(', ')}); bazıları birbirine çok yakın, hiyerarşi belirsiz. Uyumlu bir ölçeğe (1,25 oran) oturtulacak.`, ts, () => C.applyScale(d, 1.25));
    return out;
  }
  C.analyze = analyze;

  // kalite kapısı: şablon açılırken güvenli düzeltmeleri sessizce uygula
  C.autoPolish = async function (d, kinds = ['contrast', 'margin', 'widow', 'small', 'outside', 'align', 'quotes', 'caps']) {
    let n = 0;
    for (let pass = 0; pass < 2; pass++) {
      const iss = (await analyze(d)).filter((i) => i.fix && kinds.includes(i.k));
      if (!iss.length) break;
      iss.forEach((i) => { try { i.fix(); n++; } catch (e) {} });
      d.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
      if (window.Food) window.Food.reflowPrices(d);
    }
    return n;
  };
  C.unifyFonts = function (d, head, body) {
    const ts = texts(d), mx = Math.max(...ts.map((l) => +l.fontSize));
    ts.forEach((l) => {
      const fam = +l.fontSize >= mx * 0.55 ? head : body;
      if (l.fontFamily !== fam) { l.fontFamily = fam; if (window.Fonts) l.fontWeight = window.Fonts.nearestWeight(fam, +l.fontWeight || 400); if (l.italic && window.Fonts && !window.Fonts.hasItalic(fam)) l.italic = false; }
    });
  };
  // modüler ölçek: en sık kullanılan küçük boyutu taban alıp her boyutu en yakın basamağa oturtur
  C.applyScale = function (d, ratio = 1.25, base) {
    const ts = texts(d); if (!ts.length) return;
    const cnt = {}; ts.forEach((l) => { const k = Math.round(l.fontSize); cnt[k] = (cnt[k] || 0) + R.plain(l.text).length; });
    base = base || +Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
    base = Math.max(minText(d), base);
    const steps = []; for (let i = -2; i <= 9; i++) steps.push(Math.round(base * Math.pow(ratio, i)));
    ts.forEach((l) => {
      const s = steps.reduce((a, b) => (Math.abs(Math.log(b / l.fontSize)) < Math.abs(Math.log(a / l.fontSize)) ? b : a));
      if (s === Math.round(l.fontSize)) return;
      const ow = l.w, k = s / l.fontSize; l.fontSize = Math.max(minText(d), s);
      if (k > 1) { const nw = Math.min(d.width - 2, ow * k); if (l.align === 'center') l.x = r1(l.x + (ow - nw) / 2); else if (l.align === 'right') l.x = r1(l.x + ow - nw); l.w = r1(nw); l.x = Math.max(0, l.x); }
    });
    return steps;
  };

  function score(issues) { const per = {}; issues.forEach((i) => { per[i.k] = (per[i.k] || 0) + (i.sev === 3 ? 10 : i.sev === 2 ? 6 : 3); }); const p = Object.entries(per).reduce((a, [k, v]) => a + Math.min(v, k === 'contrast' || k === 'outside' ? 24 : 12), 0); return Math.max(10, 100 - p); }
  const KIND = { quotes: 'Tipografi', caps: 'Tipografi', price: 'Tipografi', align: 'Hizalama', margin: 'Kenar payı', fonts: 'Yazı tipi', small: 'Okunabilirlik', contrast: 'Okunabilirlik', widow: 'Tipografi', colors: 'Renk', palette: 'Renk', rhythm: 'Aralık', outside: 'Yerleşim', scale: 'Tipografi' };

  C.coach = async function () {
    const e = E(); if (!e) return;
    const d = e.doc;
    let issues = await analyze(d);
    const before = score(issues);
    await UI().dialog(`<div class="d-body coach"><div class="cc-head"><div class="cc-score" id="ccS"></div><div><h3>Tasarım koçu</h3><p class="muted" id="ccSub"></p></div></div>
      <div class="cc-tools"><button class="chip" id="ccScale">${icon('type')}Yazı ölçeği</button><button class="chip" id="ccHarm">${icon('harmony')}Renk uyumu</button><button class="chip" id="ccPair">${icon('type')}Yazı tiplerini eşleştir</button><button class="chip" id="ccInfo">${icon('info')}Bilgilerimi yerleştir</button></div>
      <div class="cc-list" id="ccL"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="ccAll">${icon('wand')}<span>Hepsini düzelt</span></button></div>`, {
      cls: 'coach-dlg',
      onOpen: (box, close) => {
        const L = $('#ccL', box);
        const draw = () => {
          const s = score(issues);
          $('#ccS', box).innerHTML = `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="bg"/><circle cx="22" cy="22" r="19" class="fg" style="stroke-dasharray:${(s / 100) * 119.4} 200;stroke:${s >= 85 ? '#1FA971' : s >= 65 ? '#F2A230' : '#E5484D'}"/></svg><b>${s}</b>`;
          $('#ccSub', box).innerHTML = issues.length ? `${issues.length} öneri. Her birini tek tek ya da hepsini birden düzeltebilirsin; geri almak için Ctrl+Z.` : 'Harika — hizalama, kenar payı, okunabilirlik ve renkler yerinde.';
          L.innerHTML = issues.length ? issues.map((it, i) => `<div class="cc-it s${it.sev}" data-i="${i}"><span class="cc-k">${KIND[it.k] || ''}</span><div><b>${it.title}</b><p>${it.text}</p></div>${it.fix ? `<button class="btn sm" data-fix="${i}">${icon('check')}Düzelt</button>` : it.k === 'palette' ? `<button class="btn sm" data-harm>${icon('harmony')}Aç</button>` : ''}</div>`).join('')
            : `<div class="cc-ok">${icon('check')}<b>Düzeltilecek bir şey bulunamadı</b><span class="muted">Yazı ölçeği ve renk uyumuyla daha da ileri gidebilirsin.</span></div>`;
          $('#ccAll', box).disabled = !issues.some((i) => i.fix);
        };
        const refresh = async () => { issues = await analyze(d); draw(); };
        const apply = async (list) => { list.forEach((it) => { try { it.fix(); } catch (er) {} }); texts(d).forEach((l) => R.layoutText(l)); e.relayout(); e.commit(); await refresh(); };
        L.onmouseover = (ev) => { const it = ev.target.closest('.cc-it'); if (!it) return; const x = issues[+it.dataset.i]; if (x && x.ls.length) e.select(x.ls.map((l) => l.id), false, true); };
        L.onclick = async (ev) => {
          if (ev.target.closest('[data-harm]')) { close(); C.harmony(); return; }
          const b = ev.target.closest('[data-fix]'); if (!b) return;
          const row = b.closest('.cc-it'); row.classList.add('done');
          await apply([issues[+b.dataset.fix]]);
        };
        $('#ccAll', box).onclick = async (ev) => {
          const btn = ev.currentTarget; btn.disabled = true;
          for (let pass = 0; pass < 3 && issues.some((i) => i.fix); pass++) await apply(issues.filter((i) => i.fix));
          const s = score(issues); toast(`Tasarım puanı ${before} → ${s}`); window.Features && window.Features.splashFrom && window.Features.splashFrom(btn);
        };
        $('#ccScale', box).onclick = () => { close(); C.scaleDialog(); };
        $('#ccHarm', box).onclick = () => { close(); C.harmony(); };
        $('#ccInfo', box).onclick = async () => { C.fillInfo(); await refresh(); };
        $('#ccPair', box).onclick = async () => {
          if (!window.Fonts) return; const r = await window.Fonts.pick(null, { cat: 'pairs' }); if (!r || !r.pair) return;
          await Promise.all(r.pair.map((f) => window.Fonts.ensureFamily(f).catch(() => {})));
          C.unifyFonts(d, r.pair[0], r.pair[1]); await R.ensureDocFonts(d).catch(() => {}); texts(d).forEach((l) => R.layoutText(l)); e.relayout(); e.commit(); await refresh();
          toast(`Başlıklar ${r.pair[0]}, metinler ${r.pair[1]}`);
        };
        draw();
      },
    });
  };

  C.scaleDialog = async function () {
    const e = E(); if (!e) return; const d = e.doc;
    const RAT = [[1.125, 'Sakin', 'kurumsal, bilgi yoğun'], [1.2, 'Dengeli', 'katalog, etiket'], [1.25, 'Klasik', 'çoğu tasarım için'], [1.333, 'Belirgin', 'sosyal medya, ürün'], [1.5, 'Güçlü', 'afiş, indirim'], [1.618, 'Altın oran', 'çarpıcı başlıklar']];
    const snap = JSON.stringify(d.layers.filter((l) => l.type === 'text').map((l) => [l.id, l.fontSize, l.x, l.w]));
    const restore = () => { const m = new Map(JSON.parse(snap).map((a) => [a[0], a])); d.layers.forEach((l) => { const a = m.get(l.id); if (a) { l.fontSize = a[1]; l.x = a[2]; l.w = a[3]; R.layoutText(l); } }); };
    const ok = await UI().dialog(`<div class="d-body"><h3>${icon('type')} Yazı ölçeği</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Tüm yazı boyutları tek bir orana göre basamaklanır: başlık, alt başlık ve metin arasındaki ilişki profesyonel tasarımlardaki gibi tutarlı olur. Seçince tuvalde canlı görürsün.</p>
      <div class="sc-grid">${RAT.map(([r, t, s]) => `<button class="sc-it" data-r="${r}"><span class="sc-bars">${[3, 2, 1, 0].map((i) => `<i style="height:${Math.round(6 * Math.pow(r, i))}px"></i>`).join('')}</span><b>${t} · ${r}</b><small>${s}</small></button>`).join('')}</div>
      <div class="exp-row" style="margin-top:12px"><span>Metin boyutu</span><input type="range" id="scB" min="${minText(d)}" max="${Math.round(Math.min(d.width, d.height) * 0.06)}" value="${Math.round(Math.min(d.width, d.height) * 0.032)}"><output id="scBo"></output></div></div>
      <div class="d-foot"><button class="btn ghost" id="scNo">Vazgeç</button><button class="btn primary" id="scOk">${icon('check')}Uygula</button></div>`, {
      onOpen: (box, close) => {
        let r = 1.25;
        const run = () => { restore(); C.applyScale(d, r, +$('#scB', box).value); texts(d).forEach((l) => R.layoutText(l)); e.relayout(); e.commit(false); $('#scBo', box).textContent = $('#scB', box).value + ' px'; $$('.sc-it', box).forEach((b) => b.classList.toggle('on', +b.dataset.r === r)); };
        $$('.sc-it', box).forEach((b) => (b.onclick = () => { r = +b.dataset.r; run(); }));
        $('#scB', box).oninput = run;
        $('#scNo', box).onclick = () => close(false);
        $('#scOk', box).onclick = () => close(true);
        run();
      },
    });
    if (!ok) { restore(); e.relayout(); }
    e.commit();
  };

  // ======================================================================
  // 2) RENK UYUMU
  // ======================================================================
  const SCHEMES = [
    ['brand', 'Marka renklerim'],
    ['mono', 'Tek renk tonları', (h) => [h, h, h]],
    ['analog', 'Komşu renkler', (h) => [h, h + 30, h - 30]],
    ['comp', 'Tamamlayıcı', (h) => [h, h + 180, h]],
    ['split', 'Ayrık tamamlayıcı', (h) => [h, h + 150, h + 210]],
    ['triad', 'Üçlü', (h) => [h, h + 120, h + 240]],
    ['dark', 'Koyu lüks', (h) => [h, h + 35, h]],
    ['pastel', 'Pastel', (h) => [h, h + 40, h - 40]],
  ];
  function palette(kind, base) {
    if (kind === 'photo' && C._photoP) return C._photoP;
    if (kind === 'ref' && C._refP) return C._refP;
    const [h, s0, l0] = hsl(base), s = Math.max(0.45, s0), bc = (brand().colors || []).filter(Boolean);
    if (kind === 'brand' && bc.length) {
      const sorted = bc.slice().sort((a, b) => T.lum(a) - T.lum(b));
      const ink = T.lum(sorted[0]) < 0.08 ? sorted[0] : fromHsl(hsl(bc[0])[0], 0.25, 0.1);
      return { bg: fromHsl(hsl(bc[0])[0], 0.3, 0.965), ink, a: bc[0], b: bc[1] || fromHsl(hsl(bc[0])[0] + 30, 0.6, 0.45), soft: fromHsl(hsl(bc[0])[0], 0.45, 0.88) };
    }
    const sc = SCHEMES.find((x) => x[0] === kind) || SCHEMES[3], [ha, hb, hc] = sc[2](h);
    if (kind === 'dark') return { bg: fromHsl(ha, 0.25, 0.09), ink: '#F7F3EA', a: fromHsl(ha, Math.min(0.75, s), 0.6), b: fromHsl(hb, 0.55, 0.7), soft: fromHsl(ha, 0.2, 0.18) };
    if (kind === 'pastel') return { bg: fromHsl(ha, 0.6, 0.95), ink: fromHsl(ha, 0.35, 0.16), a: fromHsl(ha, 0.6, 0.72), b: fromHsl(hb, 0.55, 0.78), soft: fromHsl(hc, 0.55, 0.87) };
    if (kind === 'mono') return { bg: fromHsl(ha, 0.35, 0.96), ink: fromHsl(ha, 0.4, 0.12), a: fromHsl(ha, s, 0.48), b: fromHsl(ha, s * 0.8, 0.3), soft: fromHsl(ha, s * 0.6, 0.86) };
    return { bg: fromHsl(ha, 0.3, 0.965), ink: fromHsl(ha, 0.3, 0.11), a: fromHsl(ha, s, Math.min(0.55, Math.max(0.42, l0))), b: fromHsl(hb, s * 0.9, 0.5), soft: fromHsl(hc, s * 0.55, 0.87) };
  }
  C.palette = palette;
  C.recolor = (d, P) => recolor(d, P);
  // tasarımdaki renkleri rollerine göre sınıflar: zemin, yazı, vurgu, ikinci vurgu, yumuşak
  function roles(d) {
    const area = {}, add = (c, a, isText) => { if (!isSolid(c)) return; const h = hex(c); area[h] = area[h] || { a: 0, t: 0 }; area[h][isText ? 't' : 'a'] += a; };
    if (d.background && d.background.type === 'solid') add(d.background.color, d.width * d.height * 0.5);
    d.layers.forEach((l) => { if (l.visible === false) return; if (l.type === 'text') add(l.fill, Math.max(1, l.w * l.fontSize * 0.3), true); else if (l.type !== 'image') { add(l.fill, l.w * l.h); if (l.stroke && +l.strokeWidth > 0) add(l.stroke, (l.w + l.h) * l.strokeWidth); } });
    const map = {};
    Object.entries(area).forEach(([c, v]) => {
      const [, s, L] = hsl(c), sat = s * (1 - Math.abs(L - 0.5) * 1.6);
      map[c] = L > 0.9 && sat < 0.25 ? (v.a > v.t * 3 ? 'bg' : 'light') : L < 0.18 ? 'ink' : sat > 0.28 ? 'accent' : L > 0.7 ? 'soft' : 'ink';
    });
    // en büyük alanlı vurgu 'a', diğerleri sırayla 'b' / 'soft'
    const acc = Object.keys(map).filter((c) => map[c] === 'accent').sort((x, y) => area[y].a + area[y].t - area[x].a - area[x].t);
    acc.forEach((c, i) => (map[c] = i === 0 ? 'a' : i === 1 ? 'b' : 'soft'));
    return map;
  }
  function recolor(d, P) {
    const map = roles(d), pick = (c, isText) => {
      if (!isSolid(c)) return c; const r = map[hex(c)]; const al = (R.parseColor(c) || {}).a;
      let n = r === 'bg' ? P.bg : r === 'light' ? (isText ? '#FFFFFF' : P.bg) : r === 'ink' ? P.ink : r === 'a' ? P.a : r === 'b' ? P.b : r === 'soft' ? P.soft : c;
      if (al != null && al < 1) { const [x, y, z] = rgb(n); n = `rgba(${x},${y},${z},${al})`; }
      return n;
    };
    const nd = JSON.parse(JSON.stringify(d));
    if (nd.background && nd.background.type === 'solid') nd.background.color = pick(nd.background.color);
    else if (nd.background && nd.background.colors) nd.background.colors = nd.background.colors.map((c) => pick(c));
    nd.layers.forEach((l) => {
      if (l.type === 'text') return;
      if (typeof l.fill === 'object' && l.fill && l.fill.colors) l.fill.colors = l.fill.colors.map((c) => pick(c)); else l.fill = pick(l.fill);
      if (l.stroke) l.stroke = pick(l.stroke);
    });
    return nd;
  }
  // yazı renklerini yeni zemine göre okunur yap (rolü korur: koyu yazı koyu kalır, olmuyorsa beyaz)
  async function fixTextColors(nd, P) {
    const smp = await sampler(nd, (x) => x.type === 'text').catch(() => null);
    nd.layers.forEach((l) => {
      if (l.type !== 'text' || !isSolid(l.fill)) return;
      const bgc = smp ? (smp(l.x, l.y, l.w, l.h) || {}).avg || P.bg : P.bg;
      const [, s, L] = hsl(l.fill), cand = s > 0.35 ? [P.a, P.b, P.ink, '#FFFFFF'] : L > 0.85 ? ['#FFFFFF', P.bg, P.ink] : [P.ink, '#FFFFFF', P.a];
      const ok = cand.find((c) => T.contrast(c, bgc) >= (+l.fontSize >= 40 ? 3 : 4.5));
      l.fill = ok || readable(bgc, P.ink);
    });
    return nd;
  }
  C.fixTextColors = (d, P) => fixTextColors(d, P);
  C.harmony = async function () {
    const e = E(); if (!e) return; const d = e.doc;
    const bc = (brand().colors || []).filter(Boolean);
    const map = roles(d), accs = Object.keys(map).filter((c) => map[c] === 'a');
    let base = accs[0] || bc[0] || '#E2197C', kind = bc.length ? 'brand' : 'comp';
    const ph = d.layers.filter((l) => l.type === 'image' && l.visible !== false).sort((x, y) => (y.role === 'photo') - (x.role === 'photo') || y.w * y.h - x.w * x.h)[0];
    C._photoP = ph && window.Food ? await window.Food.paletteFromImage(ph.src).catch(() => null) : null;
    if (C._photoP) kind = 'photo';
    const W = 150, sc = W / Math.max(d.width, d.height);
    const ok = await UI().dialog(`<div class="d-body harm"><h3>${icon('harmony')} Renk uyumu</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Bir ana renk seç; renk çarkı kurallarıyla uyumlu bir palet kurulur ve tasarımdaki renkler <b>rollerine göre</b> (zemin, yazı, vurgu) değişir. Yazı renkleri yeni zemine göre okunur hale getirilir.</p>
      <div class="hm-base"><span>Ana renk</span><label class="bc-sw" style="background:${base}"><input type="color" id="hmC" value="${base}"></label>${[...new Set([...bc, ...accs])].slice(0, 6).map((c) => `<button class="hm-q" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
      <div class="hm-grid" id="hmG"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="hmOk">${icon('check')}Uygula</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let busy = 0;
        const draw = async () => {
          const my = ++busy;
          const kinds = [...(C._photoP ? [['photo', 'Ürün fotoğrafından']] : []), ...(C._refP ? [['ref', 'Örnek tasarımdan']] : []), ...SCHEMES.filter(([k]) => k !== 'brand' || bc.length)];
          $('#hmG', box).innerHTML = kinds.map(([k, t]) => { const P = palette(k, base); return `<button class="hm-it${k === kind ? ' on' : ''}" data-k="${k}"><span class="hm-prev" style="width:${Math.round(d.width * sc)}px;height:${Math.round(d.height * sc)}px"></span><span class="hm-sw">${[P.bg, P.ink, P.a, P.b, P.soft].map((c) => `<i style="background:${c}"></i>`).join('')}</span><b>${t}</b></button>`; }).join('');
          $$('.hm-it', box).forEach((b) => (b.onclick = () => { kind = b.dataset.k; $$('.hm-it', box).forEach((x) => x.classList.toggle('on', x === b)); }));
          for (const [k] of kinds) {
            if (my !== busy) return;
            const P = palette(k, base), nd = await fixTextColors(recolor(d, P), P);
            const el = $(`.hm-it[data-k="${k}"] .hm-prev`, box); if (el) el.innerHTML = R.renderSVG(nd, { fit: true, prefix: 'hm' + k + my + '_' });
          }
        };
        const setBase = (c) => { base = hex(c); $('.hm-base .bc-sw', box).style.background = base; $('#hmC', box).value = base; if (['brand', 'photo', 'ref'].includes(kind)) kind = 'comp'; draw(); };
        $('#hmC', box).onchange = (ev) => setBase(ev.target.value);
        $$('.hm-q', box).forEach((b) => (b.onclick = () => setBase(b.dataset.c)));
        $('#hmOk', box).onclick = () => close(true);
        draw();
      },
    });
    if (!ok) return;
    const P = palette(kind, base), nd = await fixTextColors(recolor(d, P), P);
    d.background = nd.background;
    const by = new Map(nd.layers.map((l) => [l.id, l]));
    d.layers.forEach((l) => { const n = by.get(l.id); if (!n) return; l.fill = n.fill; if (l.stroke) l.stroke = n.stroke; });
    e.commit(); toast('Renk uyumu uygulandı — beğenmezsen Ctrl+Z');
  };

  // ======================================================================
  // 3) ÜRÜN SAHNELERİ
  // ======================================================================
  const svgURL = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const fadeMask = (from = 0.55) => svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${from}"/><stop offset="0.75" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100" height="100" fill="#000"/><rect width="100" height="100" fill="url(#g)"/></svg>`);
  const lin = (colors, angle = 90, stops) => ({ type: 'linear', angle, colors, ...(stops ? { stops } : {}) });
  const rad = (colors, stops) => ({ type: 'radial', colors, ...(stops ? { stops } : {}) });
  const SCENES = [
    ['studio', 'Stüdyo beyazı', 'Temiz e-ticaret görünümü', (W, H, c) => [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: rad(['#FFFFFF', '#EEF0F3']) },
      { type: 'rect', name: 'Sahne · zemin', x: 0, y: H * 0.68, w: W, h: H * 0.32, fill: lin(['rgba(0,0,0,0)', 'rgba(20,22,27,0.06)'], 90) },
    ]],
    ['sweep', 'Sonsuz fon', 'Renkli kâğıt fon, yumuşak ufuk', (W, H, c) => [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: lin([fromHsl(hsl(c)[0], 0.45, 0.8), fromHsl(hsl(c)[0], 0.5, 0.9), fromHsl(hsl(c)[0], 0.45, 0.84)], 90, [0, 0.62, 1]) },
      { type: 'ellipse', name: 'Sahne · ışık', x: W * 0.1, y: H * 0.05, w: W * 0.8, h: H * 0.6, fill: rad(['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']) },
    ]],
    ['podium', 'Podyum', 'Ürünü kaide üstünde sergile', (W, H, c) => { const pw = W * 0.56, px = (W - pw) / 2, py = H * 0.66, eh = pw * 0.2; return [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: lin([fromHsl(hsl(c)[0], 0.4, 0.9), fromHsl(hsl(c)[0], 0.35, 0.82)], 90) },
      { type: 'ellipse', name: 'Sahne · arka daire', x: W * 0.18, y: H * 0.12, w: W * 0.64, h: W * 0.64, fill: fromHsl(hsl(c)[0], 0.45, 0.78) },
      { type: 'rect', name: 'Podyum · gövde', x: px, y: py + eh / 2, w: pw, h: H - py, fill: lin([fromHsl(hsl(c)[0], 0.35, 0.86), fromHsl(hsl(c)[0], 0.3, 0.74)], 0) },
      { type: 'ellipse', name: 'Podyum · üst', x: px, y: py, w: pw, h: eh, fill: fromHsl(hsl(c)[0], 0.4, 0.93) },
    ]; }],
    ['dark', 'Koyu lüks', 'Spot ışık, parfüm, saat, kozmetik', (W, H, c) => [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: rad(['#2A2C33', '#0C0D10']) },
      { type: 'ellipse', name: 'Sahne · spot', x: W * 0.15, y: H * 0.1, w: W * 0.7, h: H * 0.75, fill: rad([`rgba(${rgb(c).join(',')},0.35)`, 'rgba(0,0,0,0)']) },
      { type: 'rect', name: 'Sahne · yansıyan zemin', x: 0, y: H * 0.7, w: W, h: H * 0.3, fill: lin(['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'], 90) },
    ]],
    ['sun', 'Gün ışığı', 'Pencereden düşen sıcak ışık', (W, H, c) => [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: lin(['#F6EBDD', '#EBD8C2'], 90) },
      ...[0, 1, 2].map((i) => ({ type: 'rect', name: 'Sahne · ışık hüzmesi', x: W * (0.05 + i * 0.22), y: -H * 0.2, w: W * 0.11, h: H * 1.5, rotation: -28, fill: 'rgba(255,255,255,0.35)', filters: { blur: 18 } })),
      { type: 'rect', name: 'Sahne · masa', x: 0, y: H * 0.72, w: W, h: H * 0.28, fill: lin(['#D9BE9C', '#C9A982'], 90) },
    ]],
    ['split', 'İki renk', 'Cesur, sosyal medya için', (W, H, c) => [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: fromHsl(hsl(c)[0], 0.5, 0.93) },
      { type: 'path', name: 'Sahne · kemer', d: 'M0 100 L0 50 A50 50 0 0 1 100 50 L100 100 Z', vw: 100, vh: 100, x: W * 0.17, y: H * 0.14, w: W * 0.66, h: H * 0.86, fill: c },
    ]],
    ['marble', 'Taş tezgâh', 'Kozmetik, gıda, el yapımı', (W, H, c) => [
      { type: 'rect', name: 'Sahne · duvar', x: 0, y: 0, w: W, h: H * 0.7, fill: lin(['#F3F1EE', '#E6E2DC'], 90) },
      { type: 'rect', name: 'Sahne · tezgâh', x: 0, y: H * 0.7, w: W, h: H * 0.3, fill: lin(['#FAFAF9', '#E3E1DE'], 90) },
      { type: 'rect', name: 'Sahne · tezgâh kenarı', x: 0, y: H * 0.7, w: W, h: Math.max(2, H * 0.006), fill: 'rgba(0,0,0,0.08)' },
    ]],
    ['pastel', 'Pastel bloklar', 'Genç, eğlenceli ürünler', (W, H, c) => { const h = hsl(c)[0]; return [
      { type: 'rect', name: 'Sahne · fon', x: 0, y: 0, w: W, h: H, fill: fromHsl(h + 30, 0.6, 0.92) },
      { type: 'rect', name: 'Sahne · blok', x: W * 0.12, y: H * 0.6, w: W * 0.36, h: H * 0.4, fill: fromHsl(h, 0.55, 0.8), radius: 6 },
      { type: 'rect', name: 'Sahne · blok', x: W * 0.46, y: H * 0.68, w: W * 0.42, h: H * 0.32, fill: fromHsl(h - 40, 0.5, 0.84), radius: 6 },
      { type: 'ellipse', name: 'Sahne · top', x: W * 0.72, y: H * 0.18, w: W * 0.14, h: W * 0.14, fill: fromHsl(h + 70, 0.6, 0.78) },
    ]; }],
  ];
  const sceneThumb = (k, c) => { const s = SCENES.find((x) => x[0] === k); const d = R.normalize({ width: 120, height: 120, background: { type: 'solid', color: '#fff' }, layers: s[3](120, 120, c).map((l) => Object.assign({ visible: true, opacity: 1 }, l)) }); return R.renderSVG(d, { fit: true, prefix: 'sc' + k + Math.random().toString(36).slice(2, 5) }); };
  C.scenes = async function () {
    const e = E(); if (!e) return; const d = e.doc;
    const sel = e.state.sel.map((id) => d.layers.find((l) => l.id === id)).filter(Boolean);
    const prod = sel.find((l) => l.type === 'image') || null;
    let c = (brand().colors || [])[0] || '#C9A27A';
    const v = await UI().dialog(`<div class="d-body"><h3>${icon('scene')} Ürün sahnesi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Fon tuvalin en altına eklenir; ürün fotoğrafın üstte kalır. Dekupe (arka planı silinmiş) fotoğraflarla en iyi sonucu verir.</p>
      <div class="hm-base"><span>Sahne rengi</span><label class="bc-sw" style="background:${c}"><input type="color" id="scC" value="${hex(c)}"></label></div>
      <div class="scn-grid" id="scG"></div>
      <h4 style="margin:14px 0 6px">Seçili ürün fotoğrafına</h4>
      <div class="iconrow"><button class="btn sm" data-x="shadow" ${prod ? '' : 'disabled'}>${icon('circle')}Temas gölgesi</button><button class="btn sm" data-x="reflect" ${prod ? '' : 'disabled'}>${icon('flipV')}Yansıma</button><button class="btn sm" data-x="center" ${prod ? '' : 'disabled'}>${icon('target')}Sahneye oturt</button><button class="btn sm" data-x="cut" ${prod ? '' : 'disabled'}>${icon('wand')}Arka planı sil</button></div>
      ${prod ? '' : '<p class="muted" style="font-size:12px;margin:6px 0 0">Bu seçenekler için önce tuvalde ürün fotoğrafını seç.</p>'}</div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      onOpen: (box, close) => {
        const draw = () => { $('#scG', box).innerHTML = SCENES.map(([k, t, s]) => `<button class="scn-it" data-k="${k}"><span class="scn-th">${sceneThumb(k, c)}</span><b>${t}</b><small>${s}</small></button>`).join(''); $$('.scn-it', box).forEach((b) => (b.onclick = () => close('scene:' + b.dataset.k))); };
        $('#scC', box).oninput = (ev) => { c = ev.target.value; $('.bc-sw', box).style.background = c; draw(); };
        $$('[data-x]', box).forEach((b) => (b.onclick = () => close(b.dataset.x)));
        draw();
      },
    });
    if (!v) return;
    if (v.startsWith('scene:')) {
      const s = SCENES.find((x) => x[0] === v.slice(6));
      d.layers = d.layers.filter((l) => !/^(Sahne|Podyum) · /.test(l.name || ''));
      e.insert(s[3](d.width, d.height, c).map((l) => Object.assign(l, { locked: false })), { bottom: true, group: true, select: false });
      if (prod) C.placeOnScene(prod, s[0]);
      e.commit(); toast(`${s[1]} eklendi${prod ? '' : ' — ürün fotoğrafını üste koy, sonra Temas gölgesi ekle'}`);
      return;
    }
    if (v === 'shadow') C.contactShadow(prod);
    if (v === 'reflect') C.reflection(prod);
    if (v === 'center') C.placeOnScene(prod);
    if (v === 'cut') { e.select([prod.id]); const b = document.querySelector('[data-act="rmbg"], [data-act="removeBg"]'); if (b) b.click(); else toast('Özellikler panelindeki “Arka planı kaldır” düğmesini kullan'); return; }
    e.commit();
  };
  C.placeOnScene = function (l, kind) {
    const d = E().doc, pod = d.layers.find((x) => x.name === 'Podyum · üst');
    const maxW = d.width * 0.5, maxH = d.height * 0.52, k = Math.min(maxW / l.w, maxH / l.h, 1.6);
    l.w = r1(l.w * k); l.h = r1(l.h * k); l.x = r1((d.width - l.w) / 2);
    const floor = pod ? pod.y + pod.h * 0.55 : d.height * (kind === 'sun' || kind === 'marble' ? 0.8 : 0.78);
    l.y = r1(floor - l.h);
  };
  C.contactShadow = function (l) {
    const e = E(), d = e.doc;
    d.layers = d.layers.filter((x) => !(x.name === 'Temas gölgesi' && x.of === l.id));
    const sw = l.w * 0.86, sh = Math.max(8, l.w * 0.12);
    const sh1 = { type: 'ellipse', name: 'Temas gölgesi', of: l.id, x: r1(l.x + (l.w - sw) / 2), y: r1(l.y + l.h - sh * 0.55), w: r1(sw), h: r1(sh), fill: rad(['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']) };
    const sh2 = { type: 'ellipse', name: 'Temas gölgesi', of: l.id, x: r1(l.x + l.w * 0.2), y: r1(l.y + l.h - sh * 0.3), w: r1(l.w * 0.6), h: r1(sh * 0.5), fill: rad(['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']) };
    const at = d.layers.indexOf(l);
    const made = e.insert([sh1, sh2], { select: false });
    made.forEach((m) => { d.layers.splice(d.layers.indexOf(m), 1); });
    d.layers.splice(at, 0, ...made);
    e.select([l.id]); e.commit(); toast('Temas gölgesi eklendi — ürün artık zemine basıyor');
  };
  C.reflection = function (l) {
    const e = E(), d = e.doc;
    d.layers = d.layers.filter((x) => !(x.name === 'Yansıma' && x.of === l.id));
    const r = JSON.parse(JSON.stringify(l)); delete r.id;
    Object.assign(r, { name: 'Yansıma', of: l.id, y: r1(l.y + l.h), flipY: !l.flipY, opacity: 0.5, alphaMask: fadeMask(0.7), locked: false, shadow: null });
    const at = d.layers.indexOf(l);
    const [m] = e.insert([r], { select: false });
    d.layers.splice(d.layers.indexOf(m), 1); d.layers.splice(at, 0, m);
    e.select([l.id]); e.commit(); toast('Yansıma eklendi');
  };

  // ======================================================================
  // 4) HAZIR BLOKLAR (marka rengine göre)
  // ======================================================================
  const STAR = 'M50 0 L61.8 34.5 L97.6 34.5 L68.8 55.9 L79.4 90.5 L50 69.1 L20.6 90.5 L31.2 55.9 L2.4 34.5 L38.2 34.5 Z';
  const BURST = (() => { let s = ''; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 42 : 50; s += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2) + ' '; } return s + 'Z'; })();
  const TAG = 'M0 20 Q0 0 20 0 L72 0 L100 50 L72 100 L20 100 Q0 100 0 80 Z';
  const CHECK = 'M20 52 L42 72 L80 30';
  const TRUCK = 'M8 30h52v36H8z M60 42h18l14 14v10H60z M26 74a8 8 0 1 0 0.1 0z M76 74a8 8 0 1 0 0.1 0z';
  const SHIELD = 'M50 6 L88 20 V48 C88 72 70 88 50 96 C30 88 12 72 12 48 V20 Z';
  const CARD = 'M10 26h80v52H10z M10 40h80';
  const tx = (name, text, x, y, w, fs, fill, o = {}) => Object.assign({ type: 'text', name, text, x, y, w, h: fs * 1.2, fontSize: fs, fill, fontFamily: o.ff || 'Inter', fontWeight: 700, lineHeight: 1.15, letterSpacing: 0, align: 'left' }, o);
  const rc = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x, y, w, h, fill, radius: 0 }, o);
  const pth = (name, d, x, y, w, h, fill, o = {}) => Object.assign({ type: 'path', name, d, vw: 100, vh: 100, x, y, w, h, fill }, o);
  // u = birim (tuvalin kısa kenarının 1/100'ü). Her blok kendi 0,0 noktasına göre çizilir.
  const BLOCKS = [
    ['Fiyat', 'Fiyat dairesi', (u, P, I) => [Object.assign({ type: 'ellipse', name: 'Fiyat dairesi', x: 0, y: 0, w: 26 * u, h: 26 * u, fill: P.a, shadow: { x: 0, y: u, blur: 3 * u, color: 'rgba(0,0,0,0.22)' } }), tx('Fiyat', I.price, 0, 7.4 * u, 26 * u, 7 * u, readable(P.a), { align: 'center', fontWeight: 900, bind: 'price' }), tx('Eski fiyat', I.old, 0, 15.2 * u, 26 * u, 3.4 * u, readable(P.a), { align: 'center', fontWeight: 700, opacity: 0.85, strike: true, bind: 'old' })]],
    ['Fiyat', 'İndirim etiketi', (u, P, I) => [pth('Etiket', TAG, 0, 0, 30 * u, 13 * u, P.a, { rotation: -6 }), tx('İndirim', I.discount, 2 * u, 2.9 * u, 22 * u, 6 * u, readable(P.a), { align: 'center', fontWeight: 900, rotation: -6, bind: 'discount' })]],
    ['Fiyat', 'Patlama rozeti', (u, P, I) => [pth('Rozet', BURST, 0, 0, 24 * u, 24 * u, P.b, { rotation: 10 }), tx('Rozet yazısı', 'YENİ', 0, 8.6 * u, 24 * u, 6 * u, readable(P.b), { align: 'center', fontWeight: 900, rotation: 10, letterSpacing: 2 })]],
    ['Fiyat', 'Fiyat kartı', (u, P, I) => [rc('Kart', 0, 0, 44 * u, 22 * u, '#FFFFFF', { radius: 2.4 * u, shadow: { x: 0, y: u, blur: 4 * u, color: 'rgba(0,0,0,0.14)' } }), tx('Ürün adı', I.product, 3 * u, 3 * u, 38 * u, 3.4 * u, P.ink, { fontWeight: 600, bind: 'product' }), tx('Fiyat', I.price, 3 * u, 9.6 * u, 20 * u, 7 * u, P.a, { fontWeight: 900, bind: 'price' }), tx('Eski fiyat', I.old, 24 * u, 12.6 * u, 16 * u, 3.2 * u, P.ink, { fontWeight: 500, opacity: 0.55, strike: true, bind: 'old' })]],
    ['Fiyat', 'Köşe şeridi', (u, P, I) => [rc('Şerit', 0, 0, 46 * u, 8 * u, P.a, { rotation: -45 }), tx('Şerit yazısı', 'İNDİRİM', 0, 2 * u, 46 * u, 3.6 * u, readable(P.a), { align: 'center', fontWeight: 800, letterSpacing: 4, rotation: -45 })]],
    ['Buton', 'Satın al butonu', (u, P, I) => [rc('Buton zemini', 0, 0, 40 * u, 9 * u, P.a, { radius: 4.5 * u, shadow: { x: 0, y: 0.8 * u, blur: 2.4 * u, color: 'rgba(0,0,0,0.2)' } }), tx('Buton yazısı', I.cta, 0, 2.6 * u, 40 * u, 3.6 * u, readable(P.a), { align: 'center', fontWeight: 700, bind: 'cta' })]],
    ['Buton', 'Çerçeveli buton', (u, P, I) => [rc('Buton çerçevesi', 0, 0, 40 * u, 9 * u, 'rgba(0,0,0,0)', { radius: 4.5 * u, stroke: P.ink, strokeWidth: 0.4 * u }), tx('Buton yazısı', I.cta, 0, 2.6 * u, 40 * u, 3.6 * u, P.ink, { align: 'center', fontWeight: 700, bind: 'cta' })]],
    ['Bilgi', 'Özellik listesi', (u, P, I) => { const items = ['Doğal içerik', 'Hızlı kargo', '2 yıl garanti']; return items.flatMap((t, i) => [Object.assign({ type: 'ellipse', name: 'İşaret zemini', x: 0, y: i * 8 * u, w: 5.6 * u, h: 5.6 * u, fill: P.a }), pth('İşaret', CHECK, 1.2 * u, i * 8 * u + 1.2 * u, 3.2 * u, 3.2 * u, 'none', { stroke: readable(P.a), strokeWidth: 0.6 * u }), tx('Özellik ' + (i + 1), t, 7.6 * u, i * 8 * u + 0.8 * u, 40 * u, 3.6 * u, P.ink, { fontWeight: 600 })]); }],
    ['Bilgi', 'Güven rozetleri', (u, P, I) => [['Ücretsiz kargo', TRUCK], ['Güvenli ödeme', SHIELD], ['Kolay iade', CARD]].flatMap(([t, ic], i) => [Object.assign({ type: 'ellipse', name: 'Rozet zemini', x: i * 22 * u + 5 * u, y: 0, w: 12 * u, h: 12 * u, fill: P.soft }), pth('Rozet ikonu', ic, i * 22 * u + 8 * u, 3 * u, 6 * u, 6 * u, 'none', { stroke: P.a, strokeWidth: 0.45 * u }), tx('Rozet yazısı', t, i * 22 * u, 13.6 * u, 22 * u, 2.8 * u, P.ink, { align: 'center', fontWeight: 600 })])],
    ['Bilgi', 'Puan satırı', (u, P, I) => [...[0, 1, 2, 3, 4].map((i) => pth('Yıldız', STAR, i * 5 * u, 0, 4.4 * u, 4.4 * u, '#F5B301')), tx('Puan yazısı', '4,9 · değerlendirme sayısı', 26 * u, 0.3 * u, 40 * u, 3.2 * u, P.ink, { fontWeight: 500, opacity: 0.8 })]],
    ['Bilgi', 'Başlık grubu', (u, P, I) => [rc('Vurgu çizgisi', 0, 0, 8 * u, 1 * u, P.a, { radius: 0.5 * u }), tx('Üst etiket', 'YENİ SEZON', 0, 2.6 * u, 50 * u, 2.8 * u, P.a, { fontWeight: 800, letterSpacing: 6 }), tx('Başlık', I.product, 0, 6.8 * u, 60 * u, 7.6 * u, P.ink, { fontWeight: 800, lineHeight: 1.05, bind: 'product' }), tx('Alt başlık', I.desc, 0, 16.6 * u, 56 * u, 3.4 * u, P.ink, { fontWeight: 400, opacity: 0.72, lineHeight: 1.35, bind: 'desc', below: [2, 2 * u] })]],
    ['Bilgi', 'Kargo şeridi', (u, P, I) => [rc('Şerit zemini', 0, 0, 70 * u, 8 * u, P.ink, { radius: 4 * u }), pth('Kamyon', TRUCK, 3 * u, 1.4 * u, 5.2 * u, 5.2 * u, 'none', { stroke: readable(P.ink), strokeWidth: 0.4 * u }), tx('Şerit yazısı', 'Bugün sipariş ver, yarın kapında', 10 * u, 2.2 * u, 58 * u, 3.4 * u, readable(P.ink), { fontWeight: 600 })]],
    ['Bilgi', 'Son gün rozeti', (u, P, I) => [rc('Rozet', 0, 0, 30 * u, 7 * u, P.b, { radius: 1.2 * u }), tx('Rozet yazısı', 'SON 3 GÜN', 0, 1.7 * u, 30 * u, 3.4 * u, readable(P.b), { align: 'center', fontWeight: 900, letterSpacing: 3 })]],
    ['İletişim', 'İletişim bandı', (u, P, I, W) => [rc('İletişim bandı', 0, 0, W, 9 * u, P.ink), tx('İletişim', `${I.phone}   •   ${I.web}   •   ${I.insta}`, 3 * u, 2.9 * u, W - 6 * u, 3.1 * u, readable(P.ink), { align: 'center', fontWeight: 600, bind: 'contact' })]],
    ['İletişim', 'Sipariş kutusu', (u, P, I) => [rc('Kutu', 0, 0, 46 * u, 15 * u, P.soft, { radius: 2 * u }), tx('Kutu başlığı', 'Sipariş için', 3 * u, 2.6 * u, 40 * u, 3 * u, P.ink, { fontWeight: 500, opacity: 0.75 }), tx('Telefon', I.phone, 3 * u, 6.4 * u, 40 * u, 5 * u, P.ink, { fontWeight: 800, bind: 'phone' })]],
    ['İletişim', 'WhatsApp sipariş', (u, P, I) => { const q = qrPath(waLink(I)); return [rc('Kart', 0, 0, 56 * u, 22 * u, '#FFFFFF', { radius: 2.4 * u, shadow: { x: 0, y: 0.8 * u, blur: 3 * u, color: 'rgba(0,0,0,0.16)' } }), pth('QR kod', q.d, 2.5 * u, 2.5 * u, 17 * u, 17 * u, '#14161B', { vw: q.size, vh: q.size, role: 'qr', qr: { text: waLink(I), type: 'wa' } }), rc('WA zemini', 22 * u, 3.4 * u, 5.4 * u, 5.4 * u, '#25D366', { radius: 2.7 * u }), pth('WA ikonu', 'M30 70l4-14a22 22 0 1 1 9 8z M40 40c2 6 6 10 12 12l3-3 6 2v5c-12 1-24-11-23-23h5l2 6z', 22.9 * u, 4.3 * u, 3.6 * u, 3.6 * u, '#FFFFFF'), tx('QR başlık', 'Tara, WhatsApp’tan sipariş ver', 29 * u, 3.4 * u, 25 * u, 2.6 * u, '#14161B', { fontWeight: 700, lineHeight: 1.2 }), tx('Telefon', I.phone, 22 * u, 12.6 * u, 32 * u, 3.6 * u, P.a, { fontWeight: 800, bind: 'phone', below: [5, 1.4 * u] })]; }],
    ['İletişim', 'QR katalog', (u, P, I) => { const link = I.web ? (/^https?:/.test(I.web) ? I.web : 'https://' + I.web) : 'https://www.markaniz.com'; const q = qrPath(link); return [rc('Kart', 0, 0, 26 * u, 32 * u, P.ink, { radius: 2.4 * u }), rc('QR zemin', 3 * u, 3 * u, 20 * u, 20 * u, '#FFFFFF', { radius: 1.2 * u }), pth('QR kod', q.d, 4 * u, 4 * u, 18 * u, 18 * u, '#14161B', { vw: q.size, vh: q.size, role: 'qr', qr: { text: link, type: 'url' } }), tx('QR yazısı', 'Kataloğu gör', 0, 25.4 * u, 26 * u, 3.2 * u, readable(P.ink), { align: 'center', fontWeight: 700 })]; }],
    ['İletişim', 'Sosyal hesap', (u, P, I) => [rc('Simge zemini', 0, 0, 7 * u, 7 * u, P.a, { radius: 2 * u }), rc('Simge çerçevesi', 1.6 * u, 1.6 * u, 3.8 * u, 3.8 * u, 'rgba(0,0,0,0)', { radius: 1.1 * u, stroke: readable(P.a), strokeWidth: 0.45 * u }), Object.assign({ type: 'ellipse', name: 'Simge merkezi', x: 2.6 * u, y: 2.6 * u, w: 1.8 * u, h: 1.8 * u, fill: 'rgba(0,0,0,0)', stroke: readable(P.a), strokeWidth: 0.45 * u }), tx('Hesap', I.insta, 9 * u, 1.6 * u, 40 * u, 3.6 * u, P.ink, { fontWeight: 700, bind: 'insta' })]],
  ];
  const waLink = (I) => { let n = String(I.phone || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '90' + n.slice(1); else if (n.length === 10) n = '90' + n; return `https://wa.me/${n || '905000000000'}?text=${encodeURIComponent('Merhaba, ' + (I.product && I.product !== 'Ürün adı' ? I.product + ' için ' : '') + 'sipariş vermek istiyorum')}`; };
  const qrPath = (text) => { try { return T.qrPath(T.qr(text, 'M'), 'square', 0); } catch (e) { return { d: 'M0 0h10v10H0z', size: 10 }; } };
  function blockPalette() {
    const e = E(), d = e && e.doc, bc = (brand().colors || []).filter(Boolean);
    if (bc.length) return palette('brand', bc[0]);
    const m = d ? roles(d) : {}, a = Object.keys(m).find((c) => m[c] === 'a') || '#E2197C';
    return palette('comp', a);
  }
  function blockLayers(i, W, H) {
    const u = Math.min(W, H) / 100, P = blockPalette(), I = info();
    const ls = BLOCKS[i][2](u, P, I, W).map((l) => Object.assign({ visible: true, opacity: 1, rotation: 0 }, l, { x: r1(l.x), y: r1(l.y), w: r1(l.w), h: r1(l.h) }));
    ls.forEach((l) => { if (l.type === 'text') R.layoutText(l); });
    // metin uzunluğu değişince alttaki öğeler kaysın (çok satırlı ürün adı vb.)
    ls.forEach((l) => { if (l.below) { const ref = ls[l.below[0]]; l.y = r1(ref.y + ref.h + l.below[1]); delete l.below; } });
    return ls;
  }
  const bbox = (ls) => { const x0 = Math.min(...ls.map((l) => l.x)), y0 = Math.min(...ls.map((l) => l.y)); return { x0, y0, w: Math.max(...ls.map((l) => l.x + l.w)) - x0, h: Math.max(...ls.map((l) => l.y + l.h)) - y0 }; };
  C.BLOCKS = BLOCKS; C.blockLayers = (i, W, H) => blockLayers(i, W, H); C.bbox = (ls) => bbox(ls);
  C.blocks = async function () {
    const e = E(); if (!e) return; const d = e.doc;
    let cat = 'Tümü';
    const i = await UI().dialog(`<div class="d-body"><h3>${icon('blocks')} Hazır bloklar</h3><p class="muted" style="font-size:13px;margin:0 0 8px">Marka renklerin ve <b>Ürün bilgilerin</b> (Marka kiti) kendiliğinden kullanılır. Eklenen blok gruplu gelir; çift tıklayıp içindeki yazıyı değiştirebilirsin.</p>
      <div class="chips" id="blC">${['Tümü', 'Bağış', 'Fiyat', 'Buton', 'Bilgi', 'İletişim'].map((c) => `<button class="chip${c === cat ? ' on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="blk-grid" id="blG"></div></div><div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const draw = () => {
          $('#blG', box).innerHTML = BLOCKS.map((b, k) => (cat === 'Tümü' || b[0] === cat ? `<button class="blk-it" data-i="${k}"><span class="blk-th" data-th="${k}"></span><b>${b[1]}</b></button>` : '')).join('');
          $$('[data-th]', box).forEach((el) => {
            const k = +el.dataset.th, ls = blockLayers(k, 1000, 1000);
            const bb = bbox(ls), pad = 30, dd = R.normalize({ width: Math.ceil(bb.w + pad * 2), height: Math.ceil(bb.h + pad * 2), background: { type: 'solid', color: BLOCKS[k][1] === 'İletişim bandı' ? '#FFFFFF' : '#F4F5F7' }, layers: ls.map((l) => Object.assign(l, { x: l.x - bb.x0 + pad, y: l.y - bb.y0 + pad })) });
            el.innerHTML = R.renderSVG(dd, { fit: true, prefix: 'bk' + k + '_' });
          });
          $$('.blk-it', box).forEach((b) => (b.onclick = () => close(+b.dataset.i)));
        };
        $('#blC', box).onclick = (ev) => { const b = ev.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#blC .chip', box).forEach((c) => c.classList.toggle('on', c === b)); draw(); };
        draw();
      },
    });
    if (i == null || i === false) return;
    await R.ensureDocFonts({ layers: [{ type: 'text', fontFamily: 'Inter', fontWeight: 700 }] }).catch(() => {});
    const ls = blockLayers(i, d.width, d.height);
    const bb = bbox(ls), full = BLOCKS[i][1] === 'İletişim bandı';
    const c = e.center(), ox = full ? 0 : Math.min(Math.max(c.x - bb.w / 2, 0), d.width - bb.w), oy = full ? d.height - bb.h : Math.min(Math.max(c.y - bb.h / 2, 0), d.height - bb.h);
    ls.forEach((l) => { l.x = r1(l.x - bb.x0 + ox); l.y = r1(l.y - bb.y0 + oy); });
    e.insert(ls, { group: true }); toast(`${BLOCKS[i][1]} eklendi`);
  };

  // ======================================================================
  // 5) TEK KAYNAKTAN BİLGİ: “Bilgilerimi yerleştir”
  // ======================================================================
  const RULES = [
    ['price', (n) => /^(fiyat|price|yeni fiyat|indirimli fiyat)( \d+)?$/i.test(n)],
    ['old', (n) => /(eski fiyat|fiyat notu|old price)/i.test(n)],
    ['discount', (n, t) => /(büyük oran|indirim oranı|discount)/i.test(n) || (/^(oran|indirim)$/i.test(n) && /%/.test(t))],
    ['cta', (n) => /(buton yazısı|cta|çağrı)/i.test(n)],
    ['insta', (n) => /^(instagram|hesap)$/i.test(n)],
    ['product', (n, t) => /^(ürün adı|ürün|product)$/i.test(n) || (/^başlık$/i.test(n) && /ürün adı/i.test(t))],
    ['desc', (n, t) => /^(açıklama|ürün açıklaması|description)$/i.test(n) || (/alt başlık/i.test(n) && /açıklama|anlat|buraya|kısa bilgi/i.test(t))],
    ['slogan', (n) => /slogan/i.test(n)],
    ['name', (n, t) => /^(marka|marka adı|brand)$/i.test(n) || /^marka ?ad[ıi]$/i.test(t.trim())],
  ];
  // yer tutucu telefon / web / hesap kalıpları (şablonlardaki örnek değerler)
  const PH = [
    ['phone', /(\+90 ?)?0? ?\(?5\d\d\)? ?000 ?00 ?00/g],
    ['web', /www\.marka(niz|nız)?\.com(\.tr)?/gi],
    ['insta', /@marka(niz|nız)?\b/gi],
  ];
  const caps = (t) => { const L = t.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, ''); return L.length > 1 && L === L.toLocaleUpperCase('tr-TR'); };
  // yeni metin eski kutuya sığmazsa (taşma ya da kelime bölünmesi) yazıyı küçült — en fazla %40
  function fitText(l, maxH, fs0) {
    const words = new Set(R.plain(l.text).split(/\s+/));
    const fits = () => l.h <= maxH * 1.04 && !(l._lines || []).some((ln) => String(ln).trim().split(/\s+/).some((tok) => tok && !words.has(tok)));
    let k = 0;
    while (!fits() && l.fontSize > fs0 * 0.6 && k++ < 20) { l.fontSize = Math.round(l.fontSize * 0.94 * 10) / 10; R.layoutText(l); }
  }
  C.fitText = fitText;
  C.fillInfo = function (d, { quiet = false, info: extra = null } = {}) {
    const e = E(); d = d || (e && e.doc); if (!d) return 0;
    const b = brand();
    const I = Object.assign({}, b.info || {}, extra || {}, { phone: b.phone, web: b.web, name: b.name, slogan: b.slogan });
    Object.keys(I).forEach((k) => { if (!I[k]) delete I[k]; });
    if (!Object.keys(I).length) { if (!quiet) toast('Önce Marka kiti → Ürün bilgilerim alanlarını doldur', true); return 0; }
    let n = 0;
    d.layers.forEach((l) => {
      if (l.type !== 'text' || l.priceRole) return;
      const t0 = R.plain(l.text || ''), nm = (l.name || '').trim();
      let t = t0;
      const k = l.bind || (RULES.find(([, f]) => f(nm, t0.replace(/\s+/g, ' '))) || [])[0];
      if (k === 'contact') t = [I.phone, I.web, I.insta].filter(Boolean).join('   •   ') || t;
      else if (k && I[k]) t = k === 'old' && /yerine/i.test(t0) ? 'yerine ' + I.old : I[k];
      else PH.forEach(([pk, re]) => { if (I[pk]) t = t.replace(re, I[pk]); });
      if (t !== t0 && caps(t0) && !l.uppercase) t = t.toLocaleUpperCase('tr-TR');
      if (t !== t0) { const oh = l.h, fs0 = +l.fontSize; l.text = t; R.layoutText(l); fitText(l, Math.max(oh, fs0 * (l.lineHeight || 1.2)), fs0); n++; }
    });
    if (I.price && window.Food) n += window.Food.applyPrice(d, I.price);
    if (e && d === e.doc) { e.relayout(); e.commit(); }
    if (!quiet) toast(n ? `${n} yazı ürün bilgilerinle dolduruldu` : 'Eşleşen yazı bulunamadı — katman adlarını “Fiyat”, “Ürün adı”, “Buton yazısı” gibi adlandır');
    return n;
  };

  // ======================================================================
  // 6) SADE MOD
  // ======================================================================
  C.simple = () => { try { return localStorage.getItem('ts_simple') === '1'; } catch (e) { return false; } };
  C.setSimple = function (on) {
    try { localStorage.setItem('ts_simple', on ? '1' : '0'); } catch (e) {}
    document.body.classList.toggle('ts-simple', !!on);
    $$('[data-a="simple"]').forEach((b) => { b.classList.toggle('on', !!on); const s = b.querySelector('span'); if (s) s.textContent = on ? 'Sade' : 'Pro'; b.title = on ? 'Sade mod açık: yalnız temel araçlar. Tüm araçlar için dokun.' : 'Sade moda geç: yalnız temel araçlar'; });
  };
  document.addEventListener('DOMContentLoaded', () => C.setSimple(C.simple()));
  if (document.readyState !== 'loading') setTimeout(() => C.setSimple(C.simple()), 0);

  window.Coach = C;
})();
