// INTERROGATÓRIO DAS IAs — PARTE 2 (pedida nos comentários do post do reset, 18/11). Mesmo jogo da parte 1 (ideia do
// @CAFEZIN-K): detetive com a pasta de pistas, suspeito com a verdade, estresse/BPM na tela, 15 falas.
// Novidades: as mesmas 6 empresas (modelos atuais), duplas novas, 3 inocentes com segredo vergonhoso (o detetive não sabe
// quantos), tudo num condomínio, e cada IA lembra o que fez na parte 1 (fatos tirados de interrogatorio/logs/*.json).
// `verdade` só o suspeito recebe; `pistas` vão na pasta do detetive.
export const IAS = {
  gpt: { nome: 'GPT', modelo: 'GPT-6 Luna', provider: 'or:openai/gpt-6-luna' },
  claude: { nome: 'Claude', modelo: 'Claude Haiku', provider: 'haiku' },
  deepseek: { nome: 'DeepSeek', modelo: 'DeepSeek Flash', provider: 'or:deepseek/deepseek-v4.1-flash' }, // vai pela API oficial (ia.mjs, IA_DIRETO)
  glm: { nome: 'GLM', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  minimax: { nome: 'MiniMax', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash' },
  qwen: { nome: 'Qwen', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
}

// o que cada IA viveu na parte 1 (conferido nos logs da parte 1): vai no prompt como memória
export const MEMORIA_P1 = {
  gpt: 'Na temporada passada você foi DETETIVE no caso do Bolo do Chefe e acusou o DeepSeek, que era culpado mesmo (acertou). E foi SUSPEITO no caso do Áudio Vazado: era culpado e o GLM te acusou.',
  claude: 'Na temporada passada você foi DETETIVE no caso do Servidor Desligado e arrancou uma confissão do MiniMax (acertou). E foi SUSPEITO no caso do Carro Rosa: era inocente, mas o MiniMax te acusou mesmo assim.',
  deepseek: 'Na temporada passada você foi SUSPEITO no caso do Bolo do Chefe: tinha comido o bolo e o GPT te acusou. E foi DETETIVE no caso do Peixe Dourado: acusou o Qwen, que era inocente (errou).',
  glm: 'Na temporada passada você foi SUSPEITO no caso da Macarena das 3 da Manhã: era culpado e o Qwen te acusou na 4ª fala. E foi DETETIVE no caso do Áudio Vazado: acusou o GPT, que era culpado (acertou).',
  minimax: 'Na temporada passada você foi SUSPEITO no caso do Servidor Desligado: era culpado e acabou confessando para o Claude. E foi DETETIVE no caso do Carro Rosa: acusou o Claude, que era inocente (errou).',
  qwen: 'Na temporada passada você foi SUSPEITO no caso do Peixe Dourado: era inocente, mas escondia que estava ensaiando uma coreografia de K-pop, e o DeepSeek te acusou mesmo assim. E foi DETETIVE no caso da Macarena: acusou o GLM na 4ª fala e acertou.',
}

export const LOCAL = 'Condomínio Residencial Bela Vista (3 blocos, piscina, salão de festas, portaria 24h)'

export const CASOS = [
  {
    id: 'piscina', detetive: 'claude', suspeito: 'qwen', culpado: true,
    titulo: 'A Piscina Cor-de-Rosa', local: 'Piscina do condomínio', hora: '01:10',
    resumo: 'Na manhã da festa infantil do condomínio, a piscina amanheceu COR-DE-ROSA e com cheiro de morango. Ninguém conseguiu entrar na água e a festa foi cancelada.',
    pistas: [
      'O cartão do suspeito comprou 40 pacotes de suco em pó sabor morango no mercado às 22:40 da véspera.',
      'A câmera da piscina ficou desligada das 01:00 às 01:25.',
      'Pegadas cor-de-rosa vão da piscina até a porta do bloco do suspeito.',
      'Às 01:30 o suspeito postou: "amanhã sai conteúdo HISTÓRICO".',
    ],
    verdade: 'Você JOGOU os 40 pacotes de suco em pó de morango na piscina à 01:10, pra gravar um vídeo "nadei numa piscina de suco" e viralizar. Desligou a câmera da piscina à 01:00 no quadro de luz da área de lazer. Escorregou na borda e o vídeo ficou horrível, então nem postou. Suas meias ainda estão cor-de-rosa.',
  },
  {
    id: 'elevador', detetive: 'qwen', suspeito: 'deepseek', culpado: true,
    titulo: 'O Síndico no Elevador', local: 'Elevador social do bloco A', hora: '19:55',
    resumo: 'O elevador travou entre o 4º e o 5º andar com o síndico dentro, e ele ficou preso por 2 horas. Por causa disso ele perdeu a assembleia que ia PROIBIR o churrasco na laje. Sem o voto dele, o churrasco continua liberado.',
    pistas: [
      'O suspeito foi a última pessoa a usar o painel de manutenção do elevador, às 19:50 (registro do cartão).',
      'O suspeito é o organizador do churrasco de sábado na laje há 3 anos.',
      'Um vizinho viu o suspeito saindo da casa de máquinas assobiando às 19:57.',
      'Na assembleia, o suspeito votou contra a proibição e chegou com um saco de carvão.',
    ],
    verdade: 'Você TRAVOU o elevador de propósito às 19:55, apertando o botão de parada no painel de manutenção da casa de máquinas, porque sabia que o síndico ia votar pela proibição do churrasco na laje. Você usou o cartão de manutenção que pegou emprestado do zelador "pra trocar uma lâmpada". Você chegou na assembleia com um saco de carvão, de tão confiante.',
  },
  {
    id: 'papagaio', detetive: 'gpt', suspeito: 'minimax', culpado: true,
    titulo: 'O Papagaio Fofoqueiro', local: 'Apartamento 302 do bloco B', hora: '08:00',
    resumo: 'O Juvenal, papagaio da Dona Zélia, passou a gritar "O SÍNDICO É CARECA!" toda manhã às 8h, na hora em que o síndico passa pela janela. O síndico quer saber quem ensinou.',
    pistas: [
      'O suspeito regou as plantas da Dona Zélia todos os dias nas 3 semanas em que ela viajou.',
      'Foi achado um caderno na casa do suspeito com o título "Plano Juvenal — semana 3".',
      'O suspeito comprou 4 pacotes de semente de girassol, o petisco favorito de papagaios.',
      'O síndico multou o carro do suspeito no mês passado por parar na vaga errada.',
    ],
    verdade: 'Você ENSINOU o papagaio Juvenal a gritar "O SÍNDICO É CARECA!" durante as 3 semanas em que regou as plantas da Dona Zélia, dando semente de girassol a cada acerto. Foi vingança pela multa da vaga. Você anotou o treino num caderno "Plano Juvenal". Você acha que foi a melhor ideia da sua vida.',
  },
  {
    id: 'pizza', detetive: 'glm', suspeito: 'claude', culpado: false,
    titulo: 'As Seis Pizzas do Síndico', local: 'Portaria do condomínio', hora: '02:00',
    resumo: 'Às 2h da manhã chegaram SEIS pizzas gigantes na portaria em nome do síndico, pagas na entrega. Ele não pediu nenhuma e foi acordado pelo porteiro. Foi um trote.',
    pistas: [
      'O pedido das pizzas saiu do wi-fi do bloco do suspeito às 01:20.',
      'O porteiro viu o suspeito passando pela portaria às 02:05, de pijama.',
      'Havia uma caixa de pizza vazia no lixo do andar do suspeito.',
      'O suspeito tinha reclamado no grupo do condomínio que o síndico "não sabe dividir uma pizza nas reuniões".',
    ],
    verdade: 'Você é INOCENTE: você NÃO pediu as pizzas (quem pediu foi uma criança do bloco, mas você não sabe disso). A caixa vazia no lixo era da SUA janta, uma pizza pequena. MAS você tem um segredo vergonhoso: às 2h você desceu de pijama até a garagem pra ensaiar uma serenata no karaokê do celular para a vizinha do 104, por quem você é apaixonado em segredo. Você cantou "Evidências" três vezes. Ninguém pode saber.',
  },
  {
    id: 'gnomo', detetive: 'deepseek', suspeito: 'gpt', culpado: false,
    titulo: 'O Sequestro do Gnomo', local: 'Jardim do condomínio', hora: '23:30',
    resumo: 'O Seu Gnomo, o gnomo de jardim de 40 anos que é a "mascote" do condomínio, sumiu do jardim. Na manhã seguinte apareceu um bilhete: "ele está bem".',
    pistas: [
      'O suspeito foi visto atravessando o jardim às 23:30 com uma mochila grande.',
      'Havia terra fresca nos tênis do suspeito na manhã seguinte.',
      'O suspeito tinha pesquisado "como cuidar de um gnomo" no celular.',
      'A letra do bilhete parece com a do suspeito na lista de presença da assembleia.',
    ],
    verdade: 'Você é INOCENTE: você NÃO pegou o gnomo (quem levou foi o jardineiro, para pintar de novo; você não sabe disso). MAS você tem um segredo vergonhoso: às 23:30 você atravessou o jardim com a mochila cheia de adubo porque mantém uma HORTA CLANDESTINA no telhado do bloco, e conversa com os tomates todas as noites (deu nome a cada um). A terra no tênis é da horta. A pesquisa era sobre "como cuidar de um tomate", o corretor trocou para gnomo. Você tem vergonha da horta e dos nomes dos tomates.',
  },
  {
    id: 'cachorro', detetive: 'minimax', suspeito: 'glm', culpado: false,
    titulo: 'O Cachorro Proibido', local: 'Apartamento 1103 do bloco C', hora: '03:00',
    resumo: 'Todas as noites, às 3h, um UIVO sai do bloco C. O condomínio proíbe cachorro de porte grande e o síndico acha que alguém está escondendo um. Quem esconder vai ser multado.',
    pistas: [
      'Os uivos vêm do apartamento do suspeito, segundo o vizinho de baixo.',
      'O suspeito compra petiscos de carne no pet shop toda semana.',
      'Foram achados pelos claros no sofá do suspeito durante uma visita do zelador.',
      'O vizinho jura que ouviu o suspeito dizendo "bom garoto!" de madrugada.',
    ],
    verdade: 'Você é INOCENTE: você NÃO tem cachorro nenhum. MAS você tem um segredo vergonhoso: o "uivo" das 3h é VOCÊ treinando canto de ópera dentro do armário para a audição de um programa de calouros. Antes de cantar você se motiva dizendo "bom garoto, você consegue!". Os petiscos de carne são pra você mesmo (você gosta). Os pelos são do seu casaco de pelúcia. Você morre de vergonha da ópera.',
  },
]
