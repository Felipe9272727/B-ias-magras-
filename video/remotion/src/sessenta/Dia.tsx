// 60 Segundos das IAs — um dia no abrigo, em 2D desenhado (como no jogo): o cenário traçado (public/sessenta/abrigo2d),
// a família sentada nos seus lugares com a variante de desenho do estado de cada um (doente, louco, ferido...), os itens
// que a família ainda tem no lugar deles, e o diário abrindo por cima com o evento, a escolha da IA e as linhas do dia.
// Dados: sessenta/logs/<partida>.json convertido por sessenta/ferramentas/partida_remotion.mjs.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

type PessoaEst = {id: string; vivo: boolean; noAbrigo: boolean; fora: boolean; fugiu: unknown; perdido: boolean; semComer: number; semBeber: number; doente: boolean; ferido: boolean; cansado: number; loucura: number; mutante: boolean};
type Resumo = {pessoas: PessoaEst[]; itens: Record<string, number>; quebrados: string[]};
export type DiaLog = {
  dia: number; antes: Resumo; virada?: boolean;
  evento: null | {id: string; texto: string; escolhas: {id: string; texto: string}[]; escolhida: string | null; automatico: boolean};
  resposta?: {pensamento: string; diario: string; escolha: string | null};
  diario: string[];
};
type Lugar = {x: number; y: number; escala: number};
type Pos = {x: number; y: number; w: number};
type Cena = {lugares: Record<string, Lugar>; itens: Record<string, Pos | Pos[]>};
type Fig = {viewBox: [number, number]; pes: [number, number]; variantes: Record<string, string>};
export type DadosDia = {dia: DiaLog; cena: Cena; figs: Record<string, Fig>; itens: Record<string, {quebrado?: boolean}>; ia: {nome: string; cor: string}; diasFadiga: number};
type Props = {dados: DadosDia | null; arquivo: string; dia: number; vel?: number};

const FPS = 30;
const PESSOAS = ['pai', 'mae', 'filha', 'filho'];
const LINHA = 2.4; // s por linha do diário
const ABRE = 2.6;  // s olhando o abrigo antes do diário abrir
const ini = (d: DiaLog) => ABRE + (d.evento && !d.evento.automatico ? 5.5 : 1.2); // s até as linhas do dia começarem
export const duracaoDia = (d: DiaLog) => Math.round(FPS * (ini(d) + d.diario.length * LINHA + 2.2));

const j = async (f: string) => { try { const r = await fetch(staticFile(f)); return r.ok ? await r.json() : null } catch { return null } };
// carrega tudo o que um dia precisa (também usado pela prévia e pelo vídeo montado)
export async function carregarDia(arquivo: string, n: number): Promise<DadosDia> {
  const [partida, cena, itens, ...figs] = await Promise.all([j(`sessenta/partidas/${arquivo}.json`), j('sessenta/abrigo2d/cena.json'), j('sessenta/abrigo2d/itens/itens.json'), ...PESSOAS.map((p) => j(`sessenta/abrigo2d/personagens/${p}/${p}.json`))]);
  const dia: DiaLog = partida.dias.find((d: DiaLog) => d.dia === n && !d.virada) ?? partida.dias[0];
  return {dia, cena, itens: itens ?? {}, figs: Object.fromEntries(PESSOAS.map((p, i) => [p, figs[i]]).filter(([, f]) => f)), ia: partida.iaVisual, diasFadiga: 20};
}

export const calcDia: CalculateMetadataFunction<Props> = async ({props}) => {
  const [partida, cena, itens, ...figs] = await Promise.all([j(`sessenta/partidas/${props.arquivo}.json`), j('sessenta/abrigo2d/cena.json'), j('sessenta/abrigo2d/itens/itens.json'), ...PESSOAS.map((p) => j(`sessenta/abrigo2d/personagens/${p}/${p}.json`))]);
  const dia: DiaLog = partida.dias.find((d: DiaLog) => d.dia === props.dia && !d.virada) ?? partida.dias[0];
  return {durationInFrames: duracaoDia(dia), props: {...props, dados: {dia, cena, itens: itens ?? {}, figs: Object.fromEntries(PESSOAS.map((p, i) => [p, figs[i]]).filter(([, f]) => f)), ia: partida.iaVisual, diasFadiga: 20}}};
};

const NOMES: Record<string, string> = {pai: 'Osvaldo', mae: 'Celeste', filha: 'Juju', filho: 'Tico'};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// qual desenho usar: o estado mais marcante que tiver variante desenhada; o resto vira efeito por cima
function variante(p: PessoaEst, fig: Fig) {
  const louco = p.loucura >= 60;
  const fome = p.semComer >= 6 || p.semBeber >= 4;
  const ordem: [string, boolean][] = [
    ['mutante', p.mutante], ['doente_louco', p.doente && louco], ['louco', louco], ['doente', p.doente],
    ['ferido', p.ferido], ['fome', fome], ['cansado', p.cansado > 0],
  ];
  const tem = (k: string) => !!fig.variantes[k];
  const usada = ordem.find(([k, cond]) => cond && tem(k))?.[0] ?? 'base';
  // efeitos para os estados que não ganharam desenho próprio
  const filtros: string[] = [];
  if (p.doente && !usada.includes('doente') && usada !== 'mutante') filtros.push('sepia(0.35) hue-rotate(40deg) saturate(1.3)');
  if (fome && usada === 'base') filtros.push('saturate(0.7) brightness(0.93)');
  return {arq: fig.variantes[usada], filtro: filtros.join(' ') || undefined, treme: louco && !usada.includes('louco'), usada};
}

export const Dia: React.FC<Props> = ({dados, vel = 1}) => {
  const frame = Math.round(useCurrentFrame() * vel);
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  const {dia, cena, figs, itens, ia} = dados;
  const s = frame / FPS;
  const est = dia.antes;
  const dentro = est.pessoas.filter((p) => p.vivo && p.noAbrigo);
  const ausentes = est.pessoas.filter((p) => !(p.vivo && p.noAbrigo));
  const comeco = ini(dia);
  const ev = dia.evento;

  // câmera: começa um pouco aberta e vai fechando devagar; quando o diário abre, desliza para a esquerda
  const abre = spring({frame: frame - ABRE * FPS, fps: FPS, config: {damping: 18, mass: 0.9}});
  // movimento contínuo (tempo real da cena, não do dia): deriva, zoom subindo devagar e um "punch" em cada pessoa a cada 4,5 s
  const fr = useCurrentFrame();
  const sr = fr / FPS;
  const SEG = 4.5;
  const seg = Math.floor(sr / SEG);
  const punch = spring({frame: fr - seg * SEG * FPS, fps: FPS, config: {damping: 14, mass: 0.7}});
  const quem = (k: number) => cena.lugares[dentro.length ? dentro[((k % dentro.length) + dentro.length) % dentro.length].id : 'pai'];
  const ox = interpolate(punch, [0, 1], [quem(seg - 1)?.x ?? 960, quem(seg)?.x ?? 960]);
  const zoom = interpolate(s, [0, ABRE], [1.0, 1.06], cl) + 0.04 * abre + Math.min(0.08, 0.004 * sr) + 0.035 * Math.sin(Math.PI * Math.min(1, punch)) + (seg > 0 ? 0.02 : 0);
  const dx = -260 * abre + 18 * Math.sin(sr * 0.35);
  const dy = 10 * Math.sin(sr * 0.5 + 1);
  const luz = 0.10 + 0.025 * Math.sin(sr * 7.3) * Math.sin(sr * 2.1) + (Math.sin(sr * 13) > 0.97 ? -0.05 : 0);

  // itens da família no cenário (sopa e água viram fileiras na prateleira)
  const objetos: React.ReactNode[] = [];
  for (const [id, n] of Object.entries(est.itens)) {
    if (!n || !cena.itens[id]) continue;
    const quebrado = est.quebrados.includes(id);
    const arq = quebrado && itens[id]?.quebrado ? `${id}_quebrado` : id;
    if (!itens[id]) continue;
    const posicoes = Array.isArray(cena.itens[id]) ? (cena.itens[id] as Pos[]).slice(0, n) : [cena.itens[id] as Pos];
    posicoes.forEach((p, i) => objetos.push(
      <Img key={id + i} src={staticFile(`sessenta/abrigo2d/itens/${arq}.svg`)} style={{position: 'absolute', left: p.x - p.w / 2, top: p.y - p.w / 2, width: p.w, filter: quebrado && arq === id ? 'grayscale(0.8) brightness(0.8)' : undefined}} />,
    ));
  }

  const Pessoa: React.FC<{p: PessoaEst}> = ({p}) => {
    const fig = figs[p.id];
    const lug = cena.lugares[p.id];
    if (!fig || !lug) return null;
    const v = variante(p, fig);
    const [w, h] = fig.viewBox;
    const k = lug.escala;
    const respira = 1 + 0.012 * Math.sin(sr * 2.2 + lug.x);
    const balanca = 1.2 * Math.sin(sr * 1.1 + lug.x / 90);
    const treme = v.treme ? Math.sin(frame * 1.9) * 3 : 0;
    return (
      <div style={{position: 'absolute', left: lug.x - fig.pes[0] * k + treme, top: lug.y - fig.pes[1] * k, width: w * k, height: h * k, transform: `scaleY(${respira}) rotate(${balanca}deg)`, transformOrigin: `${fig.pes[0] * k}px ${fig.pes[1] * k}px`}}>
        <Img src={staticFile(`sessenta/abrigo2d/personagens/${p.id}/${v.arq}`)} style={{width: '100%', height: '100%', filter: v.filtro}} />
      </div>
    );
  };

  const visiveis = dia.diario.filter((_, i) => s >= comeco + i * LINHA);
  const tEscolha = ABRE + 3.6;
  const pensar = dia.resposta?.pensamento ?? '';

  return (
    <AbsoluteFill style={{background: '#1c1b19', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${zoom})`, transformOrigin: `${ox}px 62%`}}>
        <Img src={staticFile('sessenta/abrigo2d/fundo.svg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
        {objetos}
        {[...dentro].sort((a, b) => (cena.lugares[a.id]?.y ?? 0) - (cena.lugares[b.id]?.y ?? 0)).map((p) => <Pessoa key={p.id} p={p} />)}
        <Img src={staticFile('sessenta/abrigo2d/frente.svg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
      </AbsoluteFill>
      {/* luz amarelada da lâmpada e vinheta */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 45% 35%, rgba(255,220,150,${luz.toFixed(3)}), rgba(0,0,0,0.55) 85%)`}} />
      {/* poeira no ar, na luz da lâmpada */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {Array.from({length: 26}, (_, i) => {
          const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
          const x = (r(1) * 1920 + sr * (8 + r(2) * 14) + 30 * Math.sin(sr * 0.6 + i)) % 1920;
          const y = (r(3) * 1080 - sr * (5 + r(4) * 10) + 2160) % 1080;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3 + r(5) * 4, height: 3 + r(5) * 4, borderRadius: '50%', background: 'rgba(255,235,190,0.55)', filter: 'blur(1px)', opacity: 0.25 + 0.5 * r(6)}} />;
        })}
      </AbsoluteFill>
      {/* cabeçalho */}
      <div style={{position: 'absolute', left: 30, top: 24, display: 'flex', gap: 14, alignItems: 'center'}}>
        <div style={{padding: '6px 22px', borderRadius: 14, background: ia.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{ia.nome}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: '#f2c230', WebkitTextStroke: '2px #000'}}>DIA {dia.dia}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', background: '#000a', padding: '6px 14px', borderRadius: 10}}>🥫 {est.itens.sopa ?? 0} · 💧 {est.itens.agua ?? 0}</div>
      </div>
      {ausentes.length > 0 && (
        <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', gap: 10, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: '#fff'}}>
          {ausentes.map((p) => (
            <div key={p.id} style={{background: '#000b', padding: '6px 12px', borderRadius: 10, border: '3px solid #777'}}>
              {NOMES[p.id]}: {!p.vivo && !p.perdido ? '✝️ morreu' : p.perdido ? 'ficou na casa' : p.fora ? '🎒 em expedição' : '🚪 sumiu'}
            </div>
          ))}
        </div>
      )}
      {/* diário: abre pela direita como no jogo */}
      <div style={{position: 'absolute', right: 40, top: 70, bottom: 70, width: 760, transform: `translateX(${(1 - abre) * 900}px) rotate(${1.2 - abre * 0.4}deg)`, background: '#efe2bd', borderRadius: 8, border: '6px solid #3b2b18', boxShadow: '0 18px 0 #0009, inset 0 0 60px #c9b07a', padding: '28px 34px', fontFamily: FONT.display, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: 'repeating-linear-gradient(#3b2b18 0 10px, transparent 10px 24px)'}} />
        <div style={{fontSize: 42, fontWeight: 900, color: '#3b2b18', borderBottom: '3px solid #3b2b1866', paddingBottom: 6}}>Diário · dia {dia.dia}</div>
        {ev && !ev.automatico && (
          <div style={{marginTop: 14}}>
            <div style={{fontSize: 27, fontWeight: 700, color: '#2b2116', lineHeight: 1.28}}>{ev.texto}</div>
            {ev.escolhas.map((o) => {
              const marcada = s >= tEscolha && o.id === ev.escolhida;
              return (
                <div key={o.id} style={{marginTop: 9, padding: '6px 14px', borderRadius: 10, fontSize: 24, fontWeight: 800, border: '3px solid #2b2116', background: marcada ? ia.cor : '#fff8', color: marcada ? '#fff' : '#2b2116', opacity: s >= tEscolha && !marcada ? 0.4 : 1, transform: marcada ? `scale(${interpolate(spring({frame: frame - tEscolha * FPS, fps: FPS}), [0, 1], [1.1, 1.02])})` : undefined}}>
                  {marcada ? '✔ ' : ''}{o.texto}
                </div>
              );
            })}
          </div>
        )}
        {ev && ev.automatico && s >= ABRE + 0.4 && <div style={{marginTop: 14, fontSize: 27, fontWeight: 700, color: '#2b2116'}}>{ev.texto}</div>}
        {dia.resposta?.diario && s >= comeco - 0.6 && <div style={{marginTop: 14, fontSize: 25, fontWeight: 700, color: ia.cor, fontStyle: 'italic'}}>“{dia.resposta.diario}”</div>}
        {visiveis.map((l, i) => (
          <div key={i} style={{marginTop: 9, fontSize: 23, fontWeight: 600, color: '#2b2116', lineHeight: 1.28, opacity: interpolate(s, [comeco + i * LINHA, comeco + i * LINHA + 0.4], [0, 1], cl)}}>• {l}</div>
        ))}
      </div>
      {/* pensamento da IA */}
      {pensar && s > ABRE + 0.8 && s < comeco + 3 && (
        <div style={{position: 'absolute', left: 60, bottom: 90, width: 900, padding: '14px 22px', borderRadius: 26, background: '#fff', border: `5px solid ${ia.cor}`, fontFamily: FONT.display, fontWeight: 700, fontSize: 27, fontStyle: 'italic', color: '#222', opacity: interpolate(s, [ABRE + 0.8, ABRE + 1.2, comeco + 2.5, comeco + 3], [0, 1, 1, 0], cl)}}>
          💭 {pensar}
        </div>
      )}
    </AbsoluteFill>
  );
};
