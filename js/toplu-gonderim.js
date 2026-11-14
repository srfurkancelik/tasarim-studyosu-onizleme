/* Tasarım Stüdyosu v6.9 — toplu WhatsApp gönderim listesi.
   Kişiye özel mesaj üreten her yer (kurban paketi, bayram/kandil mesajları, bağışçı defteri,
   davetiye) P12.messages'tan geçer. Burada o pencere bir gönderim listesine dönüşür:
   “Sıradakini gönder”, gönderilenler işaretlenir, liste saklanır ve kaldığın yerden sürer. */
(function () {
  'use strict';
  const A = () => window.App;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (window.icon ? window.icon(n) : '');
  const toast = (m, e) => A().toast(m, e);
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const KEY = 'ts_send_lists', MAX = 15;
  const TG = {};

  const numara = (p) => { let n = String(p || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '90' + n.slice(1); else if (n.length === 10 && n.startsWith('5')) n = '90' + n; return n; };
  const waLink = (phone, text) => 'https://wa.me/' + numara(phone) + '?text=' + encodeURIComponent(text);
  const ozet = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };
  const ne = (t) => { const d = Math.round((Date.now() - t) / 60000); return d < 1 ? 'şimdi' : d < 60 ? d + ' dk önce' : d < 1440 ? Math.round(d / 60) + ' sa önce' : new Date(t).toLocaleDateString('tr-TR'); };
  async function kopyala(t) {
    try { await navigator.clipboard.writeText(t); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (er) {} ta.remove(); }
    toast('Kopyalandı');
  }

  // ---- makbuz PDF'i (P11.receiptDoc ile; tek sayfa)
  async function makbuzDosyasi(mk) {
    const R = window.Render;
    const d = window.P11.receiptDoc(mk);
    await R.ensureImageSizes(d).catch(() => {});
    const jpg = await R.exportBlob(d, 'jpg', 1);
    const im = await createImageBitmap(jpg);
    const pdf = await window.P9.pdfFromJpegs([{ blob: jpg, w: im.width, h: im.height }]);
    const ad = ('makbuz-' + mk.no + '-' + (mk.name || '')).toLocaleLowerCase('tr-TR').replace(/[çğıöşü]/g, (c) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }[c])).replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '.pdf';
    return new File([pdf], ad, { type: 'application/pdf' });
  }
  const paylasilir = (f) => { try { return !!(navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; } };

  // ---- saklama: aynı başlık + aynı kişiler = aynı liste (yeniden açınca işaretler durur)
  const listeler = () => LS.get(KEY, []);
  function kaydet(L) {
    const all = listeler().filter((x) => x.id !== L.id);
    all.unshift(L);
    LS.set(KEY, all.slice(0, MAX));
  }
  function bul(items, title) {
    const id = ozet(title + '|' + items.map((m) => (m.name || '') + (m.phone || '')).join('|'));
    const eski = listeler().find((x) => x.id === id);
    const L = eski || { id, title, t: Date.now(), items: [], sent: {} };
    L.items = items.map((m) => Object.assign({ name: m.name || '', phone: m.phone || '', text: m.text || '' }, m.makbuz ? { makbuz: m.makbuz } : {}));
    L.title = title; L.t = Date.now();
    return L;
  }

  // ---- gönderim penceresi
  TG.ac = function (L) {
    let filtre = 'hepsi';
    return A().dialog(`<div class="d-body tg-send"><h3>${icon('chat')} ${esc(L.title)}</h3>
      <div class="tg-pro"><div class="tg-bar"><i></i></div><span class="tg-say"></span></div>
      <button class="btn primary tg-next" id="tgNext">${icon('send')}<span>Sıradakini gönder</span></button>
      <div class="seg tg-seg" id="tgSeg"><button data-f="hepsi" class="on">Hepsi</button><button data-f="bekleyen">Bekleyen</button><button data-f="giden">Gönderilen</button></div>
      <div class="msg-list tg-list" id="tgList"></div>
      <p class="muted tg-ipucu">WhatsApp’a dokununca kişi “gönderildi” işaretlenir; göndermediysen işarete dokunup geri al. Liste bu cihazda saklanır, Pano → <b>Gönderim listeleri</b>’nden kaldığın yerden sürdürürsün.</p></div>
      <div class="d-foot"><button class="btn ghost" id="tgAll">${icon('copy')}Bekleyenleri kopyala</button><button class="btn ghost" id="tgReset">Sıfırla</button><button class="btn primary" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const gonder = (i) => {
          const m = L.items[i];
          if (!m.phone) toast('Numara yok: WhatsApp’ta kişiyi kendin seç');
          L.sent[i] = Date.now(); kaydet(L); ciz();
          hazirla();
        };
        // makbuzlu listede: sıradaki kişinin PDF'i önceden hazırlanır (telefon paylaşma penceresi dokunuştan hemen sonra açılmalı)
        const hazir = new Map(), yapiliyor = new Map();
        const pdfAl = (i) => {
          if (hazir.has(i)) return Promise.resolve(hazir.get(i));
          if (!yapiliyor.has(i)) yapiliyor.set(i, makbuzDosyasi(L.items[i].makbuz).then((f) => { hazir.set(i, f); yapiliyor.delete(i); ciz(); return f; }, (e) => { yapiliyor.delete(i); throw e; }));
          return yapiliyor.get(i);
        };
        const hazirla = () => {
          if (!L.items.some((m) => m.makbuz)) return;
          const i = L.items.findIndex((m, k) => m.makbuz && !L.sent[k]);
          if (i >= 0) pdfAl(i).catch(() => {});
        };
        const makbuzGonder = async (i) => {
          const m = L.items[i];
          let f = hazir.get(i);
          if (!f) { toast('Makbuz hazırlanıyor…'); try { await pdfAl(i); } catch (e) { return toast('Makbuz hazırlanamadı: ' + e.message, true); } return toast('Makbuz hazır — tekrar dokun, paylaşım açılsın'); }
          if (paylasilir(f)) {
            try { await navigator.share({ files: [f], text: m.text }); gonder(i); }
            catch (e) { if (!e || e.name !== 'AbortError') toast('Paylaşılamadı: ' + (e && e.message || e), true); }
            return;
          }
          // bilgisayarda: PDF iner, WhatsApp sohbeti mesajla açılır; PDF'i sohbete sürükle
          await window.Render.download(f, f.name);
          window.open(waLink(m.phone, m.text), '_blank', 'noopener');
          toast('Makbuz indirildi — WhatsApp’ta sohbete sürükle');
          gonder(i);
        };
        const ciz = () => {
          const n = L.items.length, g = Object.keys(L.sent).length;
          $('.tg-bar i', box).style.width = (n ? (g / n) * 100 : 0) + '%';
          $('.tg-say', box).innerHTML = `<b>${g}</b> / ${n} gönderildi`;
          const sira = L.items.findIndex((_, i) => !L.sent[i]);
          const nb = $('#tgNext', box);
          nb.disabled = sira < 0;
          $('span', nb).textContent = sira < 0 ? 'Hepsi gönderildi ✓' : `Sıradakini gönder: ${L.items[sira].name || 'Kişi ' + (sira + 1)}`;
          nb.dataset.i = sira;
          const goster = L.items.map((m, i) => [m, i]).filter(([, i]) => filtre === 'hepsi' || (filtre === 'giden') === !!L.sent[i]);
          $('#tgList', box).innerHTML = goster.length ? goster.map(([m, i]) => `<div class="msg-it tg-it ${L.sent[i] ? 'gitti' : ''}" data-i="${i}">
            <div class="msg-h"><button class="tg-chk" data-t="${i}" title="${L.sent[i] ? 'Gönderilmedi say' : 'Gönderildi say'}" aria-label="Gönderildi işareti">${L.sent[i] ? '✓' : ''}</button><b>${esc(m.name || 'Kişi ' + (i + 1))}</b><small>${esc(m.phone || 'numara yok')}${L.sent[i] ? ' · ' + ne(L.sent[i]) : ''}</small></div>
            <p>${esc(m.text)}</p>
            <div class="msg-a"><button class="btn sm" data-c="${i}">${icon('copy')}Kopyala</button>${m.makbuz
              ? `<button class="btn sm ${L.sent[i] ? '' : 'primary'}" data-mk="${i}">${icon('file')}${hazir.has(i) ? 'Makbuzu gönder' : yapiliyor.has(i) ? 'Hazırlanıyor…' : 'Makbuz No ' + esc(m.makbuz.no)}</button>`
              : `<a class="btn sm ${L.sent[i] ? '' : 'primary'}" data-w="${i}" target="_blank" rel="noopener" href="${esc(waLink(m.phone, m.text))}">${icon('send')}WhatsApp</a>`}</div></div>`).join('')
            : `<p class="muted" style="text-align:center;padding:18px 0">${filtre === 'giden' ? 'Henüz gönderilen yok.' : 'Bekleyen kalmadı. 🎉'}</p>`;
          $$('[data-c]', box).forEach((b) => (b.onclick = () => kopyala(L.items[+b.dataset.c].text)));
          $$('[data-w]', box).forEach((a) => (a.onclick = () => setTimeout(() => gonder(+a.dataset.w), 50)));
          $$('[data-mk]', box).forEach((b) => (b.onclick = () => makbuzGonder(+b.dataset.mk)));
          $$('[data-t]', box).forEach((b) => (b.onclick = () => { const i = +b.dataset.t; if (L.sent[i]) delete L.sent[i]; else L.sent[i] = Date.now(); kaydet(L); ciz(); }));
        };
        $('#tgNext', box).onclick = () => {
          const i = +$('#tgNext', box).dataset.i; if (i < 0 || isNaN(i)) return;
          const m = L.items[i];
          if (m.makbuz) return makbuzGonder(i);
          window.open(waLink(m.phone, m.text), '_blank', 'noopener');
          gonder(i);
        };
        $$('#tgSeg button', box).forEach((b) => (b.onclick = () => { filtre = b.dataset.f; $$('#tgSeg button', box).forEach((x) => x.classList.toggle('on', x === b)); ciz(); }));
        $('#tgAll', box).onclick = () => { const b = L.items.filter((_, i) => !L.sent[i]); if (!b.length) return toast('Bekleyen mesaj yok'); kopyala(b.map((m) => `${m.name}${m.phone ? ' (' + m.phone + ')' : ''}:\n${m.text}`).join('\n\n')); };
        $('#tgReset', box).onclick = () => { if (!Object.keys(L.sent).length) return; L.sent = {}; kaydet(L); ciz(); toast('İşaretler sıfırlandı'); };
        kaydet(L);
        ciz();
        hazirla();
      },
    });
  };

  // ---- kayıtlı listeler (Pano → Gönderim listeleri)
  TG.listeler = function () {
    const all = listeler();
    return A().dialog(`<div class="d-body"><h3>${icon('chat')} Gönderim listeleri</h3>
      <p class="muted" style="font-size:13px;margin:0 0 10px">Kurban paketi, bayram mesajları ya da bağışçı defterinden hazırladığın WhatsApp listeleri burada durur. Yarım kalanı aç, kaldığın yerden sürdür.</p>
      ${all.length ? `<div class="tg-lists">${all.map((L, k) => { const n = L.items.length, g = Object.keys(L.sent || {}).length; return `<button class="tg-li" data-k="${k}"><span class="tg-li-t"><b>${esc(L.title)}</b><small>${esc(L.items.slice(0, 3).map((m) => (m.name || '').split(' ')[0]).filter(Boolean).join(', '))}${n > 3 ? ' +' + (n - 3) : ''} · ${n} kişi · ${ne(L.t)}</small></span><span class="tg-li-p ${g >= n ? 'ok' : ''}">${g}/${n}</span></button>`; }).join('')}</div>`
        : `<div class="empty" style="padding:18px 6px;text-align:center"><p class="muted">Henüz liste yok. <b>Bayram ve kandil mesajları</b>, <b>Kurban paketi</b> ya da <b>Bağışçı defteri → Mesaj</b> ile bir liste hazırla.</p></div>`}</div>
      <div class="d-foot">${all.length ? '<button class="btn ghost" id="tgClr">Hepsini sil</button>' : ''}<button class="btn primary" data-close>Kapat</button></div>`, {
      onOpen: (box, close) => {
        $$('[data-k]', box).forEach((b) => (b.onclick = () => { const L = all[+b.dataset.k]; close(); TG.ac(L); }));
        const c = $('#tgClr', box); if (c) c.onclick = () => { LS.set(KEY, []); close(); toast('Listeler silindi'); };
      },
    });
  };

  // ---- Bağışçı defteri → seçili kişilere sıra numaralı makbuz (WhatsApp'tan PDF)
  const paraBicim = (v, cur) => { const n = parseFloat(String(v || '').replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); if (!isFinite(n)) return String(v || ''); return n.toLocaleString('tr-TR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' ' + cur; };
  TG.makbuzGonder = function (kisiler) {
    if (!kisiler.length) return toast('Önce kişi seç', true);
    const cur = LS.get('ts_mk_cur', 'TL') || 'TL';
    let no = parseInt(LS.get('ts_mk_no', 1), 10) || 1;
    const bugun = new Date().toLocaleDateString('tr-TR');
    const kurum = (A().S.brand && A().S.brand.name) || '';
    const items = kisiler.map((d) => {
      const g = (d.gifts || [])[d.gifts.length - 1] || {};
      const tutar = g.amount ? (/[a-zçğıöşü]/i.test(g.amount) ? g.amount : paraBicim(g.amount, cur)) : '';
      const mk = { no: String(no++), date: g.date ? g.date.split('-').reverse().join('.') : bugun, name: d.name, amount: tutar, kind: g.kind || 'Bağış', note: g.note || '', pay: '' };
      const ilk = d.name.split(' ')[0];
      return { name: d.name, phone: d.phone || '', makbuz: mk,
        text: `${ilk}, ${tutar ? tutar + ' tutarındaki ' : ''}${(g.kind || 'bağışınız').toLocaleLowerCase('tr-TR')}${g.kind ? ' bağışınız' : ''} için teşekkür ederiz. Makbuzunuz ektedir (No: ${mk.no}). Allah kabul etsin.${kurum ? '\n' + kurum : ''}` };
    });
    LS.set('ts_mk_no', no);  // numaralar hemen ayrılır: başka cihaz aynısını veremez (ortak depo)
    return TG.ac(bul(items, 'Makbuzlar · ' + bugun));
  };

  function kur() {
    const P12 = window.P12;
    if (!P12 || P12._tg) return;
    P12._tg = true;
    P12.messagesBasit = P12.messages;  // eski pencere (gerekirse)
    P12.messages = function (items, title = 'Mesajlar') { return TG.ac(bul(items || [], title)); };
    P12.sendLists = TG.listeler;
    P12.sendReceipts = TG.makbuzGonder;
    // defter penceresine "Makbuz gönder" düğmesi
    const asil = P12.donors;
    P12.donors = function () {
      const pr = asil.apply(this, arguments);
      let n = 0;
      const tak = () => {
        const acts = $('.dn-acts');
        if (!acts) { if (n++ < 30) setTimeout(tak, 50); return; }
        if ($('#dnMkG')) return;
        const b = document.createElement('button');
        b.className = 'btn sm'; b.id = 'dnMkG';
        b.innerHTML = icon('send') + 'Makbuz gönder';
        b.title = 'Seçili kişilere sıra numaralı makbuzu WhatsApp’tan PDF olarak gönder';
        b.onclick = () => {
          const ids = new Set($$('.dn-it input[data-id]:checked').map((c) => c.dataset.id));
          const ds = LS.get('ts_donors', []).filter((d) => ids.has(d.id));
          if (!ds.length) return toast('Önce kişi seç', true);
          const ov = b.closest('.overlay'); if (ov) { const k = ov.querySelector('[data-close]'); if (k) k.click(); }
          setTimeout(() => TG.makbuzGonder(ds), 150);
        };
        const mk = acts.querySelector('[data-a="makbuz"]');
        acts.insertBefore(b, mk ? mk.nextSibling : null);
      };
      tak();
      return pr;
    };
  }
  window.TopluGonderim = TG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
