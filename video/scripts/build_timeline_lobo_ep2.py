"""Adapta o montador original, usando só vozes já geradas e logs reais do EP2.

python3 video/scripts/build_timeline_lobo_ep2.py --export-jobs
python3 video/scripts/build_timeline_lobo_ep2.py
Não consulta chaves nem gera vozes por API. Cache ausente é um erro explícito.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
import build_timeline_lobo as b

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'remotion/public'
VOICES=json.loads((PUBLIC/'voice_lobo_ep2/vozes.json').read_text())['voices']
b.VOZ=PUBLIC/'voice_lobo_ep2/scenes'
b.VOICE_DIR_NAME='voice_lobo_ep2/scenes'
b.NARRADOR=VOICES['N']['voiceId']
b.VOZES={key:value['voiceId'] for key,value in VOICES.items() if key!='N'}
b.LOGS_INT=ROOT.parent/'lobisomem/logs_ep2'


def matches(order=None):
    result={}
    for n in order or [5,6,7,8]:
        file=b.LOGS_INT/f'partida{n}.json'
        raw=file.read_text();value=json.loads(raw)
        if value.get('synthetic') or not value.get('resultado'):
            raise RuntimeError('Partida sem resultado real: '+str(n))
        judged=b.LOGS_INT/f'partida{n}.juiz.json'
        if judged.exists():
            judgments=json.loads(judged.read_text())
            if judgments['sourceSha256']!=hashlib.sha256(raw.encode()).hexdigest():
                raise RuntimeError('Juiz não corresponde ao log canônico')
            for day in judgments['dias']:
                target=next(d for d in value['dias'] if d['n']==day['n'])
                for item in day['avaliacoes']:
                    target['falas'][item['i']]['mentira']={k:item[k] for k in ['tipo','motivo']}
        else:
            raise RuntimeError('Juiz real ainda pendente: '+str(n))
        result[str(n)]=value
    return result


def cache_only(text,voice,base):
    file=base.with_suffix('.words.json');audio=base.with_suffix('.mp3')
    expected=hashlib.sha1(json.dumps([text,voice,b.MODELO,b.AJUSTES]).encode()).hexdigest()
    if not file.exists() or not audio.exists():
        raise RuntimeError('Voz ainda não gerada: '+str(base))
    d=json.loads(file.read_text())
    if d.get('hash')!=expected:
        raise RuntimeError('Texto mudou; não reutilizar áudio incompatível: '+str(base))
    return d['words'],d['dur']


b.partidas=matches
b.tts=cache_only
b.ROTEIRO='roteiro_lobo_ep2'

if __name__=='__main__':
    if '--export-jobs' in sys.argv:
        mod=b.carregar_roteiro();matches(getattr(mod,'ORDEM',None));jobs=[]
        for scene in mod.SCENES:
            items=[('N',scene['text'],scene['id'])] if 'text' in scene else [(who,text,f"{scene['id']}_{i}") for i,(who,text) in enumerate(scene.get('falas',[]))]
            for who,text,id in items:
                if not text.strip('. '):continue
                if who=='N':
                    tokens,_=b.bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)',' ',text))
                    spoken=' '.join(b.bt.spoken(t) for t in tokens)
                else:spoken=' '.join(b.bt.spoken(t) for t in text.split())
                voice=b.NARRADOR if who=='N' else b.voz_de(who)
                jobs.append({'id':id,'speaker':who,'text':spoken,'voiceId':voice,'base':str(b.VOZ/id),'hash':hashlib.sha1(json.dumps([spoken,voice,b.MODELO,b.AJUSTES]).encode()).hexdigest()})
        (PUBLIC/'voice_lobo_ep2/jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2))
        print(json.dumps({'jobs':len(jobs),'characters':sum(len(j['text']) for j in jobs)}))
    else:
        sys.argv+=['--roteiro','roteiro_lobo_ep2','--saida','timeline_lobo_ep2.json']
        b.main()
        file=PUBLIC/'timeline_lobo_ep2.json';d=json.loads(file.read_text());d['data']['completedActualMatches']=4
        file.write_text(json.dumps(d,ensure_ascii=False))
