/* Tasarım Stüdyosu v6.3 — vakit tablosu (kullanıcının verdiği saatler, ör. Fazilet Takvimi), imsakiye, namaz vakti kartı,
   hicri duvar takvimi, mübarek gün düzeltme, Ramazan günlük serisi, kandil/bayram tebrik kartı, faaliyet raporu (PDF),
   grafik/infografik, önce-sonra, bağışçı duvarı, kolaj, kurumsal kimlik paketi, Instagram ızgara önizlemesi,
   GIF, içerik planlayıcı, erişilebilirlik kontrolü */
(function () {
  const P10 = (window.P10 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi, TH = () => window.FoodTheme;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const r1 = (v) => Math.round(v * 10) / 10;
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const D = (s) => new Date(s + 'T12:00:00');
  const TRM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const TRD = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const TRS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const trDate = (d) => `${d.getDate()} ${TRM[d.getMonth()]} ${d.getFullYear()}`;
  const slug = (s) => String(s || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-').replace(/^-|-$/g, '') || 'tasarim';
  const blobToDataURL = (b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
  const brand = () => (A().S && A().S.brand) || {};
  const bcol = (i, d) => ((brand().colors || []).filter(Boolean)[i]) || d;
  const isAdmin = () => !window.Users || window.Users.isAdmin();
  const hijri = (s) => (window.P7 && window.P7.hijriLabel ? window.P7.hijriLabel(s) : '');
  async function uploadData(dataUrl, name) { try { const r = await A().api('upload', { body: { data: dataUrl, name } }); return r.url; } catch (e) { return dataUrl; } }
  const pickImages = (multi = true) => new Promise((res) => A().pickFiles(async (files) => { const out = []; for (const f of files) if (/^image\//.test(f.type)) { try { const r = await A().uploadFile(f); out.push(r.url); } catch (e) { out.push(await blobToDataURL(f)); } } res(out); }, multi));

  // ---- katman yardımcıları
  const T = (name, text, x, y, w, fs, o = {}) => Object.assign({ type: 'text', name, text: String(text), x: r1(x), y: r1(y), w: r1(w), h: r1(fs * (o.lineHeight || 1.2) * (String(text).split('\n').length)), fontSize: Math.round(fs), fontFamily: 'Poppins', fontWeight: 500, fill: '#1B2A4A', align: 'left', lineHeight: 1.2 }, o);
  const Rc = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fill, radius: 0 }, o);
  const Im = (name, src, x, y, w, h, o = {}) => Object.assign({ type: 'image', name, src, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fit: 'cover', filters: {} }, o);
  const Pth = (name, d, x, y, w, h, fill, o = {}) => Object.assign({ type: 'path', name, d, vw: 100, vh: 100, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fill }, o);
  const PH = (() => { let u = null; return () => u || (u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#E7E3DC"/><g fill="none" stroke="#A39E95" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"><rect x="250" y="270" width="300" height="230" rx="24"/><circle cx="340" cy="350" r="28"/><path d="M262 480L370 400L440 450L480 420L540 470"/></g><text x="400" y="590" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#8A857C">Fotoğraf ekle</text></svg>')); })();
  P10.placeholder = PH;
  // proje yap, kaydet; aç (isteğe bağlı)
  P10.makeDoc = async function (W, H, name, layers, bg = { type: 'solid', color: '#FFFFFF' }, meta = {}, open = false) {
    const p = Object.assign(A().newProject(W, H, name), { background: bg, layers, meta });
    R.normalize(p); p.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
    await R.ensureImageSizes(p).catch(() => {});
    try { p.thumb = await R.thumbnail(p); } catch (e) {}
    await A().saveProject(p);
    if (open) { A().S.project = p; A().go('editor', p.id); }
    return p;
  };
  const docOf = (W, H, layers, bg) => { const d = R.normalize({ width: W, height: H, background: bg || { type: 'solid', color: '#FFFFFF' }, layers }); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; };
  const jpgOf = async (d, scale = 1) => { await R.ensureImageSizes(d).catch(() => {}); const b = await R.exportBlob(d, 'jpg', scale); const im = await createImageBitmap(b); return { blob: b, w: im.width, h: im.height }; };
  const busy = (t) => { const p = document.createElement('div'); p.className = 'tk-prog'; p.textContent = t; document.body.appendChild(p); return p; };
  // metni kutuya sığdır (yazı küçülür)
  const fit = (l, maxH, minFs = 10) => { R.layoutText(l); for (let i = 0; i < 40 && l._lines && l._lines.length * l.fontSize * l.lineHeight > maxH && l.fontSize > minFs; i++) { l.fontSize = Math.max(minFs, Math.round(l.fontSize * 0.94)); R.layoutText(l); } l.h = r1(Math.max(l.h, (l._lines || ['']).length * l.fontSize * l.lineHeight)); return l; };

  // ================================================================ VAKİT TABLOSU (saatleri kullanıcı verir: ör. Fazilet Takvimi)
  const VK = ['İmsak', 'Sabah', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
  const KEYW = { imsak: 'İmsak', sahur: 'İmsak', sabah: 'Sabah', fecir: 'Sabah', 'güneş': 'Güneş', gunes: 'Güneş', 'öğle': 'Öğle', ogle: 'Öğle', 'ikindi': 'İkindi', 'akşam': 'Akşam', aksam: 'Akşam', iftar: 'Akşam', 'yatsı': 'Yatsı', yatsi: 'Yatsı' };
  const MON = { ocak: 1, 'şubat': 2, subat: 2, mart: 3, nisan: 4, 'mayıs': 5, mayis: 5, haziran: 6, temmuz: 7, 'ağustos': 8, agustos: 8, 'eylül': 9, eylul: 9, ekim: 10, 'kasım': 11, kasim: 11, 'aralık': 12, aralik: 12 };
  P10.parseVakit = function (text, yearHint) {
    const lines = String(text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    let cols = null; const rows = []; let lastDate = null;
    const y0 = yearHint || new Date().getFullYear();
    for (const raw of lines) {
      const low = raw.toLocaleLowerCase('tr-TR');
      const hk = Object.keys(KEYW).filter((k) => low.includes(k));
      const times = [...raw.replace(/\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g, ' ').matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map((m) => m[1].padStart(2, '0') + ':' + m[2]);
      if (hk.length >= 3 && times.length < 3) { // başlık satırı: sütun sırası
        const pos = []; Object.keys(KEYW).forEach((k) => { let i = low.indexOf(k); while (i >= 0) { pos.push([i, KEYW[k]]); i = low.indexOf(k, i + 1); } });
        cols = [...new Map(pos.sort((a, b) => a[0] - b[0]).map((p) => [p[1], p])).keys()];
        continue;
      }
      if (times.length < 2) continue;
      let date = null, m;
      if ((m = raw.match(/\b(\d{4})-(\d{2})-(\d{2})\b/))) date = `${m[1]}-${m[2]}-${m[3]}`;
      else if ((m = raw.match(/\b(\d{1,2})[./](\d{1,2})[./](\d{2,4})\b/))) date = `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      else if ((m = low.match(/\b(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s+(\d{4}))?/))) date = `${m[3] || y0}-${String(MON[m[2]]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      else if (lastDate) { const d = D(lastDate); d.setDate(d.getDate() + 1); date = ymd(d); }
      if (!date) continue;
      lastDate = date;
      const names = cols && cols.length === times.length ? cols : times.length === 7 ? VK : times.length === 6 ? ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'] : times.length === 5 ? ['İmsak', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'] : times.length === 2 ? ['İmsak', 'Akşam'] : VK.slice(0, times.length);
      const t = {}; names.forEach((n, i) => (t[n] = times[i]));
      rows.push({ date, t });
    }
    return rows;
  };
  P10.vakit = () => LS.get('ts_vakit', { city: '', source: 'Fazilet Takvimi', rows: [] });
  P10.vakitRow = (date) => (P10.vakit().rows || []).find((r) => r.date === date);
  P10.vakitDialog = function () {
    const v = P10.vakit();
    return A().dialog(`<div class="d-body"><h3>${icon('clock') || icon('calendar')} Vakit tablosu</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Namaz vakitlerini kendi kaynağından (ör. <b>Fazilet Takvimi</b>) kopyalayıp yapıştır ya da Excel / CSV yükle. Uygulama saat hesaplamaz; senin verdiğin saatleri aynen kullanır. Bir kez girmen yeter: imsakiye, namaz vakti kartı ve Ramazan serisi buradan alır.</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Şehir</span><input class="inp" id="vkC" value="${esc(v.city || '')}" placeholder="ör. İstanbul"></label><label class="field"><span>Kaynak (tasarımda yazar)</span><input class="inp" id="vkS" value="${esc(v.source || 'Fazilet Takvimi')}"></label></div>
      <label class="field"><span>Vakitler (her satıra bir gün: tarih ve saatler)</span><textarea class="inp" id="vkT" rows="9" placeholder="Tarih        İmsak  Güneş  Öğle   İkindi  Akşam  Yatsı&#10;19.02.2026   05:41  07:05  12:21  15:20   17:27  18:46&#10;20.02.2026   05:40  07:04  12:21  15:21   17:28  18:47"></textarea></label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn sm" id="vkF">${icon('upload')}Excel / CSV yükle</button><small class="muted" id="vkN">${(v.rows || []).length ? `Kayıtlı: ${v.rows.length} gün (${v.rows[0].date.split('-').reverse().join('.')} – ${v.rows[v.rows.length - 1].date.split('-').reverse().join('.')})` : 'Henüz vakit girilmedi'}</small></div>
      <div class="vk-pv" id="vkP"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="vkOk">${icon('check')}Kaydet</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let rows = [];
        const pv = () => {
          rows = P10.parseVakit($('#vkT', box).value);
          if (!rows.length) { $('#vkP', box).innerHTML = ''; return; }
          const cols = [...new Set(rows.flatMap((r) => Object.keys(r.t)))].sort((a, b) => VK.indexOf(a) - VK.indexOf(b));
          $('#vkP', box).innerHTML = `<p class="muted" style="font-size:12px;margin:8px 0 4px">${rows.length} gün okundu. İlk satırlar:</p><table class="vk-tb"><tr><th>Tarih</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>${rows.slice(0, 4).map((r) => `<tr><td>${r.date.split('-').reverse().join('.')}</td>${cols.map((c) => `<td>${r.t[c] || '—'}</td>`).join('')}</tr>`).join('')}</table>`;
        };
        $('#vkT', box).oninput = pv;
        $('#vkF', box).onclick = () => A().pickFiles(async (files) => {
          const f = files[0]; if (!f) return;
          try { const t = await A().api('parse-table', { body: { name: f.name, data: await blobToDataURL(f) } }); $('#vkT', box).value = [t.columns.join('\t'), ...t.rows.map((r) => t.columns.map((c) => (r[c] == null ? '' : String(r[c]))).join('\t'))].join('\n'); pv(); }
          catch (e) { toast('Dosya okunamadı: ' + e.message, true); }
        }, false);
        $('#vkOk', box).onclick = () => {
          const old = P10.vakit();
          const map = new Map((old.rows || []).map((r) => [r.date, r]));
          rows.forEach((r) => map.set(r.date, r));
          const all = [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
          LS.set('ts_vakit', { city: $('#vkC', box).value.trim(), source: $('#vkS', box).value.trim(), rows: all });
          close(true); toast(rows.length ? `${rows.length} günün vakti kaydedildi` : 'Kaydedildi');
        };
      },
    });
  };
  const needVakit = async () => { if ((P10.vakit().rows || []).length) return true; toast('Önce vakitleri gir (Fazilet takviminden yapıştır)'); const ok = await P10.vakitDialog(); return ok && (P10.vakit().rows || []).length > 0; };

  // ================================================================ MÜBAREK GÜNLERİ DÜZELT (kendi takvimine göre)
  const evKey = (y, n) => y + '|' + n;
  (function patchEvents() {
    const P7 = window.P7; if (!P7 || !P7.hijriEvents || P7._ovr) return; P7._ovr = true;
    const base = P7.hijriEvents;
    P7.hijriEvents = function (y) { const ov = LS.get('ts_hijri_over', {}); return base(y).map((e) => { const k = evKey(y, e.name); return ov[k] ? Object.assign({}, e, { date: ov[k], fixed: true }) : e; }).sort((a, b) => (a.date < b.date ? -1 : 1)); };
  })();
  P10.daysDialog = function () {
    const y0 = new Date().getFullYear();
    const evs = [...window.P7.hijriEvents(y0), ...window.P7.hijriEvents(y0 + 1)].filter((e) => e.date >= ymd(new Date(Date.now() - 30 * 864e5))).slice(0, 24);
    A().dialog(`<div class="d-body"><h3>${icon('calendar')} Mübarek günleri düzelt</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Tarihleri kendi takvimine (ör. Fazilet Takvimi) göre düzelt. Değiştirdiğin tarih; hicri takvim, kampanya, otomatik hazırlık ve hatırlatmaların hepsinde kullanılır.</p>
      <div class="md-list">${evs.map((e) => `<label class="md-row"><span><b>${esc(e.name)}</b><small>${esc(e.hijri || '')}${e.fixed ? ' · düzeltildi' : ''}</small></span><input type="date" class="inp" data-k="${esc(evKey(+e.date.slice(0, 4), e.name))}" data-y="${e.date.slice(0, 4)}" value="${e.date}"></label>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" id="mdReset">Hepsini sıfırla</button><button class="btn primary" id="mdOk">Kaydet</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $('#mdOk', box).onclick = () => { const ov = LS.get('ts_hijri_over', {}); $$('input[data-k]', box).forEach((i) => { const orig = evs.find((e) => evKey(+e.date.slice(0, 4), e.name) === i.dataset.k); if (orig && i.value && i.value !== orig.date) ov[evKey(+i.dataset.y, i.dataset.k.split('|')[1])] = i.value; }); LS.set('ts_hijri_over', ov); close(null); toast('Mübarek gün tarihleri kaydedildi'); };
        $('#mdReset', box).onclick = () => { LS.set('ts_hijri_over', {}); close(null); toast('Hesaplanan tarihlere dönüldü'); };
      },
    });
  };

  // ================================================================ 1) İMSAKİYE
  P10.imsakiye = async function () {
    if (!(await needVakit())) return;
    const v = P10.vakit(), all = v.rows;
    const y = new Date().getFullYear();
    const ram = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].find((e) => /Ramazan başlangıcı/i.test(e.name) && e.date >= ymd(new Date(Date.now() - 20 * 864e5)));
    const startDef = ram ? ram.date : all[0].date;
    const res = await A().dialog(`<div class="d-body"><h3>${icon('moon') || icon('calendar')} İmsakiye</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Vakit tablosundaki saatlerle Ramazan imsakiyesi hazırlanır (A4, baskıya hazır).</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field"><span>Ramazan’ın 1. günü</span><input class="inp" type="date" id="imS" value="${startDef}"></label>
        <label class="field"><span>Gün sayısı</span><select class="inp" id="imN"><option>29</option><option selected>30</option></select></label>
        <label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="imT" value="Ramazan İmsakiyesi"></label>
        <label class="field"><span>Şehir</span><input class="inp" id="imC" value="${esc(v.city || '')}"></label>
        <label class="field"><span>Kaynak</span><input class="inp" id="imK" value="${esc(v.source || 'Fazilet Takvimi')}"></label></div></div>
      <div class="d-foot"><button class="btn ghost" id="imV">Vakitleri düzenle</button><button class="btn primary" id="imGo">İmsakiyeyi hazırla</button></div>`, {
      onOpen: (box, close) => { $('#imV', box).onclick = () => { close(null); P10.vakitDialog(); }; $('#imGo', box).onclick = () => close({ start: $('#imS', box).value, n: +$('#imN', box).value, title: $('#imT', box).value, city: $('#imC', box).value, src: $('#imK', box).value }); },
    });
    if (!res) return;
    const rows = []; for (let i = 0; i < res.n; i++) { const d = D(res.start); d.setDate(d.getDate() + i); const s = ymd(d); rows.push({ i: i + 1, s, d, r: P10.vakitRow(s) }); }
    const miss = rows.filter((r) => !r.r).length;
    const W = 1240, H = 1754, M = 70, ink = bcol(0, '#1B2A4A'), acc = bcol(1, '#B8872F'), L = [];
    L.push(Im('Süs · gece zemini', TH().night ? TH().night(W, 300, '#0E1830', '#24365F') : PH(), 0, 0, W, 300, { fit: 'fill', locked: true }));
    L.push(Im('Süs · hilal', TH().crescent('#F4D58D'), W - M - 170, 50, 170, 170, { fit: 'contain' }));
    L.push(T('Başlık', res.title, M, 70, W - 2 * M - 200, 64, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF' }));
    const hy = hijri(res.start).split(' ').pop();
    L.push(T('Alt başlık', `${res.city ? res.city + ' · ' : ''}${rows[0].d.getFullYear()}${hy ? ' / ' + hy : ''}`, M, 160, W - 2 * M - 200, 32, { fill: '#F4D58D', fontWeight: 600 }));
    const cols = (() => { const ks = new Set(); rows.forEach((r) => r.r && Object.keys(r.r.t).forEach((k) => ks.add(k))); return VK.filter((k) => ks.has(k)); })();
    const heads = ['Gün', 'Tarih', ...cols.map((c) => (c === 'Akşam' ? 'İftar' : c))];
    const top = 340, rowH = Math.min(42, (H - top - 170) / (rows.length + 1)), fs = Math.round(rowH * 0.5);
    const cw = [0.07, 0.2]; const rest = (1 - 0.27) / cols.length; cols.forEach(() => cw.push(rest));
    const xs = []; let acc0 = M; cw.forEach((w) => { xs.push(acc0); acc0 += w * (W - 2 * M); });
    L.push(Rc('Tablo başlık zemini', M, top, W - 2 * M, rowH, ink, { radius: 8 }));
    rows.forEach((r, i) => { if (i % 2 === 0) L.push(Rc('Satır zemini', M, top + rowH * (i + 1), W - 2 * M, rowH, '#F3EFE6')); });
    const special = [...window.P7.hijriEvents(rows[0].d.getFullYear()), ...window.P7.hijriEvents(rows[0].d.getFullYear() + 1)];
    rows.forEach((r, i) => { const ev = special.find((e) => e.date === r.s && /Kadir|Bayram/.test(e.name)); if (ev) { L.push(Rc('Özel gün vurgusu', M, top + rowH * (i + 1), W - 2 * M, rowH, acc, { opacity: 0.25 })); } });
    heads.forEach((h, c) => {
      L.push(T('Sütun başlığı', h, xs[c], top + (rowH - fs * 1.2) / 2, cw[c] * (W - 2 * M), fs * 0.95, { fill: '#FFFFFF', fontWeight: 700, align: 'center', maxLines: 1 }));
      const vals = rows.map((r) => (c === 0 ? String(r.i) : c === 1 ? `${r.d.getDate()} ${TRM[r.d.getMonth()].slice(0, 3)} ${TRS[r.d.getDay()]}` : (r.r && r.r.t[cols[c - 2]]) || '—'));
      L.push(T('Sütun · ' + h, vals.join('\n'), xs[c], top + rowH, cw[c] * (W - 2 * M), fs, { lineHeight: r1(rowH / fs), fontWeight: c === 0 || cols[c - 2] === 'İmsak' || cols[c - 2] === 'Akşam' ? 700 : 500, fill: cols[c - 2] === 'Akşam' || cols[c - 2] === 'İmsak' ? ink : '#333B48', align: 'center', fontFamily: 'Montserrat' }));
    });
    const fy = top + rowH * (rows.length + 1) + 24;
    const kad = special.find((e) => /Kadir/.test(e.name) && rows.some((r) => r.s === e.date)), bay = special.find((e) => /Ramazan Bayramı$/.test(e.name));
    L.push(T('Not', `${kad ? `Kadir Gecesi: ${trDate(D(kad.date))} gecesi   ` : ''}${bay ? `Ramazan Bayramı: ${trDate(D(bay.date))}` : ''}`.trim() || ' ', M, fy, W - 2 * M, 24, { fill: ink, fontWeight: 600, align: 'center' }));
    L.push(Rc('Alt bant', 0, H - 80, W, 80, ink));
    L.push(T('Logo', `${brand().name || 'Kurum adı'}   •   Vakitler: ${res.src || 'kaynak'}`, M, H - 58, W - 2 * M, 24, { fill: '#FFFFFF', fontWeight: 600, align: 'center' }));
    await P10.makeDoc(W, H, `${res.title} ${rows[0].d.getFullYear()}`, L, { type: 'solid', color: '#FFFFFF' }, { imsakiye: true }, true);
    toast(miss ? `İmsakiye hazır. ${miss} günün vakti tabloda yoktu (— yazıldı); Vakit tablosuna ekleyebilirsin.` : 'İmsakiye hazır: İndir → PDF ile yazdırabilirsin');
  };

  // ================================================================ 2) NAMAZ VAKTİ KARTI (günlük story / haftalık)
  P10.vakitCard = async function () {
    if (!(await needVakit())) return;
    const v = P10.vakit(), today = ymd(new Date()), near = v.rows.find((r) => r.date >= today) || v.rows[v.rows.length - 1];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('clock') || icon('calendar')} Namaz vakti kartı</h3>
      <div class="seg" id="nkT" style="margin-bottom:10px"><button class="on" data-t="day">Günlük (story)</button><button data-t="week">Haftalık (4:5)</button></div>
      <label class="field"><span>Tarih (haftalıkta ilk gün)</span><input class="inp" type="date" id="nkD" value="${near.date}" min="${v.rows[0].date}" max="${v.rows[v.rows.length - 1].date}"></label>
      <label class="field"><span>Başlık</span><input class="inp" id="nkH" value="Namaz Vakitleri"></label></div>
      <div class="d-foot"><button class="btn ghost" id="nkV">Vakitleri düzenle</button><button class="btn primary" id="nkGo">Hazırla</button></div>`, {
      onOpen: (box, close) => { let t = 'day'; $('#nkT', box).onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; t = b.dataset.t; $$('#nkT button', box).forEach((x) => x.classList.toggle('on', x === b)); }; $('#nkV', box).onclick = () => { close(null); P10.vakitDialog(); }; $('#nkGo', box).onclick = () => close({ t, d: $('#nkD', box).value, h: $('#nkH', box).value }); },
    });
    if (!res) return;
    const ink = bcol(0, '#0F3B32'), acc = bcol(1, '#C9A227');
    if (res.t === 'day') {
      const r = P10.vakitRow(res.d); if (!r) return toast('Bu günün vakti tabloda yok', true);
      const W = 1080, H = 1920, M = 90, L = [];
      L.push(Im('Süs · zemin', TH().night(W, H, '#0B2A24', '#1D5A4C', 9), 0, 0, W, H, { fit: 'fill', locked: true }));
      L.push(Im('Süs · desen', TH().girih ? TH().girih(W, 700, 'rgba(255,255,255,0.06)') : PH(), 0, 0, W, 700, { fit: 'fill', locked: true, opacity: 0.8 }));
      L.push(Im('Süs · hilal', TH().crescent('#F4D58D'), (W - 200) / 2, 150, 200, 200, { fit: 'contain' }));
      L.push(T('Başlık', res.h, M, 400, W - 2 * M, 84, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF', align: 'center' }));
      const dd = D(res.d);
      L.push(T('Tarih', `${trDate(dd)} ${TRD[dd.getDay()]}`, M, 520, W - 2 * M, 40, { fill: '#F4D58D', fontWeight: 600, align: 'center' }));
      L.push(T('Hicri', hijri(res.d) || ' ', M, 578, W - 2 * M, 34, { fill: 'rgba(255,255,255,0.75)', align: 'center' }));
      const ks = VK.filter((k) => r.t[k]), rh = Math.min(150, 960 / ks.length);
      ks.forEach((k, i) => { const y = 690 + i * rh; L.push(Rc('Vakit kutusu', M, y, W - 2 * M, rh - 22, 'rgba(255,255,255,0.10)', { radius: 28, stroke: 'rgba(255,255,255,0.18)', strokeWidth: 2 })); L.push(T('Vakit adı', k, M + 50, y + (rh - 22) / 2 - 30, 420, 52, { fill: '#FFFFFF', fontWeight: 600 })); L.push(T('Vakit · ' + k, r.t[k], W - M - 400, y + (rh - 22) / 2 - 36, 350, 64, { fill: k === 'İmsak' || k === 'Akşam' ? '#F4D58D' : '#FFFFFF', fontWeight: 700, align: 'right', fontFamily: 'Montserrat' })); });
      L.push(T('Logo', `${v.city ? v.city + '  •  ' : ''}${brand().name || ''}`.replace(/\s•\s$/, ''), M, H - 190, W - 2 * M, 34, { fill: '#FFFFFF', fontWeight: 600, align: 'center' }));
      L.push(T('Kaynak', 'Vakitler: ' + (v.source || 'kaynak'), M, H - 135, W - 2 * M, 26, { fill: 'rgba(255,255,255,0.6)', align: 'center' }));
      await P10.makeDoc(W, H, `${res.h} · ${trDate(dd)}`, L, { type: 'solid', color: '#0B2A24' }, {}, true);
    } else {
      const W = 1080, H = 1350, M = 60, L = [], days = [];
      for (let i = 0; i < 7; i++) { const d = D(res.d); d.setDate(d.getDate() + i); const r = P10.vakitRow(ymd(d)); if (r) days.push({ d, r }); }
      if (!days.length) return toast('Bu hafta için vakit yok', true);
      const ks = VK.filter((k) => days.some((x) => x.r.t[k]));
      L.push(Rc('Üst bant', 0, 0, W, 250, ink));
      L.push(Im('Süs · desen', TH().girih ? TH().girih(W, 250, 'rgba(255,255,255,0.07)') : PH(), 0, 0, W, 250, { fit: 'fill', locked: true }));
      L.push(T('Başlık', res.h, M, 60, W - 2 * M, 64, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF', align: 'center' }));
      L.push(T('Alt başlık', `${v.city ? v.city + ' · ' : ''}${days[0].d.getDate()} ${TRM[days[0].d.getMonth()]} – ${trDate(days[days.length - 1].d)}`, M, 150, W - 2 * M, 30, { fill: acc, fontWeight: 600, align: 'center' }));
      const top = 300, rh = (H - top - 120) / (days.length + 1), fs = Math.round(Math.min(30, rh * 0.36)), cw0 = 0.2, cw = (1 - cw0) / ks.length;
      L.push(Rc('Tablo başlık zemini', M, top, W - 2 * M, rh, acc, { radius: 10 }));
      days.forEach((x, i) => i % 2 === 0 && L.push(Rc('Satır zemini', M, top + rh * (i + 1), W - 2 * M, rh, '#F2EFE8')));
      const col = (c, h, vals, o) => { const x = M + (c === 0 ? 0 : (cw0 + (c - 1) * cw) * (W - 2 * M)), w = (c === 0 ? cw0 : cw) * (W - 2 * M); L.push(T('Sütun başlığı', h, x, top + (rh - fs * 1.1) / 2, w, fs * 0.9, { fill: '#FFFFFF', fontWeight: 700, align: 'center' })); L.push(T('Sütun · ' + h, vals.join('\n'), x, top + rh, w, fs, Object.assign({ lineHeight: r1(rh / fs), align: 'center', fontFamily: 'Montserrat', fill: '#2B3340' }, o))); };
      col(0, 'Gün', days.map((x) => `${x.d.getDate()} ${TRS[x.d.getDay()]}`), { fontWeight: 700, fill: ink });
      ks.forEach((k, i) => col(i + 1, k, days.map((x) => x.r.t[k] || '—'), { fontWeight: k === 'İmsak' || k === 'Akşam' ? 700 : 500, fill: k === 'İmsak' || k === 'Akşam' ? ink : '#2B3340' }));
      L.push(T('Kaynak', `${brand().name ? brand().name + '  •  ' : ''}Vakitler: ${v.source || 'kaynak'}`, M, H - 70, W - 2 * M, 24, { fill: '#6B7280', align: 'center' }));
      await P10.makeDoc(W, H, `${res.h} · haftalık`, L, { type: 'solid', color: '#FFFFFF' }, {}, true);
    }
    toast('Namaz vakti kartı hazır');
  };

  // ================================================================ 3) HİCRİ DUVAR TAKVİMİ (12 ay, mübarek günler işaretli)
  P10.wallCalendar = async function () {
    const y0 = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const res = await A().dialog(`<div class="d-body"><h3>${icon('calendar')} Hicri duvar takvimi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">12 ay tek sayfada; mübarek günler renkli ve altta listeli. Tarihler yanlışsa önce “Mübarek günleri düzelt” ile kendi takvimine göre ayarla.</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Yıl</span><select class="inp" id="wcY">${[y0 - 1, y0, y0 + 1].map((y) => `<option ${y === y0 ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
      <label class="field"><span>Kâğıt</span><select class="inp" id="wcP"><option value="a4">A4 dikey</option><option value="a3">A3 dikey (büyük baskı)</option></select></label>
      <label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="wcT" value="${esc(brand().name || 'Takvim')}"></label></div></div>
      <div class="d-foot"><button class="btn ghost" id="wcFix">Mübarek günleri düzelt</button><button class="btn primary" id="wcGo">Takvimi hazırla</button></div>`, {
      onOpen: (box, close) => { $('#wcFix', box).onclick = () => { close(null); P10.daysDialog(); }; $('#wcGo', box).onclick = () => close({ y: +$('#wcY', box).value, p: $('#wcP', box).value, t: $('#wcT', box).value }); },
    });
    if (!res) return;
    const pr = busy('Takvim hazırlanıyor…');
    const k = res.p === 'a3' ? 1.414 : 1, W = Math.round(1240 * k), H = Math.round(1754 * k), M = 60 * k, ink = bcol(0, '#14532D'), acc = bcol(1, '#B8872F'), L = [];
    const evs = window.P7.hijriEvents(res.y).filter((e) => e.date.startsWith(String(res.y)));
    const evMap = {}; evs.forEach((e) => (evMap[e.date] = evMap[e.date] || e));
    L.push(Rc('Üst bant', 0, 0, W, 190 * k, ink));
    L.push(Im('Süs · desen', TH().girih ? TH().girih(W, Math.round(190 * k), 'rgba(255,255,255,0.07)') : PH(), 0, 0, W, 190 * k, { fit: 'fill', locked: true }));
    L.push(T('Başlık', res.t, M, 40 * k, W * 0.6, 56 * k, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF' }));
    const h1 = hijri(`${res.y}-01-01`).split(' ').pop(), h2 = hijri(`${res.y}-12-31`).split(' ').pop();
    L.push(T('Yıl', `${res.y}`, W * 0.6, 34 * k, W * 0.4 - M, 80 * k, { fontWeight: 800, fill: '#FFFFFF', align: 'right', fontFamily: 'Montserrat' }));
    L.push(T('Hicri yıl', `Hicri ${h1}${h2 !== h1 ? ' – ' + h2 : ''}`, M, 120 * k, W - 2 * M, 28 * k, { fill: acc, fontWeight: 600 }));
    const cols = 3, gx = 30 * k, gy = 22 * k, gw = (W - 2 * M - (cols - 1) * gx) / cols, top = 225 * k, legendH = 250 * k, gh = (H - top - legendH - 3 * gy) / 4;
    const cell = gw / 7, fs = Math.round(Math.min(cell * 0.4, 20 * k));
    for (let m = 0; m < 12; m++) {
      const cx = M + (m % cols) * (gw + gx), cy = top + Math.floor(m / cols) * (gh + gy);
      L.push(Rc('Ay zemini', cx, cy, gw, gh, '#FFFFFF', { radius: 14 * k, stroke: '#E5E0D6', strokeWidth: 1.5 }));
      const hA = hijri(`${res.y}-${String(m + 1).padStart(2, '0')}-01`).replace(/^\d+\s/, '').replace(/\s\d+$/, ''), hB = hijri(ymd(new Date(res.y, m + 1, 0, 12))).replace(/^\d+\s/, '').replace(/\s\d+$/, '');
      L.push(T('Ay adı', TRM[m], cx + 14 * k, cy + 10 * k, gw * 0.5, 26 * k, { fontWeight: 700, fill: ink }));
      L.push(T('Hicri aylar', hA === hB ? hA : `${hA} – ${hB}`, cx + gw * 0.3, cy + 16 * k, gw * 0.67, (`${hA} – ${hB}`.length > 26 ? 12.5 : 15) * k, { fill: acc, fontWeight: 600, align: 'right', maxLines: 1 }));
      const hy = cy + 48 * k, ch = (gh - 58 * k) / 7;
      L.push(T('Gün adları', 'Pt\tSa\tÇa\tPe\tCu\tCt\tPz', cx, hy, gw, fs * 0.8, { fill: '#8A8F98', fontWeight: 600, align: 'left', tabs: true }));
      // gün adlarını tek tek koy (sekme hizası yerine)
      L.pop(); ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].forEach((g, i) => L.push(T('Gün adı', g, cx + i * cell, hy, cell, fs * 0.8, { fill: i === 4 ? ink : '#8A8F98', fontWeight: 700, align: 'center' })));
      const first = (new Date(res.y, m, 1).getDay() + 6) % 7, n = new Date(res.y, m + 1, 0).getDate();
      for (let d = 1; d <= n; d++) {
        const idx = first + d - 1, r = Math.floor(idx / 7), c = idx % 7, x = cx + c * cell, yy = hy + (r + 1) * ch;
        const ds = `${res.y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, ev = evMap[ds];
        if (ev) L.push(Rc('Mübarek gün', x + cell * 0.14, yy - ch * 0.08, cell * 0.72, ch * 0.84, /Bayram/.test(ev.name) ? acc : ink, { radius: ch * 0.42 }));
        L.push(T('Gün', String(d), x, yy + ch * 0.06, cell, fs, { align: 'center', fontWeight: ev || c === 4 ? 700 : 500, fill: ev ? '#FFFFFF' : c === 6 ? '#B91C1C' : '#2B3340', fontFamily: 'Montserrat' }));
      }
    }
    const ly = H - legendH + 10 * k;
    L.push(T('Liste başlığı', 'Mübarek gün ve geceler', M, ly, W - 2 * M, 24 * k, { fontWeight: 700, fill: ink }));
    const items = evs.map((e) => { const d = D(e.date); return `${d.getDate()} ${TRM[d.getMonth()]} — ${e.name}`; });
    const per = Math.ceil(items.length / 3);
    for (let c = 0; c < 3; c++) L.push(T('Liste', items.slice(c * per, (c + 1) * per).join('\n') || ' ', M + c * ((W - 2 * M) / 3), ly + 40 * k, (W - 2 * M) / 3 - 10, 17 * k, { lineHeight: 1.55, fill: '#374151' }));
    L.push(T('Not', 'Mübarek gecelerin tarihleri, gecenin bağladığı günden bir önceki akşamdır.', M, H - 40 * k, W - 2 * M, 14 * k, { fill: '#9CA3AF', align: 'center' }));
    try { await P10.makeDoc(W, H, `${res.t} · ${res.y} takvimi`, L, { type: 'solid', color: '#FAF8F3' }, {}, true); toast('Takvim hazır: İndir → PDF (baskı)'); } catch (e) { toast(e.message, true); }
    pr.remove();
  };

  // ================================================================ 4) RAMAZAN GÜNLÜK SERİSİ (30 görsel)
  const RQ = () => { const Q = (window.P9 && window.P9.QUOTES) || {}; return [...(Q['Ramazan ve oruç'] || []), ...(Q['Sadaka ve infak'] || []), ...(Q['Sabır ve tevekkül'] || []), ...(Q['Kardeşlik ve merhamet'] || []), ...(Q['Cuma ve dua'] || []), ...(Q['İlim ve eğitim'] || [])]; };
  P10.ramadanDayDoc = function (i, date, opt) {
    const W = opt.W, H = opt.H, M = W * 0.08, story = H > W * 1.5, L = [], d = D(date), v = P10.vakitRow(date), q = RQ()[(i - 1) % RQ().length] || ['Ramazan ayı rahmet ayıdır.', '', 'hadis'];
    L.push(Im('Süs · gece zemini', TH().night(W, H, '#0E1830', '#2B4176', 3 + i), 0, 0, W, H, { fit: 'fill', locked: true }));
    if (TH().garland) L.push(Im('Süs · fenerler', TH().garland(W, Math.round(H * 0.28)), 0, 0, W, H * 0.28, { fit: 'fill', locked: true, opacity: 0.9 }));
    const cs = W * (story ? 0.3 : 0.22);
    L.push(Im('Süs · hilal', TH().crescent('#F4D58D'), (W - cs) / 2, H * (story ? 0.17 : 0.1), cs, cs, { fit: 'contain' }));
    let y = H * (story ? 0.17 : 0.1) + cs + H * 0.015;
    L.push(T('Gün', `Ramazan’ın ${i}. günü`, M, y, W - 2 * M, W * (story ? 0.085 : 0.075), { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF', align: 'center' })); y += W * (story ? 0.12 : 0.1);
    L.push(T('Tarih', `${trDate(d)} ${TRD[d.getDay()]}`, M, y, W - 2 * M, W * 0.036, { fill: '#F4D58D', fontWeight: 600, align: 'center' })); y += W * 0.055;
    if (opt.hijri !== false) { L.push(T('Hicri', `${i} Ramazan ${opt.hy || ''}`.trim(), M, y, W - 2 * M, W * 0.03, { fill: 'rgba(255,255,255,0.7)', align: 'center' })); y += W * 0.06; }
    if (v && (v.t['İmsak'] || v.t['Akşam'])) {
      const bw = (W - 2 * M - W * 0.04) / 2, bh = W * 0.15;
      [['Sahur', v.t['İmsak']], ['İftar', v.t['Akşam']]].forEach(([n, t], k) => { if (!t) return; const x = M + k * (bw + W * 0.04); L.push(Rc('Vakit kutusu', x, y, bw, bh, 'rgba(255,255,255,0.1)', { radius: W * 0.03, stroke: 'rgba(244,213,141,0.6)', strokeWidth: 2 })); L.push(T('Vakit adı', n, x, y + bh * 0.14, bw, W * 0.03, { fill: '#F4D58D', fontWeight: 600, align: 'center' })); L.push(T('Vakit · ' + n, t, x, y + bh * 0.42, bw, W * 0.06, { fill: '#FFFFFF', fontWeight: 700, align: 'center', fontFamily: 'Montserrat' })); });
      y += bh + W * 0.05;
    }
    const qt = T('Alıntı', `“${q[0]}”${q[1] ? '\n' + (q[2] === 'ayet' ? '' : 'Hadis-i Şerif · ') + q[1] : ''}`, M, y, W - 2 * M, W * (story ? 0.042 : 0.036), { fontFamily: 'Crimson Pro', fontWeight: 500, italic: true, fill: '#FFFFFF', align: 'center', lineHeight: 1.35 });
    L.push(qt);
    L.push(T('Logo', `${brand().name || ''}${opt.city ? (brand().name ? '  •  ' : '') + opt.city : ''}${v && opt.src ? '  •  Vakitler: ' + opt.src : ''}`.trim() || ' ', M, H - W * 0.11, W - 2 * M, W * 0.026, { fill: 'rgba(255,255,255,0.75)', align: 'center', fontWeight: 600 }));
    const doc = docOf(W, H, L, { type: 'solid', color: '#0E1830' });
    const ql = doc.layers.find((l) => l.name === 'Alıntı'); fit(ql, H - W * 0.14 - ql.y, 14);
    return doc;
  };
  P10.ramadanSeries = async function () {
    const y = new Date().getFullYear(), v = P10.vakit();
    const ram = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].find((e) => /Ramazan başlangıcı/i.test(e.name) && e.date >= ymd(new Date(Date.now() - 25 * 864e5)));
    const res = await A().dialog(`<div class="d-body"><h3>${icon('moon') || icon('calendar')} Ramazan günlük serisi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Her gün için ayrı görsel: “Ramazan’ın 5. günü”, tarih, sahur ve iftar saati (vakit tablosundan) ve her güne farklı ayet / hadis. Hepsi tek ZIP olarak iner.</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field"><span>Ramazan’ın 1. günü</span><input class="inp" type="date" id="rsS" value="${ram ? ram.date : ymd(new Date())}"></label>
        <label class="field"><span>Gün sayısı</span><select class="inp" id="rsN"><option>29</option><option selected>30</option></select></label>
        <label class="field"><span>Ölçü</span><select class="inp" id="rsZ"><option value="1080x1920">Story / WhatsApp durum</option><option value="1080x1350">Instagram 4:5</option><option value="1080x1080">Kare</option></select></label>
        <label class="field"><span>Şehir</span><input class="inp" id="rsC" value="${esc(v.city || '')}"></label></div>
      <p class="muted" style="font-size:12px;margin:8px 0 0">${(v.rows || []).length ? `Vakit tablosunda ${v.rows.length} gün var; olmayan günlerde saat kutusu çıkmaz.` : 'Vakit tablosu boş: sahur / iftar saatleri çıkmaz. İstersen önce vakitleri gir.'}</p>
      <div class="kit-pv" style="margin-top:10px"><div class="kit-th" id="rsP" style="max-width:240px;margin:0 auto"></div></div></div>
      <div class="d-foot"><button class="btn ghost" id="rsV">Vakitleri gir</button><button class="btn primary" id="rsGo">${icon('download')}Seriyi hazırla</button></div>`, {
      onOpen: (box, close) => {
        const opt = () => { const [W, H] = $('#rsZ', box).value.split('x').map(Number); return { W, H, city: $('#rsC', box).value, src: v.source, hy: (hijri($('#rsS', box).value).match(/\d{4}$/) || [''])[0] }; };
        const pv = () => { const o = opt(); $('#rsP', box).innerHTML = R.renderSVG(P10.ramadanDayDoc(1, $('#rsS', box).value, o), { fit: true, prefix: 'rs' + Math.random().toString(36).slice(2, 5) }); };
        ['rsS', 'rsZ', 'rsC'].forEach((id) => ($('#' + id, box).onchange = pv));
        $('#rsV', box).onclick = () => { close(null); P10.vakitDialog(); };
        $('#rsGo', box).onclick = () => close(Object.assign(opt(), { start: $('#rsS', box).value, n: +$('#rsN', box).value }));
        setTimeout(pv, 50);
      },
    });
    if (!res) return;
    const pr = busy('Ramazan serisi hazırlanıyor…'), files = [];
    try {
      for (let i = 1; i <= res.n; i++) {
        pr.textContent = `Ramazan serisi hazırlanıyor… ${i} / ${res.n}`;
        const d = D(res.start); d.setDate(d.getDate() + i - 1);
        const doc = P10.ramadanDayDoc(i, ymd(d), res);
        const pg = await jpgOf(doc, 1);
        files.push({ name: `ramazan-${String(i).padStart(2, '0')}.jpg`, data: new Uint8Array(await pg.blob.arrayBuffer()) });
        if (i === 1) { const p = Object.assign(A().newProject(res.W, res.H, 'Ramazan serisi · 1. gün'), { background: doc.background, layers: doc.layers, meta: { ramadan: 1 } }); await A().saveProject(p).catch(() => {}); }
      }
      R.download(window.Tools.zip(files), `ramazan-serisi-${D(res.start).getFullYear()}.zip`);
      toast(`${res.n} günlük Ramazan serisi indi. 1. gün Projeler’de; düzenleyip yeniden kaydedebilirsin.`);
    } catch (e) { toast('Seri hazırlanamadı: ' + e.message, true); }
    pr.remove();
  };

  // ================================================================ 5) KANDİL / BAYRAM TEBRİK KARTI (kişiye özel)
  const GREET = { 'Kandil': 'Kandiliniz mübarek olsun', 'Bayram': 'Bayramınız mübarek olsun', 'Hicri yılbaşı': 'Hicri yeni yılınız mübarek olsun', 'Aşure': 'Aşure gününüz mübarek olsun', 'Mevlid': 'Mevlid Kandiliniz mübarek olsun' };
  P10.greetDoc = function (o) {
    const W = 1080, H = 1350, M = 90, L = [], bay = /Bayram/.test(o.ev);
    const c1 = bay ? '#3B1250' : '#0E1830', c2 = bay ? '#7A2E8E' : '#2B4176';
    L.push(Im('Süs · zemin', TH().night(W, H, c1, c2, 7), 0, 0, W, H, { fit: 'fill', locked: true }));
    L.push(Im('Süs · desen', TH().girih ? TH().girih(W, H, 'rgba(255,255,255,0.05)') : PH(), 0, 0, W, H, { fit: 'fill', locked: true }));
    L.push(Rc('Süs · çerçeve', M * 0.5, M * 0.5, W - M, H - M, 'rgba(0,0,0,0)', { stroke: 'rgba(244,213,141,0.7)', strokeWidth: 3, radius: 24 }));
    L.push(Im('Süs · hilal', TH().crescent('#F4D58D'), (W - 230) / 2, 150, 230, 230, { fit: 'contain' }));
    if (o.name) L.push(T('Hitap', `Sevgili ${o.name},`, M, 440, W - 2 * M, 44, { fontFamily: 'Crimson Pro', italic: true, fill: '#F4D58D', align: 'center' }));
    L.push(T('Başlık', o.ev, M, o.name ? 520 : 470, W - 2 * M, 96, { fontFamily: 'Ms Madi', fontWeight: 400, fill: '#FFFFFF', align: 'center', lineHeight: 1.1 }));
    L.push(T('Alt başlık', o.msg, M + 40, o.name ? 690 : 640, W - 2 * M - 80, 42, { fontFamily: 'Poppins', fontWeight: 500, fill: '#FFFFFF', align: 'center', lineHeight: 1.35 }));
    if (o.date) L.push(T('Tarih', o.date, M, o.name ? 870 : 820, W - 2 * M, 28, { fill: 'rgba(255,255,255,0.7)', align: 'center' }));
    L.push(T('Logo', o.from || brand().name || ' ', M, H - 190, W - 2 * M, 34, { fontFamily: 'Montserrat', fontWeight: 700, fill: '#F4D58D', align: 'center' }));
    return docOf(W, H, L, { type: 'solid', color: c1 });
  };
  P10.greeting = async function () {
    const y = new Date().getFullYear(), now = ymd(new Date());
    const evs = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].filter((e) => e.date >= now && /Kandil|Bayram|yılbaşı|Aşure|Mevlid|Kadir|Arefe/i.test(e.name)).filter((e, i, a) => a.findIndex((x) => x.name === e.name) === i).slice(0, 10);
    const res = await A().dialog(`<div class="d-body"><h3>${icon('heart')} Kandil / bayram tebrik kartı</h3>
      <div class="chips" id="gkE">${evs.map((e, i) => `<button class="chip ${i ? '' : 'on'}" data-n="${esc(e.name)}" data-d="${e.date}">${esc(e.name)}</button>`).join('')}</div>
      <div class="kit-g" style="margin-top:10px"><div class="kit-f" style="grid-template-columns:1fr">
        <label class="field"><span>Mesaj</span><textarea class="inp" id="gkM" rows="3"></textarea></label>
        <label class="field"><span>Kişiler (isteğe bağlı · her satıra bir isim → herkese adlı kart)</span><textarea class="inp" id="gkL" rows="4" placeholder="Ahmet Bey&#10;Ayşe Hanım"></textarea></label>
        <label class="field"><span>Gönderen</span><input class="inp" id="gkF" value="${esc(brand().name || '')}"></label></div>
        <div class="kit-pv"><div class="kit-th" id="gkP"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="gkGo">Hazırla</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let ev = evs[0] || { name: 'Kandiliniz mübarek olsun', date: '' };
        const def = (n) => (/Bayram/.test(n) ? GREET.Bayram : /yılbaşı/i.test(n) ? GREET['Hicri yılbaşı'] : /Aşure/.test(n) ? GREET['Aşure'] : /Mevlid/.test(n) ? GREET.Mevlid : 'Rabbim dualarınızı kabul etsin, gecenizi bereketli kılsın.');
        $('#gkM', box).value = def(ev.name);
        const o = () => ({ ev: ev.name.replace(/ (gecesi|günü|başlangıcı)$/i, (m) => m), msg: $('#gkM', box).value, from: $('#gkF', box).value, date: ev.date ? trDate(D(ev.date)) : '', name: ($('#gkL', box).value.split('\n').map((s) => s.trim()).filter(Boolean)[0]) || '' });
        const pv = () => { $('#gkP', box).innerHTML = R.renderSVG(P10.greetDoc(o()), { fit: true, prefix: 'gk' + Math.random().toString(36).slice(2, 5) }); };
        $('#gkE', box).onclick = (e) => { const b = e.target.closest('[data-n]'); if (!b) return; ev = { name: b.dataset.n, date: b.dataset.d }; $$('#gkE .chip', box).forEach((x) => x.classList.toggle('on', x === b)); $('#gkM', box).value = def(ev.name); pv(); };
        ['gkM', 'gkL', 'gkF'].forEach((id) => ($('#' + id, box).oninput = pv));
        $('#gkGo', box).onclick = () => close(Object.assign(o(), { names: $('#gkL', box).value.split('\n').map((s) => s.trim()).filter(Boolean) }));
        pv();
      },
    });
    if (!res) return;
    if (!res.names.length) { const d = P10.greetDoc(res); await P10.makeDoc(d.width, d.height, res.ev + ' tebriği', d.layers, d.background, {}, true); return toast('Tebrik kartı hazır'); }
    const pr = busy('Kartlar hazırlanıyor…'), files = [];
    for (let i = 0; i < res.names.length; i++) { pr.textContent = `Kartlar hazırlanıyor… ${i + 1} / ${res.names.length}`; const pg = await jpgOf(P10.greetDoc(Object.assign({}, res, { name: res.names[i] })), 1); files.push({ name: `${String(i + 1).padStart(2, '0')}-${slug(res.names[i])}.jpg`, data: new Uint8Array(await pg.blob.arrayBuffer()) }); }
    R.download(window.Tools.zip(files), slug(res.ev) + '-tebrik.zip'); pr.remove();
    toast(`${files.length} kişiye özel tebrik kartı indi`);
  };

  // ================================================================ 7) GRAFİK / İNFOGRAFİK
  const parseData = (t) => String(t || '').split('\n').map((s) => s.trim()).filter(Boolean).map((s) => { const m = s.match(/^(.*?)[\s:=;\t-]+([\d.,]+)\s*([%a-zA-ZçğıöşüÇĞİÖŞÜ₺$€.]*)\s*$/); if (!m) return null; return { k: m[1].trim(), v: parseFloat(m[2].replace(/\./g, '').replace(',', '.')) || 0, u: m[3] || '' }; }).filter(Boolean);
  const fmtN = (v) => v.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  const PALS = () => [bcol(0, '#0F5A45'), bcol(1, '#C9A227'), '#E07A5F', '#3D5A80', '#81B29A', '#9C6ADE', '#F2CC8F', '#5FA8D3'];
  P10.chartLayers = function (type, data, x, y, w, h, opt = {}) {
    const L = [], cols = opt.colors || PALS(), ink = opt.ink || '#1F2937', S = Math.min(w, h), g = 'ch' + Math.random().toString(36).slice(2, 7);
    const push = (l) => L.push(Object.assign(l, { group: g }));
    let top = y;
    if (opt.title) { push(T('Grafik başlığı', opt.title, x, y, w, S * 0.07, { fontWeight: 700, fill: ink, align: 'center' })); top += S * 0.11; }
    const hh = h - (top - y), max = Math.max(1, ...data.map((d) => d.v)), sum = data.reduce((a, d) => a + d.v, 0) || 1;
    if (type === 'bar') {
      const n = data.length, gap = w * 0.04, bw = (w - gap * (n + 1)) / n, base = top + hh - S * 0.14;
      push(Rc('Grafik ekseni', x, base, w, Math.max(2, S * 0.004), ink, { opacity: 0.3 }));
      data.forEach((d, i) => { const bh = (base - top - S * 0.08) * (d.v / max), bx = x + gap + i * (bw + gap); push(Rc('Sütun · ' + d.k, bx, base - bh, bw, bh, cols[i % cols.length], { radius: Math.min(bw * 0.15, 14) })); push(T('Değer · ' + d.k, fmtN(d.v) + d.u, bx - gap / 2, base - bh - S * 0.065, bw + gap, S * 0.048, { fontWeight: 700, fill: ink, align: 'center', fontFamily: 'Montserrat' })); push(T('Etiket · ' + d.k, d.k, bx - gap / 2, base + S * 0.02, bw + gap, S * 0.036, { fill: ink, align: 'center', opacity: 0.8, lineHeight: 1.1 })); });
    } else if (type === 'hbar') {
      const n = data.length, rh = hh / n, lw = w * 0.32;
      data.forEach((d, i) => { const by = top + i * rh, bw = (w - lw - w * 0.16) * (d.v / max); push(T('Etiket · ' + d.k, d.k, x, by + rh * 0.2, lw - w * 0.03, Math.min(rh * 0.34, S * 0.05), { fill: ink, align: 'right', fontWeight: 600 })); push(Rc('Çubuk zemini', x + lw, by + rh * 0.18, w - lw - w * 0.16, rh * 0.5, ink, { opacity: 0.08, radius: rh * 0.25 })); push(Rc('Çubuk · ' + d.k, x + lw, by + rh * 0.18, Math.max(rh * 0.5, bw), rh * 0.5, cols[i % cols.length], { radius: rh * 0.25 })); push(T('Değer · ' + d.k, fmtN(d.v) + d.u, x + lw + Math.max(rh * 0.5, bw) + w * 0.015, by + rh * 0.2, w * 0.15, Math.min(rh * 0.34, S * 0.05), { fill: ink, fontWeight: 700, fontFamily: 'Montserrat' })); });
    } else if (type === 'pie' || type === 'donut') {
      const D0 = Math.min(hh, w * 0.55), cx = x + D0 / 2, cy = top + hh / 2, rr = 50; let a0 = -Math.PI / 2;
      data.forEach((d, i) => { const a1 = a0 + (d.v / sum) * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, p = (a, r) => `${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`; let dd; if (type === 'pie') dd = `M50 50L${p(a0, rr)}A${rr} ${rr} 0 ${big} 1 ${p(a1 - 0.0001, rr)}Z`; else { const ri = 30; dd = `M${p(a0, rr)}A${rr} ${rr} 0 ${big} 1 ${p(a1 - 0.0001, rr)}L${p(a1 - 0.0001, ri)}A${ri} ${ri} 0 ${big} 0 ${p(a0, ri)}Z`; } push(Pth('Dilim · ' + d.k, dd, cx - D0 / 2, cy - D0 / 2, D0, D0, cols[i % cols.length], { stroke: '#FFFFFF', strokeWidth: 1.2 })); a0 = a1; });
      if (type === 'donut') { push(T('Toplam', fmtN(sum) + (data[0] && data[0].u ? data[0].u : ''), cx - D0 * 0.3, cy - D0 * 0.09, D0 * 0.6, D0 * 0.13, { fontWeight: 800, fill: ink, align: 'center', fontFamily: 'Montserrat' })); push(T('Toplam etiketi', 'toplam', cx - D0 * 0.3, cy + D0 * 0.06, D0 * 0.6, D0 * 0.06, { fill: ink, opacity: 0.7, align: 'center' })); }
      const lx = x + D0 + w * 0.05, lw = w - D0 - w * 0.05, rh = Math.min(hh / data.length, S * 0.11);
      data.forEach((d, i) => { const ly = top + (hh - rh * data.length) / 2 + i * rh; push(Rc('Lejant rengi', lx, ly + rh * 0.22, rh * 0.42, rh * 0.42, cols[i % cols.length], { radius: rh * 0.1 })); push(T('Lejant · ' + d.k, `${d.k}  ${Math.round((d.v / sum) * 100)}%`, lx + rh * 0.6, ly + rh * 0.18, lw - rh * 0.6, Math.min(rh * 0.38, S * 0.05), { fill: ink, fontWeight: 600 })); });
    } else if (type === 'progress') {
      const n = data.length, rh = hh / n;
      data.forEach((d, i) => { const goal = d.goal || (d.u === '%' ? 100 : max), pct = Math.max(0, Math.min(1, d.v / goal)), by = top + i * rh; push(T('Etiket · ' + d.k, d.k, x, by + rh * 0.06, w * 0.7, Math.min(rh * 0.24, S * 0.05), { fill: ink, fontWeight: 600 })); push(T('Değer · ' + d.k, `${fmtN(d.v)}${d.u}${d.goal ? ' / ' + fmtN(d.goal) : ''}`, x + w * 0.5, by + rh * 0.06, w * 0.5, Math.min(rh * 0.24, S * 0.05), { fill: ink, fontWeight: 700, align: 'right', fontFamily: 'Montserrat' })); push(Rc('İlerleme zemini', x, by + rh * 0.42, w, rh * 0.26, ink, { opacity: 0.1, radius: rh * 0.13 })); push(Rc('İlerleme · ' + d.k, x, by + rh * 0.42, Math.max(rh * 0.26, w * pct), rh * 0.26, cols[i % cols.length], { radius: rh * 0.13 })); });
    } else if (type === 'stat') {
      const n = data.length, c = Math.min(3, n), rws = Math.ceil(n / c), cw = w / c, rh = hh / rws;
      data.forEach((d, i) => { const bx = x + (i % c) * cw, by = top + Math.floor(i / c) * rh; push(T('Sayı · ' + d.k, fmtN(d.v) + d.u, bx, by + rh * 0.12, cw, Math.min(rh * 0.38, cw * 0.26), { fontWeight: 800, fill: cols[i % cols.length], align: 'center', fontFamily: 'Montserrat' })); push(T('Etiket · ' + d.k, d.k, bx + cw * 0.06, by + rh * 0.58, cw * 0.88, Math.min(rh * 0.15, cw * 0.09), { fill: ink, align: 'center', lineHeight: 1.2 })); });
    }
    return L;
  };
  P10.chart = async function () {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const res = await A().dialog(`<div class="d-body"><h3>${icon('chart') || icon('layers')} Grafik ve infografik</h3>
      <div class="seg" id="grT" style="flex-wrap:wrap"><button class="on" data-t="stat">Büyük sayılar</button><button data-t="bar">Sütun</button><button data-t="hbar">Yatay çubuk</button><button data-t="donut">Halka</button><button data-t="pie">Pasta</button><button data-t="progress">İlerleme</button></div>
      <div class="kit-g" style="margin-top:10px"><div class="kit-f" style="grid-template-columns:1fr">
        <label class="field"><span>Veriler (her satır: ad = sayı · birim yazabilirsin: %, ₺, kg)</span><textarea class="inp" id="grD" rows="6">Dağıtılan koli = 1250\nKesilen kurban = 340\nİftar sofrası = 5200\nBurs alan talebe = 48</textarea></label>
        <label class="field"><span>Başlık (isteğe bağlı)</span><input class="inp" id="grH" value=""></label></div>
        <div class="kit-pv"><div class="kit-th" id="grP" style="background:#fff;border-radius:10px"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="grGo">${icon('plus')}Tasarıma ekle</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let t = 'stat';
        const pv = () => { const data = parseData($('#grD', box).value); const L = P10.chartLayers(t, data, 20, 20, 560, 380, { title: $('#grH', box).value }); $('#grP', box).innerHTML = R.renderSVG(docOf(600, 420, L), { fit: true, prefix: 'gr' + Math.random().toString(36).slice(2, 5) }); };
        $('#grT', box).onclick = (ev) => { const b = ev.target.closest('[data-t]'); if (!b) return; t = b.dataset.t; $$('#grT button', box).forEach((x) => x.classList.toggle('on', x === b)); pv(); };
        $('#grD', box).oninput = pv; $('#grH', box).oninput = pv;
        $('#grGo', box).onclick = () => { const data = parseData($('#grD', box).value); if (!data.length) return toast('Veri okunamadı: “Ad = 120” biçiminde yaz', true); close({ t, data, title: $('#grH', box).value }); };
        pv();
      },
    });
    if (!res) return;
    const d = e.doc, w = d.width * 0.84, h = Math.min(d.height * 0.42, w * 0.7);
    const [x, y] = window.P9 && window.P9.quietSpot ? await window.P9.quietSpot(d, w, h) : [(d.width - w) / 2, (d.height - h) / 2];
    const ink = window.P9 && window.P9.darkInk ? window.P9.darkInk(d) : '#1F2937';
    e.insert(P10.chartLayers(res.t, res.data, x, y, w, h, { title: res.title, ink }), { group: false });
    toast('Grafik eklendi; sayılar ve etiketler düz yazı, istediğin gibi düzenleyebilirsin');
  };

  // ================================================================ 6) FAALİYET RAPORU (çok sayfalı PDF)
  P10.report = async function () {
    let photos = [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('layers')} Faaliyet raporu</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Kapak, rakamlar ve grafik, fotoğraf sayfaları ve teşekkür sayfasıyla çok sayfalı PDF rapor. Sayfalar Projeler’e de kaydedilir, istersen tek tek düzenlersin.</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="rpT" value="${new Date().getFullYear()} Faaliyet Raporu"></label>
        <label class="field" style="grid-column:1/-1"><span>Giriş yazısı</span><textarea class="inp" id="rpI" rows="3">Destekleriniz sayesinde bu yıl da ihtiyaç sahibi kardeşlerimize ulaştık. Emeği geçen herkese teşekkür ederiz.</textarea></label>
        <label class="field" style="grid-column:1/-1"><span>Rakamlar (ad = sayı)</span><textarea class="inp" id="rpD" rows="5">Dağıtılan gıda kolisi = 1250\nKesilen kurban = 340\nİftar sofrası = 5200\nBurs alan talebe = 48\nUlaşılan aile = 860</textarea></label>
        <label class="field" style="grid-column:1/-1"><span>Kapanış / teşekkür</span><input class="inp" id="rpE" value="Hayırlarınız daim olsun. Allah razı olsun."></label></div>
      <div class="ss-pics" id="rpP" style="margin-top:10px"><button class="ss-add" id="rpAdd">${icon('plus')}<span>Fotoğraf ekle</span></button></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="rpGo">${icon('download')}Raporu hazırla</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const draw = () => { $$('.ss-pic', box).forEach((x) => x.remove()); photos.forEach((u, i) => { const d = document.createElement('div'); d.className = 'ss-pic'; d.innerHTML = `<img alt="" src="${u}"><button data-rm="${i}">×</button>`; $('#rpAdd', box).before(d); }); };
        $('#rpAdd', box).onclick = async () => { photos.push(...(await pickImages(true))); photos = photos.slice(0, 16); draw(); };
        $('#rpP', box).onclick = (ev) => { const b = ev.target.closest('[data-rm]'); if (b) { photos.splice(+b.dataset.rm, 1); draw(); } };
        $('#rpGo', box).onclick = () => close({ title: $('#rpT', box).value, intro: $('#rpI', box).value, data: parseData($('#rpD', box).value), end: $('#rpE', box).value });
      },
    });
    if (!res) return;
    const W = 1240, H = 1754, M = 90, ink = bcol(0, '#0F5A45'), acc = bcol(1, '#C9A227'), pages = [], bn = brand().name || 'Kurum adı';
    const foot = (L, n) => { L.push(Rc('Alt çizgi', M, H - 90, W - 2 * M, 2, ink, { opacity: 0.3 })); L.push(T('Altbilgi', `${bn}  •  ${res.title}`, M, H - 72, W - 2 * M - 80, 20, { fill: '#6B7280' })); L.push(T('Sayfa no', String(n), W - M - 80, H - 72, 80, 20, { fill: '#6B7280', align: 'right', fontWeight: 700 })); };
    // kapak
    { const L = []; L.push(Im('Kapak fotoğrafı', photos[0] || PH(), 0, 0, W, H * 0.62, { role: 'photo' })); L.push(Rc('Kapak bandı', 0, H * 0.62, W, H * 0.38, ink)); L.push(Rc('Süs · şerit', M, H * 0.62 + 90, 120, 8, acc)); L.push(T('Başlık', res.title, M, H * 0.62 + 130, W - 2 * M, 92, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: '#FFFFFF', lineHeight: 1.05 })); L.push(T('Alt başlık', bn, M, H * 0.62 + 380, W - 2 * M, 38, { fill: acc, fontWeight: 700 })); pages.push(docOf(W, H, L)); }
    // rakamlar
    { const L = []; L.push(T('Başlık', 'Rakamlarla bu dönem', M, M, W - 2 * M, 60, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: ink })); L.push(T('Giriş', res.intro, M, M + 100, W - 2 * M, 28, { fill: '#374151', lineHeight: 1.5 })); L.push(...P10.chartLayers('stat', res.data, M, M + 300, W - 2 * M, 520, { ink })); L.push(...P10.chartLayers('hbar', res.data, M, M + 880, W - 2 * M, 600, { ink })); foot(L, 2); pages.push(docOf(W, H, L)); }
    // fotoğraflar (sayfa başına 4)
    const rest = photos.slice(1);
    for (let p = 0; p < Math.ceil(rest.length / 4); p++) { const L = []; L.push(T('Başlık', p ? 'Faaliyetlerimizden (devam)' : 'Faaliyetlerimizden', M, M, W - 2 * M, 56, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: ink })); const gw = (W - 2 * M - 30) / 2, gh = (H - M - 200 - 160) / 2; rest.slice(p * 4, p * 4 + 4).forEach((u, i) => L.push(Im('Fotoğraf ' + (p * 4 + i + 2), u, M + (i % 2) * (gw + 30), M + 120 + Math.floor(i / 2) * (gh + 30), gw, gh, { role: 'photo', radius: 18 }))); foot(L, pages.length + 1); pages.push(docOf(W, H, L)); }
    // kapanış
    { const L = []; L.push(Im('Süs · zemin', TH().mist(W, H, ink, 6), 0, 0, W, H, { fit: 'fill', locked: true, opacity: 0.5 })); L.push(Im('Simge', TH().icon('kalp2', acc), (W - 180) / 2, H * 0.3, 180, 180, { fit: 'contain' })); L.push(T('Başlık', 'Teşekkür ederiz', M, H * 0.3 + 230, W - 2 * M, 80, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: ink, align: 'center' })); L.push(T('Alt başlık', res.end, M + 80, H * 0.3 + 350, W - 2 * M - 160, 34, { fill: '#374151', align: 'center', lineHeight: 1.45 })); const b = brand(); L.push(T('İletişim', [b.phone, b.web, b.address].filter(Boolean).join('\n') || 'İletişim bilgilerini Marka sayfasından ekleyebilirsin', M, H * 0.72, W - 2 * M, 28, { fill: ink, align: 'center', lineHeight: 1.6, fontWeight: 600 })); foot(L, pages.length + 1); pages.push(docOf(W, H, L)); }
    const pr = busy('Rapor hazırlanıyor…');
    try {
      const jp = [];
      for (let i = 0; i < pages.length; i++) { pr.textContent = `Rapor hazırlanıyor… sayfa ${i + 1} / ${pages.length}`; jp.push(await jpgOf(pages[i], 2)); const pd = pages[i]; await P10.makeDoc(W, H, `${res.title} · sayfa ${i + 1}`, pd.layers, pd.background, { folder: res.title }); }
      const pdf = await window.P9.pdfFromJpegs(jp);
      R.download(pdf, slug(res.title) + '.pdf');
      toast(`${pages.length} sayfalık rapor indi (PDF). Sayfalar Projeler’de “${res.title}” klasöründe.`);
    } catch (er) { toast('Rapor hazırlanamadı: ' + er.message, true); }
    pr.remove();
  };

  // ================================================================ 8) ÖNCE / SONRA
  P10.beforeAfter = async function () {
    let ph = [null, null];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('copy')} Önce / sonra</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Su kuyusu, ev onarımı, okul boyama gibi projeler için iki fotoğraflı karşılaştırma.</p>
      <div class="ba-pick"><button class="ba-it" data-i="0"><i>ÖNCE</i><span>Fotoğraf seç</span></button><button class="ba-it" data-i="1"><i>SONRA</i><span>Fotoğraf seç</span></button></div>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="baT" value="Su kuyumuz tamamlandı"></label><label class="field" style="grid-column:1/-1"><span>Açıklama</span><input class="inp" id="baS" value="Desteklerinizle 300 kişilik köy temiz suya kavuştu."></label>
      <label class="field"><span>Yerleşim</span><select class="inp" id="baL"><option value="v">Alt alta (4:5)</option><option value="h">Yan yana (kare)</option><option value="s">Alt alta (story)</option></select></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="baGo">Hazırla</button></div>`, {
      onOpen: (box, close) => {
        $$('.ba-it', box).forEach((b) => (b.onclick = async () => { const u = await pickImages(false); if (u[0]) { ph[+b.dataset.i] = u[0]; b.style.backgroundImage = `url("${u[0]}")`; b.classList.add('has'); } }));
        $('#baGo', box).onclick = () => close({ t: $('#baT', box).value, s: $('#baS', box).value, l: $('#baL', box).value });
      },
    });
    if (!res) return;
    const [W, H] = res.l === 'h' ? [1080, 1080] : res.l === 's' ? [1080, 1920] : [1080, 1350], M = 56, ink = bcol(0, '#0F3B5A'), acc = bcol(1, '#F2B705'), L = [];
    const head = res.l === 's' ? 330 : 250, foot = 110;
    L.push(T('Başlık', res.t, M, M, W - 2 * M, res.l === 's' ? 76 : 60, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: ink, align: 'center', lineHeight: 1.05 }));
    L.push(T('Alt başlık', res.s, M, M + (res.l === 's' ? 190 : 130), W - 2 * M, 28, { fill: '#374151', align: 'center', lineHeight: 1.35 }));
    const area = [M, head, W - 2 * M, H - head - foot], g = 18;
    const boxes = res.l === 'h' ? [[area[0], area[1], (area[2] - g) / 2, area[3]], [area[0] + (area[2] + g) / 2, area[1], (area[2] - g) / 2, area[3]]] : [[area[0], area[1], area[2], (area[3] - g) / 2], [area[0], area[1] + (area[3] + g) / 2, area[2], (area[3] - g) / 2]];
    boxes.forEach(([x, y, w, h], i) => { L.push(Im(i ? 'Sonra fotoğrafı' : 'Önce fotoğrafı', ph[i] || PH(), x, y, w, h, { role: 'photo', radius: 22 })); L.push(Rc('Etiket zemini', x + 22, y + 22, 170, 54, i ? acc : '#1F2937', { radius: 27 })); L.push(T('Etiket', i ? 'SONRA' : 'ÖNCE', x + 22, y + 34, 170, 26, { fill: i ? '#1F2937' : '#FFFFFF', fontWeight: 800, align: 'center', letterSpacing: 2, fontFamily: 'Montserrat' })); });
    L.push(Rc('Ok zemini', res.l === 'h' ? W / 2 - 36 : W / 2 - 36, res.l === 'h' ? head + area[3] / 2 - 36 : head + area[3] / 2 - 36, 72, 72, '#FFFFFF', { radius: 36, shadow: { x: 0, y: 4, blur: 14, color: 'rgba(0,0,0,.25)' } }));
    L.push(Im('Ok', TH().icon('ok', ink), W / 2 - 24, head + area[3] / 2 - 24, 48, 48, { fit: 'contain', rotation: res.l === 'h' ? 0 : 90 }));
    L.push(T('Logo', brand().name || ' ', M, H - foot + 36, W - 2 * M, 28, { fill: ink, fontWeight: 700, align: 'center', fontFamily: 'Montserrat' }));
    await P10.makeDoc(W, H, 'Önce / sonra · ' + res.t, L, { type: 'solid', color: '#FAF8F3' }, {}, true);
    toast(ph[0] && ph[1] ? 'Önce / sonra hazır' : 'Hazır: fotoğraflara dokunup “Resmi değiştir” ile ekleyebilirsin');
  };

  // ================================================================ 9) BAĞIŞÇI DUVARI
  P10.donorWall = async function () {
    const res = await A().dialog(`<div class="d-body"><h3>${icon('heart')} Bağışçı duvarı</h3><p class="muted" style="font-size:13px;margin:0 0 10px">İsimler otomatik yerleşir ve sığacak kadar küçülür; çok isim varsa birden fazla görsel çıkar.</p>
      <label class="field"><span>İsimler (her satıra bir isim)</span><textarea class="inp" id="dwL" rows="8" placeholder="Ahmet Y.&#10;Ayşe K.&#10;Bir hayırsever"></textarea></label>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="dwT" value="Bu ay destek verenler"></label><label class="field" style="grid-column:1/-1"><span>Alt yazı</span><input class="inp" id="dwS" value="Hepinize gönülden teşekkür ederiz. Allah razı olsun."></label>
      <label class="field"><span>Ölçü</span><select class="inp" id="dwZ"><option value="1080x1350">Instagram 4:5</option><option value="1080x1920">Story</option><option value="1080x1080">Kare</option><option value="1240x1754">A4</option></select></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="dwGo">Hazırla</button></div>`, {
      onOpen: (box, close) => { $('#dwGo', box).onclick = () => { const n = $('#dwL', box).value.split('\n').map((s) => s.trim()).filter(Boolean); if (!n.length) return toast('İsim listesi boş', true); close({ n, t: $('#dwT', box).value, s: $('#dwS', box).value, z: $('#dwZ', box).value.split('x').map(Number) }); }; },
    });
    if (!res) return;
    const [W, H] = res.z, M = W * 0.07, ink = bcol(0, '#14532D'), acc = bcol(1, '#C9A227');
    const build = (names, page, pages) => {
      const L = [];
      L.push(Im('Süs · zemin', TH().mist(W, H, ink, 3), 0, 0, W, H, { fit: 'fill', locked: true, opacity: 0.35 }));
      L.push(Im('Simge', TH().icon('kalp2', acc), (W - W * 0.1) / 2, H * 0.06, W * 0.1, W * 0.1, { fit: 'contain' }));
      L.push(T('Başlık', res.t + (pages > 1 ? ` (${page}/${pages})` : ''), M, H * 0.06 + W * 0.13, W - 2 * M, W * 0.065, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: ink, align: 'center' }));
      L.push(Rc('Süs · çizgi', W / 2 - W * 0.08, H * 0.06 + W * 0.23, W * 0.16, 4, acc));
      const top = H * 0.06 + W * 0.27, bot = H - H * 0.12;
      const nl = T('İsimler', names.join('   •   '), M, top, W - 2 * M, W * 0.05, { fill: '#1F2937', align: 'center', lineHeight: 1.7, fontWeight: 600 });
      L.push(nl);
      L.push(T('Alt yazı', res.s, M, H - H * 0.1, W - 2 * M, W * 0.026, { fill: ink, align: 'center', italic: true, fontFamily: 'Crimson Pro' }));
      const d = docOf(W, H, L, { type: 'solid', color: '#FBFAF6' });
      const l = d.layers.find((x) => x.name === 'İsimler'), SEP = '   •   ';
      // isimleri satırlara biz dizeriz: nokta hiçbir zaman satır başında ya da sonunda kalmaz
      const pack = () => { const out = []; let cur = []; names.forEach((n) => { const t = [...cur, n].join(SEP); if (cur.length && R.measure(t, l) > l.w * 0.98) { out.push(cur.join(SEP)); cur = [n]; } else cur.push(n); }); if (cur.length) out.push(cur.join(SEP)); return out; };
      let lines = pack();
      for (let i = 0; i < 40 && lines.length * l.fontSize * l.lineHeight > bot - top && l.fontSize > W * 0.022; i++) { l.fontSize = Math.round(l.fontSize * 0.94); lines = pack(); }
      l.text = lines.join('\n').replace(/ /g, '\u00A0').replace(/\u00A0•\u00A0/g, ' • ').replace(/\u00A0\u00A0 • \u00A0\u00A0/g, '\u00A0\u00A0•\u00A0\u00A0');
      l.text = lines.map((ln) => ln.split(SEP).map((n) => n.replace(/ /g, '\u00A0')).join('\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0')).join('\n');
      R.layoutText(l); const used = l._lines.length * l.fontSize * l.lineHeight; l.h = r1(used); l.y = r1(top + Math.max(0, (bot - top - used) / 2));
      return { d, fits: used <= bot - top + 2 };
    };
    let chunks = [res.n];
    for (let k = 2; k < 20; k++) { if (chunks.every((c) => build(c, 1, chunks.length).fits)) break; const per = Math.ceil(res.n.length / k); chunks = []; for (let i = 0; i < res.n.length; i += per) chunks.push(res.n.slice(i, i + per)); }
    if (chunks.length === 1) { const { d } = build(chunks[0], 1, 1); await P10.makeDoc(W, H, res.t, d.layers, d.background, {}, true); return toast('Bağışçı duvarı hazır'); }
    const files = []; for (let i = 0; i < chunks.length; i++) { const { d } = build(chunks[i], i + 1, chunks.length); const pg = await jpgOf(d, 1); files.push({ name: `bagiscilar-${i + 1}.jpg`, data: new Uint8Array(await pg.blob.arrayBuffer()) }); if (!i) await P10.makeDoc(W, H, res.t + ' (1)', d.layers, d.background); }
    R.download(window.Tools.zip(files), 'bagisci-duvari.zip'); toast(`${res.n.length} isim ${chunks.length} görsele yerleşti (ZIP)`);
  };

  // ================================================================ 10) KOLAJ
  const LAYOUTS = {
    2: [[[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]], [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]]],
    3: [[[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]], [[0, 0, 1, 0.55], [0, 0.55, 0.5, 0.45], [0.5, 0.55, 0.5, 0.45]], [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]]],
    4: [[[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]], [[0, 0, 1, 0.6], [0, 0.6, 1 / 3, 0.4], [1 / 3, 0.6, 1 / 3, 0.4], [2 / 3, 0.6, 1 / 3, 0.4]], [[0, 0, 0.6, 1], [0.6, 0, 0.4, 1 / 3], [0.6, 1 / 3, 0.4, 1 / 3], [0.6, 2 / 3, 0.4, 1 / 3]]],
    5: [[[0, 0, 0.5, 0.6], [0.5, 0, 0.5, 0.6], [0, 0.6, 1 / 3, 0.4], [1 / 3, 0.6, 1 / 3, 0.4], [2 / 3, 0.6, 1 / 3, 0.4]], [[0, 0, 0.6, 0.5], [0.6, 0, 0.4, 0.5], [0, 0.5, 0.4, 0.5], [0.4, 0.5, 0.3, 0.5], [0.7, 0.5, 0.3, 0.5]]],
    6: [[[0, 0, 1 / 3, 0.5], [1 / 3, 0, 1 / 3, 0.5], [2 / 3, 0, 1 / 3, 0.5], [0, 0.5, 1 / 3, 0.5], [1 / 3, 0.5, 1 / 3, 0.5], [2 / 3, 0.5, 1 / 3, 0.5]], [[0, 0, 2 / 3, 2 / 3], [2 / 3, 0, 1 / 3, 1 / 3], [2 / 3, 1 / 3, 1 / 3, 1 / 3], [0, 2 / 3, 1 / 3, 1 / 3], [1 / 3, 2 / 3, 1 / 3, 1 / 3], [2 / 3, 2 / 3, 1 / 3, 1 / 3]]],
    7: [[[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.25, 0.5], [0.25, 0.5, 0.25, 0.25], [0.25, 0.75, 0.25, 0.25], [0.5, 0.5, 0.25, 0.5], [0.75, 0.5, 0.25, 0.5]]],
    8: [[[0, 0, 0.5, 0.5], [0.5, 0, 0.25, 0.25], [0.75, 0, 0.25, 0.25], [0.5, 0.25, 0.25, 0.25], [0.75, 0.25, 0.25, 0.25], [0, 0.5, 1 / 3, 0.5], [1 / 3, 0.5, 1 / 3, 0.5], [2 / 3, 0.5, 1 / 3, 0.5]]],
    9: [[...Array(9)].map((_, i) => [(i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3]), [[0, 0, 2 / 3, 2 / 3], [2 / 3, 0, 1 / 3, 1 / 3], [2 / 3, 1 / 3, 1 / 3, 1 / 3], [0, 2 / 3, 1 / 3, 1 / 3], [1 / 3, 2 / 3, 1 / 3, 1 / 3], [2 / 3, 2 / 3, 1 / 3, 1 / 3], [0, 2 / 3, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]].filter((b) => b[2] > 0).concat([[2 / 3, 2 / 3, 0, 0]]).slice(0, 6).length ? [...Array(9)].map((_, i) => [(i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3]) : []],
  };
  P10.collageLayers = function (n, li, W, H, gap, rad, photos, area) {
    const lay = (LAYOUTS[n] || LAYOUTS[4])[li] || LAYOUTS[n][0], [ax, ay, aw, ah] = area || [gap, gap, W - 2 * gap, H - 2 * gap];
    return lay.map(([x, y, w, h], i) => Im('Fotoğraf ' + (i + 1), photos[i] || PH(), ax + x * aw + gap / 2, ay + y * ah + gap / 2, w * aw - gap, h * ah - gap, { role: 'photo', radius: rad }));
  };
  P10.collage = async function () {
    let photos = [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('grid') || icon('layers')} Kolaj</h3>
      <div class="chips" id="clN">${[2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="chip ${n === 4 ? 'on' : ''}" data-n="${n}">${n} fotoğraf</button>`).join('')}</div>
      <div class="cl-lays" id="clL"></div>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:8px"><label class="field"><span>Ölçü</span><select class="inp" id="clZ"><option value="1080x1080">Kare</option><option value="1080x1350">4:5</option><option value="1080x1920">Story</option><option value="1240x1754">A4</option></select></label>
      <label class="field"><span>Zemin rengi</span><input type="color" id="clB" value="#FFFFFF"></label>
      <label class="field"><span>Boşluk</span><input type="range" id="clG" min="0" max="60" value="16"></label><label class="field"><span>Köşe yuvarlaklığı</span><input type="range" id="clR" min="0" max="80" value="16"></label></div>
      <div class="ss-pics" id="clP" style="margin-top:8px"><button class="ss-add" id="clAdd">${icon('plus')}<span>Fotoğraf ekle (isteğe bağlı)</span></button></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="clGo">Kolajı oluştur</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let n = 4, li = 0;
        const lays = () => { $('#clL', box).innerHTML = (LAYOUTS[n] || []).map((lay, i) => `<button class="cl-l ${i === li ? 'on' : ''}" data-i="${i}"><svg viewBox="0 0 100 100">${lay.map(([x, y, w, h]) => `<rect x="${x * 100 + 2}" y="${y * 100 + 2}" width="${w * 100 - 4}" height="${h * 100 - 4}" rx="4"/>`).join('')}</svg></button>`).join(''); };
        const draw = () => { $$('.ss-pic', box).forEach((x) => x.remove()); photos.forEach((u, i) => { const d = document.createElement('div'); d.className = 'ss-pic'; d.innerHTML = `<img alt="" src="${u}"><button data-rm="${i}">×</button>`; $('#clAdd', box).before(d); }); };
        $('#clN', box).onclick = (e) => { const b = e.target.closest('[data-n]'); if (!b) return; n = +b.dataset.n; li = 0; $$('#clN .chip', box).forEach((x) => x.classList.toggle('on', x === b)); lays(); };
        $('#clL', box).onclick = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; li = +b.dataset.i; lays(); };
        $('#clAdd', box).onclick = async () => { photos.push(...(await pickImages(true))); photos = photos.slice(0, 9); if (photos.length > n) { n = Math.min(9, photos.length); li = 0; $$('#clN .chip', box).forEach((x) => x.classList.toggle('on', +x.dataset.n === n)); lays(); } draw(); };
        $('#clP', box).onclick = (e) => { const b = e.target.closest('[data-rm]'); if (b) { photos.splice(+b.dataset.rm, 1); draw(); } };
        $('#clGo', box).onclick = () => { const [W, H] = $('#clZ', box).value.split('x').map(Number); close({ n, li, W, H, g: +$('#clG', box).value, r: +$('#clR', box).value, bg: $('#clB', box).value }); };
        lays();
      },
    });
    if (!res) return;
    const L = P10.collageLayers(res.n, res.li, res.W, res.H, res.g, res.r, photos, [res.g / 2, res.g / 2, res.W - res.g, res.H - res.g]);
    await P10.makeDoc(res.W, res.H, `Kolaj (${res.n} fotoğraf)`, L, { type: 'solid', color: res.bg }, {}, true);
    toast(photos.length >= res.n ? 'Kolaj hazır' : 'Kolaj hazır: boş kutulara dokunup “Resmi değiştir” ile fotoğraf ekleyebilirsin');
  };

  // ================================================================ 11) KURUMSAL KİMLİK PAKETİ
  P10.identity = async function () {
    const b = brand(), name = b.name || 'Kurum adı', c1 = bcol(0, '#14532D'), c2 = bcol(1, '#C9A227'), logo = b.logo || null;
    if (!(await A().confirmBox('Kurumsal kimlik paketi', `Marka sayfandaki bilgilerle (${name}${b.phone ? ', ' + b.phone : ''}) kartvizit, antetli kâğıt, zarf ve e-posta imzası hazırlanır. Eksik bilgileri sonra tasarımda düzeltebilirsin.`, 'Hazırla'))) return;
    const lines = [b.phone, b.email, b.web, b.address].filter(Boolean);
    const contact = lines.length ? lines.join('\n') : '0 (555) 000 00 00\nbilgi@kurum.org\nwww.kurum.org';
    const logoL = (x, y, s, light) => logo ? Im('Logo', logo, x, y, s, s, { fit: 'contain' }) : T('Logo', name.split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toLocaleUpperCase('tr-TR'), x, y + s * 0.18, s, s * 0.5, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: light ? '#FFFFFF' : c1, align: 'center' });
    const out = [];
    // kartvizit 85×55 mm (≈ 1004×650 @300dpi)
    { const W = 1004, H = 650, L = []; L.push(Rc('Sol bant', 0, 0, W * 0.36, H, c1)); L.push(logoL(W * 0.08, H * 0.26, W * 0.2, true)); L.push(T('Ad', name, W * 0.42, H * 0.18, W * 0.52, 44, { fontWeight: 700, fill: c1, fontFamily: 'Montserrat' })); L.push(Rc('Süs · çizgi', W * 0.42, H * 0.34, 80, 5, c2)); L.push(T('İletişim', contact, W * 0.42, H * 0.42, W * 0.54, 24, { fill: '#374151', lineHeight: 1.6 })); out.push(['Kartvizit · ön', W, H, L, '#FFFFFF']); }
    { const W = 1004, H = 650, L = []; L.push(Im('Süs · desen', TH().girih ? TH().girih(W, H, 'rgba(255,255,255,0.08)') : PH(), 0, 0, W, H, { fit: 'fill', locked: true })); L.push(logoL(W * 0.4, H * 0.24, W * 0.2, true)); L.push(T('Ad', name, W * 0.1, H * 0.62, W * 0.8, 40, { fontWeight: 700, fill: '#FFFFFF', align: 'center', fontFamily: 'Montserrat' })); out.push(['Kartvizit · arka', W, H, L, c1]); }
    // antetli kâğıt A4
    { const W = 1240, H = 1754, M = 100, L = []; L.push(logoL(M, 70, 110)); L.push(T('Ad', name, M + 140, 92, W * 0.5, 36, { fontWeight: 700, fill: c1, fontFamily: 'Montserrat' })); L.push(Rc('Üst çizgi', M, 210, W - 2 * M, 3, c2)); L.push(T('Metin', 'Tarih: ....../....../..........\n\nSayın ilgili,\n\nMetninizi buraya yazın.', M, 280, W - 2 * M, 26, { fill: '#1F2937', lineHeight: 1.6, fontWeight: 400 })); L.push(Rc('Alt bant', 0, H - 110, W, 110, c1)); L.push(T('İletişim', lines.join('   •   ') || 'Telefon   •   E-posta   •   Web   •   Adres', M, H - 74, W - 2 * M, 20, { fill: '#FFFFFF', align: 'center' })); out.push(['Antetli kâğıt', W, H, L, '#FFFFFF']); }
    // zarf DL 220×110
    { const W = 2598, H = 1299, L = []; L.push(logoL(90, 80, 160)); L.push(T('Ad', name, 280, 110, 900, 48, { fontWeight: 700, fill: c1, fontFamily: 'Montserrat' })); L.push(T('İletişim', lines.slice(0, 3).join('\n') || ' ', 280, 180, 900, 26, { fill: '#4B5563', lineHeight: 1.5 })); L.push(Rc('Alt şerit', 0, H - 40, W, 40, c1)); L.push(T('Alıcı', 'Sayın ...............................\n.............................................\n.............................................', W * 0.55, H * 0.5, W * 0.38, 36, { fill: '#1F2937', lineHeight: 1.7 })); out.push(['Zarf (DL)', W, H, L, '#FFFFFF']); }
    // e-posta imzası 1200×320
    { const W = 1200, H = 320, L = []; L.push(logoL(40, 60, 200)); L.push(Rc('Ayraç', 280, 60, 4, 200, c2)); L.push(T('Ad', name, 320, 66, 840, 46, { fontWeight: 700, fill: c1, fontFamily: 'Montserrat' })); L.push(T('İletişim', lines.join('\n') || ' ', 320, 132, 840, 26, { fill: '#4B5563', lineHeight: 1.45 })); out.push(['E-posta imzası', W, H, L, '#FFFFFF']); }
    const pr = busy('Kimlik paketi hazırlanıyor…'), files = []; let first = null;
    try {
      for (const [n, W, H, L, bg] of out) { const p = await P10.makeDoc(W, H, `${name} · ${n}`, L, { type: 'solid', color: bg }, { folder: 'Kurumsal kimlik' }); first = first || p; const pg = await jpgOf(A().designOf ? A().designOf(p) : p, 1); files.push({ name: slug(n) + '.jpg', data: new Uint8Array(await pg.blob.arrayBuffer()) }); }
      const html = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif"><tr><td style="padding-right:14px;border-right:3px solid ${c2}">${logo ? `<img src="${logo}" width="72" alt="${esc(name)}">` : `<b style="font-size:22px;color:${c1}">${esc(name)}</b>`}</td><td style="padding-left:14px"><b style="font-size:16px;color:${c1}">${esc(name)}</b><br>${lines.map((l) => `<span style="font-size:13px;color:#4B5563">${esc(l)}</span>`).join('<br>')}</td></tr></table>`;
      files.push({ name: 'eposta-imzasi.html', data: new TextEncoder().encode(`<!doctype html><meta charset="utf-8">${html}`) });
      R.download(window.Tools.zip(files), slug(name) + '-kimlik.zip');
      toast('Kimlik paketi hazır: 5 tasarım Projeler’de “Kurumsal kimlik” klasöründe; ZIP’te görseller ve e-posta imzası (HTML) var');
      if (first) { A().S.project = first; A().go('editor', first.id); }
    } catch (e) { toast('Paket hazırlanamadı: ' + e.message, true); }
    pr.remove();
  };

  // ================================================================ 12) INSTAGRAM IZGARA ÖNİZLEMESİ
  P10.igGrid = async function () {
    let ps = []; try { ps = (await A().api('projects')).filter((p) => p.thumb); } catch (e) {}
    if (!ps.length) return toast('Önizlenecek proje yok', true);
    const pick = ps.slice(0, 9).map((p) => p.id);
    A().dialog(`<div class="d-body"><h3>${icon('grid') || icon('layers')} Instagram ızgara önizlemesi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Profilinde yan yana nasıl görüneceğini gör. Sırayı değiştirmek için alttan projelere dokun (en yeni sol üstte).</p>
      <div class="ig-wrap"><div class="ig-prof" id="igV"></div><div><div class="ig-note" id="igN"></div><div class="cmp-pick" id="igP" style="max-height:44vh">${ps.slice(0, 40).map((p) => `<button class="cmp-it ${pick.includes(p.id) ? 'on' : ''}" data-id="${p.id}"><img alt="" src="${p.thumb}"><small>${esc(p.name || 'Adsız')}</small></button>`).join('')}</div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="igDl">${icon('download')}Önizlemeyi indir</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const avg = async (u) => { try { const im = await createImageBitmap(await (await fetch(u)).blob()); const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 16, 16); const d = x.getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; } const n = d.length / 4; return [r / n, g / n, b / n]; } catch (e) { return null; } };
        const draw = async () => {
          const items = pick.map((id) => ps.find((p) => p.id === id)).filter(Boolean);
          const b = brand();
          $('#igV', box).innerHTML = `<div class="ig-head"><span class="ig-av">${b.logo ? `<img alt="" src="${b.logo}">` : esc((b.name || 'K')[0])}</span><div><b>${esc((b.name || 'kurum').toLocaleLowerCase('tr-TR').replace(/\s+/g, ''))}</b><small>${items.length} gönderi</small></div></div><div class="ig-grid">${items.map((p) => `<div style="background-image:url('${p.thumb}')"></div>`).join('')}</div>`;
          const cs = (await Promise.all(items.map((p) => avg(p.thumb)))).filter(Boolean);
          if (cs.length > 2) { const lum = cs.map(([r, g, bb]) => 0.3 * r + 0.59 * g + 0.11 * bb), m = lum.reduce((a, v) => a + v, 0) / lum.length, sd = Math.sqrt(lum.reduce((a, v) => a + (v - m) ** 2, 0) / lum.length); $('#igN', box).innerHTML = sd < 35 ? '✓ <b>Uyumlu görünüyor:</b> paylaşımların ışık ve ton olarak birbirine yakın.' : sd < 60 ? '<b>Orta uyum:</b> bazı paylaşımlar diğerlerinden belirgin şekilde açık ya da koyu. Aynı stil setini kullanmak bütünlüğü artırır.' : '<b>Dağınık görünebilir:</b> açık ve koyu paylaşımlar karışık. Sırayı değiştirerek (açık-koyu dönüşümlü) ya da ortak renk kullanarak düzeltebilirsin.'; }
        };
        $('#igP', box).onclick = (e) => { const b = e.target.closest('[data-id]'); if (!b) return; const i = pick.indexOf(b.dataset.id); if (i >= 0) pick.splice(i, 1); else if (pick.length < 12) pick.unshift(b.dataset.id); $$('.cmp-it', box).forEach((x) => x.classList.toggle('on', pick.includes(x.dataset.id))); draw(); };
        $('#igDl', box).onclick = async () => {
          const items = pick.map((id) => ps.find((p) => p.id === id)).filter(Boolean), S = 360, g = 4, cols = 3, rows = Math.ceil(items.length / cols), c = document.createElement('canvas'); c.width = cols * S + (cols - 1) * g; c.height = rows * S + (rows - 1) * g; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
          for (let i = 0; i < items.length; i++) { try { const im = await createImageBitmap(await (await fetch(items[i].thumb)).blob()); const k = Math.max(S / im.width, S / im.height), w = im.width * k, h = im.height * k; x.save(); x.beginPath(); x.rect((i % cols) * (S + g), Math.floor(i / cols) * (S + g), S, S); x.clip(); x.drawImage(im, (i % cols) * (S + g) + (S - w) / 2, Math.floor(i / cols) * (S + g) + (S - h) / 2, w, h); x.restore(); } catch (e) {} }
          c.toBlob((bl) => R.download(bl, 'instagram-izgara.png'), 'image/png');
        };
        draw();
      },
    });
  };

  // ================================================================ 13) GIF (animasyonlu tasarımdan)
  // küçük, bağımsız GIF kodlayıcı (median-cut palet + LZW)
  function quantize(pix, max = 256) {
    const pts = []; for (let i = 0; i < pix.length; i += 4 * 3) pts.push([pix[i], pix[i + 1], pix[i + 2]]);
    let boxes = [pts];
    while (boxes.length < max) {
      let bi = -1, br = -1, ch = 0;
      boxes.forEach((b, i) => { if (b.length < 2) return; for (let c = 0; c < 3; c++) { let mn = 255, mx = 0; for (const p of b) { if (p[c] < mn) mn = p[c]; if (p[c] > mx) mx = p[c]; } if (mx - mn > br) { br = mx - mn; bi = i; ch = c; } } });
      if (bi < 0 || br < 2) break;
      const b = boxes[bi].sort((p, q) => p[ch] - q[ch]), mid = b.length >> 1;
      boxes.splice(bi, 1, b.slice(0, mid), b.slice(mid));
    }
    const pal = boxes.map((b) => { let r = 0, g = 0, bl = 0; b.forEach((p) => { r += p[0]; g += p[1]; bl += p[2]; }); const n = b.length || 1; return [Math.round(r / n), Math.round(g / n), Math.round(bl / n)]; });
    while (pal.length < 256) pal.push([0, 0, 0]);
    return pal;
  }
  function gifEncode(frames, W, H, delayCs) {
    const out = []; const w8 = (b) => out.push(b & 255), w16 = (v) => { out.push(v & 255, (v >> 8) & 255); }, ws = (s) => { for (const c of s) out.push(c.charCodeAt(0)); };
    // tek palet: ilk, orta ve son kareden
    const smp = []; [0, frames.length >> 1, frames.length - 1].forEach((i) => { const f = frames[i]; for (let k = 0; k < f.length; k += 4 * 7) smp.push(f[k], f[k + 1], f[k + 2], 255); });
    const pal = quantize(Uint8ClampedArray.from(smp), 256);
    const cache = new Map();
    const near = (r, g, b) => { const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2); let v = cache.get(key); if (v !== undefined) return v; let bi = 0, bd = 1e9; for (let i = 0; i < 256; i++) { const p = pal[i], d = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2; if (d < bd) { bd = d; bi = i; } } cache.set(key, bi); return bi; };
    ws('GIF89a'); w16(W); w16(H); w8(0xF7); w8(0); w8(0);
    pal.forEach((p) => out.push(p[0], p[1], p[2]));
    ws('!'); w8(0xFF); w8(11); ws('NETSCAPE2.0'); w8(3); w8(1); w16(0); w8(0);
    for (const f of frames) {
      w8(0x21); w8(0xF9); w8(4); w8(0); w16(delayCs); w8(0); w8(0);
      w8(0x2C); w16(0); w16(0); w16(W); w16(H); w8(0);
      const idx = new Uint8Array(W * H); for (let i = 0, j = 0; i < idx.length; i++, j += 4) idx[i] = near(f[j], f[j + 1], f[j + 2]);
      // LZW
      const minCode = 8, clear = 256, eoi = 257; w8(minCode);
      let codeSize = 9, next = 258, dict = new Map(), bits = 0, nb = 0; const bytes = [];
      const emit = (code) => { bits |= code << nb; nb += codeSize; while (nb >= 8) { bytes.push(bits & 255); bits >>>= 8; nb -= 8; } };
      emit(clear); let prev = idx[0];
      for (let i = 1; i < idx.length; i++) {
        const k = idx[i], key = prev * 4096 + k, v = dict.get(key);
        if (v !== undefined) { prev = v; continue; }
        emit(prev);
        if (next < 4096) { dict.set(key, next++); if (next > (1 << codeSize) && codeSize < 12) codeSize++; }
        else { emit(clear); dict = new Map(); next = 258; codeSize = 9; }
        prev = k;
      }
      emit(prev); emit(eoi); if (nb > 0) bytes.push(bits & 255);
      for (let i = 0; i < bytes.length; i += 255) { const n = Math.min(255, bytes.length - i); w8(n); for (let j = 0; j < n; j++) out.push(bytes[i + j]); }
      w8(0);
    }
    w8(0x3B);
    return new Blob([new Uint8Array(out)], { type: 'image/gif' });
  }
  P10.gifEncode = gifEncode;
  P10.gif = async function () {
    const e = E(); if (!e || !e.state.buildFrames) return toast('Önce bir tasarım aç', true);
    const pr = busy('GIF hazırlanıyor…');
    try {
      if (!e.doc.layers.some((l) => l.anim && l.anim.type && l.anim.type !== 'none')) { e.autoAnimate(); e.commit(); }
      const scale = Math.min(1, 480 / Math.max(e.doc.width, e.doc.height));
      const F = await e.state.buildFrames(scale), fps = 12, n = Math.min(120, Math.ceil(F.total * fps)) + Math.round(fps * 1.2);
      const c = document.createElement('canvas'); c.width = F.W; c.height = F.H; const x = c.getContext('2d', { willReadFrequently: true });
      const frames = [];
      for (let i = 0; i < n; i++) { const t = Math.min(F.total, i / fps); x.clearRect(0, 0, F.W, F.H); F.drawAt(x, t); frames.push(x.getImageData(0, 0, F.W, F.H).data); if (i % 10 === 0) { pr.textContent = `GIF hazırlanıyor… ${Math.round((i / n) * 60)}%`; await sleep(0); } }
      pr.textContent = 'GIF sıkıştırılıyor…'; await sleep(30);
      const blob = gifEncode(frames, F.W, F.H, Math.round(100 / fps));
      R.download(blob, slug(e.doc.name || 'tasarim') + '.gif');
      toast(`GIF hazır (${(blob.size / 1048576).toFixed(1)} MB, ${F.W}×${F.H})`);
    } catch (er) { toast('GIF hazırlanamadı: ' + er.message, true); }
    pr.remove();
  };

  // ================================================================ 14) İÇERİK PLANLAYICI
  P10.plan = () => LS.get('ts_plan', {});
  P10.planner = async function () {
    let ps = []; try { ps = await A().api('projects'); } catch (e) {}
    const plan = P10.plan(); let cur = new Date(); cur.setDate(1); let sel = null, dir = 0;
    const evs = () => [...window.P7.hijriEvents(cur.getFullYear()), ...window.P7.hijriEvents(cur.getFullYear() + 1)];
    const DN = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    A().dialog(`<div class="d-body pl-body"><h3>${icon('calendar')} İçerik planlayıcı</h3>
      <div class="pl-steps"><span><i>1</i>Alttan tasarım seç</span><span><i>2</i>Güne dokun</span><span><i>3</i>Takvime aktar, hatırlatma al</span></div>
      <div class="pl-head"><button class="pl-nav" id="plPrev" aria-label="Önceki ay">‹</button><div class="pl-title"><b id="plM"></b><small id="plC"></small></div><button class="pl-nav" id="plNext" aria-label="Sonraki ay">›</button><span style="flex:1"></span><button class="btn sm" id="plToday">Bugün</button><button class="btn sm primary" id="plIcs">${icon('calendar')}Takvime aktar</button></div>
      <div class="pl-wrap"><div class="pl-grid" id="plG"></div></div>
      <div class="pl-legend"><span><i class="lg-ev"></i>Mübarek gün</span><span><i class="lg-today"></i>Bugün</span><span><i class="lg-plan"></i>Planlı paylaşım</span></div>
      <div class="pl-srch"><b>${icon('layers')} Tasarımların</b><small id="plSel">Bir tasarıma dokun</small></div>
      <div class="pl-src" id="plS">${ps.slice(0, 40).map((p) => `<button class="pl-p" data-id="${p.id}" title="${esc(p.name || '')}"><span class="pl-pt">${p.thumb ? `<img alt="" src="${p.thumb}" loading="lazy">` : icon('image')}</span><small>${esc(p.name || 'Adsız')}</small></button>`).join('') || '<p class="muted" style="font-size:13px">Henüz tasarım yok.</p>'}</div></div>
      <div class="d-foot"><button class="btn primary" data-close>Tamam</button></div>`, {
      cls: 'wide pl-dialog',
      onOpen: (box) => {
        const draw = () => {
          $('#plM', box).textContent = `${TRM[cur.getMonth()]} ${cur.getFullYear()}`;
          const first = (cur.getDay() + 6) % 7, n = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate(), E2 = evs(), today = ymd(new Date());
          let h = DN.map((d, i) => `<div class="pl-dn ${i > 4 ? 'we' : ''}">${d}</div>`).join(''), cnt = 0;
          for (let i = 0; i < first; i++) h += '<div class="pl-c empty"></div>';
          for (let d = 1; d <= n; d++) {
            const dt = new Date(cur.getFullYear(), cur.getMonth(), d, 12), s = ymd(dt), ev = E2.find((e) => e.date === s), items = (plan[s] || []).map((id) => ps.find((p) => p.id === id)).filter(Boolean), we = [0, 6].includes(dt.getDay());
            cnt += items.length;
            h += `<div class="pl-c ${s === today ? 'today' : ''} ${ev ? 'ev' : ''} ${we ? 'we' : ''} ${items.length ? 'has' : ''} ${s < today ? 'past' : ''}" data-d="${s}" style="--i:${d}"><span class="pl-n">${d}</span>${ev ? `<em title="${esc(ev.name)}">${icon(/Kandil|Kadir|Mevlid|Berat|Regaib|Mira/.test(ev.name) ? 'moon' : 'star')}<span>${esc(ev.name)}</span></em>` : ''}<div class="pl-items">${items.map((p) => `<button class="pl-i" data-rm="${p.id}" title="${esc(p.name || '')} — kaldırmak için dokun">${p.thumb ? `<img alt="" src="${p.thumb}">` : esc((p.name || '?')[0])}</button>`).join('')}</div></div>`;
          }
          const g = $('#plG', box); g.innerHTML = h;
          $('#plC', box).textContent = cnt ? `${cnt} planlı paylaşım` : 'Bu ay plan yok';
          g.classList.remove('slide-l', 'slide-r'); void g.offsetWidth; if (dir) g.classList.add(dir > 0 ? 'slide-l' : 'slide-r'); dir = 0;
        };
        $('#plPrev', box).onclick = () => { cur.setMonth(cur.getMonth() - 1); dir = -1; draw(); };
        $('#plNext', box).onclick = () => { cur.setMonth(cur.getMonth() + 1); dir = 1; draw(); };
        $('#plToday', box).onclick = () => { const t = new Date(); dir = (t.getFullYear() * 12 + t.getMonth()) - (cur.getFullYear() * 12 + cur.getMonth()); cur = new Date(t.getFullYear(), t.getMonth(), 1); draw(); };
        $('#plS', box).onclick = (e) => { const b = e.target.closest('[data-id]'); if (!b) return; sel = sel === b.dataset.id ? null : b.dataset.id; $$('.pl-p', box).forEach((x) => x.classList.toggle('on', x.dataset.id === sel)); box.classList.toggle('pl-picking', !!sel); $('#plSel', box).textContent = sel ? 'Şimdi paylaşacağın güne dokun' : 'Bir tasarıma dokun'; };
        $('#plG', box).onclick = (e) => {
          const rm = e.target.closest('[data-rm]'), c = e.target.closest('[data-d]'); if (!c) return; const s = c.dataset.d;
          if (rm) { plan[s] = (plan[s] || []).filter((x) => x !== rm.dataset.rm); if (!plan[s].length) delete plan[s]; }
          else if (sel) { plan[s] = [...new Set([...(plan[s] || []), sel])]; }
          else { $('#plS', box).classList.remove('shake'); void $('#plS', box).offsetWidth; $('#plS', box).classList.add('shake'); return toast('Önce alttan bir tasarım seç'); }
          LS.set('ts_plan', plan); draw();
          const nc = $(`[data-d="${s}"]`, box); if (nc && !rm) nc.classList.add('pop');
        };
        $('#plIcs', box).onclick = () => {
          const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tasarim Studyosu//TR', 'X-WR-CALNAME:İçerik planı']; const st = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); let n = 0;
          Object.entries(plan).forEach(([s, ids]) => ids.forEach((id) => { const p = ps.find((x) => x.id === id); if (!p) return; const dd = s.replace(/-/g, ''); L.push('BEGIN:VEVENT', `UID:ts-plan-${dd}-${id}@tasarim`, `DTSTAMP:${st}`, `DTSTART:${dd}T090000`, `DTEND:${dd}T091500`, `SUMMARY:Paylaş: ${String(p.name || 'tasarım').replace(/[,;]/g, ' ')}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Paylaşım zamanı', 'TRIGGER:-PT30M', 'END:VALARM', 'END:VEVENT'); n++; }));
          L.push('END:VCALENDAR'); if (!n) return toast('Planda henüz tasarım yok', true);
          R.download(new Blob([L.join('\r\n')], { type: 'text/calendar' }), 'icerik-plani.ics'); toast(`${n} paylaşım takvim dosyasına yazıldı; açınca telefonun takvimine eklenir`);
        };
        draw();
      },
    });
  };
  // bugün planlanan paylaşım varsa hatırlat
  setTimeout(() => { try { const s = ymd(new Date()), ids = P10.plan()[s] || []; if (ids.length && LS.get('ts_plan_note', '') !== s) { LS.set('ts_plan_note', s); toast(`Bugün planında ${ids.length} paylaşım var (İçerik planlayıcı)`); window.P9 && window.P9.notify('Bugünün paylaşımı', `Planında ${ids.length} tasarım var`); } } catch (e) {} }, 7000);

  // ================================================================ 15) ERİŞİLEBİLİRLİK
  const CB = { 'Kırmızı körlüğü (protanopi)': [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758], 'Yeşil körlüğü (döteranopi)': [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7], 'Mavi körlüğü (tritanopi)': [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525], 'Renk görmeme (gri)': [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] };
  P10.a11y = async function () {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const d = e.doc, b = await R.exportBlob(d, 'png', Math.min(1, 480 / Math.max(d.width, d.height))), im = await createImageBitmap(b);
    const sims = Object.entries(CB).map(([n, m]) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), p = id.data; for (let i = 0; i < p.length; i += 4) { const r = p[i], g = p[i + 1], bb = p[i + 2]; p[i] = r * m[0] + g * m[1] + bb * m[2]; p[i + 1] = r * m[3] + g * m[4] + bb * m[5]; p[i + 2] = r * m[6] + g * m[7] + bb * m[8]; } x.putImageData(id, 0, 0); return [n, c.toDataURL('image/jpeg', 0.85)]; });
    const iss = [];
    const phoneW = 390, k = phoneW / d.width;
    d.layers.filter((l) => l.type === 'text' && l.visible !== false && R.plain(l.text).trim() && !/^Süs/.test(l.name || '')).forEach((l) => { const px = l.fontSize * k; if (px < 10.5) iss.push(['warn', `“${l.name}” telefonda çok küçük kalır (~${px.toFixed(1)} px). En az ${Math.ceil(11 / k)} punto önerilir.`]); });
    if (window.Coach && window.Coach.analyze) { try { (await window.Coach.analyze(d)).filter((i) => i.k === 'contrast').forEach((i) => iss.push(['err', i.text || i.msg || 'Düşük kontrast: yazı zeminden yeterince ayrılmıyor'])); } catch (er) {} }
    const redGreen = (() => { const fills = d.layers.filter((l) => l.visible !== false).map((l) => (typeof l.fill === 'string' ? R.toHex(l.fill) : null)).filter(Boolean); const hue = (h) => { const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), bb = parseInt(h.slice(5, 7), 16), mx = Math.max(r, g, bb), mn = Math.min(r, g, bb); if (mx - mn < 40) return null; let H0 = mx === r ? (g - bb) / (mx - mn) : mx === g ? 2 + (bb - r) / (mx - mn) : 4 + (r - g) / (mx - mn); H0 *= 60; if (H0 < 0) H0 += 360; return H0; }; const hs = fills.map(hue).filter((x) => x != null); return hs.some((h) => h < 20 || h > 340) && hs.some((h) => h > 90 && h < 150); })();
    if (redGreen) iss.push(['warn', 'Kırmızı ve yeşil birlikte kullanılmış: renk körü kişiler (her 12 erkekten 1’i) bu iki rengi ayırt edemeyebilir. Önemli bilgiyi yalnızca renkle değil, yazıyla da ver.']);
    A().dialog(`<div class="d-body"><h3>${icon('eye')} Erişilebilirlik kontrolü</h3>
      <div class="a11y-g">${sims.map(([n, u]) => `<figure><img alt="" src="${u}"><figcaption>${esc(n)}</figcaption></figure>`).join('')}</div>
      <h4 style="margin:14px 0 6px">${iss.length ? iss.length + ' öneri' : '✓ Sorun bulunmadı'}</h4>
      <div class="sp-list">${iss.map(([s, t]) => `<div class="sp-it"><div><b style="color:${s === 'err' ? '#ef4444' : '#f59e0b'}">${s === 'err' ? 'Önemli' : 'Öneri'}</b><small style="white-space:normal">${esc(t)}</small></div></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, { cls: 'wide' });
  };
})();
