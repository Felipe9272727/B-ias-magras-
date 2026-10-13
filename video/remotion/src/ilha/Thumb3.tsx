// Thumbnail 1280×720 do vídeo 3: na Cornucópia, o Opus ergue a lança atrás do Haiku 2, que olha pra câmera sem ver.
// Bonecos e cenário são os do próprio vídeo (placa da cena p224); o Opus tem pose própria (ilha/blender/cena/thumb3.py).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';

const QW = 1280, QH = 1032, PE: [number, number] = [0.5, 0.8563];

const Sprite: React.FC<{src: string; n: number; k: number; x: number; pe: number; s: number; flip?: boolean; filtro?: string}> = ({src, n, k, x, pe, s, flip, filtro}) => (
  <div style={{position: 'absolute', left: x - PE[0] * QW * s, top: pe - PE[1] * QH * s, width: QW * s, height: QH * s, overflow: 'hidden', transform: flip ? 'scaleX(-1)' : undefined, filter: filtro}}>
    <Img src={staticFile(src)} style={{position: 'absolute', left: -k * QW * s, top: 0, width: QW * n * s, height: QH * s, maxWidth: 'none'}} />
  </div>
);

const Selo: React.FC<{txt: string; cor: string}> = ({txt, cor}) => (
  <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: cor, padding: '6px 16px', borderRadius: 12, border: '4px solid #fff', whiteSpace: 'nowrap', boxShadow: '0 6px 0 #0008'}}>{txt}</div>
);

export const Thumb3: React.FC = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile('ilha/3d/p224_0.jpg')} style={{position: 'absolute', width: 1500, height: 844, left: -110, top: -70, objectFit: 'cover', filter: 'brightness(.78) saturate(1.2)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 62% 62%, #0000 0px, #0000 220px, #000b 640px)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, #c4000055 0%, #0000 45%)'}} />

      {/* o traidor, na sombra, com brilho vermelho */}
      <Sprite src="ilha/thumb/opus_lanca_55.png" n={1} k={0} x={350} pe={610} s={0.74} filtro="brightness(.8) drop-shadow(0 0 26px #ff2a2a)" />
      {/* o Haiku 2, sem ver nada */}
      <Sprite src="ilha/bonecos/haiku2/falar_45.png" n={12} k={0} x={900} pe={615} s={0.74} filtro="drop-shadow(0 10px 0 #0007)" />
      <div style={{position: 'absolute', left: 975, top: 215, fontFamily: FONT.comic, fontSize: 110, color: '#fff', ...strokeText(10), transform: 'rotate(10deg)'}}>?</div>

      <div style={{position: 'absolute', left: 60, top: 300}}><Selo txt="Opus" cor="#e0782a" /></div>
      <div style={{position: 'absolute', left: 830, top: 150}}><Selo txt="Haiku 2" cor="#8a5ad0" /></div>

      <div style={{position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic, fontSize: 132, lineHeight: 0.95, color: '#ff3b30', letterSpacing: 3, textShadow: '0 10px 0 #000a', ...strokeText(16)}}>
        SÓ UMA SAI VIVA
      </div>
      <div style={{position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', background: '#111d', padding: '10px 22px', borderRadius: 12, border: '4px solid #ff3b30', letterSpacing: 2}}>12 IAs · JOGOS VORAZES</div>
      </div>
    </AbsoluteFill>
  );
};
