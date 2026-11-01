"""Small durable I/O boundary for the connected tools; never invokes a model."""
import json
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
SPOOL=ROOT/'lobisomem/.spool_ep2'

def main():
    command=sys.argv[1]
    if command=='pending':
        limit=sys.argv[2] if len(sys.argv)>2 else '1'
        r=subprocess.run([sys.executable,str(ROOT/'lobisomem/ponte_ep2.py'),'pending','--limit',limit],check=True,capture_output=True,text=True)
        # Remote verification writes its own JSON before the bridge result.
        # Read the final bridge record without losing an already reserved job.
        data=json.loads(r.stdout.strip().splitlines()[-1])
        p=ROOT/'lobisomem/recovery/runtime_pending.json'
        tmp=p.with_suffix('.part');tmp.write_text(r.stdout);tmp.replace(p)
        print(json.dumps({**data,'jobs':[j['id'] for j in data['jobs']]}))
    elif command=='work':
        jobs=[]
        for p in (SPOOL/'req_work').glob('*/*.json'):
            if (SPOOL/'cache'/p.name).exists() or (SPOOL/'audit_work'/p.name).exists():continue
            d=json.loads(p.read_text());jobs.append({k:d[k] for k in ['id','playerId','model']})
        print(json.dumps(jobs))
    elif command=='size':print(len((ROOT/sys.argv[2]).read_text()))
    elif command=='read':
        text=(ROOT/sys.argv[2]).read_text();start=int(sys.argv[3]);length=int(sys.argv[4]);print(json.dumps(text[start:start+length]))
    elif command=='write':
        p=ROOT/sys.argv[2];p.parent.mkdir(parents=True,exist_ok=True)
        with p.open(sys.argv[3]) as f:f.write(sys.argv[4])
    elif command=='install':
        p=ROOT/sys.argv[2];data=json.loads(p.read_text())
        dest=SPOOL/'raw_tools'/(data['job']['id']+'.json');dest.parent.mkdir(exist_ok=True);p.replace(dest)
        r=subprocess.run([sys.executable,str(ROOT/'lobisomem/ponte_ep2.py'),'answer'],input=json.dumps(data['value']),capture_output=True,text=True)
        print(r.stdout);print(r.stderr);sys.exit(r.returncode)
    else:raise ValueError(command)

if __name__=='__main__':main()
