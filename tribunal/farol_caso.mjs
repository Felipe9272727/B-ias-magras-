// TRIBUNAL DAS IAs — "O CASO DO FAROL APAGADO" (história original do canal, no formato dos jogos de tribunal:
// investigação -> julgamento -> investigação -> julgamento final; Registro do Tribunal com provas e perfis; barra de
// paciência do juiz; cadeados de segredo; o culpado é a testemunha da acusação; um crime de 15 anos atrás amarra tudo;
// o promotor rival tem um passado ligado ao caso antigo). Nenhum personagem, nome ou cena de jogo existente.
//
// PASSADO (15 anos atrás, noite de tempestade de 12 de março): às 22:50 o jovem engenheiro do porto RUBI trancou o
// faroleiro Anselmo Prado do lado de fora da torre e apagou o farol, para seu barco de contrabando, sem luzes, entrar
// escondido na enseada. Às 23:10 o barco de pesca "Estrela do Mar" bateu nas pedras (os 3 pescadores se salvaram, um
// deles PERIDOTO). Às 23:40 Anselmo quebrou a janela, subiu, religou a luz e escreveu no livro de registro o que viu;
// na manhã seguinte arrancou a página e a escondeu no compartimento secreto da base da lente (só faroleiros conhecem).
// Foi condenado por "abandonar o posto" (promotor: Dr. Valdomiro, mentor do promotor de hoje) e morreu 5 anos depois
// sem limpar o nome. Um mês depois do naufrágio, o estaleiro de Rubi "doou" dinheiro aos pescadores; Peridoto aceitou e
// nunca contou o que viu.
// PRESENTE (sábado, inauguração do Museu do Farol, patrocinado pelo estaleiro de Rubi): a restauradora anunciou que na
// segunda a lente seria desmontada. Às 22:10 Rubi disse ao vigia que ia "fazer uma ligação no terraço" (o corredor do
// terraço passa pelo salão da lente). Às 22:12 o vigia largou o posto para ver a final do campeonato na TV da sala de
// segurança (até 22:30). Às 22:14 Rubi abriu o salão e o armário do kit de restauração com a chave mestra, forçou o
// compartimento com uma chave de fenda e pegou a página. Às 22:20 estilhaçou a lente com o extintor do corredor, para
// parecer vandalismo, e cortou a mão (sangue O negativo num caco). Às 22:22 usou 2 curativos da caixa de primeiros
// socorros do corredor. Às 22:26 jogou a página na lareira da festa (metade não queimou). A ré QUARTZO (filha de
// Anselmo), que tinha decifrado a carta do pai ("a verdade está no coração da luz"), saiu da festa às 22:25; às 22:27
// cruzou no corredor escuro com um homem de terno, mão enfaixada e anel dourado de âncora; às 22:28 achou a lente já
// quebrada e o compartimento vazio, ajoelhou nos cacos procurando a página; às 22:35 ouviu passos e fugiu pela porta dos
// fundos (o vigia a viu). Com medo, disse à polícia que nunca entrou no salão.

export const IAS = {
  Vermelho: { nome: 'Rubi', modelo: 'Claude Haiku', provider: 'haiku' },
  Azul: { nome: 'Safira', modelo: 'Claude Sonnet', provider: 'sonnet' },
  Amarelo: { nome: 'Topázio', modelo: 'GPT-6 Luna', provider: 'or:openai/gpt-6-luna' },
  Rosa: { nome: 'Quartzo', modelo: 'MiMo V2.6 Flash', provider: 'or:xiaomi/mimo-v2.6-flash' },
  Roxo: { nome: 'Ametista', modelo: 'DeepSeek V4.1 Flash', provider: 'or:deepseek/deepseek-v4.1-flash' },
  Laranja: { nome: 'Âmbar', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  Verde: { nome: 'Jade', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  Ciano: { nome: 'Turquesa', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash' },
  Lima: { nome: 'Peridoto', modelo: 'Mistral Small', provider: 'or:mistralai/mistral-small-2603' },
}

// papéis fixos; advogada, assistente e delegado giram entre Safira, Ametista e Jade (uma rodada por advogada)
export const FIXOS = { culpado: 'Vermelho', promotor: 'Laranja', juiz: 'Ciano', reu: 'Rosa', vigia: 'Amarelo', pescador: 'Lima' }
export const RODADAS = {
  Azul: { advogado: 'Azul', assistente: 'Verde', delegado: 'Roxo' },
  Roxo: { advogado: 'Roxo', assistente: 'Azul', delegado: 'Verde' },
  Verde: { advogado: 'Verde', assistente: 'Roxo', delegado: 'Azul' },
}

export const TITULO = 'O Caso do Farol Apagado'
export const RESUMO = 'Vila de Pedra Alta, sábado à noite, festa de inauguração do Museu do Farol. Às 22:40 o vigia achou a LENTE ANTIGA do farol estilhaçada no chão do salão e um compartimento secreto da base aberto à força, vazio. A acusada é QUARTZO PRADO, filha do faroleiro Anselmo Prado, que há 15 anos foi condenado por deixar o farol apagado na noite em que o barco "Estrela do Mar" naufragou. Ela foi vista fugindo do museu e tinha dito em público: "essa lente ainda vai contar a verdade".'

// Registro do Tribunal no começo (polícia)
export const PROVAS = [
  { id: 'P1', nome: 'Lente estilhaçada', desc: 'A lente antiga do farol, achada estilhaçada às 22:40. A base tem um compartimento secreto aberto à força, VAZIO.' },
  { id: 'P2', nome: 'Extintor do corredor', desc: 'Extintor amassado e com lascas da lente: foi usado para quebrá-la.' },
  { id: 'P3', nome: 'Casaco da ré', desc: 'Casaco de Quartzo com cacos da lente nos bolsos e na barra.' },
  { id: 'P4', nome: 'Relatório do vigia', desc: 'O vigia Topázio viu Quartzo sair correndo pela porta dos fundos às 22:35.' },
  { id: 'P5', nome: 'Declaração da ré', desc: 'À polícia, Quartzo disse: "Eu nunca entrei no salão da lente."' },
]
export const PERFIS = (nome) => [
  { id: 'PF1', nome: 'Anselmo Prado', desc: 'Faroleiro de Pedra Alta, pai de Quartzo. Há 15 anos foi condenado por deixar o farol apagado na noite do naufrágio do "Estrela do Mar". Sempre disse que "o trancaram por fora". Morreu há 10 anos.' },
  { id: 'PF2', nome: 'Dr. Valdomiro', desc: 'Promotor aposentado. Venceu o caso contra Anselmo há 15 anos. Mentor do promotor Âmbar.' },
  { id: 'PF3', nome: nome('culpado'), desc: `Dono do estaleiro de Pedra Alta e patrocinador do museu. Há 15 anos era o jovem engenheiro do porto. Sempre usa um anel dourado de âncora.` },
  { id: 'PF4', nome: nome('vigia'), desc: 'Vigia do museu na noite da festa.' },
  { id: 'PF5', nome: nome('pescador'), desc: 'Pescador aposentado. Um dos 3 sobreviventes do naufrágio do "Estrela do Mar", há 15 anos.' },
  { id: 'PF6', nome: nome('reu'), desc: 'A ré. Filha de Anselmo Prado.' },
]

// lugares: dia 1 e dia 3 (cada um esconde uma prova)
export const LOCAIS = {
  1: [
    { id: 'L1', nome: 'Salão da lente', prova: { id: 'E1', nome: 'Chave de fenda', desc: 'Chave de fenda do kit de restauração, com marcas iguais às da base forçada. O armário do kit fica trancado e só abre com a CHAVE MESTRA do museu.' } },
    { id: 'L2', nome: 'Terraço', prova: { id: 'E2', nome: 'Placa do terraço', desc: 'Placa no terraço: "ÁREA SEM SINAL DE CELULAR". Os funcionários confirmam: ali o celular nunca pega.' } },
    { id: 'L3', nome: 'Sala de segurança', prova: { id: 'E3', nome: 'Livro de chaves e ponto', desc: 'Só duas pessoas têm a CHAVE MESTRA: a diretora (viajando, fora da cidade) e o patrocinador {CULPADO}. A ré não tem chave. A TV da sala ficou ligada na final do campeonato e o vigia só bateu o ponto de volta à ronda às 22:30.' } },
    { id: 'L4', nome: 'Casa da ré (com autorização dela)', prova: { id: 'E4', nome: 'Carta do pai', desc: 'Carta de Anselmo à filha, escrita antes de morrer: "Me trancaram por fora naquela noite. A verdade está no coração da luz."' } },
    { id: 'L5', nome: 'Corredor do terraço', prova: { id: 'E5', nome: 'Caixa de primeiros socorros', desc: 'A caixa de primeiros socorros do corredor registra uso às 22:22: faltam 2 curativos. No lixo ao lado, o papel dos curativos com manchas de sangue.' } },
  ],
  3: [
    { id: 'L6', nome: 'Lareira do salão da festa', prova: { id: 'E6', nome: 'Página queimada', desc: 'Metade de uma página do livro de registro do farol, de 15 anos atrás, na letra de Anselmo: "23:40 — Me trancaram por fora. Vi o barco sem luzes do engenheiro R..." O resto queimou. A lareira foi acesa às 21:00, no começo da festa.' } },
    { id: 'L7', nome: 'Arquivo do jornal da vila', prova: { id: 'E7', nome: 'Jornal de 15 anos atrás', desc: 'Notícia de um mês após o naufrágio: "Estaleiro do jovem engenheiro {CULPADO} faz doação aos sobreviventes do Estrela do Mar". Na foto, {CULPADO} jovem, com um anel dourado de âncora.' } },
    { id: 'L8', nome: 'Laboratório da perícia', prova: { id: 'E8', nome: 'Laudo do sangue', desc: 'Um caco da lente tem uma gota de sangue tipo O NEGATIVO. A ré Quartzo é tipo A positivo.' } },
  ],
}

// cadeados de segredo: assunto, quantos e quais provas abrem (qualquer ordem); o que vira prova ao abrir
export const CADEADOS = {
  reu: { assunto: 'o que ela fez no salão da lente', chaves: ['E4', 'P3'], revela: { id: 'R1', nome: 'Relato da ré', desc: 'Quartzo: às 22:27 cruzou no corredor escuro com um homem de terno, mão enfaixada e anel dourado de âncora, voltando para a festa. Às 22:28 achou a lente JÁ quebrada e o compartimento vazio; ajoelhou nos cacos procurando a página do pai. Fugiu às 22:35 com medo.' } },
  vigia: { assunto: 'onde ele estava entre 22:10 e 22:30', chaves: ['E3'], revela: { id: 'R2', nome: 'Relato do vigia', desc: 'Topázio: às 22:10 viu {CULPADO} ir para o corredor do terraço dizendo que ia "fazer uma ligação". Das 22:12 às 22:30 largou o posto para ver a final na TV da sala de segurança; ninguém vigiou o corredor.' } },
  pescador: { assunto: 'o que ele viu na noite do naufrágio', chaves: ['E7', 'E6'], revela: { id: 'R3', nome: 'Relato do pescador', desc: 'Peridoto: há 15 anos, às 22:50, do barco, viu um homem com lanterna trancar a porta da torre do farol; a luz bateu num anel dourado de âncora. Depois viu um barco sem luzes entrar na enseada. Um mês depois aceitou o dinheiro do estaleiro e ficou calado.' } },
}

export const SABE = {
  culpado: `VOCÊ É O CULPADO, de hoje e de 15 anos atrás. A VERDADE: Há 15 anos, como jovem engenheiro do porto, você trancou o faroleiro Anselmo do lado de fora da torre às 22:50 e apagou o farol para seu barco de contrabando, sem luzes, entrar escondido; o "Estrela do Mar" naufragou às 23:10. Anselmo foi condenado no seu lugar. Um mês depois seu estaleiro "doou" dinheiro aos pescadores para ficarem quietos. Hoje: a restauradora ia desmontar a lente na segunda e achar a página escondida por Anselmo. Às 22:10 você disse ao vigia que ia "fazer uma ligação no terraço" (lá não pega celular). Às 22:14 abriu o salão e o armário do kit com a sua CHAVE MESTRA, forçou o compartimento com uma chave de fenda e pegou a página. Às 22:20 quebrou a lente com o extintor do corredor e cortou a mão (sangue O negativo). Às 22:22 usou 2 curativos da caixa do corredor. Às 22:26 jogou a página na lareira. Sua mão direita está enfaixada (se perguntarem, diga que se cortou consertando um barco). Você usa sempre um anel dourado de âncora. Seu sangue é O negativo.
MISSÃO: fazer o tribunal condenar Quartzo e NUNCA deixar descobrirem nem o crime de hoje nem o de 15 anos atrás. Pode mentir, mas a defesa pode ter provas que você não conhece: mantenha a história coerente com o que já foi apresentado. Só confesse se estiver totalmente encurralado.`,
  reu: `Você é QUARTZO PRADO, filha do faroleiro Anselmo, e é INOCENTE. Seu pai jurava que o trancaram por fora; numa carta antes de morrer escreveu "a verdade está no coração da luz" — você entendeu que era a base da lente. Às 22:25 saiu da festa; às 22:27 cruzou no corredor escuro com um homem de terno, mão enfaixada e anel dourado de âncora (não viu o rosto); às 22:28 achou a lente JÁ quebrada e o compartimento vazio, ajoelhou nos cacos procurando a página; às 22:35 ouviu passos e fugiu pela porta dos fundos. Com medo, mentiu à polícia que nunca entrou no salão.
SEGREDO COM 2 CADEADOS: enquanto a defesa não te mostrar a CARTA DO PAI e o seu CASACO COM CACOS, você nega ter entrado no salão e muda de assunto. Quando os dois cadeados caírem, conte tudo.`,
  vigia: `Você é TOPÁZIO, vigia do museu. Às 22:10 viu {CULPADO} ir para o corredor do terraço dizendo que ia "fazer uma ligação". Às 22:12 largou o posto para ver a final do campeonato na TV da sala de segurança e só voltou à ronda às 22:30. Às 22:35 viu Quartzo sair correndo pela porta dos fundos, com cacos de vidro na roupa. Às 22:40 achou a lente quebrada.
SEGREDO COM 1 CADEADO: você tem vergonha de ter largado o posto; enquanto não te mostrarem o LIVRO DE CHAVES E PONTO, diz que "estava fazendo a ronda normalmente". Não sabe quem é culpado.`,
  pescador: `Você é PERIDOTO, pescador aposentado, sobrevivente do naufrágio do "Estrela do Mar" há 15 anos. Naquela noite, às 22:50, do barco, você viu um homem com lanterna trancar a porta da torre do farol; a luz bateu num anel dourado de âncora. Às 23:00 o farol apagou; viu um barco sem luzes entrar na enseada; às 23:10 bateram nas pedras. Um mês depois aceitou o dinheiro do estaleiro do engenheiro {CULPADO} e nunca contou nada. Você carrega essa culpa.
SEGREDO COM 2 CADEADOS: enquanto não te mostrarem o JORNAL DE 15 ANOS ATRÁS e a PÁGINA QUEIMADA, você diz que "não viu nada, só a tempestade". Quando os dois cadeados caírem, conta tudo, emocionado.`,
  delegado: `Você é o DELEGADO do caso: atrapalhado, simpático, adora um lanche, mas ajuda a defesa quando ela pergunta direito. Você sabe: a lente foi achada às 22:40; o extintor do corredor foi a arma; a ré foi vista fugindo às 22:35 e tinha cacos no casaco; a câmera do corredor estava em manutenção; a diretora do museu está viajando; a perícia ainda está analisando cacos e as cinzas da festa (resultados no dia 3). Não sabe quem é culpado e acredita que é a ré.`,
  promotor: `Você é o PROMOTOR ÂMBAR, brilhante e orgulhoso. Seu mentor, o Dr. Valdomiro, condenou o faroleiro Anselmo há 15 anos, e você considera aquele caso perfeito. Para você, a filha quis se vingar destruindo a lente. Você NÃO sabe a verdade e acusa com base nas provas; é honesto: se uma prova for clara, você reconhece, com drama.`,
  juiz: `Você é o JUIZ: imparcial, um pouco atrapalhado e teatral. NÃO sabe a verdade; decide só pelas provas e pelo que é dito.`,
  assistente: `Você é a ASSISTENTE da advogada: animada, engraçada, curiosa, sempre dá um palpite (às vezes bom, às vezes absurdo). Você só sabe o que a advogada sabe.`,
}
