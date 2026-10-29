// bot de teste que anda/pula em volta. uso: NODE_PATH=<node_modules> node bot_teste.js [Nome]
// SLOW=4 desacelera a física do mineflayer (50 ms fixo) para combinar com /tick rate 5
const f = Number(process.env.SLOW || 1)
const si = global.setInterval; global.setInterval = (fn, ms, ...a) => si(fn, (ms || 0) * f, ...a)
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({ host: 'localhost', port: 25565, username: process.argv[2] || 'Andarilho', version: '1.21.4' })
bot.once('spawn', () => {
  console.log('spawn', bot.entity.position)
  let t = 0
  setInterval(() => {
    t++
    bot.look(t * 0.15, Math.sin(t / 10) * 0.3, true)
    bot.setControlState('forward', true)
    bot.setControlState('jump', t % 20 < 6)
    bot.setControlState('sprint', t % 60 < 30)
  }, 100)
})
bot.on('error', e => console.log('err', e.message))
bot.on('kicked', r => console.log('kicked', r))
