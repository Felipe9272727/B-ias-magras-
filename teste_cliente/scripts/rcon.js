const { Rcon } = require('/tmp/mc/tools/node_modules/rcon-client')
;(async () => { const r = await Rcon.connect({ host: 'localhost', port: 25575, password: 'teste' })
  for (const c of process.argv.slice(2)) console.log(c, '=>', await r.send(c)); r.end() })()
