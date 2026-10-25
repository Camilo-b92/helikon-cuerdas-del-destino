(function(){
  'use strict';

  const S = window.Sonido;
  if (!S) return;
  const H = S.H;
  const R = S.registrar;
  const n = H.nota;
  const az = H.aleatorio;

  function mezcla(c, b, k){
    const m = H.ganancia(c, 1);
    m.connect(b.seco);
    if (k){
      const e = H.ganancia(c, k);
      m.connect(e);
      e.connect(b.reverb);
    }
    return m;
  }

  function continuo(ses, nodo){
    ses.alParar.push((t) => { try { nodo.stop(t); } catch (e) {} });
    return nodo;
  }

  function lfo(c, param, f, prof, ses, t0){
    const o = H.osc(c, 'sine', f);
    const g = H.ganancia(c, prof);
    o.connect(g);
    g.connect(param);
    o.start(t0);
    if (ses) continuo(ses, o);
    return o;
  }

  function viento(c, ses, dest, t0, o){
    const vol = o.vol == null ? 0.06 : o.vol;
    const f = o.f || 420;
    const w = H.fuenteRuido(c, 'rosa', t0);
    continuo(ses, w);
    const bp = H.filtro(c, 'bandpass', f, 0.5);
    const g = H.ganancia(c, vol);
    lfo(c, g.gain, 0.09, vol * 0.6, ses, t0);
    lfo(c, bp.frequency, 0.05, f * 0.4, ses, t0);
    w.connect(bp);
    bp.connect(g);
    g.connect(dest);
  }

  function zumbidoBajo(c, ses, dest, t0, o){
    const w = H.fuenteRuido(c, 'marron', t0);
    continuo(ses, w);
    const lp = H.filtro(c, 'lowpass', o.f || 260, 0.6);
    const g = H.ganancia(c, o.vol == null ? 0.05 : o.vol);
    w.connect(lp);
    lp.connect(g);
    g.connect(dest);
  }

  function grillos(c, ses, dest, t0, o){
    if (!c.createConstantSource) return;
    const portadora = H.osc(c, 'sine', o.f || 4500);
    const amp = H.ganancia(c, 0);
    const pulsos = H.osc(c, 'square', o.ritmo || 33);
    const pg = H.ganancia(c, 0.5);
    const dc = c.createConstantSource();
    dc.offset.value = 0.5;
    pulsos.connect(pg);
    pg.connect(amp.gain);
    dc.connect(amp.gain);
    const puerta = H.ganancia(c, 0);
    const go = H.osc(c, 'square', o.gate || 1.7);
    const gg = H.ganancia(c, 0.5);
    const gdc = c.createConstantSource();
    gdc.offset.value = 0.5;
    go.connect(gg);
    gg.connect(puerta.gain);
    gdc.connect(puerta.gain);
    const bp = H.filtro(c, 'bandpass', o.f || 4500, 3);
    const vol = H.ganancia(c, o.vol == null ? 0.012 : o.vol);
    portadora.connect(amp);
    amp.connect(puerta);
    puerta.connect(bp);
    bp.connect(vol);
    H.panear(c, vol, o.pan).connect(dest);
    [portadora, pulsos, dc, go, gdc].forEach((x) => { x.start(t0); continuo(ses, x); });
  }

  function pajaro(c, dest, t, o){
    const notas = o.notas || H.elegir([2, 3, 3, 4, 5]);
    const base = o.f || az(2300, 4300);
    const vol = o.vol == null ? 0.05 : o.vol;
    let tt = t;
    for (let i = 0; i < notas; i++){
      const f = base * (1 + az(-0.08, 0.2));
      H.tono(c, dest, {
        t: tt, dur: 0.085, f: f, f2: f * az(0.75, 1.45), glide: 0.075,
        vol: vol * az(0.7, 1), a: 0.01, pan: o.pan
      });
      tt += az(0.1, 0.16);
    }
    return tt - t;
  }

  function paso(c, d, t, o){
    const vol = o.vol == null ? 0.4 : o.vol;
    const k = az(0.85, 1.15);
    const tipo = o.tipo || 'tierra';
    if (tipo === 'asfalto'){
      H.rafaga(c, d, { t: t, dur: 0.035, filtro: ['bandpass', 2300 * k, 1.1], vol: vol * 0.55, a: 0.002, pan: o.pan });
      H.tono(c, d, { t: t, dur: 0.07, f: 150 * k, f2: 80, vol: vol * 0.7, a: 0.002, pan: o.pan });
      H.rafaga(c, d, { t: t + 0.012, dur: 0.05, filtro: ['bandpass', 900, 1.5], vol: vol * 0.22, a: 0.004, pan: o.pan });
    } else if (tipo === 'madera'){
      H.tono(c, d, { t: t, dur: 0.11, f: 210 * k, f2: 120, vol: vol * 0.9, a: 0.002, pan: o.pan });
      H.rafaga(c, d, { t: t, dur: 0.05, filtro: ['bandpass', 520, 6], vol: vol * 0.5, a: 0.002, pan: o.pan });
    } else if (tipo === 'hierba'){
      H.rafaga(c, d, { t: t, dur: 0.14, ruido: 'rosa', filtro: ['bandpass', 1700 * k, 0.7], vol: vol * 0.5, a: 0.02, pan: o.pan });
      H.tono(c, d, { t: t + 0.01, dur: 0.1, f: 95 * k, f2: 55, vol: vol * 0.45, a: 0.01, pan: o.pan });
    } else {
      H.rafaga(c, d, { t: t, dur: 0.09, ruido: 'rosa', filtro: ['bandpass', 1300 * k, 0.8], vol: vol * 0.7, a: 0.004, pan: o.pan });
      H.rafaga(c, d, { t: t + 0.01, dur: 0.05, filtro: ['highpass', 3000, 0.5], vol: vol * 0.16, a: 0.003, pan: o.pan });
      H.tono(c, d, { t: t, dur: 0.09, f: 120 * k, f2: 62, vol: vol * 0.6, a: 0.003, pan: o.pan });
    }
  }

  function golpeMadera(c, d, t, vol, f0){
    const base = f0 || 210;
    [[1, 0.13, 1], [1.62, 0.09, 0.6], [2.7, 0.06, 0.35]].forEach((p) => {
      H.tono(c, d, { t: t, dur: p[1], f: base * p[0], vol: vol * p[2], a: 0.002 });
    });
    H.rafaga(c, d, { t: t, dur: 0.03, filtro: ['bandpass', 1400, 1.4], vol: vol * 0.45, a: 0.001 });
  }

  function arpegio(def){
    return {
      grupo: 'musica',
      bucle: true,
      dur: 60,
      fn: (c, b, t0, op, HH, ses) => {
        let idx = 0;
        const mix = mezcla(c, b, def.reverb == null ? 0.3 : def.reverb);
        const cuerpo = HH.cuerpoGuitarra(c, mix);
        return {
          tick: (desde) => {
            const ventanas = Math.max(1, Math.round(def.compas / 2));
            const acorde = def.acordes[Math.floor(idx / ventanas) % def.acordes.length];
            const ini = (idx % ventanas) * (def.patron.length / ventanas);
            const total = def.patron.length / ventanas;
            for (let i = 0; i < total; i++){
              const nota = acorde[def.patron[Math.floor(ini + i) % def.patron.length]];
              if (nota == null) continue;
              const tt = desde + i * def.paso + az(0, 0.012);
              const fuerte = (Math.floor(ini + i) % 3 === 0) ? 1 : 0.78;
              HH.cuerda(c, cuerpo, { t: tt, f: nota, dur: def.dur || 2.4, vol: def.vol * fuerte * az(0.88, 1.08), brillo: def.brillo || 0.5, amort: 1.1 });
            }
            if (def.pad && idx % ventanas === 0){
              HH.colchon(c, mix, { t: desde, dur: def.compas + 1.5, f: def.pad[Math.floor(idx / ventanas) % def.pad.length], vol: def.volPad || 0.05, a: 0.9, r: 1.4, corte: 900 });
            }
            idx++;
          }
        };
      }
    };
  }

  R('tv-encender', {
    grupo: 'tv', dur: 1.1,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.08);
      HH.tono(c, d, { t: t, dur: 0.2, f: 95, f2: 40, vol: 0.45, a: 0.003 });
      HH.rafaga(c, d, { t: t, dur: 0.03, filtro: ['highpass', 1800, 0.7], vol: 0.2, a: 0.001 });
      HH.tono(c, d, { t: t + 0.04, dur: 0.62, f: 130, f2: 52, tipo: 'sawtooth', vol: 0.06, a: 0.02, filtro: ['lowpass', 420, 1] });
      HH.rafaga(c, d, { t: t + 0.03, dur: 0.5, ruido: 'rosa', filtro: ['bandpass', 900, 0.7], vol: 0.11, a: 0.02 });
      HH.tono(c, d, { t: t + 0.08, dur: 0.75, f: 650, f2: 3400, tipo: 'sine', vol: 0.035, a: 0.12, glide: 0.5 });
      HH.rafaga(c, d, { t: t + 0.12, dur: 0.7, filtro: ['highpass', 2500, 0.5], vol: 0.04, a: 0.1 });
    }
  });

  R('tv-apagar', {
    grupo: 'tv', dur: 0.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.05);
      HH.tono(c, d, { t: t, dur: 0.3, f: 1700, f2: 70, vol: 0.14, a: 0.004, glide: 0.28 });
      HH.rafaga(c, d, { t: t, dur: 0.3, ruido: 'rosa', filtro: ['bandpass', 1400, 0.8], barrido: 200, vol: 0.12, a: 0.004 });
      HH.tono(c, d, { t: t + 0.27, dur: 0.12, f: 70, f2: 38, vol: 0.4, a: 0.003 });
      HH.rafaga(c, d, { t: t + 0.3, dur: 0.012, filtro: ['highpass', 2000, 0.7], vol: 0.2, a: 0.001 });
      HH.tono(c, d, { t: t + 0.31, dur: 0.35, f: 2600, vol: 0.03, a: 0.002 });
    }
  });

  R('tv-estatica', {
    grupo: 'tv', dur: 0.55,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.05);
      HH.tono(c, d, { t: t, dur: 0.07, f: 150, f2: 85, vol: 0.22, a: 0.002 });
      HH.rafaga(c, d, { t: t, dur: 0.46, filtro: ['highpass', 700, 0.5], vol: 0.2, a: 0.015, suave: 0.55 });
      HH.rafaga(c, d, { t: t + 0.03, dur: 0.4, ruido: 'rosa', filtro: ['bandpass', 1800, 0.6], vol: 0.1, a: 0.02, suave: 0.4 });
      for (let i = 0; i < 12; i++){
        HH.rafaga(c, d, { t: t + az(0.02, 0.38), dur: 0.01, filtro: ['bandpass', az(1500, 5000), 2], vol: az(0.04, 0.1), a: 0.001 });
      }
      HH.tono(c, d, { t: t + 0.2, dur: 0.05, f: 120, f2: 70, vol: 0.1, a: 0.002 });
    }
  });

  R('tv-boton', {
    grupo: 'tv', dur: 0.25,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.04);
      HH.rafaga(c, d, { t: t, dur: 0.02, filtro: ['bandpass', 2200, 1.2], vol: 0.28, a: 0.001 });
      HH.tono(c, d, { t: t, dur: 0.06, f: 170, f2: 80, vol: 0.3, a: 0.002 });
      HH.rafaga(c, d, { t: t + 0.07, dur: 0.014, filtro: ['bandpass', 1500, 1.2], vol: 0.12, a: 0.001 });
    }
  });

  R('tv-zumbido', {
    grupo: 'zumbido', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      const d = b.seco;
      [[60, 'sine', 0.016], [120, 'triangle', 0.008], [180, 'sine', 0.003]].forEach((p) => {
        const o = HH.osc(c, p[1], p[0]);
        const g = HH.ganancia(c, p[2]);
        o.connect(g);
        g.connect(d);
        o.start(t0);
        continuo(ses, o);
      });
      const w = HH.fuenteRuido(c, 'rosa', t0);
      continuo(ses, w);
      const hp = HH.filtro(c, 'highpass', 5500, 0.6);
      const g2 = HH.ganancia(c, 0.0016);
      w.connect(hp);
      hp.connect(g2);
      g2.connect(d);
    }
  });

  R('aviso-fin', {
    grupo: 'ui', dur: 1.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.35);
      HH.campana(c, d, { t: t, f: n('sol5'), vol: 0.13, dur: 1.2 });
      HH.campana(c, d, { t: t + 0.12, f: n('re6'), vol: 0.11, dur: 1.3 });
    }
  });

  R('sonido-activado', {
    grupo: 'ui', dur: 0.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.2);
      HH.campana(c, d, { t: t, f: n('do6'), vol: 0.1, dur: 0.5 });
      HH.campana(c, d, { t: t + 0.09, f: n('mi6'), vol: 0.1, dur: 0.6 });
    }
  });

  R('paso', {
    grupo: 'escena', dur: 0.3,
    fn: (c, b, t, op) => { paso(c, mezcla(c, b, op.reverb || 0.04), t, op); }
  });

  R('pasos', {
    grupo: 'escena',
    dur: (op) => (op.n || 4) * (op.cada || 0.4) + 0.4,
    fn: (c, b, t, op) => {
      const d = mezcla(c, b, op.reverb == null ? 0.05 : op.reverb);
      const cant = op.n || 4;
      const cada = op.cada || 0.4;
      for (let i = 0; i < cant; i++){
        const k = cant > 1 ? i / (cant - 1) : 0;
        const pan = op.pan0 == null ? 0 : op.pan0 + (op.pan1 - op.pan0) * k;
        const env = op.desvanece ? 1 - 0.55 * k : 1;
        const entra = op.entra ? 0.4 + 0.6 * Math.min(1, i / 3) : 1;
        paso(c, d, t + i * cada + az(-0.012, 0.012), {
          tipo: op.tipo, vol: (op.vol == null ? 0.4 : op.vol) * env * entra * az(0.85, 1.1) * (i % 2 ? 0.9 : 1), pan: pan
        });
      }
    }
  });

  R('pasos-correr', {
    grupo: 'escena', bucle: true, dur: 30,
    fn: (c, b, t0, op) => {
      const d = mezcla(c, b, 0.05);
      let i = 0;
      return {
        tick: (desde, hasta) => {
          for (let t = desde; t < hasta; t += 0.26){
            paso(c, d, t, { tipo: op.tipo || 'asfalto', vol: (op.vol == null ? 0.34 : op.vol) * (i % 2 ? 0.88 : 1) * az(0.9, 1.1) });
            i++;
          }
        }
      };
    }
  });

  R('latido', {
    grupo: 'escena', bucle: true, dur: 30,
    fn: (c, b, t0, op) => {
      const d = mezcla(c, b, 0.1);
      return {
        tick: (desde, hasta) => {
          for (let t = desde; t < hasta; t += 0.86){
            H.tono(c, d, { t: t, dur: 0.14, f: 62, f2: 40, vol: (op.vol == null ? 0.26 : op.vol), a: 0.006 });
            H.tono(c, d, { t: t + 0.2, dur: 0.12, f: 55, f2: 36, vol: (op.vol == null ? 0.26 : op.vol) * 0.7, a: 0.006 });
          }
        }
      };
    }
  });

  R('puerta-abre', {
    grupo: 'escena', dur: 2.1,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.12);
      const vol = op.vol == null ? 1 : op.vol;
      HH.rafaga(c, d, { t: t, dur: 0.02, filtro: ['highpass', 900, 0.7], vol: 0.3 * vol, a: 0.001 });
      HH.tono(c, d, { t: t, dur: 0.07, f: 230, f2: 110, vol: 0.25 * vol, a: 0.002 });
      const dur = op.dur || 1.7;
      const x = HH.osc(c, 'sawtooth', 200);
      const t1 = t + 0.08;
      HH.curva(x.frequency, t1, [[0, 190], [dur * 0.2, 270], [dur * 0.38, 215], [dur * 0.6, 340], [dur * 0.8, 260], [dur, 310]]);
      const bp = HH.filtro(c, 'bandpass', 950, 6);
      const g = HH.ganancia(c, 0);
      HH.curva(g.gain, t1, [[0, 0.0001], [0.15, 0.1 * vol], [dur * 0.85, 0.09 * vol], [dur, 0.0001]]);
      const trem = HH.osc(c, 'sine', 9);
      const tg = HH.ganancia(c, 0.035 * vol);
      trem.connect(tg);
      tg.connect(g.gain);
      x.connect(bp);
      bp.connect(g);
      g.connect(d);
      x.start(t1);
      x.stop(t1 + dur + 0.05);
      trem.start(t1);
      trem.stop(t1 + dur + 0.05);
      HH.rafaga(c, d, { t: t1, dur: dur, ruido: 'rosa', filtro: ['bandpass', 1500, 2], vol: 0.035 * vol, a: 0.2, suave: 0.8 });
      HH.tono(c, d, { t: t1 + dur, dur: 0.18, f: 85, f2: 45, vol: 0.3 * vol, a: 0.004 });
    }
  });

  R('cortina', {
    grupo: 'escena', dur: 1.1,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.1);
      HH.rafaga(c, d, { t: t, dur: 0.9, ruido: 'rosa', filtro: ['bandpass', 2400, 0.5], barrido: 900, vol: 0.14, a: 0.12, suave: 0.4 });
      HH.rafaga(c, d, { t: t + 0.05, dur: 0.7, filtro: ['highpass', 4000, 0.5], vol: 0.03, a: 0.1, suave: 0.4 });
      for (let i = 0; i < 5; i++){
        HH.rafaga(c, d, { t: t + 0.1 + i * 0.12, dur: 0.02, filtro: ['bandpass', 3800, 2], vol: 0.04, a: 0.002 });
      }
    }
  });

  R('libros', {
    grupo: 'escena', dur: 1.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.14);
      [[0, 1], [0.13, 0.8], [0.27, 0.9], [0.5, 0.6]].forEach((p, i) => {
        HH.tono(c, d, { t: t + p[0], dur: 0.12, f: 140 - i * 10, f2: 70, vol: 0.34 * p[1], a: 0.003 });
        HH.rafaga(c, d, { t: t + p[0], dur: 0.07, ruido: 'rosa', filtro: ['bandpass', 800, 1], vol: 0.2 * p[1], a: 0.002 });
        HH.rafaga(c, d, { t: t + p[0], dur: 0.1, filtro: ['bandpass', 3200, 1], vol: 0.05 * p[1], a: 0.002 });
      });
      HH.rafaga(c, d, { t: t + 0.7, dur: 0.5, ruido: 'rosa', filtro: ['bandpass', 3000, 0.6], vol: 0.05, a: 0.06, suave: 0.4 });
    }
  });

  R('silbido', {
    grupo: 'escena', dur: 0.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.06);
      HH.rafaga(c, d, { t: t, dur: 0.4, ruido: 'rosa', filtro: ['bandpass', 500, 1.1], barrido: 2600, vol: op.vol == null ? 0.2 : op.vol, a: 0.1, suave: 0.45, pan: op.pan });
    }
  });

  R('golpe-madera', {
    grupo: 'escena', dur: 0.6,
    fn: (c, b, t, op) => { golpeMadera(c, mezcla(c, b, 0.1), t, op.vol == null ? 0.4 : op.vol, op.f); }
  });

  R('caja-cae', {
    grupo: 'escena', dur: 1.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.12);
      golpeMadera(c, d, t, 0.42, 190);
      [[0.16, 0.34, 240], [0.3, 0.28, 170], [0.42, 0.36, 200], [0.52, 0.22, 260], [0.62, 0.3, 160], [0.69, 0.14, 300]].forEach((p) => {
        golpeMadera(c, d, t + p[0], p[1], p[2]);
      });
      HH.rafaga(c, d, { t: t + 0.7, dur: 0.35, ruido: 'rosa', filtro: ['bandpass', 1200, 0.8], vol: 0.12, a: 0.01 });
      HH.tono(c, d, { t: t + 0.78, dur: 0.18, f: 100, f2: 50, vol: 0.4, a: 0.003 });
    }
  });

  R('rebotes', {
    grupo: 'escena', dur: 2.2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.1);
      const vol = op.vol == null ? 0.34 : op.vol;
      let tt = t;
      let sep = 0.46;
      let v = vol;
      for (let i = 0; i < 6; i++){
        HH.tono(c, d, { t: tt, dur: 0.13, f: 160 - i * 8, f2: 78, vol: v, a: 0.002 });
        HH.rafaga(c, d, { t: tt, dur: 0.03, filtro: ['bandpass', 900, 1.3], vol: v * 0.45, a: 0.001 });
        tt += sep;
        sep *= 0.7;
        v *= 0.62;
      }
      HH.rafaga(c, d, { t: tt - 0.1, dur: 0.5, ruido: 'rosa', filtro: ['bandpass', 600, 0.7], vol: 0.025, a: 0.1, suave: 0.3 });
    }
  });

  R('revolver', {
    grupo: 'escena', dur: (op) => (op.dur || 7.5) + 0.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.1);
      const total = op.dur || 7.5;
      const cuerpo = HH.cuerpoGuitarra(c, d);
      let tt = 0.15;
      while (tt < total){
        const r = Math.random();
        const x = t + tt;
        if (r < 0.4){
          HH.rafaga(c, d, { t: x, dur: az(0.12, 0.3), ruido: 'rosa', filtro: ['bandpass', az(1500, 2600), 0.6], vol: az(0.05, 0.1), a: 0.04, suave: 0.4, pan: az(-0.3, 0.3) });
        } else if (r < 0.62){
          const f = az(1700, 3300);
          HH.tono(c, d, { t: x, dur: 0.22, f: f, vol: az(0.03, 0.06), a: 0.002, pan: az(-0.4, 0.4) });
          HH.tono(c, d, { t: x, dur: 0.16, f: f * 2.4, vol: 0.02, a: 0.002 });
        } else if (r < 0.82){
          golpeMadera(c, d, x, az(0.08, 0.16), az(170, 260));
        } else {
          HH.cuerda(c, cuerpo, { t: x, f: H.elegir([n('mi2'), n('la2'), n('re3'), n('sol3'), n('si3')]), dur: 1.4, vol: az(0.06, 0.1), brillo: 0.4, amort: 0.6 });
          HH.rafaga(c, d, { t: x, dur: 0.05, filtro: ['bandpass', 600, 1], vol: 0.05, a: 0.003 });
        }
        tt += az(0.2, 0.55);
      }
    }
  });

  R('texto', {
    grupo: 'escena', dur: 1.2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.3);
      HH.rafaga(c, d, { t: t, dur: 0.32, ruido: 'rosa', filtro: ['bandpass', 1500, 0.8], barrido: 4600, vol: 0.06, a: 0.06, suave: 0.5 });
      HH.campana(c, d, { t: t + 0.12, f: op.f || n('mi6'), vol: 0.07, dur: 0.8 });
    }
  });

  R('burbuja', {
    grupo: 'escena', dur: 0.5,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.12);
      const k = op.k || 1;
      const vol = op.vol == null ? 1 : op.vol;
      HH.tono(c, d, { t: t, dur: 0.1, f: 300 * k, f2: 820 * k, glide: 0.07, vol: 0.16 * vol, a: 0.004, pan: op.pan });
      HH.rafaga(c, d, { t: t + 0.07, dur: 0.025, filtro: ['bandpass', 2000 * k, 1.5], vol: 0.07 * vol, a: 0.001, pan: op.pan });
      HH.tono(c, d, { t: t + 0.075, dur: 0.12, f: 1100 * k, vol: 0.05 * vol, a: 0.002, pan: op.pan });
    }
  });

  R('panel', {
    grupo: 'escena', dur: 0.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.08);
      const vol = op.vol == null ? 1 : op.vol;
      HH.rafaga(c, d, { t: t, dur: 0.36, ruido: 'rosa', filtro: ['bandpass', 450, 0.9], barrido: 2100, vol: 0.11 * vol, a: 0.07, suave: 0.5 });
      HH.tono(c, d, { t: t + 0.3, dur: 0.1, f: 130, f2: 80, vol: 0.12 * vol, a: 0.004 });
    }
  });

  R('maravilla', {
    grupo: 'escena', dur: 1.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.35);
      ['mi6', 'sol6', 'si6', 'mi7', 'sol6', 'si6'].forEach((nn, i) => {
        HH.campana(c, d, { t: t + i * 0.075, f: n(nn), vol: 0.06 - i * 0.004, dur: 0.7 });
      });
      HH.rafaga(c, d, { t: t, dur: 0.9, filtro: ['highpass', 6500, 0.5], vol: 0.018, a: 0.25, suave: 0.4 });
    }
  });

  R('susto', {
    grupo: 'escena', dur: 1.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.28);
      [n('la3'), n('sib3'), n('mi4'), n('fa4')].forEach((f) => {
        HH.tono(c, d, { t: t, dur: 0.9, f: f, tipo: 'sawtooth', vol: 0.06, a: 0.004, filtro: ['lowpass', 2600, 0.8] });
      });
      HH.tono(c, d, { t: t, dur: 0.7, f: 62, f2: 34, vol: 0.5, a: 0.004 });
      HH.rafaga(c, d, { t: t, dur: 0.25, filtro: ['bandpass', 1800, 0.6], vol: 0.22, a: 0.002 });
      HH.tono(c, d, { t: t - 0.0, dur: 0.12, f: 1900, f2: 700, vol: 0.08, a: 0.002 });
    }
  });

  R('fantasma', {
    grupo: 'escena', dur: 4.2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.6);
      HH.tono(c, d, { t: t, dur: 3.6, f: 560, f2: 300, glide: 3.4, vol: 0.07, a: 1.0, vib: [5.2, 12], filtro: ['lowpass', 1500, 0.7] });
      HH.tono(c, d, { t: t + 0.12, dur: 3.5, f: 845, f2: 450, glide: 3.3, vol: 0.035, a: 1.1, vib: [4.6, 15], filtro: ['lowpass', 1800, 0.7] });
      HH.rafaga(c, d, { t: t, dur: 3.6, ruido: 'rosa', filtro: ['bandpass', 900, 1.2], barrido: 350, vol: 0.06, a: 0.9, suave: 0.4 });
      HH.tono(c, d, { t: t, dur: 2.2, f: 70, vol: 0.12, a: 0.6 });
    }
  });

  R('aura-fantasma', {
    grupo: 'escena', dur: 13,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.55);
      HH.colchon(c, d, { t: t, dur: 12.5, f: [n('re3'), n('la3'), n('fa4')], vol: 0.07, a: 2.2, r: 3, corte: 800, tipo: 'sine' });
      [[0, 0.24], [4.2, 0.24], [7.1, 0.3]].forEach((p) => {
        HH.tono(c, d, { t: t + p[0] + 0.05, dur: 2.8, f: 600, f2: 420, glide: 2.6, vol: 0.035, a: 0.4, vib: [5, 10], filtro: ['lowpass', 1400, 0.7] });
      });
      HH.rafaga(c, d, { t: t, dur: 12.4, ruido: 'rosa', filtro: ['bandpass', 600, 0.9], vol: 0.02, a: 2, suave: 0.7 });
    }
  });

  R('suspiro-viento', {
    grupo: 'escena', dur: 2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.3);
      HH.rafaga(c, d, { t: t, dur: 1.8, ruido: 'rosa', filtro: ['bandpass', 500, 0.8], barrido: 1100, vol: 0.07, a: 0.5, suave: 0.4 });
    }
  });

  R('titulo-obra', {
    grupo: 'escena', dur: 6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.4);
      const cuerpo = HH.cuerpoGuitarra(c, d);
      ['la2', 'mi3', 'la3', 'do4', 'mi4', 'si4'].forEach((nn, i) => {
        HH.cuerda(c, cuerpo, { t: t + 0.3 + i * 0.17, f: n(nn), dur: 3.2, vol: 0.22 - i * 0.012, brillo: 0.55, amort: 1.1 });
      });
      HH.colchon(c, d, { t: t, dur: 5.6, f: [n('la2'), n('mi3'), n('la3'), n('do4')], vol: 0.08, a: 1.1, r: 2.2, corte: 1100 });
      HH.campana(c, d, { t: t + 1.45, f: n('la5'), vol: 0.1, dur: 2.6 });
      HH.campana(c, d, { t: t + 1.95, f: n('mi6'), vol: 0.07, dur: 2.4 });
      HH.tono(c, d, { t: t, dur: 2.4, f: 55, vol: 0.12, a: 0.9 });
      HH.rafaga(c, d, { t: t, dur: 1.9, filtro: ['highpass', 6000, 0.5], vol: 0.02, a: 0.9, suave: 0.4 });
    }
  });

  R('capitulo', {
    grupo: 'escena', dur: 3.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.4);
      const raiz = op.n === 2 ? 're' : op.n === 3 ? 'mi' : 'do';
      const quinta = op.n === 2 ? 'la' : op.n === 3 ? 'si' : 'sol';
      const cuerpo = HH.cuerpoGuitarra(c, d);
      HH.cuerda(c, cuerpo, { t: t + 0.1, f: n(raiz + '3'), dur: 2.6, vol: 0.24, brillo: 0.5, amort: 1.1 });
      HH.cuerda(c, cuerpo, { t: t + 0.3, f: n(quinta + '3'), dur: 2.6, vol: 0.2, brillo: 0.5, amort: 1.1 });
      HH.cuerda(c, cuerpo, { t: t + 0.5, f: n(raiz + '4'), dur: 2.6, vol: 0.18, brillo: 0.55, amort: 1.1 });
      HH.campana(c, d, { t: t + 0.6, f: n(raiz + '5'), vol: 0.1, dur: 2.2 });
      HH.colchon(c, d, { t: t, dur: 3.2, f: [n(raiz + '3'), n(quinta + '3'), n(raiz + '4')], vol: 0.05, a: 0.7, r: 1.8, corte: 1000 });
      HH.tono(c, d, { t: t, dur: 1.4, f: 55, vol: 0.09, a: 0.5 });
    }
  });

  R('sorpresa', {
    grupo: 'entrada', dur: 0.6,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.1);
      HH.tono(c, d, { t: t, dur: 0.2, f: 380, f2: 980, glide: 0.14, vol: 0.2, a: 0.006 });
      HH.tono(c, d, { t: t + 0.09, dur: 0.22, f: 1250, f2: 1500, glide: 0.1, vol: 0.09, a: 0.004 });
      HH.rafaga(c, d, { t: t, dur: 0.05, filtro: ['bandpass', 2400, 1.2], vol: 0.07, a: 0.002 });
      HH.tono(c, d, { t: t + 0.2, dur: 0.12, f: 140, f2: 90, vol: 0.2, a: 0.003 });
    }
  });

  R('burbuja-entrada', {
    grupo: 'entrada', dur: 1.2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.25);
      HH.tono(c, d, { t: t, dur: 0.1, f: 260, f2: 900, glide: 0.08, vol: 0.18, a: 0.004 });
      HH.rafaga(c, d, { t: t + 0.07, dur: 0.03, filtro: ['bandpass', 2200, 1.5], vol: 0.07, a: 0.001 });
      ['mi6', 'sol6', 'si6'].forEach((nn, i) => {
        HH.campana(c, d, { t: t + 0.12 + i * 0.07, f: n(nn), vol: 0.05, dur: 0.6 });
      });
    }
  });

  R('brazo', {
    grupo: 'entrada', dur: 0.8,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.05);
      HH.rafaga(c, d, { t: t, dur: 0.5, ruido: 'rosa', filtro: ['bandpass', 1500, 0.6], barrido: 700, vol: 0.05, a: 0.1, suave: 0.4 });
    }
  });

  R('pulso', {
    grupo: 'entrada', dur: 1.2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.3);
      HH.campana(c, d, { t: t, f: n('mi6'), vol: 0.07, dur: 1 });
      HH.campana(c, d, { t: t + 0.3, f: n('si6'), vol: 0.05, dur: 0.8 });
    }
  });

  R('zoom', {
    grupo: 'entrada', dur: 2,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.15);
      const dur = op.dur || 1.3;
      HH.rafaga(c, d, { t: t, dur: dur, ruido: 'rosa', filtro: ['bandpass', 250, 0.9], barrido: 3200, vol: 0.18, a: dur * 0.45, suave: 0.78 });
      HH.tono(c, d, { t: t, dur: dur, f: 70, f2: 150, glide: dur, vol: 0.14, a: dur * 0.5 });
      HH.tono(c, d, { t: t + dur * 0.55, dur: dur * 0.6, f: 500, f2: 1700, glide: dur * 0.5, vol: 0.03, a: 0.2 });
    }
  });

  R('entrada-ambiente', {
    grupo: 'entrada', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      viento(c, ses, b.seco, t0, { vol: 0.07, f: 520 });
      const d = mezcla(c, b, 0.2);
      return {
        tick: (desde, hasta) => {
          const q = Math.random();
          if (q < 0.8) pajaro(c, d, desde + az(0, hasta - desde - 0.6), { vol: 0.045, pan: az(-0.7, 0.7) });
          if (q < 0.35) pajaro(c, d, desde + az(0, hasta - desde - 0.6), { vol: 0.03, pan: az(-0.7, 0.7) });
        }
      };
    }
  });

  R('amb-campo', {
    grupo: 'ambiente', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      viento(c, ses, b.seco, t0, { vol: 0.07, f: 480 });
      const d = mezcla(c, b, 0.18);
      const dens = op.densidad == null ? 0.85 : op.densidad;
      return {
        tick: (desde, hasta) => {
          if (Math.random() < dens) pajaro(c, d, desde + az(0, hasta - desde - 0.6), { vol: 0.05, pan: az(-0.8, 0.8) });
          if (Math.random() < dens * 0.4) pajaro(c, d, desde + az(0, hasta - desde - 0.6), { vol: 0.035, pan: az(-0.8, 0.8) });
        }
      };
    }
  });

  R('amb-interior', {
    grupo: 'ambiente', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      zumbidoBajo(c, ses, b.seco, t0, { vol: op.noche ? 0.035 : 0.04, f: 220 });
      if (op.noche) grillos(c, ses, b.seco, t0, { vol: 0.006, f: 4300, ritmo: 29, gate: 1.3, pan: 0.5 });
      viento(c, ses, b.seco, t0, { vol: 0.02, f: 380 });
      const d = mezcla(c, b, 0.1);
      let k = 0;
      return {
        tick: (desde, hasta) => {
          for (let t = desde; t < hasta; t += 1){
            const alto = k % 2 === 0;
            HH.rafaga(c, d, { t: t, dur: 0.012, filtro: ['bandpass', alto ? 2300 : 1900, 3], vol: 0.025, a: 0.001, pan: -0.3 });
            HH.tono(c, d, { t: t, dur: 0.05, f: alto ? 900 : 760, vol: 0.008, a: 0.001, pan: -0.3 });
            k++;
          }
        }
      };
    }
  });

  R('amb-ciudad', {
    grupo: 'ambiente', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      zumbidoBajo(c, ses, b.seco, t0, { vol: 0.07, f: 330 });
      viento(c, ses, b.seco, t0, { vol: 0.035, f: 600 });
      const d = mezcla(c, b, 0.3);
      return {
        tick: (desde, hasta) => {
          if (Math.random() < 0.45){
            const t = desde + az(0, hasta - desde - 1.5);
            const izq = Math.random() < 0.5;
            HH.rafaga(c, d, { t: t, dur: 1.9, ruido: 'rosa', filtro: ['bandpass', 380, 1.2], barrido: 620, vol: 0.05, a: 0.7, suave: 0.4, pan: izq ? -0.7 : 0.7 });
          }
          if (Math.random() < 0.1){
            const t = desde + az(0, hasta - desde - 1);
            const f = H.elegir([n('fa4'), n('sol4')]);
            HH.tono(c, d, { t: t, dur: 0.5, f: f, tipo: 'square', vol: 0.012, a: 0.02, filtro: ['lowpass', 1100, 0.7], pan: az(-0.6, 0.6) });
          }
        }
      };
    }
  });

  R('amb-noche', {
    grupo: 'ambiente', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      zumbidoBajo(c, ses, b.seco, t0, { vol: 0.045, f: 280 });
      viento(c, ses, b.seco, t0, { vol: 0.05, f: 420 });
      grillos(c, ses, b.seco, t0, { vol: 0.011, f: 4400, ritmo: 31, gate: 1.6, pan: -0.5 });
      grillos(c, ses, b.seco, t0, { vol: 0.008, f: 4850, ritmo: 36, gate: 2.1, pan: 0.6 });
      const d = mezcla(c, b, 0.3);
      return {
        tick: (desde, hasta) => {
          if (Math.random() < 0.3){
            const t = desde + az(0, hasta - desde - 1.6);
            const izq = Math.random() < 0.5;
            HH.rafaga(c, d, { t: t, dur: 1.7, ruido: 'rosa', filtro: ['bandpass', 360, 1.2], barrido: 560, vol: 0.04, a: 0.6, suave: 0.4, pan: izq ? -0.7 : 0.7 });
          }
        }
      };
    }
  });

  R('musica-padre', arpegio({
    acordes: [
      [n('do3'), n('mi3'), n('sol3'), n('do4'), n('mi4')],
      [n('sol2'), n('re3'), n('sol3'), n('si3'), n('re4')],
      [n('la2'), n('mi3'), n('la3'), n('do4'), n('mi4')],
      [n('fa2'), n('do3'), n('fa3'), n('la3'), n('do4')]
    ],
    patron: [0, 2, 3, 2, 4, 2, 0, 2, 3, 2, 4, 2],
    paso: 0.333, compas: 4, vol: 0.2, brillo: 0.5, reverb: 0.3
  }));

  R('musica-calle', arpegio({
    acordes: [
      [n('la2'), n('mi3'), n('la3'), n('do4'), n('mi4')],
      [n('fa2'), n('do3'), n('fa3'), n('la3'), n('do4')],
      [n('do3'), n('sol3'), n('do4'), n('mi4'), n('sol4')],
      [n('sol2'), n('re3'), n('sol3'), n('si3'), n('re4')]
    ],
    patron: [0, 2, 4, 3, 2, 3, 4, 3],
    paso: 0.5, compas: 4, vol: 0.19, brillo: 0.45, reverb: 0.35,
    pad: [[n('la2'), n('mi3')], [n('fa2'), n('do3')], [n('do3'), n('sol3')], [n('sol2'), n('re3')]], volPad: 0.04
  }));

  R('musica-sueno', {
    grupo: 'musica', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      const mix = mezcla(c, b, 0.4);
      const acordes = [
        [n('fa3'), n('la3'), n('do4'), n('mi4')],
        [n('do3'), n('mi3'), n('sol3'), n('do4')],
        [n('sol3'), n('si3'), n('re4'), n('sol4')],
        [n('la2'), n('mi3'), n('la3'), n('do4')]
      ];
      let idx = 0;
      return {
        tick: (desde) => {
          const a = acordes[Math.floor(idx / 2) % acordes.length];
          if (idx % 2 === 0){
            HH.colchon(c, mix, { t: desde, dur: 5.6, f: [a[0] / 2, a[1], a[2]], vol: 0.045 + 0.01 * Math.min(idx / 8, 1), a: 1.4, r: 2, corte: 1200 });
          }
          for (let i = 0; i < 4; i++){
            HH.teclas(c, mix, { t: desde + i * 0.5, f: a[(i + (idx % 2) * 2) % 4], vol: 0.11, dur: 2.2 });
          }
          idx++;
        }
      };
    }
  });

  R('musica-cuarto', {
    grupo: 'musica', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      const mix = mezcla(c, b, 0.5);
      const acordes = [
        [n('re3'), n('fa3'), n('la3'), n('re4')],
        [n('sib2'), n('fa3'), n('sib3'), n('re4')],
        [n('fa3'), n('la3'), n('do4'), n('fa4')],
        [n('do3'), n('sol3'), n('do4'), n('mi4')]
      ];
      let idx = 0;
      return {
        tick: (desde) => {
          const a = acordes[Math.floor(idx / 2) % acordes.length];
          if (idx % 2 === 0){
            HH.colchon(c, mix, { t: desde, dur: 5.4, f: [a[0] / 2, a[1]], vol: 0.04, a: 1.5, r: 2, corte: 700, tipo: 'sine' });
          }
          [0, 0.75, 1.3].forEach((dt, i) => {
            HH.teclas(c, mix, { t: desde + dt, f: a[(i * 2 + (idx % 2)) % 4], vol: 0.1 - i * 0.015, dur: 2.8 });
          });
          idx++;
        }
      };
    }
  });

  R('musica-final', {
    grupo: 'musica', dur: 38,
    fn: (c, b, t, op, HH) => {
      const mix = mezcla(c, b, 0.5);
      const cuerpo = HH.cuerpoGuitarra(c, mix);
      const acordes = [
        { t: 0, f: [n('la2'), n('mi3'), n('la3'), n('do4')], p: [n('la3'), n('do4'), n('mi4'), n('la4')], v: 0.05 },
        { t: 7, f: [n('fa2'), n('do3'), n('fa3'), n('la3')], p: [n('fa3'), n('la3'), n('do4'), n('fa4')], v: 0.06 },
        { t: 14, f: [n('do3'), n('sol3'), n('do4'), n('mi4')], p: [n('do4'), n('mi4'), n('sol4'), n('do5')], v: 0.065 },
        { t: 21, f: [n('sol2'), n('re3'), n('sol3'), n('si3')], p: [n('sol3'), n('si3'), n('re4'), n('sol4')], v: 0.07 },
        { t: 28, f: [n('do3'), n('sol3'), n('do4'), n('mi4'), n('re5')], p: [n('do4'), n('mi4'), n('sol4'), n('do5')], v: 0.08 }
      ];
      acordes.forEach((a, i) => {
        const dur = i === acordes.length - 1 ? 9.5 : 8;
        HH.colchon(c, mix, { t: t + a.t, dur: dur, f: a.f, vol: a.v, a: 1.8, r: 2.6, corte: 1000 });
        const pasos = i === acordes.length - 1 ? 8 : 5;
        for (let k = 0; k < pasos; k++){
          HH.teclas(c, mix, { t: t + a.t + 0.8 + k * 1.15, f: a.p[k % 4] * (k > 3 ? 2 : 1), vol: 0.09 + i * 0.005, dur: 2.6 });
        }
        if (i >= 2){
          [0, 1, 2, 3].forEach((q) => {
            HH.cuerda(c, cuerpo, { t: t + a.t + 0.3 + q * 0.28, f: a.f[q], dur: 3, vol: 0.14, brillo: 0.5, amort: 1.1 });
          });
        }
      });
      HH.campana(c, mix, { t: t + 30.2, f: n('do6'), vol: 0.09, dur: 4 });
      HH.campana(c, mix, { t: t + 30.9, f: n('sol6'), vol: 0.07, dur: 4 });
      HH.campana(c, mix, { t: t + 31.7, f: n('mi7'), vol: 0.05, dur: 4 });
    }
  });
  function palmada(c, d, t, vol, pan){
    const f = az(1700, 3000);
    H.rafaga(c, d, { t: t, dur: az(0.025, 0.045), filtro: ['bandpass', f, 1.2], vol: vol, a: 0.001, pan: pan });
    H.rafaga(c, d, { t: t + 0.004, dur: 0.05, ruido: 'rosa', filtro: ['bandpass', 900, 0.9], vol: vol * 0.4, a: 0.002, pan: pan });
  }

  function grito(c, d, t, vol, pan){
    const f = az(380, 620);
    H.tono(c, d, { t: t, dur: az(0.35, 0.6), f: f, f2: f * az(1.4, 1.9), glide: 0.28, tipo: 'sawtooth', vol: vol, a: 0.05, filtro: ['bandpass', 1200, 1.4], pan: pan });
  }

  function silbidoPublico(c, d, t, vol, pan){
    const f = az(2300, 3100);
    H.tono(c, d, { t: t, dur: 0.7, f: f, f2: f * 1.25, glide: 0.5, vol: vol, a: 0.06, vib: [6, 40], pan: pan });
  }

  R('amb-concierto', {
    grupo: 'ambiente', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      zumbidoBajo(c, ses, b.seco, t0, { vol: 0.05, f: 240 });
      viento(c, ses, b.seco, t0, { vol: 0.055, f: 760 });
      viento(c, ses, b.seco, t0, { vol: 0.03, f: 1500 });
      const d = mezcla(c, b, 0.35);
      return {
        tick: (desde, hasta) => {
          const ventana = hasta - desde;
          if (Math.random() < 0.55){
            const t = desde + az(0, ventana - 0.8);
            const n1 = Math.floor(az(3, 9));
            const pan = az(-0.8, 0.8);
            for (let i = 0; i < n1; i++) palmada(c, d, t + i * az(0.12, 0.22), az(0.012, 0.024), pan);
          }
          if (Math.random() < 0.28) grito(c, d, desde + az(0, ventana - 0.7), az(0.012, 0.022), az(-0.8, 0.8));
          if (Math.random() < 0.1) silbidoPublico(c, d, desde + az(0, ventana - 0.9), 0.012, az(-0.7, 0.7));
        }
      };
    }
  });

  R('ovacion', {
    grupo: 'escena', dur: 9,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.4);
      HH.rafaga(c, d, { t: t, dur: 8, ruido: 'rosa', filtro: ['bandpass', 900, 0.6], vol: 0.22, a: 0.9, suave: 0.45 });
      HH.rafaga(c, d, { t: t, dur: 8, ruido: 'rosa', filtro: ['bandpass', 2400, 0.7], vol: 0.08, a: 1.2, suave: 0.4 });
      for (let i = 0; i < 90; i++){
        const k = Math.pow(Math.random(), 1.6);
        palmada(c, d, t + 0.2 + k * 6.8, az(0.04, 0.07) * (1 - k * 0.6), az(-0.9, 0.9));
      }
      for (let i = 0; i < 9; i++) grito(c, d, t + 0.3 + Math.random() * 4.5, az(0.025, 0.04), az(-0.9, 0.9));
      silbidoPublico(c, d, t + 0.9, 0.025, -0.5);
      silbidoPublico(c, d, t + 1.8, 0.022, 0.6);
    }
  });

  R('musica-concierto', {
    grupo: 'musica', bucle: true, dur: 60,
    fn: (c, b, t0, op, HH, ses) => {
      const mix = mezcla(c, b, 0.3);
      const bateria = mezcla(c, b, 0.12);
      const cuerpo = HH.cuerpoGuitarra(c, mix);
      const acordes = [
        { raiz: n('do2'), notas: [n('do3'), n('mi3'), n('sol3'), n('do4'), n('mi4')] },
        { raiz: n('sol2'), notas: [n('sol2'), n('re3'), n('sol3'), n('si3'), n('re4')] },
        { raiz: n('la2'), notas: [n('la2'), n('mi3'), n('la3'), n('do4'), n('mi4')] },
        { raiz: n('fa2'), notas: [n('fa2'), n('do3'), n('fa3'), n('la3'), n('do4')] }
      ];
      let idx = 0;
      return {
        tick: (desde) => {
          const a = acordes[idx % acordes.length];
          const batir = idx >= 2;
          [0, 0.75, 1, 1.5].forEach((dt, i) => {
            HH.rasgueo(c, cuerpo, {
              t: desde + dt + az(0, 0.01), notas: a.notas, sep: 0.02, dur: 1.5,
              vol: (i === 0 ? 0.12 : 0.09), brillo: 0.6, abajo: i !== 2
            });
          });
          HH.colchon(c, mix, { t: desde, dur: 2.6, f: [a.raiz * 2, a.raiz * 3], vol: 0.03, a: 0.5, r: 1.2, corte: 900 });
          HH.tono(c, bateria, { t: desde, dur: 0.6, f: a.raiz, vol: 0.15, a: 0.01, filtro: ['lowpass', 400, 0.7] });
          HH.tono(c, bateria, { t: desde + 1, dur: 0.5, f: a.raiz * 1.5, vol: 0.1, a: 0.01, filtro: ['lowpass', 400, 0.7] });
          if (batir){
            [0, 1].forEach((q) => {
              const tt = desde + q;
              HH.tono(c, bateria, { t: tt, dur: 0.2, f: 130, f2: 42, glide: 0.12, vol: 0.22, a: 0.002 });
              HH.rafaga(c, bateria, { t: tt, dur: 0.02, filtro: ['highpass', 2000, 0.5], vol: 0.05, a: 0.001 });
              const ts = tt + 0.5;
              HH.rafaga(c, bateria, { t: ts, dur: 0.16, ruido: 'blanco', filtro: ['bandpass', 1900, 0.9], vol: 0.12, a: 0.002 });
              HH.tono(c, bateria, { t: ts, dur: 0.1, f: 210, f2: 150, vol: 0.14, a: 0.002 });
            });
            for (let i = 0; i < 8; i++){
              HH.rafaga(c, bateria, { t: desde + i * 0.25, dur: i % 2 ? 0.025 : 0.04, filtro: ['highpass', 7000, 0.6], vol: i % 2 ? 0.022 : 0.034, a: 0.001, pan: 0.3 });
            }
          }
          idx++;
        }
      };
    }
  });

  R('titulo-final', {
    grupo: 'escena', dur: 11,
    fn: (c, b, t, op, HH) => {
      const d = mezcla(c, b, 0.5);
      const cuerpo = HH.cuerpoGuitarra(c, d);
      [['do2', 0], ['sol2', 0.12], ['do3', 0.24], ['mi3', 0.36], ['sol3', 0.48], ['do4', 0.6], ['mi4', 0.72], ['sol4', 0.84]].forEach((p, i) => {
        HH.cuerda(c, cuerpo, { t: t + 0.2 + p[1], f: n(p[0]), dur: 4.6, vol: 0.24 - i * 0.012, brillo: 0.58, amort: 1.05 });
      });
      HH.colchon(c, d, { t: t, dur: 9.5, f: [n('do3'), n('sol3'), n('do4'), n('mi4')], vol: 0.09, a: 1.4, r: 4, corte: 1400 });
      HH.colchon(c, d, { t: t + 1.2, dur: 8.5, f: [n('mi4'), n('sol4'), n('do5')], vol: 0.04, a: 2, r: 4, corte: 1800 });
      HH.tono(c, d, { t: t, dur: 3.8, f: 65.4, vol: 0.16, a: 0.5 });
      [['do6', 1.2], ['sol6', 1.65], ['mi6', 2.1], ['do7', 2.7]].forEach((p) => {
        HH.campana(c, d, { t: t + p[1], f: n(p[0]), vol: 0.09, dur: 4 });
      });
      HH.rafaga(c, d, { t: t, dur: 2.6, ruido: 'rosa', filtro: ['bandpass', 500, 0.8], barrido: 3200, vol: 0.06, a: 1.6, suave: 0.5 });
    }
  });
})();
