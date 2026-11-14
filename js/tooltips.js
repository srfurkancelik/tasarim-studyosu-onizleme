/* Tasarım Stüdyosu — zengin araç ipuçları (Photoshop tarzı)
   Sol bardaki bir aracın üzerine gelince (telefonda basılı tutunca) adı, kısayolu,
   ne işe yaradığı ve aracın nasıl kullanıldığını gösteren döngülü küçük bir video çıkar.
   Videolar tarayıcıda canlı çizilir: dosya indirmez, her temada net görünür. */
(function () {
  'use strict';
  const W = 264, H = 150, DUR = 3600;
  const C = { bg: '#1B1E25', board: '#FFFFFF', line: '#D7DBE3', mag: '#E2197C', cyan: '#19A9E1', yel: '#F2C230', ink: '#14161B', ok: '#3CC48A', soft: '#F1EEE9' };

  // ---------- küçük yardımcılar
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const seg = (t, a, b) => ease(clamp((t - a) / (b - a)));
  const lerp = (a, b, t) => a + (b - a) * t;
  const P = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
  function path(t, pts) { // noktalar arasında sırayla ilerle
    const n = pts.length - 1, f = clamp(t) * n, i = Math.min(n - 1, Math.floor(f));
    return P(pts[i], pts[i + 1], ease(f - i));
  }
  function board(x) { x.fillStyle = C.bg; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,.035)'; for (let i = 0; i < W; i += 12) for (let j = 0; j < H; j += 12) x.fillRect(i, j, 1, 1); x.fillStyle = C.board; rr(x, 34, 16, 196, 118, 6); x.fill(); }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function cursor(x, p, down, kind = 'arrow') {
    x.save(); x.translate(p.x, p.y);
    if (down) { x.fillStyle = 'rgba(226,25,124,.25)'; x.beginPath(); x.arc(0, 0, 9, 0, 7); x.fill(); }
    x.lineWidth = 1.4; x.strokeStyle = '#fff'; x.fillStyle = C.ink;
    if (kind === 'arrow') { x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 15); x.lineTo(4, 11.5); x.lineTo(7, 18); x.lineTo(9.5, 17); x.lineTo(6.5, 10.5); x.lineTo(11.5, 10.5); x.closePath(); x.fill(); x.stroke(); }
    else if (kind === 'cross') { x.strokeStyle = C.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(-7, 0); x.lineTo(7, 0); x.moveTo(0, -7); x.lineTo(0, 7); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 1.2; x.stroke(); }
    else if (kind === 'ibeam') { x.strokeStyle = C.ink; x.lineWidth = 3; x.beginPath(); x.moveTo(-3, -8); x.lineTo(3, -8); x.moveTo(0, -8); x.lineTo(0, 8); x.moveTo(-3, 8); x.lineTo(3, 8); x.stroke(); x.strokeStyle = '#fff'; x.lineWidth = 1.2; x.stroke(); }
    else if (kind === 'hand') { x.font = '18px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(down ? '✊' : '✋', 0, 0); }
    else if (kind === 'pen') { x.rotate(-0.6); x.fillStyle = C.ink; x.beginPath(); x.moveTo(0, 0); x.lineTo(-4, -9); x.lineTo(-4, -20); x.lineTo(4, -20); x.lineTo(4, -9); x.closePath(); x.fill(); x.stroke(); }
    else if (kind === 'brush') { x.rotate(-0.7); x.fillStyle = '#8B5E3C'; x.fillRect(-2, -24, 4, 14); x.fillStyle = C.ink; x.beginPath(); x.moveTo(-3, -10); x.lineTo(3, -10); x.lineTo(0, 0); x.closePath(); x.fill(); }
    x.restore();
  }
  function sel(x, a, b, w, h, handles = true) {
    x.save(); x.strokeStyle = C.cyan; x.lineWidth = 1.3; x.strokeRect(a, b, w, h);
    if (handles) { x.fillStyle = '#fff'; [[a, b], [a + w, b], [a, b + h], [a + w, b + h], [a + w / 2, b], [a + w / 2, b + h], [a, b + h / 2], [a + w, b + h / 2]].forEach(([u, v]) => { x.fillRect(u - 2.5, v - 2.5, 5, 5); x.strokeRect(u - 2.5, v - 2.5, 5, 5); }); }
    x.restore();
  }
  function badge(x, text, t, a = 0.1, b = 0.95) { // alttaki kısa açıklama şeridi
    const o = clamp(Math.min((t - a) / 0.06, (b - t) / 0.06)); if (o <= 0) return;
    x.save(); x.globalAlpha = o; x.font = '600 10.5px Segoe UI, system-ui, sans-serif'; const w = x.measureText(text).width + 16;
    x.fillStyle = 'rgba(20,22,27,.86)'; rr(x, (W - w) / 2, H - 22, w, 17, 8.5); x.fill(); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H - 13.5); x.restore();
  }
  function star(x, cx, cy, r, rot = 0) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr2 = i % 2 ? r * 0.45 : r; x.lineTo(cx + rr2 * Math.cos(a), cy + rr2 * Math.sin(a)); } x.closePath(); }
  function dims(x, p, w, h) { x.save(); x.font = '600 9px Segoe UI, sans-serif'; const s = `${Math.round(w * 5)} × ${Math.round(h * 5)}`; const tw = x.measureText(s).width + 8; x.fillStyle = C.cyan; rr(x, p.x + 10, p.y + 8, tw, 13, 3); x.fill(); x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(s, p.x + 14, p.y + 14.5); x.restore(); }
  function photoBg(x) { const g = x.createLinearGradient(34, 16, 230, 134); g.addColorStop(0, '#F6C88B'); g.addColorStop(1, '#D9785B'); x.fillStyle = g; rr(x, 34, 16, 196, 118, 6); x.fill(); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.moveTo(34, 120); x.lineTo(110, 70); x.lineTo(160, 104); x.lineTo(200, 84); x.lineTo(230, 110); x.lineTo(230, 134); x.lineTo(34, 134); x.closePath(); x.fill(); }

  // ---------- her araç için sahne (t: 0→1 döngü)
  const DEMOS = {
    select(x, t) {
      board(x);
      const mv = seg(t, 0.32, 0.55), rs = seg(t, 0.66, 0.86);
      const bx = lerp(64, 120, mv), by = lerp(44, 52, mv), bw = lerp(56, 84, rs), bh = lerp(44, 60, rs);
      x.fillStyle = C.mag; rr(x, bx, by, bw, bh, 8); x.fill();
      x.fillStyle = C.yel; x.beginPath(); x.arc(186, 104, 14, 0, 7); x.fill();
      const on = t > 0.2;
      if (on) sel(x, bx, by, bw, bh);
      const p = t < 0.2 ? P({ x: 200, y: 128 }, { x: 88, y: 64 }, seg(t, 0, 0.18)) : t < 0.6 ? { x: 88 + (bx - 64), y: 64 + (by - 44) } : t < 0.66 ? P({ x: 144, y: 72 }, { x: bx + 56, y: by + 44 }, seg(t, 0.6, 0.66)) : { x: bx + bw, y: by + bh };
      cursor(x, p, (t > 0.2 && t < 0.56) || (t > 0.66 && t < 0.87));
      badge(x, t < 0.6 ? 'Tıkla, sürükleyerek taşı' : 'Köşeden boyutlandır (Shift: oranı koru)', t, 0.04, 0.97);
    },
    hand(x, t) {
      const dx = Math.sin(seg(t, 0.15, 0.85) * Math.PI) * -46;
      x.fillStyle = C.bg; x.fillRect(0, 0, W, H); x.save(); x.translate(dx, 0);
      x.fillStyle = C.board; rr(x, 34, 16, 196, 118, 6); x.fill(); x.fillStyle = C.mag; rr(x, 60, 40, 70, 50, 8); x.fill(); x.fillStyle = C.cyan; x.beginPath(); x.arc(180, 80, 26, 0, 7); x.fill(); x.restore();
      cursor(x, { x: 140 + dx, y: 78 }, t > 0.15 && t < 0.85, 'hand');
      badge(x, 'Sürükleyerek tuvali kaydır · Boşluk tuşu da olur', t, 0.04, 0.97);
    },
    text(x, t) {
      board(x);
      const word = 'Yaz indirimi', n = Math.floor(clamp((t - 0.3) / 0.45) * word.length);
      const p = P({ x: 210, y: 120 }, { x: 64, y: 72 }, seg(t, 0, 0.22));
      if (t > 0.26) {
        x.font = '800 22px Segoe UI, sans-serif'; x.fillStyle = C.ink; x.textBaseline = 'middle'; const s = word.slice(0, n); x.fillText(s, 64, 72);
        const cw = x.measureText(s).width; if (Math.floor(t * 12) % 2 || t < 0.75) { x.fillStyle = C.mag; x.fillRect(64 + cw + 1, 60, 2, 24); }
        if (t > 0.8) sel(x, 60, 56, cw + 8, 32, false);
      }
      cursor(x, t > 0.26 ? { x: 56, y: 92 } : p, t > 0.22 && t < 0.3, 'ibeam');
      badge(x, t < 0.8 ? 'Tıkla ve yaz' : 'Çift tıklayınca yeniden düzenlenir', t, 0.04, 0.97);
    },
    rect(x, t) { shapeDemo(x, t, 'rect', 'Sürükleyerek çiz · Shift: kare'); },
    ellipse(x, t) { shapeDemo(x, t, 'ellipse', 'Sürükleyerek çiz · Shift: tam daire'); },
    star(x, t) { shapeDemo(x, t, 'star', 'Sürükle · köşe sayısını sağ panelden değiştir'); },
    triangle(x, t) { shapeDemo(x, t, 'triangle', 'Sürükleyerek çiz'); },
    line(x, t) {
      board(x);
      const a = { x: 66, y: 104 }, b = { x: 196, y: 44 }, d = seg(t, 0.22, 0.68), e = P(a, b, d);
      if (t > 0.2) { x.strokeStyle = C.ink; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(e.x, e.y); x.stroke();
        if (t > 0.72) { const ang = Math.atan2(b.y - a.y, b.x - a.x); x.fillStyle = C.ink; x.beginPath(); x.moveTo(b.x + 6 * Math.cos(ang), b.y + 6 * Math.sin(ang)); x.lineTo(b.x - 12 * Math.cos(ang - 0.45), b.y - 12 * Math.sin(ang - 0.45)); x.lineTo(b.x - 12 * Math.cos(ang + 0.45), b.y - 12 * Math.sin(ang + 0.45)); x.closePath(); x.fill(); } }
      cursor(x, t < 0.2 ? P({ x: 220, y: 128 }, a, seg(t, 0, 0.18)) : e, t > 0.2 && t < 0.7, 'cross');
      badge(x, t < 0.72 ? 'Sürükle · Shift: düz / 45°' : 'Ok ucu ve kesik çizgi sağ panelde', t, 0.04, 0.97);
    },
    retext(x, t) {
      photoBg(x);
      const er = seg(t, 0.3, 0.45), ty = seg(t, 0.52, 0.8);
      x.font = '900 26px Segoe UI, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'center';
      if (er < 1) { x.globalAlpha = 1 - er; x.fillStyle = '#fff'; x.fillText('İNDİRİM', 132, 60); x.globalAlpha = 1; }
      if (t > 0.22 && t < 0.5) { x.strokeStyle = C.yel; x.setLineDash([4, 3]); x.lineWidth = 1.5; x.strokeRect(78, 44, 108, 32); x.setLineDash([]); }
      if (t > 0.5) { const s = '%50 FIRSAT'.slice(0, Math.ceil(ty * 10)); x.fillStyle = '#fff'; x.fillText(s, 132, 60); }
      x.textAlign = 'left';
      cursor(x, t < 0.22 ? P({ x: 220, y: 128 }, { x: 132, y: 62 }, seg(t, 0, 0.2)) : { x: 132, y: 62 }, t > 0.2 && t < 0.3);
      badge(x, t < 0.5 ? 'Fotoğraftaki yazıya tıkla' : 'Arkası doldurulur, yeni yazıyı yaz', t, 0.04, 0.97);
    },
    lift(x, t) {
      photoBg(x);
      const lift = seg(t, 0.58, 0.82), cx0 = 100, cy0 = 82;
      if (lift > 0) { x.fillStyle = 'rgba(0,0,0,.0)'; }
      // nesne (meyve)
      const ox = lerp(cx0, 176, lift), oy = lerp(cy0, 58, lift);
      if (lift > 0) { x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(ox + 4, oy + 26, 20, 5, 0, 0, 7); x.fill(); }
      x.fillStyle = '#C0392B'; x.beginPath(); x.arc(ox, oy, 20, 0, 7); x.fill(); x.fillStyle = '#2E8B57'; x.beginPath(); x.ellipse(ox + 5, oy - 21, 7, 3.5, -0.5, 0, 7); x.fill();
      // kement çizgisi
      const L = seg(t, 0.18, 0.5); if (t > 0.16 && t < 0.6) { x.strokeStyle = '#fff'; x.setLineDash([4, 3]); x.lineWidth = 1.5; x.beginPath(); const N = 40; for (let i = 0; i <= N * L; i++) { const a = (i / N) * Math.PI * 2, r = 30 + Math.sin(a * 3) * 3; x.lineTo(cx0 + r * Math.cos(a), cy0 - 4 + r * Math.sin(a)); } x.stroke(); x.setLineDash([]); }
      const lp = (a) => ({ x: cx0 + 32 * Math.cos(a), y: cy0 - 4 + 32 * Math.sin(a) });
      const p = t < 0.16 ? P({ x: 220, y: 128 }, lp(0), seg(t, 0, 0.15)) : t < 0.5 ? lp(L * Math.PI * 2) : t < 0.58 ? P(lp(0), { x: cx0, y: cy0 }, seg(t, 0.5, 0.58)) : { x: ox, y: oy };
      cursor(x, p, t > 0.16 && t < 0.5 || t > 0.58 && t < 0.82);
      badge(x, t < 0.55 ? 'Nesnenin çevresini çiz' : 'Ayrı katman olur, arkası doldurulur', t, 0.04, 0.97);
    },
    pen(x, t) {
      board(x);
      const pts = [{ x: 70, y: 100 }, { x: 110, y: 40 }, { x: 170, y: 46 }, { x: 196, y: 104 }];
      const k = Math.min(4, Math.floor(clamp((t - 0.1) / 0.6) * 5));
      x.strokeStyle = C.ink; x.lineWidth = 2.5; x.beginPath();
      for (let i = 0; i < k; i++) { const p = pts[i]; if (!i) x.moveTo(p.x, p.y); else { const q = pts[i - 1]; x.quadraticCurveTo((p.x + q.x) / 2, Math.min(p.y, q.y) - 22, p.x, p.y); } }
      if (t > 0.78) { x.quadraticCurveTo(133, 140, pts[0].x, pts[0].y); x.fillStyle = 'rgba(226,25,124,' + 0.85 * seg(t, 0.78, 0.86) + ')'; x.fill(); }
      x.stroke();
      for (let i = 0; i < k; i++) { x.fillStyle = '#fff'; x.strokeStyle = C.cyan; x.lineWidth = 1.3; x.fillRect(pts[i].x - 3, pts[i].y - 3, 6, 6); x.strokeRect(pts[i].x - 3, pts[i].y - 3, 6, 6); }
      if (k > 0 && k < 4) { const q = pts[k - 1]; x.strokeStyle = C.cyan; x.beginPath(); x.moveTo(q.x - 16, q.y + 6); x.lineTo(q.x + 16, q.y - 6); x.stroke(); }
      const target = t > 0.7 ? pts[0] : pts[Math.min(3, k)];
      cursor(x, target, Math.floor(t * 20) % 4 === 0, 'pen');
      badge(x, t < 0.7 ? 'Tıkla: köşe · sürükle: kavis' : 'İlk noktaya tıkla: şekil kapanır', t, 0.04, 0.97);
    },
    brush(x, t) {
      board(x);
      const d = seg(t, 0.12, 0.8), N = 60, pt = (i) => ({ x: 56 + (i / N) * 150, y: 76 + Math.sin((i / N) * Math.PI * 3) * 26 });
      x.strokeStyle = C.mag; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
      for (let i = 0; i <= N * d; i++) { const p = pt(i); if (!i) x.moveTo(p.x, p.y); else x.lineTo(p.x, p.y); }
      x.stroke();
      cursor(x, t < 0.12 ? P({ x: 220, y: 128 }, pt(0), seg(t, 0, 0.11)) : pt(Math.round(N * d)), t > 0.12 && t < 0.8, 'brush');
      badge(x, 'Serbest çiz · renk ve kalınlık üst çubukta', t, 0.04, 0.97);
    },
    image(x, t) {
      board(x);
      const f = seg(t, 0.1, 0.3), drop = seg(t, 0.32, 0.6), sc = seg(t, 0.6, 0.8);
      const fx = lerp(250, 150, f), fy = lerp(150, 110, f);
      const ix = lerp(fx - 20, 74, drop), iy = lerp(fy - 16, 36, drop), iw = lerp(40, 92 + 30 * sc, drop), ih = lerp(32, 64 + 20 * sc, drop);
      const g = x.createLinearGradient(ix, iy, ix + iw, iy + ih); g.addColorStop(0, '#9AD0EC'); g.addColorStop(1, '#2E8B57'); x.fillStyle = g; rr(x, ix, iy, iw, ih, 4); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(ix + iw * 0.75, iy + ih * 0.3, Math.min(iw, ih) * 0.12, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.moveTo(ix, iy + ih); x.lineTo(ix + iw * 0.4, iy + ih * 0.45); x.lineTo(ix + iw * 0.7, iy + ih * 0.8); x.lineTo(ix + iw, iy + ih * 0.6); x.lineTo(ix + iw, iy + ih); x.closePath(); x.fill();
      if (t > 0.6) sel(x, ix, iy, iw, ih);
      cursor(x, t < 0.6 ? { x: ix + iw / 2, y: iy + ih / 2 } : { x: ix + iw, y: iy + ih }, t > 0.1 && t < 0.6 || t > 0.6 && t < 0.8);
      badge(x, t < 0.6 ? 'Dosya seç ya da tuvale sürükle-bırak' : 'Köşeden boyutlandır, panelden kırp', t, 0.04, 0.97);
    },
    heal(x, t) {
      photoBg(x);
      const done = t > 0.62, cx = 120, cy = 92;
      if (!done) { x.fillStyle = '#5B3A2E'; x.beginPath(); x.ellipse(cx, cy, 11, 8, 0.4, 0, 7); x.fill(); x.beginPath(); x.arc(cx + 14, cy - 6, 4, 0, 7); x.fill(); }
      const d = seg(t, 0.2, 0.58);
      if (t > 0.2 && !done) { x.strokeStyle = 'rgba(226,25,124,.45)'; x.lineWidth = 22; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 8, cy + 4); x.lineTo(cx - 8 + 30 * d, cy + 4 - 12 * d); x.stroke(); }
      if (done) { x.save(); x.globalAlpha = 1 - seg(t, 0.62, 0.75); x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(cx + 6, cy - 2, 20, 0, 7); x.stroke(); x.restore(); }
      const c = t < 0.2 ? P({ x: 220, y: 128 }, { x: cx - 8, y: cy + 4 }, seg(t, 0, 0.18)) : { x: cx - 8 + 30 * d, y: cy + 4 - 12 * d };
      x.strokeStyle = '#fff'; x.lineWidth = 1.3; x.beginPath(); x.arc(c.x, c.y, 11, 0, 7); x.stroke();
      badge(x, t < 0.6 ? 'Lekenin üzerini boya…' : '…çevresiyle doldurulur · Klon: Alt+tık kaynak', t, 0.04, 0.97);
    },
    eraser(x, t) {
      photoBg(x);
      const N = 50, d = seg(t, 0.15, 0.75), pt = (i) => ({ x: 70 + (i / N) * 130, y: 40 + Math.sin((i / N) * Math.PI * 2) * 14 + (i / N) * 30 });
      // silinen yerler damalı (şeffaf) görünür
      x.save(); x.beginPath(); for (let i = 0; i <= N * d; i++) { const p = pt(i); x.moveTo(p.x + 13, p.y); x.arc(p.x, p.y, 13, 0, 7); } x.clip();
      for (let i = 0; i < W; i += 8) for (let j = 0; j < H; j += 8) { x.fillStyle = ((i + j) / 8) % 2 ? '#E5E7EB' : '#fff'; x.fillRect(i, j, 8, 8); } x.restore();
      const c = t < 0.15 ? P({ x: 220, y: 128 }, pt(0), seg(t, 0, 0.14)) : pt(Math.round(N * d));
      x.strokeStyle = '#fff'; x.lineWidth = 1.3; x.beginPath(); x.arc(c.x, c.y, 13, 0, 7); x.stroke(); x.strokeStyle = 'rgba(0,0,0,.5)'; x.beginPath(); x.arc(c.x, c.y, 14.3, 0, 7); x.stroke();
      badge(x, t < 0.8 ? 'Fotoğrafın üzerinde sürükle: silinir' : '“Geri getir” ile hatayı düzelt', t, 0.04, 0.97);
    },
    gradient(x, t) {
      board(x);
      const a = { x: 70, y: 110 }, b = { x: 190, y: 40 }, d = seg(t, 0.25, 0.7), e = P(a, b, d);
      const g = x.createLinearGradient(a.x, a.y, t > 0.25 ? e.x : a.x + 1, t > 0.25 ? e.y : a.y + 1); g.addColorStop(0, C.mag); g.addColorStop(1, C.cyan);
      x.fillStyle = t > 0.25 ? g : C.mag; rr(x, 64, 32, 136, 86, 10); x.fill();
      if (t > 0.25 && t < 0.85) { x.strokeStyle = '#fff'; x.setLineDash([5, 4]); x.lineWidth = 2; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(e.x, e.y); x.stroke(); x.setLineDash([]); [[a, C.mag], [e, C.cyan]].forEach(([q, c]) => { x.fillStyle = c; x.strokeStyle = '#fff'; x.beginPath(); x.arc(q.x, q.y, 5, 0, 7); x.fill(); x.stroke(); }); }
      cursor(x, t < 0.25 ? P({ x: 222, y: 130 }, a, seg(t, 0, 0.22)) : e, t > 0.25 && t < 0.7, 'cross');
      badge(x, 'Şeklin üzerinde sürükle: yön ve uzunluk', t, 0.04, 0.97);
    },
    eyedrop(x, t) {
      board(x);
      x.fillStyle = C.yel; x.beginPath(); x.arc(80, 74, 26, 0, 7); x.fill();
      const k = seg(t, 0.45, 0.6);
      x.fillStyle = k > 0.5 ? C.yel : C.mag; rr(x, 140, 44, 70, 60, 8); x.fill(); sel(x, 140, 44, 70, 60);
      if (t > 0.4) { x.fillStyle = C.yel; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(96, 46, 9 * seg(t, 0.4, 0.48), 0, 7); x.fill(); x.stroke(); }
      x.save(); x.translate(t < 0.38 ? lerp(220, 84, seg(t, 0, 0.36)) : 84, t < 0.38 ? lerp(130, 76, seg(t, 0, 0.36)) : 76); x.rotate(-0.8); x.fillStyle = C.ink; x.strokeStyle = '#fff'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 0); x.lineTo(-3, -6); x.lineTo(-3, -16); x.lineTo(3, -16); x.lineTo(3, -6); x.closePath(); x.fill(); x.stroke(); x.fillRect(-5, -22, 10, 6); x.restore();
      badge(x, t < 0.5 ? 'Bir renge tıkla…' : '…seçili katman o rengi alır', t, 0.04, 0.97);
    },
    crop(x, t) {
      x.fillStyle = C.bg; x.fillRect(0, 0, W, H);
      const done = seg(t, 0.7, 0.85);
      const b0 = { x: 34, y: 16, w: 196, h: 118 }, cb = { x: 74, y: 30, w: lerp(0, 120, seg(t, 0.15, 0.55)), h: lerp(0, 90, seg(t, 0.15, 0.55)) };
      const k = lerp(1, 118 / 90, done), ox = lerp(0, W / 2 - (cb.x + 60) * k, done), oy = lerp(0, H / 2 - (cb.y + 45) * k, done);
      x.save(); x.translate(ox, oy); x.scale(k, k);
      if (done > 0) { x.beginPath(); x.rect(cb.x, cb.y, cb.w, cb.h); x.clip(); }
      x.fillStyle = C.board; x.fillRect(b0.x, b0.y, b0.w, b0.h); x.fillStyle = C.mag; rr(x, 90, 44, 70, 50, 8); x.fill(); x.fillStyle = C.cyan; x.beginPath(); x.arc(182, 100, 24, 0, 7); x.fill();
      x.restore();
      if (t > 0.15 && done === 0) { x.fillStyle = 'rgba(10,12,16,.6)'; x.beginPath(); x.rect(0, 0, W, H); x.rect(cb.x + cb.w, cb.y, -cb.w, cb.h); x.fill('evenodd'); x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.strokeRect(cb.x, cb.y, cb.w, cb.h); }
      if (done === 0) cursor(x, t < 0.15 ? P({ x: 222, y: 130 }, cb, seg(t, 0, 0.14)) : { x: cb.x + cb.w, y: cb.y + cb.h }, t > 0.15 && t < 0.55, 'cross');
      badge(x, t < 0.7 ? 'Saklanacak alanı çiz · Enter' : 'Tuval bu alana kırpıldı', t, 0.04, 0.97);
    },
    zoom(x, t) {
      const z = 1 + seg(t, 0.3, 0.55) * 1.2, cx = 150, cy = 78;
      x.fillStyle = C.bg; x.fillRect(0, 0, W, H); x.save(); x.translate(cx, cy); x.scale(z, z); x.translate(-cx, -cy);
      x.fillStyle = C.board; rr(x, 34, 16, 196, 118, 6); x.fill(); x.fillStyle = C.mag; rr(x, 120, 56, 60, 44, 6); x.fill(); x.font = '700 9px Segoe UI'; x.fillStyle = '#fff'; x.fillText('Detay', 136, 80); x.restore();
      x.save(); x.translate(t < 0.28 ? lerp(220, cx, seg(t, 0, 0.26)) : cx, t < 0.28 ? lerp(130, cy, seg(t, 0, 0.26)) : cy); x.strokeStyle = C.ink; x.fillStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.2; x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(6, 6); x.lineTo(12, 12); x.stroke(); x.lineWidth = 1.6; x.beginPath(); x.moveTo(-4, 0); x.lineTo(4, 0); x.moveTo(0, -4); x.lineTo(0, 4); x.stroke(); x.restore();
      badge(x, t < 0.6 ? 'Tıkla: yakınlaştır · Alt+tık: uzaklaştır' : 'Sürükle: seçtiğin alana yakınlaş', t, 0.04, 0.97);
    },
  };
  function shapeDemo(x, t, kind, hint) {
    board(x);
    const a = { x: 72, y: 38 }, b = { x: 186, y: 112 }, d = seg(t, 0.22, 0.62), e = P(a, b, d);
    const w = e.x - a.x, h = e.y - a.y;
    if (t > 0.2) {
      x.fillStyle = t > 0.64 ? lerpCol(t) : 'rgba(226,25,124,.55)';
      if (kind === 'rect') { rr(x, a.x, a.y, w, h, Math.min(8, w / 4)); x.fill(); }
      if (kind === 'ellipse') { x.beginPath(); x.ellipse(a.x + w / 2, a.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 7); x.fill(); }
      if (kind === 'star') { star(x, a.x + w / 2, a.y + h / 2, Math.min(Math.abs(w), Math.abs(h)) / 2, seg(t, 0.64, 0.9) * 0.6); x.fill(); }
      if (kind === 'triangle') { x.beginPath(); x.moveTo(a.x + w / 2, a.y); x.lineTo(a.x + w, a.y + h); x.lineTo(a.x, a.y + h); x.closePath(); x.fill(); }
      if (t < 0.64) dims(x, e, w, h); else sel(x, a.x, a.y, w, h);
    }
    cursor(x, t < 0.2 ? P({ x: 222, y: 130 }, a, seg(t, 0, 0.18)) : t < 0.64 ? e : P(e, { x: 214, y: 128 }, seg(t, 0.66, 0.8)), t > 0.2 && t < 0.63, t < 0.64 ? 'cross' : 'arrow');
    badge(x, t < 0.64 ? hint : 'Renk, kenar ve gölge sağ panelde', t, 0.04, 0.97);
  }
  function lerpCol(t) { const k = seg(t, 0.64, 0.8); return `rgb(${Math.round(lerp(226, 25, k))},${Math.round(lerp(25, 169, k))},${Math.round(lerp(124, 225, k))})`; }

  // ---------- açıklamalar
  const INFO = {
    select: ['Katmanı seçer, taşır ve boyutlandırır.', 'Shift ile birden çok seç · Alt ile sürükle: kopyala · ok tuşları: ince kaydırma'],
    hand: ['Tuvali kaydırır, tasarıma dokunmaz.', 'Her araçtayken Boşluk tuşunu basılı tut · Ctrl + tekerlek: yakınlaştır'],
    text: ['Yazı ekler. Tıkla ve yaz.', 'Yazı tipi, boyut, satır aralığı sağ panelde · çift tık: düzenle'],
    rect: ['Dikdörtgen ve kare çizer.', 'Shift: tam kare · köşe yuvarlaklığı sağ panelde'],
    ellipse: ['Elips ve daire çizer.', 'Shift: tam daire · fotoğrafı içine sürükleyip maske yap'],
    star: ['Yıldız ve rozet çizer.', 'Köşe sayısı ve iç yarıçap sağ panelde'],
    triangle: ['Üçgen çizer.', 'Shift: eşkenar orana yakın · döndürme tutamacıyla çevir'],
    line: ['Düz çizgi ve ok çizer.', 'Shift: yatay/dikey/45° · ok ucu, kesik çizgi sağ panelde'],
    retext: ['Fotoğrafa gömülü yazıyı değiştirir.', 'Yazının arkası otomatik doldurulur, yeni yazı düzenlenebilir katman olur'],
    lift: ['Fotoğraftaki bir nesneyi ayrı katmana çıkarır.', 'Çevresini çiz · nesne taşınabilir olur, boşluk otomatik doldurulur'],
    pen: ['Vektör yol ve özel şekil çizer.', 'Tıkla: köşe · sürükle: kavis · ilk noktaya tıkla: kapat · Enter: bitir'],
    brush: ['Serbest el çizimi yapar.', 'Renk ve kalınlık araç çubuğunda · çizim vektör katman olur'],
    heal: ['Ürün fotoğrafındaki leke, toz, çizik ve istenmeyen küçük nesneleri temizler.', 'Leke: üzerini boya, bırak · Klon: Alt+tık ile kaynak seç, sonra boya · “Aslı” ile geri dön'],
    eraser: ['Fotoğrafın istemediğin yerlerini siler.', 'Bozmadan çalışır: “Geri getir” ile silineni geri boya · boyut ve yumuşaklık üst çubukta'],
    gradient: ['Şekle ya da yazıya degrade (renk geçişi) verir.', 'Sürüklediğin yön ve uzunluk geçişi belirler · renkler ve dairesel seçenek üst çubukta'],
    eyedrop: ['Tasarımdan renk alır.', 'Tıkladığın renk seçili katmana verilir · Alt+tık: kenar rengi · renk kodu panoya kopyalanır'],
    crop: ['Tuvali seçtiğin alana kırpar.', 'Shift: kare alan · Enter: uygula · Esc: vazgeç · fotoğraf kırpmak için fotoğrafı seç, panelde “Kırp”'],
    zoom: ['Tasarıma yakınlaşır, uzaklaşır.', 'Tıkla: yakınlaş · Alt+tık: uzaklaş · alan çiz: oraya yakınlaş · Ctrl+0: sığdır'],
    image: ['Bilgisayardan ya da telefondan görsel ekler.', 'Dosyayı tuvale sürükle-bırak da olur · Ctrl+V ile yapıştır'],
  };
  window.TOOL_INFO = INFO;

  // ---------- ipucu kartı
  let card, cv, ctx, raf = 0, t0 = 0, cur = null, showT = 0, hideT = 0, lpT = 0;
  function build() {
    card = document.createElement('div'); card.className = 'rtip'; card.setAttribute('role', 'tooltip');
    card.innerHTML = `<div class="rtip-vid"><canvas width="${W * 2}" height="${H * 2}"></canvas><i class="rtip-bar"><b></b></i></div><div class="rtip-body"><div class="rtip-h"><b></b><span class="kbd"></span></div><p class="rtip-d"></p><p class="rtip-t"></p></div>`;
    document.body.appendChild(card); cv = card.querySelector('canvas'); ctx = cv.getContext('2d'); ctx.scale(2, 2);
  }
  function loop(now) {
    if (!cur) return;
    const t = ((now - t0) % DUR) / DUR;
    try { ctx.clearRect(0, 0, W, H); ctx.save(); DEMOS[cur](ctx, t); ctx.restore(); } catch (e) {}
    card.querySelector('.rtip-bar b').style.width = (t * 100).toFixed(1) + '%';
    raf = requestAnimationFrame(loop);
  }
  function show(btn) {
    const id = btn.dataset.t; if (!DEMOS[id]) return;
    if (!card) build();
    const name = btn.getAttribute('aria-label') || id, k = btn.querySelector('.kbd'), inf = INFO[id] || ['', ''];
    card.querySelector('.rtip-h b').textContent = name;
    card.querySelector('.rtip-h .kbd').textContent = k ? k.textContent : '';
    card.querySelector('.rtip-d').textContent = inf[0]; card.querySelector('.rtip-t').textContent = inf[1];
    const r = btn.getBoundingClientRect(), mob = matchMedia('(max-width: 820px)').matches;
    card.classList.toggle('mob', mob); card.classList.add('on');
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let left, top;
    if (mob) { left = Math.max(8, Math.min(innerWidth - cw - 8, r.left + r.width / 2 - cw / 2)); top = r.top - ch - 10; if (top < 8) top = r.bottom + 10; }
    else { left = r.right + 12; top = Math.max(8, Math.min(innerHeight - ch - 8, r.top + r.height / 2 - 40)); }
    card.style.left = left + 'px'; card.style.top = top + 'px';
    if (cur !== id) { cur = id; t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  }
  function hide() { clearTimeout(showT); if (!card) return; card.classList.remove('on'); cur = null; cancelAnimationFrame(raf); }
  const isOn = () => card && card.classList.contains('on');

  const NOHOVER = matchMedia('(hover: none)');
  document.addEventListener('pointerover', (e) => {
    const b = e.target.closest && e.target.closest('.tools .tool[data-t]'); if (!b || e.pointerType === 'touch' || NOHOVER.matches) return;
    clearTimeout(hideT); clearTimeout(showT);
    showT = setTimeout(() => show(b), isOn() ? 0 : 420); // Photoshop gibi kısa bir bekleme; bir ipucu açıkken anında geç
  });
  document.addEventListener('pointerout', (e) => {
    const b = e.target.closest && e.target.closest('.tools .tool[data-t]'); if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return;
    clearTimeout(showT); hideT = setTimeout(hide, 160);
  });
  // telefonda: araca basılı tut → ipucu; bırakınca kapanır (araç yine seçilir)
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest('.tools .tool[data-t]');
    if (!b) { if (isOn()) hide(); return; }
    if (e.pointerType !== 'touch') { hide(); return; }
    clearTimeout(lpT); lpT = setTimeout(() => show(b), 480);
  }, true);
  ['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, (e) => { clearTimeout(lpT); if (e.pointerType === 'touch' && isOn()) setTimeout(hide, 2600); }, true));
  addEventListener('scroll', hide, true); addEventListener('hashchange', hide);
  window.ToolTips = { show: (id) => { const b = document.querySelector(`.tools .tool[data-t="${id}"]`); if (b) show(b); }, hide, demos: Object.keys(DEMOS) };
})();
