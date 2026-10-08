// Contrato da nave do vídeo 2 (gameplay "estilo Among Us de verdade").
// mapa.ts implementa os dados e o caminho; Arte.tsx desenha; Gameplay usa os dois.
// Coordenadas de mundo em pixels; a grade tem TILE px por célula.

export type Sala =
  | 'Refeitorio' | 'Armas' | 'O2' | 'Navegacao' | 'Escudos' | 'Comunicacoes' | 'Deposito'
  | 'Admin' | 'Eletrica' | 'MotorInferior' | 'Seguranca' | 'Reator' | 'MotorSuperior' | 'Enfermaria';

export const SALAS_ORDEM: Sala[] = [
  'Refeitorio', 'Armas', 'O2', 'Navegacao', 'Escudos', 'Comunicacoes', 'Deposito',
  'Admin', 'Eletrica', 'MotorInferior', 'Seguranca', 'Reator', 'MotorSuperior', 'Enfermaria',
];

// Pares de salas "vizinhas" na lógica do jogo (1 tique de caminhada). O desenho precisa ter um
// corredor entre cada par que NÃO atravesse o interior de uma terceira sala.
export const VIZINHAS: [Sala, Sala][] = [
  ['Refeitorio', 'Armas'], ['Refeitorio', 'MotorSuperior'], ['Refeitorio', 'Enfermaria'], ['Refeitorio', 'Admin'], ['Refeitorio', 'Deposito'],
  ['Armas', 'O2'], ['Armas', 'Navegacao'], ['O2', 'Navegacao'], ['O2', 'Escudos'], ['Navegacao', 'Escudos'], ['Escudos', 'Comunicacoes'],
  ['Escudos', 'Deposito'], ['Comunicacoes', 'Deposito'], ['Deposito', 'Admin'], ['Deposito', 'Eletrica'], ['Deposito', 'MotorInferior'],
  ['MotorInferior', 'Seguranca'], ['MotorInferior', 'Reator'], ['MotorInferior', 'MotorSuperior'], ['Seguranca', 'Reator'],
  ['Seguranca', 'MotorSuperior'], ['Reator', 'MotorSuperior'], ['MotorSuperior', 'Enfermaria'],
];

// Salas com saída de duto
export const COM_DUTO: Sala[] = ['Reator', 'MotorSuperior', 'MotorInferior', 'Enfermaria', 'Seguranca', 'Eletrica', 'Refeitorio', 'Admin', 'Navegacao', 'Armas', 'Escudos'];

export const TILE = 48;

export type Pt = {x: number; y: number};
export type Ret = {c: number; r: number; w: number; h: number}; // em células

// Paleta de cada sala, no espírito da Skeld (piso de cores diferentes por sala)
export type Tema = {
  piso: string; // cor principal do piso
  piso2: string; // cor das linhas/ladrilhos alternados
  parede: string; // face da parede (lado de frente)
  paredeTopo: string; // topo da parede (visto de cima)
  destaque: string; // cor de detalhe (luzes, monitores)
};

export type Prop = {
  tipo: string; // 'mesa', 'banco', 'motor', 'reator', 'painel', 'caixa', 'cama', 'scanner', 'monitor', 'planta', 'mapa', 'antena', 'escudo', 'leme', 'canhao', 'botao', 'cano', 'armario'
  x: number; y: number; // centro, em px de mundo
  w: number; h: number; // tamanho em px
  rot?: number;
};

export type DadosSala = {
  nome: string; // nome exibido (com acento)
  rect: Ret; // retângulo da sala na grade (inclui só o piso interno)
  tema: Tema;
  spots: Pt[]; // 8 pontos de "ficar parado" bem espalhados dentro da sala, longe de móveis (um por cor)
  consoles: Pt[]; // >=2 pontos de tarefa, encostados numa parede (o jogador fica de frente)
  duto?: Pt; // saída de duto (só nas salas de COM_DUTO)
  props: Prop[];
};

export type NaveData = {
  cols: number;
  rows: number;
  // grade em texto, uma string por linha, com `cols` caracteres cada:
  //  ' ' espaço (fora da nave)   '#' parede   '.' piso de sala   ',' piso de corredor   'D' porta (piso entre sala e corredor)
  grid: string[];
  salas: Record<Sala, DadosSala>;
};
