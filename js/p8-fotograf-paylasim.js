/* Tasarım Stüdyosu v6 — akıllı kadraj, fotoğraf iyileştirme, fotoğraftan renk, bağış QR rozeti,
   Hayırlı Cumalar söz havuzu, paylaşım takvimi (.ics), tüm boyutlar, hikâye videosu, dil paketi, sesle düzenleme */
(function () {
  const P8 = (window.P8 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const brand = () => (A().S && A().S.brand) || {};

  // ================================================================ görsel analizi (küçük tuvalde, hızlı)
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('Görsel açılamadı')); im.src = src; });
  async function sample(src, N = 96) {
    const im = await loadImg(src);
    const k = N / Math.max(im.naturalWidth, im.naturalHeight), w = Math.max(8, Math.round(im.naturalWidth * k)), h = Math.max(8, Math.round(im.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
    return { w, h, d: x.getImageData(0, 0, w, h).data };
  }
  // ten rengi (YCbCr) yoğunluğu → yüzlerin olduğu bölge; yoksa kenar/doku yoğunluğu (ilgi noktası)
  P8.focusOf = async function (src) {
    const { w, h, d } = await sample(src, 96);
    const skin = new Float32Array(w * h), edge = new Float32Array(w * h);
    let ns = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 40) continue;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b, cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      if (cb > 77 && cb < 127 && cr > 135 && cr < 175 && r > 40 && r > b) { skin[y * w + x] = 1; ns++; }
      if (x > 0 && y > 0) { const j = ((y - 1) * w + x) * 4, k2 = (y * w + x - 1) * 4; edge[y * w + x] = Math.abs(r - d[j]) + Math.abs(g - d[j + 1]) + Math.abs(r - d[k2]) + Math.abs(g - d[k2 + 1]); }
    }
    const frac = ns / (w * h);
    let sx = 0, sy = 0, sw = 0;
    if (frac > 0.004 && frac < 0.6) {
      // ten piksellerinin üst yarısına ağırlık ver: yüzler genelde ellerin ve kolların üstündedir
      let top = h, bot = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (skin[y * w + x]) { top = Math.min(top, y); bot = Math.max(bot, y); }
      const lim = top + (bot - top) * 0.6;
      for (let y = top; y <= lim; y++) for (let x = 0; x < w; x++) if (skin[y * w + x]) { const wt = 1 + (lim - y) / Math.max(1, lim - top); sx += x * wt; sy += y * wt; sw += wt; }
      if (sw) return { x: +(sx / sw / w).toFixed(3), y: +(sy / sw / h).toFixed(3), faces: true };
    }
    for (let y = 1; y < h; y++) for (let x = 1; x < w; x++) { const e = edge[y * w + x]; const wt = e * e; sx += x * wt; sy += y * wt; sw += wt; }
    if (!sw) return { x: 0.5, y: 0.45, faces: false };
    return { x: +((sx / sw / w) * 0.7 + 0.15).toFixed(3), y: +((sy / sw / h) * 0.7 + 0.15).toFixed(3), faces: false };
  };
  P8.smartCrop = async function (l, quiet) {
    if (!l || l.type !== 'image' || !l.src) return false;
    try {
      const f = await P8.focusOf(l.src);
      l.focus = { x: f.x, y: f.y }; l.ox = 0; l.oy = 0;
      if (!quiet) toast(f.faces ? 'Akıllı kadraj: yüzler ortalandı' : 'Akıllı kadraj: fotoğrafın ilgi çekici bölgesi ortalandı');
      return true;
    } catch (e) { if (!quiet) toast(e.message, true); return false; }
  };
  // otomatik iyileştirme: karanlık / soluk / bulanık telefon fotoğrafları
  P8.enhance = async function (l) {
    if (!l || l.type !== 'image') return;
    const { w, h, d } = await sample(l.src, 128);
    const hist = new Array(256).fill(0); let n = 0, satSum = 0, lap = 0;
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { if (d[i + 3] < 40) continue; const r = d[i], g = d[i + 1], b = d[i + 2], L = 0.299 * r + 0.587 * g + 0.114 * b; lum[p] = L; hist[L | 0]++; n++; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); satSum += mx ? (mx - mn) / mx : 0; }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const p = y * w + x; lap += Math.abs(4 * lum[p] - lum[p - 1] - lum[p + 1] - lum[p - w] - lum[p + w]); }
    lap /= (w - 2) * (h - 2);
    const pct = (q) => { let c = 0; for (let i = 0; i < 256; i++) { c += hist[i]; if (c >= n * q) return i; } return 255; };
    const lo = pct(0.02), hi = pct(0.98), mid = pct(0.5), sat = satSum / Math.max(1, n);
    const f = Object.assign({}, l.filters || {});
    const range = Math.max(30, hi - lo);
    f.contrast = Math.round(Math.min(135, Math.max(100, (100 * 220) / range)));
    f.brightness = Math.round(Math.min(130, Math.max(92, 100 + (118 - mid) * 0.22)));
    f.saturate = Math.round(sat < 0.18 ? 125 : sat < 0.3 ? 112 : 102);
    f.sharpen = lap < 9 ? 45 : lap < 14 ? 25 : 10;
    l.filters = f;
    return f;
  };
  // fotoğraftan renk paleti (k-ortalama, 5 renk)
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  P8.paletteOf = async function (src, k = 5) {
    const { d } = await sample(src, 64);
    const px = []; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 120) px.push([d[i], d[i + 1], d[i + 2]]);
    if (!px.length) return [];
    let C = Array.from({ length: k }, (_, i) => px[Math.floor((i + 0.5) * px.length / k)].slice());
    for (let it = 0; it < 8; it++) {
      const S = C.map(() => [0, 0, 0, 0]);
      px.forEach((p) => { let bi = 0, bd = 1e9; C.forEach((c, j) => { const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (dd < bd) { bd = dd; bi = j; } }); const s = S[bi]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      C = S.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3], s[3]] : C[j]));
    }
    // canlı renkler öne
    const sat = (c) => { const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]); return mx ? (mx - mn) / mx : 0; };
    return C.sort((a, b) => sat(b) * (b[3] || 1) ** 0.5 - sat(a) * (a[3] || 1) ** 0.5).map((c) => hex(c[0], c[1], c[2]));
  };
  P8.photoPalette = async function (doc) {
    const ph = (doc.layers || []).filter((l) => l.type === 'image' && l.visible !== false && l.src && (l.role === 'photo' || /resmi|fotoğraf/i.test(l.name || ''))).sort((a, b) => b.w * b.h - a.w * a.h)[0];
    if (!ph) return null;
    try { return await P8.paletteOf(ph.src); } catch (e) { return null; }
  };

  // ================================================================ bağış QR rozeti
  P8.qrBadge = function () {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const D = brand().donate || {}, def = D.url ? (/^https?:/.test(D.url) ? D.url : 'https://' + D.url) : D.wa ? 'https://wa.me/' + String(D.wa).replace(/\D/g, '').replace(/^0/, '90') : '';
    A().dialog(`<div class="d-body"><h3>${icon('qr')} Bağış QR rozeti</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Telefon kamerasıyla okutunca bağış sayfası, WhatsApp ya da IBAN açılır. Marka → Bağış bilgileri doluysa otomatik gelir.</p>
      <div class="chips" id="qbT"><button class="chip on" data-k="url">Bağış sayfası</button><button class="chip" data-k="wa">WhatsApp</button><button class="chip" data-k="iban">IBAN</button></div>
      <label class="field"><span id="qbL">Adres</span><input class="inp" id="qbV" value="${esc(def)}" placeholder="https://dernek.org/bagis"></label>
      <label class="field"><span>Rozet yazısı</span><input class="inp" id="qbS" value="Bağış için okutun"></label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="qbOk">${icon('plus')}Ekle</button></div>`, {
      onOpen: (box, close) => {
        let k = 'url';
        $('#qbT', box).onclick = (ev) => { const b = ev.target.closest('[data-k]'); if (!b) return; k = b.dataset.k; $$('#qbT .chip', box).forEach((x) => x.classList.toggle('on', x === b)); const L = { url: ['Adres', def || 'https://'], wa: ['WhatsApp numarası', D.wa || brand().phone || ''], iban: ['IBAN', D.iban || ''] }[k]; $('#qbL', box).textContent = L[0]; $('#qbV', box).value = L[1]; };
        $('#qbOk', box).onclick = () => {
          let v = $('#qbV', box).value.trim(); if (!v) return toast('Önce bilgiyi yaz', true);
          if (k === 'url' && !/^https?:/.test(v)) v = 'https://' + v;
          if (k === 'wa') v = 'https://wa.me/' + v.replace(/\D/g, '').replace(/^0/, '90');
          if (k === 'iban') v = v.replace(/\s+/g, ' ').toUpperCase();
          close(null); add(v, $('#qbS', box).value.trim());
        };
      },
    });
    async function add(text, label) {
      const d = e.doc, T = window.Tools;
      let q; try { q = T.qrPath(T.qr(text, 'M'), 'rounded', 0); } catch (er) { return toast(er.message, true); }
      const S = Math.round(Math.min(d.width, d.height) * 0.2), pad = S * 0.1, bw = S + pad * 2, bh = S + pad * 2 + S * 0.2;
      // yazıların ve logonun üstüne binmeyen köşeyi seç
      const mx = d.width * 0.05, my = d.height * 0.04;
      const spots = [[d.width - bw - mx, d.height - bh - my], [mx, d.height - bh - my], [d.width - bw - mx, my], [mx, my], [d.width - bw - mx, (d.height - bh) / 2], [mx, (d.height - bh) / 2]];
      const ov = (ax, ay) => d.layers.reduce((sum, l) => { if (l.visible === false || /^Süs/.test(l.name || '')) return sum; const wgt = l.type === 'text' ? 1 : /logo/i.test(l.name || '') ? 1 : l.type === 'image' && l.w * l.h < d.width * d.height * 0.5 ? 0.25 : 0; if (!wgt) return sum; const ix = Math.max(0, Math.min(ax + bw, l.x + l.w) - Math.max(ax, l.x)), iy = Math.max(0, Math.min(ay + bh, l.y + l.h) - Math.max(ay, l.y)); return sum + ix * iy * wgt; }, 0);
      let best = spots[0], bs = Infinity; spots.forEach((sp, i) => { const v = ov(sp[0], sp[1]) + i; if (v < bs) { bs = v; best = sp; } });
      const [x, y] = window.P9 && window.P9.quietSpot ? await window.P9.quietSpot(d, bw, bh) : best;
      const ink = (brand().colors || [])[0] || '#14161B';
      e.insert([
        { type: 'rect', name: 'QR rozeti zemini', x, y, w: bw, h: bh, fill: '#FFFFFF', radius: S * 0.1, shadow: { x: 0, y: S * 0.02, blur: S * 0.08, color: 'rgba(0,0,0,0.18)' } },
        { type: 'path', name: 'Bağış QR', role: 'qr', d: q.d, vw: q.size, vh: q.size, x: x + pad, y: y + pad, w: S, h: S, fill: ink, qr: { text, type: 'donate' } },
        { type: 'text', name: 'QR rozeti yazısı', text: label || 'Bağış için okutun', x, y: y + pad + S + S * 0.04, w: bw, h: S * 0.12, fontSize: Math.round(S * 0.085), fontFamily: 'Poppins', fontWeight: 600, fill: ink, align: 'center', lineHeight: 1.1 },
      ], { group: true });
      toast('QR rozeti eklendi — telefon kamerasıyla okutup dene');
    }
  };

  // ================================================================ Hayırlı Cumalar: söz havuzu (aynısı arka arkaya gelmez)
  P8.QUOTES = [
    ['Ameller ancak niyetlere göredir.', 'Buhârî, Müslim'],
    ['Sizin en hayırlınız Kur’an’ı öğrenen ve öğretendir.', 'Buhârî'],
    ['Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.', 'Buhârî, Müslim'],
    ['Sadaka malı eksiltmez.', 'Müslim'],
    ['Müslüman, elinden ve dilinden Müslümanların emin olduğu kimsedir.', 'Buhârî, Müslim'],
    ['Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe gerçek manada iman etmiş olmaz.', 'Buhârî, Müslim'],
    ['Üzerine güneş doğan en hayırlı gün cuma günüdür.', 'Müslim'],
    ['Kardeşini güler yüzle karşılaman sadakadır.', 'Tirmizî'],
    ['Allah sizin suretlerinize ve mallarınıza bakmaz; kalplerinize ve amellerinize bakar.', 'Müslim'],
    ['Merhamet etmeyene merhamet edilmez.', 'Buhârî, Müslim'],
    ['Veren el, alan elden üstündür.', 'Buhârî, Müslim'],
    ['Allah’a en sevimli gelen amel, az da olsa devamlı olanıdır.', 'Buhârî, Müslim'],
  ];
  P8.nextQuote = function () {
    let i = 0; try { i = (+localStorage.getItem('ts_qi') || 0) % P8.QUOTES.length; localStorage.setItem('ts_qi', String(i + 1)); } catch (e) {}
    const [t, s] = P8.QUOTES[i];
    return `Peygamber Efendimiz (s.a.v.) buyurdu: “${t}” (${s})`;
  };
  P8.nextFriday = function (from) { const d = from ? new Date(from) : new Date(); d.setHours(12, 0, 0, 0); while (d.getDay() !== 5) d.setDate(d.getDate() + 1); return d; };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const TRM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  P8.cumaPatch = function () {
    const fr = P8.nextFriday(), hj = window.P7 && window.P7.hijriLabel ? window.P7.hijriLabel(ymd(fr)) : '';
    const nb = (x) => x.replace(/ /g, '\u00A0');
    return { date: `${fr.getDate()} ${TRM[fr.getMonth()]} ${fr.getFullYear()}${hj ? '\n' + nb(hj) : ''}`, quote: P8.nextQuote() };
  };

  // ================================================================ paylaşım takvimi: telefon takvimine eklenir (.ics, 1 gün önce hatırlatır)
  P8.ics = function ({ fridays = true } = {}) {
    if (!window.P7 || !window.P7.hijriEvents) return toast('Takvim hazır değil', true);
    const now = new Date(), y = now.getFullYear(), today = ymd(now), lim = ymd(new Date(now.getTime() + 400 * 864e5));
    const evs = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].filter((e) => e.date >= today && e.date <= lim);
    const st = (s) => s.replace(/-/g, ''), nx = (s) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + 1); return ymd(d).replace(/-/g, ''); };
    const escI = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tasarim Studyosu//TR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Paylaşım takvimi'];
    evs.forEach((e, i) => L.push('BEGIN:VEVENT', `UID:ts-${st(e.date)}-${i}@tasarim`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${st(e.date)}`, `DTEND;VALUE=DATE:${nx(e.date)}`, `SUMMARY:${escI(e.name + ' — paylaşım')}`, `DESCRIPTION:${escI((e.prompt || '') + (e.hijri ? ' · ' + e.hijri : '') + '\nTasarım Stüdyosu → Şablonlar → Bağış · Kampanya')}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escI('Yarın ' + e.name + ': tasarımı hazırla')}`, 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT'));
    if (fridays) { const fr = P8.nextFriday(); L.push('BEGIN:VEVENT', `UID:ts-cuma@tasarim`, `DTSTAMP:${stamp}`, `DTSTART:${st(ymd(fr))}T080000`, `DTEND:${st(ymd(fr))}T081500`, 'RRULE:FREQ=WEEKLY;BYDAY=FR', 'SUMMARY:Hayırlı Cumalar paylaşımı', 'DESCRIPTION:Şablonlar → Hayırlı Cumalar (söz her hafta değişir)', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Cuma paylaşımı', 'TRIGGER:-PT12H', 'END:VALARM', 'END:VEVENT'); }
    L.push('END:VCALENDAR');
    R.download(new Blob([L.join('\r\n')], { type: 'text/calendar' }), 'paylasim-takvimi.ics');
    toast(`${evs.length} mübarek gün${fridays ? ' ve her cuma' : ''} takvim dosyasına yazıldı. Dosyayı açınca telefonun takvimine eklenir; 1 gün önce hatırlatır.`);
    return evs.length;
  };

  // ================================================================ tek tıkla tüm boyutlar
  P8.SIZES = [{ w: 1080, h: 1080, name: 'Instagram kare', k: 'ig' }, { w: 1080, h: 1350, name: 'Instagram 4-5', k: 'ig45' }, { w: 1080, h: 1920, name: 'Story - WhatsApp durum', k: 'story' }, { w: 2480, h: 3508, name: 'A4 baskı', k: 'a4' }];
  P8.allSizes = async function (p) {
    p = p || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    if (E()) E().flush();
    await A().saveProject(p).catch(() => {});
    const sel = P8.SIZES.filter((s) => !(s.w === p.width && s.h === p.height));
    return window.Features.adaptRun(p, sel, { title: 'Tüm boyutlar hazır: post, 4:5, story / WhatsApp durum, A4' });
  };

  // ================================================================ hikâye videosu (1080×1920, yazılar sırayla gelir)
  P8.storyVideo = async function (p) {
    p = p || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    if (E()) E().flush();
    let np = p;
    if (!(p.width === 1080 && p.height === 1920)) {
      const d = A().designOf(p);
      const nd = (window.Food && window.Food.rebuild && window.Food.rebuild(d, 1080, 1920)) || (window.P6 && window.P6.smartResize ? window.P6.smartResize(d, 1080, 1920) : null);
      if (!nd) return toast('Bu tasarım hikâye boyutuna uyarlanamadı', true);
      await R.ensureImageSizes(nd).catch(() => {});
      np = Object.assign(A().newProject(1080, 1920, (p.name || 'Tasarım') + ' · Hikâye videosu'), { background: nd.background, layers: nd.layers, meta: Object.assign({}, nd.meta || {}) });
      await A().saveProject(np);
    }
    toast('Hikâye boyutu hazır, animasyon kuruluyor…');
    return window.P7.video(np);
  };

  // ================================================================ dil paketi: Türkçe + İspanyolca + İngilizce
  const GLOSS = {
    'Hayırlı': ['Bendecidas', 'Blessed'], 'Haftalar': ['Semanas', 'Weeks'], 'Cumalar': ['Viernes', 'Fridays'], 'Bu hafta': ['Esta semana', 'This week'], 'Kandiller': ['Noches Benditas', 'Holy Nights'],
    'Üç Aylar': ['Tres Meses Sagrados', 'Three Holy Months'], 'Bayramınız': ['¡Feliz', 'Happy'], 'Mübarek Olsun': ['Eid!', 'Eid!'], 'Cuma': ['Viernes', 'Friday'], 'Cumanız mübarek olsun': ['Bendito viernes', 'Blessed Friday'],
    'Bağışınız Ulaştı': ['Su donación llegó', 'Your donation arrived'], 'Kurbanınız Kesildi': ['Su Qurbani fue realizado', 'Your Qurbani was performed'], 'Teşekkür ederiz': ['Gracias', 'Thank you'], 'Sayın': ['Estimado/a', 'Dear'],
    'Bağış için okutun': ['Escanee para donar', 'Scan to donate'], 'Sevgili Peygamber efendimizin kainata teşrifi': ['El nacimiento de nuestro amado Profeta', 'The birth of our beloved Prophet'],
  };
  P8.GLOSS = GLOSS;
  const gkey = (x) => String(x || '').replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ').trim();
  P8.gloss = (pl, gi) => { const g = GLOSS[pl] || GLOSS[gkey(pl)]; return g ? g[gi] : null; };
  P8.langPack = async function (p) {
    p = p || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    if (E()) E().flush();
    const LG = [['İspanyolca', 'es', 0], ['İngilizce', 'en', 1]];
    const aiOn = true; // yapay zekâ yoksa istek hata verir, hazır sözlüğe düşülür
    const prog = document.createElement('div'); prog.className = 'tk-prog'; document.body.appendChild(prog);
    const files = [], missed = new Set();
    try {
      prog.textContent = 'Türkçe hazırlanıyor…';
      files.push({ name: 'tr.jpg', data: new Uint8Array(await (await R.exportBlob(p, 'jpg', 1)).arrayBuffer()) });
      for (const [lang, code, gi] of LG) {
        prog.textContent = `${lang} hazırlanıyor…`;
        const d = JSON.parse(JSON.stringify(R.clean ? R.clean(p) : p)); R.normalize(d);
        const texts = d.layers.filter((l) => l.type === 'text' && R.plain(l.text).trim() && !/^[\d\s.,:;()₺$€%+\-/]+$/.test(R.plain(l.text)));
        let map = new Map();
        if (aiOn) { try { const out = await A().api('ai-text', { body: { task: 'translate', lang, items: texts.map((t) => ({ id: t.id, text: R.plain(t.text) })) } }); map = new Map((out.items || []).map((it) => [it.id, it.text])); } catch (e) {} }
        texts.forEach((t) => {
          const pl = R.plain(t.text).trim(); let nt = map.get(t.id);
          if (!nt) nt = P8.gloss(pl, gi);
          if (!nt) { missed.add(pl.slice(0, 30)); return; }
          const ow = t.w, of = t.fontSize; t.text = nt; R.layoutText(t);
          for (let k = 0; k < 12 && t._lines && t.maxLines && t._lines.length > t.maxLines; k++) { t.fontSize = Math.round(t.fontSize * 0.93); R.layoutText(t); }
          void ow; void of;
        });
        d.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
        if (window.Food && window.Food.reflowPrices) window.Food.reflowPrices(d);
        await R.ensureImageSizes(d).catch(() => {});
        files.push({ name: code + '.jpg', data: new Uint8Array(await (await R.exportBlob(d, 'jpg', 1)).arrayBuffer()) });
        // düzenlenebilir kopya olarak da kaydet
        const np = Object.assign(A().newProject(d.width, d.height, `${p.name || 'Tasarım'} — ${lang}`), { background: d.background, layers: d.layers, meta: d.meta });
        await A().saveProject(np).catch(() => {});
      }
      R.download(window.Tools.zip(files), `${(p.name || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-')}-diller.zip`);
      toast(missed.size ? 'Dil paketi indi. Yapay zekâ bağlı olmadığı için yalnızca hazır sözlükteki ifadeler çevrildi; kalanları Projeler’deki “— İspanyolca / İngilizce” kopyalarında düzeltebilirsin.' : 'Türkçe, İspanyolca ve İngilizce sürümler indi; düzenlenebilir kopyalar Projeler’de');
    } catch (e) { toast('Dil paketi hazırlanamadı: ' + e.message, true); }
    prog.remove();
  };

  // hazır şablonda yazı değişince kutular yazıya göre yeniden kurulsun (sonradan eklenen katmanlar korunur)
  P8.reflow = function (doc) {
    if (!doc || !doc.meta || !doc.meta.template || !window.Food || !window.Food.rebuild) return false;
    // güncel yazıları şablon alanlarına geri yaz: yerleşim yeni yazıya göre hesaplansın
    const KEY = { 'Başlık': 'title', 'El yazısı': 'script', 'Sekme başlığı': 'tag', 'Alt başlık': 'sub', 'Tarih': 'date', 'Alıntı': 'quote', 'Logo': 'logo', 'Logo alt yazısı': 'logoSub', 'Bağışçı adı': 'name', 'Hitap': 'hi' };
    const patch = Object.assign({}, doc.meta.patch || {});
    doc.layers.forEach((l) => { if (l.type === 'text' && KEY[l.name] && !(KEY[l.name] in patch && patch[KEY[l.name]] === R.plain(l.text))) patch[KEY[l.name]] = R.plain(l.text); });
    const oldPatch = doc.meta.patch; doc.meta.patch = patch;
    const nd = window.Food.rebuild(doc, doc.width, doc.height); if (!nd) { doc.meta.patch = oldPatch; return false; }
    const names = new Set(nd.layers.map((l) => l.name));
    const extra = doc.layers.filter((l) => !names.has(l.name));
    // kullanıcının değiştirdiği yazı boyutları ve kadraj korunur
    const by = {}; doc.layers.forEach((l) => (by[l.name] = by[l.name] || l));
    nd.layers.forEach((l) => { const o = by[l.name]; if (!o) return; if (l.type === 'text' && o.type === 'text' && o._userSize) { l.fontSize = o.fontSize; R.layoutText(l); l._userSize = true; } if (l.type === 'image' && o.type === 'image') { ['ox', 'oy'].forEach((k) => { if (o[k] != null) l[k] = o[k]; }); } });
    doc.layers = [...nd.layers, ...extra];
    return true;
  };
  // ================================================================ sesle düzenleme
  const TARGETS = [[/alt ?başlı|açıklama/, ['Alt başlık']], [/sekme|kutu|bu hafta/, ['Sekme başlığı']], [/başlı?ğ?/, ['Başlık']], [/el ?yazı|haftalar|cumalar|imza/, ['El yazısı']], [/alıntı|hadis|söz|ayet/, ['Alıntı']], [/tarih/, ['Tarih']], [/sekme|kutu|bu hafta/, ['Sekme başlığı']], [/alt ?başlık|açıklama/, ['Alt başlık']], [/logo/, ['Logo']], [/isim|ad soyad|adı/, ['Bağışçı adı']]];
  const COLORS = { kırmızı: '#C62828', mavi: '#1565C0', lacivert: '#1B2A4A', yeşil: '#0F5A45', 'koyu yeşil': '#0B4635', sarı: '#F2B705', altın: '#C9A227', turuncu: '#EF6C00', mor: '#6A1B9A', pembe: '#D81B60', siyah: '#14161B', beyaz: '#FFFFFF', gri: '#6B7280', kahverengi: '#6D4C41', bordo: '#7B1E2B', turkuaz: '#00897B' };
  function findTarget(e, t) {
    const d = e.doc;
    for (const [re, names] of TARGETS) if (re.test(t)) { const l = d.layers.find((x) => x.type === 'text' && names.includes(x.name)); if (l) return l; }
    const sel = e.state && e.state.sel && e.state.sel.length === 1 ? d.layers.find((x) => x.id === e.state.sel[0]) : null;
    if (sel && sel.type === 'text') return sel;
    return d.layers.filter((x) => x.type === 'text' && x.visible !== false).sort((a, b) => b.fontSize - a.fontSize)[0];
  }
  P8.runVoice = function (raw) {
    const e = E(); if (!e) return 'Önce bir tasarım aç';
    const t = raw.toLocaleLowerCase('tr-TR').trim();
    if (/geri al/.test(t)) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })); return 'Geri alındı'; }
    if (/(resmi|fotoğrafı|görseli) değiştir/.test(t)) { e.state.replacePhotoFlow && e.state.replacePhotoFlow(); return 'Resim seçici açıldı'; }
    if (/yazıları düzenle/.test(t)) { e.state.textForm && e.state.textForm(); return 'Yazı listesi açıldı'; }
    if (/paylaş/.test(t)) { window.P7.share(e.doc); return 'Paylaşılıyor'; }
    if (/video/.test(t)) { P8.storyVideo(); return 'Hikâye videosu hazırlanıyor'; }
    if (/(tüm|bütün) boyut/.test(t)) { P8.allSizes(); return 'Tüm boyutlar hazırlanıyor'; }
    if (/kadraj|ortala.*yüz|yüz.*ortala/.test(t)) { const ph = e.doc.layers.find((l) => l.type === 'image' && l.role === 'photo'); if (ph) P8.smartCrop(ph).then(() => e.commit()); return 'Kadraj ayarlanıyor'; }
    if (/iyileştir|netleştir|aydınlat/.test(t)) { const ph = e.doc.layers.find((l) => l.type === 'image' && l.role === 'photo'); if (ph) P8.enhance(ph).then(() => e.commit()); return 'Fotoğraf iyileştiriliyor'; }
    // “başlığı X yap / başlık X olsun / başlığa X yaz”
    const m = /\s(olsun|yap|yaz|değiştir)$/.test(t);
    const sizeUp = /büyüt|büyük/.test(t), sizeDown = /küçült|küçük/.test(t);
    const col = Object.keys(COLORS).sort((a, b) => b.length - a.length).find((c) => t.includes(c));
    const l = findTarget(e, t);
    if (!l) return 'Değiştirilecek yazı bulunamadı';
    if (sizeUp || sizeDown) { l.fontSize = Math.round(l.fontSize * (sizeUp ? 1.15 : 0.87)); l._userSize = true; R.layoutText(l); e.commit(); return `${l.name} ${sizeUp ? 'büyütüldü' : 'küçültüldü'}`; }
    if (col && /renk|rengi|yap/.test(t)) { l.fill = COLORS[col]; e.commit(); return `${l.name} ${col} yapıldı`; }
    if (m) {
      // hedef sözcüğünü at, kalan metni yaz (orijinal büyük-küçük harfle)
      const words = raw.trim().split(/\s+/).slice(0, -1); while (words.length > 1 && /^(alt|başlı\S*|el|yazı\S*|alıntı\S*|hadis\S*|tarih\S*|sekme\S*|kutu\S*|logo\S*|isim\S*|ad[ıi]\S*|açıklama\S*)$/i.test(words[0])) words.shift(); const body = words.join(' ').replace(/\s+(olarak|diye)$/i, '').replace(/[“"']/g, '').trim();
      if (body) { const nm = l.name; l.text = body.charAt(0).toLocaleUpperCase('tr-TR') + body.slice(1); R.layoutText(l); P8.reflow(e.doc); e.commit(); const l2 = e.doc.layers.find((x) => x.name === nm) || l; e.select && e.select([]); return `${nm}: “${l2.text}”`; }
    }
    return null;
  };
  P8.voice = function () {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ex = ['“Başlığı büyüt”', '“Alıntıyı küçült”', '“Başlık Hayırlı Cumalar olsun”', '“Başlığın rengini lacivert yap”', '“Resmi değiştir”', '“Yüzleri ortala”', '“Fotoğrafı iyileştir”', '“Video yap”', '“Paylaş”', '“Geri al”'];
    A().dialog(`<div class="d-body vc"><h3>${icon('sparkle')} Sesle düzenle</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Mikrofona dokun ve söyle. Örnekler: ${ex.join(' · ')}</p>
      <button class="vc-mic" id="vcM" aria-label="Konuş"><svg viewBox="0 0 24 24" class="i"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3"/></svg></button>
      <input class="inp" id="vcT" placeholder="…ya da buraya yaz, Enter’a bas" style="margin-top:12px"><div class="vc-log" id="vcL"></div></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      onOpen: (box) => {
        const log = (m, ok) => { const d = document.createElement('div'); d.className = ok ? 'ok' : 'no'; d.textContent = m; $('#vcL', box).prepend(d); };
        const run = (txt) => { const r = P8.runVoice(txt); log(`“${txt}” → ${r || 'anlaşılamadı, örneklerden birini dene'}`, !!r); };
        $('#vcT', box).onkeydown = (ev) => { if (ev.key === 'Enter' && ev.target.value.trim()) { run(ev.target.value.trim()); ev.target.value = ''; } };
        let rec = null;
        $('#vcM', box).onclick = () => {
          if (R.native && R.native()) {
            const b = $('#vcM', box); b.classList.add('rec');
            window.tsVoice = (t, done, err) => { if (err) { log(err); b.classList.remove('rec'); return; } if (t) $('#vcT', box).value = t; if (done) { b.classList.remove('rec'); if (t) run(t); } };
            window.webkit.messageHandlers.tsNative.postMessage({ cmd: 'voiceStart', lang: 'tr-TR' }); return;
          }
          if (!SR) return log('Bu tarayıcı sesi tanımıyor. Telefon klavyesindeki mikrofonla kutuya söyleyip Enter’a basabilirsin.');
          if (!window.isSecureContext) return log('Ses için güvenli bağlantı (HTTPS) gerekiyor. Klavyedeki mikrofonla kutuya söyleyebilirsin.');
          if (rec) { rec.stop(); return; }
          rec = new SR(); rec.lang = 'tr-TR'; rec.interimResults = true; rec.continuous = false;
          let last = '';
          rec.onresult = (ev) => { last = [...ev.results].map((r) => r[0].transcript).join(''); $('#vcT', box).value = last; };
          rec.onerror = (ev) => log('Ses alınamadı: ' + ev.error);
          rec.onend = () => { $('#vcM', box).classList.remove('rec'); rec = null; if (last) { run(last); $('#vcT', box).value = ''; } };
          $('#vcM', box).classList.add('rec'); rec.start();
        };
      },
    });
  };
})();
