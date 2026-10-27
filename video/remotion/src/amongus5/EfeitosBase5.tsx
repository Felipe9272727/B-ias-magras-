// Among Us 5: cópia de amongus3/Efeitos.tsx sem emoji. Original:
// Among Us 3: efeitos no mundo para os eventos novos (desenho próprio): foto do Influencer, veneno, recrutamento do
// Gangster, tarefas visuais (scan, lixo, escudos, asteroides) e conserto de sabotagem. Cada efeito dura até 75 quadros.
import React from 'react';
import {interpolate} from 'remotion';
import {FONT} from '../theme';
import type {EvQ, Sim} from './sim5';
import {Camera, ComIcone} from './Icones5';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const Rotulo: React.FC<{txt: React.ReactNode; cor: string; k: number}> = ({txt, cor, k}) => (
  <div style={{position: 'absolute', left: '50%', top: -70 - 30 * Math.min(1, k * 3), transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: cor, WebkitTextStroke: '1.5px #000', textShadow: '0 3px 0 #000', opacity: interpolate(k, [0, 0.1, 0.8, 1], [0, 1, 1, 0])}}>{txt}</div>
);

export const EfeitoBase5: React.FC<{e: EvQ; s: Sim; f: number}> = ({e, s, f}) => {
  const k = (f - e.quadro) / 75;
  const quem = e.cor ? s.q(e.cor, f) : null;
  const pos = (x: number, y: number, filho: React.ReactNode) => <div style={{position: 'absolute', left: x, top: y}}>{filho}</div>;

  if (e.tipo === 'foto' && quem) {
    // flash branco + moldura de foto subindo
    return pos(quem.x, quem.y - 60, <>
      <div style={{position: 'absolute', left: -300, top: -300, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,${interpolate(k, [0, 0.04, 0.25], [0, 0.95, 0], cl)}) 0%, transparent 65%)`}} />
      <div style={{position: 'absolute', left: -40, top: -150 - 40 * k, width: 80, height: 64, background: '#fff', border: '4px solid #000', borderRadius: 6, transform: `rotate(${-8 + 16 * k}deg)`, opacity: interpolate(k, [0.05, 0.15, 0.85, 1], [0, 1, 1, 0], cl)}}>
        <div style={{margin: 6, height: 38, background: 'linear-gradient(#3b4b66, #8fd3ff)'}} />
      </div>
      <Rotulo txt={<ComIcone icone={<Camera tam={30} />}>FOTO POSTADA</ComIcone>} cor="#fff" k={k} />
    </>);
  }
  if (e.tipo === 'recrutamento') {
    const v = s.q(e.alvo, f);
    if (!v) return null;
    return pos(v.x, v.y - 50, <>
      <div style={{position: 'absolute', left: -90, top: -90, width: 180, height: 180, borderRadius: '50%', border: `${10 * (1 - k)}px solid #ff2b2b`, boxShadow: '0 0 40px #ff2b2b', transform: `scale(${0.5 + k})`, opacity: 1 - k}} />
      <Rotulo txt="RECRUTADO!" cor="#ff3b3b" k={k} />
    </>);
  }
  if (e.tipo === 'veneno') {
    const v = s.q(e.vitima, f);
    if (!v) return null;
    return pos(v.x, v.y - 50, <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <div key={i} style={{position: 'absolute', left: Math.cos(a) * 60 * k * 2 - 8, top: Math.sin(a) * 40 * k * 2 - 8, width: 16, height: 16, borderRadius: '50%', background: '#7dff5a', border: '2px solid #0b3d10', opacity: interpolate(k, [0, 0.5], [1, 0], cl)}} />;
      })}
    </>);
  }
  if (e.tipo === 'morte_veneno' && e.x !== undefined) {
    return pos(e.x, e.y - 40, <div style={{position: 'absolute', left: -110, top: -110, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, rgba(125,255,90,${0.7 * (1 - k)}) 0%, transparent 70%)`}} />);
  }
  if (e.tipo === 'tarefa' && e.visual && quem) {
    if (e.nome === 'Escanear no MedBay') {
      // faixa verde descendo e subindo pelo corpo
      const y = -100 + 110 * (0.5 - 0.5 * Math.cos(k * Math.PI * 4));
      return pos(quem.x, quem.y, <>
        <div style={{position: 'absolute', left: -60, top: -110, width: 120, height: 130, borderRadius: 16, background: 'rgba(80,255,140,.18)', border: '3px solid #5dff8a', opacity: k < 0.95 ? 1 : 0}} />
        <div style={{position: 'absolute', left: -64, top: y, width: 128, height: 8, background: '#9dffb8', boxShadow: '0 0 20px #5dff8a', opacity: k < 0.95 ? 1 : 0}} />
      </>);
    }
    if (e.nome === 'Esvaziar o lixo') {
      return pos(quem.x, quem.y - 40, <>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{position: 'absolute', left: -50 + i * 15, top: -40 + ((k * 240 + i * 23) % 120), width: 14, height: 14, borderRadius: i % 2 ? 3 : '50%', background: ['#c99a5e', '#7e8a99', '#4caf50', '#e8b23a'][i % 4], border: '2px solid #000', opacity: k < 0.9 ? 1 : 0}} />
        ))}
      </>);
    }
    if (e.nome === 'Ativar os escudos') {
      return pos(quem.x, quem.y - 60, <div style={{position: 'absolute', left: -200, top: -200, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, rgba(90,190,255,${0.55 * Math.sin(k * Math.PI)}) 0%, transparent 70%)`}} />);
    }
    if (e.nome === 'Destruir asteroides') {
      return pos(quem.x, quem.y - 60, <>
        {[0, 1, 2].map((i) => {
          const ki = (k * 3 - i * 0.5) % 1;
          return ki > 0 && ki < 0.4 ? <div key={i} style={{position: 'absolute', left: 30, top: -10, width: 260, height: 6, background: '#ffde59', boxShadow: '0 0 14px #ffde59', transformOrigin: '0 50%', transform: `rotate(${-30 - i * 12}deg) scaleX(${ki / 0.4})`}} /> : null;
        })}
      </>);
    }
  }
  if (e.tipo === 'conserto' && e.por?.[0]) {
    const q = s.q(e.por[0], f);
    if (!q) return null;
    return pos(q.x, q.y - 60, <Rotulo txt="CONSERTADO!" cor="#5dff8a" k={k} />);
  }
  return null;
};
