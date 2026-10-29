// desacelera todos os timers (física do mineflayer = 50ms fixo) pelo fator SLOW
const f = Number(process.env.SLOW || 1)
const si = global.setInterval; global.setInterval = (fn, ms, ...a) => si(fn, (ms || 0) * f, ...a)
require('./bot.js')
