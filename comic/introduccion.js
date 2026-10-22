(function(){
  'use strict';

  const video = document.getElementById('introVideo');
  const boton = document.getElementById('introSonido');
  if (!video || !boton) return;

  const reproducir = video.play.bind(video);

  function mostrar(si){
    boton.classList.toggle('is-visible', si);
  }

  video.play = function(){
    video.muted = false;
    mostrar(false);
    const promesa = reproducir();
    if (!promesa || !promesa.catch) return promesa;
    return promesa.catch((error) => {
      if (!error || error.name !== 'NotAllowedError') throw error;
      video.muted = true;
      mostrar(true);
      return reproducir();
    });
  };

  boton.addEventListener('click', () => {
    video.muted = false;
    mostrar(false);
  });

  ['ended', 'error', 'pause'].forEach((tipo) => video.addEventListener(tipo, () => mostrar(false)));
  document.getElementById('skipButton').addEventListener('click', () => mostrar(false));
})();
