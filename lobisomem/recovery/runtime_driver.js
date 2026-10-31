
const root="/workspace/scratch/35b50bf2011d/repo";
const q=s=>"'"+s.replace(/'/g,"'\\''")+"'";
async function shell(cmd,max=2000){let r=await tools.exec_command({cmd,workdir:root,max_output_tokens:max,yield_time_ms:1000});let out=r.output;while(r.session_id){r=await tools.write_stdin({session_id:r.session_id,chars:"",yield_time_ms:1000,max_output_tokens:max});out+=r.output;}if(r.exit_code!==0)throw Error(out);return out;}
async function request(job){
 if(job.model.startsWith("openai/"))throw Error("OpenAI routing blocked");
 const parameters={model:job.model,system:job.system,message:job.message,max_tokens:job.max_tokens,...(job.reasoning_effort?{reasoning_effort:job.reasoning_effort}:{})};
 if(job.model.startsWith("qwen/")&&(job.attempt>0||job.message.includes("A partida acabou.")))parameters.reasoning_effort="none";
 const response=await tools.mcp__codex_apps__openrouter_send_message(parameters);
 const raw=(response.content??[]).filter(c=>c.type==="text").map(c=>c.text).join("\n");
 const generationId=raw.match(/generation id:\s*([^,\s)]+)/)?.[1];
 const textValue=raw.split("\n\n(model:")[0];
 const value={id:job.id,ok:!response.isError&&!!generationId&&!!textValue.trim(),source:"openrouter",model:job.model,text:textValue,generationId:generationId??null,costUsd:null,actualParameters:{model:job.model,max_tokens:parameters.max_tokens,reasoning_effort:parameters.reasoning_effort},...(!generationId?{error:raw}:{})};
 const data={job,response,value};
 const py="import json,sys,subprocess\nfrom pathlib import Path\nd=json.loads(sys.argv[1]);p=Path('lobisomem/.spool_ep2/raw_tools')/(d['job']['id']+'.json');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False));r=subprocess.run([sys.executable,'lobisomem/ponte_ep2.py','answer'],input=json.dumps(d['value']),text=True,capture_output=True);print(r.stdout);print(r.stderr);sys.exit(r.returncode)";
 const installed=await shell("python3 -c "+q(py)+" "+q(JSON.stringify(data)),1200);
 return {player:job.playerId,id:job.id,ok:value.ok,generationId,installed};
}
const started=Date.now();let paid=[];
while(Date.now()-started<25000){
 const raw=await shell("python3 lobisomem/ponte_ep2.py pending --limit 4",26000);const p=JSON.parse(raw);
 if(p.jobs.length){
 const settled=await Promise.allSettled(p.jobs.map(request));for(const r of settled){if(r.status==="rejected")throw r.reason;paid.push(r.value);}
 }else{
 const pending=JSON.parse(await shell("python3 -c "+q("import json\nfrom pathlib import Path\ns=Path('lobisomem/.spool_ep2');print(json.dumps([json.loads(p.read_text()) for p in (s/'req_work').glob('*/*.json') if not (s/'cache'/p.name).exists() and not (s/'audit_work'/p.name).exists()],ensure_ascii=False))"),22000));
 text({paid,committedUsd:p.committedUsd,work:pending.map(j=>({id:j.id,playerId:j.playerId,model:j.model}))});store("workPending",pending);exit();
 }
}
text({paid});
