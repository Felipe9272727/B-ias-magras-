// Short 2 do Overcooked (1080×1920): "essa IA entregou um PÃO como prato" — o Claude, o chef mais educado e mais
// parado da cozinha. Narração em scripts/short_oc2.py; as falas são as vozes dos chefs do vídeo longo. Mesmo molde do
// ShortOC (selos no ritmo da fala, pensamento secreto, a partida de verdade na vertical com a câmera no chef).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontsReady} from '../fonts';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import {COR_EMPRESA} from './Cozinha';
import {fala, fimFala, JogoV, narr, PensamentoChef, type Bloco, type Dados} from './ShortOC';

export const calcShortPao: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_oc2/short_oc2.json'))).json();
  const tl = await (await fetch(staticFile('timeline_oc.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, logs: tl.data.logs}}};
};

const CL = 1; // cozinha do Claude
const AZ = COR_EMPRESA.Claude;
type PB = {d: Dados; b: Bloco};

// fundo vermelho rápido no "RECUSADO"
const Flash: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const o = interpolate(f - at, [0, 3, 16], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return o > 0 ? <AbsoluteFill style={{background: '#ff1a1a', opacity: o}} /> : null;
};

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tPao = naPalavra(b, 'pão');
  const tComo = naPalavra(b, 'Como');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.2, 1.05])})`}}>
        <JogoV d={d} log="fase3" cz={CL} de={88.75} chaves={[{at: tPao, tick: 89.3}, {at: tComo, tick: 89.92}]} congela={f > tComo ? 89.92 : undefined} foco={() => 'Claudete'} z={2.3} />
      </AbsoluteFill>
      <Selo txt="CLAUDE 🤖" cor={AZ} at={4} y={300} rot={-3} size={66} />
      <Selo txt="🍞 SÓ UM PÃO" at={tPao} y={430} rot={3} size={80} />
      <Selo txt="❌ COMO PRATO" cor="#111" at={tComo} y={570} rot={-2} size={66} />
      <Flash at={tComo} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
      <Sfx src="wrong-buzzer" at={tComo} vol={0.45} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <JogoV d={d} log="fase1" cz={CL} de={2} vel={0.6} foco={() => ({x: 2.5, y: 1.5})} z={1.7} />
    <Selo txt="IA DO CLAUDE 🤖" cor={AZ} at={naPalavra(b, 'Claude')} y={300} rot={3} size={62} />
    <Selo txt="🍳 OVERCOOKED" cor="#e67e22" at={naPalavra(b, 'Overcooked')} y={420} rot={-3} size={62} />
    <Selo txt="+ OUTRO CLAUDE" cor="#a8552d" at={naPalavra(b, 'outro')} y={540} rot={2} size={62} />
    <Selo txt="😇 O MAIS EDUCADO" cor="#1f8f3a" at={naPalavra(b, 'educado')} y={660} rot={-2} size={62} />
    <Sfx src="pop" at={naPalavra(b, 'Claude')} />
    <Sfx src="pop" at={naPalavra(b, 'Overcooked')} />
    <Sfx src="boing" at={naPalavra(b, 'outro')} vol={0.45} />
    <Sfx src="notification-pop" at={naPalavra(b, 'educado')} vol={0.5} />
  </AbsoluteFill>
);

const Espera: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b).at;
  const fim = fimFala(b);
  const tDez = naPalavra(b, 'Dezoito');
  // até a fala: t18,5→t19; na fala, o t19; depois o relógio dispara até o t37 com ele parado segurando o prato
  const chaves = [{at: a, tick: 19.05}, {at: fim, tick: 19.9}, {at: b.dur - 6, tick: 37.5}];
  const corre = f > fim;
  return (
    <AbsoluteFill>
      <JogoV d={d} log="fase1" cz={CL} de={18.4} chaves={chaves} foco={() => 'Claudinho'} z={2.1} />
      <Selo txt="🍽️ PRATO NA MÃO" cor={AZ} at={naPalavra(b, 'prato')} y={300} rot={-3} size={60} />
      {corre && <Selo txt="⏩ ACELERADO" cor="#111" at={fim} y={420} rot={2} size={50} />}
      <Selo txt="🧍 18 DE 19 PARADO" at={tDez} y={520} rot={-2} size={72} />
      <Selo txt="⏱️ ~40 SEGUNDOS" cor="#a8552d" at={naPalavra(b, 'quarenta')} y={650} rot={3} size={60} />
      <PensamentoChef chef="Claudinho" at={a - 4} top={1290} texto="Vou esperar a panela ficar pronta e servir com ele." destaque="esperar" />
      <Sfx src="record-scratch" at={fim} vol={0.35} />
      <Sfx src="pop" at={tDez} vol={0.5} />
    </AbsoluteFill>
  );
};

const Promessa: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b).at;
  const fim = fimFala(b);
  const tEsp = naPalavra(b, 'esperar');
  const chaves = [{at: a, tick: 78.05}, {at: fim, tick: 78.6}, {at: tEsp, tick: 78.95}];
  return (
    <AbsoluteFill>
      <JogoV d={d} log="fase3" cz={CL} de={77.4} chaves={chaves} congela={f > tEsp ? 78.95 : undefined} foco={() => 'Claudete'} z={2.2} />
      <Selo txt="🏃 “EU CORRO!”" cor={AZ} at={naPalavra(b, 'corro')} y={300} rot={-3} size={66} />
      <Selo txt="AÇÃO: ESPERAR 🧍" at={tEsp} y={430} rot={3} size={72} />
      <Selo txt="110× ESPERANDO" cor="#111" at={naPalavra(b, 'cento')} y={570} rot={-2} size={66} />
      <PensamentoChef chef="Claudete" at={tEsp + 6} top={1290} texto="Melhor segurar e esperar o Claudinho sair do caminho." destaque="esperar" />
      <Sfx src="record-scratch" at={tEsp} vol={0.5} />
      <Sfx src="ba-dum-tss" at={naPalavra(b, 'cento') + 30} vol={0.4} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b).at;
  const fim = fimFala(b);
  const tRec = naPalavra(b, 'Recusado');
  const tComo = naPalavra(b, 'Como');
  const chaves = [{at: a, tick: 89.05}, {at: fim, tick: 89.6}, {at: tRec, tick: 89.92}];
  return (
    <AbsoluteFill>
      <JogoV d={d} log="fase3" cz={CL} de={88.6} chaves={chaves} congela={f > tRec ? 89.92 : undefined} foco={() => 'Claudete'} z={f > tRec ? 2.6 : 2.2} />
      <Selo txt="⏱️ ÚLTIMO SEGUNDO" cor="#111" at={naPalavra(b, 'Último')} y={300} rot={-3} size={60} />
      <Selo txt="🍞 SÓ PÃO" cor="#c98a2b" at={naPalavra(b, 'pão')} y={420} rot={3} size={76} />
      <Selo txt="❌ RECUSADO" at={tRec} y={560} rot={-2} size={88} />
      <Flash at={tRec} />
      <PensamentoChef chef="Claudete" at={naPalavra(b, 'pensamento')} top={1290} texto="Entregar o pão pelo menos libera minhas mãos." destaque="libera minhas mãos" />
      <Selo txt="UM PÃO. COMO PRATO. 🍞" cor={AZ} at={tComo} y={700} rot={2} size={58} />
      <Sfx src="wrong-buzzer" at={tRec} vol={0.5} />
      <Sfx src="sad-trombone" at={tComo + 20} vol={0.35} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, quem: Quem, espera: Espera, promessa: Promessa, fim: Fim};

export const ShortPao: React.FC<{dados: Dados | null}> = ({dados}) => {
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
            <Legenda palavras={narr(b)} y={1560} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/quirky-dog.mp3')} volume={0.08} />
    </AbsoluteFill>
  );
};
