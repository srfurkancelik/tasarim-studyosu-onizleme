/* Tasarım Stüdyosu v6.2 — toplu belge + PDF, simge kütüphanesi, söz/ayet/hadis/dua kütüphanesi (Arapça dahil),
   desen zemini, mockup, slayt video, geri sayım, etiket sayfası, broşür, metin yardımcısı, yazım denetimi,
   alternatif öneriler, tasarım karşılaştırma, otomatik hazırlıklar, yedekleme, geri dönüşüm kutusu, bildirim,
   polaroid, WhatsApp paketi */
(function () {
  const P9 = (window.P9 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi, TH = () => window.FoodTheme, L = () => window.Library;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const r1 = (v) => Math.round(v * 10) / 10;
  const isAdmin = () => !window.Users || window.Users.isAdmin();
  const needDoc = () => { const e = E(); if (!e) toast('Önce bir tasarım aç', true); return e; };
  const blobToDataURL = (b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
  const slug = (s) => String(s || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-').replace(/^-|-$/g, '') || 'tasarim';
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const TRM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const trDate = (d) => `${d.getDate()} ${TRM[d.getMonth()]} ${d.getFullYear()}`;
  async function uploadData(dataUrl, name) { try { const r = await A().api('upload', { body: { data: dataUrl, name } }); return r.url; } catch (e) { return dataUrl; } }

  // tasarımdaki en koyu yazı rengi (beyaz zemin üstünde okunur)
  P9.darkInk = function (d) { const lum = (h) => { try { return window.Tools.lum(R.toHex(h)); } catch (e) { return 1; } }; const cs = (d.layers || []).filter((l) => l.type === 'text' && typeof l.fill === 'string').map((l) => l.fill).sort((a, b) => lum(a) - lum(b)); return cs[0] && lum(cs[0]) < 0.45 ? cs[0] : '#1F2937'; };
  // yazıların ve logonun üstüne binmeyen boş yer (köşeler, kenar ortaları, merkez)
  P9.freeSpot = function (d, bw, bh) {
    const mx = d.width * 0.05, my = d.height * 0.04;
    const spots = [[d.width - bw - mx, my], [mx, my], [d.width - bw - mx, d.height - bh - my], [mx, d.height - bh - my], [(d.width - bw) / 2, my], [(d.width - bw) / 2, d.height - bh - my], [d.width - bw - mx, (d.height - bh) / 2], [mx, (d.height - bh) / 2], [(d.width - bw) / 2, (d.height - bh) / 2]];
    // yazılarda kutunun tamamı değil, görünen satırların genişliği sayılır
    const box = (l) => { if (l.type !== 'text' || !l._lines || !l._lines.length) return [l.x, l.y, l.w, l.h]; const tw = Math.min(l.w, Math.max(...l._lines.map((ln) => R.measure(ln.replace(/\t/g, ' '), l)))); const x = l.align === 'center' ? l.x + (l.w - tw) / 2 : l.align === 'right' ? l.x + l.w - tw : l.x; return [x, l.y, tw, l.h]; };
    const ov = (ax, ay) => d.layers.reduce((sum, l) => { if (l.visible === false || /^Süs|zemin|Desen/i.test(l.name || '')) return sum; const big = l.w * l.h > d.width * d.height * 0.45; const wgt = l.type === 'text' ? 1 : /logo|simge|qr|sayaç|bilgi/i.test(l.name || '') ? 1 : big ? 0 : l.type === 'image' ? 0.3 : 0.15; if (!wgt) return sum; const [lx0, ly0, lw0, lh0] = box(l), pad = Math.min(d.width, d.height) * 0.02, lx = lx0 - pad, ly = ly0 - pad, lw = lw0 + 2 * pad, lh = lh0 + 2 * pad; const ix = Math.max(0, Math.min(ax + bw, lx + lw) - Math.max(ax, lx)), iy = Math.max(0, Math.min(ay + bh, ly + lh) - Math.max(ay, ly)); return sum + ix * iy * wgt; }, 0);
    for (let gy = 0.12; gy < 0.9; gy += 0.08) for (const gx of [mx, (d.width - bw) / 2, d.width - bw - mx]) spots.push([gx, d.height * gy]);
    let best = spots[0], bs = Infinity; spots.forEach((sp, i) => { if (sp[1] + bh > d.height - my * 0.5) return; const v = ov(sp[0], sp[1]) + i * 2; if (v < bs) { bs = v; best = sp; } });
    return best;
  };
  // görsel olarak en sakin yer: tasarımı küçük çizip aday kutulardaki kenar yoğunluğunu ölç
  P9.quietSpot = async function (d, bw, bh) {
    try {
      // süs, desen ve zemin fotoğrafları "dolu" sayılmaz: üstlerine rozet konabilir
      const d2 = JSON.parse(JSON.stringify(d)); d2.layers.forEach((l) => { if (/^Süs|desen|zemin|doku/i.test(l.name || '') || (l.type === 'image' && l.w * l.h > d.width * d.height * 0.3)) l.visible = false; });
      const k = 160 / Math.max(d.width, d.height), b = await R.exportBlob(d2, 'png', k), im = await createImageBitmap(b);
      const W = im.width, H = im.height, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const px = x.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
      for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) { const i = (y * W + xx) * 4, L = (j) => px[j] * 0.3 + px[j + 1] * 0.59 + px[j + 2] * 0.11; g[y * W + xx] = Math.abs(L(i + 4) - L(i - 4)) + Math.abs(L(i + W * 4) - L(i - W * 4)); }
      const S = new Float64Array((W + 1) * (H + 1)); for (let y = 0; y < H; y++) { let row = 0; for (let xx = 0; xx < W; xx++) { row += g[y * W + xx]; S[(y + 1) * (W + 1) + xx + 1] = S[y * (W + 1) + xx + 1] + row; } }
      const sum = (x0, y0, w, h) => { x0 = Math.max(0, Math.round(x0)); y0 = Math.max(0, Math.round(y0)); const x1 = Math.min(W, Math.round(x0 + w)), y1 = Math.min(H, Math.round(y0 + h)); return S[y1 * (W + 1) + x1] - S[y0 * (W + 1) + x1] - S[y1 * (W + 1) + x0] + S[y0 * (W + 1) + x0]; };
      const mx = d.width * 0.04, my = d.height * 0.03; let best = null, bs = Infinity;
      const xs = [], ys = []; for (let t = 0; t <= 1.0001; t += 0.1) { xs.push(mx + (d.width - bw - 2 * mx) * t); ys.push(my + (d.height - bh - 2 * my) * t); }
      xs.forEach((ax, i) => ys.forEach((ay, j) => { const corner = (i === 0 || i === xs.length - 1) && (j === 0 || j === ys.length - 1); const v = sum(ax * k, ay * k, bw * k, bh * k) * (corner ? 0.85 : 1); if (v < bs) { bs = v; best = [ax, ay]; } }));
      return best || P9.freeSpot(d, bw, bh);
    } catch (e) { return P9.freeSpot(d, bw, bh); }
  };
  // ================================================================ JPEG’lerden çok sayfalı PDF (kendi küçük PDF yazıcımız)
  P9.pdfFromJpegs = async function (pages) {
    // pages: [{ blob (image/jpeg), w, h }]; sayfa ölçüsü: uzun kenar A4 (842 pt)
    const enc = new TextEncoder(), parts = [], offs = [];
    let len = 0; const push = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); len += u.length; };
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const n = pages.length, objs = [];
    // 1: katalog, 2: sayfalar, sonra her sayfa için 3 nesne (sayfa, içerik, görsel)
    const pageIds = pages.map((_, i) => 3 + i * 3);
    objs.push(['1', `<< /Type /Catalog /Pages 2 0 R >>`]);
    objs.push(['2', `<< /Type /Pages /Kids [${pageIds.map((id) => id + ' 0 R').join(' ')}] /Count ${n} >>`]);
    for (let i = 0; i < n; i++) {
      const pg = pages[i], k = 842 / Math.max(pg.w, pg.h), pw = r1(pg.w * k), ph = r1(pg.h * k), id = pageIds[i];
      const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im${i} Do Q`;
      objs.push([String(id), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${i} ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`]);
      objs.push([String(id + 1), `<< /Length ${content.length} >>\nstream\n${content}\nendstream`]);
      objs.push([String(id + 2), { img: new Uint8Array(await pg.blob.arrayBuffer()), w: pg.w, h: pg.h }]);
    }
    objs.sort((a, b) => +a[0] - +b[0]);
    for (const [id, body] of objs) {
      offs[+id] = len;
      if (typeof body === 'string') push(`${id} 0 obj\n${body}\nendobj\n`);
      else { push(`${id} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${body.w} /Height ${body.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${body.img.length} >>\nstream\n`); push(body.img); push('\nendstream\nendobj\n'); }
    }
    const xref = len, cnt = objs.length + 1;
    let x = `xref\n0 ${cnt}\n0000000000 65535 f \n`;
    for (let i = 1; i < cnt; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + `trailer\n<< /Size ${cnt} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  };
  const jpegPage = async (d, scale = 1) => { const b = await R.exportBlob(d, 'jpg', scale); const im = await createImageBitmap(b); return { blob: b, w: im.width, h: im.height }; };

  // ================================================================ 1) TOPLU BELGE: listeden herkese adlı sertifika / davetiye
  P9.batch = async function (startId) {
    const tpls = L().templates.filter((t) => t.buildAt && (t.cat === 'Eğitim' || (isAdmin() && ['b-tesekkur', 'b-kesildi'].includes(t.id))) && (t.arch === 'cBelge' || t.arch === 'cTesekkur'));
    if (!tpls.length) return toast('Uygun şablon yok', true);
    if (window.Food && window.Food.loadCharity) await window.Food.loadCharity();
    let rows = [], id = startId && tpls.some((t) => t.id === startId) ? startId : tpls[0].id;
    const res = await A().dialog(`<div class="d-body kit"><h3>${icon('layers')} Toplu belge</h3><p class="muted" style="font-size:13px;margin:0 0 10px">İsim listesini yapıştır ya da Excel / CSV yükle: herkese adı yazılmış ayrı bir belge çıkar. Hepsi <b>tek PDF</b> (yazdırmaya hazır) ve <b>ZIP</b> olarak iner.</p>
      <div class="kit-k" id="bbK" style="flex-wrap:wrap;overflow:visible">${tpls.map((t) => `<button class="chip ${t.id === id ? 'on' : ''}" data-t="${t.id}">${esc(t.name)}</button>`).join('')}</div>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr"><label class="field"><span>Kişiler (her satıra bir kişi · isterseniz: Ad Soyad ; açıklama)</span><textarea class="inp" id="bbL" rows="8" placeholder="Ayşe Yılmaz&#10;Mehmet Demir ; Matematik olimpiyatı birincisi"></textarea></label>
      <div style="display:flex;gap:8px;align-items:center"><button class="btn sm" id="bbF">${icon('upload')}Excel / CSV yükle</button><small class="muted" id="bbN">0 kişi</small></div>
      <label class="field"><span>Başlık</span><input class="inp" id="bbT"></label><label class="field"><span>Açıklama (kişiye özel açıklama yoksa bu yazılır)</span><textarea class="inp" id="bbS" rows="3"></textarea></label>
      <label class="field"><span>Tarih</span><input class="inp" id="bbD" value="${trDate(new Date())}"></label></div>
      <div class="kit-pv"><div class="kit-th" id="bbP"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bbGo">${icon('download')}Belgeleri üret</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let tm = 0;
        const tpl = () => tpls.find((t) => t.id === id);
        const fill = () => { const t = tpl(), d0 = t.buildAt ? null : null; void d0; const def = L().templates.find((x) => x.id === id); const c = (def && def._content) || {}; void c; };
        void fill;
        const defaults = () => { const d = R.normalize(L().instantiateAt(tpl(), 0, null, tpl().w, tpl().h, null)); const g = (n) => (d.layers.find((l) => l.name === n) || {}).text || ''; $('#bbT', box).value = R.plain(g('Başlık')); $('#bbS', box).value = R.plain(g('Alt başlık')); };
        const parse = () => { rows = $('#bbL', box).value.split('\n').map((s) => s.split(/[;\t]/).map((x) => x.trim())).filter((r) => r[0]); $('#bbN', box).textContent = rows.length + ' kişi'; };
        const patch = (r) => { const p = { name: (r && r[0]) || 'Ad Soyad', title: $('#bbT', box).value, sub: (r && r[1]) || $('#bbS', box).value, date: $('#bbD', box).value }; if (id === 'b-kesildi') p.report = [['Hisse no', (r && r[1]) || '—'], ['Tarih', $('#bbD', box).value], ['Yer', (r && r[2]) || '—']]; return p; };
        const pv = () => { parse(); const t = tpl(); const d = R.normalize(L().instantiateAt(t, 0, null, t.w, t.h, null, patch(rows[0]))); $('#bbP', box).innerHTML = R.renderSVG(d, { fit: true, prefix: 'bb' + Math.random().toString(36).slice(2, 5) }); };
        $('#bbK', box).onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; id = b.dataset.t; $$('#bbK .chip', box).forEach((c) => c.classList.toggle('on', c === b)); defaults(); pv(); };
        ['bbL', 'bbT', 'bbS', 'bbD'].forEach((k) => ($('#' + k, box).oninput = () => { clearTimeout(tm); tm = setTimeout(pv, 300); }));
        $('#bbF', box).onclick = () => A().pickFiles(async (files) => {
          const f = files[0]; if (!f) return;
          try { const data = await blobToDataURL(f); const t = await A().api('parse-table', { body: { name: f.name, data } }); $('#bbL', box).value = t.rows.map((r) => t.columns.slice(0, 2).map((c) => (r[c] == null ? '' : String(r[c]))).join(' ; ')).join('\n'); pv(); }
          catch (e) { toast('Dosya okunamadı: ' + e.message, true); }
        }, false);
        $('#bbGo', box).onclick = () => { parse(); if (!rows.length) return toast('Önce isim listesini yaz', true); close({ t: tpl(), rows: rows.slice(), patch }); };
        defaults(); pv();
      },
    });
    if (!res) return;
    const prog = document.createElement('div'); prog.className = 'tk-prog'; document.body.appendChild(prog);
    try {
      const files = [], pages = [];
      for (let i = 0; i < res.rows.length; i++) {
        prog.textContent = `Belgeler hazırlanıyor… ${i + 1} / ${res.rows.length}`;
        const d = R.normalize(L().instantiateAt(res.t, 0, null, res.t.w, res.t.h, null, res.patch(res.rows[i])));
        await R.ensureImageSizes(d).catch(() => {});
        const pg = await jpegPage(d, Math.max(1, 2480 / Math.max(d.width, d.height)));
        pages.push(pg);
        files.push({ name: String(i + 1).padStart(3, '0') + '-' + slug(res.rows[i][0]) + '.jpg', data: new Uint8Array(await pg.blob.arrayBuffer()) });
        if (i % 3 === 2) await sleep(0);
      }
      prog.textContent = 'PDF hazırlanıyor…';
      const pdf = await P9.pdfFromJpegs(pages);
      files.push({ name: slug(res.t.name) + '-hepsi.pdf', data: new Uint8Array(await pdf.arrayBuffer()) });
      R.download(window.Tools.zip(files), slug(res.t.name) + '-toplu.zip');
      toast(`${res.rows.length} belge hazır: ZIP içinde tek tek JPG ve yazdırmak için tek PDF var`);
    } catch (e) { toast('Belgeler üretilemedi: ' + e.message, true); }
    prog.remove();
  };

  // ================================================================ 2) SİMGE KÜTÜPHANESİ
  P9.iconSrc = (k, color) => TH().icon(k, color);
  P9.icons = function () {
    const e = needDoc(); if (!e) return;
    const T = TH(), names = T.ICON_NAMES || {}, keys = Object.keys(T.ICON).filter((k) => names[k]);
    const brandC = ((A().S.brand && A().S.brand.colors) || []).filter(Boolean)[0] || '#1B2A4A';
    A().dialog(`<div class="d-body"><h3>${icon('star')} Simge ve süs kütüphanesi</h3>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><input class="inp" id="icQ" placeholder="Ara: hilal, kitap, takvim, köşe…" style="flex:1"><label class="color" style="width:auto"><input type="color" id="icC" value="${R.toHex(brandC)}"><span>Renk</span></label></div>
      <div class="ic-grid" id="icG"></div><p class="muted" style="font-size:12px;margin:8px 0 0">Eklenen simge seçiliyken sağ panelden rengini değiştirebilirsin.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const draw = () => {
          const q = $('#icQ', box).value.toLocaleLowerCase('tr-TR').trim(), c = $('#icC', box).value;
          $('#icG', box).innerHTML = keys.filter((k) => !q || (names[k] + ' ' + k).toLocaleLowerCase('tr-TR').includes(q)).map((k) => `<button class="ic-it" data-k="${k}" title="${esc(names[k])}"><img alt="" src="${T.icon(k, c)}"><small>${esc(names[k])}</small></button>`).join('') || '<p class="muted">Bulunamadı</p>';
        };
        $('#icQ', box).oninput = draw; $('#icC', box).oninput = draw;
        $('#icG', box).onclick = async (ev) => {
          const b = ev.target.closest('[data-k]'); if (!b) return;
          const d = e.doc, s = Math.round(Math.min(d.width, d.height) * 0.18), c = $('#icC', box).value;
          const [ix, iy] = await P9.quietSpot(d, s, s); e.insert([{ type: 'image', name: 'Simge · ' + names[b.dataset.k], src: T.icon(b.dataset.k, c), nw: 400, nh: 400, fit: 'contain', x: ix, y: iy, w: s, h: s, icon: { k: b.dataset.k, color: c } }]);
          close(null); toast('Simge eklendi');
        };
        draw(); setTimeout(() => $('#icQ', box).focus(), 80);
      },
    });
  };
  P9.recolorIcon = (l, c) => { if (!l || !l.icon) return; l.icon.color = c; l.src = TH().icon(l.icon.k, c); };

  // ================================================================ 3) SÖZ KÜTÜPHANESİ: ayet, hadis, dua, Arapça hat
  P9.QUOTES = {
    'Sadaka ve infak': [
      ['Malını Allah yolunda harcayanların durumu, yedi başak bitiren ve her başakta yüz tane bulunan bir tohum gibidir.', 'Bakara 2:261', 'ayet'],
      ['Sevdiğiniz şeylerden Allah yolunda harcamadıkça iyiliğe asla ulaşamazsınız.', 'Âl-i İmrân 3:92', 'ayet'],
      ['Onlar, kendileri ihtiyaç içinde olsalar bile başkalarını kendilerine tercih ederler.', 'Haşr 59:9', 'ayet'],
      ['Sadaka malı eksiltmez.', 'Müslim', 'hadis'],
      ['Veren el, alan elden üstündür.', 'Buhârî, Müslim', 'hadis'],
      ['Yarım hurma ile de olsa kendinizi ateşten koruyun.', 'Buhârî, Müslim', 'hadis'],
      ['Kardeşini güler yüzle karşılaman sadakadır.', 'Tirmizî', 'hadis'],
    ],
    'Ramazan ve oruç': [
      ['Ramazan ayı, insanlara yol gösterici olarak Kur’an’ın indirildiği aydır.', 'Bakara 2:185', 'ayet'],
      ['Ey iman edenler! Oruç, sizden öncekilere farz kılındığı gibi size de farz kılındı; umulur ki korunursunuz.', 'Bakara 2:183', 'ayet'],
      ['Kadir gecesi bin aydan daha hayırlıdır.', 'Kadr 97:3', 'ayet'],
      ['Kim inanarak ve karşılığını Allah’tan bekleyerek Ramazan orucunu tutarsa geçmiş günahları bağışlanır.', 'Buhârî, Müslim', 'hadis'],
      ['Bir oruçluya iftar ettirene, oruçlunun sevabı kadar sevap vardır.', 'Tirmizî', 'hadis'],
    ],
    'Kurban': [
      ['Rabbin için namaz kıl ve kurban kes.', 'Kevser 108:2', 'ayet'],
      ['Onların ne etleri ne de kanları Allah’a ulaşır; fakat O’na sizin takvanız ulaşır.', 'Hac 22:37', 'ayet'],
    ],
    'İlim ve eğitim': [
      ['Oku! Yaratan Rabbinin adıyla oku!', 'Alak 96:1', 'ayet'],
      ['Hiç bilenlerle bilmeyenler bir olur mu?', 'Zümer 39:9', 'ayet'],
      ['Rabbim, ilmimi artır.', 'Tâhâ 20:114', 'ayet'],
      ['Sizin en hayırlınız Kur’an’ı öğrenen ve öğretendir.', 'Buhârî', 'hadis'],
      ['Kim ilim öğrenmek için bir yola girerse, Allah ona cennete giden yolu kolaylaştırır.', 'Müslim', 'hadis'],
    ],
    'Kardeşlik ve merhamet': [
      ['Müminler ancak kardeştir.', 'Hucurât 49:10', 'ayet'],
      ['İyilik ve takva üzerinde yardımlaşın.', 'Mâide 5:2', 'ayet'],
      ['Onlar, yemeği ona olan sevgilerine rağmen yoksula, yetime ve esire yedirirler.', 'İnsan 76:8', 'ayet'],
      ['Merhamet etmeyene merhamet edilmez.', 'Buhârî, Müslim', 'hadis'],
      ['Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe gerçek manada iman etmiş olmaz.', 'Buhârî, Müslim', 'hadis'],
      ['Müslüman, elinden ve dilinden Müslümanların emin olduğu kimsedir.', 'Buhârî, Müslim', 'hadis'],
    ],
    'Sabır ve tevekkül': [
      ['Şüphesiz zorlukla beraber bir kolaylık vardır.', 'İnşirâh 94:5', 'ayet'],
      ['Şüphesiz Allah sabredenlerle beraberdir.', 'Bakara 2:153', 'ayet'],
      ['Kalpler ancak Allah’ı anmakla huzur bulur.', 'Ra’d 13:28', 'ayet'],
      ['Kim Allah’a tevekkül ederse, O ona yeter.', 'Talâk 65:3', 'ayet'],
    ],
    'Cuma ve dua': [
      ['Üzerine güneş doğan en hayırlı gün cuma günüdür.', 'Müslim', 'hadis'],
      ['Ameller ancak niyetlere göredir.', 'Buhârî, Müslim', 'hadis'],
      ['Allah’a en sevimli gelen amel, az da olsa devamlı olanıdır.', 'Buhârî, Müslim', 'hadis'],
      ['Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.', 'Bakara 2:201', 'ayet'],
    ],
  };
  P9.ARABIC = [
    ['بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ', 'Besmele', 'Aref Ruqaa'], ['الْحَمْدُ لِلّٰهِ', 'Elhamdülillah', 'Aref Ruqaa'], ['مَا شَاءَ اللّٰهُ', 'Maşallah', 'Aref Ruqaa'],
    ['سُبْحَانَ اللّٰهِ', 'Sübhanallah', 'Amiri'], ['اللّٰهُ أَكْبَرُ', 'Allahu ekber', 'Reem Kufi'], ['رَمَضَانُ كَرِيمٌ', 'Ramazan Kerim', 'Aref Ruqaa'],
    ['عِيدٌ مُبَارَكٌ', 'Bayramınız mübarek olsun', 'Aref Ruqaa'], ['جُمُعَةٌ مُبَارَكَةٌ', 'Cumanız mübarek olsun', 'Aref Ruqaa'], ['تَقَبَّلَ اللّٰهُ', 'Allah kabul etsin', 'Amiri'],
    ['إِنَّ مَعَ الْعُسْرِ يُسْرًا', 'Zorlukla beraber kolaylık vardır', 'Amiri'], ['رَبِّ زِدْنِي عِلْمًا', 'Rabbim ilmimi artır', 'Amiri'], ['إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ', 'Müminler ancak kardeştir', 'Amiri'],
  ];
  P9.quotes = function () {
    const e = needDoc(); if (!e) return;
    const cats = Object.keys(P9.QUOTES);
    A().dialog(`<div class="d-body"><h3>${icon('type')} Ayet, hadis ve dua</h3>
      <div class="chips" id="qtC"><button class="chip on" data-c="*">Tümü</button>${cats.map((c) => `<button class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}<button class="chip" data-c="ar">Arapça hat</button></div>
      <input class="inp" id="qtQ" placeholder="Ara…" style="margin:8px 0">
      <div class="qt-list" id="qtL"></div><p class="muted" style="font-size:12px;margin:8px 0 0">Bir yazı seçiliyse onun yerine yazılır; değilse yeni yazı olarak eklenir. Mealler özet niteliğindedir; kaynağı yanında yazılıdır.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let cat = '*';
        const draw = () => {
          const q = $('#qtQ', box).value.toLocaleLowerCase('tr-TR');
          if (cat === 'ar') { $('#qtL', box).innerHTML = P9.ARABIC.filter(([a, t]) => !q || t.toLocaleLowerCase('tr-TR').includes(q)).map(([a, t, f], i) => `<button class="qt-it ar" data-ar="${i}"><b dir="rtl" style="font-family:'${f}',serif">${a}</b><small>${esc(t)} · ${esc(f)}</small></button>`).join(''); return; }
          const list = []; (cat === '*' ? cats : [cat]).forEach((c) => P9.QUOTES[c].forEach((x) => list.push([c, ...x])));
          $('#qtL', box).innerHTML = list.filter((x) => !q || (x[1] + x[2]).toLocaleLowerCase('tr-TR').includes(q)).map(([c, t, s, k], i) => `<button class="qt-it" data-t="${esc(t)}" data-s="${esc(s)}" data-k="${k}"><b>“${esc(t)}”</b><small>${k === 'ayet' ? 'Ayet' : 'Hadis'} · ${esc(s)}</small></button>`).join('');
        };
        $('#qtC', box).onclick = (ev) => { const b = ev.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#qtC .chip', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        $('#qtQ', box).oninput = draw;
        $('#qtL', box).onclick = async (ev) => {
          const b = ev.target.closest('.qt-it'); if (!b) return;
          const d = e.doc, sel = e.state.sel.length === 1 ? d.layers.find((l) => l.id === e.state.sel[0] && l.type === 'text') : null;
          if (b.dataset.ar != null) {
            const [a, , f] = P9.ARABIC[+b.dataset.ar];
            if (window.Fonts && window.Fonts.ensureFamily) { try { await window.Fonts.ensureFamily(f); await R.ensureFont(f, 400, false); } catch (er) {} }
            const fs = Math.round(Math.min(d.width, d.height) * 0.07);
            if (sel) { sel.text = a; sel.fontFamily = f; sel.letterSpacing = 0; R.layoutText(sel); e.commit(); }
            else { const [ax, ay] = await P9.quietSpot(d, d.width * 0.8, fs * 1.8); e.insert([{ type: 'text', name: 'Arapça yazı', text: a, x: ax, y: ay, w: d.width * 0.8, h: fs * 1.6, fontSize: fs, fontFamily: f, fontWeight: 400, fill: P9.darkInk(d), align: 'center', lineHeight: 1.5, letterSpacing: 0 }]); }
          } else {
            const txt = `${b.dataset.k === 'ayet' ? '' : 'Peygamber Efendimiz (s.a.v.) buyurdu: '}“${b.dataset.t}” (${b.dataset.s})`;
            if (sel) { sel.text = txt; R.layoutText(sel); if (window.P8 && window.P8.reflow) window.P8.reflow(d); e.commit(); }
            else { const fs = Math.round(Math.min(d.width, d.height) * 0.034); e.insert([{ type: 'text', name: 'Alıntı', text: txt, x: d.width * 0.08, y: d.height * 0.7, w: d.width * 0.84, h: fs * 4, fontSize: fs, fontFamily: 'Crimson Pro', fontWeight: 600, italic: true, fill: P9.darkInk(d), align: 'center', lineHeight: 1.35 }]); }
          }
          close(null); toast('Eklendi');
        };
        draw();
      },
    });
  };

  // ================================================================ 4) DESEN ZEMİNİ
  const PATS = {
    girih: ['Sekiz köşeli yıldız', (s, c, sw) => { const st = (x, y) => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? s * 0.27 : s * 0.42; d += (i ? 'L' : 'M') + (x + Math.cos(a) * r).toFixed(1) + ' ' + (y + Math.sin(a) * r).toFixed(1); } return d + 'Z'; }; return `<path d="${st(s / 2, s / 2)}${st(0, 0)}${st(s, 0)}${st(0, s)}${st(s, s)}" fill="none" stroke="${c}" stroke-width="${sw}"/>`; }],
    altigen: ['Altıgen', (s, c, sw) => { const h = s * 0.866, hx = (x, y) => [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return (i ? 'L' : 'M') + (x + Math.cos(a) * s * 0.33).toFixed(1) + ' ' + (y + Math.sin(a) * s * 0.33).toFixed(1); }).join('') + 'Z'; return `<path d="${hx(s * 0.25, h * 0.25)}${hx(s * 0.75, h * 0.75)}${hx(s * 0.25 + s, h * 0.25)}${hx(s * 0.75 - s, h * 0.75)}${hx(s * 0.25, h * 0.25 + h)}${hx(s * 0.75, h * 0.75 - h)}" fill="none" stroke="${c}" stroke-width="${sw}"/>`; }],
    rozet: ['Gül rozet', (s, c, sw) => { let o = ''; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; o += `<ellipse cx="${(s / 2 + Math.cos(a) * s * 0.16).toFixed(1)}" cy="${(s / 2 + Math.sin(a) * s * 0.16).toFixed(1)}" rx="${(s * 0.16).toFixed(1)}" ry="${(s * 0.07).toFixed(1)}" transform="rotate(${(i * 45).toFixed(0)} ${(s / 2 + Math.cos(a) * s * 0.16).toFixed(1)} ${(s / 2 + Math.sin(a) * s * 0.16).toFixed(1)})"/>`; } return `<g fill="none" stroke="${c}" stroke-width="${sw}">${o}<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.05}"/><circle cx="0" cy="0" r="${s * 0.08}"/><circle cx="${s}" cy="0" r="${s * 0.08}"/><circle cx="0" cy="${s}" r="${s * 0.08}"/><circle cx="${s}" cy="${s}" r="${s * 0.08}"/></g>`; }],
    hilal: ['Hilal ve yıldız', (s, c) => { const m = (x, y, k) => `<path transform="translate(${x} ${y}) scale(${k})" d="M14 0C6 1 0 8 0 16C0 25 7 32 16 32C19 32 21 31 23 30C21 31 19 31 17 30C10 29 5 23 5 16C5 9 9 3 14 0ZM22 9L23.5 12.5L27 13L24.5 15.5L25 19L22 17.2L19 19L19.5 15.5L17 13L20.5 12.5Z" fill="${c}"/>`; return m(s * 0.15, s * 0.15, s / 110) + m(s * 0.65, s * 0.65, s / 140); }],
    nokta: ['Nokta', (s, c) => `<circle cx="${s / 4}" cy="${s / 4}" r="${s * 0.05}" fill="${c}"/><circle cx="${(s * 3) / 4}" cy="${(s * 3) / 4}" r="${s * 0.05}" fill="${c}"/>`],
    capraz: ['Çapraz çizgi', (s, c, sw) => `<path d="M0 ${s}L${s} 0M${-s / 2} ${s / 2}L${s / 2} ${-s / 2}M${s / 2} ${s * 1.5}L${s * 1.5} ${s / 2}" stroke="${c}" stroke-width="${sw}"/>`],
    dalga: ['Dalga', (s, c, sw) => `<path d="M0 ${s * 0.3}Q${s / 4} ${s * 0.1} ${s / 2} ${s * 0.3}T${s} ${s * 0.3}M0 ${s * 0.8}Q${s / 4} ${s * 0.6} ${s / 2} ${s * 0.8}T${s} ${s * 0.8}" fill="none" stroke="${c}" stroke-width="${sw}"/>`],
  };
  P9.patternSVG = function (k, W, H, { color = '#1B2A4A', bg = 'none', size = 120, opacity = 0.18, sw = 2 } = {}) {
    const [, fn] = PATS[k] || PATS.girih; const s = size, th = k === 'altigen' ? s * 0.866 : s;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><pattern id="p" width="${s}" height="${th.toFixed(2)}" patternUnits="userSpaceOnUse">${fn(s, color, sw)}</pattern></defs>${bg !== 'none' ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}<rect width="100%" height="100%" fill="url(#p)" opacity="${opacity}"/></svg>`;
  };
  P9.pattern = function () {
    const e = needDoc(); if (!e) return;
    const d = e.doc, ink = (d.layers.find((l) => l.type === 'text') || {}).fill || '#1B2A4A';
    A().dialog(`<div class="d-body"><h3>${icon('grid') || icon('layers')} Desen zemini</h3>
      <div class="chips" id="ptK">${Object.entries(PATS).map(([k, [n]], i) => `<button class="chip ${i ? '' : 'on'}" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="pt-g"><div class="pt-pv" id="ptP"></div><div class="pt-f">
        <label class="field"><span>Desen rengi</span><input type="color" id="ptC" value="${R.toHex(typeof ink === 'string' ? ink : '#1B2A4A')}"></label>
        <label class="field"><span>Büyüklük</span><input type="range" id="ptS" min="40" max="360" value="${Math.round(Math.min(d.width, d.height) / 9)}"></label>
        <label class="field"><span>Görünürlük</span><input type="range" id="ptO" min="4" max="60" value="16"></label>
        <label class="field"><span>Çizgi kalınlığı</span><input type="range" id="ptW" min="1" max="8" value="2"></label></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ptOk">${icon('plus')}Zemine ekle</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let k = 'girih';
        const opt = () => ({ color: $('#ptC', box).value, size: +$('#ptS', box).value, opacity: +$('#ptO', box).value / 100, sw: +$('#ptW', box).value });
        const pv = () => { const W = 360, H = Math.round((360 * d.height) / d.width), o = opt(); o.size = o.size * (W / d.width); o.sw = Math.max(0.5, o.sw * (W / d.width)); const bg = d.background && d.background.color ? d.background.color : '#FFFFFF'; $('#ptP', box).innerHTML = P9.patternSVG(k, W, H, Object.assign(o, { bg })); };
        $('#ptK', box).onclick = (ev) => { const b = ev.target.closest('[data-k]'); if (!b) return; k = b.dataset.k; $$('#ptK .chip', box).forEach((x) => x.classList.toggle('on', x === b)); pv(); };
        ['ptC', 'ptS', 'ptO', 'ptW'].forEach((id) => ($('#' + id, box).oninput = pv));
        $('#ptOk', box).onclick = () => {
          const svg = P9.patternSVG(k, d.width, d.height, opt());
          e.insert([{ type: 'image', name: 'Desen zemini', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), nw: d.width, nh: d.height, fit: 'fill', x: 0, y: 0, w: d.width, h: d.height, locked: true }], { bottom: true });
          close(null); toast('Desen zemine eklendi (kilitli; Katmanlar’dan açabilirsin)');
        };
        pv();
      },
    });
  };

  // ================================================================ 5) MOCKUP: telefon, duvar afişi, masada A4, roll-up
  const MOCKS = [['phone', 'Telefon ekranı'], ['wall', 'Duvarda afiş'], ['desk', 'Masada kâğıt'], ['rollup', 'Roll-up'], ['frame', 'Çerçevede']];
  async function mockCanvas(kind, img) {
    const W = 1600, H = 1200, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const ar = img.width / img.height;
    const shadow = (b, oy, col = 'rgba(0,0,0,.35)') => { x.shadowColor = col; x.shadowBlur = b; x.shadowOffsetY = oy; };
    const noShadow = () => { x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0; };
    const rr = (X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
    if (kind === 'phone') {
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#E9E4DC'); g.addColorStop(1, '#CFC6B8'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      const ph = 1040, pw = ph * 0.49, X = (W - pw) / 2, Y = (H - ph) / 2;
      shadow(80, 40); x.fillStyle = '#111'; rr(X, Y, pw, ph, 70); x.fill(); noShadow();
      const sx = X + 22, sy = Y + 22, sw = pw - 44, sh = ph - 44; x.save(); rr(sx, sy, sw, sh, 52); x.clip(); x.fillStyle = '#000'; x.fillRect(sx, sy, sw, sh);
      let w = sw, h = sw / ar; if (h > sh) { h = sh; w = sh * ar; } x.drawImage(img, sx + (sw - w) / 2, sy + (sh - h) / 2, w, h); x.restore();
      x.fillStyle = '#111'; rr(X + pw / 2 - 60, Y + 34, 120, 30, 15); x.fill();
    } else if (kind === 'wall' || kind === 'frame') {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, kind === 'wall' ? '#EDE7DD' : '#F3F1EC'); g.addColorStop(1, kind === 'wall' ? '#D9D0C2' : '#E4DFD6'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      if (kind === 'wall') { x.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * W, Math.random() * H, 2, 2); x.fillStyle = '#B9A88E'; x.fillRect(0, H * 0.86, W, H * 0.14); }
      let h = H * 0.68, w = h * ar; if (w > W * 0.62) { w = W * 0.62; h = w / ar; }
      const X = (W - w) / 2, Y = H * 0.42 - h / 2;
      if (kind === 'frame') { const f = 34; shadow(50, 24); x.fillStyle = '#2B2520'; x.fillRect(X - f - 40, Y - f - 40, w + 2 * f + 80, h + 2 * f + 80); noShadow(); x.fillStyle = '#FBFAF7'; x.fillRect(X - 40, Y - 40, w + 80, h + 80); x.drawImage(img, X, Y, w, h); }
      else { shadow(40, 20, 'rgba(0,0,0,.28)'); x.drawImage(img, X, Y, w, h); noShadow(); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(X, Y, w, h * 0.4); x.fillStyle = '#9C9C9C'; x.beginPath(); x.arc(X + w / 2, Y + 12, 6, 0, 7); x.fill(); }
    } else if (kind === 'desk') {
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#8A6A4D'); g.addColorStop(1, '#6E5038'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 3; for (let i = 0; i < 18; i++) { x.beginPath(); const y = (i / 18) * H + Math.sin(i) * 10; x.moveTo(0, y); x.bezierCurveTo(W * 0.3, y + 20, W * 0.6, y - 20, W, y + 6); x.stroke(); }
      let h = H * 0.82, w = h * ar; if (w > W * 0.6) { w = W * 0.6; h = w / ar; }
      x.save(); x.translate(W / 2, H / 2); x.rotate(-0.06); shadow(60, 30, 'rgba(0,0,0,.45)'); x.fillStyle = '#fff'; x.fillRect(-w / 2, -h / 2, w, h); noShadow(); x.drawImage(img, -w / 2, -h / 2, w, h); x.restore();
      x.save(); x.translate(W * 0.84, H * 0.72); x.rotate(0.5); shadow(20, 10); x.fillStyle = '#1B2A4A'; rr(-10, -150, 20, 300, 10); x.fill(); x.restore();
    } else if (kind === 'rollup') {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F4F2EE'); g.addColorStop(1, '#DCD7CE'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = '#CFC8BC'; x.fillRect(0, H * 0.9, W, H * 0.1);
      const h = H * 0.84, w = Math.min(h * ar, W * 0.4), X = (W - w) / 2, Y = H * 0.04;
      shadow(40, 20); x.drawImage(img, X, Y, w, h); noShadow();
      x.fillStyle = '#B8B8B8'; x.fillRect(X - 16, Y - 10, w + 32, 14); x.fillStyle = '#9A9A9A'; rr(X - 30, Y + h - 4, w + 60, 34, 10); x.fill();
      x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(W / 2, Y + h + 40, w * 0.7, 18, 0, 0, 7); x.fill();
    }
    return c;
  }
  P9.mockup = async function () {
    const e = needDoc(); if (!e) return;
    const b = await R.exportBlob(e.doc, 'png', Math.min(1, 1400 / Math.max(e.doc.width, e.doc.height)));
    const img = await createImageBitmap(b);
    const cvs = {};
    for (const [k] of MOCKS) cvs[k] = await mockCanvas(k, img);
    A().dialog(`<div class="d-body"><h3>${icon('image')} Mockup: tasarım gerçek ortamda</h3><div class="mk-g">${MOCKS.map(([k, n]) => `<div class="mk-it" data-k="${k}"><img alt="" src="${cvs[k].toDataURL('image/jpeg', 0.85)}"><div><b>${n}</b><button class="btn sm" data-dl="${k}">${icon('download')}İndir</button></div></div>`).join('')}</div></div><div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => $$('[data-dl]', box).forEach((bt) => (bt.onclick = () => cvs[bt.dataset.dl].toBlob((bl) => R.download(bl, `${slug(e.doc.name)}-mockup-${bt.dataset.dl}.jpg`), 'image/jpeg', 0.92))),
    });
  };

  // ================================================================ 6) FOTOĞRAFLARDAN SLAYT VİDEO
  P9.slideshow = async function () {
    const pics = [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('play')} Fotoğraflardan video</h3><p class="muted" style="font-size:13px;margin:0 0 10px">5–10 fotoğraf seç: yumuşak yakınlaşma, geçişler ve yazıyla 15–30 saniyelik video olur (faaliyet raporu, kermes, mezuniyet…).</p>
      <div class="ss-pics" id="ssP"><button class="ss-add" id="ssAdd">${icon('plus')}<span>Fotoğraf ekle</span></button></div>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <label class="field" style="grid-column:1/-1"><span>Başlık</span><input class="inp" id="ssT" value="Faaliyetlerimizden kareler"></label>
        <label class="field" style="grid-column:1/-1"><span>Alt yazı (son karede)</span><input class="inp" id="ssS" value="Desteğiniz için teşekkür ederiz"></label>
        <label class="field"><span>Ölçü</span><select class="inp" id="ssF"><option value="1080x1920">Story / Reels (9:16)</option><option value="1080x1080">Kare</option><option value="1920x1080">Yatay (YouTube)</option></select></label>
        <label class="field"><span>Kare başına süre</span><select class="inp" id="ssD"><option value="2.5">2,5 sn</option><option value="3" selected>3 sn</option><option value="4">4 sn</option></select></label>
        <div class="field" style="grid-column:1/-1"><span>Müzik (isteğe bağlı, telif hakkı olmayan)</span><div style="display:flex;gap:8px;align-items:center"><button class="btn sm" id="ssMb">${icon('upload')}Müzik seç</button><small class="muted" id="ssMn">Seçilmedi</small><input type="file" accept="audio/*" id="ssM" hidden></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ssGo">${icon('play')}Videoyu hazırla</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const draw = () => { $$('.ss-pic', box).forEach((x) => x.remove()); pics.forEach((p, i) => { const d = document.createElement('div'); d.className = 'ss-pic'; d.innerHTML = `<img alt="" src="${p.url}"><button data-rm="${i}" aria-label="Kaldır">×</button>`; $('#ssAdd', box).before(d); }); };
        $('#ssAdd', box).onclick = () => A().pickFiles(async (files) => { for (const f of files) if (/^image\//.test(f.type) && pics.length < 15) pics.push({ url: URL.createObjectURL(f) }); draw(); }, true);
        $('#ssMb', box).onclick = () => $('#ssM', box).click();
        $('#ssM', box).onchange = () => { const f = $('#ssM', box).files[0]; $('#ssMn', box).textContent = f ? f.name : 'Seçilmedi'; };
        $('#ssP', box).onclick = (ev) => { const b = ev.target.closest('[data-rm]'); if (b) { pics.splice(+b.dataset.rm, 1); draw(); } };
        $('#ssGo', box).onclick = () => { if (pics.length < 2) return toast('En az 2 fotoğraf seç', true); close({ title: $('#ssT', box).value, sub: $('#ssS', box).value, size: $('#ssF', box).value.split('x').map(Number), dur: +$('#ssD', box).value, music: $('#ssM', box).files[0] || null }); };
      },
    });
    if (!res) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return toast('Bu tarayıcı video kaydını desteklemiyor (Chrome ya da Safari dene)', true);
    const [W, H] = res.size, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
    const imgs = []; for (const p of pics) imgs.push(await createImageBitmap(await (await fetch(p.url)).blob()));
    const brand = (A().S.brand && A().S.brand.colors || []).filter(Boolean), acc = brand[0] || '#0F5A45';
    const fps = 30, per = res.dur, fade = 0.6, total = imgs.length * per + 2.5;
    const stream = cv.captureStream(fps);
    let actx = null, audio = null;
    if (res.music) { try { actx = new AudioContext(); audio = new Audio(URL.createObjectURL(res.music)); audio.crossOrigin = 'anonymous'; const src = actx.createMediaElementSource(audio), dest = actx.createMediaStreamDestination(), g = actx.createGain(); src.connect(g); g.connect(dest); g.gain.setValueAtTime(1, actx.currentTime); g.gain.linearRampToValueAtTime(0, actx.currentTime + total); dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t)); } catch (e) { audio = null; } }
    const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6 }), chunks = [];
    rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    const font = (w, s, f = 'Poppins') => `${w} ${s}px "${f}", Inter, sans-serif`;
    const cover = (im, t) => { const k = 1.06 + 0.08 * t, s = Math.max(W / im.width, H / im.height) * k, w = im.width * s, h = im.height * s; x.drawImage(im, (W - w) / 2 + (t - 0.5) * W * 0.03, (H - h) / 2, w, h); };
    const wrap = (txt, maxW) => { const ws = txt.split(/\s+/), out = []; let ln = ''; ws.forEach((w) => { const tt = ln ? ln + ' ' + w : w; if (x.measureText(tt).width > maxW && ln) { out.push(ln); ln = w; } else ln = tt; }); if (ln) out.push(ln); return out; };
    const frame = (t) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
      const i = Math.min(imgs.length - 1, Math.floor(t / per)), lt = (t - i * per) / per;
      if (t < imgs.length * per) {
        cover(imgs[i], lt);
        if (lt > 1 - fade / per && i + 1 < imgs.length) { x.globalAlpha = (lt - (1 - fade / per)) / (fade / per); cover(imgs[i + 1], 0); x.globalAlpha = 1; }
      } else { x.fillStyle = acc; x.fillRect(0, 0, W, H); }
      const g = x.createLinearGradient(0, H * 0.55, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.65)'); x.fillStyle = g; x.fillRect(0, H * 0.55, W, H * 0.45);
      const fs = Math.round(Math.min(W, H) * 0.068);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      if (t < 2.4 || t >= imgs.length * per) {
        const a = t < 2.4 ? Math.min(1, t / 0.5, (2.4 - t) / 0.4) : Math.min(1, (t - imgs.length * per) / 0.5);
        x.globalAlpha = a; x.font = font(700, fs);
        const txt = t < 2.4 ? res.title : res.sub || res.title, lines = wrap(txt, W * 0.84);
        const y0 = t < 2.4 ? H * 0.82 - (lines.length - 1) * fs * 1.15 : H / 2 - ((lines.length - 1) * fs * 1.15) / 2;
        lines.forEach((ln, k) => x.fillText(ln, W / 2, y0 + k * fs * 1.15)); x.globalAlpha = 1;
      }
      const bw = W * 0.6, by = H - Math.min(W, H) * 0.04; x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect((W - bw) / 2, by, bw, 4); x.fillStyle = '#fff'; x.fillRect((W - bw) / 2, by, bw * Math.min(1, t / total), 4);
    };
    const prog = document.createElement('div'); prog.className = 'tk-prog'; document.body.appendChild(prog);
    await document.fonts.load(font(700, 40)).catch(() => {});
    frame(0); rec.start(250); if (audio) { try { await audio.play(); } catch (e) {} }
    const t0 = performance.now();
    await new Promise((done) => { const tick = () => { const t = (performance.now() - t0) / 1000; frame(Math.min(t, total)); prog.textContent = `Video kaydediliyor… ${Math.round((t / total) * 100)}%`; if (t < total) requestAnimationFrame(tick); else done(); }; tick(); });
    rec.stop(); if (audio) audio.pause(); await new Promise((r) => (rec.onstop = r)); if (actx) actx.close();
    prog.remove();
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    R.download(new Blob(chunks, { type: mime.split(';')[0] }), `${slug(res.title)}.${ext}`);
    toast(`Video hazır (${Math.round(total)} sn, ${ext.toUpperCase()})${ext === 'webm' ? ' — WhatsApp için MP4 gerekirse Safari’de ya da Windows sürümünde yeniden oluştur' : ''}`);
  };

  // ================================================================ 7) GERİ SAYIM (her açılışta güncellenir)
  const daysTo = (s) => { const t = new Date(s + 'T00:00'), n = new Date(); n.setHours(0, 0, 0, 0); return Math.round((t - n) / 864e5); };
  P9.countText = (cd) => { const d = daysTo(cd.date); if (cd.part === 'num') return String(Math.max(0, d)); return d > 1 ? (cd.label || 'gün kaldı') : d === 1 ? 'Yarın!' : d === 0 ? (cd.today || 'Bugün!') : (cd.after || 'Gerçekleşti'); };
  P9.refreshCountdowns = function (d) { let n = 0; (d.layers || []).forEach((l) => { if (l.type === 'text' && l.countdown) { const t = P9.countText(l.countdown); if (R.plain(l.text) !== t) { l.text = t; R.layoutText(l); n++; } } }); return n; };
  P9.countdown = async function () {
    const e = needDoc(); if (!e) return;
    const evs = window.P7 && window.P7.hijriEvents ? [...window.P7.hijriEvents(new Date().getFullYear()), ...window.P7.hijriEvents(new Date().getFullYear() + 1)].filter((x) => daysTo(x.date) > 0).slice(0, 8) : [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('clock') || icon('calendar')} Geri sayım</h3><p class="muted" style="font-size:13px;margin:0 0 10px">“Kurbana 12 gün kaldı” gibi bir sayaç ekler. Tasarımı her açtığında ve indirdiğinde sayı kendiliğinden güncellenir.</p>
      ${evs.length ? `<div class="chips" id="cdE">${evs.map((x) => `<button class="chip" data-d="${x.date}" data-n="${esc(x.name)}">${esc(x.name)}</button>`).join('')}</div>` : ''}
      <label class="field"><span>Hedef tarih</span><input class="inp" type="date" id="cdD" value="${ymd(new Date(Date.now() + 14 * 864e5))}"></label>
      <label class="field"><span>Üst yazı</span><input class="inp" id="cdT" value="Kampanyanın bitmesine"></label>
      <label class="field"><span>Sayının yanındaki yazı</span><input class="inp" id="cdL" value="gün kaldı"></label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="cdOk">${icon('plus')}Ekle</button></div>`, {
      onOpen: (box, close) => {
        const ch = $('#cdE', box); if (ch) ch.onclick = (ev) => { const b = ev.target.closest('[data-d]'); if (!b) return; $('#cdD', box).value = b.dataset.d; $('#cdT', box).value = b.dataset.n.replace(/ (başlangıcı|günü)$/i, '') + '’na'; $$('.chip', ch).forEach((x) => x.classList.toggle('on', x === b)); };
        $('#cdOk', box).onclick = () => close({ date: $('#cdD', box).value, top: $('#cdT', box).value, label: $('#cdL', box).value });
      },
    });
    if (!res || !res.date) return;
    const d = e.doc, S = Math.min(d.width, d.height), ink = P9.darkInk(d), acc = ((A().S.brand || {}).colors || [])[1] || '#E9A21B';
    const w = S * 0.32, h = S * 0.28, [x, y] = await P9.quietSpot(d, w, h);
    e.insert([
      { type: 'rect', name: 'Sayaç zemini', x, y, w, h, fill: '#FFFFFF', radius: S * 0.03, shadow: { x: 0, y: S * 0.01, blur: S * 0.04, color: 'rgba(0,0,0,.18)' } },
      { type: 'text', name: 'Sayaç üst yazı', text: res.top, x: x + w * 0.06, y: y + h * 0.08, w: w * 0.88, h: S * 0.05, fontSize: Math.round(S * 0.026), fontFamily: 'Poppins', fontWeight: 600, fill: ink, align: 'center', lineHeight: 1.1 },
      { type: 'text', name: 'Sayaç sayısı', text: P9.countText({ date: res.date, part: 'num' }), x, y: y + h * 0.26, w, h: S * 0.12, fontSize: Math.round(S * 0.105), fontFamily: 'Poppins', fontWeight: 800, fill: acc, align: 'center', lineHeight: 1, countdown: { date: res.date, part: 'num' } },
      { type: 'text', name: 'Sayaç alt yazı', text: P9.countText({ date: res.date, label: res.label }), x, y: y + h * 0.72, w, h: S * 0.04, fontSize: Math.round(S * 0.028), fontFamily: 'Poppins', fontWeight: 600, fill: ink, align: 'center', lineHeight: 1.1, countdown: { date: res.date, label: res.label } },
    ], { group: true });
    toast('Geri sayım eklendi: her gün kendiliğinden azalır');
  };

  // ================================================================ 8) ETİKET / ROZET SAYFASI (A4’e dizme, kesim işaretli)
  P9.sheet = async function () {
    const e = needDoc(); if (!e) return; e.flush && e.flush();
    const src = A().S.project, texts = src.layers.filter((l) => l.type === 'text' && R.plain(l.text).trim());
    const GR = [[2, 4, '8’li (2×4)'], [3, 4, '12’li (3×4)'], [3, 7, '21’li (3×7)'], [4, 6, '24’lü (4×6)'], [2, 2, '4’lü (2×2)']];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('rows') || icon('layers')} Etiket ve rozet sayfası</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Bu tasarımı A4 sayfaya kesim işaretleriyle dizer: koli etiketi, isim kartı, yaka kartı… İsterseniz her kutuya listeden farklı bir isim yazılır.</p>
      <div class="chips" id="shG">${GR.map(([c, r, n], i) => `<button class="chip ${i ? '' : 'on'}" data-i="${i}">${n}</button>`).join('')}</div>
      <label class="field"><span>Kenar boşluğu</span><select class="inp" id="shM"><option value="0.04">Dar</option><option value="0.06" selected>Normal</option><option value="0.09">Geniş</option></select></label>
      ${texts.length ? `<label class="field"><span>Listeden değişecek yazı (isteğe bağlı)</span><select class="inp" id="shT"><option value="">— Hepsi aynı —</option>${texts.map((l) => `<option value="${l.id}">${esc(l.name)}: ${esc(R.plain(l.text).slice(0, 30))}</option>`).join('')}</select></label>
      <label class="field"><span>Liste (her satıra bir kutu)</span><textarea class="inp" id="shL" rows="5" placeholder="Ayşe Yılmaz&#10;Mehmet Demir"></textarea></label>` : ''}</div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="shOk">Sayfayı hazırla</button></div>`, {
      onOpen: (box, close) => {
        let gi = 0; $('#shG', box).onclick = (ev) => { const b = ev.target.closest('[data-i]'); if (!b) return; gi = +b.dataset.i; $$('#shG .chip', box).forEach((x) => x.classList.toggle('on', x === b)); };
        $('#shOk', box).onclick = () => close({ g: GR[gi], m: +$('#shM', box).value, tid: ($('#shT', box) || {}).value || '', list: (($('#shL', box) || {}).value || '').split('\n').map((s) => s.trim()).filter(Boolean) });
      },
    });
    if (!res) return;
    const PW = 1240, PH = 1754, [cols, rows] = res.g, mg = PW * res.m, gap = PW * 0.012;
    const cw = (PW - 2 * mg - (cols - 1) * gap) / cols, ch = (PH - 2 * mg - (rows - 1) * gap) / rows;
    const ar = src.width / src.height; let w = cw, h = cw / ar; if (h > ch) { h = ch; w = ch * ar; }
    const n = cols * rows, layers = [], cache = {};
    const prog = document.createElement('div'); prog.className = 'tk-prog'; document.body.appendChild(prog);
    try {
      for (let i = 0; i < n; i++) {
        const val = res.tid && res.list.length ? res.list[i % res.list.length] : '';
        if (!cache[val]) {
          prog.textContent = `Kutular hazırlanıyor… ${Object.keys(cache).length + 1}`;
          const d = JSON.parse(JSON.stringify(src)); R.normalize(d);
          if (val) { const l = d.layers.find((x) => x.id === res.tid); if (l) { l.text = val; R.layoutText(l); } }
          const b = await R.exportBlob(d, 'png', Math.min(2, (w * 2) / d.width));
          cache[val] = await uploadData(await blobToDataURL(b), 'etiket.png');
        }
        const c = i % cols, r = Math.floor(i / cols), x = mg + c * (cw + gap) + (cw - w) / 2, y = mg + r * (ch + gap) + (ch - h) / 2;
        layers.push({ type: 'image', name: 'Etiket ' + (i + 1), src: cache[val], fit: 'fill', x: r1(x), y: r1(y), w: r1(w), h: r1(h), filters: {} });
        // köşe kesim işaretleri
        const t = PW * 0.012, sw = 1, col = '#9A9A9A';
        [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]].forEach(([px, py, sx, sy]) => {
          layers.push({ type: 'rect', name: 'Kesim işareti', x: r1(sx < 0 ? px - t - 2 : px + 2), y: r1(py - sw / 2), w: r1(t), h: sw, fill: col, locked: true });
          layers.push({ type: 'rect', name: 'Kesim işareti', x: r1(px - sw / 2), y: r1(sy < 0 ? py - t - 2 : py + 2), w: sw, h: r1(t), fill: col, locked: true });
        });
      }
      const np = Object.assign(A().newProject(PW, PH, (src.name || 'Tasarım') + ' · etiket sayfası'), { background: { type: 'solid', color: '#FFFFFF' }, layers, meta: { sheet: true } });
      R.normalize(np); await R.ensureImageSizes(np).catch(() => {});
      await A().saveProject(np); A().S.project = np; A().go('editor', np.id);
      toast(`${n} kutulu A4 sayfa hazır. İndir → PDF (baskı) ile yazdırabilirsin`);
    } catch (er) { toast('Sayfa hazırlanamadı: ' + er.message, true); }
    prog.remove();
  };

  // ================================================================ 9) ÜÇ KIRIMLI BROŞÜR (dış ve iç yüz)
  P9.brochure = async function () {
    const W = 1754, H = 1240, pw = W / 3, ink = '#1B2A4A', acc = '#B8872F', mg = 50;
    const brand = A().S.brand || {}, cols = (brand.colors || []).filter(Boolean);
    const c1 = cols[0] || ink, c2 = cols[1] || acc, nm = brand.name || 'Kurum adı';
    const T = (name, text, x, y, w, fs, o = {}) => Object.assign({ type: 'text', name, text, x, y, w, h: fs * 1.3, fontSize: fs, fontFamily: 'Poppins', fontWeight: 400, fill: ink, align: 'left', lineHeight: 1.35 }, o);
    const box = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x, y, w, h, fill, radius: 0 }, o);
    const ph = (name, x, y, w, h) => ({ type: 'image', name, src: TH().cart ? TH().cart('kitap') : '', nw: 800, nh: 800, fit: 'contain', x, y, w, h, role: 'photo', filters: {} });
    const marks = () => [1, 2].flatMap((k) => [{ type: 'rect', name: 'Katlama işareti', x: r1(pw * k - 0.6), y: 0, w: 1.2, h: 22, fill: '#9A9A9A', locked: true }, { type: 'rect', name: 'Katlama işareti', x: r1(pw * k - 0.6), y: H - 22, w: 1.2, h: 22, fill: '#9A9A9A', locked: true }]);
    const guides = [{ x: r1(pw) }, { x: r1(pw * 2) }];
    // dış yüz: [iç kapak (katlanan) | arka kapak | ön kapak]
    const outer = [
      T('Başlık', 'Hakkımızda', mg, mg + 20, pw - 2 * mg, 44, { fontWeight: 700, fill: c1 }),
      T('Metin', 'Kurumumuzun hikâyesini, değerlerini ve yaptığı çalışmaları kısaca anlatın. Okuyucunun broşürü açtığında ilk gördüğü bölüm burasıdır.', mg, mg + 100, pw - 2 * mg, 24),
      ph('Fotoğraf', mg, H * 0.5, pw - 2 * mg, H * 0.42),
      box('Arka kapak zemini', pw, 0, pw, H, c1),
      T('Başlık', 'İletişim', pw + mg, H * 0.35, pw - 2 * mg, 40, { fontWeight: 700, fill: '#FFFFFF', align: 'center' }),
      T('Metin', `${brand.phone || '0 (555) 000 00 00'}\n${brand.web || 'www.kurum.org'}\n${brand.address || 'Adres bilgisi'}`, pw + mg, H * 0.35 + 80, pw - 2 * mg, 24, { fill: '#FFFFFF', align: 'center', lineHeight: 1.7 }),
      ph('Kapak fotoğrafı', pw * 2, 0, pw, H * 0.58),
      box('Kapak bandı', pw * 2, H * 0.58, pw, H * 0.42, c2),
      T('Başlık', nm, pw * 2 + mg, H * 0.64, pw - 2 * mg, 58, { fontWeight: 800, fill: '#FFFFFF', fontFamily: 'DM Serif Display' }),
      T('Alt başlık', 'Broşür başlığı ya da sloganı', pw * 2 + mg, H * 0.64 + 150, pw - 2 * mg, 26, { fill: '#FFFFFF' }),
      ...marks(),
    ];
    const inner = [0, 1, 2].flatMap((k) => [
      T('Başlık', ['Neler yapıyoruz?', 'Projelerimiz', 'Nasıl destek olabilirsiniz?'][k], pw * k + mg, mg + 20, pw - 2 * mg, 40, { fontWeight: 700, fill: c1 }),
      box('Ayraç', pw * k + mg, mg + 140, 60, 5, c2),
      T('Metin', 'Bu bölüme kısa bir açıklama yazın. Paragrafları kısa tutmak ve önemli noktaları vurgulamak broşürün okunmasını kolaylaştırır.', pw * k + mg, mg + 170, pw - 2 * mg, 23),
      ph('Fotoğraf ' + (k + 1), pw * k + mg, H * 0.52, pw - 2 * mg, H * 0.4),
    ]).concat(marks());
    const mk = async (name, layers) => { const p = Object.assign(A().newProject(W, H, name), { background: { type: 'solid', color: '#FFFFFF' }, layers, meta: { guides, brochure: true } }); R.normalize(p); await R.ensureImageSizes(p).catch(() => {}); p.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); await A().saveProject(p); return p; };
    const p1 = await mk('Broşür · dış yüz', outer), p2 = await mk('Broşür · iç yüz', inner);
    void p2; A().S.project = p1; A().go('editor', p1.id);
    toast('Üç kırımlı broşür hazır: “dış yüz” açıldı, “iç yüz” Projeler’de. Mavi kılavuzlar katlama yerleridir (baskıda çıkmaz); kenardaki küçük çizgiler katlama işaretidir.');
  };

  // ================================================================ 10) METİN YARDIMCISI (internetsiz)
  P9.PHRASES = {
    'Duyuru': { 'Resmî': ['Değerli velilerimiz, aşağıda bilgileri yer alan etkinliğimize katılımınızı rica ederiz.', 'Kurumumuzca düzenlenecek programın ayrıntıları aşağıda bilgilerinize sunulmuştur.', 'İlgili tüm paydaşlarımıza önemle duyurulur.'], 'Samimi': ['Sizi de aramızda görmek isteriz! Ayrıntılar aşağıda.', 'Güzel bir buluşma için gün sayıyoruz, sen de gel!', 'Haberin olsun: yeni etkinliğimiz kapıda!'], 'Kısa': ['Katılımınızı bekleriz.', 'Kaçırmayın!', 'Ayrıntılar aşağıda.'] },
    'Teşekkür': { 'Resmî': ['Kurumumuza sağladığınız değerli katkılardan dolayı teşekkürlerimizi sunarız.', 'Desteğiniz, çalışmalarımızın sürmesine vesile olmuştur. Şükranlarımızla.', 'Göstermiş olduğunuz hassasiyet için teşekkür ederiz.'], 'Samimi': ['İyi ki varsınız! Desteğiniz yüzleri güldürdü.', 'Sizin sayenizde nice sofra kuruldu, Allah razı olsun.', 'Gönülden teşekkürler, hayrınız daim olsun.'], 'Kısa': ['Allah razı olsun.', 'Teşekkür ederiz.', 'Emeğinize sağlık.'] },
    'Davet': { 'Resmî': ['Programımızı onurlandırmanızdan memnuniyet duyarız.', 'Etkinliğimize teşriflerinizi arz ederiz.', 'Katılımınızla bizleri onurlandırmanızı rica ederiz.'], 'Samimi': ['Bu güzel günde seni de aramızda görmek istiyoruz!', 'Çay bizden, sohbet sizden. Bekliyoruz!', 'Gelmezsen eksik kalır!'], 'Kısa': ['Davetlisiniz.', 'Sizi bekliyoruz.', 'Hep birlikte!'] },
    'Kampanya': { 'Resmî': ['İhtiyaç sahibi ailelere ulaştırılmak üzere bağış kampanyamız başlamıştır.', 'Kampanyamıza katkılarınız, banka hesabımız aracılığıyla kabul edilmektedir.', 'Desteklerinizle hedefimize birlikte ulaşmayı amaçlıyoruz.'], 'Samimi': ['Bir koli, bir ailenin bir aylık sofrası. Sen de ortak ol!', 'Paylaştıkça çoğalan bir bereket için el ele verelim.', 'Küçük bir destek, kocaman bir gülümseme.'], 'Kısa': ['Sen de destek ol.', 'Hedefe birlikte!', 'Paylaştıkça çoğalır.'] },
    'Bayram ve kandil': { 'Resmî': ['Mübarek bayramınızı tebrik eder, sağlık ve huzur dolu günler dileriz.', 'Kandilinizin hayırlara vesile olmasını temenni ederiz.', 'Bu mübarek günün İslam âlemine hayırlar getirmesini dileriz.'], 'Samimi': ['Bayramınız mübarek olsun, sofralarınız bereketli olsun!', 'Kandiliniz mübarek, dualarınız kabul olsun.', 'Nice güzel bayramlara, sevdiklerinizle birlikte!'], 'Kısa': ['Bayramınız mübarek olsun.', 'Kandiliniz mübarek olsun.', 'Hayırlı cumalar.'] },
    'Eğitim': { 'Resmî': ['Öğrencilerimizin akademik gelişimini birlikte değerlendirmek amacıyla toplantı düzenlenecektir.', 'Sınav takvimi ve kuralları aşağıda bilgilerinize sunulmuştur.', 'Eğitim öğretim yılında gösterdiğiniz başarıdan dolayı tebrik ederiz.'], 'Samimi': ['Bir dönem daha bitti; emeğiniz için hepinize kocaman tebrikler!', 'Yeni dönemde de birlikte öğrenmeye devam!', 'Başarı tesadüf değil; tebrikler!'], 'Kısa': ['Tebrikler!', 'Başarılar dileriz.', 'İyi tatiller!'] },
  };
  P9.phrases = function () {
    const e = needDoc(); if (!e) return;
    const cats = Object.keys(P9.PHRASES);
    A().dialog(`<div class="d-body"><h3>${icon('type')} Metin yardımcısı</h3>
      <div class="chips" id="phC">${cats.map((c, i) => `<button class="chip ${i ? '' : 'on'}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="seg" id="phT" style="margin:8px 0"><button class="on" data-t="Resmî">Resmî</button><button data-t="Samimi">Samimi</button><button data-t="Kısa">Kısa</button></div>
      <div class="qt-list" id="phL"></div><p class="muted" style="font-size:12px;margin:8px 0 0">Bir yazı seçiliyse onun yerine yazılır; değilse yeni yazı eklenir.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let c = cats[0], t = 'Resmî';
        const draw = () => { $('#phL', box).innerHTML = P9.PHRASES[c][t].map((p) => `<button class="qt-it" data-p="${esc(p)}"><b>${esc(p)}</b></button>`).join(''); };
        $('#phC', box).onclick = (ev) => { const b = ev.target.closest('[data-c]'); if (!b) return; c = b.dataset.c; $$('#phC .chip', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        $('#phT', box).onclick = (ev) => { const b = ev.target.closest('[data-t]'); if (!b) return; t = b.dataset.t; $$('#phT button', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        $('#phL', box).onclick = (ev) => {
          const b = ev.target.closest('[data-p]'); if (!b) return;
          const d = e.doc, sel = e.state.sel.length === 1 ? d.layers.find((l) => l.id === e.state.sel[0] && l.type === 'text') : null;
          if (sel) { sel.text = b.dataset.p; R.layoutText(sel); if (window.P8 && window.P8.reflow) window.P8.reflow(d); e.commit(); }
          else { const fs = Math.round(Math.min(d.width, d.height) * 0.035); e.insert([{ type: 'text', name: 'Metin', text: b.dataset.p, x: d.width * 0.08, y: d.height * 0.45, w: d.width * 0.84, h: fs * 3, fontSize: fs, fontFamily: 'Poppins', fontWeight: 500, fill: P9.darkInk(d), align: 'center', lineHeight: 1.35 }]); }
          close(null); toast('Metin yazıldı');
        };
        draw();
      },
    });
  };

  // ================================================================ 11) YAZIM DENETİMİ (Türkçe, internetsiz)
  const WRONG = { birşey: 'bir şey', herşey: 'her şey', hiçbirşey: 'hiçbir şey', 'hiç bir': 'hiçbir', şuan: 'şu an', yanlız: 'yalnız', yalnış: 'yanlış', herkez: 'herkes', malesef: 'maalesef', orjinal: 'orijinal', süpriz: 'sürpriz', sürpiriz: 'sürpriz', makina: 'makine', laboratuar: 'laboratuvar', egzos: 'egzoz', eşortman: 'eşofman', kirpi̇k: 'kirpik', mütevazi: 'mütevazı', inşallah: 'inşaallah', yada: 'ya da', veyahutta: 'veyahut da', ünvan: 'unvan', yanlızca: 'yalnızca', 'bir çok': 'birçok', 'her hangi': 'herhangi', 'pek çok': 'pek çok', antreman: 'antrenman', aksesuvar: 'aksesuar', kontör: 'kontür', yöresel: 'yerel', traş: 'tıraş', poğaca: 'poğaça', döküman: 'doküman', hergün: 'her gün', heryer: 'her yer', herzaman: 'her zaman', birkere: 'bir kere', yalnızmısın: 'yalnız mısın', haftasonu: 'hafta sonu', 'akşam üstü': 'akşamüstü', kampanyamıza: 'kampanyamıza', tşk: 'teşekkürler', 'ramazan bayramı': 'Ramazan Bayramı', 'kurban bayramı': 'Kurban Bayramı' };
  P9.spellIssues = function (d) {
    const out = [];
    (d.layers || []).filter((l) => l.type === 'text' && l.visible !== false && !/^Süs/.test(l.name || '')).forEach((l) => {
      const t = R.plain(l.text), low = t.toLocaleLowerCase('tr-TR');
      const add = (msg, from, to) => out.push({ l, msg, from, to });
      Object.entries(WRONG).forEach(([w, r]) => { if (w === r) return; const re = new RegExp(`(^|[^\\p{L}])(${w.replace(/ /g, '\\s+')})(?=$|[^\\p{L}])`, 'iu'); const m = re.exec(t); if (m) add(`“${m[2]}” → “${r}”`, m[2], /^\p{Lu}/u.test(m[2]) && !/^\p{Lu}/u.test(r) ? r.charAt(0).toLocaleUpperCase('tr-TR') + r.slice(1) : r); });
      if (/ {2,}/.test(t)) add('Çift boşluk', /  +/g, ' ');
      const m1 = t.match(/\s+([,.;:!?])(?!\d)/); if (m1) add(`Noktalama işaretinden önce boşluk: “${m1[0].trim()}”`, /\s+([,.;:!?])(?!\d)/g, '$1');
      const m2 = t.match(/([,;:!?])(?=[A-Za-zÇĞİÖŞÜçğıöşü])/); if (m2 && !/https?:|www\./.test(t)) add(`Noktalamadan sonra boşluk eksik: “${m2[0]}”`, /([,;!?])(?=[A-Za-zÇĞİÖŞÜçğıöşü])/g, '$1 ');
      // bağlaç olan “de/da” ve “ki” bitişik yazılmış olabilir (sık hatalar)
      const m3 = low.match(/\b(bende|sende|onda|bizde|sizde|onlarda)\s+(geliyorum|gelirim|varım|katıl\w*|isterim)\b/); if (m3) add(`“${m3[1]}” burada bağlaç olabilir: “${m3[1].replace(/(de|da)$/, ' $1')}”`, new RegExp(m3[1], 'i'), m3[1].replace(/(de|da)$/, ' $1'));
      if (l.uppercase && /i/.test(t) && !/[İı]/.test(t)) {} // büyük harfe Türkçe dönüşüm zaten yapılıyor
    });
    return out;
  };
  P9.spell = function () {
    const e = needDoc(); if (!e) return;
    const iss = P9.spellIssues(e.doc);
    if (!iss.length) return toast('Yazım denetimi: sorun bulunamadı ✓');
    A().dialog(`<div class="d-body"><h3>${icon('check')} Yazım denetimi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">${iss.length} olası hata bulundu. Düzelt’e basınca yalnızca o yazı değişir.</p><div class="sp-list">${iss.map((x, i) => `<div class="sp-it" data-i="${i}"><div><b>${esc(x.msg)}</b><small>${esc(x.l.name)} · “${esc(R.plain(x.l.text).slice(0, 60))}”</small></div><button class="btn sm" data-fix="${i}">Düzelt</button></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="spAll">Hepsini düzelt</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const fix = (x) => { const s = String(x.l.text); x.l.text = typeof x.from === 'string' ? s.replace(x.from, x.to) : s.replace(x.from, x.to); R.layoutText(x.l); };
        $$('[data-fix]', box).forEach((b) => (b.onclick = () => { fix(iss[+b.dataset.fix]); e.commit(); b.closest('.sp-it').classList.add('done'); b.disabled = true; b.textContent = 'Düzeldi'; }));
        $('#spAll', box).onclick = () => { iss.forEach(fix); e.commit(); close(null); toast(iss.length + ' düzeltme yapıldı (Geçmiş’ten geri alabilirsin)'); };
      },
    });
  };

  // ================================================================ 12) PUAN, ALTERNATİFLER VE KARŞILAŞTIRMA
  const scoreOf = async (d) => {
    if (!window.Coach || !window.Coach.analyze) return { score: 0, issues: [] };
    const iss = await window.Coach.analyze(d), per = {};
    iss.forEach((i) => { per[i.k] = (per[i.k] || 0) + (i.sev === 3 ? 10 : i.sev === 2 ? 6 : 3); });
    const p = Object.entries(per).reduce((a, [k, v]) => a + Math.min(v, k === 'contrast' || k === 'outside' ? 24 : 12), 0);
    const sp = P9.spellIssues(d).length * 3;
    return { score: Math.max(10, 100 - p - sp), issues: iss, spell: sp / 3 };
  };
  P9.scoreOf = scoreOf;
  P9.alternatives = async function () {
    const e = needDoc(); if (!e) return; e.flush && e.flush();
    const p = A().S.project, d0 = A().designOf(p), alts = [];
    const tid = p.meta && p.meta.template, t = tid && L().templates.find((x) => x.id === tid);
    toast('Öneriler hazırlanıyor…');
    // 1) koçun güvenli düzeltmeleri
    const c1 = JSON.parse(JSON.stringify(d0)); R.normalize(c1); if (window.Coach) await window.Coach.autoPolish(c1).catch(() => {}); alts.push(['Düzeltilmiş', c1]);
    // 2) şablondan diğer paletler (yazılar ve fotoğraf korunur)
    if (t && t.buildAt && window.Food && window.Food.rebuild) {
      const cur = +p.meta.palette || 0;
      t.palettes.map((_, i) => i).filter((i) => i !== cur).slice(0, 3).forEach((i) => { const tmp = JSON.parse(JSON.stringify(d0)); tmp.meta = Object.assign({}, tmp.meta, { palette: i }); const nd = window.Food.rebuild(tmp, d0.width, d0.height); if (nd) { nd.meta = Object.assign({}, tmp.meta); alts.push(['Renk ' + (i + 1), nd]); } });
    }
    // 3) foto paletinden renk (şablon dışı tasarımlarda)
    if (alts.length < 3 && window.P8 && window.P8.photoPalette) {
      const pal = await window.P8.photoPalette(d0).catch(() => null);
      if (pal && pal.length) { const c3 = JSON.parse(JSON.stringify(d0)); R.normalize(c3); const vivid = pal[0]; c3.layers.forEach((l) => { if (l.type === 'text' && l.fontSize > Math.min(c3.width, c3.height) * 0.06) l.fill = vivid; if (l.type === 'rect' && typeof l.fill === 'string' && l.w * l.h < c3.width * c3.height * 0.5 && !/^#?(fff|ffffff)$/i.test(l.fill.replace('#', ''))) l.fill = vivid; }); alts.push(['Fotoğraf renkleri', c3]); }
    }
    const cur = await scoreOf(d0), sc = []; for (const [, d] of alts) sc.push(await scoreOf(d));
    A().dialog(`<div class="d-body"><h3>${icon('sparkle')} Alternatif öneriler</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Şu anki tasarım puanı: <b>${cur.score}</b>. Beğendiğine dokun, tasarıma uygulanır (Geçmiş’ten geri alınır).</p>
      <div class="alt-g">${alts.map(([n, d], i) => `<button class="alt-it" data-i="${i}"><span class="alt-th">${R.renderSVG(R.normalize(d), { fit: true, prefix: 'al' + i + Math.random().toString(36).slice(2, 5) })}</span><b>${esc(n)}</b><small>Puan ${sc[i].score}${sc[i].score > cur.score ? ' ↑' : ''}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => $$('.alt-it', box).forEach((b) => (b.onclick = () => { const d = alts[+b.dataset.i][1]; e.doc.layers = d.layers; e.doc.background = d.background; if (d.meta) e.doc.meta = Object.assign({}, e.doc.meta, d.meta); R.normalize(e.doc); e.commit(); close(null); toast('Uygulandı'); })),
    });
  };
  P9.compare = async function () {
    let ps = []; try { ps = await A().api('projects'); } catch (e) {}
    if (ps.length < 2) return toast('Karşılaştırmak için en az 2 proje gerekli', true);
    const pick = [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('copy')} Tasarım karşılaştır</h3><p class="muted" style="font-size:13px;margin:0 0 10px">İki proje seç: yan yana görünür, okunabilirlik, hizalama, kenar payı ve yazım açısından puanlanır.</p><div class="cmp-pick" id="cpP">${ps.slice(0, 40).map((p) => `<button class="cmp-it" data-id="${p.id}">${p.thumb ? `<img alt="" src="${p.thumb}">` : '<i></i>'}<small>${esc(p.name || 'Adsız')}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="cpGo" disabled>Karşılaştır</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $('#cpP', box).onclick = (ev) => { const b = ev.target.closest('[data-id]'); if (!b) return; const i = pick.indexOf(b.dataset.id); if (i >= 0) pick.splice(i, 1); else { pick.push(b.dataset.id); if (pick.length > 2) pick.shift(); } $$('.cmp-it', box).forEach((x) => x.classList.toggle('on', pick.includes(x.dataset.id))); $('#cpGo', box).disabled = pick.length !== 2; };
        $('#cpGo', box).onclick = () => close(pick.slice());
      },
    });
    if (!res) return;
    const ds = await Promise.all(res.map((id) => A().api('projects/' + id)));
    ds.forEach((d) => { R.normalize(d); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); });
    const sc = []; for (const d of ds) sc.push(await scoreOf(d));
    const KIND = { contrast: 'Okunabilirlik', small: 'Küçük yazı', margin: 'Kenar payı', align: 'Hizalama', fonts: 'Yazı tipi', widow: 'Tek kalan kelime', outside: 'Taşan öğe', quotes: 'Tipografi', caps: 'Tipografi', price: 'Fiyat yazımı', scale: 'Yazı boyutları', colors: 'Renk', palette: 'Renk', rhythm: 'Aralık' };
    const cnt = (s) => { const m = {}; s.issues.forEach((i) => (m[KIND[i.k] || 'Diğer'] = (m[KIND[i.k] || 'Diğer'] || 0) + 1)); if (s.spell) m['Yazım'] = s.spell; return m; };
    const win = sc[0].score === sc[1].score ? -1 : sc[0].score > sc[1].score ? 0 : 1;
    A().dialog(`<div class="d-body"><h3>Karşılaştırma</h3><div class="cmp-g">${ds.map((d, i) => { const c = cnt(sc[i]); return `<div class="cmp-col ${win === i ? 'win' : ''}"><div class="cmp-th">${R.renderSVG(d, { fit: true, prefix: 'cp' + i })}</div><b>${esc(d.name || 'Adsız')}</b><div class="cmp-sc">${sc[i].score}<small>/100</small></div>${Object.keys(c).length ? `<ul>${Object.entries(c).map(([k, v]) => `<li>${esc(k)}: ${v}</li>`).join('')}</ul>` : '<p class="muted">Sorun yok</p>'}</div>`; }).join('')}</div>
      <p style="margin:10px 0 0">${win < 0 ? 'İki tasarım da aynı puanda.' : `<b>${esc(ds[win].name || 'Adsız')}</b> daha düzenli görünüyor.`} Diğerini açıp ⋯ → Tasarım koçu ile düzeltebilirsin.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, { cls: 'wide' });
  };

  // ================================================================ 13) OTOMATİK HAZIRLIKLAR (her perşembe cuma tasarımı, mübarek günlerden önce)
  const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  P9.autoRules = () => LS.get('ts_auto', { cuma: false, mubarek: false });
  P9.autoDialog = function () {
    const r = P9.autoRules();
    A().dialog(`<div class="d-body"><h3>${icon('calendar')} Otomatik hazırlıklar</h3><p class="muted" style="font-size:13px;margin:0 0 12px">Uygulamayı açtığında, sırası gelen tasarımlar senin için hazırlanır; sadece bakıp paylaşırsın. Bildirim izni verirsen haber de gelir.</p>
      <label class="ck-row"><input type="checkbox" id="auC" ${r.cuma ? 'checked' : ''}><span><b>Hayırlı Cumalar</b><small>Perşembe ve cuma günleri, o haftanın tarihi ve sıradaki hadisle</small></span></label>
      <label class="ck-row"><input type="checkbox" id="auM" ${r.mubarek ? 'checked' : ''}><span><b>Mübarek günler</b><small>Kandil, bayram, Ramazan ve Kurban’dan 3 gün önce</small></span></label>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="auN">${icon('bell') || icon('sparkle')}Bildirimlere izin ver</button><button class="btn sm ghost" id="auNow">Şimdi kontrol et</button></div></div>
      <div class="d-foot"><button class="btn primary" data-close>Tamam</button></div>`, {
      onOpen: (box) => {
        const save = () => LS.set('ts_auto', { cuma: $('#auC', box).checked, mubarek: $('#auM', box).checked });
        $('#auC', box).onchange = save; $('#auM', box).onchange = save;
        $('#auN', box).onclick = () => P9.askNotify();
        $('#auNow', box).onclick = async () => { save(); const n = await P9.runAuto(true); if (!n) toast('Şu an hazırlanacak yeni tasarım yok'); };
      },
    });
  };
  P9.runAuto = async function (manual) {
    if (!isAdmin()) return 0;
    const r = P9.autoRules(); if (!r.cuma && !r.mubarek) return 0;
    const done = LS.get('ts_auto_done', {}), made = [];
    const now = new Date(), dow = now.getDay();
    const L0 = L(); if (!L0) return 0;
    if (window.Food && window.Food.loadCharity) await window.Food.loadCharity().catch(() => {});
    const make = async (key, t, patch, name) => {
      if (done[key] || !t) return;
      const d = L0.instantiateAt(t, 0, null, t.w, t.h, undefined, patch);
      const p = Object.assign(A().newProject(d.width, d.height, name), { background: d.background, layers: d.layers, meta: Object.assign({}, d.meta, { auto: key }) });
      R.normalize(p); await R.ensureDocFonts(p).catch(() => {}); try { R.fitUnbreakable(p); } catch (e) {} await R.ensureImageSizes(p).catch(() => {});
      try { p.thumb = await R.thumbnail(p); } catch (e) {}
      await A().saveProject(p); done[key] = p.id; made.push([name, p.id]);
    };
    if (r.cuma && (dow === 4 || dow === 5) && window.P8) {
      const fr = window.P8.nextFriday(); await make('cuma-' + ymd(fr), L0.templates.find((t) => t.id === 'b-cuma'), window.P8.cumaPatch(), 'Hayırlı Cumalar · ' + trDate(fr));
    }
    if (r.mubarek && window.P7 && window.P7.hijriEvents) {
      const evs = [...window.P7.hijriEvents(now.getFullYear()), ...window.P7.hijriEvents(now.getFullYear() + 1)].filter((x) => { const k = daysTo(x.date); return k >= 0 && k <= 3; });
      for (const ev of evs) { const t = L0.templates.find((x) => x.id === (ev.tpl || [])[0]); const patch = ev.patch ? Object.assign({}, ev.patch, !ev.patch.date && ev.hijri ? { date: `(${ev.hijri})` } : {}) : undefined; await make('ev-' + ev.date + '-' + ev.name, t, patch, ev.name + ' · ' + trDate(new Date(ev.date + 'T12:00'))); }
    }
    LS.set('ts_auto_done', done);
    if (made.length) {
      const msg = made.length === 1 ? `“${made[0][0]}” tasarımın hazır` : `${made.length} tasarım hazır: ${made.map((m) => m[0]).join(', ')}`;
      toast(msg + ' — Pano’daki son projelerde');
      P9.notify('Tasarımın hazır', msg);
      if (manual && made.length === 1) A().go('editor', made[0][1]);
    }
    return made.length;
  };
  // ================================================================ BİLDİRİM
  P9.askNotify = async function () {
    if (!('Notification' in window)) return toast('Bu tarayıcı bildirimi desteklemiyor. Telefonda: Paylaş → Ana Ekrana Ekle, sonra uygulamadan aç.', true);
    const p = await Notification.requestPermission();
    toast(p === 'granted' ? 'Bildirimler açık' : 'Bildirim izni verilmedi');
    if (p === 'granted') P9.notify('Bildirimler açık', 'Cuma ve mübarek gün hatırlatmaları buraya gelecek');
  };
  P9.notify = async function (title, body) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      if (reg && reg.showNotification) await reg.showNotification(title, { body, icon: 'icons/icon-192.png', tag: 'ts-' + title });
      else new Notification(title, { body, icon: 'icons/icon-192.png' });
    } catch (e) {}
  };
  // açılışta: bugün/yarın mübarek gün ya da cuma ise hatırlat (günde bir kez)
  P9.dailyReminder = function () {
    const today = ymd(new Date()); if (LS.get('ts_notified', '') === today) return;
    const msgs = [], dow = new Date().getDay();
    if (dow === 4) msgs.push('Yarın cuma: Hayırlı Cumalar paylaşımını hazırla');
    if (isAdmin() && window.P7 && window.P7.hijriEvents) [...window.P7.hijriEvents(new Date().getFullYear())].forEach((x) => { const k = daysTo(x.date); if (k === 1) msgs.push(`Yarın ${x.name}`); if (k === 0) msgs.push(`Bugün ${x.name}`); });
    if (msgs.length) { P9.notify('Paylaşım hatırlatması', msgs.join(' · ')); LS.set('ts_notified', today); }
  };

  // ================================================================ YEDEKLEME ve GERİ DÖNÜŞÜM KUTUSU
  P9.backup = async function () {
    try {
      if (window.TS_CLOUD) { const j = await A().api('backup-json'); R.download(new Blob([JSON.stringify(j)], { type: 'application/json' }), `tasarim-studyosu-yedek-${ymd(new Date())}.json`); return toast('Yedek indirildi (projeler, şablonlar, görseller, yazı tipleri, marka)'); }
      const r = await fetch('/api/backup'); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Yedek alınamadı');
      R.download(await r.blob(), `tasarim-studyosu-yedek-${ymd(new Date())}.zip`);
      toast('Yedek indirildi: bu dosyayı güvenli bir yere (USB, Drive) koy');
    } catch (e) { toast(e.message, true); }
  };
  P9.restore = function () {
    A().pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      if (!(await A().confirmBox('Yedek geri yüklensin mi?', 'Yedekteki projeler, şablonlar, görseller ve ayarlar bu bilgisayara yazılır. Aynı adlı kayıtların üzerine yazılır; diğerleri korunur.', 'Geri yükle'))) return;
      try {
        let r;
        if (/\.json$/i.test(f.name)) r = await A().api('restore-json', { body: { backup: JSON.parse(await f.text()) } });
        else r = await A().api('restore', { body: { data: await blobToDataURL(f) } });
        toast(`${r.files} kayıt geri yüklendi; sayfa yenileniyor`); setTimeout(() => location.reload(), 1200);
      } catch (e) { toast('Geri yüklenemedi: ' + e.message, true); }
    }, false);
  };
  P9.trash = async function () {
    let list = []; try { list = await A().api('trash'); } catch (e) { return toast(e.message, true); }
    const ago = (t) => { const d = Math.floor((Date.now() / 1000 - t) / 86400); return d < 1 ? 'bugün' : d + ' gün önce'; };
    A().dialog(`<div class="d-body"><h3>${icon('trash')} Geri dönüşüm kutusu</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Silinen projeler 30 gün burada bekler, sonra kendiliğinden silinir.</p>
      <div class="tr-list" id="trL">${list.length ? list.map((p) => `<div class="tr-it" data-id="${p.id}">${p.thumb ? `<img alt="" src="${p.thumb}">` : '<i></i>'}<div><b>${esc(p.name || 'Adsız')}</b><small>${p.width}×${p.height} · ${ago(p.deleted)} silindi · ${Math.max(0, 30 - Math.floor((Date.now() / 1000 - p.deleted) / 86400))} gün kaldı</small></div><button class="btn sm" data-r>Geri al</button><button class="btn sm ghost" data-x>Kalıcı sil</button></div>`).join('') : '<p class="muted">Kutu boş</p>'}</div></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => $$('.tr-it', box).forEach((row) => {
        $('[data-r]', row).onclick = async () => { try { await A().api('trash', { body: { id: row.dataset.id } }); row.remove(); toast('Proje geri geldi'); } catch (e) { toast(e.message, true); } };
        $('[data-x]', row).onclick = async () => { if (!(await A().confirmBox('Kalıcı olarak silinsin mi?', 'Bu işlem geri alınamaz.', 'Sil'))) return; try { await A().api('trash', { body: { id: row.dataset.id, action: 'purge' } }); row.remove(); } catch (e) { toast(e.message, true); } };
      }),
    });
  };

  // ================================================================ POLAROİD, WHATSAPP PAKETİ, KALİTE UYARISI
  P9.polaroid = function (l) {
    const e = needDoc(); if (!e || !l || l.type !== 'image') return;
    const pad = Math.min(l.w, l.h) * 0.06, bottom = pad * 3.2, g = R.uid ? R.uid() : 'pg' + Date.now();
    const fr = { type: 'rect', name: 'Polaroid çerçeve', x: l.x - pad, y: l.y - pad, w: l.w + 2 * pad, h: l.h + pad + bottom, fill: '#FFFFFF', radius: 4, rotation: l.rotation || -3, shadow: { x: 0, y: pad * 0.4, blur: pad * 1.6, color: 'rgba(0,0,0,.25)' }, group: g };
    const cap = { type: 'text', name: 'Polaroid yazısı', text: 'Güzel bir an', x: l.x, y: l.y + l.h + pad * 0.5, w: l.w, h: bottom * 0.8, fontSize: Math.round(bottom * 0.42), fontFamily: 'Caveat', fontWeight: 600, fill: '#333333', align: 'center', rotation: l.rotation || -3, lineHeight: 1.1, group: g };
    l.rotation = l.rotation || -3; l.group = g; l.radius = 0; l.mask = 'none';
    const i = e.doc.layers.indexOf(l);
    e.doc.layers.splice(i, 0, R.normalize({ width: 1, height: 1, layers: [fr] }).layers[0]);
    e.doc.layers.splice(i + 2, 0, R.normalize({ width: 1, height: 1, layers: [cap] }).layers[0]);
    e.doc.layers.forEach((x) => x.type === 'text' && R.layoutText(x)); e.commit(); toast('Polaroid çerçeve eklendi; alttaki yazıya dokunup değiştirebilirsin');
  };
  P9.waPack = async function (p) {
    p = p || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    if (E()) E().flush(); await A().saveProject(p).catch(() => {});
    return window.Features.adaptRun(p, [{ w: 1080, h: 1920, name: 'WhatsApp durum' }, { w: 1080, h: 1080, name: 'WhatsApp kanal görseli' }, { w: 1200, h: 630, name: 'Bağlantı önizlemesi' }].filter((s) => !(s.w === p.width && s.h === p.height)), { title: 'WhatsApp paketi hazır: durum, kanal görseli, bağlantı önizlemesi' });
  };
  // A4 ve üstü baskıda bulanık çıkacak (büyütülmüş) fotoğraflar
  P9.qualityIssues = function (d) {
    const print = d.width >= 1200 && Math.abs(d.width / d.height - 0.707) < 0.03 || Math.abs(d.height / d.width - 0.707) < 0.03;
    const out = [];
    (d.layers || []).forEach((l) => {
      if (l.type !== 'image' || !l.nw || l.visible === false || /^Süs|desen|zemin/i.test(l.name || '') || /^data:image\/svg/.test(l.src || '')) return;
      const cw = l.crop ? l.crop.w * l.nw : l.nw, k = cw / (l.w * (+l.zoom || 1) * (l.fit === 'cover' ? Math.max(1, (l.nh / l.nw) * (l.w / l.h)) : 1));
      const need = print ? 1.6 : 0.8; // A4 1240 px → 300 dpi baskı için ~2 kat çözünürlük iyi olur
      if (k < need) out.push({ l, k, msg: print ? `“${l.name}” baskıda bulanık çıkabilir (çözünürlük düşük: %${Math.round((k / need) * 100)})` : `“${l.name}” büyütülmüş, bulanık görünebilir` });
    });
    return out;
  };

  // ================================================================ başlangıç kancaları
  // editör açılırken geri sayımları güncelle
  const hookEditor = () => { const Ed = window.Editor; if (!Ed || Ed._p9) return; Ed._p9 = true; const m = Ed.mount; Ed.mount = function (page, doc, opts) { try { if (doc && P9.refreshCountdowns(doc)) {} } catch (e) {} return m.call(this, page, doc, opts); }; };
  hookEditor(); document.addEventListener('DOMContentLoaded', hookEditor);
  // dışa aktarmada da güncel sayı
  if (R && R.exportBlob && !R._p9) { R._p9 = true; const ex = R.exportBlob; R.exportBlob = function (d, ...a) { try { P9.refreshCountdowns(d); } catch (e) {} return ex.call(this, d, ...a); }; }
  setTimeout(() => { if (!A() || !A().S) return; P9.runAuto(false).catch(() => {}); P9.dailyReminder(); }, 6000);
})();
