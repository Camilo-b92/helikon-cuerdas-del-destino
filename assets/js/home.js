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
