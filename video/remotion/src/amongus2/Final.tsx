// Encerramento: "Temporada 2?" com os 12 tripulantes flutuando no espaço e o botão de inscrever sendo clicado (`clique`),
// e o gancho final do Opus: as respostas vazias que ele mandou na partida 4 empilhando no chat.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {CORES} from './sim';
import {Estrelas, Som} from './Telas';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const AU2Final: React.FC<{clique?: number}> = ({clique = 200}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tit = spring({frame: f - 6, fps, config: {damping: 9, stiffness: 120}});
  const brilho = 0.5 + 0.5 * Math.sin(f / 8);
  // cursor indo até o botão e clicando
  const cx = interpolate(f, [clique - 40, clique - 4], [1500, 1010], {...cl});
  const cy = interpolate(f, [clique - 40, clique - 4], [1060, 890], {...cl});
  const clicou = f >= clique;
  const aperta = clicou && f < clique + 6 ? 0.92 : 1;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #13204a, #03050c 75%)', overflow: 'hidden'}}>
      <Estrelas vel={2} n={180} />
      {CORES.map((c, i) => {
        const lado = i % 2 ? 1 : -1;
        const x = 960 + lado * (380 + ((i * 97) % 420)) + Math.sin((f + i * 20) / 40) * 40;
        const y = 120 + ((i * 173) % 800) + Math.cos((f + i * 13) / 35) * 30;
        return (
          <div key={c} style={{position: 'absolute', left: x - 60, top: y - 60, transform: `rotate(${(f * (i % 3 ? 1.2 : -0.9)) + i * 30}deg)`, opacity: interpolate(f, [i * 3, i * 3 + 15], [0, 0.95], cl)}}>
            <Crewmate cor={c} size={120} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', transform: `scale(${tit})`}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 200, color: '#8fd3ff', WebkitTextStroke: '4px #000', textShadow: `0 0 ${30 + 40 * brilho}px #8fd3ffaa, 0 12px 0 #000`, lineHeight: 1}}>TEMPORADA 2?</div>
        <div style={{marginTop: 30, fontFamily: FONT.display, fontWeight: 800, fontSize: 50, color: '#fff', WebkitTextStroke: '1px #000'}}>comenta qual IA você quer ver de impostor</div>
      </div>
      {/* botão de inscrever */}
      <div style={{position: 'absolute', left: 760, top: 840, width: 400, height: 100, borderRadius: 50, background: clicou ? '#3a3f4b' : '#e01b1b', border: '5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff', transform: `scale(${aperta * (clicou ? 1 : 1 + 0.03 * brilho)})`, boxShadow: '0 8px 0 #000'}}>
        {clicou && <svg width={40} height={40} viewBox="0 0 40 40"><path d="M6 21l9 9L34 9" stroke="#7ee787" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {clicou ? 'INSCRITO' : 'INSCREVER-SE'}
      </div>
      {f === clique && <Som nome="tarefa" vol={0.6} />}
      {f > clique - 42 && f < clique + 40 && (
        <svg width={60} height={70} viewBox="0 0 60 70" style={{position: 'absolute', left: cx, top: cy, transform: `scale(${clicou && f < clique + 6 ? 0.85 : 1})`}}>
          <path d="M4 4l0 52 14-12 10 22 9-4-10-21 19-1z" fill="#fff" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// o Opus na partida 4 (amongus/logs2/partida4_opus_sem_resposta.json): 62 chamadas, todas vazias; nas reuniões o chat dele só mostrou "..."
export const AU2Opus: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.min(6, Math.max(0, Math.floor((f - 14) / 16) + 1));
  const carimbo = spring({frame: f - 125, fps, config: {damping: 8, stiffness: 220}});
  const fim = interpolate(f, [200, 225], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#06070b', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 900, height: 860, borderRadius: 28, background: '#e9eef5', border: '8px solid #1a1f2b', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '18px 24px', background: '#cfd8e6', borderBottom: '4px solid #1a1f2b', display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36}}>Claude Opus</span>
          <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 20, padding: '3px 10px', borderRadius: 8, background: '#d97a47', color: '#fff'}}>partida 4</span>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 24, gap: 14}}>
          {Array.from({length: n}, (_, i) => (
            <div key={i} style={{display: 'flex', gap: 14, alignItems: 'center', opacity: interpolate(f - (14 + i * 16), [0, 6], [0, 1], cl)}}>
              {f === 14 + i * 16 && <Som nome="chat" vol={0.4} />}
              <div style={{width: 70, height: 70, borderRadius: 14, overflow: 'hidden', background: '#c7d3e3', border: '3px solid #000', position: 'relative'}}>
                <div style={{position: 'absolute', left: -8, top: 4}}><Crewmate cor="Ciano" size={88} /></div>
              </div>
              <div style={{flex: 1, height: 70, borderRadius: 14, border: '3px dashed #8a93a3', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: '#9aa3b0'}}>...</div>
            </div>
          ))}
        </div>
      </div>
      {f >= 125 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', transform: `rotate(-10deg) scale(${2 - carimbo})`, opacity: Math.min(1, carimbo * 1.4)}}>
          {f === 125 && <Som nome="voto" vol={0.8} />}
          <span style={{display: 'inline-block', padding: '10px 40px', border: '12px solid #e01b1b', borderRadius: 20, fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: '#e01b1b', background: '#ffffffd0'}}>0 RESPOSTAS</span>
          <div style={{marginTop: 18, fontFamily: FONT.display, fontWeight: 800, fontSize: 44, color: '#fff', WebkitTextStroke: '1px #000'}}>62 chamadas · todas vazias</div>
        </div>
      )}
      <AbsoluteFill style={{background: '#000', opacity: fim, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', opacity: interpolate(f, [215, 235], [0, 1], cl)}}>fim da temporada 1</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
