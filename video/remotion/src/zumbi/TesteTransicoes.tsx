// Prévia das peças de Halloween (Transicoes.tsx). Cada trecho: fundo colorido de cenário + componente.
// Quadros: 0-43 aranha, 44-87 fantasma, 88-131 morcegos, 132-251 vinheta (120), 252-401 cartão (150), 402-581 comentários (180).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Transicao, VinhetaHalloween, CartaoFim, PopupsComentarios, DUR_TRANS} from './Transicoes';
import {Personagem} from './Personagem';

const Cenario: React.FC<{f: number; n: number}> = ({f, n}) => {
  const cores = [['#3b6a8a', '#2a4a66'], ['#8a5a3b', '#664a2a']];
  const c = cores[f < 22 ? 0 : 1];
  void n;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${c[0]}, ${c[1]})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, background: 'repeating-linear-gradient(90deg,#00000022 0 80px,#00000000 80px 160px)'}} />
      <div style={{position: 'absolute', left: 500 + f * 3, top: 760}}><Personagem cor="Azul" estado="humano" f={f} s={150} andando /></div>
    </AbsoluteFill>
  );
};

const COMS = [
  {autor: 'joaozinho_gamer', texto: 'Faz o modo zumbi com o Qwen contra o GPT, quero ver o caos total!'},
  {autor: 'Maria Luiza', texto: 'O vídeo mais engraçado do canal, a IA que fingiu ser humana me matou de rir demais, continua assim por favor, não para nunca mais de fazer esse tipo de vídeo, valeu Felipe!'},
  {autor: 'zumbiFan99', texto: 'Quero ver o impostor virar zumbi'},
  {autor: 'Ana', texto: 'Primeiro!'},
  {autor: 'lucas.br', texto: 'Esse especial de Halloween ficou absurdo, o fantasma assustando o tripulante foi muito bom'},
  {autor: 'Pedro_H', texto: 'Põe mais abóbora!'},
  {autor: 'camila', texto: 'Eu torci pelo Verde o vídeo inteiro e ele foi mordido no último minuto, nunca mais confio em IA'},
  {autor: 'xX_sombra_Xx', texto: 'Nota 10, vídeo de Halloween perfeito'},
];

export const TesteTransicoes: React.FC = () => {
  const f = useCurrentFrame();
  const T = DUR_TRANS;
  if (f < 3 * T) {
    const i = Math.floor(f / T), lf = f - i * T;
    return (<AbsoluteFill><Cenario f={lf} n={i} /><Transicao tipo={(['aranha', 'fantasma', 'morcegos'] as const)[i]} f={lf} /></AbsoluteFill>);
  }
  const g = f - 3 * T;
  return (
    <AbsoluteFill>
      <Cenario f={f} n={0} />
      {g < 120 ? <VinhetaHalloween f={g} dur={120} /> : null}
      {g >= 120 && g < 270 ? <CartaoFim f={g - 120} dur={150} titulo="AMANHECEU" sub="3 humanos x 5 zumbis" partida={2} zumbis={5} vivos={[{cor: 'Azul', modelo: 'Claude Haiku'}, {cor: 'Rosa', modelo: 'Gemini Flash'}, {cor: 'Amarelo', modelo: 'Qwen 3.8 27B'}]} /> : null}
      {g >= 270 ? <PopupsComentarios f={g - 270} dur={180} comentarios={COMS} /> : null}
    </AbsoluteFill>
  );
};
