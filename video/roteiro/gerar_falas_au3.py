#!/usr/bin/env python3
"""Gera roteiro/falas_au3.json: as falas das reuniões do Among Us 3 que entram no vídeo, copiadas do log
(amongus/logs3/partidaN.json) e cortadas só em fim de frase (no máximo ~210 caracteres). O roteiro lê daqui,
então nenhuma fala é reescrita à mão. Escolha de falas: (cor, rodada) na ordem em que entram no vídeo."""
import json, re
from pathlib import Path

LOGS = Path(__file__).resolve().parents[2] / 'amongus' / 'logs3'
MAX = 135

# preenchido depois das partidas valendo: 'partida-reunião': [(cor, rodada[, máximo de caracteres]), ...]
ESCOLHA = {
    '1-0': [('Preto', 1), ('Amarelo', 1), ('Cinza', 1, 170), ('Vermelho', 1), ('Lima', 1), ('Marrom', 2, 150)],
    '1-1': [('Preto', 1), ('Bordo', 2), ('Coral', 2), ('Laranja', 2), ('Preto', 2)],
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
    Path(__file__).with_name('falas_au3.json').write_text(json.dumps(saida, ensure_ascii=False, indent=1))
    total = sum(len(t) for v in saida.values() for _, t in v)
    print('falas:', sum(len(v) for v in saida.values()), 'caracteres:', total, 'faltou:', faltou)


if __name__ == '__main__':
    main()
