// As cenas do "Lobisomem das IAs" (roteiro/roteiro_lobo.py → timeline_lobo.json). A arte (vila, aldeões, ícones) é dos
// Haikus; aqui ela é ligada ao log de cada partida (timeline.data.partidas[n], de lobisomem/logs/partidaN.json): quem
// está vivo, quem fala, a expressão e o gesto que a própria IA escolheu, e o selo do juiz de mentiras.
// Regra do canal: nenhum emoji — todos os ícones são os SVG de Icones.tsx.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene, Timeline} from '../types';
import {FONT} from '../theme';
import {LUGARES, PracaVila} from './Vila';
import {ALDEOES, AldeaoSprite, type Aldeao, type ExpressaoA, type GestoA} from './Aldeoes';
import {BalaoFala, BalaoPensa, CartaPapel, ChatLobos, ContadorDia, Faixa, Icone, PlacarVotos, SeloMentira, type Papel} from './Icones';

type Fala = {nome: string; id: Aldeao; rodada: number; fala: string; pensamento?: string; expressao?: string; gesto?: string; mentira?: {tipo: string; motivo: string}};
type Morte = {nome: string; papel: Papel; causa: string; quando: string; atirador?: string};
type Noite = {n: number; chat: {nome: string; texto: string; alvo: string; pensamento?: string}[]; vidente: {alvo: string; eLobo: boolean} | null; bruxa: {curou: boolean; envenenou: string | null} | null; mortes: Morte[]; alvoLobos?: string};
type Dia = {n: number; falas: Fala[]; votos: Record<string, string>; banido: Morte | null; mortes: Morte[]};
type Jog = {id: Aldeao; nome: string; modelo: string; papel: Papel};
type Partida = {partida: number; jogadores: Jog[]; noites: Noite[]; dias: Dia[]; resultado: {vencedor: string; dias: number}};
type Item = {cor: Aldeao; texto: string; at: number; ate: number; pensa?: boolean};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const EXPR: ExpressaoA[] = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando', 'dormindo'];
const ex = (e?: string, pad: ExpressaoA = 'neutro'): ExpressaoA => (EXPR.includes(e as ExpressaoA) ? (e as ExpressaoA) : pad);
const GES: GestoA[] = ['nenhum', 'apontar', 'bracos_cruzados', 'maos_pra_cima', 'acenar'];
const ge = (g?: string): GestoA => (GES.includes(g as GestoA) ? (g as GestoA) : 'nenhum');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9à-ú]/g, '');
const MARCA: Record<string, string> = {'Claude Haiku': 'Claude', 'GLM 5.3 Flash': 'GLM', 'Qwen 3.8 27B': 'Qwen', 'DeepSeek Flash': 'DeepSeek', 'MiniMax M3.1 Flash': 'MiniMax'};
const NOME_PAPEL: Record<Papel, string> = {lobisomem: 'Lobisomem', vidente: 'Vidente', bruxa: 'Bruxa', cacador: 'Caçador', aldeao: 'Aldeão'};

// quem está vivo no começo do dia `dia` (fase 'dia') ou da noite `n` (fase 'noite')
const mortosAte = (P: Partida, fase: 'dia' | 'noite', n: number) => {
  const m = new Set<string>();
  for (const x of P.noites) if (x.n < n || (fase === 'dia' && x.n === n)) for (const d of x.mortes) m.add(d.nome);
  for (const d of P.dias) if (d.n < n) { if (d.banido) m.add(d.banido.nome); for (const y of d.mortes) m.add(y.nome) }
  return m;
};

const gatilhos = (scene: Scene, termos: string[]): number[] => {
  const sem = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  let k = 0;
  return termos.map((t) => {
    for (let i = k; i < ws.length; i++) if (sem(ws[i].w).startsWith(sem(t))) { k = i + 1; return ws[i].s }
    return -1;
  });
};

// o aldeão dentro do SVG da vila (foreignObject, com a base dos pés no ponto 0,0)
const Slot: React.FC<{children: React.ReactNode}> = ({children}) => (
  <foreignObject x={-320} y={-560} width={640} height={620} style={{overflow: 'visible'}}>
    <div style={{position: 'relative', width: 640, height: 620}}>
      <div style={{position: 'absolute', left: 320, top: 560}}>{children}</div>
    </div>
  </foreignObject>
);

const camPara = (i: number | undefined, zoom = 1.45) => (i == null ? {x: 0, z: 1.02} : {x: Math.max(-1, Math.min(1, (LUGARES[i].x - 960) / 300)), z: zoom});
const ladoDe = (i: number) => (LUGARES[i].x < 960 ? 'esquerda' : 'direita') as 'esquerda' | 'direita';
const nomeCom = (j: Jog) => `${j.nome} · ${MARCA[j.modelo] ?? j.modelo}`;

// ---------------------------------------------------------------- o debate em volta da fogueira
export const LOBFogueira: React.FC<{P: Partida; dia: number; chat: Item[]}> = ({P, dia, chat}) => {
  const f = useCurrentFrame();
  const D = P.dias.find((d) => d.n === dia);
  const mortos = mortosAte(P, 'dia', dia);
  const idx = (id: Aldeao) => P.jogadores.findIndex((j) => j.id === id);
  const achar = (it: Item) => D?.falas.find((x) => x.id === it.cor && norm((it.pensa ? x.pensamento : x.fala) ?? '').includes(norm(it.texto).slice(0, 40)));
  const ents = chat.map((it) => ({it, e: achar(it)}));
  const agora = (q: number) => ents.find(({it}) => q >= it.at && q <= it.ate + 4);
  let cx = 0, cz = 0;
  for (let k = 0; k < 8; k++) { const a = agora(f - k); const c = camPara(a ? idx(a.it.cor) : undefined, a?.it.pensa ? 1.65 : 1.45); cx += c.x; cz += c.z }
  cx /= 8; cz /= 8;
  const fa = agora(f);
  const ultima = (id: Aldeao) => { let e: Fala | undefined; for (const {it, e: en} of ents) if (en && it.cor === id && f >= it.at && !it.pensa) e = en; return e };
  const nos = P.jogadores.map((j) => {
    if (mortos.has(j.nome)) return null;
    const falandoAgora = fa && fa.it.cor === j.id && !fa.it.pensa;
    const e = falandoAgora ? fa!.e : ultima(j.id);
    return (
      <Slot key={j.id}>
        <AldeaoSprite id={j.id} t={f + idx(j.id) * 17} falando={!!falandoAgora} expressao={ex(e?.expressao, 'desconfiado')} gesto={falandoAgora ? ge(e?.gesto) : 'nenhum'} virado={LUGARES[idx(j.id)].x < 960 ? 'direita' : 'esquerda'} />
      </Slot>
    );
  });
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: cx, zoom: cz}} noite={0.05} aldeoes={nos} />
      <ContadorDia dia={dia} noite={false} />
      {ents.map(({it, e}, i) => {
        const j = P.jogadores.find((x) => x.id === it.cor)!;
        const lado = ladoDe(idx(it.cor));
        const B = it.pensa ? BalaoPensa : BalaoFala;
        return (
          <div key={i} style={{position: 'absolute', top: 120, ...(lado === 'esquerda' ? {left: 60} : {right: 60})}}>
            <B nome={nomeCom(j)} cor={ALDEOES[it.cor].cor} texto={it.texto} at={it.at} ate={it.ate} lado={lado} />
            {!it.pensa && e?.mentira && e.mentira.tipo !== 'VERDADE' && f >= it.ate - 25 && f <= it.ate + 45 && (
              <SeloMentira tipo={e.mentira.tipo} at={it.ate - 25} x={lado === 'esquerda' ? 380 : 60} y={340} />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- a noite: lobos acordados, a vila dormindo
export const LOBNoite: React.FC<{P: Partida; noite: number; chat: Item[]; scene: Scene; mostra?: string[]}> = ({P, noite, chat, scene, mostra = []}) => {
  const f = useCurrentFrame();
  const {durationInFrames: D, fps} = useVideoConfig();
  const N = P.noites.find((x) => x.n === noite);
  const mortos = mortosAte(P, 'noite', noite);
  const virar = spring({frame: f - 10, fps, config: {damping: 14}});
  const [tVid, tBru] = gatilhos(scene, ['vidente', 'bruxa']);
  const uivo = interpolate(f, [8, 22, 40], [0, 1, 0.25], cl);
  const nos = P.jogadores.map((j, i) => {
    if (mortos.has(j.nome)) return null;
    const lobo = j.papel === 'lobisomem';
    return (
      <Slot key={j.id}>
        <AldeaoSprite id={j.id} t={f + i * 13} falando={chat.some((c) => c.cor === j.id && f >= c.at && f <= c.ate && !c.pensa)} expressao={lobo ? 'bravo' : 'dormindo'} lobo={lobo ? virar : 0} noite={1} virado={LUGARES[i].x < 960 ? 'direita' : 'esquerda'} />
      </Slot>
    );
  });
  const msgs = chat.filter((c) => !c.pensa).map((c) => ({nome: P.jogadores.find((j) => j.id === c.cor)!.nome, cor: ALDEOES[c.cor].cor, texto: c.texto, at: c.at}));
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: 0, zoom: interpolate(f, [0, D], [1.05, 1.2])}} noite={1} aldeoes={nos} uivo={uivo} fogo={0.55} />
      <ContadorDia dia={noite} noite />
      <Faixa texto={`NOITE ${noite}: A VILA DORME`} icone="lua" at={4} />
      {msgs.length > 0 && <div style={{position: 'absolute', right: 50, top: 170}}><ChatLobos mensagens={msgs} /></div>}
      {chat.filter((c) => c.pensa).map((c, i) => {
        const j = P.jogadores.find((x) => x.id === c.cor)!;
        return <div key={i} style={{position: 'absolute', left: 60, top: 170}}><BalaoPensa nome={nomeCom(j)} cor={ALDEOES[c.cor].cor} texto={c.texto} at={c.at} ate={c.ate} lado="esquerda" /></div>;
      })}
      {mostra.includes('vidente') && N?.vidente && tVid >= 0 && f >= tVid && (
        <Cartaz at={tVid} x={260} icone="olho" titulo="A VIDENTE OLHOU" texto={`${N.vidente.alvo}: ${N.vidente.eLobo ? 'É LOBO' : 'não é lobo'}`} cor={N.vidente.eLobo ? '#e8202a' : '#1f8f3a'} />
      )}
      {mostra.includes('bruxa') && N?.bruxa && tBru >= 0 && f >= tBru && (
        <Cartaz at={tBru} x={1180} icone={N.bruxa.envenenou ? 'pocao_veneno' : 'pocao_cura'} titulo="A BRUXA DECIDIU" texto={N.bruxa.curou ? `curou ${N.alvoLobos}` : N.bruxa.envenenou ? `envenenou ${N.bruxa.envenenou}` : 'não usou poção'} cor="#6a2aa8" />
      )}
    </AbsoluteFill>
  );
};

const Cartaz: React.FC<{at: number; x: number; icone: 'olho' | 'pocao_cura' | 'pocao_veneno' | 'lobo' | 'besta'; titulo: string; texto: string; cor: string}> = ({at, x, icone, titulo, texto, cor}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: f - at, fps, config: {damping: 11, stiffness: 170}});
  return (
    <div style={{position: 'absolute', left: x, top: 640, width: 480, padding: '18px 24px', display: 'flex', gap: 18, alignItems: 'center', background: '#efe0b8', border: '7px solid #2a1a0a', borderRadius: 18, boxShadow: '0 12px 0 #000a', transform: `scale(${k}) rotate(-2deg)`}}>
      <Icone nome={icone} tamanho={110} />
      <div>
        <div style={{fontFamily: FONT.comic, fontSize: 34, letterSpacing: 2, color: '#5a3b1d'}}>{titulo}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: cor, lineHeight: 1.1}}>{texto}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- o amanhecer: quem morreu
export const LOBAmanhecer: React.FC<{P: Partida; noite: number; scene: Scene}> = ({P, noite, scene}) => {
  const f = useCurrentFrame();
  const N = P.noites.find((x) => x.n === noite);
  const antes = mortosAte(P, 'noite', noite);
  const mortosAgora = new Set(N?.mortes.map((m) => m.nome) ?? []);
  const claro = interpolate(f, [0, 40], [1, 0.05], cl);
  const ts = gatilhos(scene, N?.mortes.map((m) => m.nome) ?? []);
  const nos = P.jogadores.map((j, i) => {
    if (antes.has(j.nome)) return null;
    const morto = mortosAgora.has(j.nome);
    return (
      <Slot key={j.id}>
        <AldeaoSprite id={j.id} t={f + i * 11} falando={false} expressao={morto ? 'dormindo' : 'assustado'} morto={morto} noite={claro} virado={LUGARES[i].x < 960 ? 'direita' : 'esquerda'} />
      </Slot>
    );
  });
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: 0, zoom: 1.08}} noite={claro} aldeoes={nos} />
      <Faixa texto={N?.mortes.length ? `AMANHECEU: ${N.mortes.length === 1 ? 'UMA MORTE' : `${N.mortes.length} MORTES`}` : 'AMANHECEU: NINGUÉM MORREU'} icone={N?.mortes.length ? 'caveira' : 'sol'} at={20} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 60}}>
        {N?.mortes.map((m, i) => (
          <div key={m.nome} style={{textAlign: 'center', opacity: f >= (ts[i] >= 0 ? ts[i] : 50) ? 1 : 0}}>
            <CartaPapel papel={m.papel} at={ts[i] >= 0 ? ts[i] : 50} tamanho={180} />
            <div style={{marginTop: 10, fontFamily: FONT.comic, fontSize: 44, color: '#fff', WebkitTextStroke: '2px #000'}}>{m.nome}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- votação
export const LOBVotos: React.FC<{P: Partida; dia: number}> = ({P, dia}) => {
  const f = useCurrentFrame();
  const D = P.dias.find((d) => d.n === dia)!;
  const mortos = mortosAte(P, 'dia', dia);
  const cont: Record<string, number> = {};
  for (const v of Object.values(D.votos)) if (v !== 'ninguém') cont[v] = (cont[v] ?? 0) + 1;
  const votos = Object.entries(cont).map(([nome, n]) => ({nome, n, cor: ALDEOES[P.jogadores.find((j) => j.nome === nome)!.id].cor}));
  const nos = P.jogadores.map((j, i) => (mortos.has(j.nome) ? null : (
    <Slot key={j.id}>
      <AldeaoSprite id={j.id} t={f + i * 9} falando={false} expressao={D.banido?.nome === j.nome ? 'assustado' : 'bravo'} gesto={f > 30 && D.votos[j.nome] && D.votos[j.nome] !== 'ninguém' ? 'apontar' : 'nenhum'} virado={LUGARES[i].x < 960 ? 'direita' : 'esquerda'} />
    </Slot>
  )));
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: 0.15, zoom: 1.05}} noite={0.15} aldeoes={nos} />
      <Faixa texto="VOTAÇÃO" icone="voto" at={4} />
      <div style={{position: 'absolute', right: 60, top: 170}}><PlacarVotos votos={votos} at={20} /></div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- o banido vai embora de carroça (e o Caçador, se for o caso)
export const LOBBanido: React.FC<{P: Partida; dia: number; scene: Scene}> = ({P, dia, scene}) => {
  const f = useCurrentFrame();
  const {durationInFrames: Dur} = useVideoConfig();
  const D = P.dias.find((d) => d.n === dia)!;
  const b = D.banido;
  const [tEra] = gatilhos(scene, ['era']);
  const tc = tEra >= 0 ? tEra : 40;
  const x = interpolate(f, [tc + 40, Dur], [760, 2300], cl);
  const j = b && P.jogadores.find((y) => y.nome === b.nome);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f3c27a, #e9a65a 45%, #8a6a3a 46%, #6b4f2a)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle cx={1500} cy={300} r={120} fill="#ffe08a" stroke="#14141f" strokeWidth={8} />
        <path d="M0 520 Q480 440 960 520 T1920 500 L1920 1080 L0 1080 Z" fill="#7a9a4a" stroke="#14141f" strokeWidth={8} />
        <path d="M-50 900 Q960 760 2000 860" fill="none" stroke="#c9a46a" strokeWidth={120} />
      </svg>
      {j && (
        <div style={{position: 'absolute', left: x, top: 760}}>
          <div style={{position: 'absolute', left: -40, top: -20}}>
            <AldeaoSprite id={j.id} t={f} falando={false} expressao={b!.papel === 'lobisomem' ? 'culpado' : 'chorando'} altura={300} lobo={b!.papel === 'lobisomem' && f > tc ? 1 : 0} virado="esquerda" />
          </div>
          <div style={{position: 'absolute', left: -170, top: -90, transform: `rotate(${Math.sin(f / 4) * 2}deg)`}}><Icone nome="carroca" tamanho={300} /></div>
        </div>
      )}
      {b && <Faixa texto={`${b.nome.toUpperCase()} FOI BANIDO DA VILA`} icone="carroca" at={6} />}
      {b && f >= tc && <div style={{position: 'absolute', left: 140, top: 260}}><CartaPapel papel={b.papel} at={tc} tamanho={230} /></div>}
      {b && f >= tc + 10 && <div style={{position: 'absolute', left: 140, top: 640, width: 460, textAlign: 'center', fontFamily: FONT.comic, fontSize: 52, color: b.papel === 'lobisomem' ? '#e8202a' : '#fff', WebkitTextStroke: '2px #000'}}>ERA {NOME_PAPEL[b.papel].toUpperCase()}</div>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- os papéis secretos (só o público vê)
export const LOBPapeis: React.FC<{P: Partida; scene: Scene}> = ({P, scene}) => {
  const f = useCurrentFrame();
  const ts = gatilhos(scene, P.jogadores.filter((j) => j.papel !== 'aldeao').map((j) => j.nome));
  const especiais = P.jogadores.filter((j) => j.papel !== 'aldeao');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #3a2a5a, #120a20 70%)'}}>
      <Faixa texto="OS PAPÉIS SECRETOS" icone="pergaminho" at={4} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center', gap: 22}}>
        {P.jogadores.map((j, i) => {
          const k = especiais.indexOf(j);
          const at = k >= 0 && ts[k] >= 0 ? ts[k] : 30 + i * 8;
          return (
            <div key={j.id} style={{width: 210, textAlign: 'center'}}>
              <div style={{position: 'relative', height: 330}}>
                <div style={{position: 'absolute', left: 105, top: 320}}><AldeaoSprite id={j.id} t={f + i * 7} falando={false} expressao={j.papel === 'lobisomem' && f > at ? 'culpado' : 'neutro'} lobo={j.papel === 'lobisomem' && f > at ? 1 : 0} altura={300} /></div>
              </div>
              <div style={{fontFamily: FONT.comic, fontSize: 32, color: ALDEOES[j.id].cor, WebkitTextStroke: '1.5px #000'}}>{j.nome}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 20, color: '#ddd'}}>{MARCA[j.modelo]}</div>
              <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}><CartaPapel papel={j.papel} at={at} tamanho={150} /></div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- título, elenco, regras
export const LOBTitulo: React.FC<{titulo: string; sub?: string}> = ({titulo, sub}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 8, fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: 0, zoom: 1}} noite={1} uivo={interpolate(f, [10, 30, 60], [0, 1, 0.4], cl)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${s})`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 20}}><Icone nome="lobo" tamanho={150} /><Icone nome="lua" tamanho={110} /></div>
        <div style={{fontFamily: FONT.comic, fontSize: 150, color: '#fff', WebkitTextStroke: '7px #000', textShadow: '0 12px 0 #000', lineHeight: 1}}>{titulo}</div>
        {sub && <div style={{marginTop: 16, display: 'inline-block', padding: '8px 30px', background: '#efe0b8', border: '6px solid #2a1a0a', borderRadius: 14, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#2a1a0a'}}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const LOBElenco: React.FC<{P: Partida; fim?: boolean}> = ({P, fim}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nos = P.jogadores.map((j, i) => (
    <Slot key={j.id}><AldeaoSprite id={j.id} t={f + i * 10} falando={false} expressao={fim ? 'rindo' : 'neutro'} gesto={fim ? 'acenar' : i % 2 ? 'acenar' : 'nenhum'} virado={LUGARES[i].x < 960 ? 'direita' : 'esquerda'} /></Slot>
  ));
  return (
    <AbsoluteFill>
      <PracaVila camera={{x: 0, zoom: 1}} noite={fim ? 0.6 : 0} aldeoes={nos} />
      {P.jogadores.map((j, i) => {
        const s = spring({frame: f - 10 - i * 6, fps, config: {damping: 12}});
        const L = LUGARES[i];
        return (
          <div key={j.id} style={{position: 'absolute', left: L.x - 110, top: L.y + 6, width: 220, textAlign: 'center', transform: `scale(${s * L.escala})`}}>
            <span style={{display: 'inline-block', padding: '4px 14px', background: '#efe0b8', border: '4px solid #2a1a0a', borderRadius: 10, fontFamily: FONT.display, fontWeight: 900, fontSize: 24, color: '#2a1a0a', whiteSpace: 'nowrap'}}>{j.nome} · <span style={{color: ALDEOES[j.id].cor}}>{MARCA[j.modelo]}</span></span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const LOBRegras: React.FC<{scene: Scene}> = ({scene}) => {
  const ordem: Papel[] = ['lobisomem', 'vidente', 'bruxa', 'cacador', 'aldeao'];
  const ts = gatilhos(scene, ['lobisomens', 'vidente', 'bruxa', 'caçador', 'aldeões']);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #4a3418, #160e06 75%)'}}>
      <Faixa texto="OS PAPÉIS" icone="pergaminho" at={4} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 40}}>
        {ordem.map((p, i) => <CartaPapel key={p} papel={p} at={ts[i] >= 0 ? ts[i] : 20 + i * 20} tamanho={250} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sala de espera entre as partidas (até 5 s)
export const LOBLobby: React.FC<{P: Partida; proxima: string; chat: Item[]}> = ({P, proxima, chat}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const entra = interpolate(f, [0, 9], [0, 1], cl);
  const sai = interpolate(f, [D - 8, D], [0, 1], cl);
  const resta = Math.max(1, Math.ceil(((D - f) / D) * 3));
  const quem = [...new Set(chat.map((c) => c.cor))];
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{clipPath: `circle(${entra * 140}% at 50% 50%)`, transform: `scale(${1 + sai * 0.25})`}}>
        <AbsoluteFill style={{background: 'linear-gradient(#bfe3f2 0%, #f6e7c1 55%, #9a7a4a 56%, #6b5330 100%)'}} />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <rect x={760} y={430} width={400} height={240} rx={14} fill="#8a5a2a" stroke="#14141f" strokeWidth={8} />
          <text x={960} y={540} textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize={58} fill="#f6e7c1">TAVERNA</text>
          <text x={960} y={610} textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={900} fontSize={30} fill="#f6e7c1">depois da partida</text>
        </svg>
        {quem.map((id, i) => (
          <div key={id} style={{position: 'absolute', left: i === 0 ? 560 : 1360, top: 1000}}>
            <AldeaoSprite id={id} t={f + i * 20} falando={chat.some((c) => c.cor === id && f >= c.at && f <= c.ate)} expressao={i === 0 ? 'bravo' : 'rindo'} altura={460} virado={i === 0 ? 'direita' : 'esquerda'} />
          </div>
        ))}
        {chat.map((m, i) => {
          if (f < m.at) return null;
          const s = spring({frame: f - m.at, fps, config: {damping: 11, stiffness: 180}});
          const sobe = interpolate(f, [chat[i + 1]?.at ?? 1e9, (chat[i + 1]?.at ?? 1e9) + 6], [0, 130], cl);
          const lado = m.cor === quem[0] ? -1 : 1;
          const j = P.jogadores.find((x) => x.id === m.cor)!;
          return (
            <div key={i} style={{position: 'absolute', left: 960 + lado * 400 - 330, top: 200 - sobe, width: 660, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${lado * 2}deg)`}}>
              <div style={{padding: '14px 26px', background: '#fff', border: '6px solid #000', borderRadius: 28, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, lineHeight: 1.1, color: '#111', textAlign: 'center', boxShadow: '0 8px 0 #000a', opacity: sobe > 0 ? 0.6 : 1}}>
                <div style={{fontSize: 24, color: ALDEOES[m.cor].cor}}>{nomeCom(j)}</div>
                {m.texto}
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', padding: '10px 34px', background: '#efe0b8', border: '6px solid #2a1a0a', borderRadius: 20, fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#2a1a0a', whiteSpace: 'nowrap'}}>
          {proxima} EM {resta}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: sai}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar final: quem ganhou cada partida e quem mais mentiu
export const LOBPlacar: React.FC<{partidas: Record<string, Partida>; ordem: number[]}> = ({partidas, ordem}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mentiras: Record<string, number> = {};
  for (const P of Object.values(partidas)) for (const d of P.dias) for (const x of d.falas) if (x.mentira && x.mentira.tipo !== 'VERDADE') {
    const m = MARCA[P.jogadores.find((j) => j.id === x.id)!.modelo];
    mentiras[m] = (mentiras[m] ?? 0) + 1;
  }
  const rank = Object.entries(mentiras).sort((a, b) => b[1] - a[1]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 25%, #4a3418, #120a04 75%)'}}>
      <Faixa texto="PLACAR FINAL" icone="pergaminho" at={4} />
      <div style={{position: 'absolute', left: 140, top: 200, width: 760}}>
        {ordem.map((n, i) => {
          const P = partidas[String(n)];
          const s = spring({frame: f - 14 - i * 10, fps, config: {damping: 13}});
          const lobos = P.jogadores.filter((j) => j.papel === 'lobisomem');
          const ganhou = P.resultado.vencedor;
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22, padding: '14px 22px', background: '#efe0b8', border: '6px solid #2a1a0a', borderRadius: 16, transform: `translateX(${(1 - s) * -1200}px)`}}>
              <Icone nome={ganhou === 'lobos' ? 'lobo' : 'aldeao'} tamanho={80} />
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#2a1a0a'}}>
                Partida {i + 1}: {ganhou === 'lobos' ? 'os LOBOS venceram' : ganhou === 'aldeia' ? 'a VILA venceu' : 'empate'}
                <div style={{fontSize: 22, fontWeight: 700}}>lobos: {lobos.map((l) => `${l.nome} (${MARCA[l.modelo]})`).join(' e ')}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 140, top: 200, width: 620, padding: '24px 30px', background: '#2a0f0f', border: '7px solid #e8202a', borderRadius: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT.comic, fontSize: 48, color: '#ffd0d0'}}><Icone nome="mentira" tamanho={80} /> QUEM MAIS MENTIU</div>
        {rank.map(([m, n], i) => (
          <div key={m} style={{marginTop: 14, fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', opacity: f > 40 + i * 12 ? 1 : 0}}>
            {i + 1}. {m}: {n} {n === 1 ? 'mentira' : 'mentiras'}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- liga os nomes do roteiro aos componentes
export const LOBVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida>;
  const P = ps[String(p.partida ?? 1)];
  switch (name) {
    case 'LOBFogueira': return <LOBFogueira P={P} dia={p.dia} chat={(p.chat ?? []) as Item[]} />;
    case 'LOBNoite': return <LOBNoite P={P} noite={p.noite} chat={(p.chat ?? []) as Item[]} scene={scene} mostra={p.mostra} />;
    case 'LOBAmanhecer': return <LOBAmanhecer P={P} noite={p.noite} scene={scene} />;
    case 'LOBVotos': return <LOBVotos P={P} dia={p.dia} />;
    case 'LOBBanido': return <LOBBanido P={P} dia={p.dia} scene={scene} />;
    case 'LOBPapeis': return <LOBPapeis P={P} scene={scene} />;
    case 'LOBTitulo': return <LOBTitulo titulo={p.titulo} sub={p.sub} />;
    case 'LOBElenco': return <LOBElenco P={P} fim={p.fim} />;
    case 'LOBRegras': return <LOBRegras scene={scene} />;
    case 'LOBLobby': return <LOBLobby P={P} proxima={p.proxima} chat={(p.chat ?? []) as Item[]} />;
    case 'LOBPlacar': return <LOBPlacar partidas={ps} ordem={p.ordem ?? [1, 2, 3, 4]} />;
    default: return <AbsoluteFill style={{background: '#300'}} />;
  }
};
