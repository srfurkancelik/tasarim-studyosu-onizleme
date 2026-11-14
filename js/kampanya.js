/* Tasarım Stüdyosu v7.1 — kampanya sayfası.
   Bağış takibinin herkese açık, karekodla açılan sayfasını GitHub Pages'te yayınlar.
   Sayfaya yalnız toplamlar gider (hedef, toplanan, bağış sayısı); bağışçı adı/telefonu asla gitmez.
   "Defter değiştikçe güncelle" açıksa deftere bağış yazıldıkça sayfa kendiliğinden yenilenir. */
(function () {
  'use strict';
  const A = () => window.App;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (window.icon ? window.icon(n) : '');
  const toast = (m, e) => A().toast(m, e);
  const plain = (t) => (window.Render && window.Render.plain ? window.Render.plain(t) : String(t || '')).trim();
  const K = {};

  async function kopyala(t, m) {
    try { await navigator.clipboard.writeText(t); }
    catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (er) {} a.remove(); }
    toast(m || 'Kopyalandı');
  }
  const durum = () => A().api('kampanya').catch((e) => ({ error: e.message }));

  // bağış takibi tasarımlarından öneri
  async function takipler() {
    const out = [];
    for (const p of await A().api('projects').catch(() => [])) {
      try {
        const d = await A().api('projects/' + p.id);
        const bar = (d.layers || []).find((l) => l.progress);
        if (!bar) continue;
        const bas = (d.layers || []).find((l) => l.type === 'text' && (l.role === 'title' || /başlık/i.test(l.name || '')));
        out.push({ id: d.id, ad: d.name || 'Bağış takibi', baslik: bas ? plain(bas.text).replace(/\s+/g, ' ') : d.name, pr: bar.progress, thumb: d.thumb || '' });
      } catch (e) {}
    }
    return out;
  }
  function defterden() {
    const BH = window.BagisHedef;
    if (!BH) return null;
    const o = BH.ayar();
    if (!o.on) return null;
    return BH.toplam(o);
  }

  function sonucHTML(url) {
    const qr = window.Tools && window.Tools.qrSVG ? window.Tools.qrSVG(url) : '';
    return `<div class="kp-sonuc"><div class="kp-qr">${qr}</div><div class="kp-s-t"><b>Kampanya sayfası yayında</b>
      <a href="${esc(url)}" target="_blank" rel="noopener" class="kp-url">${esc(url)}</a>
      <div class="kp-s-d"><button class="btn sm" data-kp="kopya">${icon('copy')}Bağlantıyı kopyala</button>
      <a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(url)}">${icon('send')}WhatsApp</a></div>
      <small class="muted">Karekodu afişine, makbuzuna ya da paylaşımına koyabilirsin. Sayfanın açılması ilk yayında 1-2 dakika sürebilir.</small></div></div>`;
  }

  K.ac = async function () {
    const st = await durum();
    if (st.error) return toast(st.error, true);
    const tk = await takipler();
    const def = defterden();
    let brand = null;
    try { brand = A().S.brand || await A().api('brand'); } catch (e) {}
    const ilk = tk[0], son = (st.liste || [])[0] || {};
    const v = {
      baslik: son.baslik || (ilk && ilk.baslik) || '',
      hedef: son.hedef || (ilk && ilk.pr.goal) || '',
      birim: son.birim || (ilk && ilk.pr.unit) || '',
      bitis: son.bitis || (ilk && ilk.pr.end) || '',
      aciklama: son.aciklama || '',
      iletisim: son.iletisim || (brand && brand.phone) || '',
      iban: son.iban || '',
      kurum: son.kurum || (brand && brand.name) || '',
    };
    const toplanan = def ? def.toplam : (ilk ? +ilk.pr.got || 0 : 0);
    return A().dialog(`<div class="d-body kp"><h3>${icon('globe')} Kampanya sayfası</h3>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Bağışçıların karekodla açıp hedefin ne kadarının toplandığını gördüğü sayfa. Sayfaya <b>yalnız toplamlar</b> gider; bağışçı adları ve telefonları gitmez.</p>
      <details class="kp-ayar" ${st.ayar.has_token ? '' : 'open'}><summary>${st.ayar.has_token ? '✓ GitHub bağlantısı hazır' : '1) GitHub bağlantısı (bir kez)'}</summary>
        <p class="muted" style="font-size:12.5px">Sayfa GitHub Pages'te yayınlanır. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Yeni anahtar oluştur</a>: depo olarak <b>${esc(st.ayar.repo.split('/')[1] || st.ayar.repo)}</b>'yi seç, <b>Contents → Read and write</b> izni ekle, anahtarı buraya yapıştır.</p>
        <div class="form-grid"><label class="field"><span>Depo</span><input class="inp" id="kpRepo" value="${esc(st.ayar.repo)}"></label>
        <label class="field"><span>Sayfa adresi</span><input class="inp" id="kpUrl" value="${esc(st.ayar.url)}"></label></div>
        <label class="field"><span>GitHub anahtarı</span><input class="inp" id="kpTok" type="password" autocomplete="off" placeholder="${st.ayar.has_token ? 'Kayıtlı (değiştirmek için yenisini yapıştır)' : 'github_pat_…'}"></label>
      </details>
      ${tk.length > 1 ? `<label class="field"><span>Bağış takibi tasarımı</span><select class="inp" id="kpTk">${tk.map((t, i) => `<option value="${i}">${esc(t.ad)} — ${esc(t.pr.goal)} ${esc(t.pr.unit || '')}</option>`).join('')}</select></label>` : ''}
      <label class="field"><span>Başlık</span><input class="inp" id="kpBas" value="${esc(v.baslik)}" placeholder="örn. Gazze'ye 1.000 koli"></label>
      <div class="form-grid kp-3"><label class="field"><span>Hedef</span><input class="inp" id="kpHed" inputmode="decimal" value="${esc(v.hedef)}"></label>
        <label class="field"><span>Birim</span><input class="inp" id="kpBir" value="${esc(v.birim)}" placeholder="koli, ₺, hisse"></label>
        <label class="field"><span>Bitiş</span><input class="inp" id="kpBit" type="date" value="${esc(v.bitis)}"></label></div>
      <div class="kp-top">${def ? `Toplanan <b>${Number(toplanan).toLocaleString('tr-TR')}</b> — bağışçı defterinden (${def.adet} bağış)` : `Toplanan: <input class="inp" id="kpTop" inputmode="decimal" value="${esc(toplanan)}" style="width:120px;display:inline-block;margin-left:6px"> <small class="muted">Defteri hedefe bağlarsan kendiliğinden gelir.</small>`}</div>
      <label class="field"><span>Açıklama</span><textarea class="inp" id="kpAc" rows="3" placeholder="Kampanyanın amacı, bağışların nereye gideceği…">${esc(v.aciklama)}</textarea></label>
      <div class="form-grid"><label class="field"><span>IBAN (isteğe bağlı)</span><input class="inp" id="kpIban" value="${esc(v.iban)}" placeholder="TR00 0000 …"></label>
        <label class="field"><span>İletişim</span><input class="inp" id="kpIl" value="${esc(v.iletisim)}"></label></div>
      <label class="field"><span>Kurum adı</span><input class="inp" id="kpKur" value="${esc(v.kurum)}"></label>
      ${tk.length ? `<label class="switch"><input type="checkbox" id="kpGor" checked>Tasarımın görselini sayfaya koy</label>` : ''}
      <label class="switch" style="margin-top:6px"><input type="checkbox" id="kpOto" ${def && (son.oto !== false) ? 'checked' : ''} ${def ? '' : 'disabled'}>Defter değiştikçe sayfayı kendiliğinden güncelle${def ? '' : ' <small class="muted">(defter hedefe bağlı değil)</small>'}</label>
      <div id="kpSonuc">${son.url ? sonucHTML(son.url) : ''}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="kpYay">${icon('upload')}${son.url ? 'Güncelle' : 'Yayınla'}</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const bagla = () => { $$('[data-kp="kopya"]', box).forEach((b) => (b.onclick = () => kopyala($('.kp-url', box).href, 'Bağlantı kopyalandı'))); };
        bagla();
        const sec = $('#kpTk', box);
        if (sec) sec.onchange = () => { const t = tk[+sec.value]; $('#kpBas', box).value = t.baslik || ''; $('#kpHed', box).value = t.pr.goal || ''; $('#kpBir', box).value = t.pr.unit || ''; $('#kpBit', box).value = t.pr.end || ''; };
        $('#kpYay', box).onclick = async () => {
          const b = $('#kpYay', box);
          b.disabled = true;
          try {
            const tok = $('#kpTok', box).value.trim();
            if (tok || $('#kpRepo', box).value !== st.ayar.repo || $('#kpUrl', box).value !== st.ayar.url)
              await A().api('kampanya', { body: { action: 'ayar', repo: $('#kpRepo', box).value, url: $('#kpUrl', box).value, token: tok } });
            const t = tk[sec ? +sec.value : 0];
            const k = {
              baslik: $('#kpBas', box).value.trim(), hedef: $('#kpHed', box).value, birim: $('#kpBir', box).value.trim(), bitis: $('#kpBit', box).value,
              aciklama: $('#kpAc', box).value.trim(), iban: $('#kpIban', box).value.trim(), iletisim: $('#kpIl', box).value.trim(), kurum: $('#kpKur', box).value.trim(),
              toplanan: def ? defterden().toplam : $('#kpTop', box).value, adet: def ? defterden().adet : undefined,
              renk: brand && brand.colors && brand.colors[0], logo: brand && brand.logo && brand.logo.length < 300000 ? brand.logo : undefined,
              gorsel: $('#kpGor', box) && $('#kpGor', box).checked && t && t.thumb ? t.thumb : undefined,
              slug: son.slug && son.baslik === $('#kpBas', box).value.trim() ? son.slug : undefined,
              oto: $('#kpOto', box).checked,
            };
            if (!k.baslik) throw new Error('Başlık yaz');
            b.innerHTML = 'Yayınlanıyor…';
            const r = await A().api('kampanya', { body: { action: 'yayinla', kampanya: k } });
            K.sonYayin[r.kampanya.slug] = { t: Date.now(), toplanan: r.kampanya.toplanan };
            try { localStorage.setItem('ts_kampanya_oto', JSON.stringify(k.oto ? Object.assign({}, k, { slug: r.kampanya.slug }) : null)); } catch (e) {}
            $('#kpSonuc', box).innerHTML = sonucHTML(r.url); bagla();
            $('#kpSonuc', box).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            b.innerHTML = icon('upload') + 'Güncelle';
            toast('Kampanya sayfası yayında');
          } catch (e) { toast(e.message || String(e), true); b.innerHTML = icon('upload') + 'Yayınla'; }
          b.disabled = false;
        };
      },
    });
  };

  // ---- defter değişince sayfayı güncelle (en sık 2 dakikada bir; rakam değişmediyse hiç)
  K.sonYayin = {};
  let bekleyen = null;
  K.otoGuncelle = function () {
    let k = null;
    try { k = JSON.parse(localStorage.getItem('ts_kampanya_oto') || 'null'); } catch (e) {}
    if (!k || !k.slug) return;
    const def = defterden();
    if (!def) return;
    const son = K.sonYayin[k.slug] || {};
    if (+son.toplanan === +def.toplam) return;
    const bekle = Math.max(0, 120000 - (Date.now() - (son.t || 0)));
    clearTimeout(bekleyen);
    bekleyen = setTimeout(async () => {
      const d2 = defterden(); if (!d2) return;
      try {
        const r = await A().api('kampanya', { body: { action: 'yayinla', kampanya: Object.assign({}, k, { toplanan: d2.toplam, adet: d2.adet }) } });
        K.sonYayin[k.slug] = { t: Date.now(), toplanan: r.kampanya.toplanan };
      } catch (e) { /* internet yoksa bir sonraki değişiklikte yeniden denenir */ }
    }, bekle);
  };

  function kur() {
    const P12 = window.P12;
    if (!P12 || P12._kp) return;
    P12._kp = true;
    P12.campaignPage = K.ac;
    const BH = window.BagisHedef;
    if (BH && BH.esitle && !BH.esitle._kp) {
      const asil = BH.esitle;
      BH.esitle = function () { return Promise.resolve(asil.apply(this, arguments)).then((r) => { K.otoGuncelle(); return r; }); };
      BH.esitle._kp = true;
    }
    window.addEventListener('ts-ortak', (e) => { const k = (e.detail && e.detail.keys) || []; if (k.includes('ts_donors')) K.otoGuncelle(); });
  }
  window.KampanyaSayfasi = K;
  if (window.TS_CLOUD) { window.KampanyaSayfasi = K; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
