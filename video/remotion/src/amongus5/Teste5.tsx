// Teste da gameplay do Polus (AU5): um quadro da partida 1 seguindo um jogador (só para conferir a arte e a simulação).
import React from 'react';
import {staticFile, type CalculateMetadataFunction} from 'remotion';
import {Jogo5, type Skins} from './Jogo5';
import type {Partida2} from './sim5';

type Props = {p: Partida2 | null; skins: Skins | null; foco: string; de: number};
export const calcTeste5: CalculateMetadataFunction<Props> = async ({props}) => {
  const p = (await (await fetch(staticFile('amongus5/partida1.json'))).json()) as Partida2;
  const skins = (await (await fetch(staticFile('amongus5/skins.json'))).json()).skins as Skins;
  return {props: {...props, p, skins}};
};
export const Teste5: React.FC<Props> = ({p, skins, foco, de}) => (p ? <Jogo5 p={p} de={de} foco={foco} papeis chat skins={skins ?? undefined} /> : null);
