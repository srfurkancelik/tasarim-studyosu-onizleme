/* Tasarım Stüdyosu v6.6 — fotoğraftan başla, renk seçenekleri, tüm hedefleri güncelle, kurban paketi, davetiye + katılım QR,
   telefon ↔ bilgisayar eşitleme, matbaaya hazır PDF, hazır metin önerileri + sesle yazma, haftalık paket, bayram/kandil mesajları,
   logo/iletişim şeridi, paylaşım geçmişi, yazdırma sayfası, bağışçı defteri, kampanya sonuç kartı, sık kullanılanlar,
   tasarımı bu hafta için yenile, yazı tipi eşleştirme, süs önerisi */
(function () {
  const P12 = (window.P12 = {});
  const A = () => window.App, R = window.Render, E = () => A() && A().S && A().S.editorApi, F = () => window.Features, L = () => window.Library, TH = () => window.FoodTheme;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (m, e) => A().toast(m, e), icon = (...a) => window.icon(...a), esc = (s) => R.esc(s);
  const r1 = (v) => Math.round(v * 10) / 10;
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const isM = () => matchMedia('(max-width: 820px)').matches;
  const TRM = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const trDate = (d) => `${d.getDate()} ${TRM[d.getMonth()]} ${d.getFullYear()}`;
  const brand = () => (A().S && A().S.brand) || {};
  const bcol = (i, d) => ((brand().colors || []).filter(Boolean)[i]) || d;
  const slug = (s) => String(s || 'dosya').replace(/[^\wçğıöşüÇĞİÖŞÜ]+/g, '-').replace(/^-|-$/g, '') || 'dosya';
  const tpl = (id) => L().templates.find((t) => t.id === id);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const parseRows = (txt) => String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s*[;|\t]\s*/));
  const toDataURL = (b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
  const busy = (t) => { const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = `<i class="b"></i><span>${esc(t)}</span>`; const box = $('#toasts'); if (box) box.appendChild(el); return { set: (s) => { const sp = $('span', el); if (sp) sp.textContent = s; }, done: () => el.remove() }; };
  const svgData = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const waLink = (phone, text) => { let n = String(phone || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '90' + n.slice(1); return 'https://wa.me/' + (n || '') + '?text=' + encodeURIComponent(text); };
  const copy = async (t) => { try { await navigator.clipboard.writeText(t); toast('Kopyalandı'); } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Kopyalandı'); } };
  const T = (name, text, x, y, w, fs, o = {}) => Object.assign({ type: 'text', name, text: String(text), x: r1(x), y: r1(y), w: r1(w), h: r1(fs * 1.25), fontSize: Math.round(fs), fontFamily: 'Poppins', fontWeight: 500, fill: '#FFFFFF', align: 'center', lineHeight: 1.25 }, o);
  const Rc = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fill, radius: 0 }, o);
  const Im = (name, src, x, y, w, h, o = {}) => Object.assign({ type: 'image', name, src, x: r1(x), y: r1(y), w: r1(w), h: r1(h), fit: 'contain', filters: {} }, o);
  const docOf = (W, H, layers, bg) => { const d = R.normalize({ width: W, height: H, background: bg || { type: 'solid', color: '#FFFFFF' }, layers }); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; };
  const open = (d, name, meta) => window.P10.makeDoc(d.width, d.height, name, d.layers, d.background, meta || {}, true);
  const pv = (el, d) => { if (el) el.innerHTML = R.renderSVG(d, { fit: true, prefix: 'p12' + uid().slice(0, 5) }); };

  // ================================================================ 1) fotoğraftan başla
  const PHOTO_T = { 'Bağış': ['b-kurban-adak', 'b-kurban-mesaj', 'b-tesekkur', 'b-kumanya', 'b-kurban-paylas', 'b-cuma', 'b-ramazan-koli', 'b-kurban-sayac'], 'Gıda': ['g-cerceve-gece', 'g-kahve-split', 'g-afis-bowl', 'g-salata', 'g-tatli-hero', 'g-burger-split', 'g-zeytinyagi-hero', 'g-pizza-hero'] };
  P12.photoStart = async function () {
    const src = await new Promise((res) => A().pickFiles(async (files) => { const f = files[0]; if (!f) return res(null); const b = busy('Fotoğraf yükleniyor…'); try { const r = await A().uploadFile(f); res(r.url); } catch (e) { toast(e.message, true); res(null); } finally { b.done(); } }, false));
    if (!src) return;
    const [nw, nh] = await new Promise((res) => { const im = new Image(); im.onload = () => res([im.naturalWidth, im.naturalHeight]); im.onerror = () => res([1000, 1000]); im.src = src; });
    const prod = { src, nw, nh, cut: false };
    if (window.Food && window.Food.load) await window.Food.load();
    let cat = 'Bağış';
    const build = (id) => { const t = tpl(id); if (!t || !t.buildAt) return null; try { const d = R.normalize(L().instantiateAt(t, 0, null, 1080, 1350, prod)); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; } catch (e) { return null; } };
    await A().dialog(`<div class="d-body"><h3>${icon('image')} Fotoğrafına uyan tasarımlar</h3>
      <div class="chips" id="psC">${Object.keys(PHOTO_T).map((k, i) => `<button class="chip ${i ? '' : 'on'}" data-c="${k}">${k}</button>`).join('')}</div>
      <div class="ps-grid" id="psG"></div><p class="muted" style="font-size:12px;margin:8px 0 0">Beğendiğine dokun; editörde ya da formla yazılarını değiştirirsin.</p></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const draw = () => {
          const ids = PHOTO_T[cat].filter((id) => tpl(id));
          $('#psG', box).innerHTML = ids.map((id) => `<button class="ps-it" data-id="${id}"><span class="ps-th"></span><small>${esc(tpl(id).name)}</small></button>`).join('');
          $$('.ps-it', box).forEach((b, i) => setTimeout(() => { const d = build(b.dataset.id); if (d) pv($('.ps-th', b), d); }, i * 40));
        };
        $('#psC', box).onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#psC .chip', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
        $('#psG', box).onclick = async (e) => {
          const b = e.target.closest('[data-id]'); if (!b) return; close();
          const t = tpl(b.dataset.id), d = build(b.dataset.id); if (!d) return;
          F()._openForm = true;
          await open(d, t.name.split('·')[0].trim(), Object.assign({}, d.meta || {}, { template: t.id }));
        };
        draw();
      },
    });
  };

  // ================================================================ 2) renk seçenekleri
  const hx = (c) => { const p = R.parseColor(c); return p && p.hex ? p : null; };
  const toHsl = (hex) => { const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
  const fromHsl = (h, s, l) => { h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const mapCol = (c, fn) => { if (typeof c !== 'string' || /^(none|transparent)$/i.test(c)) return c; const p = hx(c); if (!p) return c; const [h, s, l] = toHsl(p.hex); if (s < 0.12 || l < 0.06 || l > 0.96) return c; const out = fn(h, s, l); return p.a != null && p.a < 1 ? `rgba(${parseInt(out.slice(1, 3), 16)},${parseInt(out.slice(3, 5), 16)},${parseInt(out.slice(5, 7), 16)},${p.a})` : out; };
  const walk = (o, fn) => { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { const v = o[k]; if ((k === 'fill' || k === 'stroke' || k === 'color' || k === 'bgFill') && typeof v === 'string') o[k] = mapCol(v, fn); else if (k === 'colors' && Array.isArray(v)) o[k] = v.map((x) => mapCol(x, fn)); else if (k === 'shadow' || k === 'src' || k === 'text') continue; else if (typeof v === 'object') walk(v, fn); } };
  const VARS = [['Asıl', 0, 1], ['Zümrüt', 140, 1], ['Lacivert', 215, 1], ['Bordo', 345, 1.05], ['Altın', 42, 1], ['Mor', 275, 1]];
  P12.colorVariants = async function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d0 = api.doc;
    // ana rengi bul: en büyük alanlı renkli katman
    let base = 0, best = 0; d0.layers.forEach((l) => { const p = typeof l.fill === 'string' && hx(l.fill); if (!p) return; const [h, s] = toHsl(p.hex); const a = (l.w || 0) * (l.h || 0) * s; if (a > best) { best = a; base = h; } });
    const variant = (k) => { const d = JSON.parse(JSON.stringify(R.clean ? R.clean(d0) : d0)); if (!k) return d; const [, hue, sat] = VARS[k]; const dh = hue - base; walk(d.layers, (h, s, l) => fromHsl(h + dh, Math.min(1, s * sat), l)); if (d.background) walk({ b: d.background }, (h, s, l) => fromHsl(h + dh, Math.min(1, s * sat), l)); d.layers.forEach((l) => l.type === 'text' && R.layoutText(l)); return d; };
    const res = await A().dialog(`<div class="d-body"><h3>${icon('palette')} Renk seçenekleri</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Aynı tasarım, altı farklı renkte. Fotoğraflar değişmez. Beğendiğine dokun.</p>
      <div class="cv-grid">${VARS.map(([n], i) => `<button class="cv-it" data-k="${i}"><span class="cv-th" id="cv${i}"></span><small>${n}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => { VARS.forEach((_, i) => setTimeout(() => pv($('#cv' + i, box), variant(i)), i * 30)); $$('.cv-it', box).forEach((b) => (b.onclick = () => close(+b.dataset.k))); },
    });
    if (res == null || !res) return;
    const v = variant(res);
    d0.layers.forEach((l, i) => { const n = v.layers[i]; if (!n) return; ['fill', 'stroke', 'color', 'bgFill', 'fx', 'colors'].forEach((k) => { if (n[k] !== undefined) l[k] = n[k]; }); });
    if (v.background) d0.background = v.background;
    api.commit(); toast(`${VARS[res][0]} renkler uygulandı. Beğenmezsen Geri al.`);
  };

  // ================================================================ 3) bütün bağış takibi tasarımlarını tek yerden güncelle
  P12.goalAll = async function () {
    const list = await A().api('projects').catch(() => []);
    const docs = [];
    const b0 = busy('Bağış takibi tasarımları aranıyor…');
    for (const p of list) { try { const d = await A().api('projects/' + p.id); if (d && (d.layers || []).some((l) => l.progress)) docs.push(d); } catch (e) {} }
    b0.done();
    if (!docs.length) return toast('Bağış takibi tasarımı bulunamadı. Şablonlar → Bağış takibi ile başlayabilirsin.', true);
    const pr = docs[0].layers.find((l) => l.progress).progress;
    const v = await A().dialog(`<div class="d-body"><h3>${icon('goal')} Bağış hedefini her yerde güncelle</h3><p class="muted" style="font-size:13px;margin:0 0 10px">${docs.length} bağış takibi tasarımı bulundu. Rakamı bir kez yaz, hepsi birlikte güncellensin.</p>
      <div class="form-grid"><label class="field"><span>Toplanan</span><input class="inp" id="gaG" type="number" inputmode="numeric" value="${pr.got}"></label><label class="field"><span>Hedef</span><input class="inp" id="gaH" type="number" inputmode="numeric" value="${pr.goal}"></label>
      <label class="field"><span>Birim</span><input class="inp" id="gaU" value="${esc(pr.unit || 'koli')}"></label><label class="field"><span>Bitiş tarihi</span><input class="inp" id="gaE" type="date" value="${esc(pr.end || '')}"></label></div>
      <div class="ga-list">${docs.map((d) => `<label class="chk"><input type="checkbox" checked data-id="${d.id}"> ${esc(d.name || 'Tasarım')}</label>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="gaOk">Hepsini güncelle</button></div>`, { onOpen: (box, close) => { $('#gaOk', box).onclick = () => close({ got: +$('#gaG', box).value || 0, goal: +$('#gaH', box).value || 1, unit: $('#gaU', box).value, end: $('#gaE', box).value, ids: $$('[data-id]', box).filter((x) => x.checked).map((x) => x.dataset.id) }); } });
    if (!v) return;
    let n = 0;
    for (const d of docs.filter((x) => v.ids.includes(x.id))) {
      window.P7.applyProgress(d, { got: v.got, goal: v.goal, unit: v.unit, end: v.end });
      try { d.thumb = await R.thumbnail(d); } catch (e) {}
      await A().saveProject(d).catch(() => {}); n++;
      if (A().S.project && A().S.project.id === d.id && E()) { window.P7.applyProgress(E().doc, v); E().commit(); }
    }
    toast(`${n} tasarım güncellendi: %${Math.round((v.got / v.goal) * 100)}`);
  };

  // ================================================================ 4) kurban paketi
  P12.kurbanPack = async function () {
    const saved = LS.get('ts_kurban_list', '');
    await A().dialog(`<div class="d-body"><h3>${icon('heart')} Kurban paketi</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Hissedar listesini bir kez yaz: <b>Ad Soyad ; telefon ; hisse no ; bedel</b>. Aynı listeden vekâlet formu, “kurbanınız kesildi” kartı, teşekkür kartı ve WhatsApp mesajları çıkar.</p>
      <label class="field"><span>Hissedarlar</span><textarea class="inp" id="kpL" rows="7" placeholder="Mehmet Kaya ; 0555 111 22 33 ; 3/7 ; 3250 TL&#10;Fatma Şahin ; 0532 444 55 66 ; 4/7 ; 3250 TL">${esc(saved)}</textarea></label>
      <div class="form-grid"><label class="field"><span>Kesim yeri</span><input class="inp" id="kpY" value="${esc(LS.get('ts_kurban_yer', ''))}" placeholder="ör. Panama"></label><label class="field"><span>Kesim tarihi</span><input class="inp" id="kpT" value="${esc(trDate(new Date()))}"></label></div>
      <small class="muted" id="kpN"></small>
      <div class="kp-acts">
        <button class="kp-a" data-a="vekalet">${icon('file')}<b>1 · Vekâlet formları</b><small>bayramdan önce · tek PDF</small></button>
        <button class="kp-a" data-a="msg1">${icon('chat')}<b>2 · “Vekâletiniz alındı” mesajı</b><small>her kişiye WhatsApp metni</small></button>
        <button class="kp-a" data-a="kesildi">${icon('heart')}<b>3 · “Kurbanınız kesildi” kartları</b><small>kesimden sonra · kişiye özel</small></button>
        <button class="kp-a" data-a="msg2">${icon('chat')}<b>4 · “Kesildi” mesajı</b><small>her kişiye WhatsApp metni</small></button>
        <button class="kp-a" data-a="tesekkur">${icon('heart')}<b>5 · Teşekkür kartları</b><small>bayram sonrası</small></button>
        <button class="kp-a" data-a="defter">${icon('list')}<b>Bağışçı defterine ekle</b><small>bir dahaki sefere hazır</small></button>
      </div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const rows = () => parseRows($('#kpL', box).value).map((r) => ({ name: r[0] || '', phone: r[1] || '', share: r[2] || '', amount: r[3] || '' }));
        const cnt = () => { const n = rows().length; $('#kpN', box).textContent = n ? `${n} hissedar` : 'Liste boş'; LS.set('ts_kurban_list', $('#kpL', box).value); LS.set('ts_kurban_yer', $('#kpY', box).value); };
        $('#kpL', box).oninput = cnt; $('#kpY', box).oninput = cnt; cnt();
        $$('.kp-a', box).forEach((b) => (b.onclick = async () => {
          const rs = rows(), yer = $('#kpY', box).value, tarih = $('#kpT', box).value, org = brand().name || 'Derneğimiz';
          if (!rs.length && b.dataset.a !== 'vekalet') return toast('Önce hissedar listesini yaz', true);
          const a = b.dataset.a;
          if (a === 'vekalet') { close(); return window.P11.proxyForm({ list: rs.map((r) => [r.name, r.phone, r.share, r.amount].join(' ; ')).join('\n'), place: yer }); }
          if (a === 'kesildi' || a === 'tesekkur') { close(); return window.P7.thanks({ kind: a === 'kesildi' ? 'b-kesildi' : 'b-tesekkur', list: rs.map((r) => [r.name, r.share, tarih, yer].join(' ; ')).join('\n') }); }
          if (a === 'msg1' || a === 'msg2') return P12.messages(rs.map((r) => ({ name: r.name, phone: r.phone, text: a === 'msg1' ? `Selamün aleyküm ${r.name}, ${new Date().getFullYear()} kurban vekâletiniz alınmıştır${r.share ? ' (hisse ' + r.share + ')' : ''}. Kurbanınız kesildiğinde size haber vereceğiz. Allah kabul etsin. — ${org}` : `Selamün aleyküm ${r.name}, kurbanınız ${tarih}${yer ? ' tarihinde ' + yer + '’da' : ''} itina ile kesilmiş, etleri ihtiyaç sahiplerine ulaştırılmıştır. Allah kabul etsin. — ${org}` })), a === 'msg1' ? 'Vekâletiniz alındı mesajları' : 'Kurbanınız kesildi mesajları');
          if (a === 'defter') { const n = P12.donorAdd(rs.map((r) => ({ name: r.name, phone: r.phone, amount: r.amount, kind: 'Kurban hissesi' }))); toast(`${n} kişi bağışçı defterine eklendi`); }
        }));
      },
    });
  };
  // kişiye özel mesaj listesi (kopyala / WhatsApp'ta aç)
  P12.messages = function (items, title = 'Mesajlar') {
    return A().dialog(`<div class="d-body"><h3>${icon('chat')} ${esc(title)}</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Her mesajı kopyalayabilir ya da telefon numarası varsa doğrudan WhatsApp'ta açabilirsin.</p>
      <div class="msg-list">${items.map((m, i) => `<div class="msg-it"><div class="msg-h"><b>${esc(m.name || 'Kişi ' + (i + 1))}</b><small>${esc(m.phone || '')}</small></div><p>${esc(m.text)}</p><div class="msg-a"><button class="btn sm" data-c="${i}">${icon('copy')}Kopyala</button><a class="btn sm primary" target="_blank" rel="noopener" href="${esc(waLink(m.phone, m.text))}">${icon('send')}WhatsApp</a></div></div>`).join('')}</div></div>
      <div class="d-foot"><button class="btn" id="msAll">${icon('copy')}Hepsini kopyala</button><button class="btn primary" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => { $$('[data-c]', box).forEach((b) => (b.onclick = () => copy(items[+b.dataset.c].text))); $('#msAll', box).onclick = () => copy(items.map((m) => `${m.name}${m.phone ? ' (' + m.phone + ')' : ''}:\n${m.text}`).join('\n\n')); },
    });
  };

  // ================================================================ 5) davetiye + katılım QR
  P12.inviteDoc = function (o) {
    const W = 1080, H = 1350, c1 = bcol(0, '#14532D'), gold = '#D9C27A', L0 = [];
    if (TH() && TH().night) L0.push(Im('Süs · gece', TH().night(W, H, o.dark || '#0E2A47', '#1B4A73'), 0, 0, W, H, { fit: 'fill', locked: true }));
    if (TH() && TH().garland) L0.push(Im('Süs · ışıklar', TH().garland(W, Math.round(W * 0.2)), 0, 0, W, W * 0.2, { fit: 'fill' }));
    L0.push(T('Üst etiket', (o.org || brand().name || 'Kurum adı').toLocaleUpperCase('tr-TR'), 80, 210, W - 160, 26, { fill: gold, fontWeight: 700, letterSpacing: 4 }));
    L0.push(T('Başlık', o.title || 'İftar Programı', 70, 260, W - 140, 92, { fontFamily: 'DM Serif Display', fontWeight: 400, lineHeight: 1.05 }));
    L0.push(T('Davet', o.sub || 'Sizleri de aramızda görmekten mutluluk duyarız.', 120, 420, W - 240, 30, { fill: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }));
    const rows = [['TARİH', o.date], ['SAAT', o.time], ['YER', o.place]].filter((r) => r[1]);
    rows.forEach(([k, v], i) => { const y = 560 + i * 104; L0.push(Rc('Satır zemini', 150, y, W - 300, 86, 'rgba(255,255,255,0.08)', { radius: 18 })); L0.push(T('Etiket · ' + k, k, 180, y + 16, 200, 20, { fill: gold, fontWeight: 700, align: 'left', letterSpacing: 2 })); L0.push(T(k === 'TARİH' ? 'Tarih' : k === 'SAAT' ? 'Saat' : 'Yer', v, 180, y + 42, W - 360, 32, { fontWeight: 600, align: 'left' })); });
    const qy = 560 + rows.length * 104 + 40;
    if (o.phone) {
      const url = waLink(o.phone, `Katılıyorum: ${o.title || 'program'}${o.date ? ' · ' + o.date : ''} — Ad Soyad: `);
      L0.push(Rc('QR zemini', W / 2 - 120, qy, 240, 240, '#FFFFFF', { radius: 20 }));
      L0.push(Im('Katılım QR', svgData(window.Tools.qrSVG(url, { quiet: 2 })), W / 2 - 105, qy + 15, 210, 210, { fit: 'contain' }));
      L0.push(T('QR açıklama', 'Katılacaksan kodu okut, WhatsApp’tan haber ver', 120, qy + 256, W - 240, 24, { fill: 'rgba(255,255,255,0.85)' }));
    }
    return docOf(W, H, L0, { type: 'solid', color: '#0E2A47' });
  };
  P12.invite = async function () {
    const s0 = LS.get('ts_invite', {});
    const res = await A().dialog(`<div class="d-body"><h3>${icon('calendar')} Davetiye ve katılım kodu</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Karekodu okutan kişi WhatsApp'tan “Katılıyorum” mesajıyla sana haber verir; kaç kişinin geleceğini önceden bilirsin.</p>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field" style="grid-column:1/-1"><span>Program adı</span><input class="inp" id="ivT" value="${esc(s0.title || 'İftar Programı')}"></label>
        <label class="field" style="grid-column:1/-1"><span>Davet cümlesi</span><input class="inp" id="ivS" value="${esc(s0.sub || 'Sizleri de aramızda görmekten mutluluk duyarız.')}"></label>
        <label class="field"><span>Tarih</span><input class="inp" id="ivD" value="${esc(s0.date || trDate(new Date()))}"></label><label class="field"><span>Saat</span><input class="inp" id="ivH" value="${esc(s0.time || '19:30')}"></label>
        <label class="field" style="grid-column:1/-1"><span>Yer</span><input class="inp" id="ivP" value="${esc(s0.place || '')}" placeholder="ör. Cami bahçesi"></label>
        <label class="field" style="grid-column:1/-1"><span>Katılım için WhatsApp numarası</span><input class="inp" id="ivW" inputmode="tel" value="${esc(s0.phone || brand().phone || '')}" placeholder="0555 000 00 00"></label></div>
        <div class="kit-pv"><div class="kit-th" id="ivV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ivGo">Davetiyeyi aç</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const o = () => ({ title: $('#ivT', box).value, sub: $('#ivS', box).value, date: $('#ivD', box).value, time: $('#ivH', box).value, place: $('#ivP', box).value, phone: $('#ivW', box).value });
        const draw = () => pv($('#ivV', box), P12.inviteDoc(o()));
        let tm = 0; $$('input', box).forEach((x) => (x.oninput = () => { clearTimeout(tm); tm = setTimeout(draw, 200); })); draw();
        $('#ivGo', box).onclick = () => close(o());
      },
    });
    if (!res) return;
    LS.set('ts_invite', res);
    const d = P12.inviteDoc(res);
    await open(d, 'Davetiye · ' + res.title, { folder: 'Davetiyeler' });
  };

  // ================================================================ 6) telefon ↔ bilgisayar eşitleme (tek dosya)
  const inline = async (d) => {
    for (const l of d.layers || []) {
      if (l.type !== 'image' || !l.src || /^data:|^samples\//.test(l.src)) continue;
      try { const r = await fetch(l.src); if (r.ok) l.src = await toDataURL(await r.blob()); } catch (e) {}
      if (l.origSrc && !/^data:/.test(l.origSrc)) delete l.origSrc;
    }
    return d;
  };
  P12.syncExport = async function () {
    const list = await A().api('projects').catch(() => []);
    const b = busy('Tasarımlar toplanıyor…'), out = [];
    try {
      for (let i = 0; i < list.length; i++) { b.set(`Tasarım ${i + 1} / ${list.length}`); try { const d = await A().api('projects/' + list[i].id); out.push(await inline(d)); } catch (e) {} }
      const pack = { app: 'tasarim-studyosu-esitleme', v: 1, t: Date.now(), from: window.TS_CLOUD ? 'telefon' : 'bilgisayar', projects: out, donors: LS.get('ts_donors', []), plan: LS.get('ts_plan', {}), vakit: LS.get('ts_vakit', null) };
      const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' });
      R.download(blob, `tasarimlarim-${ymd(new Date())}.esitle.json`);
      toast(`${out.length} tasarım tek dosyaya yazıldı. Bu dosyayı öbür cihazda “Eşitle → Dosyayı al” ile aç.`);
    } finally { b.done(); }
  };
  P12.syncImport = function () {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      let pack; try { pack = JSON.parse(await f.text()); } catch (e) { return toast('Dosya okunamadı', true); }
      if (!pack || pack.app !== 'tasarim-studyosu-esitleme') return toast('Bu bir eşitleme dosyası değil', true);
      const local = await A().api('projects').catch(() => []), map = Object.fromEntries(local.map((p) => [p.id, p.updated || 0]));
      const b = busy('Tasarımlar alınıyor…'); let add = 0, upd = 0, same = 0;
      try {
        for (let i = 0; i < pack.projects.length; i++) {
          const d = pack.projects[i]; b.set(`Tasarım ${i + 1} / ${pack.projects.length}`);
          if (map[d.id] && (map[d.id] >= (d.updated || 0))) { same++; continue; }
          for (const l of d.layers || []) if (l.type === 'image' && /^data:image\/(png|jpe?g|webp|gif)/.test(l.src || '')) { try { const r = await A().api('upload', { body: { data: l.src, name: (l.name || 'gorsel') + '.png' } }); if (r && r.url) l.src = r.url; } catch (e) {} }
          const wasNew = !map[d.id]; delete d.owner;
          await A().api('projects', { body: d }); wasNew ? add++ : upd++;
        }
        // bağışçı defteri ve plan birleşsin
        if (Array.isArray(pack.donors) && pack.donors.length) { const cur = LS.get('ts_donors', []), ids = new Set(cur.map((x) => x.id)); pack.donors.forEach((x) => { if (!ids.has(x.id)) cur.push(x); }); LS.set('ts_donors', cur); }
        if (pack.plan) LS.set('ts_plan', Object.assign({}, pack.plan, LS.get('ts_plan', {})));
        if (pack.vakit && !LS.get('ts_vakit', null)) LS.set('ts_vakit', pack.vakit);
      } finally { b.done(); }
      toast(`Eşitlendi: ${add} yeni, ${upd} güncellenen tasarım${same ? `, ${same} zaten aynıydı` : ''}`);
      if ((location.hash || '').includes('pano')) A().go('pano');
    };
    inp.click();
  };
  P12.sync = function () {
    return A().dialog(`<div class="d-body"><h3>${icon('copy')} Telefon ↔ bilgisayar eşitleme</h3>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Telefondaki ve bilgisayardaki uygulama ayrı yerlerde saklar. Eşitlemek için:<br><b>1.</b> Bir cihazda <b>Dosyaya yaz</b> → tek dosya iner.<br><b>2.</b> Dosyayı öbür cihaza gönder (WhatsApp, e-posta, Drive).<br><b>3.</b> Öbür cihazda <b>Dosyayı al</b> → yeni ve daha yeni tasarımlar eklenir, hiçbir şey silinmez.</p>
      <div class="kp-acts"><button class="kp-a" id="syE">${icon('download')}<b>Dosyaya yaz</b><small>tüm tasarımlar, bağışçı defteri, plan</small></button><button class="kp-a" id="syI">${icon('upload')}<b>Dosyayı al</b><small>öbür cihazdan gelen eşitleme dosyası</small></button></div></div>
      <div class="d-foot"><button class="btn primary" data-close>Kapat</button></div>`, { onOpen: (box, close) => { $('#syE', box).onclick = () => { close(); P12.syncExport(); }; $('#syI', box).onclick = () => { close(); P12.syncImport(); }; } });
  };

  // ================================================================ 7) matbaaya hazır PDF (3 mm taşma payı + kesim işaretleri)
  const pdfOne = (jpg, iw, ih, ptW, ptH) => {
    const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
    const push = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); len += u.length; };
    const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
    obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW.toFixed(2)} ${ptH.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
    obj(4, () => { push(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); push(jpg); push('\nendstream'); });
    const cs = `q ${ptW.toFixed(2)} 0 0 ${ptH.toFixed(2)} 0 0 cm /Im0 Do Q`;
    obj(5, () => push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    const xref = len; push(`xref\n0 6\n0000000000 65535 f \n${offs.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  };
  const mmOf = (d) => { if (d.meta && d.meta.mm) return d.meta.mm; const r = d.width / d.height; if (Math.abs(r - 210 / 297) < 0.02) return { w: 210, h: 297 }; if (Math.abs(r - 297 / 210) < 0.02) return { w: 297, h: 210 }; return { w: r1(d.width / 300 * 25.4), h: r1(d.height / 300 * 25.4) }; };
  P12.printPDF = async function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d = api.doc, mm = mmOf(d), bleed = 3, mark = 8, dpi = 300;
    const pxmm = Math.min(dpi / 25.4, 6000 / (mm.w + 2 * (bleed + mark)), 6000 / (mm.h + 2 * (bleed + mark)));
    const b = busy('Matbaa dosyası hazırlanıyor…');
    try {
      const cw = Math.round(mm.w * pxmm), ch = Math.round(mm.h * pxmm), bp = Math.round(bleed * pxmm), mp = Math.round(mark * pxmm);
      const src = await R.exportCanvas(d, cw / d.width);
      const c = document.createElement('canvas'); c.width = cw + 2 * (bp + mp); c.height = ch + 2 * (bp + mp);
      const x = c.getContext('2d'); x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, c.width, c.height);
      const ox = bp + mp, oy = bp + mp, sw = src.width, sh = src.height;
      // kenar pikselleri taşma payına uzatılır (zemin kesimde beyaz çizgi bırakmaz)
      x.drawImage(src, 0, 0, 1, sh, ox - bp, oy, bp, ch); x.drawImage(src, sw - 1, 0, 1, sh, ox + cw, oy, bp, ch);
      x.drawImage(src, 0, 0, sw, 1, ox, oy - bp, cw, bp); x.drawImage(src, 0, sh - 1, sw, 1, ox, oy + ch, cw, bp);
      [[0, 0, ox - bp, oy - bp], [sw - 1, 0, ox + cw, oy - bp], [0, sh - 1, ox - bp, oy + ch], [sw - 1, sh - 1, ox + cw, oy + ch]].forEach(([sx, sy, dx, dy]) => x.drawImage(src, sx, sy, 1, 1, dx, dy, bp, bp));
      x.drawImage(src, ox, oy, cw, ch);
      // kesim işaretleri
      x.strokeStyle = '#000'; x.lineWidth = Math.max(1, pxmm * 0.1);
      const ln = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
      const gap = bp + pxmm * 1;
      [[ox, oy], [ox + cw, oy], [ox, oy + ch], [ox + cw, oy + ch]].forEach(([px, py]) => { const sx = px === ox ? -1 : 1, sy = py === oy ? -1 : 1; ln(px + sx * gap, py, px + sx * (gap + mp - pxmm), py); ln(px, py + sy * gap, px, py + sy * (gap + mp - pxmm)); });
      x.fillStyle = '#000'; x.font = `${Math.round(pxmm * 2.4)}px sans-serif`; x.fillText(`${d.name || 'Tasarım'} · ${mm.w}×${mm.h} mm · 3 mm taşma payı`, ox, Math.round(mp * 0.6));
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.95));
      const jpg = new Uint8Array(await blob.arrayBuffer());
      const pt = 72 / 25.4, pdf = pdfOne(jpg, c.width, c.height, (mm.w + 2 * (bleed + mark)) * pt, (mm.h + 2 * (bleed + mark)) * pt);
      R.download(pdf, slug(d.name) + '-matbaa.pdf');
      toast(`Matbaa PDF’i indi: ${mm.w}×${mm.h} mm, 3 mm taşma payı ve kesim işaretleriyle`);
    } catch (e) { toast('Hazırlanamadı: ' + e.message, true); } finally { b.done(); }
  };

  // ================================================================ 15) yazdırma sayfası (A4'e 2/4/8 adet)
  P12.printSheet = async function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d = api.doc;
    const n = await A().dialog(`<div class="d-body"><h3>${icon('layers')} Yazdırma sayfası</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Tasarımı bir A4 sayfaya çoğaltır; ev yazıcısından basıp kesim çizgilerinden kesersin.</p>
      <div class="kp-acts">${[[2, '2 adet', 'büyük kart, davetiye'], [4, '4 adet', 'teşekkür kartı, A6'], [8, '8 adet', 'küçük kart, etiket']].map(([k, a, s]) => `<button class="kp-a" data-n="${k}">${icon('layers')}<b>${a}</b><small>${s}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, { onOpen: (box, close) => $$('[data-n]', box).forEach((b) => (b.onclick = () => close(+b.dataset.n))) });
    if (!n) return;
    const bz = busy('Sayfa hazırlanıyor…');
    try {
      const PW = 2480, PH = 3508, M = 90, land = d.width > d.height;
      let cols = n === 2 ? 1 : 2, rows = n / cols;
      if (land && n === 2) { cols = 1; rows = 2; }
      const cw = (PW - 2 * M) / cols, chh = (PH - 2 * M) / rows, pad = 24;
      const k = Math.min((cw - 2 * pad) / d.width, (chh - 2 * pad) / d.height);
      const src = await R.exportCanvas(d, k);
      const c = document.createElement('canvas'); c.width = PW; c.height = PH; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH);
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const cx = M + q * cw + (cw - src.width) / 2, cy = M + r * chh + (chh - src.height) / 2; x.drawImage(src, cx, cy); }
      x.strokeStyle = '#9CA3AF'; x.setLineDash([16, 12]); x.lineWidth = 2;
      for (let q = 1; q < cols; q++) { x.beginPath(); x.moveTo(M + q * cw, M / 2); x.lineTo(M + q * cw, PH - M / 2); x.stroke(); }
      for (let r = 1; r < rows; r++) { x.beginPath(); x.moveTo(M / 2, M + r * chh); x.lineTo(PW - M / 2, M + r * chh); x.stroke(); }
      const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
      const pdf = await window.P9.pdfFromJpegs([{ blob, w: PW, h: PH }]);
      R.download(pdf, slug(d.name) + `-${n}li-A4.pdf`); toast(`A4 sayfaya ${n} adet yerleştirildi; kesik çizgilerden kesebilirsin`);
    } catch (e) { toast('Hazırlanamadı: ' + e.message, true); } finally { bz.done(); }
  };

  const SCRIPT = /Caveat|Ms Madi|Kaushan|Alex Brush|Amiri|Reem Kufi|Aref Ruqaa/i;
  // ================================================================ 8) hazır metin önerileri  · 22) sesle yazma
  const BANK = {
    kandil: { head: ['Kandiliniz mübarek olsun', 'Hayırlı Kandiller', 'Mübarek gecede dualarınızda olalım', 'Kandil gecesi dua vakti', 'Bu gece rahmet gecesi'], body: ['Rabbim dualarınızı kabul etsin, gecenizi bereketli kılsın.', 'Bu mübarek gecenin hürmetine dualarınız kabul olsun.', 'Gönlünüz huzur, haneniz bereketle dolsun.', 'Dualarınızda ihtiyaç sahibi kardeşlerimizi unutmayın.', 'Allah bu geceyi hakkımızda hayırlara vesile kılsın.'] },
    kurban: { head: ['Kurbanınız emin ellerde', 'Bir hisse, bir sofra', 'Kurbanını paylaş, iyiliğe ortak ol', 'Bu bayram sen de vesile ol', 'Kurban ibadetini birlikte yaşayalım'], body: ['Kurbanınız itina ile kesilir, etleri ihtiyaç sahiplerine ulaştırılır.', 'Kesim videosu size iletilir.', 'Uzak diyarlardaki kardeşlerimizin sofrasına ortak olun.', 'Hisse bedeli ve vekâlet için bizimle iletişime geçin.', 'Allah kabul etsin, hayrınızı çoğaltsın.'] },
    ramazan: { head: ['Hoş geldin Ya Şehr-i Ramazan', 'Bir koli, bir sofra', 'Ramazan’ın bereketi paylaştıkça artar', 'İftar sofralarına ortak ol', 'Sen de bir aileye ulaş'], body: ['Bir ailenin bir aylık iftar ve sahur ihtiyacını karşılayın.', 'Koliniz ihtiyaç sahibi ailelere elden ulaştırılır.', 'Ramazan’ın bereketini birlikte paylaşalım.', 'Desteğiniz bir sofraya umut olur.', 'Allah oruçlarınızı ve ibadetlerinizi kabul etsin.'] },
    cuma: { head: ['Hayırlı Cumalar', 'Cumanız mübarek olsun', 'Cuma, müminin bayramıdır', 'Dualarınız kabul olsun', 'Bereketli bir cuma dileğiyle'], body: ['Cumanız mübarek, dualarınız makbul olsun.', 'Bu mübarek günde gönüllerimiz huzur bulsun.', 'Cuma gününe salavatla başlayalım.', 'Rabbim dualarımızı kabul eylesin.', 'Haftanın en hayırlı gününde dualarınızda olalım.'] },
    tesekkur: { head: ['Teşekkür ederiz', 'Bağışınız ulaştı', 'İyiliğiniz yerini buldu', 'Allah razı olsun', 'Desteğiniz için minnettarız'], body: ['Desteğiniz ihtiyaç sahibi ailelere ulaştırıldı. Allah kabul etsin.', 'Hayrınız daim olsun, Rabbim katlayarak karşılığını versin.', 'Sizin sayenizde bir aile daha sevindi.', 'İyiliği büyüten sizsiniz; teşekkür ederiz.', 'Dualarımızdasınız.'] },
    genel: { head: ['Birlikte daha güçlüyüz', 'İyilik paylaştıkça çoğalır', 'Sen de vesile ol', 'Bir dokunuş, bir umut', 'Hayırda yarışalım'], body: ['Desteğiniz bir hayata dokunur.', 'Bağış için bizimle iletişime geçin.', 'Küçük bir destek, büyük bir sevinç.', 'Paylaştıkça bereket artar.', 'Allah hayırlı işlerinizi kabul etsin.'] },
    gida: { head: ['Taptaze, her gün', 'Bu lezzeti kaçırma', 'Yeni menümüz hazır', 'Ustasından, sıcacık', 'Sofranın yıldızı'], body: ['Günlük taze malzemelerle hazırlanır.', 'Paket servis ve gel-al için arayın.', 'Bu hafta sonuna özel fiyatla.', 'Siparişiniz 30 dakikada kapınızda.', 'Afiyetle, sağlıkla.'] },
  };
  const topicOf = (d) => { const t = (d.layers || []).filter((l) => l.type === 'text').map((l) => R.plain(l.text)).join(' ').toLocaleLowerCase('tr-TR') + ' ' + ((d.meta && d.meta.template) || ''); if (/kandil|regaip|miraç|berat|mevlid/.test(t)) return 'kandil'; if (/kurban|hisse|adak|akika/.test(t)) return 'kurban'; if (/ramazan|iftar|sahur|koli|kumanya/.test(t)) return 'ramazan'; if (/cuma/.test(t)) return 'cuma'; if (/teşekkür|ulaştı|razı/.test(t)) return 'tesekkur'; if (/^g-|₺|menü|sipariş|lezzet/.test(t)) return 'gida'; return 'genel'; };
  P12.suggestFor = (l, d) => { const b = BANK[topicOf(d)] || BANK.genel, plain = d.layers.filter((x) => x.type === 'text' && !SCRIPT.test(x.fontFamily || '')), mx = Math.max(1, ...plain.map((x) => x.fontSize)); const big = SCRIPT.test(l.fontFamily || '') || l.fontSize >= mx * 0.55 || /Başlık|El yazısı|Üst etiket|Sekme/i.test(l.name || ''); return big ? b.head : b.body; };
  P12.dictate = function (ta, onText) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return toast('Bu tarayıcı sesle yazmayı desteklemiyor', true);
    const r = new SR(); r.lang = 'tr-TR'; r.interimResults = false; r.maxAlternatives = 1;
    ta.classList.add('listening'); toast('Dinliyorum… konuş');
    r.onresult = (e) => { const t = e.results[0][0].transcript; ta.value = ta.value && ta.selectionStart !== 0 ? ta.value + ' ' + t : t; onText && onText(); };
    r.onerror = (e) => toast(e.error === 'not-allowed' ? 'Mikrofon izni verilmedi' : 'Anlaşılamadı, tekrar dene', true);
    r.onend = () => ta.classList.remove('listening');
    try { r.start(); } catch (e) { ta.classList.remove('listening'); }
  };
  // formla doldur'a öneri ve mikrofon düğmeleri
  new MutationObserver(() => {
    const list = $('.ff-list'); if (!list || list.dataset.p12) return; list.dataset.p12 = '1';
    const api = E(); if (!api) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ts = api.doc.layers.filter((l) => l.type === 'text' && l.visible !== false && !l.locked && !/^Süs/.test(l.name || '') && R.plain(l.text || '').trim()).sort((a, b) => a.y - b.y || a.x - b.x);
    $$('textarea', list).forEach((ta) => {
      const l = ts[+ta.dataset.i]; if (!l) return;
      const bar = document.createElement('div'); bar.className = 'ff-tools';
      bar.innerHTML = `<button type="button" class="ff-sg">${icon('sparkle')}Öneri</button>${SR ? `<button type="button" class="ff-mic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>Sesle yaz</button>` : ''}`;
      ta.parentElement.appendChild(bar);
      const fire = () => ta.dispatchEvent(new Event('input', { bubbles: true }));
      $('.ff-sg', bar).onclick = () => {
        let pop = $('.ff-pop', bar.parentElement); if (pop) return pop.remove();
        pop = document.createElement('div'); pop.className = 'ff-pop';
        pop.innerHTML = P12.suggestFor(l, api.doc).map((t) => `<button type="button">${esc(t)}</button>`).join('');
        pop.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; ta.value = b.textContent; fire(); pop.remove(); };
        bar.after(pop);
      };
      const m = $('.ff-mic', bar); if (m) m.onclick = () => P12.dictate(ta, fire);
    });
  }).observe(document.body, { childList: true, subtree: true });

  // ================================================================ 9) haftalık paylaşım paketi
  const weekKey = (d = new Date()) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return ymd(x); };
  P12.weekly = async function (quiet) {
    if (window.Food && window.Food.load) await window.Food.load();
    if (window.Food && window.Food.loadCharity) await window.Food.loadCharity();
    const folder = 'Bu hafta · ' + trDate(new Date(weekKey() + 'T12:00'));
    const made = [];
    const mk = async (id, patch, name) => { const t = tpl(id); if (!t) return; const d = R.normalize(L().instantiateAt(t, 0, null, t.w, t.h, null, patch)); await R.ensureDocFonts(d).catch(() => {}); try { R.fitUnbreakable(d); } catch (e) {} const p = await window.P10.makeDoc(d.width, d.height, name, d.layers, d.background, Object.assign({}, d.meta || {}, { template: id, folder }), false); made.push(p); };
    try {
      if (window.P8) await mk('b-cuma', window.P8.cumaPatch(), 'Hayırlı Cumalar · ' + trDate(window.P8.nextFriday()));
      const ev = window.P7 && window.P7.nextFor ? window.P7.nextFor('b-hafta') : null;
      if (ev && ev.patch) await mk('b-hafta', ev.patch, ev.name + ' · ' + ev.date.split('-').reverse().join('.'));
      if (window.P8 && window.P8.nextQuote) { const q = window.P8.nextQuote(), m = /“(.+)”\s*\((.+)\)/.exec(q) || []; await mk('b-talebe-hadis', m[1] ? { title: '‘' + m[1] + '’', quote: '(' + m[2] + ')' } : {}, 'Haftanın hadisi'); }
    } catch (e) { if (!quiet) toast('Paket hazırlanamadı: ' + e.message, true); }
    LS.set('ts_weekly_done', weekKey());
    if (made.length) toast(`Bu haftanın paketi hazır: ${made.length} tasarım (“${folder}” klasöründe)`);
    if (!quiet && (location.hash || '').includes('pano')) A().go('pano');
    return made;
  };
  setTimeout(() => { try { if (LS.get('ts_weekly_auto', true) && LS.get('ts_weekly_done', '') !== weekKey() && A() && A().S && (!window.Users || window.Users.isAdmin())) P12.weekly(true); } catch (e) {} }, 9000);

  // ================================================================ 10) bayram / kandil mesajları (isimli)
  P12.greetTexts = async function (preset) {
    const y = new Date().getFullYear(), now = ymd(new Date());
    const evs = window.P7 ? [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].filter((e) => e.date >= now && /Kandil|Bayram|yılbaşı|Aşure|Kadir/i.test(e.name)).filter((e, i, a) => a.findIndex((x) => x.name === e.name) === i).slice(0, 8) : [];
    const res = await A().dialog(`<div class="d-body"><h3>${icon('chat')} Bayram ve kandil mesajları</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Her satıra bir kişi: <b>Ad ; telefon</b>. Herkese adıyla mesaj hazırlanır; isterseniz aynı listeden kart da üretilir.</p>
      <div class="chips" id="gtE">${evs.map((e, i) => `<button class="chip ${i ? '' : 'on'}" data-n="${esc(e.name)}">${esc(e.name)}</button>`).join('')}</div>
      <label class="field" style="margin-top:10px"><span>Kişiler</span><textarea class="inp" id="gtL" rows="5" placeholder="Ahmet Bey ; 0555 111 22 33&#10;Ayşe Hanım ; 0532 444 55 66">${esc((preset && preset.list) || '')}</textarea></label>
      <label class="field"><span>Mesaj ({ad} yerine kişinin adı yazılır)</span><textarea class="inp" id="gtM" rows="3"></textarea></label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="gtC">${icon('heart')}Kartları da hazırla</button><button class="btn primary" id="gtGo">${icon('chat')}Mesajları hazırla</button></div>`, {
      onOpen: (box, close) => {
        let ev = evs[0] ? evs[0].name : 'Kandiliniz';
        const def = () => `Sayın {ad}, ${ev.replace(/ (gecesi|günü)$/i, '')} mübarek olsun. Rabbim dualarınızı kabul etsin, sevdiklerinizle nice güzel günlere. — ${brand().name || ''}`.replace(/ — $/, '');
        $('#gtM', box).value = def();
        $('#gtE', box).onclick = (e) => { const b = e.target.closest('[data-n]'); if (!b) return; ev = b.dataset.n; $$('#gtE .chip', box).forEach((x) => x.classList.toggle('on', x === b)); $('#gtM', box).value = def(); };
        const items = () => parseRows($('#gtL', box).value).map((r) => ({ name: r[0], phone: r[1] || '', text: $('#gtM', box).value.replace(/\{ad\}/g, r[0]) }));
        $('#gtGo', box).onclick = () => { const it = items(); if (!it.length) return toast('Önce kişileri yaz', true); close({ it }); };
        $('#gtC', box).onclick = () => { close(null); window.P10.greeting(); };
      },
    });
    if (res) P12.messages(res.it, 'Kişiye özel mesajlar');
  };

  // ================================================================ 13) logo ve iletişim şeridi
  P12.stripLayers = function (W, H) {
    const b = brand(), c1 = bcol(0, '#14532D'), hS = Math.round(Math.min(W, H) * 0.07), y = H - hS, g = 'strip' + uid().slice(0, 6), out = [];
    out.push(Rc('Şerit zemini', 0, y, W, hS, c1, { group: g }));
    let x = Math.round(hS * 0.35);
    if (b.logo) { out.push(Im('Şerit logosu', b.logo, x, y + hS * 0.15, hS * 0.7, hS * 0.7, { group: g })); x += hS * 0.85; }
    out.push(T('Şerit kurum adı', b.name || 'Kurum adı', x, y + hS * 0.27, W * 0.42, hS * 0.36, { align: 'left', fontWeight: 700, group: g, fontFamily: 'Montserrat' }));
    const info = [b.phone, b.web || b.email].filter(Boolean).join('   •   ') || '0 (555) 000 00 00   •   www.kurum.org';
    out.push(T('Şerit iletişim', info, W * 0.45, y + hS * 0.3, W * 0.55 - hS * 0.35, hS * 0.3, { align: 'right', group: g, fill: 'rgba(255,255,255,0.92)' }));
    return out;
  };
  P12.brandStrip = function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d = api.doc, old = d.layers.filter((l) => /^Şerit /.test(l.name || ''));
    if (old.length) { d.layers = d.layers.filter((l) => !old.includes(l)); api.commit(); return toast('Logo ve iletişim şeridi kaldırıldı'); }
    api.insert(P12.stripLayers(d.width, d.height), { group: false, select: false });
    try { R.fitUnbreakable(d); } catch (e) {} api.commit();
    toast(brand().name ? 'Logo ve iletişim şeridi eklendi (tekrar dokunursan kaldırılır)' : 'Şerit eklendi. Kurum adı ve telefonu Marka sayfasından bir kez yaz, hep oradan gelsin.');
  };

  // ================================================================ 14) paylaşım geçmişi
  const logShare = (d, how) => { const h = LS.get('ts_shares', []); h.unshift({ id: (A().S.project && A().S.project.id) || d.id || null, name: d.name || (A().S.project && A().S.project.name) || 'Tasarım', how, t: Date.now() }); LS.set('ts_shares', h.slice(0, 300)); };
  const hookShare = () => {
    const Fe = F(); if (!Fe || Fe._p12) return; Fe._p12 = true;
    const sh = Fe.share, ex = Fe.exportDialog;
    Fe.share = async function (d, btn) { const pid = A().S.project && A().S.project.id, last = LS.get('ts_shares', []).find((x) => x.id && x.id === pid); if (last && Date.now() - last.t < 14 * 864e5) toast(`Bu tasarımı ${Math.max(1, Math.round((Date.now() - last.t) / 864e5))} gün önce de paylaşmıştın`); const r = await sh.apply(this, arguments); logShare(d, 'Paylaşıldı'); return r; };
    Fe.exportDialog = async function (d) { const r = await ex.apply(this, arguments); logShare(d, 'İndirildi'); return r; };
  };
  setTimeout(hookShare, 50);
  P12.history = function () {
    const h = LS.get('ts_shares', []), by = {};
    h.forEach((x) => { const k = ymd(new Date(x.t)); (by[k] = by[k] || []).push(x); });
    return A().dialog(`<div class="d-body"><h3>${icon('calendar')} Paylaşım geçmişi</h3>
      ${h.length ? `<div class="sh-list">${Object.entries(by).map(([k, xs]) => `<div class="sh-day"><b>${trDate(new Date(k + 'T12:00'))}</b>${xs.map((x) => `<div class="sh-it"><span>${esc(x.name)}</span><small>${esc(x.how)} · ${new Date(x.t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</small>${x.id ? `<button class="btn sm ghost" data-id="${x.id}">Aç</button>` : ''}</div>`).join('')}</div>`).join('')}</div>` : '<p class="muted">Henüz paylaşım ya da indirme yok. Paylaştıkça burada tarihleriyle görünür.</p>'}</div>
      <div class="d-foot">${h.length ? '<button class="btn ghost" id="shClr">Geçmişi temizle</button>' : ''}<button class="btn primary" data-close>Kapat</button></div>`, {
      onOpen: (box, close) => { $$('[data-id]', box).forEach((b) => (b.onclick = () => { close(); A().go('editor', b.dataset.id); })); const c = $('#shClr', box); if (c) c.onclick = () => { LS.set('ts_shares', []); close(); toast('Geçmiş temizlendi'); }; },
    });
  };

  // ================================================================ 17) bağışçı defteri
  P12.donorAdd = function (rows) {
    const cur = LS.get('ts_donors', []); let n = 0;
    rows.forEach((r) => {
      if (!r.name) return;
      let d = cur.find((x) => x.name.toLocaleLowerCase('tr-TR') === r.name.toLocaleLowerCase('tr-TR') && (!r.phone || !x.phone || x.phone.replace(/\D/g, '') === r.phone.replace(/\D/g, '')));
      if (!d) { d = { id: uid(), name: r.name, phone: r.phone || '', gifts: [] }; cur.push(d); n++; }
      if (r.phone && !d.phone) d.phone = r.phone;
      if (r.amount || r.kind) d.gifts.push({ date: ymd(new Date()), amount: r.amount || '', kind: r.kind || '' });
    });
    LS.set('ts_donors', cur); return n;
  };
  P12.donors = async function () {
    await A().dialog(`<div class="d-body"><h3>${icon('list')} Bağışçı defteri</h3>
      <div class="dn-top"><input class="inp" id="dnQ" placeholder="Ara: ad ya da telefon"><button class="btn sm" id="dnAdd">+ Ekle</button></div>
      <div class="dn-add" id="dnAddBox" hidden><textarea class="inp" id="dnL" rows="3" placeholder="Her satıra: Ad Soyad ; telefon ; tutar ; bağış türü"></textarea><button class="btn sm primary" id="dnSave">Deftere yaz</button></div>
      <div class="dn-list" id="dnList"></div>
      <div class="dn-acts"><small class="muted" id="dnSel">0 kişi seçili</small><span style="flex:1"></span><button class="btn sm" data-a="makbuz">${icon('file')}Makbuz</button><button class="btn sm" data-a="kart">${icon('heart')}Teşekkür kartı</button><button class="btn sm" data-a="mesaj">${icon('chat')}Mesaj</button><button class="btn sm ghost" data-a="sil">${icon('trash')}Sil</button></div></div>
      <div class="d-foot"><button class="btn primary" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const sel = new Set();
        const draw = () => {
          const q = $('#dnQ', box).value.trim().toLocaleLowerCase('tr-TR'), all = LS.get('ts_donors', []);
          const ls = all.filter((d) => !q || d.name.toLocaleLowerCase('tr-TR').includes(q) || (d.phone || '').includes(q)).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
          $('#dnList', box).innerHTML = ls.length ? ls.map((d) => { const tot = d.gifts.reduce((a, g) => a + (parseFloat(String(g.amount).replace(/\./g, '').replace(',', '.')) || 0), 0); const last = d.gifts[d.gifts.length - 1]; return `<label class="dn-it"><input type="checkbox" data-id="${d.id}" ${sel.has(d.id) ? 'checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.phone || 'telefon yok')} · ${d.gifts.length} bağış${tot ? ' · toplam ' + tot.toLocaleString('tr-TR') : ''}${last ? ' · son: ' + esc(last.kind || '') + ' ' + esc(last.date.split('-').reverse().join('.')) : ''}</small></span></label>`; }).join('') : `<p class="muted" style="font-size:13px">${all.length ? 'Aramaya uyan kişi yok.' : 'Defter boş. “Ekle” ile kişileri yaz ya da Kurban paketi / Makbuz listelerinden aktar.'}</p>`;
          $$('[data-id]', box).forEach((c) => (c.onchange = () => { c.checked ? sel.add(c.dataset.id) : sel.delete(c.dataset.id); $('#dnSel', box).textContent = sel.size + ' kişi seçili'; }));
          $('#dnSel', box).textContent = sel.size + ' kişi seçili';
        };
        $('#dnQ', box).oninput = draw;
        $('#dnAdd', box).onclick = () => { $('#dnAddBox', box).hidden = !$('#dnAddBox', box).hidden; };
        $('#dnSave', box).onclick = () => { const n = P12.donorAdd(parseRows($('#dnL', box).value).map((r) => ({ name: r[0], phone: r[1] || '', amount: r[2] || '', kind: r[3] || '' }))); $('#dnL', box).value = ''; $('#dnAddBox', box).hidden = true; toast(`${n} yeni kişi eklendi`); draw(); };
        $$('[data-a]', box).forEach((b) => (b.onclick = () => {
          const ds = LS.get('ts_donors', []).filter((d) => sel.has(d.id)); if (!ds.length) return toast('Önce kişi seç', true);
          const a = b.dataset.a;
          if (a === 'sil') { if (!confirm(`${ds.length} kişi defterden silinsin mi?`)) return; LS.set('ts_donors', LS.get('ts_donors', []).filter((d) => !sel.has(d.id))); sel.clear(); return draw(); }
          close();
          if (a === 'makbuz') return window.P11.receipts({ list: ds.map((d) => { const g = d.gifts[d.gifts.length - 1] || {}; return [d.name, g.amount || '', g.kind || ''].join(' ; '); }).join('\n') });
          if (a === 'kart') return window.P7.thanks({ kind: 'b-tesekkur', list: ds.map((d) => d.name).join('\n') });
          if (a === 'mesaj') return P12.greetTexts({ list: ds.map((d) => [d.name, d.phone].join(' ; ')).join('\n') });
        }));
        draw();
      },
    });
  };

  // ================================================================ 18) kampanya sonuç kartı
  P12.resultDoc = function (o) {
    const W = 1080, H = 1350, gold = '#D9C27A', L0 = [], base = bcol(0, '#14532D');
    if (TH() && TH().night) L0.push(Im('Süs · gece', TH().night(W, H, base, '#2A6B4B'), 0, 0, W, H, { fit: 'fill', locked: true }));
    if (TH() && TH().garland) L0.push(Im('Süs · ışıklar', TH().garland(W, Math.round(W * 0.2)), 0, 0, W, W * 0.2, { fit: 'fill' }));
    const got = +o.got || 0, goal = Math.max(1, +o.goal || 1), pct = got / goal, fmt = (n) => Number(n).toLocaleString('tr-TR');
    L0.push(T('Üst etiket', (o.tag || 'Kampanya sonucu').toLocaleUpperCase('tr-TR'), 80, 230, W - 160, 26, { fill: gold, fontWeight: 700, letterSpacing: 4 }));
    L0.push(T('Başlık', o.title || (pct >= 1 ? 'Hedefimize ulaştık!' : 'Birlikte başardık'), 70, 280, W - 140, 84, { fontFamily: 'DM Serif Display', fontWeight: 400, lineHeight: 1.05 }));
    L0.push(T('Toplanan sayı', fmt(got), 80, 470, W - 160, 210, { fontFamily: 'DM Serif Display', fontWeight: 400, fill: gold, lineHeight: 1 }));
    L0.push(T('Birim', o.unit || 'koli', 80, 690, W - 160, 44, { fontWeight: 600 }));
    const bx = 150, bw = W - 300, by = 790;
    L0.push(Rc('İlerleme zemini', bx, by, bw, 36, 'rgba(255,255,255,0.16)', { radius: 18 }));
    L0.push(Rc('İlerleme çubuğu', bx, by, Math.max(36, bw * Math.min(1, pct)), 36, { type: 'linear', angle: 0, colors: [gold, '#F6E7A8'] }, { radius: 18 }));
    L0.push(T('Yüzde', `Hedef ${fmt(goal)} ${o.unit || ''} · %${Math.round(pct * 100)}`, bx, by + 56, bw, 30, { fontWeight: 700 }));
    L0.push(T('Teşekkür', o.msg || 'Desteğiniz sayesinde nice sofraya ulaştık. Allah razı olsun, hayrınızı çoğaltsın.', 130, 930, W - 260, 32, { fill: 'rgba(255,255,255,0.9)', lineHeight: 1.45 }));
    L0.push(T('Kurum', brand().name || '', 80, H - 110, W - 160, 28, { fill: gold, fontWeight: 700 }));
    return docOf(W, H, L0, { type: 'solid', color: base });
  };
  P12.result = async function () {
    const res = await A().dialog(`<div class="d-body"><h3>${icon('goal')} Kampanya sonuç kartı</h3>
      <div class="kit-g"><div class="kit-f" style="grid-template-columns:1fr 1fr;gap:10px">
        <label class="field" style="grid-column:1/-1"><span>Kampanya</span><input class="inp" id="rsG2" value="Ramazan kolisi kampanyası"></label>
        <label class="field"><span>Hedef</span><input class="inp" id="rsH" type="number" inputmode="numeric" value="1000"></label><label class="field"><span>Ulaşılan</span><input class="inp" id="rsU" type="number" inputmode="numeric" value="1240"></label>
        <label class="field"><span>Birim</span><input class="inp" id="rsB" value="koli"></label><label class="field"><span>Başlık</span><input class="inp" id="rsT" placeholder="otomatik"></label>
        <label class="field" style="grid-column:1/-1"><span>Teşekkür mesajı</span><textarea class="inp" id="rsM" rows="2">Desteğiniz sayesinde nice sofraya ulaştık. Allah razı olsun, hayrınızı çoğaltsın.</textarea></label></div>
        <div class="kit-pv"><div class="kit-th" id="rsV"></div></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="rsGo">Kartı aç</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const o = () => ({ tag: $('#rsG2', box).value, goal: $('#rsH', box).value, got: $('#rsU', box).value, unit: $('#rsB', box).value, title: $('#rsT', box).value, msg: $('#rsM', box).value });
        const draw = () => pv($('#rsV', box), P12.resultDoc(o())); let tm = 0;
        $$('input,textarea', box).forEach((x) => (x.oninput = () => { clearTimeout(tm); tm = setTimeout(draw, 200); })); draw();
        $('#rsGo', box).onclick = () => close(o());
      },
    });
    if (!res) return;
    await open(P12.resultDoc(res), 'Sonuç · ' + res.tag, { folder: 'Kampanyalar' });
  };

  // ================================================================ 20) sık kullanılanlar
  P12.favs = () => Object.entries(LS.get('ts_tcount', {})).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter((id) => tpl(id)).slice(0, 6);
  const favRow = () => {
    const page = $('#view .page'); if (!page || !(location.hash || '#/pano').startsWith('#/pano')) return;
    const ids = P12.favs(); if (ids.length < 2) return;
    const host = $('.m-dash', page);
    if (host && !$('#mFav', host)) {
      const sec = document.createElement('div'); sec.id = 'mFav';
      sec.innerHTML = `<div class="m-sec"><h2>Sık kullandıkların</h2></div><div class="m-rail m-fav">${ids.map((id) => `<button class="m-card" data-id="${id}"><span class="m-th"></span><b>${esc(tpl(id).name.split('·')[0].trim())}</b></button>`).join('')}</div>`;
      const tiles = $('.m-tiles', host); (tiles || host.firstChild).after(sec);
      $$('.m-card', sec).forEach((c, i) => { c.onclick = () => F().useLibraryTemplate(tpl(c.dataset.id), 0); setTimeout(() => { try { $('.m-th', c).innerHTML = F().templateThumb(tpl(c.dataset.id), 0, 300); } catch (e) {} }, 200 + i * 60); });
    }
    const lib = $('#libRow', page);
    if (lib && !isM() && !$('#dFav', page)) {
      const wrap = document.createElement('div'); wrap.id = 'dFav';
      wrap.innerHTML = `<div class="sec-head"><h2 class="h-display">Sık kullandıkların</h2></div><div class="lib-row">${ids.map((id) => `<div class="tg-card" data-fav="${id}"><div class="tg-th" style="aspect-ratio:${tpl(id).w}/${tpl(id).h}"></div><div class="tg-meta"><b>${esc(tpl(id).name)}</b><small>${esc(tpl(id).cat || '')}</small></div></div>`).join('')}</div>`;
      lib.previousElementSibling.before(wrap);
      $$('[data-fav]', wrap).forEach((c, i) => { c.onclick = () => F().useLibraryTemplate(tpl(c.dataset.fav), 0); setTimeout(() => { try { $('.tg-th', c).innerHTML = F().templateThumb(tpl(c.dataset.fav), 0, 300); } catch (e) {} }, 300 + i * 60); });
    }
  };
  new MutationObserver(() => { clearTimeout(favRow.t); favRow.t = setTimeout(favRow, 400); }).observe(document.documentElement, { childList: true, subtree: true });

  // ================================================================ 21) bu hafta için yenile
  P12.renew = async function () {
    const api = E(), p = A().S.project; if (!api || !p) return toast('Önce bir tasarım aç', true);
    const id = (api.doc.meta && api.doc.meta.template) || '';
    let patch = null;
    if (id === 'b-cuma' && window.P8) patch = window.P8.cumaPatch();
    else if (id === 'b-hafta' && window.P7 && window.P7.nextFor) { const ev = window.P7.nextFor('b-hafta'); patch = ev && ev.patch; }
    else if (/^b-kandil-/.test(id) && window.P7) { const nm = { mevlid: 'Mevlid', regaip: 'Regaip', mirac: 'Miraç', berat: 'Berat' }[id.slice(9)], y = new Date().getFullYear(), now = ymd(new Date()); const ev = [...window.P7.hijriEvents(y), ...window.P7.hijriEvents(y + 1)].find((e) => e.date >= now && e.name.startsWith(nm)); if (ev) { const dd = new Date(ev.date + 'T12:00'), hj = window.P7.hijriLabel ? window.P7.hijriLabel(ev.date) : ''; patch = { date: `${trDate(dd)} gecesi${hj ? '\n' + hj.replace(/ /g, ' ') : ''}` }; } }
    if (!patch) return toast('Bu tasarımda yenilenecek tarih yok. Cuma, Hayırlı haftalar ve kandil tasarımlarında çalışır.', true);
    E().flush && E().flush(); await A().saveProject(p).catch(() => {});
    const d = JSON.parse(JSON.stringify(api.doc)), set = (n, t) => { const l = d.layers.find((x) => x.name === n); if (l && t != null) { l.text = t; R.layoutText(l); } };
    set('Tarih', patch.date); set('Alıntı', patch.quote); set('Alt başlık', patch.sub); set('Sekme başlığı', patch.tag);
    try { R.fitUnbreakable(d); } catch (e) {}
    const np = await window.P10.makeDoc(d.width, d.height, (p.name || 'Tasarım').replace(/ · \d.*$/, '') + ' · ' + (id === 'b-cuma' && window.P8 ? trDate(window.P8.nextFriday()) : trDate(new Date())), d.layers, d.background, Object.assign({}, d.meta || {}), true);
    toast('Yeni tarihli kopya hazır; eski tasarım olduğu gibi duruyor');
    return np;
  };

  // ================================================================ 23) yazı tipi eşleştirme
  const PAIRS = [['Playfair Display', 700, 'Inter', 400, 'Zarif'], ['DM Serif Display', 400, 'Poppins', 400, 'Klasik'], ['Montserrat', 800, 'Lora', 400, 'Modern'], ['Oswald', 600, 'Inter', 400, 'Güçlü'], ['Cinzel', 700, 'Crimson Pro', 400, 'Vakur'], ['Archivo Black', 400, 'Poppins', 400, 'Afiş']];
  P12.fontPairs = async function () {
    const api = E(); if (!api) return toast('Önce bir tasarım aç', true);
    const d0 = api.doc, ts = d0.layers.filter((l) => l.type === 'text' && !SCRIPT.test(l.fontFamily || '') && !/^Süs/.test(l.name || ''));
    if (!ts.length) return toast('Bu tasarımda değiştirilecek yazı yok');
    const mx = Math.max(...ts.map((l) => l.fontSize));
    const apply = (d, i) => { const [hf, hw, bf, bw] = PAIRS[i]; d.layers.forEach((l) => { if (l.type !== 'text' || SCRIPT.test(l.fontFamily || '') || /^Süs/.test(l.name || '')) return; const head = l.fontSize >= mx * 0.55; l.fontFamily = head ? hf : bf; l.fontWeight = head ? hw : (l.fontWeight >= 600 ? 600 : bw); R.layoutText(l); }); try { R.fitUnbreakable(d); } catch (e) {} return d; };
    await Promise.all(PAIRS.flatMap(([hf, hw, bf, bw]) => [R.ensureFont(hf, hw), R.ensureFont(bf, bw), R.ensureFont(bf, 600)])).catch(() => {});
    const res = await A().dialog(`<div class="d-body"><h3>${icon('type')} Yazı tipi eşleştirme</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Başlık ve metin için birbirine uyan çiftler. El yazısı ve Arapça yazılar değişmez.</p>
      <div class="cv-grid">${PAIRS.map((p, i) => `<button class="cv-it" data-k="${i}"><span class="cv-th" id="fp${i}"></span><small><b>${p[4]}</b> · ${p[0]} + ${p[2]}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => { PAIRS.forEach((_, i) => setTimeout(() => pv($('#fp' + i, box), apply(JSON.parse(JSON.stringify(d0)), i)), i * 40)); $$('.cv-it', box).forEach((b) => (b.onclick = () => close(+b.dataset.k + 1))); },
    });
    if (!res) return;
    apply(d0, res - 1); api.commit(); toast(`“${PAIRS[res - 1][4]}” yazı tipleri uygulandı. Beğenmezsen Geri al.`);
  };

  // ================================================================ 24) süs önerisi
  const ORN = { kandil: ['hilal', 'hilalYildiz', 'yildiz', 'sekizgen', 'cami', 'fener', 'tesbih', 'ayrac'], ramazan: ['fener', 'hilal', 'hilalYildiz', 'yildiz', 'kase', 'koli', 'cami', 'ayrac'], kurban: ['koyun', 'kalp', 'kalp2', 'el', 'hilal', 'yildiz', 'ayrac', 'kose'], cuma: ['cami', 'hilal', 'rahle', 'tesbih', 'sekizgen', 'yildiz', 'ayrac', 'kose'], tesekkur: ['kalp', 'kalp2', 'cicek', 'yaprak', 'hediye', 'yildiz', 'ayrac', 'kose'], gida: ['yaprak', 'cicek', 'gunes', 'yildiz', 'kalp', 'ok', 'ayrac', 'kose'], genel: ['yildiz', 'kalp', 'cicek', 'yaprak', 'sekizgen', 'hilal', 'ayrac', 'kose'] };
  P12.ornaments = async function () {
    const api = E(); if (!api || !TH()) return toast('Önce bir tasarım aç', true);
    const d = api.doc, topic = topicOf(d), names = ORN[topic] || ORN.genel, col = bcol(1, bcol(0, '#C9A227'));
    const res = await A().dialog(`<div class="d-body"><h3>${icon('sparkle')} Süs önerisi</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Tasarımın konusuna (${{ kandil: 'kandil', ramazan: 'Ramazan', kurban: 'kurban', cuma: 'Cuma', tesekkur: 'teşekkür', gida: 'yiyecek', genel: 'genel' }[topic]}) uyan süsler. Dokun, tasarıma eklensin.</p>
      <div class="orn-grid">${names.map((n) => `<button class="orn-it" data-n="${n}"><img alt="" src="${TH().icon(n, col)}"><small>${esc((TH().ICON_NAMES || {})[n] || n)}</small></button>`).join('')}</div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Kapat</button></div>`, { onOpen: (box, close) => $$('.orn-it', box).forEach((b) => (b.onclick = () => close(b.dataset.n))) });
    if (!res) return;
    const s = Math.round(Math.min(d.width, d.height) * 0.14), c = api.center();
    api.insert([{ type: 'image', name: 'Süs · ' + ((TH().ICON_NAMES || {})[res] || res), src: TH().icon(res, col), x: Math.round(c.x - s / 2), y: Math.round(c.y - s / 2), w: s, h: s, fit: 'contain', nw: 300, nh: 300, filters: {} }]);
    toast('Süs eklendi; sürükleyip yerleştir, köşesinden büyüt');
  };
})();
