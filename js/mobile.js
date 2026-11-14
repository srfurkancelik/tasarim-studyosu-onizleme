/* Tasarım Stüdyosu · mobil arayüz (v5.5)
   Telefonda ayrı pano düzeni, kaydırmalı kartlar, alttan açılan "Yeni" sayfası,
   sürükleyip kapatılan pencereler, dokunma dalgası, yöne duyarlı sayfa geçişleri,
   kaydırınca beliren kartlar. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isM = () => innerWidth < 820;
  const M = window.Motion || window.M;
  const reduce = () => (M && M.reduce ? M.reduce() : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const buzz = (n = 8) => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ic = (n) => (window.App && App.icon ? App.icon(n) : '');
  const MU = (window.MobileUI = {});

  // ---------- dokunma dalgası
  const RIP = '.btn, .chip, .qt, .fmt, .tg-card, .nav-btn, .m-tile, .m-card, .m-fab, .ns-it, .proj, .opt, .tool, .ctx-bar button, .wiz-banner, .photo-drop';
  document.addEventListener('pointerdown', (e) => {
    if (!isM() || reduce()) return;
    const el = e.target.closest(RIP); if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
    const d = document.createElement('span'); d.className = 'm-ripple';
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('m-rip-host'); el.appendChild(d);
    setTimeout(() => d.remove(), 650);
  }, { passive: true });

  // ---------- yöne duyarlı sayfa geçişi
  const ORDER = ['pano', 'studyo', 'editor', 'onizleme', 'marka', 'ayarlar'];
  MU.pageIn = function (page, from, to) {
    if (!isM() || reduce() || !M) return false;
    const a = ORDER.indexOf(from), b = ORDER.indexOf(to);
    const dir = a < 0 || b < 0 ? 0 : b > a ? 1 : -1;
    if (dir) M.animate(page, { opacity: [0, 1], x: [dir * 36, 0], scale: [0.985, 1] }, { stiffness: 380, damping: 34 });
    else M.animate(page, { opacity: [0, 1], y: [16, 0] }, { stiffness: 380, damping: 32 });
    return true;
  };

  // ---------- kaydırınca beliren öğeler
  let io = null;
  MU.reveal = function (root) {
    if (!isM() || reduce() || !M || !('IntersectionObserver' in window)) return;
    io = io || new IntersectionObserver((ents) => {
      const seen = ents.filter((x) => x.isIntersecting).map((x) => x.target);
      seen.forEach((el, i) => { io.unobserve(el); el.classList.remove('m-pre'); M.animate(el, { opacity: [0, 1], y: [22, 0], scale: [0.97, 1] }, { stiffness: 340, damping: 28, delay: i * 45 }); });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.m-rv, .sec-head, .qt, .fmt, .proj, .m-card', root).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > innerHeight * 0.92 || r.left > innerWidth) { el.classList.add('m-pre'); io.observe(el); }
    });
  };

  // ---------- alttan açılan pencereyi sürükleyip kapatma
  MU.sheet = function (box, close) {
    if (!isM()) return;
    let y0 = null, dy = 0, t0 = 0, scroller = null;
    const ov = box.parentElement;
    box.addEventListener('pointerdown', (e) => {
      const r = box.getBoundingClientRect();
      const inHandle = e.clientY - r.top < 44;
      scroller = e.target.closest('.d-body, .tg-grid, .rf-grid, [data-scroll]');
      if (!inHandle && (!scroller || scroller.scrollTop > 0)) return;
      if (e.target.closest('input, textarea, select, button, .tg-card') && !inHandle) return;
      y0 = e.clientY; dy = 0; t0 = performance.now();
    });
    const move = (e) => {
      if (y0 == null) return;
      dy = Math.max(0, e.clientY - y0);
      if (dy > 4) { box.style.transition = 'none'; box.style.transform = `translateY(${dy}px)`; ov.style.background = `rgba(8,9,12,${Math.max(0.15, 0.62 - dy / 900)})`; e.preventDefault(); }
    };
    const up = () => {
      if (y0 == null) return; y0 = null;
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > box.offsetHeight * 0.28 || v > 0.7) { buzz(6); box.style.transition = 'transform .26s cubic-bezier(.3,.7,.4,1)'; box.style.transform = 'translateY(105%)'; setTimeout(() => close(), 140); }
      else { box.style.transition = 'transform .42s cubic-bezier(.2,1.25,.35,1)'; box.style.transform = ''; ov.style.background = ''; }
    };
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  };

  // ---------- "Yeni" sayfası (artı düğmesi)
  MU.newSheet = function () {
    buzz(10);
    const F = window.Features, fm = (window.App && App.FORMATS) || [];
    const sizes = fm.slice(0, 6);
    App.dialog(`<div class="d-body ns">
      <h3>Yeni tasarım</h3>
      <div class="ns-grid">
        <button class="ns-it big" data-k="wizard"><span class="ns-ic g1">${ic('wizard')}</span><b>Sihirbaz</b><small>3 soru, 6 hazır tasarım</small></button>
        <button class="ns-it big" data-k="bagis"><span class="ns-ic g2">${ic('layers')}</span><b>Bağış · Kampanya</b><small>Ramazan, Kurban, Aşure…</small></button>
        <button class="ns-it" data-k="photo"><span class="ns-ic g3">${ic('image')}</span><b>Fotoğraf</b></button>
        <button class="ns-it" data-k="kit"><span class="ns-ic g4">${ic('copy')}</span><b>Kamp. seti</b></button>
        <button class="ns-it" data-k="hijri"><span class="ns-ic g1">${ic('moon')}</span><b>Hicri takvim</b></button>
        <button class="ns-it" data-k="thanks"><span class="ns-ic g5">${ic('heart')}</span><b>Teşekkür</b></button>
        <button class="ns-it" data-k="ref"><span class="ns-ic g4">${ic('palette')}</span><b>Benzet</b></button>
        <button class="ns-it" data-k="ai"><span class="ns-ic g5">${ic('sparkle')}</span><b>Yazarak</b></button>
        <button class="ns-it" data-k="file"><span class="ns-ic g6">${ic('file')}</span><b>PSD · PDF</b></button>
      </div>
      <div class="ns-sub">Boş tuval</div>
      <div class="ns-sizes">${sizes.map((f) => { const sc = 30 / Math.max(f.w, f.h); return `<button class="ns-sz" data-w="${f.w}" data-h="${f.h}" data-n="${esc(f.name)}"><i style="width:${Math.max(8, f.w * sc)}px;height:${Math.max(8, f.h * sc)}px"></i><b>${esc(f.name)}</b><small>${f.w}×${f.h}</small></button>`; }).join('')}</div>
    </div>`, {
      cls: 'm-new',
      onOpen: (box, close) => {
        if (M && !reduce()) M.stagger($$('.ns-it, .ns-sz', box), { opacity: [0, 1], y: [14, 0], scale: [0.94, 1] }, { each: 28, stiffness: 420, damping: 28 });
        const page = () => $('#view .page');
        $$('.ns-it', box).forEach((b) => b.onclick = () => {
          close(null); const k = b.dataset.k;
          setTimeout(() => {
            if (k === 'wizard') window.P6 && P6.wizard ? P6.wizard() : ($('#wizGo') || {}).click?.();
            else if (k === 'food') F && F.templateGallery('Gıda');
            else if (k === 'bagis') F && F.templateGallery('Bağış · Kampanya');
            else if (k === 'kit') window.P7 && P7.campaignKit();
            else if (k === 'hijri') window.P7 && P7.calendar();
            else if (k === 'thanks') window.P7 && P7.thanks();
            else if (k === 'ref') window.P6 && P6.reference();
            else if (k === 'photo') ($('#photoDrop', page()) || $('#editImg') || {}).click?.();
            else if (k === 'file') ($('#fileDrop', page()) || $('#impFile') || {}).click?.();
            else if (k === 'ai') { App.go('pano'); setTimeout(() => { const q = $('#qPrompt'); if (q) { q.scrollIntoView({ block: 'center' }); q.focus(); } }, 350); }
          }, 160);
        });
        $$('.ns-sz', box).forEach((b) => b.onclick = () => {
          close(null);
          const fmt = $(`.fmt[data-w="${b.dataset.w}"][data-h="${b.dataset.h}"]`);
          if (fmt) fmt.click(); else { App.S.project = App.newProject(+b.dataset.w, +b.dataset.h, b.dataset.n); App.go('editor'); }
        });
      },
    });
  };

  // ---------- telefona özel pano
  async function mobileDash(page) {
    const dash = $('.dash', page); if (!dash || $('.m-dash', page)) return;
    const L = window.Library, F = window.Features;
    const hour = new Date().getHours();
    const greet = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    const foods = L ? L.templates.filter((t) => t.cat === 'Bağış · Kampanya').filter((t, i, a) => a.findIndex((x) => x.arch === t.arch) === i).slice(0, 10) : [];
    const box = document.createElement('div'); box.className = 'm-dash';
    box.innerHTML = `
      <div class="m-top"><div><small>${greet}</small><h1>Bugün ne <br>basıyoruz?</h1></div><span class="m-logo"><i></i><i></i><i></i></span></div>
      <div class="m-tiles">
        <button class="m-tile" data-k="wizard"><span class="ns-ic g1">${ic('wizard')}</span><b>Sihirbaz</b></button>
        <button class="m-tile" data-k="bagis"><span class="ns-ic g5">${ic('layers')}</span><b>Bağış</b></button>
        <button class="m-tile" data-k="food"><span class="ns-ic g2">${ic('layers')}</span><b>Gıda</b></button>
        <button class="m-tile" data-k="ref"><span class="ns-ic g4">${ic('palette')}</span><b>Benzet</b></button>
      </div>
      ${foods.length ? `<div class="m-sec"><h2>Bağış · Kampanya</h2><button class="m-more" data-k="bagis">Tümü ${ic('chevR')}</button></div>
      <div class="m-rail" id="mFood">${foods.map((t) => `<button class="m-card" data-id="${t.id}"><span class="m-th" style="aspect-ratio:${t.w}/${t.h}"></span><b>${esc(t.name.split('·')[0].trim())}</b><small>${esc((t.name.split('·')[1] || '').trim())}</small></button>`).join('')}</div>
      <div class="m-dots" id="mDots">${foods.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}`;
    dash.prepend(box);
    // sihirbaz bandı, fotoğraf kutuları masaüstüne kalsın
    $$('.m-tile, .m-more', box).forEach((b) => b.onclick = () => {
      buzz(); const k = b.dataset.k;
      if (k === 'wizard') ($('#wizGo', page) || {}).click?.();
      else if (k === 'food') F && F.templateGallery('Gıda');
      else if (k === 'bagis') F && F.templateGallery('Bağış · Kampanya');
      else if (k === 'ref') window.P6 && P6.reference();
      else if (k === 'photo') ($('#photoDrop', page) || {}).click?.();
    });
    const rail = $('#mFood', box);
    if (rail && F) {
      if (window.Food && Food.load) { try { await Promise.race([Food.load(), new Promise((r) => setTimeout(r, 2500))]); } catch (e) {} }
      $$('.m-card', rail).forEach(async (c) => {
        const t = L.templates.find((x) => x.id === c.dataset.id);
        c.onclick = () => { buzz(); F.useLibraryTemplate(t, 0); };
        try { const th = await F.templateThumb(t, 0, 360); const sp = $('.m-th', c); if (th) sp.innerHTML = th; } catch (e) {}
      });
      const dots = $$('#mDots i', box);
      rail.addEventListener('scroll', () => {
        const w = rail.firstElementChild ? rail.firstElementChild.offsetWidth + 12 : 1;
        const i = Math.round(rail.scrollLeft / w);
        dots.forEach((d, j) => d.classList.toggle('on', j === i));
        // kartlara derinlik: merkeze yakın olan büyük

      }, { passive: true });
      rail.dispatchEvent(new Event('scroll'));
    }
    if (M && !reduce()) {
      M.animate($('.m-top', box), { opacity: [0, 1], y: [-10, 0] }, { stiffness: 360, damping: 30 });
      M.stagger($$('.m-tile', box), { opacity: [0, 1], y: [18, 0], scale: [0.9, 1] }, { each: 55, stiffness: 420, damping: 24 });
      M.stagger($$('.m-card', box), { opacity: [0, 1], x: [40, 0] }, { each: 60, stiffness: 300, damping: 28 });
    }
    // aşağı kaydırınca üst başlık küçülsün
    page.addEventListener('scroll', () => box.classList.toggle('m-shrunk', page.scrollTop > 40), { passive: true });
  }

  // ---------- artı düğmesi
  function fab() {
    let b = $('.m-fab');
    if (!b) {
      b = document.createElement('button'); b.className = 'm-fab'; b.setAttribute('aria-label', 'Yeni tasarım');
      b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>Yeni</span>';
      b.onclick = MU.newSheet; document.body.appendChild(b);
    }
    return b;
  }
  let lastY = 0;
  MU.mounted = function (page, route) {
    document.body.classList.toggle('is-m', isM());
    const b = fab();
    if (route === 'editor' && isM() && !page.querySelector('.m-edshare')) {
      const sh = document.createElement('button'); sh.className = 'm-edshare'; sh.setAttribute('aria-label', 'Paylaş');
      sh.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v13 M7 8l5-5 5 5 M5 14v7h14v-7"/></svg><span>Paylaş</span>';
      sh.onclick = (e) => { e.stopPropagation(); window.P7 && P7.share(); };
      setTimeout(() => { const host = page.querySelector('.ed-viewport') || page; host.appendChild(sh); }, 400);
    }
    b.hidden = !(isM() && ['pano', 'marka'].includes(route));
    if (!b.hidden && M && !reduce()) M.animate(b, { opacity: [0, 1], scale: [0.6, 1], y: [20, 0] }, { stiffness: 480, damping: 20 });
    if (!isM()) return;
    if (route === 'pano') mobileDash(page).then(() => MU.reveal(page));
    else setTimeout(() => MU.reveal(page), 60);
    // kaydırırken artı düğmesi küçülsün
    lastY = 0;
    page.addEventListener('scroll', () => { const y = page.scrollTop; b.classList.toggle('mini', y > lastY && y > 120); lastY = y; }, { passive: true });
    // artı düğmesi bir düğmenin ya da yazı kutusunun üstüne binmesin: çakışınca saklan
    const clash = () => { if (b.hidden) return; const fr = b.getBoundingClientRect(); if (!fr.width) return; const hit = [...page.querySelectorAll('button, textarea, input, .btn')].some((el) => { if (el === b) return false; const r = el.getBoundingClientRect(); return r.width && r.left < fr.right && r.right > fr.left && r.top < fr.bottom && r.bottom > fr.top; }); b.classList.toggle('m-fab-away', hit); };
    page.addEventListener('scroll', clash, { passive: true }); setTimeout(clash, 600); setTimeout(clash, 1500);
  };
  addEventListener('resize', () => document.body.classList.toggle('is-m', isM()));
})();
