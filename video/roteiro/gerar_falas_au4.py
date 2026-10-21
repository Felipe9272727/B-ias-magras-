#!/usr/bin/env python3
"""Gera roteiro/falas_au4.json (cópia do gerar_falas_au3.py): as falas das reuniões do Among Us 4 que entram no vídeo, copiadas do log
(amongus/logs4/partidaN.json) e cortadas só em fim de frase (no máximo ~210 caracteres). O roteiro lê daqui,
então nenhuma fala é reescrita à mão. Escolha de falas: (cor, rodada) na ordem em que entram no vídeo."""
import json, re
from pathlib import Path

LOGS = Path(__file__).resolve().parents[2] / 'amongus' / 'logs4'
MAX = 135

# preenchido depois das partidas valendo: 'partida-reunião': [(cor, rodada[, máximo de caracteres]), ...]
ESCOLHA = {
    # partida 2 (a lenta)
    '2-0': [('Roxo', 1, 170), ('Preto', 1, 150), ('Azul', 2, 280), ('Rosa', 2)],
    '2-1': [('Cinza', 1, 150), ('Bordo', 1, 190), ('Laranja', 2, 170)],
    # partida 3
    '3-0': [('Rosa', 1, 190), ('Cinza', 1, 150), ('Bordo', 1, 190), ('Lima', 2, 150)],
    '3-1': [('Branco', 1, 160), ('Bordo', 1, 170), ('Bordo', 2, 120), ('Roxo', 2, 170)],
    '3-2': [('Amarelo', 1, 120), ('Roxo', 2, 170), ('Cinza', 2, 120)],
    '3-3': [('Ciano', 1, 150), ('Verde', 1, 190), ('Roxo', 2, 190), ('Vermelho', 2)],
    # partida 1
    '1-0': [('Vermelho', 1, 150), ('Preto', 1, 150), ('Verde', 1, 120), ('Marrom', 2, 170)],
    '1-1': [('Cinza', 1, 190), ('Laranja', 2, 200), ('Azul', 2, 150), ('Amarelo', 2, 150)],
    # partida 4
    '4-0': [('Vermelho', 1), ('Branco', 1, 200), ('Vermelho', 2, 150), ('Marrom', 2, 230), ('Bordo', 2, 270)],
    '4-1': [('Lima', 1, 150), ('Roxo', 2, 200), ('Bordo', 2, 190)],
    '4-2': [('Laranja', 1, 190), ('Branco', 2, 220), ('Lima', 2, 170)],
    '4-3': [('Laranja', 1, 190), ('Ciano', 2, 200), ('Preto', 2, 170)],
    '4-4': [('Rosa', 1), ('Azul', 1, 170), ('Bordo', 1, 150), ('Laranja', 2, 200)],
    # partida 5 (bônus): o Possuidor
    '5-0': [('Preto', 1, 120), ('Lima', 1, 120), ('Verde', 1, 120), ('Cinza', 1, 90)],
    '5-1': [('Roxo', 1, 120), ('Bordo', 1, 140), ('Preto', 1, 150)],
    '5-2': [('Amarelo', 1), ('Rosa', 1, 190), ('Cinza', 1, 270), ('Cinza', 2, 250)],
    '5-3': [('Laranja', 1, 260), ('Rosa', 1, 190), ('Cinza', 1, 150), ('Preto', 2, 130), ('Laranja', 2, 120)],
    '4-5': [('Azul', 1, 230), ('Laranja', 2), ('Azul', 2), ('Rosa', 2, 190)],
}


def cortar(t, mx=None):
    MAXL = mx or MAX
    t = t.strip()
    if len(t) <= MAXL:
        return t
    frases = re.split(r'(?<=[.!?])\s+', t)
    out = ''
    for f in frases:
        if len(out) + len(f) + 1 > MAXL:
            break
        out = (out + ' ' + f).strip()
    if out:
        return out
    # primeira frase longa demais: corta na última vírgula/travessão antes do limite
    corte = max(t.rfind(', ', 0, MAXL), t.rfind(' — ', 0, MAXL), t.rfind('; ', 0, MAXL))
    return (t[:corte] if corte > 60 else t[:MAXL].rsplit(' ', 1)[0]).rstrip(',;— ') + '...'


def main():
    saida, faltou = {}, []
    for chave, picks in ESCOLHA.items():
        n, i = map(int, chave.split('-'))
        r = json.loads((LOGS / f'partida{n}.json').read_text())['reunioes'][i]
        usadas = set()
        lista = []
        for pk in picks:
            cor, rod = pk[0], pk[1]
            mx = pk[2] if len(pk) > 2 else None  # limite próprio quando a frase cortada é a que o narrador comenta
            cand = [k for k, f in enumerate(r['falas']) if f['cor'] == cor and f['rodada'] == rod and k not in usadas and f['texto'].strip('. ')]
            if not cand:
                faltou.append((chave, cor, rod))
                continue
            usadas.add(cand[0])
            lista.append([cor, cortar(r['falas'][cand[0]]['texto'], mx)])
        saida[chave] = lista
    Path(__file__).with_name('falas_au4.json').write_text(json.dumps(saida, ensure_ascii=False, indent=1))
    total = sum(len(t) for v in saida.values() for _, t in v)
    print('falas:', sum(len(v) for v in saida.values()), 'caracteres:', total, 'faltou:', faltou)


if __name__ == '__main__':
    main()
