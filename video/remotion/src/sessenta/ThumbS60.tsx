// Thumbnail do "60 Segundos das IAs" (1280×720): o abrigo 2D com a família de verdade do vídeo, a Juju riscada (o GPT,
// o DeepSeek e o Claude deixaram ela pra trás na coleta), o alarme vermelho, o cronômetro gigante e as 4 IAs.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FONT} from '../theme';

const IAS = [
  {n: 'GPT', c: '#0b7a5f'},
  {n: 'DEEPSEEK', c: '#4d6bfe'},
  {n: 'MINIMAX', c: '#e8336d'},
  {n: 'CLAUDE', c: '#d97757'},
];

const H = 560; // altura de cada boneco (o PNG é 600×900)
const W = (H * 600) / 900;
const FAMILIA = [
  {p: 'filha', v: 'base', x: 1150, z: 5, fora: true},
  {p: 'filho', v: 'base', x: 1010, z: 2},
  {p: 'mae', v: 'base', x: 870, z: 3},
  {p: 'pai', v: 'cansado', x: 700, z: 4},
];

const Boneco: React.FC<{p: string; v: string; x: number; z: number; fora?: boolean}> = ({p, v, x, z, fora}) => (
  <div style={{position: 'absolute', left: x - W / 2, top: 720 - H + 40, width: W, height: H, zIndex: z}}>
    <Img src={staticFile(`sessenta/abrigo2d/personagens/${p}/${v}.png`)} style={{width: W, height: H, filter: fora ? 'grayscale(1) brightness(0.8)' : 'drop-shadow(0 8px 10px #000a)'}} />
    {fora && (
      <>
        <div style={{position: 'absolute', left: W / 2 - 130, top: 120, fontFamily: FONT.display, fontWeight: 900, fontSize: 260, lineHeight: 1, color: '#e01b1b', textShadow: '0 6px 0 #000'}}>✕</div>
        <div style={{position: 'absolute', left: W / 2 - 215, top: 60, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: '#e01b1b', padding: '6px 14px', borderRadius: 10, border: '4px solid #fff', transform: 'rotate(-6deg)', whiteSpace: 'nowrap'}}>FICOU LÁ FORA</div>
      </>
    )}
  </div>
);

export const ThumbS60: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <Img src={staticFile('sessenta/abrigo2d/fundo.png')} style={{position: 'absolute', inset: 0, width: 1280, height: 720}} />
    <Img src={staticFile('sessenta/abrigo2d/frente.png')} style={{position: 'absolute', inset: 0, width: 1280, height: 720}} />
    {/* alarme: vinheta vermelha e escurecido à esquerda pro texto */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 68% 45%, transparent 30%, #c4000077 75%, #6b0000ee 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #000e 0%, #000b 30%, #0003 48%, transparent 56%)'}} />
    {FAMILIA.map((b) => <Boneco key={b.p} {...b} />)}
    {/* cronômetro */}
    <div style={{position: 'absolute', left: 48, top: 36, fontFamily: FONT.display, fontWeight: 900, fontSize: 150, lineHeight: 1, color: '#fff', background: '#e01b1b', padding: '4px 34px 10px', borderRadius: 26, border: '8px solid #fff', boxShadow: '0 10px 0 #000a', letterSpacing: -4, zIndex: 10}}>0:09</div>
    <div style={{position: 'absolute', left: 52, top: 262, fontFamily: FONT.display, fontWeight: 900, fontSize: 104, lineHeight: 0.95, color: '#ffd21f', textShadow: '0 7px 0 #000, 0 0 30px #000', letterSpacing: -2, zIndex: 10}}>
      SALVE A<br />FAMÍLIA
    </div>
    <div style={{position: 'absolute', left: 56, top: 478, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', background: '#000', padding: '6px 18px', borderRadius: 12, transform: 'rotate(-2deg)', zIndex: 10}}>
      ☢️ ANTES DA BOMBA
    </div>
    {/* as 4 IAs */}
    <div style={{position: 'absolute', left: 48, bottom: 40, display: 'flex', gap: 12, zIndex: 10}}>
      {IAS.map((ia, i) => (
        <div key={ia.n} style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: ia.c, padding: '8px 16px', borderRadius: 12, border: '4px solid #fff', boxShadow: '0 5px 0 #000a', transform: `rotate(${i % 2 ? 2 : -2}deg)`}}>{ia.n}</div>
      ))}
    </div>
  </AbsoluteFill>
);
