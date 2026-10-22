import { crearVista, sinMovimiento } from './escena3d.js';

const escenario = document.getElementById('disco');

const COLORES = {
  'Álbum': { fondo: '#a92820', texto: '#e8dfc9', acento: '#c79b27' },
  'En vivo': { fondo: '#254f68', texto: '#e8dfc9', acento: '#c79b27' },
  'Banda': { fondo: '#c79b27', texto: '#17130e', acento: '#a92820' },
  'Cambio': { fondo: '#2a241c', texto: '#e8dfc9', acento: '#c79b27' }
};

function limitar(valor, min, max){
  return Math.min(max, Math.max(min, valor));
}

function leerActual(){
  const activo = document.querySelector('.hito.activo');
  return {
    anio: document.getElementById('lineaAnio').textContent.trim(),
    titulo: document.getElementById('lineaTituloActivo').textContent.trim(),
    clase: activo ? activo.querySelector('.hito-tipo').textContent.trim() : 'Álbum'
  };
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

  [230, 330, 420].forEach((r) => {
    c.strokeStyle = '#000';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(centro, centro, r, 0, Math.PI * 2);
    c.stroke();
  });

  const brillo = c.createConicGradient(0, centro, centro);
  brillo.addColorStop(0.00, 'rgba(255,255,255,0)');
  brillo.addColorStop(0.08, 'rgba(255,255,255,0.22)');
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

function partirLineas(c, texto, ancho, maxLineas){
  const palabras = texto.split(/\s+/);
  const lineas = [];
  let actual = '';
  palabras.forEach((p) => {
    const prueba = actual ? actual + ' ' + p : p;
    if (c.measureText(prueba).width > ancho && actual){
      lineas.push(actual);
      actual = p;
    } else {
      actual = prueba;
    }
  });
  if (actual) lineas.push(actual);
  return lineas.slice(0, maxLineas);
}

function dibujarEtiqueta(c, lado, datos){
  const centro = lado / 2;
  const paleta = COLORES[datos.clase] || COLORES['Álbum'];

  c.clearRect(0, 0, lado, lado);
  c.fillStyle = paleta.fondo;
  c.fillRect(0, 0, lado, lado);

  c.strokeStyle = paleta.acento;
  c.lineWidth = 8;
  c.beginPath();
  c.arc(centro, centro, centro - 24, 0, Math.PI * 2);
  c.stroke();

  c.fillStyle = paleta.texto;
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  c.font = '110px Bangers, Impact, sans-serif';
  c.fillText(datos.anio, centro, centro - 52);

  let tamanio = 58;
  c.font = tamanio + 'px Bangers, Impact, sans-serif';
  let lineas = partirLineas(c, datos.titulo.toUpperCase(), lado * 0.62, 3);
  while (lineas.length > 2 && tamanio > 40){
    tamanio -= 6;
    c.font = tamanio + 'px Bangers, Impact, sans-serif';
    lineas = partirLineas(c, datos.titulo.toUpperCase(), lado * 0.62, 3);
  }
  lineas.forEach((linea, k) => {
    c.fillText(linea, centro, centro + 10 + k * (tamanio * 0.95));
  });

  c.fillStyle = paleta.acento;
  c.font = '26px "Special Elite", monospace';
  c.fillText(datos.clase.toUpperCase(), centro, centro + 158);
}

function construir(THREE){
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camara.position.set(0, 0.2, 4.1);

  escena.add(new THREE.AmbientLight(0xfff1d6, 0.9));
  const principal = new THREE.DirectionalLight(0xfff1d6, 2.4);
  principal.position.set(-2.6, 3.2, 3.4);
  escena.add(principal);
  const contorno = new THREE.DirectionalLight(0x5f93b6, 1.6);
  contorno.position.set(3, -1, -2.5);
  escena.add(contorno);

  const grupo = new THREE.Group();
  escena.add(grupo);

  const surcos = texturaSurcos(THREE);
  const vinilo = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.04, 96, 1),
    [
      new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 0.4, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: surcos, roughness: 0.34, metalness: 0.45, bumpMap: surcos, bumpScale: 0.6 }),
      new THREE.MeshStandardMaterial({ map: surcos, roughness: 0.34, metalness: 0.45 })
    ]
  );
  grupo.add(vinilo);

  const lado = 512;
  const lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext('2d');
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;

  const material = new THREE.MeshStandardMaterial({ map: textura, roughness: 0.7 });
  const etiqueta = new THREE.Mesh(new THREE.CircleGeometry(0.4, 64), material);
  etiqueta.rotation.x = -Math.PI / 2;
  etiqueta.position.y = 0.0215;
  grupo.add(etiqueta);

  const etiquetaInferior = new THREE.Mesh(new THREE.CircleGeometry(0.4, 64), material);
  etiquetaInferior.rotation.x = Math.PI / 2;
  etiquetaInferior.position.y = -0.0215;
  grupo.add(etiquetaInferior);

  let actual = leerActual();
  let pendiente = null;
  let giro = 0;
  let vuelta = null;
  let reloj = 0;

  function pintarEtiqueta(datos){
    dibujarEtiqueta(c, lado, datos);
    textura.needsUpdate = true;
  }
  pintarEtiqueta(actual);

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => {
      pintarEtiqueta(actual);
      if (modelo.vista) modelo.vista.invalidar();
    });
  }

  document.addEventListener('linea:hito', (e) => {
    const datos = {
      anio: e.detail.anio,
      titulo: e.detail.titulo,
      clase: e.detail.clase
    };
    if (datos.anio === actual.anio && datos.titulo === actual.titulo) return;

    if (sinMovimiento() || !modelo.vista){
      actual = datos;
      pintarEtiqueta(actual);
      if (modelo.vista) modelo.vista.invalidar();
      return;
    }

    pendiente = datos;
    vuelta = { inicio: reloj, duracion: 0.7, cambiado: false };
    modelo.vista.invalidar();
  });

  function redimensionar(ancho, alto){
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  }

  function actualizar(dt, t){
    reloj = t;
    const mover = !sinMovimiento();

    if (mover) giro += dt * 0.9;
    vinilo.rotation.y = giro;

    let extra = 0;
    if (vuelta){
      const p = limitar((t - vuelta.inicio) / vuelta.duracion, 0, 1);
      if (p < 0.5){
        const q = p * 2;
        extra = (q * q * (3 - 2 * q)) * Math.PI / 2;
      } else {
        if (!vuelta.cambiado){
          vuelta.cambiado = true;
          actual = pendiente;
          pintarEtiqueta(actual);
        }
        const q = (p - 0.5) * 2;
        extra = -(1 - q * q * (3 - 2 * q)) * Math.PI / 2;
      }
      if (p >= 1){
        vuelta = null;
        extra = 0;
      }
    }

    grupo.rotation.x = 0.95;
    grupo.rotation.y = 0;
    grupo.rotation.z = 0.12 + extra;
  }

  function continuo(){
    return !sinMovimiento() || vuelta !== null;
  }

  const modelo = { escena, camara, actualizar, continuo, redimensionar, vista: null };
  return modelo;
}

let modeloRef = null;

crearVista({
  elemento: escenario,
  lienzo: escenario.querySelector('.disco-lienzo'),
  construir(THREE){
    modeloRef = construir(THREE);
    return modeloRef;
  }
}).then((v) => {
  if (modeloRef) modeloRef.vista = v;
}).catch(() => {
  modeloRef = null;
});
