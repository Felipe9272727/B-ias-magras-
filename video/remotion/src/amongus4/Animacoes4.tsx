// Vitrine das animações do AU4 (para conferir antes do episódio): trechos de jogo em volta de cada tipo de evento.
// partida1 = partida 1 de verdade; teste/fogo e teste/canibal = partidas simuladas (--mock) em que o Piromante incendeia
// e o Canibal come, que ainda não aconteceram nas partidas valendo.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {Jogo, type Skins} from '../amongus3/Jogo';
import {simular, type Partida2} from '../amongus3/sim';
import {quadroDoEvento} from '../amongus3/tempo';
import {FONT} from '../theme';

type Trecho = {arq: string; evento: Record<string, unknown>; foco: string; antes: number; s: number; titulo: string};
export const TRECHOS_ANIM: Trecho[] = [
  {arq: 'partida1', evento: {tipo: 'morte', vitima: 'Roxo'}, foco: 'Roxo', antes: 2.5, s: 6, titulo: 'GLUTÃO: a bocarra'},
  {arq: 'partida1', evento: {tipo: 'bomba', portador: 'Rosa'}, foco: 'Rosa', antes: 3, s: 6.5, titulo: 'BOMBA'},
  {arq: 'partida1', evento: {tipo: 'xerife', alvo: 'Lima'}, foco: 'Preto', antes: 2.5, s: 5, titulo: 'TIRO DO XERIFE'},
  {arq: 'partida1', evento: {tipo: 'morte', vitima: 'Coral'}, foco: 'Coral', antes: 2.5, s: 5, titulo: 'FACADA'},
  {arq: 'partida1', evento: {tipo: 'duto', cor: 'Vermelho', tique: 13}, foco: 'Vermelho', antes: 2, s: 4.5, titulo: 'DUTO'},
  {arq: 'teste/fogo', evento: {tipo: 'gasolina', vitima: 'Vermelho'}, foco: 'Ciano', antes: 2, s: 4, titulo: 'PIROMANTE: gasolina'},
  {arq: 'teste/fogo', evento: {tipo: 'incendio'}, foco: 'Vermelho', antes: 2, s: 6, titulo: 'PIROMANTE: incêndio'},
  {arq: 'teste/canibal', evento: {tipo: 'casal_morre', vitima: 'Laranja'}, foco: 'Laranja', antes: 2.5, s: 5, titulo: 'CASAL: morreu junto'},
  {arq: 'teste/canibal', evento: {tipo: 'canibal_come'}, foco: 'Vermelho', antes: 3, s: 6, titulo: 'CANIBAL'},
];

type Props = {ps: Record<string, Partida2> | null; skins: Skins | null};
export const calcAnimacoes4: CalculateMetadataFunction<Props> = async () => {
  const ps: Record<string, Partida2> = {};
  for (const a of new Set(TRECHOS_ANIM.map((t) => t.arq))) ps[a] = await (await fetch(staticFile(`amongus4/${a}.json`))).json();
  const skins = (await (await fetch(staticFile('amongus4/skins.json'))).json()).skins as Skins;
  return {props: {ps, skins}, durationInFrames: Math.round(TRECHOS_ANIM.reduce((a, t) => a + t.s * 30, 0))};
};

export const AU4Animacoes: React.FC<Props> = ({ps, skins}) => {
  if (!ps || !skins) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TRECHOS_ANIM.map((x, i) => {
        const p = ps[x.arq];
        const s = simular(p);
        const q = quadroDoEvento(s, x.evento);
        const de = Math.max(0, q - Math.round(x.antes * 30));
        const dur = Math.round(x.s * 30);
        const ini = t;
        t += dur;
        return (
          <Sequence key={i} from={ini} durationInFrames={dur}>
            <Jogo p={p} de={de} foco={x.foco} papeis chat={false} skins={skins} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center'}}>
              <span style={{padding: '8px 22px', borderRadius: 12, background: '#000c', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>{x.titulo}{q < 0 ? ' (evento não achado)' : ''}</span>
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
