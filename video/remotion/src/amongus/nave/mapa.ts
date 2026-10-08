// Mapa da nave do vídeo 2 (estilo The Skeld): grade em texto, salas, pontos de tarefa e caminhos.
// Layout: Refeitório no topo-centro; Armas e O2 à direita; Enfermaria entre Motor Superior e Refeitório;
// Reator e Segurança à esquerda; Motor Inferior no canto inferior-esquerdo; Depósito no centro-inferior;
// Admin à direita do Depósito; Comunicações e Escudos embaixo à direita; Navegação no lado direito.
// Cada sala é um retângulo de piso ('.') cercado de parede ('#'); corredores (',') de 3-4 células
// ligam as salas pelas portas ('D'). Os dados foram gerados a partir do desenho e conferidos por
// scripts/checar_mapa.mjs (rotas entre salas vizinhas, pontos dentro do piso etc.).
import {SALAS_ORDEM, TILE, type NaveData, type Pt, type Sala} from './spec';

export const NAVE: NaveData = {
  cols: 120,
  rows: 74,
  grid: [
    '                                                                                                                        ',
    '                                                                                                                        ',
    '                                         ###############################           ####################                 ',
    '  #################                      #.............................#           #..................#                 ',
    '  #...............#     ###############  #.............................#           #..................#                 ',
    '  #...............#     #.............#  #.............................#############..................#                 ',
    '  #...............#     #.............#  #.............................D,,,,,,,,,,,D..................#                 ',
    '  #...............#######.............####.............................D,,,,,,,,,,,D..................#                 ',
    '  #...............D,,,,,D.............D,,D.............................D,,,,,,,,,,,D..................#                 ',
    '  #...............D,,,,,D.............D,,D.............................D,,,,,,,,,,,D..................#######           ',
    '  #...............D,,,,,D.............D,,D.............................#############..................D,,,,,#           ',
    '  #...............D,,,,,D.............D,,D.............................#           #..................D,,,,,#           ',
    '  #...............#######.............####.............................#           #..................D,,,,,#           ',
    '  #...............#     #.............#  #.............................#           #..................D,,,,,#           ',
    '  #...............#     #.............#  #.............................#           ###DDDD##############,,,,#           ',
    '  #...............#     ###############  #.............................#             #,,,,#            #,,,,#           ',
    '  #DDDD#DDDD##############################.............................#             #,,,,#            #,,,,#           ',
    '  #,,,,#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............................#             #,,,,#            #,,,,#           ',
    '  #,,,,#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............................#             #,,,,#            #,,,,#           ',
    '  #,,,,#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............................#             #,,,,#            #DDDD#########   ',
    '  #,,,,#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............................#       #######DDDD####         #............#   ',
    '  #,,,,##############,,,,###########,,,,######DDDD################DDDD##       #.............#         #............#   ',
    '  #,,,,#            #,,,,#         #,,,,#    #,,,,#              #,,,,#        #.............#         #............#   ',
    '  #DDDD########     #,,,,#         #,,,,#    #,,,,#              #,,,,#        #.............###########............#   ',
    '  #...........#     #,,,,#         #,,,,#    #,,,,#              #,,,,#        #.............D,,,,,,,,,D............#   ',
    '  #...........#     #,,,,#         #,,,,#    #,,,,#              #,,,,#        #.............D,,,,,,,,,D............#   ',
    '  #...........#     #,,,,#         #,,,,#    #,,,,#              #,,,,#        #.............D,,,,,,,,,D............#   ',
    '  #...........#   ###DDDD####      #,,,,#    #,,,,#              #,,,,#        #.............D,,,,,,,,,D............#   ',
    '  #...........#####.........#      #,,,,#    #,,,,#              #,,,,#        #.............####,,,,###............#   ',
    '  #...........D,,,D.........#      #,,,,#    #,,,,#              #,,,,#        #.............#  #,,,,# #............#   ',
    '  #...........D,,,D.........#      #,,,,#    #,,,,#              #,,,,#        #.............#  #,,,,# #............#   ',
    '  #...........D,,,D.........#      #,,,,#    #,,,,#              #,,,,#        ###############  #,,,,# #............#   ',
    '  #...........D,,,D.........#      #,,,,#    #,,,,#              #,,,,#                         #,,,,# #............#   ',
    '  #...........#####.........#      #,,,,#    #,,,,#              #DDDD########                  #,,,,# #............#   ',
    '  #...........#   #.........#      #,,,,#    #,,,,#              #...........#                  #,,,,# ##DDDD########   ',
    '  #...........#   #.........#      #,,,,#    #,,,,#              #...........#                  #,,,,#  #,,,,#          ',
    '  #...........#   #.........#      #,,,,#    #,,,,#              #...........#                  #,,,,#  #,,,,#          ',
    '  #...........#   #.........#      #,,,,#  ###DDDD################...........#                  #,,,,#  #,,,,#          ',
    '  ########DDDD#   ###DDDD####      #,,,,#  #..................D,,D...........#                  #,,,,#  #,,,,#          ',
    '         #,,,,#     #,,,,#         #,,,,#  #..................D,,D...........#                 ##DDDD####DDDD#          ',
    '   #######,,,,#######,,,,###########,,,,####..................D,,D...........#                 #.............#          ',
    '   #,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D..................D,,D...........#                 #.............#          ',
    '   #,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D..................####...........#                 #.............#          ',
    '   #,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D..................#  #...........#                 #.............#          ',
    '   #,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D..................##################################.............#          ',
    '   #,,,,####################################..................D,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............#          ',
    '   #,,,,#                                  #..................D,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............#          ',
    '   #,,,,#                                  #..................D,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............#          ',
    '   #,,,,#                                  #..................D,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,D.............#          ',
    '   #,,,,#            #######################..................##################################.............#          ',
    '   #,,,,#            #.............D,,,,,,,D..................D,,,,,,,,,,,,D.............D,,,,,D.............#          ',
    '  ##DDDD##########   #.............D,,,,,,,D..................D,,,,,,,,,,,,D.............D,,,,,D.............#          ',
    '  #..............#   #.............D,,,,,,,D..................D,,,,,,,,,,,,D.............D,,,,,D.............#          ',
    '  #..............#   #.............#########################################.............#####################          ',
    '  #..............#   #.............#                                       #.............#                              ',
    '  #..............#   #.............#                                       #.............#                              ',
    '  #..............#   #.............#                                       #.............#                              ',
    '  #..............#   #.............#                                       #.............#                              ',
    '  #..............#   #.............#                                       #.............#                              ',
    '  #..............#   #.............#                                       ###############                              ',
    '  #..............#   #.............#                                                                                    ',
    '  #..............#   ###############                                                                                    ',
    '  #..............#                                                                                                      ',
    '  #..............#                                                                                                      ',
    '  #..............#                                                                                                      ',
    '  #..............#                                                                                                      ',
    '  #..............#                                                                                                      ',
    '  ################                                                                                                      ',
    '                                                                                                                        ',
    '                                                                                                                        ',
    '                                                                                                                        ',
    '                                                                                                                        ',
    '                                                                                                                        ',
    '                                                                                                                        ',
  ],
  salas: {
    Refeitorio: {
      nome: 'Refeitório',
      rect: {c: 42, r: 3, w: 29, h: 18},
      tema: {piso: '#8fb3c9', piso2: '#7ea3ba', parede: '#5a7385', paredeTopo: '#3f5260', destaque: '#d8f0ff'},
      spots: [{x: 2808, y: 552}, {x: 2040, y: 936}, {x: 2136, y: 216}, {x: 3336, y: 936}, {x: 3336, y: 216}, {x: 2520, y: 936}, {x: 2568, y: 216}, {x: 2280, y: 600}],
      consoles: [{x: 2136, y: 168}, {x: 3384, y: 888}, {x: 2520, y: 984}],
      duto: {x: 2040, y: 168},
      props: [
        {tipo: 'mesa', x: 2352, y: 288, w: 115, h: 115},
        {tipo: 'mesa', x: 3024, y: 288, w: 115, h: 115},
        {tipo: 'mesa', x: 2352, y: 768, w: 115, h: 115},
        {tipo: 'mesa', x: 3024, y: 768, w: 115, h: 115},
        {tipo: 'botao', x: 2688, y: 552, w: 77, h: 77},
        {tipo: 'banco', x: 2688, y: 216, w: 96, h: 38},
      ],
    },
    Armas: {
      nome: 'Armas',
      rect: {c: 84, r: 3, w: 18, h: 11},
      tema: {piso: '#7d8896', piso2: '#6e7986', parede: '#4d5561', paredeTopo: '#363d47', destaque: '#4fe3ff'},
      spots: [{x: 4440, y: 312}, {x: 4872, y: 600}, {x: 4104, y: 600}, {x: 4536, y: 600}, {x: 4056, y: 360}, {x: 4344, y: 504}, {x: 4824, y: 408}, {x: 4584, y: 408}],
      consoles: [{x: 4152, y: 168}, {x: 4776, y: 648}],
      duto: {x: 4056, y: 168},
      props: [
        {tipo: 'canhao', x: 4224, y: 288, w: 115, h: 115},
        {tipo: 'canhao', x: 4704, y: 288, w: 115, h: 115},
        {tipo: 'banco', x: 4464, y: 432, w: 77, h: 77},
        {tipo: 'painel', x: 4752, y: 528, w: 96, h: 48},
      ],
    },
    O2: {
      nome: 'O2',
      rect: {c: 80, r: 21, w: 13, h: 10},
      tema: {piso: '#8a9a94', piso2: '#7c8c86', parede: '#4f5e5a', paredeTopo: '#35403d', destaque: '#7dffb0'},
      spots: [{x: 4152, y: 1224}, {x: 4392, y: 1416}, {x: 4392, y: 1080}, {x: 4104, y: 1416}, {x: 4440, y: 1224}, {x: 4248, y: 1416}, {x: 4296, y: 1176}, {x: 4152, y: 1320}],
      consoles: [{x: 3864, y: 1032}, {x: 4440, y: 1464}],
      props: [
        {tipo: 'planta', x: 3984, y: 1152, w: 96, h: 96},
        {tipo: 'planta', x: 3984, y: 1344, w: 96, h: 96},
        {tipo: 'planta', x: 4272, y: 1296, w: 96, h: 96},
        {tipo: 'painel', x: 4176, y: 1104, w: 96, h: 48},
      ],
    },
    Navegacao: {
      nome: 'Navegação',
      rect: {c: 104, r: 20, w: 12, h: 14},
      tema: {piso: '#838d99', piso2: '#757f8b', parede: '#50596a', paredeTopo: '#363e4b', destaque: '#5dffa0'},
      spots: [{x: 5304, y: 1368}, {x: 5064, y: 984}, {x: 5448, y: 1032}, {x: 5064, y: 1560}, {x: 5016, y: 1272}, {x: 5208, y: 1176}, {x: 5496, y: 1368}, {x: 5256, y: 1560}],
      consoles: [{x: 5304, y: 984}, {x: 5544, y: 1608}],
      duto: {x: 5544, y: 984},
      props: [
        {tipo: 'leme', x: 5376, y: 1200, w: 144, h: 144},
        {tipo: 'painel', x: 5184, y: 1056, w: 96, h: 48},
        {tipo: 'painel', x: 5424, y: 1488, w: 144, h: 48},
        {tipo: 'banco', x: 5184, y: 1344, w: 77, h: 77},
      ],
    },
    Escudos: {
      nome: 'Escudos',
      rect: {c: 96, r: 40, w: 13, h: 13},
      tema: {piso: '#7f8b9b', piso2: '#728090', parede: '#4f5a6a', paredeTopo: '#353e4c', destaque: '#54d8ff'},
      spots: [{x: 4968, y: 2280}, {x: 4728, y: 1944}, {x: 5160, y: 1944}, {x: 4632, y: 2472}, {x: 4680, y: 2184}, {x: 5160, y: 2184}, {x: 4968, y: 2472}, {x: 4776, y: 2088}],
      consoles: [{x: 4632, y: 2040}, {x: 5208, y: 2424}],
      duto: {x: 5208, y: 2520},
      props: [
        {tipo: 'escudo', x: 4944, y: 2112, w: 144, h: 144},
        {tipo: 'escudo', x: 4800, y: 2352, w: 144, h: 144},
        {tipo: 'painel', x: 5088, y: 2400, w: 96, h: 48},
      ],
    },
    Comunicacoes: {
      nome: 'Comunicações',
      rect: {c: 76, r: 50, w: 13, h: 9},
      tema: {piso: '#8b8f98', piso2: '#7d818a', parede: '#55595f', paredeTopo: '#3b3e44', destaque: '#ffd84d'},
      spots: [{x: 3960, y: 2568}, {x: 3672, y: 2472}, {x: 4248, y: 2472}, {x: 4008, y: 2760}, {x: 4104, y: 2520}, {x: 4008, y: 2472}, {x: 3720, y: 2568}, {x: 4200, y: 2568}],
      consoles: [{x: 3768, y: 2424}, {x: 4248, y: 2808}],
      props: [
        {tipo: 'antena', x: 4128, y: 2688, w: 72, h: 72},
        {tipo: 'mesa', x: 3840, y: 2688, w: 144, h: 77},
        {tipo: 'painel', x: 3840, y: 2496, w: 96, h: 48},
      ],
    },
    Deposito: {
      nome: 'Depósito',
      rect: {c: 44, r: 38, w: 18, h: 15},
      tema: {piso: '#7a6148', piso2: '#6b5440', parede: '#4a3a2a', paredeTopo: '#33271c', destaque: '#e0b070'},
      spots: [{x: 2520, y: 2184}, {x: 2952, y: 1896}, {x: 2952, y: 2472}, {x: 2136, y: 2472}, {x: 2184, y: 1896}, {x: 2616, y: 2472}, {x: 2856, y: 2184}, {x: 2520, y: 1896}],
      consoles: [{x: 2520, y: 1848}, {x: 2856, y: 2520}],
      props: [
        {tipo: 'caixa', x: 2400, y: 2016, w: 115, h: 115},
        {tipo: 'caixa', x: 2640, y: 2016, w: 115, h: 115},
        {tipo: 'caixa', x: 2400, y: 2304, w: 115, h: 115},
        {tipo: 'caixa', x: 2688, y: 2304, w: 115, h: 115},
        {tipo: 'caixa', x: 2832, y: 1968, w: 96, h: 96},
      ],
    },
    Admin: {
      nome: 'Admin',
      rect: {c: 66, r: 34, w: 11, h: 10},
      tema: {piso: '#2a6f73', piso2: '#24605f', parede: '#173f44', paredeTopo: '#0f2c30', destaque: '#7dffb0'},
      spots: [{x: 3432, y: 1992}, {x: 3240, y: 1656}, {x: 3576, y: 1704}, {x: 3192, y: 1896}, {x: 3624, y: 1896}, {x: 3384, y: 1704}, {x: 3288, y: 1800}, {x: 3288, y: 1896}],
      consoles: [{x: 3480, y: 1656}, {x: 3288, y: 2088}],
      duto: {x: 3672, y: 1656},
      props: [
        {tipo: 'mapa', x: 3456, y: 1848, w: 144, h: 144},
        {tipo: 'armario', x: 3312, y: 2016, w: 48, h: 96},
        {tipo: 'planta', x: 3552, y: 2016, w: 96, h: 77},
      ],
    },
    Eletrica: {
      nome: 'Elétrica',
      rect: {c: 22, r: 50, w: 13, h: 11},
      tema: {piso: '#3b4a45', piso2: '#33413d', parede: '#222e2a', paredeTopo: '#18221f', destaque: '#e6ff66'},
      spots: [{x: 1368, y: 2664}, {x: 1656, y: 2472}, {x: 1608, y: 2856}, {x: 1272, y: 2472}, {x: 1272, y: 2856}, {x: 1560, y: 2664}, {x: 1320, y: 2568}, {x: 1272, y: 2712}],
      consoles: [{x: 1176, y: 2424}, {x: 1656, y: 2904}],
      duto: {x: 1080, y: 2424},
      props: [
        {tipo: 'painel', x: 1152, y: 2544, w: 77, h: 115},
        {tipo: 'painel', x: 1152, y: 2784, w: 77, h: 115},
        {tipo: 'painel', x: 1440, y: 2784, w: 115, h: 77},
        {tipo: 'painel', x: 1488, y: 2544, w: 115, h: 77},
      ],
    },
    MotorInferior: {
      nome: 'Motor Inferior',
      rect: {c: 3, r: 52, w: 14, h: 15},
      tema: {piso: '#2e3f5c', piso2: '#27364f', parede: '#1b2538', paredeTopo: '#131a28', destaque: '#ff8c2b'},
      spots: [{x: 456, y: 2808}, {x: 744, y: 3144}, {x: 216, y: 3144}, {x: 264, y: 2520}, {x: 696, y: 2568}, {x: 744, y: 2856}, {x: 456, y: 3144}, {x: 312, y: 2952}],
      consoles: [{x: 504, y: 2520}, {x: 168, y: 3192}],
      duto: {x: 792, y: 2520},
      props: [
        {tipo: 'motor', x: 288, y: 2784, w: 144, h: 144},
        {tipo: 'motor', x: 576, y: 2976, w: 144, h: 144},
        {tipo: 'cano', x: 432, y: 2592, w: 144, h: 48},
        {tipo: 'caixa', x: 672, y: 2688, w: 96, h: 96},
      ],
    },
    Seguranca: {
      nome: 'Segurança',
      rect: {c: 19, r: 28, w: 9, h: 10},
      tema: {piso: '#2b2f3a', piso2: '#252934', parede: '#171a22', paredeTopo: '#0f1118', destaque: '#ff3b3b'},
      spots: [{x: 1176, y: 1560}, {x: 984, y: 1752}, {x: 936, y: 1464}, {x: 1128, y: 1368}, {x: 1128, y: 1704}, {x: 1080, y: 1464}, {x: 1080, y: 1800}, {x: 1272, y: 1560}],
      consoles: [{x: 1320, y: 1464}, {x: 936, y: 1704}],
      duto: {x: 1320, y: 1368},
      props: [
        {tipo: 'monitor', x: 1248, y: 1440, w: 67, h: 96},
        {tipo: 'monitor', x: 1248, y: 1680, w: 67, h: 96},
        {tipo: 'banco', x: 1056, y: 1584, w: 77, h: 77},
      ],
    },
    Reator: {
      nome: 'Reator',
      rect: {c: 3, r: 24, w: 11, h: 14},
      tema: {piso: '#2e3f5c', piso2: '#27364f', parede: '#1b2538', paredeTopo: '#131a28', destaque: '#ff8c2b'},
      spots: [{x: 408, y: 1656}, {x: 216, y: 1176}, {x: 600, y: 1416}, {x: 456, y: 1224}, {x: 600, y: 1800}, {x: 216, y: 1752}, {x: 600, y: 1608}, {x: 312, y: 1272}],
      consoles: [{x: 456, y: 1176}, {x: 168, y: 1800}],
      duto: {x: 648, y: 1176},
      props: [
        {tipo: 'reator', x: 384, y: 1464, w: 216, h: 216},
        {tipo: 'cano', x: 192, y: 1296, w: 48, h: 96},
        {tipo: 'painel', x: 576, y: 1296, w: 77, h: 48},
      ],
    },
    MotorSuperior: {
      nome: 'Motor Superior',
      rect: {c: 3, r: 4, w: 15, h: 12},
      tema: {piso: '#2e3f5c', piso2: '#27364f', parede: '#1b2538', paredeTopo: '#131a28', destaque: '#ff8c2b'},
      spots: [{x: 504, y: 456}, {x: 216, y: 744}, {x: 792, y: 696}, {x: 504, y: 744}, {x: 264, y: 504}, {x: 840, y: 456}, {x: 456, y: 264}, {x: 360, y: 648}],
      consoles: [{x: 264, y: 216}, {x: 840, y: 744}],
      duto: {x: 168, y: 216},
      props: [
        {tipo: 'motor', x: 288, y: 360, w: 144, h: 144},
        {tipo: 'motor', x: 672, y: 360, w: 144, h: 144},
        {tipo: 'cano', x: 480, y: 600, w: 48, h: 144},
        {tipo: 'painel', x: 672, y: 600, w: 96, h: 48},
      ],
    },
    Enfermaria: {
      nome: 'Enfermaria',
      rect: {c: 25, r: 5, w: 13, h: 10},
      tema: {piso: '#e6f7f5', piso2: '#cfeee9', parede: '#9fd6cf', paredeTopo: '#6fb3aa', destaque: '#2ec4b6'},
      spots: [{x: 1464, y: 456}, {x: 1800, y: 456}, {x: 1224, y: 456}, {x: 1416, y: 648}, {x: 1704, y: 312}, {x: 1464, y: 312}, {x: 1368, y: 456}, {x: 1704, y: 456}],
      consoles: [{x: 1320, y: 264}, {x: 1800, y: 696}],
      duto: {x: 1224, y: 264},
      props: [
        {tipo: 'cama', x: 1296, y: 336, w: 106, h: 58},
        {tipo: 'cama', x: 1296, y: 576, w: 106, h: 58},
        {tipo: 'cama', x: 1584, y: 576, w: 106, h: 58},
        {tipo: 'scanner', x: 1584, y: 360, w: 77, h: 106},
        {tipo: 'planta', x: 1728, y: 576, w: 67, h: 67},
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// Consultas de mapa e caminho
// ---------------------------------------------------------------------------

const N_CELULAS = NAVE.cols * NAVE.rows;
const idx = (c: number, r: number) => r * NAVE.cols + c;

// Caractere da grade numa célula; ' ' fora da nave
function celula(c: number, r: number): string {
  if (c < 0 || r < 0 || c >= NAVE.cols || r >= NAVE.rows) return ' ';
  return NAVE.grid[r].charAt(c);
}

// Sala dona de cada célula de piso (null em parede e corredor)
const SALA_DA_CELULA: (Sala | null)[] = new Array(N_CELULAS).fill(null);
for (const s of SALAS_ORDEM) {
  const {c, r, w, h} = NAVE.salas[s].rect;
  for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) SALA_DA_CELULA[idx(x, y)] = s;
}

// Célula com parede por perto (8 vizinhos): o caminho custa um pouco mais, então prefere o meio do corredor
const PERTO_PAREDE = new Uint8Array(N_CELULAS);
for (let r = 0; r < NAVE.rows; r++) for (let c = 0; c < NAVE.cols; c++) {
  if (celula(c, r) === '#' || celula(c, r) === ' ') continue;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const ch = celula(c + dc, r + dr);
    if (ch === '#' || ch === ' ') PERTO_PAREDE[idx(c, r)] = 1;
  }
}

// Pixel andável: piso de sala, corredor ou porta
export function andavel(p: Pt): boolean {
  const ch = celula(Math.floor(p.x / TILE), Math.floor(p.y / TILE));
  return ch === '.' || ch === ',' || ch === 'D';
}

// Sala cujo piso contém o ponto (null em corredor, porta ou parede)
export function salaEm(p: Pt): Sala | null {
  const c = Math.floor(p.x / TILE), r = Math.floor(p.y / TILE);
  if (c < 0 || r < 0 || c >= NAVE.cols || r >= NAVE.rows) return null;
  return SALA_DA_CELULA[idx(c, r)];
}

// Rota entre as salas a e b: corredores, portas e o piso de a e b. O piso de outra sala não entra.
function passavelNaRota(c: number, r: number, a: Sala | null, b: Sala | null): boolean {
  const ch = celula(c, r);
  if (ch === ',' || ch === 'D') return true;
  if (ch === '.') {
    const s = SALA_DA_CELULA[idx(c, r)];
    return s === a || s === b;
  }
  return false;
}

// Folga do corpo ao passar perto de parede (px) e passo da amostragem da linha de visão (px)
const FOLGA = 10;
const PASSO_TESTE = 6;
const SOMBRA: [number, number][] = [[0, 0], [FOLGA, 0], [-FOLGA, 0], [0, FOLGA], [0, -FOLGA]];

function areaLivre(x: number, y: number, a: Sala | null, b: Sala | null): boolean {
  for (const [dx, dy] of SOMBRA) {
    if (!passavelNaRota(Math.floor((x + dx) / TILE), Math.floor((y + dy) / TILE), a, b)) return false;
  }
  return true;
}

// Linha de visão: o segmento inteiro fica em piso andável (com folga), amostrado a cada 6 px
function linhaLivre(p: Pt, q: Pt, a: Sala | null, b: Sala | null): boolean {
  const n = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / PASSO_TESTE));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (!areaLivre(p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t, a, b)) return false;
  }
  return true;
}

// Fila de prioridade mínima (heap binário) para o A*
class FilaMinima {
  private itens: [number, number][] = [];

  get tamanho(): number { return this.itens.length; }

  push(prioridade: number, valor: number): void {
    const v = this.itens;
    v.push([prioridade, valor]);
    let i = v.length - 1;
    while (i > 0) {
      const pai = (i - 1) >> 1;
      if (v[pai][0] <= v[i][0]) break;
      [v[pai], v[i]] = [v[i], v[pai]];
      i = pai;
    }
  }

  pop(): [number, number] {
    const v = this.itens;
    const topo = v[0];
    const ultimo = v.pop()!;
    if (v.length > 0) {
      v[0] = ultimo;
      let i = 0;
      for (;;) {
        const e = 2 * i + 1, d = e + 1;
        let menor = i;
        if (e < v.length && v[e][0] < v[menor][0]) menor = e;
        if (d < v.length && v[d][0] < v[menor][0]) menor = d;
        if (menor === i) break;
        [v[menor], v[i]] = [v[i], v[menor]];
        i = menor;
      }
    }
    return topo;
  }
}

const DIRECOES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// Distância "octile" entre células (heurística admissível com custo 1 e sqrt(2))
function heuristica(c: number, r: number, cf: number, rf: number): number {
  const dx = Math.abs(c - cf), dy = Math.abs(r - rf);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

// A* em células. Diagonal só se as duas células ortogonais vizinhas forem andáveis (sem cortar quina).
function astar(ci: number, ri: number, cf: number, rf: number, a: Sala | null, b: Sala | null): number[] | null {
  const g = new Float64Array(N_CELULAS).fill(Infinity);
  const pai = new Int32Array(N_CELULAS).fill(-1);
  const fechado = new Uint8Array(N_CELULAS);
  const inicio = idx(ci, ri), fim = idx(cf, rf);
  g[inicio] = 0;
  const fila = new FilaMinima();
  fila.push(heuristica(ci, ri, cf, rf), inicio);
  while (fila.tamanho > 0) {
    const [, atual] = fila.pop();
    if (fechado[atual]) continue;
    fechado[atual] = 1;
    if (atual === fim) break;
    const c = atual % NAVE.cols, r = Math.floor(atual / NAVE.cols);
    for (const [dc, dr] of DIRECOES) {
      const nc = c + dc, nr = r + dr;
      if (!passavelNaRota(nc, nr, a, b)) continue;
      if (dc !== 0 && dr !== 0 && (!passavelNaRota(c + dc, r, a, b) || !passavelNaRota(c, r + dr, a, b))) continue;
      const ni = idx(nc, nr);
      if (fechado[ni]) continue;
      const passo = (dc !== 0 && dr !== 0 ? Math.SQRT2 : 1) + (PERTO_PAREDE[ni] ? 0.6 : 0);
      const ng = g[atual] + passo;
      if (ng < g[ni]) {
        g[ni] = ng;
        pai[ni] = atual;
        fila.push(ng + heuristica(nc, nr, cf, rf), ni);
      }
    }
  }
  if (g[fim] === Infinity) return null;
  const rota: number[] = [];
  for (let i = fim; i !== -1; i = pai[i]) rota.push(i);
  return rota.reverse();
}

// Caminho sem cache: A* nas células, depois "string pulling" com linha de visão
function calcularCaminho(de: Pt, para: Pt): Pt[] {
  const a = salaEm(de), b = salaEm(para);
  const celulas = astar(
    Math.floor(de.x / TILE), Math.floor(de.y / TILE),
    Math.floor(para.x / TILE), Math.floor(para.y / TILE), a, b,
  );
  if (!celulas) return [{x: de.x, y: de.y}, {x: para.x, y: para.y}]; // sem rota: o teste de mapa acusa

  const pontos: Pt[] = [{x: de.x, y: de.y}];
  for (const i of celulas) pontos.push({x: ((i % NAVE.cols) + 0.5) * TILE, y: (Math.floor(i / NAVE.cols) + 0.5) * TILE});
  pontos.push({x: para.x, y: para.y});

  const saida: Pt[] = [pontos[0]];
  let i = 0;
  while (i < pontos.length - 1) {
    let j = pontos.length - 1;
    while (j > i + 1 && !linhaLivre(pontos[i], pontos[j], a, b)) j--;
    saida.push(pontos[j]);
    i = j;
  }
  return saida;
}

// Cache por extremos arredondados ao pixel (chamado muitas vezes por quadro)
const CACHE_CAMINHO = new Map<string, Pt[]>();

// Pontos em px de `de` até `para` (inclusive), todos sobre piso andável
export function caminho(de: Pt, para: Pt): Pt[] {
  const chave = [de.x, de.y, para.x, para.y].map(Math.round).join(',');
  let res = CACHE_CAMINHO.get(chave);
  if (!res) {
    res = calcularCaminho(
      {x: Math.round(de.x), y: Math.round(de.y)},
      {x: Math.round(para.x), y: Math.round(para.y)},
    );
    CACHE_CAMINHO.set(chave, res);
  }
  const saida = res.map(p => ({x: p.x, y: p.y}));
  saida[0] = {x: de.x, y: de.y};
  saida[saida.length - 1] = {x: para.x, y: para.y};
  return saida;
}

// Centro geométrico da sala (px)
export function centroSala(s: Sala): Pt {
  const {c, r, w, h} = NAVE.salas[s].rect;
  return {x: (c + w / 2) * TILE, y: (r + h / 2) * TILE};
}
