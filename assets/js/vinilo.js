const escenario = document.getElementById('vinilo');
const reduceMotion = (window.Movimiento ? window.Movimiento.consulta : window.matchMedia('(prefers-reduced-motion: reduce)'));

function limitar(valor, min, max){
  return Math.min(max, Math.max(min, valor));
}

function suavizar(t){
  return t * t * (3 - 2 * t);
}

function texturaSurcos(THREE){
  const lado = 1024;
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext('2d');
  const centro = lado / 2;

  c.fillStyle = '#0e0c0a';
  c.fillRect(0, 0, lado, lado);

  for (let r = 120; r < centro - 6; r += 2.2){
    const claro = 14 + Math.round(Math.random() * 16);
    c.strokeStyle = 'rgb(' + claro + ',' + claro + ',' + (claro + 2) + ')';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(centro, centro, r, 0, Math.PI * 2);
    c.stroke();
  }

  const bandas = [230, 330, 420];
  bandas.forEach((r) => {
    c.strokeStyle = '#000';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(centro, centro, r, 0, Math.PI * 2);
    c.stroke();
  });

  const brillo = c.createConicGradient(0, centro, centro);
  brillo.addColorStop(0.00, 'rgba(255,255,255,0)');
  brillo.addColorStop(0.08, 'rgba(255,255,255,0.20)');
  brillo.addColorStop(0.16, 'rgba(255,255,255,0)');
  brillo.addColorStop(0.50, 'rgba(255,255,255,0)');
  brillo.addColorStop(0.58, 'rgba(255,255,255,0.16)');
  brillo.addColorStop(0.66, 'rgba(255,255,255,0)');
  brillo.addColorStop(1.00, 'rgba(255,255,255,0)');
  c.fillStyle = brillo;
  c.beginPath();
  c.arc(centro, centro, centro - 4, 0, Math.PI * 2);
  c.arc(centro, centro, 120, 0, Math.PI * 2, true);
  c.fill('evenodd');

  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  return textura;
}

function texturaEtiqueta(THREE){
  const lado = 512;
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext('2d');
  const centro = lado / 2;

  c.fillStyle = '#a92820';
  c.fillRect(0, 0, lado, lado);

  c.strokeStyle = '#c79b27';
  c.lineWidth = 8;
  c.beginPath();
  c.arc(centro, centro, centro - 26, 0, Math.PI * 2);
  c.stroke();

  c.fillStyle = '#17130e';
  c.beginPath();
  c.arc(centro, centro, 14, 0, Math.PI * 2);
  c.fill();

  c.textAlign = 'center';
  c.fillStyle = '#e8dfc9';
  c.font = '84px Bangers, Impact, sans-serif';
  c.fillText('HELIKÓN', centro, centro - 56);
  c.font = '38px Bangers, Impact, sans-serif';
  c.fillStyle = '#c79b27';
  c.fillText('CUERDAS DEL DESTINO', centro, centro + 82);
  c.font = '26px "Special Elite", monospace';
  c.fillStyle = '#e8dfc9';
  c.fillText('LADO A', centro, centro + 130);

  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  return textura;
}

function crearPua(THREE){
  const forma = new THREE.Shape();
  forma.moveTo(0, 0.5);
  forma.bezierCurveTo(0.42, 0.5, 0.52, 0.06, 0.34, -0.2);
  forma.bezierCurveTo(0.22, -0.4, 0.08, -0.5, 0, -0.56);
  forma.bezierCurveTo(-0.08, -0.5, -0.22, -0.4, -0.34, -0.2);
  forma.bezierCurveTo(-0.52, 0.06, -0.42, 0.5, 0, 0.5);

  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: 0.05,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 4,
    curveSegments: 24
  });
  geometria.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0xc79b27,
    roughness: 0.38,
    metalness: 0.1
  });

  const pua = new THREE.Mesh(geometria, material);
  pua.scale.setScalar(0.5);
  return pua;
}

async function iniciar(){
  const lienzo = escenario.querySelector('.vinilo-lienzo');
  if (!lienzo) return;

  let THREE;
  try {
    THREE = await import('../vendor/three/three.module.min.js');
  } catch (error) {
    return;
  }

  let renderizador;
  try {
    renderizador = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
  } catch (error) {
    return;
  }

  renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderizador.outputColorSpace = THREE.SRGBColorSpace;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camara.position.set(0, 0.2, 5.2);

  escena.add(new THREE.AmbientLight(0xfff1d6, 0.9));

  const luzPrincipal = new THREE.DirectionalLight(0xfff1d6, 2.4);
  luzPrincipal.position.set(-2.6, 3.2, 3.4);
  escena.add(luzPrincipal);

  const luzContorno = new THREE.DirectionalLight(0x5f93b6, 1.6);
  luzContorno.position.set(3, -1, -2.5);
  escena.add(luzContorno);

  const grupo = new THREE.Group();
  escena.add(grupo);

  const disco = new THREE.Group();
  grupo.add(disco);

  const surcos = texturaSurcos(THREE);
  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.04, 96, 1),
    [
      new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 0.4, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: surcos, roughness: 0.34, metalness: 0.45, bumpMap: surcos, bumpScale: 0.6 }),
      new THREE.MeshStandardMaterial({ map: surcos, roughness: 0.34, metalness: 0.45 })
    ]
  );
  disco.add(cuerpo);

  const etiquetaTextura = texturaEtiqueta(THREE);
  const etiqueta = new THREE.Mesh(
    new THREE.CircleGeometry(0.36, 64),
    new THREE.MeshStandardMaterial({ map: etiquetaTextura, roughness: 0.7 })
  );
  etiqueta.rotation.x = -Math.PI / 2;
  etiqueta.position.y = 0.0215;
  disco.add(etiqueta);

  const etiquetaInferior = etiqueta.clone();
  etiquetaInferior.rotation.x = Math.PI / 2;
  etiquetaInferior.position.y = -0.0215;
  disco.add(etiquetaInferior);

  const pua = crearPua(THREE);
  grupo.add(pua);

  let ancho = 0;
  let alto = 0;
  function medir(){
    const caja = escenario.getBoundingClientRect();
    ancho = Math.max(1, Math.round(caja.width));
    alto = Math.max(1, Math.round(caja.height));
    renderizador.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  }
  medir();
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(escenario);
  else window.addEventListener('resize', medir);

  let punteroX = 0;
  let punteroY = 0;
  let suaveX = 0;
  let suaveY = 0;

  escenario.addEventListener('pointermove', (e) => {
    const caja = escenario.getBoundingClientRect();
    punteroX = ((e.clientX - caja.left) / caja.width - 0.5) * 2;
    punteroY = ((e.clientY - caja.top) / caja.height - 0.5) * 2;
  });
  escenario.addEventListener('pointerleave', () => {
    punteroX = 0;
    punteroY = 0;
  });

  let visible = true;
  let reloj = 0;
  let anterior = performance.now();
  let giroIdle = 0;

  function avanceSeccion(){
    const caja = escenario.getBoundingClientRect();
    const vh = window.innerHeight;
    return limitar((vh - caja.top) / (vh + caja.height), 0, 1);
  }

  function pintar(ahora){
    const dt = Math.min((ahora - anterior) / 1000, 0.05);
    anterior = ahora;
    reloj += dt;

    const p = avanceSeccion();
    const e = suavizar(p);

    if (!reduceMotion.matches) giroIdle += dt * 0.35;

    suaveX += (punteroX - suaveX) * 0.08;
    suaveY += (punteroY - suaveY) * 0.08;

    disco.rotation.y = giroIdle + p * Math.PI * 5;

    grupo.rotation.x = 1.15 - e * 0.75 + suaveY * 0.18;
    grupo.rotation.z = (0.5 - p) * 0.5 + suaveX * -0.12;
    grupo.rotation.y = suaveX * 0.25;
    grupo.position.y = (0.5 - p) * 0.3;
    const escala = 0.82 + e * 0.22;
    grupo.scale.setScalar(escala);

    const angulo = p * Math.PI * 2 - 0.6;
    pua.position.set(Math.cos(angulo) * 1.35, Math.sin(angulo) * 0.55 + 0.35, 0.6 + Math.sin(angulo) * 0.2);
    pua.rotation.set(reloj * 0.6, reloj * 0.9, angulo);

    renderizador.render(escena, camara);
  }

  function bucle(ahora){
    if (!visible) return;
    pintar(ahora);
    window.requestAnimationFrame(bucle);
  }

  if ('IntersectionObserver' in window){
    new IntersectionObserver((entradas) => {
      const ahoraVisible = entradas[0].isIntersecting;
      if (ahoraVisible && !visible){
        visible = true;
        anterior = performance.now();
        window.requestAnimationFrame(bucle);
      } else {
        visible = ahoraVisible;
      }
    }, { rootMargin: '80px' }).observe(escenario);
  }

  if (reduceMotion.matches){
    pintar(performance.now());
    window.addEventListener('scroll', () => pintar(performance.now()), { passive: true });
  } else {
    window.requestAnimationFrame(bucle);
  }

  escenario.classList.add('vinilo--listo');
}

if (escenario){
  if ('IntersectionObserver' in window){
    const vigia = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting){
        vigia.disconnect();
        iniciar();
      }
    }, { rootMargin: '500px 0px' });
    vigia.observe(escenario);
  } else {
    iniciar();
  }
}
