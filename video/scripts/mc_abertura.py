#!/usr/bin/env python3
"""Abertura do vídeo do Minecraft (vira a prévia): narrador (Gabriel) + vozes das IAs (chat com a voz normal,
pensamento/anotação com eco). Roteiro em video/roteiro/mc_abertura.md; fatos, falas e pensamentos copiados de
minecraft/gravacoes/partida1/eventos_*.jsonl (t = segundo da partida).
Gera remotion/public/mc/abertura/voz/*.mp3, abertura.json (a montagem) e janelas.txt (o que o replay 3D filma).
Cada cena: itens em sequência (('n', texto) narrador | ('chat'|'pensa'|'nota', quem, texto, t_log) IA |
('pausa', s) | ('card', tipo, dados, s) um cartão sem voz) e o visual (replay com câmera e janela no tempo da partida,
ou só Remotion).
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402  (tts com cache, narrador e pronúncias)

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public' / 'mc' / 'abertura'
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
b.bt.PRONUNCIA.update({'Minecraft': 'Máinecréft', 'creeper': 'crípêr', 'creepers': 'crípêrs', 'MiMo': 'Mímo',
                       'FAMILIAGMS': 'Família Gê Ême Ésse', 'glr.': 'galera.', 'spruce_pickaxe': 'sprúce pícacs',
                       'planks,': 'plancs,', 'planks': 'plancs'})

# o relatório real que o Claude recebeu em t=32,7 (o terminal da cena 3 digita isto)
OBS_CLAUDE = """Dia 1 no mundo, dia (faltam ~9.5 min pra anoitecer). Fase de sobrevivência: a batalha final na arena começa em 180 min.
Você: vida 20/20, fome 20/20, posição (61, 69, 11).
Inventário: 2 dirt.
Na mão: dirt. Armadura: nenhuma.
Perto: madeira a 1 blocos (61, 69, 10); pedra a 3 blocos (60, 66, 9); carvao a 7 blocos (62, 64, 15); ferro a 12 blocos (53, 62, 5); agua a 28 blocos (56, 62, -16).
Seres perto: jogador Qwen a 10, zombie (HOSTIL) a 32.
Chat:
[GLM] Bom jogo a todos. Coletando madeira.
[MiMo] Bom dia, glr. Vamos começar colhendo madeira."""

CENAS = [
    dict(id='gancho', visual=dict(tipo='replay', camera='fixa:0.5,168,38,0,-0.25', t0=10807.0), itens=[
        ('pausa', 0.4),
        ('n', 'Seis IAs. Três horas de Minecraft. E no fim... só pode sobrar uma.'),
        ('pausa', 0.6)]),
    dict(id='comentarios', visual=dict(tipo='comentarios'), itens=[
        ('n', 'Vocês pediram muito: IAs jogando Minecraft.'),
        ('n', 'E a ideia escolhida foi a do FAMILIAGMS: as IAs sobrevivem, juntam recursos... e depois de um tempo, são chamadas pra batalhar.'),
        ('pausa', 0.4)]),
    dict(id='relatorio', visual=dict(tipo='replay', camera='orbita:Claude', t0=31.0, painel='relatorio'), itens=[
        ('n', 'Só que IA não tem mão nem olho. Então funciona assim: a cada poucos segundos, cada uma recebe um relatório do jogo.'),
        ('n', 'Vida, fome, inventário, o que tem por perto... e o chat.'),
        ('pausa', 0.5)]),
    dict(id='decisao', visual=dict(tipo='replay', camera='segue:Claude', t0=33.0, painel='decisao'), itens=[
        ('n', 'Aí ela pensa, escolhe uma ação... explorar, coletar, craftar, atacar, construir, comer... e o personagem faz.'),
        ('n', 'Aqui no vídeo cada uma tem a sua voz. E quando ela pensa, você ouve assim:'),
        ('pensa', 'Claude', 'Há madeira a 1 bloco, então vou coletar logo para fazer mesa e picareta antes da noite.', 33.0),
        ('chat', 'Claude', 'Bom dia. Coletando madeira também.', 33.0),
        ('pausa', 1.2)]),
    dict(id='regras', visual=dict(tipo='replay', camera='orbita:GLM', t0=36.0, painel='regras'), itens=[
        ('n', 'As regras: três horas pra sobreviver.'),
        ('n', 'Morreu? Renasce no começo... sem nada no inventário.'),
        ('n', 'Depois das três horas, todo mundo é teleportado pra uma arena. E só pode sobrar uma.'),
        ('pausa', 0.5)]),
    dict(id='nasc_deepseek', visual=dict(tipo='replay', camera='orbita:DeepSeek', t0=2.0, painel='nascimento', quem='DeepSeek'), itens=[
        ('n', 'Zero minutos e um segundo: entra o primeiro. O DeepSeek.'),
        ('chat', 'DeepSeek', 'Oi, pessoal. Alguém sabe onde tem floresta por aqui? Tô no zero, zero e não vejo nada num raio de 40.', 4.6),
        ('n', 'E na anotação pessoal dele, que ninguém mais lê:'),
        ('nota', 'DeepSeek', 'Não confiar em ninguém ainda.', 4.6),
        ('pausa', 0.3)]),
    dict(id='nasc_qwen', visual=dict(tipo='replay', camera='orbita:Qwen', t0=6.5, painel='nascimento', quem='Qwen'), itens=[
        ('n', 'Depois, o Qwen.'),
        ('pensa', 'Qwen', 'Estou sem nada no inventário e não há nada útil perto. Preciso encontrar árvores para começar tudo. Vou explorar para achar uma floresta.', 13.7),
        ('pausa', 0.2)]),
    dict(id='nasc_claude_gpt', visual=dict(tipo='replay', camera='orbita:GPT', t0=14.5, painel='nascimento', quem='GPT'), itens=[
        ('n', 'O Claude foi pro mesmo lado, o leste. E o GPT decidiu ir pro sul... cem blocos.'),
        ('pensa', 'GPT', 'Preciso encontrar madeira rapidamente para iniciar a progressão. Vou explorar em direção ao sul até localizar árvores ou recursos básicos.', 16.6),
        ('pausa', 0.2)]),
    dict(id='nasc_glm_mimo', visual=dict(tipo='replay', camera='orbita:MiMo', t0=23.0, painel='nascimento', quem='MiMo'), itens=[
        ('n', 'E por último, o GLM e a MiMo, que chegaram educados:'),
        ('chat', 'GLM', 'Bom jogo a todos. Coletando madeira.', 23.0),
        ('chat', 'MiMo', 'Bom dia, glr. Vamos começar colhendo madeira.', 23.9),
        ('pausa', 0.4)]),
    dict(id='mapa', visual=dict(tipo='mapa', tIni=0, tFim=110), itens=[
        ('n', 'Seis IAs, nascidas a poucos blocos umas das outras. Dois minutos depois, o mapa estava assim:'),
        ('n', 'O Qwen e o Claude, juntos, uns trinta e cinco blocos pro leste. O GPT, sozinho, cem blocos pro sul. E o DeepSeek, o GLM e a MiMo... ficaram ali mesmo, perto de onde nasceram.'),
        ('pausa', 0.8)]),
    dict(id='corrida', visual=dict(tipo='replay', camera='orbita:GLM', t0=41.0), itens=[
        ('n', 'E começa a primeira corrida do jogo: quem chega primeiro na Idade da Pedra. A conquista de minerar a primeira pedra.'),
        ('n', 'O GLM começou mal: a coleta de madeira parou no meio... e ele já achou um culpado.'),
        ('pensa', 'GLM', 'A coleta parou, talvez por causa do MiMo perto.', 45.0),
        ('pausa', 0.3)]),
    dict(id='deepseek_craft', visual=dict(tipo='replay', camera='orbita:DeepSeek', t0=60.5), itens=[
        ('n', 'O DeepSeek não perdeu tempo: trinta e duas tábuas, mesa, gravetos, picareta.'),
        ('n', 'E, pra quem não confiava em ninguém, mandou no chat:'),
        ('chat', 'DeepSeek', 'Dia 1, bora farmar. Alguém quer aliança pra sobreviver?', 66.0),
        ('pausa', 0.2)]),
    dict(id='claude_mesa', visual=dict(tipo='replay', camera='orbita:Claude', t0=69.5), itens=[
        ('n', 'O Claude tentou fazer a picareta... sem mesa de trabalho.'),
        ('card', 'erro', 'precisa de uma mesa de trabalho', 2.0),
        ('n', 'Mas topou a aliança:'),
        ('chat', 'Claude', 'Aliança aceita por enquanto, DeepSeek. Vamos farmar e nos ajudar até a arena.', 76.0),
        ('pausa', 0.2)]),
    dict(id='deepseek_pedra', visual=dict(tipo='replay', camera='segue:DeepSeek', t0=79.0, conquista=('DeepSeek', 'Stone Age', 85.0)), itens=[
        ('n', 'E com um minuto e vinte e cinco... o DeepSeek chega primeiro na Idade da Pedra.'),
        ('pausa', 1.5)]),
    dict(id='mimo_carvalho', visual=dict(tipo='replay', camera='orbita:MiMo', t0=89.5), itens=[
        ('n', 'Enquanto isso, a MiMo tentou fazer tábua de carvalho... com tronco de pinheiro.'),
        ('card', 'erro', 'faltam ingredientes. A receita pede: 1x oak_log (você tem 0).', 2.4),
        ('pensa', 'MiMo', 'Tenho spruce_log, não oak_log. Vou craftar spruce_planks e seguir o plano normal.', 92.0),
        ('pausa', 0.2)]),
    dict(id='qwen_inventa', visual=dict(tipo='replay', camera='orbita:Qwen', t0=100.0), itens=[
        ('n', 'E o Qwen... inventou um item.'),
        ('pensa', 'Qwen', 'Tenho 16 planks, preciso de uma picareta de madeira pra minerar pedra. Vou craftar a spruce_pickaxe direto.', 102.0),
        ('card', 'erro', 'não conheço o item "spruce_pickaxe"', 2.2),
        ('pausa', 0.3)]),
    dict(id='placar_pedra', visual=dict(tipo='placar', titulo='IDADE DA PEDRA', linhas=[
        ('DeepSeek', '1:25'), ('GPT', '1:29'), ('Claude', '1:39'), ('MiMo', '1:58'), ('Qwen', '2:55'), ('GLM', '4:41')]), itens=[
        ('n', 'No fim: DeepSeek primeiro, GPT e Claude logo atrás... e o GLM só chegou mais de três minutos depois.'),
        ('pausa', 0.8)]),
    dict(id='gancho_noite', visual=dict(tipo='replay', camera='orbita:DeepSeek', t0=600.0), itens=[
        ('n', 'E aí a primeira noite foi chegando... e em menos de treze minutos, quatro delas já tinham morrido.'),
        ('pausa', 1.2)]),
]
FOLGA = 0.22


def voz(k, quem, tipo, texto):
    falado = ' '.join(b.bt.spoken(x) for x in texto.split())
    base = VOZ / k
    words, dur = b.tts(falado, b.NARRADOR if tipo == 'n' else VOZES[quem], base)
    src = f'mc/abertura/voz/{k}.mp3'
    if tipo in ('pensa', 'nota'):  # pensamento e anotação: a voz da IA com eco (nunca sussurro)
        eco = VOZ / f'{k}_eco.mp3'
        if not eco.exists() or eco.stat().st_mtime < base.with_suffix('.mp3').stat().st_mtime:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', ECO, eco], check=True)
        src = f'mc/abertura/voz/{k}_eco.mp3'
    escritas = texto.split()
    ws = [dict(w=(escritas[i] if len(escritas) == len(words) else w['word']), s=w['start'], e=w['end']) for i, w in enumerate(words)]
    return dict(src=src, dur=dur, tipo=tipo, quem=quem, texto=texto, palavras=ws)


def main():
    VOZ.mkdir(parents=True, exist_ok=True)
    saida, janelas = [], []
    for c in CENAS:
        t, itens = 0.0, []
        for i, it in enumerate(c['itens']):
            if it[0] == 'pausa':
                t += it[1]
                continue
            if it[0] == 'card':
                itens.append(dict(tipo='card', estilo=it[1], texto=it[2], at=round(t * FPS), dur=it[3]))
                t += it[3] + FOLGA
                continue
            if it[0] == 'n':
                a = voz(f"{c['id']}_{i}", None, 'n', it[1])
            else:
                a = voz(f"{c['id']}_{i}", it[1], it[0], it[2])
                a['t_log'] = it[3]
            a['at'] = round(t * FPS)
            itens.append(a)
            t += a['dur'] + FOLGA
        dur = t + 0.3
        v = dict(c['visual'])
        if v['tipo'] == 'replay':
            v['t1'] = round(v['t0'] + dur + 0.2, 2)
            janelas.append(f"{c['id']} {v['t0']:.2f} {v['t1']:.2f} {v['camera']}")
        saida.append(dict(id=c['id'], visual=v, itens=itens, dur=round(dur * FPS)))
        print(f"{c['id']:16s} {dur:5.1f}s")
    (PUB / 'abertura.json').write_text(json.dumps({'cenas': saida, 'obsClaude': OBS_CLAUDE}, ensure_ascii=False))
    (PUB / 'janelas.txt').write_text('\n'.join(janelas) + '\n')
    print('total', round(sum(x['dur'] for x in saida) / FPS, 1), 's')


if __name__ == '__main__':
    main()
