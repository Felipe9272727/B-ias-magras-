// Thumbnail do vídeo das IAs no Minecraft (1280×720): a caixa de vidro da arena (quadro do replay) com as seis IAs,
// "6 IAs · 3 HORAS" e "SÓ 1 SOBREVIVE", as cabeças das skins embaixo e a espada de ferro (textura oficial). Sem emoji.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT} from '../theme';
import {Cabeca, IAS} from './ui';

const contorno = (c: string, w: number) => Array.from({length: 16}, (_, i) => `${Math.round(Math.cos((i / 16) * Math.PI * 2) * w)}px ${Math.round(Math.sin((i / 16) * Math.PI * 2) * w)}px 0 ${c}`).join(',');

export const ThumbMC: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Img src={staticFile('mc/thumb/arena.png')} style={{position: 'absolute', left: -60, top: -40, width: 1400, height: 788, imageRendering: 'pixelated', filter: 'saturate(1.3) contrast(1.1)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 62%, rgba(120,0,0,0.75) 100%)'}} />
    <div style={{position: 'absolute', left: 40, top: 18, fontFamily: FONT.comic, fontSize: 150, color: '#fff', lineHeight: 0.95, letterSpacing: 3, textShadow: contorno('#000', 9)}}>
      6 IAs <span style={{color: '#ffe14d'}}>·</span> 3 HORAS
    </div>
    <div style={{position: 'absolute', left: 44, top: 168, fontFamily: FONT.pixel, fontSize: 34, color: '#ffe14d', textShadow: contorno('#000', 4)}}>pra se preparar pra arena</div>
    <div style={{position: 'absolute', right: 24, bottom: 172, transform: 'rotate(-6deg)', background: '#d01818', border: '8px solid #fff', padding: '4px 28px', boxShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>
      <div style={{fontFamily: FONT.comic, fontSize: 104, color: '#fff', letterSpacing: 3, lineHeight: 1}}>SÓ 1 SOBREVIVE</div>
    </div>
    <Img src={staticFile('mc/thumb/iron_sword.png')} style={{position: 'absolute', right: 70, top: 160, width: 240, height: 240, imageRendering: 'pixelated', transform: 'rotate(-10deg)', filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.7)) drop-shadow(8px 8px 0 #000)'}} />
    <div style={{position: 'absolute', left: 40, bottom: 26, display: 'flex', gap: 16}}>
      {Object.keys(IAS).map((n) => (
        <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
          <div style={{boxShadow: `0 0 0 6px ${IAS[n].cor}`}}><Cabeca nome={n} tam={78} /></div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 24, color: '#fff', textShadow: contorno('#000', 3)}}>{n}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
