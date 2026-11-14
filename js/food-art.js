/* Tasarım Stüdyosu — gıda yer tutucu çizimleri (özgün SVG, telifsiz).
   Saydam zeminli; kendi fotoğrafını “Görseli değiştir” ile koyana dek tasarımın nasıl duracağını gösterir. */
(function () {
  'use strict';
  const S = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs>${defs}</defs>${body}</svg>`;
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ART = {};

  ART.burger = () => {
    const r = rnd(7); let seeds = '';
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI, rr = 60 + r() * 190, x = 400 + Math.cos(a) * rr * 1.05, y = 300 - Math.sin(a) * rr * 0.62; if (y > 200 && y < 370) seeds += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="9" ry="5" transform="rotate(${(r() * 160 - 80).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="#FFF3D1"/>`; }
    let lettuce = 'M118 402'; for (let i = 0; i <= 14; i++) { const x = 118 + i * 40; lettuce += ` Q${x + 20} ${i % 2 ? 452 : 434} ${x + 40} 418`; } lettuce += ' L678 392 L122 392 Z';
    return S(`<path d="M138 562 Q132 662 230 668 L570 668 Q668 662 662 562 Z" fill="url(#bb)"/>
      <path d="M108 478 Q96 556 176 566 L624 566 Q704 556 692 478 Q690 440 616 436 L184 436 Q110 440 108 478Z" fill="url(#pt)"/>
      <path d="M150 470 Q400 486 650 470" stroke="#2A140B" stroke-width="6" fill="none" opacity=".35"/>
      <path d="M116 432 L684 432 L668 466 L618 530 L590 470 L486 508 L452 466 L346 532 L312 470 L214 512 L170 466Z" fill="url(#ch)"/>
      <path d="M134 404 Q400 382 666 404 L664 438 Q400 456 136 438Z" fill="#E1342B"/><path d="M160 408 Q400 392 640 408" stroke="#FF7A6E" stroke-width="6" fill="none" opacity=".6"/>
      <path d="${lettuce}" fill="#5DB33E"/><path d="${lettuce}" fill="none" stroke="#3D8A27" stroke-width="5" opacity=".7"/>
      <path d="M116 392 Q114 168 400 150 Q686 168 684 392 Q684 414 652 416 L148 416 Q116 414 116 392Z" fill="url(#bn)"/>
      <path d="M116 392 Q114 168 400 150 Q686 168 684 392 Q684 414 652 416 L148 416 Q116 414 116 392Z" fill="url(#bh)"/>${seeds}`,
    lg('bn', [[0, '#F7BF6A'], [0.6, '#DC8E2E'], [1, '#B8661B']]) + rg('bh', [[0, '#FFE6B3', 0.85], [1, '#FFE6B3', 0]], 0.36, 0.22, 0.55) + lg('pt', [[0, '#7A4128'], [1, '#3B1C10']]) + lg('ch', [[0, '#FFD54A'], [1, '#F2A900']]) + lg('bb', [[0, '#E9A24D'], [1, '#B86C22']]));
  };
  ART.pizza = () => {
    const r = rnd(11); let top = '';
    const blob = (x, y, s) => { let d = ''; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = s * (0.75 + r() * 0.45); d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(0) + ' ' + (y + Math.sin(a) * rr).toFixed(0); } return d + 'Z'; };
    for (let i = 0; i < 22; i++) { const a = r() * 6.28, rr = r() * 230; top += `<path d="${blob(400 + Math.cos(a) * rr, 400 + Math.sin(a) * rr, 32 + r() * 26)}" fill="#FCE29A" opacity=".95"/>`; }
    [[300, 300], [500, 290], [420, 430], [270, 470], [540, 480], [380, 560], [560, 370], [250, 380], [460, 330]].forEach(([x, y]) => { top += `<circle cx="${x}" cy="${y}" r="38" fill="url(#pp)"/>` + [0, 1, 2].map((k) => `<circle cx="${x - 12 + k * 12}" cy="${y - 8 + (k % 2) * 16}" r="4" fill="#7A160F" opacity=".6"/>`).join(''); });
    [[350, 380, 20], [480, 410, -30], [320, 540, 60], [520, 300, 10]].forEach(([x, y, a]) => { top += `<path d="M${x} ${y} q30 -34 64 0 q-30 34 -64 0z" fill="#2F8F3A" transform="rotate(${a} ${x} ${y})"/><path d="M${x + 4} ${y} h56" stroke="#1E6B28" stroke-width="3" transform="rotate(${a} ${x} ${y})"/>`; });
    [[430, 250], [300, 420], [600, 440], [450, 600]].forEach(([x, y]) => { top += `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="#1C1C1C" stroke-width="9"/>`; });
    const cuts = [0, 60, 120].map((a) => `<path d="M400 120 L400 680" stroke="#B0631F" stroke-width="4" opacity=".35" transform="rotate(${a} 400 400)"/>`).join('');
    return S(`<circle cx="400" cy="400" r="300" fill="url(#cr)"/><circle cx="400" cy="400" r="262" fill="#C7361F"/><circle cx="400" cy="400" r="262" fill="url(#sc)"/>${top}${cuts}`,
      rg('cr', [[0.82, '#F0B76A'], [0.93, '#D98B37'], [1, '#B46720']]) + rg('sc', [[0, '#E2452A', 0], [1, '#8F1F12', 0.45]]) + rg('pp', [[0, '#D8402F'], [1, '#9C1E15']], 0.4, 0.35, 0.65));
  };
  ART.coffee = () => S(`<ellipse cx="400" cy="430" rx="300" ry="292" fill="url(#sa)"/><ellipse cx="400" cy="430" rx="230" ry="224" fill="#E9E4DD"/>
      <rect x="590" y="360" width="150" height="70" rx="35" fill="#F7F4EF" stroke="#DDD6CC" stroke-width="6" transform="rotate(-18 600 400)"/>
      <circle cx="400" cy="410" r="196" fill="#FBF9F6"/><circle cx="400" cy="410" r="196" fill="none" stroke="#E2DCD3" stroke-width="8"/>
      <circle cx="400" cy="412" r="168" fill="url(#cf)"/><circle cx="400" cy="412" r="168" fill="none" stroke="#C58B55" stroke-width="16" opacity=".75"/>
      <path d="M400 498 C 300 430, 318 352, 372 352 C 392 352, 400 368, 400 380 C 400 368, 408 352, 428 352 C 482 352, 500 430, 400 498Z" fill="#F3E3C8"/>
      <path d="M400 470 C 344 432, 352 386, 380 384 M400 470 C 456 432, 448 386, 420 384" stroke="#D8B48A" stroke-width="5" fill="none" opacity=".7"/>
      ${[[150, 690, 20], [660, 160, -40], [120, 200, 70]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="26" ry="18" fill="#4A2A17"/><path d="M${x - 22} ${y} q22 -8 44 0" stroke="#2A160B" stroke-width="4" fill="none"/></g>`).join('')}`,
    rg('sa', [[0.85, '#F4F0EA'], [1, '#D9D2C7']]) + rg('cf', [[0, '#8A5634'], [0.7, '#5B341D'], [1, '#3A2112']], 0.45, 0.4, 0.6));
  ART.cake = () => S(`<path d="M150 500 L560 300 L680 420 L680 560 L270 690 L150 640 Z" fill="url(#side)"/>
      <path d="M150 640 L270 690 L680 560 L680 600 L270 730 L150 680Z" fill="#A86A33"/><path d="M150 640 L270 690 L270 730 L150 680Z" fill="#8A5326"/>
      <path d="M150 500 L560 300 L680 420 L270 560 Z" fill="url(#top)"/>
      <path d="M150 500 L270 560 L270 690 L150 640Z" fill="#F3E2BF"/>
      <path d="M200 500 Q260 470 330 488 Q420 460 520 380 Q600 350 640 420 L620 470 Q600 520 580 460 Q540 470 520 500 Q500 560 470 520 Q400 540 380 560 Q350 620 330 560 Q260 580 240 540 Q200 600 196 540Z" fill="url(#sauce)"/>
      ${[[420, 430, 30], [500, 400, 26], [360, 470, 24], [560, 410, 22], [460, 455, 20]].map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s}" fill="url(#berry)"/><circle cx="${x - s * 0.3}" cy="${y - s * 0.35}" r="${s * 0.22}" fill="#fff" opacity=".55"/>`).join('')}
      <path d="M520 360 q30 -50 74 -30 q-20 46 -74 30z" fill="#3BA55C"/><path d="M522 360 l66 -26" stroke="#24733D" stroke-width="4"/>`,
    lg('side', [[0, '#FFF3D6'], [1, '#EBD3A6']], 1, 0) + lg('top', [[0, '#FFF7E3'], [1, '#F1DDB2']]) + lg('sauce', [[0, '#D3213B'], [1, '#8E0F24']]) + rg('berry', [[0, '#E0344F'], [1, '#7E0B21']], 0.4, 0.35, 0.65));
  ART.salad = () => {
    const r = rnd(5); let g = '';
    for (let i = 0; i < 26; i++) { const a = r() * 6.28, rr = r() * 190, x = 400 + Math.cos(a) * rr, y = 400 + Math.sin(a) * rr, rot = r() * 360, s = 60 + r() * 50, c = ['#4FA83D', '#6CC04A', '#3B8A2E', '#8FD26A', '#7A2E5C'][i % 5]; g += `<path d="M${x} ${y} q${s / 2} -${s / 2.4} ${s} 0 q-${s / 2} ${s / 2.4} -${s} 0z" fill="${c}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
    [[330, 330], [480, 360], [400, 480], [300, 470], [520, 470]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="30" fill="url(#tm)"/><path d="M${x - 6} ${y - 30} l6 8 l6 -8" stroke="#2E7D32" stroke-width="5" fill="none"/>`; });
    [[420, 290], [270, 380], [560, 400], [430, 400]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="34" fill="#DDEFC7" stroke="#5E9E3A" stroke-width="7"/><circle cx="${x}" cy="${y}" r="12" fill="#C9E3A8"/>`; });
    [[360, 420], [470, 430], [350, 530]].forEach(([x, y], i) => { g += `<rect x="${x}" y="${y}" width="40" height="40" rx="6" fill="#FFFDF7" transform="rotate(${i * 20} ${x} ${y})"/>`; });
    return S(`<circle cx="400" cy="400" r="320" fill="url(#bw)"/><circle cx="400" cy="400" r="270" fill="#F4F1EB"/>${g}`, rg('bw', [[0.83, '#FFFFFF'], [0.95, '#E8E3DA'], [1, '#CFC7BB']]) + rg('tm', [[0, '#FF5A4A'], [1, '#C21E15']], 0.38, 0.35, 0.7));
  };
  ART.honey = () => S(`<rect x="230" y="250" width="340" height="470" rx="70" fill="url(#hn)"/><rect x="230" y="250" width="340" height="470" rx="70" fill="url(#gl)"/>
      <rect x="250" y="190" width="300" height="80" rx="18" fill="url(#lid)"/>
      <path d="M220 200 Q400 120 580 200 L600 250 Q400 200 200 250Z" fill="#C8322E"/><path d="M240 200 Q400 140 560 200" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="14 14" fill="none" opacity=".8"/>
      <ellipse cx="400" cy="500" rx="130" ry="110" fill="#FFF6E2"/><ellipse cx="400" cy="500" rx="116" ry="96" fill="none" stroke="#C88A1C" stroke-width="5"/>
      <path d="M360 470 l40 -24 l40 24 v46 l-40 24 l-40 -24z" fill="none" stroke="#C88A1C" stroke-width="7"/><path d="M370 548 h60" stroke="#C88A1C" stroke-width="7" stroke-linecap="round"/>
      <rect x="268" y="290" width="26" height="380" rx="13" fill="#FFF" opacity=".35"/>`,
    lg('hn', [[0, '#F8B23A'], [0.6, '#E08A12'], [1, '#B4640A']]) + lg('gl', [[0, '#000', 0.2], [0.18, '#000', 0], [0.82, '#000', 0], [1, '#000', 0.25]], 1, 0) + lg('lid', [[0, '#E9C46A'], [1, '#B4862E']]));
  ART.oil = () => S(`<rect x="360" y="70" width="80" height="80" rx="12" fill="#1F1F1F"/><rect x="370" y="140" width="60" height="70" fill="#2E4A16"/>
      <path d="M370 200 Q370 260 300 300 L300 700 Q300 740 340 740 L460 740 Q500 740 500 700 L500 300 Q430 260 430 200Z" fill="url(#bt)"/>
      <rect x="318" y="430" width="164" height="210" rx="10" fill="#F6EFDC"/><path d="M400 470 q-40 40 -10 100 M400 520 q30 -30 50 -10 M395 545 q-40 -10 -50 10" stroke="#5B7B3A" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="380" cy="490" rx="10" ry="16" fill="#2E4A16"/><ellipse cx="420" cy="560" rx="10" ry="16" fill="#2E4A16"/><path d="M340 600 h120" stroke="#C8A24A" stroke-width="5"/>
      <rect x="318" y="320" width="18" height="380" rx="9" fill="#fff" opacity=".28"/>`,
    lg('bt', [[0, '#2F4A14'], [0.45, '#7EA341'], [1, '#253C0F']], 1, 0));
  ART.croissant = () => {
    let segs = ''; const n = 7;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), x = 160 + t * 480, w = 120 - Math.abs(t - 0.5) * 140, h = 190 - Math.abs(t - 0.5) * 210, y = 420 - Math.sin(t * Math.PI) * 70; segs += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(w / 1.4).toFixed(0)}" ry="${(h / 2).toFixed(0)}" fill="url(#cs)" transform="rotate(${((t - 0.5) * 70).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/><path d="M${(x - w / 3).toFixed(0)} ${(y - h / 3).toFixed(0)} q${(w / 3).toFixed(0)} ${(h / 3).toFixed(0)} 0 ${(h / 1.5).toFixed(0)}" stroke="#9A5418" stroke-width="5" fill="none" opacity=".45"/>`; }
    return S(segs, rg('cs', [[0, '#FFD08A'], [0.6, '#E39B3E'], [1, '#B36518']], 0.4, 0.3, 0.7));
  };
  ART.icecream = () => S(`<path d="M300 420 L400 760 L500 420Z" fill="url(#cn)"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${300 + i * 25} 420 L${420 + i * 20} 720" stroke="#B87A35" stroke-width="5" opacity=".6"/><path d="M${500 - i * 25} 420 L${380 - i * 20} 720" stroke="#B87A35" stroke-width="5" opacity=".6"/>`).join('')}
      <circle cx="400" cy="400" r="120" fill="url(#s1)"/><path d="M290 420 q20 60 40 10 q20 70 50 0 q25 50 50 0 q30 60 50 -5 q20 40 30 -10" fill="#F8D7DF"/>
      <circle cx="400" cy="250" r="110" fill="url(#s2)"/><path d="M300 270 q20 50 40 5 q25 60 50 0 q25 45 50 0 q25 55 50 -5" fill="#6B3A22" opacity=".9"/>
      <circle cx="400" cy="140" r="26" fill="#D3213B"/><path d="M400 116 q10 -30 30 -40" stroke="#2E7D32" stroke-width="6" fill="none"/>
      <circle cx="360" cy="360" r="20" fill="#fff" opacity=".35"/><circle cx="365" cy="215" r="18" fill="#fff" opacity=".3"/>`,
    lg('cn', [[0, '#E9B26A'], [1, '#C17E35']]) + rg('s1', [[0, '#FFE3EA'], [1, '#F2A7B8']], 0.4, 0.35, 0.7) + rg('s2', [[0, '#A0643C'], [1, '#5B3019']], 0.4, 0.35, 0.7));
  ART.soup = () => S(`<circle cx="400" cy="400" r="320" fill="url(#bw2)"/><circle cx="400" cy="400" r="262" fill="url(#sp)"/>
      <path d="M260 380 C 320 300, 470 300, 520 390 C 560 470, 450 520, 400 470 C 360 430, 420 400, 450 420" stroke="#FFE7B0" stroke-width="12" fill="none" opacity=".75" stroke-linecap="round"/>
      ${[[330, 470], [470, 330], [520, 470], [300, 330]].map(([x, y], i) => `<path d="M${x} ${y} q18 -22 36 0 q-18 22 -36 0z" fill="#2F8F3A" transform="rotate(${i * 50} ${x} ${y})"/>`).join('')}
      ${[[380, 300], [460, 520], [300, 410]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#7A1B10"/>`).join('')}
      <circle cx="610" cy="620" r="70" fill="#F7E04B"/><circle cx="610" cy="620" r="58" fill="#FFF3A6"/>${[0, 60, 120].map((a) => `<path d="M610 562 L610 678" stroke="#F2D23A" stroke-width="5" transform="rotate(${a} 610 620)"/>`).join('')}`,
    rg('bw2', [[0.8, '#FFFFFF'], [0.95, '#E7E1D6'], [1, '#CEC6B8']]) + rg('sp', [[0, '#F59E2E'], [0.7, '#E2731B'], [1, '#B4520F']], 0.45, 0.4, 0.65));
  ART.lemonade = () => S(`<path d="M260 180 L300 720 Q302 744 330 744 L470 744 Q498 744 500 720 L540 180Z" fill="url(#gls)"/>
      <path d="M272 300 L304 712 Q306 732 330 732 L470 732 Q494 732 496 712 L528 300Z" fill="url(#lm)"/>
      ${[[340, 360, 15], [430, 420, -10], [360, 500, 25], [450, 560, 5]].map(([x, y, a]) => `<rect x="${x}" y="${y}" width="70" height="70" rx="10" fill="#fff" opacity=".45" transform="rotate(${a} ${x} ${y})"/>`).join('')}
      <rect x="430" y="70" width="22" height="420" rx="11" fill="#fff" transform="rotate(14 440 280)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="430" y="${90 + i * 60}" width="22" height="26" fill="#E8577A" transform="rotate(14 440 280)"/>`).join('')}
      <circle cx="270" cy="200" r="80" fill="#F7D51E"/><circle cx="270" cy="200" r="66" fill="#FFF2A0"/>${[0, 45, 90, 135].map((a) => `<path d="M270 136 L270 264" stroke="#F2CB1D" stroke-width="5" transform="rotate(${a} 270 200)"/>`).join('')}
      <path d="M520 180 q40 -60 90 -40 q-30 60 -90 40z" fill="#3BA55C"/>`,
    lg('gls', [[0, '#FFFFFF', 0.55], [1, '#E6F4F7', 0.75]], 1, 0) + lg('lm', [[0, '#FFE66B'], [1, '#F6B91A']]));
  ART.breakfast = () => S(`<circle cx="400" cy="400" r="330" fill="url(#pl)"/><circle cx="400" cy="400" r="280" fill="#FBF9F5"/>
      <path d="M250 260 q60 -70 130 -20 q70 30 30 100 q-40 70 -120 40 q-80 -40 -40 -120z" fill="#FFFFFF" stroke="#EEE7DB" stroke-width="4"/><circle cx="330" cy="300" r="42" fill="url(#yk)"/>
      <path d="M420 430 q70 -50 130 0 q50 60 -10 110 q-70 40 -120 -20 q-40 -50 0 -90z" fill="#FFFFFF" stroke="#EEE7DB" stroke-width="4"/><circle cx="485" cy="480" r="40" fill="url(#yk)"/>
      ${[[520, 260], [580, 330]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="52" fill="#E0342B"/><circle cx="${x}" cy="${y}" r="38" fill="#F25C4E"/>${[0, 120, 240].map((a) => `<ellipse cx="${x}" cy="${y - 20}" rx="8" ry="14" fill="#FFD7A6" transform="rotate(${a} ${x} ${y})"/>`).join('')}`).join('')}
      ${[[260, 470], [300, 520], [250, 540], [330, 480]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="26" fill="#1F2318"/><ellipse cx="${x - 6}" cy="${y - 8}" rx="5" ry="7" fill="#fff" opacity=".35"/>`).join('')}
      <path d="M330 560 l120 -20 l20 80 l-120 20z" fill="#FFF7DE" stroke="#EADBB0" stroke-width="4"/>
      ${[[200, 360], [220, 410]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="34" fill="#DDEFC7" stroke="#5E9E3A" stroke-width="7"/>`).join('')}`,
    rg('pl', [[0.85, '#FFFFFF'], [0.96, '#E7E1D6'], [1, '#CFC7BB']]) + rg('yk', [[0, '#FFC21A'], [1, '#F08A00']], 0.4, 0.35, 0.7));
  ART.simit = () => {
    let seeds = ''; const r = rnd(3);
    for (let i = 0; i < 110; i++) { const a = r() * 6.28, rr = 175 + (r() - 0.5) * 150; const x = 400 + Math.cos(a) * rr, y = 400 + Math.sin(a) * rr * 0.92; seeds += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="7" ry="4" fill="#FFF1D0" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
    const ring = 'M110 400a290 268 0 1 0 580 0a290 268 0 1 0 -580 0Z M290 400a110 100 0 1 1 220 0a110 100 0 1 1 -220 0Z';
    return S(`<path d="${ring}" fill-rule="evenodd" fill="url(#sm)"/><path d="${ring}" fill-rule="evenodd" fill="url(#smh)"/>${seeds}`, rg('sm', [[0.35, '#8E440F'], [0.62, '#D9893B'], [1, '#8E440F']]) + rg('smh', [[0, '#FFE2A8', 0.5], [1, '#FFE2A8', 0]], 0.35, 0.3, 0.5));
  };
  // Ürünlere göre listeler
  ART.LIST = ['burger', 'pizza', 'coffee', 'cake', 'salad', 'honey', 'oil', 'croissant', 'icecream', 'soup', 'lemonade', 'breakfast', 'simit'];
  ART.url = (k) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[k]());
  window.FoodArt = ART;
})();
