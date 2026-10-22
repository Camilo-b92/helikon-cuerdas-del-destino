(function(){
  'use strict';

  const video = document.getElementById('introVideo');
  const boton = document.getElementById('introSonido');
  if (!video || !boton) return;

  const reproducir = video.play.bind(video);

  function silencio(){
    return !!(window.Sonido && window.Sonido.silenciado());
  }

  const EVENTOS = ['pointerdown', 'keydown', 'touchend'];
  let escuchando = false;

  function mostrar(si){
    boton.classList.toggle('is-visible', si);
    if (!si) dejarDeEscuchar();
  }

  function alPrimerGesto(){
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    video.muted = silencio();
    mostrar(false);
  }

  function escuchar(){
    if (escuchando) return;
    escuchando = true;
    EVENTOS.forEach((tipo) => document.addEventListener(tipo, alPrimerGesto, true));
  }

  function dejarDeEscuchar(){
    if (!escuchando) return;
    escuchando = false;
    EVENTOS.forEach((tipo) => document.removeEventListener(tipo, alPrimerGesto, true));
  }

  video.play = function(){
    video.muted = silencio();
    mostrar(false);
    const promesa = reproducir();
    if (!promesa || !promesa.catch) return promesa;
    return promesa.catch((error) => {
      if (!error || error.name !== 'NotAllowedError') throw error;
      video.muted = true;
      if (!silencio()){
        mostrar(true);
        escuchar();
      }
      return reproducir();
    });
  };

  boton.addEventListener('click', () => {
    video.muted = silencio();
    mostrar(false);
  });

  if (window.Sonido){
    window.Sonido.alCambiar((si) => {
      video.muted = si;
      if (!si) mostrar(false);
    });
  }

  ['ended', 'error', 'pause'].forEach((tipo) => video.addEventListener(tipo, () => mostrar(false)));
  document.getElementById('skipButton').addEventListener('click', () => mostrar(false));
})();
