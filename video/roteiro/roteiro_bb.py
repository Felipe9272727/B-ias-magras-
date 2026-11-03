# -*- coding: utf-8 -*-
"""Roteiro do "BOMBANANA! das IAs": 9 IAs em times de 3 (Cego, Surdo, Mudo) desarmando bombas, 9 fases.

Tudo o que aparece aqui aconteceu nas gravações de bombanana/gravacoes/partida1/faseN.jsonl (motor bombanana/jogo.mjs).
As falas e os pensamentos das IAs são copiados do log (no máximo cortados em fim de frase); o narrador só conta o que o log
mostra. A final (fase 9) fica por último. Sem lobby entre as fases.

Formato (lido por video/scripts/build_timeline_bb.py, cópia do build_timeline_lobo.py):
  N(id, capítulo, visual, texto)                     cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])      quem = 'N' (narrador), id da IA (voz dela), 'pensa:<id>' (eco),
                                                      'GESTO' (gesto do Mudo, texto = gesto) ou 'ACAO' (o Cego mexe na bomba)
Marcações no texto do narrador: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] [[t:TEXTO:dur:cor]] [[cc]]
"""
import json as _json
import re as _re
from pathlib import Path as _Path

_G = _Path(__file__).resolve().parents[2] / 'bombanana' / 'gravacoes' / 'partida1'
FASES = {}
for _n in range(1, 10):
    _f = _G / f'fase{_n}.jsonl'
    if _f.exists():
        _ev = [_json.loads(l) for l in _f.read_text().splitlines() if l.strip()]
        FASES[_n] = dict(inicio=_ev[0], rodadas=[e for e in _ev if e['tipo'] == 'rodada'], fim=next((e for e in _ev if e['tipo'] == 'fim'), {'resultado': 'tempo'}))

IDS = {'Claude': 'claude', 'GPT': 'gpt', 'Gemini': 'gemini', 'Grok': 'grok', 'DeepSeek': 'deepseek', 'Qwen': 'qwen', 'GLM': 'glm', 'MiMo': 'mimo', 'Mistral': 'mistral'}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


_EMOJI = _re.compile('[\U0001F000-\U0001FAFF☀-➿️‍]')  # regra do canal: nada de emoji no vídeo


def _frases(t, mx=150):
    """Copia a fala do log, cortando em fim de frase quando passa de ~mx caracteres."""
    t = _re.sub(r'\s{2,}', ' ', _EMOJI.sub('', t or '')).strip()
    t = _re.sub(r'\bcaralho\b', 'c*ralho', t)
    t = _re.sub(r'\bporra\b', 'p*rra', t)
    t = _re.sub(r'\bbosta\b', 'b*sta', t)
    if len(t) <= mx:
        return t
    out = ''
    for fr in _re.split(r'(?<=[.!?])\s+', t):
        if out and len(out) + len(fr) + 1 > mx:
            break
        out = (out + ' ' + fr).strip()
    return out if len(out) <= mx * 1.3 else out[:mx].rsplit(' ', 1)[0] + '...'


# comentários do narrador depois de rodadas (fase, segundo do log): piada + meme, sempre sobre o que o log mostra
COMENT = {
    (1, 10): 'Um dedo. Luz vermelha, três cabos: é o primeiro. A Gemini achou rapidinho. [[m:galaxy-brain:right:2]]',
    (1, 20): 'E o Claude... não confia em ninguém. [[m:side-eye-dog:right:2]]',
    (1, 30): 'Cortou. Trinta segundos. [[s:tada:0.5]][[m:success-kid:right:2]]',
    (2, 10): 'Cinco dedos do Qwen. Tela amarela, entalhe cinco.',
    (2, 30): 'E o Grok travou no cinco. Fácil demais. [[m:roll-safe:right:2]]',
    (3, 10): 'O Mistral apontou... a banana azul. [[m:dicaprio-pointing:right:2]] E o MiMo entendeu: corta o cabo azul.',
    (3, 60): 'Duas fases, duas bombas, zero erros. Até aqui as IAs são uma equipe da SWAT. [[m:lets-go:right:2]]',
    (4, 10): 'O GPT mostrou um dedo. Guarda essa informação.',
    (4, 60): 'Ainda um dedo. [[m:mr-bean-waiting:right:2]]',
    (4, 90): 'Apagão. [[s:glitch:0.5]] E o GPT? Um dedo. [[m:hello-darkness:right:2]]',
    (4, 140): 'Quarenta segundos. E o GPT continua... com um dedo. [[m:sweating:right:2]]',
    (4, 170): 'O Gemini cansou e travou no um. E estava certo!  Mas ainda tinha as setas. [[m:this-is-fine:right:2]]',
    (5, 80): 'O DeepSeek mostrou quatro dedos. Pra dizer quarenta. [[m:math-lady:right:2]]',
    (5, 90): 'E agora... zero dedos. Pra completar o quarenta. Faz sentido, né? Né?',
    (5, 120): 'O Grok mandou digitar zero. [[m:faustao-errou:right:2]]',
    (5, 140): 'E agora o quatro. [[m:picard-facepalm:right:2]] Ninguém digitou o quarenta.',
    (6, 10): 'O Mistral fez a conta sozinho, de cabeça: vinte e nove menos vinte e sete, dois. [[m:big-brain-patrick:right:2]]',
    (6, 100): 'Apagão. O GLM, que já gritava de luz acesa, agora grita no escuro. [[m:homer-panic:right:2]]',
    (6, 160): 'Seis. Desarmada, com zero erros. [[s:crowd-cheer:0.4]][[m:we-did-it:right:2]]',
    (7, 30): 'O GPT apertou o amarelo. Certo! A primeira de quatro etapas.',
    (7, 80): 'Agora o Claude acha que o símbolo é o triângulo. [[m:confused-travolta:right:2]]',
    (7, 100): 'E deu erro. [[m:faustao-errou:right:2]]',
    (7, 180): 'Agora o Claude acha que é a estrela. [[m:nazare-confusa:right:2]]',
    (7, 200): 'E o GPT... não aperta no chute. Não aperta. Não aperta. [[m:skeleton-waiting:right:2]]',
    (8, 30): 'O DeepSeek apertou o vermelho. Que ninguém mandou. [[m:surprised-pikachu:right:2]]',
    (8, 110): 'Setas desarmadas!  Agora só falta o símbolo. Só.',
    (8, 170): 'O Grok mandou girar o seletor. E o DeepSeek girou. Uma vez. Por rodada. [[m:spongebob-waiting:right:2]]',
    (9, 50): 'O MiMo cortou o cabo da direita. Que era o errado. [[m:sad-pablo:right:2]]',
    (9, 130): 'Seta pra direita: certo!  Primeira etapa das setas.',
    (9, 180): 'O MiMo implorando pro Mistral parar de descrever a bomba. [[m:gordon-ramsay-angry:right:2]]',
    (9, 240): 'Seta pra baixo: setas desarmadas! [[m:lets-go:right:2]]',
    (9, 250): 'E o MiMo digitou o quinze sozinho. Certo! Faltam a segunda etapa e o símbolo. Em cinquenta segundos.',
}

PULO = {  # resumo do narrador quando um trecho de rodadas é cortado (fase -> texto)
    4: 'E o GPT continuou mostrando um dedo. Por quase dois minutos.',
    7: 'E a dança das cores continuou.',
    8: 'E o seletor seguiu girando, uma posição por vez.',
    9: 'E o Mistral continuou descrevendo a bomba inteira, de novo e de novo.',
}

MAX_RODADAS = 7


def escolher(rods, time):
    """Rodadas que entram (as fases longas ficam com as melhores): ações, a rodada antes delas, começo, fim, caos,
    tapas e bananas, gritos e as que têm comentário do narrador."""
    if len(rods) <= MAX_RODADAS:
        return set(range(len(rods)))
    nota = {}
    for k, r in enumerate(rods):
        d = r['dec']; v = 0
        falas = ' '.join(str(d[time[p]].get('fala') or '') for p in ('Cego', 'Surdo'))
        if r.get('acao'):
            v += 10 + (4 if (r.get('efeito') or {}).get('ok') is False else 0)
        if k + 1 < len(rods) and rods[k + 1].get('acao'):
            v += 6
        if k < 2 or k == len(rods) - 1:
            v += 6
        if (r['caos'].get('apagao') or r['caos'].get('alarme')) and not (k and (rods[k - 1]['caos'].get('apagao') or rods[k - 1]['caos'].get('alarme'))):
            v += 4
        if d[time['Mudo']].get('gesto') in ('tapa', 'jogar_banana'):
            v += 5
        v += min(3, falas.count('!')) + (2 if any(w.isupper() and len(w) > 3 for w in falas.split()) else 0)
        nota[k] = v
    return set(sorted(nota, key=lambda k: -nota[k])[:MAX_RODADAS])


LUGAR = {'van': 'na van', 'aviao': 'no avião', 'laboratorio': 'no laboratório'}
NOME_MOD = {'cabo': 'cabos', 'slider': 'slider de cor', 'direcao': 'setas', 'calculadora': 'calculadora', 'simbolo': 'símbolo'}

ANTES = {
    1: 'Fase um, a mais fácil: um módulo de cabos e nenhum erro permitido. Claude é o cego, GPT é o surdo e Gemini é o mudo.',
    2: 'Fase dois: um slider de cor. Grok no escuro, DeepSeek de olho na tela, e o Qwen com o manual.',
    3: 'Fase três: agora são dois módulos ao mesmo tempo. GLM é o cego, MiMo é o surdo e Mistral é o mudo.',
    4: 'Fase quatro, e a van virou avião. [[s:swoosh-fly:0.4]] Slider e setas, três minutos. Gemini é o cego, Claude é o surdo, e o GPT pega o manual.',
    5: 'Fase cinco: slider e calculadora. Qwen é o cego, Grok é o surdo e o DeepSeek fica com o manual. A conta na tela: dez vezes quatro.',
    6: 'Fase seis: calculadora, cabos e slider, tudo junto, com direito a apagão. Mistral é o cego, GLM é o surdo, e o MiMo tem o manual.',
    7: 'Fase sete, no laboratório: o módulo do símbolo. Só um símbolo apita, e só quem ouve percebe. GPT é o cego, Gemini é o surdo, e o Claude fica com o manual.',
    8: 'Fase oito: símbolo e setas, quatro minutos. DeepSeek é o cego, Qwen é o surdo, e o Grok fica com o manual.',
    9: 'A fase final. [[s:riser:0.5]] Os quatro módulos ao mesmo tempo: cabos, setas, calculadora e símbolo. Cinco minutos, apagão e alarme. MiMo é o cego, Mistral é o surdo, e o GLM tem o manual.',
}
DEPOIS = {
    1: 'Ninguém chutou nada, e o Claude nem quis cortar antes de ter certeza. Começou bem demais.',
    2: 'Duas de duas.',
    3: 'Três de três. Até aqui, parecia fácil. [[m:thanos-inevitable:right:2]]',
    4: 'Um dedo. Dois minutos. Uma explosão. [[m:coffin-dance:right:3]]',
    5: 'Quatro dedos e zero dedos. O Grok entendeu zero, depois quatro, e os dois erraram. [[m:not-stonks:right:2]]',
    6: 'O GLM gritou a fase inteira, o MiMo mostrou seis dedos três vezes, e o Mistral desarmou com cinquenta segundos sobrando.',
    7: 'O Claude mudou de ideia sobre o símbolo umas cinco vezes, e o GPT passou os últimos cem segundos repetindo que não aperta no chute. Não apertou. [[m:coffin-dance:right:3]]',
    8: 'As setas foram desarmadas, mas o símbolo... o DeepSeek ficou girando o seletor sem achar o bipe. [[m:sad-violin:right:2]]',
    9: 'Só as setas e a primeira etapa da calculadora. O cabo cortado foi o errado, o MiMo passou os últimos dois minutos gritando pro Mistral parar de descrever a bomba, e o Mistral não parou. [[m:crying-jordan:right:3]]',
}

CHAPTERS = {'intro': 'Abertura', **{f'f{n}': f'Fase {n}' for n in range(1, 10)}, 'fim': 'Placar final'}
SCENES = []

SCENES += [
    N('i00', 'intro', comp('BBAbertura'), 'Nove inteligências artificiais. Uma bomba. [[s:tic-tac:0.4]] E três macacos numa van.', lead=2.5),
    N('i01', 'intro', comp('BBPapel', papel='Cego'), 'Um macaco não vê. Ele é o único que encosta na bomba, mas não enxerga cor nenhuma. [[m:homer-bushes:right:2]]'),
    N('i02', 'intro', comp('BBPapel', papel='Surdo'), 'O outro não ouve. Ele vê a bomba inteira e fala, mas não escuta ninguém.'),
    N('i03', 'intro', comp('BBPapel', papel='Mudo'), 'E o terceiro não fala. Só ele tem o manual da bomba, e só pode responder com gestos. [[m:monkey-puppet-awkward:right:2]]'),
    N('i04', 'intro', comp('BBRegras'), 'O surdo descreve, o mudo gesticula, o surdo traduz, e o cego executa. Se der errado... [[s:explosion:0.5]][[p]] BOOM.'),
    N('i05', 'intro', comp('BBRegras', times=True), 'São nove fases. Os times trocam a cada fase, e cada IA vai passar pelos três papéis. Bora. [[m:avengers-assemble:right:2]]'),
]

for n, F in FASES.items():
    ini, rods, fim = F['inicio'], F['rodadas'], F['fim']
    time = ini['time']
    c = f'f{n}'
    SCENES.append(N(f'{c}_00', c, comp('BBFase', fase=n), ANTES[n], pad=0.6))
    manter = escolher(rods, time)
    pendentes = sorted(k for k in COMENT if k[0] == n)
    pulo = 0
    usou_pulo = False
    for k, r in enumerate(rods):
        if k not in manter:
            pulo += 1
            continue
        if pulo >= 3 and n in PULO and not usou_pulo:
            SCENES.append(N(f'{c}_p{k}', c, comp('BBRodada', fase=n, rodada=k, cam='geral'), PULO[n] + ' [[m:one-eternity-later:center:1.6]]'))
            usou_pulo = True
        pulo = 0
        d = r['dec']
        cego, surdo, mudo = (IDS[time[p]] for p in ('Cego', 'Surdo', 'Mudo'))
        dc, ds, dm = d[time['Cego']], d[time['Surdo']], d[time['Mudo']]
        falas = []
        if ds.get('fala'):
            falas.append((surdo, _frases(ds['fala'])))
        if dm.get('gesto'):
            falas.append(('GESTO', dm['gesto']))
        if dm.get('pensamento') and (k % 3 == 0 or dm.get('gesto') in ('tapa', 'jogar_banana')):
            falas.append(('pensa:' + mudo, _frases(dm['pensamento'], 110)))
        if dc.get('fala'):
            falas.append((cego, _frases(dc['fala'])))
        if r.get('acao'):
            if dc.get('pensamento'):
                falas.append(('pensa:' + cego, _frases(dc['pensamento'], 100)))
            falas.append(('ACAO', ''))
        # comentário do narrador: o primeiro pendente cujo segundo já passou
        while pendentes and pendentes[0][1] <= r['t']:
            falas.append(('N', COMENT[pendentes.pop(0)]))
        if falas:
            SCENES.append(CH(f'{c}_r{k:02d}', c, comp('BBRodada', fase=n, rodada=k), falas))
    for p in pendentes:  # comentários que sobraram (rodada cortada): vão no fim da fase
        SCENES.append(N(f'{c}_c{p[1]}', c, comp('BBRodada', fase=n, rodada=len(rods) - 1, cam='geral'), COMENT[p]))
    res = fim.get('resultado')
    if res == 'desarmou':
        SCENES.append(N(f'{c}_fim', c, comp('BBVitoria', fase=n), 'Desarmada! [[s:tada:0.6]] ' + DEPOIS[n], pad=0.8))
    else:
        SCENES.append(N(f'{c}_fim', c, comp('BBExplosao', fase=n), '[[s:explosion:0.7]][[p]] BOOM. ' + DEPOIS[n], lead=1.6, pad=0.8))

SCENES.append(N('z00', 'fim', comp('BBPlacar'), 'Placar final: quatro bombas desarmadas e cinco explosões. [[m:this-is-fine:right:2]] E a única coisa que todas as nove IAs aprenderam... é que um dedo não quer dizer nada.', pad=1.5))
