/* Tasarım Stüdyosu v6.9 — bağışçı defteri ↔ bağış takibi hedefleri.
   Bağlantı açıkken deftere bağış yazıldıkça (elle, kurban paketinden ya da makbuzdan)
   toplanan miktar yeniden hesaplanır ve bütün bağış takibi tasarımlarındaki rakam,
   ilerleme çubuğu ve yüzde kendiliğinden güncellenir. */
(function () {
  'use strict';
  const A = () => window.App, R = window.Render;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (window.icon ? window.icon(n) : '');
  const toast = (m, e) => A().toast(m, e);
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const fmt = (n) => Number(n || 0).toLocaleString('tr-TR');
  const sayi = (v) => parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;
  const KEY = 'ts_goal_link';
  const BH = {};

  BH.ayar = () => Object.assign({ on: false, mode: 'sum', kind: '', since: '', base: 0, unit: '' }, LS.get(KEY, {}));
  BH.kaydet = (o) => LS.set(KEY, o);

  // defterden toplanan miktar
  BH.toplam = function (o = BH.ayar()) {
    const kind = (o.kind || '').trim().toLocaleLowerCase('tr-TR');
    let t = +o.base || 0, adet = 0;
    for (const d of LS.get('ts_donors', [])) for (const g of d.gifts || []) {
      if (o.since && (g.date || '') < o.since) continue;
      if (kind && !String(g.kind || '').toLocaleLowerCase('tr-TR').includes(kind)) continue;
      adet++;
      t += o.mode === 'count' ? 1 : sayi(g.amount);
    }
    return { toplam: Math.round(t * 100) / 100, adet };
  };

  async function takipTasarimlari(unit) {
    const list = await A().api('projects').catch(() => []);
    const out = [];
    for (const p of list) {
      try {
        const d = await A().api('projects/' + p.id);
        const bar = d && (d.layers || []).find((l) => l.progress);
        if (!bar) continue;
        if (unit && String(bar.progress.unit || '').toLocaleLowerCase('tr-TR') !== unit.toLocaleLowerCase('tr-TR')) continue;
        out.push(d);
      } catch (e) {}
    }
    return out;
  }

  // bütün takip tasarımlarını defterdeki toplamla güncelle (sessiz)
  BH.esitle = async function ({ sessiz = false } = {}) {
    const o = BH.ayar();
    const { toplam } = BH.toplam(o);
    const docs = await takipTasarimlari(o.unit);
    let n = 0;
    if (docs[0]) LS.set(KEY + '_birim', docs[0].layers.find((l) => l.progress).progress.unit || '');
    // bellekte açık duran tasarım (editörden çıkılsa da durur): onu da güncelle ki eski rakamla geri kaydedilmesin
    const acik = A().S.project, ed = A().S.editorApi;
    const acikGuncelle = (id) => {
      if (acik && acik.id === id && acik.layers) window.P7.applyProgress(acik, { got: toplam });
      if (ed && ed.doc && acik && acik.id === id && ed.doc !== acik) { window.P7.applyProgress(ed.doc, { got: toplam }); }
      if (ed && ed.commit && acik && acik.id === id) { try { ed.commit(); } catch (e) {} }
    };
    for (const d of docs) {
      const pr = d.layers.find((l) => l.progress).progress;
      acikGuncelle(d.id);
      if (+pr.got === toplam) continue;
      window.P7.applyProgress(d, { got: toplam, goal: pr.goal, unit: pr.unit, end: pr.end });
      try { d.thumb = await R.thumbnail(d); } catch (e) {}
      await A().saveProject(d).catch(() => {});
      n++;
    }
    if (!sessiz || n) {
      const ilk = docs[0] && docs[0].layers.find((l) => l.progress).progress;
      toast(docs.length ? `Bağış takibi: ${fmt(toplam)}${ilk ? ' / ' + fmt(ilk.goal) + ' ' + (ilk.unit || '') : ''} · ${n} tasarım güncellendi` : 'Bağlanacak bağış takibi tasarımı yok. Şablonlar → Bağış takibi ile başla.', !docs.length);
    }
    return { toplam, guncellenen: n, tasarim: docs.length };
  };

  // deftere yeni bağış yazılınca (bağlantı açıksa) güncelle
  let bekle = null;
  function sonra() {
    if (!BH.ayar().on) return;
    clearTimeout(bekle);
    bekle = setTimeout(() => BH.esitle({ sessiz: true }).then(() => seritYenile()).catch(() => {}), 400);
  }
  function sar() {
    const P12 = window.P12;
    if (!P12 || !P12.donorAdd || P12.donorAdd._bh) return;
    const asil = P12.donorAdd;
    P12.donorAdd = function () { const r = asil.apply(this, arguments); sonra(); return r; };
    P12.donorAdd._bh = true;
    // defter penceresine bağlantı şeridi
    const asilDefter = P12.donors;
    P12.donors = function () {
      const pr = asilDefter.apply(this, arguments);
      let i = 0;
      const tak = () => { const box = $('#dnList') && $('#dnList').closest('.dialog'); if (box) serit(box); else if (i++ < 30) setTimeout(tak, 50); };
      tak();
      return pr;
    };
    // sil düğmesi de toplamı değiştirir
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.dialog [data-a="sil"]')) setTimeout(sonra, 300); }, true);
  }

  function seritHTML() {
    const o = BH.ayar(), t = BH.toplam(o);
    if (!o.on) return `<span class="bh-ic">${icon('goal')}</span><span class="bh-t"><b>Hedef bağlantısı kapalı</b><small>Açarsan deftere yazılan her bağış, bağış takibi tasarımlarına kendiliğinden işlenir.</small></span><button class="btn sm primary" data-bh="ayar">Bağla</button>`;
    return `<span class="bh-ic on">${icon('goal')}</span><span class="bh-t"><b>Toplanan: ${fmt(t.toplam)} ${esc(o.unit || LS.get(KEY + '_birim', ''))}</b><small>${t.adet} bağış${o.kind ? ' · tür: ' + esc(o.kind) : ''}${o.since ? ' · ' + esc(o.since.split('-').reverse().join('.')) + ' sonrası' : ''}${+o.base ? ' · önceki ' + fmt(o.base) : ''} · tasarımlara kendiliğinden işleniyor</small></span><button class="btn sm" data-bh="simdi">Şimdi güncelle</button><button class="btn sm ghost" data-bh="ayar">Ayarla</button>`;
  }
  function serit(box) {
    let s = $('.bh-strip', box);
    if (!s) {
      s = document.createElement('div');
      s.className = 'bh-strip';
      const top = $('.dn-top', box);
      top.parentNode.insertBefore(s, top);
    }
    s.innerHTML = seritHTML();
    s.querySelectorAll('[data-bh]').forEach((b) => (b.onclick = async () => {
      if (b.dataset.bh === 'simdi') { b.disabled = true; await BH.esitle(); b.disabled = false; return seritYenile(); }
      await BH.ayarPenceresi(); seritYenile();
    }));
  }
  function seritYenile() { const box = $('#dnList') && $('#dnList').closest('.dialog'); if (box) serit(box); }

  BH.ayarPenceresi = async function () {
    const o = BH.ayar();
    const birimler = [...new Set((await takipTasarimlari('')).map((d) => d.layers.find((l) => l.progress).progress.unit).filter(Boolean))];
    const v = await A().dialog(`<div class="d-body"><h3>${icon('goal')} Defteri hedefe bağla</h3>
      <p class="muted" style="font-size:13px;margin:0 0 12px">Deftere bağış yazıldıkça bağış takibi tasarımlarındaki “toplanan” rakamı ve çubuk kendiliğinden güncellenir. Hedef ve bitiş tarihi tasarımda kalır.</p>
      <label class="switch" style="margin-bottom:12px"><input type="checkbox" id="bhOn" ${o.on ? 'checked' : ''}>Bağlantı açık</label>
      <div class="form-grid">
        <label class="field"><span>Nasıl sayılsın?</span><select class="inp" id="bhMode"><option value="sum" ${o.mode !== 'count' ? 'selected' : ''}>Tutar sütununun toplamı (koli, hisse ya da ₺)</option><option value="count" ${o.mode === 'count' ? 'selected' : ''}>Her bağış 1 sayılsın</option></select></label>
        <label class="field"><span>Yalnız bu tür (isteğe bağlı)</span><input class="inp" id="bhKind" value="${esc(o.kind)}" placeholder="örn. koli, kurban, iftar"></label>
        <label class="field"><span>Bu tarihten sonraki bağışlar</span><input class="inp" id="bhSince" type="date" value="${esc(o.since)}"></label>
        <label class="field"><span>Deftere girmemiş önceki miktar</span><input class="inp" id="bhBase" type="number" inputmode="decimal" value="${+o.base || 0}"></label>
        <label class="field"><span>Hangi tasarımlar?</span><select class="inp" id="bhUnit"><option value="">Bütün bağış takibi tasarımları</option>${birimler.map((u) => `<option value="${esc(u)}" ${o.unit === u ? 'selected' : ''}>Yalnız birimi “${esc(u)}” olanlar</option>`).join('')}</select></label>
      </div>
      <div class="bh-prev" id="bhPrev"></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bhOk">Kaydet ve güncelle</button></div>`, {
      onOpen: (box, close) => {
        const oku = () => ({ on: $('#bhOn', box).checked, mode: $('#bhMode', box).value, kind: $('#bhKind', box).value.trim(), since: $('#bhSince', box).value, base: sayi($('#bhBase', box).value), unit: $('#bhUnit', box).value });
        const on = () => { const t = BH.toplam(oku()); $('#bhPrev', box).innerHTML = `Defterden şu an: <b>${fmt(t.toplam)}</b> (${t.adet} bağış)`; };
        $$('input,select', box).forEach((x) => x.addEventListener('input', on));
        on();
        $('#bhOk', box).onclick = () => close(oku());
      },
    });
    if (!v) return;
    BH.kaydet(v);
    if (v.on) await BH.esitle();
    else toast('Hedef bağlantısı kapatıldı');
  };

  // başka cihazdan defter değişikliği gelince açık pencereyi tazele
  window.addEventListener('ts-ortak', (e) => {
    const k = (e.detail && e.detail.keys) || [];
    if (!k.includes('ts_donors') && !k.includes(KEY)) return;
    const q = $('#dnQ');
    if (q) q.dispatchEvent(new Event('input', { bubbles: true }));
    seritYenile();
  });

  BH.kur = sar;
  window.BagisHedef = BH;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sar); else sar();
})();
