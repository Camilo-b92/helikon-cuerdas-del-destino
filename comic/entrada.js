(function(){
  'use strict';

  const CLAVE = 'helikon-entrada';
  const CARPETA = 'assets/entrada/';
  const LIENZO = { w: 1600, h: 900 };
  const FPS = 25;
  const TV = { cx: 582.3, cy: 674.4, ancho: 146, giro: -2, boton: [0.895, 0.886], proporcion: 925 / 1566 };
  const FRENTE = { x: 0, y: 0, w: 1600, h: 900 };
  const TOCON = { x: 502, y: 699, w: 160, h: 112 };
  const SUELO_TV = { x: 582, y: 807, rx: 108, ry: 14 };
  const ALCANCE = { adelante: 60, abajo: 50 };
  const FONDOS = [
    { id: 'cielo', d: 0.1 },
    { id: 'nubes', d: 0.18, deriva: 15 },
    { id: 'lejos', d: 0.4 },
    { id: 'medio', d: 0.7 }
  ];
  const RUTAS = {
    cielo: CARPETA + 'cielo.svg',
    nubes: CARPETA + 'nubes.svg',
    lejos: CARPETA + 'lejos.svg',
    medio: CARPETA + 'medio.svg',
    plato: CARPETA + 'plato.svg',
    tocon: CARPETA + 'tocon.svg',
    frente: CARPETA + 'frente.svg'
  };
  const IMAGENES = ['cielo', 'nubes', 'lejos', 'medio', 'plato', 'tocon', 'frente'];

  const html = document.documentElement;
  const M = window.Movimiento;
  const J = window.EntradaCaminante;
  const tv = document.getElementById('tv');
  const pantalla = document.getElementById('tvScreen');
  const btnPower = document.getElementById('btnPower');
  const cartel = document.getElementById('tvCartel');
  const principal = document.getElementById('contenido');

  const lista = !!(M && J && tv && pantalla && btnPower && principal);

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
  let caminante = null;
  let sombra = null;
  let estallido = null;
  let pulso = null;
  let contacto = null;
  let G = null;

  function activa(si){
    html.classList.toggle('entrada-activa', si);
  }

  function liberar(){
    html.classList.remove('entrada-espera');
  }

  function esRecarga(){
    try {
      const nav = window.performance.getEntriesByType('navigation')[0];
      if (nav) return nav.type === 'reload';
      return !!(window.performance.navigation && window.performance.navigation.type === 1);
    } catch (e) { return false; }
  }

  function yaVista(){
    if (esRecarga()) return false;
    if (/[?&]entrada(=|&|$)/.test(window.location.search)) return false;
    try { return window.sessionStorage.getItem(CLAVE) === '1'; } catch (e) { return false; }
  }

  function marcarVista(){
    try { window.sessionStorage.setItem(CLAVE, '1'); } catch (e) { return; }
  }

  function sonidoPermitido(){
    try {
      if (typeof window.navigator.getAutoplayPolicy === 'function'){
        return window.navigator.getAutoplayPolicy('mediaelement') === 'allowed';
      }
    } catch (e) {}
    const ua = window.navigator.userActivation;
    return !!(ua && ua.hasBeenActive);
  }

  function mostrarInicio(seguir){
    const capa = crear('div', 'entrada-inicio');
    capa.id = 'entrada-inicio';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-labelledby', 'entrada-inicio-marca');
    capa.innerHTML = '<p class="entrada-inicio-marca" id="entrada-inicio-marca">Cuerdas del Destino</p>' +
      '<button type="button" class="entrada-inicio-boton">Toca para comenzar</button>' +
      '<p class="entrada-inicio-nota">Este cómic se escucha: sube el volumen.</p>';
    document.body.appendChild(capa);
    tv.inert = true;
    capa.addEventListener('click', () => {
      capa.remove();
      seguir();
    }, { once: true });
    capa.querySelector('button').focus({ preventScroll: true });
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

  function cargarJSON(nombre){
    return window.fetch(CARPETA + nombre).then((r) => {
      if (!r.ok) throw new Error(nombre);
      return r.json();
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
      img.src = RUTAS[nombre];
    });
  }

  function cargarFuente(){
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([
      document.fonts.load('48px Bangers').catch(() => null),
      new Promise((ok) => window.setTimeout(ok, 1800))
    ]);
  }

  function montarCaminante(datos){
    const NS = 'http://www.w3.org/2000/svg';
    const v = datos.vista;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'entrada-caminante');
    svg.setAttribute('viewBox', v.join(' '));
    svg.setAttribute('width', String(v[2]));
    svg.setAttribute('height', String(v[3]));
    svg.setAttribute('focusable', 'false');
    const piezas = {};
    datos.capas.forEach((c) => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = c.x;
      svg.appendChild(g);
      piezas[c.i] = { g: g, xml: c.x, vari: '' };
    });
    return {
      svg: svg,
      piezas: piezas,
      boca: datos.boca,
      ancla: [datos.origen[0] - v[0], datos.origen[1] - v[1]]
    };
  }

  function crearEstallido(){
    const e = crear('div', 'entrada-estallido');
    let p = '';
    const n = 9;
    for (let i = 0; i < n * 2; i++){
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 52 : 36;
      p += (60 + Math.cos(a) * r * 1.1).toFixed(1) + ',' + (50 + Math.sin(a) * r * 0.92).toFixed(1) + ' ';
    }
    e.innerHTML =
      '<svg viewBox="0 0 120 100" width="120" height="100" focusable="false" aria-hidden="true">' +
      '<polygon points="' + p.trim() + '"/>' +
      '<text x="60" y="71" text-anchor="middle">!</text></svg>';
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

  function calcular(pag){
    const vw = pag.vw;
    const vh = pag.vh;
    const retrato = vw < vh;
    const sc = Math.max(vw / LIENZO.w, vh / LIENZO.h);
    const oy = vh - LIENZO.h * sc;
    const fx = retrato ? 0.3 : 0.58;
    const ox = limitar(vw * fx - TV.cx * sc, vw - LIENZO.w * sc, 0);
    const a1 = [ox + TV.cx * sc, oy + TV.cy * sc];
    const zmax = pag.tv.w / (TV.ancho * sc);
    const izq = -ox / sc;
    const der = (vw - ox) / sc;

    const bx = TV.cx + (TV.boton[0] - 0.5) * TV.ancho;
    const by = TV.cy + (TV.boton[1] - 0.5) * TV.ancho * TV.proporcion;
    const bg = giro(bx - TV.cx, by - TV.cy, TV.giro);
    const diana = [TV.cx + bg[0], TV.cy + bg[1]];

    const llegada = caminante.posicionLlegada(diana, ALCANCE.adelante, ALCANCE.abajo);
    const plan = caminante.plan({ der: der, boton: diana, llegada: llegada, vel: 1.25 });
    const T = plan.T;

    return {
      vw: vw, vh: vh, sc: sc, ox: ox, oy: oy, a1: a1, zmax: zmax, izq: izq, der: der,
      t0: [pag.tv.cx, pag.tv.cy], tvAncho: pag.tv.w,
      plan: plan, llegada: llegada, boton: diana,
      tR0: T.alcanza0 / FPS, tP0: T.toca / FPS, tZ0: T.zoom0 / FPS, tZ1: T.zoom1 / FPS, tFin: T.fin / FPS
    };
  }

  function ver(n, si){
    if (n) n.setAttribute('opacity', si ? '1' : '0');
  }

  function n4(v){
    return Math.round(v * 10000) / 10000;
  }

  function figuraEn(t){
    const g = G;
    const f = figura;
    const st = g.plan.estado(t * FPS);
    const M6 = st.M;
    const piezas = f.piezas;
    Object.keys(piezas).forEach((i) => {
      const m = M6[i];
      piezas[i].g.setAttribute('transform', 'matrix(' + n4(m[0]) + ' ' + n4(m[1]) + ' ' + n4(m[2]) + ' ' + n4(m[3]) + ' ' + n4(m[4]) + ' ' + n4(m[5]) + ')');
    });
    const b = piezas[caminante.I.boca];
    const v = st.vari[caminante.I.boca] || '';
    if (v !== b.vari){
      b.g.innerHTML = v && f.boca[v] ? f.boca[v] : b.xml;
      b.vari = v;
    }

    const sx = caminante.sentido * caminante.escala * st.escalaX;
    const sy = caminante.escala * st.escalaY;
    f.svg.style.transform =
      'translate(' + n3(st.X) + 'px,' + n3(st.Y) + 'px) scale(' + n3(sx) + ',' + n3(sy) + ') translate(' + (-f.ancla[0]) + 'px,' + (-f.ancla[1]) + 'px)';
    f.svg.style.opacity = n3(st.retira);

    const pie = caminante.aMundo(caminante.origen[0] + 6, caminante.origen[1], st.X, g.llegada.Y);
    const achica = 1 - 0.18 * limitar(st.saltando, 0, 1);
    sombra.style.opacity = n3(st.retira);
    sombra.style.transform = 'translate(' + n3(pie[0] + 4) + 'px,' + n3(pie[1] + 4) + 'px) scale(' + n3(achica) + ') translate(-62px,-10px)';

    if (st.burbuja > 0.01){
      const cab = caminante.aMundo(caminante.origen[0] + 14, 90, st.X, st.Y);
      estallido.style.opacity = n3(Math.min(1, st.burbuja * 1.4));
      estallido.style.transform = 'translate(' + n3(cab[0] + 14) + 'px,' + n3(cab[1] - 80) + 'px) scale(' + n3(st.burbuja * 1.12) + ') translate(-60px,-50px)';
    } else {
      estallido.style.opacity = '0';
    }

    const brilla = t > g.tR0 - 0.3 && t < g.tP0 + 0.7;
    if (brilla){
      const latido = 0.55 + 0.45 * Math.sin((t - g.tR0) * 9);
      const sal = 1 - suave((t - (g.tP0 + 0.25)) / 0.45);
      const k = (0.8 + 0.4 * latido) * sal;
      pulso.style.opacity = n3(latido * sal);
      pulso.style.transform = 'translate(' + n3(g.boton[0]) + 'px,' + n3(g.boton[1]) + 'px) scale(' + n3(k) + ') translate(-8px,-8px)';
    } else {
      pulso.style.opacity = '0';
    }
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
    tv.style.transform = 'translate(' + n3(ax - g.t0[0]) + 'px,' + n3(ay - g.t0[1]) + 'px) rotate(' + n3(rot) + 'deg) scale(' + n3(k) + ')';
    tv.style.setProperty('--mugre', n3(1 - suave((t - g.tZ0 - 0.6) / 2.2)));
    fondo.style.opacity = n3(1 - salida);
    frente.style.opacity = n3(1 - salida);
    velo.style.opacity = n3(veloOp);

    if (!encendido && t >= g.tP0 + 0.12) pulsar();
  }

  function pulsar(){
    encendido = true;
    tv.inert = false;
    (btnPower.disabled ? cartel : btnPower).click();
  }

  function crearEscena(datos, imagenes){
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
    function poner(c, nombre, clase, caja){
      const img = imagenes[nombre];
      img.className = clase;
      if (caja){
        img.style.left = n3(caja.x) + 'px';
        img.style.top = n3(caja.y) + 'px';
        img.style.width = n3(caja.w) + 'px';
        img.style.height = caja.h ? n3(caja.h) + 'px' : 'auto';
      }
      c.el.appendChild(img);
    }

    FONDOS.forEach((f) => {
      poner(capa(fondo, f.d, f.deriva), f.id, 'entrada-' + f.id);
    });
    const cerca = capa(fondo, 1);
    poner(cerca, 'plato', 'entrada-plato');
    contacto = crear('div', 'entrada-contacto');
    contacto.style.left = (SUELO_TV.x - SUELO_TV.rx) + 'px';
    contacto.style.top = (SUELO_TV.y - SUELO_TV.ry) + 'px';
    contacto.style.width = (SUELO_TV.rx * 2) + 'px';
    contacto.style.height = (SUELO_TV.ry * 2) + 'px';
    cerca.el.appendChild(contacto);
    poner(cerca, 'tocon', 'entrada-tocon', TOCON);

    const mundo = capa(frente, 1);
    sombra = crear('div', 'entrada-sombra');
    figura = montarCaminante(datos);
    estallido = crearEstallido();
    pulso = crear('div', 'entrada-pulso');
    mundo.el.append(sombra, figura.svg, pulso, estallido);
    poner(mundo, 'frente', 'entrada-frente-hojas', FRENTE);

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
    aviso.textContent = 'Se reproduce la entrada animada: una joven camina por un sendero de montaña, descubre un televisor viejo sobre un tocón y lo enciende. Pulsa Escape o el botón Saltar la entrada para ir directo al televisor.';
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
    fondo = frente = velo = sombra = estallido = pulso = contacto = figura = null;
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
    document.dispatchEvent(new CustomEvent('entrada:fin', { detail: { motivo: motivo } }));
    if (encender && !encendido){
      encendido = true;
      (btnPower.disabled ? cartel : btnPower).click();
    } else if (motivo === 'saltada' && !encendido){
      btnPower.focus({ preventScroll: true });
    }
    if (resolver) resolver(motivo);
  }

  function cuando(){
    if (!G) return null;
    const T = G.plan.T;
    return {
      pasos: G.plan.pasos.map((f) => f / FPS),
      sorpresa: T.pop0 / FPS,
      burbuja: T.burbuja0 / FPS,
      camina0: T.camina0 / FPS,
      alcanza0: T.alcanza0 / FPS,
      toca: G.tP0,
      zoom0: G.tZ0,
      zoom1: G.tZ1,
      fin: G.tFin
    };
  }

  function iniciar(){
    fase = 'curso';
    liberar();
    activa(true);
    document.dispatchEvent(new CustomEvent('entrada:inicio', { detail: cuando() }));
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

    const imgs = IMAGENES.map((n) => cargarImagen(n));
    const limite = new Promise((ok, mal) => window.setTimeout(() => mal(new Error('tiempo')), 12000));

    Promise.race([
      Promise.all([M.cargar([]), cargarJSON('caminante.json'), Promise.all(imgs), cargarFuente(), esperarTelevisor()]),
      limite
    ]).then((r) => {
      if (fase !== 'preparando') return;
      const g = r[0];
      if (!g || !g.gsap || M.reducido()){
        terminar('sin-movimiento');
        return;
      }
      let modelo = null;
      try { modelo = J.crear(r[1]); } catch (e) { modelo = null; }
      if (!modelo){
        terminar('error');
        return;
      }
      gsapRef = g.gsap;
      caminante = modelo;
      const imagenes = {};
      IMAGENES.forEach((n, i) => { imagenes[n] = r[2][i]; });
      if (raiz) raiz.remove();
      crearEscena(r[1], imagenes);
      G = calcular(medirPagina());
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
      if (sonidoPermitido()) arrancar();
      else mostrarInicio(arrancar);
    });
    return promesa;
  }

  window.Entrada = {
    caminarHastaTelevisor: caminarHastaTelevisor,
    get linea(){ return reloj; },
    get cuando(){ return cuando(); }
  };

  if (html.classList.contains('entrada-espera')) caminarHastaTelevisor();
  else liberar();
})();
