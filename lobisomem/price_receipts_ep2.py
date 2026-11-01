"""Apply verified provider costs without changing decisions or uncertain reserves."""
import fcntl
import json
from pathlib import Path
import sys

SPOOL = Path(__file__).resolve().parent / '.spool_ep2'


def main():
    receipts = json.loads(Path(sys.argv[1]).read_text())
    with (SPOOL / 'ledger.lock').open('a') as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        ledger_path = SPOOL / 'ledger.json'
        ledger = json.loads(ledger_path.read_text())
        for receipt in receipts:
            call = ledger['calls'][receipt['ledgerId']]
            if call['status'] != 'completed' or call.get('generationId') != receipt['generationId']:
                raise RuntimeError('Cost receipt does not match completed generation')
            if not isinstance(receipt['costUsd'], (int, float)) or receipt['costUsd'] < 0:
                raise RuntimeError('Invalid provider cost')
            if call.get('costUsd') is not None and call['costUsd'] != receipt['costUsd']:
                raise RuntimeError('Conflicting cost receipt')
        directory = SPOOL / 'cost_receipts'
        directory.mkdir(exist_ok=True)
        for receipt in receipts:
            ledger['calls'][receipt['ledgerId']]['costUsd'] = receipt['costUsd']
            (directory / (receipt['ledgerId'] + '.json')).write_text(json.dumps(receipt, ensure_ascii=False))
        temporary = ledger_path.with_suffix('.json.tmp')
        temporary.write_text(json.dumps(ledger, ensure_ascii=False))
        temporary.replace(ledger_path)
    print(json.dumps({'verifiedCostsApplied': len(receipts), 'uncertainReservesChanged': False}))


if __name__ == '__main__':
    main()
