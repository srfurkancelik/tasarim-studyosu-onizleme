/* Tasarım Stüdyosu v5.4 — hız ve satış araçları (yapay zekasız):
   akıllı yeniden boyutlandırma, tasarım sihirbazı, kampanya seti, yeni ürün maketleri,
   yazı stili galerisi, yeni arka planlar, kampanya takvimi, carousel, ürün videosu,
   klasör / etiket, sürüm geçmişi. */
(function () {
  'use strict';
  const A = () => window.App, R = window.Render, T = window.Tools;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (...a) => window.icon(...a);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const E = () => A().S.editorApi;
  const toast = (m, bad) => A().toast(m, bad);
  const brand = () => A().S.brand || {};
  const r1 = (v) => Math.round(v * 10) / 10;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const P6 = {};

  // ======================================================================
  // 1) AKILLI YENİDEN BOYUTLANDIRMA
  //    Öğeleri yalnız büyütüp küçültmez: yeni orana göre satırları dizer,
  //    yataya geçerken ürünü yana alır, kenara yaslı süsleri köşesinde tutar.
  // ======================================================================
  function scaleLayer(l, s) {
    l.w *= s; l.h *= s;
    if (l.type === 'text') { l.fontSize = r1(l.fontSize * s); l.letterSpacing = (l.letterSpacing || 0) * s; if (l.bgPad != null) l.bgPad *= s; }
    if (l.strokeWidth) l.strokeWidth *= s;
    if (l.radius) l.radius *= s;
    if (l.shadow) ['x', 'y', 'blur'].forEach((k) => { if (l.shadow[k]) l.shadow[k] *= s; });
    if (l.fx) {
      const fx = l.fx;
      if (fx.glow && fx.glow.blur) fx.glow.blur *= s;
      if (fx.outline && fx.outline.width) fx.outline.width *= s;
      if (fx.long && fx.long.length) fx.long.length *= s;
      if (fx.echo && fx.echo.gap) fx.echo.gap *= s;
      if (fx.inner) ['x', 'y', 'blur'].forEach((k) => { if (fx.inner[k]) fx.inner[k] *= s; });
    }
  }
  function unitsOf(layers) {
    const out = [], seen = new Map();
    layers.forEach((l) => {
      if (l.group) { let u = seen.get(l.group); if (!u) { u = { m: [] }; seen.set(l.group, u); out.push(u); } u.m.push(l); }
      else out.push({ m: [l] });
    });
    out.forEach((u) => {
      u.x = Math.min(...u.m.map((l) => l.x)); u.y = Math.min(...u.m.map((l) => l.y));
      u.w = Math.max(...u.m.map((l) => l.x + l.w)) - u.x; u.h = Math.max(...u.m.map((l) => l.y + l.h)) - u.y;
      u.text = u.m.some((l) => l.type === 'text');
      u.img = u.m.some((l) => l.type === 'image');
    });
    return out;
  }
  // birimi s ölçeğiyle ölçekleyip sol üst köşesini (nx, ny) yapar
  function place(u, s, nx, ny) {
    u.m.forEach((l) => { const ox = (l.x - u.x) * s, oy = (l.y - u.y) * s; scaleLayer(l, s); l.x = r1(nx + ox); l.y = r1(ny + oy); });
    u.x = nx; u.y = ny; u.w *= s; u.h *= s;
  }
  // dikey çakışan birimleri satırlara topla
  function rowsOf(units) {
    const sorted = units.slice().sort((a, b) => a.y - b.y), rows = [];
    sorted.forEach((u) => {
      const r = rows.find((r) => u.y < r.y + r.h - Math.min(r.h, u.h) * 0.25 && u.y + u.h > r.y + Math.min(r.h, u.h) * 0.25);
      if (r) { r.u.push(u); const y2 = Math.max(r.y + r.h, u.y + u.h), x2 = Math.max(r.x + r.w, u.x + u.w); r.y = Math.min(r.y, u.y); r.x = Math.min(r.x, u.x); r.h = y2 - r.y; r.w = x2 - r.x; }
      else rows.push({ u: [u], x: u.x, y: u.y, w: u.w, h: u.h });
    });
    return rows.sort((a, b) => a.y - b.y);
  }
  // satırları bir dikdörtgene dizer (her satır kendi iç düzenini korur)
  function stackRows(rows, W, H, box, { center = true, heroBoost = true } = {}) {
    if (!rows.length) return;
    const gaps = rows.slice(1).map((r, i) => Math.max(0, r.y - (rows[i].y + rows[i].h)));
    const contentH = rows.reduce((a, r) => a + r.h, 0) + gaps.reduce((a, b) => a + b, 0);
    const maxW = Math.max(...rows.map((r) => r.w));
    let s = Math.min(box.w / maxW, box.h / contentH);
    s = Math.min(s, Math.max(box.w / W, box.h / H) * 1.6);
    // boş kalan dikey alanı önce kahraman görsele (en büyük görselli satır) ver
    let extra = box.h - contentH * s;
    const scales = rows.map(() => s);
    if (heroBoost && extra > box.h * 0.08) {
      let hi = -1, ha = 0; rows.forEach((r, i) => { const a = r.u.filter((u) => u.img).reduce((x, u) => x + u.w * u.h, 0); if (a > ha) { ha = a; hi = i; } });
      if (hi >= 0) {
        const r = rows[hi], want = Math.min((r.h * s + extra * 0.65) / (r.h * s), box.w / (r.w * s));
        if (want > 1.02) { scales[hi] = s * want; extra -= r.h * s * (want - 1); }
      }
    }
    const gapAdd = rows.length > 1 ? Math.min(extra * 0.6 / (rows.length - 1), box.h * 0.06) : 0;
    let used = rows.reduce((a, r, i) => a + r.h * scales[i], 0) + gaps.reduce((a, g) => a + g * s + gapAdd, 0);
    let y = box.y + (center ? Math.max(0, (box.h - used) / 2) : 0);
    rows.forEach((r, i) => {
      const k = scales[i];
      const rcx = box.x + box.w / 2 + ((r.x + r.w / 2) - W / 2) * Math.min(k, box.w / W);
      let nx = rcx - (r.w * k) / 2; nx = Math.min(Math.max(nx, box.x), box.x + box.w - r.w * k);
      const ox = r.x, oy = r.y;
      r.u.forEach((u) => place(u, k, nx + (u.x - ox) * k, y + (u.y - oy) * k));
      y += r.h * k + (i < gaps.length ? gaps[i] * s + gapAdd : 0);
    });
  }
  P6.smartResize = function (d0, W2, H2) {
    const d = R.normalize(clone(d0));
    const W = d.width, H = d.height, sx = W2 / W, sy = H2 / H, smin = Math.min(sx, sy);
    const k = W2 / H2 / (W / H), mode = k > 1.45 ? 'wide' : k < 0.69 ? 'tall' : 'anchor';
    const M = Math.round(Math.min(W2, H2) * 0.06);
    if (d.meta) delete d.meta.flows;
    const isFull = (l) => l.x <= W * 0.02 && l.y <= H * 0.02 && l.x + l.w >= W * 0.98 && l.y + l.h >= H * 0.98;
    const bgL = d.layers.filter(isFull), rest = d.layers.filter((l) => !isFull(l));
    bgL.forEach((l) => { if (l.type === 'image') l.fit = l.fit === 'contain' ? 'contain' : 'cover'; l.x = 0; l.y = 0; l.w = W2; l.h = H2; });
    const units = unitsOf(rest);
    const touches = (u) => ({ l: u.x <= W * 0.01, r: u.x + u.w >= W * 0.99, t: u.y <= H * 0.01, b: u.y + u.h >= H * 0.99 });
    const isDeco = (u) => { const t = touches(u); return !u.text && (t.l || t.r || t.t || t.b) && !(u.img && u.w * u.h > W * H * 0.12); };
    const deco = units.filter(isDeco), content = units.filter((u) => !isDeco(u));
    // süsler: dokundukları kenara/köşeye yapışık kalır
    deco.forEach((u) => {
      const t = touches(u), s = smin * (mode === 'anchor' ? 1 : 1.1);
      const nx = t.l && !t.r ? u.x * s : t.r && !t.l ? W2 - (W - u.x) * s : (u.x + u.w / 2) / W * W2 - (u.w * (t.l && t.r ? W2 / W : s)) / 2;
      const ny = t.t && !t.b ? u.y * s : t.b && !t.t ? H2 - (H - u.y) * s : (u.y + u.h / 2) / H * H2 - (u.h * s) / 2;
      if (t.l && t.r && u.m.length === 1 && u.m[0].type !== 'text') { const l = u.m[0]; scaleLayer(l, s); l.w = W2 * (u.w / W); l.x = r1(u.x / W * W2); l.y = r1(ny); return; }
      if (t.t && t.b && u.m.length === 1 && u.m[0].type !== 'text') { const l = u.m[0]; scaleLayer(l, s); l.h = H2 * (u.h / H); l.y = r1(u.y / H * H2); l.x = r1(nx); return; }
      place(u, s, nx, ny);
    });
    if (mode === 'wide') {
      let hero = content.filter((u) => u.img && !u.text).sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if (hero && hero.w * hero.h > W * H * 0.06) {
        // ürünün arkasındaki daire / podyum / gölge ve üstüne binen fiyat rozeti ürünle birlikte taşınır
        const ov = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        const hx = { x: hero.x - hero.w * 0.12, y: hero.y - hero.h * 0.12, w: hero.w * 1.24, h: hero.h * 1.24 };
        const mates = content.filter((u) => u !== hero && ov(u, hx) > Math.min(u.w * u.h, hero.w * hero.h) * 0.4 && (!u.text || u.w * u.h < hero.w * hero.h * 0.25) && u.w < W * 0.9);
        if (mates.length) {
          const m = [hero, ...mates].flatMap((u) => u.m), x0 = Math.min(...m.map((l) => l.x)), y0 = Math.min(...m.map((l) => l.y));
          const merged = { m, x: x0, y: y0, w: Math.max(...m.map((l) => l.x + l.w)) - x0, h: Math.max(...m.map((l) => l.y + l.h)) - y0, img: true };
          mates.forEach((u) => content.splice(content.indexOf(u), 1)); content.splice(content.indexOf(hero), 1, merged); hero = merged;
        }
        const left = hero.x + hero.w / 2 < W * 0.4, colW = W2 * 0.54;
        const textBox = { x: left ? W2 - colW + M * 0.5 : M, y: M, w: colW - M * 1.5, h: H2 - 2 * M };
        const heroBox = { x: left ? M : colW + M * 0.5, y: M * 0.6, w: W2 - colW - M * 1.5, h: H2 - M * 1.2 };
        const hs = Math.min(heroBox.w / hero.w, heroBox.h / hero.h);
        place(hero, hs, heroBox.x + (heroBox.w - hero.w * hs) / 2, heroBox.y + (heroBox.h - hero.h * hs) / 2);
        let rows = rowsOf(content.filter((u) => u !== hero));
        // banner gibi basık ölçülerde ikincil satırları (özellik listesi gibi küçük yazılar) gizle ki ana mesaj okunsun
        const need = rows.reduce((a, r) => a + r.h, 0), fit = textBox.h / need;
        if (fit < 0.7 && rows.length > 3) {
          const maxFs = Math.max(...rows.flatMap((r) => r.u.flatMap((u) => u.m.filter((l) => l.type === 'text').map((l) => +l.fontSize))), 1);
          const keep = rows.filter((r) => { const ls = r.u.flatMap((u) => u.m); const txt = ls.filter((l) => l.type === 'text'); const fs = Math.max(0, ...txt.map((l) => +l.fontSize)); const key = ls.some((l) => /fiyat|buton|başlık|ürün adı|marka|indirim|price|cta/i.test(l.name || '') || l.bind); return key || fs >= maxFs * 0.5; });
          rows.filter((r) => !keep.includes(r)).forEach((r) => r.u.forEach((u) => u.m.forEach((l) => { l.visible = false; place(u, 0.5, M, M); })));
          rows = keep;
        }
        stackRows(rows, W, H, textBox, { heroBoost: false });
      } else stackRows(rowsOf(content), W, H, { x: M, y: M, w: W2 - 2 * M, h: H2 - 2 * M }, { heroBoost: false });
    } else if (mode === 'tall') {
      stackRows(rowsOf(content), W, H, { x: M, y: M * 1.6, w: W2 - 2 * M, h: H2 - M * 3.2 });
    } else {
      // orana yakın: satırları dikeyde yeni alana yay, yatayda tek ölçekle (hizalar bozulmasın)
      const s = Math.min(Math.sqrt(sx * sy), smin * 1.15, sx);
      const rows = rowsOf(content);
      const gaps = rows.slice(1).map((r, i) => r.y - (rows[i].y + rows[i].h));
      rows.forEach((r) => {
        const ny = ((r.y + r.h / 2) / H) * H2 - (r.h * s) / 2, oy = r.y;
        r.u.forEach((u) => place(u, s, (u.x - W / 2) * s + W2 / 2, ny + (u.y - oy) * s));
        r.y = ny; r.h *= s;
      });
      for (let i = 1; i < rows.length; i++) { const need = rows[i - 1].y + rows[i - 1].h + Math.max(0, gaps[i - 1]) * s - rows[i].y; if (need > 0) { rows[i].u.forEach((u) => u.m.forEach((l) => (l.y = r1(l.y + need)))); rows[i].y += need; } }
      if (rows.length) {
        const top = rows[0].y, bot = rows[rows.length - 1].y + rows[rows.length - 1].h, lim = H2 - M * 0.6;
        if (bot > lim) { const k2 = (lim - Math.max(M * 0.6, Math.min(top, M))) / (bot - top); const t0 = Math.min(top, M); rows.forEach((r) => r.u.forEach((u) => u.m.forEach((l) => { l.y = r1(t0 + (l.y - top) * k2); }))); if (k2 < 0.9) content.forEach((u) => { const cx = u.x + u.w / 2; u.m.forEach((l) => { const ox = l.x + l.w / 2; scaleLayer(l, Math.max(k2, 0.8)); l.x = r1(cx + (ox - cx) * Math.max(k2, 0.8) - l.w / 2); }); }); }
      }
    }
    // yazılar: yeniden diz, tuvalden taşmasın, okunur kalsın
    const minFs = Math.max(11, Math.round(Math.min(W2, H2) * 0.018));
    d.layers.forEach((l) => {
      if (l.type !== 'text') return;
      if (l.fontSize < minFs && !isFull(l)) { const c = l.x + l.w / 2; l.w *= minFs / l.fontSize; l.fontSize = minFs; if (l.align === 'center') l.x = c - l.w / 2; }
      if (l.w > W2 - 2) { l.w = W2 - 2 * M; }
      R.layoutText(l);
      if (!l.rotation) { l.x = r1(Math.min(Math.max(l.x, 0), W2 - l.w)); }
    });
    d.width = W2; d.height = H2;
    return d;
  };

  // ======================================================================
  // 2) TASARIM SİHİRBAZI (3 soru → 6 hazır tasarım)
  // ======================================================================
  const CHANNELS = [
    ['ig', 'Instagram gönderi', 1080, 1080], ['ig45', 'Instagram dikey 4:5', 1080, 1350], ['story', 'Story / Reels', 1080, 1920],
    ['trendyol', 'Trendyol ürün', 1200, 1800], ['square', 'Hepsiburada · Amazon', 1500, 1500], ['banner', 'Web banner', 1920, 600],
    ['flyer', 'A4 el ilanı', 1240, 1754], ['wa', 'WhatsApp durum', 1080, 1920],
  ];
  const WIZ_TPL = ['ur-lansman', 'ur-eticaret', 'ur-minimal', 'ur-ozellik', 'ig-urun', 'ur-set', 'ur-story', 'ur-banner'];
  async function imgSize(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res([im.naturalWidth, im.naturalHeight]); im.onerror = () => res([800, 800]); im.src = src; }); }
  P6.buildOptions = async function ({ info, w, h, photo }) {
    const L = window.Library, bp = window.P5 && window.P5.brandPalette && window.P5.brandPalette();
    const ar = w / h;
    let cands;
    if (window.Food) {
      await window.Food.load();
      // gıda şablonları: ürün adındaki kelimelere göre sırala, düzen çeşitliliğini koru
      const q = String(info.product || '').toLocaleLowerCase('tr-TR') + ' ' + String(info.desc || '').toLocaleLowerCase('tr-TR');
      const score = (t) => t.tags.split(' ').filter((x) => x.length > 2 && q.includes(x)).length * 3 + (t.arch === 'menu' ? -5 : 0) + (t.arch === 'offer' && !info.discount ? -2 : 0);
      const TH = window.FoodTheme, qc = TH ? TH.classifyText(q) : null, charityQ = /ramazan|kurban|asure|egitim|bagis/.test(qc || '');
      const pool = window.Food.templates.filter((t) => t.arch !== 'menu' && (charityQ ? /Bağış/.test(t.cat) : !/Bağış/.test(t.cat))).map((t) => ({ t, s: score(t) + Math.random() * 0.5 })).sort((a, b) => b.s - a.s);
      const picked = [], arches = {};
      for (const c of pool) { if (picked.length >= 6) break; if ((arches[c.t.arch] || 0) >= 2) continue; arches[c.t.arch] = (arches[c.t.arch] || 0) + 1; picked.push({ t: c.t }); }
      cands = picked;
    } else cands = WIZ_TPL.map((id) => L.templates.find((t) => t.id === id)).filter(Boolean).map((t) => ({ t, s: Math.abs(Math.log((t.w / t.h) / ar)) })).sort((a, b) => a.s - b.s).slice(0, 6);
    const out = [];
    const photoP = photo && window.Food ? await window.Food.paletteFromImage(photo.url).catch(() => null) : null;
    for (let i = 0; i < cands.length; i++) {
      const t = cands[i].t, useBrand = bp && i % 2 === 0;
      if (!useBrand && photoP && t.buildAt && i % 2 === 1) {
        let d = R.normalize(L.instantiateAt(t, 0, photoP, w, h));
        d.layers.forEach((l) => delete l.anim);
        d.layers.filter((l) => l.role === 'photo').forEach((l) => Object.assign(l, { src: photo.url, nw: photo.nw, nh: photo.nh, fit: 'contain' }));
        await R.ensureDocFonts(d).catch(() => {});
        if (window.Coach) { window.Coach.fillInfo(d, { quiet: true, info }); await window.Coach.autoPolish(d).catch(() => {}); }
        d.name = (info.product || 'Ürün') + ' · ' + t.name; d.meta = Object.assign({}, d.meta, { wizard: true, fromPhoto: true });
        out.push(d); continue;
      }
      let d = R.normalize(t.buildAt && L.instantiateAt ? L.instantiateAt(t, useBrand ? 0 : i % t.palettes.length, useBrand ? bp : null, w, h) : useBrand ? L.instantiate(t, 0, bp) : L.instantiate(t, (i + 1) % t.palettes.length));
      d.layers.forEach((l) => delete l.anim);
      if (photo) d.layers.filter((l) => l.role === 'photo').forEach((l) => Object.assign(l, { src: photo.url, nw: photo.nw, nh: photo.nh, fit: 'contain' }));
      await R.ensureDocFonts(d).catch(() => {});
      if (window.Coach) window.Coach.fillInfo(d, { quiet: true, info });
      if (d.width !== w || d.height !== h) d = P6.smartResize(d, w, h);
      if (t.food && window.Coach) await window.Coach.autoPolish(d).catch(() => {});
      d.name = (info.product || 'Ürün') + ' · ' + t.name;
      d.meta = Object.assign({}, d.meta, { template: t.id, wizard: true });
      out.push(d);
    }
    return out;
  };
  P6.wizard = async function () {
    const b = brand(), bi = b.info || {};
    const st = { step: 0, ch: 'ig', photo: null, cut: false, opts: [], pick: 0, info: { product: bi.product || '', price: bi.price || '', old: bi.old || '', discount: bi.discount || '', desc: bi.desc || '', cta: bi.cta || 'Hemen sipariş ver' } };
    const res = await A().dialog(`<div class="d-body wiz"><div class="wz-steps">${['Ürün', 'Kanal', 'Fotoğraf', 'Seç'].map((t, i) => `<span data-s="${i}"><i>${i + 1}</i>${t}</span>`).join('')}</div><div id="wzB"></div></div>
      <div class="d-foot"><button class="btn ghost" id="wzBack">Geri</button><span style="flex:1"></span><button class="btn ghost" id="wzSet" hidden>${icon('copy')}Kampanya seti</button><button class="btn primary" id="wzNext">İleri</button></div>`, {
      cls: 'wide wiz-dlg',
      onOpen: (box, close) => {
        const B = $('#wzB', box);
        const draw = async () => {
          $$('.wz-steps span', box).forEach((s) => { s.classList.toggle('on', +s.dataset.s === st.step); s.classList.toggle('done', +s.dataset.s < st.step); });
          $('#wzBack', box).style.visibility = st.step ? 'visible' : 'hidden';
          $('#wzSet', box).hidden = st.step !== 3;
          $('#wzNext', box).innerHTML = st.step === 2 ? `${icon('sparkle')}Tasarımları hazırla` : st.step === 3 ? `${icon('pen')}Düzenle` : 'İleri';
          if (st.step === 0) {
            B.innerHTML = `<h3>Ne satıyorsun?</h3><p class="muted">Bir kez yaz; yazılar ve fiyat tasarımlara kendiliğinden yerleşir. Marka kitine de kaydedilir.</p>
              <div class="form-grid"><label class="field" style="grid-column:1/-1"><span>Ürün adı *</span><input class="inp" data-i="product" placeholder="Örn. Erken Hasat Zeytinyağı 1 L" value="${esc(st.info.product)}"></label>
              <label class="field"><span>Fiyat</span><input class="inp" data-i="price" placeholder="₺349" value="${esc(st.info.price)}"></label><label class="field"><span>Eski fiyat (varsa)</span><input class="inp" data-i="old" placeholder="₺429" value="${esc(st.info.old)}"></label>
              <label class="field"><span>İndirim (varsa)</span><input class="inp" data-i="discount" placeholder="%20" value="${esc(st.info.discount)}"></label><label class="field"><span>Buton yazısı</span><input class="inp" data-i="cta" value="${esc(st.info.cta)}"></label>
              <label class="field" style="grid-column:1/-1"><span>Kısa açıklama</span><input class="inp" data-i="desc" placeholder="Soğuk sıkım, erken hasat, cam şişe" value="${esc(st.info.desc)}"></label></div>`;
            $$('[data-i]', B).forEach((i) => (i.oninput = () => (st.info[i.dataset.i] = i.value)));
            setTimeout(() => { const f = $('[data-i=product]', B); if (f) f.focus(); }, 60);
          } else if (st.step === 1) {
            B.innerHTML = `<h3>Nerede paylaşacaksın?</h3><p class="muted">Ölçü buna göre ayarlanır. Sonra tek dokunuşla tüm kanallar için set de çıkarabilirsin.</p>
              <div class="wz-ch">${CHANNELS.map(([k, t, w, h]) => { const sc = 46 / Math.max(w, h); return `<button class="wz-c${k === st.ch ? ' on' : ''}" data-c="${k}"><span class="shape"><i style="width:${Math.round(w * sc)}px;height:${Math.round(h * sc)}px"></i></span><b>${t}</b><small>${w} × ${h}</small></button>`; }).join('')}</div>`;
            $$('.wz-c', B).forEach((c) => (c.onclick = () => { st.ch = c.dataset.c; $$('.wz-c', B).forEach((x) => x.classList.toggle('on', x === c)); }));
          } else if (st.step === 2) {
            B.innerHTML = `<h3>Ürün fotoğrafı</h3><p class="muted">Düz zeminde çekilmiş bir fotoğraf en iyi sonucu verir. Fotoğrafın yoksa örnek görselle devam et, sonra değiştirirsin.</p>
              <div class="wz-photo"><button class="wz-drop" id="wzPick">${st.photo ? `<img src="${esc(st.photo.url)}" alt="">` : `${icon('image')}<b>Fotoğraf seç</b><small>JPG, PNG, HEIC</small>`}</button>
              <div class="wz-po"><label class="switch"><input type="checkbox" id="wzCut" ${st.cut ? 'checked' : ''}>Arka planı sil (düz zeminli fotoğraflarda)</label>${st.photo ? `<button class="btn sm ghost" id="wzNo">${icon('x')}Fotoğrafı kaldır</button>` : ''}<p class="muted" style="font-size:12px">Fotoğraf yalnızca bu cihazda / hesabında saklanır.</p></div></div>`;
            $('#wzCut', B).onchange = (e) => (st.cut = e.target.checked);
            const no = $('#wzNo', B); if (no) no.onclick = () => { st.photo = null; draw(); };
            $('#wzPick', B).onclick = () => A().pickFiles(async (files) => {
              const f = files[0]; if (!f) return;
              try { const r = await A().uploadFile(f); const [nw, nh] = await imgSize(r.url); st.photo = { url: r.url, nw, nh, orig: r.url }; draw(); } catch (e) { toast(e.message, true); }
            }, false);
          } else {
            B.innerHTML = `<h3>Birini seç</h3><p class="muted">6 farklı düzen hazırlandı. Seçtiğini editörde açabilir ya da tüm kanallar için kampanya seti çıkarabilirsin.</p><div class="wz-grid" id="wzG"><div class="wz-wait"><span class="ink-dots"><i></i><i></i><i></i></span>Hazırlanıyor…</div></div>`;
            let photo = st.photo;
            if (photo && st.cut && T.removeBackground) {
              try { const cut = await T.removeBackground(photo.orig); if (cut && cut.removed > 0.05) { const up = await A().api('upload', { body: { data: cut.dataURL, name: 'urun-dekupe.png' } }); photo = Object.assign({}, photo, { url: up.url }); } } catch (e) {}
            }
            const [, , w, h] = CHANNELS.find((c) => c[0] === st.ch);
            st.opts = await P6.buildOptions({ info: Object.fromEntries(Object.entries(st.info).filter(([, v]) => v)), w, h, photo });
            const G = $('#wzG', box); if (!G) return;
            G.innerHTML = st.opts.map((d, i) => `<button class="wz-o${i === st.pick ? ' on' : ''}" data-o="${i}"><span class="wz-th" style="aspect-ratio:${w}/${h}">${R.renderSVG(d, { fit: true, prefix: 'wz' + i + '_' })}</span></button>`).join('');
            $$('.wz-o', G).forEach((o) => { o.onclick = () => { st.pick = +o.dataset.o; $$('.wz-o', G).forEach((x) => x.classList.toggle('on', x === o)); }; o.ondblclick = () => close('edit'); });
            if (window.M) window.M.stagger($$('.wz-o', G), { opacity: [0, 1], y: [10, 0] }, { each: 50 });
          }
        };
        $('#wzBack', box).onclick = () => { if (st.step) { st.step--; draw(); } };
        $('#wzNext', box).onclick = () => {
          if (st.step === 0 && !st.info.product.trim()) { toast('Ürün adını yaz', true); $('[data-i=product]', box).focus(); return; }
          if (st.step === 3) { if (st.opts.length) close('edit'); return; }
          st.step++; draw();
        };
        $('#wzSet', box).onclick = () => { if (st.opts.length) close('set'); };
        box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && st.step < 3 && e.target.tagName === 'INPUT') $('#wzNext', box).click(); });
        draw();
      },
    });
    if (!res) return;
    // bilgileri marka kitine yaz (tek kaynak)
    try { const nb = Object.assign({}, brand(), { info: Object.assign({}, brand().info || {}, Object.fromEntries(Object.entries(st.info).filter(([, v]) => v))) }); A().S.brand = await A().api('brand', { body: nb }); } catch (e) {}
    const d = st.opts[st.pick];
    const p = Object.assign(A().newProject(d.width, d.height, d.name), { background: d.background, layers: d.layers, meta: d.meta });
    R.normalize(p); await R.ensureImageSizes(p).catch(() => {});
    A().S.project = p; await A().saveProject(p);
    if (res === 'set') { await P6.campaignSet(p); return; }
    A().go('editor', p.id);
    setTimeout(() => toast('Tasarım hazır. Yazıya iki kez dokunup değiştir; Tasarım koçu ile son kontrolü yap.'), 700);
  };

  // ======================================================================
  // 3) KAMPANYA SETİ (tek tasarım → tüm kanallar)
  // ======================================================================
  const SET_SIZES = [[1080, 1080, 'Instagram gönderi'], [1080, 1350, 'Instagram dikey 4:5'], [1080, 1920, 'Story / Reels'], [1200, 1800, 'Trendyol ürün'], [1500, 1500, 'Hepsiburada · Amazon'], [1920, 600, 'Web banner'], [1200, 630, 'Facebook gönderi']];
  P6.campaignSet = async function (p) {
    p = p || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    const sel = SET_SIZES.filter(([w, h]) => !(w === p.width && h === p.height)).map(([w, h, name]) => ({ w, h, name }));
    return window.Features.adaptRun(p, sel, { title: 'Kampanya seti hazır: ' + sel.length + ' kanal' });
  };

  // ======================================================================
  // 4) YENİ ÜRÜN MAKETLERİ (telefon, poster, el ilanı, çanta, kartvizit, şişe, dizüstü)
  // ======================================================================
  const shade = (hex, k) => { const c = (R.parseColor(hex) || {}).hex || '#888888'; const f = (i) => Math.max(0, Math.min(255, Math.round(parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) * (k < 0 ? 1 + k : 1) + (k > 0 ? (255 - parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)) * k : 0)))); return `rgb(${f(0)},${f(1)},${f(2)})`; };
  const rrect = (x, X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
  function studio(x, W, H, bg) {
    const g = x.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.75);
    g.addColorStop(0, shade(bg, 0.18)); g.addColorStop(1, shade(bg, -0.12)); x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  function softShadow(x, draw, blur, oy, alpha = 0.35) { x.save(); x.shadowColor = `rgba(0,0,0,${alpha})`; x.shadowBlur = blur; x.shadowOffsetY = oy; draw(); x.restore(); }
  function cover(x, img, X, Y, w, h) { const s = Math.max(w / img.width, h / img.height), sw = w / s, sh = h / s; x.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, X, Y, w, h); }
  function contain(x, img, X, Y, w, h) { const s = Math.min(w / img.width, h / img.height); x.drawImage(img, X + (w - img.width * s) / 2, Y + (h - img.height * s) / 2, img.width * s, img.height * s); }
  const NEW_MOCKS = {
    phone(x, W, H, L, o) {
      const ph = H * 0.86, pw = ph * 0.49, X = (W - pw) / 2, Y = (H - ph) / 2, r = pw * 0.13;
      softShadow(x, () => { x.fillStyle = '#111'; rrect(x, X, Y, pw, ph, r); x.fill(); }, 60, 30, 0.4);
      const g = x.createLinearGradient(X, 0, X + pw, 0); g.addColorStop(0, '#2b2d33'); g.addColorStop(0.5, '#4a4d55'); g.addColorStop(1, '#22242a');
      x.fillStyle = g; rrect(x, X, Y, pw, ph, r); x.fill();
      const b = pw * 0.035, sx = X + b, sy = Y + b, sw = pw - 2 * b, sh = ph - 2 * b;
      x.save(); rrect(x, sx, sy, sw, sh, r * 0.82); x.clip(); x.fillStyle = '#fff'; x.fillRect(sx, sy, sw, sh);
      // genel bir sosyal akış ekranı (marka içermez)
      const top = sy + sh * 0.06, av = sw * 0.075;
      x.fillStyle = o.accent || '#E2197C'; x.beginPath(); x.arc(sx + sw * 0.07 + av / 2, top + av / 2, av / 2, 0, 7); x.fill();
      x.fillStyle = '#111'; x.font = `600 ${Math.round(sw * 0.04)}px Inter, sans-serif`; x.fillText(o.name || 'markaniz', sx + sw * 0.07 + av * 1.3, top + av * 0.68);
      const iy = top + av * 1.5, ih = Math.min(sh * 0.62, sw / (L.width / L.height));
      cover(x, L, sx, iy, sw, ih);
      const ay = iy + ih + sw * 0.05; x.strokeStyle = '#111'; x.lineWidth = Math.max(2, sw * 0.008);
      const ic = sw * 0.055;
      x.beginPath(); const hx = sx + sw * 0.07, hy = ay; x.moveTo(hx + ic / 2, hy + ic * 0.9); x.bezierCurveTo(hx - ic * 0.3, hy + ic * 0.3, hx + ic * 0.1, hy - ic * 0.2, hx + ic / 2, hy + ic * 0.2); x.bezierCurveTo(hx + ic * 0.9, hy - ic * 0.2, hx + ic * 1.3, hy + ic * 0.3, hx + ic / 2, hy + ic * 0.9); x.stroke();
      x.beginPath(); x.arc(sx + sw * 0.2 + ic / 2, ay + ic / 2, ic / 2, 0, 7); x.stroke();
      x.beginPath(); x.moveTo(sx + sw * 0.31, ay + ic); x.lineTo(sx + sw * 0.31 + ic, ay + ic / 2); x.lineTo(sx + sw * 0.31, ay); x.closePath(); x.stroke();
      x.fillStyle = '#d9dbe0'; [0.62, 0.45].forEach((k, i) => { rrect(x, sx + sw * 0.07, ay + ic * 1.8 + i * sw * 0.05, sw * 0.86 * k, sw * 0.025, sw * 0.012); x.fill(); });
      x.restore();
      x.fillStyle = '#0d0e10'; rrect(x, X + pw * 0.38, sy + sh * 0.012, pw * 0.24, sh * 0.022, sh * 0.011); x.fill();
      x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.moveTo(X + pw * 0.62, Y); x.lineTo(X + pw, Y); x.lineTo(X + pw, Y + ph * 0.4); x.closePath(); x.fill();
    },
    poster(x, W, H, L) {
      // duvar + çerçeve + paspartu
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#EDE9E3'); g.addColorStop(1, '#DAD4CB'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = '#CFC6B9'; x.fillRect(0, H * 0.86, W, H * 0.14);
      const ar = L.width / L.height, mh = H * 0.66; let fw = mh * ar * 1.12, fh = mh * 1.12; if (fw > W * 0.6) { fw = W * 0.6; fh = fw / ar; }
      const X = (W - fw) / 2, Y = H * 0.1, fr = Math.max(10, fw * 0.035), mat = fw * 0.07;
      softShadow(x, () => { x.fillStyle = '#1c1c1e'; x.fillRect(X, Y, fw, fh); }, 50, 26, 0.35);
      x.fillStyle = '#1c1c1e'; x.fillRect(X, Y, fw, fh); x.fillStyle = '#FAFAF8'; x.fillRect(X + fr, Y + fr, fw - 2 * fr, fh - 2 * fr);
      const ix = X + fr + mat, iy = Y + fr + mat, iw = fw - 2 * (fr + mat), ih = fh - 2 * (fr + mat);
      cover(x, L, ix, iy, iw, ih);
      x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 2; x.strokeRect(ix, iy, iw, ih);
      const gl = x.createLinearGradient(X, Y, X + fw, Y + fh); gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(X + fr, Y + fr, fw - 2 * fr, fh - 2 * fr);
    },
    flyer(x, W, H, L, o) {
      studio(x, W, H, o.bg);
      const ar = L.width / L.height; let ph = H * 0.78, pw = ph * ar; if (pw > W * 0.55) { pw = W * 0.55; ph = pw / ar; }
      const cx = W / 2, cy = H * 0.5, sk = pw * 0.08;
      x.save(); x.translate(cx + pw * 0.14, cy + ph * 0.03); x.rotate(0.12); x.fillStyle = '#F4F4F2'; x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 30; x.shadowOffsetY = 10; x.fillRect(-pw / 2, -ph / 2, pw, ph); x.restore();
      const q = [[cx - pw / 2 + sk, cy - ph / 2], [cx + pw / 2 + sk * 0.4, cy - ph / 2 + sk * 0.3], [cx + pw / 2 - sk * 0.2, cy + ph / 2], [cx - pw / 2 - sk * 0.4, cy + ph / 2 - sk * 0.4]];
      x.save(); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#fff'; x.beginPath(); q.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.fill(); x.restore();
      T.warpDraw(x, L, q, 18);
      const g = x.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.08)');
      x.fillStyle = g; x.beginPath(); q.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.fill();
    },
    bag(x, W, H, L, o) {
      studio(x, W, H, o.bg);
      const bw = W * 0.34, bh = H * 0.6, X = (W - bw) / 2, Y = H * 0.3, side = bw * 0.16;
      x.save(); x.fillStyle = 'rgba(0,0,0,.28)'; x.filter = 'blur(18px)'; x.beginPath(); x.ellipse(W / 2 + side * 0.4, Y + bh + 6, bw * 0.62, H * 0.03, 0, 0, 7); x.fill(); x.restore();
      x.fillStyle = shade(o.product || '#C9A27A', -0.25); x.beginPath(); x.moveTo(X + bw, Y); x.lineTo(X + bw + side, Y + side * 0.35); x.lineTo(X + bw + side, Y + bh - side * 0.1); x.lineTo(X + bw, Y + bh); x.closePath(); x.fill();
      x.save(); x.beginPath(); x.rect(X, Y, bw, bh); x.clip(); x.fillStyle = '#fff'; x.fillRect(X, Y, bw, bh); contain(x, L, X + bw * 0.06, Y + bh * 0.08, bw * 0.88, bh * 0.84);
      const g = x.createLinearGradient(X, 0, X + bw, 0); g.addColorStop(0, 'rgba(0,0,0,.10)'); g.addColorStop(0.15, 'rgba(255,255,255,.08)'); g.addColorStop(0.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = g; x.fillRect(X, Y, bw, bh); x.restore();
      x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 2; x.strokeRect(X, Y, bw, bh);
      x.strokeStyle = o.lid || '#2A2A2E'; x.lineWidth = Math.max(5, bw * 0.025); x.lineCap = 'round';
      [[0.28, 0.42], [0.58, 0.72]].forEach(([a, b2]) => { x.beginPath(); x.moveTo(X + bw * a, Y + 4); x.bezierCurveTo(X + bw * a, Y - bh * 0.32, X + bw * b2, Y - bh * 0.32, X + bw * b2, Y + 4); x.stroke(); });
    },
    card(x, W, H, L, o) {
      studio(x, W, H, o.bg);
      const cw = W * 0.42, ch = cw / 1.75;
      const drawCard = (cx, cy, rot, fill, img) => { x.save(); x.translate(cx, cy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowBlur = 30; x.shadowOffsetY = 14; x.fillStyle = fill; rrect(x, -cw / 2, -ch / 2, cw, ch, cw * 0.02); x.fill(); x.shadowColor = 'transparent'; if (img) { x.save(); rrect(x, -cw / 2, -ch / 2, cw, ch, cw * 0.02); x.clip(); cover(x, img, -cw / 2, -ch / 2, cw, ch); x.restore(); } x.restore(); };
      drawCard(W * 0.58, H * 0.42, -0.16, o.accent || '#14161B');
      drawCard(W * 0.44, H * 0.58, 0.06, '#fff', L);
    },
    bottle(x, W, H, L, o) {
      studio(x, W, H, o.bg);
      const bw = W * 0.105, bh = H * 0.76, cx = W / 2, Y = H * 0.13, neck = bw * 0.42;
      x.save(); x.fillStyle = 'rgba(0,0,0,.35)'; x.filter = 'blur(14px)'; x.beginPath(); x.ellipse(cx, Y + bh, bw * 0.75, H * 0.022, 0, 0, 7); x.fill(); x.restore();
      const path = () => { x.beginPath(); x.moveTo(cx - neck / 2, Y); x.lineTo(cx + neck / 2, Y); x.lineTo(cx + neck / 2, Y + bh * 0.18); x.bezierCurveTo(cx + neck / 2, Y + bh * 0.26, cx + bw, Y + bh * 0.28, cx + bw, Y + bh * 0.38); x.lineTo(cx + bw, Y + bh - bw * 0.1); x.quadraticCurveTo(cx + bw, Y + bh, cx + bw * 0.9, Y + bh); x.lineTo(cx - bw * 0.9, Y + bh); x.quadraticCurveTo(cx - bw, Y + bh, cx - bw, Y + bh - bw * 0.1); x.lineTo(cx - bw, Y + bh * 0.38); x.bezierCurveTo(cx - bw, Y + bh * 0.28, cx - neck / 2, Y + bh * 0.26, cx - neck / 2, Y + bh * 0.18); x.closePath(); };
      const pc = o.product || '#3E5A1E';
      x.save(); path(); x.clip();
      const g = x.createLinearGradient(cx - bw, 0, cx + bw, 0); g.addColorStop(0, shade(pc, -0.55)); g.addColorStop(0.3, shade(pc, 0.12)); g.addColorStop(0.55, pc); g.addColorStop(1, shade(pc, -0.6)); x.fillStyle = g; x.fillRect(cx - bw, Y, bw * 2, bh);
      // etiket (silindire hafif sarılmış)
      const lw = bw * 1.7, lh = Math.min(bh * 0.4, lw / (L.width / L.height) * 1.15), ly = Y + bh * 0.5;
      const N = Math.ceil(lw);
      for (let i = 0; i < N; i++) { const dx = -lw / 2 + i, u = Math.asin(Math.max(-1, Math.min(1, dx / bw))) / Math.asin(lw / 2 / bw) * 0.5 + 0.5; const sx = Math.max(0, Math.min(L.width - 1, u * L.width)); x.drawImage(L, sx, 0, Math.max(1, L.width / lw * 1.4), L.height, cx + dx, ly, 1.5, lh); }
      const sg = x.createLinearGradient(cx - bw, 0, cx + bw, 0); sg.addColorStop(0, 'rgba(0,0,0,.5)'); sg.addColorStop(0.22, 'rgba(0,0,0,.08)'); sg.addColorStop(0.34, 'rgba(255,255,255,.28)'); sg.addColorStop(0.42, 'rgba(255,255,255,0)'); sg.addColorStop(0.8, 'rgba(0,0,0,.12)'); sg.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = sg; x.fillRect(cx - bw, Y, bw * 2, bh);
      x.restore();
      const capg = x.createLinearGradient(cx - neck / 2, 0, cx + neck / 2, 0); capg.addColorStop(0, shade(o.lid || '#2A2A2E', -0.4)); capg.addColorStop(0.4, shade(o.lid || '#2A2A2E', 0.35)); capg.addColorStop(1, shade(o.lid || '#2A2A2E', -0.5));
      x.fillStyle = capg; rrect(x, cx - neck * 0.56, Y - bh * 0.07, neck * 1.12, bh * 0.1, neck * 0.08); x.fill();
    },
    laptop(x, W, H, L, o) {
      studio(x, W, H, o.bg);
      const sw = W * 0.62, sh = sw * 0.62, X = (W - sw) / 2, Y = H * 0.12, b = sw * 0.025;
      softShadow(x, () => { x.fillStyle = '#1b1c20'; rrect(x, X, Y, sw, sh, sw * 0.02); x.fill(); }, 40, 18, 0.35);
      x.fillStyle = '#1b1c20'; rrect(x, X, Y, sw, sh, sw * 0.02); x.fill();
      x.save(); x.beginPath(); x.rect(X + b, Y + b, sw - 2 * b, sh - 2 * b); x.clip(); x.fillStyle = '#fff'; x.fillRect(X + b, Y + b, sw - 2 * b, sh - 2 * b);
      // tarayıcı çubuğu + banner
      const bar = sh * 0.07; x.fillStyle = '#EEF0F3'; x.fillRect(X + b, Y + b, sw - 2 * b, bar); ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(X + b + bar * (0.6 + i * 0.5), Y + b + bar / 2, bar * 0.16, 0, 7); x.fill(); });
      x.fillStyle = '#fff'; rrect(x, X + b + bar * 2.4, Y + b + bar * 0.22, sw * 0.5, bar * 0.56, bar * 0.28); x.fill();
      const iw = sw - 2 * b, ih = Math.min(sh - 2 * b - bar, iw / (L.width / L.height));
      cover(x, L, X + b, Y + b + bar, iw, ih);
      x.fillStyle = '#E6E8EC'; for (let i = 0; i < 3; i++) { rrect(x, X + b + iw * (0.05 + i * 0.32), Y + b + bar + ih + sh * 0.04, iw * 0.26, sh * 0.2, 6); x.fill(); }
      x.restore();
      const base = x.createLinearGradient(0, Y + sh, 0, Y + sh + sh * 0.06); base.addColorStop(0, '#d5d7dc'); base.addColorStop(1, '#9ea2a9');
      x.fillStyle = base; x.beginPath(); x.moveTo(X - sw * 0.08, Y + sh); x.lineTo(X + sw * 1.08, Y + sh); x.lineTo(X + sw * 1.04, Y + sh * 1.06); x.lineTo(X - sw * 0.04, Y + sh * 1.06); x.closePath(); x.fill();
      x.fillStyle = '#b4b7bd'; rrect(x, W / 2 - sw * 0.08, Y + sh, sw * 0.16, sh * 0.02, 4); x.fill();
    },
  };
  P6.MOCK_KINDS = [['phone', 'Telefon'], ['poster', 'Çerçeveli poster'], ['flyer', 'El ilanı'], ['bag', 'Alışveriş çantası'], ['card', 'Kartvizit'], ['bottle', 'Şişe'], ['laptop', 'Web sitesi']];
  const origMock = T.mockup;
  T.mockup = function (kind, label, o = {}) {
    if (!NEW_MOCKS[kind]) return origMock.call(T, kind, label, o);
    const W = o.W || 1600, H = o.H || 1200, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    const b = brand();
    NEW_MOCKS[kind](x, W, H, label, Object.assign({ bg: '#E9E4DC', accent: (b.colors || [])[0], name: (b.insta || (b.info || {}).insta || b.name || 'markaniz').replace(/^@/, '') }, o));
    return c;
  };

  // ======================================================================
  // 5) YAZI STİLİ GALERİSİ (font + renk + efekt birlikte)
  // ======================================================================
  const TSTYLES = [
    ['gold', 'Altın yaldız', 'dark', (l, fs) => ({ fontFamily: 'Lora', fontWeight: 700, fill: { type: 'linear', angle: 90, colors: ['#8A6A1F', '#F6E27A', '#C9A22F', '#FFF3B0', '#9A7424'] }, shadow: { x: 0, y: fs * 0.04, blur: fs * 0.08, color: 'rgba(0,0,0,0.45)' } })],
    ['neon', 'Neon', 'dark', (l, fs) => ({ fontFamily: 'Inter', fontWeight: 800, fill: '#FFFFFF', fx: { glow: { color: '#FF2D9B', blur: Math.round(fs * 0.18 + 4), strong: true } } })],
    ['block3d', '3B blok', 'light', (l, fs) => ({ fontFamily: 'Inter', fontWeight: 900, uppercase: true, fill: '#FFD23F', stroke: '#1B1B1B', strokeWidth: Math.max(1.5, fs * 0.025), fx: { long: { color: '#1B1B1B', length: Math.round(fs * 0.12), angle: 45 } } })],
    ['retro', 'Retro 70’ler', 'light', (l, fs) => ({ fontFamily: 'Poppins', fontWeight: 700, italic: true, fill: '#F4A261', fx: { echo: { color: '#E76F51', gap: Math.max(3, Math.round(fs * 0.06)), count: 2, angle: 45 } } })],
    ['cut', 'Kâğıt kesik', 'light', (l, fs) => ({ fontFamily: 'Poppins', fontWeight: 700, fill: '#FFFFFF', fx: { outline: { color: '#14161B', width: Math.max(2, Math.round(fs * 0.04)) } }, shadow: { x: fs * 0.06, y: fs * 0.06, blur: 0, color: '#14161B' } })],
    ['sticker', 'Etiket (sticker)', 'light', (l, fs, c) => ({ fontFamily: 'Poppins', fontWeight: 700, fill: c, fx: { outline: { color: '#FFFFFF', width: Math.max(3, Math.round(fs * 0.1)) } }, shadow: { x: 0, y: fs * 0.06, blur: fs * 0.14, color: 'rgba(0,0,0,0.35)' } })],
    ['chrome', 'Krom', 'dark', (l, fs) => ({ fontFamily: 'Inter', fontWeight: 900, uppercase: true, fill: { type: 'linear', angle: 90, colors: ['#FFFFFF', '#B8BCC4', '#F2F3F5', '#6B7078', '#D9DCE1'] }, shadow: { x: 0, y: fs * 0.05, blur: fs * 0.1, color: 'rgba(0,0,0,0.6)' } })],
    ['luxe', 'Lüks serif', 'light', (l, fs) => ({ fontFamily: 'GFS Baskerville', fontWeight: 400, uppercase: true, letterSpacing: Math.round(fs * 0.18), fill: '#1D1B18' })],
    ['sale', 'Cesur indirim', 'light', (l, fs) => ({ fontFamily: 'TeX Gyre Heros Cn', fontWeight: 700, uppercase: true, fill: '#FFFFFF', bgFill: '#E5484D', bgPad: Math.round(fs * 0.28), radius: Math.round(fs * 0.12) })],
    ['script', 'El yazısı imza', 'light', (l, fs) => ({ fontFamily: 'TeX Gyre Chorus', fontWeight: 500, fill: '#2B2420', fontSizeK: 1.25 })],
    ['pop', 'Gradyan pop', 'light', (l, fs) => ({ fontFamily: 'Poppins', fontWeight: 700, fill: { type: 'linear', angle: 0, colors: ['#FF6B6B', '#C850C0', '#4158D0'] } })],
    ['soft', 'Yumuşak gölge', 'light', (l, fs) => ({ fontFamily: 'Inter', fontWeight: 800, fill: '#14161B', shadow: { x: 0, y: fs * 0.12, blur: fs * 0.35, color: 'rgba(20,22,27,0.28)' } })],
    ['outline', 'Çizgisel', 'light', (l, fs, c) => ({ fontFamily: 'Inter', fontWeight: 900, uppercase: true, fill: 'none', stroke: c, strokeWidth: Math.max(1.5, fs * 0.03) })],
    ['thin', 'Minimal ince', 'light', (l, fs) => ({ fontFamily: 'Inter', fontWeight: 200, uppercase: true, letterSpacing: Math.round(fs * 0.3), fill: '#14161B' })],
    ['condensed', 'Afiş (dar)', 'light', (l, fs) => ({ fontFamily: 'TeX Gyre Heros Cn', fontWeight: 700, uppercase: true, fill: '#14161B', fontSizeK: 1.2, lineHeight: 0.95 })],
    ['glow', 'Parlayan beyaz', 'dark', (l, fs, c) => ({ fontFamily: 'Poppins', fontWeight: 600, fill: '#FFFFFF', fx: { glow: { color: c, blur: Math.round(fs * 0.3) } } })],
  ];
  const STYLE_KEYS = ['fontFamily', 'fontWeight', 'fill', 'fx', 'shadow', 'stroke', 'strokeWidth', 'uppercase', 'letterSpacing', 'italic', 'bgFill', 'bgPad', 'radius', 'lineHeight'];
  function applyStyle(l, key, accent) {
    const s = TSTYLES.find((x) => x[0] === key); if (!s) return;
    const fs = +l.fontSize || 48, v = s[3](l, fs, accent);
    Object.assign(l, { fx: null, shadow: null, stroke: null, strokeWidth: 0, uppercase: false, letterSpacing: 0, italic: false, bgFill: 'none', lineHeight: l.lineHeight || 1.15 });
    delete l._fxName; delete l._hollowFill; delete l._fxStroke; delete l._fxBg;
    const k = v.fontSizeK; delete v.fontSizeK;
    Object.assign(l, v);
    if (k && !l._styleK) { l.fontSize = r1(fs * k); l._styleK = k; } else if (!k && l._styleK) { l.fontSize = r1(fs / l._styleK); delete l._styleK; }
    if (!l.fx) delete l.fx;
    l._style = key;
  }
  P6.textStyles = async function () {
    const e = E(); if (!e) return;
    const d = e.doc;
    let sel = e.state.sel.map((id) => d.layers.find((l) => l.id === id)).filter((l) => l && l.type === 'text');
    const accent = (brand().colors || [])[0] || '#E2197C';
    const sample = sel.length ? R.plain(sel[0].text).split('\n')[0].slice(0, 16) || 'Başlık' : 'Başlık';
    await R.ensureDocFonts({ layers: TSTYLES.map((s) => ({ type: 'text', fontFamily: s[3]({}, 48, accent).fontFamily, fontWeight: s[3]({}, 48, accent).fontWeight || 400 })) }).catch(() => {});
    const thumb = (s) => {
      const l = { type: 'text', name: 't', text: sample, x: 20, y: 0, w: 360, h: 80, fontSize: 52, fill: '#14161B', align: 'center', fontFamily: 'Inter', fontWeight: 700, lineHeight: 1.1, visible: true, opacity: 1 };
      applyStyle(l, s[0], accent); R.layoutText(l);
      // en uzun satır kutuya sığana dek küçült (geniş harf aralıklı stiller taşmasın)
      for (let k = 0; k < 12; k++) { const lw = Math.max(...(l._lines || [l.text]).map((ln) => R.measure(l.uppercase ? String(ln).toLocaleUpperCase('tr-TR') : String(ln), l))); if (lw <= l.w * 0.98 && l.h <= 130) break; const f = Math.min(l.w * 0.96 / Math.max(1, lw), 125 / Math.max(1, l.h), 0.92); l.fontSize *= f; if (l.letterSpacing) l.letterSpacing *= f; R.layoutText(l); }
      l.y = (150 - l.h) / 2;
      return R.renderSVG(R.normalize({ width: 400, height: 150, background: { type: 'solid', color: s[2] === 'dark' ? '#16181D' : '#F4F2EE' }, layers: [l] }), { fit: true, prefix: 'ts' + s[0] + '_' });
    };
    const key = await A().dialog(`<div class="d-body"><h3>${icon('type')} Yazı stilleri</h3><p class="muted" style="font-size:13px;margin:0 0 10px">${sel.length ? `Seçili ${sel.length} yazıya uygulanır.` : 'Yeni başlık olarak eklenir. Var olan yazıya uygulamak için önce onu seç.'} Yazı tipi, renk ve efekt birlikte gelir; sonra her birini ayrı değiştirebilirsin.</p>
      <div class="tsg">${TSTYLES.map((s) => `<button class="tsg-it" data-k="${s[0]}"><span class="tsg-th">${thumb(s)}</span><b>${s[1]}</b></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, { cls: 'wide', onOpen: (box, close) => $$('.tsg-it', box).forEach((b) => (b.onclick = () => close(b.dataset.k))) });
    if (!key) return;
    if (!sel.length) {
      const c = e.center(), fs = Math.round(Math.min(d.width, d.height) * 0.1), w = Math.round(d.width * 0.8);
      const [l] = e.insert([{ type: 'text', name: 'Başlık', text: 'Başlığını yaz', x: c.x - w / 2, y: c.y - fs * 0.6, w, h: fs * 1.2, fontSize: fs, fill: '#14161B', align: 'center', fontFamily: 'Inter', fontWeight: 800, lineHeight: 1.1 }], { select: true });
      sel = [l];
    }
    sel.forEach((l) => { applyStyle(l, key, accent); R.layoutText(l); });
    await R.ensureDocFonts(d).catch(() => {});
    sel.forEach((l) => R.layoutText(l));
    e.relayout(); e.commit();
    toast(TSTYLES.find((s) => s[0] === key)[1] + ' uygulandı');
  };

  // ======================================================================
  // 6) YENİ ARKA PLANLAR (desen + doku; P5 galerisine eklenir → 40+)
  // ======================================================================
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const mix = (a, b, t) => { const x = T.rgb(a), y = T.rgb(b); return `rgb(${Math.round(x.r + (y.r - x.r) * t)},${Math.round(x.g + (y.g - x.g) * t)},${Math.round(x.b + (y.b - x.b) * t)})`; };
  const NEW_PATTERNS = {
    hex: ['Petek', (c1, c2, s) => { const h = s * 0.866; return `<pattern id="p" width="${s * 3}" height="${h * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 3}" height="${h * 2}" fill="${c1}"/><path d="M${s / 2} 0h${s}l${s / 2} ${h}-${s / 2} ${h}h-${s}L0 ${h}zM${s * 2} ${h}h${s}l${s / 2} ${h}M${s * 2} ${h}l-${s / 2} ${h}M${s * 2} ${h}l-${s / 2}-${h}M${s * 3} ${h}l${s / 2}-${h}" fill="none" stroke="${c2}" stroke-width="${Math.max(1, s / 14)}"/></pattern>`; }],
    herring: ['Balıksırtı', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s * 2}" fill="${c1}"/><path d="M0 0l${s / 2} ${s / 2}L${s} 0M0 ${s}l${s / 2} ${s / 2}L${s} ${s}" fill="none" stroke="${c2}" stroke-width="${s / 8}"/></pattern>`],
    scales: ['Pul', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s / 2}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s / 2}" fill="${c1}"/><path d="M0 ${s / 2}a${s / 2} ${s / 2} 0 0 1 ${s} 0M-${s / 2} 0a${s / 2} ${s / 2} 0 0 1 ${s} 0M${s / 2} 0a${s / 2} ${s / 2} 0 0 1 ${s} 0" fill="none" stroke="${c2}" stroke-width="${s / 18}"/></pattern>`],
    argyle: ['Baklava', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s * 1.4}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s * 1.4}" fill="${c1}"/><path d="M${s / 2} 0L${s} ${s * 0.7}L${s / 2} ${s * 1.4}L0 ${s * 0.7}z" fill="${c2}" opacity=".35"/><path d="M0 0L${s} ${s * 1.4}M${s} 0L0 ${s * 1.4}" stroke="${c2}" stroke-width="${s / 40}" opacity=".6"/></pattern>`],
    polka: ['Puantiye', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${c1}"/><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.28}" fill="${c2}"/><circle cx="${s * 1.5}" cy="${s * 1.5}" r="${s * 0.28}" fill="${c2}"/></pattern>`],
    brick: ['Tuğla', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s}" fill="${c1}"/><path d="M0 0H${s * 2}M0 ${s / 2}H${s * 2}M${s / 2} 0V${s / 2}M${s * 1.5} ${s / 2}V${s}" stroke="${c2}" stroke-width="${s / 16}"/></pattern>`],
    stars: ['Yıldızlar', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${c1}"/><path transform="translate(${s * 0.25} ${s * 0.25}) scale(${s / 200})" d="M50 0L61.8 34.5L97.6 34.5L68.8 55.9L79.4 90.5L50 69.1L20.6 90.5L31.2 55.9L2.4 34.5L38.2 34.5Z" fill="${c2}"/><path transform="translate(${s * 1.25} ${s * 1.25}) scale(${s / 300})" d="M50 0L61.8 34.5L97.6 34.5L68.8 55.9L79.4 90.5L50 69.1L20.6 90.5L31.2 55.9L2.4 34.5L38.2 34.5Z" fill="${c2}" opacity=".6"/></pattern>`],
    hearts: ['Kalpler', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${c1}"/><path transform="translate(${s * 0.5} ${s * 0.5}) scale(${s / 100})" d="M50 88C20 66 4 48 4 30 4 14 16 4 30 4c9 0 16 5 20 12 4-7 11-12 20-12 14 0 26 10 26 26 0 18-16 36-46 58z" fill="${c2}"/><path transform="translate(${s * 1.4} ${s * 1.35}) scale(${s / 160})" d="M50 88C20 66 4 48 4 30 4 14 16 4 30 4c9 0 16 5 20 12 4-7 11-12 20-12 14 0 26 10 26 26 0 18-16 36-46 58z" fill="${c2}" opacity=".5"/></pattern>`],
    chevron: ['Şerit ok', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><path d="M0 ${s * 0.25}L${s / 2} ${s * 0.65}L${s} ${s * 0.25}" fill="none" stroke="${c2}" stroke-width="${s / 5}"/></pattern>`],
    candy: ['Dikey şerit', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><rect width="${s / 2}" height="${s}" fill="${c2}" opacity=".85"/></pattern>`],
    cross: ['Çapraz kafes', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><path d="M0 0L${s} ${s}M${s} 0L0 ${s}" stroke="${c2}" stroke-width="${Math.max(1, s / 22)}"/></pattern>`],
  };
  const NEW_TEXTURES = {
    rays: ['Güneş ışınları', (c1, c2, W, H) => { const n = 24, R2 = Math.hypot(W, H); let o = ''; for (let i = 0; i < n; i += 2) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2; o += `<path d="M${W / 2} ${H / 2}L${W / 2 + R2 * Math.cos(a)} ${H / 2 + R2 * Math.sin(a)}L${W / 2 + R2 * Math.cos(b)} ${H / 2 + R2 * Math.sin(b)}z" fill="${c2}" opacity=".18"/>`; } return `<defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="${c1}"/>${o}<rect width="${W}" height="${H}" fill="url(#g)"/>`; }],
    aurora: ['Kuzey ışığı', (c1, c2, W, H) => `<defs><filter id="b"><feGaussianBlur stdDeviation="${Math.max(W, H) / 12}"/></filter><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(c1, '#000', 0.55)}"/><stop offset="1" stop-color="${mix(c1, '#000', 0.25)}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#l)"/><g filter="url(#b)" opacity=".85"><ellipse cx="${W * 0.25}" cy="${H * 0.35}" rx="${W * 0.35}" ry="${H * 0.14}" fill="${c2}" transform="rotate(-18 ${W * 0.25} ${H * 0.35})"/><ellipse cx="${W * 0.7}" cy="${H * 0.5}" rx="${W * 0.38}" ry="${H * 0.12}" fill="#22D3EE" transform="rotate(14 ${W * 0.7} ${H * 0.5})"/><ellipse cx="${W * 0.5}" cy="${H * 0.75}" rx="${W * 0.3}" ry="${H * 0.1}" fill="#A78BFA"/></g>`],
    split: ['Çapraz ikiye', (c1, c2, W, H) => `<rect width="${W}" height="${H}" fill="${c1}"/><path d="M0 ${H * 0.62}L${W} ${H * 0.38}V${H}H0z" fill="${c2}"/>`],
    blobs: ['Organik lekeler', (c1, c2, W, H) => { const m = Math.min(W, H); return `<rect width="${W}" height="${H}" fill="${c1}"/><path transform="translate(${-m * 0.12} ${-m * 0.1}) scale(${m / 300})" d="M150 20c50 0 110 30 120 90s-30 120-90 130S40 230 30 170 100 20 150 20z" fill="${c2}" opacity=".55"/><path transform="translate(${W - m * 0.42} ${H - m * 0.4}) scale(${m / 260})" d="M140 10c60 10 120 60 110 120s-60 120-130 110S0 160 20 100 80 0 140 10z" fill="${c2}" opacity=".35"/>`; }],
    layered: ['Katmanlı dalga', (c1, c2, W, H) => { let o = ''; for (let i = 0; i < 4; i++) { const y = H * (0.55 + i * 0.12), a = H * 0.05; o += `<path d="M0 ${y}C${W * 0.25} ${y - a} ${W * 0.5} ${y + a} ${W * 0.75} ${y - a * 0.5}S${W} ${y}${W} ${y}V${H}H0z" fill="${mix(c2, c1, i * 0.22)}" opacity="${(0.5 + i * 0.15).toFixed(2)}"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
    topo: ['Topografik', (c1, c2, W, H) => { const r = rnd(21); let o = ''; for (let c = 0; c < 4; c++) { const cx = W * r(), cy = H * r(); for (let i = 1; i < 12; i++) { const rr = i * Math.max(W, H) * 0.035; let dd = ''; for (let a = 0; a <= 36; a++) { const t = (a / 36) * Math.PI * 2, k = rr * (1 + 0.12 * Math.sin(t * 3 + c) + 0.06 * Math.cos(t * 5 + i)); dd += (a ? 'L' : 'M') + (cx + k * Math.cos(t)).toFixed(1) + ' ' + (cy + k * Math.sin(t)).toFixed(1); } o += `<path d="${dd}z" fill="none" stroke="${c2}" stroke-width="${Math.max(1, W / 600)}" opacity=".35"/>`; } } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
    lowpoly: ['Üçgen mozaik', (c1, c2, W, H) => { const r = rnd(5), nx = 8, ny = Math.max(4, Math.round(8 * H / W)), pts = []; for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pts.push([W * i / nx + (i && i < nx ? (r() - 0.5) * W / nx * 0.7 : 0), H * j / ny + (j && j < ny ? (r() - 0.5) * H / ny * 0.7 : 0)]); let o = ''; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = pts[j * (nx + 1) + i], b = pts[j * (nx + 1) + i + 1], c = pts[(j + 1) * (nx + 1) + i], d = pts[(j + 1) * (nx + 1) + i + 1]; [[a, b, d], [a, d, c]].forEach((tri) => { const t = (tri[0][1] + tri[1][1] + tri[2][1]) / 3 / H * 0.7 + r() * 0.3; o += `<path d="M${tri.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}z" fill="${mix(c1, c2, t)}" stroke="${mix(c1, c2, t)}" stroke-width="1"/>`; }); } return o; }],
    spotlight: ['Spot ışık', (c1, c2, W, H) => `<defs><radialGradient id="g" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="${mix(c2, '#fff', 0.35)}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${mix(c1, '#000', 0.4)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`],
    grain: ['Kumlu degrade', (c1, c2, W, H) => `<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .28 0"/></filter></defs><rect width="${W}" height="${H}" fill="url(#l)"/><rect width="${W}" height="${H}" filter="url(#f)"/>`],
    cubes: ['İzometrik küp', (c1, c2, W, H) => { const s = Math.max(W, H) / 16, h = s * 0.866; let o = ''; for (let y = -1; y < H / (s * 1.5) + 1; y++) for (let x = -1; x < W / (h * 2) + 1; x++) { const cx = x * h * 2 + (y % 2 ? h : 0), cy = y * s * 1.5; o += `<path d="M${cx} ${cy}l${h} ${s / 2}v${s}l-${h} -${s / 2}z" fill="${mix(c1, c2, 0.25)}"/><path d="M${cx} ${cy}l-${h} ${s / 2}v${s}l${h} -${s / 2}z" fill="${mix(c1, c2, 0.5)}"/><path d="M${cx} ${cy}l${h} ${s / 2}l-${h} ${s / 2}l-${h} -${s / 2}z" fill="${c1}"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
    memphis: ['Memphis', (c1, c2, W, H) => { const r = rnd(17), cs = [c2, '#FFC93C', '#3EC1D3', '#FF6B6B', '#14161B']; let o = ''; const n = 34, m = Math.min(W, H); for (let i = 0; i < n; i++) { const x = W * r(), y = H * r(), s = m * (0.025 + r() * 0.03), c = cs[i % cs.length], t = i % 4; o += t === 0 ? `<circle cx="${x}" cy="${y}" r="${s / 2}" fill="${c}"/>` : t === 1 ? `<path d="M${x} ${y}l${s} ${s * 0.4}" stroke="${c}" stroke-width="${s / 4}" stroke-linecap="round"/>` : t === 2 ? `<path d="M${x} ${y}q${s / 2} -${s / 2} ${s} 0t${s} 0t${s} 0" fill="none" stroke="${c}" stroke-width="${s / 5}" stroke-linecap="round"/>` : `<path d="M${x} ${y}l${s / 2} -${s * 0.8}l${s / 2} ${s * 0.8}z" fill="none" stroke="${c}" stroke-width="${s / 6}"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
  };
  if (window.P5 && window.P5.PATTERNS) { Object.assign(window.P5.PATTERNS, NEW_PATTERNS); Object.assign(window.P5.TEXTURES, NEW_TEXTURES); }

  // ======================================================================
  // 7) KAMPANYA TAKVİMİ: yaklaşan özel günler için hazır tasarım
  // ======================================================================
  if (window.P5 && window.P5.specialDays) {
    const orig = window.P5.specialDays;
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    window.P5.specialDays = (y) => orig(y).concat([
      { date: `${y}-11-11`, name: '11.11 İndirimleri', prompt: '11.11 büyük indirim günü kampanya postu' },
      { date: `${y}-03-21`, name: 'Bahar indirimi', prompt: 'Bahar indirimi kampanya postu' },
      { date: `${y}-06-21`, name: 'Yaz indirimi', prompt: 'Yaz indirimi kampanya postu' },
      { date: `${y}-12-15`, name: 'Yılbaşı alışverişi', prompt: 'Yılbaşı hediye alışverişi kampanya postu' },
      { date: ymd(new Date(y, 10, 1 + ((1 - new Date(y, 10, 1).getDay() + 7) % 7) + 21 + 7)), name: 'Siber Pazartesi', prompt: 'Siber Pazartesi online indirim postu' },
    ].filter((d) => !orig(y).some((o) => o.date === d.date))).sort((a, b) => a.date.localeCompare(b.date));
  }
  const THEMES = [
    [/efsane|black/i, { bg: ['#0B0B0F', '#1F1F27'], ink: '#FFFFFF', a: '#FFD400', h: 'EFSANE CUMA', s: 'Tüm ürünlerde %50’ye varan indirim', badge: '%50', sale: true, deco: 'burst' }],
    [/siber/i, { bg: ['#0A0F2C', '#1B2A6B'], ink: '#FFFFFF', a: '#22D3EE', h: 'SİBER PAZARTESİ', s: 'Yalnızca online, yalnızca bugün', badge: '%40', sale: true, deco: 'grid' }],
    [/11\.11/i, { bg: ['#FF3D3D', '#FF8A00'], ink: '#FFFFFF', a: '#14161B', h: '11.11', s: 'Yılın en büyük indirim günü', badge: '%30', sale: true, deco: 'burst' }],
    [/yılbaşı|yeni yıl/i, { bg: ['#0E3B2E', '#14532D'], ink: '#FFF8E7', a: '#E8B64C', h: 'Mutlu Yıllar', s: 'Yeni yıla özel hediye fırsatları', badge: '%25', sale: true, deco: 'stars' }],
    [/sevgililer/i, { bg: ['#FFE4EC', '#FFC2D4'], ink: '#7A1035', a: '#E11D48', h: 'Sevgililer Günü', s: 'Sevdiklerine özel hediye fırsatları', badge: '%20', sale: true, deco: 'hearts' }],
    [/anneler/i, { bg: ['#FFF1F2', '#FDE2E4'], ink: '#4A1D2F', a: '#DB7093', h: 'Anneler Günü', s: 'Annene en güzel hediye', badge: '%15', sale: true, deco: 'circles' }],
    [/babalar/i, { bg: ['#E8EEF6', '#D3DEEC'], ink: '#14213D', a: '#2563EB', h: 'Babalar Günü', s: 'Babana özel seçimler', badge: '%15', sale: true, deco: 'circles' }],
    [/öğretmen/i, { bg: ['#FFF7E6', '#FDEBC8'], ink: '#3B2A12', a: '#D97706', h: 'Öğretmenler Günü\nkutlu olsun', s: 'Emeğiniz için teşekkürler', sale: false, deco: 'circles' }],
    [/10 kasım|15 temmuz/i, { bg: ['#111214', '#1E1F22'], ink: '#F2F2F2', a: '#9CA3AF', h: null, s: 'Saygı ve özlemle anıyoruz', sale: false, deco: 'none', solemn: true }],
    [/cumhuriyet|23 nisan|19 mayıs|30 ağustos/i, { bg: ['#C8102E', '#9E0B22'], ink: '#FFFFFF', a: '#FFFFFF', h: null, s: 'Bayramımız kutlu olsun', sale: false, deco: 'stars' }],
    [/bayram/i, { bg: ['#0F3D2E', '#14532D'], ink: '#FFF8E7', a: '#E8B64C', h: null, s: 'Bayramınız mübarek olsun', sale: false, deco: 'stars' }],
    [/kadınlar/i, { bg: ['#F3E8FF', '#E9D5FF'], ink: '#3B0764', a: '#9333EA', h: '8 Mart\nDünya Kadınlar Günü', s: 'Tüm kadınların günü kutlu olsun', sale: false, deco: 'circles' }],
    [/bahar|yaz|okula|yerli/i, { bg: ['#FEF9C3', '#FDE68A'], ink: '#1F2937', a: '#16A34A', h: null, s: 'Sezona özel indirim', badge: '%20', sale: true, deco: 'blobs' }],
  ];
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  P6.campaignDesign = function (day, W = 1080, H = 1080) {
    const th = Object.assign({ bg: ['#F4F2EE', '#E9E4DC'], ink: '#14161B', a: (brand().colors || [])[0] || '#E2197C', h: null, s: 'Bu güne özel indirim', badge: '%20', sale: true, deco: 'circles' }, (THEMES.find(([re]) => re.test(day.name)) || [])[1] || {});
    const b = brand(), u = Math.min(W, H) / 100, dt = new Date(day.date + 'T00:00');
    const head = th.h || day.name.replace(/ arifesi$/, '');
    const L = [];
    const deco = th.deco;
    if (deco === 'circles') { L.push({ type: 'ellipse', name: 'Süs', x: W - 40 * u, y: -14 * u, w: 56 * u, h: 56 * u, fill: th.a, opacity: 0.16 }); L.push({ type: 'ellipse', name: 'Süs', x: -18 * u, y: H - 30 * u, w: 44 * u, h: 44 * u, fill: th.a, opacity: 0.12 }); }
    if (deco === 'burst') { let s = ''; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, r = i % 2 ? 40 : 50; s += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2); } L.push({ type: 'path', name: 'Süs', d: s + 'Z', vw: 100, vh: 100, x: W * 0.5 - 60 * u, y: H * 0.42 - 60 * u, w: 120 * u, h: 120 * u, fill: th.a, opacity: 0.12, rotation: 8 }); }
    if (deco === 'stars') for (let i = 0; i < 14; i++) { const r = rnd(i + 3), s = (1.5 + r() * 3) * u; L.push({ type: 'path', name: 'Süs', d: 'M50 0L61.8 34.5L97.6 34.5L68.8 55.9L79.4 90.5L50 69.1L20.6 90.5L31.2 55.9L2.4 34.5L38.2 34.5Z', vw: 100, vh: 100, x: W * r(), y: H * r() * 0.35, w: s, h: s, fill: th.a, opacity: 0.5 + r() * 0.4 }); }
    if (deco === 'hearts') for (let i = 0; i < 9; i++) { const r = rnd(i + 11), s = (4 + r() * 7) * u; L.push({ type: 'path', name: 'Süs', d: 'M50 88C20 66 4 48 4 30 4 14 16 4 30 4c9 0 16 5 20 12 4-7 11-12 20-12 14 0 26 10 26 26 0 18-16 36-46 58z', vw: 100, vh: 100, x: W * r(), y: H * r(), w: s, h: s, fill: th.a, opacity: 0.12 + r() * 0.2, rotation: (r() - 0.5) * 40 }); }
    if (deco === 'grid') L.push({ type: 'rect', name: 'Süs', x: 0, y: 0, w: W, h: H, fill: 'rgba(0,0,0,0)', stroke: th.a, strokeWidth: 0.2 * u, opacity: 0.25, dash: [u, u] });
    if (deco === 'blobs') L.push({ type: 'path', name: 'Süs', d: 'M150 20c50 0 110 30 120 90s-30 120-90 130S40 230 30 170 100 20 150 20z', vw: 300, vh: 260, x: W - 52 * u, y: -12 * u, w: 70 * u, h: 60 * u, fill: th.a, opacity: 0.18 });
    const tall = H / W > 1.3, cx = W / 2, top = tall ? H * 0.2 : H * 0.14;
    L.push({ type: 'text', name: 'Tarih', text: `${dt.getDate()} ${MONTHS[dt.getMonth()]}`.toLocaleUpperCase('tr-TR'), x: W * 0.1, y: top, w: W * 0.8, h: 4 * u, fontSize: 3.2 * u, fill: th.a, fontFamily: 'Inter', fontWeight: 700, letterSpacing: 0.8 * u, align: 'center' });
    const hf = th.solemn ? 'Lora' : head.length > 14 ? 'Inter' : 'TeX Gyre Heros Cn';
    const hs = th.solemn ? 8.5 * u : Math.min(17 * u, (W * 0.84) / Math.max(4, Math.max(...head.split('\n').map((x) => x.length))) * (hf === 'Inter' ? 1.65 : 2.05));
    L.push({ type: 'text', name: 'Başlık', text: head, x: W * 0.08, y: top + 7 * u, w: W * 0.84, h: hs * 1.1, fontSize: hs, fill: th.ink, fontFamily: hf, fontWeight: th.solemn ? 400 : hf === 'Inter' ? 900 : 700, lineHeight: 1.02, align: 'center', uppercase: !th.solemn && hf !== 'Inter' });
    L.push({ type: 'text', name: 'Alt başlık', text: th.s, x: W * 0.12, y: 0, w: W * 0.76, h: 5 * u, fontSize: 4 * u, fill: th.ink, opacity: 0.85, fontFamily: th.solemn ? 'Lora' : 'Inter', fontWeight: 500, lineHeight: 1.3, align: 'center', below: 1 });
    if (th.sale) {
      const bs = 26 * u;
      L.push({ type: 'ellipse', name: 'Fiyat dairesi', x: cx - bs / 2, y: 0, w: bs, h: bs, fill: th.a, shadow: { x: 0, y: u, blur: 3 * u, color: 'rgba(0,0,0,0.25)' }, below: 2.5, group: 'cb' });
      L.push({ type: 'text', name: 'İndirim', text: th.badge, x: cx - bs / 2, y: 0, w: bs, h: 9 * u, fontSize: 8 * u, fill: C2(th.a), fontFamily: 'Inter', fontWeight: 900, align: 'center', bind: 'discount', group: 'cb', centerIn: 'Fiyat dairesi' });
      L.push({ type: 'rect', name: 'Buton zemini', x: cx - 20 * u, y: 0, w: 40 * u, h: 9 * u, fill: th.ink, radius: 4.5 * u, below: 3, group: 'cbt' });
      L.push({ type: 'text', name: 'Buton yazısı', text: 'Alışverişe başla', x: cx - 20 * u, y: 0, w: 40 * u, h: 4 * u, fontSize: 3.4 * u, fill: C2(th.ink), fontFamily: 'Inter', fontWeight: 700, align: 'center', group: 'cbt', centerIn: 'Buton zemini' });
    }
    L.push({ type: 'text', name: 'Marka', text: b.name || 'MARKANIZ', x: W * 0.1, y: H - (tall ? 14 : 11) * u, w: W * 0.8, h: 4 * u, fontSize: 3.2 * u, fill: th.ink, opacity: 0.85, fontFamily: 'Inter', fontWeight: 800, letterSpacing: 0.6 * u, align: 'center' });
    if (b.web || b.phone) L.push({ type: 'text', name: 'İletişim', text: [b.phone, b.web].filter(Boolean).join('   •   '), x: W * 0.1, y: H - (tall ? 9 : 6.5) * u, w: W * 0.8, h: 3 * u, fontSize: 2.4 * u, fill: th.ink, opacity: 0.7, fontFamily: 'Inter', fontWeight: 500, align: 'center' });
    // dikey akış: “below” = önceki öğenin altına (u cinsinden boşluk)
    const ls = L.map((l) => Object.assign({ visible: true, opacity: 1, rotation: 0 }, l));
    let last = null;
    ls.forEach((l) => { if (l.type === 'text') R.layoutText(l); if (l.below != null && last) { l.y = last.y + last.h + l.below * u; } if (l.centerIn) { const ref = ls.find((x) => x.name === l.centerIn && x.group === l.group); if (ref) l.y = ref.y + (ref.h - l.h) / 2; } if (!l.centerIn && l.name !== 'Süs') last = l; delete l.below; delete l.centerIn; });
    // içerik bloğunu dikeyde ortala
    const body = ls.filter((l) => l.name !== 'Süs' && l.name !== 'Marka' && l.name !== 'İletişim');
    const y0 = Math.min(...body.map((l) => l.y)), y1 = Math.max(...body.map((l) => l.y + l.h)), avail = H - (tall ? 18 : 15) * u;
    const dy = (avail - (y1 - y0)) / 2 - y0 + (tall ? 2 : 1) * u; if (dy > 0) body.forEach((l) => (l.y += dy));
    return R.normalize({ width: W, height: H, background: { type: 'linear', angle: 135, colors: th.bg }, layers: ls, name: day.name, meta: { campaign: day.date } });
  };
  const C2 = (c) => (window.Coach ? window.Coach.readable(c) : '#FFFFFF');
  P6.campaigns = async function (focus) {
    const days = (window.P5 ? window.P5.upcoming(75) : []).filter((d, i, a) => a.findIndex((x) => x.name === d.name) === i).slice(0, 12);
    if (!days.length) return toast('Yakında özel gün yok');
    await R.ensureDocFonts({ layers: [{ type: 'text', fontFamily: 'Inter', fontWeight: 900 }, { type: 'text', fontFamily: 'TeX Gyre Heros Cn', fontWeight: 700 }, { type: 'text', fontFamily: 'Lora', fontWeight: 400 }] }).catch(() => {});
    const left = (d) => { const n = Math.round((new Date(d.date + 'T00:00') - new Date(new Date().toDateString())) / 864e5); return n <= 0 ? 'bugün' : n === 1 ? 'yarın' : n + ' gün sonra'; };
    const res = await A().dialog(`<div class="d-body"><h3>${icon('calendar')} Yaklaşan kampanyalar</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Önümüzdeki özel günler için tasarımlar hazır. Marka adın ve iletişim bilgilerin eklenir; aç, değiştir, paylaş. Anma günlerinde indirim yerine sade bir anma tasarımı gelir.</p>
      <div class="cp-grid">${days.map((d, i) => `<div class="cp-it${focus && focus === d.date ? ' on' : ''}"><span class="cp-th" data-th="${i}"></span><div class="cp-m"><b>${esc(d.name)}</b><small>${new Date(d.date + 'T00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} · ${left(d)}</small></div>
        <div class="cp-a"><button class="btn sm primary" data-o="${i}:ig">${icon('pen')}Aç</button><button class="btn sm ghost" data-o="${i}:story">Story</button><button class="btn sm ghost" data-o="${i}:set">${icon('copy')}Set</button></div></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $$('[data-th]', box).forEach((el, k) => setTimeout(() => { el.innerHTML = R.renderSVG(P6.campaignDesign(days[+el.dataset.th]), { fit: true, prefix: 'cp' + k + '_' }); }, 30 + k * 25));
        $$('[data-o]', box).forEach((b) => (b.onclick = () => close(b.dataset.o)));
        const f = $('.cp-it.on', box); if (f) setTimeout(() => f.scrollIntoView({ block: 'center' }), 100);
      },
    });
    if (!res) return;
    const [i, kind] = res.split(':'), day = days[+i];
    const d = kind === 'story' ? P6.campaignDesign(day, 1080, 1920) : P6.campaignDesign(day);
    const p = Object.assign(A().newProject(d.width, d.height, day.name + (kind === 'story' ? ' · Story' : '')), { background: d.background, layers: d.layers, meta: d.meta });
    R.normalize(p); A().S.project = p; await A().saveProject(p);
    if (kind === 'set') return P6.campaignSet(p);
    A().go('editor', p.id);
  };

  // ======================================================================
  // 7b) BU TASARIMA BENZET (örnek görselden renk ve hava)
  // ======================================================================
  P6.reference = async function () {
    const file = await new Promise((res) => A().pickFiles((f) => res(f[0] || null), false));
    if (!file) return;
    const url = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(file); });
    const P = window.Food ? await window.Food.paletteFromReference(url) : null;
    if (!P) return toast('Görsel okunamadı', true);
    if (window.Coach) window.Coach._refP = P;
    const e = E(), hasDoc = !!(e && A().S.route === 'editor');
    const mood = `${P.mood.dark ? 'Koyu' : 'Açık'} zemin · ${P.mood.vivid ? 'canlı' : 'sade'} renkler`;
    if (window.Food) await window.Food.load();
    const picks = (window.Food ? window.Food.templates : []).filter((t) => (P.mood.dark ? ['scene', 'pack', 'offer', 'hero'] : ['hero', 'split', 'plate', 'pack']).includes(t.arch)).slice(0, 40).sort(() => Math.random() - 0.5).slice(0, 6);
    const v = await A().dialog(`<div class="d-body"><h3>${icon('image')} Bu tasarıma benzet</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Beğendiğin tasarımın renkleri ve havası çıkarıldı. Şablonlar ve tasarımın bu renklerle hazırlanır; yazılar okunur kalır.</p>
      <div class="ref-top"><img src="${url}" alt=""><div><div class="ref-sw">${['bg', 'ink', 'a', 'b', 'c'].map((k) => `<span style="background:${P[k]}" title="${P[k]}"></span>`).join('')}</div><b>${mood}</b><small class="muted">Zemin, yazı, vurgu, ikinci vurgu, yumuşak ton</small></div></div>
      <div class="ref-grid">${picks.map((t, i) => `<button class="ref-it" data-t="${t.id}"><span class="ref-th" data-i="${i}"></span><small>${esc(t.name)}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button>${hasDoc ? `<button class="btn" id="rfApply">${icon('harmony')}Açık tasarıma uygula</button>` : ''}<button class="btn primary" id="rfAll">${icon('layers')}Tüm şablonları bu renklerle gör</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $$('[data-i]', box).forEach((el, k) => setTimeout(() => { const t = picks[+el.dataset.i]; el.innerHTML = R.renderSVG(R.normalize(window.Library.instantiateAt(t, 0, P, 1080, 1080)), { fit: true, prefix: 'rf' + k + '_' }); }, 20 + k * 30));
        $$('.ref-it', box).forEach((b) => (b.onclick = () => close('t:' + b.dataset.t)));
        const ap = $('#rfApply', box); if (ap) ap.onclick = () => close('apply');
        $('#rfAll', box).onclick = () => close('all');
      },
    });
    if (!v) return;
    if (v === 'apply') { const d = e.doc, nd = await window.Coach.fixTextColors(window.Coach.recolor(d, P), P); d.background = nd.background; const by = new Map(nd.layers.map((l) => [l.id, l])); d.layers.forEach((l) => { const n = by.get(l.id); if (n) { l.fill = n.fill; if (l.stroke) l.stroke = n.stroke; } }); e.commit(); toast('Renkler örnek tasarıma göre uygulandı — Ctrl+Z ile geri al'); return; }
    if (v === 'all') return window.Features.templateGallery('Gıda', { customP: P });
    const t = window.Library.templates.find((x) => x.id === v.slice(2)); window.Features._customP = P; return window.Features.useLibraryTemplate(t, 'custom');
  };

  // ======================================================================
  // 8) CAROUSEL (kaydırmalı gönderi)
  // ======================================================================
  P6.carouselNew = async function () {
    const r = await A().dialog(`<div class="d-body"><h3>${icon('layers')} Kaydırmalı gönderi (carousel)</h3><p class="muted" style="font-size:13px">Tek geniş tuvalde tasarla: şekiller sayfa sınırlarından taşabilir, kaydırınca birleşir. İndirirken parçalara bölünür.</p>
      <div class="form-grid"><label class="field"><span>Kaç sayfa?</span><select class="inp" id="crN">${[2, 3, 4, 5, 6, 7, 8, 10].map((n) => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="field"><span>Ölçü</span><select class="inp" id="crR"><option value="1350">Dikey 4:5 (1080 × 1350)</option><option value="1080">Kare (1080 × 1080)</option></select></label></div>
      <label class="switch" style="margin-top:10px"><input type="checkbox" id="crS" checked>Ürün tanıtımı için hazır içerikle başla</label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="crOk">${icon('plus')}Oluştur</button></div>`,
    { onOpen: (box, close) => ($('#crOk', box).onclick = () => close({ n: +$('#crN', box).value, h: +$('#crR', box).value, starter: $('#crS', box).checked })) });
    if (!r) return;
    const w = 1080, W = w * r.n, H = r.h, u = H / 100, bc = brand().colors || [], a = bc[0] || '#E2197C', ink = '#14161B', I = Object.assign({ product: 'Ürün adı', price: '₺249', cta: 'Hemen sipariş ver', desc: 'Kısa ve çekici bir açıklama' }, Object.fromEntries(Object.entries(brand().info || {}).filter(([, v]) => v)));
    const L = [];
    if (r.starter) {
      L.push({ type: 'path', name: 'Akan şerit', d: `M0 70 C 25 40, 50 95, 75 60 S 125 30, 150 65 S 200 90, ${50 * r.n} 55 L ${50 * r.n} 100 L 0 100 Z`, vw: 50 * r.n, vh: 100, x: 0, y: H * 0.55, w: W, h: H * 0.45, fill: a, opacity: 0.16 });
      L.push({ type: 'ellipse', name: 'Geçiş dairesi', x: w - 18 * u, y: H * 0.18, w: 36 * u, h: 36 * u, fill: a, opacity: 0.9 });
      L.push({ type: 'text', name: 'Üst etiket', text: 'YENİ', x: 8 * u, y: 22 * u, w: w * 0.7, h: 4 * u, fontSize: 3.4 * u, fill: a, fontFamily: 'Inter', fontWeight: 800, letterSpacing: 1.2 * u });
      L.push({ type: 'text', name: 'Ürün adı', text: I.product, x: 8 * u, y: 28 * u, w: w * 0.62, h: 20 * u, fontSize: 9 * u, fill: ink, fontFamily: 'Inter', fontWeight: 900, lineHeight: 1.02, bind: 'product' });
      L.push({ type: 'text', name: 'Kaydır', text: 'Kaydır  →', x: 8 * u, y: H - 14 * u, w: w * 0.5, h: 4 * u, fontSize: 3.4 * u, fill: ink, opacity: 0.7, fontFamily: 'Inter', fontWeight: 600 });
      if (r.n >= 2) L.push({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect x="170" y="40" width="260" height="720" rx="60" fill="${a}" opacity=".85"/><rect x="215" y="300" width="170" height="220" rx="16" fill="#fff"/></svg>`), nw: 600, nh: 800, fit: 'contain', x: w + 14 * u, y: 12 * u, w: 52 * u, h: 70 * u, shadow: { x: 0, y: 2 * u, blur: 5 * u, color: 'rgba(0,0,0,0.22)' } });
      if (r.n >= 3) ['Doğal içerik', 'Hızlı kargo', '2 yıl garanti'].forEach((t, i) => { L.push({ type: 'ellipse', name: 'İşaret zemini', x: 2 * w + 10 * u, y: 30 * u + i * 13 * u, w: 7 * u, h: 7 * u, fill: a }); L.push({ type: 'text', name: 'Özellik ' + (i + 1), text: t, x: 2 * w + 20 * u, y: 31 * u + i * 13 * u, w: w * 0.6, h: 5 * u, fontSize: 4.4 * u, fill: ink, fontFamily: 'Inter', fontWeight: 700 }); });
      if (r.n >= 3) L.push({ type: 'text', name: 'Başlık', text: 'Neden seçmelisin?', x: 2 * w + 10 * u, y: 16 * u, w: w * 0.8, h: 7 * u, fontSize: 6 * u, fill: ink, fontFamily: 'Inter', fontWeight: 800 });
      const lx = (r.n - 1) * w;
      L.push({ type: 'text', name: 'Fiyat', text: I.price, x: lx + 8 * u, y: H * 0.34, w: w * 0.8, h: 14 * u, fontSize: 13 * u, fill: a, fontFamily: 'Inter', fontWeight: 900, align: 'center', bind: 'price' });
      L.push({ type: 'rect', name: 'Buton zemini', x: lx + w / 2 - 24 * u, y: H * 0.56, w: 48 * u, h: 10 * u, fill: ink, radius: 5 * u, group: 'crb' });
      L.push({ type: 'text', name: 'Buton yazısı', text: I.cta, x: lx + w / 2 - 24 * u, y: H * 0.56 + 3 * u, w: 48 * u, h: 4 * u, fontSize: 3.8 * u, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 700, align: 'center', group: 'crb', bind: 'cta' });
    }
    const p = Object.assign(A().newProject(W, H, `Carousel · ${r.n} sayfa`), { background: { type: 'linear', angle: 0, colors: ['#FFFFFF', (window.Coach ? window.Coach.palette('mono', a).bg : '#F4F2EE')] }, layers: L, meta: { carousel: { n: r.n, w }, guides: Array.from({ length: r.n - 1 }, (_, i) => ({ x: (i + 1) * w })) } });
    R.normalize(p); p.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
    A().S.project = p; await A().saveProject(p); A().go('editor', p.id);
    setTimeout(() => toast(`${r.n} sayfalık carousel: kesik çizgiler sayfa sınırları. İndirirken ··· → “Carousel parçalarını indir”.`), 700);
  };
  P6.carouselExport = async function (d) {
    d = d || (E() && E().doc); if (!d) return;
    const c = d.meta && d.meta.carousel, n = c ? c.n : Math.max(2, Math.round(d.width / d.height));
    const w = d.width / n;
    toast('Parçalar hazırlanıyor…');
    const cv = await R.exportCanvas(d, Math.min(2, 1080 / w));
    const pw = cv.width / n, files = [];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('canvas'); s.width = Math.round(pw); s.height = cv.height;
      const x = s.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, s.width, s.height); x.drawImage(cv, Math.round(i * pw), 0, Math.round(pw), cv.height, 0, 0, s.width, s.height);
      const b = await new Promise((r) => s.toBlob(r, 'image/jpeg', 0.94));
      files.push({ name: String(i + 1).padStart(2, '0') + '.jpg', data: new Uint8Array(await b.arrayBuffer()) });
    }
    R.download(T.zip(files), (d.name || 'carousel').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-') + '.zip');
    toast(`${n} parça indirildi — Instagram’da sırayla seç`);
  };

  // ======================================================================
  // 9) ÜRÜN VİDEOSU (Reels / Story, 6–15 sn)
  // ======================================================================
  P6.productVideo = async function () {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const src = A().S.project, d0 = A().designOf(src);
    const r = await A().dialog(`<div class="d-body"><h3>${icon('play')} Ürün videosu</h3><p class="muted" style="font-size:13px">Bu tasarımdan dikey bir Reels / Story videosu hazırlanır: ürün yavaşça yakınlaşır, yazılar sırayla gelir, fiyat zıplar. Önizlemede beğenince MP4 indir.</p>
      <div class="exp-row"><span>Hareket</span><div class="seg" id="pvS"><button data-s="dynamic" class="on">Hareketli</button><button data-s="calm">Sakin</button><button data-s="bouncy">Zıplayan</button><button data-s="cinema">Sinematik</button></div></div>
      <div class="exp-row"><span>Süre</span><div class="seg" id="pvL"><button data-l="6">6 sn</button><button data-l="8" class="on">8 sn</button><button data-l="12">12 sn</button><button data-l="15">15 sn</button></div></div>
      <div class="exp-row"><span>Ölçü</span><div class="seg" id="pvF"><button data-f="story" class="on">Dikey 9:16</button><button data-f="same">Bu ölçüde</button></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="pvOk">${icon('play')}Hazırla</button></div>`, {
      onOpen: (box, close) => {
        const st = { s: 'dynamic', l: 8, f: 'story' };
        [['#pvS', 's'], ['#pvL', 'l'], ['#pvF', 'f']].forEach(([id, k]) => $$(id + ' button', box).forEach((b) => (b.onclick = () => { st[k] = k === 'l' ? +b.dataset[k] : b.dataset[k]; $$(id + ' button', box).forEach((x) => x.classList.toggle('on', x === b)); })));
        $('#pvOk', box).onclick = () => close(st);
      },
    });
    if (!r) return;
    let d = R.normalize(clone(d0));
    if (r.f === 'story' && !(d.width === 1080 && d.height === 1920)) d = P6.smartResize(d, 1080, 1920);
    const cfg = { dynamic: [0.22, 0.6], calm: [0.4, 1.1], bouncy: [0.18, 0.7], cinema: [0.5, 1.3] }[r.s];
    const ord = d.layers.slice().map((l, i) => ({ l, i })).sort((a, b) => a.l.y - b.l.y || a.i - b.i);
    let t = 0.15;
    ord.forEach(({ l }) => {
      const big = l.w * l.h > d.width * d.height * 0.5;
      if (big) { l.anim = { type: 'fade', delay: 0, dur: 0.6 }; return; }
      const nm = (l.name || '') + ' ' + (l.type === 'text' ? R.plain(l.text) : '');
      let type = l.type === 'image' ? 'zoom' : /fiyat|₺|%|indirim/i.test(nm) ? 'pop' : /buton|sipariş|hemen/i.test(nm) ? 'up' : l.type === 'text' ? (r.s === 'cinema' ? 'wipe' : 'up') : 'pop';
      if (r.s === 'bouncy' && l.type !== 'image') type = 'pop';
      l.anim = { type, delay: +t.toFixed(2), dur: l.type === 'image' ? cfg[1] + 0.5 : cfg[1] };
      t += cfg[0];
    });
    d.meta = Object.assign({}, d.meta, { animLen: r.l, animStyle: r.s });
    const p = Object.assign(A().newProject(d.width, d.height, (src.name || 'Tasarım') + ' · Video'), { background: d.background, layers: d.layers, meta: d.meta });
    R.normalize(p); A().S.project = p; await A().saveProject(p);
    const old = E();
    A().go('editor', p.id);
    const wait = () => new Promise((res) => { let k = 0; const tick = () => { const ed = E(); if (ed && ed !== old && ed.animDialog && ed.doc.width === p.width && ed.doc.height === p.height) return res(ed); if (++k > 80) return res(null); setTimeout(tick, 100); }; tick(); });
    const ed = await wait(); if (ed) setTimeout(() => ed.animDialog(), 300);
  };

  // ======================================================================
  // 10) SÜRÜM GEÇMİŞİ
  // ======================================================================
  const lastSnap = {};
  async function thumbOf(d) { try { const sc = 420 / Math.max(d.width, d.height); const c = await R.exportCanvas(d, sc, '#ffffff'); return c.toDataURL('image/jpeg', 0.72); } catch (e) { return ''; } }
  P6.snapshot = async function (p, { label = '', auto = false } = {}) {
    p = p || A().S.project; if (!p || !p.id || !p.layers || !p.layers.length) return;
    const design = A().designOf(p);
    const sig = JSON.stringify(design).length + ':' + p.layers.length;
    if (auto && lastSnap[p.id] && lastSnap[p.id].sig === sig) return;
    lastSnap[p.id] = { t: Date.now(), sig };
    await A().api('history/' + p.id, { body: { snapshot: { label, auto, design, thumb: await thumbOf(design) } } }).catch(() => {});
  };
  // kaydetmelerde: 5 dakikada bir otomatik sürüm
  P6.afterSave = function (p) {
    if (!p || !p.id || A().S.route !== 'editor') return;
    const ls = lastSnap[p.id];
    if (!ls) { lastSnap[p.id] = { t: Date.now() - 4 * 60e3, sig: '' }; return P6.snapshot(p, { auto: true, label: 'Açılış' }); }
    if (Date.now() - ls.t > 5 * 60e3) P6.snapshot(p, { auto: true });
  };
  P6.history = async function () {
    const e = E(), p = A().S.project; if (!e || !p || !p.id) return toast('Önce tasarımı kaydet', true);
    let list = await A().api('history/' + p.id).catch(() => []);
    const cur = await thumbOf(A().designOf(p));
    const when = (t) => { const d = new Date(t * 1000), s = Date.now() / 1000 - t; return s < 60 ? 'az önce' : s < 3600 ? Math.floor(s / 60) + ' dk önce' : d.toDateString() === new Date().toDateString() ? 'bugün ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
    await A().dialog(`<div class="d-body"><h3>${icon('clock')} Sürüm geçmişi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Çalışırken 5 dakikada bir kendiliğinden sürüm alınır. Bir sürüme dokun: şimdiki halle yan yana karşılaştır, istersen geri dön.</p>
      <div class="hs-wrap"><div class="hs-list" id="hsL"></div><div class="hs-cmp" id="hsC"><div class="muted" style="padding:40px 10px;text-align:center">Soldan bir sürüm seç</div></div></div></div>
      <div class="d-foot"><button class="btn ghost" id="hsSave" style="margin-right:auto">${icon('plus')}Şimdiki hali sürüm olarak kaydet</button><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const L = $('#hsL', box), C = $('#hsC', box);
        const draw = () => {
          L.innerHTML = list.length ? list.map((v, i) => `<button class="hs-it" data-i="${i}">${v.thumb ? `<img src="${v.thumb}" alt="">` : '<span></span>'}<span><b>${esc(v.label || (v.auto ? 'Otomatik' : 'Sürüm'))}</b><small>${when(v.t)}</small></span></button>`).join('') : '<div class="muted" style="padding:16px">Henüz sürüm yok. Çalıştıkça burada birikir.</div>';
          $$('.hs-it', L).forEach((b) => (b.onclick = () => { $$('.hs-it', L).forEach((x) => x.classList.toggle('on', x === b)); show(list[+b.dataset.i]); }));
        };
        const show = (v) => {
          C.innerHTML = `<div class="hs-two"><figure><figcaption>${esc(v.label || 'Sürüm')} · ${when(v.t)}</figcaption><div class="hs-pic">${R.renderSVG(R.normalize(clone(v.design)), { fit: true, prefix: 'hsv_' })}</div></figure><figure><figcaption>Şimdiki hali</figcaption><div class="hs-pic"><img src="${cur}" alt=""></div></figure></div>
            <div class="iconrow" style="justify-content:flex-end;margin-top:10px"><button class="btn sm" id="hsCopy">${icon('copy')}Ayrı proje olarak aç</button><button class="btn sm primary" id="hsBack">${icon('undo')}Bu sürüme dön</button></div>`;
          $('#hsBack', C).onclick = async () => {
            await P6.snapshot(p, { label: 'Geri dönmeden önce' });
            const dd = R.normalize(clone(v.design));
            const doc = e.doc; doc.background = dd.background; doc.layers = dd.layers; doc.meta = Object.assign({}, doc.meta, dd.meta); if (dd.width !== doc.width || dd.height !== doc.height) { doc.width = dd.width; doc.height = dd.height; }
            await R.ensureDocFonts(doc).catch(() => {}); e.relayout(); e.commit(); close(); toast('Sürüme dönüldü — vazgeçersen Ctrl+Z');
          };
          $('#hsCopy', C).onclick = async () => { const dd = R.normalize(clone(v.design)); const np = Object.assign(A().newProject(dd.width, dd.height, (p.name || 'Tasarım') + ' · eski sürüm'), { background: dd.background, layers: dd.layers, meta: dd.meta }); await A().saveProject(np); close(); A().go('editor', np.id); };
        };
        $('#hsSave', box).onclick = async () => { const n = await A().promptBox('Sürüm adı', 'Müşteriye gönderilen'); if (n == null) return; await P6.snapshot(p, { label: n || 'Sürüm' }); list = await A().api('history/' + p.id).catch(() => list); draw(); toast('Sürüm kaydedildi'); };
        draw();
      },
    });
  };

  // ======================================================================
  // 11) KLASÖR VE ETİKETLER (Pano)
  // ======================================================================
  P6.organize = async function (id, kind) {
    const p = await A().api('projects/' + id); p.meta = p.meta || {};
    const all = await A().api('projects').catch(() => []);
    if (kind === 'folder') {
      const folders = [...new Set(all.map((x) => x.meta && x.meta.folder).filter(Boolean))];
      const v = await A().dialog(`<div class="d-body"><h3>${icon('folder')} Klasöre taşı</h3><div class="chips" style="margin:6px 0 10px">${['', ...folders].map((f) => `<button class="chip${(p.meta.folder || '') === f ? ' on' : ''}" data-f="${esc(f)}">${f ? esc(f) : 'Klasörsüz'}</button>`).join('')}</div>
        <label class="field"><span>Yeni klasör</span><input class="inp" id="fNew" placeholder="Örn. Zeytin Evi · Kasım kampanyası"></label></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="fOk">Taşı</button></div>`, {
        onOpen: (box, close) => { let f = p.meta.folder || ''; $$('[data-f]', box).forEach((b) => (b.onclick = () => { f = b.dataset.f; $$('[data-f]', box).forEach((x) => x.classList.toggle('on', x === b)); })); $('#fOk', box).onclick = () => close({ f: $('#fNew', box).value.trim() || f }); },
      });
      if (!v) return false;
      if (v.f) p.meta.folder = v.f.slice(0, 60); else delete p.meta.folder;
    } else {
      const tags = [...new Set(all.flatMap((x) => (x.meta && x.meta.tags) || []))];
      const v = await A().dialog(`<div class="d-body"><h3>${icon('tag')} Etiketler</h3><p class="muted" style="font-size:13px">Virgülle ayır. Örn. indirim, story, müşteri onayladı</p>
        <input class="inp" id="tgI" value="${esc((p.meta.tags || []).join(', '))}"><div class="chips" style="margin-top:8px">${tags.map((t) => `<button class="chip" data-t="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="tgOk">Kaydet</button></div>`, {
        onOpen: (box, close) => { $$('[data-t]', box).forEach((b) => (b.onclick = () => { const i = $('#tgI', box); const cur = i.value.split(',').map((x) => x.trim()).filter(Boolean); if (!cur.includes(b.dataset.t)) cur.push(b.dataset.t); i.value = cur.join(', '); })); $('#tgOk', box).onclick = () => close($('#tgI', box).value); },
      });
      if (v == null) return false;
      p.meta.tags = [...new Set(v.split(',').map((x) => x.trim().toLocaleLowerCase('tr-TR')).filter(Boolean))].slice(0, 12);
    }
    await A().api('projects', { body: p });
    return true;
  };
  // Pano'daki proje listesine arama + klasör + etiket çubuğu ekler
  P6.mountProjectFilters = function (page, list) {
    const grid = $('#projList', page); if (!grid || !list.length) return;
    const byId = new Map(list.map((p) => [p.id, p]));
    const folders = [...new Set(list.map((p) => p.meta && p.meta.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    const tags = [...new Set(list.flatMap((p) => (p.meta && p.meta.tags) || []))].sort((a, b) => a.localeCompare(b, 'tr'));
    let st = {}; try { st = JSON.parse(sessionStorage.getItem('ts_pf') || '{}'); } catch (e) {}
    const bar = document.createElement('div'); bar.className = 'pf-bar';
    bar.innerHTML = `<label class="pf-q">${icon('search')}<input id="pfQ" placeholder="Tasarımlarda ara" value="${esc(st.q || '')}"></label>
      <div class="chips pf-f"><button class="chip${!st.f ? ' on' : ''}" data-f="">Tümü <small>${list.length}</small></button>${folders.map((f) => `<button class="chip${st.f === f ? ' on' : ''}" data-f="${esc(f)}">${icon('folder')}${esc(f)} <small>${list.filter((p) => p.meta && p.meta.folder === f).length}</small></button>`).join('')}${folders.length ? `<button class="chip${st.f === '-' ? ' on' : ''}" data-f="-">Klasörsüz</button>` : ''}</div>
      ${tags.length ? `<div class="chips pf-t">${tags.map((t) => `<button class="chip sm${(st.t || []).includes(t) ? ' on' : ''}" data-t="${esc(t)}">#${esc(t)}</button>`).join('')}</div>` : ''}`;
    grid.parentNode.insertBefore(bar, grid);
    const apply = () => {
      const q = (st.q || '').toLocaleLowerCase('tr-TR');
      let n = 0;
      $$('.proj', grid).forEach((c) => {
        const p = byId.get(c.dataset.id); if (!p) return;
        const m = p.meta || {}, ok = (!q || (p.name || '').toLocaleLowerCase('tr-TR').includes(q) || (m.tags || []).some((t) => t.includes(q)) || (m.folder || '').toLocaleLowerCase('tr-TR').includes(q))
          && (!st.f || (st.f === '-' ? !m.folder : m.folder === st.f)) && (!(st.t || []).length || st.t.every((t) => (m.tags || []).includes(t)));
        // çok tasarım varsa ilk 48'i göster, gerisi “Daha fazla” ile (pano hızlı açılsın)
        const cap = !q && !st.f && !(st.t || []).length && !st.all;
        c.hidden = !ok || (cap && n >= 48); if (ok) n++;
      });
      let more = $('.pf-more', grid.parentNode);
      const hiddenN = !q && !st.f && !(st.t || []).length && !st.all ? Math.max(0, n - 48) : 0;
      if (hiddenN) { if (!more) { more = document.createElement('button'); more.className = 'btn pf-more'; grid.after(more); more.onclick = () => { st.all = true; apply(); }; } more.textContent = `Daha fazla göster (${hiddenN} tasarım daha)`; more.hidden = false; } else if (more) more.hidden = true;
      try { sessionStorage.setItem('ts_pf', JSON.stringify(st)); } catch (e) {}
      let em = $('.pf-empty', grid); if (!n) { if (!em) { em = document.createElement('div'); em.className = 'panel empty pf-empty'; em.style.gridColumn = '1/-1'; em.innerHTML = '<b>Eşleşen tasarım yok</b>Aramayı ya da filtreyi değiştir.'; grid.appendChild(em); } } else if (em) em.remove();
    };
    $('#pfQ', bar).oninput = (e) => { st.q = e.target.value; apply(); };
    $$('[data-f]', bar).forEach((b) => (b.onclick = () => { st.f = b.dataset.f; $$('[data-f]', bar).forEach((x) => x.classList.toggle('on', x === b)); apply(); }));
    $$('[data-t]', bar).forEach((b) => (b.onclick = () => { st.t = st.t || []; const t = b.dataset.t; st.t = st.t.includes(t) ? st.t.filter((x) => x !== t) : [...st.t, t]; b.classList.toggle('on'); apply(); }));
    // kartlara klasör / etiket rozeti
    $$('.proj', grid).forEach((c) => { const p = byId.get(c.dataset.id), m = (p && p.meta) || {}; if (!m.folder && !(m.tags || []).length) return; const s = document.createElement('div'); s.className = 'pf-badges'; s.innerHTML = (m.folder ? `<span>${icon('folder')}${esc(m.folder)}</span>` : '') + (m.tags || []).slice(0, 3).map((t) => `<span>#${esc(t)}</span>`).join(''); const meta = c.querySelector('.meta div'); if (meta) meta.appendChild(s); });
    apply();
  };

  window.P6 = P6;
})();
