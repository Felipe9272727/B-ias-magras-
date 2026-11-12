// POKÉMON: "3 IAs criaram as próprias IAs pra zerar Pokémon". Lê public/timeline_pokemon.json (gerada por
// video/scripts/build_timeline_pokemon.py a partir do storyboard do Fable + video/roteiro/roteiro_pokemon.py).
// Identidade (direcao_edicao.md): bancada azul-noite com grade de pixels; PAPEL (creme) = o que a IA escreveu;
// TELA (jogo/terminal) = o que aconteceu. Cores: Claude laranja, Gemini azul, GPT verde. Transição própria:
// a caixa de texto "salvando o jogo..." (na partida do GPT ela falha com glitch). Nada de emoji na tela.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {Selo} from '../au7/Hud7';

const FUNDO = '#12162B', PAPEL = '#F4EBD0', VERM = '#E0262B', AMAR = '#FFC83D';
const COR: Record<string, string> = {claude: '#E8763A', gemini: '#3D7BF2', gpt: '#19A974'};
const NOME: Record<string, string> = {claude: 'CLAUDE', gemini: 'GEMINI', gpt: 'GPT'};
const POP = "'Poppins', sans-serif", MONO = "'JetBrains Mono', monospace", BANG = "'Bangers', 'Poppins', sans-serif", PIX = "'Press Start 2P', monospace";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const C = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const sombra = (c = '#000') => `10px 10px 0 ${c}`;
const iaDeCor = (c: string) => Object.keys(COR).find((k) => COR[k].toLowerCase() === c.toLowerCase()) ?? 'claude';

type Meta = [number, number, number, number, number, number, number[]];
type V = {tipo: string; [k: string]: any};
type Over =
  | {tipo: 'cita'; at: number; dur: number; ia: string; tag: string; texto: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo}
  | {tipo: 'salvando'; at: number; dur: number; titulo: string; falha?: boolean};
export type Cena = {id: string; dur: number; visual: V; over: Over[]; audio: {src: string; at: number; vol?: number}[]};
type TL = {cenas: Cena[]};

export const calcPokemon: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_pokemon.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

// ---------- fundo da bancada ----------
const Bancada: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: FUNDO}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(#ffffff0b 2px, transparent 2px), linear-gradient(90deg, #ffffff0b 2px, transparent 2px)', backgroundSize: '48px 48px', backgroundPosition: `${(f * 0.4) % 48}px ${(f * 0.25) % 48}px`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, #00000088 100%)'}} />
  </AbsoluteFill>
);

const Mascote: React.FC<{ia: string; expr?: string; s: number; f: number; quica?: boolean}> = ({ia, expr = 'normal', s, f, quica = true}) => {
  const y = quica ? Math.abs(Math.sin(f / 9)) * -8 : 0;
  return <Img src={staticFile(`pokemon/personagens/${ia}_${expr}.svg`)} style={{width: s, height: s, imageRendering: 'pixelated', transform: `translateY(${y}px)`}} />;
};

const Cartao: React.FC<{cor: string; children: React.ReactNode; style?: React.CSSProperties; f: number; atraso?: number}> = ({cor, children, style, f, atraso = 0}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f - atraso, fps, config: {damping: 12, mass: 0.7}});
  return <div style={{background: PAPEL, border: `8px solid ${cor}`, borderRadius: 10, boxShadow: sombra(), transform: `scale(${0.6 + 0.4 * e})`, opacity: e, ...style}}>{children}</div>;
};

// ---------- gameplay do GBA (clipe refeito pelo trajeto) dentro do console, com o painel ao lado ----------
const tempo = (q: number) => { const s = q / 60; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min ${String(Math.floor(s % 60)).padStart(2, '0')} s`; };
const Gba: React.FC<{v: V; f: number; dur: number; w?: number}> = ({v, f, dur, w = 1180}) => {
  const ia = iaDeCor(v.ia);
  const n = Math.max(1, v.n ?? 1);
  const meta: Meta[] = v.meta ?? [];
  const mi = meta.length ? meta[Math.min(meta.length - 1, f % n)] : null;
  const z = (v.zoom ?? 1) * (1 + 0.035 * (f / Math.max(1, dur)));
  const h = (w * 2) / 3;
  const cont = v.contador as [string, number] | undefined;
  const k = interpolate(f, [10, Math.max(20, dur - 30)], [0, 1], cl);
  const valor = cont ? Math.round(cont[1] * (1 - Math.pow(1 - k, 2.2))) : 0;
  return (
    <div style={{position: 'relative', width: w + 380, display: 'flex', gap: 26, alignItems: 'center'}}>
      <div style={{width: w + 44, height: h + 44, background: COR[ia], border: '8px solid #000', borderRadius: 26, boxShadow: sombra(), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: w, height: h, overflow: 'hidden', border: '6px solid #000', borderRadius: 8, background: '#000'}}>
          <div style={{width: w, height: h, transform: `scale(${z})`, transformOrigin: '50% 45%'}}>
            <Loop durationInFrames={n}><OffthreadVideo src={staticFile(`pokemon/clips/${v.clip}.mp4`)} muted style={{width: w, height: h, imageRendering: 'pixelated'}} /></Loop>
          </div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14, width: 340}}>
        <div style={{background: '#0b0e1c', border: `5px solid ${COR[ia]}`, borderRadius: 10, padding: '12px 16px'}}>
          <div style={{fontFamily: POP, fontWeight: 900, fontSize: 30, color: COR[ia]}}>{v.painel?.nome ?? NOME[ia]}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff'}}>{mi ? tempo(mi[0]) : '0 min'}</div>
          <div style={{fontFamily: MONO, fontSize: 18, color: '#9fb0d8'}}>tempo de jogo (de 48 h)</div>
        </div>
        <div style={{background: '#0b0e1c', border: '5px solid #2a3150', borderRadius: 10, padding: '10px 16px', fontFamily: MONO, fontSize: 22, color: '#e6ecff', lineHeight: 1.45}}>
          {(v.painel?.linhas ?? []).map((l: string) => <div key={l}>{l}</div>)}
          {mi && mi[1] ? <div>NÍVEL {mi[1]} · VIDA {mi[4]}/{mi[5]}</div> : null}
          {mi ? <div>CARTEIRA {mi[2]}</div> : null}
        </div>
        {v.painel?.diario ? <div style={{background: PAPEL, border: '5px solid #000', borderRadius: 8, padding: '10px 14px', fontFamily: POP, fontWeight: 800, fontSize: 21, color: '#1a1a1a', transform: 'rotate(-2deg)', boxShadow: sombra()}}>{v.painel.diario}</div> : null}
        {cont ? (
          <div style={{background: '#000', border: `6px solid ${AMAR}`, borderRadius: 12, padding: '8px 14px', textAlign: 'center'}}>
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 20, color: AMAR}}>{cont[0]}</div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 56, color: '#fff'}}>{cont[0] === 'A' ? 'x ' : ''}{valor.toLocaleString('pt-BR')}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------- papel (o que a IA escreveu) e terminal (o que aconteceu) ----------
const Papel: React.FC<{v: V; f: number; dur: number; w?: number}> = ({v, f, dur, w = 1500}) => {
  const ia = iaDeCor(v.ia);
  const linhas: string[] = v.linhas ?? [];
  const carimbo = interpolate(f, [Math.min(dur * 0.45, 70), Math.min(dur * 0.45, 70) + 8], [3, 1], cl);
  const vc = f > Math.min(dur * 0.45, 70);
  return (
    <Cartao cor={COR[ia]} f={f} style={{width: w, padding: '26px 36px', position: 'relative'}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#55503f', borderBottom: '3px dashed #b9ae8c', paddingBottom: 10, marginBottom: 14}}>{v.titulo}</div>
      {linhas.map((l, i) => {
        const a = interpolate(f, [8 + i * 7, 16 + i * 7], [0, 1], cl);
        const dest = (v.destaque ?? []).includes(i);
        return <div key={i} style={{fontFamily: MONO, fontWeight: dest ? 700 : 500, fontSize: linhas.length > 5 ? 34 : 42, lineHeight: 1.35, color: '#1d1a12', opacity: a, background: dest ? `linear-gradient(transparent 20%, ${AMAR}cc 20%, ${AMAR}cc 90%, transparent 90%)` : undefined, whiteSpace: 'pre-wrap'}}>{l}</div>;
      })}
      {v.sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 26, color: COR[ia], marginTop: 14}}>{v.sub}</div> : null}
      {v.carimbo && vc ? <div style={{position: 'absolute', right: 24, top: 60, fontFamily: BANG, fontSize: 64, color: VERM, border: `8px solid ${VERM}`, borderRadius: 10, padding: '2px 22px', transform: `rotate(-8deg) scale(${carimbo})`, opacity: 0.92, background: '#f4ebd0cc'}}>{v.carimbo}</div> : null}
    </Cartao>
  );
};
const Terminal: React.FC<{v: V; f: number; dur: number; w?: number}> = ({v, f, dur, w = 1500}) => {
  const ia = iaDeCor(v.ia);
  const linhas: string[] = v.linhas ?? [];
  const passo = Math.max(3, Math.min(14, (dur - 40) / Math.max(1, linhas.length)));
  const nV = Math.min(linhas.length, Math.floor(f / passo) + 1);
  const rolar = Math.max(0, nV - 14) * 46;
  const cursor = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{width: w, height: 760, background: '#05070f', border: `6px solid ${COR[ia]}`, borderRadius: 12, boxShadow: sombra(), overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'relative', zIndex: 2, background: COR[ia], fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#000', padding: '8px 18px', display: 'flex', justifyContent: 'space-between'}}><span>{v.titulo}</span><span>{v.sub ?? ''}</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 48, bottom: 0, overflow: 'hidden'}}><div style={{padding: '18px 24px', transform: `translateY(${-rolar}px)`}}>
        {linhas.slice(0, nV).map((l, i) => (
          <div key={i} style={{fontFamily: MONO, fontSize: 32, lineHeight: '46px', color: i === nV - 1 ? '#9cff9c' : i < nV - 1 && linhas.length > 3 ? '#5f6a7a' : '#9cff9c', background: (v.destaque ?? []).includes(i) ? '#ffc83d33' : undefined}}>{l || ' '}</div>
        ))}
        <span style={{fontFamily: MONO, fontSize: 32, color: '#9cff9c', opacity: cursor ? 1 : 0}}>_</span>
      </div></div>
    </div>
  );
};

const CartaoIA: React.FC<{v: V; f: number}> = ({v, f}) => (
  <Cartao cor={COR[v.ia]} f={f} style={{width: 1560, height: 760, display: 'flex', alignItems: 'center', gap: 40, padding: 40, boxSizing: 'border-box'}}>
    <div style={{width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Mascote ia={v.ia} expr={v.expr} s={460} f={f} />
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 44, color: COR[v.ia]}}>{NOME[v.ia]}</div>
    </div>
    <div style={{flex: 1}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 60, color: '#1d1a12'}}>{v.nome}</div>
      <div style={{fontFamily: BANG, fontSize: 130, color: COR[v.ia], ...C(6), transform: `scale(${interpolate(f, [12, 20], [1.6, 1], cl)})`, transformOrigin: 'left center'}}>{v.numero}</div>
      <div style={{fontFamily: POP, fontWeight: 600, fontSize: 30, color: '#55503f', marginBottom: 18}}>{v.sub}</div>
      {(v.linhas ?? []).map((l: string, i: number) => <div key={l} style={{fontFamily: POP, fontWeight: 800, fontSize: 36, color: '#1d1a12', opacity: interpolate(f, [24 + i * 12, 32 + i * 12], [0, 1], cl)}}>· {l}</div>)}
    </div>
  </Cartao>
);

const NumeroTela: React.FC<{v: V; f: number}> = ({v, f}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26}}>
    <div style={{fontFamily: v.texto.startsWith('time') ? MONO : BANG, fontWeight: 700, fontSize: v.texto.length > 12 ? 130 : 220, color: v.cor ?? AMAR, ...C(10), transform: `scale(${interpolate(f, [0, 10], [2.2, 1], cl) * (1 + 0.05 * Math.sin(f / 20))})`, textAlign: 'center'}}>{v.texto}</div>
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: 38, color: '#e6ecff', maxWidth: 1500, textAlign: 'center', opacity: interpolate(f, [16, 26], [0, 1], cl)}}>{v.sub}</div>
  </AbsoluteFill>
);

const Mascotes: React.FC<{v: V; f: number}> = ({v, f}) => {
  const itens = v.itens ?? [];
  const s = itens.length === 1 ? 520 : itens.length === 2 ? 440 : 380;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 58, color: '#fff', ...C(8), textAlign: 'center', maxWidth: 1700}}>{v.titulo}</div>
      <div style={{display: 'flex', gap: 60}}>
        {itens.map((m: any, i: number) => (
          <Cartao key={i} cor={COR[m.ia]} f={f} atraso={6 + i * 8} style={{width: s + 60, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Mascote ia={m.ia} expr={m.expr} s={s} f={f + i * 13} />
            <div style={{fontFamily: POP, fontWeight: 900, fontSize: 40, color: COR[m.ia], textAlign: 'center'}}>{m.rotulo}</div>
            {m.sub ? <div style={{fontFamily: POP, fontWeight: 700, fontSize: 26, color: '#33302a', textAlign: 'center'}}>{m.sub}</div> : null}
          </Cartao>
        ))}
      </div>
      {v.sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 32, color: AMAR, textAlign: 'center', maxWidth: 1600}}>{v.sub}</div> : null}
    </AbsoluteFill>
  );
};

const Barras: React.FC<{v: V; f: number; dur: number}> = ({v, f, dur}) => {
  const itens = v.itens ?? [];
  return (
    <AbsoluteFill style={{padding: '90px 120px', gap: 30, justifyContent: 'center'}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 60, color: '#fff', ...C(8)}}>{v.titulo} <span style={{fontSize: 34, color: '#9fb0d8'}}>(régua de 0 a {v.maximo} h)</span></div>
      {itens.map((b: any, i: number) => {
        const t0 = 14 + i * 26;
        const cresce = interpolate(f, [t0, t0 + 22], [0, 1], cl);
        const apaga = b.apagar ? interpolate(f, [dur * 0.55, dur * 0.55 + 30], [1, 0], cl) : 1;
        const w = 1500 * (b.valor / v.maximo) * cresce;
        return (
          <div key={i} style={{opacity: interpolate(f, [t0, t0 + 6], [0, 1], cl)}}>
            <div style={{fontFamily: POP, fontWeight: 900, fontSize: 32, color: b.cor}}>{b.rotulo}</div>
            <div style={{position: 'relative', height: 70, width: 1500, background: '#0b0e1c', border: '4px solid #2a3150', borderRadius: 8}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w, border: b.apagar ? `5px dashed ${b.cor}` : undefined, boxSizing: 'border-box', borderRadius: 6}} />
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w * apaga, background: b.cor, borderRadius: 6}} />
              <div style={{position: 'absolute', left: w > 900 ? 18 : Math.max(w, 10) + 18, top: 12, fontFamily: MONO, fontWeight: 700, fontSize: 32, color: w > 900 && !b.apagar ? '#000' : '#fff', whiteSpace: 'nowrap', ...(w > 900 && b.apagar ? C(5) : {})}}>{b.etiqueta}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Tabela: React.FC<{v: V; f: number}> = ({v, f}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <Cartao cor={AMAR} f={f} style={{width: 1560, padding: '30px 40px'}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 52, color: '#1d1a12', marginBottom: 18}}>{v.titulo}</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 30px'}}>
        {(v.colunas ?? []).map((c: string) => <div key={c} style={{fontFamily: POP, fontWeight: 900, fontSize: 30, color: '#7a705a'}}>{c}</div>)}
        {(v.linhas ?? []).flatMap((l: string[], i: number) => l.map((x, j) => (
          <div key={`${i}-${j}`} style={{fontFamily: j ? MONO : POP, fontWeight: 800, fontSize: 38, color: x.startsWith('-') ? VERM : '#1d1a12', borderTop: '3px dashed #c8bd9a', padding: '6px 0', opacity: interpolate(f, [14 + i * 10, 22 + i * 10], [0, 1], cl)}}>{x}</div>
        )))}
      </div>
    </Cartao>
  </AbsoluteFill>
);

const ImgTela: React.FC<{v: V; f: number; w?: number}> = ({v, f, w = 1400}) => (
  <Cartao cor="#2a3150" f={f} style={{width: w, padding: 22, background: '#0b0e1c'}}>
    {v.titulo ? <div style={{fontFamily: POP, fontWeight: 900, fontSize: 40, color: '#fff', marginBottom: 10}}>{v.titulo}</div> : null}
    <Img src={staticFile(v.src)} style={{width: '100%', imageRendering: 'pixelated', borderRadius: 6}} />
    {v.sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 28, color: AMAR, marginTop: 10}}>{v.sub}</div> : null}
  </Cartao>
);

// mapa esquemático da região (desenho nosso, não o mapa do jogo)
const LUG: Record<string, [number, number]> = {Pallet: [430, 820], 'Rota 1': [430, 620], Viridian: [430, 430], Floresta: [430, 300], Pewter: [430, 150], Museu: [560, 120], 'Rota 15': [1250, 860], Fuchsia: [1080, 860]};
const Mapa: React.FC<{v: V; f: number}> = ({v, f}) => {
  const pts: string[] = v.pontos ?? [];
  const caminho = pts.map((p) => LUG[p]).filter(Boolean);
  const k = interpolate(f, [10, 50], [0, 1], cl);
  const d = caminho.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const dest = v.destaque ? LUG[v.destaque] : null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 50, color: '#fff', ...C(7), position: 'absolute', top: 40}}>{v.titulo}</div>
      <svg width={1600} height={960} viewBox="0 0 1600 960" style={{marginTop: 80}}>
        <rect x={20} y={20} width={1560} height={920} rx={24} fill="#2f7a3d" stroke="#000" strokeWidth={10} />
        <rect x={40} y={40} width={1520} height={880} rx={18} fill="#4aa35a" />
        <path d={d} fill="none" stroke={v.rota === 'promessa' ? COR.gemini : '#fff'} strokeWidth={12} strokeDasharray="30 18" strokeDashoffset={-f * 2} pathLength={1} style={{strokeDasharray: `${k} 1`}} />
        {Object.entries(LUG).map(([n, [x, y]]) => (
          <g key={n} opacity={pts.includes(n) || n === v.destaque ? 1 : 0.45}>
            <rect x={x - 70} y={y - 40} width={140} height={80} rx={10} fill={n.startsWith('Rota') || n === 'Floresta' ? '#c9b46a' : PAPEL} stroke="#000" strokeWidth={6} />
            <text x={x} y={y + 12} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={28}>{n.toUpperCase()}</text>
          </g>
        ))}
        {dest ? <circle cx={dest[0]} cy={dest[1]} r={70 + 12 * Math.sin(f / 6)} fill="none" stroke={VERM} strokeWidth={12} /> : null}
        {v.destaque === 'Rota 15' && dest ? <path d={`M${LUG.Pewter[0] + 80} ${LUG.Pewter[1]} Q 1100 300 ${dest[0]} ${dest[1] - 50}`} fill="none" stroke={VERM} strokeWidth={10} pathLength={1} style={{strokeDasharray: `${interpolate(f, [40, 80], [0, 1], cl)} 1`}} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

const Quedas: React.FC<{v: V; f: number; dur: number}> = ({v, f, dur}) => {
  const hs: string[] = v.horarios ?? [];
  const passo = Math.max(18, (dur * 0.7) / hs.length);
  const n = Math.min(hs.length, Math.floor(f / passo) + (f > 10 ? 1 : 0));
  const raio = n > 0 && f - (n - 1) * passo < 6;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
        <svg width={360} height={420} viewBox="0 0 120 140">
          <rect x={10} y={10} width={100} height={120} rx={8} fill={raio ? '#111' : '#2a3150'} stroke="#000" strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={20} y={22 + i * 26} width={80} height={18} rx={3} fill={raio ? '#222' : '#0b0e1c'} stroke="#000" strokeWidth={3} />)}
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={88} cy={31 + i * 26} r={4} fill={raio ? '#400' : COR.gpt} />)}
          {raio ? <path d="M70 0 L45 60 L65 60 L40 140" fill="none" stroke={AMAR} strokeWidth={7} /> : null}
        </svg>
        <div>
          <div style={{fontFamily: BANG, fontSize: 150, color: VERM, ...C(8)}}>QUEDAS: {n}</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, color: '#e6ecff'}}>o computador onde a IA do GPT jogava</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 18}}>
        {hs.map((h, i) => <div key={h} style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: i < n ? '#fff' : '#3a4363', background: i < n ? VERM : '#0b0e1c', border: '4px solid #000', borderRadius: 8, padding: '6px 14px'}}>{h} UTC</div>)}
      </div>
      <div style={{width: 1300, height: 34, background: '#0b0e1c', border: '4px solid #2a3150', borderRadius: 8, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${((f % passo) / passo) * 100}%`, background: COR.gpt}} />
      </div>
      <div style={{fontFamily: POP, fontWeight: 700, fontSize: 26, color: '#9fb0d8'}}>a cada queda, a partida voltava pro zero</div>
    </AbsoluteFill>
  );
};

const Visual: React.FC<{v: V; f: number; dur: number}> = ({v, f, dur}) => {
  const centro = (x: React.ReactNode) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{x}</AbsoluteFill>;
  switch (v.tipo) {
    case 'gba': return centro(<Gba v={v} f={f} dur={dur} />);
    case 'papel': return centro(<Papel v={v} f={f} dur={dur} />);
    case 'terminal': return centro(<Terminal v={v} f={f} dur={dur} />);
    case 'cartao': return centro(<CartaoIA v={v} f={f} />);
    case 'numero': return <NumeroTela v={v} f={f} />;
    case 'mascotes': return <Mascotes v={v} f={f} />;
    case 'barras': return <Barras v={v} f={f} dur={dur} />;
    case 'tabela': return <Tabela v={v} f={f} />;
    case 'img': return centro(<ImgTela v={v} f={f} />);
    case 'mapa': return <Mapa v={v} f={f} />;
    case 'quedas': return <Quedas v={v} f={f} dur={dur} />;
    case 'comentarios': return <AbsoluteFill style={{background: '#0b1428'}}><AU2Comentarios comentarios={v.comentarios as Comentario[]} passo={Math.max(24, Math.floor((dur - 50) / 2))} /></AbsoluteFill>;
    case 'split': {
      // tela dividida em diagonal: promessa (papel) à esquerda, realidade (jogo) à direita
      const lado = (x: V, w: number) => (x.tipo === 'gba' ? <Gba v={x} f={f} dur={dur} w={w} /> : x.tipo === 'papel' ? <Papel v={x} f={f} dur={dur} w={w + 200} /> : x.tipo === 'terminal' ? <Terminal v={x} f={f} dur={dur} w={w + 200} /> : <ImgTela v={x} f={f} w={w + 200} />);
      return (
        <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: '0 30px'}}>
          <div style={{transform: 'scale(1.0)', width: 900, display: 'flex', justifyContent: 'center'}}>{lado(v.esq, v.esq.tipo === 'gba' ? 620 : 640)}</div>
          <div style={{position: 'absolute', left: 955, top: -40, width: 10, height: 1160, background: '#fff', transform: 'rotate(8deg)', boxShadow: '0 0 0 4px #000'}} />
          <div style={{transform: 'scale(1.0)', width: 960, display: 'flex', justifyContent: 'center'}}>{lado(v.dir, v.dir.tipo === 'gba' ? 620 : 640)}</div>
        </AbsoluteFill>
      );
    }
    default: return null;
  }
};

// ---------- citação: quem disse, de onde (código / resposta / log) e o texto ----------
const TAGS: Record<string, string> = {'código': 'ESCRITO NO CÓDIGO', README: 'README', resposta: 'RESPOSTA AO FELIPE', 'legenda do log': 'LOG DA PARTIDA', 'log inventado': 'DIÁRIO ENTREGUE ANTES DE RODAR', 'treino.log': 'RELATÓRIO DO TREINO', 'jogar.log': 'LOG DA PARTIDA'};
const Cita: React.FC<{o: Extract<Over, {tipo: 'cita'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 8], [0, 1], cl) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const n = Math.floor(interpolate(f, [4, Math.max(10, o.dur * 0.45)], [0, o.texto.length], cl));
  const papel = ['código', 'README', 'resposta', 'log inventado'].some((t) => o.tag.startsWith(t));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, bottom: 46, display: 'flex', gap: 22, alignItems: 'flex-end', opacity: e, transform: `translateY(${(1 - e) * 40}px)`}}>
      <Mascote ia={o.ia} s={170} f={f} />
      <div style={{flex: 1, background: papel ? PAPEL : '#05070f', border: `7px solid ${COR[o.ia]}`, borderRadius: 14, boxShadow: sombra(), padding: '14px 24px'}}>
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 24, color: COR[o.ia]}}>{NOME[o.ia]} · {TAGS[o.tag] ?? o.tag.toUpperCase()}</div>
        <div style={{fontFamily: papel ? POP : MONO, fontWeight: papel ? 800 : 700, fontSize: o.texto.length > 140 ? 32 : 38, lineHeight: 1.25, color: papel ? '#1d1a12' : '#9cff9c'}}>"{o.texto.slice(0, n)}"</div>
      </div>
    </div>
  );
};

// ---------- transição própria: "salvando o jogo..." (na partida do GPT a caixa falha) ----------
const Salvando: React.FC<{titulo: string; falha?: boolean}> = ({titulo, falha}) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 8], [0, 1], cl), sai = interpolate(f, [36, 46], [1, 0], cl);
  const txt = falha && f > 28 ? titulo.slice(0, Math.floor(titulo.length / 2)) + '#%@' : titulo.slice(0, Math.floor(interpolate(f, [6, 26], [0, titulo.length], cl)));
  const glitch = falha && f > 28 && f < 38;
  return (
    <AbsoluteFill style={{background: `rgba(5,7,15,${0.85 * entra * sai})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1500, background: '#f8f8f8', border: '10px solid #2b3a8f', borderRadius: 18, boxShadow: '0 0 0 8px #fff, 14px 14px 0 8px #000', padding: '30px 44px', transform: `scaleY(${entra * sai}) translateX(${glitch ? Math.sin(f * 9) * 30 : 0}px)`, filter: glitch ? 'hue-rotate(140deg) contrast(1.6)' : undefined}}>
        <div style={{fontFamily: PIX, fontSize: 26, color: '#555', marginBottom: 20}}>{falha && f > 28 ? 'ERRO AO SALVAR...' : 'SALVANDO O JOGO...'}</div>
        <div style={{fontFamily: PIX, fontSize: 40, lineHeight: 1.5, color: '#202020'}}>{txt}<span style={{color: VERM, opacity: Math.floor(f / 6) % 2 ? 1 : 0}}> ▼</span></div>
      </div>
    </AbsoluteFill>
  );
};

export const CenaView: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  let soco = 0;
  for (const o of c.over) { const d = f - o.at; if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme')) soco = Math.max(soco, 0.05 * (1 - d / 12)); }
  const deriva = 1 + 0.03 * (f / Math.max(1, c.dur));
  const temCita = c.over.some((o) => o.tipo === 'cita' && f >= o.at && f < o.at + o.dur);
  return (
    <AbsoluteFill>
      <Bancada f={f} />
      <AbsoluteFill style={{transform: `scale(${(deriva + soco) * (temCita ? 0.9 : 1)}) translateY(${temCita ? -50 : 0}px)`}}>
        <Visual v={c.visual} f={f} dur={c.dur} />
      </AbsoluteFill>
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'cita' ? <Cita o={o} /> : null}
          {o.tipo === 'selo' ? <SeqSelo texto={o.texto} comMeme={c.over.some((m) => m.tipo === 'meme' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'salvando' ? <Salvando titulo={o.titulo} falha={o.falha} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};
const SeqSelo: React.FC<{texto: string; comMeme?: boolean}> = ({texto, comMeme}) => <Selo texto={texto} cor={VERM} comMeme={comMeme} f={useCurrentFrame()} />;

export const PokemonVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  if (!tl) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => { const s = ini; ini += c.dur; return <Sequence key={c.id} from={s} durationInFrames={c.dur}><CenaView c={c} /></Sequence>; })}
    </AbsoluteFill>
  );
};
