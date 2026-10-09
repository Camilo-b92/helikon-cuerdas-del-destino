(function(){
  'use strict';

  const M = window.Movimiento;
  if (!M) return;

  let contexto = null;

  function alEntrar(ST, trigger, inicio, accion){
    let hecho = false;
    const lanzar = () => {
      if (hecho) return;
      hecho = true;
      accion();
    };
    const t = ST.create({ trigger: trigger, start: inicio, once: true, onEnter: lanzar });
    if (t.progress > 0) lanzar();
  }

  function montar(g){
    const gsap = g.gsap;
    const ST = g.ScrollTrigger;
    if (!gsap || !ST || !window.DrawSVGPlugin){
      M.liberar();
      return;
    }

    contexto = gsap.context(() => {
      const limpiar = 'transform,opacity,visibility,transition';

      gsap.utils.toArray('.vineta-origen').forEach((vineta, i) => {
        const cartucho = vineta.querySelector('.cartucho');
        const golpes = vineta.querySelectorAll('.onomatopeya');
        const letras = vineta.querySelectorAll('.nombre-grande span');
        const lema = vineta.querySelector('.nombre-lema');

        gsap.set(vineta, { opacity: 0, y: 54, rotation: i % 2 ? 2.4 : -2.4 });
        if (cartucho) gsap.set(cartucho, { opacity: 0, x: -28 });
        if (golpes.length) gsap.set(golpes, { opacity: 0 });
        if (letras.length) gsap.set(letras, { opacity: 0, scale: 2.4 });
        if (lema) gsap.set(lema, { opacity: 0, y: 18 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
        tl.to(vineta, { opacity: 1, y: 0, rotation: 0, duration: 0.7, clearProps: limpiar });
        if (cartucho) tl.to(cartucho, { opacity: 1, x: 0, duration: 0.45, clearProps: limpiar }, '-=0.3');
        if (letras.length) tl.to(letras, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.09, clearProps: limpiar }, '-=0.2');
        if (lema) tl.to(lema, { opacity: 1, y: 0, duration: 0.45, clearProps: limpiar }, '-=0.1');
        if (golpes.length) tl.to(golpes, { opacity: 1, duration: 0.3, clearProps: 'opacity' }, '-=0.1');

        alEntrar(ST, vineta, 'top 84%', () => tl.play());
      });

      const camino = gsap.utils.toArray('.sendero path');
      const cumbre = document.querySelector('.cumbre');
      if (camino.length){
        gsap.set(camino, { drawSVG: '0%' });
        if (cumbre) gsap.set(cumbre, { opacity: 0, scale: 0, svgOrigin: '500 72' });
        const sube = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '.vineta-origen--monte', start: 'top 70%', end: 'bottom 30%', scrub: 0.5 }
        });
        sube.to(camino, { drawSVG: '100%', duration: 1 });
        if (cumbre) sube.to(cumbre, { opacity: 1, scale: 1, ease: 'back.out(3)', duration: 0.22 }, '>-0.04');
      }

      gsap.utils.toArray('.hilo').forEach((hilo) => {
        const lineas = hilo.querySelectorAll('.hilo-tinta, .hilo-linea');
        const estrella = hilo.querySelector('.hilo-estrella');
        gsap.set(lineas, { drawSVG: '0%' });
        if (estrella) gsap.set(estrella, { scale: 0, rotation: -60 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hilo, start: 'top 90%', end: 'bottom 60%', scrub: 0.4 }
        });
        tl.to(lineas, { drawSVG: '100%', duration: 1 });
        if (estrella) tl.to(estrella, { scale: 1, rotation: 0, ease: 'back.out(3)', duration: 0.3 }, '>-0.05');
      });

      const rejilla = document.querySelector('.team-grid');
      const fichas = gsap.utils.toArray('.team-card');
      if (rejilla && fichas.length){
        const giros = [-0.8, 0, 0.8];
        const gritos = gsap.utils.toArray('.team-grito');
        gsap.set(fichas, { opacity: 0, y: 96, rotation: (i) => [-7, 4, 7][i % 3], transition: 'none' });
        gsap.set(gritos, { opacity: 0, scale: 0, rotation: -40 });

        const tl = gsap.timeline({ paused: true });
        tl.to(fichas, {
          opacity: 1,
          y: 0,
          rotation: (i) => giros[i % 3],
          duration: 0.8,
          ease: 'back.out(1.6)',
          stagger: 0.18,
          clearProps: limpiar
        });
        tl.to(gritos, {
          opacity: 1,
          scale: 1,
          rotation: 10,
          duration: 0.45,
          ease: 'back.out(3)',
          stagger: 0.18,
          clearProps: limpiar
        }, '-=0.7');

        alEntrar(ST, rejilla, 'top 82%', () => tl.play());
      }
    });

    ST.refresh();
    window.requestAnimationFrame(() => ST.update());
    M.liberar();
  }

  function desmontar(){
    if (!contexto) return;
    contexto.revert();
    contexto = null;
    M.liberar();
  }

  M.listo.then((g) => {
    if (g && !M.reducido()) montar(g);
    else M.liberar();
  });

  document.addEventListener('movimiento', (e) => {
    if (e.detail.reducido){
      desmontar();
    } else {
      M.cargar().then((g) => {
        if (g && !contexto) montar(g);
      });
    }
  });
})();
