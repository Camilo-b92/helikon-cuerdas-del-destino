/* =========================================================
   HOME — interacción de los paneles
   Efecto de inclinación 3D que sigue el cursor (como una carta
   coleccionable) mientras el mouse está sobre un panel, más un
   pequeño sonido al hacer clic.

   El revelado al hacer scroll y el paralaje del masthead viven
   en assets/js/pulp.js, que se carga antes que este archivo.
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* =========================================================
   Sonido de clic
   Un único AudioContext para toda la página: crear uno nuevo en
   cada clic deja contextos huérfanos y los navegadores limitan
   cuántos permiten por pestaña.
   ========================================================= */
let audioCtx = null;

function playClickSound(){
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return; // navegador sin Web Audio: el clic sigue funcionando

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
    /* si el audio falla, la navegación no debe romperse */
  }
}

/* =========================================================
   Paneles de navegación
   ========================================================= */
document.querySelectorAll('.panel').forEach(panel => {

  panel.addEventListener('click', playClickSound);

  panel.addEventListener('mousemove', (e) => {
    if (reduceMotion.matches) return;

    const rect = panel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    panel.style.transform =
      `perspective(1200px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translate(-5px, -8px) scale(1.01)`;

    // luz que sigue al cursor por encima del color plano del panel
    panel.style.backgroundImage =
      `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.10), transparent 50%)`;
  });

  // El panel bajo el cursor se pone por encima para que su sombra dura
  // no quede tapada por el panel vecino.
  panel.addEventListener('mouseenter', () => {
    panel.style.zIndex = '10';
  });

  panel.addEventListener('mouseleave', () => {
    panel.style.transform = '';
    panel.style.backgroundImage = '';
    panel.style.zIndex = '';
  });
});
