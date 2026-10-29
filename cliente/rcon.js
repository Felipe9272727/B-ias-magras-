// uso: NODE_PATH=<node_modules> node rcon.js "comando 1" "comando 2" ...
// env: RCON_HOST (localhost), RCON_PORT (25575), RCON_PASS (ias_local)
const { Rcon } = require('rcon-client')
;(async () => {
  const r = await Rcon.connect({
    host: process.env.RCON_HOST || 'localhost',
    port: Number(process.env.RCON_PORT || 25575),
    password: process.env.RCON_PASS || 'ias_local',
  })
  for (const c of process.argv.slice(2)) console.log(c, '=>', await r.send(c))
  r.end()
})().catch(e => { console.error('rcon:', e.message); process.exit(1) })
