#!/usr/bin/env python3
"""Gera roteiro/falas_au2.json: as falas das reuniões do Among Us 2 que entram no vídeo, copiadas do log
(amongus/logs2/partidaN.json) e cortadas só em fim de frase (no máximo ~210 caracteres). O roteiro lê daqui,
então nenhuma fala é reescrita à mão. Escolha de falas: (cor, rodada) na ordem em que entram no vídeo."""
import json, re
from pathlib import Path

LOGS = Path(__file__).resolve().parents[2] / 'amongus' / 'logs2'
MAX = 135

ESCOLHA = {
    '1-0': [('Preto', 1), ('Rosa', 1), ('Branco', 1), ('Verde', 1), ('Ciano', 1), ('Rosa', 2), ('Azul', 2), ('Verde', 2), ('Laranja', 2), ('Preto', 2)],
    '1-1': [('Marrom', 1), ('Lima', 1), ('Preto', 1), ('Branco', 1), ('Rosa', 1), ('Roxo', 2), ('Laranja', 2), ('Lima', 2), ('Preto', 2), ('Marrom', 2)],
    '1-2': [('Branco', 1), ('Roxo', 1), ('Lima', 1), ('Laranja', 1), ('Rosa', 2), ('Branco', 2), ('Azul', 2), ('Lima', 2), ('Preto', 2)],
    '2-0': [('Lima', 1), ('Verde', 1), ('Roxo', 1, 230), ('Ciano', 1), ('Vermelho', 2), ('Lima', 2), ('Roxo', 2)],
    '2-1': [('Marrom', 1), ('Vermelho', 1), ('Preto', 1), ('Rosa', 1), ('Verde', 1), ('Marrom', 2), ('Azul', 2), ('Verde', 2)],
    '2-2': [('Rosa', 1), ('Verde', 1), ('Ciano', 1), ('Laranja', 1), ('Azul', 1), ('Verde', 2), ('Azul', 2), ('Rosa', 2)],
    '2-3': [('Rosa', 1), ('Azul', 1), ('Preto', 1), ('Ciano', 1), ('Laranja', 2), ('Rosa', 2), ('Azul', 2), ('Preto', 2)],
    '3-0': [('Preto', 1), ('Verde', 1), ('Ciano', 1), ('Laranja', 1), ('Lima', 1), ('Branco', 1), ('Preto', 2), ('Azul', 2)],
    '3-1': [('Ciano', 1), ('Azul', 1), ('Branco', 1, 230), ('Amarelo', 1), ('Marrom', 1), ('Lima', 2), ('Ciano', 2), ('Marrom', 2)],
    '3-2': [('Branco', 1), ('Lima', 1), ('Verde', 1), ('Rosa', 1), ('Amarelo', 1), ('Roxo', 2), ('Azul', 2), ('Verde', 2), ('Rosa', 2)],
    '3-3': [('Azul', 1), ('Vermelho', 1), ('Lima', 1), ('Amarelo', 1), ('Branco', 1), ('Rosa', 1), ('Roxo', 2), ('Rosa', 2), ('Azul', 2)],
    '4-0': [('Vermelho', 1), ('Ciano', 1), ('Roxo', 1), ('Preto', 1), ('Branco', 1, 230), ('Verde', 1), ('Lima', 1), ('Vermelho', 2), ('Laranja', 2), ('Ciano', 2), ('Preto', 2)],
    '4-1': [('Azul', 1), ('Amarelo', 1), ('Branco', 1, 230), ('Roxo', 1), ('Amarelo', 2), ('Verde', 2), ('Roxo', 2), ('Lima', 2)],
    '4-2': [('Azul', 1), ('Laranja', 1), ('Preto', 1), ('Lima', 1), ('Vermelho', 1), ('Lima', 2), ('Laranja', 2), ('Azul', 2)],
    '4-3': [('Preto', 1), ('Verde', 1), ('Amarelo', 1), ('Laranja', 1), ('Lima', 1), ('Preto', 2), ('Azul', 2), ('Verde', 2), ('Laranja', 2)],
    '4-4': [('Verde', 1), ('Laranja', 1), ('Amarelo', 1), ('Lima', 1), ('Laranja', 2), ('Verde', 2), ('Lima', 2)],
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
    Path(__file__).with_name('falas_au2.json').write_text(json.dumps(saida, ensure_ascii=False, indent=1))
    total = sum(len(t) for v in saida.values() for _, t in v)
    print('falas:', sum(len(v) for v in saida.values()), 'caracteres:', total, 'faltou:', faltou)


if __name__ == '__main__':
    main()
