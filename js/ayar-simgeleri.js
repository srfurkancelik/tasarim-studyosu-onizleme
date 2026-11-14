/* v6.8: ayarlar ve marka kart başlıklarına renkli simge */
(function () {
  const MAP = [[/Kullanıcı/i, 'lock', 'c1'], [/Görünüm/i, 'palette', 'c4'], [/Geri dönüşüm|hatırlatma/i, 'trash', 'c3'], [/Yapay zeka|Claude|Ollama|OpenAI|Yerel motor/i, 'sparkle', 'c1'], [/Görsel üretimi/i, 'image', 'c4'], [/Sistem durumu/i, 'shield', 'c2'], [/Telefon/i, 'phone', ''], [/PIN/i, 'lock', 'c3'], [/Proje işlemleri|Yedek/i, 'download', 'c2'], [/Kimlik/i, 'tag', 'c1'], [/Renkler/i, 'palette', 'c4'], [/Yazı tipleri/i, 'font', ''], [/Logo/i, 'image', 'c2'], [/Bağış/i, 'heart', 'c2'], [/İletişim/i, 'phone', 'c3'], [/Ses|Ton/i, 'chat', '']];
  const deco = () => {
    const pg = document.querySelector('#view .page.page-ayarlar, #view .page.page-marka'); if (!pg) return;
    pg.querySelectorAll('section h3, .panel > h3, .card h3').forEach((h) => {
      if (h.querySelector('.h3-ic') || h.closest('.dialog')) return;
      const m = MAP.find(([re]) => re.test(h.textContent)); if (!m || !window.icon) return;
      const s = document.createElement('span'); s.className = 'h3-ic ' + m[2]; s.innerHTML = window.icon(m[1]);
      h.prepend(s); h.style.display = 'flex'; h.style.alignItems = 'center';
    });
  };
  new MutationObserver(() => { clearTimeout(deco.t); deco.t = setTimeout(deco, 150); }).observe(document.documentElement, { childList: true, subtree: true });
})();
