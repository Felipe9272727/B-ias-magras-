// Shorts do Among Us 2 (1080×1920): "O Detetive falou a verdade e foi expulso. Duas vezes."
// Trechos do vídeo final (out/among_us_2.mp4) cortados em public/short_au2/*.mp4; aqui só o enquadramento vertical:
// nas reuniões aparece o painel do chat (já é quase vertical), nas ejeções o centro da tela.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';

type Trecho = {arq: string; dur: number; tipo: 'chat' | 'centro'; rotulo: string; nota?: string};
export const TRECHOS: Trecho[] = [
  {arq: 'a1', dur: 268, tipo: 'chat', rotulo: 'PARTIDA 2 · O DETETIVE'},
  {arq: 'a2', dur: 415, tipo: 'chat', rotulo: 'PARTIDA 2 · "ISSO NÃO EXISTE"'},
  {arq: 'b', dur: 283, tipo: 'centro', rotulo: 'EXPULSO'},
  {arq: 'c', dur: 462, tipo: 'chat', rotulo: 'PARTIDA 3 · OUTRO DETETIVE'},
  {arq: 'd', dur: 315, tipo: 'chat', rotulo: 'PENSAMENTO SECRETO DO ASSASSINO', nota: '"o pior é que ela acertou: o assassino do Marrom fui eu"'},
  {arq: 'e', dur: 285, tipo: 'centro', rotulo: 'EXPULSO DE NOVO'},
];
const FINAL = 75;
export const duracaoShortAU2 = TRECHOS.reduce((a, t) => a + t.dur, 0) + FINAL;

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// recorte do quadro 1920×1080: chat = painel da direita (x 1190..1880, y 40..1040); centro = faixa do meio
const Recorte: React.FC<{t: Trecho}> = ({t}) => {
  const src = staticFile(`short_au2/${t.arq}.mp4`);
  if (t.tipo === 'chat') {
    const k = 1000 / 690; // painel de 690 px vira 1000 px de largura
    return (
      <div style={{position: 'absolute', left: 40, top: 360, width: 1000, height: 1000 * k, overflow: 'hidden', borderRadius: 28, boxShadow: '0 20px 60px #000c'}}>
        <OffthreadVideo src={src} style={{position: 'absolute', left: -1190 * k, top: -40 * k, width: 1920 * k, height: 1080 * k}} />
      </div>
    );
  }
  const k = 1080 / 1080;
  return (
    <div style={{position: 'absolute', left: 0, top: 420, width: 1080, height: 1080, overflow: 'hidden'}}>
      <OffthreadVideo src={src} style={{position: 'absolute', left: -420 * k, top: 0, width: 1920 * k, height: 1080 * k}} />
    </div>
  );
};

const Topo: React.FC<{rotulo: string}> = ({rotulo}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', transform: `scale(${0.85 + 0.15 * e})`}}>
      <span style={{display: 'inline-block', padding: '10px 26px', borderRadius: 16, background: '#ff2a2a', border: '5px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#fff', WebkitTextStroke: '1px #000'}}>{rotulo}</span>
    </div>
  );
};

export const ShortAU2: React.FC = () => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  const f = useCurrentFrame();
  let ini = 0;
  const seqs = TRECHOS.map((t) => {
    const de = ini;
    ini += t.dur;
    return {t, de};
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1b2440, #05070d 80%)'}}>
      {/* título fixo no alto */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 6px 0 #000'}}>
        O DETETIVE FALOU A VERDADE E FOI EXPULSO
      </div>
      {seqs.map(({t, de}) => (
        <Sequence key={t.arq} from={de} durationInFrames={t.dur}>
          <Recorte t={t} />
          <Topo rotulo={t.rotulo} />
          {t.nota && (
            <div style={{position: 'absolute', left: 50, right: 50, bottom: 120, padding: '22px 28px', borderRadius: 24, background: '#fffdf2', border: '6px solid #c00', fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1.2, color: '#111', textAlign: 'center'}}>{t.nota}</div>
          )}
        </Sequence>
      ))}
      {/* fechamento */}
      <Sequence from={ini} durationInFrames={FINAL}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 84, color: '#ffd84d', WebkitTextStroke: '3px #000', textAlign: 'center', lineHeight: 1.05, opacity: interpolate(f - ini, [0, 8], [0, 1], cl)}}>DUAS VEZES.</div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 48, color: '#fff', textAlign: 'center', padding: '0 60px'}}>12 IAs no Among Us · vídeo completo no canal</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
