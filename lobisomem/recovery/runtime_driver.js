
const root="/workspace/scratch/35b50bf2011d/repo";
const q=s=>"'"+s.replace(/'/g,"'\\''")+"'";
async function shell(cmd,max=1500){
 let r=await tools.exec_command({cmd,workdir:root,max_output_tokens:max,yield_time_ms:1000}),out=r.output;
 while(r.session_id){r=await tools.write_stdin({session_id:r.session_id,chars:"",yield_time_ms:1000,max_output_tokens:max});out+=r.output;}
 if(r.exit_code!==0||out.startsWith("Warning:"))throw Error(out.slice(0,1000));return out;
}
async function readFile(path){
 const size=Number(await shell("python3 lobisomem/runtime_io_ep2.py size "+q(path)));
 const parts=await Promise.allSettled(Array.from({length:Math.ceil(size/9000)},(_,i)=>shell("python3 lobisomem/runtime_io_ep2.py read "+q(path)+" "+i*9000+" 9000",10000)));
 let text="";for(const r of parts){if(r.status==="rejected")throw r.reason;text+=JSON.parse(r.value);}return text;
}
async function writeFile(path,value){
 for(let i=0;i<value.length;i+=25000)await shell("python3 lobisomem/runtime_io_ep2.py write "+q(path)+" "+(i?"a":"w")+" "+q(value.slice(i,i+25000)),100);
}
async function request(job){
 if(job.model.startsWith("openai/"))throw Error("OpenAI routing blocked");
 const parameters={model:job.model,system:job.system,message:job.message,max_tokens:job.max_tokens,...(job.reasoning_effort?{reasoning_effort:job.reasoning_effort}:{})};
 if((job.model.startsWith("qwen/")||job.model.startsWith("deepseek/"))&&(job.attempt>0||job.message.startsWith("A partida acabou.")))parameters.reasoning_effort="none";
 await writeFile("lobisomem/.spool_ep2/dispatch/"+job.id+".json",JSON.stringify({id:job.id,parameters,startedAt:new Date().toISOString()}));
 store("currentPaidRequest",job.id);
 const response=await tools.mcp__codex_apps__openrouter_send_message(parameters);
 store("lastRawResponse",{job,response});
 const raw=(response.content??[]).filter(c=>c.type==="text").map(c=>c.text).join("\n");
 const generationId=raw.match(/generation id:\s*([^,\s)]+)/)?.[1];
 const textValue=raw.split("\n\n(model:")[0];
 const value={id:job.id,ok:!response.isError&&!!generationId&&!!textValue.trim(),source:"openrouter",model:job.model,text:textValue,generationId:generationId??null,costUsd:null,actualParameters:{model:job.model,max_tokens:parameters.max_tokens,reasoning_effort:parameters.reasoning_effort},...(!generationId?{error:raw}:{})};
 const dest="lobisomem/.spool_ep2/raw_tools/"+job.id+".part";
 await writeFile(dest,JSON.stringify({job,response,value}));
 const installed=await shell("python3 lobisomem/runtime_io_ep2.py install "+q(dest),1000);
 notify({player:job.playerId,ok:value.ok});if(!value.ok)throw Error("External call rejected or failed; raw evidence saved, stop without retry.");
 return {player:job.playerId,id:job.id,ok:value.ok,generationId,installed};
}
const engineSession=81148;
async function heartbeat(){const r=await tools.write_stdin({session_id:engineSession,chars:"",yield_time_ms:1000,max_output_tokens:200});if(r.exit_code!==undefined){store("engineExit",r);if(r.exit_code!==0)throw Error("Engine stopped: "+r.output);}}
await heartbeat();
const started=Date.now();let paid=[];
while(Date.now()-started<50000){
 const p=JSON.parse(await shell("python3 lobisomem/runtime_io_ep2.py pending",1200));
 store("lastReservedIds",p.jobs);
 if(p.jobs.length){
  for(const id of p.jobs){const job=JSON.parse(await readFile("lobisomem/.spool_ep2/req/"+id+".json"));paid.push(await request(job));}
 }else{
  const pending=JSON.parse(await shell("python3 lobisomem/runtime_io_ep2.py work",3000));
  await heartbeat();store("workPending",pending);text({answered:paid.length,committedUsd:p.committedUsd,work:pending});exit();
 }
}
await heartbeat();text({answered:paid.length});
