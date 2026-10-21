// Liga os nomes usados em roteiro/roteiro_au4*.py aos componentes do Among Us 4. O que não é AU4 cai no AU3
// (reunião, votos, ejeção, fim, ...): o formato da partida é o mesmo. `timeline.data.skins` é logs4/skins.json.
import React from 'react';
import type {Scene, Timeline} from '../types';
import {Jogo, type Skins} from '../amongus3/Jogo';
import {AU3Visual} from '../amongus3/Registro';
import {simular, type Partida2} from '../amongus3/sim';
import {mapaDaCena} from '../amongus3/tempo';
import {AU4Roupas} from '../amongus/AU4Roupas';
import {AU4Comentarios} from './Comentarios4';

export const AU4Visual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida2>;
  const skins = (timeline.data as any).skins as Skins;
  switch (name) {
    case 'AU4Jogo': {
      const pt = ps[String(p.partida ?? 1)];
      const s = simular(pt);
      const {de, mapa} = mapaDaCena(scene, p, s);
      return <Jogo p={pt} de={de} mapa={mapa} foco={p.foco} papeis={p.papeis ?? true} hud={p.hud ?? true} chat={p.chat ?? true} skins={skins} />;
    }
    case 'AU4Comentarios':
      return <AU4Comentarios lista={p.lista} passo={p.passo ?? 40} />;
    case 'AU4Roupas':
      return <AU4Roupas />;
    default:
      return <AU3Visual name={name.replace(/^AU4/, 'AU3')} props={p} scene={scene} timeline={timeline} />;
  }
};
