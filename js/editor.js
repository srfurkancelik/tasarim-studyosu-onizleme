/* Tasarım Stüdyosu — Editör (katmanlar, vektör araçları, fırça, filtreler, akıllı kılavuzlar) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.Render, M = window.Motion;
  const esc = R.esc;
  const icon = (...a) => window.icon(...a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rad = (d) => (d * Math.PI) / 180;
  const r1 = (v) => Math.round(v * 10) / 10;

  const TOOLS = [
    ['select', 'cursor', 'Seç ve taşı', 'V'],
    ['hand', 'hand', 'El (kaydır)', 'H'],
    '-',
    ['text', 'type', 'Metin', 'T'],
    ['rect', 'square', 'Dikdörtgen', 'R'],
    ['ellipse', 'circle', 'Elips', 'E'],
    ['star', 'star', 'Yıldız', 'S'],
    ['triangle', 'triangle', 'Üçgen', 'Y'],
    ['line', 'line', 'Çizgi', 'L'],
    ['retext', 'retext', 'Fotoğraftaki yazıyı değiştir', 'X'],
    ['lift', 'lift', 'Seç ve ayır (arkasını doldur)', 'K'],
    '-',
    ['pen', 'vector', 'Kalem (vektör yol)', 'P'],
    ['brush', 'brush', 'Fırça', 'B'],
    ['heal', 'heal', 'Leke düzelt / klon', 'J'],
    ['eraser', 'eraser', 'Silgi', '⇧E'],
    ['gradient', 'gradient', 'Degrade', 'G'],
    ['eyedrop', 'dropper', 'Damlalık', 'I'],
    '-',
    ['crop', 'crop', 'Kırp (tuval)', 'C'],
    ['zoom', 'zoomTool', 'Yakınlaştır', 'Z'],
    ['image', 'image', 'Görsel ekle', '⇧I'],
  ];
  const BLENDS = [['normal', 'Normal'], ['multiply', 'Çoğalt'], ['screen', 'Ekran'], ['overlay', 'Bindirme'], ['darken', 'Koyulaştır'], ['lighten', 'Açıklaştır'], ['color-dodge', 'Renk soldurma'], ['color-burn', 'Renk yakma'], ['soft-light', 'Yumuşak ışık'], ['hard-light', 'Sert ışık'], ['difference', 'Fark'], ['exclusion', 'Dışlama'], ['hue', 'Ton'], ['saturation', 'Doygunluk'], ['color', 'Renk'], ['luminosity', 'Parlaklık']];
  const FILTER_LABELS = { brightness: ['Parlaklık', 0, 200, 100], contrast: ['Kontrast', 0, 200, 100], shadows: ['Gölgeler', -100, 100, 0], highlights: ['Işıklar', -100, 100, 0], warmth: ['Sıcaklık', -100, 100, 0], vibrance: ['Canlılık', -100, 100, 0], sharpen: ['Keskinlik', 0, 100, 0], saturate: ['Doygunluk', 0, 300, 100], hue: ['Ton', -180, 180, 0], grayscale: ['Gri ton', 0, 100, 0], sepia: ['Sepya', 0, 100, 0], invert: ['Negatif', 0, 100, 0], blur: ['Bulanıklık', 0, 40, 0] };
  const PRESETS = {
    'Orijinal': {}, 'Lezzet': { warmth: 8, saturate: 112, contrast: 105, sharpen: 12, vibrance: 15 }, 'Fırın sıcaklığı': { warmth: 22, saturate: 108, contrast: 104, highlights: -10 }, 'Siyah‑beyaz': { grayscale: 100, contrast: 115 }, 'Vintage': { sepia: 55, contrast: 90, brightness: 105, saturate: 80 },
    'Canlı': { saturate: 160, contrast: 115 }, 'Soğuk': { hue: -18, saturate: 110, brightness: 102 }, 'Sıcak': { hue: 12, saturate: 125, sepia: 15 },
    'Mavi gökyüzü': { hue: -6, saturate: 128, vibrance: 30, contrast: 108, highlights: -18, warmth: -10 }, 'Akşam ışığı': { warmth: 30, saturate: 115, contrast: 106, brightness: 98, highlights: -12 }, 'Altın saat': { warmth: 22, sepia: 12, saturate: 118, brightness: 104 }, 'Pastel': { saturate: 78, brightness: 110, contrast: 88 }, 'Net ve canlı': { contrast: 118, saturate: 125, sharpen: 35, vibrance: 20 }, 'Sinematik': { contrast: 118, saturate: 85, warmth: -6, brightness: 95 },
    'Dram': { contrast: 150, brightness: 90, saturate: 80 }, 'Soluk': { contrast: 80, brightness: 115, saturate: 70 }, 'Negatif': { invert: 100 },
  };
  const SIZE_PRESETS = [['', 'Hazır ölçüler…'], ['1080x1080', 'Instagram post'], ['1080x1350', 'Instagram dikey'], ['1080x1920', 'Story / Reels'], ['1240x1754', 'A4 flyer'], ['874x1240', 'A5 flyer'], ['1200x628', 'Web banner'], ['1280x720', 'YouTube kapak'], ['1584x396', 'LinkedIn kapak'], ['1920x1080', 'Yatay afiş']];

  function starD(n = 5, inner = 0.45) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? 50 * inner : 50, a = (Math.PI * i) / n - Math.PI / 2;
      pts.push(`${r1(50 + r * Math.cos(a))} ${r1(50 + r * Math.sin(a))}`);
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  function mount(page, doc, cb) {
    R.normalize(doc);
    const st = {
      tool: 'select', sel: [], zoom: 1, pan: { x: 0, y: 0 }, hist: [], hi: -1, clip: null,
      opts: { fill: '#E2197C', stroke: '#14161B', strokeWidth: 0, brush: '#14161B', brushSize: 10, fontSize: 72, textColor: '#14161B', penFill: false, font: 'Inter', grad1: '#E2197C', grad2: '#19A9E1', gradKind: 'linear', eraserSize: 40, eraserSoft: 40, eraserRestore: false, healMode: 'spot', healSize: 40 },
      tab: 'props', space: false, drag: null, pen: null, guides: [], hover: null, editing: null, panelOpen: false,
    };
    const mobile = () => innerWidth < 820;

    page.innerHTML = `
    <div class="editor">
      <div class="ed-top">
        <button class="btn ghost sm icon" data-a="studio" title="Stüdyoya dön">${icon('sparkle')}</button>
        <input class="name" id="eName" value="${esc(doc.name || 'Adsız')}" aria-label="Tasarım adı">
        <span class="sep hide-m"></span>
        <button class="btn ghost sm icon" data-a="undo" title="Geri al (Ctrl+Z)">${icon('undo')}</button>
        <button class="btn ghost sm icon" data-a="redo" title="Yinele (Ctrl+Y)">${icon('redo')}</button>
        <span class="sep hide-m"></span>
        <button class="btn ghost sm icon hide-m" data-a="zout" title="Uzaklaş (-)">${icon('zout')}</button>
        <button class="zoom-val hide-m" data-a="fit" title="Ekrana sığdır (Ctrl+0)" id="zv">100%</button>
        <button class="btn ghost sm icon hide-m" data-a="zin" title="Yakınlaş (+)">${icon('zin')}</button>
        <span class="grow"></span>
        <button class="btn ghost sm icon hide-m" data-a="cmd" title="Komutlar (Ctrl+K)">${icon('cmd')}</button>
        <button class="btn ghost sm simple-tg" data-a="simple" title="Sade moda geç: yalnız temel araçlar">${icon('simple')}<span>Pro</span></button>
        <button class="btn ghost sm hide-m adv" data-a="check" title="Okunabilirlik, kenar güvenliği ve matbaa kontrolü">${icon('shield')}<span>Ön kontrol</span></button>
        <button class="btn ghost sm coach-btn" data-a="coach" title="Tasarım koçu: hizalama, kenar payı, okunabilirlik, renk ve yazı tiplerini tek dokunuşla düzelt">${icon('coach')}<span class="hide-m">Tasarım koçu</span></button>
        <button class="btn ghost sm icon" data-a="more" title="Diğer işlemler">${icon('more')}</button>
        <button class="btn sm icon m-only" data-a="panel" id="panelBtn" title="Özellikler">${icon('sliders')}</button>
        <button class="btn sm hide-m" data-a="preview">${icon('eye')}<span>Önizle</span></button>
        <button class="btn sm hide-m" data-a="export">${icon('download')}<span>İndir</span></button>
        <button class="btn sm icon ed-share" data-a="share" title="Paylaş: WhatsApp, Instagram, durum">${icon('send')}</button>
        <button class="btn sm primary ed-save" data-a="save" title="Kaydet (Ctrl+S)">${icon('save')}<span class="hide-m">Kaydet</span></button>
      </div>
      <div class="tools" id="tools">
        ${TOOLS.map((t) => (t === '-' ? '<hr>' : `<button class="tool" data-t="${t[0]}" aria-label="${t[2]}">${icon(t[1])}<span class="tip">${t[2]} <span class="kbd">${t[3]}</span></span></button>`)).join('')}
      </div>
      <div class="ed-viewport" id="vp">
        <div class="ed-stage" id="stg"><div class="artboard" id="art"></div></div>
        <svg class="ed-overlay" id="ov"></svg>
        <canvas class="ruler rh" id="rulH"></canvas><canvas class="ruler rv" id="rulV"></canvas><div class="ruler-corner" id="rulC" title="Cetvel birimi"></div>
        <div class="tool-opts" id="topts" hidden></div>
        <div class="ctx-bar" id="ctxBar" hidden></div>
        <div class="q-bar" id="qBar" hidden></div>
        <div class="zoom-float m-only"><button class="btn ghost sm icon" data-a="zout">${icon('zout')}</button><button class="btn ghost sm" data-a="fit" id="zv2">100%</button><button class="btn ghost sm icon" data-a="zin">${icon('zin')}</button></div>
      </div>
      <aside class="ed-panel" id="panel">
        <div class="sheet-handle" data-a="panel"></div>
        <div class="tabs"><button data-tab="props">${icon('sliders')}Özellikler</button><button data-tab="layers">${icon('layers')}Katmanlar</button><button data-tab="assets">${icon('star')}Öğeler</button><button data-tab="hist">${icon('undo')}Geçmiş</button></div>
        <div class="scroll" id="pbody"></div>
      </aside>
    </div>`;
    if (!document.getElementById('ed-extra-css')) {
      const s = document.createElement('style');
      s.id = 'ed-extra-css';
      s.textContent = `.m-only{display:none!important}@media(max-width:820px){.m-only{display:inline-flex!important}}`;
      document.head.appendChild(s);
    }
    if (window.Coach) window.Coach.setSimple(window.Coach.simple());
    const vp = $('#vp', page), stg = $('#stg', page), art = $('#art', page), ov = $('#ov', page), pbody = $('#pbody', page), panel = $('#panel', page);
    // ---------- sade panel: gruplar açılır/kapanır, az kullanılanlar kapalı başlar
    const GRP_DEFAULT_CLOSED = ['Animasyon', 'Sütun ızgarası', 'Onay ve yorumlar', 'İpuçları', 'Gölge', 'Görünüm', 'Bağlı formatlar', 'Efektler'];
    const grpState = (() => { try { return JSON.parse(localStorage.getItem('ts_grp') || '{}'); } catch (e) { return {}; } })();
    const grpTitle = (h) => ((h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent) || '').trim();
    function applyGroups() {
      $$('.grp', pbody).forEach((g) => {
        const h = g.querySelector(':scope > h4'); if (!h || g.dataset.cg) return;
        const t = grpTitle(h); if (!t) return;
        g.dataset.cg = t; g.classList.add('cg');
        const closed = t in grpState ? grpState[t] : GRP_DEFAULT_CLOSED.includes(t);
        g.classList.toggle('collapsed', closed);
      });
    }
    new MutationObserver(applyGroups).observe(pbody, { childList: true });
    pbody.addEventListener('click', (e) => {
      const h = e.target.closest('.grp.cg > h4'); if (!h || e.target.closest('button, input, label, select, a')) return;
      const g = h.parentElement, t = g.dataset.cg, c = !g.classList.contains('collapsed');
      g.classList.toggle('collapsed', c); grpState[t] = c; try { localStorage.setItem('ts_grp', JSON.stringify(grpState)); } catch (err) {}
    });

    // ---------- yardımcılar
    const byId = (id) => doc.layers.find((l) => l.id === id);
    const selected = () => st.sel.map(byId).filter(Boolean);
    const one = () => (st.sel.length === 1 ? byId(st.sel[0]) : null);
    const toCanvas = (e) => { const r = vp.getBoundingClientRect(); return { x: (e.clientX - r.left - st.pan.x) / st.zoom, y: (e.clientY - r.top - st.pan.y) / st.zoom }; };
    const toScreen = (x, y) => ({ x: x * st.zoom + st.pan.x, y: y * st.zoom + st.pan.y });
    const center = (l) => ({ x: l.x + l.w / 2, y: l.y + l.h / 2 });
    function corners(l) {
      const c = center(l), a = rad(l.rotation || 0), co = Math.cos(a), si = Math.sin(a);
      return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
        let dx = (sx * l.w) / 2, dy = (sy * l.h) / 2;
        if (+l.skewX || +l.skewY) { const kx = Math.tan(rad(+l.skewX || 0)), ky = Math.tan(rad(+l.skewY || 0)), y1 = dy + dx * ky, x1 = dx + y1 * kx; dx = x1; dy = y1; }
        return { x: c.x + dx * co - dy * si, y: c.y + dx * si + dy * co };
      });
    }
    function bbox(l) {
      const cs = corners(l);
      const xs = cs.map((p) => p.x), ys = cs.map((p) => p.y);
      return { x: Math.min(...xs), y: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
    }
    function unionBox(ls) {
      const bs = ls.map(bbox);
      return { x: Math.min(...bs.map((b) => b.x)), y: Math.min(...bs.map((b) => b.y)), x2: Math.max(...bs.map((b) => b.x2)), y2: Math.max(...bs.map((b) => b.y2)) };
    }
    function hit(p) {
      for (let i = doc.layers.length - 1; i >= 0; i--) {
        const l = doc.layers[i];
        if (!l.visible || l.locked || l.type === 'adjust') continue;
        const c = center(l), a = rad(-(l.rotation || 0));
        const dx = p.x - c.x, dy = p.y - c.y;
        const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
        const pad = 4 / st.zoom;
        if (Math.abs(lx) <= l.w / 2 + pad && Math.abs(ly) <= l.h / 2 + pad) {
          if (l.type === 'ellipse' && (lx * lx) / ((l.w / 2 + pad) ** 2) + (ly * ly) / ((l.h / 2 + pad) ** 2) > 1) continue;
          return l;
        }
      }
      return null;
    }

    // ---------- geçmiş
    const snap = () => JSON.stringify(R.clean({ width: doc.width, height: doc.height, background: doc.background, layers: doc.layers }));
    st.hmeta = [];
    function histLabel(a, b) {
      if (!a) return { t: 'Açıldı', i: 'file' };
      try {
        const A = JSON.parse(a), B = JSON.parse(b);
        const nm = (l) => l.name || R.plain(l.text || '').slice(0, 18) || R.TYPE_NAMES[l.type] || l.type;
        const ma = new Map(A.layers.map((l) => [l.id, l])), mb = new Map(B.layers.map((l) => [l.id, l]));
        const add = B.layers.filter((l) => !ma.has(l.id)), del = A.layers.filter((l) => !mb.has(l.id));
        if (add.length) return { t: add.length > 1 ? `${add.length} katman eklendi` : `Eklendi: ${nm(add[0])}`, i: 'plus' };
        if (del.length) return { t: del.length > 1 ? `${del.length} katman silindi` : `Silindi: ${nm(del[0])}`, i: 'trash' };
        if (A.width !== B.width || A.height !== B.height) return { t: 'Tuval boyutu', i: 'fit' };
        if (JSON.stringify(A.background) !== JSON.stringify(B.background)) return { t: 'Arka plan', i: 'image' };
        if (A.layers.map((l) => l.id).join() !== B.layers.map((l) => l.id).join()) return { t: 'Katman sırası', i: 'layers' };
        const ch = B.layers.filter((l) => JSON.stringify(l) !== JSON.stringify(ma.get(l.id)));
        if (!ch.length) return { t: 'Değişiklik', i: 'pen' };
        const keys = new Set();
        ch.forEach((l) => { const o = ma.get(l.id); Object.keys({ ...l, ...o }).forEach((k) => { if (JSON.stringify(l[k]) !== JSON.stringify(o[k])) keys.add(k); }); });
        const has = (...k) => k.some((x) => keys.has(x));
        const what = has('text') ? 'Metin' : has('alphaMask') ? 'Maske' : has('src') ? 'Görsel' : has('fill', 'color', 'stroke') ? 'Renk' : has('fontFamily', 'fontSize', 'fontWeight') ? 'Yazı tipi' : has('filters') ? 'Filtre' : has('fx', 'shadow') ? 'Efekt' : has('rotation') ? 'Döndürme' : has('w', 'h') ? 'Boyut' : has('x', 'y') ? 'Taşıma' : has('opacity') ? 'Saydamlık' : has('visible', 'locked') ? 'Görünürlük' : 'Düzenleme';
        const ic = { Metin: 'type', Maske: 'brush', Görsel: 'image', Renk: 'palette', Taşıma: 'hand', Boyut: 'fit', Filtre: 'sliders', Efekt: 'sparkle' }[what] || 'pen';
        return { t: ch.length > 1 ? `${what} · ${ch.length} katman` : `${what}: ${nm(ch[0])}`, i: ic };
      } catch (e) { return { t: 'Değişiklik', i: 'pen' }; }
    }
    function pushHist() {
      const s = snap();
      if (st.hist[st.hi] === s) return;
      const meta = { ...histLabel(st.hist[st.hi], s), at: Date.now() };
      st.hist = st.hist.slice(0, st.hi + 1); st.hmeta = st.hmeta.slice(0, st.hi + 1);
      st.hist.push(s); st.hmeta.push(meta);
      if (st.hist.length > 100) { st.hist.shift(); st.hmeta.shift(); }
      st.hi = st.hist.length - 1;
      if (st.tab === 'hist') renderHistory();
    }
    function renderHistory() {
      const ago = (t) => { const d = Math.round((Date.now() - t) / 1000); return d < 60 ? 'şimdi' : d < 3600 ? `${Math.round(d / 60)} dk önce` : new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); };
      const rows = st.hist.map((_, i) => i).reverse().map((i) => { const m = st.hmeta[i] || { t: 'Değişiklik', i: 'pen', at: Date.now() }; return `<div class="hrow${i === st.hi ? ' on' : ''}${i > st.hi ? ' fut' : ''}" data-h="${i}">${icon(m.i)}<span>${esc(m.t)}</span><small>${ago(m.at)}</small></div>`; }).join('');
      pbody.innerHTML = `<div class="grp"><h4>Geçmiş<span class="muted" style="font-weight:400;font-size:12px">${st.hist.length} adım</span></h4><p class="muted" style="font-size:12px;margin:0 0 8px">Bir adıma dokun, tasarım o ana döner. Sonra yeni bir değişiklik yaparsan ilerideki adımlar silinir.</p><div class="hist">${rows}</div>
        <div class="iconrow" style="margin-top:8px"><button class="btn sm" data-a2="undo">${icon('undo')}Geri al</button><button class="btn sm" data-a2="redo">${icon('redo')}Yinele</button><button class="btn sm" data-a2="snapshot" title="Bu hali kopya proje olarak kaydet">${icon("copy")}Kopya</button></div>
        <div class="iconrow" style="margin-top:6px"><button class="btn sm" data-a2="ver">${icon('save')}Sürüm kaydet</button><button class="btn sm" data-a2="cmp">${icon('compare')}Karşılaştır</button></div>
        ${(doc.versions || []).filter((v) => v.named).length ? `<h4 style="margin-top:14px">Kayıtlı sürümler</h4><div class="ver-list">${(doc.versions || []).map((v, i) => (v.named ? `<div class="ver-it" data-vi="${i}">${v.thumb ? `<img src="${v.thumb}" alt="">` : ''}<span><b>${esc(v.label)}</b><small>${new Date(v.t).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></span><button class="btn ghost sm" data-vcmp="${i}">${icon('compare')}</button><button class="btn ghost sm" data-vres="${i}" title="Geri yükle">${icon('undo')}</button></div>` : '')).reverse().join('')}</div>` : ''}</div>`;
      $$('[data-h]', pbody).forEach((r) => (r.onclick = () => { const i = +r.dataset.h; if (i === st.hi) return; st.hi = i; restore(st.hist[i]); }));
      $$('[data-vcmp]', pbody).forEach((b) => (b.onclick = () => { const v = doc.versions[+b.dataset.vcmp]; compareDialog(R.normalize(JSON.parse(JSON.stringify(v.design))), v.label); }));
      $$('[data-vres]', pbody).forEach((b) => (b.onclick = async () => { const v = doc.versions[+b.dataset.vres]; if (!(await UI.confirmBox(`“${v.label}” geri yüklensin mi?`, 'Şu anki hal Geçmiş’te kalır, oradan geri dönebilirsin.', 'Geri yükle'))) return; const d = R.normalize(JSON.parse(JSON.stringify(v.design))); restore(JSON.stringify({ width: d.width, height: d.height, background: d.background, layers: d.layers })); commit(); }));
      $$('[data-a2]', pbody).forEach((b) => (b.onclick = async () => { const a = b.dataset.a2; if (a === 'undo') undo(); if (a === 'redo') redo(); if (a === 'ver') saveVersion(); if (a === 'cmp') compareDialog(); if (a === 'snapshot') { try { const d = { ...JSON.parse(snap()), meta: doc.meta, name: (doc.name || 'Tasarım') + ' — kopya ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }; d.thumb = await R.thumbnail(d); await window.App.api('projects', { body: d }); UI.toast('Anlık kopya projelere kaydedildi'); } catch (e) { UI.toast(e.message, true); } } }));
    }
    function restore(s) {
      const d = JSON.parse(s), resized = d.width !== doc.width || d.height !== doc.height;
      Object.assign(doc, d);
      R.normalize(doc);
      st.sel = st.sel.filter((id) => byId(id));
      renderCanvas(); renderPanel(); if (resized) fit(); cb.onChange && cb.onChange();
    }
    const undo = () => { if (st.hi > 0) { st.hi--; restore(st.hist[st.hi]); } };
    const redo = () => { if (st.hi < st.hist.length - 1) { st.hi++; restore(st.hist[st.hi]); } };
    function commit(panelToo = true) {
      pushHist();
      renderCanvas();
      if (panelToo) renderPanel();
      renderCtx();
      cb.onChange && cb.onChange();
    }

    // ---------- çizim
    let raf = 0;
    function renderCanvas() {
      art.style.width = doc.width + 'px';
      art.style.height = doc.height + 'px';
      art.innerHTML = R.renderSVG(doc, { prefix: 'e_' });
      if (st.editing) { const g = art.querySelector(`[data-id="${st.editing.id}"]`); if (g) g.style.opacity = 0; }
      drawOverlay();
    }
    const renderSoon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderCanvas(); }); };
    function moveDOM(l) {
      const g = art.querySelector(`[data-id="${l.id}"]`);
      if (g) g.setAttribute('transform', R.layerTransform(l)); else renderSoon();
    }
    // ---------- cetveller ve kılavuzlar
    st.rulers = (() => { try { const v = localStorage.getItem('ts_rulers'); return v == null ? !mobile() : v === '1'; } catch (e) { return !mobile(); } })();
    function guidesArr() { doc.meta = doc.meta || {}; return (doc.meta.guides = doc.meta.guides || []); }
    function toggleRulers() { st.rulers = !st.rulers; try { localStorage.setItem('ts_rulers', st.rulers ? '1' : '0'); } catch (e) {} drawRulers(); drawOverlay(); }
    function niceStep(px) { const c = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]; return c.find((v) => v >= px) || 10000; }
    function drawRulers() {
      const H = $('#rulH', page), V = $('#rulV', page), C = $('#rulC', page);
      [H, V, C].forEach((e) => e && (e.hidden = !st.rulers));
      vp.classList.toggle('with-rulers', !!st.rulers);
      if (!st.rulers || !H) return;
      const r = vp.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, T = 20;
      const ppm = window.Tools.pxPerMM(doc), unit = ppm ? 'mm' : 'px', k = ppm || 1; // tasarım px / birim
      C.textContent = unit;
      const draw = (cv, horiz) => {
        const L = horiz ? r.width : r.height;
        cv.width = L * dpr; cv.height = T * dpr; cv.style.width = horiz ? L + 'px' : T + 'px'; cv.style.height = horiz ? T + 'px' : L + 'px';
        if (!horiz) { cv.width = T * dpr; cv.height = L * dpr; }
        const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const lightUI = document.documentElement.dataset.theme === 'light';
        g.fillStyle = lightUI ? '#EEF0F4' : '#1B1E25'; g.fillRect(0, 0, horiz ? L : T, horiz ? T : L);
        g.strokeStyle = lightUI ? 'rgba(20,30,50,.3)' : 'rgba(255,255,255,.28)'; g.fillStyle = lightUI ? 'rgba(20,30,50,.6)' : 'rgba(255,255,255,.55)'; g.font = '9.5px ui-sans-serif, system-ui'; g.lineWidth = 1;
        const z = st.zoom * k, off = horiz ? st.pan.x : st.pan.y;
        const step = niceStep(60 / z), minor = step / (step % 5 === 0 ? 5 : 2);
        const u0 = Math.floor(-off / z / minor) * minor, u1 = (L - off) / z;
        // seçimin izdüşümü
        const sb = selected().length ? unionBox(selected()) : null;
        if (sb) { g.fillStyle = 'rgba(25,169,225,.28)'; const a = (horiz ? sb.x : sb.y) * st.zoom + off, b = (horiz ? sb.x2 : sb.y2) * st.zoom + off; horiz ? g.fillRect(a, 0, b - a, T) : g.fillRect(0, a, T, b - a); g.fillStyle = 'rgba(255,255,255,.55)'; }
        g.beginPath();
        for (let u = u0; u <= u1; u += minor) {
          const q = Math.round(u * z + off) + 0.5, major = Math.abs(u / step - Math.round(u / step)) < 1e-6;
          const len = major ? T : T * 0.3;
          if (horiz) { g.moveTo(q, T); g.lineTo(q, T - len); } else { g.moveTo(T, q); g.lineTo(T - len, q); }
          if (major) {
            const t = String(Math.round(u * 10) / 10);
            if (horiz) g.fillText(t, q + 3, 9);
            else { g.save(); g.translate(9, q + 3); g.rotate(-Math.PI / 2); g.textAlign = 'right'; g.fillText(t, 0, 0); g.restore(); }
          }
        }
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.14)'; g.beginPath(); if (horiz) { g.moveTo(0, T - 0.5); g.lineTo(L, T - 0.5); } else { g.moveTo(T - 0.5, 0); g.lineTo(T - 0.5, L); } g.stroke();
      };
      draw(H, true); draw(V, false);
    }
    function dragGuide(e, axis, idx) {
      e.preventDefault(); e.stopPropagation();
      const gs = guidesArr();
      if (idx == null) { gs.push(axis === 'x' ? { x: 0 } : { y: 0 }); idx = gs.length - 1; }
      const r = vp.getBoundingClientRect();
      const mv = (ev) => {
        const p = { x: (ev.clientX - r.left - st.pan.x) / st.zoom, y: (ev.clientY - r.top - st.pan.y) / st.zoom };
        const v = Math.round(axis === 'x' ? p.x : p.y);
        gs[idx] = axis === 'x' ? { x: v } : { y: v };
        st.guideTag = { axis, v, cx: ev.clientX - r.left, cy: ev.clientY - r.top };
        drawOverlay();
      };
      const upg = (ev) => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upg);
        const inRuler = axis === 'x' ? ev.clientY - r.top < 22 : ev.clientX - r.left < 22;
        const out = ev.clientX < r.left || ev.clientY < r.top || ev.clientX > r.right || ev.clientY > r.bottom;
        if (inRuler || out) gs.splice(idx, 1);
        st.guideTag = null; commit();
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upg);
      mv(e);
    }
    function showKeys() {
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
      const rows = [['V', 'Seç'], ['H / Boşluk', 'El (kaydır)'], ['T', 'Yazı'], ['R · E · S · Y · L', 'Dikdörtgen · Elips · Yıldız · Üçgen · Çizgi'], ['P · B', 'Kalem · Fırça'], ['J · ⇧E', 'Leke düzelt / klon · Silgi'], ['G · I', 'Degrade · Damlalık'], ['C · Z', 'Tuvali kırp · Yakınlaştır'], ['⇧I', 'Görsel ekle'], ['1 … 0', 'Opaklık %10 … %100'], ['Alt (basılı)', 'Uzaklıkları ölç'], ['Tab (yazıda)', 'Fiyat satırı: ad ⇥ fiyat'], ['X', 'Fotoğraftaki yazıyı değiştir'], ['K', 'Seç ve ayır'],
        [mac + ' Z / ' + mac + ' ⇧ Z', 'Geri al / yinele'], [mac + ' C · V · D', 'Kopyala · yapıştır · çoğalt'], [mac + ' ⌥ C / V', 'Stili kopyala / yapıştır'], [mac + ' G / ⇧ G', 'Grupla / çöz'], [mac + ' A', 'Tümünü seç'],
        ['Oklar (⇧ ile 10)', 'Kaydır'], ['[ ]  (⇧ ile en)', 'Arkaya / öne'], ['Alt + sürükle', 'Kopyasını sürükle'], ['⇧ + sürükle', 'Düz eksende taşı'], [mac + ' 0 · + · −', 'Sığdır · yakınlaş · uzaklaş'], ['⇧ R', 'Cetveller'], [mac + ' E', 'Dışa aktar'], ['Sağ tık / uzun bas', 'Hızlı menü']];
      UI.dialog(`<div class="d-body"><h3>${icon('keyboard')} Klavye kısayolları</h3><div class="keys-grid">${rows.map(([k, t]) => `<kbd>${esc(k)}</kbd><span>${esc(t)}</span>`).join('')}</div><p class="muted" style="font-size:12px;margin-top:10px">Cetvelden tuvale sürükleyerek kılavuz çizgisi ekle; geri cetvele sürükleyince silinir. Nesneler kılavuzlara yapışır.</p></div><div class="d-foot"><button class="btn primary" data-close>Tamam</button></div>`);
    }

    function applyView() {
      drawRulers();
      stg.style.transform = `translate(${st.pan.x}px,${st.pan.y}px) scale(${st.zoom})`;
      const z = Math.round(st.zoom * 100) + '%';
      $('#zv', page).textContent = z; $('#zv2', page).textContent = z;
      drawOverlay();
      if (st.editing) placeTextEditor();
    }
    // Alt basılıyken: seçili öğenin üzerine gelinen öğeye ya da tuval kenarlarına uzaklığı
    function measureSVG() {
      const A = unionBox(selected()); const hv = st.hover && st.hover !== st.sel[0] && !st.sel.includes(st.hover) ? byId(st.hover) : null;
      const B = hv ? bbox(hv) : { x: 0, y: 0, x2: doc.width, y2: doc.height }, inside = !hv || (A.x >= B.x && A.x2 <= B.x2 && A.y >= B.y && A.y2 <= B.y2);
      let o = '';
      const lab = (x, y, v) => { const t = String(Math.round(isMM() ? v * mmF() * 10 : v) / (isMM() ? 10 : 1)) + (isMM() ? ' mm' : ''); const q = toScreen(x, y), w = t.length * 6.4 + 10; return `<g class="msr-l"><rect x="${q.x - w / 2}" y="${q.y - 9}" width="${w}" height="18" rx="4"/><text x="${q.x}" y="${q.y + 4}">${t}</text></g>`; };
      const ln = (x1, y1, x2, y2) => { const a = toScreen(x1, y1), b = toScreen(x2, y2); return `<line class="msr" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; };
      const cy = (A.y + A.y2) / 2, cx = (A.x + A.x2) / 2;
      if (inside) {
        [[B.x, cy, A.x, cy, A.x - B.x], [A.x2, cy, B.x2, cy, B.x2 - A.x2], [cx, B.y, cx, A.y, A.y - B.y], [cx, A.y2, cx, B.y2, B.y2 - A.y2]].forEach(([x1, y1, x2, y2, v]) => { if (v > 0.5) o += ln(x1, y1, x2, y2) + lab((x1 + x2) / 2, (y1 + y2) / 2, v); });
        if (hv) { const q = toScreen(B.x, B.y); o = `<rect class="msr-b" x="${q.x}" y="${q.y}" width="${(B.x2 - B.x) * st.zoom}" height="${(B.y2 - B.y) * st.zoom}"/>` + o; }
      } else {
        const q = toScreen(B.x, B.y); o += `<rect class="msr-b" x="${q.x}" y="${q.y}" width="${(B.x2 - B.x) * st.zoom}" height="${(B.y2 - B.y) * st.zoom}"/>`;
        const my = (Math.max(A.y, B.y) + Math.min(A.y2, B.y2)) / 2, mx = (Math.max(A.x, B.x) + Math.min(A.x2, B.x2)) / 2;
        const yy = A.y2 > B.y && A.y < B.y2 ? my : cy, xx = A.x2 > B.x && A.x < B.x2 ? mx : cx;
        if (B.x >= A.x2) o += ln(A.x2, yy, B.x, yy) + lab((A.x2 + B.x) / 2, yy, B.x - A.x2); else if (A.x >= B.x2) o += ln(B.x2, yy, A.x, yy) + lab((A.x + B.x2) / 2, yy, A.x - B.x2);
        if (B.y >= A.y2) o += ln(xx, A.y2, xx, B.y) + lab(xx, (A.y2 + B.y) / 2, B.y - A.y2); else if (A.y >= B.y2) o += ln(xx, B.y2, xx, A.y) + lab(xx, (A.y + B.y2) / 2, A.y - B.y2);
      }
      return o;
    }
    // aynı rengi / yazı tipini / türü seç
    function selectSame(kind) {
      const l0 = one(); if (!l0) return;
      const col = (l) => (typeof l.fill === 'string' ? R.toHex(l.fill).toUpperCase() : null);
      const ok = (l) => l.visible !== false && !l.locked && (kind === 'color' ? col(l) && col(l) === col(l0) : kind === 'font' ? l.type === 'text' && l.fontFamily === l0.fontFamily : kind === 'style' ? l.type === 'text' && l.fontFamily === l0.fontFamily && +l.fontSize === +l0.fontSize && String(l.fontWeight) === String(l0.fontWeight) : l.type === l0.type);
      const ids = doc.layers.filter(ok).map((l) => l.id); select(ids, false, true);
      UI.toast(`${ids.length} öğe seçildi — renk, yazı tipi gibi ayarları birlikte değiştirebilirsin`);
    }
    function hitLayer(l, p) {
      const c = center(l), a = rad(-(l.rotation || 0)), dx = p.x - c.x, dy = p.y - c.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      return Math.abs(lx) <= l.w / 2 && Math.abs(ly) <= l.h / 2;
    }
    function normBox(a, b, square) {
      let w = b.x - a.x, h = b.y - a.y;
      if (square) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
      return { x: Math.min(a.x, a.x + w), y: Math.min(a.y, a.y + h), w: Math.abs(w), h: Math.abs(h) };
    }
    function zoomToBox(b) {
      const r = vp.getBoundingClientRect();
      st.zoom = clamp(Math.min((r.width - 60) / b.w, (r.height - 60) / b.h), 0.02, 16);
      st.pan = { x: r.width / 2 - (b.x + b.w / 2) * st.zoom, y: r.height / 2 - (b.y + b.h / 2) * st.zoom };
      applyView();
    }
    // ---- Kırp (tuval): seçilen alan yeni tuval olur, katmanlar kaydırılır
    function applyCrop() {
      const b = st.cropBox; if (!b) return;
      const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(doc.width, b.x + b.w), y1 = Math.min(doc.height, b.y + b.h);
      if (x1 - x0 < 4 || y1 - y0 < 4) { UI.toast('Kırpma alanı tuvalin içinde olmalı', true); return; }
      doc.layers.forEach((l) => { l.x = r1(l.x - x0); l.y = r1(l.y - y0); });
      (doc.guides || []).forEach((g) => { if (g.axis === 'x' || g.v != null) {} });
      doc.width = Math.round(x1 - x0); doc.height = Math.round(y1 - y0);
      st.cropBox = null; commit(); fit(); setTool('select');
      UI.toast(`Tuval ${doc.width} × ${doc.height} px oldu`);
    }
    // ---- Damlalık
    async function pickColorAt(p, toStroke) {
      let hexv;
      try {
        const sc = Math.min(1, 1600 / Math.max(doc.width, doc.height)), c = await R.exportCanvas(doc, sc, '#ffffff');
        const px = c.getContext('2d').getImageData(clamp(Math.round(p.x * sc), 0, c.width - 1), clamp(Math.round(p.y * sc), 0, c.height - 1), 1, 1).data;
        hexv = '#' + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
      } catch (e) { UI.toast('Renk alınamadı: ' + e.message, true); return; }
      const ls = selected().filter((l) => l.type !== 'image' && l.type !== 'adjust' && !l.locked);
      if (ls.length) { ls.forEach((l) => { if (toStroke) { l.stroke = hexv; if (!l.strokeWidth) l.strokeWidth = 4; } else l.fill = hexv; }); commit(); }
      else { st.opts.fill = st.opts.textColor = st.opts.brush = hexv; if (toStroke) st.opts.stroke = hexv; }
      pushRecent && pushRecent(hexv);
      try { await navigator.clipboard.writeText(hexv); } catch (e) {}
      UI.toast(`${hexv} ${ls.length ? (toStroke ? 'kenar rengi yapıldı' : 'seçili katmana verildi') : 'çizim rengi oldu'} · panoya kopyalandı`);
    }
    // ---- Degrade aracı
    function applyGrad(d) {
      const l = d.l, a0 = Math.atan2(d.p1.y - d.p0.y, d.p1.x - d.p0.x) * 180 / Math.PI - (l.rotation || 0);
      const c1 = st.opts.grad1, c2 = st.opts.grad2;
      l.fill = st.opts.gradKind === 'radial' ? { type: 'radial', colors: [c1, c2] } : { type: 'linear', angle: Math.round(a0), colors: [c1, c2] };
      renderSoon();
    }
    // ---- Leke düzeltme ve klon damgası: fotoğrafın kendisini düzenler (ilk düzenlemede asıl hâli saklanır)
    async function bakeImage(l) {
      const k = Math.min(3, 2000 / Math.max(l.w, l.h));
      const solo = { width: l.w, height: l.h, background: 'transparent', layers: [{ ...JSON.parse(JSON.stringify(l)), x: 0, y: 0, rotation: 0, opacity: 1, alphaMask: null, shadow: null, fx: null, filters: {}, flipX: false, flipY: false, mask: 'none', radius: 0, stroke: null, strokeWidth: 0 }] };
      return R.exportCanvas(solo, k);
    }
    async function healStart(l, p) {
      const d = (st.drag = { mode: 'heal', l, ready: false, pts: [p], paint: '', clone: st.opts.healMode === 'clone' });
      if (d.clone) d.off = { x: st.cloneSrc.p.x - p.x, y: st.cloneSrc.p.y - p.y };
      try { d.c = await bakeImage(l); } catch (e) { UI.toast('Görsel hazırlanamadı: ' + e.message, true); st.drag = null; return; }
      d.k = d.c.width / l.w; d.x = d.c.getContext('2d'); d.src0 = d.clone ? (() => { const c2 = document.createElement('canvas'); c2.width = d.c.width; c2.height = d.c.height; c2.getContext('2d').drawImage(d.c, 0, 0); return c2; })() : null;
      d.m = document.createElement('canvas'); d.m.width = d.c.width; d.m.height = d.c.height; d.mx = d.m.getContext('2d');
      d.ready = true; d.pts.splice(0).forEach((q) => healMove(q, d));
    }
    function healMove(p, d) {
      st.hoverP = p;
      if (!d.clone) { const q0 = toScreen(p.x, p.y); d.paint += (d.paint ? 'L' : 'M') + q0.x.toFixed(1) + ' ' + q0.y.toFixed(1); }
      if (!d.ready) { d.pts.push(p); drawOverlay(); return; }
      const q = layerMatrix(d.l).inverse().transformPoint(new DOMPoint(p.x, p.y)), X = q.x * d.k, Y = q.y * d.k, r = Math.max(1, (st.opts.healSize / 2) * d.k);
      const stamp = (cx, cy) => {
        d.mx.fillStyle = '#fff'; d.mx.beginPath(); d.mx.arc(cx, cy, r, 0, 7); d.mx.fill();
        if (d.clone) { // klon: kaynaktan yumuşak kenarlı fırçayla kopyala
          const sq = layerMatrix(d.l).inverse().transformPoint(new DOMPoint(p.x + d.off.x, p.y + d.off.y)), dx = sq.x * d.k - X, dy = sq.y * d.k - Y;
          const t = document.createElement('canvas'), S = Math.ceil(r * 2 + 2); t.width = t.height = S; const tx = t.getContext('2d');
          tx.drawImage(d.src0, cx - r - 1 + dx, cy - r - 1 + dy, S, S, 0, 0, S, S);
          tx.globalCompositeOperation = 'destination-in'; const g = tx.createRadialGradient(S / 2, S / 2, r * 0.55, S / 2, S / 2, r); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); tx.fillStyle = g; tx.fillRect(0, 0, S, S);
          d.x.drawImage(t, cx - r - 1, cy - r - 1);
        }
      };
      if (d.last) { const dist = Math.hypot(X - d.last.x, Y - d.last.y), n = Math.max(1, Math.ceil(dist / (r * 0.3))); for (let i = 1; i <= n; i++) stamp(d.last.x + ((X - d.last.x) * i) / n, d.last.y + ((Y - d.last.y) * i) / n); } else stamp(X, Y);
      d.last = { x: X, y: Y };
      if (d.clone && !d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; d.l.src = d.c.toDataURL('image/jpeg', 0.92); d.l.fit = 'fill'; delete d.l.crop; d.l.zoom = 1; d.l.ox = 0; d.l.oy = 0; renderSoon(); });
      drawOverlay();
    }
    // leke: işaretli alanı çevresine en çok benzeyen komşu bölgeyle doldur, kenarları yumuşat, rengi eşitle
    function healFill(c, m) {
      const W = c.width, H = c.height, x = c.getContext('2d'), mk = m.getContext('2d').getImageData(0, 0, W, H).data;
      let x0 = W, y0 = H, x1 = 0, y1 = 0; for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) if (mk[(y * W + i) * 4] > 127) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < x0) return;
      const pad = Math.max(6, Math.round(Math.max(x1 - x0, y1 - y0) * 0.25)), bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      const R0 = Math.max(0, x0 - pad), T0 = Math.max(0, y0 - pad), R1 = Math.min(W - 1, x1 + pad), T1 = Math.min(H - 1, y1 + pad), RW = R1 - R0 + 1, RH = T1 - T0 + 1;
      const img = x.getImageData(0, 0, W, H), px = img.data;
      const inM = (i, y) => mk[(y * W + i) * 4] > 127;
      const ring = []; for (let y = T0; y <= T1; y += 2) for (let i = R0; i <= R1; i += 2) if (!inM(i, y)) ring.push([i, y]);
      let best = null, bestE = 1e18; const sz = Math.max(bw, bh);
      for (const f of [1.1, 1.5, 2.1, 2.8]) for (let a = 0; a < 24; a++) {
        const dx = Math.round(Math.cos((a / 24) * 6.283) * sz * f), dy = Math.round(Math.sin((a / 24) * 6.283) * sz * f);
        if (R0 + dx < 0 || T0 + dy < 0 || R1 + dx >= W || T1 + dy >= H) continue;
        let e = 0, ok = true;
        for (let y = T0; y <= T1 && ok; y += 3) for (let i = R0; i <= R1; i += 3) { if (inM(i + dx, y + dy)) { ok = false; break; } }
        if (!ok) continue;
        for (const [i, y] of ring) { const a1 = (y * W + i) * 4, b1 = ((y + dy) * W + i + dx) * 4; e += (px[a1] - px[b1]) ** 2 + (px[a1 + 1] - px[b1 + 1]) ** 2 + (px[a1 + 2] - px[b1 + 2]) ** 2; }
        if (e < bestE) { bestE = e; best = { dx, dy }; }
      }
      // yumuşak maske (kenarda geçiş)
      const fm = document.createElement('canvas'); fm.width = W; fm.height = H; const fx2 = fm.getContext('2d'); fx2.filter = `blur(${Math.max(1.5, pad * 0.35)}px)`; fx2.drawImage(m, 0, 0); fx2.filter = 'none';
      fx2.globalCompositeOperation = 'lighter'; fx2.drawImage(m, 0, 0); const fmd = fx2.getImageData(0, 0, W, H).data;
      const out = new Uint8ClampedArray(px);
      if (best) {
        // renk eşitleme: halka üzerindeki ortalama fark
        const diff = [0, 0, 0]; for (const [i, y] of ring) { const a1 = (y * W + i) * 4, b1 = ((y + best.dy) * W + i + best.dx) * 4; for (let ch = 0; ch < 3; ch++) diff[ch] += px[a1 + ch] - px[b1 + ch]; }
        diff.forEach((v, ch) => (diff[ch] = v / Math.max(1, ring.length)));
        for (let y = T0; y <= T1; y++) for (let i = R0; i <= R1; i++) { const o = (y * W + i) * 4, wgt = Math.min(1, fmd[o] / 255); if (wgt <= 0) continue; const sI = ((y + best.dy) * W + i + best.dx) * 4; for (let ch = 0; ch < 3; ch++) out[o + ch] = px[o + ch] * (1 - wgt) + (px[sI + ch] + diff[ch]) * wgt; }
      } else {
        // yer yoksa: kenardan içe doğru ortalamayla doldur
        const known = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) known[y * W + i] = inM(i, y) ? 0 : 1;
        for (let it = 0; it < Math.max(bw, bh); it++) { let any = false; for (let y = y0; y <= y1; y++) for (let i = x0; i <= x1; i++) { const k2 = y * W + i; if (known[k2]) continue; let n = 0; const acc = [0, 0, 0]; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const xx = i + ox, yy = y + oy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; if (known[yy * W + xx] === 1) { const o2 = (yy * W + xx) * 4; acc[0] += out[o2]; acc[1] += out[o2 + 1]; acc[2] += out[o2 + 2]; n++; } } if (n >= 2) { const o = k2 * 4; out[o] = acc[0] / n; out[o + 1] = acc[1] / n; out[o + 2] = acc[2] / n; known[k2] = 2; any = true; } } for (let k3 = 0; k3 < known.length; k3++) if (known[k3] === 2) known[k3] = 1; if (!any) break; }
      }
      img.data.set(out); x.putImageData(img, 0, 0);
    }
    async function healEnd(d) {
      for (let i = 0; i < 60 && !d.ready; i++) await new Promise((r) => setTimeout(r, 50));
      if (!d.c) return;
      cancelAnimationFrame(d.raf);
      const b = busyNote(d.clone ? 'Kaydediliyor…' : 'Leke düzeltiliyor…');
      await new Promise((r) => setTimeout(r, 30));
      try { if (!d.clone) healFill(d.c, d.m); } catch (e) { UI.toast('Düzeltilemedi: ' + e.message, true); }
      const l = d.l; if (!l.origSrc) l.origSrc = l.src;
      const url = await uploadCanvas(d.c, 'duzeltilmis.png');
      l.src = url; l.nw = d.c.width; l.nh = d.c.height; l.fit = 'fill'; delete l.crop; l.zoom = 1; l.ox = 0; l.oy = 0;
      b.remove(); commit(); drawOverlay();
    }
    // ---- Perspektif: 4 köşeyi sürükle → görsel yeniden çizilir (tabela, ekran, kutu yüzüne oturtmak için)
    async function perspDialog(l) {
      let c; try { c = await bakeImage(l); } catch (e) { UI.toast(e.message, true); return; }
      const W = c.width, H = c.height, M = 0.18;
      const sc = Math.min((Math.min(620, innerWidth - 60)) / (W * (1 + 2 * M)), (innerHeight * 0.5) / (H * (1 + 2 * M))), PW = Math.round(W * (1 + 2 * M) * sc), PH = Math.round(H * (1 + 2 * M) * sc);
      let q = [[0, 0], [W, 0], [W, H], [0, H]];
      const res = await UI.dialog(`<div class="d-body"><h3>${icon('crop')} Perspektif</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Köşeleri sürükle: görsel o dört noktaya oturur. Tabelaya, ekrana, kutu yüzüne yerleştirmek için.</p>
        <div class="ps-stage" style="width:${PW}px;height:${PH}px"><canvas width="${PW * 2}" height="${PH * 2}"></canvas>${[0, 1, 2, 3].map((i) => `<i class="ps-h" data-h="${i}"></i>`).join('')}</div>
        <div class="iconrow" style="margin-top:8px"><button class="btn sm ghost" data-ps="reset">${icon('refresh')}Sıfırla</button><button class="btn sm ghost" data-ps="tilt">Arkaya yatır</button><button class="btn sm ghost" data-ps="left">Sola dön</button><button class="btn sm ghost" data-ps="right">Sağa dön</button></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="psOk">${icon('check')}Uygula</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const stg = $('.ps-stage', box), cv = $('canvas', stg), x = cv.getContext('2d'); x.scale(2, 2);
          const ox = W * M * sc, oy = H * M * sc, toS = ([a, b]) => [ox + a * sc, oy + b * sc];
          const draw = () => {
            x.clearRect(0, 0, PW, PH); x.save(); x.translate(ox, oy); x.scale(sc, sc); window.Tools.warpDraw(x, c, q, 16); x.restore();
            x.strokeStyle = '#19A9E1'; x.lineWidth = 1.5; x.beginPath(); q.forEach((p, i) => { const [a, b] = toS(p); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.closePath(); x.stroke();
            $$('.ps-h', stg).forEach((h, i) => { const [a, b] = toS(q[i]); h.style.left = a + 'px'; h.style.top = b + 'px'; });
          };
          let drag = -1;
          $$('.ps-h', stg).forEach((h) => (h.onpointerdown = (e) => { drag = +h.dataset.h; h.setPointerCapture(e.pointerId); }));
          stg.onpointermove = (e) => { if (drag < 0) return; const r = stg.getBoundingClientRect(); q[drag] = [(e.clientX - r.left - ox) / sc, (e.clientY - r.top - oy) / sc]; draw(); };
          stg.onpointerup = stg.onpointercancel = () => { drag = -1; };
          $$('[data-ps]', box).forEach((b) => (b.onclick = () => { const k = b.dataset.ps, dx = W * 0.14, dy = H * 0.12; if (k === 'reset') q = [[0, 0], [W, 0], [W, H], [0, H]]; if (k === 'tilt') q = [[dx, dy], [W - dx, dy], [W, H], [0, H]]; if (k === 'left') q = [[0, dy], [W - dx, 0], [W - dx, H], [0, H - dy]]; if (k === 'right') q = [[dx, 0], [W, dy], [W, H - dy], [dx, H]]; draw(); }));
          $('#psOk', box).onclick = () => close(q.map((p) => p.slice()));
          draw();
        },
      });
      if (!res) return;
      const xs = res.map((p) => p[0]), ys = res.map((p) => p[1]), mnx = Math.min(...xs), mny = Math.min(...ys), mxx = Math.max(...xs), mxy = Math.max(...ys);
      const out = document.createElement('canvas'); out.width = Math.max(2, Math.round(mxx - mnx)); out.height = Math.max(2, Math.round(mxy - mny));
      const ox2 = out.getContext('2d'); window.Tools.warpDraw(ox2, c, res.map(([a, b]) => [a - mnx, b - mny]), 24);
      const k = l.w / W, url = await uploadCanvas(out, 'perspektif.png');
      if (!l.origSrc) l.origSrc = l.src;
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2, nw = out.width * k, nh = out.height * k;
      Object.assign(l, { src: url, nw: out.width, nh: out.height, fit: 'fill', w: r1(nw), h: r1(nh), x: r1(cx - l.w / 2 + mnx * k), y: r1(cy - l.h / 2 + mny * k), zoom: 1, ox: 0, oy: 0 });
      delete l.crop; delete l.alphaMask; if (l.mask && l.mask !== 'none') l.mask = 'none';
      commit(); UI.toast('Perspektif uygulandı — “Aslı” ile geri dönebilirsin');
    }
    // ---- Görüntüyü vektöre çevir (logo / ikon için): renkleri sadeleştir, her renk için kontur çıkar
    async function traceImage(l) {
      const opt = await UI.dialog(`<div class="d-body"><h3>${icon('vector')} Vektöre çevir</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Logo, ikon ve düz renkli çizimler için: görsel, büyütünce bozulmayan vektör şekillere dönüşür. Fotoğraflar için uygun değildir.</p>
        <label class="fld"><span>Renk sayısı</span><select class="inp" id="trN">${[2, 3, 4, 5, 6, 8].map((n) => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="fld"><span>Ayrıntı</span><select class="inp" id="trD"><option value="1">Sade (yumuşak hatlar)</option><option value="2" selected>Dengeli</option><option value="3">Ayrıntılı</option></select></label>
        <label class="switch"><input type="checkbox" id="trBg" checked>Zemin rengini atla (şeffaf arka plan)</label></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="trGo">${icon('vector')}Çevir</button></div>`, { onOpen: (b, close) => ($('#trGo', b).onclick = () => close({ n: +$('#trN', b).value, d: +$('#trD', b).value, bg: $('#trBg', b).checked })) });
      if (!opt) return;
      const busy = busyNote('Vektöre çevriliyor…'); await new Promise((r) => setTimeout(r, 30));
      try {
        const src = await bakeImage(l), MAX = [0, 260, 420, 640][opt.d], k = Math.min(1, MAX / Math.max(src.width, src.height));
        const W = Math.max(8, Math.round(src.width * k)), H = Math.max(8, Math.round(src.height * k));
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'); cx.filter = opt.d === 1 ? 'blur(1.2px)' : 'blur(0.6px)'; cx.drawImage(src, 0, 0, W, H);
        const px = cx.getImageData(0, 0, W, H).data;
        // k-ortalamalar ile renk sadeleştirme (şeffaf pikseller hariç)
        const pts = []; for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 128) pts.push(i);
        const samp = pts.filter((_, k2) => k2 % Math.max(1, Math.floor(pts.length / 4000)) === 0), cOf = (i) => [px[i], px[i + 1], px[i + 2]];
        let C = [cOf(samp[0] || 0)]; // en uzak nokta ile başlat: farklı renkler ayrı kalsın
        while (C.length < opt.n) { let bi = samp[0], bd = -1; for (const i of samp) { const d = Math.min(...C.map((c2) => (px[i] - c2[0]) ** 2 + (px[i + 1] - c2[1]) ** 2 + (px[i + 2] - c2[2]) ** 2)); if (d > bd) { bd = d; bi = i; } } if (bd < 200) break; C.push(cOf(bi)); }
        const lab = new Int16Array(W * H).fill(-1);
        for (let it = 0; it < 10; it++) {
          const acc = C.map(() => [0, 0, 0, 0]);
          for (const i of pts) { let b = 0, bd = 1e9; for (let j = 0; j < C.length; j++) { const d = (px[i] - C[j][0]) ** 2 + (px[i + 1] - C[j][1]) ** 2 + (px[i + 2] - C[j][2]) ** 2; if (d < bd) { bd = d; b = j; } } lab[i / 4] = b; const a = acc[b]; a[0] += px[i]; a[1] += px[i + 1]; a[2] += px[i + 2]; a[3]++; }
          C = acc.map((a, j) => (a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : C[j]));
        }
        // zemin rengi: kenarlarda en sık görülen etiket
        const edge = new Array(C.length).fill(0); for (let i = 0; i < W; i++) { edge[lab[i]] = (edge[lab[i]] || 0) + 1; edge[lab[(H - 1) * W + i]] = (edge[lab[(H - 1) * W + i]] || 0) + 1; } for (let y = 0; y < H; y++) { edge[lab[y * W]] = (edge[lab[y * W]] || 0) + 1; edge[lab[y * W + W - 1]] = (edge[lab[y * W + W - 1]] || 0) + 1; }
        const bgL = edge.indexOf(Math.max(...edge.filter((v) => v != null)));
        const hex = (c2) => '#' + c2.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
        const sx = l.w / W, sy = l.h / H, layers = [], g = R.uid();
        // büyük alanlar arkada kalsın
        const order = C.map((_, j) => j).filter((j) => !(opt.bg && j === bgL)).sort((a, b) => { let na = 0, nb = 0; for (let i = 0; i < lab.length; i++) { if (lab[i] === a) na++; if (lab[i] === b) nb++; } return nb - na; });
        for (const j of order) {
          const d = traceMask((x, y) => x >= 0 && y >= 0 && x < W && y < H && lab[y * W + x] === j, W, H, opt.d);
          if (!d) continue;
          layers.push({ type: 'path', name: 'Vektör ' + hex(C[j]), d, vw: W, vh: H, x: l.x, y: l.y, w: l.w, h: l.h, rotation: l.rotation || 0, fill: hex(C[j]), evenodd: true, group: g });
        }
        if (!layers.length) throw new Error('Şekil bulunamadı');
        const at = doc.layers.indexOf(l);
        const ls = layers.map((x) => R.normalize({ width: 10, height: 10, layers: [x] }).layers[0]);
        doc.layers.splice(at + 1, 0, ...ls); l.visible = false; st.sel = ls.map((x) => x.id); commit();
        UI.toast(`${ls.length} renkli vektör şekil oluştu — aslı gizlendi (Katmanlar’dan açabilirsin)`);
      } catch (e) { UI.toast('Çevrilemedi: ' + e.message, true); }
      busy.remove();
    }
    // ikili maskeden kontur yolu (kare kenar izleme + sadeleştirme + yumuşak eğri)
    function traceMask(inside, W, H, detail) {
      // kenar parçaları: her iç pikselin dış komşusu olan kenarı
      const edges = new Map(), key = (x, y) => x + ',' + y;
      const add = (x1, y1, x2, y2) => { const k = key(x1, y1); if (!edges.has(k)) edges.set(k, []); edges.get(k).push([x2, y2]); };
      let count = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!inside(x, y)) continue; count++;
        if (!inside(x, y - 1)) add(x, y, x + 1, y);
        if (!inside(x + 1, y)) add(x + 1, y, x + 1, y + 1);
        if (!inside(x, y + 1)) add(x + 1, y + 1, x, y + 1);
        if (!inside(x - 1, y)) add(x, y + 1, x, y);
      }
      if (count < 4) return '';
      const minArea = [0, 30, 12, 4][detail] || 8, eps = [0, 1.4, 0.9, 0.55][detail] || 0.9;
      let d = '';
      for (const [k0] of edges) {
        let list = edges.get(k0); if (!list || !list.length) continue;
        const loop = []; let [cx, cy] = k0.split(',').map(Number); const sx0 = cx, sy0 = cy;
        for (let guard = 0; guard < 400000; guard++) {
          loop.push([cx, cy]);
          const nl = edges.get(key(cx, cy)); if (!nl || !nl.length) break;
          const [nx, ny] = nl.pop(); if (!nl.length) edges.delete(key(cx, cy));
          cx = nx; cy = ny; if (cx === sx0 && cy === sy0) break;
        }
        if (loop.length < 4) continue;
        let area = 0; for (let i = 0; i < loop.length; i++) { const a = loop[i], b = loop[(i + 1) % loop.length]; area += a[0] * b[1] - b[0] * a[1]; }
        if (Math.abs(area / 2) < minArea) continue;
        { const N2 = loop.length, R2 = 2, sm = loop.map((_, i) => { let ax = 0, ay = 0; for (let k2 = -R2; k2 <= R2; k2++) { const q2 = loop[(i + k2 + N2) % N2]; ax += q2[0]; ay += q2[1]; } return [ax / (2 * R2 + 1), ay / (2 * R2 + 1)]; }); loop.splice(0, N2, ...sm); }
        let far = 0, fd = -1; for (let i = 1; i < loop.length; i++) { const dd = (loop[i][0] - loop[0][0]) ** 2 + (loop[i][1] - loop[0][1]) ** 2; if (dd > fd) { fd = dd; far = i; } } const simp = rdp(loop.slice(0, far + 1), eps).slice(0, -1).concat(rdp(loop.slice(far).concat([loop[0]]), eps)); simp.pop();
        if (simp.length < 3) continue;
        // köşeleri yumuşat: orta noktalar arası quadratic
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = simp.length;
        let m0 = mid(simp[n - 1], simp[0]); d += `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
        for (let i = 0; i < n; i++) {
          const p = simp[i], pv = simp[(i - 1 + n) % n], nx = simp[(i + 1) % n], m = mid(p, nx);
          const ax = p[0] - pv[0], ay = p[1] - pv[1], bx = nx[0] - p[0], by = nx[1] - p[1], cosA = (ax * bx + ay * by) / ((Math.hypot(ax, ay) * Math.hypot(bx, by)) || 1);
          // keskin köşe (≈ 60°'den fazla dönüş): köşeyi koru; yumuşak dönüş: eğri
          if (cosA < 0.5) d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)}L${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
          else d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
        }
        d += 'Z';
      }
      return d;
    }
    function rdp(pts, eps) {
      if (pts.length < 3) return pts.slice();
      const [a, b] = [pts[0], pts[pts.length - 1]]; let idx = -1, dm = 0;
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], dd = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L; if (dd > dm) { dm = dd; idx = i; } }
      if (dm > eps) { const l1 = rdp(pts.slice(0, idx + 1), eps), l2 = rdp(pts.slice(idx), eps); return l1.slice(0, -1).concat(l2); }
      return [a, b];
    }
    // ---- Ürün fotoğrafını otomatik iyileştir (ışık, kontrast, renk dengesi, canlılık, netlik)
    async function autoEnhance(l) {
      let c; try { c = await bakeImage(Object.assign({}, l, { w: l.w, h: l.h })); } catch (e) { UI.toast(e.message, true); return; }
      const sc = Math.min(1, 300 / Math.max(c.width, c.height)), t = document.createElement('canvas'); t.width = Math.max(1, Math.round(c.width * sc)); t.height = Math.max(1, Math.round(c.height * sc)); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
      const px = t.getContext('2d').getImageData(0, 0, t.width, t.height).data, lum = [], R2 = [], B2 = []; let satS = 0, n = 0;
      for (let i = 0; i < px.length; i += 4) { if (px[i + 3] < 128) continue; const r = px[i], g = px[i + 1], b = px[i + 2], Y = 0.2126 * r + 0.7152 * g + 0.0722 * b; lum.push(Y); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const sv = mx ? (mx - mn) / mx : 0; satS += sv; n++; if (Y > 50 && Y < 240 && sv < 0.22) { R2.push(r); B2.push(b); } }
      if (!n) return;
      lum.sort((a, b) => a - b); const pc = (q) => lum[Math.min(lum.length - 1, Math.floor(q * lum.length))];
      const lo = pc(0.02), hi = pc(0.98), med = pc(0.5), avgSat = satS / n;
      const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0), cast = avg(R2) - avg(B2);
      const f = Object.assign({}, l.filters || {});
      const span = Math.max(30, hi - lo);
      f.contrast = Math.round(Math.min(140, Math.max(100, (235 / span) * 100 * 0.85)));
      f.brightness = Math.round(Math.min(125, Math.max(96, 100 + (128 - med) * 0.2)));
      f.shadows = Math.round(Math.min(45, Math.max(0, (70 - pc(0.15)) * 0.6)));
      f.highlights = Math.round(-Math.min(40, Math.max(0, (hi - 235) * 2)));
      f.warmth = R2.length > n * 0.05 ? Math.round(Math.max(-30, Math.min(30, -cast * 0.8))) : 0;
      f.vibrance = Math.round(avgSat < 0.35 ? 35 : 15);
      f.sharpen = 30;
      l.filters = f; commit();
      UI.toast('Fotoğraf iyileştirildi — ayarları Filtreler’den ince ayarlayabilir, beğenmezsen Geri al');
    }
    // ---- Silgi: fotoğrafın maskesine çizer (bozmadan; "Geri getir" ile düzelir)
    async function eraserStart(l, p) {
      const k = Math.min(1, 1200 / Math.max(l.w, l.h)), W = Math.max(8, Math.round(l.w * k)), H = Math.max(8, Math.round(l.h * k));
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      const d = (st.drag = { mode: 'eraser', l, c, x, k, last: null, ready: false, queue: [p] });
      if (l.alphaMask) { try { const im = new Image(); im.crossOrigin = 'anonymous'; await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = l.alphaMask; }); x.drawImage(im, 0, 0, W, H); } catch (e) {} }
      d.ready = true; d.queue.forEach((q) => eraserMove(q, d)); d.queue = [];
    }
    function eraserMove(p, d = st.drag) {
      if (!d || d.mode !== 'eraser') return;
      st.hoverP = p;
      if (!d.ready) { d.queue.push(p); return; }
      const m = layerMatrix(d.l).inverse(), q = m.transformPoint(new DOMPoint(p.x, p.y)), X = q.x * d.k, Y = q.y * d.k;
      const r = Math.max(1, ((st.opts.eraserSize || 40) / 2) * d.k), soft = (st.opts.eraserSoft ?? 40) / 100, x = d.x;
      const col = st.opts.eraserRestore ? '255,255,255' : '0,0,0';
      const dot = (cx, cy) => { const g = x.createRadialGradient(cx, cy, r * (1 - soft) * 0.98, cx, cy, r); g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
      if (d.last) { const dist = Math.hypot(X - d.last.x, Y - d.last.y), n = Math.max(1, Math.ceil(dist / (r * 0.3))); for (let i = 1; i <= n; i++) dot(d.last.x + ((X - d.last.x) * i) / n, d.last.y + ((Y - d.last.y) * i) / n); } else dot(X, Y);
      d.last = { x: X, y: Y };
      if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; d.l.alphaMask = d.c.toDataURL('image/png'); renderSoon(); drawOverlay(); });
    }
    async function eraserEnd(d) {
      if (!d || !d.c) return;
      for (let i = 0; i < 40 && !d.ready; i++) await new Promise((r) => setTimeout(r, 50));
      cancelAnimationFrame(d.raf);
      d.l.alphaMask = d.c.toDataURL('image/png'); renderSoon();
      const url = await uploadCanvas(d.c, 'silgi-maske.png'); d.l.alphaMask = url || d.l.alphaMask; commit(); // tek geri alma adımı
    }
    function fit() {
      const r = vp.getBoundingClientRect();
      const pad = mobile() ? 28 : 70;
      st.zoom = clamp(Math.min((r.width - pad * 2) / doc.width, (r.height - pad * 2) / doc.height), 0.02, 4);
      st.pan = { x: (r.width - doc.width * st.zoom) / 2, y: (r.height - doc.height * st.zoom) / 2 };
      applyView();
    }
    function zoomAt(f, sx, sy) {
      const r = vp.getBoundingClientRect();
      if (sx == null) { sx = r.width / 2; sy = r.height / 2; }
      const nz = clamp(st.zoom * f, 0.02, 16);
      st.pan.x = sx - ((sx - st.pan.x) * nz) / st.zoom;
      st.pan.y = sy - ((sy - st.pan.y) * nz) / st.zoom;
      st.zoom = nz;
      applyView();
    }

    function drawOverlay() {
      const qb = $('#qBar', page); if (qb && !qb.hidden) { if (st.drag) qb.style.visibility = 'hidden'; else { qb.style.visibility = ''; placeQBar(); } }
      const r = vp.getBoundingClientRect();
      ov.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      let s = '';
      const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map((p) => { const q = toScreen(p.x, p.y); return q.x + ',' + q.y; }).join(' ')}"/>`;
      if (st.hover && !st.sel.includes(st.hover) && !st.drag) { const l = byId(st.hover); if (l) s += poly(corners(l), 'hov'); }
      if (st.rulers || (doc.meta && doc.meta.guides && doc.meta.guides.length)) {
        (doc.meta && doc.meta.guides || []).forEach((g, i) => {
          if (g.x != null) { const q = toScreen(g.x, 0).x; s += `<line class="uguide" x1="${q}" y1="0" x2="${q}" y2="${r.height}"/><line class="uguide-hit" data-g="${i}" data-ax="x" x1="${q}" y1="0" x2="${q}" y2="${r.height}"/>`; }
          else { const q = toScreen(0, g.y).y; s += `<line class="uguide" x1="0" y1="${q}" x2="${r.width}" y2="${q}"/><line class="uguide-hit" data-g="${i}" data-ax="y" x1="0" y1="${q}" x2="${r.width}" y2="${q}"/>`; }
        });
        if (st.guideTag) { const t = st.guideTag, ppm = window.Tools.pxPerMM(doc), txt = ppm ? (t.v / ppm).toFixed(1) + ' mm' : t.v + ' px'; s += `<rect class="size-tag" x="${t.cx + 10}" y="${t.cy + 8}" width="${txt.length * 6.6 + 12}" height="18" rx="4"/><text x="${t.cx + 16}" y="${t.cy + 21}">${txt}</text>`; }
      }
      const sel = selected();
      for (const l of sel) s += poly(corners(l), 'sel');
      const l = one();
      const hs = mobile() ? 11 : 8;
      if (l && !l.locked && !st.editing && st.tool === 'select') {
        const cs = corners(l).map((p) => toScreen(p.x, p.y));
        const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const H = { nw: cs[0], ne: cs[1], se: cs[2], sw: cs[3], n: mid(cs[0], cs[1]), e: mid(cs[1], cs[2]), s: mid(cs[2], cs[3]), w: mid(cs[3], cs[0]) };
        const keys = l.type === 'text' ? ['nw', 'ne', 'se', 'sw', 'e', 'w'] : Object.keys(H);
        const curs = { nw: 'nwse', se: 'nwse', ne: 'nesw', sw: 'nesw', n: 'ns', s: 'ns', e: 'ew', w: 'ew' };
        for (const k of keys) s += `<rect class="hdl" data-h="${k}" x="${H[k].x - hs / 2}" y="${H[k].y - hs / 2}" width="${hs}" height="${hs}" rx="2" style="cursor:${curs[k]}-resize"/>`;
        const a = rad(l.rotation || 0);
        const top = H.n, rx = top.x + Math.sin(a) * 26, ry = top.y - Math.cos(a) * 26;
        s += `<line x1="${top.x}" y1="${top.y}" x2="${rx}" y2="${ry}" class="sel"/><circle class="rot" data-h="rot" cx="${rx}" cy="${ry}" r="${hs / 2 + 1}"/>`;
        if (st.drag && (st.drag.mode === 'resize' || st.drag.mode === 'rotate')) {
          const t = st.drag.mode === 'rotate' ? Math.round(l.rotation) + '°' : `${Math.round(l.w)} × ${Math.round(l.h)}`;
          const p = toScreen(center(l).x, bbox(l).y2);
          s += `<rect class="size-tag" x="${p.x - 34}" y="${p.y + 12}" width="68" height="20" rx="5"/><text x="${p.x}" y="${p.y + 26}" text-anchor="middle">${t}</text>`;
        }
      } else if (sel.length > 1) {
        const b = unionBox(sel), a = toScreen(b.x, b.y), c = toScreen(b.x2, b.y2);
        s += `<rect class="sel" x="${a.x}" y="${a.y}" width="${c.x - a.x}" height="${c.y - a.y}" stroke-dasharray="4 3"/>`;
      }
      ((doc.meta && doc.meta.review && doc.meta.review.comments) || []).forEach((c, i) => { if (c.done && st.flashC !== i) return; const q = toScreen(c.x, c.y); s += `<g class="pin${st.flashC === i ? ' flash' : ''}${c.done ? ' done' : ''}" transform="translate(${q.x} ${q.y})"><path d="M0 0 C-12 -10 -12 -26 0 -26 C12 -26 12 -10 0 0Z"/><text y="-13" text-anchor="middle">${i + 1}</text></g>`; });
      const gc = gridCols();
      if (gc.length && doc.meta.grid.show) gc.forEach((c) => { const a = toScreen(c.x, 0), z = toScreen(c.x + c.w, doc.height); s += `<rect class="colgrid" x="${a.x}" y="${a.y}" width="${z.x - a.x}" height="${z.y - a.y}"/>`; });
      if (st.drag && st.dist && st.dist.length) for (const m of st.dist) {
        if (m.v < 0.5) continue;
        const lbl = Math.round(m.v) + '';
        if (m.h) { const a = toScreen(m.x1, m.y1), z = toScreen(m.x2, m.y1); s += `<line class="dist${st.dist.eq ? ' eq' : ''}" x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}"/><rect class="dist-tag" x="${(a.x + z.x) / 2 - lbl.length * 3.6 - 5}" y="${a.y - 20}" width="${lbl.length * 7.2 + 10}" height="16" rx="3"/><text class="dist-t" x="${(a.x + z.x) / 2}" y="${a.y - 8}" text-anchor="middle">${lbl}</text>`; }
        else { const a = toScreen(m.x1, m.y1), z = toScreen(m.x1, m.y2); s += `<line class="dist${st.dist.eqY ? ' eq' : ''}" x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}"/><rect class="dist-tag" x="${a.x + 4}" y="${(a.y + z.y) / 2 - 8}" width="${lbl.length * 7.2 + 10}" height="16" rx="3"/><text class="dist-t" x="${a.x + 9 + lbl.length * 3.6}" y="${(a.y + z.y) / 2 + 4}" text-anchor="middle">${lbl}</text>`; }
      }
      for (const g of st.guides) {
        if (g.x != null) { const p = toScreen(g.x, 0); s += `<line class="guide" x1="${p.x}" y1="0" x2="${p.x}" y2="${r.height}"/>`; }
        else { const p = toScreen(0, g.y); s += `<line class="guide" x1="0" y1="${p.y}" x2="${r.width}" y2="${p.y}"/>`; }
      }
      if (st.drag && st.drag.mode === 'marquee') {
        const a = toScreen(Math.min(st.drag.p0.x, st.drag.p1.x), Math.min(st.drag.p0.y, st.drag.p1.y));
        const c = toScreen(Math.max(st.drag.p0.x, st.drag.p1.x), Math.max(st.drag.p0.y, st.drag.p1.y));
        s += `<rect class="marq" x="${a.x}" y="${a.y}" width="${c.x - a.x}" height="${c.y - a.y}"/>`;
      }
      if (st.drag && st.drag.mode === 'create') {
        const a = toScreen(st.drag.p0.x, st.drag.p0.y), c = toScreen(st.drag.p1.x, st.drag.p1.y);
        if (st.drag.kind === 'line') s += `<line class="pen" x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}"/>`;
        else s += `<rect class="marq" x="${Math.min(a.x, c.x)}" y="${Math.min(a.y, c.y)}" width="${Math.abs(c.x - a.x)}" height="${Math.abs(c.y - a.y)}"/>`;
      }
      if (st.drag && st.drag.mode === 'lasso') {
        const pts = st.drag.pts.map((q) => toScreen(q.x, q.y));
        s += `<polygon class="marq lasso" points="${pts.map((q) => q.x + ',' + q.y).join(' ')}"/>`;
      }
      if (st.drag && st.drag.mode === 'brush') {
        const pts = st.drag.pts.map((p) => toScreen(p.x, p.y));
        s += `<polyline points="${pts.map((p) => p.x + ',' + p.y).join(' ')}" fill="none" stroke="${st.opts.brush}" stroke-width="${st.opts.brushSize * st.zoom}" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
      }
      if (st.alt && st.sel.length && !st.drag && st.tool === 'select') s += measureSVG();
      if (st.drag && st.drag.mode === 'gradient') { const a = toScreen(st.drag.p0.x, st.drag.p0.y), b = toScreen(st.drag.p1.x, st.drag.p1.y); s += `<line class="gradln" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><circle class="gradpt" cx="${a.x}" cy="${a.y}" r="5" style="fill:${st.opts.grad1}"/><circle class="gradpt" cx="${b.x}" cy="${b.y}" r="5" style="fill:${st.opts.grad2}"/>`; }
      if (st.drag && st.drag.mode === 'zoombox') { const b = normBox(st.drag.p0, st.drag.p1), a = toScreen(b.x, b.y); s += `<rect class="marq" x="${a.x}" y="${a.y}" width="${b.w * st.zoom}" height="${b.h * st.zoom}"/>`; }
      if (st.cropBox && st.tool === 'crop') { const b = st.cropBox, a = toScreen(b.x, b.y), o = toScreen(0, 0), W2 = doc.width * st.zoom, H2 = doc.height * st.zoom, w = b.w * st.zoom, h = b.h * st.zoom;
        s += `<path class="cropshade" fill-rule="evenodd" d="M${o.x - 4000} ${o.y - 4000}h${W2 + 8000}v${H2 + 8000}h${-W2 - 8000}Z M${a.x} ${a.y}h${w}v${h}h${-w}Z"/><rect class="cropbox" x="${a.x}" y="${a.y}" width="${w}" height="${h}"/>`;
        for (let i = 1; i < 3; i++) s += `<line class="cropgrid" x1="${a.x + (w * i) / 3}" y1="${a.y}" x2="${a.x + (w * i) / 3}" y2="${a.y + h}"/><line class="cropgrid" x1="${a.x}" y1="${a.y + (h * i) / 3}" x2="${a.x + w}" y2="${a.y + (h * i) / 3}"/>`; }
      if (st.tool === 'heal' && st.hoverP) { const q = toScreen(st.hoverP.x, st.hoverP.y); s += `<circle class="ercur" cx="${q.x}" cy="${q.y}" r="${(st.opts.healSize / 2) * st.zoom}"/>`;
        if (st.opts.healMode === 'clone' && st.cloneSrc) { const off = st.drag && st.drag.mode === 'heal' ? st.drag.off : null; const sp = off ? { x: st.hoverP.x + off.x, y: st.hoverP.y + off.y } : st.cloneSrc.p, c = toScreen(sp.x, sp.y); s += `<g class="clsrc"><circle cx="${c.x}" cy="${c.y}" r="${(st.opts.healSize / 2) * st.zoom}"/><path d="M${c.x - 7} ${c.y}h14M${c.x} ${c.y - 7}v14"/></g>`; } }
      if (st.drag && st.drag.mode === 'heal' && st.drag.paint) { s += `<path class="healpaint" d="${st.drag.paint}" stroke-width="${st.opts.healSize * st.zoom}"/>`; }
      if (st.tool === 'eraser' && st.hoverP) { const q = toScreen(st.hoverP.x, st.hoverP.y); s += `<circle class="ercur" cx="${q.x}" cy="${q.y}" r="${((st.opts.eraserSize || 40) / 2) * st.zoom}"/>`; }
      if (st.pen && st.pen.pts.length) {
        const P2 = st.pen.pts, S2 = (p) => toScreen(p.x, p.y);
        s += `<path class="pen" fill="none" d="${penD(P2, false, S2)}"/>`;
        if (st.pen.cur && !st.drag) { const a = P2[P2.length - 1], c1 = S2({ x: a.x + (a.hx || 0), y: a.y + (a.hy || 0) }), A2 = S2(a), cu = S2(st.pen.cur); s += `<path class="pen ghost" fill="none" d="M${A2.x} ${A2.y} Q${c1.x} ${c1.y} ${cu.x} ${cu.y}"/>`; }
        P2.forEach((p, i) => {
          const q = S2(p);
          if (p.hx || p.hy) { const o = S2({ x: p.x + p.hx, y: p.y + p.hy }), n = S2({ x: p.x - p.hx, y: p.y - p.hy }); s += `<line class="penh" x1="${n.x}" y1="${n.y}" x2="${o.x}" y2="${o.y}"/><circle class="penhd" cx="${o.x}" cy="${o.y}" r="3.5"/><circle class="penhd" cx="${n.x}" cy="${n.y}" r="3.5"/>`; }
          s += `<rect class="penpt${i === 0 && P2.length > 2 ? ' first' : ''}" x="${q.x - 4}" y="${q.y - 4}" width="8" height="8"/>`;
        });
      }
      const die = doc.meta && doc.meta.die;
      if (die && die.shape && die.shape !== 'none' && die.wmm) {
        const o = toScreen(0, 0);
        const dp = window.Tools.diePathSVG(die, doc.width, doc.height), tf = `translate(${o.x} ${o.y}) scale(${st.zoom})`;
        s = `<path class="die-bg" d="${dp}" transform="${tf}" vector-effect="non-scaling-stroke"/><path class="die" d="${dp}" transform="${tf}" vector-effect="non-scaling-stroke"/>` + s;
      }
      ov.innerHTML = s;
    }

    // ---------- seçim ve araç
    function expandGroups(ids) {
      const gs = new Set(ids.map((id) => (byId(id) || {}).group).filter(Boolean));
      return gs.size ? [...new Set([...ids, ...doc.layers.filter((l) => gs.has(l.group) && !l.locked).map((l) => l.id)])] : ids;
    }
    function select(ids, add, raw) {
      ids = ids.filter(Boolean);
      if (!raw) ids = expandGroups(ids);
      if (add) { for (const id of ids) st.sel = st.sel.includes(id) ? st.sel.filter((x) => x !== id) : [...st.sel, id]; }
      else st.sel = ids;
      drawOverlay(); renderPanel(); renderCtx();
    }
    function renderHint() {
      let el = $('#photoHint', page);
      const l = one();
      const placeholder = l && typeof l.src === 'string' && l.src.startsWith('data:image/svg');
      let seen = 0; try { seen = +localStorage.getItem('ts_photohint') || 0; } catch (e) {}
      const show = l && l.type === 'image' && !placeholder && l.role !== 'photo' && !(doc.meta && doc.meta.template) && seen < 3 && st.tool === 'select' && !st.editing && l.w * l.h > doc.width * doc.height * 0.25;
      if (!show) { if (el) el.remove(); return; }
      if (el) return;
      el = document.createElement('div');
      el.id = 'photoHint'; el.className = 'photo-hint'; try { localStorage.setItem('ts_photohint', String(seen + 1)); } catch (e) {}
      const ai = ((window.App.S.settings || {}).provider || 'local') !== 'local';
      el.innerHTML = `${icon('retext')}<span><b>Fotoğraftaki bir yazıyı değiştirmek için yazının üzerine tıkla.</b> ${window.Features.imageReady() ? 'Aynı stille değiştirebilir ya da düzenlenebilir yazıya çevirebilirsin.' : 'Eski yazı silinir, yerine düzenlenebilir yazı gelir.'}</span><button class="btn sm primary" id="hintDec">${icon('layers')}Katmanlara ayır</button>${doc.layers.some((x) => x.role === 'patch' || x.role === 'retext') ? `<button class="btn sm" id="hintUndo">${icon('undo')}Değişiklikleri kaldır</button>` : ''}<button class="btn ghost sm icon" id="hintX" title="Kapat">${icon('x')}</button>`;
      vp.appendChild(el);
      M.animate(el, { opacity: [0, 1], y: [-10, 0] }, { stiffness: 420, damping: 30 });
      $('#hintDec', el).onclick = (e) => { e.stopPropagation(); el.remove(); decomposeImage(l); };
      const hu = $('#hintUndo', el); if (hu) hu.onclick = (e) => { e.stopPropagation(); removeRetexts(); el.remove(); };
      $('#hintX', el).onclick = (e) => { e.stopPropagation(); el.remove(); st.hintOff = true; };
      ['pointerdown'].forEach((ev) => el.addEventListener(ev, (e) => e.stopPropagation()));
      if (st.hintOff) el.remove();
    }
    // ---------- bağlama duyarlı hızlı işlem çubuğu (masaüstü, seçimin üstünde)
    function qActions(ls, l) {
      const b = (c, ic, t, cls = '') => `<button data-q="${c}" title="${t}" class="${cls}">${icon(ic)}<span>${t}</span></button>`;
      const sep = '<i class="q-sep"></i>';
      let h = '';
      if (l && l.type === 'text') h += b('edit', 'type', 'Düzenle') + `<button data-q="fs-" title="Küçült" class="q-ic">A−</button><button data-q="fs+" title="Büyüt" class="q-ic">A+</button>` + `<label class="q-col" title="Renk"><input type="color" data-q-col="fill" value="${R.toHex(typeof l.fill === 'string' ? l.fill : '#000000')}"></label>` + b('bold', 'type', 'Kalın', +l.fontWeight >= 700 ? 'on' : '') + b('aiw', 'sparkle', 'YZ yaz') + sep;
      else if (l && l.type === 'image') h += b('img', 'image', 'Değiştir') + b('rbg', 'wand', 'Arka planı sil') + b('mask', 'brush', 'Maske') + b('expand', 'fit', 'Genişlet') + b('gfill', 'sparkle', 'Doldur') + sep;
      else if (l && isShape(l)) h += `<label class="q-col" title="Dolgu"><input type="color" data-q-col="fill" value="${R.toHex(typeof l.fill === 'string' && l.fill !== 'none' ? l.fill : '#888888')}"></label>` + b('nodes', 'vector', 'Noktalar') + sep;
      else if (ls.length > 1 && ls.every(isShape)) h += b('pf-union', 'layers', 'Birleştir') + b('pf-subtract', 'layers', 'Çıkar') + sep;
      if (ls.length > 1) h += b('alignC', 'align-center', 'Ortala') + b('group', 'layers', ls.every((x) => x.group && x.group === ls[0].group) ? 'Grubu çöz' : 'Grupla') + sep;
      h += b('anim', 'eye', 'Animasyon') + b('dup', 'copy', 'Çoğalt') + b('lock', 'lock', 'Kilitle') + b('del', 'trash', 'Sil', 'danger') + `<button data-q="more" title="Daha fazla" class="q-ic">⋯</button>`;
      return h;
    }
    function placeQBar() {
      const bar = $('#qBar', page); if (!bar || bar.hidden) return;
      const ls = selected(); if (!ls.length) return;
      const pts = ls.flatMap((l) => corners(l)).map((p) => toScreen(p.x, p.y));
      const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x)), minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
      const r = vp.getBoundingClientRect(), bw = bar.offsetWidth, bh = bar.offsetHeight;
      let x = (minX + maxX) / 2 - bw / 2, y = minY - bh - 44;
      if (y < 8) y = maxY + 16;
      if (y + bh > r.height - 8) y = Math.max(8, Math.min(r.height - bh - 8, minY + 8));
      x = Math.max(8, Math.min(r.width - bw - 8, x));
      bar.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
    function renderQBar() {
      const bar = $('#qBar', page); if (!bar) return;
      const ls = selected(), l = one();
      const show = !mobile() && ls.length && !st.editing && st.tool === 'select' && !st.drag && !(l && l.type === 'adjust') && st.opts.qbar !== false;
      if (!show) { bar.hidden = true; return; }
      const wasHidden = bar.hidden;
      bar.hidden = false; bar.innerHTML = qActions(ls, l); placeQBar();
      bar.onpointerdown = (e) => e.stopPropagation();
      $$('[data-q-col]', bar).forEach((inp) => { inp.oninput = () => { selected().forEach((x) => (x[inp.dataset.qCol] = inp.value)); renderCanvas(); }; inp.onchange = () => commit(); });
      $$('[data-q]', bar).forEach((btn) => (btn.onclick = (e) => {
        e.stopPropagation();
        const c = btn.dataset.q, o = one();
        if (c === 'edit') editText(o);
        if (c === 'fs-' || c === 'fs+') { selected().forEach((x) => { if (x.type === 'text') { x.fontSize = r1(x.fontSize * (c === 'fs+' ? 1.1 : 1 / 1.1)); R.layoutText(x); } }); commit(); }
        if (c === 'bold') { selected().forEach((x) => (x.fontWeight = +x.fontWeight >= 700 ? 400 : 800)); selected().forEach((x) => x.type === 'text' && R.layoutText(x)); commit(); }
        if (c === 'aiw') aiWriteDialog(o);
        if (c === 'img') replaceImage(o);
        if (c === 'rbg') removeBg(o);
        if (c === 'mask') maskEditor(o);
        if (c === 'expand') expandImage(o);
        if (c === 'gfill') genFill(o);
        if (c === 'nodes') nodeEditor(o);
        if (c.startsWith('pf-')) pathfinder(c.slice(3));
        if (c === 'alignC') { const ls2 = selected(), u = unionBox(ls2), cx = (u.x + u.x2) / 2; ls2.forEach((x) => (x.x = cx - x.w / 2)); commit(); }
        if (c === 'group') { const ls2 = selected(); const grouped = ls2.every((x) => x.group && x.group === ls2[0].group); const g = grouped ? null : R.uid(); ls2.forEach((x) => { if (g) x.group = g; else delete x.group; }); commit(); UI.toast(g ? 'Gruplandı' : 'Grup çözüldü'); }
        if (c === 'anim') { st.tab = 'props'; renderPanel(); const ap = $('.anim-row', pbody); if (ap) ap.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        if (c === 'dup') duplicate();
        if (c === 'lock') { selected().forEach((x) => (x.locked = true)); st.sel = []; commit(); UI.toast('Kilitlendi — Katmanlar panelinden açabilirsin'); }
        if (c === 'del') remove();
        if (c === 'more') { const r2 = btn.getBoundingClientRect(), u = unionBox(selected()); openCtxMenu(r2.left, r2.bottom + 6, { x: (u.x + u.x2) / 2, y: (u.y + u.y2) / 2 }, false); }
      }));
      if (wasHidden && window.Motion) M.animate(bar, { opacity: [0, 1], scale: [.97, 1] }, { stiffness: 520, damping: 32 });
    }
    function renderCtx() {
      renderQBar();
      renderHint();
      const bar = $('#ctxBar', page);
      if (!bar) return;
      const ls = selected(), l = one();
      const show = mobile() && ls.length && !st.editing && st.tool === 'select' && !st.drag;
      if (!show) { bar.hidden = true; return; }
      const wasHidden = bar.hidden;
      bar.hidden = false;
      bar.innerHTML = (l && l.type === 'text' ? `<button data-c="edit">${icon('type')}<span>Yaz</span></button>` : '')
        + (l && l.type === 'image' ? `<button data-c="img">${icon('image')}<span>Değiştir</span></button><button data-c="fill">${icon('fit')}<span>Kapla</span></button>` : '')
        + `<button data-c="props">${icon('sliders')}<span>Özellik</span></button><button data-c="dup">${icon('copy')}<span>Çoğalt</span></button><button data-c="front">${icon('front')}<span>Öne</span></button><button data-c="del" class="danger">${icon('trash')}<span>Sil</span></button>`;
      $$('[data-c]', bar).forEach((b) => (b.onclick = (e) => {
        e.stopPropagation();
        const c = b.dataset.c;
        if (c === 'edit') editText(one());
        if (c === 'img') replaceImage(one());
        if (c === 'fill') fillCanvas(one());
        if (c === 'props') { st.tab = 'props'; renderPanel(); togglePanel(true); }
        if (c === 'dup') duplicate();
        if (c === 'front') arrange('front');
        if (c === 'del') remove();
      }));
      if (wasHidden) M.animate(bar, { opacity: [0, 1], y: [10, 0], scale: [.96, 1] }, { stiffness: 500, damping: 30 });
    }
    function setTool(t) {
      if (st.pen && t !== 'pen') finishPen();
      if (t === 'image') { addImage(); return; }
      st.tool = t;
      $$('.tool', page).forEach((b) => b.classList.toggle('on', b.dataset.t === t));
      vp.classList.toggle('hand', t === 'hand');
      vp.classList.toggle('draw', ['rect', 'ellipse', 'star', 'triangle', 'line', 'pen', 'brush', 'retext', 'lift', 'gradient', 'crop'].includes(t));
      vp.classList.toggle('erasing', t === 'eraser' || t === 'heal'); vp.classList.toggle('picking2', t === 'eyedrop'); vp.classList.toggle('zooming', t === 'zoom');
      if (t !== 'crop' && st.cropBox) { st.cropBox = null; }
      vp.classList.toggle('texting', t === 'text');
      drawOverlay(); renderToolOpts();
    }
    $$('.tool', page).forEach((b) => (b.onclick = () => setTool(b.dataset.t)));

    function renderToolOpts() {
      const box = $('#topts', page);
      const t = st.tool;
      const color = (k, label) => `<label class="color" style="flex:none;width:auto"><input type="color" data-o="${k}" value="${R.toHex(st.opts[k])}"><span>${label}</span></label>`;
      let h = '';
      if (['rect', 'ellipse', 'star', 'triangle'].includes(t)) h = `${color('fill', 'Dolgu')}<span>Sürükleyerek çiz · Shift kare/daire</span>`;
      else if (t === 'line') h = `${color('stroke', 'Renk')}<span>Kalınlık</span><input type="range" data-o="strokeWidth" min="1" max="60" value="${Math.max(1, st.opts.strokeWidth || 6)}">`;
      else if (t === 'brush') h = `${color('brush', 'Renk')}<span>Boyut</span><input type="range" data-o="brushSize" min="1" max="120" value="${st.opts.brushSize}"><output>${st.opts.brushSize}</output>`;
      else if (t === 'pen') h = `${color('stroke', 'Kenar')}<label class="switch"><input type="checkbox" data-o="penFill" ${st.opts.penFill ? 'checked' : ''}>Dolgulu</label><span>Tıkla: nokta · Çift tık / Enter: bitir · İlk noktaya tıkla: kapat</span>`;
      else if (t === 'text') h = `${color('textColor', 'Renk')}<span>Tuvale tıkla ve yaz</span>`;
 else if (t === 'lift') h = `<div class="seg"><button data-lm="rect" class="${st.opts.liftMode !== 'lasso' ? 'on' : ''}">${icon('square')}Dikdörtgen</button><button data-lm="lasso" class="${st.opts.liftMode === 'lasso' ? 'on' : ''}">${icon('vector')}Serbest</button></div>${st.opts.liftMode !== 'lasso' ? `<label class="switch"><input type="checkbox" data-o="liftObject" ${st.opts.liftObject !== false ? 'checked' : ''}>Zemini alma (yazı/logo için)</label>` : ''}<span>${st.opts.liftMode === 'lasso' ? 'Nesnenin çevresini çiz' : 'Ayırmak istediğin yeri işaretle'}</span>`;
      else if (t === 'eraser') h = `<span>Boyut</span><input type="range" data-o="eraserSize" min="4" max="300" value="${st.opts.eraserSize || 40}"><output>${st.opts.eraserSize || 40}</output><span>Yumuşaklık</span><input type="range" data-o="eraserSoft" min="0" max="100" value="${st.opts.eraserSoft ?? 40}"><label class="switch"><input type="checkbox" data-o="eraserRestore" ${st.opts.eraserRestore ? 'checked' : ''}>Geri getir</label><span>Fotoğrafın üzerinde sürükle</span>`;
      else if (t === 'heal') h = `<div class="seg"><button data-hm="spot" class="${st.opts.healMode !== 'clone' ? 'on' : ''}">Leke düzelt</button><button data-hm="clone" class="${st.opts.healMode === 'clone' ? 'on' : ''}">Klon damgası</button></div><span>Boyut</span><input type="range" data-o="healSize" min="4" max="300" value="${st.opts.healSize}"><output>${st.opts.healSize}</output>${st.opts.healMode === 'clone' ? `<button class="btn sm ${st.cloneArm ? 'primary' : 'ghost'}" data-hsrc="1">${icon('target')}Kaynak seç</button><span>${st.cloneSrc ? 'Şimdi düzeltilecek yeri boya' : 'Alt + tık (ya da “Kaynak seç”): kopyalanacak yer'}</span>` : '<span>Lekenin üzerini boya, bırakınca çevresiyle doldurulur</span>'}`;
      else if (t === 'gradient') h = `${color('grad1', '1. renk')}${color('grad2', '2. renk')}<div class="seg"><button data-gk="linear" class="${st.opts.gradKind !== 'radial' ? 'on' : ''}">Doğrusal</button><button data-gk="radial" class="${st.opts.gradKind === 'radial' ? 'on' : ''}">Dairesel</button></div><span>Şekil seç, üzerinde yön ver diye sürükle</span>`;
      else if (t === 'eyedrop') h = `<span>Tasarımda bir noktaya tıkla: seçili katmana o renk verilir (seçim yoksa çizim rengi olur)</span>`;
      else if (t === 'crop') h = st.cropBox ? `<span>${Math.round(st.cropBox.w)} × ${Math.round(st.cropBox.h)} px</span><button class="btn sm primary" data-crop="ok">${icon('check')}Kırp</button><button class="btn sm ghost" data-crop="no">Vazgeç</button>` : `<span>Tuvalde saklamak istediğin alanı çiz · Enter: uygula · Esc: vazgeç</span>`;
      else if (t === 'zoom') h = `<span>Tıkla: yakınlaştır · Alt + tıkla: uzaklaştır · sürükle: alana yakınlaştır</span><button class="btn sm ghost" data-zf="1">%100</button><button class="btn sm ghost" data-zf="fit">Sığdır</button>`;
      else if (t === 'retext') h = `<span>Fotoğraftaki yazının üzerine kutu çiz — zeminle kapatılır, yerine düzenlenebilir yazı gelir</span>`;
      box.hidden = !h;
      box.innerHTML = h;
      $$('[data-lm]', box).forEach((b) => (b.onclick = () => { st.opts.liftMode = b.dataset.lm; renderToolOpts(); }));
      $$('[data-hm]', box).forEach((b) => (b.onclick = () => { st.opts.healMode = b.dataset.hm; renderToolOpts(); drawOverlay(); }));
      $$('[data-hsrc]', box).forEach((b) => (b.onclick = () => { st.cloneArm = !st.cloneArm; renderToolOpts(); }));
      $$('[data-gk]', box).forEach((b) => (b.onclick = () => { st.opts.gradKind = b.dataset.gk; renderToolOpts(); }));
      $$('[data-crop]', box).forEach((b) => (b.onclick = () => (b.dataset.crop === 'ok' ? applyCrop() : (st.cropBox = null, drawOverlay(), renderToolOpts()))));
      $$('[data-zf]', box).forEach((b) => (b.onclick = () => { if (b.dataset.zf === 'fit') fit(); else zoomAt(1 / st.zoom); }));
      $$('[data-o]', box).forEach((i) => (i.oninput = () => {
        st.opts[i.dataset.o] = i.type === 'checkbox' ? i.checked : i.type === 'range' ? +i.value : i.value;
        const o = i.parentElement.querySelector('output'); if (o) o.textContent = i.value;
      }));
    }

    // ---------- katman oluşturma
    function addLayer(l, selectIt = true) {
      l = Object.assign({ id: R.uid(), rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' }, l);
      if (l.type === 'text') R.layoutText(l);
      doc.layers.push(l);
      if (selectIt) st.sel = [l.id];
      commit();
      return l;
    }
    function shapeLayer(kind, x, y, w, h) {
      const base = { x, y, w, h, fill: st.opts.fill, name: { rect: 'Dikdörtgen', ellipse: 'Elips', star: 'Yıldız', triangle: 'Üçgen' }[kind] };
      if (kind === 'rect') return { ...base, type: 'rect', radius: 0 };
      if (kind === 'ellipse') return { ...base, type: 'ellipse' };
      if (kind === 'star') return { ...base, type: 'path', d: starD(5, 0.45), vw: 100, vh: 100 };
      return { ...base, type: 'path', d: 'M50 0 L100 100 L0 100 Z', vw: 100, vh: 100 };
    }
    function pathFromPoints(pts, closed, smooth) {
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const mnx = Math.min(...xs), mny = Math.min(...ys);
      const w = Math.max(1, Math.max(...xs) - mnx), h = Math.max(1, Math.max(...ys) - mny);
      const q = pts.map((p) => ({ x: r1(p.x - mnx), y: r1(p.y - mny) }));
      let d = `M${q[0].x} ${q[0].y}`;
      if (smooth && q.length > 2) {
        for (let i = 1; i < q.length - 1; i++) {
          const mx = r1((q[i].x + q[i + 1].x) / 2), my = r1((q[i].y + q[i + 1].y) / 2);
          d += ` Q${q[i].x} ${q[i].y} ${mx} ${my}`;
        }
        d += ` L${q[q.length - 1].x} ${q[q.length - 1].y}`;
      } else d += q.slice(1).map((p) => ` L${p.x} ${p.y}`).join('');
      if (closed) d += ' Z';
      return { x: mnx, y: mny, w, h, vw: w, vh: h, d };
    }
    // kalem: her noktanın isteğe bağlı kavis tutamacı var (hx, hy = çıkış; giriş = tersi)
    function penSegs(pts, closed) {
      const out = [], n = pts.length;
      for (let i = 0; i < (closed ? n : n - 1); i++) { const a = pts[i], b = pts[(i + 1) % n]; out.push([a, { x: a.x + (a.hx || 0), y: a.y + (a.hy || 0) }, { x: b.x - (b.hx || 0), y: b.y - (b.hy || 0) }, b]); }
      return out;
    }
    function penD(pts, closed, map = (p) => p) {
      const f = map(pts[0]); let d = `M${r1(f.x)} ${r1(f.y)}`;
      penSegs(pts, closed).forEach(([a, c1, c2, b]) => { const B = map(b); if (!(a.hx || a.hy || b.hx || b.hy)) d += ` L${r1(B.x)} ${r1(B.y)}`; else { const C1 = map(c1), C2 = map(c2); d += ` C${r1(C1.x)} ${r1(C1.y)} ${r1(C2.x)} ${r1(C2.y)} ${r1(B.x)} ${r1(B.y)}`; } });
      return closed ? d + ' Z' : d;
    }
    function penPath(pts, closed) {
      const xs = [], ys = [];
      pts.forEach((p) => { xs.push(p.x); ys.push(p.y); });
      penSegs(pts, closed).forEach(([a, c1, c2, b]) => { for (let k = 1; k < 16; k++) { const t = k / 16, u = 1 - t; xs.push(u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x); ys.push(u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y); } });
      const mnx = Math.min(...xs), mny = Math.min(...ys), w = Math.max(1, Math.max(...xs) - mnx), h = Math.max(1, Math.max(...ys) - mny);
      return { x: mnx, y: mny, w, h, vw: w, vh: h, d: penD(pts, closed, (p) => ({ x: p.x - mnx, y: p.y - mny })) };
    }
    function finishPen(close) {
      const pen = st.pen; st.pen = null;
      if (!pen || pen.pts.length < 2) { drawOverlay(); return; }
      const closed = !!close || !!st.opts.penFill;
      const g = penPath(pen.pts, closed);
      addLayer({ type: 'path', name: closed ? 'Özel şekil' : 'Vektör yol', ...g, fill: closed ? st.opts.fill : 'none', stroke: closed && !st.opts.penStroke ? 'none' : st.opts.stroke, strokeWidth: Math.max(2, st.opts.strokeWidth || 4) });
      setTool('select');
    }
    async function addImage(src) {
      if (!src) {
        window.App.pickFiles(async (files) => {
          for (const f of files) {
            try { const r = await window.App.uploadFile(f); await placeImage(r.url); } catch (e) { UI.toast(e.message, true); }
          }
        });
        return;
      }
      await placeImage(src);
    }
    function frameAt(at) {
      const l = at ? hit(at) : one();
      return l && l.type === 'image' && (l.role === 'frame' || l.role === 'photo') ? l : null;
    }
    function placeImage(url, at) {
      const fr = frameAt(at);
      if (fr) {
        // çerçeveye yerleştir: çerçevenin şekli ve boyutu korunur, fotoğraf içini doldurur
        fr.src = url; delete fr.nw; delete fr.nh; fr.fit = 'cover'; fr.zoom = 1; fr.ox = 0; fr.oy = 0; fr.role = 'frame';
        return R.ensureImageSizes(doc).then(() => { st.sel = [fr.id]; commit(); UI.toast('Fotoğraf çerçeveye yerleşti — Kırp ve konumla ile içinde kaydırabilirsin'); });
      }
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => {
          const sc = Math.min((doc.width * 0.6) / img.naturalWidth, (doc.height * 0.6) / img.naturalHeight, 1);
          const w = img.naturalWidth * sc, h = img.naturalHeight * sc;
          const x = at ? at.x - w / 2 : (doc.width - w) / 2, y = at ? at.y - h / 2 : (doc.height - h) / 2;
          addLayer({ type: 'image', name: 'Görsel', src: url, nw: img.naturalWidth, nh: img.naturalHeight, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fit: 'cover', filters: {}, radius: 0 });
          setTool('select');
          res();
        };
        img.onerror = () => { UI.toast('Görsel açılamadı', true); res(); };
        img.src = url;
      });
    }

    // ---------- metin düzenleme (yerinde)
    function editText(l) {
      if (!l || l.type !== 'text' || l.locked) return;
      endTextEdit();
      st.editing = l;
      const ta = document.createElement('textarea');
      ta.className = 'text-edit';
      ta.value = l.text || '';
      ta.spellcheck = false;
      vp.appendChild(ta);
      st.editing.ta = ta;
      ta.addEventListener('input', () => { l.text = ta.value; R.layoutText(l); placeTextEditor(); drawOverlay(); });
      ta.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ta.setRangeText('\t', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); return; } });
      ta.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); endTextEdit(); } });
      ta.addEventListener('blur', () => setTimeout(() => endTextEdit(), 0));
      renderCanvas();
      renderCtx();
      placeTextEditor();
      const caretEnd = () => { ta.focus(); const n = ta.value.length; try { ta.setSelectionRange(n, n); } catch (er) {} };
      if (l.text === 'Metin' || l.text === 'Yeni yazı') ta.select(); else caretEnd();
      ta.focus();
      setTimeout(() => { if (st.editing === l && document.activeElement !== ta) caretEnd(); }, 0);
    }
    function placeTextEditor() {
      const l = st.editing; if (!l || !l.ta) return;
      const ta = l.ta, z = st.zoom, p = toScreen(l.x, l.y);
      Object.assign(ta.style, {
        left: p.x + 'px', top: p.y + 'px', width: l.w * z + 'px', height: (l.h + l.fontSize * 0.2) * z + 'px',
        font: `${l.italic ? 'italic ' : ''}${l.fontWeight} ${l.fontSize * z}px ${R.fontStack(l.fontFamily)}`,
        lineHeight: l.lineHeight, letterSpacing: (l.letterSpacing || 0) * z + 'px', textAlign: l.align, color: R.toHex(typeof l.fill === 'string' ? l.fill : (l.fill.colors || ['#000'])[0]),
        transformOrigin: 'center', transform: `rotate(${l.rotation || 0}deg)`, textTransform: l.uppercase ? 'uppercase' : 'none',
      });
    }
    function endTextEdit() {
      const l = st.editing; if (!l) return;
      st.editing = null;
      if (l.ta) { l.ta.remove(); delete l.ta; }
      if (!String(l.text || '').trim()) { doc.layers = doc.layers.filter((x) => x !== l); st.sel = st.sel.filter((id) => id !== l.id); }
      commit();
    }

    // ---------- işaretçi (fare + dokunmatik)
    const pointers = new Map();
    let lp = { t: 0 };
    let lastTap = { t: 0, id: null }, pinch = null;
    vp.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tool-opts, .zoom-float, .text-edit')) return;
      if (st.commenting) { e.preventDefault(); e.stopPropagation(); placeComment(toCanvas(e)); return; }
      if (st.pickColor) {
        e.preventDefault();
        const k = st.pickColor; st.pickColor = null; vp.classList.remove('picking');
        const p0 = toCanvas(e);
        snapshot().then((snap) => {
          const x = Math.round(p0.x * snap.sc), y = Math.round(p0.y * snap.sc), i = (Math.max(0, Math.min(snap.c.height - 1, y)) * snap.c.width + Math.max(0, Math.min(snap.c.width - 1, x))) * 4;
          const hx = '#' + [snap.px[i], snap.px[i + 1], snap.px[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
          if (!st.sel.length) setK(doc, k, hx); else selected().forEach((l) => setK(l, k, hx));
          pushRecent(hx); commit(); UI.toast('Renk alındı: ' + hx);
        });
        return;
      }
      if (e.target.id === 'rulH' || e.target.id === 'rulV') { dragGuide(e, e.target.id === 'rulH' ? 'y' : 'x'); return; }
      if (e.target.id === 'rulC') { e.preventDefault(); return; }
      if (e.target.dataset && e.target.dataset.g != null && st.tool === 'select') { dragGuide(e, e.target.dataset.ax, +e.target.dataset.g); return; }
      e.preventDefault();
      if (document.activeElement && document.activeElement !== document.body && !vp.contains(document.activeElement)) document.activeElement.blur();
      if (st.editing) { endTextEdit(); return; }
      vp.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) st.selAtDown = st.sel.slice(); // ilk parmak seçimi değiştirmeden önceki seçim
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, zoom: st.zoom, pan: { ...st.pan } };
        // iki parmak seçili öğenin üzerindeyse: öğeyi büyüt/küçült ve döndür (tuval değil)
        const L1 = one(), pa = toCanvas({ clientX: a.x, clientY: a.y }), pb = toCanvas({ clientX: b.x, clientY: b.y }), pm = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
        if (L1 && (st.selAtDown || []).includes(L1.id) && !L1.locked && !L1.lockPos && hitLayer(L1, pa) && hitLayer(L1, pb)) pinch.layer = { l: L1, ang: Math.atan2(b.y - a.y, b.x - a.x), s: { w: L1.w, h: L1.h, rot: L1.rotation || 0, fs: L1.fontSize, c: center(L1) } };
        cancelDrag(); return;
      }
      const p = toCanvas(e);
      const h = e.target.dataset && e.target.dataset.h;
      clearTimeout(lp.t);
      if (e.pointerType !== 'mouse' && st.tool === 'select' && !h) {
        lp = { x: e.clientX, y: e.clientY, t: setTimeout(() => { st.drag = null; pointers.clear(); openCtxMenu(lp.x, lp.y, p, true); if (navigator.vibrate) navigator.vibrate(12); }, 520) };
      }
      if (e.button === 1 || st.tool === 'hand' || st.space) { st.drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, pan: { ...st.pan } }; vp.classList.add('panning'); return; }
      if (e.button === 2) return;
      const t = st.tool;
      if (t === 'select') {
        if (h) {
          const l = one();
          if (l && l.lockPos) { UI.toast('Bu şablonda öğelerin yeri ve boyutu sabit — yalnızca içeriği değiştirebilirsin'); return; }
          st.drag = { mode: h === 'rot' ? 'rotate' : 'resize', h, l, s: { ...l, c: center(l) }, p0: p, moved: false };
          return;
        }
        const l = hit(p);
        const wasSel = !!l && st.sel.length >= 1 && st.sel.includes(l.id) && !e.shiftKey;
        if (l) {
          if (e.shiftKey) { select([l.id], true); if (!st.sel.includes(l.id)) return; }
          else if (!st.sel.includes(l.id)) select([l.id]);
          if (e.altKey) duplicate(true);
          st.drag = { mode: 'move', p0: p, starts: selected().filter((x) => !x.lockPos).map((x) => ({ l: x, x: x.x, y: x.y })), moved: false, hitId: l.id, t0: Date.now(), wasSel, shift: e.shiftKey };
        } else {
          if (!e.shiftKey) select([]);
          st.drag = { mode: 'marquee', p0: p, p1: p, add: e.shiftKey };
        }
      } else if (t === 'text') {
        const ex = hit(p);
        if (ex && ex.type === 'text') { st.sel = [ex.id]; editText(ex); setTool('select'); return; }
        const fs = Math.round(clamp(Math.min(doc.width, doc.height) * 0.07, 16, 400));
        const l = addLayer({ type: 'text', name: 'Metin', text: 'Metin', x: r1(p.x), y: r1(p.y - fs * 0.6), w: Math.round(Math.min(doc.width - p.x, doc.width * 0.6)), h: fs, fontSize: fs, fontFamily: st.opts.font, fontWeight: 700, lineHeight: 1.15, letterSpacing: 0, align: 'left', fill: st.opts.textColor });
        setTool('select');
        editText(l);
      } else if (t === 'lift' && st.opts.liftMode === 'lasso') {
        st.drag = { mode: 'lasso', pts: [p] };
      } else if (['rect', 'ellipse', 'star', 'triangle', 'line', 'retext', 'lift'].includes(t)) {
        st.drag = { mode: 'create', kind: t, p0: p, p1: p };
      } else if (t === 'heal') {
        const l = (one() && one().type === 'image' && hitLayer(one(), p) ? one() : null) || [...doc.layers].reverse().find((x) => x.type === 'image' && x.visible !== false && !x.locked && hitLayer(x, p));
        if (!l) { UI.toast('Bu araç fotoğraflarda çalışır', true); return; }
        st.sel = [l.id];
        if (st.opts.healMode === 'clone' && (e.altKey || st.cloneArm)) { st.cloneSrc = { l: l.id, p }; st.cloneArm = false; renderToolOpts(); drawOverlay(); UI.toast('Kaynak seçildi — şimdi düzeltilecek yeri boya'); return; }
        if (st.opts.healMode === 'clone' && (!st.cloneSrc || st.cloneSrc.l !== l.id)) { UI.toast('Önce Alt + tık (ya da “Kaynak seç”) ile kopyalanacak yeri seç', true); return; }
        healStart(l, p);
      } else if (t === 'eraser') {
        const l = (one() && one().type === 'image' && hitLayer(one(), p) ? one() : null) || [...doc.layers].reverse().find((x) => x.type === 'image' && x.visible !== false && !x.locked && hitLayer(x, p));
        if (!l) { UI.toast('Silgi fotoğraflarda çalışır: bir fotoğrafın üzerinde sürükle', true); return; }
        st.sel = [l.id]; eraserStart(l, p);
      } else if (t === 'eyedrop') {
        pickColorAt(p, e.altKey);
      } else if (t === 'gradient') {
        const l = one() && one().type !== 'image' && hitLayer(one(), p) ? one() : [...doc.layers].reverse().find((x) => ['rect', 'ellipse', 'path', 'text'].includes(x.type) && x.visible !== false && !x.locked && hitLayer(x, p));
        if (!l) { UI.toast('Önce bir şeklin ya da yazının üzerinden sürükle', true); return; }
        st.sel = [l.id]; st.drag = { mode: 'gradient', l, p0: p, p1: p, old: JSON.stringify(l.fill) }; drawOverlay();
      } else if (t === 'crop') {
        st.cropBox = null; st.drag = { mode: 'crop', p0: p, p1: p };
      } else if (t === 'zoom') {
        st.drag = { mode: 'zoombox', p0: p, p1: p, out: e.altKey };
      } else if (t === 'brush') {
        st.drag = { mode: 'brush', pts: [p] };
      } else if (t === 'pen') {
        if (!st.pen) st.pen = { pts: [] };
        const pts = st.pen.pts;
        const f = pts[0], last = pts[pts.length - 1];
        if (pts.length > 2 && f && Math.hypot(f.x - p.x, f.y - p.y) * st.zoom < 10) { finishPen(true); return; }
        const now = Date.now();
        // çift tık (aynı yere): yolu açık bitir
        if (pts.length > 1 && last && now - (st.pen.lt || 0) < 320 && Math.hypot(last.x - p.x, last.y - p.y) * st.zoom < 8) { finishPen(false); return; }
        st.pen.lt = now;
        pts.push({ x: p.x, y: p.y }); st.drag = { mode: 'penh', i: pts.length - 1, p0: p }; drawOverlay();
      }
    });
    vp.addEventListener('pointermove', (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (lp.t && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 8) { clearTimeout(lp.t); lp.t = 0; }
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        const r = vp.getBoundingClientRect();
        if (pinch.layer) {
          const P2 = pinch.layer, l = P2.l, k = clamp(d / pinch.d, 0.05, 20), ang = ((Math.atan2(b.y - a.y, b.x - a.x) - P2.ang) * 180) / Math.PI;
          let rot = P2.s.rot + ang; const sn = Math.round(rot / 45) * 45; if (Math.abs(rot - sn) < 4) rot = sn; // 45°'lere yapış
          l.w = r1(P2.s.w * k); l.h = r1(P2.s.h * k); if (l.type === 'text' && P2.s.fs) { l.fontSize = r1(P2.s.fs * k); R.layoutText(l); }
          l.rotation = r1(((rot % 360) + 360) % 360); l.x = r1(P2.s.c.x - l.w / 2); l.y = r1(P2.s.c.y - l.h / 2); P2.moved = true;
          renderSoon(); drawOverlay(); return;
        }
        const nz = clamp(pinch.zoom * (d / pinch.d), 0.02, 16);
        const ox = pinch.cx - r.left, oy = pinch.cy - r.top;
        st.zoom = nz;
        st.pan.x = ox - ((ox - pinch.pan.x) * nz) / pinch.zoom + (cx - pinch.cx);
        st.pan.y = oy - ((oy - pinch.pan.y) * nz) / pinch.zoom + (cy - pinch.cy);
        applyView(); return;
      }
      const p = toCanvas(e);
      const d = st.drag;
      if (!d) {
        if (st.tool === 'select' && e.pointerType === 'mouse') { const l = hit(p); const id = l && l.id; if (id !== st.hover) { st.hover = id; drawOverlay(); } }
        if (st.pen) { st.pen.cur = p; drawOverlay(); }
        if (st.tool === 'eraser' || st.tool === 'heal') { st.hoverP = p; drawOverlay(); }
        return;
      }
      if (d.mode === 'pan') { st.pan = { x: d.pan.x + e.clientX - d.sx, y: d.pan.y + e.clientY - d.sy }; applyView(); return; }
      if (d.mode === 'move') {
        let dx = p.x - d.p0.x, dy = p.y - d.p0.y;
        if (!d.moved && Math.hypot(dx, dy) * st.zoom < (e.pointerType === 'touch' ? 6 : 3)) return;
        if (!d.moved) { const cb2 = $('#ctxBar', page); if (cb2) cb2.hidden = true; }
        d.moved = true;
        if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
        d.starts.forEach((s) => { s.l.x = s.x + dx; s.l.y = s.y + dy; });
        const sn = snapMove(d.starts.map((s) => s.l));
        d.starts.forEach((s) => { s.l.x = r1(s.l.x + sn.dx); s.l.y = r1(s.l.y + sn.dy); moveDOM(s.l); });
        drawOverlay(); return;
      }
      if (d.mode === 'rotate') {
        const c = d.s.c;
        let a = (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI + 90;
        if (e.shiftKey) a = Math.round(a / 15) * 15;
        a = ((a + 540) % 360) - 180;
        if (Math.abs(a) < 2) a = 0;
        d.l.rotation = r1(a); d.moved = true;
        moveDOM(d.l); drawOverlay(); return;
      }
      if (d.mode === 'resize') { resizeTo(d, p, e.shiftKey); d.moved = true; renderSoon(); return; }
      if (d.mode === 'marquee') { d.p1 = p; drawOverlay(); return; }
      if (d.mode === 'create') {
        d.p1 = p;
        if (e.shiftKey && d.kind !== 'line') { const s = Math.max(Math.abs(p.x - d.p0.x), Math.abs(p.y - d.p0.y)); d.p1 = { x: d.p0.x + Math.sign(p.x - d.p0.x || 1) * s, y: d.p0.y + Math.sign(p.y - d.p0.y || 1) * s }; }
        drawOverlay(); return;
      }
      if (d.mode === 'lasso') {
        const last = d.pts[d.pts.length - 1];
        if (Math.hypot(last.x - p.x, last.y - p.y) * st.zoom > 3) { d.pts.push(p); drawOverlay(); }
        return;
      }
      if (d.mode === 'eraser') { eraserMove(p); return; }
      if (d.mode === 'heal') { healMove(p, d); return; }
      if (d.mode === 'gradient' || d.mode === 'crop' || d.mode === 'zoombox') { d.p1 = p; if (d.mode === 'gradient') applyGrad(d); if (d.mode === 'crop') { st.cropBox = normBox(d.p0, d.p1, e.shiftKey); renderToolOpts(); } drawOverlay(); return; }
      if (d.mode === 'penh') { const q = st.pen && st.pen.pts[d.i]; if (q) { const dx = p.x - q.x, dy = p.y - q.y; if (Math.hypot(dx, dy) * st.zoom > 4) { q.hx = dx; q.hy = dy; } else { q.hx = 0; q.hy = 0; } st.pen.cur = null; drawOverlay(); } return; }
      if (d.mode === 'brush') {
        const last = d.pts[d.pts.length - 1];
        if (Math.hypot(last.x - p.x, last.y - p.y) * st.zoom > 2) { d.pts.push(p); drawOverlay(); }
      }
    });
    const up = (e) => {
      clearTimeout(lp.t); lp.t = 0;
      pointers.delete(e.pointerId);
      if (pinch) { if (pointers.size < 2) { if (pinch.layer && pinch.layer.moved) commit(); pinch = null; } return; }
      const d = st.drag; st.drag = null; st.guides = []; st.dist = [];
      vp.classList.remove('panning');
      if (!d) return;
      if (d.mode === 'penh') { drawOverlay(); return; }
      if (d.mode === 'eraser') { eraserEnd(d); return; }
      if (d.mode === 'heal') { healEnd(d); return; }
      if (d.mode === 'gradient') { if (Math.hypot(d.p1.x - d.p0.x, d.p1.y - d.p0.y) * st.zoom < 4) { d.l.fill = JSON.parse(d.old); renderSoon(); } else commit(); drawOverlay(); return; }
      if (d.mode === 'crop') { if (!st.cropBox || st.cropBox.w * st.zoom < 6 || st.cropBox.h * st.zoom < 6) st.cropBox = null; drawOverlay(); renderToolOpts(); return; }
      if (d.mode === 'zoombox') { const bw = Math.abs(d.p1.x - d.p0.x), bh = Math.abs(d.p1.y - d.p0.y); if (bw * st.zoom < 8) { { const q = toScreen(d.p0.x, d.p0.y); zoomAt(d.out || e.altKey ? 0.8 : 1.25, q.x, q.y); } } else zoomToBox(normBox(d.p0, d.p1)); drawOverlay(); return; }
      if (d.mode === 'move' && !d.moved && d.hitId) {
        // çift dokunuş / çift tık: hareketsiz iki kısa dokunuş aynı katmanda
        const now = Date.now(), quick = now - d.t0 < 350;
        const tl = byId(d.hitId);
        // çoklu seçimdeyken bir öğeye tıklayıp bırakınca yalnız o öğe (ya da grubu) seçili kalsın
        if (d.wasSel && !d.shift && st.sel.length > 1 && tl) { const g = tl.group; if (!g || selected().some((x) => x.group !== g)) { select([tl.id]); return; } }
        if (quick && d.wasSel && tl && tl.type === 'text' && st.sel.length === 1) { lastTap = { t: 0 }; editText(tl); return; }
        if (quick && d.wasSel && tl && tl.type === 'image' && st.sel.length === 1) { lastTap = { t: 0 }; retextAt(d.p0); return; }
        if (quick && lastTap.id === d.hitId && now - lastTap.t < 420) {
          lastTap = { t: 0 };
          const l = byId(d.hitId);
          if (l && l.type === 'text') { editText(l); return; }
        }
        lastTap = quick ? { t: now, id: d.hitId } : { t: 0 };
      }
      if (d.mode === 'move' || d.mode === 'rotate' || d.mode === 'resize') { if (d.moved) commit(); else { drawOverlay(); renderCtx(); } return; }
      if (d.mode === 'marquee') {
        const x1 = Math.min(d.p0.x, d.p1.x), x2 = Math.max(d.p0.x, d.p1.x), y1 = Math.min(d.p0.y, d.p1.y), y2 = Math.max(d.p0.y, d.p1.y);
        if ((x2 - x1) * st.zoom > 4 || (y2 - y1) * st.zoom > 4) {
          const ids = doc.layers.filter((l) => l.visible && !l.locked).filter((l) => { const b = bbox(l); return b.x < x2 && b.x2 > x1 && b.y < y2 && b.y2 > y1; }).map((l) => l.id);
          select(d.add ? [...new Set([...st.sel, ...ids])] : ids);
        } else drawOverlay();
        return;
      }
      if (d.mode === 'lasso') {
        if (d.pts.length < 4) { UI.toast('Ayırmak istediğin bölgenin çevresini çiz'); drawOverlay(); return; }
        const xs = d.pts.map((q) => q.x), ys = d.pts.map((q) => q.y);
        liftSelection({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, d.pts);
        return;
      }
      if (d.mode === 'create' && d.kind === 'lift') {
        const x = Math.min(d.p0.x, d.p1.x), y = Math.min(d.p0.y, d.p1.y), w = Math.abs(d.p1.x - d.p0.x), h = Math.abs(d.p1.y - d.p0.y);
        if (w * st.zoom < 10 || h * st.zoom < 10) { UI.toast('Ayırmak istediğin bölgeyi sürükleyerek işaretle'); drawOverlay(); return; }
        liftSelection({ x, y, w, h }, null);
        return;
      }
      if (d.mode === 'create' && d.kind === 'retext') {
        const x = Math.min(d.p0.x, d.p1.x), y = Math.min(d.p0.y, d.p1.y), w = Math.abs(d.p1.x - d.p0.x), h = Math.abs(d.p1.y - d.p0.y);
        if (w * st.zoom < 12 || h * st.zoom < 8) { retextAt(d.p0); return; }
        retextBox({ x, y, w, h });
        return;
      }
      if (d.mode === 'create') {
        let { p0, p1 } = d;
        const small = Math.hypot(p1.x - p0.x, p1.y - p0.y) * st.zoom < 6;
        const def = Math.min(doc.width, doc.height) * 0.25;
        if (d.kind === 'line') {
          if (small) p1 = { x: p0.x + def, y: p0.y };
          const g = pathFromPoints([p0, p1], false, false);
          addLayer({ type: 'path', name: 'Çizgi', ...g, fill: 'none', stroke: st.opts.stroke, strokeWidth: Math.max(1, st.opts.strokeWidth || 6) });
        } else {
          let x = Math.min(p0.x, p1.x), y = Math.min(p0.y, p1.y), w = Math.abs(p1.x - p0.x), h = Math.abs(p1.y - p0.y);
          if (small) { w = h = def; x = p0.x - def / 2; y = p0.y - def / 2; }
          addLayer(shapeLayer(d.kind, r1(x), r1(y), r1(w), r1(h)));
        }
        setTool('select');
        return;
      }
      if (d.mode === 'brush') {
        const pts = d.pts.length === 1 ? [d.pts[0], { x: d.pts[0].x + 0.5, y: d.pts[0].y + 0.5 }] : d.pts;
        const g = pathFromPoints(pts, false, true);
        addLayer({ type: 'path', name: 'Fırça darbesi', ...g, fill: 'none', stroke: st.opts.brush, strokeWidth: st.opts.brushSize }, false);
      }
    };
    vp.addEventListener('pointerup', up);
    vp.addEventListener('pointercancel', up);
    vp.addEventListener('pointerleave', () => { if (st.hover) { st.hover = null; drawOverlay(); } });
    vp.addEventListener('dblclick', (e) => {
      if (st.tool === 'select') { const l = one(); if (l && l.type === 'image' && !l.locked) { replaceImage(l); return; } }
      if (st.tool === 'pen' && st.pen && st.pen.pts.length > 1) { const q = st.pen.pts, a = q[q.length - 1], b = q[q.length - 2]; if (Math.hypot(a.x - b.x, a.y - b.y) * st.zoom < 8) { q.pop(); finishPen(false); } }
    });
    vp.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (e.pointerType && e.pointerType !== 'mouse') return; // dokunmatikte uzun basma ayrıca ele alınıyor
      openCtxMenu(e.clientX, e.clientY, toCanvas(e));
    });
    // ---------- sağ tık / uzun basma menüsü
    function closeCtxMenu() { const m = document.querySelector('.cmenu'); if (m) m.remove(); }
    function openCtxMenu(cx, cy, p, touch) {
      closeCtxMenu();
      if (st.editing) return;
      const l = hit(p);
      if (l && !st.sel.includes(l.id)) select([l.id]);
      if (!l && st.sel.length && !selected().some((x) => { const b = bbox(x); return p.x >= b.x && p.x <= b.x2 && p.y >= b.y && p.y <= b.y2; })) select([]);
      const ls = selected(), one1 = ls.length === 1 ? ls[0] : null;
      const it = (a, ic, t, k, dis) => `<button data-c="${a}" ${dis ? 'disabled' : ''}>${icon(ic)}<span>${t}</span>${k ? `<kbd>${k}</kbd>` : ''}</button>`;
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl+';
      let h = '';
      if (ls.length) {
        if (one1 && one1.type === 'text') h += it('edit', 'type', 'Yazıyı düzenle', 'Enter');
        if (one1 && one1.type === 'image') h += it('decomp', 'layers', 'Katmanlara ayır');
        if (one1 && one1.type === 'image') h += it('crop', 'crop', 'Kırp / maske') + it('rbg', 'wand', 'Arka planı sil') + it('mbr', 'brush', 'Maske fırçası') + it('behind', 'layers', 'Yazıyı arkasına al') + it('expand', 'fit', 'Genişlet') + it('gfill', 'sparkle', 'Seçerek doldur') + it('rimg', 'image', 'Görseli değiştir');
        if (one1 && one1.type === 'image') h += '<hr>';
        else if (one1 && one1.type === 'text') h += '<hr>';
        h += it('copy', 'copy', 'Kopyala', mac + 'C') + it('paste', 'paste', 'Yapıştır', mac + 'V', !st.clip) + it('dup', 'copy', 'Çoğalt', mac + 'D') + it('del', 'trash', 'Sil', 'Del') + '<hr>' + it('mkcomp', 'star', 'Bileşen yap') + it('expsel', 'download', 'Seçimi dışa aktar');
        h += '<hr>' + it('cstyle', 'brush', 'Stili kopyala', mac + (mac === '⌘' ? '⌥C' : 'Alt+C')) + it('pstyle', 'brush', 'Stili yapıştır', mac + (mac === '⌘' ? '⌥V' : 'Alt+V'), !st.styleClip);
        if (ls.length === 1) { const l1 = ls[0]; h += '<hr>' + (typeof l1.fill === 'string' && l1.fill !== 'none' ? it('sameColor', 'palette', 'Aynı rengi seç') : '') + (l1.type === 'text' ? it('sameFont', 'type', 'Aynı yazı tipini seç') + it('sameStyle', 'type', 'Aynı yazı stilini seç') : '') + it('sameType', 'layers', 'Aynı türdekileri seç'); }
        h += '<hr>' + it('front', 'up', 'En öne getir', '⇧]') + it('up', 'up', 'Bir öne', ']') + it('down', 'down', 'Bir arkaya', '[') + it('back', 'down', 'En arkaya', '⇧[');
        h += '<hr>' + (ls.length > 1 ? it('group', 'layers', 'Grupla', mac + 'G') : '') + (ls.some((x) => x.group) ? it('ungroup', 'layers', 'Grubu çöz', mac + '⇧G') : '');
        h += it('cen', 'target', 'Tuvalde ortala') + (ls.length > 2 ? it('disth', 'columns', 'Yatay eşit dağıt') + it('distv', 'rows', 'Dikey eşit dağıt') : '');
        h += it('lock', 'lock', ls.every((x) => x.locked) ? 'Kilidi aç' : 'Kilitle') + it('hide', 'eye', 'Gizle');
      } else {
        h += it('paste', 'paste', 'Yapıştır', mac + 'V', !st.clip) + it('all', 'select', 'Tümünü seç', mac + 'A') + '<hr>' + it('fit', 'zin', 'Ekrana sığdır', mac + '0') + it('rulers', 'ruler', st.rulers ? 'Cetvelleri gizle' : 'Cetvelleri göster', '⇧R') + it('keys', 'keyboard', 'Klavye kısayolları', '?');
      }
      const m = document.createElement('div'); m.className = 'cmenu'; m.innerHTML = h.replace(/(<hr>)+/g, '<hr>').replace(/^<hr>|<hr>$/g, '');
      document.body.appendChild(m);
      const W = innerWidth, H = innerHeight, r = m.getBoundingClientRect();
      m.style.left = Math.max(6, Math.min(cx, W - r.width - 6)) + 'px';
      m.style.top = Math.max(6, Math.min(cy, H - r.height - 6)) + 'px';
      M.animate(m, { opacity: [0, 1], scale: [0.96, 1] }, { stiffness: 520, damping: 34 });
      const opened = touch ? Date.now() : 0;
      m.addEventListener('click', (e) => {
        if (Date.now() - opened < 450) return; // uzun basmayı bırakınca gelen sahte tıklama
        const b = e.target.closest('[data-c]'); if (!b || b.disabled) return;
        const a = b.dataset.c; closeCtxMenu();
        const L = selected();
        ({
          edit: () => one1 && editText(one1), crop: () => { st.tab = 'props'; renderPanel(); if (mobile()) togglePanel(true); },
          rbg: () => one1 && removeBg(one1), mbr: () => one1 && maskEditor(one1), behind: () => one1 && textBehind(one1), expand: () => one1 && expandImage(one1), gfill: () => one1 && genFill(one1), decomp: () => one1 && decomposeImage(one1), rimg: () => one1 && replaceImage(one1),
          copy, paste, dup: () => duplicate(), del: remove, mkcomp: () => saveComponent(), expsel: () => exportSelection(),
          cstyle: copyStyle, pstyle: pasteStyle, sameColor: () => selectSame('color'), sameFont: () => selectSame('font'), sameStyle: () => selectSame('style'), sameType: () => selectSame('type'),
          front: () => arrange('front'), up: () => arrange('up'), down: () => arrange('down'), back: () => arrange('back'),
          group: groupSel, ungroup: ungroupSel, cen: () => { align('c'); align('m'); },
          disth: () => distribute('h'), distv: () => distribute('v'),
          lock: () => { const v = !L.every((x) => x.locked); L.forEach((x) => (x.locked = v)); commit(); UI.toast(v ? 'Kilitlendi' : 'Kilit açıldı'); },
          hide: () => { L.forEach((x) => (x.visible = false)); st.sel = []; commit(); UI.toast('Gizlendi — Katmanlar sekmesinden geri açılır'); },
          all: () => select(doc.layers.filter((x) => !x.locked && x.visible).map((x) => x.id)),
          fit, rulers: toggleRulers, keys: showKeys,
        }[a] || (() => {}))();
      });
      setTimeout(() => {
        const t0 = touch ? Date.now() : 0;
        const off = (e) => { if (Date.now() - t0 < 450) return; if (!m.contains(e.target)) { closeCtxMenu(); document.removeEventListener('pointerdown', off, true); } };
        document.addEventListener('pointerdown', off, true);
      }, 0);
    }
    const STYLE_KEYS = ['fill', 'stroke', 'strokeWidth', 'opacity', 'radius', 'shadow', 'blend', 'fx', 'curve', 'bgFill', 'bgPad', 'dash', 'fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'italic', 'underline', 'uppercase', 'align', 'filters'];
    // ---- yazı tipi seçici: seçili yazılara uygula, ailede olmayan kalınlığı en yakına çek
    async function pickFont() {
      const ls = selected().filter((x) => x.type === 'text'); if (!ls.length) return;
      const r = await window.Fonts.pick(ls[0].fontFamily, { sample: R.plain(ls[0].text || '').split('\n')[0].slice(0, 28) });
      if (!r) return;
      await applyFont(ls, r.family);
      if (r.pair) { const rest = doc.layers.filter((x) => x.type === 'text' && !ls.includes(x) && +x.fontSize < Math.max(...ls.map((y) => +y.fontSize)) * 0.6); if (rest.length) { await applyFont(rest, r.pair[1]); UI.toast(`Başlık: ${r.pair[0]} · küçük yazılar: ${r.pair[1]}`); } }
    }
    async function applyFont(ls, fam) {
      const F = window.Fonts;
      ls.forEach((x) => { x.fontFamily = fam; x.fontWeight = F.nearestWeight(fam, +x.fontWeight || 400); if (x.italic && !F.hasItalic(fam)) x.italic = false; });
      await Promise.all(ls.map((x) => R.ensureFont(fam, x.fontWeight, !!x.italic)));
      ls.forEach((x) => R.layoutText(x)); commit();
    }
    function relayoutTexts() { doc.layers.forEach((x) => { if (x.type === 'text') R.layoutText(x); }); renderCanvas(); drawOverlay(); }
    // ---- katman stilleri (efekt + gölge + kenar + karışım)
    const LS_KEYS = ['fx', 'shadow', 'stroke', 'strokeWidth', 'dash', 'blend', 'opacity', '_fxName'];
    const lStyles = () => ((window.App.S.brand && window.App.S.brand.layer_styles) || []);
    async function saveLStyles(list) { try { window.App.S.brand = await window.App.api('brand', { body: { ...(window.App.S.brand || {}), layer_styles: list } }); } catch (e) { UI.toast(e.message, true); } }
    // ---- metin stilleri (marka kitine kaydedilir, her tasarımda kullanılır)
    const TS_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fill', 'letterSpacing', 'lineHeight', 'italic', 'uppercase', 'underline', 'align', 'stroke', 'strokeWidth'];
    const tStyles = () => ((window.App.S.brand && window.App.S.brand.text_styles) || []);
    const pickTStyle = (l) => Object.fromEntries(TS_KEYS.filter((k) => l[k] !== undefined).map((k) => [k, JSON.parse(JSON.stringify(l[k]))]));
    function applyTStyle(l, stl) { TS_KEYS.forEach((k) => { if (stl[k] !== undefined) l[k] = JSON.parse(JSON.stringify(stl[k])); }); l.tstyle = stl.id; R.layoutText(l); }
    async function saveTStyles(list) { try { window.App.S.brand = await window.App.api('brand', { body: { ...(window.App.S.brand || {}), text_styles: list } }); } catch (e) { UI.toast(e.message, true); } }
    // "Ürün adı 120 ₺" → "Ürün adı⇥120 ₺" (son fiyat/sayı parçasından önce Tab)
    function toLeaderText(t) {
      return String(t || '').split('\n').map((ln) => {
        if (!ln.trim() || /\t/.test(ln)) return ln;
        const m = ln.match(/^(.*?\S)\s+((?:[₺$€]\s?)?[\d.,]+(?:\s?(?:₺|TL|tl|\$|€|g|kg|ml|lt|L|adet|%))?(?:\s*\/\s*\S+)?)\s*$/);
        if (m) return m[1].replace(/[.\s…·-]+$/, '') + '\t' + m[2];
        const m2 = ln.match(/^(.*\S)\s{2,}(\S.*)$/) || ln.match(/^(.*?)\s*[:–-]\s+(\S.*)$/);
        return m2 ? m2[1] + '\t' + m2[2] : ln;
      }).join('\n');
    }
    function copyStyle() { const l = one() || selected()[0]; if (!l) return; st.styleClip = JSON.stringify(Object.fromEntries(STYLE_KEYS.filter((k) => l[k] !== undefined).map((k) => [k, l[k]]))); UI.toast('Stil kopyalandı'); }
    function pasteStyle() {
      if (!st.styleClip) return;
      const sty = JSON.parse(st.styleClip);
      selected().forEach((l) => {
        for (const [k, v] of Object.entries(sty)) {
          if (['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'italic', 'underline', 'uppercase', 'align'].includes(k) && l.type !== 'text') continue;
          if (k === 'filters' && l.type !== 'image') continue;
          l[k] = JSON.parse(JSON.stringify(v));
        }
        if (l.type === 'text') R.layoutText(l);
      });
      commit(); UI.toast('Stil uygulandı');
    }
    function distribute(dir) {
      const ls = selected(); if (ls.length < 3) return;
      const bs = ls.map((l) => ({ l, b: bbox(l) })).sort((a, b) => (dir === 'h' ? a.b.x - b.b.x : a.b.y - b.b.y));
      const first = bs[0].b, last = bs[bs.length - 1].b;
      const total = bs.reduce((s2, o) => s2 + (dir === 'h' ? o.b.x2 - o.b.x : o.b.y2 - o.b.y), 0);
      const gap = ((dir === 'h' ? last.x2 - first.x : last.y2 - first.y) - total) / (bs.length - 1);
      let pos = dir === 'h' ? first.x : first.y;
      for (const o of bs) {
        if (dir === 'h') { o.l.x = r1(o.l.x + (pos - o.b.x)); pos += o.b.x2 - o.b.x + gap; }
        else { o.l.y = r1(o.l.y + (pos - o.b.y)); pos += o.b.y2 - o.b.y + gap; }
      }
      commit(); UI.toast('Eşit aralıkla dağıtıldı');
    }
    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top);
      else { st.pan.x -= e.shiftKey ? e.deltaY : e.deltaX; st.pan.y -= e.shiftKey ? 0 : e.deltaY; applyView(); }
    }, { passive: false });
    // dosya bırakma
    vp.addEventListener('dragover', (e) => e.preventDefault());
    vp.addEventListener('drop', async (e) => {
      e.preventDefault();
      const p = toCanvas(e);
      const lf = [...e.dataTransfer.files].find((f) => /\.(psd|svg)$/i.test(f.name));
      if (lf) { window.Features.importFile(lf); return; }
      const imgs = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
      const hit = imgs.length === 1 && [...doc.layers].reverse().find((l) => l.type === 'image' && l.visible !== false && !l.locked && (l.role === 'photo' || /resmi|fotoğraf/i.test(l.name || '')) && p.x >= l.x && p.x <= l.x + l.w && p.y >= l.y && p.y <= l.y + l.h);
      if (hit) { try { const r = await window.App.uploadFile(imgs[0]); await setImgSrc(hit, r.url); } catch (er) { UI.toast(er.message, true); } return; }
      for (const f of e.dataTransfer.files) if (f.type.startsWith('image/')) { try { const r = await window.App.uploadFile(f); await placeImage(r.url, p); } catch (er) { UI.toast(er.message, true); } }
    });
    function cancelDrag() { st.drag = null; st.guides = []; st.dist = []; drawOverlay(); }

    function resizeTo(d, p, shift) {
      const { s, h, l } = d;
      const a = rad(s.rotation || 0), co = Math.cos(a), si = Math.sin(a);
      const dx = p.x - s.c.x, dy = p.y - s.c.y;
      const lx = dx * co + dy * si, ly = -dx * si + dy * co;
      let L = -s.w / 2, Rr = s.w / 2, T = -s.h / 2, B = s.h / 2;
      if (h.includes('e')) Rr = Math.max(L + 2, lx);
      if (h.includes('w')) L = Math.min(Rr - 2, lx);
      if (h.includes('s')) B = Math.max(T + 2, ly);
      if (h.includes('n')) T = Math.min(B - 2, ly);
      let w = Rr - L, hh = B - T;
      const corner = h.length === 2;
      const keep = corner && (l.type === 'image' || l.type === 'text' ? !shift : shift);
      if (keep) {
        const ratio = s.w / s.h;
        if (w / hh > ratio) hh = w / ratio; else w = hh * ratio;
        if (h.includes('w')) L = Rr - w; else Rr = L + w;
        if (h.includes('n')) T = B - hh; else B = T + hh;
      }
      const cxl = (L + Rr) / 2, cyl = (T + B) / 2;
      const ncx = s.c.x + cxl * co - cyl * si, ncy = s.c.y + cxl * si + cyl * co;
      if (l.type === 'text') {
        if (corner) l.fontSize = Math.max(4, r1(s.fontSize * (w / s.w)));
        l.w = r1(w); R.layoutText(l);
        // metin yüksekliği otomatik: sabit kenarı koru
        const nh = l.h;
        const cyl2 = h.includes('n') ? B - nh / 2 : T + nh / 2;
        l.x = r1(s.c.x + cxl * co - cyl2 * si - l.w / 2);
        l.y = r1(s.c.y + cxl * si + cyl2 * co - nh / 2);
        return;
      }
      l.w = r1(w); l.h = r1(hh);
      l.x = r1(ncx - w / 2); l.y = r1(ncy - hh / 2);
    }

    function snapMove(ls) {
      st.guides = [];
      const th = 6 / st.zoom;
      const b = unionBox(ls);
      const others = doc.layers.filter((l) => l.visible && !ls.includes(l));
      const xs = [0, doc.width / 2, doc.width], ys = [0, doc.height / 2, doc.height];
      for (const o of others) { const ob = bbox(o); xs.push(ob.x, (ob.x + ob.x2) / 2, ob.x2); ys.push(ob.y, (ob.y + ob.y2) / 2, ob.y2); }
      (doc.meta && doc.meta.guides || []).forEach((g) => (g.x != null ? xs.push(g.x) : ys.push(g.y)));
      gridCols().forEach((c) => xs.push(c.x, c.x + c.w));
      const mine = { x: [b.x, (b.x + b.x2) / 2, b.x2], y: [b.y, (b.y + b.y2) / 2, b.y2] };
      let best = { dx: 0, dy: 0, gx: null, gy: null, ex: th, ey: th };
      for (const m of mine.x) for (const t of xs) { const dd = t - m; if (Math.abs(dd) < best.ex) { best.ex = Math.abs(dd); best.dx = dd; best.gx = t; } }
      for (const m of mine.y) for (const t of ys) { const dd = t - m; if (Math.abs(dd) < best.ey) { best.ey = Math.abs(dd); best.dy = dd; best.gy = t; } }
      // akıllı boşluk: sağ-sol / üst-alt komşulara eşit uzaklık + ölçü etiketleri
      st.dist = [];
      const nb = { x: b.x + best.dx, x2: b.x2 + best.dx, y: b.y + best.dy, y2: b.y2 + best.dy };
      const obs = others.filter((o) => o.type !== 'adjust').map(bbox);
      const ovY = (o) => o.y < nb.y2 && o.y2 > nb.y, ovX = (o) => o.x < nb.x2 && o.x2 > nb.x;
      const L = obs.filter((o) => ovY(o) && o.x2 <= nb.x + 1).sort((p, q) => q.x2 - p.x2)[0];
      const Rr = obs.filter((o) => ovY(o) && o.x >= nb.x2 - 1).sort((p, q) => p.x - q.x)[0];
      const T = obs.filter((o) => ovX(o) && o.y2 <= nb.y + 1).sort((p, q) => q.y2 - p.y2)[0];
      const B = obs.filter((o) => ovX(o) && o.y >= nb.y2 - 1).sort((p, q) => p.y - q.y)[0];
      if (L && Rr) { const gl = b.x - L.x2, gr = Rr.x - b.x2; if (Math.abs(gl - gr) < th * 3) { best.dx = (gr - gl) / 2; best.gx = null; nb.x = b.x + best.dx; nb.x2 = b.x2 + best.dx; st.dist.eq = true; } }
      if (T && B) { const gt = b.y - T.y2, gb = B.y - b.y2; if (Math.abs(gt - gb) < th * 3) { best.dy = (gb - gt) / 2; best.gy = null; nb.y = b.y + best.dy; nb.y2 = b.y2 + best.dy; st.dist.eqY = true; } }
      const cy = (Math.max(nb.y, (L || Rr || nb).y) + Math.min(nb.y2, (L || Rr || nb).y2)) / 2, cx = (nb.x + nb.x2) / 2;
      if (L) st.dist.push({ x1: L.x2, y1: (Math.max(nb.y, L.y) + Math.min(nb.y2, L.y2)) / 2, x2: nb.x, v: nb.x - L.x2, h: true });
      if (Rr) st.dist.push({ x1: nb.x2, y1: (Math.max(nb.y, Rr.y) + Math.min(nb.y2, Rr.y2)) / 2, x2: Rr.x, v: Rr.x - nb.x2, h: true });
      if (T) st.dist.push({ y1: T.y2, x1: (Math.max(nb.x, T.x) + Math.min(nb.x2, T.x2)) / 2, y2: nb.y, v: nb.y - T.y2 });
      if (B) st.dist.push({ y1: nb.y2, x1: (Math.max(nb.x, B.x) + Math.min(nb.x2, B.x2)) / 2, y2: B.y, v: B.y - nb.y2 });
      void cy; void cx;
      if (best.gx != null) st.guides.push({ x: best.gx });
      if (best.gy != null) st.guides.push({ y: best.gy });
      return best;
    }

    // ---------- işlemler
    function duplicate(inPlace) {
      const ls = selected(); if (!ls.length) return;
      const copies = ls.map((l) => { const c = JSON.parse(JSON.stringify(R.clean(l))); c.id = R.uid(); c.name = l.name + ' kopya'; if (!inPlace) { c.x += 20; c.y += 20; } return c; });
      const idx = Math.max(...ls.map((l) => doc.layers.indexOf(l)));
      doc.layers.splice(idx + 1, 0, ...copies);
      R.normalize(doc);
      st.sel = copies.map((c) => c.id);
      if (!inPlace) commit(); else renderCanvas();
    }
    function remove() {
      if (!st.sel.length) return;
      if (selected().some((l) => l.lockPos)) { UI.toast('Bu şablonda kilitli öğeler silinemez', true); st.sel = st.sel.filter((id) => !byId(id).lockPos); if (!st.sel.length) return; }
      doc.layers = doc.layers.filter((l) => !st.sel.includes(l.id));
      st.sel = []; commit();
    }
    function arrange(where) {
      const ls = selected(); if (!ls.length) return;
      let arr = doc.layers.filter((l) => !ls.includes(l));
      if (where === 'front') arr = [...arr, ...ls];
      else if (where === 'back') arr = [...ls, ...arr];
      else {
        arr = [...doc.layers];
        const order = where === 'up' ? [...ls].reverse() : ls;
        for (const l of order) {
          const i = arr.indexOf(l), j = where === 'up' ? i + 1 : i - 1;
          if (j >= 0 && j < arr.length && !ls.includes(arr[j])) [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      doc.layers = arr; commit();
    }
    function align(how) {
      const ls = selected(); if (!ls.length) return;
      const ref = ls.length > 1 ? unionBox(ls) : { x: 0, y: 0, x2: doc.width, y2: doc.height };
      for (const l of ls) {
        const b = bbox(l), ox = l.x - b.x, oy = l.y - b.y, bw = b.x2 - b.x, bh = b.y2 - b.y;
        if (how === 'l') l.x = ref.x + ox;
        if (how === 'c') l.x = (ref.x + ref.x2) / 2 - bw / 2 + ox;
        if (how === 'r') l.x = ref.x2 - bw + ox;
        if (how === 't') l.y = ref.y + oy;
        if (how === 'm') l.y = (ref.y + ref.y2) / 2 - bh / 2 + oy;
        if (how === 'b') l.y = ref.y2 - bh + oy;
        l.x = r1(l.x); l.y = r1(l.y);
      }
      commit();
    }
    function nudge(dx, dy) { selected().forEach((l) => { if (!l.locked && !l.lockPos) { l.x = r1(l.x + dx); l.y = r1(l.y + dy); } }); commit(); }
    function copy() { const ls = selected(); if (ls.length) st.clip = JSON.stringify(ls.map(R.clean)); }
    function paste() {
      if (!st.clip) return;
      const ls = JSON.parse(st.clip).map((l) => ({ ...l, id: R.uid(), x: l.x + 24, y: l.y + 24 }));
      doc.layers.push(...ls); R.normalize(doc); st.sel = ls.map((l) => l.id);
      st.clip = JSON.stringify(ls); commit();
    }
    // ---------- resim değiştir: yükle, son yüklenenler, örnek fotoğraflar
    async function setImgSrc(l, url) {
      l.src = url; delete l.nw; delete l.nh; delete l.origSrc; delete l.crop; l.zoom = 1; l.ox = 0; l.oy = 0;
      if (l.fit === 'contain' && l.name === 'Arka plan resmi') l.fit = 'cover';
      delete l.focus; if (window.P8 && l.fit !== 'contain') await window.P8.smartCrop(l, true);
      await R.ensureImageSizes(doc); st.sel = [l.id]; commit();
      UI.toast((l.fade ? 'Resim değişti, kenarlar otomatik yumuşatıldı. ' : 'Resim değişti. ') + (l.focus ? 'Yüzler / ilgi noktası otomatik ortalandı; ' : '') + 'kadrajı sağ paneldeki Yakınlaştır / Yatay / Dikey ile de ayarlayabilirsin');
    }
    function uploadInto(l) {
      window.App.pickFiles(async (files) => {
        const f = files[0]; if (!f) return;
        try { const r = await window.App.uploadFile(f); await setImgSrc(l, r.url); } catch (e) { UI.toast(e.message, true); }
      }, false);
    }
    function replaceImage(l) {
      if (!l) return;
      const smp = Object.keys((window.Food && window.Food.SAMPLES) || {});
      const it = (src) => `<button class="ri-it" data-src="${esc(src)}"><img loading="lazy" alt="" src="${esc(src)}"></button>`;
      UI.dialog(`<div class="d-body"><h3>${icon('image')} Resmi değiştir</h3>
        <button class="btn primary" id="riUp" style="width:100%">${icon('upload')}Bilgisayardan / telefondan yükle</button>
        <p class="muted" style="font-size:12px;margin:8px 0 0">İpucu: bilgisayarda resim dosyasını doğrudan tasarımdaki fotoğrafın üstüne sürükleyip bırakabilirsin.</p>
        <h4 class="ri-h">Son yüklediklerin</h4><div class="ri-grid" id="riUps"><span class="muted" style="font-size:12px">yükleniyor…</span></div>
        ${smp.length ? `<h4 class="ri-h">Örnek fotoğraflar</h4><div class="ri-grid">${smp.map((k) => it('samples/bagis/' + k + '.webp')).join('')}</div>` : ''}</div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          $('#riUp', box).onclick = () => { close(null); uploadInto(l); };
          const bind = () => $$('.ri-it', box).forEach((bt) => (bt.onclick = () => { close(null); setImgSrc(l, bt.dataset.src); }));
          bind();
          window.App.api('uploads').then((u) => {
            const list = (u || []).filter((x) => x && x.url && !/\.(psd|pdf|svg|ttf|otf|woff2?|zip|json|tasarim)$/i.test(x.name || x.url) && x.url !== l.src).slice(0, 18);
            $('#riUps', box).innerHTML = list.length ? list.map((x) => it(x.url)).join('') : '<span class="muted" style="font-size:12px">Henüz yüklediğin resim yok</span>';
            bind();
          }).catch(() => { $('#riUps', box).innerHTML = ''; });
        },
      });
    }
    // tasarımda birden çok fotoğraf varsa hangisinin değişeceğini sor
    function photoLayers() { return doc.layers.filter((l) => l.type === 'image' && l.visible !== false && (l.role === 'photo' || /resmi|fotoğraf/i.test(l.name || ''))); }
    function replacePhotoFlow() {
      const ph = photoLayers().sort((a, b) => (b.name === 'Arka plan resmi') - (a.name === 'Arka plan resmi') || b.w * b.h - a.w * a.h);
      if (!ph.length) return UI.toast('Bu tasarımda değiştirilecek fotoğraf yok — Ekle → Görsel ile ekleyebilirsin');
      if (ph.length === 1) return replaceImage(ph[0]);
      UI.dialog(`<div class="d-body"><h3>${icon('image')} Hangi resmi değiştirelim?</h3><div class="ri-grid big">${ph.map((l, i) => `<button class="ri-it" data-i="${i}"><img alt="" src="${esc(l.src)}"><small>${esc(l.name && l.name !== 'Ürün fotoğrafı' && !/^Fotoğraf \d/.test(l.name) ? l.name : (l.w * l.h > doc.width * doc.height * 0.45 ? 'Arka plan fotoğrafı' : 'Fotoğraf ' + (i + 1)))}</small></button>`).join('')}</div></div><div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, {
        onOpen: (box, close) => $$('.ri-it', box).forEach((bt) => (bt.onclick = () => { close(null); const l = ph[+bt.dataset.i]; st.sel = [l.id]; drawOverlay(); replaceImage(l); })),
      });
    }
    // ---------- yazıları düzenle: tüm yazılar tek listede
    function textForm() {
      const ts = doc.layers.filter((l) => l.type === 'text' && l.visible !== false && !l.locked && (l.text || '').trim()).sort((a, b) => a.y - b.y || a.x - b.x);
      if (!ts.length) return UI.toast('Bu tasarımda yazı yok');
      const before = JSON.stringify(ts.map((l) => l.text));
      UI.dialog(`<div class="d-body"><h3>${icon('type')} Yazıları düzenle</h3><p class="muted" style="font-size:12px;margin:0 0 10px">Değişiklikler tasarımda anında görünür. Yazı taşarsa boyutu otomatik küçülür.</p><div class="tf-list">${ts.map((l, i) => `<label class="tf-row"><span>${esc(l.name || 'Yazı ' + (i + 1))}</span><textarea class="inp" rows="${Math.min(5, Math.max(1, Math.ceil((l.text || '').length / 42), (l.text || '').split('\n').length))}" data-i="${i}">${esc(l.text)}</textarea></label>`).join('')}</div></div><div class="d-foot"><button class="btn primary" data-close>${icon('check')}Tamam</button></div>`, {
        cls: 'wide',
        onOpen: (box) => $$('textarea', box).forEach((ta) => (ta.oninput = () => { const l = ts[+ta.dataset.i]; l.text = ta.value; R.layoutText(l); renderSoon(); })),
      }).then(() => { if (JSON.stringify(ts.map((l) => l.text)) !== before) { ts.forEach((l) => R.layoutText(l)); if (window.P8 && window.P8.reflow(doc)) st.sel = []; commit(); if (window.Coach && window.Coach.autoPolish) { /* taşma denetimi */ } } });
    }
    // ---------- formla doldur: üstte canlı önizleme, altta yazı kutuları ve fotoğraflar
    function fillForm() {
      const ts = doc.layers.filter((l) => l.type === 'text' && l.visible !== false && !l.locked && !/^Süs/.test(l.name || '') && R.plain(l.text || '').trim()).sort((a, b) => a.y - b.y || a.x - b.x);
      const ph = photoLayers();
      if (!ts.length && !ph.length) return UI.toast('Bu tasarımda doldurulacak yazı ya da fotoğraf yok');
      const label = (l, i) => { const n = (l.name || '').replace(/\s*\d+$/, ''); return /^(Yazı|Metin|Text)$/i.test(n) || !n ? 'Yazı ' + (i + 1) : n; };
      const thumb = (l) => `<button class="ff-ph" data-pid="${l.id}"><img alt="" src="${esc(l.src)}"><span>${icon('image')}Değiştir</span></button>`;
      const before = JSON.stringify(ts.map((l) => l.text));
      let tmr = 0;
      const prev = () => { const el = document.getElementById('ffPrev'); if (!el) return; try { el.innerHTML = R.renderSVG(doc, { fit: true, prefix: 'ff' + Math.random().toString(36).slice(2, 6) }); } catch (e) {} };
      const soon = () => { clearTimeout(tmr); tmr = setTimeout(() => { prev(); renderSoon(); }, 140); };
      UI.dialog(`<div class="d-body ff"><h3>${icon('type')} Formla doldur</h3>
        <div class="ff-prev" id="ffPrev"></div>
        ${ph.length ? `<div class="ff-sec">Fotoğraflar</div><div class="ff-phs">${ph.map(thumb).join('')}</div>` : ''}
        ${ts.length ? `<div class="ff-sec">Yazılar</div>` : ''}
        <div class="ff-list">${ts.map((l, i) => `<label class="fld"><span>${esc(label(l, i))}</span><textarea class="inp" rows="${Math.min(4, Math.max(1, R.plain(l.text).split('\n').length))}" data-i="${i}">${esc(R.plain(l.text))}</textarea></label>`).join('')}</div>
        <p class="muted" style="font-size:12px;margin:8px 0 0">Yazdıkça tasarım değişir; yazı uzarsa kutuya sığacak kadar küçülür.</p></div>
        <div class="d-foot"><button class="btn ghost" data-close>Editörde düzenle</button><button class="btn" id="ffShare">${icon('send')}Paylaş</button><button class="btn primary" data-close="ok">Bitti</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          prev();
          $$('textarea', box).forEach((ta) => (ta.oninput = () => {
            const l = ts[+ta.dataset.i];
            // zengin yazı (renkli parça) varsa düz metne çevirmeden sadece içeriği değiştir
            l.text = ta.value; R.layoutText(l);
            if (R.fitUnbreakable) R.fitUnbreakable({ layers: [l] });
            soon();
          }));
          $$('.ff-ph', box).forEach((b) => (b.onclick = () => {
            const l = doc.layers.find((x) => x.id === b.dataset.pid); if (!l) return;
            window.App.pickFiles(async (files) => {
              const f = files[0]; if (!f) return;
              b.classList.add('busy');
              try { const r = await window.App.uploadFile(f); await setImgSrc(l, r.url); $('img', b).src = l.src; prev(); } catch (e) { UI.toast(e.message, true); }
              b.classList.remove('busy');
            }, false);
          }));
          $('#ffShare', box).onclick = async () => { ts.forEach((l) => R.layoutText(l)); commit(); close('ok'); if (window.P11) await window.P11.shareNow(doc); else window.Features.share(doc); };
        },
      }).then(() => { if (JSON.stringify(ts.map((l) => l.text)) !== before) { ts.forEach((l) => R.layoutText(l)); if (window.P8 && window.P8.reflow(doc)) st.sel = []; commit(); } });
    }
    st.fillForm = fillForm;
    st.replacePhotoFlow = replacePhotoFlow; st.textForm = textForm;

    // ---------- klavye
    const onKey = (e) => {
      if (!page.isConnected) return;
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (document.querySelector('.overlay')) return;
      const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
      if (e.key === 'Alt') { if (!st.alt) { st.alt = true; drawOverlay(); } e.preventDefault(); return; }
      if (k === ' ') { if (!st.space) { st.space = true; vp.classList.add('hand'); } e.preventDefault(); return; }
      if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && k === 'y') { e.preventDefault(); redo(); return; }
      if (mod && k === 's') { e.preventDefault(); cb.onSave && cb.onSave(); return; }
      if (mod && k === 'd') { e.preventDefault(); duplicate(); return; }
      if (mod && e.altKey && (k === 'c' || e.code === 'KeyC')) { e.preventDefault(); copyStyle(); return; }
      if (mod && e.altKey && (k === 'v' || e.code === 'KeyV')) { e.preventDefault(); pasteStyle(); return; }
      if (mod && k === 'c') { copy(); return; }
      if (mod && k === 'v') { if (st.clip) { e.preventDefault(); paste(); } return; }
      if (mod && k === 'a') { e.preventDefault(); select(doc.layers.filter((l) => !l.locked && l.visible).map((l) => l.id)); return; }
      if (mod && k === '0') { e.preventDefault(); fit(); return; }
      if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomAt(1.25); return; }
      if (mod && k === '-') { e.preventDefault(); zoomAt(0.8); return; }
      if (mod && k === 'e') { e.preventDefault(); window.App.exportDialog(doc); return; }
      if (mod && k === 'g') { e.preventDefault(); e.shiftKey ? ungroupSel() : groupSel(); return; }
      if (mod) return;
      if (e.key === '?') { e.preventDefault(); showKeys(); return; }
      if (k === 'r' && e.shiftKey) { e.preventDefault(); toggleRulers(); return; }
      if (k === 'delete' || k === 'backspace') { e.preventDefault(); remove(); return; }
      if (k === 'escape') { if (st.pen) { st.pen = null; drawOverlay(); } else if (st.cropBox) { st.cropBox = null; drawOverlay(); renderToolOpts(); } else select([]); return; }
      if (k === 'enter') { if (st.tool === 'crop' && st.cropBox) { applyCrop(); return; } if (st.pen) finishPen(false); else { const l = one(); if (l && l.type === 'text') { e.preventDefault(); editText(l); } } return; }
      const step = e.shiftKey ? 10 : 1;
      if (k === 'arrowleft') { e.preventDefault(); nudge(-step, 0); return; }
      if (k === 'arrowright') { e.preventDefault(); nudge(step, 0); return; }
      if (k === 'arrowup') { e.preventDefault(); nudge(0, -step); return; }
      if (k === 'arrowdown') { e.preventDefault(); nudge(0, step); return; }
      if (k === ']') { arrange(e.shiftKey ? 'front' : 'up'); return; }
      if (k === '[') { arrange(e.shiftKey ? 'back' : 'down'); return; }
      if (k === '+' || k === '=') { zoomAt(1.25); return; }
      if (k === '-') { zoomAt(0.8); return; }
      if (/^[0-9]$/.test(e.key) && st.sel.length) { // Photoshop gibi: 1 = %10 … 0 = %100 opaklık
        const v = e.key === '0' ? 1 : +e.key / 10; selected().forEach((l) => (l.opacity = v)); commit(); UI.toast(`Opaklık %${Math.round(v * 100)}`); return;
      }
      if (st.tool === 'crop' && st.cropBox && k === 'enter') { applyCrop(); return; }
      if (e.shiftKey && k === 'e') { setTool('eraser'); return; }
      if (e.shiftKey && k === 'i') { setTool('image'); return; }
      const map = { k: 'lift', x: 'retext', v: 'select', h: 'hand', t: 'text', r: 'rect', m: 'rect', e: 'ellipse', s: 'star', y: 'triangle', l: 'line', p: 'pen', b: 'brush', i: 'eyedrop', g: 'gradient', c: 'crop', z: 'zoom', j: 'heal' };
      if (map[k] && !e.shiftKey) setTool(map[k]);
    };
    const onKeyUp = (e) => { if (e.key === 'Alt' && st.alt) { st.alt = false; drawOverlay(); } if (e.key === ' ') { st.space = false; vp.classList.toggle('hand', st.tool === 'hand'); } };
    const onPaste = async (e) => {
      if (!page.isConnected || (e.target.closest && e.target.closest('input, textarea'))) return;
      const items = [...(e.clipboardData || {}).items || []].filter((i) => i.type.startsWith('image/'));
      if (!items.length) return;
      e.preventDefault();
      for (const it of items) { try { const r = await window.App.uploadFile(it.getAsFile()); await placeImage(r.url); } catch (er) { UI.toast(er.message, true); } }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => { if (st.alt) { st.alt = false; drawOverlay(); } });
    document.addEventListener('paste', onPaste);
    const onResize = () => { drawOverlay(); };
    window.addEventListener('resize', onResize);

    // ---------- üst çubuk
    $('.ed-top', page).addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'undo') undo(); else if (a === 'redo') redo();
      else if (a === 'zin') zoomAt(1.25); else if (a === 'zout') zoomAt(0.8); else if (a === 'fit') fit();
      else if (a === 'save') cb.onSave && cb.onSave();
      else if (a === 'export') window.App.exportDialog(doc);
      else if (a === 'share') { if (window.P11) window.P11.shareNow(doc); else window.Features.share(doc); }
      else if (a === 'fill') fillForm();
      else if (a === 'share') window.P7 && window.P7.share(doc);
      else if (a === 'preview') cb.onPreview && cb.onPreview();
      else if (a === 'studio') cb.onStudio && cb.onStudio();
      else if (a === 'cmd') window.App.commandPalette();
      else if (a === 'panel') togglePanel();
      else if (a === 'check') preflight();
      else if (a === 'coach') window.Coach.coach();
      else if (a === 'simple') { window.Coach.setSimple(!window.Coach.simple()); UI.toast(window.Coach.simple() ? 'Sade mod: yalnız temel araçlar görünüyor' : 'Pro mod: tüm araçlar açık'); }
      else if (a === 'more') moreMenu();
    });
    $('.zoom-float', page).addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      ({ zin: () => zoomAt(1.25), zout: () => zoomAt(0.8), fit })[b.dataset.a]();
    });
    $('.sheet-handle', page).onclick = () => togglePanel(false);
    (() => {
      const hd = $('.sheet-handle', page), tabs = $('.ed-panel .tabs', page);
      let y0 = null;
      const start = (e) => { y0 = e.touches[0].clientY; };
      const move = (e) => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) panel.style.transform = `translateY(${dy}px)`; };
      const end = (e) => { if (y0 == null) return; const dy = (e.changedTouches[0].clientY - y0); panel.style.transform = ''; y0 = null; if (dy > 70) togglePanel(false); };
      [hd, tabs].forEach((el) => { el.addEventListener('touchstart', start, { passive: true }); el.addEventListener('touchmove', move, { passive: true }); el.addEventListener('touchend', end); });
    })();
    function togglePanel(force) {
      st.panelOpen = typeof force === 'boolean' ? force : !st.panelOpen;
      panel.classList.toggle('open', st.panelOpen);
      page.querySelector('.editor').classList.toggle('sheet-open', st.panelOpen);
      $('#panelBtn', page).classList.toggle('on', st.panelOpen);
    }
    const nameIn = $('#eName', page);
    nameIn.onchange = () => { doc.name = nameIn.value.trim() || 'Adsız'; cb.onChange && cb.onChange(); };
    nameIn.onkeydown = (e) => { if (e.key === 'Enter') nameIn.blur(); };
    $$('.tabs button', page).forEach((b) => (b.onclick = () => { st.tab = b.dataset.tab; renderPanel(); }));

    // ---------- sağ panel
    function getK(o, k) { return k.split('.').reduce((a, p) => (a == null ? a : a[p]), o); }
    function setK(o, k, v) { const ps = k.split('.'); let t = o; ps.slice(0, -1).forEach((p) => { if (t[p] == null || typeof t[p] !== 'object') t[p] = {}; t = t[p]; }); t[ps[ps.length - 1]] = v; }
    // birim: px ya da mm (baskı işleri için; 300 dpi, kutu şablonlarında gerçek ölçek)
    const UNIT_K = ['x', 'y', 'w', 'h', 'width', 'height'];
    const mmF = () => (doc.meta && doc.meta.box && doc.meta.box.ppm ? 1 / doc.meta.box.ppm : 25.4 / ((doc.meta && doc.meta.dpi) || 300));
    const isMM = () => !!(doc.meta && doc.meta.unit === 'mm');
    const num = (k, label, o, step = 1) => { const u = isMM() && UNIT_K.includes(k); const v = +getK(o, k) || 0; return `<label class="num"><b>${label}</b><input class="inp" type="number" step="${u ? 0.1 : step}" data-k="${k}"${u ? ' data-unit="mm"' : ''} value="${u ? Math.round(v * mmF() * 10) / 10 : r1(v)}">${u ? '<i class="u">mm</i>' : ''}</label>`; };
    const range = (k, label, min, max, step, o, def = 0) => { const v = getK(o, k) ?? def; return `<div class="prow"><span>${label}</span><input type="range" data-k="${k}" data-num min="${min}" max="${max}" step="${step}" value="${v}"><output>${r1(+v)}</output></div>`; };
    const eyedrop = (k) => `<button class="btn ghost sm icon" data-eye="${k}" title="Damlalık: ekrandan renk al">${icon('dropper')}</button>`;
    const colorIn = (k, o, fallback = '#000000') => { const v = getK(o, k); const hex = v && v !== 'none' ? R.toHex(v) : fallback; return `<div style="display:flex;gap:4px;flex:1;min-width:0"><label class="color"><input type="color" data-k="${k}" data-color value="${hex}"><input type="text" data-k="${k}" data-hex value="${hex}" maxlength="9"></label>${eyedrop(k)}</div>`; };

    // ---------- tasarımı yeniden renklendir (Illustrator Recolor / Canva stil gibi)
    function hsl(hex) { const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s2 = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s2 = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s2, l]; }
    function hex(h, s2, l) { h = ((h % 360) + 360) % 360; s2 = Math.max(0, Math.min(1, s2)); l = Math.max(0, Math.min(1, l)); const c = (1 - Math.abs(2 * l - 1)) * s2, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); }
    function mapColors(map) {
      const sw = (c) => { if (!c || typeof c !== 'string' || c === 'none') return c; let hx; try { hx = R.toHex(c).toUpperCase(); } catch (e) { return c; } const n = map[hx]; if (!n) return c; const a = R.parseColor(c).a; return a < 1 ? R.rgba(n, a) : n; };
      const fixFill = (f) => (f && typeof f === 'object' && f.colors ? Object.assign({}, f, { colors: f.colors.map(sw) }) : sw(f));
      if (typeof doc.background === 'object' && doc.background.color) doc.background.color = sw(doc.background.color); else doc.background = fixFill(doc.background);
      doc.layers.forEach((l) => {
        if (l.type === 'adjust') return;
        l.fill = fixFill(l.fill); l.stroke = sw(l.stroke); if (l.bgFill) l.bgFill = sw(l.bgFill);
        if (l.shadow && l.shadow.color) l.shadow.color = sw(l.shadow.color);
        if (l.fx) Object.values(l.fx).forEach((v) => { if (v && v.color) v.color = sw(v.color); });
        if (l.type === 'text' && R.hasRich(l.text)) l.text = String(l.text).replace(/#[0-9a-fA-F]{6}/g, (m) => map[m.toUpperCase()] || m);
      });
    }
    async function recolorDialog() {
      const photoPal = window.P8 ? await window.P8.photoPalette(doc).catch(() => null) : null;
      const orig = JSON.stringify({ b: doc.background, l: doc.layers });
      const cols = docColors().slice(0, 10);
      if (!cols.length) { UI.toast('Tasarımda değiştirilecek renk yok'); return; }
      const cur = Object.fromEntries(cols.map((c) => [c, c]));
      const main = cols.find((c) => { const [, s2, l] = hsl(c); return s2 > 0.25 && l > 0.2 && l < 0.8; }) || cols[0];
      const [h0, s0] = hsl(main);
      const gen = (fn) => cols.map((c, i) => { const [h, s2, l] = hsl(c); return fn(h, s2, l, i); });
      const sets = [
        ['Marka renklerim', ((window.App.S.brand && window.App.S.brand.colors) || []).filter(Boolean).length ? cols.map((c, i) => { const bc = window.App.S.brand.colors.filter(Boolean); const [, s2, l] = hsl(c); return s2 < 0.12 ? c : bc[i % bc.length]; }) : null],
        ['Fotoğraftan', photoPal && photoPal.length ? (() => { const pc = photoPal.filter((c) => hsl(c)[1] > 0.15); const src = pc.length ? pc : photoPal; let k = 0; return gen((h, s2, l) => { if (s2 < 0.12) return hex(h, s2, l); const [ph, ps] = hsl(src[k++ % src.length]); return hex(ph, Math.max(0.3, Math.min(0.85, ps)), l); }); })() : null],
        ['Tamamlayıcı', gen((h, s2, l) => (s2 < 0.12 ? hex(h, s2, l) : hex(h + 180, s2, l)))],
        ['Analog', gen((h, s2, l, i) => (s2 < 0.12 ? hex(h, s2, l) : hex(h0 + (i % 3 - 1) * 30, Math.max(s2, 0.45), l)))],
        ['Üçlü', gen((h, s2, l, i) => (s2 < 0.12 ? hex(h, s2, l) : hex(h0 + (i % 3) * 120, Math.max(s2, 0.5), l)))],
        ['Tek renk', gen((h, s2, l) => hex(h0, s2 < 0.12 ? s2 : s0, l))],
        ['Pastel', gen((h, s2, l) => hex(h, s2 * 0.55, Math.min(0.92, l * 0.4 + 0.55)))],
        ['Koyu / lüks', gen((h, s2, l) => (l > 0.6 ? hex(42, 0.55, 0.62) : hex(h, s2 * 0.6, l * 0.35)))],
        ['Siyah‑beyaz', gen((h, s2, l) => hex(0, 0, l))],
      ].filter((x) => x[1]);
      const apply = () => { const st0 = JSON.parse(orig); doc.background = st0.b; doc.layers = st0.l; R.normalize(doc); mapColors(cur); renderCanvas(); };
      UI.dialog(`<div class="d-body"><h3>${icon('recolor')} Tasarımı yeniden renklendir</h3>
        <p class="muted" style="margin:0 0 10px">Bir öneri seç ya da renkleri tek tek değiştir; tüm tasarımda aynı renk birlikte değişir. Değişiklik tuvalde canlı görünür.</p>
        <div class="rc-sets">${sets.map(([n, arr], i) => `<button class="rc-set" data-set="${i}"><span>${arr.slice(0, 5).map((c) => `<i style="background:${c}"></i>`).join('')}</span><b>${n}</b></button>`).join('')}</div>
        <div class="rc-list">${cols.map((c) => `<div class="rc-row"><i style="background:${c}"></i><span>→</span><label class="color"><input type="color" data-rc="${c}" value="${c}"><input type="text" data-rch="${c}" value="${c}" maxlength="7"></label></div>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" id="rcCancel">Vazgeç</button><button class="btn primary" id="rcOk">Uygula</button></div>`, {
        onOpen: (box, close) => {
          const sync = () => { $$('[data-rc]', box).forEach((i) => (i.value = cur[i.dataset.rc])); $$('[data-rch]', box).forEach((i) => (i.value = cur[i.dataset.rch])); };
          $$('[data-set]', box).forEach((b) => (b.onclick = () => { const arr = sets[+b.dataset.set][1]; cols.forEach((c, i) => (cur[c] = arr[i])); sync(); apply(); $$('[data-set]', box).forEach((x) => x.classList.toggle('on', x === b)); }));
          $$('[data-rc]', box).forEach((i) => (i.oninput = () => { cur[i.dataset.rc] = i.value.toUpperCase(); sync(); apply(); }));
          $$('[data-rch]', box).forEach((i) => (i.onchange = () => { if (/^#[0-9a-f]{6}$/i.test(i.value)) { cur[i.dataset.rch] = i.value.toUpperCase(); sync(); apply(); } }));
          $('#rcCancel', box).onclick = () => { const st0 = JSON.parse(orig); doc.background = st0.b; doc.layers = st0.l; R.normalize(doc); renderCanvas(); close(null); };
          $('#rcOk', box).onclick = () => { apply(); commit(); close(true); UI.toast('Renkler güncellendi'); };
        },
      }).then((ok) => { if (ok === null) { const st0 = JSON.parse(orig); doc.background = st0.b; doc.layers = st0.l; R.normalize(doc); renderCanvas(); } });
    }
    // ---------- renk örnekleri: marka renkleri + tasarımdaki renkler + son kullanılanlar
    function docColors() {
      const set = new Map();
      const add = (c) => { if (!c || typeof c !== 'string' || c === 'none') return; try { const hx = R.toHex(c).toUpperCase(); set.set(hx, (set.get(hx) || 0) + 1); } catch (e) {} };
      add(typeof doc.background === 'object' ? doc.background.color : doc.background);
      doc.layers.forEach((l) => { if (l.type === 'adjust' || l.role === 'patch') return; add(l.fill); add(l.stroke); if (l.fill && typeof l.fill === 'object' && l.fill.colors) l.fill.colors.forEach(add); if (l.bgFill) add(l.bgFill); if (l.type === 'text' && R.hasRich(l.text)) (String(l.text).match(/#[0-9a-fA-F]{6}/g) || []).forEach(add); });
      return [...set.entries()].sort((a, b) => b[1] - a[1]).map((x) => x[0]);
    }
    const recentColors = () => { try { return JSON.parse(localStorage.getItem('ts_recent_colors') || '[]'); } catch (e) { return []; } };
    function pushRecent(c) { try { const hx = R.toHex(c).toUpperCase(); const r = [hx, ...recentColors().filter((x) => x !== hx)].slice(0, 10); localStorage.setItem('ts_recent_colors', JSON.stringify(r)); } catch (e) {} }
    function swatches(key) {
      const brand = ((window.App.S.brand && window.App.S.brand.colors) || []).filter(Boolean).slice(0, 6);
      const docC = docColors().slice(0, 8), rec = recentColors().filter((c) => !docC.includes(c)).slice(0, 6);
      const row = (t, arr) => arr.length ? `<div class="sw-row"><span>${t}</span>${arr.map((c) => `<button class="sw" data-sw="${key}" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>` : '';
      return `<div class="swatches">${row('Marka', brand)}${row('Tasarımda', docC)}${row('Son', rec)}</div>`;
    }
    function fillEditor(key, o, label) {
      let f = getK(o, key);
      if (key === 'background' && f && f.type === 'solid') { f = f.color; key = 'background.color'; }
      const mode = f && typeof f === 'object' ? 'grad' : !f || f === 'none' ? 'none' : 'solid';
      const segKey = key.replace('.color', '');
      let h = `<div class="grp"><h4>${label}<span class="seg" data-fillmode="${segKey}"><button data-m="solid" class="${mode === 'solid' ? 'on' : ''}">Düz</button><button data-m="grad" class="${mode === 'grad' ? 'on' : ''}">Gradyan</button>${segKey !== 'background' ? `<button data-m="none" class="${mode === 'none' ? 'on' : ''}">Yok</button>` : ''}</span></h4>`;
      if (mode === 'solid') h += `<div style="display:flex;gap:6px">${colorIn(key, o)}</div>${swatches(key)}${segKey !== 'background' ? range('__alpha_' + key, 'Renk opaklığı', 0, 100, 1, { ['__alpha_' + key]: Math.round(R.parseColor(f).a * 100) }) : ''}`;
      if (mode === 'grad') {
        h += `<div class="g2">${colorIn(key + '.colors.0', o)}${colorIn(key + '.colors.1', o)}</div>
          <div class="prow"><span>Tür</span><select class="inp" data-k="${key}.type" style="height:30px"><option value="linear" ${f.type !== 'radial' ? 'selected' : ''}>Doğrusal</option><option value="radial" ${f.type === 'radial' ? 'selected' : ''}>Dairesel</option></select></div>
          ${f.type !== 'radial' ? range(key + '.angle', 'Açı', 0, 360, 1, o) : ''}`;
      }
      return h + '</div>';
    }

    function renderPanel() {
      $$('.tabs button', page).forEach((b) => b.classList.toggle('on', b.dataset.tab === st.tab));
      if (st.tab === 'layers') return renderLayers();
      if (st.tab === 'assets') return renderAssets();
      if (st.tab === 'hist') return renderHistory();
      const ls = selected(), l = one();
      let h = '';
      if (ls.length) h += `<div class="grp"><h4>Katmana komut ver</h4><div class="ai-layer"><input class="inp" id="lcmd" placeholder="örn. daha parlak yap, %20 büyüt, kırmızı yap"><button class="btn sm primary icon" id="lcmdGo" title="Uygula">${icon('wand')}</button></div><div class="ai-layer-hint">Yazdığın komut yalnızca seçili katmana uygulanır.</div></div>`;
      if (ls.length) h += `<div class="grp"><div class="iconrow"><button class="btn sm" data-sx="comp">${icon('star')}Bileşen yap</button><button class="btn sm" data-sx="export">${icon('download')}Dışa aktar</button>${ls[0].component ? `<button class="btn sm" data-sx="compUpd" title="Bileşenin tanımını bu hâliyle güncelle">${icon('refresh')}Bileşeni güncelle</button>` : ''}</div></div>`;
      if (!ls.length && doc.meta && doc.meta.clientLocked) h += `<div class="grp lock-info"><b>${icon('lock')} Kilitli şablon</b><p class="muted">Yazılara dokunup değiştir, fotoğrafı seçip “Görseli değiştir” de. Yerleşim sabit.</p><button class="btn sm ghost" data-act2="unlockClient">${icon('unlock')}Kilidi aç</button></div>`;
      if (!ls.length) {
        h += `<div class="grp"><h4>Tuval<span class="seg unit-seg"><button data-unit-set="px" class="${isMM() ? '' : 'on'}">px</button><button data-unit-set="mm" class="${isMM() ? 'on' : ''}">mm</button></span></h4><div class="g2">${num('width', 'G', doc)}${num('height', 'Y', doc)}</div>${isMM() ? `<p class="muted" style="font-size:11.5px;margin:4px 0 0">${doc.meta && doc.meta.box ? 'Kutu şablonunun gerçek ölçüsü' : '300 dpi baskı ölçüsü'} · ${Math.round(doc.width * mmF())} × ${Math.round(doc.height * mmF())} mm</p>` : ''}
          <select class="inp" id="sizePreset" style="margin-top:8px;height:32px">${SIZE_PRESETS.map(([v, t]) => `<option value="${v}">${t}${v ? ' · ' + v.replace('x', '×') : ''}</option>`).join('')}</select></div>`;
        if (doc.meta && ['pdf', 'ai'].includes(doc.meta.imported)) h += `<div class="grp pdf-grp"><h4>PDF araçları${doc.meta.pages ? `<span class="muted" style="font-weight:400">sayfa ${doc.meta.page} / ${doc.meta.pages}</span>` : ''}</h4><p class="muted" style="font-size:12px;margin:0 0 8px">Yazılara çift dokunup düzenle. İmzala, işaretle, not ekle:</p><div class="pdf-btns"><button class="btn sm" data-pdf="sign">${icon('pen')}İmza</button><button class="btn sm" data-pdf="text">${icon('type')}Metin</button><button class="btn sm" data-pdf="highlight">${icon('brush')}Vurgula</button><button class="btn sm" data-pdf="whiteout">${icon('square')}Beyazlat</button><button class="btn sm" data-pdf="note">${icon('list')}Not</button><button class="btn sm" data-pdf="stamp">${icon('check')}Damga</button><button class="btn sm" data-pdf="more">${icon('menu')}Tümü</button></div></div>`;
        h += fillEditor('background', doc, 'Arka plan');
        h += gridPanel();
        if (doc.meta && doc.meta.linkGroup) h += `<div class="grp"><h4>Bağlı formatlar</h4><p class="muted" style="font-size:12px;margin:0 0 8px">Bu tasarım diğer ölçülerle bağlı. Burada yaptığın yazı, görsel ve renk değişikliklerini tek dokunuşla hepsine aktar.</p><button class="btn sm" data-act2="sync" style="width:100%">${icon('refresh')}Diğer formatları güncelle</button></div>`;
        h += reviewPanel();
        h += `<div class="grp"><button class="btn sm primary" data-act2="recolor" style="width:100%">${icon('recolor')}Tasarımı yeniden renklendir</button><div class="iconrow" style="margin-top:6px"><button class="btn sm" data-act2="styles">${icon('palette')}Stil setleri</button><button class="btn sm" data-act2="translate">${icon('globe')}Çevir</button></div></div>`;
        h += `<div class="grp"><h4>İpuçları</h4><p class="muted" style="margin:0;font-size:12.5px;line-height:1.6">Katman seçmek için tıkla, birden fazla için Shift. Metni değiştirmek için çift tıkla. Boşluk tuşunu basılı tutup sürükleyerek kaydır, Ctrl + tekerlekle yakınlaştır. Görselleri tuvale sürükleyip bırakabilir ya da yapıştırabilirsin.</p></div>`;
      } else if (!l) {
        const grouped = ls.every((x) => x.group && x.group === ls[0].group);
        h += `<div class="grp"><h4>${ls.length} katman seçili</h4>${alignRow()}<div class="iconrow" style="margin-top:8px">${grouped ? `<button class="btn sm" data-act="ungroup">${icon('layers')}Grubu çöz</button>` : `<button class="btn sm" data-act="group">${icon('layers')}Grupla</button>`}<button class="btn sm" data-act="dup">${icon('copy')}Çoğalt</button><button class="btn sm danger" data-act="del">${icon('trash')}Sil</button></div></div>`;
        if (ls.length >= 2 && ls.every(isShape)) h += pfPanel();
        const bcl = ls.find((x) => x.barcode);
        if (bcl) h += bcPanel(bcl);
        h += `<div class="grp"><h4>Görünüm</h4>${range('opacity', 'Opaklık', 0, 1, 0.01, { opacity: ls[0].opacity })}</div>`;
      } else {
        h += `<div class="grp"><h4><span>${esc(R.TYPE_NAMES[l.type] || l.type)}</span><span class="iconrow" style="flex:none">
            <button class="btn ghost sm icon" data-act="dup" title="Çoğalt (Ctrl+D)">${icon('copy')}</button>
            <button class="btn ghost sm icon" data-act="lock" title="Kilitle">${icon(l.locked ? 'lock' : 'unlock')}</button>
            <button class="btn ghost sm icon danger" data-act="del" title="Sil (Del)">${icon('trash')}</button></span></h4>
          <div class="g2">${num('x', 'X', l)}${num('y', 'Y', l)}${num('w', 'G', l)}${l.type === 'text' ? `<label class="num"><b>Y</b><input class="inp" disabled value="${Math.round(l.h)}"></label>` : num('h', 'Y', l)}</div>
          <div class="g2" style="margin-top:8px">${num('rotation', '°', l)}<div class="iconrow"><button class="btn sm icon ${l.flipX ? 'on' : ''}" data-act="flipX" title="Yatay çevir">${icon('flipH')}</button><button class="btn sm icon ${l.flipY ? 'on' : ''}" data-act="flipY" title="Dikey çevir">${icon('flipV')}</button></div></div>
          ${range('skewX', 'Eğ (yatay)', -60, 60, 1, l, 0)}${range('skewY', 'Eğ (dikey)', -60, 60, 1, l, 0)}${l.type === 'image' ? `<button class="btn sm" data-act="persp" style="width:100%;margin-top:6px">${icon('crop')}Perspektif (4 köşe)</button>` : ''}
          ${alignRow()}
          <div class="iconrow" style="margin-top:6px">
            <button class="btn sm" data-act="front" title="En öne (Shift+])">${icon('front')}Öne</button><button class="btn sm" data-act="back" title="En arkaya (Shift+[)">${icon('back')}Arkaya</button>
          </div></div>`;
        if (l.type === 'text') {
          h += `<div class="grp"><h4>Metin<span class="muted" style="font-weight:400">tuvalde yazıya tekrar dokun: yerinde düzenle</span></h4><textarea class="inp" data-k="text" rows="3" id="txtArea">${esc(l.text)}</textarea>
            <button class="btn sm ai-write" data-act="aiWrite">${icon('sparkle')}Yapay zekayla yaz / yeniden yaz</button>
            <div class="rich-row"><span class="muted">Seçili kelimeleri:</span><button class="btn sm" data-rich="b" title="Seçili kelimeleri kalın yap"><b>K</b> Kalın</button><label class="color mini"><input type="color" id="richCol" value="${R.toHex(typeof l.fill === 'string' && l.fill !== 'none' ? (R.toHex(l.fill) === '#E2197C' ? '#19A9E1' : '#E2197C') : '#E2197C')}"></label><button class="btn sm" data-rich="c" title="Seçili kelimeleri bu renge boya">Renklendir</button><button class="btn ghost sm" data-rich="x" title="Vurguları kaldır">Temizle</button></div>
            <button class="inp font-btn" data-act="fontPick" style="margin-top:8px" title="Yazı tipi seç"><span style="font-family:'${esc(l.fontFamily)}';font-weight:${+l.fontWeight || 400}${l.italic ? ';font-style:italic' : ''}">${esc(l.fontFamily)}</span>${icon('chevD')}</button>
            <button class="btn ghost sm" data-act="fontUp" style="margin-top:6px">${icon('upload')}Kendi fontunu yükle</button>
            <div class="g2" style="margin-top:8px">${num('fontSize', 'pt', l)}<select class="inp" data-k="fontWeight" data-num style="height:32px">${window.Fonts ? window.Fonts.weightOptions(l.fontFamily, +l.fontWeight || 400) : ''}</select></div>
            <div class="iconrow" style="margin-top:8px">
              <button class="btn sm icon ${l.align === 'left' ? 'on' : ''}" data-set="align:left" title="Sola">${icon('tL')}</button><button class="btn sm icon ${l.align === 'center' ? 'on' : ''}" data-set="align:center" title="Ortala">${icon('tC')}</button><button class="btn sm icon ${l.align === 'right' ? 'on' : ''}" data-set="align:right" title="Sağa">${icon('tR')}</button>
              <button class="btn sm icon ${l.italic ? 'on' : ''}" data-toggle="italic" title="İtalik">${icon('italic')}</button><button class="btn sm icon ${l.underline ? 'on' : ''}" data-toggle="underline" title="Altı çizili">${icon('underline')}</button><button class="btn sm ${l.uppercase ? 'on' : ''}" data-toggle="uppercase" title="Büyük harf">AA</button>
            </div>
            ${range('lineHeight', 'Satır aralığı', 0.7, 2.5, 0.05, l, 1.2)}${range('letterSpacing', 'Harf aralığı', -10, 60, 0.5, l)}</div>`;
          { const TS = tStyles(), cur = TS.find((x) => x.id === l.tstyle);
            h += `<div class="grp"><h4>Metin stili<span class="muted" style="font-weight:400">${cur ? 'bağlı: ' + esc(cur.name) : 'Başlık, Fiyat, Açıklama…'}</span></h4>
            <div class="ts-row"><select class="inp" id="tsSel" style="height:32px"><option value="">— Stil seç —</option>${TS.map((x) => `<option value="${x.id}" ${x.id === l.tstyle ? 'selected' : ''}>${esc(x.name)} · ${esc(x.fontFamily)} ${Math.round(x.fontSize)}</option>`).join('')}</select></div>
            <div class="iconrow" style="margin-top:6px"><button class="btn sm" data-ts="save">${icon('plus')}Yeni stil</button>${cur ? `<button class="btn sm" data-ts="update" title="Bu stile bağlı tüm yazılar güncellenir">${icon('refresh')}Stili güncelle</button><button class="btn sm ghost" data-ts="unlink" title="Stil bağlantısını kaldır">${icon('x')}</button>` : ''}</div></div>`;
            const hasTab = /\t/.test(l.text || '');
            h += `<div class="grp"><h4>Fiyat / özellik satırı<span class="muted" style="font-weight:400">ad ⇥ fiyat</span></h4>
            <p class="muted" style="font-size:12px;margin:0 0 8px">Ürün adı ile fiyat arasına <b>Tab</b> bas: fiyat sağa yaslanır, arası noktayla dolar. Uzunluk değişince kendini ayarlar.</p>
            <div class="seg" style="width:100%">${[['dots', '· · ·'], ['dash', '- - -'], ['line', '———'], ['none', 'Boş']].map(([v, t]) => `<button style="flex:1" class="${hasTab && (l.leader || 'dots') === v ? 'on' : ''}" data-leader="${v}">${t}</button>`).join('')}</div>
            <button class="btn sm" data-act="toLeader" style="width:100%;margin-top:6px">${icon('list')}${hasTab ? 'Satırları yeniden hizala' : 'Satırları fiyat satırına çevir'}</button></div>`; }
          h += fillEditor('fill', l, 'Yazı rengi');
          h += `<div class="grp"><h4>Dış çizgi</h4><div style="display:flex;gap:6px">${colorIn('stroke', l, '#000000')}</div>${range('strokeWidth', 'Kalınlık', 0, 30, 0.5, l)}</div>`;
        }
        if (l.type === 'image') {
          const f = l.filters || {};
          h += `<div class="grp"><h4>Görsel<span class="iconrow" style="flex:none"><button class="btn sm" data-act="fillBg" title="Tuvali kaplasın ve en arkaya geçsin">${icon('fit')}Arka plan yap</button><button class="btn sm" data-act="replace">${icon('upload')}Değiştir</button></span></h4>
            <div class="seg" style="width:100%">${[['cover', 'Doldur'], ['contain', 'Sığdır'], ['fill', 'Esnet']].map(([v, t]) => `<button style="flex:1" class="${l.fit === v ? 'on' : ''}" data-set="fit:${v}">${t}</button>`).join('')}</div>
            ${(!l.mask || l.mask === 'none') ? range('radius', 'Köşe', 0, Math.round(Math.min(l.w, l.h) / 2), 1, l) : ''}</div>
            ${l.crop ? `<div class="grp"><h4>Kaynaktan kesilen alan<button class="btn ghost sm" data-act="cropFull">Tamamı</button></h4><p class="muted" style="font-size:12px;margin:0 0 4px">Kesilen bölgeye komşu yazı girdiyse sınırları daralt.</p>
              ${range('crop.x', 'Sol', 0, 1, 0.002, l)}${range('crop.y', 'Üst', 0, 1, 0.002, l)}${range('crop.w', 'Genişlik', 0.01, 1, 0.002, l)}${range('crop.h', 'Yükseklik', 0.01, 1, 0.002, l)}</div>` : ''}
            ${l.icon ? `<div class="grp"><h4>Simge rengi</h4><label class="color"><input type="color" id="icRe" value="${R.toHex(l.icon.color || '#1B2A4A')}"><span>Renk</span></label></div>` : ''}
            <div class="grp"><h4>Kenarlar</h4><div class="seg" id="fadeSeg">${[['none', 'Keskin'], ['soft', 'Yumuşak'], ['cloud', 'Bulut']].map(([k, t]) => `<button data-fade="${k}" class="${(!l.fade ? 'none' : l.fade.cloud ? 'cloud' : 'soft') === k ? 'on' : ''}">${t}</button>`).join('')}</div><button class="btn sm" data-v="imgswap" style="margin-top:8px;width:100%">${icon('image')}Resmi değiştir</button><div class="iconrow" style="margin-top:6px"><button class="btn sm" data-v="imgfocus">${icon('fit')}Akıllı kadraj</button><button class="btn sm" data-v="imgfix">${icon('wand')}Otomatik iyileştir</button></div><button class="btn sm" data-v="imgpola" style="margin-top:6px;width:100%">${icon('image')}Polaroid çerçeve</button></div>
            <div class="grp"><h4>Maske (şekle kırp)</h4><div class="mask-row">${['none', 'rounded', 'circle', 'hexagon', 'octagon', 'star', 'heart', 'triangle', 'arch', 'blob', 'drop', 'ticket', 'scallop', 'cloud', 'brush'].map((m) => `<button data-mask="${m}" class="${(l.mask || 'none') === m ? 'on' : ''}" title="${{ none: 'Yok', rounded: 'Yuvarlak köşe', circle: 'Daire', hexagon: 'Altıgen', octagon: 'Sekizgen', star: 'Yıldız', heart: 'Kalp', triangle: 'Üçgen', arch: 'Kemer', blob: 'Organik', drop: 'Damla', ticket: 'Bilet', scallop: 'Dalgalı rozet', cloud: 'Bulut', brush: 'Fırça kenarı' }[m]}"><svg viewBox="-4 -4 108 108">${m === 'none' ? '<rect width="100" height="100" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="10 8"/>' : m === 'circle' ? '<circle cx="50" cy="50" r="50" fill="currentColor"/>' : `<path d="${R.MASKS[m]}" fill="currentColor"/>`}</svg></button>`).join('')}</div></div>
            <div class="grp"><h4>Kırp ve konumla<button class="btn ghost sm" data-act="resetCrop">Sıfırla</button></h4>
            ${range('zoom', 'Yakınlaştır', 1, 4, 0.01, l, 1)}${range('ox', 'Yatay', -1, 1, 0.01, l, 0)}${range('oy', 'Dikey', -1, 1, 0.01, l, 0)}
            </div><div class="grp"><h4>Fotoğraftaki yazılar</h4><p class="muted" style="font-size:12px;margin:0 0 8px">Fotoğrafın üzerindeki yazıları düzenlenebilir yap.</p>
            <div class="iconrow"><button class="btn sm primary" data-act="retextTool">${icon('retext')}Tek tek değiştir</button><button class="btn sm" data-act="liftTool">${icon('lift')}Seç ve ayır</button><button class="btn sm" data-act="detectText">${icon('sparkle')}<span>Hepsini bul</span></button></div>
            ${doc.layers.some((x) => x.role === 'patch' || x.role === 'retext') ? `<button class="btn sm ghost danger" data-act="undoRetext" style="margin-top:6px;width:100%">${icon('undo')}Tüm yazı değişikliklerini kaldır</button>` : ''}</div>
            ${l.role === 'patch' ? `<div class="grp"><h4>Dolgu</h4><button class="btn sm primary" data-act="aiFill" style="width:100%">${icon('sparkle')}Dolguyu yapay zekayla doğal yap</button><p class="muted" style="font-size:12px;margin:6px 0 0">Bulanık görünen dolgu alanını çevresindeki dokuyla yeniden çizer.</p></div>` : ''}
            <div class="grp"><h4>Görsel araçları</h4>
            <button class="btn sm primary" data-act="aiEdit" style="width:100%;margin-bottom:6px">${icon('sparkle')}Yapay zekayla değiştir / yenile</button>
            <button class="btn sm primary" data-act="decompose" style="width:100%;margin-bottom:6px" title="Yazılar, şekiller ve nesneler ayrı ayrı düzenlenebilir katman olur">${icon('layers')}Katmanlara ayır (PSD gibi)</button><div class="tools-grid"><button class="btn sm" data-act="expand" title="Kenarları uzat / tuvali doldur">${icon('fit')}Genişlet</button><button class="btn sm" data-act="genFill" title="Boyadığın yeri değiştir ya da sil">${icon('sparkle')}Seçerek doldur</button><button class="btn sm" data-act="fontMatch" title="Fotoğraftaki yazının yazı tipini bul">${icon('font')}Yazı tipini tanı</button><button class="btn sm" data-act="behind" title="Fotoğraftaki kişi/ürün yazının önüne geçer">${icon('layers')}Yazıyı arkasına al</button><button class="btn sm" data-act="maskEdit" title="Fırçayla gizle / geri getir, sihirli değnekle seç">${icon('brush')}Maske fırçası</button><button class="btn sm" data-act="removeBg">${icon('wand')}Arka planı sil</button><button class="btn sm${l.role === 'barcode' ? ' primary' : ''}" data-act="toBarcode" title="Bulanık barkod görselini net, vektör barkodla değiştir">${icon('barcode')}Vektör barkod</button>${l.origSrc ? `<button class="btn sm ghost" data-act="origSrc">Orijinale dön</button>` : ''}</div></div>
            <div class="grp"><h4>Ürün fotoğrafı</h4><button class="btn sm primary" data-act="autoEnhance" style="width:100%">${icon('sparkle')}Tek dokunuşla iyileştir</button>
            <div class="iconrow" style="margin-top:6px"><button class="btn sm" data-act="healTool">${icon('heal')}Leke düzelt</button><button class="btn sm" data-act="cloneTool">${icon('target')}Klon damgası</button><button class="btn sm" data-act="trace" title="Logo/ikonu vektöre çevir">${icon('vector')}Vektöre çevir</button>${l.origSrc ? `<button class="btn sm ghost" data-act="origSrc2" title="Leke/klon düzeltmelerinden önceki hâl">${icon('undo')}Aslı</button>` : ''}</div></div>
            <div class="grp"><h4>Filtreler<button class="btn ghost sm" data-act="resetF">Sıfırla</button></h4>
            <div class="filter-presets">${Object.keys(PRESETS).map((n) => `<button data-preset="${n}">${n}</button>`).join('')}</div>
            <div class="duo-row"><span>Çift ton</span>${DUOS.map((d, i) => `<button data-duo="${i}" class="${f.duotone && f.duotone.join() === d.join() ? 'on' : ''}" title="Duotone" style="background:linear-gradient(135deg,${d[0]} 50%,${d[1]} 50%)"></button>`).join('')}${f.duotone ? `<button class="btn ghost sm" data-act="duoOff">Kaldır</button>` : ''}</div>
            ${Object.entries(FILTER_LABELS).map(([k, [t, mn, mx, df]]) => range('filters.' + k, t, mn, mx, 1, { filters: f }, df)).join('')}</div>
            <div class="grp"><h4>Çerçeve</h4><div style="display:flex;gap:6px">${colorIn('stroke', l, '#FFFFFF')}</div>${range('strokeWidth', 'Kalınlık', 0, 60, 1, l)}</div>`;
        }
        if (l.barcode) h += bcPanel(l);
        if (['rect', 'ellipse', 'path'].includes(l.type)) {
          h += fillEditor('fill', l, 'Dolgu');
          h += `<div class="grp"><h4>Kenar</h4><div style="display:flex;gap:6px">${colorIn('stroke', l, '#000000')}</div>${range('strokeWidth', 'Kalınlık', 0, Math.max(60, l.strokeWidth || 0), 0.5, l)}
            <div class="prow"><span>Çizgi stili</span><div class="seg dash-seg">${[['', 'Düz', '0'], ['true', 'Kesik', '6 4'], ['dot', 'Noktalı', '0.1 5'], ['long', 'Uzun', '12 5']].map(([v, t, da]) => `<button data-dash="${v}" class="${String(l.dash || '') === v ? 'on' : ''}" title="${t}"><svg viewBox="0 0 40 10"><line x1="3" y1="5" x2="37" y2="5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="${da}"/></svg></button>`).join('')}</div></div>
            <button class="btn sm" data-act="nodes" style="width:100%;margin-top:8px">${icon('vector')}${l.type === 'path' ? 'Noktaları düzenle' : 'Yola dönüştür ve noktaları düzenle'}</button>
            ${l.type === 'rect' ? range('radius', 'Köşe yuvarlama', 0, Math.round(Math.min(l.w, l.h) / 2), 1, l) : ''}</div>`;
        }
        if (l.type === 'adjust') {
          const f = l.filters || {};
          h += `<div class="grp"><h4>Ayar katmanı<button class="btn ghost sm" data-act="resetF">Sıfırla</button></h4><p class="muted" style="font-size:12px;margin:0 0 8px">Altındaki tüm katmanlara uygulanır. Katmanlar panelinde yerini değiştirerek etkileyeceği katmanları seç.</p>
            <div class="filter-presets">${Object.keys(PRESETS).map((n) => `<button data-preset="${n}">${n}</button>`).join('')}</div>
            <div class="duo-row"><span>Çift ton</span>${DUOS.map((d, i) => `<button data-duo="${i}" class="${f.duotone && f.duotone.join() === d.join() ? 'on' : ''}" style="background:linear-gradient(135deg,${d[0]} 50%,${d[1]} 50%)"></button>`).join('')}${f.duotone ? `<button class="btn ghost sm" data-act="duoOff">Kaldır</button>` : ''}</div>
            ${Object.entries(FILTER_LABELS).map(([k, [t, mn, mx, df]]) => range('filters.' + k, t, mn, mx, 1, { filters: f }, df)).join('')}</div>`;
        }
        if (l.type !== 'adjust') h += fxPanel(l);
        if (l.type !== 'adjust') h += animPanel(l);
        const sh = l.shadow;
        h += `<div class="grp"><h4>Görünüm</h4>${range('opacity', 'Opaklık', 0, 1, 0.01, l, 1)}
          <div class="prow"><span>Karışım</span><select class="inp" data-k="blend" style="height:30px">${BLENDS.map(([v, t]) => `<option value="${v}" ${l.blend === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          ${l.type !== 'image' ? range('filters.blur', 'Bulanıklık', 0, 40, 0.5, l) : ''}</div>
          <div class="grp"><h4>Gölge<label class="switch"><input type="checkbox" data-act-cb="shadow" ${sh ? 'checked' : ''}>Açık</label></h4>
          ${sh ? `<div style="display:flex;gap:6px">${colorIn('shadow.color', l, '#000000')}</div>${range('__shA', 'Gölge opaklığı', 0, 100, 1, { __shA: Math.round(R.parseColor(sh.color || '#0008').a * 100) })}${range('shadow.x', 'Yatay', -100, 100, 1, l)}${range('shadow.y', 'Dikey', -100, 100, 1, l)}${range('shadow.blur', 'Yumuşaklık', 0, 150, 1, l)}` : ''}</div>`;
      }
      pbody.innerHTML = h;
      bindPanel();
    }
    // ---------- çerçeveler (Canva gibi): fotoğrafı içine bırak
    const PH = () => (window.Library ? window.Library.templates[1].build({ c: '#D9D4CC', b: '#B9B2A6' })[0].src : '');
    const fIcon = (inner) => `<svg viewBox="0 0 40 40">${inner}</svg>`;
    const FRAMES = [
      { n: 'Daire', mask: 'circle', r: 1, icon: fIcon('<circle cx="20" cy="20" r="15" fill="currentColor"/>') },
      { n: 'Kemer', mask: 'arch', r: 0.8, icon: fIcon('<path d="M7 35V18a13 13 0 0 1 26 0v17z" fill="currentColor"/>') },
      { n: 'Yuvarlak köşe', mask: 'rounded', r: 1, icon: fIcon('<rect x="6" y="6" width="28" height="28" rx="8" fill="currentColor"/>') },
      { n: 'Altıgen', mask: 'hexagon', r: 1, icon: fIcon('<path d="M20 4l14 8v16l-14 8-14-8V12z" fill="currentColor"/>') },
      { n: 'Kalp', mask: 'heart', r: 1, icon: fIcon('<path d="M20 34S5 25 5 14a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 11-15 20-15 20z" fill="currentColor"/>') },
      { n: 'Yıldız', mask: 'star', r: 1, icon: fIcon('<path d="M20 4l4.6 10 10.9 1-8.2 7.3 2.4 10.7L20 27.6 10.3 33l2.4-10.7L4.5 15l10.9-1z" fill="currentColor"/>') },
      { n: 'Organik', mask: 'blob', r: 1, icon: fIcon('<path d="M10 9c6-6 17-4 21 3s2 17-6 20-17 1-19-7 0-12 4-16z" fill="currentColor"/>') },
      { n: 'Polaroid', kind: 'polaroid', icon: fIcon('<rect x="8" y="5" width="24" height="30" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="11" y="8" width="18" height="18" fill="currentColor"/>') },
      { n: '2\'li ızgara', kind: 'grid', cols: 2, rows: 1, icon: fIcon('<rect x="5" y="8" width="14" height="24" rx="1.5" fill="currentColor"/><rect x="21" y="8" width="14" height="24" rx="1.5" fill="currentColor"/>') },
      { n: '3\'lü ızgara', kind: 'grid', cols: 3, rows: 1, icon: fIcon('<rect x="4" y="8" width="9.5" height="24" rx="1.2" fill="currentColor"/><rect x="15.2" y="8" width="9.5" height="24" rx="1.2" fill="currentColor"/><rect x="26.4" y="8" width="9.5" height="24" rx="1.2" fill="currentColor"/>') },
      { n: '4\'lü ızgara', kind: 'grid', cols: 2, rows: 2, icon: fIcon('<rect x="6" y="6" width="13" height="13" rx="1.2" fill="currentColor"/><rect x="21" y="6" width="13" height="13" rx="1.2" fill="currentColor"/><rect x="6" y="21" width="13" height="13" rx="1.2" fill="currentColor"/><rect x="21" y="21" width="13" height="13" rx="1.2" fill="currentColor"/>') },
      { n: 'Büyük + 2 küçük', kind: 'mosaic', icon: fIcon('<rect x="5" y="6" width="18" height="28" rx="1.2" fill="currentColor"/><rect x="25" y="6" width="10" height="13" rx="1.2" fill="currentColor"/><rect x="25" y="21" width="10" height="13" rx="1.2" fill="currentColor"/>') },
    ];
    function insertFrame(f) {
      const W = doc.width, H = doc.height, g = 'g' + R.uid();
      const img = (name, x, y, w, h, extra = {}) => Object.assign({ id: R.uid(), type: 'image', role: 'frame', name, src: PH(), nw: 800, nh: 800, fit: 'cover', filters: {}, x: r1(x), y: r1(y), w: r1(w), h: r1(h) }, extra);
      let ls = [];
      if (f.kind === 'grid' || f.kind === 'mosaic') {
        const gap = Math.round(Math.min(W, H) * 0.015);
        if (f.kind === 'mosaic') {
          const lw = (W - gap) * 0.6;
          ls = [img('Fotoğraf 1', 0, 0, lw, H), img('Fotoğraf 2', lw + gap, 0, W - lw - gap, (H - gap) / 2), img('Fotoğraf 3', lw + gap, (H + gap) / 2, W - lw - gap, (H - gap) / 2)];
        } else {
          const cw = (W - gap * (f.cols - 1)) / f.cols, rh = (H - gap * (f.rows - 1)) / f.rows;
          for (let r = 0; r < f.rows; r++) for (let c = 0; c < f.cols; c++) ls.push(img(`Fotoğraf ${r * f.cols + c + 1}`, c * (cw + gap), r * (rh + gap), cw, rh));
        }
        // ızgara en arkaya (kareler tek tek seçilebilsin diye gruplanmaz)
        doc.layers.unshift(...ls); R.normalize(doc); st.sel = []; commit();
        UI.toast('Izgara eklendi — her kareye fotoğraf sürükle ya da kareyi seçip Fotoğrafların\'dan dokun');
        return;
      }
      const sz = Math.round(Math.min(W, H) * 0.5);
      if (f.kind === 'polaroid') {
        const pw = sz, ph = sz * 1.2, x = (W - pw) / 2, y = (H - ph) / 2, pad = pw * 0.06;
        ls = [
          { id: R.uid(), type: 'rect', name: 'Polaroid kağıdı', x: r1(x), y: r1(y), w: r1(pw), h: r1(ph), fill: '#FFFFFF', radius: 4, shadow: { x: 0, y: Math.round(sz * 0.03), blur: Math.round(sz * 0.08), color: 'rgba(0,0,0,0.3)' }, rotation: -3, group: g },
          img('Polaroid fotoğrafı', x + pad, y + pad, pw - 2 * pad, pw - 2 * pad, { rotation: -3, group: g }),
          { id: R.uid(), type: 'text', name: 'Polaroid notu', text: 'Güzel bir an', x: r1(x + pad), y: r1(y + pw + pad * 0.6), w: r1(pw - 2 * pad), fontSize: Math.round(sz * 0.07), fontFamily: 'Segoe Script', fontWeight: 400, fill: '#333333', align: 'center', rotation: -3, group: g },
        ];
      } else {
        const w = sz * (f.r || 1) , h = sz;
        ls = [img(f.n + ' çerçeve', (W - w) / 2, (H - h) / 2, w, h, { mask: f.mask })];
      }
      doc.layers.push(...ls); R.normalize(doc); st.sel = ls.map((l) => l.id); commit();
      UI.toast('Çerçeve eklendi — içine fotoğraf sürükle ya da Fotoğrafların\'dan birine dokun');
    }
    // ---------- efektler (Photoshop katman stili + Canva yazı efektleri)
    const FX_PRESETS = [
      ['none', 'Yok'], ['soft', 'Gölge'], ['lift', 'Kaldır'], ['neon', 'Neon'], ['sticker', 'Çıkartma'], ['hollow', 'İçi boş'],
      ['splice', 'Ekleme'], ['echo', 'Yankı'], ['glitch', 'Glitch'], ['long', 'Uzun gölge'], ['3d', '3B'], ['emboss', 'Kabartma'], ['bg', 'Arka plan'],
    ];
    function baseColor(l) {
      const f = l.fill; const hx = f && typeof f === 'string' && f !== 'none' ? R.toHex(f) : '#E2197C';
      const lum = (parseInt(hx.slice(1, 3), 16) * 0.299 + parseInt(hx.slice(3, 5), 16) * 0.587 + parseInt(hx.slice(5, 7), 16) * 0.114) / 255;
      return lum > 0.85 ? '#E2197C' : hx; // beyaz yazıda efekt rengi görünür olsun
    }
    function applyFx(l, name) {
      const c = baseColor(l);
      const dark = (hex, k = 0.45) => { const v = R.toHex(hex); const n = (i) => Math.round(parseInt(v.slice(1 + i * 2, 3 + i * 2), 16) * (1 - k)); return '#' + [0, 1, 2].map((i) => n(i).toString(16).padStart(2, '0')).join(''); };
      const sz = Math.max(8, l.type === 'text' ? l.fontSize : Math.min(l.w, l.h) * 0.25);
      // önceki efektleri temizle (yazı/şekil rengini koru)
      if (l._hollowFill && name !== 'hollow' && name !== 'splice') { l.fill = l._hollowFill; delete l._hollowFill; }
      l.fx = {}; l.shadow = null;
      if (l.type === 'text' && name !== 'hollow' && name !== 'splice' && l._fxStroke) { l.strokeWidth = 0; delete l._fxStroke; }
      if (name !== 'bg' && l.type === 'text' && l._fxBg) { l.bgFill = 'none'; delete l._fxBg; }
      const k = sz / 64;
      if (name === 'soft') l.shadow = { x: Math.round(4 * k), y: Math.round(6 * k), blur: Math.round(14 * k), color: 'rgba(0,0,0,0.45)' };
      if (name === 'lift') l.shadow = { x: 0, y: Math.round(10 * k), blur: Math.round(30 * k), color: 'rgba(0,0,0,0.35)' };
      if (name === 'neon') { l.fx.glow = { color: c, blur: Math.round(10 * k + 4), strong: true }; if (l.type === 'text') { l._hollowFill = l._hollowFill || l.fill; l.fill = '#FFFFFF'; } }
      if (name === 'sticker') { l.fx.outline = { color: '#FFFFFF', width: Math.max(3, Math.round(7 * k)) }; l.shadow = { x: 0, y: Math.round(6 * k), blur: Math.round(12 * k), color: 'rgba(0,0,0,0.4)' }; }
      if (name === 'hollow' || name === 'splice') {
        if (l.fill !== 'none') l._hollowFill = l.fill;
        l.fill = 'none'; l.stroke = c; l.strokeWidth = Math.max(1.5, Math.round(2.5 * k * 10) / 10); l._fxStroke = 1;
        if (name === 'splice') l.fx.echo = { color: c, gap: Math.max(3, Math.round(6 * k)), count: 1, angle: 45 };
      }
      if (name === 'echo') l.fx.echo = { color: c, gap: Math.max(3, Math.round(7 * k)), count: 3, angle: 45 };
      if (name === 'glitch') l.fx.glitch = { offset: Math.max(2, Math.round(5 * k)) };
      if (name === 'long') l.fx.long = { color: 'rgba(0,0,0,0.28)', length: Math.round(sz * 1.6), angle: 45 };
      if (name === '3d') l.fx.long = { color: dark(c), length: Math.max(4, Math.round(sz * 0.14)), angle: 60 };
      if (name === 'emboss') { l.fx.inner = { color: 'rgba(0,0,0,0.45)', blur: Math.max(1, Math.round(3 * k)), x: Math.round(2 * k), y: Math.round(2 * k) }; l.shadow = { x: 0, y: -Math.max(1, Math.round(1.5 * k)), blur: 0, color: 'rgba(255,255,255,0.55)' }; }
      if (name === 'bg' && l.type === 'text') { l.bgFill = c; l.fill = R.contrastText ? R.contrastText(c) : '#FFFFFF'; l.bgPad = Math.round(l.fontSize * 0.35); l.radius = Math.round(l.fontSize * 0.25); l._fxBg = 1; }
      if (!Object.keys(l.fx).length) delete l.fx;
      l._fxName = name;
    }
    function fxPanel(l) {
      const fx = l.fx || {};
      const cur = l._fxName || 'none';
      const demo = (n) => {
        const st2 = { soft: 'text-shadow:2px 3px 5px rgba(0,0,0,.6)', lift: 'text-shadow:0 6px 10px rgba(0,0,0,.55)', neon: 'color:#fff;text-shadow:0 0 4px #ff2d9b,0 0 9px #ff2d9b', sticker: 'color:#ff3b5c;-webkit-text-stroke:0;text-shadow:2px 0 #fff,-2px 0 #fff,0 2px #fff,0 -2px #fff,2px 2px #fff,-2px -2px #fff,2px -2px #fff,-2px 2px #fff', hollow: 'color:transparent;-webkit-text-stroke:1.2px #fff', splice: 'color:transparent;-webkit-text-stroke:1.2px #fff;text-shadow:3px 3px #e2197c', echo: 'text-shadow:3px 3px rgba(0,224,184,.7),6px 6px rgba(0,224,184,.45),9px 9px rgba(0,224,184,.25)', glitch: 'text-shadow:-2px 0 #00e5ff,2px 0 #ff2d9b', long: 'text-shadow:1px 1px #0004,2px 2px #0004,3px 3px #0004,4px 4px #0004,5px 5px #0004,6px 6px #0004', '3d': 'color:#ffd23f;text-shadow:1px 1px #c2410c,2px 2px #c2410c,3px 3px #c2410c', emboss: 'color:#f2c230;text-shadow:1px 1px 1px #0008, -1px -1px 0 #fff6', bg: 'background:#e2197c;padding:0 5px;border-radius:4px' }[n] || '';
        return `<span style="font:900 17px Arial;color:#fff;${st2}">Aa</span>`;
      };
      let h = `<div class="grp fx-grp"><h4>Efektler<span class="muted" style="font-weight:400">tek dokunuşla</span></h4>${l.type === 'text' ? `<button class="btn sm" data-act="textStyles" style="width:100%;margin-bottom:8px">${icon('type')}Hazır yazı stilleri (altın, neon, krom…)</button>` : ''}<div class="fx-presets">${FX_PRESETS.filter(([n]) => n !== 'bg' || l.type === 'text').map(([n, t]) => `<button data-fx="${n}" class="${cur === n ? 'on' : ''}"><i>${demo(n)}</i><span>${t}</span></button>`).join('')}</div>`;
      if (l.type === 'text') {
        h += range('curve', 'Kavis', -100, 100, 1, l, 0);
        h += `<div class="iconrow" style="margin-top:6px"><button class="btn sm" data-act="textPhoto">${icon('image')}Yazı içine fotoğraf</button>${l.fill && typeof l.fill === 'object' && l.fill.type === 'image' ? `<button class="btn sm ghost" data-act="textPhotoOff">Kaldır</button>` : ''}</div>`;
      }
      // ince ayar: açık olan efektlerin ayarları
      const sw = (key, label) => `<label class="switch fx-sw"><input type="checkbox" data-fxon="${key}" ${fx[key] ? 'checked' : ''}>${label}</label>`;
      h += `<details class="fx-more" ${Object.keys(fx).length ? 'open' : ''}><summary>İnce ayar</summary>`;
      h += sw('glow', 'Parıltı') + (fx.glow ? `<div style="display:flex;gap:6px">${colorIn('fx.glow.color', l, '#FFFFFF')}</div>${range('fx.glow.blur', 'Yayılma', 1, 60, 1, l, 12)}` : '');
      h += sw('outline', 'Dış kontur') + (fx.outline ? `<div style="display:flex;gap:6px">${colorIn('fx.outline.color', l, '#FFFFFF')}</div>${range('fx.outline.width', 'Kalınlık', 1, 40, 0.5, l, 6)}` : '');
      if (l.type !== 'image') {
        h += sw('inner', 'İç gölge') + (fx.inner ? `<div style="display:flex;gap:6px">${colorIn('fx.inner.color', l, '#000000')}</div>${range('fx.inner.blur', 'Yumuşaklık', 0, 30, 0.5, l, 6)}${range('fx.inner.x', 'Yatay', -30, 30, 1, l, 3)}${range('fx.inner.y', 'Dikey', -30, 30, 1, l, 3)}` : '');
        h += sw('long', 'Uzun gölge / 3B') + (fx.long ? `<div style="display:flex;gap:6px">${colorIn('fx.long.color', l, '#000000')}</div>${range('fx.long.length', 'Uzunluk', 1, 400, 1, l, 30)}${range('fx.long.angle', 'Açı', 0, 360, 1, l, 45)}` : '');
        h += sw('echo', 'Yankı') + (fx.echo ? `<div style="display:flex;gap:6px">${colorIn('fx.echo.color', l, '#E2197C')}</div>${range('fx.echo.gap', 'Aralık', 1, 60, 1, l, 8)}${range('fx.echo.count', 'Adet', 1, 6, 1, l, 3)}` : '');
        h += sw('glitch', 'Glitch') + (fx.glitch ? range('fx.glitch.offset', 'Kayma', 1, 40, 1, l, 5) : '');
      }
      h += sw('overlay', 'Renk kaplama') + (fx.overlay ? `<div style="display:flex;gap:6px">${colorIn('fx.overlay.color', l, '#E2197C')}</div>${range('fx.overlay.opacity', 'Yoğunluk', 0, 1, 0.01, l, 1)}` : '');
      h += `</details></div>`;
      { const LS = lStyles();
        h += `<div class="grp"><h4>Stillerim<span class="muted" style="font-weight:400">gölge, kenar, efekt birlikte</span></h4>${LS.length ? `<div class="ls-list">${LS.map((x) => `<button class="ls-it" data-ls="${x.id}" title="Uygula">${esc(x.name)}<i data-lsdel="${x.id}" title="Sil">×</i></button>`).join('')}</div>` : '<p class="muted" style="font-size:12px;margin:0 0 6px">Beğendiğin gölge/kenar/efekt ayarını kaydet, başka katmanlara tek dokunuşla uygula.</p>'}
          <button class="btn sm" data-ls-save="1" style="width:100%;margin-top:6px">${icon('plus')}Bu katmanın stilini kaydet</button></div>`; }
      return h;
    }
    const FX_DEFAULT = { glow: { color: '#FFFFFF', blur: 12 }, outline: { color: '#FFFFFF', width: 6 }, inner: { color: 'rgba(0,0,0,0.5)', blur: 6, x: 3, y: 3 }, long: { color: 'rgba(0,0,0,0.3)', length: 40, angle: 45 }, echo: { color: '#E2197C', gap: 8, count: 3, angle: 45 }, glitch: { offset: 5 }, overlay: { color: '#E2197C', opacity: 0.6 } };
    function bcPanel(l) {
      return `<div class="grp"><h4>Barkod (EAN-13)</h4><div class="ai-layer"><input class="inp" id="bcVal" inputmode="numeric" value="${esc(l.barcode.value)}" data-bc="${l.id}"><button class="btn sm primary" id="bcUpd">Güncelle</button></div><div class="ai-layer-hint" id="bcMsg">12 hane yazarsan kontrol hanesi otomatik eklenir.</div></div>`;
    }
    function alignRow() {
      return `<div class="iconrow" style="margin-top:8px">${[['l', 'aL', 'Sola hizala'], ['c', 'aC', 'Yatay ortala'], ['r', 'aR', 'Sağa hizala'], ['t', 'aT', 'Üste hizala'], ['m', 'aM', 'Dikey ortala'], ['b', 'aB', 'Alta hizala']].map(([k, i, t]) => `<button class="btn sm icon" data-align="${k}" title="${t}">${icon(i)}</button>`).join('')}</div>`;
    }
    function bindPanel() {
      const target = () => one() || (st.sel.length ? null : doc);
      const live = () => { const l = one(); if (l && l.type === 'text') R.layoutText(l); renderSoon(); };
      $$('[data-k]', pbody).forEach((inp) => {
        const k = inp.dataset.k;
        const read = () => {
          if (inp.dataset.unit === 'mm') return +inp.value / mmF();
          if (inp.type === 'range' || inp.type === 'number' || inp.dataset.num != null) return +inp.value;
          return inp.value;
        };
        const apply = (v) => {
          if (!st.sel.length) {
            if (k === 'width' || k === 'height') { doc[k] = clamp(Math.round(v) || 16, 16, 8000); return; }
            setK(doc, k, v); return;
          }
          if (k.startsWith('__alpha_')) {
            const fk = k.slice(8); const o = one(); const pc = R.parseColor(getK(o, fk)); setK(o, fk, R.rgba(pc.hex, v / 100)); return;
          }
          if (k === '__shA') { const o = one(); const pc = R.parseColor(o.shadow.color || '#000'); o.shadow.color = R.rgba(pc.hex, v / 100); return; }
          for (const l of selected()) {
            if (inp.dataset.color != null || inp.dataset.hex != null) {
              // rengi değiştirirken mevcut opaklığı koru
              const old = R.parseColor(getK(l, k));
              if (inp.dataset.hex != null && !/^#[0-9a-f]{6}$/i.test(v)) return;
              setK(l, k, old.a < 1 && old.a > 0 ? R.rgba(v, old.a) : v);
              if ((k === 'stroke' && !(+l.strokeWidth > 0))) l.strokeWidth = l.type === 'text' ? 2 : 4;
            } else setK(l, k, v);
          }
        };
        inp.addEventListener('input', () => {
          const v = read();
          apply(v);
          const out = inp.parentElement.querySelector('output'); if (out) out.textContent = r1(+v);
          if (inp.dataset.color != null) { const tx = inp.parentElement.querySelector('[data-hex]'); if (tx) tx.value = inp.value.toUpperCase(); }
          if (inp.tagName !== 'SELECT' && inp.type !== 'number' && inp.tagName !== 'TEXTAREA' && inp.dataset.hex == null) live();
          else if (inp.tagName === 'TEXTAREA') live();
        });
        inp.addEventListener('change', () => { apply(read()); if (!st.sel.length && (k === 'width' || k === 'height')) { commit(); fit(); return; } commit(inp.tagName === 'SELECT' || inp.type === 'number'); });
      });
      const setColor = (k, c) => { const t = target(); if (t === doc) setK(doc, k, c); else selected().forEach((l) => setK(l, k, c)); pushRecent(c); commit(); };
      $$('[data-eye]', pbody).forEach((b) => (b.onclick = async () => {
        const k = b.dataset.eye;
        if (window.EyeDropper) { try { const r = await new window.EyeDropper().open(); setColor(k, r.sRGBHex); } catch (e) {} return; }
        // tarayıcıda damlalık yoksa: tuvalde bir noktaya dokunarak renk al
        st.pickColor = k; vp.classList.add('picking'); UI.toast('Rengini almak istediğin noktaya dokun');
      }));
      $$('[data-act2=recolor]', pbody).forEach((b) => (b.onclick = recolorDialog));
      $$('[data-act2=styles]', pbody).forEach((b) => (b.onclick = styleDialog));
      $$('[data-pf]', pbody).forEach((b) => (b.onclick = () => pathfinder(b.dataset.pf)));
      $$('[data-act2=sync]', pbody).forEach((b) => (b.onclick = syncLinked));
      $$('[data-rs]', pbody).forEach((b) => (b.onclick = () => { review().status = b.dataset.rs; commit(); }));
      $$('[data-rv]', pbody).forEach((b) => (b.onclick = async () => {
        if (b.dataset.rv === 'add') return startComment();
        if (b.dataset.rv === 'link') return sendForReview();
        const c = (doc.meta && doc.meta.client) || ''; if (!c) { UI.toast('Önce müşteri adını yaz', true); $('#rvClient', pbody).focus(); return; }
        if (cb.onSaveQuiet) await cb.onSaveQuiet();
        const link = await window.P5.portalLink(c); try { await navigator.clipboard.writeText(link); } catch (e) {}
        UI.dialog(`<div class="d-body"><h3>${icon('share')} ${esc(c)} için portal</h3><p class="muted">Müşterin bu bağlantıdan kendisine ait tasarımları görür, indirir ve yeni talep bırakır. Aynı Wi‑Fi gerekir.</p><input class="inp" readonly value="${esc(link)}" onclick="this.select()"></div><div class="d-foot"><a class="btn" href="https://wa.me/?text=${encodeURIComponent('Tasarım portalın: ' + link)}" target="_blank" rel="noopener">WhatsApp ile gönder</a><button class="btn primary" data-close>Tamam</button></div>`);
      }));
      const rvc = $('#rvClient', pbody); if (rvc) rvc.onchange = () => { doc.meta = doc.meta || {}; doc.meta.client = rvc.value.trim(); commit(); };
      const ulk = $('[data-act2=unlockClient]', pbody); if (ulk) ulk.onclick = async () => { if (!(await UI.confirmBox('Şablon kilidi açılsın mı?', 'Tüm katmanlar serbestçe taşınabilir ve silinebilir olur.'))) return; doc.layers.forEach((l) => { l.lockPos = false; l.locked = false; }); doc.meta.clientLocked = false; commit(); UI.toast('Kilit açıldı'); };
      $$('[data-cdone]', pbody).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const c = review().comments[+b.dataset.cdone]; c.done = !c.done; commit(); }));
      $$('[data-ci]', pbody).forEach((r) => (r.onclick = () => { st.flashC = +r.dataset.ci; drawOverlay(); setTimeout(() => { st.flashC = null; drawOverlay(); }, 1400); }));
      $$('[data-anim]', pbody).forEach((b) => (b.onclick = () => { const v = b.dataset.anim; selected().forEach((x) => { if (v === 'none') delete x.anim; else x.anim = Object.assign({ delay: 0, dur: 0.7 }, x.anim || {}, { type: v }); }); commit(); }));
      $$('[data-sx]', pbody).forEach((b) => (b.onclick = () => { const v = b.dataset.sx; if (v === 'comp') saveComponent(); if (v === 'export') exportSelection(); if (v === 'compUpd') updateComponentEverywhere(); }));
      const gOn = $('#gridOn', pbody); if (gOn) gOn.onchange = () => { doc.meta = doc.meta || {}; doc.meta.grid = Object.assign({ cols: 12, gutter: Math.round(doc.width * 0.02), margin: Math.round(doc.width * 0.05) }, doc.meta.grid || {}, { show: gOn.checked }); commit(); };
      $$('[data-dash]', pbody).forEach((b) => (b.onclick = () => { const v = b.dataset.dash; selected().forEach((x) => { if (!v) delete x.dash; else x.dash = v === 'true' ? true : v; if (v && !(+x.strokeWidth > 0)) { x.strokeWidth = 4; if (!x.stroke || x.stroke === 'none') x.stroke = '#111111'; } }); commit(); }));
      $$('[data-pdf]', pbody).forEach((b) => (b.onclick = () => { const v = b.dataset.pdf; if (v === 'sign') signatureDialog(); else if (v === 'more') pdfToolsMenu(); else pdfAdd(v); }));
      $$('[data-act2=translate]', pbody).forEach((b) => (b.onclick = translateDialog));
      $$('[data-sw]', pbody).forEach((b) => (b.onclick = () => setColor(b.dataset.sw, b.dataset.c)));
      $$('[data-color]', pbody).forEach((inp) => inp.addEventListener('change', () => pushRecent(inp.value)));
      $$('[data-fillmode]', pbody).forEach((seg) => $$('button', seg).forEach((b) => (b.onclick = () => {
        const key = seg.dataset.fillmode, t = target(); if (!t) return;
        const cur = getK(t, key);
        const base = cur && typeof cur === 'object' ? (cur.colors || ['#000'])[0] : cur && cur !== 'none' ? cur : '#E2197C';
        let v;
        if (b.dataset.m === 'solid') v = R.toHex(base);
        if (b.dataset.m === 'grad') v = { type: 'linear', angle: 135, colors: [R.toHex(base), '#19A9E1'] };
        if (b.dataset.m === 'none') v = 'none';
        if (key === 'background') doc.background = b.dataset.m === 'solid' ? { type: 'solid', color: v } : v;
        else setK(t, key, v);
        commit();
      })));
      $$('[data-act]', pbody).forEach((b) => (b.onclick = () => {
        const l = one(), a = b.dataset.act;
        if (a === 'dup') duplicate(); if (a === 'del') remove();
        if (a === 'group') groupSel(); if (a === 'ungroup') ungroupSel();
        if (a === 'front' || a === 'back') arrange(a);
        if (!l) return;
        if (a === 'lock') { l.locked = !l.locked; commit(); }
        if (a === 'flipX' || a === 'flipY') { l[a] = !l[a]; commit(); }
        if (a === 'replace') replaceImage(l);
        if (a === 'resetF') { l.filters = {}; commit(); }
        if (a === 'resetCrop') { l.zoom = 1; l.ox = 0; l.oy = 0; commit(); }
        if (a === 'fillBg') fillCanvas(l);
        if (a === 'cropFull') { delete l.crop; commit(); }
        if (a === 'aiEdit') aiEditImage(l);
        if (a === 'detectText') detectTexts(l);
        if (a === 'undoRetext') removeRetexts();
        if (a === 'aiFill') aiFillPatch(l);
        if (a === 'liftTool') { setTool('lift'); if (mobile()) togglePanel(false); UI.toast('Taşımak istediğin bölgeyi işaretle'); }
        if (a === 'retextTool') { setTool('retext'); if (mobile()) togglePanel(false); UI.toast('Değiştirmek istediğin yazının üzerine kutu çiz'); }
        if (a === 'fontUp') window.Features.uploadFont(() => renderPanel());
        if (a === 'fontPick') pickFont();
        if (a === 'removeBg') removeBg(l);
        if (a === 'autoEnhance') autoEnhance(l);
        if (a === 'persp') perspDialog(l);
        if (a === 'trace') traceImage(l);
        if (a === 'healTool') { st.opts.healMode = 'spot'; setTool('heal'); if (mobile()) togglePanel(false); UI.toast('Lekenin üzerini boya, bırakınca düzelir'); }
        if (a === 'cloneTool') { st.opts.healMode = 'clone'; st.cloneSrc = null; setTool('heal'); if (mobile()) togglePanel(false); UI.toast('Alt + tık (ya da üstteki “Kaynak seç”) ile kopyalanacak yeri seç, sonra boya'); }
        if (a === 'origSrc2') { l.src = l.origSrc; delete l.origSrc; delete l.nw; delete l.nh; l.fit = 'cover'; R.ensureImageSizes(doc).then(() => commit()); }
        if (a === 'maskEdit') maskEditor(l);
        if (a === 'behind') textBehind(l);
        if (a === 'nodes') nodeEditor(l);
        if (a === 'expand') expandImage(l);
        if (a === 'genFill') genFill(l);
        if (a === 'fontMatch') fontMatch(l);
        if (a === 'animPlay') animDialog();
        if (a === 'aiWrite') aiWriteDialog(l);
        if (a === 'duoOff') { l.filters = { ...(l.filters || {}) }; delete l.filters.duotone; commit(); }
        if (a === 'toBarcode') insertBarcode(l);
        if (a === 'textStyles') window.P6.textStyles();
        if (a === 'textPhoto') window.App.pickFiles(async (files) => { const f = files[0]; if (!f) return; try { const r = await window.App.uploadFile(f); l.fill = { type: 'image', src: r.url }; if (+l.fontWeight < 800) l.fontWeight = 900; R.layoutText(l); commit(); UI.toast('Fotoğraf yazının içine yerleşti — kalın yazı tiplerinde en iyi görünür'); } catch (e) { UI.toast(e.message, true); } }, false);
        if (a === 'textPhotoOff') { l.fill = '#111111'; commit(); }
        if (a === 'decompose') decomposeImage(l);

        if (a === 'origSrc') { l.src = l.origSrc; delete l.origSrc; commit(); }
      }));
      $$('[data-act-cb]', pbody).forEach((c) => (c.onchange = () => { const l = one(); l.shadow = c.checked ? { x: 0, y: Math.round(Math.max(4, l.h * 0.03)), blur: 24, color: 'rgba(0,0,0,0.35)' } : null; commit(); }));
      $$('[data-toggle-cb]', pbody).forEach((c) => (c.onchange = () => { selected().forEach((l) => (l[c.dataset.toggleCb] = c.checked)); commit(); }));
      { const l0 = one();
        const ta2 = $('#txtArea', pbody); if (ta2) ta2.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const a2 = ta2.selectionStart; ta2.setRangeText('\t', a2, ta2.selectionEnd, 'end'); ta2.dispatchEvent(new Event('input', { bubbles: true })); } });
        $$('[data-leader]', pbody).forEach((b) => (b.onclick = () => { const ls = selected().filter((x) => x.type === 'text'); ls.forEach((x) => { if (!/\t/.test(x.text)) x.text = toLeaderText(x.text); x.leader = b.dataset.leader; R.layoutText(x); }); commit(); }));
        const tl = $('[data-act=toLeader]', pbody); if (tl) tl.onclick = () => { selected().filter((x) => x.type === 'text').forEach((x) => { x.text = toLeaderText(x.text.replace(/\t+/g, ' ')); x.leader = x.leader || 'dots'; R.layoutText(x); }); commit(); UI.toast('Fiyatlar sağa yaslandı — ad ile fiyat arasında Tab var'); };
        $$('[data-unit-set]', pbody).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); doc.meta = doc.meta || {}; doc.meta.unit = b.dataset.unitSet; commit(); }));
        const tsS = $('#tsSel', pbody); if (tsS) tsS.onchange = () => { const stl = tStyles().find((x) => x.id === tsS.value); if (!stl) return; selected().filter((x) => x.type === 'text').forEach((x) => applyTStyle(x, stl)); commit(); };
        $$('[data-ls]', pbody).forEach((b) => (b.onclick = async (e) => {
          if (e.target.closest('[data-lsdel]')) { if (!(await UI.confirmBox('Bu stil silinsin mi?'))) return; await saveLStyles(lStyles().filter((x) => x.id !== b.dataset.ls)); renderPanel(); return; }
          const stl = lStyles().find((x) => x.id === b.dataset.ls); if (!stl) return;
          selected().forEach((x) => { LS_KEYS.forEach((k) => { if (stl.v[k] === undefined) delete x[k]; else x[k] = JSON.parse(JSON.stringify(stl.v[k])); }); }); commit(); UI.toast(`“${stl.name}” uygulandı`);
        }));
        const lsv = $('[data-ls-save]', pbody); if (lsv) lsv.onclick = async () => { const l1 = one(); if (!l1) return; const n = await UI.promptBox('Stil adı', l1._fxName && l1._fxName !== 'none' ? 'Benim ' + l1._fxName : 'Stilim ' + (lStyles().length + 1), 'Kaydet', 'örn. Gölgeli kart, Neon başlık'); if (!n) return; const v = {}; LS_KEYS.forEach((k) => { if (l1[k] !== undefined) v[k] = JSON.parse(JSON.stringify(l1[k])); }); await saveLStyles([...lStyles(), { id: 'ls' + R.uid(), name: n, v }]); renderPanel(); UI.toast(`“${n}” stillerine eklendi`); };
        $$('[data-ts]', pbody).forEach((b) => (b.onclick = async () => {
          const k = b.dataset.ts, list = tStyles().slice();
          if (k === 'save') { const n = await UI.promptBox('Stil adı', l0.fontSize > Math.min(doc.width, doc.height) * 0.06 ? 'Başlık' : 'Açıklama', 'Kaydet', 'örn. Başlık, Fiyat, Açıklama'); if (!n) return; const stl = { id: 'ts' + R.uid(), name: n, ...pickTStyle(l0) }; list.push(stl); await saveTStyles(list); l0.tstyle = stl.id; commit(); UI.toast(`“${n}” stili kaydedildi — diğer yazılara sağ panelden uygula`); }
          if (k === 'update') { const i = list.findIndex((x) => x.id === l0.tstyle); if (i < 0) return; list[i] = { ...list[i], ...pickTStyle(l0) }; await saveTStyles(list); let n = 0; doc.layers.forEach((x) => { if (x.type === 'text' && x.tstyle === l0.tstyle && x !== l0) { applyTStyle(x, list[i]); n++; } }); commit(); UI.toast(`Stil güncellendi · ${n} yazı daha değişti`); }
          if (k === 'unlink') { delete l0.tstyle; commit(); }
        })); }
      $$('[data-rich]', pbody).forEach((b) => (b.onmousedown = (e) => e.preventDefault()));
      $$('[data-rich]', pbody).forEach((b) => (b.onclick = () => {
        const l = one(); const ta = $('#txtArea', pbody); if (!l || !ta) return;
        const m = b.dataset.rich;
        if (m === 'x') { l.text = R.plain(l.text); R.layoutText(l); commit(); return; }
        let a = ta.selectionStart, z = ta.selectionEnd;
        if (a === z) { UI.toast('Önce kutudaki yazıdan vurgulamak istediğin kelimeleri seç'); ta.focus(); return; }
        const v = ta.value, part = v.slice(a, z);
        if (/[*{}|]/.test(part)) { UI.toast('Seçim başka bir vurgunun içinde; önce “Temizle” de'); return; }
        const wrapd = m === 'b' ? `**${part}**` : `{${$('#richCol', pbody).value.toUpperCase()}|${part}}`;
        l.text = v.slice(0, a) + wrapd + v.slice(z);
        R.layoutText(l); commit();
      }));
      $$('[data-fx]', pbody).forEach((b) => (b.onclick = () => { selected().forEach((l) => { applyFx(l, b.dataset.fx); if (l.type === 'text') R.layoutText(l); }); commit(); }));
      $$('[data-fxon]', pbody).forEach((c) => (c.onchange = () => { const k = c.dataset.fxon; selected().forEach((l) => { l.fx = l.fx || {}; if (c.checked) l.fx[k] = JSON.parse(JSON.stringify(Object.assign({}, FX_DEFAULT[k], k === 'glow' || k === 'echo' ? { color: baseColor(l) } : {}))); else delete l.fx[k]; if (!Object.keys(l.fx).length) delete l.fx; l._fxName = 'custom'; }); commit(); }));
      $$('[data-toggle]', pbody).forEach((b) => (b.onclick = () => { selected().forEach((l) => (l[b.dataset.toggle] = !l[b.dataset.toggle])); commit(); }));
      $$('[data-set]', pbody).forEach((b) => (b.onclick = () => { const [k, v] = b.dataset.set.split(':'); selected().forEach((l) => (l[k] = v)); commit(); }));
      $$('[data-align]', pbody).forEach((b) => (b.onclick = () => align(b.dataset.align)));
      $$('[data-preset]', pbody).forEach((b) => (b.onclick = () => { const l = one(); l.filters = { ...PRESETS[b.dataset.preset] }; commit(); }));
      $$('[data-duo]', pbody).forEach((b) => (b.onclick = () => { const l = one(); l.filters = { ...(l.filters || {}), duotone: [...DUOS[+b.dataset.duo]] }; commit(); }));
      $$('[data-fade]', pbody).forEach((b) => (b.onclick = () => { const l = one(); const k = b.dataset.fade; if (k === 'none') delete l.fade; else l.fade = Object.assign({ t: 0.08, b: 0.12, l: 0.04, r: 0.04, soft: 0.06, seed: 5 }, l.fade || {}, { cloud: k === 'cloud' }); commit(); renderPanel(); }));
      $$('[data-v="imgswap"]', pbody).forEach((b) => (b.onclick = () => replaceImage(one())));
      $$('[data-v="imgfocus"]', pbody).forEach((b) => (b.onclick = async () => { const l = one(); if (l.fit === 'contain') l.fit = 'cover'; await window.P8.smartCrop(l); commit(); }));
      $$('[data-v="imgpola"]', pbody).forEach((b) => (b.onclick = () => window.P9.polaroid(one())));
      const icRe = $('#icRe', pbody); if (icRe) icRe.oninput = () => { window.P9.recolorIcon(one(), icRe.value); renderSoon(); }, icRe.onchange = () => commit();
      $$('[data-v="imgfix"]', pbody).forEach((b) => (b.onclick = async () => { const l = one(); try { await window.P8.enhance(l); commit(); UI.toast('Fotoğraf iyileştirildi: ışık, kontrast, renk ve netlik ayarlandı (Geçmiş’ten geri alabilirsin)'); } catch (e) { UI.toast(e.message, true); } }));
      $$('[data-mask]', pbody).forEach((b) => (b.onclick = () => { const l = one(); l.mask = b.dataset.mask; if (l.mask === 'circle' && Math.abs(l.w - l.h) > 2 && l.w > l.h) { const c = l.x + l.w / 2; l.w = l.h; l.x = r1(c - l.w / 2); } commit(); }));
      const bcu = $('#bcUpd', pbody);
      if (bcu) {
        const go = () => {
          const inp = $('#bcVal', pbody), e = window.Tools.ean13(inp.value), l = byId(inp.dataset.bc);
          if (!e.ok) { $('#bcMsg', pbody).textContent = e.error; $('#bcMsg', pbody).style.color = 'var(--danger, #f66)'; return; }
          if (l) rebuildBarcode(l, e.value);
        };
        bcu.onclick = go; $('#bcVal', pbody).onkeydown = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } };
      }
      const lc = $('#lcmd', pbody);
      if (lc) {
        const run = async () => {
          const cmd = lc.value.trim(); if (!cmd) return;
          const go = $('#lcmdGo', pbody); go.disabled = true;
          try {
            const targets = selected();
            let msg = '';
            for (const t of targets) {
              const r = await window.App.api('layer-command', { body: { layer: R.clean(t), command: cmd, canvas: { w: doc.width, h: doc.height } } });
              msg = r.reply;
              if (r.layer) { const i = doc.layers.indexOf(t); doc.layers[i] = Object.assign({}, r.layer, { id: t.id }); }
            }
            R.normalize(doc); commit();
            UI.toast(msg);
          } catch (e) { UI.toast(e.message, true); } finally { if (go.isConnected) go.disabled = false; }
        };
        $('#lcmdGo', pbody).onclick = run;
        lc.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } };
      }
      const sp = $('#sizePreset', pbody);
      if (sp) sp.onchange = () => { if (!sp.value) return; const [w, h] = sp.value.split('x').map(Number); resizeCanvas(w, h); };
    }
    function resizeCanvas(w, h) {
      const sx = w / doc.width, sy = h / doc.height, s = Math.min(sx, sy);
      const ox = (w - doc.width * s) / 2, oy = (h - doc.height * s) / 2;
      for (const l of doc.layers) {
        l.x = r1(l.x * s + ox); l.y = r1(l.y * s + oy); l.w = r1(l.w * s); l.h = r1(l.h * s);
        if (l.type === 'text') { l.fontSize = r1(l.fontSize * s); l.letterSpacing = r1((l.letterSpacing || 0) * s); }
        if (l.strokeWidth) l.strokeWidth = r1(l.strokeWidth * s);
        if (l.radius) l.radius = r1(l.radius * s);
      }
      doc.width = w; doc.height = h;
      commit(); fit();
      UI.toast(`Tuval ${w} × ${h} oldu, içerik orantılı yerleştirildi`);
    }

    // ---------- katmanlar paneli
    const typeIcon = { rect: 'square', ellipse: 'circle', text: 'type', image: 'image', path: 'vector', adjust: 'sliders' };
    // ---- Fotoğraftaki yazıları düzenlenebilir hale getirme
    async function snapshot() {
      const sc = Math.min(2, 2600 / Math.max(doc.width, doc.height));
      const c = await R.exportCanvas(doc, sc, '#ffffff');
      return { sc, c, px: c.getContext('2d').getImageData(0, 0, c.width, c.height).data };
    }
    function sampleBox(snap, b) {
      const { sc, c, px } = snap;
      const pad = Math.max(3, Math.min(b.w, b.h) * 0.18);
      const X0 = Math.max(0, Math.floor((b.x - pad) * sc)), Y0 = Math.max(0, Math.floor((b.y - pad) * sc));
      const X1 = Math.min(c.width - 1, Math.ceil((b.x + b.w + pad) * sc)), Y1 = Math.min(c.height - 1, Math.ceil((b.y + b.h + pad) * sc));
      const ix0 = b.x * sc, iy0 = b.y * sc, ix1 = (b.x + b.w) * sc, iy1 = (b.y + b.h) * sc;
      const ring = [[], [], []], inside = [];
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
        const i = (y * c.width + x) * 4;
        const v = [px[i], px[i + 1], px[i + 2]];
        if (x < ix0 || x > ix1 || y < iy0 || y > iy1) { ring[0].push(v[0]); ring[1].push(v[1]); ring[2].push(v[2]); }
        else inside.push(v);
      }
      const med = (a) => { if (!a.length) return 255; a.sort((p, q) => p - q); return a[a.length >> 1]; };
      const bg = ring.map(med);
      const far = inside.filter((v) => Math.hypot(v[0] - bg[0], v[1] - bg[1], v[2] - bg[2]) > 70);
      let fg = null;
      if (far.length > inside.length * 0.02) fg = [0, 1, 2].map((k) => Math.round(far.reduce((s, v) => s + v[k], 0) / far.length));
      const hex = (v) => '#' + v.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      const bgHex = hex(bg);
      const fgHex = fg ? hex(fg) : (window.Tools.contrast('#FFFFFF', bgHex) > window.Tools.contrast('#111111', bgHex) ? '#FFFFFF' : '#111111');
      return { bg: bgHex, fg: fgHex, density: inside.length ? far.length / inside.length : 0 };
    }
    function makeRetext(b, col, opts = {}) {
      const g = opts.group || 'g' + R.uid();
      const pp = Math.max(3, Math.min(b.h * 0.18, 24));
      const patch = { id: R.uid(), type: 'rect', name: 'Yazı yaması', role: 'patch', group: g, x: r1(b.x - pp), y: r1(b.y - pp), w: r1(b.w + 2 * pp), h: r1(b.h + 2 * pp), fill: col.bg, radius: 2, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' };
      const lines = Math.max(1, String(opts.text || '').split('\n').length);
      const fs = Math.max(8, r1((b.h / lines) * 0.78));
      const t = { id: R.uid(), type: 'text', name: 'Yazı: ' + String(opts.text || 'yeni').slice(0, 18), group: g, text: opts.text || 'Yeni yazı', x: r1(b.x), y: r1(b.y), w: r1(b.w + fs * 0.6), fontSize: fs, fontFamily: opts.font || 'Segoe UI', fontWeight: opts.bold === false ? 500 : (col.density > 0.22 || opts.bold ? 800 : 600), lineHeight: 1.15, letterSpacing: 0, align: opts.align || 'left', fill: opts.color || col.fg, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal', h: b.h };
      R.layoutText(t);
      if (!String(t.text).includes('\n')) { const mw = R.measure(t.text, t) + t.fontSize * 0.25; if (mw > t.w) { t.w = r1(mw); R.layoutText(t); } }
      t.y = r1(b.y + (b.h - t.h) / 2);
      if (t.align === 'center') t.x = r1(b.x + b.w / 2 - t.w / 2); else if (t.align === 'right') t.x = r1(b.x + b.w - t.w);
      return [patch, t];
    }
    async function retextAt(p) {
      const snap = await snapshot();
      const found = window.Tools.findTextLine(snap.px, snap.c.width, snap.c.height, p.x * snap.sc, p.y * snap.sc);
      if (!found) { setTool('retext'); UI.toast('Yazıyı otomatik ayıramadım — yazının etrafına bir kutu çiz.', true); drawOverlay(); return; }
      const b = { x: found.x / snap.sc, y: found.y / snap.sc, w: found.w / snap.sc, h: found.h / snap.sc };
      await retextBox(b, snap);
    }
    async function ocrBox(snap, b) {
      if (((window.App.S.settings || {}).provider || 'local') === 'local') return null;
      try {
        const pad = b.h * 0.3, sc = snap.sc;
        const c = document.createElement('canvas');
        const sx = Math.max(0, (b.x - pad) * sc), sy = Math.max(0, (b.y - pad) * sc), sw = (b.w + 2 * pad) * sc, sh = (b.h + 2 * pad) * sc;
        const up = Math.max(1, 400 / sh);
        c.width = Math.round(sw * up); c.height = Math.round(sh * up);
        c.getContext('2d').drawImage(snap.c, sx, sy, sw, sh, 0, 0, c.width, c.height);
        const r = await window.App.api('detect-text', { body: { data: c.toDataURL('image/jpeg', 0.92) } });
        return (r.items || []).map((i) => i.text).join(' ').trim() || null;
      } catch (e) { return null; }
    }
    // Eski yazıyı çevresinden doldurarak silen yama (düz kutu yerine)
    async function makePatch(snap, b, group) {
      const sc = snap.sc, m = Math.max(6, b.h * 0.35);
      const reg = { x: (b.x - m) * sc, y: (b.y - m) * sc, w: (b.w + 2 * m) * sc, h: (b.h + 2 * m) * sc };
      const box = { x: b.x * sc, y: b.y * sc, w: b.w * sc, h: b.h * sc };
      const res = window.Tools.inpaintRegion(snap.c, reg, box, { feather: Math.round(Math.min(10, m * sc * 0.6)) });
      const up = await window.App.api('upload', { body: { data: res.canvas.toDataURL('image/png'), name: 'yama.png' } });
      return { id: R.uid(), type: 'image', role: 'patch', name: 'Yazı yaması', group, src: up.url, nw: res.w, nh: res.h, fit: 'fill', filters: {},
        x: r1(res.x / sc), y: r1(res.y / sc), w: r1(res.w / sc), h: r1(res.h / sc), rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal', bg: res.bg };
    }
    function cropDataURL(snap, b, pad) {
      const sc = snap.sc, c = document.createElement('canvas');
      const sx = Math.max(0, (b.x - pad) * sc), sy = Math.max(0, (b.y - pad) * sc);
      const sw = Math.min(snap.c.width - sx, (b.w + 2 * pad) * sc), sh = Math.min(snap.c.height - sy, (b.h + 2 * pad) * sc);
      c.width = Math.max(1, Math.round(sw)); c.height = Math.max(1, Math.round(sh));
      c.getContext('2d').drawImage(snap.c, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    }
    async function retextBox(b, snapIn) {
      if (b.h > doc.height * 0.2 || b.w * b.h > doc.width * doc.height * 0.15) { UI.toast('Seçilen alan bir yazı satırı için çok büyük. Yazının etrafına daha dar bir kutu çiz.', true); drawOverlay(); return; }
      const snap = snapIn || await snapshot();
      setTool('select');
      const imgAI = window.Features.imageReady();
      const textAI = ((window.App.S.settings || {}).provider || 'local') !== 'local';
      const guessP = textAI ? ocrBox(snap, b) : Promise.resolve(null);
      const choice = await UI.dialog(`<div class="d-body"><h3>Bu yazıyı değiştir</h3>
        <div class="rt-prev"><img src="${cropDataURL(snap, b, Math.max(4, b.h * 0.25))}" alt=""></div>
        <label class="field" style="margin-top:12px"><span>Yeni yazı</span><input class="inp" id="rtNew" placeholder="${textAI ? 'Okunuyor…' : 'Yeni yazıyı gir'}"></label>
        <label class="field" style="margin-top:10px"><span>Eski yazı ${imgAI ? '(yapay zekanın neyi değiştireceğini bilmesi için)' : '(isteğe bağlı)'}</span><input class="inp" id="rtOld" placeholder="${textAI ? 'Okunuyor…' : 'isteğe bağlı'}"></label>
        <p class="muted" style="font-size:12px;margin:10px 0 0;line-height:1.5">${imgAI ? '<b>Aynı stille değiştir:</b> yapay zeka yalnızca bu bölgeyi yeniden çizer; yazı tipi, renk ve zemin korunur.<br><b>Düzenlenebilir yazı:</b> eski yazı çevresinden doldurularak silinir, yerine istediğin gibi biçimlendirebileceğin bir yazı gelir.' : 'Eski yazı çevresinden doldurularak silinir, yerine düzenlenebilir bir yazı gelir. Yazının orijinal stilini korumak için Ayarlar’dan görsel üretimini bağlayabilirsin.'}</p></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn ${imgAI ? '' : 'primary'}" id="rtEdit">${icon('type')}Düzenlenebilir yazı</button>${imgAI ? `<button class="btn primary" id="rtAI">${icon('sparkle')}Aynı stille değiştir</button>` : ''}</div>`, {
        onOpen: (box, close) => {
          const nw = $('#rtNew', box), od = $('#rtOld', box);
          guessP.then((gs) => { if (gs) { if (!od.value) od.value = gs; if (!nw.value) { nw.value = gs; nw.select(); } } nw.placeholder = 'Yeni yazıyı gir'; od.placeholder = 'isteğe bağlı'; });
          $('#rtEdit', box).onclick = () => close({ mode: 'edit', nw: nw.value.trim(), od: od.value.trim() });
          const ai = $('#rtAI', box);
          if (ai) ai.onclick = () => { if (!nw.value.trim()) { nw.focus(); return; } close({ mode: 'ai', nw: nw.value.trim(), od: od.value.trim() }); };
          nw.onkeydown = (ev) => { if (ev.key === 'Enter') (ai || $('#rtEdit', box)).click(); };
          nw.focus();
        },
      });
      if (!choice) { drawOverlay(); return; }
      const g = 'g' + R.uid();
      if (choice.mode === 'ai') return aiReplaceText(snap, b, choice.od, choice.nw, g);
      const col = sampleBox(snap, b);
      const patch = await makePatch(snap, b, g);
      const bgHex = patch.bg ? '#' + patch.bg.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') : col.bg;
      delete patch.bg;
      const [, t] = makeRetext(b, { bg: bgHex, fg: col.fg, density: col.density }, { text: choice.nw || choice.od || 'Yeni yazı', group: g });
      t.role = 'retext';
      doc.layers.push(patch, t);
      st.sel = [t.id];
      commit();
      editText(t);
      UI.toast('Yazı düzenlenebilir — değiştir ve dışarı tıkla. Geri almak için Ctrl+Z.');
    }
    async function aiReplaceText(snap, b, oldT, newT, g) {
      const prompt = `This is a small crop of a product label. Replace the text ${oldT ? `"${oldT}"` : 'in the center of the image'} with exactly "${newT}". Keep the identical typeface, weight, letter spacing, color, size, alignment, shadow and outline, and the exact same background texture and colors. Do not change, move or add anything else; every other pixel must stay the same. The new text must be spelled exactly: ${newT}`;
      return aiRegionEdit(snap, b, prompt, 'Yazı: ' + newT.slice(0, 18) + ' (YZ)', g, 'Yazı değiştirildi. Beğenmezsen Ctrl+Z ya da Sil.');
    }
    async function aiRegionEdit(snap, b, prompt, name, g, doneMsg, replaceLayer) {
      // yazının çevresinden uygun oranlı bir bağlam kes, yapay zekaya yalnızca bu parçayı düzenlet, kenarları yumuşatıp geri yapıştır
      const provider = (window.App.S.settings || {}).img_provider;
      const ratios = provider === 'gemini' ? [['1:1', 1], ['3:2', 1.5], ['16:9', 1.778], ['21:9', 2.333], ['2:3', 0.667]] : [['1:1', 1], ['3:2', 1.5], ['2:3', 0.667]];
      let cx = b.x - b.h * 0.8, cy = b.y - b.h * 0.8, cw = b.w + b.h * 1.6, ch = b.h * 2.6;
      const want = cw / ch;
      const pick = ratios.reduce((p2, c) => (Math.abs(Math.log(c[1] / want)) < Math.abs(Math.log(p2[1] / want)) ? c : p2));
      if (cw / ch > pick[1]) { const nh = cw / pick[1]; cy -= (nh - ch) / 2; ch = nh; } else { const nw2 = ch * pick[1]; cx -= (nw2 - cw) / 2; cw = nw2; }
      cw = Math.min(cw, doc.width); ch = Math.min(ch, doc.height);
      cx = Math.max(0, Math.min(doc.width - cw, cx)); cy = Math.max(0, Math.min(doc.height - ch, cy));
      const data = cropDataURL(snap, { x: cx, y: cy, w: cw, h: ch }, 0);
      const busy = document.createElement('div');
      busy.className = 'photo-hint';
      busy.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span><span><b>Yapay zeka bu bölgeyi yeniden çiziyor…</b> 15-60 sn</span>';
      vp.appendChild(busy);
      try {
        const r = await window.App.api('image-gen', { body: { prompt, aspect: pick[0], refs: [data], enhance: false } });
        const im = new Image();
        await new Promise((res2, rej) => { im.onload = res2; im.onerror = rej; im.src = r.url; });
        const c = document.createElement('canvas');
        c.width = Math.round(cw * snap.sc); c.height = Math.round(ch * snap.sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        window.Tools.featherCanvas(c, Math.max(4, Math.round(Math.min(c.width, c.height) * 0.08)));
        const up = await window.App.api('upload', { body: { data: c.toDataURL('image/png'), name: 'yazi-yz.png' } });
        const layer = { id: R.uid(), type: 'image', role: 'patch', name, group: g, src: up.url, nw: c.width, nh: c.height, fit: 'fill', filters: {},
          x: r1(cx), y: r1(cy), w: r1(cw), h: r1(ch), rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' };
        if (replaceLayer) { const i = doc.layers.indexOf(replaceLayer); if (i >= 0) doc.layers.splice(i, 1, layer); else doc.layers.push(layer); }
        else doc.layers.push(layer);
        st.sel = [layer.id];
        commit();
        UI.toast(doneMsg || 'Tamamlandı');
      } catch (err) { UI.toast('Değiştirilemedi: ' + err.message, true); }
      finally { busy.remove(); }
    }
    // ---- Seç ve ayır: seçili bölgeyi ayrı katmana al, arkasını çevresinden doldur
    async function liftSelection(b, poly) {
      setTool('select');
      b = { x: Math.max(0, b.x), y: Math.max(0, b.y), w: Math.min(b.w, doc.width - Math.max(0, b.x)), h: Math.min(b.h, doc.height - Math.max(0, b.y)) };
      const busy = document.createElement('div');
      busy.className = 'photo-hint';
      busy.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span><span><b>Seçim ayrılıyor, arkası dolduruluyor…</b></span>';
      vp.appendChild(busy);
      try {
        const snap = await snapshot();
        const sc = snap.sc;
        const m = Math.max(8, Math.min(b.w, b.h) * 0.12);
        const reg = { x: (b.x - m) * sc, y: (b.y - m) * sc, w: (b.w + 2 * m) * sc, h: (b.h + 2 * m) * sc };
        const box = { x: b.x * sc, y: b.y * sc, w: b.w * sc, h: b.h * sc };
        const polyPx = poly ? poly.map((q) => ({ x: q.x * sc, y: q.y * sc })) : null;
        const sm = window.Tools.selectionMask(snap.c, reg, box, { poly: polyPx, object: !polyPx && st.opts.liftObject !== false });
        // 1) ayrılan içerik: maske dışını şeffaf yap, kenarı hafif yumuşat
        const lc = document.createElement('canvas'); lc.width = sm.w; lc.height = sm.h;
        const lx = lc.getContext('2d'); lx.drawImage(snap.c, sm.x0, sm.y0, sm.w, sm.h, 0, 0, sm.w, sm.h);
        const ld = lx.getImageData(0, 0, sm.w, sm.h);
        for (let k = 0; k < sm.w * sm.h; k++) {
          if (!sm.mask[k]) { ld.data[k * 4 + 3] = 0; continue; }
          const x = k % sm.w, y = (k / sm.w) | 0;
          let edge = 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= sm.w || yy >= sm.h || !sm.mask[yy * sm.w + xx]) edge++; }
          if (edge) ld.data[k * 4 + 3] = Math.round(ld.data[k * 4 + 3] * (edge > 1 ? 0.45 : 0.75));
        }
        lx.putImageData(ld, 0, 0);
        // içeriğin sıkı sınırlarına kırp
        let mx0 = sm.w, my0 = sm.h, mx1 = 0, my1 = 0;
        for (let k = 0; k < sm.w * sm.h; k++) if (sm.mask[k]) { const x = k % sm.w, y = (k / sm.w) | 0; if (x < mx0) mx0 = x; if (x > mx1) mx1 = x; if (y < my0) my0 = y; if (y > my1) my1 = y; }
        if (mx1 < mx0) throw new Error('Seçimde içerik bulunamadı');
        const tw = mx1 - mx0 + 1, th = my1 - my0 + 1;
        const tc = document.createElement('canvas'); tc.width = tw; tc.height = th;
        tc.getContext('2d').drawImage(lc, mx0, my0, tw, th, 0, 0, tw, th);
        // 2) arka plan: seçilen içeriğin olduğu yeri çevresinden doldur
        const inp = window.Tools.inpaintRegion(snap.c, reg, box, { mask: sm.mask, feather: Math.round(Math.min(10, m * sc * 0.5)) });
        const [upL, upP] = await Promise.all([
          window.App.api('upload', { body: { data: tc.toDataURL('image/png'), name: 'secim.png' } }),
          window.App.api('upload', { body: { data: inp.canvas.toDataURL('image/png'), name: 'dolgu.png' } }),
        ]);
        const base = { rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal', fit: 'fill', filters: {} };
        const patch = Object.assign({ id: R.uid(), type: 'image', role: 'patch', name: 'Arka plan dolgusu', src: upP.url, nw: inp.w, nh: inp.h, x: r1(inp.x / sc), y: r1(inp.y / sc), w: r1(inp.w / sc), h: r1(inp.h / sc) }, base);
        const lifted = Object.assign({ id: R.uid(), type: 'image', role: 'lift', name: 'Ayrılan parça', src: upL.url, nw: tw, nh: th, x: r1((sm.x0 + mx0) / sc), y: r1((sm.y0 + my0) / sc), w: r1(tw / sc), h: r1(th / sc) }, base);
        doc.layers.push(patch, lifted);
        st.sel = [lifted.id];
        commit();
        UI.toast(sm.objectFound || st.opts.liftObject === false ? 'Ayrıldı — artık sürükleyebilirsin, arkası dolduruldu' : 'Nesne zeminden ayırt edilemedi; seçimin tamamı ayrıldı');
        // görsel yapay zekası bağlıysa kaba dolguyu otomatik olarak doğal hale getir
        if (window.Features.imageReady() && st.opts.liftAI !== false) setTimeout(() => { aiFillPatch(patch).then(() => { st.sel = [lifted.id]; renderPanel(); drawOverlay(); }); }, 300);
        M.animate(art.querySelector(`[data-id="${lifted.id}"]`), { scale: [1, 1.03, 1] }, { stiffness: 400, damping: 14 });
      } catch (err) { UI.toast(err.message, true); }
      finally { busy.remove(); }
    }
    async function aiFillPatch(l) {
      if (!window.Features.imageReady()) { const ok = await window.Features.connectImageAI(); if (!ok || !window.Features.imageReady()) return; }
      // dolgunun üstündeki katmanlar (ayrılan parça vb.) görüntüye girmesin
      const above = doc.layers.slice(doc.layers.indexOf(l) + 1).filter((x) => x.visible !== false);
      above.forEach((x) => (x.visible = false));
      let snap;
      try { snap = await snapshot(); } finally { above.forEach((x) => (x.visible = true)); }
      const prompt = 'In the middle of this image there is a blurry, smudged patch where an object or text was removed. Repaint ONLY that patch so it looks completely natural: seamlessly continue the surrounding background texture, pattern, lighting and colors. Do not add any new objects, text or details. Keep every pixel outside the patch identical.';
      await aiRegionEdit(snap, { x: l.x, y: l.y, w: l.w, h: l.h }, prompt, 'Arka plan dolgusu (YZ)', l.group, 'Dolgu yapay zekayla doğal hale getirildi', l);
    }
    function removeRetexts() {
      const n = doc.layers.filter((l) => l.role === 'patch' || l.role === 'retext' || l.role === 'lift').length;
      if (!n) { UI.toast('Kaldırılacak yazı değişikliği yok'); return; }
      doc.layers = doc.layers.filter((l) => l.role !== 'patch' && l.role !== 'retext' && l.role !== 'lift');
      st.sel = [];
      commit();
      UI.toast(`${n} yazı değişikliği kaldırıldı, fotoğraf eski haline döndü`);
    }
    async function detectTexts(img) {
      const btn = $('[data-act=detectText]', pbody);
      if (btn) { btn.disabled = true; btn.lastChild.textContent = 'Aranıyor…'; }
      try {
        const data = await R.downscale(img.origSrc || img.src, 1568, 0.9);
        const r = await window.App.api('detect-text', { body: { src: img.src, data } });
        if (!r.items || !r.items.length) { UI.toast('Fotoğrafta yazı bulunamadı'); return; }
        await R.ensureImageSizes(doc);
        // görsel kesirlerini tuval koordinatına çevir (render ile aynı hesap)
        const z = Math.max(1, +img.zoom || 1);
        let iw = img.w, ih = img.h, ix = 0, iy = 0;
        if (img.nw && img.nh && img.fit !== 'fill') {
          const sc = (img.fit === 'contain' ? Math.min(img.w / img.nw, img.h / img.nh) : Math.max(img.w / img.nw, img.h / img.nh)) * z;
          iw = img.nw * sc; ih = img.nh * sc;
          ix = ((img.w - iw) / 2) * (1 + (+img.ox || 0)); iy = ((img.h - ih) / 2) * (1 + (+img.oy || 0));
        }
        const ok = await UI.confirmBox(`${r.items.length} yazı bulundu`, 'Hepsi silinip yerine düzenlenebilir yazılar konacak. Fotoğraflı ya da dokulu zeminlerde sonuç kusurlu olabilir; en temiz sonuç için yazılara tek tek tıklayarak değiştirmeni öneririm. Yine de hepsini dönüştüreyim mi?', 'Hepsini dönüştür');
        if (!ok) return;
        const snap = await snapshot();
        const g = 'g' + R.uid();
        const added = [];
        const boxes = [];
        const iou = (p, q) => { const ix2 = Math.max(0, Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x)), iy2 = Math.max(0, Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y)); return (ix2 * iy2) / Math.min(p.w * p.h, q.w * q.h); };
        for (const it of r.items) {
          const b = { x: img.x + ix + it.x * iw, y: img.y + iy + it.y * ih, w: it.w * iw, h: it.h * ih };
          if (b.w < 4 || b.h < 4 || boxes.some((q) => iou(b, q) > 0.35)) continue;
          boxes.push(b);
          const col = sampleBox(snap, b);
          UI.toast(`Yazılar dönüştürülüyor… ${boxes.length}/${r.items.length}`);
          const patch = await makePatch(snap, b, g); delete patch.bg;
          const [, t] = makeRetext(b, col, { text: it.text, color: it.color, bold: it.bold, align: it.align, group: g });
          t.role = 'retext';
          added.push(patch, t);
        }
        const at = doc.layers.indexOf(img) + 1;
        doc.layers.splice(at, 0, ...added);
        st.sel = added.filter((l) => l.type === 'text').map((l) => l.id).slice(0, 1);
        commit();
        UI.toast(`${added.length / 2} yazı düzenlenebilir hale getirildi. Yazıya dokunup değiştirebilirsin.`);
      } catch (err) { UI.toast(err.message, true); }
      finally { const b2 = $('[data-act=detectText]', pbody); if (b2) { b2.disabled = false; b2.lastChild.textContent = 'Hepsini bul'; } }
    }

    async function aiEditImage(l) {
      const base = await window.Features.layerImageData(l);
      const r = await window.Features.imageGenDialog({ base, aspect: window.Features.aspectOf(l.w, l.h), prompt: 'Ürünü aynen koru; ' });
      if (!r || !r.url) return;
      l.origSrc = l.origSrc || l.src;
      l.src = r.url; delete l.crop; delete l.nw; delete l.nh;
      await R.ensureImageSizes(doc);
      commit();
      UI.toast('Görsel yenilendi — beğenmezsen “Orijinale dön”');
    }
    function fillCanvas(l) {
      if (!l) return;
      l.x = 0; l.y = 0; l.w = doc.width; l.h = doc.height; l.rotation = 0; l.fit = 'cover';
      doc.layers = [l, ...doc.layers.filter((x) => x !== l)];
      commit();
      UI.toast('Fotoğraf arka plana yerleştirildi');
    }
    function groupSel() {
      const ls = selected(); if (ls.length < 2) return;
      const g = 'g' + R.uid();
      ls.forEach((l) => (l.group = g));
      commit(); UI.toast('Gruplandı — artık birlikte seçilip taşınır');
    }
    function ungroupSel() { selected().forEach((l) => delete l.group); commit(); UI.toast('Grup çözüldü'); }

    // ---------- Fotoğrafı katmanlara ayır (PSD gibi) ----------
    const FONT_OF = { sans: 'Arial', serif: 'Georgia', display: 'Arial Black', condensed: 'Impact', script: 'Segoe Script', mono: 'Consolas' };
    function fitTextToBox(t, bw, bh, lines) {
      t.lineHeight = lines > 1 ? 1.18 : 1.1;
      t.fontSize = Math.max(6, (bh / lines) / t.lineHeight);
      t.w = bw * 1.04;
      const longest = () => Math.max(...String(t.text).split('\n').map((ln) => R.measure(t.uppercase ? ln.toLocaleUpperCase('tr-TR') : ln, t)));
      // genişliğe göre ayarla (yükseklik tahmini çoğu zaman kaba)
      for (let i = 0; i < 3; i++) { const lw = longest(); if (lw > 0) t.fontSize = Math.max(6, Math.min(t.fontSize * Math.min(1.25, (bw * 0.98) / lw), (bh / lines) / t.lineHeight * 1.25)); }
      R.layoutText(t);
      let guard = 0;
      while (t._lines.length > lines && guard++ < 30) { t.fontSize *= 0.96; R.layoutText(t); }
      t.fontSize = r1(t.fontSize);
      R.layoutText(t);
    }
    // kutunun çevresindeki zemin rengini ve içindeki "mürekkep" rengini ölç; mürekkep kutudan taşıyorsa kutuyu büyüt
    function inkAnalyze(cv, p, grow = true) {
      const W = cv.width, H = cv.height, d = cv.getContext('2d').getImageData(0, 0, W, H).data;
      const at = (x, y) => { const i = (Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const ringOf = (b, m) => { const out = []; const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H; const push = (x, y) => ok(x, y) && out.push(at(x, y)); const st2 = Math.max(1, Math.round((b.w + b.h) / 160)); for (let x = b.x - m; x <= b.x + b.w + m; x += st2) { push(x, b.y - m); push(x, b.y + b.h + m); } for (let y = b.y - m; y <= b.y + b.h + m; y += st2) { push(b.x - m, y); push(b.x + b.w + m, y); } if (!out.length) out.push(at(b.x, b.y)); return out; };
      const med = (arr, k) => { const a = arr.map((v) => v[k]).sort((x, y) => x - y); return a[a.length >> 1]; };
      const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      const hex = (v) => '#' + v.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      const inkOf = (b, bg) => {
        const ins = []; const s3 = Math.max(1, Math.round(Math.sqrt(b.w * b.h) / 120));
        for (let y = b.y; y < b.y + b.h; y += s3) for (let x = b.x; x < b.x + b.w; x += s3) { const v = at(x, y); ins.push([v, dist(v, bg)]); }
        const mx = Math.max(0, ...ins.map((q) => q[1]));
        const core = ins.filter((q) => q[1] > mx * 0.72 && q[1] > 50);
        return core.length ? [0, 1, 2].map((k) => Math.round(core.reduce((s2, q) => s2 + q[0][k], 0) / core.length)) : null;
      };
      let b = { ...p };
      const ring = ringOf(b, 3), bg = [0, 1, 2].map((k) => med(ring, k));
      const std = Math.sqrt(ring.reduce((s2, v) => s2 + dist(v, bg) ** 2, 0) / ring.length);
      let fg = inkOf(b, bg);
      if (grow && fg) {
        // kenar çizgisinde yazının kendi renginde piksel varsa o yöne büyüt (taşan harfler)
        const isInk = (v) => dist(v, fg) < 70 && dist(v, bg) > 60;
        const edgeInk = (side) => { let n = 0, t = 0; if (side === 'l' || side === 'r') { const x = side === 'l' ? b.x : b.x + b.w; for (let y = b.y; y <= b.y + b.h; y++) { t++; if (isInk(at(x, y))) n++; } } else { const y = side === 't' ? b.y : b.y + b.h; for (let x = b.x; x <= b.x + b.w; x++) { t++; if (isInk(at(x, y))) n++; } } return t ? n / t : 0; };
        const maxG = { x: p.w * 0.45 + 6, y: p.h * 0.35 + 4 };
        for (const side of ['l', 'r', 't', 'b']) {
          let g2 = 0; const step = 2;
          while (edgeInk(side) > 0.004 && g2 < (side === 'l' || side === 'r' ? maxG.x : maxG.y)) {
            if (side === 'l') { b.x -= step; b.w += step; } else if (side === 'r') b.w += step; else if (side === 't') { b.y -= step; b.h += step; } else b.h += step;
            g2 += step;
          }
        }
        b.x = Math.max(0, b.x); b.y = Math.max(0, b.y); b.w = Math.min(W - b.x, b.w); b.h = Math.min(H - b.y, b.h);
        fg = inkOf(b, bg) || fg;
      }
      return { box: b, bg: hex(bg), bgStd: std, fg: fg ? hex(fg) : null };
    }
    async function decomposeImage(img) {
      if (((window.App.S.settings || {}).provider || 'local') === 'local') {
        const ok = await UI.confirmBox('Yapay zeka gerekli', 'Görseli yazı, şekil ve nesnelere ayırmak için Claude bağlantısı gerekiyor (Ayarlar → API anahtarı). Bağlı değilken “Seç ve ayır” (K) aracıyla parçaları tek tek ayırabilirsin.', 'Ayarlar\'a git');
        if (ok) window.App.go('ayarlar');
        return;
      }
      const aiPlate = window.Features.imageReady();
      const ok = await UI.confirmBox('Katmanlara ayır', `Görseldeki yazılar düzenlenebilir yazıya, düz şekiller vektör şekle, fotoğraf/logo gibi nesneler ayrı katmana dönüşecek. Arkalarındaki zemin ${aiPlate ? 'görsel yapay zekasıyla temizlenecek' : 'çevresinden doldurulacak (görsel yapay zekası bağlarsan çok daha temiz olur)'}. Orijinal görsel gizli katman olarak saklanır. 1-3 dakika sürebilir.`, 'Ayır');
      if (!ok) return;
      const busy = document.createElement('div');
      busy.className = 'photo-hint decomp';
      const say = (t) => (busy.innerHTML = `<span class="ink-dots"><i></i><i></i><i></i></span><span><b>${t}</b></span>`);
      say('Görsel inceleniyor: yazılar, şekiller, nesneler…');
      vp.appendChild(busy);
      try {
        // 1) kaynak: görselin tuvalde görünen hali
        const snap = await snapshot();
        const sc = snap.sc;
        const B = { x: Math.max(0, img.x), y: Math.max(0, img.y), w: Math.min(img.w, doc.width - Math.max(0, img.x)), h: Math.min(img.h, doc.height - Math.max(0, img.y)) };
        const src = document.createElement('canvas');
        src.width = Math.round(B.w * sc); src.height = Math.round(B.h * sc);
        src.getContext('2d').drawImage(snap.c, B.x * sc, B.y * sc, B.w * sc, B.h * sc, 0, 0, src.width, src.height);
        const k = (B.w * sc) / src.width; // = 1
        const small = await R.downscale(src.toDataURL('image/png'), 1500, 0.92);
        const ruled = await R.withRuler(small);
        const job = await window.App.api('decompose', { body: { data: ruled, aspect: (B.w / B.h).toFixed(3) } });
        let res = null;
        for (let i = 0; i < 240 && !res; i++) {
          await new Promise((r2) => setTimeout(r2, 2500));
          const j = await window.App.api('job/' + job.job);
          if (j.status === 'done') res = j.result;
          else if (j.status === 'error') throw new Error(j.error);
          if (i === 8) say('Hâlâ inceleniyor… karmaşık görsellerde 1-2 dk sürebilir');
        }
        if (!res) throw new Error('Zaman aşımı');
        const els = res.elements || [];
        if (!els.length) throw new Error('Görselde ayrılacak öğe bulunamadı');
        say(`${els.length} öğe bulundu · zemin temizleniyor…`);
        let toPx0 = (e) => ({ x: e.x * src.width, y: e.y * src.height, w: e.w * src.width, h: e.h * src.height });
        // yazı ve nesne kutularını gerçek piksellere göre düzelt (yapay zeka kutuları biraz dar/kaymış olabilir)
        for (const e of els) {
          if (e.kind === 'shape') continue;
          const an = inkAnalyze(src, toPx0(e), true);
          e.x = an.box.x / src.width; e.y = an.box.y / src.height; e.w = an.box.w / src.width; e.h = an.box.h / src.height;
          if (e.kind === 'text' && an.fg) e._ink = an.fg;
        }
        const toPx = toPx0;
        const toDoc = (e) => ({ x: B.x + e.x * B.w, y: B.y + e.y * B.h, w: e.w * B.w, h: e.h * B.h });
        // 2) nesneleri orijinalden kes (zemin temizlenmeden önce)
        const objs = [];
        for (const e of els.filter((q) => q.kind === 'object')) {
          const p = toPx(e), pad = Math.max(2, Math.min(p.w, p.h) * 0.02);
          const c = document.createElement('canvas');
          const sx = Math.max(0, p.x - pad), sy = Math.max(0, p.y - pad), sw = Math.min(src.width - sx, p.w + 2 * pad), sh = Math.min(src.height - sy, p.h + 2 * pad);
          c.width = Math.max(1, Math.round(sw)); c.height = Math.max(1, Math.round(sh));
          c.getContext('2d').drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
          let url = c.toDataURL('image/png'), cut = false;
          if (e.cutout) { try { const rb = await window.Tools.removeBackground(url, 38, 2); if (rb.removed > 0.08 && rb.removed < 0.92) { url = rb.dataURL; cut = true; } } catch (er) {} }
          objs.push({ e, url, cut, box: { x: B.x + sx / src.width * B.w, y: B.y + sy / src.height * B.h, w: sw / src.width * B.w, h: sh / src.height * B.h }, nw: c.width, nh: c.height });
        }
        // 3) yazı renklerini pikselden doğrula
        const texts = els.filter((q) => q.kind === 'text').map((e) => {
          const d = toDoc(e);
          const col = sampleBox(snap, d);
          return { e, d, col };
        });
        // 4) temiz zemin
        let plateUrl = null, plateW = src.width, plateH = src.height;
        if (aiPlate) {
          try {
            const provider = (window.App.S.settings || {}).img_provider;
            const ratios = provider === 'gemini' ? [['1:1', 1], ['4:5', 0.8], ['3:4', 0.75], ['2:3', 0.667], ['9:16', 0.5625], ['3:2', 1.5], ['4:3', 1.333], ['16:9', 1.778]] : [['1:1', 1], ['3:2', 1.5], ['2:3', 0.667]];
            const want = src.width / src.height;
            const pick = ratios.reduce((a, c) => (Math.abs(Math.log(c[1] / want)) < Math.abs(Math.log(a[1] / want)) ? c : a));
            // oranı tutturmak için kenarları yansıtarak genişlet; sonuçtan orta kısım geri kesilir
            let PW = src.width, PH = src.height;
            if (want > pick[1]) PH = Math.round(src.width / pick[1]); else PW = Math.round(src.height * pick[1]);
            const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
            const pg = pc.getContext('2d');
            pg.filter = 'blur(18px)'; pg.drawImage(src, -40, -40, PW + 80, PH + 80); pg.filter = 'none';
            const ox = (PW - src.width) / 2, oy = (PH - src.height) / 2;
            pg.drawImage(src, ox, oy);
            const ref = await R.downscale(pc.toDataURL('image/png'), 1536, 0.92);
            const prompt = 'This is a graphic design (poster / label / social media post). Produce the SAME image with ALL text, letters, numbers, logos, icons, badges, barcodes, product photos and foreground objects completely removed, leaving ONLY the empty background: keep the background colors, gradients, textures, patterns, lighting and decorative background areas exactly as they are and seamlessly fill where the removed items were. Do not add anything new. Same framing and composition.';
            const r = await window.App.api('image-gen', { body: { prompt, aspect: pick[0], refs: [ref], enhance: false } });
            const im = new Image(); im.crossOrigin = 'anonymous';
            await new Promise((ok2, no) => { im.onload = ok2; im.onerror = no; im.src = r.url; });
            const out = document.createElement('canvas'); out.width = src.width; out.height = src.height;
            const fx = im.naturalWidth / PW, fy = im.naturalHeight / PH;
            out.getContext('2d').drawImage(im, ox * fx, oy * fy, src.width * fx, src.height * fy, 0, 0, src.width, src.height);
            plateUrl = (await window.App.api('upload', { body: { data: out.toDataURL('image/jpeg', 0.93), name: 'zemin-yz.jpg' } })).url;
          } catch (er) { UI.toast('Yapay zeka zemini temizleyemedi, yerel doldurma kullanılıyor: ' + er.message, true); }
        }
        if (!plateUrl) {
          const plate = document.createElement('canvas'); plate.width = src.width; plate.height = src.height;
          const pctx = plate.getContext('2d'); pctx.drawImage(src, 0, 0);
          const regions = els.map(toPx).sort((a, b) => a.w * a.h - b.w * b.h);
          for (const p of regions) {
            if (p.w * p.h > src.width * src.height * 0.6) continue; // tüm görsel kadar büyük alanları doldurmak anlamsız
            const m2 = Math.max(6, Math.min(p.w, p.h) * 0.25);
            const an = inkAnalyze(plate, { x: p.x - 3, y: p.y - 3, w: p.w + 6, h: p.h + 6 }, false);
            if (an.bgStd < 9) { pctx.fillStyle = an.bg; pctx.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8); continue; }
            const inp = window.Tools.inpaintRegion(plate, { x: p.x - m2, y: p.y - m2, w: p.w + 2 * m2, h: p.h + 2 * m2 }, { x: p.x - 2, y: p.y - 2, w: p.w + 4, h: p.h + 4 }, { feather: Math.round(Math.min(10, m2 * 0.5)) });
            pctx.drawImage(inp.canvas, inp.x, inp.y);
          }
          plateUrl = (await window.App.api('upload', { body: { data: plate.toDataURL('image/jpeg', 0.93), name: 'zemin.jpg' } })).url;
        }
        say('Katmanlar oluşturuluyor…');
        const base = { rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal' };
        const added = [];
        added.push(Object.assign({ id: R.uid(), type: 'image', role: 'plate', name: 'Zemin (temizlenmiş)', src: plateUrl, nw: plateW, nh: plateH, fit: 'fill', filters: {}, x: r1(B.x), y: r1(B.y), w: r1(B.w), h: r1(B.h) }, base, { locked: true }));
        // arkadan öne: modelin sırasını koru
        for (const e of els) {
          const d = toDoc(e);
          if (e.kind === 'shape') {
            const minS = Math.min(d.w, d.h);
            if (e.shape === 'line') {
              const horiz = d.w >= d.h;
              added.push(Object.assign({ id: R.uid(), type: 'rect', name: 'Çizgi', x: r1(d.x), y: r1(horiz ? d.y + d.h / 2 - Math.max(1, d.h) / 2 : d.y), w: r1(horiz ? d.w : Math.max(1, d.w)), h: r1(horiz ? Math.max(1, d.h) : d.h), fill: e.stroke !== 'none' ? e.stroke : (e.fill !== 'none' ? e.fill : '#111111'), radius: 0 }, base));
              continue;
            }
            const sh = Object.assign({ id: R.uid(), type: e.shape === 'ellipse' ? 'ellipse' : 'rect', name: e.shape === 'ellipse' ? 'Daire' : 'Şekil', x: r1(d.x), y: r1(d.y), w: r1(d.w), h: r1(d.h), fill: e.fill || 'none' }, base, { opacity: e.opacity == null ? 1 : e.opacity });
            if (e.stroke && e.stroke !== 'none') { sh.stroke = e.stroke; sh.strokeWidth = Math.max(1, r1(e.strokeWidth * B.w)); }
            if (sh.type === 'rect') sh.radius = r1(Math.max(0, Math.min(0.5, e.radius || 0)) * minS);
            added.push(sh);
          } else if (e.kind === 'object') {
            const o = objs.find((q) => q.e === e); if (!o) continue;
            const up = await window.App.api('upload', { body: { data: o.url, name: (e.name || 'nesne').replace(/[^\wçğıöşüÇĞİÖŞÜ-]+/g, '-') + '.png' } });
            added.push(Object.assign({ id: R.uid(), type: 'image', role: e.role === 'barcode' ? 'barcode' : e.role === 'logo' ? 'logo' : 'object', name: e.name || 'Nesne', src: up.url, nw: o.nw, nh: o.nh, fit: 'fill', filters: {}, x: r1(o.box.x), y: r1(o.box.y), w: r1(o.box.w), h: r1(o.box.h) }, base));
          } else if (e.kind === 'text') {
            const tt = texts.find((q) => q.e === e); const d2 = tt.d;
            const color = e._ink || (tt.col.density > 0.02 && tt.col.fg ? tt.col.fg : e.color);
            const t = Object.assign({ id: R.uid(), type: 'text', name: 'Yazı: ' + e.text.replace(/\s+/g, ' ').slice(0, 22), text: e.uppercase ? e.text : e.text, x: r1(d2.x), y: r1(d2.y), fontFamily: FONT_OF[e.font] || 'Arial', fontWeight: e.weight >= 650 ? 800 : e.weight >= 500 ? 600 : 400, italic: !!e.italic, uppercase: false, align: e.align, fill: color, letterSpacing: 0, underline: false }, base);
            if (e.letterSpacing > 0.02) t.letterSpacing = 0; // önce ölç, sonra ekle
            fitTextToBox(t, d2.w, d2.h, e.lines);
            if (e.letterSpacing > 0.02) { t.letterSpacing = r1(t.fontSize * Math.min(0.4, e.letterSpacing)); fitTextToBox(Object.assign(t, {}), d2.w, d2.h, e.lines); }
            // kutuya göre hizala
            t.w = r1(Math.max(t.w, d2.w));
            if (t.align === 'center') t.x = r1(d2.x + d2.w / 2 - t.w / 2);
            else if (t.align === 'right') t.x = r1(d2.x + d2.w - t.w);
            t.y = r1(d2.y + (d2.h - t.h) / 2);
            if (e.rotation && Math.abs(e.rotation) > 1) t.rotation = r1(e.rotation);
            added.push(t);
          }
        }
        // orijinali gizle, yeni katmanları onun yerine koy
        const at = doc.layers.indexOf(img);
        img.visible = false; img.locked = true; img.name = 'Orijinal görsel (gizli)';
        doc.layers.splice(at + 1, 0, ...added);
        R.normalize(doc);
        await R.ensureImageSizes(doc);
        st.sel = []; st.tab = 'layers';
        commit();
        const nT = added.filter((l) => l.type === 'text').length, nO = added.filter((l) => l.role === 'object' || l.role === 'logo' || l.role === 'barcode').length, nS = added.length - nT - nO - 1;
        UI.toast(`Katmanlara ayrıldı: ${nT} yazı, ${nS} şekil, ${nO} nesne. Her biri ayrı seçilip düzenlenebilir.`);
      } catch (err) { UI.toast('Ayrılamadı: ' + err.message, true); }
      finally { busy.remove(); }
    }

    // ---------- vektör barkod ----------
    async function barcodeDialog(init, title) {
      let val = init || '';
      return UI.dialog(`<div class="d-body"><h3>${title || 'Barkod ekle'}</h3><p class="muted">EAN-13 numarasını yaz. 12 hane yazarsan son kontrol hanesi otomatik hesaplanır. Barkod vektör olarak çizilir: her boyutta net basılır.</p>
        <input class="inp" id="bcIn" inputmode="numeric" autocomplete="off" placeholder="örn. 869 1234 56789" value="${esc(val)}" style="font-size:18px;letter-spacing:1px">
        <div id="bcPrev" style="margin-top:12px;height:150px;display:grid;place-items:center;background:#fff;border-radius:10px"></div>
        <div id="bcErr" class="muted" style="margin-top:8px;font-size:12.5px;min-height:18px"></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bcOk" disabled>${icon('check')}Ekle</button></div>`, {
        onOpen: (box, close) => {
          const inp = $('#bcIn', box), prev = $('#bcPrev', box), err = $('#bcErr', box), ok = $('#bcOk', box);
          const upd = () => {
            const e = window.Tools.ean13(inp.value);
            if (!inp.value.trim()) { prev.innerHTML = ''; err.textContent = ''; ok.disabled = true; return; }
            if (!e.ok) {
              err.innerHTML = esc(e.error) + (e.suggest ? ` <button class="btn ghost sm" id="bcFix">Düzelt</button>` : '');
              err.style.color = 'var(--danger, #f66)'; ok.disabled = true; prev.innerHTML = '';
              const f = $('#bcFix', box); if (f) f.onclick = () => { inp.value = e.suggest; upd(); };
              return;
            }
            err.style.color = ''; err.textContent = inp.value.replace(/\D/g, '').length === 12 ? `Kontrol hanesi eklendi: ${e.value}` : 'Geçerli barkod ✓';
            const b = window.Tools.barcodeLayers(e.value, { w: 300, h: 140 });
            prev.innerHTML = R.renderSVG(R.normalize({ width: 300, height: 140, background: '#ffffff', layers: b.layers }), { fit: true, prefix: 'bcp' });
            const sv = prev.querySelector('svg'); if (sv) { sv.style.height = '140px'; sv.style.width = 'auto'; }
            val = e.value; ok.disabled = false;
          };
          inp.oninput = upd; inp.onkeydown = (e) => { if (e.key === 'Enter' && !ok.disabled) close(val); };
          ok.onclick = () => close(val);
          upd(); setTimeout(() => inp.focus(), 60);
        },
      });
    }
    async function insertBarcode(img) {
      let init = '';
      if (img && img.type === 'image') {
        UI.toast('Görseldeki barkod okunuyor…');
        init = (await window.Tools.readBarcode(img.src)) || '';
      }
      const v = await barcodeDialog(init, img ? 'Vektör barkodla değiştir' : 'Barkod ekle');
      if (!v) return;
      let box;
      if (img) box = { x: img.x, y: img.y, w: img.w, h: img.h };
      else { const w = Math.round(Math.min(doc.width, doc.height) * 0.36); box = { w, h: Math.round(w * 0.62), x: Math.round((doc.width - w) / 2), y: Math.round((doc.height - w * 0.62) / 2) }; }
      const b = window.Tools.barcodeLayers(v, box);
      const at = img ? doc.layers.indexOf(img) : doc.layers.length;
      if (img) doc.layers.splice(at, 1);
      doc.layers.splice(at, 0, ...b.layers);
      R.normalize(doc);
      st.sel = b.layers.map((x) => x.id); st.tab = 'props';
      commit();
      UI.toast(img ? 'Barkod net vektörle değiştirildi' : 'Barkod eklendi — numarası sağ panelden değişir');
    }
    function rebuildBarcode(l, value) {
      const b = window.Tools.setBarcode(doc, l, value);
      R.normalize(doc);
      st.sel = b.layers.map((x) => x.id);
      commit(); UI.toast('Barkod güncellendi: ' + value);
    }

    function renderAssets() {
      const groups = {};
      window.Tools.ASSETS.forEach((a, i) => (groups[a.g] = groups[a.g] || []).push([a, i]));
      pbody.innerHTML = Object.entries(groups).map(([g, arr]) => `<div class="grp"><h4>${g}</h4><div class="assets">${arr.map(([a, i]) => `<button class="asset" data-as="${i}" title="${esc(a.n)}"><svg viewBox="-6 -6 112 112"><path d="${a.d}" ${a.stroke ? 'fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"' : `fill="currentColor"${a.evenodd ? ' fill-rule="evenodd"' : ''}`}/></svg></button>`).join('')}</div></div>`).join('')
        + `<div class="grp"><h4>Çerçeveler ve ızgaralar<span class="muted" style="font-weight:400">fotoğrafı içine sürükle</span></h4><div class="frames">${FRAMES.map((f, i) => `<button class="frame-it" data-frame="${i}" title="${esc(f.n)}">${f.icon}</button>`).join('')}</div></div>`
        + `<div class="grp"><h4>Görsel ve font</h4><button class="btn sm primary" id="asGen" style="width:100%;margin-bottom:6px">${icon('sparkle')}Yapay zekayla görsel üret</button><div class="iconrow" style="margin-bottom:6px"><button class="btn sm" id="asBc">${icon('barcode')}Barkod</button><button class="btn sm" id="asQr">${icon('qr')}QR kod</button></div><button class="btn sm" id="asImp" style="width:100%;margin-bottom:6px">${icon('file')}PSD / AI / PDF aç</button><div class="iconrow"><button class="btn sm" id="asImg">${icon('upload')}Fotoğraf yükle</button><button class="btn sm" id="asFont">${icon('type')}Font yükle</button></div></div>`;
      // bileşenlerim
      const cl = comps();
      const cg = document.createElement('div'); cg.className = 'grp';
      cg.innerHTML = `<h4>Bileşenlerim<span class="muted" style="font-weight:400">${cl.length ? 'dokun: ekle' : ''}</span></h4>${cl.length ? `<div class="comp-grid">${cl.map((c) => `<div class="comp-it" data-comp="${c.id}" title="${esc(c.name)}">${c.thumb ? `<img src="${c.thumb}" alt="">` : icon('star')}<span>${esc(c.name)}</span><button class="lb" data-cdel="${c.id}" title="Sil">${icon('x')}</button></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px;margin:0">Logo, buton, etiket gibi sık kullandığın öğeleri seç → <b>Bileşen yap</b>. Burada görünür ve her tasarımda tek dokunuşla eklenir.</p>'}`;
      pbody.prepend(cg);
      $$('[data-comp]', cg).forEach((el) => (el.onclick = (e) => { if (e.target.closest('[data-cdel]')) return; const c = cl.find((x) => x.id === el.dataset.comp); if (c) { insertComponent(c); if (mobile()) togglePanel(false); } }));
      $$('[data-cdel]', cg).forEach((b) => (b.onclick = async () => { if (await UI.confirmBox('Bu bileşen kitaplıktan silinsin mi? Tasarımlardaki kopyalar kalır.')) deleteComponent(b.dataset.cdel); }));
      // yüklenen fotoğraflar en üstte
      const up = document.createElement('div');
      up.className = 'grp';
      up.innerHTML = `<h4>Fotoğrafların<span class="muted" style="font-weight:400">dokun: ekle</span></h4><div class="up-grid" id="upGrid"><span class="muted" style="font-size:12px">Yükleniyor…</span></div>`;
      pbody.prepend(up);
      const pg = document.createElement('div'); pg.className = 'grp p5-tools';
      pg.innerHTML = `<h4>Ekle</h4><div class="p5-tg"><button class="btn sm" data-p5="iconDialog">${icon('star')}İkonlar</button><button class="btn sm" data-p5="bgDialog">${icon('image')}Arka plan / doku</button><button class="btn sm" data-p5="tableDialog">${icon('list')}Tablo</button><button class="btn sm" data-p5="chartDialog">${icon('chart')}Grafik</button><button class="btn sm" data-ins="price">${icon('list')}Fiyat listesi</button><button class="btn sm" data-ins="stock">${icon('image')}Ücretsiz fotoğraf</button></div>
        <h4 style="margin-top:12px">Hızlı ve profesyonel</h4><div class="p5-tg"><button class="btn sm primary" data-co="blocks">${icon('blocks')}Hazır bloklar</button><button class="btn sm" data-co="scenes">${icon('scene')}Ürün sahnesi</button><button class="btn sm" data-co="harmony">${icon('harmony')}Renk uyumu</button><button class="btn sm" data-co="fillInfo">${icon('info')}Bilgilerimi yerleştir</button><button class="btn sm" data-p6="textStyles">${icon('type')}Yazı stilleri</button></div>`;
      pbody.prepend(pg);
      $$('[data-p5]', pg).forEach((b) => (b.onclick = () => { if (mobile()) togglePanel(false); window.P5[b.dataset.p5](); }));
      $$('[data-co]', pg).forEach((b) => (b.onclick = () => { if (mobile()) togglePanel(false); window.Coach[b.dataset.co](); }));
      $$('[data-p6]', pg).forEach((b) => (b.onclick = () => { if (mobile()) togglePanel(false); window.P6[b.dataset.p6](); }));
      $$('[data-ins]', pg).forEach((b) => (b.onclick = () => {
        if (mobile()) togglePanel(false);
        if (b.dataset.ins === 'stock') return window.P5.stockDialog();
        const fs = Math.round(Math.min(doc.width, doc.height) * 0.04), w = Math.round(doc.width * 0.7);
        addLayer({ type: 'text', name: 'Fiyat listesi', text: 'Ürün adı\t₺199\nİkinci ürün\t₺249\nÜçüncü ürün\t₺329', x: Math.round((doc.width - w) / 2), y: Math.round(doc.height * 0.4), w, fontSize: fs, fill: st.opts.textColor || '#14161B', fontFamily: 'Inter', fontWeight: 600, lineHeight: 1.6, letterSpacing: 0, align: 'left', leader: 'dots' });
        commit(); UI.toast('Fiyat listesi eklendi — ad ile fiyat arasına Tab bas, yeni satır için Enter');
      }));
      window.App.api('uploads').then((list) => {
        const g = $('#upGrid', pbody); if (!g) return;
        if (!list.length) { g.innerHTML = '<span class="muted" style="font-size:12.5px">Henüz fotoğraf yok. “Fotoğraf yükle” ile ekleyebilirsin.</span>'; return; }
        g.innerHTML = list.slice(0, 40).map((u) => `<div class="up-it"><button data-up="${esc(u.url)}" title="Tuvale ekle"><img src="${esc(u.url)}" loading="lazy" alt=""></button><button class="up-fill" data-fill="${esc(u.url)}" title="Arka plan yap (tuvali kapla)">${icon('fit')}</button></div>`).join('');
        $$('[data-up]', g).forEach((b) => (b.onclick = async () => { await placeImage(b.dataset.up); st.tab = 'props'; renderPanel(); if (mobile()) togglePanel(false); }));
        $$('[data-fill]', g).forEach((b) => (b.onclick = async () => { await placeImage(b.dataset.fill); fillCanvas(one()); if (mobile()) togglePanel(false); }));
      }).catch(() => {});
      $$('[data-as]', pbody).forEach((b) => (b.onclick = () => {
        const a = window.Tools.ASSETS[+b.dataset.as];
        const sz = Math.round(Math.min(doc.width, doc.height) * (a.g === 'Çerçeve' ? 0.8 : 0.22));
        const base = { type: 'path', name: a.n, d: a.d, vw: 100, vh: 100, x: r1((doc.width - sz) / 2), y: r1((doc.height - sz) / 2), w: sz, h: sz, evenodd: !!a.evenodd };
        if (a.stroke) Object.assign(base, { fill: 'none', stroke: st.opts.textColor || '#14161B', strokeWidth: Math.max(2, Math.round(sz * 0.05)) });
        else Object.assign(base, { fill: st.opts.fill });
        addLayer(base);
        st.tab = 'props'; renderPanel();
        if (mobile()) togglePanel(false);
      }));
      $$('[data-frame]', pbody).forEach((b) => (b.onclick = () => { insertFrame(FRAMES[+b.dataset.frame]); st.tab = 'props'; renderPanel(); if (mobile()) togglePanel(false); }));
      $('#asImg', pbody).onclick = () => addImage();
      $('#asImp', pbody).onclick = () => window.Features.importFile();
      $('#asBc', pbody).onclick = async () => { await insertBarcode(); if (mobile()) togglePanel(false); };
      { const q = $('#asQr', pbody); if (q) q.onclick = () => qrDialog(); }
      $('#asGen', pbody).onclick = async () => { const r = await window.Features.imageGenDialog({ aspect: window.Features.aspectOf(doc.width, doc.height) }); if (r && r.url) { await placeImage(r.url); if (mobile()) togglePanel(false); } };
      $('#asFont', pbody).onclick = () => window.Features.uploadFont(() => UI.toast('Font metin katmanlarında seçilebilir'));
      M.stagger($$('.asset', pbody), { opacity: [0, 1], scale: [.85, 1] }, { each: 12, stiffness: 400, damping: 26 });
    }

    // ---------- Canva tarzı: yazıyı öznenin arkasına al
    async function soloCanvas(l, k) {
      const solo = { width: l.w, height: l.h, background: 'transparent', layers: [{ ...JSON.parse(JSON.stringify(l)), x: 0, y: 0, rotation: 0, opacity: 1, alphaMask: null, shadow: null, fx: null, flipX: false, flipY: false }] };
      return R.exportCanvas(solo, k);
    }
    function autoSubjectMask(c, tol = 38) {
      const W = c.width, H = c.height, px = c.getContext('2d').getImageData(0, 0, W, H).data;
      const bg = new Uint8Array(W * H), seed = new Int32Array(W * H).fill(-1), q = [];
      const push = (i, s0) => { if (bg[i]) return; const j = i * 4, sj = s0 * 4; if (px[j + 3] < 20) { bg[i] = 1; seed[i] = s0; q.push(i); return; } const dr = px[j] - px[sj], dg = px[j + 1] - px[sj + 1], db = px[j + 2] - px[sj + 2]; if (dr * dr + dg * dg + db * db <= tol * tol * 3) { bg[i] = 1; seed[i] = s0; q.push(i); } };
      for (let x = 0; x < W; x++) { push(x, x); push((H - 1) * W + x, (H - 1) * W + x); }
      for (let y = 0; y < H; y++) { push(y * W, y * W); push(y * W + W - 1, y * W + W - 1); }
      while (q.length) { const i = q.pop(), x = i % W, s0 = seed[i]; if (x > 0) push(i - 1, s0); if (x < W - 1) push(i + 1, s0); if (i >= W) push(i - W, s0); if (i < W * (H - 1)) push(i + W, s0); }
      const m = new Uint8ClampedArray(W * H); for (let i = 0; i < W * H; i++) m[i] = bg[i] ? 0 : 255;
      // kenarı biraz yumuşat
      const c2 = m.slice(); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; m[i] = (c2[i] * 4 + c2[i - 1] + c2[i + 1] + c2[i - W] + c2[i + W]) / 8; }
      return m;
    }
    function maskToDataURL(m, W, H) {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), id = x.createImageData(W, H);
      for (let i = 0; i < W * H; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = m[i]; id.data[i * 4 + 3] = 255; }
      x.putImageData(id, 0, 0); return c.toDataURL('image/png');
    }
    async function textBehind(l) {
      const texts = doc.layers.filter((t) => t.type === 'text' && t.visible !== false);
      if (!texts.length) { UI.toast('Önce fotoğrafın üzerine bir yazı ekle', true); return; }
      UI.toast('Özne ayrılıyor…');
      const k = Math.min(1, 900 / Math.max(l.w, l.h));
      let c; try { c = await soloCanvas(l, k); } catch (e) { UI.toast(e.message, true); return; }
      const m = autoSubjectMask(c);
      let fg = 0; for (let i = 0; i < m.length; i++) if (m[i] > 128) fg++;
      const sub = JSON.parse(JSON.stringify(l));
      sub.id = R.uid(); sub.name = 'Özne (önde)'; sub.role = 'subject'; delete sub.shadow; sub.locked = false;
      const data = maskToDataURL(m, c.width, c.height);
      try { const r = await window.App.api('upload', { body: { data, name: 'ozne-maske.png' } }); sub.alphaMask = r.url; } catch (e) { sub.alphaMask = data; }
      // özne kopyasını, fotoğrafla çakışan en üstteki yazının hemen üstüne koy
      const ov = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      const idxs = doc.layers.map((t, i) => (t.type === 'text' && ov(t, l) ? i : -1)).filter((i) => i >= 0);
      const at = idxs.length ? Math.max(...idxs) + 1 : doc.layers.length;
      doc.layers.splice(at, 0, sub);
      st.sel = [sub.id]; commit();
      const ratio = fg / m.length;
      UI.toast(ratio > 0.92 || ratio < 0.03 ? 'Özne net ayrılamadı (arka plan karışık). Maske fırçasıyla özneyi boya.' : 'Yazı artık öznenin arkasında. Kenarları maske fırçasıyla düzeltebilirsin.');
      maskEditor(sub);
    }

    // ---------- tasarımı çevir
    const LANGS = [['en', 'İngilizce'], ['de', 'Almanca'], ['ar', 'Arapça'], ['ru', 'Rusça'], ['fr', 'Fransızca'], ['es', 'İspanyolca'], ['nl', 'Felemenkçe'], ['it', 'İtalyanca'], ['az', 'Azerbaycan Türkçesi'], ['tr', 'Türkçe']];
    function fitAfterChange(t, oldLines, oldW) {
      t.w = oldW; R.layoutText(t);
      let g = 0; while (t._lines.length > Math.max(1, oldLines) && g++ < 30) { t.fontSize = Math.max(6, t.fontSize * 0.95); R.layoutText(t); }
      t.fontSize = r1(t.fontSize);
    }
    async function translateDialog() {
      const texts = doc.layers.filter((t) => t.type === 'text' && R.plain(t.text).trim());
      if (!texts.length) { UI.toast('Tasarımda çevrilecek yazı yok'); return; }
      const res = await UI.dialog(`<div class="d-body"><h3>${icon('globe')} Tasarımı çevir</h3><p class="muted" style="margin:0 0 10px">Tüm yazılar seçtiğin dile çevrilir; yazı tipi, renk ve yerleşim aynı kalır. Uzayan yazılar kutusuna sığacak kadar küçültülür.</p>
        <div class="lang-grid">${LANGS.map(([c, n], i) => `<button class="btn sm${i === 0 ? ' on' : ''}" data-lang="${n}">${n}</button>`).join('')}</div>
        <label class="chk" style="margin-top:12px;display:flex;gap:8px;align-items:center"><input type="checkbox" id="trCopy" checked> Yeni proje olarak oluştur (orijinal korunur)</label></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="trGo">${icon('sparkle')}Çevir</button></div>`, {
        onOpen: (box, close) => {
          let lang = LANGS[0][1];
          $$('[data-lang]', box).forEach((b) => (b.onclick = () => { lang = b.dataset.lang; $$('[data-lang]', box).forEach((x) => x.classList.toggle('on', x === b)); }));
          $('#trGo', box).onclick = () => close({ lang, copy: $('#trCopy', box).checked });
        },
      });
      if (!res) return;
      const busy = UI.toast(`${res.lang} diline çevriliyor…`);
      let out;
      try { out = await window.App.api('ai-text', { body: { task: 'translate', lang: res.lang, items: texts.map((t) => ({ id: t.id, text: t.text })) } }); }
      catch (e) { UI.toast(e.message, true); return; }
      const map = new Map((out.items || []).map((it) => [it.id, it.text]));
      if (!map.size) { UI.toast('Çeviri alınamadı, tekrar dene', true); return; }
      const apply = (layers) => layers.forEach((t) => { const nt = map.get(t.id); if (t.type !== 'text' || !nt) return; R.layoutText(t); const ol = t._lines.length, ow = t.w; t.text = nt; fitAfterChange(t, ol, ow); });
      if (res.copy) {
        const P = window.App.S.project;
        const p = JSON.parse(JSON.stringify(R.clean(P))); delete p.id; p.created = null;
        p.name = (P.name || 'Tasarım') + ' — ' + res.lang;
        R.normalize(p); apply(p.layers);
        try { await window.App.saveProject(p); window.App.S.project = p; window.App.go('editor', p.id); UI.toast(`${res.lang} kopyası hazır — orijinal projelerde duruyor`); }
        catch (e) { UI.toast(e.message, true); }
      } else { apply(doc.layers); commit(); UI.toast(`${res.lang} diline çevrildi — Geçmiş'ten geri alabilirsin`); }
    }

    // ---------- yapay zeka metin yazarı
    async function aiWriteDialog(l) {
      const others = doc.layers.filter((t) => t.type === 'text' && t !== l).map((t) => R.plain(t.text)).filter(Boolean).join(' | ').slice(0, 600);
      const KINDS = ['Başlık', 'Slogan', 'Kampanya metni', 'Ürün açıklaması', 'Buton yazısı', 'Bu metni yeniden yaz', 'Kısalt', 'Daha çarpıcı yap'];
      const TONES = ['Samimi', 'Lüks', 'Eğlenceli', 'Kurumsal', 'Acil kampanya', 'Doğal / organik'];
      await UI.dialog(`<div class="d-body aw"><h3>${icon('sparkle')} Yapay zekayla yaz</h3>
        <div class="aw-lbl">Ne yazılsın?</div><div class="chips" id="awK">${KINDS.map((k, i) => `<button class="chip${i === (l.fontSize > 60 ? 0 : 5) ? ' on' : ''}">${k}</button>`).join('')}</div>
        <div class="aw-lbl">Ton</div><div class="chips" id="awT">${TONES.map((k, i) => `<button class="chip${i === 0 ? ' on' : ''}">${k}</button>`).join('')}</div>
        <div class="aw-lbl">Konu / ürün</div><input class="inp" id="awA" value="${esc(others)}" placeholder="örn. el yapımı çilek reçeli, yaz indirimi %30">
        <div id="awOut" class="aw-out"></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="awGo">${icon('sparkle')}Seçenek üret</button></div>`, {
        onOpen: (box, close) => {
          const pick = (id) => $$(`#${id} .chip`, box).forEach((b) => (b.onclick = () => $$(`#${id} .chip`, box).forEach((x) => x.classList.toggle('on', x === b))));
          pick('awK'); pick('awT');
          const out = $('#awOut', box);
          $('#awGo', box).onclick = async () => {
            const kind = $('#awK .on', box).textContent, tone = $('#awT .on', box).textContent;
            out.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span>';
            try {
              const r = await window.App.api('ai-text', { body: { task: 'write', kind, tone, about: $('#awA', box).value, current: R.plain(l.text) } });
              const opts = r.options || [];
              out.innerHTML = opts.length ? `<div class="aw-lbl">Birini seç — yazıya yerleşir</div>${opts.map((o, i) => `<button class="aw-opt" data-i="${i}">${esc(o)}</button>`).join('')}` : '<p class="muted">Seçenek gelmedi, tekrar dene.</p>';
              $$('.aw-opt', out).forEach((b) => (b.onclick = () => { R.layoutText(l); const ol = Math.max(l._lines.length, kind === 'Ürün açıklaması' || kind === 'Kampanya metni' ? 4 : 1), ow = l.w; l.text = opts[+b.dataset.i]; fitAfterChange(l, ol, ow); commit(); $$('.aw-opt', out).forEach((x) => x.classList.toggle('on', x === b)); }));
              $('#awGo', box).innerHTML = `${icon('refresh')}Yeniden üret`;
            } catch (e) { out.innerHTML = `<p class="muted">${esc(e.message)}</p>`; }
          };
        },
      });
    }

    // ---------- stil setleri (yazı tipi ikilisi + palet)
    const STYLE_SETS = [
      { n: 'Modern', h: 'Arial Black', b: 'Segoe UI', c: ['#111827', '#F9FAFB', '#2563EB', '#F59E0B'] },
      { n: 'Zarif', h: 'Georgia', b: 'Garamond', c: ['#2B2321', '#FBF7F0', '#B08D57', '#7A5C3E'] },
      { n: 'Lüks', h: 'Palatino Linotype', b: 'Georgia', c: ['#0E0E10', '#F3EDE2', '#C9A45C', '#5B4636'] },
      { n: 'Enerjik', h: 'Impact', b: 'Trebuchet MS', c: ['#1A1A2E', '#FFFFFF', '#FF2E63', '#FFD23F'] },
      { n: 'Doğal', h: 'Georgia', b: 'Verdana', c: ['#26351F', '#F4F1E6', '#6B8F3E', '#D98E04'] },
      { n: 'Pastel', h: 'Trebuchet MS', b: 'Segoe UI', c: ['#3D3B4F', '#FFF8F3', '#F4A6C1', '#9AD5CA'] },
      { n: 'Kurumsal', h: 'Franklin Gothic Medium', b: 'Calibri', c: ['#0B1F3A', '#F5F7FA', '#0E7490', '#64748B'] },
      { n: 'Retro', h: 'Arial Black', b: 'Courier New', c: ['#3A2618', '#F6E7C8', '#E4572E', '#29B6A8'] },
      { n: 'Gece', h: 'Impact', b: 'Segoe UI', c: ['#05060A', '#E8E9F0', '#7C5CFF', '#22D3EE'] },
      { n: 'Gazete', h: 'Times New Roman', b: 'Georgia', c: ['#141414', '#FAFAF7', '#C1121F', '#6B6B6B'] },
    ];
    function applyStyleSet(S) {
      const texts = doc.layers.filter((t) => t.type === 'text');
      const mx = Math.max(0, ...texts.map((t) => +t.fontSize || 0));
      texts.forEach((t) => { R.layoutText(t); const ol = t._lines.length, ow = t.w; t.fontFamily = (+t.fontSize >= mx * 0.55 ? S.h : S.b); fitAfterChange(t, ol, ow); });
      const [dark, light, ...acc] = S.c, map = {};
      let ai = 0;
      docColors().forEach((c) => { const [, s2, l2] = hsl(c); map[c.toUpperCase()] = s2 < 0.14 ? (l2 > 0.55 ? light : dark) : acc[ai++ % acc.length]; });
      mapColors(map);
    }
    async function styleDialog() {
      const orig = JSON.stringify({ b: doc.background, l: doc.layers });
      const ok = await UI.dialog(`<div class="d-body"><h3>${icon('palette')} Stil setleri</h3><p class="muted" style="margin:0 0 10px">Yazı tipi ikilisi ve renk paletini tüm tasarıma tek dokunuşla uygular. Dokunup dene, beğendiğinde Uygula.</p>
        <div class="style-grid">${STYLE_SETS.map((S, i) => `<button class="style-card" data-st="${i}" style="background:${S.c[1]};color:${S.c[0]}"><b style="font-family:'${S.h}'">${S.n}</b><small style="font-family:'${S.b}'">${S.h} + ${S.b}</small><span class="dots">${S.c.map((c) => `<i style="background:${c}"></i>`).join('')}</span></button>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="stOk" disabled>${icon('check')}Uygula</button></div>`, {
        onOpen: (box, close) => {
          $$('[data-st]', box).forEach((b) => (b.onclick = () => {
            const o = JSON.parse(orig); doc.background = o.b; doc.layers = o.l; R.normalize(doc);
            applyStyleSet(STYLE_SETS[+b.dataset.st]); renderCanvas();
            $$('[data-st]', box).forEach((x) => x.classList.toggle('on', x === b)); $('#stOk', box).disabled = false;
          }));
          $('#stOk', box).onclick = () => close(true);
        },
      });
      if (!ok) { const o = JSON.parse(orig); doc.background = o.b; doc.layers = o.l; R.normalize(doc); renderCanvas(); return; }
      commit(); UI.toast('Stil uygulandı');
    }

    // ---------- duotone hazırları
    const DUOS = [['#1B1B3A', '#FF4F8B'], ['#0F2027', '#5EFCE8'], ['#2D1B69', '#FFD166'], ['#0B3D2E', '#B8F2C9'], ['#3A0CA3', '#F72585'], ['#202020', '#F0E6D2'], ['#7F1D1D', '#FDE68A'], ['#0C4A6E', '#F0ABFC']];

    // ---------- yapay zekayla genişlet (outpaint) ve seçerek doldur (generative fill)
    const AI_RATIOS = () => ((window.App.S.settings || {}).img_provider === 'gemini' ? [['1:1', 1], ['3:2', 1.5], ['16:9', 1.778], ['21:9', 2.333], ['2:3', 0.667], ['9:16', 0.5625], ['4:5', 0.8], ['5:4', 1.25]] : [['1:1', 1], ['3:2', 1.5], ['2:3', 0.667]]);
    const nearestRatio = (want) => AI_RATIOS().reduce((p2, c) => (Math.abs(Math.log(c[1] / want)) < Math.abs(Math.log(p2[1] / want)) ? c : p2));
    const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('Görsel yüklenemedi')); im.src = src; });
    async function uploadCanvas(c, name) { const data = c.toDataURL('image/png'); try { return (await window.App.api('upload', { body: { data, name } })).url; } catch (e) { return data; } }
    function busyNote(t) { const b = document.createElement('div'); b.className = 'photo-hint'; b.innerHTML = `<span class="ink-dots"><i></i><i></i><i></i></span><span><b>${t}</b></span>`; vp.appendChild(b); return b; }
    async function expandImage(l) {
      const opts = [['canvas', 'Tuvali doldur', 'fotoğraf tüm sayfayı kaplar'], ['25', 'Her yöne %25', 'kenarları uzat'], ['wide', 'Yataya genişlet', '16:9 gibi'], ['tall', 'Dikeye genişlet', 'story / 9:16'], ['square', 'Kareye tamamla', '1:1']];
      const ai = window.Features.imageReady();
      const v = await UI.dialog(`<div class="d-body"><h3>${icon('fit')} Görseli genişlet</h3><p class="muted" style="margin:0 0 10px">Fotoğrafın kenarlarını ${ai ? '<b>yapay zeka</b> sahneye uygun şekilde devam ettirerek' : 'kenar renkleriyle (yumuşak bulanık)'} uzatır. Orijinal kısım aynen korunur.${ai ? '' : ' Daha doğal sonuç için Ayarlar → Görsel üretimini bağla.'}</p>
        <div class="cmdk"><div class="list">${opts.map(([k, t, d]) => `<div class="it" data-ex="${k}">${icon('fit')}<span>${t}</span><small>${d}</small></div>`).join('')}</div></div></div>`,
      { onOpen: (box, close) => $$('[data-ex]', box).forEach((it) => (it.onclick = () => close(it.dataset.ex))) });
      if (!v) return;
      let T;
      if (v === 'canvas') T = { x: Math.min(0, l.x), y: Math.min(0, l.y), x2: Math.max(doc.width, l.x + l.w), y2: Math.max(doc.height, l.y + l.h) };
      else if (v === '25') T = { x: l.x - l.w * 0.25, y: l.y - l.h * 0.25, x2: l.x + l.w * 1.25, y2: l.y + l.h * 1.25 };
      else { const want = v === 'wide' ? 16 / 9 : v === 'tall' ? 9 / 16 : 1; let w = l.w, h = l.h; if (w / h < want) w = h * want; else h = w / want; T = { x: l.x - (w - l.w) / 2, y: l.y - (h - l.h) / 2, x2: l.x + (w + l.w) / 2, y2: l.y + (h + l.h) / 2 }; }
      const TW = T.x2 - T.x, TH = T.y2 - T.y;
      const note = busyNote(ai ? 'Yapay zeka görseli genişletiyor… 15-60 sn' : 'Görsel genişletiliyor…');
      try {
        const k = Math.min(2, 1536 / Math.max(TW, TH));
        const src = await soloCanvas(l, k);
        const c = document.createElement('canvas'); c.width = Math.round(TW * k); c.height = Math.round(TH * k);
        const x = c.getContext('2d'), ox = (l.x - T.x) * k, oy = (l.y - T.y) * k;
        // yerel dolgu: kenarları uzatılmış + bulanık zemin
        x.filter = `blur(${Math.round(Math.max(c.width, c.height) / 30)}px)`;
        x.drawImage(src, -c.width * 0.05, -c.height * 0.05, c.width * 1.1, c.height * 1.1);
        x.filter = 'none';
        const edge = (sx, sy, sw, sh, dx, dy, dw, dh) => { if (dw > 0 && dh > 0 && sw > 0 && sh > 0) x.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh); };
        x.globalAlpha = 0.85; x.filter = `blur(${Math.round(Math.max(c.width, c.height) / 60)}px)`;
        edge(0, 0, 2, src.height, 0, oy, ox, src.height); edge(src.width - 2, 0, 2, src.height, ox + src.width, oy, c.width - ox - src.width, src.height);
        edge(0, 0, src.width, 2, ox, 0, src.width, oy); edge(0, src.height - 2, src.width, 2, ox, oy + src.height, src.width, c.height - oy - src.height);
        x.globalAlpha = 1; x.filter = 'none';
        x.drawImage(src, ox, oy);
        let out = c;
        if (ai) {
          const pick = nearestRatio(TW / TH);
          const r = await window.App.api('image-gen', { body: { prompt: 'Outpainting task. The sharp rectangle in the middle is the original photo. Everything around it is a blurry placeholder. Replace the blurry border area with a natural, realistic, seamless continuation of the same scene (same lighting, perspective, colors, textures). Do not add text, logos or new main subjects. Keep the central original photo exactly as it is.', aspect: pick[0], refs: [c.toDataURL('image/jpeg', 0.92)], enhance: false } });
          const im = await loadImg(r.url);
          const o2 = document.createElement('canvas'); o2.width = c.width; o2.height = c.height; const y = o2.getContext('2d');
          // oran farkını kırparak koru
          const s2 = Math.max(o2.width / im.width, o2.height / im.height); y.drawImage(im, (o2.width - im.width * s2) / 2, (o2.height - im.height * s2) / 2, im.width * s2, im.height * s2);
          // orijinali yumuşak kenarla geri koy
          const f = document.createElement('canvas'); f.width = src.width; f.height = src.height; f.getContext('2d').drawImage(src, 0, 0);
          window.Tools.featherCanvas(f, Math.max(4, Math.round(Math.min(f.width, f.height) * 0.03)));
          y.drawImage(f, ox, oy); out = o2;
        }
        const url = await uploadCanvas(out, 'genisletilmis.png');
        if (!l.origSrc) l.origSrc = l.src;
        Object.assign(l, { src: url, x: T.x, y: T.y, w: TW, h: TH, fit: 'fill', zoom: 1, ox: 0, oy: 0, rotation: 0, nw: out.width, nh: out.height });
        delete l.crop; delete l.alphaMask; if (l.mask && l.mask !== 'none') l.mask = 'none';
        commit(); UI.toast(ai ? 'Görsel yapay zekayla genişletildi' : 'Görsel genişletildi — daha doğal sonuç için görsel üretimini bağla');
      } catch (e) { UI.toast('Genişletilemedi: ' + e.message, true); }
      finally { note.remove(); }
    }
    async function genFill(l) {
      const ai = window.Features.imageReady();
      const k = Math.min(1, 1024 / Math.max(l.w, l.h));
      let src; try { src = await soloCanvas(l, k); } catch (e) { UI.toast(e.message, true); return; }
      const W = src.width, H = src.height, m = new Uint8ClampedArray(W * H);
      const sp = src.getContext('2d').getImageData(0, 0, W, H).data;
      let size = Math.round(Math.max(W, H) / 14);
      const res = await UI.dialog(`<div class="d-body mk-ed"><h3>${icon('sparkle')} Seçerek doldur</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">Değiştirmek istediğin yeri fırçayla boya. Ne olacağını yaz — <b>boş bırakırsan o bölge silinir</b> ve çevresiyle doldurulur.${ai ? '' : ' (Yapay zeka bağlı değil: yalnızca silme çalışır.)'}</p>
        <div class="me-stage"><canvas id="gfC" width="${W}" height="${H}"></canvas></div>
        <div class="prow"><span>Fırça</span><input type="range" id="gfS" min="4" max="${Math.round(Math.max(W, H) / 4)}" value="${size}"><output>${size}</output></div>
        <div class="ai-layer" style="margin-top:6px"><input class="inp" id="gfP" placeholder="${ai ? 'örn. vazoda kırmızı güller, mavi gökyüzü… (boş: sil)' : 'Yapay zeka bağlı değil — boyanan alan silinir'}" ${ai ? '' : 'disabled'}></div>
        <div class="iconrow" style="margin-top:6px"><button class="btn sm" id="gfClr">Seçimi temizle</button></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="gfGo">${icon('sparkle')}Uygula</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const cv = $('#gfC', box), x = cv.getContext('2d'), od = x.createImageData(W, H);
          const draw = () => { const o = od.data; for (let i = 0, j = 0; i < W * H; i++, j += 4) { const a = m[i] / 255 * 0.55; o[j] = sp[j] * (1 - a) + 226 * a; o[j + 1] = sp[j + 1] * (1 - a) + 25 * a; o[j + 2] = sp[j + 2] * (1 - a) + 124 * a; o[j + 3] = 255; } x.putImageData(od, 0, 0); };
          const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
          const dab = (px, py) => { const R0 = size / 2; for (let yy = Math.max(0, Math.floor(py - R0)); yy <= Math.min(H - 1, py + R0); yy++) for (let xx = Math.max(0, Math.floor(px - R0)); xx <= Math.min(W - 1, px + R0); xx++) if ((xx - px) ** 2 + (yy - py) ** 2 <= R0 * R0) m[yy * W + xx] = 255; };
          let down = false, last = null;
          cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); down = true; last = pt(e); dab(last.x, last.y); draw(); };
          cv.onpointermove = (e) => { if (!down) return; const p = pt(e), n = Math.max(1, Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / (size / 5))); for (let i = 1; i <= n; i++) dab(last.x + (p.x - last.x) * i / n, last.y + (p.y - last.y) * i / n); last = p; draw(); };
          cv.onpointerup = cv.onpointercancel = () => { down = false; };
          $('#gfS', box).oninput = (e) => { size = +e.target.value; e.target.nextElementSibling.textContent = size; };
          $('#gfClr', box).onclick = () => { m.fill(0); draw(); };
          $('#gfGo', box).onclick = () => { if (!m.some((v) => v)) return UI.toast('Önce değişecek yeri boya', true); close({ prompt: $('#gfP', box).value.trim() }); };
          draw();
        },
      });
      if (!res) return;
      // seçimin sınırları
      let x0 = W, y0 = H, x1 = 0, y1 = 0; for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (m[y * W + xx]) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const note = busyNote(res.prompt && ai ? 'Yapay zeka seçili alanı yeniden çiziyor… 15-60 sn' : 'Seçili alan dolduruluyor…');
      try {
        const out = document.createElement('canvas'); out.width = W; out.height = H; const ox = out.getContext('2d'); ox.drawImage(src, 0, 0);
        // yumuşak maske
        const mc = document.createElement('canvas'); mc.width = W; mc.height = H; const mx = mc.getContext('2d'), mid = mx.createImageData(W, H);
        for (let i = 0; i < W * H; i++) { mid.data[i * 4 + 3] = m[i]; }
        mx.putImageData(mid, 0, 0);
        const soft = document.createElement('canvas'); soft.width = W; soft.height = H; const sx2 = soft.getContext('2d'); sx2.filter = `blur(${Math.max(2, Math.round(size / 6))}px)`; sx2.drawImage(mc, 0, 0); sx2.drawImage(mc, 0, 0); sx2.filter = 'none';
        let patch;
        if (ai) {
          const bw = x1 - x0 + 1, bh = y1 - y0 + 1, padR = Math.max(bw, bh) * 0.6;
          let cx = x0 - padR, cy = y0 - padR, cw = bw + 2 * padR, ch = bh + 2 * padR;
          const pick = nearestRatio(cw / ch);
          if (cw / ch > pick[1]) { const nh = cw / pick[1]; cy -= (nh - ch) / 2; ch = nh; } else { const nw2 = ch * pick[1]; cx -= (nw2 - cw) / 2; cw = nw2; }
          cw = Math.min(cw, W); ch = Math.min(ch, H); cx = Math.max(0, Math.min(W - cw, cx)); cy = Math.max(0, Math.min(H - ch, cy));
          const ref = document.createElement('canvas'); ref.width = Math.round(cw); ref.height = Math.round(ch); const rx = ref.getContext('2d');
          rx.drawImage(src, cx, cy, cw, ch, 0, 0, ref.width, ref.height);
          rx.globalAlpha = 0.9; rx.fillStyle = '#FF00FF'; for (let y = Math.floor(cy); y < cy + ch; y++) for (let xx = Math.floor(cx); xx < cx + cw; xx++) if (m[y * W + xx]) rx.fillRect(xx - cx, y - cy, 1, 1); rx.globalAlpha = 1;
          const prompt = res.prompt
            ? `Edit this photo. The bright magenta area marks the region to change. In that region, paint: ${res.prompt}. Blend it naturally into the scene with matching lighting, perspective and style. Keep everything outside the magenta area exactly the same. No magenta may remain.`
            : 'Edit this photo. The bright magenta area marks an object to remove. Remove it completely and fill that area with a natural continuation of the surrounding background. Do not add anything new. Keep everything outside the magenta area exactly the same. No magenta may remain.';
          const r = await window.App.api('image-gen', { body: { prompt, aspect: pick[0], refs: [ref.toDataURL('image/png')], enhance: false } });
          const im = await loadImg(r.url);
          patch = document.createElement('canvas'); patch.width = W; patch.height = H; patch.getContext('2d').drawImage(im, cx, cy, cw, ch);
        } else {
          const pad = Math.max(x1 - x0, y1 - y0) * 0.5 + 8;
          const Rg = { x: Math.max(0, x0 - pad), y: Math.max(0, y0 - pad), w: Math.min(W, x1 + pad) - Math.max(0, x0 - pad), h: Math.min(H, y1 + pad) - Math.max(0, y0 - pad) };
          const filled = window.Tools.inpaintRegion(src, Rg, { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }, { all: true });
          patch = document.createElement('canvas'); patch.width = W; patch.height = H; const px2 = patch.getContext('2d');
          // kutunun tamamını çevreden doldur (yazı maskesi yerine tüm seçim)
          px2.filter = `blur(${Math.max(4, Math.round(Math.max(x1 - x0, y1 - y0) / 4))}px)`;
          px2.drawImage(filled, Rg.x, Rg.y); px2.filter = 'none';
        }
        // yalnızca maskeli bölgeyi al
        const pc = patch.getContext('2d'); pc.globalCompositeOperation = 'destination-in'; pc.drawImage(soft, 0, 0); pc.globalCompositeOperation = 'source-over';
        ox.drawImage(patch, 0, 0);
        const url = await uploadCanvas(out, 'secerek-doldur.png');
        if (!l.origSrc) l.origSrc = l.src;
        Object.assign(l, { src: url, fit: 'fill', zoom: 1, ox: 0, oy: 0, nw: W, nh: H }); delete l.crop;
        commit(); UI.toast(res.prompt && ai ? 'Seçili alan yeniden çizildi' : 'Seçili alan silindi ve dolduruldu');
      } catch (e) { UI.toast('Uygulanamadı: ' + e.message, true); }
      finally { note.remove(); }
    }

    // ---------- animasyon + video dışa aktarma
    const ANIMS = [['none', 'Yok'], ['fade', 'Belir'], ['up', 'Yukarı kay'], ['left', 'Sağdan gel'], ['right', 'Soldan gel'], ['zoom', 'Yakınlaş'], ['pop', 'Zıpla'], ['wipe', 'Silerek aç']];
    const ease = (t) => 1 - Math.pow(1 - t, 3), back = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const ANIM_STYLES = { dynamic: ['Dinamik', 0.16, 0.6], calm: ['Sakin', 0.35, 1.1], bouncy: ['Zıplayan', 0.14, 0.7], cinema: ['Sinematik', 0.5, 1.4] };
    function autoAnimate(style = 'dynamic') {
      const vis = doc.layers.filter((l) => l.visible !== false && l.type !== 'adjust');
      const [, gap, dur] = ANIM_STYLES[style] || ANIM_STYLES.dynamic;
      let t = 0;
      vis.forEach((l) => {
        const big = l.w * l.h > doc.width * doc.height * 0.5;
        let type = big ? 'fade' : l.type === 'text' ? (l.fontSize > doc.height * 0.06 ? 'up' : 'fade') : l.type === 'image' ? 'zoom' : 'pop';
        if (style === 'bouncy' && !big) type = 'pop';
        if (style === 'calm' && !big) type = l.type === 'text' ? 'fade' : 'zoom';
        if (style === 'cinema' && !big) type = l.type === 'text' ? 'wipe' : 'fade';
        l.anim = { type, delay: +t.toFixed(2), dur: big ? dur : dur + 0.1 };
        if (!big) t += gap;
      });
      doc.meta = doc.meta || {}; doc.meta.animStyle = style;
    }
    const animPanel = (l) => { const a = l.anim || {}; return `<div class="grp"><h4>Animasyon<button class="btn ghost sm" data-act="animPlay">${icon('eye')}Oynat</button></h4><div class="anim-row">${ANIMS.map(([k, t]) => `<button class="${(a.type || 'none') === k ? 'on' : ''}" data-anim="${k}">${t}</button>`).join('')}</div>${a.type && a.type !== 'none' ? range('anim.delay', 'Gecikme (sn)', 0, 6, 0.05, l, 0) + range('anim.dur', 'Süre (sn)', 0.2, 3, 0.05, l, 0.7) : ''}</div>`; };
    async function buildFrames(scale) {
      const W = Math.round(doc.width * scale), H = Math.round(doc.height * scale);
      const bg = await R.exportCanvas({ width: doc.width, height: doc.height, background: doc.background, layers: [] }, scale);
      const parts = [];
      for (const l of doc.layers) {
        if (l.visible === false || l.type === 'adjust') continue;
        const c = await R.exportCanvas({ width: doc.width, height: doc.height, background: 'transparent', layers: [l] }, scale);
        parts.push({ l, c, a: l.anim && l.anim.type && l.anim.type !== 'none' ? l.anim : null });
      }
      const total = Math.max((doc.meta && +doc.meta.animLen) || 0, Math.max(1.2, ...parts.map((p) => (p.a ? (+p.a.delay || 0) + (+p.a.dur || 0.7) : 0))) + 1.8);
      const drawAt = (ctx, t) => {
        ctx.clearRect(0, 0, W, H); ctx.drawImage(bg, 0, 0);
        for (const p of parts) {
          let alpha = 1, dx = 0, dy = 0, sc = 1, wipe = 1;
          if (p.a) {
            const raw = Math.max(0, Math.min(1, (t - (+p.a.delay || 0)) / (+p.a.dur || 0.7))), e = ease(raw);
            const ty = p.a.type;
            if (raw <= 0) continue;
            if (ty === 'fade') alpha = e;
            if (ty === 'up') { alpha = e; dy = (1 - e) * H * 0.06; }
            if (ty === 'left') { alpha = e; dx = (1 - e) * W * 0.12; }
            if (ty === 'right') { alpha = e; dx = -(1 - e) * W * 0.12; }
            if (ty === 'zoom') { alpha = e; sc = 0.86 + 0.14 * e; }
            if (ty === 'pop') { alpha = Math.min(1, raw * 2.5); sc = Math.max(0.01, back(raw)); }
            if (ty === 'wipe') wipe = e;
          }
          const L = p.l, cx = (L.x + L.w / 2) * scale, cy = (L.y + L.h / 2) * scale;
          ctx.save(); ctx.globalAlpha = alpha;
          if (wipe < 1) { ctx.beginPath(); ctx.rect((L.x - 4) * scale, 0, (L.w + 8) * scale * wipe, H); ctx.clip(); }
          ctx.translate(cx + dx, cy + dy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
          ctx.drawImage(p.c, 0, 0); ctx.restore();
        }
      };
      return { W, H, total, drawAt };
    }
    st.buildFrames = (sc) => buildFrames(sc);
    async function animDialog() {
      if (!doc.layers.some((l) => l.anim && l.anim.type && l.anim.type !== 'none')) autoAnimate((doc.meta && doc.meta.animStyle) || 'dynamic');
      commit();
      const note = busyNote('Animasyon hazırlanıyor…');
      let F;
      try { F = await buildFrames(Math.min(1, 720 / Math.max(doc.width, doc.height))); } catch (e) { note.remove(); UI.toast(e.message, true); return; }
      note.remove();
      let raf2 = 0;
      await UI.dialog(`<div class="d-body"><h3>${icon('eye')} Animasyon ve video</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Her katmana ayrı animasyon verebilirsin: katmanı seç → sağ panel → <b>Animasyon</b>. Süre: ${F.total.toFixed(1)} sn.</p>
        <div class="anim-stage"><canvas id="anC" width="${F.W}" height="${F.H}"></canvas></div>
        <div class="an-opts"><div><span class="aw-lbl">Hareket stili</span><div class="seg" id="anSt">${Object.entries(ANIM_STYLES).map(([k, [t]]) => `<button data-st="${k}" class="${((doc.meta && doc.meta.animStyle) || '') === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
        <div><span class="aw-lbl">Süre</span><div class="seg" id="anLen">${[[0, 'Otomatik'], [6, '6 sn'], [10, '10 sn'], [15, '15 sn']].map(([v, t]) => `<button data-len="${v}" class="${(+(doc.meta && doc.meta.animLen) || 0) === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
        <div><span class="aw-lbl">Müzik</span><div class="iconrow"><button class="btn sm" id="anMus">${icon('music')}<span id="anMusN">${st.music ? esc(st.music.name).slice(0, 22) : 'Müzik ekle'}</span></button>${st.music ? '<button class="btn ghost sm" id="anMusX">Kaldır</button>' : ''}</div></div></div>
        <div class="iconrow" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm" id="anClear">Animasyonları kaldır</button></div>
        <p class="muted" style="font-size:12px;margin:6px 0 0">Müzik videoya eklenir; telif hakkı olmayan ya da lisansını aldığın parçaları kullan.</p></div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="anGif">${icon('download')}GIF indir</button><button class="btn primary" id="anRec">${icon('download')}Video indir (MP4/WebM)</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const cv = $('#anC', box), ctx = cv.getContext('2d');
          let t0 = performance.now();
          const loop = (now) => { if (!document.body.contains(cv)) return; const t = ((now - t0) / 1000) % F.total; F.drawAt(ctx, t); raf2 = requestAnimationFrame(loop); };
          raf2 = requestAnimationFrame(loop);
          const rebuild = async () => { cancelAnimationFrame(raf2); F = await buildFrames(Math.min(1, 720 / Math.max(doc.width, doc.height))); t0 = performance.now(); raf2 = requestAnimationFrame(loop); };
          $$('#anSt button', box).forEach((b) => (b.onclick = async () => { autoAnimate(b.dataset.st); commit(); $$('#anSt button', box).forEach((x) => x.classList.toggle('on', x === b)); await rebuild(); }));
          $$('#anLen button', box).forEach((b) => (b.onclick = async () => { doc.meta = doc.meta || {}; doc.meta.animLen = +b.dataset.len; commit(); $$('#anLen button', box).forEach((x) => x.classList.toggle('on', x === b)); await rebuild(); }));
          $('#anMus', box).onclick = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'audio/*'; inp.onchange = async () => { const f = inp.files[0]; if (!f) return; try { const ac = new (window.AudioContext || window.webkitAudioContext)(); st.music = { name: f.name, buf: await ac.decodeAudioData(await f.arrayBuffer()) }; ac.close(); $('#anMusN', box).textContent = f.name.slice(0, 22); UI.toast('Müzik eklendi'); } catch (e) { UI.toast('Ses dosyası okunamadı', true); } }; inp.click(); };
          const mx = $('#anMusX', box); if (mx) mx.onclick = (e) => { st.music = null; $('#anMusN', box).textContent = 'Müzik ekle'; e.currentTarget.remove(); };
          $('#anClear', box).onclick = async () => { doc.layers.forEach((l) => delete l.anim); commit(); await rebuild(); };
          $('#anRec', box).onclick = async () => { cancelAnimationFrame(raf2); close(); await recordVideo(); };
          $('#anGif', box).onclick = async () => { cancelAnimationFrame(raf2); close(); if (window.P10) await window.P10.gif(); };
        },
      });
      cancelAnimationFrame(raf2);
    }
    async function recordVideo() {
      if (typeof MediaRecorder === 'undefined') { UI.toast('Bu tarayıcı video kaydını desteklemiyor', true); return; }
      const note = busyNote('Video kaydediliyor…');
      try {
        const sc = Math.min(2, 1080 / Math.min(doc.width, doc.height), 1920 / Math.max(doc.width, doc.height));
        const F = await buildFrames(sc);
        const c = document.createElement('canvas'); c.width = F.W - (F.W % 2); c.height = F.H - (F.H % 2);
        const ctx = c.getContext('2d');
        const types = ['video/mp4;codecs=avc1.42E01F', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
        const mime = types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
        const stream = c.captureStream(30);
        let ac = null, srcN = null;
        if (st.music) { ac = new (window.AudioContext || window.webkitAudioContext)(); const dest = ac.createMediaStreamDestination(), gain = ac.createGain(); srcN = ac.createBufferSource(); srcN.buffer = st.music.buf; srcN.loop = true; srcN.connect(gain).connect(dest); gain.gain.setValueAtTime(1, ac.currentTime); gain.gain.setValueAtTime(1, ac.currentTime + Math.max(0, F.total - 1)); gain.gain.linearRampToValueAtTime(0, ac.currentTime + F.total); dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t)); }
        const mime2 = st.music ? (['video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t)) || mime) : mime;
        const rec = new MediaRecorder(stream, { mimeType: mime2, videoBitsPerSecond: 8_000_000 });
        const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        const done = new Promise((res) => (rec.onstop = res));
        F.drawAt(ctx, 0); rec.start(250); if (srcN) srcN.start();
        const start = performance.now();
        await new Promise((res) => { const step = (now) => { const t = (now - start) / 1000; F.drawAt(ctx, Math.min(t, F.total)); note.lastChild.innerHTML = `<b>Video kaydediliyor… ${Math.min(100, Math.round((t / F.total) * 100))}%</b>`; if (t < F.total) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
        rec.stop(); await done; if (srcN) { try { srcN.stop(); } catch (e) {} } if (ac) ac.close();
        const ext = mime2.includes('mp4') ? 'mp4' : 'webm';
        await R.download(new Blob(chunks, { type: mime2.split(';')[0] || 'video/webm' }), (doc.name || 'animasyon') + '.' + ext);
        UI.toast(`Video hazır (${ext.toUpperCase()}, ${F.total.toFixed(1)} sn)`);
      } catch (e) { UI.toast('Video kaydedilemedi: ' + e.message, true); }
      finally { note.remove(); }
    }

    // ---------- QR kod
    async function qrDialog() {
      const brand = window.App.S.brand || {}, bc = (brand.colors || [])[0] || '#111111';
      const TYPES = [['url', 'Web sitesi'], ['menu', 'Menü / katalog'], ['wa', 'WhatsApp'], ['wifi', 'Wi‑Fi'], ['tel', 'Telefon'], ['mail', 'E‑posta'], ['map', 'Konum'], ['vcard', 'Kartvizit'], ['text', 'Düz metin']];
      const res = await UI.dialog(`<div class="d-body qr-d"><h3>${icon('qr')} QR kod</h3>
        <div class="chips" id="qrT">${TYPES.map(([k, t], i) => `<button class="chip${i === 0 ? ' on' : ''}" data-k="${k}">${t}</button>`).join('')}</div>
        <div class="qr-grid"><div id="qrF" class="qr-form"></div><div class="qr-prev"><svg id="qrP" viewBox="0 0 10 10"></svg><small id="qrInfo" class="muted"></small></div></div>
        <div class="qr-opts"><div class="seg" id="qrS"><button data-s="square" class="on">Kare</button><button data-s="rounded">Yuvarlak</button><button data-s="dots">Nokta</button></div>
        <label class="color" style="width:auto"><input type="color" id="qrC" value="${R.toHex(bc)}"><span>Renk</span></label><label class="switch"><input type="checkbox" id="qrBg" checked>Beyaz zemin</label></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="qrOk">${icon('plus')}Tasarıma ekle</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          let type = 'url', style = 'square';
          const F = { url: [['u', 'Adres', 'https://']], menu: [['u', 'Menü / katalog adresi', 'https://']], wa: [['n', 'Telefon (ülke koduyla)', '90 5xx xxx xx xx'], ['m', 'Hazır mesaj (isteğe bağlı)', 'Merhaba, sipariş vermek istiyorum']], wifi: [['s', 'Ağ adı (SSID)', ''], ['p', 'Şifre', ''], ['h', 'Güvenlik', 'WPA']], tel: [['n', 'Telefon', '+90 5xx xxx xx xx']], mail: [['e', 'E‑posta', 'ornek@firma.com'], ['sub', 'Konu', '']], map: [['q', 'Adres ya da yer adı', 'Kızılay Ankara']], vcard: [['fn', 'Ad Soyad', ''], ['org', 'Firma', brand.name || ''], ['tel', 'Telefon', brand.phone || ''], ['em', 'E‑posta', ''], ['web', 'Web', brand.web || '']], text: [['t', 'Metin', '']] };
          const vals = {};
          const payload = () => {
            const v = (k) => (vals[type + k] || '').trim();
            if (type === 'url' || type === 'menu') return v('u') && !/^https?:/i.test(v('u')) ? 'https://' + v('u') : v('u');
            if (type === 'wa') return v('n') ? `https://wa.me/${v('n').replace(/\D/g, '')}${v('m') ? '?text=' + encodeURIComponent(v('m')) : ''}` : '';
            if (type === 'wifi') return v('s') ? `WIFI:T:${v('h') || 'WPA'};S:${v('s').replace(/([\;,:"])/g, '\\$1')};P:${v('p').replace(/([\;,:"])/g, '\\$1')};;` : '';
            if (type === 'tel') return v('n') ? 'tel:' + v('n').replace(/[^\d+]/g, '') : '';
            if (type === 'mail') return v('e') ? `mailto:${v('e')}${v('sub') ? '?subject=' + encodeURIComponent(v('sub')) : ''}` : '';
            if (type === 'map') return v('q') ? 'https://maps.google.com/?q=' + encodeURIComponent(v('q')) : '';
            if (type === 'vcard') return v('fn') ? `BEGIN:VCARD\nVERSION:3.0\nFN:${v('fn')}\n${v('org') ? 'ORG:' + v('org') + '\n' : ''}${v('tel') ? 'TEL:' + v('tel') + '\n' : ''}${v('em') ? 'EMAIL:' + v('em') + '\n' : ''}${v('web') ? 'URL:' + v('web') + '\n' : ''}END:VCARD` : '';
            return v('t');
          };
          const form = () => { $('#qrF', box).innerHTML = F[type].map(([k, l, ph]) => `<label class="fld"><span>${l}</span><input class="inp" data-f="${k}" placeholder="${esc(ph)}" value="${esc(vals[type + k] ?? (k === 'h' ? 'WPA' : (type === 'vcard' ? ph : '')))}"></label>`).join(''); $$('[data-f]', box).forEach((i) => { vals[type + i.dataset.f] = i.value; i.oninput = () => { vals[type + i.dataset.f] = i.value; prev(); }; }); prev(); };
          let cur = null;
          const prev = () => {
            const t = payload(), sv = $('#qrP', box);
            if (!t) { sv.innerHTML = ''; $('#qrInfo', box).textContent = 'Bilgileri doldur'; cur = null; return; }
            try { const q = window.Tools.qr(t, 'M'), pth = window.Tools.qrPath(q, style, 2); cur = { pth, t }; sv.setAttribute('viewBox', `0 0 ${pth.size} ${pth.size}`); sv.innerHTML = `${$('#qrBg', box).checked ? `<rect width="${pth.size}" height="${pth.size}" fill="#fff"/>` : ''}<path d="${pth.d}" fill="${$('#qrC', box).value}"/>`; $('#qrInfo', box).textContent = `Sürüm ${q.version} · ${q.size}×${q.size} modül`; }
            catch (e) { $('#qrInfo', box).textContent = e.message; cur = null; }
          };
          $$('#qrT .chip', box).forEach((b) => (b.onclick = () => { type = b.dataset.k; $$('#qrT .chip', box).forEach((x) => x.classList.toggle('on', x === b)); form(); }));
          $$('#qrS button', box).forEach((b) => (b.onclick = () => { style = b.dataset.s; $$('#qrS button', box).forEach((x) => x.classList.toggle('on', x === b)); prev(); }));
          $('#qrC', box).oninput = prev; $('#qrBg', box).onchange = prev;
          $('#qrOk', box).onclick = () => { if (!cur) return UI.toast('Önce bilgileri doldur', true); const c = $('#qrC', box).value, bg = $('#qrBg', box).checked; if (T_lum(c) > 0.55 && bg) UI.toast('Açık renkli QR okunmayabilir — koyu bir renk seç', true); close({ ...cur, color: c, bg, type }); };
          form();
        },
      });
      if (!res) return;
      const S2 = Math.round(Math.min(doc.width, doc.height) * 0.28), sl = one();
      const x = sl ? sl.x + sl.w - S2 : doc.width - S2 - doc.width * 0.06, y = sl ? sl.y + sl.h + 12 : doc.height - S2 - doc.height * 0.06, g = R.uid();
      if (res.bg) addLayer({ type: 'rect', name: 'QR zemin', group: g, x, y, w: S2, h: S2, fill: '#FFFFFF', radius: S2 * 0.06 }, false);
      addLayer({ type: 'path', name: 'QR kod', role: 'qr', group: g, d: res.pth.d, vw: res.pth.size, vh: res.pth.size, x, y, w: S2, h: S2, fill: res.color, qr: { text: res.t, type: res.type } });
      UI.toast('QR kod eklendi — telefon kamerasıyla okutup dene');
    }
    const T_lum = (h) => window.Tools.lum(h);

    // ---------- ön kontrol: okunabilirlik + matbaa
    async function preflight() {
      const issues = [];
      const add = (sev, cat, text, l, fix) => issues.push({ sev, cat, text, l, fix });
      if (window.P9) { window.P9.qualityIssues(doc).forEach((q) => add('warn', 'Görsel kalitesi', q.msg + ' — daha büyük bir fotoğrafla değiştir.', q.l)); window.P9.spellIssues(doc).forEach((q) => add('warn', 'Yazım', q.msg, q.l)); }
      const fixes = await window.Tools.autoFixAsync(doc, { apply: false });
      fixes.filter((f) => !/kontrast|ayrışm/i.test(f)).forEach((f) => add('warn', 'Yerleşim', f.replace(/, (rengi|boyutu|yeri)?[^,]*(yapıldı|küçültüldü|taşındı|düzeltildi)\.?$/i, ''), null, 'autofix'));
      const minSide = Math.min(doc.width, doc.height);
      const k = Math.min(1, 900 / Math.max(doc.width, doc.height));
      for (const l of doc.layers) {
        if (l.visible === false || l.type !== 'text' || !R.plain(l.text).trim()) continue;
        // arka plan rengi: yazı dışındaki her şeyi çiz, kutudan örnekle
        try {
          const others = { ...doc, layers: doc.layers.slice(0, doc.layers.indexOf(l)).filter((x) => x.visible !== false) };
          const c = await R.exportCanvas(others, k), cx = c.getContext('2d');
          const bx = Math.max(0, Math.floor(l.x * k)), by = Math.max(0, Math.floor(l.y * k)), bw = Math.max(1, Math.min(c.width - bx, Math.ceil(l.w * k))), bh = Math.max(1, Math.min(c.height - by, Math.ceil(l.h * k)));
          const d = cx.getImageData(bx, by, bw, bh).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          const bg = '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
          const fg = typeof l.fill === 'string' ? R.parseColor(l.fill).hex : null;
          if (fg && !l.stroke && !(l.shadow && l.shadow.blur)) {
            const cr = window.Tools.contrast(fg, bg), big = l.fontSize >= minSide * 0.05;
            if (cr < (big ? 3 : 4.5)) add(cr < 2 ? 'err' : 'warn', 'Okunabilirlik', `“${R.plain(l.text).slice(0, 28)}” zeminle yeterince ayrışmıyor (kontrast ${cr.toFixed(1)}:1, en az ${big ? 3 : 4.5}:1 olmalı)`, l, { kind: 'contrast', bg });
          }
        } catch (e) {}
        if (l.fontSize < minSide * 0.022) add('warn', 'Okunabilirlik', `“${R.plain(l.text).slice(0, 28)}” telefonda çok küçük görünebilir (${Math.round(l.fontSize)} px)`, l, { kind: 'small' });
        const m = minSide * 0.035;
        if (l.x < m || l.y < m || l.x + l.w > doc.width - m || l.y + l.h > doc.height - m) add('info', 'Kenar güvenliği', `“${R.plain(l.text).slice(0, 28)}” kenara çok yakın — kesimde ya da profil çerçevesinde kesilebilir`, l, { kind: 'margin' });
      }
      // matbaa
      const mm = (doc.meta && doc.meta.mm) || null;
      const pxPerIn = mm ? doc.width / (mm.w / 25.4) : doc.width / (210 / 25.4);
      for (const l of doc.layers) {
        if (l.visible === false) continue;
        if (l.type === 'image' && l.nw && !/^data:image\/svg/.test(l.src || '')) {
          const z = Math.max(1, +l.zoom || 1), dispW = (l.fit === 'contain' ? Math.min(l.w / l.nw, l.h / l.nh) : Math.max(l.w / l.nw, l.h / l.nh)) * l.nw * z;
          const dpi = (l.nw / (dispW / pxPerIn));
          if (dpi < 150) add(dpi < 100 ? 'err' : 'warn', 'Matbaa', `“${l.name || 'Görsel'}” baskıda bulanık çıkar: ~${Math.round(dpi)} DPI (${mm ? mm.w + '×' + mm.h + ' mm' : 'A4'} için en az 300 önerilir)`, l, null);
        }
        const cols = [l.fill, l.stroke, l.color].filter((c) => typeof c === 'string' && /^#|rgb/i.test(c));
        cols.forEach((c) => { if (window.Tools.outOfCMYK(R.parseColor(c).hex)) add('info', 'Matbaa', `“${l.name || R.TYPE_NAMES[l.type]}” rengi (${R.parseColor(c).hex}) baskıda (CMYK) daha soluk çıkabilir`, l, { kind: 'cmyk', c }); });
        if (+l.strokeWidth > 0 && l.stroke && l.stroke !== 'none' && (l.strokeWidth / pxPerIn) * 72 < 0.3) add('warn', 'Matbaa', `“${l.name || 'Çizgi'}” kenar çizgisi baskıda kaybolabilecek kadar ince`, l, { kind: 'hair' });
      }
      const edgeL = doc.layers.filter((l) => l.visible !== false && (l.type === 'image' || l.type === 'rect') && (l.x <= 0.5 || l.y <= 0.5 || l.x + l.w >= doc.width - 0.5 || l.y + l.h >= doc.height - 0.5) && (l.x > -1 && l.y > -1 && l.x + l.w < doc.width + 1 && l.y + l.h < doc.height + 1));
      if (edgeL.length) add('info', 'Matbaa', `Kenara değen ${edgeL.length} öğe var: matbaa için 3 mm taşma payı (bleed) eklenmeli`, edgeL[0], { kind: 'bleed', ls: edgeL });
      const order = { err: 0, warn: 1, info: 2 };
      issues.sort((a, b) => order[a.sev] - order[b.sev]);
      const cats = [...new Set(issues.map((i) => i.cat))];
      const score = Math.max(0, 100 - issues.reduce((s2, i) => s2 + (i.sev === 'err' ? 18 : i.sev === 'warn' ? 8 : 3), 0));
      await UI.dialog(`<div class="d-body pf-d"><h3>${icon('shield')} Ön kontrol</h3>
        <div class="pf-score"><b class="${score >= 85 ? 'ok' : score >= 60 ? 'mid' : 'bad'}">${score}</b><span>${issues.length ? `${issues.filter((i) => i.sev === 'err').length} kritik · ${issues.filter((i) => i.sev === 'warn').length} uyarı · ${issues.filter((i) => i.sev === 'info').length} öneri` : 'Her şey yolunda: okunaklı, güvenli alanda, baskıya hazır.'}</span></div>
        ${cats.map((c) => `<div class="pf-cat"><h4>${c}</h4>${issues.filter((i) => i.cat === c).map((i) => `<div class="pf-it ${i.sev}" data-ix="${issues.indexOf(i)}"><i></i><span>${esc(i.text)}</span>${i.l ? `<button class="btn ghost sm" data-sel>Göster</button>` : ''}${i.fix ? `<button class="btn sm" data-fix>Düzelt</button>` : ''}</div>`).join('')}</div>`).join('')}
        <p class="muted" style="font-size:12px;margin-top:10px">Matbaa kontrolleri ${mm ? `${mm.w}×${mm.h} mm` : 'A4 boyutu'} varsayılarak yapıldı. Ölçüyü “Matbaa çıktısı”ndan ayarlayabilirsin.</p></div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button>${issues.some((i) => i.fix) ? `<button class="btn primary" id="pfAll">${icon('wand')}Düzeltilebilenleri düzelt</button>` : ''}</div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const doFix = async (i) => {
            const f = i.fix, l = i.l;
            if (f === 'autofix') { await window.Tools.autoFixAsync(doc); return; }
            if (f.kind === 'contrast') l.fill = window.Tools.contrast('#FFFFFF', f.bg) >= window.Tools.contrast('#111111', f.bg) ? '#FFFFFF' : '#111111';
            if (f.kind === 'small') { l.fontSize = r1(Math.min(doc.width, doc.height) * 0.026); R.layoutText(l); }
            if (f.kind === 'margin') { const m = Math.min(doc.width, doc.height) * 0.045; l.x = Math.max(m, Math.min(doc.width - m - l.w, l.x)); l.y = Math.max(m, Math.min(doc.height - m - l.h, l.y)); }
            if (f.kind === 'hair') l.strokeWidth = Math.max(l.strokeWidth, (0.5 / 72) * pxPerIn);
            if (f.kind === 'cmyk') { const pc = R.parseColor(f.c); const [h, s2, li] = hsl(pc.hex); const nh = hslHex(h, Math.min(s2, 0.72), Math.min(li, 0.5)); ['fill', 'stroke', 'color'].forEach((kk) => { if (typeof l[kk] === 'string' && R.parseColor(l[kk]).hex === pc.hex) l[kk] = nh; }); }
            if (f.kind === 'bleed') { const b = (3 / 25.4) * pxPerIn; f.ls.forEach((x) => { if (x.x <= 0.5) { x.x -= b; x.w += b; } if (x.y <= 0.5) { x.y -= b; x.h += b; } if (x.x + x.w >= doc.width - 0.5) x.w += b; if (x.y + x.h >= doc.height - 0.5) x.h += b; }); }
          };
          $$('.pf-it', box).forEach((row) => {
            const i = issues[+row.dataset.ix];
            const sb = $('[data-sel]', row); if (sb) sb.onclick = () => { close(); select([i.l.id]); };
            const fb = $('[data-fix]', row); if (fb) fb.onclick = async () => { await doFix(i); commit(); row.classList.add('done'); fb.remove(); };
          });
          const all = $('#pfAll', box); if (all) all.onclick = async () => { for (const i of issues) if (i.fix) await doFix(i); commit(); close(); UI.toast('Düzeltmeler uygulandı'); };
        },
      });
    }
    function hslHex(h, s2, l) { const a = s2 * Math.min(l, 1 - l), f = (n) => { const k2 = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k2 - 3, 9 - k2, 1)))).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); }

    // ---------- yorumlar ve onay
    const review = () => { doc.meta = doc.meta || {}; doc.meta.review = doc.meta.review || { status: 'draft', comments: [] }; return doc.meta.review; };
    const STATUS = { draft: ['Taslak', '#94A3B8'], review: ['Onay bekliyor', '#F59E0B'], changes: ['Düzeltme istendi', '#EF4444'], approved: ['Onaylandı', '#22C55E'] };
    const reviewPanel = () => {
      const rv = (doc.meta && doc.meta.review) || { status: 'draft', comments: [] }, open = rv.comments.filter((c) => !c.done);
      return `<div class="grp"><h4>Onay ve yorumlar<span class="muted" style="font-weight:400">${open.length ? open.length + ' açık yorum' : ''}</span></h4>
        <div class="rv-status">${Object.entries(STATUS).map(([k, [t, c]]) => `<button data-rs="${k}" class="${rv.status === k ? 'on' : ''}" style="--c:${c}"><i></i>${t}</button>`).join('')}</div>
        ${rv.comments.length ? `<div class="rv-list">${rv.comments.map((c, i) => `<div class="rv-c${c.done ? ' done' : ''}" data-ci="${i}"><b>${i + 1}</b><span><small>${esc(c.author || 'Ben')} · ${new Date(c.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>${esc(c.text)}</span><button class="lb" data-cdone="${i}" title="${c.done ? 'Yeniden aç' : 'Çözüldü'}">${icon('check')}</button></div>`).join('')}</div>` : ''}
        <div class="iconrow" style="margin-top:6px"><button class="btn sm" data-rv="add">${icon('chat')}Yorum ekle</button><button class="btn sm" data-rv="link">${icon('share')}Onaya gönder</button></div>
        <label class="fld rv-client"><span>Müşteri (portalda bu isimle görünür)</span><div class="iconrow"><input class="inp" id="rvClient" value="${esc((doc.meta && doc.meta.client) || '')}" placeholder="örn. Lezzet Durağı"><button class="btn sm" data-rv="portal" title="Müşteri portalı bağlantısı">${icon('share')}Portal</button></div></label></div>`;
    };
    function startComment() { st.commenting = true; vp.classList.add('commenting'); UI.toast('Tasarımda yorum bırakmak istediğin yere tıkla'); }
    async function placeComment(p) {
      st.commenting = false; vp.classList.remove('commenting');
      await new Promise((r) => setTimeout(r, 180));
      const t = await UI.promptBox('Yorum ekle', '', 'Ekle', 'örn. Logo biraz daha büyük olsun');
      if (!t) return;
      const author = (window.App.S.settings && window.App.S.settings.user_name) || 'Ben';
      review().comments.push({ id: R.uid(), x: r1(p.x), y: r1(p.y), text: t, author, at: Date.now(), done: false });
      st.tab = 'props'; commit();
    }
    async function sendForReview() {
      review().status = 'review'; commit();
      if (cb.onSaveQuiet) await cb.onSaveQuiet();
      let base = location.origin;
      try { const info = await window.App.api('info'); if (/localhost|127\.0\.0\.1/.test(base) && info.urls && info.urls[0]) base = info.urls[0].replace(/\/$/, ''); } catch (e) {}
      const link = `${base}/#/onizleme/${window.App.S.project.id}`;
      try { await navigator.clipboard.writeText(link); } catch (e) {}
      UI.dialog(`<div class="d-body"><h3>${icon('share')} Onaya gönderildi</h3><p class="muted">Bu bağlantıyı onaylayacak kişiye gönder. Aynı Wi‑Fi'deyken açar, tasarımı görür, <b>Onayla</b> ya da <b>Düzeltme iste</b> der ve yorum bırakır.</p><input class="inp" readonly value="${esc(link)}" onclick="this.select()"><p class="muted" style="font-size:12px">Bağlantı panoya kopyalandı.</p></div>
        <div class="d-foot"><a class="btn" href="https://wa.me/?text=${encodeURIComponent('Tasarımı onaylar mısın? ' + link)}" target="_blank" rel="noopener">WhatsApp ile gönder</a><button class="btn primary" data-close>Tamam</button></div>`);
    }

    // ---------- sürümler ve karşılaştırma
    async function saveVersion() {
      const name = await UI.promptBox('Sürüm adı', 'Sürüm ' + ((doc.versions || []).filter((v) => v.named).length + 1), 'Kaydet', 'örn. Müşteriye ilk gönderilen');
      if (!name) return;
      const P = doc; P.versions = P.versions || [];
      P.versions.forEach((v) => (v.current = false));
      P.versions.push({ design: window.App.designOf(P), thumb: await R.thumbnail(P, 200), label: name, current: true, t: Date.now(), named: true });
      if (P.versions.length > 30) P.versions.splice(0, P.versions.length - 30);
      commit(); UI.toast(`“${name}” kaydedildi`);
      if (st.tab === 'hist') renderHistory();
    }
    async function compareDialog(aDoc, aLabel) {
      const cur = JSON.parse(snap());
      const A2 = aDoc || cur, P = doc;
      const vs = (P.versions || []).slice().reverse();
      const opts = [['__cur', 'Şu anki hali'], ...st.hist.map((h, i) => ['h' + i, `Adım ${i + 1}: ${(st.hmeta[i] || {}).t || ''}`]).reverse().slice(0, 40), ...vs.map((v, i) => ['v' + i, 'Sürüm: ' + v.label])];
      const get = (k) => (k === '__cur' ? cur : k[0] === 'h' ? JSON.parse(st.hist[+k.slice(1)]) : R.normalize(JSON.parse(JSON.stringify(vs[+k.slice(1)].design))));
      const left0 = aDoc ? null : (vs.length ? 'v0' : st.hist.length > 1 ? 'h0' : '__cur');
      await UI.dialog(`<div class="d-body cmp-d"><h3>${icon('compare')} Karşılaştır</h3>
        <div class="cmp-sel"><select class="inp" id="cmpA">${opts.map(([k, t]) => `<option value="${k}" ${k === left0 ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><span>↔</span><select class="inp" id="cmpB">${opts.map(([k, t]) => `<option value="${k}" ${k === '__cur' ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>
        <div class="seg" id="cmpM" style="margin:8px 0"><button data-m="side" class="on">Yan yana</button><button data-m="slide">Kaydırmalı</button></div>
        <div class="cmp-stage" id="cmpS"></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn" id="cmpRestore">${icon('undo')}Soldakini geri yükle</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          let mode = 'side';
          const draw = async () => {
            const a = aDoc && !$('#cmpA', box).dataset.touched ? A2 : get($('#cmpA', box).value), b = get($('#cmpB', box).value);
            const [ta, tb] = await Promise.all([R.thumbnail(a, 900), R.thumbnail(b, 900)]);
            const S3 = $('#cmpS', box);
            if (mode === 'side') S3.innerHTML = `<div class="cmp-side"><figure><img src="${ta}"><figcaption>${esc($('#cmpA', box).selectedOptions[0].text)}</figcaption></figure><figure><img src="${tb}"><figcaption>${esc($('#cmpB', box).selectedOptions[0].text)}</figcaption></figure></div>`;
            else { S3.innerHTML = `<div class="cmp-slide"><img src="${tb}"><div class="cmp-a" style="width:50%"><img src="${ta}"></div><i class="cmp-h" style="left:50%"></i><input type="range" min="0" max="100" value="50"></div>`; const rg = $('input', S3), aa = $('.cmp-a', S3), hh = $('.cmp-h', S3), img2 = $('.cmp-a img', S3); const sync = () => { aa.style.width = rg.value + '%'; hh.style.left = rg.value + '%'; img2.style.width = S3.querySelector('.cmp-slide').clientWidth + 'px'; }; rg.oninput = sync; requestAnimationFrame(sync); }
          };
          $('#cmpA', box).onchange = () => { $('#cmpA', box).dataset.touched = 1; draw(); }; $('#cmpB', box).onchange = draw;
          $$('#cmpM button', box).forEach((b) => (b.onclick = () => { mode = b.dataset.m; $$('#cmpM button', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
          $('#cmpRestore', box).onclick = () => { const a = get($('#cmpA', box).value); close(); restore(JSON.stringify({ width: a.width, height: a.height, background: a.background, layers: a.layers })); commit(); UI.toast('Seçilen hal geri yüklendi — Geçmiş’ten geri alabilirsin'); };
          draw();
        },
      });
    }

    // ---------- yazı tipini tanı (fotoğraftaki yazıdan)
    async function fontMatch(l) {
      const k = Math.min(1, 1200 / Math.max(l.w, l.h));
      let src; try { src = await soloCanvas(l, k); } catch (e) { UI.toast(e.message, true); return; }
      const box0 = await UI.dialog(`<div class="d-body mk-ed"><h3>${icon('font')} Yazı tipini tanı</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Fotoğraftaki yazının çevresine bir kutu çiz. Yapay zeka yazı tipini tanır ve bilgisayarındaki en yakın yazı tiplerini önerir.</p>
        <div class="me-stage" style="position:relative"><canvas id="fmC" width="${src.width}" height="${src.height}"></canvas></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="fmGo">${icon('sparkle')}Tanı</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const cv = $('#fmC', box), x = cv.getContext('2d'); let rb = null, a = null;
          const draw = () => { x.drawImage(src, 0, 0); if (rb) { x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(src, rb.x, rb.y, rb.w, rb.h, rb.x, rb.y, rb.w, rb.h); x.strokeStyle = '#E2197C'; x.lineWidth = Math.max(2, cv.width / 300); x.strokeRect(rb.x, rb.y, rb.w, rb.h); } };
          const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
          cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); a = pt(e); rb = null; };
          cv.onpointermove = (e) => { if (!a) return; const p = pt(e); rb = { x: Math.min(a.x, p.x), y: Math.min(a.y, p.y), w: Math.abs(p.x - a.x), h: Math.abs(p.y - a.y) }; draw(); };
          cv.onpointerup = () => { a = null; };
          $('#fmGo', box).onclick = () => { const r = rb && rb.w > 8 && rb.h > 6 ? rb : { x: 0, y: 0, w: cv.width, h: cv.height }; const c = document.createElement('canvas'); c.width = Math.round(r.w); c.height = Math.round(r.h); c.getContext('2d').drawImage(src, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height); close(c.toDataURL('image/png')); };
          draw();
        },
      });
      if (!box0) return;
      const fonts = [...R.FONTS, ...((window.App.S.fonts || []).map((f) => f.family || f.name).filter(Boolean))];
      const note = busyNote('Yazı tipi tanınıyor…');
      let r;
      try { r = await window.App.api('font-match', { body: { data: box0, fonts } }); }
      catch (e) { note.remove(); UI.toast(e.message, true); return; }
      note.remove();
      const ms = (r.matches || []).filter((m) => m.font);
      await UI.dialog(`<div class="d-body"><h3>${icon('font')} ${r.name ? esc(r.name) : 'Yazı tipi'} ${r.category ? `<small class="muted">· ${esc(r.category)}</small>` : ''}</h3>
        ${r.text ? `<p class="muted" style="margin:0 0 6px">Okunan yazı: “${esc(r.text)}”</p>` : ''}${r.note ? `<p class="muted" style="font-size:12px">${esc(r.note)}</p>` : ''}
        <div class="fm-list">${ms.map((m, i) => `<button class="fm-it" data-i="${i}"><span style="font-family:'${esc(m.font)}';font-weight:${+m.weight || 400};${m.italic ? 'font-style:italic;' : ''}">${esc(r.text || 'Örnek Yazı 123')}</span><small>${esc(m.font)} · ${+m.weight || 400}${m.why ? ' · ' + esc(m.why) : ''}</small></button>`).join('') || '<p class="muted">Uygun eşleşme bulunamadı.</p>'}</div>
        ${r.name && !fonts.includes(r.name) ? `<p class="muted" style="font-size:12px">Orijinal yazı tipi (${esc(r.name)}) bilgisayarında yok. Lisanslı/ücretsiz dosyasını bulursan Öğeler → Font yükle ile ekleyebilirsin.</p>` : ''}</div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
        onOpen: (box, close) => $$('.fm-it', box).forEach((b) => (b.onclick = () => {
          const m = ms[+b.dataset.i]; close();
          const tl = doc.layers.filter((t) => st.sel.includes(t.id) && t.type === 'text');
          if (tl.length) { tl.forEach((t) => { t.fontFamily = m.font; t.fontWeight = +m.weight || 400; t.italic = !!m.italic; R.layoutText(t); }); commit(); }
          else { const t = addLayer({ type: 'text', name: 'Metin', text: r.text || 'Yeni yazı', x: l.x + 20, y: l.y + 20, w: l.w * 0.8, fontSize: Math.round(Math.min(doc.width, doc.height) * 0.06), fontFamily: m.font, fontWeight: +m.weight || 400, italic: !!m.italic, fill: r.color && /^#[0-9a-f]{6}$/i.test(r.color) ? r.color : '#111111', align: 'left' }); st.sel = [t.id]; }
          UI.toast(`${m.font} uygulandı`);
        })),
      });
    }

    // ---------- bağlı formatlar: metin ve görselleri diğer ölçülere aktar
    async function syncLinked() {
      const g = doc.meta && doc.meta.linkGroup; if (!g) return;
      let list = []; try { list = await window.App.api('projects'); } catch (e) {}
      const sibs = list.filter((p) => p.meta && p.meta.linkGroup === g && p.id !== window.App.S.project.id);
      if (!sibs.length) return UI.toast('Bağlı başka format bulunamadı');
      const key = (l) => l.role || l.name || '';
      const src = new Map(doc.layers.filter((l) => key(l)).map((l) => [key(l), l]));
      let changed = 0;
      for (const s0 of sibs) {
        const p = await window.App.api('projects/' + s0.id); R.normalize(p);
        let c = 0;
        p.layers.forEach((t) => {
          const m = src.get(key(t)); if (!m || m.type !== t.type) return;
          if (t.type === 'text' && t.text !== m.text) { R.layoutText(t); const ol = t._lines.length, ow = t.w; t.text = m.text; t.fill = m.fill; fitAfterChange(t, ol, ow); c++; }
          if (t.type === 'image' && t.src !== m.src) { t.src = m.src; t.origSrc = m.origSrc; c++; }
          if ((t.type === 'rect' || t.type === 'ellipse' || t.type === 'path') && JSON.stringify(t.fill) !== JSON.stringify(m.fill)) { t.fill = m.fill; c++; }
        });
        if (JSON.stringify(p.background) !== JSON.stringify(doc.background)) { p.background = JSON.parse(JSON.stringify(doc.background)); c++; }
        if (c) { p.thumb = await R.thumbnail(p); await window.App.api('projects', { body: p }); changed++; }
      }
      UI.toast(changed ? `${changed} bağlı format güncellendi` : 'Bağlı formatlar zaten güncel');
    }

    // ---------- sütun ızgarası
    function gridCols() {
      const g = doc.meta && doc.meta.grid; if (!g || !(+g.cols > 0)) return [];
      const m = +g.margin || 0, gut = +g.gutter || 0, n = Math.round(+g.cols), w = (doc.width - 2 * m - gut * (n - 1)) / n;
      if (w <= 0) return [];
      return Array.from({ length: n }, (_, i) => ({ x: m + i * (w + gut), w }));
    }
    const gridPanel = () => { const g = (doc.meta && doc.meta.grid) || {}; return `<div class="grp"><h4>Sütun ızgarası<label class="switch"><input type="checkbox" id="gridOn" ${g.show ? 'checked' : ''}>Göster</label></h4>${g.show ? `${range('meta.grid.cols', 'Sütun', 1, 24, 1, doc, 12)}${range('meta.grid.gutter', 'Ara boşluk', 0, 120, 1, doc, 24)}${range('meta.grid.margin', 'Kenar payı', 0, 300, 1, doc, 60)}<p class="muted" style="font-size:12px;margin:4px 0 0">Taşırken öğeler sütun kenarlarına yapışır.</p>` : ''}</div>`; };

    // ---------- bileşenler (tekrar kullanılabilir öğe grupları)
    const comps = () => ((window.App.S.brand && window.App.S.brand.components) || []);
    async function saveComponent() {
      const ls = selected(); if (!ls.length) return;
      const name = await UI.promptBox('Bileşen adı', ls.length === 1 ? ls[0].name || 'Bileşen' : 'Bileşen ' + (comps().length + 1));
      if (!name) return;
      const b = unionBox(ls);
      const layers = doc.layers.filter((l) => ls.includes(l)).map((l) => { const c = JSON.parse(JSON.stringify(R.clean(l))); c.x -= b.x; c.y -= b.y; delete c.group; return c; });
      const sub = { width: Math.max(1, b.x2 - b.x), height: Math.max(1, b.y2 - b.y), background: 'transparent', layers };
      let thumb = ''; try { thumb = await R.thumbnail(sub, 160); } catch (e) {}
      const brand = window.App.S.brand || { enabled: false, colors: [] };
      const list = [{ id: R.uid(), name, w: sub.width, h: sub.height, layers, thumb }, ...comps()].slice(0, 60);
      try { window.App.S.brand = await window.App.api('brand', { body: { ...brand, components: list } }); UI.toast(`“${name}” bileşenlerine eklendi — Öğeler sekmesinden her tasarımda kullanabilirsin`); if (st.tab === 'assets') renderPanel(); }
      catch (e) { UI.toast(e.message, true); }
    }
    function insertComponent(c, at) {
      const g = c.layers.length > 1 ? R.uid() : null;
      const sc = Math.min(1, (doc.width * 0.8) / c.w, (doc.height * 0.8) / c.h);
      const ox = at ? at.x - (c.w * sc) / 2 : (doc.width - c.w * sc) / 2, oy = at ? at.y - (c.h * sc) / 2 : (doc.height - c.h * sc) / 2;
      const ids = [];
      c.layers.forEach((l0) => {
        const l = JSON.parse(JSON.stringify(l0)); l.id = R.uid(); if (g) l.group = g;
        l.x = ox + l.x * sc; l.y = oy + l.y * sc; l.w *= sc; l.h *= sc; if (l.type === 'text') { l.fontSize *= sc; R.layoutText(l); }
        if (l.strokeWidth) l.strokeWidth *= sc;
        l.component = c.id; doc.layers.push(l); ids.push(l.id);
      });
      st.sel = ids; commit();
    }
    async function deleteComponent(id) {
      const brand = window.App.S.brand || {};
      try { window.App.S.brand = await window.App.api('brand', { body: { ...brand, components: comps().filter((c) => c.id !== id) } }); renderPanel(); } catch (e) { UI.toast(e.message, true); }
    }
    async function updateComponentEverywhere() {
      // seçili bileşen örneğini kitaplıktaki tanıma yazar ve bu tasarımdaki diğer örnekleri günceller
      const ls = selected(); const cid = ls[0] && ls[0].component; if (!cid) return;
      const c = comps().find((x) => x.id === cid); if (!c) return UI.toast('Bileşen kitaplıkta bulunamadı', true);
      const grp = doc.layers.filter((l) => l.component === cid && (ls[0].group ? l.group === ls[0].group : l === ls[0]));
      const b = unionBox(grp);
      c.layers = grp.map((l) => { const x = JSON.parse(JSON.stringify(R.clean(l))); x.x -= b.x; x.y -= b.y; delete x.group; delete x.component; return x; });
      c.w = b.x2 - b.x; c.h = b.y2 - b.y;
      try { c.thumb = await R.thumbnail({ width: c.w, height: c.h, background: 'transparent', layers: c.layers }, 160); } catch (e) {}
      // bu tasarımdaki diğer örnekler
      const groups = {}; doc.layers.forEach((l) => { if (l.component === cid && !grp.includes(l)) (groups[l.group || l.id] = groups[l.group || l.id] || []).push(l); });
      Object.values(groups).forEach((inst) => {
        const ib = unionBox(inst), at = doc.layers.indexOf(inst[0]), g2 = inst[0].group;
        doc.layers = doc.layers.filter((l) => !inst.includes(l));
        const sc = (ib.x2 - ib.x) / c.w || 1;
        const fresh = c.layers.map((l0) => { const l = JSON.parse(JSON.stringify(l0)); l.id = R.uid(); l.group = g2 || undefined; l.component = cid; l.x = ib.x + l.x * sc; l.y = ib.y + l.y * sc; l.w *= sc; l.h *= sc; if (l.type === 'text') { l.fontSize *= sc; R.layoutText(l); } return l; });
        doc.layers.splice(Math.min(at, doc.layers.length), 0, ...fresh);
      });
      const brand = window.App.S.brand || {};
      try { window.App.S.brand = await window.App.api('brand', { body: { ...brand, components: comps() } }); } catch (e) {}
      commit(); UI.toast(`Bileşen güncellendi${Object.keys(groups).length ? ` · bu tasarımdaki ${Object.keys(groups).length} örnek de yenilendi` : ''}`);
    }

    // ---------- seçimi dışa aktar (Figma "export" gibi)
    async function exportSelection() {
      const ls = selected(); if (!ls.length) return;
      const v = await UI.dialog(`<div class="d-body"><h3>${icon('download')} Seçimi dışa aktar</h3><p class="muted" style="margin:0 0 10px">Yalnızca seçili ${ls.length > 1 ? ls.length + ' öğe' : 'öğe'}, şeffaf arka planla.</p>
        <div class="exp-grid">${[['png1', 'PNG 1×'], ['png2', 'PNG 2×'], ['png4', 'PNG 4×'], ['svg', 'SVG (vektör)'], ['jpg2', 'JPG 2×'], ['webp2', 'WEBP 2×']].map(([k, t]) => `<button class="btn" data-ex="${k}">${t}</button>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, { onOpen: (box, close) => $$('[data-ex]', box).forEach((b) => (b.onclick = () => close(b.dataset.ex))) });
      if (!v) return;
      const b = unionBox(ls), pad = 0;
      const sub = { width: Math.ceil(b.x2 - b.x + 2 * pad), height: Math.ceil(b.y2 - b.y + 2 * pad), background: v.startsWith('jpg') ? '#FFFFFF' : 'transparent', layers: doc.layers.filter((l) => ls.includes(l)).map((l) => { const c = JSON.parse(JSON.stringify(l)); c.x -= b.x - pad; c.y -= b.y - pad; return c; }) };
      const name = (ls.length === 1 ? ls[0].name : 'secim') || 'oge';
      try {
        if (v === 'svg') { const svg = await R.exportSVGString(sub); await R.download(new Blob([svg], { type: 'image/svg+xml' }), name + '.svg'); }
        else { const fmt = v.replace(/\d/, ''), sc = +v.slice(-1); await R.download(await R.exportBlob(sub, fmt, sc), `${name}@${sc}x.${fmt}`); }
      } catch (e) { UI.toast(e.message, true); }
    }

    // ---------- yol işlemleri (Illustrator Pathfinder) + nokta düzenleme
    const IMP = () => window.Importers;
    const isShape = (l) => l && ['rect', 'ellipse', 'path'].includes(l.type);
    function layerMatrix(l) { let m = new DOMMatrix().translate(l.x + l.w / 2, l.y + l.h / 2); if (l.rotation) m = m.rotate(l.rotation); if (l.flipX || l.flipY) m = m.scale(l.flipX ? -1 : 1, l.flipY ? -1 : 1); return m.translate(-l.w / 2, -l.h / 2); }
    function localD(l) {
      const w = l.w, h = l.h;
      if (l.type === 'rect') { const r = Math.min(+l.radius || 0, w / 2, h / 2); return r ? `M${r} 0L${w - r} 0A${r} ${r} 0 0 1 ${w} ${r}L${w} ${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}L${r} ${h}A${r} ${r} 0 0 1 0 ${h - r}L0 ${r}A${r} ${r} 0 0 1 ${r} 0Z` : `M0 0L${w} 0L${w} ${h}L0 ${h}Z`; }
      if (l.type === 'ellipse') { const rx = w / 2, ry = h / 2; return `M0 ${ry}A${rx} ${ry} 0 1 1 ${w} ${ry}A${rx} ${ry} 0 1 1 0 ${ry}Z`; }
      return null;
    }
    const pathMatrix = (l) => (l.type === 'path' ? layerMatrix(l).scale(l.w / (l.vw || l.w), l.h / (l.vh || l.h)) : layerMatrix(l));
    const docD = (l) => IMP().absPath(l.type === 'path' ? l.d : localD(l), pathMatrix(l));
    function parseAbs(d) {
      const out = []; const re = /([MLCSQTAZ])([^MLCSQTAZ]*)/gi; let m;
      while ((m = re.exec(d))) out.push({ c: m[1].toUpperCase(), n: m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : [] });
      return out;
    }
    const fmtD = (cmds) => cmds.map((k) => k.c + k.n.map((v) => +(+v).toFixed(2)).join(' ')).join('');
    let probe = null;
    function signedArea(d) {
      if (!probe) { const ns = 'http://www.w3.org/2000/svg'; const sv = document.createElementNS(ns, 'svg'); sv.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px'; probe = document.createElementNS(ns, 'path'); sv.appendChild(probe); document.body.appendChild(sv); }
      probe.setAttribute('d', d); const L = probe.getTotalLength(); if (!L) return 0;
      let a = 0, prev = probe.getPointAtLength(0); const N = 64;
      for (let i = 1; i <= N; i++) { const q = probe.getPointAtLength((L * i) / N); a += prev.x * q.y - q.x * prev.y; prev = q; }
      return a / 2;
    }
    function reverseSub(cmds) {
      if (cmds.some((k) => k.c === 'S' || k.c === 'T')) return null;
      const closed = cmds[cmds.length - 1].c === 'Z';
      const segs = cmds.filter((k) => k.c !== 'M' && k.c !== 'Z');
      const pts = [cmds[0].n.slice(0, 2)];
      segs.forEach((k) => pts.push(k.n.slice(-2)));
      const out = [{ c: 'M', n: pts[pts.length - 1] }];
      for (let i = segs.length - 1; i >= 0; i--) {
        const k = segs[i], to = pts[i];
        if (k.c === 'L') out.push({ c: 'L', n: to });
        else if (k.c === 'C') out.push({ c: 'C', n: [k.n[2], k.n[3], k.n[0], k.n[1], ...to] });
        else if (k.c === 'Q') out.push({ c: 'Q', n: [k.n[0], k.n[1], ...to] });
        else if (k.c === 'A') out.push({ c: 'A', n: [k.n[0], k.n[1], k.n[2], k.n[3], 1 - k.n[4], ...to] });
      }
      if (closed) out.push({ c: 'Z', n: [] });
      return out;
    }
    function orientCW(d) {
      const cmds = parseAbs(d), subs = []; let cur = null;
      cmds.forEach((k) => { if (k.c === 'M') { cur = [k]; subs.push(cur); } else if (cur) cur.push(k); });
      return subs.map((sp) => { const sd = fmtD(sp); if (signedArea(sd) >= 0) return sd; const r = reverseSub(sp); return r ? fmtD(r) : sd; }).join('');
    }
    function pathLayerFrom(d, style, name) {
      const b = IMP().pathBox(d);
      if (!b.width || !b.height) return null;
      return { type: 'path', visible: true, locked: false, name, d: IMP().shiftPath(d, b.x, b.y), vw: +b.width.toFixed(2), vh: +b.height.toFixed(2), x: b.x, y: b.y, w: b.width, h: b.height, rotation: 0, fill: style.fill, stroke: style.stroke, strokeWidth: style.strokeWidth, dash: style.dash, opacity: style.opacity, shadow: style.shadow, blend: style.blend };
    }
    function toPathLayer(l) {
      if (l.type === 'path' && !l.rotation && !l.flipX && !l.flipY) return l;
      const n = pathLayerFrom(docD(l), l, l.name); if (!n) return l;
      if (l.bool) n.bool = { op: l.bool.op, d: IMP().absPath(l.bool.d, pathMatrix(n).inverse().multiply(pathMatrix(l))) };
      Object.assign(n, { id: l.id, group: l.group, evenodd: l.evenodd });
      doc.layers[doc.layers.indexOf(l)] = n; return n;
    }
    function pathfinder(op) {
      const ls = doc.layers.filter((l) => st.sel.includes(l.id));
      if (ls.length < 2 || !ls.every(isShape)) { UI.toast('En az iki şekil seç (dikdörtgen, elips ya da yol)', true); return; }
      const base = ls[0], others = ls.slice(1);
      if (op === 'union' || op === 'exclude') {
        const d = ls.map((l) => (op === 'union' ? orientCW(docD(l)) : docD(l))).join('');
        const n = pathLayerFrom(d, base, op === 'union' ? 'Birleşim' : 'Hariç tutma'); if (!n) return;
        n.id = R.uid(); if (op === 'exclude') n.evenodd = true;
        const at = doc.layers.indexOf(base);
        doc.layers = doc.layers.filter((l) => !ls.includes(l)); doc.layers.splice(Math.min(at, doc.layers.length), 0, n);
        st.sel = [n.id]; commit(); return;
      }
      const b = toPathLayer(base);
      const cut = others.map((l) => orientCW(docD(l))).join('');
      const inv = pathMatrix(b).inverse();
      const local = IMP().absPath(cut, inv);
      if (b.bool && b.bool.op === (op === 'intersect' ? 'intersect' : 'subtract') && op === 'subtract') b.bool.d += local;
      else b.bool = { op: op === 'intersect' ? 'intersect' : 'subtract', d: local };
      b.name = (op === 'intersect' ? 'Kesişim' : 'Çıkarma') + ': ' + (base.name || 'şekil');
      doc.layers = doc.layers.filter((l) => !others.includes(l));
      st.sel = [b.id]; commit();
    }
    const PF_ICONS = {
      union: '<svg viewBox="0 0 24 24"><path d="M3 3h12v6h6v12H9v-6H3z" fill="currentColor"/></svg>',
      subtract: '<svg viewBox="0 0 24 24"><path d="M3 3h12v6H9v6H3z" fill="currentColor"/><path d="M9 9h12v12H9z" fill="none" stroke="currentColor" stroke-dasharray="2 2"/></svg>',
      intersect: '<svg viewBox="0 0 24 24"><path d="M3 3h12v12H3zM9 9h12v12H9z" fill="none" stroke="currentColor" stroke-dasharray="2 2"/><path d="M9 9h6v6H9z" fill="currentColor"/></svg>',
      exclude: '<svg viewBox="0 0 24 24"><path d="M3 3h12v6H9v6H3zM15 9h6v12H9v-6h6z" fill="currentColor"/><path d="M9 9h6v6H9z" fill="none" stroke="currentColor"/></svg>',
    };
    const pfPanel = () => `<div class="grp"><h4>Yol işlemleri<span class="muted" style="font-weight:400">alttaki şekil temel alınır</span></h4><div class="pf-row">${[['union', 'Birleştir'], ['subtract', 'Çıkar'], ['intersect', 'Kesişim'], ['exclude', 'Hariç tut']].map(([k, t]) => `<button class="btn sm" data-pf="${k}" title="${t}">${PF_ICONS[k]}<span>${t}</span></button>`).join('')}</div></div>`;

    async function nodeEditor(l0) {
      let l = l0;
      if (l.type !== 'path' || l.rotation || l.flipX || l.flipY) { l = toPathLayer(l0); commit(); }
      if (l.type !== 'path') return;
      let cmds = parseAbs(IMP().absPath(l.d, new DOMMatrix()));
      const vw = l.vw || l.w, vh = l.vh || l.h, pad = Math.max(vw, vh) * 0.12;
      let selI = -1;
      const ok = await UI.dialog(`<div class="d-body"><h3>${icon('vector')} Noktaları düzenle</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Kare noktaları sürükleyerek şekli değiştir, yuvarlak tutamaçlarla eğriyi ayarla. Bir noktaya dokunup aşağıdaki düğmelerle eğri/köşe yap ya da sil.</p>
        <div class="ne-stage"><svg id="neSvg" viewBox="${-pad} ${-pad} ${vw + 2 * pad} ${vh + 2 * pad}"></svg></div>
        <div class="iconrow" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm" id="neCurve">Eğri yap</button><button class="btn sm" id="neLine">Köşe (düz) yap</button><button class="btn sm" id="neAdd">Araya nokta ekle</button><button class="btn sm danger" id="neDel">${icon('trash')}Noktayı sil</button></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="neOk">${icon('check')}Uygula</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const svg = $('#neSvg', box), k = Math.max(vw, vh) / 300;
          const fillC = typeof l.fill === 'string' && l.fill !== 'none' ? l.fill : '#888';
          const prevEnd = (i) => { for (let j = i - 1; j >= 0; j--) if (cmds[j].c !== 'Z') return cmds[j].n.slice(-2); return [0, 0]; };
          const draw = () => {
            let h = `<path d="${fmtD(cmds)}" fill="${fillC}" fill-opacity="0.35" stroke="#7c5cff" stroke-width="${1.5 * k}"${l.evenodd ? ' fill-rule="evenodd"' : ''}/>`;
            cmds.forEach((c, i) => {
              if (c.c === 'C') { const p0 = prevEnd(i); h += `<line x1="${p0[0]}" y1="${p0[1]}" x2="${c.n[0]}" y2="${c.n[1]}" class="ne-h"/><line x1="${c.n[4]}" y1="${c.n[5]}" x2="${c.n[2]}" y2="${c.n[3]}" class="ne-h"/><circle cx="${c.n[0]}" cy="${c.n[1]}" r="${4 * k}" class="ne-c" data-i="${i}" data-j="0"/><circle cx="${c.n[2]}" cy="${c.n[3]}" r="${4 * k}" class="ne-c" data-i="${i}" data-j="2"/>`; }
              if (c.c === 'Q') { const p0 = prevEnd(i); h += `<line x1="${p0[0]}" y1="${p0[1]}" x2="${c.n[0]}" y2="${c.n[1]}" class="ne-h"/><circle cx="${c.n[0]}" cy="${c.n[1]}" r="${4 * k}" class="ne-c" data-i="${i}" data-j="0"/>`; }
            });
            cmds.forEach((c, i) => { if (c.c === 'Z') return; const e = c.n.slice(-2); h += `<rect x="${e[0] - 5 * k}" y="${e[1] - 5 * k}" width="${10 * k}" height="${10 * k}" class="ne-a${i === selI ? ' on' : ''}" data-i="${i}" data-j="${c.n.length - 2}"/>`; });
            svg.innerHTML = h.replace(/class="ne-h"/g, `stroke="#9aa" stroke-width="${k}"`).replace(/class="ne-c"/g, `fill="#fff" stroke="#7c5cff" stroke-width="${1.5 * k}" class="ne-c"`);
            $$('.ne-a', svg).forEach((r) => r.setAttribute('style', `fill:${+r.dataset.i === selI ? '#7c5cff' : '#fff'};stroke:#7c5cff;stroke-width:${1.5 * k}px;cursor:move`));
          };
          const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
          let drag = null;
          svg.onpointerdown = (e) => {
            const t = e.target; if (!t.dataset || t.dataset.i == null) return;
            e.preventDefault(); svg.setPointerCapture(e.pointerId);
            const i = +t.dataset.i, j = +t.dataset.j; if (t.classList.contains('ne-a')) selI = i;
            const p = toSvg(e); drag = { i, j, p, orig: cmds[i].n.slice(), next: cmds[i + 1] && cmds[i + 1].c === 'C' ? cmds[i + 1].n.slice() : null, anchor: t.classList.contains('ne-a') };
            draw();
          };
          svg.onpointermove = (e) => {
            if (!drag) return; const p = toSvg(e), dx = p.x - drag.p.x, dy = p.y - drag.p.y, c = cmds[drag.i];
            c.n[drag.j] = drag.orig[drag.j] + dx; c.n[drag.j + 1] = drag.orig[drag.j + 1] + dy;
            if (drag.anchor) {
              if (c.c === 'C') { c.n[2] = drag.orig[2] + dx; c.n[3] = drag.orig[3] + dy; }
              if (drag.next) { cmds[drag.i + 1].n[0] = drag.next[0] + dx; cmds[drag.i + 1].n[1] = drag.next[1] + dy; }
              // kapalı şekilde ilk nokta (M) ile son nokta çakışıyorsa birlikte taşı
            }
            draw();
          };
          svg.onpointerup = svg.onpointercancel = () => { drag = null; };
          $('#neCurve', box).onclick = () => { const c = cmds[selI]; if (!c || c.c !== 'L') return; const p0 = prevEnd(selI), e = c.n; cmds[selI] = { c: 'C', n: [p0[0] + (e[0] - p0[0]) / 3 + (e[1] - p0[1]) * 0.2, p0[1] + (e[1] - p0[1]) / 3 - (e[0] - p0[0]) * 0.2, p0[0] + ((e[0] - p0[0]) * 2) / 3 + (e[1] - p0[1]) * 0.2, p0[1] + ((e[1] - p0[1]) * 2) / 3 - (e[0] - p0[0]) * 0.2, e[0], e[1]] }; draw(); };
          $('#neLine', box).onclick = () => { const c = cmds[selI]; if (!c || !['C', 'Q', 'A', 'S', 'T'].includes(c.c)) return; cmds[selI] = { c: 'L', n: c.n.slice(-2) }; draw(); };
          $('#neAdd', box).onclick = () => { const c = cmds[selI]; if (!c || c.c === 'M') return UI.toast('Önce bir noktaya dokun'); const p0 = prevEnd(selI), e = c.n.slice(-2), mid = [(p0[0] + e[0]) / 2, (p0[1] + e[1]) / 2]; if (c.c === 'L') cmds.splice(selI, 0, { c: 'L', n: mid }); else { cmds[selI] = { c: 'L', n: e }; cmds.splice(selI, 0, { c: 'L', n: mid }); } draw(); };
          $('#neDel', box).onclick = () => { const c = cmds[selI]; if (!c || c.c === 'M') return UI.toast('Başlangıç noktası silinemez', true); if (cmds.filter((x) => x.c !== 'Z' && x.c !== 'M').length <= 2) return UI.toast('Şekilde en az 3 nokta kalmalı', true); cmds.splice(selI, 1); selI = -1; draw(); };
          $('#neOk', box).onclick = () => close(true);
          draw();
        },
      });
      if (!ok) return;
      // yeni sınırlar: yolu kutuya oturt, katman ölçüsünü orantılı güncelle
      const d = fmtD(cmds), b = IMP().pathBox(d);
      if (!b.width || !b.height) return;
      const sx = l.w / vw, sy = l.h / vh;
      l.d = IMP().shiftPath(d, b.x, b.y);
      if (l.bool && l.bool.d) l.bool.d = IMP().shiftPath(IMP().absPath(l.bool.d, new DOMMatrix()), b.x, b.y);
      l.x += b.x * sx; l.y += b.y * sy; l.w = b.width * sx; l.h = b.height * sy; l.vw = +b.width.toFixed(2); l.vh = +b.height.toFixed(2);
      st.sel = [l.id]; commit(); UI.toast('Şekil güncellendi');
    }

    // ---------- ayar katmanı
    function addAdjustLayer() {
      const sl = one(); const at = sl ? doc.layers.indexOf(sl) + 1 : doc.layers.length;
      const l = { id: R.uid(), type: 'adjust', name: 'Ayar katmanı', x: 0, y: 0, w: doc.width, h: doc.height, rotation: 0, opacity: 1, visible: true, locked: false, blend: 'normal', filters: { brightness: 105, contrast: 110, saturate: 115 } };
      doc.layers.splice(at, 0, l); st.sel = [l.id]; st.tab = 'props'; commit();
      UI.toast('Ayar katmanı eklendi — altındaki tüm katmanları etkiler, asılları bozulmaz');
    }

    // ---------- PDF araçları (Adobe Reader / Acrobat gibi)
    const centerBox = (w, h) => { const sl = one(); if (sl) return { x: sl.x, y: sl.y + sl.h + 8, w, h }; return { x: (doc.width - w) / 2, y: (doc.height - h) / 2, w, h }; };
    const U = Math.max(doc.width, doc.height) / 1000;
    async function signatureDialog() {
      const r = await UI.dialog(`<div class="d-body"><h3>${icon('pen')} İmza ekle</h3>
        <div class="seg" style="margin-bottom:8px"><button data-sm="draw" class="on">Çiz</button><button data-sm="type">Yaz</button></div>
        <div id="sgDraw"><canvas id="sgC" width="900" height="300" class="sig-pad"></canvas>
        <div class="iconrow" style="margin-top:6px">${['#0B2A6F', '#111111', '#1D4ED8'].map((c, i) => `<button class="sw-dot${i === 0 ? ' on' : ''}" data-sc="${c}" style="background:${c}"></button>`).join('')}<button class="btn ghost sm" id="sgClr">Temizle</button></div></div>
        <div id="sgType" hidden><input class="inp" id="sgName" placeholder="Adın Soyadın" style="font-size:18px"><div class="sig-fonts">${['Brush Script MT', 'Segoe Script', 'Lucida Handwriting', 'Comic Sans MS'].map((f, i) => `<button class="sig-font${i === 0 ? ' on' : ''}" data-sf="${f}" style="font-family:'${f}',cursive">İmza</button>`).join('')}</div></div>
        <p class="muted" style="font-size:12px;margin:8px 0 0">İmza şeffaf arka planla eklenir; taşıyıp boyutlandırabilirsin.</p></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="sgOk">${icon('check')}Ekle</button></div>`, {
        onOpen: (box, close) => {
          const cv = $('#sgC', box), x = cv.getContext('2d'); let mode = 'draw', col = '#0B2A6F', font = 'Brush Script MT', down = false, last = null, inked = false;
          x.lineCap = 'round'; x.lineJoin = 'round';
          const pt = (e) => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * cv.width / b.width, y: (e.clientY - b.top) * cv.height / b.height }; };
          cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); down = true; last = pt(e); };
          cv.onpointermove = (e) => { if (!down) return; const p = pt(e), v = Math.hypot(p.x - last.x, p.y - last.y); x.strokeStyle = col; x.lineWidth = Math.max(3, 9 - v * 0.15); x.beginPath(); x.moveTo(last.x, last.y); x.lineTo(p.x, p.y); x.stroke(); last = p; inked = true; };
          cv.onpointerup = cv.onpointercancel = () => { down = false; };
          $$('[data-sc]', box).forEach((b) => (b.onclick = () => { col = b.dataset.sc; $$('[data-sc]', box).forEach((y) => y.classList.toggle('on', y === b)); }));
          $$('[data-sf]', box).forEach((b) => (b.onclick = () => { font = b.dataset.sf; $$('[data-sf]', box).forEach((y) => y.classList.toggle('on', y === b)); }));
          $('#sgClr', box).onclick = () => { x.clearRect(0, 0, cv.width, cv.height); inked = false; };
          $$('[data-sm]', box).forEach((b) => (b.onclick = () => { mode = b.dataset.sm; $$('[data-sm]', box).forEach((y) => y.classList.toggle('on', y === b)); $('#sgDraw', box).hidden = mode !== 'draw'; $('#sgType', box).hidden = mode !== 'type'; }));
          $('#sgOk', box).onclick = () => {
            let c = cv;
            if (mode === 'type') { const t = $('#sgName', box).value.trim(); if (!t) return; c = document.createElement('canvas'); c.width = 1200; c.height = 300; const y = c.getContext('2d'); y.fillStyle = col; y.font = `120px '${font}', cursive`; y.textBaseline = 'middle'; y.fillText(t, 30, 160); }
            else if (!inked) return;
            // boşlukları kırp
            const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
            for (let yy = 0; yy < c.height; yy++) for (let xx = 0; xx < c.width; xx++) if (d[(yy * c.width + xx) * 4 + 3] > 10) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
            if (x1 <= x0) return;
            const o = document.createElement('canvas'); o.width = x1 - x0 + 12; o.height = y1 - y0 + 12; o.getContext('2d').drawImage(c, x0 - 6, y0 - 6, o.width, o.height, 0, 0, o.width, o.height);
            close({ data: o.toDataURL('image/png'), w: o.width, h: o.height });
          };
        },
      });
      if (!r) return;
      let url; try { url = (await window.App.api('upload', { body: { data: r.data, name: 'imza.png' } })).url; } catch (e) { url = r.data; }
      const w = Math.min(doc.width * 0.3, r.w), h = (w * r.h) / r.w, b = centerBox(w, h);
      addLayer({ type: 'image', name: 'İmza', role: 'signature', src: url, nw: r.w, nh: r.h, fit: 'fill', x: b.x, y: b.y, w, h, filters: {} });
    }
    function pdfAdd(kind) {
      const sl = one();
      if (kind === 'highlight') {
        const b = sl && sl.type === 'text' ? { x: sl.x - 4 * U, y: sl.y, w: sl.w + 8 * U, h: sl.h } : centerBox(300 * U, 40 * U);
        const l = addLayer({ type: 'rect', name: 'Vurgu', x: b.x, y: b.y, w: b.w, h: b.h, fill: '#FFE600', opacity: 0.45, blend: 'multiply', radius: 2 * U });
        if (sl) { doc.layers.splice(doc.layers.indexOf(l), 1); doc.layers.splice(doc.layers.indexOf(sl), 0, l); commit(); }
      }
      if (kind === 'strike' && sl && sl.type === 'text') addLayer({ type: 'rect', name: 'Üstü çizili', x: sl.x, y: sl.y + sl.h * 0.48, w: sl.w, h: Math.max(2, sl.fontSize * 0.08), fill: '#E11D48' });
      if (kind === 'strike' && !(sl && sl.type === 'text')) UI.toast('Önce üstünü çizeceğin yazıyı seç');
      if (kind === 'whiteout') { const b = sl ? { x: sl.x, y: sl.y, w: sl.w, h: sl.h } : centerBox(260 * U, 60 * U); addLayer({ type: 'rect', name: 'Beyazlatma', x: b.x, y: b.y, w: b.w, h: b.h, fill: '#FFFFFF' }); UI.toast('Beyaz kutu eklendi — altındaki yazıyı kapatır, üzerine yeni yazı ekleyebilirsin'); }
      if (kind === 'note') {
        const b = centerBox(260 * U, 170 * U), g = R.uid();
        addLayer({ type: 'rect', name: 'Not kâğıdı', group: g, x: b.x, y: b.y, w: b.w, h: b.h, fill: '#FFF3A3', radius: 4 * U, shadow: { x: 0, y: 4 * U, blur: 14 * U, color: 'rgba(0,0,0,0.18)' } }, false);
        const t = addLayer({ type: 'text', name: 'Not', group: g, text: 'Notunu buraya yaz…', x: b.x + 16 * U, y: b.y + 16 * U, w: b.w - 32 * U, fontSize: 20 * U, fontFamily: 'Segoe UI', fontWeight: 500, fill: '#3B3200', align: 'left', lineHeight: 1.3 });
        st.sel = [t.id]; renderPanel();
      }
      if (kind === 'stamp' || kind === 'stampNo' || kind === 'stampDraft') {
        const [txt, col] = { stamp: ['ONAYLANDI', '#15803D'], stampNo: ['REDDEDİLDİ', '#B91C1C'], stampDraft: ['TASLAK', '#1D4ED8'] }[kind];
        const b = centerBox(300 * U, 84 * U), g = R.uid();
        addLayer({ type: 'rect', name: 'Damga çerçeve', group: g, x: b.x, y: b.y, w: b.w, h: b.h, fill: 'none', stroke: col, strokeWidth: 5 * U, radius: 8 * U, rotation: -8, opacity: 0.9 }, false);
        addLayer({ type: 'text', name: 'Damga', group: g, text: txt, x: b.x, y: b.y + (b.h - 44 * U) / 2, w: b.w, fontSize: 40 * U, lineHeight: 1.1, fontFamily: 'Arial Black', fontWeight: 900, fill: col, align: 'center', letterSpacing: 2, rotation: -8, opacity: 0.9 });
      }
      if (kind === 'date') { const b = centerBox(240 * U, 30 * U); addLayer({ type: 'text', name: 'Tarih', text: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }), x: b.x, y: b.y, w: b.w, fontSize: 22 * U, fontFamily: 'Segoe UI', fontWeight: 500, fill: '#111111', align: 'left' }); }
      if (kind === 'text') { const b = centerBox(320 * U, 30 * U); addLayer({ type: 'text', name: 'Metin', text: 'Yeni metin', x: b.x, y: b.y, w: b.w, fontSize: 22 * U, fontFamily: 'Arial', fontWeight: 400, fill: '#111111', align: 'left' }); }
      if (kind === 'check') { const b = centerBox(30 * U, 30 * U); addLayer({ type: 'text', name: 'İşaret', text: '✔', x: b.x, y: b.y, w: 40 * U, fontSize: 30 * U, fontFamily: 'Segoe UI', fill: '#111111', align: 'center' }); }
    }
    async function mergePagesPDF() {
      const g = doc.meta && doc.meta.pdfGroup;
      let list = [];
      try { list = await window.App.api('projects'); } catch (e) {}
      const mine = g ? list.filter((p) => p.meta && p.meta.pdfGroup === g) : [];
      const picks = await UI.dialog(`<div class="d-body"><h3>${icon('file')} Sayfaları tek PDF yap</h3><p class="muted" style="margin:0 0 8px">Seçtiğin tasarımlar sırayla tek bir PDF dosyasında birleşir.</p>
        <div class="mp-list">${list.slice(0, 200).map((p) => `<label class="mp-it"><input type="checkbox" value="${esc(p.id)}" ${(g ? mine.some((m) => m.id === p.id) : p.id === window.App.S.project.id) ? 'checked' : ''}><img src="${esc(p.thumb || '')}" alt=""><span>${esc(p.name || 'Tasarım')}</span></label>`).join('')}</div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="mpGo">${icon('download')}PDF indir</button></div>`, {
        onOpen: (box, close) => ($('#mpGo', box).onclick = () => close($$('input:checked', box).map((i) => i.value))),
      });
      if (!picks || !picks.length) return;
      UI.toast('PDF hazırlanıyor…');
      try {
        const docs = [];
        for (const id of picks) { const p = id === window.App.S.project.id ? doc : await window.App.api('projects/' + id); R.normalize(p); await R.ensureImageSizes(p).catch(() => {}); docs.push(p); }
        if (g) docs.sort((a, b) => ((a.meta && a.meta.page) || 0) - ((b.meta && b.meta.page) || 0));
        const blob = await window.Tools.multiPagePDF(docs);
        await R.download(blob, ((doc.name || 'belge').replace(/ — sayfa \d+$/, '')) + '.pdf');
      } catch (e) { UI.toast(e.message, true); }
    }
    async function pdfToolsMenu() {
      const v = await UI.dialog(`<div class="d-body"><h3>${icon('file')} PDF araçları</h3><p class="muted" style="margin:0">Adobe Reader'daki gibi: imzala, işaretle, not ekle, yazıları düzenle.</p></div><div class="cmdk"><div class="list">
        <div class="it" data-v="sign">${icon('pen')}<span>İmza ekle</span><small>parmağınla çiz ya da adını yaz</small></div>
        <div class="it" data-v="text">${icon('type')}<span>Metin ekle</span><small>form doldurma, boşluğa yazı</small></div>
        <div class="it" data-v="highlight">${icon('brush')}<span>Vurgula</span><small>seçili yazının arkasına sarı fosforlu</small></div>
        <div class="it" data-v="strike">${icon('line')}<span>Üstünü çiz</span><small>seçili yazıyı iptal et</small></div>
        <div class="it" data-v="whiteout">${icon('square')}<span>Beyazlat / kapat</span><small>eski yazıyı gizle, üzerine yenisini yaz</small></div>
        <div class="it" data-v="note">${icon('list')}<span>Yapışkan not</span><small>sarı not kâğıdı</small></div>
        <div class="it" data-v="check">${icon('check')}<span>Onay işareti ✔</span><small>kutucuk işaretlemek için</small></div>
        <div class="it" data-v="date">${icon('file')}<span>Bugünün tarihi</span></div>
        <div class="it" data-v="stamp">${icon('check')}<span>Damga: ONAYLANDI</span></div>
        <div class="it" data-v="stampNo">${icon('x')}<span>Damga: REDDEDİLDİ</span></div>
        <div class="it" data-v="stampDraft">${icon('pen')}<span>Damga: TASLAK</span></div>
        <div class="it" data-v="merge">${icon('copy')}<span>Sayfaları tek PDF yap</span><small>birden çok sayfa / tasarımı birleştir</small></div>
        <div class="it" data-v="pdf">${icon('download')}<span>Bu sayfayı PDF indir</span></div></div></div>`,
      { onOpen: (box, close) => $$('.it', box).forEach((it) => (it.onclick = () => close(it.dataset.v))) });
      if (!v) return;
      if (v === 'sign') return signatureDialog();
      if (v === 'merge') return mergePagesPDF();
      if (v === 'pdf') { try { const blob = await window.Tools.multiPagePDF([doc]); await R.download(blob, (doc.name || 'belge') + '.pdf'); } catch (e) { UI.toast(e.message, true); } return; }
      pdfAdd(v);
    }

    // ---------- maske fırçası + sihirli değnek
    async function maskEditor(l) {
      const MAXS = 900, k = Math.min(1, MAXS / Math.max(l.w, l.h));
      const W = Math.max(8, Math.round(l.w * k)), H = Math.max(8, Math.round(l.h * k));
      let src;
      try { src = await soloCanvas(l, k); } catch (e) { UI.toast('Görsel hazırlanamadı: ' + e.message, true); return; }
      const sctx = src.getContext('2d'), pix = sctx.getImageData(0, 0, W, H).data;
      const m = new Uint8ClampedArray(W * H).fill(255);
      if (l.alphaMask) {
        try {
          const im = new Image(); im.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = l.alphaMask; });
          const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
          const d = x.getImageData(0, 0, W, H).data; for (let i = 0; i < W * H; i++) m[i] = Math.round((d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) * d[i * 4 + 3] / 255);
        } catch (e) {}
      }
      const undoS = [];
      const pushU = () => { undoS.push(m.slice()); if (undoS.length > 30) undoS.shift(); };
      let mode = 'hide', tool = 'brush', size = Math.round(Math.max(W, H) / 18), soft = 0.5, tol = 32, view = 'result', sel = null;
      const ok = await UI.dialog(`<div class="d-body mk-ed"><h3>${icon('brush')} Maske: fırça ve sihirli değnek</h3>
        <p class="muted" style="margin:0 0 8px;font-size:13px">Fotoğrafın istemediğin yerlerini fırçayla <b>gizle</b>, yanlış silinen yerleri <b>geri getir</b>. Sihirli değnek benzer renkli alanı tek dokunuşla seçer. Orijinal fotoğraf bozulmaz.</p>
        <div class="me-bar">
          <div class="seg"><button data-tl="brush" class="on">${icon('brush')}Fırça</button><button data-tl="wand">${icon('wand')}Değnek</button></div>
          <div class="seg"><button data-md="hide" class="on">Gizle</button><button data-md="show">Geri getir</button></div>
          <div class="seg"><button data-vw="result" class="on" title="Sonuç">Sonuç</button><button data-vw="over" title="Gizlenen alanlar kırmızı">Kırmızı</button></div>
        </div>
        <div class="me-stage"><canvas id="meC" width="${W}" height="${H}"></canvas></div>
        <div class="prow" data-for="brush"><span>Fırça boyutu</span><input type="range" id="meSize" min="2" max="${Math.round(Math.max(W, H) / 4)}" value="${size}"><output>${size}</output></div>
        <div class="prow" data-for="brush"><span>Yumuşaklık</span><input type="range" id="meSoft" min="0" max="1" step="0.05" value="${soft}"><output>${soft}</output></div>
        <div class="prow" data-for="wand" hidden><span>Hassasiyet</span><input type="range" id="meTol" min="2" max="120" value="${tol}"><output>${tol}</output></div>
        <div class="iconrow" style="margin-top:6px"><button class="btn sm" id="meUndo">${icon('undo')}Geri</button><button class="btn sm" id="meInv">Tersine çevir</button><button class="btn sm" id="meAll">Hepsini göster</button><button class="btn sm" id="meNone">Hepsini gizle</button><button class="btn sm" id="meEdge" title="Kenarları yumuşat">Kenar yumuşat</button></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button>${l.alphaMask ? `<button class="btn ghost danger" id="meDel">Maskeyi kaldır</button>` : ''}<button class="btn primary" id="meOk">${icon('check')}Uygula</button></div>`, {
        cls: 'wide',
        onOpen: (box, close) => {
          const cv = $('#meC', box), ctx = cv.getContext('2d'), out = ctx.createImageData(W, H);
          let hover = null;
          const draw = () => {
            const o = out.data;
            for (let i = 0, j = 0; i < W * H; i++, j += 4) {
              const a = m[i] / 255, ck = ((((i % W) >> 3) + (((i / W) | 0) >> 3)) & 1) ? 46 : 34;
              if (view === 'over') { const pa = pix[j + 3] / 255, r = pix[j] * pa + ck * (1 - pa), g = pix[j + 1] * pa + ck * (1 - pa), b = pix[j + 2] * pa + ck * (1 - pa); o[j] = r * a + (r * 0.4 + 255 * 0.6) * (1 - a); o[j + 1] = g * a + g * 0.4 * (1 - a); o[j + 2] = b * a + b * 0.4 * (1 - a); o[j + 3] = 255; }
              else { const pa = pix[j + 3] / 255 * a; o[j] = pix[j] * pa + ck * (1 - pa); o[j + 1] = pix[j + 1] * pa + ck * (1 - pa); o[j + 2] = pix[j + 2] * pa + (ck + 6) * (1 - pa); o[j + 3] = 255; }
            }
            ctx.putImageData(out, 0, 0);
            if (sel) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = mode === 'hide' ? '#ff3b6b' : '#36d399'; ctx.drawImage(sel, 0, 0); ctx.restore(); }
            if (hover && tool === 'brush') { ctx.beginPath(); ctx.arc(hover.x, hover.y, size / 2, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = '#000'; ctx.lineWidth = 0.6; ctx.stroke(); }
          };
          const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
          const dab = (x, y) => {
            const R0 = size / 2, hard = R0 * (1 - soft), v = mode === 'hide' ? 0 : 255;
            const x0 = Math.max(0, Math.floor(x - R0)), x1 = Math.min(W - 1, Math.ceil(x + R0)), y0 = Math.max(0, Math.floor(y - R0)), y1 = Math.min(H - 1, Math.ceil(y + R0));
            for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
              const d = Math.hypot(xx - x, yy - y); if (d > R0) continue;
              const f = d <= hard ? 1 : 1 - (d - hard) / Math.max(0.001, R0 - hard), i = yy * W + xx;
              m[i] = m[i] + (v - m[i]) * f;
            }
          };
          const wand = (x, y) => {
            x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return;
            const s0 = (y * W + x) * 4, r0 = pix[s0], g0 = pix[s0 + 1], b0 = pix[s0 + 2], a0 = pix[s0 + 3];
            const seen = new Uint8Array(W * H), st2 = [y * W + x]; seen[y * W + x] = 1;
            const t2 = tol * tol * 3;
            while (st2.length) {
              const i = st2.pop(), j = i * 4, dr = pix[j] - r0, dg = pix[j + 1] - g0, db = pix[j + 2] - b0, da = pix[j + 3] - a0;
              if (dr * dr + dg * dg + db * db + da * da > t2) { seen[i] = 2; continue; }
              seen[i] = 3; const xi = i % W;
              if (xi > 0 && !seen[i - 1]) { seen[i - 1] = 1; st2.push(i - 1); }
              if (xi < W - 1 && !seen[i + 1]) { seen[i + 1] = 1; st2.push(i + 1); }
              if (i >= W && !seen[i - W]) { seen[i - W] = 1; st2.push(i - W); }
              if (i < W * (H - 1) && !seen[i + W]) { seen[i + W] = 1; st2.push(i + W); }
            }
            pushU(); const v = mode === 'hide' ? 0 : 255;
            for (let i = 0; i < W * H; i++) if (seen[i] === 3) m[i] = v;
            // 1px yumuşak kenar
            for (let i = 0; i < W * H; i++) if (seen[i] === 2) m[i] = (m[i] + v) / 2;
          };
          let down = false, last = null;
          cv.onpointerdown = (e) => {
            e.preventDefault(); cv.setPointerCapture(e.pointerId); const p = pt(e);
            if (tool === 'wand') { wand(p.x, p.y); draw(); return; }
            pushU(); down = true; last = p; dab(p.x, p.y); draw();
          };
          cv.onpointermove = (e) => {
            const p = pt(e); hover = e.pointerType === 'mouse' ? p : null;
            if (down) { const d = Math.hypot(p.x - last.x, p.y - last.y), n = Math.max(1, Math.ceil(d / Math.max(1, size / 6))); for (let i = 1; i <= n; i++) dab(last.x + (p.x - last.x) * i / n, last.y + (p.y - last.y) * i / n); last = p; }
            draw();
          };
          cv.onpointerup = cv.onpointercancel = () => { down = false; };
          cv.onpointerleave = () => { hover = null; draw(); };
          const seg = (attr, fn) => $$(`[${attr}]`, box).forEach((b) => (b.onclick = () => { $$(`[${attr}]`, box).forEach((x) => x.classList.toggle('on', x === b)); fn(b.getAttribute(attr)); draw(); }));
          seg('data-tl', (v) => { tool = v; $$('[data-for]', box).forEach((r) => (r.hidden = r.dataset.for !== v)); });
          seg('data-md', (v) => (mode = v));
          seg('data-vw', (v) => (view = v));
          const rg = (id, fn) => ($(id, box).oninput = (e) => { fn(+e.target.value); e.target.nextElementSibling.textContent = e.target.value; });
          rg('#meSize', (v) => (size = v)); rg('#meSoft', (v) => (soft = v)); rg('#meTol', (v) => (tol = v));
          $('#meUndo', box).onclick = () => { const u = undoS.pop(); if (u) { m.set(u); draw(); } };
          $('#meInv', box).onclick = () => { pushU(); for (let i = 0; i < m.length; i++) m[i] = 255 - m[i]; draw(); };
          $('#meAll', box).onclick = () => { pushU(); m.fill(255); draw(); };
          $('#meNone', box).onclick = () => { pushU(); m.fill(0); draw(); };
          $('#meEdge', box).onclick = () => { pushU(); const c = m.slice(); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; m[i] = (c[i] * 4 + c[i - 1] + c[i + 1] + c[i - W] + c[i + W] + (c[i - W - 1] + c[i - W + 1] + c[i + W - 1] + c[i + W + 1]) * 0.5) / 10; } draw(); };
          $('#meOk', box).onclick = () => close('ok');
          const del = $('#meDel', box); if (del) del.onclick = () => close('del');
          draw();
        },
      });
      if (ok === 'del') { delete l.alphaMask; commit(); UI.toast('Maske kaldırıldı'); return; }
      if (ok !== 'ok') return;
      if (m.every((v) => v === 255)) { delete l.alphaMask; commit(); return; }
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), id = x.createImageData(W, H);
      for (let i = 0; i < W * H; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = m[i]; id.data[i * 4 + 3] = 255; }
      x.putImageData(id, 0, 0);
      const data = c.toDataURL('image/png');
      try { const r = await window.App.api('upload', { body: { data, name: 'maske.png' } }); l.alphaMask = r.url; }
      catch (e) { l.alphaMask = data; }
      commit(); UI.toast('Maske uygulandı — istediğin zaman tekrar düzenleyebilirsin');
    }

    async function removeBg(l) {
      let tol = 40, result = null;
      const ok = await UI.dialog(`<div class="d-body"><h3>Arka planı sil</h3><p class="muted">Görselin kenarlarındaki renge benzeyen alanları siler. Düz renkli arka planlarda en iyi sonucu verir.</p>
        <div class="bgr-prev" id="bgrPrev" style="height:260px;display:grid;place-items:center;border-radius:10px;background:repeating-conic-gradient(#2a2e36 0 25%, #1f232a 0 50%) 0 0/16px 16px"><span class="ink-dots"><i></i><i></i><i></i></span></div>
        <div class="prow" style="margin-top:12px"><span>Hassasiyet</span><input type="range" id="bgrTol" min="5" max="120" value="${tol}"><output>${tol}</output></div></div>
        <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bgrOk" disabled>${icon('check')}Uygula</button></div>`, {
        onOpen: (box, close) => {
          const prev = $('#bgrPrev', box);
          let timer = 0;
          const runIt = async () => {
            prev.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span>';
            try {
              result = await window.Tools.removeBackground(l.origSrc || l.src, tol);
              prev.innerHTML = `<img src="${result.dataURL}" style="max-width:100%;max-height:250px" alt="">`;
              $('#bgrOk', box).disabled = false;
            } catch (e) { prev.textContent = e.message; }
          };
          $('#bgrTol', box).oninput = (e) => { tol = +e.target.value; e.target.nextElementSibling.textContent = tol; clearTimeout(timer); timer = setTimeout(runIt, 250); };
          $('#bgrOk', box).onclick = () => close(true);
          runIt();
        },
      });
      if (!ok || !result) return;
      try {
        const r = await window.App.api('upload', { body: { data: result.dataURL, name: 'arkaplansiz.png' } });
        if (!l.origSrc) l.origSrc = l.src;
        l.src = r.url;
        commit();
        UI.toast('Arka plan silindi');
      } catch (e) { UI.toast(e.message, true); }
    }

    async function runCheck() {
      const fixes = await window.Tools.autoFixAsync(doc, { apply: false });
      if (!fixes.length) { UI.toast('Sorun bulunmadı: metinler tuvalde ve okunaklı'); window.Features.splash(); return; }
      UI.dialog(`<div class="d-body"><h3>${fixes.length} sorun bulundu</h3><ul class="check-list">${fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
        <div class="d-foot"><button class="btn ghost" data-close>Kapat</button><button class="btn primary" id="fixAll">${icon('wand')}Hepsini düzelt</button></div>`, {
        onOpen: (box, close) => ($('#fixAll', box).onclick = async () => { await window.Tools.autoFixAsync(doc); commit(); close(); UI.toast('Düzeltildi'); }),
      });
    }

    async function moreMenu() {
      const v = await UI.dialog(`<div class="d-body" style="padding-bottom:6px"><h3>Diğer işlemler</h3><input class="inp" id="mmQ" placeholder="Ara: QR, PDF, video, çevir…" autocomplete="off"></div><div class="cmdk mm"><div class="list">
        ${doc.layers.some((l) => l.type === 'image' && (l.role === 'photo' || /resmi|fotoğraf/i.test(l.name || ''))) ? `<div class="it" data-v="bgimg">${icon('image')}<span>Resmi değiştir</span><small>tasarımdaki fotoğrafı kendi resminle ya da örneklerle değiştir</small></div>` : ''}
        <div class="it" data-v="p8voice">${icon('sparkle')}<span>Sesle düzenle</span><small>“başlığı büyüt”, “resmi değiştir”, “video yap”…</small></div>
        <div class="it" data-v="motion">${icon('play')}<span>Hareketli story</span><small>yazılar süzülerek gelir · 5 sn video, story boyunda</small></div>
        <div class="it" data-v="enhance">${icon('sparkle')}<span>Fotoğrafı iyileştir</span><small>tek dokunuşla ışık, netlik ve renk</small></div>
        <div class="it" data-v="p13:spanish">${icon('chat')}<span>İspanyolca kopya</span><small>tasarımın İspanyolca hali · Türkçesi olduğu gibi kalır</small></div>
        <div class="it" data-v="p12:colorVariants">${icon('palette')}<span>Renk seçenekleri</span><small>aynı tasarımın 6 farklı renk hali</small></div>
        <div class="it" data-v="p12:fontPairs">${icon('type')}<span>Yazı tipi eşleştir</span><small>başlık + metin için uyumlu 6 çift</small></div>
        <div class="it" data-v="p12:ornaments">${icon('sparkle')}<span>Süs öner</span><small>hilal, fener, yıldız… konuya uygun süsler</small></div>
        <div class="it" data-v="p12:brandStrip">${icon('layers')}<span>Logo ve iletişim şeridi</span><small>alta kurum adı, logo, telefon (tekrar dokun: kaldır)</small></div>
        <div class="it" data-v="p12:renew">${icon('calendar')}<span>Bu hafta için yenile</span><small>Cuma / kandil tasarımının tarihi güncel kopyası</small></div>
        <div class="it" data-v="p12:printPDF">${icon('download')}<span>Matbaaya hazır PDF</span><small>3 mm taşma payı ve kesim işaretleri</small></div>
        <div class="it" data-v="p12:printSheet">${icon('layers')}<span>Yazdırma sayfası</span><small>A4'e 2, 4 ya da 8 adet · ev yazıcısı</small></div>
        <div class="it" data-v="fillform">${icon('type')}<span>Formla doldur</span><small>canlı önizlemeyle yazıları ve fotoğrafları değiştir</small></div>
        <div class="it" data-v="txtform">${icon('type')}<span>Yazıları düzenle</span><small>tüm yazılar tek listede, telefonda kolay</small></div>
        <div class="mm-h">Ekle ve yaz</div>
        <div class="it" data-v="p9icons">${icon('star')}<span>Simge ve süs kütüphanesi</span><small>hilal, cami, kitap, takvim, köşe süsü… 40+ simge</small></div>
        <div class="it" data-v="p9quotes">${icon('type')}<span>Ayet, hadis ve dua</span><small>konulara göre, kaynaklı · Arapça hat (Besmele, dua)</small></div>
        <div class="it" data-v="p9phr">${icon('type')}<span>Metin yardımcısı</span><small>duyuru, teşekkür, davet, kampanya · resmî / samimi / kısa</small></div>
        <div class="it" data-v="p10chart">${icon('chart') || icon('layers')}<span>Grafik ve infografik</span><small>büyük sayılar, sütun, halka, pasta, ilerleme</small></div>
        <div class="it" data-v="p9pat">${icon('layers')}<span>Desen zemini</span><small>girih, altıgen, rozet, hilal… renk ve boyut ayarlı</small></div>
        <div class="it" data-v="p9cd">${icon('calendar')}<span>Geri sayım</span><small>“12 gün kaldı” — her gün kendiliğinden güncellenir</small></div>
        <div class="mm-h">Kontrol</div>
        <div class="it" data-v="p9spell">${icon('check')}<span>Yazım denetimi</span><small>sık yapılan Türkçe yazım hataları, noktalama</small></div>
        <div class="it" data-v="p9alt">${icon('sparkle')}<span>Alternatif öneriler</span><small>düzeltilmiş ve farklı renkli 3–4 seçenek, puanlı</small></div>
        <div class="it" data-v="p10a11y">${icon('eye')}<span>Erişilebilirlik kontrolü</span><small>renk körlüğü görünümü, telefonda küçük kalan yazılar</small></div>
        <div class="it" data-v="p9mock">${icon('image')}<span>Mockup</span><small>telefonda, duvarda, masada, roll-up’ta nasıl durur</small></div>
        <div class="mm-h">Paylaş ve indir</div>
        <div class="it" data-v="p10gif">${icon('play')}<span>GIF indir</span><small>hareketli tasarım, WhatsApp ve e-posta için</small></div>
        <div class="it" data-v="p9wa">${icon('share')}<span>WhatsApp paketi</span><small>durum, kanal görseli, bağlantı önizlemesi</small></div>
        <div class="it" data-v="p9sheet">${icon('rows')}<span>Etiket / rozet sayfası</span><small>A4’e 4–24 adet, kesim işaretli, listeden isimli</small></div>
        <div class="it" data-v="p8sizes">${icon('copy')}<span>Tüm boyutlar</span><small>post, 4:5, story / WhatsApp durum, A4 — tek ZIP</small></div>
        <div class="it" data-v="p8story">${icon('play')}<span>Hikâye videosu</span><small>1080×1920, yazılar sırayla gelir, MP4</small></div>
        <div class="it" data-v="p8lang">${icon('globe')}<span>Dil paketi</span><small>Türkçe + İspanyolca + İngilizce</small></div>
        <div class="it adm" data-v="p8qr">${icon('qr')}<span>Bağış QR rozeti</span><small>okutunca bağış sayfası / WhatsApp / IBAN</small></div>
        <div class="it adm" data-v="p8ics">${icon('calendar')}<span>Paylaşım takvimini telefona ekle</span><small>mübarek günler + her cuma, 1 gün önce hatırlatır</small></div>
        <div class="it m-item" data-v="export">${icon('download')}<span>İndir</span><small>PNG, JPG, SVG, PDF…</small></div>
        <div class="it" data-v="share">${icon('send')}<span>Paylaş</span></div>
        <div class="it" data-v="social">${icon('social')}<span>Sosyal medya paketi</span><small>post, story, banner + açıklama</small></div>
        <div class="it" data-v="adapt">${icon('copy')}<span>Diğer formatlara uyarla</span><small>post, story, banner…</small></div>
        <div class="it" data-v="calendar">${icon('calendar')}<span>Takvime ekle</span><small>paylaşım günü ve hatırlatma</small></div>
        <div class="it m-item" data-v="preview">${icon('eye')}<span>Önizle</span></div>
        <div class="mm-h">Kalite (yapay zekasız)</div>
        <div class="it" data-v="coach">${icon('coach')}<span>Tasarım koçu</span><small>hizalama, kenar payı, okunabilirlik, renk — tek dokunuşla düzelt</small></div>
        <div class="it" data-v="blocks">${icon('blocks')}<span>Hazır bloklar</span><small>fiyat rozeti, indirim etiketi, buton, özellik listesi, iletişim bandı</small></div>
        <div class="it" data-v="scenes">${icon('scene')}<span>Ürün sahnesi</span><small>stüdyo fonu, podyum, temas gölgesi, yansıma</small></div>
        <div class="it" data-v="harmony">${icon('harmony')}<span>Renk uyumu</span><small>marka renginden uyumlu palet, okunur yazı rengi</small></div>
        <div class="it" data-v="scale">${icon('type')}<span>Yazı ölçeği</span><small>başlık–metin boyutlarını orantılı yap</small></div>
        <div class="it" data-v="fillInfo">${icon('info')}<span>Bilgilerimi yerleştir</span><small>ürün adı, fiyat, telefon… Marka kitinden doldur</small></div>
        <div class="it" data-v="fontlib">${icon('type')}<span>Yazı tipi kütüphanesi</span><small>107 aile, tüm kalınlık ve italikler</small></div>
        <div class="mm-h">Hız ve satış</div>
        <div class="it" data-v="p6set">${icon('copy')}<span>Kampanya seti</span><small>bu tasarımdan post, story, Trendyol, banner… hepsi birden</small></div>
        <div class="it" data-v="p6video">${icon('play')}<span>Ürün videosu (Reels)</span><small>dikey video, sırayla gelen yazılar, MP4 indir</small></div>
        <div class="it" data-v="p6mock">${icon('mockup')}<span>Ürün maketi</span><small>telefon, poster, el ilanı, çanta, kartvizit, şişe, web sitesi</small></div>
        <div class="it" data-v="p6styles">${icon('type')}<span>Yazı stilleri</span><small>altın yaldız, neon, 3B, krom, retro… tek dokunuşla</small></div>
        ${doc.meta && doc.meta.carousel ? `<div class="it" data-v="p6carousel">${icon('download')}<span>Carousel parçalarını indir</span><small>${doc.meta.carousel.n} ayrı görsel, ZIP</small></div>` : ''}
        <div class="mm-h">Paylaşım<span class="adm"> ve bağış</span></div>
        <div class="it" data-v="p7share">${icon('share')}<span>Paylaş</span><small>WhatsApp, Instagram, galeri (telefonda doğrudan)</small></div>
        <div class="it" data-v="p7video">${icon('play')}<span>Kısa video (story)</span><small>yıldızlar parlar, yazılar sırayla gelir, MP4 indir</small></div>
        <div class="it adm" data-v="p7don">${icon('qr')}<span>Bağış bilgisi kartı</span><small>IBAN, banka, WhatsApp ve QR kod</small></div>
        <div class="it adm" data-v="p7band">${icon('rows')}<span>IBAN şeridi</span><small>tasarımın altına ince bir bant</small></div>
        ${doc.layers.some((l) => l.progress) ? `<div class="it adm" data-v="p7prog">${icon('goal')}<span>Bağış hedefini güncelle</span><small>toplanan, hedef, kalan gün</small></div>` : ''}
        <div class="it" data-v="p6ref">${icon('image')}<span>Bu tasarıma benzet</span><small>beğendiğin bir tasarımın renklerini ve havasını uygula</small></div>
        <div class="it" data-v="p6hist">${icon('clock')}<span>Sürüm geçmişi</span><small>eski hallere bak, karşılaştır, geri dön</small></div>
        <div class="mm-h">Yapay zeka ve tasarım</div>
        <div class="it" data-v="styles">${icon('palette')}<span>Stil setleri</span><small>yazı tipi + renk paleti tek dokunuşla</small></div>
        <div class="it" data-v="recolor">${icon('recolor')}<span>Tasarımı yeniden renklendir</span><small>tüm renkleri tek seferde değiştir</small></div>
        <div class="it" data-v="translate">${icon('globe')}<span>Tasarımı çevir</span><small>İngilizce, Almanca, Arapça…</small></div>
        <div class="it" data-v="anim">${icon('eye')}<span>Animasyon ve video</span><small>katmanları canlandır, MP4 indir</small></div>
        <div class="it" data-v="qr">${icon('qr')}<span>QR kod ekle</span><small>web, menü, WhatsApp, Wi‑Fi, kartvizit</small></div>
        <div class="it" data-v="stock">${icon('image')}<span>Ücretsiz fotoğraflar</span><small>ürün zemini, mermer, ahşap, yaşam tarzı (Pexels)</small></div>
        <div class="it" data-v="icons">${icon('star')}<span>İkon kitaplığı</span><small>yemek, iletişim, ok, sosyal… renklendirilebilir</small></div>
        <div class="it" data-v="bgpat">${icon('image')}<span>Arka plan ve doku</span><small>desen, gradyan, kâğıt, mermer, ahşap</small></div>
        <div class="it" data-v="table">${icon('list')}<span>Tablo ekle</span><small>fiyat listesi, saatler, karşılaştırma</small></div>
        <div class="it" data-v="chart">${icon('chart')}<span>Grafik ekle</span><small>sütun, çubuk, pasta, halka, çizgi</small></div>
        <div class="it" data-v="pages">${icon('copy')}<span>Çok sayfalı belge</span><small>sayfa ekle, numara, sunum, tek PDF</small></div>
        <div class="mm-h">Baskı ve ürün</div>
        <div class="it" data-v="check">${icon('shield')}<span>Ön kontrol</span><small>okunabilirlik, kontrast, matbaa (DPI, CMYK, taşma payı)</small></div>
        <div class="it" data-v="print">${icon('cut')}<span>Matbaa çıktısı</span><small>mm ölçü, kesim hattı, CMYK, vektör PDF</small></div>
        <div class="it" data-v="label">${icon('list')}<span>Etiket kontrol listesi</span><small>zorunlu bilgiler, alerjen, yazı ve barkod boyutu</small></div>
        <div class="it" data-v="batch">${icon('file')}<span>Ürün serisi üret</span><small>Excel'deki her ürün için ayrı etiket + barkod</small></div>
        <div class="it" data-v="mock">${icon('jar')}<span>Ambalaj üzerinde gör</span><small>kavanoz, poşet, kutu</small></div>
        <div class="it" data-v="photomock">${icon('image')}<span>Kendi fotoğrafında gör</span><small>tasarımı vitrin, tabela, ürün fotoğrafına yerleştir</small></div>
        <div class="it" data-v="catalog">${icon('list')}<span>Ürün kataloğu / fiyat listesi</span><small>Excel'den çok sayfalı katalog, sonra güncelle</small></div>
        <div class="it" data-v="box">${icon('cut')}<span>Kutu kesim şablonu</span><small>ölçü gir, kesim + katlama çizgili PDF</small></div>
        <div class="it" data-v="p3d">${icon('jar')}<span>3D ambalaj önizleme</span><small>kutu, kavanoz, şişe, poşet · çevir</small></div>
        <div class="it" data-v="sheet">${icon('grid')}<span>Etiket tabakası (A4)</span><small>tabakaya diz, baskıya hazır PDF</small></div>
        <div class="it" data-v="pdftools">${icon('file')}<span>PDF araçları</span><small>imza, vurgula, not, damga, sayfaları birleştir</small></div>
        <div class="mm-h">Ekip ve sürümler</div>
        <div class="it" data-v="review">${icon('chat')}<span>Onaya gönder</span><small>yorum ve onay bağlantısı</small></div>
        <div class="it" data-v="compare">${icon('compare')}<span>Sürümleri karşılaştır</span></div>
        <div class="it" data-v="tpl">${icon('layers')}<span>Şablon olarak kaydet</span><small>sonra metinleri değiştirip tekrar kullan</small></div>
        <div class="it" data-v="pkg">${icon('download')}<span>Şablon paketi (.tasarim)</span><small>başka bilgisayara / müşteriye kilitli şablon ver</small></div>
        <div class="it" data-v="requests">${icon('chat')}<span>Müşteri talepleri ve portal</span><small>müşterinin talep bıraktığı sayfa</small></div>
        <div class="mm-h">Yardım</div>
        <div class="it" data-v="tour">${icon('sparkle')}<span>Editör nasıl kullanılır?</span><small>adım adım tur · ? tuşu: kısayollar</small></div></div></div>`,
      { onOpen: (box, close) => {
        $$('.it', box).forEach((it) => (it.onclick = () => close(it.dataset.v)));
        const q = $('#mmQ', box), norm = (t) => t.toLocaleLowerCase('tr-TR');
        if (!mobile()) q.focus();
        q.oninput = () => { const t = norm(q.value.trim()); $$('.it', box).forEach((it) => (it.hidden = t && !norm(it.textContent).includes(t))); $$('.mm-h', box).forEach((h) => { let n = h.nextElementSibling, any = false; while (n && !n.classList.contains('mm-h')) { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; }); };
        q.onkeydown = (e) => { if (e.key === 'Enter') { const f = $$('.it', box).find((it) => !it.hidden); if (f) close(f.dataset.v); } };
      } });
      if (!v) return;
      if (cb.onSaveQuiet) await cb.onSaveQuiet();
      if (v === 'tpl') window.Features.saveTemplate(doc);
      if (v === 'adapt') window.Features.adaptDialog(doc);
      if (v === 'batch') window.Features.batchDialog();
      if (v === 'share') window.Features.share(doc);
      if (v === 'check') preflight();
      if (v === 'coach') window.Coach.coach();
      if (v === 'p6set') window.P6.campaignSet();
      if (v === 'p6video') window.P6.productVideo();
      if (v === 'p6mock') window.Features.mockupDialog(doc, 'phone');
      if (v === 'p6styles') window.P6.textStyles();
      if (v === 'p6carousel') window.P6.carouselExport(doc);
      if (v === 'p6hist') window.P6.history();
      if (v === 'p6ref') window.P6.reference();
      if (v === 'p7share') window.P7.share(doc);
      if (v === 'bgimg') replacePhotoFlow();
      if (v === 'txtform') textForm();
      if (v === 'fillform') fillForm();
      if (typeof v === 'string' && v.startsWith('p12:') && window.P12) window.P12[v.slice(4)]();
      if (typeof v === 'string' && v.startsWith('p13:') && window.P13) window.P13[v.slice(4)]();
      if (v === 'motion') { if (window.P11) window.P11.motionStory(); }
      if (v === 'enhance') { if (window.P11) window.P11.enhancePhotos(); }
      if (v === 'p8voice') window.P8.voice();
      const P9 = window.P9;
      if (v === 'p10chart') window.P10.chart(); if (v === 'p10a11y') window.P10.a11y(); if (v === 'p10gif') window.P10.gif();
      if (v === 'p9icons') P9.icons(); if (v === 'p9quotes') P9.quotes(); if (v === 'p9phr') P9.phrases(); if (v === 'p9pat') P9.pattern(); if (v === 'p9cd') P9.countdown();
      if (v === 'p9spell') P9.spell(); if (v === 'p9alt') P9.alternatives(); if (v === 'p9mock') P9.mockup(); if (v === 'p9wa') P9.waPack(window.App.S.project); if (v === 'p9sheet') P9.sheet();
      if (v === 'p8sizes') window.P8.allSizes(window.App.S.project);
      if (v === 'p8story') window.P8.storyVideo(window.App.S.project);
      if (v === 'p8lang') window.P8.langPack(window.App.S.project);
      if (v === 'p8qr') window.P8.qrBadge();
      if (v === 'p8ics') window.P8.ics();
      if (v === 'p7video') window.P7.video();
      if (v === 'p7don') window.P7.addDonate('card');
      if (v === 'p7band') window.P7.addDonate('band');
      if (v === 'p7prog') window.P7.progress();
      if (v === 'blocks') window.Coach.blocks();
      if (v === 'scenes') window.Coach.scenes();
      if (v === 'harmony') window.Coach.harmony();
      if (v === 'scale') window.Coach.scaleDialog();
      if (v === 'fillInfo') window.Coach.fillInfo();
      if (v === 'fontlib' && window.Fonts) window.Fonts.libraryDialog();
      if (v === 'tour') window.Tour.start('editor');
      if (v === 'recolor') recolorDialog();
      if (v === 'styles') styleDialog();
      if (v === 'pdftools') pdfToolsMenu();
      if (v === 'anim') animDialog();
      if (v === 'qr') qrDialog();
      if (v === 'icons') window.P5.iconDialog();
      if (v === 'stock') window.P5.stockDialog();
      if (v === 'bgpat') window.P5.bgDialog();
      if (v === 'table') window.P5.tableDialog();
      if (v === 'chart') window.P5.chartDialog();
      if (v === 'pages') window.P5.makeMultiPage();
      if (v === 'catalog') window.P5.catalogDialog(doc.meta && doc.meta.catalog ? doc.meta.pageGroup : null);
      if (v === 'box') window.P5.boxDialog();
      if (v === 'p3d') window.P5.preview3D(doc);
      if (v === 'sheet') window.P5.sheetDialog(doc);
      if (v === 'pkg') window.P5.exportPackage();
      if (v === 'requests') window.P5.requestsDialog();
      if (v === 'photomock') window.Features.photoMockup(doc);
      if (v === 'calendar') window.Features.calendar({ addProject: window.App.S.project });
      if (v === 'review') sendForReview();
      if (v === 'compare') compareDialog();
      if (v === 'translate') translateDialog();
      if (v === 'label') window.Features.labelCheck(doc, () => commit());
      if (v === 'print') window.Features.printDialog(doc, () => commit());
      if (v === 'mock') window.Features.mockupDialog(doc);
      if (v === 'social') window.Features.socialPack(doc);
      if (v === 'preview') cb.onPreview && cb.onPreview();
      if (v === 'export') window.App.exportDialog(doc);
    }

    let dragIdG = () => null;
    function renderLayers() {
      const all = [...doc.layers].reverse(), qn = (st.layerQ || '').toLocaleLowerCase('tr-TR').trim();
      st.gOpen = st.gOpen || {};
      const list = qn ? all.filter((l) => (l.name || l.type).toLocaleLowerCase('tr-TR').includes(qn) || (l.type === 'text' && R.plain(l.text).toLocaleLowerCase('tr-TR').includes(qn))) : all;
      const seenG = new Set(), gCount = {}; all.forEach((l) => { if (l.group) gCount[l.group] = (gCount[l.group] || 0) + 1; });
      const rowHTML = (l) => `
        <div class="lay ${st.sel.includes(l.id) ? 'on' : ''} ${l.visible ? '' : 'hidden'}" data-id="${l.id}" draggable="true">
          <span class="ico">${l.type === 'image' ? `<img src="${esc(l.src)}" alt="">` : icon(typeIcon[l.type] || 'square')}</span>
          <span title="Yeniden adlandırmak için çift tıkla">${esc(l.name || l.type)}</span>${l.group ? '<i class="grp-tag">grup</i>' : ''}
          <button class="lb" data-l="lock" title="${l.locked ? 'Kilidi aç' : 'Kilitle'}">${icon(l.locked ? 'lock' : 'unlock')}</button>
          <button class="lb" data-l="vis" title="${l.visible ? 'Gizle' : 'Göster'}">${icon(l.visible ? 'eye' : 'eyeOff')}</button>
        </div>`;
      let rows = '';
      for (const l of list) {
        if (!qn && l.group && gCount[l.group] > 1) {
          if (!seenG.has(l.group)) { seenG.add(l.group); const open = st.gOpen[l.group] !== false, gsel = doc.layers.filter((x) => x.group === l.group).every((x) => st.sel.includes(x.id)); rows += `<div class="lay-g${gsel ? ' on' : ''}" data-g="${l.group}"><button class="lg-t" data-gt="${l.group}" title="${open ? 'Kapat' : 'Aç'}">${icon(open ? 'chevD' : 'chevR')}</button>${icon('folder')}<span>${esc(doc.meta && doc.meta.gnames && doc.meta.gnames[l.group] || 'Grup')}</span><small>${gCount[l.group]}</small></div>`; }
          if (st.gOpen[l.group] === false) continue;
          rows += rowHTML(l).replace('class="lay ', 'class="lay in-g ');
        } else rows += rowHTML(l);
      }
      pbody.innerHTML = `<div class="lay-q"><input class="inp" id="layQ" placeholder="Katman ara…" value="${esc(st.layerQ || '')}" autocomplete="off"></div><div class="layers">${rows || '<div class="empty"><b>Katman yok</b>Soldaki araçlarla şekil, metin ya da görsel ekle.</div>'}</div>
        <div class="grp" style="padding-bottom:0"><button class="btn sm" data-lm2="adjust" style="width:100%">${icon('sliders')}Ayar katmanı ekle</button></div>${doc.layers.length ? `<div class="grp" style="border-top:1px solid var(--line-soft)"><div class="iconrow"><button class="btn sm" data-lm="up">${icon('up')}Yukarı</button><button class="btn sm" data-lm="down">${icon('down')}Aşağı</button><button class="btn sm danger" data-lm="del">${icon('trash')}</button></div></div>` : ''}`;
      $$('[data-lm2=adjust]', pbody).forEach((b) => (b.onclick = addAdjustLayer));
      const lq = $('#layQ', pbody); if (lq) { lq.oninput = () => { st.layerQ = lq.value; const pos = lq.selectionStart; renderLayers(); const n2 = $('#layQ', pbody); if (n2) { n2.focus(); try { n2.setSelectionRange(pos, pos); } catch (e) {} } }; lq.onkeydown = (e) => e.stopPropagation(); }
      $$('[data-gt]', pbody).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); st.gOpen[b.dataset.gt] = st.gOpen[b.dataset.gt] === false; renderLayers(); }));
      $$('.lay-g', pbody).forEach((r) => {
        r.onclick = () => select(doc.layers.filter((x) => x.group === r.dataset.g).map((x) => x.id), false, true);
        r.ondblclick = async () => { const g = r.dataset.g, n = await UI.promptBox('Grup adı', (doc.meta && doc.meta.gnames && doc.meta.gnames[g]) || 'Grup'); if (!n) return; doc.meta = doc.meta || {}; doc.meta.gnames = Object.assign({}, doc.meta.gnames, { [g]: n }); commit(); };
        r.ondragover = (e) => { e.preventDefault(); r.classList.add('drag-over'); };
        r.ondragleave = () => r.classList.remove('drag-over');
        r.ondrop = (e) => { e.preventDefault(); r.classList.remove('drag-over'); const m = byId(dragIdG()); if (!m) return; m.group = r.dataset.g; const last = doc.layers.filter((x) => x.group === r.dataset.g && x !== m).pop(); doc.layers = doc.layers.filter((x) => x !== m); doc.layers.splice(doc.layers.indexOf(last) + 1, 0, m); commit(); UI.toast('Gruba eklendi'); };
      });
      let dragId = null; dragIdG = () => dragId;
      $$('.lay', pbody).forEach((row) => {
        const id = row.dataset.id, l = byId(id);
        row.onclick = (e) => { if (e.target.closest('.lb')) return; select([id], e.shiftKey || e.ctrlKey || e.metaKey); };
        row.ondblclick = async (e) => { if (e.target.closest('.lb')) return; const n = await UI.promptBox('Katman adı', l.name); if (n) { l.name = n; commit(); } };
        $$('.lb', row).forEach((b) => (b.onclick = () => { if (b.dataset.l === 'vis') l.visible = !l.visible; else { l.locked = !l.locked; if (l.locked) st.sel = st.sel.filter((x) => x !== id); } commit(); }));
        row.ondragstart = (e) => { dragId = id; e.dataTransfer.effectAllowed = 'move'; };
        row.ondragover = (e) => { e.preventDefault(); row.classList.add('drag-over'); };
        row.ondragleave = () => row.classList.remove('drag-over');
        row.ondrop = (e) => {
          e.preventDefault(); row.classList.remove('drag-over');
          if (!dragId || dragId === id) return;
          const moving = byId(dragId);
          doc.layers = doc.layers.filter((x) => x !== moving);
          const ti = doc.layers.indexOf(l);
          doc.layers.splice(ti + 1, 0, moving);
          commit();
        };
      });
      $$('[data-lm]', pbody).forEach((b) => (b.onclick = () => (b.dataset.lm === 'del' ? remove() : arrange(b.dataset.lm))));
    }

    // ---------- başlat
    R.ensureImageSizes(doc).then((changed) => { if (changed) { renderCanvas(); st.hist[st.hi] = snap(); } });
    pushHist();
    renderCanvas();
    setTool('select');
    renderPanel();
    requestAnimationFrame(() => {
      fit();
      M.animate(art, { opacity: [0, 1], scale: [.97, 1] }, { stiffness: 300, damping: 28 });
    });
    const ro = new ResizeObserver(() => drawOverlay());
    ro.observe(vp);

    // şablondan açıldıysa telefonda önce basit form gelsin
    if (window.Features && window.Features._openForm) { window.Features._openForm = false; if (matchMedia('(max-width: 820px)').matches) setTimeout(() => { if (document.body.contains(vp)) fillForm(); }, 900); }
    return {
      flush() { if (st.editing) endTextEdit(); },
      destroy() {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('paste', onPaste);
        window.removeEventListener('resize', onResize);
        ro.disconnect();
      },
      doc, select, fit, state: st,
      insert(layers, o = {}) {
        const g = o.group && layers.length > 1 ? R.uid() : null, ids = [];
        const at = o.bottom ? 0 : doc.layers.length;
        const ls = layers.map((l0) => { const l = R.normalize({ width: 10, height: 10, layers: [JSON.parse(JSON.stringify(l0))] }).layers[0]; if (g && !l.group) l.group = g; ids.push(l.id); return l; });
        doc.layers.splice(at, 0, ...ls); st.sel = o.select === false ? [] : ids; commit(); return ls;
      },
      commit() { commit(); },
      fillForm() { fillForm(); }, anim() { return animDialog(); }, autoAnim(sty) { autoAnimate(sty); commit(); },
      relayout() { relayoutTexts(); },
      center() { const sl = one(); return sl ? { x: sl.x + sl.w / 2, y: sl.y + sl.h / 2 } : { x: doc.width / 2, y: doc.height / 2 }; },
      pdfTools() { pdfToolsMenu(); }, qr() { return qrDialog(); }, preflight() { return preflight(); }, compare() { return compareDialog(); }, saveVersion() { return saveVersion(); }, comment(p) { return placeComment(p); }, review() { return sendForReview(); }, anim() { return animDialog(); }, autoAnimate() { autoAnimate(); commit(); }, buildFrames(sc) { return buildFrames(sc); }, saveComponent() { return saveComponent(); }, exportSelection() { exportSelection(); }, pathfinder(o) { pathfinder(o); }, nodes() { const l = one(); if (l) nodeEditor(l); }, addAdjust() { addAdjustLayer(); }, pdfAdd(k) { pdfAdd(k); },
      decompose() { const im = doc.layers.find((l) => l.type === 'image' && l.visible !== false); if (im) decomposeImage(im); },
      animDialog() { return animDialog(); },
    };
  }

  window.Editor = { mount };
})();
