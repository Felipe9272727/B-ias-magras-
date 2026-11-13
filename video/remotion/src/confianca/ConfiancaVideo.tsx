// JOGO DE CONFIANÇA (ideia do @Pursuer_M4). Lê public/timeline_confianca.json (build_timeline_confianca.py: storyboard do Fable
// + roteiro_confianca.py) e public/confianca/partida.json (o log da partida). Identidade (direcao_edicao.md): central
// telefônica vista de cima, feltro verde-garrafa, papel creme = a verdade que só o público vê, fio = o que foi dito.
// Placar secreto: cadeado no canto até a revelação. Nada de emoji: telefone, bomba, alicate, cadeado são desenho nosso.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {Selo} from '../au7/Hud7';

const FELTRO = '#10261F', PAPEL = '#F4EBD0', ESCURO = '#9E1B1F', AMAR = '#FFC83D';
const COR: Record<string, string> = {Vermelho: '#E0262B', Azul: '#3D7BF2', Verde: '#19A974', Amarelo: '#FFC83D', Rosa: '#FF6FB5', Laranja: '#F2802E', Roxo: '#8E4DE0', Ciano: '#22C7D6'};
const FIO: Record<string, string> = {vermelho: ESCURO, azul: '#2E6BE6', amarelo: '#F5C518', verde: '#1E9E5A', branco: '#F2F2F2', preto: '#1A1A1A'};
const CORES = ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Laranja', 'Roxo', 'Ciano'];
const POP = "'Poppins', sans-serif", MONO = "'JetBrains Mono', monospace", BANG = "'Bangers', 'Poppins', sans-serif";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const C = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const sombra = '10px 10px 0 #000';

type V = {tipo: string; [k: string]: any};
type Over =
  | {tipo: 'cita'; at: number; dur: number; cor: string | null; tipoCita: string; texto: string; mt?: number[]}
  | {tipo: 'selo'; at: number; dur: number; texto: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo}
  | {tipo: 'capitulo'; at: number; dur: number; titulo: string; regra: string};
type Cena = {id: string; dur: number; visual: V; over: Over[]; audio: {src: string; at: number; vol?: number}[]};
type TL = {cenas: Cena[]};
type P = any;

export const calcConfianca: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_confianca.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const Feltro: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #1b3d31 0%, ${FELTRO} 60%, #07130f 100%)`}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(#ffffff09 1px, transparent 1px)', backgroundSize: '6px 6px', backgroundPosition: `${f * 0.2}px 0`}} />
  </AbsoluteFill>
);

// telefone de disco (desenho nosso)
const Telefone: React.FC<{cor: string; s: number; fora?: boolean; cinza?: boolean}> = ({cor, s, fora, cinza}) => {
  const c = cinza ? '#5b6168' : COR[cor];
  return (
    <svg width={s} height={s * 0.85} viewBox="0 0 120 102">
      <path d="M14 58 Q10 30 60 30 Q110 30 106 58 L112 92 Q112 100 104 100 L16 100 Q8 100 8 92 Z" fill={c} stroke="#000" strokeWidth={5} />
      <circle cx={60} cy={70} r={22} fill="#f4ebd0" stroke="#000" strokeWidth={4} />
      {Array.from({length: 10}).map((_, i) => { const a = (i / 10) * Math.PI * 2; return <circle key={i} cx={60 + 15 * Math.cos(a)} cy={70 + 15 * Math.sin(a)} r={3.2} fill="#000" />; })}
      <g transform={fora ? 'translate(18 -22) rotate(-24 60 18)' : ''}>
        <path d="M10 22 Q10 8 26 8 L94 8 Q110 8 110 22 L110 28 L92 28 L88 18 L32 18 L28 28 L10 28 Z" fill={c} stroke="#000" strokeWidth={5} />
      </g>
    </svg>
  );
};

// ---------- a mesa telefônica (8 telefones em roda; ligações do tique viajando pelo fio) ----------
const pos = (i: number) => { const a = -Math.PI / 2 + (i / 8) * Math.PI * 2; return {x: 960 + 640 * Math.cos(a), y: 545 + 330 * Math.sin(a)}; };
const Mesa: React.FC<{v: V; p: P; f: number; dur: number}> = ({v, p, f, dur}) => {
  const mj = p.minijogos[(v.mj ?? 1) - 1];
  const tq = mj?.tiques?.[(v.tique ?? 1) - 1];
  const foco: string[] = v.foco ?? [];
  const J: Record<string, any> = Object.fromEntries(p.jogadores.map((j: any) => [j.cor, j]));
  const etiqueta = (cor: string) => {
    if (v.etiquetas === 'nomes') return p.minijogos[0].detalhe.nomes?.[cor];
    if (v.etiquetas === 'fantasias') { const d = p.minijogos[3].detalhe; return cor === d.impostor ? d.diferente : d.comum; }
    if (v.etiquetas === 'bombas') return p.minijogos[4].detalhe.estado?.[cor]?.toUpperCase();
    return null;
  };
  const lig = (tq?.ligacoes ?? []) as any[];
  const k = interpolate(f, [10, Math.max(30, dur * 0.6)], [0, 1], cl);
  // câmera: deriva lenta e leve puxada para o foco
  const fx = foco.length ? foco.map((c) => pos(CORES.indexOf(c)).x).reduce((a, b) => a + b, 0) / foco.length : 960;
  const fy = foco.length ? foco.map((c) => pos(CORES.indexOf(c)).y).reduce((a, b) => a + b, 0) / foco.length : 540;
  const z = (foco.length ? 1.07 : 1) * (1 + 0.04 * (f / Math.max(1, dur)));
  const cx = 960 + (fx - 960) * 0.25 * (foco.length ? 1 : 0), cy = 540 + (fy - 540) * 0.2 * (foco.length ? 1 : 0);
  return (
    <AbsoluteFill style={{transform: `translate(${960 - cx}px, ${540 - cy}px) scale(${z})`, transformOrigin: `${cx}px ${cy}px`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={960} cy={540} rx={470} ry={240} fill="#0c1f19" stroke="#2c5446" strokeWidth={6} />
        {lig.map((l, i) => {
          const a = pos(CORES.indexOf(l.de)), b = pos(CORES.indexOf(l.para));
          const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.15, my = (a.y + b.y) / 2 - (b.x - a.x) * 0.15;
          const d = `M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
          const ki = interpolate(k, [i / (lig.length + 2), i / (lig.length + 2) + 0.35], [0, 1], cl);
          const caiu = !!l.caiu;
          const destaque = foco.length === 0 || foco.includes(l.de) || foco.includes(l.para);
          return (
            <g key={i} opacity={destaque ? 1 : 0.18}>
              <path d={d} fill="none" stroke={caiu ? '#666' : COR[l.de]} strokeWidth={caiu ? 4 : 8} strokeDasharray={caiu ? '10 10' : undefined} pathLength={1} style={{strokeDasharray: caiu ? undefined : `${ki} 1`}} />
              {!caiu && ki > 0.02 && ki < 0.999 ? <circle r={14} fill="#fff" stroke={COR[l.de]} strokeWidth={6} cx={(1 - ki * 0.5) ** 2 * a.x + 2 * (1 - ki * 0.5) * (ki * 0.5) * mx + (ki * 0.5) ** 2 * b.x} cy={(1 - ki * 0.5) ** 2 * a.y + 2 * (1 - ki * 0.5) * (ki * 0.5) * my + (ki * 0.5) ** 2 * b.y} /> : null}
              {l.vivaVoz ? CORES.filter((c) => c !== l.de && c !== l.para).map((c) => { const q = pos(CORES.indexOf(c)); return <line key={c} x1={a.x} y1={a.y} x2={q.x} y2={q.y} stroke={COR[l.de]} strokeWidth={3} strokeDasharray="6 8" opacity={ki} />; }) : null}
            </g>
          );
        })}
      </svg>
      {CORES.map((cor, i) => {
        const q = pos(i);
        const ligou = lig.some((l) => l.de === cor);
        const cortado = (tq?.poderes ?? []).some((pp: any) => pp.poder === 'cortar' && pp.alvo === cor);
        const em = foco.length === 0 || foco.includes(cor);
        const et = etiqueta(cor);
        return (
          <div key={cor} style={{position: 'absolute', left: q.x - 90, top: q.y - 95, width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: em ? 1 : 0.4, transform: `scale(${foco.includes(cor) ? 1.25 : 1})`}}>
            {et ? <div style={{fontFamily: POP, fontWeight: 900, fontSize: 22, background: PAPEL, border: '3px solid #000', borderRadius: 6, padding: '0 10px', marginBottom: 4, transform: 'rotate(-3deg)'}}>{et}</div> : null}
            <Telefone cor={cor} s={130} fora={ligou} cinza={cortado} />
            <div style={{fontFamily: POP, fontWeight: 900, fontSize: 26, color: COR[cor], ...C(5)}}>{cor.toUpperCase()}</div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 15, color: '#000', background: '#f4ebd0', border: '2px solid #000', borderRadius: 4, padding: '0 6px', whiteSpace: 'nowrap'}}>{J[cor]?.profissao?.toUpperCase()} · {J[cor]?.modelo}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#9fd8c0'}}>MINIJOGO {v.mj ?? 1} · TIQUE {v.tique ?? 1}{lig.length ? '' : ' · (nenhuma ligação)'}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 545, textAlign: 'center', fontFamily: POP, fontWeight: 800, fontSize: 22, color: AMAR}}>{lig.length ? 'a mensagem só chega no próximo tique' : ''}</div>
    </AbsoluteFill>
  );
};

const Cartao: React.FC<{v: V; f: number}> = ({v, f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1500, background: PAPEL, border: '8px solid #000', borderRadius: 14, boxShadow: sombra, padding: '40px 60px', transform: `scale(${0.7 + 0.3 * e}) rotate(-1deg)`}}>
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 64, color: '#1d1a12'}}>{v.titulo}</div>
        {(v.linhas ?? []).map((l: string, i: number) => <div key={i} style={{fontFamily: POP, fontWeight: 700, fontSize: 46, color: '#2a261c', marginTop: 18, fontStyle: 'italic', opacity: interpolate(f, [14 + i * 12, 24 + i * 12], [0, 1], cl), background: `linear-gradient(transparent 60%, ${AMAR}aa 60%)`}}>"{l}"</div>)}
        {v.selo ? <div style={{marginTop: 30, display: 'inline-block', fontFamily: BANG, fontSize: 52, color: '#fff', background: ESCURO, border: '6px solid #000', borderRadius: 10, padding: '4px 22px', transform: 'rotate(-3deg)'}}>{v.selo}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const Telao: React.FC<{v: V; p: P; f: number; dur: number}> = ({v, p, f, dur}) => {
  const mj = p.minijogos[1];
  const t = v.tique ?? 1;
  const bots = (mj.botoes ?? []).filter((b: any) => b.tique === t);
  const abre = interpolate(f, [dur * 0.55, dur * 0.55 + 12], [0, 1], cl);
  const Botao = ({b}: {b: string}) => <div style={{width: 130, height: 130, borderRadius: 65, border: '6px solid #000', background: abre > 0.5 ? (b === 'verde' ? '#1E9E5A' : ESCURO) : '#444', boxShadow: '0 8px 0 #000'}} />;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 72, color: '#fff', ...C(8)}}>TELÃO · RODADA {t} DE 7</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36}}>
        {bots.map((b: any, i: number) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, background: '#0b1a15', border: '6px solid #2c5446', borderRadius: 18, padding: '18px 26px'}}>
            <div style={{textAlign: 'center'}}><Telefone cor={b.a} s={150} /><div style={{fontFamily: POP, fontWeight: 900, fontSize: 34, color: COR[b.a]}}>{b.a}</div></div>
            <Botao b={b.botaoA} />
            <div style={{fontFamily: BANG, fontSize: 44, color: '#fff'}}>x</div>
            <Botao b={b.botaoB} />
            <div style={{textAlign: 'center'}}><Telefone cor={b.b} s={150} /><div style={{fontFamily: POP, fontWeight: 900, fontSize: 34, color: COR[b.b]}}>{b.b}</div></div>
            {abre > 0.5 ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: AMAR}}>{b.ganhoA} · {b.ganhoB}</div> : null}
          </div>
        ))}
      </div>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, color: '#cfe9dc'}}>verde + verde: 3 cada · vermelho + vermelho: 1 cada · vermelho contra verde: 5 x 0</div>
    </AbsoluteFill>
  );
};

const Barras: React.FC<{titulo: string; itens: [string, number, string?][]; f: number; max?: number}> = ({titulo, itens, f, max}) => {
  const m = max ?? Math.max(1, ...itens.map((x) => x[1]));
  return (
    <AbsoluteFill style={{padding: '70px 140px', justifyContent: 'center', gap: 16}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 56, color: '#fff', ...C(8), marginBottom: 10}}>{titulo}</div>
      {itens.map(([cor, val, et], i) => {
        const g = interpolate(f, [10 + i * 8, 30 + i * 8], [0, 1], cl);
        return (
          <div key={cor} style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 190, fontFamily: POP, fontWeight: 900, fontSize: 32, color: COR[cor], ...C(4)}}>{cor.toUpperCase()}</div>
            <div style={{height: 54, width: Math.max(8, 1250 * (val / m) * g), background: COR[cor], border: '4px solid #000', borderRadius: 8}} />
            <div style={{fontFamily: BANG, fontSize: 48, color: '#fff', ...C(4), opacity: g}}>{val}</div>
            {et ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: AMAR}}>{et}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Urna: React.FC<{v: V; p: P; f: number}> = ({v, p, f}) => {
  const s = p.minijogos[2].score;
  const g = p.minijogos[2].ganhos ?? {};
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80}}>
      {(['verde', 'vermelho'] as const).map((lado) => (
        <div key={lado} style={{width: 760, background: PAPEL, border: '8px solid #000', borderRadius: 14, boxShadow: sombra, padding: 24}}>
          <div style={{fontFamily: POP, fontWeight: 900, fontSize: 44, color: lado === 'verde' ? '#1E9E5A' : ESCURO}}>VOTOS {lado.toUpperCase()}S ({lado === 'verde' ? '+3' : '-3'})</div>
          {CORES.map((c, i) => (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, opacity: interpolate(f, [8 + i * 4, 16 + i * 4], [0, 1], cl)}}>
              <div style={{width: 160, fontFamily: POP, fontWeight: 900, fontSize: 28, color: COR[c]}}>{c}</div>
              {Array.from({length: s[lado][c] ?? 0}).map((_, k) => <div key={k} style={{width: 34, height: 44, background: lado === 'verde' ? '#1E9E5A' : ESCURO, border: '3px solid #000', borderRadius: 4}} />)}
              {v.resultado && g[c] && ((lado === 'verde' && g[c] > 0) || (lado === 'vermelho' && g[c] < 0)) ? <div style={{fontFamily: BANG, fontSize: 36, color: lado === 'verde' ? '#1E9E5A' : ESCURO}}>{g[c] > 0 ? '+3' : '-3'}</div> : null}
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Vestiario: React.FC<{v: V; p: P; f: number}> = ({v, p, f}) => {
  const d = p.minijogos[3].detalhe;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 54, color: '#fff', ...C(8)}}>VESTIÁRIO MALUCO</div>
      <div style={{display: 'flex', gap: 18}}>
        {CORES.map((c, i) => {
          const dif = c === d.impostor;
          return (
            <div key={c} style={{width: 200, height: 420, position: 'relative', background: '#2b1d14', border: '6px solid #000', borderRadius: 10, overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <Telefone cor={c} s={120} />
                <div style={{fontFamily: POP, fontWeight: 900, fontSize: 26, color: '#000', background: dif && v.revela ? AMAR : PAPEL, border: '3px solid #000', borderRadius: 6, padding: '2px 8px'}}>{dif ? d.diferente : d.comum}</div>
                {v.suspeitos ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: '#fff'}}>aposta: {d.suspeitos?.[c]}</div> : null}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: interpolate(f, [10 + i * 4, 30 + i * 4], [420, 50], cl), background: `repeating-linear-gradient(90deg, ${COR[c]} 0 22px, #00000033 22px 26px)`, borderBottom: '6px solid #000'}} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center', fontFamily: POP, fontWeight: 900, fontSize: 24, color: COR[c], ...C(4)}}>{c}</div>
            </div>
          );
        })}
      </div>
      {v.revela ? <div style={{fontFamily: BANG, fontSize: 60, color: AMAR, ...C(6)}}>O DIFERENTE ERA O {String(d.impostor).toUpperCase()}</div> : <div style={{fontFamily: POP, fontWeight: 800, fontSize: 28, color: '#cfe9dc'}}>ninguém sabe se é o diferente · você sabe</div>}
    </AbsoluteFill>
  );
};

const Bomba: React.FC<{v: V; p: P; f: number; dur: number}> = ({v, p, f, dur}) => {
  const d = p.minijogos[4].detalhe;
  const b = d.bomba[v.cor];
  const corte = v.corte ?? dur * 0.6;
  const cortou = v.fio && f > corte;
  const explodiu = cortou && v.fio !== b.certo;
  const ex = explodiu ? interpolate(f, [corte, corte + 20], [0, 1], cl) : 0;
  const tremor = explodiu && f - corte < 18 ? 14 * (1 - (f - corte) / 18) : 0;
  const alicateY = v.fio ? interpolate(f, [corte - 25, corte], [-120, 0], cl) : -160;
  const idxFio = v.fio ? b.fios.indexOf(v.fio) : -1;
  const holder = d.manual?.[v.cor];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translate(${Math.sin(f * 2.3) * tremor}px, ${Math.cos(f * 2.9) * tremor}px)`}}>
      <div style={{position: 'relative', width: 1100, height: 640, background: '#2a2f36', border: '10px solid #000', borderRadius: 26, boxShadow: sombra}}>
        <div style={{position: 'absolute', left: 30, top: 20, fontFamily: POP, fontWeight: 900, fontSize: 40, color: COR[v.cor], ...C(5)}}>BOMBA DO {v.cor.toUpperCase()}</div>
        <div style={{position: 'absolute', right: 30, top: 24, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#ddd'}}>manual com: <span style={{color: COR[holder]}}>{holder}</span></div>
        <div style={{position: 'absolute', left: 420, top: 120, width: 260, height: 160, background: '#111', border: '6px solid #000', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 64, color: cortou && !explodiu ? '#3a3' : '#f33'}}>{cortou ? (explodiu ? 'BUM' : 'OK') : '00:0' + Math.max(0, 9 - Math.floor(f / 30) % 10)}</div>
        {b.fios.map((fio: string, i: number) => {
          const y = 340 + i * 66;
          const cortado = cortou && i === idxFio;
          return (
            <svg key={fio} width={1000} height={60} style={{position: 'absolute', left: 50, top: y}}>
              <path d={cortado ? 'M10 30 Q240 0 470 30 M530 30 Q760 60 990 30' : 'M10 30 Q250 0 500 30 T990 30'} stroke="#000" strokeWidth={22} fill="none" />
              <path d={cortado ? 'M10 30 Q240 0 470 30 M530 30 Q760 60 990 30' : 'M10 30 Q250 0 500 30 T990 30'} stroke={FIO[fio]} strokeWidth={14} fill="none" />
            </svg>
          );
        })}
        {v.fio ? (
          <svg width={160} height={200} viewBox="0 0 80 100" style={{position: 'absolute', left: 470, top: 300 + idxFio * 66 - 130 + alicateY}}>
            <path d="M30 0 L38 60 M50 0 L42 60" stroke="#c22" strokeWidth={10} strokeLinecap="round" />
            <path d="M38 60 L36 95 M42 60 L44 95" stroke="#777" strokeWidth={8} />
          </svg>
        ) : null}
        {ex > 0 ? <AbsoluteFill style={{background: `radial-gradient(circle, #fff 0%, #ffcf3a ${20 + ex * 30}%, #ff5a1a ${40 + ex * 30}%, transparent ${60 + ex * 40}%)`, opacity: 1 - ex * 0.4, borderRadius: 20}} /> : null}
      </div>
    </AbsoluteFill>
  );
};

const Bombas: React.FC<{p: P; f: number}> = ({p, f}) => {
  const e = p.minijogos[4].detalhe.estado;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
      <div style={{display: 'flex', gap: 22}}>
        {CORES.map((c, i) => <div key={c} style={{width: 190, height: 190, borderRadius: 20, border: '6px solid #000', background: e[c] === 'desarmada' ? '#1e3a2c' : '#3a1a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: interpolate(f, [i * 5, i * 5 + 10], [0, 1], cl)}}>
          <div style={{fontFamily: POP, fontWeight: 900, fontSize: 28, color: COR[c], ...C(4)}}>{c}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: e[c] === 'desarmada' ? '#7f7' : '#f75'}}>{String(e[c]).toUpperCase()}</div>
        </div>)}
      </div>
      <div style={{fontFamily: BANG, fontSize: 140, color: AMAR, ...C(8)}}>{Object.values(e).filter((x) => x === 'desarmada').length} / 8</div>
    </AbsoluteFill>
  );
};

const Trofeus: React.FC<{v: V; f: number}> = ({v, f}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
    {(v.itens ?? []).map(([t, s, cor]: string[], i: number) => (
      <div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, width: 1400, background: PAPEL, border: `7px solid ${COR[cor]}`, borderRadius: 14, boxShadow: sombra, padding: '14px 26px', opacity: interpolate(f, [i * 18, i * 18 + 10], [0, 1], cl), transform: `translateX(${interpolate(f, [i * 18, i * 18 + 10], [200, 0], cl)}px)`}}>
        <svg width={80} height={90} viewBox="0 0 40 46"><path d="M8 2 H32 V14 Q32 26 20 28 Q8 26 8 14 Z M20 28 V36 M12 42 H28" stroke="#000" strokeWidth={3} fill={AMAR} /></svg>
        <div><div style={{fontFamily: POP, fontWeight: 900, fontSize: 40, color: '#1d1a12'}}>{t}</div><div style={{fontFamily: POP, fontWeight: 700, fontSize: 30, color: COR[cor]}}>{s}</div></div>
      </div>
    ))}
  </AbsoluteFill>
);

const Visual: React.FC<{v: V; p: P; f: number; dur: number}> = ({v, p, f, dur}) => {
  const pl = p.placar;
  const mini = Object.fromEntries(CORES.map((c) => [c, pl.pontos[c] - pl.bonus[c]]));
  switch (v.tipo) {
    case 'mesa': return <Mesa v={v} p={p} f={f} dur={dur} />;
    case 'cartao': return <Cartao v={v} f={f} />;
    case 'telao': return <Telao v={v} p={p} f={f} dur={dur} />;
    case 'moedas': return <Barras titulo="MOEDAS DO DILEMA (só este minijogo)" itens={CORES.map((c) => [c, p.minijogos[1].detalhe.moedas[c]] as [string, number]).sort((a, b) => b[1] - a[1])} f={f} />;
    case 'urna': return <Urna v={v} p={p} f={f} />;
    case 'vestiario': return <Vestiario v={v} p={p} f={f} />;
    case 'bomba': return <Bomba v={v} p={p} f={f} dur={dur} />;
    case 'bombas': return <Bombas p={p} f={f} />;
    case 'trofeus': return <Trofeus v={v} f={f} />;
    case 'vencedor': { const g = p.minijogos[v.mj - 1].ganhos; return <Barras titulo={`QUEM GANHOU O MINIJOGO ${v.mj}`} itens={Object.entries(g).filter(([, x]) => (x as number) > 0).map(([c, x]) => [c, x as number, 'pontos neste minijogo']) as [string, number, string][]} f={f} max={3} />; }
    case 'placar': {
      const fase = v.fase;
      const val = (c: string) => (fase === 'mini' ? mini[c] : fase === 'pacifista' ? mini[c] + (c === 'Vermelho' ? pl.bonus[c] : 0) : fase === 'duplo' ? mini[c] + (['Vermelho', 'Laranja'].includes(c) ? pl.bonus[c] : 0) : pl.pontos[c]);
      const titulo = fase === 'mini' ? 'PONTOS DOS 5 MINIJOGOS (sem bônus)' : fase === 'final' ? 'PLACAR FINAL' : 'COM OS OBJETIVOS SECRETOS';
      return <Barras titulo={titulo} itens={CORES.map((c) => [c, val(c), fase !== 'mini' && pl.bonus[c] ? `bônus +${pl.bonus[c]}` : undefined] as [string, number, string?]).sort((a, b) => b[1] - a[1])} f={f} max={16} />;
    }
    default: return null;
  }
};

const ROT: Record<string, string> = {pensamento: 'PENSAMENTO · SÓ VOCÊ VÊ', 'ligação': 'LIGAÇÃO', 'ligação · caiu': 'LIGAÇÃO QUE CAIU', poder: 'PODER SECRETO'};
const Cita: React.FC<{o: Extract<Over, {tipo: 'cita'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 8], [0, 1], cl) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const n = Math.floor(interpolate(f, [3, Math.max(10, o.dur * 0.45)], [0, o.texto.length], cl));
  const pens = o.tipoCita.startsWith('pensamento');
  const cor = o.cor ? COR[o.cor] : '#888';
  return (
    <div style={{position: 'absolute', left: 80, right: 80, bottom: 44, display: 'flex', gap: 20, alignItems: 'flex-end', opacity: e, transform: `translateY(${(1 - e) * 40}px)`}}>
      {o.cor ? <Telefone cor={o.cor} s={140} fora={!pens} /> : null}
      <div style={{flex: 1, background: pens ? '#ffffffee' : PAPEL, border: `7px ${pens ? 'dashed' : 'solid'} ${cor}`, borderRadius: pens ? 60 : 14, boxShadow: sombra, padding: '14px 28px'}}>
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 24, color: cor}}>{o.cor ? o.cor.toUpperCase() : '@Pursuer_M4'} · {ROT[o.tipoCita] ?? o.tipoCita.toUpperCase()}{o.mt ? ` · minijogo ${o.mt[0]}, tique ${o.mt[1]}` : ''}</div>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: o.texto.length > 150 ? 30 : 36, lineHeight: 1.25, color: '#1d1a12', fontStyle: pens ? 'italic' : 'normal'}}>"{o.texto.slice(0, n)}"</div>
      </div>
    </div>
  );
};

const Capitulo: React.FC<{o: Extract<Over, {tipo: 'capitulo'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 8], [0, 1], cl) * interpolate(f, [o.dur - 10, o.dur], [1, 0], cl);
  const fio = interpolate(f, [0, 14], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: `rgba(7,19,15,${0.92 * a})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18, opacity: a}}>
      <svg width={1400} height={40}><line x1={0} y1={20} x2={1400 * fio} y2={20} stroke={AMAR} strokeWidth={10} strokeLinecap="round" /><circle cx={1400 * fio} cy={20} r={16} fill="#222" stroke={AMAR} strokeWidth={6} /></svg>
      <div style={{fontFamily: BANG, fontSize: 120, color: '#fff', ...C(8), letterSpacing: 2}}>{o.titulo}</div>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, color: '#cfe9dc'}}>{o.regra}</div>
      <div style={{fontFamily: BANG, fontSize: 52, color: '#fff', background: ESCURO, border: '6px solid #000', borderRadius: 10, padding: '2px 24px', transform: 'rotate(-3deg)'}}>IDEIA DE @Pursuer_M4</div>
    </AbsoluteFill>
  );
};

// cadeado do placar secreto (some na revelação)
const Cadeado: React.FC<{faltam: number}> = ({faltam}) => (
  <div style={{position: 'absolute', right: 30, top: 24, display: 'flex', alignItems: 'center', gap: 12, background: '#000c', border: '4px solid #000', borderRadius: 12, padding: '8px 16px'}}>
    <svg width={40} height={48} viewBox="0 0 20 24"><path d="M5 10 V7 Q5 2 10 2 Q15 2 15 7 V10" stroke={AMAR} strokeWidth={3} fill="none" /><rect x={2} y={10} width={16} height={12} rx={2} fill={AMAR} stroke="#000" strokeWidth={1.5} /></svg>
    <div><div style={{fontFamily: POP, fontWeight: 900, fontSize: 22, color: AMAR}}>PLACAR SECRETO</div><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: '#fff'}}>FALTAM {faltam} MINIJOGO{faltam > 1 ? 'S' : ''}</div></div>
  </div>
);
const FALTAM: Record<string, number> = {A: 5, D: 5, B: 4, V: 3, F: 2, X: 1};

const CenaView: React.FC<{c: Cena; p: P}> = ({c, p}) => {
  const f = useCurrentFrame();
  let soco = 0;
  for (const o of c.over) { const d = f - o.at; if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme')) soco = Math.max(soco, 0.05 * (1 - d / 12)); }
  const temCita = c.over.some((o) => o.tipo === 'cita' && f >= o.at && f < o.at + o.dur);
  const faltam = c.id === 'A1' ? 0 : FALTAM[c.id[0]] ?? 0;
  return (
    <AbsoluteFill>
      <Feltro f={f} />
      <AbsoluteFill style={{transform: `scale(${(1 + 0.03 * (f / Math.max(1, c.dur)) + soco) * (temCita ? 0.86 : 1)}) translateY(${temCita ? -70 : 0}px)`}}>
        <Visual v={{...c.visual, corte: (() => { const s = c.over.find((o) => o.tipo === 'selo'); return s ? s.at - 10 : undefined; })()}} p={p} f={f} dur={c.dur} />
      </AbsoluteFill>
      {faltam ? <Cadeado faltam={faltam} /> : null}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'cita' ? <Cita o={o} /> : null}
          {o.tipo === 'selo' ? <SeqSelo texto={o.texto} comMeme={c.over.some((m) => m.tipo === 'meme' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'capitulo' ? <Capitulo o={o} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};
const SeqSelo: React.FC<{texto: string; comMeme?: boolean}> = ({texto, comMeme}) => <Selo texto={texto} cor={ESCURO} comMeme={comMeme} f={useCurrentFrame()} />;

export const ConfiancaVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [p, setP] = useState<P | null>(null);
  const [h] = useState(() => delayRender('partida confiança'));
  useEffect(() => { fetch(staticFile('confianca/partida.json')).then((r) => r.json()).then((d) => { setP(d); continueRender(h); }); }, [h]);
  if (!tl || !p) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => { const s = ini; ini += c.dur; return <Sequence key={c.id} from={s} durationInFrames={c.dur}><CenaView c={c} p={p} /></Sequence>; })}
    </AbsoluteFill>
  );
};
