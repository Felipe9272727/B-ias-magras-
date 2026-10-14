// "Manual do bom impostor": o caderno que só um impostor recebeu na partida 4 (era pro Opus; quem jogou foi o Sonnet). As 12 regras (resumidas do texto que
// foi no prompt, amongus/jogo2.mjs MANUAL_IMPOSTOR) entram uma a uma; `destaque` marca com caneta as que ele usou.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {Som} from './Telas';

export const REGRAS_MANUAL: {secao: string; txt: string}[] = [
  {secao: 'DISFARCE', txt: 'Finja tarefas onde TEM tarefa, pelo tempo certo.'},
  {secao: 'DISFARCE', txt: 'Faca em recarga? Grude em alguém: vira álibi.'},
  {secao: 'MATAR', txt: 'Só mate sozinho com a vítima. Depois, duto.'},
  {secao: 'MATAR', txt: 'Mate primeiro quem é perigoso. Deixe vivo quem já é suspeito.'},
  {secao: 'MATAR', txt: 'Conte sempre: impostores x tripulantes.'},
  {secao: 'SABOTAGEM', txt: 'Matou? Sabote algo LONGE do corpo.'},
  {secao: 'SABOTAGEM', txt: 'Reator com a tripulação espalhada pode vencer sozinho.'},
  {secao: 'REUNIÃO', txt: 'Álibi específico. Confirme verdades dos outros.'},
  {secao: 'REUNIÃO', txt: 'Acusado? Responda firme e devolva a acusação.'},
  {secao: 'REUNIÃO', txt: 'Parceiro pego em flagrante? Vote nele também.'},
  {secao: 'REUNIÃO', txt: 'Autodenúncia só em último caso.'},
  {secao: 'FIM DE JOGO', txt: 'Falta uma morte pro empate? Mate ou sabote o reator.'},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// `marcas`: quadro em que o narrador lê cada regra destacada (a caneta passa nessa hora); sem isso, logo depois das regras
export const AU2Manual: React.FC<{destaque?: number[]; passo?: number; modelo?: string; marcas?: number[]}> = ({destaque = [], passo = 16, modelo = 'Claude Sonnet', marcas = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abre = spring({frame: f, fps, config: {damping: 15}});
  const fimRegras = 20 + REGRAS_MANUAL.length * passo;
  const quando = (k: number) => (marcas[k] ?? -1) >= 0 ? marcas[k] : fimRegras + k * 12;
  // o Ciano dá um pulinho a cada regra marcada
  const pulo = destaque.reduce((acc, _, k) => { const d = f - quando(k); return d >= 0 && d < 14 ? Math.sin((d / 14) * Math.PI) * 40 : acc; }, 0);
  const balanco = Math.sin(f / 18) * 3;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 40%, #2a1210, #070304 80%)'}}>
      {/* o Opus (Ciano) lendo, de canto */}
      <div style={{position: 'absolute', left: 60, top: 560 - pulo, transform: `translateY(${(1 - abre) * 300}px) rotate(${balanco}deg)`}}>
        <Crewmate cor="Ciano" size={340} t={f} />
        <div style={{position: 'absolute', left: 30, top: -70, padding: '6px 16px', borderRadius: 10, background: '#d97a47', fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: '#fff', border: '3px solid #000'}}>{modelo}</div>
      </div>
      {/* caderno */}
      <div style={{position: 'absolute', left: 470, top: 50, width: 1390, height: 980, transform: `rotate(${-1.2 + (1 - abre) * 6}deg) scale(${0.8 + 0.2 * abre})`, opacity: abre, borderRadius: 14, background: 'repeating-linear-gradient(#fbf6e6 0 54px, #c9d7ef 54px 56px)', boxShadow: '0 30px 80px #000d', border: '3px solid #3a2a1a', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 90, top: 0, bottom: 0, width: 3, background: '#e88'}} />
        <div style={{position: 'absolute', left: 120, top: 14, fontFamily: FONT.comic, fontSize: 76, color: '#b3131b', letterSpacing: 2}}>MANUAL DO BOM IMPOSTOR</div>
        <div style={{position: 'absolute', left: 120, top: 128, right: 40}}>
          {REGRAS_MANUAL.map((r, i) => {
            const d = f - 20 - i * passo;
            const k = destaque.indexOf(i + 1);
            const marca = k >= 0 ? interpolate(f, [quando(k), quando(k) + 14], [0, 1], cl) : 0;
            return (
              <div key={i} style={{height: 56, display: 'flex', alignItems: 'center', gap: 14, opacity: interpolate(d, [0, 5], [0, 1], cl), transform: `translateX(${interpolate(d, [0, 8], [-30, 0], cl)}px)`}}>
                {d >= 0 && d < 2 && <Som nome="chat" vol={0.25} />}
                {k >= 0 && f === quando(k) && <Som nome="tarefa" vol={0.4} />}
                <span style={{fontFamily: FONT.comic, fontSize: 34, color: '#b3131b', width: 40}}>{i + 1}.</span>
                <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: '#7a5a3a', width: 150}}>{r.secao}</span>
                <span style={{position: 'relative', fontFamily: FONT.display, fontWeight: 600, fontSize: 31, color: '#1d1a14'}}>
                  <span style={{position: 'absolute', left: -6, right: -6, top: 6, bottom: 2, background: '#ffe34d', transformOrigin: 'left', transform: `scaleX(${marca})`, zIndex: 0, borderRadius: 4}} />
                  <span style={{position: 'relative'}}>{r.txt}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
