// Varanda (BALCONY) de Halloween: faixa comprida com piso escuro avermelhado, guarda-corpo, telescópio e
// antena nas pontas, abóboras na grade, caveira e teias. O meio fica livre para o nome da sala.
import React from 'react';
import {Abobora, Caveira, L, Piso, type SalaProps, Teia, Vela} from './comum';

// pilares (balaústres) do guarda-corpo entre x0 e x1
const Grade: React.FC<{x0: number; x1: number}> = ({x0, x1}) => {
  const xs: number[] = [];
  for (let x = x0; x <= x1; x += 30) xs.push(x);
  return (
    <g>
      {xs.map((x) => <rect key={x} x={x} y={24} width={8} height={144} fill="#8a96a3" stroke={L} strokeWidth={3} />)}
    </g>
  );
};

export const SalaVaranda: React.FC<SalaProps> = ({r}) => {
  const w = r.w, h = r.h;
  return (
    <g transform={`translate(${r.x},${r.y})`}>
      <Piso id="var_piso" r={{...r, x: 0, y: 0, w, h}} a="#4a2f35" b="#3d262c" tam={48} />
      {/* guarda-corpo: barras por toda a largura, pilares só nas pontas (o meio fica livre para o nome) */}
      <rect x={0} y={10} width={w} height={12} fill="#8a96a3" stroke={L} strokeWidth={5} />
      <rect x={0} y={168} width={w} height={12} fill="#8a96a3" stroke={L} strokeWidth={5} />
      <Grade x0={0} x1={270} />
      <Grade x0={790} x1={w} />

      {/* telescópio na ponta da esquerda */}
      <path d="M130 118 L104 178 M130 118 L156 178 M130 118 L130 178" stroke={L} strokeWidth={5} fill="none" />
      <g transform="translate(130,100) rotate(-25)">
        <rect x={-14} y={-11} width={90} height={22} rx={6} fill="#d9b44a" stroke={L} strokeWidth={5} />
        <circle cx={76} cy={0} r={11} fill="#7ad0ff" stroke={L} strokeWidth={4} />
      </g>

      {/* antena na ponta da direita */}
      <path d={`M${w - 120} 170 L${w - 120} 60`} stroke={L} strokeWidth={6} />
      <path d={`M${w - 150} 60 Q${w - 120} 108 ${w - 90} 60 Z`} fill="#c8d2dc" stroke={L} strokeWidth={4} />
      <circle cx={w - 120} cy={40} r={5} fill="#ff4d4d" stroke={L} strokeWidth={2} />

      {/* abóboras na grade e caveira no chão */}
      <Abobora x={230} y={96} s={0.7} />
      <Abobora x={w - 260} y={100} s={0.8} />
      <Caveira x={w - 60} y={128} s={1.1} />
      <Vela x={200} y={150} s={1.1} />
      <Vela x={w - 200} y={150} s={1.1} />

      {/* teias nas duas pontas de cima */}
      <Teia x={0} y={0} r={120} />
      <Teia x={w} y={0} r={120} rot={90} />
    </g>
  );
};
