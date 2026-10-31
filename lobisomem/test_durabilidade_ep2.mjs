import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import {diarioDecisoes} from './durabilidade_ep2.mjs'

test('retoma após interrupção e não paga de novo pela resposta preservada',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lobo-replay-'))
 const identity={seed:123,synthetic:true,memory:'individual'}
 const result={ok:true,text:'{"voto":"ninguém"}',generationId:'test-only-not-real'}
 let calls=0
 let journal=diarioDecisoes(dir,identity)
 assert.deepEqual(await journal.chamar('A','privado A','voto',{},async()=>{calls++;return result}),result)
 await assert.rejects(journal.chamar('B','privado B','voto',{},async()=>{throw new Error('interrupção técnica')}),/interrupção/)
 journal=diarioDecisoes(dir,identity)
 assert.deepEqual(await journal.chamar('A','privado A','voto',{},async()=>{throw new Error('cobrança duplicada')}),result)
 await journal.chamar('B','privado B','voto',{},async()=>{calls++;return result})
 journal.concluir()
 assert.equal(calls,2)
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'decisoes.json'))).status,'completed')
 assert.throws(()=>diarioDecisoes(dir,{...identity,seed:999}),/incompatível/)
 const replay=diarioDecisoes(dir,identity)
 await assert.rejects(replay.chamar('A','privado de B','voto',{},async()=>result),/Replay divergente/)
})

test('a partida interrompida e partidas sem predecessora não iniciam chamadas',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lobo-guard-'))
 for(const n of [5,6]) {
  const r=spawnSync(process.execPath,['lobisomem/motor_ep2.mjs',String(n),'123'],{cwd:new URL('../',import.meta.url),encoding:'utf8',env:{...process.env,LOBO_EP2_TEST:'0',LOBO_EP2_LOG_DIR:dir,LOBO_EP2_SPOOL:path.join(dir,'spool')}})
  assert.notEqual(r.status,0)
  assert.match(r.stderr,n===5?/bloqueada/:/partida anterior/)
 }
 assert.equal(fs.existsSync(path.join(dir,'spool','req')) && fs.readdirSync(path.join(dir,'spool','req')).length>0,false)
})

test('orçamento carrega reserva anterior e chamada incerta não é reemitida',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lobo-budget-'))
 const req=path.join(dir,'req');fs.mkdirSync(req)
 fs.writeFileSync(path.join(req,'technical.json'),JSON.stringify({id:'technical',model:'openai/gpt-6-luna',system:'Teste técnico',message:'Nenhuma inferência será feita',max_tokens:100}))
 const exec=()=>{
  const r=spawnSync('python3',['lobisomem/ponte_ep2.py','pending'],{cwd:new URL('../',import.meta.url),encoding:'utf8',env:{...process.env,LOBO_EP2_SPOOL:dir}})
  assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)
 }
 const first=exec();assert.equal(first.jobs.length,1);assert.ok(first.committedUsd>0.061152085)
 const second=exec();assert.equal(second.jobs.length,0);assert.equal(second.committedUsd,first.committedUsd)
})
