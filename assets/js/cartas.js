(function(){
  'use strict';

  const M = window.Movimiento;
  const tira = document.querySelector('.reparto-tira');
  if (!tira) return;

  const cartas = Array.from(tira.querySelectorAll('.personaje'));
  const consulta = M ? M.consulta : window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducido = () => (M ? M.reducido() : consulta.matches);

  let contexto = null;
  let creados = false;

  function crearGestos(){
    if (creados) return;
    creados = true;
    cartas.forEach((carta) => {
      const boton = carta.querySelector('.personaje-boton');
      if (!boton) return;
      const id = boton.dataset.personaje;
      const gesto = boton.dataset.gesto;
      if (!id || !gesto) return;

      const hueco = document.createElement('span');
      hueco.className = 'personaje-gesto';
      hueco.setAttribute('aria-hidden', 'true');
      const img = document.createElement('img');
      img.src = 'comic/assets/personajes/expresiones/' + id + '-' + gesto + '.svg';
      img.width = 590;
      img.height = 496;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      hueco.appendChild(img);
      boton.insertBefore(hueco, boton.firstChild);
    });
  }

  function inclinar(e){
    if (reducido() || e.pointerType === 'touch') return;
    const carta = e.currentTarget;
    const caja = carta.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width;
    const y = (e.clientY - caja.top) / caja.height;
    carta.style.setProperty('--rx', ((x - 0.5) * 14).toFixed(2) + 'deg');
    carta.style.setProperty('--ry', ((0.5 - y) * 12).toFixed(2) + 'deg');
    carta.style.setProperty('--bx', (x * 100).toFixed(1) + '%');
    carta.style.setProperty('--by', (y * 100).toFixed(1) + '%');
  }

  function soltar(e){
    const carta = e.currentTarget;
    ['--rx', '--ry', '--bx', '--by'].forEach((k) => carta.style.removeProperty(k));
  }

  function encender(){
    if (reducido()) return;
    crearGestos();
    tira.classList.add('con-cartas');
  }

  function apagar(){
    tira.classList.remove('con-cartas');
    cartas.forEach((c) => ['--rx', '--ry', '--bx', '--by'].forEach((k) => c.style.removeProperty(k)));
  }

  cartas.forEach((carta) => {
    carta.addEventListener('pointermove', inclinar);
    carta.addEventListener('pointerleave', soltar);
  });

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

  function montarEntrada(g){
    const gsap = g.gsap;
    const ST = g.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);

    tira.classList.add('cartas-gsap');
    contexto = gsap.context(() => {
      const finales = cartas.map((c) => parseFloat(getComputedStyle(c).rotate) || 0);
      const mitad = (cartas.length - 1) / 2;

      gsap.set(cartas, {
        opacity: 0,
        y: 90,
        scale: 0.86,
        rotation: (i) => (i - mitad) * 11,
        transformOrigin: '50% 130%',
        transition: 'none'
      });

      const tl = gsap.timeline({ paused: true });
      tl.to(cartas, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: (i) => finales[i],
        duration: 0.85,
        ease: 'back.out(1.5)',
        stagger: 0.11,
        clearProps: 'transform,opacity,transition,transformOrigin'
      });

      alEntrar(ST, tira, 'top 86%', () => tl.play());
    });
    ST.refresh();
  }

  function desmontarEntrada(){
    if (contexto){
      contexto.revert();
      contexto = null;
    }
    tira.classList.remove('cartas-gsap');
  }

  encender();

  if (M){
    M.listo.then((g) => {
      if (g && !reducido() && !contexto) montarEntrada(g);
    });
  }

  document.addEventListener('movimiento', (e) => {
    if (e.detail.reducido){
      desmontarEntrada();
      apagar();
    } else {
      encender();
      if (M) M.cargar().then((g) => {
        if (g && !contexto) montarEntrada(g);
      });
    }
  });
})();
