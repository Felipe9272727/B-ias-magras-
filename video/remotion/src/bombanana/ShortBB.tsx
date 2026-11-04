// Short do BOMBANANA! (1080x1920): "a IA que mais descreveu uma bomba na história" — o Mistral (Surdo) na fase 9.
// Molde dos Shorts do canal: gancho com superlativo que volta no fim, um personagem só, contador que sobe, selos no ritmo
// da fala, legenda grande palavra por palavra e flash entre os blocos. A imagem é a do vídeo longo (public/bb/longo.mp4),
// numa faixa no meio com zoom de entrada; fundo = o mesmo vídeo desfocado. Nenhum emoji: ícones em SVG.
// Roteiro e áudio: scripts/short_bb.py (short_bb.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {CabecaMacaco} from './CenasBB';
import {COR_PAPEL} from './Episodio3D';

type Palavra = {w: string; s: number; e: number; quem?: string};
type Aud = {src: string; at: number; ate?: number; quem?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]; video: number; selo: string | null; contador: number};

export const calcShortBB: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_bb/short_bb.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const FONTE = "'Poppins', sans-serif";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const contorno = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const QUEM: Record<string, {nome: string; papel: 'Cego' | 'Surdo' | 'Mudo'; emp: string; cor: string}> = {
  mimo: {nome: 'MiMo', papel: 'Cego', emp: 'Xiaomi', cor: '#ff6900'},
  mistral: {nome: 'Mistral', papel: 'Surdo', emp: 'Mistral AI', cor: '#fa520f'},
  glm: {nome: 'GLM', papel: 'Mudo', emp: 'Zhipu', cor: '#3d7bff'},
};
const FAIXA_Y = 600;
const FAIXA_H = 608;

const Titulo: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
  return (
    <div style={{position: 'absolute', top: 150, left: 40, right: 40, textAlign: 'center', transform: `scale(${0.6 + 0.4 * e}) rotate(${-2 * e}deg)`, opacity: e}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 82, lineHeight: 1.05, color: '#fff', ...contorno(14)}}>A IA QUE MAIS</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: '#ffd400', ...contorno(14)}}>DESCREVEU</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 82, lineHeight: 1.05, color: '#fff', ...contorno(14)}}>UMA BOMBA</div>
    </div>
  );
};

const Elenco: React.FC<{f: number; foco?: string}> = ({f, foco}) => {
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26}}>
      {(['mimo', 'mistral', 'glm'] as const).map((k, i) => {
        const q = QUEM[k];
        const e = spring({frame: f - i * 8, fps, config: {damping: 13, stiffness: 170}});
        const ativo = !foco || foco === k;
        return (
          <div key={k} style={{width: 300, padding: '18px 0 16px', borderRadius: 28, background: '#fff', border: `7px solid ${ativo ? COR_PAPEL[q.papel] : '#999'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - e) * -200}px) scale(${ativo ? 1.05 : 0.9})`, opacity: e * (ativo ? 1 : 0.55), boxShadow: '0 12px 30px #0009'}}>
            <CabecaMacaco papel={q.papel} size={120} />
            <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 50, color: '#111', marginTop: 4}}>{q.nome}</div>
            <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff', background: COR_PAPEL[q.papel], borderRadius: 10, padding: '2px 18px', marginTop: 6, letterSpacing: 2}}>{q.papel.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
};

const Falante: React.FC<{quem: string; f: number}> = ({quem, f}) => {
  const {fps} = useVideoConfig();
  const q = QUEM[quem];
  if (!q) return null;
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  const grita = quem === 'mimo';
  const tremor = grita ? Math.sin(f * 1.9) * 6 : 0;
  return (
    <div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - e) * -700 + tremor}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 34, padding: '16px 34px 16px 20px', border: `8px solid ${COR_PAPEL[q.papel]}`, boxShadow: '0 14px 30px #000a'}}>
        <CabecaMacaco papel={q.papel} size={150} />
        <div>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 70, color: '#111', lineHeight: 1}}>{q.nome}</div>
          <div style={{display: 'flex', gap: 12, marginTop: 10}}>
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff', background: q.cor, borderRadius: 10, padding: '2px 14px'}}>{q.emp}</span>
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff', background: COR_PAPEL[q.papel], borderRadius: 10, padding: '2px 14px', letterSpacing: 2}}>{q.papel.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// contador "DESCRIÇÕES DA BOMBA": sobe com um pulo quando o Mistral descreve de novo
const Contador: React.FC<{n: number; f: number; subiu: boolean}> = ({n, f, subiu}) => {
  const {fps} = useVideoConfig();
  const p = subiu ? spring({frame: f, fps, config: {damping: 8, stiffness: 220}}) : 1;
  return (
    <div style={{position: 'absolute', top: FAIXA_Y + FAIXA_H + 40, right: 46, display: 'flex', alignItems: 'center', gap: 16, background: '#111', border: '6px solid #ffd400', borderRadius: 24, padding: '10px 26px', transform: `rotate(3deg) scale(${subiu ? 0.7 + 0.3 * p + (1 - p) * 0.5 : 1})`, boxShadow: '0 10px 24px #000a'}}>
      <svg width={64} height={64} viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="#ffd400" /><path d="M8 9h8M8 12h5" stroke="#111" strokeWidth={2} strokeLinecap="round" /></svg>
      <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1.05}}>DESCRIÇÕES<br />DA BOMBA</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 96, color: '#ffd400', lineHeight: 1}}>{n}</div>
    </div>
  );
};

const Selo: React.FC<{texto: string; f: number; vermelho: boolean}> = ({texto, f, vermelho}) => {
  const e = interpolate(f, [0, 6], [2.2, 1], cl);
  const o = interpolate(f, [0, 3], [0, 1], cl);
  return (
    <div style={{position: 'absolute', top: FAIXA_Y + FAIXA_H - 120, left: 40, transform: `rotate(-9deg) scale(${e})`, opacity: o}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: texto.length > 12 ? 62 : 84, color: '#fff', background: vermelho ? '#e01010' : '#2f7de8', border: '8px solid #fff', borderRadius: 18, padding: '4px 30px', boxShadow: '0 10px 0 #000a', ...contorno(4)}}>{texto}</div>
    </div>
  );
};

// legenda grande: janela de até 3 palavras, a falada em amarelo; as do MiMo (gritando) em vermelho
const Legenda: React.FC<{palavras: Palavra[]; f: number}> = ({palavras, f}) => {
  const i = palavras.findIndex((p) => f >= p.s && f < Math.max(p.e, p.s + 6));
  const j = i >= 0 ? i : palavras.findIndex((p) => p.s > f) - 1;
  if (j < 0 || f > (palavras[palavras.length - 1]?.e ?? 0) + 10) return null;
  const ini = Math.floor(j / 3) * 3;
  const grupo = palavras.slice(ini, ini + 3);
  const grita = grupo.some((p) => p.quem === 'mimo');
  return (
    <div style={{position: 'absolute', top: 1450, left: 40, right: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px'}}>
      {grupo.map((p, k) => {
        const atual = ini + k === j;
        return (
          <span key={k} style={{fontFamily: FONTE, fontWeight: 900, fontSize: grita ? 92 : 84, lineHeight: 1.15, color: atual ? (grita ? '#ff3b30' : '#ffd400') : '#fff', textTransform: 'uppercase', transform: `scale(${atual ? 1.08 : 1})`, ...contorno(12)}}>{p.w}</span>
        );
      })}
    </div>
  );
};

const BlocoView: React.FC<{b: Bloco; n0: number}> = ({b, n0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = 1.18 - 0.18 * spring({frame: f, fps, config: {damping: 20, stiffness: 90}});
  const grito = b.id.startsWith('grito');
  const tremor = grito ? Math.sin(f * 2.3) * 9 : 0;
  const boom = b.id === 'fim';
  const flash = interpolate(f, [0, 5], [0.85, 0], cl);
  const falaAtual = b.audios.find((a) => a.quem && f >= a.at && f < a.at + (a.ate ?? 9999));
  const seloAt = Math.round(b.dur * 0.35);
  const src = staticFile(`short_bb/v_${b.id}.mp4`);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(38px) brightness(0.45) saturate(1.4)', transform: 'scale(1.3)'}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: FAIXA_Y, left: 0, width: 1080, height: FAIXA_H, overflow: 'hidden', borderTop: '8px solid #ffd400', borderBottom: '8px solid #ffd400', transform: `translateX(${tremor}px)`}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
        {boom ? <AbsoluteFill style={{background: '#ff7a00', mixBlendMode: 'screen', opacity: interpolate(f, [0, 25], [0.8, 0], cl)}} /> : null}
      </div>
      {b.id === 'gancho' || boom ? <Titulo f={boom ? f - Math.round(b.dur * 0.45) : f} /> : null}
      {b.id === 'quem' ? <Elenco f={f} /> : null}
      {falaAtual?.quem ? <Falante quem={falaAtual.quem} f={f - falaAtual.at} /> : b.id.startsWith('d') ? <Elenco f={30} foco="mistral" /> : null}
      {b.contador > 0 ? <Contador n={b.contador} f={f} subiu={b.contador > n0} /> : null}
      {b.selo && f >= seloAt ? <Selo texto={b.selo} f={f - seloAt} vermelho={grito || boom} /> : null}
      <Legenda palavras={b.palavras} f={f} />
      {b.audios.map((a, i) => (
        <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
          <Audio src={staticFile(a.src)} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile(boom ? 'sfx/explosion.mp3' : 'sfx/whoosh.mp3')} volume={boom ? 0.8 : 0.35} /></Sequence>
      {b.selo ? <Sequence from={seloAt} durationInFrames={20}><Audio src={staticFile(grito ? 'sfx/record-scratch.mp3' : 'sfx/pop.mp3')} volume={0.5} /></Sequence> : null}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const ShortBB: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  if (!blocos) return null;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#0b0d12'}}>
      {blocos.map((b, i) => {
        const de = t;
        t += b.dur;
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur}>
            <BlocoView b={b} n0={i > 0 ? blocos[i - 1].contador : 0} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
