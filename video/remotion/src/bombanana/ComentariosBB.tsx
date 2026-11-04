// Abertura do BOMBANANA!: os comentários reais do @AlgoFracassadoYT pedindo o vídeo (youtube/comentarios_mine),
// no mesmo visual de folha de comentários dos outros episódios. Sem emoji (regra do canal).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';

const COMENTARIOS: Comentario[] = [
  {usuario: '@AlgoFracassadoYT', quando: 'há 11 dias', likes: 3, texto: 'Felipe! Coloca as IAS para desarmarem uma bomba, mas, um é cego, outro é surdo, e outro é mudo! Que nem o jogo Bombanana!', destaque: 'um é cego, outro é surdo, e outro é mudo'},
  {usuario: '@AlgoFracassadoYT', quando: 'há 12 dias', texto: 'Imagina se eu apareçer na parte dos comentários do próximo vídeo, hein? Mãe, to famoso!', destaque: 'Mãe, to famoso!'},
  {usuario: '@AlgoFracassadoYT', quando: 'há 7 dias', texto: 'Dia 3 pedindo para o Felipex fazer um vídeo de Bombanana', destaque: 'Dia 3 pedindo'},
  {usuario: '@AlgoFracassadoYT', quando: 'há 7 dias', texto: '@felipexx0007 Não acredito que voce vai realmente usar minha ideia! Valeu Felipexx!', destaque: 'vai realmente usar minha ideia', selo: {texto: 'PEDIDO ATENDIDO', cor: '#1f8f3a'}},
];

export const DUR_COMENT_BB = 660;
export const BBComentariosAbertura: React.FC = () => (
  <AbsoluteFill>
    <AU2Comentarios comentarios={COMENTARIOS} passo={150} />
    <Sequence from={15}><Audio src={staticFile('bb/voz/c00.mp3')} /></Sequence>
    <Sequence from={345}><Audio src={staticFile('bb/voz/c01.mp3')} /></Sequence>
  </AbsoluteFill>
);
