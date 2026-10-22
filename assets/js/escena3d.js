const reduceMotion = (window.Movimiento ? window.Movimiento.consulta : window.matchMedia('(prefers-reduced-motion: reduce)'));

let THREE = null;
let promesaThree = null;
let renderizador = null;
let anchoMax = 0;
let altoMax = 0;
let perdido = false;
let corriendo = false;
let anterior = 0;
const vistas = [];

export function cargarThree(){
  if (!promesaThree){
    promesaThree = import('../vendor/three/three.module.min.js').then((modulo) => {
      THREE = modulo;
      return modulo;
    });
  }
  return promesaThree;
}

function asegurarRenderizador(ancho, alto){
  if (perdido || !THREE) return null;

  if (!renderizador){
    const lienzo = document.createElement('canvas');
    try {
      renderizador = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
    } catch (error) {
      renderizador = null;
      perdido = true;
      return null;
    }
    renderizador.setPixelRatio(1);
    renderizador.outputColorSpace = THREE.SRGBColorSpace;
    renderizador.setClearColor(0x000000, 0);
    renderizador.setScissorTest(true);

    lienzo.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      perdido = true;
      vistas.forEach((v) => v.elemento.classList.remove('escena--lista'));
    });
  }

  if (ancho > anchoMax || alto > altoMax){
    anchoMax = Math.max(anchoMax, ancho);
    altoMax = Math.max(altoMax, alto);
    renderizador.setSize(anchoMax, altoMax, false);
  }

  return renderizador;
}

function pintar(v, dt, t){
  const r = renderizador;
  if (!r || perdido) return;

  v.modelo.actualizar(dt, t);

  r.setViewport(0, 0, v.bw, v.bh);
  r.setScissor(0, 0, v.bw, v.bh);
  r.clear();
  r.render(v.modelo.escena, v.modelo.camara);

  v.ctx.clearRect(0, 0, v.bw, v.bh);
  v.ctx.drawImage(r.domElement, 0, r.domElement.height - v.bh, v.bw, v.bh, 0, 0, v.bw, v.bh);
}

function bucle(ahora){
  const dt = Math.min((ahora - anterior) / 1000, 0.05);
  anterior = ahora;
  let alguna = false;

  vistas.forEach((v) => {
    if (!v.visible || perdido) return;
    alguna = true;
    if (v.sucio || (v.modelo.continuo && v.modelo.continuo())){
      v.sucio = false;
      pintar(v, dt, ahora / 1000);
    }
  });

  if (alguna){
    window.requestAnimationFrame(bucle);
  } else {
    corriendo = false;
  }
}

function arrancar(){
  if (corriendo || perdido) return;
  corriendo = true;
  anterior = performance.now();
  window.requestAnimationFrame(bucle);
}

export async function crearVista(opciones){
  const elemento = opciones.elemento;
  const lienzo = opciones.lienzo;

  await cargarThree();
  if (!asegurarRenderizador(2, 2)) throw new Error('WebGL no disponible');

  const modelo = opciones.construir(THREE);
  const vista = {
    elemento,
    lienzo,
    modelo,
    ctx: lienzo.getContext('2d'),
    bw: 2,
    bh: 2,
    visible: false,
    sucio: true,
    invalidar(){
      vista.sucio = true;
      if (vista.visible) arrancar();
    }
  };

  function medir(){
    const caja = elemento.getBoundingClientRect();
    const ancho = Math.max(1, Math.round(caja.width));
    const alto = Math.max(1, Math.round(caja.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vista.bw = Math.max(2, Math.round(ancho * dpr));
    vista.bh = Math.max(2, Math.round(alto * dpr));
    lienzo.width = vista.bw;
    lienzo.height = vista.bh;
    asegurarRenderizador(vista.bw, vista.bh);
    if (modelo.redimensionar) modelo.redimensionar(ancho, alto);
    vista.sucio = true;
    if (vista.visible) arrancar();
  }

  medir();
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(elemento);
  else window.addEventListener('resize', medir);

  vistas.push(vista);

  if ('IntersectionObserver' in window){
    new IntersectionObserver((entradas) => {
      vista.visible = entradas[0].isIntersecting;
      if (vista.visible){
        vista.sucio = true;
        arrancar();
      }
    }, { rootMargin: '80px' }).observe(elemento);
  } else {
    vista.visible = true;
    arrancar();
  }

  reduceMotion.addEventListener('change', () => vista.invalidar());

  pintar(vista, 0, 0);
  elemento.classList.add('escena--lista');
  return vista;
}

export function sinMovimiento(){
  return reduceMotion.matches;
}
