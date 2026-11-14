/* Tasarım Stüdyosu v7.0 — bağış raporu.
   Bağışçı defterinden dönem seçmeli özet: türe, kişiye ve aya göre toplamlar.
   Excel'e (CSV, Türkçe Excel'in beklediği ; ayraçla) ve yazdırılabilir rapora (PDF) aktarılır. */
(function () {
  'use strict';
  const A = () => window.App;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => (window.icon ? window.icon(n) : '');
  const toast = (m, e) => A().toast(m, e);
  const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const sayi = (v) => parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;
  const fmt = (n) => Number(n || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const trTarih = (s) => (s ? s.split('-').reverse().join('.') : '');
  const BR = {};

  // dönem → [başlangıç, bitiş] (YYYY-AA-GG, ikisi dahil)
  BR.donem = function (kod, bas, bit) {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    if (kod === 'buay') return [ymd(new Date(y, m, 1)), ymd(new Date(y, m + 1, 0))];
    if (kod === 'gecenay') return [ymd(new Date(y, m - 1, 1)), ymd(new Date(y, m, 0))];
    if (kod === 'buyil') return [y + '-01-01', y + '-12-31'];
    if (kod === 'gecenyil') return [(y - 1) + '-01-01', (y - 1) + '-12-31'];
    if (kod === 'ozel') return [bas || '0000-01-01', bit || '9999-12-31'];
    return ['0000-01-01', '9999-12-31'];
  };

  BR.hesapla = function (bas, bit, turFiltre) {
    const tf = (turFiltre || '').trim().toLocaleLowerCase('tr-TR');
    const satir = [], tur = new Map(), kisi = new Map(), ay = new Map();
    for (const d of LS.get('ts_donors', [])) for (const g of d.gifts || []) {
      const t = g.date || '';
      if (t < bas || t > bit) continue;
      const kind = (g.kind || 'Belirtilmemiş').trim() || 'Belirtilmemiş';
      if (tf && !kind.toLocaleLowerCase('tr-TR').includes(tf)) continue;
      const v = sayi(g.amount);
      satir.push({ tarih: t, ad: d.name, tel: d.phone || '', tutar: g.amount || '', deger: v, tur: kind, not: g.note || '' });
      const T = tur.get(kind) || { tur: kind, adet: 0, toplam: 0, kisiler: new Set() };
      T.adet++; T.toplam += v; T.kisiler.add(d.id || d.name); tur.set(kind, T);
      const K = kisi.get(d.id || d.name) || { ad: d.name, tel: d.phone || '', adet: 0, toplam: 0, turler: new Set(), son: '' };
      K.adet++; K.toplam += v; K.turler.add(kind); if (t > K.son) K.son = t; kisi.set(d.id || d.name, K);
      const a = t.slice(0, 7);
      if (a.length === 7) { const M = ay.get(a) || { ay: a, adet: 0, toplam: 0 }; M.adet++; M.toplam += v; ay.set(a, M); }
    }
    satir.sort((x, y) => (x.tarih < y.tarih ? -1 : x.tarih > y.tarih ? 1 : x.ad.localeCompare(y.ad, 'tr')));
    return {
      satir,
      turler: [...tur.values()].map((x) => Object.assign(x, { kisi: x.kisiler.size })).sort((a, b) => b.toplam - a.toplam || b.adet - a.adet),
      kisiler: [...kisi.values()].map((x) => Object.assign(x, { turler: [...x.turler].join(', ') })).sort((a, b) => b.toplam - a.toplam || a.ad.localeCompare(b.ad, 'tr')),
      aylar: [...ay.values()].sort((a, b) => (a.ay < b.ay ? -1 : 1)),
      toplam: satir.reduce((s, x) => s + x.deger, 0),
    };
  };

  const ayAdi = (a) => AYLAR[+a.slice(5, 7) - 1] + ' ' + a.slice(0, 4);

  function grafik(aylar) {
    if (aylar.length < 2) return '';
    const max = Math.max(...aylar.map((m) => m.toplam), 1), W = 100 / aylar.length;
    return `<div class="br-graf" role="img" aria-label="Aylara göre toplam">${aylar.map((m) => `<div class="br-sut" style="width:${W}%"><b>${fmt(m.toplam)}</b><i style="height:${Math.max(3, (m.toplam / max) * 100)}%"></i><small>${AYLAR[+m.ay.slice(5, 7) - 1].slice(0, 3)}${aylar.some((x) => x.ay.slice(0, 4) !== m.ay.slice(0, 4)) ? ' ' + m.ay.slice(2, 4) : ''}</small></div>`).join('')}</div>`;
  }

  function ozetHTML(r, baslik) {
    if (!r.satir.length) return `<div class="empty" style="padding:22px 6px;text-align:center"><p class="muted">Bu dönemde defterde bağış yok.</p></div>`;
    return `<div class="br-kart"><div><b>${fmt(r.satir.length)}</b><small>bağış</small></div><div><b>${fmt(r.kisiler.length)}</b><small>kişi</small></div><div><b>${fmt(r.toplam)}</b><small>toplam${r.turler.length > 1 ? ' (karışık birim)' : ''}</small></div></div>
      ${grafik(r.aylar)}
      <h4 class="br-h">Türe göre</h4>
      <table class="br-t br-son"><thead><tr><th>Tür</th><th>Bağış</th><th>Kişi</th><th>Toplam</th></tr></thead><tbody>${r.turler.map((t) => `<tr><td>${esc(t.tur)}</td><td>${fmt(t.adet)}</td><td>${fmt(t.kisi)}</td><td><b>${fmt(t.toplam)}</b></td></tr>`).join('')}</tbody></table>
      <h4 class="br-h">Kişiye göre <small class="muted">(${r.kisiler.length})</small></h4>
      <table class="br-t"><thead><tr><th>Ad</th><th>Bağış</th><th>Toplam</th><th>Tür</th></tr></thead><tbody>${r.kisiler.slice(0, 200).map((k) => `<tr><td>${esc(k.ad)}${k.tel ? `<small>${esc(k.tel)}</small>` : ''}</td><td>${fmt(k.adet)}</td><td><b>${fmt(k.toplam)}</b></td><td>${esc(k.turler)}</td></tr>`).join('')}</tbody></table>
      ${r.kisiler.length > 200 ? `<p class="muted" style="font-size:12px">İlk 200 kişi gösteriliyor; tamamı Excel'de.</p>` : ''}`;
  }

  // Excel: Türkçe Excel ; ayraç ve UTF-8 BOM ile Türkçe harfleri doğru açar
  BR.csv = function (r, bas, bit) {
    const q = (v) => { const s = String(v == null ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const sat = [['Bağış raporu', bas === '0000-01-01' ? 'Tüm kayıtlar' : trTarih(bas) + ' – ' + trTarih(bit)], [],
      ['Tarih', 'Ad Soyad', 'Telefon', 'Tutar', 'Sayısal tutar', 'Tür', 'Not']];
    r.satir.forEach((x) => sat.push([trTarih(x.tarih), x.ad, x.tel, x.tutar, String(x.deger).replace('.', ','), x.tur, x.not]));
    sat.push([], ['Türe göre'], ['Tür', 'Bağış', 'Kişi', 'Toplam']);
    r.turler.forEach((t) => sat.push([t.tur, t.adet, t.kisi, String(t.toplam).replace('.', ',')]));
    sat.push([], ['Kişiye göre'], ['Ad Soyad', 'Telefon', 'Bağış', 'Toplam', 'Türler', 'Son bağış']);
    r.kisiler.forEach((k) => sat.push([k.ad, k.tel, k.adet, String(k.toplam).replace('.', ','), k.turler, trTarih(k.son)]));
    return '﻿' + sat.map((s) => s.map(q).join(';')).join('\r\n');
  };

  BR.yazdir = function (r, baslik, kurum) {
    const w = window.open('', '_blank');
    if (!w) return toast('Açılır pencere engellendi; bu site için izin ver.', true);
    const tablo = (bas, satirlar) => `<table><thead><tr>${bas.map((b) => `<th>${b}</th>`).join('')}</tr></thead><tbody>${satirlar.join('')}</tbody></table>`;
    w.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(baslik)}</title><style>
      @page{size:A4;margin:14mm}body{font:11pt/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;margin:0}
      h1{font-size:18pt;margin:0 0 2px}h2{font-size:12.5pt;margin:18px 0 6px;border-bottom:2px solid #E2197C;padding-bottom:3px}
      .alt{color:#555;margin:0 0 14px}.kart{display:flex;gap:10px;margin:10px 0}.kart div{flex:1;border:1px solid #ddd;border-radius:8px;padding:8px 10px}
      .kart b{display:block;font-size:16pt}.kart small{color:#666}table{width:100%;border-collapse:collapse;font-size:10pt}
      th,td{text-align:left;padding:5px 6px;border-bottom:1px solid #e5e5e5;vertical-align:top}th{background:#f6f6f6;font-weight:700}
      td.n,th.n{text-align:right;white-space:nowrap}tr{break-inside:avoid}.ayak{margin-top:18px;color:#777;font-size:9pt}</style></head><body>
      <h1>${esc(baslik)}</h1><p class="alt">${esc(kurum || '')}${kurum ? ' · ' : ''}Hazırlanma: ${new Date().toLocaleDateString('tr-TR')}</p>
      <div class="kart"><div><b>${fmt(r.satir.length)}</b><small>bağış</small></div><div><b>${fmt(r.kisiler.length)}</b><small>kişi</small></div><div><b>${fmt(r.toplam)}</b><small>toplam</small></div></div>
      <h2>Türe göre</h2>${tablo(['Tür', 'Bağış', 'Kişi', 'Toplam'], r.turler.map((t) => `<tr><td>${esc(t.tur)}</td><td class="n">${fmt(t.adet)}</td><td class="n">${fmt(t.kisi)}</td><td class="n"><b>${fmt(t.toplam)}</b></td></tr>`))}
      ${r.aylar.length > 1 ? `<h2>Aylara göre</h2>${tablo(['Ay', 'Bağış', 'Toplam'], r.aylar.map((m) => `<tr><td>${ayAdi(m.ay)}</td><td class="n">${fmt(m.adet)}</td><td class="n">${fmt(m.toplam)}</td></tr>`))}` : ''}
      <h2>Kişiye göre</h2>${tablo(['Ad Soyad', 'Telefon', 'Bağış', 'Toplam', 'Tür'], r.kisiler.map((k) => `<tr><td>${esc(k.ad)}</td><td>${esc(k.tel)}</td><td class="n">${fmt(k.adet)}</td><td class="n">${fmt(k.toplam)}</td><td>${esc(k.turler)}</td></tr>`))}
      <h2>Bütün bağışlar</h2>${tablo(['Tarih', 'Ad Soyad', 'Tutar', 'Tür'], r.satir.map((x) => `<tr><td>${trTarih(x.tarih)}</td><td>${esc(x.ad)}</td><td class="n">${esc(x.tutar)}</td><td>${esc(x.tur)}</td></tr>`))}
      <p class="ayak">Tasarım Stüdyosu · bağışçı defterinden üretildi</p></body></html>`);
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 500);
  };

  BR.ac = function () {
    const ayar = LS.get('ts_rapor_ayar', { donem: 'buay', bas: '', bit: '', tur: '' });
    return A().dialog(`<div class="d-body br"><h3>${icon('chart')} Bağış raporu</h3>
      <div class="seg br-seg" id="brDonem">${[['buay', 'Bu ay'], ['gecenay', 'Geçen ay'], ['buyil', 'Bu yıl'], ['gecenyil', 'Geçen yıl'], ['tumu', 'Tümü'], ['ozel', 'Tarih seç']].map(([k, t]) => `<button data-d="${k}" class="${ayar.donem === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="form-grid br-ozel" id="brOzel" style="${ayar.donem === 'ozel' ? '' : 'display:none'}"><label class="field"><span>Başlangıç</span><input class="inp" type="date" id="brBas" value="${esc(ayar.bas)}"></label><label class="field"><span>Bitiş</span><input class="inp" type="date" id="brBit" value="${esc(ayar.bit)}"></label></div>
      <label class="field" style="margin-top:8px"><span>Yalnız bu tür (isteğe bağlı)</span><input class="inp" id="brTur" value="${esc(ayar.tur)}" placeholder="örn. koli, kurban, zekât"></label>
      <div id="brOzet" class="br-ozet"></div></div>
      <div class="d-foot"><button class="btn ghost" id="brCsv">${icon('download')}Excel</button><button class="btn ghost" id="brPdf">${icon('file')}Yazdır / PDF</button><button class="btn primary" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        let r = null, aralik = null, baslik = '';
        const ciz = () => {
          const d = $('#brDonem .on', box).dataset.d;
          $('#brOzel', box).style.display = d === 'ozel' ? '' : 'none';
          const o = { donem: d, bas: $('#brBas', box).value, bit: $('#brBit', box).value, tur: $('#brTur', box).value };
          LS.set('ts_rapor_ayar', o);
          aralik = BR.donem(d, o.bas, o.bit);
          r = BR.hesapla(aralik[0], aralik[1], o.tur);
          const ad = $('#brDonem .on', box).textContent;
          baslik = 'Bağış raporu · ' + (d === 'ozel' ? `${trTarih(o.bas) || '…'} – ${trTarih(o.bit) || '…'}` : d === 'buay' || d === 'gecenay' ? ayAdi(aralik[0]) : d === 'tumu' ? 'Tüm kayıtlar' : aralik[0].slice(0, 4) + ' yılı') + (o.tur ? ' · ' + o.tur : '');
          $('#brOzet', box).innerHTML = ozetHTML(r, ad);
        };
        $$('#brDonem button', box).forEach((b) => (b.onclick = () => { $$('#brDonem button', box).forEach((x) => x.classList.toggle('on', x === b)); ciz(); }));
        $$('#brBas,#brBit,#brTur', box).forEach((x) => x.addEventListener('input', ciz));
        $('#brCsv', box).onclick = async () => {
          if (!r || !r.satir.length) return toast('Bu dönemde bağış yok', true);
          const ad = 'bagis-raporu-' + (aralik[0] === '0000-01-01' ? 'tumu' : aralik[0] + '_' + aralik[1]) + '.csv';
          await window.Render.download(new Blob([BR.csv(r, aralik[0], aralik[1])], { type: 'text/csv;charset=utf-8' }), ad);
        };
        $('#brPdf', box).onclick = () => {
          if (!r || !r.satir.length) return toast('Bu dönemde bağış yok', true);
          let kurum = '';
          try { kurum = (A().S.brand && A().S.brand.name) || ''; } catch (e) {}
          BR.yazdir(r, baslik, kurum);
        };
        ciz();
      },
    });
  };

  // defter penceresine "Rapor" düğmesi
  function kur() {
    const P12 = window.P12;
    if (!P12 || P12._br) return;
    P12._br = true;
    P12.donorReport = BR.ac;
    const asil = P12.donors;
    P12.donors = function () {
      const pr = asil.apply(this, arguments);
      let i = 0;
      const tak = () => {
        const top = $('.dn-top');
        if (!top) { if (i++ < 30) setTimeout(tak, 50); return; }
        if ($('#dnRapor')) return;
        const b = document.createElement('button');
        b.className = 'btn sm'; b.id = 'dnRapor';
        b.innerHTML = icon('chart') + 'Rapor';
        b.onclick = () => BR.ac();
        top.appendChild(b);
      };
      tak();
      return pr;
    };
  }
  window.BagisRapor = BR;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
