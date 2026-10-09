(function(){
  'use strict';

  const CLAVE = 'helikon-entrada';
  const RUTA_SILUETA = 'assets/entrada/silueta.svg';
  const ALCANCE = -35;
  const TAMANO = 0.34;

  const html = document.documentElement;
  const M = window.Movimiento;
  const tv = document.getElementById('tv');
  const pantalla = document.getElementById('tvScreen');
  const btnPower = document.getElementById('btnPower');
  const cartel = document.getElementById('tvCartel');
  const principal = document.getElementById('contenido');

  function liberar(){
    html.classList.remove('entrada-espera');
  }

  function activa(si){
    html.classList.toggle('entrada-activa', si);
  }

  function yaVista(){
    try { return window.sessionStorage.getItem(CLAVE) === '1'; } catch (e) { return false; }
  }

  function marcarVista(){
    try { window.sessionStorage.setItem(CLAVE, '1'); } catch (e) { return; }
  }

  const lista = !!(M && tv && pantalla && btnPower && principal);

  let fase = 'inactiva';
  let resolver = null;
  let promesa = null;

  let capa = null;
  let oscuro = null;
  let halo = null;
  let piloto = null;
  let boton = null;
  let gsapRef = null;
  let textoSVG = '';
  let figura = null;
  let linea = null;
  let ciclo = null;
  let respiros = [];
  let anchoInicial = 0;
  let pendienteResize = 0;

  function crear(etiqueta, clase){
    const n = document.createElement(etiqueta);
    if (clase) n.className = clase;
    return n;
  }

  function punto(txt, otro){
    if (!txt) return otro;
    const v = txt.trim().split(/[\s,]+/).map(Number);
    return v.length === 2 && v.every(isFinite) ? v : otro;
  }

  function medir(){
    const sx = window.pageXOffset;
    const sy = window.pageYOffset;
    const t = tv.getBoundingClientRect();
    const p = pantalla.getBoundingClientRect();
    const b = btnPower.getBoundingClientRect();
    return {
      L: t.left + sx, T: t.top + sy, W: t.width, H: t.height,
      pantalla: { x: p.left + sx, y: p.top + sy, w: p.width, h: p.height },
      B: { x: b.left + sx + b.width / 2, y: b.top + sy + b.height / 2 },
      alto: Math.max(document.documentElement.scrollHeight, window.innerHeight)
    };
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

  function cargarSilueta(){
    return window.fetch(RUTA_SILUETA).then((r) => {
      if (!r.ok) throw new Error('silueta');
      return r.text();
    });
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
    return document.importNode(svg, true);
  }

  function crearCapa(){
    const m = medir();
    capa = crear('div', 'entrada');
    capa.id = 'entrada';
    capa.setAttribute('aria-hidden', 'true');
    capa.style.height = m.alto + 'px';

    oscuro = crear('div', 'entrada-oscuro');

    halo = crear('div', 'entrada-halo');
    halo.style.left = m.pantalla.x + 'px';
    halo.style.top = m.pantalla.y + 'px';
    halo.style.width = m.pantalla.w + 'px';
    halo.style.height = m.pantalla.h + 'px';

    piloto = crear('div', 'entrada-piloto');
    const d = Math.max(34, m.W * 0.045);
    piloto.style.width = d + 'px';
    piloto.style.height = d + 'px';
    piloto.style.left = (m.B.x - d / 2) + 'px';
    piloto.style.top = (m.B.y - d / 2) + 'px';

    capa.append(oscuro, halo, piloto);
    document.body.appendChild(capa);
  }

  function crearBoton(){
    boton = crear('button', 'entrada-saltar');
    boton.type = 'button';
    boton.innerHTML = 'Saltar la entrada <span class="entrada-saltar-icono" aria-hidden="true">&#9654;&#9654;</span>';
    boton.addEventListener('click', () => terminar('saltada'));
    const menu = document.querySelector('nav.menu');
    if (menu && menu.parentNode === document.body) document.body.insertBefore(boton, menu);
    else document.body.insertBefore(boton, document.body.firstChild);
  }

  function montarFigura(m, tamano){
    const svg = leerSVG(textoSVG);
    if (!svg) return null;

    const cont = crear('div', 'entrada-figura');
    cont.appendChild(svg);
    capa.appendChild(cont);

    const vb = svg.viewBox.baseVal;
    const vbW = vb && vb.width ? vb.width : 200;
    const vbH = vb && vb.height ? vb.height : 470;
    const suelo = punto(svg.getAttribute('data-suelo'), [vbW / 2, vbH - 8]);
    const punta = punto(svg.getAttribute('data-punta'), null);
    const s = (m.H * tamano) / vbH;

    cont.style.width = (vbW * s) + 'px';
    cont.style.height = (vbH * s) + 'px';

    const partes = {};
    svg.querySelectorAll('[data-parte]').forEach((n) => {
      const pivote = punto(n.getAttribute('data-pivote'), [vbW / 2, vbH / 2]);
      partes[n.getAttribute('data-parte')] = { el: n, pivote: pivote };
      gsapRef.set(n, { svgOrigin: pivote[0] + ' ' + pivote[1] });
    });

    gsapRef.set(cont, { transformOrigin: (suelo[0] * s) + 'px ' + (suelo[1] * s) + 'px' });

    let mano = [0, -vbH * 0.45];
    const brazo = partes['brazo-d'];
    if (brazo && punta){
      const a = ALCANCE * Math.PI / 180;
      const vx = punta[0] - brazo.pivote[0];
      const vy = punta[1] - brazo.pivote[1];
      mano = [
        brazo.pivote[0] + vx * Math.cos(a) - vy * Math.sin(a) - suelo[0],
        brazo.pivote[1] + vx * Math.sin(a) + vy * Math.cos(a) - suelo[1]
      ];
    }

    let cabezaY = 0;
    if (partes.cabeza){
      try { cabezaY = partes.cabeza.el.getBBox().y; } catch (e) { cabezaY = 0; }
    }

    return { cont: cont, svg: svg, partes: partes, s: s, suelo: suelo, mano: mano, cabezaY: cabezaY, ancho: vbW * s };
  }

  function colocar(f, x, y){
    return { x: x - f.suelo[0] * f.s, y: y - f.suelo[1] * f.s };
  }

  function posturaFinal(f, m){
    const escala = 0.86;
    const pies = colocar(
      f,
      m.L + m.W * 0.17,
      (m.T + m.H * 0.905) + (f.suelo[1] - f.cabezaY) * f.s * escala
    );
    return { x: pies.x, y: pies.y, scale: escala };
  }

  function crearCiclo(f, dur){
    const g = gsapRef;
    const t = g.timeline();
    const base = { duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 };
    function par(nombre, desde, hasta){
      if (f.partes[nombre]) t.fromTo(f.partes[nombre].el, desde, Object.assign({}, hasta, base), 0);
    }
    par('pierna-i', { y: 0, scaleY: 1, rotation: 2 }, { y: -8, scaleY: 0.93, rotation: -3 });
    par('pierna-d', { y: -8, scaleY: 0.93, rotation: 3 }, { y: 0, scaleY: 1, rotation: -2 });
    par('brazo-i', { scaleY: 0.94, rotation: 3 }, { scaleY: 1.03, rotation: -2 });
    par('brazo-d', { scaleY: 1.03, rotation: -2 }, { scaleY: 0.94, rotation: 3 });
    par('torso', { rotation: -2, x: -2 }, { rotation: 2, x: 2 });
    par('cabeza', { rotation: 1.5 }, { rotation: -1.5 });
    t.fromTo(f.svg, { y: 0 }, { y: -f.s * 7, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);
    return t;
  }

  function pararCiclo(f, suave){
    if (ciclo){
      ciclo.kill();
      ciclo = null;
    }
    if (!f) return;
    const piezas = Object.keys(f.partes).map((k) => f.partes[k].el).concat([f.svg]);
    const reposo = { x: 0, y: 0, scaleY: 1, rotation: 0 };
    if (suave) gsapRef.to(piezas, Object.assign({ duration: 0.35, ease: 'power2.out', overwrite: 'auto' }, reposo));
    else gsapRef.set(piezas, reposo);
  }

  function quitarControl(){
    document.removeEventListener('keydown', alTeclado, true);
    document.removeEventListener('click', alClic, true);
    if (boton){
      boton.remove();
      boton = null;
    }
    tv.inert = false;
  }

  function quitarEfectos(){
    respiros.forEach((r) => r.kill());
    respiros = [];
    [oscuro, halo, piloto].forEach((n) => { if (n) n.remove(); });
    oscuro = halo = piloto = null;
  }

  function limpiarTodo(){
    if (linea){ linea.kill(); linea = null; }
    pararCiclo(figura, false);
    if (gsapRef){
      const objetivos = [capa, oscuro, halo, piloto];
      if (figura) objetivos.push(figura.cont, figura.svg);
      gsapRef.killTweensOf(objetivos.filter(Boolean));
    }
    respiros.forEach((r) => r.kill());
    respiros = [];
    if (capa){ capa.remove(); capa = null; }
    oscuro = halo = piloto = figura = null;
    window.removeEventListener('resize', alRedimensionar);
    document.removeEventListener('movimiento', alMovimiento);
  }

  function terminar(motivo, encender){
    if (fase === 'fin' || fase === 'sentado') return;
    const antes = fase;
    quitarControl();
    limpiarTodo();
    fase = 'fin';
    activa(false);
    liberar();
    if (antes !== 'pulsado'){
      if (encender){
        (btnPower.disabled ? cartel : btnPower).click();
      } else if (motivo === 'saltada'){
        btnPower.focus({ preventScroll: true });
      }
    }
    if (resolver) resolver(motivo);
  }

  function alTeclado(e){
    if (fase !== 'preparando' && fase !== 'caminando') return;
    if (e.key === 'Escape'){
      e.preventDefault();
      terminar('saltada');
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const activo = document.activeElement;
    if (activo && activo.closest && activo.closest('a, button, input, select, textarea, summary')) return;
    e.preventDefault();
    e.stopPropagation();
    terminar('saltada', true);
  }

  function alClic(e){
    if (fase !== 'preparando' && fase !== 'caminando') return;
    if (e.target.closest && e.target.closest('.entrada-saltar, .menu')) return;
    const r = tv.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom){
      e.preventDefault();
      e.stopPropagation();
      terminar('saltada', true);
    }
  }

  function alRedimensionar(){
    window.clearTimeout(pendienteResize);
    pendienteResize = window.setTimeout(() => {
      if (fase === 'preparando' || fase === 'caminando'){
        if (window.innerWidth !== anchoInicial) terminar('saltada');
        return;
      }
      if (fase === 'sentado') recolocar();
    }, 160);
  }

  function alMovimiento(e){
    if (e.detail && e.detail.reducido){
      quitarControl();
      if (fase === 'sentado'){
        limpiarTodo();
        fase = 'fin';
      } else {
        terminar('reducido');
      }
    }
  }

  function recolocar(){
    if (!capa || !gsapRef) return;
    const m = medir();
    capa.style.height = m.alto + 'px';
    if (figura) figura.cont.remove();
    figura = montarFigura(m, TAMANO);
    if (figura) gsapRef.set(figura.cont, posturaFinal(figura, m));
  }

  function pulsar(){
    if (fase !== 'caminando') return;
    fase = 'pulsado';
    quitarControl();
    activa(false);
    (btnPower.disabled ? cartel : btnPower).click();

    const g = gsapRef;
    g.to(piloto, { opacity: 0, duration: 0.3 });
    g.to(halo, { opacity: 1, duration: 0.3 });
    g.to(halo, { opacity: 0, duration: 1.5, delay: 0.7, ease: 'power1.inOut' });
    g.to(oscuro, { opacity: 0, duration: 2.4, delay: 0.2, ease: 'power1.inOut' });
    g.to(figura.cont, { '--luz': 0, duration: 2.2, ease: 'power1.inOut' });
  }

  function coreografia(){
    const g = gsapRef;
    const m = medir();
    figura = montarFigura(m, TAMANO);
    if (!figura){
      terminar('error');
      return;
    }
    const f = figura;
    const corto = window.matchMedia('(max-width: 640px) and (orientation: portrait)').matches;
    const D = corto ? 2.4 : 4.2;

    const finX = m.B.x - f.mano[0] * f.s;
    const finY = m.B.y - f.mano[1] * f.s;
    const iniX = -f.ancho * 1.4;
    const iniY = m.T + m.H * 1.1;
    const dx = finX - iniX;
    const dy = iniY - finY;
    const P = (x, y) => colocar(f, x, y);
    const ruta = [
      P(iniX, iniY),
      P(iniX + dx * 0.33, iniY - dy * 0.22 - m.H * 0.012),
      P(iniX + dx * 0.68, iniY - dy * 0.7 + m.H * 0.012),
      P(finX, finY)
    ];

    g.set(f.cont, { x: ruta[0].x, y: ruta[0].y, scale: 1.3 });

    respiros.push(g.to(halo, { opacity: 0.5, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    respiros.push(g.to(piloto, { opacity: 0.3, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

    fase = 'caminando';
    const brazo = f.partes['brazo-d'];
    const salida = corto ? 0.5 : 0.9;

    linea = g.timeline({ defaults: { ease: 'none' } });
    linea.call(() => { ciclo = crearCiclo(f, 0.5); }, null, salida);
    linea.to(f.cont, { motionPath: { path: ruta, curviness: 1.1 }, duration: D, ease: 'power1.out' }, salida);
    linea.to(f.cont, { scale: 1, duration: D, ease: 'power1.out' }, salida);
    linea.call(() => { pararCiclo(f, true); }, null, salida + D);

    const alcance = salida + D + 0.4;
    if (brazo){
      linea.to(brazo.el, { rotation: ALCANCE, duration: 0.6, ease: 'power2.out' }, alcance);
      linea.to(brazo.el, { scaleY: 1.05, duration: 0.12, ease: 'power1.in' }, alcance + 0.8);
    }
    linea.call(pulsar, null, alcance + 0.95);

    const despues = alcance + 1.3;
    if (brazo) linea.to(brazo.el, { rotation: 0, scaleY: 1, duration: 0.7, ease: 'power2.inOut' }, despues);
    const sentada = posturaFinal(f, m);
    linea.call(() => { if (!ciclo) ciclo = crearCiclo(f, 0.6); }, null, despues + 0.5);
    linea.to(f.cont, { x: sentada.x, y: sentada.y, scale: sentada.scale, duration: 1.7, ease: 'power2.inOut' }, despues + 0.5);
    linea.call(() => {
      pararCiclo(f, false);
      quitarEfectos();
      fase = 'sentado';
      if (resolver) resolver('sentado');
    }, null, despues + 2.3);
  }

  function arrancar(){
    marcarVista();
    anchoInicial = window.innerWidth;
    crearCapa();
    activa(true);
    liberar();
    tv.inert = true;
    crearBoton();
    document.addEventListener('keydown', alTeclado, true);
    document.addEventListener('click', alClic, true);
    window.addEventListener('resize', alRedimensionar);
    document.addEventListener('movimiento', alMovimiento);

    Promise.all([cargarSilueta(), M.cargar(['MotionPathPlugin']), esperarTelevisor()])
      .then((r) => {
        if (fase !== 'preparando') return;
        const g = r[1];
        if (!g || !g.gsap || M.reducido()){
          terminar('sin-movimiento');
          return;
        }
        gsapRef = g.gsap;
        textoSVG = r[0];
        coreografia();
      })
      .catch(() => {
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

  window.Entrada = { caminarHastaTelevisor: caminarHastaTelevisor };

  if (html.classList.contains('entrada-espera')) caminarHastaTelevisor();
  else liberar();
})();
