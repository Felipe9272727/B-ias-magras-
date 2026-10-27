// Liga os nomes usados em roteiro/roteiro_au5*.py aos componentes do Among Us 5 (Polus). `timeline.data.partidas` são
// os logs de amongus/logs5 e `timeline.data.skins` as roupas que as IAs escolheram no AU4 (as cores novas vêm sem).
// Toda cena AU5 aceita `selos` (carimbo, crédito, etiqueta, contador) e mostra os pensamentos (falas marcadas como
// pensamento no roteiro, com a voz em eco) por cima. O momento de um selo é um número (segundos na cena) ou uma
// palavra do narrador (o selo entra quando ela é dita).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Scene, Timeline} from '../types';
import {Jogo5, type Skins} from './Jogo5';
import {simular, type Partida2} from './sim5';
import {mapaDaCena} from '../amongus3/tempo';
import {Ejecao2, Votacao} from './Telas5';
import {AU5Comentarios, AU5Davi, AU5Polus} from './Abertura5';
import {AU5Casal, AU5Foto, AU5Rebobina, Pensamentos, Sobreposicoes, type Selo} from './Extras5';

const semAcento = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// quadro (na cena) em que o narrador fala o termo; -1 se não fala
const quandoDiz = (scene: Scene, termo: string): number => {
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  const alvo = termo.split(' ').map(semAcento);
  for (let i = 0; i < ws.length; i++) if (alvo.every((a, j) => semAcento(ws[i + j]?.w ?? '') === a)) return ws[i].s;
  return -1;
};
const momento = (scene: Scene, at: number | string) => (typeof at === 'number' ? Math.round(at * 30) : Math.max(0, quandoDiz(scene, at)));

const Visual5: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida2>;
  const skins = (timeline.data as any).skins as Skins;
  switch (name) {
    case 'AU5Jogo': {
      const pt = ps[String(p.partida ?? 1)];
      const s = simular(pt);
      const {de, mapa} = mapaDaCena(scene, p, s as any);
      return <Jogo5 p={pt} de={de} mapa={mapa} foco={p.foco} papeis={p.papeis ?? true} hud={p.hud ?? true} chat={!!(p.chat ?? true)} skins={skins} semSala={p.semSala} />;
    }
    case 'AU5Fecho': {
      // quadro congelado (ex.: a Rose da abertura) escurecido, com os textos por cima (selos)
      const pt = ps[String(p.partida ?? 1)];
      const s = simular(pt);
      const {de} = mapaDaCena(scene, p, s as any);
      return (
        <AbsoluteFill>
          <Jogo5 p={pt} de={de + Math.round((p.antes ?? 0) * 30)} foco={p.foco} papeis={false} hud={false} chat={false} skins={skins} parado tiqueHud={false} semSala sons={false} />
          <AbsoluteFill style={{background: 'rgba(5,5,20,.6)'}} />
        </AbsoluteFill>
      );
    }
    case 'AU5Reuniao':
      return <Votacao p={ps[String(p.partida)]} idx={p.indice} fase="discussao" mensagens={(Array.isArray(p.chat) ? p.chat : []).filter((m: any) => !m.pensa)} timer={p.timer} viva chat={p.painelChat ?? true} semFalaGrande={p.falaGrande !== true} />;
    case 'AU5Resultado':
      return <Votacao p={ps[String(p.partida)]} idx={p.indice} fase="resultado" mensagens={[]} chat={false} semJuiz={p.semJuiz} carimboEm={p.carimbo ? momento(scene, p.carimbo) : 20} />;
    case 'AU5Ejecao':
      return <Ejecao2 p={ps[String(p.partida)]} idx={p.indice} />;
    case 'AU5Comentarios':
      return <AU5Comentarios comentarios={p.comentarios} />;
    case 'AU5Davi':
      return <AU5Davi autor={p.autor} lista={p.lista} fim={p.fim} total={p.total} semCarimbo={p.semCarimbo} />;
    case 'AU5Polus':
      return <AU5Polus etiquetas={p.etiquetas} cartoes={p.cartoes} inicioVoo={p.inicioVoo} />;
    case 'AU5Rebobina':
      return <AU5Rebobina de={p.de} para={p.para} kicker={p.kicker} titulo={p.titulo} />;
    case 'AU5Casal':
      return <AU5Casal a={p.a} b={p.b} timeA={p.timeA} timeB={p.timeB} chat={p.chatCasal} />;
    case 'AU5Foto':
      return <AU5Foto p={ps[String(p.partida ?? 1)]} skins={skins} tique={p.tique} cor={p.cor} legenda={p.legenda} />;
    default:
      return null;
  }
};

export const AU5Visual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = (pr) => {
  const selos: Selo[] = ((pr.props.selos ?? []) as any[]).map((x) => ({...x, at: momento(pr.scene, x.at)}));
  return (
    <AbsoluteFill>
      <Visual5 {...pr} />
      {selos.length > 0 && <Sobreposicoes selos={selos} />}
      <Pensamentos chat={Array.isArray(pr.props.chat) ? pr.props.chat : []} />
    </AbsoluteFill>
  );
};
