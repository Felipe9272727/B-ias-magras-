// Cliente RCON mínimo (comandos do console do servidor: say, tp, fill, gamemode...)
import net from 'node:net'

export function rcon({ host = '127.0.0.1', port = 25575, senha = 'ias_local', tempoLimite = 15000 } = {}) {
  let sock, id = 0, buf = Buffer.alloc(0)
  const espera = new Map()
  const aguardar = (r, ok, erro) => {
    const timer = setTimeout(() => { espera.delete(r); erro(new Error(`RCON sem resposta após ${tempoLimite} ms`)) }, tempoLimite)
    espera.set(r, { ok: valor => { clearTimeout(timer); ok(valor) }, erro: e => { clearTimeout(timer); erro(e) } })
  }
  const pacote = (rid, tipo, corpo) => {
    const b = Buffer.from(corpo, 'utf8')
    const p = Buffer.alloc(14 + b.length)
    p.writeInt32LE(10 + b.length, 0); p.writeInt32LE(rid, 4); p.writeInt32LE(tipo, 8); b.copy(p, 12)
    return p
  }
  const ligar = () => new Promise((ok, erro) => {
    const ligacao = setTimeout(() => { erro(new Error('RCON não conectou')); sock.destroy() }, tempoLimite)
    sock = net.connect(port, host, () => { clearTimeout(ligacao); const r = ++id; aguardar(r, ok, erro); sock.write(pacote(r, 3, senha)) })
    sock.on('error', erro)
    sock.on('close', () => { clearTimeout(ligacao); for (const p of espera.values()) p.erro(new Error('RCON desconectado')); espera.clear() })
    sock.on('data', d => {
      buf = Buffer.concat([buf, d])
      while (buf.length >= 4 && buf.length >= buf.readInt32LE(0) + 4) {
        const n = buf.readInt32LE(0), rid = buf.readInt32LE(4), corpo = buf.toString('utf8', 12, 4 + n - 2)
        buf = buf.subarray(4 + n)
        if (rid === -1) { for (const p of espera.values()) p.erro(new Error('RCON recusou autenticação')); espera.clear() }
        else { espera.get(rid)?.ok(corpo); espera.delete(rid) }
      }
    })
  })
  const pronto = ligar()
  return async cmd => { await pronto; return new Promise((ok, erro) => { const r = ++id; aguardar(r, ok, erro); sock.write(pacote(r, 2, cmd)) }) }
}
