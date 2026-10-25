(function(){
  'use strict';

  const S = window.Sonido;
  if (!S) return;
  const n = S.H.nota;

  const tv = document.getElementById('tv');
  const pantalla = document.getElementById('tvScreen');
  const estatica = document.getElementById('staticCanvas');
  const pulsadores = ['btnNext', 'btnPrev', 'btnPower', 'tvCartel']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!tv || !pantalla || !estatica) return;

  const AMBIENTES = {
    1: ['amb-campo', {}],
    2: ['amb-campo', { densidad: 0.45 }],
    3: ['amb-interior', {}],
    5: ['amb-ciudad', {}],
    6: ['amb-ciudad', {}],
    7: ['amb-noche', {}],
    8: ['amb-noche', {}],
    10: ['amb-interior', { noche: true }],
    11: ['amb-interior', { noche: true }],
    12: ['amb-concierto', {}]
  };

  const lineas = {};
  const bucles = {};
  const temporizadores = new Set();
  const recientes = {};
  const envueltas = new WeakSet();

  let zumbido = null;
  let canal = -1;
  let entradaLinea = null;
  let entradaAmbiente = null;
  let entradaTimer = 0;

  function activo(){
    return !tv.classList.contains('is-off');
  }

  function recien(clave, ms){
    const ahora = window.performance.now();
    if (recientes[clave] && ahora - recientes[clave] < ms) return true;
    recientes[clave] = ahora;
    return false;
  }

  function linea(clave, items, op){
    if (lineas[clave]) lineas[clave].parar(0.15);
    lineas[clave] = S.linea(items, op);
  }

  function bucle(clave, nombre, op, fade){
    if (bucles[clave]) bucles[clave].parar(0.3);
    bucles[clave] = S.bucle(nombre, op, fade);
  }

  function despues(seg, fn){
    const id = window.setTimeout(() => {
      temporizadores.delete(id);
      fn();
    }, seg * 1000);
    temporizadores.add(id);
  }

  function limpiarCanal(fade){
    Object.keys(lineas).forEach((k) => { lineas[k].parar(fade); delete lineas[k]; });
    Object.keys(bucles).forEach((k) => { bucles[k].parar(fade); delete bucles[k]; });
    temporizadores.forEach((id) => window.clearTimeout(id));
    temporizadores.clear();
  }

  function detenerZumbido(){
    if (zumbido){
      zumbido.parar(0.4);
      zumbido = null;
    }
  }

  function callarEscena(fade){
    limpiarCanal(fade);
    S.parar('escena', fade);
    S.parar('musica', fade);
    S.parar('ambiente', fade);
  }

  const burb = (t, k) => [t, 'burbuja', k ? { k: k } : {}];
  const texto = (t, nota) => [t, 'texto', { f: n(nota) }];

  const EVENTOS = {
    'p1-titulo': () => linea('p1', [[0, 'titulo-obra']]),
    'p1-capitulo': () => linea('p1c', [[0, 'capitulo', { n: 1 }]]),
    'p2-titulo': () => linea('p2', [[0, 'capitulo', { n: 2 }]]),
    'p3-titulo': () => linea('p3', [[0, 'capitulo', { n: 3 }]]),

    's1-juanesCorre': () => linea('s1', [
      [0, 'puerta-abre', { dur: 1.5 }],
      [1.45, 'pasos', { n: 11, cada: 0.345, tipo: 'tierra', vol: 0.36, entra: true }],
      [5.4, 'pasos', { n: 3, cada: 0.5, tipo: 'tierra', vol: 0.2 }],
      [6.7, 'silbido', { vol: 0.2 }],
      [7.25, 'golpe-madera', { vol: 0.45, f: 230 }],
      [7.45, 'caja-cae'],
      [8.0, 'rebotes', { vol: 0.26 }],
      [8.7, 'pasos', { n: 10, cada: 0.33, tipo: 'tierra', vol: 0.32 }]
    ]),

    's2-juanesBusca': () => linea('s2', [[0, 'revolver', { dur: 7.4 }]]),
    's2-texto': () => linea('s2t', [texto(0, 'mi6'), texto(3, 'sol6')]),

    's3-papaHabla': () => linea('s3', [[2, 'panel'], [4, 'panel'], [4.35, 'maravilla']]),
    's3-text': () => linea('s3t', [texto(0, 'mi6'), texto(3.36, 'sol6'), texto(7.4, 'la6')]),
    's3-guitarra': () => bucle('musica', 'musica-padre', {}, 0.2),

    's4-juanCaminando': () => {
      linea('s4', [[0.35, 'pasos', { n: 8, cada: 0.48, tipo: 'asfalto', vol: 0.2, pan0: -0.4, pan1: 0.1, entra: true }]]);
      despues(3.4, () => bucle('musica', 'musica-sueno', {}, 1.5));
    },
    's4-txt': () => linea('s4t', [burb(0.1), burb(2.92, 1.15)]),

    's5-juanTocaGuita': () => { if (!bucles.musica) bucle('musica', 'musica-calle', {}, 1.2); },
    's5-npcUno': () => linea('n1', [[0, 'pasos', { n: 17, cada: 0.8, tipo: 'asfalto', vol: 0.14, pan0: -0.85, pan1: 0.85 }]]),
    's5-npcDos': () => linea('n2', [[0, 'pasos', { n: 7, cada: 0.8, tipo: 'asfalto', vol: 0.13, pan0: 0.85, pan1: -0.85 }]]),
    's5-npcTres': () => linea('n3', [[0, 'pasos', { n: 19, cada: 0.82, tipo: 'asfalto', vol: 0.13, pan0: -0.7, pan1: 0.7 }]]),
    's5-npcCuatro': () => linea('n4', [[0, 'pasos', { n: 8, cada: 0.82, tipo: 'asfalto', vol: 0.12, pan0: 0.7, pan1: -0.7 }]]),
    's5-textDias': () => linea('s5d', [burb(0.76, 0.9)]),
    's5-textVine': () => linea('s5v', [burb(0, 1.1)]),

    's6-recuadroUno': () => linea('s6', [[0.1, 'pasos', { n: 7, cada: 0.5, tipo: 'asfalto', vol: 0.3 }]]),
    's6-textoOne': () => linea('s6t', [texto(0, 're6'), texto(2.2, 'fa6')]),
    's6-juanAsustao': () => bucle('latido', 'latido', { vol: 0.22 }, 0.8),
    's6-textoFantas': () => linea('s6f', [[0, 'aura-fantasma'], burb(0.24, 0.8), burb(4.24, 0.8), burb(7.16, 0.8)]),

    's7-juanRun': () => {
      bucle('correr', 'pasos-correr', {}, 0.03);
      bucle('latido', 'latido', { vol: 0.2 }, 0.4);
    },
    's7-text': () => linea('s7t', [burb(0.5, 0.9)]),

    's8-puerta': () => linea('s8p', [[0, 'puerta-abre', { dur: 2.2 }]]),
    's8-cortina': () => linea('s8c', [[0, 'cortina']]),
    's8-libros': () => linea('s8l', [[0, 'libros']]),
    's8-txt': () => linea('s8t', [burb(0.24, 0.9), burb(3.68, 0.85), burb(8.32, 0.9)]),

    's9-jua': () => linea('s9', [[0, 'musica-final']]),
    's9-textJuan': () => linea('s9j', [burb(0.05, 0.85), burb(4.48, 0.8)]),
    's9-mom': () => linea('s9m', [[0, 'panel']]),
    's9-textMom': () => linea('s9t', [burb(0.05, 1.1), burb(4.04, 1.1), burb(10.04, 1.1), burb(16, 1.1)]),

    's10-txt': () => linea('s10t', [[0, 'ovacion'], burb(0.1, 0.95), burb(4.2, 0.9), burb(9.5, 0.95)]),

    'p4-titulo': () => linea('p4', [[0, 'titulo-final']])
  };

  const PAUSAS = {
    's7-juanRun': () => {
      if (bucles.correr){ bucles.correr.parar(0.06); delete bucles.correr; }
      if (bucles.latido){ bucles.latido.parar(0.9); delete bucles.latido; }
    }
  };

  function alIniciar(id, anim){
    const fn = EVENTOS[id];
    if (!fn || !activo()) return;
    const el = anim.wrapper;
    const canalEl = el && el.closest ? el.closest('.channel') : null;
    if (!canalEl || !canalEl.classList.contains('is-active')) return;
    if (recien('anim:' + id, 80)) return;
    fn(anim);
  }

  function alPausar(id){
    const fn = PAUSAS[id];
    if (fn) fn();
  }

  function envolver(anim){
    if (!anim || envueltas.has(anim)) return;
    envueltas.add(anim);
    const id = anim.wrapper && anim.wrapper.id;
    if (!id) return;
    const play = anim.play;
    const irYJugar = anim.goToAndPlay;
    const pausa = anim.pause;
    anim.play = function(){
      const estaba = anim.isPaused;
      const r = play.apply(anim, arguments);
      if (estaba) alIniciar(id, anim);
      return r;
    };
    anim.goToAndPlay = function(){
      const r = irYJugar.apply(anim, arguments);
      alIniciar(id, anim);
      return r;
    };
    anim.pause = function(){
      const estaba = !anim.isPaused;
      const r = pausa.apply(anim, arguments);
      if (estaba) alPausar(id);
      return r;
    };
  }

  if (typeof lottie !== 'undefined' && lottie.loadAnimation){
    const cargar = lottie.loadAnimation;
    lottie.loadAnimation = function(){
      const anim = cargar.apply(lottie, arguments);
      envolver(anim);
      return anim;
    };
  }

  function conectarAnimaciones(){
    if (typeof lottie === 'undefined' || !lottie.getRegisteredAnimations) return;
    lottie.getRegisteredAnimations().forEach(envolver);
  }

  const PANELES_S6 = {
    's6-cajaUno': () => linea('s6a', [[0, 'panel']]),
    's6-fondoTextoOne': () => linea('s6b', [[0, 'panel']]),
    's6-fondoDos': () => linea('s6c', [[0, 'panel'], [0.12, 'susto']]),
    's6-fondoTres': () => linea('s6d', [[0.1, 'fantasma']])
  };

  if (typeof window.s6Entrar === 'function'){
    const entrarOriginal = window.s6Entrar;
    window.s6Entrar = function(id){
      entrarOriginal(id);
      if (canal === 7 && activo() && PANELES_S6[id]) PANELES_S6[id]();
    };
  }

  if (typeof window.s6Salir === 'function'){
    const salirOriginal = window.s6Salir;
    window.s6Salir = function(id){
      salirOriginal(id);
      if (canal === 7 && activo() && id === 's6-fondoTextoOne' && !recien('s6-sale', 400)){
        linea('s6x', [[0, 'panel', { vol: 0.8 }]]);
      }
    };
  }

  const showOriginal = window.showChannel;
  window.showChannel = function(indice){
    showOriginal(indice);
    canal = indice;
    limpiarCanal(0.25);
    if (!activo()) return;
    if (!zumbido) zumbido = S.bucle('tv-zumbido', {}, 1.2);
    const amb = AMBIENTES[indice];
    if (amb) bucle('ambiente', amb[0], amb[1], 1.4);
    if (indice === 10) despues(0.8, () => bucle('musica', 'musica-cuarto', {}, 2));
    if (indice === 12) despues(0.8, () => bucle('musica', 'musica-concierto', {}, 1.2));
    conectarAnimaciones();
  };

  let prevEncendiendo = false;
  let prevApagando = false;
  let prevIntro = false;
  let prevEstatica = false;

  new MutationObserver(() => {
    const enc = pantalla.classList.contains('is-powering-on');
    if (enc && !prevEncendiendo) S.tocar('tv-encender');
    prevEncendiendo = enc;

    const apa = pantalla.classList.contains('is-powering-off');
    if (apa && !prevApagando){
      S.tocar('tv-apagar');
      callarEscena(0.2);
      detenerZumbido();
      canal = -1;
    }
    prevApagando = apa;

    const intro = pantalla.classList.contains('is-intro');
    if (intro && !prevIntro){
      callarEscena(0.15);
      detenerZumbido();
    }
    prevIntro = intro;
  }).observe(pantalla, { attributes: true, attributeFilter: ['class'] });

  new MutationObserver(() => {
    const est = estatica.classList.contains('is-active');
    if (est && !prevEstatica){
      S.tocar('tv-estatica');
      if (activo() && canal >= 0) callarEscena(0.18);
    }
    prevEstatica = est;
  }).observe(estatica, { attributes: true, attributeFilter: ['class'] });

  pulsadores.forEach((b) => {
    b.addEventListener('click', () => { S.tocar('tv-boton'); });
  });

  document.addEventListener('escena-fin', () => {
    if (!activo() || recien('aviso-fin', 600)) return;
    S.tocar('aviso-fin', { retardo: 0.05 });
  });

  document.addEventListener('entrada:inicio', (e) => {
    const c = e.detail;
    if (!c) return;
    const arrancar = () => {
      if (entradaLinea) entradaLinea.parar(0.1);
      if (entradaAmbiente) entradaAmbiente.parar(0.2);
      window.clearTimeout(entradaTimer);
      const items = [];
      (c.pasos || []).forEach((t) => items.push([t, 'paso', { tipo: 'hierba', vol: 0.32 }]));
      items.push([c.sorpresa, 'sorpresa']);
      items.push([c.burbuja, 'burbuja-entrada']);
      items.push([c.alcanza0, 'brazo']);
      items.push([c.alcanza0 + 0.1, 'pulso']);
      items.push([c.zoom0, 'zoom', { dur: Math.max(0.8, c.zoom1 - c.zoom0) }]);
      entradaLinea = S.linea(items, {});
      entradaAmbiente = S.bucle('entrada-ambiente', {}, 0.8);
      entradaTimer = window.setTimeout(() => {
        if (entradaAmbiente){
          entradaAmbiente.parar(Math.max(0.8, c.zoom1 - c.zoom0));
          entradaAmbiente = null;
        }
      }, Math.max(0, c.zoom0 + 0.1) * 1000);
    };
    if (S.listo()) arrancar();
    else S.preparar().then((ok) => { if (ok) arrancar(); });
  });

  document.addEventListener('entrada:fin', () => {
    window.clearTimeout(entradaTimer);
    if (entradaLinea){
      entradaLinea.parar(0.5);
      entradaLinea = null;
    }
    S.parar('entrada', 0.5);
    if (entradaAmbiente){
      entradaAmbiente.parar(0.8);
      entradaAmbiente = null;
    }
  });
})();
