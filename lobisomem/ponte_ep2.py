"""File bridge used by the connected OpenRouter tools; no API key is handled here.

pending reserves a conservative maximum cost before each external call.
answer consumes one JSON object on stdin and installs the actual model result.
Uncertain calls stay reserved and are never dispatched a second time silently.
"""
import argparse
import json
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / 'elenco_ep2.json').read_text())
SPOOL = ROOT / '.spool_ep2'
LEDGER = SPOOL / 'ledger.json'


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False))
    temp.replace(path)


def ledger():
    return json.loads(LEDGER.read_text()) if LEDGER.exists() else {'calls': {}, 'budgetUsd': CONFIG['budgetUsd']}


def total(d):
    return sum(c.get('costUsd') if c.get('costUsd') is not None else c['reservedUsd'] for c in d['calls'].values())


def main():
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('command', choices=['pending', 'answer', 'status'])
    ap.add_argument('--limit', type=int, default=1)
    args = ap.parse_args()
    d = ledger()
    if args.command == 'pending':
        jobs = []
        blocked = []
        for path in sorted((SPOOL / 'req').glob('*.json')):
            item = json.loads(path.read_text())
            key = item['id']
            if key in d['calls']:
                continue
            p = CONFIG['pricesPerMillion'][item['model']]
            # UTF-8 bytes bound token count conservatively; all prompts are <100k.
            max_input = len((item['system'] + item['message']).encode()) + 512
            reserved = (max_input * p['input'] + item['max_tokens'] * p['output']) / 1_000_000
            if total(d) + reserved > d['budgetUsd']:
                blocked.append(key)
                continue
            d['calls'][key] = {'model': item['model'], 'reservedUsd': reserved,
                'status': 'dispatching', 'startedAt': time.time(), 'costUsd': None}
            jobs.append(item)
            if len(jobs) >= args.limit:
                break
        write(LEDGER, d)
        print(json.dumps({'jobs': jobs, 'blocked': blocked, 'committedUsd': total(d),
            'budgetUsd': d['budgetUsd']}, ensure_ascii=False))
    elif args.command == 'answer':
        item = json.load(sys.stdin)
        key = item['id']
        c = d['calls'][key]
        if c['status'] == 'completed':
            raise RuntimeError('Already completed; refusing to replace a paid decision')
        if item.get('costUsd') is not None:
            c['costUsd'] = float(item['costUsd'])
        c.update(status='completed' if item.get('ok') else 'failed', generationId=item.get('generationId'))
        write(SPOOL / 'res' / (key + '.json'), item)
        write(SPOOL / 'audit' / (key + '.json'), item)
        write(LEDGER, d)
        print(json.dumps({'completed': key, 'calls': len(d['calls']), 'committedUsd': total(d)}))
    else:
        print(json.dumps({'calls': len(d['calls']), 'committedUsd': total(d),
            'budgetUsd': d['budgetUsd'], 'uncertain': [k for k,c in d['calls'].items()
                if c['status'] == 'dispatching']}))


if __name__ == '__main__':
    main()
