
const root="/workspace/wolvesville";
const q=s=>"'"+s.replace(/'/g,"'\\''")+"'";
async function shell(cmd,max=2000){
 let r=await tools.exec_command({cmd,workdir:root,max_output_tokens:max,yield_time_ms:1000}),out=r.output;
 while(r.session_id){r=await tools.write_stdin({session_id:r.session_id,chars:"",yield_time_ms:1000,max_output_tokens:max});out+=r.output;}
 if(r.exit_code!==0||out.startsWith("Warning:"))throw Error(out.slice(0,2000));return out;
}
async function readFile(path){
 const size=Number(await shell("python3 lobisomem/runtime_io_ep2.py size "+q(path),200));
 const results=await Promise.allSettled(Array.from({length:Math.ceil(size/25000)},(_,i)=>shell("python3 lobisomem/runtime_io_ep2.py read "+q(path)+" "+(i*25000)+" 25000",20000)));
 let value="";for(const r of results){if(r.status==="rejected")throw r.reason;value+=JSON.parse(r.value);}return value;
}
async function writeFile(path,value){
 for(let i=0;i<value.length;i+=25000)await shell("python3 lobisomem/runtime_io_ep2.py write "+q(path)+" "+(i?"a":"w")+" "+q(value.slice(i,i+25000)),100);
}
let checkpointQueue=Promise.resolve();
const checkpoint=()=>{checkpointQueue=checkpointQueue.then(()=>shell("python3 lobisomem/checkpoint_ep2.py --push",1500));return checkpointQueue;};
async function request(job){
 if(job.model.startsWith("openai/"))throw Error("OpenAI routing blocked");
 const parameters={model:job.model,system:job.system,message:job.message,max_tokens:job.max_tokens,...(job.reasoning_effort?{reasoning_effort:job.reasoning_effort}:{})};
 if((job.model.startsWith("qwen/")||job.model.startsWith("deepseek/")||job.model.startsWith("xiaomi/"))&&(job.attempt>0||job.message.startsWith("A partida acabou.")))parameters.reasoning_effort="none";
 if(job.model.startsWith("qwen/")&&job.attempt>=4)parameters.reasoning_effort="high";
 await writeFile("lobisomem/.spool_ep2/dispatch/"+job.id+".json",JSON.stringify({id:job.id,parameters,startedAt:new Date().toISOString()}));
 await checkpoint();
 store("currentPaidRequest",job.id);
 const response=await tools.mcp__codex_apps__openrouter_send_message(parameters);
 store("lastRawResponse",{job,response});
 const raw=(response.content??[]).filter(c=>c.type==="text").map(c=>c.text).join("\n");
 const generationId=raw.match(/generation id:\s*([^,\s)]+)/)?.[1];
 const textValue=raw.split("\n\n(model:")[0];
 const value={id:job.id,ok:!response.isError&&!!generationId&&!!textValue.trim(),source:"openrouter",model:job.model,text:textValue,generationId:generationId??null,costUsd:null,actualParameters:{model:job.model,max_tokens:parameters.max_tokens,reasoning_effort:parameters.reasoning_effort},...(!generationId?{error:raw}:{})};
 if(generationId){
  try{
   const priced=await tools.mcp__codex_apps__openrouter_get_generation({request:{id:generationId}});
   const receipt=JSON.parse(priced.content.find(x=>x.type==="text").text).data;
   if(!priced.isError&&receipt.id===generationId&&typeof receipt.total_cost==="number"&&receipt.total_cost>=0){
    value.costUsd=receipt.total_cost;
    await writeFile("lobisomem/.spool_ep2/cost_receipts/"+job.id+".json",JSON.stringify({ledgerId:job.id,generationId,costUsd:receipt.total_cost,provider:receipt.provider_name,nativeTokensPrompt:receipt.native_tokens_prompt,nativeTokensCompletion:receipt.native_tokens_completion,finishReason:receipt.finish_reason}));
   }
  }catch(error){store("lastPriceLookupError",String(error));}
 }
 const dest="lobisomem/.spool_ep2/raw_tools/"+job.id+".part";
 await writeFile(dest,JSON.stringify({job,response,value}));
 const installed=await shell("python3 lobisomem/runtime_io_ep2.py install "+q(dest),1000);
 notify({player:job.playerId,ok:value.ok});
 if(!value.ok)throw Error("External call failed; evidence saved, no automatic retry: "+raw.slice(0,1500));
 await checkpoint();
 return {player:job.playerId,id:job.id,ok:value.ok,generationId};
}
const started=Date.now();let paid=[];
while(Date.now()-started<180000){
 let p;
 const resume=load("reservedUndispatched");
 if(resume){p={jobs:[resume]};store("reservedUndispatched",null);}
 else p=JSON.parse(await shell("LOBO_EP2_VERIFY_REMOTE=1 python3 lobisomem/runtime_io_ep2.py pending 16",3000));
 if(p.jobs.length){
  const jobs=[];for(const id of p.jobs)jobs.push(JSON.parse(await readFile("lobisomem/.spool_ep2/req/"+id+".json")));
  const results=await Promise.allSettled(jobs.map(request));
  for(const r of results){if(r.status==="rejected")throw r.reason;paid.push(r.value);}
 }else{
  const pending=JSON.parse(await shell("python3 lobisomem/runtime_io_ep2.py work",3000));
  store("workPending",pending);text({answered:paid.length,committedUsd:p.committedUsd,work:pending});exit();
 }
}
text({answered:paid.length});
