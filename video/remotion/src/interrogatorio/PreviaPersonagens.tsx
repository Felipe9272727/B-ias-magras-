// Prévia dos 6 personagens lado a lado (240 quadros), para conferir expressões, gestos e estresse.
// A cada 24 quadros todos trocam de expressão (percorrem as 10); metade do tempo estão falando;
// o estresse sobe ao longo do tempo; e o gesto muda a cada 60 quadros.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';
import {IA, IAS, Expressao, Personagem} from './Personagens';

const EXPRESSOES: Expressao[] = [
  'neutro',
  'confiante',
  'nervoso',
  'suando',
  'bravo',
  'chocado',
  'rindo',
  'pensando',
  'culpado',
  'desconfiado',
];
const ORDEM: IA[] = ['gpt', 'claude', 'deepseek', 'glm', 'minimax', 'qwen'];
const GESTOS = ['mao_no_queixo', 'bater_mesa', 'apontar', 'cruzar_bracos'] as const;

export const PreviaPersonagens: React.FC = () => {
  const f = useCurrentFrame();
  const expressao = EXPRESSOES[Math.floor(f / 24) % EXPRESSOES.length];
  const falando = f % 60 < 30;
  const estresse = Math.min(1, f / 220);
  const acao = GESTOS[Math.floor(f / 60) % GESTOS.length];

  return (
    <AbsoluteFill style={{background: '#20282a'}}>
      {ORDEM.map((ia, i) => {
        const x = 160 + i * 320;
        return (
          <div key={ia} style={{position: 'absolute', left: x, top: 800, width: 0, height: 0}}>
            <Personagem
              ia={ia}
              expressao={expressao}
              falando={falando}
              t={f}
              virado={i < 3 ? 'direita' : 'esquerda'}
              altura={400}
              estresse={estresse}
              acao={acao}
            />
            <div
              style={{
                position: 'absolute',
                left: -160,
                top: 26,
                width: 320,
                textAlign: 'center',
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 40,
                color: IAS[ia].cor,
              }}
            >
              {IAS[ia].nome}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
