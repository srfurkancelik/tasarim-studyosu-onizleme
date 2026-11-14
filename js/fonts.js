/* Tasarım Stüdyosu — yazı tipi kütüphanesi ve seçici
   - Gömülü aileler (internetsiz): static/fontlib/bundled.json
   - Kütüphane (107 aile): Windows sürümünde bilgisayara indirilir; bulut sürümünde Google Fonts'tan doğrudan yüklenir
   - Seçici: her font kendi görünümüyle, kategori, arama, son kullanılanlar, kalınlık sayısı */
(function () {
  'use strict';
  const R = () => window.Render, A = () => window.App, UI = () => window.App;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAT = () => window.FontCatalog || { LIST: [], PAIRS: [], CATS: {} };
  const meta = (fam) => CAT().LIST.find((x) => x.family === fam);
  const SYS = ['Arial', 'Segoe UI', 'Arial Black', 'Impact', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Courier New', 'Calibri', 'Cambria'];
  const W_NAMES = { 100: 'İnce (Thin)', 200: 'Çok hafif', 300: 'Hafif (Light)', 400: 'Normal', 500: 'Orta (Medium)', 600: 'Yarı kalın', 700: 'Kalın (Bold)', 800: 'Ekstra kalın', 900: 'Siyah (Black)' };
  let ready = false, status = null, loading = {};
  const F = {};

  // ---------- başlangıç: gömülü + indirilmiş aileleri kaydet
  F.init = async function () {
    try {
      const b = await (await fetch('fontlib/bundled.json')).json();
      b.forEach((x) => R().registerFamily(x.family, x.faces, { cat: x.cat, src: 'bundled', desc: x.desc }));
    } catch (e) { console.warn('gömülü fontlar yüklenemedi', e); }
    if (!window.TS_CLOUD) {
      try {
        const r = await A().api('fontlib'); status = r.status;
        Object.entries(r.downloaded || {}).forEach(([fam, faces]) => { const m = meta(fam) || {}; R().registerFamily(fam, faces, { cat: m.cat, src: 'lib', desc: m.desc }); });
        if (status && status.running) poll();
      } catch (e) {}
    }
    // en sık kullanılan gömülü yüzleri önceden yükle (şablon önizlemeleri doğru ölçülsün)
    [['Inter', 400], ['Inter', 700], ['Inter', 800], ['Inter', 900], ['Lora', 400], ['Lora', 700]].forEach(([f, w]) => R().ensureFont(f, w));
    ready = true;
    document.dispatchEvent(new CustomEvent('ts-fonts-ready'));
  };
  F.status = () => status;
  // yeni bir yazı tipi yüzü yüklendiğinde (ilk kullanımda) açık tasarımı yeniden ölç: satır kırılımları doğru olsun
  let rlT = 0;
  const relayout = () => { clearTimeout(rlT); rlT = setTimeout(() => { const ed = A() && A().S && A().S.editorApi; if (ed && ed.relayout) ed.relayout(); }, 120); };
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', relayout);
  document.addEventListener('ts-fonts-ready', relayout);
  F.prepareDoc = async function (d) { // açılan tasarımdaki kütüphane fontlarını hazırla
    const fams = [...new Set((d.layers || []).filter((l) => l.type === 'text').map((l) => l.fontFamily))].filter((f) => meta(f) && !(R().FONT_DB[f] && R().FONT_DB[f].faces.length));
    await Promise.all(fams.map((f) => F.ensureFamily(f).catch(() => {})));
    const n = await R().ensureDocFonts(d); if (n || fams.length) relayout();
  };

  // ---------- bir aileyi hazır et (indir / Google'dan yükle)
  async function fromGoogle(fam) { // bulut sürümü ya da sunucu indiremezse: tarayıcıdan Google Fonts CSS'ini oku
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`)).text().catch(() => '');
    let faces = parseCSS(css);
    if (!faces.length) { // ailede olmayan stiller varsa Google hata verir: tek tek dene
      for (const it of [0, 1]) for (let w = 100; w <= 900; w += 100) {
        try { const r = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:ital,wght@${it},${w}&display=swap`); if (r.ok) faces = faces.concat(parseCSS(await r.text())); } catch (e) {}
      }
    }
    return faces;
  }
  function parseCSS(css) {
    const out = [], re = /\/\*\s*([a-z0-9\-\[\]]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g; let m;
    while ((m = re.exec(css))) {
      if (!['latin', 'latin-ext'].includes(m[1])) continue;
      const g = (k) => ((m[2].match(new RegExp(k + '\\s*:\\s*([^;]+);')) || [])[1] || '').trim(), u = m[2].match(/url\(([^)]+)\)/);
      if (u) out.push({ url: u[1].replace(/['"]/g, ''), weight: g('font-weight') || '400', style: g('font-style') || 'normal', range: g('unicode-range') });
    }
    return out;
  }
  let offlineUntil = 0;
  F.ensureFamily = async function (fam) {
    const db = R().FONT_DB[fam]; if (db && db.faces.length) return db;
    if (!meta(fam)) return null;
    if (Date.now() < offlineUntil) throw new Error('İnternet yok: kütüphane fontu şu an indirilemiyor');
    if (loading[fam]) return loading[fam];
    loading[fam] = (async () => {
      let faces = [];
      if (!window.TS_CLOUD) { try { faces = (await A().api('fontlib', { body: { family: fam } })).faces || []; } catch (e) {} }
      if (!faces.length) { try { faces = await fromGoogle(fam); } catch (e) {} }
      if (!faces.length) { offlineUntil = Date.now() + 60000; throw new Error(`“${fam}” indirilemedi — internet bağlantısını kontrol et`); }
      const m = meta(fam); return R().registerFamily(fam, faces, { cat: m.cat, src: 'lib', desc: m.desc });
    })();
    try { return await loading[fam]; } finally { delete loading[fam]; }
  };

  // ---------- hepsini indir (Windows) — ilerleme
  let pollT = 0;
  function poll() {
    clearTimeout(pollT);
    pollT = setTimeout(async () => {
      try {
        const r = await A().api('fontlib'); status = r.status;
        Object.entries(r.downloaded || {}).forEach(([fam, faces]) => { if (!R().FONT_DB[fam] || !R().FONT_DB[fam].faces.length) { const m = meta(fam) || {}; R().registerFamily(fam, faces, { cat: m.cat, src: 'lib', desc: m.desc }); } });
        document.dispatchEvent(new CustomEvent('ts-fonts-progress', { detail: { status, count: Object.keys(r.downloaded || {}).length, total: r.total } }));
        if (status.running) poll();
      } catch (e) {}
    }, 1500);
  }
  F.downloadAll = async function () {
    if (window.TS_CLOUD) { // bulutta: sırayla tarayıcıdan yükle
      const L = CAT().LIST; let i = 0;
      for (const x of L) { i++; try { await F.ensureFamily(x.family); } catch (e) {} document.dispatchEvent(new CustomEvent('ts-fonts-progress', { detail: { status: { running: i < L.length, current: x.family }, count: i, total: L.length } })); }
      return;
    }
    await A().api('fontlib', { body: { all: true } }); status = { running: true }; poll();
  };

  // ---------- örnek metin
  const sample = (fam, cat) => (cat === 'script' ? 'Ağustos şölen' : cat === 'display' ? 'BÜYÜK İNDİRİM' : cat === 'mono' ? 'Ürün_01 · ₺249' : 'Ğüzel Şık Ürün');
  const familyRows = () => {
    const out = [], seen = new Set(), DB = R().FONT_DB;
    Object.values(DB).forEach((e) => { if (e.src === 'bundled') { out.push({ family: e.family, cat: e.cat, desc: e.desc, src: 'bundled' }); seen.add(e.family); } });
    CAT().LIST.forEach((x) => { if (!seen.has(x.family)) { out.push({ ...x, src: DB[x.family] && DB[x.family].faces.length ? 'lib' : 'remote' }); seen.add(x.family); } });
    (R().customFonts || []).forEach((f) => { if (!seen.has(f.family)) { out.push({ family: f.family, cat: 'custom', desc: 'Yüklediğin font', src: 'custom' }); seen.add(f.family); } });
    SYS.forEach((f) => { if (!seen.has(f)) out.push({ family: f, cat: 'system', desc: 'Bilgisayarda yüklü (her cihazda olmayabilir)', src: 'system' }); });
    return out;
  };
  const recent = () => { try { return JSON.parse(localStorage.getItem('ts_fontRecent') || '[]'); } catch (e) { return []; } };
  const pushRecent = (f) => { try { localStorage.setItem('ts_fontRecent', JSON.stringify([f, ...recent().filter((x) => x !== f)].slice(0, 8))); } catch (e) {} };

  // ---------- seçici
  F.pick = function (current, opts = {}) {
    return new Promise((resolve) => {
      let cat = opts.cat || 'all', q = '', done = false;
      const CATS = [['all', 'Tümü'], ['recent', 'Son kullanılan'], ['sans', 'Sans'], ['serif', 'Serif'], ['display', 'Başlık'], ['script', 'El yazısı'], ['mono', 'Mono'], ['pairs', 'Eşleşmeler'], ['custom', 'Yüklediklerim'], ['system', 'Sistem']];
      UI().dialog(`<div class="d-body fp"><h3>Yazı tipi seç</h3>
        <div class="fp-top"><input class="inp" id="fpQ" placeholder="Ara: Montserrat, el yazısı, kalın…" autocomplete="off"><input class="inp" id="fpS" placeholder="Önizleme metni" value="${esc(opts.sample || '')}"></div>
        <div class="chips" id="fpC">${CATS.map(([k, t]) => `<button class="chip${k === cat ? ' on' : ''}" data-c="${k}">${t}</button>`).join('')}</div>
        <div class="fp-list" id="fpL"></div>
        <p class="muted fp-note" id="fpN"></p></div>
        <div class="d-foot"><button class="btn ghost" id="fpLib">${A().icon('download')}Kütüphane</button><span style="flex:1"></span><button class="btn" data-close>Kapat</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const L = $('#fpL', box), N = $('#fpN', box);
          const draw = () => {
            const s = $('#fpS', box).value.trim(), rec = recent(), qq = q.toLocaleLowerCase('tr-TR');
            if (cat === 'pairs') {
              L.innerHTML = CAT().PAIRS.map(([h, b, t]) => `<button class="fp-pair" data-h="${esc(h)}" data-b="${esc(b)}"><b style="font-family:'${esc(h)}';font-weight:700">${esc(s || t)}</b><span style="font-family:'${esc(b)}'">Metin bu fontla: okunaklı ve dengeli bir eşleşme.</span><small>${esc(h)} + ${esc(b)} · ${esc(t)}</small></button>`).join('');
              CAT().PAIRS.forEach(([h, b]) => { F.ensureFamily(h).catch(() => {}); F.ensureFamily(b).catch(() => {}); });
              N.textContent = 'Eşleşmeye dokun: seçili yazıya başlık fontu verilir. Tasarımdaki tüm yazılara uygulamak için Tasarım koçu → “Yazı tiplerini eşleştir”.';
              return;
            }
            let rows = familyRows().filter((r) => (cat === 'all' ? true : cat === 'recent' ? rec.includes(r.family) : r.cat === cat) && (!qq || (r.family + ' ' + (r.desc || '') + ' ' + (CAT().CATS[r.cat] || '')).toLocaleLowerCase('tr-TR').includes(qq)));
            if (cat === 'recent') rows.sort((a, b) => rec.indexOf(a.family) - rec.indexOf(b.family));
            L.innerHTML = rows.map((r) => { const ws = R().fontWeights(r.family); const n = ws ? ws.weights.length + (ws.italic.length ? ' · italik' : '') : r.src === 'remote' ? '' : '';
              return `<button class="fp-it${r.family === current ? ' on' : ''}" data-f="${esc(r.family)}"><span class="fp-s" style="font-family:'${esc(r.family)}'">${esc(s || sample(r.family, r.cat))}</span><span class="fp-m"><b>${esc(r.family)}</b><small>${esc(r.desc || '')}</small></span><span class="fp-b">${r.src === 'remote' ? `<i class="dl" title="Seçince indirilir">${A().icon('download')}</i>` : ws ? `<i>${ws.weights.length} kalınlık${ws.italic.length ? ' + italik' : ''}</i>` : r.src === 'system' ? '<i>sistem</i>' : ''}</span></button>`; }).join('') || '<p class="muted" style="padding:20px">Bulunamadı.</p>';
              // görünen uzak fontların önizlemesi için arka planda yükle (en fazla 12)
            if (!window.TS_CLOUD || true) rows.filter((r) => r.src === 'remote').slice(0, 12).forEach((r) => setTimeout(() => F.ensureFamily(r.family).then(() => { const b = L.querySelector(`[data-f="${CSS.escape(r.family)}"] .fp-b`); const ws = R().fontWeights(r.family); if (b && ws) b.innerHTML = `<i>${ws.weights.length} kalınlık${ws.italic.length ? ' + italik' : ''}</i>`; }).catch(() => {}), 50));
            const total = CAT().LIST.length, have = CAT().LIST.filter((x) => R().FONT_DB[x.family] && R().FONT_DB[x.family].faces.length).length;
            N.innerHTML = `${rows.length} yazı tipi · kütüphanede ${have}/${total} aile indirildi${status && status.running ? ` · indiriliyor: ${esc(status.current || '')}` : ''}. Hepsi ticari kullanımda serbest (OFL).`;
          };
          $('#fpQ', box).oninput = (e) => { q = e.target.value; draw(); };
          $('#fpQ', box).onkeydown = (e) => e.stopPropagation();
          $('#fpS', box).oninput = () => draw();
          $('#fpS', box).onkeydown = (e) => e.stopPropagation();
          $('#fpC', box).onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#fpC .chip', box).forEach((c) => c.classList.toggle('on', c === b)); draw(); };
          L.onclick = async (e) => {
            const pr = e.target.closest('.fp-pair'); if (pr) { done = true; close(); resolve({ family: pr.dataset.h, pair: [pr.dataset.h, pr.dataset.b] }); return; }
            const b = e.target.closest('[data-f]'); if (!b) return; const fam = b.dataset.f;
            b.classList.add('loading');
            try { await F.ensureFamily(fam); } catch (er) { b.classList.remove('loading'); A().toast(er.message, true); if (!R().FONT_DB[fam] && !SYS.includes(fam) && !(R().customFonts || []).some((x) => x.family === fam)) return; }
            pushRecent(fam); done = true; close(); resolve({ family: fam });
          };
          $('#fpLib', box).onclick = () => { done = true; close(); resolve(null); F.libraryDialog(); };
          const onProg = () => draw(); document.addEventListener('ts-fonts-progress', onProg);
          box.addEventListener('remove', () => document.removeEventListener('ts-fonts-progress', onProg));
          draw(); setTimeout(() => $('#fpQ', box).focus(), 50);
        },
      }).then(() => { if (!done) resolve(null); });
    });
  };

  // ---------- kütüphane yönetimi
  F.libraryDialog = function () {
    UI().dialog(`<div class="d-body"><h3>${A().icon('type')} Yazı tipi kütüphanesi</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">En çok kullanılan ${CAT().LIST.length} Google Fonts ailesi, <b>tüm kalınlıkları ve italikleriyle</b> (Türkçe karakterler dahil). ${window.TS_CLOUD ? 'Bulut sürümünde fontlar kullanıldıkça Google Fonts’tan yüklenir.' : 'Bir kez bilgisayarına indirilir, sonra internetsiz çalışır. Uygulama ilk açılışta bunu kendiliğinden yapar.'} Hepsi ticari kullanımda serbesttir (SIL OFL / Apache).</p>
      <div class="fl-prog"><div class="fl-bar"><i id="flB"></i></div><span id="flT"></span></div>
      <div class="fl-grid" id="flG"></div></div>
      <div class="d-foot"><button class="btn primary" id="flAll">${A().icon('download')}Hepsini indir</button><span style="flex:1"></span><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const draw = (d) => {
          const total = CAT().LIST.length, have = CAT().LIST.filter((x) => R().FONT_DB[x.family] && R().FONT_DB[x.family].faces.length);
          $('#flB', box).style.width = Math.round((have.length / total) * 100) + '%';
          const st = (d && d.status) || status;
          $('#flT', box).textContent = `${have.length} / ${total} aile hazır${st && st.running ? ' · indiriliyor: ' + (st.current || '…') : ''}${st && st.errors && st.errors.length && !st.running ? ' · bazıları indirilemedi (internet?)' : ''}`;
          $('#flG', box).innerHTML = CAT().LIST.map((x) => { const ws = R().fontWeights(x.family); return `<div class="fl-it${ws ? ' ok' : ''}"><span style="font-family:'${esc(x.family)}'">${esc(x.family)}</span><small>${esc(CAT().CATS[x.cat] || '')}${ws ? ` · ${ws.weights.length} kalınlık${ws.italic.length ? ' + italik' : ''}` : ''}</small></div>`; }).join('');
          $('#flAll', box).disabled = !!(st && st.running);
        };
        $('#flAll', box).onclick = async () => { $('#flAll', box).disabled = true; try { await F.downloadAll(); } catch (e) { A().toast(e.message, true); } };
        const on = (e) => draw(e.detail); document.addEventListener('ts-fonts-progress', on);
        draw();
      },
    });
  };

  // ---------- kalınlık seçenekleri (yalnız ailenin gerçekten sahip olduğu)
  F.weightOptions = function (fam, cur) {
    const ws = R().fontWeights(fam), list = ws ? ws.weights : [300, 400, 500, 600, 700, 800, 900];
    return list.map((w) => `<option value="${w}" ${+cur === w ? 'selected' : ''}>${W_NAMES[w] || w}</option>`).join('') + (list.includes(+cur) ? '' : `<option value="${cur}" selected>${W_NAMES[cur] || cur}</option>`);
  };
  F.nearestWeight = function (fam, w) { const ws = R().fontWeights(fam); if (!ws) return w; return ws.weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), ws.weights[0]); };
  F.hasItalic = function (fam) { const ws = R().fontWeights(fam); return !ws || ws.italic.length > 0; };
  F.meta = meta;
  window.Fonts = F;
})();
