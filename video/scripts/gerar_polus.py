#!/usr/bin/env python3
"""Gera o mapa Polus (Among Us 5) no mesmo formato da nave da Skeld (grade em texto + dados das salas).

As salas e as áreas externas (neve) foram medidas no mapa oficial do jogo (tela de admin 1920x1080) e convertidas
para a grade: 1 célula = 12 px da referência. Saídas:
  - video/remotion/src/amongus5/polus/mapaPolus.ts   (grade, salas, temas, pontos de parada, consoles, dutos)
  - amongus/mapa_polus.mjs                           (lógica do motor: salas, vizinhas, dutos, tarefas)
  - scratchpad/polus_grade.png (prévia rápida da grade)
Uso: python3 gerar_polus.py [prévia.png]
"""
import json
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PX, OX, OY = 12, 200, 60  # 12 px da referência por célula; origem da grade na referência
COLS, ROWS = 128, 82


def cel(x, y):
    return round((x - OX) / PX), round((y - OY) / PX)


# salas: id -> (nome, x0, y0, x1, y1) em px da referência (retângulo externo, com parede)
SALAS = {
    'Dropship': ('Nave de Pouso', 726, 96, 906, 396),
    'Eletrica': ('Elétrica', 438, 384, 618, 594),
    'Seguranca': ('Segurança', 258, 462, 378, 570),
    'O2': ('O2', 210, 606, 366, 852),
    'Caldeira': ('Sala da Caldeira', 210, 906, 378, 1014),
    'Comunicacoes': ('Comunicações', 570, 630, 696, 804),
    'Armas': ('Armas', 558, 834, 738, 1014),
    'Deposito': ('Depósito', 834, 456, 1038, 564),
    'Escritorio': ('Escritório', 780, 654, 1254, 750),
    'Admin': ('Admin', 918, 822, 1134, 1026),
    'Descontaminacao': ('Descontaminação', 1110, 318, 1254, 414),
    'Laboratorio': ('Laboratório', 1254, 276, 1710, 498),
    'DescontaminacaoInf': ('Descontaminação 2', 1590, 498, 1710, 570),
    'Especime': ('Sala de Espécimes', 1428, 744, 1644, 918),
}
# áreas externas (neve), em px da referência
NEVE = [
    (366, 390, 1110, 474), (618, 474, 834, 834), (1038, 474, 1254, 660), (834, 564, 1038, 660),
    (366, 474, 444, 1026), (366, 750, 570, 906), (366, 906, 558, 1026), (696, 750, 918, 1026),
    (780, 750, 1134, 822), (1134, 798, 1428, 870), (1254, 498, 1590, 798), (1596, 570, 1662, 744),
    (696, 660, 780, 750), (906, 390, 1110, 474), (378, 570, 438, 610),
    (1110, 414, 1254, 474), (1038, 330, 1110, 474), (444, 594, 570, 750), (1134, 750, 1254, 798), (570, 804, 696, 834),
]
# portas entre salas encostadas (a Descontaminação liga a neve ao Laboratório; a de baixo, o Lab aos Espécimes)
PORTAS_SALAS = [('Descontaminacao', 'Laboratorio'), ('Laboratorio', 'DescontaminacaoInf')]
# lados sem porta (a sala encosta na neve ali, mas no jogo não há passagem)
SEM_PORTA = {('Laboratorio', 'S'), ('Laboratorio', 'N'), ('Laboratorio', 'O'), ('Descontaminacao', 'N'),
             ('DescontaminacaoInf', 'L'), ('DescontaminacaoInf', 'O'), ('Dropship', 'L'), ('Dropship', 'O'), ('Dropship', 'N')}

# lógica do motor (vizinhas a 1 tique de caminhada, dutos, botão, tarefas)
VIZINHAS = [
    ('Dropship', 'Deposito'), ('Dropship', 'Eletrica'), ('Dropship', 'Descontaminacao'), ('Dropship', 'Escritorio'),
    ('Eletrica', 'Seguranca'), ('Eletrica', 'O2'), ('Eletrica', 'Comunicacoes'),
    ('Seguranca', 'O2'), ('O2', 'Caldeira'), ('O2', 'Comunicacoes'),
    ('Caldeira', 'Armas'), ('Comunicacoes', 'Armas'), ('Comunicacoes', 'Escritorio'),
    ('Armas', 'Admin'), ('Deposito', 'Escritorio'), ('Escritorio', 'Admin'), ('Escritorio', 'Especime'),
    ('Admin', 'Especime'), ('Descontaminacao', 'Laboratorio'), ('Laboratorio', 'DescontaminacaoInf'),
    ('DescontaminacaoInf', 'Especime'),
]
DUTOS = [['Seguranca', 'Eletrica', 'O2'], ['Comunicacoes', 'Armas', 'Escritorio'], ['Admin', 'Laboratorio'],
         ['Especime', 'Laboratorio'], ['Caldeira', 'Deposito']]
BOTAO = 'Escritorio'
TAREFAS = {
    'Dropship': [['Inserir as chaves', 1], ['Traçar a rota', 2]],
    'Eletrica': [['Consertar a fiação', 2], ['Religar os nós do clima', 2]],
    'Seguranca': [['Consertar a fiação', 2]],
    'O2': [['Encher os galões', 2], ['Monitorar a árvore', 2], ['Esvaziar o lixo', 2]],
    'Caldeira': [['Abrir as comportas', 2], ['Trocar o galão de água', 3]],
    'Comunicacoes': [['Reiniciar o wi-fi', 3], ['Baixar dados', 2]],
    'Armas': [['Destruir asteroides', 3], ['Baixar dados', 2]],
    'Deposito': [['Abastecer os motores', 2]],
    'Escritorio': [['Passar o cartão', 2], ['Regar as plantas', 2], ['Escanear o passe', 1]],
    'Admin': [['Enviar dados', 2], ['Consertar a fiação', 2]],
    'Descontaminacao': [],
    'Laboratorio': [['Consertar a broca', 2], ['Alinhar o telescópio', 2], ['Inspecionar amostra', 3], ['Registrar a temperatura', 1]],
    'DescontaminacaoInf': [],
    'Especime': [['Guardar os artefatos', 2], ['Abrir a porta dos espécimes', 1]],
}
# cores do piso/parede de cada sala (Polus: prédios marrons e cinza, luzes laranja)
TEMAS = {
    'Dropship': ('#9aa3ad', '#8a929b', '#5b6470', '#3b434d', '#7fd3ff'),
    'Eletrica': ('#8f8a70', '#7f7a60', '#6b5a43', '#47392a', '#ffd54f'),
    'Seguranca': ('#7d8794', '#6d7784', '#5a4636', '#3b2d22', '#ff5252'),
    'O2': ('#86a8a0', '#769890', '#5e4a38', '#3d3024', '#7fffd4'),
    'Caldeira': ('#9a8478', '#8a7468', '#5e3f2e', '#3e2a1f', '#ff8a50'),
    'Comunicacoes': ('#8d97a6', '#7d8796', '#5c4838', '#3c2f25', '#64b5f6'),
    'Armas': ('#909aa4', '#808a94', '#5c4838', '#3c2f25', '#ff7043'),
    'Deposito': ('#a49a86', '#948a76', '#6a5440', '#46372a', '#ffcc80'),
    'Escritorio': ('#b0a58e', '#a0957e', '#6a5440', '#46372a', '#aed581'),
    'Admin': ('#9fa8b3', '#8f98a3', '#5c4838', '#3c2f25', '#4dd0e1'),
    'Descontaminacao': ('#c5ccd3', '#b5bcc3', '#5b6470', '#3b434d', '#69f0ae'),
    'Laboratorio': ('#c9d1d8', '#b9c1c8', '#5b6470', '#3b434d', '#80deea'),
    'DescontaminacaoInf': ('#c5ccd3', '#b5bcc3', '#5b6470', '#3b434d', '#69f0ae'),
    'Especime': ('#a6b0bb', '#96a0ab', '#4e5865', '#323a44', '#b388ff'),
}


def main():
    g = [[' '] * COLS for _ in range(ROWS)]
    for (x0, y0, x1, y1) in NEVE:
        c0, r0 = cel(x0, y0)
        c1, r1 = cel(x1, y1)
        for r in range(max(0, r0), min(ROWS, r1)):
            for c in range(max(0, c0), min(COLS, c1)):
                g[r][c] = ','
    rects = {}
    for s, (nome, x0, y0, x1, y1) in SALAS.items():
        c0, r0 = cel(x0, y0)
        c1, r1 = cel(x1, y1)
        rects[s] = (c0, r0, c1, r1)
        for r in range(r0, r1):
            for c in range(c0, c1):
                borda = r in (r0, r1 - 1) or c in (c0, c1 - 1)
                g[r][c] = '#' if borda else '.'
    # portas para a neve: em cada lado da sala, uma janela de até 4 células no meio do maior trecho que encosta na neve
    for s, (c0, r0, c1, r1) in rects.items():
        lados = {
            'N': [(r0, c, r0 - 1, c) for c in range(c0 + 1, c1 - 1)],
            'S': [(r1 - 1, c, r1, c) for c in range(c0 + 1, c1 - 1)],
            'O': [(r, c0, r, c0 - 1) for r in range(r0 + 1, r1 - 1)],
            'L': [(r, c1 - 1, r, c1) for r in range(r0 + 1, r1 - 1)],
        }
        for lado, cels in lados.items():
            if (s, lado) in SEM_PORTA:
                continue
            ok = [0 <= rr < ROWS and 0 <= cc < COLS and g[rr][cc] == ',' for (_, _, rr, cc) in cels]
            melhor, ini, k = (0, 0), None, 0
            for i, v in enumerate(ok + [False]):
                if v and ini is None:
                    ini = i
                if not v and ini is not None:
                    if i - ini > melhor[1] - melhor[0]:
                        melhor = (ini, i)
                    ini = None
            if melhor[1] - melhor[0] >= 4:
                meio = (melhor[0] + melhor[1]) // 2
                for i in range(max(melhor[0], meio - 2), min(melhor[1], meio + 2)):
                    r, c, _, _ = cels[i]
                    g[r][c] = 'D'
    # portas entre salas encostadas
    for a, b in PORTAS_SALAS:
        ca0, ra0, ca1, ra1 = rects[a]
        cb0, rb0, cb1, rb1 = rects[b]
        if ca1 == cb0 + 1 or ca1 == cb0:  # a à esquerda de b (paredes coladas)
            rs = range(max(ra0, rb0) + 1, min(ra1, rb1) - 1)
            meio = (rs.start + rs.stop) // 2
            for r in range(meio - 2, meio + 2):
                for c in (ca1 - 1, cb0):
                    g[r][c] = 'D'
        else:  # a em cima de b
            cs = range(max(ca0, cb0) + 1, min(ca1, cb1) - 1)
            meio = (cs.start + cs.stop) // 2
            for c in range(meio - 2, meio + 2):
                for r in (ra1 - 1, rb0):
                    g[r][c] = 'D'
    grid = [''.join(l) for l in g]

    # conferência: toda sala alcança todas as outras andando ('.', ',', 'D')
    def vizinhos(r, c):
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            if 0 <= rr < ROWS and 0 <= cc < COLS and grid[rr][cc] in '.,D':
                yield rr, cc
    c0, r0, c1, r1 = rects['Escritorio']
    ini = (r0 + 2, c0 + 2)
    vist = {ini}
    q = deque([ini])
    while q:
        for v in vizinhos(*q.popleft()):
            if v not in vist:
                vist.add(v)
                q.append(v)
    for s, (c0, r0, c1, r1) in rects.items():
        if ((r0 + r1) // 2, (c0 + c1) // 2) not in vist:
            print('SEM ACESSO:', s)

    # dados das salas (px de mundo, TILE = 48)
    T = 48
    salas = {}
    for s, (c0, r0, c1, r1) in rects.items():
        ic0, ir0, iw, ih = c0 + 1, r0 + 1, c1 - c0 - 2, r1 - r0 - 2
        cx0, cy0 = ic0 * T, ir0 * T
        W, H = iw * T, ih * T
        spots = []
        for i in range(8):
            fx = 0.2 + 0.6 * ((i % 4) / 3)
            fy = 0.35 if i < 4 else 0.7
            spots.append({'x': round(cx0 + W * fx), 'y': round(cy0 + H * fy)})
        consoles = [{'x': round(cx0 + W * 0.3), 'y': cy0 + 30}, {'x': round(cx0 + W * 0.7), 'y': cy0 + 30}]
        t = TEMAS[s]
        dado = {'nome': SALAS[s][0], 'rect': {'c': ic0, 'r': ir0, 'w': iw, 'h': ih},
                'tema': {'piso': t[0], 'piso2': t[1], 'parede': t[2], 'paredeTopo': t[3], 'destaque': t[4]},
                'spots': spots, 'consoles': consoles, 'props': []}
        if any(s in d for d in DUTOS):
            dado['duto'] = {'x': round(cx0 + W * 0.85), 'y': round(cy0 + H * 0.8)}
        salas[s] = dado

    ts = ROOT / 'video' / 'remotion' / 'src' / 'amongus5' / 'polus' / 'mapaPolus.ts'
    ts.parent.mkdir(parents=True, exist_ok=True)
    ts.write_text(
        '// Mapa Polus (Among Us 5), gerado por video/scripts/gerar_polus.py a partir do mapa oficial (não editar à mão).\n'
        '// Mesmo formato da nave da Skeld (amongus/nave/spec.ts), com as salas do Polus.\n'
        f'export type SalaPolus = {" | ".join(repr(s) for s in SALAS)};\n'
        f'export const SALAS_POLUS: SalaPolus[] = {json.dumps(list(SALAS))};\n'
        'export type PtP = {x: number; y: number};\n'
        'export type TemaP = {piso: string; piso2: string; parede: string; paredeTopo: string; destaque: string};\n'
        'export type DadosSalaP = {nome: string; rect: {c: number; r: number; w: number; h: number}; tema: TemaP; spots: PtP[]; consoles: PtP[]; duto?: PtP; props: unknown[]};\n'
        f'export const POLUS: {{cols: number; rows: number; grid: string[]; salas: Record<SalaPolus, DadosSalaP>}} = {json.dumps({"cols": COLS, "rows": ROWS, "grid": grid, "salas": salas}, ensure_ascii=False, indent=1)};\n'
        f'export const VIZINHAS_POLUS: [SalaPolus, SalaPolus][] = {json.dumps(VIZINHAS)};\n'
        f'export const DUTOS_POLUS: SalaPolus[][] = {json.dumps(DUTOS)};\n')
    mjs = ROOT / 'amongus' / 'mapa_polus.mjs'
    xs = {s: {'x': round(((rects[s][0] + rects[s][2]) / 2) / COLS * 100), 'y': round(((rects[s][1] + rects[s][3]) / 2) / ROWS * 100), 'nome': SALAS[s][0]} for s in SALAS}
    mjs.write_text(
        '// Mapa Polus (Among Us 5) para o motor: gerado por video/scripts/gerar_polus.py. Mesmas funções do mapa.mjs (Skeld).\n'
        f'export const SALAS = {json.dumps(xs, ensure_ascii=False, indent=1)}\n\n'
        f'export const CORREDORES = {json.dumps(VIZINHAS)}\n\n'
        f'export const DUTOS = {json.dumps(DUTOS)}\n\n'
        f"export const BOTAO_EMERGENCIA = '{BOTAO}'\n\n"
        f'export const TAREFAS = {json.dumps(TAREFAS, ensure_ascii=False, indent=1)}\n\n'
        'export function vizinhos(sala) {\n  const v = []\n  for (const [a, b] of CORREDORES) {\n    if (a === sala) v.push(b)\n    if (b === sala) v.push(a)\n  }\n  return v\n}\n\n'
        'export function dutosDe(sala) {\n  const s = new Set()\n  for (const g of DUTOS) if (g.includes(sala)) for (const x of g) if (x !== sala) s.add(x)\n  return [...s]\n}\n\n'
        'export function caminho(de, para) {\n  if (de === para) return [de]\n  const prev = { [de]: null }\n  const fila = [de]\n  while (fila.length) {\n    const a = fila.shift()\n    for (const b of vizinhos(a)) {\n      if (b in prev) continue\n      prev[b] = a\n      if (b === para) {\n        const c = [b]\n        let x = a\n        while (x) { c.unshift(x); x = prev[x] }\n        return c\n      }\n      fila.push(b)\n    }\n  }\n  return null\n}\n')
    if len(sys.argv) > 1:
        from PIL import Image
        cores = {' ': (20, 22, 30), '#': (90, 70, 55), '.': (190, 190, 200), ',': (235, 240, 245), 'D': (255, 170, 60)}
        im = Image.new('RGB', (COLS, ROWS))
        im.putdata([cores[ch] for l in grid for ch in l])
        im.resize((COLS * 8, ROWS * 8), Image.NEAREST).save(sys.argv[1])
    print('ok', ts, mjs)


if __name__ == '__main__':
    main()
