// Among Us 4: detalhes de chão da nave (faixas de aviso e anéis de segurança perto dos motores e do reator).
// São só enfeites pintados no piso: não bloqueiam caminho nem entram no verificador de posições (checar_props.ts),
// então as posições dos objetos continuam as da v3 (LAYOUT3 em Props3.tsx).
import React from 'react';
import {NAVE} from './mapa';
import {TILE, type Sala} from './spec';

type Decal = {sala: Sala; tipo: 'aviso' | 'anel'; x: number; y: number; w: number; h: number};

// x, y, w, h em casas, relativos ao canto da sala. Em 'anel', (x, y) é o centro e w é o diâmetro.
export const DECALS4: Decal[] = [
  // anel de contenção em volta do núcleo do reator
  {sala: 'Reator', tipo: 'anel', x: 7.3, y: 9.2, w: 6.4, h: 6.4},
  // faixas de aviso logo abaixo dos motores (na frente de onde a turbina sopra)
  {sala: 'MotorSuperior', tipo: 'aviso', x: 8.4, y: 4.4, w: 6, h: 0.5},
  {sala: 'MotorInferior', tipo: 'aviso', x: 7.3, y: 5.7, w: 5, h: 0.5},
  // faixa de aviso na frente do painel elétrico
  {sala: 'Eletrica', tipo: 'aviso', x: 6.8, y: 1.9, w: 3.6, h: 0.4},
];

// Enfeites de chão da v4 (desenhados logo acima do piso e abaixo dos objetos)
export const Decals4: React.FC = React.memo(() => (
  <>
    {DECALS4.map((d, i) => {
      const r = NAVE.salas[d.sala].rect;
      const x = (r.c + d.x) * TILE, y = (r.r + d.y) * TILE;
      if (d.tipo === 'anel') {
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={(d.w * TILE) / 2} fill="none" stroke="#ffd84d" strokeWidth={5} strokeDasharray="18 12" opacity={0.5} />
            <circle cx={x} cy={y} r={(d.w * TILE) / 2 - 10} fill="none" stroke="#000" strokeWidth={2} opacity={0.25} />
          </g>
        );
      }
      return (
        <g key={i}>
          <rect x={x} y={y} width={d.w * TILE} height={d.h * TILE} fill="url(#ar4-aviso)" stroke="#141a22" strokeWidth={2} />
        </g>
      );
    })}
  </>
));
