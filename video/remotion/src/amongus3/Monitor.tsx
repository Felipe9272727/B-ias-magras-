// Telas de vigilância do Among Us 2, abertas quando alguém usa o console: câmeras de segurança (imagem ao vivo das
// salas vigiadas), mapa do Admin (quantos estão em cada sala, sem cor) e sinais vitais (vivo / morto / expulso).
// Tudo desenhado aqui; as câmeras reaproveitam o <Mundo> do Jogo.tsx, então mostram exatamente o que acontece na partida.
import React from 'react';
import {interpolate} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {NAVE, centroSala, salaEm} from '../amongus/nave/mapa';
import type {Sala} from '../amongus/nave/spec';
import {FONT} from '../theme';
import {CORES, Partida2, Sim} from './sim';
import {Mundo} from './Jogo';

// as mesmas salas que o motor (jogo2.mjs) deixa ver pelas câmeras
export const SALAS_CAMERA: Sala[] = ['Refeitorio', 'Admin', 'Navegacao', 'MotorSuperior', 'Enfermaria'];

type P = {p: Partida2; s: Sim; f: number; frame: number; aberto: number; quem: string};

// moldura de console: metal escuro com parafusos, como as telas do jogo
const Console: React.FC<{titulo: string; aberto: number; children: React.ReactNode}> = ({titulo, aberto, children}) => (
  <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.55 * aberto})`}}>
    <div style={{position: 'absolute', left: 120, top: 70, width: 1680, height: 940, transform: `scale(${0.9 + 0.1 * aberto})`, opacity: aberto, borderRadius: 30, background: 'linear-gradient(#5b616d, #3a3f49)', border: '8px solid #101217', boxShadow: '0 20px 60px #000c, inset 0 4px 0 #ffffff22'}}>
      {[[22, 22], [1634, 22], [22, 894], [1634, 894]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 16, height: 16, borderRadius: 8, background: 'radial-gradient(circle at 35% 35%, #c9ced8, #5d636e)', border: '2px solid #1b1e24'}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, letterSpacing: 6, color: '#e9edf5', WebkitTextStroke: '1.5px #000'}}>{titulo}</div>
      {/* botão de fechar, no canto como no jogo */}
      <div style={{position: 'absolute', right: -26, top: -26, width: 70, height: 70, borderRadius: 35, background: '#d22', border: '6px solid #101217', display: 'grid', placeItems: 'center'}}>
        <svg width={30} height={30} viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" /></svg>
      </div>
      <div style={{position: 'absolute', left: 40, top: 70, right: 40, bottom: 40}}>{children}</div>
    </div>
  </div>
);

// chiado de TV (sem sinal / comunicações sabotadas): ruído SVG que muda a cada quadro
const Chiado: React.FC<{frame: number; w: number; h: number}> = ({frame, w, h}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
    <filter id={`chiado${frame % 7}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={frame % 97} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={w} height={h} filter={`url(#chiado${frame % 7})`} opacity={0.9} />
  </svg>
);

const TW = 520, TH = 380;
const Feed: React.FC<{p: Partida2; s: Sim; f: number; frame: number; sala: Sala | null; n: number; sabotado: boolean}> = ({p, s, f, frame, sala, n, sabotado}) => {
  const r = sala ? NAVE.salas[sala].rect : null;
  const c = sala ? centroSala(sala) : {x: 0, y: 0};
  const escala = r ? Math.max(0.36, Math.min(0.8, Math.min(TW / (r.w * 48 + 96), TH / (r.h * 48 + 150)))) : 1;
  return (
    <div style={{position: 'relative', width: TW, height: TH, overflow: 'hidden', background: '#000', border: '6px solid #15171c', borderRadius: 8}}>
      {sala && !sabotado ? (
        <>
          <Mundo p={p} s={s} f={f} frame={frame} cx={c.x} cy={c.y - 40} escala={escala} w={TW} h={TH} nomes={false} />
          {/* imagem de câmera: um pouco lavada, com linhas de varredura e cantos escuros */}
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 5px)', mixBlendMode: 'multiply'}} />
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: ((frame * 3 + n * 70) % (TH + 60)) - 30, height: 24, background: 'linear-gradient(transparent, rgba(255,255,255,.06), transparent)'}} />
        </>
      ) : (
        <>
          <Chiado frame={frame + n * 13} w={TW} h={TH} />
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 38, letterSpacing: 4, color: '#fff', WebkitTextStroke: '2px #000'}}>{sabotado ? 'SEM SINAL' : 'CÂMERA QUEBRADA'}</div>
        </>
      )}
      <div style={{position: 'absolute', left: 14, top: 10, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: 22, color: '#fff', textShadow: '0 2px 2px #000'}}>
        <div style={{width: 16, height: 16, borderRadius: 8, background: '#ff2020', opacity: frame % 30 < 18 ? 1 : 0.15, boxShadow: '0 0 8px #f00'}} />
        REC
      </div>
      <div style={{position: 'absolute', right: 14, top: 10, fontFamily: 'monospace', fontSize: 20, color: '#fffc', textShadow: '0 2px 2px #000'}}>CAM {n + 1}</div>
      <div style={{position: 'absolute', left: 14, bottom: 10, fontFamily: FONT.display, fontWeight: 900, fontSize: 24, letterSpacing: 2, color: '#fff', WebkitTextStroke: '1px #000', textShadow: '0 2px 0 #000'}}>{sala ? NAVE.salas[sala].nome.toUpperCase() : ''}</div>
    </div>
  );
};

export const Cameras: React.FC<P> = ({p, s, f, frame, aberto}) => {
  const sabotado = s.sabotagem(f) === 'Comunicações';
  const salas: (Sala | null)[] = [...SALAS_CAMERA, null];
  return (
    <Console titulo="SEGURANÇA" aberto={aberto}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${TW}px)`, gap: 22, justifyContent: 'center'}}>
        {salas.map((sala, n) => <Feed key={n} p={p} s={s} f={f} frame={frame} sala={sala} n={n} sabotado={sabotado} />)}
      </div>
    </Console>
  );
};

// mapa do Admin: as salas em azul, e um bonequinho cinza por pessoa (o jogo não mostra a cor)
export const Admin: React.FC<P> = ({s, f, frame, aberto}) => {
  const sabotado = s.sabotagem(f) === 'Comunicações';
  const k = Math.min(1560 / (NAVE.cols * 48), 790 / (NAVE.rows * 48));
  const ox = (1584 - NAVE.cols * 48 * k) / 2; // centraliza o mapa na mesa
  const cont: Record<string, number> = {};
  for (const c of CORES) {
    const q = s.q(c, f);
    const sala = q && salaEm(q);
    if (sala) cont[sala] = (cont[sala] ?? 0) + 1;
  }
  return (
    <Console titulo="ADMIN" aberto={aberto}>
      <div style={{position: 'relative', width: 1584, height: 810, margin: '0 auto', background: '#0b2a4a', border: '6px solid #15171c', borderRadius: 10, overflow: 'hidden'}}>
        {Object.entries(NAVE.salas).map(([id, d]) => {
          const n = cont[id] ?? 0;
          const x = d.rect.c * 48 * k, y = d.rect.r * 48 * k, w = d.rect.w * 48 * k, h = d.rect.h * 48 * k;
          return (
            <div key={id} style={{position: 'absolute', left: x + ox, top: y + 10, width: w, height: h, background: '#1d5f9e', border: '3px solid #7cc0ff', borderRadius: 6}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 4, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 17, color: '#d8ecff'}}>{d.nome}</div>
              {!sabotado && (
                <div style={{position: 'absolute', left: 6, right: 6, bottom: 6, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2}}>
                  {Array.from({length: n}, (_, i) => <div key={i} style={{filter: 'grayscale(1) brightness(1.4)'}}><Crewmate cor="Branco" size={30} /></div>)}
                </div>
              )}
            </div>
          );
        })}
        {sabotado && <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: frame % 30 < 15 ? '#ff3b3b' : '#fff', WebkitTextStroke: '2px #000'}}>COMUNICAÇÕES SABOTADAS</div>}
      </div>
    </Console>
  );
};

// sinais vitais: uma linha por jogador, batimento verde (vivo), MORTO em vermelho, D/C cinza (expulso)
export const Vitais: React.FC<P> = ({p, s, f, frame, aberto}) => {
  const expulsos = new Set(p.reunioes.filter((r, i) => r.expulso && s.reunioes[i] && s.reunioes[i].quadro <= f).map((r) => r.expulso!));
  return (
    <Console titulo="SINAIS VITAIS" aberto={aberto}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, padding: '10px 20px'}}>
        {CORES.map((c, i) => {
          const vivo = !!s.q(c, f);
          const estado = vivo ? 'ok' : expulsos.has(c) ? 'dc' : 'morto';
          const cor = estado === 'ok' ? '#3cff6a' : estado === 'morto' ? '#ff3b3b' : '#9aa0aa';
          // batimento: linha reta com um pico que corre da esquerda pra direita
          const fase = ((frame + i * 9) % 45) / 45;
          const pts = Array.from({length: 41}, (_, k) => {
            const x = k / 40;
            const d = x - fase;
            const y = estado === 'ok' ? (Math.abs(d) < 0.02 ? -1 : Math.abs(d - 0.03) < 0.015 ? 0.7 : Math.abs(d + 0.025) < 0.012 ? 0.25 : 0) : 0;
            return `${x * 300},${30 + y * 24}`;
          }).join(' ');
          return (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 14, height: 180, padding: '0 16px', background: '#0d1117', border: `4px solid ${estado === 'ok' ? '#1f6f35' : '#3a1f22'}`, borderRadius: 10}}>
              <div style={{opacity: vivo ? 1 : 0.6}}><Crewmate cor={c} size={74} morto={estado === 'morto'} /></div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#fff'}}>{c}</div>
                <svg width={300} height={60}><polyline points={pts} fill="none" stroke={cor} strokeWidth={4} strokeLinejoin="round" /></svg>
                <div style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, color: cor}}>{estado === 'ok' ? 'OK' : estado === 'morto' ? 'MORTO' : 'D/C'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Console>
  );
};

// qual tela de vigilância o jogador `quem` está olhando neste quadro (com o quanto ela já abriu, 0..1)
export function monitorAberto(s: Sim, quem: string, f: number): {tipo: string; aberto: number} | null {
  const e = s.eventos.find((x) => x.tipo === 'monitor' && x.cor === quem && f >= x.quadro && f < x.ate);
  if (!e || e.ate - e.quadro < 25) return null; // olhada rápida demais pra abrir a tela
  const aberto = Math.min(interpolate(f - e.quadro, [0, 8], [0, 1], {extrapolateRight: 'clamp'}), interpolate(e.ate - f, [0, 6], [0, 1], {extrapolateRight: 'clamp'}));
  return {tipo: e.subtipo, aberto};
}

export const Monitor: React.FC<P & {tipo: string}> = (props) =>
  props.tipo === 'cameras' ? <Cameras {...props} /> : props.tipo === 'admin' ? <Admin {...props} /> : <Vitais {...props} />;
