(function(){
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  function initOnomatopeyas(){
    const paneles = document.querySelectorAll('.panel:not(.panel-locked)');
    if (!paneles.length) return;

    paneles.forEach(panel => {
      const grito = panel.querySelector('.burst-text');
      if (!grito) return;

      function sortear(){
        if (reduceMotion.matches) return;
        const giro = (Math.random() * 22 - 4).toFixed(1);
        const brinco = (1.16 + Math.random() * 0.24).toFixed(2);
        grito.style.setProperty('--giro', giro + 'deg');
        grito.style.setProperty('--brinco', brinco);
      }

      panel.addEventListener('mouseenter', sortear);
      panel.addEventListener('focus', sortear);
    });
  }

  initReveal();
  initParallax();
  initOnomatopeyas();
})();
