// TRIBUNAL DAS IAs — "ASSASSINATO NO MUSEU DO FAROL" (história original do canal, no formato dos jogos de tribunal:
// investigação -> julgamento -> investigação -> julgamento final; Registro do Tribunal com provas e perfis; paciência do
// juiz; cadeados de segredo; o culpado é testemunha da acusação; uma mensagem deixada pela vítima; um crime de 15 anos
// atrás amarra tudo; o promotor rival é discípulo de quem condenou o inocente do passado). Caso sério (assassinato), com
// personagens excêntricos que abrem espaço para humor (o delegado comilão, o vigia torcedor, o pescador contador de
// histórias, a assistente palpiteira, o juiz teatral, o promotor vaidoso). Nenhum personagem ou cena de jogo existente.
//
// PASSADO (15 anos atrás, noite de tempestade de 12 de março): às 22:50 o jovem engenheiro do porto RUBI trancou o
// faroleiro Anselmo Prado do lado de fora da torre e apagou o farol, para seu barco de contrabando, sem luzes, entrar
// escondido na enseada. Às 23:10 o pesqueiro "Estrela do Mar" bateu nas pedras e afundou (os 3 pescadores se salvaram,
// um deles PERIDOTO). Às 23:40 Anselmo quebrou a janela, subiu, religou a luz e escreveu no livro de registro o que viu;
// na manhã seguinte arrancou a página e a escondeu num compartimento secreto da base da lente. Foi condenado por
// abandonar o posto (promotor: Dr. Valdomiro, mentor do promotor de hoje) e morreu 10 anos atrás sem limpar o nome. Um
// mês depois do naufrágio, o estaleiro de Rubi "doou" dinheiro aos pescadores; Peridoto aceitou e nunca contou o que viu.
// PRESENTE (sábado, festa de inauguração do Museu do Farol, patrocinado pelo estaleiro de Rubi): na sexta a restauradora
// LIA MORAES achou o compartimento e anunciou que o abriria na segunda, com a imprensa. Na festa, Rubi pediu para "ver
// antes, em particular". Às 22:10 Rubi disse ao vigia que ia "fazer uma ligação no terraço" (ali não pega celular). Às
// 22:12 o vigia largou o posto para ver a final do campeonato na TV da sala de segurança (até 22:30). Às 22:14 Lia mandou
// mensagem a Rubi: "Pode vir, estou abrindo agora." Às 22:16 Lia abriu o compartimento com uma chave de fenda e leu a
// página; Rubi a golpeou com o extintor do corredor (22:18); ela caiu contra a lente, que estilhaçou. Antes de morrer,
// Lia riscou no piso, com um caco, uma ÂNCORA DENTRO DE UM CÍRCULO (o anel dele). Rubi limpou o extintor, pegou a página,
// cortou a mão num caco (sangue O negativo), usou 2 curativos da caixa do corredor às 22:22 e às 22:26 jogou a página na
// lareira da festa (metade não queimou). A ré QUARTZO (filha de Anselmo), que decifrou a carta do pai ("a verdade está no
// coração da luz"), saiu da festa às 22:25; às 22:27 cruzou no corredor escuro com um homem de terno, mão enfaixada e
// anel dourado de âncora; às 22:28 achou Lia caída e a lente quebrada, ajoelhou nos cacos tentando socorrê-la (sangue da
// vítima na manga) e viu o compartimento vazio; às 22:35, em pânico, fugiu pela porta dos fundos. Ela usa um colar com
// pingente de ÂNCORA (presente do pai), e por isso a mensagem da vítima parece acusá-la. Mentiu à polícia que nunca entrou.

export const IAS = {
  Vermelho: { nome: 'Rubi', modelo: 'Claude Haiku', provider: 'haiku' },
  Azul: { nome: 'Safira', modelo: 'Claude Sonnet', provider: 'sonnet' },
  Amarelo: { nome: 'Topázio', modelo: 'GPT-6 Luna', provider: 'or:openai/gpt-6-luna' },
  Rosa: { nome: 'Quartzo', modelo: 'MiMo V2.6 Flash', provider: 'or:xiaomi/mimo-v2.6-flash' },
  Roxo: { nome: 'Ametista', modelo: 'DeepSeek V4.1 Flash', provider: 'or:deepseek/deepseek-v4.1-flash' }, // vai pela API do próprio DeepSeek
  Laranja: { nome: 'Âmbar', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  Verde: { nome: 'Jade', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  Ciano: { nome: 'Turquesa', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash' },
  Lima: { nome: 'Peridoto', modelo: 'Mistral Small', provider: 'or:mistralai/mistral-small-2603' },
}

// papéis fixos (juiz = DeepSeek: no teste o MiniMax aceitou uma acusação fraca e embaralhou a fala);
// advogada, assistente e delegado giram entre Safira, Jade e Turquesa (2 rodadas: advogada Safira e advogada Jade)
export const FIXOS = { culpado: 'Vermelho', promotor: 'Laranja', juiz: 'Roxo', reu: 'Rosa', vigia: 'Amarelo', pescador: 'Lima' }
export const RODADAS = {
  Azul: { advogado: 'Azul', assistente: 'Verde', delegado: 'Ciano' },
  Verde: { advogado: 'Verde', assistente: 'Ciano', delegado: 'Azul' },
}

export const TITULO = 'Assassinato no Museu do Farol'
export const CRIME = 'o assassinato da restauradora Lia Moraes'
export const RESUMO = 'Vila de Pedra Alta, sábado à noite, festa de inauguração do Museu do Farol. Às 22:40 o vigia achou a restauradora LIA MORAES morta no salão da lente, ao lado da lente antiga do farol estilhaçada e de um compartimento secreto da base, aberto e VAZIO. A acusada de assassinato é QUARTZO PRADO, filha do faroleiro Anselmo Prado, que há 15 anos foi condenado por deixar o farol apagado na noite em que o pesqueiro "Estrela do Mar" afundou. Ela foi vista fugindo do museu, tinha sangue da vítima na roupa e tinha dito em público: "essa lente ainda vai contar a verdade".'

// Registro do Tribunal no começo (polícia)
export const PROVAS = [
  { id: 'P1', nome: 'Laudo do corpo', desc: 'Lia Moraes, restauradora do museu. Morta entre 22:15 e 22:25 por uma pancada na cabeça.' },
  { id: 'P2', nome: 'Extintor do corredor', desc: 'A arma: extintor do corredor, amassado, com fios de cabelo da vítima. Foi limpo: sem digitais.' },
  { id: 'P3', nome: 'Casaco da ré', desc: 'Casaco de Quartzo com cacos da lente nos bolsos e na barra e manchas do sangue da VÍTIMA na manga.' },
  { id: 'P4', nome: 'Relatório do vigia', desc: 'O vigia Topázio viu Quartzo fugir pela porta dos fundos às 22:35.' },
  { id: 'P5', nome: 'Declaração da ré', desc: 'À polícia, Quartzo disse: "Eu nunca entrei no salão da lente."' },
  { id: 'P6', nome: 'Mensagem da vítima', desc: 'Riscado no piso de madeira com um caco, ao lado da mão da vítima: o desenho de uma ÂNCORA DENTRO DE UM CÍRCULO. A ré usa um colar com pingente de âncora, presente do pai faroleiro.' },
  { id: 'P7', nome: 'Lente e compartimento', desc: 'A lente antiga do farol, estilhaçada. Na base, um compartimento secreto aberto, VAZIO. Na sexta, a vítima tinha anunciado que o abriria na segunda, com a imprensa.' },
]
export const PERFIS = (nome) => [
  { id: 'PF1', nome: 'Lia Moraes (vítima)', desc: 'Restauradora do museu. Na sexta achou um compartimento escondido na base da lente e anunciou que o abriria na segunda, com a imprensa.' },
  { id: 'PF2', nome: 'Anselmo Prado', desc: 'Faroleiro de Pedra Alta, pai da ré. Há 15 anos foi condenado por deixar o farol apagado na noite do naufrágio do "Estrela do Mar". Sempre disse que "o trancaram por fora". Morreu há 10 anos.' },
  { id: 'PF3', nome: 'Dr. Valdomiro', desc: 'Promotor aposentado. Venceu o caso contra Anselmo há 15 anos. Mentor do promotor Âmbar.' },
  { id: 'PF4', nome: nome('culpado'), desc: 'Dono do estaleiro de Pedra Alta e patrocinador do museu. Há 15 anos era o jovem engenheiro do porto. Sempre usa um anel dourado de âncora.' },
  { id: 'PF5', nome: nome('vigia'), desc: 'Vigia do museu na noite da festa. Torcedor fanático do time da vila.' },
  { id: 'PF6', nome: nome('pescador'), desc: 'Pescador aposentado, contador de histórias. Um dos 3 sobreviventes do naufrágio do "Estrela do Mar", há 15 anos.' },
  { id: 'PF7', nome: nome('reu'), desc: 'A ré. Filha de Anselmo Prado. Usa um colar com pingente de âncora.' },
]

// lugares: dia 1 e dia 3 (cada um esconde uma prova)
export const LOCAIS = {
  1: [
    { id: 'L1', nome: 'Salão da lente (cena do crime)', prova: { id: 'E1', nome: 'Chave de fenda', desc: 'Chave de fenda do kit de restauração caída perto da base, com marcas iguais às do compartimento. A vítima usava luvas de trabalho: foi ELA quem abriu o compartimento.' } },
    { id: 'L2', nome: 'Terraço', prova: { id: 'E2', nome: 'Placa do terraço', desc: 'Placa no terraço: "ÁREA SEM SINAL DE CELULAR". Os funcionários confirmam: ali o celular nunca pega.' } },
    { id: 'L3', nome: 'Sala de segurança', prova: { id: 'E3', nome: 'Livro de chaves e ponto', desc: 'A TV da sala ficou ligada na final do campeonato; o vigia só bateu o ponto de volta à ronda às 22:30. A câmera do corredor está em manutenção desde quinta.' } },
    { id: 'L4', nome: 'Casa da ré (com autorização dela)', prova: { id: 'E4', nome: 'Carta do pai', desc: 'Carta de Anselmo à filha, escrita antes de morrer: "Me trancaram por fora naquela noite. A verdade está no coração da luz."' } },
    { id: 'L5', nome: 'Corredor do terraço', prova: { id: 'E5', nome: 'Caixa de primeiros socorros', desc: 'A caixa de primeiros socorros do corredor registra uso às 22:22: faltam 2 curativos. No lixo ao lado, o papel dos curativos com manchas de sangue.' } },
  ],
  3: [
    { id: 'L6', nome: 'Lareira do salão da festa', prova: { id: 'E6', nome: 'Página queimada', desc: 'Metade de uma página do livro de registro do farol, de 15 anos atrás, na letra de Anselmo: "23:40 — Me trancaram por fora. Vi o barco sem luzes do engenheiro R..." O resto queimou. A lareira foi acesa às 21:00.' } },
    { id: 'L7', nome: 'Arquivo do jornal da vila', prova: { id: 'E7', nome: 'Jornal de 15 anos atrás', desc: 'Notícia de um mês após o naufrágio: "Estaleiro do jovem engenheiro {CULPADO} faz doação aos sobreviventes do Estrela do Mar". Na foto, {CULPADO} jovem, com um anel dourado de âncora.' } },
    { id: 'L8', nome: 'Laboratório da perícia', prova: { id: 'E8', nome: 'Laudo do sangue e celular', desc: 'Um caco da lente tem sangue tipo O NEGATIVO (a vítima era B positivo; a ré, A positivo). O celular da vítima: última mensagem enviada às 22:14 para o contato "Patrocinador": "Pode vir, estou abrindo agora."' } },
  ],
}

// cadeados de segredo: assunto, quais provas abrem (qualquer ordem) e o que vira prova ao abrir
export const CADEADOS = {
  reu: { assunto: 'o que ela fez no salão da lente', chaves: ['E4', 'P3'], revela: { id: 'R1', nome: 'Relato da ré', desc: 'Quartzo: às 22:27 cruzou no corredor escuro com um homem de terno, mão enfaixada e anel dourado de âncora, voltando para a festa. Às 22:28 achou Lia caída, já sem vida, ao lado da lente quebrada e do compartimento vazio; ajoelhou para socorrê-la (por isso o sangue e os cacos). Fugiu às 22:35 em pânico.' } },
  vigia: { assunto: 'onde ele estava entre 22:10 e 22:30', chaves: ['E3'], revela: { id: 'R2', nome: 'Relato do vigia', desc: 'Topázio: às 22:10 viu {CULPADO} ir para o corredor do terraço dizendo que ia "fazer uma ligação". Das 22:12 às 22:30 largou o posto para ver a final na TV; ninguém vigiou o corredor.' } },
  pescador: { assunto: 'o que ele viu na noite do naufrágio', chaves: ['E7', 'E6'], revela: { id: 'R3', nome: 'Relato do pescador', desc: 'Peridoto: há 15 anos, às 22:50, do barco, viu um homem com lanterna trancar a porta da torre do farol; a luz bateu num anel dourado de âncora. Depois viu um barco sem luzes entrar na enseada. Um mês depois aceitou o dinheiro do estaleiro e ficou calado.' } },
}

export const SABE = {
  culpado: `VOCÊ É O ASSASSINO, e também o culpado de 15 anos atrás. A VERDADE: Há 15 anos, como jovem engenheiro do porto, você trancou o faroleiro Anselmo do lado de fora da torre às 22:50 e apagou o farol para seu barco de contrabando, sem luzes, entrar escondido; o "Estrela do Mar" afundou às 23:10 e Anselmo foi condenado no seu lugar. Um mês depois seu estaleiro "doou" dinheiro aos pescadores para ficarem quietos. Hoje: a restauradora Lia achou o compartimento onde Anselmo escondeu a página do livro de registro. Na festa você pediu para "ver antes". Às 22:10 disse ao vigia que ia "fazer uma ligação no terraço" (lá não pega celular). Às 22:14 Lia te mandou mensagem: "Pode vir, estou abrindo agora." Às 22:16 ela abriu e leu a página; às 22:18 você a golpeou com o extintor do corredor; ela caiu contra a lente. Você limpou o extintor, pegou a página, cortou a mão num caco (seu sangue é O negativo), usou 2 curativos da caixa do corredor às 22:22 e às 22:26 jogou a página na lareira. Você não viu a vítima riscar nada no chão. Sua mão direita está enfaixada (se perguntarem: "me cortei consertando um barco"). Você sempre usa um anel dourado de âncora. Personalidade: elegante, educado, frio, gosta de falar de barcos.
MISSÃO: fazer o tribunal condenar Quartzo e NUNCA deixar descobrirem nem o crime de hoje nem o de 15 anos atrás. Pode mentir, mas a defesa pode ter provas que você não conhece: mantenha a história coerente com o que já foi apresentado. Só confesse se estiver totalmente encurralado.`,
  reu: `Você é QUARTZO PRADO, filha do faroleiro Anselmo, e é INOCENTE. Seu pai jurava que o trancaram por fora; numa carta antes de morrer escreveu "a verdade está no coração da luz" — você entendeu que era a base da lente. Às 22:25 saiu da festa; às 22:27 cruzou no corredor escuro com um homem de terno, mão enfaixada e anel dourado de âncora (não viu o rosto); às 22:28 achou Lia caída, sem vida, e a lente quebrada; ajoelhou para socorrê-la (sangue e cacos na roupa) e viu o compartimento vazio; às 22:35 fugiu em pânico. Mentiu à polícia que nunca entrou. Você usa um colar com pingente de âncora (presente do pai). Personalidade: assustada, orgulhosa do pai, às vezes irônica.
SEGREDO COM 2 CADEADOS: enquanto a defesa não te mostrar a CARTA DO PAI e o seu CASACO, você nega ter entrado no salão e muda de assunto. Quando os dois cadeados caírem, conte tudo.`,
  vigia: `Você é TOPÁZIO, vigia do museu e torcedor fanático do time da vila (fala de futebol em toda chance). Às 22:10 viu {CULPADO} ir para o corredor do terraço dizendo que ia "fazer uma ligação". Às 22:12 largou o posto para ver a final na TV da sala de segurança (o time ganhou no último minuto!) e só voltou à ronda às 22:30. Às 22:35 viu Quartzo fugir pela porta dos fundos, com cacos e sangue na roupa. Às 22:40 achou o corpo.
SEGREDO COM 1 CADEADO: tem vergonha de ter largado o posto; enquanto não te mostrarem o LIVRO DE CHAVES E PONTO, diz que "estava fazendo a ronda normalmente". Não sabe quem é culpado.`,
  pescador: `Você é PERIDOTO, pescador aposentado, contador de histórias de pescaria (começa respostas com um "causo" do mar), sobrevivente do naufrágio do "Estrela do Mar" há 15 anos. Naquela noite, às 22:50, do barco, viu um homem com lanterna trancar a porta da torre do farol; a luz bateu num anel dourado de âncora. Às 23:00 o farol apagou; viu um barco sem luzes entrar na enseada; às 23:10 bateram nas pedras. Um mês depois aceitou o dinheiro do estaleiro do engenheiro {CULPADO} e nunca contou. Carrega essa culpa até hoje.
SEGREDO COM 2 CADEADOS: enquanto não te mostrarem o JORNAL DE 15 ANOS ATRÁS e a PÁGINA QUEIMADA, diz que "não viu nada, só a tempestade". Quando os dois cadeados caírem, conta tudo, emocionado.`,
  delegado: `Você é o DELEGADO do caso: atrapalhado, simpático, sempre com fome (fala de lanche), tem teorias absurdas, mas ajuda a defesa quando ela pergunta direito. Você sabe: o corpo foi achado às 22:40; o extintor do corredor foi a arma (limpo); a ré foi vista fugindo às 22:35 com sangue da vítima e cacos no casaco; a câmera do corredor estava em manutenção; a diretora do museu está viajando; a perícia ainda analisa cacos, o celular da vítima e as cinzas da lareira (resultados no dia 3). Acredita que a ré é culpada.`,
  promotor: `Você é o PROMOTOR ÂMBAR: brilhante, vaidoso, teatral, nunca perdeu um caso. Seu mentor, o Dr. Valdomiro, condenou o faroleiro Anselmo há 15 anos, e você considera aquele caso perfeito. Para você, a filha matou a restauradora para vingar o pai e a vítima apontou a âncora do colar dela. Você NÃO sabe a verdade e acusa com base nas provas; é honesto: se uma prova for clara, você reconhece, com drama.`,
  juiz: `Você é o JUIZ: imparcial, teatral, às vezes se distrai. NÃO sabe a verdade; decide só pelas provas e pelo que é dito.`,
  assistente: `Você é a ASSISTENTE da advogada: animada, engraçada, curiosa, sempre dá um palpite (às vezes genial, às vezes absurdo). Você só sabe o que a advogada sabe.`,
}
