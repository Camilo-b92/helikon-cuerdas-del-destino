(function(){
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  const progresivos = Array.from(document.querySelectorAll('[data-scroll]'));
  const paralajes = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!progresivos.length && !paralajes.length) return;

  const visibles = new Set();
  let enCola = false;

  function limitar(valor, min, max){
    return Math.min(max, Math.max(min, valor));
  }

  function actualizar(){
    enCola = false;
    const alto = window.innerHeight;

    progresivos.forEach((el) => {
      if (!visibles.has(el)) return;
      const caja = el.getBoundingClientRect();
      const avance = limitar((alto - caja.top) / (alto + caja.height), 0, 1);
      el.style.setProperty('--p', avance.toFixed(4));
    });

    paralajes.forEach((el) => {
      if (!visibles.has(el)) return;
      const caja = el.getBoundingClientRect();
      const desde = caja.top + caja.height / 2 - alto / 2;
      const factor = parseFloat(el.dataset.parallax) || 0;
      el.style.setProperty('--py', (-desde * factor).toFixed(1) + 'px');
    });
  }

  function pedir(){
    if (enCola) return;
    enCola = true;
    window.requestAnimationFrame(actualizar);
  }

  if ('IntersectionObserver' in window){
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) visibles.add(entrada.target);
        else visibles.delete(entrada.target);
      });
      pedir();
    }, { rootMargin: '120px 0px 120px 0px' });

    progresivos.concat(paralajes).forEach((el) => observador.observe(el));
  } else {
    progresivos.concat(paralajes).forEach((el) => visibles.add(el));
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  pedir();
})();
