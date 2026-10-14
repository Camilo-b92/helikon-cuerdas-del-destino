const fs = require('fs');
const path = require('path');

const SALIDA = path.join(__dirname, '..', '..', '..', 'comic', 'assets', 'entrada');

const NEGRO = 'rgb(23,19,14)';
const W = 1600;
const H = 900;

function azar(semilla) {
  let s = semilla | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function n1(v) {
  return Math.round(v * 10) / 10;
}

function curva(pts, cerrada) {
  const n = pts.length;
  const p = (i) => {
    if (cerrada) return pts[((i % n) + n) % n];
    return pts[Math.max(0, Math.min(n - 1, i))];
  };
  let d = 'M' + n1(pts[0][0]) + ',' + n1(pts[0][1]);
  const tramos = cerrada ? n : n - 1;
  for (let i = 0; i < tramos; i++) {
    const a = p(i - 1);
    const b = p(i);
    const c = p(i + 1);
    const e = p(i + 2);
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ' C' + n1(c1[0]) + ',' + n1(c1[1]) + ' ' + n1(c2[0]) + ',' + n1(c2[1]) + ' ' + n1(c[0]) + ',' + n1(c[1]);
  }
  return d;
}

function yEn(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (x >= pts[i][0] && x <= pts[i + 1][0]) {
      const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      const s = t * t * (3 - 2 * t);
      return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * s;
    }
  }
  return pts[pts.length - 1][1];
}

function dentro(poligono, x, y) {
  let en = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) en = !en;
  }
  return en;
}

function mancha(cx, cy, rx, ry, rnd) {
  const pts = [];
  const k = 7;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const j = 0.7 + rnd() * 0.6;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return curva(pts, true);
}

function manchas(rnd, caja, n, colores, escala) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = caja[0] + rnd() * (caja[2] - caja[0]);
    const y = caja[1] + rnd() * (caja[3] - caja[1]);
    const rx = (14 + rnd() * 46) * escala;
    const ry = rx * (0.28 + rnd() * 0.3);
    s += '<path d="' + mancha(x, y, rx, ry, rnd) + '" fill="' + colores[Math.floor(rnd() * colores.length)] + '"/>';
  }
  return s;
}

function envolver(ancho, alto, cuerpo, defs) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ancho + ' ' + alto + '" width="' + ancho + '" height="' + alto + '">' +
    (defs ? '<defs>' + defs + '</defs>' : '') + cuerpo + '</svg>';
}

function guardar(nombre, texto) {
  fs.writeFileSync(path.join(SALIDA, nombre), texto);
  console.log(nombre, Math.round(texto.length / 1024) + ' KB');
}

function nube(id, cx, cy, esc, rnd) {
  const base = [
    [-92, 6, 30], [-52, -18, 44], [-4, -34, 54], [48, -20, 46], [92, 4, 32], [8, 4, 50]
  ].map((c) => [cx + c[0] * esc * (0.94 + rnd() * 0.12), cy + c[1] * esc, c[2] * esc * (0.94 + rnd() * 0.12)]);
  const suelo = '<rect x="' + n1(cx - 100 * esc) + '" y="' + n1(cy + 4 * esc) + '" width="' + n1(200 * esc) + '" height="' + n1(34 * esc) + '" rx="' + n1(17 * esc) + '"/>';
  const circ = base.map((c) => '<circle cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="' + n1(c[2]) + '"/>').join('');
  const forma = circ + suelo;
  return '<g>' +
    '<g fill="' + NEGRO + '" stroke="' + NEGRO + '" stroke-width="' + n1(4.2) + '" stroke-linejoin="round">' + forma + '</g>' +
    '<clipPath id="' + id + '">' + forma + '</clipPath>' +
    '<g clip-path="url(#' + id + ')">' +
    '<rect x="' + n1(cx - 130 * esc) + '" y="' + n1(cy - 100 * esc) + '" width="' + n1(260 * esc) + '" height="' + n1(180 * esc) + '" fill="rgb(247,236,204)"/>' +
    '<rect x="' + n1(cx - 130 * esc) + '" y="' + n1(cy + 12 * esc) + '" width="' + n1(260 * esc) + '" height="' + n1(60 * esc) + '" fill="rgb(236,208,160)"/>' +
    '<ellipse cx="' + n1(cx + 10 * esc) + '" cy="' + n1(cy + 12 * esc) + '" rx="' + n1(120 * esc) + '" ry="' + n1(12 * esc) + '" fill="rgb(222,186,138)" opacity="0.55"/>' +
    '</g>' +
    '<path d="M' + n1(cx - 34 * esc) + ',' + n1(cy - 38 * esc) + ' Q' + n1(cx - 8 * esc) + ',' + n1(cy - 56 * esc) + ' ' + n1(cx + 22 * esc) + ',' + n1(cy - 46 * esc) + '" fill="none" stroke="rgb(255,250,232)" stroke-width="' + n1(3.2 * esc) + '" stroke-linecap="round" opacity="0.9"/>' +
    '</g>';
}

function cielo() {
  const rnd = azar(11);
  const defs =
    '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="rgb(70,130,134)"/>' +
    '<stop offset="0.42" stop-color="rgb(128,172,152)"/>' +
    '<stop offset="0.78" stop-color="rgb(216,208,146)"/>' +
    '<stop offset="1" stop-color="rgb(244,214,150)"/>' +
    '</linearGradient>' +
    '<radialGradient id="s" cx="0.5" cy="0.5" r="0.5">' +
    '<stop offset="0" stop-color="rgb(255,240,176)" stop-opacity="0.85"/>' +
    '<stop offset="0.45" stop-color="rgb(255,226,150)" stop-opacity="0.35"/>' +
    '<stop offset="1" stop-color="rgb(255,220,140)" stop-opacity="0"/>' +
    '</radialGradient>';
  let c = '<rect width="1600" height="640" fill="url(#g)"/>';
  c += '<ellipse cx="1170" cy="380" rx="520" ry="300" fill="url(#s)"/>';
  c += '<circle cx="1170" cy="330" r="30" fill="rgb(255,244,196)" stroke="' + NEGRO + '" stroke-width="2"/>';
  const aves = [[300, 150, 1], [350, 128, 0.8], [392, 160, 0.9], [980, 110, 0.7], [1030, 96, 0.6]];
  aves.forEach((a) => {
    c += '<path d="M' + a[0] + ',' + a[1] + ' q' + n1(8 * a[2]) + ',' + n1(-9 * a[2]) + ' ' + n1(16 * a[2]) + ',0 q' + n1(8 * a[2]) + ',' + n1(-9 * a[2]) + ' ' + n1(16 * a[2]) + ',0" fill="none" stroke="' + NEGRO + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  guardar('cielo.svg', envolver(1600, 640, c, defs));
  void rnd;
}

function nubes() {
  const rnd = azar(23);
  const lista = [
    [160, 120, 0.8], [520, 250, 0.62], [760, 86, 1.05], [1130, 214, 0.74], [1420, 100, 0.86], [1700, 250, 0.66], [1880, 130, 0.78]
  ];
  let c = '';
  lista.forEach((n, i) => { c += nube('n' + i, n[0], n[1], n[2], rnd); });
  guardar('nubes.svg', envolver(2000, 360, c));
}

function palma(rnd, x, ybase, alto, inclina) {
  const wb = alto * 0.03;
  const wt = alto * 0.018;
  const top = [x + inclina, ybase - alto];
  const izq = [
    [x - wb, ybase], [x - wb * 0.86 + inclina * 0.1, ybase - alto * 0.22], [x - wt * 1.15 + inclina * 0.5, ybase - alto * 0.6], [top[0] - wt, top[1]]
  ];
  const der = [
    [top[0] + wt, top[1]], [x + wt * 1.15 + inclina * 0.5, ybase - alto * 0.6], [x + wb * 0.86 + inclina * 0.1, ybase - alto * 0.22], [x + wb, ybase]
  ];
  const contorno = curva(izq.concat(der), false) + ' Z';
  let s = '<g>';
  s += '<path d="' + contorno + '" fill="rgb(196,186,148)" stroke="' + NEGRO + '" stroke-width="2.2" stroke-linejoin="round"/>';
  const sombra = [
    [x + wb * 0.1 + inclina * 0.02, ybase], [x + inclina * 0.12, ybase - alto * 0.22], [x + inclina * 0.5, ybase - alto * 0.6], [top[0], top[1]]
  ];
  s += '<path d="' + curva(sombra.concat(der.slice().reverse()), false) + ' Z" fill="rgb(160,150,114)"/>';
  const anillos = Math.floor(alto / 17);
  for (let i = 1; i < anillos; i++) {
    const t = i / anillos;
    const y = ybase - alto * t;
    const cx = x + inclina * t * (0.6 + 0.4 * t);
    const w = wb + (wt - wb) * t;
    s += '<path d="M' + n1(cx - w) + ',' + n1(y) + ' q' + n1(w) + ',' + n1(w * 0.34) + ' ' + n1(w * 2) + ',0" fill="none" stroke="rgb(122,112,84)" stroke-width="1.3" stroke-linecap="round"/>';
  }
  const verde = [
    [top[0] - wt * 1.05, top[1]], [top[0] - wt * 1.05, top[1] + alto * 0.1], [top[0] + wt * 1.05, top[1] + alto * 0.1], [top[0] + wt * 1.05, top[1]]
  ];
  s += '<path d="M' + n1(verde[0][0]) + ',' + n1(verde[0][1]) + ' L' + n1(verde[1][0]) + ',' + n1(verde[1][1]) + ' L' + n1(verde[2][0]) + ',' + n1(verde[2][1]) + ' L' + n1(verde[3][0]) + ',' + n1(verde[3][1]) + 'Z" fill="rgb(108,140,76)" stroke="' + NEGRO + '" stroke-width="2" stroke-linejoin="round"/>';
  const cx0 = top[0];
  const cy0 = top[1] - alto * 0.02;
  const L = alto * 0.3;
  const hojas = [-172, -150, -128, -106, -84, -62, -40, -18, 6, 170];
  hojas.forEach((g, i) => {
    const a = (g * Math.PI) / 180;
    const largo = L * (0.8 + rnd() * 0.35);
    const lado = Math.cos(a) >= 0 ? 1 : -1;
    const ex = cx0 + Math.cos(a) * largo;
    const ey = cy0 + Math.sin(a) * largo * 0.55 + largo * 0.34 * Math.abs(Math.cos(a));
    const mx = cx0 + Math.cos(a) * largo * 0.55;
    const my = cy0 + Math.sin(a) * largo * 0.85 - largo * 0.18;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const ancho = largo * 0.12;
    const d = 'M' + n1(cx0) + ',' + n1(cy0) + ' Q' + n1(mx + nx * ancho) + ',' + n1(my + ny * ancho) + ' ' + n1(ex) + ',' + n1(ey) +
      ' Q' + n1(mx - nx * ancho) + ',' + n1(my - ny * ancho) + ' ' + n1(cx0) + ',' + n1(cy0) + 'Z';
    s += '<path d="' + d + '" fill="' + (i % 2 ? 'rgb(66,108,56)' : 'rgb(88,130,66)') + '" stroke="' + NEGRO + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<path d="M' + n1(cx0) + ',' + n1(cy0) + ' Q' + n1(mx) + ',' + n1(my) + ' ' + n1(ex) + ',' + n1(ey) + '" fill="none" stroke="rgb(44,76,40)" stroke-width="1.2"/>';
    void lado;
  });
  s += '<path d="M' + n1(cx0 - 4) + ',' + n1(cy0 + 6) + ' q-10,' + n1(alto * 0.07) + ' -14,' + n1(alto * 0.12) + ' M' + n1(cx0 + 4) + ',' + n1(cy0 + 6) + ' q10,' + n1(alto * 0.07) + ' 14,' + n1(alto * 0.12) + '" fill="none" stroke="rgb(104,92,62)" stroke-width="2.4" stroke-linecap="round"/>';
  s += '</g>';
  return s;
}

function guadua(rnd, x, ybase, alto) {
  let s = '<g>';
  const tallos = 7;
  for (let i = 0; i < tallos; i++) {
    const dx = (i - (tallos - 1) / 2) * 11 + (rnd() - 0.5) * 6;
    const h = alto * (0.7 + rnd() * 0.3);
    const incl = (i - (tallos - 1) / 2) * 7 + (rnd() - 0.5) * 8;
    const x0 = x + dx;
    const x1 = x0 + incl;
    const y1 = ybase - h;
    const d = 'M' + n1(x0) + ',' + n1(ybase) + ' Q' + n1((x0 + x1) / 2 + incl * 0.25) + ',' + n1(ybase - h * 0.55) + ' ' + n1(x1) + ',' + n1(y1);
    s += '<path d="' + d + '" fill="none" stroke="' + NEGRO + '" stroke-width="9" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="rgb(124,156,72)" stroke-width="6" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="rgb(158,186,98)" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.4 0)"/>';
    const nodos = Math.floor(h / 30);
    for (let k = 1; k < nodos; k++) {
      const t = k / nodos;
      const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2 + incl * 0.25) + t * t * x1;
      const py = (1 - t) * (1 - t) * ybase + 2 * (1 - t) * t * (ybase - h * 0.55) + t * t * y1;
      s += '<path d="M' + n1(px - 4.4) + ',' + n1(py) + ' L' + n1(px + 4.4) + ',' + n1(py) + '" stroke="' + NEGRO + '" stroke-width="1.6"/>';
    }
    for (let k = 0; k < 5; k++) {
      const t = 0.55 + rnd() * 0.45;
      const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2 + incl * 0.25) + t * t * x1;
      const py = (1 - t) * (1 - t) * ybase + 2 * (1 - t) * t * (ybase - h * 0.55) + t * t * y1;
      const a = (-90 + (rnd() - 0.5) * 150) * Math.PI / 180;
      const l = 28 + rnd() * 30;
      s += '<path d="M' + n1(px) + ',' + n1(py) + ' q' + n1(Math.cos(a) * l * 0.5) + ',' + n1(Math.sin(a) * l * 0.5 - 4) + ' ' + n1(Math.cos(a) * l) + ',' + n1(Math.sin(a) * l * 0.7 + 8) + ' q' + n1(-Math.cos(a) * l * 0.3) + ',-6 ' + n1(-Math.cos(a) * l) + ',' + n1(-Math.sin(a) * l * 0.7 - 8) + 'Z" fill="rgb(96,140,66)" stroke="' + NEGRO + '" stroke-width="1.2" stroke-linejoin="round"/>';
    }
  }
  s += '</g>';
  return s;
}

function lejos() {
  const rnd = azar(37);
  const A = [[0, 470], [120, 430], [260, 456], [420, 392], [560, 440], [700, 420], [860, 368], [1010, 430], [1160, 398], [1320, 442], [1460, 402], [1600, 430]];
  const B = [[0, 522], [160, 486], [330, 514], [520, 468], [700, 506], [900, 486], [1100, 450], [1280, 500], [1450, 476], [1600, 498]];
  const dA = curva(A, false) + ' L1600,900 L0,900Z';
  const dB = curva(B, false) + ' L1600,900 L0,900Z';
  const defs =
    '<clipPath id="cA"><path d="' + dA + '"/></clipPath>' +
    '<clipPath id="cB"><path d="' + dB + '"/></clipPath>' +
    '<linearGradient id="nb" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="rgb(238,232,196)" stop-opacity="0"/>' +
    '<stop offset="0.55" stop-color="rgb(238,232,196)" stop-opacity="0.55"/>' +
    '<stop offset="1" stop-color="rgb(238,232,196)" stop-opacity="0"/>' +
    '</linearGradient>' +
    '<linearGradient id="bruma" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="rgb(214,222,190)" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="rgb(214,222,190)" stop-opacity="0.55"/>' +
    '</linearGradient>';
  let c = '';
  c += '<path d="' + dA + '" fill="rgb(124,166,160)"/>';
  c += '<g clip-path="url(#cA)">' + manchas(rnd, [0, 400, 1600, 560], 26, ['rgb(108,152,150)', 'rgb(138,178,168)'], 1.2) + '</g>';
  c += '<path d="' + curva(A, false) + '" fill="none" stroke="rgb(46,78,76)" stroke-width="1.8" stroke-linejoin="round"/>';
  c += '<rect x="0" y="440" width="1600" height="100" fill="url(#nb)"/>';
  c += '<path d="' + dB + '" fill="rgb(100,144,128)"/>';
  c += '<g clip-path="url(#cB)">' + manchas(rnd, [0, 470, 1600, 700], 34, ['rgb(84,126,108)', 'rgb(116,158,136)', 'rgb(92,134,112)'], 1.1) + '</g>';
  c += '<path d="' + curva(B, false) + '" fill="none" stroke="rgb(40,64,52)" stroke-width="1.8" stroke-linejoin="round"/>';
  const lejanas = [[260, 0.34, 70], [610, 0.3, 58], [980, 0.36, 76], [1390, 0.3, 62]];
  lejanas.forEach((p) => {
    const y = yEn(B, p[0]) + 6;
    c += palma(rnd, p[0], y, p[2], 2);
  });
  c += '<rect x="0" y="520" width="1600" height="200" fill="url(#bruma)"/>';
  guardar('lejos.svg', envolver(W, H, c, defs));
}

function medio() {
  const rnd = azar(53);
  const H1 = [[0, 592], [180, 566], [380, 588], [600, 604], [820, 576], [1040, 556], [1260, 582], [1440, 566], [1600, 586]];
  const d1 = curva(H1, false) + ' L1600,900 L0,900Z';
  const defs = '<clipPath id="cH"><path d="' + d1 + '"/></clipPath>';
  let c = '';
  c += palma(rnd, 150, yEn(H1, 150) + 10, 330, -6);
  c += palma(rnd, 1015, yEn(H1, 1015) + 10, 372, 7);
  c += palma(rnd, 1335, yEn(H1, 1335) + 10, 292, -5);
  c += palma(rnd, 1500, yEn(H1, 1500) + 10, 238, 4);
  c += guadua(rnd, 1195, yEn(H1, 1195) + 14, 250);
  c += guadua(rnd, 36, yEn(H1, 36) + 14, 210);
  c += '<path d="' + d1 + '" fill="rgb(104,134,74)"/>';
  c += '<g clip-path="url(#cH)">' + manchas(rnd, [0, 560, 1600, 760], 60, ['rgb(84,112,58)', 'rgb(128,152,84)', 'rgb(96,126,66)', 'rgb(116,142,78)'], 1.4) + '</g>';
  c += '<path d="' + curva(H1, false) + '" fill="none" stroke="' + NEGRO + '" stroke-width="2" stroke-linejoin="round"/>';
  guardar('medio.svg', envolver(W, H, c, defs));
}

function piedra(rnd, x, y, r) {
  const pts = [];
  const k = 8;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const j = 0.82 + rnd() * 0.3;
    pts.push([x + Math.cos(a) * r * j, y + Math.sin(a) * r * 0.62 * j]);
  }
  const d = curva(pts, true);
  return '<g><path d="' + d + '" fill="rgb(158,152,122)" stroke="' + NEGRO + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M' + n1(x - r * 0.5) + ',' + n1(y - r * 0.12) + ' Q' + n1(x - r * 0.1) + ',' + n1(y - r * 0.5) + ' ' + n1(x + r * 0.34) + ',' + n1(y - r * 0.32) + '" fill="none" stroke="rgb(204,198,166)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M' + n1(x - r * 0.7) + ',' + n1(y + r * 0.34) + ' Q' + n1(x) + ',' + n1(y + r * 0.66) + ' ' + n1(x + r * 0.76) + ',' + n1(y + r * 0.3) + '" fill="none" stroke="rgb(114,108,84)" stroke-width="2" stroke-linecap="round"/></g>';
}

function cerca(rnd, x0, x1, y0, y1) {
  const postes = [];
  const n = Math.round((x1 - x0) / 74);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    postes.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * 8, y0 + (y1 - y0) * t + (rnd() - 0.5) * 3, 54 + rnd() * 8, (rnd() - 0.5) * 6]);
  }
  let s = '<g>';
  [0.22, 0.52].forEach((k) => {
    let d = '';
    postes.forEach((p, i) => {
      const px = p[0] + p[3] * (1 - k);
      const py = p[1] - p[2] * (1 - k * 0.2) + 6;
      if (i === 0) d += 'M' + n1(px) + ',' + n1(py);
      else {
        const q = postes[i - 1];
        const qx = q[0] + q[3] * (1 - k);
        const qy = q[1] - q[2] * (1 - k * 0.2) + 6;
        d += ' Q' + n1((px + qx) / 2) + ',' + n1((py + qy) / 2 + 5) + ' ' + n1(px) + ',' + n1(py);
      }
    });
    s += '<path d="' + d + '" fill="none" stroke="rgb(40,32,24)" stroke-width="1.6"/>';
  });
  postes.forEach((p) => {
    s += '<path d="M' + n1(p[0] - 3.4) + ',' + n1(p[1]) + ' L' + n1(p[0] - 2.8 + p[3]) + ',' + n1(p[1] - p[2]) + ' L' + n1(p[0] + 2.8 + p[3]) + ',' + n1(p[1] - p[2]) + ' L' + n1(p[0] + 3.4) + ',' + n1(p[1]) + 'Z" fill="rgb(136,98,60)" stroke="' + NEGRO + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<path d="M' + n1(p[0] - 1.4) + ',' + n1(p[1] - 2) + ' L' + n1(p[0] - 1 + p[3]) + ',' + n1(p[1] - p[2] + 2) + '" stroke="rgb(176,136,92)" stroke-width="1.2" stroke-linecap="round"/>';
  });
  s += '</g>';
  return s;
}

function plato() {
  const rnd = azar(71);
  const T = [[0, 646], [200, 630], [420, 652], [620, 666], [820, 642], [1040, 628], [1260, 646], [1440, 634], [1600, 652]];
  const dT = curva(T, false) + ' L1600,900 L0,900Z';
  const arriba = [[1600, 744], [1440, 760], [1250, 772], [1050, 774], [900, 772], [800, 774], [722, 784], [642, 806], [562, 826], [472, 846], [362, 868], [252, 890], [196, 906]];
  const abajo = [[540, 906], [622, 886], [704, 868], [784, 852], [864, 846], [1000, 850], [1200, 868], [1400, 894], [1600, 912]];
  const sendero = arriba.concat(abajo);
  const dS = curva(arriba, false) + ' ' + curva(abajo, false).replace(/^M[^C]*/, 'L' + abajo[0][0] + ',' + abajo[0][1] + ' ') + ' Z';
  const defs =
    '<clipPath id="cT"><path d="' + dT + '"/></clipPath>' +
    '<clipPath id="cS"><path d="' + dS + '"/></clipPath>' +
    '<linearGradient id="luz" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="rgb(255,214,130)" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="rgb(255,214,130)" stop-opacity="0.2"/>' +
    '</linearGradient>';
  let c = '';
  c += '<path d="' + dT + '" fill="rgb(96,126,64)"/>';
  c += '<g clip-path="url(#cT)">';
  c += manchas(rnd, [0, 640, 1600, 900], 110, ['rgb(76,104,50)', 'rgb(118,148,76)', 'rgb(88,116,58)', 'rgb(108,136,70)'], 1.6);
  c += '</g>';
  c += '<path d="' + curva(T, false) + '" fill="none" stroke="' + NEGRO + '" stroke-width="2.2" stroke-linejoin="round"/>';

  c += cerca(rnd, 836, 1560, 700, 712);

  c += '<path d="' + dS + '" fill="rgb(194,154,98)"/>';
  c += '<g clip-path="url(#cS)">';
  c += '<path d="M1600,770 C1300,790 1100,800 900,798 C780,798 700,814 620,840 C540,868 440,894 300,920" fill="none" stroke="rgb(170,130,80)" stroke-width="14" opacity="0.55"/>';
  c += '<path d="M1600,820 C1360,846 1140,846 950,830 C840,822 760,836 690,858" fill="none" stroke="rgb(164,124,76)" stroke-width="9" opacity="0.45"/>';
  for (let i = 0; i < 520; i++) {
    const x = rnd() * 1600;
    const y = 740 + rnd() * 170;
    const col = rnd() < 0.5 ? 'rgb(146,108,66)' : rnd() < 0.5 ? 'rgb(224,192,134)' : 'rgb(120,88,54)';
    c += '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="' + n1(1.4 + rnd() * 3.4) + '" ry="' + n1(0.9 + rnd() * 1.6) + '" fill="' + col + '"/>';
  }
  c += '</g>';
  c += '<path d="' + curva(arriba, false) + '" fill="none" stroke="rgb(70,48,24)" stroke-width="2.2" stroke-linejoin="round"/>';
  c += '<path d="' + curva(abajo, false) + '" fill="none" stroke="rgb(70,48,24)" stroke-width="2.2" stroke-linejoin="round"/>';

  const prohibido = (x, y) => dentro(sendero, x, y) || (x > 440 && x < 720 && y > 640 && y < 828) || (x > 1000 && x < 1800 && y > 744 && y < 880 && dentro(sendero, x, y));
  const matas = [];
  for (let i = 0; i < 260; i++) {
    const x = rnd() * 1600;
    const y = 660 + rnd() * 240;
    if (y < yEn(T, x) + 8) continue;
    if (prohibido(x, y)) continue;
    matas.push([x, y]);
  }
  matas.sort((a, b) => a[1] - b[1]);
  matas.forEach((m) => {
    const esc = 0.7 + ((m[1] - 640) / 260) * 1.1;
    const k = 3 + Math.floor(rnd() * 3);
    let d = '';
    for (let j = 0; j < k; j++) {
      const a = -90 + (j - (k - 1) / 2) * 24 + (rnd() - 0.5) * 12;
      const l = (14 + rnd() * 12) * esc;
      const ar = (a * Math.PI) / 180;
      d += 'M' + n1(m[0]) + ',' + n1(m[1]) + ' q' + n1(Math.cos(ar) * l * 0.4) + ',' + n1(Math.sin(ar) * l * 0.7) + ' ' + n1(Math.cos(ar) * l) + ',' + n1(Math.sin(ar) * l) + ' ';
    }
    c += '<path d="' + d + '" fill="none" stroke="rgb(52,78,38)" stroke-width="' + n1(2.4 * esc * 0.8) + '" stroke-linecap="round"/>';
  });
  const piedras = [[1210, 872, 22], [330, 872, 18], [930, 726, 14], [1440, 856, 26], [760, 886, 12]];
  piedras.forEach((p) => { c += piedra(rnd, p[0], p[1], p[2]); });
  const flores = [];
  for (let i = 0; i < 120; i++) {
    const x = rnd() * 1600;
    const y = 668 + rnd() * 230;
    if (y < yEn(T, x) + 10 || prohibido(x, y)) continue;
    flores.push([x, y]);
  }
  const petalos = ['rgb(236,196,58)', 'rgb(244,236,214)', 'rgb(198,66,54)', 'rgb(236,196,58)', 'rgb(226,150,170)'];
  flores.forEach((p) => {
    const esc = 0.75 + ((p[1] - 640) / 260) * 0.9;
    const col = petalos[Math.floor(rnd() * petalos.length)];
    c += '<path d="M' + n1(p[0]) + ',' + n1(p[1]) + ' l' + n1((rnd() - 0.5) * 3) + ',' + n1(-9 * esc) + '" stroke="rgb(52,78,38)" stroke-width="1.6"/>';
    c += '<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1] - 10 * esc) + '" r="' + n1(3.2 * esc) + '" fill="' + col + '" stroke="' + NEGRO + '" stroke-width="1.2"/>';
    c += '<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1] - 10 * esc) + '" r="' + n1(1 * esc) + '" fill="rgb(120,70,30)"/>';
  });
  c += '<rect x="0" y="600" width="1600" height="300" fill="url(#luz)"/>';
  guardar('plato.svg', envolver(W, H, c, defs));
}

function hoja(rnd, x, y, ang, largo, ancho, claro) {
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * largo;
  const ey = y + Math.sin(a) * largo;
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const mx = x + Math.cos(a) * largo * 0.55;
  const my = y + Math.sin(a) * largo * 0.55;
  const d = 'M' + n1(x) + ',' + n1(y) + ' C' + n1(x + Math.cos(a) * largo * 0.2 + nx * ancho * 0.9) + ',' + n1(y + Math.sin(a) * largo * 0.2 + ny * ancho * 0.9) + ' ' + n1(mx + nx * ancho * 1.1) + ',' + n1(my + ny * ancho * 1.1) + ' ' + n1(ex) + ',' + n1(ey) +
    ' C' + n1(mx - nx * ancho * 1.1) + ',' + n1(my - ny * ancho * 1.1) + ' ' + n1(x + Math.cos(a) * largo * 0.2 - nx * ancho * 0.9) + ',' + n1(y + Math.sin(a) * largo * 0.2 - ny * ancho * 0.9) + ' ' + n1(x) + ',' + n1(y) + 'Z';
  let s = '<path d="' + d + '" fill="' + (claro ? 'rgb(86,134,70)' : 'rgb(58,100,54)') + '" stroke="' + NEGRO + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="M' + n1(x) + ',' + n1(y) + ' L' + n1(ex) + ',' + n1(ey) + '" stroke="rgb(30,58,32)" stroke-width="2.2" stroke-linecap="round"/>';
  for (let k = 1; k < 6; k++) {
    const t = k / 6;
    const px = x + Math.cos(a) * largo * t;
    const py = y + Math.sin(a) * largo * t;
    const w = ancho * Math.sin(Math.PI * Math.min(1, t * 1.05)) * 0.8;
    s += '<path d="M' + n1(px) + ',' + n1(py) + ' L' + n1(px + nx * w) + ',' + n1(py + ny * w + 4) + ' M' + n1(px) + ',' + n1(py) + ' L' + n1(px - nx * w) + ',' + n1(py - ny * w + 4) + '" stroke="rgb(34,68,38)" stroke-width="1.3" stroke-linecap="round"/>';
  }
  void rnd;
  return s;
}

function frente() {
  const rnd = azar(97);
  let c = '';
  const racimo = (bx, by, hojas, escala) => {
    hojas.forEach((h, i) => {
      c += hoja(rnd, bx, by, h[0], h[1] * escala, h[2] * escala, i % 2 === 0);
    });
  };
  racimo(1570, 930, [[-120, 230, 40], [-98, 270, 44], [-78, 240, 42], [-60, 200, 38], [-142, 200, 36]], 1);
  racimo(1490, 940, [[-126, 170, 32], [-102, 190, 36]], 1);
  racimo(30, 940, [[-62, 210, 38], [-84, 250, 42], [-106, 190, 36], [-40, 160, 32]], 1);
  for (let i = 0; i < 60; i++) {
    const x = rnd() * 1600;
    const l = 30 + rnd() * 44;
    const a = (-90 + (rnd() - 0.5) * 36) * Math.PI / 180;
    c += '<path d="M' + n1(x) + ',912 q' + n1(Math.cos(a) * l * 0.3) + ',' + n1(Math.sin(a) * l * 0.6) + ' ' + n1(Math.cos(a) * l) + ',' + n1(912 + Math.sin(a) * l - 912) + '" fill="none" stroke="rgb(46,78,40)" stroke-width="3.4" stroke-linecap="round"/>';
  }
  guardar('frente.svg', envolver(W, H, c));
}

cielo();
nubes();
lejos();
medio();
plato();
frente();
