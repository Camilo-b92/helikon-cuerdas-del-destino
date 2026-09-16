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
