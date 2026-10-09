import {staticFile, type CalculateMetadataFunction} from 'remotion';
import type {Partida} from '../amongus/dados';

export type Word = {w: string; s: number; e: number};
export type Block = {id: string; dur: number; palavras: Word[]};
export type ShortKey = 'flagra' | 'simulador' | 'parceiro' | 'tentativas';
export type DailyProps = {short: ShortKey; blocks: Block[]; partida: Partida | null; mapFile: string | null};

export const PACK: Record<ShortKey, {composition: string; date: string; file: string; title: string; source: string; blocks: string[]}> = {
  flagra: {
    composition: 'ShortDiarioFlagra', date: '2026-10-09', file: '01-ia-pega-no-flagra',
    title: 'A IA entrou no duto na frente de 3 pessoas', source: 'short2',
    blocks: ['gancho', 'quem', 'duto', 'ironia'],
  },
  simulador: {
    composition: 'ShortDiarioSimulador', date: '2026-10-10', file: '02-ia-simula-o-pulo',
    title: 'A IA zerou Mario de primeira. Como?', source: 'short_mario',
    blocks: ['gancho', 'ada', 'trapaca'],
  },
  parceiro: {
    composition: 'ShortDiarioParceiro', date: '2026-10-11', file: '03-impostor-engana-o-parceiro',
    title: 'A IA fingiu tarefa para o próprio parceiro', source: 'short2',
    blocks: ['quem', 'admin', 'fim'],
  },
  tentativas: {
    composition: 'ShortDiarioTentativas', date: '2026-10-12', file: '04-tres-ias-travadas-no-mario',
    title: '3 IAs tentando passar do começo do Mario', source: 'short_mario',
    blocks: ['neuro', 'dqn', 'rainbow'],
  },
};

export const metadataFor = (short: ShortKey): CalculateMetadataFunction<DailyProps> => async () => {
  const plan = PACK[short];
  const filename = plan.source === 'short2' ? 'short2.json' : 'short_mario.json';
  const res = await fetch(staticFile(`${plan.source}/${filename}`));
  if (!res.ok) throw new Error(`Narração ausente: ${plan.source}/${filename}`);
  const source = await res.json() as {blocos: Block[]};
  const blocks = plan.blocks.map(id => {
    const block = source.blocos.find(b => b.id === id);
    if (!block) throw new Error(`Bloco ausente: ${id}`);
    return block;
  });
  let partida: Partida | null = null;
  let mapFile: string | null = null;
  if (plan.source === 'short2') {
    const log = await fetch(staticFile('amongus/partida1.json'));
    if (!log.ok) throw new Error('Log da partida 1 ausente');
    partida = await log.json() as Partida;
    const raster = await fetch(staticFile('shorts/nave-estatica.png'), {method: 'HEAD'});
    if (raster.ok) mapFile = 'shorts/nave-estatica.png';
  }
  return {durationInFrames: blocks.reduce((n, b) => n + b.dur, 0), props: {short, blocks, partida, mapFile}};
};
