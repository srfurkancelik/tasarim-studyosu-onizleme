/* Tasarım Stüdyosu — hazır şablon kütüphanesi (özgün, telifsiz).
   Her şablon bir renk paletiyle (P) katman listesi üretir; galeride renk varyasyonları tek dokunuşla değişir. */
(function () {
  'use strict';
  // ---------- küçük yapı taşları
  const rect = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'rect', name, x, y, w, h, fill, radius: 0 }, o);
  const ell = (name, x, y, w, h, fill, o = {}) => Object.assign({ type: 'ellipse', name, x, y, w, h, fill }, o);
  const path = (name, d, x, y, w, h, fill, o = {}) => Object.assign({ type: 'path', name, d, vw: 100, vh: 100, x, y, w, h, fill }, o);
  const txt = (name, text, x, y, w, fontSize, fill, o = {}) => Object.assign({ type: 'text', name, text, x, y, w, h: fontSize * 1.2, fontSize, fill, fontFamily: 'Inter', fontWeight: 700, lineHeight: 1.12, letterSpacing: 0, align: 'left' }, o);
  const STAR = 'M50 0 L61.8 34.5 L97.6 34.5 L68.8 55.9 L79.4 90.5 L50 69.1 L20.6 90.5 L31.2 55.9 L2.4 34.5 L38.2 34.5 Z';
  const BURST = (() => { let d = ''; for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 41 : 50; d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2) + ' '; } return d + 'Z'; })();
  const WAVE = 'M0 40 C 20 10, 35 10, 50 35 S 80 70, 100 30 L100 100 L0 100 Z';
  const ARCH = 'M0 100 L0 50 A50 50 0 0 1 100 50 L100 100 Z';
  const LEAF = 'M50 0 C 85 20, 95 60, 50 100 C 5 60, 15 20, 50 0 Z';
  const shadow = (blur = 30, y = 14, a = 0.25) => ({ x: 0, y, blur, color: `rgba(0,0,0,${a})` });

  // yer tutucu fotoğraf: üzerine dokunup "Görseli değiştir" ile kendi fotoğrafını koyarsın
  function photo(name, x, y, w, h, P, o = {}) {
    const c1 = P.c || '#D9D4CC', c2 = P.b || '#B9B2A6';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="560" cy="250" r="90" fill="#fff" fill-opacity=".35"/><path d="M0 640 L240 380 L420 560 L540 450 L800 700 L800 800 L0 800 Z" fill="#fff" fill-opacity=".28"/><g transform="translate(400 400)" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="10" stroke-linejoin="round"><rect x="-70" y="-46" width="140" height="100" rx="16"/><circle cx="0" cy="4" r="30"/><path d="M-30 -46 l12 -20 h36 l12 20"/></g></svg>`;
    return Object.assign({ type: 'image', name, role: 'photo', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), nw: 800, nh: 800, fit: 'cover', x, y, w, h, filters: {} }, o);
  }

  const T = [];
  const def = (id, cat, name, w, h, palettes, build, tags = '') => T.push({ id, cat, name, w, h, palettes, build, tags });

  // ================= INSTAGRAM GÖNDERİ (1080×1080)
  def('ig-indirim', 'Instagram gönderi', 'Büyük indirim', 1080, 1080, [
    { bg: '#FF3B5C', ink: '#FFFFFF', a: '#FFD23F', b: '#1B1B2F', c: '#FF6F87' },
    { bg: '#1B1B2F', ink: '#FFFFFF', a: '#00E0B8', b: '#FF3B5C', c: '#2C2C4A' },
    { bg: '#FFD23F', ink: '#1B1B2F', a: '#FF3B5C', b: '#1B1B2F', c: '#FFE27A' },
  ], (P) => [
    ell('Süs dairesi', -180, -220, 620, 620, P.c),
    ell('Süs dairesi 2', 760, 760, 520, 520, P.c),
    path('Rozet', BURST, 700, 90, 300, 300, P.a, { rotation: 12 }),
    txt('Rozet yazısı', 'SADECE\nBU HAFTA', 712, 196, 276, 34, P.b, { align: 'center', fontWeight: 900, rotation: 12, lineHeight: 1.05 }),
    txt('Üst başlık', 'SEZON SONU', 90, 300, 700, 64, P.ink, { fontWeight: 800, letterSpacing: 10 }),
    txt('Büyük oran', '%50', 70, 380, 900, 330, P.ink, { fontWeight: 900, fontFamily: 'Arial Black', lineHeight: 1 }),
    txt('Başlık', 'İNDİRİM', 90, 700, 900, 120, P.a, { fontWeight: 900, fontFamily: 'Arial Black', letterSpacing: 4 }),
    rect('Buton zemini', 90, 880, 420, 96, P.b, { radius: 48, shadow: shadow(24, 10, 0.25) }),
    txt('Buton yazısı', 'Hemen alışveriş yap', 90, 908, 420, 36, P.ink, { align: 'center', fontWeight: 700 }),
    txt('Web adresi', 'www.markaniz.com', 560, 912, 430, 32, P.ink, { align: 'right', fontWeight: 500 }),
  ], 'indirim kampanya satış sale fırsat');

  def('ig-urun', 'Instagram gönderi', 'Yeni ürün tanıtımı', 1080, 1080, [
    { bg: '#F5EFE6', ink: '#2B2118', a: '#C0602A', b: '#2B2118', c: '#E8DCCB' },
    { bg: '#EEF3F0', ink: '#14281D', a: '#2E8B57', b: '#14281D', c: '#D5E5DB' },
    { bg: '#F2F0FA', ink: '#221C35', a: '#7B5CFA', b: '#221C35', c: '#E0DAF7' },
  ], (P) => [
    photo('Ürün fotoğrafı', 0, 0, 1080, 660, P),
    rect('Alt panel', 0, 660, 1080, 420, P.bg),
    rect('Vurgu çizgisi', 80, 720, 90, 10, P.a, { radius: 5 }),
    txt('Etiket', 'YENİ', 80, 750, 400, 34, P.a, { fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'Ürün adı buraya', 80, 796, 700, 82, P.ink, { fontWeight: 800, fontFamily: 'Georgia' }),
    txt('Alt başlık', 'Kısa ve çekici bir açıklama: neden bu ürünü sevecekler?', 80, 900, 640, 34, P.ink, { fontWeight: 400, opacity: 0.75, lineHeight: 1.35 }),
    ell('Fiyat dairesi', 790, 560, 220, 220, P.a, { shadow: shadow(30, 16, 0.25) }),
    txt('Fiyat', '₺249', 790, 620, 220, 64, '#FFFFFF', { align: 'center', fontWeight: 900 }),
    txt('Fiyat notu', 'yerine ₺299', 790, 694, 220, 26, '#FFFFFF', { align: 'center', fontWeight: 500, opacity: 0.85 }),
  ], 'ürün lansman yeni fiyat tanıtım');

  def('ig-alinti', 'Instagram gönderi', 'Alıntı / söz', 1080, 1080, [
    { bg: '#0F172A', ink: '#F8FAFC', a: '#F59E0B', b: '#334155', c: '#1E293B' },
    { bg: '#FDF6EC', ink: '#3A2E26', a: '#D9480F', b: '#E9D8C3', c: '#F5E9D8' },
    { bg: '#E6F4F1', ink: '#0B3D35', a: '#0E9F87', b: '#BFE3DA', c: '#D3ECE6' },
  ], (P) => [
    rect('Çerçeve', 60, 60, 960, 960, 'none', { stroke: P.b, strokeWidth: 3 }),
    txt('Tırnak', '“', 90, 70, 300, 340, P.a, { fontFamily: 'Georgia', fontWeight: 700, lineHeight: 1 }),
    txt('Alıntı', 'Küçük adımlar, büyük değişimlerin başlangıcıdır.', 130, 360, 820, 76, P.ink, { fontFamily: 'Georgia', fontWeight: 400, lineHeight: 1.22 }),
    rect('Ayraç', 130, 760, 80, 6, P.a, { radius: 3 }),
    txt('Yazar', 'Ad Soyad', 130, 790, 600, 36, P.ink, { fontWeight: 700, letterSpacing: 2 }),
    txt('Hesap', '@kullaniciadi', 130, 838, 600, 28, P.ink, { fontWeight: 400, opacity: 0.6 }),
  ], 'söz alıntı motivasyon quote');

  def('ig-kafe', 'Instagram gönderi', 'Kafe menüsü', 1080, 1080, [
    { bg: '#1F1612', ink: '#F3E9DC', a: '#D4A373', b: '#3A2A22', c: '#2A1E19' },
    { bg: '#F3E9DC', ink: '#2A1E19', a: '#9C6644', b: '#E3D5C3', c: '#EADCCA' },
    { bg: '#12263A', ink: '#F4F1DE', a: '#E9C46A', b: '#1D3557', c: '#18304A' },
  ], (P) => {
    const items = [['Espresso', '₺60'], ['Latte', '₺85'], ['Filtre kahve', '₺70'], ['Türk kahvesi', '₺65'], ['Cheesecake', '₺120']];
    const L = [
      txt('Üst yazı', 'BUGÜNÜN', 0, 90, 1080, 34, P.a, { align: 'center', fontWeight: 700, letterSpacing: 12 }),
      txt('Başlık', 'Kahve Menüsü', 0, 136, 1080, 104, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, italic: true }),
      rect('Ayraç', 490, 272, 100, 4, P.a, { radius: 2 }),
    ];
    items.forEach(([n, p], i) => {
      const y = 340 + i * 112;
      L.push(txt('Ürün ' + (i + 1), n, 150, y, 560, 46, P.ink, { fontWeight: 600 }));
      L.push(rect('Nokta çizgisi ' + (i + 1), 150, y + 66, 780, 2, P.b));
      L.push(txt('Fiyat ' + (i + 1), p, 690, y, 240, 46, P.a, { align: 'right', fontWeight: 800 }));
    });
    L.push(txt('Alt bilgi', 'Her gün 08:00 – 22:00 · @kafeadi', 0, 960, 1080, 30, P.ink, { align: 'center', fontWeight: 400, opacity: 0.7 }));
    return L;
  }, 'kahve kafe menü fiyat listesi restoran');

  def('ig-carousel', 'Instagram gönderi', 'İpucu kartı', 1080, 1350, [
    { bg: '#FFF8F0', ink: '#1D1D1F', a: '#FF7A59', b: '#FFE3D8', c: '#FFD3C2' },
    { bg: '#F0F7FF', ink: '#0B1F33', a: '#2F80ED', b: '#D9E9FF', c: '#C3DCFF' },
    { bg: '#111111', ink: '#FFFFFF', a: '#C6FF3D', b: '#222222', c: '#2A2A2A' },
  ], (P) => [
    rect('Numara zemini', 80, 100, 150, 150, P.a, { radius: 40 }),
    txt('Numara', '01', 80, 140, 150, 72, P.bg, { align: 'center', fontWeight: 900 }),
    txt('Başlık', 'Daha iyi fotoğraf için 3 ipucu', 80, 320, 920, 96, P.ink, { fontWeight: 900, lineHeight: 1.08 }),
    rect('Kart 1', 80, 620, 920, 170, P.b, { radius: 28 }),
    txt('Madde 1', 'Gün ışığını kullan, flaştan kaçın.', 130, 678, 820, 42, P.ink, { fontWeight: 600 }),
    rect('Kart 2', 80, 815, 920, 170, P.b, { radius: 28 }),
    txt('Madde 2', 'Arka planı sade tut, ürünü öne çıkar.', 130, 873, 820, 42, P.ink, { fontWeight: 600 }),
    rect('Kart 3', 80, 1010, 920, 170, P.b, { radius: 28 }),
    txt('Madde 3', 'Aynı açıdan seri çekim yap.', 130, 1068, 820, 42, P.ink, { fontWeight: 600 }),
    txt('Kaydır', 'Kaydır →', 700, 1240, 300, 34, P.a, { align: 'right', fontWeight: 800 }),
  ], 'ipucu bilgi eğitim carousel kaydırmalı 4:5');

  // ================= HİKÂYE (1080×1920)
  def('st-kampanya', 'Hikâye', 'Fotoğraflı kampanya', 1080, 1920, [
    { bg: '#111111', ink: '#FFFFFF', a: '#FF4D6D', b: '#111111', c: '#555555' },
    { bg: '#0A2342', ink: '#FFFFFF', a: '#F6AE2D', b: '#0A2342', c: '#2C5282' },
    { bg: '#1A1A1A', ink: '#FFFFFF', a: '#37E2D5', b: '#1A1A1A', c: '#4A4A4A' },
  ], (P) => [
    photo('Arka plan fotoğrafı', 0, 0, 1080, 1920, P),
    rect('Karartma', 0, 820, 1080, 1100, { type: 'linear', angle: 90, colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)'] }),
    rect('Etiket zemini', 80, 1180, 330, 74, P.a, { radius: 37 }),
    txt('Etiket', 'YENİ SEZON', 80, 1199, 330, 34, '#FFFFFF', { align: 'center', fontWeight: 800, letterSpacing: 3 }),
    txt('Başlık', 'Yaz koleksiyonu geldi', 80, 1290, 920, 104, P.ink, { fontWeight: 900, lineHeight: 1.02 }),
    txt('Alt başlık', 'Tüm ürünlerde ücretsiz kargo', 80, 1612, 920, 40, P.ink, { fontWeight: 400, opacity: 0.85 }),
    rect('Buton', 290, 1730, 500, 110, '#FFFFFF', { radius: 55 }),
    txt('Buton yazısı', 'Keşfet ↑', 290, 1762, 500, 44, '#111111', { align: 'center', fontWeight: 800 }),
  ], 'story hikaye kampanya koleksiyon');

  def('st-etkinlik', 'Hikâye', 'Etkinlik duyurusu', 1080, 1920, [
    { bg: '#3A0CA3', ink: '#FFFFFF', a: '#F72585', b: '#4CC9F0', c: '#4361EE' },
    { bg: '#F4F1DE', ink: '#3D405B', a: '#E07A5F', b: '#81B29A', c: '#F2CC8F' },
    { bg: '#0B132B', ink: '#FFFFFF', a: '#5BC0BE', b: '#FFD166', c: '#1C2541' },
  ], (P) => [
    ell('Şekil 1', 520, -200, 860, 860, P.c),
    ell('Şekil 2', -260, 1300, 760, 760, P.a, { opacity: 0.9 }),
    path('Yıldız', STAR, 820, 1240, 160, 160, P.b, { rotation: 14 }),
    txt('Üst yazı', 'CANLI ETKİNLİK', 90, 300, 900, 44, P.b, { fontWeight: 800, letterSpacing: 10 }),
    txt('Başlık', 'Tasarım Atölyesi', 90, 380, 860, 150, P.ink, { fontWeight: 900, lineHeight: 0.98 }),
    rect('Tarih kutusu', 90, 760, 300, 300, P.ink, { radius: 36 }),
    txt('Gün', '24', 90, 800, 300, 150, P.bg, { align: 'center', fontWeight: 900, lineHeight: 1 }),
    txt('Ay', 'KASIM', 90, 960, 300, 44, P.bg, { align: 'center', fontWeight: 800, letterSpacing: 6 }),
    txt('Saat', 'Cumartesi · 19:00', 440, 800, 560, 54, P.ink, { fontWeight: 700 }),
    txt('Yer', 'Kültür Merkezi, Salon B', 440, 880, 560, 40, P.ink, { fontWeight: 400, opacity: 0.85 }),
    txt('Kayıt', 'Kayıt: bağlantı profilde', 90, 1700, 900, 40, P.ink, { fontWeight: 600 }),
  ], 'etkinlik duyuru seminer atölye konser tarih');

  // ================= AFİŞ (A4 1240×1754)
  def('af-konser', 'Afiş (A4)', 'Konser / gece', 1240, 1754, [
    { bg: '#0D0D0D', ink: '#FFFFFF', a: '#FF2E63', b: '#08D9D6', c: '#252A34' },
    { bg: '#1B0036', ink: '#FFFFFF', a: '#FFC300', b: '#FF5733', c: '#3D0066' },
    { bg: '#F2EDE4', ink: '#111111', a: '#E63946', b: '#1D3557', c: '#E0D8CC' },
  ], (P) => [
    ell('Işık 1', 160, 180, 920, 920, { type: 'radial', colors: [P.a, 'rgba(0,0,0,0)'] }, { opacity: 0.55 }),
    ell('Işık 2', 520, 520, 700, 700, { type: 'radial', colors: [P.b, 'rgba(0,0,0,0)'] }, { opacity: 0.45 }),
    txt('Üst yazı', 'CUMA GECESİ', 100, 140, 1040, 46, P.b, { fontWeight: 800, letterSpacing: 14 }),
    txt('Başlık', 'CANLI\nMÜZİK', 90, 250, 1100, 300, P.ink, { fontFamily: 'Impact', fontWeight: 400, lineHeight: 0.92, letterSpacing: 4 }),
    rect('Çizgi', 100, 1010, 1040, 4, P.ink, { opacity: 0.6 }),
    txt('Sanatçılar', 'Sanatçı Adı · Grup Adı · DJ Adı', 100, 1050, 1040, 56, P.ink, { fontWeight: 700 }),
    txt('Tarih', '15 ARALIK · 21:00', 100, 1300, 700, 70, P.a, { fontWeight: 900 }),
    txt('Yer', 'Mekan adı, Şehir', 100, 1390, 700, 44, P.ink, { fontWeight: 400, opacity: 0.85 }),
    rect('Bilet kutusu', 840, 1290, 300, 180, P.a, { radius: 24 }),
    txt('Bilet', 'BİLET\n₺350', 840, 1318, 300, 52, '#FFFFFF', { align: 'center', fontWeight: 900, lineHeight: 1.1 }),
    txt('Alt bilgi', 'biletler: www.mekan.com', 100, 1620, 1040, 34, P.ink, { fontWeight: 500, opacity: 0.7 }),
  ], 'konser müzik parti gece afiş poster');

  def('af-acilis', 'Afiş (A4)', 'Mağaza açılışı', 1240, 1754, [
    { bg: '#FFFFFF', ink: '#111111', a: '#E63946', b: '#F1FAEE', c: '#F6D6D8' },
    { bg: '#FFFDF7', ink: '#1F2A44', a: '#2A9D8F', b: '#E9F5F3', c: '#CDEAE6' },
    { bg: '#FBF7F4', ink: '#2B2B2B', a: '#B5838D', b: '#F3E5E8', c: '#E5C9CF' },
  ], (P) => [
    photo('Fotoğraf', 120, 120, 1000, 860, P, { mask: 'arch' }),
    path('Yaprak', LEAF, 1000, 860, 180, 220, P.a, { rotation: 28, opacity: 0.9 }),
    txt('Üst yazı', 'BÜYÜK AÇILIŞ', 120, 1040, 1000, 44, P.a, { align: 'center', fontWeight: 800, letterSpacing: 14 }),
    txt('Başlık', 'Sizi de bekliyoruz', 120, 1110, 1000, 118, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700 }),
    txt('Alt başlık', 'Açılışa özel ilk 100 müşteriye hediye', 170, 1290, 900, 44, P.ink, { align: 'center', fontWeight: 400, opacity: 0.8 }),
    rect('Tarih şeridi', 320, 1420, 600, 110, P.a, { radius: 55 }),
    txt('Tarih', '1 Mart · 10:00', 320, 1452, 600, 48, '#FFFFFF', { align: 'center', fontWeight: 800 }),
    txt('Adres', 'Mahalle, Cadde No:1, Şehir', 120, 1600, 1000, 34, P.ink, { align: 'center', fontWeight: 500, opacity: 0.7 }),
  ], 'açılış mağaza davet afiş');

  // ================= MENÜ (A4)
  def('mn-restoran', 'Menü', 'Restoran menüsü', 1240, 1754, [
    { bg: '#FBF6EE', ink: '#2C2420', a: '#A4161A', b: '#E9DFD1', c: '#F1E8DB' },
    { bg: '#16201B', ink: '#EFE9DD', a: '#C9A227', b: '#24332B', c: '#1D2A23' },
    { bg: '#FFFFFF', ink: '#1A1A1A', a: '#3A5A40', b: '#EEF2EC', c: '#DDE6DA' },
  ], (P) => {
    const L = [
      rect('Kenar çerçeve', 50, 50, 1140, 1654, 'none', { stroke: P.a, strokeWidth: 3 }),
      txt('Restoran adı', 'Lokanta Adı', 0, 110, 1240, 110, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, italic: true }),
      txt('Alt yazı', 'EV YEMEKLERİ · 1985\'TEN BERİ', 0, 240, 1240, 30, P.a, { align: 'center', fontWeight: 700, letterSpacing: 8 }),
    ];
    const secs = [['ÇORBALAR', [['Mercimek çorbası', '₺90'], ['Ezogelin', '₺90'], ['Yayla çorbası', '₺95']]], ['ANA YEMEKLER', [['Hünkâr beğendi', '₺420'], ['Karnıyarık', '₺280'], ['Izgara köfte', '₺340'], ['Tavuk şiş', '₺300']]], ['TATLILAR', [['Künefe', '₺190'], ['Sütlaç', '₺120']]]];
    let y = 360;
    secs.forEach(([t, items], si) => {
      L.push(txt('Bölüm ' + (si + 1), t, 140, y, 960, 44, P.a, { fontWeight: 800, letterSpacing: 6 }));
      L.push(rect('Bölüm çizgisi ' + (si + 1), 140, y + 58, 960, 2, P.a, { opacity: 0.4 }));
      y += 90;
      items.forEach(([n, p], i) => {
        L.push(txt(`${t.toLowerCase()} ${i + 1}`, n, 140, y, 720, 46, P.ink, { fontWeight: 600 }));
        L.push(txt(`${t.toLowerCase()} fiyat ${i + 1}`, p, 860, y, 240, 46, P.a, { align: 'right', fontWeight: 800 }));
        y += 84;
      });
      y += 70;
    });
    L.push(txt('Alt bilgi', 'Rezervasyon: 0 (000) 000 00 00', 0, 1610, 1240, 30, P.ink, { align: 'center', fontWeight: 500, opacity: 0.7 }));
    return L;
  }, 'menü restoran lokanta yemek fiyat');

  // ================= ÜRÜN ETİKETİ
  def('et-baharat', 'Ürün etiketi', 'Baharat / kuru gıda', 1000, 700, [
    { bg: '#F4EBDD', ink: '#3B2416', a: '#8C1C13', b: '#C08552', c: '#E8D9C2' },
    { bg: '#EEF0E5', ink: '#1F2D1A', a: '#4F772D', b: '#90A955', c: '#DDE3CF' },
    { bg: '#FFF7E6', ink: '#2D1E2F', a: '#D1495B', b: '#EDAE49', c: '#F9E5C0' },
  ], (P) => [
    rect('Üst bant', 0, 0, 1000, 70, P.a),
    txt('Marka', 'MARKA ADI', 0, 18, 1000, 34, P.bg, { align: 'center', fontWeight: 800, letterSpacing: 10 }),
    path('Yaprak', LEAF, 70, 130, 90, 120, P.b, { rotation: -20 }),
    txt('Ürün adı', 'SUMAK', 0, 150, 1000, 150, P.a, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, letterSpacing: 6 }),
    txt('Açıklama', 'Doğal · Katkısız · Taş değirmende öğütülmüş', 0, 320, 1000, 32, P.ink, { align: 'center', fontWeight: 500 }),
    rect('Ayraç', 400, 380, 200, 3, P.b),
    txt('İçindekiler', 'İçindekiler: sumak, tuz.', 70, 420, 560, 24, P.ink, { fontWeight: 400, lineHeight: 1.35 }),
    txt('Saklama', 'Serin ve kuru yerde muhafaza ediniz. TETT: 12.2027 · Parti: 2401', 70, 470, 560, 22, P.ink, { fontWeight: 400, lineHeight: 1.35 }),
    txt('Üretici', 'Üretici: Firma Adı, Mahalle, Cadde No:1, Şehir', 70, 560, 560, 22, P.ink, { fontWeight: 400, lineHeight: 1.35 }),
    txt('Net miktar', 'Net 100 g', 660, 420, 280, 56, P.a, { align: 'right', fontWeight: 900 }),
    rect('Alt bant', 0, 660, 1000, 40, P.a),
  ], 'etiket baharat gıda ürün ambalaj kavanoz');

  def('et-bal', 'Ürün etiketi', 'Bal / reçel (oval)', 900, 900, [
    { bg: '#FFF3D6', ink: '#3E2A06', a: '#E0A100', b: '#6B4A0C', c: '#FFE6A6' },
    { bg: '#FBE9EC', ink: '#4A0E1D', a: '#C9184A', b: '#4A0E1D', c: '#F6CFD7' },
    { bg: '#EAF4E4', ink: '#1E3A12', a: '#5C9E31', b: '#1E3A12', c: '#D3E8C6' },
  ], (P) => [
    ell('Dış oval', 30, 30, 840, 840, P.a),
    ell('İç oval', 70, 70, 760, 760, P.bg),
    ell('İnce çizgi', 100, 100, 700, 700, 'none', { stroke: P.b, strokeWidth: 3 }),
    path('Petek', 'M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z', 395, 150, 110, 120, P.a),
    txt('Kategori', 'DOĞAL', 0, 300, 900, 40, P.b, { align: 'center', fontWeight: 800, letterSpacing: 12 }),
    txt('Ürün adı', 'Çiçek Balı', 0, 360, 900, 120, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, italic: true }),
    txt('Bölge', 'Yayla · 2026 hasadı', 0, 510, 900, 34, P.ink, { align: 'center', fontWeight: 500 }),
    rect('Net zemin', 330, 600, 240, 70, P.b, { radius: 35 }),
    txt('Net miktar', '450 g', 330, 616, 240, 38, P.bg, { align: 'center', fontWeight: 800 }),
    txt('Marka', 'MARKA ADI', 0, 720, 900, 30, P.b, { align: 'center', fontWeight: 700, letterSpacing: 8 }),
  ], 'bal reçel kavanoz etiket oval yuvarlak');

  // ================= KARTVİZİT (1050×600 ≈ 85×48,5 mm)
  def('kv-modern', 'Kartvizit', 'Modern kartvizit', 1050, 600, [
    { bg: '#FFFFFF', ink: '#111827', a: '#2563EB', b: '#E5E7EB', c: '#DBEAFE' },
    { bg: '#111111', ink: '#F5F5F5', a: '#D4AF37', b: '#2A2A2A', c: '#1E1E1E' },
    { bg: '#FAF7F2', ink: '#2D2A26', a: '#C2410C', b: '#E7E1D8', c: '#F2E8DC' },
  ], (P) => [
    rect('Yan şerit', 0, 0, 30, 600, P.a),
    ell('Logo dairesi', 90, 90, 110, 110, P.a),
    txt('Logo harfi', 'A', 90, 112, 110, 64, '#FFFFFF', { align: 'center', fontWeight: 900 }),
    txt('Ad soyad', 'Ad Soyad', 90, 250, 600, 62, P.ink, { fontWeight: 800 }),
    txt('Unvan', 'Grafik Tasarımcı', 90, 330, 600, 32, P.a, { fontWeight: 600, letterSpacing: 2 }),
    rect('Ayraç', 680, 90, 2, 420, P.b),
    txt('Telefon', '+90 500 000 00 00', 720, 260, 300, 26, P.ink, { fontWeight: 500 }),
    txt('E-posta', 'ad@marka.com', 720, 310, 300, 26, P.ink, { fontWeight: 500 }),
    txt('Web', 'www.marka.com', 720, 360, 300, 26, P.ink, { fontWeight: 500 }),
    txt('Adres', 'İstanbul', 720, 410, 300, 26, P.ink, { fontWeight: 500, opacity: 0.7 }),
  ], 'kartvizit iş kartı business card');

  // ================= YOUTUBE / KAPAK
  def('yt-kapak', 'Video kapağı', 'YouTube küçük resmi', 1280, 720, [
    { bg: '#FFE600', ink: '#111111', a: '#FF0033', b: '#FFFFFF', c: '#FFF27A' },
    { bg: '#00D1FF', ink: '#0A0A0A', a: '#FF3CAC', b: '#FFFFFF', c: '#7BE8FF' },
    { bg: '#111111', ink: '#FFFFFF', a: '#7CFF00', b: '#111111', c: '#333333' },
  ], (P) => [
    photo('Kişi / ürün fotoğrafı', 700, 0, 580, 720, P),
    path('Eğik ayraç', 'M0 0 L100 0 L40 100 L0 100 Z', 640, 0, 200, 720, P.bg),
    path('Eğik çizgi', 'M70 0 L100 0 L40 100 L10 100 Z', 760, 0, 120, 720, P.a),
    txt('Başlık', '5 HATA\nYAPMA!', 60, 110, 760, 160, P.ink, { fontFamily: 'Impact', fontWeight: 400, lineHeight: 0.95, shadow: { x: 6, y: 6, blur: 0, color: P.b } }),
    rect('Vurgu kutusu', 60, 500, 420, 100, P.a, { radius: 16, rotation: -3 }),
    txt('Vurgu', 'YENİ VİDEO', 60, 524, 420, 52, '#FFFFFF', { align: 'center', fontWeight: 900, rotation: -3 }),
  ], 'youtube video kapak thumbnail küçük resim');

  def('bn-linkedin', 'Kapak / banner', 'LinkedIn / X kapak', 1584, 396, [
    { bg: '#0F172A', ink: '#F8FAFC', a: '#38BDF8', b: '#1E293B', c: '#334155' },
    { bg: '#F8F5F0', ink: '#1C1917', a: '#EA580C', b: '#E7E2DA', c: '#EFE9E1' },
    { bg: '#052E16', ink: '#F0FDF4', a: '#4ADE80', b: '#14532D', c: '#166534' },
  ], (P) => [
    ell('Süs 1', 1200, -220, 520, 520, P.b),
    ell('Süs 2', 1380, 200, 300, 300, P.c, { opacity: 0.8 }),
    rect('Vurgu', 560, 120, 8, 156, P.a, { radius: 4 }),
    txt('Başlık', 'Markaları büyüten tasarımlar', 600, 118, 960, 54, P.ink, { fontWeight: 800 }),
    txt('Alt başlık', 'Ambalaj · Sosyal medya · Kurumsal kimlik', 600, 200, 960, 30, P.ink, { fontWeight: 400, opacity: 0.75 }),
    txt('Web', 'www.marka.com', 600, 262, 760, 24, P.a, { fontWeight: 700 }),
  ], 'linkedin twitter x kapak banner profil');

  def('fb-paylasim', 'Kapak / banner', 'Facebook / web paylaşım', 1200, 628, [
    { bg: '#FFFFFF', ink: '#0B1F33', a: '#FF6B35', b: '#F4F6F8', c: '#FFE2D6' },
    { bg: '#1D1B4B', ink: '#FFFFFF', a: '#FCD34D', b: '#2D2A6E', c: '#3B378C' },
    { bg: '#F7F3EE', ink: '#2B2118', a: '#386641', b: '#ECE5DC', c: '#DCE8D9' },
  ], (P) => [
    photo('Fotoğraf', 640, 0, 560, 628, P),
    rect('Panel', 0, 0, 660, 628, P.bg),
    txt('Etiket', 'BLOG', 70, 120, 400, 28, P.a, { fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'Küçük işletmeler için 7 pazarlama fikri', 70, 170, 540, 58, P.ink, { fontWeight: 800, lineHeight: 1.12 }),
    txt('Alt başlık', 'Bütçeyi aşmadan görünür olmanın yolları', 70, 430, 540, 26, P.ink, { fontWeight: 400, opacity: 0.75 }),
    rect('Çizgi', 70, 520, 70, 6, P.a, { radius: 3 }),
  ], 'facebook paylaşım blog web link görseli');

  // ================= DAVETİYE
  def('dv-dugun', 'Davetiye', 'Zarif davetiye', 1240, 1748, [
    { bg: '#FBF8F3', ink: '#3B3A36', a: '#B08D57', b: '#E9E1D3', c: '#F1EADF' },
    { bg: '#F6F7F4', ink: '#2F3E46', a: '#6B9080', b: '#DDE7E0', c: '#E8EFEA' },
    { bg: '#1C1C1C', ink: '#F1EDE4', a: '#C9A86A', b: '#2C2C2C', c: '#262626' },
  ], (P) => [
    rect('Dış çerçeve', 70, 70, 1100, 1608, 'none', { stroke: P.a, strokeWidth: 3 }),
    rect('İç çerçeve', 95, 95, 1050, 1558, 'none', { stroke: P.a, strokeWidth: 1 }),
    path('Süs', LEAF, 570, 190, 100, 140, P.a, { opacity: 0.85 }),
    txt('Üst yazı', 'BİRLİKTE KUTLAYALIM', 0, 400, 1240, 34, P.a, { align: 'center', fontWeight: 700, letterSpacing: 12 }),
    txt('İsimler', 'Ayşe\n&\nMehmet', 0, 500, 1240, 150, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 400, italic: true, lineHeight: 1.05 }),
    rect('Ayraç', 520, 1050, 200, 2, P.a),
    txt('Tarih', '12 Haziran 2027 · Cumartesi', 0, 1100, 1240, 46, P.ink, { align: 'center', fontWeight: 600 }),
    txt('Saat', 'Saat 19:00', 0, 1170, 1240, 38, P.ink, { align: 'center', fontWeight: 400 }),
    txt('Yer', 'Mekan Adı, Şehir', 0, 1250, 1240, 38, P.ink, { align: 'center', fontWeight: 400, opacity: 0.85 }),
    txt('LCV', 'LCV: 0 500 000 00 00', 0, 1480, 1240, 30, P.a, { align: 'center', fontWeight: 600, letterSpacing: 2 }),
  ], 'davetiye düğün nişan kına davet');

  // ================= FİYAT / KAMPANYA (4:5)
  def('fy-paket', 'Instagram gönderi', 'Fiyat paketi (4:5)', 1080, 1350, [
    { bg: '#F7F7FB', ink: '#16161D', a: '#6C5CE7', b: '#FFFFFF', c: '#E9E7FD' },
    { bg: '#0E1116', ink: '#F2F4F8', a: '#22C55E', b: '#161B22', c: '#1F2937' },
    { bg: '#FFF7ED', ink: '#1C1917', a: '#F97316', b: '#FFFFFF', c: '#FFEDD5' },
  ], (P) => [
    txt('Başlık', 'Üyelik paketleri', 80, 90, 920, 84, P.ink, { fontWeight: 900 }),
    txt('Alt başlık', 'İhtiyacına uygun planı seç', 80, 196, 920, 36, P.ink, { fontWeight: 400, opacity: 0.7 }),
    rect('Kart 1', 80, 300, 440, 860, P.b, { radius: 36, shadow: shadow(40, 18, 0.12) }),
    txt('Paket 1', 'Başlangıç', 120, 350, 360, 44, P.ink, { fontWeight: 800 }),
    txt('Fiyat 1', '₺199', 120, 420, 360, 96, P.ink, { fontWeight: 900 }),
    txt('Süre 1', '/ aylık', 120, 530, 360, 30, P.ink, { fontWeight: 500, opacity: 0.6 }),
    txt('Özellik 1', '✓ 10 tasarım\n✓ Temel şablonlar\n✓ E-posta desteği', 120, 620, 360, 34, P.ink, { fontWeight: 500, lineHeight: 1.7 }),
    rect('Kart 2', 560, 260, 440, 940, P.a, { radius: 36, shadow: shadow(50, 24, 0.25) }),
    rect('Rozet', 700, 230, 160, 56, P.ink, { radius: 28 }),
    txt('Rozet yazısı', 'POPÜLER', 700, 246, 160, 24, P.bg, { align: 'center', fontWeight: 800, letterSpacing: 3 }),
    txt('Paket 2', 'Profesyonel', 600, 330, 360, 44, '#FFFFFF', { fontWeight: 800 }),
    txt('Fiyat 2', '₺499', 600, 400, 360, 96, '#FFFFFF', { fontWeight: 900 }),
    txt('Süre 2', '/ aylık', 600, 510, 360, 30, '#FFFFFF', { fontWeight: 500, opacity: 0.8 }),
    txt('Özellik 2', '✓ Sınırsız tasarım\n✓ Tüm şablonlar\n✓ Öncelikli destek\n✓ Marka kiti', 600, 600, 360, 34, '#FFFFFF', { fontWeight: 500, lineHeight: 1.7 }),
  ], 'fiyat paket plan abonelik üyelik tablo');

  // ================= ÜRÜN TANITIMI (özgün; ürün yer tutucusuna dokunup kendi ürün fotoğrafını koy — arka planı silinmiş PNG en iyisi)
  function product(name, x, y, w, h, P, o = {}) {
    const c1 = P.c || '#E9E6E0', c2 = P.a || '#6C5CE7';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c2}"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="k" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2B2B33"/><stop offset=".5" stop-color="#5A5A66"/><stop offset="1" stop-color="#2B2B33"/></linearGradient></defs><rect x="235" y="40" width="130" height="110" rx="18" fill="url(#k)"/><path d="M200 150 h200 v40 c60 30 90 90 90 160 v370 c0 30 -20 50 -50 50 h-280 c-30 0 -50 -20 -50 -50 v-370 c0 -70 30 -130 90 -160z" fill="url(#b)"/><rect x="150" y="380" width="300" height="220" rx="16" fill="#fff" fill-opacity=".9"/><g transform="translate(300 490)" fill="none" stroke="${c2}" stroke-width="9" stroke-linejoin="round"><rect x="-52" y="-36" width="104" height="76" rx="12"/><circle cx="0" cy="2" r="22"/></g></svg>`;
    return Object.assign({ type: 'image', name, role: 'photo', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), nw: 600, nh: 800, fit: 'contain', x, y, w, h, filters: {}, shadow: shadow(50, 30, 0.22) }, o);
  }
  const chk = 'M20 52 L42 72 L80 30';
  const feat = (x, y, t, P, s = 34, w = 440) => [ell('İşaret zemini', x, y, s * 1.25, s * 1.25, P.a), path('İşaret', chk, x + s * 0.25, y + s * 0.25, s * 0.75, s * 0.75, 'none', { stroke: '#FFFFFF', strokeWidth: 5 }), txt('Özellik: ' + t, t, x + s * 1.7, y + s * 0.1, w, s, P.ink, { fontWeight: 600 })];
  const PRODP = [
    { bg: '#F4F2EE', ink: '#16161D', a: '#6C5CE7', b: '#FFFFFF', c: '#E4E0FA' },
    { bg: '#0F1115', ink: '#F4F5F7', a: '#22C55E', b: '#1A1D23', c: '#2A2F38' },
    { bg: '#FFF4EC', ink: '#2A1610', a: '#F97316', b: '#FFFFFF', c: '#FFE1CC' },
  ];

  def('ur-lansman', 'Ürün tanıtımı', 'Yeni ürün lansmanı (4:5)', 1080, 1350, PRODP, (P) => [
    ell('Kürsü gölgesi', 550, 1030, 440, 60, P.ink, { opacity: 0.08 }),
    rect('Kürsü', 590, 905, 360, 140, P.c),
    ell('Kürsü altı', 590, 1010, 360, 70, P.c),
    ell('Kürsü üstü', 590, 870, 360, 70, P.b),
    product('Ürün fotoğrafı', 600, 425, 340, 480, P),
    txt('Etiket', 'YENİ', 80, 110, 300, 34, P.a, { fontWeight: 800, letterSpacing: 10 }),
    txt('Başlık', 'Ürün\nAdı Pro', 80, 160, 520, 120, P.ink, { fontWeight: 900, lineHeight: 0.98 }),
    txt('Alt başlık', 'Tek cümlede neden farklı olduğunu anlat.', 80, 430, 460, 34, P.ink, { fontWeight: 400, opacity: 0.75, lineHeight: 1.35 }),
    ...feat(80, 560, '48 saat pil ömrü', P), ...feat(80, 640, 'Suya dayanıklı', P), ...feat(80, 720, '2 yıl garanti', P),
    txt('Fiyat', '₺1.299', 80, 860, 420, 92, P.ink, { fontWeight: 900 }),
    rect('Buton zemini', 80, 1150, 400, 96, P.a, { radius: 48 }),
    txt('Buton yazısı', 'Hemen sipariş ver', 80, 1178, 400, 36, '#FFFFFF', { align: 'center', fontWeight: 700 }),
    txt('Web', 'www.markaniz.com', 560, 1186, 440, 30, P.ink, { align: 'right', fontWeight: 500, opacity: 0.7 }),
  ], 'ürün tanıtım lansman yeni özellik fiyat e-ticaret');

  def('ur-ozellik', 'Ürün tanıtımı', 'Özellikler (oklu)', 1080, 1080, PRODP, (P) => [
    txt('Başlık', 'Neden Ürün Adı?', 0, 70, 1080, 64, P.ink, { align: 'center', fontWeight: 900 }),
    ell('Arka daire', 290, 230, 500, 500, P.c),
    product('Ürün fotoğrafı', 390, 230, 300, 520, P),
    ...[[70, 300, 'Hafif tasarım', 'Sadece 180 g'], [70, 620, 'Hızlı şarj', '15 dakikada %80'], [770, 300, 'Uzun ömür', '48 saat kullanım'], [770, 620, 'Dayanıklı', 'Suya ve toza karşı']].flatMap(([x, y, t, d], i) => [
      rect('Çizgi ' + (i + 1), i < 2 ? 330 : 700, y + 34, 60, 3, P.a),
      ell('Nokta ' + (i + 1), i < 2 ? 384 : 694, y + 28, 14, 14, P.a),
      txt('Özellik ' + (i + 1), t, x, y, 250, 36, P.ink, { fontWeight: 800, align: i < 2 ? 'right' : 'left' }),
      txt('Açıklama ' + (i + 1), d, x, y + 46, 250, 26, P.ink, { fontWeight: 400, opacity: 0.7, align: i < 2 ? 'right' : 'left' }),
    ]),
    rect('Alt bant', 0, 900, 1080, 180, P.a),
    txt('Alt yazı', 'Şimdi %15 indirimle · www.markaniz.com', 0, 970, 1080, 38, '#FFFFFF', { align: 'center', fontWeight: 700 }),
  ], 'ürün özellik infografik tanıtım ok açıklama');

  def('ur-eticaret', 'Ürün tanıtımı', 'Pazar yeri ürün görseli', 1200, 1200, [
    { bg: '#FFFFFF', ink: '#111827', a: '#F97316', b: '#F3F4F6', c: '#FFEDD5' },
    { bg: '#FFFFFF', ink: '#111827', a: '#2563EB', b: '#F3F4F6', c: '#DBEAFE' },
    { bg: '#FFFFFF', ink: '#111827', a: '#DB2777', b: '#F3F4F6', c: '#FCE7F3' },
  ], (P) => [
    ell('Zemin dairesi', 250, 170, 700, 700, P.b),
    product('Ürün fotoğrafı', 400, 120, 400, 760, P),
    path('Rozet', BURST, 900, 70, 230, 230, P.a),
    txt('Rozet yazısı', '%20\nİNDİRİM', 905, 140, 220, 40, '#FFFFFF', { align: 'center', fontWeight: 900, lineHeight: 1.05 }),
    rect('Kargo etiketi', 70, 80, 300, 70, P.ink, { radius: 35 }),
    txt('Kargo', '🚚  Ücretsiz kargo', 70, 101, 300, 28, '#FFFFFF', { align: 'center', fontWeight: 700 }),
    ...['Orijinal ürün', 'Hızlı teslimat', '2 yıl garanti'].flatMap((t, i) => [rect('Rozet ' + (i + 1), 90 + i * 350, 980, 320, 120, P.c, { radius: 24 }), txt('Rozet yazısı ' + (i + 1), t, 90 + i * 350, 1022, 320, 34, P.ink, { align: 'center', fontWeight: 700 })]),
  ], 'e-ticaret trendyol hepsiburada amazon pazar yeri ürün görseli beyaz zemin listing');

  def('ur-karsilastir', 'Ürün tanıtımı', 'Karşılaştırma tablosu', 1080, 1350, PRODP, (P) => [
    txt('Başlık', 'Fark ortada', 80, 90, 920, 84, P.ink, { fontWeight: 900 }),
    txt('Alt başlık', 'Bizim ürün ile sıradan ürünler', 80, 196, 920, 34, P.ink, { opacity: 0.7, fontWeight: 400 }),
    rect('Sütun vurgusu', 620, 280, 200, 900, P.a, { radius: 28 }),
    txt('Sütun 1', 'Ürün Adı', 620, 310, 200, 30, '#FFFFFF', { align: 'center', fontWeight: 800 }),
    txt('Sütun 2', 'Diğerleri', 840, 310, 200, 30, P.ink, { align: 'center', fontWeight: 700, opacity: 0.7 }),
    ...['Doğal içerik', 'Uzun süre etkili', 'Kokusuz', 'Geri dönüştürülebilir ambalaj', 'Uygun fiyat'].flatMap((t, i) => [
      rect('Satır çizgisi ' + (i + 1), 80, 400 + i * 150 + 120, 960, 2, P.ink, { opacity: 0.12 }),
      txt('Özellik ' + (i + 1), t, 80, 400 + i * 150 + 40, 520, 34, P.ink, { fontWeight: 600 }),
      txt('Evet ' + (i + 1), '✓', 620, 400 + i * 150 + 30, 200, 50, '#FFFFFF', { align: 'center', fontWeight: 900 }),
      txt('Hayır ' + (i + 1), i === 4 ? '✓' : '✕', 840, 400 + i * 150 + 30, 200, 50, P.ink, { align: 'center', fontWeight: 700, opacity: 0.45 }),
    ]),
    txt('Alt yazı', 'www.markaniz.com', 80, 1240, 920, 30, P.ink, { fontWeight: 600, opacity: 0.7 }),
  ], 'ürün karşılaştırma tablo bizim ürün diğerleri fark artı eksi');

  def('ur-story', 'Ürün tanıtımı', 'İndirim hikâyesi', 1080, 1920, PRODP, (P) => [
    ell('Arka daire', 140, 520, 800, 800, P.c),
    product('Ürün fotoğrafı', 290, 470, 500, 880, P),
    txt('Üst', 'SON 3 GÜN', 0, 170, 1080, 44, P.a, { align: 'center', fontWeight: 800, letterSpacing: 12 }),
    txt('Oran', '%30', 0, 240, 1080, 220, P.ink, { align: 'center', fontWeight: 900, lineHeight: 1 }),
    txt('Ürün adı', 'Ürün Adı Pro', 0, 1440, 1080, 70, P.ink, { align: 'center', fontWeight: 800 }),
    txt('Fiyat', '₺1.299  →  ₺909', 0, 1540, 1080, 52, P.a, { align: 'center', fontWeight: 800 }),
    rect('Buton zemini', 290, 1690, 500, 110, P.a, { radius: 55 }),
    txt('Buton yazısı', 'Hemen al ↑', 290, 1725, 500, 40, '#FFFFFF', { align: 'center', fontWeight: 800 }),
  ], 'ürün indirim story hikaye kampanya yüzde son gün');

  def('ur-banner', 'Ürün tanıtımı', 'Web banner (ürün)', 1920, 600, PRODP, (P) => [
    rect('Sağ panel', 1100, 0, 820, 600, P.c),
    ell('Daire', 1250, 60, 480, 480, P.b),
    product('Ürün fotoğrafı', 1350, 40, 280, 520, P),
    txt('Etiket', 'YENİ SEZON', 110, 120, 700, 30, P.a, { fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'Ürün Adı ile tanış', 110, 170, 950, 96, P.ink, { fontWeight: 900 }),
    txt('Alt başlık', 'Kısa açıklama: ürünün en güçlü faydası.', 110, 300, 900, 36, P.ink, { opacity: 0.7, fontWeight: 400 }),
    rect('Buton zemini', 110, 400, 340, 86, P.a, { radius: 43 }),
    txt('Buton yazısı', 'Keşfet →', 110, 426, 340, 34, '#FFFFFF', { align: 'center', fontWeight: 700 }),
  ], 'ürün web banner site kapak yatay reklam');

  def('ur-minimal', 'Ürün tanıtımı', 'Minimal ürün', 1080, 1080, [
    { bg: '#E8E2D9', ink: '#2B2620', a: '#2B2620', b: '#F3EEE7', c: '#D8CFC2' },
    { bg: '#DCE6E0', ink: '#1E2B24', a: '#1E2B24', b: '#EEF3F0', c: '#C7D6CD' },
    { bg: '#E6E3F0', ink: '#24213A', a: '#24213A', b: '#F2F0F8', c: '#D2CDE6' },
  ], (P) => [
    rect('Kemer', 290, 140, 500, 760, P.b, { radius: 250 }),
    product('Ürün fotoğrafı', 390, 260, 300, 560, P),
    txt('Marka', 'MARKA', 80, 80, 400, 28, P.ink, { fontWeight: 700, letterSpacing: 10 }),
    txt('Ürün adı', 'Ürün Adı', 0, 930, 1080, 52, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 400 }),
    txt('Fiyat', '₺449', 0, 1000, 1080, 30, P.ink, { align: 'center', fontWeight: 600, letterSpacing: 4, opacity: 0.75 }),
  ], 'ürün minimal sade şık kozmetik parfüm butik');

  def('ur-kutu', 'Ürün tanıtımı', 'Kutuda neler var?', 1080, 1350, PRODP, (P) => [
    txt('Başlık', 'Kutuda neler var?', 80, 90, 920, 76, P.ink, { fontWeight: 900 }),
    ...[0, 1, 2, 3].flatMap((i) => { const x = 80 + (i % 2) * 470, y = 240 + Math.floor(i / 2) * 500; return [rect('Kart ' + (i + 1), x, y, 450, 470, P.b, { radius: 30 }), product('Parça ' + (i + 1), x + 125, y + 40, 200, 320, P, { shadow: null }), txt('Parça adı ' + (i + 1), ['Ana ürün', 'Şarj kablosu', 'Taşıma çantası', 'Kullanım kılavuzu'][i], x, y + 390, 450, 34, P.ink, { align: 'center', fontWeight: 700 })]; }),
    txt('Alt yazı', 'www.markaniz.com', 80, 1270, 920, 30, P.ink, { fontWeight: 600, opacity: 0.7 }),
  ], 'ürün kutu içeriği unboxing set parçalar');

  def('ur-yorum', 'Ürün tanıtımı', 'Müşteri yorumu kartı', 1080, 1080, PRODP, (P) => [
    rect('Kart', 80, 80, 920, 920, P.b, { radius: 40, shadow: shadow(40, 16, 0.12) }),
    product('Ürün fotoğrafı', 700, 520, 240, 420, P),
    txt('Yıldızlar', '★★★★★', 150, 170, 600, 56, P.a, { fontWeight: 400, letterSpacing: 6 }),
    txt('Yorum', '“Gerçek bir müşteri yorumunu buraya yaz. Kısa ve samimi olsun.”', 150, 280, 560, 46, P.ink, { fontFamily: 'Georgia', fontWeight: 400, lineHeight: 1.3 }),
    rect('Ayraç', 150, 700, 80, 6, P.a, { radius: 3 }),
    txt('Müşteri', 'Müşteri adı', 150, 740, 500, 34, P.ink, { fontWeight: 700 }),
    txt('Şehir', 'Şehir · doğrulanmış alıcı', 150, 790, 500, 26, P.ink, { opacity: 0.6, fontWeight: 400 }),
  ], 'ürün müşteri yorumu referans değerlendirme yıldız');

  def('ur-set', 'Ürün tanıtımı', 'Set / paket fiyatı', 1080, 1080, PRODP, (P) => [
    txt('Başlık', 'Set fiyatına al, kazan', 0, 80, 1080, 64, P.ink, { align: 'center', fontWeight: 900 }),
    ...[0, 1, 2].flatMap((i) => [product('Ürün ' + (i + 1), 90 + i * 330, 240, 240, 420, P, { shadow: null }), ...(i < 2 ? [txt('Artı ' + (i + 1), '+', 300 + i * 330, 400, 120, 90, P.a, { align: 'center', fontWeight: 900 })] : [])]),
    rect('Fiyat kutusu', 190, 760, 700, 200, P.a, { radius: 32 }),
    txt('Eski fiyat', 'Ayrı ayrı ₺1.150', 190, 790, 700, 32, '#FFFFFF', { align: 'center', fontWeight: 500, opacity: 0.85, strike: true }),
    txt('Set fiyatı', 'Set ₺849', 190, 840, 700, 84, '#FFFFFF', { align: 'center', fontWeight: 900 }),
  ], 'ürün set paket kombin bundle fiyat kampanya');

  def('ur-adim', 'Ürün tanıtımı', 'Nasıl kullanılır? (3 adım)', 1080, 1350, PRODP, (P) => [
    txt('Başlık', 'Nasıl kullanılır?', 80, 90, 920, 80, P.ink, { fontWeight: 900 }),
    ...[0, 1, 2].flatMap((i) => { const y = 260 + i * 330; return [rect('Adım kartı ' + (i + 1), 80, y, 920, 290, P.b, { radius: 30 }), ell('Numara ' + (i + 1), 120, y + 40, 90, 90, P.a), txt('Numara yazısı ' + (i + 1), String(i + 1), 120, y + 60, 90, 46, '#FFFFFF', { align: 'center', fontWeight: 900 }), txt('Adım başlığı ' + (i + 1), ['Kutuyu aç', 'Şarj et', 'Kullanmaya başla'][i], 250, y + 50, 520, 44, P.ink, { fontWeight: 800 }), txt('Adım açıklaması ' + (i + 1), 'Kısa açıklama: bu adımda ne yapılacağını bir iki cümleyle anlat.', 250, y + 115, 480, 28, P.ink, { opacity: 0.7, fontWeight: 400, lineHeight: 1.4 }), product('Adım görseli ' + (i + 1), 800, y + 30, 140, 230, P, { shadow: null })]; }),
  ], 'ürün nasıl kullanılır adım rehber kullanım talimatı');

  def('ur-katalog', 'Ürün tanıtımı', 'Katalog kapağı (A4)', 1240, 1754, PRODP, (P) => [
    rect('Üst renk', 0, 0, 1240, 1100, P.c),
    ell('Daire', 270, 230, 700, 700, P.b),
    product('Ürün fotoğrafı', 420, 160, 400, 800, P),
    txt('Marka', 'MARKA ADI', 110, 1180, 1020, 40, P.a, { fontWeight: 800, letterSpacing: 12 }),
    txt('Başlık', 'Ürün Kataloğu\n2027', 110, 1250, 1020, 120, P.ink, { fontWeight: 900, lineHeight: 1 }),
    txt('Alt yazı', 'Tüm ürünler · fiyat listesi · iletişim', 110, 1540, 1020, 36, P.ink, { opacity: 0.7, fontWeight: 400 }),
  ], 'ürün katalog kapak a4 broşür');

  // ================= YEMEK (özgün; tabak yer tutucuya dokunup kendi yemek fotoğrafını koy)
  function dish(name, x, y, s, P, o = {}) {
    const c1 = P.c || '#EADFCF', c2 = P.a || '#C0602A';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><radialGradient id="p" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ECE7E0"/></radialGradient><radialGradient id="f" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><circle cx="400" cy="412" r="380" fill="#000" fill-opacity=".12"/><circle cx="400" cy="400" r="380" fill="url(#p)"/><circle cx="400" cy="400" r="300" fill="none" stroke="#DCD5CB" stroke-width="6"/><circle cx="400" cy="400" r="230" fill="url(#f)"/><g fill="#fff" fill-opacity=".55"><ellipse cx="330" cy="330" rx="60" ry="30" transform="rotate(-30 330 330)"/><ellipse cx="470" cy="450" rx="44" ry="22" transform="rotate(20 470 450)"/><circle cx="420" cy="320" r="18"/><circle cx="340" cy="470" r="14"/></g><g transform="translate(400 400)" fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="10" stroke-linejoin="round"><rect x="-56" y="-38" width="112" height="80" rx="14"/><circle cx="0" cy="2" r="24"/></g></svg>`;
    return Object.assign({ type: 'image', name, role: 'photo', src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), nw: 800, nh: 800, fit: 'cover', x, y, w: s, h: s, filters: {}, shadow: shadow(40, 20, 0.22) }, o);
  }
  const dots = (n = 60) => '.'.repeat(n);
  const menuRow = (y, item, desc, price, P, x = 110, w = 1020) => [
    txt('Yemek: ' + item, item, x, y, w * 0.7, 40, P.ink, { fontWeight: 800 }),
    txt('Fiyat: ' + item, price, x + w - 260, y, 260, 40, P.a, { fontWeight: 800, align: 'right' }),
    txt('Açıklama: ' + item, desc, x, y + 52, w - 280, 26, P.ink, { fontWeight: 400, opacity: 0.65 }),
  ];
  const FOODP = [
    { bg: '#1E1A17', ink: '#F7F1E8', a: '#E8A33D', b: '#2C2622', c: '#F2C879' },
    { bg: '#F7F1E8', ink: '#2A211B', a: '#B5462A', b: '#EBDFCF', c: '#E9A15E' },
    { bg: '#0F2A22', ink: '#F4EFE6', a: '#D9B26A', b: '#173A30', c: '#8DBF7A' },
  ];

  def('yk-menu', 'Yemek', 'Restoran menüsü (A4)', 1240, 1754, FOODP, (P) => [
    rect('Üst bant', 0, 0, 1240, 8, P.a),
    txt('Restoran adı', 'LEZZET DURAĞI', 0, 110, 1240, 84, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, letterSpacing: 8 }),
    txt('Slogan', 'ev yapımı · taze · her gün', 0, 214, 1240, 30, P.a, { align: 'center', fontWeight: 600, letterSpacing: 6 }),
    path('Süs', LEAF, 600, 270, 40, 56, P.a, { opacity: 0.8 }),
    txt('Bölüm 1', 'BAŞLANGIÇLAR', 110, 370, 600, 34, P.a, { fontWeight: 800, letterSpacing: 6 }),
    rect('Çizgi 1', 110, 418, 1020, 2, P.ink, { opacity: 0.2 }),
    ...menuRow(450, 'Mercimek çorbası', 'Limon ve kıtır ekmekle', '₺90', P),
    ...menuRow(560, 'Humus tabağı', 'Kızarmış nohut, zeytinyağı, sumak', '₺140', P),
    txt('Bölüm 2', 'ANA YEMEKLER', 110, 700, 600, 34, P.a, { fontWeight: 800, letterSpacing: 6 }),
    rect('Çizgi 2', 110, 748, 1020, 2, P.ink, { opacity: 0.2 }),
    ...menuRow(780, 'Izgara köfte', 'Közlenmiş biber, piyaz, pide', '₺280', P),
    ...menuRow(890, 'Tavuk şiş', 'Bulgur pilavı ve mevsim salatası', '₺250', P),
    ...menuRow(1000, 'Fırın makarna', 'Kremalı mantar sos, kaşar', '₺220', P),
    txt('Bölüm 3', 'TATLILAR', 110, 1140, 600, 34, P.a, { fontWeight: 800, letterSpacing: 6 }),
    rect('Çizgi 3', 110, 1188, 1020, 2, P.ink, { opacity: 0.2 }),
    ...menuRow(1220, 'Fırın sütlaç', 'Fındık ve tarçın', '₺110', P),
    ...menuRow(1330, 'Künefe', 'Antep fıstıklı, sıcak servis', '₺170', P),
    rect('Alt kutu', 110, 1500, 1020, 140, P.b, { radius: 20 }),
    txt('Alt bilgi', 'Sipariş & rezervasyon: 0 500 000 00 00\nAdres, Şehir · @lezzetduragi', 110, 1528, 1020, 30, P.ink, { align: 'center', fontWeight: 500, lineHeight: 1.6 }),
  ], 'yemek menü restoran lokanta fiyat listesi a4 baskı');

  def('yk-gunun', 'Yemek', 'Günün menüsü', 1080, 1080, FOODP, (P) => [
    ell('Arka daire', 470, 140, 820, 820, P.b),
    dish('Yemek fotoğrafı', 520, 220, 620, P),
    txt('Üst etiket', 'GÜNÜN MENÜSÜ', 80, 110, 600, 34, P.a, { fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'Fırında\nkuzu\ntandır', 80, 170, 520, 110, P.ink, { fontFamily: 'Georgia', fontWeight: 700, lineHeight: 1.0 }),
    txt('Yanında', '+ pilav · cacık · tatlı', 80, 560, 480, 34, P.ink, { fontWeight: 500, opacity: 0.8 }),
    rect('Fiyat zemini', 80, 640, 260, 110, P.a, { radius: 55 }),
    txt('Fiyat', '₺320', 80, 664, 260, 60, P.bg, { align: 'center', fontWeight: 900 }),
    txt('Saat', '12:00 – 15:00 arası', 80, 800, 500, 30, P.ink, { fontWeight: 600, opacity: 0.7 }),
    txt('İletişim', 'Paket servis: 0 500 000 00 00', 80, 960, 700, 30, P.ink, { fontWeight: 600 }),
  ], 'yemek günün menüsü öğle yemeği lokanta restoran instagram');

  def('yk-burger', 'Yemek', 'Burger kampanyası (4:5)', 1080, 1350, [
    { bg: '#FFB703', ink: '#1D1D1D', a: '#D62828', b: '#1D1D1D', c: '#FB8500' },
    { bg: '#111111', ink: '#FFFFFF', a: '#FFB703', b: '#D62828', c: '#E85D04' },
    { bg: '#D62828', ink: '#FFFFFF', a: '#FFB703', b: '#1D1D1D', c: '#F77F00' },
  ], (P) => [
    txt('Arka yazı', 'BURGER', -40, 60, 1200, 300, P.c, { fontFamily: 'Arial Black', fontWeight: 900, align: 'center', opacity: 0.35 }),
    dish('Burger fotoğrafı', 160, 260, 760, P),
    path('Rozet', BURST, 760, 200, 260, 260, P.a, { rotation: -10 }),
    txt('Rozet yazısı', '2.\nBEDAVA', 770, 270, 240, 46, P.bg, { align: 'center', fontWeight: 900, rotation: -10, lineHeight: 1 }),
    txt('Başlık', 'ÇİFT KÖFTE\nÇILGINLIĞI', 60, 1060, 960, 92, P.ink, { fontFamily: 'Arial Black', fontWeight: 900, lineHeight: 0.98 }),
    txt('Alt yazı', 'Sadece hafta sonu · gel-al ve paket', 60, 1270, 960, 32, P.ink, { fontWeight: 600 }),
  ], 'yemek burger hamburger fast food kampanya 1 alana 1 bedava');

  def('yk-pizza', 'Yemek', 'Pizza hikâyesi', 1080, 1920, [
    { bg: '#0E3B2E', ink: '#FFF8EC', a: '#E63946', b: '#F1FAEE', c: '#F4A261' },
    { bg: '#FFF8EC', ink: '#1D1D1D', a: '#E63946', b: '#0E3B2E', c: '#F4A261' },
    { bg: '#1D1D1D', ink: '#FFF8EC', a: '#F4A261', b: '#E63946', c: '#E9C46A' },
  ], (P) => [
    txt('Üst', 'TAŞ FIRINDAN', 0, 180, 1080, 40, P.a, { align: 'center', fontWeight: 800, letterSpacing: 12 }),
    txt('Başlık', 'Pizza\nGecesi', 0, 250, 1080, 170, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, italic: true, lineHeight: 0.95 }),
    dish('Pizza fotoğrafı', 140, 660, 800, P),
    rect('Teklif zemini', 140, 1540, 800, 150, P.a, { radius: 75 }),
    txt('Teklif', '2 al 1 öde', 140, 1580, 800, 70, '#FFFFFF', { align: 'center', fontWeight: 900 }),
    txt('Alt', 'Her salı · 18:00’den sonra', 0, 1750, 1080, 36, P.ink, { align: 'center', fontWeight: 600 }),
  ], 'yemek pizza story hikaye kampanya 2 al 1 öde');

  def('yk-kahvalti', 'Yemek', 'Serpme kahvaltı', 1080, 1080, [
    { bg: '#FFF6E5', ink: '#3A2A1A', a: '#E07A1F', b: '#FFFFFF', c: '#F6C453' },
    { bg: '#E9F1E4', ink: '#1F3326', a: '#C2410C', b: '#FFFFFF', c: '#86B66E' },
    { bg: '#2B1D14', ink: '#FFF6E5', a: '#F6C453', b: '#3B2A1E', c: '#E07A1F' },
  ], (P) => [
    dish('Tabak 1', 60, 80, 420, P),
    dish('Tabak 2', 600, 60, 360, P),
    dish('Tabak 3', 700, 470, 320, P),
    txt('Başlık', 'Serpme\nKahvaltı', 70, 560, 600, 120, P.ink, { fontFamily: 'Georgia', fontWeight: 700, lineHeight: 0.95 }),
    txt('Detay', '30 çeşit · sınırsız çay', 70, 860, 600, 38, P.a, { fontWeight: 800 }),
    txt('Fiyat', 'Kişi başı ₺450', 70, 920, 600, 34, P.ink, { fontWeight: 600 }),
    txt('Saat', 'Hafta sonu 09:00 – 13:00', 70, 980, 700, 28, P.ink, { fontWeight: 500, opacity: 0.7 }),
  ], 'yemek kahvaltı brunch serpme hafta sonu kafe');

  def('yk-kafe', 'Yemek', 'Kahve kampanyası (hikâye)', 1080, 1920, [
    { bg: '#3E2723', ink: '#FBEFE3', a: '#D7A86E', b: '#5D4037', c: '#A1887F' },
    { bg: '#F3E9DC', ink: '#2E1F17', a: '#8C5A3C', b: '#E4D3BF', c: '#C69C72' },
    { bg: '#14213D', ink: '#FFFFFF', a: '#FCA311', b: '#22355C', c: '#E5E5E5' },
  ], (P) => [
    ell('Arka daire', 90, 380, 900, 900, P.b),
    dish('Kahve fotoğrafı', 190, 480, 700, P),
    txt('Üst', 'GÜNE İYİ BAŞLA', 0, 200, 1080, 40, P.a, { align: 'center', fontWeight: 800, letterSpacing: 10 }),
    txt('Başlık', 'Her kahve\nyanına kurabiye', 0, 1340, 1080, 90, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, lineHeight: 1.05 }),
    txt('Alt', '08:00 – 11:00 · tüm şubelerde', 0, 1580, 1080, 36, P.ink, { align: 'center', fontWeight: 500, opacity: 0.8 }),
    txt('Marka', '@kahvedurağı', 0, 1760, 1080, 34, P.a, { align: 'center', fontWeight: 700 }),
  ], 'yemek kahve kafe cafe story hikaye kampanya');

  def('yk-pastane', 'Yemek', 'Pastane / tatlı', 1080, 1350, [
    { bg: '#FCE4EC', ink: '#4A1D2E', a: '#C2185B', b: '#FFFFFF', c: '#F8BBD0' },
    { bg: '#FFF8E1', ink: '#4E342E', a: '#8D6E63', b: '#FFFFFF', c: '#FFE082' },
    { bg: '#2D1B2E', ink: '#FCE4EC', a: '#F48FB1', b: '#3E2740', c: '#CE93D8' },
  ], (P) => [
    rect('Kart', 70, 70, 940, 1210, P.b, { radius: 40, shadow: shadow(40, 16, 0.12) }),
    dish('Tatlı fotoğrafı', 200, 150, 680, P),
    txt('Etiket', 'GÜNÜN TATLISI', 0, 880, 1080, 32, P.a, { align: 'center', fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'Frambuazlı Cheesecake', 120, 930, 840, 70, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700 }),
    txt('Açıklama', 'Taze meyve · ev yapımı bisküvi taban', 120, 1030, 840, 30, P.ink, { align: 'center', fontWeight: 400, opacity: 0.7 }),
    txt('Fiyat', 'Dilim ₺120 · Bütün ₺850', 120, 1110, 840, 38, P.a, { align: 'center', fontWeight: 800 }),
  ], 'yemek pastane tatlı pasta cheesecake fırın butik');

  def('yk-paket', 'Yemek', 'Paket servis / sipariş', 1080, 1080, FOODP, (P) => [
    rect('Sol panel', 0, 0, 540, 1080, P.a),
    dish('Yemek fotoğrafı', 300, 200, 680, P),
    txt('Başlık', 'Kapına\ngeliyoruz!', 60, 120, 460, 80, P.bg, { fontFamily: 'Arial Black', fontWeight: 900, lineHeight: 1.0 }),
    txt('Alt', 'Sıcak ve hızlı paket servis', 60, 360, 420, 32, P.bg, { fontWeight: 600 }),
    rect('Telefon zemini', 60, 860, 640, 110, P.ink, { radius: 55 }),
    txt('Telefon', '☎  0 500 000 00 00', 60, 892, 640, 46, P.bg, { align: 'center', fontWeight: 800 }),
    txt('Uygulamalar', 'Online sipariş uygulamalarında da biz varız', 60, 1000, 960, 26, P.ink, { fontWeight: 500, opacity: 0.8 }),
  ], 'yemek paket servis sipariş eve servis teslimat restoran');

  def('yk-iftar', 'Yemek', 'İftar menüsü', 1080, 1350, [
    { bg: '#0B1D3A', ink: '#F8EBD0', a: '#D4AF37', b: '#132B52', c: '#E9C77B' },
    { bg: '#2A0E2E', ink: '#F8EBD0', a: '#E0B04B', b: '#3D1842', c: '#F2D28B' },
    { bg: '#F8EBD0', ink: '#3A2A12', a: '#9C6B1A', b: '#EEDCB5', c: '#D4AF37' },
  ], (P) => [
    path('Hilal', 'M60 5 A45 45 0 1 0 95 75 A36 36 0 1 1 60 5 Z', 820, 80, 160, 160, P.a),
    path('Yıldız', STAR, 760, 120, 40, 40, P.a),
    txt('Üst', 'RAMAZAN’A ÖZEL', 80, 130, 600, 34, P.a, { fontWeight: 800, letterSpacing: 8 }),
    txt('Başlık', 'İftar\nMenüsü', 80, 190, 600, 120, P.ink, { fontFamily: 'Georgia', fontWeight: 700, lineHeight: 0.95 }),
    rect('Liste kutusu', 80, 520, 920, 520, P.b, { radius: 30 }),
    txt('Menü', 'Hurma & zeytin · Ramazan pidesi\nEzogelin çorbası\nHünkâr beğendi ya da tavuk şiş\nPilav · mevsim salatası\nGüllaç', 130, 580, 820, 40, P.ink, { fontWeight: 600, lineHeight: 1.75, align: 'center' }),
    txt('Fiyat', 'Kişi başı ₺550', 0, 1110, 1080, 54, P.a, { align: 'center', fontWeight: 900 }),
    txt('Rezervasyon', 'Rezervasyon: 0 500 000 00 00', 0, 1220, 1080, 30, P.ink, { align: 'center', fontWeight: 500, opacity: 0.8 }),
  ], 'yemek iftar ramazan menü sahur restoran');

  def('yk-tv', 'Yemek', 'Menü ekranı (TV, yatay)', 1920, 1080, FOODP, (P) => [
    dish('Öne çıkan yemek', 1100, 120, 840, P),
    txt('Başlık', 'MENÜ', 110, 90, 800, 110, P.ink, { fontFamily: 'Arial Black', fontWeight: 900, letterSpacing: 10 }),
    rect('Çizgi', 110, 230, 120, 10, P.a, { radius: 5 }),
    ...menuRow(300, 'Klasik burger', 'Cheddar, karamelize soğan', '₺260', P, 110, 900),
    ...menuRow(430, 'Tavuk dürüm', 'Közlenmiş sebze, yoğurt sos', '₺190', P, 110, 900),
    ...menuRow(560, 'Izgara köfte', 'Pilav ve salata ile', '₺280', P, 110, 900),
    ...menuRow(690, 'Patates kızartması', 'Baharatlı, büyük boy', '₺90', P, 110, 900),
    ...menuRow(820, 'Ayran / limonata', 'Ev yapımı', '₺45', P, 110, 900),
    path('Rozet', BURST, 1640, 700, 230, 230, P.a),
    txt('Rozet yazısı', 'MENÜ\n₺340', 1650, 760, 210, 44, P.bg, { align: 'center', fontWeight: 900, lineHeight: 1.05 }),
  ], 'yemek menü ekranı tv dijital menü panosu tabela fast food yatay');

  def('yk-masa', 'Yemek', 'Masa kartı (QR menü)', 1240, 1748, FOODP, (P) => [
    rect('Çerçeve', 60, 60, 1120, 1628, 'none', { stroke: P.a, strokeWidth: 4, radius: 30 }),
    txt('Restoran', 'LEZZET DURAĞI', 0, 200, 1240, 64, P.ink, { align: 'center', fontFamily: 'Georgia', fontWeight: 700, letterSpacing: 6 }),
    txt('Başlık', 'Menümüzü\ntelefonundan gör', 0, 400, 1240, 92, P.ink, { align: 'center', fontWeight: 800, lineHeight: 1.05 }),
    rect('QR alanı', 370, 700, 500, 500, '#FFFFFF', { radius: 24 }),
    txt('QR notu', 'QR kodunu buraya ekle:\nMenü › QR kod', 370, 900, 500, 30, '#555555', { align: 'center', fontWeight: 600, lineHeight: 1.4 }),
    txt('Alt', 'Kamerayı aç, koda tut', 0, 1290, 1240, 40, P.a, { align: 'center', fontWeight: 700 }),
    txt('Wi-Fi', 'Wi-Fi: LezzetMisafir · Şifre: afiyetolsun', 0, 1520, 1240, 32, P.ink, { align: 'center', fontWeight: 500, opacity: 0.8 }),
  ], 'yemek masa kartı qr menü restoran kafe wifi baskı');

  def('yk-acilis', 'Yemek', 'Açılış duyurusu', 1080, 1350, [
    { bg: '#F4EDE4', ink: '#1F1A17', a: '#2F6B4F', b: '#FFFFFF', c: '#B7D3C2' },
    { bg: '#1F1A17', ink: '#F4EDE4', a: '#E8A33D', b: '#2C2622', c: '#F2C879' },
    { bg: '#FDF0E7', ink: '#2A1610', a: '#C2410C', b: '#FFFFFF', c: '#FDBA8C' },
  ], (P) => [
    photo('Mekân fotoğrafı', 0, 0, 1080, 760, P),
    rect('Tarih rozeti', 760, 680, 240, 160, P.a, { radius: 24, shadow: shadow(30, 12, 0.25) }),
    txt('Gün', '15', 760, 690, 240, 90, '#FFFFFF', { align: 'center', fontWeight: 900 }),
    txt('Ay', 'KASIM', 760, 790, 240, 30, '#FFFFFF', { align: 'center', fontWeight: 700, letterSpacing: 6 }),
    txt('Üst', 'KAPILARIMIZI AÇIYORUZ', 80, 860, 700, 32, P.a, { fontWeight: 800, letterSpacing: 6 }),
    txt('Başlık', 'Yeni şubemiz\nhizmetinizde', 80, 910, 900, 84, P.ink, { fontFamily: 'Georgia', fontWeight: 700, lineHeight: 1.05 }),
    txt('Alt', 'Açılışa özel ilk gün tüm menüde %20 indirim', 80, 1140, 900, 32, P.ink, { fontWeight: 500, opacity: 0.8 }),
    txt('Adres', 'Adres, Şehir', 80, 1240, 900, 30, P.a, { fontWeight: 700 }),
  ], 'yemek açılış yeni şube restoran kafe duyuru');

  // ---------- dış arayüz
  const resolve = (v, P) => (typeof v === 'string' && v.startsWith('$') ? P[v.slice(1)] : v);
  // hareketli şablonlar: açılınca katmanlar hazır animasyonla gelir (Animasyon ve video → MP4)
  const MOTION = { 'ur-lansman': 'dynamic', 'ur-story': 'bouncy', 'ur-banner': 'cinema', 'ur-minimal': 'calm', 'ur-ozellik': 'dynamic', 'yk-gunun': 'dynamic', 'yk-burger': 'bouncy', 'yk-pizza': 'cinema', 'yk-kafe': 'calm', 'yk-tv': 'dynamic', 'ig-indirim': 'bouncy', 'ig-urun': 'dynamic', 'st-kampanya': 'dynamic', 'st-etkinlik': 'cinema', 'ig-alinti': 'calm', 'af-konser': 'cinema', 'fy-paket': 'dynamic', 'yt-kapak': 'bouncy' };
  T.forEach((t) => { if (MOTION[t.id]) { t.anim = MOTION[t.id]; t.tags = (t.tags || '') + ' hareketli animasyon video reels'; } });
  function animate(layers, style, W, H) {
    const cfg = { dynamic: [0.16, 0.6], calm: [0.35, 1.1], bouncy: [0.14, 0.7], cinema: [0.5, 1.4] }[style] || [0.16, 0.6];
    let t = 0;
    layers.forEach((l) => {
      const big = l.w * l.h > W * H * 0.5;
      let type = big ? 'fade' : l.type === 'text' ? (l.fontSize > H * 0.06 ? 'up' : 'fade') : l.type === 'image' ? 'zoom' : 'pop';
      if (style === 'bouncy' && !big) type = 'pop';
      if (style === 'calm' && !big) type = l.type === 'text' ? 'fade' : 'zoom';
      if (style === 'cinema' && !big) type = l.type === 'text' ? 'wipe' : 'fade';
      l.anim = { type, delay: +t.toFixed(2), dur: big ? cfg[1] : cfg[1] + 0.1 };
      if (!big) t += cfg[0];
    });
  }
  function instantiate(t, pi = 0, customP) {
    const P = customP || t.palettes[Math.max(0, Math.min(t.palettes.length - 1, pi))];
    const layers = t.build(P).map((l) => {
      const c = JSON.parse(JSON.stringify(l));
      c.fill = resolve(c.fill, P);
      if (c.type === 'text') c.h = c.h || c.fontSize * 1.2;
      return c;
    });
    if (t.anim) animate(layers, t.anim, t.w, t.h);
    // şablonlar her cihazda aynı görünsün: sistem fontları yerine gömülü kaliteli aileler
    const FONT_MAP = { Arial: ['Inter'], 'Segoe UI': ['Inter'], Georgia: ['Lora'], 'Arial Black': ['Inter', 900], Impact: ['TeX Gyre Heros Cn', 700], 'Times New Roman': ['TeX Gyre Termes'] };
    layers.forEach((l) => { if (l.type === 'text' && FONT_MAP[l.fontFamily]) { const [f, w] = FONT_MAP[l.fontFamily]; l.fontFamily = f; if (w) l.fontWeight = w; } });
    if (customP && (customP._fh || customP._fb)) layers.forEach((l) => { if (l.type === 'text') l.fontFamily = (l.fontSize >= 56 ? customP._fh : customP._fb) || l.fontFamily; });
    return { width: t.w, height: t.h, background: P.bg, layers, name: t.name, meta: Object.assign({ template: t.id, palette: customP ? 'brand' : pi }, t.anim ? { animStyle: t.anim } : {}) };
  }
  window.Library = { templates: T, instantiate, cats: ['Ürün tanıtımı', 'Hareketli', ...[...new Set(T.map((t) => t.cat))].filter((c) => c !== 'Ürün tanıtımı')] };
})();
