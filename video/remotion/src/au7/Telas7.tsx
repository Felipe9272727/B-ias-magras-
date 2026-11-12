// Telas cheias do AMONG IA 7 (sem mapa): mesa de reunião com as 20 IAs (discussão e votação, lidas do log), ejeção,
// cartões de função que estreia ("ideia de @fulano"), elenco e placar final. O espectador sempre vê função e time.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {Cabeca, Chip, corDe, FONTE, PAINEL} from './Hud7';
import {corTime, papelNome, type Log} from './Jogo7';

// cores que o narrador trata no feminino (a Rose, a Coral, a Banana, a Turquesa, a Rosa)
const FEM = new Set(['Rose', 'Coral', 'Banana', 'Turquesa', 'Rosa']);

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SALA: Record<string, string> = {Lancamento: 'Lançamento', Comunicacoes: 'Comunicações', Vestiario: 'Vestiário', Descontaminacao: 'Descontaminação', Laboratorio: 'Laboratório', Escritorio: 'Escritório', Refeitorio: 'Refeitório', Deposito: 'Depósito'};

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
export const Mesa: React.FC<{log: Log; idx: number; f: number; dur: number; fase: 'discussao' | 'votos'; falando?: string[]}> = ({log, idx, f, dur, fase, falando = []}) => {
  const {fps} = useVideoConfig();
  const r = log.reunioes[idx];
  const js = naReuniao(log, idx);
  const eleitores = Object.keys(r.votos);
  const ini = 14, fimV = Math.max(ini + 30, Math.min(dur * 0.62, ini + eleitores.length * 9));
  const nV = fase === 'votos' ? Math.floor(interpolate(f, [ini, fimV], [0, eleitores.length], cl)) : 0;
  const carimbo = fase === 'votos' ? f - (fimV + 10) : -1;
  const pulos = eleitores.slice(0, nV).filter((e) => r.votos[e] === 'pular');
  const deriva = 1 + 0.035 * (dur > 1 ? f / dur : 0);
  const titulo = r.tipo === 'corpo' ? `CORPO ENCONTRADO: ${String(r.corpo ?? '').toUpperCase()}` : 'REUNIÃO DE EMERGÊNCIA';
  const resultado = r.juiz ? 'ANULADO PELO JUIZ' : r.expulso ? `${r.expulso.toUpperCase()} ${FEM.has(r.expulso) ? 'EXPULSA' : 'EXPULSO'}` : 'NINGUÉM EXPULSO';
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={1.2} />
      <AbsoluteFill style={{transform: `scale(${deriva})`, transformOrigin: '50% 0%'}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 22, display: 'flex', alignItems: 'baseline', gap: 22}}>
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 50, color: r.tipo === 'corpo' ? '#ff5a4a' : '#ffd84d', ...CONTORNO(7)}}>{titulo}</span>
          <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 26, color: '#cfe0ff'}}>partida {log.partida} · tique {r.tique} · {r.chamador} chamou · {SALA[r.sala] ?? r.sala}</span>
        </div>
        <div style={{position: 'absolute', left: 40, top: 104, width: 1840, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12}}>
          {js.map((j, i) => {
            const fala = falando.includes(j.cor);
            const votos = eleitores.slice(0, nV).filter((e) => r.votos[e] === j.cor);
            const alvo = carimbo >= 0 && r.expulso === j.cor && !r.juiz;
            const ent = spring({frame: f - i * 1.2, fps, config: {damping: 15}});
            return (
              <div key={j.cor} style={{position: 'relative', height: 160, borderRadius: 16, padding: '10px 12px', boxSizing: 'border-box', background: !j.vivo ? '#2a3040' : alvo ? '#ffd2d2' : '#e9eef7', border: `5px solid ${fala ? '#ffd84d' : alvo ? '#e01818' : '#0b1020'}`, opacity: (j.vivo ? 1 : 0.55) * ent,
                transform: `scale(${fala ? 1.07 : 1}) translateY(${(1 - ent) * 30 + (j.vivo ? Math.sin((f + i * 17) / 21) * 2 : 0)}px)`, zIndex: fala ? 5 : 1, boxShadow: fala ? '0 0 34px #ffd84dcc' : '0 6px 0 #0007'}}>
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                  <Cabeca cor={j.cor} s={84} morto={!j.vivo} />
                  <div style={{minWidth: 0}}>
                    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 33, lineHeight: 1.05, color: !j.vivo ? '#aab' : j.time === 'impostor' ? '#d40000' : '#0b1020'}}>{j.cor}</div>
                    <div style={{fontFamily: FONTE, fontWeight: 600, fontSize: 17, color: j.vivo ? '#44506a' : '#99a', whiteSpace: 'nowrap', overflow: 'hidden'}}>{j.modelo}</div>
                    <Chip papel={j.papel} time={j.time} fs={16} />
                  </div>
                  {votos.length ? <div style={{marginLeft: 'auto', fontFamily: FONTE, fontWeight: 900, fontSize: 60, color: '#e01818', ...CONTORNO(5)}}>{votos.length}</div> : null}
                </div>
                <div style={{display: 'flex', gap: 3, marginTop: 5, flexWrap: 'nowrap'}}>
                  {votos.map((e) => <span key={e} style={{width: 17, height: 17, borderRadius: 9, background: corDe(e), border: '2px solid #000', flex: 'none'}} />)}
                </div>
              </div>
            );
          })}
        </div>
        {fase === 'votos' ? (
          <div style={{position: 'absolute', left: 40, right: 40, top: 800, display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 34, color: '#fff', ...CONTORNO(5)}}>QUEM VOTOU EM QUEM · {nV}/{eleitores.length} votos</span>
            {pulos.length ? <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 26, color: '#cfe0ff'}}>pularam: {pulos.length}</span> : null}
          </div>
        ) : null}
      </AbsoluteFill>
      {carimbo >= 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 866, display: 'flex', justifyContent: 'center'}}>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 110, color: '#fff', background: r.juiz ? '#b8860b' : r.expulso ? '#d81818' : '#3a4a6a', border: '10px solid #fff', borderRadius: 22, padding: '0 50px', transform: `rotate(-4deg) scale(${interpolate(carimbo, [0, 7], [2.6, 1], cl)})`, opacity: interpolate(carimbo, [0, 3], [0, 1], cl), boxShadow: '0 16px 0 #0009', ...CONTORNO(6)}}>{resultado}</div>
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
  const linha = !cor ? (r.juiz ? `O Juiz ${r.juiz.cor} anulou a votação.` : 'Ninguém foi expulso.') : `${cor} ${r.eraImpostor ? 'era' : 'não era'} ${FEM.has(cor) ? 'Impostora' : 'Impostor'}.`;
  const n = Math.floor(interpolate(f, [16, 16 + linha.length * 1.3], [0, linha.length], cl));
  const fimTxt = 16 + linha.length * 1.3;
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={5} />
      {cor ? (
        <div style={{position: 'absolute', left: interpolate(f, [0, Math.max(60, dur)], [-260, 2000]), top: 300 + Math.sin(f / 20) * 30, transform: `rotate(${f * 5}deg)`}}>
          <Crewmate4 cor={cor} size={230} t={f} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center'}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 84, color: '#fff', ...CONTORNO(10)}}>{linha.slice(0, n)}</div>
        {cor && j ? (
          <div style={{marginTop: 16, opacity: interpolate(f, [fimTxt + 4, fimTxt + 12], [0, 1], cl), transform: `scale(${interpolate(f, [fimTxt + 4, fimTxt + 12], [1.6, 1], cl)})`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
            <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#fff', background: corTime(r.eraImpostor ? 'impostor' : j.time === 'impostor' ? 'tripulante' : j.time), border: '6px solid #fff', borderRadius: 16, padding: '0 26px'}}>{papelNome(String(r.papelExpulso ?? j.papel)).toUpperCase()}</span>
            <span style={{fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: '#cfe0ff'}}>{j.modelo}</span>
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 62, color: '#ffd84d', ...CONTORNO(8), letterSpacing: 3}}>{titulo}</div>
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

// ---------- elenco: as 20 IAs e o modelo de cada cor (fixo nas 4 partidas) ----------
export const Elenco: React.FC<{log: Log; f: number; dur: number; titulo?: string; papeis?: boolean}> = ({log, f, dur, titulo = '20 IAs · 4 PARTIDAS · MIRA HQ', papeis}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 62, color: '#ffd84d', ...CONTORNO(8), letterSpacing: 2}}>{titulo}</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 150, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '18px 14px', transform: `scale(${1 + 0.03 * (f / Math.max(1, dur))})`}}>
        {log.jogadores.map((j, i) => {
          const e = spring({frame: f - 4 - i * 2.2, fps, config: {damping: 11, stiffness: 180}});
          const imp = papeis && j.time === 'impostor';
          return (
            <div key={j.cor} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${e}) translateY(${Math.sin((f + i * 13) / 14) * 4}px)`}}>
              <Crewmate4 cor={j.cor} size={118} t={f + i * 9} />
              <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 30, color: imp ? '#ff6a5a' : '#fff', ...CONTORNO(5), marginTop: -4}}>{j.cor}</div>
              <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 18, color: '#0b1020', background: '#e9eef7', border: '3px solid #000', borderRadius: 8, padding: '0 8px'}}>{j.modelo}</div>
              {papeis ? <div style={{marginTop: 3}}><Chip papel={j.papel} time={j.time} fs={15} /></div> : null}
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
      <div style={{position: 'absolute', left: 150, right: 150, top: 170, bottom: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, transform: `scale(${1 + 0.03 * (f / Math.max(1, dur))})`}}>
        {linhas.map((l, i) => {
          const e = spring({frame: f - 10 - i * passo, fps, config: {damping: 13, stiffness: 160}});
          return (
            <div key={l.rotulo} style={{...PAINEL, display: 'flex', alignItems: 'center', gap: 22, padding: '10px 26px', opacity: Math.min(1, e * 1.5), transform: `translateX(${(1 - e) * (i % 2 ? 700 : -700)}px)`}}>
              {l.quem ? <Crewmate4 cor={l.quem} size={84} t={f} /> : null}
              <span style={{flex: 1, fontFamily: FONTE, fontWeight: 900, fontSize: 40, color: '#fff'}}>{l.rotulo}</span>
              <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 56, color: l.cor ?? '#ffd84d', ...CONTORNO(6)}}>{l.valor}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
