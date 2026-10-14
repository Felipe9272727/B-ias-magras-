// Prêmios da temporada (fim do vídeo): cada prêmio entra grande no meio quando o narrador fala o nome dele (`gatilhos`,
// quadros vindos das palavras da cena) e depois sobe para a prateleira no topo. Números conferidos em amongus/logs2.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {Som} from './Telas';

type Premio = {titulo: string; cores: string[]; nome: string; stat: string; som: string};
export const PREMIOS: Premio[] = [
  {titulo: 'ASSASSINO DA TEMPORADA', cores: ['Verde'], nome: 'Verde · Gemini', stat: '4 mortes · expulso nas 2 partidas', som: 'faca'},
  {titulo: 'IMPOSTOR MAIS FRIO', cores: ['Azul'], nome: 'Azul · DeepSeek', stat: '2 partidas de impostor · 3 mortes · nunca expulso', som: 'transformar'},
  {titulo: 'MOTORISTA DO DUTO', cores: ['Laranja'], nome: 'Laranja · GPT', stat: '19 viagens de duto · 0 mortes', som: 'duto'},
  {titulo: 'MÉDICO DO ANO', cores: ['Rosa', 'Lima'], nome: 'Rosa e Lima', stat: 'escudo no impostor, 2 partidas seguidas', som: 'escudo'},
  {titulo: 'XERIFE', cores: ['Azul', 'Laranja', 'Roxo', 'Rosa'], nome: '4 xerifes', stat: '0 tiros na temporada', som: 'voto'},
  {titulo: 'PROFISSÃO MAIS PERIGOSA', cores: ['Marrom', 'Verde'], nome: 'Detetive', stat: 'expulso 2 vezes por falar a verdade', som: 'derrota'},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const BIG = {x: 460, y: 240, w: 1000, h: 600};

const Trofeu: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g stroke="#000" strokeWidth={4} strokeLinejoin="round">
      <path d="M28 12h44v20c0 16-10 26-22 26S28 48 28 32z" fill="#ffd84d" />
      <path d="M28 18H14c0 14 6 20 16 22M72 18h14c0 14-6 20-16 22" fill="none" />
      <path d="M44 58h12v14H44z" fill="#e0a800" />
      <path d="M32 72h36v12H32z" fill="#8a5a00" />
    </g>
    <path d="M38 18c-2 10 0 18 6 24" stroke="#fff8" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

const Cartao: React.FC<{pr: Premio; t: number}> = ({pr, t}) => {
  const tam = pr.cores.length === 1 ? 250 : pr.cores.length === 2 ? 190 : 140;
  return (
    <div style={{width: BIG.w, height: BIG.h, borderRadius: 34, background: 'linear-gradient(#2b1d4a, #120b22)', border: '8px solid #ffd84d', boxShadow: '0 0 60px #ffd84d55, 0 20px 0 #000a', boxSizing: 'border-box', padding: 30, position: 'relative', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Trofeu size={90} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: '#ffd84d', letterSpacing: 2, lineHeight: 1}}>{pr.titulo}</div>
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 40, display: 'flex', alignItems: 'flex-end', gap: 6}}>
        {pr.cores.map((c, i) => <Crewmate key={c + i} cor={c} size={tam} t={t + i * 9} />)}
      </div>
      <div style={{position: 'absolute', right: 40, bottom: 60, width: 470, textAlign: 'right'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#fff', lineHeight: 1.05}}>{pr.nome}</div>
        <div style={{marginTop: 14, fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#d8ccff', lineHeight: 1.2}}>{pr.stat}</div>
      </div>
    </div>
  );
};

export const AU2Premios: React.FC<{gatilhos?: number[]}> = ({gatilhos = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = PREMIOS.map((_, i) => gatilhos[i] ?? -1);
  const atual = g.reduce((acc, q, i) => (q >= 0 && q <= f ? i : acc), -1);
  const titulo = interpolate(f, [g[0] >= 0 ? g[0] - 6 : 9999, g[0] >= 0 ? g[0] + 4 : 9999], [1, 0], cl);
  const tIn = spring({frame: f - 4, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a2a66 0%, #0c0718 70%)', overflow: 'hidden'}}>
      {/* raios girando atrás */}
      <div style={{position: 'absolute', left: 960 - 1300, top: 540 - 1300, width: 2600, height: 2600, transform: `rotate(${f * 0.25}deg)`, background: 'repeating-conic-gradient(#ffffff08 0deg 8deg, transparent 8deg 16deg)'}} />
      {titulo > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: titulo, transform: `scale(${tIn})`}}>
          <div style={{display: 'inline-block', transform: `rotate(${Math.sin(f / 10) * 8}deg)`}}><Trofeu size={240} /></div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 110, color: '#ffd84d', WebkitTextStroke: '3px #000', textShadow: '0 8px 0 #000'}}>PRÊMIOS DA TEMPORADA</div>
        </div>
      )}
      {PREMIOS.map((pr, i) => {
        if (g[i] < 0 || f < g[i]) return null;
        const ent = spring({frame: f - g[i], fps, config: {damping: 12, stiffness: 150}});
        // quando o próximo prêmio entra, este sobe pra prateleira
        const sobe = g[i + 1] >= 0 ? interpolate(f, [g[i + 1] - 4, g[i + 1] + 10], [0, 1], cl) : 0;
        const ex = 40 + i * 310;
        const x = interpolate(sobe, [0, 1], [BIG.x, ex]);
        const y = interpolate(sobe, [0, 1], [BIG.y + (1 - ent) * 500, 20]);
        const sc = interpolate(sobe, [0, 1], [0.6 + 0.4 * ent, 0.29]);
        return (
          <div key={pr.titulo} style={{position: 'absolute', left: x, top: y, transform: `scale(${sc})`, transformOrigin: '0 0', zIndex: i === atual ? 10 : 1}}>
            {f === g[i] && <Som nome={pr.som} vol={0.5} />}
            <Cartao pr={pr} t={f} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
