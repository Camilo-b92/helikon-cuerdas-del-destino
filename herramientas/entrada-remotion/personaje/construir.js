const fs = require('fs');
const path = require('path');

const ENTRADA = path.join(__dirname, 'esqueleto.json');
const SALIDA = path.join(__dirname, '..', '..', '..', 'comic', 'assets', 'entrada', 'caminante.json');

const base = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
const por = {};
base.capas.forEach((c) => { por[c.i] = c; });

const PIEL = 'rgb(222,168,126)';
const NARIZ = 'rgb(203,141,102)';
const PELO = 'rgb(38,30,36)';
const PELO_LUZ = 'rgb(96,80,100)';
const RUANA = 'rgb(171,59,47)';
const RUANA_OSC = 'rgb(122,36,32)';
const CREMA = 'rgb(238,217,166)';
const OCRE = 'rgb(214,161,64)';
const TINTA = 'rgb(52,38,40)';
const JEAN = 'rgb(58,75,112)';
const JEAN_CLARO = 'rgb(104,124,160)';
const BOTA = 'rgb(224,178,52)';
const TURQUESA = 'rgb(44,150,140)';
const LABIO = 'rgb(176,62,64)';
const RUBOR = 'rgb(214,102,92)';
const ORO = 'rgb(226,184,70)';

const COLORES = {
  'rgb(254,233,195)': PIEL,
  'rgb(253,217,170)': NARIZ,
  'rgb(229,161,127)': RUANA,
  'rgb(163,95,61)': PELO,
  'rgb(94,132,85)': JEAN,
  'rgb(85,111,124)': BOTA
};

function recolorar(x) {
  return x.replace(/rgb\((\d+),(\d+),(\d+)\)/g, (m) => COLORES[m] || m);
}

function traslacion(x) {
  const m = x.match(/^<g[^>]*transform="matrix\(([^)]*)\)"/);
  const v = m[1].split(',').map(Number);
  return [v[4], v[5]];
}

function primerTrazo(x) {
  const m = x.match(/<path fill="[^"]*" d="([^"]*)"/);
  return m[1];
}

function recorte(id, capa, x) {
  const t = traslacion(x);
  return '<clipPath id="' + id + '"><path transform="translate(' + t[0] + ' ' + t[1] + ')" d="' + primerTrazo(x) + '"/></clipPath>';
}

function bandas(id, capa, x, lista, extra) {
  const ancho = 40;
  let s = recorte(id, capa, x) + '<g clip-path="url(#' + id + ')">';
  lista.forEach((b) => {
    s += '<rect x="-10" y="' + b[0] + '" width="' + ancho + '" height="' + (b[1] - b[0]) + '" fill="' + b[2] + '"/>';
  });
  s += (extra || '') + '</g>';
  return s;
}

function envolver(i, partes) {
  return '<g>' + partes + '</g>';
}

function aCapa(i, svg) {
  const l = por[i].l;
  return '<g transform="translate(' + (-l[4]) + ' ' + (-l[5]) + ')">' + svg + '</g>';
}

const CONTORNO = 'stroke="rgb(0,0,0)" stroke-width="0.15" stroke-linejoin="round" stroke-linecap="round"';

const PEINADO = 'M-3.2,16.2 C-5.6,11 -4.2,2.4 3.2,-1.8 C8.2,-4.4 17.6,-5.2 23,-2.4 C28.2,0.2 30,6.4 29.2,12.9 C28.8,14.2 27.6,14.1 27.2,12.8 C26.6,10.9 25.6,9.4 24.2,8.5 C22.2,9.6 20,9.6 18.2,8.4 C16,9.6 13.6,9.7 11.8,8.5 C9.6,9.6 7,9.8 5.2,10.8 C3.6,12 2.4,13.8 1.9,15.8 C0.6,17.1 -2,17.4 -3.6,16.2Z';

function pelo() {
  const luz = '<path d="M5,-0.6 C9.6,-3.8 16.4,-4.4 21.4,-2.4" fill="none" stroke="' + PELO_LUZ + '" stroke-width="1" stroke-linecap="round"/>' +
    '<path d="M-1.4,9 C-2,5.6 -0.6,2.8 1.6,0.8" fill="none" stroke="' + PELO_LUZ + '" stroke-width="0.7" stroke-linecap="round"/>';
  const raya = '<path d="M16.2,-5.8 C16.2,-0.6 17,4.4 18.4,8.4" fill="none" stroke="rgb(8,6,8)" stroke-width="0.32" stroke-linecap="round"/>';
  let flor = '';
  for (let k = 0; k < 6; k++) {
    const an = k * Math.PI / 3;
    flor += '<circle cx="' + (6.2 + Math.cos(an) * 1.55).toFixed(2) + '" cy="' + (1.6 + Math.sin(an) * 1.55).toFixed(2) + '" r="1.15" fill="' + (k % 2 ? CREMA : OCRE) + '" ' + CONTORNO + '/>';
  }
  flor += '<circle cx="6.2" cy="1.6" r="0.95" fill="' + RUANA + '" ' + CONTORNO + '/>';
  const s =
    '<clipPath id="kpelo"><path d="' + PEINADO + '"/></clipPath>' +
    '<path d="' + PEINADO + '" fill="' + PELO + '"/>' +
    '<g clip-path="url(#kpelo)">' + luz + '</g>' + raya +
    '<path d="' + PEINADO + '" fill="none" ' + CONTORNO + '/>' + flor;
  return aCapa(4, s);
}

function trenza() {
  const pts = [[3.2, 24.6], [1.2, 28.8], [-1.6, 33.4], [-3.8, 38.6], [-5.2, 44.2], [-5.8, 49.8], [-5.6, 55]];
  let s = '<path d="M3.2,23.6 C1.6,27 -1,31 -3,35.6 C-4.8,40 -5.8,45 -5.8,50 C-5.8,52.6 -5.6,54 -5.4,56" fill="none" stroke="' + PELO + '" stroke-width="5.2" stroke-linecap="round"/>';
  for (let k = 0; k < pts.length; k++) {
    const c = pts[k];
    const w = 3.4 - k * 0.22;
    const giro = k % 2 ? 26 : -26;
    s += '<ellipse cx="' + c[0].toFixed(2) + '" cy="' + c[1].toFixed(2) + '" rx="' + w.toFixed(2) + '" ry="3.6" transform="rotate(' + giro + ' ' + c[0].toFixed(2) + ' ' + c[1].toFixed(2) + ')" fill="' + PELO + '" ' + CONTORNO + '/>';
    s += '<path d="M' + (c[0] - w * 0.5).toFixed(2) + ',' + (c[1] - 1.2).toFixed(2) + ' Q' + c[0].toFixed(2) + ',' + (c[1] - 2.3).toFixed(2) + ' ' + (c[0] + w * 0.5).toFixed(2) + ',' + (c[1] - 1).toFixed(2) + '" fill="none" stroke="' + PELO_LUZ + '" stroke-width="0.5" stroke-linecap="round" transform="rotate(' + giro + ' ' + c[0].toFixed(2) + ' ' + c[1].toFixed(2) + ')"/>';
  }
  s += '<path d="M-8.2,57.4 L-3.2,57.4 L-3.8,61.2 L-7.4,61.2Z" fill="' + PELO + '" ' + CONTORNO + '/>';
  s += '<rect x="-8.4" y="55.6" width="5.6" height="2.1" rx="0.7" fill="' + RUANA + '" ' + CONTORNO + '/>';
  s += '<rect x="0.4" y="22.4" width="6.6" height="2.3" rx="0.8" fill="' + RUANA + '" ' + CONTORNO + '/>';
  s += '<path d="M2.2,23 L2.6,24.2 M4.4,22.8 L4.8,24.2" stroke="' + CREMA + '" stroke-width="0.4" stroke-linecap="round"/>';
  return aCapa(30, s);
}

function ruana() {
  const forma = 'M5,1 C7.6,-0.2 12.4,-0.2 14.8,1 C17.4,1.4 20.2,2.6 21,5.2 C22,10 22.7,19 23.2,26.4 Q9.8,28.2 -3.6,26.4 C-3.2,19 -2.3,10 -0.4,5.4 C0.6,2.6 2.4,1.6 5,1Z';
  let s = '<clipPath id="kruana"><path d="' + forma + '"/></clipPath>';
  s += '<path d="' + forma + '" fill="' + RUANA + '"/>';
  s += '<g clip-path="url(#kruana)">';
  s += '<path d="M-4,8 C4,11 14,11.4 24,8.6 L24,13.4 C14,16 4,15.6 -4,12.6Z" fill="' + RUANA_OSC + '" opacity="0.28"/>';
  s += '<rect x="-5" y="18.2" width="30" height="0.7" fill="' + TINTA + '"/>';
  s += '<rect x="-5" y="19.3" width="30" height="1.9" fill="' + CREMA + '"/>';
  s += '<rect x="-5" y="21.7" width="30" height="0.7" fill="' + TINTA + '"/>';
  s += '<rect x="-5" y="23" width="30" height="2" fill="' + OCRE + '"/>';
  s += '<rect x="-5" y="25.2" width="30" height="0.6" fill="' + TINTA + '"/>';
  s += '<path d="M14.6,1.2 C15.6,9 16.6,18 17.4,27" fill="none" stroke="' + RUANA_OSC + '" stroke-width="0.45"/>';
  s += '</g>';
  s += '<path d="M5.2,1 Q9.9,5 14.6,1 Q9.9,0.2 5.2,1Z" fill="' + RUANA_OSC + '" ' + CONTORNO + '/>';
  for (let k = 0; k < 24; k++) {
    const x = -3.2 + k * 1.1;
    const yb = 26.4 + 1.8 * (1 - Math.pow((x - 9.8) / 13.4, 2)) * 0.9;
    s += '<path d="M' + x.toFixed(2) + ',' + (yb - 0.2).toFixed(2) + ' L' + (x + 0.1).toFixed(2) + ',' + (yb + 2.4).toFixed(2) + '" stroke="' + (k % 2 ? CREMA : OCRE) + '" stroke-width="0.5" stroke-linecap="round"/>';
  }
  s += '<path d="' + forma + '" fill="none" ' + CONTORNO + '/>';
  return s;
}

function mangaRuana(i) {
  const x = recolorar(por[i].x);
  const id = 'kmg' + i;
  const franja = bandas(id, i, x, [[11.2, 12.8, CREMA], [12.8, 13.3, TINTA], [13.3, 14.6, OCRE]]);
  return x + franja;
}

function antebrazo(i) {
  const x = recolorar(por[i].x);
  const id = 'kab' + i;
  return x + bandas(id, i, x, [[8.1, 9.5, TURQUESA]]);
}

function pantalon(i, puño) {
  const x = recolorar(por[i].x).split(PIEL).join(JEAN);
  if (!puño) return x;
  const id = 'kpn' + i;
  return x + bandas(id, i, x, [[5, 5.5, TINTA], [5.5, 7.6, JEAN_CLARO], [7.6, 8.1, TINTA]]);
}

function cabeza() {
  const x = recolorar(por[18].x);
  const rubor = '<ellipse cx="6.6" cy="22.6" rx="2.6" ry="1.5" fill="' + RUBOR + '" opacity="0.42"/>' +
    '<ellipse cx="24.6" cy="23" rx="2.4" ry="1.5" fill="' + RUBOR + '" opacity="0.42"/>';
  return x + rubor;
}

function oreja() {
  const x = recolorar(por[19].x);
  const l = por[19].l;
  const arete = '<g transform="translate(' + (-l[4]) + ' ' + (-l[5]) + ')">' +
    '<circle cx="0.6" cy="21.6" r="1.25" fill="none" stroke="' + ORO + '" stroke-width="0.55"/>' +
    '<circle cx="0.6" cy="20.4" r="0.45" fill="' + ORO + '"/></g>';
  return x + arete;
}

function cejas(i) {
  const x = por[i].x.replace(/rgb\(163,95,61\)/g, 'rgb(20,14,18)');
  return x;
}

function bocaCerrada() {
  const s = '<path d="M14,25.4 Q17.9,27.8 22.2,25.2 Q18.2,26.1 14,25.4Z" fill="' + LABIO + '" stroke="rgb(0,0,0)" stroke-width="0.18" stroke-linejoin="round"/>' +
    '<path d="M13.6,25.5 Q12.9,25.1 12.6,24.5 M22.5,25.1 Q23.3,24.8 23.6,24.2" fill="none" stroke="rgb(0,0,0)" stroke-width="0.2" stroke-linecap="round"/>';
  return aCapa(16, s);
}

function bota(i) {
  return recolorar(por[i].x);
}

const nuevo = {};
Object.keys(por).forEach((k) => { nuevo[k] = recolorar(por[k].x); });
nuevo[4] = pelo();
nuevo[30] = trenza();
nuevo[15] = ruana();
nuevo[8] = mangaRuana(8);
nuevo[25] = mangaRuana(25);
nuevo[9] = antebrazo(9);
nuevo[27] = antebrazo(27);
nuevo[22] = pantalon(22, true);
nuevo[29] = pantalon(29, true);
nuevo[18] = cabeza();
nuevo[19] = oreja();
nuevo[16] = bocaCerrada();
nuevo[6] = cejas(6);
nuevo[5] = cejas(5);
nuevo[10] = bota(10);
nuevo[24] = bota(24);

const capas = base.capas.map((c) => {
  const o = {};
  Object.keys(c).forEach((k) => { o[k] = c[k]; });
  o.x = nuevo[c.i];
  return o;
});

const salida = {
  origen: base.origen,
  vista: base.vista,
  capas: capas,
  boca: base.boca
};

fs.writeFileSync(SALIDA, JSON.stringify(salida));
console.log('caminante.json', fs.statSync(SALIDA).size, 'bytes');
