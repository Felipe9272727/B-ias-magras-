// Liga os nomes usados em roteiro/roteiro_au3.py aos componentes do Among Us 3.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Scene, Timeline} from '../types';
import {Jogo} from './Jogo';
import {CenaMorte, Chamado, Ejecao2, Fim2, Frase, QuadroVotos, Revela, Shhh, Som, Votacao} from './Telas';
import {AU3Papeis, PAPEIS3} from './Papeis';
import {AU2Comentarios} from './Comentarios';
import {AU3Elenco, AU3Ideias, AU3Nave, COMENTARIOS3} from './Abertura';
import {AU2Placar} from './Placar';
import {simular, type Partida2} from './sim';

// votação: carimbos VOTOU até 55% da cena (com o quadro "quem votou em quem"); depois a mesa vira o resultado
const Votos: React.FC<{p: Partida2; idx: number; dur: number}> = ({p, idx, dur}) => {
  const f = useCurrentFrame();
  const n = Object.keys(p.reunioes[idx].votos).length;
  const fim = dur * 0.55;
  const tempos = Array.from({length: n}, (_, i) => Math.round(((i + 1) / n) * fim) - 1);
  const fr = Math.min(1, f / Math.max(1, fim));
  const k = tempos.filter((t) => t <= f).length;
  return (
    <>
      <Votacao p={p} idx={idx} fase={fr >= 1 ? 'resultado' : 'votacao'} votos={fr} timer={Math.max(0, Math.ceil(15 * (1 - fr)))} />
      <QuadroVotos p={p} idx={idx} k={k} tempos={tempos} />
      {tempos.map((t, i) => <Som key={i} nome="voto" em={t} vol={0.5} />)}
    </>
  );
};

// quadro (na cena) em que o narrador fala cada termo; cada termo é procurado depois do anterior (sequencial) ou do começo
const semAcento = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const gatilhos = (scene: Scene, termos: string[], sequencial = true): number[] => {
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  let k = 0;
  return termos.map((t) => {
    const alvo = t.split(' ').map(semAcento);
    for (let i = sequencial ? k : 0; i < ws.length; i++) {
      if (alvo.every((a, j) => semAcento(ws[i + j]?.w ?? '') === a)) {
        k = i + 1;
        return ws[i].s;
      }
    }
    return -1;
  });
};
const ou = (v: number, pad: number) => (v >= 0 ? v : pad);

export const AU3Visual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida2>;
  const P = (n?: number) => ps[String(n ?? 1)];
  switch (name) {
    case 'AU3Jogo': {
      const pt = P(p.partida);
      const s = simular(pt);
      let de = (s.inicioTique[p.tique ?? 1] ?? 0) + Math.round((p.seg ?? 0) * 30);
      if (p.evento) {
        const e = s.eventos.find((x) => Object.entries(p.evento as Record<string, unknown>).every(([k, v]) => x[k] === v));
        if (e) de = Math.max(0, e.quadro - Math.round((p.antes ?? 3) * 30));
      }
      return <Jogo p={pt} de={de} foco={p.foco} papeis={p.papeis ?? true} hud={p.hud ?? true} chat={p.chat ?? true} />;
    }
    case 'AU3Frase':
      return <Frase p={P(p.partida)} cor={p.cor} texto={p.texto} modo={p.modo} />;
    case 'AU3Shhh':
      return <Shhh />;
    case 'AU3Revela': {
      const pt = P(p.partida);
      const imps = pt.jogadores.filter((j) => j.time === 'impostor').map((j) => j.cor);
      const q = gatilhos(scene, imps, false);
      return <Revela p={pt} foco={p.foco} nomes={Object.fromEntries(imps.map((c, i) => [c, q[i]]))} />;
    }
    case 'AU3Chamado':
      return <Chamado p={P(p.partida)} idx={p.indice} />;
    case 'AU3Reuniao':
      return <Votacao p={P(p.partida)} idx={p.indice} fase="discussao" mensagens={p.chat ?? []} timer={p.timer} />;
    case 'AU3Votos':
      return <Votos p={P(p.partida)} idx={p.indice} dur={scene.duration} />;
    case 'AU3Resultado':
      return <Votacao p={P(p.partida)} idx={p.indice} fase="resultado" mensagens={[]} />;
    case 'AU3Ejecao':
      return <Ejecao2 p={P(p.partida)} idx={p.indice} />;
    case 'AU3Fim':
      return <Fim2 p={P(p.partida)} foco={p.foco} />;
    case 'AU3Morte':
      return <CenaMorte assassino={p.assassino} vitima={p.vitima} aparente={p.aparente} />;
    case 'AU3Comentarios':
      return <AU2Comentarios comentarios={COMENTARIOS3} passo={p.passo ?? 42} />;
    case 'AU3Ideias': {
      const [f2, m] = gatilhos(scene, ['infelizmente', p.marca ?? 'entraram']);
      return <AU3Ideias inicio={p.inicio ?? 14} passo={p.passo ?? 5} frase2={ou(f2, 120)} marca={ou(m, Math.round(scene.duration * 0.7))} />;
    }
    case 'AU3Elenco': {
      const [saiu, novas] = gatilhos(scene, ['grok', 'mistral']);
      return <AU3Elenco p={P(1)} saiu={ou(saiu, 30)} novas={ou(novas, 70)} />;
    }
    case 'AU3Nave':
      return <AU3Nave dur={scene.duration} />;
    case 'AU3Papeis':
      return <AU3Papeis passo={p.passo} focos={gatilhos(scene, PAPEIS3.map((r) => r.nome))} />;
    case 'AU3Placar':
      return <AU2Placar ps={ps} ate={p.ate ?? 4} />;
    default:
      return null;
  }
};
