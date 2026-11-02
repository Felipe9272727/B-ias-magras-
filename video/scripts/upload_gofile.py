"""Upload one verified export to GoFile; save only a public, checksum-verified receipt."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

p=argparse.ArgumentParser();p.add_argument('video',type=Path);p.add_argument('--verification',type=Path,required=True);p.add_argument('--receipt',type=Path,required=True);args=p.parse_args()
if args.receipt.exists():
    print(args.receipt.read_text());raise SystemExit(0)
sha=hashlib.sha256();md5=hashlib.md5()
with args.video.open('rb') as f:
    for chunk in iter(lambda:f.read(1024*1024),b''):sha.update(chunk);md5.update(chunk)
verified=json.loads(args.verification.read_text());assert verified['verifiedActualExport'] and verified['fullDecodeVerified'] and verified['sha256']==sha.hexdigest()
with urllib.request.urlopen('https://api.gofile.io/servers',timeout=30) as response:servers=json.load(response)
assert servers['status']=='ok'
server=servers['data']['servers'][0]['name'];assert server.replace('-','').isalnum()
with tempfile.NamedTemporaryFile() as response_file:
    run=subprocess.run(['curl','--fail-with-body','--silent','--show-error','--connect-timeout','30','--max-time','1200','--form',f'file=@{args.video};filename=Wolvesville_Parte_2_Nativo_1080p.mp4;type=video/mp4',f'https://{server}.gofile.io/uploadFile','--output',response_file.name],capture_output=True,text=True)
    if run.returncode:raise RuntimeError(f'GoFile upload failed, curl exit {run.returncode}; inspect before any retry')
    d=json.loads(Path(response_file.name).read_text());assert d['status']=='ok';v=d['data']
assert v['size']==args.video.stat().st_size and v['md5']==md5.hexdigest()
with urllib.request.urlopen(urllib.request.Request(v['downloadPage'],headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as response:assert response.status==200
receipt={'status':'complete_verified','downloadPage':v['downloadPage'],'name':v['name'],'fileId':v['id'],'bytes':v['size'],'md5':v['md5'],'sha256':sha.hexdigest(),'fullDecodeVerified':True,'downloadPageHttpStatus':200}
args.receipt.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
