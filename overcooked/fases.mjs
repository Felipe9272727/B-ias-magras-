// Fases do Overcooked das IAs. Mapa em texto: '.' piso, '1'-'4' onde cada chef começa, '#' bancada,
// T tomate, O cebola, M cogumelo, A alface, P pão, K carne (caixas), B tábua, F fogão com panela, G grelha com
// frigideira, D pilha de pratos limpos, R retorno de pratos sujos, S pia, E passa-prato (entrega), L lixo,
// X bancada com o extintor. Duração e intervalo em tiques (1 tique = 2 s).
export const FASES = {
  // versus 1: só sopa, cozinha aberta (aprendizado)
  v1: {
    titulo: 'Fase 1 · Sopa pra todo mundo',
    duracao: 75, intervalo: 9, pratos: 4, tempoPedido: 1.4,
    receitas: ['Sopa de tomate', 'Sopa de cebola'],
    mapa: `
      ##T#O#FF#EE#
      #..........#
      B..1.......D
      #...####...#
      B.......2..#
      #..........L
      ##X#########`,
  },
  // versus 2: cozinha dividida, um lado só tem ingrediente e tábua, o outro tem fogão, prato e entrega
  v2: {
    titulo: 'Fase 2 · O balcão no meio',
    duracao: 85, intervalo: 9, pratos: 4, tempoPedido: 1.3,
    receitas: ['Sopa de tomate', 'Sopa de cebola', 'Salada'],
    mapa: `
      #TOA##FF#EE#
      #....#.....#
      B.1..#.....D
      #....#..2..#
      B....#.....R
      #....#.....S
      ##X#######L#`,
  },
  // versus 3: hambúrguer, frigideira que queima e pratos sujos
  v3: {
    titulo: 'Fase 3 · Hambúrguer em chamas',
    duracao: 90, intervalo: 8, pratos: 3, tempoPedido: 1.25,
    receitas: ['Hambúrguer', 'Hambúrguer com alface', 'Salada', 'Sopa de tomate'],
    mapa: `
      ##P#K#GG#FEE#
      #...........#
      B.1.........D
      #...#####...R
      A.........2.S
      #...........L
      #T###X#######`,
  },
  // coop: as 4 IAs na mesma cozinha grande, com tudo
  c1: {
    titulo: 'A cozinha do caos (4 IAs juntas)',
    duracao: 110, intervalo: 6, pratos: 5, tempoPedido: 1.2,
    receitas: ['Sopa de tomate', 'Sopa de cebola', 'Salada', 'Hambúrguer', 'Hambúrguer com alface'],
    mapa: `
      ##T#O#A#FF#GG#EE#
      #...............#
      B.1.........3...D
      #......##.......R
      B......##.......S
      #...2.......4...L
      ##P#K#X##########`,
  },
}
