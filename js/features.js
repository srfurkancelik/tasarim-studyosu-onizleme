/* Tasarım Stüdyosu — ek özellikler: yapay zeka bağlantısı, marka kiti, şablonlar, toplu üretim,
   format uyarlama, seçenek seçici, baskı animasyonları, ses, paylaşım */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.Render, M = window.Motion, T = window.Tools;
  const esc = R.esc;
  const icon = (...a) => window.icon(...a);
  const A = () => window.App;
  const F = {};

  // =========================================================
  // EFEKTLER
  // =========================================================
  F.splash = function (x, y) {
    if (M.reduce()) return;
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
    const cols = ['#19A9E1', '#E2197C', '#F2C230', '#ECEEF2'];
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('i');
      const s = 4 + Math.random() * 8;
      d.className = 'ink-drop';
      Object.assign(d.style, { left: x + 'px', top: y + 'px', width: s + 'px', height: s + 'px', background: cols[i % 4] });
      document.body.appendChild(d);
      const a = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70;
      M.animate(d, { x: [0, Math.cos(a) * dist], y: [0, Math.sin(a) * dist - 20], scale: [0.4, 1], opacity: [1, 0] }, { stiffness: 120, damping: 14, keep: true }).then(() => d.remove());
    }
  };
  // Tıklanan düğmenin konumundan sıçrama
  F.splashFrom = (el) => { if (!el) return F.splash(); const r = el.getBoundingClientRect(); F.splash(r.left + r.width / 2, r.top + r.height / 2); };

  const PRESS_STEPS = ['İstek okunuyor', 'Düzen kuruluyor', 'Renkler ayarlanıyor', 'Yazılar yerleştiriliyor', 'Baskıya hazırlanıyor'];
  F.pressStart = function (stage, steps) {
    const STEPS = steps || PRESS_STEPS;
    const el = document.createElement('div');
    el.className = 'press';
    el.innerHTML = `<div class="press-sheet"><span class="press-roller"></span><span class="press-scan"></span>
      ${'<i class="press-line"></i>'.repeat(5)}</div><div class="press-text"><b class="h-display">Basılıyor</b><span id="pressStep">${STEPS[0]}</span></div>`;
    stage.appendChild(el);
    M.animate(el, { opacity: [0, 1] }, { stiffness: 300, damping: 30 });
    let i = 0;
    const t = setInterval(() => {
      i = Math.min(i + 1, STEPS.length - 1);
      const s = $('#pressStep', el);
      if (!s) return;
      if (s.textContent === STEPS[i]) return;
      s.textContent = STEPS[i];
      M.animate(s, { opacity: [0, 1], y: [6, 0] }, { stiffness: 400, damping: 30 });
    }, steps ? 9000 : 900);
    let done = false;
    const t0 = Date.now();
    return async () => {
      if (done) return; done = true;
      const wait = M.reduce() ? 0 : Math.max(0, 1300 - (Date.now() - t0));
      if (wait) await new Promise((r) => setTimeout(r, wait));
      clearInterval(t); return M.animate(el, { opacity: [1, 0] }, { stiffness: 400, damping: 40, keep: true }).then(() => el.remove()); };
  };
  F.printReveal = function (art) {
    if (!art || M.reduce()) return;
    const roller = document.createElement('span');
    roller.className = 'reveal-roller';
    art.appendChild(roller);
    art.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
    roller.animate([{ top: '0%', opacity: 1 }, { top: '100%', opacity: 1 }, { top: '100%', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)' }).finished.then(() => roller.remove());
  };

  // Pano başlığındaki kendi kendine yazılan örnek istekler
  F.typePlaceholder = function (ta, examples) {
    if (M.reduce()) return () => {};
    let ex = 0, ch = 0, del = false, stop = false;
    const tick = () => {
      if (stop) return;
      if (document.activeElement === ta || ta.value) { ta.placeholder = examples[0]; return setTimeout(tick, 1200); }
      const s = examples[ex];
      ch += del ? -2 : 1;
      ta.placeholder = s.slice(0, Math.max(0, ch)) + (del ? '' : '▍');
      if (!del && ch >= s.length) { del = true; return setTimeout(tick, 1800); }
      if (del && ch <= 0) { del = false; ex = (ex + 1) % examples.length; }
      setTimeout(tick, del ? 18 : 38);
    };
    setTimeout(tick, 600);
    return () => (stop = true);
  };

  // =========================================================
  // YAPAY ZEKA BAĞLANTISI
  // =========================================================
  const PROVS = [
    ['anthropic', 'Claude', 'Önerilen. Serbest metni anlar, görselleri inceler.'],
    ['openai', 'OpenAI uyumlu', 'OpenAI, OpenRouter, LM Studio…'],
    ['ollama', 'Ollama', 'Bilgisayarında ücretsiz, yerel model.'],
    ['local', 'Yerel motor', 'İnternetsiz, hazır düzenlerle.'],
  ];
  F.connectAI = async function () {
    const s = await A().api('settings');
    let prov = s.provider === 'local' ? 'anthropic' : s.provider;
    const changed = await A().dialog(`
      <div class="d-body ai-connect">
        <div class="ai-head"><span class="ai-orb"><i></i><i></i><i></i></span><div><h3>Yapay zekayı bağla</h3>
        <p class="muted" style="margin:0">Anahtar yalnızca bu bilgisayarda saklanır; telefona gizlenmiş olarak gösterilir.</p></div></div>
        <div class="prov-pills">${PROVS.map(([k, t]) => `<button class="chip ${k === prov ? 'on' : ''}" data-p="${k}">${t}</button>`).join('')}</div>
        <p class="muted" id="provDesc" style="margin:4px 0 14px;font-size:12.5px"></p>
        <div id="provFields"></div>
        <div class="ai-status" id="aiStatus" hidden></div>
      </div>
      <div class="d-foot">
        ${s.provider !== 'local' ? `<button class="btn ghost danger" id="aiOff" style="margin-right:auto">Bağlantıyı kaldır</button>` : ''}
        <button class="btn ghost" data-close>Vazgeç</button>
        <button class="btn primary" id="aiGo">${icon('check')}<span>Test et ve bağla</span></button>
      </div>`, {
      onOpen: (box, close) => {
        const fields = $('#provFields', box), st = $('#aiStatus', box);
        const draw = () => {
          $$('.prov-pills .chip', box).forEach((c) => c.classList.toggle('on', c.dataset.p === prov));
          $('#provDesc', box).textContent = PROVS.find((p) => p[0] === prov)[2];
          const f = {
            anthropic: `<label class="field"><span>Claude API anahtarı</span><div class="key-row"><input class="inp" id="k1" type="password" placeholder="sk-ant-api03-…" value="${esc(s.anthropic_key)}" autocomplete="off"><button class="btn icon" id="peek" title="Göster">${icon('eye')}</button></div></label>
              <p class="muted" style="font-size:12px;margin:8px 0 12px">Anahtarı <b>console.anthropic.com</b> → API Keys bölümünden oluştur ve buraya yapıştır.</p>
              <label class="field"><span>Model</span><input class="inp" id="m1" list="claudeModels" value="${esc(s.anthropic_model)}"><datalist id="claudeModels"><option value="claude-opus-5-5">En iyi tasarım kalitesi (daha yavaş, daha pahalı)</option><option value="claude-sonnet-5-5">Hızlı ve dengeli</option></datalist></label>
              <p class="muted" style="font-size:12px;margin:8px 0 0">Karmaşık etiket ve afişleri yeniden tasarlarken <b>claude-opus-5-5</b> belirgin şekilde daha iyi sonuç verir.</p>`,
            openai: `<label class="field"><span>Sunucu adresi</span><input class="inp" id="u2" value="${esc(s.openai_url)}"></label>
              <div class="form-grid" style="margin-top:12px"><label class="field"><span>API anahtarı</span><div class="key-row"><input class="inp" id="k2" type="password" value="${esc(s.openai_key)}" placeholder="sk-…" autocomplete="off"><button class="btn icon" id="peek">${icon('eye')}</button></div></label>
              <label class="field"><span>Model</span><input class="inp" id="m2" value="${esc(s.openai_model)}"></label></div>
              <p class="muted" style="font-size:12px;margin:8px 0 0">LM Studio için adres genelde http://localhost:1234/v1 olur ve anahtar gerekmez.</p>`,
            ollama: `<div class="form-grid"><label class="field"><span>Adres</span><input class="inp" id="u3" value="${esc(s.ollama_url)}"></label>
              <label class="field"><span>Model</span><input class="inp" id="m3" value="${esc(s.ollama_model)}"></label></div>
              <p class="muted" style="font-size:12px;margin:8px 0 0">Önce ollama.com'dan kur, sonra <span class="kbd">ollama pull llama3.1</span> ile model indir.</p>`,
            local: `<p class="muted" style="margin:0">Anahtar gerekmez. Hazır düzenler ve renk temalarıyla çalışır.</p>`,
          }[prov];
          fields.innerHTML = f;
          st.hidden = true;
          const pk = $('#peek', box);
          if (pk) pk.onclick = (e) => { e.preventDefault(); const i = pk.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; };
          const first = $('input', fields); if (first && !first.value) first.focus();
          M.animate(fields, { opacity: [0, 1], y: [6, 0] });
        };
        $$('.prov-pills .chip', box).forEach((c) => (c.onclick = () => { prov = c.dataset.p; draw(); }));
        draw();
        const v = (id) => { const e = $('#' + id, box); return e ? e.value.trim() : undefined; };
        const status = (cls, html) => { st.hidden = false; st.className = 'ai-status ' + cls; st.innerHTML = html; M.animate(st, { opacity: [0, 1], y: [6, 0] }); };
        $('#aiGo', box).onclick = async (e) => {
          const b = e.currentTarget;
          const body = { provider: prov };
          if (prov === 'anthropic') { body.anthropic_key = v('k1'); body.anthropic_model = v('m1') || 'claude-sonnet-5-5'; if (!body.anthropic_key) return status('err', 'Önce API anahtarını yapıştır.'); }
          if (prov === 'openai') Object.assign(body, { openai_url: v('u2'), openai_key: v('k2'), openai_model: v('m2') });
          if (prov === 'ollama') Object.assign(body, { ollama_url: v('u3'), ollama_model: v('m3') });
          b.disabled = true; b.lastChild.textContent = 'Bağlanıyor…';
          status('wait', '<span class="ink-dots"><i></i><i></i><i></i></span> Bağlantı deneniyor, kısa bir test tasarımı isteniyor…');
          const prev = { provider: s.provider };
          try {
            await A().api('settings', { body });
            const r = await A().api('test-ai', { body: {} });
            status('ok', icon('check') + ' ' + esc(r.message));
            A().S.settings = await A().api('settings');
            A().refreshAI && A().refreshAI();
            F.splashFrom(b);
            setTimeout(() => close(true), 900);
          } catch (err) {
            await A().api('settings', { body: prev }).catch(() => {});
            status('err', `<b>Bağlanamadı.</b> ${esc(err.message)}<br><button class="btn sm" id="aiForce" style="margin-top:8px">Yine de kaydet</button>`);
            const fb = $('#aiForce', box);
            if (fb) fb.onclick = async () => { await A().api('settings', { body }); A().S.settings = await A().api('settings'); A().refreshAI && A().refreshAI(); close(true); };
          } finally { b.disabled = false; b.lastChild.textContent = 'Test et ve bağla'; }
        };
        const off = $('#aiOff', box);
        if (off) off.onclick = async () => {
          await A().api('settings', { body: { provider: 'local', anthropic_key: '', openai_key: '' } });
          A().S.settings = await A().api('settings'); A().refreshAI && A().refreshAI();
          A().toast('Yapay zeka bağlantısı kaldırıldı, yerel motora geçildi'); close(true);
        };
      },
    });
    return changed;
  };

  // =========================================================
  // GÖRSEL ÜRETİMİ: bağlantı
  // =========================================================
  F.imageReady = () => { const s = A().S.settings || {}; return s.img_provider && s.img_provider !== 'none'; };
  F.connectImageAI = async function () {
    const s = await A().api('settings');
    let prov = s.img_provider && s.img_provider !== 'none' ? s.img_provider : 'openai';
    return A().dialog(`
      <div class="d-body ai-connect">
        <div class="ai-head"><span class="ai-orb img"><i></i><i></i><i></i></span><div><h3>Görsel üretimini bağla</h3>
        <p class="muted" style="margin:0">Yeni ürün fotoğrafı, arka plan ve illüstrasyon üretmek ya da mevcut fotoğrafı yapay zekayla düzenlemek için.</p></div></div>
        <div class="prov-pills">${[['openai', 'OpenAI (gpt-image)'], ['gemini', 'Google Gemini'], ['none', 'Kapalı']].map(([k, t]) => `<button class="chip ${k === prov ? 'on' : ''}" data-p="${k}">${t}</button>`).join('')}</div>
        <div id="imgFields" style="margin-top:12px"></div>
        <div class="ai-status" id="imgStatus" hidden></div>
      </div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="imgGo">${icon('check')}<span>Test et ve bağla</span></button></div>`, {
      onOpen: (box, close) => {
        const fields = $('#imgFields', box), st = $('#imgStatus', box);
        const q = ['low', 'medium', 'high'].map((v) => `<option value="${v}" ${s.img_quality === v ? 'selected' : ''}>${{ low: 'Taslak (ucuz, hızlı)', medium: 'Standart', high: 'Yüksek (baskı için)' }[v]}</option>`).join('');
        const draw = () => {
          $$('.prov-pills .chip', box).forEach((c) => c.classList.toggle('on', c.dataset.p === prov));
          fields.innerHTML = prov === 'openai' ? `
              <label class="field"><span>OpenAI API anahtarı</span><div class="key-row"><input class="inp" id="ik" type="password" value="${esc(s.img_openai_key)}" placeholder="sk-…" autocomplete="off"><button class="btn icon" id="ipeek">${icon('eye')}</button></div></label>
              <p class="muted" style="font-size:12px;margin:8px 0 12px">platform.openai.com → API keys. Görsel başına ücretlendirilir (kalite seçimine göre değişir).</p>
              <div class="form-grid"><label class="field"><span>Model</span><input class="inp" id="im" list="oiModels" value="${esc(s.img_openai_model)}"><datalist id="oiModels"><option value="gpt-image-2"><option value="gpt-image-1.5"><option value="gpt-image-1"><option value="gpt-image-1-mini"></datalist></label>
              <label class="field"><span>Kalite</span><select class="inp" id="iq">${q}</select></label></div>`
            : prov === 'gemini' ? `
              <label class="field"><span>Gemini API anahtarı</span><div class="key-row"><input class="inp" id="ik" type="password" value="${esc(s.img_gemini_key)}" placeholder="AIza…" autocomplete="off"><button class="btn icon" id="ipeek">${icon('eye')}</button></div></label>
              <p class="muted" style="font-size:12px;margin:8px 0 12px">aistudio.google.com → Get API key. Gemini, ürünü koruyarak düzenlemede (arka plan değiştirme vb.) çok başarılıdır.</p>
              <label class="field"><span>Model</span><input class="inp" id="im" list="gmModels" value="${esc(s.img_gemini_model)}"><datalist id="gmModels"><option value="gemini-3-pro-image-preview"><option value="gemini-3.1-flash-image-preview"><option value="gemini-2.5-flash-image"></datalist></label>`
            : `<p class="muted" style="margin:0">Görsel üretimi kapalı olacak. Tasarımlar mevcut görsellerinle hazırlanır.</p>`;
          st.hidden = true;
          const pk = $('#ipeek', box); if (pk) pk.onclick = (e) => { e.preventDefault(); const i = $('#ik', box); i.type = i.type === 'password' ? 'text' : 'password'; };
          M.animate(fields, { opacity: [0, 1], y: [6, 0] });
        };
        $$('.prov-pills .chip', box).forEach((c) => (c.onclick = () => { prov = c.dataset.p; draw(); }));
        draw();
        const status = (cls, html) => { st.hidden = false; st.className = 'ai-status ' + cls; st.innerHTML = html; };
        $('#imgGo', box).onclick = async (e) => {
          const b = e.currentTarget;
          const v = (id) => { const x = $('#' + id, box); return x ? x.value.trim() : undefined; };
          const body = { img_provider: prov };
          if (prov === 'openai') Object.assign(body, { img_openai_key: v('ik'), img_openai_model: v('im') || 'gpt-image-2', img_quality: v('iq') });
          if (prov === 'gemini') Object.assign(body, { img_gemini_key: v('ik'), img_gemini_model: v('im') || 'gemini-3-pro-image-preview' });
          if (prov !== 'none' && !v('ik')) return status('err', 'Önce API anahtarını yapıştır.');
          b.disabled = true; status('wait', '<span class="ink-dots"><i></i><i></i><i></i></span> Anahtar doğrulanıyor (ücretsiz kontrol)…');
          try {
            await A().api('settings', { body });
            const r = await A().api('test-image', { body: {} });
            status('ok', icon('check') + ' ' + esc(r.message));
            A().S.settings = await A().api('settings');
            F.splashFrom(b);
            setTimeout(() => close(true), 900);
          } catch (err) {
            status('err', `<b>Doğrulanamadı.</b> ${esc(err.message)}`);
            await A().api('settings', { body: { img_provider: s.img_provider || 'none' } }).catch(() => {});
          } finally { b.disabled = false; }
        };
      },
    });
  };

  // =========================================================
  // GÖRSEL ÜRETİMİ: üretim / düzenleme penceresi
  // opts: { base: url|dataURL (düzenlenecek görsel), aspect, prompt, title }
  // sonuç: { url } ya da null
  // =========================================================
  const IMG_PRESETS = [
    ['Stüdyo ürün fotoğrafı', 'profesyonel stüdyo ürün fotoğrafı, yumuşak ışık, sade arka plan'],
    ['Mermer zemin', 'beyaz mermer zemin üzerinde, doğal gün ışığı, sığ alan derinliği'],
    ['Ahşap masa', 'rustik ahşap masa üzerinde, sıcak ışık, yanında taze malzemeler'],
    ['Koyu lüks', 'koyu, dramatik ışık, siyah zemin, altın detaylar, premium his'],
    ['Pastel minimal', 'pastel renkli minimal arka plan, geometrik altlıklar, yumuşak gölgeler'],
    ['Düz illüstrasyon', 'modern düz vektör illüstrasyon tarzı, canlı renkler'],
  ];
  F.imageGenDialog = async function (opts = {}) {
    if (!F.imageReady()) {
      const ok = await F.connectImageAI();
      if (!ok || !F.imageReady()) return null;
    }
    const editing = !!opts.base;
    let aspect = opts.aspect || '1:1';
    return A().dialog(`
      <div class="d-body imggen">
        <h3>${esc(opts.title || (editing ? 'Görseli yapay zekayla düzenle' : 'Yapay zekayla görsel üret'))}</h3>
        <div class="ig-grid">
          ${editing ? `<div class="ig-base"><img src="${esc(opts.base)}" alt=""><small>Temel görsel</small></div>` : ''}
          <div class="ig-main">
            <textarea class="inp" id="igP" rows="3" placeholder="${editing ? 'Örn. ürünü aynen koru, arka planı beyaz mermer masa yap, yanına taze zerdeçal koy' : 'Örn. ahşap kaşıkta köri tozu, yanında zerdeçal kökü ve yaprak, sıcak ışık'}">${esc(opts.prompt || '')}</textarea>
            <div class="ig-chips">${IMG_PRESETS.map(([t, p]) => `<button class="chip" data-p="${esc(p)}">${esc(t)}</button>`).join('')}</div>
            <div class="exp-row"><span>Oran</span><div class="seg" id="igA">${['1:1', '3:2', '2:3', '16:9', '9:16'].map((a) => `<button data-a="${a}" class="${a === aspect ? 'on' : ''}">${a}</button>`).join('')}</div></div>
          </div>
        </div>
        <div class="ig-result" id="igR" hidden></div>
      </div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="igUse" hidden>${icon('check')}<span>Bunu kullan</span></button><button class="btn primary" id="igGo">${icon('sparkle')}<span>${editing ? 'Düzenle' : 'Üret'}</span></button></div>`, {
      onOpen: (box, close) => {
        const ta = $('#igP', box), res = $('#igR', box);
        let last = null;
        $$('.ig-chips .chip', box).forEach((c) => (c.onclick = () => { ta.value = (ta.value ? ta.value.replace(/[,.\s]*$/, '') + ', ' : '') + c.dataset.p; ta.focus(); }));
        $$('#igA button', box).forEach((b) => (b.onclick = () => { aspect = b.dataset.a; $$('#igA button', box).forEach((x) => x.classList.toggle('on', x === b)); }));
        $('#igUse', box).onclick = () => close(last);
        $('#igGo', box).onclick = async (e) => {
          const prompt = ta.value.trim();
          if (!prompt) { ta.focus(); return; }
          const b = e.currentTarget; b.disabled = true; b.lastChild.textContent = 'Üretiliyor…';
          res.hidden = false;
          res.innerHTML = `<div class="ig-wait"><div class="press-sheet mini"><span class="press-roller"></span><span class="press-scan"></span></div><span>Görsel hazırlanıyor — 15-60 sn sürebilir</span></div>`;
          try {
            const r = await A().api('image-gen', { body: { prompt, aspect, refs: editing ? [opts.base] : [] } });
            last = r;
            res.innerHTML = `<img src="${esc(r.url)}" alt=""><small class="muted">Kullanılan istem: ${esc(r.prompt.slice(0, 220))}${r.prompt.length > 220 ? '…' : ''}</small>`;
            M.animate($('img', res), { opacity: [0, 1], scale: [.96, 1] }, { stiffness: 260, damping: 24 });
            $('#igUse', box).hidden = false;
            b.lastChild.textContent = 'Tekrar üret';
            F.splashFrom($('#igUse', box));
          } catch (err) {
            res.innerHTML = `<div class="ai-status err" style="display:block">${esc(err.message)}</div>`;
            b.lastChild.textContent = editing ? 'Düzenle' : 'Üret';
          } finally { b.disabled = false; }
        };
        ta.focus();
      },
    });
  };
  // Bir görsel katmanının (kırpılmış olabilir) görünen kısmını data URL olarak al
  F.layerImageData = async function (l) {
    const src = l.origSrc && !l.crop ? l.src : l.src;
    if (!l.crop) return src;
    const im = new Image();
    await new Promise((r) => { im.onload = r; im.onerror = r; im.src = src; });
    const c = document.createElement('canvas');
    const sw = l.crop.w * im.naturalWidth, sh = l.crop.h * im.naturalHeight;
    const k = Math.min(1, 1536 / Math.max(sw, sh));
    c.width = Math.round(sw * k); c.height = Math.round(sh * k);
    c.getContext('2d').drawImage(im, l.crop.x * im.naturalWidth, l.crop.y * im.naturalHeight, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  };
  F.aspectOf = (w, h) => { const r = w / h; const opts = [['1:1', 1], ['3:2', 1.5], ['2:3', 0.667], ['16:9', 1.778], ['9:16', 0.5625]]; return opts.reduce((a, b) => (Math.abs(Math.log(b[1] / r)) < Math.abs(Math.log(a[1] / r)) ? b : a))[0]; };

  // =========================================================
  // MARKA KİTİ
  // =========================================================
  const INFO_FIELDS = [['product', 'Ürün adı', 'Örn. Organik Zeytinyağı 1 L'], ['price', 'Fiyat', '₺349'], ['old', 'Eski fiyat', '₺429'], ['discount', 'İndirim', '%20 indirim'], ['cta', 'Çağrı (buton)', 'Hemen sipariş ver'], ['insta', 'Instagram', '@markam'], ['desc', 'Kısa açıklama', 'Soğuk sıkım, erken hasat, cam şişe']];
  F.INFO_FIELDS = INFO_FIELDS;
  F.viewBrand = async function (page) {
    const b = await A().api('brand');
    b.colors = b.colors && b.colors.length ? b.colors : ['#E2197C', '#19A9E1', '#14161B'];
    let fonts = [];
    try { fonts = await A().api('fonts'); await R.loadFonts(fonts); } catch (e) {}
    const fontOpts = (sel) => `<option value="">Tasarımın kendi fontu</option>` + R.FONTS.map((f) => `<option ${f === sel ? 'selected' : ''} style="font-family:'${f}'">${esc(f)}</option>`).join('');
    page.innerHTML = `<div class="settings brand-page">
      <h1 class="h-display">Marka kiti</h1>
      <p class="muted">Logonu, renklerini ve yazı tiplerini bir kez gir. Açık olduğunda her yeni tasarım bunları kendiliğinden kullanır.</p>
      <div class="bx-extract"><div><b>Logodan ya da örnek tasarımdan çıkar</b><span class="muted">Bir görsel seç, renkler ve yazı tipine en yakın fontlar otomatik bulunsun.</span></div><button class="btn" id="bExtract">${icon('sparkle')}Görselden marka kiti</button></div>
      <div class="brand-grid">
        <div>
          <div class="panel card-sec" style="margin-top:0">
            <label class="switch big"><input type="checkbox" id="bOn" ${b.enabled ? 'checked' : ''}><span class="tgl"></span><b>Yeni tasarımlarda marka kitini kullan</b></label>
          </div>
          <div class="panel card-sec">
            <h3>Kimlik</h3><p>Marka adı yapay zekaya bağlam olarak verilir.</p>
            <div class="form-grid"><label class="field"><span>Marka adı</span><input class="inp" id="bName" value="${esc(b.name || '')}"></label>
            <label class="field"><span>Slogan</span><input class="inp" id="bSlogan" value="${esc(b.slogan || '')}"></label></div>
            <div style="margin-top:16px"><span class="muted" style="font-size:12px">Logo</span>
              <div class="logo-drop" id="bLogo">${b.logo ? `<img src="${esc(b.logo)}" alt="Logo">` : `${icon('upload')}<span>Logo yükle (şeffaf PNG en iyisi)</span>`}</div>
              ${b.logo ? `<button class="btn sm ghost" id="bLogoX" style="margin-top:6px">${icon('trash')}Logoyu kaldır</button>` : ''}
            </div>
          </div>
          <div class="panel card-sec">
            <h3>Renkler</h3><p>İlk renk ana renk, ikincisi vurgu rengi olarak kullanılır.</p>
            <div class="brand-colors" id="bCols"></div>
          </div>
          <div class="panel card-sec">
            <h3>Yazı tipleri</h3><p>Kendi fontunu (.ttf, .otf, .woff2) yükleyebilirsin; editörde de listelenir.</p>
            <div class="form-grid"><label class="field"><span>Başlık fontu</span><button class="inp font-btn" id="bFH" data-v="${esc(b.font_heading || '')}" style="font-family:'${esc(b.font_heading || 'Inter')}'">${esc(b.font_heading || 'Tasarımın kendi fontu')}</button></label>
            <label class="field"><span>Metin fontu</span><button class="inp font-btn" id="bFB" data-v="${esc(b.font_body || '')}" style="font-family:'${esc(b.font_body || 'Inter')}'">${esc(b.font_body || 'Tasarımın kendi fontu')}</button></label></div>
            <div class="iconrow" style="margin-top:10px"><button class="btn sm" id="bPair">${icon('type')}Hazır font eşleşmesi seç</button>${window.Fonts ? `<button class="btn sm ghost" id="bFLib">${icon('download')}Yazı tipi kitaplığı</button>` : ''}</div>
            <button class="btn sm" id="bFontUp" style="margin-top:12px">${icon('upload')}Font yükle</button>
            ${fonts.length ? `<div class="font-list">${fonts.map((f) => `<span class="chip" style="font-family:'${esc(f.family)}'">${esc(f.family)}<button class="x" data-del="${esc(f.file)}" title="Sil">${icon('x')}</button></span>`).join('')}</div>` : ''}
          </div>
          <div class="panel card-sec">
            <h3>İletişim</h3><p>Tasarımların altına küçük bir satır olarak eklenir.</p>
            <div class="form-grid"><label class="field"><span>Telefon</span><input class="inp" id="bPhone" value="${esc(b.phone || '')}"></label>
            <label class="field"><span>Web / Instagram</span><input class="inp" id="bWeb" value="${esc(b.web || '')}"></label>
            <label class="field" style="grid-column:1/-1"><span>Adres</span><input class="inp" id="bAddr" value="${esc(b.address || '')}"></label></div>
          </div>
          <div class="panel card-sec">
            <h3>Ürün bilgilerim</h3><p>Bir kez yaz: şablonlara ve editördeki <b>Bilgilerimi yerleştir</b> düğmesine kendiliğinden dolar.</p>
            <div class="form-grid">${INFO_FIELDS.map(([k, t, ph]) => `<label class="field"${k === 'desc' ? ' style="grid-column:1/-1"' : ''}><span>${t}</span><input class="inp" data-info="${k}" placeholder="${esc(ph)}" value="${esc((b.info || {})[k] || '')}"></label>`).join('')}</div>
          </div>
          <div class="panel card-sec adm">
            <h3>Bağış bilgileri</h3><p>IBAN kartı, IBAN şeridi ve kampanya setleri buradan dolar.</p>
            <div class="form-grid">${(window.P7 ? window.P7.DONATE_FIELDS : []).map(([k, t, ph]) => `<label class="field"${k === 'iban' ? ' style="grid-column:1/-1"' : ''}><span>${t}</span><input class="inp" data-don="${k}" placeholder="${esc(ph)}" value="${esc((b.donate || {})[k] || '')}"></label>`).join('')}</div>
          </div>
          <div class="panel card-sec">
            <h3>Marka kilidi</h3><p>Açıkken her şablon logon, kurum adın, iletişim ve bağış bilgilerinle açılır; gıda ve ürün şablonları marka renklerine boyanır.</p>
            <label class="ck"><input type="checkbox" id="bLock" ${b.lock ? 'checked' : ''}> Şablonları markamla aç</label>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn primary" id="bSave">${icon('save')}Marka kitini kaydet</button></div>
        </div>
        <aside class="brand-preview-wrap"><p class="muted" style="font-size:12px;margin:0 0 8px">Önizleme</p><div id="bPrev"></div></aside>
      </div></div>`;

    const cols = $('#bCols', page);
    const drawCols = () => {
      cols.innerHTML = b.colors.map((c, i) => `<div class="bc"><label class="bc-sw" style="background:${c}"><input type="color" data-i="${i}" value="${R.toHex(c)}"></label><input class="inp" data-hex="${i}" value="${c.toUpperCase()}" maxlength="7"><span class="muted">${i === 0 ? 'Ana' : i === 1 ? 'Vurgu' : 'Ek'}</span>${b.colors.length > 1 ? `<button class="btn ghost sm icon" data-rm="${i}" title="Kaldır">${icon('x')}</button>` : ''}</div>`).join('')
        + (b.colors.length < 6 ? `<button class="btn sm" id="bAdd">${icon('plus')}Renk ekle</button>` : '');
      $$('[data-i]', cols).forEach((i) => (i.oninput = () => { b.colors[+i.dataset.i] = i.value.toUpperCase(); i.parentElement.style.background = i.value; $(`[data-hex="${i.dataset.i}"]`, cols).value = i.value.toUpperCase(); preview(); }));
      $$('[data-hex]', cols).forEach((i) => (i.onchange = () => { if (/^#[0-9a-f]{6}$/i.test(i.value)) { b.colors[+i.dataset.hex] = i.value.toUpperCase(); drawCols(); preview(); } }));
      $$('[data-rm]', cols).forEach((x) => (x.onclick = () => { b.colors.splice(+x.dataset.rm, 1); drawCols(); preview(); }));
      const add = $('#bAdd', cols); if (add) add.onclick = () => { b.colors.push('#F2C230'); drawCols(); preview(); };
    };
    drawCols();
    const collect = () => Object.assign(b, {
      enabled: $('#bOn', page).checked, name: $('#bName', page).value.trim(), slogan: $('#bSlogan', page).value.trim(),
      font_heading: $('#bFH', page).dataset.v, font_body: $('#bFB', page).dataset.v,
      info: Object.fromEntries($$('[data-info]', page).map((i) => [i.dataset.info, i.value.trim()])),
      phone: $('#bPhone', page).value.trim(), web: $('#bWeb', page).value.trim(), address: $('#bAddr', page).value.trim(),
      donate: Object.fromEntries($$('[data-don]', page).map((i) => [i.dataset.don, i.value.trim()])), lock: !!($('#bLock', page) || {}).checked,
    });
    function preview() {
      collect();
      const [c1 = '#E2197C', c2 = '#19A9E1', c3] = b.colors;
      const dark = c3 || '#14161B';
      const on = T.contrast('#FFFFFF', dark) > T.contrast('#111111', dark) ? '#FFFFFF' : '#111111';
      const hf = b.font_heading || 'Segoe UI', bf = b.font_body || 'Segoe UI';
      $('#bPrev', page).innerHTML = `<div class="brand-card" style="background:${dark};color:${on}">
        <span class="bc-blob" style="background:${c1}"></span><span class="bc-blob two" style="background:${c2}"></span>
        <div class="bc-top">${b.logo ? `<img src="${esc(b.logo)}" alt="">` : `<b style="font-family:'${esc(hf)}'">${esc(b.name || 'Markan')}</b>`}</div>
        <div class="bc-mid"><div style="font-family:'${esc(hf)}';font-weight:800;font-size:30px;line-height:1.05">${esc(b.slogan || 'Başlık örneği')}</div>
        <div style="font-family:'${esc(bf)}';opacity:.8;margin-top:8px;font-size:13px">Metin fontu böyle görünecek. 0123456789</div>
        <span class="bc-cta" style="background:${c1};color:${T.contrast('#fff', c1) > 3 ? '#fff' : '#111'};font-family:'${esc(bf)}'">Hemen incele</span></div>
        <div class="bc-foot" style="font-family:'${esc(bf)}'">${[b.phone, b.web, b.address].filter(Boolean).map(esc).join(' • ') || 'iletişim bilgilerin burada'}</div>
      </div><div class="swatches" style="margin-top:12px">${b.colors.map((c) => `<span class="sw" style="background:${c}" title="${c}"></span>`).join('')}</div>`;
    }
    preview();
    $$('input, select', page).forEach((i) => i.addEventListener('input', preview));
    $('#bLogo', page).onclick = () => A().pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      try {
        const r = await A().uploadFile(f);
        const im = new Image();
        await new Promise((res) => { im.onload = res; im.onerror = res; im.src = r.url; });
        b.logo = r.url; b.logo_ratio = im.naturalWidth && im.naturalHeight ? +(im.naturalWidth / im.naturalHeight).toFixed(3) : 1;
        collect(); await A().api('brand', { body: b }); A().onRoute();
      } catch (e) { A().toast(e.message, true); }
    }, false);
    const lx = $('#bLogoX', page); if (lx) lx.onclick = async () => { b.logo = ''; collect(); await A().api('brand', { body: b }); A().onRoute(); };
    const setF = (el, fam) => { el.dataset.v = fam || ''; el.textContent = fam || 'Tasarımın kendi fontu'; el.style.fontFamily = `'${fam || 'Inter'}'`; preview(); };
    ['#bFH', '#bFB'].forEach((id) => ($(id, page).onclick = async (e) => { e.preventDefault(); if (!window.Fonts) return; const r = await window.Fonts.pick($(id, page).dataset.v || 'Inter', { sample: id === '#bFH' ? (b.slogan || b.name || 'Başlık örneği') : undefined }); if (!r) return; await window.Fonts.ensureFamily(r.family); setF($(id, page), r.family); if (r.pair && id === '#bFH') { await window.Fonts.ensureFamily(r.pair[1]); setF($('#bFB', page), r.pair[1]); } }));
    $('#bPair', page).onclick = async () => { if (!window.Fonts) return; const r = await window.Fonts.pick(b.font_heading || 'Inter', { cat: 'pairs' }); if (!r) return; await window.Fonts.ensureFamily(r.family); setF($('#bFH', page), r.family); if (r.pair) { await window.Fonts.ensureFamily(r.pair[1]); setF($('#bFB', page), r.pair[1]); } };
    const fl = $('#bFLib', page); if (fl) fl.onclick = () => window.Fonts.libraryDialog();
    $('#bFontUp', page).onclick = () => F.uploadFont(() => A().onRoute());
    $('#bExtract', page).onclick = () => window.P5.brandFromImage(() => A().onRoute());
    $$('[data-del]', page).forEach((x) => (x.onclick = async () => { await A().api('fonts/' + encodeURIComponent(x.dataset.del), { method: 'DELETE' }); A().toast('Font silindi'); A().onRoute(); }));
    $('#bSave', page).onclick = async (e) => {
      collect();
      try { A().S.brand = await A().api('brand', { body: b }); A().toast(b.enabled ? 'Marka kiti kaydedildi ve açık' : 'Marka kiti kaydedildi (kapalı)'); F.splashFrom(e.currentTarget); }
      catch (err) { A().toast(err.message, true); }
    };
  };

  // ---------- yazı tipi yükleme: düğme, sürükle-bırak, .zip (Google Fonts indirmesi)
  const FONT_RE = /\.(ttf|otf|woff2?)$/i;
  // sfnt 'name' ve 'OS/2' tablolarından gerçek aile adı, kalınlık ve eğiklik
  async function fontInfo(buf, fname) {
    const out = { family: null, weight: null, style: null };
    try {
      let dv = new DataView(buf), tables = {};
      const tag = (o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
      const sig = tag(0);
      const getTable = async (t) => {
        const e = tables[t]; if (!e) return null;
        if (!e.comp || e.comp === e.len) return new DataView(buf, e.off, e.len);
        if (!('DecompressionStream' in window)) return null;
        const ds = new Blob([new Uint8Array(buf, e.off, e.comp)]).stream().pipeThrough(new DecompressionStream('deflate'));
        return new DataView(await new Response(ds).arrayBuffer());
      };
      if (sig === 'wOFF') { const n = dv.getUint16(12); for (let i = 0; i < n; i++) { const o = 44 + i * 20; tables[tag(o)] = { off: dv.getUint32(o + 4), comp: dv.getUint32(o + 8), len: dv.getUint32(o + 12) }; } }
      else if (sig === 'wOF2') { /* brotli: tablolar okunamaz, dosya adından tahmin edilir */ }
      else { const n = dv.getUint16(4); for (let i = 0; i < n; i++) { const o = 12 + i * 16; tables[tag(o)] = { off: dv.getUint32(o + 8), len: dv.getUint32(o + 12) }; } }
      const nm = await getTable('name');
      if (nm) {
        const cnt = nm.getUint16(2), so = nm.getUint16(4), names = {};
        for (let i = 0; i < cnt; i++) {
          const o = 6 + i * 12, pid = nm.getUint16(o), id = nm.getUint16(o + 6), len = nm.getUint16(o + 8), off = nm.getUint16(o + 10);
          if (![1, 2, 4, 16].includes(id) || names[id + '_' + (pid === 3 || pid === 0 ? 'u' : 'm')]) continue;
          let str = '';
          if (pid === 3 || pid === 0) { for (let j = 0; j < len; j += 2) str += String.fromCharCode(nm.getUint16(so + off + j)); names[id + '_u'] = str; }
          else if (pid === 1) { for (let j = 0; j < len; j++) str += String.fromCharCode(nm.getUint8(so + off + j)); names[id + '_m'] = str; }
        }
        out.family = names['16_u'] || names['1_u'] || names['16_m'] || names['1_m'] || null;
        const sub = names['2_u'] || names['2_m'] || '';
        if (/italic|oblique/i.test(sub)) out.style = 'italic';
      }
      const os2 = await getTable('OS/2');
      if (os2 && os2.byteLength > 6) { const w = os2.getUint16(4); if (w >= 100 && w <= 1000) out.weight = w; const fs = os2.byteLength > 64 ? os2.getUint16(62) : 0; if (fs & 1) out.style = 'italic'; }
    } catch (e) { /* bozuk tablo: dosya adına düş */ }
    const base = fname.replace(/\.[^.]+$/, '');
    if (!out.family) out.family = base.replace(/[-_](Regular|Bold|Italic|Medium|Light|Black|SemiBold|ExtraBold|ExtraLight|Thin|Book|Heavy|VariableFont.*|\[.*\])+$/gi, '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim() || 'Özel Font';
    if (!out.weight) { const W = { thin: 100, extralight: 200, light: 300, regular: 400, book: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900, heavy: 900 }; const m = base.toLowerCase().replace(/[-_ ]/g, '').match(/(extralight|semibold|extrabold|thin|light|regular|book|medium|bold|black|heavy)(italic)?$/); out.weight = m ? W[m[1]] : 400; }
    if (!out.style) out.style = /italic|oblique/i.test(base) ? 'italic' : 'normal';
    if (/variablefont|\[wght/i.test(base)) out.weight = '100 900';
    return out;
  }
  // .zip içinden yazı tiplerini çıkar (Google Fonts indirmesi)
  async function unzipFonts(buf) {
    const dv = new DataView(buf), out = [];
    let eocd = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('ZIP dosyası okunamadı');
    let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(new Uint8Array(buf, p + 46, nlen));
      p += 46 + nlen + xlen + clen;
      const fn = name.split('/').pop();
      if (!FONT_RE.test(fn) || /^\._|__MACOSX/.test(name)) continue;
      const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = new Uint8Array(buf, start, csize);
      let data;
      if (method === 0) data = raw.slice().buffer;
      else if (method === 8 && 'DecompressionStream' in window) data = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
      else continue;
      out.push({ name: fn, buf: data });
    }
    // değişken yazı tipi varsa “static” klasöründeki kopyalar gereksiz
    const hasVar = out.some((f) => /VariableFont|\[wght/i.test(f.name));
    return hasVar ? out.filter((f) => /VariableFont|\[wght/i.test(f.name)) : out;
  }
  const b64 = (buf) => { let s2 = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s2 += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s2); };
  const MIME = { ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2' };
  // dosyaları yükle; ilk ailenin adını döndürür
  F.installFonts = async function (files, { apply = true } = {}) {
    const list = [];
    for (const f of files) {
      const buf = await f.arrayBuffer();
      if (/\.zip$/i.test(f.name)) { try { (await unzipFonts(buf)).forEach((x) => list.push(x)); } catch (e) { A().toast(f.name + ': ' + e.message, true); } }
      else if (FONT_RE.test(f.name)) list.push({ name: f.name, buf });
    }
    if (!list.length) { A().toast('Yazı tipi bulunamadı — .ttf, .otf, .woff, .woff2 ya da bunları içeren .zip bırak', true); return null; }
    const fams = new Set(); let first = null;
    const prog = list.length > 2 ? A().toast(`${list.length} yazı tipi dosyası yükleniyor…`) : null; void prog;
    for (const x of list) {
      try {
        const info = await fontInfo(x.buf, x.name), ext = x.name.split('.').pop().toLowerCase();
        const r = await A().api('font-upload', { body: { name: x.name, data: `data:${MIME[ext] || 'font/ttf'};base64,${b64(x.buf)}`, family: info.family, weight: info.weight, style: info.style } });
        const ent = Object.assign({ weight: info.weight, style: info.style }, r, { family: r.family || info.family });
        await R.loadFonts([ent]);
        fams.add(ent.family); if (!first) first = ent.family;
      } catch (e) { A().toast(x.name + ': ' + e.message, true); }
    }
    if (!first) return null;
    let applied = false;
    const e = A().S.editorApi;
    if (apply && e && e.state && e.state.sel && e.state.sel.length) {
      const ls = e.doc.layers.filter((l) => e.state.sel.includes(l.id) && l.type === 'text');
      if (ls.length) { ls.forEach((l) => { l.fontFamily = first; R.layoutText(l); }); e.commit(); applied = true; }
    }
    A().toast(`${[...fams].map((f) => '“' + f + '”').join(', ')} yüklendi${applied ? ' ve seçili yazıya uygulandı' : ' — yazıyı seçip yazı tipi listesinden seçebilirsin'}`);
    document.dispatchEvent(new CustomEvent('ts-fonts-added', { detail: [...fams] }));
    return first;
  };
  F.uploadFont = function (done) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.ttf,.otf,.woff,.woff2,.zip'; inp.multiple = true;
    inp.onchange = async () => { await F.installFonts([...inp.files]); done && done(); };
    inp.click();
  };
  // uygulamanın her yerinde: yazı tipi dosyasını (ya da .zip’ini) sürükleyip bırak
  (function fontDrop() {
    let ov = null, depth = 0;
    const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
    const show = (on) => { if (on && !ov) { ov = document.createElement('div'); ov.className = 'font-drop'; ov.innerHTML = `<div><b>Dosyayı bırak</b><span>Yazı tipi (.ttf .otf .woff .woff2 ya da .zip) yüklenir · görsel ise tasarıma eklenir</span></div>`; document.body.appendChild(ov); } if (!on && ov) { ov.remove(); ov = null; } };
    window.addEventListener('dragenter', (e) => { if (!hasFiles(e)) return; depth++; if (A() && A().S && A().S.editorApi) return; show(true); });
    window.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) show(false); });
    window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
    window.addEventListener('drop', async (e) => {
      depth = 0; show(false);
      const files = [...((e.dataTransfer && e.dataTransfer.files) || [])];
      const fonts = files.filter((f) => FONT_RE.test(f.name) || /\.zip$/i.test(f.name));
      if (!fonts.length) { if (hasFiles(e) && !e.defaultPrevented && !e.target.closest('.ed-viewport, .drop, [data-drop], #photoDrop, #fileDrop, .studio, .page')) e.preventDefault(); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      await F.installFonts(fonts);
      const rest = files.filter((f) => !fonts.includes(f));
      if (rest.length) A().toast('Yazı tipleri yüklendi; görselleri ayrıca bırakabilirsin');
      if (A().S.route === 'marka' || /marka|ayarlar/.test(location.hash)) A().onRoute && A().onRoute();
    }, true);
  })();

  // =========================================================
  // ŞABLONLAR
  // =========================================================
  F.saveTemplate = async function (p) {
    const name = await A().promptBox('Şablon adı', (p.name || 'Şablon').replace(/ kopya$/, ''), 'Şablonu kaydet');
    if (!name) return;
    const d = A().designOf(p);
    const tpl = Object.assign(d, { name, thumb: p.thumb || (await R.thumbnail(p)), slots: p.layers.filter((l) => l.type === 'text').map((l) => l.name) });
    await A().api('templates', { body: tpl });
    A().toast('Şablon kaydedildi — panodan kullanabilirsin');
  };

  F.useTemplate = async function (id) {
    const t = R.normalize(await A().api('templates/' + id));
    const texts = t.layers.filter((l) => l.type === 'text');
    const imgs = t.layers.filter((l) => l.type === 'image' && l.role !== 'logo');
    const swap = {};
    const ok = await A().dialog(`<div class="d-body"><h3>${esc(t.name)}</h3><p class="muted">Metinleri doldur; boş bıraktıkların şablondaki gibi kalır.</p>
      <div class="tpl-fields">${texts.map((l) => `<label class="field"><span>${esc(l.name)}</span><input class="inp" data-id="${l.id}" value="${esc(l.text)}"></label>`).join('')}
      ${imgs.map((l) => `<div class="field"><span>${esc(l.name)}</span><button class="btn sm" data-img="${l.id}">${icon('image')}Görseli değiştir</button></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="tOk">${icon('sparkle')}Tasarımı oluştur</button></div>`, {
      onOpen: (box, close) => {
        $$('[data-img]', box).forEach((b) => (b.onclick = () => A().pickFiles(async (fs) => {
          if (!fs[0]) return; const r = await A().uploadFile(fs[0]); swap[b.dataset.img] = r.url; b.innerHTML = icon('check') + 'Görsel seçildi'; b.classList.add('on');
        }, false)));
        $('#tOk', box).onclick = () => { $$('[data-id]', box).forEach((i) => { const l = t.layers.find((x) => x.id === i.dataset.id); if (l && i.value.trim()) l.text = i.value; }); close(true); };
      },
    });
    if (!ok) return;
    for (const [lid, url] of Object.entries(swap)) { const l = t.layers.find((x) => x.id === lid); l.src = url; delete l.nw; delete l.nh; }
    await R.ensureImageSizes(t);
    await T.autoFixAsync(t);
    const p = Object.assign(A().newProject(t.width, t.height, t.name), { background: t.background, layers: t.layers, meta: t.meta || {} });
    A().S.project = p;
    await A().saveProject(p);
    F._openForm = true;
    A().go('editor', p.id);
  };

  // =========================================================
  // TOPLU ÜRETİM (CSV / Excel → ZIP)
  // =========================================================
  // sütun adları: şablon indirme ve otomatik eşleştirme aynı kuralı kullanır
  function seriesColumns(d) {
    const cols = [], seen = {};
    const uniq = (n) => { n = String(n || '').trim() || 'Alan'; if (seen[n]) { seen[n]++; n += ' ' + seen[n]; } else seen[n] = 1; return n; };
    const texts = d.layers.filter((l) => l.type === 'text' && !/^barcode/.test(l.role || ''));
    const imgs = d.layers.filter((l) => l.type === 'image' && l.role !== 'patch' && l.role !== 'barcode');
    const bcs = d.layers.filter((l) => l.barcode);
    texts.forEach((l) => cols.push({ kind: 't', id: l.id, col: uniq(l.name), sample: l.text }));
    imgs.forEach((l) => cols.push({ kind: 'i', id: l.id, col: uniq('Fotoğraf: ' + (l.name || 'görsel')), sample: (l.src || '').startsWith('/uploads/') ? l.src.slice(9) : '' }));
    bcs.forEach((l) => cols.push({ kind: 'b', id: l.id, col: uniq('Barkod'), sample: l.barcode.value }));
    return cols;
  }
  F.downloadSeriesTemplate = async function (d, name) {
    const cols = seriesColumns(d);
    const header = ['Dosya adı', ...cols.map((c) => c.col)];
    const ex = [name || 'urun-1', ...cols.map((c) => String(c.sample || ''))];
    const r = await A().api('table-template', { body: { columns: header, rows: [ex] } });
    const bin = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
    R.download(new Blob([bin], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${String(name || 'urun').replace(/\s+/g, '-')}-seri-sablonu.xlsx`);
    A().toast('Excel şablonu indi: her satıra bir ürün yaz, sonra buraya yükle');
  };

  F.batchDialog = async function (sourceId) {
    let tpls = [];
    try { tpls = await A().api('templates'); } catch (e) {}
    const cur = A().S.project && A().S.project.layers.length ? A().S.project : null;
    if (!tpls.length && !cur) return A().toast('Önce bir şablon kaydet ya da bir tasarım aç', true);
    let design = null, table = null;
    const photos = {}; // dosya adı → /uploads/ adresi
    await A().dialog(`<div class="d-body batch"><h3>Ürün serisi üret</h3>
      <p class="muted">Aynı tasarımdan her ürün için ayrı etiket: Excel'deki her satır bir ürün olur. Metinler, fotoğraflar ve barkod satırdan alınır.</p>
      <div class="steps">
        <div class="step"><b>1 · Kaynak tasarım</b><select class="inp" id="bSrc">${cur ? `<option value="__cur">Açık tasarım: ${esc(cur.name)}</option>` : ''}${tpls.map((t) => `<option value="${t.id}" ${t.id === sourceId ? 'selected' : ''}>Şablon: ${esc(t.name)}</option>`).join('')}</select>
          <button class="btn sm ghost" id="bTpl" style="margin-top:6px">${icon('download')}<span>Bu tasarım için Excel şablonu indir</span></button></div>
        <div class="step"><b>2 · Ürün tablosu</b><button class="btn" id="bFile">${icon('upload')}<span>Excel ya da CSV seç</span></button><small class="muted" id="bInfo">İlk satır sütun başlıkları olmalı.</small></div>
        <div class="step"><b>3 · Ürün fotoğrafları <span class="muted" style="font-weight:400">(isteğe bağlı)</span></b><button class="btn" id="bPhotos">${icon('image')}<span>Fotoğrafları seç</span></button><small class="muted" id="bPInfo">Tablodaki fotoğraf sütununa dosya adını yaz (örn. sumak.jpg).</small></div>
        <div class="step" id="bMap" hidden></div>
      </div>
      <div class="progress" id="bProg" hidden><i></i><span></span></div><div id="bWarn" class="muted" style="font-size:12.5px"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="bRun" disabled>${icon('download')}<span>Seriyi üret</span></button></div>`, {
      onOpen: (box) => {
        const loadSrc = async () => {
          const v = $('#bSrc', box).value;
          design = v === '__cur' ? R.normalize(JSON.parse(JSON.stringify(A().designOf(cur)))) : R.normalize(await A().api('templates/' + v));
          design.name = v === '__cur' ? cur.name : design.name;
          drawMap();
        };
        $('#bSrc', box).onchange = loadSrc;
        $('#bTpl', box).onclick = () => design && F.downloadSeriesTemplate(design, design.name);
        $('#bFile', box).onclick = () => {
          const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx,.tsv,.txt';
          inp.onchange = async () => {
            const f = inp.files[0]; if (!f) return;
            const data = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
            try { table = await A().api('parse-table', { body: { name: f.name, data } }); $('#bInfo', box).textContent = `${f.name} · ${table.rows.length} ürün · ${table.columns.length} sütun`; drawMap(); }
            catch (e) { $('#bInfo', box).textContent = 'Okunamadı: ' + e.message; }
          };
          inp.click();
        };
        $('#bPhotos', box).onclick = () => {
          const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
          inp.onchange = async () => {
            const fs = [...inp.files]; let n = 0;
            for (const f of fs) {
              $('#bPInfo', box).textContent = `Yükleniyor ${++n} / ${fs.length}…`;
              const data = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
              try { const r = await A().api('upload', { body: { data, name: f.name } }); photos[f.name.toLocaleLowerCase('tr-TR')] = r.url; photos[f.name.replace(/\.[^.]+$/, '').toLocaleLowerCase('tr-TR')] = r.url; } catch (e) {}
            }
            $('#bPInfo', box).textContent = `${fs.length} fotoğraf hazır`;
          };
          inp.click();
        };
        const norm = (s) => String(s || '').toLocaleLowerCase('tr-TR').replace(/[\s:_-]+/g, '');
        function drawMap() {
          const mp = $('#bMap', box);
          if (!design || !table) { mp.hidden = true; $('#bRun', box).disabled = true; return; }
          const cols = seriesColumns(design);
          const opt = (sel) => `<option value="">— değiştirme —</option>` + table.columns.map((c) => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('');
          const guess = (c) => table.columns.find((x) => norm(x) === norm(c.col)) || (c.kind === 'b' ? table.columns.find((x) => /barkod|barcode|ean|gtin/i.test(x)) : c.kind === 'i' ? table.columns.find((x) => /foto|görsel|resim|image|photo/i.test(x)) : null);
          const label = (c) => c.kind === 'b' ? `${icon('barcode')} Barkod<small>${esc(c.sample)}</small>` : c.kind === 'i' ? `${esc(c.col)}<small>dosya adı ya da adres</small>` : `${esc(c.col)}<small>${esc(String(c.sample).slice(0, 28))}</small>`;
          mp.hidden = false;
          mp.innerHTML = `<b>Eşleştir</b><div class="map">${cols.map((c) => `<label><span>${label(c)}</span><select class="inp" data-k="${c.kind}" data-id="${c.id}">${opt(guess(c))}</select></label>`).join('')}
            <label><span>Dosya adı<small>her ürünün adı</small></span><select class="inp" id="bName">${opt(table.columns.find((x) => /dosya/i.test(x)) || table.columns[0])}</select></label>
            <label><span>Biçim</span><select class="inp" id="bFmt"><option value="png">PNG</option><option value="jpg">JPG</option><option value="pdf">Ayrı baskı PDF'leri (ZIP)</option><option value="onepdf">Tek PDF (her ürün bir sayfa)</option><option value="none">Yalnız proje olarak kaydet</option></select></label>
            </div><label class="switch" style="margin-top:10px"><input type="checkbox" id="bSaveP" checked>Her ürünü ayrı proje olarak kaydet (sonra tek tek düzenlenebilir)</label>
            <div class="batch-prev">${table.rows.slice(0, 3).map((r) => `<span class="chip">${esc(Object.values(r).slice(0, 2).join(' · '))}</span>`).join('')}${table.rows.length > 3 ? `<span class="muted">+${table.rows.length - 3}</span>` : ''}</div>`;
          $('#bRun', box).disabled = false;
          M.animate(mp, { opacity: [0, 1], y: [8, 0] });
        }
        loadSrc();
        $('#bRun', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true;
          const prog = $('#bProg', box); prog.hidden = false;
          const maps = $$('[data-k]', box).filter((s) => s.value).map((s) => ({ kind: s.dataset.k, id: s.dataset.id, col: s.value }));
          const nameCol = $('#bName', box).value, fmt = $('#bFmt', box).value, saveP = $('#bSaveP', box).checked || fmt === 'none';
          const files = [], used = {}, warns = [];
          for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            const d = R.normalize(JSON.parse(JSON.stringify(design)));
            let bad = false;
            for (const m of maps) {
              let v = String(row[m.col] == null ? '' : row[m.col]).trim();
              if (!v) continue;
              const l = d.layers.find((x) => x.id === m.id); if (!l) continue;
              if (m.kind === 't') l.text = v;
              else if (m.kind === 'i') {
                const k = v.toLocaleLowerCase('tr-TR');
                if (photos[k]) v = photos[k];
                else if (!/^(https?:|\/uploads\/|data:)/.test(v)) v = '/uploads/' + v;
                l.src = v; delete l.nw; delete l.nh; delete l.crop; delete l.origSrc;
              } else if (m.kind === 'b') {
                const ok = T.ean13(v);
                if (ok.ok) T.setBarcode(d, l, ok.value); else { warns.push(`Satır ${i + 2} atlandı (yanlış barkod basılmasın): ${ok.error}`); bad = true; }
              }
            }
            if (bad) { prog.firstElementChild.style.width = ((i + 1) / table.rows.length) * 100 + '%'; continue; }
            R.normalize(d);
            await R.ensureImageSizes(d);
            await T.autoFixAsync(d);
            let base = String(row[nameCol] || `urun-${i + 1}`).replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 60) || `urun-${i + 1}`;
            if (used[base]) base += '-' + (++used[base]); else used[base] = 1;
            try {
              if (fmt === 'onepdf') { (box._docs = box._docs || []).push(JSON.parse(JSON.stringify(d))); }
              else if (fmt !== 'none') {
                const blob = fmt === 'pdf' ? await T.printPDF(d, d.meta && d.meta.print ? { physical: d.meta.print } : {}) : await R.exportBlob(d, fmt, 1);
                files.push({ name: `${base}.${fmt}`, data: new Uint8Array(await blob.arrayBuffer()) });
              }
              if (saveP) { const p = Object.assign(A().newProject(d.width, d.height, base), { background: d.background, layers: d.layers, meta: Object.assign({}, d.meta || {}, { series: design.name }) }); await A().saveProject(p); }
            } catch (err) { console.warn(err); warns.push(`Satır ${i + 2}: ${err.message}`); }
            prog.firstElementChild.style.width = ((i + 1) / table.rows.length) * 100 + '%';
            prog.lastElementChild.textContent = `${i + 1} / ${table.rows.length}`;
          }
          if (files.length) R.download(T.zip(files), `${(design.name || 'seri').replace(/\s+/g, '-')}-${files.length}.zip`);
          if (fmt === 'onepdf' && box._docs && box._docs.length) { prog.lastElementChild.textContent = 'PDF birleştiriliyor…'; R.download(await T.multiPagePDF(box._docs, { scale: 2 }), `${(design.name || 'seri').replace(/\s+/g, '-')}-${box._docs.length}-sayfa.pdf`); files.push(1); box._docs = []; }
          $('#bWarn', box).innerHTML = warns.length ? `<b style="color:var(--danger,#f66)">${warns.length} uyarı</b><br>${warns.slice(0, 6).map(esc).join('<br>')}` : '';
          A().toast(`${table.rows.length - warns.filter((w) => w.includes('atlandı')).length} ürün hazırlandı${files.length ? ' ve indirildi' : ''}${saveP ? ' · projelere kaydedildi' : ''}`);
          F.splashFrom(btn);
          btn.disabled = false;
        };
      },
    });
  };

  // =========================================================
  // ETİKET KONTROL LİSTESİ
  // =========================================================
  F.labelCheck = async function (doc, commit) {
    let items = [], ai = [], aiBusy = false;
    const lvIcon = { error: '<b class="lc-ic err">!</b>', warn: '<b class="lc-ic warn">?</b>', ok: '<b class="lc-ic ok">✓</b>' };
    await A().dialog(`<div class="d-body lc"><h3>${icon('list')} Etiket kontrol listesi</h3>
      <div class="lc-size"><span>Baskı ölçüsü</span><input class="inp" id="lcW" type="number" min="5" step="0.5" placeholder="genişlik"><b>×</b><input class="inp" id="lcH" type="number" min="5" step="0.5" placeholder="yükseklik"><span class="muted">mm</span></div>
      <div id="lcList" class="lc-list"><span class="ink-dots"><i></i><i></i><i></i></span></div>
      <p class="muted lc-note">Bu liste yardımcı bir ön kontroldür, hukuki onay yerine geçmez. Satışa çıkmadan önce yönetmeliğe ve gerekirse bir uzmana danış.</p></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="lcAI">${icon('sparkle')}<span>Yapay zekayla da kontrol et</span></button></div>`, {
      onOpen: (box) => {
        const W = $('#lcW', box), H = $('#lcH', box), list = $('#lcList', box);
        const pr = (doc.meta && doc.meta.print) || null;
        if (pr) { W.value = pr.wmm; H.value = pr.hmm; }
        const setSize = (from) => {
          const w = +W.value, h = +H.value;
          if (from === 'w' && w > 0) H.value = +(w * doc.height / doc.width).toFixed(1);
          if (from === 'h' && h > 0) W.value = +(h * doc.width / doc.height).toFixed(1);
          if (+W.value > 0) { doc.meta = doc.meta || {}; doc.meta.print = { wmm: +W.value, hmm: +H.value }; commit && commit(); run(); }
        };
        W.onchange = () => setSize('w'); H.onchange = () => setSize('h');
        const draw = () => {
          const ord = { error: 0, warn: 1, ok: 2 };
          const all = [...items, ...ai].sort((a, b) => ord[a.level] - ord[b.level]);
          const cnt = (lv) => all.filter((x) => x.level === lv).length;
          list.innerHTML = `<div class="lc-sum"><span class="err">${cnt('error')} hata</span><span class="warn">${cnt('warn')} uyarı</span><span class="ok">${cnt('ok')} uygun</span>${aiBusy ? '<span class="muted">yapay zeka okuyor… <span class="ink-dots"><i></i><i></i><i></i></span></span>' : ''}</div>` +
            all.map((x, i) => `<div class="lc-it ${x.level}">${lvIcon[x.level]}<div><b>${esc(x.title)}</b>${x.detail ? `<p>${esc(x.detail)}</p>` : ''}<small>${x.src === 'kural' ? 'kural' : 'yapay zeka'}${x.layer ? ' · ' + esc(x.layer) : ''}</small></div>${(x.fixUpper || x.fixMin || x.fixBc || (x.find && x.replace)) ? `<button class="btn sm primary" data-fix="${i}">Düzelt</button>` : x.askSize ? '' : ''}</div>`).join('');
          $$('[data-fix]', list).forEach((b) => (b.onclick = () => { fix(all[+b.dataset.fix]); }));
        };
        const byName = (n) => doc.layers.find((l) => l.type === 'text' && l.name === n);
        const fix = (x) => {
          if (x.fixUpper) { const l = doc.layers.find((q) => q.id === x.fixUpper.id); if (l) x.fixUpper.words.forEach((w) => { l.text = l.text.replace(new RegExp('(^|[^\\p{L}])(' + w + ')(?=[^\\p{L}]|$)', 'giu'), (m, a, b) => a + b.toLocaleUpperCase('tr-TR')); }); }
          else if (x.fixBc) { const l = doc.layers.find((q) => q.id === x.fixBc.id); if (l) { T.scaleBarcode(doc, l, x.fixBc.wpx); R.normalize(doc); } }
          else if (x.fixMin) x.fixMin.ids.forEach((id) => { const l = doc.layers.find((q) => q.id === id); if (l) { l.fontSize = Math.max(l.fontSize, x.fixMin.fs); R.layoutText(l); } });
          else if (x.find) {
            const targets = x.layer && byName(x.layer) ? [byName(x.layer)] : doc.layers.filter((l) => l.type === 'text');
            let n = 0; targets.forEach((l) => { if (String(l.text).includes(x.find)) { l.text = l.text.split(x.find).join(x.replace); R.layoutText(l); n++; } });
            if (!n) return A().toast('Bu metin düzenlenebilir katmanlarda bulunamadı (fotoğrafın içinde olabilir)', true);
          }
          ai = ai.filter((q) => q !== x);
          commit && commit(); A().toast('Düzeltildi'); run();
        };
        const run = async () => { items = await T.labelCheck(doc); draw(); };
        $('#lcAI', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true; aiBusy = true; draw();
          try {
            const sc = Math.min(2, 1568 / Math.max(doc.width, doc.height));
            const c = await R.exportCanvas(doc, sc, '#ffffff');
            const p = doc.meta && doc.meta.print;
            const r = await A().api('label-check', { body: { data: c.toDataURL('image/jpeg', 0.9), size: p ? `${p.wmm} × ${p.hmm} mm` : '', texts: doc.layers.filter((l) => l.type === 'text').map((l) => ({ name: l.name, text: l.text })) } });
            ai = (r.items || []).map((x) => Object.assign(x, { src: 'ai' }));
            const order = { error: 0, warn: 1, ok: 2 };
            ai.sort((a, b) => order[a.level] - order[b.level]);
          } catch (er) { A().toast(er.message, true); }
          aiBusy = false; btn.disabled = false; draw();
        };
        run();
      },
    });
  };

  // =========================================================
  // MATBAA ÇIKTISI
  // =========================================================
  F.printDialog = async function (doc, commit) {
    doc.meta = doc.meta || {};
    const pr = doc.meta.print || { wmm: Math.round((doc.width / 150) * 25.4), hmm: Math.round((doc.height / 150) * 25.4) };
    const die = Object.assign({ shape: 'none', rmm: 3, offmm: 0 }, doc.meta.die || {});
    const st = Object.assign({ bleed: 3, dpi: 300, marks: true, cmyk: false, out: 'raster' }, (() => { try { return JSON.parse(localStorage.getItem('ts_print') || '{}'); } catch (e) { return {}; } })());
    const name = String(doc.name || (A().S.project && A().S.project.name) || 'baski').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'baski';
    await A().dialog(`<div class="d-body"><h3>${icon('cut')} Matbaa çıktısı</h3>
      <div class="pd-grid">
        <label>Genişlik (mm)<input class="inp" id="pW" type="number" step="0.5" min="5" value="${pr.wmm}"></label>
        <label>Yükseklik (mm)<input class="inp" id="pH" type="number" step="0.5" min="5" value="${pr.hmm}"></label>
      </div>
      <div class="pd-opt">
        <b style="font-size:13px">Kesim hattı (bıçak izi)</b>
        <div class="seg die-row">${[['none', 'Yok'], ['rect', 'Dikdörtgen'], ['rounded', 'Yuvarlak köşe'], ['ellipse', 'Oval / daire']].map(([v, t]) => `<button data-die="${v}" class="${die.shape === v ? 'on' : ''}">${t}</button>`).join('')}</div>
        <div class="pd-grid" id="dieOpts"><label>Köşe yarıçapı (mm)<input class="inp" id="pR" type="number" step="0.5" min="0" value="${die.rmm}"></label><label>İçeri kaydır (mm)<input class="inp" id="pO" type="number" step="0.5" min="0" value="${die.offmm}"></label></div>
        <small class="muted">Kesim hattı PDF'e “CutContour” özel rengiyle vektör çizgi olarak eklenir; etiket kesen plotter/matbaa makineleri bunu tanır. Editörde turkuaz kesikli çizgi olarak görünür.</small>
        <b style="font-size:13px;margin-top:6px">Baskı</b>
        <div class="exp-row"><span>Taşma payı</span><div class="seg">${[0, 2, 3, 5].map((v) => `<button data-bl="${v}" class="${st.bleed === v ? 'on' : ''}">${v} mm</button>`).join('')}</div></div>
        <div class="exp-row"><span>Çözünürlük</span><div class="seg">${[150, 300, 600].map((v) => `<button data-dp="${v}" class="${st.dpi === v ? 'on' : ''}">${v} dpi</button>`).join('')}</div></div>
        <label class="switch"><input type="checkbox" id="pM" ${st.marks ? 'checked' : ''}>Kesim işaretleri</label>
        <label class="switch"><input type="checkbox" id="pC" ${st.cmyk ? 'checked' : ''}>CMYK PDF (matbaa istiyorsa)</label>
        <small class="muted" id="pCm" ${st.cmyk ? '' : 'hidden'}>Basit dönüşüm yapılır (renk profili yok). Parlak RGB renkler — özellikle neon pembe, yeşil, mavi — baskıda daha mat çıkabilir. Kritik renklerde matbaadan prova iste.</small>
        <b style="font-size:13px;margin-top:6px">Dosya türü</b>
        <div class="seg die-row">${[['raster', 'Baskı PDF\'i (önerilen)'], ['vector', 'Vektör PDF (yazdır penceresi)']].map(([v, t]) => `<button data-out="${v}" class="${st.out === v ? 'on' : ''}">${t}</button>`).join('')}</div>
        <small class="muted" id="pOutHint"></small>
      </div>
      <div class="exp-sum" id="pSum" style="margin-top:10px"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="pGo">${icon('download')}<span>PDF oluştur</span></button></div>`, {
      onOpen: (box, close) => {
        const W = $('#pW', box), H = $('#pH', box);
        const save = () => {
          doc.meta.print = { wmm: +(+W.value).toFixed(2), hmm: +(+H.value).toFixed(2) };
          doc.meta.die = die.shape === 'none' ? undefined : { ...die, wmm: doc.meta.print.wmm };
          if (!doc.meta.die) delete doc.meta.die;
          commit && commit();
          try { localStorage.setItem('ts_print', JSON.stringify(st)); } catch (e) {}
          sumDraw();
        };
        const sumDraw = () => {
          const ppm = doc.width / +W.value, eff = Math.round(ppm * 25.4);
          $('#dieOpts', box).hidden = die.shape === 'none';
          $('#pR', box).parentElement.hidden = die.shape !== 'rounded';
          $('#pCm', box).hidden = !st.cmyk;
          $('#pOutHint', box).textContent = st.out === 'vector' ? 'Yazılar ve şekiller vektör kalır (sonsuz net). Açılan pencerede hedef olarak “PDF olarak kaydet” seç. Kesim hattı ve CMYK bu modda eklenmez.' : 'Tek dosya: taşma payı, kesim işaretleri, kesim hattı ve CMYK seçenekleriyle.';
          const low = eff < 150;
          $('#pSum', box).innerHTML = `<b>${W.value} × ${H.value} mm</b><span>tasarımın etkin çözünürlüğü ≈ ${eff} dpi${low ? ' — <b style="color:var(--yellow)">düşük</b>; fotoğraflar baskıda yumuşak görünebilir' : ''}</span>`;
        };
        W.onchange = () => { H.value = +((+W.value * doc.height) / doc.width).toFixed(1); save(); };
        H.onchange = () => { W.value = +((+H.value * doc.width) / doc.height).toFixed(1); save(); };
        $('#pR', box).onchange = (e) => { die.rmm = +e.target.value; save(); };
        $('#pO', box).onchange = (e) => { die.offmm = +e.target.value; save(); };
        $$('[data-die]', box).forEach((b) => (b.onclick = () => { die.shape = b.dataset.die; $$('[data-die]', box).forEach((x) => x.classList.toggle('on', x === b)); save(); }));
        $$('[data-bl]', box).forEach((b) => (b.onclick = () => { st.bleed = +b.dataset.bl; $$('[data-bl]', box).forEach((x) => x.classList.toggle('on', x === b)); save(); }));
        $$('[data-dp]', box).forEach((b) => (b.onclick = () => { st.dpi = +b.dataset.dp; $$('[data-dp]', box).forEach((x) => x.classList.toggle('on', x === b)); save(); }));
        $$('[data-out]', box).forEach((b) => (b.onclick = () => { st.out = b.dataset.out; $$('[data-out]', box).forEach((x) => x.classList.toggle('on', x === b)); save(); }));
        $('#pM', box).onchange = (e) => { st.marks = e.target.checked; save(); };
        $('#pC', box).onchange = (e) => { st.cmyk = e.target.checked; save(); };
        $('#pGo', box).onclick = async (e) => {
          save();
          const btn = e.currentTarget;
          if (st.out === 'vector') {
            try { await T.vectorPrint(doc, { wmm: +W.value, hmm: +H.value, bleedMM: st.bleed }); } catch (er) { A().toast(er.message, true); }
            return;
          }
          btn.disabled = true; btn.lastChild.textContent = 'Hazırlanıyor…';
          try {
            const blob = await T.printPDF(doc, { bleedMM: st.bleed, dpi: st.dpi, marks: st.marks, physical: doc.meta.print, die: doc.meta.die, cmyk: st.cmyk });
            R.download(blob, `${name}-${W.value}x${H.value}mm${st.cmyk ? '-CMYK' : ''}.pdf`);
            F.splashFrom(btn); A().toast(`PDF hazır · ${(blob.size / 1024 / 1024).toFixed(1)} MB`);
          } catch (er) { A().toast('PDF oluşturulamadı: ' + er.message, true); }
          btn.disabled = false; btn.lastChild.textContent = 'PDF oluştur';
        };
        sumDraw();
      },
    });
  };

  // =========================================================
  // AMBALAJ ÖNİZLEME
  // =========================================================
  F.mockupDialog = async function (doc, init) {
    const st = { kind: init || 'jar', bg: '#E9E4DC', lid: '#2A2A2E', product: '#7A2E2E' };
    let label = null, out = null;
    const name = String(doc.name || (A().S.project && A().S.project.name) || 'ambalaj').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'ambalaj';
    await A().dialog(`<div class="d-body"><h3>${icon("jar")} Ürün maketi: ambalaj, telefon, poster, çanta…</h3>
      <div class="mk-tabs seg">${[['jar', 'Kavanoz'], ['pouch', 'Doypack poşet'], ['box', 'Kutu'], ...((window.P6 && window.P6.MOCK_KINDS) || [])].map(([k, t]) => `<button data-mk="${k}" class="${st.kind === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="mk-stage" id="mkStage"><span class="ink-dots"><i></i><i></i><i></i></span></div>
      <div class="iconrow" style="margin-top:10px;flex-wrap:wrap">
        <label class="color" style="flex:none;width:auto"><input type="color" id="mkBg" value="${st.bg}"><span>Zemin</span></label>
        <label class="color mk-jar" style="flex:none;width:auto"><input type="color" id="mkLid" value="${st.lid}"><span>Kapak</span></label>
        <label class="color mk-jar" style="flex:none;width:auto"><input type="color" id="mkPr" value="${st.product}"><span>Ürün rengi</span></label>
      </div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="mkSave">${icon('upload')}<span>Fotoğraflarıma ekle</span></button><button class="btn primary" id="mkDl">${icon('download')}<span>PNG indir</span></button></div>`, {
      onOpen: async (box) => {
        const stage = $('#mkStage', box);
        const draw = () => {
          if (!label) return;
          $$('.mk-jar', box).forEach((e) => (e.hidden = !['jar', 'bottle', 'bag'].includes(st.kind)));
          out = T.mockup(st.kind, label, st);
          stage.innerHTML = ''; stage.appendChild(out);
          M.animate(out, { opacity: [0, 1], scale: [0.98, 1] }, { stiffness: 260, damping: 26 });
        };
        try {
          const sc = Math.min(3, 1400 / Math.max(doc.width, doc.height));
          label = await R.exportCanvas(doc, sc, '#ffffff');
        } catch (e) { stage.textContent = 'Tasarım çizilemedi: ' + e.message; return; }
        draw();
        $$('[data-mk]', box).forEach((b) => (b.onclick = () => { st.kind = b.dataset.mk; $$('[data-mk]', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
        let t = 0; const later = () => { clearTimeout(t); t = setTimeout(draw, 120); };
        $('#mkBg', box).oninput = (e) => { st.bg = e.target.value; later(); };
        $('#mkLid', box).oninput = (e) => { st.lid = e.target.value; later(); };
        $('#mkPr', box).oninput = (e) => { st.product = e.target.value; later(); };
        $('#mkDl', box).onclick = async () => { const b = await new Promise((r) => out.toBlob(r, 'image/png')); R.download(b, `${name}-${st.kind}.png`); A().toast('İndirildi'); };
        $('#mkSave', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true;
          try { const r = await A().api('upload', { body: { data: out.toDataURL('image/png'), name: `${name}-${st.kind}.png` } }); F.lastMockup = r.url; A().toast('Fotoğraflarına eklendi — sosyal medya paketinde de kullanılabilir'); F.splashFrom(btn); }
          catch (er) { A().toast(er.message, true); }
          btn.disabled = false;
        };
      },
    });
  };

  // =========================================================
  // SOSYAL MEDYA PAKETİ
  // =========================================================
  F.socialPack = async function (doc) {
    const st = { vis: 'jar', res: null, busy: false };
    const pname = String(doc.name || (A().S.project && A().S.project.name) || 'urun').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'urun';
    const photo = doc.layers.find((l) => l.type === 'image' && l.role === 'photo') || null;
    await A().dialog(`<div class="d-body"><h3>${icon('social')} Sosyal medya paketi</h3>
      <p class="muted">Bu üründen gönderi, hikâye ve yatay paylaşım görseli + açıklama metni hazırlanır.</p>
      <div class="exp-row"><span>Görsel</span><div class="seg">${[['jar', 'Kavanoz'], ['pouch', 'Poşet'], ['box', 'Kutu'], ['label', 'Etiketin kendisi'], ...(photo ? [['photo', 'Ürün fotoğrafı']] : [])].map(([k, t]) => `<button data-vis="${k}" class="${st.vis === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div id="spOut" style="margin-top:12px"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="spSave" disabled>${icon('layers')}<span>Projelere kaydet</span></button><button class="btn primary" id="spGo">${icon('sparkle')}<span>Paketi hazırla</span></button></div>`, {
      onOpen: (box, close) => {
        const out = $('#spOut', box);
        $$('[data-vis]', box).forEach((b) => (b.onclick = () => { st.vis = b.dataset.vis; $$('[data-vis]', box).forEach((x) => x.classList.toggle('on', x === b)); }));
        const render = () => {
          const r = st.res; if (!r) return;
          out.innerHTML = `${r.note ? `<p class="muted" style="font-size:12px">${esc(r.note)}</p>` : ''}<div class="sp-grid">${r.designs.map((d, i) => `<div class="sp-card"><div class="th">${R.renderSVG(d, { fit: true, prefix: 'sp' + i })}</div><small>${esc(d.label)} · ${d.width}×${d.height}</small><div class="iconrow"><button class="btn sm" data-ed="${i}">${icon('pen')}Düzenle</button><button class="btn sm" data-dl="${i}">${icon('download')}</button></div></div>`).join('')}</div>
            <b style="display:block;margin:12px 0 6px;font-size:13px">Paylaşım açıklaması</b><textarea class="inp sp-cap" id="spCap">${esc(r.caption + '\n\n' + r.hashtags.join(' '))}</textarea>
            <div class="iconrow" style="margin-top:6px"><button class="btn sm" id="spCopy">${icon('copy')}Metni kopyala</button><button class="btn sm primary" id="spZip">${icon('download')}Hepsini ZIP indir</button></div>`;
          $$('.sp-card .th svg', out).forEach((sv) => { sv.removeAttribute('width'); sv.removeAttribute('height'); });
          M.stagger($$('.sp-card', out), { opacity: [0, 1], y: [12, 0] }, { each: 70 });
          $('#spCopy', out).onclick = async () => { try { await navigator.clipboard.writeText($('#spCap', out).value); A().toast('Kopyalandı'); } catch (e) { $('#spCap', out).select(); document.execCommand('copy'); A().toast('Kopyalandı'); } };
          $$('[data-dl]', out).forEach((b) => (b.onclick = async () => { const d = r.designs[+b.dataset.dl]; R.download(await R.exportBlob(d, 'png', 1), `${pname}-${d.key}.png`); }));
          $$('[data-ed]', out).forEach((b) => (b.onclick = async () => {
            const d = r.designs[+b.dataset.ed];
            const p = Object.assign(A().newProject(d.width, d.height, `${pname} · ${d.label}`), { background: d.background, layers: d.layers, meta: d.meta || {} });
            await A().saveProject(p); A().S.project = p; close(null); setTimeout(() => A().go('editor', p.id), 200);
          }));
          $('#spZip', out).onclick = async (e) => {
            const btn = e.currentTarget; btn.disabled = true;
            const files = [];
            for (const d of r.designs) files.push({ name: `${pname}-${d.key}-${d.width}x${d.height}.png`, data: new Uint8Array(await (await R.exportBlob(d, 'png', 1)).arrayBuffer()) });
            files.push({ name: `${pname}-aciklama.txt`, data: new TextEncoder().encode($('#spCap', out).value) });
            R.download(T.zip(files), `${pname}-sosyal-medya.zip`); F.splashFrom(btn); btn.disabled = false;
          };
          $('#spSave', box).disabled = false;
        };
        $('#spGo', box).onclick = async (e) => {
          const btn = e.currentTarget; if (st.busy) return; st.busy = true; btn.disabled = true;
          out.innerHTML = `<div class="mk-stage" style="min-height:180px"><span class="ink-dots"><i></i><i></i><i></i></span></div>`;
          try {
            const sc = Math.min(3, 1400 / Math.max(doc.width, doc.height));
            const label = await R.exportCanvas(doc, sc, '#ffffff');
            const palette = await R.extractPalette(label.toDataURL('image/jpeg', 0.85), 6).catch(() => []);
            let image = null, plate = null;
            if (st.vis === 'photo' && photo) image = photo.src;
            else {
              plate = '#ECE7E0';
              const vis = st.vis === 'label' ? label : T.mockup(st.vis, label, { bg: plate, flat: true });
              const up = await A().api('upload', { body: { data: vis.toDataURL('image/jpeg', 0.92), name: `${pname}-${st.vis}.jpg` } });
              image = up.url;
            }
            const small = await R.exportCanvas(doc, Math.min(1, 1100 / Math.max(doc.width, doc.height)), '#ffffff');
            st.res = await A().api('social-pack', { body: { texts: doc.layers.filter((l) => l.type === 'text' && !/^barcode/.test(l.role || '')).sort((a, b) => b.fontSize - a.fontSize).map((l) => l.text), palette, image, name: pname, data: small.toDataURL('image/jpeg', 0.85) } });
            st.res.designs = st.res.designs.map((d) => R.normalize(d));
            // ambalaj görseli kırpılmasın: kutuya sığdır, boşluğu aynı zemin rengiyle doldur
            for (const d of st.res.designs) {
              const im = d.layers.find((l) => l.type === 'image' && l.src === image);
              if (!im) continue;
              im.fit = 'contain';
              if (plate && st.vis !== 'label') { const i = d.layers.indexOf(im); d.layers.splice(i, 0, Object.assign({}, im, { id: R.uid(), type: 'rect', name: 'Görsel zemini', fill: plate, src: undefined, filters: undefined, mask: im.mask })); }
            }
            st.res.designs = st.res.designs.map((d) => R.normalize(d));
            for (const d of st.res.designs) { await R.ensureImageSizes(d); if (R.reflow) R.reflow(d); await T.autoFixAsync(d); }
            render();
          } catch (er) { out.innerHTML = `<p class="muted">${esc(er.message)}</p>`; }
          st.busy = false; btn.disabled = false; btn.lastChild.textContent = 'Yeniden hazırla';
        };
        $('#spSave', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true;
          for (const d of st.res.designs) await A().saveProject(Object.assign(A().newProject(d.width, d.height, `${pname} · ${d.label}`), { background: d.background, layers: d.layers, meta: d.meta || {} }));
          A().toast('3 tasarım projelere kaydedildi'); F.splashFrom(btn);
        };
      },
    });
  };

  // =========================================================
  // TELEFON BAĞLANTISI (normal + güvenli https)
  // =========================================================
  F.phoneDialog = async function (full) {
    const S = A().S;
    let info = null;
    try { info = await A().api('info'); S.lanUrls = info.urls; S.httpsUrls = info.https_urls || []; } catch (e) {}
    const http = (S.lanUrls || [])[0], https = (S.httpsUrls || [])[0];
    if (!http) return A().toast('Ağ adresi bulunamadı. Bilgisayarın Wi-Fi\'ye bağlı olduğundan emin ol.', true);
    const certUrl = http + '/api/cert';
    const onHttps = location.protocol === 'https:';
    await A().dialog(`<div class="d-body" style="text-align:center"><h3>Telefonda aç</h3>
      <div class="seg" style="margin:4px auto 12px;display:inline-flex"><button data-ph="basic" class="${full ? '' : 'on'}">Hızlı bağlantı</button><button data-ph="full" class="${full ? 'on' : ''}">Tüm özellikler</button></div>
      <div id="phB"></div></div><div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      onOpen: (box) => {
        const B = $('#phB', box);
        const qr = (u, w = 220) => `<div style="width:${w}px;margin:10px auto;background:#fff;padding:8px;border-radius:12px">${T.qrSVG(u)}</div><span class="url h-display" style="color:var(--cyan);font-size:15px;word-break:break-all">${esc(u)}</span>`;
        const draw = (mode) => {
          $$('[data-ph]', box).forEach((b) => b.classList.toggle('on', b.dataset.ph === mode));
          if (mode === 'basic') { B.innerHTML = qr(http, 240) + `<p class="muted" style="font-size:12.5px;margin-top:10px">Telefon kamerasıyla okut. Aynı Wi‑Fi'de olmalısın. Bu bağlantıda sesle yazma ve “Paylaş” düğmesi çalışmayabilir — onlar için “Tüm özellikler”.</p>`; return; }
          if (!https) { B.innerHTML = `<p class="muted">Güvenli bağlantı bu bilgisayarda açılamadı. Stüdyoyu yeniden başlat; sorun sürerse siyah penceredeki mesaja bak.</p>`; return; }
          B.innerHTML = `<div class="cert-box" style="text-align:left">
              <b>1 · Güvenlik sertifikasını telefona kur</b> <span class="muted">(yalnızca bir kez)</span>
              ${qr(certUrl, 170)}
              <ol><li><b>Android:</b> Okutunca dosya iner. Ayarlar → Güvenlik → Diğer güvenlik ayarları → <i>Sertifika yükle</i> → <i>CA sertifikası</i> → indirilen “TasarimStudyosu-CA” dosyasını seç.</li>
              <li><b>iPhone:</b> Safari'de aç → “Profil indirildi”. Ayarlar → <i>Profil İndirildi</i> → Yükle. Sonra Ayarlar → Genel → Hakkında → <i>Sertifika Güven Ayarları</i> → “Tasarim Studyosu” anahtarını aç.</li></ol>
              <p class="muted" style="font-size:12px;margin:6px 0 0">Bu sertifika yalnızca bu bilgisayardaki stüdyoya güvenli bağlanmak içindir; internete bir şey göndermez. İstediğin zaman aynı menüden kaldırabilirsin.</p></div>
            <div class="cert-box" style="text-align:left;margin-top:10px"><b>2 · Güvenli adresi aç</b>${qr(https, 200)}
              <p class="muted" style="font-size:12px;margin:6px 0 0">Artık mikrofonla yazma, Paylaş menüsü ve “Ana ekrana ekle” tam çalışır. Windows'ta ilk sefer “telefon-izni-ver.bat”ı çalıştırmayı unutma.</p></div>
            ${onHttps ? '<p class="muted" style="font-size:12px">Şu an güvenli bağlantıdasın ✓</p>' : ''}`;
        };
        $$('[data-ph]', box).forEach((b) => (b.onclick = () => draw(b.dataset.ph)));
        draw(full ? 'full' : 'basic');
      },
    });
  };

  // =========================================================
  // ŞABLON GALERİSİ (Canva tarzı)
  // =========================================================
  const brandP = () => (window.P5 && window.P5.brandPalette && window.P5.brandPalette()) || null;
  const instOf = (t, pi, size) => { const L = window.Library, bp = pi === 'custom' && F._customP ? F._customP : pi === 'brand' && brandP() ? brandP() : null; if (pi === 'custom' && bp && t.buildAt) return L.instantiateAt(t, 0, bp, (size || [t.w, t.h])[0], (size || [t.w, t.h])[1]); return size && t.buildAt && L.instantiateAt ? L.instantiateAt(t, bp ? 0 : +pi || 0, bp, size[0], size[1]) : bp ? L.instantiate(t, 0, bp) : L.instantiate(t, +pi || 0); };
  F.instOf = instOf;
  // favori ve son kullanılan şablonlar (bu cihazda saklanır)
  const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  F.favs = () => LS.get('ts_tfav', []);
  F.toggleFav = (id) => { const f = F.favs(), i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.unshift(id); LS.set('ts_tfav', f); return i < 0; };
  F.recents = () => LS.get('ts_trecent', []);
  const noteRecent = (id) => { LS.set('ts_trecent', [id, ...F.recents().filter((x) => x !== id)].slice(0, 12)); const c = LS.get('ts_tcount', {}); c[id] = (c[id] || 0) + 1; LS.set('ts_tcount', c); };
  F.useLibraryTemplate = async function (t, pi, size) {
    noteRecent(t.id);
    if (t.buildAt && window.Food) await window.Food.load();
    if (t.buildAt && window.Food && window.Food.loadCharity && /Bağış|Eğitim/.test(t.cat || '')) { const tm = setTimeout(() => A().toast('Tasarımın yazı tipleri yükleniyor…'), 700); await window.Food.loadCharity(); clearTimeout(tm); }
    let d = instOf(t, pi, size);
    // Hayırlı haftalar: “Bu hafta” kutusunu yaklaşan mübarek gün ve hicri tarihle doldur
    if (t.id === 'b-hafta' && window.P7 && window.P7.nextFor && pi !== 'custom' && pi !== 'brand') { const ev = window.P7.nextFor('b-hafta'); if (ev && ev.patch) { const sz = size || [t.w, t.h]; try { const d2 = window.Library.instantiateAt(t, +pi || 0, null, sz[0], sz[1], undefined, ev.patch); if (d2) { d = d2; F._autoDay = ev; } } catch (e) {} } }
    // kandil şablonları: o kandilin bu yılki / gelecek tarihi ve hicri tarihi
    if (/^b-kandil-/.test(t.id) && window.P7 && pi !== 'custom' && pi !== 'brand') { const nm = { mevlid: 'Mevlid', regaip: 'Regaip', mirac: 'Miraç', berat: 'Berat' }[t.id.slice(9)]; const y = new Date().getFullYear(), now = new Date().toISOString().slice(0, 10); const ev = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].find((e) => e.date >= now && e.name.startsWith(nm)); if (ev) { const M = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], dd = new Date(ev.date + 'T12:00'), hj = window.P7.hijriLabel ? window.P7.hijriLabel(ev.date) : ''; const sz = size || [t.w, t.h]; try { const d2 = window.Library.instantiateAt(t, +pi || 0, null, sz[0], sz[1], undefined, { date: `${dd.getDate()} ${M[dd.getMonth()]} ${dd.getFullYear()} gecesi${hj ? '\n' + hj.replace(/ /g, '\u00A0') : ''}` }); if (d2) d = d2; } catch (e) {} } }
    // Hayırlı Cumalar: önümüzdeki cuma tarihi + her hafta sıradaki söz
    if (t.id === 'b-cuma' && window.P8 && pi !== 'custom' && pi !== 'brand') { const sz = size || [t.w, t.h]; try { const d2 = window.Library.instantiateAt(t, +pi || 0, null, sz[0], sz[1], undefined, window.P8.cumaPatch()); if (d2) d = d2; } catch (e) {} }
    const p = Object.assign(A().newProject(d.width, d.height, d.name), { background: d.background, layers: d.layers, meta: d.meta });
    R.normalize(p);
    let filled = 0;
    // bağış tasarımları kendi yazılarıyla açılır (marka ürün bilgisi üzerine yazılmaz)
    const charity = /Bağış|Eğitim/.test(t.cat || '');
    if (window.P7 && window.P7.locked() && !charity && brandP() && t.buildAt && (pi == null || pi === 0)) { const d2 = instOf(t, 'brand', size); if (d2) { p.layers = d2.layers; p.background = d2.background; p.meta = d2.meta; R.normalize(p); } }
    if (window.P7) window.P7.applyBrand(p);
    if (window.P7 && charity) { const bar = p.layers.find((l) => l.progress); void bar; }
    await R.ensureDocFonts(p).catch(() => {}); try { R.fitUnbreakable(p); } catch (e) {}
    if (window.Coach) { if (!charity) filled = window.Coach.fillInfo(p, { quiet: true }); if (t.food) await window.Coach.autoPolish(p).catch(() => {}); }
    await R.ensureImageSizes(p).catch(() => {});
    A().S.project = p;
    await A().saveProject(p);
    F._openForm = true;
    A().go('editor', p.id);
    if (matchMedia('(max-width: 820px)').matches) { F._autoDay = null; return; }
    if (F._autoDay && t.id === 'b-hafta') { const ev = F._autoDay; F._autoDay = null; setTimeout(() => A().toast(`“${ev.name}” (${ev.date.split('-').reverse().join('.')}) için hazırlandı. Yazıları ⋯ → Yazıları düzenle ile değiştirebilirsin.`), 900); return; }
    setTimeout(() => A().toast(t.anim ? 'Hareketli şablon açıldı: yazıları değiştir, sonra ⋯ → Animasyon ve video ile MP4 indir' : (charity ? 'Şablon açıldı. Yazıyı değiştirmek için iki kez dokun ya da ⋯ → Yazıları düzenle. Resmi değiştirmek için resme dokun → “Değiştir”.' : (filled ? `Şablon açıldı, ${filled} yazı ürün bilgilerinle dolduruldu. Yazıya` : 'Şablon açıldı: yazıya') + ' iki kez dokunup değiştir, fotoğrafı seçip “Görseli değiştir” de')), 700);
  };
  F.templateThumb = function (t, pi, maxW = 300, size) {
    const d = R.normalize(instOf(t, pi, size));
    d.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
    return R.renderSVG(d, { fit: true, prefix: 'lt' + t.id.replace(/\W/g, '') + pi + '_' + Math.random().toString(36).slice(2, 6) });
  };

  // ---------- ürün / fotoğraf yükle: arka planı sil, ne olduğunu tanı, tüm şablonlarda kullan
  const imgSize = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res([im.naturalWidth, im.naturalHeight]); im.onerror = () => res([800, 800]); im.src = src; });
  const small = (src, n = 512) => new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { const k = Math.min(1, n / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); try { res(c.toDataURL('image/jpeg', 0.85)); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = src; });
  F.productFromFile = async function (file, onStep) {
    const TH = window.FoodTheme, step = (t) => onStep && onStep(t);
    step('Fotoğraf yükleniyor…');
    const up = await A().uploadFile(file); let src = up.url, cut = false;
    step('Arka plan siliniyor…');
    // kenarları tek renkli (stüdyo / düz zemin) fotoğraflarda dekupe et; karmaşık zeminde fotoğrafı olduğu gibi kullan
    const plainBg = await new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { const n = 64, c = document.createElement('canvas'); c.width = n; c.height = n; const x = c.getContext('2d'); x.drawImage(im, 0, 0, n, n); const d = x.getImageData(0, 0, n, n).data; const px = []; for (let i = 0; i < n; i++) [[i, 0], [i, n - 1], [0, i], [n - 1, i]].forEach(([a, b]) => { const k = (b * n + a) * 4; if (d[k + 3] > 200) px.push([d[k], d[k + 1], d[k + 2]]); }); if (px.length < n) return res(true); const m = [0, 1, 2].map((j) => px.reduce((s2, p2) => s2 + p2[j], 0) / px.length); const sd = Math.sqrt(px.reduce((s2, p2) => s2 + (p2[0] - m[0]) ** 2 + (p2[1] - m[1]) ** 2 + (p2[2] - m[2]) ** 2, 0) / px.length); res(sd < 38); } catch (e) { res(false); } }; im.onerror = () => res(false); im.src = src; });
    if (plainBg) try { const rb = await T.removeBackground(src, 38, 2); if (rb && rb.removed > 0.08 && rb.removed < 0.92) { const u2 = await A().api('upload', { body: { data: rb.dataURL, name: 'urun-dekupe.png' } }); src = u2.url; cut = true; } } catch (e) {}
    const [nw, nh] = await imgSize(src);
    step('Ürün tanınıyor…');
    let cat = null, texts = null, food = null;
    try {
      const data = await small(up.url);
      if (data && TH) { const cats = Object.fromEntries(Object.entries(TH.CATS).map(([k, v]) => [k, v.label])); const r = await A().api('product-id', { body: { data, name: file.name, cats } }); if (r && r.category) { cat = r.category; texts = r; food = r.food; } }
    } catch (e) {}
    if (!cat && TH) cat = TH.classifyText(file.name) || (await TH.guessImage(src)).cat || 'genel';
    const isFood = food != null ? food : !/kozmetik|giyim|ayakkabi|canta|taki|elektronik|ev|temizlik|oyuncak|cicek|genel|ramazan|kurban|egitim|bagis/.test(cat);
    const prod = { src, nw, nh, cut, cat, texts: texts && texts.title ? { title: texts.title || texts.name, tag: texts.tag, sub: texts.sub, script: texts.script, cta: texts.cta, feats: texts.feats } : null, food: isFood, ai: !!texts, name: file.name };
    F.setProduct(prod);
    return prod;
  };
  F.setProduct = function (p) {
    if (window.Food) window.Food.product = p || undefined;
    try { if (p) localStorage.setItem('ts_product', JSON.stringify(p)); else localStorage.removeItem('ts_product'); } catch (e) {}
  };
  try { const sp = JSON.parse(localStorage.getItem('ts_product') || 'null'); if (sp && window.Food) window.Food.product = sp; } catch (e) {}
  // galeri üst şeridi: ürün yükle / kategori seç / kaldır
  function prodBar(box, redraw) {
    const el = $('#tgProd', box), TH = window.FoodTheme; if (!el || !TH) return;
    const p = window.Food && window.Food.product;
    if (!p) {
      el.innerHTML = `<button class="tp-up" id="tpUp">${icon('upload')}<span><b>Ürününü ya da fotoğrafını yükle</b><small>Tüm şablonlar senin görselinle gelsin: arka planı silinir, ne olduğu tanınır, yazılar ona göre değişir</small></span></button>`;
    } else {
      const keys = Object.keys(TH.CATS);
      el.innerHTML = `<div class="tp-on"><img src="${esc(p.src)}" alt=""><div class="tp-txt"><b>${esc((p.texts && p.texts.title) || TH.CATS[p.cat]?.label || 'Ürünün')}</b><small>${p.ai ? 'Yapay zekâ tanıdı' : 'Tahmin edildi'} · yanlışsa türünü seç</small></div>
        <select class="inp sm" id="tpCat">${keys.map((k) => `<option value="${k}" ${k === p.cat ? 'selected' : ''}>${esc(TH.CATS[k].label)}</option>`).join('')}</select>
        <button class="btn ghost sm" id="tpNew">${icon('upload')}Değiştir</button><button class="btn ghost sm icon" id="tpX" title="Kaldır">${icon('x')}</button></div>`;
    }
    const up = $('#tpUp', el) || $('#tpNew', el);
    if (up) up.onclick = () => A().pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      el.innerHTML = `<div class="tp-busy"><span class="spin"></span><span id="tpStep">Hazırlanıyor…</span></div>`;
      try { await F.productFromFile(f, (t) => { const s2 = $('#tpStep', el); if (s2) s2.textContent = t; }); } catch (e) { A().toast(e.message, true); }
      prodBar(box, redraw); redraw();
    }, false);
    const cs = $('#tpCat', el); if (cs) cs.onchange = () => { const q = Object.assign({}, window.Food.product, { cat: cs.value, texts: null, food: !/kozmetik|giyim|ayakkabi|canta|taki|elektronik|ev|temizlik|oyuncak|cicek|genel|ramazan|kurban|egitim|bagis/.test(cs.value) }); F.setProduct(q); prodBar(box, redraw); redraw(); };
    const x = $('#tpX', el); if (x) x.onclick = () => { F.setProduct(null); prodBar(box, redraw); redraw(); };
  }
  F.templateGallery = async function (cat, gopts = {}) {
    F._customP = gopts.customP || null;
    const L = window.Library;
    if (window.Food) await Promise.race([window.Food.load(), new Promise((r) => setTimeout(r, 2500))]);
    let mine = [];
    try { mine = await A().api('templates'); } catch (e) {}
    const st = { cat: cat || L.cats[0] || 'Gıda', q: '', size: null }, BP = brandP();
    if (window.Food && window.Food.loadCharity) window.Food.loadCharity();
    const GS = [[null, 'Kendi ölçüsü'], [[1080, 1080], 'Kare'], [[1080, 1350], '4:5'], [[1080, 1920], 'Story'], [[1200, 1800], 'Trendyol'], [[1920, 600], 'Banner'], [[1240, 1754], 'A4']];
    await A().dialog(`<div class="d-body tg"><div class="tg-head"><h3>${icon('layers')} Şablonlar</h3><input class="inp tg-search" id="tgQ" placeholder="Ara: ürün, lansman, e-ticaret, indirim, menü…" autocomplete="off"></div>
      <div class="tg-cats" id="tgCats"></div><div class="tg-sizes" id="tgSz"><span>Ölçü:</span>${GS.map(([v, t], i) => `<button class="chip sm${i ? '' : ' on'}" data-sz="${v ? v.join('x') : ''}">${t}</button>`).join('')}<small class="muted">Gıda şablonları her ölçü için ayrı kurulur</small></div><div class="tg-prod" id="tgProd"></div><div class="tg-grid" id="tgGrid"></div></div>
      <div class="d-foot"><span class="muted" style="font-size:12px;margin-right:auto">Tüm şablonlar özgündür; ticari işlerinde serbestçe kullanabilirsin.</span><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'dialog-wide',
      onOpen: (box, close) => {
        const cats = ['Tümü', ...(F.favs().length ? ['★ Favoriler'] : []), ...(F.recents().length ? ['Son kullanılanlar'] : []), ...L.cats, ...(mine.length ? ['Benim şablonlarım'] : [])];
        const catsEl = $('#tgCats', box), grid = $('#tgGrid', box);
        catsEl.innerHTML = cats.map((c) => `<button class="chip ${c === st.cat ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
        const norm = (x) => String(x).toLocaleLowerCase('tr-TR');
        const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => ents.forEach((en) => {
          if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
          const t = L.templates.find((x) => x.id === el.dataset.id); if (!t) return;
          el.querySelector('.tg-th').innerHTML = F.templateThumb(t, el.dataset.p === 'brand' || el.dataset.p === 'custom' ? el.dataset.p : +el.dataset.p || 0, 300, t.buildAt ? st.size : null);
        }), { root: grid, rootMargin: '300px' }) : null;
        const draw = () => {
          let list = L.templates.filter((t) => (st.cat === 'Tümü' || t.cat === st.cat || (st.cat === 'Hareketli' && t.anim)));
          if (st.cat === '★ Favoriler' || st.cat === 'Son kullanılanlar') { const ids = st.cat === '★ Favoriler' ? F.favs() : F.recents(); list = ids.map((id) => L.templates.find((t) => t.id === id)).filter(Boolean); }
          if (st.cat === 'Tümü') { const pr = (t) => (t.cat === 'Bağış · Kampanya' ? -1 : t.cat === 'Gıda' ? 0 : t.cat === 'Ürün tanıtımı' ? 1 : t.cat === 'Yemek' ? 2 : 3); list = list.slice().sort((x, y) => pr(x) - pr(y)); }
          if (st.q) list = L.templates.filter((t) => norm(t.name + ' ' + t.cat + ' ' + t.tags).includes(norm(st.q)));
          let h = '';
          if (st.cat === 'Benim şablonlarım' && !st.q) h = mine.map((t) => `<div class="tg-card mine" data-mine="${t.id}"><div class="tg-th" style="aspect-ratio:1">${t.thumb ? `<img src="${t.thumb}" alt="">` : ''}</div><div class="tg-meta"><b>${esc(t.name)}</b></div></div>`).join('');
          else h = list.map((t) => `<div class="tg-card" data-id="${t.id}" data-p="${F._customP && t.buildAt ? 'custom' : '0'}"><button class="tg-fav${F.favs().includes(t.id) ? ' on' : ''}" data-fav="${t.id}" title="Favorilere ekle" aria-label="Favori">★</button><div class="tg-th" style="aspect-ratio:${t.buildAt && st.size ? st.size[0] + '/' + st.size[1] : t.w + '/' + t.h}"></div><div class="tg-meta"><b>${esc(t.name)}${t.anim ? ' <span class="tg-motion" title="Hareketli: Animasyon ve video ile MP4 indir">▶ Hareketli</span>' : ''}</b><small>${esc(t.cat)} · ${t.w}×${t.h}</small><span class="tg-sw">${t.palettes.map((p, i) => `<i data-pi="${i}" class="${i === 0 ? 'on' : ''}" style="background:linear-gradient(135deg,${p.bg} 50%,${p.a} 50%)" title="Renk ${i + 1}"></i>`).join('')}${BP ? `<i data-pi="brand" class="brand" style="background:linear-gradient(135deg,${BP.bg} 50%,${BP.a} 50%)" title="Marka renklerim"></i>` : ''}</span></div></div>`).join('');
          grid.innerHTML = h || '<p class="muted" style="grid-column:1/-1">Bu aramayla eşleşen şablon yok.</p>';
          $$('.tg-card[data-id]', grid).forEach((c) => { if (io) io.observe(c); else c.querySelector('.tg-th').innerHTML = F.templateThumb(L.templates.find((x) => x.id === c.dataset.id), 0); });
          M.stagger($$('.tg-card', grid).slice(0, 12), { opacity: [0, 1], y: [10, 0] }, { each: 30 });
        };
        $('#tgSz', box).onclick = (e) => { const b = e.target.closest('[data-sz]'); if (!b) return; st.size = b.dataset.sz ? b.dataset.sz.split('x').map(Number) : null; $$('#tgSz .chip', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        catsEl.onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; st.cat = b.dataset.c; st.q = ''; $('#tgQ', box).value = ''; $$('.chip', catsEl).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        $('#tgQ', box).oninput = (e) => { st.q = e.target.value.trim(); draw(); };
        // tasarımların yazı tipleri sonradan inerse önizlemeleri gerçek yazı tipleriyle yeniden çiz
        const onFonts = () => { if (box.isConnected) draw(); else document.removeEventListener('ts-charity-fonts', onFonts); };
        prodBar(box, () => draw());
        // yazı tipleri geç yüklendiyse önizlemeler kaymasın: yüklenince yeniden çiz
        if (window.Food) { let first = true; window.Food.load().then(() => { if (box.isConnected && !first) draw(); }); setTimeout(() => (first = false), 0); }
        document.addEventListener('ts-charity-fonts', onFonts);
        grid.onclick = async (e) => {
          const fv = e.target.closest('[data-fav]');
          if (fv) { e.stopPropagation(); const on = F.toggleFav(fv.dataset.fav); fv.classList.toggle('on', on); A().toast(on ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı'); if (!catsEl.querySelector('[data-c="★ Favoriler"]') && on) { const b = document.createElement('button'); b.className = 'chip'; b.dataset.c = '★ Favoriler'; b.textContent = '★ Favoriler'; catsEl.children[0].after(b); } if (st.cat === '★ Favoriler') draw(); return; }
          const sw = e.target.closest('[data-pi]');
          const card = e.target.closest('.tg-card');
          if (!card) return;
          if (sw) {
            e.stopPropagation();
            const t = L.templates.find((x) => x.id === card.dataset.id);
            card.dataset.p = sw.dataset.pi;
            $$('[data-pi]', card).forEach((x) => x.classList.toggle('on', x === sw));
            card.querySelector('.tg-th').innerHTML = F.templateThumb(t, sw.dataset.pi === 'brand' ? 'brand' : +sw.dataset.pi, 300, t.buildAt ? st.size : null);
            return;
          }
          if (card.dataset.mine) { close(null); F.useTemplate(card.dataset.mine); return; }
          const t = L.templates.find((x) => x.id === card.dataset.id);
          close(null);
          await F.useLibraryTemplate(t, card.dataset.p === 'brand' || card.dataset.p === 'custom' ? card.dataset.p : +card.dataset.p || 0, t.buildAt ? st.size : null);
        };
        draw();
        setTimeout(() => { if (!matchMedia('(max-width: 820px)').matches) $('#tgQ', box).focus(); }, 100);
      },
    });
  };

  // =========================================================
  // PSD / SVG İÇE AKTARMA
  // =========================================================
  F.pdfPagePicker = function (buf, name, n) {
    return new Promise((resolve) => {
      let done = false;
      A().dialog(`<div class="d-body"><h3>${icon('file')} ${esc(name)}</h3><p class="muted" style="margin:0 0 10px">${n} sayfa var. Düzenlemek istediğin sayfayı seç ya da hepsini ayrı tasarım olarak aç.</p>
        <div class="pp-grid">${Array.from({ length: Math.min(n, 60) }, (_, i) => `<button class="pp-item" data-pg="${i}"><span class="pp-thumb" id="ppt${i}"><span class="ink-dots"><i></i><i></i><i></i></span></span><small>Sayfa ${i + 1}</small></button>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="ppAll">${icon('copy')}Tüm sayfaları aç</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          $$('[data-pg]', box).forEach((b) => (b.onclick = () => { done = true; close(); resolve(+b.dataset.pg); }));
          $('#ppAll', box).onclick = () => { done = true; close(); resolve('all'); };
          (async () => { for (let i = 0; i < Math.min(n, 60); i++) { const el = $('#ppt' + i, box); if (!el || !document.body.contains(el)) return; try { const r = await window.Importers.pdfToSVG(buf, i); el.innerHTML = `<img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(r.svg)}">`; } catch (e) { el.textContent = '—'; } } })();
        },
      }).then(() => { if (!done) resolve(null); });
    });
  };
  // PDF'ten gelen tek satırlık yazılar, eksik yazı tipi yüzünden alt satıra kaymasın
  F.fixPdfText = function (layers) {
    layers.forEach((l) => {
      if (l.type !== 'text' || /\n/.test(l.text)) return;
      l.lineHeight = l.lineHeight || 1.2;
      const need = R.measure(l.uppercase ? l.text.toLocaleUpperCase('tr-TR') : l.text, l) + (l.fontSize || 12) * 0.4;
      if (need > l.w) l.w = need;
    });
  };
  F.importAllPages = async function (buf, name, n) {
    const box = document.createElement('div'); box.className = 'import-busy'; document.body.appendChild(box);
    const upload = async (data, nm) => (await A().api('upload', { body: { data, name: nm } })).url;
    let first = null; const base = name.replace(/\.[^.]+$/, ''), group = 'pdf-' + Date.now().toString(36);
    try {
      for (let i = 0; i < n; i++) {
        box.innerHTML = `<span class="ink-dots"><i></i><i></i><i></i></span><span>Sayfa ${i + 1} / ${n} açılıyor…</span>`;
        const pr = await window.Importers.pdfToSVG(buf, i);
        const res = await window.Importers.importSVG(pr.svg, upload);
        F.fixPdfText(res.layers);
        const p = Object.assign(A().newProject(res.width, res.height, `${base} — sayfa ${i + 1}`), { background: '#FFFFFF', layers: res.layers, meta: { imported: 'pdf', pdfGroup: group, page: i + 1, pages: n } });
        R.normalize(p); await R.ensureImageSizes(p).catch(() => {});
        await A().saveProject(p); if (!first) first = p;
      }
      A().S.project = first; A().go('editor', first.id);
      setTimeout(() => A().toast(`${n} sayfa ayrı tasarım olarak açıldı — hepsini tek PDF yapmak için ⋯ → PDF araçları`), 600);
    } catch (e) { A().toast('Açılamadı: ' + e.message, true); }
    finally { box.remove(); }
  };
  F.importFile = function (file) {
    const run = async (f) => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (ext === 'tasarim' && window.P5) return window.P5.importPackage(f);
      if (!['psd', 'svg', 'ai', 'pdf'].includes(ext)) return A().toast('PSD, AI, PDF, SVG ya da .tasarim dosyası seç.', true);
      let page = 0;
      if (ext === 'pdf' || ext === 'ai') {
        const buf0 = await f.arrayBuffer();
        let info; try { info = await window.Importers.pdfToSVG(buf0, 0); } catch (e) { return A().toast(e.message, true); }
        if (info.pages > 1) {
          page = await F.pdfPagePicker(buf0, f.name, info.pages);
          if (page == null) return;
          if (page === 'all') return F.importAllPages(buf0, f.name, info.pages);
        }
      }
      const box = document.createElement('div'); box.className = 'import-busy';
      box.innerHTML = `<span class="ink-dots"><i></i><i></i><i></i></span><span id="impMsg">${esc(f.name)} açılıyor…</span>`;
      document.body.appendChild(box);
      const msg = (t) => { const e = box.querySelector('#impMsg'); if (e) e.textContent = t; };
      try {
        const upload = async (data, name) => (await A().api('upload', { body: { data, name } })).url;
        let res;
        if (ext === 'psd') res = await window.Importers.importPSD(await f.arrayBuffer(), upload, (i, n) => msg(`Katmanlar okunuyor ${i} / ${n}`));
        else if (ext === 'ai' || ext === 'pdf') {
          msg('Vektörler ve yazılar okunuyor…');
          const pr = await window.Importers.pdfToSVG(await f.arrayBuffer(), page);
          res = await window.Importers.importSVG(pr.svg, upload);
          F.fixPdfText(res.layers);
          if (pr.truncated) A().toast('Dosya çok karmaşık: ilk 1500 parça aktarıldı', true);
          if (page) f = { name: f.name.replace(/\.[^.]+$/, '') + ' — sayfa ' + (page + 1) + '.' + ext };
        }
        else res = await window.Importers.importSVG(await f.text(), upload);
        if (!res.layers.length) throw new Error('Dosyada aktarılabilir katman bulunamadı');
        const p = Object.assign(A().newProject(res.width, res.height, f.name.replace(/\.[^.]+$/, '')), { background: '#FFFFFF', layers: res.layers, meta: { imported: ext === 'ai' ? 'ai' : ext } });
        R.normalize(p);
        await R.ensureImageSizes(p).catch(() => {});
        A().S.project = p;
        await A().saveProject(p);
        A().go('editor', p.id);
        const nt = res.layers.filter((l) => l.type === 'text' && l.visible !== false).length;
        setTimeout(() => A().toast(`${res.layers.length} katman açıldı${nt ? ` · ${nt} yazı düzenlenebilir` : ''}${res.notes.length ? ' · ' + res.notes[0] : ''}`), 600);
        if (nt && ext === 'psd') setTimeout(() => A().toast('Bilgisayarında olmayan yazı tipleri benzeriyle gösterilir. Aynısı için Marka → Font yükle.'), 4200);
      } catch (e) { console.error(e); A().toast('Açılamadı: ' + e.message, true); }
      finally { box.remove(); }
    };
    if (file) return run(file);
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.psd,.ai,.pdf,.svg,.tasarim,application/pdf,image/svg+xml,image/vnd.adobe.photoshop,application/postscript,application/illustrator';
    inp.onchange = () => inp.files[0] && run(inp.files[0]);
    inp.click();
  };

  // =========================================================
  // FORMATLARA UYARLAMA
  // =========================================================
  function proportional(d, w, h) {
    const n = R.normalize(JSON.parse(JSON.stringify(d)));
    const s = Math.min(w / n.width, h / n.height);
    const ox = (w - n.width * s) / 2, oy = (h - n.height * s) / 2;
    const bgL = [];
    for (const l of n.layers) {
      const full = l.x <= 1 && l.y <= 1 && l.x + l.w >= n.width - 1 && l.y + l.h >= n.height - 1;
      if (full) { l.x = 0; l.y = 0; l.w = w; l.h = h; bgL.push(l); continue; }
      l.x = l.x * s + ox; l.y = l.y * s + oy; l.w *= s; l.h *= s;
      if (l.type === 'text') { l.fontSize *= s; l.letterSpacing = (l.letterSpacing || 0) * s; }
      if (l.strokeWidth) l.strokeWidth *= s;
      if (l.radius) l.radius *= s;
    }
    const fl = n.meta && n.meta.flows;
    if (fl) Object.values(fl).forEach((x) => { x.y = x.y * s + oy; x.gap = (x.gap || 0) * s; if (x.max != null) x.max = x.max * s + oy; if (x.min != null) x.min = x.min * s + oy; });
    n.width = w; n.height = h;
    return n;
  }
  F.adaptDialog = async function (p) {
    const opts = A().FORMATS.filter((f) => !(f.w === p.width && f.h === p.height));
    const sel = await A().dialog(`<div class="d-body"><h3>Diğer formatlara uyarla</h3><p class="muted">Aynı tasarımın seçtiğin ölçülerdeki halleri ayrı projeler olarak oluşturulur.</p>
      <div class="ad-packs"><span>Hazır paketler:</span><button class="chip" data-pk="market">${icon('tag')}Pazar yeri paketi</button><button class="chip" data-pk="social">${icon('image')}Sosyal medya paketi</button><button class="chip" data-pk="print">${icon('cut')}Baskı paketi</button></div>
      <div class="fmt-checks">${opts.map((f, i) => { const sc = 26 / Math.max(f.w, f.h); return `<label class="fmt-check" data-g="${f.g || (/flyer|a5/.test(f.k) ? 'print' : 'social')}" data-k="${f.k}"><input type="checkbox" value="${i}" ${i < 3 ? 'checked' : ''}><span class="shape"><i style="width:${Math.max(6, f.w * sc)}px;height:${Math.max(6, f.h * sc)}px"></i></span><span><b>${esc(f.name)}</b><small>${f.w} × ${f.h}</small></span></label>`; }).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" id="adAll" style="margin-right:auto">Tümünü seç</button><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="adOk">${icon('copy')}Uyarla</button></div>`,
    { onOpen: (box, close) => { $('#adOk', box).onclick = () => close($$('input:checked', box).map((i) => opts[+i.value])); $('#adAll', box).onclick = () => { const all = $$('input', box), on = all.every((i) => i.checked); all.forEach((i) => (i.checked = !on)); };
      const PK = { market: ['trendyol', 'hb', 'amazon', 'n11', 'ig45'], social: ['ig', 'ig45', 'story', 'fb', 'pin', 'wa'], print: ['flyer', 'a5', 'bill'] };
      $$('[data-pk]', box).forEach((b) => (b.onclick = () => { $$('[data-pk]', box).forEach((x) => x.classList.toggle('on', x === b)); $$('.fmt-check', box).forEach((l) => (l.querySelector('input').checked = PK[b.dataset.pk].includes(l.dataset.k))); })); } });
    if (!sel || !sel.length) return;
    return F.adaptRun(p, sel);
  };
  // seçilen ölçülerde bağlı kopyalar üretir (akıllı yerleşim), sonuç penceresini gösterir
  F.adaptRun = async function (p, sel, { title } = {}) {
    A().toast('Uyarlanıyor…');
    const d = A().designOf(p);
    const r = await A().api('adapt', { body: { design: d, sizes: sel.map((f) => [f.w, f.h, f.name]) } });
    const linkG = (p.meta && p.meta.linkGroup) || 'lk' + Date.now().toString(36);
    if (!(p.meta && p.meta.linkGroup) && p.id) { p.meta = p.meta || {}; p.meta.linkGroup = linkG; try { await A().saveProject(p); } catch (e) {} }
    const made = [];
    for (let i = 0; i < sel.length; i++) {
      const f = sel[i];
      const fr = window.Food && window.Food.rebuild ? window.Food.rebuild(d, f.w, f.h) : null;
      const nd = fr || (r.designs[i] ? R.normalize(r.designs[i]) : window.P6 ? window.P6.smartResize(d, f.w, f.h) : proportional(d, f.w, f.h));
      await R.ensureImageSizes(nd);
      await T.autoFixAsync(nd);
      const np = Object.assign(A().newProject(f.w, f.h, `${p.name} · ${f.name}`), { background: nd.background, layers: nd.layers, meta: Object.assign({}, nd.meta || {}, { linkGroup: linkG }) });
      await A().saveProject(np);
      made.push(np);
    }
    await A().dialog(`<div class="d-body"><h3>${title || made.length + ' format hazır'}</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Formatlar birbirine bağlı: birinde yazıyı ya da görseli değiştirince, Editör'de <b>Diğer formatları güncelle</b> ile hepsine aktarabilirsin.</p><div class="adapt-grid">${made.map((m) => `<button class="adapt-it" data-id="${m.id}"><span class="th">${m.thumb ? `<img src="${m.thumb}" alt="">` : ''}</span><small>${esc(m.name.split(' · ').pop())}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" id="adZip" style="margin-right:auto">${icon('download')}Hepsini ZIP indir</button><button class="btn" data-close>Tamam</button></div>`, {
      onOpen: (box, close) => {
        $('#adZip', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true;
          try {
            const files = [];
            for (const m of made) { const nm = m.name.split(' · ').pop().replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-'); const jpg = m.width * m.height > 2.5e6; const b = await R.exportBlob(m, jpg ? 'jpg' : 'png', 1); files.push({ name: `${nm}-${m.width}x${m.height}.${jpg ? 'jpg' : 'png'}`, data: new Uint8Array(await b.arrayBuffer()) }); }
            R.download(T.zip(files), `${(p.name || 'tasarim').replace(/\s+/g, '-')}-formatlar.zip`); F.splashFrom(btn);
          } catch (er) { A().toast(er.message, true); }
          btn.disabled = false;
        };
        M.stagger($$('.adapt-it', box), { opacity: [0, 1], y: [12, 0], scale: [.95, 1] }, { each: 60 });
        $$('.adapt-it', box).forEach((b) => (b.onclick = () => { close(); A().go('editor', b.dataset.id); }));
      },
    });
  };

  // =========================================================
  // SEÇENEK SEÇİCİ (çoklu varyasyon)
  // =========================================================
  const LT = { center: 'Ortalı', split: 'İkiye bölünmüş', diagonal: 'Çapraz', frame: 'Çerçeveli', magazine: 'Dergi' };
  F.pickOption = function (stage, designs) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'options';
      const maxH = Math.max(160, (stage.clientHeight - 140) / (designs.length > 2 && innerWidth < 1300 ? 2 : 1));
      el.innerHTML = `<div class="opt-head"><b class="h-display">${designs.length} seçenek hazır</b><span class="muted">Beğendiğini seç, diğerleri sürümlerde kalır</span></div>
        <div class="opt-grid n${designs.length}">${designs.map((d, i) => `<button class="opt" data-i="${i}"><span class="opt-art" style="aspect-ratio:${d.width}/${d.height};max-height:${maxH}px">${R.renderSVG(d, { fit: true })}</span><span class="opt-lab"><b>Seçenek ${i + 1}</b><small>${LT[(d.meta || {}).layout] || 'Serbest'}</small></span></button>`).join('')}</div>`;
      stage.appendChild(el);
      M.animate(el, { opacity: [0, 1] }, { stiffness: 300, damping: 30 });
      M.stagger($$('.opt', el), { opacity: [0, 1], y: [24, 0], scale: [.92, 1] }, { each: 80, stiffness: 260, damping: 22 });
      $$('.opt', el).forEach((b) => (b.onclick = () => {
        $$('.opt', el).forEach((o) => o !== b && M.animate(o, { opacity: [1, 0], scale: [1, .94] }, { keep: true }));
        M.animate(b, { scale: [1, 1.04] }, { stiffness: 400, damping: 18 }).then(() => {
          M.animate(el, { opacity: [1, 0] }, { keep: true }).then(() => el.remove());
          resolve(+b.dataset.i);
        });
      }));
    });
  };

  // =========================================================
  // GÖRSELİ DOĞRUDAN DÜZENLE (yapay zekasız)
  // =========================================================
  F.editImage = async function (url, name, opts = {}) {
    const im = new Image();
    await new Promise((res, rej) => { im.onload = res; im.onerror = () => rej(new Error('Görsel açılamadı')); im.src = url; }).catch((e) => A().toast(e.message, true));
    if (!im.naturalWidth) return;
    const sc = Math.min(1, 4000 / Math.max(im.naturalWidth, im.naturalHeight));
    const w = Math.round(im.naturalWidth * sc), h = Math.round(im.naturalHeight * sc);
    const p = A().newProject(w, h, name || 'Görsel düzenleme');
    p.layers = [{ id: R.uid(), type: 'image', name: 'Görsel', src: url, x: 0, y: 0, w, h, nw: im.naturalWidth, nh: im.naturalHeight, fit: 'cover', filters: {}, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' }];
    R.normalize(p);
    A().S.project = p;
    await A().saveProject(p);
    A().go('editor', p.id);
    if (opts.decompose) setTimeout(() => { const e = A().S.editorApi; if (e && e.decompose) e.decompose(); }, 900);
  };
  F.editUpload = function () {
    A().pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      try { const r = await A().uploadFile(f); await F.editImage(r.url, f.name.replace(/\.[^.]+$/, '')); } catch (e) { A().toast(e.message, true); }
    }, false);
  };

  // =========================================================
  // İNDİRME PENCERESİ (biçim + kalite)
  // =========================================================
  F.exportDialog = async function (d) {
    const name = (d.name || (A().S.project && A().S.project.name) || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'tasarim';
    const st = Object.assign({ fmt: 'png', scale: 2, q: 92, transparent: false, dpi: 300, bleed: false }, (() => { try { return JSON.parse(localStorage.getItem('ts_export') || '{}'); } catch (e) { return {}; } })());
    const FMTS = [['png', 'PNG', 'Kayıpsız, şeffaflık destekler'], ['jpg', 'JPG', 'Küçük dosya, fotoğraflar için'], ['webp', 'WEBP', 'Web için en küçük dosya'], ['svg', 'SVG', 'Vektör — Illustrator, Figma'], ['pdf', 'PDF', 'Yazdırma ve paylaşım'], ['json', 'Proje', 'Başka stüdyoya aktarmak için']];
    await A().dialog(`<div class="d-body exp">
      <h3>İndir</h3>
      <div class="exp-fmts">${FMTS.map(([k, t, s]) => `<button class="exp-fmt" data-f="${k}"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
      <div id="expOpts"></div>
      <div class="exp-sum" id="expSum"></div>
    </div>
    <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="expGo">${icon('download')}<span>İndir</span></button></div>`, {
      onOpen: (box, close) => {
        const opts = $('#expOpts', box), sum = $('#expSum', box);
        const draw = () => {
          $$('.exp-fmt', box).forEach((b) => b.classList.toggle('on', b.dataset.f === st.fmt));
          const raster = ['png', 'jpg', 'webp'].includes(st.fmt);
          let h = '';
          if (raster) {
            h += `<div class="exp-row"><span>Çözünürlük</span><div class="seg">${[1, 2, 3, 4].map((x) => `<button data-s="${x}" class="${st.scale === x ? 'on' : ''}">${x}×</button>`).join('')}</div>
              <label class="num" style="width:130px"><b>G</b><input class="inp" type="number" id="expW" value="${Math.round(d.width * st.scale)}" min="16" max="16000"></label></div>`;
            if (st.fmt !== 'png') h += `<div class="exp-row"><span>Kalite</span><input type="range" id="expQ" min="40" max="100" value="${st.q}"><output>%${st.q}</output></div>`;
            if (st.fmt !== 'jpg') h += `<div class="exp-row"><span></span><label class="switch"><input type="checkbox" id="expT" ${st.transparent ? 'checked' : ''}>Arka planı şeffaf yap</label></div>`;
          } else if (st.fmt === 'pdf') {
            h += `<div class="exp-row"><span>Baskı kalitesi</span><div class="seg">${[[150, 'Standart · 150 dpi'], [300, 'Baskı · 300 dpi']].map(([v, t]) => `<button data-dpi="${v}" class="${st.dpi === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
              <div class="exp-row"><span></span><label class="switch"><input type="checkbox" id="expB" ${st.bleed ? 'checked' : ''}>3 mm taşma payı ve kesim işaretleri ekle (matbaa için)</label></div>
              <div class="exp-row"><span></span><button class="btn sm" id="expPrint">${icon('cut')}Matbaa çıktısı: mm ölçü, kesim hattı, CMYK…</button></div>`;
          } else if (st.fmt === 'svg') h += `<p class="muted" style="font-size:12.5px;margin:4px 0 0">Metinler düzenlenebilir kalır; görseller dosyanın içine gömülür.</p>`;
          opts.innerHTML = h;
          const W = Math.round(d.width * st.scale), H = Math.round(d.height * st.scale);
          const cm = (px) => ((px / 150) * 2.54).toFixed(1);
          const ppx = raster ? st.scale : st.fmt === 'pdf' ? st.dpi / 150 * (d.meta && d.meta.print ? 1 : 1) : 1;
          const blurry = (d.layers || []).filter((l) => l.type === 'image' && l.visible !== false && l.name !== 'Yansıma' && l.nw && l.w > 40 && l.nw / ((l.crop ? 1 / Math.max(.05, l.crop.w) : 1) * l.w * ppx) < 0.7);
          const warn = blurry.length ? `<div class="exp-warn">${icon('alert')}<span><b>${blurry.length} görsel bu çözünürlükte bulanık görünebilir</b> (${blurry.slice(0, 3).map((l) => esc(l.name || 'Görsel')).join(', ')}). Daha büyük fotoğraf kullan ya da daha düşük çözünürlükte indir.</span></div>` : '';
          sum.innerHTML = (raster ? `<b>${W} × ${H} px</b><span>${st.scale >= 2 ? 'Baskıda da net görünür' : 'Ekran ve sosyal medya için'}</span>`
            : st.fmt === 'pdf' ? `<b>${d.meta && d.meta.print ? `${d.meta.print.wmm} × ${d.meta.print.hmm} mm` : cm(d.width) + ' × ' + cm(d.height) + ' cm'}</b><span>${st.dpi} dpi${st.bleed ? ' · taşma payı + kesim işaretleri' : ''}</span>`
            : st.fmt === 'svg' ? `<b>${d.width} × ${d.height}</b><span>vektör, sınırsız ölçeklenir · yazı tipleri gömülü</span>` : `<b>.json</b><span>tüm katmanlarla</span>`) + (st.fmt === 'json' ? '' : warn);
          $$('[data-s]', opts).forEach((b) => (b.onclick = () => { st.scale = +b.dataset.s; draw(); }));
          $$('[data-dpi]', opts).forEach((b) => (b.onclick = () => { st.dpi = +b.dataset.dpi; draw(); }));
          const w = $('#expW', opts); if (w) w.onchange = () => { st.scale = Math.max(0.05, Math.min(16000 / d.width, (+w.value || d.width) / d.width)); draw(); };
          const q = $('#expQ', opts); if (q) q.oninput = () => { st.q = +q.value; q.nextElementSibling.textContent = '%' + st.q; };
          const t = $('#expT', opts); if (t) t.onchange = () => (st.transparent = t.checked);
          const b = $('#expB', opts); if (b) b.onchange = () => { st.bleed = b.checked; draw(); };
          const pp = $('#expPrint', opts); if (pp) pp.onclick = () => { close(false); setTimeout(() => F.printDialog(d), 250); };
        };
        $$('.exp-fmt', box).forEach((b) => (b.onclick = () => { st.fmt = b.dataset.f; draw(); }));
        draw();
        $('#expGo', box).onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true; btn.lastChild.textContent = 'Hazırlanıyor…';
          try { localStorage.setItem('ts_export', JSON.stringify(st)); } catch (er) {}
          try {
            let blob, ext = st.fmt;
            if (st.fmt === 'pdf') blob = await T.printPDF(d, { bleedMM: st.bleed ? 3 : 0, marks: st.bleed, dpi: st.dpi, die: d.meta && d.meta.die });
            else if (st.fmt === 'svg' || st.fmt === 'json') blob = await R.exportBlob(d, st.fmt);
            else {
              let dd = d;
              if (st.transparent) dd = Object.assign({}, d, { background: { type: 'solid', color: 'rgba(0,0,0,0)' } });
              let sc = st.scale;
              const maxSide = 12000, maxArea = 120e6;
              const lim = Math.min(maxSide / Math.max(d.width, d.height), Math.sqrt(maxArea / (d.width * d.height)));
              if (sc > lim) { sc = lim; A().toast(`Tarayıcı sınırı nedeniyle ${Math.round(d.width * sc)} × ${Math.round(d.height * sc)} px olarak indiriliyor`); }
              const c = await R.exportCanvas(dd, sc, st.fmt === 'jpg' ? '#ffffff' : null);
              blob = await new Promise((r) => c.toBlob(r, st.fmt === 'jpg' ? 'image/jpeg' : st.fmt === 'webp' ? 'image/webp' : 'image/png', st.q / 100));
            }
            R.download(blob, `${name}.${ext}`);
            F.splashFrom(btn);
            A().toast(`İndirildi · ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            setTimeout(() => close(true), 500);
          } catch (err) { A().toast('Dışa aktarılamadı: ' + err.message, true); btn.disabled = false; btn.lastChild.textContent = 'İndir'; }
        };
      },
    });
  };

  // =========================================================
  // YENİDEN TASARIM SONRASI DÜZELTMELER (kırpma payları, logo zemini)
  // =========================================================
  F.polishRedesign = async function (d) {
    if (!d || !d.meta || d.meta.mode !== 'redesign') return [];
    const notes = [];
    const area = d.width * d.height;
    const imgs = d.layers.filter((l) => l.type === 'image' && l.crop);
    const kind = (l) => {
      const n = (l.role || '') + ' ' + (l.name || '');
      if (/barcode|barkod|ean/i.test(n)) return 'barcode';
      if (/logo/i.test(n)) return 'logo';
      if (/badge|mühür|muhur|sertifika|seal|rozet/i.test(n)) return 'badge';
      if (/photo|foto|ürün|urun|product|görsel/i.test(n) || l.w * l.h > area * 0.08) return 'photo';
      return 'other';
    };
    const clamp01 = (c) => { c.x = Math.max(0, c.x); c.y = Math.max(0, c.y); c.w = Math.min(1 - c.x, c.w); c.h = Math.min(1 - c.y, c.h); };
    for (const l of imgs) {
      const k = kind(l), c = l.crop;
      if (k === 'photo') { const ix = c.w * 0.06, iy = c.h * 0.06; c.x += ix; c.y += iy; c.w -= 2 * ix; c.h -= 2 * iy; l.fit = 'cover'; notes.push('ürün fotoğrafı kenarlardaki yazılar girmesin diye içeriden kırpıldı'); }
      if (k === 'barcode') { const ex = c.w * 0.05, ey = c.h * 0.06; c.x -= ex; c.y -= ey; c.w += 2 * ex; c.h += 2 * ey; clamp01(c); l.fit = 'contain'; notes.push('barkod rakamları kesilmesin diye payla kesildi'); }
      if (k === 'logo' || k === 'badge') {
        try {
          // logonun kendi zeminini şeffaf yap
          const data = await F.layerImageData(l);
          const r = await T.removeBackground(data, 34, 1);
          if (r.removed > 0.04 && r.removed < 0.85) {
            const up = await A().api('upload', { body: { data: r.dataURL, name: 'logo.png' } });
            l.src = up.url; delete l.crop; delete l.nw; delete l.nh; l.fit = 'contain';
            notes.push((k === 'logo' ? 'logonun' : 'mührün') + ' arkasındaki zemin temizlendi');
          }
        } catch (e) { console.warn(e); }
      }
    }
    await R.ensureImageSizes(d);
    return [...new Set(notes)];
  };

  // =========================================================
  // SESLE YAZMA ve PAYLAŞMA
  // =========================================================
  F.voiceButton = function (textarea, onText) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const b = document.createElement('button');
    b.className = 'btn ghost icon mic';
    b.title = 'Sesle yaz';
    b.innerHTML = '<svg class="i" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3"/></svg>';
    let rec = null;
    b.onclick = (e) => {
      e.preventDefault();
      if (R.native()) {
        // iOS uygulaması: Apple'ın Türkçe konuşma tanıma servisi
        if (b.classList.contains('rec')) { window.webkit.messageHandlers.tsNative.postMessage({ cmd: 'voiceStop' }); return; }
        const base = textarea.value ? textarea.value + ' ' : '';
        window.tsVoice = (t, done, err) => {
          if (err) { A().toast(err, true); b.classList.remove('rec'); return; }
          if (t != null) { textarea.value = base + t; onText && onText(); }
          if (done) b.classList.remove('rec');
        };
        b.classList.add('rec');
        window.webkit.messageHandlers.tsNative.postMessage({ cmd: 'voiceStart', lang: 'tr-TR' });
        return;
      }
      if (!SR) return A().toast('Bu tarayıcı sesle yazmayı desteklemiyor. Telefon klavyesindeki mikrofon tuşunu kullanabilirsin.', true);
      if (!window.isSecureContext) return A().toast('Tarayıcılar sesle yazmaya yalnızca güvenli bağlantıda (HTTPS) izin veriyor. Telefonda klavyedeki mikrofon tuşunu kullan.', true);
      if (rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = 'tr-TR'; rec.interimResults = true; rec.continuous = false;
      const base = textarea.value ? textarea.value + ' ' : '';
      rec.onresult = (ev) => { textarea.value = base + [...ev.results].map((r) => r[0].transcript).join(''); onText && onText(); };
      rec.onerror = (ev) => A().toast('Ses alınamadı: ' + ev.error, true);
      rec.onend = () => { b.classList.remove('rec'); rec = null; };
      b.classList.add('rec');
      rec.start();
    };
    return b;
  };
  F.share = async function (d, btn) {
    const name = (d.name || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'tasarim';
    const blob = await R.exportBlob(d, 'png', 1);
    if (R.native()) return R.download(blob, name + '.png');
    const file = new File([blob], name + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: d.name || 'Tasarım' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    R.download(blob, name + '.png');
    A().toast(window.isSecureContext ? 'Bu tarayıcı doğrudan paylaşımı desteklemiyor; görsel indirildi.' : 'Doğrudan paylaşım HTTPS ister; görsel indirildi. Galeriden Instagram\'a paylaşabilirsin.');
    F.splashFrom(btn);
  };


  // ===== KENDİ FOTOĞRAFINDA GÖR (perspektifli mockup) =====
  F.photoMockup = async function (d) {
    const pick = await new Promise((res) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = () => res(inp.files[0] || null); inp.click(); });
    if (!pick) return;
    const photoURL = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(pick); });
    const photo = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = photoURL; });
    const design = await R.exportCanvas(d, Math.min(2, 1600 / Math.max(d.width, d.height)));
    const sc = Math.min(1, 1600 / Math.max(photo.width, photo.height)), PW = Math.round(photo.width * sc), PH = Math.round(photo.height * sc);
    const ar = d.width / d.height; let qw = PW * 0.5, qh = qw / ar; if (qh > PH * 0.6) { qh = PH * 0.6; qw = qh * ar; }
    const cx = PW / 2, cy = PH / 2;
    let quad = [[cx - qw / 2, cy - qh / 2], [cx + qw / 2, cy - qh / 2], [cx + qw / 2, cy + qh / 2], [cx - qw / 2, cy + qh / 2]];
    let blend = 'multiply', op = 0.95, shade = true;
    await A().dialog(`<div class="d-body"><h3>${icon('image')} Kendi fotoğrafında gör</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Dört köşeyi tasarımın duracağı yüzeyin (tabela, vitrin, kutu, kâğıt) köşelerine sürükle.</p>
      <div class="pm-stage"><canvas id="pmC" width="${PW}" height="${PH}"></canvas></div>
      <div class="pm-opts"><div class="seg"><button data-bl="multiply" class="on">Baskı (doku görünsün)</button><button data-bl="source-over">Ekran / parlak</button></div><label class="switch"><input type="checkbox" id="pmSh" checked>Işık-gölge</label><div class="prow" style="flex:1;min-width:180px"><span>Opaklık</span><input type="range" id="pmO" min="0.3" max="1" step="0.05" value="0.95"></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="pmSave">${icon('plus')}Proje olarak kaydet</button><button class="btn primary" id="pmDl">${icon('download')}PNG indir</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const cv = $('#pmC', box), x = cv.getContext('2d');
        const render = (handles = true) => {
          x.clearRect(0, 0, PW, PH); x.drawImage(photo, 0, 0, PW, PH);
          const tmp = document.createElement('canvas'); tmp.width = PW; tmp.height = PH; const tx = tmp.getContext('2d');
          T.warpDraw(tx, design, quad, 16);
          if (shade) { // fotoğrafın aydınlığını tasarıma bindir
            tx.globalCompositeOperation = 'source-atop'; tx.globalAlpha = 0.35; tx.filter = 'grayscale(1) contrast(1.2)'; tx.drawImage(photo, 0, 0, PW, PH); tx.filter = 'none'; tx.globalAlpha = 1; tx.globalCompositeOperation = 'source-over';
          }
          x.save(); x.globalAlpha = op; x.globalCompositeOperation = blend; x.drawImage(tmp, 0, 0); x.restore();
          if (handles) { x.strokeStyle = 'rgba(226,25,124,.9)'; x.lineWidth = Math.max(1.5, PW / 500); x.beginPath(); quad.forEach((p, i) => (i ? x.lineTo(...p) : x.moveTo(...p))); x.closePath(); x.stroke(); quad.forEach((p) => { x.beginPath(); x.arc(p[0], p[1], Math.max(7, PW / 90), 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill(); x.stroke(); }); }
        };
        const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PW / r.width, (e.clientY - r.top) * PH / r.height]; };
        let drag = -1, moveAll = null;
        cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); const p = pt(e), rr = Math.max(20, PW / 30); drag = quad.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < rr); if (drag < 0) moveAll = { p, q: quad.map((q) => q.slice()) }; };
        cv.onpointermove = (e) => { const p = pt(e); if (drag >= 0) { quad[drag] = [Math.max(0, Math.min(PW, p[0])), Math.max(0, Math.min(PH, p[1]))]; render(); } else if (moveAll) { const dx = p[0] - moveAll.p[0], dy = p[1] - moveAll.p[1]; quad = moveAll.q.map((q) => [q[0] + dx, q[1] + dy]); render(); } };
        cv.onpointerup = cv.onpointercancel = () => { drag = -1; moveAll = null; };
        $$('[data-bl]', box).forEach((b) => (b.onclick = () => { blend = b.dataset.bl; $$('[data-bl]', box).forEach((y) => y.classList.toggle('on', y === b)); render(); }));
        $('#pmSh', box).onchange = (e) => { shade = e.target.checked; render(); };
        $('#pmO', box).oninput = (e) => { op = +e.target.value; render(); };
        const result = () => { render(false); const c = document.createElement('canvas'); c.width = PW; c.height = PH; c.getContext('2d').drawImage(cv, 0, 0); render(); return c; };
        $('#pmDl', box).onclick = async () => { const c = result(); const blob = await new Promise((r) => c.toBlob(r, 'image/png')); R.download(blob, (d.name || 'tasarim') + '-mockup.png'); };
        $('#pmSave', box).onclick = async () => {
          const c = result(); const up = await A().api('upload', { body: { data: c.toDataURL('image/jpeg', 0.92), name: 'mockup.jpg' } });
          const p = Object.assign(A().newProject(PW, PH, (d.name || 'Tasarım') + ' · mockup'), { background: '#FFFFFF', layers: [{ type: 'image', name: 'Mockup', src: up.url, x: 0, y: 0, w: PW, h: PH, fit: 'cover', nw: PW, nh: PH }] });
          R.normalize(p); await A().saveProject(p); close(); A().toast('Mockup projelere kaydedildi');
        };
        render();
      },
    });
  };

  // ===== İÇERİK TAKVİMİ =====
  const PLATFORMS = [['instagram', 'Instagram', '#E1306C'], ['story', 'Story', '#F77737'], ['facebook', 'Facebook', '#1877F2'], ['tiktok', 'TikTok', '#111111'], ['whatsapp', 'WhatsApp', '#25D366'], ['print', 'Baskı', '#64748B'], ['other', 'Diğer', '#7C5CFF']];
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  async function saveCal(list) { const b = A().S.brand || { enabled: false, colors: [] }; A().S.brand = await A().api('brand', { body: { ...b, calendar: list } }); }
  F.calendarItems = () => ((A().S.brand && A().S.brand.calendar) || []);
  F.calendar = async function (opts = {}) {
    let projects = []; try { projects = await A().api('projects'); } catch (e) {}
    const now = new Date(); let ym = new Date(now.getFullYear(), now.getMonth(), 1);
    await A().dialog(`<div class="d-body cal-d"><div class="cal-head"><h3>${icon('calendar')} İçerik takvimi</h3><div class="cal-nav"><button class="btn ghost sm" id="calP">‹</button><b id="calM"></b><button class="btn ghost sm" id="calN">›</button><button class="btn ghost sm" id="calT">Bugün</button></div></div>
      <div class="cal-grid" id="calG"></div>
      <p class="muted" style="font-size:12px;margin:8px 0 0">Bir güne dokunup paylaşım planla. <b>Telefon takvimine aktar</b> ile hatırlatmalar telefonunda da çalar.</p></div>
      <div class="d-foot"><button class="btn ghost" id="calIcs" style="margin-right:auto">${icon('download')}Telefon takvimine aktar (.ics)</button><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const draw = () => {
          const items = F.calendarItems();
          $('#calM', box).textContent = ym.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
          const first = (ym.getDay() + 6) % 7, days = new Date(ym.getFullYear(), ym.getMonth() + 1, 0).getDate(), today = ymd(now);
          let h = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => `<div class="cal-dn">${d}</div>`).join('');
          for (let i = 0; i < first; i++) h += '<div class="cal-c off"></div>';
          for (let dd = 1; dd <= days; dd++) {
            const key = ymd(new Date(ym.getFullYear(), ym.getMonth(), dd)), its = items.filter((x) => x.date === key).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
            h += `<div class="cal-c${key === today ? ' today' : ''}${key < today ? ' past' : ''}" data-day="${key}"><span class="cal-d">${dd}</span>${(() => { const sd = window.P5 && window.P5.dayName(key); return sd ? `<div class="cal-sd" title="${esc(sd.name)}">★ ${esc(sd.name)}</div>` : ''; })()}${its.map((x) => { const pl = PLATFORMS.find((p) => p[0] === x.platform) || PLATFORMS[6], pr = projects.find((p) => p.id === x.projectId); return `<div class="cal-it${x.done ? ' done' : ''}" data-it="${x.id}" style="--c:${pl[2]}">${pr && pr.thumb ? `<img src="${pr.thumb}" alt="">` : '<i></i>'}<span>${esc(x.time || '')} ${esc(x.note || (pr && pr.name) || pl[1])}</span></div>`; }).join('')}</div>`;
          }
          $('#calG', box).innerHTML = h;
          $$('[data-day]', box).forEach((c) => (c.onclick = (e) => { const it = e.target.closest('[data-it]'); edit(c.dataset.day, it ? F.calendarItems().find((x) => x.id === it.dataset.it) : null); }));
        };
        const edit = async (day, item) => {
          const it = item || { id: 'c' + Date.now().toString(36), date: day, time: '10:00', platform: 'instagram', projectId: opts.addProject && opts.addProject.id || '', note: '', remind: 30, done: false };
          const r = await A().dialog(`<div class="d-body"><h3>${item ? 'Paylaşımı düzenle' : 'Paylaşım planla'}</h3>
            <div class="cal-form"><label class="fld"><span>Tarih</span><input type="date" class="inp" id="ceD" value="${it.date}"></label><label class="fld"><span>Saat</span><input type="time" class="inp" id="ceT" value="${it.time}"></label>
            <label class="fld"><span>Platform</span><select class="inp" id="ceP">${PLATFORMS.map(([k, t]) => `<option value="${k}" ${k === it.platform ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="fld"><span>Hatırlatma</span><select class="inp" id="ceR">${[[0, 'Yok'], [15, '15 dk önce'], [30, '30 dk önce'], [60, '1 saat önce'], [1440, '1 gün önce']].map(([v, t]) => `<option value="${v}" ${+it.remind === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
            <label class="fld"><span>Tasarım</span><select class="inp" id="ceX"><option value="">— seçilmedi —</option>${projects.map((p) => `<option value="${p.id}" ${p.id === it.projectId ? 'selected' : ''}>${esc(p.name || 'Tasarım')}</option>`).join('')}</select></label>
            <label class="fld"><span>Not / açıklama</span><textarea class="inp" id="ceN" rows="2" placeholder="örn. Hafta sonu indirimi duyurusu">${esc(it.note)}</textarea></label>
            ${item ? `<label class="switch"><input type="checkbox" id="ceDone" ${it.done ? 'checked' : ''}>Paylaşıldı</label>` : ''}</div>
            ${(() => { const sd = window.P5 && window.P5.dayName(it.date); return sd ? `<div class="cal-sdbox">★ <b>${esc(sd.name)}</b><button class="btn sm" id="ceSd">${icon('sparkle')}Bu gün için tasarla</button></div>` : ''; })()}
            <div class="d-foot">${item ? `<button class="btn ghost danger" id="ceDel" style="margin-right:auto">${icon('trash')}Sil</button>` : ''}${item && it.projectId ? `<button class="btn ghost" id="ceOpen">Tasarımı aç</button>` : ''}<button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ceOk">Kaydet</button></div>`, {
            onOpen: (b2, close) => {
              $('#ceOk', b2).onclick = () => close({ ...it, date: $('#ceD', b2).value, time: $('#ceT', b2).value, platform: $('#ceP', b2).value, remind: +$('#ceR', b2).value, projectId: $('#ceX', b2).value, note: $('#ceN', b2).value.trim(), done: $('#ceDone', b2) ? $('#ceDone', b2).checked : false });
              const dl = $('#ceDel', b2); if (dl) dl.onclick = () => close({ del: true });
              const sdb = $('#ceSd', b2); if (sdb) sdb.onclick = () => { const sd = window.P5.dayName(it.date); close(); document.querySelectorAll('.dialog-back, .dlg-back').forEach((x) => x.remove()); A().startPrompt(sd.prompt); };
              const op = $('#ceOpen', b2); if (op) op.onclick = () => { close(); document.querySelectorAll('.dialog-back, .dlg-back').forEach((x) => x.remove()); A().go('editor', it.projectId); };
            },
          });
          if (!r) return;
          let list = F.calendarItems().filter((x) => x.id !== it.id);
          if (!r.del) list.push(r);
          try { await saveCal(list); F.scheduleReminders(); if (!r.del && 'Notification' in window && Notification.permission === 'default' && r.remind) Notification.requestPermission(); } catch (e) { A().toast(e.message, true); }
          draw();
        };
        $('#calP', box).onclick = () => { ym = new Date(ym.getFullYear(), ym.getMonth() - 1, 1); draw(); };
        $('#calN', box).onclick = () => { ym = new Date(ym.getFullYear(), ym.getMonth() + 1, 1); draw(); };
        $('#calT', box).onclick = () => { ym = new Date(now.getFullYear(), now.getMonth(), 1); draw(); };
        $('#calIcs', box).onclick = () => {
          const items = F.calendarItems().filter((x) => !x.done); if (!items.length) return A().toast('Takvimde planlanmış paylaşım yok');
          const st2 = (x) => x.date.replace(/-/g, '') + 'T' + (x.time || '10:00').replace(':', '') + '00';
          const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tasarim Studyosu//TR', 'CALSCALE:GREGORIAN', ...items.flatMap((x) => { const pl = (PLATFORMS.find((p) => p[0] === x.platform) || PLATFORMS[6])[1], pr = projects.find((p) => p.id === x.projectId); return ['BEGIN:VEVENT', 'UID:' + x.id + '@tasarim-studyosu', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART:' + st2(x), 'DURATION:PT30M', 'SUMMARY:' + (pl + ' paylaşımı: ' + (x.note || (pr && pr.name) || '')).replace(/[,;]/g, ' '), ...(x.remind ? ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Paylaşım zamanı', `TRIGGER:-PT${x.remind}M`, 'END:VALARM'] : []), 'END:VEVENT']; }), 'END:VCALENDAR'].join('\r\n');
          R.download(new Blob([ics], { type: 'text/calendar' }), 'icerik-takvimi.ics');
        };
        if (opts.addProject) { setTimeout(() => edit(ymd(new Date(now.getTime() + 86400000)), null), 200); }
        draw();
      },
    });
  };
  // uygulama açıkken hatırlatma
  let remT = [];
  F.scheduleReminders = function () {
    remT.forEach(clearTimeout); remT = [];
    const now = Date.now();
    F.calendarItems().filter((x) => !x.done && x.remind).forEach((x) => {
      const at = new Date(`${x.date}T${x.time || '10:00'}:00`).getTime() - x.remind * 60000, dt = at - now;
      if (dt > 0 && dt < 864e5) remT.push(setTimeout(() => { const msg = `${x.time} paylaşımı: ${x.note || 'planlı içerik'}`; A().toast('⏰ ' + msg); try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Paylaşım zamanı yaklaşıyor', { body: msg }); } catch (e) {} }, dt));
    });
    const today = ymd(new Date()), n = F.calendarItems().filter((x) => x.date === today && !x.done).length;
    return n;
  };

  // ===== PAYLAŞ (telefon menüsü, WhatsApp, e-posta, açıklama) =====
  F.shareDialog = async function (d) {
    const name = (d.name || 'tasarim').replace(/[^\wçğıöşüÇĞİÖŞÜ -]/g, '').trim().replace(/\s+/g, '-') || 'tasarim';
    const canFiles = !!(navigator.canShare && window.File && navigator.canShare({ files: [new File([new Blob(['x'])], 'a.png', { type: 'image/png' })] }));
    await A().dialog(`<div class="d-body"><h3>${icon('share')} Paylaş</h3>
      <label class="fld"><span>Açıklama (gönderi metni)</span><textarea class="inp" id="shT" rows="4" placeholder="Gönderi açıklaması, etiketler…"></textarea></label>
      <div class="iconrow" style="margin:6px 0 12px"><button class="btn sm" id="shAI">${icon('sparkle')}Yapay zekayla yaz</button><button class="btn sm" id="shCp">${icon('copy')}Metni kopyala</button></div>
      <div class="share-grid">
        <button class="share-it" data-sh="native"${canFiles ? '' : ' disabled title="Bu cihazda desteklenmiyor"'}><b>${icon('phone')}</b><span>Telefonun paylaş menüsü</span><small>Instagram, WhatsApp, Telegram…</small></button>
        <button class="share-it" data-sh="wa"><b>${icon('chat')}</b><span>WhatsApp</span><small>görsel iner, mesaj açılır</small></button>
        <button class="share-it" data-sh="ig"><b>${icon('social')}</b><span>Instagram için hazırla</span><small>gönderi + story boyutu, metin kopyalanır</small></button>
        <button class="share-it" data-sh="mail"><b>${icon('send')}</b><span>E‑posta</span><small>görsel iner, e‑posta açılır</small></button>
        <button class="share-it" data-sh="dl"><b>${icon('download')}</b><span>Yalnızca indir</span><small>PNG</small></button>
      </div>
      <p class="muted" style="font-size:12px;margin-top:10px">${canFiles ? '' : 'Doğrudan paylaşım bu tarayıcıda kapalı. Telefonda (HTTPS ile) açınca Instagram ve WhatsApp listede çıkar. '}Hesabına otomatik gönderi atmak için Instagram/Facebook iş hesabı bağlantısı gerekir; o zamana kadar görsel ve metin hazır gelir, paylaş düğmesine sen basarsın.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      onOpen: (box) => {
        const txt = () => $('#shT', box).value;
        $('#shCp', box).onclick = async () => { try { await navigator.clipboard.writeText(txt()); A().toast('Metin kopyalandı'); } catch (e) { A().toast('Kopyalanamadı', true); } };
        $('#shAI', box).onclick = async (e) => { const b = e.currentTarget; b.disabled = true; try { const texts = d.layers.filter((l) => l.type === 'text').map((l) => R.plain(l.text)).join(' | '); const r = await A().api('ai-text', { body: { task: 'write', kind: 'Instagram gönderi açıklaması (2-3 cümle + 5-8 Türkçe hashtag)', tone: 'Samimi', about: texts } }); if (r.options && r.options[0]) $('#shT', box).value = r.options[0]; } catch (err) { A().toast(err.message, true); } b.disabled = false; };
        const png = async (dd = d) => R.exportBlob(dd, 'png', Math.min(2, 2160 / Math.max(dd.width, dd.height)));
        $$('[data-sh]', box).forEach((b) => (b.onclick = async () => {
          const k = b.dataset.sh;
          try {
            if (k === 'native') { const f = new File([await png()], name + '.png', { type: 'image/png' }); await navigator.share({ files: [f], text: txt(), title: d.name || 'Tasarım' }); return; }
            if (k === 'dl') { R.download(await png(), name + '.png'); return; }
            if (k === 'wa') { R.download(await png(), name + '.png'); window.open('https://wa.me/?text=' + encodeURIComponent(txt() || d.name || ''), '_blank', 'noopener'); return; }
            if (k === 'mail') { R.download(await png(), name + '.png'); location.href = `mailto:?subject=${encodeURIComponent(d.name || 'Tasarım')}&body=${encodeURIComponent((txt() || '') + '\n\n(Görsel ekte)')}`; return; }
            if (k === 'ig') {
              const files = [{ name: name + '-gonderi.png', data: new Uint8Array(await (await png()).arrayBuffer()) }];
              if (Math.abs(d.width / d.height - 9 / 16) > 0.05) { const st = JSON.parse(JSON.stringify(d)); const story = { width: 1080, height: 1920, background: '#111111', layers: [] }; const im = await R.exportCanvas(d, 1080 / d.width); const up = im.toDataURL('image/png'); story.layers.push({ type: 'image', src: up, x: 0, y: (1920 - im.height) / 2, w: 1080, h: im.height, fit: 'fill', nw: im.width, nh: im.height }); R.normalize(story); files.push({ name: name + '-story.png', data: new Uint8Array(await (await R.exportBlob(story, 'png', 1)).arrayBuffer()) }); void st; }
              if (txt()) files.push({ name: name + '-aciklama.txt', data: new TextEncoder().encode(txt()) });
              R.download(T.zip(files), name + '-instagram.zip');
              try { if (txt()) await navigator.clipboard.writeText(txt()); } catch (e) {}
              A().toast('Gönderi ve story görselleri indi' + (txt() ? ', açıklama kopyalandı' : ''));
            }
          } catch (err) { if (err.name !== 'AbortError') A().toast(err.message, true); }
        }));
      },
    });
  };
  F.share = (d) => F.shareDialog(d);
  window.Features = F;
})();
