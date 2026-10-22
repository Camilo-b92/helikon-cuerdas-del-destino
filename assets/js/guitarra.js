import { crearVista, sinMovimiento } from './escena3d.js';

const raiz = document.getElementById('guitarra');
const escenario = document.getElementById('guitarraEscenario');

const X_PUENTE = -2.7;
const X_CEJILLA = 3.0;
const Y_PUENTE = 0.55;
const Y_CEJILLA = 0.275;
const SEPARACION_PUENTE = 0.22;
const SEPARACION_CEJILLA = 0.11;
const Z_CUERDA = 0.1;
const SEGMENTOS = 48;

function lerp(a, b, t){
  return a + (b - a) * t;
}

function leerCuerdas(){
  const botones = Array.from(raiz.querySelectorAll('.cuerda-boton'));
  return botones
    .map((boton) => ({
      boton,
      numero: Number(boton.dataset.cuerda),
      hz: Number(boton.dataset.hz),
      nota: boton.dataset.nota,
      disco: boton.dataset.disco,
      anio: boton.dataset.anio,
      premio: boton.dataset.premio
    }))
    .sort((a, b) => b.numero - a.numero)
    .map((c, i) => Object.assign(c, { indice: i }));
}

const cuerdas = leerCuerdas();

let audio = null;
let maestro = null;
let sonido = true;
const buffers = [];

function contextoAudio(){
  if (audio) return audio;
  const Clase = window.AudioContext || window.webkitAudioContext;
  if (!Clase) return null;
  audio = new Clase();
  maestro = audio.createGain();
  maestro.gain.value = 0.32;
  const suavizado = audio.createBiquadFilter();
  suavizado.type = 'lowpass';
  suavizado.frequency.value = 4200;
  maestro.connect(suavizado);
  suavizado.connect(audio.destination);
  return audio;
}

function crearBuffer(hz){
  const tasa = audio.sampleRate;
  const periodo = Math.max(2, Math.round(tasa / hz));
  const total = Math.floor(tasa * 3.2);
  const buffer = audio.createBuffer(1, total, tasa);
  const d = buffer.getChannelData(0);
  const perdida = Math.exp(-6.9 / (hz * 4));

  let previo = 0;
  for (let i = 0; i < periodo; i++){
    const ruido = Math.random() * 2 - 1;
    previo = previo * 0.45 + ruido * 0.55;
    d[i] = previo;
  }

  for (let i = periodo; i < total; i++){
    const a = d[i - periodo];
    const b = i - periodo - 1 >= 0 ? d[i - periodo - 1] : 0;
    d[i] = 0.5 * (a + b) * perdida;
  }

  const final = Math.floor(tasa * 0.15);
  for (let i = 0; i < final; i++){
    d[total - 1 - i] *= i / final;
  }

  let pico = 0;
  for (let i = 0; i < total; i++) pico = Math.max(pico, Math.abs(d[i]));
  if (pico > 0){
    const escala = 0.85 / pico;
    for (let i = 0; i < total; i++) d[i] *= escala;
  }

  return buffer;
}

function sonar(i){
  if (!sonido) return;
  const c = contextoAudio();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  if (!buffers[i]) buffers[i] = crearBuffer(cuerdas[i].hz);

  const fuente = c.createBufferSource();
  fuente.buffer = buffers[i];
  const ganancia = c.createGain();
  ganancia.gain.value = 0.8;
  fuente.connect(ganancia);
  ganancia.connect(maestro);
  fuente.start();
}

const fichaTitulo = document.getElementById('cuerdaFichaTitulo');
const fichaTexto = document.getElementById('cuerdaFichaTexto');
const botonSonido = document.getElementById('guitarraSonido');

let vista = null;
const estado = cuerdas.map(() => ({ amp: 0, inicio: 0, destello: 0 }));
let reloj = 0;

function tocar(i){
  const c = cuerdas[i];
  if (!c) return;

  cuerdas.forEach((otra) => otra.boton.classList.toggle('activa', otra === c));
  fichaTitulo.textContent = c.disco + ' · ' + c.anio;
  fichaTexto.textContent = c.premio + ' Cuerda ' + c.numero + ': ' + c.nota + '.';

  sonar(i);

  estado[i].amp = 1;
  estado[i].inicio = performance.now() / 1000;
  estado[i].destello = 1;
  if (vista) vista.invalidar();
}

cuerdas.forEach((c) => {
  c.boton.addEventListener('click', () => tocar(c.indice));
});

raiz.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (!/^[1-6]$/.test(e.key)) return;
  const i = cuerdas.findIndex((c) => c.numero === Number(e.key));
  if (i < 0) return;
  e.preventDefault();
  tocar(i);
});

botonSonido.addEventListener('click', () => {
  sonido = !sonido;
  botonSonido.setAttribute('aria-pressed', String(sonido));
  botonSonido.textContent = sonido ? 'Sonido: sí' : 'Sonido: no';
});

function formaCuerpo(THREE){
  const f = new THREE.Shape();
  f.moveTo(-0.9, 0.4);
  f.bezierCurveTo(-1.05, 0.4, -1.2, 0.88, -1.45, 0.88);
  f.bezierCurveTo(-1.7, 0.88, -1.8, 0.62, -1.95, 0.62);
  f.bezierCurveTo(-2.15, 0.62, -2.4, 1.18, -2.75, 1.18);
  f.bezierCurveTo(-3.2, 1.18, -3.55, 0.7, -3.55, 0);
  f.bezierCurveTo(-3.55, -0.7, -3.2, -1.18, -2.75, -1.18);
  f.bezierCurveTo(-2.4, -1.18, -2.15, -0.62, -1.95, -0.62);
  f.bezierCurveTo(-1.8, -0.62, -1.7, -0.88, -1.45, -0.88);
  f.bezierCurveTo(-1.2, -0.88, -1.05, -0.4, -0.9, -0.4);
  f.closePath();
  return f;
}

function formaTrapecio(THREE, x0, x1, m0, m1){
  const f = new THREE.Shape();
  f.moveTo(x0, m0);
  f.lineTo(x1, m1);
  f.lineTo(x1, -m1);
  f.lineTo(x0, -m0);
  f.closePath();
  return f;
}

function construir(THREE){
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(32, 2, 0.1, 80);

  escena.add(new THREE.AmbientLight(0xfff1d6, 1.05));
  const luz = new THREE.DirectionalLight(0xfff1d6, 2.2);
  luz.position.set(-3, 4, 6);
  escena.add(luz);
  const contorno = new THREE.DirectionalLight(0x5f93b6, 1.1);
  contorno.position.set(4, -2, -3);
  escena.add(contorno);

  const tinta = new THREE.MeshStandardMaterial({ color: 0x17130e, roughness: 0.9 });
  const lineaTinta = new THREE.LineBasicMaterial({ color: 0x17130e });

  const guitarra = new THREE.Group();
  escena.add(guitarra);

  const cuerpoForma = formaCuerpo(THREE);
  const ajustes = { depth: 0.5, bevelEnabled: false, curveSegments: 28 };

  const cuerpoGeo = new THREE.ExtrudeGeometry(cuerpoForma, ajustes);
  const cuerpo = new THREE.Mesh(cuerpoGeo, new THREE.MeshStandardMaterial({ color: 0x8a4a1f, roughness: 0.55 }));
  cuerpo.position.z = -0.45;
  guitarra.add(cuerpo);

  const contornoCuerpo = new THREE.Mesh(new THREE.ExtrudeGeometry(cuerpoForma, { depth: 0.56, bevelEnabled: false, curveSegments: 28 }), tinta);
  contornoCuerpo.scale.set(1.05, 1.05, 1);
  contornoCuerpo.position.set(-2.25 * (1 - 1.05), 0, -0.52);
  guitarra.add(contornoCuerpo);

  const tapa = new THREE.Mesh(new THREE.ShapeGeometry(cuerpoForma, 28), new THREE.MeshStandardMaterial({ color: 0xdba35a, roughness: 0.5 }));
  tapa.position.z = 0.052;
  guitarra.add(tapa);

  const bordeTapa = new THREE.LineSegments(new THREE.EdgesGeometry(tapa.geometry), lineaTinta);
  bordeTapa.position.z = 0.056;
  guitarra.add(bordeTapa);

  const boca = new THREE.Mesh(new THREE.CircleGeometry(0.34, 48), new THREE.MeshBasicMaterial({ color: 0x120d08 }));
  boca.position.set(-1.95, 0, 0.058);
  guitarra.add(boca);

  const roseta = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.44, 48), new THREE.MeshBasicMaterial({ color: 0x17130e }));
  roseta.position.set(-1.95, 0, 0.058);
  guitarra.add(roseta);

  const puente = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.6 }));
  puente.position.set(X_PUENTE - 0.04, 0, 0.08);
  guitarra.add(puente);

  const mastilForma = formaTrapecio(THREE, -0.9, X_CEJILLA, 0.56, 0.36);
  const mastil = new THREE.Mesh(new THREE.ExtrudeGeometry(mastilForma, { depth: 0.1, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x6b3a1a, roughness: 0.6 }));
  mastil.position.z = -0.05;
  guitarra.add(mastil);

  const diapasonForma = formaTrapecio(THREE, -0.9, X_CEJILLA, 0.52, 0.33);
  const diapason = new THREE.Mesh(new THREE.ShapeGeometry(diapasonForma), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.7 }));
  diapason.position.z = 0.056;
  guitarra.add(diapason);

  const bordeMastil = new THREE.LineSegments(new THREE.EdgesGeometry(diapason.geometry), lineaTinta);
  bordeMastil.position.z = 0.06;
  guitarra.add(bordeMastil);

  const escala = X_CEJILLA - X_PUENTE;
  const traste = new THREE.MeshBasicMaterial({ color: 0xd6cdb4 });
  const marca = new THREE.MeshBasicMaterial({ color: 0xe8dfc9 });
  for (let n = 1; n <= 14; n++){
    const x = X_CEJILLA - escala * (1 - Math.pow(2, -n / 12));
    const t = (x + 0.9) / (X_CEJILLA + 0.9);
    const mitad = lerp(0.52, 0.33, t);
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.03, mitad * 2, 0.012), traste);
    g.position.set(x, 0, 0.062);
    guitarra.add(g);
    if ([3, 5, 7, 9, 12].indexOf(n) >= 0){
      const xm = X_CEJILLA - escala * (1 - Math.pow(2, -(n - 0.5) / 12));
      const punto = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), marca);
      punto.position.set(xm, n === 12 ? 0.16 : 0, 0.066);
      guitarra.add(punto);
      if (n === 12){
        const punto2 = punto.clone();
        punto2.position.y = -0.16;
        guitarra.add(punto2);
      }
    }
  }

  const cejilla = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.04), new THREE.MeshStandardMaterial({ color: 0xe8dfc9, roughness: 0.5 }));
  cejilla.position.set(X_CEJILLA + 0.03, 0, 0.075);
  guitarra.add(cejilla);

  const clavijeroForma = new THREE.Shape();
  clavijeroForma.moveTo(X_CEJILLA + 0.06, 0.36);
  clavijeroForma.lineTo(3.7, 0.46);
  clavijeroForma.quadraticCurveTo(3.95, 0.46, 3.95, 0.3);
  clavijeroForma.lineTo(3.95, -0.3);
  clavijeroForma.quadraticCurveTo(3.95, -0.46, 3.7, -0.46);
  clavijeroForma.lineTo(X_CEJILLA + 0.06, -0.36);
  clavijeroForma.closePath();
  const clavijero = new THREE.Mesh(new THREE.ExtrudeGeometry(clavijeroForma, { depth: 0.1, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.6 }));
  clavijero.position.z = -0.05;
  guitarra.add(clavijero);
  const bordeClavijero = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(clavijeroForma)), lineaTinta);
  bordeClavijero.position.z = 0.056;
  guitarra.add(bordeClavijero);

  const clavija = new THREE.MeshStandardMaterial({ color: 0xc79b27, roughness: 0.35, metalness: 0.5 });
  for (let k = 0; k < 6; k++){
    const lado = k < 3 ? 1 : -1;
    const columna = k % 3;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 14), clavija);
    p.rotation.x = Math.PI / 2;
    p.position.set(3.2 + columna * 0.22, lado * 0.27, 0.1);
    guitarra.add(p);
  }

  const grosores = [0.032, 0.026, 0.02, 0.015, 0.012, 0.009];
  const colores = [0xcfa94a, 0xcfa94a, 0xcfa94a, 0xe8e8e8, 0xe8e8e8, 0xe8e8e8];
  const flash = new THREE.Color(0xffe27a);

  const ribetes = cuerdas.map((c, i) => {
    const geometria = new THREE.BufferGeometry();
    const posiciones = new Float32Array((SEGMENTOS + 1) * 2 * 3);
    const indices = [];
    for (let s = 0; s < SEGMENTOS; s++){
      const a = s * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    geometria.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({ color: colores[i], side: THREE.DoubleSide });
    const malla = new THREE.Mesh(geometria, material);
    malla.frustumCulled = false;
    guitarra.add(malla);
    return { geometria, posiciones, material, base: new THREE.Color(colores[i]), grosor: grosores[i] };
  });

  function yBase(i, u){
    const yp = Y_PUENTE - i * SEPARACION_PUENTE;
    const yc = Y_CEJILLA - i * SEPARACION_CEJILLA;
    return lerp(yp, yc, u);
  }

  function actualizarCuerda(i, t, mover){
    const r = ribetes[i];
    const e = estado[i];
    const hz = cuerdas[i].hz;
    const frecuencia = 10 + (hz - 82) / (330 - 82) * 14;
    const tiempo = t - e.inicio;
    const amp = mover ? e.amp : 0;
    const ancho = r.grosor * (1 + e.amp * 1.6);
    const oscila = Math.cos(2 * Math.PI * frecuencia * tiempo);
    for (let s = 0; s <= SEGMENTOS; s++){
      const u = s / SEGMENTOS;
      const x = lerp(X_PUENTE, X_CEJILLA, u);
      const forma = Math.sin(Math.PI * u);
      const y = yBase(i, u) + amp * 0.14 * forma * oscila;
      const k = s * 6;
      r.posiciones[k] = x;
      r.posiciones[k + 1] = y + ancho / 2;
      r.posiciones[k + 2] = Z_CUERDA;
      r.posiciones[k + 3] = x;
      r.posiciones[k + 4] = y - ancho / 2;
      r.posiciones[k + 5] = Z_CUERDA;
    }
    r.geometria.attributes.position.needsUpdate = true;
    r.material.color.copy(r.base).lerp(flash, e.destello);
  }

  for (let i = 0; i < ribetes.length; i++) actualizarCuerda(i, 0, false);

  guitarra.rotation.set(0.14, -0.26, 0.17);
  guitarra.position.set(-0.2, -0.1, 0);

  let objetivoX = 0;
  let objetivoY = 0;
  let suaveX = 0;
  let suaveY = 0;

  const rayo = new THREE.Raycaster();
  const inversa = new THREE.Matrix4();
  const origen = new THREE.Vector3();
  const direccion = new THREE.Vector3();
  const ndc = new THREE.Vector2();

  function cuerdaEn(clientX, clientY){
    const caja = escenario.getBoundingClientRect();
    ndc.set(((clientX - caja.left) / caja.width) * 2 - 1, -((clientY - caja.top) / caja.height) * 2 + 1);
    rayo.setFromCamera(ndc, camara);
    guitarra.updateMatrixWorld(true);
    inversa.copy(guitarra.matrixWorld).invert();
    origen.copy(rayo.ray.origin).applyMatrix4(inversa);
    direccion.copy(rayo.ray.direction).transformDirection(inversa);
    if (Math.abs(direccion.z) < 1e-6) return -1;
    const t = (Z_CUERDA - origen.z) / direccion.z;
    if (t < 0) return -1;
    const px = origen.x + direccion.x * t;
    const py = origen.y + direccion.y * t;
    if (px < X_PUENTE - 0.1 || px > X_CEJILLA + 0.1) return -1;
    const u = (px - X_PUENTE) / (X_CEJILLA - X_PUENTE);
    const paso = lerp(SEPARACION_PUENTE, SEPARACION_CEJILLA, Math.min(1, Math.max(0, u)));
    let mejor = -1;
    let distancia = Infinity;
    for (let i = 0; i < ribetes.length; i++){
      const d = Math.abs(py - yBase(i, Math.min(1, Math.max(0, u))));
      if (d < distancia){ distancia = d; mejor = i; }
    }
    return distancia < paso * 0.6 ? mejor : -1;
  }

  let arrastrando = false;
  let ultima = -1;

  escenario.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const i = cuerdaEn(e.clientX, e.clientY);
    if (e.pointerType === 'mouse'){
      arrastrando = true;
      try { escenario.setPointerCapture(e.pointerId); } catch (error) { arrastrando = true; }
    }
    if (i >= 0){
      ultima = i;
      tocar(i);
    }
  });

  escenario.addEventListener('pointermove', (e) => {
    const caja = escenario.getBoundingClientRect();
    objetivoX = ((e.clientX - caja.left) / caja.width - 0.5) * 2;
    objetivoY = ((e.clientY - caja.top) / caja.height - 0.5) * 2;
    const i = cuerdaEn(e.clientX, e.clientY);
    escenario.classList.toggle('sobre-cuerda', i >= 0);
    if (arrastrando && i >= 0 && i !== ultima){
      ultima = i;
      tocar(i);
    }
    if (vista) vista.invalidar();
  });

  function soltar(){
    arrastrando = false;
    ultima = -1;
  }
  escenario.addEventListener('pointerup', soltar);
  escenario.addEventListener('pointercancel', soltar);
  escenario.addEventListener('pointerleave', () => {
    soltar();
    objetivoX = 0;
    objetivoY = 0;
    escenario.classList.remove('sobre-cuerda');
    if (vista) vista.invalidar();
  });

  function redimensionar(ancho, alto){
    const aspecto = ancho / alto;
    camara.aspect = aspecto;
    const distancia = Math.max(7.6, 8.0 / (2 * Math.tan(16 * Math.PI / 180) * aspecto));
    camara.position.set(0.1, 0, distancia);
    camara.lookAt(0.1, 0, 0);
    camara.updateProjectionMatrix();
  }

  function actualizar(dt, t){
    reloj = t;
    const mover = !sinMovimiento();

    if (mover){
      suaveX += (objetivoX - suaveX) * 0.08;
      suaveY += (objetivoY - suaveY) * 0.08;
    } else {
      suaveX = 0;
      suaveY = 0;
    }
    guitarra.rotation.y = -0.26 + suaveX * 0.1;
    guitarra.rotation.x = 0.14 + suaveY * 0.06;

    for (let i = 0; i < estado.length; i++){
      const e = estado[i];
      e.amp *= Math.exp(-dt / 0.9);
      if (e.amp < 0.01) e.amp = 0;
      e.destello *= Math.exp(-dt / 0.35);
      if (e.destello < 0.01) e.destello = 0;
      actualizarCuerda(i, t, mover);
    }
  }

  function continuo(){
    if (estado.some((e) => e.amp > 0 || e.destello > 0)) return true;
    return Math.abs(objetivoX - suaveX) > 0.003 || Math.abs(objetivoY - suaveY) > 0.003;
  }

  return { escena, camara, actualizar, continuo, redimensionar };
}

crearVista({
  elemento: escenario,
  lienzo: escenario.querySelector('.guitarra-lienzo'),
  construir
}).then((v) => {
  vista = v;
}).catch(() => {
  vista = null;
});
