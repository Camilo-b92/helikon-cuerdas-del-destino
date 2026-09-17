const inkFill = document.getElementById('inkFill');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.panel').forEach(panel => {

  panel.addEventListener('mousemove', (e) => {
    if (reduceMotion.matches) return;

    const rect = panel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    panel.style.transform =
      `perspective(1200px) rotateX(${y * -2.5}deg) rotateY(${x * 2.5}deg) translate(-5px, -7px)`;
  });

  panel.addEventListener('mouseleave', () => {
    panel.style.transform = '';
  });
});

function updateReadingProgress(){
  if (!inkFill) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  inkFill.style.height = `${progress}%`;
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

const COUNT_DURATION_MS = 900;

function animateCount(el){
  const original = el.textContent.trim();
  const parts = original.match(/^(\D*)(\d+)(.*)$/);
  if (!parts) return;

  const prefix = parts[1];
  const target = Number(parts[2]);
  const suffix = parts[3];
  const start = performance.now();

  function frame(now){
    const t = Math.min((now - start) / COUNT_DURATION_MS, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;

    if (t < 1){
      requestAnimationFrame(frame);
    } else {
      el.textContent = original;
    }
  }

  requestAnimationFrame(frame);
}

const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length && !reduceMotion.matches && 'IntersectionObserver' in window){
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => countObserver.observe(el));
}

function initLinea(){
  const tira = document.getElementById('lineaTira');
  const cuerda = document.getElementById('lineaCuerda');
  if (!tira || !cuerda) return;

  const MIN = 1972;
  const MAX = 2026;
  const PAUSA_REPRODUCCION = 2800;

  const hitos = Array.from(tira.querySelectorAll('.hito'));
  const anioEl = document.getElementById('lineaAnio');
  const marcadorAnio = anioEl.parentElement;
  const tituloEl = document.getElementById('lineaTituloActivo');
  const discosEl = document.getElementById('lineaDiscos');
  const grammyEl = document.getElementById('lineaGrammy');
  const posicionEl = document.getElementById('lineaPosicion');
  const totalEl = document.getElementById('lineaTotal');
  const anuncio = document.getElementById('lineaAnuncio');
  const puntosEl = document.getElementById('lineaPuntos');
  const btnPlay = document.getElementById('lineaPlay');
  const btnAnterior = document.getElementById('lineaAnterior');
  const btnSiguiente = document.getElementById('lineaSiguiente');
  const filtros = Array.from(document.querySelectorAll('.filtro'));

  const fraccion = (anio) => (anio - MIN) / (MAX - MIN);
  const anioDe = (h) => Number(h.dataset.anio);
  const etiquetaDe = (h) => h.querySelector('.hito-anio').textContent;
  const tituloDe = (h) => h.querySelector('.hito-titulo').textContent;
  const visibles = () => hitos.filter(h => !h.hidden);

  const puntos = hitos.map(h => {
    const punto = document.createElement('span');
    punto.className = 'punto';
    punto.dataset.tipo = h.dataset.tipo;
    punto.style.setProperty('--pos', fraccion(anioDe(h)).toFixed(4));
    puntosEl.append(punto);
    return punto;
  });

  let activo = 0;
  let reproduciendo = null;
  let anuncioTimer = null;
  let scrollPendiente = false;
  let arrastrandoCuerda = false;
  let ignorarClick = false;
  let navegando = null;
  let navegandoTimer = null;

  function apilar(){
    const porAnio = {};
    hitos.forEach((h, n) => {
      if (h.hidden) return;
      const anio = anioDe(h);
      puntos[n].style.setProperty('--apilado', porAnio[anio] || 0);
      porAnio[anio] = (porAnio[anio] || 0) + 1;
    });
  }

  function capturar(el, id){
    try {
      el.setPointerCapture(id);
    } catch (err) {
      return;
    }
  }

  function reiniciarAnimacion(el, clase){
    if (reduceMotion.matches) return;
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
  }

  function marcarActivo(i){
    const hito = hitos[i];
    if (!hito) return;
    const cambia = i !== activo;
    activo = i;

    hitos.forEach((h, n) => h.classList.toggle('activo', n === i));
    puntos.forEach((p, n) => p.classList.toggle('activo', n === i));

    anioEl.textContent = etiquetaDe(hito);
    tituloEl.textContent = tituloDe(hito);
    discosEl.textContent = hitos.filter((h, n) => n <= i && h.hasAttribute('data-disco')).length;
    grammyEl.textContent = hitos.filter((h, n) => n <= i && h.hasAttribute('data-grammy')).length;

    const lista = visibles();
    posicionEl.textContent = lista.indexOf(hito) + 1;
    totalEl.textContent = lista.length;

    cuerda.setAttribute('aria-valuenow', anioDe(hito));
    cuerda.setAttribute('aria-valuetext', etiquetaDe(hito) + ': ' + tituloDe(hito));
    if (!arrastrandoCuerda){
      cuerda.style.setProperty('--progreso', fraccion(anioDe(hito)).toFixed(4));
    }

    if (cambia){
      reiniciarAnimacion(marcadorAnio, 'late');
      reiniciarAnimacion(cuerda, 'vibra');
    }

    clearTimeout(anuncioTimer);
    anuncioTimer = setTimeout(() => {
      anuncio.textContent = etiquetaDe(hito) + '. ' + tituloDe(hito) + '. ' +
        hito.querySelector('.hito-texto').textContent;
    }, 500);
  }

  function irA(i, suave = true){
    const hito = hitos[i];
    if (!hito || hito.hidden) return;
    const conSuavidad = suave && !reduceMotion.matches;
    const destino = hito.offsetLeft - (tira.clientWidth - hito.offsetWidth) / 2;
    navegando = i;
    clearTimeout(navegandoTimer);
    navegandoTimer = setTimeout(() => { navegando = null; }, conSuavidad ? 900 : 80);
    tira.scrollTo({ left: destino, behavior: conSuavidad ? 'smooth' : 'auto' });
    marcarActivo(i);
  }

  function masCercanoAlCentro(){
    const centro = tira.scrollLeft + tira.clientWidth / 2;
    let mejor = -1;
    let distancia = Infinity;
    hitos.forEach((h, n) => {
      if (h.hidden) return;
      const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - centro);
      if (d < distancia){ distancia = d; mejor = n; }
    });
    return mejor;
  }

  function masCercanoAlAnio(anio){
    let mejor = -1;
    let distancia = Infinity;
    hitos.forEach((h, n) => {
      if (h.hidden) return;
      const d = Math.abs(anioDe(h) - anio);
      if (d < distancia){ distancia = d; mejor = n; }
    });
    return mejor;
  }

  function paso(direccion){
    const lista = visibles();
    const actual = Math.max(0, lista.indexOf(hitos[activo]));
    const siguiente = lista[Math.min(lista.length - 1, Math.max(0, actual + direccion))];
    irA(hitos.indexOf(siguiente));
  }

  function extremo(final){
    const lista = visibles();
    irA(hitos.indexOf(final ? lista[lista.length - 1] : lista[0]));
  }

  function parar(){
    if (!reproduciendo) return;
    clearInterval(reproduciendo);
    reproduciendo = null;
    btnPlay.setAttribute('aria-pressed', 'false');
    btnPlay.textContent = '▶ Reproducir';
  }

  function reproducir(){
    const lista = visibles();
    if (hitos[activo] === lista[lista.length - 1]) irA(hitos.indexOf(lista[0]));
    btnPlay.setAttribute('aria-pressed', 'true');
    btnPlay.textContent = '❚❚ Pausar';
    reproduciendo = setInterval(() => {
      const actual = visibles();
      const posicion = actual.indexOf(hitos[activo]);
      if (posicion >= actual.length - 1){ parar(); return; }
      irA(hitos.indexOf(actual[posicion + 1]));
    }, PAUSA_REPRODUCCION);
  }

  function teclado(e){
    const acciones = {
      ArrowRight: () => paso(1),
      ArrowLeft: () => paso(-1),
      ArrowUp: () => paso(1),
      ArrowDown: () => paso(-1),
      Home: () => extremo(false),
      End: () => extremo(true)
    };
    if (!acciones[e.key]) return;
    e.preventDefault();
    parar();
    acciones[e.key]();
  }

  tira.addEventListener('scroll', () => {
    if (scrollPendiente) return;
    scrollPendiente = true;
    requestAnimationFrame(() => {
      scrollPendiente = false;
      const i = masCercanoAlCentro();
      if (navegando !== null){
        if (i === navegando) navegando = null;
        return;
      }
      if (i >= 0 && i !== activo) marcarActivo(i);
    });
  }, { passive: true });

  tira.addEventListener('scrollend', () => {
    navegando = null;
  });

  hitos.forEach((h, n) => {
    h.addEventListener('click', () => {
      if (ignorarClick || n === activo) return;
      parar();
      irA(n);
    });
  });

  tira.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return;
    teclado(e);
  });
  cuerda.addEventListener('keydown', teclado);

  let arrastre = null;
  tira.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    arrastre = { x: e.clientX, scroll: tira.scrollLeft, movido: false, id: e.pointerId };
  });
  tira.addEventListener('pointermove', (e) => {
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x;
    if (!arrastre.movido && Math.abs(dx) > 6){
      arrastre.movido = true;
      tira.classList.add('arrastrando');
      capturar(tira, arrastre.id);
      parar();
    }
    if (arrastre.movido) tira.scrollLeft = arrastre.scroll - dx;
  });
  function soltarTira(){
    if (!arrastre) return;
    const movido = arrastre.movido;
    arrastre = null;
    if (!movido) return;
    tira.classList.remove('arrastrando');
    ignorarClick = true;
    setTimeout(() => { ignorarClick = false; }, 0);
    irA(masCercanoAlCentro());
  }
  tira.addEventListener('pointerup', soltarTira);
  tira.addEventListener('pointercancel', soltarTira);

  function moverPua(clientX){
    const caja = cuerda.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - caja.left) / caja.width));
    const i = masCercanoAlAnio(MIN + f * (MAX - MIN));
    if (i >= 0 && i !== activo) irA(i, false);
    cuerda.style.setProperty('--progreso', f.toFixed(4));
  }
  cuerda.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    arrastrandoCuerda = true;
    parar();
    capturar(cuerda, e.pointerId);
    cuerda.classList.add('arrastrando');
    moverPua(e.clientX);
  });
  cuerda.addEventListener('pointermove', (e) => {
    if (arrastrandoCuerda) moverPua(e.clientX);
  });
  function soltarCuerda(){
    if (!arrastrandoCuerda) return;
    arrastrandoCuerda = false;
    cuerda.classList.remove('arrastrando');
    cuerda.style.setProperty('--progreso', fraccion(anioDe(hitos[activo])).toFixed(4));
    reiniciarAnimacion(cuerda, 'vibra');
  }
  cuerda.addEventListener('pointerup', soltarCuerda);
  cuerda.addEventListener('pointercancel', soltarCuerda);

  btnAnterior.addEventListener('click', () => { parar(); paso(-1); });
  btnSiguiente.addEventListener('click', () => { parar(); paso(1); });
  btnPlay.addEventListener('click', () => { reproduciendo ? parar() : reproducir(); });

  filtros.forEach(boton => {
    boton.addEventListener('click', () => {
      const filtro = boton.dataset.filtro;
      filtros.forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
      hitos.forEach((h, n) => {
        const entra = filtro === 'todo' || h.dataset.tipo === filtro;
        h.hidden = !entra;
        puntos[n].hidden = !entra;
      });
      apilar();
      parar();
      const destino = hitos[activo].hidden ? masCercanoAlAnio(anioDe(hitos[activo])) : activo;
      irA(destino, false);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
  });

  let redimension = null;
  window.addEventListener('resize', () => {
    clearTimeout(redimension);
    redimension = setTimeout(() => irA(activo, false), 150);
  });

  apilar();
  irA(0, false);
}

initLinea();
