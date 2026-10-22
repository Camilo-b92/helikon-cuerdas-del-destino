(function(){
  'use strict';

  const CLAVE = 'helikon-sonido';
  const ADELANTE = 3.2;
  const PASO_BUCLE = 2;
  const MAX_CUERDAS = 160;

  const registro = {};
  const sesiones = new Set();
  const manejadores = new Set();
  const oyentes = [];
  const cacheRuido = new WeakMap();
  const cacheCuerda = new Map();
  const cacheBufferCuerda = new WeakMap();

  let ac = null;
  let N = null;
  let silencio = false;
  let desbloqueado = false;
  let contador = 0;

  try { silencio = window.localStorage.getItem(CLAVE) === 'no'; } catch (e) {}

  function semilla(n){
    let a = (n >>> 0) || 1;
    return function(){
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function acotar(v, a, b){
    return v < a ? a : v > b ? b : v;
  }

  function aleatorio(a, b){
    return a + Math.random() * (b - a);
  }

  function elegir(lista){
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function hz(midi){
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  const NOTAS = { do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11 };

  function nota(nombre){
    const m = /^(do|re|mi|fa|sol|la|si)(#|b)?(\d)$/.exec(nombre);
    if (!m) return 440;
    const alt = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    return hz(12 * (Number(m[3]) + 1) + NOTAS[m[1]] + alt);
  }

  function ruidoBuffer(c, tipo){
    let por = cacheRuido.get(c);
    if (!por){
      por = {};
      cacheRuido.set(c, por);
    }
    if (por[tipo]) return por[tipo];
    const sr = c.sampleRate;
    const n = Math.floor(sr * 4);
    const b = c.createBuffer(1, n, sr);
    const d = b.getChannelData(0);
    const r = semilla(tipo === 'rosa' ? 11 : tipo === 'marron' ? 23 : 7);
    if (tipo === 'rosa'){
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++){
        const w = r() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else if (tipo === 'marron'){
      let u = 0;
      for (let i = 0; i < n; i++){
        const w = r() * 2 - 1;
        u = (u + 0.02 * w) / 1.02;
        d[i] = u * 3.5;
      }
    } else {
      for (let i = 0; i < n; i++) d[i] = r() * 2 - 1;
    }
    let ult = 0;
    const f = Math.floor(sr * 0.05);
    for (let i = 0; i < f; i++){
      const k = i / f;
      d[n - f + i] = d[n - f + i] * (1 - k) + d[i] * k;
    }
    for (let i = 0; i < n; i++) ult = Math.max(ult, Math.abs(d[i]));
    if (ult > 0) for (let i = 0; i < n; i++) d[i] /= ult;
    por[tipo] = b;
    return b;
  }

  function fuenteRuido(c, tipo, t, dur){
    const s = c.createBufferSource();
    s.buffer = ruidoBuffer(c, tipo);
    s.loop = true;
    const inicio = Math.random() * 3.5;
    s.start(t, inicio);
    if (dur != null) s.stop(t + dur);
    return s;
  }

  function ganancia(c, v){
    const g = c.createGain();
    g.gain.value = v == null ? 1 : v;
    return g;
  }

  function filtro(c, tipo, f, q, gain){
    const b = c.createBiquadFilter();
    b.type = tipo;
    b.frequency.value = f;
    if (q != null) b.Q.value = q;
    if (gain != null) b.gain.value = gain;
    return b;
  }

  function osc(c, tipo, f){
    const o = c.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    return o;
  }

  function panear(c, nodo, valor){
    if (!c.createStereoPanner || !valor){
      return nodo;
    }
    const p = c.createStereoPanner();
    p.pan.value = acotar(valor, -1, 1);
    nodo.connect(p);
    return p;
  }

  function curva(param, t, puntos){
    param.setValueAtTime(puntos[0][1], t + puntos[0][0]);
    for (let i = 1; i < puntos.length; i++){
      param.linearRampToValueAtTime(puntos[i][1], t + puntos[i][0]);
    }
  }

  function expo(param, t, v0, v1, dur){
    param.setValueAtTime(Math.max(v0, 0.0001), t);
    param.exponentialRampToValueAtTime(Math.max(v1, 0.0001), t + dur);
  }

  function tono(c, destino, o){
    const t = o.t;
    const dur = o.dur;
    const a = o.a == null ? 0.01 : o.a;
    const x = osc(c, o.tipo || 'sine', o.f);
    if (o.f2){
      x.frequency.setValueAtTime(o.f, t);
      x.frequency.exponentialRampToValueAtTime(Math.max(o.f2, 1), t + (o.glide || dur));
    }
    if (o.vib){
      const l = osc(c, 'sine', o.vib[0]);
      const lg = ganancia(c, o.vib[1]);
      l.connect(lg);
      lg.connect(x.frequency);
      l.start(t);
      l.stop(t + dur + 0.1);
    }
    const g = ganancia(c, 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol == null ? 0.3 : o.vol, t + a);
    if (o.sostiene){
      g.gain.setValueAtTime(o.vol == null ? 0.3 : o.vol, t + dur - (o.r || 0.1));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    x.connect(g);
    let salida = g;
    if (o.filtro){
      const f = filtro(c, o.filtro[0], o.filtro[1], o.filtro[2]);
      g.connect(f);
      salida = f;
    }
    salida = panear(c, salida, o.pan);
    salida.connect(destino);
    x.start(t);
    x.stop(t + dur + 0.05);
    return g;
  }

  function rafaga(c, destino, o){
    const t = o.t;
    const dur = o.dur;
    const s = fuenteRuido(c, o.ruido || 'blanco', t, dur + 0.05);
    let nodo = s;
    if (o.filtro){
      const f = filtro(c, o.filtro[0], o.filtro[1], o.filtro[2]);
      if (o.barrido) {
        f.frequency.setValueAtTime(o.filtro[1], t);
        f.frequency.exponentialRampToValueAtTime(Math.max(o.barrido, 20), t + dur);
      }
      nodo.connect(f);
      nodo = f;
    }
    if (o.filtro2){
      const f2 = filtro(c, o.filtro2[0], o.filtro2[1], o.filtro2[2]);
      nodo.connect(f2);
      nodo = f2;
    }
    const g = ganancia(c, 0);
    const a = o.a == null ? 0.004 : o.a;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol == null ? 0.3 : o.vol, t + a);
    if (o.suave){
      g.gain.setValueAtTime(o.vol == null ? 0.3 : o.vol, t + dur * o.suave);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    nodo.connect(g);
    panear(c, g, o.pan).connect(destino);
    return g;
  }

  function campana(c, destino, o){
    const t = o.t;
    const dur = o.dur || 1.6;
    const vol = o.vol == null ? 0.2 : o.vol;
    const ratio = o.ratio || 3.5;
    const mod = osc(c, 'sine', o.f * ratio);
    const mg = ganancia(c, 0);
    mg.gain.setValueAtTime(o.f * (o.indice || 1.4), t);
    mg.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.5);
    mod.connect(mg);
    const por = osc(c, 'sine', o.f);
    mg.connect(por.frequency);
    const g = ganancia(c, 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    por.connect(g);
    const g2 = ganancia(c, 0);
    const o2 = osc(c, 'sine', o.f * 2.01);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(vol * 0.3, t + 0.004);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
    o2.connect(g2);
    const salida = ganancia(c, 1);
    g.connect(salida);
    g2.connect(salida);
    panear(c, salida, o.pan).connect(destino);
    mod.start(t); por.start(t); o2.start(t);
    mod.stop(t + dur + 0.05); por.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    return salida;
  }

  function teclas(c, destino, o){
    const t = o.t;
    const dur = o.dur || 2.4;
    const vol = o.vol == null ? 0.2 : o.vol;
    const salida = ganancia(c, 1);
    const defs = [[1, 'sine', 1], [2, 'triangle', 0.32], [3, 'sine', 0.1]];
    defs.forEach((d) => {
      const x = osc(c, d[1], o.f * d[0] * (d[0] === 1 ? 1 : 1.0006));
      const g = ganancia(c, 0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol * d[2], t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / d[0]);
      x.connect(g);
      g.connect(salida);
      x.start(t);
      x.stop(t + dur / d[0] + 0.05);
    });
    rafaga(c, salida, { t: t, dur: 0.03, ruido: 'blanco', filtro: ['bandpass', o.f * 3, 1], vol: vol * 0.25 });
    panear(c, salida, o.pan).connect(destino);
    return salida;
  }

  function colchon(c, destino, o){
    const t = o.t;
    const dur = o.dur;
    const vol = o.vol == null ? 0.1 : o.vol;
    const a = o.a == null ? Math.min(1.2, dur * 0.35) : o.a;
    const r = o.r == null ? Math.min(1.6, dur * 0.45) : o.r;
    const salida = ganancia(c, 0);
    salida.gain.setValueAtTime(0.0001, t);
    salida.gain.linearRampToValueAtTime(vol, t + a);
    salida.gain.setValueAtTime(vol, Math.max(t + a, t + dur - r));
    salida.gain.linearRampToValueAtTime(0.0001, t + dur);
    const lp = filtro(c, 'lowpass', o.corte || 1400, 0.6);
    lp.connect(salida);
    o.f.forEach((f, i) => {
      [-5, 5].forEach((cents) => {
        const x = osc(c, o.tipo || 'triangle', f);
        x.detune.value = cents + (i % 2 ? 2 : -2);
        const g = ganancia(c, 1 / (o.f.length * 2));
        x.connect(g);
        g.connect(lp);
        x.start(t);
        x.stop(t + dur + 0.1);
      });
    });
    panear(c, salida, o.pan).connect(destino);
    return salida;
  }

  function cuerdaBuffer(c, f, dur, brillo, amort){
    const sr = c.sampleRate;
    const clave = sr + '|' + Math.round(f * 20) + '|' + dur + '|' + brillo + '|' + amort;
    let datos = cacheCuerda.get(clave);
    if (!datos){
      const n = Math.floor(sr * dur);
      datos = new Float32Array(n);
      const D = sr / f;
      let largo = Math.floor(D);
      if (largo < 2) largo = 2;
      const frac = D + 0.5 - largo;
      const C = (1 - frac) / (1 + frac);
      const buf = new Float32Array(largo);
      const r = semilla(Math.round(f * 31) + 5);
      const a = 0.25 + 0.7 * brillo;
      let prev = 0;
      let media = 0;
      for (let i = 0; i < largo; i++){
        prev += a * ((r() * 2 - 1) - prev);
        buf[i] = prev;
        media += prev;
      }
      media /= largo;
      let pk = 0;
      for (let i = 0; i < largo; i++){
        buf[i] -= media;
        pk = Math.max(pk, Math.abs(buf[i]));
      }
      for (let i = 0; i < largo; i++) buf[i] /= (pk || 1);
      const rho = Math.pow(10, -3 / (dur * amort * f));
      let apx = 0;
      let apy = 0;
      let p = 0;
      let maximo = 0;
      for (let i = 0; i < n; i++){
        const y0 = buf[p];
        const y1 = buf[p + 1 === largo ? 0 : p + 1];
        const m = rho * 0.5 * (y0 + y1);
        const ap = C * (m - apy) + apx;
        apx = m;
        apy = ap;
        datos[i] = y0;
        buf[p] = ap;
        p = p + 1 === largo ? 0 : p + 1;
        const v = Math.abs(y0);
        if (v > maximo) maximo = v;
      }
      const fin = Math.floor(sr * 0.04);
      for (let i = 0; i < n; i++){
        let k = datos[i] / (maximo || 1);
        if (i > n - fin) k *= (n - i) / fin;
        datos[i] = k;
      }
      if (cacheCuerda.size > MAX_CUERDAS) cacheCuerda.delete(cacheCuerda.keys().next().value);
      cacheCuerda.set(clave, datos);
    }
    let por = cacheBufferCuerda.get(c);
    if (!por){
      por = new Map();
      cacheBufferCuerda.set(c, por);
    }
    let b = por.get(clave);
    if (!b){
      b = c.createBuffer(1, datos.length, sr);
      b.getChannelData(0).set(datos);
      por.set(clave, b);
    }
    return b;
  }

  function cuerda(c, destino, o){
    const dur = o.dur || 2.2;
    const b = cuerdaBuffer(c, o.f, dur, o.brillo == null ? 0.5 : o.brillo, o.amort || 1.1);
    const s = c.createBufferSource();
    s.buffer = b;
    const g = ganancia(c, o.vol == null ? 0.3 : o.vol);
    s.connect(g);
    panear(c, g, o.pan).connect(destino);
    s.start(o.t);
    return g;
  }

  function cuerpoGuitarra(c, destino){
    const entrada = ganancia(c, 1);
    const a = filtro(c, 'peaking', 105, 1.6, 5);
    const b = filtro(c, 'peaking', 230, 1.2, 2.5);
    const d = filtro(c, 'lowpass', 5200, 0.5);
    entrada.connect(a);
    a.connect(b);
    b.connect(d);
    d.connect(destino);
    return entrada;
  }

  function rasgueo(c, destino, o){
    const notas = o.notas;
    const sep = o.sep == null ? 0.028 : o.sep;
    const orden = o.abajo === false ? notas.slice().reverse() : notas;
    orden.forEach((f, i) => {
      cuerda(c, destino, {
        t: o.t + i * sep + Math.random() * 0.004,
        f: f,
        dur: o.dur || 2.2,
        vol: (o.vol == null ? 0.2 : o.vol) * (1 - i * 0.04) * (0.9 + Math.random() * 0.2),
        brillo: o.brillo == null ? 0.55 : o.brillo,
        amort: o.amort || 1.1,
        pan: o.pan
      });
    });
  }

  function reverbIR(c){
    const sr = c.sampleRate;
    const largo = Math.floor(sr * 2.1);
    const b = c.createBuffer(2, largo, sr);
    for (let canal = 0; canal < 2; canal++){
      const d = b.getChannelData(canal);
      const r = semilla(101 + canal * 17);
      let lp = 0;
      for (let i = 0; i < largo; i++){
        const k = i / largo;
        const w = r() * 2 - 1;
        const corte = 0.62 - 0.5 * k;
        lp += corte * (w - lp);
        const pre = i < sr * 0.012 ? 0 : 1;
        d[i] = lp * Math.pow(1 - k, 2.6) * pre * 1.6;
      }
    }
    return b;
  }

  function construir(c, destino, crudo){
    const master = ganancia(c, silencio && !crudo ? 0 : 1);
    let salida = master;
    let comp = null;
    if (!crudo){
      comp = c.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 14;
      comp.ratio.value = 4;
      comp.attack.value = 0.005;
      comp.release.value = 0.28;
      master.connect(comp);
      comp.connect(destino);
    } else {
      master.connect(destino);
    }
    const buses = {
      sfx: ganancia(c, 1.6),
      musica: ganancia(c, 1.5),
      ambiente: ganancia(c, 1.7)
    };
    buses.sfx.connect(master);
    buses.musica.connect(master);
    buses.ambiente.connect(master);
    const entradaRev = ganancia(c, 1);
    const conv = c.createConvolver();
    conv.buffer = reverbIR(c);
    const retorno = ganancia(c, 0.7);
    entradaRev.connect(conv);
    conv.connect(retorno);
    retorno.connect(master);
    return { master: master, comp: comp, buses: buses, rev: entradaRev, crudo: !!crudo, salida: salida };
  }

  function puedeCrear(){
    const ua = window.navigator.userActivation;
    return !ua || ua.hasBeenActive;
  }

  function contexto(){
    if (ac) return ac;
    if (!puedeCrear()) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ac = new AC({ latencyHint: 'interactive' });
    } catch (e) {
      ac = null;
      return null;
    }
    N = construir(ac, ac.destination, false);
    ac.addEventListener('statechange', alCambiarEstado);
    return ac;
  }

  function corriendo(){
    return !!ac && ac.state === 'running';
  }

  function reanudar(){
    const c = contexto();
    if (!c) return Promise.resolve(false);
    if (c.state === 'running') return Promise.resolve(true);
    try {
      return c.resume().then(() => c.state === 'running', () => false);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function alCambiarEstado(){
    if (!ac) return;
    if (ac.state === 'running'){
      desbloqueado = true;
      manejadores.forEach((m) => arrancar(m));
    }
  }

  const EVENTOS_GESTO = ['pointerdown', 'keydown', 'touchend', 'click'];

  function alGesto(){
    contexto();
    reanudar().then((ok) => {
      if (ok) quitarGesto();
    });
  }

  function quitarGesto(){
    EVENTOS_GESTO.forEach((t) => document.removeEventListener(t, alGesto, true));
  }

  EVENTOS_GESTO.forEach((t) => document.addEventListener(t, alGesto, true));

  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden){
      if (ac.state === 'running') ac.suspend().catch(() => {});
    } else if (desbloqueado){
      ac.resume().catch(() => {});
    }
  });

  function abrir(c, nodos, nombre, def, dueno){
    const grupo = def.grupo || 'escena';
    const bus = grupo === 'musica' ? nodos.buses.musica : grupo === 'ambiente' ? nodos.buses.ambiente : nodos.buses.sfx;
    const g = ganancia(c, 1);
    g.connect(bus);
    const r = ganancia(c, 1);
    r.connect(nodos.rev);
    const ses = {
      id: ++contador,
      nombre: nombre,
      grupo: grupo,
      c: c,
      nodos: nodos,
      g: g,
      r: r,
      bus: { seco: g, reverb: r },
      alParar: [],
      intervalo: 0,
      cerrada: false,
      dueno: dueno || null
    };
    ses.parar = function(f){ cerrar(ses, f); };
    sesiones.add(ses);
    return ses;
  }

  function cerrar(ses, fade){
    if (ses.cerrada) return;
    ses.cerrada = true;
    window.clearInterval(ses.intervalo);
    const c = ses.c;
    const f = fade == null ? 0.3 : fade;
    const ahora = c.currentTime;
    try {
      [ses.g.gain, ses.r.gain].forEach((p) => {
        p.cancelScheduledValues(ahora);
        p.setValueAtTime(p.value, ahora);
        p.linearRampToValueAtTime(0, ahora + Math.max(0.02, f));
      });
    } catch (e) {}
    ses.alParar.forEach((fn) => { try { fn(ahora + Math.max(0.02, f)); } catch (e) {} });
    ses.alParar = [];
    window.setTimeout(() => {
      try { ses.g.disconnect(); ses.r.disconnect(); } catch (e) {}
      sesiones.delete(ses);
    }, (Math.max(0.02, f) + 0.2) * 1000);
  }

  function duracion(def, op){
    const d = def.dur == null ? 2 : def.dur;
    return typeof d === 'function' ? d(op || {}) : d;
  }

  function ejecutar(ses, def, t0, op){
    try {
      return def.fn(ses.c, ses.bus, t0, op || {}, H, ses);
    } catch (e) {
      return null;
    }
  }

  function nuevoManejador(extra){
    const m = {
      parado: false,
      ses: [],
      parar: function(f){
        this.parado = true;
        manejadores.delete(this);
        this.ses.forEach((s) => cerrar(s, f));
        this.ses = [];
      }
    };
    return Object.assign(m, extra || {});
  }

  function tocar(nombre, op){
    const def = registro[nombre];
    const nulo = nuevoManejador({ nulo: true });
    if (!def || def.bucle) return nulo;
    if (!corriendo()){
      reanudar();
      return nulo;
    }
    const c = ac;
    const o = op || {};
    const ses = abrir(c, N, nombre, def, null);
    const t0 = c.currentTime + 0.025 + (o.retardo || 0);
    ejecutar(ses, def, t0, o);
    const m = nuevoManejador({ nulo: false, ses: [ses] });
    const vida = (duracion(def, o) + (o.retardo || 0) + 1.2) * 1000;
    window.setTimeout(() => cerrar(ses, 0.05), vida);
    return m;
  }

  function linea(items, opciones){
    const o = opciones || {};
    const m = nuevoManejador({ nulo: true });
    if (!corriendo()){
      reanudar();
      return m;
    }
    m.nulo = false;
    const c = ac;
    const base = c.currentTime + 0.03 + (o.retardo || 0);
    let fin = 0;
    items.forEach((it) => {
      const def = registro[it[1]];
      if (!def || def.bucle) return;
      const op = Object.assign({}, it[2] || {});
      const ses = abrir(c, N, it[1], def, m);
      if (o.grupo && !def.grupo) ses.grupo = o.grupo;
      ejecutar(ses, def, base + it[0], op);
      m.ses.push(ses);
      fin = Math.max(fin, it[0] + duracion(def, op));
    });
    window.setTimeout(() => {
      m.ses.forEach((s) => cerrar(s, 0.05));
    }, (fin + (o.retardo || 0) + 1.5) * 1000);
    return m;
  }

  function arrancar(m){
    if (m.parado || m.ses.length) return;
    const def = registro[m.nombre];
    if (!def) return;
    if (!corriendo()){
      reanudar();
      return;
    }
    const c = ac;
    const ses = abrir(c, N, m.nombre, def, m);
    m.ses.push(ses);
    const g = ses.g;
    const nivel = def.nivel == null ? 1 : def.nivel;
    const entrada = m.fade == null ? 0.6 : m.fade;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(nivel, c.currentTime + entrada);
    const t0 = c.currentTime + 0.03;
    const res = ejecutar(ses, def, t0, m.op, H, ses) || {};
    if (typeof res.tick === 'function'){
      let proximo = t0;
      const ciclo = () => {
        if (ses.cerrada) return;
        while (proximo < c.currentTime + ADELANTE){
          try { res.tick(proximo, proximo + PASO_BUCLE); } catch (e) {}
          proximo += PASO_BUCLE;
        }
      };
      ciclo();
      ses.intervalo = window.setInterval(ciclo, 400);
    }
  }

  function bucle(nombre, op, fade){
    const def = registro[nombre];
    const m = nuevoManejador({ nombre: nombre, op: op || {}, fade: fade, nulo: !def || !def.bucle });
    if (!def || !def.bucle) return m;
    manejadores.add(m);
    arrancar(m);
    return m;
  }

  function parar(que, fade){
    if (que && typeof que === 'object'){
      que.parar(fade);
      return;
    }
    Array.from(manejadores).forEach((m) => {
      const def = registro[m.nombre];
      if (!que || (def && def.grupo === que)) m.parar(fade);
    });
    Array.from(sesiones).forEach((s) => {
      if (!que || s.grupo === que) cerrar(s, fade);
    });
  }

  function silenciar(si, sinGuardar){
    const nuevo = !!si;
    if (nuevo === silencio) return;
    silencio = nuevo;
    if (!sinGuardar){
      try { window.localStorage.setItem(CLAVE, silencio ? 'no' : 'si'); } catch (e) {}
    }
    if (ac && N){
      const p = N.master.gain;
      const ahora = ac.currentTime;
      p.cancelScheduledValues(ahora);
      p.setValueAtTime(p.value, ahora);
      p.linearRampToValueAtTime(silencio ? 0 : 1, ahora + 0.08);
    }
    oyentes.slice().forEach((fn) => { try { fn(silencio); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('sonido', { detail: { silenciado: silencio } }));
  }

  function alCambiar(fn){
    oyentes.push(fn);
  }

  function render(nombre, opciones){
    const o = opciones || {};
    const def = registro[nombre];
    if (!def) return Promise.reject(new Error('sin cue ' + nombre));
    const sr = o.sr || 44100;
    const dur = o.dur || duracion(def, o.op) + 1;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OAC(2, Math.ceil(sr * dur), sr);
    const nodos = construir(oc, oc.destination, true);
    const ses = abrir(oc, nodos, nombre, def, null);
    sesiones.delete(ses);
    const t0 = 0.01;
    const res = ejecutar(ses, def, t0, o.op || {}) || {};
    if (def.bucle){
      ses.g.gain.setValueAtTime(def.nivel == null ? 1 : def.nivel, 0);
      if (typeof res.tick === 'function'){
        for (let t = t0; t < dur; t += PASO_BUCLE) res.tick(t, t + PASO_BUCLE);
      }
    }
    return oc.startRendering();
  }

  function registrar(nombre, def){
    registro[nombre] = def;
  }

  const H = {
    semilla: semilla,
    acotar: acotar,
    aleatorio: aleatorio,
    elegir: elegir,
    hz: hz,
    nota: nota,
    fuenteRuido: fuenteRuido,
    ganancia: ganancia,
    filtro: filtro,
    osc: osc,
    panear: panear,
    curva: curva,
    expo: expo,
    tono: tono,
    rafaga: rafaga,
    campana: campana,
    teclas: teclas,
    colchon: colchon,
    cuerda: cuerda,
    cuerpoGuitarra: cuerpoGuitarra,
    rasgueo: rasgueo
  };

  function montarControles(){
    const botones = [];
    const tvBtn = document.getElementById('btnSonido');
    if (tvBtn) botones.push(tvBtn);

    function pintar(){
      botones.forEach((b) => {
        b.setAttribute('aria-pressed', silencio ? 'false' : 'true');
        const est = b.querySelector('.tv-sonido-estado');
        if (est) est.textContent = silencio ? 'no' : 'sí';
        b.classList.toggle('is-silencio', silencio);
      });
    }

    botones.forEach((b) => {
      b.addEventListener('click', () => {
        silenciar(!silencio);
        if (!silencio){
          contexto();
          reanudar().then(() => { tocar('sonido-activado'); });
        }
      });
    });

    alCambiar(pintar);
    pintar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarControles);
  else montarControles();

  window.Sonido = {
    registrar: registrar,
    tocar: tocar,
    linea: linea,
    bucle: bucle,
    parar: parar,
    silenciado: () => silencio,
    silenciar: silenciar,
    alternar: () => silenciar(!silencio),
    alCambiar: alCambiar,
    preparar: () => { contexto(); return reanudar(); },
    listo: corriendo,
    render: render,
    nombres: () => Object.keys(registro),
    definicion: (n) => registro[n],
    H: H,
    contexto: () => ac,
    activas: () => ({ sesiones: sesiones.size, bucles: manejadores.size }),
    nivel: () => (N ? N.master.gain.value : null)
  };
})();
