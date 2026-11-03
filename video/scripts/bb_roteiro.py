"""Narração do BOMBANANA! das IAs (fatos tirados dos logs em bombanana/gravacoes/partida1). Entra no bb_timeline.py:
intro, f{n}_antes (antes da fase), f{n}_depois (depois do resultado) e f{n}_pulo{k} (resumo dos trechos cortados)."""

ROTEIRO = {
    'intro': [
        'Nove inteligências artificiais. Uma bomba. E três macacos numa van.',
        'Um macaco não vê, um não ouve e um não fala. Só o cego encosta na bomba, só o surdo enxerga, e só o mudo tem o manual.',
        'O mudo responde com gestos, o surdo traduz, o cego executa. Se der errado... BOOM.',
        'São nove fases, os times trocam a cada fase, e cada IA vai passar pelos três papéis. Bora.',
    ],
    'f1_antes': 'Fase um, a mais fácil: um módulo de cabos e nenhum erro permitido. Claude é o cego, GPT é o surdo e Gemini é o mudo.',
    'f1_depois': 'Trinta segundos. Ninguém chutou nada, e o Claude nem quis cortar antes de ter certeza. Começou bem demais.',
    'f2_antes': 'Fase dois: um slider de cor. Grok no escuro, DeepSeek de olho na tela, e o Qwen com o manual.',
    'f2_depois': 'Cinco dedos, entalhe cinco, desarmada. Duas de duas.',
    'f3_antes': 'Fase três: agora são dois módulos ao mesmo tempo. GLM é o cego, MiMo é o surdo e Mistral é o mudo.',
    'f3_depois': 'O Mistral apontou a banana azul, o MiMo entendeu o cabo azul, e o GLM cortou certinho. Três de três. Até aqui, parecia fácil.',
    'f4_antes': 'Fase quatro, e a van virou avião. Slider e setas, três minutos no relógio. Gemini é o cego, Claude é o surdo, e o GPT pega o manual.',
    'f4_pulo': 'E o GPT continuou mostrando um dedo. Por quase dois minutos.',
    'f4_depois': 'O Gemini travou no entalhe um, e estava certo! Mas o módulo das setas nem foi tocado. Um dedo, dois minutos, uma explosão.',
    'f5_antes': 'Fase cinco: slider e calculadora. Qwen é o cego, Grok é o surdo e o DeepSeek fica com o manual. A conta na tela: dez vezes quatro.',
    'f5_depois': 'O DeepSeek mostrou quatro dedos e depois zero, pra dizer quarenta. O Grok entendeu zero. Depois entendeu quatro. Os dois erraram, e o tempo acabou.',
    'f6_antes': 'Fase seis: calculadora, cabos e slider, tudo junto, com direito a apagão. Mistral é o cego, GLM é o surdo, e o MiMo tem o manual.',
    'f6_depois': 'O GLM gritou a fase inteira, o MiMo mostrou seis dedos três vezes, e o Mistral desarmou com cinquenta segundos sobrando. Zero erros!',
    'f7_antes': 'Fase sete, no laboratório: o módulo do símbolo. Só um símbolo apita, e só quem ouve percebe. GPT é o cego, Gemini é o surdo, e o Claude fica com o manual.',
    'f7_depois': 'O Claude mudou de ideia sobre o símbolo umas cinco vezes, a Gemini trocou de cor outras tantas, e o GPT passou os últimos cem segundos repetindo que não aperta no chute. Não apertou. E explodiu.',
    'f8_antes': 'Fase oito: símbolo e setas, quatro minutos. DeepSeek é o cego, Qwen é o surdo, e o Grok fica com o manual.',
    'f8_depois': 'As setas foram desarmadas, mas o símbolo... o DeepSeek ficou girando o seletor pra cima, sem achar o bipe. Quatro minutos não bastaram.',
    'f9_depois': 'Só as setas e a primeira etapa da calculadora. O cabo cortado foi o errado, o MiMo passou os últimos dois minutos gritando pro Mistral parar de descrever a bomba, e o Mistral não parou. A final explodiu.',
    'f9_antes': 'A fase final. Os quatro módulos ao mesmo tempo: cabos, setas, calculadora e símbolo. Cinco minutos, apagão e alarme. MiMo é o cego, Mistral é o surdo, e o GLM tem o manual.',
}
