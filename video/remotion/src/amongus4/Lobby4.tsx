// Transição entre as partidas (até 5 s): a tela de lobby, com os 15 de volta (de skin) e duas IAs conversando sobre a
// partida que acabou. As falas vêm de amongus/logs4/lobby.json (cada IA só recebeu a memória daquela partida). Entra
// com uma cortina diagonal, os balões estouram em cima de quem fala e sai com a contagem "3, 2, 1" e um clarão.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {CORES} from '../amongus3/sim';
import type {Skins} from '../amongus3/Jogo';
import {FONT} from '../theme';
import {COR as PALETA} from '../amongus/Crewmate';

const NOME: Record<string, string> = {Bordo: 'Bordô'};

type Fala = {cor: string; texto: string; at: number; ate?: number};

// lugares no chão do lobby (x, y em 1920×1080); os dois que falam ficam na frente, no centro
const LUGARES: [number, number][] = [
  [260, 560], [430, 520], [600, 545], [1320, 545], [1490, 520], [1660, 560],
  [340, 700], [520, 680], [1400, 680], [1580, 700], [180, 830], [400, 860], [1520, 860], [1740, 830], [960, 520],
];

export const AU4Lobby: React.FC<{proxima: string; chat?: Fala[]; skins?: Skins; modelos?: Record<string, string>}> = ({proxima, chat = [], skins, modelos = {}}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const falam = [...new Set(chat.map((c) => c.cor))];
  const outros = CORES.filter((c) => !falam.includes(c));
  const entra = interpolate(f, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  const sai = interpolate(f, [D - 8, D], [0, 1], {extrapolateLeft: 'clamp'});
  const resta = Math.max(1, Math.ceil(((D - f) / D) * 3));
  const boneco = (c: string, x: number, y: number, size: number, k: number) => (
    <div key={c} style={{position: 'absolute', left: x - size / 2, top: y - size, transform: `translateY(${Math.sin((f + k * 7) / 9) * 4}px)`}}>
      <Crewmate4 cor={c} size={size} t={f + k * 11} virado={x > 960} cosmetico={skins?.[c]?.cabeca ?? undefined} roupa={skins?.[c]?.roupa ?? undefined} pet={skins?.[c]?.pet ?? undefined} />
    </div>
  );
  return (
    <AbsoluteFill style={{background: '#0b0f1e', overflow: 'hidden'}}>
      <AbsoluteFill style={{clipPath: `polygon(0 0, ${entra * 140}% 0, ${entra * 140 - 40}% 100%, 0 100%)`, transform: `scale(${1 + sai * 0.25})`}}>
        {/* o lobby: o casco da nave, as janelas com estrelas e o piso de grade */}
        <AbsoluteFill style={{background: 'linear-gradient(#1b2235 0%, #2a3350 38%, #4a5268 39%, #5b647c 100%)'}} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 230 + i * 400, top: 90, width: 260, height: 170, borderRadius: 30, border: '10px solid #8d97ad', background: '#030510', overflow: 'hidden'}}>
            {Array.from({length: 14}, (_, k) => <div key={k} style={{position: 'absolute', left: ((k * 97 + i * 53 - f * 6) % 300 + 300) % 300 - 20, top: (k * 37) % 150, width: 3 + (k % 3), height: 3 + (k % 3), background: '#fff', borderRadius: 9, opacity: 0.8}} />)}
          </div>
        ))}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {Array.from({length: 12}, (_, i) => <line key={i} x1={i * 180 - 100} y1={420} x2={i * 260 - 470} y2={1080} stroke="#00000033" strokeWidth={4} />)}
          {Array.from({length: 6}, (_, i) => <line key={'h' + i} x1={0} y1={440 + i * i * 22} x2={1920} y2={440 + i * i * 22} stroke="#00000033" strokeWidth={4} />)}
        </svg>
        {outros.map((c, k) => boneco(c, LUGARES[k][0], LUGARES[k][1], LUGARES[k][1] > 750 ? 150 : 120, k))}
        {falam.map((c, k) => boneco(c, 960 + (k === 0 ? -230 : 230), 940, 260, 20 + k))}
        {/* balões de quem fala */}
        {chat.map((m, k) => {
          const lado = falam.indexOf(m.cor) === 0 ? -1 : 1;
          const s = spring({frame: f - m.at, fps, config: {damping: 11, stiffness: 180}});
          if (f < m.at) return null;
          return (
            <div key={k} style={{position: 'absolute', left: 960 + lado * 230 - 330, top: 520 - interpolate(f, [(chat[k + 1]?.at ?? 1e9), (chat[k + 1]?.at ?? 1e9) + 6], [0, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), width: 660, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${lado * 2}deg)`}}>
              <div style={{padding: '14px 26px', background: '#fff', border: '6px solid #000', borderRadius: 28, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, lineHeight: 1.1, color: '#111', textAlign: 'center', boxShadow: '0 8px 0 #000a', opacity: k < chat.length - 1 && f > (chat[k + 1]?.at ?? 1e9) ? 0.55 : 1}}>
                <div style={{fontSize: 24, letterSpacing: 1, color: PALETA[m.cor]?.shade ?? '#555'}}>{NOME[m.cor] ?? m.cor} · {modelos[m.cor] ?? ''}</div>
                {m.texto}
              </div>
            </div>
          );
        })}
        {/* cabeçalho e contagem para a próxima partida */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, letterSpacing: 8, color: '#9fe7ff', textShadow: '0 4px 0 #000'}}>LOBBY</div>
        <div style={{position: 'absolute', left: '50%', bottom: 36, transform: `translateX(-50%) scale(${1 + Math.max(0, 1 - (f % Math.ceil(D / 3)) / 8) * 0.12})`, padding: '10px 34px', background: '#ffd21f', border: '6px solid #000', borderRadius: 20, fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#000', whiteSpace: 'nowrap'}}>
          {proxima} COMEÇANDO EM {resta}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: sai}} />
    </AbsoluteFill>
  );
};
