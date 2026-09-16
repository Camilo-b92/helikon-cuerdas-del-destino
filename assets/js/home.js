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
