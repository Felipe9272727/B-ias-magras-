#!/usr/bin/env python3
# HUD do Minecraft para o Remotion (partida 1).
# Lê minecraft/gravacoes/partida1/eventos_<Nome>.jsonl (inventário, nas linhas 'decisao') e
# posicoes_<Nome>.jsonl (vida, fome, mão e armadura, a cada ~0,25 s), e grava em
# video/remotion/public/mc/hud/: <Nome>.json (séries que só guardam mudanças) e itens.json
# (qual textura usar em cada item). Copia os sprites do HUD para public/mc/gui/ e as
# texturas dos itens/blocos para public/mc/itens/. Texturas que não existem são listadas no fim.
# Uso: python3 video/scripts/hud_mc.py
import json
import re
import shutil
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
GRAV = RAIZ / 'minecraft/gravacoes/partida1'
TEX = RAIZ / 'minecraft/texturas_oficiais/assets/minecraft/textures'
SAIDA = RAIZ / 'video/remotion/public/mc'
IAS = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo']

# sprites do HUD: origem em gui/sprites/hud/ -> destino em public/mc/gui/
SPRITES = {
    'hotbar.png': 'hotbar.png',
    'hotbar_selection.png': 'hotbar_selection.png',
    'heart/full.png': 'heart_full.png',
    'heart/half.png': 'heart_half.png',
    'heart/container.png': 'heart_container.png',
    'food_full.png': 'food_full.png',
    'food_half.png': 'food_half.png',
    'food_empty.png': 'food_empty.png',
    'armor_full.png': 'armor_full.png',
    'armor_half.png': 'armor_half.png',
    'armor_empty.png': 'armor_empty.png',
}

# blocos que o jogo desenha como sprite plano (não como cubo)
PLANOS_BLOCO = {'torch', 'spruce_sapling', 'oak_sapling'}
# itens que não estão nas pastas oficiais desta cópia: substituto mais parecido
SUBSTITUTOS = {
    'shield': ('gui/sprites/container/slot/shield.png', 'plano'),  # ícone do slot vazio do escudo
    'spruce_button': ('block/spruce_planks.png', 'cubo'),  # botão de madeira: aproximado pelas tábuas
}

copiados: dict[str, str] = {}  # origem -> nome em itens/
faltas: list[str] = []


def copiar(origem: Path, destino: str) -> str:
    """Copia uma textura para public/mc/itens/ (uma vez por origem) e devolve o caminho relativo a mc/."""
    if str(origem) not in copiados:
        pasta = SAIDA / 'itens'
        pasta.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origem, pasta / destino)
        copiados[str(origem)] = f'itens/{destino}'
    return copiados[str(origem)]


def achar(*candidatos: str) -> Path | None:
    for c in candidatos:
        p = TEX / c
        if p.exists():
            return p
    return None


def resolver(nome: str) -> dict | None:
    """Textura de um item: item/ (plano), block/ (plano para sprites, cubo para blocos) ou substituto."""
    p = achar(f'item/{nome}.png')
    if p:
        return {'tipo': 'plano', 'img': copiar(p, f'{nome}.png')}
    if nome in SUBSTITUTOS:
        caminho, tipo = SUBSTITUTOS[nome]
        p = TEX / caminho
        if tipo == 'plano':
            return {'tipo': 'plano', 'img': copiar(p, f'sub_{p.name}')}
        nome = caminho.split('/')[-1][:-4]  # usa o bloco substituto como cubo
    base = achar(f'block/{nome}.png')
    if nome in PLANOS_BLOCO and base:
        return {'tipo': 'plano', 'img': copiar(base, f'b_{base.name}')}
    topo = achar(f'block/{nome}_top.png')
    if not base and not topo:
        return None

    def pega(*sufixos: str) -> Path:
        for s in sufixos:
            p = achar(f'block/{nome}{s}.png')
            if p:
                return p
        return base or topo

    t = topo or base
    esq = pega('_front', '_side')
    dir_ = pega('_side')
    return {
        'tipo': 'cubo',
        'topo': copiar(t, f'b_{t.name}'),
        'esq': copiar(esq, f'b_{esq.name}'),
        'dir': copiar(dir_, f'b_{dir_.name}'),
    }


def ler_inventario(obs: str) -> list[list] | None:
    """Itens do 'Inventário:' do texto da decisão, na ordem do log. None se a linha não existe."""
    for linha in obs.split('\n'):
        if not linha.startswith('Inventário:'):
            continue
        corpo = linha.split(':', 1)[1].strip().rstrip('.')
        if corpo == 'vazio':
            return []
        soma: dict[str, int] = {}
        for parte in corpo.split(','):
            m = re.match(r'\s*(\d+)\s+(\S+)\s*$', parte)
            if not m:
                print(f'  aviso: linha de inventário não lida: {parte!r}')
                continue
            soma[m.group(2)] = soma.get(m.group(2), 0) + int(m.group(1))
        return [[k, v] for k, v in soma.items()]
    return None


def comprimir(serie: list[tuple[float, object]]) -> list:
    """Guarda só as mudanças: [t, valor] em ordem de tempo."""
    saida: list = []
    for t, v in serie:
        if not saida or saida[-1][1] != v:
            saida.append([round(t, 2), v])
    return saida


def ler_jsonl(caminho: Path):
    with caminho.open(encoding='utf-8') as f:
        for linha in f:
            linha = linha.strip()
            if linha:
                yield json.loads(linha)


def gerar(nome: str) -> dict:
    # inventário: das decisões (texto 'Inventário:' do obs)
    inv_serie: list[tuple[float, object]] = [(0.0, [])]
    for d in ler_jsonl(GRAV / f'eventos_{nome}.jsonl'):
        if d.get('tipo') != 'decisao':
            continue
        itens = ler_inventario(d.get('obs', ''))
        if itens is not None:
            inv_serie.append((d['t'], itens))
    inv_serie.sort(key=lambda x: x[0])

    # mão, armadura, vida e fome: a cada ~0,25 s
    mao, arm, vida, fome = [], [], [], []
    for p in ler_jsonl(GRAV / f'posicoes_{nome}.jsonl'):
        t = p['t']
        mao.append((t, p.get('mao')))  # sem a chave 'mao' a mão está vazia
        arm.append((t, p.get('arm') or [None, None, None, None]))
        vida.append((t, p['v']))
        fome.append((t, p['f']))

    return {
        'nome': nome,
        'inv': comprimir(inv_serie),
        'mao': comprimir(mao),
        'arm': comprimir(arm),
        'vida': comprimir(vida),
        'fome': comprimir(fome),
    }


def main() -> None:
    (SAIDA / 'hud').mkdir(parents=True, exist_ok=True)
    (SAIDA / 'gui').mkdir(parents=True, exist_ok=True)

    for origem, destino in SPRITES.items():
        p = TEX / 'gui/sprites/hud' / origem
        if not p.exists():
            faltas.append(f'sprite do HUD: {origem}')
            continue
        shutil.copyfile(p, SAIDA / 'gui' / destino)
    shutil.copyfile(TEX / 'gui/container/inventory.png', SAIDA / 'gui/inventory.png')

    # nomes de itens usados em inventários e nas mãos
    nomes: set[str] = set()
    dados = {}
    for nome in IAS:
        d = gerar(nome)
        dados[nome] = d
        for _, itens in d['inv']:
            nomes.update(i for i, _ in itens)
        nomes.update(m for _, m in d['mao'] if m)
        for _, a in d['arm']:
            nomes.update(x for x in a if x)

    icones: dict[str, dict] = {}
    for nome in sorted(nomes):
        r = resolver(nome)
        if r is None:
            faltas.append(f'item sem textura: {nome}')
        else:
            icones[nome] = r
    (SAIDA / 'hud/itens.json').write_text(json.dumps(icones, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

    for nome, d in dados.items():
        (SAIDA / f'hud/{nome}.json').write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        tam = (SAIDA / f'hud/{nome}.json').stat().st_size
        print(f'{nome}: inv {len(d["inv"])}, mao {len(d["mao"])}, arm {len(d["arm"])}, vida {len(d["vida"])}, fome {len(d["fome"])} mudancas, {tam // 1024} KB')

    print(f'itens com textura: {len(icones)} de {len(nomes)}; arquivos em itens/: {len(copiados)}')
    if faltas:
        print('nao encontrado:')
        for f in faltas:
            print(f'  - {f}')


if __name__ == '__main__':
    main()
