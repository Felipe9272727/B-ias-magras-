// Resumo compacto da fase do abrigo de uma partida (para escrever o roteiro): um dia por linha, só o que importa.
// Uso: node sessenta/ferramentas/resumo_abrigo.mjs ep5_gpt
import fs from 'node:fs'
const l = JSON.parse(fs.readFileSync(`sessenta/logs/${process.argv[2]}.json`, 'utf8'))
const imp = /não voltou|voltou da|trouxe|achou|morreu|não resistiu|fugiu|saiu de casa|mutante|Conquista|resgat|louc|batendo bem|doente|ferid|bandid|militar|rádio|carro|gêmeos|Lia|veículo|cadeado|não volta|some|cientista|gato/i
for (const d of l.dias) {
  const dentro = d.antes.pessoas.filter((p) => p.vivo && p.noAbrigo).map((p) => p.id[0] + p.id.slice(1, 3)).join(',')
  const ev = d.evento ? `${d.evento.id}→${d.evento.escolhida}` : '-'
  const lin = (d.diario || []).filter((x) => imp.test(x)).join(' / ')
  const exp = d.resposta?.expedicao?.quem ? ` EXP:${d.resposta.expedicao.quem}+${(d.resposta.expedicao.itens || []).join('+')}` : ''
  console.log(`D${d.dia}${d.virada ? 'v' : ''} [${dentro}] ${ev}${exp} | ${lin.slice(0, 260)}${d.resposta?.diario ? ` | IA: "${d.resposta.diario.slice(0, 120)}"` : ''}`)
}
console.log('FINAL', JSON.stringify(l.final))
