const mineflayer = require('/tmp/mc/tools/node_modules/mineflayer')
const bot = mineflayer.createBot({ host: 'localhost', port: 25565, username: 'Andarilho', version: '1.21.4' })
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
