// 60 Segundos das IAs — um dia no abrigo: o porão 3D (sessenta/blender/abrigo.py) com a família nos seus lugares
// (sprites 3D, ícones de estado sobre a cabeça), os itens que sobraram na prateleira, o cartão do evento com a escolha
// da IA, o pensamento dela e o diário do dia sendo escrito linha por linha. Dados: sessenta/logs/<partida>.json
// convertido por sessenta/ferramentas/partida_remotion.mjs (public/sessenta/partidas/<arquivo>.json).
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

type PessoaEst = {id: string; vivo: boolean; noAbrigo: boolean; fora: boolean; fugiu: unknown; perdido: boolean; semComer: number; semBeber: number; doente: boolean; ferido: boolean; cansado: number; loucura: number; mutante: boolean};
type Resumo = {pessoas: PessoaEst[]; itens: Record<string, number>; quebrados: string[]};
export type DiaLog = {
  dia: number; antes: Resumo; depois?: Resumo; virada?: boolean;
  evento: null | {id: string; texto: string; escolhas: {id: string; texto: string}[]; escolhida: string | null; automatico: boolean};
  resposta?: {pensamento: string; diario: string; escolha: string | null};
  diario: string[];
};
type Abrigo = {img: string; w: number; h: number; lugares: Record<string, [number, number]>; prateleira: [number, number][][]; mesa: [number, number]};
type Fam = {anims: Record<string, {quadros: number; dur: number}>; pessoas: Record<string, {pes: [number, number]; w: number; h: number}>};
type Itens = {itens: Record<string, {base: [number, number]; w: number; h: number}>};
export type DadosDia = {dia: DiaLog; abrigo: Abrigo; fam: Fam; itens: Itens; ia: {nome: string; cor: string}};
type Props = {dados: DadosDia | null; arquivo: string; dia: number};

const FPS = 30;
const LINHA = 2.4; // s por linha do diário
const ini = (d: DiaLog) => (d.evento && !d.evento.automatico ? 7 : 2.5); // s até o diário começar
export const duracaoDia = (d: DiaLog) => Math.round(FPS * (ini(d) + d.diario.length * LINHA + 2.5));

export const calcDia: CalculateMetadataFunction<Props> = async ({props}) => {
  const j = async (f: string) => (await fetch(staticFile(f))).json();
  const [partida, abrigo, fam, itens] = await Promise.all([j(`sessenta/partidas/${props.arquivo}.json`), j('sessenta/abrigo/abrigo.json'), j('sessenta/familia/familia.json'), j('sessenta/itens/itens.json')]);
  const dia: DiaLog = partida.dias.find((d: DiaLog) => d.dia === props.dia && !d.virada) ?? partida.dias[0];
  return {durationInFrames: duracaoDia(dia), props: {...props, dados: {dia, abrigo, fam, itens, ia: partida.iaVisual}}};
};

const NOMES: Record<string, string> = {pai: 'Osvaldo', mae: 'Celeste', filha: 'Juju', filho: 'Tico'};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

function icones(p: PessoaEst) {
  const r: string[] = [];
  if (p.doente) r.push('🤢');
  if (p.ferido) r.push('🩹');
  if (p.loucura >= 60) r.push('😵‍💫');
  if (p.semComer >= 6) r.push('🍽️');
  if (p.semBeber >= 3 && !p.mutante) r.push('💧');
  if (p.cansado > 0) r.push('💤');
  if (p.mutante) r.push('🧬');
  return r;
}

export const Dia: React.FC<Props> = ({dados}) => {
  const frame = useCurrentFrame();
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  const {dia, abrigo, fam, itens, ia} = dados;
  const s = frame / FPS;
  // o porão ocupa a esquerda (escala para caber em 1180 × 1000)
  const Z = Math.min(1180 / abrigo.w, 1000 / abrigo.h);
  const OX = 30, OY = (1080 - abrigo.h * Z) / 2 + 20;
  const est = dia.antes;
  const dentro = est.pessoas.filter((p) => p.vivo && p.noAbrigo);
  const ausentes = est.pessoas.filter((p) => !(p.vivo && p.noAbrigo));

  const Pessoa: React.FC<{p: PessoaEst}> = ({p}) => {
    const info = fam.pessoas[p.id];
    const a = fam.anims.parado;
    const lug = abrigo.lugares[p.id];
    if (!info || !a || !lug) return null;
    const q = Math.floor(((s + lug[0] * 0.01) / a.dur) * a.quadros) % a.quadros;
    const treme = p.loucura >= 60 ? Math.sin(frame * 1.7) * 3 : 0;
    const ic = icones(p);
    return (
      <div style={{position: 'absolute', left: lug[0] - info.pes[0] + treme, top: lug[1] - info.pes[1], width: info.w, height: info.h}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', filter: p.doente ? 'hue-rotate(60deg) saturate(0.7)' : p.mutante ? 'hue-rotate(140deg)' : undefined}}>
          <Img src={staticFile(`sessenta/familia/${p.id}/parado_0.png`)} style={{position: 'absolute', left: -q * info.w, top: 0, height: info.h}} />
        </div>
        {ic.length > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: -46, textAlign: 'center', fontSize: 40, transform: `translateY(${Math.sin(s * 3) * 4}px)`}}>{ic.join('')}</div>}
      </div>
    );
  };

  // itens na prateleira: 3 andares × 7 lugares; sopa e água ficam empilhadas no andar de baixo
  const slots = abrigo.prateleira.flat();
  const outros = Object.entries(est.itens).filter(([k, n]) => n > 0 && k !== 'sopa' && k !== 'agua').map(([k]) => k);
  const latas = [...Array(Math.min(est.itens.sopa ?? 0, 4)).fill('sopa'), ...Array(Math.min(est.itens.agua ?? 0, 3)).fill('agua')];
  const naPrat = [...outros.slice(0, 14), ...Array(Math.max(0, 14 - Math.min(outros.length, 14))).fill(null)].slice(0, 14).concat(latas);

  const ev = dia.evento;
  const pensar = dia.resposta?.pensamento ?? '';
  const tEscolha = 4.5;
  const comeco = ini(dia);
  const visiveis = dia.diario.filter((_, i) => s >= comeco + i * LINHA);
  const entrada = (t: number) => spring({frame: frame - t * FPS, fps: FPS, config: {damping: 14}});

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 35% 45%, #2b2a26, #0c0c0d)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: OX, top: OY, width: abrigo.w, height: abrigo.h, transform: `scale(${Z})`, transformOrigin: '0 0'}}>
        <Img src={staticFile(abrigo.img)} style={{position: 'absolute', left: 0, top: 0, width: abrigo.w, height: abrigo.h}} />
        {naPrat.map((id, i) => id && slots[i] && (
          <Img key={i} src={staticFile(`sessenta/itens/${id}.png`)} style={{position: 'absolute', left: slots[i][0] - (itens.itens[id]?.base[0] ?? 88) * 0.5, top: slots[i][1] - (itens.itens[id]?.base[1] ?? 150) * 0.5, width: (itens.itens[id]?.w ?? 176) * 0.5, filter: est.quebrados.includes(id) ? 'grayscale(1) brightness(0.6)' : undefined}} />
        ))}
        {[...dentro].sort((a, b) => abrigo.lugares[a.id][1] - abrigo.lugares[b.id][1]).map((p) => <Pessoa key={p.id} p={p} />)}
      </div>
      {/* cabeçalho */}
      <div style={{position: 'absolute', left: 30, top: 24, display: 'flex', gap: 14, alignItems: 'center'}}>
        <div style={{padding: '6px 22px', borderRadius: 14, background: ia.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{ia.nome}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: '#f2c230', WebkitTextStroke: '2px #000'}}>DIA {dia.dia}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', background: '#000a', padding: '6px 14px', borderRadius: 10}}>
          🥫 {est.itens.sopa ?? 0} · 💧 {est.itens.agua ?? 0}
        </div>
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
      {/* evento */}
      {ev && (
        <div style={{position: 'absolute', left: 60, top: 120, width: 1080, transform: `scale(${interpolate(entrada(0.3), [0, 1], [0.6, 1])})`, opacity: interpolate(s, [0.3, 0.6, comeco - 0.4, comeco], [0, 1, 1, ev.automatico ? 0 : 0.0], cl), transformOrigin: 'top left'}}>
          <div style={{background: '#f5ecd2', border: '6px solid #2b2116', borderRadius: 18, padding: '22px 28px', boxShadow: '0 12px 0 #0007', fontFamily: FONT.display}}>
            <div style={{fontSize: 34, fontWeight: 800, color: '#2b2116', lineHeight: 1.25}}>{ev.texto}</div>
            {!ev.automatico && ev.escolhas.map((o) => {
              const marcada = s >= tEscolha && o.id === ev.escolhida;
              return (
                <div key={o.id} style={{marginTop: 12, padding: '8px 16px', borderRadius: 12, fontSize: 28, fontWeight: 800, border: '4px solid #2b2116', background: marcada ? ia.cor : '#fff', color: marcada ? '#fff' : '#2b2116', opacity: s >= tEscolha && !marcada ? 0.45 : 1, transform: marcada ? `scale(${interpolate(entrada(tEscolha), [0, 1], [1.12, 1.03])})` : undefined}}>
                  {marcada ? '👉 ' : ''}{o.texto}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* pensamento da IA */}
      {pensar && s > 1 && s < comeco + 2 && (
        <div style={{position: 'absolute', left: 120, bottom: 90, width: 980, padding: '14px 22px', borderRadius: 26, background: '#fff', border: `5px solid ${ia.cor}`, fontFamily: FONT.display, fontWeight: 700, fontSize: 28, fontStyle: 'italic', color: '#222', opacity: interpolate(s, [1, 1.4, comeco + 1.5, comeco + 2], [0, 1, 1, 0], cl)}}>
          💭 {pensar}
        </div>
      )}
      {/* diário */}
      <div style={{position: 'absolute', right: 34, top: 40, bottom: 40, width: 640, background: '#f3e7c4', borderRadius: 10, border: '6px solid #3b2b18', boxShadow: '0 14px 0 #0008', padding: '26px 30px', fontFamily: FONT.display, transform: 'rotate(1deg)'}}>
        <div style={{fontSize: 40, fontWeight: 900, color: '#3b2b18', borderBottom: '3px solid #3b2b1866', paddingBottom: 8}}>Diário · dia {dia.dia}</div>
        {dia.resposta?.diario && s >= comeco - 1 && <div style={{marginTop: 12, fontSize: 26, fontWeight: 700, color: ia.cor, fontStyle: 'italic'}}>“{dia.resposta.diario}”</div>}
        {visiveis.map((l, i) => (
          <div key={i} style={{marginTop: 12, fontSize: 25, fontWeight: 600, color: '#2b2116', lineHeight: 1.3, opacity: interpolate(s, [comeco + i * LINHA, comeco + i * LINHA + 0.4], [0, 1], cl)}}>
            • {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
