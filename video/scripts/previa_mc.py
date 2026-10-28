#!/usr/bin/env python3
"""Prévia (2 min) do vídeo do Minecraft: narrador (Gabriel) + as vozes das IAs (chat com a voz normal, pensamento com
eco, regra do canal). Fatos, falas e pensamentos copiados de minecraft/gravacoes/partida1/eventos_*.jsonl
(t = segundo da partida):
- 3595 pensamento do Qwen (vida 5, esqueleto a 14 blocos; posição y=-5: o replay mostra ele num pilar de pedregulho sobre
  um lago de lava); 3604.03 "Qwen tried to swim in lava".
- 2097 e 2099 pensamentos da MiMo sobre o creeper; 2114.69 "MiMo was blown up by Creeper".
- 3809 pensamento do Claude (espada de ferro e armadura completa, vida 9); 3814.21 "Claude was shot by Skeleton".
- GLM: chat 9153 e 9159, 9159.64 "GLM drowned"; renasce com vida 20 às 9160.33 e às 9166.15 ainda diz "estou com 1 de
  vida" (o abrigo falha: "precisa de pelo menos 17 blocos... Tem 0."); chat 9170, 9177.63 "slain by Zombie"; chat 9185 e 9191,
  9198.47 "slain by Zombie" (três mortes em 38,8 s).
- Placar de mortes nas 3 horas de sobrevivência (mensagens de morte do servidor até 10800 s): Qwen 5, GPT 5, GLM 4,
  DeepSeek 1, MiMo 1, Claude 1.
- O servidor anuncia na arena: "A ARENA COMEÇOU! Só pode sobrar um." (partida.mjs).
Gera remotion/public/mc_previa/voz/*.mp3, previa.json (a montagem) e janelas.txt (o que o replay 3D tem que filmar).
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402  (tts com cache, narrador e pronúncias)

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public' / 'mc_previa'
VOZ = PUB / 'voz'
FPS = 30
VOZES = {
    'Claude': 'bJrNspxJVFovUxNBQ0wh',  # Marcelo Costa
    'GPT': '7lu3ze7orhWaNeSPowWx',  # Lucas
    'DeepSeek': 'dX7gRq1dIvLTgUaWpEFn',  # Rafael Valente
    'Qwen': 'YbP0Eq5RE5uOoCEl7F3T',  # Weverton
    'GLM': 'YU8EsJtXFMyKMxYtheDk',  # Mário
    'MiMo': 'cgSgspJ2msm6clMCkdW9',  # Jessica
}
ECO = 'aecho=0.8:0.85:60|140:0.45|0.25,volume=0.95'
b.bt.PRONUNCIA.update({'Minecraft': 'Máinecréft', 'creeper': 'crípêr', 'creepers': 'crípêrs', 'Creeper': 'Crípêr', 'zombies': 'zâmbis',
                       'MiMo': 'Mímo', '~29': 'uns vinte e nove', '~28min': 'uns vinte e oito minutos', 're-começar': 'recomeçar'})

# cena: id, t0 do replay (abertura e placar sem morte), quem, itens antes da morte, a morte, itens depois (com a imagem
# congelada), meme e título. Item: ('n', texto) narrador | ('chat'|'pensa', texto) a IA da cena
CENAS = [
    dict(id='c1', quem='Claude', camera='orbita:Claude', t0=22, antes=[
        ('n', 'Seis IAs entraram num servidor de Minecraft de verdade.'),
        ('n', 'A regra: sobreviver três horas. Depois, todo mundo numa arena... e só pode sobrar um.')]),
    dict(id='c2', quem='Qwen', camera='segue:Qwen', antes=[
        ('n', 'O Qwen estava com 5 de vida, brigando com um esqueleto. Detalhe: em cima de um pilar, no meio de um lago de lava.'),
        ('pensa', 'Vida 5/20 e skeleton a 14 blocos com flecha. Preciso matar antes que ele me acerte de novo. Vou atacar de novo pra fechar distância e eliminar a ameaça.')],
        morte=(3604.03, 'LAVA', 'Qwen tentou nadar na lava'),
        depois=[('n', 'E aí o Qwen... tentou nadar na lava.')], meme='elmo-fire'),
    dict(id='c3', quem='MiMo', camera='segue:MiMo', antes=[
        ('n', 'A MiMo viu um creeper chegando. E fez as contas:'),
        ('pensa', 'Tem um creeper a 5 blocos e eu estou com picareta de madeira na mão, preciso equipar a espada de ferro imediatamente antes de lutar.'),
        ('pensa', 'Creeper a 4 blocos é ameaça imediata, preciso atacar antes que ele exploda e me mate ou destrua meu equipamento.')],
        morte=(2114.69, 'EXPLODIU', 'MiMo explodiu com um Creeper'),
        depois=[('n', 'O creeper foi mais rápido.')], meme='nuclear-mushroom-cloud'),
    dict(id='c4', quem='Claude', camera='segue:Claude', antes=[
        ('n', 'O Claude estava cercado de esqueletos. Mas confiou no equipamento:'),
        ('pensa', 'Há um esqueleto colado em mim e outro a 3 blocos, com a vida em 9. Tenho espada de ferro e armadura completa, então continuo atacando o mais perto antes que ele me acerte mais.')],
        morte=(3814.21, 'FLECHADO', 'Claude levou uma flecha de Esqueleto'),
        depois=[('n', 'Armadura completa. E mesmo assim, flechado.')], meme='surprised-pikachu'),
    dict(id='c5', quem='GLM', camera='segue:GLM', titulo='O PIOR MINUTO DO GLM', antes=[
        ('n', 'Mas ninguém teve um minuto pior que o GLM.'),
        ('chat', 'Noite com creepers, vou me abrigar. Arena em ~28min, quem quiser aliança fala agora.'),
        ('chat', 'Abrigo falhou, vou refazer na terra firme. MiMo, cuidado com os creepers.')],
        morte=(9159.64, 'MORTE 1', 'GLM se afogou'),
        depois=[('n', 'Um.')], meme='this-is-fine', bolhas=True),
    dict(id='c6', quem='GLM', camera='segue:GLM', antes=[
        ('n', 'Ele renasceu com a vida cheia. Mas não percebeu:'),
        ('chat', 'Creeper me atacou, estou com 1 de vida, me trancando!'),
        ('n', 'E pra se trancar... ele tinha zero blocos.'),
        ('chat', 'Mori afogado, perdi tudo. Recomeçando do zero.')],
        morte=(9177.63, 'MORTE 2', 'GLM foi morto por um Zumbi'),
        depois=[('n', 'Dois.')], meme='hide-the-pain-harold'),
    dict(id='c7', quem='GLM', camera='segue:GLM', antes=[
        ('chat', 'Perdi tudo pros zombies. Se alguém puder me emprestar uma espada ou picareta de pedra, eu devolvo depois. Vou re-começar do zero.'),
        ('chat', 'zumbis em cima de mim aqui, socorro?')],
        morte=(9198.47, 'MORTE 3', 'GLM foi morto por um Zumbi'),
        depois=[('n', 'Três. Em menos de quarenta segundos.')], meme='coffin-dance'),
    dict(id='fim', quem=None, antes=[('n', 'E isso foi só a sobrevivência. Agora... vem a arena.')]),
]
FOLGA = 0.18  # entre uma fala e outra


GRAV = ROOT.parent / 'minecraft' / 'gravacoes' / 'partida1'


def hud(quem, t0, tm):
    """vida e fome gravadas (posicoes_<quem>.jsonl, a cada 0,25 s) entre o começo do trecho e a morte: [quadro, vida, fome]"""
    out = []
    for linha in (GRAV / f'posicoes_{quem}.jsonl').open():
        p = json.loads(linha)
        if t0 - 0.3 <= p['t'] < tm and p.get('v') is not None:
            out.append([max(0, round((p['t'] - t0) * FPS)), p['v'], p.get('f', 20)])
    return out


def voz(k, quem, tipo, texto):
    falado = ' '.join(b.bt.spoken(x) for x in texto.split())
    base = VOZ / k
    words, dur = b.tts(falado, b.NARRADOR if tipo == 'n' else VOZES[quem], base)
    src = f'mc_previa/voz/{k}.mp3'
    if tipo == 'pensa':  # pensamento: a mesma voz com eco (nunca sussurro)
        eco = VOZ / f'{k}_eco.mp3'
        if not eco.exists() or eco.stat().st_mtime < base.with_suffix('.mp3').stat().st_mtime:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', ECO, eco], check=True)
        src = f'mc_previa/voz/{k}_eco.mp3'
    # palavras escritas (a legenda mostra o texto do log, não a pronúncia)
    escritas = texto.split()
    ws = [dict(w=(escritas[i] if len(escritas) == len(words) else w['word']), s=w['start'], e=w['end']) for i, w in enumerate(words)]
    return dict(src=src, dur=dur, tipo=tipo, texto=texto, palavras=ws)


def main():
    VOZ.mkdir(parents=True, exist_ok=True)
    saida, janelas = [], []
    for c in CENAS:
        t, auds = 0.25, []
        for i, (tipo, texto) in enumerate(c['antes']):
            a = voz(f"{c['id']}_a{i}", c['quem'], tipo, texto)
            a['at'] = round(t * FPS); auds.append(a); t += a['dur'] + FOLGA
        cena = dict(id=c['id'], quem=c['quem'], titulo=c.get('titulo'), meme=c.get('meme'))
        if 'morte' in c:
            tm, selo, msg = c['morte']
            # a morte acontece logo depois da última fala de antes; o replay começa o tanto que falta antes dela
            morte_em = t + 0.15
            t0 = tm - morte_em
            video = morte_em + 0.7  # um pouco depois do golpe e congela (depois disso ele renasce longe)
            t = morte_em + 0.9
            for i, (tipo, texto) in enumerate(c.get('depois', [])):
                a = voz(f"{c['id']}_d{i}", c['quem'], tipo, texto)
                a['at'] = round(t * FPS); auds.append(a); t += a['dur'] + FOLGA
            dur = t + 0.9
            cena.update(t0=round(t0, 2), video=round(video * FPS), morte=dict(at=round(morte_em * FPS), selo=selo, texto=msg),
                        hud=hud(c['quem'], t0, tm), bolhas=c.get('bolhas', False))
            janelas.append(f"{c['id']} {t0:.2f} {tm + 0.75:.2f} {c['camera']}")
        elif c['id'] == 'fim':
            dur = max(t + 1.2, 6.5)
        else:
            dur = t + 0.8
            cena.update(t0=c['t0'], video=round(dur * FPS))
            janelas.append(f"{c['id']} {c['t0']:.2f} {c['t0'] + dur + 0.1:.2f} {c['camera']}")
        cena.update(dur=round(dur * FPS), audios=auds)
        saida.append(cena)
        print(f"{c['id']:4s} {dur:5.2f}s " + ' | '.join(f"{a['tipo']} {a['dur']:.1f}" for a in auds))
    (PUB / 'previa.json').write_text(json.dumps({'cenas': saida}, ensure_ascii=False))
    (PUB / 'janelas.txt').write_text('\n'.join(janelas) + '\n')
    print('total', sum(x['dur'] for x in saida) / FPS, 's')


if __name__ == '__main__':
    main()
