// Liga os nomes usados em roteiro/roteiro_au5*.py aos componentes do Among Us 5 (Polus). `timeline.data.partidas` são
// os logs de amongus/logs5 e `timeline.data.skins` as roupas que as IAs escolheram no AU4 (as cores novas vêm sem).
import React from 'react';
import type {Scene, Timeline} from '../types';
import {Jogo5, type Skins} from './Jogo5';
import {simular, type Partida2} from './sim5';
import {mapaDaCena} from '../amongus3/tempo';
import {Ejecao2, Votacao} from './Telas5';
import {AU5Comentarios, AU5Polus} from './Abertura5';

export const AU5Visual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida2>;
  const skins = (timeline.data as any).skins as Skins;
  switch (name) {
    case 'AU5Jogo': {
      const pt = ps[String(p.partida ?? 1)];
      const s = simular(pt);
      const {de, mapa} = mapaDaCena(scene, p, s as any);
      return <Jogo5 p={pt} de={de} mapa={mapa} foco={p.foco} papeis={p.papeis ?? true} hud={p.hud ?? true} chat={p.chat ?? true} skins={skins} />;
    }
    case 'AU5Reuniao':
      return <Votacao p={ps[String(p.partida)]} idx={p.indice} fase="discussao" mensagens={p.chat ?? []} timer={p.timer} viva />;
    case 'AU5Resultado':
      return <Votacao p={ps[String(p.partida)]} idx={p.indice} fase="resultado" mensagens={[]} />;
    case 'AU5Ejecao':
      return <Ejecao2 p={ps[String(p.partida)]} idx={p.indice} />;
    case 'AU5Comentarios':
      return <AU5Comentarios comentarios={p.comentarios} />;
    case 'AU5Polus':
      return <AU5Polus etiquetas={p.etiquetas} />;
    default:
      return null;
  }
};
