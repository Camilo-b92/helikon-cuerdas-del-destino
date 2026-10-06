const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let audioCtx = null;

function playClickSound(){
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  try {
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = 400;
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (err) {
  }
}

function initPortada(){
  const portada = document.getElementById('portada');
  if (!portada) return;

  const capas = Array.from(portada.querySelectorAll('.capa'));
  let x = 0;
  let y = 0;
  let pendiente = false;

  function aplicar(){
    pendiente = false;
    capas.forEach(capa => {
      const profundidad = Number(capa.dataset.profundidad) || 0;
      capa.style.translate = `${(x * profundidad).toFixed(2)}px ${(y * profundidad).toFixed(2)}px`;
    });
  }

  function pedir(){
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(aplicar);
  }

  portada.addEventListener('pointermove', (e) => {
    if (reduceMotion.matches || e.pointerType !== 'mouse') return;
    const caja = portada.getBoundingClientRect();
    x = (e.clientX - caja.left) / caja.width - 0.5;
    y = (e.clientY - caja.top) / caja.height - 0.5;
    pedir();
  });

  portada.addEventListener('pointerleave', () => {
    x = 0;
    y = 0;
    pedir();
  });
}

initPortada();

function initPistaBajar(){
  const pista = document.querySelector('.baja-pista');
  if (!pista) return;

  function actualizar(){
    pista.classList.toggle('baja-oculta', window.scrollY > 80);
  }

  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}
initPistaBajar();

document.querySelectorAll('.panel').forEach(panel => {

  panel.addEventListener('click', playClickSound);

  panel.addEventListener('mousemove', (e) => {
    if (reduceMotion.matches) return;

    const rect = panel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    panel.style.transform =
      `perspective(1200px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translate(-5px, -8px) scale(1.01)`;

    panel.style.backgroundImage =
      `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.10), transparent 50%)`;
  });

  panel.addEventListener('mouseenter', () => {
    panel.style.zIndex = '10';
  });

  panel.addEventListener('mouseleave', () => {
    panel.style.transform = '';
    panel.style.backgroundImage = '';
    panel.style.zIndex = '';
  });
});


const expediente = document.getElementById('expediente');
const expHoja = expediente ? expediente.querySelector('.expediente-hoja') : null;
const expArte = document.getElementById('expedienteArte');
const expRol = document.getElementById('expedienteRol');
const expNombre = document.getElementById('expedienteNombre');
const expDatos = document.getElementById('expedienteDatos');
const expNota = document.getElementById('expedienteNota');
const expGestos = document.getElementById('expedienteGestos');
const expTira = document.getElementById('expedienteTira');
const expIndice = document.getElementById('expedienteIndice');

const ORDEN_REPARTO = ['nino', 'padre', 'juanes', 'madre', 'ente'];
const NOMBRE_GESTO = {
  alegria: 'Alegría', tristeza: 'Tristeza', asombro: 'Asombro', miedo: 'Miedo',
  enojo: 'Enojo', aburrimiento: 'Aburrimiento', desagrado: 'Desagrado',
  somnoliento: 'Somnoliento'
};

const fichas = (window.PERSONAJES || [])
  .slice()
  .sort((a, b) => ORDEN_REPARTO.indexOf(a.id) - ORDEN_REPARTO.indexOf(b.id));

let fichaActual = 0;
let gestoActual = 'figura';
let devolverFocoA = null;

function rutaFigura(p, gesto){
  return gesto === 'figura'
    ? 'comic/assets/personajes/' + p.id + '.svg'
    : 'comic/assets/personajes/expresiones/' + p.id + '-' + gesto + '.svg';
}

function pintarGestos(p){
  expGestos.textContent = '';
  ['figura'].concat(p.gestos).forEach(g => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'expediente-gesto';
    b.textContent = g === 'figura' ? 'Figura' : (NOMBRE_GESTO[g] || g);
    b.setAttribute('aria-pressed', String(g === gestoActual));
    b.addEventListener('click', () => {
      gestoActual = g;
      expArte.src = rutaFigura(p, g);
      expArte.alt = p.nombre + (g === 'figura' ? ', figura completa' : ', expresión de ' + b.textContent.toLowerCase());
      [...expGestos.children].forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    });
    expGestos.appendChild(b);
  });
}

function pintarTira(){
  expTira.textContent = '';
  fichas.forEach((p, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'expediente-mini personaje--' + p.color;
    b.setAttribute('aria-current', String(i === fichaActual));
    b.title = p.nombre;
    const img = document.createElement('img');
    img.src = 'comic/assets/personajes/' + p.id + '.svg';
    img.alt = p.nombre;
    img.width = 760; img.height = 1000;
    b.appendChild(img);
    b.addEventListener('click', () => mostrarFicha(i));
    li.appendChild(b);
    expTira.appendChild(li);
  });
}

function mostrarFicha(i){
  if (!fichas.length) return;
  fichaActual = (i + fichas.length) % fichas.length;
  const p = fichas[fichaActual];
  gestoActual = 'figura';

  expHoja.dataset.color = p.color;
  expArte.src = rutaFigura(p, 'figura');
  expArte.alt = p.nombre + ', figura completa';
  expRol.textContent = p.rol;
  expNombre.textContent = p.nombre;
  expNota.textContent = p.nota;
  expIndice.textContent = (fichaActual + 1) + ' de ' + fichas.length;

  expDatos.textContent = '';
  p.datos.forEach(([clave, valor]) => {
    const dt = document.createElement('dt');
    dt.textContent = clave;
    const dd = document.createElement('dd');
    dd.textContent = valor;
    expDatos.append(dt, dd);
  });

  pintarGestos(p);
  pintarTira();
}

function abrirExpediente(id, origen){
  const i = fichas.findIndex(p => p.id === id);
  if (i < 0) return;
  devolverFocoA = origen || null;
  mostrarFicha(i);
  expediente.hidden = false;
  document.body.classList.add('con-expediente');
  expHoja.focus();
}

function cerrarExpediente(){
  expediente.hidden = true;
  document.body.classList.remove('con-expediente');
  if (devolverFocoA) devolverFocoA.focus();
  devolverFocoA = null;
}

if (expediente && fichas.length){
  document.querySelectorAll('.personaje-boton').forEach(b => {
    b.addEventListener('click', () => abrirExpediente(b.dataset.personaje, b));
  });

  expediente.querySelectorAll('[data-cerrar]').forEach(b => {
    b.addEventListener('click', cerrarExpediente);
  });

  expediente.querySelectorAll('[data-paso]').forEach(b => {
    b.addEventListener('click', () => mostrarFicha(fichaActual + Number(b.dataset.paso)));
  });

  document.addEventListener('keydown', (e) => {
    if (expediente.hidden) return;
    if (e.key === 'Escape'){ cerrarExpediente(); return; }
    if (e.key === 'ArrowRight'){ mostrarFicha(fichaActual + 1); return; }
    if (e.key === 'ArrowLeft'){ mostrarFicha(fichaActual - 1); return; }

    if (e.key === 'Tab'){
      const focos = expHoja.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focos.length) return;
      const primero = focos[0], ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero){ e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo){ e.preventDefault(); primero.focus(); }
    }
  });
}
