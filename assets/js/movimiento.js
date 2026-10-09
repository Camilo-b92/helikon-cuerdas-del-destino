(function(){
  'use strict';

  var CLAVE = 'helikon-animaciones';
  var raiz = document.documentElement;
  var script = document.currentScript;
  var sistema = window.matchMedia('(prefers-reduced-motion: reduce)');
  var oyentes = [];
  var interruptor = null;
  var promesaGsap = null;
  var pedidos = [];
  var base = null;

  try {
    base = new URL('../vendor/gsap/', script.src).href;
  } catch (e) {
    base = null;
  }

  function leerGuardado(){
    try {
      return window.localStorage.getItem(CLAVE);
    } catch (e) {
      return null;
    }
  }

  function guardar(valor){
    try {
      window.localStorage.setItem(CLAVE, valor);
    } catch (e) {
      return;
    }
  }

  var guardado = leerGuardado();
  var apagado = guardado === 'no';
  // El sistema pide menos movimiento, pero el lector eligió activarlo aquí a propósito.
  var forzado = guardado === 'forzado';

  function reducido(){
    return sistema.matches ? !forzado : apagado;
  }

  var consulta = {
    get matches(){ return reducido(); },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: function(tipo, fn){
      if (tipo === 'change' && oyentes.indexOf(fn) === -1) oyentes.push(fn);
    },
    removeEventListener: function(tipo, fn){
      var i = oyentes.indexOf(fn);
      if (tipo === 'change' && i !== -1) oyentes.splice(i, 1);
    }
  };

  function nombresValidos(texto){
    return String(texto || '')
      .split(',')
      .map(function(n){ return n.trim(); })
      .filter(function(n){ return /^[A-Za-z]+$/.test(n); });
  }

  function cargarScript(src){
    return new Promise(function(ok, mal){
      var s = document.createElement('script');
      s.src = src;
      s.onload = function(){ ok(); };
      s.onerror = function(){ mal(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  function cargar(nombres){
    var extra = nombresValidos(Array.isArray(nombres) ? nombres.join(',') : nombres);
    extra.forEach(function(n){
      if (pedidos.indexOf(n) === -1) pedidos.push(n);
    });

    if (reducido() || !base) return Promise.resolve(null);

    if (!promesaGsap){
      var archivos = ['gsap'].concat(pedidos);
      promesaGsap = archivos.reduce(function(cadena, nombre){
        return cadena.then(function(){ return cargarScript(base + nombre + '.min.js'); });
      }, Promise.resolve()).then(function(){
        var g = window.gsap;
        if (!g) return null;
        var plugins = pedidos.map(function(n){ return window[n]; }).filter(Boolean);
        if (plugins.length) g.registerPlugin.apply(g, plugins);
        return { gsap: g, ScrollTrigger: window.ScrollTrigger || null };
      }).catch(function(){
        promesaGsap = null;
        return null;
      });
    } else if (extra.length){
      promesaGsap = promesaGsap.then(function(g){
        if (!g) return g;
        var faltan = extra.filter(function(n){ return !window[n]; });
        return faltan.reduce(function(cadena, nombre){
          return cadena.then(function(){ return cargarScript(base + nombre + '.min.js'); });
        }, Promise.resolve()).then(function(){
          var plugins = extra.map(function(n){ return window[n]; }).filter(Boolean);
          if (plugins.length) g.gsap.registerPlugin.apply(g.gsap, plugins);
          return g;
        }).catch(function(){ return g; });
      });
    }

    return promesaGsap.then(function(g){
      if (g && !reducido()) raiz.classList.add('anim');
      return g;
    });
  }

  function aplicar(){
    raiz.setAttribute('data-movimiento', reducido() ? 'reducido' : 'completo');
    if (reducido()){
      raiz.classList.remove('anim');
      raiz.classList.remove('anim-espera');
    }
    if (interruptor) pintarInterruptor();
  }

  function avisar(){
    var detalle = { reducido: reducido() };
    oyentes.slice().forEach(function(fn){ fn({ matches: detalle.reducido, media: consulta.media }); });
    document.dispatchEvent(new CustomEvent('movimiento', { detail: detalle }));
    if (!detalle.reducido && script && script.hasAttribute('data-gsap')) cargar();
  }

  function pintarInterruptor(){
    var activas = !reducido();
    interruptor.setAttribute('aria-pressed', activas ? 'true' : 'false');
    interruptor.querySelector('.menu-animaciones-estado').textContent = activas ? 'sí' : 'no';
    interruptor.title = sistema.matches
      ? 'Tu sistema pide menos movimiento. Actívalo aquí si quieres ver las animaciones.'
      : '';
  }

  function crearInterruptor(){
    var lista = document.querySelector('.menu-lista');
    if (!lista || document.querySelector('.menu-animaciones')) return;

    var item = document.createElement('li');
    item.className = 'menu-extra';

    interruptor = document.createElement('button');
    interruptor.type = 'button';
    interruptor.className = 'menu-animaciones';
    interruptor.innerHTML =
      '<span class="visualmente-oculto">Animaciones</span>' +
      '<span class="menu-animaciones-rotulo" aria-hidden="true">Anim.</span>' +
      '<span class="menu-animaciones-estado" aria-hidden="true"></span>';
    pintarInterruptor();

    interruptor.addEventListener('click', function(){
      if (sistema.matches){
        forzado = !forzado;
        guardar(forzado ? 'forzado' : 'si');
      } else {
        apagado = !apagado;
        guardar(apagado ? 'no' : 'si');
      }
      aplicar();
      avisar();
    });

    item.appendChild(interruptor);
    lista.appendChild(item);
  }

  if (sistema.addEventListener){
    sistema.addEventListener('change', function(){
      aplicar();
      avisar();
    });
  }

  aplicar();

  var declarado = script && script.hasAttribute('data-gsap') ? script.getAttribute('data-gsap') : null;

  function terminarEspera(){
    raiz.classList.remove('anim-espera');
  }

  if (declarado !== null && !reducido()){
    raiz.classList.add('anim-espera');
    window.setTimeout(terminarEspera, 3500);
  }

  var listo = declarado === null ? Promise.resolve(null) : cargar(declarado);

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', crearInterruptor);
  } else {
    crearInterruptor();
  }

  window.Movimiento = {
    reducido: reducido,
    consulta: consulta,
    cargar: cargar,
    listo: listo,
    liberar: terminarEspera
  };
})();
