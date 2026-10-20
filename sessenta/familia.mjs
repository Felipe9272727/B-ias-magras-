// A família (nomes e jeitos próprios; os papéis lembram os do jogo: pai forte, mãe esperta, filha ágil, filho pequeno).
// espaco: quantos espaços das mãos a pessoa ocupa quando é carregada na coleta (fonte: docs/mecanica_coleta_itens.md,
// seção 3). O pai é quem o jogador controla: não é carregado, então não ocupa espaço (espaco 0).
// fome: consumo de comida e água por ração. A wiki diz que todos comem igual (1/4 de lata e 1/4 de garrafa), então 1.0 para todos.
// forca: não existe na wiki (decisão nossa, sem efeito por enquanto).
export const FAMILIA = [
  {id: 'pai', nome: 'Osvaldo', papel: 'pai', espaco: 0, forca: 3, fome: 1.0, desc: 'o pai: forte, é quem corre pela casa na coleta'},
  {id: 'mae', nome: 'Celeste', papel: 'mãe', espaco: 2, forca: 2, fome: 1.0, desc: 'a mãe: esperta e calma'},
  {id: 'filha', nome: 'Juju', papel: 'filha', espaco: 3, forca: 2, fome: 1.0, desc: 'a filha adolescente: ágil e curiosa, ocupa bastante espaço'},
  {id: 'filho', nome: 'Tico', papel: 'filho', espaco: 2, forca: 1, fome: 1.0, desc: 'o filho caçula: pequeno, mas come o mesmo que os outros'},
]
