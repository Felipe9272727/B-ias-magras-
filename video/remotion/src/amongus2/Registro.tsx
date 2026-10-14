// Liga os nomes usados em roteiro/roteiro_au2.py aos componentes do Among Us 2.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Scene, Timeline} from '../types';
import {Jogo} from './Jogo';
import {CenaMorte, Chamado, Ejecao2, Fim2, Frase, Revela, Shhh, Som, Votacao} from './Telas';
import {AU2Comentarios} from './Comentarios';
import {COMENTARIOS} from './AberturaPrevia';
import {AU2AntesDepois} from './AntesDepois';
import {AU2Papeis} from './Papeis';
import {AU2Sorteio} from './Sorteio';
import {AU2Manual} from './Manual';
import {AU2Placar} from './Placar';
import {simular, type Partida2} from './sim';

const Votos: React.FC<{p: Partida2; idx: number; dur: number}> = ({p, idx, dur}) => {
  const f = useCurrentFrame();
  const n = Object.keys(p.reunioes[idx].votos).length;
  const fr = Math.min(1, f / Math.max(1, dur * 0.8));
  const k = Math.floor(fr * n);
  return (
    <>
      <Votacao p={p} idx={idx} fase="votacao" votos={fr} timer={Math.max(0, Math.ceil(15 * (1 - fr)))} />
      {Array.from({length: n}, (_, i) => <Som key={i} nome="voto" em={Math.round(((i + 1) / n) * dur * 0.8) - 1} vol={0.5} />)}
      <div style={{display: 'none'}}>{k}</div>
    </>
  );
};

export const AU2Visual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida2>;
  const P = (n?: number) => ps[String(n ?? 1)];
  switch (name) {
    case 'AU2Jogo': {
      const pt = P(p.partida);
      const s = simular(pt);
      // começa no início do tique `tique` (+ seg) ou `antes` segundos antes de um evento (ex.: {tipo: 'morte', vitima: 'Amarelo'})
      let de = (s.inicioTique[p.tique ?? 1] ?? 0) + Math.round((p.seg ?? 0) * 30);
      if (p.evento) {
        const e = s.eventos.find((x) => Object.entries(p.evento as Record<string, unknown>).every(([k, v]) => x[k] === v));
        if (e) de = Math.max(0, e.quadro - Math.round((p.antes ?? 3) * 30));
      }
      return <Jogo p={pt} de={de} foco={p.foco} papeis={p.papeis ?? true} hud={p.hud ?? true} />;
    }
    case 'AU2Frase':
      return <Frase p={P(p.partida)} cor={p.cor} texto={p.texto} modo={p.modo} />;
    case 'AU2Shhh':
      return <Shhh />;
    case 'AU2Revela':
      return <Revela p={P(p.partida)} foco={p.foco} />;
    case 'AU2Chamado':
      return <Chamado p={P(p.partida)} idx={p.indice} />;
    case 'AU2Reuniao':
      return <Votacao p={P(p.partida)} idx={p.indice} fase="discussao" mensagens={p.chat ?? []} timer={p.timer} />;
    case 'AU2Votos':
      return <Votos p={P(p.partida)} idx={p.indice} dur={scene.duration} />;
    case 'AU2Resultado':
      return <Votacao p={P(p.partida)} idx={p.indice} fase="resultado" mensagens={[]} />;
    case 'AU2Ejecao':
      return <Ejecao2 p={P(p.partida)} idx={p.indice} />;
    case 'AU2Fim':
      return <Fim2 p={P(p.partida)} foco={p.foco} />;
    case 'AU2Morte':
      return <CenaMorte assassino={p.assassino} vitima={p.vitima} aparente={p.aparente} />;
    case 'AU2Comentarios':
      return <AU2Comentarios comentarios={COMENTARIOS} passo={p.passo ?? 42} />;
    case 'AU2AntesDepois':
      return <AU2AntesDepois antes="amongus2/antes.jpg" depois="amongus2/depois.jpg" dur={scene.duration} />;
    case 'AU2Papeis':
      return <AU2Papeis passo={p.passo} />;
    case 'AU2Sorteio':
      return <AU2Sorteio />;
    case 'AU2Manual':
      return <AU2Manual destaque={p.destaque} passo={p.passo} modelo={p.modelo} />;
    case 'AU2Placar':
      return <AU2Placar ps={ps} ate={p.ate ?? 4} />;
    default:
      return null;
  }
};
