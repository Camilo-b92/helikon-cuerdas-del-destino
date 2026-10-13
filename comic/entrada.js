(function(){
  'use strict';

  const CLAVE = 'helikon-entrada';
  const CARPETA = 'assets/entrada/';
  const LIENZO = { w: 1600, h: 900 };
  const TV = { cx: 1000, cy: 475, ancho: 150, giro: -5, boton: [0.895, 0.886], proporcion: 925 / 1566 };
  const PIEZAS = {
    tocon: { x: 908, y: 530, w: 184 },
    matas: { x: 875, y: 640, w: 250 }
  };
  const FONDOS = [
    { id: 'cielo', d: 0.1 },
    { id: 'nubes', d: 0.18, deriva: 5 },
    { id: 'lejos', d: 0.36 },
    { id: 'media', d: 0.64 }
  ];
  const ALTURA = 0.7586;
  const ZANCADA = 348;
  const BRAZO = { a: 70, b: 72 };
  const VELOCIDAD = 250;
  const FRENADA = 150;

  const html = document.documentElement;
  const M = window.Movimiento;
  const tv = document.getElementById('tv');
  const pantalla = document.getElementById('tvScreen');
  const btnPower = document.getElementById('btnPower');
  const cartel = document.getElementById('tvCartel');
  const principal = document.getElementById('contenido');

  const lista = !!(M && tv && pantalla && btnPower && principal);

  let fase = 'inactiva';
  let resolver = null;
  let promesa = null;
  let encendido = false;
  let anchoInicial = 0;
  let pendienteResize = 0;

  let raiz = null;
  let fondo = null;
  let frente = null;
  let velo = null;
  let boton = null;
  let aviso = null;
  let mugre = null;
  let gsapRef = null;
  let reloj = null;
  let capas = [];
  let figura = null;
  let sombra = null;
  let estallido = null;
  let pulso = null;
  let G = null;

  function activa(si){
    html.classList.toggle('entrada-activa', si);
  }

  function liberar(){
    html.classList.remove('entrada-espera');
  }

  function yaVista(){
    if (/[?&]entrada(=|&|$)/.test(window.location.search)) return false;
    try { return window.sessionStorage.getItem(CLAVE) === '1'; } catch (e) { return false; }
  }

  function marcarVista(){
    try { window.sessionStorage.setItem(CLAVE, '1'); } catch (e) { return; }
  }

  function crear(etiqueta, clase){
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    return n;
  }

  function limitar(v, a, b){
    return Math.min(b, Math.max(a, v));
  }

  function suave(v){
    const x = limitar(v, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function mezcla(a, b, p){
    return a + (b - a) * p;
  }

  function cubica(v){
    const x = limitar(v, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function rebote(v){
    const x = limitar(v, 0, 1);
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  }

  function giro(x, y, grados){
    const r = grados * Math.PI / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [x * c - y * s, x * s + y * c];
  }

  function curva(f, claves){
    for (let i = 1; i < claves.length; i++){
      if (f <= claves[i][0]){
        const a = claves[i - 1];
        const b = claves[i];
        return mezcla(a[1], b[1], suave((f - a[0]) / (b[0] - a[0])));
      }
    }
    return claves[claves.length - 1][1];
  }

  function n3(v){
    return Math.round(v * 1000) / 1000;
  }

  function esperarTelevisor(){
    const img = tv.querySelector('.tv-frame');
    if (!img || img.complete) return Promise.resolve();
    return new Promise((ok) => {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', ok, { once: true });
      window.setTimeout(ok, 2500);
    });
  }

  function cargarTexto(nombre){
    return window.fetch(CARPETA + nombre).then((r) => {
      if (!r.ok) throw new Error(nombre);
      return r.text();
    });
  }

  function cargarImagen(nombre){
    return new Promise((ok, mal) => {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      img.addEventListener('load', () => ok(img), { once: true });
      img.addEventListener('error', () => mal(new Error(nombre)), { once: true });
      img.src = CARPETA + nombre + '.svg';
    });
  }

  function cargarFuente(){
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([
      document.fonts.load('48px Bangers').catch(() => null),
      new Promise((ok) => window.setTimeout(ok, 1800))
    ]);
  }

  function leerSVG(texto){
    const doc = new DOMParser().parseFromString(texto, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return null;
    svg.querySelectorAll('script, foreignObject, use, image, style').forEach((n) => n.remove());
    svg.querySelectorAll('*').forEach((n) => {
      Array.prototype.slice.call(n.attributes).forEach((a) => {
        if (/^on/i.test(a.name) || /href$/i.test(a.name)) n.removeAttribute(a.name);
      });
    });
    return { svg: svg, doc: doc };
  }

  function leerSenda(texto){
    const leido = leerSVG(texto);
    const trazo = leido && leido.doc.getElementById('senda');
    const d = trazo && trazo.getAttribute('d');
    if (!d) return null;
    const n = d.match(/-?\d*\.?\d+/g);
    if (!n || n.length < 8) return null;
    const puntos = [];
    for (let i = 0; i + 1 < n.length; i += 2) puntos.push([parseFloat(n[i]), parseFloat(n[i + 1])]);
    return puntos.every((p) => isFinite(p[0]) && isFinite(p[1])) ? puntos : null;
  }

  function punto(txt, otro){
    if (!txt) return otro;
    const v = txt.trim().split(/[\s,]+/).map(Number);
    return v.length === 2 && v.every(isFinite) ? v : otro;
  }

  function montarFigura(svgTexto){
    const leido = leerSVG(svgTexto);
    if (!leido) return null;
    const svg = document.importNode(leido.svg, true);
    svg.setAttribute('class', 'entrada-caminante');
    const vb = svg.viewBox.baseVal;
    const suelo = punto(svg.getAttribute('data-suelo'), [0, 210]);
    const partes = {};
    svg.querySelectorAll('[data-parte]').forEach((n) => {
      partes[n.getAttribute('data-parte')] = { el: n, pos: punto(n.getAttribute('data-pos'), [0, 0]) };
    });
    const necesarias = ['cuerpo', 'torso', 'cabeza', 'brazo-i', 'antebrazo-i', 'brazo-d', 'antebrazo-d', 'muslo-i', 'pierna-i', 'pie-i', 'muslo-d', 'pierna-d', 'pie-d'];
    if (!necesarias.every((k) => partes[k]) || !vb || !vb.width) return null;
    return {
      svg: svg,
      partes: partes,
      ancla: [-vb.x, -vb.y],
      ancho: vb.width,
      alto: vb.height,
      suelo: suelo
    };
  }

  function crearEstallido(){
    const e = crear('div', 'entrada-estallido');
    let p = '';
    const n = 16;
    for (let i = 0; i < n * 2; i++){
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 54 + (i % 4) * 2 : 37;
      p += (60 + Math.cos(a) * r * 1.1).toFixed(1) + ',' + (50 + Math.sin(a) * r * 0.92).toFixed(1) + ' ';
    }
    e.innerHTML =
      '<svg viewBox="0 0 120 100" width="120" height="100" focusable="false" aria-hidden="true">' +
      '<polygon points="' + p.trim() + '"/>' +
      '<text x="60" y="66" text-anchor="middle">&#191;?</text></svg>';
    return e;
  }

  function medirPagina(){
    tv.style.transform = '';
    tv.style.setProperty('--mugre', '0');
    const r = tv.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    return { vw: vw, vh: vh, tv: { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height } };
  }

  function calcular(pag, senda){
    const vw = pag.vw;
    const vh = pag.vh;
    const retrato = vw < vh;
    const sc = Math.max(vw / LIENZO.w, vh / LIENZO.h);
    const oy = vh - LIENZO.h * sc;
    const fx = retrato ? 0.4 : 0.58;
    const ox = limitar(vw * fx - TV.cx * sc, vw - LIENZO.w * sc, 0);
    const a1 = [ox + TV.cx * sc, oy + TV.cy * sc];
    const zmax = pag.tv.w / (TV.ancho * sc);
    const izq = -ox / sc;
    const der = (vw - ox) / sc;

    const xs = senda.map((p) => p[0]);
    const ys = senda.map((p) => p[1]);
    function yEn(x){
      if (x <= xs[0]) return ys[0];
      const n = xs.length - 1;
      if (x >= xs[n]) return ys[n];
      let a = 0;
      let b = n;
      while (b - a > 1){
        const m = (a + b) >> 1;
        if (xs[m] <= x) a = m; else b = m;
      }
      return mezcla(ys[a], ys[b], (x - xs[a]) / (xs[b] - xs[a]));
    }
    function escalaEn(y){
      return ALTURA * limitar(mezcla(0.72, 1.1, (y - 585) / 175), 0.55, 1.18);
    }

    const bx = TV.cx + (TV.boton[0] - 0.5) * TV.ancho;
    const by = TV.cy + (TV.boton[1] - 0.5) * TV.ancho * TV.proporcion;
    const bg = giro(bx - TV.cx, by - TV.cy, TV.giro);
    const boton = [TV.cx + bg[0], TV.cy + bg[1]];

    const x0 = Math.max(-90, izq - 90);
    const tvIzq = TV.cx - TV.ancho / 2;
    const x1 = Math.max(tvIzq - 120, izq + (retrato ? 70 : 160));
    const alcance = (BRAZO.a + BRAZO.b) * 0.9;
    let xF = boton[0] + 108;
    for (let i = 0; i < 6; i++){
      const yy = yEn(xF);
      const u = escalaEn(yy);
      const hombro = yy - (210 + 122) * u;
      const dy = boton[1] - hombro;
      const dx = Math.sqrt(Math.max(400, Math.pow(alcance * u, 2) - dy * dy));
      xF = boton[0] + dx;
    }
    xF = Math.min(xF, der - 50);

    const corto = retrato;
    const D = x1 - x0;
    const Dd = Math.min(FRENADA, D * 0.6);
    const tA0 = 0.4;
    const tA1 = tA0 + (D + Dd) / VELOCIDAD;
    const tB = tA1 + 0.25;
    const tC0 = tA1 + (corto ? 1.1 : 1.5);
    const tC1 = tC0 + Math.max(1.3, (xF - x1) / 165);
    const tG0 = tC1;
    const tG1 = tG0 + 0.32;
    const tR0 = tG1 + 0.3;
    const tR1 = tR0 + 0.9;
    const tZ0 = tG1 + 0.1;
    const tP0 = tR1 + 0.15;
    const tZ1 = tZ0 + (corto ? 2.6 : 3.2);
    const tFin = tZ1 + 0.5;

    const xMin = x0 - 10;
    const xMax = xF + 10;
    const paso = 4;
    const n = Math.ceil((xMax - xMin) / paso) + 1;
    const fases = new Float32Array(n);
    for (let i = 1; i < n; i++){
      const xa = xMin + (i - 1) * paso;
      const xb = xMin + i * paso;
      const ya = yEn(xa);
      const yb = yEn(xb);
      const largo = Math.hypot(xb - xa, yb - ya);
      fases[i] = fases[i - 1] + largo / (escalaEn((ya + yb) / 2) * ZANCADA);
    }
    function faseEn(x){
      const p = limitar((x - xMin) / paso, 0, n - 1);
      const i = Math.min(n - 2, Math.floor(p));
      return mezcla(fases[i], fases[i + 1], p - i);
    }

    return {
      vw: vw, vh: vh, sc: sc, ox: ox, oy: oy, a1: a1, zmax: zmax, izq: izq, der: der,
      t0: [pag.tv.cx, pag.tv.cy], tvAncho: pag.tv.w,
      yEn: yEn, escalaEn: escalaEn, faseEn: faseEn,
      boton: boton, x0: x0, x1: x1, xF: xF, D: D, Dd: Dd,
      tA0: tA0, tA1: tA1, tB: tB, tC0: tC0, tC1: tC1, tG0: tG0, tG1: tG1,
      tR0: tR0, tR1: tR1, tZ0: tZ0, tP0: tP0, tZ1: tZ1, tFin: tFin,
      corto: corto
    };
  }

  function posX(t){
    const g = G;
    if (t <= g.tA0) return g.x0;
    if (t <= g.tA1){
      const s = t - g.tA0;
      const tc = (g.D - g.Dd) / VELOCIDAD;
      if (s <= tc) return g.x0 + VELOCIDAD * s;
      const r = s - tc;
      const Td = 2 * g.Dd / VELOCIDAD;
      return g.x0 + (g.D - g.Dd) + VELOCIDAD * r - VELOCIDAD * r * r / (2 * Td);
    }
    if (t <= g.tC0) return g.x1;
    if (t <= g.tC1) return g.x1 + (g.xF - g.x1) * (0.5 - 0.5 * Math.cos(Math.PI * (t - g.tC0) / (g.tC1 - g.tC0)));
    return g.xF;
  }

  const PIE = [[0, -6], [0.12, -8], [0.28, 0], [0.5, 0], [0.74, 24], [1, -6]];

  function pata(fi, w){
    const f = fi - Math.floor(fi);
    const a = 27 * Math.sin(2 * Math.PI * f) * w;
    const rodilla = (4 + 48 * Math.pow(Math.max(0, Math.cos(2 * Math.PI * f)), 1.4)) * w;
    const punta = curva(f, PIE) * w;
    const t1 = -a;
    const t2 = t1 + rodilla;
    const p1 = giro(0, 100, t1);
    const p2 = giro(0, 92, t2);
    const ay = p1[1] + p2[1];
    const h = giro(-12, 20, punta);
    const d = giro(40, 20, punta);
    return { muslo: t1, rodilla: rodilla, pie: punta - t2, bajo: ay + Math.max(h[1], d[1]) };
  }

  function resolverBrazo(sx, sy, tx, ty){
    const vx = tx - sx;
    const vy = ty - sy;
    const d0 = Math.hypot(vx, vy) || 1;
    const d = Math.min(d0, (BRAZO.a + BRAZO.b) * 0.985);
    const k = d / d0;
    const px = sx + vx * k;
    const py = sy + vy * k;
    const c = limitar((BRAZO.a * BRAZO.a + d * d - BRAZO.b * BRAZO.b) / (2 * BRAZO.a * d), -1, 1);
    const delta = Math.acos(c) * 180 / Math.PI;
    const objetivo = Math.atan2(-(px - sx), py - sy) * 180 / Math.PI;
    const t1 = objetivo + delta;
    const codo = giro(0, BRAZO.a, t1);
    const t2 = Math.atan2(-(px - (sx + codo[0])), py - (sy + codo[1])) * 180 / Math.PI;
    return [t1, t2 - t1];
  }

  function tr(x, y, a){
    return 'translate(' + n3(x) + ' ' + n3(y) + ') rotate(' + n3(a) + ')';
  }

  function figuraEn(t){
    const g = G;
    const f = figura;
    const P = f.partes;
    const x = posX(t);
    const y = g.yEn(x);
    const U = g.escalaEn(y);
    const v = (posX(t + 0.03) - posX(t - 0.03)) / 0.06;
    const w = suave((Math.abs(v) - 8) / 110);
    const fi = g.faseEn(x);
    const ph = fi * 2 * Math.PI;

    const mira = suave((t - (g.tA1 - 0.3)) / 0.5) * (1 - suave((t - (g.tC0 - 0.1)) / 0.6));
    const salto = t > g.tB && t < g.tB + 0.38 ? 15 * Math.sin(Math.PI * (t - g.tB) / 0.38) : 0;
    const gi = limitar((t - g.tG0) / (g.tG1 - g.tG0), 0, 1);
    const cara = Math.cos(Math.PI * suave(gi));
    const signo = cara < 0 ? -1 : 1;
    const alcanza = cubica((t - g.tR0) / (g.tR1 - g.tR0));
    const pulsa = t > g.tP0 && t < g.tP0 + 0.34 ? Math.sin(Math.PI * (t - g.tP0) / 0.34) : 0;

    const piernaI = pata(fi, w);
    const piernaD = pata(fi + 0.5, w);
    const bajada = 210 - Math.max(piernaI.bajo, piernaD.bajo) - salto;

    const respira = Math.sin(t * 2.1);
    const inclina = 3 * w + 1.2 * w * Math.sin(ph * 2) - 6 * mira + 3.5 * alcanza + 0.5 * respira * (1 - w);
    const cabeza = -16 * mira - 5 * alcanza - 1.5 * pulsa + 0.9 * Math.sin(t * 1.3) * (1 - w) - 0.8 * inclina;

    const hombro = giro(2, -122, inclina);
    const balanceo = 17 * Math.sin(ph) * w;
    const reposo = 3 * Math.sin(t * 1.7);
    const lejosAng = balanceo + reposo * 0.4;
    const lejosCodo = -(8 + 10 * Math.max(0, -balanceo / 17)) * w - 3 * (1 - w);
    let cercaAng = -balanceo + reposo * 0.4;
    let cercaCodo = -(8 + 10 * Math.max(0, balanceo / 17)) * w - 3 * (1 - w);

    if (alcanza > 0){
      const diana = [
        (g.boton[0] + signo * 4.5 * pulsa - x) / U * signo,
        (g.boton[1] - y) / U + 210 - bajada
      ];
      const ik = resolverBrazo(hombro[0], hombro[1], diana[0], diana[1]);
      cercaAng = mezcla(cercaAng, ik[0], alcanza);
      cercaCodo = mezcla(cercaCodo, ik[1], alcanza);
    }

    P.cuerpo.el.setAttribute('transform', tr(0, bajada, 0));
    P.torso.el.setAttribute('transform', tr(0, 0, inclina));
    P.cabeza.el.setAttribute('transform', tr(P.cabeza.pos[0], P.cabeza.pos[1], cabeza));
    P['brazo-i'].el.setAttribute('transform', tr(hombro[0], hombro[1], lejosAng));
    P['antebrazo-i'].el.setAttribute('transform', tr(P['antebrazo-i'].pos[0], P['antebrazo-i'].pos[1], lejosCodo));
    P['brazo-d'].el.setAttribute('transform', tr(hombro[0], hombro[1], cercaAng));
    P['antebrazo-d'].el.setAttribute('transform', tr(P['antebrazo-d'].pos[0], P['antebrazo-d'].pos[1], cercaCodo));
    P['muslo-i'].el.setAttribute('transform', tr(0, 0, piernaI.muslo));
    P['pierna-i'].el.setAttribute('transform', tr(P['pierna-i'].pos[0], P['pierna-i'].pos[1], piernaI.rodilla));
    P['pie-i'].el.setAttribute('transform', tr(P['pie-i'].pos[0], P['pie-i'].pos[1], piernaI.pie));
    P['muslo-d'].el.setAttribute('transform', tr(0, 0, piernaD.muslo));
    P['pierna-d'].el.setAttribute('transform', tr(P['pierna-d'].pos[0], P['pierna-d'].pos[1], piernaD.rodilla));
    P['pie-d'].el.setAttribute('transform', tr(P['pie-d'].pos[0], P['pie-d'].pos[1], piernaD.pie));

    const an = f.ancla;
    const sx = cara * U;
    f.svg.style.transform =
      'translate(' + n3(x) + 'px,' + n3(y) + 'px) scale(' + n3(sx) + ',' + n3(U) + ') translate(' + (-(an[0] + f.suelo[0])) + 'px,' + (-(an[1] + f.suelo[1])) + 'px)';
    sombra.style.transform =
      'translate(' + n3(x) + 'px,' + n3(y) + 'px) scale(' + n3(U) + ') translate(-70px,-12px)';

    const apareceE = t - g.tB;
    const sale = g.tC0 + 0.25;
    let e = 0;
    if (apareceE > 0 && t < sale) e = rebote(apareceE / 0.36) * (1 - suave((t - (sale - 0.2)) / 0.2));
    if (e > 0.01){
      const bx = x + 46 * U;
      const by = y - 455 * U;
      const k = e * U / 0.8;
      const ladeo = 4 * Math.sin((t - g.tB) * 9) * (1 - suave((t - g.tB) / 1.2));
      estallido.style.opacity = '1';
      estallido.style.transform = 'translate(' + n3(bx) + 'px,' + n3(by) + 'px) rotate(' + n3(ladeo) + 'deg) scale(' + n3(k) + ') translate(-60px,-96px)';
    } else {
      estallido.style.opacity = '0';
    }

    const brilla = t > g.tR0 - 0.4 && t < g.tP0 + 0.7;
    if (brilla){
      const latido = 0.55 + 0.45 * Math.sin((t - g.tR0) * 9);
      const sal = 1 - suave((t - (g.tP0 + 0.25)) / 0.45);
      const k = (0.8 + 0.4 * latido) * sal;
      pulso.style.opacity = n3(latido * sal);
      pulso.style.transform = 'translate(' + n3(g.boton[0]) + 'px,' + n3(g.boton[1]) + 'px) scale(' + n3(k) + ') translate(-8px,-8px)';
    } else {
      pulso.style.opacity = '0';
    }

    return x;
  }

  function cuadro(t){
    const g = G;
    const tz = limitar((t - g.tZ0) / (g.tZ1 - g.tZ0), 0, 1);
    const e = cubica(tz);
    const zc = 1 + 0.1 * suave(t / g.tZ0);
    const z = Math.exp(Math.log(zc) + (Math.log(g.zmax) - Math.log(zc)) * e);
    const ax = mezcla(g.a1[0], g.t0[0], e);
    const ay = mezcla(g.a1[1], g.t0[1], e);

    capas.forEach((c) => {
      const s = 1 + (z - 1) * c.d;
      const S = g.sc * s;
      let px = ax - S * TV.cx;
      let py = ay - S * TV.cy;
      if (c.d < 1){
        px = limitar(px, g.vw - LIENZO.w * S, 0);
        py = limitar(py, g.vh - LIENZO.h * S, 0);
      }
      if (c.deriva) px -= c.deriva * t * S;
      c.el.style.transform = 'matrix(' + n3(S) + ',0,0,' + n3(S) + ',' + n3(px) + ',' + n3(py) + ')';
    });

    figuraEn(t);

    const k = z / g.zmax;
    const rot = TV.giro * (1 - suave((t - g.tP0) / (g.tZ1 - g.tP0)));
    const veloOp = 1 - suave(t / 0.7);
    const salida = suave((t - g.tZ1 + 0.1) / 0.55);
    const retira = 1 - suave((t - g.tP0 - 0.9) / 0.7);
    figura.svg.style.opacity = n3(retira);
    sombra.style.opacity = n3(0.34 * retira);
    tv.style.transform = 'translate(' + n3(ax - g.t0[0]) + 'px,' + n3(ay - g.t0[1]) + 'px) rotate(' + n3(rot) + 'deg) scale(' + n3(k) + ')';
    tv.style.setProperty('--mugre', n3(1 - suave((t - g.tZ0 - 0.6) / 2.2)));
    fondo.style.opacity = n3(1 - salida);
    frente.style.opacity = n3(1 - salida);
    velo.style.opacity = n3(veloOp);

    if (!encendido && t >= g.tP0 + 0.18) pulsar();
  }

  function pulsar(){
    encendido = true;
    tv.inert = false;
    (btnPower.disabled ? cartel : btnPower).click();
  }

  function crearEscena(figSVG, imagenes){
    raiz = crear('div', 'entrada');
    raiz.id = 'entrada';
    raiz.setAttribute('aria-hidden', 'true');

    fondo = crear('div', 'entrada-fondo');
    frente = crear('div', 'entrada-frente');
    velo = crear('div', 'entrada-velo');
    capas = [];

    function capa(padre, d, deriva){
      const el = crear('div', 'entrada-capa');
      padre.appendChild(el);
      const c = { el: el, d: d, deriva: deriva || 0 };
      capas.push(c);
      return c;
    }
    function base(c, nombre){
      const img = imagenes[nombre];
      img.className = 'entrada-base';
      c.el.appendChild(img);
    }
    function pieza(c, nombre){
      const p = PIEZAS[nombre];
      const img = imagenes[nombre];
      img.className = 'entrada-pieza';
      img.style.left = p.x + 'px';
      img.style.top = p.y + 'px';
      img.style.width = p.w + 'px';
      img.style.height = 'auto';
      c.el.appendChild(img);
    }

    FONDOS.forEach((f) => base(capa(fondo, f.d, f.deriva), f.id));
    const cerca = capa(fondo, 1);
    base(cerca, 'cerca');
    pieza(cerca, 'tocon');
    pieza(cerca, 'matas');

    const mundo = capa(frente, 1);
    sombra = crear('div', 'entrada-sombra');
    figura = figSVG;
    estallido = crearEstallido();
    pulso = crear('div', 'entrada-pulso');
    mundo.el.append(sombra, figura.svg, pulso, estallido);
    base(capa(frente, 1.4), 'frente');

    raiz.append(fondo, frente, velo);
    document.body.appendChild(raiz);

    mugre = crear('div', 'entrada-mugre');
    mugre.setAttribute('aria-hidden', 'true');
    pantalla.appendChild(mugre);
  }

  function crearBoton(){
    boton = crear('button', 'entrada-saltar');
    boton.type = 'button';
    boton.innerHTML = 'Saltar la entrada <span class="entrada-saltar-icono" aria-hidden="true">&#9654;&#9654;</span>';
    boton.addEventListener('click', () => terminar('saltada'));
    const menu = document.querySelector('nav.menu');
    if (menu && menu.parentNode === document.body) document.body.insertBefore(boton, menu);
    else document.body.insertBefore(boton, document.body.firstChild);

    aviso = crear('p', 'visualmente-oculto');
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Se reproduce la entrada animada: alguien camina por el campo y enciende el televisor. Pulsa Escape o el botón Saltar la entrada para ir directo al televisor.';
    document.body.appendChild(aviso);
  }

  function activo(){
    return fase === 'preparando' || fase === 'curso';
  }

  function alTeclado(e){
    if (!activo()) return;
    if (e.key === 'Escape'){
      e.preventDefault();
      terminar('saltada');
      return;
    }
    const desplaza = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].indexOf(e.key) >= 0;
    if (desplaza){
      const act = document.activeElement;
      if (!(act && act.closest && act.closest('input, select, textarea'))) e.preventDefault();
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const act = document.activeElement;
    if (act && act.closest && act.closest('a, button, input, select, textarea, summary')) return;
    e.preventDefault();
    e.stopPropagation();
    terminar('saltada', true);
  }

  function alClic(e){
    if (!activo() || !e.isTrusted) return;
    if (e.target.closest && e.target.closest('.entrada-saltar, .menu')) return;
    const r = tv.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
      e.preventDefault();
      e.stopPropagation();
      terminar('saltada', true);
    }
  }

  function alDesplazar(e){
    if (activo() && e.cancelable) e.preventDefault();
  }

  function alScroll(){
    if (activo() && (window.pageYOffset || window.pageXOffset)) window.scrollTo(0, 0);
  }

  function alRedimensionar(){
    window.clearTimeout(pendienteResize);
    pendienteResize = window.setTimeout(() => {
      if (activo() && window.innerWidth !== anchoInicial) terminar('saltada');
    }, 160);
  }

  function alMovimiento(e){
    if (e.detail && e.detail.reducido && activo()) terminar('reducido');
  }

  function oyentes(poner){
    const m = poner ? 'addEventListener' : 'removeEventListener';
    document[m]('keydown', alTeclado, true);
    document[m]('click', alClic, true);
    document[m]('wheel', alDesplazar, { passive: false });
    document[m]('touchmove', alDesplazar, { passive: false });
    window[m]('scroll', alScroll);
    window[m]('resize', alRedimensionar);
    document[m]('movimiento', alMovimiento);
  }

  function limpiar(){
    oyentes(false);
    window.clearTimeout(pendienteResize);
    if (reloj){
      reloj.kill();
      reloj = null;
    }
    if (boton){ boton.remove(); boton = null; }
    if (aviso){ aviso.remove(); aviso = null; }
    if (mugre){ mugre.remove(); mugre = null; }
    if (raiz){ raiz.remove(); raiz = null; }
    fondo = frente = velo = sombra = estallido = pulso = figura = null;
    capas = [];
    tv.style.transform = '';
    tv.style.removeProperty('--mugre');
    tv.inert = false;
  }

  function terminar(motivo, encender){
    if (fase === 'fin') return;
    fase = 'fin';
    limpiar();
    activa(false);
    liberar();
    if (encender && !encendido){
      encendido = true;
      (btnPower.disabled ? cartel : btnPower).click();
    } else if (motivo === 'saltada' && !encendido){
      btnPower.focus({ preventScroll: true });
    }
    if (resolver) resolver(motivo);
  }

  function iniciar(){
    fase = 'curso';
    liberar();
    activa(true);
    const total = G.tFin;
    const cuenta = { t: 0 };
    let cuadros = 0;
    let revisado = false;
    const inicio = window.performance.now();
    cuadro(0);
    reloj = gsapRef.to(cuenta, {
      t: total,
      duration: total,
      ease: 'none',
      onUpdate: () => {
        if (fase !== 'curso') return;
        cuadros += 1;
        cuadro(cuenta.t);
        if (!revisado && window.performance.now() - inicio >= 2000 && !reloj.paused()){
          revisado = true;
          if (cuadros < 22) terminar('lenta', true);
        }
      },
      onComplete: () => terminar('completa')
    });
  }

  function arrancar(){
    marcarVista();
    anchoInicial = window.innerWidth;
    window.scrollTo(0, 0);
    raiz = crear('div', 'entrada');
    raiz.id = 'entrada';
    raiz.setAttribute('aria-hidden', 'true');
    document.body.appendChild(raiz);
    tv.inert = true;
    crearBoton();
    oyentes(true);

    const nombres = FONDOS.map((f) => f.id).concat(['cerca', 'tocon', 'matas', 'frente']);
    const imgs = nombres.map((n) => cargarImagen(n));
    const limite = new Promise((ok, mal) => window.setTimeout(() => mal(new Error('tiempo')), 12000));

    Promise.race([
      Promise.all([M.cargar([]), cargarTexto('caminante.svg'), cargarTexto('cerca.svg'), Promise.all(imgs), cargarFuente(), esperarTelevisor()]),
      limite
    ]).then((r) => {
      if (fase !== 'preparando') return;
      const g = r[0];
      if (!g || !g.gsap || M.reducido()){
        terminar('sin-movimiento');
        return;
      }
      const senda = leerSenda(r[2]);
      const fig = montarFigura(r[1]);
      if (!senda || !fig){
        terminar('error');
        return;
      }
      gsapRef = g.gsap;
      const imagenes = {};
      nombres.forEach((n, i) => { imagenes[n] = r[3][i]; });
      if (raiz) raiz.remove();
      crearEscena(fig, imagenes);
      G = calcular(medirPagina(), senda);
      iniciar();
    }).catch(() => {
      if (fase === 'preparando') terminar('error');
    });
  }

  function caminarHastaTelevisor(){
    if (promesa) return promesa;
    promesa = new Promise((ok) => {
      resolver = ok;
      if (!lista || M.reducido() || yaVista() || fase !== 'inactiva'){
        liberar();
        fase = 'fin';
        ok('sin-movimiento');
        return;
      }
      fase = 'preparando';
      arrancar();
    });
    return promesa;
  }

  window.Entrada = {
    caminarHastaTelevisor: caminarHastaTelevisor,
    get linea(){ return reloj; }
  };

  if (html.classList.contains('entrada-espera')) caminarHastaTelevisor();
  else liberar();
})();
