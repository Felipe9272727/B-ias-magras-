#!/usr/bin/env python3
"""Short do vídeo do Minecraft (vertical, < 60 s): "A IA mais azarada do Minecraft" = o arco do GLM (armadura de ferro,
afogado 27 min antes da arena, zumbis duas vezes, "fiquem à vontade pra se matarem", morto pelo DeepSeek). Falas copiadas
dos logs (conferidas como no mc_video). Gera remotion/public/mc/short/{abertura.json, janelas.txt}; o 3D é renderizado
em 540x960 (LARG=540 ALT=960 no render_seguro.sh) e a composição é ShortMC.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import mc_abertura as base  # noqa: E402
import mc_video  # noqa: E402

R, S = base.R, mc_video.S
PUB = base.ROOT / 'remotion' / 'public' / 'mc' / 'short'

CENAS = [
    dict(id='sh_armadura', visual=R('olhos:GLM', 9146.0), itens=[
        ('card', 'titulo', 'A IA MAIS AZARADA|DO MINECRAFT', 1.8),
        ('n', 'Essa IA tinha armadura de ferro, espada de ferro... e vinte e sete minutos até a batalha final.'),
        ('chat', 'GLM', 'Noite com creepers, vou me abrigar. Arena em ~28min, quem quiser aliança fala agora.', 9153.4),
        ('card', 'erro', 'construiu um abrigo em volta de si (0 blocos colocados).', 2.0),
        ('meme', 'surprised-pikachu', 1.4, 'center', 'record-scratch', 0.4),
        ('card', 'morte', 'GLM drowned', 1.0),
        ('meme', 'coffin-dance', 2.6, 'center', None, 2.4)]),
    dict(id='sh_zumbis', visual=S('GLM', 9174.0), itens=[
        ('n', 'Renasceu sem nada... e morreu pra zumbi. Duas vezes.'),
        ('card', 'servidor', 'GLM was slain by Zombie', 1.2),
        ('meme', 'crying-jordan', 1.4, 'center', 'sad-trombone', 1.2)]),
    dict(id='sh_arena', visual=S('GLM', 10826.0), itens=[
        ('n', 'Aí começou a arena. E ele foi direto ao ponto:'),
        ('chat', 'GLM', 'Estou fora disso por enquanto, fiquem à vontade pra se matarem.', 10829.3),
        ('meme', 'running-from-problems', 1.4, 'center', 'swoosh-fly', 1.2)]),
    dict(id='sh_fim', visual=S('GLM', 10867.0), itens=[
        ('card', 'servidor', 'GLM was slain by DeepSeek', 1.6),
        ('n', 'Cinco mortes numa partida só. E quem ganhou? Tá no vídeo completo.'),
        ('meme', 'mission-failed', 1.6, 'center', 'game-over-8bit', 1.4)]),
]


def main():
    if mc_video.conferir(CENAS):
        raise SystemExit('conserte as falas/cartões acima')
    base.montar(CENAS, PUB)


if __name__ == '__main__':
    main()
