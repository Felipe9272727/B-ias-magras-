// Tributos e distritos do vídeo 3 (cópia de ilha/jogo/regras.mjs, só o que a parte visual usa).
export type Tributo = {id: string; nome: string; distrito: string; lider?: boolean; cor: string};

export const TRIBUTOS: Tributo[] = [
  {id: 'opus', nome: 'Opus', distrito: 'Anthropic', lider: true, cor: '#E8743B'},
  {id: 'sonnet', nome: 'Sonnet', distrito: 'Anthropic', cor: '#F2B134'},
  {id: 'haiku1', nome: 'Haiku 1', distrito: 'Anthropic', cor: '#E05A6D'},
  {id: 'haiku2', nome: 'Haiku 2', distrito: 'Anthropic', cor: '#B07CE8'},
  {id: 'ds1', nome: 'DeepSeek 1', distrito: 'DeepSeek', lider: true, cor: '#4FC3F7'},
  {id: 'ds2', nome: 'DeepSeek 2', distrito: 'DeepSeek', cor: '#81C784'},
  {id: 'ds3', nome: 'DeepSeek 3', distrito: 'DeepSeek', cor: '#FFD54F'},
  {id: 'ds4', nome: 'DeepSeek 4', distrito: 'DeepSeek', cor: '#F06292'},
  {id: 'qwen1', nome: 'Qwen Max', distrito: 'Alibaba', lider: true, cor: '#4DB6AC'},
  {id: 'qwen2', nome: 'Qwen 27B-1', distrito: 'Alibaba', cor: '#FF8A65'},
  {id: 'qwen3', nome: 'Qwen 27B-2', distrito: 'Alibaba', cor: '#9575CD'},
  {id: 'qwen4', nome: 'Qwen 27B-3', distrito: 'Alibaba', cor: '#AED581'},
];

export const DISTRITOS = [
  {nome: 'Anthropic', cor: '#E8743B'},
  {nome: 'DeepSeek', cor: '#4FC3F7'},
  {nome: 'Alibaba', cor: '#B07CE8'},
];

export const PERIODOS = ['manhã', 'tarde', 'noite'];

export const tributo = (id: string): Tributo | undefined => TRIBUTOS.find((t) => t.id === id);

export const corDistrito = (nome: string): string => DISTRITOS.find((d) => d.nome === nome)?.cor ?? '#ffffff';
