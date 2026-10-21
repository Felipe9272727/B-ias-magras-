// Thumbnail do Among Us 4 (1280×720): o chat secreto do impostor dizendo "MATEI O AZUL" e o Azul do lado, vivíssimo,
// com a skin que ele escolheu; o Bordô (impostor) de cartola atrás, e uma bomba explodindo no fundo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {FONT} from '../theme';

const EMPRESAS = [
  {nome: 'GPT', cor: '#10a37f'},
  {nome: 'Claude', cor: '#d97a47'},
  {nome: 'DeepSeek', cor: '#2f6bff'},
  {nome: 'GLM', cor: '#0f9d8a'},
  {nome: 'MiniMax', cor: '#e2325a'},
  {nome: 'Qwen', cor: '#6a4cff'},
];

export const ThumbAU4: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 46%, #ffb020 0%, #ff5a00 16%, #7a1206 36%, #14060a 62%, #000 100%)', overflow: 'hidden'}}>
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      {Array.from({length: 90}, (_, i) => <circle key={i} cx={(i * 7919) % 1280} cy={(i * 104729) % 720} r={1 + (i % 3) * 0.7} fill="#fff" opacity={0.25 + (i % 4) * 0.12} />)}
      {/* raios da explosão */}
      {Array.from({length: 14}, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <path key={i} d={`M920 330 L${920 + Math.cos(a - 0.08) * 900} ${330 + Math.sin(a - 0.08) * 900} L${920 + Math.cos(a + 0.08) * 900} ${330 + Math.sin(a + 0.08) * 900} Z`} fill="#ffd21f" opacity={0.12} />;
      })}
    </svg>
    {/* o impostor (Bordô) de cartola, atrás, olhando */}
    <div style={{position: 'absolute', left: 600, top: 330, transform: 'rotate(-6deg)', filter: 'brightness(0.75)'}}>
      <Crewmate4 cor="Bordo" size={230} cosmetico="cartola" roupa="smoking" />
    </div>
    {/* o Azul, vivo, de capacete e colete, com o cachorro */}
    <div style={{position: 'absolute', left: 900, top: 300, transform: 'rotate(5deg)'}}>
      <Crewmate4 cor="Azul" size={310} cosmetico="capacete" roupa="colete" pet="cachorro" />
    </div>
    {/* o chat secreto dos impostores */}
    <div style={{position: 'absolute', left: 540, top: 40, width: 600, padding: '12px 20px', background: 'rgba(40,6,10,.95)', border: '6px solid #ff3b3b', borderRadius: 22, boxShadow: '0 0 40px #ff3b3b88, 0 8px 0 #000', transform: 'rotate(-3deg)'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#ff8a8a', letterSpacing: 2}}>🔒 CHAT DOS IMPOSTORES</div>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 62, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap'}}>"MATEI O AZUL"</div>
    </div>
    <div style={{position: 'absolute', left: 1010, top: 196, whiteSpace: 'nowrap', padding: '8px 18px', background: '#fff', border: '6px solid #000', borderRadius: 26, fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#000', transform: 'rotate(6deg)', boxShadow: '0 6px 0 #000a'}}>
      TÔ VIVO 🙂
    </div>
    <div style={{position: 'absolute', left: 36, top: 26, fontFamily: FONT.display, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: '#ff2a2a', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000', letterSpacing: -2}}>
      15 IAs
    </div>
    <div style={{position: 'absolute', left: 42, top: 186, fontFamily: FONT.display, fontWeight: 900, fontSize: 74, lineHeight: 1, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>
      AMONG US 4
    </div>
    <div style={{position: 'absolute', left: 40, top: 290, display: 'flex', flexWrap: 'wrap', gap: 10, width: 500}}>
      {EMPRESAS.map((e) => (
        <span key={e.nome} style={{padding: '6px 18px', borderRadius: 14, background: e.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{e.nome}</span>
      ))}
    </div>
    <div style={{position: 'absolute', left: 40, bottom: 34, padding: '8px 20px', background: '#ffd21f', border: '5px solid #000', borderRadius: 16, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#000', transform: 'rotate(-2deg)'}}>
      💣 bombas · 👻 fantasmas · 🎲 apostas
    </div>
  </AbsoluteFill>
);
