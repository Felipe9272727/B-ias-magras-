import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, staticFile} from 'remotion';
import type {Partida} from './dados';
import {Replay} from './Replay';
import {Ejecao, RevelaPapel, Reuniao} from './Reuniao';

export type PreviewProps = {arquivo: string; cena: 'replay' | 'reuniao' | 'votos' | 'ejecao' | 'papel'; partida?: Partida | null; de?: number; ate?: number; indice?: number; cor?: string; pensamentos?: string[]};

export const calcPreview: CalculateMetadataFunction<PreviewProps> = async ({props}) => {
  const partida = (await (await fetch(staticFile(`amongus/${props.arquivo}`))).json()) as Partida;
  return {props: {...props, partida}};
};

// Composição só para conferir cada tela com stills.
export const AmongUsPreview: React.FC<PreviewProps> = ({cena, partida, de = 0, ate = 5, indice = 0, cor = 'Vermelho', pensamentos = []}) => {
  if (!partida) return <AbsoluteFill style={{background: '#000'}} />;
  if (cena === 'replay') return <Replay p={partida} deTique={de} ateTique={ate} pensamentos={pensamentos} />;
  if (cena === 'reuniao') return <Reuniao p={partida} indice={indice} falaDe={de} falaAte={ate} framesPorFala={20} pensamentoDe={cor} />;
  if (cena === 'votos') return <Reuniao p={partida} indice={indice} votos mostrarPapeis />;
  if (cena === 'ejecao') return <Ejecao p={partida} indice={indice} />;
  return <RevelaPapel p={partida} cor={cor} />;
};
