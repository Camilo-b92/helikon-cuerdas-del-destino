import React from "react";

type Capa = { i: number; x: string };
type Props = { capas: Capa[]; M: Record<number, number[]>; vari: Record<number, string>; boca: Record<string, string> };

export const Juan: React.FC<Props> = ({ capas, M, vari, boca }) => (
  <g>
    {capas.map((c) => {
      const v = vari[c.i];
      const xml = c.i === 16 && v && boca[v] ? boca[v] : c.x;
      return <g key={c.i} transform={`matrix(${M[c.i].join(",")})`} dangerouslySetInnerHTML={{ __html: xml }} />;
    })}
  </g>
);
