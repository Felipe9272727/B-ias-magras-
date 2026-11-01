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
  const usados=new Set()
  return {
    async chamar(ator,system,prompt,options,transport) {
      // Atribuído antes do await: votos simultâneos mantêm a ordem determinística.
      const ordem=indice++
      const pedido={ator,system,prompt,options}
      const id=hash(pedido)
      let item=dados.decisoes[ordem]
      if(!item || item.id!==id || usados.has(item.i)) {
        // Concurrent invalid votes can schedule their retries in a different
        // arrival order during recovery. Reuse only a complete, exact request
        // hash; never change the original journal order or recorded response.
        item=dados.decisoes.find(x=>x.id===id && !usados.has(x.i))
        if(!item && dados.decisoes.some(x=>!usados.has(x.i))) throw new Error(`Replay divergente na decisão ${ordem}; nenhuma nova chamada será feita.`)
      }
      const i=item?.i ?? dados.decisoes.length
      usados.add(i)
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
      if(indice!==dados.decisoes.length || usados.size!==dados.decisoes.length || dados.decisoes.some(d=>!d.resposta)) throw new Error('Diário incompleto; não pode concluir a partida.')
      dados.status='completed'
      atomicJson(file,dados)
    }
  }
}
