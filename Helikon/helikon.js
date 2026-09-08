/* =========================================================
   HELIKÓN — interacción de la página
   1) Inclinación 3D de las viñetas de navegación al pasar el
      mouse, igual que en el Home. Son enlaces normales: al
      hacer clic navegan directo. La viñeta "Próximo capítulo"
      está bloqueada a propósito y queda fuera.
   2) La misma inclinación en las fichas del equipo.

   El revelado al hacer scroll y el paralaje del masthead viven
   en ../assets/js/pulp.js, que se carga antes que este archivo.
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Aplica el seguimiento del cursor a un conjunto de tarjetas.
   `strength` son los grados máximos de giro y `lift` cuánto se
   levanta la tarjeta, para poder afinar cada componente. */
function bindTilt(selector, strength, lift){
  document.querySelectorAll(selector).forEach(card => {

    card.addEventListener('mousemove', (e) => {
      if (reduceMotion.matches) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(900px) rotateX(${y * -strength}deg) rotateY(${x * strength}deg) translate(${-lift}px, ${-lift * 1.5}px)`;
    });

    // La tarjeta bajo el cursor se pone por encima para que su
    // sombra dura no quede tapada por la vecina.
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.zIndex = '';
    });

  });
}

bindTilt('.panel:not(.panel-locked)', 2.5, 4);
bindTilt('.team-card', 6, 4);
