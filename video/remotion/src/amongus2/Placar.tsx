// Placar da temporada: uma coluna por partida (impostores, mortes, inocentes expulsos, quem venceu) e o placar geral.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import type {Partida2} from './sim';
import {Som} from './Telas';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const AU2Placar: React.FC<{ps: Record<string, Partida2>; ate?: number}> = ({ps, ate = 4}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ns = [1, 2, 3, 4].filter((n) => n <= ate && ps[String(n)]?.resultado);
  const tri = ns.filter((n) => ps[String(n)].resultado.time === 'tripulante').length;
  const imp = ns.length - tri;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000'}}>Temporada</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FONT.display, fontWeight: 900, fontSize: 54}}>
        <span style={{color: '#8fd3ff'}}>Tripulantes {tri}</span>
        <span style={{color: '#fff'}}>x</span>
        <span style={{color: '#ff3b3b'}}>{imp} Impostores</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 220, display: 'grid', gridTemplateColumns: `repeat(${ns.length}, 1fr)`, gap: 26}}>
        {ns.map((n, i) => {
          const p = ps[String(n)];
          const d = f - 10 - i * 18;
          const e = spring({frame: d, fps, config: {damping: 14}});
          const venceuImp = p.resultado.time === 'impostor';
          const imps = p.jogadores.filter((j) => j.time === 'impostor');
          const mortes = p.eventos.filter((x) => x.tipo === 'morte').length;
          const inocentes = p.reunioes.filter((r) => r.expulso && !r.eraImpostor).length;
          const pegos = p.reunioes.filter((r) => r.expulso && r.eraImpostor).length;
          return (
            <div key={n} style={{height: 800, borderRadius: 22, background: venceuImp ? 'linear-gradient(#3a0b10, #14040a)' : 'linear-gradient(#0e2440, #07111f)', border: `5px solid ${venceuImp ? '#ff3b3b' : '#8fd3ff'}`, opacity: interpolate(d, [0, 6], [0, 1], cl), transform: `translateY(${(1 - e) * 80}px)`, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
              {d >= 0 && d < 2 && <Som nome="voto" vol={0.4} />}
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>Partida {n}</div>
              <div style={{display: 'flex', gap: 4}}>{imps.map((j) => <Crewmate key={j.cor} cor={j.cor} size={86} />)}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: '#ffb0b0', textAlign: 'center', lineHeight: 1.3}}>{imps.map((j) => `${j.cor} (${j.modelo.replace(' Flash', '').replace('-5.6 Luna', '').replace(' 3.8', '').replace(' 4.3', '')})`).join(' · ')}</div>
              <div style={{marginTop: 10, width: '100%', fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: '#e6edf3', lineHeight: 1.7}}>
                <div>Mortes: <b>{mortes}</b></div>
                <div>Impostores pegos: <b>{pegos}</b></div>
                <div>Inocentes expulsos: <b>{inocentes}</b></div>
                <div>Duração: <b>{p.resultado.tique} tiques</b></div>
              </div>
              <div style={{marginTop: 'auto', padding: '10px 18px', borderRadius: 12, background: venceuImp ? '#ff3b3b' : '#8fd3ff', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#000', textAlign: 'center'}}>
                {venceuImp ? 'IMPOSTORES' : 'TRIPULANTES'}
                <div style={{fontWeight: 600, fontSize: 18}}>{p.resultado.motivo}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
