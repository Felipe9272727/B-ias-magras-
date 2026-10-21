// Short do 60 Segundos (1080×1920): "a IA deixou o marido lá fora" — o GPT. Narração em scripts/short_s60.py; as falas
// são as vozes do vídeo longo. Mesmo molde do ShortPao (selos no ritmo da fala, legenda palavra a palavra, o jogo de
// verdade na vertical): a coleta 3D pré-renderizada e o abrigo 2D com o diário.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontsReady} from '../fonts';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import type {Bloco} from '../overcooked/ShortOC';
import {Dia, type DadosDia, type DiaLog} from './Dia';

type Dados = {blocos: Bloco[]; pt: any; abrigo: any};
type PB = {d: Dados; b: Bloco};

export const calcShortS60: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_s60/short_s60.json'))).json();
  const tl = await (await fetch(staticFile('timeline_s60.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, pt: tl.data.partidas.ep5_gpt, abrigo: tl.data.abrigo}}};
};

const VERDE = '#0b7a5f';
const narr = (b: Bloco) => b.palavras.filter((p) => !(p as any).chef);
const daIA = (b: Bloco) => b.palavras.filter((p) => (p as any).chef);

// abrigo 2D na vertical: o quadro 1920×1080 ampliado, com a família no centro, e um fundo borrado dele mesmo
const Abrigo: React.FC<{d: Dados; dia: number; vel?: number; x?: number; z?: number}> = ({d, dia, vel = 1, x = 760, z = 1.45}) => {
  const f = useCurrentFrame();
  const dl: DiaLog = d.pt.dias.find((q: DiaLog) => q.dia === dia && !q.virada) ?? d.pt.dias.find((q: DiaLog) => q.dia === dia);
  const dados: DadosDia = {dia: dl, cena: d.abrigo.cena, itens: d.abrigo.itens ?? {}, figs: d.abrigo.figs, ia: d.pt.iaVisual, diasFadiga: 20};
  const zz = z + 0.08 * (f / 300);
  const quadro = (k: number, extra: React.CSSProperties = {}) => (
    <div style={{position: 'absolute', left: 540 - x * k, top: 960 - 560 * k, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: '0 0', ...extra}}>
      <Dia dados={dados} arquivo="ep5_gpt" dia={dia} vel={vel} />
    </div>
  );
  return (
    <AbsoluteFill style={{background: '#111', overflow: 'hidden'}}>
      {quadro(1.9, {filter: 'blur(26px) brightness(0.5)'})}
      {quadro(zz)}
    </AbsoluteFill>
  );
};

// coleta 3D pré-renderizada, recortada na vertical (o clipe começa 1,5 s antes do segundo 0 do jogo)
const Coleta: React.FC<{de: number; z?: number; congela?: number}> = ({de, z = 1.9, congela}) => {
  const v = <OffthreadVideo src={staticFile('sessenta/coletas/ep5_gpt.mp4')} startFrom={Math.round((de + 1.5) * 30)} muted style={{width: 1920, height: 1080}} />;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - 960 * z, top: 960 - 540 * z, width: 1920, height: 1080, transform: `scale(${z})`, transformOrigin: '0 0'}}>
        {congela !== undefined ? <Freeze frame={congela}>{v}</Freeze> : v}
      </div>
    </AbsoluteFill>
  );
};

const Gancho: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <Abrigo d={d} dia={5} vel={0.6} x={870} z={1.02} />
    <Selo txt="IA DO GPT 🤖" cor={VERDE} at={3} y={300} rot={-3} size={66} />
    <Selo txt="💔 LARGOU O MARIDO" at={naPalavra(b, 'marido')} y={430} rot={3} size={70} />
    <Selo txt="😂 FEZ PIADA" cor="#111" at={naPalavra(b, 'piada')} y={570} rot={-2} size={66} />
    <Sfx src="bass-pulse" at={0} vol={0.7} />
    <Sfx src="record-scratch" at={naPalavra(b, 'piada')} vol={0.4} />
  </AbsoluteFill>
);

const ColetaB: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const a = daIA(b)[0]?.s ?? 0;
  const tNunca = naPalavra(b, 'nunca');
  // até a fala corre do segundo 19 ao 25,7; depois da fala, congela no corredor vazio
  const de = 25.7 - a / 30;
  return (
    <AbsoluteFill>
      <Coleta de={Math.max(0, de)} congela={f > tNunca ? Math.round((25.7 + 1.5 + (tNunca - a) / 30) * 30) - Math.round((Math.max(0, de) + 1.5) * 30) : undefined} />
      <Selo txt="⏱️ 60 SEGUNDOS" cor="#111" at={naPalavra(b, 'Sessenta')} y={300} rot={-3} size={62} />
      <Selo txt="☢️ ANTES DA BOMBA" at={naPalavra(b, 'bomba')} y={420} rot={2} size={62} />
      <Selo txt="🔍 “CADÊ VOCÊ?”" cor={VERDE} at={a} y={560} rot={-2} size={70} />
      <Selo txt="❌ NUNCA MAIS PROCUROU" at={tNunca} y={700} rot={3} size={60} />
      <Sfx src="sirene-ataque" at={0} vol={0.25} />
      <Sfx src="wrong-buzzer" at={tNunca} vol={0.4} />
    </AbsoluteFill>
  );
};

const Carro: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <Abrigo d={d} dia={2} vel={0.8} x={900} />
    <Selo txt="🚗 SAIU DE CARRO" cor={VERDE} at={naPalavra(b, 'carro')} y={300} rot={-3} size={70} />
    <Selo txt="🙃 “CINTO DE SEGURANÇA”" cor="#111" at={naPalavra(b, 'cinto')} y={440} rot={2} size={54} />
    <Sfx src="swoosh-fly" at={naPalavra(b, 'carro')} vol={0.45} />
    <Sfx src="ba-dum-tss" at={naPalavra(b, 'segurança') + 10} vol={0.35} />
  </AbsoluteFill>
);

const Barulho: React.FC<PB> = ({d, b}) => {
  const tCur = naPalavra(b, 'curiosidade');
  return (
    <AbsoluteFill>
      <Abrigo d={d} dia={5} vel={0.9} x={900} />
      <Selo txt="🚪 BARULHOS LÁ FORA" at={naPalavra(b, 'barulhos')} y={300} rot={-3} size={62} />
      <Selo txt="👨 ERA ELE?" cor="#111" at={naPalavra(b, 'atrás')} y={420} rot={2} size={66} />
      <Selo txt="☢️ “CURIOSIDADE RADIOATIVA”" cor={VERDE} at={tCur} y={560} rot={-2} size={50} />
      <Sfx src="batida-porta" at={naPalavra(b, 'barulhos')} vol={0.6} />
      <Sfx src="record-scratch" at={tCur} vol={0.4} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tEra = naPalavra(b, 'Era');
  const tVid = naPalavra(b, 'Vídeo');
  return (
    <AbsoluteFill>
      <Abrigo d={d} dia={6} vel={0.5} x={1150} z={1.9} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [tVid - 6, tVid + 6], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <Selo txt="💀 ERA O MARIDO DELA" at={tEra} y={360} rot={-3} size={70} />
      <Selo txt="▶️ VÍDEO COMPLETO NO CANAL" cor={VERDE} at={tVid} y={900} rot={2} size={56} />
      <Sfx src="sad-trombone" at={tEra + 12} vol={0.35} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, coleta: ColetaB, carro: Carro, barulho: Barulho, fim: Fim};

export const ShortS60: React.FC<{dados: Dados | null}> = ({dados}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {dados.blocos.map((b) => {
        const de = t;
        t += b.dur;
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C d={dados} b={b} />}
            <Legenda palavras={narr(b) as any} y={1560} />
            <Legenda palavras={daIA(b) as any} y={1320} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.07} />
    </AbsoluteFill>
  );
};
