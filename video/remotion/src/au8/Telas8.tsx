// Telas cheias do AMONG IA 8 (cópia do Telas7): mesa de reunião com as 11/12 IAs (discussão e votação, lidas do log), ejeção
// (na partida 4 a função NÃO é revelada: revelarExpulso=false), cartões de função, elenco e placar final. O espectador vê
// função e time, menos no modo "segredo" (abertura), que esconde as funções para não entregar quem era o "Roxo".
import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {Cabeca, Chip, corDe, FONTE, PAINEL} from './Hud8';
import {corTime, papelNome, type Log} from './Jogo8';

// cores que o narrador trata no feminino (a Rosa, a Amarelo)
const FEM = new Set(['Rosa', 'Amarelo']);

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SALA: Record<string, string> = {Refeitorio: 'Refeitório', Navegacao: 'Navegação', Comunicacoes: 'Comunicações', Deposito: 'Depósito', Eletrica: 'Elétrica', MotorInferior: 'Motor Inferior', Seguranca: 'Segurança', MotorSuperior: 'Motor Superior'};

export const Estrelas: React.FC<{f: number; vel?: number}> = ({f, vel = 3}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #16224a, #050814 75%)'}}>
    {Array.from({length: 140}).map((_, i) => {
      const z = 0.3 + rnd(i) * 0.7;
      return <div key={i} style={{position: 'absolute', left: ((rnd(i + 200) * 2100 - f * vel * z) % 2100 + 2100) % 2100 - 90, top: rnd(i + 400) * 1080, width: 2 + z * 4, height: 2 + z * 4, borderRadius: 4, background: '#fff', opacity: 0.3 + z * 0.6}} />;
    })}
  </AbsoluteFill>
);

// estado de cada IA no tique da reunião (função e time do tique: o possuído e o recrutado já aparecem trocados)
const naReuniao = (log: Log, idx: number) => {
  const r = log.reunioes[idx];
  const antes = log.tiques[Math.max(0, r.tique - 2)].estados, depois = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, r.tique - 1))].estados;
  return log.jogadores.map((j) => {
    const a = antes.find((e) => e.cor === j.cor)!, d = depois.find((e) => e.cor === j.cor)!;
    const e = r.tique <= 1 ? {...d, vivo: true} : a;
    return {cor: j.cor, modelo: j.modelo, papel: e.papel, time: e.time, vivo: j.cor in r.votos || (e.vivo && d.vivo)};
  });
};

// ---------- mesa de reunião ----------
// fase 'discussao': quem fala (falando) ganha destaque; fase 'votos': as bolinhas de quem votou entram uma a uma embaixo
// de cada votado, depois o carimbo (EXPULSO / ANULADO PELO JUIZ / NINGUÉM EXPULSO).
export const Mesa: React.FC<{log: Log; idx: number; f: number; dur: number; fase: 'discussao' | 'votos'; falando?: string[]; segredo?: boolean; temBalao?: boolean; ocupadoEmbaixo?: boolean}> = ({log, idx, f, dur, fase, falando = [], segredo, temBalao, ocupadoEmbaixo}) => {
  const {fps} = useVideoConfig();
  const r = log.reunioes[idx];
  const js = naReuniao(log, idx);
  const eleitores = Object.keys(r.votos);
  const ini = 14, fimV = Math.max(ini + 30, Math.min(dur * 0.62, ini + eleitores.length * 9));
  const nV = fase === 'votos' ? Math.floor(interpolate(f, [ini, fimV], [0, eleitores.length], cl)) : 0;
  const carimbo = fase === 'votos' ? f - (fimV + 10) : -1;
  const pulos = eleitores.slice(0, nV).filter((e) => r.votos[e] === 'pular');
  const motivos = segredo ? [] : r.motivos ?? [];
  const titulo = r.tipo === 'corpo' ? `CORPO ENCONTRADO: ${String(r.corpo ?? '').toUpperCase()}` : 'REUNIÃO DE EMERGÊNCIA';
  const resultado = r.expulso ? `${r.expulso.toUpperCase()} ${FEM.has(r.expulso) ? 'EXPULSA' : 'EXPULSO'}` : 'NINGUÉM EXPULSO';
  const ehVotos = fase === 'votos';
  const cardH = ehVotos ? 194 : 216;
  const ocupado = Boolean(ocupadoEmbaixo || temBalao);

  // Câmera dinâmica de estúdio na discussão: aproxima suavemente do quadrante de quem fala
  const falIdx = fase === 'discussao' && falando.length > 0 ? js.findIndex((j) => falando.includes(j.cor)) : -1;
  const focoCol = falIdx >= 0 ? falIdx % 4 : 1.5;
  const focoRow = falIdx >= 0 ? Math.floor(falIdx / 4) : 1;
  const ox = falIdx >= 0 ? 18 + focoCol * 21.3 : 50;
  const oy = falIdx >= 0 ? 22 + focoRow * 24 : 24;
  const zoomBase = 1 + 0.025 * (dur > 1 ? f / dur : 0);
  const zoomMesa = ehVotos ? zoomBase : falIdx >= 0 ? 1.055 : zoomBase;

  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={1.2} />
      {/* Cabeçalho flexível: mini selo EXPULSO nunca invade o título */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 18, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, zIndex: 10}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, minWidth: 0, overflow: 'hidden'}}>
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: r.tipo === 'corpo' ? '#ff5a4a' : '#ffd84d', whiteSpace: 'nowrap', ...CONTORNO(6)}}>{titulo}</span>
          <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 23, color: '#cfe0ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>partida {log.partida} · tique {r.tique} · {r.chamador} chamou · {SALA[r.sala] ?? r.sala}</span>
        </div>
        {carimbo >= 0 && ocupado ? (
          <div style={{flex: 'none', fontFamily: FONTE, fontWeight: 900, fontSize: 28, color: '#fff', background: r.expulso ? '#d81818' : '#3a4a6a', border: '4px solid #fff', borderRadius: 12, padding: '3px 18px', boxShadow: '0 6px 0 #0008', whiteSpace: 'nowrap', ...CONTORNO(2)}}>{resultado}</div>
        ) : null}
      </div>

      <AbsoluteFill style={{transform: `scale(${zoomMesa})`, transformOrigin: `${ox}% ${oy}%`}}>
        <div style={{position: 'absolute', left: 40, top: 96, width: 1840, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: ehVotos ? 10 : 14}}>
          {js.map((j, i) => {
            const fala = falando.includes(j.cor);
            const votos = eleitores.slice(0, nV).filter((e) => r.votos[e] === j.cor);
            const alvo = carimbo >= 0 && r.expulso === j.cor;
            const ent = spring({frame: f - i * 1.2, fps, config: {damping: 15}});
            const opBase = !j.vivo ? 0.44 : (fase === 'discussao' && falando.length > 0 && !fala) ? 0.62 : (carimbo >= 0 && r.expulso && !alvo ? 0.7 : 1);
            return (
              <div key={j.cor} style={{position: 'relative', height: cardH, borderRadius: 16, padding: ehVotos ? '8px 12px' : '10px 12px', boxSizing: 'border-box', background: !j.vivo ? '#2a3040' : alvo ? '#ffd4d4' : '#e9eef7', border: `5px solid ${fala ? '#ffd84d' : alvo ? '#e01818' : '#0b1020'}`, opacity: opBase * ent,
                transform: `scale(${fala ? 1.06 : alvo ? 1.03 : 1}) translateY(${(1 - ent) * 26 + (j.vivo ? Math.sin((f + i * 17) / 21) * 2 : 0)}px)`, zIndex: fala ? 5 : alvo ? 4 : 1, boxShadow: fala ? '0 0 38px #ffd84ddd, 0 8px 0 #0008' : alvo ? '0 0 40px #ff2222cc, 0 8px 0 #0008' : '0 6px 0 #0007'}}>
                {fala && fase === 'discussao' ? (
                  <div style={{position: 'absolute', right: 10, top: -14, fontFamily: FONTE, fontWeight: 900, fontSize: 14, letterSpacing: 1.5, color: '#0b1020', background: '#ffd84d', border: '3px solid #000', borderRadius: 8, padding: '0 8px'}}>EM FALA</div>
                ) : null}
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                  <Cabeca cor={j.cor} s={ehVotos ? 106 : 120} morto={!j.vivo} />
                  <div style={{minWidth: 0}}>
                    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: ehVotos ? 34 : 38, lineHeight: 1.05, color: !j.vivo ? '#aab' : j.time === 'impostor' && !segredo ? '#d40000' : '#0b1020'}}>{j.cor}</div>
                    <div style={{fontFamily: FONTE, fontWeight: 600, fontSize: 18, color: j.vivo ? '#44506a' : '#99a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{j.modelo}</div>
                    {segredo ? null : <Chip papel={j.papel} time={j.time} fs={15} />}
                  </div>
                  {votos.length ? <div style={{marginLeft: 'auto', fontFamily: FONTE, fontWeight: 900, fontSize: 56, color: '#e01818', ...CONTORNO(4)}}>{votos.length}</div> : null}
                </div>
                <div style={{display: 'flex', gap: 3, marginTop: 5, flexWrap: 'nowrap'}}>
                  {votos.map((e) => <span key={e} style={{width: 16, height: 16, borderRadius: 8, background: corDe(e), border: '2px solid #000', flex: 'none'}} />)}
                </div>
              </div>
            );
          })}
        </div>
        {ehVotos ? (
          <div style={{position: 'absolute', left: 40, right: 40, top: 714, display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 30, color: '#fff', ...CONTORNO(5)}}>QUEM VOTOU EM QUEM · {nV}/{eleitores.length} votos</span>
            {pulos.length ? <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 24, color: '#cfe0ff'}}>pularam: {pulos.length}</span> : null}
          </div>
        ) : null}
        {ehVotos && motivos.length && !ocupado && carimbo < 3 ? (
          <div style={{position: 'absolute', left: 40, right: 40, top: 766, display: 'flex', gap: 18, opacity: carimbo >= 0 ? interpolate(carimbo, [0, 3], [1, 0], cl) : 1}}>
            {motivos.map((m, i) => {
              const a = interpolate(f, [ini + 6 + i * 10, ini + 16 + i * 10], [0, 1], cl);
              return (
                <div key={m.cor} style={{flex: 1, display: 'flex', gap: 14, alignItems: 'flex-start', background: '#0b1020ee', border: `4px solid ${corDe(m.cor)}`, borderRadius: 16, padding: '10px 16px', opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
                  <Cabeca cor={m.cor} s={56} />
                  <div style={{minWidth: 0}}>
                    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 21, color: '#ffd84d'}}>POR QUE {m.cor.toUpperCase()} VOTOU {FEM.has(m.alvo) ? 'NA' : 'NO'} {m.alvo.toUpperCase()}</div>
                    <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: '#fff'}}>"{m.texto}"</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>
      {carimbo >= 0 && !ocupado ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 822, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{position: 'absolute', inset: -14, borderRadius: 30, border: `6px solid ${r.expulso ? '#ff5555' : '#93c5fd'}`, transform: `scale(${interpolate(carimbo, [0, 14], [0.95, 1.38], cl)})`, opacity: interpolate(carimbo, [0, 14], [0.85, 0], cl)}} />
            <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 94, color: '#fff', background: r.expulso ? 'linear-gradient(180deg, #ef2323, #b51010)' : 'linear-gradient(180deg, #4b5e84, #2f3c59)', border: '9px solid #fff', borderRadius: 22, padding: '4px 48px', transform: `rotate(-2.5deg) scale(${interpolate(carimbo, [0, 7], [2.2, 1], cl)})`, opacity: interpolate(f, [0, 3], [0, 1], cl), boxShadow: r.expulso ? '0 14px 0 #0009, 0 0 40px #ff222288' : '0 14px 0 #0009', ...CONTORNO(6)}}>{resultado}</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- ejeção: o expulso voa pelo espaço e o texto revela a função (o jogo revela, as IAs também veem) ----------
export const Ejecao: React.FC<{log: Log; idx: number; f: number; dur: number}> = ({log, idx, f, dur}) => {
  const r = log.reunioes[idx];
  const cor = r.expulso;
  const j = log.jogadores.find((x) => x.cor === cor);
  // partida 4 (revelarExpulso=false): o jogo não diz a função de quem sai, nem para as IAs nem na tela
  const revela = log.cfg.revelarExpulso !== false;
  const linha = !cor ? 'Ninguém foi expulso.' : !revela ? `${cor} foi ${FEM.has(cor) ? 'ejetada' : 'ejetado'}.` : `${cor} ${r.eraImpostor ? 'era' : 'não era'} ${FEM.has(cor) ? 'Impostora' : 'Impostor'}.`;
  const n = Math.floor(interpolate(f, [16, 16 + linha.length * 1.3], [0, linha.length], cl));
  const fimTxt = 16 + linha.length * 1.3;
  const xPos = interpolate(f, [0, Math.max(60, dur)], [-260, 2040]);
  const yPos = 290 + Math.sin(f / 20) * 32;
  const corHex = cor ? corDe(cor) : '#7c3aed';
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={6.5} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${50 + Math.sin(f / 45) * 12}% 38%, ${corHex}2a, transparent 58%)`, pointerEvents: 'none'}} />
      {cor ? (
        <>
          {[1, 2, 3, 4].map((k) => (
            <div key={k} style={{position: 'absolute', left: xPos - k * 54 + 40, top: yPos + 100 + Math.sin((f - k * 4) / 14) * 14, width: 32 - k * 5, height: 10 - k * 1.5, borderRadius: 99, background: corHex, opacity: 0.42 - k * 0.08, filter: 'blur(3px)'}} />
          ))}
          <div style={{position: 'absolute', left: xPos, top: yPos, transform: `rotate(${f * 5.4}deg)`, filter: `drop-shadow(0 0 28px ${corHex}88)`}}>
            <Crewmate4 cor={cor} size={230} t={f} />
          </div>
        </>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 604, textAlign: 'center'}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 84, color: '#fff', ...CONTORNO(10)}}>{linha.slice(0, n)}</div>
        {cor && j ? (
          <div style={{marginTop: 18, opacity: interpolate(f, [fimTxt + 4, fimTxt + 12], [0, 1], cl), transform: `scale(${interpolate(f, [fimTxt + 4, fimTxt + 12], [1.5, 1], cl)})`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
            {revela ? (
              <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#fff', background: corTime(r.eraImpostor ? 'impostor' : j.time === 'impostor' ? 'tripulante' : j.time), border: '6px solid #fff', borderRadius: 16, padding: '2px 28px', boxShadow: '0 10px 0 #0007'}}>{papelNome(String(r.papelExpulso ?? j.papel)).toUpperCase()}</span>
            ) : (
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#fde68a', background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '5px dashed #fbbf24', borderRadius: 16, padding: '4px 28px', boxShadow: '0 0 30px rgba(251,191,36,0.28)'}}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none"><rect x={5} y={11} width={14} height={10} rx={2.5} fill="#fbbf24" stroke="#000" strokeWidth={1.8} /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round" /></svg>
                FUNÇÃO NÃO REVELADA
              </span>
            )}
            <span style={{fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: '#cfe0ff', ...CONTORNO(4)}}>{j.modelo}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- cartões das funções que estreiam na parte ----------
export type PapelCartao = {nome: string; time: string; frase: string; ideia?: string};
export const Papeis: React.FC<{lista: PapelCartao[]; titulo?: string; f: number; dur: number}> = ({lista, titulo = 'ESTREIA NESTA PARTIDA', f, dur}) => {
  const {fps} = useVideoConfig();
  const passo = Math.max(14, Math.min(50, (dur - 50) / Math.max(1, lista.length)));
  const cols = lista.length === 4 ? 2 : Math.min(3, lista.length);
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={2} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 40, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: titulo.length > 30 ? 52 : 62, color: '#ffd84d', ...CONTORNO(8), letterSpacing: titulo.length > 30 ? 1 : 3}}>{titulo}</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 170, bottom: 50, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 26, alignContent: 'center', transform: `scale(${1 + 0.03 * (f / Math.max(1, dur))})`}}>
        {lista.map((p, i) => {
          const e = spring({frame: f - 8 - i * passo, fps, config: {damping: 12, stiffness: 150}});
          return (
            <div key={p.nome} style={{...PAINEL, border: `6px solid ${corTime(p.time)}`, padding: '16px 24px 18px', opacity: Math.min(1, e * 1.4), transform: `scale(${0.5 + 0.5 * e}) rotate(${(1 - e) * (i % 2 ? 6 : -6)}deg)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 50, color: '#fff', ...CONTORNO(6)}}>{p.nome}</span>
                <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 18, color: '#fff', background: corTime(p.time), border: '3px solid #000', borderRadius: 8, padding: '1px 10px', letterSpacing: 1}}>{p.time.toUpperCase()}</span>
              </div>
              <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: '#e6eeff', lineHeight: 1.2, marginTop: 4}}>{p.frase}</div>
              {p.ideia ? <div style={{marginTop: 10, display: 'inline-block', fontFamily: FONTE, fontWeight: 900, fontSize: 22, color: '#111', background: '#ffd84d', border: '3px solid #000', borderRadius: 10, padding: '1px 12px', transform: 'rotate(-2deg)'}}>ideia de {p.ideia}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- elenco: as 12 IAs e o modelo de cada cor (fixo nas 4 partidas); os 3 personagens fixos em destaque ----------
export const Elenco: React.FC<{log: Log; f: number; dur: number; titulo?: string; destaques?: string[]; nota?: Record<string, string>}> = ({log, f, dur, titulo = '12 IAs · 4 PARTIDAS · THE SKELD', destaques = [], nota = {}}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 62, color: '#ffd84d', ...CONTORNO(8), letterSpacing: 2}}>{titulo}</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 200, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '40px 14px', transform: `scale(${1 + 0.03 * (f / Math.max(1, dur))})`}}>
        {log.jogadores.map((j, i) => {
          const e = spring({frame: f - 4 - i * 2.6, fps, config: {damping: 11, stiffness: 180}});
          const d = destaques.includes(j.cor);
          return (
            <div key={j.cor} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 4px 12px', borderRadius: 22, background: d ? '#ffd84d26' : 'transparent', border: d ? '5px solid #ffd84d' : '5px solid transparent', boxShadow: d ? `0 0 ${24 + 10 * Math.sin(f / 9)}px #ffd84d88` : undefined, transform: `scale(${e}) translateY(${Math.sin((f + i * 13) / 14) * 4}px)`}}>
              {d ? <div style={{position: 'absolute', top: -22, fontFamily: FONTE, fontWeight: 900, fontSize: 18, color: '#111', background: '#ffd84d', border: '3px solid #000', borderRadius: 8, padding: '0 10px', letterSpacing: 1}}>FIQUE DE OLHO</div> : null}
              <Crewmate4 cor={j.cor} size={150} t={f + i * 9} />
              <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 36, color: '#fff', ...CONTORNO(5), marginTop: -4}}>{j.cor}</div>
              <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 19, color: '#0b1020', background: '#e9eef7', border: '3px solid #000', borderRadius: 8, padding: '0 8px', whiteSpace: 'nowrap'}}>{j.modelo}</div>
              {nota[j.cor] ? <div style={{marginTop: 6, fontFamily: FONTE, fontWeight: 900, fontSize: 17, color: '#fff', background: '#1f9d3a', border: '3px solid #000', borderRadius: 8, padding: '0 8px', whiteSpace: 'nowrap', transform: 'rotate(-3deg)'}}>{nota[j.cor].toUpperCase()}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- placar / prêmios do fechamento ----------
export type LinhaPlacar = {rotulo: string; valor: string; cor?: string; quem?: string};
export const Placar: React.FC<{titulo: string; linhas: LinhaPlacar[]; f: number; dur: number}> = ({titulo, linhas, f, dur}) => {
  const {fps} = useVideoConfig();
  const passo = Math.max(16, Math.min(70, (dur - 40) / Math.max(1, linhas.length)));
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 66, color: '#ffd84d', ...CONTORNO(8), letterSpacing: 2}}>{titulo}</div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 160, bottom: 36, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, transform: `scale(${1 + 0.03 * (f / Math.max(1, dur))})`}}>
        {linhas.map((l, i) => {
          const e = spring({frame: f - 10 - i * passo, fps, config: {damping: 13, stiffness: 160}});
          return (
            <div key={l.rotulo} style={{...PAINEL, display: 'flex', alignItems: 'center', gap: 22, padding: '10px 26px', opacity: Math.min(1, e * 1.5), transform: `translateX(${(1 - e) * (i % 2 ? 700 : -700)}px)`}}>
              {l.quem ? <Crewmate4 cor={l.quem} size={78} t={f} /> : null}
              <span style={{width: 440, flex: 'none', fontFamily: FONTE, fontWeight: 900, fontSize: 34, lineHeight: 1.1, color: '#fff'}}>{l.rotulo}</span>
              <span style={{flex: 1, textAlign: 'right', fontFamily: FONTE, fontWeight: 900, fontSize: l.valor.length > 40 ? 34 : 42, lineHeight: 1.15, color: l.cor ?? '#ffd84d', ...CONTORNO(5)}}>{l.valor}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- encerramento cinematográfico: ROXO vs MARROM (substitui tela de reunião congelada) ----------
export const Encerramento: React.FC<{titulo: string; sub?: string; f: number; dur: number; comMeme?: boolean}> = ({titulo, sub, f, dur, comMeme}) => {
  const {fps} = useVideoConfig();
  const eT = spring({frame: f, fps, config: {damping: 13, stiffness: 150}});
  const eL = spring({frame: f - 8, fps, config: {damping: 12, stiffness: 140}});
  const eR = spring({frame: f - 14, fps, config: {damping: 12, stiffness: 140}});
  const eVs = spring({frame: f - 20, fps, config: {damping: 10, stiffness: 180}});
  const pulse = 0.25 + 0.1 * Math.sin(f / 9);
  const floatL = Math.sin(f / 14) * 10;
  const floatR = Math.cos(f / 14) * 10;
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={2.6} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 24% 54%, rgba(168,85,247,${pulse}), transparent 48%), radial-gradient(circle at 68% 54%, rgba(239,68,68,${pulse}), transparent 48%)`, pointerEvents: 'none'}} />
      {/* Barras cinema letterbox */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 48, background: '#02040a', borderBottom: '2px solid rgba(255,216,77,0.35)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 48, background: '#02040a', borderTop: '2px solid rgba(255,216,77,0.35)'}} />

      {/* Título principal */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 74, textAlign: 'center', transform: `scale(${0.8 + 0.2 * eT})`, opacity: eT}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 74, color: '#ffd84d', letterSpacing: 2, lineHeight: 1.05, textShadow: '0 0 36px rgba(255,216,77,0.35)', ...CONTORNO(9)}}>{titulo.toUpperCase()}</div>
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#e2e8f0', marginTop: 8, ...CONTORNO(5)}}>{sub}</div> : null}
      </div>

      {/* Palco do Duelo (com espaço limpo à direita quando o meme entra) */}
      <div style={{position: 'absolute', left: 70, right: comMeme ? 510 : 70, top: 248, bottom: 138, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, transition: 'right 0.25s'}}>
        {/* Card ROXO */}
        <div style={{flex: 1, maxWidth: 560, ...PAINEL, border: '6px solid #a855f7', background: 'linear-gradient(180deg, rgba(44,20,78,0.92), rgba(14,10,34,0.96))', padding: '26px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 42px rgba(168,85,247,0.3)', transform: `translateX(${(1 - eL) * -140}px) translateY(${floatL}px)`, opacity: eL}}>
          <Crewmate4 cor="Roxo" size={175} t={f} />
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#e9d5ff', marginTop: 4, ...CONTORNO(6)}}>ROXO</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 2}}>
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 20, color: '#cbd5e1'}}>Claude Sonnet</span>
            <Chip papel="Detetive" time="tripulante" fs={17} />
          </div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 24, color: '#fff', marginTop: 14, lineHeight: 1.25}}>Tinha a prova no bolso — mas caiu 4 x 3</div>
        </div>

        {/* Badge VS */}
        <div style={{flex: 'none', width: 106, height: 106, borderRadius: 999, background: 'linear-gradient(180deg, #ffd84d, #f59e0b)', border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#0b1020', boxShadow: '0 12px 30px rgba(0,0,0,0.7), 0 0 36px rgba(255,216,77,0.55)', transform: `scale(${eVs}) rotate(-6deg)`}}>VS</div>

        {/* Card MARROM */}
        <div style={{flex: 1, maxWidth: 560, ...PAINEL, border: '6px solid #ef4444', background: 'linear-gradient(180deg, rgba(72,22,22,0.92), rgba(24,10,14,0.96))', padding: '26px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 42px rgba(239,68,68,0.3)', transform: `translateX(${(1 - eR) * 140}px) translateY(${floatR}px)`, opacity: eR}}>
          <Crewmate4 cor="Marrom" size={175} t={f + 12} virado />
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#fecaca', marginTop: 4, ...CONTORNO(6)}}>MARROM</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 2}}>
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 20, color: '#cbd5e1'}}>MiniMax M3.1</span>
            <Chip papel="Metamorfo" time="impostor" fs={17} />
          </div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 24, color: '#fff', marginTop: 14, lineHeight: 1.25}}>Usou a cara do Roxo e virou o jogo</div>
        </div>
      </div>

      {/* Rodapé de engajamento */}
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 68, textAlign: 'center', opacity: interpolate(f, [28, 44], [0, 1], cl)}}>
        <span style={{display: 'inline-block', fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: '#fef08a', background: 'rgba(15,23,42,0.88)', border: '3px solid rgba(255,216,77,0.65)', borderRadius: 14, padding: '6px 28px', letterSpacing: 1}}>
          QUAL JOGO AS IAs DEVEM JOGAR NO LUGAR DO AMONG? COMENTA AÍ!
        </span>
      </div>
    </AbsoluteFill>
  );
};
