(function(){
  'use strict';

  const PRESENTACIONES = [0, 4, 9];
  const ULTIMO = TOTAL_CHANNELS;

  const ESCENAS = {
    1: { mira: false, fin: () => [s1.juanesCorre] },
    2: { mira: true, fin: () => [s2.juanesBusca, s2.caja, s2.texto] },
    3: { mira: false, fin: () => [s3.text] },
    5: { mira: true, fin: () => [s4.juanCaminando, s4.txt] },
    6: { mira: false, fin: () => [s5.anims.textVine] },
    7: { mira: false, fin: () => [s6.anims.textoFantas] },
    10: { mira: false, fin: () => [s8.anims.txt] },
    11: { mira: false, fin: () => [s9.anims.textMom] }
  };

  const tvEl = document.getElementById('tv');
  const aviso = document.getElementById('avisoEscena');
  const estado = document.getElementById('avisoEstado');
  const boton = document.getElementById('avisoSiguiente');
  const voz = document.getElementById('avisoVoz');

  let canal = -1;
  let termino = new Set();
  const conectadas = new WeakSet();

  function siguienteEsCapitulo(){
    return PRESENTACIONES.indexOf(canal + 1) !== -1;
  }

  function hablar(texto){
    if (!voz) return;
    voz.textContent = '';
    window.setTimeout(() => { voz.textContent = texto; }, 60);
  }

  function ocultar(){
    aviso.hidden = true;
    aviso.classList.remove('es-fin', 'es-mira');
    boton.hidden = true;
    if (tvEl.classList.contains('fin-escena')) tvEl.classList.remove('fin-escena');
  }

  function mostrarMira(){
    estado.textContent = 'Mira la escena: avanza sola';
    boton.hidden = true;
    aviso.classList.remove('es-fin');
    aviso.classList.add('es-mira');
    aviso.hidden = false;
  }

  function mostrarFin(){
    if (canal < 0 || !aviso.hidden && aviso.classList.contains('es-fin')) return;
    const hayMas = canal < ULTIMO;
    const capitulo = siguienteEsCapitulo();
    const texto = !hayMas ? 'Última escena disponible'
      : capitulo ? 'Capítulo terminado' : 'Escena terminada';
    estado.textContent = texto;
    if (hayMas){
      boton.innerHTML = (capitulo ? 'Siguiente capítulo' : 'Siguiente escena') + ' &rarr;';
      boton.hidden = false;
      tvEl.classList.add('fin-escena');
    } else {
      boton.hidden = true;
    }
    aviso.classList.remove('es-mira');
    aviso.classList.add('es-fin');
    aviso.hidden = false;
    hablar(hayMas ? texto + '. Pulsa el botón derecho o «' + boton.textContent + '» para continuar.' : texto + '.');
    document.dispatchEvent(new CustomEvent('escena-fin'));
  }

  function conectar(anim, indice){
    if (!anim || conectadas.has(anim)) return;
    conectadas.add(anim);
    anim.addEventListener('complete', () => {
      if (canal !== indice) return;
      const cfg = ESCENAS[indice];
      termino.add(anim);
      if (cfg.fin().every(a => a && termino.has(a))) mostrarFin();
    });
  }

  const original = window.showChannel;
  window.showChannel = function(indice){
    original(indice);
    canal = indice;
    termino = new Set();
    ocultar();
    const cfg = ESCENAS[indice];
    if (!cfg) return;
    cfg.fin().forEach(a => conectar(a, indice));
    if (cfg.mira) mostrarMira();
  };

  const etiquetaOriginal = window.s7Etiqueta;
  window.s7Etiqueta = function(fin){
    etiquetaOriginal(fin);
    if (!fin) return;
    s7Boton.innerHTML = 'Siguiente capítulo &rarr;';
    tvEl.classList.add('fin-escena');
    hablar('Capítulo terminado. Pulsa el botón derecho o «Siguiente capítulo» para continuar.');
    document.dispatchEvent(new CustomEvent('escena-fin'));
  };

  new MutationObserver(() => {
    if (tvEl.classList.contains('is-off') && (!aviso.hidden || tvEl.classList.contains('fin-escena'))){
      canal = -1;
      ocultar();
    }
  }).observe(tvEl, { attributes: true, attributeFilter: ['class'] });

  boton.addEventListener('click', () => { changeChannel(1); });
})();
