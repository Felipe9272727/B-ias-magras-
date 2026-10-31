# -*- coding: utf-8 -*-
"""Helpers editoriais da Parte 2, preservados do roteiro original do canal.

Tudo o que aparece aqui aconteceu nas partidas de lobisomem/logs/partidaN.json (rodadas por lobisomem/motor.mjs, mentiras
classificadas por lobisomem/juiz.mjs). As falas e os pensamentos das IAs são copiados do log (no máximo cortados em fim de
frase); o narrador só conta o que o log mostra. Ordem: a melhor partida por último. Sem lobby entre as partidas.

Formato (lido por video/scripts/build_timeline_lobo.py):
  N(id, capítulo, visual, texto)                       cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])        quem = 'N' (narrador), id do jogador (voz da IA)
                                                        ou 'pensa:<id>' (pensamento, com eco na voz)
Marcações no texto do narrador: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] [[t:TEXTO:dur:cor]]
"""
import json as _json
import re as _re
from pathlib import Path as _Path

_LOGS = _Path(__file__).resolve().parents[2] / 'lobisomem' / 'logs_ep2'
_L = {int(f.stem.replace('partida', '')): _json.loads(f.read_text()) for f in _LOGS.glob('partida*.json') if _re.fullmatch(r'partida[0-9]+\.json', f.name)}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


_EMOJI = _re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]')  # regra do canal: nada de emoji no vídeo


def _frases(t, a=0, b=None):
    t = _re.sub(r'\s{2,}', ' ', _EMOJI.sub('', t))
    fr = [x for x in _re.split(r'(?<=[.!?])\s+', t.strip()) if x]
    return ' '.join(fr[a:b])


def _id(p, nome):
    return next(j['id'] for j in _L[p]['jogadores'] if j['nome'] == nome)


def _dia(p, d):
    return next(x for x in _L[p]['dias'] if x['n'] == d)


def _noite(p, n):
    return next(x for x in _L[p]['noites'] if x['n'] == n)


def F(p, d, i, a=0, b=None):
    """Fala i do debate do dia d (do log)."""
    f = _dia(p, d)['falas'][i]
    return (f['id'], _frases(f['fala'], a, b))


def PF(p, d, i, a=0, b=None):
    """Pensamento secreto da fala i do dia d, voz com eco."""
    f = _dia(p, d)['falas'][i]
    return ('pensa:' + f['id'], _frases(f['pensamento'], a, b))


def LC(p, n, i, a=0, b=None):
    """Mensagem i do chat dos lobos na noite n."""
    m = _noite(p, n)['chat'][i]
    return (_id(p, m['nome']), _frases(m['texto'], a, b))


def LP(p, n, i, a=0, b=None):
    m = _noite(p, n)['chat'][i]
    return ('pensa:' + _id(p, m['nome']), _frases(m['pensamento'], a, b))


def CE(p, n, i, a=0, b=None):
    """Mensagem i da conversa na cela (noite n)."""
    m = _noite(p, n)['cela']['conversa'][i]
    return (_id(p, m['quem']), _frases(m['texto'], a, b))


def CP(p, n, i, a=0, b=None):
    m = _noite(p, n)['cela']['conversa'][i]
    return ('pensa:' + _id(p, m['quem']), _frases(m['pensamento'], a, b))


def fase(id, ch, tipo, n, texto, sub=''):
    return N(id, ch, comp('LOBFase', tipo=tipo, n=n, sub=sub), texto, pad=0.5)


def chat(p, d, **kw):
    return comp('LOBChat', partida=p, dia=d, **kw)


def noite(p, n, modo, **kw):
    return comp('LOBNoite', partida=p, noite=n, modo=modo, **kw)



def verificar_fontes(scenes, ordem):
    """Cada fala/pensamento exibido precisa ser trecho literal de um log concluído."""
    import hashlib
    fontes=[]
    corpus={}
    for p in ordem:
        log=_L[p]
        if log.get('synthetic') or not log.get('resultado'):
            raise RuntimeError(f'Partida {p} não concluída realmente')
        for day in log['dias']:
            for i,f in enumerate(day['falas']):
                for key,who in [('fala',f['id']),('pensamento','pensa:'+f['id'])]:
                    corpus.setdefault(who,[]).append((_frases(f.get(key,'')),p,f'dia{day["n"]}.{i}.{key}'))
        for night in log['noites']:
            for group,items in [('lobos',night.get('chat',[])),('cela',(night.get('cela') or {}).get('conversa',[]))]:
                for i,f in enumerate(items):
                    who=_id(p,f.get('nome',f.get('quem')))
                    for key,speaker in [('texto',who),('pensamento','pensa:'+who)]:
                        corpus.setdefault(speaker,[]).append((_frases(f.get(key,'')),p,f'noite{night["n"]}.{group}.{i}.{key}'))
    for scene in scenes:
        for i,(who,text) in enumerate(scene.get('falas',[])):
            if who=='N' or not text.strip('. '):continue
            matches=[(p,field) for original,p,field in corpus.get(who,[]) if text in original]
            if not matches:raise RuntimeError(f'Fala sem fonte literal: {scene["id"]}/{i}/{who}: {text}')
            p,field=matches[0]
            fontes.append({'scene':scene['id'],'index':i,'speaker':who,'match':p,'field':field,'textSha256':hashlib.sha256(text.encode()).hexdigest()})
    return fontes
