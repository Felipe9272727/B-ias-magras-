// Prévia da abertura do Among Us 2: os comentários pedindo e depois a comparação Among Us 1 x 2.
import React from 'react';
import {Sequence} from 'remotion';
import {AU2Comentarios, Comentario} from './Comentarios';
import {AU2AntesDepois} from './AntesDepois';

export const COMENTARIOS: Comentario[] = [
  {usuario: '@CAFEZIN-K', texto: 'Caraca mano que vídeo bom... seria legal se colocasse o chatgpt o grok e o gemini', destaque: 'o chatgpt o grok e o gemini', likes: 13},
  {usuario: '@Futosaunte', texto: 'Muito bom. Faz outras funções e bota mais jogadores com 3 impostores.', destaque: 'mais jogadores com 3 impostores', likes: 1, quando: 'há 4 dias'},
  {usuario: '@noelirocha1925', texto: 'Caramba mano, muito bom! Quero ver mais ias no among Ias kkkkkkkkk', destaque: 'mais ias', likes: 1, quando: 'há 4 dias'},
  {usuario: '@CAFEZIN-K', texto: 'algumas IA não pensavam tipo: nossa tem um tripulante nessa sala, então eu não deveria sair do duto agora', destaque: 'não deveria sair do duto agora', likes: 13},
  {usuario: '@LuísAmongUs777', texto: 'Impostor medroso ❌ Impostor vegano ✅', likes: 11},
  {usuario: '@ThallysSouza-u6z', texto: 'Mn, eu seria melhor q ela', likes: 3},
];

export const AU2AberturaPrevia: React.FC = () => (
  <>
    <Sequence durationInFrames={290}>
      <AU2Comentarios comentarios={COMENTARIOS} passo={42} />
    </Sequence>
    <Sequence from={290} durationInFrames={260}>
      <AU2AntesDepois antes="amongus2/antes.jpg" depois="amongus2/depois.jpg" dur={260} />
    </Sequence>
  </>
);
