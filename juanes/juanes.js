const inkFill = document.getElementById('inkFill');
const reduceMotion = (window.Movimiento ? window.Movimiento.consulta : window.matchMedia('(prefers-reduced-motion: reduce)'));

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

  const MIN = 1988;
  const MAX = 2026;
  const PAUSA_REPRODUCCION = 2800;

  const hitos = Array.from(tira.querySelectorAll('.hito'));
  const anioEl = document.getElementById('lineaAnio');
  const marcadorAnio = anioEl.parentElement;
  const tituloEl = document.getElementById('lineaTituloActivo');
  const discosEl = document.getElementById('lineaDiscos');
  const posicionEl = document.getElementById('lineaPosicion');
  const totalEl = document.getElementById('lineaTotal');
  const anuncio = document.getElementById('lineaAnuncio');
  const puntosEl = document.getElementById('lineaPuntos');
  const btnPlay = document.getElementById('lineaPlay');
  const btnAnterior = document.getElementById('lineaAnterior');
  const btnSiguiente = document.getElementById('lineaSiguiente');

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

    document.dispatchEvent(new CustomEvent('linea:hito', {
      detail: {
        anio: etiquetaDe(hito),
        titulo: tituloDe(hito),
        clase: hito.querySelector('.hito-tipo').textContent.trim()
      }
    }));

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

function initRuta(){
  const ruta = document.getElementById('ruta');
  const camino = document.getElementById('rutaCamino');
  const pin = document.getElementById('rutaPin');
  if (!ruta || !camino || !pin) return;

  const pestanas = Array.from(ruta.querySelectorAll('.ruta-pestana'));
  const paradas = Array.from(ruta.querySelectorAll('.ruta-parada'));
  const largo = camino.getTotalLength();
  const destinos = { medellin: 0, carolina: 1, casa: 1, estatua: 1 };

  let fraccion = 0;
  let viaje = null;

  function colocar(f){
    fraccion = f;
    const p = camino.getPointAtLength(largo * f);
    pin.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
    camino.style.strokeDashoffset = String(100 * (1 - f));
  }

  function suavizar(t){
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function moverA(destino){
    if (viaje) cancelAnimationFrame(viaje);
    viaje = null;
    if (reduceMotion.matches || Math.abs(destino - fraccion) < 0.001){
      colocar(destino);
      return;
    }
    const desde = fraccion;
    const duracion = 500 + Math.abs(destino - desde) * 1700;
    const inicio = performance.now();
    function paso(ahora){
      const t = Math.min(1, (ahora - inicio) / duracion);
      colocar(desde + (destino - desde) * suavizar(t));
      viaje = t < 1 ? requestAnimationFrame(paso) : null;
    }
    viaje = requestAnimationFrame(paso);
  }

  function elegir(id, enfocar){
    pestanas.forEach((pestana) => {
      const activa = pestana.dataset.parada === id;
      pestana.setAttribute('aria-selected', String(activa));
      pestana.tabIndex = activa ? 0 : -1;
      const panel = document.getElementById(pestana.getAttribute('aria-controls'));
      panel.hidden = !activa;
      if (activa && enfocar) pestana.focus();
    });
    paradas.forEach((parada) => {
      parada.setAttribute('aria-pressed', String(parada.dataset.parada === id));
    });
    moverA(destinos[id]);
  }

  pestanas.forEach((pestana, n) => {
    pestana.addEventListener('click', () => elegir(pestana.dataset.parada, false));
    pestana.addEventListener('keydown', (e) => {
      const teclas = { ArrowRight: 1, ArrowLeft: -1 };
      let destino = null;
      if (teclas[e.key]) destino = (n + teclas[e.key] + pestanas.length) % pestanas.length;
      if (e.key === 'Home') destino = 0;
      if (e.key === 'End') destino = pestanas.length - 1;
      if (destino === null) return;
      e.preventDefault();
      elegir(pestanas[destino].dataset.parada, true);
    });
  });

  paradas.forEach((parada) => {
    parada.addEventListener('click', () => elegir(parada.dataset.parada, false));
  });

  reduceMotion.addEventListener('change', () => colocar(fraccion));

  colocar(0);
  elegir('medellin', false);
}

function initCartas(){
  const lista = document.querySelector('.cartas');
  if (!lista) return;
  lista.classList.add('cartas--activas');

  lista.querySelectorAll('.carta').forEach((carta) => {
    const boton = carta.querySelector('.carta-voltear');
    const frente = carta.querySelector('.carta-frente');
    const dorso = carta.querySelector('.carta-dorso');

    function pintar(volteada){
      carta.classList.toggle('volteada', volteada);
      boton.setAttribute('aria-pressed', String(volteada));
      frente.inert = volteada;
      dorso.inert = !volteada;
    }

    boton.addEventListener('click', () => pintar(!carta.classList.contains('volteada')));
    pintar(false);
  });
}

function initMuro(){
  const lista = document.getElementById('muroLista');
  const detalle = document.getElementById('muroDetalle');
  const muro = document.getElementById('muro');
  if (!lista || !detalle || !muro) return;

  const anios = Array.from(lista.querySelectorAll('.muro-anio'));
  const filtros = Array.from(muro.querySelectorAll('.filtro'));
  const NS = 'http://www.w3.org/2000/svg';

  function estatuilla(serie, orden){
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'est est--' + serie);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.setProperty('--orden', orden);
    const uso = document.createElementNS(NS, 'use');
    uso.setAttribute('href', '#icono-premio');
    svg.appendChild(uso);
    return svg;
  }

  anios.forEach((li) => {
    const grammy = Number(li.dataset.grammy) || 0;
    const latin = Number(li.dataset.latin) || 0;
    const anio = li.dataset.anio;
    const partes = [];
    if (grammy) partes.push(grammy + ' Grammy');
    if (latin) partes.push(latin + ' Latin Grammy');

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'muro-boton';
    boton.setAttribute('aria-pressed', 'false');
    boton.setAttribute('aria-label', anio + ': ' + partes.join(' y '));

    const pila = document.createElement('span');
    pila.className = 'muro-pila';
    pila.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < latin; k++) pila.appendChild(estatuilla('latin', k));
    for (let k = 0; k < grammy; k++) pila.appendChild(estatuilla('grammy', latin + k));

    const etiqueta = document.createElement('span');
    etiqueta.className = 'muro-etiqueta';
    etiqueta.setAttribute('aria-hidden', 'true');
    etiqueta.textContent = anio;

    boton.append(pila, etiqueta);
    li.append(boton);

    boton.addEventListener('click', () => {
      anios.forEach((otro) => {
        const b = otro.querySelector('.muro-boton');
        b.setAttribute('aria-pressed', String(b === boton));
      });
      detalle.textContent = anio + '. ' + li.dataset.detalle;
    });
  });

  filtros.forEach((boton) => {
    boton.addEventListener('click', () => {
      const filtro = boton.dataset.filtro;
      filtros.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      muro.dataset.filtro = filtro;
      anios.forEach((li) => {
        const tiene = filtro === 'todo' ||
          (filtro === 'grammy' && li.dataset.grammy) ||
          (filtro === 'latin' && li.dataset.latin);
        li.hidden = !tiene;
      });
      detalle.textContent = 'Elige un año del muro.';
      anios.forEach((li) => {
        const b = li.querySelector('.muro-boton');
        if (b) b.setAttribute('aria-pressed', 'false');
      });
    });
  });

  if ('IntersectionObserver' in window){
    const vigia = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting){
        muro.classList.add('muro--lleno');
        vigia.disconnect();
      }
    }, { threshold: 0.25 });
    vigia.observe(lista);
  } else {
    muro.classList.add('muro--lleno');
  }
}

function initReproductor(){
  const caja = document.getElementById('reproductor');
  const boton = document.getElementById('reproductorCargar');
  if (!caja || !boton) return;

  boton.addEventListener('click', () => {
    const marco = document.createElement('iframe');
    marco.title = 'Reproductor de Spotify — Juanes';
    marco.src = 'https://open.spotify.com/embed/artist/0UWZUmn7sybxMCqrw9tGa7?utm_source=generator&theme=0';
    marco.width = '100%';
    marco.height = '352';
    marco.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    marco.setAttribute('allowfullscreen', '');
    marco.className = 'reproductor-marco';

    const panel = document.createElement('div');
    panel.className = 'music-panel';
    panel.appendChild(marco);

    boton.replaceWith(panel);
    marco.focus();
  });
}

function cargarCuandoSeAcerque(selector, modulo){
  const objetivo = document.querySelector(selector);
  if (!objetivo) return;

  function cargar(){
    import(modulo).catch(() => {});
  }

  if ('IntersectionObserver' in window){
    const vigia = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting){
        vigia.disconnect();
        cargar();
      }
    }, { rootMargin: '600px 0px' });
    vigia.observe(objetivo);
  } else {
    cargar();
  }
}

initRuta();
initCartas();
initMuro();
initReproductor();
cargarCuandoSeAcerque('#guitarraEscenario', '../assets/js/guitarra.js');
cargarCuandoSeAcerque('#disco', '../assets/js/disco.js');
