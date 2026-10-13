"""Ajustes nas placas do vídeo 3: quem fala vira pra câmera e placa que começa vazia é adiantada.

O diretor 3D escolhe a direção do boneco pelo caminho que ele faz, então muita fala saía de costas.
Aqui, nos quadros em que o tributo tem balão/pensamento e está numa animação parada (parado, falar,
comer, coletar...), a direção vai para a de frente mais próxima (0, 45 ou 315). Nas apresentações
dos tributos (t0*) todo mundo parado fica de frente.

Lê public/timeline3_completo.json; mexe em public/ilha/3d/<tomada>.json e guarda o original em
<tomada>.json.orig (rodar de novo parte sempre do original; render3d novo vira o original).
Uso: python3 video/scripts/virar_falantes.py [timeline]
"""
import json, os, shutil, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(AQUI, '..', 'remotion', 'public'))
PARADAS = {'parado', 'ferido', 'falar', 'beber', 'coletar', 'comer', 'sentar'}
FRENTE = {0: 0, 45: 45, 90: 45, 135: 45, 180: 0, 225: 315, 270: 315, 315: 315}
ANTES, DEPOIS, JUNTA = 6, 16, 18


def janelas(chat, tid):
    js = sorted((c['at'] - ANTES, c['at'] + c['dur'] + DEPOIS) for c in chat if c['id'] == tid)
    out = []
    for a, b in js:
        if out and a - out[-1][1] <= JUNTA:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def visivel(q):
    return q and -0.03 < q[0] < 1.03 and 0.15 < q[1] < 1.5


def adiantar(pos):
    """Placa que começa vazia (boneco ainda fora do quadro) parece cena parada: adianta a trilha dos atores.
    Se alguém morre na tomada, adianta no máximo 1,25 s pra não descolar do ELIMINADO."""
    trs = pos['atores']
    n = max(len(tr) for tr in trs.values())
    vazio = 0
    while vazio < n and not any(visivel(tr[min(vazio, len(tr) - 1)]) for tr in trs.values()):
        vazio += 1
    if vazio <= 24 or vazio >= n:
        return 0
    nomes = pos['anims']
    morre = any(q and nomes[q[4]] == 'cair' for tr in trs.values() for q in tr)
    off = min(vazio - 8, 30) if morre else vazio - 8
    if 'parado' not in nomes:
        nomes.append('parado')
    ip = nomes.index('parado')
    for tid, tr in trs.items():
        ult = tr[-1]
        cauda = []
        for k in range(1, off + 1):
            if not ult:
                cauda.append(None)
                continue
            q = list(ult)
            if nomes[q[4]] in ('andar', 'correr'):
                q[4] = ip
            if nomes[q[4]] not in ('cair', 'morto'):
                q[5] = round(q[5] + k / 24, 4)
            cauda.append(q)
        trs[tid] = tr[off:] + cauda
    if pos.get('telas'):
        pos['telas'] = pos['telas'][off:] + [pos['telas'][-1]] * off
    return off


def main():
    tl = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PUB, 'timeline3_completo.json')
    cenas = json.load(open(tl))['scenes']
    mudou = 0
    for c in cenas:
        v = c.get('visual') or {}
        if v.get('name') != 'IL3D':
            continue
        chat = v['props'].get('chat') or []
        for tm in v['props']['tomadas']:
            arq = os.path.join(PUB, 'ilha', '3d', f"{tm['id']}.json")
            if not os.path.exists(arq):
                continue
            orig = arq + '.orig'
            atual = json.load(open(arq))
            if 'atores' not in atual:  # tomada 3D de verdade (abertura): nada a fazer
                continue
            if not atual.get('ajustado') or not os.path.exists(orig):  # saiu agora do render3d
                shutil.copy(arq, orig)
            pos = json.load(open(orig))
            pos['ajustado'] = True
            if pos['atores']:
                off = adiantar(pos)
                if off:
                    print('adiantada', tm['id'], off, 'quadros')
            nomes = pos['anims']
            intro = tm['id'].startswith('t0')
            for tid, tr in pos['atores'].items():
                js = [(a - tm['de'], b - tm['de']) for a, b in janelas(chat, tid)]
                for i, q in enumerate(tr):
                    if not q or nomes[q[4]] not in PARADAS:
                        continue
                    if intro or any(a <= i < b for a, b in js):
                        nd = FRENTE.get(int(q[3]) % 360, q[3])
                        if nd != q[3]:
                            q[3] = nd
                            mudou += 1
            json.dump(pos, open(arq, 'w'))
    # cenários do Short 3: o DeepSeek 4 (protagonista) fica de frente sempre que está parado
    curta = os.path.normpath(os.path.join(AQUI, '..', '..', 'ilha', 'dados', 'tomadas3_short.json'))
    for spec in (json.load(open(curta)) if os.path.exists(curta) else []):
        arq = os.path.join(PUB, 'ilha', '3d', f"{spec['id']}.json")
        if not os.path.exists(arq):
            continue
        pos = json.load(open(arq))
        for q in pos['atores'].get(spec.get('alvo'), []):
            if q and pos['anims'][q[4]] in PARADAS:
                nd = FRENTE.get(int(q[3]) % 360, q[3])
                if nd != q[3]:
                    q[3] = nd
                    mudou += 1
        json.dump(pos, open(arq, 'w'))
    print('quadros virados:', mudou)


if __name__ == '__main__':
    main()
