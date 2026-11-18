// TRIBUNAL: junta as cenas, os grifos das citações e o trecho parado de propósito (H4).
import {CENAS1} from './cenas1';
import {CENAS2} from './cenas2';
import {CENAS3} from './cenas3';
import type {X} from './dados';
import type {CenaFn} from './util';

export const CENAS: Record<string, CenaFn> = {...CENAS1, ...CENAS2, ...CENAS3};

// palavras grifadas nas citações (chave = "CENA#índice da citação"); rot = etiqueta de máquina de escrever
export const GRIFO: Record<string, {w: string[]; rot?: string; encolhe?: boolean}> = {
  'A3#0': {w: ['ronda normalmente']},
  'C2#1': {w: ['não toquei em nada']}, 'C2#3': {w: ['peguei dois']},
  'C3#0': {w: ['Colônia de Pescadores']}, 'C3#1': {w: ['meu pai']}, 'C3#2': {w: ['meu avô']},
  'C4#1': {w: ['o vento']},
  'D1#1': {w: ['coração em pedaços']}, 'D1#2': {w: ['ANEL DE ÂNCORA']},
  'D2#1': {w: ['cinza não fala']},
  'D3#1': {w: ['delegado Turquesa']}, 'D3#2': {w: ['dedo anelar']}, 'D3#3': {w: ['não tem círculo']},
  'E1#0': {w: ['seriaYG', 'amazing', 'accusation'], rot: 'TRADUÇÃO DO MINIMAX'},
  'E1#2': {w: ['último minuto']},
  'E3#0': {w: ['senhora Topázio'], rot: 'ERRO DO MODELO'}, 'E3#2': {w: ['rádio VHF']},
  'E4#0': {w: ['só a tempestade']}, 'E4#2': {w: ['Só vi a tempestade', 'Só a tempestade']},
  'F1#3': {w: ['exame de sangue']},
  'F2#1': {w: ['Nilo Brandão']}, 'F2#2': {w: ['Vaidade']},
  'F3#1': {w: ['promoting'], rot: 'TRADUÇÃO DO MINIMAX'},
  'G1#0': {w: ['tipo sanguíneo']}, 'G1#1': {w: ['tipo sanguíneo']},
  'G2#1': {w: ['restaurador', 'Nunca toquei']}, 'G2#2': {w: ['às nove da noite']}, 'G2#3': {w: ['à tarde', 'restauro']},
  'G3#1': {w: ['homem nenhum', 'anel dourado', 'porta trancada']},
  'G4#0': {w: ['a carta e o casaco']}, 'G4#1': {w: ['homem de terno com a mão enfaixada', 'Esquece'], encolhe: true},
  'G5#0': {w: ['22:27']}, 'G5#1': {w: ['22:18']},
  'H1#2': {w: ['Errar um horário']},
  'H2#1': {w: ['segurando a taça com a esquerda']},
  'H3#0': {w: ['único caco de vidro']}, 'H3#1': {w: ['número da fundação']}, 'H3#2': {w: ['sou eu']}, 'H3#3': {w: ['coração em pedaços']},
  'I1#0': {w: ['fornecedor de madeira']}, 'I1#1': {w: ['não escreve nomes']},
  'I2#1': {w: ['O negativo', 'sangue de sexta-feira']}, 'I2#2': {w: ['convite']},
  'I3#0': {w: ['moldura', 'no vidro']}, 'I3#1': {w: ['dedo mínimo']},
  'I4#1': {w: ['anel dourado de âncora', 'Não vi nada, só a tempestade']}, 'I4#2': {w: ['alguém gritando lá dentro']},
  'I5#3': {w: ['que a traga']}, 'I5#4': {w: ['enseada']},
  'I6#2': {w: ['apenas alegada']},
  'I7#0': {w: ['um anel é um círculo']}, 'I7#1': {w: ['ABSOLVE']},
  'J2#0': {w: ['Usei dois']},
};

// H4: depois das duas lentes apagarem e do carimbo, 3 s sem nada se mexer (a única cena parada do vídeo)
// (o H4 tinha 3 s parados; a narração entra logo após a sentença, então a cena segue em movimento lento)
export const PARADO: Record<string, (X: X) => [number, number]> = {};
