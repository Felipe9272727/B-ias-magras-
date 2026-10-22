// Prévia dos 8 aldeões lado a lado: troca de expressão a cada 24 quadros, gestos variando,
// e a transformação em lobisomem indo de 0 a 1 entre os quadros 150 e 210.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ALDEOES, Aldeao, AldeaoSprite, ExpressaoA, GestoA} from './Aldeoes';

const IDS: Aldeao[] = ['padeira', 'ferreiro', 'boticaria', 'lenhador', 'costureira', 'pescador', 'moleiro', 'bardo'];
const EXPRESSOES: ExpressaoA[] = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando', 'dormindo'];
const GESTOS: GestoA[] = ['nenhum', 'apontar', 'bracos_cruzados', 'maos_pra_cima', 'acenar'];

const ALTURA = 400;
const CHAO = 760; // y dos pés
const LARGURA_CASA = 1920 / IDS.length;

export const PreviaLAldeoes: React.FC = () => {
  const frame = useCurrentFrame();
  const troca = Math.floor(frame / 24);
  const gestoTroca = Math.floor(frame / 48);
  const lobo = interpolate(frame, [150, 210], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#fbe9cf 0%, #f4d7aa 100%)', overflow: 'hidden'}}>
      {/* chão */}
      <div style={{position: 'absolute', left: 0, right: 0, top: CHAO, height: 1080 - CHAO, background: '#c9a46b'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: CHAO - 6, height: 6, background: '#8a6a3a'}} />

      {IDS.map((id, i) => {
        const x = LARGURA_CASA * (i + 0.5);
        const expressao = EXPRESSOES[(i + troca) % EXPRESSOES.length];
        const gesto = GESTOS[(i + gestoTroca) % GESTOS.length];
        // falam em turnos diferentes, para não ficarem todos com a boca aberta ao mesmo tempo
        const falando = (frame + i * 17) % 60 < 36;
        return (
          <React.Fragment key={id}>
            <div style={{position: 'absolute', left: x, top: CHAO}}>
              <AldeaoSprite
                id={id}
                expressao={expressao}
                falando={falando}
                t={frame}
                altura={ALTURA}
                virado={i % 2 === 0 ? 'direita' : 'esquerda'}
                lobo={lobo}
                gesto={gesto}
                noite={lobo * 0.4}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: x - 120,
                width: 240,
                top: CHAO + 22,
                textAlign: 'center',
                fontFamily: 'sans-serif',
                fontWeight: 900,
                fontSize: 40,
                color: '#14141f',
              }}
            >
              {ALDEOES[id].nome}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
