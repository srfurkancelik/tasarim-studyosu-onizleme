/* Tasarım Stüdyosu v6.7 — sadeleştirilmiş ⋯ menüsü (sık kullanılanlar + açılır bölümler), “Nasıl?” kartları,
   bağış web sayfası, müzikli hazır hareketli videolar, İspanyolca tek dokunuş (geniş sözlük),
   gönüllü yaka kartı ve kumbara etiketi */
(function () {
  const P13 = (window.P13 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi, L = () => window.Library, TH = () => window.FoodTheme;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const r1 = (v) => Math.round(v * 10) / 10;
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const brand = () => (A().S && A().S.brand) || {};
  const bcol = (i, d) => ((brand().colors || []).filter(Boolean)[i]) || d;
  const tpl = (id) => L().templates.find((t) => t.id === id);
  const slug = (s) => String(s || 'dosya').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-').replace(/^-|-$/g, '') || 'dosya';
  const parseRows = (txt) => String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s*[;|\t]\s*/));
  const busy = (t) => { const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = `<i class="b"></i><span>${esc(t)}</span>`; const box = $('#toasts'); if (box) box.appendChild(el); return { set: (s) => { const sp = $('span', el); if (sp) sp.textContent = s; }, done: () => el.remove() }; };
  const don = () => Object.assign({ receiver: brand().name || 'Dernek adı', bank: '', iban: '', wa: brand().phone || '', url: brand().web || '' }, Object.fromEntries(Object.entries(brand().donate || {}).filter(([, v]) => v)));
  const waNum = (p) => { let n = String(p || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '90' + n.slice(1); return n; };
  const toDataURL = (b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });

  // ================================================================ 1) ⋯ menüsü: sık kullanılanlar + açılır bölümler
  const DEF_FAV = ['fillform', 'bgimg', 'enhance', 'p12:colorVariants', 'motion', 'p12:brandStrip'];
  const decorateMenu = (box) => {
    if (box.dataset.p13 || LS.get('ts_mm_flat', false)) return; box.dataset.p13 = '1';
    const body = box; const items = $$('.it', body); if (items.length < 12) return;
    // kullanım sayısı
    items.forEach((it) => it.addEventListener('click', () => { const c = LS.get('ts_mmcount', {}); c[it.dataset.v] = (c[it.dataset.v] || 0) + 1; LS.set('ts_mmcount', c); }, true));
    const cnt = LS.get('ts_mmcount', {});
    const byV = new Map(items.map((it) => [it.dataset.v, it]));
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([v]) => v).filter((v) => byV.has(v));
    const fav = [...new Set([...top, ...DEF_FAV.filter((v) => byV.has(v))])].slice(0, 6);
    // bölümler: başlıksız ilk grup "Hızlı işlemler"
    const first = items[0];
    const h0 = document.createElement('div'); h0.className = 'mm-h'; h0.textContent = 'Hızlı işlemler';
    first.before(h0);
    const favH = document.createElement('div'); favH.className = 'mm-h mm-fav-h'; favH.innerHTML = `${icon('star')} Sık kullandıkların`;
    h0.before(favH);
    fav.forEach((v) => { const src = byV.get(v), cl = src.cloneNode(true); cl.classList.add('mm-fav'); cl.removeAttribute('data-v'); cl.onclick = (e) => { e.stopPropagation(); src.click(); }; h0.before(cl); });
    // her başlık açılır/kapanır; arama yapılınca hepsi açılır
    const heads = $$('.mm-h', body).filter((h) => !h.classList.contains('mm-fav-h'));
    heads.forEach((h) => {
      h.classList.add('mm-acc'); const sec = []; let n = h.nextElementSibling;
      while (n && !n.classList.contains('mm-h')) { if (n.classList.contains('it')) sec.push(n); n = n.nextElementSibling; }
      const vis = sec.filter((x) => getComputedStyle(x).display !== 'none').length;
      if (!vis) { h.style.display = 'none'; return; }
      h.insertAdjacentHTML('beforeend', `<small class="mm-n">${vis}</small><i class="mm-ch"></i>`);
      sec.forEach((x) => x.classList.add('mm-col'));
      h.onclick = () => { const op = !h.classList.contains('open'); h.classList.toggle('open', op); sec.forEach((x) => x.classList.toggle('mm-col', !op)); };
    });
    const q = $('#mmQ', box);
    if (q) q.addEventListener('input', () => { box.classList.toggle('mm-searching', !!q.value.trim()); $$('.mm-fav, .mm-fav-h', box).forEach((x) => (x.style.display = q.value.trim() ? 'none' : '')); });
  };

  // ================================================================ 2) “Nasıl?” kartları (3 adım)
  const HELP = {
    'Formla doldur': ['Fotoğrafa dokun, telefonundan kendi fotoğrafını seç.', 'Yazı kutularına yaz; “Öneri” hazır cümle verir, “Sesle yaz” konuşarak yazar.', 'Bitti’ye dokun ya da doğrudan Paylaş.'],
    'Kurban paketi': ['Hissedarları her satıra bir kişi olacak şekilde yaz: Ad ; telefon ; hisse ; bedel.', 'Bayramdan önce 1 ve 2: vekâlet formları ve “vekâletiniz alındı” mesajı.', 'Kesimden sonra 3, 4 ve 5: kesildi kartları, mesajlar, teşekkür kartları.'],
    'Bağış makbuzu': ['Her satıra: Ad Soyad ; tutar ; açıklama (Excel’den yapıştırabilirsin).', 'Bağış türünü, tarihi ve ilk makbuz numarasını kontrol et.', 'PDF indir: herkese ayrı, sıra numaralı makbuz tek dosyada.'],
    'Kurban vekâlet formu': ['Hissedarları yaz ya da boş bırak (boş form çıkar).', 'Kurban türünü ve kesim yerini seç.', 'PDF indir, yazdırıp imzalat.'],
    'Telefon ↔ bilgisayar eşitleme': ['Tasarımların olduğu cihazda “Dosyaya yaz”.', 'İnen dosyayı öbür cihaza WhatsApp ya da e-postayla gönder.', 'Öbür cihazda “Dosyayı al” ve dosyayı seç.'],
    'Davetiye ve katılım kodu': ['Program adını, tarihi, saati ve yeri yaz.', 'WhatsApp numaranı yaz; karekod buna “Katılıyorum” mesajı açar.', 'Davetiyeyi aç, paylaş ya da yazdır.'],
    'Bağışçı defteri': ['“Ekle” ile kişileri yaz ya da Kurban paketi / makbuzdan aktar.', 'Kişileri işaretle.', 'Makbuz, teşekkür kartı ya da mesaj hazırla.'],
    'Vakit tablosu': ['Fazilet Takvimi sitesinden ya da uygulamasından aylık tabloyu kopyala.', 'Buraya yapıştır (ya da Excel yükle), şehri yaz.', 'Kaydet; imsakiye ve vakit kartları buradan hazırlanır.'],
    'Kişiye özel kartlar': ['Kart türünü seç (teşekkür ya da kesildi).', 'Kişileri her satıra bir kişi olacak şekilde yaz.', '“Kartları üret”: hepsi tek ZIP olarak iner.'],
    'Bağış web sayfası': ['Kurum bilgilerini ve IBAN’ı kontrol et.', 'Sayfada görünecek kampanya tasarımlarını işaretle.', 'Sayfayı indir; dosyayı web sitene ya da Google Drive’a koyup bağlantısını paylaş.'],
    'Hazır hareketli videolar': ['Konuyu seç (kandil, Ramazan, kurban, Cuma).', 'Tasarım story boyunda açılır, yazılar sırayla gelir, sakin fon müziği eklenir.', '“Video indir” ile WhatsApp durumuna hazır videoyu al.'],
    'Gönüllü kartları': ['Gönüllüleri her satıra: Ad Soyad ; görev.', 'Başlığı ve rengi kontrol et.', 'PDF indir: A4’e 8 kart, kesim çizgili.'],
    'Kumbara etiketi': ['Etiket başlığını ve bağış bağlantısını yaz.', 'Önizlemeyi kontrol et.', 'A4’e 4 etiket PDF indir ya da editörde aç.'],
    'Kampanya seti': ['Kampanyayı seç.', 'Yazıları bir kez yaz.', 'Tüm boyutlar birlikte hazırlanır.'],
  };
  const decorateHelp = (box) => {
    const h3 = $('.d-body > h3', box); if (!h3 || h3.dataset.p13h) return;
    const title = h3.textContent.trim(); const key = Object.keys(HELP).find((k) => title.includes(k)); if (!key) return;
    h3.dataset.p13h = '1';
    const b = document.createElement('button'); b.className = 'hw-btn'; b.type = 'button'; b.textContent = 'Nasıl?';
    h3.appendChild(b);
    b.onclick = () => {
      let card = $('.hw-card', box); if (card) { card.remove(); return; }
      card = document.createElement('div'); card.className = 'hw-card';
      card.innerHTML = HELP[key].map((s, i) => `<div class="hw-st"><i>${i + 1}</i><span>${esc(s)}</span></div>`).join('');
      h3.after(card);
    };
  };
  new MutationObserver(() => {
    $$('.overlay .dialog').forEach((box) => { const h = $('.d-body > h3', box); if (!h) return; if (/Diğer işlemler/.test(h.textContent)) decorateMenu(box); decorateHelp(box); });
  }).observe(document.body, { childList: true, subtree: true });

  // ================================================================ 5) bağış web sayfası (tek dosya)
  const pageHTML = (o) => {
    const c1 = o.c1, c2 = o.c2, e = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const wa = waNum(o.wa);
    return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(o.name)} · Bağış</title>
<style>:root{--c1:${c1};--c2:${c2}}*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#F6F5F1;color:#1F2937;line-height:1.5}
.hero{background:var(--c1);color:#fff;padding:48px 20px 64px;text-align:center}.hero img{width:84px;height:84px;object-fit:contain;background:#fff;border-radius:20px;padding:8px;margin-bottom:12px}
.hero h1{margin:0;font-size:clamp(26px,6vw,40px)}.hero p{margin:10px auto 0;max-width:560px;opacity:.9;font-size:17px}
main{max-width:860px;margin:-36px auto 40px;padding:0 16px}.card{background:#fff;border-radius:20px;box-shadow:0 10px 30px -14px rgba(0,0,0,.25);padding:22px;margin-bottom:18px}
h2{margin:0 0 12px;font-size:20px;color:var(--c1)}.camps{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}.camp{border-radius:16px;overflow:hidden;background:#F3F4F6}.camp img{width:100%;display:block}.camp b{display:block;padding:10px 12px;font-size:15px}
.row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #EEE;flex-wrap:wrap}.row span{color:#6B7280}.iban{font-family:ui-monospace,Menlo,monospace;font-weight:700;letter-spacing:.5px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;padding:14px 18px;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none}
.b1{background:#25D366;color:#fff}.b2{background:var(--c2);color:#111}.b3{background:#EEF0F4;color:#111;padding:8px 12px;font-size:13px}.acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
footer{text-align:center;color:#9CA3AF;font-size:13px;padding:20px}</style></head><body>
<header class="hero">${o.logo ? `<img src="${o.logo}" alt="">` : ''}<h1>${e(o.name)}</h1><p>${e(o.slogan)}</p></header><main>
${o.camps.length ? `<section class="card"><h2>Kampanyalarımız</h2><div class="camps">${o.camps.map((c) => `<div class="camp"><img src="${c.img}" alt="${e(c.name)}" loading="lazy"><b>${e(c.name)}</b></div>`).join('')}</div></section>` : ''}
<section class="card"><h2>Bağış bilgileri</h2>${o.receiver ? `<div class="row"><span>Alıcı</span><b>${e(o.receiver)}</b></div>` : ''}${o.bank ? `<div class="row"><span>Banka</span><b>${e(o.bank)}</b></div>` : ''}${o.iban ? `<div class="row"><span>IBAN</span><b class="iban" id="iban">${e(o.iban)}</b></div>` : ''}${o.note ? `<div class="row"><span>Açıklama</span><b>${e(o.note)}</b></div>` : ''}
<div class="acts">${o.iban ? '<button class="btn b2" onclick="navigator.clipboard.writeText(document.getElementById(\'iban\').textContent.replace(/\\s/g,\'\'));this.textContent=\'IBAN kopyalandı ✓\'">IBAN’ı kopyala</button>' : ''}${wa ? `<a class="btn b1" href="https://wa.me/${wa}?text=${encodeURIComponent('Selamün aleyküm, bağış yapmak istiyorum.')}">WhatsApp’tan yaz</a>` : ''}${o.phone ? `<a class="btn b3" href="tel:${e(o.phone.replace(/\s/g, ''))}">Ara: ${e(o.phone)}</a>` : ''}</div></section>
${o.about ? `<section class="card"><h2>Hakkımızda</h2><p style="margin:0">${e(o.about)}</p></section>` : ''}
</main><footer>${e(o.name)} · ${new Date().getFullYear()}</footer></body></html>`;
  };
  P13.webPage = async function () {
    const list = (await A().api('projects').catch(() => [])).slice(0, 30), D = don(), b = brand(), saved = LS.get('ts_webpage', {});
    let html = '';
    const res = await A().dialog(`<div class="d-body"><h3>${icon('file')} Bağış web sayfası</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Kurum bilgilerin, IBAN, kampanyaların ve WhatsApp düğmesiyle tek sayfalık bir bağış sayfası. Telefonda düzgün görünür.</p>
      <div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field"><span>Kurum adı</span><input class="inp" id="wpN" value="${esc(saved.name || b.name || '')}"></label>
        <label class="field"><span>Kısa tanıtım</span><input class="inp" id="wpS" value="${esc(saved.slogan || 'İyilik paylaştıkça çoğalır')}"></label>
        <label class="field"><span>Alıcı</span><input class="inp" id="wpR" value="${esc(saved.receiver || D.receiver || '')}"></label>
        <label class="field"><span>Banka</span><input class="inp" id="wpB" value="${esc(saved.bank || D.bank || '')}"></label>
        <label class="field" style="grid-column:1/-1"><span>IBAN</span><input class="inp" id="wpI" value="${esc(saved.iban || D.iban || '')}" placeholder="TR00 0000 0000 0000 0000 0000 00"></label>
        <label class="field"><span>Açıklamaya yazılacak</span><input class="inp" id="wpA" value="${esc(saved.note || 'Ad Soyad + bağış türü')}"></label>
        <label class="field"><span>WhatsApp / telefon</span><input class="inp" id="wpW" value="${esc(saved.wa || D.wa || '')}"></label>
        <label class="field" style="grid-column:1/-1"><span>Hakkımızda (isteğe bağlı)</span><textarea class="inp" id="wpH" rows="2">${esc(saved.about || '')}</textarea></label></div>
      <div class="ff-sec">Sayfada görünecek kampanyalar</div>
      <div class="wp-camps">${list.map((p) => `<label class="wp-c"><input type="checkbox" data-id="${p.id}"><span>${p.thumb ? `<img alt="" src="${p.thumb}">` : ''}</span><small>${esc(p.name || 'Tasarım')}</small></label>`).join('') || '<p class="muted">Henüz tasarım yok.</p>'}</div>
      <iframe class="wp-prev" id="wpV" title="Önizleme"></iframe></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="wpP">Önizle</button><button class="btn primary" id="wpGo">${icon('download')}Sayfayı indir</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const build = async () => {
          const o = { name: $('#wpN', box).value, slogan: $('#wpS', box).value, receiver: $('#wpR', box).value, bank: $('#wpB', box).value, iban: $('#wpI', box).value, note: $('#wpA', box).value, wa: $('#wpW', box).value, phone: $('#wpW', box).value, about: $('#wpH', box).value, logo: b.logo && /^data:/.test(b.logo) ? b.logo : '', c1: bcol(0, '#14532D'), c2: bcol(1, '#E8C35A'), camps: [] };
          LS.set('ts_webpage', o);
          if (b.logo && !o.logo) { try { const r = await fetch(b.logo); if (r.ok) o.logo = await toDataURL(await r.blob()); } catch (e) {} }
          for (const c of $$('[data-id]', box).filter((x) => x.checked)) {
            try { const d = await A().api('projects/' + c.dataset.id); await R.ensureImageSizes(d).catch(() => {}); const bl = await R.exportBlob(d, 'jpg', Math.min(1, 900 / Math.max(d.width, d.height))); o.camps.push({ name: d.name || 'Kampanya', img: await toDataURL(bl) }); } catch (e) {}
          }
          html = pageHTML(o); return o;
        };
        $('#wpP', box).onclick = async () => { const bz = busy('Sayfa hazırlanıyor…'); try { await build(); $('#wpV', box).srcdoc = html; $('#wpV', box).classList.add('on'); } finally { bz.done(); } };
        $('#wpGo', box).onclick = async () => { const bz = busy('Sayfa hazırlanıyor…'); try { const o = await build(); close(o); } finally { bz.done(); } };
      },
    });
    if (!res) return;
    R.download(new Blob([html], { type: 'text/html' }), slug(res.name || 'bagis') + '-bagis-sayfasi.html');
    toast('Sayfa indi. Dosyayı web sitene, Google Sites’a ya da Drive’a koyup bağlantısını paylaşabilirsin.');
  };

  // ================================================================ 6) müzikli hazır hareketli videolar
  // telif sorunu olmayan sakin fon müziği: uygulama içinde üretilir (yumuşak akorlar + çan sesleri)
  P13.ambient = async function (sec = 16, mood = 'gece') {
    const sr = 44100, AC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!AC) return null;
    const ac = new AC(2, sr * sec, sr), out = ac.createGain(); out.gain.value = 0.55;
    // basit yankı
    const dl = ac.createDelay(1), fb = ac.createGain(), wet = ac.createGain(); dl.delayTime.value = 0.32; fb.gain.value = 0.38; wet.gain.value = 0.32;
    out.connect(ac.destination); out.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(ac.destination);
    const f = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const prog = mood === 'bayram' ? [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]] : [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]];
    const bar = sec / 4;
    prog.forEach((ch, i) => ch.forEach((n) => {
      const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f(n - 12); lp.type = 'lowpass'; lp.frequency.value = 900;
      const t0 = i * bar; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.07, t0 + bar * 0.4); g.gain.linearRampToValueAtTime(0, t0 + bar + 0.6);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t0); o.stop(Math.min(sec, t0 + bar + 0.8));
    }));
    const scale = mood === 'bayram' ? [72, 74, 76, 79, 81, 84] : [74, 77, 79, 81, 84, 86];
    for (let t = 0.5, k = 0; t < sec - 0.5; t += bar / 4, k++) {
      if (k % 4 === 3) continue;
      const n = scale[(k * 5 + Math.floor(t)) % scale.length], o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f(n);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.6);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.7);
    }
    out.gain.setValueAtTime(0.55, sec - 1.5); out.gain.linearRampToValueAtTime(0, sec);
    return ac.startRendering();
  };
  const VIDS = [['kandil', 'Kandil gecesi', 'b-kandil-regaip', 'gece'], ['ramazan', 'Ramazan', 'b-ramazan-koli', 'gece'], ['kurban', 'Kurban', 'b-kurban-mesaj', 'bayram'], ['cuma', 'Hayırlı Cumalar', 'b-cuma', 'gece'], ['mevlid', 'Mevlid Kandili', 'b-kandil-mevlid', 'gece'], ['tesekkur', 'Teşekkür', 'b-tesekkur', 'bayram']];
  P13.videos = async function () {
    const k = await A().dialog(`<div class="d-body"><h3>${icon('play')} Hazır hareketli videolar</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Story boyunda (WhatsApp durumu, Instagram). Yazılar sırayla gelir, sakin bir fon müziği eklenir; müzik uygulamada üretilir, telif sorunu yoktur.</p>
      <div class="kp-acts">${VIDS.map(([id, n]) => `<button class="kp-a" data-k="${id}">${icon('play')}<b>${n}</b><small>story · ~8 sn · müzikli</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, { onOpen: (box, close) => $$('[data-k]', box).forEach((b) => (b.onclick = () => close(b.dataset.k))) });
    if (!k) return;
    const [, name, tid, mood] = VIDS.find((v) => v[0] === k), t = tpl(tid);
    if (!t) return toast('Şablon bulunamadı', true);
    const bz = busy('Video hazırlanıyor…');
    try {
      if (window.Food && window.Food.load) await window.Food.load();
      if (window.Food && window.Food.loadCharity) await window.Food.loadCharity();
      let patch;
      if (tid === 'b-cuma' && window.P8) patch = window.P8.cumaPatch();
      const d = R.normalize(L().instantiateAt(t, 0, null, 1080, 1920, null, patch));
      await R.ensureDocFonts(d).catch(() => {}); try { R.fitUnbreakable(d); } catch (e) {}
      const p = await window.P10.makeDoc(1080, 1920, name + ' · video', d.layers, d.background, Object.assign({}, d.meta || {}, { template: tid, animStyle: 'calm', animLen: 8 }), true);
      for (let i = 0; i < 60 && !(E() && E().doc && E().doc.width === 1080 && E().doc.height === 1920); i++) await sleep(150);
      if (!E()) return;
      E().autoAnim('calm');
      const buf = await P13.ambient(16, mood).catch(() => null);
      if (buf) E().state.music = { name: 'Sakin fon müziği', buf };
      bz.done();
      await E().anim();
      void p;
    } catch (e) { toast('Video hazırlanamadı: ' + e.message, true); } finally { bz.done(); }
  };

  // ================================================================ 7) İspanyolca tek dokunuş (geniş sözlük)
  const ES = {
    'Hedefimiz 1.000 Koli': 'Nuestra meta: 1.000 cajas', 'Her koli bir ailenin bir aylık sofrası. Hedefe birlikte ulaşalım!': 'Cada caja es la mesa de una familia durante un mes. ¡Alcancemos la meta juntos!', '/ 1.000 koli': '/ 1.000 cajas', 'Son 12 gün': 'Últimos 12 días', 'Sen de bir koli ekle': 'Suma tú también una caja',
    'Kurban Hissesi Hedefimiz': 'Nuestra meta de Qurbani', 'Uzak diyarlardaki kardeşlerimize ulaşacak hisseler': 'Partes que llegarán a nuestros hermanos en tierras lejanas', '/ 350 hisse': '/ 350 partes', 'Hisseni ayır': 'Reserva tu parte',
    'Teşekkür ederiz': 'Gracias', 'Sayın': 'Estimado/a', 'Ad Soyad': 'Nombre Apellido', 'Bağışınız Ulaştı': 'Su donación llegó', 'Desteğiniz ihtiyaç sahibi ailelere ulaştırıldı. Allah kabul etsin, hayrınızı çoğaltsın.': 'Su apoyo llegó a las familias necesitadas. Que Allah lo acepte y multiplique su bien.',
    'Kesim bildirimi': 'Aviso de sacrificio', 'Kurbanınız Kesildi': 'Su Qurbani fue realizado', 'Kurbanınız itina ile kesilmiş, etleri ihtiyaç sahiplerine ulaştırılmıştır. Allah kabul etsin.': 'Su Qurbani fue realizado con esmero y la carne fue entregada a los necesitados. Que Allah lo acepte.', 'Hisse no': 'N.º de parte', 'Tarih': 'Fecha', 'Yer': 'Lugar',
    'Bir Koli\nMutluluk': 'Una caja,\nuna alegría', 'İftar ve sahur sofrasına bereket getiren yardım kumanyalarıyla siz de ihtiyaç sahibi bir ailenin mutluluğuna vesile olun.': 'Con las cajas de ayuda que traen bendición al iftar y al suhur, sea usted también motivo de alegría para una familia necesitada.',
    'Kumanya\nKayıtlarımız Başladı!': '¡Comenzaron las inscripciones\nde cajas de ayuda!', 'Bir ailenin sofrasına misafir olun!': '¡Sea invitado en la mesa de una familia!', 'Koli Koli\nBereket': 'Caja a caja,\nbendición', 'Bu sene de Ramazan bereketini koli koli dağıtmaya kararlıyız… Siz de vesile olanlardan olun!': 'Este año también repartiremos la bendición del Ramadán caja a caja… ¡Sea usted parte de ello!',
    'Bu Kolide\nUmudu Taşıyoruz': 'En esta caja\nllevamos esperanza', 'Umudumuz, bu Ramazanda da hiç kimse temel gıdalardan mahrum kalmasın!': '¡Nuestra esperanza: que en este Ramadán nadie se quede sin alimentos básicos!', 'Kumanya bedeli': 'Costo de la caja',
    'Bi’ Mesajla': 'Con un mensaje', 'Kurban': 'Qurbani', 'Kesiyoruz': 'sacrificamos', 'Üç Aylar vesilesi ile': 'Con motivo de los Tres Meses Sagrados', 'hayatının bereketi için bir kurbana da sen vesile ol!': '¡sé tú también motivo de un Qurbani por la bendición de tu vida!', 'Kurbanlarınız itina ile kesilir': 'Sus Qurbanis se realizan con esmero', 'Videosu anında iletilir': 'El video se envía al instante',
    'Kurbanlarınıza': 'Para sus Qurbanis', 'VESİLE': 'SOMOS', 'Oluyoruz': 'el medio', 'Alemler, hürmetine yaratılan': 'Por el honor de aquel por quien fueron creados los mundos', 'Efendimiz (S.A.V.) niyetine Regaib Kandilinde siz de bir kurbana vesile olmak ister misiniz?': '¿Desea ser motivo de un Qurbani en la Noche de Ragaib, con la intención del Profeta (s.a.w.)?',
    'Regaib Kandilinde': 'En la Noche de Ragaib', 'KURBAN': 'QURBANI', 'Efendimiz (S.A.V.) niyetine keseceğimiz kurbana katkıda bulunmak ister misiniz?': '¿Desea contribuir al Qurbani que sacrificaremos con la intención del Profeta (s.a.w.)?',
    'KALP SÖYLER': 'EL CORAZÓN HABLA', 'Kainat': 'El universo', 'Dinler!': '¡escucha!', 'Uzak diyarlarda, ilim talebeleri için ikram edeceğimiz': 'En tierras lejanas, ¿desea contribuir a la carne de Qurbani', 'kurban etine katkıda bulunmak ister misiniz?': 'que ofreceremos a los estudiantes de conocimiento?',
    'Kurbanını Paylaş': 'Comparte tu Qurbani', 'İyiliğe Yakınlaş!': '¡Acércate al bien!', 'Maddenin MANA ile buluştuğu coğrafyalarda;': 'En las tierras donde lo material se encuentra con el SIGNIFICADO;', 'bir iyiliğe daha vesile olmak, bir gönülde daha yer edinmek, bir kurban ile mümkün!': 'ser motivo de un bien más y ganar un corazón más ¡es posible con un Qurbani!', 'Hisse Bedeli': 'Costo de la parte',
    'Kurbanı Fırsat Bil': 'Aprovecha el Qurbani', 'İyiliğe Fırsat Bul!': '¡Encuentra la oportunidad del bien!', 'Bir Bilsen!': '¡Si supieras!', 'Ne kadar kaldı?': '¿Cuánto falta?', 'Kurban\nBayramına': 'Para el Eid\nal-Adha', 'son': 'faltan', 'gün': 'días',
    'Kurban\nBerekettir': 'El Qurbani\nes bendición', 'Asli Bir İhtiyaçtır': 'Es una necesidad esencial', 'Şükür!': '¡Gratitud!', 'Hayatınızı anlamlandıran bir ibadet!': '¡Una adoración que da sentido a su vida!', 'Kurban videosu tarafınıza iletilir': 'Le enviamos el video del Qurbani',
    'Şifa Kurbanı': 'Qurbani de sanación', 'Nafile Kurban': 'Qurbani voluntario', 'Akika Kurbanı': 'Qurbani de Aqiqa', 'Adak Kurban': 'Qurbani de promesa',
    'Kumanya': 'Caja', 'Yardımı': 'de ayuda', 'Kumanya\nBedeli': 'Costo\nde la caja', 'Yardımlarınız': 'Que sus ayudas', 'Birer': 'sean', 'Umut': 'esperanza', 'Olsun': '', 'Mutluluk': 'La alegría', 'Paylaştıkça': 'se multiplica', 'Çoğalır': 'al compartirla',
    'El Salvador – Orta Amerika': 'El Salvador – Centroamérica', 'Ranza Projesi': 'Proyecto Literas', 'El Salvador’daki öğrencilerimizin daha konforlu ve güvenli bir ortamda eğitim alabilmesi için 20 adet ranzaya ihtiyacımız var.': 'Necesitamos 20 literas para que nuestros estudiantes en El Salvador estudien en un ambiente más cómodo y seguro.', 'Bu iyiliğe ortak olur musunuz?': '¿Se une a este bien?',
    '1 Ranza\nbedeli': 'Costo de\n1 litera', 'Desteğinizle bir öğrencinin hayatına dokunun.': 'Con su apoyo, toque la vida de un estudiante.', '1 Hisse\nbedeli': 'Costo de\n1 parte', 'Küçük bir katkı, büyük bir değişim sağlar.': 'Un pequeño aporte logra un gran cambio.', 'Eğitime destek': 'Apoyo a la educación', 'Geleceğe yatırım': 'Inversión en el futuro', 'Birlikte güçlüyüz': 'Juntos somos fuertes', 'Bir gülümsemeye ortak ol': 'Sé parte de una sonrisa', 'Destekleriniz için teşekkür ederiz.': 'Gracias por su apoyo.',
    'Ranza\nProjesi': 'Proyecto\nLiteras', 'El Salvador’daki talebelerimiz için 20 adet ranzaya ihtiyaç duymaktayız, sizler de bu hususta talebelerimize yardımcı olmak ister misiniz?': 'Necesitamos 20 literas para nuestros estudiantes en El Salvador. ¿Desea ayudarlos?',
    'Mevlid': 'Mawlid', 'Kandiliniz': 'Noche bendita', 'Mübarek olsun': 'Que sea bendita', 'Âlemlere rahmet Peygamber Efendimizin (s.a.v.) dünyaya teşrif ettiği gece': 'La noche en que llegó al mundo nuestro Profeta (s.a.w.), misericordia para los mundos', '“Biz seni ancak âlemlere rahmet olarak gönderdik.” (Enbiyâ, 107)': '“Y no te hemos enviado sino como misericordia para los mundos.” (Al-Anbiya, 107)',
    'Regaip': 'Ragaib', 'Üç Ayların ilk kandili; rahmet ve bağışlanma kapılarının açıldığı gece': 'La primera noche bendita de los Tres Meses; noche en que se abren las puertas de la misericordia y el perdón', '“Allah’ım! Recep ve Şaban’ı bize mübarek kıl ve bizi Ramazan’a ulaştır.” (Taberânî)': '“¡Oh Allah! Bendícenos en Rajab y Sha‘ban y haznos llegar a Ramadán.” (Tabarani)',
    'Miraç': 'Mi‘rach', 'Namazın müminin miracı olarak hediye edildiği mübarek gece': 'La noche bendita en que la oración fue regalada como ascensión del creyente', '“Kulunu bir gece Mescid-i Haram’dan Mescid-i Aksâ’ya yürüten Allah’ın şanı yücedir.” (İsrâ, 1)': '“Glorificado sea Quien hizo viajar de noche a Su siervo desde la Mezquita Sagrada hasta la Mezquita Al-Aqsa.” (Al-Isra, 1)',
    'Berat': 'Barat', 'Af ve mağfiret gecesi; dualarınızda bizleri de unutmayın': 'Noche de perdón; no nos olvide en sus súplicas', '“Dua, ibadetin özüdür.” (Tirmizî)': '“La súplica es la esencia de la adoración.” (Tirmidhi)',
    'Haftalar': 'semanas', 'Bu hafta': 'Esta semana', 'Cumalar': 'viernes', 'Cuma': 'Viernes', 'Cumanız mübarek, dualarınız makbul olsun': 'Bendito viernes, que sus súplicas sean aceptadas', 'Peygamber Efendimiz (s.a.v.) buyurdu: “Üzerine güneş doğan en hayırlı gün cuma günüdür.” (Müslim)': 'El Profeta (s.a.w.) dijo: “El mejor día sobre el que sale el sol es el viernes.” (Muslim)',
    'Talebe-i Ulûm': 'Estudiantes del conocimiento', '‘Bir milletin ıslahı; kötülerin imhasıyla değil, yeni neslin eğitim ve terbiyesiyle mümkündür.’': '‘La mejora de una nación no es posible destruyendo a los malos, sino educando a la nueva generación.’', '“Bir talebenin yetişmesinde nice emek ve fedakârlık var. Siz de Orta Amerika’da ilim tahsil eden bir talebenin yetişmesine katkıda bulunabilirsiniz.”': '“Formar a un estudiante requiere mucho esfuerzo y sacrificio. Usted también puede contribuir a la formación de un estudiante en Centroamérica.”',
    '‘Sizin en hayırlınız Kur’an-ı öğrenen ve öğretenizdir’': '‘El mejor de ustedes es quien aprende el Corán y lo enseña’', '“İlimle Daha Aydınlık Yarınlara”': '“Hacia un mañana más brillante con el conocimiento”', 'Bir İlim Yuvasına': 'A un hogar de conocimiento', 'Siz de Destek Olun': 'Apoye usted también', 'Aylık Kira Bedeli': 'Alquiler mensual', '1 Destek Hissesi': '1 parte de apoyo', 'Kurs Kirasına Destek': 'Apoyo al alquiler del curso', '“Hayra vesile olan, hayrı yapan gibidir.”': '“Quien guía hacia el bien es como quien lo hace.”',
    'Ramazanı Şerif başlangıcı': 'Inicio del Ramadán', 'İhtidadan\nTekamüle': 'De la conversión\nal crecimiento', 'İslam şerefiyle müşerref olmuş talebelerimizin ilk Ramazan’ı şeriflerinde onlara iftar ikramında bulunmak ister misiniz?': '¿Desea ofrecer el iftar a nuestros estudiantes que abrazaron el Islam, en su primer Ramadán?',
    'Hicri Yeni Yılımız': 'Feliz Año Nuevo', 'Mübarek Olsun': 'Islámico', 'Panama’da bu sene 5000 aşure insanların hidayetine vesile olacak; sizler de bir kase aşure ikram etmek ister misiniz?': 'Este año en Panamá 5000 aşure serán motivo de guía para la gente; ¿desea ofrecer usted también un tazón de aşure?',
    'Sizin Adınıza\nBiz Aşure Dağıtabiliriz': 'En su nombre\nrepartimos aşure', 'Siz de ikram etmek ister misiniz?': '¿Desea ofrecer usted también?', 'Dünyanın Dört Bir Yerinde\nAşure Kazanlarımız Kaynıyor,': 'En todo el mundo\nhierven nuestras ollas de aşure,',
    'Hayırlı Cumalar': 'Bendito viernes', 'Hayırlı Kandiller': 'Benditas noches', 'Kandiliniz mübarek olsun': 'Que su noche sea bendita', 'Bağış için okutun': 'Escanee para donar', 'Mübarek gecede dualarınızda olalım': 'En esta noche bendita, téngannos en sus súplicas',
  };
  const gk = (x) => String(x || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();
  if (window.P8 && window.P8.GLOSS) Object.entries(ES).forEach(([k, v]) => { const cur = window.P8.GLOSS[k]; window.P8.GLOSS[k] = [v, cur ? cur[1] : null]; });
  P13.spanish = async function () {
    const api = E(), p = A().S.project; if (!api || !p) return toast('Önce bir tasarım aç', true);
    api.flush && api.flush(); await A().saveProject(p).catch(() => {});
    const d = JSON.parse(JSON.stringify(api.doc));
    const texts = d.layers.filter((l) => l.type === 'text' && R.plain(l.text).trim() && !/^[\d\s.,:;()₺$€%+\-/]+$/.test(R.plain(l.text)));
    let ai = new Map();
    try { const out = await A().api('ai-text', { body: { task: 'translate', lang: 'İspanyolca', items: texts.map((t) => ({ id: t.id, text: R.plain(t.text) })) } }); ai = new Map((out.items || []).map((it) => [it.id, it.text])); } catch (e) {}
    const missed = [];
    texts.forEach((t) => {
      const pl = gk(R.plain(t.text)); let nt = ai.get(t.id);
      if (nt == null) nt = ES[pl] != null ? ES[pl] : (window.P8 && window.P8.gloss ? window.P8.gloss(pl, 0) : null);
      if (nt == null) { missed.push(pl.slice(0, 40)); return; }
      R.layoutText(t); const n0 = Math.max(1, (t._lines || ['']).length);
      t.text = nt || ' '; R.layoutText(t);
      // çeviri uzarsa satır sayısı artıp alttaki yazıya binmesin: aynı satır sayısına sığana kadar küçült
      for (let k = 0; k < 14 && (t._lines || []).length > n0 && t.fontSize > 8; k++) { t.fontSize = Math.round(t.fontSize * 0.93 * 10) / 10; t.letterSpacing = Math.round((t.letterSpacing || 0) * 0.93 * 10) / 10; R.layoutText(t); }
    });
    try { R.fitUnbreakable(d); } catch (e) {}
    d.layers.forEach((l) => { if (l.type === 'text') { R.layoutText(l); for (let k = 0; k < 12 && l._lines && l.maxLines && l._lines.length > l.maxLines; k++) { l.fontSize = Math.round(l.fontSize * 0.93); R.layoutText(l); } } });
    await window.P10.makeDoc(d.width, d.height, (p.name || 'Tasarım') + ' — Español', d.layers, d.background, Object.assign({}, d.meta || {}, { lang: 'es' }), true);
    toast(missed.length ? `İspanyolca kopya açıldı. ${missed.length} yazı sözlükte yoktu, Türkçe kaldı (ör. “${missed[0]}”); dokunup düzeltebilirsin.` : 'İspanyolca kopya açıldı; Türkçe tasarım olduğu gibi duruyor.');
  };

  // ================================================================ 8) gönüllü yaka kartı ve kumbara etiketi
  const T = (name, text, x, y, w, fs, o = {}) => Object.assign({ type: 'text', name, text: String(text), x: r1(x), y: r1(y), w: r1(w), h: r1(fs * 1.25), fontSize: Math.round(fs), fontFamily: 'Poppins', fontWeight: 500, fill: '#1F2937', align: 'center', lineHeight: 1.2 }, o);
  const Rc = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fill, radius: 0 }, o);
  const Im = (name, src, x, y, w, h, o = {}) => Object.assign({ type: 'image', name, src, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fit: 'contain', filters: {} }, o);
  const docOf = (W, H, layers, bg) => { const d = R.normalize({ width: W, height: H, background: bg || { type: 'solid', color: '#FFFFFF' }, layers }); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; };
  const initials = (n) => String(n || '').split(/\s+/).map((w) => w[0] || '').join('').slice(0, 3).toLocaleUpperCase('tr-TR');
  // gönüllü yaka kartı: dikey (54 × 86 mm), koyu desenli üst, isim baş harfli madalyon, görev rozeti, ikonlar
  const shade = (hex, k) => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16) || 0; const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
  P13.badgeDoc = function (o) {
    const W = 638, H = 1011, c1 = o.c1 || bcol(0, '#14532D'), c2 = bcol(1, '#E8C35A'), b = brand(), L0 = [], th = TH();
    const top = 470;
    L0.push(Rc('Zemin', 0, 0, W, H, '#FFFFFF'));
    L0.push(Rc('Üst renk', 0, 0, W, top, { type: 'linear', angle: 160, colors: [shade(c1, 1.25), c1, shade(c1, 0.6)] }));
    if (th && th.girih) L0.push(Im('Süs · desen', th.girih(W, top, 'rgba(255,255,255,0.10)'), 0, 0, W, top, { fit: 'fill', locked: true }));
    if (th && th.garland) L0.push(Im('Süs · ışıklar', th.garland(W, 120), 0, 0, W, 120, { fit: 'fill', opacity: 0.8 }));
    // alt kısma yumuşak dalga
    L0.push({ type: 'path', name: 'Süs · dalga', d: 'M0 40 C 25 0, 75 80, 100 30 L100 100 L0 100 Z', vw: 100, vh: 100, x: 0, y: top - 70, w: W, h: 110, fill: '#FFFFFF' });
    // askı deliği
    L0.push(Rc('Süs · askı deliği', W / 2 - 60, 30, 120, 26, 'rgba(255,255,255,0.85)', { radius: 13 }));
    // kurum
    if (b.logo) { L0.push({ type: 'ellipse', name: 'Logo zemini', x: W / 2 - 46, y: 82, w: 92, h: 92, fill: '#FFFFFF' }); L0.push(Im('Logo', b.logo, W / 2 - 36, 92, 72, 72)); }
    L0.push(T('Kurum', b.name || 'Kurum adı', 40, b.logo ? 190 : 110, W - 80, 30, { fill: '#FFFFFF', fontWeight: 700, fontFamily: 'Montserrat', letterSpacing: 1 }));
    // madalyon: baş harfler (altın halka)
    const md = 230, mx = (W - md) / 2, my = top - md * 0.62;
    L0.push({ type: 'ellipse', name: 'Süs · madalyon gölge', x: mx - 8, y: my - 8, w: md + 16, h: md + 16, fill: { type: 'linear', angle: 135, colors: [c2, shade(c2, 0.7)] }, shadow: { x: 0, y: 10, blur: 28, color: 'rgba(0,0,0,0.30)' } });
    L0.push({ type: 'ellipse', name: 'Madalyon', x: mx, y: my, w: md, h: md, fill: { type: 'linear', angle: 135, colors: [shade(c1, 1.35), shade(c1, 0.85)] } });
    L0.push(T('Baş harfler', initials(o.name || 'Ad Soyad') || '★', mx, my + md * 0.26, md, md * 0.42, { fill: '#FFFFFF', fontFamily: 'DM Serif Display', fontWeight: 400, lineHeight: 1 }));
    // isim + görev
    L0.push(T('Ad', o.name || 'Ad Soyad', 36, top + 130, W - 72, 58, { fontWeight: 800, fill: '#111827', fontFamily: 'Montserrat', lineHeight: 1.1 }));
    const role = o.role || 'Görev';
    const rw = Math.min(W - 120, 90 + role.length * 19);
    L0.push(Rc('Görev zemini', (W - rw) / 2, top + 222, rw, 58, { type: 'linear', angle: 0, colors: [c2, shade(c2, 0.85)] }, { radius: 29 }));
    L0.push(T('Görev', role, (W - rw) / 2, top + 236, rw, 28, { fill: '#1F2937', fontWeight: 700 }));
    // GÖNÜLLÜ başlığı ikonla
    const ic = th && th.icon ? th.icon('el', c1) : null;
    if (ic) L0.push(Im('Süs · ikon', ic, W / 2 - 150, top + 318, 50, 50));
    L0.push(T('Başlık', (o.title || 'Gönüllü').toLocaleUpperCase('tr-TR'), W / 2 - 92, top + 326, 260, 34, { fill: c1, fontWeight: 800, letterSpacing: 6, align: 'left' }));
    if (o.event) { const ci = th && th.icon ? th.icon('takvim', '#6B7280') : null; if (ci) L0.push(Im('Süs · takvim', ci, 60, top + 404, 32, 32)); L0.push(T('Etkinlik', o.event, 100, top + 406, W - 160, 24, { fill: '#4B5563', align: 'left', fontWeight: 600 })); }
    // alt bant
    L0.push(Rc('Alt bant', 0, H - 64, W, 64, { type: 'linear', angle: 0, colors: [c1, shade(c1, 0.7)] }));
    L0.push(T('Alt yazı', o.foot || 'Birlikte iyiliğe', 0, H - 46, W, 24, { fill: c2, fontWeight: 700, letterSpacing: 2 }));
    const d = docOf(W, H, L0); try { R.fitUnbreakable(d); } catch (e) {} return d;
  };
  const sheetPDF = async (docs, per, name, cols = 2) => {
    const PW = 2480, PH = 3508, M = 70, pages = [];
    const rows = Math.ceil(per / cols), cw = (PW - 2 * M) / cols, ch = (PH - 2 * M) / rows;
    for (let i = 0; i < docs.length; i += per) {
      const c = document.createElement('canvas'); c.width = PW; c.height = PH; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH);
      for (let j = 0; j < per && i + j < docs.length; j++) {
        const d = docs[i + j]; await R.ensureImageSizes(d).catch(() => {});
        const k = Math.min((cw - 40) / d.width, (ch - 40) / d.height), src = await R.exportCanvas(d, k);
        const cx = M + (j % cols) * cw + (cw - src.width) / 2, cy = M + Math.floor(j / cols) * ch + (ch - src.height) / 2;
        x.drawImage(src, cx, cy); x.strokeStyle = '#9CA3AF'; x.setLineDash([14, 10]); x.lineWidth = 2; x.strokeRect(cx, cy, src.width, src.height);
      }
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92)); pages.push({ blob, w: PW, h: PH });
    }
    R.download(await window.P9.pdfFromJpegs(pages), slug(name) + '.pdf');
  };
  P13.badges = async function () {
    const res = await A().dialog(`<div class="d-body"><h3>${icon('list')} Gönüllü kartları</h3>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr;gap:10px">
        <label class="field"><span>Gönüllüler (her satıra: Ad Soyad ; görev)</span><textarea class="inp" id="bdL" rows="5" placeholder="Ahmet Yılmaz ; Organizasyon&#10;Ayşe Demir ; İkram">${esc(LS.get('ts_badges', ''))}</textarea></label>
        <label class="field"><span>Kart başlığı</span><input class="inp" id="bdT" value="Gönüllü"></label>
        <label class="field"><span>Etkinlik (isteğe bağlı)</span><input class="inp" id="bdE" placeholder="ör. Ramazan iftar programı 2027"></label></div>
        <div class="kit-pv"><div class="kit-th" id="bdV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="bdEd">Tek kartı editörde aç</button><button class="btn primary" id="bdGo">${icon('download')}PDF indir (A4'e 9)</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const items = () => { const rs = parseRows($('#bdL', box).value); return (rs.length ? rs : [['Ad Soyad', 'Görev']]).map((r) => ({ name: r[0], role: r[1] || '', title: $('#bdT', box).value, event: $('#bdE', box).value })); };
        const pv = () => { $('#bdV', box).innerHTML = R.renderSVG(P13.badgeDoc(items()[0]), { fit: true, prefix: 'bd' + Math.random().toString(36).slice(2, 6) }); LS.set('ts_badges', $('#bdL', box).value); };
        let tm = 0; $$('input,textarea', box).forEach((x) => (x.oninput = () => { clearTimeout(tm); tm = setTimeout(pv, 200); })); pv();
        $('#bdGo', box).onclick = () => close({ go: 'pdf', it: items() }); $('#bdEd', box).onclick = () => close({ go: 'ed', it: items() });
      },
    });
    if (!res) return;
    if (res.go === 'ed') { const d = P13.badgeDoc(res.it[0]); return window.P10.makeDoc(d.width, d.height, 'Gönüllü kartı · ' + res.it[0].name, d.layers, d.background, { folder: 'Gönüllüler' }, true); }
    const bz = busy('Kartlar hazırlanıyor…');
    try { await sheetPDF(res.it.map(P13.badgeDoc), 9, 'gonullu-kartlari', 3); toast(`${res.it.length} gönüllü kartı indi (A4'e 9, kesim çizgili)`); } catch (e) { toast(e.message, true); } finally { bz.done(); }
  };
  // sadaka / bağış kutusu etiketi (100 × 70 mm): gece gökyüzü, ışık süsleri, hilal, büyük karekod kartı, IBAN hapı
  P13.boxLabelDoc = function (o) {
    const W = 1181, H = 827, c1 = bcol(0, '#14532D'), gold = bcol(1, '#E8C35A'), b = brand(), L0 = [], th = TH();
    const dark = shade(c1, 0.55);
    if (th && th.night) L0.push(Im('Süs · gece', th.night(W, H, dark, shade(c1, 1.2), 7), 0, 0, W, H, { fit: 'fill', locked: true }));
    else L0.push(Rc('Zemin', 0, 0, W, H, dark));
    if (th && th.girih) L0.push(Im('Süs · desen', th.girih(W, Math.round(H * 0.45), 'rgba(255,255,255,0.06)'), 0, H * 0.55, W, H * 0.45, { fit: 'fill', locked: true }));
    if (th && th.garland) L0.push(Im('Süs · ışıklar', th.garland(W, 170), 0, 0, W, 170, { fit: 'fill' }));
    L0.push(Rc('Süs · çerçeve', 26, 26, W - 52, H - 52, 'rgba(0,0,0,0)', { stroke: gold, strokeWidth: 3, radius: 30, opacity: 0.85 }));
    L0.push(Rc('Süs · iç çerçeve', 40, 40, W - 80, H - 80, 'rgba(0,0,0,0)', { stroke: 'rgba(232,195,90,0.35)', strokeWidth: 1.5, radius: 22 }));
    // hilal
    if (th && th.icon) L0.push(Im('Süs · hilal', th.icon('hilalYildiz', gold), 86, 150, 96, 96));
    // kurum
    if (b.logo) L0.push(Im('Logo', b.logo, 196, 160, 72, 72));
    L0.push(T('Kurum', b.name || 'Kurum adı', b.logo ? 282 : 196, 180, 460, 28, { fill: '#FFFFFF', fontWeight: 700, align: 'left', fontFamily: 'Montserrat', letterSpacing: 1 }));
    // başlık
    L0.push(T('Başlık', o.title || 'Sadaka Kutusu', 80, 270, 640, 92, { fill: gold, fontFamily: 'DM Serif Display', fontWeight: 400, align: 'left', lineHeight: 1.0, shadow: { x: 0, y: 4, blur: 14, color: 'rgba(0,0,0,0.35)' } }));
    L0.push(Rc('Süs · ayraç', 84, 390, 140, 4, gold, { radius: 2 }));
    L0.push(T('Alt yazı', o.sub || '“Sadaka, Rabbin gazabını söndürür.” (Tirmizî)', 80, 416, 620, 30, { fill: 'rgba(255,255,255,0.92)', align: 'left', lineHeight: 1.4, fontFamily: 'Playfair Display', fontWeight: 400 }));
    // IBAN hapı
    if (o.iban) {
      L0.push(Rc('IBAN zemini', 80, H - 190, 640, 74, 'rgba(255,255,255,0.10)', { radius: 37, stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1.5 }));
      if (th && th.icon) L0.push(Im('Süs · banka', th.icon('kure', gold), 104, H - 172, 38, 38));
      L0.push(T('IBAN', o.iban, 156, H - 168, 550, 26, { fill: '#FFFFFF', align: 'left', fontWeight: 700, letterSpacing: 1 }));
    } else L0.push(T('Teşekkür', 'Allah kabul etsin, hayrınızı çoğaltsın.', 80, H - 170, 640, 26, { fill: gold, align: 'left', fontWeight: 600 }));
    // karekod kartı
    if (o.link) {
      const qx = W - 420, qy = 190, qs = 330;
      L0.push(Rc('QR gölge', qx - 6, qy - 6, qs + 12, qs + 92, gold, { radius: 30, shadow: { x: 0, y: 14, blur: 34, color: 'rgba(0,0,0,0.45)' } }));
      L0.push(Rc('QR zemini', qx, qy, qs, qs + 80, '#FFFFFF', { radius: 26 }));
      L0.push(Im('Bağış QR', 'data:image/svg+xml;utf8,' + encodeURIComponent(window.Tools.qrSVG(o.link, { quiet: 2, fg: '#111827' })), qx + 25, qy + 25, qs - 50, qs - 50));
      if (th && th.icon) L0.push(Im('Süs · telefon', th.icon('telefon', c1), qx + 40, qy + qs + 10, 40, 40));
      L0.push(T('QR açıklama', 'Okut · bağış yap', qx + 86, qy + qs + 20, qs - 100, 24, { fill: c1, fontWeight: 800, align: 'left', maxLines: 1 }));
    }
    const d = docOf(W, H, L0, { type: 'solid', color: dark }); try { R.fitUnbreakable(d); } catch (e) {} return d;
  };
  P13.boxLabel = async function () {
    const D = don(), link0 = D.url ? (/^https?:/.test(D.url) ? D.url : 'https://' + D.url) : (D.wa ? 'https://wa.me/' + waNum(D.wa) : '');
    const res = await A().dialog(`<div class="d-body"><h3>${icon('qr')} Kumbara / sadaka kutusu etiketi</h3>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr;gap:10px">
        <label class="field"><span>Başlık</span><input class="inp" id="kbT" value="Sadaka Kutusu"></label>
        <label class="field"><span>Alt yazı</span><input class="inp" id="kbS" value="“Sadaka, Rabbin gazabını söndürür.” (Tirmizî)"></label>
        <label class="field"><span>Bağış bağlantısı (karekod buna gider)</span><input class="inp" id="kbL" value="${esc(link0)}" placeholder="https://... ya da WhatsApp bağlantısı"></label>
        <label class="field"><span>IBAN (isteğe bağlı)</span><input class="inp" id="kbI" value="${esc(D.iban || '')}"></label></div>
        <div class="kit-pv"><div class="kit-th" id="kbV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="kbEd">Editörde aç</button><button class="btn primary" id="kbGo">${icon('download')}PDF indir (A4'e 4)</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const o = () => ({ title: $('#kbT', box).value, sub: $('#kbS', box).value, link: $('#kbL', box).value.trim(), iban: $('#kbI', box).value.trim() });
        const pv = () => { $('#kbV', box).innerHTML = R.renderSVG(P13.boxLabelDoc(o()), { fit: true, prefix: 'kb' + Math.random().toString(36).slice(2, 6) }); };
        let tm = 0; $$('input', box).forEach((x) => (x.oninput = () => { clearTimeout(tm); tm = setTimeout(pv, 200); })); pv();
        $('#kbGo', box).onclick = () => close({ go: 'pdf', o: o() }); $('#kbEd', box).onclick = () => close({ go: 'ed', o: o() });
      },
    });
    if (!res) return;
    const d = P13.boxLabelDoc(res.o);
    if (res.go === 'ed') return window.P10.makeDoc(d.width, d.height, 'Kumbara etiketi', d.layers, d.background, { folder: 'Etiketler' }, true);
    const bz = busy('Etiketler hazırlanıyor…');
    try { await sheetPDF([d, d, d, d], 4, 'kumbara-etiketi'); toast('A4’e 4 kumbara etiketi indi'); } catch (e) { toast(e.message, true); } finally { bz.done(); }
  };
})();
