// Prévia de 2 minutos do Among Us 4 (sem narração): trechos da partida 1 de verdade com o visual novo (mapa v5 em
// polígono, tripulante novo com a skin escolhida por cada IA, fantasmas), selos explicando cada novidade e um pedaço
// da primeira reunião (com o jogador chantageado calado). Dados: public/amongus4/partida1.json e skins.json.
import React, {useMemo} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Jogo, type Skins} from '../amongus3/Jogo';
import {Ejecao2, Fim2, Votacao} from '../amongus3/Telas';
import {simular, type Partida2} from '../amongus3/sim';
import {FONT} from '../theme';

type Props = {p: Partida2 | null; skins: Skins | null};
export const calcPreviaAU4: CalculateMetadataFunction<Props> = async () => {
  const p = (await (await fetch(staticFile('amongus4/partida1.json'))).json()) as Partida2;
  const skins = (await (await fetch(staticFile('amongus4/skins.json'))).json()).skins as Skins;
  return {props: {p, skins}, durationInFrames: TOTAL};
};

// trechos: tique de início, quem a câmera segue, duração (s) e o selo
const TRECHOS: {tique: number; foco: string; s: number; selo: string; sub: string; cor: string}[] = [
  {tique: 1, foco: 'Lima', s: 11, selo: '🔥 PIROMANTE', sub: 'encharca todo mundo de gasolina... e ninguém percebe', cor: '#ff7a1a'},
  {tique: 6, foco: 'Laranja', s: 12, selo: '🕴️ GANGSTER', sub: 'o Qwen recruta o Azul para o lado dos impostores', cor: '#d93025'},
  {tique: 6, foco: 'Bordo', s: 10, selo: '🍖 GLUTÃO', sub: 'devora a vítima: não sobra nem o corpo', cor: '#8e44ad'},
  {tique: 10, foco: 'Vermelho', s: 13, selo: '💣 BOMBARDEIRO', sub: 'um esbarrão... e 3 tiques depois, BUM', cor: '#d93025'},
  {tique: 12, foco: 'Preto', s: 9, selo: '🔫 XERIFE', sub: 'agora o tiro também mata os neutros', cor: '#1f8f3a'},
];
const TRECHOS2: {tique: number; foco: string; s: number; selo: string; sub: string; cor: string}[] = [
  {tique: 15, foco: 'Rosa', s: 10, selo: '👻 FANTASMAS', sub: 'quem morre continua: atravessa parede e manda recado do além', cor: '#6aa8ff'},
  {tique: 21, foco: 'Cinza', s: 11, selo: '💥 DE NOVO', sub: 'o Bombardeiro ataca outra vez', cor: '#d93025'},
  {tique: 30, foco: 'Bordo', s: 10, selo: '☠️ O FIM', sub: 'a última bomba decide a partida', cor: '#111'},
];
const ABERTURA = 6 * 30;
const REUNIAO = 26 * 30;
const FIM = 7 * 30;
const dur = (l: typeof TRECHOS) => l.reduce((a, t) => a + t.s * 30, 0);
const TOTAL = ABERTURA + dur(TRECHOS) + REUNIAO + dur(TRECHOS2) + FIM;

// selo no alto, no centro (embaixo à esquerda fica o chat dos impostores); `top` muda a altura
const Selo: React.FC<{selo: string; sub: string; cor: string; top?: number}> = ({selo, sub, cor, top = 150}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f - 8, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', transform: `translateY(${(1 - e) * -400}px) rotate(-1.5deg)`}}>
      <div style={{display: 'inline-block', padding: '10px 26px', background: cor, border: '6px solid #fff', borderRadius: 16, fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 0 #000a', boxShadow: '0 10px 0 #000a'}}>{selo}</div>
      <div><div style={{display: 'inline-block', marginTop: 12, padding: '8px 20px', background: '#000c', borderRadius: 12, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: '#fff', maxWidth: 1100}}>{sub}</div></div>
    </div>
  );
};

const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1b2550 0%, #05070f 75%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${e})`, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, color: '#fff'}}>
        <div style={{fontSize: 54, letterSpacing: 8, color: '#8fd3ff'}}>PRÉVIA</div>
        <div style={{fontSize: 150, lineHeight: 1, textShadow: '0 10px 0 #000'}}>AMONG US <span style={{color: '#ff3b3b'}}>4</span></div>
        <div style={{fontSize: 46, marginTop: 18, opacity: interpolate(f, [20, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>15 IAs · funções novas · fantasmas · skins</div>
      </div>
    </AbsoluteFill>
  );
};

const Trechos: React.FC<{p: Partida2; skins: Skins; lista: typeof TRECHOS; ini: number[]}> = ({p, skins, lista, ini}) => {
  let t = 0;
  return (
    <>
      {lista.map((x, i) => {
        const de = t;
        t += x.s * 30;
        return (
          <Sequence key={i} from={de} durationInFrames={x.s * 30}>
            <Jogo p={p} de={ini[x.tique] ?? 0} foco={x.foco} papeis chat skins={skins} />
            <Selo selo={x.selo} sub={x.sub} cor={x.cor} />
          </Sequence>
        );
      })}
    </>
  );
};

// a 1ª reunião: o Amarelo chantageado (🤐), o Bombardeiro jurando que é Engenheiro, o voto e a expulsão
const Reuniao: React.FC<{p: Partida2}> = ({p}) => {
  const r = p.reunioes[0] as any;
  const msgs = r.falas.slice(0, 8).map((m: any, i: number) => ({cor: m.cor, texto: m.texto, at: 20 + i * 52}));
  return (
    <>
      <Sequence durationInFrames={14 * 30}>
        <Votacao p={p} idx={0} fase="discussao" mensagens={msgs} timer={60} />
        <Selo selo="🤐 CHANTAGISTA" sub="o Amarelo foi chantageado: não consegue falar nada" cor="#7c3aed" top={860} />
      </Sequence>
      <Sequence from={14 * 30} durationInFrames={5 * 30}>
        <Votacao p={p} idx={0} fase="resultado" mensagens={[]} />
      </Sequence>
      <Sequence from={19 * 30} durationInFrames={7 * 30}>
        <Ejecao2 p={p} idx={0} />
        <Sequence from={90}>
          <Selo selo="💞 CASAL" sub="o Verde era o par do Marrom... e morreu junto de tristeza" cor="#e8336d" top={760} />
        </Sequence>
      </Sequence>
    </>
  );
};

export const PreviaAU4: React.FC<Props> = ({p, skins}) => {
  const s = useMemo(() => (p ? simular(p) : null), [p]);
  if (!p || !skins || !s) return <AbsoluteFill style={{background: '#000'}} />;
  const ini = s.inicioTique;
  const a = ABERTURA, b = a + dur(TRECHOS), c = b + REUNIAO, d = c + dur(TRECHOS2);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={a}><Abertura /></Sequence>
      <Sequence from={a} durationInFrames={b - a}><Trechos p={p} skins={skins} lista={TRECHOS} ini={ini} /></Sequence>
      <Sequence from={b} durationInFrames={c - b}><Reuniao p={p} /></Sequence>
      <Sequence from={c} durationInFrames={d - c}><Trechos p={p} skins={skins} lista={TRECHOS2} ini={ini} /></Sequence>
      <Sequence from={d} durationInFrames={FIM}><Fim2 p={p} /></Sequence>
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.12} />
    </AbsoluteFill>
  );
};
