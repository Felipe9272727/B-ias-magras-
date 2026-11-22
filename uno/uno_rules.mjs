/**
 * UNO das IAs — Motor puro e determinístico de regras oficiais + empilhamento + denúncia de UNO!
 *
 * Baralho oficial de 108 cartas:
 *  - 4 cores: V (Vermelho), A (Azul), G (Verde), Y (Amarelo)
 *  - Por cor: um 0, dois 1..9, dois PULAR, dois REVERTER, dois +2 (25 × 4 = 100)
 *  - Curingas: quatro CORINGA (W) e quatro +4 (W+4) (8)
 *
 * Regras de mesa (iguais a um UNO de verdade):
 *  - Empilhamento: +2 pode empilhar +2 ou +4; +4 só pode empilhar outro +4.
 *  - Grito de UNO!: ao jogar a penúltima carta (ficando com 1), o jogador precisa declarar gritar_uno: true.
 *    Se esquecer, fica vulnerável até o próximo jogador concluir o turno — qualquer rival pode DENUNCIAR e aplicar +2 cartas!
 *  - Compra: se comprar 1 carta (sem pilha pendente) e ela for jogável, o motor permite decidir jogar na hora ou passar (ou joga se já indicado).
 *  - Reembaralhamento automático: se o monte de compra acabar, recicla o descarte mantendo o topo.
 */

export const CORES = ['Vermelho', 'Azul', 'Verde', 'Amarelo'];
export const COR_SIGLA = {
  Vermelho: 'V',
  Azul: 'A',
  Verde: 'G',
  Amarelo: 'Y',
};
export const SIGLA_COR = {
  V: 'Vermelho',
  A: 'Azul',
  G: 'Verde',
  Y: 'Amarelo',
  R: 'Vermelho',
  B: 'Azul',
};

export const COR_HEX = {
  Vermelho: '#ef4444',
  Azul: '#3b82f6',
  Verde: '#22c55e',
  Amarelo: '#eab308',
  Curinga: '#1e1b4b',
};

// Mulberry32 deterministic PRNG so every game seed is 100% reproducible
export function makeRng(seed) {
  let a = (Number(seed) >>> 0) || 1;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function criarBaralho(seed = 42) {
  const deck = [];
  let seq = 1;
  for (const cor of CORES) {
    const s = COR_SIGLA[cor];
    deck.push({ id: `${s}0_${seq++}`, cor, valor: '0', codigo: `${s}-0`, tipo: 'numero' });
    for (const num of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      deck.push({ id: `${s}${num}_${seq++}`, cor, valor: num, codigo: `${s}-${num}`, tipo: 'numero' });
      deck.push({ id: `${s}${num}_${seq++}`, cor, valor: num, codigo: `${s}-${num}`, tipo: 'numero' });
    }
    for (const ac of ['PULAR', 'REVERTER', '+2']) {
      deck.push({ id: `${s}${ac}_${seq++}`, cor, valor: ac, codigo: `${s}-${ac}`, tipo: 'acao' });
      deck.push({ id: `${s}${ac}_${seq++}`, cor, valor: ac, codigo: `${s}-${ac}`, tipo: 'acao' });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `W_${seq++}`, cor: 'Curinga', valor: 'CURINGA', codigo: 'CURINGA', tipo: 'curinga' });
    deck.push({ id: `W4_${seq++}`, cor: 'Curinga', valor: '+4', codigo: '+4', tipo: 'curinga' });
  }
  return shuffle(deck, makeRng(seed));
}

export function labelCarta(c) {
  if (!c) return '?';
  if (c.cor === 'Curinga') return c.valor === '+4' ? '+4 (Curinga)' : 'Curinga (Troca Cor)';
  return `${c.cor} ${c.valor}`;
}

export function normalizarCor(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s.startsWith('verm') || s === 'red' || s === 'v' || s === 'r') return 'Vermelho';
  if (s.startsWith('azu') || s === 'blue' || s === 'a' || s === 'b') return 'Azul';
  if (s.startsWith('verd') || s === 'green' || s === 'g') return 'Verde';
  if (s.startsWith('amar') || s === 'yellow' || s === 'y') return 'Amarelo';
  return null;
}

/**
 * Verifica se uma carta pode ser jogada no estado atual da mesa.
 * - Se existe pilhaCompra > 0:
 *    - Se topo eh +2: pode empilhar +2 (qualquer cor) ou +4
 *    - Se topo eh +4: so pode empilhar outro +4
 * - Caso normal: mesma corAtiva, mesmo valor do topo, ou Curinga/+4.
 */
export function cartaJogavel(carta, { topo, corAtiva, pilhaCompra = 0 }) {
  if (!carta) return false;
  if (pilhaCompra > 0) {
    if (topo.valor === '+2') return carta.valor === '+2' || carta.valor === '+4';
    if (topo.valor === '+4') return carta.valor === '+4';
    return false;
  }
  if (carta.cor === 'Curinga') return true;
  if (carta.cor === corAtiva) return true;
  if (carta.valor === topo.valor) return true;
  return false;
}

export function listarJogaveis(mao, mesa) {
  return mao.filter((c) => cartaJogavel(c, mesa));
}

/**
 * Resolve uma escolha de carta vinda da IA (aceita id exato, codigo "V-+2", label "Vermelho +2", ou indice 1-based).
 */
export function resolverCartaNaMao(mao, rawCarta, mesa) {
  if (rawCarta === null || rawCarta === undefined) return null;
  const jogaveis = listarJogaveis(mao, mesa);
  const s = String(rawCarta).trim();
  const sNorm = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Exact id match
  let found = jogaveis.find((c) => c.id === s);
  if (found) return found;

  // 2. Exact code match (e.g. "V-7", "A-+2", "+4", "CURINGA")
  found = jogaveis.find((c) => c.codigo.toLowerCase() === sNorm);
  if (found) return found;

  // 3. Label match (e.g. "Vermelho +2", "Azul PULAR", "+4 (Curinga)")
  found = jogaveis.find((c) => {
    const lbl = labelCarta(c).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lbl === sNorm || sNorm === `${c.cor.toLowerCase()} ${c.valor.toLowerCase()}`;
  });
  if (found) return found;

  // 4. Loose match on color + value tokens
  if (sNorm.includes('+4') || sNorm.includes('mais 4') || sNorm.includes('mais4')) {
    found = jogaveis.find((c) => c.valor === '+4');
    if (found) return found;
  }
  if (sNorm.includes('curinga') || sNorm.includes('coringa') || sNorm.includes('wild')) {
    found = jogaveis.find((c) => c.valor === 'CURINGA') || jogaveis.find((c) => c.valor === '+4');
    if (found) return found;
  }

  for (const cor of CORES) {
    const cn = cor.toLowerCase();
    if (sNorm.includes(cn)) {
      const rest = sNorm.replace(cn, '').replace(/[-_:]/g, ' ').trim();
      found = jogaveis.find((c) => {
        if (c.cor !== cor) return false;
        const vn = c.valor.toLowerCase();
        if (rest === vn) return true;
        if (vn === 'pular' && (rest.includes('pul') || rest.includes('bloq') || rest.includes('skip'))) return true;
        if (vn === 'reverter' && (rest.includes('rev') || rest.includes('inv'))) return true;
        if (vn === '+2' && (rest.includes('+2') || rest.includes('mais 2') || rest.includes('mais2'))) return true;
        return false;
      });
      if (found) return found;
    }
  }

  // 5. Numeric index into jogaveis or mao (only if string is pure "#1" or "carta 1")
  const mIdx = sNorm.match(/^(?:#|carta\s*)(\d+)$/);
  if (mIdx) {
    const idx = Number(mIdx[1]) - 1;
    if (idx >= 0 && idx < mao.length && cartaJogavel(mao[idx], mesa)) return mao[idx];
  }

  return null;
}

export function reciclarSeNecessario(estado) {
  if (estado.baralho.length > 0) return;
  if (estado.descarte.length <= 1) return;
  const topo = estado.descarte[estado.descarte.length - 1];
  const resto = estado.descarte.slice(0, -1);
  estado.baralho = shuffle(resto, makeRng((estado.seed ^ (estado.turno * 2654435761)) >>> 0));
  estado.descarte = [topo];
  estado.eventos.push({
    tipo: 'reembaralhar',
    turno: estado.turno,
    cartasRecicladas: estado.baralho.length,
  });
}

export function comprarCartas(estado, playerIdx, qtd) {
  const compradas = [];
  for (let i = 0; i < qtd; i++) {
    reciclarSeNecessario(estado);
    if (estado.baralho.length === 0) break;
    const c = estado.baralho.pop();
    estado.jogadores[playerIdx].mao.push(c);
    compradas.push(c);
  }
  return compradas;
}

export function proximoIndice(atual, direcao, total, passos = 1) {
  return (((atual + direcao * passos) % total) + total) % total;
}

export function iniciarEstadoPartida({ partidaNum, seed, elenco, memorias = {} }) {
  const baralho = criarBaralho(seed);
  const jogadores = elenco.map((e, idx) => ({
    idx,
    id: e.id,
    nome: e.nome,
    modelo: e.modelo,
    provider: e.provider,
    corPerfil: e.corPerfil,
    mao: [],
    gritouUno: false,
    vulneravelUno: false,
    estatisticas: {
      cartasJogadas: 0,
      cartasCompradas: 0,
      maisDoisJogados: 0,
      maisQuatroJogados: 0,
      esquecimentosUno: 0,
      denunciasFeitas: 0,
      blefesChat: 0,
      maxCartasMao: 7,
      vezesTomouBomba: 0,
      maiorBombaTomada: 0,
    },
    memoriaAnterior: memorias[e.id] || '',
  }));

  // 7 cartas iniciais para cada jogador
  for (let r = 0; r < 7; r++) {
    for (const j of jogadores) {
      j.mao.push(baralho.pop());
    }
  }

  // Primeira carta do descarte: sempre uma carta numerica para comecar limpo
  let idxNum = baralho.findIndex((c) => c.tipo === 'numero');
  if (idxNum < 0) idxNum = baralho.length - 1;
  const [primeira] = baralho.splice(idxNum, 1);

  return {
    versao: 'uno-v1',
    partidaNum,
    seed,
    status: 'em_andamento',
    turno: 0,
    direcao: 1, // 1 = horario, -1 = anti-horario
    vezAtual: (partidaNum - 1) % jogadores.length,
    corAtiva: primeira.cor,
    pilhaCompra: 0,
    baralho,
    descarte: [primeira],
    jogadores,
    chat: [], // historico publico de falas na mesa
    eventos: [
      {
        tipo: 'inicio_partida',
        partidaNum,
        seed,
        primeiraCarta: primeira,
        corAtiva: primeira.cor,
        maosIniciais: jogadores.map((j) => ({ id: j.id, mao: j.mao.map((c) => c.codigo) })),
      },
    ],
    vencedor: null,
    motivoFim: null,
    mesaAbertaFeita: false,
    ultimaMesaAbertaTurno: -10,
    custoUsd: 0,
    custoPorProvider: {},
  };
}

export function melhorCorParaMao(mao) {
  const counts = { Vermelho: 0, Azul: 0, Verde: 0, Amarelo: 0 };
  for (const c of mao) {
    if (counts[c.cor] !== undefined) counts[c.cor]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
