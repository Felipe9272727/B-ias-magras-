/**
 * UNO das IAs — Cliente Unificado de IAs (OpenRouter + DeepSeek API oficial + Local Swarm + Mock)
 *
 * Regras de segurança e orçamento (MEMORIA_TECNICA.md):
 *  - DeepSeek vai SEMPRE pela API oficial (https://api.deepseek.com/chat/completions).
 *  - OpenRouter checa gasto REAL via GET /api/v1/key antes de gastar demais (ORCAMENTO_USD).
 *  - Nunca imprime chaves em stdout/logs.
 *  - Modelos locais (local:claude-sonnet-5-5-medium e local:gemini-4-hydrogen-medium) leem
 *    respostas reais gravadas pelo coordenador em logs/local_answers.json; se ainda não houver
 *    resposta para aquele pedido, retornam { needLocal: true, request: {...} } para o motor salvar
 *    checkpoint e aguardar o modelo real da plataforma responder gratuitamente!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const HOME = '/home/felipexcria750';
const DS_KEY_FILE = path.join(HOME, '.deepseek_temp_key');
const OR_KEY_FILE = path.join(HOME, '.openrouter_temp_key');

export function readKey(envName, filePath) {
  if (process.env[envName]?.trim()) return process.env[envName].trim();
  try {
    if (fs.existsSync(filePath)) {
      const v = fs.readFileSync(filePath, 'utf8').trim();
      if (v) return v;
    }
  } catch {}
  return null;
}

function curlJson(url, { method = 'GET', headers = {}, body = null, timeoutSec = 90 } = {}) {
  return new Promise((resolve) => {
    const args = ['-sS', '--max-time', String(timeoutSec), '-X', method, url, '-w', '\n%{http_code}'];
    for (const [k, v] of Object.entries(headers)) {
      args.push('-H', `${k}: ${v}`);
    }
    if (body !== null) {
      args.push('--data-binary', '@-');
    }
    const child = execFile('curl', args, { timeout: (timeoutSec + 10) * 1000, maxBuffer: 1 << 24 }, (err, stdout, stderr) => {
      const text = String(stdout ?? '').trimEnd();
      const lines = text.split('\n');
      const status = Number(lines.pop()) || 0;
      const raw = lines.join('\n');
      let json = null;
      try { json = JSON.parse(raw); } catch {}
      resolve({ ok: status >= 200 && status < 300, status, json, raw, err: err ? String(stderr || err.message) : null });
    });
    if (body !== null) {
      child.stdin.end(typeof body === 'string' ? body : JSON.stringify(body));
    }
  });
}

export async function checarSaldoOpenRouter() {
  const key = readKey('OPENROUTER_API_KEY', OR_KEY_FILE);
  if (!key) return { ok: false, error: 'openrouter: sem chave' };
  const r = await curlJson('https://openrouter.ai/api/v1/key', {
    headers: { Authorization: `Bearer ${key}` },
    timeoutSec: 20,
  });
  if (!r.ok || !r.json?.data) return { ok: false, error: `HTTP ${r.status}: ${r.raw.slice(0, 160)}` };
  const d = r.json.data;
  return {
    ok: true,
    usage: Number(d.usage ?? 0),
    limit: d.limit === null || d.limit === undefined ? null : Number(d.limit),
    limitRemaining: d.limit_remaining === null || d.limit_remaining === undefined ? null : Number(d.limit_remaining),
  };
}

async function callOpenRouter(modelSlug, system, prompt, { timeoutSec = 120, effort = 'low', noReasoning = false } = {}) {
  const key = readKey('OPENROUTER_API_KEY', OR_KEY_FILE);
  if (!key) return { ok: false, fatal: true, error: 'openrouter: sem chave' };
  const payload = {
    model: modelSlug,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.85,
    max_tokens: 900,
    reasoning: noReasoning ? { enabled: false } : { effort },
  };
  const r = await curlJson('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'X-Title': 'UNO das IAs - Felipex007',
    },
    body: payload,
    timeoutSec,
  });
  if (!r.ok) {
    const msg = r.json?.error?.message || r.raw.slice(0, 200) || r.err || 'erro desconhecido';
    const noNet = r.status === 0 && /resolve host|network/i.test(msg);
    const fatal = noNet || r.status === 401 || r.status === 402 || r.status === 403;
    const transient = !noNet && (r.status === 429 || r.status >= 500 || r.status === 0);
    return { ok: false, status: r.status, fatal, transient, error: `openrouter(${modelSlug}) HTTP ${r.status}: ${msg}` };
  }
  const ch = r.json?.choices?.[0];
  const content = ch?.message?.content ?? '';
  return {
    ok: true,
    text: content,
    costUsd: Number(r.json?.usage?.cost ?? 0),
    usage: r.json?.usage || null,
    finishReason: ch?.finish_reason || null,
  };
}

async function callDeepSeek(modelSlug, system, prompt, { timeoutSec = 120, noReasoning = false } = {}) {
  const key = readKey('DEEPSEEK_API_KEY', DS_KEY_FILE);
  if (!key) return { ok: false, fatal: true, error: 'deepseek: sem chave' };
  const body = {
    model: modelSlug,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.85,
    max_tokens: 1800,
  };
  if (modelSlug === 'deepseek-flash') {
    if (noReasoning) body.thinking = { type: 'disabled' };
    else body.reasoning_effort = 'low';
  }
  const r = await curlJson('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body,
    timeoutSec,
  });
  if (!r.ok) {
    const msg = r.json?.error?.message || r.raw.slice(0, 200) || r.err || 'erro desconhecido';
    // Fallback automatic from deepseek-flash to deepseek-chat if account doesn't have flash enabled
    if (modelSlug === 'deepseek-flash' && (r.status === 400 || r.status === 404) && /model|exist/i.test(msg)) {
      return callDeepSeek('deepseek-chat', system, prompt, { timeoutSec, noReasoning });
    }
    const noNet = r.status === 0 && /resolve host|network/i.test(msg);
    const fatal = noNet || r.status === 401 || r.status === 402 || r.status === 403;
    const transient = !noNet && (r.status === 429 || r.status >= 500 || r.status === 0);
    return { ok: false, status: r.status, fatal, transient, error: `deepseek(${modelSlug}) HTTP ${r.status}: ${msg}` };
  }
  const ch = r.json?.choices?.[0];
  const content = ch?.message?.content ?? '';
  return {
    ok: true,
    text: content,
    costUsd: 0, // DeepSeek official API doesn't return USD in usage; negligible (~$0.0002/call)
    usage: r.json?.usage || null,
    finishReason: ch?.finish_reason || null,
  };
}

export function parseJsonRobusto(rawText) {
  if (!rawText) return null;
  const s = String(rawText).trim();
  try { return JSON.parse(s); } catch {}
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(s.slice(start, end + 1)); } catch {}
  }
  return null;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Executa uma pergunta para um jogador do UNO.
 * - Se `mockMode` = true: devolve resposta mock coerente para testes.
 * - Se `provider` começa com `local:`: verifica `localAnswers[reqId]`. Se não existir,
 *   retorna `{ needLocal: true, request }` para o coordenador despachar ao worker nativo real.
 * - Se `provider` é `or:...` ou `ds:...`: chama a API real com retries e fallback sem reasoning.
 */
export async function consultarIA({
  reqId,
  jogador,
  fase,
  system,
  prompt,
  mockMode = false,
  mockBuilder = null,
  localAnswers = {},
}) {
  if (mockMode) {
    const obj = mockBuilder ? mockBuilder() : { pensamento: 'Teste mock.', fala: 'Bora jogar!' };
    return { ok: true, parsed: obj, raw: JSON.stringify(obj), costUsd: 0 };
  }

  if (jogador.provider.startsWith('local:')) {
    const modelId = jogador.provider.slice('local:'.length);
    if (localAnswers && localAnswers[reqId] !== undefined) {
      const ans = localAnswers[reqId];
      const parsed = typeof ans === 'string' ? parseJsonRobusto(ans) : ans;
      return {
        ok: Boolean(parsed),
        parsed,
        raw: typeof ans === 'string' ? ans : JSON.stringify(ans),
        costUsd: 0,
      };
    }
    return {
      needLocal: true,
      request: {
        reqId,
        playerId: jogador.id,
        nome: jogador.nome,
        modelId,
        fase,
        system,
        prompt,
      },
    };
  }

  const isOR = jogador.provider.startsWith('or:');
  const isDS = jogador.provider.startsWith('ds:');
  const slug = jogador.provider.slice(3);

  let lastErr = 'desconhecido';
  let emptyCount = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    const noReasoning = attempt >= 2 && emptyCount >= 1;
    const res = isOR
      ? await callOpenRouter(slug, system, prompt, { timeoutSec: 120, effort: 'low', noReasoning })
      : isDS
        ? await callDeepSeek(slug, system, prompt, { timeoutSec: 120, noReasoning })
        : { ok: false, fatal: true, error: `provider desconhecido: ${jogador.provider}` };

    if (res.ok) {
      const txt = (res.text || '').trim();
      if (!txt) {
        emptyCount++;
        lastErr = `resposta vazia (finish=${res.finishReason})`;
        await dormir(1500);
        continue;
      }
      const parsed = parseJsonRobusto(txt);
      if (parsed) {
        return { ok: true, parsed, raw: txt, costUsd: res.costUsd || 0, usage: res.usage };
      }
      lastErr = `JSON inválido: ${txt.slice(0, 120)}`;
      await dormir(1000);
      continue;
    }

    lastErr = res.error;
    if (res.fatal) throw new Error(res.error);
    if (res.transient) {
      await dormir(Math.min(20000, 3000 * (attempt + 1)));
      continue;
    }
    await dormir(2000);
  }

  return { ok: false, parsed: null, raw: '', error: lastErr, costUsd: 0 };
}
