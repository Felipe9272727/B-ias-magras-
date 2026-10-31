"""Preserva decisões e ledger no Git antes da próxima inferência paga.

Uso: python3 lobisomem/checkpoint_ep2.py --push
Restauração sem sobrescrever arquivos existentes: ... --restore
Nunca inclui credenciais, variáveis de ambiente ou arquivos fora das raízes declaradas.
"""
import argparse
import base64
import gzip
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'lobisomem/recovery/checkpoints/current.json'
PREFIXES = ['lobisomem/logs_ep2', 'lobisomem/.spool_ep2']


def unpack(value):
    if value.get('encoding') == 'gzip+base64':
        data = gzip.decompress(base64.b64decode(value['data']))
        if hashlib.sha256(data).hexdigest() != value['sha256']:
            raise RuntimeError('Hash inválido do snapshot comprimido')
        return json.loads(data)
    return value


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()


def main():
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('--push', action='store_true')
    ap.add_argument('--restore', action='store_true')
    ap.add_argument('--verify-remote', action='store_true')
    args = ap.parse_args()
    if args.restore:
        saved = unpack(json.loads(DEST.read_text()))
        for name, item in saved['files'].items():
            rel = Path(name)
            if rel.is_absolute() or '..' in rel.parts or not any(name.startswith(p + '/') for p in PREFIXES):
                raise RuntimeError('Caminho fora do checkpoint: ' + name)
            data = item['text'].encode()
            if hashlib.sha256(data).hexdigest() != item['sha256']:
                raise RuntimeError('Hash inválido no checkpoint: ' + name)
            p = ROOT / rel
            if p.exists() and p.read_bytes() != data:
                raise RuntimeError('Arquivo diferente já existe; preserve as duas versões: ' + name)
        for name, item in saved['files'].items():
            p = ROOT / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(item['text'])
        print(json.dumps({'restoredFiles': len(saved['files'])}))
        return
    if git('branch', '--show-current') != 'codex/wolvesville-ep2-16p-20261031':
        raise RuntimeError('Checkpoint permitido somente na branch de recuperação')
    files = {}
    for prefix in PREFIXES:
        for p in sorted((ROOT / prefix).rglob('*.json')):
            try:
                data = p.read_bytes()
            except FileNotFoundError:
                continue  # O transporte consome arquivos temporários entre glob e read.
            value = json.loads(data)
            if value.get('synthetic') or value.get('identidade', {}).get('synthetic'):
                raise RuntimeError('Registro sintético não pode entrar no checkpoint real')
            files[str(p.relative_to(ROOT))] = {'sha256': hashlib.sha256(data).hexdigest(), 'text': data.decode()}
    if not files:
        print(json.dumps({'checkpointFiles': 0, 'pushed': False}))
        return
    raw = json.dumps({'version': 1, 'files': files}, ensure_ascii=False).encode()
    packed = {'version':2, 'encoding':'gzip+base64', 'sha256':hashlib.sha256(raw).hexdigest(),
              'fileCount':len(files), 'data':base64.b64encode(gzip.compress(raw,mtime=0)).decode()}
    payload = json.dumps(packed, ensure_ascii=False) + '\n'
    if not DEST.exists() or DEST.read_text() != payload:
        DEST.parent.mkdir(parents=True, exist_ok=True)
        DEST.write_text(payload)
    if args.verify_remote:
        git('fetch', 'origin', 'codex/wolvesville-ep2-16p-20261031')
        try:
            remote = unpack(json.loads(git('show', 'FETCH_HEAD:' + str(DEST.relative_to(ROOT)))))
            key = 'lobisomem/.spool_ep2/ledger.json'
            current_ledger = json.loads(files[key]['text'])
            saved_ledger = json.loads(remote['files'][key]['text'])
            for call_id, call in current_ledger['calls'].items():
                if call.get('status') != 'completed':
                    continue
                if saved_ledger['calls'].get(call_id) != call:
                    raise ValueError('ledger não preservado')
                audit = 'lobisomem/.spool_ep2/audit/' + call_id + '.json'
                if remote['files'][audit] != files[audit]:
                    raise ValueError('resposta não preservada')
        except (KeyError, ValueError, subprocess.CalledProcessError) as error:
            raise RuntimeError('CHECKPOINT_REQUIRED: salve current.json pelo conector GitHub antes de novas cobranças') from error
    if args.push:
        if git('diff', '--cached', '--name-only'):
            raise RuntimeError('Há alterações staged: checkpoint não vai misturá-las no commit')
        git('add', str(DEST.relative_to(ROOT)))
        if git('diff', '--cached', '--name-only'):
            git('-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com', 'commit', '-m', 'Checkpoint paid Wolvesville decisions and budget ledger')
        git('push', 'origin', 'HEAD:codex/wolvesville-ep2-16p-20261031')
    print(json.dumps({'checkpointFiles': len(files), 'pushed': args.push, 'remoteVerified': args.verify_remote}))


if __name__ == '__main__':
    main()
