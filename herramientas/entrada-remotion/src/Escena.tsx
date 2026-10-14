import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Juan } from "./juan/Juan";
import EJ = require("../../../comic/entrada-juan.js");
import datos from "../../../comic/assets/entrada/juan.json";

const modelo = EJ.crear(datos);
const K: number = modelo.escala;
const SENTIDO: number = modelo.sentido;
const ORIGEN: number[] = modelo.origen;

const PLATO = staticFile("capitulo-n1/scene1/img/fondo.png");
const CIELO = staticFile("capitulo-n1/scene1/img/cielo.jpg");
const NUBES = staticFile("capitulo-n1/scene1/img/nubes.png");
const TV = staticFile("tv.png");
const TOCON = staticFile("entrada/tocon.svg");
const oclusorDer = staticFile("entrada/oclusor-der.png");

const ESC_PLATO = 1600 / 2268;
const TV_W = 146;
const TV_H = (TV_W * 925) / 1566;
const TV_GIRO = -2;
const BOTON = [0.895, 0.886];

const TV_C: [number, number] = [582.3, 674.4];
const girar = (x: number, y: number, g: number): [number, number] => {
  const r = (g * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
const rel = girar((BOTON[0] - 0.5) * TV_W, (BOTON[1] - 0.5) * TV_H, TV_GIRO);
const botonMundo: [number, number] = [TV_C[0] + rel[0], TV_C[1] + rel[1]];
const llegada = modelo.posicionLlegada(botonMundo, 60, 50);
const plan = modelo.plan({ der: 1600, boton: botonMundo, llegada, vel: 1.25 });
const T = plan.T;
const Y_SUELO: number = llegada.Y;

const TOCON_ANCHO = 160;
const TOCON_ESC_Y = 0.62;
const TOPE_Y = TV_C[1] + TV_H / 2 - 4;
const TOCON_TOP = TOPE_Y - 23 * TOCON_ESC_Y;

const estrella = (r1: number, r2: number, n: number) => {
  let p = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    p += `${(60 + Math.cos(a) * r * 1.1).toFixed(1)},${(50 + Math.sin(a) * r * 0.92).toFixed(1)} `;
  }
  return p.trim();
};
const ESTRELLA = estrella(52, 36, 9);

const suave = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  return t * t * (3 - 2 * t);
};
const cubica = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const Escena: React.FC<{ zoom?: boolean }> = ({ zoom = true }) => {
  const frame = useCurrentFrame();
  const st = plan.estado(frame);

  const z = zoom ? 1 + 3.6 * cubica((frame - T.zoom0) / (T.zoom1 - T.zoom0)) : 1;
  const cx = TV_C[0];
  const cy = TV_C[1];
  const e = cubica((frame - T.zoom0) / (T.zoom1 - T.zoom0));
  const centroX = 800 + (cx - 800) * e;
  const centroY = 450 + (cy - 450) * e;
  const camara = `translate(${800 - centroX * z}px, ${450 - centroY * z}px) scale(${z})`;

  const cabeza = modelo.aMundo(ORIGEN[0] + 14, 90, st.X, st.Y);

  const retira = st.retira;
  const encendida = suave((frame - (T.toca + 3)) / 6);
  const destello = Math.max(0, 1 - Math.abs(frame - (T.toca + 8)) / 7) * 0.9;

  const pie = modelo.aMundo(ORIGEN[0] + 6, ORIGEN[1] + 14, st.X, Y_SUELO);

  return (
    <AbsoluteFill style={{ background: "#6a9683", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1600,
          height: 900,
          transformOrigin: "0 0",
          transform: camara,
        }}
      >
        <Img src={CIELO} style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 600 }} />
        <Img src={NUBES} style={{ position: "absolute", left: -frame * 0.6, top: 0, height: 346 }} />
        <Img src={PLATO} style={{ position: "absolute", left: 0, top: -28, width: 1600 }} />

        <svg width={1600} height={900} viewBox="0 0 1600 900" style={{ position: "absolute", left: 0, top: 0 }}>
          <ellipse cx={TV_C[0]} cy={TOCON_TOP + 112 - 4} rx={108} ry={14} fill="#0b1a08" opacity={0.34} />
          <ellipse cx={pie[0] + 4} cy={Y_SUELO + 4} rx={62 * (1 - 0.18 * Math.min(1, (800 - st.Y) / 20))} ry={10} fill="#0b1a08" opacity={0.34 * retira} />
        </svg>

        <Img
          src={TOCON}
          style={{
            position: "absolute",
            left: TV_C[0] - TOCON_ANCHO / 2,
            top: TOCON_TOP,
            width: TOCON_ANCHO,
            height: 180 * TOCON_ESC_Y,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: TV_C[0] - TV_W / 2,
            top: TV_C[1] - TV_H / 2,
            width: TV_W,
            height: TV_H,
            transform: `rotate(${TV_GIRO}deg)`,
          }}
        >
          <Img src={TV} style={{ position: "absolute", left: 0, top: 0, width: TV_W, height: TV_H }} />
          <div
            style={{
              position: "absolute",
              left: TV_W * 0.07,
              top: TV_H * 0.13,
              width: TV_W * 0.7,
              height: TV_H * 0.72,
              borderRadius: 8,
              background: "radial-gradient(ellipse at 50% 50%, #e9fff6 0%, #8fd9c1 55%, #3f8f7c 100%)",
              opacity: encendida * 0.95 + destello * 0.05,
            }}
          />
        </div>

        <svg width={1600} height={900} viewBox="0 0 1600 900" style={{ position: "absolute", left: 0, top: 0 }}>
          <g
            opacity={retira}
            transform={`translate(${st.X} ${st.Y}) scale(${SENTIDO * K * st.escalaX} ${K * st.escalaY}) translate(${-ORIGEN[0]} ${-ORIGEN[1]})`}
          >
            <Juan capas={datos.capas} M={st.M} vari={st.vari} boca={datos.boca} />
          </g>
          {st.burbuja > 0.01 && (
            <g
              transform={`translate(${cabeza[0] + 14} ${cabeza[1] - 80}) scale(${st.burbuja * 1.12}) translate(-60 -50)`}
              opacity={Math.min(1, st.burbuja * 1.4)}
            >
              <polygon points={ESTRELLA} fill="#efe0a8" stroke="#0b0b05" strokeWidth={4} strokeLinejoin="round" />
              <text x={60} y={68} textAnchor="middle" fontFamily="Arial Black, Impact, sans-serif" fontWeight={900} fontSize={54} fill="#0b0b05">
                !
              </text>
            </g>
          )}
        </svg>

        <Img
          src={oclusorDer}
          style={{
            position: "absolute",
            left: 1625 * ESC_PLATO,
            top: 1000 * ESC_PLATO - 28,
            width: 643 * ESC_PLATO,
            height: 336 * ESC_PLATO,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: "#ffffff", opacity: destello * 0.25, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 10, top: 10, font: "14px sans-serif", color: "#fff" }}>{frame}</div>
    </AbsoluteFill>
  );
};

