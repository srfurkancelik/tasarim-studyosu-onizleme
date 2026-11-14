/* Tasarım Stüdyosu — uygulama içinden güncelleme (Ayarlar → Güncelleme).
   Yeni sürümün zip'i seçilir; sunucu verilere dokunmadan kodu yeniler, eski kodu
   kenara alır ve kendini yeniden başlatır. Sayfa yeni sürüm gelince yenilenir. */
(function () {
  'use strict';
  const A = () => window.App;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (window.icon ? window.icon(n) : '');
  const MB = (n) => (n / 1048576).toFixed(1) + ' MB';
  const G = {};

  function headers(extra) {
    const h = Object.assign({}, extra);
    const pin = A() && A().S && A().S.pin;
    if (pin) h['X-Pin'] = pin;
    return h;
  }

  // sunucu yeniden başlayıp yeni sürümle yanıt verene kadar bekle, sonra sayfayı yenile
  async function waitRestart(ov, hedef) {
    const msg = ov.querySelector('[data-msg]');
    const t0 = Date.now();
    await new Promise((r) => setTimeout(r, 1500));
    while (Date.now() - t0 < 45000) {
      try {
        const j = await fetch('/api/ping', { cache: 'no-store' }).then((r) => r.json());
        if (j && j.version && (!hedef || j.version === hedef)) {
          msg.textContent = 'Hazır. Sayfa yenileniyor…';
          try { if (navigator.serviceWorker) (await navigator.serviceWorker.getRegistrations()).forEach((r) => r.update()); } catch (e) {}
          setTimeout(() => location.reload(), 600);
          return true;
        }
      } catch (e) { /* sunucu henüz kalkmadı */ }
      msg.textContent = 'Yeniden başlatılıyor… (' + Math.round((Date.now() - t0) / 1000) + ' sn)';
      await new Promise((r) => setTimeout(r, 900));
    }
    msg.innerHTML = 'Sunucu kendiliğinden açılmadı. Uygulamayı kapatıp yeniden aç; tasarımların yerinde.';
    ov.querySelector('[data-x]').style.display = '';
    return false;
  }

  function overlay(text) {
    const ov = document.createElement('div');
    ov.className = 'overlay gn-ov';
    ov.innerHTML = `<div class="dialog gn-d" role="alertdialog" aria-live="polite"><div class="d-body"><h3>${icon('download')} Güncelleme</h3>
      <div class="gn-bar"><i style="width:0%"></i></div><p data-msg class="muted">${esc(text)}</p>
      <div class="d-foot" style="padding:0;margin-top:10px"><button class="btn" data-x style="display:none">Kapat</button></div></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('[data-x]').onclick = () => ov.remove();
    return ov;
  }

  function upload(file, ov) {
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open('POST', '/api/update');
      Object.entries(headers({ 'Content-Type': 'application/zip' })).forEach(([k, v]) => x.setRequestHeader(k, v));
      const bar = ov.querySelector('.gn-bar i'), msg = ov.querySelector('[data-msg]');
      x.upload.onprogress = (e) => { if (e.lengthComputable) { const p = Math.round((e.loaded / e.total) * 100); bar.style.width = p + '%'; msg.textContent = p < 100 ? `Yükleniyor… %${p}` : 'Kuruluyor… (önce verilerin yedeği alınıyor)'; } };
      x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch (e) {} if (x.status >= 400 || j.error) rej(new Error(j.error || 'Sunucu hatası ' + x.status)); else res(j); };
      x.onerror = () => rej(new Error('Bağlantı koptu'));
      x.send(file);
    });
  }

  G.install = async function (file) {
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) return A().toast('Güncelleme dosyası .zip olmalı', true);
    const ok = A().confirmBox ? await A().confirmBox('Yeni sürüm kurulsun mu?', `${file.name} (${MB(file.size)}). Tasarımların, ayarların ve yedeklerin olduğu gibi kalır. Kurulumdan önce verilerin otomatik yedeklenir; beğenmezsen buradan önceki sürüme dönebilirsin.`, 'Kur') : true;
    if (!ok) return;
    const ov = overlay('Yükleniyor…');
    try {
      const r = await upload(file, ov);
      ov.querySelector('.gn-bar i').style.width = '100%';
      ov.querySelector('[data-msg]').textContent = `v${r.from} → v${r.to} kuruldu (${r.files} dosya). Yeniden başlatılıyor…`;
      await waitRestart(ov, r.to);
    } catch (e) {
      ov.querySelector('[data-msg]').innerHTML = `<b style="color:#F87171">Kurulmadı:</b> ${esc(e.message)}<br>Hiçbir şey değişmedi.`;
      ov.querySelector('[data-x]').style.display = '';
    }
  };

  G.rollback = async function (ver) {
    const ok = A().confirmBox ? await A().confirmBox(`v${ver} sürümüne dönülsün mü?`, 'Tasarımların olduğu gibi kalır. İstersen daha sonra yeni sürümü tekrar yükleyebilirsin.', 'Geri dön') : true;
    if (!ok) return;
    const ov = overlay('Önceki sürüm geri yükleniyor…');
    try {
      const r = await fetch('/api/update', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ action: 'rollback' }) }).then((x) => x.json());
      if (r.error) throw new Error(r.error);
      ov.querySelector('[data-msg]').textContent = `v${r.to} geri yüklendi. Yeniden başlatılıyor…`;
      await waitRestart(ov, r.to);
    } catch (e) {
      ov.querySelector('[data-msg]').innerHTML = `<b style="color:#F87171">Olmadı:</b> ${esc(e.message)}`;
      ov.querySelector('[data-x]').style.display = '';
    }
  };

  // Ayarlar sayfasına kart
  G.settingsCard = async function (page) {
    if (window.TS_CLOUD || !page) return;
    let info = null;
    try { info = await fetch('/api/update', { headers: headers() }).then((r) => r.json()); } catch (e) {}
    if (!info || info.error) return;
    const sec = document.createElement('section');
    sec.className = 'card set-users adm gn-card';
    sec.innerHTML = `<h3 style="display:flex;align-items:center"><span class="h3-ic c2">${icon('download')}</span>Güncelleme</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Şu an <b>v${esc(info.version)}</b>. Yeni sürümün zip dosyasını seç; tasarımların, ayarların ve yedeklerin olduğu gibi kalır. Kurulumdan önce otomatik yedek alınır.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn sm primary" id="gnPick">${icon('upload')}Yeni sürümü yükle (.zip)</button>
        ${info.previous ? `<button class="btn sm" id="gnBack">${icon('undo')}Önceki sürüme dön (v${esc(info.previous)})</button>` : ''}
      </div>
      <input type="file" id="gnFile" accept=".zip,application/zip" hidden>
      <div class="gn-drop muted">ya da zip dosyasını buraya sürükle</div>`;
    const after = page.querySelector('#setLook');
    if (after && after.parentNode) after.parentNode.insertBefore(sec, after.nextSibling);
    else (page.querySelector('.settings') || page).appendChild(sec);
    const inp = sec.querySelector('#gnFile');
    sec.querySelector('#gnPick').onclick = () => inp.click();
    inp.onchange = () => { const f = inp.files && inp.files[0]; inp.value = ''; G.install(f); };
    const back = sec.querySelector('#gnBack');
    if (back) back.onclick = () => G.rollback(info.previous);
    const drop = sec.querySelector('.gn-drop');
    ['dragenter', 'dragover'].forEach((ev) => sec.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); drop.classList.add('on'); }));
    ['dragleave', 'drop'].forEach((ev) => sec.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); drop.classList.remove('on'); }));
    sec.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) G.install(f); });
  };

  window.Guncelle = G;
})();
