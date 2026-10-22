// Short do Interrogatório das IAs (1080×1920): o Qwen, acusado de sumir com o peixe, confessa... uma coreografia de K-pop.
// Molde dos Shorts que deram certo (ShortPalhaco / ShortPossuidor): a cena em tela cheia na vertical (a sala, com a
// câmera em quem fala), selos no ritmo da fala, o estresse em cima e a fala da IA em cartão grande.
// Narração em scripts/short_int.py (falas do log interrogatorio/logs/peixe.json, vozes do vídeo longo).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import {ASSENTO, SalaInterrogatorio} from './Sala';
import {IAS, Personagem, type Expressao, type IA} from './Personagens';
import {Carimbo, MonitorEstresse} from './Hud';

type Palavra = {w: string; s: number; e: number; chef?: string};
type Aud = {src: string; at: number; de: number; ate?: number; chef?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortInterrogatorio: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_int/short_int.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const DET: IA = 'deepseek';
const SUS: IA = 'qwen';
const nb = (b: Bloco, w: string, n = 1) => naPalavra(b as never, w, n);
const fala = (b: Bloco, n = 1) => b.audios.filter((a) => a.chef)[n - 1];
const quemFala = (b: Bloco, f: number) => b.audios.find((a) => a.chef && f >= a.at && f <= a.at + (a.ate ?? 0))?.chef as IA | undefined;
const textoDe = (b: Bloco, a: Aud) => b.palavras.filter((p) => p.chef === a.chef && p.s >= a.at - 2 && p.s <= a.at + (a.ate ?? 0) + 15).map((p) => p.w).join(' ').replace(/Cuên/g, 'Qwen');

// a sala na vertical: o cenário 1920×1080 ampliado até 1920 de altura, com a câmera indo até quem fala
const SalaV: React.FC<{b: Bloco; foco?: IA; estresse: number; exprSus: Expressao; exprDet: Expressao; acaoDet?: 'apontar' | 'bater_mesa' | 'cruzar_bracos' | 'mao_no_queixo' | 'nenhuma'}> = ({b, foco, estresse, exprSus, exprDet, acaoDet = 'nenhuma'}) => {
  const f = useCurrentFrame();
  const E = 1920 / 1080;
  let cx = 0;
  for (let i = 0; i < 12; i++) {
    const q = quemFala(b, f - i) ?? foco ?? SUS;
    cx += q === DET ? ASSENTO.detetive.x : ASSENTO.suspeito.x;
  }
  cx /= 12;
  const fq = quemFala(b, f);
  const boneco = (ia: IA, papel: 'detetive' | 'suspeito') => (
    <div style={{position: 'absolute', left: ASSENTO.altura / 2, top: ASSENTO.altura}}>
      <Personagem ia={ia} expressao={papel === 'suspeito' ? exprSus : exprDet} falando={fq === ia} t={f + (papel === 'suspeito' ? 31 : 0)}
        virado={papel === 'detetive' ? 'direita' : 'esquerda'} altura={ASSENTO.altura} estresse={papel === 'suspeito' ? estresse / 100 : 0.05}
        acao={papel === 'detetive' ? acaoDet : 'nenhuma'} />
    </div>
  );
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - cx * E, top: 0, width: 1920, height: 1080, transform: `scale(${E})`, transformOrigin: '0 0'}}>
        <SalaInterrogatorio camera={{x: 0, zoom: 1}} relogio="18:20" luz={estresse > 90 ? 0.78 + 0.22 * Math.abs(Math.sin(f / 5)) : 1} tremor={estresse > 95 ? 0.15 : 0}
          detetive={boneco(DET, 'detetive')} suspeito={boneco(SUS, 'suspeito')} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 55%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
      <div style={{position: 'absolute', left: 60, top: 1290, transform: 'rotate(-2deg)'}}>
        <MonitorEstresse estresse={estresse} bpm={Math.round(68 + estresse * 0.85)} t={f} largura={420} altura={256} />
      </div>
    </AbsoluteFill>
  );
};

// cartão com a fala da IA (a voz dela está tocando)
const FalaCard: React.FC<{b: Bloco; a?: Aud; top?: number}> = ({b, a, top = 560}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!a || f < a.at || f > a.at + (a.ate ?? 0) + 14) return null;
  const k = spring({frame: f - a.at, fps, config: {damping: 13, stiffness: 220}});
  const sai = interpolate(f, [a.at + (a.ate ?? 0), a.at + (a.ate ?? 0) + 14], [1, 0], cl);
  const ia = a.chef as IA;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, opacity: k * sai, transform: `translateY(${(1 - k) * -60}px)`}}>
      <div style={{background: '#fff', borderRadius: 26, border: '6px solid #000', padding: '18px 26px 22px', boxShadow: '0 14px 0 #0008'}}>
        <span style={{display: 'inline-block', padding: '2px 14px', borderRadius: 10, border: '4px solid #000', background: IAS[ia].cor, color: '#fff', fontFamily: FONT.comic, fontSize: 32, letterSpacing: 2}}>
          {IAS[ia].nome.toUpperCase()} · {ia === DET ? 'DETETIVE' : 'SUSPEITO'}
        </span>
        <div style={{marginTop: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 42, lineHeight: 1.18, color: '#111'}}>“{textoDe(b, a)}”</div>
      </div>
    </div>
  );
};

type PB = {b: Bloco};

const Gancho: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.25, 1.04])})`}}>
        <SalaV b={b} foco={SUS} estresse={100} exprSus="suando" exprDet="bravo" acaoDet="apontar" />
      </AbsoluteFill>
      <Selo txt="🐟 SUMIU O PEIXE" cor="#e67e22" at={nb(b, 'peixe')} y={300} rot={-3} size={70} />
      <Selo txt="E ELE CONFESSOU..." at={nb(b, 'confessou')} y={430} rot={3} size={62} />
      <Selo txt="OUTRA COISA 😳" cor="#6a4cff" at={nb(b, 'outra')} y={545} rot={-2} size={66} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
      <Sfx src="record-scratch" at={nb(b, 'outra')} vol={0.45} />
    </AbsoluteFill>
  );
};

const Pasta: React.FC<PB> = ({b}) => {
  const a = fala(b);
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={DET} estresse={84} exprSus="nervoso" exprDet="desconfiado" acaoDet="mao_no_queixo" />
      <Selo txt="🕵️ DEEPSEEK · DETETIVE" cor={IAS.deepseek.cor} at={6} y={300} rot={-3} size={56} />
      <Selo txt="📝 POST-IT NA CÂMERA" cor="#c9a400" at={a.at + nb(b, 'post') - a.at} y={1120} rot={2} size={54} />
      <Selo txt="🍳 RECEITA DE PEIXE ASSADO" cor="#c0392b" at={nb(b, 'receita')} y={1230} rot={-2} size={50} />
      <FalaCard b={b} a={a} top={420} />
      <Sfx src="pagina" at={6} vol={0.5} />
      <Sfx src="error-beep" at={nb(b, 'receita')} vol={0.35} />
    </AbsoluteFill>
  );
};

const Desculpa: React.FC<PB> = ({b}) => {
  const a1 = fala(b, 1), a2 = fala(b, 2), a3 = fala(b, 3);
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={SUS} estresse={97} exprSus="suando" exprDet="confiante" acaoDet="apontar" />
      <FalaCard b={b} a={a1} top={300} />
      <Selo txt="🙄 TESTAR A CÂMERA" cor="#111" at={nb(b, 'Testar')} y={300} rot={-3} size={64} />
      <FalaCard b={b} a={a2} top={300} />
      <Selo txt="🃏 BLEFE" cor="#c0392b" at={nb(b, 'Blefe')} y={300} rot={3} size={84} />
      <FalaCard b={b} a={a3} top={300} />
      {a3 && <Selo txt="PRIMO DE DIETA? 🤨" cor="#6a4cff" at={a3.at + (a3.ate ?? 0)} y={560} rot={-2} size={62} />}
      <Sfx src="ba-dum-tss" at={nb(b, 'Claro')} vol={0.4} />
      <Sfx src="boing" at={a3 ? a3.at + (a3.ate ?? 0) : 0} vol={0.4} />
    </AbsoluteFill>
  );
};

const Pressao: React.FC<PB> = ({b}) => {
  const a = fala(b);
  const fim = a.at + (a.ate ?? 0);
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={SUS} estresse={100} exprSus="suando" exprDet="bravo" acaoDet="bater_mesa" />
      <Selo txt="❤️ ESTRESSE 100" cor="#e8202a" at={4} y={300} rot={-3} size={72} />
      <FalaCard b={b} a={a} top={430} />
      <Carimbo texto="CULPADO" at={fim - 6} y={700} />
      <Sfx src="heartbeat" at={0} vol={0.5} />
      <Sfx src="boom" at={fim - 6} vol={0.55} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({b}) => {
  const a = fala(b);
  const tIno = nb(b, 'inocente');
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={SUS} estresse={85} exprSus={useCurrentFrame() < tIno ? 'chocado' : 'culpado'} exprDet="chocado" />
      <FalaCard b={b} a={a} top={300} />
      <Selo txt="💃 COREOGRAFIA DE K-POP" cor="#ff3bb0" at={a.at + nb(b, 'K') - a.at} y={760} rot={3} size={56} />
      <Selo txt="✅ ERA INOCENTE" cor="#1f8f3a" at={tIno} y={300} rot={-3} size={70} />
      <Selo txt="🐟 TOMANDO BANHO NA FAXINEIRA" cor="#e67e22" at={nb(b, 'banho')} y={420} rot={2} size={48} />
      <Selo txt="❌ CONDENADO MESMO ASSIM" cor="#111" at={nb(b, 'condenado')} y={540} rot={-2} size={54} />
      <Sfx src="crowd-laugh" at={a.at + (a.ate ?? 0)} vol={0.35} />
      <Sfx src="sad-trombone" at={nb(b, 'condenado')} vol={0.4} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, pasta: Pasta, desculpa: Desculpa, pressao: Pressao, fim: Fim};

export const ShortInterrogatorio: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!blocos) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {blocos.map((b) => {
        const de = t;
        t += b.dur;
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C b={b} />}
            <Legenda palavras={b.palavras.filter((p) => !p.chef)} y={1700} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.08} />
    </AbsoluteFill>
  );
};
