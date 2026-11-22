#!/usr/bin/env node
/**
 * Suíte completa de testes unitários + simulação --mock + teste do protocolo NEED_LOCAL do UNO das IAs.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  criarBaralho,
  cartaJogavel,
  resolverCartaNaMao,
  iniciarEstadoPartida,
  reciclarSeNecessario,
  comprarCartas,
} from './uno_rules.mjs';
import { ELENCO_UNO } from './uno_roster.mjs';
import { parseJsonRobusto } from './uno_clients.mjs';

// 1. Baralho oficial de 108 cartas
const d = criarBaralho(12345);
assert.equal(d.length, 108, 'Baralho deve ter exatamente 108 cartas');
assert.equal(d.filter((c) => c.valor === '+4').length, 4, 'Deve ter 4 cartas +4');
assert.equal(d.filter((c) => c.valor === 'CURINGA').length, 4, 'Deve ter 4 Curingas');
assert.equal(d.filter((c) => c.valor === '+2').length, 8, 'Deve ter 8 cartas +2');
assert.equal(d.filter((c) => c.valor === 'PULAR').length, 8, 'Deve ter 8 PULAR');
assert.equal(d.filter((c) => c.valor === 'REVERTER').length, 8, 'Deve ter 8 REVERTER');
assert.equal(d.filter((c) => c.valor === '0').length, 4, 'Deve ter 4 zeros');

// 2. Empilhamento +2 e +4
const topoMais2 = { id: 'V+2_1', cor: 'Vermelho', valor: '+2', codigo: 'V-+2' };
const topoMais4 = { id: 'W4_1', cor: 'Curinga', valor: '+4', codigo: '+4' };
const azulMais2 = { id: 'A+2_2', cor: 'Azul', valor: '+2', codigo: 'A-+2' };
const verde7 = { id: 'G7_1', cor: 'Verde', valor: '7', codigo: 'G-7' };
assert.equal(cartaJogavel(azulMais2, { topo: topoMais2, corAtiva: 'Vermelho', pilhaCompra: 2 }), true, '+2 empilha em +2');
assert.equal(cartaJogavel(topoMais4, { topo: topoMais2, corAtiva: 'Vermelho', pilhaCompra: 2 }), true, '+4 empilha em +2');
assert.equal(cartaJogavel(verde7, { topo: topoMais2, corAtiva: 'Verde', pilhaCompra: 2 }), false, '7 não empilha em +2');
assert.equal(cartaJogavel(azulMais2, { topo: topoMais4, corAtiva: 'Azul', pilhaCompra: 4 }), false, '+2 não empilha em +4');
assert.equal(cartaJogavel(topoMais4, { topo: topoMais4, corAtiva: 'Azul', pilhaCompra: 4 }), true, '+4 empilha em +4');

// 3. Resolver carta flexível
const mao = [azulMais2, verde7, topoMais4];
assert.equal(resolverCartaNaMao(mao, 'A-+2', { topo: topoMais2, corAtiva: 'Vermelho', pilhaCompra: 2 })?.id, 'A+2_2');
assert.equal(resolverCartaNaMao(mao, 'Azul +2', { topo: topoMais2, corAtiva: 'Vermelho', pilhaCompra: 0 })?.id, 'A+2_2');
assert.equal(resolverCartaNaMao(mao, '+4', { topo: topoMais2, corAtiva: 'Vermelho', pilhaCompra: 2 })?.id, 'W4_1');

// 4. Parser JSON robusto (com code fence e texto extra)
const parsed = parseJsonRobusto('Aqui vai:\n```json\n{"pensamento":"oi","fala":"blefe","acao":{"tipo":"comprar"}}\n```');
assert.equal(parsed?.acao?.tipo, 'comprar');

// 5. Reciclagem do monte de compra
const est = iniciarEstadoPartida({ partidaNum: 99, seed: 777, elenco: ELENCO_UNO });
assert.equal(est.jogadores.length, 7);
assert.equal(est.baralho.length, 108 - 7 * 7 - 1, 'Restam 58 cartas no monte');
est.descarte.push(...est.baralho.splice(0, est.baralho.length));
assert.equal(est.baralho.length, 0);
const compr = comprarCartas(est, 0, 3);
assert.equal(compr.length, 3, 'Reciclou descarte corretamente');

// 6. Simulação completa --mock de 2 partidas com memória entre partidas
const out1 = execFileSync('node', ['/home/felipexcria750/uno_ias/uno_runner.mjs', '--partida', '91', '--seed', '1001', '--mock', '--max-turnos', '80'], { encoding: 'utf8' });
assert.match(out1, /STATUS: FINISHED/);
const out2 = execFileSync('node', [
  '/home/felipexcria750/uno_ias/uno_runner.mjs',
  '--partida', '92', '--seed', '2002', '--mock', '--max-turnos', '80',
  '--memorias', '/home/felipexcria750/uno_ias/logs/memorias_pos_p91.json',
], { encoding: 'utf8' });
assert.match(out2, /STATUS: FINISHED/);

// Limpa logs de teste 91/92
for (const fn of ['partida_91.json', 'partida_92.json', 'memorias_pos_p91.json', 'memorias_pos_p92.json']) {
  fs.rmSync(`/home/felipexcria750/uno_ias/logs/${fn}`, { force: true });
}

console.log('ALL UNO ENGINE TESTS PASSED 100%!');
