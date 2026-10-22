// Prévia da praça (Vila.tsx) com 240 quadros: dia -> noite -> dia, câmera passeando e um uivo.
// Os aldeões aqui são retângulos coloridos, só para testar a posição e a profundidade.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CameraVila, LUGARES, PracaVila} from './Vila';

const CORES_TESTE = ['#e76f51', '#2a9d8f', '#e9c46a', '#8ab17d', '#c77dff', '#4cc9f0', '#f4a261', '#f28482'];

export const PreviaLVila: React.FC = () => {
  const f = useCurrentFrame();

  // noite: dia (0-40), anoitece (40-100), noite cheia (100-190), amanhece de volta (190-240)
  const noite = interpolate(f, [0, 40, 100, 190, 240], [0, 0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // câmera: passeia de um lado a outro e dá zoom e recua
  const camera: CameraVila = {
    x: Math.sin((f / 240) * Math.PI * 2) * 0.8,
    zoom: 1 + 0.4 * (0.5 - 0.5 * Math.cos((f / 240) * Math.PI * 2)),
  };

  // uivo: entre os quadros 150 e 205, a lua fica vermelha, aparece névoa e a tela treme
  const uivo = interpolate(f, [140, 160, 195, 210], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const aldeoes = LUGARES.map((l, i) => (
    <g key={i}>
      <rect x={-45} y={-360} width={90} height={360} fill={CORES_TESTE[i]} stroke="#14141f" strokeWidth={6} rx={8} />
    </g>
  ));

  return (
    <PracaVila
      camera={camera}
      noite={noite}
      aldeoes={aldeoes}
      fogo={1}
      tremor={uivo * 0.5}
      uivo={uivo}
    />
  );
};
