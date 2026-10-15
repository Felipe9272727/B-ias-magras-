// Composição de teste do Among Us 3: um trecho da partida seguindo um jogador.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {staticFile} from 'remotion';
import {Jogo} from './Jogo';
import {CenaMorte, Chamado, Ejecao2, Fim2, Revela, Shhh, Votacao} from './Telas';
import type {Partida2} from './sim';

export type PropsTeste = {p: Partida2 | null; de: number; foco: string; partida: number};
export const calcTeste: CalculateMetadataFunction<PropsTeste> = async ({props}) => {
  const p = (await (await fetch(staticFile(`amongus3/partida${props.partida}.json`))).json()) as Partida2;
  return {props: {...props, p}};
};
export const AU3Teste: React.FC<PropsTeste> = ({p, de, foco}) => (p ? <Jogo p={p} de={de} foco={foco} papeis chat /> : null);

// teste das telas (Telas.tsx): tela = shhh | revela | chamado | votacao | ejecao | fim
export type PropsTela = {p: Partida2 | null; partida: number; tela: string; foco?: string; idx?: number; fase?: 'discussao' | 'votacao' | 'resultado'; falas?: number; votos?: number};
export const calcTela: CalculateMetadataFunction<PropsTela> = async ({props}) => {
  const p = (await (await fetch(staticFile(`amongus3/partida${props.partida}.json`))).json()) as Partida2;
  return {props: {...props, p}};
};
export const AU3Tela: React.FC<PropsTela> = ({p, tela, foco = 'Vermelho', idx = 0, fase = 'discussao', falas = 5, votos = 1}) => {
  if (!p) return null;
  if (tela === 'shhh') return <Shhh />;
  if (tela === 'morte') return <CenaMorte assassino={foco} vitima="Branco" />;
  if (tela === 'revela') return <Revela p={p} foco={foco} />;
  if (tela === 'chamado') return <Chamado p={p} idx={idx} />;
  if (tela === 'votacao') return <Votacao p={p} idx={idx} fase={fase} falas={falas} votos={votos} />;
  if (tela === 'ejecao') return <Ejecao2 p={p} idx={idx} />;
  return <Fim2 p={p} foco={foco} />;
};
