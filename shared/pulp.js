/* =========================================================
   PULP — comportamientos compartidos por Home, Helikón y Juanes.

   1) Revelado de las secciones marcadas con [data-reveal] al
      entrar en pantalla.
   2) Paralaje suave del masthead siguiendo el cursor.

   Va todo dentro de una IIFE para no dejar variables sueltas
   que choquen con el script propio de cada página. Se enlaza
   ANTES del script de la página:

       <script src="../shared/pulp.js"></script>
       <script src="script.js"></script>
   ========================================================= */
(function(){
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* -------------------------------------------------------
     Revelado al hacer scroll
     La clase .js-reveal en <html> es la que activa el estado
     oculto en el CSS. Se pone desde aquí para que, si el JS no
     llega a ejecutarse, el contenido se vea igual en vez de
     quedarse invisible para siempre.
     ------------------------------------------------------- */
  function initReveal(){
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)){
      targets.forEach(el => el.classList.add('in-view'));
      return;
    }

    document.documentElement.classList.add('js-reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* -------------------------------------------------------
     Paralaje del masthead
     El valor se acumula y se aplica una sola vez por frame:
     mousemove dispara muchas más veces de las que el navegador
     alcanza a pintar.
     ------------------------------------------------------- */
  function initParallax(){
    const emblem = document.querySelector('.emblem');
    if (!emblem) return;

    let x = 0;
    let y = 0;
    let queued = false;

    function apply(){
      queued = false;
      emblem.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
    }

    document.addEventListener('mousemove', (e) => {
      if (reduceMotion.matches) return;

      x = ((e.clientX / window.innerWidth) * 5 - 2.5) * 0.5;
      y = -((e.clientY / window.innerHeight) * 5 - 2.5) * 0.5;

      if (!queued){
        queued = true;
        requestAnimationFrame(apply);
      }
    });
  }

  initReveal();
  initParallax();
})();
