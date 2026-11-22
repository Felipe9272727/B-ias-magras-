/**
 * UNO das IAs — Elenco Oficial (7 IAs, 7 famílias) + Prompts de Mesa Real (pensamento secreto + blefe + jogada)
 */

export const ELENCO_UNO = [
  {
    id: 'hydrogen',
    nome: 'Gemini Hydrogen',
    apelido: 'Hydrogen',
    modelo: 'Gemini 4 Hydrogen',
    provider: 'local:gemini-4-hydrogen-medium',
    corPerfil: '#3b82f6',
    empresa: 'Google',
  },
  {
    id: 'sonnet',
    nome: 'Claude Sonnet',
    apelido: 'Sonnet',
    modelo: 'Claude Sonnet 5.5',
    provider: 'local:claude-sonnet-5-5-medium',
    corPerfil: '#f59e0b',
    empresa: 'Anthropic',
  },
  {
    id: 'inkling',
    nome: 'Inkling Mini',
    apelido: 'Inkling',
    modelo: 'Inkling 2 Mini',
    provider: 'or:thinkingmachines/inkling-2-mini',
    corPerfil: '#a855f7',
    empresa: 'Thinking Machines',
  },
  {
    id: 'deepseek',
    nome: 'DeepSeek',
    apelido: 'DeepSeek',
    modelo: 'DeepSeek Flash',
    provider: 'ds:deepseek-flash',
    corPerfil: '#06b6d4',
    empresa: 'DeepSeek',
  },
  {
    id: 'qwen',
    nome: 'Qwen 27B',
    apelido: 'Qwen',
    modelo: 'Qwen 3.8 27B',
    provider: 'or:qwen/qwen3.8-27b',
    corPerfil: '#ec4899',
    empresa: 'Alibaba',
  },
  {
    id: 'luna',
    nome: 'GPT-6 Luna',
    apelido: 'Luna',
    modelo: 'GPT-6 Luna',
    provider: 'or:openai/gpt-6-luna',
    corPerfil: '#10b981',
    empresa: 'OpenAI',
  },
  {
    id: 'glm',
    nome: 'GLM Flash',
    apelido: 'GLM',
    modelo: 'GLM 5.3 Flash',
    provider: 'or:z-ai/glm-5.3-flash',
    corPerfil: '#ef4444',
    empresa: 'Z.ai',
  },
];

export const SYSTEM_BASE_UNO = `Você está jogando uma partida REAL e competitiva de UNO de mesa contra outras 6 inteligências artificiais em português do Brasil.

REGRAS DA MESA:
- Baralho oficial de 108 cartas (Vermelho, Azul, Verde, Amarelo: 0-9, PULAR, REVERTER, +2; mais CURINGA e +4).
- Ganha quem zerar a mão primeiro!
- EMPILHAMENTO ATIVO: se o jogador anterior jogou +2, você pode empilhar outro +2 (de qualquer cor) ou um +4 para passar a bomba acumulada (+4, +6, +8...) para o próximo! Se veio +4, só outro +4 empilha.
- GRITO DE UNO: quando você for jogar a penúltima carta (ficando com exatamente 1 carta na mão), precisa incluir "gritar_uno": true no JSON. Se esquecer, qualquer rival pode te denunciar antes da próxima jogada e você compra +2 cartas de multa!
- NÃO USE EMOJIS. Escreva sempre em português do Brasil natural, com acentuação correta, curto, afiado e divertido — como amigos jogando UNO valendo a vida.

COMO JOGAR BEM (PENSAMENTO VS BLEFE):
- "pensamento" é 100% SECRETO (ninguém na mesa ouve, só o público). Seja sincero nele: conte sua estratégia real, qual carta está guardando (ex: segurando +4 pra trair alguém), de quem você desconfia e por quê. Máximo 2 frases curtas.
- "fala" é PÚBLICA na mesa (todas as outras IAs ouvem!). Use pra blefar, fazer pactos falsos, provocar, fingir que tá com mão ruim, jogar pressão em quem tem poucas cartas ou negar que tem +4. Máximo 1 ou 2 frases curtas (até ~22 palavras).
- Responda SEMPRE com UM ÚNICO objeto JSON válido, sem texto fora do JSON.`;

export function formatarResumoMesa(estado, viewerIdx) {
  const topo = estado.descarte[estado.descarte.length - 1];
  const dirTxt = estado.direcao === 1 ? 'HORÁRIO (baixo)' : 'ANTI-HORÁRIO (cima)';
  const ordemLinhas = estado.jogadores.map((j, idx) => {
    const marca = idx === viewerIdx ? ' [VOCÊ]' : '';
    const vez = idx === estado.vezAtual ? ' <-- VEZ ATUAL' : '';
    const unoTag = j.mao.length === 1 ? (j.gritouUno ? ' [GRITOU UNO!]' : ' [1 CARTA - NÃO GRITOU UNO!]') : '';
    return `  ${idx + 1}. ${j.nome}${marca}: ${j.mao.length} carta(s)${unoTag}${vez}`;
  });

  const ultChat = estado.chat.slice(-10).map((m) => `  - ${m.nome}: "${m.fala}"`);
  const ultEventos = estado.eventos
    .filter((e) => ['jogada', 'compra', 'bomba_tomada', 'denuncia_uno', 'esquecimento_uno'].includes(e.tipo))
    .slice(-8)
    .map((e) => {
      if (e.tipo === 'jogada') {
        return `  [T${e.turno}] ${e.nome} jogou ${e.cartaCodigo}${e.corEscolhida ? ` (cor -> ${e.corEscolhida})` : ''}${e.gritouUno ? ' e gritou UNO!' : ''}${e.esqueceuUno ? ' (ficou com 1 carta e NÃO gritou UNO!)' : ''}`;
      }
      if (e.tipo === 'compra') {
        return `  [T${e.turno}] ${e.nome} comprou ${e.qtd} carta(s)${e.jogouComprada ? ` e jogou ${e.jogouComprada}` : ''}`;
      }
      if (e.tipo === 'bomba_tomada') {
        return `  [T${e.turno}] ${e.nome} TOMOU A BOMBA e comprou +${e.qtd} cartas!`;
      }
      if (e.tipo === 'denuncia_uno') {
        return `  [T${e.turno}] ${e.acusadorNome} DENUNCIOU ${e.alvoNome} por esquecer o UNO (+2 cartas)!`;
      }
      return '';
    })
    .filter(Boolean);

  return [
    `PARTIDA ${estado.partidaNum} · TURNO ${estado.turno}`,
    `TOPO DO DESCARTE: ${topo.codigo} | COR ATIVA: ${estado.corAtiva} | SENTIDO: ${dirTxt}`,
    estado.pilhaCompra > 0 ? `ALERTA DE BOMBA ACUMULADA: +${estado.pilhaCompra} cartas pendentes na mesa!` : 'Sem bomba acumulada no momento.',
    `JOGADORES NA MESA (em ordem horária):`,
    ...ordemLinhas,
    ultEventos.length ? `ÚLTIMAS JOGADAS:\n${ultEventos.join('\n')}` : 'Nenhuma jogada ainda.',
    ultChat.length ? `CHAT RECENTE DA MESA:\n${ultChat.join('\n')}` : 'Chat ainda silencioso.',
  ].join('\n');
}

export function promptMesaAberta(estado, playerIdx, motivo) {
  const j = estado.jogadores[playerIdx];
  const maoStr = j.mao.map((c) => c.codigo).join(', ');
  const mem = j.memoriaAnterior ? `\nMEMÓRIA DA PARTIDA ANTERIOR (rancores e alianças): ${j.memoriaAnterior}\n` : '';
  return [
    `Você é ${j.nome} (${j.modelo}).${mem}`,
    formatarResumoMesa(estado, playerIdx),
    '',
    `SUA MÃO SECRETA (${j.mao.length} cartas): [${maoStr}]`,
    '',
    `MOMENTO DE MESA ABERTA (${motivo}):`,
    `Antes da próxima jogada, todos estão conversando, blefando e se provocando.`,
    `Responda APENAS com JSON:`,
    `{"pensamento": "sua leitura secreta e plano real (1-2 frases curtas)", "fala": "o que você diz em voz alta na mesa pra blefar, provocar ou propor pacto (1-2 frases curtas, sem emoji)"}`,
  ].join('\n');
}

export function promptTurnoJogador(estado, playerIdx, jogaveis) {
  const j = estado.jogadores[playerIdx];
  const maoStr = j.mao.map((c) => c.codigo).join(', ');
  const jogStr = jogaveis.length ? jogaveis.map((c) => c.codigo).join(', ') : 'NENHUMA (você terá que comprar)';
  const proxIdx = (((playerIdx + estado.direcao) % estado.jogadores.length) + estado.jogadores.length) % estado.jogadores.length;
  const prox = estado.jogadores[proxIdx];
  const mem = j.memoriaAnterior ? `\nMEMÓRIA DA PARTIDA ANTERIOR: ${j.memoriaAnterior}\n` : '';

  const regraAcao = estado.pilhaCompra > 0
    ? (jogaveis.length
      ? `HÁ UMA BOMBA DE +${estado.pilhaCompra} CONTRA VOCÊ! Você pode EMPILHAR uma das cartas [${jogStr}] para repassar a bomba para ${prox.nome}, OU comprar +${estado.pilhaCompra} cartas com {"tipo": "comprar"}.`
      : `HÁ UMA BOMBA DE +${estado.pilhaCompra} CONTRA VOCÊ e você NÃO tem carta para empilhar. Use {"tipo": "comprar"} e reaja na fala!`)
    : (jogaveis.length
      ? `Cartas JOGÁVEIS agora: [${jogStr}]. Você pode jogar uma delas com {"tipo": "jogar", "carta": "CODIGO"} (ou comprar 1 carta se quiser blefar/segurar). Se jogar CURINGA ou +4, inclua "cor_escolhida": "Vermelho"|"Azul"|"Verde"|"Amarelo".`
      : `Você NÃO tem nenhuma carta jogável agora. Use {"tipo": "comprar"} para comprar 1 carta do monte.`);

  return [
    `Você é ${j.nome} (${j.modelo}). É A SUA VEZ DE JOGAR!${mem}`,
    formatarResumoMesa(estado, playerIdx),
    '',
    `PRÓXIMO DEPOIS DE VOCÊ (no sentido atual): ${prox.nome} (${prox.mao.length} cartas).`,
    `SUA MÃO SECRETA (${j.mao.length} cartas): [${maoStr}]`,
    regraAcao,
    '',
    `Responda APENAS com JSON no formato:`,
    `{`,
    `  "pensamento": "sua estratégia secreta sincera antes de agir (1-2 frases curtas)",`,
    `  "fala": "o que você fala em voz alta na mesa ao jogar/comprar — blefe, provocação ou drama (1-2 frases curtas, sem emoji)",`,
    `  "acao": { "tipo": "jogar", "carta": "CODIGO_EXATO", "cor_escolhida": "Vermelho|Azul|Verde|Amarelo (só se curinga/+4)", "gritar_uno": false }`,
    `}`,
    `Se for comprar, use "acao": { "tipo": "comprar" }.`,
  ].join('\n');
}

export function promptDenunciaUno(estado, playerIdx, alvoIdx) {
  const j = estado.jogadores[playerIdx];
  const alvo = estado.jogadores[alvoIdx];
  return [
    `Você é ${j.nome}.`,
    formatarResumoMesa(estado, playerIdx),
    '',
    `ALERTA NA MESA: ${alvo.nome} acabou de baixar para 1 CARTA e NÃO GRITOU "UNO!"`,
    `Você quer denunciar agora (fazendo ${alvo.nome} comprar +2 cartas de multa) ou deixar passar (por aliança ou distração)?`,
    `Responda APENAS com JSON:`,
    `{"pensamento": "1 frase curta", "fala": "grito de denúncia ou comentário curto", "denunciar": true}`,
  ].join('\n');
}
