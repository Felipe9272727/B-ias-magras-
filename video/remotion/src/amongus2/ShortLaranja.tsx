// Shorts do primeiro vídeo de Among Us (8 IAs): "a IA acusada em todas as reuniões" (o Laranja, DeepSeek, na partida 2).
// Mesmo molde do ShortFrio: narração própria (scripts/short_laranja.py), selos no ritmo da fala, falas em balão,
// pensamento secreto e gameplay vertical (Vista do motor do vídeo 1, timeline2.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Crewmate} from '../amongus/Crewmate';
import {Vista} from '../amongus/GameplayNova';
import type {Partida} from '../amongus/dados';
import {Estrelas} from './Telas';
import {type Bloco, Fala, Legenda, naPalavra, Pensamento, Selo, Sfx} from './ShortFrio';

export type DadosLaranja = {blocos: Bloco[]; p: Partida};

export const calcShortLaranja: CalculateMetadataFunction<{dados: DadosLaranja | null}> = async () => {
  const sl = await (await fetch(staticFile('short_laranja/short_laranja.json'))).json();
  const tl = await (await fetch(staticFile('timeline2.json'))).json();
  const total = sl.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: sl.blocos, p: tl.data.partidas['2']}}};
};

const W = 1080;
const H = 1920;
const FPT = 75;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const linha = (pts: [number, number][]) => (f: number) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (f <= pts[i][0]) {
      const [a0, t0] = pts[i - 1];
      const [a1, t1] = pts[i];
      return t0 + ((t1 - t0) * (f - a0)) / Math.max(1, a1 - a0);
    }
  }
  return pts[pts.length - 1][1];
};

type PB = {d: DadosLaranja; b: Bloco};

const Reuniao: React.FC<{titulo: string; children: React.ReactNode}> = ({titulo, children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1c2a44, #070b14 80%)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: '#8fd3ff'}}>{titulo}</div>
    {children}
  </AbsoluteFill>
);

const Ejecao: React.FC<{cor: string; de: number; txt: string}> = ({cor, de, txt}) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [de + 6, de + 6 + txt.length * 1.2], [0, txt.length], cl));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Estrelas vel={3} />
      <div style={{position: 'absolute', left: interpolate(f, [de, de + 90], [-200, 900], cl), top: 760, transform: `rotate(${f * 6}deg)`}}><Crewmate cor={cor} size={240} /></div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1080, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: '#fff'}}>{txt.slice(0, n)}</div>
    </AbsoluteFill>
  );
};

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.3, 1.08])})`}}>
        <Vista p={d.p} tfDe={linha([[0, 17.1], [b.dur, 17.6]])} w={W} h={H} foco="Laranja" mostrarPapeis deTique={17} hud={false} fptFixo={FPT} escalaFixa={1.5} />
      </AbsoluteFill>
      <Selo txt="ACUSADO 🫵" at={6} y={330} />
      <Selo txt="🔎 PEGOU OS 2 IMPOSTORES" cor="#1f8f3a" at={naPalavra(b, 'pegou')} y={460} rot={3} size={58} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<PB> = ({d, b}) => {
  const tLuz = naPalavra(b, 'apagam');
  return (
    <AbsoluteFill>
      <Vista p={d.p} tfDe={linha([[0, 6.6], [tLuz, 7.3], [b.dur, 9.95]])} w={W} h={H} foco="Amarelo" mostrarPapeis deTique={6} hud={false} fptFixo={FPT} escalaFixa={1.2} />
      <Selo txt="DEEPSEEK" cor="#4d6bfe" at={naPalavra(b, 'DeepSeek')} y={300} rot={3} size={64} />
      <Selo txt="💡 LUZES APAGADAS" cor="#111" at={tLuz} y={420} rot={-3} size={58} />
      <Selo txt="💀 2 CORPOS" at={naPalavra(b, 'dois')} y={540} rot={2} size={64} />
      <Sfx src="pop" at={naPalavra(b, 'DeepSeek')} />
      <Sfx src="gasp" at={naPalavra(b, 'dois')} vol={0.5} />
    </AbsoluteFill>
  );
};

const Acusa1: React.FC<PB> = ({b}) => {
  const tEle = naPalavra(b, 'ele');
  return (
    <Reuniao titulo="PARTIDA 2 · REUNIÃO 1">
      <Fala cor="Amarelo" txt="Quem estava com ela antes foi o Laranja." at={8} lado="esq" y={380} tag="IMPOSTOR 🔪" />
      <Fala cor="Verde" txt="Laranja, pra mim é o mais óbvio." at={naPalavra(b, 'combinar')} lado="dir" y={700} tag="IMPOSTOR 🔪" />
      <Selo txt="ACUSADO ×1" at={tEle} y={1020} rot={-3} size={80} />
      <Sfx src="error-beep" at={tEle} vol={0.5} />
    </Reuniao>
  );
};

const Tarefa: React.FC<PB> = ({b}) => {
  const tResp = naPalavra(b, 'responde');
  const tCom = naPalavra(b, 'Comunicações');
  return (
    <Reuniao titulo="PARTIDA 2 · REUNIÃO 1">
      <Fala cor="Verde" txt="Eu tava baixando dados no Refeitório." at={naPalavra(b, 'Verde')} lado="esq" y={380} tag="IMPOSTOR 🔪" />
      <Fala cor="Laranja" txt="Baixar dados é tarefa de Comunicações. Você mentiu de sala." at={tResp} lado="dir" y={700} />
      <Pensamento cor="Verde" texto="O Laranja me pegou no detalhe da tarefa." at={tCom + 12} destaque="me pegou" top={1020} />
      <Sfx src="notification-pop" at={tResp} />
      <Sfx src="record-scratch" at={tCom + 12} vol={0.5} />
    </Reuniao>
  );
};

const Empate: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t3 = naPalavra(b, 'três');
  const k = spring({frame: f - t3, fps, config: {damping: 8, stiffness: 220}});
  return (
    <Reuniao titulo="PARTIDA 2 · VOTAÇÃO">
      <Selo txt="🔎 PEGO PELA TAREFA" cor="#1f8f3a" at={0} y={380} rot={-2} size={60} />
      {f >= t3 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, transform: `scale(${0.5 + 0.5 * k})`}}>
          <div style={{textAlign: 'center'}}><Crewmate cor="Laranja" size={200} t={f} /><div style={{fontFamily: FONT.comic, fontSize: 110, color: '#fff'}}>3</div></div>
          <div style={{fontFamily: FONT.comic, fontSize: 110, color: '#ffd84d'}}>×</div>
          <div style={{textAlign: 'center'}}><Crewmate cor="Verde" size={200} t={f + 7} /><div style={{fontFamily: FONT.comic, fontSize: 110, color: '#fff'}}>3</div></div>
        </div>
      )}
      <Selo txt="EMPATE 😬" at={naPalavra(b, 'Empate')} y={1000} rot={3} size={84} />
      <Sfx src="drumroll" at={t3 - 20} vol={0.4} />
      <Sfx src="wrong-buzzer" at={naPalavra(b, 'Empate')} vol={0.45} />
    </Reuniao>
  );
};

const Acusa2: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tProx = naPalavra(b, 'novo');
  const tViu = naPalavra(b, 'viu');
  if (f < tProx + 8)
    return (
      <AbsoluteFill>
        <Vista p={d.p} tfDe={linha([[0, 15.7], [tProx + 8, 16.3]])} w={W} h={H} zoom="Refeitorio" mostrarPapeis deTique={15} hud={false} fptFixo={FPT} escalaFixa={0.85} />
        <Selo txt="💀 VERMELHO" at={4} y={330} rot={-2} size={60} />
      </AbsoluteFill>
    );
  return (
    <Reuniao titulo="PARTIDA 2 · REUNIÃO 2">
      <Selo txt="ACUSADO ×2" at={tProx + 8} y={360} rot={3} size={76} />
      <Fala cor="Amarelo" txt="Eu tava no Armas fazendo tarefa." at={naPalavra(b, 'Armas') - 10} lado="esq" y={520} tag="IMPOSTOR 🔪" />
      <Fala cor="Amarelo" txt="Laranja, eu vi você no Refeitório no tique catorze." at={tViu} lado="esq" y={840} tag="IMPOSTOR 🔪" />
      <Sfx src="error-beep" at={tProx + 8} vol={0.5} />
    </Reuniao>
  );
};

const Tiques: React.FC<PB> = ({b}) => {
  const tConf = naPalavra(b, 'confundi');
  const tComp = naPalavra(b, 'computador');
  return (
    <Reuniao titulo="PARTIDA 2 · REUNIÃO 2">
      <Fala cor="Laranja" txt="Se você tava no Armas, como me viu no Refeitório?" at={0} lado="dir" y={380} />
      <Fala cor="Amarelo" txt="Me confundi nos tiques." at={tConf - 6} lado="esq" y={700} tag="IMPOSTOR 🔪" />
      <Selo txt="É UM COMPUTADOR 🤖" at={tComp} y={1010} rot={-3} size={72} />
      <Sfx src="ba-dum-tss" at={tComp + 14} vol={0.55} />
    </Reuniao>
  );
};

const Duto: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const tSobrou = naPalavra(b, 'sobrou');
  const tSolta = naPalavra(b, 'solta');
  if (f < tSobrou) return <Ejecao cor="Amarelo" de={0} txt="Amarelo era o Impostor." />;
  return (
    <Reuniao titulo="PARTIDA 2 · REUNIÃO 3">
      <Selo txt="🚨 EMERGÊNCIA" cor="#e01b1b" at={naPalavra(b, 'botão')} y={360} rot={-2} size={62} />
      <Fala cor="Verde" txt="Tá, admito: dei uma passada rápida no Refeitório vindo pelo duto do Admin." at={tSolta} lado="esq" y={540} tag="IMPOSTOR 🔪" />
      <Selo txt="CONFESSOU 🤡" at={naPalavra(b, 'duto') + 6} y={960} rot={3} size={84} />
      <Sfx src="record-scratch" at={naPalavra(b, 'duto') + 4} vol={0.55} />
    </Reuniao>
  );
};

const Fim: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const tTrip = naPalavra(b, 'tripulantes');
  const tAcus = naPalavra(b, 'acusado');
  if (f < tTrip) return <Ejecao cor="Verde" de={0} txt="Verde era o Impostor." />;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #13204a, #03050c 75%)', overflow: 'hidden'}}>
      <Estrelas vel={1} n={120} />
      <div style={{position: 'absolute', left: W / 2 - 170, top: 800, transform: `translateY(${Math.sin(f / 9) * 14}px)`}}><Crewmate cor="Laranja" size={340} t={f} /></div>
      <Selo txt="TRIPULANTES VENCEM ✅" cor="#1f8f3a" at={tTrip} y={300} rot={-3} size={60} />
      <Selo txt="ACUSADO EM TODAS 🫵" at={tAcus} y={430} rot={3} size={62} />
      <Selo txt="🔎 2 IMPOSTORES PEGOS" cor="#2e5bff" at={naPalavra(b, 'pegou')} y={560} rot={-2} size={62} />
      <Sfx src="tada" at={tTrip} vol={0.5} />
      <Sfx src="impact-epic" at={naPalavra(b, 'pegou')} vol={0.5} />
    </AbsoluteFill>
  );
};

const VISUAIS: Record<string, React.FC<PB>> = {gancho: Gancho, quem: Quem, acusa1: Acusa1, tarefa: Tarefa, empate: Empate, acusa2: Acusa2, tiques: Tiques, duto: Duto, fim: Fim};
const LEG_Y: Record<string, number> = {tarefa: 1560, acusa1: 1290, acusa2: 1560, tiques: 1290};

export const ShortLaranja: React.FC<{dados: DadosLaranja | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  let ini = 0;
  const seqs = dados.blocos.map((b) => {
    const de = ini;
    ini += b.dur;
    return {b, de};
  });
  const cortes = seqs.slice(1).map((s) => s.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.4, 0], cl)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seqs.map(({b, de}) => {
        const V = VISUAIS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {V ? <V d={dados} b={b} /> : null}
            <Audio src={staticFile(`short_laranja/${b.id}.mp3`)} />
            <Legenda palavras={b.palavras} y={LEG_Y[b.id] ?? 1290} />
          </Sequence>
        );
      })}
      {cortes.map((c, i) => <Sfx key={i} src="whoosh" at={c - 4} vol={0.25} />)}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.09} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: '#fff', background: '#000c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ff3b30'}}>8 IAs JOGANDO AMONG US</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
