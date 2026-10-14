// Liga os nomes usados em roteiro_oc.py aos componentes do Overcooked das IAs.
import React from 'react';
import type {Scene, Timeline} from '../types';
import type {LogOC} from './Cozinha';
import {OCElenco, OCFrase, OCJogo, OCNumeros, OCPlacar, OCPrompt, OCReceitas, OCTitulo} from './Cenas';

export const OvercookedVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const logs = ((timeline.data as any)?.logs ?? {}) as Record<string, LogOC>;
  switch (name) {
    case 'OCJogo': {
      const chaves = scene.events.filter((e: any) => e.type === 'tk').map((e: any) => ({at: e.at, tick: e.tick}));
      return <OCJogo {...(p as any)} logs={logs} chaves={chaves} />;
    }
    case 'OCTitulo':
      return <OCTitulo {...(p as any)} />;
    case 'OCElenco':
      return <OCElenco {...p} />;
    case 'OCReceitas':
      return <OCReceitas {...(p as any)} />;
    case 'OCPrompt':
      return <OCPrompt {...(p as any)} />;
    case 'OCFrase':
      return <OCFrase {...(p as any)} />;
    case 'OCPlacar':
      return <OCPlacar {...(p as any)} />;
    case 'OCNumeros':
      return <OCNumeros {...(p as any)} />;
    default:
      return null;
  }
};
