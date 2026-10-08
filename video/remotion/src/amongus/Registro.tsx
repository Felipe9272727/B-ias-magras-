import React from 'react';
import type {Scene, Timeline} from '../types';
import type {Partida} from './dados';
import {Gameplay, GameplayDividida} from './Gameplay';
import {Ejecao, RevelaPapel, Reuniao} from './Reuniao';
import {AUComparativo, AUElenco, AUFim, AUFrase, AUPlacar, AUPrompt, AURegras, AUTitulo} from './Cenas';

// Liga os nomes usados em roteiro2.py aos componentes do Among Us.
export const AmongUsVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida>;
  const P = (n?: number) => ps[String(n ?? 2)];
  switch (name) {
    case 'AUTitulo':
      return <AUTitulo kicker={p.kicker} title={p.title} subtitle={p.subtitle} color={p.color} />;
    case 'AUReplay':
    case 'AUSplit': {
      const chaves = scene.events.filter((e: any) => e.type === 'tk').map((e: any) => ({at: e.at, tick: e.tick}));
      const comum = {p: P(p.partida), deTique: p.de, ateTique: p.ate, duracao: scene.duration, chaves, mostrarPapeis: p.papeis ?? true};
      if (name === 'AUSplit') return <GameplayDividida {...comum} esquerda={p.esquerda} direita={p.direita} />;
      return <Gameplay {...comum} pensamentos={p.pensamentos} zoom={p.zoom} />;
    }
    case 'AUReuniao':
      return <Reuniao p={P(p.partida)} indice={p.indice} chat={p.chat} mostrarPapeis={p.papeis} splash={p.splash} />;
    case 'AUVotos':
      return <Reuniao p={P(p.partida)} indice={p.indice} votos mostrarPapeis={false} duracao={scene.duration} />;
    case 'AUEjecao':
      return <Ejecao p={P(p.partida)} indice={p.indice} />;
    case 'AUPapel':
      return <RevelaPapel p={P(p.partida)} cor={p.cor} />;
    case 'AUElenco':
      return <AUElenco p={P(p.partida)} revelar={p.revelar} />;
    case 'AURegras':
      return <AURegras />;
    case 'AUPrompt':
      return <AUPrompt texto={p.texto} resposta={p.resposta} />;
    case 'AUFrase':
      return <AUFrase p={P(p.partida)} cor={p.cor} texto={p.texto} modo={p.modo} />;
    case 'AUPlacar':
      return <AUPlacar ps={ps} />;
    case 'AUComparativo':
      return <AUComparativo stats={(timeline.data as any).stats} stat={p.stat} p={P(2)} />;
    case 'AUFim':
      return <AUFim />;
    default:
      return null;
  }
};
