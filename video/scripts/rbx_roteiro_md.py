#!/usr/bin/env python3
"""Escreve video/roteiro/roblox_ia_ou_humano.md a partir do roteiro (roteiro_roblox.json) e da timeline já montada
(tempos do vídeo). O JSON é a fonte; o .md é a versão para ler. Uso: python3 scripts/rbx_roteiro_md.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rot = json.loads((ROOT / 'roteiro' / 'roteiro_roblox.json').read_text())
tl = json.loads((ROOT / 'remotion' / 'public' / 'timeline_roblox.json').read_text())
NOME = {'A': 'partida_ia.mp4', 'B': 'partida_ia2.mp4', 'T': 'teste_final.mp4', 'F2': 'testes/repo_flicker-connection-02.mkv',
        'D1': 'testes/repo_natural-disasters-connection-01.mkv', 'D2': 'testes/repo_natural-disasters-network-diagnostic.mkv'}
mmss = lambda s: f'{int(s) // 60}:{int(s) % 60:02d}'
CAB = (ROOT / 'roteiro' / 'roblox_cabecalho.md').read_text()
out = [CAB.rstrip(), '', '## Roteiro cena a cena', '',
       'Tempo = posição no vídeo final. Origem = arquivo e trecho do gameplay (mm:ss). "IA" = fala do Carlos copiada do log/chat;',
       '"Bush" = mensagem do Felipe como aparece no chat do jogo; "Jogador" = mensagem de jogador real, sem nome.', '']
ini = 0
for c, t in zip(rot['cenas'], tl['cenas']):
    if c.get('cap'):
        out += ['', f"### {c.get('capsub', '')} — {c['cap']} ({mmss(ini / 30)})", '']
    elif ini == 0:
        out += ['### ABERTURA (clímax primeiro) e premissa', '']
    orig = f"{NOME[c['clip'][0]]} {mmss(c['clip'][1])}–{mmss(c['clip'][2])}" if c.get('clip') else ''
    extra = f" · cartão: {c['visual']}" if c.get('visual') else ''
    out.append(f"**{c['id']}** · {mmss(ini / 30)} · origem: {orig}{extra}")
    for it in c['itens']:
        k = it[0]
        if k == 'n': out.append(f'- Narrador: {it[1]}')
        elif k == 'ia': out.append(f'- IA (Carlos): "{it[1]}"')
        elif k == 'voz': out.append('- IA (Carlos), voz sobre a mensagem na tela: "You\'ve hit your 5-hour limit  resets 8:40pm (UTC)"')
        elif k == 'bush': out.append(f'- Bush (chat): "{it[1]}"')
        elif k == 'jog': out.append(f'- Jogador (chat): "{it[1]}"')
        elif k == 'selo': out.append(f'- SELO: {it[1]}')
        elif k == 'meme': out.append(f'- MEME: {it[1]}')
        elif k == 'numero': out.append(f"- NÚMERO NA TELA: {it[1]}{' — ' + it[2] if len(it) > 2 else ''}")
        elif k == 'seta': out.append(f'- SETA no gameplay: {it[3]}')
        elif k == 'morte': out.append('- MORTE (placar +1, caveira, som)')
        elif k == 'morte0': out.append('- MORTE mostrada sem contar (a cena volta na Parte 8)')
        elif k == 'hud': out.append(f"- PLACAR: {'sobreviveu' if it[1] == 'sobrev' else 'quem percebeu'} +1")
        elif k == 'tempo': out.append(f'- MARCADOR DE TEMPO: {it[1]}')
    out.append('')
    ini += t['dur']
out.append(f'Duração total: {mmss(ini / 30)}.')
(ROOT / 'roteiro' / 'roblox_ia_ou_humano.md').write_text('\n'.join(out) + '\n')
print('ok', mmss(ini / 30))
