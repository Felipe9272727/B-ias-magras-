#!/usr/bin/env node
/**
 * UNO das IAs — Orquestrador de Partidas Reais com Checkpoint, Memória, Mesa Aberta, Blefe e Ponte Local Grátis!
 *
 * Uso:
 *   node uno_runner.mjs --partida 1 --seed 20261122 [--mock] [--max-turnos 90] [--orcamento 0.80]
 *   node uno_runner.mjs --partida 1 --retomar [--mock]
 *
 * Como funciona a Ponte Local Grátis (Claude Sonnet 5.5 + Gemini 4 Hydrogen):
 *  - Quando o motor precisa de uma resposta de Sonnet ou Hydrogen, ele salva o estado completo em
 *    `logs/partida_<N>.json` + grava os pedidos pendentes em `logs/pending_local_p<N>.json` e sai
 *    com código 0 imprimindo `STATUS: NEED_LOCAL`.
 *  - O coordenador envia o prompt real pro agente swarm do respectivo modelo (zero gasto de API!),
 *    salva as respostas JSON reais em `logs/local_answers_p<N>.json` e chama `--retomar`!
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  iniciarEstadoPartida,
  listarJogaveis,
  resolverCartaNaMao,
  normalizarCor,
  melhorCorParaMao,
  comprarCartas,
  proximoIndice,
  cartaJogavel,
} from './uno_rules.mjs';
import {
  ELENCO_UNO,
  SYSTEM_BASE_UNO,
  promptMesaAberta,
  promptTurnoJogador,
  promptDenunciaUno,
} from './uno_roster.mjs';
import { consultarIA, checarSaldoOpenRouter, parseJsonRobusto } from './uno_clients.mjs';

const BASE_DIR = path.dirname(new URL(import.meta.url).pathname);
const LOGS_DIR = path.join(BASE_DIR, 'logs');
fs.mkdirSync(LOGS_DIR, { recursive: true });

function parseArgs(argv) {
  const out = {
    partida: 1,
    seed: null,
    retomar: false,
    mock: false,
    maxTurnos: 85,
    orcamentoUsd: 0.80,
    memoriasFile: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--partida') out.partida = Number(argv[++i]);
    else if (a === '--seed') out.seed = Number(argv[++i]);
    else if (a === '--retomar') out.retomar = true;
    else if (a === '--mock') out.mock = true;
    else if (a === '--max-turnos') out.maxTurnos = Number(argv[++i]);
    else if (a === '--orcamento') out.orcamentoUsd = Number(argv[++i]);
    else if (a === '--memorias') out.memoriasFile = argv[++i];
  }
  if (!out.seed) out.seed = 62573 + out.partida * 1009;
  return out;
}

function autoCollectOutboxes(pendingPath, answersPath) {
  if (!fs.existsSync(pendingPath)) return;
  const pend = loadJsonIfExists(pendingPath, null);
  if (!pend?.requests?.length) return;
  const answers = loadJsonIfExists(answersPath, {});
  let collected = 0;
  for (const r of pend.requests) {
    const outbox = path.join(LOGS_DIR, `outbox_${r.playerId}.json`);
    if (!fs.existsSync(outbox)) continue;
    const raw = fs.readFileSync(outbox, 'utf8');
    const parsed = parseJsonRobusto(raw);
    if (parsed) {
      answers[r.reqId] = parsed;
      collected++;
      console.log(`[bridge] coletou ${r.playerId} (${r.reqId}): "${limparTexto(parsed.fala || '', 75)}"`);
    }
    fs.rmSync(outbox, { force: true });
  }
  if (collected > 0) saveJsonAtomic(answersPath, answers);
}

function writeLocalPending(pendingPath, payload) {
  saveJsonAtomic(pendingPath, payload);
  const summary = [];
  for (const r of payload.requests) {
    const inbox = path.join(LOGS_DIR, `inbox_${r.playerId}.txt`);
    const outbox = path.join(LOGS_DIR, `outbox_${r.playerId}.json`);
    if (fs.existsSync(outbox)) fs.rmSync(outbox, { force: true });
    fs.writeFileSync(inbox, `${r.system}\n\n---\nREQ_ID: ${r.reqId}\n\n${r.prompt}\n`, 'utf8');
    summary.push({ playerId: r.playerId, worker: `uno-${r.playerId}`, reqId: r.reqId, fase: r.fase });
  }
  console.log(`NEED_LOCAL_JSON: ${JSON.stringify({ partida: payload.partida, fase: payload.fase, turno: payload.turno, tasks: summary })}`);
}

function limparTexto(s, maxLen = 220) {
  if (!s) return '';
  // Remove emojis e quebras excessivas para cumprir regra de ouro do canal
  return String(s)
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function loadJsonIfExists(p, fallback = {}) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return fallback;
}

function saveJsonAtomic(p, obj) {
  const tmp = `${p}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

function registrarCusto(estado, provider, costUsd) {
  if (!costUsd) return;
  estado.custoUsd = Number(((estado.custoUsd || 0) + costUsd).toFixed(6));
  estado.custoPorProvider[provider] = Number(((estado.custoPorProvider[provider] || 0) + costUsd).toFixed(6));
}

function mockRespostaMesaAberta(j, estado) {
  const temBomba = j.mao.some((c) => c.valor === '+4' || c.valor === '+2');
  return {
    pensamento: temBomba
      ? `Estou segurando bomba na mão (${j.mao.length} cartas), vou fingir inocência.`
      : `Minha mão tem ${j.mao.length} cartas comuns, preciso sobreviver.`,
    fala: temBomba
      ? `Relaxem pessoal, minha mão veio horrível, nem olhem pra mim.`
      : `Quem jogar +2 em mim agora vira meu inimigo até o fim!`,
  };
}

function mockRespostaTurno(j, estado, jogaveis) {
  if (jogaveis.length === 0) {
    return {
      pensamento: estado.pilhaCompra > 0
        ? `Não tenho nada pra empilhar essa bomba de +${estado.pilhaCompra}, vou sofrer.`
        : `Sem carta da cor ${estado.corAtiva}, vou comprar do monte.`,
      fala: estado.pilhaCompra > 0
        ? `Vocês são cruéis, vou ter que engolir +${estado.pilhaCompra}!`
        : `Nada aqui, puxando carta...`,
      acao: { tipo: 'comprar' },
    };
  }
  const c = jogaveis[0];
  const vaiFicarComUma = j.mao.length === 2;
  // Em mock, simula esquecimento ocasional de UNO (~35% das vezes) para testar denuncia
  const gritar = vaiFicarComUma ? ((estado.turno + j.idx) % 3 !== 0) : false;
  return {
    pensamento: `Vou jogar ${c.codigo} agora para pressionar a mesa.`,
    fala: c.valor === '+4' || c.valor === '+2'
      ? `Toma esse presentinho aí na mesa!`
      : (gritar ? `UNO! Falta só uma carta, boa sorte!` : `Descendo ${c.codigo} tranquilo.`),
    acao: {
      tipo: 'jogar',
      carta: c.codigo,
      ...(c.cor === 'Curinga' ? { cor_escolhida: melhorCorParaMao(j.mao.filter((x) => x.id !== c.id)) } : {}),
      gritar_uno: gritar,
    },
  };
}

function mockRespostaDenuncia(j, alvo) {
  const denunciar = (j.idx + alvo.idx) % 2 === 0;
  return {
    pensamento: denunciar ? `${alvo.nome} esqueceu de gritar UNO, vou punir!` : `Vou deixar quieto por enquanto.`,
    fala: denunciar ? `ESQUECEU O UNO, ${alvo.nome.toUpperCase()}! COMPRA DUAS!` : `Deixa o jogo seguir.`,
    denunciar,
  };
}

/**
 * Executa uma Mesa Aberta (conversa/blefe/pensamento antes das jogadas) com todos os 7 jogadores.
 * Modelos de API rodam em paralelo; modelos locais retornam pendências em lote (1 rodada de swarm para os 2!).
 */
async function executarMesaAberta(estado, motivo, { mockMode, localAnswers, estadoPath, pendingPath }) {
  const rodadaTag = `p${estado.partidaNum}_mesa_t${estado.turno}`;
  estado.mesaAbertaCache = estado.mesaAbertaCache || {};
  const cache = estado.mesaAbertaCache[rodadaTag] || {};
  estado.mesaAbertaCache[rodadaTag] = cache;

  const pendentesLocais = [];
  const tarefasApi = [];

  for (const j of estado.jogadores) {
    if (cache[j.id]) continue;
    const reqId = `${rodadaTag}_${j.id}`;
    const prompt = promptMesaAberta(estado, j.idx, motivo);

    if (j.provider.startsWith('local:') && !mockMode) {
      const r = await consultarIA({
        reqId,
        jogador: j,
        fase: 'mesa_aberta',
        system: SYSTEM_BASE_UNO,
        prompt,
        mockMode: false,
        localAnswers,
      });
      if (r.needLocal) {
        pendentesLocais.push(r.request);
      } else if (r.ok && r.parsed) {
        cache[j.id] = {
          pensamento: limparTexto(r.parsed.pensamento, 260),
          fala: limparTexto(r.parsed.fala, 220),
        };
      } else {
        cache[j.id] = { pensamento: 'Observando as cartas dos rivais.', fala: 'Bora ver quem vai cair primeiro.' };
      }
    } else {
      tarefasApi.push(
        consultarIA({
          reqId,
          jogador: j,
          fase: 'mesa_aberta',
          system: SYSTEM_BASE_UNO,
          prompt,
          mockMode,
          mockBuilder: () => mockRespostaMesaAberta(j, estado),
          localAnswers,
        }).then((r) => {
          registrarCusto(estado, j.provider, r.costUsd);
          if (r.ok && r.parsed) {
            cache[j.id] = {
              pensamento: limparTexto(r.parsed.pensamento, 260),
              fala: limparTexto(r.parsed.fala, 220),
            };
          } else {
            cache[j.id] = { pensamento: 'Analisando a mesa.', fala: 'Vamos jogar logo!' };
          }
        })
      );
    }
  }

  if (tarefasApi.length) {
    await Promise.all(tarefasApi);
  }

  if (pendentesLocais.length > 0) {
    saveJsonAtomic(estadoPath, estado);
    writeLocalPending(pendingPath, { partida: estado.partidaNum, turno: estado.turno, fase: 'mesa_aberta', requests: pendentesLocais });
    return { pausedForLocal: true, count: pendentesLocais.length };
  }

  // Todos os 7 responderam: grava evento oficial de mesa aberta + adiciona no chat!
  const falas = [];
  for (const j of estado.jogadores) {
    const resp = cache[j.id];
    const item = {
      playerId: j.id,
      nome: j.nome,
      cartasNaMao: j.mao.length,
      maoReal: j.mao.map((c) => c.codigo),
      pensamento: resp.pensamento,
      fala: resp.fala,
    };
    falas.push(item);
    estado.chat.push({ turno: estado.turno, playerId: j.id, nome: j.nome, fala: resp.fala });
    j.estatisticas.blefesChat++;
  }

  estado.eventos.push({
    tipo: 'mesa_aberta',
    turno: estado.turno,
    motivo,
    falas,
  });
  estado.mesaAbertaFeita = true;
  estado.ultimaMesaAbertaTurno = estado.turno;
  delete estado.mesaAbertaCache[rodadaTag];
  saveJsonAtomic(estadoPath, estado);
  return { pausedForLocal: false };
}

/**
 * Janela de Denúncia de UNO! quando um jogador esqueceu gritar_uno ao descer pra 1 carta.
 * Pergunta em paralelo para os 2 rivais mais próximos (quem vem a seguir + o anterior).
 */
async function executarJanelaDenunciaUno(estado, alvoIdx, { mockMode, localAnswers, estadoPath, pendingPath }) {
  const tag = `p${estado.partidaNum}_denuncia_t${estado.turno}`;
  estado.denunciaCache = estado.denunciaCache || {};
  const cache = estado.denunciaCache[tag] || {};
  estado.denunciaCache[tag] = cache;

  const alvo = estado.jogadores[alvoIdx];
  const n = estado.jogadores.length;
  const candIdxs = [
    proximoIndice(alvoIdx, estado.direcao, n, 1),
    proximoIndice(alvoIdx, -estado.direcao, n, 1),
  ].filter((idx, i, arr) => idx !== alvoIdx && arr.indexOf(idx) === i);

  const pendentesLocais = [];
  const tarefasApi = [];

  for (const idx of candIdxs) {
    const j = estado.jogadores[idx];
    if (cache[j.id]) continue;
    const reqId = `${tag}_${j.id}`;
    const prompt = promptDenunciaUno(estado, idx, alvoIdx);

    if (j.provider.startsWith('local:') && !mockMode) {
      const r = await consultarIA({
        reqId,
        jogador: j,
        fase: 'denuncia_uno',
        system: SYSTEM_BASE_UNO,
        prompt,
        mockMode: false,
        localAnswers,
      });
      if (r.needLocal) pendentesLocais.push(r.request);
      else if (r.ok && r.parsed) {
        cache[j.id] = {
          denunciar: Boolean(r.parsed.denunciar),
          pensamento: limparTexto(r.parsed.pensamento, 220),
          fala: limparTexto(r.parsed.fala, 180),
        };
      } else {
        cache[j.id] = { denunciar: false, pensamento: 'Não percebi.', fala: '' };
      }
    } else {
      tarefasApi.push(
        consultarIA({
          reqId,
          jogador: j,
          fase: 'denuncia_uno',
          system: SYSTEM_BASE_UNO,
          prompt,
          mockMode,
          mockBuilder: () => mockRespostaDenuncia(j, alvo),
          localAnswers,
        }).then((r) => {
          registrarCusto(estado, j.provider, r.costUsd);
          if (r.ok && r.parsed) {
            cache[j.id] = {
              denunciar: Boolean(r.parsed.denunciar),
              pensamento: limparTexto(r.parsed.pensamento, 220),
              fala: limparTexto(r.parsed.fala, 180),
            };
          } else {
            cache[j.id] = { denunciar: false, pensamento: 'Deixei passar.', fala: '' };
          }
        })
      );
    }
  }

  if (tarefasApi.length) await Promise.all(tarefasApi);
  if (pendentesLocais.length > 0) {
    saveJsonAtomic(estadoPath, estado);
    writeLocalPending(pendingPath, { partida: estado.partidaNum, turno: estado.turno, fase: 'denuncia_uno', requests: pendentesLocais });
    return { pausedForLocal: true, count: pendentesLocais.length };
  }

  // Primeiro candidato que denunciou aplica multa de +2 cartas!
  for (const idx of candIdxs) {
    const j = estado.jogadores[idx];
    const resp = cache[j.id];
    if (resp?.denunciar && alvo.vulneravelUno) {
      const multa = comprarCartas(estado, alvoIdx, 2);
      alvo.vulneravelUno = false;
      alvo.gritouUno = false;
      alvo.estatisticas.cartasCompradas += multa.length;
      alvo.estatisticas.maxCartasMao = Math.max(alvo.estatisticas.maxCartasMao, alvo.mao.length);
      j.estatisticas.denunciasFeitas++;
      if (resp.fala) estado.chat.push({ turno: estado.turno, playerId: j.id, nome: j.nome, fala: resp.fala });
      estado.eventos.push({
        tipo: 'denuncia_uno',
        turno: estado.turno,
        acusadorId: j.id,
        acusadorNome: j.nome,
        alvoId: alvo.id,
        alvoNome: alvo.nome,
        pensamento: resp.pensamento,
        fala: resp.fala,
        multaCartas: multa.map((c) => c.codigo),
        novoTotalAlvo: alvo.mao.length,
      });
      break;
    }
  }
  alvo.vulneravelUno = false;
  estado.pendenteDenunciaAlvoIdx = null;
  delete estado.denunciaCache[tag];
  saveJsonAtomic(estadoPath, estado);
  return { pausedForLocal: false };
}

function gerarMemoriasPosPartida(estado) {
  const win = estado.jogadores.find((j) => j.id === estado.vencedor);
  const ranking = [...estado.jogadores].sort((a, b) => a.mao.length - b.mao.length);
  const resumoGlobal = `Na Partida ${estado.partidaNum}, ${win ? win.nome : ranking[0].nome} venceu! Placar final de cartas: ${ranking.map((j) => `${j.nome}(${j.mao.length})`).join(', ')}.`;

  const memorias = {};
  for (const j of estado.jogadores) {
    const notas = [resumoGlobal];
    // Quem jogou bomba contra j?
    const bombasTomadas = estado.eventos.filter((e) => e.tipo === 'bomba_tomada' && e.playerId === j.id);
    if (bombasTomadas.length) {
      const maior = bombasTomadas.sort((a, b) => b.qtd - a.qtd)[0];
      notas.push(`Você levou uma bomba de +${maior.qtd} cartas (por culpa de ${maior.culpadoNome || 'a mesa'})!`);
    }
    const denuncias = estado.eventos.filter((e) => e.tipo === 'denuncia_uno' && e.alvoId === j.id);
    if (denuncias.length) {
      notas.push(`${denuncias[0].acusadorNome} te denunciou quando você esqueceu de gritar UNO!`);
    }
    if (j.id === estado.vencedor) {
      notas.push(`Você foi o campeão anterior — agora todos vão querer te derrubar primeiro.`);
    }
    memorias[j.id] = notas.join(' ');
  }
  return memorias;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const estadoPath = path.join(LOGS_DIR, `partida_${args.partida}.json`);
  const pendingPath = path.join(LOGS_DIR, `pending_local_p${args.partida}.json`);
  const answersPath = path.join(LOGS_DIR, `local_answers_p${args.partida}.json`);

  let estado;
  if (args.retomar && fs.existsSync(estadoPath)) {
    estado = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
    console.log(`[uno] Retomando Partida ${estado.partidaNum} no turno ${estado.turno} (status=${estado.status})`);
  } else {
    const memorias = args.memoriasFile ? loadJsonIfExists(args.memoriasFile, {}) : {};
    estado = iniciarEstadoPartida({
      partidaNum: args.partida,
      seed: args.seed,
      elenco: ELENCO_UNO,
      memorias,
    });
    saveJsonAtomic(estadoPath, estado);
    console.log(`[uno] Iniciada Partida ${estado.partidaNum} (seed=${args.seed}) · 1ª carta: ${estado.descarte[0].codigo}`);
  }

  autoCollectOutboxes(pendingPath, answersPath);
  const localAnswers = loadJsonIfExists(answersPath, {});

  // Checa gasto base do OpenRouter para respeitar teto real (MEMORIA_TECNICA.md)
  let orUsageInicial = null;
  if (!args.mock) {
    const chk = await checarSaldoOpenRouter();
    if (chk.ok) {
      orUsageInicial = estado.orUsageInicial ?? chk.usage;
      estado.orUsageInicial = orUsageInicial;
      const gastoAteAgora = chk.usage - orUsageInicial;
      console.log(`[uno] OpenRouter usage atual=$${chk.usage.toFixed(4)} (gasto nesta partida=$${gastoAteAgora.toFixed(4)} / teto=$${args.orcamentoUsd.toFixed(2)})`);
      if (gastoAteAgora >= args.orcamentoUsd) {
        throw new Error(`Teto de orçamento OpenRouter atingido ($${gastoAteAgora.toFixed(4)} >= $${args.orcamentoUsd})`);
      }
    } else {
      console.warn(`[uno] Aviso saldo OpenRouter: ${chk.error}`);
    }
  }

  // Remove pendência antiga se vamos avançar
  if (fs.existsSync(pendingPath)) fs.rmSync(pendingPath, { force: true });

  while (estado.status === 'em_andamento') {
    // 1. Mesa Aberta inicial (turno 0, antes da primeira carta)
    if (!estado.mesaAbertaFeita) {
      const r = await executarMesaAberta(estado, 'ABERTURA DA PARTIDA — PRIMEIRAS IMPRESSÕES E BLEFES', {
        mockMode: args.mock,
        localAnswers,
        estadoPath,
        pendingPath,
      });
      if (r.pausedForLocal) {
        console.log(`STATUS: NEED_LOCAL (${r.count} pedido(s) em ${pendingPath})`);
        return;
      }
    }

    // 2. Janela de denúncia pendente se alguém esqueceu de gritar UNO
    if (estado.pendenteDenunciaAlvoIdx !== null && estado.pendenteDenunciaAlvoIdx !== undefined) {
      const r = await executarJanelaDenunciaUno(estado, estado.pendenteDenunciaAlvoIdx, {
        mockMode: args.mock,
        localAnswers,
        estadoPath,
        pendingPath,
      });
      if (r.pausedForLocal) {
        console.log(`STATUS: NEED_LOCAL (${r.count} pedido(s) em ${pendingPath})`);
        return;
      }
    }

    // 3. Mesa Aberta relâmpago em momentos de tensão (a cada 10 turnos ou após bomba grande/alguém com <=2 cartas)
    const alguemPerto = estado.jogadores.some((j) => j.mao.length <= 2);
    const deveAbrirMesa =
      estado.turno > 0 &&
      (estado.turno - estado.ultimaMesaAbertaTurno >= (alguemPerto ? 6 : 12));
    if (deveAbrirMesa) {
      const motivo = alguemPerto
        ? 'RETA FINAL TENSA — ALGUÉM ESTÁ QUASE BATENDO!'
        : `PAUSA DE BLEFE E ACUSAÇÕES (TURNO ${estado.turno})`;
      const r = await executarMesaAberta(estado, motivo, {
        mockMode: args.mock,
        localAnswers,
        estadoPath,
        pendingPath,
      });
      if (r.pausedForLocal) {
        console.log(`STATUS: NEED_LOCAL (${r.count} pedido(s) em ${pendingPath})`);
        return;
      }
    }

    // 4. Verifica limite de turnos (desempate por menor número de cartas)
    if (estado.turno >= args.maxTurnos) {
      const ord = [...estado.jogadores].sort((a, b) => a.mao.length - b.mao.length);
      estado.status = 'encerrada';
      estado.vencedor = ord[0].id;
      estado.motivoFim = `limite_turnos (${ord[0].nome} venceu com ${ord[0].mao.length} cartas)`;
      estado.eventos.push({ tipo: 'fim_partida', turno: estado.turno, vencedor: estado.vencedor, motivo: estado.motivoFim });
      break;
    }

    // 5. Checagem periódica de teto OpenRouter a cada 10 turnos
    if (!args.mock && orUsageInicial !== null && estado.turno > 0 && estado.turno % 10 === 0) {
      const chk = await checarSaldoOpenRouter();
      if (chk.ok && chk.usage - orUsageInicial >= args.orcamentoUsd) {
        throw new Error(`Teto de orçamento OpenRouter atingido no turno ${estado.turno} ($${(chk.usage - orUsageInicial).toFixed(4)})`);
      }
    }

    // 6. Turno do jogador atual
    estado.turno++;
    const pIdx = estado.vezAtual;
    const jogador = estado.jogadores[pIdx];
    const topo = estado.descarte[estado.descarte.length - 1];
    const mesa = { topo, corAtiva: estado.corAtiva, pilhaCompra: estado.pilhaCompra };
    const jogaveis = listarJogaveis(jogador.mao, mesa);
    const reqId = `p${estado.partidaNum}_t${estado.turno}_${jogador.id}`;
    const prompt = promptTurnoJogador(estado, pIdx, jogaveis);

    const res = await consultarIA({
      reqId,
      jogador,
      fase: 'turno',
      system: SYSTEM_BASE_UNO,
      prompt,
      mockMode: args.mock,
      mockBuilder: () => mockRespostaTurno(jogador, estado, jogaveis),
      localAnswers,
    });

    if (res.needLocal) {
      // Volta o contador do turno antes de pausar para retomar exatamente este turno!
      estado.turno--;
      saveJsonAtomic(estadoPath, estado);
      writeLocalPending(pendingPath, { partida: estado.partidaNum, turno: estado.turno + 1, fase: 'turno', requests: [res.request] });
      console.log(`STATUS: NEED_LOCAL (turno ${estado.turno + 1} de ${jogador.nome} -> ${pendingPath})`);
      return;
    }

    registrarCusto(estado, jogador.provider, res.costUsd);
    const parsed = res.parsed || {};
    const pensamento = limparTexto(parsed.pensamento || 'Pensando na próxima carta.', 260);
    const fala = limparTexto(parsed.fala || '', 220);
    if (fala) {
      estado.chat.push({ turno: estado.turno, playerId: jogador.id, nome: jogador.nome, fala });
    }

    const acao = parsed.acao || {};
    const querJogar = acao.tipo === 'jogar' || Boolean(acao.carta);
    let cartaEscolhida = querJogar ? resolverCartaNaMao(jogador.mao, acao.carta, mesa) : null;

    // Se a IA tentou jogar uma carta inválida mas tinha carta jogável, corrige de forma transparente (ou compra se queria comprar)
    let tentativaInvalida = null;
    if (querJogar && !cartaEscolhida) {
      tentativaInvalida = String(acao.carta || '');
      if (jogaveis.length > 0) {
        cartaEscolhida = jogaveis[0];
      }
    }

    const nJog = estado.jogadores.length;
    let passosAvanco = 1;

    if (cartaEscolhida) {
      // Remove da mão e joga no descarte
      const idxNaMao = jogador.mao.findIndex((c) => c.id === cartaEscolhida.id);
      jogador.mao.splice(idxNaMao, 1);
      estado.descarte.push(cartaEscolhida);
      jogador.estatisticas.cartasJogadas++;

      let corEscolhida = null;
      if (cartaEscolhida.cor === 'Curinga') {
        corEscolhida = normalizarCor(acao.cor_escolhida) || melhorCorParaMao(jogador.mao);
        estado.corAtiva = corEscolhida;
      } else {
        estado.corAtiva = cartaEscolhida.cor;
      }

      if (cartaEscolhida.valor === '+2') {
        estado.pilhaCompra += 2;
        estado.ultimoCulpadoBomba = jogador.nome;
        jogador.estatisticas.maisDoisJogados++;
      } else if (cartaEscolhida.valor === '+4') {
        estado.pilhaCompra += 4;
        estado.ultimoCulpadoBomba = jogador.nome;
        jogador.estatisticas.maisQuatroJogados++;
      } else if (cartaEscolhida.valor === 'PULAR') {
        passosAvanco = 2;
      } else if (cartaEscolhida.valor === 'REVERTER') {
        estado.direcao = -estado.direcao;
      }

      // Verifica grito de UNO!
      let gritouUno = false;
      let esqueceuUno = false;
      if (jogador.mao.length === 1) {
        const declarou = acao.gritar_uno === true || /\buno\b/i.test(fala);
        if (declarou) {
          gritouUno = true;
          jogador.gritouUno = true;
          jogador.vulneravelUno = false;
        } else {
          esqueceuUno = true;
          jogador.gritouUno = false;
          jogador.vulneravelUno = true;
          jogador.estatisticas.esquecimentosUno++;
          estado.pendenteDenunciaAlvoIdx = pIdx;
        }
      } else {
        jogador.gritouUno = false;
        jogador.vulneravelUno = false;
      }

      estado.eventos.push({
        tipo: 'jogada',
        turno: estado.turno,
        playerId: jogador.id,
        nome: jogador.nome,
        cartaId: cartaEscolhida.id,
        cartaCodigo: cartaEscolhida.codigo,
        cartaCor: cartaEscolhida.cor,
        cartaValor: cartaEscolhida.valor,
        corEscolhida,
        corAtiva: estado.corAtiva,
        pilhaCompra: estado.pilhaCompra,
        direcao: estado.direcao,
        restantes: jogador.mao.length,
        maoRestante: jogador.mao.map((c) => c.codigo),
        gritouUno,
        esqueceuUno,
        tentativaInvalida,
        pensamento,
        fala,
      });

      console.log(
        `[T${String(estado.turno).padStart(2, '0')}] ${jogador.nome.padEnd(16)} jogou ${cartaEscolhida.codigo.padEnd(10)} ` +
        `cor=${estado.corAtiva.padEnd(8)} pilha=+${estado.pilhaCompra} rest=${jogador.mao.length}` +
        `${gritouUno ? ' [UNO!]' : ''}${esqueceuUno ? ' [ESQUECEU UNO!]' : ''}`
      );

      // Vitória imediata!
      if (jogador.mao.length === 0) {
        estado.status = 'encerrada';
        estado.vencedor = jogador.id;
        estado.motivoFim = `${jogador.nome} zerou a mão no turno ${estado.turno}!`;
        estado.pendenteDenunciaAlvoIdx = null;
        estado.eventos.push({
          tipo: 'fim_partida',
          turno: estado.turno,
          vencedor: jogador.id,
          vencedorNome: jogador.nome,
          motivo: estado.motivoFim,
        });
        break;
      }
    } else if (estado.pilhaCompra > 0) {
      // Engole a bomba acumulada!
      const qtd = estado.pilhaCompra;
      const compradas = comprarCartas(estado, pIdx, qtd);
      estado.pilhaCompra = 0;
      jogador.gritouUno = false;
      jogador.vulneravelUno = false;
      jogador.estatisticas.cartasCompradas += compradas.length;
      jogador.estatisticas.vezesTomouBomba++;
      jogador.estatisticas.maiorBombaTomada = Math.max(jogador.estatisticas.maiorBombaTomada, compradas.length);
      jogador.estatisticas.maxCartasMao = Math.max(jogador.estatisticas.maxCartasMao, jogador.mao.length);

      estado.eventos.push({
        tipo: 'bomba_tomada',
        turno: estado.turno,
        playerId: jogador.id,
        nome: jogador.nome,
        qtd: compradas.length,
        culpadoNome: estado.ultimoCulpadoBomba || null,
        cartasCompradas: compradas.map((c) => c.codigo),
        restantes: jogador.mao.length,
        maoRestante: jogador.mao.map((c) => c.codigo),
        pensamento,
        fala,
      });
      console.log(`[T${String(estado.turno).padStart(2, '0')}] ${jogador.nome.padEnd(16)} TOMOU BOMBA +${compradas.length}! (agora tem ${jogador.mao.length} cartas)`);
    } else {
      // Compra 1 carta normal (se for jogável imediatamente, desce automaticamente para dar dinamismo igual UNO real)
      const compradas = comprarCartas(estado, pIdx, 1);
      jogador.gritouUno = false;
      jogador.vulneravelUno = false;
      jogador.estatisticas.cartasCompradas += compradas.length;
      jogador.estatisticas.maxCartasMao = Math.max(jogador.estatisticas.maxCartasMao, jogador.mao.length);

      let jogouComprada = null;
      const nova = compradas[0];
      if (nova && cartaJogavel(nova, { topo, corAtiva: estado.corAtiva, pilhaCompra: 0 })) {
        const idxNova = jogador.mao.findIndex((c) => c.id === nova.id);
        jogador.mao.splice(idxNova, 1);
        estado.descarte.push(nova);
        jogador.estatisticas.cartasJogadas++;
        jogouComprada = nova.codigo;
        if (nova.cor === 'Curinga') {
          estado.corAtiva = melhorCorParaMao(jogador.mao);
        } else {
          estado.corAtiva = nova.cor;
        }
        if (nova.valor === '+2') {
          estado.pilhaCompra += 2;
          estado.ultimoCulpadoBomba = jogador.nome;
          jogador.estatisticas.maisDoisJogados++;
        } else if (nova.valor === '+4') {
          estado.pilhaCompra += 4;
          estado.ultimoCulpadoBomba = jogador.nome;
          jogador.estatisticas.maisQuatroJogados++;
        } else if (nova.valor === 'PULAR') {
          passosAvanco = 2;
        } else if (nova.valor === 'REVERTER') {
          estado.direcao = -estado.direcao;
        }
      }

      estado.eventos.push({
        tipo: 'compra',
        turno: estado.turno,
        playerId: jogador.id,
        nome: jogador.nome,
        qtd: compradas.length,
        cartaComprada: nova ? nova.codigo : null,
        jogouComprada,
        corAtiva: estado.corAtiva,
        pilhaCompra: estado.pilhaCompra,
        restantes: jogador.mao.length,
        maoRestante: jogador.mao.map((c) => c.codigo),
        pensamento,
        fala,
      });
      console.log(
        `[T${String(estado.turno).padStart(2, '0')}] ${jogador.nome.padEnd(16)} comprou 1` +
        `${jogouComprada ? ` -> JOGOU NA HORA ${jogouComprada}!` : ''} (rest=${jogador.mao.length})`
      );
    }

    estado.vezAtual = proximoIndice(pIdx, estado.direcao, nJog, passosAvanco);
    saveJsonAtomic(estadoPath, estado);
  }

  // Salva estado final + memórias para a próxima partida!
  saveJsonAtomic(estadoPath, estado);
  const memPath = path.join(LOGS_DIR, `memorias_pos_p${estado.partidaNum}.json`);
  saveJsonAtomic(memPath, gerarMemoriasPosPartida(estado));

  console.log(`\n=== FIM DA PARTIDA ${estado.partidaNum} ===`);
  console.log(`Vencedor: ${estado.vencedor} (${estado.motivoFim})`);
  console.log(`Turnos: ${estado.turno} | Custo estimado OR: $${(estado.custoUsd || 0).toFixed(4)}`);
  for (const j of [...estado.jogadores].sort((a, b) => a.mao.length - b.mao.length)) {
    console.log(
      `  - ${j.nome.padEnd(16)} | rest=${String(j.mao.length).padStart(2)} | jog=${j.estatisticas.cartasJogadas} | ` +
      `+2=${j.estatisticas.maisDoisJogados} +4=${j.estatisticas.maisQuatroJogados} | ` +
      `maiorBomba=+${j.estatisticas.maiorBombaTomada} | esqUno=${j.estatisticas.esquecimentosUno} | den=${j.estatisticas.denunciasFeitas}`
    );
  }
  console.log(`STATUS: FINISHED`);
}

main().catch((err) => {
  console.error('[uno] ERRO:', err);
  process.exit(1);
});
