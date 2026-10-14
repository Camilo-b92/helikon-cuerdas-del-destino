(function(raiz, fabrica){
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.EntradaCaminante = api;
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  const FPS = 25;
  const CICLO = 18;
  const AMPLITUD = 34;
  const ESCALA = 1.9;
  const SENTIDO = -1;
  const INCLINA_PRESION = 11;
  const PUNTA_MANO = [5.4, 12.6];

  const I = {
    torso: 15, cuello: 28, cabeza: 18, pelvis: 21,
    musloI: 20, piernaI: 22, zapatoI: 10, musloD: 23, piernaD: 29, zapatoD: 24,
    brazoI: 8, antebrazoI: 9, manoI: 7, brazoD: 25, antebrazoD: 27, manoD: 26,
    cola: 30, capul: 4, boca: 16, ojoI: 13, ojoD: 14, pupilaI: 11, pupilaD: 12,
    cejaI: 6, cejaD: 5, oreja: 19, nariz: 17
  };

  const PARPADEOS = [1.25, 3.3, 5.1, 7.9, 9.7, 11.4, 13.2];

  function limitar(v, a, b){
    return Math.min(b, Math.max(a, v));
  }

  function suave(v){
    const x = limitar(v, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function mezcla(a, b, p){
    return a + (b - a) * p;
  }

  function rebote(v){
    const x = limitar(v, 0, 1);
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  }

  function mult(A, B){
    return [
      A[0] * B[0] + A[2] * B[1],
      A[1] * B[0] + A[3] * B[1],
      A[0] * B[2] + A[2] * B[3],
      A[1] * B[2] + A[3] * B[3],
      A[0] * B[4] + A[2] * B[5] + A[4],
      A[1] * B[4] + A[3] * B[5] + A[5]
    ];
  }

  function aplicar(M, x, y){
    return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
  }

  function rotar(px, py, grados){
    const r = grados * Math.PI / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py];
  }

  function hermite(nodos, f){
    if (f <= nodos[0][0]) return nodos[0][1];
    const ult = nodos[nodos.length - 1];
    if (f >= ult[0]) return ult[1];
    let i = 0;
    while (nodos[i + 1][0] < f) i++;
    const a = nodos[i];
    const b = nodos[i + 1];
    const h = b[0] - a[0];
    const u = (f - a[0]) / h;
    const u2 = u * u;
    const u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * a[2] + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * b[2];
  }

  function crear(datos){
    const capas = datos.capas;
    const origen = datos.origen;
    const porInd = {};
    capas.forEach((c) => { porInd[c.i] = c; });

    const orden = [];
    const hecho = {};
    function visitar(i){
      if (hecho[i]) return;
      const c = porInd[i];
      if (c.p && porInd[c.p]) visitar(c.p);
      hecho[i] = true;
      orden.push(i);
    }
    capas.forEach((c) => visitar(c.i));

    const REST = {};
    capas.forEach((c) => { REST[c.i] = Math.atan2(c.l[1], c.l[0]) * 180 / Math.PI; });

    function resolver(pose){
      const M = {};
      for (let k = 0; k < orden.length; k++){
        const i = orden[k];
        const c = porInd[i];
        let L = c.l;
        const d = pose.rot[i] || 0;
        if (d !== 0 && c.a){
          const p = aplicar(c.l, c.a[0], c.a[1]);
          L = mult(rotar(p[0], p[1], d), c.l);
        }
        const t = pose.tr && pose.tr[i];
        if (t) L = mult([1, 0, 0, 1, t[0], t[1]], L);
        const e = pose.esc && pose.esc[i];
        if (e && e !== 1 && c.a){
          const p = aplicar(L, c.a[0], c.a[1]);
          L = mult([e, 0, 0, e, p[0] - e * p[0], p[1] - e * p[1]], L);
        }
        const ey = pose.escY && pose.escY[i];
        if (ey !== undefined && ey !== 1 && c.a){
          const p = aplicar(L, c.a[0], c.a[1]);
          L = mult([1, 0, 0, ey, 0, p[1] - ey * p[1]], L);
        }
        M[i] = c.p && M[c.p] ? mult(M[c.p], L) : L;
      }
      return M;
    }

    function pierna(t){
      const muslo = -AMPLITUD * Math.sin(t);
      const u = ((t / (2 * Math.PI)) % 1 + 1) % 1;
      const enAire = u >= 0.75 || u < 0.25;
      const s = u >= 0.75 ? (u - 0.75) / 0.5 : (u + 0.25) / 0.5;
      const rodilla = enAire
        ? 6 + 46 * Math.pow(Math.sin(Math.PI * limitar(s, 0, 1)), 1.3)
        : 6 + 4 * Math.sin(Math.PI * limitar((u - 0.25) / 0.5, 0, 1));
      const pie = -(muslo + rodilla)
        + (enAire ? 8 * Math.sin(Math.PI * limitar(s, 0, 1)) - 6 * (1 - suave(limitar(s * 2, 0, 1))) : 0)
        + (u > 0.55 && u < 0.75 ? 10 * suave((u - 0.55) / 0.2) : 0);
      return { muslo: muslo, rodilla: rodilla, pie: pie };
    }

    function poseCaminar(fase, inclina){
      const t = fase * 2 * Math.PI;
      const D = pierna(t);
      const Z = pierna(t + Math.PI);
      const aD = 24 * Math.sin(t);
      const aI = -aD;
      const codo = (a) => -(12 + 20 * limitar(-a / 24 + 0.35, 0, 1));
      const rot = {};
      rot[I.torso] = inclina + 1.5 * Math.sin(2 * t);
      rot[I.cuello] = -1.5;
      rot[I.cabeza] = -inclina * 0.6 - 1.2 * Math.sin(2 * t + 0.6);
      rot[I.pelvis] = -2 * Math.sin(t);
      rot[I.musloD] = D.muslo - REST[I.musloD];
      rot[I.piernaD] = D.rodilla - REST[I.piernaD];
      rot[I.zapatoD] = D.pie - REST[I.zapatoD];
      rot[I.musloI] = Z.muslo - REST[I.musloI];
      rot[I.piernaI] = Z.rodilla - REST[I.piernaI];
      rot[I.zapatoI] = Z.pie - REST[I.zapatoI];
      rot[I.brazoD] = aD * 0.8;
      rot[I.antebrazoD] = codo(aD);
      rot[I.brazoI] = aI * 0.8;
      rot[I.antebrazoI] = codo(aI);
      rot[I.manoD] = 0;
      rot[I.manoI] = 0;
      return { rot: rot };
    }

    function poseQuieto(){
      const rot = {};
      [I.torso, I.cuello, I.cabeza, I.pelvis, I.brazoD, I.antebrazoD, I.brazoI, I.antebrazoI, I.manoD, I.manoI].forEach((i) => { rot[i] = 0; });
      [I.musloD, I.piernaD, I.zapatoD, I.musloI, I.piernaI, I.zapatoI].forEach((i) => { rot[i] = -REST[i]; });
      return { rot: rot };
    }

    function poseAlcance(){
      const q = poseQuieto();
      q.rot[I.torso] = INCLINA_PRESION;
      q.rot[I.cuello] = -2;
      q.rot[I.cabeza] = 6;
      return q;
    }

    function mezclarPoses(a, b, w){
      const rot = {};
      Object.keys(a.rot).forEach((k) => { rot[k] = mezcla(a.rot[k], b.rot[k] === undefined ? 0 : b.rot[k], w); });
      Object.keys(b.rot).forEach((k) => { if (rot[k] === undefined) rot[k] = mezcla(0, b.rot[k], w); });
      return { rot: rot };
    }

    function tobillo(pose, ind){
      const M = resolver(pose);
      const c = porInd[ind];
      return aplicar(M[ind], c.a[0], c.a[1]);
    }

    function sueloY(pose){
      const M = resolver(pose);
      let max = -Infinity;
      [I.zapatoI, I.zapatoD].forEach((ind) => {
        const b = porInd[ind].b;
        const pts = [[b[0], b[1]], [b[0] + b[2], b[1]], [b[0], b[1] + b[3]], [b[0] + b[2], b[1] + b[3]]];
        pts.forEach((q) => {
          const p = aplicar(M[ind], q[0], q[1]);
          if (p[1] > max) max = p[1];
        });
      });
      return max;
    }

    const tabla = (function(){
      const t = [{ dx: 0, dy: 0 }];
      let x = 0;
      let prev = [tobillo(poseCaminar(0, 4), I.zapatoI), tobillo(poseCaminar(0, 4), I.zapatoD)];
      for (let k = 1; k <= CICLO; k++){
        const pose = poseCaminar(k / CICLO, 4);
        const cur = [tobillo(pose, I.zapatoI), tobillo(pose, I.zapatoD)];
        const mid = (k - 0.5) / CICLO;
        const pl = mid >= 0.25 && mid < 0.75 ? 1 : 0;
        x += prev[pl][0] - cur[pl][0];
        t.push({ dx: x, dy: 0 });
        prev = cur;
      }
      const y0 = sueloY(poseCaminar(0, 4));
      for (let k = 0; k <= CICLO; k++) t[k].dy = y0 - sueloY(poseCaminar(k / CICLO, 4));
      return t;
    })();

    const AVANCE = tabla[CICLO].dx;

    function enCiclo(p){
      const c = Math.floor(p / CICLO);
      const r = p - c * CICLO;
      const k = Math.min(CICLO - 1, Math.floor(r));
      const a = tabla[k];
      const b = tabla[k + 1];
      const m = r - k;
      return { dx: c * AVANCE + a.dx + (b.dx - a.dx) * m, dy: a.dy + (b.dy - a.dy) * m, fase: r / CICLO };
    }

    function punta(pose){
      const M = resolver(pose);
      return aplicar(M[I.manoD], PUNTA_MANO[0], PUNTA_MANO[1]);
    }

    function hombro(pose){
      const M = resolver(pose);
      const c = porInd[I.brazoD];
      return aplicar(M[I.brazoD], c.a[0], c.a[1]);
    }

    function resolverBrazo(base, objetivo){
      function coste(a, b, m){
        const rot = {};
        Object.keys(base.rot).forEach((k) => { rot[k] = base.rot[k]; });
        rot[I.brazoD] = a;
        rot[I.antebrazoD] = b;
        rot[I.manoD] = m;
        const p = punta({ rot: rot });
        return Math.hypot(p[0] - objetivo[0], p[1] - objetivo[1]) + Math.abs(m) * 0.02 + Math.max(0, b + 10) * 0.05;
      }
      let mejor = { a: 0, b: 0, m: 0, c: Infinity };
      for (let a = -170; a <= 40; a += 5){
        for (let b = -150; b <= 40; b += 5){
          const c = coste(a, b, 0);
          if (c < mejor.c) mejor = { a: a, b: b, m: 0, c: c };
        }
      }
      let paso = 4;
      const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
      for (let it = 0; it < 60; it++){
        let mov = false;
        for (let k = 0; k < dirs.length; k++){
          const d = dirs[k];
          const a = mejor.a + d[0] * paso;
          const b = mejor.b + d[1] * paso;
          const m = mejor.m + d[2] * paso;
          const c = coste(a, b, m);
          if (c < mejor.c){
            mejor = { a: a, b: b, m: m, c: c };
            mov = true;
          }
        }
        if (!mov) paso *= 0.5;
        if (paso < 0.02) break;
      }
      return { brazo: mejor.a, ante: mejor.b, mano: mejor.m };
    }

    function aMundo(rx, ry, X, Y){
      return [X + SENTIDO * ESCALA * (rx - origen[0]), Y + ESCALA * (ry - origen[1])];
    }

    function aRig(x, y, X, Y){
      return [origen[0] + (x - X) / (SENTIDO * ESCALA), origen[1] + (y - Y) / ESCALA];
    }

    function alcance(adelante, abajo){
      const h = hombro(poseAlcance());
      return {
        dx: SENTIDO * ESCALA * (h[0] - origen[0]),
        dy: ESCALA * (h[1] - origen[1]),
        adelante: adelante,
        abajo: abajo
      };
    }

    function posicionLlegada(boton, adelante, abajo){
      const a = alcance(adelante, abajo);
      return {
        X: boton[0] - SENTIDO * adelante - a.dx,
        Y: boton[1] - abajo - a.dy
      };
    }

    function plan(op){
      const vel = op.vel || 1.25;
      const llegada = op.llegada;
      const boton = op.boton;
      const PLL = CICLO * 24;
      const dxLL = enCiclo(PLL).dx;
      const posX = (p) => llegada.X + SENTIDO * ESCALA * (enCiclo(p).dx - dxLL);

      let m = 4;
      while (m > 1 && posX(PLL - 9 * m) > op.der - 75) m -= 1;
      const PPARADA = PLL - 9 * m;
      let n = 2;
      while (n < 32 && posX(PPARADA - 9 * n) < op.der + 110) n += 1;
      const PINI = PPARADA - 9 * n;

      const T = {};
      T.frena0 = Math.round((PPARADA - 8 - PINI) / vel);
      T.para = T.frena0 + 14;
      T.pop0 = T.para + 3;
      T.burbuja0 = T.pop0 + 3;
      T.burbuja1 = T.burbuja0 + 30;
      T.camina0 = T.burbuja1 + 5;
      T.llega = T.camina0 + 12 * m + 2;
      T.alcanza0 = T.llega + 8;
      T.toca = T.alcanza0 + 15;
      T.suelta = T.toca + 12;
      T.zoom0 = T.toca - 3;
      T.zoom1 = T.zoom0 + 74;
      T.fin = T.zoom1 + 12;

      const nodos = [
        [0, PINI, vel],
        [T.frena0, PPARADA - 8, vel],
        [T.para, PPARADA, 0],
        [T.camina0, PPARADA, 0],
        [T.llega, PLL, 0]
      ];

      const base = poseAlcance();
      const bFin = resolverBrazo(base, aRig(boton[0], boton[1], llegada.X, llegada.Y));
      const bApoya = resolverBrazo(base, aRig(boton[0] + SENTIDO * 5, boton[1], llegada.X, llegada.Y));

      function caminando(f){
        if (f < T.para - 2) return 1;
        if (f < T.camina0 - 5) return 1 - suave((f - (T.para - 2)) / 8);
        return Math.min(suave((f - (T.camina0 - 5)) / 8), 1 - suave((f - (T.llega - 6)) / 9));
      }

      function estado(f){
        const p = hermite(nodos, f);
        const c = enCiclo(p);
        const w = caminando(f);
        const quieto = poseQuieto();
        const respira = Math.sin(f / FPS * 2 * Math.PI * 0.55);
        quieto.rot[I.torso] = 0.6 * respira;
        quieto.rot[I.cabeza] = -0.5 * respira;
        const pose = mezclarPoses(quieto, poseCaminar(c.fase, 4), w);
        const rot = pose.rot;
        const tr = {};
        const esc = {};
        const escY = {};
        const vari = {};

        const s = f < T.pop0 ? 0 : suave((f - T.pop0) / 3) * (1 - suave((f - (T.burbuja1 - 4)) / 16));
        const curioso = suave((f - (T.burbuja1 - 4)) / 14) * (1 - suave((f - (T.llega + 10)) / 14));

        if (s > 0.01){
          rot[I.torso] += -7 * s;
          rot[I.cabeza] += -6 * s;
          rot[I.cuello] += -2 * s;
          rot[I.brazoD] = mezcla(rot[I.brazoD], -26, s);
          rot[I.antebrazoD] = mezcla(rot[I.antebrazoD], -34, s);
          rot[I.brazoI] = mezcla(rot[I.brazoI], -16, s);
          rot[I.antebrazoI] = mezcla(rot[I.antebrazoI], -24, s);
          tr[I.cejaD] = [0, -2.6 * s];
          tr[I.cejaI] = [0, -2.6 * s];
          esc[I.ojoD] = 1 + 0.2 * s;
          esc[I.ojoI] = 1 + 0.2 * s;
          esc[I.pupilaD] = 1 - 0.28 * s;
          esc[I.pupilaI] = 1 - 0.28 * s;
          if (s > 0.5) vari[I.boca] = 'o';
        }

        if (curioso > 0.01){
          rot[I.torso] += 7 * curioso;
          rot[I.cabeza] += 9 * curioso + Math.sin(f * 0.32) * 1.4 * curioso;
          const ce = -1.4 * curioso * (1 - s);
          tr[I.cejaD] = [0, (tr[I.cejaD] ? tr[I.cejaD][1] : 0) + ce];
          tr[I.cejaI] = [0, (tr[I.cejaI] ? tr[I.cejaI][1] : 0) + ce];
          if (s < 0.5) vari[I.boca] = 'abierta';
        }

        const empuja = suave((f - (T.toca - 4)) / 4) * (1 - suave((f - (T.toca + 2)) / 6));
        const wBrazo = suave((f - T.alcanza0) / (T.toca - T.alcanza0 - 4)) * (1 - suave((f - T.suelta) / 12));
        if (wBrazo > 0){
          rot[I.brazoD] = mezcla(rot[I.brazoD], mezcla(bFin.brazo, bApoya.brazo, empuja), wBrazo);
          rot[I.antebrazoD] = mezcla(rot[I.antebrazoD], mezcla(bFin.ante, bApoya.ante, empuja), wBrazo);
          rot[I.manoD] = mezcla(0, mezcla(bFin.mano, bApoya.mano, empuja), wBrazo);
        }

        const lean = suave((f - (T.alcanza0 - 6)) / 12) * (1 - suave((f - (T.suelta + 4)) / 14));
        if (lean > 0){
          rot[I.torso] = mezcla(rot[I.torso], INCLINA_PRESION, lean);
          rot[I.cabeza] = mezcla(rot[I.cabeza], 6, lean * 0.7);
          rot[I.cuello] = mezcla(rot[I.cuello], -2, lean);
        }

        const seg = f / FPS;
        let parpado = 1;
        for (let i = 0; i < PARPADEOS.length; i++){
          const d = Math.abs(seg - PARPADEOS[i]);
          if (d < 0.09) parpado = Math.min(parpado, 0.12 + 0.88 * (d / 0.09));
        }
        if (parpado < 1){
          escY[I.ojoD] = parpado;
          escY[I.ojoI] = parpado;
        }

        const salto = f >= T.pop0 && f < T.pop0 + 11 ? Math.sin((f - T.pop0) / 11 * Math.PI) : 0;
        const antes = f >= T.pop0 - 3 && f < T.pop0 ? suave((f - (T.pop0 - 3)) / 3) : 0;
        const aterriza = f >= T.pop0 + 11 && f < T.pop0 + 20 ? 1 - suave((f - (T.pop0 + 11)) / 9) : 0;

        const X = llegada.X + SENTIDO * ESCALA * (c.dx - dxLL);
        const Y = llegada.Y + ESCALA * c.dy * w - 16 * salto;

        const burbuja = f < T.burbuja0 ? 0 : f < T.burbuja1 ? Math.min(1, rebote((f - T.burbuja0) / 8)) : 1 - suave((f - T.burbuja1) / 5);

        const tras = f - T.para;
        const freno = tras > 0 ? Math.exp(-tras / 10) * Math.cos(tras * 0.5) : 0;
        const arranque = f >= T.camina0 ? Math.exp(-(f - T.camina0) / 8) : 0;
        rot[I.cola] = -0.75 * ((rot[I.torso] || 0) + (rot[I.cuello] || 0) + (rot[I.cabeza] || 0)) +
          w * 7 * Math.sin(c.fase * 4 * Math.PI - 1.1) - 13 * freno + 6 * arranque + 8 * salto - 4 * aterriza;

        const pose2 = { rot: rot, tr: tr, esc: esc, escY: escY };
        return {
          X: X,
          Y: Y,
          M: resolver(pose2),
          vari: vari,
          escalaX: 1 + 0.045 * antes - 0.035 * salto + 0.04 * aterriza,
          escalaY: 1 - 0.06 * antes + 0.05 * salto - 0.05 * aterriza,
          burbuja: Math.max(0, burbuja),
          sorpresa: s,
          empuja: empuja,
          saltando: salto,
          retira: 1 - suave((f - (T.toca + 12)) / 26)
        };
      }

      return { T: T, estado: estado, posX: posX, PINI: PINI, PPARADA: PPARADA, PLL: PLL };
    }

    return {
      I: I,
      capas: capas,
      origen: origen,
      escala: ESCALA,
      sentido: SENTIDO,
      fps: FPS,
      boca: datos.boca,
      vista: datos.vista,
      resolver: resolver,
      avance: AVANCE,
      posicionLlegada: posicionLlegada,
      hombro: hombro,
      aMundo: aMundo,
      aRig: aRig,
      poseAlcance: poseAlcance,
      plan: plan
    };
  }

  return { crear: crear, I: I, FPS: FPS };
});
