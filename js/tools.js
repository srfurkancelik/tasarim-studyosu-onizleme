/* Yardımcı araçlar: QR kod, baskı PDF'i, ZIP, arka plan silme, otomatik tasarım kontrolü */
(function () {
  const R = window.Render;
  const T = {};

  // =========================================================
  // QR KOD (bayt modu, hata düzeltme M, sürüm 1–6)
  // =========================================================
  const QR_M = { 1: [16, 10, 1], 2: [28, 16, 1], 3: [44, 26, 1], 4: [64, 18, 2], 5: [86, 24, 2], 6: [108, 16, 4] };
  const ALIGN = { 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };
  const EXP = new Array(512), LOG = new Array(256);
  (function () { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  const gmul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  function rsGen(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= gmul(g[j], EXP[i]); } g = ng; } return g; }
  function rsEnc(data, n) {
    const g = rsGen(n), res = data.concat(new Array(n).fill(0));
    for (let i = 0; i < data.length; i++) { const c = res[i]; if (c) for (let j = 0; j < g.length; j++) res[i + j] ^= gmul(g[j], c); }
    return res.slice(data.length);
  }
  T.qrOld = function (text) {
    const bytes = [...new TextEncoder().encode(text)];
    let ver = 0;
    for (let v = 1; v <= 6; v++) if (bytes.length + 2 <= QR_M[v][0] - 0) { ver = v; break; }
    if (!ver) throw new Error('Metin QR için çok uzun');
    const [dataCap, ecLen, blocks] = QR_M[ver];
    // bit akışı
    const bits = [];
    const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    put(4, 4); put(bytes.length, 8); bytes.forEach((b) => put(b, 8));
    put(0, Math.min(4, dataCap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const cw = [];
    for (let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    for (let p = 0; cw.length < dataCap; p++) cw.push(p % 2 ? 0x11 : 0xec);
    // bloklar
    const bl = dataCap / blocks, dB = [], eB = [];
    for (let i = 0; i < blocks; i++) { const d = cw.slice(i * bl, (i + 1) * bl); dB.push(d); eB.push(rsEnc(d, ecLen)); }
    const final = [];
    for (let i = 0; i < bl; i++) dB.forEach((d) => final.push(d[i]));
    for (let i = 0; i < ecLen; i++) eB.forEach((e) => final.push(e[i]));
    // matris
    const N = ver * 4 + 17;
    const M = Array.from({ length: N }, () => new Array(N).fill(null));
    const fn = Array.from({ length: N }, () => new Array(N).fill(false));
    const set = (r, c, v) => { M[r][c] = v; fn[r][c] = true; };
    const finder = (r, c) => {
      for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
        const rr = r + i, cc = c + j;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const on = i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4));
        set(rr, cc, on ? 1 : 0);
      }
    };
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    for (let i = 8; i < N - 8; i++) { set(6, i, i % 2 ? 0 : 1); set(i, 6, i % 2 ? 0 : 1); }
    if (ALIGN[ver]) {
      const a = ALIGN[ver];
      for (const r of a) for (const c of a) {
        if (fn[r][c]) continue;
        for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) set(r + i, c + j, Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0);
      }
    }
    set(N - 8, 8, 1); // karanlık modül
    for (let i = 0; i < 9; i++) { if (!fn[8][i]) set(8, i, 0); if (!fn[i][8]) set(i, 8, 0); }
    for (let i = 0; i < 8; i++) { set(8, N - 1 - i, 0); set(N - 1 - i, 8, 0); }
    // veri yerleşimi
    const dataBits = [];
    final.forEach((b) => { for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1); });
    let k = 0, up = true;
    for (let c = N - 1; c > 0; c -= 2) {
      if (c === 6) c--;
      for (let n = 0; n < N; n++) {
        const r = up ? N - 1 - n : n;
        for (let j = 0; j < 2; j++) {
          const cc = c - j;
          if (fn[r][cc]) continue;
          M[r][cc] = k < dataBits.length ? dataBits[k++] : 0;
        }
      }
      up = !up;
    }
    const MASKF = [(r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0];
    function withMask(m) {
      const G = M.map((row) => row.slice());
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!fn[r][c] && MASKF[m](r, c)) G[r][c] ^= 1;
      // biçim bilgisi (M = 00)
      let f = (0 << 3) | m, v = f << 10;
      for (let i = 14; i >= 10; i--) if ((v >> i) & 1) v ^= 0x537 << (i - 10);
      const fmt = ((f << 10) | v) ^ 0x5412;
      const fb = (i) => (fmt >> i) & 1;
      for (let i = 0; i <= 5; i++) G[i][8] = fb(i);
      G[7][8] = fb(6); G[8][8] = fb(7); G[8][7] = fb(8);
      for (let i = 9; i < 15; i++) G[8][14 - i] = fb(i);
      for (let i = 0; i < 8; i++) G[8][N - 1 - i] = fb(i);
      for (let i = 8; i < 15; i++) G[N - 15 + i][8] = fb(i);
      G[N - 8][8] = 1;
      return G;
    }
    function penalty(G) {
      let p = 0;
      for (let r = 0; r < N; r++) for (const line of [G[r], G.map((row) => row[r])]) {
        let run = 1;
        for (let i = 1; i < N; i++) { if (line[i] === line[i - 1]) run++; else { if (run >= 5) p += run - 2; run = 1; } }
        if (run >= 5) p += run - 2;
        const s = line.join('');
        p += 40 * ((s.match(/10111010000/g) || []).length + (s.match(/00001011101/g) || []).length);
      }
      for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) { const v = G[r][c]; if (v === G[r][c + 1] && v === G[r + 1][c] && v === G[r + 1][c + 1]) p += 3; }
      const dark = G.flat().filter(Boolean).length;
      p += Math.floor(Math.abs((dark * 100) / (N * N) - 50) / 5) * 10;
      return p;
    }
    let best = null, bp = Infinity;
    for (let m = 0; m < 8; m++) { const G = withMask(m); const pp = penalty(G); if (pp < bp) { bp = pp; best = G; } }
    return best;
  };
  T.qrSVG = function (text, { fg = '#111', bg = '#fff', quiet = 4 } = {}) {
    const G = T.qr(text).modules, N = G.length, S = N + quiet * 2;
    let d = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (G[r][c]) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges"><rect width="${S}" height="${S}" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
  };

  // =========================================================
  // ZIP (sıkıştırmasız, UTF-8 dosya adları)
  // =========================================================
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  T.zip = function (files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    const u16 = (v) => [v & 255, (v >> 8) & 255], u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    for (const f of files) {
      const name = enc.encode(f.name), data = f.data, crc = crc32(data);
      const head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)];
      parts.push(new Uint8Array(head), name, data);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), name);
      off += head.length + name.length + data.length;
    }
    const csize = central.reduce((a, b) => a + b.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(csize), ...u32(off), ...u16(0)]);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  };

  // =========================================================
  // BASKI PDF'i (taşma payı + kesim işaretleri)
  // =========================================================
  // kesim hattı yolu (mm, sol-üst köşe tabanlı) → PDF komutları
  T.diePathPDF = function (die, trimW, trimH, mm2pt, ox, oy, pageTrimTop) {
    // PDF y ekseni yukarı; (ox,oy) = trim sol-alt (pt)
    const off = +die.offmm || 0;
    const x0 = off, y0 = off, w = trimW - 2 * off, h = trimH - 2 * off;
    const P = (x, y) => `${(ox + mm2pt(x)).toFixed(3)} ${(oy + mm2pt(trimH - y)).toFixed(3)}`;
    const K = 0.5522847;
    if (die.shape === 'ellipse') {
      const cx = x0 + w / 2, cy = y0 + h / 2, rx = w / 2, ry = h / 2;
      return `${P(cx + rx, cy)} m ${P(cx + rx, cy + K * ry)} ${P(cx + K * rx, cy + ry)} ${P(cx, cy + ry)} c ${P(cx - K * rx, cy + ry)} ${P(cx - rx, cy + K * ry)} ${P(cx - rx, cy)} c ${P(cx - rx, cy - K * ry)} ${P(cx - K * rx, cy - ry)} ${P(cx, cy - ry)} c ${P(cx + K * rx, cy - ry)} ${P(cx + rx, cy - K * ry)} ${P(cx + rx, cy)} c h`;
    }
    const r = die.shape === 'rounded' ? Math.min(+die.rmm || 3, w / 2, h / 2) : 0;
    if (!r) return `${P(x0, y0)} m ${P(x0 + w, y0)} l ${P(x0 + w, y0 + h)} l ${P(x0, y0 + h)} l h`;
    const k = r * (1 - K);
    return `${P(x0 + r, y0)} m ${P(x0 + w - r, y0)} l ${P(x0 + w - k, y0)} ${P(x0 + w, y0 + k)} ${P(x0 + w, y0 + r)} c ${P(x0 + w, y0 + h - r)} l ${P(x0 + w, y0 + h - k)} ${P(x0 + w - k, y0 + h)} ${P(x0 + w - r, y0 + h)} c ${P(x0 + r, y0 + h)} l ${P(x0 + k, y0 + h)} ${P(x0, y0 + h - k)} ${P(x0, y0 + h - r)} c ${P(x0, y0 + r)} l ${P(x0, y0 + k)} ${P(x0 + k, y0)} ${P(x0 + r, y0)} c h`;
  };
  T.diePathSVG = function (die, W, H) {
    // tasarım piksel koordinatında SVG yolu
    const off = (+die.offmm || 0) * (W / die.wmm);
    const x0 = off, y0 = off, w = W - 2 * off, h = H - 2 * off;
    if (die.shape === 'ellipse') return `M${x0 + w / 2} ${y0}A${w / 2} ${h / 2} 0 1 1 ${x0 + w / 2 - 0.01} ${y0}Z`;
    const r = die.shape === 'rounded' ? Math.min((+die.rmm || 3) * (W / die.wmm), w / 2, h / 2) : 0;
    return `M${x0 + r} ${y0}H${x0 + w - r}A${r} ${r} 0 0 1 ${x0 + w} ${y0 + r}V${y0 + h - r}A${r} ${r} 0 0 1 ${x0 + w - r} ${y0 + h}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y0 + h - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  };
  async function deflate(u8) {
    const cs = new CompressionStream('deflate');
    const out = new Response(new Blob([u8]).stream().pipeThrough(cs));
    return new Uint8Array(await out.arrayBuffer());
  }
  // RGB → CMYK (ICC'siz, gri bileşen değiştirme ile basit dönüşüm)
  function toCMYK(canvas) {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out = new Uint8Array(canvas.width * canvas.height * 4);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 4) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const k = 1 - Math.max(r, g, b);
      if (k >= 0.999) { out[j + 3] = 255; continue; }
      const d = 1 - k;
      out[j] = Math.round(((1 - r - k) / d) * 255);
      out[j + 1] = Math.round(((1 - g - k) / d) * 255);
      out[j + 2] = Math.round(((1 - b - k) / d) * 255);
      out[j + 3] = Math.round(k * 255);
    }
    return out;
  }
  // opts: bleedMM, dpi, marks, physical {wmm,hmm}, die {shape,rmm,offmm}, cmyk
  T.printPDF = async function (d, { bleedMM = 3, dpi = 300, marks = true, srcDpi = 150, physical = null, die = null, cmyk = false } = {}) {
    const mm2pt = (mm) => (mm * 72) / 25.4;
    physical = physical || (d.meta && d.meta.print) || null;
    const pxPerMM = physical && +physical.wmm > 0 ? d.width / +physical.wmm : srcDpi / 25.4;
    const bleedPx = bleedMM * pxPerMM;
    const scale = Math.min(dpi / 25.4 / pxPerMM, 16000 / (d.width + 2 * bleedPx), 16000 / (d.height + 2 * bleedPx));
    const canvas = await R.exportCanvas(d, scale, '#ffffff', { bleed: bleedPx });
    let imgObj;
    if (cmyk) {
      const raw = toCMYK(canvas), z = await deflate(raw);
      imgObj = { head: `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceCMYK /BitsPerComponent 8 /Filter /FlateDecode /Length ${z.length} >>\nstream\n`, data: z };
    } else {
      const jpg = new Uint8Array(await (await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.95))).arrayBuffer());
      imgObj = { head: `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`, data: jpg };
    }
    const trimW = d.width / pxPerMM, trimH = d.height / pxPerMM;
    const markArea = marks ? 12 : 0;
    const pageW = mm2pt(trimW + 2 * bleedMM + 2 * markArea), pageH = mm2pt(trimH + 2 * bleedMM + 2 * markArea);
    const imgX = mm2pt(markArea), imgY = mm2pt(markArea), imgW = mm2pt(trimW + 2 * bleedMM), imgH = mm2pt(trimH + 2 * bleedMM);
    const tx0 = mm2pt(markArea + bleedMM), ty0 = mm2pt(markArea + bleedMM), tx1 = tx0 + mm2pt(trimW), ty1 = ty0 + mm2pt(trimH);
    let content = `q ${imgW.toFixed(3)} 0 0 ${imgH.toFixed(3)} ${imgX.toFixed(3)} ${imgY.toFixed(3)} cm /Im0 Do Q\n`;
    if (marks) {
      const gap = mm2pt(bleedMM + 1), len = mm2pt(8);
      content += 'q 0.3 w /CSR CS 1 SCN\n';
      const L = (x1, y1, x2, y2) => (content += `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`);
      for (const [x, sx] of [[tx0, -1], [tx1, 1]]) for (const [y, sy] of [[ty0, -1], [ty1, 1]]) {
        L(x + sx * gap, y, x + sx * (gap + len), y);
        L(x, y + sy * gap, x, y + sy * (gap + len));
      }
      content += 'Q\n';
    }
    if (die && die.shape && die.shape !== 'none') {
      content += `q /GS0 gs /CSC CS 1 SCN 0.25 w ${T.diePathPDF(die, trimW, trimH, mm2pt, tx0, ty0)} S Q\n`;
    }
    const enc = new TextEncoder();
    const objs = [];
    objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    objs.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    const box = (a, b, c, e) => `[${a.toFixed(2)} ${b.toFixed(2)} ${c.toFixed(2)} ${e.toFixed(2)}]`;
    const tint = (n, c) => `[/Separation /${n} /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [${c}] /N 1 >>]`;
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /TrimBox ${box(tx0, ty0, tx1, ty1)} /BleedBox ${box(imgX, imgY, imgX + imgW, imgY + imgH)} /Resources << /XObject << /Im0 4 0 R >> /ColorSpace << /CSC ${tint('CutContour', '0 1 0 0')} /CSR ${tint('All', '1 1 1 1')} >> /ExtGState << /GS0 << /Type /ExtGState /OP true /op true /OPM 1 >> >> >> /Contents 5 0 R >>`);
    objs.push(imgObj);
    objs.push({ head: `<< /Length ${enc.encode(content).length} >>\nstream\n`, data: enc.encode(content) });
    const parts = [enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
    let off = parts[0].length;
    const xref = [];
    objs.forEach((o, i) => {
      xref.push(off);
      const pre = enc.encode(`${i + 1} 0 obj\n`);
      let chunk;
      if (typeof o === 'string') chunk = [pre, enc.encode(o + '\nendobj\n')];
      else chunk = [pre, enc.encode(o.head), o.data, enc.encode('\nendstream\nendobj\n')];
      chunk.forEach((c) => { parts.push(c); off += c.length; });
    });
    let x = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    xref.forEach((o) => (x += String(o).padStart(10, '0') + ' 00000 n \n'));
    x += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${off}\n%%EOF\n`;
    parts.push(enc.encode(x));
    return new Blob(parts, { type: 'application/pdf' });
  };
  // ===== QR kod (bayt kipi, hata düzeltme L/M/Q/H, sürüm 1-40) =====
  const QR_ECC = { L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30] };
  const QR_BLK = { L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81] };
  const QR_FMT = { L: 1, M: 0, Q: 3, H: 2 };
  T.qr = function (text, ecl = 'M') {
    const data = Array.from(new TextEncoder().encode(text));
    const rawMods = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
    const dataCw = (v) => Math.floor(rawMods(v) / 8) - QR_ECC[ecl][v] * QR_BLK[ecl][v];
    let ver = 1;
    for (; ver <= 40; ver++) { const cc = ver < 10 ? 8 : 16; if (4 + cc + data.length * 8 <= dataCw(ver) * 8) break; }
    if (ver > 40) throw new Error('Metin QR kod için çok uzun');
    const bits = []; const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
    put(4, 4); put(data.length, ver < 10 ? 8 : 16); data.forEach((b) => put(b, 8));
    const cap = dataCw(ver) * 8;
    put(0, Math.min(4, cap - bits.length)); while (bits.length % 8) bits.push(0);
    for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    const cws = []; for (let i = 0; i < bits.length; i += 8) cws.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; };
    const divisor = (deg) => { const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++) { for (let j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; };
    const remainder = (dat, div) => { const r = div.map(() => 0); for (const b of dat) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => (r[i] ^= mul(c, f))); } return r; };
    const nb = QR_BLK[ecl][ver], el = QR_ECC[ecl][ver], raw = Math.floor(rawMods(ver) / 8), nShort = nb - (raw % nb), shortLen = Math.floor(raw / nb), div = divisor(el);
    const blocks = []; for (let i = 0, k = 0; i < nb; i++) { const dat = cws.slice(k, k + shortLen - el + (i < nShort ? 0 : 1)); k += dat.length; const ecc = remainder(dat, div); if (i < nShort) dat.push(0); blocks.push(dat.concat(ecc)); }
    const all = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - el || j >= nShort) all.push(b[i]); });
    const N = ver * 4 + 17, M = Array.from({ length: N }, () => new Array(N).fill(false)), F = Array.from({ length: N }, () => new Array(N).fill(false));
    const set = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
    for (let i = 0; i < N; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy; if (x >= 0 && x < N && y >= 0 && y < N) set(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(N - 4, 3); finder(3, N - 4);
    if (ver > 1) { const n = Math.floor(ver / 7) + 2, step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2, pos = [6]; for (let p2 = N - 7; pos.length < n; p2 -= step) pos.splice(1, 0, p2); pos.forEach((a2, i) => pos.forEach((b2, j) => { if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(a2 + dx, b2 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); })); }
    const fmt = (mask) => { const d = (QR_FMT[ecl] << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412, g = (i) => ((b >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, g(i)); set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8)); for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
      for (let i = 0; i < 8; i++) set(N - 1 - i, 8, g(i)); for (let i = 8; i < 15; i++) set(8, N - 15 + i, g(i)); set(8, N - 8, true); };
    fmt(0);
    if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (ver << 12) | r; for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) === 1, a2 = N - 11 + (i % 3), b2 = Math.floor(i / 3); set(a2, b2, bit); set(b2, a2, bit); } }
    let bi = 0;
    for (let right = N - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (let v = 0; v < N; v++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? N - 1 - v : v; if (!F[y][x] && bi < all.length * 8) { M[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1; bi++; } } }
    const maskFn = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
    const applyMask = (m) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!F[y][x] && maskFn[m](x, y)) M[y][x] = !M[y][x]; };
    const penalty = () => {
      let p = 0;
      for (let k = 0; k < 2; k++) for (let a2 = 0; a2 < N; a2++) { let run = 1; for (let b2 = 1; b2 < N; b2++) { const c = k ? M[b2][a2] : M[a2][b2], pv = k ? M[b2 - 1][a2] : M[a2][b2 - 1]; if (c === pv) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
      const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = pat.slice().reverse();
      for (let k = 0; k < 2; k++) for (let a2 = 0; a2 < N; a2++) for (let b2 = 0; b2 <= N - 11; b2++) { let m1 = true, m2 = true; for (let i = 0; i < 11; i++) { const c = (k ? M[b2 + i][a2] : M[a2][b2 + i]) ? 1 : 0; if (c !== pat[i]) m1 = false; if (c !== pat2[i]) m2 = false; } if (m1 || m2) p += 40; }
      let dark = 0; M.forEach((r) => r.forEach((c) => c && dark++)); p += Math.floor(Math.abs(dark * 20 - N * N * 10) / (N * N)) * 10;
      return p;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) { applyMask(m); fmt(m); const pn = penalty(); if (pn < bestP) { bestP = pn; best = m; } applyMask(m); }
    applyMask(best); fmt(best);
    return { size: N, modules: M, version: ver };
  };
  // QR → SVG yol (kare / yuvarlak / nokta), sessiz bölge q modül
  T.qrPath = function (qr, style = 'square', q = 2) {
    const N = qr.size, M = qr.modules, out = [];
    const inFinder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    for (let y = 0; y < N; y++) {
      if (style === 'square') { let x = 0; while (x < N) { if (M[y][x]) { let e = x; while (e < N && M[y][e]) e++; out.push(`M${x + q} ${y + q}h${e - x}v1h${-(e - x)}z`); x = e; } else x++; } continue; }
      for (let x = 0; x < N; x++) if (M[y][x] && !inFinder(x, y)) {
        if (style === 'dots') out.push(`M${x + q + 0.5} ${y + q + 0.08}a0.42 0.42 0 1 1 0 0.84a0.42 0.42 0 1 1 0-0.84z`);
        else out.push(`M${x + q + 0.25} ${y + q}h0.5a0.25 0.25 0 0 1 0.25 0.25v0.5a0.25 0.25 0 0 1-0.25 0.25h-0.5a0.25 0.25 0 0 1-0.25-0.25v-0.5a0.25 0.25 0 0 1 0.25-0.25z`);
      }
    }
    if (style !== 'square') [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([fx, fy]) => {
      const X = fx + q, Y = fy + q, rr = style === 'dots' ? 2.2 : 1.6;
      const rect = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}z`;
      const rectCCW = (x, y, w, h, r) => `M${x + r} ${y}a${r} ${r} 0 0 0-${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 0 ${r} ${r}h${w - 2 * r}a${r} ${r} 0 0 0 ${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 0-${r}-${r}z`;
      out.push(rect(X, Y, 7, 7, rr) + rectCCW(X + 1, Y + 1, 5, 5, rr * 0.6) + rect(X + 2, Y + 2, 3, 3, rr * 0.45));
    });
    return { d: out.join(''), size: N + 2 * q };
  };

  // ===== Perspektif: tasarımı fotoğraftaki dörtgene bük (üçgen ağıyla) =====
  T.homography = function (src, dst) {
    // src/dst: 4 nokta [[x,y]...] → 3x3 matris (h33=1)
    const A = [], b = [];
    for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
    for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]]; for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
    const h = b.map((v, i) => v / A[i][i]);
    return (x, y) => { const w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; };
  };
  T.warpDraw = function (ctx, img, quad, n = 14) {
    const W = img.width, H = img.height, map = T.homography([[0, 0], [W, 0], [W, H], [0, H]], quad);
    const tri = (s0, s1, s2, d0, d1, d2) => {
      ctx.save(); ctx.beginPath();
      // kenar boşluklarını önlemek için üçgeni biraz büyüt
      const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3, e = (p) => [p[0] + (p[0] - cx) * 0.03 + Math.sign(p[0] - cx) * 0.4, p[1] + (p[1] - cy) * 0.03 + Math.sign(p[1] - cy) * 0.4];
      const [a, b, c] = [e(d0), e(d1), e(d2)];
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.clip();
      const den = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
      const m11 = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / den;
      const m12 = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / den;
      const m21 = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / den;
      const m22 = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / den;
      ctx.transform(m11, m12, m21, m22, d0[0] - m11 * s0[0] - m21 * s0[1], d0[1] - m12 * s0[0] - m22 * s0[1]);
      ctx.drawImage(img, 0, 0); ctx.restore();
    };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x0 = (W * i) / n, x1 = (W * (i + 1)) / n, y0 = (H * j) / n, y1 = (H * (j + 1)) / n;
      const p00 = [x0, y0], p10 = [x1, y0], p01 = [x0, y1], p11 = [x1, y1];
      tri(p00, p10, p11, map(...p00), map(...p10), map(...p11));
      tri(p00, p11, p01, map(...p00), map(...p11), map(...p01));
    }
  };

  // ===== Ön kontrol yardımcıları =====
  T.rgb = (col) => { let h = String((R.parseColor(col) || {}).hex || col || '#000').replace('#', '').trim(); if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h.slice(0, 6), 16) || 0; return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };
  T.lum = (hex) => { const c = T.rgb(hex); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  T.contrast = (a, b) => { const x = T.lum(a), y = T.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  T.outOfCMYK = (hex) => {
    const c = T.rgb(hex); const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx === 0 ? 0 : (mx - mn) / mx;
    let h = 0; if (mx !== mn) { const d = mx - mn; h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
    // parlak yeşil, camgöbeği-mavi, saf mavi, mor ve neon turuncu CMYK'da soluk çıkar
    return s > 0.8 && mx > 0.75 && ((h > 80 && h < 170) || (h > 190 && h < 280) || (h > 285 && h < 320));
  };

  // Çok sayfalı PDF (her tasarım bir sayfa; sayfa ölçüsü pt = px)
  T.multiPagePDF = async function (docs, { scale = 2.5 } = {}) {
    const enc = new TextEncoder(), objs = [];
    const n = docs.length, kids = docs.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
    objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
    for (let i = 0; i < n; i++) {
      const d = docs[i], sc = Math.min(scale, 9000 / Math.max(d.width, d.height));
      const c = await R.exportCanvas(d, sc, '#ffffff');
      const jpg = new Uint8Array(await (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))).arrayBuffer());
      const pw = d.width.toFixed(2), ph = d.height.toFixed(2), base = 3 + i * 3;
      const content = enc.encode(`q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q\n`);
      objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${base + 1} 0 R >> >> /Contents ${base + 2} 0 R >>`);
      objs.push({ head: `<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`, data: jpg });
      objs.push({ head: `<< /Length ${content.length} >>\nstream\n`, data: content });
    }
    const parts = [enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')]; let off = parts[0].length; const xref = [];
    objs.forEach((o, i) => { xref.push(off); const pre = enc.encode(`${i + 1} 0 obj\n`); const chunk = typeof o === 'string' ? [pre, enc.encode(o + '\nendobj\n')] : [pre, enc.encode(o.head), o.data, enc.encode('\nendstream\nendobj\n')]; chunk.forEach((c) => { parts.push(c); off += c.length; }); });
    let x = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; xref.forEach((o) => (x += String(o).padStart(10, '0') + ' 00000 n \n'));
    x += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${off}\n%%EOF\n`; parts.push(enc.encode(x));
    return new Blob(parts, { type: 'application/pdf' });
  };
  // Vektör PDF: tarayıcının yazdırma penceresi (yazılar ve şekiller vektör kalır)
  T.vectorPrint = async function (d, { wmm, hmm, bleedMM = 0 } = {}) {
    const w = window.open('', '_blank'); // kullanıcı tıklamasıyla hemen açılmalı
    if (!w) throw new Error('Açılır pencere engellendi; tarayıcıda bu site için açılır pencereye izin ver.');
    w.document.write('<p style="font:16px system-ui;padding:20px">Hazırlanıyor…</p>');
    const ppm = d.width / wmm;
    const svg = await R.exportSVGString(d, { bleed: bleedMM * ppm });
    const pw = wmm + 2 * bleedMM, ph = hmm + 2 * bleedMM;
    w.document.open();
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${String(d.name || 'tasarim').replace(/[<>]/g, '')} — PDF olarak kaydet</title><style>@page{size:${pw}mm ${ph}mm;margin:0}html,body{margin:0;padding:0}body>svg{display:block;width:${pw}mm;height:${ph}mm}@media screen{body{background:#666;display:grid;place-items:center;min-height:100vh}body>svg{box-shadow:0 10px 40px #0008;background:#fff}.tip{position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#111;color:#fff;font:14px system-ui;padding:8px 14px;border-radius:8px}}@media print{.tip{display:none}}</style></head><body><div class="tip">Hedef: “PDF olarak kaydet” · Kenar boşlukları: Yok · Ölçek: %100</div>${svg}</body></html>`);
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 800);
  };

  // =========================================================
  // ARKA PLAN SİLME (kenarlardan renk taşırma ile)
  // =========================================================
  T.removeBackground = function (src, tolerance = 40, feather = 2) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, 2200 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h), px = id.data;
        const seen = new Uint8Array(w * h), out = new Uint8Array(w * h);
        const q = new Int32Array(w * h);
        let qh = 0, qt = 0;
        const t2 = tolerance * tolerance * 3;
        // kenar renklerinden tohum
        const seeds = [];
        for (let x = 0; x < w; x++) seeds.push(x, (h - 1) * w + x);
        for (let y = 0; y < h; y++) seeds.push(y * w, y * w + w - 1);
        for (const i of seeds) {
          if (seen[i]) continue;
          if (px[i * 4 + 3] < 10) { seen[i] = 1; out[i] = 1; q[qt++] = i; continue; }
          seen[i] = 1; out[i] = 1; q[qt++] = i;
        }
        const ref = new Int32Array(w * h).fill(-1);
        for (let k = 0; k < qt; k++) ref[q[k]] = q[k];
        const dist = (a, b) => { const A = a * 4, B = b * 4; const dr = px[A] - px[B], dg = px[A + 1] - px[B + 1], db = px[A + 2] - px[B + 2]; return dr * dr + dg * dg + db * db; };
        while (qh < qt) {
          const i = q[qh++], x = i % w, y = (i / w) | 0;
          const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
          for (const n of nb) {
            if (n < 0 || seen[n]) continue;
            if (dist(n, i) < t2 / 6 && dist(n, ref[i]) < t2) { seen[n] = 1; out[n] = 1; ref[n] = ref[i]; q[qt++] = n; }
          }
        }
        // yumuşak kenar
        for (let i = 0; i < w * h; i++) if (out[i]) px[i * 4 + 3] = 0;
        if (feather > 0) {
          const a2 = new Uint8ClampedArray(w * h);
          for (let i = 0; i < w * h; i++) a2[i] = px[i * 4 + 3];
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (out[i]) continue;
            let near = 0, cnt = 0;
            for (let dy = -feather; dy <= feather; dy++) for (let dx = -feather; dx <= feather; dx++) {
              const xx = x + dx, yy = y + dy;
              if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
              cnt++; if (out[yy * w + xx]) near++;
            }
            if (near) a2[i] = Math.round(a2[i] * (1 - (near / cnt) * 0.85));
          }
          for (let i = 0; i < w * h; i++) px[i * 4 + 3] = a2[i];
        }
        ctx.putImageData(id, 0, 0);
        const removed = out.reduce((a, b) => a + b, 0) / (w * h);
        res({ dataURL: c.toDataURL('image/png'), removed });
      };
      img.onerror = () => rej(new Error('Görsel açılamadı'));
      img.src = src;
    });
  };

  // =========================================================
  // OTOMATİK TASARIM KONTROLÜ
  // =========================================================
  function lumOf(c) {
    const { hex } = R.parseColor(c);
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  T.contrast = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const solidOf = (f) => (!f || f === 'none' ? null : typeof f === 'string' ? (R.parseColor(f).a >= 0.75 ? f : null) : f.colors && f.colors.length ? f.colors[Math.floor(f.colors.length / 2)] : null);

  T.autoFix = function (d, { apply = true, sampler = null } = {}) {
    const W = d.width, H = d.height, m = Math.min(W, H) * 0.03;
    const fixes = [];
    // akış grupları varsa (sistem düzeni) gerçek ölçüyle yeniden diz; yoksa çakışmaları it
    const flowed = apply && R.reflow(d);
    const texts = flowed || (d.meta && d.meta.noStack) ? [] : d.layers.filter((l) => l.type === 'text' && l.visible && !l.rotation);
    texts.forEach((l) => R.layoutText(l));
    const items = [];
    const owned = new Set();
    d.layers.filter((u) => u.visible && !u.rotation && /cta-bg/.test(u.role || '')).forEach((u) => {
      const inner = texts.filter((x) => { const cx = x.x + x.w / 2, cy = x.y + x.h / 2; return cx >= u.x && cx <= u.x + u.w && cy >= u.y && cy <= u.y + u.h; });
      inner.forEach((x) => owned.add(x));
      items.push({ ls: [u, ...inner], get x() { return u.x; }, get w() { return u.w; }, get y() { return u.y; }, get h() { return u.h; } });
    });
    texts.filter((x) => !owned.has(x) && !/badge/.test(x.role || '')).forEach((x) => items.push({ ls: [x], get x() { return x.x; }, get w() { return x.w; }, get y() { return x.y; }, get h() { return x.h; } }));
    const move = (it, dy) => it.ls.forEach((l) => (l.y += dy));
    for (let pass = 0; pass < 3; pass++) {
      items.sort((p, q) => p.y - q.y);
      let changed = false;
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const A2 = items[i], B2 = items[j];
        if (!(A2.x < B2.x + B2.w && B2.x < A2.x + A2.w)) continue;
        const ov = A2.y + A2.h - B2.y;
        if (ov <= 1) continue;
        if (apply) move(B2, ov + Math.min(W, H) * 0.015);
        changed = true;
        const nm = B2.ls.find((l) => l.type === 'text');
        const msg = '“' + String((nm || {}).text || 'buton').slice(0, 24) + '” üstündeki öğeyle çakışıyordu, aralık açıldı';
        if (!fixes.includes(msg)) fixes.push(msg);
      }
      if (!apply || !changed) break;
      // alta taşan yığını yukarı kaydır, sığmazsa yazıları küçült
      const bottom = Math.max(...items.map((it) => it.y + it.h));
      const over = bottom - (H - m);
      if (over > 0) {
        const stack = items.filter((it) => it.y + it.h > H * 0.35);
        const top = Math.min(...stack.map((it) => it.y));
        const room = top - m;
        if (room >= over) stack.forEach((it) => move(it, -over));
        else texts.forEach((x) => { x.fontSize = Math.round(x.fontSize * 0.9); R.layoutText(x); });
      }
    }
    d.layers.forEach((l, idx) => {
      if (l.type !== 'text' || !l.visible) return;
      const name = '“' + String(l.text || '').slice(0, 24) + '”';
      if (l.rotation) return;
      // tuvalden geniş
      if (l.w > W - 2 * m) { if (apply) { l.w = W - 2 * m; l.x = m; } fixes.push(`${name} tuvalden genişti, daraltıldı`); }
      R.layoutText(l);
      // tek satıra sığmayan uzun kelime (harf harf bölünmesin)
      let shrunk = false;
      const longWord = () => String(l.uppercase ? String(l.text).toLocaleUpperCase('tr-TR') : l.text).split(/\s+/).some((w) => R.measure(w, l) > l.w + 1);
      while ((l._lines.some((ln) => R.measure(ln, l) > l.w + 1) || longWord()) && l.fontSize > 8) { if (!apply) { shrunk = true; break; } l.fontSize = Math.round(l.fontSize * 0.94); R.layoutText(l); shrunk = true; }
      if (shrunk) fixes.push(`${name} kutusuna sığmıyordu, yazı küçültüldü`);
      // yetim satır: son satırda tek kısa parça (örn. "g)") kalmışsa yazıyı hafifçe küçült
      if (l._lines.length > 1 && !String(l.text).includes('\n')) {
        const lastL = l._lines[l._lines.length - 1].trim();
        if (lastL.length <= 4 || (lastL.split(/\s+/).length === 1 && lastL.length <= 6 && l._lines.length <= 3)) {
          const f0 = l.fontSize, n0 = l._lines.length;
          let tries = 0;
          while (l._lines.length >= n0 && tries++ < 6) { l.fontSize = Math.round(l.fontSize * 0.97 * 10) / 10; R.layoutText(l); }
          if (l._lines.length < n0 && apply) fixes.push(`${name} satır sonunda tek parça kalıyordu, düzeltildi`);
          else { l.fontSize = f0; R.layoutText(l); }
          if (!apply) { l.fontSize = f0; R.layoutText(l); }
        }
      }
      // dışarı taşma
      if (l.x < 0 || l.x + l.w > W) { if (apply) l.x = Math.min(Math.max(l.x, m), W - l.w - m); fixes.push(`${name} yatayda tuval dışına taşıyordu`); }
      if (l.y + l.h > H - m * 0.5 || l.y < 0) {
        if (apply) {
          if (l.y < 0) l.y = m;
          let guard = 0;
          while (l.y + l.h > H - m && guard++ < 40) {
            if (l.h > H * 0.5 && l.fontSize > 10) { l.fontSize = Math.round(l.fontSize * 0.92); R.layoutText(l); }
            else l.y = Math.max(m, H - m - l.h);
          }
        }
        fixes.push(`${name} dikeyde tuval dışına taşıyordu`);
      }
      // kontrast
      const fg = solidOf(l.fill);
      if (!fg) return;
      const cx = l.x + l.w / 2, cy = l.y + l.h / 2;
      let under = null;
      if (sampler) under = sampler(l.x, l.y, l.w, l.h);
      if (!under) {
      for (let j = idx - 1; j >= 0; j--) {
        const u = d.layers[j];
        if (!u.visible || u.type === 'text' || u.rotation) continue;
        if (cx < u.x || cx > u.x + u.w || cy < u.y || cy > u.y + u.h) continue;
        if (u.type === 'image') { under = 'image'; break; }
        if ((u.opacity ?? 1) < 0.75) continue;
        const c = solidOf(u.fill); if (c) { under = c; break; }
      }
      if (under === 'image') return;
      if (!under) under = d.background.type === 'solid' ? d.background.color : solidOf(d.background);
      }
      if (!under) return;
      const cr = T.contrast(fg, under), need = l.fontSize >= 36 ? 3 : 4.5;
      if (cr < need) {
        const alt = T.contrast('#FFFFFF', under) >= T.contrast('#111111', under) ? '#FFFFFF' : '#111111';
        if (apply) l.fill = alt;
        fixes.push(`${name} zeminle yeterince ayrışmıyordu (kontrast ${cr.toFixed(1)}), rengi ${alt === '#FFFFFF' ? 'beyaz' : 'koyu'} yapıldı`);
      }
    });
    return fixes;
  };

  // =========================================================
  // TIKLANAN NOKTADAKİ YAZI SATIRINI BUL (yapay zekasız)
  // px: RGBA dizi, cw/ch: boyut, (x,y): tıklanan nokta (aynı ölçekte)
  // =========================================================
  T.findTextLine = function (px, cw, ch, x, y) {
    x = Math.round(x); y = Math.round(y);
    const x0 = Math.max(0, x - Math.round(cw * 0.5)), x1 = Math.min(cw - 1, x + Math.round(cw * 0.5));
    const y0 = Math.max(0, y - Math.round(ch * 0.14)), y1 = Math.min(ch - 1, y + Math.round(ch * 0.14));
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    // zemin: tıklanan bandın medyan rengi
    const rs = [], gs = [], bs = [];
    for (let yy = Math.max(y0, y - 12); yy <= Math.min(y1, y + 12); yy += 2) for (let xx = x0; xx <= x1; xx += 3) { const i = (yy * cw + xx) * 4; rs.push(px[i]); gs.push(px[i + 1]); bs.push(px[i + 2]); }
    const med = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; };
    const bg = [med(rs), med(gs), med(bs)];
    const mask = new Uint8Array(W * H);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const i = ((yy + y0) * cw + xx + x0) * 4;
      if (Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]) > 75) mask[yy * W + xx] = 1;
    }
    // bileşenleri etiketle
    const lab = new Int32Array(W * H).fill(-1), comps = [], q = new Int32Array(W * H);
    for (let s = 0; s < W * H; s++) {
      if (!mask[s] || lab[s] >= 0) continue;
      let qh = 0, qt = 0; q[qt++] = s; lab[s] = comps.length;
      let a = W, b = H, c = 0, d = 0, n = 0;
      while (qh < qt) {
        const k = q[qh++], kx = k % W, ky = (k / W) | 0; n++;
        if (kx < a) a = kx; if (kx > c) c = kx; if (ky < b) b = ky; if (ky > d) d = ky;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = kx + dx, ny = ky + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const m = ny * W + nx; if (mask[m] && lab[m] < 0) { lab[m] = comps.length; q[qt++] = m; }
        }
      }
      comps.push({ x0: a, y0: b, x1: c, y1: d, n });
    }
    // tıklanan noktaya en yakın bileşen
    const cx = x - x0, cy = y - y0;
    let seed = -1, best = 1e9;
    for (let i = 0; i < comps.length; i++) {
      const k = comps[i]; if (k.n < 4) continue;
      const hh = k.y1 - k.y0, ww = k.x1 - k.x0;
      if (hh > H * 0.9 || hh > ch * 0.12 || ww > cw * 0.45) continue;
      const dx = Math.max(k.x0 - cx, 0, cx - k.x1), dy = Math.max(k.y0 - cy, 0, cy - k.y1);
      const dd = Math.hypot(dx, dy);
      if (dd < best) { best = dd; seed = i; }
    }
    if (seed < 0 || best > 30) return null;
    const box = Object.assign({}, comps[seed]);
    const used = new Set([seed]);
    let lh = Math.max(6, box.y1 - box.y0);
    for (let it = 0; it < 60; it++) {
      let changed = false;
      for (let i = 0; i < comps.length; i++) {
        if (used.has(i)) continue;
        const k = comps[i]; if (k.n < 2) continue;
        const kh = k.y1 - k.y0;
        if (kh > lh * 2.4 || (k.x1 - k.x0) > cw * 0.4) continue;
        const ov = Math.min(box.y1, k.y1) - Math.max(box.y0, k.y0);
        const inBand = ov >= Math.min(kh, lh) * 0.35 || (k.y1 <= box.y1 + lh * 0.5 && k.y0 >= box.y0 - lh * 0.5 && kh < lh * 0.5);
        const gap = Math.max(k.x0 - box.x1, box.x0 - k.x1);
        if (inBand && gap < Math.max(6, lh * 0.75)) {
          used.add(i); changed = true;
          box.x0 = Math.min(box.x0, k.x0); box.x1 = Math.max(box.x1, k.x1);
          box.y0 = Math.min(box.y0, k.y0); box.y1 = Math.max(box.y1, k.y1);
          lh = Math.max(lh, Math.min(kh, lh * 1.5));
        }
      }
      if (!changed) break;
    }
    const res = { x: box.x0 + x0, y: box.y0 + y0, w: box.x1 - box.x0 + 1, h: box.y1 - box.y0 + 1 };
    if (res.h > ch * 0.16 || res.w * res.h > cw * ch * 0.12) return null; // yazı satırı için fazla büyük
    return res;
  };

  // =========================================================
  // AKILLI DOLDURMA (inpainting): bölgedeki yazıyı çevresinden doldurarak siler
  // src: kaynak canvas; Rg: bölge {x,y,w,h}; B: yazı kutusu {x,y,w,h} (src pikseli)
  // =========================================================
  T.inpaintRegion = function (src, Rg, B, opts = {}) {
    const x0 = Math.max(0, Math.floor(Rg.x)), y0 = Math.max(0, Math.floor(Rg.y));
    const w = Math.min(src.width - x0, Math.ceil(Rg.w)), h = Math.min(src.height - y0, Math.ceil(Rg.h));
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const ctx = out.getContext('2d');
    ctx.drawImage(src, x0, y0, w, h, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h), px = id.data;
    const bx0 = Math.max(0, Math.floor(B.x - x0) - 1), by0 = Math.max(0, Math.floor(B.y - y0) - 1);
    const bx1 = Math.min(w - 1, Math.ceil(B.x + B.w - x0) + 1), by1 = Math.min(h - 1, Math.ceil(B.y + B.h - y0) + 1);
    // halka (kutu dışı) istatistikleri
    const ring = [[], [], []];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (x >= bx0 && x <= bx1 && y >= by0 && y <= by1) continue;
      const i = (y * w + x) * 4; ring[0].push(px[i]); ring[1].push(px[i + 1]); ring[2].push(px[i + 2]);
    }
    const med = (a) => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1] || 0; };
    const bg = ring.map(med);
    const std = ring.map((a, k) => { if (!a.length) return 0; const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length); });
    const tol = opts.tol || Math.max(45, 1.6 * Math.max(...std));
    // yazı maskesi: zeminden belirgin farklı pikseller, 3 px genişletilmiş
    let mask = new Uint8Array(w * h);
    let cnt = 0, area = 0;
    if (opts.mask) { mask = opts.mask; cnt = -1; } else
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      area++;
      const i = (y * w + x) * 4;
      if (Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]) > tol) { mask[y * w + x] = 1; cnt++; }
    }
    const dil = (m, r) => {
      const o = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) o[yy * w + xx] = 1;
        }
      }
      return o;
    };
    const r = opts.mask ? 2 : Math.max(2, Math.round(Math.min(B.h, B.w) * 0.06));
    mask = dil(mask, r);
    if (cnt > area * 0.55 || opts.full) { for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) mask[y * w + x] = 1; }
    // normalize evrişim ile doldurma: bilinen piksellerin ağırlıklı bulanığı (çizgi/şerit bırakmaz)
    const N = w * h;
    const K = new Float32Array(N);
    for (let k = 0; k < N; k++) K[k] = mask[k] ? 0 : 1;
    const boxBlur = (src2, r2) => {
      const tmp = new Float32Array(N), out = new Float32Array(N);
      for (let y = 0; y < h; y++) { let s = 0; const row = y * w;
        for (let x = -r2; x <= r2; x++) s += src2[row + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) { tmp[row + x] = s; s += src2[row + Math.min(w - 1, x + r2 + 1)] - src2[row + Math.max(0, x - r2)]; } }
      for (let x = 0; x < w; x++) { let s = 0;
        for (let y = -r2; y <= r2; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) { out[y * w + x] = s; s += tmp[Math.min(h - 1, y + r2 + 1) * w + x] - tmp[Math.max(0, y - r2) * w + x]; } }
      return out;
    };
    const chans = [0, 1, 2].map((c) => { const a2 = new Float32Array(N); for (let k = 0; k < N; k++) a2[k] = px[k * 4 + c] * K[k]; return a2; });
    const radii = [Math.max(3, Math.round(Math.min(w, h) * 0.04)), Math.max(8, Math.round(Math.min(w, h) * 0.15)), Math.max(20, Math.round(Math.max(w, h) * 0.35))];
    const filled = new Uint8Array(N);
    for (const rr of radii) {
      let Wt = K, C = chans;
      for (let it = 0; it < 2; it++) { Wt = boxBlur(Wt, rr); C = C.map((ch2) => boxBlur(ch2, rr)); }
      for (let k = 0; k < N; k++) {
        if (!mask[k] || filled[k]) continue;
        const wt = Wt[k];
        if (wt > 1e-3 * (2 * rr + 1) ** 4 * 0.02) { const i = k * 4; px[i] = C[0][k] / wt; px[i + 1] = C[1][k] / wt; px[i + 2] = C[2][k] / wt; filled[k] = 1; }
      }
    }
    for (let k = 0; k < N; k++) if (mask[k] && !filled[k]) { const i = k * 4; px[i] = bg[0]; px[i + 1] = bg[1]; px[i + 2] = bg[2]; }
    // yumuşatma + doku için hafif gren
    for (let pass = 0; pass < 6; pass++) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const k = y * w + x; if (!mask[k]) continue; const i = k * 4;
      for (let c = 0; c < 3; c++) px[i + c] = (px[i + c] * 2 + px[i - 4 + c] + px[i + 4 + c] + px[i - w * 4 + c] + px[i + w * 4 + c]) / 6;
    }
    const g = Math.min(18, (std[0] + std[1] + std[2]) / 3 * 0.35);
    if (g > 1) for (let k = 0; k < w * h; k++) if (mask[k]) { const n = (Math.random() + Math.random() - 1) * g; const i = k * 4; px[i] += n; px[i + 1] += n; px[i + 2] += n; }
    // kenar yumuşatma (bölge sınırında saydamlaşır)
    const f = Math.max(2, Math.min(opts.feather || 6, Math.floor(Math.min(w, h) / 4)));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (d < f) px[(y * w + x) * 4 + 3] = Math.round(255 * (d + 0.5) / f);
    }
    ctx.putImageData(id, 0, 0);
    return { canvas: out, x: x0, y: y0, w, h, bg };
  };
  // Seçimdeki nesneyi zeminden ayıran maske (bölge koordinatında). poly: bölgeye göre nokta listesi (serbest seçim)
  T.selectionMask = function (src, Rg, B, { poly = null, object = true } = {}) {
    const x0 = Math.max(0, Math.floor(Rg.x)), y0 = Math.max(0, Math.floor(Rg.y));
    const w = Math.min(src.width - x0, Math.ceil(Rg.w)), h = Math.min(src.height - y0, Math.ceil(Rg.h));
    // seçim alanı (dikdörtgen ya da çokgen)
    const sc = document.createElement('canvas'); sc.width = w; sc.height = h;
    const sx = sc.getContext('2d'); sx.fillStyle = '#fff';
    if (poly && poly.length > 2) { sx.beginPath(); poly.forEach((p, i) => (i ? sx.lineTo(p.x - x0, p.y - y0) : sx.moveTo(p.x - x0, p.y - y0))); sx.closePath(); sx.fill(); }
    else sx.fillRect(B.x - x0, B.y - y0, B.w, B.h);
    const sel = sx.getImageData(0, 0, w, h).data;
    const inSel = new Uint8Array(w * h);
    for (let k = 0; k < w * h; k++) inSel[k] = sel[k * 4 + 3] > 127 ? 1 : 0;
    if (!object) return { mask: inSel, inSel, x0, y0, w, h, objectFound: false };
    // nesne: seçim içinde, seçim kenarındaki zemin renginden belirgin farklı pikseller
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d'); cx.drawImage(src, x0, y0, w, h, 0, 0, w, h);
    const px = cx.getImageData(0, 0, w, h).data;
    const edge = [[], [], []];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = y * w + x; if (!inSel[k]) continue;
      const border = !inSel[k - 1] || !inSel[k + 1] || !inSel[k - w] || !inSel[k + w] || x === 0 || y === 0 || x === w - 1 || y === h - 1;
      if (border) { edge[0].push(px[k * 4]); edge[1].push(px[k * 4 + 1]); edge[2].push(px[k * 4 + 2]); }
    }
    const med = (a) => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1] || 0; };
    const bg = edge.map(med);
    const sd = edge.map((a) => { if (!a.length) return 0; const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); });
    const tol = Math.max(40, 1.5 * Math.max(...sd));
    const mask = new Uint8Array(w * h);
    let n = 0, tot = 0;
    for (let k = 0; k < w * h; k++) {
      if (!inSel[k]) continue; tot++;
      const i = k * 4;
      if (Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]) > tol) { mask[k] = 1; n++; }
    }
    // küçük delikleri kapat (kapanış: genişlet + daralt)
    const morph = (m, r, grow) => {
      const o = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = grow ? 0 : 1;
        for (let dy = -r; dy <= r && (grow ? !v : v); dy++) for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx, yy = y + dy; const mv = xx >= 0 && yy >= 0 && xx < w && yy < h ? m[yy * w + xx] : 0;
          if (grow && mv) { v = 1; break; } if (!grow && !mv) { v = 0; break; }
        }
        o[y * w + x] = v && inSel[y * w + x] ? 1 : 0;
      }
      return o;
    };
    let mm = morph(morph(mask, 2, true), 1, false);
    const frac = tot ? n / tot : 0;
    const objectFound = frac > 0.02 && frac < 0.92;
    return { mask: objectFound ? mm : inSel, inSel, x0, y0, w, h, objectFound };
  };

  // Bir canvas'ı kenarları yumuşatılmış olarak kopyala (yapay zeka yamaları için)
  T.featherCanvas = function (c, f) {
    const x = c.getContext('2d'), w = c.width, h = c.height, id = x.getImageData(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const d = Math.min(xx, y, w - 1 - xx, h - 1 - y);
      if (d < f) id.data[(y * w + xx) * 4 + 3] = Math.round(255 * (d + 0.5) / f);
    }
    x.putImageData(id, 0, 0);
    return c;
  };

  // Metinlerin altındaki gerçek rengi, tasarımı metinsiz çizip örnekleyerek bulur
  T.autoFixAsync = async function (d, opts = {}) {
    let sampler = null;
    try {
      const sc = Math.min(1, 360 / Math.max(d.width, d.height));
      const bare = Object.assign({}, d, { layers: d.layers.filter((l) => l.type !== 'text') });
      const c = await R.exportCanvas(bare, sc, '#ffffff');
      const ctx = c.getContext('2d');
      const px = ctx.getImageData(0, 0, c.width, c.height).data;
      sampler = (x, y, w, h) => {
        const x0 = Math.max(0, Math.floor(x * sc)), y0 = Math.max(0, Math.floor(y * sc));
        const x1 = Math.min(c.width, Math.ceil((x + w) * sc)), y1 = Math.min(c.height, Math.ceil((y + h) * sc));
        let r = 0, g = 0, b = 0, n = 0;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * c.width + xx) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; }
        if (!n) return null;
        return '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
      };
    } catch (e) { sampler = null; }
    return T.autoFix(d, Object.assign({}, opts, { sampler }));
  };

  // =========================================================
  // ÖĞE KÜTÜPHANESİ (vektör yollar, 100×100 kutu)
  // =========================================================
  T.ASSETS = [
    { g: 'Rozet', n: 'Patlama rozeti', d: (() => { const p = []; for (let i = 0; i < 32; i++) { const r = i % 2 ? 40 : 50, a = (Math.PI * i) / 16 - Math.PI / 2; p.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`); } return 'M' + p.join(' L') + ' Z'; })() },
    { g: 'Rozet', n: 'Yıldız', d: R.MASKS.star },
    { g: 'Rozet', n: 'Kalp', d: R.MASKS.heart },
    { g: 'Rozet', n: 'Altıgen', d: R.MASKS.hexagon },
    { g: 'Rozet', n: 'Kurdele', d: 'M0 20 H100 L88 50 L100 80 H0 L12 50 Z' },
    { g: 'Rozet', n: 'Etiket', d: 'M0 10 H78 L100 50 L78 90 H0 Z' },
    { g: 'Şekil', n: 'Konuşma balonu', d: 'M10 5 H90 Q100 5 100 15 V65 Q100 75 90 75 H40 L20 95 L24 75 H10 Q0 75 0 65 V15 Q0 5 10 5 Z' },
    { g: 'Şekil', n: 'Ok', d: 'M0 38 H62 V15 L100 50 L62 85 V62 H0 Z' },
    { g: 'Şekil', n: 'Kemer', d: R.MASKS.arch },
    { g: 'Şekil', n: 'Organik leke', d: R.MASKS.blob },
    { g: 'Şekil', n: 'Dalga', d: 'M0 40 C20 20 30 20 50 40 C70 60 80 60 100 40 V100 H0 Z' },
    { g: 'Şekil', n: 'Üçgen', d: R.MASKS.triangle },
    { g: 'Çerçeve', n: 'Köşe çerçeve', d: 'M0 0 H30 V6 H6 V30 H0 Z M100 0 V30 H94 V6 H70 V0 Z M100 100 H70 V94 H94 V70 H100 Z M0 100 V70 H6 V94 H30 V100 Z' },
    { g: 'Çerçeve', n: 'Çift çizgi', d: 'M0 0 H100 V100 H0 Z M4 4 V96 H96 V4 Z M7 7 H93 V93 H7 Z M9 9 V91 H91 V9 Z', evenodd: true },
    { g: 'İkon', n: 'Telefon', stroke: true, d: 'M22 16 C22 12 25 10 29 10 H38 L44 28 L36 34 C40 44 48 52 58 56 L64 48 L82 54 V63 C82 67 79 70 75 70 C45 70 22 47 22 16 Z' },
    { g: 'İkon', n: 'Konum', stroke: true, d: 'M50 92 C50 92 20 60 20 38 A30 30 0 0 1 80 38 C80 60 50 92 50 92 Z M50 50 A12 12 0 1 0 50 26 A12 12 0 1 0 50 50 Z' },
    { g: 'İkon', n: 'E-posta', stroke: true, d: 'M10 22 H90 V78 H10 Z M10 22 L50 54 L90 22' },
    { g: 'İkon', n: 'Web', stroke: true, d: 'M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 Z M10 50 H90 M50 10 C30 30 30 70 50 90 M50 10 C70 30 70 70 50 90' },
    { g: 'İkon', n: 'Saat', stroke: true, d: 'M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 Z M50 26 V50 L66 60' },
    { g: 'İkon', n: 'Takvim', stroke: true, d: 'M14 20 H86 V88 H14 Z M14 38 H86 M32 10 V28 M68 10 V28' },
    { g: 'İkon', n: 'Sepet', stroke: true, d: 'M8 14 H22 L32 64 H80 L90 28 H26 M38 84 A5 5 0 1 0 38 74 A5 5 0 1 0 38 84 Z M74 84 A5 5 0 1 0 74 74 A5 5 0 1 0 74 84 Z' },
    { g: 'İkon', n: 'Onay', stroke: true, d: 'M14 52 L38 76 L86 24' },
    { g: 'İkon', n: 'Kamera', stroke: true, d: 'M28 12 H72 Q88 12 88 28 V72 Q88 88 72 88 H28 Q12 88 12 72 V28 Q12 12 28 12 Z M50 66 A16 16 0 1 0 50 34 A16 16 0 1 0 50 66 Z M72 26 L72 27' },
  ];

  // =========================================================
  // EAN-13 / UPC-A VEKTÖR BARKOD
  // =========================================================
  const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const EAN_G = EAN_L.map((c) => c.split('').reverse().map((b) => (b === '0' ? '1' : '0')).join(''));
  const EAN_R = EAN_L.map((c) => c.split('').map((b) => (b === '0' ? '1' : '0')).join(''));
  const EAN_PAR = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  T.eanCheck = function (d12) {
    let s = 0;
    for (let i = 0; i < 12; i++) s += (+d12[i]) * (i % 2 ? 3 : 1);
    return String((10 - (s % 10)) % 10);
  };
  // value: 12 hane (kontrol hanesi eklenir), 13 hane (doğrulanır), UPC-A 11/12 hane (başına 0)
  T.ean13 = function (value) {
    let v = String(value || '').replace(/[\s-]/g, '');
    if (!/^\d+$/.test(v)) return { ok: false, error: 'Barkod yalnızca rakamlardan oluşmalı.' };
    if (v.length === 11) v = '0' + v; // UPC-A kontrol hanesiz → EAN-12
    if (v.length === 12) v = v + T.eanCheck(v);
    if (v.length !== 13) return { ok: false, error: `EAN-13 için 12 ya da 13 hane gerekir (girilen: ${v.length}).` };
    const want = T.eanCheck(v.slice(0, 12));
    if (v[12] !== want) return { ok: false, error: `Kontrol hanesi hatalı: son hane ${want} olmalı (${v.slice(0, 12)}${want}).`, suggest: v.slice(0, 12) + want };
    const par = EAN_PAR[+v[0]];
    let bits = '101';
    for (let i = 1; i <= 6; i++) bits += (par[i - 1] === 'L' ? EAN_L : EAN_G)[+v[i]];
    bits += '01010';
    for (let i = 7; i <= 12; i++) bits += EAN_R[+v[i]];
    bits += '101';
    const guard = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);
    return { ok: true, value: v, bits, guard };
  };
  // Barkod için düzenlenebilir katmanlar: beyaz zemin + çubuklar (tek vektör yol) + rakamlar
  T.barcodeLayers = function (value, { x = 0, y = 0, w = 300, h = 200, color = '#000000', bg = '#FFFFFF', font = 'Arial', group } = {}) {
    const e = T.ean13(value);
    if (!e.ok) throw new Error(e.error);
    const QL = 11, QR = 7, TOT = 95 + QL + QR;
    const m = w / TOT;
    const digitH = m * 9;            // rakam boyu ~9 modül
    const top = m * 3;
    const barH = Math.max(m * 20, h - top - digitH - m * 1.5);
    const guardH = barH + digitH * 0.55;
    let d = '';
    const bits = e.bits;
    for (let i = 0; i < 95;) {
      if (bits[i] !== '1') { i++; continue; }
      let j = i; while (j < 95 && bits[j] === '1' && e.guard.has(j) === e.guard.has(i)) j++;
      const hh = e.guard.has(i) ? guardH : barH;
      d += `M${i} 0H${j}V${+(hh / m).toFixed(3)}H${i}Z`;
      i = j;
    }
    const vh = +(guardH / m).toFixed(3);
    const g = group || 'bc' + R.uid();
    const bx = x + QL * m;
    const layers = [];
    if (bg && bg !== 'none') layers.push({ type: 'rect', name: 'Barkod zemini', x, y, w, h: top + barH + digitH + m * 2, fill: bg, group: g, role: 'barcode-bg' });
    layers.push({ type: 'path', name: 'Barkod ' + e.value, d, vw: 95, vh, x: bx, y: y + top, w: 95 * m, h: guardH, fill: color, group: g, role: 'barcode', barcode: { type: 'ean13', value: e.value } });
    const fs = Math.round(digitH * 1.05 * 10) / 10;
    const ty = y + top + barH + m * 0.6;
    const txt = (t, cx, cw, align) => ({ type: 'text', name: 'Barkod rakamı', text: t, x: cx, y: ty, w: cw, h: digitH, fontSize: fs, fontFamily: font, fontWeight: 400, fill: color, align, letterSpacing: +Math.max(0, 7 * m - 0.556 * fs).toFixed(2), lineHeight: 1, group: g, role: 'barcode-digits' });
    layers.push(txt(e.value[0], x, QL * m - m * 2, 'right'));
    layers.push(txt(e.value.slice(1, 7), bx + 3 * m, 42 * m, 'center'));
    layers.push(txt(e.value.slice(7), bx + 50 * m, 42 * m, 'center'));
    layers.forEach((l) => (l.id = R.uid()));
    return { layers, value: e.value, group: g };
  };
  // belgedeki barkod grubunu yeni numarayla yeniden çiz (yerinde)
  T.setBarcode = function (d, l, value) {
    const ls = d.layers.filter((x) => l.group && x.group === l.group);
    if (!ls.length) ls.push(l);
    const bg = ls.find((x) => x.role === 'barcode-bg');
    const dig = ls.find((x) => x.role === 'barcode-digits');
    const m = l.w / 95;
    const box = bg ? { x: bg.x, y: bg.y, w: bg.w, h: bg.h } : { x: l.x - 11 * m, y: l.y - 3 * m, w: 113 * m, h: l.h + 12 * m };
    const b = T.barcodeLayers(value, { ...box, color: R.toHex(l.fill || '#000'), bg: bg ? bg.fill : 'none', font: dig ? dig.fontFamily : 'Arial', group: l.group });
    const at = Math.min(...ls.map((x) => d.layers.indexOf(x)));
    d.layers = d.layers.filter((x) => !ls.includes(x));
    d.layers.splice(at, 0, ...b.layers);
    return b;
  };
  // barkodu sağ-alt köşesi sabit kalacak şekilde büyüt
  T.scaleBarcode = function (d, l, wpx) {
    const ls = d.layers.filter((x) => l.group && x.group === l.group);
    const bg = ls.find((x) => x.role === 'barcode-bg');
    const m = l.w / 95, box = bg ? { x: bg.x, y: bg.y, w: bg.w, h: bg.h } : { x: l.x - 11 * m, y: l.y - 3 * m, w: 113 * m, h: l.h + 12 * m };
    const k = wpx / box.w; if (k <= 1) return;
    const nb = { x: Math.max(0, box.x + box.w - box.w * k), y: Math.max(0, box.y + box.h - box.h * k), w: box.w * k, h: box.h * k };
    if (bg) Object.assign(bg, nb);
    l.w = 95 * (nb.w / 113); l.x = nb.x + 11 * (nb.w / 113); l.y = nb.y + 3 * (nb.w / 113);
    return T.setBarcode(d, l, l.barcode.value);
  };
  // tarayıcıda varsa yerleşik BarcodeDetector ile görselden okuma (Android/Mac Chrome)
  T.readBarcode = async function (src) {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'ean_8'] });
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = src; await img.decode();
      const r = await det.detect(img);
      return r && r[0] ? r[0].rawValue : null;
    } catch (e) { return null; }
  };

  // =========================================================
  // ETİKET KONTROL LİSTESİ (kural tabanlı)
  // =========================================================
  const ALLERGENS = ['gluten', 'buğday', 'arpa', 'çavdar', 'yulaf', 'süt', 'laktoz', 'yumurta', 'yer fıstığı', 'fıstık', 'fındık', 'badem', 'ceviz', 'kaju', 'antep', 'soya', 'susam', 'hardal', 'kereviz', 'balık', 'kabuklu', 'karides', 'yumuşakça', 'sülfit', 'kükürt dioksit', 'acı bakla',
    'wheat', 'barley', 'rye', 'oats', 'milk', 'lactose', 'egg', 'peanut', 'nuts', 'hazelnut', 'almond', 'walnut', 'cashew', 'pistachio', 'soy', 'soya', 'sesame', 'mustard', 'celery', 'fish', 'crustacean', 'mollusc', 'sulphite', 'sulfite', 'lupin',
    'weizen', 'gerste', 'roggen', 'hafer', 'milch', 'ei', 'erdnuss', 'haselnuss', 'mandel', 'walnuss', 'sesam', 'senf', 'sellerie', 'fisch', 'krebstiere', 'weichtiere', 'schwefeldioxid', 'sulfit', 'lupine'];
  const REQ = [
    ['name', 'Ürün adı', null],
    ['ingr', 'İçindekiler listesi', /i̇çindekiler|içindekiler|icindekiler|ingredients?|zutaten|ingrédients|bileşen/i],
    ['qty', 'Net miktar', /(\d+[.,]?\d*)\s*(g|gr|kg|mg|ml|cl|l|lt|adet)\b/i],
    ['date', 'Tavsiye edilen tüketim / son tüketim tarihi', /tett|t\.e\.t\.t|son tüketim|tavsiye edilen tüketim|best before|use by|bbe|mindestens haltbar|mhd|zu verbrauchen bis|à consommer/i],
    ['store', 'Saklama koşulları', /muhafaza|sakla|serin|kuru yer|store|keep|lagern|aufbewahren|conserver/i],
    ['maker', 'Üretici / ithalatçı adı ve adresi', /üretici|üreten|ithalatçı|ithalatci|dağıtıcı|produced by|manufacturer|importer|hersteller|importeur|vertrieb|san\.|tic\.|ltd|a\.ş|gmbh|adres|address|anschrift|mah\.|cad\.|sok\./i],
    ['lot', 'Parti / seri numarası', /parti|lot\b|seri no|batch|charge|chargen/i],
  ];
  const QTY_MIN_MM = (g) => (g <= 50 ? 2 : g <= 200 ? 3 : g <= 1000 ? 4 : 6);
  T.pxPerMM = (d) => (d.meta && d.meta.print && +d.meta.print.wmm > 0 ? d.width / +d.meta.print.wmm : 0);
  T.labelCheck = async function (d) {
    const out = [];
    const add = (level, title, detail, extra = {}) => out.push(Object.assign({ level, title, detail, src: 'kural' }, extra));
    const texts = d.layers.filter((l) => l.type === 'text' && l.visible !== false && !/^barcode/.test(l.role || ''));
    const all = texts.map((l) => String(l.text || '')).join('\n').toLocaleLowerCase('tr-TR');
    const hasPhotoText = d.layers.some((l) => l.type === 'image' && l.w * l.h > d.width * d.height * 0.3);
    const ppm = T.pxPerMM(d);
    // zorunlu bilgiler
    for (const [k, name, re] of REQ) {
      if (!re) continue;
      if (re.test(all)) add('ok', name + ' var', '');
      else add(hasPhotoText ? 'warn' : 'error', name + ' bulunamadı', hasPhotoText ? 'Düzenlenebilir metinlerde yok; fotoğrafın içinde olabilir — yapay zeka kontrolü görüntüyü de okur.' : 'Etikette bu bilgi zorunludur (ürüne göre muafiyet olabilir).');
    }
    if (d.layers.some((l) => l.barcode)) add('ok', 'Barkod var', 'Vektör EAN-13: ' + d.layers.find((l) => l.barcode).barcode.value);
    else if (d.layers.some((l) => l.role === 'barcode' || /barkod|barcode/i.test(l.name || ''))) add('warn', 'Barkod görsel olarak duruyor', 'Bulanık basılabilir. Görseli seçip “Vektör barkod” ile net çizgilere çevir.');
    // birim yazımı
    const gr = all.match(/\d\s*gr\b\.?/i);
    if (gr) add('warn', '“gr” yerine “g” yazılmalı', `“${gr[0].trim()}” → gram simgesi “g” dir.`, { find: gr[0], replace: gr[0].replace(/gr\.?/i, 'g') });
    // alerjen vurgusu
    const ingrL = texts.filter((l) => REQ[1][2].test(String(l.text).toLocaleLowerCase('tr-TR')) || ALLERGENS.some((a) => new RegExp('(^|[^\\p{L}])' + a + '([^\\p{L}]|$)', 'iu').test(l.text) && /[,;]/.test(l.text)));
    for (const l of ingrL) {
      if (l.uppercase) continue;
      const weak = ALLERGENS.filter((a) => { const m = String(l.text).match(new RegExp('(^|[^\\p{L}])(' + a + ')(?=[^\\p{L}]|$)', 'iu')); return m && m[2] !== m[2].toLocaleUpperCase('tr-TR'); });
      if (weak.length && +l.fontWeight < 700) add('warn', 'Alerjenler vurgulanmamış', `“${l.name}” içinde ${[...new Set(weak)].slice(0, 5).join(', ')} geçiyor. Alerjenler BÜYÜK harf ya da kalın yazılmalı.`, { layer: l.name, fixUpper: { id: l.id, words: [...new Set(weak)] } });
    }
    // fiziksel ölçüye bağlı kontroller
    if (!ppm) add('warn', 'Baskı ölçüsü girilmedi', 'Etiketin mm ölçüsünü girersen yazı ve barkod boyutları da kontrol edilir.', { askSize: true });
    else {
      const wmm = d.width / ppm, hmm = d.height / ppm;
      const area = (wmm * hmm) / 100; // cm²
      const minX = area < 80 ? 0.9 : 1.2;
      const small = texts.filter((l) => (l.fontSize * 0.52) / ppm < minX - 0.005 && String(l.text).trim().length > 2);
      if (small.length) add('error', `Yazı çok küçük (${small.length} katman)`, `En küçük harf yüksekliği (x-yüksekliği) ${minX} mm olmalı. Örn. “${small[0].name}”: ${((small[0].fontSize * 0.52) / ppm).toFixed(2)} mm.`, { fixMin: { ids: small.map((l) => l.id), fs: Math.ceil((minX * ppm) / 0.52) } });
      else add('ok', 'Yazı boyutları yeterli', `x-yüksekliği ≥ ${minX} mm`);
      const ql = texts.find((l) => REQ[2][2].test(l.text) && /net|e\b|\d\s*(g|kg|ml|l)\b/i.test(l.text));
      if (ql) {
        const m = ql.text.match(REQ[2][2]); let g = parseFloat(m[1].replace(',', '.')); const u = m[2].toLowerCase();
        if (u === 'kg' || u === 'l' || u === 'lt') g *= 1000; if (u === 'cl') g *= 10; if (u === 'mg') g /= 1000;
        const need = QTY_MIN_MM(g), have = (ql.fontSize * 0.72) / ppm;
        if (have + 0.05 < need) add('error', 'Net miktar rakamları küçük', `${m[0]} için rakam yüksekliği en az ${need} mm olmalı (şu an ${have.toFixed(1)} mm).`, { fixMin: { ids: [ql.id], fs: Math.ceil((need * ppm) / 0.72) } });
        else add('ok', 'Net miktar boyutu uygun', `${have.toFixed(1)} mm ≥ ${need} mm`);
      }
      const bc = d.layers.find((l) => l.barcode);
      if (bc) {
        const wbar = (bc.w / 95) * 113 / ppm; // tam barkod genişliği (sessiz bölgeler dahil)
        if (wbar < 29.8) add('error', 'Barkod çok küçük', `EAN-13 en az %80 büyütmede ~29,8 mm genişlik ister; şu an ${wbar.toFixed(1)} mm. Okuyucular okuyamayabilir.`, { fixBc: { id: bc.id, wpx: Math.ceil(30.5 * ppm) } });
        else add('ok', 'Barkod boyutu uygun', `${wbar.toFixed(1)} mm genişlik`);
        const c = T.rgbOf(bc.fill || '#000');
        if (c.r > 150 && c.g < 120) add('error', 'Barkod rengi okunmaz', 'Kırmızı tonlu çubukları tarayıcılar göremez; koyu (siyah/lacivert) kullan.');
      }
    }
    // kontrast / taşma
    try { (await T.autoFixAsync(d, { apply: false })).forEach((f) => add('warn', 'Düzen / okunurluk', f)); } catch (e) {}
    const order = { error: 0, warn: 1, ok: 2 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  };

  // =========================================================
  // AMBALAJ ÖNİZLEME (kavanoz, poşet, kutu)
  // =========================================================
  const rgbOf = (col) => { const h = R.parseColor(col).hex; return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) }; };
  T.rgbOf = rgbOf;
  const shade = (hex, f) => { const c = rgbOf(hex); const m = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); return `rgb(${m(c.r)},${m(c.g)},${m(c.b)})`; };
  function studio(ctx, W, H, bg, flat) {
    if (flat) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); return; }
    const g = ctx.createRadialGradient(W * 0.5, H * 0.38, W * 0.05, W * 0.5, H * 0.5, W * 0.75);
    g.addColorStop(0, shade(bg, 0.35)); g.addColorStop(1, shade(bg, -0.18));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function floorShadow(ctx, cx, y, rx, ry, a = 0.35) {
    const g = ctx.createRadialGradient(cx, y, 0, cx, y, rx);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(cx, y); ctx.scale(1, ry / rx); ctx.translate(-cx, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  T.mockup = function (kind, label, { bg = '#E9E4DC', W = 1600, H = 1200, lid = '#2A2A2E', product = '#7A2E2E', flat = false } = {}) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    studio(ctx, W, H, bg, flat);
    const la = label.width / label.height;
    if (kind === 'jar') {
      // kavanoz gövdesi
      const r = W * 0.2, jh = H * 0.62, cx = W / 2, top = H * 0.24, bot = top + jh, e = r * 0.16;
      floorShadow(ctx, cx, bot + e * 0.4, r * 1.35, e * 1.4, 0.4);
      // cam + ürün
      ctx.save(); rrect(ctx, cx - r, top, 2 * r, jh, r * 0.22); ctx.clip();
      const pg = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      pg.addColorStop(0, shade(product, -0.45)); pg.addColorStop(0.35, shade(product, 0.05)); pg.addColorStop(0.7, product); pg.addColorStop(1, shade(product, -0.55));
      ctx.fillStyle = pg; ctx.fillRect(cx - r, top, 2 * r, jh);
      // ürün dokusu
      for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; ctx.fillRect(cx - r + Math.random() * 2 * r, top + Math.random() * jh, 2 + Math.random() * 3, 2 + Math.random() * 3); }
      ctx.restore();
      // etiket: silindir sarma
      const theta = 1.05; // görünen yarı açı
      const lw = 2 * r * Math.sin(theta);
      let lh = (lw / la) * (theta * 2 / (2 * Math.sin(theta))); // yay uzunluğu düzeltmesi
      lh = Math.min(lh, jh * 0.72);
      const ly = top + (jh - lh) * 0.55;
      const N = Math.ceil(lw);
      for (let i = 0; i < N; i++) {
        const dx = -lw / 2 + i;
        const phi = Math.asin(Math.max(-1, Math.min(1, dx / r)));
        const u = (phi + theta) / (2 * theta);
        const sx = Math.max(0, Math.min(label.width - 1, u * label.width));
        const sw = Math.max(1, label.width / (2 * theta) * (1 / Math.max(0.15, Math.cos(phi))) / r);
        const curve = e * Math.cos(phi);
        ctx.drawImage(label, sx, 0, Math.min(sw, label.width - sx), label.height, cx + dx, ly + curve - e, 1.6, lh);
      }
      // gölgelendirme
      ctx.save(); rrect(ctx, cx - r, top, 2 * r, jh, r * 0.22); ctx.clip();
      const sg = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
      sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(0.18, 'rgba(0,0,0,.12)'); sg.addColorStop(0.32, 'rgba(255,255,255,.22)'); sg.addColorStop(0.38, 'rgba(255,255,255,.04)'); sg.addColorStop(0.75, 'rgba(0,0,0,.08)'); sg.addColorStop(1, 'rgba(0,0,0,.6)');
      ctx.fillStyle = sg; ctx.fillRect(cx - r, top, 2 * r, jh);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(cx - r * 0.62, top + jh * 0.04, r * 0.06, jh * 0.9);
      ctx.restore();
      // kapak
      const lt = top - H * 0.085, lhh = H * 0.11;
      const lg = ctx.createLinearGradient(cx - r * 1.02, 0, cx + r * 1.02, 0);
      lg.addColorStop(0, shade(lid, -0.5)); lg.addColorStop(0.3, shade(lid, 0.35)); lg.addColorStop(0.55, lid); lg.addColorStop(1, shade(lid, -0.6));
      ctx.fillStyle = lg; rrect(ctx, cx - r * 1.02, lt, r * 2.04, lhh, r * 0.08); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2;
      for (let i = 1; i < 14; i++) { ctx.beginPath(); ctx.moveTo(cx - r * 1.02, lt + (lhh * i) / 14); ctx.lineTo(cx + r * 1.02, lt + (lhh * i) / 14); ctx.stroke(); }
      ctx.fillStyle = shade(lid, 0.2); ctx.beginPath(); ctx.ellipse(cx, lt, r * 1.02, e * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'pouch') {
      const pw = W * 0.4, ph = H * 0.8, x = (W - pw) / 2, y = H * 0.08;
      floorShadow(ctx, W / 2, y + ph, pw * 0.62, H * 0.04, 0.45);
      const path = () => { ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + pw - 6, y); ctx.quadraticCurveTo(x + pw + 4, y + ph * 0.5, x + pw - 10, y + ph * 0.97); ctx.quadraticCurveTo(x + pw / 2, y + ph * 1.02, x + 10, y + ph * 0.97); ctx.quadraticCurveTo(x - 4, y + ph * 0.5, x + 6, y); ctx.closePath(); };
      ctx.save(); path(); ctx.clip();
      // etiketi poşet yüzeyine kapla (oranı koru, kırpılmadan sığdır)
      let dw = pw, dh = pw / la;
      if (dh < ph * 0.84) { ctx.fillStyle = (() => { const t = document.createElement('canvas'); t.width = t.height = 1; const k = t.getContext('2d'); k.drawImage(label, 2, 2, 1, 1, 0, 0, 1, 1); const d = k.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; })(); ctx.fillRect(x - 10, y, pw + 20, ph * 1.05); }
      else { dh = ph * 0.84; dw = dh * la; }
      ctx.drawImage(label, W / 2 - dw / 2, y + ph * 0.13 + (ph * 0.84 - dh) / 2, dw, dh);
      // kenar gölgeleri ve parlaklık
      const sg = ctx.createLinearGradient(x, 0, x + pw, 0);
      sg.addColorStop(0, 'rgba(0,0,0,.42)'); sg.addColorStop(0.1, 'rgba(0,0,0,.05)'); sg.addColorStop(0.28, 'rgba(255,255,255,.18)'); sg.addColorStop(0.42, 'rgba(255,255,255,0)'); sg.addColorStop(0.86, 'rgba(0,0,0,.06)'); sg.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = sg; ctx.fillRect(x - 10, y, pw + 20, ph * 1.05);
      const vg = ctx.createLinearGradient(0, y, 0, y + ph);
      vg.addColorStop(0, 'rgba(0,0,0,.25)'); vg.addColorStop(0.1, 'rgba(0,0,0,0)'); vg.addColorStop(0.88, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
      ctx.fillStyle = vg; ctx.fillRect(x - 10, y, pw + 20, ph * 1.05);
      // kilit fermuar ve kaynak bandı
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, pw, ph * 0.045);
      ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 4, y + ph * 0.085); ctx.lineTo(x + pw - 4, y + ph * 0.085); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + ph * 0.09); ctx.lineTo(x + pw - 4, y + ph * 0.09); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.ellipse(x + pw * 0.3, y + ph * 0.5, pw * 0.06, ph * 0.38, 0.04, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; path(); ctx.stroke();
      // yırtma çentiği
      ctx.fillStyle = shade(bg, 0.2); ctx.beginPath(); ctx.moveTo(x + 2, y + ph * 0.06); ctx.lineTo(x + 16, y + ph * 0.066); ctx.lineTo(x + 2, y + ph * 0.072); ctx.fill();
    } else {
      // kutu: ön yüz = etiket, yan ve üst yüz perspektifli
      const fh = H * 0.56, fw = Math.min(W * 0.5, fh * la), fx = W * 0.32 - fw / 2 + W * 0.08, fy = H * 0.3;
      const depth = Math.min(fw, fh) * 0.42, dx = depth * 0.8, dy = -depth * 0.45;
      floorShadow(ctx, fx + fw / 2 + dx / 2, fy + fh + 6, (fw + dx) * 0.68, H * 0.045, 0.45);
      // ön
      ctx.drawImage(label, fx, fy, fw, fh);
      const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
      fg.addColorStop(0, 'rgba(255,255,255,.12)'); fg.addColorStop(1, 'rgba(0,0,0,.12)');
      ctx.fillStyle = fg; ctx.fillRect(fx, fy, fw, fh);
      // yan yüz: etiketin sağ kenar şeridi + karartma
      ctx.save(); ctx.setTransform(dx / (label.width * 0.12), dy / (label.width * 0.12), 0, fh / label.height, fx + fw, fy);
      ctx.drawImage(label, label.width * 0.88, 0, label.width * 0.12, label.height, 0, 0, label.width * 0.12, label.height);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.moveTo(fx + fw, fy); ctx.lineTo(fx + fw + dx, fy + dy); ctx.lineTo(fx + fw + dx, fy + fh + dy); ctx.lineTo(fx + fw, fy + fh); ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fill(); ctx.restore();
      // üst yüz: üst kenar şeridi + aydınlatma
      ctx.save(); ctx.setTransform(fw / label.width, 0, dx / (label.height * 0.12), dy / (label.height * 0.12), fx, fy);
      ctx.drawImage(label, 0, 0, label.width, label.height * 0.12, 0, 0, label.width, label.height * 0.12);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + dx, fy + dy); ctx.lineTo(fx + fw + dx, fy + dy); ctx.lineTo(fx + fw, fy); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx + fw, fy); ctx.lineTo(fx + fw, fy + fh); ctx.stroke();
    }
    return c;
  };

  window.Tools = T;
})();
