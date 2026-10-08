import React from 'react';
import type {Timeline} from '../types';
import {partidaDe} from './dados';
import {ILClipe} from './Clipe';
import {ILMapa, ItemChat} from './Mapa';
import {ILElenco, ILFicha, ILMorte, ILPlacar, ILRegra, ILTitulo} from './Cenas';
import type {Partida} from './dados';

// Liga os nomes usados no roteiro do vídeo 3 aos componentes da ilha.
export const IlhaVisual: React.FC<{name: string; props: Record<string, any>; timeline: Timeline}> = ({name, props: p, timeline}) => {
  const ps = ((timeline.data as Record<string, unknown>).partidas ?? {}) as Record<string, Partida>;
  switch (name) {
    case 'ILClipe':
      return <ILClipe src={p.src} inicio={p.inicio} />;
    case 'ILTitulo':
      return <ILTitulo kicker={p.kicker} title={p.title} subtitle={p.subtitle} color={p.color} />;
    case 'ILMapa':
      return (
        <ILMapa
          dados={partidaDe(timeline, p.partida)}
          turno={Number(p.turno)}
          foco={p.foco}
          pensamentos={p.pensamentos}
          aviso={p.aviso}
          chat={(p.chat as (ItemChat & {id?: string})[] | undefined)?.map((c) => ({...c, cor: c.cor ?? c.id ?? ''}))}
        />
      );
    case 'ILElenco':
      return <ILElenco destaque={p.destaque} />;
    case 'ILFicha':
      return <ILFicha dados={partidaDe(timeline, p.partida)} id={p.id} texto={p.texto} />;
    case 'ILMorte':
      return <ILMorte dados={partidaDe(timeline, p.partida)} id={p.id} />;
    case 'ILRegra':
      return <ILRegra item={p.item} />;
    case 'ILPlacar':
      return <ILPlacar partidas={ps} />;
    default:
      return null;
  }
};
