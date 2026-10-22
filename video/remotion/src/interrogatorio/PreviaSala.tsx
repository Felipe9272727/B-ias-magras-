// Prévia da sala de interrogatório: dois retângulos coloridos no lugar dos personagens, câmera indo de um lado ao outro,
// zoom variando, a lâmpada piscando uma vez e um tremor de impacto. Só para testar o cenário (Sala.tsx).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ASSENTO, Camera, SalaInterrogatorio} from './Sala';

// bloco colorido com o tamanho de um personagem (ASSENTO.altura), para marcar a posição
const Bloco: React.FC<{cor: string; nome: string}> = ({cor, nome}) => (
  <div
    style={{
      width: ASSENTO.altura,
      height: ASSENTO.altura,
      background: cor,
      border: '6px solid #14141f',
      borderRadius: 24,
      boxSizing: 'border-box',
      display: 'grid',
      placeItems: 'center',
      color: '#fff',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 900,
      fontSize: 48,
    }}
  >
    {nome}
  </div>
);

export const PreviaSala: React.FC = () => {
  const f = useCurrentFrame();

  // câmera: começa no detetive (-1), passa pelo geral (0) e termina no suspeito (1)
  const x = interpolate(f, [0, 100, 200, 240], [-1, 0, 0.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // zoom: entra, abre e fecha de novo
  const zoom = interpolate(f, [0, 120, 240], [1, 1.6, 1.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const camera: Camera = {x, zoom};

  // lâmpada: apaga e acende de novo uma vez (quadros 140 a 152)
  const luz = f >= 140 && f < 146 ? 0.1 : f >= 146 && f < 152 ? 0.5 : 1;

  // tremor de impacto (quadros 170 a 200), caindo até zero
  const tremor = f >= 170 && f < 200 ? 1 - (f - 170) / 30 : 0;

  return (
    <SalaInterrogatorio
      camera={camera}
      detetive={<Bloco cor="#e0457b" nome="DET" />}
      suspeito={<Bloco cor="#3fb8d6" nome="SUS" />}
      monitor={
        <div style={{width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#8cf5a0', fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700}}>
          BPM 92
        </div>
      }
      relogio="21:43"
      luz={luz}
      tremor={tremor}
    />
  );
};
