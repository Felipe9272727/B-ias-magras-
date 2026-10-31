import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {CONFIG, validarElenco, parceirosLobos, escolherAlvoLobos, vencedor, resolverAguaBenta, espiritoMatou, suspeitosXerife} from './regras_ep2.mjs'

test('16 jogadores de 10 modelos, com uma Luna e um DeepSeek', () => {
  validarElenco()
  assert.equal(new Set(CONFIG.players.map(j => j.modelId)).size, 10)
  assert.equal(CONFIG.players.filter(j => j.modelId === 'openai/gpt-6-luna').length, 1)
  assert.equal(CONFIG.players.filter(j => j.modelId.startsWith('deepseek/')).length, 1)
  assert.equal(CONFIG.roles.filter(p => p === 'aldeao').length, 4)
  for (const p of ['padre','xerife','vidente_espiritual']) assert.equal(CONFIG.roles.filter(x=>x===p).length,1)
})
test('Padre mata o lobo ou morre se errar, sem converter ninguém', () => {
  const padre={nome:'P',papel:'padre',vivo:true}, lobo={nome:'L',papel:'lobo_vidente',vivo:true}, vila={nome:'V',papel:'medico',vivo:true}
  assert.deepEqual(resolverAguaBenta(padre,lobo),{morto:lobo,acertou:true})
  assert.deepEqual(resolverAguaBenta(padre,vila),{morto:padre,acertou:false})
  assert.equal(lobo.papel,'lobo_vidente')
  assert.throws(()=>resolverAguaBenta(padre,padre),/inválida/)
})
test('Xerife recebe dois suspeitos com um executor, sem confirmar inocência', () => {
  const js=['X','L','V','A'].map(nome=>({nome,vivo:true}))
  const mortes=[{nome:'V',autor:'L'}];js[2].vivo=false
  for (const seed of [0,.99]) {
    const p=suspeitosXerife('V','X',mortes,js,()=>seed)
    assert.equal(p.length,2);assert.equal(new Set(p).size,2)
    assert.ok(p.includes('L'));assert.ok(p.includes('A'))
  }
  assert.equal(suspeitosXerife('A','X',mortes,js,()=>0),null)
})
test('Vidente Espiritual só recebe resultado conjunto de assassinato consumado', () => {
  assert.equal(espiritoMatou(['A','B'],new Set(['B'])),true)
  assert.equal(espiritoMatou(['A','B'],new Set()),false)
  assert.equal(espiritoMatou(['A','B'],new Set(['C'])),false)
})
test('cada lobo conhece os três aliados, sem repetir a si mesmo ou revelar a vila', () => {
  const lobos = ['A','B','C','D'].map((nome,i) => ({nome,papel:i===3?'lobo_vidente':'lobisomem'}))
  for (const eu of lobos) {
    const texto = parceirosLobos(lobos,eu,{lobisomem:'Lobisomem',lobo_vidente:'Lobo Vidente'})
    assert.equal(texto.split(', ').length,3)
    assert.ok(!texto.includes(eu.nome+' ('))
    for (const outro of lobos.filter(j=>j!==eu)) assert.ok(texto.includes(outro.nome+' ('))
  }
})
test('ataque respeita maioria e desempate é reproduzível', () => {
  assert.equal(escolherAlvoLobos(['A','A','A','B'],()=>.99),'A')
  assert.equal(escolherAlvoLobos(['A','B','A','B'],()=>0),'A')
  assert.equal(escolherAlvoLobos(['A','B','A','B'],()=>.99),'B')
  assert.equal(escolherAlvoLobos([],()=>0),null)
})
test('vitória usa todos os lobos, não o número fixo da parte 1', () => {
  const js=[...Array.from({length:4},()=>({papel:'lobisomem',vivo:true})),...Array.from({length:5},()=>({papel:'aldeao',vivo:true}))]
  assert.equal(vencedor(js),null)
  js.at(-1).vivo=false;assert.equal(vencedor(js),'lobos')
  js.filter(j=>j.papel==='lobisomem').forEach(j=>j.vivo=false)
  assert.equal(vencedor(js),'aldeia')
})
test('partida técnica completa mantém 16 papéis e não cria dados reais', async () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wolves-ep2-test-'))
  process.env.LOBO_EP2_TEST='1';process.env.LOBO_EP2_LOG_DIR=dir;process.env.LOBO_EP2_SPOOL=path.join(dir,'spool')
  const {decisorDeTeste}=await import('./ia_ep2.mjs')
  const pedidos=[]
  decisorDeTeste(({prompt,system})=>{
    pedidos.push({prompt,system})
    const listas=[...prompt.matchAll(/(?:vivos|Quem pode ser atacado):\s*([^\n)]+)/gi)]
    const ultima=listas.at(-1)?.[1]??''
    const nomes=CONFIG.players.filter(j=>ultima.includes(j.nome)).map(j=>j.nome)
    const alvo=nomes[0]??'ninguém'
    return {fala:'Vamos conferir os votos anteriores.',mensagem:'Vamos avaliar as informações.',alvo,alvos:[alvo],voto:alvo,pensamento:'Decisão técnica sintética.',expressao:'pensando',executar:false,atirar:null,aguaBenta:null}
  })
  const {partida}=await import('./motor_ep2.mjs')
  await partida(5,41595)
  const log=JSON.parse(fs.readFileSync(path.join(dir,'partida5.json'),'utf8'))
  assert.equal(log.synthetic,true)
  assert.equal(log.jogadores.length,16)
  assert.ok(log.resultado)
  assert.ok(log.noites.length<=10)
  assert.equal(log.jogadores.filter(j=>['lobisomem','lobo_vidente'].includes(j.papel)).length,4)
  const consulta=log.noites[0].loboVidente
  assert.equal(consulta.momento,'antes_chat')
  assert.equal(consulta.compartilhadoCom.length,4)
  const nomesPapel=(await import('./motor_ep2.mjs')).NOME_PAPEL
  const primeiraNoite=pedidos.filter(p=>p.prompt.includes('NOITE 1. Chat secreto dos lobos'))
  assert.equal(primeiraNoite.length,8)
  for(const p of primeiraNoite) assert.ok(p.prompt.includes(`${consulta.alvo} é ${nomesPapel[consulta.papel]}`))
  const vila=pedidos.filter(p=>!p.system.includes('Seus parceiros lobos são'))
  assert.ok(vila.every(p=>!p.prompt.includes('o Lobo Vidente revelou:')))
  for(const n of log.noites) for(const chave of ['xerife','videnteEspiritual']) if(n[chave]) {
    const investigador=log.jogadores.find(j=>j.papel===(chave==='xerife'?'xerife':'vidente_espiritual'))
    if(n.mortes.some(m=>m.nome===investigador.nome)) assert.equal(n[chave].recebeu,false)
  }
  const nomes=new Set(log.jogadores.map(j=>j.nome))
  for (const dia of log.dias) for (const [de,para] of Object.entries(dia.votos)) {
    assert.ok(nomes.has(de));assert.ok(para==='ninguém'||nomes.has(para))
  }
  decisorDeTeste(()=>({}))
  await assert.rejects(partida(6,49514),/partida pausada/)
  assert.equal(fs.existsSync(path.join(dir,'partida6.json')),false)
})
