/* Tasarım Stüdyosu — ilk kullanım rehberi.
   Spot ışığıyla ekranın ilgili kısmını gösterir, ne işe yaradığını adım adım anlatır.
   Her bölümün turu ilk ziyarette bir kez açılır; “Nasıl kullanılır?” menüsünden istenildiği zaman tekrar izlenir. */
(function () {
  'use strict';
  const M = window.Motion;
  const mobile = () => window.matchMedia('(max-width: 820px)').matches;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('ts_tour') || '{}')[k]; } catch (e) { return null; } },
    set(k, v) { try { const o = JSON.parse(localStorage.getItem('ts_tour') || '{}'); o[k] = v; localStorage.setItem('ts_tour', JSON.stringify(o)); } catch (e) {} },
  };
  const visible = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(el).visibility !== 'hidden'; };
  const sized = (el) => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; };
  const pick = (sel) => {
    for (const s of [].concat(sel || [])) { const el = [...document.querySelectorAll(s)].find(visible); if (el) return el; }
    // ekran dışındaysa kaydırıp göster
    for (const s of [].concat(sel || [])) { const el = [...document.querySelectorAll(s)].find(sized); if (el) { el.scrollIntoView({ block: 'center' }); return visible(el) ? el : null; } }
    return null;
  };

  // ---------------------------------------------------------------- turlar
  const TOURS = {
    pano: {
      title: 'Pano',
      steps: [
        { t: 'Tasarım Stüdyosu\'na hoş geldin 👋', d: 'Birkaç adımda nerede ne olduğunu göstereyim. İstediğin an “Atla” diyebilirsin; turu daha sonra sol alttaki <b>?</b> düğmesinden yeniden izleyebilirsin.' },
        { el: '#qPrompt', t: '1 · Ne istediğini yaz', d: 'Örneğin: <i>“Kahve dükkanım için sıcak renklerde Instagram gönderisi, başlık: Sabah Kahvesi”</i>. Ölçüyü, renkleri, yazıları cümle içinde söyleyebilirsin.' },
        { el: '#qAttach', t: '2 · İstersen görsel ekle', d: 'Logonu, ürün fotoğrafını ya da beğendiğin bir tasarımı ekle. Renkleri ondan alınır. “Bu etiketi daha profesyonel yap” dersen tasarımın düzeni korunup yeniden çizilir.' },
        { el: '#qGo', t: '3 · Hazırla', d: 'Stüdyo seçenekleri hazırlar. Beğendiğini seçip sohbetle değiştirir, sonra editörde son rötuşları yaparsın.' },
        { el: ['#libRow', '#allTpl'], t: 'Hazır şablonlar', d: 'İndirim, ürün tanıtımı, menü, etiket, davetiye, kartvizit… Bir şablona dokun, editörde açılsın. Renk varyasyonlarını “Tümünü gör”de seçebilirsin.' },
        { el: '.formats', t: 'Boş tuvalle başla', d: 'Ölçüyü seç; doğrudan editör açılır. <b>Görsel düzenle</b> ile elindeki bir fotoğrafı ya da afişi açıp üzerinde değişiklik yapabilirsin.' },
        { el: '.ai-card', t: 'Yapay zeka (isteğe bağlı)', d: 'Bağlamadan da çalışır. Claude anahtarını bağlarsan serbest istekleri anlar, yüklediğin görselleri inceler, fotoğrafları katmanlara ayırır. Görsel üretimini bağlarsan yeni fotoğraf da üretir.' },
        { el: '.phone-card', t: 'Telefondan aç', d: 'Aynı Wi‑Fi\'deyken bu kodu telefon kamerasıyla okut. Tüm stüdyo telefonda da çalışır.' },
        { el: ['.rail', 'nav.rail'], t: 'Bölümler', d: '<b>Stüdyo</b>: sohbetle tasarım · <b>Editör</b>: katmanlı düzenleme · <b>Önizleme</b>: telefon/ekran/baskı görünümü · <b>Marka</b>: logo, renk ve fontların · <b>Ayarlar</b>: bağlantılar.' },
        { t: 'Hazırsın ✨', d: 'İpucu: Bir şablon açıp editörü deneyebilirsin; editörün de kendi kısa turu var.', cta: [{ l: 'Bir şablonla editörü dene', a: () => { const T = window.Library && window.Library.templates.find((x) => x.id === 'ig-urun'); if (T) window.Features.useLibraryTemplate(T, 0); } }] },
      ],
    },
    studyo: {
      title: 'Stüdyo',
      steps: [
        { el: ['.ref-col', '.m-tabs [data-m=ref]'], t: 'Örnek içerik', d: 'Buraya logo, ürün fotoğrafı ya da beğendiğin bir tasarımı bırak. Yüklediğin görseli <b>benzer şekilde güzelleştirebilir</b>, <b>katmanlara ayırıp düzenleyebilir</b> ya da doğrudan editörde açabilirsin.' },
        { el: ['#cIn', '.m-tabs [data-m=chat]'], t: 'Sohbet ederek tasarla', d: 'İsteğini yaz ve Enter\'a bas. Sonra “başlığı büyüt”, “arka planı lacivert yap”, “daha minimal olsun” gibi komutlarla değiştir. Mikrofonla da yazabilirsin.' },
        { el: ['#stage', '.m-tabs [data-m=stage]'], t: 'Tasarım burada', d: 'Seçenekler burada çıkar. Alttaki sürümlerden önceki hallere dönebilirsin.' },
        { el: '#sEdit', t: 'Düzenle', d: 'Yazıları, renkleri ve yerleşimi elle ayarlamak için editöre geç.' },
      ],
    },
    editor: {
      title: 'Editör',
      steps: [
        { t: 'Editör: Photoshop + Illustrator', d: 'Her yazı, şekil ve fotoğraf ayrı bir katmandır. 1 dakikada temel kullanımı göstereyim.' },
        { el: '#tools', t: 'Araçlar', d: '<b>Seç (V)</b>, <b>El (H)</b>, <b>Yazı (T)</b>, şekiller, kalem, fırça ve görsel. <b>X</b> fotoğraftaki bir yazıyı değiştirir, <b>✂ K</b> seçtiğin bölgeyi ayrı parça yapar.', m: 'Araçlar alt menüde. Seçmek için dokun, kaydırmak için iki parmakla sürükle.' },
        { el: '#vp', t: 'Tuval', d: '<b>Tıkla</b>: seç · <b>Sürükle</b>: taşı · köşelerden <b>boyutlandır</b>, üstteki noktadan <b>döndür</b> · yazıya <b>iki kez tıkla</b>: yerinde düzenle. Fare tekerleği + Ctrl ile yakınlaş, boşluk tuşu + sürükle ile kaydır.', m: 'Dokun: seç · sürükle: taşı · iki parmak: yakınlaş · seçili yazıya tekrar dokun: düzenle · <b>basılı tut</b>: hızlı menü.' },
        { el: '#vp', t: 'Sağ tık menüsü', d: 'Bir nesneye <b>sağ tıkla</b>: kopyala, çoğalt, stili kopyala/yapıştır, öne/arkaya al, grupla, eşit dağıt, kilitle. Telefonda nesneye <b>basılı tut</b>.' },
        { el: ['#rulH', '#vp'], t: 'Cetvel ve kılavuz', d: 'Cetvelden tuvale sürükleyerek kılavuz çizgisi ekle; nesneler ona yapışır. Etiket ölçüsünü mm girersen cetvel mm gösterir. <b>Shift+R</b> aç/kapat.', skipM: true },
        { el: ['#panel .tabs', '#panelBtn'], t: 'Özellikler · Katmanlar · Öğeler', d: '<b>Özellikler</b>: renk, yazı tipi, boyut, gölge, maske, filtre. <b>Katmanlar</b>: sırala, gizle, kilitle. <b>Öğeler</b>: ikon, rozet, çerçeve, <b>barkod</b> ve fotoğrafların.', m: 'Bu düğme özellikler panelini açar: renk, yazı tipi, katmanlar ve öğeler burada.' },
        { el: '[data-a=undo]', t: 'Geri al', d: 'Her şey geri alınabilir: <b>Ctrl+Z</b> / yinele <b>Ctrl+Y</b>. Mac\'te ⌘ kullan.' },
        { el: '[data-a=more]', t: '⋮ Diğer işlemler', d: '<b>Etiket kontrol listesi</b>, <b>matbaa PDF\'i</b> (kesim hattı, CMYK), <b>ambalaj üzerinde gör</b>, <b>sosyal medya paketi</b>, <b>ürün serisi</b>, formatlara uyarla ve daha fazlası.' },
        { el: ['[data-a=export]', '[data-a=more]'], t: 'İndir', d: 'PNG, JPG, PDF ya da SVG; istediğin kalite ve boyutta. Telefonda kaydet/paylaş penceresi açılır.' },
        { el: '.ed-save', t: 'Kaydet', d: 'Değişiklikler kendiliğinden de kaydedilir; <b>Ctrl+S</b> ile hemen kaydedebilirsin. Tüm kısayollar için <b>?</b> tuşuna bas.' },
        { t: 'Bir fotoğrafı mı düzenleyeceksin?', d: 'Fotoğrafı seç → <b>Katmanlara ayır</b>. İçindeki yazılar düzenlenebilir yazıya, şekiller vektöre, nesneler ayrı katmana dönüşür; arkası temizlenir. (Yapay zeka bağlıyken)' },
      ],
    },
    onizleme: {
      title: 'Önizleme',
      steps: [
        { t: 'Önizleme', d: 'Tasarımını telefonda, ekranda ve baskıda nasıl görüneceğiyle incele. Buradan başka ölçülere uyarlayabilir, paylaşabilir ve indirebilirsin.' },
      ],
    },
    marka: {
      title: 'Marka',
      steps: [
        { t: 'Marka kiti', d: 'Logonu, marka renklerini, fontlarını ve iletişim bilgilerini bir kez gir. Açık olduğunda her yeni tasarıma kendiliğinden uygulanır.' },
      ],
    },
  };

  // ---------------------------------------------------------------- çizim
  let cur = null;
  function stop(done) {
    if (!cur) return;
    const { root, key } = cur;
    window.removeEventListener('resize', cur.place); window.removeEventListener('keydown', cur.keys, true);
    if (done !== false) store.set(key, true);
    M.animate(root, { opacity: [1, 0] }, { stiffness: 500, damping: 40, keep: true }).then(() => root.remove());
    cur = null;
  }
  function start(key, from = 0) {
    const tour = TOURS[key]; if (!tour) return;
    stop(false);
    const steps = tour.steps.filter((s) => !(s.skipM && mobile()));
    const root = document.createElement('div');
    root.className = 'tour';
    root.innerHTML = `<svg class="tour-mask" width="100%" height="100%"><defs><mask id="tourHole"><rect width="100%" height="100%" fill="#fff"/><rect id="tourCut" rx="14" fill="#000"/></mask></defs><rect width="100%" height="100%" fill="rgba(6,8,12,.66)" mask="url(#tourHole)"/></svg><div class="tour-ring"></div><div class="tour-card" role="dialog" aria-live="polite"></div>`;
    document.body.appendChild(root);
    const card = root.querySelector('.tour-card'), ring = root.querySelector('.tour-ring'), cut = root.querySelector('#tourCut');
    let i = Math.max(0, Math.min(from, steps.length - 1));
    const place = () => {
      const s = steps[i]; const el = s.el ? pick(s.el) : null;
      const pad = 8;
      if (el) {
        const r = el.getBoundingClientRect();
        const x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad), w = Math.min(innerWidth - x - 4, r.width + pad * 2), h = Math.min(innerHeight - y - 4, r.height + pad * 2);
        cut.setAttribute('x', x); cut.setAttribute('y', y); cut.setAttribute('width', w); cut.setAttribute('height', h);
        Object.assign(ring.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
        // kart konumu: hedefin altı, üstü ya da yanı — ekrana sığan ilk yer
        const cw = card.offsetWidth, ch = card.offsetHeight, m = 14;
        let cx, cy;
        if (mobile()) { cx = 10; cy = (y + h / 2 > innerHeight / 2) ? Math.max(10, y - ch - m) : Math.min(innerHeight - ch - 10, y + h + m); if (cy < 10 || cy + ch > innerHeight - 10) cy = innerHeight - ch - 10; }
        else if (y + h + m + ch < innerHeight) { cy = y + h + m; cx = x; }
        else if (y - m - ch > 0) { cy = y - m - ch; cx = x; }
        else if (x + w + m + cw < innerWidth) { cx = x + w + m; cy = y; }
        else { cx = x - m - cw; cy = y; }
        if (!mobile()) { cx = Math.max(10, Math.min(innerWidth - cw - 10, cx)); cy = Math.max(10, Math.min(innerHeight - ch - 10, cy)); }
        Object.assign(card.style, { left: cx + 'px', top: cy + 'px', transform: 'none' });
      } else {
        cut.setAttribute('width', 0); cut.setAttribute('height', 0);
        ring.style.display = 'none';
        Object.assign(card.style, { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' });
      }
    };
    const draw = () => {
      const s = steps[i];
      const txt = mobile() && s.m ? s.m : s.d;
      card.innerHTML = `<div class="tour-step">${i + 1} / ${steps.length}<span>${tour.title}</span></div><h4>${s.t}</h4><p>${txt}</p>
        ${s.cta ? `<div class="tour-cta">${s.cta.map((c, k) => `<button class="btn sm" data-cta="${k}">${c.l}</button>`).join('')}</div>` : ''}
        <div class="tour-dots">${steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="tour-foot"><button class="btn ghost sm" data-x="skip">${i === steps.length - 1 ? 'Kapat' : 'Atla'}</button><span></span>${i ? '<button class="btn sm" data-x="prev">Geri</button>' : ''}<button class="btn primary sm" data-x="next">${i === steps.length - 1 ? 'Bitir' : 'İleri →'}</button></div>`;
      place();
      M.animate(card, { opacity: [0, 1], y: [8, 0] }, { stiffness: 420, damping: 32 });
      card.querySelectorAll('[data-cta]').forEach((b) => (b.onclick = () => { const c = s.cta[+b.dataset.cta]; stop(); setTimeout(c.a, 200); }));
    };
    const go = (d) => { i += d; if (i >= steps.length) return stop(); if (i < 0) i = 0; draw(); };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-x]');
      if (b) { if (b.dataset.x === 'next') go(1); else if (b.dataset.x === 'prev') go(-1); else stop(); return; }
      if (!e.target.closest('.tour-card')) go(1); // karartılmış alana dokun: ilerle
    });
    const keys = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stop(); } else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); } };
    window.addEventListener('keydown', keys, true);
    window.addEventListener('resize', place);
    cur = { root, key, place, keys };
    M.animate(root, { opacity: [0, 1] }, { stiffness: 400, damping: 40 });
    draw();
  }

  // ilk ziyarette bir kez
  function auto(route) {
    if (navigator.webdriver || store.get('off') || store.get(route) || !TOURS[route]) return; // otomasyon testlerinde açılmasın
    if (document.querySelector('.overlay')) return; // başka bir pencere açıksa bekleme
    setTimeout(() => { if ((location.hash.split('/')[1] || 'pano') === route && !document.querySelector('.overlay')) start(route); }, route === 'editor' ? 900 : 700);
  }

  // “Nasıl kullanılır?” menüsü
  function menu() {
    const A = window.App;
    const items = [['pano', 'Pano: nereden başlanır', 'İstek yazma, görsel ekleme, şablonlar'], ['studyo', 'Stüdyo: sohbetle tasarım', 'Örnek görsel, komutlar, sürümler'], ['editor', 'Editör: adım adım', 'Araçlar, katmanlar, kısayollar, dışa aktarma']];
    A.dialog(`<div class="d-body"><h3>Nasıl kullanılır?</h3><p class="muted">Bir bölüm seç; o ekranda adım adım gösteririm.</p>
      <div class="help-list">${items.map(([k, t, d]) => `<button class="help-it" data-k="${k}"><b>${t}</b><small>${d}</small><span>→</span></button>`).join('')}</div>
      <label class="switch" style="margin-top:12px"><input type="checkbox" id="tourOff" ${store.get('off') ? 'checked' : ''}>Yeni ekranlarda rehberi kendiliğinden gösterme</label></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      onOpen: (box, close) => {
        box.querySelector('#tourOff').onchange = (e) => store.set('off', e.target.checked);
        box.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
          const k = b.dataset.k; close(null);
          const go = () => setTimeout(() => start(k), 700);
          if (k === 'editor' && !(A.S.project && A.S.project.layers && A.S.project.layers.length)) {
            const T = window.Library && window.Library.templates.find((x) => x.id === 'ig-urun');
            store.set('editor', true); // şablon açılınca kendiliğinden tekrar başlamasın
            if (T) window.Features.useLibraryTemplate(T, 0).then(go); return;
          }
          if ((location.hash.split('/')[1] || 'pano') !== k) { A.go(k); go(); } else start(k);
        }));
      },
    });
  }

  window.Tour = { start, auto, menu, stop, reset: () => { try { localStorage.removeItem('ts_tour'); } catch (e) {} } };
})();
