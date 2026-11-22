#!/usr/bin/env node
/**
 * Testa em 5 segundos as chaves do DeepSeek (API oficial) + OpenRouter + saldo real antes de gastar na partida!
 * Nunca imprime nenhuma chave em stdout.
 */
import { checarSaldoOpenRouter, consultarIA } from './uno_clients.mjs';
import { ELENCO_UNO } from './uno_roster.mjs';

async function main() {
  console.log('=== [1/2] Checando saldo real OpenRouter ===');
  const saldo = await checarSaldoOpenRouter();
  if (!saldo.ok) {
    console.error('ERRO OpenRouter:', saldo.error);
    process.exitCode = 1;
  } else {
    console.log(`OpenRouter OK! usage=$${saldo.usage.toFixed(4)} | limit=${saldo.limit ?? 'sem limite'} | restante=${saldo.limitRemaining ?? 'n/a'}`);
  }

  console.log('\n=== [2/2] Ping rapido nas 5 IAs de API (DeepSeek oficial + 4 OpenRouter) ===');
  const apis = ELENCO_UNO.filter((j) => !j.provider.startsWith('local:'));
  const results = await Promise.all(
    apis.map(async (j) => {
      const t0 = Date.now();
      try {
        const r = await consultarIA({
          reqId: `ping_${j.id}`,
          jogador: j,
          fase: 'ping',
          system: 'Responda apenas JSON valido: {"ok": true, "oi": "frase curta em pt-BR"}',
          prompt: `Voce eh ${j.nome} numa mesa de UNO. De um oi curto.`,
        });
        const dt = ((Date.now() - t0) / 1000).toFixed(1);
        if (r.ok && r.parsed) {
          console.log(`  OK  ${j.nome.padEnd(16)} (${j.provider}) em ${dt}s | $${(r.costUsd || 0).toFixed(5)} -> "${r.parsed.oi || 'ok'}"`);
          return true;
        }
        console.error(`  ERR ${j.nome.padEnd(16)} (${j.provider}) em ${dt}s -> ${r.error}`);
        return false;
      } catch (e) {
        console.error(`  ERR ${j.nome.padEnd(16)} (${j.provider}) -> ${e.message}`);
        return false;
      }
    })
  );

  if (results.every(Boolean)) {
    console.log('\nTODAS AS 5 APIS EXTERNAS RESPONDENDO 100%! (+ Sonnet 5.5 e Gemini 4 Hydrogen locais gratis!)');
  } else {
    process.exitCode = 1;
  }
}

main();
