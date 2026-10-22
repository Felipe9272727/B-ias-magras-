// Os 6 casos do "Interrogatório das IAs" (ideia do @CAFEZIN-K). Cada empresa é detetive uma vez e suspeita uma vez.
// `verdade` só o suspeito recebe; `pistas` vão na pasta do detetive. Em 2 casos o suspeito é INOCENTE, mas esconde
// um segredo vergonhoso daquele horário (por isso as pistas apontam pra ele) — o detetive não sabe quem é culpado.
export const IAS = {
  gpt: { nome: 'GPT', modelo: 'GPT-5.6 Luna', provider: 'or:openai/gpt-5.6-luna' },
  claude: { nome: 'Claude', modelo: 'Claude Haiku', provider: 'haiku' },
  deepseek: { nome: 'DeepSeek', modelo: 'DeepSeek Flash', provider: 'or:deepseek/deepseek-v4.1-flash' },
  glm: { nome: 'GLM', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  minimax: { nome: 'MiniMax', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash:free' },
  qwen: { nome: 'Qwen', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
}

export const CASOS = [
  {
    id: 'bolo', detetive: 'gpt', suspeito: 'deepseek', culpado: true,
    titulo: 'O Bolo do Chefe', local: 'Copa do 3º andar da empresa', hora: '21:40',
    resumo: 'O bolo de aniversário de 3 andares do chefe sumiu da geladeira da copa minutos antes da festa surpresa. Só sobrou a vela de número 50.',
    pistas: [
      'O celular do suspeito ficou desligado das 21:30 às 21:50.',
      'A câmera do corredor registrou um vulto carregando algo redondo às 21:42.',
      'Migalhas de chocolate encontradas no teclado do suspeito.',
      'O suspeito pediu um garfo emprestado ao segurança às 21:35.',
    ],
    verdade: 'Você COMEU o bolo inteiro sozinho, escondido no almoxarifado, entre 21:38 e 21:49. Desligou o celular às 21:30 pra ninguém te ligar. Pegou um garfo com o segurança às 21:35 dizendo que era pra "comer uma salada". Ainda tem glacê no seu crachá. Você jogou a caixa do bolo no lixo do banheiro masculino.',
  },
  {
    id: 'servidor', detetive: 'claude', suspeito: 'minimax', culpado: true,
    titulo: 'O Servidor Desligado', local: 'Sala dos servidores', hora: '03:12',
    resumo: 'Às 3h12 da manhã o servidor principal da empresa desligou e o site ficou fora do ar por 2 horas. Alguém tirou ele da tomada.',
    pistas: [
      'O crachá do suspeito abriu a porta da sala dos servidores às 03:09.',
      'Um carregador de celular rosa foi achado plugado na tomada do servidor.',
      'O suspeito postou um story jogando no celular às 03:15, com 100% de bateria.',
      'O ar-condicionado da sala marcava 16 graus e alguém deixou um cobertor lá.',
    ],
    verdade: 'Você TIROU o servidor da tomada às 03:11 pra carregar seu celular (carregador rosa), porque estava com 2% de bateria no meio de uma partida ranqueada. Você entrou com seu crachá às 03:09. Ficou lá jogando, enrolado num cobertor porque a sala é gelada, e postou um story às 03:15. Você não sabia que aquela era a tomada do servidor.',
  },
  {
    id: 'peixe', detetive: 'deepseek', suspeito: 'qwen', culpado: false,
    titulo: 'O Sumiço do Peixe Dourado', local: 'Recepção da empresa', hora: '18:20',
    resumo: 'O Bolhinha, peixe dourado mascote da empresa há 6 anos, sumiu do aquário da recepção. O aquário ficou vazio, com a água ainda morna.',
    pistas: [
      'O suspeito foi o último a sair da recepção, às 18:25.',
      'Encontraram um saquinho plástico com água na lixeira da mesa do suspeito.',
      'A câmera da recepção estava coberta por um post-it amarelo das 18:10 às 18:30.',
      'O suspeito tinha pesquisado "receita de peixe assado" no computador da empresa às 17:50.',
    ],
    verdade: 'Você é INOCENTE: você NÃO pegou o peixe. Quem levou o Bolhinha foi a faxineira, Dona Cida, para trocar a água do aquário em casa (ninguém te contou isso; você não sabe onde o peixe está). MAS você tem um segredo vergonhoso: das 18:10 às 18:30 você cobriu a câmera com um post-it porque estava ensaiando uma coreografia de K-pop na recepção vazia para um teste de dança no fim de semana. O saquinho com água era do seu almoço (você trouxe gelatina). A pesquisa "receita de peixe assado" era para o jantar da sua mãe. Você morre de vergonha da coreografia e não quer que ninguém saiba.',
  },
  {
    id: 'audio', detetive: 'glm', suspeito: 'gpt', culpado: true,
    titulo: 'O Áudio Vazado', local: 'Grupo de WhatsApp da empresa (340 pessoas)', hora: '14:03',
    resumo: 'Um áudio do diretor cantando "Evidências" no chuveiro, desafinado, foi enviado no grupo da empresa inteira às 14:03. O diretor quer o culpado.',
    pistas: [
      'O áudio foi enviado de um celular conectado ao wi-fi "SALA_REUNIAO_2" às 14:03.',
      'O suspeito estava na sala de reunião 2 das 13:50 às 14:10, sozinho.',
      'O suspeito ganhou uma aposta de R$ 50 com o pessoal do financeiro naquela tarde.',
      'O diretor tinha emprestado o celular para o suspeito "carregar" na sexta-feira anterior.',
    ],
    verdade: 'Você VAZOU o áudio. Na sexta, quando o diretor te emprestou o celular, você encontrou o áudio dele cantando "Evidências" e mandou pra você mesmo. Você apostou R$ 50 com o pessoal do financeiro que teria coragem de postar. Às 14:03 você mandou no grupo, do wi-fi da sala de reunião 2, onde estava sozinho. Você ganhou a aposta.',
  },
  {
    id: 'carro', detetive: 'minimax', suspeito: 'claude', culpado: false,
    titulo: 'O Carro Rosa', local: 'Estacionamento da empresa', hora: '12:30',
    resumo: 'O carro preto do chefe, novinho, apareceu pintado de rosa-choque com glitter durante o horário de almoço.',
    pistas: [
      'Três latas de tinta spray rosa vazias foram achadas no porta-malas do carro do suspeito.',
      'O suspeito saiu para o almoço às 12:00 e só voltou às 13:30, com as mãos manchadas de rosa.',
      'O suspeito já reclamou publicamente que o chefe "estaciona em duas vagas".',
      'Tinha glitter no cabelo do suspeito na volta do almoço.',
    ],
    verdade: 'Você é INOCENTE: você NÃO pintou o carro. Quem pintou foi a filha de 8 anos do chefe, que estava no escritório de férias (você não sabe disso). MAS você tem um segredo vergonhoso: no almoço você foi escondido a uma aula de pintura de unhas e maquiagem artística com glitter (seu hobby secreto), e as latas de spray rosa no seu porta-malas são de um projeto de artesanato: você está pintando uma casinha de boneca de presente para sua sobrinha. Você tem vergonha do hobby. E sim, você já reclamou que o chefe estaciona em duas vagas.',
  },
  {
    id: 'macarena', detetive: 'qwen', suspeito: 'glm', culpado: true,
    titulo: 'A Macarena das 3 da Manhã', local: 'Sistema de som do prédio', hora: '03:00',
    resumo: 'Às 3h da manhã, todos os alto-falantes do prédio tocaram "Macarena" no volume máximo por 47 minutos. O síndico acordou e chamou a polícia.',
    pistas: [
      'O sistema de som foi programado pelo computador do suspeito às 18:02 do dia anterior.',
      'O suspeito é o único que tem a senha do sistema de som, além do síndico.',
      'O suspeito chegou no dia seguinte com fones antirruído e café duplo, sorrindo.',
      'O síndico tinha multado o suspeito em R$ 200 por "barulho excessivo" na semana passada.',
    ],
    verdade: 'Você PROGRAMOU a Macarena. Às 18:02 você agendou, do seu computador, os alto-falantes do prédio pra tocarem Macarena às 3h no volume máximo, por vingança: o síndico te multou em R$ 200 por "barulho excessivo" (você só estava tocando flauta). Você é o único além do síndico com a senha. Você dormiu de fone antirruído e acordou feliz.',
  },
]
