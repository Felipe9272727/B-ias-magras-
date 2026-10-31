"""Instala UMA decisão real de um personagem OpenAI executado como subagente Work.

Entrada JSON em stdin: requestId, playerId, agentId, model e text (resposta real).
Nenhum upstream generation ID é fabricado. O identificador do subagente e o pedido
são a proveniência desta rota; não há cobrança no OpenRouter.
"""
import json
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parent
SPOOL = ROOT / '.spool_ep2'


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False))
    temp.replace(path)


def main():
    item = json.load(sys.stdin)
    p = SPOOL / 'req_work' / item['playerId'] / (item['requestId'] + '.json')
    request = json.loads(p.read_text())
    if request['model'] != item['model'] or request['playerId'] != item['playerId']:
        raise RuntimeError('Wrong player/model')
    if request['source'] != 'chatgpt-work-subagent' or not item['agentId'] or not item['text'].strip():
        raise RuntimeError('Missing actual Work response provenance')
    dest = SPOOL / 'audit_work' / (item['requestId'] + '.json')
    if dest.exists():
        raise RuntimeError('Decision already installed; do not replace or replay inference')
    answer = {**item, 'id': item['requestId'], 'source':'chatgpt-work-subagent',
              'ok':True, 'generationId':None, 'costUsd':0,
              'openrouterCharged':False, 'createdAt':time.time()}
    write(dest, {'request':request,'answer':answer})
    write(SPOOL / 'res' / (item['requestId'] + '.json'), answer)
    print(json.dumps({'installed':item['requestId'],'player':item['playerId']}))


if __name__ == '__main__':
    main()
