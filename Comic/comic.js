/* =========================================================
   CUERDAS DEL DESTINO — Televisor interactivo
   Al encender: video de introducción (con botón de saltar) → menú
   Canales 0–2 = menú (Personajes, Historial, Stop motion)
   Canal 3 = portada capítulo uno · Canales 4–6 = escenas I–III
   Canal 7 = fin del capítulo uno
   Canal 8 = portada capítulo dos · Canal 9 = escena I del capítulo dos
   ========================================================= */

const TOTAL_CHANNELS = 9; // last index (0..9)
let currentChannel = 0;
let tvOn = false;
let isAnimating = false; // true during power-on/off or static transition
let introPlaying = false;
let introEnded = false; // guards against double-triggering the end-of-intro transition

/* ---------- DOM refs ---------- */
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

const channelNames = [
  'Personajes', 'Historial', 'Stop motion',
  'Cuerdas del Destino — Portada', 'Escena I — El llamado', 'Escena II',
  'Escena III', 'Fin del capítulo uno',
  'Capítulo dos — Portada', 'Capítulo 2 — Escena I'
];

/* =========================================================
   Placeholder illustrations (canales 2–6, en espera de arte final)
   ========================================================= */
const illustrations = {
  personajes: `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
    <circle cx="400" cy="230" r="70" fill="none" stroke="#09cbbb" stroke-width="1.6"/>
    <path d="M270 460 C 270 350, 330 300, 400 300 C 470 300, 530 350, 530 460" fill="none" stroke="#09cbbb" stroke-width="1.6"/>
    <circle cx="230" cy="270" r="34" fill="none" stroke="#0b8a3a" stroke-width="1" opacity="0.5"/>
    <circle cx="570" cy="270" r="34" fill="none" stroke="#0b8a3a" stroke-width="1" opacity="0.5"/>
  </svg>`,
  historial: `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
    <circle cx="400" cy="300" r="120" fill="none" stroke="#09cbbb" stroke-width="1.6"/>
    <line x1="400" y1="300" x2="400" y2="210" stroke="#fafac8" stroke-width="1.6"/>
    <line x1="400" y1="300" x2="460" y2="320" stroke="#fafac8" stroke-width="1.6"/>
    <circle cx="400" cy="300" r="4" fill="#0b8a3a"/>
    <circle cx="400" cy="150" r="2" fill="#cfe8eb" opacity="0.6"/>
    <circle cx="650" cy="300" r="2" fill="#cfe8eb" opacity="0.6"/>
  </svg>`,
  stopmotion: `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
    <rect x="260" y="200" width="280" height="200" rx="6" fill="none" stroke="#09cbbb" stroke-width="1.6"/>
    <line x1="260" y1="240" x2="540" y2="240" stroke="#09cbbb" stroke-width="1" opacity="0.5"/>
    <line x1="260" y1="360" x2="540" y2="360" stroke="#09cbbb" stroke-width="1" opacity="0.5"/>
    <circle cx="300" cy="220" r="4" fill="#0b8a3a"/>
    <circle cx="500" cy="220" r="4" fill="#0b8a3a"/>
    <circle cx="300" cy="380" r="4" fill="#0b8a3a"/>
    <circle cx="500" cy="380" r="4" fill="#0b8a3a"/>
  </svg>`
};

channels.forEach(ch => {
  const key = ch.dataset.illustration;
  if (key && illustrations[key]){
    const wrap = document.createElement('div');
    wrap.className = 'ch-illustration';
    wrap.innerHTML = illustrations[key];
    ch.prepend(wrap);
  }
});

/* =========================================================
   Escena 1 — Lottie
   ========================================================= */
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

window.addEventListener('resize', () => { scaleScene1(); scaleScene2(); scaleScene3(); scaleScene4(); });

/* =========================================================
   Escena 2 — Lottie (secuencia automática, sin clic)
   ========================================================= */
let s2 = { juanesBusca: null, caja: null, texto: null, ready: false, textoTimer: null, playTimer: null };

function initScene2(){
  if (s2.ready || typeof lottie === 'undefined') return;

  // juanesBusca y texto vuelven a 'svg': texto.json tiene una capa de
  // texto real, y el renderer 'canvas' de Lottie no maneja bien su color/
  // fuente (salía en negro). Solo caja.json necesita 'canvas' — es la
  // animación vectorial pesada (2.7MB) que congelaba el navegador al
  // crear miles de nodos SVG.
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

  // A caja (canvas) solo la remedimos UNA vez, cuando su renderer termina
  // de construirse — no en cada reproducción, que es lo que sospecho que
  // seguía colgando el navegador en cada ida y vuelta al canal.
  s2.caja.addEventListener('DOMLoaded', () => { s2.caja.resize(); });

  // setSubframe(false): en vez de interpolar y redibujar en cada instante
  // de tiempo, solo redibuja en los 25 fotogramas reales del archivo.
  // Para una animación tan densa como caja.json, esto reduce bastante el
  // trabajo de redibujado sostenido durante la reproducción.
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
  // Solo calentamos la caché de red (fetch), sin crear todavía los
  // canvas de Lottie: el renderer 'canvas' fija su tamaño según el
  // contenedor en el momento en que se crea, y el canal 5 sigue oculto
  // aquí (display:none = 0x0). Crearlos de verdad se hace en
  // initScene2(), que solo se llama cuando el canal ya es visible.
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

let s2PlayToken = 0;

function playScene2(){
  const token = ++s2PlayToken;
  clearTimeout(s2.textoTimer);

  scene2Container.classList.remove('is-ready');
  if (s2.juanesBusca) s2.juanesBusca.goToAndStop(0, true);
  if (s2.caja) s2.caja.goToAndStop(0, true);
  if (s2.texto) s2.texto.goToAndStop(0, true);

  // doble rAF: garantiza que el navegador pinte el estado "sin is-ready"
  // antes de reañadirla, para que la animación de entrada reinicie limpio
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (token !== s2PlayToken) return; // una llamada más nueva ya tomó el control
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

/* =========================================================
   Escena 3 — Lottie (clic para disparar, en cascada por etapas)
   ========================================================= */
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
  if (s3.juanesEmocion) s3.juanesEmocion.play(); // autoplay en loop, como en el original

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

/* =========================================================
   Escena 1, Capítulo 2 — Lottie (arranca sola al entrar al canal)
   ========================================================= */
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

/* =========================================================
   Channel rendering
   ========================================================= */
function showChannel(index){
  channels.forEach(ch => {
    ch.classList.toggle('is-active', Number(ch.dataset.channel) === index);
  });

  if (index === 4){
    initScene1();
    resetScene1();
    requestAnimationFrame(scaleScene1);
    if (s1.humo) s1.humo.play();
    prefetchScene2(); // adelanta la carga del canal siguiente mientras el usuario ve este
  } else if (s1.humo){
    s1.humo.pause();
  }

  if (index === 5){
    initScene2();
    requestAnimationFrame(scaleScene2);
    clearTimeout(s2.playTimer);
    s2.playTimer = setTimeout(playScene2, 1000);
    prefetchScene3();
  } else if (s2.ready){
    stopScene2();
  }

  if (index === 6){
    initScene3();
    resetScene3();
    requestAnimationFrame(scaleScene3);
    prefetchScene4();
  } else if (s3.ready){
    stopScene3();
  }

  if (index === 9){
    initScene4();
    requestAnimationFrame(scaleScene4);
    clearTimeout(s4.playTimer);
    s4.playTimer = setTimeout(playScene4, 1000);
  } else if (s4.ready){
    stopScene4();
  }

  tvCaption.textContent = `Canal ${index} / ${TOTAL_CHANNELS} — ${channelNames[index]}`;
}

/* =========================================================
   Static / interference transition
   ========================================================= */
const ctx = staticCanvas.getContext('2d');
let staticRAF = null;

function resizeStaticCanvas(){
  const rect = tvScreen.getBoundingClientRect();
  staticCanvas.width = rect.width;
  staticCanvas.height = rect.height;
}
window.addEventListener('resize', resizeStaticCanvas);

/* Ruido dibujado en un buffer chico y escalado hacia arriba: mismo efecto
   visual (incluso más "granulado" y auténtico), una fracción del costo. */
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

  // occasional bright horizontal glitch line
  if (Math.random() < 0.35){
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const y = Math.random() * h;
    ctx.fillRect(0, y, w, Math.random() * 3 + 1);
  }
}

function runStatic(duration, onMid, done){
  resizeStaticCanvas();
  staticCanvas.classList.add('is-active');

  const start = performance.now();
  function frame(now){
    const elapsed = now - start;
    drawStaticFrame();
    if (onMid && elapsed >= duration * 0.45 && !onMid.done){
      onMid.done = true;
      onMid();
    }
    if (elapsed < duration){
      staticRAF = requestAnimationFrame(frame);
    } else {
      staticCanvas.classList.remove('is-active');
      cancelAnimationFrame(staticRAF);
      if (done) done();
    }
  }
  staticRAF = requestAnimationFrame(frame);
}

/* =========================================================
   Intro video (plays once per power-on, before the menu)
   ========================================================= */
const SKIP_DELAY_MS = 1000; // botón de saltar aparece al primer segundo
const INTRO_MAX_SECONDS = 55; // tope duro si alguien ve el video completo
let skipTimer = null;

function playIntro(){
  introPlaying = true;
  introEnded = false;
  tvScreen.classList.add('is-intro');
  skipButton.classList.remove('is-visible');
  setButtonsDisabled(true);
  tvCaption.textContent = 'Reproduciendo introducción…';

  introVideo.currentTime = 0;
  const playPromise = introVideo.play();
  if (playPromise && playPromise.catch){
    playPromise.catch(() => {
      // autoplay bloqueado o archivo ausente: no dejar al usuario atascado
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
  if (introPlaying && introVideo.currentTime >= INTRO_MAX_SECONDS) finishIntro();
});
skipButton.addEventListener('click', finishIntro);

/* =========================================================
   Navigation
   ========================================================= */
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

/* =========================================================
   Power on / off
   ========================================================= */
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
    tvCaption.textContent = 'Televisor apagado';
  }, 560);
}

/* =========================================================
   Wiring
   ========================================================= */
btnPower.addEventListener('click', () => { tvOn ? powerOff() : powerOn(); });
btnNext.addEventListener('click', () => changeChannel(1));
btnPrev.addEventListener('click', () => changeChannel(-1));

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight'){ changeChannel(1); return; }
  if (e.key === 'ArrowLeft'){ changeChannel(-1); return; }

  if (e.key === ' ' || e.key === 'Enter'){
    // Si el foco está en cualquier control del televisor (encender,
    // cambiar canal, saltar la intro) el navegador ya dispara su click:
    // encender/apagar además de eso apagaba el TV al pulsar Enter sobre
    // "canal siguiente" o sobre "Saltar".
    if (tv.contains(document.activeElement)) return;
    e.preventDefault(); // que la barra espaciadora no scrollee la página
    tvOn ? powerOff() : powerOn();
  }
});

/* ---------- Initial state ---------- */
tv.classList.add('is-off');
setButtonsDisabled(true);
btnPower.disabled = false;
resizeStaticCanvas();