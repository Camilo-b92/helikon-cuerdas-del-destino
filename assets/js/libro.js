(function(){
  'use strict';

  /* El libro que se abre al bajar (fase 3).
     - Escritorio: el libro queda fijo en pantalla; se acerca, la tapa gira 180°
       sobre el lomo y deja ver la doble página.
     - Móvil: las hojas van en columna, así que la cubierta se levanta y se desvanece.
     El scroll es el normal del navegador: aquí solo se lee su posición. */

  const M = window.Movimiento;
  if (!M) return;

  const principal = document.getElementById('contenido');
  const escenario = document.getElementById('libroEscenario');
  const libro = document.getElementById('libro');
  const tapa = document.getElementById('libroTapa');
  const dorso = document.getElementById('tapaDorso');
  const boton = document.getElementById('libroAbrir');
  const hojaIzq = document.getElementById('portada');
  const pista = document.querySelector('.baja-pista');
  if (!principal || !escenario || !libro || !tapa || !hojaIzq) return;

  const UMBRAL = 0.72;          // a partir de aquí el libro cuenta como abierto
  let aterriza = 0.8;           // dónde queda el scroll con "Abrir directo"

  let mm = null;
  let ancla = null;
  let disparador = null;
  let clon = null;
  let enganchado = false;

  /* Al apagar o encender las animaciones cambia la altura de la página (el escenario
     del libro aparece o desaparece). Para que el lector no pierda su sitio se anota
     en cada scroll qué bloque tiene cerca del borde superior y se le devuelve a él. */
  const bloques = ['.doble-pagina', '#reparto', '.contraportada']
    .map((q) => document.querySelector(q))
    .filter(Boolean);
  let pendiente = false;

  function anotarAncla(){
    pendiente = false;
    let mejor = null;
    bloques.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.5 && (!mejor || top > mejor.top)) mejor = { el: el, top: top };
    });
    ancla = mejor;
  }

  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(anotarAncla);
  }, { passive: true });
  anotarAncla();

  function restaurarAncla(){
    if (!ancla) return;
    const ahora = ancla.el.getBoundingClientRect().top;
    const dif = ahora - ancla.top;
    if (Math.abs(dif) > 1) window.scrollTo(0, Math.max(0, window.scrollY + dif));
  }

  function marcarAbierto(abierto){
    principal.classList.toggle('libro-abierto', abierto);
  }

  function abrirDirecto(e, sinFoco){
    if (!disparador) return;
    const y = disparador.start + (disparador.end - disparador.start) * aterriza;
    window.scrollTo(0, Math.round(y));
    marcarAbierto(true);
    if (sinFoco === true) return;
    const primera = escenario.querySelector('.pagina a');
    if (primera) primera.focus({ preventScroll: true });
  }

  /* Copia de la hoja izquierda que viaja en el dorso de la tapa. No es contenido:
     va oculta a los lectores de pantalla y sin ids, para no duplicar nada. */
  function crearClon(){
    quitarClon();
    clon = hojaIzq.cloneNode(true);
    clon.removeAttribute('id');
    clon.removeAttribute('aria-labelledby');
    clon.setAttribute('aria-hidden', 'true');
    clon.setAttribute('inert', '');
    clon.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clon.querySelectorAll('img').forEach((img) => {
      img.alt = '';
      img.removeAttribute('loading');
    });
    clon.querySelectorAll('h1').forEach((h) => {
      const div = document.createElement('div');
      div.className = h.className;
      while (h.firstChild) div.appendChild(h.firstChild);
      h.replaceWith(div);
    });
    dorso.insertBefore(clon, dorso.firstChild);
  }

  function quitarClon(){
    if (clon){
      clon.remove();
      clon = null;
    }
  }

  function enganchar(){
    if (enganchado) return;
    enganchado = true;

    tapa.addEventListener('click', abrirDirecto);
    if (boton) boton.addEventListener('click', abrirDirecto);

    /* Si alguien llega con Tab a una viñeta que todavía está tapada, se abre el libro. */
    escenario.addEventListener('focusin', (e) => {
      if (principal.classList.contains('libro-abierto')) return;
      if (e.target.closest('.pagina')) abrirDirecto(e, true);
    });

    if (pista){
      pista.addEventListener('click', (e) => {
        if (!disparador || principal.classList.contains('libro-abierto')) return;
        e.preventDefault();
        abrirDirecto();
      });
    }
  }

  function montar(g){
    const gsap = g.gsap;
    const ST = g.ScrollTrigger;
    if (!gsap || !ST || !gsap.matchMedia){
      M.liberar();
      return;
    }
    gsap.registerPlugin(ST);

    mm = gsap.matchMedia();

    /* ---------- Escritorio y tablet: el libro se abre de verdad ---------- */
    mm.add('(min-width: 761px)', () => {
      crearClon();

      const sombras = tapa.querySelectorAll('.tapa-sombra');
      const sombraFrente = sombras[0];
      const sombraDorso = sombras[1];

      aterriza = 0.8;
      libro.style.transform = 'none';
      gsap.set(libro, { xPercent: -25, scale: 0.74, transformOrigin: '75% 50%' });
      gsap.set(tapa, { rotationY: 0, transformOrigin: '0% 50%' });

      const linea = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: escenario,
          start: 'top top+=' + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menu-alto'), 10),
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => marcarAbierto(self.progress >= UMBRAL)
        }
      });
      disparador = linea.scrollTrigger;

      // primer tercio: el libro se acerca y se centra
      linea.to(libro, { scale: 1, duration: 0.33, ease: 'power2.out' }, 0);
      // segundo tercio: la tapa gira sobre el lomo y el libro se abre hacia el centro
      linea.to(libro, { xPercent: 0, duration: 0.39, ease: 'power2.inOut' }, 0.33);
      linea.to(tapa, { rotationY: -180, duration: 0.39, ease: 'power2.inOut' }, 0.33);
      // el canto libre de la tapa viene hacia el lector: el libro se encoge un poco
      // a mitad del giro para que no se salga de la pantalla
      linea.to(libro, { scale: 0.93, duration: 0.195, ease: 'sine.out' }, 0.33);
      linea.to(libro, { scale: 1, duration: 0.195, ease: 'sine.in' }, 0.525);
      linea.fromTo(sombraFrente, { opacity: 0 }, { opacity: 0.85, duration: 0.2, ease: 'power1.in' }, 0.33);
      linea.fromTo(sombraDorso, { opacity: 0.85 }, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.52);
      // último tercio: el libro ya está abierto; el scroll lo deja leer antes de soltarlo
      linea.to({}, { duration: 1 - UMBRAL }, UMBRAL);

      enganchar();

      return () => {
        disparador = null;
        quitarClon();
        marcarAbierto(false);
        libro.style.transform = '';
      };
    });

    /* ---------- Móvil: la cubierta se levanta y se desvanece ---------- */
    mm.add('(max-width: 760px)', () => {
      aterriza = 1;
      tapa.style.transform = 'none';
      gsap.set(tapa, { scale: 0.88, transformOrigin: '50% 0%' });
      gsap.set(hojaIzq, { opacity: 0 });

      const alto = () => Math.round(tapa.offsetHeight * 0.85);
      const linea = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: document.body,
          start: 0,
          end: () => '+=' + alto(),
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => marcarAbierto(self.progress >= 0.98)
        }
      });
      disparador = linea.scrollTrigger;

      linea.to(tapa, { scale: 1, duration: 0.4, ease: 'power2.out' }, 0);
      linea.to(tapa, { opacity: 0, yPercent: -16, scale: 1.04, duration: 0.4, ease: 'power1.in' }, 0.4);
      linea.to(hojaIzq, { opacity: 1, duration: 0.4 }, 0.6);

      enganchar();

      return () => {
        disparador = null;
        marcarAbierto(false);
        tapa.style.transform = '';
      };
    });

    ST.refresh();
    window.requestAnimationFrame(() => ST.update());
    M.liberar();
  }

  function desmontar(){
    if (mm){
      mm.revert();
      mm = null;
    }
    disparador = null;
    marcarAbierto(false);
    M.liberar();
  }

  M.listo.then((g) => {
    if (g && !M.reducido()) montar(g);
    else M.liberar();
  });

  document.addEventListener('movimiento', (e) => {
    restaurarAncla();
    if (e.detail.reducido){
      desmontar();
    } else {
      M.cargar().then((g) => {
        if (g && !mm){
          montar(g);
          restaurarAncla();
        }
      });
    }
  });
})();
