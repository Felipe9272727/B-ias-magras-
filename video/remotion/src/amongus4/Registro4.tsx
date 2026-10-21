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
import {AU4Aposta, AU4Ejecao} from './Reuniao4';
import {AU3Papeis} from '../amongus3/Papeis';
import {PAPEIS4} from './Papeis4';
import {AU2Premios, type Premio} from '../amongus2/Premios';

// quadro (na cena) em que o narrador fala cada termo, um depois do outro
const semAcento = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const gatilhos = (scene: Scene, termos: string[]): number[] => {
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  let k = 0;
  return termos.map((t) => {
    const alvo = t.split(' ').map(semAcento);
    for (let i = k; i < ws.length; i++) if (alvo.every((a, j) => semAcento(ws[i + j]?.w ?? '') === a)) { k = i + 1; return ws[i].s }
    return -1;
  });
};

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
    case 'AU4Aposta':
      return <AU4Aposta p={ps[String(p.partida)]} idx={p.indice} skins={skins} k={p.k} />;
    case 'AU4Ejecao':
      return <AU4Ejecao p={ps[String(p.partida)]} idx={p.indice} skins={skins} />;
    case 'AU4Papeis':
      return <AU3Papeis papeis={PAPEIS4} colunas={7} compacto passo={p.passo ?? 4} focos={gatilhos(scene, PAPEIS4.map((r) => r.nome))} />;
    case 'AU4Premios':
      return <AU2Premios premios={p.premios as Premio[]} gatilhos={gatilhos(scene, p.gatilhos ?? [])} />;
    case 'AU4Roupas':
      return <AU4Roupas />;
    default:
      return <AU3Visual name={name.replace(/^AU4/, 'AU3')} props={p} scene={scene} timeline={timeline} />;
  }
};
