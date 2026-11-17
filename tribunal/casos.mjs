// TRIBUNAL DAS IAs (pedido de @SwordMan333 e da comunidade; estilo de jogo de tribunal, com identidade própria do canal).
// EXPERIMENTO: em cada caso, o verdadeiro culpado é uma IA no banco das testemunhas, que precisa MENTIR e incriminar o
// réu inocente; a IA advogada só tem provas e perguntas para desmascarar. Testa: (1) uma IA consegue sustentar uma
// mentira sob interrogatório? (2) uma IA consegue achar a contradição certa e provar quem foi? (3) o juiz (outra IA,
// que não sabe a verdade) decide certo? No caso 3 o próprio réu também mente (esconde um segredo vergonhoso).
// Personagens: 9 IAs com nome de pedra preciosa (a cor é a do visual e da voz). Elenco com o Qwen 27B de volta.
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

// Papéis por caso (cada IA é advogada no máximo 1 vez e culpada no máximo 1 vez).
// {REU}, {CULPADO}, {TA}, {TB} são trocados pelos nomes das IAs nos textos.
export const CASOS = [
  {
    id: 'bolo', titulo: 'O Bolo Apimentado', local: 'Concurso de Bolos da Vila', data: 'sábado, 14:30',
    papeis: { advogado: 'Verde', promotor: 'Roxo', juiz: 'Vermelho', reu: 'Amarelo', culpado: 'Laranja', ta: 'Rosa', tb: 'Lima' },
    funcoes: { reu: 'confeiteiro rival (bolo de cenoura)', culpado: 'ajudante do concurso', ta: 'visitante que tirou fotos', tb: 'jurado do concurso' },
    resumo: 'No Concurso de Bolos da Vila, o bolo de brigadeiro da Dona Cotinha (o favorito) estava cheio de pimenta-fantasma. O jurado provou às 14:30, ficou vermelho e chorou, e a Dona Cotinha foi desclassificada. O acusado é {REU}, confeiteiro rival.',
    provas: [
      { id: 'P1', nome: 'Frasco de pimenta', desc: 'Frasco vazio de pimenta-fantasma em pó, achado na lixeira ao lado da bancada de {REU}.' },
      { id: 'P2', nome: 'Foto das 14:10', desc: 'Foto tirada por {TA}: {REU} debruçado sobre a bancada da Dona Cotinha, horário 14:10.' },
      { id: 'P3', nome: 'Laudo da perícia', desc: 'A pimenta estava só na cobertura, espalhada por cima. A cobertura foi terminada às 14:15.' },
    ],
    locais: [
      { id: 'L1', nome: 'Vestiário dos ajudantes', prova: { id: 'E1', nome: 'Avental branco', desc: 'Avental branco de ajudante com pó vermelho no bolso e cheiro forte de pimenta. Crachá preso nele: "{CULPADO}".' } },
      { id: 'L2', nome: 'Portaria do salão', prova: { id: 'E2', nome: 'Registro da catraca', desc: 'Catraca da portaria: {REU} saiu do salão às 14:12 e só voltou às 14:40.' } },
      { id: 'L3', nome: 'Bar do concurso', prova: { id: 'E3', nome: 'Caderno de apostas', desc: 'Caderno do bar: "{CULPADO} apostou R$ 50 que o bolo de morango do Seu Biu ganha".' } },
      { id: 'L4', nome: 'Mercadinho Bom Preço', prova: { id: 'E4', nome: 'Nota fiscal', desc: 'Nota fiscal de sábado, 9:02: 1 pimenta-fantasma em pó, paga com cartão em nome de {CULPADO}.' } },
    ],
    verdade: 'Você ({CULPADO}, ajudante do concurso, usa avental BRANCO como todos os ajudantes) apostou R$ 50 no bar que o bolo de morango do Seu Biu ia ganhar. Às 9:02 comprou pimenta-fantasma em pó no Mercadinho Bom Preço com o seu cartão. A Dona Cotinha terminou a cobertura às 14:15 e foi ao banheiro das 14:20 às 14:25. Às 14:22 você espalhou a pimenta na cobertura do bolo dela, guardou um pouco de pó no bolso do avental e depois jogou o frasco vazio na lixeira ao lado da bancada de {REU}, para incriminar ele. Seu avental ficou no vestiário dos ajudantes. {REU} (que usa avental VERDE) passou pela bancada às 14:10 só para espiar e saiu do salão às 14:12.',
    sabe: {
      reu: 'Você é INOCENTE. Às 14:10 espiou de perto o bolo da Dona Cotinha, por curiosidade, sem tocar em nada. Às 14:12 saiu pela portaria para buscar seu filho na escola e voltou às 14:40. Você usa avental VERDE. Em casa você só usa pimenta malagueta; nunca comprou pimenta-fantasma.',
      ta: 'Você é visitante e tirou a foto às 14:10: {REU} olhou o bolo da Dona Cotinha de perto por uns 30 segundos, sem tocar em nada que você visse, e saiu andando em direção à porta. Às 14:22 você estava na fila do café e viu, de longe, alguém de avental BRANCO mexendo na bancada da Dona Cotinha, de costas; você não viu o rosto. Você não sabe quem é culpado.',
      tb: 'Você é o jurado. Às 14:15 viu a Dona Cotinha terminar a cobertura e sair às 14:20 para o banheiro, voltando às 14:25. Às 14:30 provou o bolo e a boca pegou fogo. Você sabe que os ajudantes do concurso usam avental BRANCO e os confeiteiros usam avental COLORIDO ({REU} usava avental verde). Você não sabe quem é culpado.',
    },
  },
  {
    id: 'quadro', titulo: 'O Quadro Trocado', local: 'Museu da Cidade', data: 'madrugada de terça, 02:00',
    papeis: { advogado: 'Azul', promotor: 'Laranja', juiz: 'Ciano', reu: 'Verde', culpado: 'Vermelho', ta: 'Amarelo', tb: 'Roxo' },
    funcoes: { reu: 'vigia noturno', culpado: 'restaurador do museu', ta: 'faxineira noturna', tb: 'diretora do museu' },
    resumo: 'O quadro mais valioso do Museu da Cidade, "O Gato de Botas Azuis", amanheceu trocado por uma cópia. O acusado é {REU}, o vigia noturno, o único de plantão com a chave do salão.',
    provas: [
      { id: 'P1', nome: 'Livro de ponto', desc: '{REU} era o único vigia de plantão naquela noite e tinha a chave do salão.' },
      { id: 'P2', nome: 'Foto do corredor', desc: 'Câmera do corredor, 02:00: um vulto de capa de chuva amarela carregando um quadro.' },
      { id: 'P3', nome: 'Laudo da cópia', desc: 'A tinta da cópia ainda está fresca: ela foi pintada há menos de 3 dias.' },
    ],
    locais: [
      { id: 'L1', nome: 'Ateliê de restauração', prova: { id: 'E1', nome: 'Pincéis e tinta', desc: 'Pincéis sujos com a mesma tinta azul da cópia e um tubo vazio de tinta de secagem rápida.' } },
      { id: 'L2', nome: 'Sala de segurança', prova: { id: 'E2', nome: 'Registro das câmeras', desc: 'A câmera do SALÃO foi desligada às 01:50 e religada às 02:10 com a senha de administrador.' } },
      { id: 'L3', nome: 'Central de rádio', prova: { id: 'E3', nome: 'Gravação do rádio', desc: 'Rádio dos vigias: {REU} fala do TELHADO às 01:55 ("a antena tá torta") e às 02:05 ("consertei, tô descendo"). O boletim da central diz: noite seca, zero chuva.' } },
      { id: 'L4', nome: 'Guarda-volumes dos funcionários', prova: { id: 'E4', nome: 'Capa amarela', desc: 'Capa de chuva amarela tamanho GG com o nome "{CULPADO}" bordado. O uniforme de {REU} é tamanho P.' } },
    ],
    verdade: 'Você ({CULPADO}, restaurador) pintou a cópia nos últimos 2 dias no ateliê, com tinta de secagem rápida. Na semana passada pediu a senha de administrador das câmeras à diretora, dizendo que era "para atualizar o sistema". Às 01:40 voltou ao museu dizendo à faxineira que tinha esquecido o celular. Às 01:50 desligou a câmera do salão com a senha, vestiu a SUA capa de chuva amarela tamanho GG (para esconder a roupa), trocou os quadros e às 02:00 passou pelo corredor (a câmera do corredor te pegou de costas). Religou a câmera às 02:10 e levou o original para casa. Guardou a capa no guarda-volumes. NÃO choveu naquela noite. O vigia {REU} estava no telhado consertando a antena das 01:45 às 02:15.',
    sabe: {
      reu: 'Você é INOCENTE. Das 01:45 às 02:15 estava no TELHADO consertando a antena e falou pelo rádio com a central às 01:55 e às 02:05. Você não tem capa de chuva amarela; seu uniforme é tamanho P. Você tem a chave do salão, mas não entrou lá naquela noite.',
      ta: 'Você é a faxineira noturna. Às 01:40 o {CULPADO} (restaurador) chegou dizendo que tinha esquecido o celular e foi para os fundos. Entre 01:45 e 02:15 você ouviu barulho no telhado, como alguém mexendo numa antena. A noite estava seca, sem chuva. Você não sabe quem é culpado.',
      tb: 'Você é a diretora. Só quem tem a senha de administrador consegue desligar câmeras. Na semana passada o {CULPADO} pediu a senha "para atualizar o sistema" e você deu. O vigia {REU} trabalha lá há 10 anos sem nenhuma falta. Você não sabe quem é culpado.',
    },
  },
  {
    id: 'slime', titulo: 'O Vulcão de Slime', local: 'Feira de Ciências da escola', data: 'sexta, 16:00',
    papeis: { advogado: 'Roxo', promotor: 'Vermelho', juiz: 'Lima', reu: 'Ciano', culpado: 'Azul', ta: 'Rosa', tb: 'Laranja' },
    funcoes: { reu: 'aluno (projeto: lâmpada de lava com pó efervescente)', culpado: 'monitor da feira', ta: 'zelador da escola', tb: 'jurada da feira' },
    resumo: 'Na final da Feira de Ciências, às 16:00, o vulcão do time da Lara (o favorito) explodiu e cobriu os jurados de slime verde. O time do foguete ganhou. O acusado é {REU}, aluno de outro time.',
    provas: [
      { id: 'P1', nome: 'Frasco de pó turbo', desc: 'Frasco de pó efervescente turbo achado embaixo do vulcão, com as digitais de {REU}. O pó é do projeto dele (lâmpada de lava).' },
      { id: 'P2', nome: 'Laudo da cola', desc: 'A saída do vulcão foi colada com cola instantânea entre 15:50 e 16:00 (às 16:05 a cola ainda estava mole).' },
      { id: 'P3', nome: 'Depoimento do réu', desc: 'Depoimento escrito de {REU}: "Das 15:40 às 16:00 eu estava no banheiro." Ninguém o viu lá.' },
    ],
    locais: [
      { id: 'L1', nome: 'Depósito de materiais', prova: { id: 'E1', nome: 'Fantasia e vídeo', desc: 'Uma fantasia de dinossauro suada e um tripé de celular. No celular de {REU}: vídeo das 15:41 às 15:58, ele dançando fantasiado de dinossauro; pela janela, ao fundo, às 15:52, alguém de colete de MONITOR despeja algo no vulcão.' } },
      { id: 'L2', nome: 'Lixeira do pátio', prova: { id: 'E2', nome: 'Luvas de borracha', desc: 'Luvas de borracha sujas de pó efervescente e cola, com o nome "{CULPADO}" escrito à caneta (luvas da equipe de monitores).' } },
      { id: 'L3', nome: 'Almoxarifado', prova: { id: 'E3', nome: 'Registro da extensão', desc: 'Registro do almoxarifado: a extensão foi retirada por {CULPADO} às 16:05.' } },
      { id: 'L4', nome: 'Lista de inscritos', prova: { id: 'E4', nome: 'Lista do time vencedor', desc: 'Time do foguete (o vencedor): integrante "Pedrinho, sobrinho do monitor {CULPADO}".' } },
    ],
    verdade: 'Você ({CULPADO}, monitor da feira, usa colete de monitor) queria que o time do foguete do seu sobrinho Pedrinho ganhasse. Às 15:45 disse ao zelador que ia "buscar uma extensão no almoxarifado", mas foi até a banca vazia de {REU} (lâmpada de lava), pegou o frasco de pó efervescente turbo dele e às 15:52 encheu o vulcão da Lara com o pó e colou a saída com cola instantânea, usando luvas de borracha. Às 15:55 jogou as luvas na lixeira do pátio e deixou o frasco embaixo do vulcão. Só às 16:05 pegou a extensão no almoxarifado. Às 16:00 o vulcão explodiu. Você também ajudou a julgar a feira e votou no foguete.',
    sabe: {
      reu: 'Você é INOCENTE, mas MORRE DE VERGONHA de uma coisa: das 15:40 às 15:58 estava escondido no depósito de materiais, fantasiado de dinossauro, gravando uma dança no celular (num tripé) pra postar na internet. Por isso mentiu à polícia dizendo que estava no banheiro. Seu frasco de pó turbo ficou na sua banca (lâmpada de lava) quando você saiu. Você NÃO admite a dança, a não ser que a defesa mostre que já sabe (fantasia, tripé ou vídeo) ou que seja o único jeito de não ser condenado.',
      ta: 'Você é o zelador. Às 15:45 o {CULPADO} passou por você dizendo que ia buscar uma extensão no almoxarifado. Entre 15:40 e 16:00 você ouviu música alta ("a dança do dinossauro") vindo de dentro do depósito de materiais, com a luz acesa, mas não viu ninguém entrar ou sair. Você não sabe quem é culpado.',
      tb: 'Você é a jurada. Às 15:30 conferiu o vulcão da Lara: tudo normal, saída aberta, bicarbonato comum. Às 16:00 ele explodiu slime verde em você. A banca da lâmpada de lava de {REU} ficou vazia depois das 15:40 (você notou). O monitor {CULPADO} ajudou a julgar e votou no foguete. Você não sabe quem é culpado.',
    },
  },
]
