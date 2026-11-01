"""Auditoria offline. Não envia pedidos, não muda decisões e não libera reservas."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def read(p):
    return json.loads(p.read_text())


def audit(root=ROOT):
    spool = root / '.spool_ep2'
    ledger = read(spool / 'ledger.json')
    journals = {}
    received_ids = set()
    pending = []
    for p in sorted((root / 'logs_ep2').glob('execucao*/decisoes.json')):
        d = read(p)
        received = [x for x in d['decisoes'] if x.get('resposta')]
        for x in received:
            a = x['resposta']
            if a.get('requestId') or a.get('id'):
                received_ids.add(a.get('requestId') or a['id'])
        waiting = [x for x in d['decisoes'] if not x.get('resposta')]
        journals[p.parent.name] = {
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest(),
            'seed': d['identidade']['semente'],
            'received': len(received), 'pending': len(waiting),
            'completed': d.get('status') == 'completed',
        }
        for x in waiting:
            pending.append({'run': p.parent.name, 'index': x['i'],
                'decisionId': x['id'], 'playerId': x['pedido']['ator'],
                'requestIds': []})
    uncertain, reusable, unsent, conflicts = [], [], [], []
    requests = list((spool / 'req').glob('*.json')) + list((spool / 'req_work').glob('*/*.json'))
    for p in sorted(requests):
        request = read(p)
        key = request['id']
        call = ledger['calls'].get(key)
        receipts = []
        for folder in ['audit', 'audit_work', 'res', 'cache']:
            f = spool / folder / p.name
            if f.exists():
                value = read(f)
                receipts.append((folder, value.get('answer', value)))
        valid = [(folder, a) for folder, a in receipts if a.get('ok') and a.get('text', '').strip()
            and (a.get('generationId') or (a.get('source') == 'chatgpt-work-subagent'
            and a.get('agentId') and a.get('requestId') == key))]
        item = {'requestId': key, 'playerId': request.get('playerId'),
            'model': request['model'], 'ledgerStatus': (call or {}).get('status'),
            'dispatchMarker': (spool / 'dispatch' / p.name).exists(),
            'receiptLocations': [f for f, _ in receipts]}
        for x in pending:
            journal = read(root / 'logs_ep2' / x['run'] / 'decisoes.json')
            pedido = journal['decisoes'][x['index']]['pedido']
            if pedido['ator'] == request.get('playerId') and pedido['system'] == request['system'] and pedido['prompt'] == request['message']:
                x['requestIds'].append(key)
        if valid:
            if len({a['text'] for _, a in valid}) > 1:
                conflicts.append(item)
            else:
                item['generationId'] = valid[0][1].get('generationId')
                item['alreadyInJournal'] = key in received_ids
                reusable.append(item)
        elif call or item['dispatchMarker'] or receipts:
            uncertain.append(item)
        else:
            unsent.append(item)
    committed = ledger.get('previousAccountDeltaReservedUsd', 0) + sum(
        c.get('costUsd') if c.get('costUsd') is not None else c['reservedUsd']
        for c in ledger['calls'].values())
    final = root / 'logs_ep2/partida5.json'
    match5 = read(final)
    return {
        'version': 1, 'offlineOnly': True, 'newInferenceCalls': 0,
        'canResume': not uncertain and not conflicts,
        'partida5': {'result': match5['resultado'],
            'reflections': len(match5['reflexoes']),
            'sha256': hashlib.sha256(final.read_bytes()).hexdigest()},
        'journals': journals, 'pendingDecisions': pending,
        'uncertainRequests': uncertain, 'reusableReceipts': reusable,
        'unsentRequests': unsent, 'conflictingReceipts': conflicts,
        'budget': {'limitUsd': ledger['budgetUsd'],
            'committedIncludingConservativeReservesUsd': committed,
            'exactCostKnown': False, 'reservesReleased': False},
        'nextStep': 'Recover original response or a definitive non-execution receipt for each uncertain request. Do not infer or resend automatically.',
    }


if __name__ == '__main__':
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('--output', type=Path)
    ap.add_argument('--require-clear', action='store_true')
    args = ap.parse_args()
    result = audit()
    payload = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(payload)
    print(payload)
    if args.require_clear and not result['canResume']:
        raise SystemExit(2)
