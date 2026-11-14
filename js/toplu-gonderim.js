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
    L.items = items.map((m) => ({ name: m.name || '', phone: m.phone || '', text: m.text || '' }));
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
            <div class="msg-a"><button class="btn sm" data-c="${i}">${icon('copy')}Kopyala</button><a class="btn sm ${L.sent[i] ? '' : 'primary'}" data-w="${i}" target="_blank" rel="noopener" href="${esc(waLink(m.phone, m.text))}">${icon('send')}WhatsApp</a></div></div>`).join('')
            : `<p class="muted" style="text-align:center;padding:18px 0">${filtre === 'giden' ? 'Henüz gönderilen yok.' : 'Bekleyen kalmadı. 🎉'}</p>`;
          $$('[data-c]', box).forEach((b) => (b.onclick = () => kopyala(L.items[+b.dataset.c].text)));
          $$('[data-w]', box).forEach((a) => (a.onclick = () => setTimeout(() => gonder(+a.dataset.w), 50)));
          $$('[data-t]', box).forEach((b) => (b.onclick = () => { const i = +b.dataset.t; if (L.sent[i]) delete L.sent[i]; else L.sent[i] = Date.now(); kaydet(L); ciz(); }));
        };
        $('#tgNext', box).onclick = () => {
          const i = +$('#tgNext', box).dataset.i; if (i < 0 || isNaN(i)) return;
          const m = L.items[i];
          window.open(waLink(m.phone, m.text), '_blank', 'noopener');
          gonder(i);
        };
        $$('#tgSeg button', box).forEach((b) => (b.onclick = () => { filtre = b.dataset.f; $$('#tgSeg button', box).forEach((x) => x.classList.toggle('on', x === b)); ciz(); }));
        $('#tgAll', box).onclick = () => { const b = L.items.filter((_, i) => !L.sent[i]); if (!b.length) return toast('Bekleyen mesaj yok'); kopyala(b.map((m) => `${m.name}${m.phone ? ' (' + m.phone + ')' : ''}:\n${m.text}`).join('\n\n')); };
        $('#tgReset', box).onclick = () => { if (!Object.keys(L.sent).length) return; L.sent = {}; kaydet(L); ciz(); toast('İşaretler sıfırlandı'); };
        kaydet(L);
        ciz();
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

  function kur() {
    const P12 = window.P12;
    if (!P12 || P12._tg) return;
    P12._tg = true;
    P12.messagesBasit = P12.messages;  // eski pencere (gerekirse)
    P12.messages = function (items, title = 'Mesajlar') { return TG.ac(bul(items || [], title)); };
    P12.sendLists = TG.listeler;
  }
  window.TopluGonderim = TG;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
