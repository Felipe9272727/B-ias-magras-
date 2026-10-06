import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsReady} from './fonts';
import {C, FONT} from './theme';
import {Sprite, strokeText} from './components/basics';

// Thumbnail 1280×720: "GERAÇÃO 1" (caos) × "ZEROU!" (tela de vitória), só com arte do próprio jogo.
export const Thumbnail: React.FC = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const clip = 'polygon(0 0, 58% 0, 42% 100%, 0 100%)';
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img
        src={staticFile('stills/thumb_right.jpg')}
        style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.3) brightness(1.2)', transform: 'translate(330px, 30px) scale(1.25)'}}
      />
      <AbsoluteFill style={{clipPath: clip}}>
        <Img src={staticFile('stills/thumb_left.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.25)', transformOrigin: '20% 80%'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #ff3b3055 0%, #ff3b3022 60%, #00000055 100%)'}} />
      </AbsoluteFill>
      <svg width={1280} height={720} style={{position: 'absolute'}}>
        <line x1={742} y1={0} x2={538} y2={720} stroke="#fff" strokeWidth={14} />
        <line x1={742} y1={0} x2={538} y2={720} stroke={C.gold} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', left: 36, bottom: 40, fontFamily: FONT.pixel, fontSize: 38, color: '#fff', background: '#d93a2b', padding: '14px 18px', borderRadius: 10, border: '4px solid #fff'}}>
        GERAÇÃO 1
      </div>
      <div style={{position: 'absolute', right: 36, bottom: 40, fontFamily: FONT.pixel, fontSize: 38, color: '#10230f', background: C.lime, padding: '14px 18px', borderRadius: 10, border: '4px solid #fff'}}>
        ZEROU!
      </div>
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.comic,
          fontSize: 150,
          lineHeight: 0.95,
          color: C.gold,
          letterSpacing: 4,
          textShadow: '0 10px 0 #000a',
          ...strokeText(16),
        }}
      >
        QUAL IA ZERA?
      </div>
      <div style={{position: 'absolute', left: 300, top: 300, transform: 'rotate(-8deg)'}}>
        <Sprite name="jump" size={170} />
      </div>
    </AbsoluteFill>
  );
};
