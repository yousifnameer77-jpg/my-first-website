/* ============ إعدادات المحل — غيّرها حسب محلك ============ */
const CONFIG = {
  shop: 'بتلات',
  whatsapp: '9647700000000',   // رقم الواتساب بصيغة دولية بدون + (مثال: 9647701234567)
  phoneDisplay: '0770 000 0000',
  currency: 'د.ع',
  freeShipOver: 150000,
  fillerPrice: 8000,
  wrapPrice: 5000,
  formEndpoint: ''             // اختياري: رابط يستقبل الطلب كـ JSON (Formspree / Google Apps Script ...)
};

const AREAS = [
  ['الكرادة', 4000], ['المنصور', 4000], ['الجادرية', 5000], ['الحارثية', 4000], ['اليرموك', 4000],
  ['زيونة', 4000], ['الأعظمية', 5000], ['الكاظمية', 6000], ['الغزالية', 5000], ['السيدية', 6000],
  ['الدورة', 6000], ['البياع', 6000], ['العامرية', 5000], ['الشعب', 6000], ['مدينة الصدر', 7000],
  ['أخرى (نتواصل لتحديد السعر)', 8000]
];
const SLOTS = ['صباحاً (9 – 12)', 'ظهراً (12 – 4)', 'مساءً (4 – 9)'];
const ADDONS = [
  { id: 'a1', name: 'شوكولاتة فاخرة', price: 15000, ic: 'choc' },
  { id: 'a2', name: 'دبدوب صغير', price: 20000, ic: 'bear' },
  { id: 'a3', name: 'بالون هدية', price: 8000, ic: 'balloon' },
  { id: 'a4', name: 'عطر مصغّر', price: 25000, ic: 'scent' }
];

/* ============ أدوات ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => Number(n).toLocaleString('en-US') + ' ' + CONFIG.currency;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };

function shade(hex, amt) {
  if (hex.length === 4) hex = '#' + hex.slice(1).replace(/./g, '$&$&');
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt) / 100;
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ============ أيقونات (خطّية، مرسومة بالكود) ============ */
const ICONS = {
  truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h4.2l3.3 3.3v3.2h-7.5"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  leaf: '<path d="M5 19.5C4 10 10 4 20 4c.5 10-5 16-15 15.5z"/><path d="M5 19.5 14 10.5"/>',
  gift: '<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v7.5h14V13M12 9v11.5"/><path d="M12 9C9.5 9 8 7.700 8 6.200 8 4.800 9 4 10.200 4 11.500 4 12 6 12 9zm0 0c2.500 0 4-1.300 4-2.800C16 4.800 15 4 13.800 4 12.500 4 12 6 12 9z"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.7"/><path d="M6 12h.01M18 12h.01"/>',
  heart: '<path d="M12 20.500S4 16 3 10.500C2.500 7.500 4.500 5 7.300 5c1.900 0 3.500 1 4.700 2.800C13.200 6 14.800 5 16.700 5 19.500 5 21.500 7.500 21 10.500c-1 5.500-9 10-9 10z"/>',
  ring: '<circle cx="12" cy="15" r="5.500"/><path d="m8.500 5.500 1.800-2.500h3.400l1.800 2.500-3.500 3.500z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500V5M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 2.800 2.800 5.800 6.300.9-4.600 4.400 1.100 6.300L12 17.200l-5.600 3 1.100-6.300L2.900 9.500l6.300-.9z"/>',
  choc: '<rect x="5" y="3" width="14" height="18" rx="2.500"/><path d="M5 9h14M5 15h14M12 3v18"/>',
  bear: '<circle cx="12" cy="13.500" r="6.500"/><circle cx="6.200" cy="6.800" r="2.300"/><circle cx="17.800" cy="6.800" r="2.300"/><path d="M9.700 12.500h.01M14.300 12.500h.01M10.800 15.700c.8.700 1.600.7 2.400 0"/>',
  balloon: '<ellipse cx="12" cy="9" rx="5.500" ry="6.500"/><path d="m11 15.500-1 2h4l-1-2M12 17.500c0 2 2 2 2 4"/>',
  scent: '<rect x="6.500" y="9.500" width="11" height="11.500" rx="2.500"/><path d="M10 9.500v-3h4v3M9 4h6"/>',
  bag: '<path d="M5.500 8h13l-1 12.500h-11z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  bloom: '<g fill="currentColor" stroke="none"><ellipse cx="12" cy="6.200" rx="3" ry="4.200"/><ellipse cx="12" cy="6.200" rx="3" ry="4.200" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6.200" rx="3" ry="4.200" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6.200" rx="3" ry="4.200" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6.200" rx="3" ry="4.200" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="2.400" fill="#f6c343" stroke="none"/>'
};
const icon = n => `<svg class="svg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const hydrateIcons = (root = document) => $$('i[data-i]', root).forEach(el => { el.innerHTML = icon(el.dataset.i); delete el.dataset.i; });

/* ============ رسم الورد (SVG) ============ */
const ring = (n, rx, ry, off, fill, stroke, rot = 0) => {
  let o = '';
  for (let i = 0; i < n; i++)
    o += `<ellipse cy="${-off}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width=".6" transform="rotate(${rot + i * 360 / n})"/>`;
  return o;
};
const FLOWERS = {
  rose: c => ring(8, 15, 19, 13, shade(c, -16), shade(c, -34)) + ring(6, 12, 15, 9, c, shade(c, -26), 20) +
    ring(5, 9, 11, 5.5, shade(c, 12), shade(c, -20), 10) + `<circle r="6" fill="${shade(c, -8)}"/>` +
    `<path d="M-4 0a4 4 0 0 1 8 0a2.5 2.5 0 0 1-5 0" fill="none" stroke="${shade(c, -42)}" stroke-width="1.1"/>`,
  peony: c => ring(11, 12, 17, 14, shade(c, -8), shade(c, -26)) + ring(9, 10, 14, 10, shade(c, 8), shade(c, -20), 14) +
    ring(7, 8, 11, 6, shade(c, 20), shade(c, -12), 5) + ring(5, 6, 8, 3, shade(c, 32), shade(c, -4), 25) +
    `<circle r="3.5" fill="${shade(c, 8)}"/>`,
  tulip: c => `<path d="M-3 26C-26 20-24 -8-13 -28-5 -16 0 2-3 26Z" fill="${shade(c, -14)}" stroke="${shade(c, -34)}" stroke-width=".6"/>` +
    `<path d="M3 26C26 20 24 -8 13 -28 5 -16 0 2 3 26Z" fill="${shade(c, -10)}" stroke="${shade(c, -34)}" stroke-width=".6"/>` +
    `<path d="M0 28C-16 22-15 -12 0 -34 15 -12 16 22 0 28Z" fill="${c}" stroke="${shade(c, -28)}" stroke-width=".6"/>` +
    `<path d="M0 26C-4 8-4 -10 0 -30" fill="none" stroke="${shade(c, 24)}" stroke-width="1.2" opacity=".6"/>`,
  lily: c => {
    let o = '';
    for (let i = 0; i < 6; i++)
      o += `<g transform="rotate(${i * 60})"><path d="M0 0C-11-12-8-30 0-40 8-30 11-12 0 0Z" fill="${i % 2 ? shade(c, 6) : c}" stroke="${shade(c, -26)}" stroke-width=".6"/><path d="M0 -4V-34" stroke="${shade(c, -22)}" stroke-width=".7" opacity=".6"/></g>`;
    for (let i = 0; i < 6; i++)
      o += `<g transform="rotate(${i * 60 + 30})"><path d="M0 0V-17" stroke="#7a5a2a" stroke-width="1"/><circle cy="-18" r="2.2" fill="#e0a63a"/></g>`;
    return o + `<circle r="3" fill="#b9d66c"/>`;
  },
  daisy: c => ring(14, 3.6, 15, 15, c, shade(c, -22)) + `<circle r="8" fill="#f4b928" stroke="#d99a10" stroke-width=".8"/>` +
    `<circle r="4" fill="#e09a0c"/>`
};
const FLOWER_NAMES = { rose: 'جوري', peony: 'بيوني', tulip: 'توليب', lily: 'ليلي', daisy: 'أقحوان' };
const PALETTE = {
  rose: ['#d3213f', '#f06e8f', '#fff1ec', '#f7b5c6', '#f6c343', '#8e2a8f'],
  peony: ['#f49bb4', '#fbd0dc', '#ffffff', '#d9486f', '#c98ae0'],
  tulip: ['#f2b705', '#ee5a7a', '#ffffff', '#ff7a3d', '#a65bd0', '#d3213f'],
  lily: ['#ffffff', '#ffd1e0', '#ffb04a', '#c58bf0'],
  daisy: ['#ffffff', '#ffe27a', '#ffc4d4']
};
const WRAPS = ['#f4dfd6', '#2f2a33', '#e8c4cf', '#cfe3d4', '#f6e7b4', '#b3263d'];

let UID = 0;
let HERO_SVG = '';
const POS = [[150, 92, 1.2], [100, 120, 1.05], [200, 120, 1.05], [150, 150, 1.15], [62, 165, .95], [238, 165, .95],
  [108, 190, 1.05], [192, 190, 1.05], [150, 208, 1], [72, 208, .8], [228, 208, .8]];
const SP = [[150, 50], [118, 62], [182, 62], [84, 100], [216, 100], [58, 140], [242, 140], [96, 158], [204, 158]];

function bouquet({ items, wrap = '#f4dfd6', ribbon = '#b3263d', filler = true, label = 'باقة ورد' }) {
  const id = 'g' + (++UID);
  const its = items.slice(0, POS.length), n = its.length;
  const k = n <= 3 ? 1.35 : n <= 5 ? 1.15 : 1;
  const pos = n <= 3 ? [[150, 150, 1.3], [105, 175, 1.05], [195, 175, 1.05]].slice(0, n) : POS.slice(0, n);
  let s = `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}"><defs>` +
    `<filter id="${id}s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.8" flood-color="#3b0d19" flood-opacity=".38"/></filter><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${shade(wrap, -10)}"/><stop offset=".5" stop-color="${shade(wrap, 12)}"/><stop offset="1" stop-color="${shade(wrap, -16)}"/></linearGradient></defs>`;
  s += `<ellipse cx="150" cy="370" rx="64" ry="7" fill="#000" opacity=".13"/>`;
  // ورق أخضر
  const leaf = (x, y, r, sc) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${sc})"><path d="M0 0C-16-18-14-52 0-70 14-52 16-18 0 0Z" fill="#3f7a4a"/><path d="M0 -4V-62" stroke="#2c5a36" stroke-width="1.5"/></g>`;
  s += leaf(150, 270, -62, 1.05) + leaf(150, 270, 62, 1.05) + leaf(150, 272, -34, 1.2) + leaf(150, 272, 34, 1.2) + leaf(150, 274, 0, 1.15);
  // سيقان
  pos.forEach(p => { s += `<path d="M${p[0]} ${p[1]}Q${(p[0] + 150) / 2} ${(p[1] + 280) / 2} 150 290" stroke="#3f7a4a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`; });
  // بيبي بريث
  if (filler) SP.forEach(([x, y], i) => {
    s += `<path d="M${x} ${y + 12}Q${(x + 150) / 2} ${(y + 280) / 2} 150 290" stroke="#6d9a63" stroke-width="1.6" fill="none"/>`;
    for (let j = 0; j < 7; j++) {
      const a = j * 2.4 + i, rr = 5 + (j % 3) * 4;
      s += `<circle cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" r="${2.2 + (j % 2)}" fill="#fff" stroke="#e7dff0" stroke-width=".5"/>`;
    }
  });
  // الزهور
  const order = pos.map((p, i) => ({ p, it: its[i], i })).sort((a, b) => a.p[1] - b.p[1]);
  order.forEach(({ p, it, i }) => {
    s += `<g filter="url(#${id}s)" transform="translate(${p[0]} ${p[1]}) rotate(${(i * 37) % 50 - 25}) scale(${(p[2] * k * .88).toFixed(2)})">${FLOWERS[it.t](it.c)}</g>`;
  });
  // التغليف
  s += `<path d="M66 248C110 236 190 236 234 248L172 374H128Z" fill="url(#${id})" stroke="${shade(wrap, -26)}" stroke-width="1"/>` +
    `<path d="M66 248L150 300 234 248" fill="none" stroke="${shade(wrap, -22)}" stroke-width="1" opacity=".7"/>` +
    `<path d="M150 300L138 374M150 300L162 374" stroke="${shade(wrap, -22)}" stroke-width="1" opacity=".5"/>` +
    `<path d="M66 248C110 236 190 236 234 248L222 270C190 258 110 258 78 270Z" fill="${shade(wrap, 8)}" opacity=".75"/>`;
  // شريط
  s += `<path d="M96 292C130 298 170 298 204 292L200 308C170 314 130 314 100 308Z" fill="${ribbon}"/>` +
    `<ellipse cx="124" cy="304" rx="22" ry="12" transform="rotate(-18 124 304)" fill="${shade(ribbon, 8)}"/><ellipse cx="176" cy="304" rx="22" ry="12" transform="rotate(18 176 304)" fill="${shade(ribbon, 8)}"/>` +
    `<circle cx="150" cy="303" r="8" fill="${shade(ribbon, -14)}"/>` +
    `<path d="M144 310L132 346M156 310L168 346" stroke="${ribbon}" stroke-width="5" stroke-linecap="round"/>`;
  return s + '</svg>';
}
const mix = (list, counts) => { const a = []; list.forEach((t, i) => { for (let j = 0; j < counts[i]; j++) a.push(t); }); return a; };
const R = c => ({ t: 'rose', c }), P = c => ({ t: 'peony', c }), T = c => ({ t: 'tulip', c }), L = c => ({ t: 'lily', c }), D = c => ({ t: 'daisy', c });

/* ============ المنتجات ============ */
const PRODUCTS = [
  { id: 1, name: 'ملكة الجوري', cat: 'جوري', price: 65000, badge: 'الأكثر طلباً', bg: ['#ffe3e8', '#ffc2cf'], items: [R('#d3213f'), R('#d3213f'), R('#c21a38'), R('#d3213f'), R('#e0415a'), R('#d3213f'), R('#c21a38'), R('#d3213f'), R('#e0415a')], wrap: '#f4dfd6', ribbon: '#8e1a2f', stems: 25, desc: '٢٥ وردة جوري أحمر مخملي بتغليف كلاسيكي وشريط ساتان.' },
  { id: 2, name: 'غيمة وردية', cat: 'هدايا', price: 85000, bg: ['#fff0f4', '#fbd0dc'], items: [P('#f49bb4'), P('#fbd0dc'), P('#f49bb4'), P('#fff'), P('#f49bb4'), P('#fbd0dc'), P('#f49bb4')], wrap: '#e8c4cf', ribbon: '#d9486f', stems: 15, desc: 'بيوني وردي ناعم، حالم وفخم. مناسب للمناسبات الخاصة.' },
  { id: 3, name: 'نقاء', cat: 'زفاف', price: 70000, bg: ['#f6f6fb', '#e3e1f2'], items: [L('#fff'), R('#fff1ec'), L('#fff'), R('#fff1ec'), L('#fff'), R('#fff1ec'), L('#fff'), R('#fff1ec')], wrap: '#f4dfd6', ribbon: '#a7a0c9', stems: 18, desc: 'ليلي وجوري أبيض بأناقة هادئة، يليق بالأفراح والخطوبة.' },
  { id: 4, name: 'شروق التوليب', cat: 'ربيعية', price: 55000, bg: ['#fff7d9', '#ffe08a'], items: [T('#f2b705'), T('#ee5a7a'), T('#f2b705'), T('#ff7a3d'), T('#ee5a7a'), T('#f2b705'), T('#ff7a3d')], wrap: '#cfe3d4', ribbon: '#41703f', stems: 20, desc: 'توليب بألوان الربيع المبهجة، يضوّي الصباح.' },
  { id: 5, name: 'حب أبدي', cat: 'جوري', price: 150000, badge: 'فاخرة', gold: true, bg: ['#ffd7de', '#f08ba0'], items: mix([R('#c21a38'), R('#d3213f'), R('#e0415a')], [4, 4, 3]), wrap: '#2f2a33', ribbon: '#c9a24b', stems: 50, desc: '٥٠ وردة جوري أحمر بتغليف أسود فخم وشريط ذهبي. الهدية الأقوى.' },
  { id: 6, name: 'حديقة ربيع', cat: 'ربيعية', price: 45000, bg: ['#eaf7e1', '#c9e8b0'], items: [D('#fff'), T('#ee5a7a'), D('#fff'), D('#ffc4d4'), T('#f2b705'), D('#fff'), D('#ffc4d4')], wrap: '#f6e7b4', ribbon: '#41703f', stems: 20, desc: 'أقحوان وتوليب بتنسيق عفوي مليان حياة.' },
  { id: 7, name: 'رومانسية', cat: 'جوري', price: 40000, bg: ['#ffe9f0', '#fdc6d6'], items: mix([R('#f06e8f'), R('#f7b5c6')], [3, 2]), wrap: '#e8c4cf', ribbon: '#b8324f', stems: 12, desc: '١٢ وردة جوري زهري بتدرجات حلوة، بسيطة وأنيقة.' },
  { id: 8, name: 'لمسة ذهبية', cat: 'هدايا', price: 50000, bg: ['#fff4cf', '#f9dd85'], items: [R('#f6c343'), D('#fff'), R('#f6c343'), D('#ffe27a'), R('#f6c343'), D('#fff'), R('#f6c343')], wrap: '#f6e7b4', ribbon: '#b88a1c', stems: 16, desc: 'جوري أصفر وأقحوان، طاقة إيجابية وفرحة.' },
  { id: 9, name: 'مسكة العروس', cat: 'زفاف', price: 180000, badge: 'للعروس', gold: true, bg: ['#fff', '#f3e3ea'], items: [P('#fff'), R('#fff1ec'), P('#fbd0dc'), R('#fff1ec'), P('#fff'), R('#fff1ec'), P('#fbd0dc'), P('#fff'), R('#fff1ec')], wrap: '#fff8f3', ribbon: '#c9a24b', stems: 30, desc: 'مسكة عروس بيوني وجوري أبيض بتنسيق ناعم وشريط لؤلؤي.' },
  { id: 10, name: 'مولودنا الجديد', cat: 'هدايا', price: 60000, bg: ['#e6f3fb', '#cfe5f4'], items: [R('#f7b5c6'), D('#fff'), R('#f7b5c6'), D('#fff'), T('#fff'), D('#fff'), R('#f7b5c6')], wrap: '#dbeaf3', ribbon: '#6fa6c8', stems: 18, desc: 'باقة ناعمة بألوان الباستيل لاستقبال مولود جديد.' },
  { id: 11, name: 'شكراً من القلب', cat: 'ربيعية', price: 30000, bg: ['#fdeee2', '#fbd5b8'], items: [T('#ff7a3d'), D('#fff'), T('#f2b705')], wrap: '#f4dfd6', ribbon: '#d86a2a', stems: 8, desc: 'باقة صغيرة وجميلة تقول شكراً بأحلى طريقة.' },
  { id: 12, name: 'بنفسج الفخامة', cat: 'هدايا', price: 75000, bg: ['#f1e6fb', '#d9bff0'], items: [L('#c58bf0'), R('#8e2a8f'), L('#c58bf0'), R('#8e2a8f'), L('#fff'), R('#8e2a8f'), L('#c58bf0')], wrap: '#2f2a33', ribbon: '#9a5cc4', stems: 18, desc: 'ليلي بنفسجي وجوري عنابي لمن يحب الأناقة المختلفة.' }
];
const SIZES = [{ k: 's', n: 'صغيرة', m: .75 }, { k: 'm', n: 'وسط', m: 1 }, { k: 'l', n: 'كبيرة', m: 1.4 }];
const CATS = ['الكل', 'جوري', 'زفاف', 'هدايا', 'ربيعية'];
const CAT_LABEL = { 'الكل': 'الكل', 'جوري': 'باقات الجوري', 'زفاف': 'أفراح وزفاف', 'هدايا': 'هدايا ومواليد', 'ربيعية': 'ربيعية' };
const artOf = p => bouquet({ items: p.items, wrap: p.wrap, ribbon: p.ribbon, label: p.name });
/* صورة حقيقية إن وُجدت في photos/ وإلا الرسم البديل */
const media = p => `<img class="ph" data-pid="${p.id}" src="photos/${p.id}.jpg" alt="${esc(p.name)}" loading="lazy">`;
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName !== 'IMG') return;
  if (t.dataset.pid) t.outerHTML = artOf(PRODUCTS.find(x => x.id === +t.dataset.pid));
  else if (t.dataset.hero) t.outerHTML = HERO_SVG;
}, true);
const bgOf = p => `background:linear-gradient(160deg,${p.bg[0]},${p.bg[1]})`;

/* ============ الحالة ============ */
let cart = load('petals_cart', []);
let favs = load('petals_favs', []);
let cat = 'الكل';
let checkoutOpen = false;

/* ============ عرض الباقات ============ */
function renderFilters() {
  $('#filters').innerHTML = CATS.map(c => `<button role="tab" class="${c === cat ? 'on' : ''}" data-c="${c}" aria-selected="${c === cat}">${CAT_LABEL[c]}</button>`).join('');
}
function renderGrid() {
  const list = PRODUCTS.filter(p => cat === 'الكل' || p.cat === cat);
  $('#grid').innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 60}ms">
      <div class="card-art" style="${bgOf(p)}" data-open="${p.id}" tabindex="0" role="button" aria-label="تفاصيل ${esc(p.name)}">
        ${p.badge ? `<span class="badge ${p.gold ? 'gold' : ''}">${p.badge}</span>` : ''}
        ${media(p)}
        <button class="fav ${favs.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="إضافة للمفضلة"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.2 4.5 6.9 4.5c2 0 3.7 1.1 5.1 3 1.4-1.9 3.1-3 5.1-3 3.700 0 5.800 3.800 4.400 7.200C19.500 16.400 12 21 12 21Z"/></svg></button>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="card-foot"><div class="price">${fmt(p.price)}<br><small>الحجم الوسط</small></div>
        <button class="add" data-quick="${p.id}">+ أضف للسلة</button></div>
      </div>
    </article>`).join('');
}

/* ============ نافذة تفاصيل الباقة ============ */
let pm = { p: null, size: 'm' };
const sizePrice = (p, k) => Math.round(p.price * SIZES.find(s => s.k === k).m / 1000) * 1000;
function openProduct(id) {
  pm = { p: PRODUCTS.find(x => x.id === id), size: 'm' };
  renderPM(); openModal('#pModal');
}
function renderPM() {
  const { p, size } = pm;
  $('#pmArt').setAttribute('style', bgOf(p)); $('#pmArt').innerHTML = media(p);
  $('#pmInfo').innerHTML = `
    <span class="eyebrow">${CAT_LABEL[p.cat]}</span>
    <h3>${p.name}</h3><span class="price">${fmt(sizePrice(p, size))}</span>
    <p>${p.desc}</p>
    <div class="sizes">${SIZES.map(s => `<button class="${s.k === size ? 'on' : ''}" data-size="${s.k}">${s.n}<small>${fmt(sizePrice(p, s.k))}</small></button>`).join('')}</div>
    <ul><li>ورد طازج يُنسَّق لحظة الطلب</li><li>بطاقة إهداء مجانية برسالتك</li><li>صورة للباقة قبل التسليم</li></ul>
    <button class="btn btn-primary wide" id="pmAdd">أضف للسلة · ${fmt(sizePrice(p, size))}</button>`;
}

/* ============ السلة ============ */
const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
function addToCart(item) {
  const ex = cart.find(i => i.key === item.key);
  ex ? ex.qty++ : cart.push({ ...item, qty: 1 });
  persist(); toast('تمت الإضافة للسلة');
  const b = $('#openCart'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}
function persist() { save('petals_cart', cart); renderCart(); }
function renderCart() {
  $('#cartCount').textContent = cartCount();
  const box = $('#cartItems');
  if (!cart.length) {
    box.innerHTML = `<div class="empty"><span class="empty-ic">${icon('bag')}</span><h3>سلتك فارغة</h3><p>اختار باقة تفرّح قلب اللي تحبه</p></div>`;
  } else {
    box.innerHTML = cart.map(i => `
      <div class="line">
        <div class="thumb" style="${i.art ? i.art.bg : 'background:var(--blush)'}">${i.svg || '<span class="th-ic">' + icon(i.ic || 'gift') + '</span>'}</div>
        <div><h4>${esc(i.name)}</h4><small>${esc(i.meta || '')}</small>
          <div class="qty"><button data-q="${i.key}" data-d="-1" aria-label="إنقاص">−</button><span>${i.qty}</span><button data-q="${i.key}" data-d="1" aria-label="زيادة">+</button></div></div>
        <div class="lp">${fmt(i.price * i.qty)}<button class="rm" data-rm="${i.key}">حذف</button></div>
      </div>`).join('');
  }
  const sub = cartTotal();
  $('#subTotal').textContent = fmt(sub);
  const left = CONFIG.freeShipOver - sub;
  $('#shipFill').style.width = Math.min(100, sub / CONFIG.freeShipOver * 100) + '%';
  $('#shipMsg').textContent = !cart.length ? '' : left > 0 ? `باقي ${fmt(left)} ويصير التوصيل مجاني` : 'توصيلك مجاني';
  $('#toCheckout').disabled = !cart.length;
  $('#toCheckout').style.opacity = cart.length ? 1 : .5;
  $('#addons').innerHTML = cart.length ? `<h5>أضف لمسة إضافية</h5><div class="addon-row">${ADDONS.map(a => `<button class="addon" data-addon="${a.id}"><span class="ad-ic">${icon(a.ic)}</span>${a.name}<b>${fmt(a.price)}</b></button>`).join('')}</div>` : '';
  if (checkoutOpen) renderSummary();
}

/* ============ الدفع وإرسال الطلب ============ */
const area = () => AREAS[$('#fArea').selectedIndex] || AREAS[0];
const shipping = () => cartTotal() >= CONFIG.freeShipOver ? 0 : area()[1];
function renderSummary() {
  const sub = cartTotal(), sh = shipping(), tot = sub + sh;
  $('#summary').innerHTML = `<div><span>المجموع</span><span>${fmt(sub)}</span></div>
    <div><span>التوصيل</span><span>${sh ? fmt(sh) : 'مجاني'}</span></div>
    <div class="tot"><span>الإجمالي</span><span>${fmt(tot)}</span></div>`;
  $('#grandBtn').textContent = fmt(tot);
}
function setView(checkout) {
  checkoutOpen = checkout;
  $('#viewCart').hidden = checkout; $('#viewForm').hidden = !checkout;
  $('#dTitle').textContent = checkout ? 'إتمام الطلب' : 'سلتك';
  if (checkout) renderSummary();
}
function openCart() { $('#drawer').classList.add('on'); $('#overlay').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeCart() { $('#drawer').classList.remove('on'); $('#overlay').classList.remove('on'); $('#drawer').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; setTimeout(() => setView(false), 350); }

const phoneOK = v => /^(\+?964|0)?7[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ''));
const toLatin = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

function buildMessage(o) {
  const lines = [`*طلب جديد — ${CONFIG.shop}*`, `رقم الطلب: #${o.no}`, '',
    `الاسم: ${o.name}`, `الهاتف: ${o.phone}`];
  if (o.rName || o.rPhone) lines.push(`المستلم: ${o.rName || '-'} ${o.rPhone ? '(' + o.rPhone + ')' : ''}`);
  lines.push(`المنطقة: ${o.area}`, `العنوان: ${o.addr}`, `الموعد: ${o.date} · ${o.slot}`);
  if (o.msg) lines.push(`رسالة البطاقة: «${o.msg}»${o.anon ? ' (بدون ذكر اسم المرسل)' : ''}`);
  lines.push('', '*الطلبات:*');
  o.items.forEach(i => lines.push(`• ${i.name}${i.meta ? ' (' + i.meta + ')' : ''} × ${i.qty} = ${fmt(i.price * i.qty)}`));
  lines.push('', `المجموع: ${fmt(o.sub)}`, `التوصيل: ${o.ship ? fmt(o.ship) : 'مجاني'}`, `*الإجمالي: ${fmt(o.total)}*`, 'الدفع: نقداً عند الاستلام');
  return lines.join('\n');
}
const waLink = text => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

function submitOrder(e) {
  e.preventDefault();
  const v = id => toLatin($(id).value.trim());
  const err = $('#formErr'); err.textContent = '';
  $$('.bad').forEach(x => x.classList.remove('bad'));
  const fail = (id, m) => { $(id).classList.add('bad'); $(id).focus(); err.textContent = m; };
  if (!cart.length) return (err.textContent = 'السلة فارغة');
  if (v('#fName').length < 2) return fail('#fName', 'اكتب اسمك من فضلك');
  if (!phoneOK(v('#fPhone2'))) return fail('#fPhone2', 'رقم الهاتف غير صحيح (مثال: 07701234567)');
  if (v('#fRPhone') && !phoneOK(v('#fRPhone'))) return fail('#fRPhone', 'رقم هاتف المستلم غير صحيح');
  if (v('#fAddr').length < 6) return fail('#fAddr', 'اكتب العنوان بالتفصيل حتى يوصل المندوب بسهولة');
  if (!$('#fDate').value) return fail('#fDate', 'اختار تاريخ التوصيل');

  const no = Date.now().toString().slice(-6);
  const o = {
    no, name: v('#fName'), phone: v('#fPhone2'), rName: v('#fRName'), rPhone: v('#fRPhone'),
    area: area()[0], addr: v('#fAddr'), date: $('#fDate').value, slot: $('#fSlot').value,
    msg: $('#fMsg').value.trim(), anon: $('#fAnon').checked,
    items: cart.map(({ name, meta, price, qty }) => ({ name, meta, price, qty })),
    sub: cartTotal(), ship: shipping(), created: new Date().toISOString()
  };
  o.total = o.sub + o.ship;
  const text = buildMessage(o), link = waLink(text);

  save('petals_orders', [o, ...load('petals_orders', [])].slice(0, 20));
  if (CONFIG.formEndpoint) fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).catch(() => {});
  window.open(link, '_blank', 'noopener');

  $('#okNo').textContent = '#' + no; $('#okWa').href = link;
  cart = []; persist(); closeCart(); e.target.reset(); initDate();
  setTimeout(() => openModal('#okModal'), 300);
}

/* ============ النوافذ والتنبيهات ============ */
function openModal(sel) { const m = $(sel); m.classList.add('on'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
function closeModals() { $$('.modal.on').forEach(m => { m.classList.remove('on'); m.setAttribute('aria-hidden', 'true'); }); if (!$('#drawer').classList.contains('on')) document.body.style.overflow = ''; }
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

/* ============ استوديو التصميم ============ */
const B = { type: 'rose', color: '#d3213f', count: 12, wrap: '#f4dfd6', filler: true };
const STEM_PRICE = { rose: 2500, peony: 5000, tulip: 3000, lily: 4000, daisy: 1500 };
const bPrice = () => B.count * STEM_PRICE[B.type] + CONFIG.wrapPrice + (B.filler ? CONFIG.fillerPrice : 0);
function renderBuilder() {
  $('#bType').innerHTML = Object.keys(FLOWERS).map(t => `<button class="${t === B.type ? 'on' : ''}" data-t="${t}">${FLOWER_NAMES[t]}</button>`).join('');
  $('#bColor').innerHTML = PALETTE[B.type].map(c => `<button class="${c === B.color ? 'on' : ''}" data-c="${c}" style="background:${c}" aria-label="لون"></button>`).join('');
  $('#bWrap').innerHTML = WRAPS.map(c => `<button class="${c === B.wrap ? 'on' : ''}" data-w="${c}" style="background:${c}" aria-label="لون التغليف"></button>`).join('');
  $('#bCountLbl').textContent = B.count;
  drawBuilder();
}
function builderItems() {
  const n = Math.max(3, Math.min(11, Math.round(B.count / 2.2)));
  const pal = PALETTE[B.type], i0 = pal.indexOf(B.color);
  return Array.from({ length: n }, (_, i) => ({ t: B.type, c: i % 4 === 3 ? shade(B.color, i % 8 === 3 ? 14 : -10) : B.color }));
}
function drawBuilder() {
  $('#bArt').innerHTML = bouquet({ items: builderItems(), wrap: B.wrap, ribbon: shade(B.wrap, -45), filler: B.filler, label: 'باقتك المخصصة' });
  $('#bPrice').textContent = fmt(bPrice());
}

/* ============ تهيئة ============ */
function initDate() {
  const d = $('#fDate'), t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  d.min = t.toISOString().slice(0, 10); d.value = d.min;
}
function init() {
  HERO_SVG = bouquet({ items: [R('#d3213f'), P('#f49bb4'), R('#f06e8f'), P('#fff'), R('#d3213f'), T('#ee5a7a'), P('#f49bb4'), R('#fff1ec'), R('#d3213f'), T('#f2b705'), P('#fbd0dc')], wrap: '#f4dfd6', ribbon: '#8e1a2f', label: 'باقة بتلات' });
  $$('[data-free]').forEach(e => e.textContent = fmt(CONFIG.freeShipOver));
  $$('[data-filler]').forEach(e => e.textContent = fmt(CONFIG.fillerPrice));
  $('#yr').textContent = new Date().getFullYear();
  $('#fPhone').textContent = CONFIG.phoneDisplay;
  $('#fWa').href = $('#waFloat').href = waLink(`مرحباً ${CONFIG.shop}، أريد الاستفسار عن باقات الورد`);

  $('#heroArt').innerHTML = `<img class="hero-ph" data-hero="1" src="photos/hero.jpg" alt="باقة ورد">`;

  // بتلات متساقطة
  $('#petals').innerHTML = Array.from({ length: 16 }, () => {
    const s = 10 + Math.random() * 16;
    return `<span style="--s:${s}px;--d:${9 + Math.random() * 9}s;--delay:${-Math.random() * 14}s;--x:${(Math.random() * 160 - 80)}px;left:${Math.random() * 100}%"></span>`;
  }).join('');

  $('#fArea').innerHTML = AREAS.map(a => `<option>${a[0]} — ${fmt(a[1])}</option>`).join('');
  $('#fSlot').innerHTML = SLOTS.map(s => `<option>${s}</option>`).join('');
  initDate();

  renderFilters(); renderGrid(); renderCart(); renderBuilder(); hydrateIcons();

  // أحداث
  $('#filters').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; renderFilters(); renderGrid(); });
  $$('.occ-card').forEach(b => b.addEventListener('click', () => { cat = b.dataset.filter; renderFilters(); renderGrid(); $('#shop').scrollIntoView({ behavior: 'smooth' }); }));
  $('#grid').addEventListener('click', e => {
    const f = e.target.closest('[data-fav]');
    if (f) { const id = +f.dataset.fav; favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; save('petals_favs', favs); f.classList.toggle('on'); return; }
    const q = e.target.closest('[data-quick]');
    if (q) { const p = PRODUCTS.find(x => x.id === +q.dataset.quick); addToCart({ key: p.id + 'm', name: p.name, meta: 'وسط', price: p.price, svg: media(p), art: { bg: bgOf(p) } }); return; }
    const o = e.target.closest('[data-open]'); if (o) openProduct(+o.dataset.open);
  });
  $('#grid').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.open) openProduct(+e.target.dataset.open); });
  $('#pmInfo').addEventListener('click', e => {
    const s = e.target.closest('[data-size]'); if (s) { pm.size = s.dataset.size; renderPM(); return; }
    if (e.target.closest('#pmAdd')) {
      const { p, size } = pm, sz = SIZES.find(x => x.k === size);
      addToCart({ key: p.id + size, name: p.name, meta: sz.n, price: sizePrice(p, size), svg: media(p), art: { bg: bgOf(p) } });
      closeModals();
    }
  });
  $('#cartItems').addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const it = cart.find(i => i.key === q.dataset.q); it.qty += +q.dataset.d; if (it.qty < 1) cart = cart.filter(i => i !== it); persist(); }
    if (r) { cart = cart.filter(i => i.key !== r.dataset.rm); persist(); }
  });
  $('#addons').addEventListener('click', e => {
    const a = e.target.closest('[data-addon]'); if (!a) return;
    const ad = ADDONS.find(x => x.id === a.dataset.addon);
    addToCart({ key: ad.id, name: ad.name, meta: 'إضافة', price: ad.price, ic: ad.ic });
  });
  $('#openCart').onclick = openCart; $('#closeCart').onclick = closeCart; $('#overlay').onclick = closeCart;
  $('#toCheckout').onclick = () => { if (cart.length) { setView(true); $('#viewForm .d-body').scrollTop = 0; } };
  $('#backCart').onclick = () => setView(false);
  $('#fArea').onchange = renderSummary;
  $('#viewForm').addEventListener('submit', submitOrder);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); if ($('#drawer').classList.contains('on')) closeCart(); } });
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModals(); }));

  // استوديو
  $('#bType').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b) return; B.type = b.dataset.t; B.color = PALETTE[B.type][0]; renderBuilder(); });
  $('#bColor').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; B.color = b.dataset.c; renderBuilder(); });
  $('#bWrap').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (!b) return; B.wrap = b.dataset.w; renderBuilder(); });
  $('#bCount').addEventListener('input', e => { B.count = +e.target.value; $('#bCountLbl').textContent = B.count; drawBuilder(); });
  $('#bFiller').addEventListener('change', e => { B.filler = e.target.checked; drawBuilder(); });
  $('#bAdd').onclick = () => addToCart({
    key: `custom-${B.type}-${B.color}-${B.count}-${B.wrap}-${B.filler}`, name: `باقة مخصصة · ${FLOWER_NAMES[B.type]}`,
    meta: `${B.count} غصن${B.filler ? ' + بيبي بريث' : ''}`, price: bPrice(), svg: $('#bArt').innerHTML, art: { bg: 'background:var(--blush)' }
  });

  // ظهور تدريجي + شريط التنقل
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  const onScroll = () => $('#nav').classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}
init();
