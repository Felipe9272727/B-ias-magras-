// Ponte da ASSINATURA: atende os pedidos de "haiku" e "sonnet" do amongus/ia.mjs (pasta amongus/.spool2) chamando o
// Claude Code em modo headless (`claude -p`), que usa a conta da sessão (assinatura), não o saldo do OpenRouter.
// Uso: node ponte_assinatura.mjs &   (e rodar o jogo com PONTE_ASSINATURA=1)
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const SPOOL = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../amongus/.spool2')
const VAZIO = fs.mkdtempSync('/tmp/ponte-')  // roda fora do repositório (sem CLAUDE.md nem ferramentas do projeto)
const MAX = Number(process.env.PONTE_MAX ?? 6)
const MODELO = { haiku: 'haiku', sonnet: 'sonnet' }
const andando = new Set()
fs.mkdirSync(path.join(SPOOL, 'req'), { recursive: true }); fs.mkdirSync(path.join(SPOOL, 'res'), { recursive: true })

function atende(arq) {
  const req = JSON.parse(fs.readFileSync(arq, 'utf8'))
  const modelo = MODELO[req.provider]
  if (!modelo) return
  andando.add(req.id)
  // com imagens (Desenha e Adivinha): entrada stream-json com blocos de imagem; a resposta vem na linha "result"
  const img = req.imagens?.length
  const fmt = img ? ['--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose'] : ['--output-format', 'json']
  const p = spawn('claude', ['-p', '--model', modelo, ...fmt, '--system-prompt', req.system || 'Responda apenas com JSON válido.', '--disallowedTools', 'Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent,Task,NotebookEdit'], { cwd: VAZIO, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = ''
  p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d))
  if (img) p.stdin.end(JSON.stringify({ type: 'user', message: { role: 'user', content: [...req.imagens.map((f) => ({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: fs.readFileSync(f).toString('base64') } })), { type: 'text', text: req.prompt }] } }) + '\n')
  else p.stdin.end(req.prompt)
  p.on('close', () => {
    let r
    try { const j = JSON.parse(img ? out.split('\n').filter((l) => l.includes('"type":"result"')).pop() : out); r = { ok: !j.is_error, text: String(j.result ?? ''), usage: { cost: 0 } } } catch { r = { ok: false, text: (err || out).slice(0, 300) } }
    fs.writeFileSync(path.join(SPOOL, 'res', `${req.id}.json.tmp`), JSON.stringify(r))
    fs.renameSync(path.join(SPOOL, 'res', `${req.id}.json.tmp`), path.join(SPOOL, 'res', `${req.id}.json`))
    andando.delete(req.id)
  })
}

console.log('ponte da assinatura no ar:', SPOOL)
setInterval(() => {
  for (const f of fs.readdirSync(path.join(SPOOL, 'req'))) {
    if (!f.endsWith('.json') || andando.size >= MAX) continue
    const id = f.replace(/\.json$/, '')
    if (andando.has(id) || fs.existsSync(path.join(SPOOL, 'res', f))) continue
    try { const r = JSON.parse(fs.readFileSync(path.join(SPOOL, 'req', f), 'utf8')); if (MODELO[r.provider]) atende(path.join(SPOOL, 'req', f)) } catch {}
  }
}, 300)
