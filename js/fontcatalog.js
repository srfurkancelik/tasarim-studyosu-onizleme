/* Tasarım Stüdyosu — yazı tipi kataloğu
   En çok kullanılan Google Fonts aileleri (hepsi açık lisanslı: OFL / Apache, ticari kullanım serbest).
   Windows sürümünde ilk açılışta tüm stilleri (ince → siyah, italikler) bilgisayara indirilir, sonra internetsiz çalışır. */
(function () {
  const S = 'sans', SE = 'serif', D = 'display', SC = 'script', M = 'mono';
  // [aile, kategori, kısa açıklama]
  const LIST = [
    ['Roboto', S, 'Dünyanın en çok kullanılan web fontu'], ['Open Sans', S, 'Sıcak, çok okunaklı metin fontu'], ['Lato', S, 'Dengeli, kurumsal ve şık'],
    ['Montserrat', S, 'Geometrik, güçlü başlıklar'], ['Poppins', S, 'Geometrik, modern marka fontu'], ['Raleway', S, 'İnce ve zarif başlıklar'],
    ['Nunito', S, 'Yuvarlak uçlu, samimi'], ['Nunito Sans', S, 'Nunito’nun sade hâli'], ['Roboto Condensed', S, 'Dar, yer kazandıran'],
    ['Source Sans 3', S, 'Adobe’nin açık kaynak metin fontu'], ['Work Sans', S, 'Modern grotesk'], ['Rubik', S, 'Hafif yuvarlak köşeli'],
    ['Barlow', S, 'Sade, hafif dar grotesk'], ['Barlow Condensed', S, 'Dar başlık ve etiketler'], ['Mulish', S, 'Minimal, temiz metin'],
    ['Manrope', S, 'Teknoloji ve yazılım markaları'], ['DM Sans', S, 'Küçük boyutta net, geometrik'], ['Plus Jakarta Sans', S, 'Modern, ferah arayüz'],
    ['Outfit', S, 'Geometrik, cesur ve sade'], ['Figtree', S, 'Dostça ve net'], ['Quicksand', S, 'Yuvarlak, yumuşak'],
    ['Josefin Sans', S, 'Vintage geometrik, zarif'], ['Kanit', S, 'Köşeli, enerjik başlıklar'], ['Archivo', S, 'Güçlü grotesk, geniş aile'],
    ['Ubuntu', S, 'Karakterli, okunaklı'], ['Fira Sans', S, 'Mozilla’nın okunaklı fontu'], ['Karla', S, 'Grotesk, karakterli metin'],
    ['Cabin', S, 'Hümanist, sıcak'], ['IBM Plex Sans', S, 'Kurumsal ve teknik'], ['Space Grotesk', S, 'Teknolojik, özgün'],
    ['Sora', S, 'Geniş, modern'], ['Urbanist', S, 'Geometrik, şehirli'], ['Lexend', S, 'Okunabilirlik için tasarlandı'],
    ['Red Hat Display', S, 'Başlıklar için güçlü'], ['Exo 2', S, 'Fütüristik, teknoloji'], ['Titillium Web', S, 'Teknik, dar'],
    ['Bricolage Grotesque', S, 'Karakterli, trend grotesk'], ['Hanken Grotesk', S, 'Sade, çok yönlü metin'], ['Geist', S, 'Modern teknoloji grotesk'],
    ['Jost', S, 'Futura benzeri geometrik'], ['PT Sans', S, 'Okunaklı hümanist'], ['Noto Sans', S, 'Her dili destekleyen'],
    ['Libre Franklin', S, 'Klasik Franklin Gothic yorumu'], ['Public Sans', S, 'Nötr, resmî'], ['Archivo Narrow', S, 'Dar, gazete tarzı'],
    ['Playfair Display', SE, 'Lüks, moda ve dergi başlıkları'], ['Merriweather', SE, 'Ekranda çok okunaklı serif'], ['Roboto Slab', SE, 'Kalın tırnaklı (slab)'],
    ['PT Serif', SE, 'Klasik, güvenilir'], ['Libre Baskerville', SE, 'Kitap ve davetiye'], ['Cormorant Garamond', SE, 'İnce, lüks Garamond'],
    ['EB Garamond', SE, 'Klasik Garamond'], ['DM Serif Display', SE, 'Yüksek kontrastlı başlık'], ['Noto Serif', SE, 'Her dili destekleyen serif'],
    ['Crimson Pro', SE, 'Zarif kitap fontu'], ['Cinzel', SE, 'Roma yazıtı, lüks büyük harf'], ['Prata', SE, 'Didone, zarif'],
    ['Bodoni Moda', SE, 'Moda dergisi Bodoni'], ['Fraunces', SE, 'Yumuşak, karakterli serif'], ['Arvo', SE, 'Geometrik slab'],
    ['Zilla Slab', SE, 'Modern slab'], ['Source Serif 4', SE, 'Adobe’nin metin serifi'], ['Spectral', SE, 'Ekran için zarif serif'],
    ['Libre Caslon Text', SE, 'Klasik Caslon'], ['Marcellus', SE, 'Zarif, oymalı harf hissi'], ['Bitter', SE, 'Ekran için slab'], ['Alegreya', SE, 'Edebî, kaligrafik serif'],
    ['Oswald', D, 'Dar, güçlü başlık (en popülerlerden)'], ['Bebas Neue', D, 'Afiş ve poster büyük harf'], ['Anton', D, 'Çok kalın dar başlık'],
    ['Archivo Black', D, 'Siyah, iddialı başlık'], ['Abril Fatface', D, 'Dergi tarzı kalın serif'], ['Alfa Slab One', D, 'Kalın slab başlık'],
    ['Bungee', D, 'Tabela tarzı'], ['Titan One', D, 'Tombul, eğlenceli'], ['Fredoka', D, 'Yuvarlak, çocuk ve oyuncak'],
    ['Righteous', D, 'Retro, akıcı'], ['Teko', D, 'Dar, spor ve teknoloji'], ['Russo One', D, 'Sportif, güçlü'],
    ['Lilita One', D, 'Kalın, sevimli'], ['Chakra Petch', D, 'Köşeli, oyun ve teknoloji'], ['Big Shoulders Display', D, 'Dar, endüstriyel'],
    ['Unbounded', D, 'Geniş, modern'], ['Staatliches', D, 'Dar büyük harf'], ['Passion One', D, 'Kalın, yuvarlak başlık'],
    ['Dancing Script', SC, 'Akıcı el yazısı'], ['Pacifico', SC, 'Retro, sörf tarzı'], ['Great Vibes', SC, 'Zarif kaligrafi, davetiye'],
    ['Caveat', SC, 'Doğal el yazısı notu'], ['Satisfy', SC, 'Fırça el yazısı'], ['Kaushan Script', SC, 'Fırça, dinamik'],
    ['Lobster', SC, 'Kalın retro el yazısı'], ['Allura', SC, 'İnce, zarif imza'], ['Parisienne', SC, 'Fransız zarafeti'],
    ['Sacramento', SC, 'İnce, monoline imza'], ['Amatic SC', SC, 'El çizimi, dar'], ['Permanent Marker', SC, 'Keçeli kalem'],
    ['Courgette', SC, 'Okunaklı el yazısı'], ['Cookie', SC, 'Tatlı, yuvarlak el yazısı'], ['Yellowtail', SC, '50’ler tabela yazısı'],
    ['Playball', SC, 'Spor tarzı el yazısı'], ['Mrs Saint Delafield', SC, 'İmza gibi ince el yazısı'], ['Herr Von Muellerhoff', SC, 'Sivri uçlu imza yazısı'], ['Alex Brush', SC, 'Klasik kaligrafi'],
    ['JetBrains Mono', M, 'Kod ve teknik'], ['Roboto Mono', M, 'Sade eş aralıklı'], ['Space Mono', M, 'Retro, karakterli'],
    ['IBM Plex Mono', M, 'Kurumsal mono'], ['Fira Code', M, 'Kod fontu'],
  ];
  // profesyonel başlık + metin eşleşmeleri
  const PAIRS = [
    ['Montserrat', 'Open Sans', 'Modern kurumsal'], ['Playfair Display', 'Lato', 'Lüks / moda'], ['Poppins', 'Inter', 'Teknoloji / ürün'],
    ['Oswald', 'Roboto', 'Kampanya / güçlü'], ['Bebas Neue', 'Montserrat', 'Afiş / etkinlik'], ['DM Serif Display', 'DM Sans', 'Zarif butik'],
    ['Cormorant Garamond', 'Raleway', 'Kozmetik / güzellik'], ['Archivo Black', 'Work Sans', 'Cesur marka'], ['Fraunces', 'Figtree', 'Sıcak, el yapımı'],
    ['Abril Fatface', 'Lora', 'Dergi / editoryal'], ['Anton', 'Barlow', 'Spor / enerji'], ['Fredoka', 'Nunito', 'Çocuk / eğlenceli'],
    ['Cinzel', 'Lora', 'Kurumsal lüks'], ['Space Grotesk', 'Inter', 'Yazılım / startup'], ['Great Vibes', 'Montserrat', 'Düğün / davetiye'],
    ['Pacifico', 'Quicksand', 'Kafe / tatlı'], ['Roboto Slab', 'Roboto', 'Güvenilir hizmet'], ['Bricolage Grotesque', 'Hanken Grotesk', 'Trend / genç'],
  ];
  const CATS = { sans: 'Sans (tırnaksız)', serif: 'Serif (tırnaklı)', display: 'Başlık / afiş', script: 'El yazısı', mono: 'Eş aralıklı' };
  window.FontCatalog = { LIST: LIST.map(([family, cat, desc]) => ({ family, cat, desc })), PAIRS, CATS };
})();
