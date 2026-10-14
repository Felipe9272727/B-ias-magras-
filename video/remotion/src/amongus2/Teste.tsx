// Composição de teste do Among Us 2: um trecho da partida seguindo um jogador.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {staticFile} from 'remotion';
import {Jogo} from './Jogo';
import type {Partida2} from './sim';

export type PropsTeste = {p: Partida2 | null; de: number; foco: string; partida: number};
export const calcTeste: CalculateMetadataFunction<PropsTeste> = async ({props}) => {
  const p = (await (await fetch(staticFile(`amongus2/partida${props.partida}.json`))).json()) as Partida2;
  return {props: {...props, p}};
};
export const AU2Teste: React.FC<PropsTeste> = ({p, de, foco}) => (p ? <Jogo p={p} de={de} foco={foco} papeis /> : null);
