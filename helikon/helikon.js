const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
