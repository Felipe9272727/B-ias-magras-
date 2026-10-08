// Thumbnail 1280×720 do vídeo 2: o Preto (inocente) no centro, os dois impostores atrás dele,
// com a nave do próprio vídeo ao fundo e o selo de cada modelo.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {Arte} from './nave/Arte';
import {NAVE} from './nave/mapa';
import {TILE} from './nave/spec';
import {Crewmate} from './Crewmate';

const W = NAVE.cols * TILE;
const H = NAVE.rows * TILE;

const Selo: React.FC<{txt: string; cor: string}> = ({txt, cor}) => (
  <div style={{fontFamily: FONT.pixel, fontSize: 20, color: '#fff', background: cor, padding: '8px 12px', borderRadius: 8, border: '3px solid #fff', whiteSpace: 'nowrap'}}>{txt}</div>
);

export const Thumb2: React.FC = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  // câmera no Refeitório
  const s = 0.9;
  const cx = 2712;
  const cy = 620;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${640 - cx * s}px, ${360 - cy * s}px) scale(${s})`}}>
        <Arte />
      </div>
      {/* luzes apagadas: só um círculo de visão em volta do Preto */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 66%, #0000 0px, #0000 170px, #000c 330px, #000f 620px)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #b0000040 0%, #0000 40%)'}} />

      {/* impostores na sombra, com olhos/visor vermelho */}
      <div style={{position: 'absolute', left: 70, top: 250, filter: 'brightness(0.55) drop-shadow(0 0 22px #ff2a2a)'}}>
        <Crewmate cor="Verde" size={300} />
      </div>
      <div style={{position: 'absolute', right: 70, top: 250, filter: 'brightness(0.55) drop-shadow(0 0 22px #ff2a2a)'}}>
        <Crewmate cor="Amarelo" size={300} virado />
      </div>
      <div style={{position: 'absolute', left: 92, top: 210}}><Selo txt="DeepSeek" cor="#2f6fff" /></div>
      <div style={{position: 'absolute', right: 110, top: 210}}><Selo txt="Haiku" cor="#e0782a" /></div>

      {/* o Preto, inocente, no centro */}
      <div style={{position: 'absolute', left: 640 - 170, top: 300, filter: 'drop-shadow(0 12px 0 #0008)'}}>
        <Crewmate cor="Preto" size={340} />
      </div>
      <div style={{position: 'absolute', left: 640 + 120, top: 300, fontFamily: FONT.comic, fontSize: 120, color: '#fff', ...strokeText(10), transform: 'rotate(10deg)'}}>?!</div>

      <div
        style={{
          position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic,
          fontSize: 132, lineHeight: 0.95, color: '#ff3b30', letterSpacing: 3, textShadow: '0 10px 0 #000a', ...strokeText(16),
        }}
      >
        AS IAs MENTIRAM
      </div>
      <div style={{position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 30, color: '#fff', background: '#111d', padding: '12px 18px', borderRadius: 10, border: '4px solid #ff3b30'}}>8 IAs · AMONG US</div>
      </div>
    </AbsoluteFill>
  );
};
