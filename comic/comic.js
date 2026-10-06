const TOTAL_CHANNELS = 10;
let currentChannel = 0;
let tvOn = false;
let isAnimating = false;
let introPlaying = false;
let introEnded = false;

const tv = document.getElementById('tv');
const tvScreen = document.getElementById('tvScreen');
const screenContent = document.getElementById('screenContent');
const channels = Array.from(screenContent.querySelectorAll('.channel'));
const powerLine = document.getElementById('powerLine');
const staticCanvas = document.getElementById('staticCanvas');
const tvCaption = document.getElementById('tvCaption');

const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnPower = document.getElementById('btnPower');
const tvCartel = document.getElementById('tvCartel');
const s7Boton = document.getElementById('s7Boton');

const introLayer = document.getElementById('introLayer');
const introVideo = document.getElementById('introVideo');
const skipButton = document.getElementById('skipButton');

const scene1Stage = document.getElementById('scene1Stage');
const scene1Container = document.getElementById('scene1Container');
const scene1Hint = document.getElementById('scene1Hint');

const scene2Stage = document.getElementById('scene2Stage');
const scene2Container = document.getElementById('scene2Container');

const scene3Stage = document.getElementById('scene3Stage');
const scene3Container = document.getElementById('scene3Container');
const scene3Hint = document.getElementById('scene3Hint');

const scene4Stage = document.getElementById('scene4Stage');
const scene4Container = document.getElementById('scene4Container');

const scene5Stage = document.getElementById('scene5Stage');
const scene5Container = document.getElementById('scene5Container');
const scene5Hint = document.getElementById('scene5Hint');

const scene6Stage = document.getElementById('scene6Stage');
const scene6Container = document.getElementById('scene6Container');
const scene6HintRecuadro = document.getElementById('scene6HintRecuadro');
const scene6HintFantasma = document.getElementById('scene6HintFantasma');

const scene7Stage = document.getElementById('scene7Stage');
const scene7Container = document.getElementById('scene7Container');
const scene7Hint = document.getElementById('scene7Hint');

const scene8Stage = document.getElementById('scene8Stage');
const scene8Container = document.getElementById('scene8Container');
const scene8Hint = document.getElementById('scene8Hint');

const channelNames = [
  'Capítulo 1 — Presentación', 'Capítulo 1 — Escena I: El llamado',
  'Capítulo 1 — Escena II', 'Capítulo 1 — Escena III',
  'Capítulo 2 — Presentación', 'Capítulo 2 — Escena I', 'Capítulo 2 — Escena II',
  'Capítulo 2 — Escena III', 'Capítulo 2 — Escena IV',
  'Capítulo 3 — Presentación', 'Capítulo 3 — Escena I'
];

const esTactil = window.matchMedia('(hover: none)').matches;
const AYUDA_CAMBIO = esTactil
  ? 'desliza o usa las perillas para cambiar de escena'
  : 'usa ← → o las perillas para cambiar de escena';
let ayudaVista = false;

function leyendaCanal(index){
  const base = `${channelNames[index]} · ${index + 1} de ${TOTAL_CHANNELS + 1}`;
  return ayudaVista ? base : `${base} — ${AYUDA_CAMBIO}`;
}

let s1 = { humo: null, puerta: null, juanesCorre: null, ready: false, played: false };

function initScene1(){
  if (s1.ready || typeof lottie === 'undefined') return;

  s1.humo = lottie.loadAnimation({
    container: document.getElementById('s1-humo'),
    renderer: 'svg', loop: true, autoplay: false,
    path: 'assets/capitulo-n1/scene1/json/humo.json'
  });
  s1.puerta = lottie.loadAnimation({
    container: document.getElementById('s1-puerta'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene1/json/puerta.json'
  });
  s1.juanesCorre = lottie.loadAnimation({
    container: document.getElementById('s1-juanesCorre'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene1/json/juanesCorre.json'
  });

  document.getElementById('s1-puerta').addEventListener('click', () => {
    if (s1.played) return;
    s1.played = true;
    s1.puerta.play();
    s1.juanesCorre.play();
    document.getElementById('s1-puerta').classList.add('is-locked');
    if (scene1Hint) scene1Hint.classList.add('is-hidden');
  });

  s1.ready = true;
}

function resetScene1(){
  s1.played = false;
  if (s1.puerta) s1.puerta.goToAndStop(0, true);
  if (s1.juanesCorre) s1.juanesCorre.goToAndStop(0, true);
  const puertaEl = document.getElementById('s1-puerta');
  if (puertaEl) puertaEl.classList.remove('is-locked');
  if (scene1Hint) scene1Hint.classList.remove('is-hidden');
}

function scaleStage(stageEl, containerEl){
  if (!stageEl || !containerEl) return;
  const stageW = stageEl.clientWidth;
  const stageH = stageEl.clientHeight;
  if (!stageW || !stageH) return;
  const designW = 1134, designH = 658;
  const scale = Math.max(stageW / designW, stageH / designH);
  const offsetX = (stageW - designW * scale) / 2;
  const offsetY = (stageH - designH * scale) / 2;
  containerEl.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

function scaleScene1(){ scaleStage(scene1Stage, scene1Container); }
function scaleScene2(){ scaleStage(scene2Stage, scene2Container); }
function scaleScene3(){ scaleStage(scene3Stage, scene3Container); }
function scaleScene4(){ scaleStage(scene4Stage, scene4Container); }
function scaleScene5(){ scaleStage(scene5Stage, scene5Container); }
function scaleScene6(){ scaleStage(scene6Stage, scene6Container); }
function scaleScene7(){ scaleStage(scene7Stage, scene7Container); }
function scaleScene8(){ scaleStage(scene8Stage, scene8Container); }

window.addEventListener('resize', () => {
  scaleScene1(); scaleScene2(); scaleScene3(); scaleScene4(); scaleScene5(); scaleScene6(); scaleScene7(); scaleScene8();
});

let s2 = { juanesBusca: null, caja: null, texto: null, ready: false, textoTimer: null, playTimer: null };

function initScene2(){
  if (s2.ready || typeof lottie === 'undefined') return;

  s2.juanesBusca = lottie.loadAnimation({
    container: document.getElementById('s2-juanesBusca'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene2/json/juanesBusca.json'
  });
  s2.caja = lottie.loadAnimation({
    container: document.getElementById('s2-caja'),
    renderer: 'canvas', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene2/json/caja.json'
  });
  s2.texto = lottie.loadAnimation({
    container: document.getElementById('s2-texto'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene2/json/texto.json'
  });

  s2.caja.addEventListener('DOMLoaded', () => { s2.caja.resize(); });

  s2.caja.setSubframe(false);

  s2.ready = true;
}

let scene2Prefetched = false;
function prefetchScene2(){
  if (scene2Prefetched) return;
  scene2Prefetched = true;
  ['fondoJuanes', 'fondoCaja', 'fondoTexto'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n1/scene2/img/${name}.png`;
  });
  ['juanesBusca', 'caja', 'texto'].forEach(name => {
    fetch(`assets/capitulo-n1/scene2/json/${name}.json`).catch(() => {});
  });
}

let scene3Prefetched = false;
function prefetchScene3(){
  if (scene3Prefetched) return;
  scene3Prefetched = true;
  ['fondoPapa', 'fondoText', 'fondoJuan'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n1/scene3/img/${name}.png`;
  });
  ['papaHabla', 'text', 'guitarra', 'fondoGuita', 'juanesEmocion'].forEach(name => {
    fetch(`assets/capitulo-n1/scene3/json/${name}.json`).catch(() => {});
  });
}

let scene4Prefetched = false;
function prefetchScene4(){
  if (scene4Prefetched) return;
  scene4Prefetched = true;
  ['sky', 'nubes', 'edifico'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n2/scene1/img/${name}.png`;
  });
  ['juanCaminandoo', 'txt'].forEach(name => {
    fetch(`assets/capitulo-n2/scene1/json/${name}.json`).catch(() => {});
  });
}

let scene5Prefetched = false;
function prefetchScene5(){
  if (scene5Prefetched) return;
  scene5Prefetched = true;
  ['escenario', 'sky'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n2/scene2/img/${name}.${name === 'sky' ? 'jpg' : 'png'}`;
  });
  ['juanTocaGuita', 'musica', 'npcUno', 'npcDos', 'npcTres', 'npcCuatro', 'textDias', 'textVine'].forEach(name => {
    fetch(`assets/capitulo-n2/scene2/json/${name}.json`).catch(() => {});
  });
}

let scene6Prefetched = false;
function prefetchScene6(){
  if (scene6Prefetched) return;
  scene6Prefetched = true;
  ['fondoTextoOne', 'fondoDos', 'fondoTres', 'fantasmaEsc'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n2/scene3/img/${name}.${name === 'fantasmaEsc' ? 'png' : 'jpg'}`;
  });
  ['recuadroUno', 'textoOne', 'juanAsustao', 'textoFantas'].forEach(name => {
    fetch(`assets/capitulo-n2/scene3/json/${name}.json`).catch(() => {});
  });
}

let scene7Prefetched = false;
function prefetchScene7(){
  if (scene7Prefetched) return;
  scene7Prefetched = true;
  ['sky', 'fondoCorre'].forEach(name => {
    const img = new Image();
    img.src = `assets/capitulo-n2/scene4/img/${name}.${name === 'sky' ? 'jpg' : 'png'}`;
  });
  ['juanRun', 'text'].forEach(name => {
    fetch(`assets/capitulo-n2/scene4/json/${name}.json`).catch(() => {});
  });
}

let scene8Prefetched = false;
function prefetchScene8(){
  if (scene8Prefetched) return;
  scene8Prefetched = true;
  const img = new Image();
  img.src = 'assets/capitulo-n3/scene1/img/fondo.jpg';
  ['mamaAsomada', 'puertaAbriendo', 'cortinaAbriendo', 'libros', 'juanesSentado', 'txt'].forEach(name => {
    fetch(`assets/capitulo-n3/scene1/json/${name}.json`).catch(() => {});
  });
}

let s2PlayToken = 0;

function playScene2(){
  const token = ++s2PlayToken;
  clearTimeout(s2.textoTimer);

  scene2Container.classList.remove('is-ready');
  if (s2.juanesBusca) s2.juanesBusca.goToAndStop(0, true);
  if (s2.caja) s2.caja.goToAndStop(0, true);
  if (s2.texto) s2.texto.goToAndStop(0, true);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (token !== s2PlayToken) return;
      scene2Container.classList.add('is-ready');

      if (s2.juanesBusca) s2.juanesBusca.goToAndPlay(0, true);
      if (s2.caja) s2.caja.goToAndPlay(0, true);
      s2.textoTimer = setTimeout(() => {
        if (token === s2PlayToken && s2.texto) s2.texto.play();
      }, 8500);
    });
  });
}

function stopScene2(){
  clearTimeout(s2.playTimer);
  clearTimeout(s2.textoTimer);
  if (s2.juanesBusca) s2.juanesBusca.pause();
  if (s2.caja) s2.caja.pause();
  if (s2.texto) s2.texto.pause();
}

let s3 = {
  papaHabla: null, text: null, guitarra: null, fondoGuita: null, juanesEmocion: null,
  ready: false, played: false, timers: []
};

function initScene3(){
  if (s3.ready || typeof lottie === 'undefined') return;

  s3.papaHabla = lottie.loadAnimation({
    container: document.getElementById('s3-papaHabla'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene3/json/papaHabla.json'
  });
  s3.text = lottie.loadAnimation({
    container: document.getElementById('s3-text'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n1/scene3/json/text.json'
  });
  s3.guitarra = lottie.loadAnimation({
    container: document.getElementById('s3-guitarra'),
    renderer: 'svg', loop: true, autoplay: false,
    path: 'assets/capitulo-n1/scene3/json/guitarra.json'
  });
  s3.fondoGuita = lottie.loadAnimation({
    container: document.getElementById('s3-fondoGuita'),
    renderer: 'svg', loop: true, autoplay: false,
    path: 'assets/capitulo-n1/scene3/json/fondoGuita.json'
  });
  s3.juanesEmocion = lottie.loadAnimation({
    container: document.getElementById('s3-juanesEmocion'),
    renderer: 'svg', loop: true, autoplay: true,
    path: 'assets/capitulo-n1/scene3/json/juanesEmocion.json'
  });

  document.getElementById('s3-papaHabla').addEventListener('click', () => {
    if (s3.played) return;
    s3.played = true;
    if (scene3Hint) scene3Hint.classList.add('is-hidden');

    s3.papaHabla.play();
    s3.text.play();

    s3.timers.push(setTimeout(() => {
      document.getElementById('s3-fondoGuitarra').classList.add('s3-entrar');
      document.getElementById('s3-guitarra').classList.add('s3-entrar');
    }, 2000));

    s3.timers.push(setTimeout(() => {
      document.getElementById('s3-fondoJuan').classList.add('s3-entrar');
      document.getElementById('s3-juanesEmocion').classList.add('s3-entrar');
    }, 4000));

    s3.timers.push(setTimeout(() => {
      if (s3.guitarra) s3.guitarra.play();
      if (s3.fondoGuita) s3.fondoGuita.play();
    }, 5000));
  });

  s3.ready = true;
}

function resetScene3(){
  s3.timers.forEach(clearTimeout);
  s3.timers = [];
  s3.played = false;

  if (s3.papaHabla) s3.papaHabla.goToAndStop(0, true);
  if (s3.text) s3.text.goToAndStop(0, true);
  if (s3.guitarra) s3.guitarra.goToAndStop(0, true);
  if (s3.fondoGuita) s3.fondoGuita.goToAndStop(0, true);
  if (s3.juanesEmocion) s3.juanesEmocion.play();

  document.getElementById('s3-fondoGuitarra').classList.remove('s3-entrar');
  document.getElementById('s3-guitarra').classList.remove('s3-entrar');
  document.getElementById('s3-fondoJuan').classList.remove('s3-entrar');
  document.getElementById('s3-juanesEmocion').classList.remove('s3-entrar');

  if (scene3Hint) scene3Hint.classList.remove('is-hidden');
}

function stopScene3(){
  s3.timers.forEach(clearTimeout);
  s3.timers = [];
  if (s3.papaHabla) s3.papaHabla.pause();
  if (s3.text) s3.text.pause();
  if (s3.guitarra) s3.guitarra.pause();
  if (s3.fondoGuita) s3.fondoGuita.pause();
  if (s3.juanesEmocion) s3.juanesEmocion.pause();
}

let s4 = { juanCaminando: null, txt: null, ready: false, timers: [], playTimer: null };

function initScene4(){
  if (s4.ready || typeof lottie === 'undefined') return;

  s4.juanCaminando = lottie.loadAnimation({
    container: document.getElementById('s4-juanCaminando'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n2/scene1/json/juanCaminandoo.json'
  });
  s4.txt = lottie.loadAnimation({
    container: document.getElementById('s4-txt'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n2/scene1/json/txt.json'
  });

  s4.txt.addEventListener('complete', () => {
    document.getElementById('s4-txt').classList.add('s4-oculto');
  });

  s4.ready = true;
}

function playScene4(){
  s4.timers.forEach(clearTimeout);
  s4.timers = [];

  document.getElementById('s4-juanCaminando').classList.remove('s4-pulso');
  document.getElementById('s4-txt').classList.remove('s4-oculto');
  if (s4.juanCaminando) s4.juanCaminando.goToAndStop(0, true);
  if (s4.txt) s4.txt.goToAndStop(0, true);

  if (s4.juanCaminando) s4.juanCaminando.play();
  s4.timers.push(setTimeout(() => {
    document.getElementById('s4-juanCaminando').classList.add('s4-pulso');
  }, 10000));
  s4.timers.push(setTimeout(() => {
    if (s4.txt) s4.txt.play();
  }, 4500));
}

function stopScene4(){
  s4.timers.forEach(clearTimeout);
  s4.timers = [];
  if (s4.juanCaminando) s4.juanCaminando.pause();
  if (s4.txt) s4.txt.pause();
}

let s5 = { anims: {}, timers: [], ready: false, playTimer: null };

function s5ScheduleReplay(anim, delay){
  const id = setTimeout(() => { anim.goToAndPlay(0, true); }, delay);
  s5.timers.push(id);
}

function initScene5(){
  if (s5.ready || typeof lottie === 'undefined') return;

  const load = (name, elId, loop) => lottie.loadAnimation({
    container: document.getElementById(elId),
    renderer: 'svg', loop, autoplay: false,
    path: `assets/capitulo-n2/scene2/json/${name}.json`
  });

  s5.anims.juanTocaGuita = load('juanTocaGuita', 's5-juanTocaGuita', true);
  s5.anims.musica = load('musica', 's5-musica', true);
  s5.anims.npcUno = load('npcUno', 's5-npcUno', false);
  s5.anims.npcDos = load('npcDos', 's5-npcDos', false);
  s5.anims.npcTres = load('npcTres', 's5-npcTres', false);
  s5.anims.npcCuatro = load('npcCuatro', 's5-npcCuatro', false);
  s5.anims.textDias = load('textDias', 's5-textDias', false);
  s5.anims.textVine = load('textVine', 's5-textVine', false);

  s5.anims.npcUno.addEventListener('complete', () => s5ScheduleReplay(s5.anims.npcUno, 3000));
  s5.anims.npcDos.addEventListener('complete', () => s5ScheduleReplay(s5.anims.npcDos, 6000));
  s5.anims.npcTres.addEventListener('complete', () => s5ScheduleReplay(s5.anims.npcTres, 4000));
  s5.anims.npcCuatro.addEventListener('complete', () => s5ScheduleReplay(s5.anims.npcCuatro, 6000));

  s5.anims.textVine.addEventListener('complete', () => {
    document.getElementById('s5-textVine').classList.remove('is-visible');
  });
  document.getElementById('s5-juanTocaGuita').addEventListener('click', () => {
    if (scene5Hint) scene5Hint.classList.add('is-hidden');
    document.getElementById('s5-textVine').classList.add('is-visible');
    s5.anims.textVine.goToAndPlay(0, true);
  });

  s5.ready = true;
}

function playScene5(){
  s5.timers.forEach(clearTimeout);
  s5.timers = [];

  Object.values(s5.anims).forEach(a => a && a.goToAndStop(0, true));
  document.getElementById('s5-textVine').classList.remove('is-visible');

  if (s5.anims.juanTocaGuita) s5.anims.juanTocaGuita.play();
  if (s5.anims.musica) s5.anims.musica.play();
  if (s5.anims.npcUno) s5.anims.npcUno.play();
  if (s5.anims.npcTres) s5.anims.npcTres.play();

  s5.timers.push(setTimeout(() => { if (s5.anims.npcDos) s5.anims.npcDos.play(); }, 2000));
  s5.timers.push(setTimeout(() => { if (s5.anims.npcCuatro) s5.anims.npcCuatro.play(); }, 5000));
  s5.timers.push(setTimeout(() => { if (s5.anims.textDias) s5.anims.textDias.play(); }, 8000));
}

function stopScene5(){
  s5.timers.forEach(clearTimeout);
  s5.timers = [];
  Object.values(s5.anims).forEach(a => a && a.pause());
}

const S6_CAPAS = ['s6-cajaUno', 's6-recuadroUnoEntrada', 's6-fondoTextoOne', 's6-fondoDos', 's6-fondoTres'];

let s6 = { anims: {}, timers: [], ready: false, playTimer: null, token: 0, paso: 'recuadro' };

function s6Programar(accion, ms){
  s6.timers.push(setTimeout(accion, ms));
}

function s6Entrar(id){
  document.getElementById(id).classList.add('s6-entrar');
}

function s6Salir(id){
  document.getElementById(id).classList.remove('s6-entrar');
}

function initScene6(){
  if (s6.ready || typeof lottie === 'undefined') return;

  const load = (name, elId, loop) => lottie.loadAnimation({
    container: document.getElementById(elId),
    renderer: 'svg', loop, autoplay: false,
    path: `assets/capitulo-n2/scene3/json/${name}.json`
  });

  s6.anims.recuadroUno = load('recuadroUno', 's6-recuadroUno', false);
  s6.anims.textoOne = load('textoOne', 's6-textoOne', false);
  s6.anims.juanAsustao = load('juanAsustao', 's6-juanAsustao', true);
  s6.anims.textoFantas = load('textoFantas', 's6-textoFantas', false);

  s6.anims.textoFantas.addEventListener('complete', () => {
    document.getElementById('s6-textoFantas').classList.add('s6-oculto');
  });

  document.getElementById('s6-recuadroUno').addEventListener('click', () => {
    if (s6.paso !== 'recuadro') return;
    s6.paso = 'texto';
    scene6HintRecuadro.classList.add('is-hidden');

    s6Entrar('s6-fondoTextoOne');
    s6Programar(() => s6.anims.textoOne.play(), 500);
    s6Programar(() => {
      S6_CAPAS.forEach(s6Salir);
    }, 6500);
    s6Programar(() => {
      s6Entrar('s6-fondoDos');
      s6.anims.juanAsustao.play();
    }, 7000);
    s6Programar(() => s6Entrar('s6-fondoTres'), 7500);
    s6Programar(() => {
      s6.paso = 'fantasma';
      scene6HintFantasma.classList.remove('is-hidden');
    }, 8000);
  });

  document.getElementById('s6-fantasmaEsc').addEventListener('click', () => {
    if (s6.paso !== 'fantasma') return;
    scene6HintFantasma.classList.add('is-hidden');
    document.getElementById('s6-textoFantas').classList.remove('s6-oculto');
    s6.anims.textoFantas.goToAndPlay(0, true);
  });

  s6.ready = true;
}

function resetScene6(){
  s6.token++;
  s6.timers.forEach(clearTimeout);
  s6.timers = [];
  s6.paso = 'recuadro';

  Object.values(s6.anims).forEach(a => a && a.goToAndStop(0, true));
  S6_CAPAS.forEach(s6Salir);
  document.getElementById('s6-textoFantas').classList.add('s6-oculto');

  scene6HintRecuadro.classList.add('is-hidden');
  scene6HintFantasma.classList.add('is-hidden');
}

function playScene6(){
  const token = ++s6.token;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (token !== s6.token) return;
      s6Entrar('s6-cajaUno');
      s6Entrar('s6-recuadroUnoEntrada');
      s6.anims.recuadroUno.goToAndPlay(0, true);
      scene6HintRecuadro.classList.remove('is-hidden');
    });
  });
}

function stopScene6(){
  s6.token++;
  clearTimeout(s6.playTimer);
  s6.timers.forEach(clearTimeout);
  s6.timers = [];
  Object.values(s6.anims).forEach(a => a && a.pause());
}

const S7_LIMITE = 1360;
const S7_VELOCIDAD = 360;

let s7 = {
  juanRun: null, text: null, ready: false, timers: [],
  pos: 0, moviendo: false, ultimo: null, raf: null, primeraVez: true
};

function initScene7(){
  if (s7.ready || typeof lottie === 'undefined') return;

  s7.juanRun = lottie.loadAnimation({
    container: document.getElementById('s7-juanRun'),
    renderer: 'svg', loop: true, autoplay: false,
    path: 'assets/capitulo-n2/scene4/json/juanRun.json'
  });
  s7.text = lottie.loadAnimation({
    container: document.getElementById('s7-text'),
    renderer: 'svg', loop: false, autoplay: false,
    path: 'assets/capitulo-n2/scene4/json/text.json'
  });

  s7.ready = true;
}

function s7Mover(timestamp){
  if (!s7.moviendo) return;

  if (s7.ultimo === null) s7.ultimo = timestamp;
  const delta = (timestamp - s7.ultimo) / 1000;
  s7.ultimo = timestamp;

  s7.pos = Math.min(S7_LIMITE, s7.pos + S7_VELOCIDAD * delta);
  document.getElementById('s7-juanRun').style.transform = `translateX(${s7.pos}px)`;

  if (s7.pos >= S7_LIMITE){
    s7Etiqueta(true);
    s7Soltar();
    return;
  }
  s7.raf = requestAnimationFrame(s7Mover);
}

function s7Etiqueta(fin){
  s7Boton.innerHTML = fin ? 'Siguiente escena &rarr;' : 'Correr &#9654;';
  s7Boton.classList.remove('is-pressed');
}

function s7Correr(){
  if (!s7.ready || s7.moviendo || s7.pos >= S7_LIMITE) return;

  s7.moviendo = true;
  s7.ultimo = null;
  s7.juanRun.play();
  s7.raf = requestAnimationFrame(s7Mover);
  scene7Hint.classList.add('is-hidden');

  if (s7.primeraVez){
    s7.primeraVez = false;
    s7.timers.push(setTimeout(() => s7.text.play(), 1000));
  }
}

function s7Soltar(){
  s7.moviendo = false;
  cancelAnimationFrame(s7.raf);
  if (s7.juanRun) s7.juanRun.pause();
}

function resetScene7(){
  s7.timers.forEach(clearTimeout);
  s7.timers = [];
  s7Soltar();
  s7.pos = 0;
  s7.primeraVez = true;
  document.getElementById('s7-juanRun').style.transform = '';
  if (s7.juanRun) s7.juanRun.goToAndStop(0, true);
  if (s7.text) s7.text.goToAndStop(0, true);
  scene7Hint.classList.remove('is-hidden');
  s7Etiqueta(false);
}

function stopScene7(){
  s7.timers.forEach(clearTimeout);
  s7.timers = [];
  s7Soltar();
  if (s7.text) s7.text.pause();
}

function s7ControlaFlecha(){
  return tvOn && !isAnimating && !introPlaying && currentChannel === 8;
}

s7Boton.addEventListener('pointerdown', (e) => {
  if (!s7ControlaFlecha()) return;
  e.preventDefault();
  if (s7.pos >= S7_LIMITE){
    changeChannel(1);
    return;
  }
  s7Boton.setPointerCapture(e.pointerId);
  s7Boton.classList.add('is-pressed');
  s7Correr();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((tipo) => {
  s7Boton.addEventListener(tipo, () => {
    s7Boton.classList.remove('is-pressed');
    s7Soltar();
  });
});
s7Boton.addEventListener('click', (e) => {
  if (e.detail === 0 && s7ControlaFlecha() && s7.pos >= S7_LIMITE) changeChannel(1);
});

let s8 = { anims: {}, ready: false, playTimer: null };

function initScene8(){
  if (s8.ready || typeof lottie === 'undefined') return;

  const load = (name, elId, loop) => lottie.loadAnimation({
    container: document.getElementById(elId),
    renderer: 'svg', loop, autoplay: false,
    path: `assets/capitulo-n3/scene1/json/${name}.json`
  });

  s8.anims.mama = load('mamaAsomada', 's8-mama', true);
  s8.anims.puerta = load('puertaAbriendo', 's8-puerta', false);
  s8.anims.cortina = load('cortinaAbriendo', 's8-cortina', false);
  s8.anims.libros = load('libros', 's8-libros', false);
  s8.anims.juanes = load('juanesSentado', 's8-juanes', true);
  s8.anims.txt = load('txt', 's8-txt', false);

  s8.anims.txt.addEventListener('complete', () => {
    document.getElementById('s8-txt').classList.add('s8-oculto');
  });

  document.getElementById('s8-puerta').addEventListener('click', () => {
    s8.anims.puerta.goToAndPlay(0, true);
  });

  ['cortina', 'libros'].forEach(nombre => {
    const el = document.getElementById(`s8-${nombre}`);
    el.addEventListener('click', () => {
      if (el.classList.contains('is-locked')) return;
      el.classList.add('is-locked');
      s8.anims[nombre].goToAndPlay(0, true);
    });
  });

  document.getElementById('s8-juanes').addEventListener('click', () => {
    scene8Hint.classList.add('is-hidden');
    s8.anims.juanes.play();
    document.getElementById('s8-txt').classList.remove('s8-oculto');
    s8.anims.txt.goToAndPlay(0, true);
  });

  s8.ready = true;
}

function resetScene8(){
  clearTimeout(s8.playTimer);
  Object.values(s8.anims).forEach(a => a && a.goToAndStop(0, true));
  document.getElementById('s8-txt').classList.add('s8-oculto');
  document.getElementById('s8-cortina').classList.remove('is-locked');
  document.getElementById('s8-libros').classList.remove('is-locked');
  scene8Hint.classList.remove('is-hidden');
}

function playScene8(){
  if (s8.anims.mama) s8.anims.mama.play();
}

function stopScene8(){
  clearTimeout(s8.playTimer);
  Object.values(s8.anims).forEach(a => a && a.pause());
}

const PRES_DELAY_MS = 450;
const PRES_SAFETY_MS = 6000;

function crearPresentacion({ ruta, imagenes, stageId, containerId, targetId, hintId, alTerminar }){
  const stage = document.getElementById(stageId);
  const container = document.getElementById(containerId);
  const target = document.getElementById(targetId);
  const hint = hintId ? document.getElementById(hintId) : null;

  const pres = {
    anim: null,
    ready: false,
    loaded: false,
    ended: false,
    prefetched: false,
    pendiente: null,
    startTimer: null,
    safetyTimer: null,
    token: 0
  };

  function finish(){
    if (pres.ended) return;
    pres.ended = true;
    clearTimeout(pres.safetyTimer);
    if (hint) hint.classList.add('is-visible');
    if (alTerminar) alTerminar(pres.token);
  }

  function arrancar(token){
    if (token !== pres.token) return;
    pres.anim.goToAndPlay(0, true);
    pres.safetyTimer = setTimeout(finish, PRES_SAFETY_MS);
  }

  pres.prefetch = function(){
    if (pres.prefetched) return;
    pres.prefetched = true;
    fetch(ruta + '/titulo.json').catch(() => {});
    for (let i = 0; i < imagenes; i++){
      const img = new Image();
      img.src = ruta + '/images/img_' + i + '.png';
    }
  };

  pres.init = function(){
    if (pres.ready || typeof lottie === 'undefined') return;

    pres.anim = lottie.loadAnimation({
      container: target,
      renderer: 'svg', loop: false, autoplay: false,
      path: ruta + '/titulo.json',
      assetsPath: ruta + '/images/'
    });

    pres.anim.addEventListener('DOMLoaded', () => {
      pres.loaded = true;
      if (pres.pendiente !== null){
        const token = pres.pendiente;
        pres.pendiente = null;
        arrancar(token);
      }
    });
    pres.anim.addEventListener('complete', finish);
    pres.anim.addEventListener('error', finish);

    pres.ready = true;
  };

  pres.play = function(){
    pres.init();
    pres.stop();

    const token = ++pres.token;
    pres.ended = false;
    if (hint) hint.classList.remove('is-visible');
    if (pres.anim && pres.loaded) pres.anim.goToAndStop(0, true);

    requestAnimationFrame(() => scaleStage(stage, container));

    if (!pres.anim){ finish(); return; }

    pres.startTimer = setTimeout(() => {
      if (token !== pres.token) return;
      if (pres.loaded) arrancar(token);
      else pres.pendiente = token;
    }, PRES_DELAY_MS);
  };

  pres.stop = function(){
    clearTimeout(pres.startTimer);
    clearTimeout(pres.safetyTimer);
    pres.pendiente = null;
    if (pres.anim) pres.anim.pause();
  };

  pres.contenedor = container;
  pres.tokenActual = () => pres.token;

  window.addEventListener('resize', () => scaleStage(stage, container));

  return pres;
}

const RELEVO_MS = 900;
let relevoTimer = null;

const presTitulo = crearPresentacion({
  ruta: 'assets/presentacion-titulo/json', imagenes: 5,
  stageId: 'pres1Stage', containerId: 'presTituloContainer',
  targetId: 'p1-titulo',
  alTerminar: (token) => {
    clearTimeout(relevoTimer);
    relevoTimer = setTimeout(() => {
      if (token !== presTitulo.tokenActual()) return;
      presTitulo.contenedor.classList.add('se-retira');
      pres1.contenedor.classList.add('is-visible');
      pres1.play();
    }, RELEVO_MS);
  }
});

const pres1 = crearPresentacion({
  ruta: 'assets/presentacion-c1/json', imagenes: 6,
  stageId: 'pres1Stage', containerId: 'pres1Container',
  targetId: 'p1-capitulo', hintId: 'pres1Hint'
});

function abrirCapituloUno(){
  clearTimeout(relevoTimer);
  presTitulo.contenedor.classList.remove('se-retira');
  pres1.contenedor.classList.remove('is-visible');
  const aviso = document.getElementById('pres1Hint');
  if (aviso) aviso.classList.remove('is-visible');
  pres1.stop();
  presTitulo.play();
}

function cerrarCapituloUno(){
  clearTimeout(relevoTimer);
  presTitulo.stop();
  pres1.stop();
}

const pres2 = crearPresentacion({
  ruta: 'assets/presentacion-c2/json', imagenes: 6,
  stageId: 'pres2Stage', containerId: 'pres2Container',
  targetId: 'p2-titulo', hintId: 'pres2Hint'
});

const pres3 = crearPresentacion({
  ruta: 'assets/presentacion-c3/json', imagenes: 6,
  stageId: 'pres3Stage', containerId: 'pres3Container',
  targetId: 'p3-titulo', hintId: 'pres3Hint'
});

function showChannel(index){
  channels.forEach(ch => {
    ch.classList.toggle('is-active', Number(ch.dataset.channel) === index);
  });

  if (index === 0){
    abrirCapituloUno();
  } else if (presTitulo.ready || pres1.ready){
    cerrarCapituloUno();
  }

  if (index === 4){
    pres2.play();
  } else if (pres2.ready){
    pres2.stop();
  }

  if (index === 9){
    pres3.play();
    prefetchScene8();
  } else if (pres3.ready){
    pres3.stop();
  }

  if (index === 1){
    initScene1();
    resetScene1();
    requestAnimationFrame(scaleScene1);
    if (s1.humo) s1.humo.play();
    prefetchScene2();
  } else if (s1.humo){
    s1.humo.pause();
  }

  if (index === 2){
    initScene2();
    requestAnimationFrame(scaleScene2);
    clearTimeout(s2.playTimer);
    s2.playTimer = setTimeout(playScene2, 1000);
    prefetchScene3();
  } else if (s2.ready){
    stopScene2();
  }

  if (index === 3){
    initScene3();
    resetScene3();
    requestAnimationFrame(scaleScene3);
    prefetchScene4();
    pres2.prefetch();
  } else if (s3.ready){
    stopScene3();
  }

  if (index === 5){
    initScene4();
    requestAnimationFrame(scaleScene4);
    clearTimeout(s4.playTimer);
    s4.playTimer = setTimeout(playScene4, 1000);
    prefetchScene5();
  } else if (s4.ready){
    stopScene4();
  }

  if (index === 6){
    initScene5();
    if (scene5Hint) scene5Hint.classList.remove('is-hidden');
    requestAnimationFrame(scaleScene5);
    clearTimeout(s5.playTimer);
    s5.playTimer = setTimeout(playScene5, 1000);
    prefetchScene6();
  } else if (s5.ready){
    stopScene5();
  }

  if (index === 7){
    initScene6();
    resetScene6();
    requestAnimationFrame(scaleScene6);
    clearTimeout(s6.playTimer);
    s6.playTimer = setTimeout(playScene6, 1000);
    prefetchScene7();
  } else if (s6.ready){
    stopScene6();
  }

  if (index === 8){
    initScene7();
    resetScene7();
    requestAnimationFrame(scaleScene7);
    pres3.prefetch();
  } else if (s7.ready){
    stopScene7();
  }

  if (index === 10){
    initScene8();
    resetScene8();
    requestAnimationFrame(scaleScene8);
    clearTimeout(s8.playTimer);
    s8.playTimer = setTimeout(playScene8, 1000);
  } else if (s8.ready){
    stopScene8();
  }

  tvCaption.textContent = leyendaCanal(index);
}

const ctx = staticCanvas.getContext('2d');
let staticRAF = null;

function resizeStaticCanvas(){
  const rect = tvScreen.getBoundingClientRect();
  staticCanvas.width = rect.width;
  staticCanvas.height = rect.height;
}
window.addEventListener('resize', resizeStaticCanvas);

const NOISE_SCALE = 6;
const noiseBuffer = document.createElement('canvas');
const noiseCtx = noiseBuffer.getContext('2d');

function drawStaticFrame(){
  const w = staticCanvas.width, h = staticCanvas.height;
  if (!w || !h) return;
  const nw = Math.max(1, Math.round(w / NOISE_SCALE));
  const nh = Math.max(1, Math.round(h / NOISE_SCALE));
  if (noiseBuffer.width !== nw) noiseBuffer.width = nw;
  if (noiseBuffer.height !== nh) noiseBuffer.height = nh;

  const imgData = noiseCtx.createImageData(nw, nh);
  const buf = imgData.data;
  for (let i = 0; i < buf.length; i += 4){
    const v = Math.random() * 255;
    buf[i] = v; buf[i+1] = v; buf[i+2] = v; buf[i+3] = 255;
  }
  noiseCtx.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseBuffer, 0, 0, nw, nh, 0, 0, w, h);

  if (Math.random() < 0.35){
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const y = Math.random() * h;
    ctx.fillRect(0, y, w, Math.random() * 3 + 1);
  }
}

function runStatic(duration, onMid, done){
  resizeStaticCanvas();
  staticCanvas.classList.add('is-active');

  let finished = false;

  function finish(){
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    cancelAnimationFrame(staticRAF);
    staticCanvas.classList.remove('is-active');
    if (onMid && !onMid.done){
      onMid.done = true;
      onMid();
    }
    if (done) done();
  }

  const safetyTimer = setTimeout(finish, duration + 1200);

  const start = performance.now();
  function frame(now){
    if (finished) return;
    const elapsed = now - start;
    drawStaticFrame();
    if (onMid && elapsed >= duration * 0.45 && !onMid.done){
      onMid.done = true;
      onMid();
    }
    if (elapsed < duration){
      staticRAF = requestAnimationFrame(frame);
    } else {
      finish();
    }
  }
  staticRAF = requestAnimationFrame(frame);
}

const SKIP_DELAY_MS = 1000;
let skipTimer = null;

function playIntro(){
  introPlaying = true;
  introEnded = false;
  tvScreen.classList.add('is-intro');
  skipButton.classList.remove('is-visible');
  setButtonsDisabled(true);

  tvCaption.textContent = 'Reproduciendo introducción…';

  presTitulo.prefetch();
  pres1.prefetch();

  introVideo.currentTime = 0;
  const playPromise = introVideo.play();
  if (playPromise && playPromise.catch){
    playPromise.catch(() => {
      finishIntro();
    });
  }

  skipTimer = setTimeout(() => {
    skipButton.classList.add('is-visible');
  }, SKIP_DELAY_MS);
}

function finishIntro(){
  if (introEnded) return;
  introEnded = true;
  introPlaying = false;
  clearTimeout(skipTimer);
  introVideo.pause();
  skipButton.classList.remove('is-visible');

  runStatic(420, function onMid(){
    tvScreen.classList.remove('is-intro');
    currentChannel = 0;
    showChannel(0);
  }, function done(){
    isAnimating = false;
    setButtonsDisabled(false);
  });
}

introVideo.addEventListener('ended', finishIntro);
introVideo.addEventListener('error', finishIntro);
introVideo.addEventListener('timeupdate', () => {
  if (introPlaying && Number.isFinite(introVideo.duration) &&
      introVideo.currentTime >= introVideo.duration - 0.1){
    finishIntro();
  }
});
skipButton.addEventListener('click', finishIntro);

function changeChannel(delta){
  if (!tvOn || isAnimating || introPlaying) return;
  const next = currentChannel + delta;
  if (next < 0 || next > TOTAL_CHANNELS) return;

  ayudaVista = true;
  isAnimating = true;
  setButtonsDisabled(true);

  runStatic(420, function onMid(){
    showChannel(next);
    currentChannel = next;
  }, function done(){
    isAnimating = false;
    setButtonsDisabled(false);
  });
}

function setButtonsDisabled(disabled){
  btnNext.disabled = disabled;
  btnPrev.disabled = disabled;
}

function powerOn(){
  if (tvOn || isAnimating) return;
  isAnimating = true;
  tv.classList.remove('is-off');
  tvScreen.classList.add('is-powering-on');
  setButtonsDisabled(true);
  tvCaption.textContent = 'Encendiendo…';

  setTimeout(() => {
    tvScreen.classList.remove('is-powering-on');
    tvOn = true;
    playIntro();
  }, 760);
}

function powerOff(){
  if (!tvOn || isAnimating) return;
  isAnimating = true;
  setButtonsDisabled(true);
  tvScreen.classList.add('is-powering-off');
  tvCaption.textContent = 'Apagando…';

  clearTimeout(skipTimer);
  introPlaying = false;
  introEnded = false;
  introVideo.pause();
  tvScreen.classList.remove('is-intro');
  skipButton.classList.remove('is-visible');

  setTimeout(() => {
    tvScreen.classList.remove('is-powering-off');
    tv.classList.add('is-off');
    tvOn = false;
    isAnimating = false;
    setButtonsDisabled(false);
    if (s1.humo) s1.humo.pause();
    if (s2.ready) stopScene2();
    if (s3.ready) stopScene3();
    if (s4.ready) stopScene4();
    if (s5.ready) stopScene5();
    if (s6.ready) stopScene6();
    if (s7.ready) stopScene7();
    if (s8.ready) stopScene8();
    cerrarCapituloUno();
    pres2.stop();
    pres3.stop();
    tvCaption.textContent = 'Televisor apagado';
  }, 560);
}

btnPower.addEventListener('click', () => { tvOn ? powerOff() : powerOn(); });
tvCartel.addEventListener('click', powerOn);
btnNext.addEventListener('click', () => changeChannel(1));
btnPrev.addEventListener('click', () => changeChannel(-1));

const SWIPE_MIN_PX = 60;
const SWIPE_MAX_MS = 700;
let swipe = null;

tvScreen.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || e.target.closest('.scene-run')) return;
  swipe = { x: e.clientX, y: e.clientY, t: performance.now() };
});
tvScreen.addEventListener('pointerup', (e) => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x;
  const dy = e.clientY - swipe.y;
  const dt = performance.now() - swipe.t;
  swipe = null;
  if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 2 || dt > SWIPE_MAX_MS) return;
  changeChannel(dx < 0 ? 1 : -1);
});
tvScreen.addEventListener('pointercancel', () => { swipe = null; });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight'){
    if (s7ControlaFlecha()){
      if (e.repeat) return;
      if (s7.pos < S7_LIMITE){
        e.preventDefault();
        s7Correr();
        return;
      }
    }
    changeChannel(1);
    return;
  }
  if (e.key === 'ArrowLeft'){ changeChannel(-1); return; }

  if (e.key === ' ' || e.key === 'Enter'){
    if (tv.contains(document.activeElement)) return;
    e.preventDefault();
    tvOn ? powerOff() : powerOn();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') s7Soltar();
});
window.addEventListener('blur', s7Soltar);

tv.classList.add('is-off');
setButtonsDisabled(true);
btnPower.disabled = false;
resizeStaticCanvas();
