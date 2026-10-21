// 60 Segundos das IAs — um dia no abrigo, em 2D desenhado (como no jogo): o abrigo inteiro em plano aberto (public/sessenta/abrigo2d),
// a família sentada nos seus lugares (visual limpo no começo; o desgaste só entra quando o estado pede), os itens que ainda existem
// no lugar deles, e o diário (um caderno de verdade, letra manuscrita) entrando pela direita com o evento, a escolha da IA e as linhas do dia.
// Dados: sessenta/logs/<partida>.json convertido por sessenta/ferramentas/partida_remotion.mjs.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

const LETRA = "'Kalam', 'Patrick Hand', 'Comic Sans MS', cursive";
const DIR = 'sessenta/abrigo2d/';

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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const MESA = ['baralho', 'damas', 'gaita']; // itens em cima da mesa: desenhados por cima da toalha

// qual desenho usar. O visual começa limpo (base); o desgaste cresce aos poucos com o estado do log e só os casos fortes trocam de desenho
function variante(p: PessoaEst, fig: Fig, dia: number, diasFadiga: number) {
  const louco = p.loucura >= 60;
  const fome = p.semComer >= 8 || p.semBeber >= 6;
  const ordem: [string, boolean][] = [
    ['mutante', p.mutante], ['doente_louco', p.doente && louco], ['louco', louco], ['doente', p.doente],
    ['ferido', p.ferido], ['fome', fome], ['cansado', p.cansado >= 3], ['fatigado', dia >= diasFadiga],
  ];
  const tem = (k: string) => !!fig.variantes[k];
  const usada = ordem.find(([k, cond]) => cond && tem(k))?.[0] ?? 'base';
  const desgaste = Math.max(0, Math.min(1, Math.max((p.semComer - 2) / 8, (p.semBeber - 2) / 6, p.cansado / 6)));
  const filtros: string[] = [];
  if (p.doente && !usada.includes('doente') && usada !== 'mutante') filtros.push('sepia(0.35) hue-rotate(40deg) saturate(1.3)');
  if (usada === 'base' && desgaste > 0) filtros.push(`saturate(${(1 - 0.3 * desgaste).toFixed(2)}) brightness(${(1 - 0.12 * desgaste).toFixed(2)}) sepia(${(0.22 * desgaste).toFixed(2)})`);
  return {arq: fig.variantes[usada], filtro: filtros.join(' ') || undefined, treme: p.loucura >= 30 && !usada.includes('louco'), usada};
}

// fontes manuscritas (Google Fonts, arquivos em public/sessenta/abrigo2d/fontes)
function useFontes() {
  const [h] = useState(() => delayRender('fontes do diario'));
  useEffect(() => {
    const defs: [string, string, string][] = [['Kalam', 'Kalam-400.ttf', '400'], ['Kalam', 'Kalam-700.ttf', '700'], ['Patrick Hand', 'PatrickHand.ttf', '400']];
    Promise.all(defs.map(([n, f, w]) => new FontFace(n, `url(${staticFile(DIR + 'fontes/' + f)})`, {weight: w}).load()))
      .then((fs) => fs.forEach((f) => (document as any).fonts.add(f))).catch(() => {}).finally(() => continueRender(h));
  }, [h]);
}

const PAPEL = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.1  0 0 0 -1.6 1.0"/></filter><rect width="400" height="400" filter="url(#n)" opacity="0.5"/></svg>')}")`;

// riscos de dia na parede (grupos de 5), como no jogo
const Riscos: React.FC<{n: number}> = ({n}) => {
  const gr = Math.ceil(n / 5);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({length: gr}, (_, g) => {
        const x0 = 1786 + (g % 4) * 36, y0 = 536 + Math.floor(g / 4) * 44;
        const k = Math.min(5, n - g * 5);
        return (
          <g key={g} stroke="#1b1a18" strokeWidth={4} strokeLinecap="round" opacity={0.85}>
            {Array.from({length: Math.min(4, k)}, (_, i) => <line key={i} x1={x0 + i * 6 + (g % 2)} y1={y0 + ((i * 3) % 2)} x2={x0 + i * 6 - 1} y2={y0 + 30 + ((i + g) % 3)} />)}
            {k >= 5 && <line x1={x0 - 6} y1={y0 + 24} x2={x0 + 28} y2={y0 + 6} />}
          </g>
        );
      })}
    </svg>
  );
};

export const Dia: React.FC<Props> = ({dados, vel = 1}) => {
  useFontes();
  const frame = Math.round(useCurrentFrame() * vel);
  const fr = useCurrentFrame();
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  const {dia, cena, figs, itens, ia} = dados;
  const s = frame / FPS;
  const sr = fr / FPS;
  const est = dia.antes;
  const dentro = est.pessoas.filter((p) => p.vivo && p.noAbrigo);
  const ausentes = est.pessoas.filter((p) => !(p.vivo && p.noAbrigo));
  const comeco = ini(dia);
  const ev = dia.evento;
  const total = duracaoDia(dia) / FPS; // em tempo do dia (vel já aplicada ao frame)

  // o diário entra pela direita (abre) e sai no fim (fecha); k = 1 com o caderno aberto
  const abre = spring({frame: frame - ABRE * FPS, fps: FPS, config: {damping: 17, mass: 0.9}});
  const fecha = spring({frame: frame - (total - 1.7) * FPS, fps: FPS, config: {damping: 20, mass: 0.9}});
  const k = Math.max(0, abre - fecha);

  // câmera: plano aberto do abrigo inteiro, deriva lenta e leve push-in; com o caderno aberto o abrigo recua para a esquerda
  const c = 1.035 + 0.025 * Math.min(1, sr / 25) + 0.004 * Math.sin(sr * 0.5);
  const dx = 16 * Math.sin(sr * 0.33), dy = 8 * Math.sin(sr * 0.45 + 1);
  const sc = lerp(c, 0.76, k);
  const tx = lerp(960 * (1 - c) + dx, -236, k);
  const ty = lerp(560 * (1 - c) + dy, 130, k);
  const piscar = 0.9 + 0.1 * Math.sin(sr * 9.1) * Math.sin(sr * 2.3) - (Math.sin(sr * 11) > 0.985 ? 0.35 : 0);

  // itens no cenário (sopa e água viram fileiras na prateleira do armário)
  const objetos: React.ReactNode[] = [];
  const objMesa: React.ReactNode[] = [];
  for (const [id, n] of Object.entries(est.itens)) {
    if (!n || !cena.itens[id] || !itens[id]) continue;
    const quebrado = est.quebrados.includes(id);
    const arq = quebrado && itens[id]?.quebrado ? `${id}_quebrado` : id;
    const posicoes = Array.isArray(cena.itens[id]) ? (cena.itens[id] as Pos[]).slice(0, n) : [cena.itens[id] as Pos];
    posicoes.forEach((p, i) => (MESA.includes(id) ? objMesa : objetos).push(
      <Img key={id + i} src={staticFile(`${DIR}itens/${arq}.svg`)} style={{position: 'absolute', left: p.x - p.w / 2, top: p.y - p.w / 2, width: p.w, filter: quebrado && arq === id ? 'grayscale(0.8) brightness(0.8)' : undefined}} />,
    ));
  }

  const pessoas = [...dentro].sort((a, b) => (cena.lugares[a.id]?.y ?? 0) - (cena.lugares[b.id]?.y ?? 0)).map((p) => {
    const fig = figs[p.id];
    const lug = cena.lugares[p.id];
    if (!fig || !lug) return null;
    const v = variante(p, fig, dia.dia, dados.diasFadiga);
    const [w, h] = fig.viewBox;
    const kk = lug.escala;
    const respira = 1 + 0.011 * Math.sin(sr * 2.2 + lug.x);
    const balanca = 0.9 * Math.sin(sr * 1.1 + lug.x / 90);
    const treme = v.treme ? Math.sin(frame * 1.9) * 2.5 : v.usada.includes('louco') ? Math.sin(frame * 1.9) * 2 : 0;
    return (
      <div key={p.id} style={{position: 'absolute', left: lug.x - fig.pes[0] * kk + treme, top: lug.y - fig.pes[1] * kk, width: w * kk, height: h * kk, transform: `scaleY(${respira}) rotate(${balanca}deg)`, transformOrigin: `${fig.pes[0] * kk}px ${fig.pes[1] * kk}px`}}>
        <Img src={staticFile(`${DIR}personagens/${p.id}/${v.arq}`)} style={{width: '100%', height: '100%', filter: v.filtro, ...(p.id === 'pai' || p.id === 'filha' ? {WebkitMaskImage: 'linear-gradient(#000 88%, transparent 99%)', maskImage: 'linear-gradient(#000 88%, transparent 99%)'} : {})}} />
      </div>
    );
  });

  const visiveis = dia.diario.filter((_, i) => s >= comeco + i * LINHA);
  const tEscolha = ABRE + 3.6;
  const pensar = dia.resposta?.pensamento ?? '';
  const nChar = (ev?.texto.length ?? 0) + (ev?.escolhas ?? []).reduce((a, o) => a + o.texto.length + 6, 0) + (dia.resposta?.diario.length ?? 0) + dia.diario.reduce((a, l) => a + l.length + 14, 0);
  const F = Math.max(20, Math.min(44, 1120 / Math.sqrt(Math.max(200, nChar))));
  const tinta = '#2a2118';

  const icones = (id: string, n: number, h: number) => Array.from({length: Math.min(n, 12)}, (_, i) => <Img key={i} src={staticFile(`${DIR}itens/${id}.svg`)} style={{height: h, width: 'auto', marginLeft: i ? -h * 0.1 : 0, transform: `rotate(${((i * 7) % 5) - 2}deg)`}} />);

  return (
    <AbsoluteFill style={{background: '#262624', overflow: 'hidden'}}>
      {/* margem escura (só aparece quando o abrigo recua): o próprio cenário borrado */}
      <Img src={staticFile(DIR + 'fundo.svg')} style={{position: 'absolute', inset: -40, width: 2000, height: 1160, filter: 'blur(18px) brightness(0.45)'}} />
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${sc})`, transformOrigin: '0 0', width: 1920, height: 1080, boxShadow: k > 0 ? '0 0 40px #000a' : undefined}}>
        <Img src={staticFile(DIR + 'fundo.svg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
        <Riscos n={Math.max(0, dia.dia - 1)} />
        {/* ventilador girando */}
        <svg style={{position: 'absolute', left: 1081 - 34, top: 108 - 34}} width={68} height={68} viewBox="-34 -34 68 68">
          <g transform={`rotate(${(sr * 320) % 360})`} fill="#41363b" opacity={0.9}>
            {[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a})`} d="M0,0 C6,-8 14,-26 4,-31 C-6,-30 -8,-12 0,0 Z" />)}
          </g>
          <circle r={4} fill="#1d1719" />
        </svg>
        {objetos}
        {pessoas}
        <Img src={staticFile(DIR + 'frente.svg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
        {objMesa}
        {/* luz das lâmpadas */}
        {[[318, 118], [1578, 110]].map(([x, y], i) => (
          <div key={i} style={{position: 'absolute', left: x - 380, top: y - 380, width: 760, height: 760, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,246,220,${(0.30 * piscar).toFixed(3)}), rgba(255,246,220,0) 62%)`, mixBlendMode: 'screen'}} />
        ))}
      </AbsoluteFill>
      {/* poeira no ar */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 1 - 0.6 * k}}>
        {Array.from({length: 26}, (_, i) => {
          const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
          const x = (r(1) * 1920 + sr * (8 + r(2) * 14) + 30 * Math.sin(sr * 0.6 + i)) % 1920;
          const y = (r(3) * 1080 - sr * (5 + r(4) * 10) + 2160) % 1080;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3 + r(5) * 4, height: 3 + r(5) * 4, borderRadius: '50%', background: 'rgba(255,240,200,0.6)', filter: 'blur(1px)', opacity: 0.2 + 0.45 * r(6)}} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />

      {/* cabeçalho */}
      <div style={{position: 'absolute', left: 30, top: 22, display: 'flex', gap: 16, alignItems: 'center'}}>
        <div style={{padding: '4px 22px', borderRadius: 12, background: ia.cor, border: '4px solid #fff', boxShadow: '4px 5px 0 #000a', fontFamily: FONT.display, fontWeight: 900, fontSize: 32, color: '#fff', transform: 'rotate(-2deg)'}}>{ia.nome}</div>
        <div style={{fontFamily: LETRA, fontWeight: 700, fontSize: 62, color: '#f4e7b8', textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000', transform: 'rotate(1deg)'}}>Dia {dia.dia}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: LETRA, fontWeight: 700, fontSize: 34, color: '#f4e7b8', background: '#1a1814cc', padding: '4px 18px 4px 12px', borderRadius: 40, border: '3px solid #f4e7b855'}}>
          <Img src={staticFile(DIR + 'itens/sopa.svg')} style={{height: 40}} />{est.itens.sopa ?? 0}
          <Img src={staticFile(DIR + 'itens/agua.svg')} style={{height: 40, marginLeft: 10}} />{est.itens.agua ?? 0}
        </div>
      </div>
      {ausentes.length > 0 && (
        <div style={{position: 'absolute', left: 30, bottom: 26, display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 860, fontFamily: LETRA, fontWeight: 700, fontSize: 26, color: tinta}}>
          {ausentes.map((p, i) => (
            <div key={p.id} style={{background: '#e7d6a4', padding: '4px 16px', borderRadius: '6px 14px 8px 12px', border: '3px solid #3b2b18', boxShadow: '3px 4px 0 #0008', transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`}}>
              {NOMES[p.id]}: {!p.vivo && !p.perdido ? 'morreu' : p.perdido ? 'ficou na casa' : p.fora ? 'em expedição' : 'sumiu'}
            </div>
          ))}
        </div>
      )}

      {/* pensamento da IA (nuvem) */}
      {pensar && s > ABRE + 0.8 && s < comeco + 3 && (() => {
        const o = interpolate(s, [ABRE + 0.8, ABRE + 1.2, comeco + 2.5, comeco + 3], [0, 1, 1, 0], cl);
        return (
          <div style={{position: 'absolute', left: 40, bottom: ausentes.length ? 96 : 50, width: 820, opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
            <div style={{padding: '14px 26px', borderRadius: 40, background: '#fffdf4', border: `5px solid ${ia.cor}`, boxShadow: '5px 6px 0 #000a', fontFamily: LETRA, fontWeight: 400, fontSize: 28, lineHeight: 1.25, color: '#222', maxHeight: 190, overflow: 'hidden'}}>{pensar}</div>
            <div style={{position: 'absolute', left: 70, bottom: -26, width: 26, height: 26, borderRadius: '50%', background: '#fffdf4', border: `4px solid ${ia.cor}`}} />
            <div style={{position: 'absolute', left: 50, bottom: -48, width: 14, height: 14, borderRadius: '50%', background: '#fffdf4', border: `3px solid ${ia.cor}`}} />
          </div>
        );
      })()}

      {/* o diário: um caderno de verdade */}
      <div style={{position: 'absolute', left: 905, top: 36, width: 990, height: 1008, transform: `translateX(${(1 - k) * 1150}px) rotate(${(1 - k) * 4 + 0.35}deg)`, transformOrigin: '50% 100%', fontFamily: LETRA, color: tinta}}>
        {/* pilha de folhas e a folha enrolada em cima */}
        <div style={{position: 'absolute', inset: 0, transform: 'translate(-16px, 10px)', background: '#cdb67e', borderRadius: '10px 20px 12px 22px', border: '3px solid #3b2b18'}} />
        <div style={{position: 'absolute', inset: 0, transform: 'translate(-8px, 5px)', background: '#dcc891', borderRadius: '10px 20px 12px 22px', border: '3px solid #3b2b18'}} />
        <div style={{position: 'absolute', left: 6, right: 24, top: -30, height: 62, borderRadius: '60% 60% 0 0 / 100% 100% 0 0', background: 'linear-gradient(#b99c60, #e3cf9c 55%, #d3bb84)', border: '3px solid #3b2b18', borderBottom: 'none'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '8px 18px 10px 20px', border: '4px solid #3b2b18', background: `${PAPEL}, radial-gradient(ellipse at 50% 40%, #f3e3b4, #e8d29b 75%, #d7bd82)`, boxShadow: '0 20px 40px #000a, inset 0 0 70px #b58f4a88, inset 18px 0 30px #9a7a3a55'}} />
        <div style={{position: 'absolute', inset: 0, padding: '46px 62px 30px 70px', display: 'flex', flexDirection: 'column', opacity: interpolate(k, [0.3, 0.7], [0, 1], cl)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div style={{fontSize: 62, fontWeight: 700, lineHeight: 1}}>Dia {dia.dia}</div>
            <svg width={80} height={30} viewBox="0 0 80 30"><path d="M4,18 C24,8 44,24 72,12 M58,3 L74,12 L60,24" fill="none" stroke={tinta} strokeWidth={4} strokeLinecap="round" /></svg>
          </div>
          <svg width="100%" height={14} viewBox="0 0 860 14" preserveAspectRatio="none"><path d="M0,8 C120,2 220,13 340,7 S600,3 860,8" fill="none" stroke={tinta} strokeWidth={3.5} strokeLinecap="round" opacity={0.75} /></svg>
          <div style={{flex: 1, minHeight: 0, overflow: 'hidden', paddingTop: 10}}>
            {ev && !ev.automatico && (
              <div>
                <div style={{fontSize: F * 1.02, fontWeight: 700, lineHeight: 1.22}}>{ev.texto}</div>
                {ev.escolhas.map((o) => {
                  const marcada = s >= tEscolha && o.id === ev.escolhida;
                  const e = marcada ? spring({frame: frame - tEscolha * FPS, fps: FPS}) : 0;
                  return (
                    <div key={o.id} style={{position: 'relative', marginTop: 8, padding: '2px 14px 2px 46px', fontSize: F * 0.96, fontWeight: marcada ? 700 : 400, lineHeight: 1.2, opacity: s >= tEscolha && !marcada ? 0.42 : 1}}>
                      <span style={{position: 'absolute', left: 6, top: 3, width: F * 0.8, height: F * 0.8, border: `3.5px solid ${tinta}`, borderRadius: 6, transform: 'rotate(-3deg)'}} />
                      {marcada && <span style={{position: 'absolute', left: 8, top: -F * 0.28, fontSize: F * 1.4, color: ia.cor, fontWeight: 700, transform: `scale(${e})`}}>✔</span>}
                      <span style={{background: marcada ? `linear-gradient(transparent 62%, ${ia.cor}66 62%)` : undefined}}>{o.texto}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {ev && ev.automatico && s >= ABRE + 0.4 && <div style={{fontSize: F * 1.02, fontWeight: 700, lineHeight: 1.22}}>{ev.texto}</div>}
            {dia.resposta?.diario && s >= comeco - 0.6 && (
              <div style={{marginTop: 12, fontSize: F * 0.98, fontWeight: 700, color: ia.cor, lineHeight: 1.22, opacity: interpolate(s, [comeco - 0.6, comeco - 0.1], [0, 1], cl)}}>“{dia.resposta.diario}”</div>
            )}
            {visiveis.map((l, i) => {
              const p = interpolate(s, [comeco + i * LINHA, comeco + i * LINHA + 0.7], [0, 100], cl);
              return <div key={i} style={{marginTop: 7, fontSize: F * 0.92, lineHeight: 1.2, clipPath: `inset(-4px ${(100 - p).toFixed(1)}% -4px 0)`}}>• {l}</div>;
            })}
          </div>
          <div style={{borderTop: `3px dashed ${tinta}55`, paddingTop: 8, marginTop: 6}}>
            <div style={{fontSize: 26, fontWeight: 700}}>Sobrou…</div>
            <div style={{display: 'flex', gap: 26, alignItems: 'flex-end', height: 74}}>
              <div style={{display: 'flex', alignItems: 'flex-end'}}>{icones('sopa', est.itens.sopa ?? 0, 64)}</div>
              <div style={{display: 'flex', alignItems: 'flex-end'}}>{icones('agua', est.itens.agua ?? 0, 70)}</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
