// Cliente RCON mínimo (comandos do console do servidor: say, tp, fill, gamemode...)
import net from 'node:net'

export function rcon({ host = '127.0.0.1', port = 25575, senha = 'ias_local' } = {}) {
  let sock, id = 0, buf = Buffer.alloc(0)
  const espera = new Map()
  const pacote = (rid, tipo, corpo) => {
    const b = Buffer.from(corpo, 'utf8')
    const p = Buffer.alloc(14 + b.length)
    p.writeInt32LE(10 + b.length, 0); p.writeInt32LE(rid, 4); p.writeInt32LE(tipo, 8); b.copy(p, 12)
    return p
  }
  const ligar = () => new Promise((ok, erro) => {
    sock = net.connect(port, host, () => { const r = ++id; espera.set(r, ok); sock.write(pacote(r, 3, senha)) })
    sock.on('error', erro)
    sock.on('data', d => {
      buf = Buffer.concat([buf, d])
      while (buf.length >= 4 && buf.length >= buf.readInt32LE(0) + 4) {
        const n = buf.readInt32LE(0), rid = buf.readInt32LE(4), corpo = buf.toString('utf8', 12, 4 + n - 2)
        buf = buf.subarray(4 + n)
        espera.get(rid)?.(corpo); espera.delete(rid)
      }
    })
  })
  const pronto = ligar()
  return async cmd => { await pronto; return new Promise(ok => { const r = ++id; espera.set(r, ok); sock.write(pacote(r, 2, cmd)) }) }
}
