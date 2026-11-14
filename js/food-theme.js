/* Tasarım Stüdyosu v5.6 — şablon temaları ve ürün kategorileri.
   - SPR: ürünün çevresine serpiştirilen gölgeli, degradeli süs görselleri (kahve çekirdeği, fesleğen, limon dilimi…)
   - CATS: her ürün türü için yazılar, süs öğeleri, palet ve arka plan kelimesi
   - classifyText / guessImage: yüklenen ürünün ne olduğunu tahmin eder (yapay zekâ bağlı değilken) */
(function () {
  'use strict';
  const enc = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const svg = (body, defs = '', vb = '0 0 100 100') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="400" height="400"><defs>${defs}</defs>${body}</svg>`;
  const rg = (id, stops, cx = '35%', cy = '30%', r = '75%') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const shine = (cx, cy, rx, ry, op = 0.55, rot = -30) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})" filter="url(#sb)"/>`;
  const SB = '<filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>';
  const LEAFP = 'M50 4C70 18 84 40 80 64C76 84 60 96 50 97C40 96 24 84 20 64C16 40 30 18 50 4Z';

  const SPR = {
    bean: () => svg(`<g transform="rotate(-25 50 50)"><ellipse cx="50" cy="50" rx="27" ry="36" fill="url(#g)"/><path d="M50 16C40 32 60 46 48 60C40 70 46 80 50 86" fill="none" stroke="#1E0F07" stroke-width="5" stroke-linecap="round"/><path d="M50 16C40 32 60 46 48 60" fill="none" stroke="#9A6440" stroke-width="1.4" opacity=".6" transform="translate(3 0)"/>${shine(38, 34, 7, 13, 0.4, -10)}</g>`, rg('g', [[0, '#9C6236'], [0.55, '#5C3219'], [1, '#2A140A']]) + SB),
    leaf: (c = '#3E9B2E') => svg(`<path d="${LEAFP}" fill="url(#g)"/><path d="M50 8V94" stroke="#CFE9A8" stroke-width="1.8" opacity=".75"/>${[22, 36, 50, 64].map((y) => `<path d="M50 ${y + 6}Q${36} ${y} ${30} ${y - 6}M50 ${y + 6}Q${64} ${y} ${70} ${y - 6}" fill="none" stroke="#CFE9A8" stroke-width="1.1" opacity=".5"/>`).join('')}${shine(38, 36, 6, 18, 0.35, 15)}`, rg('g', [[0, '#8BD45A'], [0.6, c], [1, '#1D5A16']], '40%', '30%', '80%') + SB),
    mint: () => svg(`<path d="M50 6L58 14L66 12L70 22L78 24L78 34L86 40L82 50L86 60L78 68L76 78L66 82L58 92L50 96L42 92L34 82L24 78L22 68L14 60L18 50L14 40L22 34L22 24L30 22L34 12L42 14Z" fill="url(#g)"/><path d="M50 10V92" stroke="#D9F5C2" stroke-width="1.6" opacity=".7"/>${[26, 42, 58].map((y) => `<path d="M50 ${y + 8}L30 ${y}M50 ${y + 8}L70 ${y}" stroke="#D9F5C2" stroke-width="1" opacity=".5"/>`).join('')}${shine(38, 38, 6, 16, 0.3, 15)}`, rg('g', [[0, '#9BE27A'], [0.6, '#43B04A'], [1, '#1E6B27']]) + SB),
    oliveleaf: () => svg(`<path d="M50 2C60 30 60 70 50 98C40 70 40 30 50 2Z" fill="url(#g)"/><path d="M50 6V94" stroke="#E4EBD2" stroke-width="1.2" opacity=".7"/>`, lg('g', [[0, '#9AAE7C'], [0.5, '#5E7A44'], [1, '#3B5228']], 1, 0)),
    olive: (c = 'g') => svg(`<ellipse cx="50" cy="52" rx="26" ry="34" fill="url(#g)" transform="rotate(20 50 52)"/>${shine(40, 36, 6, 12, 0.6, 20)}`, rg('g', c === 'k' ? [[0, '#5A4A5E'], [0.6, '#241A26'], [1, '#0E0A0F']] : [[0, '#B9C95A'], [0.6, '#6E8A22'], [1, '#3A4C10']]) + SB),
    tomato: () => svg(`<circle cx="50" cy="50" r="44" fill="url(#s)"/><circle cx="50" cy="50" r="38" fill="url(#f)"/>${[0, 72, 144, 216, 288].map((a) => `<g transform="rotate(${a} 50 50)"><path d="M50 50L42 22Q50 16 58 22Z" fill="#F7B0A0" opacity=".55"/><ellipse cx="50" cy="31" rx="7" ry="10" fill="#E2412E"/>${[0, 1, 2].map((k) => `<ellipse cx="${46 + k * 4}" cy="${30 + (k % 2) * 4}" rx="1.6" ry="2.6" fill="#F6E38A"/>`).join('')}</g>`).join('')}<circle cx="50" cy="50" r="7" fill="#F49A86"/>${shine(32, 30, 8, 14, 0.4)}`, rg('s', [[0, '#F0412B'], [1, '#A5180D']]) + rg('f', [[0, '#FF7A62'], [1, '#E2321F']], '50%', '50%', '60%') + SB),
    lemon: (c = 'y') => { const k = c === 'o' ? ['#FFB13B', '#F07D12', '#FFD9A0', '#FFE7C2'] : c === 'l' ? ['#B8E05A', '#6FA51E', '#E8F6B5', '#F1FAD0'] : ['#FFE45C', '#E9B800', '#FFF3B0', '#FFF8D6']; return svg(`<circle cx="50" cy="50" r="46" fill="url(#r)"/><circle cx="50" cy="50" r="40" fill="${k[3]}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M50 50L${50 + 36 * Math.cos((i / 9) * 6.283 + 0.12)} ${50 + 36 * Math.sin((i / 9) * 6.283 + 0.12)}A36 36 0 0 1 ${50 + 36 * Math.cos(((i + 1) / 9) * 6.283 - 0.12)} ${50 + 36 * Math.sin(((i + 1) / 9) * 6.283 - 0.12)}Z" fill="url(#f)" transform="scale(.94) translate(3.2 3.2)"/>`).join('')}<circle cx="50" cy="50" r="4" fill="${k[3]}"/>${shine(30, 28, 8, 16, 0.5)}`, rg('r', [[0, k[0]], [1, k[1]]]) + rg('f', [[0, k[2]], [0.7, k[0]], [1, k[1]]], '50%', '50%', '55%') + SB); },
    cucumber: () => svg(`<circle cx="50" cy="50" r="45" fill="#2F6B1E"/><circle cx="50" cy="50" r="40" fill="url(#f)"/>${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${50 + 13 * Math.cos(i * 0.785)}" cy="${50 + 13 * Math.sin(i * 0.785)}" rx="2" ry="4" fill="#F4F8D8" transform="rotate(${i * 45 + 90} ${50 + 13 * Math.cos(i * 0.785)} ${50 + 13 * Math.sin(i * 0.785)})"/>`).join('')}${shine(30, 28, 7, 13, 0.4)}`, rg('f', [[0, '#E9F5C8'], [0.6, '#BFDE8A'], [1, '#86B84E']], '50%', '50%', '60%') + SB),
    strawberry: () => svg(`<path d="M50 94C30 84 12 60 16 40C20 24 36 20 50 26C64 20 80 24 84 40C88 60 70 84 50 94Z" fill="url(#g)"/>${Array.from({ length: 22 }, (_, i) => { const x = 26 + ((i * 37) % 48), y = 36 + ((i * 23) % 46); return `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.2" fill="#FFE27A" opacity=".9"/>`; }).join('')}<path d="M50 28L34 14L44 22L40 8L50 20L58 6L56 22L68 14L58 28Z" fill="#3E9B2E"/>${shine(34, 44, 7, 14, 0.45, 20)}`, rg('g', [[0, '#FF5A5F'], [0.6, '#D7192B'], [1, '#8A0A16']]) + SB),
    raspberry: () => svg(`${Array.from({ length: 19 }, (_, i) => { const a = i * 2.4, r = 6 + (i % 4) * 7; return `<circle cx="${50 + r * Math.cos(a)}" cy="${54 + r * Math.sin(a) * 1.1}" r="9" fill="url(#g)"/>`; }).join('')}`, rg('g', [[0, '#FF8FA8'], [0.55, '#D81B4B'], [1, '#7A0A26']], '35%', '30%', '70%')),
    blueberry: () => svg(`<circle cx="50" cy="52" r="40" fill="url(#g)"/><path d="M50 24l4 6 7-2-3 7 6 4-7 1-1 7-6-4-6 4-1-7-7-1 6-4-3-7 7 2z" fill="#2B1E44" opacity=".8"/>${shine(36, 40, 8, 14, 0.35)}`, rg('g', [[0, '#8A93D8'], [0.5, '#4B4A9E'], [1, '#1E1B4A']]) + SB),
    cherry: () => svg(`<path d="M50 52C52 30 60 14 76 6" fill="none" stroke="#5B7A1E" stroke-width="3.5" stroke-linecap="round"/><circle cx="46" cy="66" r="28" fill="url(#g)"/>${shine(36, 56, 6, 11, 0.6)}`, rg('g', [[0, '#FF5A5F'], [0.6, '#B3001B'], [1, '#55000C']]) + SB),
    choco: () => svg(`<path d="M18 30L56 14L86 40L74 82L30 86L12 58Z" fill="url(#g)"/><path d="M18 30L56 14L86 40L50 46Z" fill="#8A5634" opacity=".7"/><path d="M50 46L86 40L74 82Z" fill="#2E170A" opacity=".55"/>`, lg('g', [[0, '#7A4524'], [1, '#2E160A']], 1, 1)),
    hazelnut: () => svg(`<ellipse cx="50" cy="58" rx="32" ry="34" fill="url(#g)"/><path d="M20 42C28 22 72 22 80 42C66 34 34 34 20 42Z" fill="#6E4A2A"/>${shine(36, 52, 6, 13, 0.4)}`, rg('g', [[0, '#C98A50'], [0.6, '#8A5228'], [1, '#4A2A12']]) + SB),
    sesame: () => svg(`<path d="M50 10C64 30 66 70 50 90C34 70 36 30 50 10Z" fill="url(#g)"/>`, rg('g', [[0, '#FFF6DE'], [0.7, '#EBD5A2'], [1, '#B79A5E']])),
    wheat: () => svg(`<path d="M50 98V30" stroke="#C9963F" stroke-width="2.5"/>${Array.from({ length: 6 }, (_, i) => `<ellipse cx="42" cy="${30 + i * 10}" rx="6" ry="11" fill="url(#g)" transform="rotate(-28 42 ${30 + i * 10})"/><ellipse cx="58" cy="${30 + i * 10}" rx="6" ry="11" fill="url(#g)" transform="rotate(28 58 ${30 + i * 10})"/>`).join('')}<ellipse cx="50" cy="18" rx="6" ry="12" fill="url(#g)"/>`, rg('g', [[0, '#FBE1A2'], [0.6, '#E0AE52'], [1, '#A8741F']])),
    chili: () => svg(`<path d="M30 20C26 50 40 80 78 92C60 74 52 50 48 22Z" fill="url(#g)"/><path d="M26 22C30 12 46 10 50 20C44 18 34 18 26 22Z" fill="#3E8A1E"/><path d="M38 14C36 8 38 4 44 2" stroke="#3E8A1E" stroke-width="4" fill="none" stroke-linecap="round"/>${shine(40, 44, 3, 14, 0.5, -20)}`, lg('g', [[0, '#FF4A2A'], [1, '#A10F06']], 1, 1) + SB),
    onion: () => svg(`<circle cx="50" cy="50" r="40" fill="none" stroke="url(#g)" stroke-width="9"/><circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="1.4" opacity=".5"/><circle cx="50" cy="50" r="31" fill="none" stroke="#F2E2F2" stroke-width="2" opacity=".6"/>`, lg('g', [[0, '#C467B4'], [1, '#7B2370']], 1, 1)),
    honeycomb: () => { let o = ''; [[30, 30], [56, 30], [43, 52], [69, 52], [30, 74], [56, 74]].forEach(([x, y]) => { o += `<path d="M${x} ${y - 13}L${x + 11} ${y - 6.5}V${y + 6.5}L${x} ${y + 13}L${x - 11} ${y + 6.5}V${y - 6.5}Z" fill="url(#g)" stroke="#9A5A06" stroke-width="2"/>`; }); return svg(o + shine(36, 32, 4, 10, 0.5), rg('g', [[0, '#FFD66B'], [0.6, '#F2A516'], [1, '#B86A00']], '35%', '30%', '80%') + SB); },
    drop: (c = 'h') => { const k = c === 'o' ? ['#E8D36A', '#B79A1A'] : c === 'w' ? ['#DDF4FF', '#7CC4EA'] : c === 'm' ? ['#FFFFFF', '#E8E2D6'] : c === 'c' ? ['#8A5228', '#3A1E0C'] : ['#FFD25A', '#D88A00']; return svg(`<path d="M50 6C62 30 80 48 80 66A30 30 0 0 1 20 66C20 48 38 30 50 6Z" fill="url(#g)"/>${shine(40, 62, 5, 12, 0.7, 10)}`, rg('g', [[0, k[0]], [1, k[1]]], '40%', '55%', '70%') + SB); },
    ice: () => svg(`<rect x="14" y="14" width="72" height="72" rx="14" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><path d="M24 28H60" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M24 40V60" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>`, lg('g', [[0, '#EAF8FF', 0.95], [1, '#9ED6F2', 0.75]], 1, 1)),
    bubble: () => svg(`<circle cx="50" cy="50" r="44" fill="url(#g)" stroke="#fff" stroke-opacity=".75" stroke-width="2"/><path d="M26 34A28 28 0 0 1 46 20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`, rg('g', [[0, '#ffffff', 0.05], [0.8, '#BFE8FF', 0.18], [1, '#ffffff', 0.5]], '50%', '50%', '50%')),
    sparkle: (c = '#FFFFFF') => svg(`<path d="M50 4C53 38 62 47 96 50C62 53 53 62 50 96C47 62 38 53 4 50C38 47 47 38 50 4Z" fill="${c}" filter="url(#gl)"/>`, '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'),
    petal: (c = 'p') => svg(`<path d="M50 6C72 22 80 52 66 80C60 92 40 92 34 80C20 52 28 22 50 6Z" fill="url(#g)"/>${shine(42, 34, 5, 14, 0.4, 10)}`, rg('g', c === 'w' ? [[0, '#FFFFFF'], [1, '#F2D9E0']] : [[0, '#FFD1DC'], [0.6, '#F58BA8'], [1, '#C2416A']], '40%', '30%', '80%') + SB),
    star: (c = '#FFC93C') => svg(`<path d="M50 6L62 36L94 38L69 58L78 92L50 74L22 92L31 58L6 38L38 36Z" fill="${c}"/>`),
    sprinkle: (c = '#FF6B9A') => svg(`<rect x="38" y="10" width="24" height="80" rx="12" fill="${c}" transform="rotate(35 50 50)"/><rect x="44" y="16" width="5" height="40" rx="3" fill="#fff" opacity=".45" transform="rotate(35 50 50)"/>`),
    confetti: (c = '#FF6B6B') => svg(`<rect x="22" y="34" width="56" height="32" rx="4" fill="${c}" transform="rotate(-20 50 50)"/>`),
    ring: (c = '#7AE7FF') => svg(`<circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="5" filter="url(#gl)"/>`, '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'),
    pepper: () => svg(`<circle cx="50" cy="50" r="38" fill="url(#g)"/>${shine(40, 38, 6, 10, 0.4)}`, rg('g', [[0, '#5A4636'], [1, '#160F0A']]) + SB),
    cinnamon: () => svg(`<g transform="rotate(-30 50 50)"><rect x="14" y="38" width="72" height="24" rx="4" fill="url(#g)"/><ellipse cx="86" cy="50" rx="5" ry="12" fill="#7A3E18"/><path d="M86 42a6 8 0 1 0 0 16a4 5 0 1 1 0-10" fill="none" stroke="#C47A44" stroke-width="2"/></g>`, lg('g', [[0, '#C47A44'], [0.5, '#9A5226'], [1, '#5E2E10']])),
    rosemary: () => svg(`<path d="M50 96V6" stroke="#5B6E3A" stroke-width="2"/>${Array.from({ length: 14 }, (_, i) => `<path d="M50 ${10 + i * 6}l${i % 2 ? 16 : -16} -6" stroke="#3F6A3A" stroke-width="4" stroke-linecap="round"/>`).join('')}`),
    flower: () => svg(`${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="28" rx="14" ry="22" fill="url(#g)" transform="rotate(${a} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="10" fill="#FFC93C"/>`, rg('g', [[0, '#FFFFFF'], [1, '#F7C9D6']], '50%', '20%', '90%')),
    gem: (c = '#8FE3FF') => svg(`<path d="M20 38L36 18H64L80 38L50 86Z" fill="${c}"/><path d="M20 38H80L50 86Z" fill="#000" opacity=".12"/><path d="M36 18L44 38L50 18L56 38L64 18" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M20 38L50 86L44 38M56 38L50 86L80 38" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>`),
    leafy: () => svg(`<path d="M10 90C20 40 50 14 92 8C86 50 60 84 10 90Z" fill="url(#g)"/><path d="M14 86C40 60 60 36 88 12" stroke="#DDF0C4" stroke-width="1.6" fill="none" opacity=".7"/>`, rg('g', [[0, '#9BD46A'], [0.6, '#4C9A2E'], [1, '#235A16']])),
    steam: () => svg(`<path d="M40 96C20 76 60 64 40 44C24 28 50 16 44 4M62 96C46 78 80 66 62 46C50 32 70 22 64 10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7" filter="url(#b)"/>`, '<filter id="b"><feGaussianBlur stdDeviation="2.2"/></filter>'),
  };
  const sprUrl = {};
  function sprite(key, variant) {
    const k = key + ':' + (variant || '');
    if (!sprUrl[k]) { const f = SPR[key]; if (!f) return null; sprUrl[k] = enc(variant != null ? f(variant) : f()); }
    return sprUrl[k];
  }

  // ---------------------------------------------------------------- arka plan dokuları (tam boy görsel)
  function texture(kind, W, H, c1, c2, seed = 3) {
    const m = Math.max(W, H);
    let body = '';
    if (kind === 'grain') body = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${(700 / m).toFixed(3)}" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .9 -.32"/></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`;
    else if (kind === 'paper') body = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${(260 / m).toFixed(3)}" numOctaves="5" seed="${seed}"/><feDiffuseLighting lighting-color="#fff" surfaceScale="1.6"><feDistantLight azimuth="45" elevation="58"/></feDiffuseLighting><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".55"/></feComponentTransfer></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`;
    else if (kind === 'wood') body = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${(3 / m).toFixed(4)} ${(90 / m).toFixed(3)}" numOctaves="4" seed="${seed}"/><feColorMatrix values="0 0 0 0 .22  0 0 0 0 .13  0 0 0 0 .06  0 0 0 1.4 -.45"/></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`;
    else if (kind === 'marble') body = `<filter id="n"><feTurbulence type="turbulence" baseFrequency="${(2.4 / m).toFixed(4)} ${(5 / m).toFixed(4)}" numOctaves="5" seed="${seed}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues="1 1"/><feFuncG type="table" tableValues="1 1"/><feFuncB type="table" tableValues="1 1"/><feFuncA type="table" tableValues="0 0 .05 .35 0 0"/></feComponentTransfer></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`;
    else if (kind === 'rays') { const n = 28, R2 = Math.hypot(W, H); let o = ''; for (let i = 0; i < n; i += 2) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2; o += `M${W / 2} ${H * 0.45}L${W / 2 + R2 * Math.cos(a)} ${H * 0.45 + R2 * Math.sin(a)}L${W / 2 + R2 * Math.cos(b)} ${H * 0.45 + R2 * Math.sin(b)}Z`; } body = `<radialGradient id="f" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient><path d="${o}" fill="url(#f)"/>`; }
    else if (kind === 'halftone') { const s = m / 46; let o = ''; for (let y = 0; y < H + s; y += s) for (let x = 0; x < W + s; x += s) { const t = Math.max(0, 1 - Math.hypot(x / W, (H - y) / H) * 1.25); if (t > 0.02) o += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(s * 0.46 * t).toFixed(1)}"/>`; } body = `<g fill="${c1}">${o}</g>`; }
    else if (kind === 'glow') body = `<radialGradient id="f" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c1}" stop-opacity=".9"/><stop offset=".45" stop-color="${c1}" stop-opacity=".35"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient><rect width="${W}" height="${H}" fill="url(#f)"/>`;
    else if (kind === 'bokeh') { let o = '', s = seed * 9301; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 22; i++) o += `<circle cx="${(W * r()).toFixed(0)}" cy="${(H * r()).toFixed(0)}" r="${(m * (0.015 + r() * 0.05)).toFixed(0)}" fill="${c1}" opacity="${(0.08 + r() * 0.22).toFixed(2)}"/>`; body = `<filter id="b"><feGaussianBlur stdDeviation="${(m / 220).toFixed(1)}"/></filter><g filter="url(#b)">${o}</g>`; }
    else if (kind === 'stripes') { const s = m / 22; let o = ''; for (let x = -H; x < W + H; x += s * 2) o += `M${x} 0l${H} ${H}h${s}l${-H} ${-H}z`; body = `<path d="${o}" fill="${c1}"/>`; }
    else if (kind === 'vignette') body = `<radialGradient id="f" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient><rect width="${W}" height="${H}" fill="url(#f)"/>`;
    else if (kind === 'splash') { body = `<path d="M${W * 0.5} ${H * 0.08}C${W * 0.8} ${H * 0.02} ${W * 0.98} ${H * 0.3} ${W * 0.9} ${H * 0.55}C${W * 0.97} ${H * 0.62} ${W * 0.95} ${H * 0.72} ${W * 0.88} ${H * 0.7}C${W * 0.8} ${H * 0.95} ${W * 0.3} ${H * 1.0} ${W * 0.14} ${H * 0.78}C${W * 0.06} ${H * 0.8} ${W * 0.02} ${H * 0.7} ${W * 0.1} ${H * 0.64}C${W * -0.02} ${H * 0.4} ${W * 0.2} ${H * 0.12} ${W * 0.5} ${H * 0.08}Z" fill="${c1}"/><circle cx="${W * 0.94}" cy="${H * 0.8}" r="${m * 0.025}" fill="${c1}"/><circle cx="${W * 0.06}" cy="${H * 0.2}" r="${m * 0.02}" fill="${c1}"/><circle cx="${W * 0.86}" cy="${H * 0.12}" r="${m * 0.012}" fill="${c1}"/>`; }
    else if (kind === 'brush') { const y = H / 2, h = H * 0.34; let top = '', bot = ''; for (let i = 0; i <= 24; i++) { const x = (W * i) / 24; top += `${i ? 'L' : 'M'}${x.toFixed(0)} ${(y - h + Math.sin(i * 2.7 + seed) * h * 0.12 + (i % 3) * h * 0.05).toFixed(0)}`; } for (let i = 24; i >= 0; i--) { const x = (W * i) / 24; bot += `L${x.toFixed(0)} ${(y + h + Math.cos(i * 1.9 + seed) * h * 0.14 - (i % 4) * h * 0.04).toFixed(0)}`; } body = `<filter id="r"><feTurbulence type="fractalNoise" baseFrequency=".04 .5" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${(H * 0.18).toFixed(0)}"/></filter><path d="${top}${bot}Z" fill="${c1}" filter="url(#r)"/>`; }
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs></defs>${body}</svg>`);
  }

  // ---------------------------------------------------------------- ürün kategorileri
  // t: [üst etiket], h: [başlık], s: [alt yazı], sc: [el yazısı], b: [buton], f: [[özellik ×3]], it: menü satırları, g: arka plan kelimesi, m: süsler, p: palet önerisi, k: anahtar kelimeler
  const C = (label, o) => Object.assign({ label }, o);
  const CATS = {
    burger: C('Burger', { art: 'burger', g: 'BURGER', m: [['tomato'], ['leaf'], ['sesame'], ['onion'], ['chili']], p: ['sokak', 'domates', 'gece'], k: 'burger hamburger cheeseburger köfte ekmek smash',
      t: ['Yeni menü', 'Haftanın burgeri', 'Online sipariş'], h: ['Duble Cheeseburger', 'Smash Burger', 'Burgerler Kapında'], s: ['Odun ateşinde 180 g dana köfte, cheddar, karamelize soğan', 'Çıtır kenarlı köfte, özel sos, turşu', 'İlk siparişe %20 indirim'], sc: ['sokak lezzeti', 'ateşten', 'taptaze'], b: ['Hemen sipariş ver', 'Sipariş ver'], f: [['180 g köfte', 'Cheddar', 'Patates hediye']],
      it: [['Klasik burger', '₺210', 'Dana köfte, marul, domates'], ['Cheeseburger', '₺230', 'Cheddar, turşu, özel sos'], ['Tavuk burger', '₺190', 'Çıtır tavuk, coleslaw'], ['Patates', '₺70', 'Elma dilim, baharatlı']] }),
    pizza: C('Pizza', { art: 'pizza', g: 'PIZZA', m: [['leaf'], ['tomato'], ['olive', 'k'], ['chili'], ['pepper']], p: ['domates', 'krem', 'sokak'], k: 'pizza margherita karışık pide lahmacun',
      t: ['Taş fırından', 'Paket serviste', 'Yeni lezzet'], h: ['Napoli Pizza', 'Bol Malzemeli Pizza', 'Pizza Akşamı'], s: ['Elle açılmış hamur, San Marzano domates, taze mozzarella', 'Sucuk, mantar, biber, zeytin, bol kaşar', 'İkinci pizza yarı fiyatına'], sc: ['taş fırından', 'sıcak sıcak', 'İtalyan usulü'], b: ['Sipariş ver', 'Hemen dene'], f: [['32 cm', 'İnce hamur', 'Taş fırın']],
      it: [['Margherita', '₺220', 'Domates, mozzarella, fesleğen'], ['Karışık', '₺260', 'Sucuk, mantar, biber'], ['Dört peynirli', '₺270', 'Mozzarella, gorgonzola, parmesan'], ['Vejetaryen', '₺240', 'Mevsim sebzeleri']] }),
    kahve: C('Kahve', { art: 'coffee', g: 'COFFEE', m: [['bean'], ['bean'], ['cinnamon'], ['steam']], p: ['kahve', 'krem', 'gece'], k: 'kahve coffee latte espresso cappuccino americano mocha türk kahvesi filtre kupa fincan bardak çekirdek',
      t: ['Günün kahvesi', 'Kahve molası', 'Özel harman'], h: ['Flat White', 'Sabahın İlk Fincanı', 'Taze Kavrulmuş Kahve'], s: ['Çift shot espresso, ipeksi süt köpüğü', 'Taze kavrulmuş çekirdek, özenle demlendi', 'Yasemin ve bergamot notaları'], sc: ['taze demlendi', 'kahve molası', 'günaydın'], b: ['Hemen dene', 'Sipariş ver'], f: [['%100 Arabica', 'Taze kavrum', '250 g']],
      it: [['Espresso', '₺60'], ['Americano', '₺75'], ['Latte', '₺90'], ['Cappuccino', '₺90'], ['Türk kahvesi', '₺55']] }),
    tatli: C('Tatlı', { art: 'cake', g: 'TATLI', m: [['raspberry'], ['blueberry'], ['strawberry'], ['mint'], ['sparkle', '#FFFFFF']], p: ['pembe', 'krem', 'bordo'], k: 'pasta kek tatlı cheesecake tiramisu brownie kurabiye muffin cupcake baklava sütlaç profiterol waffle',
      t: ['Yeni tatlı', 'Şefin önerisi', 'Pastaneden'], h: ['Frambuazlı Cheesecake', 'Günün Tatlısı', 'Tatlı Bir Mola'], s: ['Kremsi, hafif, taze frambuaz soslu', 'Her sabah taze, sınırlı sayıda', 'Orman meyveleri sosu ile'], sc: ['ev yapımı', 'tatlı bir mola', 'taptaze'], b: ['Sipariş ver', 'Hemen dene'], f: [['Ev yapımı', 'Günlük taze', 'Katkısız']],
      it: [['Cheesecake', '₺140'], ['Tiramisu', '₺130'], ['Brownie', '₺110'], ['Sütlaç', '₺90']] }),
    dondurma: C('Dondurma', { art: 'icecream', g: 'GELATO', m: [['sprinkle', '#FF6B9A'], ['sprinkle', '#3EC1D3'], ['sprinkle', '#FFC93C'], ['cherry'], ['mint']], p: ['pembe', 'deniz', 'limon'], k: 'dondurma ice cream gelato külah maraş sorbe',
      t: ['Yaz geldi', 'Sıcak günlere', 'Yeni tat'], h: ['Maraş Dondurması', 'Serinleten Lezzet', 'Dilediğin Üç Tat'], s: ['Keçi sütü, salep, gerçek meyve', 'Günlük üretim, katkısız', 'Külahta ya da kapta'], sc: ['serinle', 'yaz tadında', 'buz gibi'], b: ['Hemen dene', 'Sipariş ver'], f: [['Keçi sütü', 'Salepli', 'Katkısız']],
      it: [['Tek top', '₺45'], ['Üç top', '₺99'], ['Waffle külah', '₺120'], ['Sorbe', '₺50']] }),
    icecek: C('İçecek', { art: 'lemonade', g: 'FRESH', m: [['lemon'], ['ice'], ['mint'], ['drop', 'w'], ['lemon', 'o']], p: ['limon', 'deniz', 'taze'], k: 'limonata içecek meyve suyu smoothie milkshake soda kokteyl şişe su ayran soğuk çay frozen',
      t: ['Ev yapımı', 'Yaz menüsü', 'Taze sıkım'], h: ['Naneli Limonata', 'Serinleten Lezzetler', 'Taze Sıkım Meyve Suyu'], s: ['Taze sıkım limon, nane, buz', 'Limonata, ice latte, smoothie', 'Şekersiz, katkısız, günlük'], sc: ['buz gibi', 'taptaze', 'serinle'], b: ['Hemen dene', 'Sipariş ver'], f: [['Taze sıkım', 'Şekersiz', '400 ml']],
      it: [['Limonata', '₺70'], ['Portakal suyu', '₺80'], ['Smoothie', '₺95'], ['Ice latte', '₺95']] }),
    bal: C('Bal', { art: 'honey', g: 'HONEY', m: [['honeycomb'], ['drop', 'h'], ['flower'], ['drop', 'h']], p: ['kahve', 'limon', 'gece'], k: 'bal petek kavanoz polen propolis arı sütü pekmez reçel',
      t: ['Yayla balı', 'Doğadan', 'Kestane balı'], h: ['Süzme Çiçek Balı', 'Karadeniz Kestane Balı', 'Doğal Petek Bal'], s: ['Yayla çiçeklerinden, katkısız ve analizli', 'Ham bal, cam kavanozda', 'Kendi arılığımızdan sofranıza'], sc: ['doğadan', 'yayladan', 'saf lezzet'], b: ['Sipariş ver', 'Hemen al'], f: [['850 g', 'Katkısız', 'Analizli'], ['500 g', 'Ham bal', 'Cam kavanoz']],
      it: [['Çiçek balı 850 g', '₺450'], ['Kestane balı 500 g', '₺640'], ['Petek bal 1 kg', '₺780'], ['Polen 250 g', '₺320']] }),
    zeytinyagi: C('Zeytinyağı', { art: 'oil', g: 'OLIVE', m: [['oliveleaf'], ['olive'], ['olive', 'k'], ['drop', 'o']], p: ['zeytin', 'orman', 'krem'], k: 'zeytinyağı zeytin yağ şişe sızma natürel teneke',
      t: ['Erken hasat', 'Ayvalık’tan', 'Soğuk sıkım'], h: ['Natürel Sızma Zeytinyağı', 'Erken Hasat Zeytinyağı', 'Ege’nin Altını'], s: ['Elle toplanan zeytinlerden soğuk sıkım', 'Düşük asit, yoğun aroma', '1 L cam şişe'], sc: ['Ege’den', 'erken hasat', 'doğal'], b: ['Sipariş ver', 'Hemen al'], f: [['Soğuk sıkım', '1 L', 'Asit %0,3']],
      it: [['Sızma 1 L', '₺389'], ['Erken hasat 500 ml', '₺290'], ['Teneke 5 L', '₺1.650'], ['Siyah zeytin 1 kg', '₺260']] }),
    kahvalti: C('Kahvaltı', { art: 'breakfast', g: 'BRUNCH', m: [['tomato'], ['cucumber'], ['olive', 'k'], ['leaf'], ['olive']], p: ['krem', 'zeytin', 'domates'], k: 'kahvaltı serpme yumurta omlet menemen peynir brunch tost börek',
      t: ['Hafta sonu', '08:00 – 14:00', 'Serpme'], h: ['Serpme Kahvaltı', 'Köy Kahvaltısı', 'Pazar Keyfi'], s: ['Köy yumurtası, yerel peynirler, sınırsız çay', 'İki kişilik, sıcak ekmekle', 'Ailecek güne başla'], sc: ['hafta sonu', 'günaydın', 'pazar keyfi'], b: ['Rezervasyon yap', 'Yerini ayırt'], f: [['2 kişilik', 'Sınırsız çay', 'Köy ürünü']],
      it: [['Serpme kahvaltı (2 kişilik)', '₺850'], ['Menemen', '₺160'], ['Omlet', '₺140'], ['Sıcak simit', '₺20']] }),
    firin: C('Fırın', { art: 'croissant', g: 'BAKERY', m: [['wheat'], ['sesame'], ['sesame'], ['wheat']], p: ['krem', 'kahve', 'limon'], k: 'simit ekmek kruvasan poğaça açma börek fırın unlu mamul baget pide',
      t: ['Fırından yeni çıktı', 'Her sabah taze', 'Fransız fırını'], h: ['Çıtır Simit', 'Tereyağlı Kruvasan', 'Günlük Taze Ekmek'], s: ['Pekmezli, bol susamlı, her saat taze', '27 kat, %82 tereyağı', 'Ekşi mayalı, taş fırında'], sc: ['fırından', 'sıcacık', 'her sabah'], b: ['Sipariş ver', 'Hemen al'], f: [['Ekşi maya', 'Taş fırın', 'Günlük']],
      it: [['Simit', '₺15'], ['Açma', '₺20'], ['Kruvasan', '₺55'], ['Ekşi mayalı ekmek', '₺60']] }),
    salata: C('Salata', { art: 'salad', g: 'FRESH', m: [['leafy'], ['tomato'], ['cucumber'], ['lemon'], ['leaf']], p: ['taze', 'krem', 'limon'], k: 'salata bowl sağlıklı fit vegan sebze avokado quinoa',
      t: ['Fit menü', 'Hafif ve taze', 'Günün bowl’u'], h: ['Akdeniz Salatası', 'Günün Bowl’u', 'Taze ve Hafif'], s: ['Mevsim yeşillikleri, çeri domates, beyaz peynir', '450 kalori, 32 g protein', 'Her gün taze doğranır'], sc: ['hafif ve taze', 'yeşil', 'fit'], b: ['Sipariş ver', 'Hemen dene'], f: [['450 kcal', '32 g protein', 'Vegan seçenek']],
      it: [['Akdeniz salatası', '₺180'], ['Sezar salata', '₺190'], ['Ton balıklı bowl', '₺220'], ['Kinoa salata', '₺200']] }),
    corba: C('Ev yemeği', { art: 'soup', g: 'LEZZET', m: [['chili'], ['leaf'], ['lemon'], ['pepper']], p: ['krem', 'domates', 'orman'], k: 'çorba mercimek yemek ev yemeği tencere pilav makarna mantı güveç',
      t: ['Günün çorbası', 'Ev yemeği', 'Bugün'], h: ['Süzme Mercimek', 'Ev Yemekleri', 'Günün Menüsü'], s: ['Tereyağlı pul biberli, limon ve kıtır ekmekle', 'Anne eli değmiş gibi', 'Her gün farklı lezzetler'], sc: ['günün çorbası', 'ev usulü', 'sıcacık'], b: ['Sipariş ver', 'Hemen dene'], f: [['Ev usulü', 'Günlük', 'Doyurucu']],
      it: [['Mercimek çorbası', '₺95'], ['Izgara köfte', '₺260'], ['Kuru fasulye', '₺180'], ['Sütlaç', '₺90']] }),
    et: C('Et · Kebap', { art: 'soup', g: 'GRILL', m: [['chili'], ['rosemary'], ['pepper'], ['onion'], ['tomato']], p: ['gece', 'bordo', 'domates'], k: 'et kebap döner adana steak biftek kasap kuzu tavuk ızgara şiş köfte sucuk pastırma',
      t: ['Közde pişer', 'Kasaptan', 'Izgara'], h: ['Adana Kebap', 'Dry Aged Steak', 'Mangal Keyfi'], s: ['Zırhla çekilmiş kuzu eti, közde biber', '28 gün dinlendirilmiş dana', 'Odun ateşinde, lavaşla'], sc: ['közden', 'ateşte', 'usta işi'], b: ['Sipariş ver', 'Rezervasyon yap'], f: [['Günlük et', 'Odun ateşi', '250 g']],
      it: [['Adana kebap', '₺380'], ['Kuzu şiş', '₺420'], ['Tavuk kanat', '₺260'], ['Izgara köfte', '₺290']] }),
    cikolata: C('Çikolata', { art: 'cake', g: 'CHOCO', m: [['choco'], ['hazelnut'], ['choco'], ['drop', 'c']], p: ['gece', 'kahve', 'bordo'], k: 'çikolata kakao pralin bonbon truffle fındık ezmesi',
      t: ['El yapımı', 'Butik üretim', 'Hediyelik'], h: ['El Yapımı Çikolata', 'Fındıklı Pralin', 'Bitter Lezzet'], s: ['%70 kakao, Giresun fındığı', 'Özel kutusunda, hediyelik', 'Butik atölyemizden'], sc: ['el yapımı', 'saf kakao', 'tatlı hediye'], b: ['Sipariş ver', 'Hemen al'], f: [['%70 kakao', 'Katkısız', '250 g']],
      it: [['Bitter tablet', '₺160'], ['Pralin kutusu', '₺420'], ['Fındık ezmesi', '₺280'], ['Truffle (12 adet)', '₺360']] }),
    meyve: C('Meyve · Sebze', { art: 'salad', g: 'FRESH', m: [['leaf'], ['strawberry'], ['lemon', 'o'], ['drop', 'w'], ['cherry']], p: ['taze', 'limon', 'domates'], k: 'meyve sebze manav organik çilek elma portakal domates köy bahçe',
      t: ['Bahçeden', 'Organik', 'Günlük taze'], h: ['Taze Meyve Sebze', 'Bahçeden Sofraya', 'Organik Kutu'], s: ['Sabah toplandı, akşam kapında', 'Yerel üreticiden, ilaçsız', 'Haftalık kutu kapına gelsin'], sc: ['bahçeden', 'taptaze', 'organik'], b: ['Sipariş ver', 'Hemen al'], f: [['İlaçsız', 'Yerel', 'Aynı gün']],
      it: [['Çilek 1 kg', '₺140'], ['Domates 1 kg', '₺45'], ['Organik kutu', '₺450'], ['Portakal 2 kg', '₺90']] }),
    kuruyemis: C('Kuruyemiş', { art: 'honey', g: 'NUTS', m: [['hazelnut'], ['hazelnut'], ['leaf'], ['cinnamon']], p: ['kahve', 'krem', 'gece'], k: 'kuruyemiş fındık fıstık badem ceviz kaju lokum baharat kuru meyve',
      t: ['Taze kavrulmuş', 'Günlük', 'Lüks karışım'], h: ['Taze Kavrulmuş Kuruyemiş', 'Lüks Karışık', 'Antep Fıstığı'], s: ['Günlük kavrum, vakumlu paket', 'Kaju, badem, fındık, ceviz', 'Doğrudan üreticiden'], sc: ['taze kavrum', 'çıtır', 'doğal'], b: ['Sipariş ver', 'Hemen al'], f: [['500 g', 'Günlük kavrum', 'Vakumlu']],
      it: [['Lüks karışık 500 g', '₺320'], ['Antep fıstığı 250 g', '₺290'], ['Kaju 250 g', '₺210'], ['Badem 500 g', '₺260']] }),
    kozmetik: C('Kozmetik', { art: null, g: 'BEAUTY', m: [['bubble'], ['petal'], ['drop', 'w'], ['sparkle', '#FFFFFF'], ['bubble']], p: ['pembe', 'krem', 'deniz'], k: 'krem serum şampuan kozmetik parfüm ruj makyaj sabun losyon cilt bakım şişe tüp maske',
      t: ['Yeni', 'Cilt bakımı', 'Doğal içerik'], h: ['Nem Serumu', 'Işıltılı Cilt', 'Doğal Bakım'], s: ['Hyaluronik asit ile 72 saat nem', 'Hassas ciltlere uygun, paraben içermez', 'Bitkisel içerik, vegan formül'], sc: ['ışılda', 'doğal güzellik', 'kendine iyi bak'], b: ['Hemen al', 'Keşfet'], f: [['50 ml', 'Vegan', 'Paraben yok']],
      it: [['Nem serumu', '₺390'], ['Yüz kremi', '₺320'], ['Temizleme jeli', '₺210'], ['Göz kremi', '₺280']] }),
    giyim: C('Giyim', { art: null, g: 'STYLE', m: [['sparkle', '#FFFFFF'], ['confetti', '#FF6B6B'], ['star', '#FFC93C']], p: ['gece', 'krem', 'pembe'], k: 'tişört elbise gömlek mont ceket kazak pantolon etek giyim kıyafet tekstil hırka sweatshirt',
      t: ['Yeni sezon', 'Koleksiyon', 'Sınırlı stok'], h: ['Yeni Sezon Koleksiyonu', 'Tarzını Yansıt', 'Sezon Favorisi'], s: ['%100 pamuk, rahat kesim', 'S – XL beden seçenekleri', 'Bugün sipariş, yarın kargoda'], sc: ['yeni sezon', 'tarzın', 'şıklık'], b: ['Hemen al', 'Koleksiyonu gör'], f: [['%100 pamuk', 'S – XL', 'Ücretsiz kargo']],
      it: [['Basic tişört', '₺299'], ['Oversize sweatshirt', '₺599'], ['Keten gömlek', '₺749'], ['Denim ceket', '₺1.199']] }),
    ayakkabi: C('Ayakkabı', { art: null, g: 'SNEAKER', m: [['sparkle', '#FFFFFF'], ['ring', '#FFD23F'], ['confetti', '#3EC1D3']], p: ['gece', 'sokak', 'deniz'], k: 'ayakkabı sneaker bot spor ayakkabı terlik sandalet topuklu',
      t: ['Yeni sezon', 'Çok satan', 'Sınırlı üretim'], h: ['Yeni Sneaker', 'Adımını Güçlendir', 'Konforlu Adımlar'], s: ['Hafif taban, gün boyu konfor', '36 – 45 numara seçenekleri', 'Ücretsiz kargo ve değişim'], sc: ['yeni sezon', 'hafif', 'konfor'], b: ['Hemen al', 'Keşfet'], f: [['Hafif taban', '36 – 45', 'Ücretsiz değişim']],
      it: [['Koşu ayakkabısı', '₺1.899'], ['Günlük sneaker', '₺1.499'], ['Deri bot', '₺2.299'], ['Sandalet', '₺899']] }),
    canta: C('Çanta · Aksesuar', { art: null, g: 'STYLE', m: [['sparkle', '#FFFFFF'], ['gem'], ['star', '#FFC93C']], p: ['krem', 'gece', 'bordo'], k: 'çanta cüzdan saat gözlük kemer şapka aksesuar sırt çantası',
      t: ['Yeni', 'El yapımı', 'Koleksiyon'], h: ['Hakiki Deri Çanta', 'Şıklığın Tamamlayıcısı', 'Günlük Çanta'], s: ['El işçiliği, hakiki deri', 'Her kombine uyar', 'Ücretsiz kargo'], sc: ['zamansız', 'şık', 'el işi'], b: ['Hemen al', 'Keşfet'], f: [['Hakiki deri', 'El yapımı', '2 yıl garanti']],
      it: [['Omuz çantası', '₺1.299'], ['Cüzdan', '₺499'], ['Sırt çantası', '₺999'], ['Kemer', '₺399']] }),
    taki: C('Takı', { art: null, g: 'JEWEL', m: [['sparkle', '#FFF3C4'], ['gem', '#8FE3FF'], ['sparkle', '#FFFFFF']], p: ['gece', 'bordo', 'krem'], k: 'takı kolye yüzük küpe bileklik altın gümüş pırlanta mücevher',
      t: ['Yeni koleksiyon', 'El işçiliği', 'Hediye'], h: ['Zarif Kolye', 'Işıltını Yansıt', 'Sevdiklerine Hediye'], s: ['925 ayar gümüş, el işçiliği', 'Özel kutusunda, hediye paketli', 'Kişiye özel isim yazılır'], sc: ['zarafet', 'ışılda', 'hediye'], b: ['Hemen al', 'Keşfet'], f: [['925 ayar', 'El yapımı', 'Hediye kutusu']],
      it: [['Kolye', '₺890'], ['Yüzük', '₺650'], ['Küpe', '₺540'], ['Bileklik', '₺720']] }),
    elektronik: C('Elektronik', { art: null, g: 'TECH', m: [['ring', '#7AE7FF'], ['sparkle', '#B8F3FF'], ['ring', '#C08BFF']], p: ['gece', 'deniz', 'orman'], k: 'telefon kulaklık şarj saat akıllı tablet bilgisayar laptop hoparlör kamera elektronik powerbank kablo',
      t: ['Yeni teknoloji', 'Stokta', 'Kampanya'], h: ['Kablosuz Kulaklık', 'Teknolojiyi Keşfet', 'Akıllı Seçim'], s: ['30 saat pil, aktif gürültü engelleme', '2 yıl garanti, hızlı kargo', 'Aynı gün kargoda'], sc: ['yeni nesil', 'akıllı', 'güçlü'], b: ['Hemen al', 'İncele'], f: [['2 yıl garanti', 'Hızlı kargo', 'Orijinal']],
      it: [['Kulaklık', '₺1.299'], ['Akıllı saat', '₺2.499'], ['Powerbank', '₺699'], ['Hoparlör', '₺999']] }),
    ev: C('Ev · Dekor', { art: null, g: 'HOME', m: [['leafy'], ['sparkle', '#FFFFFF'], ['leaf']], p: ['krem', 'zeytin', 'kahve'], k: 'mum vazo dekor ev yastık halı lamba tablo bitki saksı mutfak tabak bardak kupa',
      t: ['Yeni', 'Evine değer kat', 'El yapımı'], h: ['Evine Sıcaklık Kat', 'Dekor Koleksiyonu', 'El Yapımı Mum'], s: ['Doğal soya mumu, 40 saat yanma', 'Her köşeye uyumlu tasarım', 'Ücretsiz kargo'], sc: ['evim', 'sıcacık', 'huzur'], b: ['Hemen al', 'Keşfet'], f: [['El yapımı', 'Doğal', 'Hediye paketi']],
      it: [['Soya mum', '₺290'], ['Seramik vazo', '₺450'], ['Kırlent', '₺220'], ['Masa lambası', '₺890']] }),
    temizlik: C('Temizlik', { art: null, g: 'CLEAN', m: [['bubble'], ['bubble'], ['drop', 'w'], ['sparkle', '#FFFFFF']], p: ['deniz', 'taze', 'krem'], k: 'deterjan sabun temizlik yumuşatıcı çamaşır bulaşık dezenfektan',
      t: ['Yeni formül', 'Doğal içerik', 'Ekonomik'], h: ['Pırıl Pırıl Temizlik', 'Doğal Sabun', 'Ferah Koku'], s: ['Bitkisel içerik, çevre dostu', 'Lekeleri ilk yıkamada çıkarır', '3 al 2 öde'], sc: ['tertemiz', 'ferah', 'doğal'], b: ['Hemen al', 'Sipariş ver'], f: [['Bitkisel', '1,5 L', 'Çevre dostu']],
      it: [['Sıvı sabun', '₺120'], ['Çamaşır deterjanı', '₺290'], ['Bulaşık deterjanı', '₺110'], ['Yüzey temizleyici', '₺95']] }),
    oyuncak: C('Oyuncak · Çocuk', { art: null, g: 'FUN', m: [['star', '#FFC93C'], ['confetti', '#FF6B6B'], ['confetti', '#3EC1D3'], ['star', '#FF8FB1']], p: ['limon', 'deniz', 'pembe'], k: 'oyuncak bebek çocuk peluş lego puzzle oyun kitap boyama',
      t: ['Yeni', 'Eğitici', 'Hediye'], h: ['Eğlenceli Oyuncaklar', 'Hayal Gücüne Kanat', 'Mutlu Çocuklar'], s: ['3 yaş üzeri, güvenli malzeme', 'Hediye paketiyle kapında', 'Eğitici ve eğlenceli'], sc: ['oyun zamanı', 'eğlence', 'mutluluk'], b: ['Hemen al', 'Keşfet'], f: [['3+ yaş', 'Güvenli', 'Eğitici']],
      it: [['Peluş ayı', '₺350'], ['Yapboz', '₺220'], ['Boyama seti', '₺180'], ['Ahşap blok', '₺420']] }),
    cicek: C('Çiçek', { art: null, g: 'FLORA', m: [['petal'], ['petal', 'w'], ['leaf'], ['flower']], p: ['pembe', 'krem', 'taze'], k: 'çiçek buket gül orkide saksı bitki lale papatya',
      t: ['Aynı gün teslim', 'Sevdiklerine', 'Taze çiçek'], h: ['Taze Gül Buketi', 'Sevgini Çiçekle Söyle', 'Mevsim Buketi'], s: ['Aynı gün kapıda, not kartıyla', 'Günlük taze kesim', 'Özel günlere özel tasarım'], sc: ['sevgiyle', 'taze', 'mutlu günler'], b: ['Sipariş ver', 'Hemen gönder'], f: [['Aynı gün', 'Not kartı', 'Taze kesim']],
      it: [['Gül buketi', '₺650'], ['Orkide', '₺890'], ['Mevsim buketi', '₺520'], ['Kutuda çiçek', '₺750']] }),
    genel: C('Diğer ürün', { art: null, g: 'NEW', m: [['sparkle', '#FFFFFF'], ['confetti', '#FFC93C'], ['star', '#FFC93C']], p: ['krem', 'gece', 'deniz'], k: '',
      t: ['Yeni ürün', 'Kampanya', 'Çok satan'], h: ['Yeni Ürünümüz', 'Kaçırılmayacak Fırsat', 'Şimdi Stokta'], s: ['Özenle seçildi, kapına kadar', 'Bugün sipariş, yarın kargoda', 'Sınırlı stok'], sc: ['yeni', 'fırsat', 'özel'], b: ['Hemen al', 'Sipariş ver'], f: [['Hızlı kargo', 'Garantili', 'Kolay iade']],
      it: [['Ürün 1', '₺199'], ['Ürün 2', '₺249'], ['Ürün 3', '₺299'], ['Ürün 4', '₺349']] }),
  };
  const ART2CAT = { burger: 'burger', pizza: 'pizza', coffee: 'kahve', cake: 'tatli', breakfast: 'kahvalti', simit: 'firin', croissant: 'firin', salad: 'salata', oil: 'zeytinyagi', honey: 'bal', icecream: 'dondurma', soup: 'corba', lemonade: 'icecek' };


  // ---------------------------------------------------------------- bağış / kampanya çizimleri (gerçek fotoğrafla değiştirilmek üzere)
  const CART = {
    koli: () => svg(`<defs>${lg('t', [[0, '#FFFFFF'], [1, '#E9E6E0']], 1, 1)}${lg('l', [[0, '#F4F2EE'], [1, '#D9D5CE']], 0, 1)}${lg('r', [[0, '#E2DED7'], [1, '#C4BFB6']], 0, 1)}${lg('gold', [[0, '#D9C27A'], [1, '#9C8436']], 1, 1)}</defs>
      <ellipse cx="50" cy="93" rx="34" ry="4" fill="#000" opacity=".18"/>
      <path d="M50 14L86 30L50 46L14 30Z" fill="url(#t)"/><path d="M14 30L50 46V92L14 76Z" fill="url(#l)"/><path d="M86 30L50 46V92L86 76Z" fill="url(#r)"/>
      <path d="M32 22L68 38" stroke="#CFC9BF" stroke-width="1.2"/><path d="M50 46V92" stroke="#B8B2A8" stroke-width=".6"/>
      <path d="M32 58C28 52 22 56 24 61C25 65 32 70 32 70C32 70 39 65 40 61C42 56 36 52 32 58Z" fill="url(#gold)" transform="skewY(24) translate(0 -14)"/>
      <path d="M68 58C64 52 58 56 60 61C61 65 68 70 68 70C68 70 75 65 76 61C78 56 72 52 68 58Z" fill="url(#gold)" transform="skewY(-24) translate(0 30)"/>`),
    koyun: () => svg(`<defs>${rg('w', [[0, '#FFFFFF'], [0.7, '#F1ECE2'], [1, '#CFC6B6']], '40%', '30%', '75%')}${rg('f', [[0, '#5A4A40'], [1, '#2A201A']])}</defs>
      <ellipse cx="50" cy="92" rx="32" ry="4" fill="#000" opacity=".18"/>
      <rect x="30" y="66" width="6" height="24" rx="3" fill="#3A2E26"/><rect x="42" y="68" width="6" height="22" rx="3" fill="#2E241E"/><rect x="58" y="68" width="6" height="22" rx="3" fill="#3A2E26"/><rect x="68" y="66" width="6" height="24" rx="3" fill="#2E241E"/>
      ${[[34, 50, 14], [48, 44, 15], [62, 48, 14], [72, 58, 12], [58, 62, 14], [42, 64, 14], [28, 60, 12], [50, 56, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#w)"/>`).join('')}
      <ellipse cx="20" cy="46" rx="11" ry="14" fill="url(#f)" transform="rotate(-15 20 46)"/><ellipse cx="10" cy="40" rx="6" ry="3" fill="#3A2E26" transform="rotate(-30 10 40)"/><ellipse cx="30" cy="36" rx="6" ry="3" fill="#3A2E26" transform="rotate(30 30 36)"/>
      <circle cx="16" cy="44" r="1.6" fill="#fff"/><circle cx="24" cy="44" r="1.6" fill="#fff"/>
      ${[[22, 34, 7], [30, 32, 6], [14, 33, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#w)"/>`).join('')}`),
    asure: () => svg(`<defs>${rg('b', [[0, '#FFFFFF'], [1, '#DDE4DE']], '40%', '30%', '80%')}${rg('c', [[0, '#E8D4AE'], [1, '#B8935C']], '50%', '40%', '60%')}</defs>
      <ellipse cx="50" cy="90" rx="40" ry="6" fill="#000" opacity=".15"/><ellipse cx="50" cy="84" rx="44" ry="9" fill="#F4F6F4"/>
      <path d="M10 46C10 72 28 86 50 86C72 86 90 72 90 46Z" fill="url(#b)"/>
      <path d="M14 56C24 52 30 66 40 60C50 54 56 70 66 62C76 54 82 64 87 58C84 72 70 84 50 84C30 84 18 72 14 56Z" fill="#1F7A4A"/>
      <path d="M22 66C30 62 36 72 46 68" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><path d="M58 70C66 64 72 72 80 66" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
      <ellipse cx="50" cy="46" rx="40" ry="11" fill="url(#c)"/>
      ${Array.from({ length: 30 }, (_, i) => { const a = i * 2.39, r = (i % 7) * 4.8; return `<ellipse cx="${50 + Math.cos(a) * r}" cy="${46 + Math.sin(a) * r * 0.24}" rx="${i % 3 ? 2.2 : 3}" ry="1.8" fill="${i % 4 === 0 ? '#9BC24A' : i % 4 === 1 ? '#C8102E' : i % 4 === 2 ? '#E21B3C' : '#F2E6C8'}"/>`; }).join('')}`),
    kitap: () => svg(`<defs>${lg('g', [[0, '#1F6E4F'], [1, '#0F4A35']], 1, 0)}${lg('r', [[0, '#8A2B2B'], [1, '#5A1414']], 1, 0)}${lg('n', [[0, '#1D3A6B'], [1, '#0F2246']], 1, 0)}</defs>
      <ellipse cx="50" cy="92" rx="38" ry="4" fill="#000" opacity=".18"/>
      <rect x="14" y="72" width="72" height="16" rx="2" fill="url(#n)"/><rect x="16" y="74" width="68" height="3" fill="#E8E2D2"/><rect x="40" y="78" width="20" height="5" rx="1" fill="#C9A94E"/>
      <rect x="18" y="56" width="64" height="16" rx="2" fill="url(#r)"/><rect x="20" y="58" width="60" height="3" fill="#EFE8D8"/><rect x="40" y="62" width="20" height="5" rx="1" fill="#C9A94E"/>
      <rect x="12" y="40" width="70" height="16" rx="2" fill="url(#g)"/><rect x="14" y="42" width="66" height="3" fill="#F4EEDF"/><rect x="36" y="46" width="22" height="5" rx="1" fill="#C9A94E"/>
      <path d="M30 40C30 30 40 22 50 22C60 22 70 30 70 40" fill="none" stroke="#C9A94E" stroke-width="2"/><path d="M50 14L52 20L58 20L53 24L55 30L50 26L45 30L47 24L42 20L48 20Z" fill="#C9A94E"/>`),
    su: () => svg(`<defs>${rg('w', [[0, '#DDF4FF'], [0.6, '#5BB8EA'], [1, '#1E6FB0']], '40%', '35%', '70%')}</defs>
      <ellipse cx="50" cy="92" rx="30" ry="4" fill="#000" opacity=".15"/>
      <path d="M50 8C62 30 80 46 80 64A30 30 0 0 1 20 64C20 46 38 30 50 8Z" fill="url(#w)"/><path d="M36 60A16 16 0 0 0 46 78" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`),
  };
  const cartUrl = {};
  function cart(k) { if (!cartUrl[k]) cartUrl[k] = CART[k] ? enc(CART[k]()) : null; return cartUrl[k]; }
  // mühür ortası simgeleri
  const ICON = {
    hilal: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M58 18C38 20 24 36 24 54C24 74 40 88 60 88C48 80 42 68 42 54C42 40 48 26 58 18Z"/><path d="M66 30V36M60 40H72L70 60H62ZM62 60V66H70V60M66 66V70"/><path d="M30 40l2 4 4 .6-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.6Z" stroke-width="2"/><path d="M78 34l1.6 3.2 3.4.4-2.4 2.4.6 3.4-3.2-1.6-3.2 1.6.6-3.4-2.4-2.4 3.4-.4Z" stroke-width="2"/></g>`),
    koyun: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M30 40C24 38 20 46 26 50C20 56 26 64 32 62C34 70 44 74 50 70C56 74 66 70 68 62C74 64 80 56 74 50C80 46 76 38 70 40C70 30 60 26 54 30C50 24 40 26 40 32C34 30 28 34 30 40Z"/><path d="M40 46C40 40 60 40 60 46V58C60 66 40 66 40 58Z"/><path d="M44 52h.1M56 52h.1" stroke-width="4"/><path d="M47 60C49 62 51 62 53 60"/></g>`),
    kalp: (c) => svg(`<path d="M50 84C24 66 14 52 14 38C14 26 24 18 34 18C42 18 47 22 50 28C53 22 58 18 66 18C76 18 86 26 86 38C86 52 76 66 50 84Z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`),
    video: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="24" width="64" height="44" rx="4"/><path d="M14 76H86"/><path d="M42 36V56L58 46Z"/></g>`),
    kitap: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"><path d="M50 30C40 22 26 22 16 26V78C26 74 40 74 50 82C60 74 74 74 84 78V26C74 22 60 22 50 30ZM50 30V82"/></g>`),
    ev: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"><path d="M16 50L50 22L84 50M26 42V80H74V42"/><path d="M42 80V60H58V80"/></g>`),
    el: (c) => svg(`<g fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 64H30L46 72H62C66 72 66 66 62 66H48M30 64V82H14M62 72L82 62C86 60 88 66 84 68L60 82H30"/><path d="M58 50C46 42 40 36 40 30C40 24 46 20 51 25L54 28L57 25C62 20 68 24 68 30C68 36 62 42 58 50Z"/></g>`),
  };
  // ---- v6.2: genişletilmiş çizgi simge kümesi (ikon kütüphanesi ve eğitim şablonları)
  const LN = (c, d, extra = '') => svg(`<g fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/>${extra}</g>`);
  const FL = (c, d) => svg(`<path d="${d}" fill="${c}"/>`);
  Object.assign(ICON, {
    takvim: (c) => LN(c, 'M24 24H76Q82 24 82 30V76Q82 82 76 82H24Q18 82 18 76V30Q18 24 24 24ZM18 40H82M34 16V30M66 16V30', `<g fill="${c}" stroke="none"><circle cx="34" cy="54" r="3.4"/><circle cx="50" cy="54" r="3.4"/><circle cx="66" cy="54" r="3.4"/><circle cx="34" cy="68" r="3.4"/><circle cx="50" cy="68" r="3.4"/></g>`),
    saat: (c) => LN(c, 'M50 32V52L64 60', `<circle cx="50" cy="52" r="32"/>`),
    konum: (c) => LN(c, 'M50 86C50 86 24 60 24 40C24 25 36 14 50 14C64 14 76 25 76 40C76 60 50 86 50 86Z', `<circle cx="50" cy="40" r="9"/>`),
    kep: (c) => LN(c, 'M10 40L50 22L90 40L50 58ZM26 48V66C34 74 66 74 74 66V48M90 40V62'),
    kalem: (c) => LN(c, 'M22 78L26 62L68 20L80 32L38 74ZM62 26L74 38M22 78L38 74'),
    kupa: (c) => LN(c, 'M32 20H68V40C68 52 60 60 50 60C40 60 32 52 32 40ZM32 26H20C20 38 26 44 32 44M68 26H80C80 38 74 44 68 44M50 60V72M40 72H60V82H40Z'),
    madalya: (c) => LN(c, 'M38 44L28 14H44L50 30L56 14H72L62 44M50 51L53 58L60 59L55 64L56 71L50 67L44 71L45 64L40 59L47 58Z', `<circle cx="50" cy="62" r="20"/>`),
    okul: (c) => LN(c, 'M14 46L50 22L86 46M22 42V82H78V42M42 82V62H58V82M50 22V10L62 14L50 18M12 82H88'),
    cami: (c) => LN(c, 'M12 84H88M32 84V58C32 46 40 38 50 36C60 38 68 46 68 58V84M50 36V28M18 84V40L22 32L26 40V84M74 84V40L78 32L82 40V84M44 84V72C44 66 56 66 56 72V84', `<path d="M50 18C46 20 46 26 50 28C47 27 46 21 50 18Z" fill="${c}" stroke="none"/>`),
    fener: (c) => LN(c, 'M40 18H60M44 18V12H56V18M36 26H64L70 34L64 70H36L30 34ZM36 70L42 82H58L64 70M50 34V62M40 34L42 62M60 34L58 62'),
    kase: (c) => LN(c, 'M16 46H84C84 66 70 80 50 80C30 80 16 66 16 46ZM36 88H64M40 36C36 30 44 26 40 20M58 36C54 30 62 26 58 20'),
    ekmek: (c) => LN(c, 'M18 58C18 40 34 30 50 30C66 30 82 40 82 58V74H18ZM36 44L42 56M50 42L54 56M64 44L66 56'),
    koli: (c) => LN(c, 'M18 34L50 20L82 34V70L50 84L18 70ZM18 34L50 48L82 34M50 48V84M34 27L66 41'),
    damla: (c) => LN(c, 'M50 14C50 14 26 44 26 60C26 74 37 84 50 84C63 84 74 74 74 60C74 44 50 14 50 14ZM40 62C40 68 44 72 50 72'),
    telefon: (c) => LN(c, 'M32 12H68Q74 12 74 18V82Q74 88 68 88H32Q26 88 26 82V18Q26 12 32 12ZM44 78H56'),
    mesaj: (c) => LN(c, 'M16 22H84V66H44L28 80V66H16Z'),
    zarf: (c) => LN(c, 'M14 26H86V76H14ZM14 28L50 54L86 28'),
    kure: (c) => LN(c, 'M16 50H84M50 16C36 30 36 70 50 84M50 16C64 30 64 70 50 84', `<circle cx="50" cy="50" r="34"/>`),
    ok: (c) => LN(c, 'M16 50H80M62 32L82 50L62 68'),
    onay: (c) => LN(c, 'M22 52L42 70L80 30'),
    arti: (c) => LN(c, 'M50 20V80M20 50H80'),
    hediye: (c) => LN(c, 'M18 40H82V56H18ZM24 56V84H76V56M50 40V84M50 40C40 22 24 28 34 40M50 40C60 22 76 28 66 40'),
    gunes: (c) => LN(c, 'M50 10V20M50 80V90M10 50H20M80 50H90M22 22L29 29M71 71L78 78M78 22L71 29M29 71L22 78', `<circle cx="50" cy="50" r="17"/>`),
    yaprak: (c) => LN(c, 'M20 80C20 40 46 18 82 18C82 54 60 80 20 80ZM20 80L62 38'),
    cicek: (c) => LN(c, 'M50 62V90M50 76C40 70 32 74 30 80M50 80C60 74 68 78 70 84', `<circle cx="50" cy="38" r="8"/><circle cx="50" cy="20" r="10"/><circle cx="67" cy="32" r="10"/><circle cx="61" cy="52" r="10"/><circle cx="39" cy="52" r="10"/><circle cx="33" cy="32" r="10"/>`),
    yildiz: (c) => LN(c, 'M50 12L60 38L88 40L66 58L74 86L50 70L26 86L34 58L12 40L40 38Z'),
    sekizgen: (c) => LN(c, 'M24 24H76V76H24ZM50 13L87 50L50 87L13 50Z', `<circle cx="50" cy="50" r="9"/>`),
    insanlar: (c) => LN(c, 'M16 84C16 68 26 60 36 60C46 60 56 68 56 84M48 64C52 60 58 58 64 58C76 58 84 66 84 84', `<circle cx="36" cy="44" r="11"/><circle cx="64" cy="40" r="10"/>`),
    ayrac: (c) => LN(c, 'M6 50H36M64 50H94M50 38L62 50L50 62L38 50Z', `<circle cx="30" cy="50" r="2.4" fill="${c}"/><circle cx="70" cy="50" r="2.4" fill="${c}"/>`),
    kose: (c) => LN(c, 'M10 90V34C10 20 20 10 34 10H90M22 90V40C22 30 30 22 40 22H90M10 10L22 22', `<circle cx="34" cy="34" r="4" fill="${c}"/>`),
    cerceve: (c) => LN(c, 'M8 8H92V92H8ZM16 16H84V84H16ZM8 8L16 16M92 8L84 16M8 92L16 84M92 92L84 84'),
    kalp2: (c) => FL(c, 'M50 86C22 66 10 52 10 36C10 22 21 12 34 12C42 12 47 16 50 22C53 16 58 12 66 12C79 12 90 22 90 36C90 52 78 66 50 86Z'),
    hilalYildiz: (c) => FL(c, 'M56 12C34 14 18 32 18 54C18 76 36 92 58 92C66 92 72 90 78 86C72 88 68 88 62 88C42 86 28 70 28 50C28 30 42 14 56 12ZM72 34L75 44L86 44L77 50L80 60L72 54L64 60L67 50L58 44L69 44Z'),
    rahle: (c) => LN(c, 'M50 40C40 32 28 32 18 36V68C28 64 40 64 50 72C60 64 72 64 82 68V36C72 32 60 32 50 40ZM50 40V72M22 86L78 70M22 70L78 86'),
    tesbih: (c) => LN(c, 'M50 70V84M44 90L50 84L56 90', `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(50 + Math.cos(a) * 26).toFixed(1)}" cy="${(42 + Math.sin(a) * 26).toFixed(1)}" r="4.6"/>`; }).join('')}`),
  });
  const ICON_NAMES = { hilal: 'Hilal ve yıldız', koyun: 'Koyun / kurban', kalp: 'Kalp', video: 'Video', kitap: 'Kitap', ev: 'Ev', el: 'Yardım eli', takvim: 'Takvim', saat: 'Saat', konum: 'Konum', kep: 'Mezuniyet kepi', kalem: 'Kalem', kupa: 'Kupa', madalya: 'Madalya', okul: 'Okul', cami: 'Cami', fener: 'Ramazan feneri', kase: 'Kase / çorba', ekmek: 'Ekmek', koli: 'Koli', damla: 'Su damlası', telefon: 'Telefon', mesaj: 'Mesaj', zarf: 'Zarf / e-posta', kure: 'Web / dünya', ok: 'Ok', onay: 'Onay', arti: 'Artı', hediye: 'Hediye', gunes: 'Güneş', yaprak: 'Yaprak', cicek: 'Çiçek', yildiz: 'Yıldız', sekizgen: 'Sekiz köşeli yıldız', insanlar: 'İnsanlar', ayrac: 'Ayraç süsü', kose: 'Köşe süsü', cerceve: 'Çerçeve', kalp2: 'Dolu kalp', hilalYildiz: 'Dolu hilal', rahle: 'Rahle ve kitap', tesbih: 'Tesbih' };
  const iconUrl = {};
  function icon(k, c = '#FFFFFF') { const key = k + c; if (!iconUrl[key]) iconUrl[key] = ICON[k] ? enc(ICON[k](c)) : null; return iconUrl[key]; }
  // gece gökyüzü, yıldız dizisi, hilal, sis, desen
  function night(W, H, c1, c2, seed = 5) {
    let st = '', sd = seed * 7919; const r = () => ((sd = (sd * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 140; i++) st += `<circle cx="${(W * r()).toFixed(0)}" cy="${(H * r() * 0.85).toFixed(0)}" r="${(Math.max(W, H) * (0.0008 + r() * 0.0016)).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="g" cx=".82" cy=".1" r="1.1"><stop offset="0" stop-color="${c2}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c1}"/></radialGradient><radialGradient id="h" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#h)"/>${st}</svg>`);
  }
  function garland(W, H, side = 'both') {
    const star = (x, y, s) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s / 20).toFixed(3)})"><path d="M0 -10L2.9 -3.1L10 -3.1L4.3 1.2L6.5 8.1L0 4L-6.5 8.1L-4.3 1.2L-10 -3.1L-2.9 -3.1Z" fill="#fff"/></g>`;
    const one = (flip) => { let o = '', d = ''; const n = 7, s = W * 0.034; for (let i = 0; i <= n; i++) { const t = i / n, x = flip ? W - t * W * 0.42 : t * W * 0.42, y = H * 0.02 + Math.sin(t * Math.PI * 0.9 + 0.4) * H * 0.16 * (1 - t * 0.2) * (flip ? 1.05 : 1) + (flip ? -H * 0.04 : 0); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); if (i) o += star(x, y + s * 0.4, s); } return `<path d="${d}" fill="none" stroke="#fff" stroke-width="${(W * 0.0018).toFixed(1)}" opacity=".9"/>${o}`; };
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(W * 0.006).toFixed(1)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#gl)">${side !== 'right' ? one(false) : ''}${side !== 'left' ? one(true) : ''}</g></svg>`);
  }
  function crescent(c = '#FFFFFF') {
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="800" height="800"><defs><radialGradient id="g" cx=".5" cy=".75" r=".55"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="#cfd6ea"/></radialGradient><filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M12 100A88 88 0 0 0 188 100A92 76 0 0 1 12 100Z" fill="url(#g)" filter="url(#gl)"/></svg>`);
  }
  function mist(W, H, c, seed = 4) {
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${(2.2 / Math.max(W, H)).toFixed(4)}" numOctaves="4" seed="${seed}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -.55"/><feGaussianBlur stdDeviation="${(Math.max(W, H) / 160).toFixed(1)}"/></filter><rect width="${W}" height="${H}" fill="${c}"/><rect width="${W}" height="${H}" filter="url(#m)"/><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${(600 / Math.max(W, H)).toFixed(3)}" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2"/></filter><rect width="${W}" height="${H}" filter="url(#n)" opacity=".5"/></svg>`);
  }
  function girih(W, H, c) {
    const s = Math.max(W, H) / 9; let o = '';
    const st = (x, y) => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? s * 0.28 : s * 0.42; d += (i ? 'L' : 'M') + (x + Math.cos(a) * r).toFixed(1) + ' ' + (y + Math.sin(a) * r).toFixed(1); } return d + 'Z'; };
    for (let y = 0; y < H + s; y += s) for (let x = ((y / s) % 2) * s * 0.5; x < W + s; x += s) o += st(x, y) + `M${(x + s * 0.42).toFixed(1)} ${y.toFixed(1)}L${(x + s * 0.58).toFixed(1)} ${y.toFixed(1)}`;
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask></defs><path d="${o}" fill="none" stroke="${c}" stroke-width="${(s * 0.03).toFixed(1)}" mask="url(#m)"/></svg>`);
  }
  function brushHeart(c) {
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="800" height="800"><defs><filter id="r" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9 .05" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter></defs><g filter="url(#r)" fill="none" stroke="${c}" stroke-linecap="round"><path d="M100 176C46 136 16 106 16 70C16 42 38 24 62 24C80 24 94 34 100 50C106 34 120 24 138 24C162 24 184 42 184 70C184 106 154 136 100 176Z" stroke-width="9"/><path d="M104 170C56 134 24 104 24 72C24 46 42 30 62 30C78 30 92 40 98 54" stroke-width="3" opacity=".7"/></g></svg>`);
  }
  // sabit üst kısımlar
  Object.assign(CATS, {
    ramazan: C('Ramazan · Kumanya', { art: 'koli', g: '', m: [['sparkle', '#FFFFFF']], p: ['lacivert', 'mor', 'turkuaz', 'zumrut', 'fusya', 'murdum'], k: 'ramazan koli kumanya iftar sahur gıda kolisi yardım paketi erzak',
      t: ['Ramazan-ı Şerif', 'İftar sofrası', 'Kumanya'], h: ['Bir Koli Mutluluk', 'Koli Koli Bereket', 'Umudu Birlikte Paketleyelim'], s: ['İftar ve sahur sofrasına bereket getiren yardım kumanyalarıyla siz de ihtiyaç sahibi bir ailenin mutluluğuna vesile olun.', 'Bir ailenin sofrasına misafir olun!', 'Her kumanya bir ailenin umudu olsun.'], sc: ['Yakın gönüllerin uzak sofrası', 'paylaştıkça çoğalır', 'bereket'], b: ['Bağış yap', 'Hemen destek ol'], f: [['Kumanya bedeli', 'İftar bedeli', 'Hisse bedeli']],
      it: [['1 Kumanya bedeli', '₺1.500'], ['1 İftar bedeli', '₺450'], ['1 Hisse', '₺250']] }),
    kurban: C('Kurban', { art: 'koyun', g: '', m: [['sparkle', '#FFFFFF']], p: ['zumrut', 'turkuaz', 'lacivert'], k: 'kurban koyun koç keçi hisse adak akika şükür nafile bayram kesim',
      t: ['Kurban Bayramı', 'Hisse kayıtları başladı', 'Kurbanın manası paylaşmaktır'], h: ['Kurbanını Paylaş, İyiliğe Yakınlaş!', 'Kurbanı Fırsat Bil, İyiliğe Fırsat Bul!', 'Bi’ Mesajla Kurban Kesiyoruz'], s: ['Bir iyiliğe daha vesile olmak, bir gönülde daha yer edinmek, bir kurban ile mümkün!', 'Kurbanlarınız itina ile kesilir, videosu anında iletilir.', 'Uzak diyarlarda ihtiyaç sahiplerine ulaştırıyoruz.'], sc: ['Kesiyoruz', 'Oluyoruz', 'paylaş'], b: ['Hisse al', 'Bağış yap'], f: [['Kurbanlarınız itina ile kesilir', 'Kurban Cenab-ı Hakk’a yaklaşmaya vesiledir', 'Videosu anında iletilir']],
      it: [['Hisse bedeli', '₺3.250'], ['Büyükbaş', '₺22.750'], ['Küçükbaş', '₺6.500']] }),
    asure: C('Aşure', { art: 'asure', g: '', m: [['sparkle', '#C9A94E']], p: ['krem', 'bordo', 'zumrut'], k: 'aşure muharrem hicri yılbaşı kase tatlı ikram',
      t: ['Muharrem-i Şerif', 'Aşure günü', 'Hicri yeni yıl'], h: ['Sizin Adınıza Aşure Dağıtıyoruz', 'Hicri Yeni Yılımız Mübarek Olsun', 'Aşure Kazanlarımız Kaynıyor'], s: ['Bu sene binlerce kase aşure sizin adınıza ikram edilecek. Siz de bir kase aşure ikram etmek ister misiniz?', 'Talebelerimize ve ihtiyaç sahibi ailelere ikram edilecektir.', 'Dünyanın dört bir yerinde'], sc: ['bereketli sofralar', 'ikram', 'paylaşmak'], b: ['Bağış yap', 'İkram et'], f: [['1 Aşure ücreti', '₺150', 'Kase']],
      it: [['1 Kase aşure', '₺150'], ['10 Kase', '₺1.500'], ['1 Kazan', '₺7.500']] }),
    egitim: C('Eğitim · Talebe', { art: 'kitap', g: '', m: [['sparkle', '#C9A94E']], p: ['zumrut', 'lacivert', 'krem'], k: 'eğitim talebe öğrenci kurs ilim burs okul kitap ranza yurt kira medrese',
      t: ['İlimle daha aydınlık yarınlara', 'Talebe-i ulûm', 'Eğitime destek'], h: ['Bir İlim Yuvasına Siz de Destek Olun', 'Ranza Projesi', 'Bir Talebenin Yetişmesine Katkı'], s: ['Orta Amerika’da ilim tahsil eden talebelerimizin eğitim gördüğü kursumuzun açık kalmasına destek olabilirsiniz.', 'Öğrencilerimizin daha konforlu ve güvenli bir ortamda eğitim alabilmesi için desteğinize ihtiyacımız var.', 'Bir talebenin yetişmesinde nice emek ve fedakârlık var.'], sc: ['hayra vesile olan, hayrı yapan gibidir', 'Desteğiniz için teşekkür ederiz', 'ilim yolunda'], b: ['Destek ol', 'Bağış yap'], f: [['Eğitime destek', 'Geleceğe yatırım', 'Birlikte güçlüyüz']],
      it: [['Aylık kira bedeli', '2.000 USD'], ['1 Destek hissesi', '100 USD'], ['1 Ranza bedeli', '₺12.500']] }),
    bagis: C('Bağış · Genel', { art: 'su', g: '', m: [['sparkle', '#FFFFFF']], p: ['lacivert', 'zumrut', 'turkuaz'], k: 'bağış yardım hayır sadaka zekat fitre su kuyusu dernek vakıf gönüllü destek',
      t: ['İyilik hareketi', 'Hayırlı haftalar', 'Birlikte daha güçlüyüz'], h: ['Yardımlarınız Birer Umut Olsun', 'Mutluluk Paylaştıkça Çoğalır', 'Bu İyiliğe Ortak Olur musunuz?'], s: ['Küçük bir katkı, büyük bir değişim sağlar.', 'Desteğinizle bir ailenin hayatına dokunun.', 'Bağışlarınız ihtiyaç sahiplerine ulaştırılır.'], sc: ['iyilik her zaman bir kapı açar', 'umut olun', 'paylaş'], b: ['Bağış yap', 'Destek ol'], f: [['Güvenilir', 'Şeffaf', 'Raporlanır']],
      it: [['1 Hisse bedeli', '₺2.500'], ['Tam bedel', '₺12.500']] }),
  });
  Object.assign(ART2CAT, { koli: 'ramazan', koyun: 'kurban', asure: 'asure', kitap: 'egitim', su: 'bagis' });

  // metinden kategori: ürün adı, dosya adı, açıklama
  const norm = (s) => String(s || '').toLocaleLowerCase('tr-TR').replace(/[_\-.]+/g, ' ');
  function classifyText(s) {
    const t = ' ' + norm(s) + ' ';
    let best = null, bs = 0;
    Object.entries(CATS).forEach(([k, c]) => {
      if (!c.k) return;
      let sc = 0; c.k.split(' ').forEach((w) => { if (w.length > 2 && t.includes(w)) sc += w.length > 5 ? 2 : 1; });
      if (sc > bs) { bs = sc; best = k; }
    });
    return best;
  }
  // görselden kaba tahmin: renk dağılımı ve biçim (yapay zekâ yokken). Güven düşükse 'genel'.
  function guessImage(src) {
    return new Promise((res) => {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const n = 64, cv = document.createElement('canvas'); cv.width = n; cv.height = n; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, n, n);
          const px = x.getImageData(0, 0, n, n).data; let cnt = 0, minx = n, maxx = 0, miny = n, maxy = 0; const hb = new Array(12).fill(0); let dark = 0, light = 0, sat = 0;
          for (let i = 0; i < n * n; i++) {
            const a = px[i * 4 + 3]; if (a < 128) continue;
            const r = px[i * 4] / 255, g = px[i * 4 + 1] / 255, b = px[i * 4 + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
            let h = 0; if (mx !== mn) { const d = mx - mn; h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
            cnt++; const X = i % n, Y = (i / n) | 0; minx = Math.min(minx, X); maxx = Math.max(maxx, X); miny = Math.min(miny, Y); maxy = Math.max(maxy, Y);
            if (l < 0.22) dark++; if (l > 0.82) light++; if (s > 0.35 && l > 0.15 && l < 0.85) { hb[Math.floor(h / 30) % 12]++; sat++; }
          }
          if (!cnt) return res({ cat: 'genel', conf: 0 });
          const ar = (maxx - minx + 1) / (maxy - miny + 1), fr = (k) => hb[k] / cnt, brown = (fr(0) + fr(1)) * (dark / cnt > 0.15 ? 1.3 : 1);
          const red = fr(0) + fr(11), orange = fr(1), yellow = fr(2), green = fr(3) + fr(4), blue = fr(6) + fr(7), pink = fr(10) + fr(11) * 0.5;
          let cat = 'genel', conf = 0.2;
          if (sat / cnt < 0.15) { cat = light / cnt > 0.4 ? 'kozmetik' : 'elektronik'; conf = 0.25; }
          else if (green > 0.35) { cat = 'salata'; conf = 0.4; }
          else if (yellow + orange > 0.45 && ar < 0.75) { cat = 'zeytinyagi'; conf = 0.3; }
          else if (yellow + orange > 0.45) { cat = 'bal'; conf = 0.3; }
          else if (brown > 0.4 && dark / cnt > 0.25) { cat = 'kahve'; conf = 0.35; }
          else if (red + orange > 0.4 && ar > 1.05) { cat = 'pizza'; conf = 0.3; }
          else if (orange + red > 0.35) { cat = 'burger'; conf = 0.3; }
          else if (pink > 0.25) { cat = 'tatli'; conf = 0.3; }
          else if (blue > 0.3) { cat = 'icecek'; conf = 0.25; }
          res({ cat, conf });
        } catch (e) { res({ cat: 'genel', conf: 0 }); }
      };
      im.onerror = () => res({ cat: 'genel', conf: 0 });
      im.src = src;
    });
  }
  // kategoriye göre şablon içeriği (şablonun fiyat / indirim / büyük yazı alanları korunur)
  function contentFor(cat, base, idx = 0, texts = null) {
    const c = CATS[cat]; if (!c) return base;
    const pick = (a, d) => (a && a.length ? a[idx % a.length] : d);
    const f = Object.assign({}, base);
    if (base.tag != null) f.tag = (texts && texts.tag) || pick(c.t, base.tag);
    f.title = (texts && (texts.title || texts.name)) || pick(c.h, base.title);
    if (base.sub != null) f.sub = (texts && texts.sub) || pick(c.s, base.sub);
    if (base.script != null) f.script = (texts && texts.script) || pick(c.sc, base.script);
    if (base.cta != null) f.cta = (texts && texts.cta) || pick(c.b, base.cta);
    if (base.feats) f.feats = (texts && texts.feats && texts.feats.length >= 2 ? texts.feats : pick(c.f, base.feats)).slice(0, base.feats.length);
    if (base.items && c.it) f.items = c.it.slice(0, base.items.length).map((r, i) => (base.items[i] && base.items[i].length > 2 && !r[2] ? [r[0], r[1], ''] : r));
    return f;
  }
  // çizgi desen: kategoriye uygun ince çizimler kanvasa serpiştirilir
  const DOOD = {
    leaf: 'M20 80C20 40 50 15 85 15C85 50 60 80 20 80ZM20 80L60 40',
    pear: 'M50 15C46 22 47 30 50 34C38 40 36 52 30 62C24 76 34 90 50 90C66 90 76 76 70 62C64 52 62 40 50 34M50 15L58 8',
    carrot: 'M30 85L75 35C80 30 76 22 70 24L22 78ZM70 24L78 10M74 28L90 22M40 64L46 70M52 52L58 58',
    fish: 'M15 50C35 25 65 25 80 50C65 75 35 75 15 50ZM80 50L92 36V64ZM30 46A3 3 0 1 0 30.1 46',
    avocado: 'M50 10C30 10 22 40 22 60C22 80 36 92 50 92C64 92 78 80 78 60C78 40 70 10 50 10ZM50 50A12 14 0 1 0 50.1 50',
    cup: 'M22 38H72V62C72 78 60 88 47 88C34 88 22 78 22 62ZM72 44H80C88 44 88 60 80 60H72M38 10C34 18 44 22 40 30M52 10C48 18 58 22 54 30',
    croissant: 'M10 60C20 40 40 30 50 30C60 30 80 40 90 60C80 66 70 58 62 62C56 66 44 66 38 62C30 58 20 66 10 60ZM38 34L42 62M62 34L58 62',
    slice: 'M15 20L85 30L40 90ZM30 34A4 4 0 1 0 30.1 34M48 44A5 5 0 1 0 48.1 44M40 62A4 4 0 1 0 40.1 62',
    cupcake: 'M26 50H74L66 88H34ZM22 50C22 30 40 22 50 22C60 22 78 30 78 50M50 22C46 14 54 8 50 4M40 50L44 88M60 50L56 88',
    star: 'M50 10L60 40H90L66 58L75 88L50 70L25 88L34 58L10 40H40Z',
    heart: 'M50 86C20 64 10 48 10 34C10 20 22 12 32 12C40 12 46 16 50 24C54 16 60 12 68 12C78 12 90 20 90 34C90 48 80 64 50 86Z',
    bag: 'M20 34H80L74 90H26ZM36 34V26C36 10 64 10 64 26V34',
    bottle: 'M42 8H58V24C66 30 68 38 68 48V88H32V48C32 38 34 30 42 24ZM32 56H68',
    wheat: 'M50 92V20M50 30C40 26 38 18 40 12C46 14 50 22 50 30C50 22 54 14 60 12C62 18 60 26 50 30M50 48C40 44 38 36 40 30M50 48C60 44 62 36 60 30M50 66C40 62 38 54 40 48M50 66C60 62 62 54 60 48',
    moon: 'M62 12C40 16 26 34 26 54C26 76 44 92 66 90C52 82 44 68 44 52C44 36 50 22 62 12Z',
  };
  const DSET = { kahve: ['cup', 'leaf', 'croissant', 'star'], pizza: ['slice', 'leaf', 'star', 'fish'], burger: ['slice', 'carrot', 'leaf', 'star'], tatli: ['cupcake', 'heart', 'star', 'leaf'], salata: ['carrot', 'pear', 'avocado', 'leaf', 'fish'], meyve: ['pear', 'carrot', 'avocado', 'leaf'], firin: ['croissant', 'wheat', 'cup', 'leaf'], kahvalti: ['cup', 'croissant', 'avocado', 'leaf'], bagis: ['heart', 'moon', 'star', 'bag'], genel: ['bag', 'star', 'heart', 'leaf'] };
  function doodles(W, H, color, cat) {
    const set = DSET[cat] || ['pear', 'carrot', 'leaf', 'cup', 'avocado', 'fish'];
    const m = Math.max(W, H), s = m / 9; let o = '', k = 0, seed = 7;
    const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = -s * 0.3; y < H + s; y += s * 1.15) for (let x = ((k % 2) * s) / 2 - s * 0.3; x < W + s; x += s * 1.25) {
      const d = DOOD[set[k++ % set.length]];
      o += `<path d="${d}" transform="translate(${(x + r() * s * 0.2).toFixed(0)} ${(y + r() * s * 0.2).toFixed(0)}) rotate(${(r() * 50 - 25).toFixed(0)} ${(s * 0.4).toFixed(0)} ${(s * 0.4).toFixed(0)}) scale(${(s * 0.0085).toFixed(3)})"/>`;
    }
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g fill="none" stroke="${color}" stroke-width="${(2.6).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">${o}</g></svg>`);
  }
  // bulut gibi eriyen kenar maskesi (beyaz = görünür); fotoğraf değişse de kenarlar aynı kalır
  let cloudM = null;
  function cloudMask() {
    if (cloudM) return cloudM;
    cloudM = enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="800" height="600" preserveAspectRatio="none"><defs><filter id="d" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="4" seed="7"/><feDisplacementMap in="SourceGraphic" scale="46"/><feGaussianBlur stdDeviation="14"/></filter><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff"/><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="400" height="300" fill="#000"/><g filter="url(#d)"><rect x="10" y="20" width="380" height="250" fill="url(#v)"/></g></svg>`);
    return cloudM;
  }
  window.FoodTheme = { ICON_NAMES, cloudMask, doodles, DOOD, cart, CART, icon, ICON, night, garland, crescent, mist, girih, brushHeart, SPR, sprite, texture, CATS, ART2CAT, classifyText, guessImage, contentFor, enc };
})();
