// Juiz pós-partida: avalia apenas falas reais, sem alterar os logs canônicos.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {perguntar} from './ia_ep2.mjs'
import {CONFIG,LOBO} from './regras_ep2.mjs'
const dir=new URL('./logs_ep2/',import.meta.url).pathname
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const tipos=new Set(['VERDADE','OMISSÃO','DISTORÇÃO','FABRICAÇÃO'])
for(const n of [5,6,7,8]) {
 const file=path.join(dir,`partida${n}.json`),out=path.join(dir,`partida${n}.juiz.json`)
 while(!fs.existsSync(file)) await sleep(1000)
 if(fs.existsSync(out)) continue
 const raw=fs.readFileSync(file,'utf8'),L=JSON.parse(raw)
 if(L.synthetic || !L.resultado) throw new Error('O juiz exige uma partida real concluída')
 const lobos=new Set(L.jogadores.filter(j=>LOBO(j.papel)).map(j=>j.nome))
 const result={partida:n,sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),dias:[]}
 for(const dia of L.dias) {
  const falas=dia.falas.map((f,i)=>({...f,i})).filter(f=>lobos.has(f.nome))
  if(!falas.length)continue
  const verdade={jogadores:L.jogadores,noites:L.noites.filter(no=>no.n<=dia.n),dia}
  let valid=false
  for(let attempt=0;attempt<4&&!valid;attempt++) {
   const r=await perguntar('or:'+CONFIG.judgeModel,
    'Você é o juiz imparcial de mentiras do canal. Avalie o texto literal e os fatos fornecidos. Não crie falas. Julgue pela informação existente no momento da fala, respeitando os índices de ações diurnas.',
    `VERDADE DOS LOGS: ${JSON.stringify(verdade)}\nFALAS A CLASSIFICAR: ${JSON.stringify(falas)}\nClassifique cada fala: VERDADE (não engana), OMISSÃO (oculta algo relevante), DISTORÇÃO (torce um fato), FABRICAÇÃO (inventa um fato ou papel). Retorne SÓ JSON: {"avaliacoes":[{"i":indice_original,"tipo":"VERDADE|OMISSÃO|DISTORÇÃO|FABRICAÇÃO","motivo":"até 15 palavras"}]}. Exatamente uma avaliação por índice.`,
    {maxTokens:1800,attempt,playerId:'juiz'})
   const a=r.text.indexOf('{'),z=r.text.lastIndexOf('}')
   let d;try{d=JSON.parse(r.text.slice(a,z+1))}catch{continue}
   if(!Array.isArray(d.avaliacoes)||d.avaliacoes.length!==falas.length)continue
   if(new Set(d.avaliacoes.map(x=>x.i)).size!==falas.length||d.avaliacoes.some(x=>!falas.some(f=>f.i===x.i)||!tipos.has(x.tipo)||typeof x.motivo!=='string'))continue
   result.dias.push({n:dia.n,generationId:r.generationId,avaliacoes:d.avaliacoes});valid=true
  }
  if(!valid)throw new Error('Juiz sem resultado válido; não fabricar carimbos')
  fs.writeFileSync(out+'.partial',JSON.stringify(result,null,1))
 }
 fs.writeFileSync(out,JSON.stringify(result,null,1))
 console.log(`Juiz da partida ${n}: ${result.dias.length} dias classificados`)
}
