#!/usr/bin/env python3
"""Revisão de retenção do vídeo do Roblox (regra do canal: Haikus avaliam cada ~30 s antes da entrega).
Para cada janela de 30 s: uma folha com 3 quadros (+5 s, +15 s, +25 s) e o texto do trecho (narração, falas, selos,
memes), tirado da timeline. Cada janela é avaliada por um Haiku (claude -p --model haiku), em paralelo.
Uso: python3 scripts/rbx_revisao.py <video.mp4> <pasta de saída> [--so-material]
Saída: <pasta>/jNN.jpg, jNN.txt, jNN.nota.md e <pasta>/resumo.md (notas e problemas por janela)."""
import json, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
video, saida = sys.argv[1], Path(sys.argv[2]); saida.mkdir(parents=True, exist_ok=True)
tl = json.loads((ROOT / 'remotion' / 'public' / 'timeline_roblox.json').read_text())
FPS, JAN = 30, 30
ev, ini = [], 0
for c in tl['cenas']:
    for a in c['audio']:
        if a.get('txt'): ev.append(((ini + a['at']) / FPS, f"NARRADOR: {a['txt']}"))
    for o in c['over']:
        t = (ini + o['at']) / FPS
        if o['tipo'] == 'ia': ev.append((t, f"IA Carlos (voz + balão): {o['texto']}"))
        elif o['tipo'] == 'bush': ev.append((t, f"Bush (balão do chat): {o['texto']}"))
        elif o['tipo'] == 'jog': ev.append((t, f"Jogador do servidor (balão): {o['texto']}"))
        elif o['tipo'] == 'selo': ev.append((t, f"[SELO] {o['texto']}"))
        elif o['tipo'] == 'meme': ev.append((t, f"[MEME] {o['id']}"))
        elif o['tipo'] == 'numero': ev.append((t, f"[NÚMERO GRANDE] {o['texto']} {o.get('sub') or ''}"))
        elif o['tipo'] == 'marco': ev.append((t, f"[CARTÃO DE PARTE] {o.get('sub', '')}: {o['titulo']}"))
        elif o['tipo'] == 'seta': ev.append((t, f"[SETA apontando no gameplay] {o['rotulo']}"))
        elif o['tipo'] == 'morte': ev.append((t, '[CAVEIRA: MORTE, placar +1, som]'))
    if c.get('visual'): ev.append((ini / FPS, f"[CARTÃO ANIMADO: {c['visual']}]"))
    ini += c['dur']
ev.sort()
total = ini / FPS
PROMPT = """Você é um espectador de 12 a 16 anos do canal brasileiro Felipex007 (vídeos "IA jogando"). Avalie UM trecho de 30 s do vídeo
"IA jogando Roblox: IA ou humano?" (uma IA chamada Carlos joga Natural Disaster Survival com gente de verdade; o Bush é o dono do canal).
Leia a imagem {img} (3 quadros do trecho: +5 s, +15 s, +25 s) com a ferramenta Read. O texto do trecho (em ordem) é:

{txt}

Responda em português, curto, neste formato exato:
NOTA: <0 a 10> (prende a atenção e é divertido?)
TELA PARADA: sim/não (os quadros parecem iguais ou sem nada acontecendo?)
ENTENDE: sim/não (dá para entender o que aconteceu e qual foi o erro da IA?)
REPETIÇÃO OU JARGÃO: sim/não
PROBLEMA: <uma frase, ou "nenhum">
SUGESTÃO: <uma frase, ou "nenhuma">"""
jan = []
n = 0
while n * JAN < total - 3:
    a, b = n * JAN, min(total, (n + 1) * JAN)
    img = saida / f'j{n:02d}.jpg'
    ts = [min(b - 0.5, a + x) for x in (5, 15, 25)]
    ent = [x for t in ts for x in ('-ss', f'{t:.2f}', '-i', video)]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', '[0:v]scale=768:432[a];[1:v]scale=768:432[b];[2:v]scale=768:432[c];[a][b][c]hstack=3', '-frames:v', '1', '-q:v', '3', str(img)], check=True)
    txt = '\n'.join(f'{int(t) // 60}:{int(t) % 60:02d} {x}' for t, x in ev if a <= t < b) or '(sem fala nova neste trecho)'
    (saida / f'j{n:02d}.txt').write_text(f'JANELA {n} ({a // 60}:{a % 60:02d}-{int(b) // 60}:{int(b) % 60:02d})\n{txt}\n')
    jan.append((n, a, img, txt))
    n += 1
print(len(jan), 'janelas')
if '--so-material' in sys.argv:
    sys.exit()

def avaliar(j):
    n, a, img, txt = j
    for _ in range(3):
        r = subprocess.run(['claude', '-p', PROMPT.format(img=img, txt=txt), '--model', 'haiku', '--allowedTools', 'Read'], capture_output=True, text=True, timeout=300, cwd=str(saida))
        if 'NOTA' in r.stdout:
            break
    (saida / f'j{n:02d}.nota.md').write_text(r.stdout)
    return n, a, r.stdout

linhas, notas = ['# Revisão dos Haikus (janelas de 30 s)', ''], []
with ThreadPoolExecutor(4) as ex:
    for n, a, res in ex.map(avaliar, jan):
        m = re.search(r'NOTA:\s*(\d+(?:[.,]\d+)?)', res)
        nota = float(m.group(1).replace(',', '.')) if m else None
        notas.append(nota)
        linhas += [f'## j{n:02d} ({a // 60}:{a % 60:02d}) — nota {nota}', res.strip(), '']
ok = [x for x in notas if x is not None]
linhas.insert(2, f'Média: {sum(ok) / max(1, len(ok)):.1f} · mínima: {min(ok) if ok else "-"} · janelas: {len(notas)}\n')
(saida / 'resumo.md').write_text('\n'.join(linhas))
print(linhas[2]); print(' '.join(str(x) for x in notas))
