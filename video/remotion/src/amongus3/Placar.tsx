// Placar da temporada: uma coluna por partida (impostores, mortes, inocentes expulsos, quem venceu) e o placar geral.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import type {Partida2} from './sim';
import {Som} from './Telas';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Res = {time: string; motivo: string; tique: number};
// `corte`: resultado usado no vídeo quando ele difere do log (partida 1 cortada na expulsão do Palhaço)
export const AU3Placar: React.FC<{ps: Record<string, Partida2>; ate?: number; corte?: Record<string, Res>}> = ({ps, ate = 4, corte = {}}) => {
  const res = (n: number): Res => corte[String(n)] ?? ps[String(n)].resultado;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ns = [1, 2, 3, 4, 5].filter((n) => n <= ate && ps[String(n)]?.resultado);
  const tri = ns.filter((n) => res(n).time === 'tripulante').length;
  const imp = ns.filter((n) => res(n).time === 'impostor').length;
  const pal = ns.filter((n) => res(n).time === 'palhaco').length;
  // o placar bate na tela depois das colunas, com confete
  const bate = 10 + ns.length * 18 + 14;
  const sl = spring({frame: f - bate, fps, config: {damping: 9, stiffness: 200}});
  const confete = Array.from({length: 90}, (_, i) => ({x: (i * 211) % 1920, v: 4 + (i % 7), c: ['#8fd3ff', '#ffd84d', '#ff6b6b', '#7ee787', '#d2a8ff'][i % 5], g: (i * 37) % 360, a: (i * 53) % 400}));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)', transform: `scale(${1 + Math.min(f, 500) * 0.00008})`}}>
      {f >= bate && f < bate + 2 && <Som nome="vitoria" vol={0.5} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000'}}>Temporada</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: FONT.display, fontWeight: 900, fontSize: 54, transform: `scale(${f < bate ? 1 : 1 + 0.35 * (1 - sl) + 0.15 * Math.max(0, 1 - (f - bate) / 30)})`}}>
        <span style={{color: '#8fd3ff'}}>Tripulantes {tri}</span>
        <span style={{color: '#fff'}}>x</span>
        <span style={{color: '#ff3b3b'}}>{imp} Impostores</span>
        <span style={{color: '#fff'}}>x</span>
        <span style={{color: '#c08bff'}}>{pal} Palhaço</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 220, display: 'grid', gridTemplateColumns: `repeat(${ns.length}, 1fr)`, gap: 26}}>
        {ns.map((n, i) => {
          const p = ps[String(n)];
          const d = f - 10 - i * 18;
          const e = spring({frame: d, fps, config: {damping: 14}});
          const r0 = res(n);
          const venceuImp = r0.time === 'impostor';
          const venceuPal = r0.time === 'palhaco';
          const corCol = venceuImp ? '#ff3b3b' : venceuPal ? '#c08bff' : '#8fd3ff';
          const imps = p.jogadores.filter((j) => j.time === 'impostor');
          const ev = p.eventos.filter((x) => x.tique <= r0.tique);
          const reun = p.reunioes.filter((x) => x.tique <= r0.tique);
          // AU4: bomba, fogo, Casal, aposta e tiro do Xerife também contam
          const mortes = ev.filter((x) => x.tipo === 'morte' || x.tipo === 'morte_veneno' || x.tipo === 'casal_morre' || x.tipo === 'aposta' || x.tipo === 'xerife').length + ev.filter((x) => x.tipo === 'bomba' || x.tipo === 'incendio').reduce((a, x) => a + (x.mortos?.length ?? 0), 0);
          const inocentes = reun.filter((r) => r.expulso && !r.eraImpostor).length;
          const pegos = reun.filter((r) => r.expulso && r.eraImpostor).length + ev.filter((x) => x.tipo === 'xerife' && x.acertou).length;
          return (
            <div key={n} style={{height: 800, borderRadius: 22, background: venceuImp ? 'linear-gradient(#3a0b10, #14040a)' : venceuPal ? 'linear-gradient(#2c1240, #12071c)' : 'linear-gradient(#0e2440, #07111f)', border: `5px solid ${corCol}`, opacity: interpolate(d, [0, 6], [0, 1], cl), transform: `translateY(${(1 - e) * 80}px)`, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
              {d >= 0 && d < 2 && <Som nome="voto" vol={0.4} />}
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>Partida {n}</div>
              <div style={{display: 'flex', gap: 4}}>{imps.map((j) => <Crewmate key={j.cor} cor={j.cor} size={86} />)}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: '#ffb0b0', textAlign: 'center', lineHeight: 1.3}}>{imps.map((j) => `${j.cor} (${j.modelo.replace(' Flash', '').replace('-5.6 Luna', '').replace(' 3.8', '').replace(' 5.3', '').replace(' Large 4', '').replace(' M3', '')})`).join(' · ')}</div>
              <div style={{marginTop: 10, width: '100%', fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: '#e6edf3', lineHeight: 1.7}}>
                <div>Mortes: <b>{mortes}</b></div>
                <div>Impostores pegos: <b>{pegos}</b></div>
                <div>Inocentes expulsos: <b>{inocentes}</b></div>
                <div>Duração: <b>{r0.tique} tiques</b></div>
              </div>
              <div style={{marginTop: 'auto', padding: '10px 18px', borderRadius: 12, background: corCol, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#000', textAlign: 'center'}}>
                {venceuImp ? 'IMPOSTORES' : venceuPal ? 'PALHAÇO' : 'TRIPULANTES'}
                <div style={{fontWeight: 600, fontSize: 18}}>{r0.motivo}</div>
              </div>
            </div>
          );
        })}
      </div>
      {f >= bate && confete.map((c, i) => {
        const t = f - bate;
        const y = -40 - c.a + t * c.v;
        if (y > 1100) return null;
        return <div key={i} style={{position: 'absolute', left: c.x + Math.sin((t + i) / 9) * 30, top: y, width: 16, height: 26, background: c.c, transform: `rotate(${c.g + t * 7}deg)`, borderRadius: 3}} />;
      })}
    </AbsoluteFill>
  );
};
