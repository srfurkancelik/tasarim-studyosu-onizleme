/* Tasarım Stüdyosu v7.0 — ortak depo.
   Bağışçı defteri, kurban listesi, makbuz numarası, paylaşım planı gibi iş verileri
   eskiden yalnız tarayıcıda (localStorage) dururdu: telefonda yazılanı bilgisayar görmez,
   yedeğe girmezdi. Bu dosya o anahtarları sunucuyla eşitler. Uygulamanın geri kalanı
   localStorage'ı aynen kullanmaya devam eder; hiçbir yeri değişmedi.
   - Açılışta sunucudaki değerler tarayıcıya yazılır (eşzamanlı, uygulama okumadan önce).
   - Bu anahtarlara her yazış sunucuya gönderilir; iki cihaz aynı anda yazarsa sunucu birleştirir.
   - Bağlantı yoksa değişiklik bekletilir, bağlantı gelince gönderilir.
   - Sekmeye dönünce ve dakikada bir başka cihazların değişiklikleri alınır. */
(function () {
  'use strict';
  if (window.TS_CLOUD) return;  // telefon önizlemesi: veriler yalnız o cihazda
  const KEYS = new Set(['ts_donors', 'ts_send_lists', 'ts_goal_link', 'ts_goal_link_birim', 'ts_kurban_list', 'ts_kurban_yer',
    'ts_mk_no', 'ts_mk_cur', 'ts_plan', 'ts_plan_note', 'ts_shares', 'ts_invite', 'ts_product',
    'ts_vakit', 'ts_hijri_over', 'ts_weekly_auto', 'ts_weekly_done', 'ts_kampanya_oto']);
  const REV = 'ts__rev:', DIRTY = 'ts__kirli';
  const P = Storage.prototype, oset = P.setItem, oget = P.getItem, orem = P.removeItem;
  const ls = window.localStorage;
  const raw = (k) => { try { return oget.call(ls, k); } catch (e) { return null; } };
  const put = (k, v) => { try { oset.call(ls, k, v); } catch (e) {} };
  const kirli = () => { try { return new Set(JSON.parse(raw(DIRTY) || '[]')); } catch (e) { return new Set(); } };
  const kirliYaz = (s) => put(DIRTY, JSON.stringify([...s]));
  const OD = { durum: 'hazır', son: 0 };

  function basliklar(json) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    try { const pin = JSON.parse(raw('ts_pin') || '""'); if (pin) h['X-Pin'] = pin; } catch (e) {}
    return h;
  }
  function haber(keys) {
    if (!keys.length) return;
    try { window.dispatchEvent(new CustomEvent('ts-ortak', { detail: { keys } })); } catch (e) {}
  }

  // sunucudan gelenleri uygula; yereldeki gönderilmemiş değişiklikler sunucuya gider (orada birleşir)
  function uygula(data) {
    const k0 = kirli(), degisen = [];
    for (const k of Object.keys(data || {})) {
      if (!KEYS.has(k)) continue;
      const s = data[k], yerelRev = +(raw(REV + k) || 0);
      if (k0.has(k)) continue;              // önce yereldeki gönderilecek
      // bu cihaz hiç eşitlenmemiş ama kendi verisi var (v7.0 öncesi): üstüne yazma, sunucuda birleşsin
      if (raw(REV + k) == null && raw(k) != null && raw(k) !== 'null' && raw(k) !== JSON.stringify(s.v)) { k0.add(k); continue; }
      if (s.rev === yerelRev) continue;
      const v = JSON.stringify(s.v);
      if (raw(k) !== v) { put(k, v); degisen.push(k); }
      put(REV + k, String(s.rev));
    }
    // sunucuda hiç olmayan ama tarayıcıda duran eski veri: ilk geçişte sunucuya taşı
    for (const k of KEYS) if (!(k in (data || {})) && raw(k) != null && raw(REV + k) == null) k0.add(k);
    kirliYaz(k0);
    return degisen;
  }

  function cek(eszamanli) {
    if (eszamanli) {
      try {
        const x = new XMLHttpRequest();
        x.open('GET', '/api/store', false);
        Object.entries(basliklar()).forEach(([a, b]) => x.setRequestHeader(a, b));
        x.send();
        if (x.status === 200) { uygula(JSON.parse(x.responseText)); OD.son = Date.now(); }
      } catch (e) { /* sunucu yoksa yereldekiyle devam */ }
      return Promise.resolve([]);
    }
    return fetch('/api/store', { headers: basliklar(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!d) return []; OD.son = Date.now(); const ch = uygula(d); haber(ch); return ch; })
      .catch(() => []);
  }

  let zaman = null, gonderiliyor = false;
  function sonraGonder(ms) { clearTimeout(zaman); zaman = setTimeout(gonder, ms == null ? 350 : ms); }
  async function gonder() {
    if (gonderiliyor) return sonraGonder(500);
    const k0 = kirli();
    if (!k0.size) return;
    gonderiliyor = true; OD.durum = 'gönderiliyor';
    const geriAl = [];
    for (const k of k0) {
      let v = null;
      try { v = JSON.parse(raw(k)); } catch (e) { v = raw(k); }
      const revS = raw(REV + k);
      try {
        const r = await fetch('/api/store', { method: 'POST', headers: basliklar(true), body: JSON.stringify({ key: k, value: v, rev: revS == null ? null : +revS }) });
        const j = await r.json();
        if (!r.ok || j.error) throw new Error(j.error || r.status);
        put(REV + k, String(j.rev));
        const yeni = JSON.stringify(j.v);
        if (j.merged && raw(k) !== yeni) { put(k, yeni); geriAl.push(k); }
        const s = kirli(); s.delete(k); kirliYaz(s);
      } catch (e) { OD.durum = 'bekliyor'; }
    }
    gonderiliyor = false;
    if (OD.durum !== 'bekliyor') OD.durum = 'hazır';
    haber(geriAl);
    if (kirli().size) sonraGonder(15000);  // bağlantı yoksa sonra tekrar dene
  }

  // bu anahtarlara yazışları yakala
  P.setItem = function (k, v) {
    oset.call(this, k, v);
    if (this === ls && KEYS.has(k)) { const s = kirli(); s.add(k); kirliYaz(s); sonraGonder(); }
  };
  P.removeItem = function (k) {
    orem.call(this, k);
    if (this === ls && KEYS.has(k)) { oset.call(ls, k, 'null'); const s = kirli(); s.add(k); kirliYaz(s); sonraGonder(); }
  };

  cek(true);
  if (kirli().size) sonraGonder(800);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { cek(false); sonraGonder(0); } });
  window.addEventListener('online', () => sonraGonder(0));
  setInterval(() => { if (!document.hidden) cek(false); }, 60000);

  OD.cek = () => cek(false);
  OD.gonder = gonder;
  OD.anahtarlar = KEYS;
  window.OrtakDepo = OD;
})();
