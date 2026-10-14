// "Among Us 1 x Among Us 2": a imagem do vídeo anterior e a do novo, com uma barra que desliza revelando o novo.
import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

const Selo: React.FC<{txt: string; cor: string; lado: 'esq' | 'dir'; opacidade: number}> = ({txt, cor, lado, opacidade}) => (
  <div style={{position: 'absolute', top: 40, [lado === 'esq' ? 'left' : 'right']: 40, padding: '10px 26px', borderRadius: 14, background: cor, border: '5px solid #000',
    fontFamily: FONT.comic, fontSize: 64, color: '#fff', letterSpacing: 2, WebkitTextStroke: '2px #000', opacity: opacidade, boxShadow: '0 8px 0 #000a'}}>
    {txt}
  </div>
);

export const AU2AntesDepois: React.FC<{antes: string; depois: string; dur?: number}> = ({antes, depois, dur = 240}) => {
  const f = useCurrentFrame();
  // a barra vai e volta uma vez e para no meio... e depois revela o novo inteiro
  const x = interpolate(f, [20, 70, 110, 150, dur - 50], [0.98, 0.25, 0.75, 0.5, 0.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const px = x * 1920;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile(depois)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: px, height: 1080, overflow: 'hidden'}}>
        <Img src={staticFile(antes)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, filter: 'saturate(.85)'}} />
      </div>
      <div style={{position: 'absolute', left: px - 5, top: 0, width: 10, height: 1080, background: '#fff', boxShadow: '0 0 30px #fff'}} />
      <div style={{position: 'absolute', left: px - 38, top: 502, width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '6px solid #000', display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 34}}>⇆</div>
      <Selo txt="AMONG US 1" cor="#6b7280" lado="esq" opacidade={interpolate(x, [0.15, 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <Selo txt="AMONG US 2" cor="#e0352b" lado="dir" opacidade={interpolate(x, [0.7, 0.85], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};
