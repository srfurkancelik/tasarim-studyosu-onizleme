/* Tasarım Stüdyosu v5.7 — bağış kampanyaları için araçlar
   1) Kampanya seti: bir kez yaz, 5 ölçü aynı tasarım dilinde
   2) Bağış takibi: hedef / toplanan / kalan gün güncelle
   3) Bağış bilgisi kartı: IBAN, banka, alıcı, WhatsApp, QR
   4) Teşekkür ve kesim kartları: isim listesinden toplu üretim
   5) Hicri takvim: kandiller, Ramazan, Kurban, Aşure
   7) Görselden şablon
   8) Marka kilidi
   9) Telefondan paylaş
   10) Kısa video */
(function () {
  'use strict';
  const R = window.Render, T = window.Tools;
  const A = () => window.App, F = () => window.Features, L = () => window.Library, Fd = () => window.Food;
  const E = () => A() && A().S && A().S.editorApi;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (...a) => window.icon(...a);
  const toast = (m, e) => A().toast(m, e);
  const brand = () => (A() && A().S.brand) || {};
  const tpl = (id) => L().templates.find((t) => t.id === id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fontsReady = () => (Fd() && Fd().loadCharity ? Promise.race([Fd().loadCharity(), sleep(6000)]) : Promise.resolve());
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const trDate = (s) => { const d = new Date(s + 'T00:00'); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
  const P7 = (window.P7 = {});

  // ================================================================ 5) HİCRİ TAKVİM
  const HM = ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'];
  let HF = null;
  try { HF = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch (e) {}
  function hijriOf(d) {
    if (!HF) return null;
    try { const p = HF.formatToParts(d), g = (k) => +((p.find((x) => x.type === k) || {}).value || '0').replace(/\D/g, ''); return { d: g('day'), m: g('month'), y: g('year') }; } catch (e) { return null; }
  }
  P7.hijriLabel = (s) => { const h = hijriOf(new Date(s + 'T12:00')); return h ? `${h.d} ${HM[h.m - 1]} ${h.y}` : ''; };
  // Diyanet bazı yıllarda Ümmü'l-Kurâ takviminden 1 gün sonra başlar (ör. Ramazan 1447: 19 Şubat 2026)
  const SHIFT = { '1447-9': 1, '1447-10': 0 };
  const cache = {};
  function hijriEvents(y) {
    if (cache[y]) return cache[y];
    const out = [];
    if (!HF) return (cache[y] = out);
    const days = [];
    for (let t = new Date(y - 1, 11, 1, 12); t <= new Date(y + 1, 0, 31, 12); t = new Date(t.getTime() + 864e5)) { const h = hijriOf(t); if (h) days.push({ t: new Date(t), h }); }
    const find = (m, d) => days.filter((x) => x.h.m === m && x.h.d === d);
    const add = (x, sh, name, prompt, ids, patch, bayram) => { const t = new Date(x.t.getTime() + sh * 864e5); const s = ymd(t); if (s.slice(0, 4) !== String(y)) return; out.push({ date: s, name, prompt, tpl: ids, patch: patch || null, hijri: (sh === (SHIFT[x.h.y + '-' + x.h.m] || 0)) ? `${x.h.d} ${HM[x.h.m - 1]} ${x.h.y}` : (() => { const h = hijriOf(t); return h ? `${h.d} ${HM[h.m - 1]} ${h.y}` : ''; })(), bayram: !!bayram }); };
    const sh = (x) => SHIFT[x.h.y + '-' + x.h.m] || 0;
    find(7, 1).forEach((x) => add(x, 0, 'Üç Ayların başlangıcı', 'Üç Aylar başlangıcı paylaşımı', ['b-hafta', 'b-kurban-mesaj'], { tag: 'Üç Aylar vesilesiyle', title: 'Hayırlı', script: 'Üç Aylar', sub: 'Recep, Şaban ve Ramazan ayları', date: '' }));
    // Regaib: Recep ayının ilk cumasından önceki perşembe gecesi
    days.filter((x) => x.h.m === 7 && x.h.d <= 7 && x.t.getDay() === 5).slice(0, 99).forEach((x) => { if (x.h.d <= 7) add(x, -1, 'Regaib Kandili', 'Regaib Kandili paylaşımı', ['b-hafta', 'b-kurban-kandil'], { tag: 'Regaib Kandilinde', title: 'Hayırlı', script: 'Kandiller', sub: 'Regaib Kandiliniz mübarek olsun' }); });
    find(7, 26).forEach((x) => add(x, 0, 'Miraç Kandili', 'Miraç Kandili paylaşımı', ['b-hafta', 'b-kurban-kandil'], { tag: 'Miraç Kandilinde', title: 'Hayırlı', script: 'Kandiller', sub: 'Miraç Kandiliniz mübarek olsun' }));
    find(8, 14).forEach((x) => add(x, 0, 'Berat Kandili', 'Berat Kandili paylaşımı', ['b-hafta', 'b-kurban-kandil'], { tag: 'Berat Kandilinde', title: 'Hayırlı', script: 'Kandiller', sub: 'Berat Kandiliniz mübarek olsun' }));
    find(9, 1).forEach((x) => add(x, sh(x), 'Ramazan başlangıcı', 'Ramazan kolisi ve iftar kampanyası', ['b-ramazan-koli', 'b-iftar', 'b-takip-koli'], null));
    find(9, 26).forEach((x) => add(x, sh(x), 'Kadir Gecesi', 'Kadir Gecesi paylaşımı', ['b-hafta', 'b-ramazan-umut'], { title: 'Hayırlı', script: 'Kadir Gecesi', sub: 'Bin aydan hayırlı gece', tag: 'Bu gece' }));
    find(10, 1).forEach((x) => { add(x, -1, 'Ramazan Bayramı arifesi', 'Bayram öncesi fitre ve zekât hatırlatması', ['b-ramazan-umut'], null); add(x, 0, 'Ramazan Bayramı', 'Ramazan Bayramı tebriği', ['b-hafta'], { title: 'Bayramınız', script: 'Mübarek Olsun', tag: 'Ramazan Bayramı', sub: 'Nice hayırlı bayramlara' }, true); });
    find(12, 10).forEach((x) => { add(x, -20, 'Kurban Bayramına 20 gün', 'Kurban hisse kampanyası', ['b-kurban-sayac', 'b-takip-kurban'], { big: '20' }); add(x, -1, 'Kurban Bayramı arifesi', 'Son hisse çağrısı', ['b-kurban-paylas'], null); add(x, 0, 'Kurban Bayramı', 'Kurban Bayramı tebriği', ['b-hafta', 'b-kurban-paylas'], { title: 'Bayramınız', script: 'Mübarek Olsun', tag: 'Kurban Bayramı', sub: 'Kurbanlarınız kabul olsun' }, true); });
    find(1, 1).forEach((x) => add(x, 0, 'Hicri Yılbaşı', 'Hicri yeni yıl tebriği', ['b-asure'], null));
    find(1, 10).forEach((x) => add(x, 0, 'Aşure Günü', 'Aşure ikram kampanyası', ['b-asure-zarif', 'b-asure-kazan'], null));
    find(3, 11).forEach((x) => add(x, 0, 'Mevlid Kandili', 'Mevlid Kandili paylaşımı', ['b-hafta', 'b-kurban-kandil'], { tag: 'Mevlid Kandilinde', title: 'Hayırlı', script: 'Kandiller', sub: 'Sevgili Peygamber efendimizin kâinata teşrifi' }));
    out.sort((a, b) => a.date.localeCompare(b.date));
    return (cache[y] = out);
  }
  P7.hijriEvents = hijriEvents;
  // bir şablon için yaklaşan (60 gün içindeki) özel gün; yazı yaması hicri tarihle tamamlanır
  P7.nextFor = function (id, days = 60, from) {
    const now = from ? new Date(from) : new Date(), y = now.getFullYear(), today = ymd(now), lim = ymd(new Date(now.getTime() + days * 864e5));
    const ev = [...hijriEvents(y), ...hijriEvents(y + 1)].find((e) => e.date >= today && e.date <= lim && e.tpl && e.tpl.includes(id) && e.patch);
    if (!ev) return null;
    const patch = Object.assign({}, ev.patch);
    if (!patch.date && ev.hijri) patch.date = `(${ev.hijri.replace(/ /g, '\u00A0')})`;
    return Object.assign({}, ev, { patch });
  };
  if (window.P5 && window.P5.specialDays) {
    const base = window.P5.specialDays; window.P5._specialBase = base;
    window.P5.specialDays = function (y) {
      const hj = hijriEvents(y);
      const list = hj.length ? base(y).filter((d) => !/^(Ramazan|Kurban) Bayramı/.test(d.name)) : base(y);
      return [...list, ...hj].sort((a, b) => a.date.localeCompare(b.date));
    };
  }
  // kampanya önerileri: hicri günlerde bağış şablonu açılsın
  function patchCampaigns() {
    const P6 = window.P6; if (!P6 || P6._p7) return; P6._p7 = true;
    const orig = P6.campaignDesign;
    P6.campaignDesign = function (day, W = 1080, H = 1080) {
      const t = day && day.tpl && tpl(day.tpl[0]);
      if (t) { const d = L().instantiateAt(t, 0, null, W, H, null, day.patch || undefined); d.meta = Object.assign({}, d.meta, { campaign: day.date }); return R.normalize(d); }
      return orig(day, W, H);
    };
    const oc = P6.campaigns;
    P6.campaigns = async (f) => { await fontsReady(); return oc(f); };
  }
  P7.calendar = async function () {
    patchCampaigns(); await fontsReady();
    const now = new Date(), t0 = ymd(now), list = [...hijriEvents(now.getFullYear()), ...hijriEvents(now.getFullYear() + 1)].filter((d) => d.date >= t0).slice(0, 18);
    if (!list.length) return toast('Bu tarayıcı hicri takvimi desteklemiyor', true);
    const left = (s) => { const n = Math.round((new Date(s + 'T00:00') - new Date(new Date().toDateString())) / 864e5); return n <= 0 ? 'bugün' : n === 1 ? 'yarın' : n + ' gün sonra'; };
    const v = await A().dialog(`<div class="d-body"><h3>${icon('moon')} Hicri takvim</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Kandiller, Ramazan, Kurban ve Aşure günleri. Her birine uygun bağış tasarımı hazır. Tarihler Diyanet takvimiyle bazen 1 gün farklı olabilir.</p>
      <div class="hj-list">${list.map((d, i) => `<div class="hj-it${d.bayram ? ' b' : ''}"><span class="hj-th" data-th="${i}"></span><div class="hj-m"><b>${esc(d.name)}</b><small>${trDate(d.date)} · ${esc(d.hijri)}</small><em>${left(d.date)}</em></div><div class="hj-a"><button class="btn sm primary" data-o="${i}:ig">Aç</button><button class="btn sm ghost" data-o="${i}:story">Story</button><button class="btn sm ghost" data-o="${i}:set">Set</button></div></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $$('[data-th]', box).forEach((el, k) => setTimeout(() => { const d = list[+el.dataset.th]; try { el.innerHTML = R.renderSVG(window.P6.campaignDesign(d), { fit: true, prefix: 'hj' + k + '_' }); } catch (e) {} }, 40 + k * 40));
        $$('[data-o]', box).forEach((b) => (b.onclick = () => close(b.dataset.o)));
      },
    });
    if (!v) return;
    const [i, kind] = v.split(':'), day = list[+i];
    const d = kind === 'story' ? window.P6.campaignDesign(day, 1080, 1920) : window.P6.campaignDesign(day);
    const p = await openDoc(d, day.name + (kind === 'story' ? ' · Story' : ''));
    if (kind === 'set') return window.P6.campaignSet(p);
  };
  async function openDoc(d, name, go = true) {
    const p = Object.assign(A().newProject(d.width, d.height, name || d.name), { background: d.background, layers: d.layers, meta: d.meta });
    R.normalize(p); await R.ensureImageSizes(p).catch(() => {});
    P7.applyBrand(p);
    A().S.project = p; await A().saveProject(p);
    if (go) A().go('editor', p.id);
    return p;
  }
  P7.openDoc = openDoc;

  // ================================================================ 1) KAMPANYA SETİ
  const KITS = [
    { k: 'ramazan', n: 'Ramazan kolisi', ic: 'gift', ids: { sq: 'b-ramazan-koli', por: 'b-ramazan-koli', story: 'b-ramazan-koli', a4: 'b-ramazan-koli', wide: 'b-ramazan-koli' }, join: true, d: { title: 'Bir Koli', title2: 'Mutluluk', sub: 'İftar ve sahur sofrasına bereket getiren yardım kumanyalarıyla siz de ihtiyaç sahibi bir ailenin mutluluğuna vesile olun.', price: '₺1.500', priceLabel: 'Kumanya bedeli' } },
    { k: 'kurban', n: 'Kurban hissesi', ic: 'heart', ids: { sq: 'b-kurban-paylas', por: 'b-kurban-paylas', story: 'b-kurban-paylas', a4: 'b-kurban-paylas', wide: 'b-kurban-paylas' }, d: { title: 'Kurbanını Paylaş', title2: 'İyiliğe Yakınlaş!', sub: 'Maddenin MANA ile buluştuğu coğrafyalarda;', sub2: 'bir iyiliğe daha vesile olmak, bir gönülde daha yer edinmek, bir kurban ile mümkün!', price: '3250₺', priceLabel: 'Hisse Bedeli' } },
    { k: 'takip', n: 'Bağış hedefi', ic: 'goal', ids: { sq: 'b-takip-kurban', por: 'b-takip-koli', story: 'b-takip-koli', a4: 'b-takip-koli', wide: 'b-takip-koli' }, d: { title: 'Hedefimiz 1.000 Koli', sub: 'Her koli bir ailenin bir aylık sofrası. Hedefe birlikte ulaşalım!', cta: 'Sen de destek ol' } },
    { k: 'asure', n: 'Aşure', ic: 'heart', ids: { sq: 'b-asure', por: 'b-asure-zarif', story: 'b-asure-zarif', a4: 'b-asure-zarif', wide: 'b-asure' }, d: { title: 'Hicri Yeni Yılımız', title2: 'Mübarek Olsun', sub: 'Bu sene binlerce kase aşure sizin adınıza ikram edilecek. Siz de bir kase aşure ikram etmek ister misiniz?', price: '150 TL', priceLabel: '1 Aşure ücreti' } },
    { k: 'egitim', n: 'Eğitim · Talebe', ic: 'layers', ids: { sq: 'b-ilim', por: 'b-ilim', story: 'b-ilim', a4: 'b-ilim', wide: 'b-ilim' }, d: { title: 'Bir İlim Yuvasına', title2: 'Siz de Destek Olun', sub: 'Talebelerimizin eğitim gördüğü kursumuzun aylık kira bedeli 2.000 USD’dir. Bir veya birden fazla destek hissesiyle katkıda bulunabilirsiniz.' } },
  ];
  const KSIZES = [['sq', 1080, 1080, 'Instagram'], ['por', 1080, 1350, 'Instagram 4:5'], ['story', 1080, 1920, 'Story · WhatsApp durum'], ['a4', 1240, 1754, 'A4 afiş'], ['wide', 1920, 600, 'Web banner']];
  function kitPatch(kit, v) {
    const p = { title: kit.join && v.title2 ? v.title + '\n' + v.title2 : v.title, title2: v.title2, sub: v.sub, price: v.price || undefined, priceLabel: v.priceLabel || undefined, cta: v.cta || undefined };
    if (v.sub2) p.sub2 = v.sub2;
    if (kit.join) delete p.title2;
    if (kit.k === 'takip') p.progress = { goal: +v.goal || 1000, got: +v.got || 0, unit: v.unit || 'koli', end: v.end || '' };
    Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
    return p;
  }
  P7.campaignKit = async function (kitKey) {
    await fontsReady();
    let kit = KITS.find((x) => x.k === kitKey) || KITS[0], prod = null;
    const vals = Object.assign({}, kit.d, { goal: 1000, got: 640, unit: 'koli', end: '' });
    const res = await A().dialog(`<div class="d-body kit"><h3>${icon('copy')} Kampanya seti</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Bir kez yaz; Instagram, 4:5, story / WhatsApp durum, A4 afiş ve web banner aynı tasarım dilinde birlikte çıksın.</p>
      <div class="kit-k" id="kK">${KITS.map((x) => `<button class="chip ${x.k === kit.k ? 'on' : ''}" data-k="${x.k}">${icon(x.ic)}${x.n}</button>`).join('')}</div>
      <div class="kit-g"><div class="kit-f" id="kF"></div><div class="kit-pv"><div class="kit-th" id="kPv"></div><button class="btn sm ghost" id="kPh">${icon('image')}Kendi fotoğrafını koy</button><small class="muted" id="kPhI">Örnek fotoğraf kullanılıyor</small></div></div></div>
      <div class="d-foot"><label class="ck" style="margin-right:auto"><input type="checkbox" id="kDon" ${brand().donate && brand().donate.iban ? 'checked' : ''}> Bağış bilgisi kartını ekle</label><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="kGo">${icon('sparkle')}5 tasarımı hazırla</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const F0 = [['title', 'Başlık (1. satır)'], ['title2', 'Başlık (2. satır)'], ['sub', 'Açıklama', 1], ['price', 'Bedel'], ['priceLabel', 'Bedel etiketi']];
        const FT = [['title', 'Başlık'], ['sub', 'Açıklama', 1], ['got', 'Toplanan'], ['goal', 'Hedef'], ['unit', 'Birim (koli, hisse…)'], ['end', 'Bitiş tarihi', 0, 'date'], ['cta', 'Buton yazısı']];
        let tm = 0;
        const drawF = () => {
          const fs = kit.k === 'takip' ? FT : F0;
          $('#kF', box).innerHTML = fs.map(([k, t, wide, ty]) => `<label class="field"${wide ? ' style="grid-column:1/-1"' : ''}><span>${t}</span>${wide ? `<textarea class="inp" rows="3" data-f="${k}">${esc(vals[k] || '')}</textarea>` : `<input class="inp" ${ty ? `type="${ty}"` : ''} data-f="${k}" value="${esc(vals[k] || '')}">`}</label>`).join('');
          $$('[data-f]', box).forEach((i) => (i.oninput = () => { vals[i.dataset.f] = i.value; clearTimeout(tm); tm = setTimeout(pv, 250); }));
          pv();
        };
        const pv = () => { const t = tpl(kit.ids.sq); if (!t) return; const d = R.normalize(L().instantiateAt(t, 0, null, 1080, 1080, prod, kitPatch(kit, vals))); $('#kPv', box).innerHTML = R.renderSVG(d, { fit: true, prefix: 'kit' + Math.random().toString(36).slice(2, 5) }); };
        $('#kK', box).onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b) return; kit = KITS.find((x) => x.k === b.dataset.k); Object.assign(vals, kit.d); $$('#kK .chip', box).forEach((c) => c.classList.toggle('on', c === b)); drawF(); };
        $('#kPh', box).onclick = () => A().pickFiles(async (files) => { const f = files[0]; if (!f) return; $('#kPhI', box).textContent = 'Hazırlanıyor…'; const keep = Fd().product; try { prod = await F().productFromFile(f, (t) => ($('#kPhI', box).textContent = t)); } catch (e) {} F().setProduct(keep || null); $('#kPhI', box).textContent = prod ? (prod.cut ? 'Arka planı silindi' : 'Fotoğraf çerçeveye oturtuldu') : 'Fotoğraf okunamadı'; pv(); }, false);
        $('#kGo', box).onclick = () => close({ kit, vals: Object.assign({}, vals), prod, donate: $('#kDon', box).checked });
        drawF();
      },
    });
    if (!res) return;
    toast('Kampanya seti hazırlanıyor…');
    const made = [], group = 'lk' + Date.now().toString(36);
    for (const [key, W, H, label] of KSIZES) {
      const t = tpl(res.kit.ids[key]); if (!t) continue;
      const d = R.normalize(L().instantiateAt(t, 0, null, W, H, res.prod, kitPatch(res.kit, res.vals)));
      d.meta = Object.assign({}, d.meta, { linkGroup: group });
      const p = Object.assign(A().newProject(W, H, `${res.vals.title || res.kit.n} · ${label}`), { background: d.background, layers: d.layers, meta: d.meta });
      R.normalize(p); await R.ensureImageSizes(p).catch(() => {});
      if (res.donate && key !== 'wide') addDonateBand(p);
      P7.applyBrand(p);
      await A().saveProject(p); made.push(p);
    }
    return resultDialog(made, 'Kampanya seti hazır: ' + made.length + ' ölçü');
  };
  async function resultDialog(made, title) {
    await A().dialog(`<div class="d-body"><h3>${icon('check')} ${esc(title)}</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Hepsi “Projeler”e kaydedildi. Birini açıp düzenleyebilir, hepsini tek seferde indirebilirsin.</p>
      <div class="kit-res">${made.map((m, i) => `<div class="kr-it"><span class="kr-th" data-th="${i}" style="aspect-ratio:${m.width}/${m.height}"></span><b>${esc(m.name.split(' · ').pop())}</b><small>${m.width}×${m.height}</small><div><button class="btn sm" data-op="${i}">${icon('pen')}Aç</button>${m.height > m.width ? `<button class="btn sm ghost" data-vd="${i}" title="Hareketli story">${icon('play')}Video</button>` : ''}<button class="btn sm ghost icon" data-sh="${i}" title="Paylaş">${icon('share')}</button></div></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" id="krZip" style="margin-right:auto">${icon('download')}Hepsini ZIP indir</button><button class="btn" data-close>Tamam</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $$('[data-th]', box).forEach((el, k) => setTimeout(() => (el.innerHTML = R.renderSVG(made[+el.dataset.th], { fit: true, prefix: 'kr' + k + '_' })), 30 + k * 40));
        $$('[data-op]', box).forEach((b) => (b.onclick = () => { close(); A().S.project = made[+b.dataset.op]; A().go('editor', made[+b.dataset.op].id); }));
        $$('[data-vd]', box).forEach((b) => (b.onclick = () => { close(); P7.video(made[+b.dataset.vd]); }));
        $$('[data-sh]', box).forEach((b) => (b.onclick = () => P7.share(made[+b.dataset.sh])));
        $('#krZip', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Hazırlanıyor…';
          const files = [];
          for (const m of made) { const big = m.width * m.height > 2.5e6; const b = await R.exportBlob(m, big ? 'jpg' : 'png', 1); files.push({ name: m.name.split(' · ').pop().replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-') + (big ? '.jpg' : '.png'), data: new Uint8Array(await b.arrayBuffer()) }); }
          R.download(T.zip(files), 'kampanya-seti.zip'); btn.disabled = false; btn.innerHTML = `${icon('download')}Hepsini ZIP indir`;
        };
      },
    });
  }
  P7.resultDialog = resultDialog;

  // ================================================================ 2) BAĞIŞ TAKİBİ
  P7.progress = async function () {
    const e = E(); if (!e) return toast('Önce bağış takibi tasarımını aç', true);
    const d = e.doc, bar = d.layers.find((l) => l.progress);
    if (!bar) {
      const ok = await A().confirmBox('Bağış takibi', 'Bu tasarımda ilerleme çubuğu yok. Bağış takibi şablonu açılsın mı?', 'Şablonu aç');
      if (ok) F().useLibraryTemplate(tpl('b-takip-koli'), 0);
      return;
    }
    const pr = bar.progress;
    const v = await A().dialog(`<div class="d-body"><h3>${icon('goal')} Bağış hedefini güncelle</h3>
      <div class="form-grid"><label class="field"><span>Toplanan</span><input class="inp" id="pgG" type="number" value="${pr.got}"></label><label class="field"><span>Hedef</span><input class="inp" id="pgH" type="number" value="${pr.goal}"></label>
      <label class="field"><span>Birim</span><input class="inp" id="pgU" value="${esc(pr.unit)}"></label><label class="field"><span>Bitiş tarihi</span><input class="inp" id="pgE" type="date" value="${esc(pr.end || '')}"></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="pgOk">Güncelle</button></div>`, { onOpen: (box, close) => { $('#pgOk', box).onclick = () => close({ got: +$('#pgG', box).value || 0, goal: +$('#pgH', box).value || 1, unit: $('#pgU', box).value.trim() || 'adet', end: $('#pgE', box).value }); } });
    if (!v) return;
    P7.applyProgress(d, v); e.commit(); e.relayout && e.relayout();
    toast(`%${Math.round((v.got / v.goal) * 100)} — güncellendi`);
  };
  P7.applyProgress = function (d, v) {
    const bar = d.layers.find((l) => l.progress); if (!bar) return;
    const pr = Object.assign(bar.progress, v), pct = Math.max(0, Math.min(1, pr.got / Math.max(1, pr.goal)));
    bar.w = Math.round(Math.max(bar.h, pr.w * pct) * 10) / 10;
    const fmt = (n) => Number(n).toLocaleString('tr-TR'), set = (n, t) => { const l = d.layers.find((x) => x.name === n); if (l) { l.text = t; R.layoutText(l); } };
    set('Toplanan sayı', fmt(pr.got)); set('Hedef sayı', '/ ' + fmt(pr.goal) + ' ' + pr.unit); set('Yüzde', '%' + Math.round(pct * 100) + ' tamamlandı');
    if (pr.end) set('Kalan gün', 'Son ' + Math.max(0, Math.ceil((new Date(pr.end + 'T23:59') - new Date()) / 864e5)) + ' gün');
  };

  // ================================================================ 3) BAĞIŞ BİLGİSİ KARTI
  const DF = [['receiver', 'Alıcı adı', 'Örn. Umut Derneği'], ['bank', 'Banka', 'Örn. Kuveyt Türk'], ['iban', 'IBAN', 'TR00 0000 0000 0000 0000 0000 00'], ['wa', 'WhatsApp bağış hattı', '0 (555) 000 00 00'], ['url', 'Bağış sayfası', 'www.dernek.org/bagis']];
  P7.DONATE_FIELDS = DF;
  const don = () => Object.assign({ receiver: brand().name || 'Dernek adı', bank: 'Banka adı', iban: 'TR00 0000 0000 0000 0000 0000 00', wa: brand().phone || '0 (555) 000 00 00', url: brand().web || 'www.dernek.org/bagis' }, Object.fromEntries(Object.entries(brand().donate || {}).filter(([, v]) => v)));
  const link = (D) => { if (D.url) return /^https?:/.test(D.url) ? D.url : 'https://' + D.url; let n = String(D.wa || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '90' + n.slice(1); return 'https://wa.me/' + (n || '905000000000'); };
  const qrP = (t) => { try { return T.qrPath(T.qr(t, 'M'), 'square', 0); } catch (e) { return { d: 'M0 0h10v10H0z', size: 10 }; } };
  function donateCard(u, P) {
    const D = don(), q = qrP(link(D)), ink = '#14161B', a = (P && P.a) || '#0F5A45';
    const tx = (name, text, x, y, w, fs, fill, o = {}) => Object.assign({ type: 'text', name, text, x, y, w, h: fs * 1.2, fontSize: fs, fill, fontFamily: 'Inter', fontWeight: 600, lineHeight: 1.2, letterSpacing: 0, align: 'left' }, o);
    return [
      { type: 'rect', name: 'Bağış kartı', x: 0, y: 0, w: 82 * u, h: 24 * u, fill: '#FFFFFF', radius: 2.4 * u, shadow: { x: 0, y: 0.8 * u, blur: 3 * u, color: 'rgba(0,0,0,0.16)' } },
      { type: 'path', name: 'QR kod', d: q.d, vw: q.size, vh: q.size, x: 2.5 * u, y: 2.5 * u, w: 19 * u, h: 19 * u, fill: ink, role: 'qr', qr: { text: link(D), type: 'url' } },
      { type: 'rect', name: 'Vurgu çizgisi', x: 24.5 * u, y: 3 * u, w: 1 * u, h: 18 * u, fill: a, radius: 0.5 * u },
      tx('Bağış başlığı', 'Bağış için', 28 * u, 2.6 * u, 48 * u, 2.6 * u, a, { fontWeight: 800, letterSpacing: 0.2 * u }),
      tx('Alıcı', D.receiver + ' · ' + D.bank, 28 * u, 5.8 * u, 52 * u, 2.8 * u, ink, { fontWeight: 700 }),
      tx('IBAN', D.iban, 28 * u, 9.6 * u, 52 * u, 2.55 * u, ink, { fontWeight: 800, fontFamily: 'Inter' }),
      tx('WhatsApp', 'WhatsApp: ' + D.wa, 28 * u, 14.4 * u, 52 * u, 2.6 * u, ink, { fontWeight: 600 }),
      tx('Bağış sayfası', D.url, 28 * u, 18 * u, 52 * u, 2.6 * u, a, { fontWeight: 700 }),
    ];
  }
  function donateBand(u, W, P) {
    const D = don(), ink = (P && P.d) || '#0F3326';
    return [
      { type: 'rect', name: 'Bağış şeridi', x: 0, y: 0, w: W, h: 7 * u, fill: ink },
      { type: 'text', name: 'IBAN', text: `${D.receiver}  •  IBAN: ${D.iban}  •  WhatsApp: ${D.wa}`, x: 3 * u, y: 2 * u, w: W - 6 * u, h: 3 * u, fontSize: 2.5 * u, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 700, align: 'center', lineHeight: 1.2, letterSpacing: 0 },
    ];
  }
  function hisseBand(u, P) {
    const a = (P && P.a) || '#C9A94E', D = brand().info || {};
    return [
      { type: 'rect', name: 'Hisse zemini', x: 0, y: 0, w: 40 * u, h: 12 * u, fill: a, radius: 6 * u, shadow: { x: 0, y: 0.6 * u, blur: 2 * u, color: 'rgba(0,0,0,0.18)' } },
      { type: 'text', name: 'Hisse etiketi', text: 'HİSSE BEDELİ', x: 0, y: 1.8 * u, w: 40 * u, h: 3 * u, fontSize: 2.4 * u, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 800, align: 'center', letterSpacing: 0.3 * u, lineHeight: 1.2 },
      { type: 'text', name: 'Hisse bedeli', text: D.price || '₺3.250', x: 0, y: 4.8 * u, w: 40 * u, h: 6 * u, fontSize: 5.4 * u, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 900, align: 'center', lineHeight: 1.1, bind: 'price' },
    ];
  }
  if (window.Coach && window.Coach.BLOCKS) {
    window.Coach.BLOCKS.push(['Bağış', 'Bağış bilgi kartı (IBAN + QR)', (u, P) => donateCard(u, P)]);
    window.Coach.BLOCKS.push(['Bağış', 'IBAN şeridi', (u, P, I, W) => donateBand(u, W, P)]);
    window.Coach.BLOCKS.push(['Bağış', 'Hisse bedeli', (u, P) => hisseBand(u, P)]);
  }
  const norm = (ls) => ls.map((l) => Object.assign({ visible: true, opacity: 1, rotation: 0 }, l));
  function addDonateBand(p) {
    const u = Math.min(p.width, p.height) / 100, ls = norm(donateBand(u, p.width));
    ls.forEach((l) => { l.y += p.height - 7 * u; if (l.type === 'text') R.layoutText(l); });
    const g = 'dn' + Math.random().toString(36).slice(2, 6); ls.forEach((l) => (l.group = g));
    p.layers.push(...R.normalize({ width: p.width, height: p.height, layers: ls }).layers);
  }
  P7.addDonate = async function (kind = 'card') {
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const d = e.doc, u = Math.min(d.width, d.height) / 100;
    if (!(brand().donate && brand().donate.iban)) toast('İpucu: IBAN ve banka bilgilerini Marka → Bağış bilgileri bölümüne bir kez yaz, hep oradan gelsin.');
    let ls = norm(kind === 'band' ? donateBand(u, d.width) : kind === 'hisse' ? hisseBand(u) : donateCard(u));
    ls.forEach((l) => l.type === 'text' && R.layoutText(l));
    const bb = window.Coach.bbox(ls), ox = kind === 'band' ? 0 : (d.width - bb.w) / 2, oy = kind === 'band' ? d.height - bb.h : d.height - bb.h - 4 * u;
    ls.forEach((l) => { l.x = Math.round((l.x - bb.x0 + ox) * 10) / 10; l.y = Math.round((l.y - bb.y0 + oy) * 10) / 10; });
    e.insert(ls, { group: true }); toast('Bağış bilgisi eklendi — sürükleyip yerini değiştirebilirsin');
  };

  // ================================================================ 4) TEŞEKKÜR VE KESİM KARTLARI (toplu)
  P7.thanks = async function (preset) {
    await fontsReady();
    const opts = [['b-tesekkur', 'Teşekkür kartı'], ['b-kesildi', 'Kurbanınız kesildi']];
    let rows = [];
    const res = await A().dialog(`<div class="d-body kit"><h3>${icon('heart')} Kişiye özel kartlar</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Bağışçı listesini yapıştır ya da Excel / CSV yükle: her biri için adı yazılmış ayrı bir kart üretilir, hepsi tek ZIP olarak iner.</p>
      <div class="kit-k" id="tkK">${opts.map(([id, n], i) => `<button class="chip ${i ? '' : 'on'}" data-t="${id}">${n}</button>`).join('')}</div>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr"><label class="field"><span>Bağışçılar (her satıra bir kişi · isterseniz: Ad Soyad ; Hisse no ; Tarih ; Yer)</span><textarea class="inp" id="tkL" rows="9" placeholder="Ahmet Yılmaz ; 12 ; 27 Mayıs 2026 ; Panama&#10;Ayşe Demir ; 13"></textarea></label>
      <div style="display:flex;gap:8px;align-items:center"><button class="btn sm" id="tkF">${icon('upload')}Excel / CSV yükle</button><button class="btn sm" id="tkPh">${icon('image')}Kişiye özel fotoğraflar</button><small class="muted" id="tkN">0 kişi</small></div>
      <small class="muted" style="font-size:11.5px">Fotoğraf dosyasının adı hisse numarasını ya da kişinin adını içersin (ör. <b>12.jpg</b>, <b>ahmet-yilmaz.jpg</b>); eşleşen karta o fotoğraf konur.</small>
      <label class="field"><span>Başlık</span><input class="inp" id="tkT" value="Bağışınız Ulaştı"></label><label class="field"><span>Mesaj</span><textarea class="inp" id="tkS" rows="3">Desteğiniz ihtiyaç sahibi ailelere ulaştırıldı. Allah kabul etsin, hayrınızı çoğaltsın.</textarea></label></div>
      <div class="kit-pv"><div class="kit-th" id="tkP"></div><select class="inp sm" id="tkSz"><option value="1080x1350">4:5 (1080×1350)</option><option value="1080x1080">Kare</option><option value="1080x1920">Story</option><option value="1240x1754">A4</option></select></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="tkGo">${icon('download')}Kartları üret</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let id = opts[0][0], tm = 0; const photos = [];
        if (preset) { if (preset.list) $('#tkL', box).value = preset.list; if (preset.kind) setTimeout(() => { const b = $(`#tkK [data-t="${preset.kind}"]`, box); if (b) b.click(); }, 0); }
        const slug = (x) => String(x || '').toLocaleLowerCase('tr-TR').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '');
        const photoFor = (r) => { if (!r || !photos.length) return null; const no = String(r[1] || '').replace(/\D/g, ''), nm = slug(r[0]); return photos.find((p) => no && p.nums.includes(no)) || photos.find((p) => nm && p.key && (p.key.includes(nm) || nm.includes(p.key))) || null; };
        const parse = () => { rows = $('#tkL', box).value.split('\n').map((s) => s.split(/[;\t]/).map((x) => x.trim())).filter((r) => r[0]); $('#tkN', box).textContent = rows.length + ' kişi'; };
        const patch = (r) => { const p = { name: (r && r[0]) || 'Ad Soyad', title: $('#tkT', box).value, sub: $('#tkS', box).value }; if (id === 'b-kesildi') p.report = [['Hisse no', (r && r[1]) || '—'], ['Tarih', (r && r[2]) || trDate(ymd(new Date()))], ['Yer', (r && r[3]) || '—']]; return p; };
        const size = () => $('#tkSz', box).value.split('x').map(Number);
        const pv = () => { parse(); const [W, H] = size(); const ph = photoFor(rows[0]); const d = R.normalize(L().instantiateAt(tpl(id), 0, null, W, H, ph ? { src: ph.src, nw: ph.nw, nh: ph.nh } : null, patch(rows[0]))); $('#tkN', box).textContent = rows.length + ' kişi' + (photos.length ? ` · ${rows.filter((r) => photoFor(r)).length} fotoğraf eşleşti` : ''); $('#tkP', box).innerHTML = R.renderSVG(d, { fit: true, prefix: 'tk' + Math.random().toString(36).slice(2, 5) }); };
        $('#tkK', box).onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; id = b.dataset.t; $$('#tkK .chip', box).forEach((c) => c.classList.toggle('on', c === b)); if (id === 'b-kesildi') { $('#tkT', box).value = 'Kurbanınız Kesildi'; $('#tkS', box).value = 'Kurbanınız itina ile kesilmiş, etleri ihtiyaç sahiplerine ulaştırılmıştır. Allah kabul etsin.'; } else { $('#tkT', box).value = 'Bağışınız Ulaştı'; $('#tkS', box).value = 'Desteğiniz ihtiyaç sahibi ailelere ulaştırıldı. Allah kabul etsin, hayrınızı çoğaltsın.'; } pv(); };
        ['tkL', 'tkT', 'tkS'].forEach((k) => ($('#' + k, box).oninput = () => { clearTimeout(tm); tm = setTimeout(pv, 300); }));
        $('#tkSz', box).onchange = pv;
        $('#tkF', box).onclick = () => A().pickFiles(async (files) => {
          const f = files[0]; if (!f) return;
          const data = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
          try { const t = await A().api('parse-table', { body: { name: f.name, data } }); $('#tkL', box).value = t.rows.map((r) => t.columns.slice(0, 4).map((c) => r[c] == null ? '' : String(r[c])).join(' ; ')).join('\n'); pv(); }
          catch (e) { toast('Dosya okunamadı: ' + e.message, true); }
        }, false);
        $('#tkPh', box).onclick = () => A().pickFiles(async (files) => {
          for (const f of files) { if (!/^image\//.test(f.type)) continue; const src = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); }); const im = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); if (!im) continue; const base = f.name.replace(/\.[^.]+$/, ''); photos.push({ src, nw: im.naturalWidth, nh: im.naturalHeight, nums: base.match(/\d+/g) || [], key: slug(base.replace(/\d+/g, '')) }); }
          toast(photos.length + ' fotoğraf yüklendi'); pv();
        }, true);
        $('#tkGo', box).onclick = () => { parse(); if (!rows.length) return toast('Önce isim listesini yaz', true); close({ id, rows: rows.slice(), patch, size: size(), photoFor }); };
        pv();
      },
    });
    if (!res) return;
    const [W, H] = res.size, files = [], t = tpl(res.id);
    const prog = document.createElement('div'); prog.className = 'tk-prog'; document.body.appendChild(prog);
    try {
      for (let i = 0; i < res.rows.length; i++) {
        prog.textContent = `Kartlar üretiliyor… ${i + 1} / ${res.rows.length}`;
        const ph = res.photoFor && res.photoFor(res.rows[i]);
        const d = R.normalize(L().instantiateAt(t, 0, null, W, H, ph ? { src: ph.src, nw: ph.nw, nh: ph.nh } : null, res.patch(res.rows[i])));
        await R.ensureImageSizes(d).catch(() => {}); P7.applyBrand(d);
        const b = await R.exportBlob(d, 'jpg', 1);
        files.push({ name: String(i + 1).padStart(3, '0') + '-' + res.rows[i][0].replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-') + '.jpg', data: new Uint8Array(await b.arrayBuffer()) });
        if (i % 4 === 3) await sleep(0);
      }
      R.download(T.zip(files), (res.id === 'b-kesildi' ? 'kesim-kartlari' : 'tesekkur-kartlari') + '.zip');
      toast(files.length + ' kart indirildi');
    } catch (e) { toast('Kartlar üretilemedi: ' + e.message, true); }
    prog.remove();
  };

  // ================================================================ 7) GÖRSELDEN ŞABLON
  P7.fromImage = function () {
    A().pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      try {
        const up = await A().uploadFile(f);
        const ai = ((A().S.settings || {}).provider || 'local') !== 'local';
        await F().editImage(up.url, f.name.replace(/\.[^.]+$/, '') + ' · şablon', { decompose: ai });
        setTimeout(() => toast(ai ? 'Görsel katmanlara ayrılıyor. Bitince ⋯ → “Şablon olarak kaydet” de; şablonlarında “Benim şablonlarım”da çıkar.' : 'Yapay zekâ bağlı değil: “Seç ve ayır” (K) aracıyla yazıları ve fotoğrafı ayır, sonra ⋯ → “Şablon olarak kaydet”.'), 1500);
      } catch (e) { toast(e.message, true); }
    }, false);
  };

  // ================================================================ 8) MARKA KİLİDİ
  P7.locked = () => !!brand().lock;
  P7.applyBrand = function (p) {
    const b = brand(); if (!b.lock || !p || !p.layers) return p;
    const D = Object.assign({}, b.donate || {});
    p.layers.slice().forEach((l) => {
      if (l.type !== 'text') return;
      if (/^(Logo|Marka)$/.test(l.name || '')) {
        if (b.logo) {
          const s = Math.min(l.w, Math.max(l.h * 2.2, l.fontSize * 2.6)), h = Math.max(l.h * 1.6, l.fontSize * 1.8);
          const img = { id: R.uid(), type: 'image', name: 'Logo', src: b.logo, x: l.x + (l.w - s) / 2, y: l.y + (l.h - h) / 2, w: s, h, fit: 'contain', filters: {}, rotation: l.rotation || 0, opacity: 1, visible: true, group: l.group };
          p.layers.splice(p.layers.indexOf(l), 1, img);
        } else if (b.name) { l.text = b.name; R.layoutText(l); }
      } else if (l.name === 'İletişim' && /markaniz|000 00 00/i.test(String(l.text))) {
        const parts = [b.phone || D.wa, b.web || D.url].filter(Boolean); if (parts.length) { l.text = parts.join('   •   '); R.layoutText(l); }
      } else if (l.name === 'IBAN' && D.iban && /0000/.test(l.text)) { l.text = String(l.text).replace(/TR00[\d ]+/, D.iban); R.layoutText(l); }
    });
    return p;
  };

  // ================================================================ 9) TELEFONDAN PAYLAŞ
  P7.share = async function (p) {
    p = p || (E() && E().doc) || A().S.project; if (!p) return toast('Önce bir tasarım aç', true);
    try {
      const big = p.width * p.height > 2.5e6, blob = await R.exportBlob(p, big ? 'jpg' : 'png', 1);
      const name = (p.name || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-') + (big ? '.jpg' : '.png');
      const file = new File([blob], name, { type: blob.type || (big ? 'image/jpeg' : 'image/png') });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: p.name || 'Tasarım' }); return; }
      R.download(blob, name); toast('Bu tarayıcı doğrudan paylaşmayı desteklemiyor; görsel indirildi, galeriden paylaşabilirsin');
    } catch (e) { if (e && e.name !== 'AbortError') toast('Paylaşılamadı: ' + e.message, true); }
  };

  // ================================================================ 10) KISA VİDEO
  P7.video = async function (p) {
    if (p && (!E() || E().doc.id !== p.id)) { A().S.project = p; A().go('editor', p.id); for (let i = 0; i < 40 && !(E() && E().doc && E().doc.id === p.id); i++) await sleep(150); }
    const e = E(); if (!e) return toast('Önce bir tasarım aç', true);
    const d = e.doc;
    // yıldızlar parlasın, mühür dönsün, fotoğraf yavaşça yaklaşsın, yazılar sırayla gelsin
    if (!d.layers.some((l) => l.anim && l.anim.type && l.anim.type !== 'none')) {
      e.autoAnimate();
      d.layers.forEach((l) => { if (/^Süs · (yıldız|sparkle|hilal)/.test(l.name || '')) l.anim = { type: 'pop', delay: 0.2, dur: 0.9 }; if (l.role === 'photo') l.anim = { type: 'zoom', delay: 0.1, dur: 1.2 }; });
      e.commit();
    }
    e.anim();
  };

  // ================================================================ başlangıç
  patchCampaigns();
  document.addEventListener('ts-fonts-ready', patchCampaigns);
})();
