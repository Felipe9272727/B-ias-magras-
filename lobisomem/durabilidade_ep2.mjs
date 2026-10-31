// Diário de decisões: replay exato, sem novas inferências para respostas preservadas.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
export function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive:true})
  const fd=fs.openSync(file+'.tmp','w',0o600)
  try {fs.writeFileSync(fd,JSON.stringify(value,null,1));fs.fsyncSync(fd)} finally {fs.closeSync(fd)}
  fs.renameSync(file+'.tmp',file)
}

export function diarioDecisoes(dir, identidade) {
  const file=path.join(dir,'decisoes.json')
  const fingerprint=hash(identidade)
  let dados
  if(fs.existsSync(file)) {
    dados=JSON.parse(fs.readFileSync(file,'utf8'))
    if(dados.fingerprint!==fingerprint) throw new Error('Execução incompatível: semente, código, elenco ou memória mudou. Preserve o diário existente.')
  } else {
    dados={version:1,fingerprint,identidade,createdAt:new Date().toISOString(),decisoes:[]}
    atomicJson(file,dados)
  }
  let indice=0
  return {
    async chamar(ator,system,prompt,options,transport) {
      // Atribuído antes do await: votos simultâneos mantêm a ordem determinística.
      const i=indice++
      const pedido={ator,system,prompt,options}
      const id=hash(pedido)
      let item=dados.decisoes[i]
      if(item && item.id!==id) throw new Error(`Replay divergente na decisão ${i}; nenhuma nova chamada será feita.`)
      if(item?.resposta) return item.resposta
      if(!item) {
        item={i,id,pedido,status:'pending'}
        dados.decisoes.push(item)
        atomicJson(file,dados)
      }
      // O transporte e seu ledger preservam a reserva de uma chamada incerta.
      const resposta=await transport()
      if(!resposta.synthetic && (!resposta.ok || !(resposta.generationId || (resposta.source==='chatgpt-work-subagent' && resposta.agentId && resposta.requestId)) || !resposta.text?.trim())) throw new Error('Resposta sem evidência de geração; diário permanece pendente.')
      item.resposta=resposta
      item.status='received'
      atomicJson(file,dados)
      return resposta
    },
    concluir() {
      if(indice!==dados.decisoes.length || dados.decisoes.some(d=>!d.resposta)) throw new Error('Diário incompleto; não pode concluir a partida.')
      dados.status='completed'
      atomicJson(file,dados)
    }
  }
}
