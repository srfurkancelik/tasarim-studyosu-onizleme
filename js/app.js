/* Tasarım Stüdyosu — uygulama kabuğu: pano, stüdyo, önizleme, ayarlar */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = window.Render, M = window.Motion;
  const esc = R.esc;

  // ---------- İkonlar (çizgi ikon seti)
  const P = {
    dropper: 'M15 4l5 5-2 2-1-1-8 8H6v-3l8-8-1-1z M13 6l5 5',
    recolor: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z M7.5 11h.01 M10 7h.01 M15 7h.01',
    chevD: 'M6 9l6 6 6-6',
    chevR: 'M9 6l6 6-6 6',
    folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    heal: 'M10.5 3.5l10 10-7 7-10-10z M7 7l10 10 M10 13h.01 M13 10h.01 M12 15h.01 M15 12h.01',
    eraser: 'M8 20h12 M5.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 19H8.5z M9.5 11.5l5 5',
    gradient: 'M4 4h16v16H4z M4 4l16 16 M8 4l12 12 M12 4l8 8 M4 8l12 12 M4 12l8 8',
    zoomTool: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16 16l5 5 M8 11h6 M11 8v6',
    chart: 'M4 20h16 M7 20v-7 M12 20V6 M17 20v-10',
    crop: 'M6 2v14a2 2 0 0 0 2 2h14 M18 22V8a2 2 0 0 0-2-2H2',
    paste: 'M9 4h6v3H9z M8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2',
    target: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    columns: 'M4 5v14 M20 5v14 M9 8h6v8H9z',
    rows: 'M5 4h14 M5 20h14 M8 9h8v6H8z',
    ruler: 'M3 17 17 3l4 4L7 21z M7 13l2 2 M10 10l2 2 M13 7l2 2',
    keyboard: 'M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10',
    select: 'M5 3l14 8-6 2-2 6z',
    barcode: 'M3 5v14 M6 5v14 M8 5v14 M11 5v14 M14 5v14 M15.5 5v14 M18 5v14 M21 5v14',
    box: 'M21 8 12 3 3 8v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8',
    jar: 'M8 3h8v3H8z M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M5 11h14 M5 17h14',
    lockS: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
    cut: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.1 7.9 20 20 M8.1 16.1 20 4',
    list: 'M9 6h12 M9 12h12 M9 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
    social: 'M4 4h16v16H4z M4 15l4-4 4 4 3-3 5 5 M15.5 8.5h.01',
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
    pen: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    check: 'M4 12l5 5L20 6', 'align-center': 'M12 3v18 M6 7h12v4H6z M8 13h8v4H8z', play: 'M7 4l13 8-13 8z', music: 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    qr: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M18 18h3v3h-3z M14 19h2 M19 14h2', calendar: 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4', chat: 'M4 4h16v12H8l-4 4z', share: 'M12 3v13 M7 8l5-5 5 5 M5 14v7h14v-7',
    compare: 'M12 3v18 M4 6h6v12H4z M14 6h6v12h-6z', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4', font: 'M4 20L10 4h2l6 16 M6.5 14h9', grid: 'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 3',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    eyeOff: 'M3 3l18 18 M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1 M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6 M9.9 9.9a3 3 0 0 0 4.2 4.2',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    plus: 'M12 5v14 M5 12h14',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
    send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
    trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
    copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20',
    undo: 'M9 14 4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
    redo: 'M15 14l5-5-5-5 M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
    zin: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-4.3-4.3 M11 8v6 M8 11h6',
    zout: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-4.3-4.3 M8 11h6',
    cursor: 'M4 3l7 17 2.5-7.5L21 10z',
    hand: 'M18 11V6a2 2 0 0 0-4 0v5 M14 10V4a2 2 0 0 0-4 0v6 M10 10.5V6a2 2 0 0 0-4 0v8 M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15',
    type: 'M4 7V4h16v3 M9 20h6 M12 4v16',
    square: 'M4 4h16v16H4z',
    circle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    triangle: 'M12 3 22 20H2z',
    line: 'M5 19 19 5',
    brush: 'M9.1 14.9 19 5a2 2 0 1 0-3-3l-9.9 9.9 M7 14c-2 0-3.5 1.5-3.5 3.5 0 1.4-.6 2.5-1.5 3 1 .6 2.4 1 4 1 2.5 0 4.5-2 4.5-4.5 0-1.7-1.4-3-3.5-3z',
    vector: 'M3 21l3-9 6-3 3 6-9 6z M12 9l6-6 3 3-6 6 M6 12a1 1 0 1 0 0-2 M3 21l6-6',
    layers: 'M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
    sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
    lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
    unlock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 7.9-1',
    up: 'M18 15l-6-6-6 6', down: 'M6 9l6 6 6-6',
    x: 'M18 6 6 18 M6 6l12 12', check: 'M20 6 9 17l-5-5',
    phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M11 18h2',
    monitor: 'M2 4h20v13H2z M8 21h8 M12 17v4',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    refresh: 'M21 12a9 9 0 1 1-2.6-6.4L21 8 M21 3v5h-5',
    save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8',
    cmd: 'M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 0 0 0-6z',
    fit: 'M3 8V5a2 2 0 0 1 2-2h3 M16 3h3a2 2 0 0 1 2 2v3 M21 16v3a2 2 0 0 1-2 2h-3 M8 21H5a2 2 0 0 1-2-2v-3',
    flipH: 'M12 3v18 M16 7l4 5-4 5z M8 7l-4 5 4 5z',
    flipV: 'M3 12h18 M7 8l5-4 5 4z M7 16l5 4 5-4z',
    aL: 'M4 3v18 M8 7h12v4H8z M8 14h7v4H8z', aC: 'M12 3v18 M6 7h12v4H6z M8 14h8v4H8z', aR: 'M20 3v18 M4 7h12v4H4z M9 14h7v4H9z',
    aT: 'M3 4h18 M7 8h4v12H7z M14 8h4v7h-4z', aM: 'M3 12h18 M7 6h4v12H7z M14 8h4v8h-4z', aB: 'M3 20h18 M7 4h4v12H7z M14 9h4v7h-4z',
    front: 'M8 8h12v12H8z M4 4h12v2 M4 4v12h2', back: 'M4 4h12v12H4z M20 8v12H8',
    tL: 'M4 6h16 M4 12h10 M4 18h14', tC: 'M4 6h16 M7 12h10 M5 18h14', tR: 'M4 6h16 M10 12h10 M6 18h14',
    bold: 'M7 4h6a4 4 0 0 1 0 8H7z M7 12h7a4 4 0 0 1 0 8H7z', italic: 'M19 4h-9 M14 20H5 M15 4 9 20', underline: 'M6 4v6a6 6 0 0 0 12 0V4 M4 21h16',
    wand: 'M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8 19 13 M15 9h0 M17.8 6.2 19 5 M3 21l9-9 M12.2 6.2 11 5',
    menu: 'M4 6h16 M4 12h16 M4 18h16', more: 'M12 6h.01 M12 12h.01 M12 18h.01',
    palette: 'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22z M7.5 11h.01 M10 7h.01 M15 7h.01',
    ratio: 'M3 6h18v12H3z',
    alert: 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z M7 7h.01',
    coach: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    blocks: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    scene: 'M3 20h18 M6 20c0-5 3-8 6-8s6 3 6 8 M12 12V4 M9 6l3-2 3 2',
    harmony: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z M7.5 11h.01 M10.5 7.5h.01 M15.5 7.5h.01',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
    simple: 'M4 6h16 M4 12h10 M4 18h6',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
    wizard: 'M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8 19 13 M15 9h.01 M17.8 6.2 19 5 M3 21l9-9 M12.2 6.2 11 5',
    mockup: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 18h2',
    lift: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 4 8.12 15.88 M14.47 14.48 20 20 M8.12 8.12 12 12',
    retext: 'M4 7V4h12v3 M10 4v14 M7 18h6 M15 13l6 6 M21 13l-6 6',
    heart: 'M12 21C6 16.5 3 13.5 3 9.5 3 6.5 5.4 4 8.2 4c1.6 0 3 .8 3.8 2.1C12.8 4.8 14.2 4 15.8 4 18.6 4 21 6.5 21 9.5c0 4-3 7-9 11.5z',
    moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
    goal: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    gift: 'M3 9h18v4H3z M5 13h14v8H5z M12 9v12 M12 9C10 5 6 5 7 8 M12 9c2-4 6-4 5-1',
    play: 'M7 4l13 8-13 8z',
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.square}"/></svg>`;
  window.icon = icon;

  // ---------- Durum
  const S = {
    project: null, settings: null, uploads: [], reference: null, palette: [], route: 'pano',
    lanUrls: [], editorApi: null, pin: '', busy: false,
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ts_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ts_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  S.pin = store.get('pin', '');

  // ---------- API
  async function api(path, opts = {}) {
    if (window.TS_CLOUD) return window.Cloud.api(path, opts); // bilgisayarsız mod
    const headers = { 'Content-Type': 'application/json' };
    if (S.pin) headers['X-Pin'] = S.pin;
    const r = await fetch('/api/' + path, { method: opts.method || (opts.body ? 'POST' : 'GET'), headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && j.login && window.Users) { window.Users.loginScreen(false); throw new Error('Giriş yapmalısın'); }
    if (r.status === 401 && j.pin) {
      if (!(await askPin())) throw new Error('PIN girilmedi');
      return api(path, opts);
    }
    if (!r.ok || j.error) throw new Error(j.error || 'Sunucu hatası ' + r.status);
    return j;
  }

  // ---------- Toast & diyaloglar
  function toast(msg, err) {
    const box = $('#toasts'); if (!box) return;
    // aynı mesaj zaten ekrandaysa tekrar gösterme (çift bildirim olmasın)
    if ([...box.children].some((x) => !x.dataset.gone && x.dataset.msg === String(msg))) return;
    while (box.children.length >= 3) box.firstElementChild.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : ''); t.dataset.msg = String(msg);
    t.innerHTML = `<i class="b"></i><span>${esc(msg)}</span>`;
    box.appendChild(t);
    M.animate(t, { opacity: [0, 1], y: [16, 0], scale: [.96, 1] });
    setTimeout(() => { t.dataset.gone = '1'; M.animate(t, { opacity: [1, 0], y: [0, 8] }, { stiffness: 300, damping: 30, keep: true }).then(() => t.remove()); }, err ? 5200 : 2800);
  }
  window.toast = toast;

  function dialog(html, { onOpen, cls = '' } = {}) {
    return new Promise((resolve) => {
      const ov = document.createElement('div');
      ov.className = 'overlay';
      ov.innerHTML = `<div class="dialog ${cls}" role="dialog" aria-modal="true">${html}</div>`;
      document.body.appendChild(ov);
      const box = $('.dialog', ov);
      M.animate(ov, { opacity: [0, 1] }, { stiffness: 400, damping: 40 });
      M.animate(box, { opacity: [0, 1], y: [18, 0], scale: [.97, 1] }, { stiffness: 420, damping: 30 });
      const close = (v) => {
        document.removeEventListener('keydown', onKey, true);
        M.animate(box, { opacity: [1, 0], scale: [1, .98] }, { stiffness: 500, damping: 40, keep: true });
        M.animate(ov, { opacity: [1, 0] }, { stiffness: 500, damping: 40, keep: true }).then(() => ov.remove());
        resolve(v);
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
      document.addEventListener('keydown', onKey, true);
      ov.addEventListener('pointerdown', (e) => { if (e.target === ov) close(null); });
      $$('[data-close]', ov).forEach((b) => b.addEventListener('click', () => close(b.dataset.close === 'ok' ? true : null)));
      if (window.MobileUI) window.MobileUI.sheet(box, () => close(null));
      onOpen && onOpen(box, close);
    });
  }
  function confirmBox(title, text, okLabel = 'Sil') {
    return dialog(`<div class="d-body"><h3>${esc(title)}</h3><p class="muted" style="margin:0">${esc(text)}</p></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" data-close="ok">${esc(okLabel)}</button></div>`);
  }
  function promptBox(title, value, okLabel = 'Kaydet', placeholder = '') {
    return dialog(`<div class="d-body"><h3>${esc(title)}</h3><input class="inp" id="dlgIn" value="${esc(value)}" placeholder="${esc(placeholder)}"></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="dlgOk">${esc(okLabel)}</button></div>`,
      { onOpen: (box, close) => { const i = $('#dlgIn', box); i.focus(); i.select(); setTimeout(() => { if (document.activeElement !== i) i.focus(); }, 120); const ok = () => close(i.value.trim()); $('#dlgOk', box).onclick = ok; i.onkeydown = (e) => { if (e.key === 'Enter') ok(); }; } });
  }
  async function askPin() {
    const v = await dialog(`<div class="d-body"><h3>Erişim PIN'i</h3><p class="muted">Bu stüdyo bir PIN ile korunuyor. Bilgisayardaki Ayarlar sayfasında belirlediğin PIN'i gir.</p><input class="inp" id="pinIn" type="password" inputmode="numeric" autocomplete="off"></div>
      <div class="d-foot"><button class="btn primary" id="pinOk">Giriş yap</button></div>`,
      { onOpen: (box, close) => { const i = $('#pinIn', box); i.focus(); const ok = () => close(i.value); $('#pinOk', box).onclick = ok; i.onkeydown = (e) => { if (e.key === 'Enter') ok(); }; } });
    S.pin = v || ''; store.set('pin', S.pin);
    return !!v;
  }
  window.UI = { dialog, confirmBox, promptBox, toast };

  // ---------- Proje yardımcıları
  const FORMATS = [
    { k: 'ig', name: 'Instagram post', w: 1080, h: 1080 },
    { k: 'story', name: 'Story / Reels', w: 1080, h: 1920 },
    { k: 'flyer', name: 'Flyer A4', w: 1240, h: 1754 },
    { k: 'banner', name: 'Web banner', w: 1200, h: 628 },
    { k: 'yt', name: 'YouTube kapak', w: 1280, h: 720 },
    { k: 'li', name: 'LinkedIn kapak', w: 1584, h: 396 },
    { k: 'a5', name: 'Flyer A5', w: 874, h: 1240 },
    { k: 'bill', name: 'Yatay afiş', w: 1920, h: 1080 },
    { k: 'ig45', name: 'Instagram dikey 4:5', w: 1080, h: 1350, g: 'social' },
    { k: 'fb', name: 'Facebook gönderi', w: 1200, h: 630, g: 'social' },
    { k: 'pin', name: 'Pinterest pin', w: 1000, h: 1500, g: 'social' },
    { k: 'wa', name: 'WhatsApp durum', w: 1080, h: 1920, g: 'social' },
    { k: 'trendyol', name: 'Trendyol ürün', w: 1200, h: 1800, g: 'market' },
    { k: 'hb', name: 'Hepsiburada ürün', w: 1500, h: 1500, g: 'market' },
    { k: 'amazon', name: 'Amazon ürün', w: 2000, h: 2000, g: 'market' },
    { k: 'n11', name: 'E-ticaret kare', w: 1200, h: 1200, g: 'market' },
    { k: 'shopb', name: 'Web mağaza banner', w: 1920, h: 600, g: 'market' },
  ];
  S.FORMATS = FORMATS;
  function newProject(w = 1080, h = 1080, name = 'Adsız tasarım') {
    return { id: null, name, width: w, height: h, background: { type: 'solid', color: '#FFFFFF' }, layers: [], meta: {}, chat: [], versions: [] };
  }
  function designOf(p) {
    return R.clean({ width: p.width, height: p.height, background: p.background, layers: p.layers, meta: p.meta });
  }
  let saveTimer = null, savingPromise = null;
  async function saveProject(p = S.project, { thumb = true, quiet = true } = {}) {
    if (!p) return;
    if (thumb && p.layers.length) p.thumb = await R.thumbnail(p);
    const body = R.clean(p);
    savingPromise = api('projects', { body });
    const r = await savingPromise;
    p.id = r.id; p.updated = r.updated;
    store.set('last', p.id);
    if (window.P6 && p === S.project) try { window.P6.afterSave(p); } catch (e) {}
    if (!quiet) toast('Kaydedildi');
    return p;
  }
  function autosave(delay = 900) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProject().catch((e) => toast('Kaydedilemedi: ' + e.message, true)), delay);
  }
  async function loadProject(id) {
    const p = await api('projects/' + id);
    p.chat = p.chat || []; p.versions = p.versions || []; p.meta = p.meta || {};
    R.normalize(p);
    S.project = p;
    store.set('last', p.id);
    return p;
  }
  async function ensureProject(id) {
    if (id && (!S.project || S.project.id !== id)) {
      try { await loadProject(id); } catch (e) { toast('Bu tasarım bulunamadı; silinmiş olabilir', true); S.project = null; store.set('last', null); go('pano'); throw new Error('Tasarım bulunamadı'); }
    }
    if (!S.project) {
      const last = store.get('last');
      if (last) { try { await loadProject(last); } catch (e) {} }
    }
    return S.project;
  }
  window.App = { S, api, saveProject, autosave, designOf, toast, icon, FORMATS };
  window.App.startPrompt = (t) => { S.project = newProject(); S.pendingPrompt = t; go('studyo'); };
  Object.assign(window.App, { dialog, confirmBox, promptBox, newProject, go: (...a) => go(...a), onRoute: () => onRoute(), refreshAI: () => { updateDot(); if (['pano', 'studyo', 'ayarlar'].includes(S.route)) onRoute(); } });

  // ---------- Yönlendirme
  const ROUTES = {
    pano: { label: 'Pano', icon: 'home', view: viewDashboard },
    studyo: { label: 'Stüdyo', icon: 'sparkle', view: viewStudio },
    editor: { label: 'Editör', icon: 'pen', view: viewEditor },
    onizleme: { label: 'Önizleme', icon: 'eye', view: viewPreview },
    marka: { label: 'Marka', icon: 'palette', view: (p) => window.Features.viewBrand(p) },
    ayarlar: { label: 'Ayarlar', icon: 'gear', view: viewSettings },
    portal: { label: 'Portal', icon: 'chat', view: (p, id) => window.P5.viewPortal(p, id) },
  };
  $$('.nav-btn').forEach((b) => {
    const r = ROUTES[b.dataset.route];
    b.innerHTML = icon(r.icon) + `<span>${r.label}</span>`;
    b.onclick = () => go(b.dataset.route, ['studyo', 'editor', 'onizleme'].includes(b.dataset.route) && S.project && S.project.id ? S.project.id : '');
  });
  function go(route, id) { location.hash = '#/' + route + (id ? '/' + id : ''); }
  window.go = go;
  const navInd = document.createElement('span');
  navInd.className = 'nav-ind';
  $('.rail').appendChild(navInd);
  function moveNav(r) {
    const b = $(`.nav-btn[data-route="${r}"]`);
    if (!b) return;
    const mob = innerWidth < 820;
    const to = mob ? { x: b.offsetLeft, w: b.offsetWidth } : { y: b.offsetTop + 12, h: b.offsetHeight - 24 };
    if (mob) { navInd.style.width = to.w + 'px'; navInd.style.height = b.offsetHeight + 'px'; navInd.style.top = b.offsetTop + 'px'; try { navigator.vibrate && navInd._pos && navigator.vibrate(6); } catch (e) {} } else { navInd.style.height = to.h + 'px'; navInd.style.width = '3px'; }
    const from = navInd._pos;
    navInd.style.transform = mob ? `translateX(${to.x}px)` : `translateY(${to.y}px)`;
    if (from != null && from.mob === mob && !M.reduce()) {
      const a = mob ? from.x : from.y, z = mob ? to.x : to.y;
      M.animate(navInd, mob ? { x: [a, z] } : { y: [a, z] }, { stiffness: 500, damping: 34 });
    }
    navInd._pos = Object.assign({ mob }, to);
  }
  window.addEventListener('resize', () => { navInd._pos = null; moveNav(S.route); });
  let lastRoute = null, renderSeq = 0;
  async function onRoute() {
    const [, route = 'pano', id] = location.hash.split('/');
    const r = ROUTES[route] ? route : 'pano';
    if (r !== 'portal') document.body.classList.remove('portal-mode');
    const seq = ++renderSeq;
    if (S.editorApi && r !== 'editor') { S.editorApi.flush(); S.editorApi.destroy(); S.editorApi = null; }
    $$('.nav-btn').forEach((b) => b.classList.toggle('on', b.dataset.route === r));
    S.route = r; moveNav(r);
    const view = $('#view');
    const old = view.firstElementChild;
    const page = document.createElement('div');
    page.className = 'page page-' + r;
    try { await ROUTES[r].view(page, id); } catch (e) { console.error(e); page.innerHTML = `<div class="empty"><b>Bu sayfa açılamadı</b>${esc(e.message)}</div>`; }
    if (seq !== renderSeq) return;
    view.innerHTML = '';
    view.appendChild(page);
    if (old !== page) {
      if (!(window.MobileUI && window.MobileUI.pageIn(page, lastRoute, r))) M.animate(page, { opacity: [0, 1], y: [lastRoute ? 10 : 0, 0] }, { stiffness: 420, damping: 36 });
    }
    page.dispatchEvent(new Event('mounted'));
    if (window.MobileUI) window.MobileUI.mounted(page, r);
    lastRoute = r; S.route = r;
    if (window.Tour) window.Tour.auto(r);
  }
  window.addEventListener('hashchange', onRoute);

  // ================= PANO =================
  async function viewDashboard(page) {
    let list = [], tpls = [];
    try { [list, tpls] = await Promise.all([api('projects'), api('templates')]); } catch (e) { toast(e.message, true); }
    const prov = S.settings ? S.settings.provider : 'local';
    const provName = { local: 'Yerel motor', anthropic: 'Claude', ollama: 'Ollama', openai: 'OpenAI uyumlu' }[prov];
    const hour = new Date().getHours();
    const greet = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    page.innerHTML = `
    <div class="dash">
      <div class="dash-hero">
        <div class="prompt-card">
          <span class="ink-blob c"></span><span class="ink-blob m"></span><span class="ink-blob y"></span>
          <h1 class="h-display">${greet}. Bugün ne basıyoruz?</h1>
          <button class="btn ghost sm help-link" id="howTo">${icon('sparkle')}Nasıl kullanılır? Adım adım göster</button>
          <p class="lead">Ne istediğini yaz, stüdyo ilk taslağı hazırlasın. Sonra editörde katman katman düzenleyebilirsin.</p>
          <div class="prompt-box">
            <div class="q-att" id="qAtt" hidden></div>
            <textarea id="qPrompt" rows="2" placeholder="Örn. Kahve dükkanımın açılışı için sıcak tonlarda bir A4 flyer — başlık: “Kapılar Açılıyor”, %20 açılış indirimi"></textarea>
            <div class="q-actions">
              <button class="btn ghost" id="qAttach" title="Tasarımda kullanılacak görsel ekle">${icon('image')}<span>Görsel ekle</span></button>
              <button class="btn primary" id="qGo">${icon('sparkle')}<span>Hazırla</span></button>
            </div>
          </div>
          <button class="wiz-banner" id="wizGo"><span class="wb-ico">${icon('wizard')}</span><span><b>Sihirbazla ürün tasarımı</b><small>3 soru: ne satıyorsun, nerede paylaşacaksın, fotoğrafın. 6 hazır tasarım çıkar, birini seç.</small></span><span class="wb-go">Başla ${icon('chevR')}</span></button>
          <div class="drop-row">
          <button class="photo-drop" id="photoDrop">
            <span class="pd-ico">${icon('upload')}</span>
            <span><b>Fotoğrafını düzenle</b><small>Hazır bir afiş, etiket ya da ürün fotoğrafı seç veya buraya sürükle — editörde açılır, üzerindeki yazıları değiştirebilirsin.</small></span>
          </button>
          <button class="photo-drop file-drop" id="fileDrop">
            <span class="pd-ico">${icon('layers')}</span>
            <span><b>PSD · AI · PDF çalışmanı yükle</b><small>Photoshop, Illustrator ya da PDF dosyanı katmanlarıyla aç. PDF'te yazıları düzenle, imzala, işaretle — Adobe Reader gibi.</small><span class="ext-tags"><i>PSD</i><i>AI</i><i>PDF</i><i>SVG</i></span></span>
          </button>
          </div>
          <div class="prompt-chips" id="qChips">
            ${['Yaz indirimi için eğlenceli Instagram postu', 'Teknoloji konferansı için kurumsal banner', 'Düğün davetiyesi, lüks, altın detaylı', 'Restoran menü kampanyası story'].map((t) => `<button class="chip" data-t="${esc(t)}">${esc(t)}</button>`).join('')}
          </div>
        </div>
        <div class="side-stack">
          <div class="panel mini phone-card" ${window.TS_CLOUD ? 'hidden' : ''}>
            <div class="qr" id="qr" title="Telefon kamerasıyla okut">${S.lanUrls[0] ? window.Tools.qrSVG(S.lanUrls[0]) : ''}</div>
            <div><h3>Telefondan aç</h3>
            <p class="muted" style="margin:4px 0 0;font-size:12.5px">Aynı Wi‑Fi'dayken kodu kamerayla okut ya da adresi yaz:</p>
            <span class="url" id="lanUrl">${esc(S.lanUrls[0] || 'Adres aranıyor…')}</span><button class="btn ghost sm" id="insApp" style="margin-top:6px;padding-left:0">${icon('plus')}Ana ekrana ekle</button></div>
          </div>
          <div class="panel mini cal-card" id="calCard"></div>
          <div class="panel mini rq-card" id="rqCard" hidden></div>
          <div class="panel mini ai-card ${prov !== 'local' ? 'on' : ''}">
            <div class="row"><h3>Yapay zeka</h3><span class="status-pill ${prov !== 'local' ? 'ok' : 'off'}"><i></i>${esc(provName)}</span></div>
            <p class="muted" style="margin:6px 0 10px;font-size:12.5px">${prov === 'local' ? 'Şu an internetsiz şablon motoru çalışıyor. Serbest istekler ve görsel yorumlama için API anahtarını bağla.' : 'Bağlı. İsteklerin serbest metinle yorumlanıyor, yüklediğin görseller inceleniyor.'}</p>
            <div class="row" style="justify-content:flex-start;gap:6px;flex-wrap:wrap">
            <button class="btn sm ${prov === 'local' ? 'primary' : ''}" id="aiBtn">${icon(prov === 'local' ? 'sparkle' : 'gear')}${prov === 'local' ? 'API anahtarını bağla' : 'Bağlantıyı yönet'}</button>
            <button class="btn sm" id="imgBtn">${icon('image')}${S.settings && S.settings.img_provider && S.settings.img_provider !== 'none' ? 'Görsel üretimi: bağlı' : 'Görsel üretimini bağla'}</button></div>
          </div>
        </div>
      </div>

      <div class="sec-head bs-hide"><h2 class="h-display">Hazır şablonlar</h2><button class="btn sm" id="allTpl">${icon('layers')}Tümünü gör</button></div>
      <div class="lib-row bs-hide" id="libRow">${window.Library ? [...window.Library.templates.filter((t) => t.cat === 'Ürün tanıtımı').slice(0, 7), ...window.Library.templates.filter((t) => t.cat !== 'Ürün tanıtımı').slice(0, 3)].map((t) => `<div class="tg-card" data-lib="${t.id}"><div class="tg-th" style="aspect-ratio:${t.w}/${t.h}"></div><div class="tg-meta"><b>${esc(t.name)}</b><small>${esc(t.cat)}</small></div></div>`).join('') : ''}</div>

      <div class="sec-head bs-hide" id="qtHead"><h2 class="h-display">Hızlı araçlar</h2><span class="muted">Ne yapmak istediğini seç</span></div>
      <div class="qt-tabs bs-hide" role="tablist">${[['pop', 'Sık kullanılan'], ['bagis', 'Bağış'], ['namaz', 'Namaz · takvim'], ['sosyal', 'Sosyal medya'], ['belge', 'Baskı · belge'], ['diger', 'Diğer'], ['all', 'Tümü']].map(([k, t]) => `<button class="qt-tab" role="tab" data-qc="${k}">${t}</button>`).join('')}</div>
      <div class="quick-tools bs-hide" id="qtGrid">
        <button class="qt" data-cat="pop" data-qt="wizard">${icon('wizard')}<span><b>Tasarım sihirbazı</b><small>3 soru → 6 hazır ürün tasarımı</small></span></button>
        <button class="qt" data-cat="belge" data-qt="egitim">${icon('layers')}<span><b>Eğitim şablonları</b><small>sertifika, sınav, veli toplantısı, karne, mezuniyet</small></span></button>
        <button class="qt" data-cat="belge" data-qt="batch">${icon('copy')}<span><b>Toplu belge</b><small>listeden herkese adlı sertifika · tek PDF</small></span></button>
        <button class="qt" data-cat="pop sosyal" data-qt="slides">${icon('play')}<span><b>Fotoğraflardan video</b><small>5–10 fotoğraf, geçiş, yazı, müzik</small></span></button>
        <button class="qt" data-cat="belge" data-qt="brochure">${icon('layers')}<span><b>Üç kırımlı broşür</b><small>dış ve iç yüz, katlama yerleri işaretli</small></span></button>
        <button class="qt" data-cat="sosyal diger" data-qt="compare">${icon('copy')}<span><b>Tasarım karşılaştır</b><small>iki tasarım yan yana, puanlı</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="auto">${icon('calendar')}<span><b>Otomatik hazırlıklar</b><small>her perşembe cuma tasarımı, mübarek günlerden önce</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="vakit">${icon('calendar')}<span><b>Vakit tablosu</b><small>Fazilet takviminden saatleri yapıştır (bir kez)</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="imsakiye">${icon('moon')}<span><b>İmsakiye</b><small>Ramazan sahur / iftar tablosu, A4</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="vakitkart">${icon('calendar')}<span><b>Namaz vakti kartı</b><small>günlük story ya da haftalık tablo</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="ramseri">${icon('moon')}<span><b>Ramazan serisi</b><small>30 gün, her güne ayrı görsel ve hadis</small></span></button>
        <button class="qt adm" data-cat="namaz bagis" data-qt="tebrik">${icon('heart')}<span><b>Kandil / bayram tebriği</b><small>kişiye özel kartlar</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="htakvim">${icon('calendar')}<span><b>Hicri duvar takvimi</b><small>12 ay, mübarek günler işaretli</small></span></button>
        <button class="qt adm" data-cat="namaz" data-qt="mgun">${icon('calendar')}<span><b>Mübarek günleri düzelt</b><small>tarihleri kendi takvimine göre ayarla</small></span></button>
        <button class="qt adm" data-cat="bagis belge" data-qt="rapor">${icon('layers')}<span><b>Faaliyet raporu</b><small>rakamlar, grafik, fotoğraflar → PDF</small></span></button>
        <button class="qt adm" data-cat="bagis" data-qt="duvar">${icon('heart')}<span><b>Bağışçı duvarı</b><small>“bu ay destek verenler”</small></span></button>
        <button class="qt" data-cat="bagis sosyal" data-qt="onsonra">${icon('copy')}<span><b>Önce / sonra</b><small>iki fotoğraflı proje karşılaştırması</small></span></button>
        <button class="qt" data-cat="pop sosyal" data-qt="kolaj">${icon('layers')}<span><b>Kolaj</b><small>2–9 fotoğraf, hazır ızgaralar</small></span></button>
        <button class="qt" data-cat="belge" data-qt="kimlik">${icon('layers')}<span><b>Kurumsal kimlik paketi</b><small>kartvizit, antetli kâğıt, zarf, e-posta imzası</small></span></button>
        <button class="qt" data-cat="sosyal" data-qt="izgara">${icon('layers')}<span><b>Instagram ızgarası</b><small>profilde yan yana nasıl görünür</small></span></button>
        <button class="qt" data-cat="pop sosyal" data-qt="plan">${icon('calendar')}<span><b>İçerik planlayıcı</b><small>takvime tasarım yerleştir, hatırlatma al</small></span></button>
        <button class="qt" data-cat="pop sosyal" data-qt="p13:videos">${icon('play')}<span><b>Hazır hareketli videolar</b><small>kandil, Ramazan, kurban · müzikli story</small></span></button>
        <button class="qt" data-cat="bagis diger" data-qt="p13:webPage">${icon('file')}<span><b>Bağış web sayfası</b><small>IBAN, kampanyalar, WhatsApp · tek sayfa</small></span></button>
        <button class="qt" data-cat="belge bagis" data-qt="p13:badges">${icon('list')}<span><b>Gönüllü kartları</b><small>isimli yaka kartı · A4'e 8</small></span></button>
        <button class="qt" data-cat="belge bagis" data-qt="p13:boxLabel">${icon('qr')}<span><b>Sadaka kutusu etiketi</b><small>karekodlu kumbara / bağış kutusu etiketi</small></span></button>
        <button class="qt" data-cat="pop" data-qt="p12:photoStart">${icon('image')}<span><b>Fotoğraftan başla</b><small>fotoğrafını seç, uyan tasarımlar hazır gelsin</small></span></button>
        <button class="qt" data-cat="pop bagis" data-qt="p12:kurbanPack">${icon('heart')}<span><b>Kurban paketi</b><small>tek listeden vekâlet, kesildi kartı, teşekkür, mesajlar</small></span></button>
        <button class="qt" data-cat="bagis" data-qt="p12:donors">${icon('list')}<span><b>Bağışçı defteri</b><small>kişiler ve bağış geçmişi; makbuz ve kart buradan</small></span></button>
        <button class="qt" data-cat="bagis" data-qt="p12:goalAll">${icon('goal')}<span><b>Hedefleri güncelle</b><small>bütün bağış takibi tasarımları birlikte</small></span></button>
        <button class="qt" data-cat="bagis sosyal" data-qt="p12:result">${icon('goal')}<span><b>Kampanya sonuç kartı</b><small>“hedefimize ulaştık” teşekkürü</small></span></button>
        <button class="qt" data-cat="namaz bagis" data-qt="p12:greetTexts">${icon('chat')}<span><b>Bayram ve kandil mesajları</b><small>herkese adıyla WhatsApp metni</small></span></button>
        <button class="qt" data-cat="bagis" data-qt="p12:donorReport">${icon('chart')}<span><b>Bağış raporu</b><small>Aylık, yıllık özet · Excel ve PDF</small></span></button>
        <button class="qt" data-cat="pop bagis sosyal" data-qt="p12:sendLists">${icon('send')}<span><b>Gönderim listeleri</b><small>WhatsApp'ta kişi kişi gönder, kaldığın yerden sürdür</small></span></button>
        <button class="qt" data-cat="sosyal belge" data-qt="p12:invite">${icon('calendar')}<span><b>Davetiye ve katılım kodu</b><small>iftar, mevlid programı · karekodla “Katılıyorum”</small></span></button>
        <button class="qt" data-cat="pop namaz" data-qt="p12:weekly">${icon('calendar')}<span><b>Bu haftanın paketi</b><small>Cuma, yaklaşan mübarek gün, haftanın hadisi</small></span></button>
        <button class="qt" data-cat="sosyal" data-qt="p12:history">${icon('calendar')}<span><b>Paylaşım geçmişi</b><small>neyi ne zaman paylaştın</small></span></button>
        <button class="qt" data-cat="pop diger" data-qt="p12:sync">${icon('copy')}<span><b>Telefon ↔ bilgisayar eşitle</b><small>tasarımları öbür cihaza taşı</small></span></button>
        <button class="qt" data-cat="bagis belge" data-qt="makbuz">${icon('file')}<span><b>Bağış makbuzu</b><small>isim listesinden makbuz no'lu PDF</small></span></button>
        <button class="qt" data-cat="bagis belge" data-qt="vekalet">${icon('file')}<span><b>Kurban vekâlet formu</b><small>hissedar adlarıyla doldurulmuş PDF</small></span></button>
        <button class="qt" data-cat="pop sosyal" data-qt="hareket">${icon('play')}<span><b>Hareketli story</b><small>açık tasarımı 5 sn videoya çevir</small></span></button>
        <button class="qt" data-cat="diger" data-qt="trash">${icon('trash')}<span><b>Geri dönüşüm kutusu</b><small>silinen projeler 30 gün burada</small></span></button>
        <button class="qt" data-cat="pop bagis" data-qt="bagis">${icon('heart') || icon('layers')}<span><b>Bağış · Kampanya şablonları</b><small>Ramazan, Kurban, Kumanya, Aşure, Eğitim</small></span></button>
        <button class="qt" data-cat="pop bagis" data-qt="kit">${icon('copy')}<span><b>Kampanya seti</b><small>bir kez yaz, 5 ölçü birden</small></span></button>
        <button class="qt" data-cat="namaz" data-qt="hijri">${icon('moon')}<span><b>Hicri takvim</b><small>kandiller, Ramazan, Kurban, Aşure</small></span></button>
        <button class="qt" data-cat="bagis" data-qt="thanks">${icon('heart')}<span><b>Teşekkür kartları</b><small>isim listesinden toplu kart</small></span></button>
        <button class="qt" data-cat="bagis" data-qt="goal">${icon('goal')}<span><b>Bağış takibi</b><small>hedef, toplanan, kalan gün</small></span></button>
        <button class="qt" data-cat="diger" data-qt="fromimg">${icon('image')}<span><b>Görselden şablon</b><small>bitmiş tasarımını şablona çevir</small></span></button>
        <button class="qt" data-cat="pop" data-qt="food">${icon('layers')}<span><b>Gıda şablonları</b><small>36 şablon, her ölçüde ayrı kurulur</small></span></button>
        <button class="qt" data-cat="diger" data-qt="ref">${icon('image')}<span><b>Bu tasarıma benzet</b><small>beğendiğin tasarımın renkleriyle şablonlar</small></span></button>
        <button class="qt" data-cat="pop" data-qt="camp">${icon('calendar')}<span><b>Yaklaşan kampanyalar</b><small>özel günler için hazır tasarımlar</small></span></button>
        <button class="qt" data-cat="sosyal" data-qt="carousel">${icon('layers')}<span><b>Kaydırmalı gönderi</b><small>Instagram carousel, parçalara bölünür</small></span></button>
        <button class="qt" data-cat="belge" data-qt="catalog">${icon('list')}<span><b>Menü / katalog</b><small>Excel'den çok sayfalı fiyat listesi</small></span></button>
        <button class="qt" data-cat="belge" data-qt="box">${icon('cut')}<span><b>Kutu kesim şablonu</b><small>ölçü gir, kesim + katlama PDF</small></span></button>
        <button class="qt" data-cat="diger" data-qt="brand">${icon('palette')}<span><b>Logodan marka kiti</b><small>renk ve fontları otomatik bul</small></span></button>
        <button class="qt" data-cat="diger" data-qt="req">${icon('chat')}<span><b>Müşteri talepleri</b><small>portal bağlantısı ve gelen işler</small></span></button>
        <button class="qt" data-cat="diger" data-qt="pkg">${icon('upload')}<span><b>Şablon paketi aç</b><small>.tasarim dosyası içe aktar</small></span></button>
      </div>
      <div class="sec-head bs-hide"><h2 class="h-display">Boş tuvalle başla</h2><span class="muted">Ölçüyü seç, doğrudan editör açılsın</span></div>
      <div class="formats bs-hide">
        ${FORMATS.map((f) => { const sc = 26 / Math.max(f.w, f.h); return `<button class="fmt" data-w="${f.w}" data-h="${f.h}" data-n="${esc(f.name)}"><span class="shape"><i style="width:${Math.max(6, f.w * sc)}px;height:${Math.max(6, f.h * sc)}px"></i></span><span><b>${esc(f.name)}</b><small>${f.w} × ${f.h}</small></span></button>`; }).join('')}
        <button class="fmt fmt-img" id="editImg"><span class="shape">${icon('image')}</span><span><b>Görsel düzenle</b><small>Yükle, yapay zekasız düzenle</small></span></button>
        <button class="fmt" id="impFile"><span class="shape">${icon('file')}</span><span><b>PSD / AI / PDF aç</b><small>Katmanlarıyla düzenle</small></span></button>
        <button class="fmt" id="customFmt"><span class="shape">${icon('ratio')}</span><span><b>Özel ölçü</b><small>Genişlik × yükseklik</small></span></button>
      </div>

      ${tpls.length ? `<div class="sec-head"><h2 class="h-display">Şablonların</h2><button class="btn sm" id="batchBtn">${icon('layers')}Ürün serisi</button></div>
      <div class="tpl-row">${tpls.map((t) => `<div class="tpl" data-id="${t.id}"><button class="tpl-th" title="Bu şablonla yeni tasarım">${t.thumb ? `<img src="${t.thumb}" alt="">` : ''}</button><div class="tpl-meta"><b>${esc(t.name)}</b><span><button class="btn ghost sm icon" data-a="batch" title="Bu şablonla toplu üret">${icon('layers')}</button><button class="btn ghost sm icon" data-a="del" title="Şablonu sil">${icon('trash')}</button></span></div></div>`).join('')}</div>` : ''}

      <div class="sec-head"><h2 class="h-display">Tasarımların</h2><span class="muted">${list.length ? list.length + ' proje' : ''}</span></div>
      <div class="projects" id="projList">
        ${list.length ? list.map(projCard).join('') : `<div class="panel empty" style="grid-column:1/-1"><b>Henüz tasarım yok</b>Yukarıya ne istediğini yaz ya da bir ölçü seç. Kaydettiğin her şey burada listelenir.</div>`}
      </div>
    </div>`;

    let attached = null;
    const go1 = async () => {
      let t = $('#qPrompt', page).value.trim();
      if (!t && attached) t = 'Bu görselle bir Instagram postu hazırla';
      if (!t) { $('#qPrompt', page).focus(); return; }
      S.project = newProject();
      if (attached) { S.reference = attached; S.palette = await R.extractPalette(attached); store.set('useRef', true); }
      S.pendingPrompt = t;
      go('studyo');
    };
    const showAtt = () => {
      const box = $('#qAtt', page);
      box.hidden = !attached;
      box.innerHTML = attached ? `<span class="att-chip"><img src="${esc(attached)}" alt=""><span>Görsel eklendi</span><button title="Kaldır" id="attX">${icon('x')}</button></span>` : '';
      if (attached) { M.animate(box.firstElementChild, { opacity: [0, 1], scale: [.9, 1] }); $('#attX', page).onclick = () => { attached = null; showAtt(); }; }
    };
    $('#qAttach', page).onclick = () => pickFiles(async (files) => {
      const f = files[0]; if (!f) return;
      try { attached = (await uploadFile(f)).url; showAtt(); $('#qPrompt', page).focus(); } catch (e) { toast(e.message, true); }
    }, false);
    $('#photoDrop', page).onclick = () => window.Features.editUpload();
    $('#fileDrop', page).onclick = () => window.Features.importFile();
    const dropFiles = async (files) => {
      const df = [...files].find((x) => /\.(psd|ai|pdf|svg|tasarim)$/i.test(x.name));
      if (df) return window.Features.importFile(df);
      const f = [...files].find((x) => x.type.startsWith('image/'));
      if (!f) return toast('Yalnızca görsel dosyaları bırakabilirsin', true);
      try { const r = await uploadFile(f); await window.Features.editImage(r.url, f.name.replace(/\.[^.]+$/, '')); } catch (e) { toast(e.message, true); }
    };
    page.addEventListener('dragover', (e) => { e.preventDefault(); const it = e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items[0]; const isDoc = it && it.type && !it.type.startsWith('image/') || (it && /pdf|photoshop|svg|postscript|illustrator/.test(it.type)); $(isDoc ? '#fileDrop' : '#photoDrop', page).classList.add('over'); });
    page.addEventListener('dragleave', (e) => { if (!page.contains(e.relatedTarget)) $$('.photo-drop', page).forEach((x) => x.classList.remove('over')); });
    page.addEventListener('drop', (e) => { e.preventDefault(); $$('.photo-drop', page).forEach((x) => x.classList.remove('over')); dropFiles(e.dataTransfer.files); });
    $('#qGo', page).onclick = go1;
    $('#qPrompt', page).onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go1(); } };
    $$('#qChips .chip', page).forEach((c) => (c.onclick = () => { $('#qPrompt', page).value = c.dataset.t; $('#qPrompt', page).focus(); }));
    $$('.fmt[data-w]', page).forEach((b) => (b.onclick = async () => {
      S.project = newProject(+b.dataset.w, +b.dataset.h, b.dataset.n);
      await saveProject(S.project, { thumb: false });
      go('editor', S.project.id);
    }));
    $('#customFmt', page).onclick = customSize;
    $('#aiBtn', page).onclick = () => window.Features.connectAI();
    $('#imgBtn', page).onclick = async () => { await window.Features.connectImageAI(); onRoute(); };
    $('#editImg', page).onclick = () => window.Features.editUpload();
    const stopType = window.Features.typePlaceholder($('#qPrompt', page), ['Kahve dükkanımın açılışı için sıcak tonlarda A4 flyer, başlık: “Kapılar Açılıyor”', 'Spor salonu için dinamik Instagram story, %30 üyelik indirimi', 'Teknoloji webinarı için lacivert kurumsal banner', 'Kitap kulübü buluşması için zarif davetiye']);
    cleanupOnLeave(page, stopType);
    const bb = $('#batchBtn', page); if (bb) bb.onclick = () => window.Features.batchDialog();
    $$('.tpl', page).forEach((t) => {
      t.querySelector('.tpl-th').onclick = () => window.Features.useTemplate(t.dataset.id);
      t.querySelector('[data-a=batch]').onclick = () => window.Features.batchDialog(t.dataset.id);
      t.querySelector('[data-a=del]').onclick = async () => { if (await confirmBox('Şablon silinsin mi?', 'Bu şablondan üretilmiş tasarımlar etkilenmez.')) { await api('templates/' + t.dataset.id, { method: 'DELETE' }); onRoute(); } };
    });
    const qr = $('#qr', page);
    if (qr && S.lanUrls[0]) qr.onclick = () => window.Features.phoneDialog();
    const ht = $('#howTo', page); if (ht) ht.onclick = () => window.Tour.start('pano');
    const wz = $('#wizGo', page); if (wz) wz.onclick = () => window.P6.wizard();
    $$('[data-qt]', page).forEach((b) => (b.onclick = () => { const k = b.dataset.qt, P5 = window.P5; if (k === 'wizard') return window.P6.wizard(); if (k === 'camp') return window.P6.campaigns(); if (k === 'carousel') return window.P6.carouselNew(); if (k === 'food') return window.Features.templateGallery('Gıda'); if (k === 'bagis') return window.Features.templateGallery('Bağış · Kampanya'); const P9 = window.P9; if (k === 'egitim') return window.Features.templateGallery('Eğitim'); if (k === 'batch') return P9.batch(); if (k === 'slides') return P9.slideshow(); if (k === 'brochure') return P9.brochure(); if (k === 'compare') return P9.compare(); if (k === 'auto') return P9.autoDialog(); if (k === 'trash') return P9.trash(); const P10 = window.P10; const m10 = { vakit: 'vakitDialog', imsakiye: 'imsakiye', vakitkart: 'vakitCard', ramseri: 'ramadanSeries', tebrik: 'greeting', htakvim: 'wallCalendar', mgun: 'daysDialog', rapor: 'report', duvar: 'donorWall', onsonra: 'beforeAfter', kolaj: 'collage', kimlik: 'identity', izgara: 'igGrid', plan: 'planner' }; if (m10[k]) return P10[m10[k]](); if (k.startsWith('p12:') && window.P12) return window.P12[k.slice(4)](); if (k.startsWith('p13:') && window.P13) return window.P13[k.slice(4)](); const P11 = window.P11; if (P11 && k === 'makbuz') return P11.receipts(); if (P11 && k === 'vekalet') return P11.proxyForm(); if (P11 && k === 'hareket') return P11.motionStory(); if (k === 'kit') return window.P7.campaignKit(); if (k === 'hijri') return window.P7.calendar(); if (k === 'thanks') return window.P7.thanks(); if (k === 'goal') return window.Features.useLibraryTemplate(window.Library.templates.find((t) => t.id === 'b-takip-koli'), 0); if (k === 'fromimg') return window.P7.fromImage(); if (k === 'ref') return window.P6.reference(); if (k === 'catalog') P5.catalogDialog(); if (k === 'box') P5.boxDialog(); if (k === 'brand') P5.brandFromImage(() => go('marka')); if (k === 'req') P5.requestsDialog(); if (k === 'pkg') window.Features.importFile(); }));
    // hızlı araçlar: konu sekmeleri (hepsi bir anda görünmesin, karışık durmasın)
    { const grid = $('#qtGrid', page), tabs = $$('.qt-tab', page);
      const pick = (k, anim) => { tabs.forEach((t) => t.classList.toggle('on', t.dataset.qc === k)); let i = 0;
        $$('.qt', grid).forEach((b) => { const show = k === 'all' || (b.dataset.cat || '').split(' ').includes(k); b.hidden = !show; if (show && anim) { b.style.animationDelay = Math.min(i++ * 22, 300) + 'ms'; b.classList.remove('qt-in'); void b.offsetWidth; b.classList.add('qt-in'); } });
        try { localStorage.setItem('ts_qtab', k); } catch (e) {} };
      tabs.forEach((t) => (t.onclick = () => pick(t.dataset.qc, true)));
      let k0 = 'pop'; try { k0 = localStorage.getItem('ts_qtab') || 'pop'; } catch (e) {} pick(tabs.some((t) => t.dataset.qc === k0) ? k0 : 'pop', false); }
    const ia = $('#insApp', page); if (ia) ia.onclick = () => window.P5.installGuide();
    const renderCal = () => {
      const cc = $('#calCard', page); if (!cc) return;
      const today = new Date(), key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const end = key(new Date(today.getTime() + 6 * 864e5)), t0 = key(today);
      const up = window.Features.calendarItems().filter((x) => !x.done && x.date >= t0 && x.date <= end).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 4);
      const sd = window.P5 ? window.P5.upcoming(21).slice(0, 2) : [];
      cc.innerHTML = `<div class="row"><h3>${icon('calendar')} Bu hafta</h3><button class="btn ghost sm" id="calOpen">Takvim</button></div>${sd.length ? `<div class="sd-mini">${sd.map((d) => `<button class="sd-it" data-sd="${esc(d.prompt)}" data-date="${d.date}" title="Bu gün için hazır tasarım">★ <b>${new Date(d.date + 'T00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</b> ${esc(d.name)} <span>Tasarla →</span></button>`).join('')}</div>` : ''}${up.length ? `<div class="cal-mini">${up.map((x) => `<div><b>${new Date(x.date + 'T00:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' })}</b><span>${esc(x.time || '')} · ${esc(x.note || x.platform)}</span></div>`).join('')}</div>` : `<p class="muted" style="margin:6px 0 0;font-size:12.5px">Planlı paylaşım yok. Ne zaman ne paylaşacağını planla, hatırlatma al.</p>`}`;
      $('#calOpen', cc).onclick = async () => { await window.Features.calendar(); renderCal(); };
      $$('[data-sd]', cc).forEach((b) => (b.onclick = () => (window.P6 ? window.P6.campaigns(b.dataset.date) : window.App.startPrompt(b.dataset.sd))));
    };
    renderCal();
    api('requests').then((rq) => { const nw = (rq || []).filter((r) => r.status === 'new'), c = $('#rqCard', page); if (!c || !rq || !rq.length) return; c.hidden = false; c.innerHTML = `<div class="row"><h3>${icon('chat')} Müşteri talepleri</h3>${nw.length ? `<span class="status-pill off" style="background:rgba(245,158,11,.15);color:#F59E0B">${nw.length} yeni</span>` : ''}</div><p class="muted" style="margin:6px 0 8px;font-size:12.5px">${esc(rq[0].title)}${rq.length > 1 ? ` ve ${rq.length - 1} talep daha` : ''}</p><button class="btn sm" id="rqOpen">Talepleri gör</button>`; $('#rqOpen', c).onclick = () => window.P5.requestsDialog(); }).catch(() => {});
    const imf = $('#impFile', page); if (imf) imf.onclick = () => window.Features.importFile();
    const at = $('#allTpl', page); if (at) at.onclick = () => window.Features.templateGallery();
    $$('[data-lib]', page).forEach((c, i) => {
      const t = window.Library.templates.find((x) => x.id === c.dataset.lib);
      setTimeout(() => { c.querySelector('.tg-th').innerHTML = window.Features.templateThumb(t, 0); }, 60 + i * 40);
      c.onclick = () => window.Features.useLibraryTemplate(t, 0);
    });
    $$('.proj', page).forEach((card) => {
      const id = card.dataset.id;
      card.querySelector('.thumb').onclick = () => go('onizleme', id);
      card.querySelector('[data-a=edit]').onclick = () => go('editor', id);
      card.querySelector('[data-a=studio]').onclick = () => go('studyo', id);
      card.querySelector('[data-a=more]').onclick = (e) => projMenu(e, id, card);
    });
    if (window.P6) window.P6.mountProjectFilters(page, list);
    M.stagger($$('.proj, .tpl', page).slice(0, 24), { opacity: [0, 1], y: [14, 0] }, { delay: 80, each: 30, stiffness: 300, damping: 30 });
  }
  function timeAgo(t) {
    if (!t) return '';
    const s = Date.now() / 1000 - t;
    if (s < 60) return 'az önce';
    if (s < 3600) return Math.floor(s / 60) + ' dk önce';
    if (s < 86400) return Math.floor(s / 3600) + ' sa önce';
    return new Date(t * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }
  function projCard(p) {
    return `<div class="proj" data-id="${p.id}">
      <div class="thumb">${p.thumb ? `<img src="${p.thumb}" alt="" loading="lazy" decoding="async">` : `<span class="muted" style="font-size:12px">Boş tuval</span>`}</div>
      <div class="acts">
        <button class="btn sm icon" data-a="studio" title="Stüdyoda aç">${icon('sparkle')}</button>
        <button class="btn sm icon" data-a="edit" title="Düzenle">${icon('pen')}</button>
      </div>
      <div class="meta"><div><b>${esc(p.name || 'Adsız')}</b><small>${p.width} × ${p.height} · ${timeAgo(p.updated)}</small></div>
      <button class="btn ghost sm icon" data-a="more" title="Diğer işlemler">${icon('more')}</button></div>
    </div>`;
  }
  async function projMenu(e, id, card) {
    const act = await dialog(`<div class="d-body"><h3>Proje işlemleri</h3></div><div class="cmdk"><div class="list">
      <div class="it" data-v="rename">${icon('pen')}<span>Yeniden adlandır</span></div>
      <div class="it" data-v="dup">${icon('copy')}<span>Çoğalt</span></div>
      <div class="it" data-v="preview">${icon('eye')}<span>Önizle ve indir</span></div>
      <div class="it" data-v="adapt">${icon('copy')}<span>Diğer formatlara uyarla</span></div>
      <div class="it" data-v="tpl">${icon('layers')}<span>Şablon olarak kaydet</span></div>
      <div class="it" data-v="folder">${icon('folder')}<span>Klasöre taşı</span></div>
      <div class="it" data-v="tags">${icon('tag')}<span>Etiketler</span></div>
      <div class="it" data-v="del" style="color:var(--danger)">${icon('trash')}<span style="color:var(--danger)">Sil</span></div></div></div>`,
      { onOpen: (box, close) => $$('.it', box).forEach((it) => (it.onclick = () => close(it.dataset.v))) });
    if (!act) return;
    if (act === 'folder' || act === 'tags') { if (await window.P6.organize(id, act === 'folder' ? 'folder' : 'tags')) onRoute(); return; }
    const p = await api('projects/' + id);
    if (act === 'rename') {
      const n = await promptBox('Yeni ad', p.name || '');
      if (n) { p.name = n; await api('projects', { body: p }); onRoute(); }
    } else if (act === 'dup') {
      delete p.id; p.name = (p.name || 'Tasarım') + ' kopya'; p.created = null;
      await api('projects', { body: p }); toast('Çoğaltıldı'); onRoute();
    } else if (act === 'preview') go('onizleme', id);
    else if (act === 'adapt' || act === 'tpl') { const pr = R.normalize(p); pr.chat = pr.chat || []; pr.versions = pr.versions || []; if (act === 'adapt') await window.Features.adaptDialog(pr); else await window.Features.saveTemplate(pr); onRoute(); }
    else if (act === 'del') {
      if (await confirmBox('Tasarım silinsin mi?', `“${p.name}” kalıcı olarak silinecek. Bu işlem geri alınamaz.`)) {
        await api('projects/' + id, { method: 'DELETE' });
        if (S.project && S.project.id === id) S.project = null;
        M.animate(card, { opacity: [1, 0], scale: [1, .94] }, { keep: true }).then(() => card.remove());
        toast('Silindi');
      }
    }
  }
  async function customSize() {
    const r = await dialog(`<div class="d-body"><h3>Özel ölçü</h3><p class="muted">Piksel cinsinden. Baskı için 150 dpi'de A4 = 1240 × 1754.</p>
      <div class="form-grid"><label class="field"><span>Genişlik</span><input class="inp" id="cw" type="number" value="1080" min="16" max="8000"></label>
      <label class="field"><span>Yükseklik</span><input class="inp" id="ch" type="number" value="1350" min="16" max="8000"></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="cOk">Tuvali oluştur</button></div>`,
      { onOpen: (box, close) => ($('#cOk', box).onclick = () => close({ w: +$('#cw', box).value, h: +$('#ch', box).value })) });
    if (!r || !(r.w > 15 && r.h > 15)) return;
    S.project = newProject(Math.min(8000, r.w), Math.min(8000, r.h), 'Özel tasarım');
    await saveProject(S.project, { thumb: false });
    go('editor', S.project.id);
  }

  // ================= STÜDYO =================
  async function viewStudio(page, id) {
    if (id || !S.project) await ensureProject(id);
    if (!S.project) S.project = newProject();
    const p = S.project;
    if (!S.reference && p.meta && p.meta.reference) S.reference = p.meta.reference;
    try { S.uploads = await api('uploads'); } catch (e) {}
    const mtab = store.get('mtab', 'chat');
    page.innerHTML = `
    <div class="studio">
      <div class="m-tabs">
        <button data-m="ref">${icon('image')}Örnek</button>
        <button data-m="stage">${icon('eye')}Tasarım</button>
        <button data-m="chat">${icon('sparkle')}Sohbet</button>
      </div>
      <section class="ref-col" data-m="ref">
        <div class="col-head"><h2>Örnek içerik</h2></div>
        <div class="ref-body" id="refBody"></div>
      </section>
      <section class="stage-col" data-m="stage">
        <div class="col-head">
          <h2 id="pName" title="Adı değiştirmek için tıkla" style="cursor:text">${esc(p.name)}</h2>
          <button class="btn sm ghost" id="sNew" title="Yeni tasarım">${icon('plus')}<span class="hide-m">Yeni</span></button>
          <button class="btn sm" id="sPrev">${icon('eye')}<span>Önizle</span></button>
          <button class="btn sm primary" id="sEdit">${icon('pen')}<span>Düzenle</span></button>
        </div>
        <div class="stage" id="stage"></div>
        <div class="versions" id="versions"></div>
      </section>
      <section class="chat-col" data-m="chat">
        <div class="col-head"><h2>Tasarım sohbeti</h2><button class="status-pill pill-btn" id="provPill" title="Yapay zeka bağlantısı"><i></i></button></div>
        <div class="msgs" id="msgs"></div>
        <div class="composer">
          <div class="sugg" id="sugg"></div>
          <div class="prompt-box">
            <textarea id="cIn" rows="1" placeholder="Ne istediğini yaz…"></textarea>
            <button class="btn primary icon" id="cSend" title="Gönder (Enter)">${icon('send')}</button>
          </div>
          <div class="opts">
            <select class="inp" id="cFmt" title="Format">
              <option value="">Format: otomatik</option>
              ${FORMATS.map((f) => `<option value="${f.w}x${f.h}">${esc(f.name)} · ${f.w}×${f.h}</option>`).join('')}
            </select>
            <select class="inp" id="cCount" title="Kaç seçenek hazırlansın"><option value="1">1 tasarım</option><option value="3" ${store.get('count', 3) == 3 ? 'selected' : ''}>3 seçenek</option><option value="4" ${store.get('count', 3) == 4 ? 'selected' : ''}>4 seçenek</option></select>
            <label class="switch" title="Yüklenen örnek görseli tasarımda kullan"><input type="checkbox" id="cUseRef" ${store.get('useRef', true) ? 'checked' : ''}>Örnek</label>
            ${S.brand && S.brand.enabled ? `<label class="switch" title="Marka kitini uygula"><input type="checkbox" id="cBrand" ${store.get('useBrand', true) ? 'checked' : ''}>Marka</label>` : ''}
          </div>
        </div>
      </section>
    </div>`;

    const setM = (m) => { store.set('mtab', m); $$('.m-tabs button', page).forEach((b) => b.classList.toggle('on', b.dataset.m === m)); $$('.studio > section', page).forEach((s) => s.classList.toggle('m-on', s.dataset.m === m)); if (m === 'stage') fitStage(); };
    $$('.m-tabs button', page).forEach((b) => (b.onclick = () => setM(b.dataset.m)));
    setM(mtab);

    const provNames = { local: 'Yerel motor', anthropic: 'Claude', ollama: 'Ollama', openai: 'OpenAI uyumlu' };
    const provNow = (S.settings || {}).provider || 'local';
    const pill = $('#provPill', page);
    pill.classList.toggle('ok', provNow !== 'local');
    pill.innerHTML = `<i></i>${provNames[provNow]}${provNow === 'local' ? ' · <u>Yapay zekayı bağla</u>' : ''}`;
    pill.onclick = () => window.Features.connectAI();

    // --- referans paneli
    function renderRefs() {
      const body = $('#refBody', page);
      body.innerHTML = `
        <div class="drop" id="drop" tabindex="0" role="button">${icon('upload')}<b>Örnek görsel yükle</b><small>Sürükle bırak, tıkla ya da yapıştır (Ctrl+V). Logo, ürün fotoğrafı ya da beğendiğin bir tasarım olabilir.</small></div>
        <button class="btn ai-gen-btn" id="refGen">${icon('sparkle')}<span>Yapay zekayla görsel üret</span></button>
        ${S.reference ? `<div><p class="label"><span>Seçili örnek</span></p><div class="ref-current"><img src="${esc(S.reference)}" alt="Seçili örnek"><button class="btn sm icon x" id="refX" title="Seçimi kaldır">${icon('x')}</button></div>
        <button class="btn sm primary edit-direct" id="refRedesign">${icon('sparkle')}Benzer şekilde güzelleştir</button>
        <button class="btn sm edit-direct" id="refRedesignNew">${icon('palette')}Yeni bir stille yeniden tasarla</button>
        <button class="btn sm edit-direct" id="refAiEdit">${icon('wand')}Görseli yapay zekayla değiştir</button>
        <button class="btn sm edit-direct" id="refEdit">${icon('pen')}Bu görseli editörde düzenle</button>
        <button class="btn sm edit-direct" id="refLayers" title="Yazılar, şekiller ve nesneler ayrı katman olur; arkası temizlenir">${icon('layers')}Katmanlara ayırıp düzenle (PSD gibi)</button>
        <p class="muted" style="font-size:11.5px;margin:6px 2px 0;line-height:1.45"><b>Benzer:</b> aynı renk, şekil ve atmosfer korunur; yalnızca düzen, okunurluk ve kalite iyileşir. <b>Yeni stil:</b> içerik aynı, görünüm tamamen yeni. (Yapay zeka gerekir.)</p></div>
        <div><p class="label"><span>Örnekten çıkarılan renkler</span></p><div class="swatches">${S.palette.map((c) => `<span class="sw" style="background:${c}" title="${c}"></span>`).join('')}</div></div>` : ''}
        <div><p class="label"><span>Yüklenenler</span><span>${S.uploads.length}</span></p>
          <div class="gallery">${S.uploads.slice(0, 30).map((u) => `<div class="g-it ${u.url === S.reference ? 'on' : ''}"><button data-u="${esc(u.url)}" title="Örnek olarak seç"><img src="${esc(u.url)}" loading="lazy" alt=""></button><button class="g-edit" data-e="${esc(u.url)}" title="Editörde aç">${icon('pen')}</button></div>`).join('') || '<span class="muted" style="grid-column:1/-1;font-size:12px">Yüklediğin görseller burada durur.</span>'}</div></div>`;
      const drop = $('#drop', body);
      drop.onclick = () => pickFiles(onFiles);
      drop.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickFiles(onFiles); } };
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => onFiles(e.dataTransfer.files));
      $$('.gallery [data-u]', body).forEach((b) => (b.onclick = () => selectRef(b.dataset.u)));
      $$('.gallery [data-e]', body).forEach((b) => (b.onclick = () => window.Features.editImage(b.dataset.e)));
      const re = $('#refEdit', body); if (re) re.onclick = () => window.Features.editImage(S.reference);
      const rl = $('#refLayers', body); if (rl) rl.onclick = () => window.Features.editImage(S.reference, 'Katmanlı görsel', { decompose: true });
      const rd = $('#refRedesign', body);
      const goRedesign = (fid) => {
        if (((S.settings || {}).provider || 'local') === 'local') { toast('Yeniden tasarım için önce yapay zekayı bağla', true); return window.Features.connectAI(); }
        if (innerWidth < 820) setM('stage');
        const fmt = $('#cFmt', page).value;
        send(fid === 'new' ? 'Bu taslağın içeriğini ve yerleşimini koru, yeni bir stille yeniden tasarla' : 'Bu çalışmaya çok benzer kalsın; renkleri ve tarzı koruyarak daha düzenli ve profesyonel hale getir' + (fmt ? ' ' + fmt : ''), { mode: 'redesign', fidelity: fid });
      };
      if (rd) rd.onclick = () => goRedesign('similar');
      const rdn = $('#refRedesignNew', body); if (rdn) rdn.onclick = () => goRedesign('new');
      const x = $('#refX', body); if (x) x.onclick = () => { S.reference = null; S.palette = []; renderRefs(); };
      $('#refGen', body).onclick = async () => {
        const r = await window.Features.imageGenDialog({ aspect: p.layers.length ? window.Features.aspectOf(p.width, p.height) : '1:1' });
        if (r && r.url) { S.uploads = await api('uploads'); await selectRef(r.url); toast('Görsel hazır ve örnek olarak seçildi'); }
      };
      const ae = $('#refAiEdit', body);
      if (ae) ae.onclick = async () => {
        const r = await window.Features.imageGenDialog({ base: S.reference });
        if (r && r.url) { S.uploads = await api('uploads'); await selectRef(r.url); toast('Düzenlenen görsel örnek olarak seçildi'); }
      };
    }
    async function selectRef(url) {
      S.reference = url;
      S.palette = await R.extractPalette(url);
      renderRefs();
    }
    async function onFiles(files) {
      let last = null;
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        try { last = (await uploadFile(f)).url; } catch (e) { toast(e.message, true); }
      }
      if (last) { S.uploads = await api('uploads'); await selectRef(last); toast('Görsel yüklendi'); }
    }
    page._onPaste = (e) => {
      const files = [...(e.clipboardData || {}).items || []].filter((i) => i.type.startsWith('image/')).map((i) => i.getAsFile());
      if (files.length) { e.preventDefault(); onFiles(files); }
    };
    document.addEventListener('paste', page._onPaste);
    if (S.reference && !S.palette.length) S.palette = await R.extractPalette(S.reference);
    renderRefs();

    // --- sahne
    const stage = $('#stage', page);
    function renderStage(animate) {
      if (!p.layers.length) {
        stage.innerHTML = `<div class="stage-empty"><div class="sheet"><span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span></div><b>Tuval seni bekliyor</b>Sağdaki sohbete ne istediğini yaz. İstersen önce soldan örnek bir görsel yükle; renkleri ve görseli tasarıma taşırım.</div>`;
        return;
      }
      stage.innerHTML = `<div class="artboard" id="art"><span class="reg"></span><span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span><span class="dims">${p.width} × ${p.height} px</span>${R.renderSVG(p, { fit: true })}</div>`;
      fitStage();
      if (animate) M.animate($('#art', stage), { opacity: [0, 1], scale: [.94, 1], y: [10, 0] }, { stiffness: 260, damping: 24 });
    }
    function fitStage() {
      const art = $('#art', stage);
      if (!art) return;
      const pad = innerWidth < 820 ? 50 : 100;
      const sw = stage.clientWidth - pad, sh = stage.clientHeight - pad;
      if (sw <= 0 || sh <= 0) return;
      const sc = Math.min(sw / p.width, sh / p.height, 1);
      art.style.width = p.width * sc + 'px';
      art.style.height = p.height * sc + 'px';
    }
    const stageRO = new ResizeObserver(() => fitStage());
    stageRO.observe(stage);
    page.addEventListener('mounted', () => fitStage());
    renderStage();

    function renderVersions() {
      const v = $('#versions', page);
      if (!p.versions.length) { v.style.display = 'none'; return; }
      v.style.display = '';
      v.innerHTML = `<span class="muted" style="font-size:12px;flex:none">Sürümler</span>` + p.versions.map((ver, i) => `<button data-i="${i}" class="${ver.current ? 'on' : ''}" title="${esc(ver.label || 'Sürüm ' + (i + 1))}">${ver.thumb ? `<img src="${ver.thumb}" alt="">` : i + 1}</button>`).join('');
      $$('button', v).forEach((b) => (b.onclick = () => {
        const ver = p.versions[+b.dataset.i];
        Object.assign(p, R.normalize(JSON.parse(JSON.stringify(ver.design))));
        p.versions.forEach((x) => (x.current = x === ver));
        renderStage(true); renderVersions(); autosave(300);
      }));
      v.scrollLeft = v.scrollWidth;
    }
    renderVersions();

    // --- sohbet
    const msgs = $('#msgs', page);
    function renderMsgs() {
      if (!p.chat.length) {
        msgs.innerHTML = `<div class="chat-intro"><b>Merhaba, ne tasarlayalım?</b>Ne kadar net yazarsan sonuç o kadar iyi olur. Şunları belirtmen işe yarar:
          <ul><li>Format: flyer, story, banner…</li><li>Metinler tırnak içinde: “Yaz İndirimi”</li><li>Renkler ya da stil: lacivert‑altın, minimal, eğlenceli</li></ul>Tasarım geldikten sonra “başlığı büyüt”, “arka planı siyah yap” ya da “farklı bir varyasyon” diyebilirsin.</div>`;
      } else {
        msgs.innerHTML = p.chat.map((m) => `<div class="msg ${m.role}">${m.img ? `<img class="msg-img" src="${esc(m.img)}" alt="">` : ''}${esc(m.text)}</div>`).join('');
      }
      msgs.scrollTop = msgs.scrollHeight;
      const imgOn = window.Features.imageReady();
      const sugg = (p.meta || {}).mode === 'redesign' && imgOn
        ? ['Ürün fotoğrafını stüdyo çekimi gibi yenile', 'Farklı bir varyasyon', 'Ürün fotoğrafını mermer zeminde yenile']
        : p.layers.length
        ? ['Farklı bir varyasyon', 'Başlığı büyüt', 'Arka planı lacivert yap', 'Renkleri lüks temaya çevir', 'Görseli kaldır']
        : ['Instagram postu, eğlenceli, “Yaz İndirimi” %40', 'Kurumsal webinar banner’ı, lacivert', 'A4 konser afişi, “Gece Caz”, mor', 'Restoran story’si, “Yeni Menü”'];
      $('#sugg', page).innerHTML = sugg.map((s) => `<button class="chip">${esc(s)}</button>`).join('');
      $$('#sugg .chip', page).forEach((c) => (c.onclick = () => { $('#cIn', page).value = c.textContent; $('#cIn', page).focus(); autoGrow(); }));
    }
    renderMsgs();
    const cIn = $('#cIn', page);
    const autoGrow = () => { cIn.style.height = 'auto'; cIn.style.height = Math.min(140, cIn.scrollHeight) + 'px'; };
    cIn.oninput = autoGrow;
    cIn.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    $('#cSend', page).onclick = send;
    $('#cUseRef', page).onchange = (e) => store.set('useRef', e.target.checked);
    $('#cCount', page).onchange = (e) => store.set('count', +e.target.value);
    if ($('#cBrand', page)) $('#cBrand', page).onchange = (e) => store.set('useBrand', e.target.checked);
    $('.composer .prompt-box', page).insertBefore(window.Features.voiceButton(cIn, autoGrow), $('#cSend', page));

    async function imageIntent(text, refreshInDesign) {
      p.chat.push({ role: 'user', text, t: Date.now() });
      renderMsgs();
      S.busy = true; $('#cSend', page).disabled = true;
      const stopPress = window.Features.pressStart(stage, ['İstek görsel diline çevriliyor', 'Görsel üretiliyor', 'Işık ve detaylar işleniyor', 'Neredeyse hazır — 15-60 sn sürebilir']);
      try {
        if (refreshInDesign) {
          // tasarımdaki en büyük görsel katmanını (ürün fotoğrafı) yapay zekayla yenile
          const imgs = p.layers.filter((l) => l.type === 'image' && l.role !== 'logo' && !/barkod|barcode|logo/i.test(l.name || ''));
          const target = imgs.sort((x, y) => y.w * y.h - x.w * x.h)[0];
          if (!target) throw new Error('Tasarımda yenilenecek bir ürün fotoğrafı bulamadım');
          const base = await window.Features.layerImageData(target);
          const r = await api('image-gen', { body: { prompt: text + ' — ürünün kendisini aynen koru, yalnızca fotoğrafın kalitesini, ışığını ve arka planını profesyonel yap', aspect: window.Features.aspectOf(target.w, target.h), refs: [base] } });
          target.origSrc = target.origSrc || target.src;
          target.src = r.url; delete target.crop; delete target.nw; delete target.nh; target.fit = 'cover';
          await R.ensureImageSizes(p);
          p.chat.push({ role: 'ai', text: 'Ürün fotoğrafını yeniledim. Beğenmezsen editörde görseli seçip “Orijinale dön” diyebilirsin.', img: r.url, t: Date.now() });
          p.versions.forEach((x) => (x.current = false));
          p.versions.push({ design: designOf(p), thumb: await R.thumbnail(p, 200), label: text.slice(0, 40), current: true, t: Date.now() });
          await stopPress();
          renderStage(false); window.Features.printReveal($('#art', stage)); renderVersions();
        } else {
          const editRef = S.reference && /\b(bu|seçili|mevcut|yüklediğim)\b/i.test(text);
          const r = await api('image-gen', { body: { prompt: text, aspect: p.layers.length ? window.Features.aspectOf(p.width, p.height) : '1:1', refs: editRef ? [S.reference] : [] } });
          await stopPress();
          S.uploads = await api('uploads'); await selectRef(r.url);
          p.chat.push({ role: 'ai', text: 'Görsel hazır ve örnek olarak seçildi. Şimdi “bu görselle Instagram postu hazırla” diyebilir ya da tasarıma eklemek için Düzenle’ye geçebilirsin.', img: r.url, t: Date.now() });
        }
        renderMsgs();
        if (p.id || p.layers.length) await saveProject(p);
      } catch (e) {
        await stopPress();
        p.chat.push({ role: 'note', text: 'Görsel üretilemedi: ' + e.message });
        renderMsgs();
      } finally { S.busy = false; stopPress(); $('#cSend', page).disabled = false; }
    }

    async function send(textOverride, extra = {}) {
      let text = (typeof textOverride === 'string' ? textOverride : cIn.value).trim();
      if (!text || S.busy) return;
      cIn.value = ''; autoGrow();
      // --- görsel üretimi niyetleri
      const imgOn = window.Features.imageReady();
      const wantPhotoRefresh = imgOn && p.layers.some((l) => l.type === 'image') && /(ürün\s*)?(fotoğraf|foto|görsel|resim)\w*.*(yenile|güzelleştir|değiştir|profesyonel|stüdyo)/i.test(text) && !/yeniden tasarla|taslak/i.test(text);
      const wantNewImage = imgOn && /(fotoğraf|foto|resim|illüstrasyon|arka\s*plan|görsel)\w*.*\b(üret|oluştur|çiz)/i.test(text);
      if (wantPhotoRefresh || wantNewImage) return imageIntent(text, wantPhotoRefresh);
      const fmt = $('#cFmt', page).value;
      const prompt = fmt && !p.layers.length ? text + ' ' + fmt : text;
      p.chat.push({ role: 'user', text, t: Date.now() });
      renderMsgs();
      const last = msgs.lastElementChild; if (last) M.animate(last, { opacity: [0, 1], y: [10, 0], scale: [.97, 1] });
      S.busy = true;
      const aiOn = ((S.settings || {}).provider || 'local') !== 'local';
      const redesign = aiOn && S.reference && (extra.mode === 'redesign' || /(benzer|çok değiştirme)/i.test(text) || ((p.meta || {}).mode === 'redesign' && /(varyasyon|farklı|başka|alternatif|seçenek|tekrar)/i.test(text)) || /(profesyonel|yeniden tasarla|tekrar tasarla|güzelleştir|modernleştir|yenile|taslak|aynı kals|sadece görsel|bu (tasarım|çalışma|etiket|afiş|görsel|ambalaj)|çalışmayı|etiketi)/i.test(text));
      if (redesign) $('#cUseRef', page).checked = true;
      const stopPress = window.Features.pressStart(stage, redesign ? ['Taslak inceleniyor', 'Yazılar okunuyor', 'Yeni düzen kuruluyor', 'Tipografi ve renkler seçiliyor', 'Logo ve barkod yerleştiriliyor', 'Son rötuşlar — bu biraz sürebilir'] : null);
      $('#cSend', page).disabled = true;
      try {
        const useRef = $('#cUseRef', page).checked;
        const cb = $('#cBrand', page);
        const count = +$('#cCount', page).value;
        let res = await api('generate', { body: {
          prompt, design: p.layers.length ? designOf(p) : null, count, useBrand: cb ? cb.checked : true,
          mode: redesign ? 'redesign' : undefined, fidelity: extra.fidelity,
          refSize: redesign ? await new Promise((res) => { const im = new Image(); im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => res({}); im.src = S.reference; }) : undefined,
          palette: useRef ? S.palette : [], reference: useRef ? S.reference : null,
          referenceData: useRef && S.reference && (S.settings || {}).provider !== 'local' ? (redesign ? await R.withRuler(S.reference) : await R.downscale(S.reference)) : null,
          history: p.chat.slice(-8, -1).map((m) => ({ role: m.role, text: m.text })),
        } });
        if (res.job) {
          // uzun süren işler (yeniden tasarım) arka planda çalışır; sonucu bekle
          const t0 = Date.now();
          for (;;) {
            await new Promise((r) => setTimeout(r, 2500));
            const j = await api('job/' + res.job);
            if (j.status === 'done') { res = j.result; break; }
            if (j.status === 'error') throw new Error(j.error);
            if (Date.now() - t0 > 15 * 60 * 1000) throw new Error('İşlem çok uzun sürdü; tekrar dene');
          }
        }
        const all = (res.designs || [res.design]).map((x) => R.normalize(x));
        // istekle eşleşen hazır şablonu da seçeneklere kat (yazılar istekten doldurulur)
        try {
          const d0 = all[0];
          const isNew = !(d0.meta && d0.meta.mode === 'redesign') && (!p.layers.length || /yeni|hazırla|oluştur|tasarla|yap\b/i.test(text));
          if (isNew && window.Library) {
            const tx = (d0.meta && d0.meta.texts) || {};
            const q = text.toLocaleLowerCase('tr-TR');
            const ar = d0.width / d0.height;
            const cands = window.Library.templates
              .map((t) => ({ t, score: t.tags.split(' ').filter((w) => w.length > 2 && q.includes(w)).length + (t.name.toLocaleLowerCase('tr-TR').split(' ').some((w) => w.length > 3 && q.includes(w)) ? 1 : 0) }))
              .filter((c) => c.score > 0 && Math.abs(Math.log((c.t.w / c.t.h) / ar)) < 0.12)
              .sort((a, b) => b.score - a.score).slice(0, 1);
            for (const c of cands) {
              const pi = Math.floor(Math.random() * c.t.palettes.length);
              const td = R.normalize(window.Library.instantiate(c.t, pi));
              const set = (names, v) => { if (!v) return; const l = td.layers.find((x) => x.type === 'text' && names.includes(x.name)); if (l) { l.text = String(v); R.layoutText(l); } };
              set(['Başlık', 'Ürün adı', 'Restoran adı', 'İsimler', 'Alıntı'], tx.title);
              set(['Alt başlık', 'Açıklama', 'Alt yazı'], tx.subtitle);
              set(['Buton yazısı', 'Kayıt'], tx.cta);
              set(['Etiket', 'Üst yazı', 'Rozet yazısı', 'Kategori'], tx.badge);
              const pct = text.match(/%\s?(\d{1,2})|(\d{1,2})\s?%/); if (pct) set(['Büyük oran'], '%' + (pct[1] || pct[2]));
              const price = text.match(/(\d+[.,]?\d*)\s?(tl|₺)/i); if (price) set(['Fiyat'], '₺' + price[1]);
              td.meta = Object.assign({}, td.meta, { texts: tx, fromTemplate: c.t.id });
              all.splice(Math.min(1, all.length), 0, td);
              res.reply = (res.reply || 'Seçenekler hazır.') + ` Ayrıca “${c.t.name}” hazır şablonundan bir seçenek ekledim.`;
            }
          }
        } catch (e) { console.warn(e); }
        for (const x of all) await R.ensureImageSizes(x);
        const polishNotes = [];
        for (const x of all) polishNotes.push(...(await window.Features.polishRedesign(x)));
        const fixesAll = []; for (const x of all) fixesAll.push(await window.Tools.autoFixAsync(x));
        await stopPress();
        let pick = 0;
        if (all.length > 1) {
          p.chat.push({ role: 'ai', text: res.reply || 'Seçenekler hazır.', t: Date.now() });
          renderMsgs();
          if (innerWidth < 820) setM('stage');
          for (let i = 0; i < all.length; i++) { const tmp = Object.assign({}, all[i]); p.versions.push({ design: R.clean(tmp), thumb: await R.thumbnail(tmp, 200), label: `${text.slice(0, 30)} · seçenek ${i + 1}`, current: false, t: Date.now() }); }
          pick = await window.Features.pickOption(stage, all);
          p.versions.forEach((x) => (x.current = false));
          const vv = p.versions[p.versions.length - all.length + pick]; if (vv) vv.current = true;
        }
        const d = all[pick];
        const fixes = fixesAll[pick];
        if (!p.layers.length || /yeni|hazırla|oluştur|tasarla/i.test(text)) {
          const t = d.meta && d.meta.texts && d.meta.texts.title;
          if (!p.id || p.name === 'Adsız tasarım') p.name = (t || text).slice(0, 48);
        }
        p.width = d.width; p.height = d.height; p.background = d.background; p.layers = d.layers;
        p.meta = Object.assign({}, d.meta || {}, { reference: S.reference });
        if (all.length === 1) {
          p.chat.push({ role: 'ai', text: res.reply || 'Hazır.', t: Date.now() });
          const thumb = await R.thumbnail(p, 200);
          p.versions.forEach((x) => (x.current = false));
          p.versions.push({ design: designOf(p), thumb, label: text.slice(0, 40), current: true, t: Date.now() });
        } else p.chat.push({ role: 'ai', text: `Seçenek ${pick + 1} uygulandı. Diğerleri aşağıdaki sürümlerde duruyor.`, t: Date.now() });
        const allFix = [...new Set(polishNotes)].concat(fixes);
        if (allFix.length) p.chat.push({ role: 'note', text: 'Otomatik düzeltmeler: ' + allFix.join('; ') + '.' });
        if (res.note) p.chat.push({ role: 'note', text: res.note });
        while (p.versions.length > 30) p.versions.shift();
        $('#pName', page).textContent = p.name;
        renderStage(false); window.Features.printReveal($('#art', stage)); renderMsgs(); renderVersions();
        if (innerWidth < 820) setM('stage');
        await saveProject(p);
      } catch (e) {
        p.chat.push({ role: 'note', text: 'İstek tamamlanamadı: ' + e.message });
        renderMsgs();
      } finally {
        S.busy = false; stopPress(); $('#cSend', page).disabled = false;
      }
    }

    $('#sEdit', page).onclick = async () => {
      // Henüz tasarım yoksa ve bir fotoğraf seçiliyse fotoğrafı doğrudan editörde aç
      if (!p.layers.length && S.reference) return window.Features.editImage(S.reference);
      if (!p.layers.length && S.uploads.length) {
        const ok = await confirmBox('Tuval boş', 'Henüz tasarım hazırlanmadı. Son yüklediğin fotoğrafı editörde açayım mı? “Boş tuval” dersen boş sayfa açılır.', 'Fotoğrafı aç');
        if (ok) return window.Features.editImage(S.uploads[0].url);
      }
      if (!p.id) await saveProject(p, { thumb: false });
      go('editor', p.id);
    };
    $('#sPrev', page).onclick = async () => { if (!p.layers.length) return toast('Önce bir tasarım hazırla', true); if (!p.id) await saveProject(p); go('onizleme', p.id); };
    $('#sNew', page).onclick = () => { S.project = newProject(); S.reference = null; S.palette = []; onRoute(); };
    $('#pName', page).onclick = async () => { const n = await promptBox('Tasarımın adı', p.name); if (n) { p.name = n; $('#pName', page).textContent = n; if (p.id || p.layers.length) autosave(100); } };

    page.addEventListener('mounted', () => {
      if (S.pendingPrompt) { const t = S.pendingPrompt; S.pendingPrompt = null; send(t); }
    });
    cleanupOnLeave(page, () => { document.removeEventListener('paste', page._onPaste); stageRO.disconnect(); });
  }
  function cleanupOnLeave(page, fn) {
    const ob = new MutationObserver(() => { if (!page.isConnected) { fn(); ob.disconnect(); } });
    ob.observe($('#view'), { childList: true });
  }

  // ---- Dosya yükleme
  function pickFiles(cb, multiple = true) {
    const fp = $('#filePick');
    fp.multiple = multiple;
    fp.value = '';
    fp.onchange = () => cb(fp.files);
    fp.click();
  }
  async function uploadFile(f) {
    if (f.size > 40 * 1024 * 1024) throw new Error('Dosya 40 MB’dan büyük');
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(f); });
    return api('upload', { body: { data, name: f.name } });
  }
  window.App.pickFiles = pickFiles;
  window.App.uploadFile = uploadFile;

  // ================= EDİTÖR =================
  async function viewEditor(page, id) {
    await ensureProject(id);
    if (!S.project) {
      page.innerHTML = `<div class="dash"><div class="panel empty"><b>Açık bir tasarım yok</b>Panodan bir ölçü seç ya da stüdyoda bir tasarım hazırla.<br><br><button class="btn primary" onclick="go('pano')">Panoya git</button></div></div>`;
      return;
    }
    if (!S.project.id) await saveProject(S.project, { thumb: false });
    if (id !== S.project.id) history.replaceState(null, '', '#/editor/' + S.project.id);
    page.style.overflow = 'hidden';
    page.addEventListener('mounted', () => {
      S.editorApi = window.Editor.mount(page, S.project, {
        onChange: () => autosave(1200),
        onSave: () => saveProject(S.project, { quiet: false }).then(() => window.Features.splashFrom(document.querySelector('[data-a=save]'))),
        onSaveQuiet: () => saveProject(S.project),
        onPreview: async () => { await saveProject(S.project); go('onizleme', S.project.id); },
        onStudio: async () => { await saveProject(S.project); go('studyo', S.project.id); },
      });
      if (window.P5) window.P5.mountPages(page, S.project);
      if (window.Fonts) window.Fonts.prepareDoc(S.project);
    }, { once: true });
  }

  // ================= ÖNİZLEME =================
  async function viewPreview(page, id) {
    await ensureProject(id);
    const p = S.project;
    if (!p || !p.layers.length) {
      page.innerHTML = `<div class="dash"><div class="panel empty"><b>Önizlenecek tasarım yok</b>Stüdyoda bir tasarım hazırla ya da panodan bir projeyi aç.<br><br><button class="btn primary" onclick="go('studyo')">Stüdyoya git</button></div></div>`;
      return;
    }
    const mode = store.get('pvMode', 'flat');
    const light = store.get('pvLight', false);
    page.innerHTML = `<div class="preview">
      <div class="pv-bar">
        <h2>${esc(p.name)} <span class="muted" style="font-weight:400;font-size:13px">${p.width} × ${p.height}</span></h2>
        <div class="seg" id="pvMode">
          <button data-m="flat">${icon('ratio')}Düz</button><button data-m="phone">${icon('phone')}Telefon</button>
          <button data-m="monitor">${icon('monitor')}Ekran</button><button data-m="print">${icon('file')}Baskı</button>
        </div>
        <button class="btn sm icon" id="pvLight" title="Zemin rengini değiştir">${icon('palette')}</button>
        <button class="btn sm ghost" id="pvAdapt" title="Diğer formatlara uyarla">${icon('copy')}<span class="hide-m">Formatlar</span></button>
        <button class="btn sm ghost" id="pvShare" title="Paylaş">${icon('send')}<span class="hide-m">Paylaş</span></button>
        <button class="btn sm" id="pvEdit">${icon('pen')}<span>Düzenle</span></button>
        <button class="btn sm primary" id="pvDl">${icon('download')}<span>İndir</span></button>
      </div>
      <div class="pv-stage ${light ? 'light' : ''}" id="pvStage"></div>
      ${p.meta && p.meta.review && p.meta.review.status !== 'draft' ? `<div class="pv-review" id="pvRev"><span class="rv-pill" data-s="${p.meta.review.status}">${{ review: 'Onay bekliyor', approved: 'Onaylandı', changes: 'Düzeltme istendi' }[p.meta.review.status] || ''}</span><input class="inp" id="pvRevT" placeholder="Yorumun (isteğe bağlı)…"><button class="btn sm" id="pvRevNo">Düzeltme iste</button><button class="btn sm primary" id="pvRevOk">${icon('check')}Onayla</button></div>` : ''}
      ${p.versions && p.versions.length > 1 ? `<div class="versions" id="pvVers"><span class="muted" style="font-size:12px;flex:none">Karşılaştır</span>${p.versions.map((v, i) => `<button data-i="${i}" class="${v.current ? 'on' : ''}">${v.thumb ? `<img src="${v.thumb}" alt="">` : i + 1}</button>`).join('')}</div>` : ''}
    </div>`;
    let cur = p;
    const st = $('#pvStage', page);
    function draw(m, anim) {
      store.set('pvMode', m);
      $$('#pvMode button', page).forEach((b) => b.classList.toggle('on', b.dataset.m === m));
      const W = st.clientWidth - 80, H = st.clientHeight - 80;
      const svg = R.renderSVG(cur, { fit: true });
      let html = '';
      if (m === 'phone') {
        const sw = Math.min(330, W - 30, (H - 140) * 0.5);
        const ih = sw * cur.height / cur.width;
        html = `<div class="device-phone"><div class="notch"></div><div class="screen" style="width:${sw}px"><div class="feed"><div class="feed-head"><i></i>markan</div><div style="height:${Math.min(ih, sw * 1.78)}px;overflow:hidden">${svg.replace('height="100%"', `height="${ih}"`)}</div><div class="feed-foot"><b>markan</b> Yeni paylaşım ✨</div></div></div></div>`;
      } else if (m === 'monitor') {
        const mw = Math.min(W, 980), ah = Math.min(mw * .5, (mw - 120) * cur.height / cur.width);
        const aw = ah * cur.width / cur.height;
        html = `<div class="device-monitor"><div class="bezel"><div class="site" style="width:${mw}px"><div class="nav"><i style="width:60px;background:#111"></i><i style="width:40px"></i><i style="width:40px"></i><i style="width:40px"></i></div><div style="padding:28px;display:grid;place-items:center"><div style="width:${aw}px;height:${ah}px;box-shadow:0 8px 30px rgba(0,0,0,.15)">${svg}</div></div><div style="padding:0 28px 28px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${'<i style="height:60px;background:#e5e7eb;border-radius:8px;display:block"></i>'.repeat(3)}</div></div></div><div class="stand"></div></div>`;
      } else {
        const sc = Math.min(W / cur.width, H / cur.height, 1);
        html = `<div class="artboard ${m === 'print' ? 'paper-sheet' : ''}" style="width:${cur.width * sc}px;height:${cur.height * sc}px">${m === 'print' ? '<span class="reg"></span><span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>' : ''}<span class="dims">${cur.width} × ${cur.height} px${m === 'print' ? ` · 150 dpi'de ${(cur.width / 150 * 2.54).toFixed(1)} × ${(cur.height / 150 * 2.54).toFixed(1)} cm` : ''}</span>${svg}</div>`;
      }
      st.innerHTML = html;
      if (anim) M.animate(st.firstElementChild, { opacity: [0, 1], scale: [.96, 1] }, { stiffness: 300, damping: 26 });
    }
    $$('#pvMode button', page).forEach((b) => (b.onclick = () => draw(b.dataset.m, true)));
    $('#pvLight', page).onclick = () => { const l = !st.classList.contains('light'); st.classList.toggle('light', l); store.set('pvLight', l); };
    $('#pvEdit', page).onclick = () => go('editor', p.id);
    $('#pvDl', page).onclick = () => exportDialog(Object.assign(cur, { name: p.name }));
    $('#pvAdapt', page).onclick = () => window.Features.adaptDialog(p);
    $('#pvShare', page).onclick = (e) => window.Features.share(Object.assign(cur, { name: p.name }), e.currentTarget);
    const rv = $('#pvRev', page);
    if (rv) {
      const act = async (status) => {
        const t = $('#pvRevT', page).value.trim(), r = p.meta.review;
        r.status = status; if (t) r.comments.push({ id: R.uid(), x: p.width / 2, y: p.height / 2, text: t, author: 'Onaylayan', at: Date.now(), done: false });
        await saveProject(p); toast(status === 'approved' ? 'Tasarım onaylandı — teşekkürler!' : 'Düzeltme isteğin iletildi'); onRoute();
      };
      $('#pvRevOk', page).onclick = () => act('approved'); $('#pvRevNo', page).onclick = () => act('changes');
    }
    $$('#pvVers button', page).forEach((b) => (b.onclick = () => {
      $$('#pvVers button', page).forEach((x) => x.classList.remove('on')); b.classList.add('on');
      cur = R.normalize(JSON.parse(JSON.stringify(p.versions[+b.dataset.i].design))); cur.name = p.name;
      draw(store.get('pvMode', 'flat'), true);
    }));
    const onR = () => draw(store.get('pvMode', 'flat'));
    window.addEventListener('resize', onR);
    cleanupOnLeave(page, () => window.removeEventListener('resize', onR));
    page.addEventListener('mounted', () => draw(mode, true), { once: true });
  }

  async function exportDialog(d) { return window.Features.exportDialog(d); }
  window.App.exportDialog = exportDialog;

  // ================= AYARLAR =================
  async function viewSettings(page) {
    const s = await api('settings');
    S.settings = s;
    const provs = [
      ['local', 'Yerel motor', 'İnternet ve anahtar gerekmez. Hazır düzenler ve renk temalarıyla çalışır; basit düzeltme komutlarını anlar.'],
      ['anthropic', 'Claude (Anthropic)', 'En iyi sonuç. Serbest metni anlar, yüklenen görseli de inceler. API anahtarı gerekir.'],
      ['ollama', 'Ollama (bilgisayarında)', 'Ücretsiz, tamamen yerel model. Ollama kurulu ve çalışıyor olmalı.'],
      ['openai', 'OpenAI uyumlu', 'OpenAI, LM Studio, OpenRouter ya da uyumlu herhangi bir sunucu.'],
    ];
    page.innerHTML = `<div class="settings">
      <h1 class="h-display">Ayarlar</h1>
      <p class="muted">Tasarımları hangi motorun hazırlayacağını ve telefondan erişimi buradan yönet.</p>
      ${window.Users ? window.Users.settingsCard() : ''}
      <section class="card set-users" id="setLook"><h3>Görünüm</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Basit mod telefonda yalnız temel işleri gösterir: şablon seç, fotoğraf koy, yazıyı değiştir, paylaş. Açık tema gündüz ve güneş altında daha rahat okunur.</p>
        <div class="seg" id="lkTheme"><button data-th="dark">Koyu</button><button data-th="light">Açık</button><button data-th="auto">Telefona göre</button></div>
        <label class="chk" style="margin-top:12px;display:flex;gap:8px;align-items:center"><input type="checkbox" id="lkBasit"> Basit mod (telefonda)</label>
        <label class="chk" style="margin-top:8px;display:flex;gap:8px;align-items:center"><input type="checkbox" id="lkWeek"> Her pazartesi haftanın paketini hazırla (Cuma, mübarek gün, hadis)</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm" id="lkSync">${icon('copy')}Telefon ↔ bilgisayar eşitle</button><button class="btn sm" id="lkDon">${icon('list')}Bağışçı defteri</button><button class="btn sm" id="lkHist">${icon('calendar')}Paylaşım geçmişi</button></div></section>
      <section class="card set-users"><h3>Geri dönüşüm kutusu ve hatırlatmalar</h3><p class="muted" style="font-size:13px;margin:0 0 10px">Silinen projeler 30 gün geri dönüşüm kutusunda bekler. Otomatik hazırlıklar açıksa cuma ve mübarek gün tasarımların kendiliğinden hazırlanır; bildirim izni verirsen haber gelir. (Yedekleme aşağıda.)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="p9Tr">${icon('trash')}Geri dönüşüm kutusu</button><button class="btn sm adm" id="p9Au">${icon('calendar')}Otomatik hazırlıklar</button><button class="btn sm" id="p9No">Bildirimlere izin ver</button></div></section>
      <div class="panel card-sec ai-card ${s.provider !== 'local' ? 'on' : ''}" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span class="ai-orb"><i></i><i></i><i></i></span>
        <div style="flex:1;min-width:200px"><h3>${s.provider !== 'local' ? 'Yapay zeka bağlı' : 'Yapay zeka bağlı değil'}</h3><p style="margin:0">${s.provider === 'anthropic' ? 'Claude · anahtar ' + esc(s.anthropic_key) : s.provider === 'openai' ? 'OpenAI uyumlu · ' + esc(s.openai_url) : s.provider === 'ollama' ? 'Ollama · ' + esc(s.ollama_model) : 'API anahtarını girerek serbest istekleri ve görsel yorumlamayı aç.'}</p></div>
        <button class="btn ${s.provider === 'local' ? 'primary' : ''}" id="aiConn">${icon('sparkle')}${s.provider === 'local' ? 'API anahtarını bağla' : 'Bağlantıyı yönet'}</button>
      </div>
      <div class="panel card-sec ai-card ${s.img_provider && s.img_provider !== 'none' ? 'on' : ''}" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span class="ai-orb img"><i></i><i></i><i></i></span>
        <div style="flex:1;min-width:200px"><h3>Görsel üretimi ${s.img_provider && s.img_provider !== 'none' ? 'bağlı' : 'bağlı değil'}</h3><p style="margin:0">${s.img_provider === 'openai' ? 'OpenAI · ' + esc(s.img_openai_model) : s.img_provider === 'gemini' ? 'Google Gemini · ' + esc(s.img_gemini_model) : 'Yeni ürün fotoğrafı, arka plan ve illüstrasyon üretmek için OpenAI ya da Gemini anahtarı bağla.'}</p></div>
        <button class="btn ${s.img_provider && s.img_provider !== 'none' ? '' : 'primary'}" id="imgConn">${icon('image')}${s.img_provider && s.img_provider !== 'none' ? 'Bağlantıyı yönet' : 'Görsel üretimini bağla'}</button>
      </div>
      <div class="panel card-sec" id="sysCard"><h3>Sistem durumu</h3><p>Uygulamanın çalışması için gerekenler kontrol ediliyor…</p></div>
      <div class="panel card-sec"><h3>Yapay zeka çalışma şekli</h3><p>Akıllı şablon modunda model brifi ve metinleri belirler, yerleşimi sistem yapar; daha tutarlı ve hızlıdır.</p>
        <div class="seg" id="aiMode"><button data-m="smart" class="${s.ai_mode !== 'free' ? 'on' : ''}">Akıllı şablon (önerilen)</button><button data-m="free" class="${s.ai_mode === 'free' ? 'on' : ''}">Serbest tasarım</button></div></div>
      <div class="prov-grid">${provs.map(([k, t, d]) => `<button class="prov ${s.provider === k ? 'on' : ''}" data-p="${k}"><span class="dot"></span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>
      <div class="panel card-sec" id="provForm"></div>
      <div class="panel card-sec">
        <h3>Telefon erişimi</h3>
        <p>Telefon ve bilgisayar aynı Wi‑Fi ağında olmalı. Adresi telefonun tarayıcısına yaz; sonra tarayıcı menüsünden “Ana ekrana ekle” diyerek uygulama gibi kullanabilirsin.</p>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">${S.lanUrls.map((u) => `<span class="url h-display" style="color:var(--cyan);font-size:18px">${esc(u)}</span>`).join('') || '<span class="muted">Ağ adresi bulunamadı. Bilgisayarın bir ağa bağlı olduğundan emin ol.</span>'}</div>
        ${R.native() ? `<button class="btn" id="natSrv" style="margin-bottom:14px">${icon('phone')}Başka bilgisayara bağlan</button>` : `<button class="btn" id="phoneFull" style="margin-bottom:14px">${icon('lockS')}Telefonda tüm özellikler (güvenli bağlantı)</button>`}
        <div class="form-grid"><label class="field"><span>Erişim PIN'i (isteğe bağlı)</span><input class="inp" id="pin" type="password" placeholder="Boş bırakırsan PIN sorulmaz" value="${esc(s.pin)}" autocomplete="new-password"></label></div>
        <p class="muted" style="font-size:12.5px;margin:10px 0 0">Aynı ağdaki başkalarının stüdyona girmesini istemiyorsan bir PIN belirle.</p>
      </div>
      <div id="p5Set"></div>
      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end">
        <button class="btn" id="tst">${icon('refresh')}Bağlantıyı test et</button>
        <button class="btn primary" id="sv">${icon('save')}Ayarları kaydet</button>
      </div>
    </div>`;
    let prov = s.provider;
    if (window.P5) window.P5.settingsExtras($('#p5Set', page), s);
    if (window.Guncelle) window.Guncelle.settingsCard(page);
    api('system').then((y) => {
      const ok = (b) => `<span class="sys-ok ${b ? 'y' : 'n'}">${icon(b ? 'check' : 'x')}</span>`;
      const fonts = typeof FontFace !== 'undefined', canv = !!document.createElement('canvas').getContext;
      const ua = navigator.userAgent; const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Tarayıcı';
      $('#sysCard', page).innerHTML = `<h3>Sistem durumu <span class="muted" style="font-weight:400;font-size:13px">sürüm ${esc(y.version)}</span></h3><p>Ek bir program gerekmez: yalnızca Python ve güncel bir tarayıcı yeterli.</p>
        <div class="sys-list">
          <div>${ok(y.python_ok)}<b>Python ${esc(y.python)}</b><span>${y.python_ok ? 'uygun' : '3.9 veya üstü gerekli'}</span></div>
          <div>${ok(y.data_writable)}<b>Kayıt klasörü</b><span>${y.data_writable ? 'yazılabilir' : 'yazılamıyor — klasörü Belgeler gibi bir yere taşı'}</span></div>
          <div>${ok(fonts && canv)}<b>${br}</b><span>${fonts && canv ? 'tüm özellikler destekleniyor' : 'güncel Chrome ya da Edge kullan'}</span></div>
          <div>${ok(y.provider !== 'local' && y.has_key)}<b>Yapay zeka</b><span>${y.provider !== 'local' && y.has_key ? 'bağlı (' + esc(y.provider) + ')' : 'bağlı değil — “Yazıları bul” ve serbest istekler için gerekli; diğer her şey çalışır'}</span></div>
        </div><p class="muted" style="font-size:12px;margin:10px 0 0">${esc(y.os)} · ${y.projects} tasarım · ${y.uploads} görsel · ${y.fonts} font</p>`;
    }).catch(() => {});
    if (window.Users) window.Users.bindSettings(page);
    if (window.P11) window.P11.bindSettings(page);
    if (window.P9) { const P9 = window.P9; [['p9Tr', P9.trash], ['p9Au', P9.autoDialog], ['p9No', P9.askNotify]].forEach(([id, fn]) => { const b = $('#' + id, page); if (b) b.onclick = () => fn(); }); }
    $('#aiConn', page).onclick = () => window.Features.connectAI();
    $('#imgConn', page).onclick = async () => { await window.Features.connectImageAI(); onRoute(); };
    $$('#aiMode button', page).forEach((b) => (b.onclick = async () => { await api('settings', { body: { ai_mode: b.dataset.m } }); $$('#aiMode button', page).forEach((x) => x.classList.toggle('on', x === b)); toast(b.dataset.m === 'smart' ? 'Akıllı şablon modu açık' : 'Serbest tasarım modu açık'); }));
    const form = $('#provForm', page);
    function drawForm() {
      const f = {
        local: `<h3>Yerel motor</h3><p>Hiçbir ayar gerekmiyor. Örnek komutlar: “lüks bir A4 flyer, başlık: Gala Gecesi”, “arka planı lacivert yap”, “farklı bir varyasyon”.</p>`,
        anthropic: `<h3>Claude</h3><p>Anahtarı console.anthropic.com adresinden al. Anahtar yalnızca bu bilgisayarda, data/settings.json dosyasında saklanır.</p>
          <div class="form-grid"><label class="field"><span>API anahtarı</span><input class="inp" id="ak" type="password" value="${esc(s.anthropic_key)}" placeholder="sk-ant-…" autocomplete="off"></label>
          <label class="field"><span>Model</span><input class="inp" id="am" value="${esc(s.anthropic_model)}"></label></div>`,
        ollama: `<h3>Ollama</h3><p>Önce bilgisayarına Ollama kur ve bir model indir (örn. <span class="kbd">ollama pull llama3.1</span>). Görsel incelemesi için llava gibi bir görsel modeli seç.</p>
          <div class="form-grid"><label class="field"><span>Adres</span><input class="inp" id="ou" value="${esc(s.ollama_url)}"></label>
          <label class="field"><span>Model</span><input class="inp" id="om" value="${esc(s.ollama_model)}"></label></div>`,
        openai: `<h3>OpenAI uyumlu sunucu</h3><p>LM Studio için adres genelde http://localhost:1234/v1 olur ve anahtar gerekmez.</p>
          <div class="form-grid"><label class="field"><span>Adres</span><input class="inp" id="xu" value="${esc(s.openai_url)}"></label>
          <label class="field"><span>Model</span><input class="inp" id="xm" value="${esc(s.openai_model)}"></label>
          <label class="field"><span>API anahtarı</span><input class="inp" id="xk" type="password" value="${esc(s.openai_key)}" autocomplete="off"></label></div>`,
      }[prov];
      form.innerHTML = f;
    }
    drawForm();
    $$('.prov', page).forEach((b) => (b.onclick = () => { prov = b.dataset.p; $$('.prov', page).forEach((x) => x.classList.toggle('on', x === b)); drawForm(); M.animate(form, { opacity: [0, 1], y: [6, 0] }); }));
    const collect = () => {
      const v = (i) => { const e = $('#' + i, page); return e ? e.value.trim() : undefined; };
      const b = { provider: prov, pin: v('pin') };
      if (prov === 'anthropic') Object.assign(b, { anthropic_key: v('ak'), anthropic_model: v('am') });
      if (prov === 'ollama') Object.assign(b, { ollama_url: v('ou'), ollama_model: v('om') });
      if (prov === 'openai') Object.assign(b, { openai_url: v('xu'), openai_model: v('xm'), openai_key: v('xk') });
      return b;
    };
    const saveS = async () => {
      const b = collect();
      await api('settings', { body: b });
      if (b.pin && !b.pin.includes('•')) { S.pin = b.pin; store.set('pin', b.pin); }
      if (b.pin === '') { S.pin = ''; store.set('pin', ''); }
      S.settings = await api('settings'); updateDot();
    };
    $('#sv', page).onclick = async () => { try { await saveS(); toast('Ayarlar kaydedildi'); } catch (e) { toast(e.message, true); } };
    const pf = $('#phoneFull', page); if (pf) pf.onclick = () => window.Features.phoneDialog(true);
    const ns = $('#natSrv', page); if (ns) ns.onclick = () => window.webkit.messageHandlers.tsNative.postMessage({ cmd: 'changeServer' });
    $('#tst', page).onclick = async (e) => {
      const b = e.currentTarget; b.disabled = true; b.lastChild.textContent = 'Test ediliyor…';
      try { await saveS(); const r = await api('test-ai', { body: {} }); toast(r.message); }
      catch (err) { toast(err.message, true); }
      finally { b.disabled = false; b.lastChild.textContent = 'Bağlantıyı test et'; }
    };
  }
  function updateDot() {
    const d = $('#aiDot');
    const on = S.settings && S.settings.provider !== 'local';
    d.classList.toggle('on', true);
    d.title = on ? 'Yapay zeka: ' + S.settings.provider : 'Yerel motor aktif';
  }

  // ================= KOMUT PALETİ (Ctrl+K) =================
  async function commandPalette() {
    let list = [];
    try { list = await api('projects'); } catch (e) {}
    const base = [
      { g: 'Git', t: 'Pano', i: 'home', a: () => go('pano') },
      { g: 'Git', t: 'Stüdyo', i: 'sparkle', a: () => go('studyo', S.project && S.project.id) },
      { g: 'Git', t: 'Editör', i: 'pen', a: () => go('editor', S.project && S.project.id) },
      { g: 'Git', t: 'Önizleme', i: 'eye', a: () => go('onizleme', S.project && S.project.id) },
      { g: 'Git', t: 'Ayarlar', i: 'gear', a: () => go('ayarlar') },
      { g: 'Oluştur', t: 'Yeni tasarım (sohbetle)', i: 'plus', a: () => { S.project = newProject(); go('studyo'); } },
      ...FORMATS.map((f) => ({ g: 'Oluştur', t: `Boş tuval: ${f.name}`, s: `${f.w}×${f.h}`, i: 'ratio', a: async () => { S.project = newProject(f.w, f.h, f.name); await saveProject(S.project, { thumb: false }); go('editor', S.project.id); } })),
      ...list.map((p) => ({ g: 'Tasarımlar', t: p.name || 'Adsız', s: `${p.width}×${p.height}`, i: 'image', a: () => go('editor', p.id) })),
    ];
    await dialog(`<div class="cmdk"><input id="ck" placeholder="Komut ya da tasarım ara…" autocomplete="off"><div class="list" id="ckl"></div></div>`, {
      cls: 'cmdk-d',
      onOpen: (box, close) => {
        const inp = $('#ck', box), ul = $('#ckl', box);
        let items = base, idx = 0;
        const draw = () => {
          const q = inp.value.toLocaleLowerCase('tr-TR');
          items = base.filter((x) => !q || (x.t + ' ' + x.g).toLocaleLowerCase('tr-TR').includes(q));
          idx = Math.min(idx, Math.max(0, items.length - 1));
          let g = '';
          ul.innerHTML = items.map((x, i) => (x.g !== g ? `<div class="grp">${(g = x.g)}</div>` : '') + `<div class="it ${i === idx ? 'on' : ''}" data-i="${i}">${icon(x.i)}<span>${esc(x.t)}</span>${x.s ? `<small>${esc(x.s)}</small>` : ''}</div>`).join('') || '<div class="empty">Sonuç yok</div>';
          $$('.it', ul).forEach((el) => (el.onclick = () => { close(); items[+el.dataset.i].a(); }));
          const on = $('.it.on', ul); on && on.scrollIntoView({ block: 'nearest' });
        };
        inp.oninput = () => { idx = 0; draw(); };
        inp.onkeydown = (e) => {
          if (e.key === 'ArrowDown') { idx = Math.min(items.length - 1, idx + 1); draw(); e.preventDefault(); }
          if (e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); draw(); e.preventDefault(); }
          if (e.key === 'Enter' && items[idx]) { close(); items[idx].a(); }
        };
        draw(); inp.focus();
      },
    });
  }
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!$('.overlay')) commandPalette(); }
  });
  window.App.commandPalette = commandPalette;

  // ---------- Başlat
  (async function boot() {
    try {
      const ping = window.TS_CLOUD ? await api('ping') : await fetch('/api/ping').then((r) => r.json());
      if (ping.pin && !S.pin) await askPin();
      if (window.Users && !(await window.Users.init())) return;
      S.settings = await api('settings');
      const info = await api('info'); S.lanUrls = info.urls; S.httpsUrls = info.https_urls || [];
      S.brand = await api('brand').catch(() => null);
      setTimeout(() => { try { const n = window.Features.scheduleReminders(); if (n) toast(`Bugün ${n} planlı paylaşımın var — Pano → Bu hafta`); } catch (e) {} }, 1500);
      api('fonts').then((f) => R.loadFonts(f)).catch(() => {});
      if (window.Fonts) window.Fonts.init();
    } catch (e) { toast('Sunucuya bağlanılamadı: ' + e.message, true); }
    updateDot();
    if (!location.hash) history.replaceState(null, '', '#/pano');
    // iOS: sayfanın kendisinin iki parmakla büyümesini engelle (editör kendi yakınlaştırmasını yapar)
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => { if (e.target.closest && e.target.closest('#vp')) e.preventDefault(); }, { passive: false });
    if (R.isIOS()) document.documentElement.classList.add('ios');
    const hb = document.getElementById('helpBtn'); if (hb) hb.onclick = () => window.Tour.menu();
    if (R.native()) document.documentElement.classList.add('native-app');
    // ana ekran uygulaması için çevrimdışı kabuk (yalnızca güvenli bağlantıda / localhost'ta çalışır)
    if ('serviceWorker' in navigator && window.isSecureContext && !R.native() && !window.TS_CLOUD) navigator.serviceWorker.register('/sw.js').catch(() => {});
    onRoute();
  })();
})();
