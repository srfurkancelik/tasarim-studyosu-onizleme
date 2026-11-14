/* Tasarım Stüdyosu v5.1 — ikon kitaplığı, arka plan üretici, tablo/grafik, marka kiti çıkarma, katalog,
   şablon paketi, çok sayfalı belge, kutu kesim şablonu, 3B önizleme, etiket tabakası, müşteri portalı,
   özel günler, yedekleme, ana ekrana ekleme. */
(function () {
  'use strict';
  const A = () => window.App, R = window.Render, T = window.Tools;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const icon = (...a) => window.icon(...a);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const E = () => A().S.editorApi;
  const UI = () => window.UI;
  const P5 = {};
  const toast = (m, bad) => A().toast(m, bad);
  const brand = () => A().S.brand || {};
  const bcol = (i, d) => ((brand().colors || [])[i] || d);
  const pickFile = (accept, multiple = false) => new Promise((res) => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = multiple; i.onchange = () => res(multiple ? [...i.files] : i.files[0] || null); i.click(); });
  const readURL = (f) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(f); });
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('Görsel yüklenemedi')); im.src = src; });
  const upload = async (data, name) => { try { return (await A().api('upload', { body: { data, name } })).url; } catch (e) { return data; } };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const C = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  const dot = (x, y) => `M${x - 0.1} ${y}h0.2`;

  // =====================================================================
  // 1) İKON VE ÇİZİM KİTAPLIĞI (özgün, telifsiz)
  // =====================================================================
  const IC = [
    // Gıda (en başta: yemek işleri öncelikli)
    ['Gıda', 'Burger', 'M4 10a8 5 0 0 1 16 0z M3 13h18 M4 16h16 M5 16v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1' + dot(9, 7) + dot(13, 6.5) + dot(15, 8)],
    ['Gıda', 'Çorba kasesi', 'M3 11h18a9 7 0 0 1-18 0z M8 21h8 M9 4c-1 1.5 1 2.5 0 4 M13 3c-1 1.5 1 2.5 0 4 M17 4c-1 1.5 1 2.5 0 4'],
    ['Gıda', 'Çay bardağı', 'M7 4h10 M8 4c0 3 1.5 4 1.5 6S8 14 8 17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2c0-3-1.5-5-1.5-7S16 7 16 4 M5 21h14 M9.5 10h5'],
    ['Gıda', 'Dondurma', 'M8 11l4 10 4-10 M7 11a5 5 0 1 1 10 0z M9 8.5a3 3 0 0 1 3-2.5'],
    ['Gıda', 'Kruvasan', 'M3 15c0-5 4-9 9-9s9 4 9 9c-2 1-4 1-5-1-1 2-6 2-8 0-1 2-3 2-5 1z M9 7l1 6 M15 7l-1 6'],
    ['Gıda', 'Balık', 'M2 12c3-5 9-6 14-3l4-3v12l-4-3c-5 3-11 2-14-3z' + dot(7, 11)],
    ['Gıda', 'Tavuk but', 'M14 4a6 6 0 0 1 3 10l-4 1-3 3a2 2 0 1 1-3-1 2 2 0 1 1-1-3l3-3 1-4a6 6 0 0 1 4-3z'],
    ['Gıda', 'Ekmek', 'M5 20V11a4 4 0 0 1-1-7h16a4 4 0 0 1-1 7v9z M9 9v3 M15 9v3'],
    ['Gıda', 'Peynir', 'M3 18V11l12-6 6 6v7z M3 11h18' + C(9, 14.5, 1.3) + C(15, 15.5, 1)],
    ['Gıda', 'Yumurta', 'M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z'],
    ['Gıda', 'Limon', 'M4 14a8 6 0 0 1 16-4 M4 14a8 6 0 0 0 16-4 M3 15l1-1 M20 10l1-1'],
    ['Gıda', 'Havuç', 'M15 9L4 20c-1 0-1-1-1-1L14 8z M14 8c1-3 3-4 5-5 M15 9c3-1 4-3 5-5 M14 8l1 1 M11 13l-1-1 M8 16l-1-1'],
    ['Gıda', 'Paket servis', 'M4 8h16l-2 13H6z M8 8V6a4 4 0 0 1 8 0v2 M9 13h6'],
    ['Gıda', 'Kurye', C(6, 17, 3) + C(18, 17, 3) + 'M9 17h6l2-6h-5 M14 6h3l1 5 M3 11h7v3'],
    ['Gıda', 'Sıcak servis', 'M4 15h16 M5 15a7 7 0 0 1 14 0 M12 8V7 M3 18h18 M9 3c-.8 1 .8 2 0 3 M15 3c-.8 1 .8 2 0 3'],
    ['Gıda', 'Vegan', 'M5 19C5 10 10 5 19 5c0 9-5 14-14 14z M5 19l8-8'],
    ['Gıda', 'Acı', 'M12 7c4 0 7 3 6 8-1 4-6 6-10 6 4-3 4-8 4-14z M12 7c0-2 1-3 3-4'],
    ['Gıda', 'Glutensiz', C(12, 12, 9) + 'M12 18V8 M12 10l-2-2 M12 10l2-2 M12 13l-2-2 M12 13l2-2 M5.5 5.5l13 13'],
    // Genel
    ['Genel', 'Ev', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
    ['Genel', 'Ara', C(11, 11, 7) + 'M16 16l5 5'],
    ['Genel', 'Kalp', 'M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z'],
    ['Genel', 'Yıldız', 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.5 6.4 20.4l1.1-6.3L3 9.7l6.2-.9z'],
    ['Genel', 'Onay', C(12, 12, 9) + 'M8 12l3 3 5-6'],
    ['Genel', 'Çarpı', C(12, 12, 9) + 'M9 9l6 6 M15 9l-6 6'],
    ['Genel', 'Bilgi', C(12, 12, 9) + 'M12 11v6' + dot(12, 7.5)],
    ['Genel', 'Saat', C(12, 12, 9) + 'M12 7v5l3 3'],
    ['Genel', 'Takvim', 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4'],
    ['Genel', 'Zil', 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0'],
    ['Genel', 'Hediye', 'M4 9h16v4H4z M5 13h14v8H5z M12 9v12 M12 9c-2-4-6-4-6-1.5S9 9 12 9c3 0 6 0 6-1.5S14 5 12 9'],
    ['Genel', 'Şimşek', 'M13 2L4 14h7l-1 8 9-12h-7z'],
    ['Genel', 'Ödül', C(12, 9, 6) + 'M8.5 13.5L7 21l5-3 5 3-1.5-7.5'],
    ['Genel', 'Kalkan', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4'],
    ['Genel', 'Gülen yüz', C(12, 12, 9) + 'M8 14a5 5 0 0 0 8 0' + dot(9, 9.5) + dot(15, 9.5)],
    ['Genel', 'Beğen', 'M7 11v9H4v-9z M7 11l4-7c2 0 2 2 1.5 4H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7'],
    ['Genel', 'Kişi', C(12, 8, 4) + 'M4 21a8 8 0 0 1 16 0'],
    ['Genel', 'Kişiler', C(9, 8, 3.5) + 'M2 20a7 7 0 0 1 14 0 M16 4.5a3.5 3.5 0 0 1 0 7 M18 13.5a6 6 0 0 1 4 6.5'],
    ['Genel', 'Kamera', 'M3 8h4l2-3h6l2 3h4v12H3z' + C(12, 13.5, 4)],
    ['Genel', 'Video', 'M3 6h12v12H3z M15 10l6-3v10l-6-3z'],
    ['Genel', 'Müzik', 'M9 18V5l11-2v13' + C(6.5, 18, 2.5) + C(17.5, 16, 2.5)],
    ['Genel', 'Oynat', C(12, 12, 9) + 'M10 8l6 4-6 4z'],
    // İletişim
    ['İletişim', 'Telefon', 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
    ['İletişim', 'E-posta', 'M3 5h18v14H3z M3 6l9 7 9-7'],
    ['İletişim', 'Mesaj', 'M4 4h16v12H9l-5 4z'],
    ['İletişim', 'Konum', 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z' + C(12, 9, 2.5)],
    ['İletişim', 'Dünya', C(12, 12, 9) + 'M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18'],
    ['İletişim', 'Wi-Fi', 'M2 9a15 15 0 0 1 20 0 M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0' + dot(12, 19.5)],
    ['İletişim', 'Paylaş', C(18, 5, 2.5) + C(6, 12, 2.5) + C(18, 19, 2.5) + 'M8.2 10.8l7.6-4.6 M8.2 13.2l7.6 4.6'],
    ['İletişim', 'Bağlantı', 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1 M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1'],
    // Ticaret
    ['Ticaret', 'Sepet', 'M3 4h2l2.5 11h11L21 7H6.5' + C(9, 20, 1.3) + C(18, 20, 1.3)],
    ['Ticaret', 'Çanta', 'M5 8h14l-1 13H6z M9 8V6a3 3 0 0 1 6 0v2'],
    ['Ticaret', 'Kargo', 'M2 6h11v10H2z M13 10h4l4 4v2h-8z' + C(6, 18, 2) + C(17, 18, 2)],
    ['Ticaret', 'Kart', 'M3 6h18v12H3z M3 10h18 M6 15h4'],
    ['Ticaret', 'Mağaza', 'M3 9l2-5h14l2 5 M3 9h18v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z M5 12v9h14v-9 M10 21v-5h4v5'],
    ['Ticaret', 'Kutu', 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10'],
    ['Ticaret', 'Etiket', 'M3 12V4h8l10 10-8 8z' + dot(7.5, 7.5)],
    ['Ticaret', 'Yüzde', 'M19 5L5 19' + C(7, 7, 2) + C(17, 17, 2)],
    ['Ticaret', 'Para', C(12, 12, 9) + 'M14.5 9a3 3 0 0 0-5 1c0 3 5 1.5 5 4.5a3 3 0 0 1-5 1 M12 6v2 M12 16v2'],
    ['Ticaret', 'Fiş', 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z M8 8h8 M8 12h8 M8 16h5'],
    ['Ticaret', 'Taç', 'M3 8l4 4 5-6 5 6 4-4-2 11H5z'],
    // Gıda
    ['Gıda', 'Kahve', 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M17 10h2a2 2 0 0 1 0 4h-2 M8 2v3 M12 2v3'],
    ['Gıda', 'Çatal-bıçak', 'M7 3v8 M5 3v5a2 2 0 0 0 4 0V3 M7 11v10 M17 21V3c-2 1-3 4-3 8h3'],
    ['Gıda', 'Aşçı', 'M7 14a4 4 0 0 1-1-7.9A5 5 0 0 1 15 4a4 4 0 0 1 3 8V14z M7 14h11v6H7z'],
    ['Gıda', 'Yaprak', 'M5 19C5 9 12 4 20 4c0 8-5 15-15 15z M5 19l8-8'],
    ['Gıda', 'Başak', 'M12 21V8 M12 8c-2-1-3-3-3-5 2 0 3 2 3 5z M12 8c2-1 3-3 3-5-2 0-3 2-3 5z M12 13c-2-1-3-3-3-5 2 0 3 2 3 5z M12 13c2-1 3-3 3-5-2 0-3 2-3 5z M12 18c-2-1-3-3-3-5 2 0 3 2 3 5z M12 18c2-1 3-3 3-5-2 0-3 2-3 5z'],
    ['Gıda', 'Elma', 'M12 7c-2-2-7-1.5-7 4s3 10 5 10c1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4.5 5-10s-5-6-7-4z M12 7c0-2 1-4 3-4'],
    ['Gıda', 'Kavanoz', 'M8 3h8v3H8z M7 6h10l1 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z M6 11h12 M6 17h12'],
    ['Gıda', 'Pasta', 'M4 21h16 M5 21v-7h14v7 M5 14c2 1.5 4-1 7 0s5 1.5 7 0 M12 10v4 M12 6c-1 1-1 2.5 0 3 1-.5 1-2 0-3z'],
    ['Gıda', 'Biber', 'M14 6c4 0 6 3 4 8s-7 8-12 7c4-2 5-6 5-9 0-4 1-6 3-6z M14 6c0-2 1-3 3-3'],
    ['Gıda', 'Ateş', 'M12 22a7 7 0 0 0 7-7c0-5-4-7-5-11-1 3-3 4-4 6-1-1-2-2-2-4-2 2-3 5-3 9a7 7 0 0 0 7 7z'],
    ['Gıda', 'Pizza', 'M12 21L3 6a14 14 0 0 1 18 0z' + dot(9, 9) + dot(14, 10.5) + dot(11.5, 14.5)],
    ['Gıda', 'Şişe', 'M10 2h4v4l2 3v12H8V9l2-3z M8 13h8'],
    ['Gıda', 'Damla', 'M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z'],
    // Doğa
    ['Doğa', 'Güneş', C(12, 12, 4) + 'M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4'],
    ['Doğa', 'Ay', 'M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z'],
    ['Doğa', 'Bulut', 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z'],
    ['Doğa', 'Çiçek', C(12, 6, 3) + C(12, 18, 3) + C(6, 12, 3) + C(18, 12, 3) + C(12, 12, 2)],
    ['Doğa', 'Ağaç', 'M12 3l6 8h-3l4 6H5l4-6H6z M12 17v4'],
    ['Doğa', 'Dağ', 'M3 20l6-10 4 6 3-4 5 8z'],
    ['Doğa', 'Kar', 'M12 2v20 M4 7l16 10 M20 7L4 17'],
    ['Doğa', 'Dalga', 'M2 9c3-3 5 3 8 0s5 3 8 0 4 0 4 0 M2 15c3-3 5 3 8 0s5 3 8 0 4 0 4 0'],
    // Oklar
    ['Oklar', 'Sağ ok', 'M4 12h16 M14 6l6 6-6 6'],
    ['Oklar', 'Sol ok', 'M20 12H4 M10 6l-6 6 6 6'],
    ['Oklar', 'Yukarı ok', 'M12 20V4 M6 10l6-6 6 6'],
    ['Oklar', 'Aşağı ok', 'M12 4v16 M6 14l6 6 6-6'],
    ['Oklar', 'Kıvrık ok', 'M4 17c3-8 10-10 16-8 M15 5l5 4-4 5'],
    ['Oklar', 'Yenile', 'M20 12a8 8 0 1 1-2.3-5.7 M20 4v4h-4'],
    ['Oklar', 'Çift ok', 'M5 7h14 M15 3l4 4-4 4 M19 17H5 M9 13l-4 4 4 4'],
  ];
  // dolgulu şekiller / süsler (100 birim)
  const scallop = (n, r1, r2) => { let d = ''; for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2); } return d + 'Z'; };
  const SHP = [
    ['Rozet', 'Mühür', scallop(20, 50, 44)],
    ['Rozet', 'Patlama', scallop(14, 50, 36)],
    ['Rozet', 'Pırıltı', 'M50 0C54 38 62 46 100 50 62 54 54 62 50 100 46 62 38 54 0 50 38 46 46 38 50 0Z'],
    ['Rozet', 'Kurdele', 'M0 25h100l-12 25 12 25H0l12-25z'],
    ['Rozet', 'Köşe şerit', 'M0 0h45l55 55v45z'],
    ['Rozet', 'Konuşma balonu', 'M10 10h80a10 10 0 0 1 10 10v45a10 10 0 0 1-10 10H40L20 95V75H10A10 10 0 0 1 0 65V20a10 10 0 0 1 10-10z'],
    ['Rozet', 'Fiyat etiketi', 'M0 20h70l30 30-30 30H0z'],
    ['Rozet', 'Ok bayrak', 'M0 20h75l25 30-25 30H0l15-30z'],
    ['Organik', 'Damla şekil 1', 'M52 4C76 4 98 22 96 48S80 96 52 96 4 80 4 52 28 4 52 4Z'],
    ['Organik', 'Damla şekil 2', 'M60 6c22 6 38 30 32 54S62 98 38 92 2 66 8 42 38 0 60 6Z'],
    ['Organik', 'Bulut şekil', 'M25 80a20 20 0 0 1-3-40 25 25 0 0 1 48-8 18 18 0 0 1 22 26 14 14 0 0 1-7 22z'],
    ['Organik', 'Fırça darbesi', 'M2 40C20 30 40 34 60 30s30-4 38 2c2 8-6 14-20 18s-40 8-60 8S0 52 2 40Z'],
    ['Organik', 'Dalga ayraç', 'M0 60C15 40 35 40 50 60s35 20 50 0v40H0z'],
    ['Organik', 'Kemer', 'M0 100V50a50 50 0 0 1 100 0v50z'],
    ['Organik', 'Yarım daire', 'M0 50a50 50 0 0 1 100 0z'],
    ['Organik', 'Yaprak şekil', 'M50 0C85 20 95 60 50 100 5 60 15 20 50 0Z'],
  ];
  P5.ICONS = IC.map(([g, n, d]) => ({ g, n, d, stroke: true })).concat(SHP.map(([g, n, d]) => ({ g, n, d, stroke: false })));
  const to100 = (d) => window.Importers.absPath(d, new DOMMatrix().scale(100 / 24));
  P5.iconDialog = async function () {
    const ed = E(); if (!ed) return toast('Önce bir tasarım aç', true);
    const groups = [...new Set(P5.ICONS.map((i) => i.g))];
    let color = bcol(0, '#14161B');
    await UI().dialog(`<div class="d-body"><h3>${icon('star')} İkon ve çizim kitaplığı <small class="muted">${P5.ICONS.length} öğe</small></h3>
      <div class="ic-top"><input class="inp" id="icQ" placeholder="Ara: telefon, kahve, ok, rozet…"><label class="color" style="width:auto"><input type="color" id="icC" value="${R.toHex(color)}"><span>Renk</span></label></div>
      <div class="chips" id="icG"><button class="chip on" data-g="">Tümü</button>${groups.map((g) => `<button class="chip" data-g="${g}">${g}</button>`).join('')}</div>
      <div class="ic-grid" id="icL"></div><p class="muted" style="font-size:12px;margin:8px 0 0">Dokun → tasarıma eklenir. Rengini ve kalınlığını sağ panelden değiştirebilirsin.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        let g = '';
        const draw = () => {
          const q = $('#icQ', box).value.toLocaleLowerCase('tr-TR').trim();
          const list = P5.ICONS.map((it, i) => [it, i]).filter(([it]) => (!g || it.g === g) && (!q || (it.n + ' ' + it.g).toLocaleLowerCase('tr-TR').includes(q)));
          $('#icL', box).innerHTML = list.map(([it, i]) => `<button class="ic-it" data-i="${i}" title="${esc(it.n)}"><svg viewBox="${it.stroke ? '-2 -2 28 28' : '-6 -6 112 112'}"><path d="${it.d}" ${it.stroke ? `fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"` : `fill="${color}"`}/></svg><span>${esc(it.n)}</span></button>`).join('') || '<p class="muted">Bulunamadı</p>';
          $$('.ic-it', box).forEach((b) => (b.onclick = () => {
            const it = P5.ICONS[+b.dataset.i], doc = ed.doc, sz = Math.round(Math.min(doc.width, doc.height) * 0.16), c = ed.center();
            const l = { type: 'path', name: it.n, d: it.stroke ? to100(it.d) : it.d, vw: 100, vh: 100, x: c.x - sz / 2, y: c.y - sz / 2, w: sz, h: sz };
            if (it.stroke) Object.assign(l, { fill: 'none', stroke: color, strokeWidth: Math.max(2, Math.round(sz * 0.075)), lineCap: 'round', lineJoin: 'round' }); else l.fill = color;
            ed.insert([l]); b.classList.add('added'); setTimeout(() => b.classList.remove('added'), 600);
          }));
        };
        $('#icQ', box).oninput = draw;
        $('#icC', box).oninput = (e) => { color = e.target.value; draw(); };
        $$('#icG .chip', box).forEach((b) => (b.onclick = () => { g = b.dataset.g; $$('#icG .chip', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
        draw();
      },
    });
  };

  // =====================================================================
  // 2) ARKA PLAN VE DOKU ÜRETİCİ
  // =====================================================================
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const PATTERNS = {
    dots: ['Noktalar', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.14}" fill="${c2}"/></pattern>`],
    stripes: ['Çapraz çizgi', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${s}" height="${s}" fill="${c1}"/><rect width="${s / 2}" height="${s}" fill="${c2}"/></pattern>`],
    grid: ['Kareli', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><path d="M${s} 0H0V${s}" fill="none" stroke="${c2}" stroke-width="${Math.max(1, s / 30)}"/></pattern>`],
    checker: ['Dama', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${c1}"/><rect width="${s}" height="${s}" fill="${c2}"/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${c2}"/></pattern>`],
    waves: ['Dalga', (c1, c2, s) => `<pattern id="p" width="${s * 2}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s}" fill="${c1}"/><path d="M0 ${s / 2}c${s / 2}-${s / 2.5} ${s}-${s / 2.5} ${s * 1.5} 0 0 0 ${s / 4} ${s / 5} ${s / 2} 0" fill="none" stroke="${c2}" stroke-width="${s / 10}"/></pattern>`],
    zigzag: ['Zikzak', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s / 2}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s / 2}" fill="${c1}"/><path d="M0 ${s / 2}L${s / 2} 0 ${s} ${s / 2}" fill="none" stroke="${c2}" stroke-width="${s / 10}"/></pattern>`],
    triangles: ['Üçgen', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><path d="M0 ${s}L${s / 2} 0 ${s} ${s}z" fill="${c2}" opacity=".6"/></pattern>`],
    plus: ['Artı', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><path d="M${s / 2} ${s * 0.3}v${s * 0.4}M${s * 0.3} ${s / 2}h${s * 0.4}" stroke="${c2}" stroke-width="${s / 12}" stroke-linecap="round"/></pattern>`],
    circles: ['Halkalar', (c1, c2, s) => `<pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c1}"/><circle cx="0" cy="0" r="${s / 2}" fill="none" stroke="${c2}" stroke-width="${s / 14}"/><circle cx="${s}" cy="${s}" r="${s / 2}" fill="none" stroke="${c2}" stroke-width="${s / 14}"/></pattern>`],
  };
  const TEXTURES = {
    paper: ['Kâğıt', (c1, c2, W, H) => `<filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${H}" filter="url(#f)"/>`],
    linen: ['Keten', (c1, c2, W, H) => `<filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".02 .9" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${H}" filter="url(#f)"/>`],
    wood: ['Ahşap', (c1, c2, W, H) => `<filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="4" seed="8"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${H}" fill="${c2}" filter="url(#f)"/>`],
    marble: ['Mermer', (c1, c2, W, H) => `<filter id="f"><feTurbulence type="turbulence" baseFrequency=".004 .008" numOctaves="5" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 .1 .6 0"/></feComponentTransfer></filter><rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${H}" fill="${c2}" filter="url(#f)"/>`],
    concrete: ['Beton', (c1, c2, W, H) => `<filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="5" seed="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><rect width="${W}" height="${H}" filter="url(#f)"/>`],
    mesh: ['Renk bulutu', (c1, c2, W, H) => { const r = rnd(7), c3 = bcol(2, '#F59E0B'); return `<filter id="b"><feGaussianBlur stdDeviation="${Math.max(W, H) / 9}"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><g filter="url(#b)">${[c2, c3, c2, '#ffffff'].map((c, i) => `<circle cx="${W * r()}" cy="${H * r()}" r="${Math.max(W, H) * (0.25 + r() * 0.2)}" fill="${c}" opacity="${i === 3 ? 0.35 : 0.85}"/>`).join('')}</g>`; }],
    bokeh: ['Bokeh', (c1, c2, W, H) => { const r = rnd(4); let o = ''; for (let i = 0; i < 34; i++) o += `<circle cx="${W * r()}" cy="${H * r()}" r="${Math.max(W, H) * (0.02 + r() * 0.07)}" fill="${c2}" opacity="${(0.12 + r() * 0.35).toFixed(2)}"/>`; return `<filter id="b"><feGaussianBlur stdDeviation="${Math.max(W, H) / 220}"/></filter><rect width="${W}" height="${H}" fill="${c1}"/><g filter="url(#b)">${o}</g>`; }],
    terrazzo: ['Terrazzo', (c1, c2, W, H) => { const r = rnd(9), cs = [c2, bcol(2, '#F59E0B'), '#ffffff', bcol(1, '#19A9E1')]; let o = ''; const n = Math.round((260 * W * H) / Math.max(W, H) ** 2); for (let i = 0; i < n; i++) { const x = W * r(), y = H * r(), s = Math.max(W, H) * (0.006 + r() * 0.016); let p = ''; for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.28 + r(), rr = s * (0.6 + r() * 0.6); p += (k ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } o += `<path d="${p}Z" fill="${cs[i % 4]}" opacity=".85"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
    confetti: ['Konfeti', (c1, c2, W, H) => { const r = rnd(12), cs = [c2, bcol(2, '#F59E0B'), bcol(1, '#19A9E1'), '#22C55E']; let o = ''; for (let i = 0; i < 90; i++) { const x = W * r(), y = H * r(), s = Math.max(W, H) * 0.012; o += `<rect x="${x}" y="${y}" width="${s}" height="${s * 2.4}" rx="${s / 3}" fill="${cs[i % 4]}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
    halftone: ['Yarım ton', (c1, c2, W, H) => { const s = Math.max(W, H) / 40; let o = ''; for (let y = 0; y < H + s; y += s) for (let x = 0; x < W + s; x += s) { const t = 1 - (x / W + y / H) / 2; o += `<circle cx="${x}" cy="${y}" r="${(s * 0.48 * t).toFixed(1)}" fill="${c2}"/>`; } return `<rect width="${W}" height="${H}" fill="${c1}"/>${o}`; }],
  };
  function bgSVG(kind, c1, c2, scale, W, H) {
    if (PATTERNS[kind]) { const s = Math.max(6, (Math.min(W, H) / 18) * scale); return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${PATTERNS[kind][1](c1, c2, s)}</defs><rect width="${W}" height="${H}" fill="url(#p)"/></svg>`; }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${TEXTURES[kind][1](c1, c2, W, H)}</svg>`;
  }
  P5.PATTERNS = PATTERNS; P5.TEXTURES = TEXTURES;
  P5.bgDialog = async function () {
    const ed = E(); if (!ed) return toast('Önce bir tasarım aç', true);
    const doc = ed.doc, all = { ...PATTERNS, ...TEXTURES };
    let kind = 'dots', c1 = bcol(3, '#FBF7F0'), c2 = bcol(0, '#E2197C'), sc = 1, op = 1;
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('grid')} Arka plan ve doku</h3>
      <div class="bg-grid" id="bgG">${Object.entries(all).map(([k, [n]]) => `<button class="bg-it${k === kind ? ' on' : ''}" data-k="${k}"><span class="bg-th"></span><small>${n}</small></button>`).join('')}</div>
      <div class="bg-opts"><label class="color" style="width:auto"><input type="color" id="bg1" value="${R.toHex(c1)}"><span>Zemin</span></label><label class="color" style="width:auto"><input type="color" id="bg2" value="${R.toHex(c2)}"><span>Desen</span></label>
      <div class="prow" style="flex:1;min-width:160px"><span>Ölçek</span><input type="range" id="bgS" min="0.3" max="3" step="0.1" value="1"></div><div class="prow" style="flex:1;min-width:160px"><span>Opaklık</span><input type="range" id="bgO" min="0.1" max="1" step="0.05" value="1"></div></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bgOk">${icon('check')}Arka plana ekle</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const thumbs = () => $$('.bg-it', box).forEach((b) => { const s2 = bgSVG(b.dataset.k, c1, c2, sc * 0.6, 160, 110); b.querySelector('.bg-th').style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(s2)}")`; });
        $$('.bg-it', box).forEach((b) => (b.onclick = () => { kind = b.dataset.k; $$('.bg-it', box).forEach((x) => x.classList.toggle('on', x === b)); }));
        $('#bg1', box).oninput = (e) => { c1 = e.target.value; thumbs(); }; $('#bg2', box).oninput = (e) => { c2 = e.target.value; thumbs(); };
        $('#bgS', box).oninput = (e) => { sc = +e.target.value; thumbs(); }; $('#bgO', box).oninput = (e) => (op = +e.target.value);
        $('#bgOk', box).onclick = () => close(true);
        thumbs();
      },
    });
    if (!res) return;
    toast('Arka plan hazırlanıyor…');
    const k = Math.min(1, 2400 / Math.max(doc.width, doc.height)), W = Math.round(doc.width * k), H = Math.round(doc.height * k);
    const svg = bgSVG(kind, c1, c2, sc, W, H);
    const im = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(im, 0, 0, W, H);
    const url = await upload(c.toDataURL(kind in TEXTURES && !['confetti', 'terrazzo', 'halftone'].includes(kind) ? 'image/jpeg' : 'image/png', 0.9), 'arka-plan.png');
    const old = doc.layers.find((l) => l.role === 'bgpattern'); if (old) doc.layers.splice(doc.layers.indexOf(old), 1);
    ed.insert([{ type: 'image', name: 'Arka plan: ' + all[kind][0], role: 'bgpattern', src: url, x: 0, y: 0, w: doc.width, h: doc.height, nw: W, nh: H, fit: 'fill', opacity: op, filters: {} }], { bottom: true });
    toast('Arka plan eklendi — en alttaki katman');
  };

  // =====================================================================
  // 3) TABLO VE GRAFİK
  // =====================================================================
  const parseRows = (t) => t.split(/\r?\n/).map((r) => r.trim()).filter(Boolean).map((r) => r.split(r.includes('\t') ? '\t' : r.includes(';') ? ';' : r.includes('|') ? '|' : ',').map((c) => c.trim()));
  P5.tableDialog = async function () {
    const ed = E(); if (!ed) return toast('Önce bir tasarım aç', true);
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('grid')} Tablo ekle</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Excel'den kopyalayıp yapıştırabilirsin. Her satır bir satır; sütunları sekme, noktalı virgül ya da | ile ayır.</p>
      <textarea class="inp" id="tbT" rows="7" style="font-family:monospace">Ürün;Gramaj;Fiyat\nSumak;100 g;₺85\nPul biber;150 g;₺70\nKekik;80 g;₺60\nKimyon;100 g;₺75</textarea>
      <div class="tb-opts"><div class="seg" id="tbS"><button data-s="zebra" class="on">Zebra</button><button data-s="lines">Çizgili</button><button data-s="minimal">Sade</button></div><label class="switch"><input type="checkbox" id="tbH" checked>İlk satır başlık</label><label class="color" style="width:auto"><input type="color" id="tbC" value="${R.toHex(bcol(0, '#1F2937'))}"><span>Vurgu</span></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="tbOk">${icon('plus')}Ekle</button></div>`, {
      onOpen: (box, close) => { let st = 'zebra'; $$('#tbS button', box).forEach((b) => (b.onclick = () => { st = b.dataset.s; $$('#tbS button', box).forEach((x) => x.classList.toggle('on', x === b)); })); $('#tbOk', box).onclick = () => close({ rows: parseRows($('#tbT', box).value), st, head: $('#tbH', box).checked, c: $('#tbC', box).value }); },
    });
    if (!res || !res.rows.length) return;
    const doc = ed.doc, rows = res.rows, ncol = Math.max(...rows.map((r) => r.length));
    const W = doc.width * 0.8, x0 = (doc.width - W) / 2, fs = Math.max(12, Math.min(doc.width, doc.height) * 0.028), rh = fs * 2.1, H = rh * rows.length;
    const y0 = Math.max(doc.height * 0.1, (doc.height - H) / 2), cw = W / ncol, L = [];
    const light = T.contrast('#FFFFFF', res.c) > 3 ? '#FFFFFF' : '#111111';
    const NUMRE = /^[₺$€]?\s?[\d.,]+\s?(₺|TL|g|kg|ml|L|%)?$/i;
    // sütun sayısal mı? (başlık hariç satırların çoğu sayıysa başlık da sağa yaslanır)
    const numCol = Array.from({ length: ncol }, (_, j) => { const body = rows.slice(res.head ? 1 : 0).map((r) => (r[j] || '').trim()).filter(Boolean); return j > 0 && body.length && body.filter((t) => NUMRE.test(t)).length >= body.length * 0.6; });
    rows.forEach((r, i) => {
      const y = y0 + i * rh, isH = res.head && i === 0;
      if (isH) L.push({ type: 'rect', name: 'Tablo başlığı', x: x0, y, w: W, h: rh, fill: res.c, radius: res.st === 'minimal' ? 0 : fs * 0.3 });
      else if (res.st === 'zebra' && i % 2 === (res.head ? 0 : 1)) L.push({ type: 'rect', name: 'Satır zemini', x: x0, y, w: W, h: rh, fill: R.rgba(res.c, 0.08) });
      if (res.st !== 'zebra' && !isH && i < rows.length - 1) L.push({ type: 'rect', name: 'Satır çizgisi', x: x0, y: y + rh - 1, w: W, h: Math.max(1, fs * 0.06), fill: R.rgba(res.c, res.st === 'minimal' ? 0.15 : 0.35) });
      for (let j = 0; j < ncol; j++) {
        const t = r[j] || '', num = numCol[j];
        L.push({ type: 'text', name: `Hücre ${i + 1}-${j + 1}`, text: t, x: x0 + j * cw + fs * 0.6, y: y + (rh - fs * 1.2) / 2, w: cw - fs * 1.2, fontSize: fs, fontWeight: isH ? 700 : 400, fill: isH ? light : '#1F2937', align: j > 0 && num ? 'right' : 'left', fontFamily: 'Segoe UI' });
      }
    });
    ed.insert(L, { group: true }); toast('Tablo eklendi — hücrelere çift dokunup düzenle');
  };
  P5.chartDialog = async function () {
    const ed = E(); if (!ed) return toast('Önce bir tasarım aç', true);
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('sliders')} Grafik ekle</h3>
      <div class="seg" id="chT" style="margin-bottom:8px"><button data-t="col" class="on">Sütun</button><button data-t="bar">Çubuk</button><button data-t="pie">Pasta</button><button data-t="donut">Halka</button><button data-t="line">Çizgi</button></div>
      <textarea class="inp" id="chD" rows="6" style="font-family:monospace">Ocak;120\nŞubat;180\nMart;150\nNisan;240\nMayıs;300</textarea>
      <div class="tb-opts"><input class="inp" id="chTitle" placeholder="Başlık (isteğe bağlı)" style="flex:1"><label class="switch"><input type="checkbox" id="chV" checked>Değerleri yaz</label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="chOk">${icon('plus')}Ekle</button></div>`, {
      onOpen: (box, close) => { let t = 'col'; $$('#chT button', box).forEach((b) => (b.onclick = () => { t = b.dataset.t; $$('#chT button', box).forEach((x) => x.classList.toggle('on', x === b)); })); $('#chOk', box).onclick = () => close({ t, rows: parseRows($('#chD', box).value), title: $('#chTitle', box).value.trim(), vals: $('#chV', box).checked }); },
    });
    if (!res) return;
    const data = res.rows.map((r) => [r[0], parseFloat(String(r[1] || '0').replace(',', '.')) || 0]).filter((r) => r[0]);
    if (!data.length) return;
    const doc = ed.doc, S = Math.min(doc.width, doc.height), W = doc.width * 0.78, Hc = Math.min(doc.height * 0.55, W * 0.7), x0 = (doc.width - W) / 2, fs = S * 0.026;
    let y0 = (doc.height - Hc) / 2; const L = [];
    const pal = [...new Set([bcol(0, '#E2197C'), bcol(1, '#19A9E1'), bcol(2, '#F59E0B'), '#22C55E', '#8B5CF6', '#EF4444', '#14B8A6', '#64748B'])];
    if (res.title) { L.push({ type: 'text', name: 'Grafik başlığı', text: res.title, x: x0, y: y0 - fs * 3, w: W, fontSize: fs * 1.5, fontWeight: 800, fill: '#111827', align: 'left', fontFamily: 'Segoe UI' }); }
    const mx = Math.max(...data.map((d) => d[1])) || 1, fmt = (v) => (Math.round(v * 10) / 10).toLocaleString('tr-TR');
    if (res.t === 'col' || res.t === 'bar') {
      const n = data.length, horiz = res.t === 'bar';
      const areaW = W, areaH = Hc - fs * 2.2;
      data.forEach(([lab, v], i) => {
        const col = pal[0];
        if (!horiz) { const bw = (areaW / n) * 0.62, gx = x0 + (areaW / n) * i + (areaW / n - bw) / 2, bh = (v / mx) * areaH, by = y0 + areaH - bh;
          L.push({ type: 'rect', name: 'Sütun ' + lab, x: gx, y: by, w: bw, h: Math.max(1, bh), fill: col, radius: Math.min(bw * 0.15, 10) });
          L.push({ type: 'text', name: 'Etiket ' + lab, text: lab, x: gx - bw * 0.3, y: y0 + areaH + fs * 0.5, w: bw * 1.6, fontSize: fs * 0.85, fill: '#374151', align: 'center', fontFamily: 'Segoe UI' });
          if (res.vals) L.push({ type: 'text', name: 'Değer ' + lab, text: fmt(v), x: gx - bw * 0.3, y: by - fs * 1.4, w: bw * 1.6, fontSize: fs * 0.9, fontWeight: 700, fill: '#111827', align: 'center', fontFamily: 'Segoe UI' });
        } else { const lw = W * 0.25, bh2 = (Hc / n) * 0.6, gy = y0 + (Hc / n) * i + (Hc / n - bh2) / 2, bw = (v / mx) * (W - lw - fs * 4);
          L.push({ type: 'text', name: 'Etiket ' + lab, text: lab, x: x0, y: gy + (bh2 - fs * 1.1) / 2, w: lw - fs * 0.6, fontSize: fs * 0.9, fill: '#374151', align: 'right', fontFamily: 'Segoe UI' });
          L.push({ type: 'rect', name: 'Çubuk ' + lab, x: x0 + lw, y: gy, w: Math.max(1, bw), h: bh2, fill: col, radius: Math.min(bh2 * 0.25, 10) });
          if (res.vals) L.push({ type: 'text', name: 'Değer ' + lab, text: fmt(v), x: x0 + lw + bw + fs * 0.5, y: gy + (bh2 - fs * 1.1) / 2, w: fs * 5, fontSize: fs * 0.9, fontWeight: 700, fill: '#111827', align: 'left', fontFamily: 'Segoe UI' });
        }
      });
      if (!horiz) L.unshift({ type: 'rect', name: 'Taban çizgisi', x: x0, y: y0 + areaH, w: W, h: Math.max(1, fs * 0.08), fill: '#D1D5DB' });
    } else if (res.t === 'pie' || res.t === 'donut') {
      const tot = data.reduce((s, d) => s + d[1], 0) || 1, R0 = Math.min(Hc, W * 0.5) / 2, cx = x0 + R0, cy = y0 + Hc / 2, ri = res.t === 'donut' ? R0 * 0.58 : 0;
      let a0 = -Math.PI / 2;
      data.forEach(([lab, v], i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0, P = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        const [x1, y1] = P(a0, R0), [x2, y2] = P(a1, R0);
        let d = data.length === 1 ? `M${cx - R0} ${cy}a${R0} ${R0} 0 1 0 ${2 * R0} 0a${R0} ${R0} 0 1 0 ${-2 * R0} 0z` : ri ? (() => { const [x3, y3] = P(a1, ri), [x4, y4] = P(a0, ri); return `M${x1} ${y1}A${R0} ${R0} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${ri} ${ri} 0 ${large} 0 ${x4} ${y4}Z`; })() : `M${cx} ${cy}L${x1} ${y1}A${R0} ${R0} 0 ${large} 1 ${x2} ${y2}Z`;
        const b = window.Importers.pathBox(d);
        L.push({ type: 'path', name: 'Dilim ' + lab, d: window.Importers.shiftPath(d, b.x, b.y), vw: b.width, vh: b.height, x: b.x, y: b.y, w: b.width, h: b.height, fill: pal[i % pal.length], stroke: '#FFFFFF', strokeWidth: Math.max(1, S * 0.003) });
        const ly = y0 + Hc * 0.15 + i * fs * 1.9;
        L.push({ type: 'rect', name: 'Lejant ' + lab, x: cx + R0 + fs * 2, y: ly + fs * 0.15, w: fs * 0.9, h: fs * 0.9, fill: pal[i % pal.length], radius: fs * 0.2 });
        L.push({ type: 'text', name: 'Lejant yazı ' + lab, text: `${lab}${res.vals ? '  ' + Math.round((v / tot) * 100) + '%' : ''}`, x: cx + R0 + fs * 3.3, y: ly, w: W - 2 * R0 - fs * 3.5, fontSize: fs, fill: '#1F2937', align: 'left', fontFamily: 'Segoe UI' });
        a0 = a1;
      });
    } else {
      const n = data.length, areaH = Hc - fs * 2.2, pts = data.map(([, v], i) => [x0 + (n === 1 ? W / 2 : (W * i) / (n - 1)), y0 + areaH - (v / mx) * areaH * 0.92]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(''), b = window.Importers.pathBox(d + 'Z');
      L.push({ type: 'rect', name: 'Taban çizgisi', x: x0, y: y0 + areaH, w: W, h: Math.max(1, fs * 0.08), fill: '#D1D5DB' });
      L.push({ type: 'path', name: 'Çizgi', d: window.Importers.shiftPath(d, b.x, b.y), vw: Math.max(1, b.width), vh: Math.max(1, b.height), x: b.x, y: b.y, w: Math.max(1, b.width), h: Math.max(1, b.height), fill: 'none', stroke: pal[0], strokeWidth: Math.max(2, S * 0.006), lineJoin: 'round', lineCap: 'round' });
      data.forEach(([lab, v], i) => {
        const [px, py] = pts[i], r = Math.max(4, S * 0.009);
        L.push({ type: 'ellipse', name: 'Nokta ' + lab, x: px - r, y: py - r, w: r * 2, h: r * 2, fill: '#FFFFFF', stroke: pal[0], strokeWidth: Math.max(2, S * 0.004) });
        L.push({ type: 'text', name: 'Etiket ' + lab, text: lab, x: px - fs * 3, y: y0 + areaH + fs * 0.5, w: fs * 6, fontSize: fs * 0.85, fill: '#374151', align: 'center', fontFamily: 'Segoe UI' });
        if (res.vals) L.push({ type: 'text', name: 'Değer ' + lab, text: fmt(v), x: px - fs * 3, y: py - fs * 2, w: fs * 6, fontSize: fs * 0.85, fontWeight: 700, fill: '#111827', align: 'center', fontFamily: 'Segoe UI' });
      });
    }
    ed.insert(L, { group: true }); toast('Grafik eklendi — renkleri ve yazıları tek tek düzenleyebilirsin');
  };

  // =====================================================================
  // 4) MARKA KİTİNİ GÖRSELDEN ÇIKAR
  // =====================================================================
  function kmeans(px, k = 6) {
    const pts = []; for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 200) pts.push([px[i], px[i + 1], px[i + 2]]);
    if (!pts.length) return [];
    let cs = Array.from({ length: k }, (_, i) => pts[Math.floor((i + 0.5) * pts.length / k)].slice());
    let asg = new Array(pts.length).fill(0);
    for (let it = 0; it < 12; it++) {
      pts.forEach((p, i) => { let b = 0, bd = 1e9; cs.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; b = j; } }); asg[i] = b; });
      const sum = cs.map(() => [0, 0, 0, 0]); pts.forEach((p, i) => { const s = sum[asg[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      cs = sum.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cs[j]));
    }
    const cnt = cs.map(() => 0); asg.forEach((a) => cnt[a]++);
    const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    const out = cs.map((c, i) => ({ hex: hex(c), n: cnt[i] / pts.length, c })).filter((x) => x.n > 0.01).sort((a, b) => b.n - a.n);
    const uniq = []; out.forEach((o) => { if (!uniq.some((u) => Math.hypot(u.c[0] - o.c[0], u.c[1] - o.c[1], u.c[2] - o.c[2]) < 38)) uniq.push(o); });
    return uniq;
  }
  const sat = (c) => { const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0; };
  P5.brandFromImage = async function (onDone) {
    const f = await pickFile('image/*'); if (!f) return;
    const url = await readURL(f), im = await loadImg(url);
    const k = Math.min(1, 220 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
    const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
    const cl = kmeans(x.getImageData(0, 0, c.width, c.height).data, 7);
    if (!cl.length) return toast('Görselde renk bulunamadı', true);
    const L = (h) => T.lum(h);
    const vivid = cl.filter((o) => sat(o.c) > 0.28 && L(o.hex) > 0.03 && L(o.hex) < 0.85).sort((a, b) => b.n * (0.5 + sat(b.c)) - a.n * (0.5 + sat(a.c)));
    const dark = cl.slice().sort((a, b) => L(a.hex) - L(b.hex))[0], light = cl.slice().sort((a, b) => L(b.hex) - L(a.hex))[0];
    const pal = [...new Set([...vivid.slice(0, 3).map((o) => o.hex), dark.hex, light.hex, ...cl.map((o) => o.hex)])].slice(0, 5);
    let fontRes = null;
    if ((A().S.settings || {}).provider !== 'local' || window.TS_CLOUD) {
      try { fontRes = await A().api('font-match', { body: { data: c.width < 400 ? (() => { const c2 = document.createElement('canvas'); const k2 = Math.min(1, 1000 / Math.max(im.width, im.height)); c2.width = im.width * k2; c2.height = im.height * k2; c2.getContext('2d').drawImage(im, 0, 0, c2.width, c2.height); return c2.toDataURL('image/png'); })() : c.toDataURL(), fonts: R.FONTS } }); } catch (e) {}
    }
    const fh = fontRes && fontRes.matches && fontRes.matches[0] ? fontRes.matches[0].font : '';
    const fb = fontRes && fontRes.matches && fontRes.matches.find((m) => m.font !== fh && !/Black|Impact/.test(m.font)) ? fontRes.matches.find((m) => m.font !== fh && !/Black|Impact/.test(m.font)).font : (fh ? 'Segoe UI' : '');
    const r = await UI().dialog(`<div class="d-body"><h3>${icon('palette')} Görselden marka kiti</h3>
      <div class="bk-row"><img src="${url}" alt="" class="bk-img"><div><div class="aw-lbl">Bulunan renkler (ilki ana renk)</div><div class="bk-cols" id="bkC">${pal.map((h) => `<label class="bk-col"><input type="checkbox" checked value="${h}"><i style="background:${h}"></i><small>${h}</small></label>`).join('')}</div>
      ${fh ? `<div class="aw-lbl">Yazı tipi önerisi${fontRes.name ? ` (görseldeki: ${esc(fontRes.name)})` : ''}</div><div class="bk-fonts"><span style="font-family:'${esc(fh)}'">Başlık: ${esc(fh)}</span><span style="font-family:'${esc(fb)}'">Metin: ${esc(fb)}</span></div>` : `<p class="muted" style="font-size:12px">Yazı tipi tanıma için yapay zeka bağlı olmalı; renkler yine de çıkarıldı.</p>`}</div></div>
      <label class="switch"><input type="checkbox" id="bkLogo" checked>Bu görseli logo olarak kaydet</label> <label class="switch"><input type="checkbox" id="bkOn" checked>Yeni tasarımlarda marka kitini kullan</label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="bkOk">${icon('check')}Marka kitine kaydet</button></div>`, {
      onOpen: (box, close) => ($('#bkOk', box).onclick = () => close({ colors: $$('#bkC input:checked', box).map((i) => i.value), logo: $('#bkLogo', box).checked, on: $('#bkOn', box).checked })),
    });
    if (!r) return;
    const b = { ...(brand()), colors: r.colors.length ? r.colors : brand().colors, enabled: r.on || brand().enabled };
    if (fh) { b.font_heading = fh; b.font_body = fb; }
    if (r.logo) { b.logo = await upload(url, 'logo' + (f.type === 'image/png' ? '.png' : '.jpg')); b.logo_ratio = im.width / im.height; }
    try { A().S.brand = await A().api('brand', { body: b }); toast('Marka kiti güncellendi'); if (onDone) onDone(); } catch (e) { toast(e.message, true); }
  };
  // marka renklerinden şablon paleti (Library.instantiate için)
  P5.brandPalette = function () {
    const b = brand(), cs = [...new Set((b.colors || []).filter(Boolean).map((c) => R.toHex(c).toUpperCase()))]; if (!cs.length) return null;
    const lum = (c) => T.lum(c), S = (c) => { const o = T.rgb(c); return sat([o.r, o.g, o.b]); };
    const byL = cs.slice().sort((x, y) => lum(x) - lum(y)), dark = byL[0], light = byL[byL.length - 1];
    const bg = lum(light) > 0.7 ? light : '#FFFFFF', ink = lum(dark) < 0.15 ? dark : '#14161B';
    // vurgu renkleri: zeminde okunabilen, en canlıdan başlayarak
    const acc = cs.filter((c) => c !== bg && c !== ink && T.contrast(c, bg) >= 1.9).sort((x, y) => S(y) - S(x));
    const a = acc[0] || (T.contrast(cs[0], bg) >= 1.9 ? cs[0] : '#E2197C'), b2 = acc[1] || ink;
    const mix = (c1, c2, t) => { const p = T.rgb(c1), q = T.rgb(c2); return '#' + [p.r + (q.r - p.r) * t, p.g + (q.g - p.g) * t, p.b + (q.b - p.b) * t].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
    return { bg, ink, a, b: b2, c: acc[2] || mix(a, bg, 0.72), _fh: b.font_heading, _fb: b.font_body };
  };


  // =====================================================================
  // 5) ÜRÜN KATALOĞU / FİYAT LİSTESİ (Excel → çok sayfalı)
  // =====================================================================
  const FMT = { a4: [1240, 1754, 'A4 (baskı / PDF)'], post: [1080, 1350, 'Instagram / WhatsApp (4:5)'], story: [1080, 1920, 'Story (9:16)'] };
  async function buildCatalog(table, o, photos) {
    const [W, H] = FMT[o.fmt], b = brand(), acc = bcol(0, '#E2197C'), ink = '#14161B', bg = '#FFFFFF';
    const [cols, rowsN] = o.grid.split('x').map(Number), per = cols * rowsN;
    const ci = (k) => table.columns.indexOf(o.map[k]);
    const val = (r, k) => { if (!o.map[k]) return ''; const v = Array.isArray(r) ? (ci(k) >= 0 ? r[ci(k)] : '') : r[o.map[k]]; return String(v ?? '').trim(); };
    const items = table.rows.filter((r) => val(r, 'name'));
    const pages = [];
    const M = W * 0.06, headH = H * 0.12, footH = H * 0.05, gap = W * 0.025;
    const cw = (W - 2 * M - gap * (cols - 1)) / cols, ch = (H - headH - footH - M - gap * (rowsN - 1)) / rowsN;
    const fs = Math.min(cw, ch) * 0.075;
    const nPages = Math.max(1, Math.ceil(items.length / per));
    for (let p = 0; p < nPages; p++) {
      const L = [];
      L.push({ type: 'rect', name: 'Üst şerit', x: 0, y: 0, w: W, h: headH * 0.82, fill: acc });
      const tcol = T.contrast('#FFFFFF', acc) > 2.6 ? '#FFFFFF' : '#14161B';
      if (b.logo) { const lh = headH * 0.45, lw = lh * (b.logo_ratio || 1); L.push({ type: 'image', name: 'Logo', src: b.logo, x: M, y: (headH * 0.82 - lh) / 2, w: lw, h: lh, fit: 'contain', filters: {} }); }
      L.push({ type: 'text', name: 'Katalog başlığı', role: 'title', text: o.title || 'Ürün Kataloğu', x: b.logo ? W * 0.3 : M, y: headH * 0.22, w: b.logo ? W * 0.7 - M : W - 2 * M, fontSize: headH * 0.3, fontWeight: 800, fill: tcol, align: b.logo ? 'right' : 'left', fontFamily: b.font_heading || 'Segoe UI' });
      L.push({ type: 'text', name: 'Alt başlık', text: o.sub || (b.name || ''), x: b.logo ? W * 0.3 : M, y: headH * 0.58, w: b.logo ? W * 0.7 - M : W - 2 * M, fontSize: headH * 0.12, fill: tcol, opacity: 0.85, align: b.logo ? 'right' : 'left', fontFamily: b.font_body || 'Segoe UI' });
      items.slice(p * per, p * per + per).forEach((r, i) => {
        const cx = M + (i % cols) * (cw + gap), cy = headH + Math.floor(i / cols) * (ch + gap), g = 'c' + p + '_' + i;
        L.push({ type: 'rect', name: 'Kart', group: g, x: cx, y: cy, w: cw, h: ch, fill: '#F6F4F0', radius: Math.min(cw, ch) * 0.05 });
        const ph = ch * 0.56, src = photos[val(r, 'photo').toLowerCase()] || (/^(https?:|\/uploads\/|data:)/.test(val(r, 'photo')) ? val(r, 'photo') : '');
        if (src) L.push({ type: 'image', name: 'Ürün fotoğrafı', role: 'photo', group: g, src, x: cx + cw * 0.06, y: cy + cw * 0.06, w: cw * 0.88, h: ph - cw * 0.06, fit: 'contain', filters: {} });
        else L.push({ type: 'rect', name: 'Fotoğraf yeri', group: g, x: cx + cw * 0.06, y: cy + cw * 0.06, w: cw * 0.88, h: ph - cw * 0.06, fill: '#E9E5DD', radius: Math.min(cw, ch) * 0.03 });
        let ty = cy + ph + fs * 0.6;
        L.push({ type: 'text', name: 'Ürün adı', group: g, text: val(r, 'name'), x: cx + cw * 0.07, y: ty, w: cw * 0.86, fontSize: fs * 1.15, fontWeight: 700, fill: ink, align: 'left', fontFamily: b.font_heading || 'Segoe UI', lineHeight: 1.15 });
        ty += fs * 1.6;
        if (val(r, 'desc')) L.push({ type: 'text', name: 'Açıklama', group: g, text: val(r, 'desc'), x: cx + cw * 0.07, y: ty, w: cw * 0.86, fontSize: fs * 0.8, fill: '#4B5563', align: 'left', fontFamily: b.font_body || 'Segoe UI', lineHeight: 1.25 });
        const price = val(r, 'price'), old = val(r, 'old');
        const pr = (v) => (/[₺$€]|TL/i.test(v) || !v ? v : (o.cur === 'pre' ? '₺' + v : v + ' ₺'));
        if (price) L.push({ type: 'text', name: 'Fiyat', role: 'price', group: g, text: pr(price), x: cx + cw * 0.07, y: cy + ch - fs * 2.2, w: cw * 0.5, fontSize: fs * 1.45, fontWeight: 800, fill: acc, align: 'left', fontFamily: b.font_heading || 'Segoe UI' });
        if (old) L.push({ type: 'text', name: 'Eski fiyat', group: g, text: pr(old), x: cx + cw * 0.5, y: cy + ch - fs * 1.9, w: cw * 0.43, fontSize: fs * 0.9, fill: '#9CA3AF', align: 'right', fontFamily: b.font_body || 'Segoe UI', strike: true });
      });
      L.push({ type: 'text', name: 'Alt bilgi', text: [b.phone, b.web, b.address].filter(Boolean).join('  ·  ') || (b.name || ''), x: M, y: H - footH * 0.75, w: W * 0.7, fontSize: footH * 0.28, fill: '#6B7280', align: 'left', fontFamily: 'Segoe UI' });
      L.push({ type: 'text', name: 'Sayfa no', role: 'pagenum', text: `${p + 1} / ${nPages}`, x: W - M - W * 0.2, y: H - footH * 0.75, w: W * 0.2, fontSize: footH * 0.28, fill: '#6B7280', align: 'right', fontFamily: 'Segoe UI' });
      pages.push({ width: W, height: H, background: bg, layers: L });
    }
    return pages;
  }
  P5.catalogDialog = async function (existingGroup) {
    let table = null; const photos = {};
    let list = []; try { list = await A().api('projects'); } catch (e) {}
    const cats = {}; list.filter((p) => p.meta && p.meta.catalog).forEach((p) => { (cats[p.meta.pageGroup] = cats[p.meta.pageGroup] || []).push(p); });
    const res = await UI().dialog(`<div class="d-body cat-d"><h3>${icon('list')} Ürün kataloğu / fiyat listesi</h3>
      <p class="muted" style="margin:0 0 10px;font-size:13px">Excel ya da CSV'deki ürünlerinden çok sayfalı katalog hazırlanır. Fiyatlar değişince yeni dosyayı yükleyip <b>güncelle</b> — tasarım aynı kalır, rakamlar yenilenir.</p>
      ${Object.keys(cats).length ? `<label class="fld"><span>Var olan kataloğu güncelle (isteğe bağlı)</span><select class="inp" id="ctUpd"><option value="">— Yeni katalog oluştur —</option>${Object.entries(cats).map(([g, ps]) => `<option value="${g}" ${g === existingGroup ? 'selected' : ''}>${esc((ps[0].name || '').replace(/ — sayfa \d+$/, ''))} (${ps.length} sayfa)</option>`).join('')}</select></label>` : ''}
      <div class="iconrow" style="margin:8px 0"><button class="btn" id="ctFile">${icon('file')}Excel / CSV seç</button><button class="btn" id="ctPh">${icon('image')}Fotoğrafları seç</button></div>
      <div id="ctInfo" class="muted" style="font-size:12.5px">Sütunlar: ürün adı, fiyat (zorunlu); açıklama, eski fiyat, fotoğraf dosya adı (isteğe bağlı).</div>
      <div id="ctMap" class="ct-map"></div>
      <div class="ct-grid2"><label class="fld"><span>Başlık</span><input class="inp" id="ctTitle" value="Ürün Kataloğu"></label><label class="fld"><span>Alt başlık</span><input class="inp" id="ctSub" value="${esc(brand().name || '')}"></label>
      <label class="fld"><span>Ölçü</span><select class="inp" id="ctFmt">${Object.entries(FMT).map(([k, v]) => `<option value="${k}">${v[2]}</option>`).join('')}</select></label>
      <label class="fld"><span>Sayfa başına</span><select class="inp" id="ctGrid"><option value="2x2">4 ürün (2×2)</option><option value="2x3" selected>6 ürün (2×3)</option><option value="3x3">9 ürün (3×3)</option><option value="3x4">12 ürün (3×4)</option><option value="1x3">3 ürün (liste)</option></select></label>
      <label class="fld"><span>Para birimi</span><select class="inp" id="ctCur"><option value="post">100 ₺</option><option value="pre">₺100</option></select></label></div></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ctGo" disabled>${icon('sparkle')}Kataloğu hazırla</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const FIELDS = [['name', 'Ürün adı', /ad|isim|ürün|name|product/i], ['price', 'Fiyat', /fiyat|price|tutar|satış/i], ['old', 'Eski fiyat', /eski|liste|old/i], ['desc', 'Açıklama', /açıkla|desc|detay|gramaj|içerik/i], ['photo', 'Fotoğraf', /foto|resim|görsel|image|photo|dosya/i]];
        const drawMap = () => {
          if (!table) return;
          $('#ctMap', box).innerHTML = FIELDS.map(([k, t, re]) => { const guess = table.columns.find((c) => re.test(c)) || ''; return `<label class="fld"><span>${t}</span><select class="inp" data-m="${k}"><option value="">—</option>${table.columns.map((c) => `<option ${c === guess ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>`; }).join('');
          $('#ctGo', box).disabled = false;
        };
        $('#ctFile', box).onclick = async () => {
          const f = await pickFile('.xlsx,.xls,.csv,.txt,text/csv'); if (!f) return;
          const data = await readURL(f);
          try { table = await A().api('parse-table', { body: { name: f.name, data } }); $('#ctInfo', box).textContent = `${f.name} · ${table.rows.length} ürün · ${table.columns.length} sütun`; drawMap(); }
          catch (e) { $('#ctInfo', box).textContent = 'Okunamadı: ' + e.message; }
        };
        $('#ctPh', box).onclick = async () => {
          const fs = await pickFile('image/*', true); if (!fs || !fs.length) return;
          $('#ctInfo', box).textContent = 'Fotoğraflar yükleniyor…';
          for (const f of fs) { const u = await upload(await readURL(f), f.name); photos[f.name.toLowerCase()] = u; photos[f.name.replace(/\.[^.]+$/, '').toLowerCase()] = u; }
          $('#ctInfo', box).textContent = `${fs.length} fotoğraf hazır${table ? ` · ${table.rows.length} ürün` : ''} (Excel'deki fotoğraf sütunu dosya adıyla eşleşir)`;
        };
        $('#ctGo', box).onclick = () => close({ map: Object.fromEntries($$('[data-m]', box).map((s) => [s.dataset.m, s.value])), title: $('#ctTitle', box).value.trim(), sub: $('#ctSub', box).value.trim(), fmt: $('#ctFmt', box).value, grid: $('#ctGrid', box).value, cur: $('#ctCur', box).value, upd: $('#ctUpd', box) ? $('#ctUpd', box).value : '' });
      },
    });
    if (!res || !table) return;
    if (!res.map.name) return toast('Ürün adı sütununu seç', true);
    const busy = document.createElement('div'); busy.className = 'import-busy'; busy.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span><span>Katalog hazırlanıyor…</span>'; document.body.appendChild(busy);
    try {
      const pages = await buildCatalog(table, res, photos);
      const old = res.upd ? (cats[res.upd] || []).sort((a, b) => (a.meta.page || 0) - (b.meta.page || 0)) : [];
      const group = res.upd || 'cat-' + Date.now().toString(36), made = [];
      for (let i = 0; i < pages.length; i++) {
        const pg = pages[i], base = old[i] ? await A().api('projects/' + old[i].id) : A().newProject(pg.width, pg.height, `${res.title} — sayfa ${i + 1}`);
        // güncellemede: kullanıcının sonradan değiştirdiği renk/yazı tipi kalsın diye yalnızca metin ve fotoğrafları yenile
        if (old[i] && base.layers && base.layers.length === pg.layers.length && base.meta && base.meta.catalog && base.meta.catalog.grid === res.grid) {
          base.layers.forEach((l, k) => { const n = pg.layers[k]; if (n && l.type === n.type && l.type === 'text') l.text = n.text; if (n && l.type === 'image' && n.role === 'photo') l.src = n.src; });
        } else Object.assign(base, { width: pg.width, height: pg.height, background: pg.background, layers: pg.layers });
        base.name = `${res.title} — sayfa ${i + 1}`;
        base.meta = Object.assign({}, base.meta || {}, { pageGroup: group, page: i + 1, pages: pages.length, catalog: { title: res.title, grid: res.grid, fmt: res.fmt, map: res.map, at: Date.now() } });
        R.normalize(base); base.layers.forEach((l) => l.type === 'text' && R.layoutText(l));
        await R.ensureImageSizes(base).catch(() => {}); await A().saveProject(base); made.push(base);
      }
      for (const extra of old.slice(pages.length)) { try { await A().api('projects/' + extra.id, { method: 'DELETE' }); } catch (e) {} }
      busy.remove();
      const pdf = await T.multiPagePDF(made, { scale: res.fmt === 'a4' ? 2 : 1.5 });
      await UI().dialog(`<div class="d-body"><h3>${icon('check')} Katalog hazır: ${made.length} sayfa</h3><div class="adapt-grid">${made.map((m) => `<button class="adapt-it" data-id="${m.id}"><span class="th">${m.thumb ? `<img src="${m.thumb}" alt="">` : ''}</span><small>Sayfa ${m.meta.page}</small></button>`).join('')}</div><p class="muted" style="font-size:12.5px">Sayfaya dokun → editörde aç. Editörün altında sayfalar arasında geçebilirsin.</p></div>
        <div class="d-foot"><button class="btn" id="ctZip">${icon('download')}WhatsApp için PNG'ler</button><button class="btn primary" id="ctPdf">${icon('download')}PDF indir</button></div>`, {
        onOpen: (box, close) => {
          $$('.adapt-it', box).forEach((b) => (b.onclick = () => { close(); A().go('editor', b.dataset.id); }));
          $('#ctPdf', box).onclick = () => R.download(pdf, (res.title || 'katalog').replace(/\s+/g, '-') + '.pdf');
          $('#ctZip', box).onclick = async () => { const files = []; for (const m of made) files.push({ name: `${(res.title || 'katalog').replace(/\s+/g, '-')}-${m.meta.page}.png`, data: new Uint8Array(await (await R.exportBlob(m, 'png', 1)).arrayBuffer()) }); R.download(T.zip(files), (res.title || 'katalog').replace(/\s+/g, '-') + '-png.zip'); };
        },
      });
    } catch (e) { busy.remove(); toast('Katalog hazırlanamadı: ' + e.message, true); }
  };

  // =====================================================================
  // 6) ŞABLON PAKETİ (dışa/içe aktar) + KİLİTLİ ŞABLON
  // =====================================================================
  async function inlineAssets(d) {
    const urls = new Set(); const walk = (o) => { if (!o || typeof o !== 'object') return; for (const k in o) { const v = o[k]; if (typeof v === 'string' && v.startsWith('/uploads/')) urls.add(v); else if (typeof v === 'object') walk(v); } };
    walk(d);
    const map = {};
    for (const u of urls) { try { const bl = await (await fetch(u)).blob(); map[u] = await readURL(bl); } catch (e) {} }
    return map;
  }
  P5.exportPackage = async function () {
    let ps = [], ts = []; try { [ps, ts] = await Promise.all([A().api('projects'), A().api('templates')]); } catch (e) {}
    const cur = A().S.project && A().S.project.id;
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('download')} Şablon paketi hazırla</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Seçtiğin tasarımlar fotoğraflarıyla birlikte tek bir <b>.tasarim</b> dosyasına paketlenir. Başka bilgisayarda Pano → <b>PSD · AI · PDF çalışmanı yükle</b> ile açılır.</p>
      <div class="mp-list" style="max-height:40vh">${[...ps.map((p) => ['p', p]), ...ts.map((t) => ['t', t])].map(([k, p]) => `<label class="mp-it"><input type="checkbox" value="${k}:${esc(p.id)}" ${p.id === cur ? 'checked' : ''}><img src="${esc(p.thumb || '')}" alt=""><span>${esc(p.name || 'Tasarım')}${k === 't' ? ' <small class="muted">· şablon</small>' : ''}</span></label>`).join('')}</div>
      <label class="switch" style="margin-top:10px"><input type="checkbox" id="pkLock">Kilitli şablon: alan yalnızca yazıları ve fotoğrafları değiştirebilsin (yer, boyut, renkler sabit)</label></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="pkGo">${icon('download')}Paketi indir</button></div>`, {
      onOpen: (box, close) => ($('#pkGo', box).onclick = () => close({ ids: $$('.mp-list input:checked', box).map((i) => i.value), lock: $('#pkLock', box).checked })),
    });
    if (!res || !res.ids.length) return;
    toast('Paket hazırlanıyor…');
    const items = [];
    for (const v of res.ids) {
      const [k, id] = v.split(':');
      const d = JSON.parse(JSON.stringify(await A().api((k === 't' ? 'templates/' : 'projects/') + id)));
      delete d.chat; if (d.versions) d.versions = d.versions.filter((x) => x.named).slice(-3);
      if (res.lock) { d.meta = Object.assign({}, d.meta, { clientLocked: true }); (d.layers || []).forEach((l) => { if (l.type === 'text' || (l.type === 'image' && (l.role === 'photo' || l.role === 'frame'))) l.lockPos = true; else l.locked = true; }); }
      items.push({ kind: k, doc: d });
    }
    const assets = await inlineAssets(items);
    const pkg = { format: 'tasarim-studyosu-paket', version: 1, created: Date.now(), brand: brand().name || '', items, assets };
    R.download(new Blob([JSON.stringify(pkg)], { type: 'application/json' }), (items.length === 1 ? (items[0].doc.name || 'sablon') : 'sablon-paketi').replace(/[^\wçğıöşüÇĞİÖŞÜ-]+/g, '-') + '.tasarim');
  };
  P5.importPackage = async function (file) {
    let pkg; try { pkg = JSON.parse(await file.text()); } catch (e) { return toast('Paket okunamadı', true); }
    if (!pkg || pkg.format !== 'tasarim-studyosu-paket' || !Array.isArray(pkg.items)) return toast('Bu dosya bir Tasarım Stüdyosu paketi değil', true);
    const map = {};
    for (const [u, data] of Object.entries(pkg.assets || {})) { if (typeof data === 'string' && data.startsWith('data:image/')) map[u] = await upload(data, u.split('/').pop()); }
    const swap = (o) => { if (!o || typeof o !== 'object') return; for (const k in o) { const v = o[k]; if (typeof v === 'string' && map[v]) o[k] = map[v]; else if (typeof v === 'object') swap(v); } };
    let first = null, n = 0;
    for (const it of pkg.items) {
      const d = it.doc; swap(d); delete d.id;
      if (it.kind === 't') { try { await A().api('templates', { body: d }); n++; } catch (e) {} continue; }
      const p = Object.assign(A().newProject(d.width, d.height, d.name), d); R.normalize(p); await A().saveProject(p); n++; if (!first) first = p;
    }
    toast(`${n} tasarım içe aktarıldı`);
    if (first) A().go('editor', first.id);
  };

  // =====================================================================
  // 7) ÇOK SAYFALI BELGE: sayfa şeridi, sayfa ekle, numara, sunum, PDF
  // =====================================================================
  const groupOf = (p) => p && p.meta && (p.meta.pageGroup || p.meta.pdfGroup);
  async function groupPages(g) { let list = []; try { list = await A().api('projects'); } catch (e) {} return list.filter((p) => p.meta && (p.meta.pageGroup === g || p.meta.pdfGroup === g)).sort((a, b) => (a.meta.page || 0) - (b.meta.page || 0)); }
  async function renumber(g) {
    const ps = await groupPages(g);
    for (let i = 0; i < ps.length; i++) {
      const p = await A().api('projects/' + ps[i].id); R.normalize(p);
      let ch = (p.meta.page !== i + 1) || p.meta.pages !== ps.length;
      p.meta.page = i + 1; p.meta.pages = ps.length; p.meta.pageGroup = g;
      p.layers.forEach((l) => { if (l.role === 'pagenum') { const t = (l.numFmt || '{n} / {t}').replace('{n}', i + 1).replace('{t}', ps.length); if (l.text !== t) { l.text = t; ch = true; } } });
      if (ch) { if (A().S.project && A().S.project.id === p.id) { Object.assign(A().S.project.meta, p.meta); A().S.project.layers.forEach((l) => { if (l.role === 'pagenum') l.text = (l.numFmt || '{n} / {t}').replace('{n}', i + 1).replace('{t}', ps.length); }); } else await A().saveProject(p); }
    }
  }
  P5.makeMultiPage = async function () {
    const p = A().S.project; if (!p) return;
    p.meta = p.meta || {}; if (!groupOf(p)) { p.meta.pageGroup = 'doc-' + Date.now().toString(36); p.meta.page = 1; p.meta.pages = 1; }
    if (E()) E().commit(); await A().saveProject(p); P5.mountPages(document.querySelector('.page-editor'), p); toast('Çok sayfalı belgeye çevrildi — alttaki şeritten sayfa ekle');
  };
  P5.mountPages = async function (page, p) {
    if (!page) return;
    const old = $('.pg-bar', page); if (old) old.remove();
    const g = groupOf(p); if (!g) return;
    const bar = document.createElement('div'); bar.className = 'pg-bar';
    const host = $('.ed-main', page) || $('.editor', page) || page; host.appendChild(bar);
    const draw = async () => {
      const ps = await groupPages(g);
      bar.innerHTML = `<div class="pg-list">${ps.map((x, i) => `<button class="pg-it${x.id === p.id ? ' on' : ''}" data-id="${x.id}" title="Sayfa ${i + 1}">${x.thumb ? `<img src="${x.thumb}" alt="">` : ''}<span>${i + 1}</span></button>`).join('')}<button class="pg-add" title="Sayfa ekle">${icon('plus')}</button></div>
        <div class="pg-acts"><button class="btn ghost sm" data-pg="left" title="Sola taşı">‹</button><button class="btn ghost sm" data-pg="right" title="Sağa taşı">›</button><button class="btn ghost sm" data-pg="num" title="Sayfa numarası ekle">#</button><button class="btn ghost sm" data-pg="del" title="Bu sayfayı sil">${icon('trash')}</button><button class="btn ghost sm" data-pg="show">${icon('play')}<span>Sunum</span></button><button class="btn sm" data-pg="pdf">${icon('download')}<span>PDF</span></button></div>`;
      const save = async () => { if (E()) E().flush(); await A().saveProject(A().S.project); };
      $$('.pg-it', bar).forEach((b) => (b.onclick = async () => { if (b.dataset.id === p.id) return; await save(); A().go('editor', b.dataset.id); }));
      $('.pg-add', bar).onclick = async () => {
        const v = await UI().dialog(`<div class="d-body"><h3>Sayfa ekle</h3></div><div class="cmdk"><div class="list"><div class="it" data-v="dup">${icon('copy')}<span>Bu sayfanın kopyası</span><small>aynı düzen, yazıları sonra değiştir</small></div><div class="it" data-v="blank">${icon('square')}<span>Boş sayfa</span><small>aynı ölçü ve arka plan</small></div></div></div>`, { onOpen: (box, close) => $$('.it', box).forEach((it) => (it.onclick = () => close(it.dataset.v))) });
        if (!v) return; await save();
        const cur = A().S.project, np = A().newProject(cur.width, cur.height, (cur.name || 'Belge').replace(/ — sayfa \d+$/, '') + ' — sayfa ' + (ps.length + 1));
        np.background = JSON.parse(JSON.stringify(cur.background));
        if (v === 'dup') np.layers = JSON.parse(JSON.stringify(cur.layers)).map((l) => Object.assign(l, { id: R.uid() }));
        else np.layers = JSON.parse(JSON.stringify(cur.layers.filter((l) => l.role === 'pagenum' || l.role === 'bgpattern'))).map((l) => Object.assign(l, { id: R.uid() }));
        np.meta = { pageGroup: g, page: ps.length + 1, pages: ps.length + 1 };
        R.normalize(np); await A().saveProject(np); await renumber(g); A().go('editor', np.id);
      };
      $$('[data-pg]', bar).forEach((b) => (b.onclick = async () => {
        const k = b.dataset.pg; await save();
        const list = await groupPages(g), i = list.findIndex((x) => x.id === p.id);
        if (k === 'left' || k === 'right') { const j = k === 'left' ? i - 1 : i + 1; if (j < 0 || j >= list.length) return; const a = await A().api('projects/' + list[i].id), c = await A().api('projects/' + list[j].id); a.meta.page = j + 1; c.meta.page = i + 1; await A().api('projects', { body: c }); if (A().S.project.id === a.id) A().S.project.meta.page = j + 1; await A().saveProject(A().S.project.id === a.id ? A().S.project : a); await renumber(g); draw(); }
        if (k === 'del') { if (list.length < 2) return toast('Belgede en az bir sayfa kalmalı', true); if (!(await UI().confirmBox('Bu sayfa silinsin mi?', 'Bu işlem geri alınamaz.'))) return; await A().api('projects/' + p.id, { method: 'DELETE' }); const nx = list[i + 1] || list[i - 1]; await renumber(g); A().go('editor', nx.id); }
        if (k === 'num') { const ed = E(); if (!ed) return; const d = ed.doc, fs = Math.min(d.width, d.height) * 0.022; if (d.layers.some((l) => l.role === 'pagenum')) return toast('Bu sayfada zaten sayfa numarası var'); for (const x of list) { const q = x.id === p.id ? d : await A().api('projects/' + x.id); R.normalize(q); if (q.layers.some((l) => l.role === 'pagenum')) continue; q.layers.push(R.normalize({ width: 1, height: 1, layers: [{ type: 'text', name: 'Sayfa no', role: 'pagenum', numFmt: '{n} / {t}', text: '', x: q.width - q.width * 0.06 - fs * 6, y: q.height - q.height * 0.045, w: fs * 6, fontSize: fs, fill: '#6B7280', align: 'right', fontFamily: 'Segoe UI' }] }).layers[0]); if (x.id !== p.id) await A().saveProject(q); } ed.commit(); await save(); await renumber(g); toast('Tüm sayfalara numara eklendi'); }
        if (k === 'pdf') { toast('PDF hazırlanıyor…'); const docs = []; for (const x of list) { const q = x.id === p.id ? A().S.project : await A().api('projects/' + x.id); R.normalize(q); await R.ensureImageSizes(q).catch(() => {}); docs.push(q); } R.download(await T.multiPagePDF(docs), (p.name || 'belge').replace(/ — sayfa \d+$/, '').replace(/\s+/g, '-') + '.pdf'); }
        if (k === 'show') P5.present(list.map((x) => x.id), i);
      }));
    };
    draw();
  };
  P5.present = async function (ids, start = 0) {
    const ov = document.createElement('div'); ov.className = 'present'; ov.innerHTML = '<div class="pr-stage"></div><div class="pr-hud"><span></span><button data-x>Kapat (Esc)</button></div>'; document.body.appendChild(ov);
    try { await ov.requestFullscreen(); } catch (e) {}
    const cache = {}; let i = start;
    const get = async (id) => cache[id] || (cache[id] = await (async () => { const p = await A().api('projects/' + id); R.normalize(p); await R.ensureImageSizes(p).catch(() => {}); return R.thumbnail(p, 1920); })());
    const show = async () => { const src = await get(ids[i]); const st = $('.pr-stage', ov); st.innerHTML = `<img src="${src}" alt="">`; window.Motion && window.Motion.animate(st.firstChild, { opacity: [0, 1], scale: [0.985, 1] }, { stiffness: 300, damping: 30 }); $('.pr-hud span', ov).textContent = `${i + 1} / ${ids.length}`; if (ids[i + 1]) get(ids[i + 1]); };
    const close = () => { document.removeEventListener('keydown', key, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); ov.remove(); };
    const key = (e) => { if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); if (i < ids.length - 1) { i++; show(); } } if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); if (i > 0) { i--; show(); } } if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key, true);
    ov.onclick = (e) => { if (e.target.closest('[data-x]')) return close(); const r = ov.getBoundingClientRect(); if (e.clientX > r.width / 2) { if (i < ids.length - 1) { i++; show(); } } else if (i > 0) { i--; show(); } };
    show();
  };

  // =====================================================================
  // 8) KUTU KESİM ŞABLONU + KAVANOZ SARGISI
  // =====================================================================
  function tuckBox(L, W, H, glue = 15, tuck = 15) {
    const x0 = 0, x1 = glue, x2 = x1 + W, x3 = x2 + L, x4 = x3 + W, x5 = x4 + L;
    const Tt = W + tuck + 2, Bt = Tt + H, d = Math.min(W * 0.85, W - 2), r = Math.min(4, tuck / 3);
    const P = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('');
    const cut = P([[x1, Tt], [x1 + 1, Tt - d], [x2 - 4, Tt - d], [x2, Tt], [x3, Tt], [x3 + 4, Tt - d], [x4 - 1, Tt - d], [x4, Tt], [x4, Tt - W], [x4 + 2, Tt - W], [x4 + 2, Tt - W - tuck + r], [x4 + 2 + r, Tt - W - tuck], [x5 - 2 - r, Tt - W - tuck], [x5 - 2, Tt - W - tuck + r], [x5 - 2, Tt - W], [x5, Tt - W], [x5, Bt], [x4, Bt], [x4 - 1, Bt + d], [x3 + 4, Bt + d], [x3, Bt], [x3, Bt + W], [x3 - 2, Bt + W], [x3 - 2, Bt + W + tuck - r], [x3 - 2 - r, Bt + W + tuck], [x2 + 2 + r, Bt + W + tuck], [x2 + 2, Bt + W + tuck - r], [x2 + 2, Bt + W], [x2, Bt + W], [x2, Bt], [x2 - 4, Bt + d], [x1 + 1, Bt + d], [x1, Bt], [x0, Bt - 5], [x0, Tt + 5], [x1, Tt]]) + 'Z';
    const fold = [[x1, Tt, x1, Bt], [x2, Tt, x2, Bt], [x3, Tt, x3, Bt], [x4, Tt, x4, Bt], [x1, Tt, x2, Tt], [x3, Tt, x5, Tt], [x4, Tt - W, x5, Tt - W], [x1, Bt, x4, Bt], [x2, Bt + W, x3, Bt + W]].map(([a, b, c, e]) => `M${a} ${b}L${c} ${e}`).join('');
    const panels = [['Yan 1', x1, Tt, W, H], ['Ön yüz', x2, Tt, L, H], ['Yan 2', x3, Tt, W, H], ['Arka yüz', x4, Tt, L, H], ['Üst kapak', x4, Tt - W, L, W], ['Alt kapak', x2, Bt, L, W]];
    return { cut, fold, panels, w: x5, h: Bt + W + tuck + 2 };
  }
  P5.boxDialog = async function () {
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('box')} Kutu ve ambalaj kesim şablonu</h3>
      <div class="seg" id="bxT" style="margin-bottom:10px"><button data-t="tuck" class="on">Kapaklı karton kutu</button><button data-t="jar">Kavanoz / şişe sargı etiketi</button></div>
      <div id="bxF"></div><svg id="bxP" class="bx-prev" viewBox="0 0 100 100"></svg>
      <p class="muted" style="font-size:12px;margin:6px 0 0">Kırmızı: kesim hattı · mavi kesikli: katlama hattı. Ölçüler kutunun <b>iç</b> ölçüsüdür (mm). Matbaa için kesim hattını ayrı vektör PDF olarak da indirebilirsin.</p></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" id="bxPdf">${icon('download')}Kesim hattı PDF</button><button class="btn primary" id="bxOk">${icon('plus')}Tasarım alanını aç</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        let t = 'tuck';
        const v = (id, d) => +($('#' + id, box) ? $('#' + id, box).value : d) || d;
        const form = () => { $('#bxF', box).innerHTML = t === 'tuck' ? `<div class="ct-grid2"><label class="fld"><span>En (ön yüz genişliği) mm</span><input class="inp" type="number" id="bxL" value="70"></label><label class="fld"><span>Derinlik (yan) mm</span><input class="inp" type="number" id="bxW" value="40"></label><label class="fld"><span>Yükseklik mm</span><input class="inp" type="number" id="bxH" value="120"></label><label class="fld"><span>Yapıştırma payı mm</span><input class="inp" type="number" id="bxG" value="15"></label></div>` : `<div class="ct-grid2"><label class="fld"><span>Kavanoz çapı mm</span><input class="inp" type="number" id="bxD" value="80"></label><label class="fld"><span>Etiket yüksekliği mm</span><input class="inp" type="number" id="bxJH" value="60"></label><label class="fld"><span>Bindirme payı mm</span><input class="inp" type="number" id="bxO" value="8"></label><label class="fld"><span>Kaplama</span><select class="inp" id="bxCov"><option value="1">Tam sargı</option><option value="0.5">Yarım (ön yüz)</option><option value="0.33">Üçte bir</option></select></label></div>`; $$('input,select', $('#bxF', box)).forEach((i) => (i.oninput = prev)); prev(); };
        const geo = () => { if (t === 'tuck') return tuckBox(v('bxL', 70), v('bxW', 40), v('bxH', 120), v('bxG', 15)); const D = v('bxD', 80), hh = v('bxJH', 60), ov = v('bxO', 8), cov = +($('#bxCov', box) ? $('#bxCov', box).value : 1), w = Math.PI * D * cov + (cov === 1 ? ov : 0); return { cut: `M0 0H${w}V${hh}H0Z`, fold: cov === 1 ? `M${w - ov} 0V${hh}` : '', panels: cov === 1 ? [['Ön yüz', w / 4, 0, w / 2 - ov / 2, hh], ['Bindirme', w - ov, 0, ov, hh]] : [['Ön yüz', 0, 0, w, hh]], w, h: hh, jar: { D, hh, ov, cov } }; };
        const prev = () => { const g = geo(), p = Math.max(g.w, g.h) * 0.04; $('#bxP', box).setAttribute('viewBox', `${-p} ${-p} ${g.w + 2 * p} ${g.h + 2 * p}`); $('#bxP', box).innerHTML = g.panels.map(([n, x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(226,25,124,.06)"/><text x="${x + w / 2}" y="${y + h / 2}" font-size="${Math.min(w, h) * 0.13}" text-anchor="middle" fill="#9aa">${n}</text>`).join('') + `<path d="${g.cut}" fill="none" stroke="#EF4444" stroke-width="${Math.max(g.w, g.h) / 300}"/><path d="${g.fold}" fill="none" stroke="#3B82F6" stroke-dasharray="${Math.max(g.w, g.h) / 120}" stroke-width="${Math.max(g.w, g.h) / 400}"/>`; };
        $$('#bxT button', box).forEach((b) => (b.onclick = () => { t = b.dataset.t; $$('#bxT button', box).forEach((x) => x.classList.toggle('on', x === b)); form(); }));
        $('#bxOk', box).onclick = () => close({ g: geo(), t });
        $('#bxPdf', box).onclick = () => R.download(dieVectorPDF(geo()), 'kesim-hatti.pdf');
        form();
      },
    });
    if (!res) return;
    const g = res.g, ppm = Math.min(10, 4200 / Math.max(g.w, g.h)), M = 6;
    const W = Math.round((g.w + 2 * M) * ppm), H = Math.round((g.h + 2 * M) * ppm), X = (v) => (v + M) * ppm;
    const shift = (d) => window.Importers.absPath(d, new DOMMatrix().translate(M * ppm, M * ppm).scale(ppm));
    const p = A().newProject(W, H, res.t === 'tuck' ? `Kutu ${g.panels[1][3]}×${g.panels[0][3]}×${g.panels[1][4]} mm` : `Kavanoz etiketi ${Math.round(g.w)}×${Math.round(g.h)} mm`);
    p.background = '#FFFFFF';
    const L = [];
    g.panels.forEach(([n, x, y, w, h]) => { if (n === 'Bindirme') return; L.push({ type: 'rect', name: n + ' (tasarım alanı)', role: 'panel', x: X(x), y: X(y), w: w * ppm, h: h * ppm, fill: '#FFFFFF' }); L.push({ type: 'text', name: n + ' etiketi', role: 'guide-label', text: n, x: X(x), y: X(y) + (h * ppm) / 2 - 14, w: w * ppm, fontSize: Math.max(14, Math.min(w, h) * ppm * 0.06), fill: '#CBD5E1', align: 'center', fontFamily: 'Segoe UI', locked: true }); });
    const cd = shift(g.cut), cb = window.Importers.pathBox(cd);
    L.push({ type: 'path', name: 'Kesim hattı (baskıdan önce gizle)', role: 'die', d: window.Importers.shiftPath(cd, cb.x, cb.y), vw: cb.width, vh: cb.height, x: cb.x, y: cb.y, w: cb.width, h: cb.height, fill: 'none', stroke: '#EF4444', strokeWidth: Math.max(1.5, ppm * 0.25), locked: true });
    if (g.fold) { const fd = shift(g.fold), fb = window.Importers.pathBox(fd); L.push({ type: 'path', name: 'Katlama hattı (baskıdan önce gizle)', role: 'fold', d: window.Importers.shiftPath(fd, fb.x, fb.y), vw: Math.max(1, fb.width), vh: Math.max(1, fb.height), x: fb.x, y: fb.y, w: Math.max(1, fb.width), h: Math.max(1, fb.height), fill: 'none', stroke: '#3B82F6', strokeWidth: Math.max(1, ppm * 0.2), dash: true, locked: true }); }
    p.layers = L;
    p.meta = { print: { wmm: +(g.w + 2 * M).toFixed(1), hmm: +(g.h + 2 * M).toFixed(1) }, mm: { w: +(g.w + 2 * M).toFixed(1), h: +(g.h + 2 * M).toFixed(1) }, box: { kind: res.t, ppm, M, panels: g.panels, cut: g.cut, fold: g.fold, w: g.w, h: g.h, jar: g.jar }, guides: g.panels.flatMap(([, x, y, w, h]) => [{ x: X(x) }, { x: X(x + w) }, { y: X(y) }, { y: X(y + h) }]).filter((v, i, a) => a.findIndex((u) => JSON.stringify(u) === JSON.stringify(v)) === i) };
    R.normalize(p); await A().saveProject(p); A().go('editor', p.id);
    setTimeout(() => toast('Her yüzü kendi alanında tasarla. Baskıdan önce kesim/katlama katmanlarını gizle; matbaaya kesim hattı PDF\'ini ayrıca ver.'), 900);
  };
  function dieVectorPDF(g) {
    const M = 10, pt = (mm) => mm * 72 / 25.4, Wp = pt(g.w + 2 * M), Hp = pt(g.h + 2 * M);
    const toPdf = (d, stroke) => { const cmds = []; const re = /([MLHVZ])([^MLHVZ]*)/gi; let m, cx = 0, cy = 0; while ((m = re.exec(d))) { const c = m[1].toUpperCase(), n = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : []; if (c === 'M' || c === 'L') { cx = n[0]; cy = n[1]; cmds.push(`${pt(cx + M).toFixed(2)} ${(Hp - pt(cy + M)).toFixed(2)} ${c === 'M' ? 'm' : 'l'}`); } else if (c === 'H') { cx = n[0]; cmds.push(`${pt(cx + M).toFixed(2)} ${(Hp - pt(cy + M)).toFixed(2)} l`); } else if (c === 'V') { cy = n[0]; cmds.push(`${pt(cx + M).toFixed(2)} ${(Hp - pt(cy + M)).toFixed(2)} l`); } else if (c === 'Z') cmds.push('h'); } return cmds.join('\n') + '\n' + stroke + '\n'; };
    const content = `q 0.5 w 0 1 1 0 K\n/CS0 CS 1 SCN\n${toPdf(g.cut, 'S')}Q\nq 0.4 w [3 2] 0 d 1 0 0 0 K\n${toPdf(g.fold || '', 'S')}Q\nBT /F1 7 Tf 0 0 0 1 k ${pt(M).toFixed(1)} ${(pt(M) / 2).toFixed(1)} Td (Kesim: CutContour  -  Katlama: kesikli) Tj ET\n`;
    const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${Wp.toFixed(2)} ${Hp.toFixed(2)}] /Resources << /ColorSpace << /CS0 [/Separation /CutContour /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>] >> /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>`, `<< /Length ${content.length} >>\nstream\n${content}endstream`];
    let out = '%PDF-1.4\n', xref = []; objs.forEach((o, i) => { xref.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xo = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + xref.map((x) => String(x).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xo}\n%%EOF\n`;
    return new Blob([out], { type: 'application/pdf' });
  }

  // =====================================================================
  // 9) 3B AMBALAJ ÖNİZLEME (döndürülebilir kutu / kavanoz)
  // =====================================================================
  P5.preview3D = async function (d) {
    d = d || (A().S.project); if (!d) return;
    const dd = Object.assign({}, d, { layers: (d.layers || []).filter((l) => !['die', 'fold', 'guide-label'].includes(l.role)) });
    const full = await R.exportCanvas(dd, Math.min(1, 1600 / Math.max(d.width, d.height)));
    const sc = full.width / d.width;
    const crop = (x, y, w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc)); c.getContext('2d').drawImage(full, x * sc, y * sc, w * sc, h * sc, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.9); };
    const bx = d.meta && d.meta.box;
    let faces = null, jar = null;
    if (bx && bx.kind === 'tuck') { const X = (v) => (v + bx.M) * bx.ppm, f = Object.fromEntries(bx.panels.map(([n, x, y, w, h]) => [n, crop(X(x), X(y), w * bx.ppm, h * bx.ppm)])); const [, , , L, H] = bx.panels[1], Wd = bx.panels[0][3]; faces = { L, W: Wd, H, front: f['Ön yüz'], back: f['Arka yüz'], left: f['Yan 1'], right: f['Yan 2'], top: f['Üst kapak'], bottom: f['Alt kapak'] }; }
    const pal = d.background && typeof d.background === 'string' ? d.background : '#E5E7EB';
    await UI().dialog(`<div class="d-body"><h3>${icon('box')} 3B önizleme</h3>
      <div class="seg" id="p3T" style="margin-bottom:8px"><button data-t="box" class="${!bx || bx.kind === 'tuck' ? 'on' : ''}">Kutu</button><button data-t="jar" class="${bx && bx.kind === 'jar' ? 'on' : ''}">Kavanoz</button><button data-t="bottle">Şişe</button><button data-t="bag">Poşet</button></div>
      <div class="p3-stage" id="p3S"><div class="p3-scene" id="p3C"></div></div>
      <div class="tb-opts"><label class="switch"><input type="checkbox" id="p3R" checked>Kendiliğinden dön</label><label class="color" style="width:auto"><input type="color" id="p3B" value="#E9E6E0"><span>Zemin</span></label><span class="muted" style="font-size:12px">Sürükleyerek çevir</span></div></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box) => {
        const scene = $('#p3C', box), stage = $('#p3S', box);
        let ry = -28, rx = -12, auto = true, raf = 0, kind = $('#p3T .on', box).dataset.t;
        const build = () => {
          const S = Math.min(stage.clientWidth, 420);
          if (kind === 'box') {
            const f = faces || { L: d.width, W: d.width * 0.35, H: d.height, front: full.toDataURL('image/jpeg', 0.9) };
            const k = (S * 0.62) / Math.max(f.L, f.H, f.W * 1.4), L = f.L * k, W = f.W * k, H = f.H * k, side = (src) => src ? `background-image:url(${src})` : `background:${pal};filter:brightness(.9)`;
            scene.innerHTML = `<div class="p3-obj" style="width:${L}px;height:${H}px">
              <i style="width:${L}px;height:${H}px;${side(f.front)};transform:translateZ(${W / 2}px)"></i>
              <i style="width:${L}px;height:${H}px;${side(f.back)};transform:rotateY(180deg) translateZ(${W / 2}px)"></i>
              <i style="width:${W}px;height:${H}px;left:${(L - W) / 2}px;${side(f.right)};transform:rotateY(90deg) translateZ(${L / 2}px)"></i>
              <i style="width:${W}px;height:${H}px;left:${(L - W) / 2}px;${side(f.left)};transform:rotateY(-90deg) translateZ(${L / 2}px)"></i>
              <i style="width:${L}px;height:${W}px;top:${(H - W) / 2}px;${side(f.top)};transform:rotateX(90deg) translateZ(${H / 2}px)"></i>
              <i style="width:${L}px;height:${W}px;top:${(H - W) / 2}px;${side(f.bottom)};transform:rotateX(-90deg) translateZ(${H / 2}px)"></i></div><div class="p3-shadow" style="width:${L * 1.3}px"></div>`;
          } else {
            const lab = full.toDataURL('image/jpeg', 0.9), N = 40, labAR = d.width / d.height;
            const isB = kind === 'bottle', isBag = kind === 'bag';
            if (isBag) { const h = S * 0.72, w = h * Math.min(0.8, labAR); scene.innerHTML = `<div class="p3-obj" style="width:${w}px;height:${h}px"><i class="bag" style="width:${w}px;height:${h}px;background-image:url(${lab});transform:translateZ(6px)"></i><i class="bag" style="width:${w}px;height:${h}px;background:${pal};transform:rotateY(180deg) translateZ(6px)"></i><i style="width:12px;height:${h}px;left:${w / 2 - 6}px;background:#ddd;transform:rotateY(90deg) translateZ(${w / 2}px)"></i><i style="width:12px;height:${h}px;left:${w / 2 - 6}px;background:#ddd;transform:rotateY(-90deg) translateZ(${w / 2}px)"></i><i class="zip" style="width:${w}px;height:${h * 0.05}px;transform:translateZ(6.5px) translateY(${h * 0.04}px)"></i></div><div class="p3-shadow" style="width:${w * 1.2}px"></div>`; return; }
            const R0 = S * (isB ? 0.15 : 0.24), cov = (bx && bx.jar && bx.jar.cov) || (labAR > 2.2 ? 1 : 0.5), Hb = isB ? S * 0.82 : S * 0.6, lh = Math.min(Hb * (isB ? 0.45 : 0.7), (2 * Math.PI * R0 * cov) / labAR), sw = (2 * Math.PI * R0) / N + 0.6;
            const nLab = Math.round(N * cov), start = Math.round((N - nLab) / 2);
            let h = '';
            for (let i = 0; i < N; i++) { const a = (i / N) * 360, j = i - start, onL = j >= 0 && j < nLab; h += `<i class="${onL ? 'lab' : 'glass'}" style="width:${sw}px;height:${onL ? lh : Hb * 0.86}px;left:${-sw / 2}px;top:${onL ? (Hb - lh) / 2 : Hb * 0.07}px;${onL ? `background-image:url(${lab});background-size:${sw * nLab}px ${lh}px;background-position:${-j * (sw - 0.6)}px 0` : ''};transform:rotateY(${a + 180 - (start + nLab / 2) * (360 / N) + 180}deg) translateZ(${R0}px)"></i>`; }
            const lid = isB ? `<i class="cap" style="width:${R0 * 0.8}px;height:${Hb * 0.16}px;left:${-R0 * 0.4}px;top:${-Hb * 0.12}px"></i>` : `<i class="lid" style="width:${R0 * 2.04}px;height:${R0 * 2.04}px;left:${-R0 * 1.02}px;top:${-R0 * 1.02 + Hb * 0.04}px;transform:rotateX(90deg)"></i><i class="lidband" style="width:${R0 * 2.04}px;height:${Hb * 0.09}px;left:${-R0 * 1.02}px;top:${Hb * 0.0}px"></i>`;
            scene.innerHTML = `<div class="p3-obj cyl" style="width:0;height:${Hb}px">${h}${lid}</div><div class="p3-shadow" style="width:${R0 * 2.6}px"></div>`;
          }
        };
        const apply = () => { const o = $('.p3-obj', scene); if (o) o.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
        const loop = () => { if (!document.body.contains(stage)) return; if (auto) { ry += 0.35; apply(); } raf = requestAnimationFrame(loop); };
        let drag = null;
        stage.onpointerdown = (e) => { stage.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, ry, rx }; };
        stage.onpointermove = (e) => { if (!drag) return; ry = drag.ry + (e.clientX - drag.x) * 0.5; rx = Math.max(-60, Math.min(60, drag.rx - (e.clientY - drag.y) * 0.4)); apply(); };
        stage.onpointerup = stage.onpointercancel = () => { drag = null; };
        $('#p3R', box).onchange = (e) => { auto = e.target.checked; };
        $('#p3B', box).oninput = (e) => { stage.style.background = e.target.value; };
        $$('#p3T button', box).forEach((b) => (b.onclick = () => { kind = b.dataset.t; $$('#p3T button', box).forEach((x) => x.classList.toggle('on', x === b)); build(); apply(); }));
        requestAnimationFrame(() => { build(); apply(); raf = requestAnimationFrame(loop); });
      },
    });
  };

  // =====================================================================
  // 10) ETİKET TABAKASI (A4'e dizip yazdır)
  // =====================================================================
  const SHEETS = [
    ['A4 · 21 etiket (63,5 × 38,1 mm)', 3, 7, 63.5, 38.1, 15.15, 7.2, 2.5, 0],
    ['A4 · 24 etiket (70 × 37 mm)', 3, 8, 70, 37, 0.5, 0, 0, 0],
    ['A4 · 14 etiket (99,1 × 38,1 mm)', 2, 7, 99.1, 38.1, 15.15, 4.65, 2.5, 0],
    ['A4 · 8 etiket (99,1 × 67,7 mm)', 2, 4, 99.1, 67.7, 13, 4.65, 2.5, 0],
    ['A4 · 40 etiket (52,5 × 29,7 mm)', 4, 10, 52.5, 29.7, 0, 0, 0, 0],
    ['A4 · 65 etiket (38,1 × 21,2 mm)', 5, 13, 38.1, 21.2, 10.7, 4.65, 2.5, 0],
    ['A4 · 12 kare (60 × 60 mm)', 3, 4, 60, 60, 28.5, 12, 3, 3],
    ['A4 · 6 büyük (99 × 93 mm)', 2, 3, 99, 93, 9, 6, 0, 0],
  ];
  P5.sheetDialog = async function (d) {
    d = d || A().S.project; if (!d) return;
    let list = []; try { list = await A().api('projects'); } catch (e) {}
    const res = await UI().dialog(`<div class="d-body"><h3>${icon('grid')} Etiket tabakası</h3><p class="muted" style="margin:0 0 8px;font-size:13px">Tasarımını hazır A4 etiket kâğıdına diz, yazıcıdan doğrudan bas. Yarım kullanılmış tabakalar için <b>atla</b> alanını kullan.</p>
      <div class="ct-grid2"><label class="fld"><span>Etiket kâğıdı</span><select class="inp" id="shK">${SHEETS.map((s, i) => `<option value="${i}">${s[0]}</option>`).join('')}<option value="c">Özel ölçü…</option></select></label>
      <label class="fld"><span>Kaç adet</span><input class="inp" type="number" id="shN" value="0" min="0"><small class="muted">0 = tabakayı doldur</small></label>
      <label class="fld"><span>Baştan atla (kullanılmış)</span><input class="inp" type="number" id="shS" value="0" min="0"></label>
      <label class="fld"><span>Yerleşim</span><select class="inp" id="shF"><option value="contain">Sığdır (kenar boşluğu kalabilir)</option><option value="cover">Doldur (kenarlar kırpılabilir)</option></select></label></div>
      <div id="shC" class="ct-grid2" hidden><label class="fld"><span>Sütun</span><input class="inp" type="number" id="cC" value="3"></label><label class="fld"><span>Satır</span><input class="inp" type="number" id="cR" value="8"></label><label class="fld"><span>Etiket eni mm</span><input class="inp" type="number" id="cW" value="70"></label><label class="fld"><span>Etiket boyu mm</span><input class="inp" type="number" id="cH" value="35"></label><label class="fld"><span>Üst boşluk mm</span><input class="inp" type="number" id="cT" value="8"></label><label class="fld"><span>Sol boşluk mm</span><input class="inp" type="number" id="cL" value="0"></label><label class="fld"><span>Yatay ara mm</span><input class="inp" type="number" id="cG" value="0"></label><label class="fld"><span>Dikey ara mm</span><input class="inp" type="number" id="cV" value="0"></label></div>
      <label class="fld"><span>Tasarımlar (birden çok seçersen sırayla dizilir)</span><div class="mp-list" style="max-height:22vh">${list.slice(0, 120).map((p) => `<label class="mp-it"><input type="checkbox" value="${esc(p.id)}" ${p.id === d.id ? 'checked' : ''}><img src="${esc(p.thumb || '')}" alt=""><span>${esc(p.name || 'Tasarım')}</span></label>`).join('')}</div></label>
      <label class="switch"><input type="checkbox" id="shL" checked>İnce kesim çerçevesi çiz (deneme baskısı için)</label>
      <canvas id="shP" class="sh-prev" width="420" height="594"></canvas></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="shGo">${icon('download')}PDF oluştur</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const spec = () => { const k = $('#shK', box).value; if (k !== 'c') return SHEETS[+k]; const n = (id) => +$('#' + id, box).value || 0; return ['Özel', n('cC'), n('cR'), n('cW'), n('cH'), n('cT'), n('cL'), n('cG'), n('cV')]; };
        const prev = () => { const [, c, r, w, h, t, l, g, v] = spec(), cv = $('#shP', box), x = cv.getContext('2d'), k = cv.width / 210; x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); const skip = +$('#shS', box).value || 0; let i = 0; for (let rr = 0; rr < r; rr++) for (let cc = 0; cc < c; cc++, i++) { const X = (l + cc * (w + g)) * k, Y = (t + rr * (h + v)) * k; x.fillStyle = i < skip ? '#eee' : 'rgba(226,25,124,.18)'; x.fillRect(X, Y, w * k, h * k); x.strokeStyle = '#bbb'; x.strokeRect(X, Y, w * k, h * k); } };
        $('#shK', box).onchange = () => { $('#shC', box).hidden = $('#shK', box).value !== 'c'; prev(); };
        $$('input', box).forEach((i) => i.addEventListener('input', prev));
        $('#shGo', box).onclick = () => close({ spec: spec(), n: +$('#shN', box).value || 0, skip: +$('#shS', box).value || 0, fit: $('#shF', box).value, ids: $$('.mp-list input:checked', box).map((i) => i.value), line: $('#shL', box).checked });
        prev();
      },
    });
    if (!res || !res.ids.length) return;
    const [, cols, rows, wmm, hmm, top, left, gx, gy] = res.spec, per = cols * rows;
    if (!(cols > 0 && rows > 0 && wmm > 0 && hmm > 0)) return toast('Etiket ölçülerini kontrol et', true);
    toast('Etiket tabakası hazırlanıyor…');
    const pt = (mm) => mm * 72 / 25.4, PW = 595.28, PH = 841.89;
    const imgs = [];
    for (const id of res.ids) {
      const p = id === d.id ? d : await A().api('projects/' + id); R.normalize(p); await R.ensureImageSizes(p).catch(() => {});
      const pxw = Math.round(wmm / 25.4 * 300), pxh = Math.round(hmm / 25.4 * 300);
      const c = document.createElement('canvas'); c.width = pxw; c.height = pxh; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, pxw, pxh);
      const s = res.fit === 'cover' ? Math.max(pxw / p.width, pxh / p.height) : Math.min(pxw / p.width, pxh / p.height);
      const src = await R.exportCanvas(p, s * 1.0001, '#ffffff');
      x.drawImage(src, (pxw - src.width) / 2, (pxh - src.height) / 2);
      imgs.push(new Uint8Array(await (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))).arrayBuffer()));
    }
    const total = res.n > 0 ? res.n : Math.max(1, per - res.skip);
    const slots = []; for (let k = 0; k < total; k++) slots.push(imgs[k % imgs.length] ? k % imgs.length : 0);
    const pages = []; let pos = res.skip;
    for (let k = 0; k < slots.length; k++) { const pi = Math.floor(pos / per); (pages[pi] = pages[pi] || []).push([pos % per, slots[k]]); pos++; }
    const enc = new TextEncoder(), objs = [], imgObj = [];
    objs.push('<< /Type /Catalog /Pages 2 0 R >>'); objs.push(null);
    imgs.forEach((u) => { imgObj.push(objs.length + 1); objs.push({ head: `<< /Type /XObject /Subtype /Image /Width ${Math.round(wmm / 25.4 * 300)} /Height ${Math.round(hmm / 25.4 * 300)} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${u.length} >>\nstream\n`, data: u }); });
    const kids = [];
    pages.forEach((pg) => {
      let cs = '';
      (pg || []).forEach(([slot, ii]) => { const c = slot % cols, r = Math.floor(slot / cols), X = pt(left + c * (wmm + gx)), Y = PH - pt(top + r * (hmm + gy)) - pt(hmm); cs += `q ${pt(wmm).toFixed(2)} 0 0 ${pt(hmm).toFixed(2)} ${X.toFixed(2)} ${Y.toFixed(2)} cm /I${ii} Do Q\n`; if (res.line) cs += `q 0.2 w 0.75 G ${X.toFixed(2)} ${Y.toFixed(2)} ${pt(wmm).toFixed(2)} ${pt(hmm).toFixed(2)} re S Q\n`; });
      const cb = enc.encode(cs), cid = objs.length + 1; objs.push({ head: `<< /Length ${cb.length} >>\nstream\n`, data: cb });
      kids.push(objs.length + 1); objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << ${imgObj.map((o, i) => `/I${i} ${o} 0 R`).join(' ')} >> >> /Contents ${cid} 0 R >>`);
    });
    objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
    const parts = [enc.encode('%PDF-1.4\n')]; let off = parts[0].length; const xref = [];
    objs.forEach((o, i) => { xref.push(off); const pre = enc.encode(`${i + 1} 0 obj\n`); const ch = typeof o === 'string' ? [pre, enc.encode(o + '\nendobj\n')] : [pre, enc.encode(o.head), o.data, enc.encode('\nendstream\nendobj\n')]; ch.forEach((c) => { parts.push(c); off += c.length; }); });
    let xr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; xref.forEach((o) => (xr += String(o).padStart(10, '0') + ' 00000 n \n')); xr += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${off}\n%%EOF\n`; parts.push(enc.encode(xr));
    R.download(new Blob(parts, { type: 'application/pdf' }), 'etiket-tabakasi.pdf');
    toast(`${slots.length} etiket, ${kids.length} sayfa. Yazdırırken “Gerçek boyut / %100” seç.`);
  };

  // =====================================================================
  // 11) MÜŞTERİ PORTALI + TALEPLER
  // =====================================================================
  const RS = { new: ['Yeni', '#F59E0B'], doing: ['Hazırlanıyor', '#3B82F6'], done: ['Tamamlandı', '#22C55E'] };
  const RV = { draft: 'Taslak', review: 'Onay bekliyor', changes: 'Düzeltme istendi', approved: 'Onaylandı' };
  P5.portalLink = async (client) => { let base = location.origin; try { const info = await A().api('info'); if (/localhost|127\.0\.0\.1/.test(base) && info.urls && info.urls[0]) base = info.urls[0].replace(/\/$/, ''); } catch (e) {} return `${base}/#/portal/${encodeURIComponent(client || '')}`; };
  P5.viewPortal = async function (page, id) {
    const client = decodeURIComponent(id || '').trim(), b = brand();
    document.body.classList.add('portal-mode');
    let ps = [], reqs = []; try { [ps, reqs] = await Promise.all([A().api('projects'), A().api('requests')]); } catch (e) {}
    const mine = ps.filter((p) => { const m = p.meta || {}; if (client) return (m.client || '').toLocaleLowerCase('tr-TR') === client.toLocaleLowerCase('tr-TR'); return m.review && m.review.status && m.review.status !== 'draft'; });
    const myReq = reqs.filter((r) => !client || (r.client || '').toLocaleLowerCase('tr-TR') === client.toLocaleLowerCase('tr-TR'));
    page.innerHTML = `<div class="portal">
      <header class="pt-head">${b.logo ? `<img src="${esc(b.logo)}" alt="">` : ''}<div><h1>${esc(b.name || 'Tasarım Stüdyosu')}</h1><p class="muted">${client ? `Merhaba ${esc(client)} — tasarımların ve taleplerin burada.` : 'Onay bekleyen tasarımlar ve talepler'}</p></div><button class="btn ghost sm" id="ptExit">${icon('x')}Portaldan çık</button></header>
      <section><h2>Tasarımlar</h2>${mine.length ? `<div class="pt-grid">${mine.map((p) => { const st = (p.meta.review && p.meta.review.status) || 'draft'; return `<div class="pt-card"><div class="th">${p.thumb ? `<img src="${p.thumb}" alt="">` : ''}</div><div class="meta"><b>${esc(p.name || 'Tasarım')}</b><span class="rv-pill" data-s="${st}">${RV[st] || ''}</span></div><div class="acts"><a class="btn sm primary" href="#/onizleme/${p.id}">${icon('eye')}İncele ve onayla</a>${st === 'approved' ? `<button class="btn sm" data-dl="${p.id}">${icon('download')}İndir</button>` : ''}</div></div>`; }).join('')}</div>` : '<p class="muted">Henüz paylaşılan tasarım yok.</p>'}</section>
      <section><h2>Yeni talep</h2><div class="pt-form">
        <label class="fld"><span>Ne istiyorsun?</span><input class="inp" id="rqT" placeholder="örn. Bayram indirimi için Instagram postu"></label>
        <label class="fld"><span>Ayrıntılar</span><textarea class="inp" id="rqD" rows="3" placeholder="Metinler, renkler, ölçü, örnekler…"></textarea></label>
        <div class="ct-grid2"><label class="fld"><span>Adın</span><input class="inp" id="rqN" value="${esc(client)}"></label><label class="fld"><span>Ne zamana?</span><input class="inp" type="date" id="rqW"></label></div>
        <div class="iconrow"><button class="btn" id="rqF">${icon('upload')}Dosya / fotoğraf ekle</button><span class="muted" id="rqFi" style="font-size:12px"></span><button class="btn primary" id="rqGo" style="margin-left:auto">${icon('send')}Talebi gönder</button></div></div></section>
      ${myReq.length ? `<section><h2>Taleplerin</h2><div class="rq-list">${myReq.map((r) => `<div class="rq-it"><span class="rq-st" style="--c:${(RS[r.status] || RS.new)[1]}">${(RS[r.status] || RS.new)[0]}</span><b>${esc(r.title)}</b><small>${new Date(r.at).toLocaleDateString('tr-TR')}${r.due ? ' · teslim ' + new Date(r.due + 'T00:00').toLocaleDateString('tr-TR') : ''}</small></div>`).join('')}</div></section>` : ''}
    </div>`;
    const files = [];
    $('#ptExit', page).onclick = () => { document.body.classList.remove('portal-mode'); A().go('pano'); };
    $$('[data-dl]', page).forEach((bt) => (bt.onclick = async () => { const p = await A().api('projects/' + bt.dataset.dl); R.normalize(p); await R.ensureImageSizes(p).catch(() => {}); R.download(await R.exportBlob(p, 'png', 2), (p.name || 'tasarim') + '.png'); }));
    $('#rqF', page).onclick = async () => { const fs = await pickFile('image/*,application/pdf', true); for (const f of fs || []) { if (f.size > 15e6) continue; files.push(await upload(await readURL(f), f.name)); } $('#rqFi', page).textContent = files.length ? files.length + ' dosya eklendi' : ''; };
    $('#rqGo', page).onclick = async () => {
      const t = $('#rqT', page).value.trim(); if (!t) return toast('Ne istediğini kısaca yaz', true);
      try { await A().api('requests', { body: { title: t, detail: $('#rqD', page).value, name: $('#rqN', page).value, client: client || $('#rqN', page).value, due: $('#rqW', page).value, files: files.filter((u) => u.startsWith('/uploads/')) } }); toast('Talebin iletildi, teşekkürler!'); A().onRoute(); }
      catch (e) { toast(e.message, true); }
    };
  };
  P5.requestsDialog = async function () {
    let reqs = [], ps = []; try { [reqs, ps] = await Promise.all([A().api('requests'), A().api('projects')]); } catch (e) {}
    const clients = [...new Set([...ps.map((p) => p.meta && p.meta.client).filter(Boolean), ...reqs.map((r) => r.client).filter(Boolean)])];
    await UI().dialog(`<div class="d-body"><h3>${icon('chat')} Müşteri talepleri ve portal</h3>
      <div class="rq-list">${reqs.length ? reqs.map((r) => `<div class="rq-it big"><div><b>${esc(r.title)}</b><small>${esc(r.client || r.name || 'Adsız')} · ${new Date(r.at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${r.due ? ' · teslim ' + new Date(r.due + 'T00:00').toLocaleDateString('tr-TR') : ''}</small>${r.detail ? `<p>${esc(r.detail)}</p>` : ''}${(r.files || []).length ? `<div class="rq-files">${r.files.map((u) => /\.pdf$/i.test(u) ? `<a href="${esc(u)}" target="_blank">PDF</a>` : `<a href="${esc(u)}" target="_blank"><img src="${esc(u)}" alt=""></a>`).join('')}</div>` : ''}</div><div class="seg">${Object.entries(RS).map(([k, [t]]) => `<button data-rq="${r.id}" data-s="${k}" class="${r.status === k ? 'on' : ''}">${t}</button>`).join('')}</div><button class="btn ghost sm" data-start="${r.id}">${icon('sparkle')}Tasarla</button></div>`).join('') : '<p class="muted">Henüz talep yok. Müşterine portal bağlantısını gönder; oradan talep bırakabilir.</p>'}</div>
      <h4 style="margin:14px 0 6px">Portal bağlantıları</h4><div class="pt-links">${clients.map((c) => `<button class="btn sm" data-pl="${esc(c)}">${icon('share')}${esc(c)}</button>`).join('')}<button class="btn sm" data-pl="">${icon('share')}Genel portal</button></div>
      <p class="muted" style="font-size:12px">Tasarımı müşteriye atamak için Editör → hiçbir şey seçili değilken → <b>Onay ve yorumlar</b> → Müşteri. Portal aynı Wi‑Fi'de açılır; PIN koyduysan müşteriye PIN'i de ver.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        $$('[data-rq]', box).forEach((b) => (b.onclick = async () => { await A().api('requests', { body: { id: b.dataset.rq, status: b.dataset.s } }); $$(`[data-rq="${b.dataset.rq}"]`, box).forEach((x) => x.classList.toggle('on', x === b)); }));
        $$('[data-start]', box).forEach((b) => (b.onclick = () => { const r = reqs.find((x) => x.id === b.dataset.start); close(); A().startPrompt(`${r.title}${r.detail ? '. ' + r.detail : ''}`); }));
        $$('[data-pl]', box).forEach((b) => (b.onclick = async () => { const l = await P5.portalLink(b.dataset.pl); try { await navigator.clipboard.writeText(l); } catch (e) {} toast('Bağlantı kopyalandı: ' + l); }));
      },
    });
  };

  // =====================================================================
  // 12) ÖZEL GÜNLER (Türkiye kampanya takvimi)
  // =====================================================================
  const nthDow = (y, m, dow, n) => { const d = new Date(y, m, 1); const add = (dow - d.getDay() + 7) % 7; return new Date(y, m, 1 + add + (n - 1) * 7); };
  const RELIGIOUS = { 2026: [['2026-03-20', 'Ramazan Bayramı'], ['2026-05-27', 'Kurban Bayramı']], 2027: [['2027-03-09', 'Ramazan Bayramı'], ['2027-05-16', 'Kurban Bayramı']] };
  P5.specialDays = function (y) {
    const L = [[`${y}-01-01`, 'Yılbaşı', 'Yeni yıl kutlama postu'], [`${y}-02-14`, 'Sevgililer Günü', 'Sevgililer Günü kampanya postu'], [`${y}-03-08`, 'Dünya Kadınlar Günü', '8 Mart Dünya Kadınlar Günü kutlama postu'], [`${y}-04-23`, '23 Nisan', '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı kutlama postu'], [`${y}-05-01`, 'Emek ve Dayanışma Günü', '1 Mayıs kutlama postu'], [`${y}-05-19`, '19 Mayıs', '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı kutlama postu'], [ymd(nthDow(y, 4, 0, 2)), 'Anneler Günü', 'Anneler Günü kampanya postu'], [ymd(nthDow(y, 5, 0, 3)), 'Babalar Günü', 'Babalar Günü kampanya postu'], [`${y}-07-15`, '15 Temmuz', '15 Temmuz Demokrasi ve Milli Birlik Günü anma postu'], [`${y}-08-30`, '30 Ağustos', '30 Ağustos Zafer Bayramı kutlama postu'], [ymd(nthDow(y, 8, 1, 2)), 'Okula dönüş', 'Okula dönüş kampanyası postu'], [`${y}-10-16`, 'Dünya Gıda Günü', 'Dünya Gıda Günü postu'], [`${y}-10-29`, 'Cumhuriyet Bayramı', '29 Ekim Cumhuriyet Bayramı kutlama postu'], [`${y}-11-10`, '10 Kasım', '10 Kasım Atatürk\'ü anma postu, sade ve saygılı'], [`${y}-11-24`, 'Öğretmenler Günü', 'Öğretmenler Günü kutlama postu'], [ymd(new Date(nthDow(y, 10, 4, 4).getTime() + 864e5)), 'Efsane Cuma / Black Friday', 'Efsane Cuma büyük indirim kampanya postu'], [`${y}-12-12`, 'Yerli Malı Haftası', 'Yerli Malı Haftası postu (12-18 Aralık)'], [`${y}-12-31`, 'Yılbaşı gecesi', 'Yılbaşı kampanya postu']];
    (RELIGIOUS[y] || []).forEach(([d, n]) => { L.push([d, n, `${n} kutlama postu`]); const pd = new Date(d + 'T00:00'); pd.setDate(pd.getDate() - 1); L.push([ymd(pd), n + ' arifesi', `${n} için indirim/kampanya duyurusu`]); });
    return L.map(([date, name, prompt]) => ({ date, name, prompt }));
  };
  P5.dayName = (key) => { const y = +key.slice(0, 4); const d = P5.specialDays(y).find((x) => x.date === key); return d || null; };
  P5.upcoming = (days = 30) => { const now = new Date(), t0 = ymd(now), t1 = ymd(new Date(now.getTime() + days * 864e5)); return [...P5.specialDays(now.getFullYear()), ...P5.specialDays(now.getFullYear() + 1)].filter((d) => d.date >= t0 && d.date <= t1).sort((a, b) => a.date.localeCompare(b.date)); };

  // =====================================================================
  // 13) YEDEKLEME / GERİ YÜKLEME (tek dosya) + otomatik klasör yedeği
  // =====================================================================
  async function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf), out = {};
    let eocd = -1; for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('ZIP okunamadı');
    let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
    for (let k = 0; k < n; k++) {
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
      const lnl = dv.getUint16(lo + 26, true), lel = dv.getUint16(lo + 28, true), ds = lo + 30 + lnl + lel;
      let data = u8.subarray(ds, ds + csize);
      if (method === 8) data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      if (!name.endsWith('/')) out[name] = data;
      p += 46 + nl + el + cl;
    }
    return out;
  }
  P5.backupDownload = async function () {
    toast('Yedek hazırlanıyor…');
    const files = [], enc = new TextEncoder(), urls = new Set();
    const collect = (o) => { if (!o || typeof o !== 'object') return; for (const k in o) { const v = o[k]; if (typeof v === 'string' && v.startsWith('/uploads/')) urls.add(v); else if (typeof v === 'object') collect(v); } };
    const ps = await A().api('projects'), ts = await A().api('templates').catch(() => []);
    const full = { projects: [], templates: [], brand: await A().api('brand').catch(() => ({})), requests: await A().api('requests').catch(() => []) };
    for (const p of ps) { const d = await A().api('projects/' + p.id); full.projects.push(d); collect(d); }
    for (const t of ts) { const d = await A().api('templates/' + t.id).catch(() => null); if (d) { full.templates.push(d); collect(d); } }
    collect(full.brand);
    files.push({ name: 'yedek.json', data: enc.encode(JSON.stringify({ format: 'tasarim-studyosu-yedek', version: 1, at: Date.now(), ...full })) });
    for (const u of urls) { try { files.push({ name: 'uploads/' + u.split('/').pop(), data: new Uint8Array(await (await fetch(u)).arrayBuffer()) }); } catch (e) {} }
    R.download(T.zip(files), `TasarimStudyosu-yedek-${ymd(new Date())}.zip`);
    toast(`${full.projects.length} tasarım, ${urls.size} görsel yedeklendi`);
  };
  P5.restoreBackup = async function () {
    const f = await pickFile('.zip,application/zip'); if (!f) return;
    let z; try { z = await unzip(await f.arrayBuffer()); } catch (e) { return toast(e.message, true); }
    if (!z['yedek.json']) return toast('Bu dosya bir Tasarım Stüdyosu yedeği değil', true);
    const y = JSON.parse(new TextDecoder().decode(z['yedek.json']));
    if (!(await UI().confirmBox('Yedek geri yüklensin mi?', `${(y.projects || []).length} tasarım ve ${(y.templates || []).length} şablon eklenecek. Var olan tasarımların silinmez; aynı tasarım varsa yedekteki haliyle güncellenir.`, 'Geri yükle'))) return;
    const busy = document.createElement('div'); busy.className = 'import-busy'; busy.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span><span>Geri yükleniyor…</span>'; document.body.appendChild(busy);
    try {
      const map = {};
      for (const [name, data] of Object.entries(z)) { if (!name.startsWith('uploads/')) continue; const ext = name.split('.').pop().toLowerCase(), mt = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', pdf: 'application/pdf' }[ext] || 'application/octet-stream'; map['/uploads/' + name.slice(8)] = await upload(await readURL(new Blob([data], { type: mt })), name.slice(8)); }
      const swap = (o) => { if (!o || typeof o !== 'object') return; for (const k in o) { const v = o[k]; if (typeof v === 'string' && map[v]) o[k] = map[v]; else if (typeof v === 'object') swap(v); } };
      for (const p of y.projects || []) { swap(p); await A().api('projects', { body: p }); }
      for (const t of y.templates || []) { swap(t); await A().api('templates', { body: t }).catch(() => {}); }
      if (y.brand && Object.keys(y.brand).length) { swap(y.brand); A().S.brand = await A().api('brand', { body: y.brand }).catch(() => A().S.brand); }
      busy.remove(); toast('Yedek geri yüklendi'); A().go('pano');
    } catch (e) { busy.remove(); toast('Geri yüklenemedi: ' + e.message, true); }
  };
  P5.settingsExtras = function (host, s) {
    if (!host) return;
    host.innerHTML = `<div class="panel card-sec"><h3>${icon('save')} Yedekleme</h3><p>Tüm tasarımlarını, şablonlarını, marka kitini ve görsellerini tek dosyada sakla ya da başka bilgisayara taşı.</p>
      <div class="iconrow" style="margin-bottom:${window.TS_CLOUD ? 0 : 14}px"><button class="btn" id="bkDl">${icon('download')}Yedek indir (.zip)</button><button class="btn" id="bkUp">${icon('upload')}Yedekten geri yükle</button></div>
      ${window.TS_CLOUD ? '' : `<div class="form-grid"><label class="field"><span>Otomatik yedek klasörü</span><input class="inp" id="bkDir" placeholder="örn. C:\\Users\\Ad\\Google Drive\\Yedek" value="${esc(s.backup_dir || '')}"></label><label class="switch" style="align-self:end"><input type="checkbox" id="bkDaily" ${s.backup_daily ? 'checked' : ''}>Her gün otomatik yedekle</label></div>
      <p class="muted" style="font-size:12.5px;margin:8px 0 0">Bilgisayarında <b>Google Drive</b> uygulaması kuruluysa onun klasörünü yaz: yedekler kendiliğinden Drive'a da gider. Son 14 yedek tutulur; API anahtarların yedeğe girmez.</p>
      <button class="btn sm" id="bkNow" style="margin-top:8px">${icon('save')}Şimdi klasöre yedekle</button>`}</div>
      <div class="panel card-sec"><h3>${icon('image')} Ücretsiz fotoğraf kütüphanesi</h3><p>Editörde Öğeler → <b>Ücretsiz fotoğraf</b> ile ürün, arka plan ve yaşam tarzı fotoğrafı ara. Fotoğraflar <b>Pexels</b>'ten gelir; ticari kullanım ücretsiz, kaynak gösterme zorunlu değil.</p>
      <label class="field"><span>Pexels API anahtarı (ücretsiz)</span><input class="inp" id="pxKey" placeholder="pexels.com/api adresinden ücretsiz al" value="${esc(s.pexels_key || '')}" autocomplete="off"></label>
      <div class="iconrow" style="margin-top:8px"><a class="btn sm ghost" href="https://www.pexels.com/api/new/" target="_blank" rel="noopener">${icon('globe')}Anahtar al</a><button class="btn sm" id="pxSave">${icon('save')}Kaydet</button></div></div>
      <div class="panel card-sec"><h3>${icon('phone')} Telefona uygulama gibi kur</h3><p>Ana ekrana simgesiyle eklenir, tam ekran açılır.</p><button class="btn" id="insBtn">${icon('plus')}Ana ekrana ekle</button></div>`;
    $('#bkDl', host).onclick = () => P5.backupDownload();
    $('#pxSave', host).onclick = async () => { const v = $('#pxKey', host).value.trim(); try { if (window.TS_CLOUD) localStorage.setItem('ts_pexels', v); else await A().api('settings', { body: { pexels_key: v } }); toast('Fotoğraf kütüphanesi anahtarı kaydedildi'); } catch (e) { toast(e.message, true); } };
    if (window.TS_CLOUD) { try { $('#pxKey', host).value = localStorage.getItem('ts_pexels') || ''; } catch (e) {} }
    $('#bkUp', host).onclick = () => P5.restoreBackup();
    $('#insBtn', host).onclick = () => P5.installGuide();
    const now = $('#bkNow', host);
    if (now) now.onclick = async () => { try { await A().api('settings', { body: { backup_dir: $('#bkDir', host).value.trim(), backup_daily: $('#bkDaily', host).checked } }); const r = await A().api('backup-now', { body: {} }); toast('Yedek alındı: ' + r.file); } catch (e) { toast(e.message, true); } };
    const dir = $('#bkDir', host); if (dir) { const sv = () => A().api('settings', { body: { backup_dir: dir.value.trim(), backup_daily: $('#bkDaily', host).checked } }).catch(() => {}); dir.onchange = sv; $('#bkDaily', host).onchange = sv; }
  };

  // =====================================================================
  // 14) ANA EKRANA EKLE (uygulama gibi kur)
  // =====================================================================
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  P5.installGuide = async function () {
    const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), android = /Android/.test(ua), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) return toast('Zaten uygulama olarak açıksın');
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; if (r && r.outcome === 'accepted') toast('Uygulama kuruldu'); return; }
    const steps = ios ? [['Safari ile aç', 'Bu sayfa Safari\'de açık olmalı (Chrome\'da da aynı menü var).'], ['Paylaş düğmesi', 'Alttaki ⬆︎ (kare ve ok) simgesine dokun.'], ['Ana Ekrana Ekle', 'Listeyi aşağı kaydır, “Ana Ekrana Ekle”yi seç.'], ['Ekle', 'Sağ üstte “Ekle”ye dokun. Simge ana ekranında çıkar.']]
      : android ? [['Chrome ile aç', 'Bu sayfa Chrome\'da açık olmalı.'], ['Menü', 'Sağ üstteki ⋮ menüsüne dokun.'], ['Ana ekrana ekle', '“Uygulamayı yükle” ya da “Ana ekrana ekle”yi seç.'], ['Onayla', '“Ekle / Yükle”ye dokun.']]
        : [['Adres çubuğu', 'Chrome ya da Edge\'de adres çubuğunun sağındaki “Yükle” (⊕ ekran) simgesine tıkla.'], ['Yükle', 'Açılan pencerede “Yükle”ye bas. Masaüstünde ve başlat menüsünde simgesi olur.'], ['Telefonda', 'Telefonda kurmak için bu sayfayı telefonda açıp aynı düğmeye bas.']];
    await UI().dialog(`<div class="d-body"><h3>${icon('phone')} Ana ekrana ekle</h3><ol class="ins-steps">${steps.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>
      ${!window.isSecureContext && !window.TS_CLOUD ? '<p class="muted" style="font-size:12px">Not: Wi‑Fi adresiyle (http) açınca ana ekran simgesi çalışır, ancak çevrimdışı açılış ve paylaş menüsü için Ayarlar → Telefon erişimi\'ndeki <b>https</b> adresini kullan.</p>' : ''}</div>
      <div class="d-foot"><button class="btn primary" data-close>Tamam</button></div>`);
  };

  // =====================================================================
  // ÜCRETSİZ FOTOĞRAF KÜTÜPHANESİ (Pexels)
  // =====================================================================
  async function stockSearch(q, page, o) {
    if (window.TS_CLOUD) { // bulut sürümü: anahtar bu tarayıcıda, istek doğrudan Pexels'e
      const key = (() => { try { return localStorage.getItem('ts_pexels') || ''; } catch (e) { return ''; } })();
      if (!key) throw Object.assign(new Error('no_key'), { noKey: true });
      const r = await fetch('https://api.pexels.com/v1/search?' + new URLSearchParams({ query: q, per_page: 30, page, locale: 'tr-TR', ...(o ? { orientation: o } : {}) }), { headers: { Authorization: key } });
      if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'Pexels anahtarı geçersiz' : 'Pexels hatası (' + r.status + ')');
      const j = await r.json(); return { photos: (j.photos || []).map((ph) => ({ id: ph.id, w: ph.width, h: ph.height, thumb: ph.src.medium, full: ph.src.large2x, by: ph.photographer, page: ph.url, alt: ph.alt || '', avg: ph.avg_color })), total: j.total_results };
    }
    try { const r = await A().api('stock?' + new URLSearchParams({ q, page, o: o || '' })); if (r && r.noKey) throw Object.assign(new Error('no_key'), { noKey: true }); return r; }
    catch (e) { if (/no_key/.test(e.message)) throw Object.assign(new Error('no_key'), { noKey: true }); throw e; }
  }
  async function stockFetch(ph) {
    if (window.TS_CLOUD) { const b = await (await fetch(ph.full)).blob(); return upload(await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }), 'pexels-' + ph.id + '.jpg'); }
    return (await A().api('stock-get', { body: { url: ph.full } })).url;
  }
  const STOCK_Q = [['Ürün zemini', 'product background'], ['Mermer', 'marble texture'], ['Ahşap masa', 'wooden table top'], ['Stüdyo', 'studio backdrop'], ['Doğa', 'nature leaves'], ['Kozmetik', 'cosmetics'], ['Teknoloji', 'technology gadget'], ['Moda', 'fashion'], ['Ev', 'home interior'], ['Yemek', 'food'], ['Ofis', 'office desk'], ['Gökyüzü', 'sky']];
  P5.stockDialog = async function () {
    const ed = E(); if (!ed) return toast('Önce bir tasarım aç', true);
    let page = 1, q = 'product background', o = '', items = [], busy = false;
    await UI().dialog(`<div class="d-body"><h3>${icon('image')} Ücretsiz fotoğraflar <small class="muted">Pexels</small></h3>
      <div class="ic-top"><input class="inp" id="skQ" placeholder="Ara: ürün zemini, mermer, kahve, saat, kozmetik…" value=""><div class="seg" id="skO"><button data-o="" class="on">Hepsi</button><button data-o="landscape">Yatay</button><button data-o="portrait">Dikey</button><button data-o="square">Kare</button></div></div>
      <div class="chips" id="skC">${STOCK_Q.map(([t, v], i) => `<button class="chip${i === 0 ? ' on' : ''}" data-q="${esc(v)}">${esc(t)}</button>`).join('')}</div>
      <div class="sk-grid" id="skG"></div><div id="skMore" style="text-align:center;margin-top:10px"></div>
      <p class="muted" style="font-size:11.5px;margin:8px 0 0">Fotoğraflar <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>'ten · ticari kullanım ücretsiz. Seçili bir fotoğraf varsa onunla değiştirilir, yoksa tasarıma eklenir.</p></div>
      <div class="d-foot"><button class="btn" data-close>Kapat</button></div>`, {
      cls: 'wide',
      onOpen: (box, close) => {
        const G = $('#skG', box), more = $('#skMore', box);
        const draw = () => { G.innerHTML = items.map((ph, i) => `<button class="sk-it" data-i="${i}" style="aspect-ratio:${ph.w}/${ph.h};background:${ph.avg || '#2D323C'}" title="${esc(ph.alt || '')} · ${esc(ph.by || '')}"><img src="${esc(ph.thumb)}" alt="${esc(ph.alt || '')}" loading="lazy"><span>${esc(ph.by || '')}</span></button>`).join(''); };
        const run = async (append) => {
          if (busy) return; busy = true; more.innerHTML = '<span class="ink-dots"><i></i><i></i><i></i></span>';
          try { const r = await stockSearch(q, page, o); items = append ? items.concat(r.photos) : r.photos; draw(); more.innerHTML = items.length && items.length < (r.total || 0) ? '<button class="btn sm" id="skNext">Daha fazla</button>' : (items.length ? '' : '<p class="muted">Sonuç yok — başka bir kelime dene.</p>'); const nx = $('#skNext', box); if (nx) nx.onclick = () => { page++; run(true); }; }
          catch (e) {
            more.innerHTML = '';
            G.innerHTML = e.noKey ? `<div class="sk-key"><b>Fotoğraf kütüphanesini aç (bir kez, ücretsiz)</b><ol><li><a href="https://www.pexels.com/api/new/" target="_blank" rel="noopener">pexels.com/api</a> adresinde ücretsiz hesap aç, anahtarı kopyala.</li><li>Buraya yapıştır ve kaydet.</li></ol><div class="iconrow"><input class="inp" id="skK" placeholder="Pexels API anahtarı"><button class="btn primary" id="skKs">Kaydet</button></div></div>` : `<p class="muted">${esc(e.message)}</p>`;
            const ks = $('#skKs', box); if (ks) ks.onclick = async () => { const v = $('#skK', box).value.trim(); if (!v) return; try { if (window.TS_CLOUD) localStorage.setItem('ts_pexels', v); else await A().api('settings', { body: { pexels_key: v } }); page = 1; busy = false; run(); } catch (er) { toast(er.message, true); } };
          }
          busy = false;
        };
        $('#skQ', box).onkeydown = (e) => { if (e.key === 'Enter') { q = e.target.value.trim() || q; page = 1; $$('#skC .chip', box).forEach((c) => c.classList.remove('on')); run(); } };
        $('#skC', box).onclick = (e) => { const b = e.target.closest('[data-q]'); if (!b) return; q = b.dataset.q; page = 1; $$('#skC .chip', box).forEach((c) => c.classList.toggle('on', c === b)); run(); };
        $('#skO', box).onclick = (e) => { const b = e.target.closest('[data-o]'); if (!b) return; o = b.dataset.o; $$('#skO button', box).forEach((c) => c.classList.toggle('on', c === b)); page = 1; run(); };
        G.onclick = async (e) => {
          const b = e.target.closest('[data-i]'); if (!b) return; const ph = items[+b.dataset.i];
          b.classList.add('loading');
          try {
            const url = await stockFetch(ph), d = ed.doc, sel = d.layers.find((l) => ed.state.sel.length === 1 && l.id === ed.state.sel[0]);
            if (sel && sel.type === 'image') { sel.src = url; delete sel.nw; delete sel.nh; delete sel.origSrc; sel.fit = sel.fit === 'fill' ? 'cover' : sel.fit; await R.ensureImageSizes(d).catch(() => {}); ed.commit(); }
            else { const k = Math.min(d.width * 0.8 / ph.w, d.height * 0.8 / ph.h), w = Math.round(ph.w * k), h = Math.round(ph.h * k); ed.insert([{ type: 'image', name: 'Fotoğraf (' + (ph.by || 'Pexels') + ')', src: url, nw: ph.w, nh: ph.h, x: Math.round((d.width - w) / 2), y: Math.round((d.height - h) / 2), w, h, fit: 'cover', filters: {} }]); }
            close(); toast('Fotoğraf eklendi · ' + (ph.by ? ph.by + ' / ' : '') + 'Pexels');
          } catch (er) { b.classList.remove('loading'); toast(er.message, true); }
        };
        run();
      },
    });
  };

  window.P5 = P5;
})();
