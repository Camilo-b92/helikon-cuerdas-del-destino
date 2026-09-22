const TOTAL_CHANNELS = 7;
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

const channelNames = [
  'Capítulo uno — Presentación', 'Escena I — El llamado', 'Escena II',
  'Escena III', 'Fin del capítulo uno',
  'Capítulo dos — Presentación', 'Capítulo 2 — Escena I', 'Capítulo 2 — Escena II'
];

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

window.addEventListener('resize', () => { scaleScene1(); scaleScene2(); scaleScene3(); scaleScene4(); scaleScene5(); });

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

const PRES_DELAY_MS = 450;
const PRES_SAFETY_MS = 6000;

function crearPresentacion({ ruta, imagenes, stageId, containerId, targetId, hintId, alTerminar }){
  const stage = document.getElementById(stageId);
  const container = document.getElementById(containerId);
  const target = document.getElementById(targetId);
  const hint = document.getElementById(hintId);

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

function showChannel(index){
  channels.forEach(ch => {
    ch.classList.toggle('is-active', Number(ch.dataset.channel) === index);
  });

  if (index === 4) pres2.prefetch();

  if (index === 0){
    abrirCapituloUno();
  } else if (presTitulo.ready || pres1.ready){
    cerrarCapituloUno();
  }

  if (index === 5){
    pres2.play();
  } else if (pres2.ready){
    pres2.stop();
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
  } else if (s3.ready){
    stopScene3();
  }

  if (index === 6){
    initScene4();
    requestAnimationFrame(scaleScene4);
    clearTimeout(s4.playTimer);
    s4.playTimer = setTimeout(playScene4, 1000);
    prefetchScene5();
  } else if (s4.ready){
    stopScene4();
  }

  if (index === 7){
    initScene5();
    requestAnimationFrame(scaleScene5);
    clearTimeout(s5.playTimer);
    s5.playTimer = setTimeout(playScene5, 1000);
  } else if (s5.ready){
    stopScene5();
  }

  tvCaption.textContent = `Canal ${index} / ${TOTAL_CHANNELS} — ${channelNames[index]}`;
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
    cerrarCapituloUno();
    pres2.stop();
    tvCaption.textContent = 'Televisor apagado';
  }, 560);
}

btnPower.addEventListener('click', () => { tvOn ? powerOff() : powerOn(); });
btnNext.addEventListener('click', () => changeChannel(1));
btnPrev.addEventListener('click', () => changeChannel(-1));

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight'){ changeChannel(1); return; }
  if (e.key === 'ArrowLeft'){ changeChannel(-1); return; }

  if (e.key === ' ' || e.key === 'Enter'){
    if (tv.contains(document.activeElement)) return;
    e.preventDefault();
    tvOn ? powerOff() : powerOn();
  }
});

tv.classList.add('is-off');
setButtonsDisabled(true);
btnPower.disabled = false;
resizeStaticCanvas();
