#!/usr/bin/env node
/**
 * Helper da Ponte Local (Claude Sonnet 5.5 + Gemini 4 Hydrogen):
 *  - `node uno_bridge.mjs prepare <partida>`: lê `pending_local_p<N>.json`, escreve os inboxes privados
 *    (`inbox_sonnet.txt`, `inbox_hydrogen.txt`), limpa outboxes antigos e imprime exatamente quem chamar.
 *  - `node uno_bridge.mjs collect <partida>`: lê `outbox_<id>.json`, valida JSON, grava em
 *    `local_answers_p<N>.json` e limpa os inboxes/outboxes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseJsonRobusto } from './uno_clients.mjs';

const LOGS = '/home/felipexcria750/uno_ias/logs';
const [cmd, pArg] = process.argv.slice(2);
const partida = Number(pArg || 1);
const pendingPath = path.join(LOGS, `pending_local_p${partida}.json`);
const answersPath = path.join(LOGS, `local_answers_p${partida}.json`);

if (cmd === 'prepare') {
  if (!fs.existsSync(pendingPath)) {
    console.log('NO_PENDING');
    process.exit(0);
  }
  const pend = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
  const summary = [];
  for (const r of pend.requests) {
    const inbox = path.join(LOGS, `inbox_${r.playerId}.txt`);
    const outbox = path.join(LOGS, `outbox_${r.playerId}.json`);
    if (fs.existsSync(outbox)) fs.rmSync(outbox, { force: true });
    const full = `${r.system}\n\n---\nREQ_ID: ${r.reqId}\n\n${r.prompt}\n`;
    fs.writeFileSync(inbox, full, 'utf8');
    summary.push({ playerId: r.playerId, worker: `uno-${r.playerId}`, reqId: r.reqId, fase: r.fase });
  }
  console.log(JSON.stringify({ partida, fase: pend.fase, turno: pend.turno, tasks: summary }));
} else if (cmd === 'collect') {
  const pend = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
  const answers = fs.existsSync(answersPath) ? JSON.parse(fs.readFileSync(answersPath, 'utf8')) : {};
  for (const r of pend.requests) {
    const outbox = path.join(LOGS, `outbox_${r.playerId}.json`);
    if (!fs.existsSync(outbox)) {
      throw new Error(`Falta outbox de ${r.playerId} (${outbox})`);
    }
    const raw = fs.readFileSync(outbox, 'utf8');
    const parsed = parseJsonRobusto(raw);
    if (!parsed) throw new Error(`JSON inválido em ${outbox}: ${raw.slice(0, 160)}`);
    answers[r.reqId] = parsed;
    console.log(`COLLECTED ${r.playerId} (${r.reqId}): fala="${(parsed.fala || '').slice(0, 80)}"`);
  }
  fs.writeFileSync(answersPath, JSON.stringify(answers, null, 2), 'utf8');
} else {
  console.error('Uso: node uno_bridge.mjs prepare|collect <partida>');
  process.exit(1);
}
