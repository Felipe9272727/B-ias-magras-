"""Apura ações reais já encerradas, sem preencher reflexões nem concluir o diário."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent

def main():
    partial=ROOT/'logs_ep2/partida5.partial.json'
    journal=ROOT/'logs_ep2/execucao5/decisoes.json'
    log=json.loads(partial.read_text());decisions=json.loads(journal.read_text())
    assert log['synthetic'] is False
    deaths=[]
    for night in log['noites']:deaths.extend(night['mortes'])
    for day in log['dias']:
        if day.get('linchado'):deaths.append(day['linchado'])
        deaths.extend(day.get('tiros',[]))
        deaths.extend(a['morte'] for a in day['acoes'] if a.get('morte'))
    dead={d['nome'] for d in deaths}
    wolves={j['nome'] for j in log['jogadores'] if j['papel'] in ['lobisomem','lobo_alfa','lobo_vidente']}
    assert len(wolves)==4 and wolves.issubset(dead)
    assert not any(d.get('linchado',{}).get('papel')=='bobo' for d in log['dias'] if d.get('linchado'))
    reflections={d['pedido']['ator']:d['resposta']['text'] for d in decisions['decisoes'] if d['pedido']['prompt'].startswith('A partida acabou.') and d.get('resposta')}
    pending=[j['id'] for j in log['jogadores'] if j['id'] not in reflections]
    result={'episodio':2,'partida':5,'synthetic':False,'gameplayCompleted':True,'memoryCompleted':not pending,
        'canonicalFinalFileWritten':(ROOT/'logs_ep2/partida5.json').exists(),
        'resultadoApurado':{'vencedor':'aldeia','dias':log['dias'][-1]['n'],'vivos':[j['nome'] for j in log['jogadores'] if j['nome'] not in dead]},
        'method':'Deterministic application of victory rule to actual recorded deaths; no model decision generated or replaced.',
        'sources':{'partialSha256':hashlib.sha256(partial.read_bytes()).hexdigest(),'journalSha256':hashlib.sha256(journal.read_bytes()).hexdigest()},
        'reflexoesRecebidas':list(reflections),'reflexoesPendentes':pending}
    out=ROOT/'logs_ep2/partida5.apuracao.json';out.write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':main()
