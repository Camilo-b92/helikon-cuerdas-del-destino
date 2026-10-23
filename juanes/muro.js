(function(){
  const datos = window.PREMIOS_JUANES;
  const muro = document.getElementById('muro');
  const cuerpo = document.getElementById('muroCuerpo');
  if (!datos || !muro || !cuerpo) return;

  const NS = 'http://www.w3.org/2000/svg';
  const familias = datos.familias;
  const ceremonias = datos.ceremonias;
  const famPorId = {};
  familias.forEach((f) => { famPorId[f.id] = f; });
  const cerPorId = {};
  ceremonias.forEach((c) => { cerPorId[c.id] = c; });

  function normalizar(texto){
    return String(texto)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function plural(n, uno, varios){
    return n + ' ' + (n === 1 ? uno : varios);
  }

  function unidad(fam, n){
    return fam === 'homenajes' ? plural(n, 'homenaje', 'homenajes') : plural(n, 'premio', 'premios');
  }

  function reducido(){
    return document.documentElement.getAttribute('data-movimiento') === 'reducido' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        document.documentElement.getAttribute('data-movimiento') !== 'completo');
  }

  function el(etiqueta, clase, texto){
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function icono(fam){
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'muro-ico');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const uso = document.createElementNS(NS, 'use');
    uso.setAttribute('href', fam === 'homenajes' ? '#icono-estrella' : '#icono-premio');
    svg.appendChild(uso);
    return svg;
  }

  const registros = datos.registros.map((r, i) => {
    const cer = cerPorId[r[1]];
    const honor = r[4] === 'h';
    const fam = honor ? 'homenajes' : cer.familia;
    return {
      id: i,
      anio: r[0],
      cer: r[1],
      cat: r[2],
      obra: r[3],
      honor: honor,
      fam: fam,
      texto: normalizar([r[0], cer.nombre, r[2], r[3], honor ? 'homenaje' : 'premio'].join(' '))
    };
  });

  let minAnio = Infinity;
  let maxAnio = -Infinity;
  registros.forEach((r) => {
    if (r.anio < minAnio) minAnio = r.anio;
    if (r.anio > maxAnio) maxAnio = r.anio;
  });
  const anios = [];
  for (let a = minAnio; a <= maxAnio; a++) anios.push(a);

  const estado = {
    sel: new Set(),
    soloHonores: false,
    q: '',
    foco: null,
    reproduciendo: false
  };

  const refs = {
    celdas: [],
    columnas: {},
    filas: {},
    chips: {},
    grupos: {}
  };

  const cabecera = el('div', 'muro-mando');

  const buscador = el('div', 'muro-buscador');
  const etiquetaBuscar = el('label', 'muro-buscar-etiqueta', 'Busca una canción, un álbum o una categoría');
  etiquetaBuscar.setAttribute('for', 'muroBuscar');
  const cajaBuscar = el('div', 'muro-buscar-caja');
  const entrada = el('input', 'muro-buscar');
  entrada.id = 'muroBuscar';
  entrada.type = 'search';
  entrada.autocomplete = 'off';
  entrada.spellcheck = false;
  entrada.placeholder = 'Fotografía, rock, 2008…';
  const borrar = el('button', 'm-boton m-boton--claro', 'Borrar');
  borrar.type = 'button';
  borrar.hidden = true;
  cajaBuscar.append(entrada, borrar);

  const destacadas = el('div', 'muro-destacadas');
  destacadas.setAttribute('role', 'group');
  destacadas.setAttribute('aria-label', 'Obras con más premios');
  const botonesDestacados = datos.destacadas.map((titulo) => {
    const b = el('button', 'm-destacada', titulo);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.dataset.q = normalizar(titulo);
    b.dataset.texto = titulo;
    destacadas.appendChild(b);
    return b;
  });
  buscador.append(etiquetaBuscar, cajaBuscar, destacadas);

  const filtrosCaja = el('details', 'muro-filtros-caja');
  const filtrosResumen = el('summary', 'muro-filtros-resumen');
  const filtrosRotulo = el('span', 'muro-filtros-rotulo', 'Elegir ceremonias');
  const filtrosEstado = el('span', 'muro-n', 'todas');
  filtrosResumen.append(filtrosRotulo, filtrosEstado);
  const filtros = el('div', 'muro-filtros');
  filtros.setAttribute('role', 'group');
  filtros.setAttribute('aria-label', 'Filtrar por ceremonia');
  filtrosCaja.append(filtrosResumen, filtros);
  familias.forEach((f) => {
    const grupo = el('div', 'muro-grupo');
    grupo.dataset.fam = f.id;
    const esHomenajes = f.id === 'homenajes';
    const titulo = el(esHomenajes ? 'div' : 'button', 'muro-grupo-titulo');
    if (!esHomenajes){
      titulo.type = 'button';
      titulo.setAttribute('aria-pressed', 'false');
      titulo.dataset.fam = f.id;
    }
    const punto = el('span', 'muro-punto');
    punto.setAttribute('aria-hidden', 'true');
    const nombre = el('span', 'muro-grupo-nombre', f.nombre);
    const total = el('span', 'muro-n');
    titulo.append(punto, nombre, total);
    const chips = el('div', 'muro-chips');
    const propias = esHomenajes ? [] : ceremonias.filter((c) => c.familia === f.id);
    if (esHomenajes){
      const chip = el('button', 'muro-chip muro-chip--honores');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', 'false');
      const n = el('span', 'muro-n');
      chip.append(el('span', 'muro-chip-nombre', 'Solo homenajes'), n);
      chips.appendChild(chip);
      refs.honores = { boton: chip, n: n };
    }
    propias.forEach((c) => {
      const chip = el('button', 'muro-chip');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', 'false');
      chip.dataset.cer = c.id;
      const n = el('span', 'muro-n');
      chip.append(el('span', 'muro-chip-nombre', c.nombre), n);
      chips.appendChild(chip);
      refs.chips[c.id] = { boton: chip, n: n };
    });
    grupo.append(titulo, chips);
    filtros.appendChild(grupo);
    refs.grupos[f.id] = { titulo: titulo, total: total, ceremonias: propias.map((c) => c.id) };
  });

  const cuenta = el('div', 'muro-cuenta');
  const cifras = el('p', 'muro-cifras');
  const cifraPremios = el('b', null, '0');
  const cifraHomenajes = el('b', null, '0');
  const cifraAnios = el('b', null, '0');
  const cifraCeremonias = el('b', null, '0');
  const rotuloPremios = el('span', null, ' premios');
  const rotuloHomenajes = el('span', null, ' homenajes');
  const rotuloAnios = el('span', null, ' años');
  const rotuloCeremonias = el('span', null, ' ceremonias');
  [[cifraPremios, rotuloPremios], [cifraHomenajes, rotuloHomenajes], [cifraAnios, rotuloAnios], [cifraCeremonias, rotuloCeremonias]].forEach((par) => {
    const c = el('span', 'muro-cifra');
    c.append(par[0], par[1]);
    cifras.appendChild(c);
  });
  const acciones = el('div', 'muro-acciones');
  const recorrer = el('button', 'm-boton', 'Recorrer los años');
  recorrer.type = 'button';
  recorrer.setAttribute('aria-pressed', 'false');
  const reiniciar = el('button', 'm-boton m-boton--claro', 'Quitar filtros');
  reiniciar.type = 'button';
  acciones.append(recorrer, reiniciar);
  cuenta.append(cifras, acciones);

  const anuncio = el('p', 'muro-anuncio');
  anuncio.setAttribute('role', 'status');
  anuncio.setAttribute('aria-live', 'polite');

  const caja = el('div', 'muro-caja');
  caja.id = 'muroCaja';
  const tabla = el('div', 'muro-tabla');
  tabla.setAttribute('role', 'grid');
  tabla.setAttribute('aria-label', 'Premios por año y por familia de ceremonias');
  tabla.style.setProperty('--n', anios.length);

  const mapa = [];

  const filaCab = el('div', 'muro-fila muro-fila--cab');
  filaCab.setAttribute('role', 'row');
  const esquina = el('div', 'muro-esquina');
  esquina.setAttribute('role', 'columnheader');
  const botonEsquina = el('button', 'muro-todo', 'Todo');
  botonEsquina.type = 'button';
  botonEsquina.setAttribute('aria-label', 'Ver todos los años y familias');
  esquina.appendChild(botonEsquina);
  filaCab.appendChild(esquina);
  const mapaCab = [botonEsquina];

  anios.forEach((a, i) => {
    const celda = el('div', 'muro-col');
    celda.setAttribute('role', 'columnheader');
    celda.style.setProperty('--col', i);
    const boton = el('button', 'muro-anio-boton');
    boton.type = 'button';
    boton.setAttribute('aria-pressed', 'false');
    boton.dataset.anio = a;
    const barra = el('span', 'muro-barra');
    barra.setAttribute('aria-hidden', 'true');
    const segmentos = {};
    familias.forEach((f) => {
      const s = el('span', 'muro-seg');
      s.dataset.fam = f.id;
      barra.appendChild(s);
      segmentos[f.id] = s;
    });
    const texto = el('span', 'muro-anio-txt', String(a));
    boton.append(barra, texto);
    celda.appendChild(boton);
    filaCab.appendChild(celda);
    mapaCab.push(boton);
    refs.columnas[a] = { celda: celda, boton: boton, segmentos: segmentos };
  });
  tabla.appendChild(filaCab);
  mapa.push(mapaCab);

  familias.forEach((f) => {
    const fila = el('div', 'muro-fila');
    fila.setAttribute('role', 'row');
    fila.dataset.fam = f.id;
    const cab = el('div', 'muro-fila-cab');
    cab.setAttribute('role', 'rowheader');
    const botonFila = el('button', 'muro-fila-boton');
    botonFila.type = 'button';
    botonFila.setAttribute('aria-pressed', 'false');
    botonFila.dataset.fam = f.id;
    const marca = el('span', 'muro-fila-marca');
    marca.setAttribute('aria-hidden', 'true');
    marca.appendChild(icono(f.id));
    const textoFila = el('span', 'muro-fila-texto');
    const nombreFila = el('span', 'muro-fila-nombre', f.corto);
    const totalFila = el('span', 'muro-fila-total');
    totalFila.setAttribute('aria-hidden', 'true');
    textoFila.append(nombreFila, totalFila);
    botonFila.append(marca, textoFila);
    cab.appendChild(botonFila);
    fila.appendChild(cab);
    const mapaFila = [botonFila];

    anios.forEach((a, i) => {
      const gc = el('div', 'muro-gc');
      gc.setAttribute('role', 'gridcell');
      gc.style.setProperty('--col', i);
      const b = el('button', 'muro-celda');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.dataset.anio = a;
      b.dataset.fam = f.id;
      const ico = icono(f.id);
      const num = el('span', 'muro-num');
      num.setAttribute('aria-hidden', 'true');
      const vacio = el('span', 'muro-vacio');
      vacio.setAttribute('aria-hidden', 'true');
      b.append(ico, num, vacio);
      gc.appendChild(b);
      fila.appendChild(gc);
      mapaFila.push(b);
      const ref = { gc: gc, boton: b, num: num, anio: a, fam: f.id };
      refs.celdas.push(ref);
    });
    refs.filas[f.id] = { fila: fila, boton: botonFila, total: totalFila };
    tabla.appendChild(fila);
    mapa.push(mapaFila);
  });

  mapa.forEach((fila, r) => {
    fila.forEach((boton, c) => {
      boton.dataset.r = r;
      boton.dataset.c = c;
      boton.tabIndex = (r === 0 && c === 0) ? 0 : -1;
    });
  });

  const pista = el('p', 'muro-pista', 'Desliza la tabla para ver todos los años.');
  caja.appendChild(tabla);

  const vista = el('p', 'muro-vista');
  const vistaBase = 'Pasa el cursor por una casilla, un año o una fila. Toca para ver el detalle.';
  vista.textContent = vistaBase;

  const detalle = el('section', 'muro-detalle');
  detalle.id = 'muroDetalle';
  detalle.setAttribute('aria-label', 'Detalle de los premios');
  detalle.tabIndex = -1;
  const detalleCab = el('div', 'detalle-cab');
  const detalleTitulos = el('div', 'detalle-titulos');
  const detalleTitulo = el('h4', 'detalle-titulo');
  const detalleSub = el('p', 'detalle-sub');
  detalleTitulos.append(detalleTitulo, detalleSub);
  const cerrar = el('button', 'm-boton m-boton--claro m-boton--mini', 'Cerrar');
  cerrar.type = 'button';
  cerrar.hidden = true;
  detalleCab.append(detalleTitulos, cerrar);
  const detalleLista = el('div', 'detalle-lista');
  detalleLista.tabIndex = 0;
  detalleLista.setAttribute('role', 'region');
  detalleLista.setAttribute('aria-label', 'Lista de premios y homenajes');
  detalle.append(detalleCab, detalleLista);

  cabecera.append(buscador, filtrosCaja);
  cuerpo.append(cabecera, cuenta, anuncio, caja, pista, vista, detalle);

  function pasaFiltros(r, ignorarCeremonias){
    if (!ignorarCeremonias && estado.sel.size && !estado.sel.has(r.cer)) return false;
    if (!ignorarCeremonias && estado.soloHonores && !r.honor) return false;
    if (estado.q){
      const palabras = estado.q.split(' ');
      for (let i = 0; i < palabras.length; i++){
        if (r.texto.indexOf(palabras[i]) === -1) return false;
      }
    }
    return true;
  }

  function enFoco(r){
    if (!estado.foco) return true;
    if (estado.foco.anio && r.anio !== estado.foco.anio) return false;
    if (estado.foco.fam && r.fam !== estado.foco.fam) return false;
    return true;
  }

  function resumirPorCeremonia(lista, maximo){
    const conteo = {};
    lista.forEach((r) => {
      const nombre = r.cer === 'homenajes' ? 'Otros homenajes' : cerPorId[r.cer].nombre;
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    const orden = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a] || a.localeCompare(b, 'es'));
    const partes = orden.slice(0, maximo).map((n) => n + ' ' + conteo[n]);
    if (orden.length > maximo) partes.push('y ' + (orden.length - maximo) + ' más');
    return partes.join(' · ');
  }

  let ultimo = { visibles: [], porCelda: {} };

  function animarNumero(nodo, destino){
    const actual = Number(nodo.dataset.valor || 0);
    nodo.dataset.valor = destino;
    if (actual === destino){
      nodo.textContent = String(destino);
      return;
    }
    if (reducido() || !window.requestAnimationFrame){
      nodo.textContent = String(destino);
      return;
    }
    const inicio = performance.now();
    const duracion = 420;
    if (nodo._cuadro) cancelAnimationFrame(nodo._cuadro);
    function paso(ahora){
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 3);
      nodo.textContent = String(Math.round(actual + (destino - actual) * suave));
      if (t < 1) nodo._cuadro = requestAnimationFrame(paso);
    }
    nodo._cuadro = requestAnimationFrame(paso);
  }

  let temporizadorAnuncio = null;
  let primerAnuncio = true;

  function programarAnuncio(texto){
    if (primerAnuncio){
      primerAnuncio = false;
      return;
    }
    clearTimeout(temporizadorAnuncio);
    temporizadorAnuncio = setTimeout(() => { anuncio.textContent = texto; }, 500);
  }

  function pintarDetalle(){
    const conFiltros = estado.sel.size > 0 || estado.q !== '' || estado.soloHonores;
    detalleLista.textContent = '';
    cerrar.hidden = !estado.foco;
    detalle.dataset.vacio = '';

    if (!estado.foco && !conFiltros){
      detalleTitulo.textContent = 'El detalle aparece aquí';
      detalleSub.textContent = 'Toca una casilla, un año o una fila de la tabla. También puedes filtrar por ceremonia o buscar una obra.';
      detalle.dataset.vacio = 'si';
      return;
    }

    const lista = ultimo.visibles.filter(enFoco).sort((a, b) => a.anio - b.anio || a.fam.localeCompare(b.fam) || a.id - b.id);
    const foco = estado.foco;
    let titulo = 'Resultados';
    if (foco && foco.anio && foco.fam) titulo = foco.anio + ' · ' + famPorId[foco.fam].nombre;
    else if (foco && foco.anio) titulo = String(foco.anio);
    else if (foco && foco.fam) titulo = famPorId[foco.fam].nombre + ', año a año';
    else if (estado.q) titulo = 'Resultados para «' + entrada.value.trim() + '»';
    detalleTitulo.textContent = titulo;

    const premios = lista.filter((r) => !r.honor).length;
    const honores = lista.length - premios;
    const partes = [];
    if (premios) partes.push(plural(premios, 'premio', 'premios'));
    if (honores) partes.push(plural(honores, 'homenaje', 'homenajes'));
    const sub = partes.length ? partes.join(' y ') : 'Nada con estos filtros';
    detalleSub.textContent = lista.length ? sub + '. ' + resumirPorCeremonia(lista, 5) : sub;

    if (!lista.length){
      const vacio = el('p', 'detalle-vacio', 'No hay nada con esa combinación. Prueba otra palabra o quita los filtros.');
      detalleLista.appendChild(vacio);
      return;
    }

    const agrupar = !(foco && foco.anio);
    let anioActual = null;
    let ul = null;
    lista.forEach((r) => {
      if (agrupar && r.anio !== anioActual){
        anioActual = r.anio;
        detalleLista.appendChild(el('h5', 'detalle-anio', String(r.anio)));
        ul = el('ul', 'detalle-premios');
        detalleLista.appendChild(ul);
      } else if (!ul){
        ul = el('ul', 'detalle-premios');
        detalleLista.appendChild(ul);
      }
      const li = el('li', 'premio' + (r.honor ? ' premio--honor' : ''));
      li.dataset.fam = r.fam;
      const nombreCer = r.cer === 'homenajes' ? (r.obra || 'Otros homenajes') : cerPorId[r.cer].nombre;
      const linea = el('span', 'premio-cer');
      const ico = icono(r.fam);
      linea.append(ico, el('span', null, nombreCer));
      if (r.honor) linea.appendChild(el('span', 'premio-tag', 'Homenaje'));
      li.appendChild(linea);
      li.appendChild(el('strong', 'premio-cat', r.cat));
      if (r.obra && r.cer !== 'homenajes'){
        const buscable = !r.honor && r.obra.indexOf('Juanes') !== 0;
        if (buscable){
          const b = el('button', 'premio-obra', r.obra);
          b.type = 'button';
          b.dataset.buscar = r.obra.replace(/\s*\(.*$/, '').replace(/[«»]/g, '');
          b.title = 'Ver todo lo de esta obra';
          li.appendChild(b);
        } else {
          li.appendChild(el('span', 'premio-obra premio-obra--texto', r.obra));
        }
      }
      ul.appendChild(li);
    });
  }

  function actualizar(){
    const vis = registros.filter((r) => pasaFiltros(r, false));
    const visBusqueda = registros.filter((r) => pasaFiltros(r, true));
    const porCelda = {};
    const porAnio = {};
    const porFamilia = {};
    vis.forEach((r) => {
      const k = r.anio + '|' + r.fam;
      porCelda[k] = (porCelda[k] || 0) + 1;
      porAnio[r.anio] = (porAnio[r.anio] || 0) + 1;
      porFamilia[r.fam] = (porFamilia[r.fam] || 0) + 1;
    });
    ultimo = { visibles: vis, porCelda: porCelda };

    let maxAnio2 = 0;
    anios.forEach((a) => { if ((porAnio[a] || 0) > maxAnio2) maxAnio2 = porAnio[a]; });
    const unidadBarra = 78 / Math.max(maxAnio2, 6);
    tabla.style.setProperty('--u-barra', unidadBarra.toFixed(3) + 'px');

    const foco = estado.foco;
    const hayFoco = !!foco;

    refs.celdas.forEach((c) => {
      const n = porCelda[c.anio + '|' + c.fam] || 0;
      const b = c.boton;
      b.dataset.n = n;
      b.style.setProperty('--tam', (21 + Math.min(n, 8) * 1.7).toFixed(1) + 'px');
      c.num.textContent = n > 1 ? String(n) : '';
      const nombreFam = famPorId[c.fam].nombre;
      b.setAttribute('aria-label', c.anio + ', ' + nombreFam + ': ' + (n ? unidad(c.fam, n) : 'sin ' + (c.fam === 'homenajes' ? 'homenajes' : 'premios')));
      b.setAttribute('aria-disabled', n ? 'false' : 'true');
      const marcada = hayFoco && foco.anio === c.anio && foco.fam === c.fam;
      const enCruz = hayFoco && ((foco.anio && foco.anio === c.anio) || (foco.fam && foco.fam === c.fam));
      b.setAttribute('aria-pressed', String(marcada));
      b.dataset.estado = marcada ? 'sel' : (hayFoco && !enCruz ? 'tenue' : '');
    });

    anios.forEach((a) => {
      const col = refs.columnas[a];
      const total = porAnio[a] || 0;
      familias.forEach((f) => {
        const n = porCelda[a + '|' + f.id] || 0;
        col.segmentos[f.id].style.setProperty('--h', n);
      });
      col.boton.dataset.n = total;
      col.boton.setAttribute('aria-label', a + ': ' + (total ? plural(total, 'reconocimiento', 'reconocimientos') : 'sin reconocimientos'));
      const marcado = hayFoco && foco.anio === a && !foco.fam;
      col.boton.setAttribute('aria-pressed', String(marcado));
      const tenue = hayFoco && foco.anio && foco.anio !== a;
      col.celda.dataset.estado = (hayFoco && foco.anio === a) ? 'sel' : (tenue ? 'tenue' : '');
    });

    familias.forEach((f) => {
      const ref = refs.filas[f.id];
      const total = porFamilia[f.id] || 0;
      ref.total.textContent = String(total);
      ref.boton.setAttribute('aria-label', f.nombre + ': ' + (total ? unidad(f.id, total) : 'sin ' + (f.id === 'homenajes' ? 'homenajes' : 'premios')));
      const marcada = hayFoco && foco.fam === f.id && !foco.anio;
      ref.boton.setAttribute('aria-pressed', String(marcada));
      const tenue = hayFoco && foco.fam && foco.fam !== f.id;
      ref.fila.dataset.estado = (hayFoco && foco.fam === f.id) ? 'sel' : (tenue ? 'tenue' : '');
      ref.fila.dataset.vacia = total ? 'no' : 'si';
    });

    const porCer = {};
    const porFamBusqueda = {};
    let honoresBusqueda = 0;
    visBusqueda.forEach((r) => {
      if (r.honor){
        honoresBusqueda++;
        return;
      }
      porCer[r.cer] = (porCer[r.cer] || 0) + 1;
      const f = cerPorId[r.cer].familia;
      porFamBusqueda[f] = (porFamBusqueda[f] || 0) + 1;
    });

    familias.forEach((f) => {
      const g = refs.grupos[f.id];
      if (f.id === 'homenajes'){
        g.total.textContent = String(honoresBusqueda);
        return;
      }
      g.total.textContent = String(porFamBusqueda[f.id] || 0);
      const todas = g.ceremonias.every((id) => estado.sel.has(id));
      g.titulo.setAttribute('aria-pressed', String(todas));
    });
    ceremonias.forEach((c) => {
      const ref = refs.chips[c.id];
      if (!ref) return;
      const n = porCer[c.id] || 0;
      ref.n.textContent = String(n);
      const activa = estado.sel.has(c.id);
      ref.boton.setAttribute('aria-pressed', String(activa));
      ref.boton.disabled = n === 0 && !activa;
    });
    refs.honores.n.textContent = String(honoresBusqueda);
    refs.honores.boton.setAttribute('aria-pressed', String(estado.soloHonores));
    refs.honores.boton.disabled = honoresBusqueda === 0 && !estado.soloHonores;
    const partesFiltro = estado.sel.size ? [plural(estado.sel.size, 'ceremonia', 'ceremonias')] : [];
    if (estado.soloHonores) partesFiltro.push('solo homenajes');
    filtrosEstado.textContent = partesFiltro.length ? partesFiltro.join(' · ') : 'todas';

    const premios = vis.filter((r) => !r.honor).length;
    const honores = vis.length - premios;
    const aniosVisibles = Object.keys(porAnio).length;
    const cerVisibles = {};
    vis.forEach((r) => { if (r.cer !== 'homenajes') cerVisibles[r.cer] = true; });
    animarNumero(cifraPremios, premios);
    animarNumero(cifraHomenajes, honores);
    animarNumero(cifraAnios, aniosVisibles);
    animarNumero(cifraCeremonias, Object.keys(cerVisibles).length);
    rotuloPremios.textContent = premios === 1 ? ' premio' : ' premios';
    rotuloHomenajes.textContent = honores === 1 ? ' homenaje' : ' homenajes';
    rotuloAnios.textContent = aniosVisibles === 1 ? ' año' : ' años';
    const nCer = Object.keys(cerVisibles).length;
    rotuloCeremonias.textContent = nCer === 1 ? ' ceremonia' : ' ceremonias';

    const hayFiltros = estado.sel.size > 0 || estado.q !== '' || hayFoco || estado.soloHonores;
    reiniciar.disabled = !hayFiltros;
    borrar.hidden = entrada.value === '';
    botonesDestacados.forEach((b) => {
      b.setAttribute('aria-pressed', String(estado.q !== '' && b.dataset.q === estado.q));
    });

    programarAnuncio('Mostrando ' + plural(premios, 'premio', 'premios') + ' y ' + plural(honores, 'homenaje', 'homenajes') + ' en ' + plural(aniosVisibles, 'año', 'años') + '.');

    pintarDetalle();
    mostrarVista(null);
  }

  function describir(anio, fam){
    const lista = ultimo.visibles.filter((r) => (!anio || r.anio === anio) && (!fam || r.fam === fam));
    const nombre = anio && fam ? anio + ' · ' + famPorId[fam].nombre : (anio ? String(anio) : (fam ? famPorId[fam].nombre : 'Todo'));
    if (!lista.length) return nombre + ': sin ' + (fam === 'homenajes' ? 'homenajes' : 'premios') + ' con estos filtros.';
    const premios = lista.filter((r) => !r.honor).length;
    const honores = lista.length - premios;
    const partes = [];
    if (premios) partes.push(plural(premios, 'premio', 'premios'));
    if (honores) partes.push(plural(honores, 'homenaje', 'homenajes'));
    return nombre + ': ' + partes.join(' y ') + '. ' + resumirPorCeremonia(lista, 6);
  }

  function mostrarVista(boton){
    if (estado.reproduciendo) return;
    if (boton){
      const anio = boton.dataset.anio ? Number(boton.dataset.anio) : null;
      const fam = boton.dataset.fam || null;
      if (boton.classList.contains('muro-todo')) vista.textContent = 'Todos los años y todas las familias.';
      else vista.textContent = describir(anio, fam);
      return;
    }
    if (estado.foco) vista.textContent = describir(estado.foco.anio, estado.foco.fam);
    else vista.textContent = vistaBase;
  }

  function resaltarCruz(anio, fam){
    refs.celdas.forEach((c) => {
      const en = (anio && c.anio === anio) || (fam && c.fam === fam);
      c.gc.classList.toggle('cruz', !!en);
    });
    anios.forEach((a) => {
      refs.columnas[a].celda.classList.toggle('cruz', !!(anio && a === anio));
    });
    familias.forEach((f) => {
      refs.filas[f.id].fila.classList.toggle('cruz', !!(fam && f.id === fam && !anio));
    });
  }

  function detenerRecorrido(){
    if (!estado.reproduciendo) return;
    estado.reproduciendo = false;
    clearInterval(recorrerReloj);
    recorrerReloj = null;
    recorrer.textContent = 'Recorrer los años';
    recorrer.setAttribute('aria-pressed', 'false');
  }

  let recorrerReloj = null;

  function centrarColumna(anio){
    const b = refs.columnas[anio].boton;
    const objetivo = b.offsetLeft - (caja.clientWidth - b.offsetWidth) / 2;
    caja.scrollTo({ left: Math.max(0, objetivo), behavior: reducido() ? 'auto' : 'smooth' });
  }

  function iniciarRecorrido(){
    const conDatos = anios.filter((a) => registros.some((r) => r.anio === a && pasaFiltros(r, false)));
    if (!conDatos.length) return;
    estado.reproduciendo = true;
    recorrer.textContent = 'Detener';
    recorrer.setAttribute('aria-pressed', 'true');
    let indice = 0;
    let acumulado = 0;
    function paso(){
      const a = conDatos[indice];
      const delAnio = registros.filter((r) => r.anio === a && pasaFiltros(r, false));
      acumulado += delAnio.length;
      estado.foco = { anio: a, fam: null };
      const guardado = estado.reproduciendo;
      estado.reproduciendo = false;
      actualizar();
      estado.reproduciendo = guardado;
      vista.textContent = 'Hasta ' + a + ': ' + plural(acumulado, 'reconocimiento', 'reconocimientos') + ' en total. ' + resumirPorCeremonia(delAnio, 4);
      resaltarCruz(a, null);
      centrarColumna(a);
      indice++;
      if (indice >= conDatos.length) detenerRecorrido();
    }
    paso();
    if (estado.reproduciendo) recorrerReloj = setInterval(paso, reducido() ? 1600 : 1100);
  }

  function fijarFoco(anio, fam, desdeUsuario){
    if (desdeUsuario) detenerRecorrido();
    const actual = estado.foco;
    if (actual && actual.anio === anio && actual.fam === fam) estado.foco = null;
    else estado.foco = { anio: anio, fam: fam };
    actualizar();
    resaltarCruz(estado.foco ? estado.foco.anio : null, estado.foco ? estado.foco.fam : null);
  }

  function llevarDetalle(){
    if (!estado.foco) return;
    const r = detalle.getBoundingClientRect();
    const alto = window.innerHeight || document.documentElement.clientHeight;
    if (r.top > alto - 140 || r.bottom < 0){
      detalle.scrollIntoView({ block: 'nearest', behavior: reducido() ? 'auto' : 'smooth' });
    }
  }

  function fijarBusqueda(texto, mostrado){
    detenerRecorrido();
    estado.q = normalizar(texto);
    entrada.value = mostrado === undefined ? texto : mostrado;
    estado.foco = null;
    actualizar();
    resaltarCruz(null, null);
  }

  tabla.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !tabla.contains(b)) return;
    detenerRecorrido();
    if (b.classList.contains('muro-todo')){
      estado.foco = null;
      actualizar();
      resaltarCruz(null, null);
      return;
    }
    if (b.classList.contains('muro-celda')){
      if (b.dataset.n === '0') return;
      fijarFoco(Number(b.dataset.anio), b.dataset.fam, true);
      llevarDetalle();
      return;
    }
    if (b.classList.contains('muro-anio-boton')){
      if (b.dataset.n === '0') return;
      fijarFoco(Number(b.dataset.anio), null, true);
      llevarDetalle();
      return;
    }
    if (b.classList.contains('muro-fila-boton')){
      fijarFoco(null, b.dataset.fam, true);
      llevarDetalle();
    }
  });

  function sobreBoton(e){
    const b = e.target.closest ? e.target.closest('button') : null;
    if (!b || !tabla.contains(b) || estado.reproduciendo) return;
    const anio = b.dataset.anio ? Number(b.dataset.anio) : null;
    const fam = b.dataset.fam || null;
    resaltarCruz(anio, fam);
    mostrarVista(b);
  }

  function fueraTabla(){
    if (estado.reproduciendo) return;
    resaltarCruz(estado.foco ? estado.foco.anio : null, estado.foco ? estado.foco.fam : null);
    mostrarVista(null);
  }

  tabla.addEventListener('pointerover', sobreBoton);
  tabla.addEventListener('focusin', (e) => {
    const b = e.target.closest ? e.target.closest('button') : null;
    if (!b || b.dataset.r === undefined) return;
    mapa.forEach((fila) => fila.forEach((x) => { x.tabIndex = -1; }));
    b.tabIndex = 0;
    sobreBoton(e);
  });
  tabla.addEventListener('pointerleave', fueraTabla);
  tabla.addEventListener('focusout', (e) => {
    if (!tabla.contains(e.relatedTarget)) fueraTabla();
  });

  tabla.addEventListener('keydown', (e) => {
    const b = e.target.closest ? e.target.closest('button') : null;
    if (!b || b.dataset.r === undefined) return;
    let r = Number(b.dataset.r);
    let c = Number(b.dataset.c);
    const ultimaFila = mapa.length - 1;
    const ultimaCol = mapa[0].length - 1;
    let movido = true;
    switch (e.key){
      case 'ArrowRight': c = Math.min(ultimaCol, c + 1); break;
      case 'ArrowLeft': c = Math.max(0, c - 1); break;
      case 'ArrowDown': r = Math.min(ultimaFila, r + 1); break;
      case 'ArrowUp': r = Math.max(0, r - 1); break;
      case 'Home': c = 0; break;
      case 'End': c = ultimaCol; break;
      case 'PageUp': r = 0; break;
      case 'PageDown': r = ultimaFila; break;
      case 'Escape':
        detenerRecorrido();
        if (estado.foco){
          estado.foco = null;
          actualizar();
          resaltarCruz(null, null);
        }
        movido = false;
        break;
      default: movido = false;
    }
    if (movido){
      e.preventDefault();
      const destino = mapa[r][c];
      if (destino) destino.focus();
    }
  });

  filtros.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    detenerRecorrido();
    estado.foco = null;
    if (b.classList.contains('muro-chip--honores')){
      estado.soloHonores = !estado.soloHonores;
    } else if (b.classList.contains('muro-chip')){
      const id = b.dataset.cer;
      if (estado.sel.has(id)) estado.sel.delete(id);
      else estado.sel.add(id);
    } else if (b.classList.contains('muro-grupo-titulo')){
      const g = refs.grupos[b.dataset.fam];
      const todas = g.ceremonias.every((id) => estado.sel.has(id));
      g.ceremonias.forEach((id) => {
        if (todas) estado.sel.delete(id);
        else estado.sel.add(id);
      });
    }
    actualizar();
    resaltarCruz(null, null);
  });

  entrada.addEventListener('input', () => {
    detenerRecorrido();
    estado.q = normalizar(entrada.value);
    estado.foco = null;
    actualizar();
    resaltarCruz(null, null);
  });
  entrada.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && entrada.value){
      e.preventDefault();
      fijarBusqueda('');
    }
  });
  borrar.addEventListener('click', () => {
    fijarBusqueda('');
    entrada.focus();
  });

  destacadas.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (estado.q === b.dataset.q) fijarBusqueda('');
    else fijarBusqueda(b.dataset.texto);
  });

  detalleLista.addEventListener('click', (e) => {
    const b = e.target.closest('.premio-obra');
    if (!b || !b.dataset.buscar) return;
    fijarBusqueda(b.dataset.buscar);
    caja.scrollIntoView({ block: 'nearest', behavior: reducido() ? 'auto' : 'smooth' });
  });

  cerrar.addEventListener('click', () => {
    detenerRecorrido();
    estado.foco = null;
    actualizar();
    resaltarCruz(null, null);
  });

  reiniciar.addEventListener('click', () => {
    detenerRecorrido();
    estado.sel.clear();
    estado.soloHonores = false;
    estado.q = '';
    entrada.value = '';
    estado.foco = null;
    actualizar();
    resaltarCruz(null, null);
  });

  recorrer.addEventListener('click', () => {
    if (estado.reproduciendo){
      detenerRecorrido();
      mostrarVista(null);
      return;
    }
    iniciarRecorrido();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) detenerRecorrido();
  });

  actualizar();

  if ('IntersectionObserver' in window){
    const vigia = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting){
        muro.classList.add('muro--lleno');
        vigia.disconnect();
      }
    }, { threshold: 0.2 });
    vigia.observe(caja);
  } else {
    muro.classList.add('muro--lleno');
  }
})();
