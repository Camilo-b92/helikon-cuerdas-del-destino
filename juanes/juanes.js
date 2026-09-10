/* =========================================================
   JUANES — interacción de la página
   1) Inclinación 3D de la viñeta que lleva al cómic. Es un
      enlace normal: al hacer clic navega directo.
   2) Barra de progreso de lectura.
   3) Las cifras de reconocimientos cuentan hacia arriba la
      primera vez que entran en pantalla.

   El revelado de las secciones y el paralaje del masthead
   viven en ../assets/js/pulp.js, que se carga antes que este
   archivo.
   ========================================================= */

const inkFill = document.getElementById('inkFill');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* =========================================================
   Viñeta de navegación (misma que en Home y Helikón)
   ========================================================= */
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

/* =========================================================
   Barra de progreso de lectura
   ========================================================= */
function updateReadingProgress(){
  if (!inkFill) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  inkFill.style.height = `${progress}%`;
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

/* =========================================================
   Cifras que cuentan hacia arriba
   El texto puede traer prefijo y sufijo ("+16M"), así que se
   separan y solo se anima la parte numérica. Al terminar se
   restituye el texto original, para no depender de cómo lo
   hayamos vuelto a componer.
   ========================================================= */
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
    const eased = 1 - Math.pow(1 - t, 3); // desacelera al final
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
        countObserver.unobserve(entry.target); // solo la primera vez
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => countObserver.observe(el));
}
