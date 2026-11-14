/* Tasarım Stüdyosu v6.5 — indirmeden önce otomatik kontrol, tek tuşla paylaş, fotoğraf iyileştirme, hareketli story,
   basit mod, açık tema, bağış makbuzu, kurban vekâlet formu */
(function () {
  const P11 = (window.P11 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const r1 = (v) => Math.round(v * 10) / 10;
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const isM = () => matchMedia('(max-width: 820px)').matches;
  const TRM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const trDate = (d) => `${d.getDate()} ${TRM[d.getMonth()]} ${d.getFullYear()}`;
  const brand = () => (A().S && A().S.brand) || {};
  const bcol = (i, d) => ((brand().colors || []).filter(Boolean)[i]) || d;
  const slug = (s) => String(s || 'belge').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-').replace(/^-|-$/g, '') || 'belge';

  // ================================================================ görünüm: tema + basit mod
  const applyTheme = () => {
    const t = LS.get('ts_theme', 'dark');
    const light = t === 'light' || (t === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = light ? '#F6F7F9' : '#14161B';
  };
  P11.basit = () => LS.get('ts_basit', true) && isM();
  const applyBasit = () => document.body && document.body.classList.toggle('basit', !!P11.basit());
  applyTheme(); applyBasit();
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', applyTheme);
  addEventListener('resize', applyBasit);
  P11.setBasit = (on) => { LS.set('ts_basit', !!on); applyBasit(); if (window.Coach && window.Coach.setSimple && isM()) window.Coach.setSimple(!!on); };
  P11.bindSettings = (page) => {
    const t = LS.get('ts_theme', 'dark');
    $$('#lkTheme button', page).forEach((b) => { b.classList.toggle('on', b.dataset.th === t); b.onclick = () => { LS.set('ts_theme', b.dataset.th); applyTheme(); $$('#lkTheme button', page).forEach((x) => x.classList.toggle('on', x === b)); }; });
    const w = $('#lkWeek', page); if (w) { w.checked = LS.get('ts_weekly_auto', true); w.onchange = () => LS.set('ts_weekly_auto', w.checked); }
    [['lkSync', 'sync'], ['lkDon', 'donors'], ['lkHist', 'history']].forEach(([id, fn]) => { const b = $('#' + id, page); if (b) b.onclick = () => window.P12 && window.P12[fn](); });
    const c = $('#lkBasit', page); if (c) { c.checked = LS.get('ts_basit', true); c.onchange = () => { P11.setBasit(c.checked); toast(c.checked ? 'Basit mod açık: telefonda yalnız temel işler görünür' : 'Tüm araçlar açık'); }; }
  };
  // panoda "Tüm araçlar" düğmesi, editörde 4 büyük düğme
  const decorate = () => {
    applyBasit();
    const page = $('#view .page');
    if (!page) return;
    const dash = $('.m-dash', page);
    if (dash && !$('#bsAll', dash)) {
      const b = document.createElement('button'); b.id = 'bsAll'; b.className = 'bs-all';
      b.innerHTML = `${icon('layers')}<span><b>Tüm araçlar</b><small>imsakiye, makbuz, kolaj, broşür ve diğerleri</small></span>${icon('chevR')}`;
      b.onclick = () => { P11.setBasit(false); setTimeout(() => { const h = $('#qtHead'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); };
      dash.appendChild(b);
    }
    const ed = $('.editor', page) || ($('#vp', page) && page);
    if (ed && $('#vp', page) && !$('#bsBar', page)) {
      const bar = document.createElement('div'); bar.id = 'bsBar'; bar.className = 'bs-bar';
      bar.innerHTML = `<button data-b="photo">${icon('image')}<span>Fotoğraf</span></button><button data-b="text">${icon('type')}<span>Yazılar</span></button><button data-b="share" class="pri">${icon('send')}<span>Paylaş</span></button><button data-b="tools">${icon('sliders')}<span>Araçlar</span></button>`;
      bar.onclick = (e) => {
        const b = e.target.closest('[data-b]'); if (!b) return; const api = E(); if (!api) return;
        const k = b.dataset.b;
        if (k === 'photo') api.state.replacePhotoFlow();
        if (k === 'text') api.fillForm();
        if (k === 'share') P11.shareNow(api.doc);
        if (k === 'tools') { P11.setBasit(false); toast('Tüm araçlar açık. Basit moda Ayarlar → Görünüm’den dönebilirsin'); }
      };
      ($('#vp', page).parentElement || page).appendChild(bar);
    }
  };
  addEventListener('hashchange', () => setTimeout(decorate, 350));
  new MutationObserver(() => { clearTimeout(decorate.t); decorate.t = setTimeout(decorate, 120); }).observe(document.documentElement, { childList: true, subtree: true });

  // ================================================================ otomatik kontrol (indirmeden / paylaşmadan önce)
  const words = (l) => R.plain(l.text || '').split(/[^\S  ]+/).filter(Boolean);
  const textBox = (l) => { R.layoutText(l); const lh = l.fontSize * (l.lineHeight || 1.2), n = (l._lines || ['']).length; const w = Math.min(l.w, Math.max(0, ...(l._lines || ['']).map((s) => R.measure(s.replace(/\t/g, ' '), l)))); const x = l.align === 'center' ? l.x + (l.w - w) / 2 : l.align === 'right' ? l.x + l.w - w : l.x; return { x, y: l.y, w, h: n * lh }; };
  P11.quickCheck = async function (d, what) {
    const out = [], W = d.width, H = d.height, mn = Math.min(W, H);
    const ts = d.layers.filter((l) => l.type === 'text' && l.visible !== false && R.plain(l.text || '').trim() && !l.curve);
    for (const l of ts) {
      if (l.rotation && Math.abs(l.rotation) > 2) continue;
      const nm = `“${R.plain(l.text).replace(/\s+/g, ' ').replace(/^[“”"']+/, '').slice(0, 26)}”`;
      const longest = Math.max(0, ...words(l).map((w) => R.measure(l.uppercase ? w.toLocaleUpperCase('tr-TR') : w, l)));
      if (longest > l.w * 1.03 + 2) out.push({ cat: 'Taşma', msg: `${nm} kutusundan taşıyor`, l, fix: () => { R.fitUnbreakable({ layers: [l] }); } });
      const b = textBox(l);
      if (!/^Süs/.test(l.name || '') && (b.x < -2 || b.y < -2 || b.x + b.w > W + 2 || b.y + b.h > H + 2)) out.push({ cat: 'Taşma', msg: `${nm} tasarımın dışına çıkıyor`, l, fix: () => { l.x = r1(Math.max(0, Math.min(l.x, W - l.w))); const bb = textBox(l); if (bb.y + bb.h > H) l.y = r1(Math.max(0, H - bb.h - mn * 0.02)); if (l.y < 0) l.y = 0; } });
      // zemin kutusuna sığmama (aynı gruptaki kutu)
      if (l.group) {
        const bg = d.layers.find((r) => r !== l && r.group === l.group && r.type === 'rect' && r.visible !== false && b.x + b.w / 2 > r.x && b.x + b.w / 2 < r.x + r.w && b.y + b.h / 2 > r.y && b.y + b.h / 2 < r.y + r.h);
        if (bg && (b.x + Math.max(b.w, longest) > bg.x + bg.w + 2 || b.y + b.h > bg.y + bg.h + 2)) out.push({ cat: 'Taşma', msg: `${nm} zemin kutusundan taşıyor`, l, fix: () => { for (let i = 0; i < 20; i++) { const bb = textBox(l), lg = Math.max(0, ...words(l).map((w) => R.measure(w, l))); if (bb.x + Math.max(bb.w, lg) <= bg.x + bg.w && bb.y + bb.h <= bg.y + bg.h) break; l.fontSize = r1(l.fontSize * 0.94); } R.layoutText(l); } });
      }
      if (!/^Süs/.test(l.name || '') && l.fontSize < mn * 0.018) out.push({ cat: 'Okunabilirlik', msg: `${nm} telefonda okunmayacak kadar küçük`, l, fix: () => { l.fontSize = r1(mn * 0.022); R.layoutText(l); R.fitUnbreakable({ layers: [l] }); } });
    }
    // kontrast: yazılar olmadan bir kez çiz, yazı kutusunun zeminini örnekle
    try {
      const k = Math.min(1, 360 / Math.max(W, H));
      const c = await R.exportCanvas(Object.assign({}, d, { layers: d.layers.filter((l) => l.type !== 'text' && l.visible !== false) }), k), cx = c.getContext('2d');
      for (const l of ts) {
        if (/^Süs/.test(l.name || '') || typeof l.fill !== 'string' || (l.shadow && l.shadow.blur) || (l.stroke && +l.strokeWidth > 0) || (l.fx && l.fx.outline && l.fx.outline.width) || (l.bgFill && l.bgFill !== 'none')) continue;
        const b = textBox(l), bx = Math.max(0, Math.floor(b.x * k)), by = Math.max(0, Math.floor(b.y * k)), bw = Math.max(1, Math.min(c.width - bx, Math.ceil(b.w * k))), bh = Math.max(1, Math.min(c.height - by, Math.ceil(b.h * k)));
        if (bw < 2 || bh < 2) continue;
        const px = cx.getImageData(bx, by, bw, bh).data; let r = 0, g = 0, bb = 0, n = 0; for (let i = 0; i < px.length; i += 8) { r += px[i]; g += px[i + 1]; bb += px[i + 2]; n++; }
        const bgc = '#' + [r, g, bb].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
        const fg = R.parseColor(l.fill).hex, cr = window.Tools.contrast(fg, bgc), big = l.fontSize >= Math.min(W, H) * 0.05;
        if (cr < (big ? 2.2 : 3)) out.push({ cat: 'Okunabilirlik', msg: `“${R.plain(l.text).replace(/\s+/g, ' ').replace(/^[“”"']+/, '').slice(0, 26)}” zeminden ayrışmıyor, okunmuyor`, l, fix: () => { const lum = window.Tools.contrast(bgc, '#000000') > window.Tools.contrast(bgc, '#FFFFFF'); l.fill = lum ? '#14161B' : '#FFFFFF'; if (window.Tools.contrast(l.fill, bgc) < 3) l.shadow = { x: 0, y: r1(l.fontSize * 0.04), blur: r1(l.fontSize * 0.25), color: lum ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }; } });
      }
    } catch (e) {}
    // bulanık fotoğraf
    if (what !== 'Paylaş' && window.P9 && window.P9.qualityIssues) window.P9.qualityIssues(d).forEach((q) => out.push({ cat: 'Fotoğraf', msg: q.msg, l: q.l, fix: null }));
    return out;
  };
  // sorun varsa sor; true → devam
  P11.gate = async function (d, what = 'İndir') {
    if (LS.get('ts_check_off', false)) return true;
    let iss = [];
    try { iss = await P11.quickCheck(d, what); } catch (e) { return true; }
    const fixable = iss.filter((x) => x.fix);
    // yalnız bilgi (ör. örnek fotoğrafın baskı çözünürlüğü) varsa her indirmede sormasın
    if (!fixable.length) return true;
    const res = await A().dialog(`<div class="d-body"><h3>${icon('shield')} ${what} öncesi kontrol</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">${iss.length} şey dikkatimi çekti. ${fixable.length ? 'Düzeltilebilenleri tek dokunuşla düzeltebilirim.' : ''}</p>
      <div class="qc-list">${iss.slice(0, 8).map((x) => `<div class="qc-it"><i class="qc-${x.fix ? 'fix' : 'info'}"></i><div><b>${esc(x.cat)}</b><span>${esc(x.msg)}</span></div></div>`).join('')}${iss.length > 8 ? `<div class="muted" style="font-size:12px">+${iss.length - 8} daha</div>` : ''}</div>
      <label class="chk" style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:12.5px"><input type="checkbox" id="qcOff"> Bir daha sorma</label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="qcSkip">Yine de ${what.toLocaleLowerCase('tr-TR')}</button>${fixable.length ? `<button class="btn primary" id="qcFix">${icon('sparkle')}Düzelt ve ${what.toLocaleLowerCase('tr-TR')}</button>` : ''}</div>`, {
      onOpen: (box, close) => {
        const off = () => { if ($('#qcOff', box).checked) LS.set('ts_check_off', true); };
        $('#qcSkip', box).onclick = () => { off(); close('skip'); };
        const f = $('#qcFix', box); if (f) f.onclick = () => { off(); close('fix'); };
      },
    });
    if (res === 'fix') {
      fixable.forEach((x) => { try { x.fix(); } catch (e) {} });
      d.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
      if (E() && E().doc === d) E().commit();
      toast(`${fixable.length} sorun düzeltildi`);
      return true;
    }
    return res === 'skip';
  };
  // paylaşım ve indirme kontrolden geçsin
  const hook = () => {
    const F = window.Features; if (!F || F._p11) return; F._p11 = true;
    const ex = F.exportDialog, sh = F.share;
    F.exportDialog = async function (d) { if (!(await P11.gate(d, 'İndir'))) return; return ex.apply(this, arguments); };
    P11.shareNow = async function (d, btn) { d = d || (E() && E().doc); if (!d) return toast('Önce bir tasarım aç', true); if (E()) E().flush(); if (!(await P11.gate(d, 'Paylaş'))) return; return sh.call(F, d, btn); };
  };
  P11.shareNow = async (d, btn) => { hook(); return P11.shareNow(d, btn); };
  setTimeout(hook, 0);

  // ================================================================ fotoğraf iyileştirme (tek dokunuş)
  const stats = (src) => new Promise((res) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => {
      try {
        const k = Math.min(1, 160 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
        const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
        const p = x.getImageData(0, 0, c.width, c.height).data; let n = 0, sum = 0, sq = 0, sat = 0, rr = 0, bb = 0;
        for (let i = 0; i < p.length; i += 4) { if (p[i + 3] < 128) continue; const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255; const L = 0.2126 * r + 0.7152 * g + 0.0722 * b; const mx = Math.max(r, g, b), mi = Math.min(r, g, b); sum += L; sq += L * L; sat += mx ? (mx - mi) / mx : 0; rr += r; bb += b; n++; }
        if (!n) return res(null);
        const mean = sum / n; res({ mean, std: Math.sqrt(Math.max(0, sq / n - mean * mean)), sat: sat / n, warm: (rr - bb) / n });
      } catch (e) { res(null); }
    };
    im.onerror = () => res(null); im.src = src;
  });
  P11.enhancePhotos = async function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d = api.doc, sel = (api.state.sel || []).map((id) => d.layers.find((l) => l.id === id)).filter((l) => l && l.type === 'image');
    const ims = (sel.length ? sel : d.layers.filter((l) => l.type === 'image' && l.visible !== false && l.src && !/^data:image\/svg/.test(l.src) && !/^Süs/.test(l.name || '') && l.w * l.h > d.width * d.height * 0.04));
    if (!ims.length) return toast('İyileştirilecek fotoğraf bulunamadı');
    let n = 0;
    for (const l of ims) {
      const s = await stats(l.src); if (!s) continue;
      const f = l.filters = Object.assign({}, l.filters || {});
      f.brightness = Math.round(Math.max(90, Math.min(132, 100 * Math.pow(0.5 / Math.max(0.12, s.mean), 0.45))));
      f.contrast = Math.round(Math.max(98, Math.min(128, 100 * Math.pow(0.21 / Math.max(0.06, s.std), 0.35))));
      f.saturate = Math.round(Math.max(100, Math.min(130, 100 * Math.pow(0.32 / Math.max(0.08, s.sat), 0.3))));
      f.vibrance = 12; f.sharpen = Math.max(+f.sharpen || 0, 25);
      if (s.mean < 0.35) f.shadows = 18;
      if (s.warm < -0.04) f.warmth = 8;
      n++;
    }
    api.commit();
    toast(n ? `${n} fotoğraf iyileştirildi (ışık, netlik, renk). Beğenmezsen Geri al.` : 'Fotoğraflar okunamadı', !n);
  };

  // ================================================================ hareketli story (5 sn)
  P11.motionStory = async function () {
    let p = E() ? A().S.project : null;
    if (!p) {
      // panodan açıldıysa: hangi tasarım olsun?
      const list = (await A().api('projects').catch(() => [])).slice(0, 12);
      if (!list.length) return toast('Önce bir tasarım hazırla', true);
      const id = await A().dialog(`<div class="d-body"><h3>${icon('play')} Hangi tasarım hareketlensin?</h3><div class="ps-grid">${list.map((x) => `<button class="ps-it" data-id="${x.id}"><span class="ps-th">${x.thumb ? `<img alt="" src="${x.thumb}" style="width:100%;height:100%;object-fit:contain">` : ''}</span><small>${esc(x.name || 'Tasarım')}</small></button>`).join('')}</div></div><div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, { cls: 'wide', onOpen: (box, close) => $$('[data-id]', box).forEach((b) => (b.onclick = () => close(b.dataset.id))) });
      if (!id) return;
      try { p = await A().api('projects/' + id); } catch (e) { return toast(e.message, true); }
    }
    if (window.P8 && window.P8.storyVideo) { p.meta = p.meta || {}; p.meta.animLen = 5; return window.P8.storyVideo(p); }
    return E().anim();
  };

  // ================================================================ belge yardımcıları
  const T = (name, text, x, y, w, fs, o = {}) => Object.assign({ type: 'text', name, text: String(text), x: r1(x), y: r1(y), w: r1(w), h: r1(fs * 1.25), fontSize: Math.round(fs), fontFamily: 'Poppins', fontWeight: 500, fill: '#1F2937', align: 'left', lineHeight: 1.25 }, o);
  const Rc = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fill, radius: 0 }, o);
  const Im = (name, src, x, y, w, h, o = {}) => Object.assign({ type: 'image', name, src, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fit: 'contain', filters: {} }, o);
  const docOf = (W, H, layers) => { const d = R.normalize({ width: W, height: H, background: { type: 'solid', color: '#FFFFFF' }, layers }); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; };
  const busy = (t) => { const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = `<i class="b"></i><span>${esc(t)}</span>`; const box = $('#toasts'); if (box) box.appendChild(el); return { set: (s) => { const sp = $('span', el); if (sp) sp.textContent = s; }, done: () => el.remove() }; };
  async function pdfOf(docs, name, onStep) {
    const pages = [];
    for (let i = 0; i < docs.length; i++) { onStep && onStep(i); await R.ensureImageSizes(docs[i]).catch(() => {}); const b = await R.exportBlob(docs[i], 'jpg', 1); const im = await createImageBitmap(b); pages.push({ blob: b, w: im.width, h: im.height }); }
    const pdf = await window.P9.pdfFromJpegs(pages); R.download(pdf, slug(name) + '.pdf');
  }
  const parseRows = (txt) => txt.split('\n').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s*[;|\t]\s*/));
  const money = (v, cur) => { const n = parseFloat(String(v || '').replace(/\./g, '').replace(',', '.')); if (!isFinite(n)) return String(v || ''); return n.toLocaleString('tr-TR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + cur; };
  const header = (L, W, M, c1, c2, title, sub) => {
    const b = brand();
    if (b.logo) L.push(Im('Logo', b.logo, M, M * 0.8, 120, 120));
    L.push(T('Kurum', b.name || 'Kurum adı', M + (b.logo ? 140 : 0), M * 0.9, W * 0.5, 34, { fontWeight: 700, fill: c1, fontFamily: 'Montserrat' }));
    L.push(T('Kurum iletişim', [b.phone, b.web || b.email, b.address].filter(Boolean).join('  ·  ') || 'Telefon · web · adres', M + (b.logo ? 140 : 0), M * 0.9 + 48, W * 0.55, 18, { fill: '#6B7280' }));
    L.push(T('Belge başlığı', title, W * 0.55, M * 0.9, W * 0.45 - M, 40, { fill: c1, align: 'right', fontFamily: 'DM Serif Display', fontWeight: 400 }));
    if (sub) L.push(T('Belge no', sub, W * 0.55, M * 0.9 + 56, W * 0.45 - M, 20, { fill: '#374151', align: 'right', fontWeight: 600 }));
    L.push(Rc('Üst çizgi', M, M * 0.9 + 100, W - 2 * M, 4, c2));
  };
  const row = (L, x, y, w, k, v, c1) => { L.push(T('Etiket · ' + k, k, x, y, w * 0.32, 22, { fill: '#6B7280', fontWeight: 600 })); L.push(T(k, v || '..............................', x + w * 0.34, y, w * 0.66, 24, { fill: '#111827', fontWeight: 600 })); L.push(Rc('Süs · satır çizgisi', x, y + 40, w, 1.5, '#E5E7EB')); };

  // ================================================================ bağış makbuzu
  P11.receiptDoc = function (o) {
    const W = 1754, H = 1240, M = 90, c1 = bcol(0, '#14532D'), c2 = bcol(1, '#C9A227'), L = [];
    L.push(Rc('Süs · kenar', 24, 24, W - 48, H - 48, 'rgba(0,0,0,0)', { stroke: c1, strokeWidth: 3, radius: 18 }));
    header(L, W, M, c1, c2, 'BAĞIŞ MAKBUZU', `No: ${o.no}   ·   ${o.date}`);
    let y = M * 0.9 + 150;
    L.push(T('Teşekkür', o.intro || 'Aşağıda bilgileri yazılı bağış teşekkürle alınmıştır.', M, y, W - 2 * M, 24, { fill: '#374151' })); y += 70;
    [['Bağışçı', o.name], ['Bağış türü', o.kind], ['Açıklama', o.note], ['Ödeme şekli', o.pay]].forEach(([k, v]) => { row(L, M, y, W * 0.56, k, v, c1); y += 70; });
    // tutar kutusu
    L.push(Rc('Tutar zemini', W * 0.64, M * 0.9 + 150 + 70, W * 0.36 - M, 220, c1, { radius: 18 }));
    L.push(T('Tutar etiketi', 'TUTAR', W * 0.64, M * 0.9 + 150 + 100, W * 0.36 - M, 22, { fill: c2, align: 'center', fontWeight: 700, letterSpacing: 3 }));
    L.push(T('Tutar', o.amount || '…', W * 0.64 + 20, M * 0.9 + 150 + 140, W * 0.36 - M - 40, 64, { fill: '#FFFFFF', align: 'center', fontWeight: 700, fontFamily: 'Montserrat' }));
    L.push(T('Tutar yazıyla', o.words || '', W * 0.64 + 20, M * 0.9 + 150 + 230, W * 0.36 - M - 40, 18, { fill: 'rgba(255,255,255,0.85)', align: 'center' }));
    y = Math.max(y, M * 0.9 + 150 + 320) + 40;
    L.push(T('Dua', o.dua || 'Allah kabul etsin, hayrınızı çoğaltsın.', M, y, W - 2 * M, 28, { fill: c1, fontFamily: 'DM Serif Display', fontWeight: 400, align: 'center' }));
    const sy = H - M - 120;
    [['Teslim eden', o.name], ['Teslim alan', o.by || brand().name || '']].forEach(([k, v], i) => { const x = i ? W - M - 520 : M; L.push(Rc('Süs · imza çizgisi', x, sy + 70, 520, 2, '#9CA3AF')); L.push(T('İmza · ' + k, `${k}${v ? '\n' + v : ''}`, x, sy + 82, 520, 20, { fill: '#4B5563', align: 'center' })); });
    L.push(T('Not', 'Bu makbuz bağışınızın kaydı içindir.', M, H - 70, W - 2 * M, 16, { fill: '#9CA3AF', align: 'center' }));
    return docOf(W, H, L);
  };
  P11.receipts = async function (preset) {
    const today = trDate(new Date());
    const res = await A().dialog(`<div class="d-body"><h3>${icon('file')} Bağış makbuzu</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Her satıra bir bağışçı: <b>Ad Soyad ; tutar ; açıklama</b>. Excel’den sütunları kopyalayıp yapıştırabilirsin. Herkese ayrı, sıra numaralı makbuz tek PDF olarak iner.</p>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field" style="grid-column:1/-1"><span>Bağışçılar</span><textarea class="inp" id="mkL" rows="5" placeholder="Ahmet Yılmaz ; 1500 ; Kurban hissesi&#10;Ayşe Demir ; 250 ; Ramazan kolisi"></textarea></label>
        <label class="field"><span>Bağış türü</span><input class="inp" id="mkK" value="Kurban hissesi"></label>
        <label class="field"><span>Para birimi</span><input class="inp" id="mkC" value="${esc(LS.get('ts_mk_cur', 'TL'))}"></label>
        <label class="field"><span>İlk makbuz no</span><input class="inp" id="mkN" value="${LS.get('ts_mk_no', 1)}" inputmode="numeric"></label>
        <label class="field"><span>Tarih</span><input class="inp" id="mkD" value="${esc(today)}"></label>
        <label class="field" style="grid-column:1/-1"><span>Ödeme şekli</span><input class="inp" id="mkP" value="Nakit"></label></div>
        <div class="kit-pv"><div class="kit-th" id="mkV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="mkE">Tek makbuzu editörde aç</button><button class="btn primary" id="mkGo">${icon('download')}Makbuzları PDF indir</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const list = () => { const cur = $('#mkC', box).value.trim() || 'TL', n0 = parseInt($('#mkN', box).value, 10) || 1; const rows = parseRows($('#mkL', box).value); return (rows.length ? rows : [['Ad Soyad', '', '']]).map((r, i) => ({ name: r[0], amount: r[1] ? money(r[1], cur) : '', note: r[2] || '', kind: $('#mkK', box).value, pay: $('#mkP', box).value, date: $('#mkD', box).value, no: String(n0 + i).padStart(4, '0') })); };
        const pv = () => { $('#mkV', box).innerHTML = R.renderSVG(P11.receiptDoc(list()[0]), { fit: true, prefix: 'mk' + Math.random().toString(36).slice(2, 5) }); };
        if (preset && preset.list) $('#mkL', box).value = preset.list;
        $$('input,textarea', box).forEach((x) => (x.oninput = pv)); pv();
        $('#mkGo', box).onclick = () => close({ go: 'pdf', items: list(), cur: $('#mkC', box).value });
        $('#mkE', box).onclick = () => close({ go: 'edit', items: list() });
      },
    });
    if (!res) return;
    if (res.go === 'edit') { const d = P11.receiptDoc(res.items[0]); return window.P10.makeDoc(d.width, d.height, 'Bağış makbuzu · ' + res.items[0].name, d.layers, d.background, { folder: 'Makbuzlar' }, true); }
    LS.set('ts_mk_cur', res.cur || 'TL'); LS.set('ts_mk_no', (parseInt(res.items[res.items.length - 1].no, 10) || 0) + 1);
    const b = busy('Makbuzlar hazırlanıyor…');
    try { await pdfOf(res.items.map(P11.receiptDoc), 'bagis-makbuzlari-' + res.items[0].no, (i) => b.set(`Makbuz ${i + 1} / ${res.items.length}`)); toast(`${res.items.length} makbuz tek PDF olarak indirildi. Sıradaki no: ${LS.get('ts_mk_no', 1)}`); }
    catch (e) { toast('Makbuz hazırlanamadı: ' + e.message, true); }
    finally { b.done(); }
  };

  // ================================================================ kurban vekâlet formu
  P11.proxyDoc = function (o) {
    const W = 1240, H = 1754, M = 100, c1 = bcol(0, '#14532D'), c2 = bcol(1, '#C9A227'), L = [];
    header(L, W, M, c1, c2, 'KURBAN VEKÂLETİ', `${o.year || new Date().getFullYear()} · ${o.kind || 'Hisse'}`);
    let y = M * 0.9 + 160;
    const text = o.text || `Ben ${o.name || '........................'}, ${o.year || new Date().getFullYear()} yılı Kurban Bayramında, ${o.kind ? o.kind.toLocaleLowerCase('tr-TR') + ' olarak ' : ''}adıma kurban kesilmesi, etinin ihtiyaç sahiplerine ulaştırılması ve bu iş için gereken her türlü işlemin yapılması hususunda ${brand().name || 'kurumu'} vekil tayin ettim. Kurbanımın kesimi sırasında niyet ve tekbirin vekilim tarafından yapılmasını kabul ediyorum.`;
    L.push(T('Vekâlet metni', text, M, y, W - 2 * M, 27, { lineHeight: 1.6, fill: '#1F2937' }));
    y += 330;
    [['Vekâlet veren', o.name], ['Telefon', o.phone], ['Hisse / tür', o.kind], ['Hisse no', o.share], ['Bedel', o.amount], ['Kesim yeri', o.place], ['Tarih', o.date]].forEach(([k, v]) => { row(L, M, y, W - 2 * M, k, v, c1); y += 66; });
    y += 30;
    L.push(Rc('Süs · not zemini', M, y, W - 2 * M, 120, 'rgba(201,162,39,0.10)', { radius: 14 }));
    L.push(T('Not', o.note || 'Kurbanınız kesildiğinde size haber verilecek; isterseniz kesim videosu gönderilir.', M + 24, y + 26, W - 2 * M - 48, 22, { fill: '#4B5563', lineHeight: 1.45 }));
    const sy = H - M - 130;
    [['Vekâlet veren', o.name], ['Vekil (kurum adına)', brand().name || '']].forEach(([k, v], i) => { const x = i ? W - M - 440 : M; L.push(Rc('Süs · imza çizgisi', x, sy + 70, 440, 2, '#9CA3AF')); L.push(T('İmza · ' + k, `${k}${v ? '\n' + v : ''}`, x, sy + 82, 440, 20, { fill: '#4B5563', align: 'center' })); });
    return docOf(W, H, L);
  };
  P11.proxyForm = async function (preset) {
    const y = new Date().getFullYear();
    const res = await A().dialog(`<div class="d-body"><h3>${icon('file')} Kurban vekâlet formu</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Her satıra bir hissedar: <b>Ad Soyad ; telefon ; hisse no ; bedel</b>. Boş bırakırsan doldurulacak boş form çıkar. Hepsi tek PDF olarak iner.</p>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field" style="grid-column:1/-1"><span>Hissedarlar</span><textarea class="inp" id="vkL" rows="5" placeholder="Mehmet Kaya ; 0555 111 22 33 ; 3/7 ; 3250 TL&#10;Fatma Şahin ; ; 4/7 ; 3250 TL"></textarea></label>
        <label class="field"><span>Kurban türü</span><select class="inp" id="vkK"><option>Büyükbaş hisse</option><option>Küçükbaş</option><option>Adak kurbanı</option><option>Akika kurbanı</option><option>Şükür kurbanı</option><option>Nafile kurban</option></select></label>
        <label class="field"><span>Yıl</span><input class="inp" id="vkY" value="${y}"></label>
        <label class="field" style="grid-column:1/-1"><span>Kesim yeri</span><input class="inp" id="vkP" placeholder="ör. Afrika · Haiti · Türkiye"></label></div>
        <div class="kit-pv"><div class="kit-th" id="vkV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="vkE">Editörde aç</button><button class="btn primary" id="vkGo">${icon('download')}Formları PDF indir</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const list = () => { const rows = parseRows($('#vkL', box).value); return (rows.length ? rows : [['', '', '', '']]).map((r) => ({ name: r[0], phone: r[1], share: r[2], amount: r[3], kind: $('#vkK', box).value, year: $('#vkY', box).value, place: $('#vkP', box).value, date: trDate(new Date()) })); };
        const pv = () => { $('#vkV', box).innerHTML = R.renderSVG(P11.proxyDoc(list()[0]), { fit: true, prefix: 'vk' + Math.random().toString(36).slice(2, 5) }); };
        if (preset) { if (preset.list) $('#vkL', box).value = preset.list; if (preset.place) $('#vkP', box).value = preset.place; }
        $$('input,textarea,select', box).forEach((x) => (x.oninput = x.onchange = pv)); pv();
        $('#vkGo', box).onclick = () => close({ go: 'pdf', items: list() });
        $('#vkE', box).onclick = () => close({ go: 'edit', items: list() });
      },
    });
    if (!res) return;
    if (res.go === 'edit') { const d = P11.proxyDoc(res.items[0]); return window.P10.makeDoc(d.width, d.height, 'Kurban vekâleti · ' + (res.items[0].name || 'boş form'), d.layers, d.background, { folder: 'Vekâletler' }, true); }
    const b = busy('Formlar hazırlanıyor…');
    try { await pdfOf(res.items.map(P11.proxyDoc), 'kurban-vekalet-formlari', (i) => b.set(`Form ${i + 1} / ${res.items.length}`)); toast(`${res.items.length} vekâlet formu tek PDF olarak indirildi`); }
    catch (e) { toast('Form hazırlanamadı: ' + e.message, true); }
    finally { b.done(); }
  };
})();
