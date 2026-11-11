#!/usr/bin/env python3
"""Ariadne: Dyna-Q + exploração de fronteiras. Só lê o jogo e aperta botões.

Uso: TEMPO_LIMITE_S=10800 python agente.py treinar
     python agente.py jogar

O limite é por invocação, em segundos de parede, incluindo inicialização e
checkpoint. Quatro processos, um núcleo por processo, sem Torch/GPU. Nenhuma
rota, coordenada de objetivo ou sequência de solução está embutida no agente.
"""
from __future__ import annotations

import os

# Antes de importar NumPy: cada trabalhador deve usar somente um núcleo BLAS.
for _var in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS",
             "VECLIB_MAXIMUM_THREADS", "NUMEXPR_NUM_THREADS"):
    os.environ[_var] = "1"

import argparse
import collections
import gzip
import hashlib
import heapq
import json
import math
import multiprocessing as mp
import pickle
import random
import signal
import struct
import sys
import time
import zlib
from dataclasses import dataclass
from pathlib import Path

BOOT_TIME = time.monotonic()

import numpy as np

BUTTONS = ("cima", "baixo", "esquerda", "direita", "A", "B", "START", "SELECT", "nada")
DELTA = ((0, -1), (0, 1), (-1, 0), (1, 0))
FINAL_FRAMES = 10_368_000
FORMAT = 3
CHECKPOINT = Path("checkpoint")
STOP = False


def stop_handler(*_):
    global STOP
    STOP = True


def digest(data, size=8):
    return hashlib.blake2b(data, digest_size=size).digest()


def atomic_save(path, obj):
    """CRC do gzip + rename atômico; o outro slot permanece intacto."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    try:
        with open(tmp, "wb") as raw:
            with gzip.GzipFile(fileobj=raw, mode="wb", compresslevel=1) as f:
                pickle.dump(obj, f, protocol=5)
            raw.flush()
            os.fsync(raw.fileno())
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()


def read_save(path):
    with gzip.open(path, "rb") as f:
        obj = pickle.load(f)
    if obj.get("format") != FORMAT:
        raise ValueError("versão de checkpoint incompatível")
    return obj


def latest_worker(worker, folder=CHECKPOINT):
    paths = sorted(Path(folder).glob(f"worker_{worker}.[01].pkl.gz"),
                   key=lambda p: p.stat().st_mtime_ns, reverse=True)
    for path in paths:
        try:
            return read_save(path)
        except (OSError, EOFError, ValueError, pickle.UnpicklingError, zlib.error) as exc:
            print(f"Checkpoint descartado: {path}: {exc}", file=sys.stderr, flush=True)
    return None


def read_ram(env, addr, size):
    try:
        data = bytes(env.ram(int(addr), int(size)))
        return data if len(data) == size else None
    except (ValueError, TypeError, RuntimeError, IndexError, OSError):
        return None


def pointer(addr):
    return 0x08000000 <= addr < 0x0A000000 or 0x02000000 <= addr < 0x02040000


class MemoryReader:
    """Layouts opcionais de FireRed USA. Validação antes de cada utilização.

    Não depende deles para funcionar. Nunca escreve RAM e não lê save externo.
    Se ROM/RAM não estiverem expostas nesse layout, usa info() + tela().
    """
    def __init__(self):
        self.cache = {}
        self.block_address = None

    def flags(self, env, info):
        self.block_address = None
        data = read_ram(env, 0x03005008, 4)  # gSaveBlock1Ptr, BPRE
        if not data:
            return b""
        addr, = struct.unpack("<I", data)
        if not 0x02000000 <= addr < 0x0203D000:
            return b""
        head = read_ram(env, addr, 6)
        if not head:
            return b""
        x, y, group, number = struct.unpack("<HHBB", head)
        if (x, y) != (info["x"], info["y"]) or (group, number) != tuple(info["mapa"]):
            return b""
        self.block_address = addr
        return read_ram(env, addr + 0xEE0, 0x120) or b""

    def keyitems(self, env):
        # IDs de itens-chave, sem quantidades criptografadas. Nenhum ID recebe
        # significado de missão: o hash apenas distingue inventários diferentes.
        if self.block_address is None:
            return b""
        data = read_ram(env, self.block_address + 0x3B8, 30 * 4)
        if data is None:
            return b""
        ids = np.frombuffer(data, dtype="<u2")[::2]
        if np.any(ids > 512):
            return b""
        return ids.tobytes()

    def layout(self, env, obs):
        key = obs.map
        if key in self.cache:
            return self.cache[key]
        raw = read_ram(env, 0x02036DFC, 16)  # gMapHeader, BPRE
        if not raw:
            return None
        layout, events, _, _ = struct.unpack("<IIII", raw)
        if not pointer(layout) or not pointer(events):
            return None
        data = read_ram(env, layout, 16)
        if not data:
            return None
        width, height, _, grid = struct.unpack("<IIII", data)
        if not (1 <= width <= 512 and 1 <= height <= 512 and width * height <= 65536
                and 0 <= obs.x < width and 0 <= obs.y < height and pointer(grid)):
            return None
        tiles = read_ram(env, grid, width * height * 2)
        ev = read_ram(env, events, 20)
        if tiles is None or ev is None:
            return None
        nc, nw, nt, nb, objects, warps, coords, backgrounds = struct.unpack("<BBBBIIII", ev)
        if nc > 64 or nw > 64 or nt > 64 or nb > 128:
            return None
        objects_out, warps_out = [], []
        if nw and pointer(warps):
            entries = read_ram(env, warps, nw * 8)
            if entries:
                for offset in range(0, len(entries), 8):
                    x, y = struct.unpack_from("<hh", entries, offset)
                    if 0 <= x < width and 0 <= y < height:
                        warps_out.append((x, y))
        if nc and pointer(objects):
            entries = read_ram(env, objects, nc * 24)
            if entries:
                for offset in range(0, len(entries), 24):
                    x, y = struct.unpack_from("<hh", entries, offset + 4)
                    flag, = struct.unpack_from("<H", entries, offset + 20)
                    if 0 <= x < width and 0 <= y < height:
                        objects_out.append((x, y, flag))
        if nb and pointer(backgrounds):
            entries = read_ram(env, backgrounds, nb * 12)
            if entries:
                for offset in range(0, len(entries), 12):
                    x, y = struct.unpack_from("<hh", entries, offset)
                    if 0 <= x < width and 0 <= y < height:
                        objects_out.append((x, y, 0))
        # Só um indício de colisão: transições observadas têm precedência.
        array = np.frombuffer(tiles, dtype="<u2").reshape(height, width).copy()
        result = (width, height, array, tuple(objects_out), tuple(warps_out))
        self.cache[key] = result
        return result

    def battle(self, env, party):
        data = read_ram(env, 0x02023BE4, 176)  # dois BattlePokemon
        if not data or not party:
            return ()
        mons = []
        for offset in (0, 88):
            species, = struct.unpack_from("<H", data, offset)
            hp, = struct.unpack_from("<H", data, offset + 40)
            level = data[offset + 42]
            maximum, = struct.unpack_from("<H", data, offset + 44)
            if not (1 <= species <= 439 and 1 <= level <= 100 and 1 <= maximum <= 1000
                    and 0 <= hp <= maximum):
                return ()
            moves = struct.unpack_from("<4H", data, offset + 12)
            if any(move > 354 for move in moves):
                return ()
            mons.append((species, hp, maximum, level, tuple(data[offset + 36:offset + 40])))
        if not any(mons[0][0] == p[0] and mons[0][2] == p[3] for p in party):
            return ()
        return tuple(mons)


@dataclass
class Observation:
    map: tuple
    x: int
    y: int
    badges: int
    battle: bool
    party: tuple
    money: int
    seen: int
    caught: int
    frame: int
    visual: bytes
    field_visual: bytes
    flags: bytes
    quest: bytes
    combat: tuple

    @property
    def pos(self):
        return self.map + (self.x, self.y)

    @property
    def levels(self):
        return sum(p[1] for p in self.party)

    @property
    def hp(self):
        return sum(p[2] for p in self.party) / max(1, sum(p[3] for p in self.party))

    def key(self):
        # Tela na batalha/diálogo; posição para transferir navegação entre telas.
        if self.battle:
            health = tuple((p[0], min(4, p[1] * 4 // max(1, p[2])),
                            tuple(int(pp > 0) for pp in p[4])) for p in self.combat)
            return (1, self.map, self.visual, health, self.badges)
        return (0, self.pos, self.quest, self.field_visual, len(self.party))


def observe(env, reader):
    info = env.info()
    def species(value):
        # A interface não exige espécie numérica; aceita nomes também.
        try:
            return int(value)
        except (ValueError, TypeError):
            return str(value)
    party = tuple((species(p["especie"]), int(p["nivel"]), int(p["hp"]), int(p["hp_max"]))
                  for p in info.get("time", []))
    screen = np.asarray(env.tela(), dtype=np.uint8)
    if screen.shape != (160, 240, 3):
        raise ValueError(f"tela() retornou {screen.shape}; esperado (160,240,3)")
    # 16x24 blocos. O arredondamento remove pequenas oscilações de animação.
    gray = screen.astype(np.uint16).sum(axis=2) // 3
    small = (gray.reshape(16, 10, 24, 10).mean(axis=(1, 3)) // 32).astype(np.uint8)
    # Não inclui a área de texto superior da batalha, que muda a cada ataque.
    visual = digest(small[10:].tobytes())
    field_visual = digest(small[11:].tobytes(), 4)
    flags = reader.flags(env, info) if not info["em_batalha"] else b""
    items = reader.keyitems(env) if flags else b""
    map_ = tuple(int(v) for v in info["mapa"])
    quest = digest(flags + items, 6) if flags else bytes([int(info["insignias"]), len(party)])
    return Observation(map_, int(info["x"]), int(info["y"]), int(info["insignias"]),
                       bool(info["em_batalha"]), party, int(info.get("dinheiro", 0)),
                       int(info.get("pokedex_vistos", 0)), int(info.get("pokedex_capturados", 0)),
                       int(env.quadro), visual, field_visual, flags, quest,
                       reader.battle(env, party) if info["em_batalha"] else ())


class Learner:
    """Double Q-learning e replay Dyna de transições realmente observadas.

    Q tabular esparso: nenhuma rede neural. Cada estado guarda duas tabelas,
    contagens e uma média de recompensa por ação para ordenação de replay.
    Modelo amostrado, evitando supor que NPCs/batalhas sejam determinísticos.
    """
    def __init__(self, seed=0):
        self.q = {}
        self.count = {}
        self.replay = []
        self.cursor = 0
        self.updates = 0
        self.rng = np.random.default_rng(seed)
        self.limit = 100_000

    def row(self, state):
        row = self.q.get(state)
        if row is None:
            if len(self.q) >= self.limit:
                return None
            row = np.zeros((2, len(BUTTONS)), dtype=np.float32)
            self.q[state] = row
            self.count[state] = np.zeros(len(BUTTONS), dtype=np.uint32)
        return row

    def values(self, state):
        row = self.q.get(state)
        return row.mean(axis=0) if row is not None else np.zeros(9, dtype=np.float32)

    def backup(self, s, a, r, t, terminal=False):
        row = self.row(s)
        if row is None:
            return
        side = int(self.rng.integers(2))
        nxt = self.q.get(t)
        target = float(r)
        if nxt is not None and not terminal:
            target += 0.97 * float(nxt[1 - side, int(np.argmax(nxt[side]))])
        n = int(self.count[s][a])
        alpha = max(0.06, 0.5 / (1 + n * 0.02) ** 0.5)
        row[side, a] += alpha * np.clip(target - row[side, a], -2000, 2000)
        self.updates += 1

    def learn(self, s, a, r, t, terminal=False):
        self.row(t)
        self.row(s)
        if s in self.count:
            self.count[s][a] += 1
        self.backup(s, a, r, t, terminal)
        item = (s, a, float(r), t, terminal)
        if len(self.replay) < 40_000:
            self.replay.append(item)
        else:
            self.replay[self.cursor] = item
            self.cursor = (self.cursor + 1) % 40_000
        # Amplifica marcos raros sem reproduzir centenas de milhares de frames.
        if abs(r) >= 8:
            for _ in range(4):
                self.backup(*item)
        if len(self.replay) > 16:
            for index in self.rng.integers(0, len(self.replay), size=4):
                self.backup(*self.replay[int(index)])


class World:
    """Grafo dirigido e contagens. Nada conhece nomes ou destinos dos mapas."""
    def __init__(self):
        self.edges = {}             # origem -> botão -> destino observado
        self.tries = collections.Counter()
        self.visits = collections.Counter()
        self.interactions = collections.Counter()
        self.failures = collections.Counter()
        self.heals = {}
        self.maps = set()
        self.tiles = set()
        self.bits = set()
        self.quests = set()
        self.visuals = collections.Counter()
        self.max_badges = 0
        self.max_levels = 0
        self.max_caught = 0
        self.last_progress = 0
        self.steps = 0
        self.max_nodes = 150_000

    def score(self):
        return (self.max_badges, len(self.maps), self.max_levels, self.max_caught)

    def seed(self, obs):
        self.maps.add(obs.map)
        self.tiles.add(obs.pos)
        self.visits[obs.pos] += 1
        self.max_badges = max(self.max_badges, obs.badges)
        self.max_levels = max(self.max_levels, obs.levels)
        self.max_caught = max(self.max_caught, obs.caught)
        self.quests.add(obs.quest)
        # Flags anteriores ao início não são conquistas deste agente.
        for byte_i, value in enumerate(obs.flags):
            for bit_i in range(8):
                if value & (1 << bit_i):
                    self.bits.add(byte_i * 8 + bit_i)

    def update(self, old, action, new):
        self.steps += 1
        reward = -0.008
        new_map = new.map not in self.maps
        new_tile = new.pos not in self.tiles
        self.maps.add(new.map)
        if len(self.tiles) < self.max_nodes:
            self.tiles.add(new.pos)
            self.visits[new.pos] += 1
        if new_map:
            reward += 60
        if new_tile and not new.battle:
            reward += 0.6
        if old.pos != new.pos and not old.battle and not new.battle:
            if len(self.edges) < self.max_nodes:
                self.edges.setdefault(old.pos, {})[action] = new.pos
            self.tries[(old.pos, old.quest, action)] += 1
            self.failures[(old.pos, old.quest, action)] = 0
        elif not old.battle and not new.battle:
            # Diálogos não tornam uma parede permanentemente intransponível.
            self.tries[(old.pos, old.quest, action)] += 1
            self.failures[(old.pos, old.quest, action)] += 1
            if action < 4:
                reward -= 0.025
        if action == 4 and not old.battle:
            self.interactions[(old.pos, old.quest)] += 1
        badge_gain = max(0, new.badges - self.max_badges)
        level_gain = max(0, new.levels - self.max_levels)
        caught_gain = max(0, new.caught - self.max_caught)
        reward += 1000 * badge_gain + 8 * level_gain + 12 * caught_gain
        self.max_badges = max(self.max_badges, new.badges)
        self.max_levels = max(self.max_levels, new.levels)
        self.max_caught = max(self.max_caught, new.caught)
        fresh_bits = 0
        fresh_quest = False
        if not new.battle and new.quest not in self.quests and len(self.quests) < 4096:
            self.quests.add(new.quest)
            fresh_quest = True
            reward += 0.5
        if new.flags:
            for byte_i, value in enumerate(new.flags):
                if value:
                    for bit_i in range(8):
                        ident = byte_i * 8 + bit_i
                        if value & (1 << bit_i) and ident not in self.bits:
                            self.bits.add(ident)
                            fresh_bits += 1
            reward += min(8, fresh_bits) * 1.5
        if old.battle and new.battle and old.combat and new.combat:
            if old.combat[1][0] == new.combat[1][0]:
                reward += 0.8 * max(0, old.combat[1][1] - new.combat[1][1]) / max(1, old.combat[1][2])
        wiped = bool(old.party and any(p[2] > 0 for p in old.party)
                     and new.party and all(p[2] == 0 for p in new.party))
        if wiped:
            reward -= 20
        if old.battle and not new.battle and new.hp <= 0:
            reward -= 5
        # Sair de batalha não é vitória: poderia ter sido uma fuga. Não paga
        # recompensa por fugir e reentrar na mesma grama indefinidamente.
        if old.battle and new.battle:
            reward -= 0.2 * max(0, old.hp - new.hp)
        if (not old.battle and not new.battle and old.pos == new.pos
                and old.levels == new.levels and new.hp - old.hp > 0.25):
            if old.pos not in self.heals:
                reward += 3
            self.heals[old.pos] = action
            self.failures[(old.pos, old.quest, action)] = 0
        # Novidade visual local tem teto e não remunera animações infinitamente.
        visual_key = (new.map, new.pos, new.visual)
        if len(self.visuals) < 60_000:
            if self.visuals[visual_key] == 0:
                reward += 0.025
            self.visuals[visual_key] += 1
        milestone = new_map or badge_gain or level_gain or caught_gain or fresh_bits or fresh_quest
        if milestone or new_tile:
            self.last_progress = self.steps
        return reward, bool(milestone), wiped


class Navigator:
    def __init__(self, seed=0):
        self.rng = random.Random(seed)
        self.goal = None
        self.path = []
        self.remaining = 0
        self.still = 0
        self.facing = 1
        self.last_pos = None
        self.last_quest = None
        self.interact_budget = 0
        self.explain = "Explorar uma fronteira ainda pouco visitada."

    def update(self, old, a, new):
        if a < 4:
            self.facing = a
        self.still = self.still + 1 if old.pos == new.pos and not new.battle else 0
        if old.quest != new.quest or old.map != new.map:
            self.path.clear()
            self.remaining = 0
        if old.pos != new.pos:
            self.interact_budget = 0

    def local_goals(self, pos, obs, world, layout, recent):
        """(valor, botão, tipo) de possibilidades locais, inclusive sem layout."""
        if pos[:2] != obs.map:
            layout = None
        x, y = pos[2:]
        goals = []
        edges = world.edges.get(pos, {})
        for action, (dx, dy) in enumerate(DELTA):
            attempts = world.tries[(pos, obs.quest, action)]
            if action in edges:
                continue
            if attempts >= 5:
                continue
            value = 4.5 / (1 + attempts) ** 1.4
            if layout:
                w, h, tiles, objects, warps = layout
                nx, ny = x + dx, y + dy
                if not (0 <= nx < w and 0 <= ny < h):
                    value *= 0.1
                else:
                    collision = (int(tiles[ny, nx]) >> 10) & 3
                    if collision:
                        value *= 0.18
                    if (nx, ny) in warps:
                        value += 7 / (1 + attempts)
            goals.append((value, action, "passagem"))
        count = world.interactions[(pos, obs.quest)]
        if count < 4:
            value = 1.4 / (1 + count) ** 1.8
            if layout:
                _, _, _, objects, warps = layout
                for ox, oy, flag in objects:
                    hidden = (flag > 0 and flag // 8 < len(obs.flags)
                              and obs.flags[flag // 8] & (1 << (flag % 8)))
                    if abs(ox - x) + abs(oy - y) == 1 and not hidden:
                        value += 7 / (1 + count) ** 1.8
                        break
                if (x, y) in warps:
                    value += 2 / (1 + count)
            goals.append((value, 4, "interação"))
        penalty = 1 + 0.15 * recent.get(pos, 0)
        if (obs.party and 0 < obs.hp < 0.45 and pos in world.heals
                and world.failures[(pos, obs.quest, world.heals[pos])] < 16):
            goals.append((25 * (1 - obs.hp), world.heals[pos], "recuperação"))
        return [(value / penalty, action, kind) for value, action, kind in goals]

    def plan(self, obs, world, layout, recent):
        start = obs.pos
        queue = collections.deque([start])
        paths = {start: (None, None, 0)}
        best = None
        # Só percorre arestas que foram realmente atravessadas; não atravessa
        # paredes por pressuposição sobre tiles ou portas.
        while queue and len(paths) < 2200:
            pos = queue.popleft()
            distance = paths[pos][2]
            for value, action, kind in self.local_goals(pos, obs, world, layout, recent):
                utility = value / (1 + distance * 0.12)
                utility *= self.rng.uniform(0.92, 1.08)
                if best is None or utility > best[0]:
                    best = (utility, pos, action, kind)
            if distance >= 100:
                continue
            for action, nxt in world.edges.get(pos, {}).items():
                if nxt not in paths and world.failures[(pos, obs.quest, action)] < 3:
                    paths[nxt] = (pos, action, distance + 1)
                    queue.append(nxt)
        if best is None:
            return []
        _, pos, final_action, kind = best
        result = [(pos, final_action)]
        self.goal = (pos, kind)
        while pos != start:
            prev, action, _ = paths[pos]
            result.append((prev, action))
            pos = prev
        result.reverse()
        return result

    def choose(self, obs, world, learner, layout, recent, profile):
        state = obs.key()
        values = learner.values(state).astype(float)
        counts = learner.count.get(state, np.zeros(9))
        total = float(counts.sum())
        # Valores normalizados: recompensas de insígnia não congelam a política
        # numa única ação. UCB mantém ações pouco tentadas acessíveis.
        scale = max(1.0, float(np.max(np.abs(values))))
        utility = values / scale
        utility += 0.30 * np.sqrt(math.log(total + 2) / (counts.astype(float) + 1))
        epsilon = 0.05 + 0.11 / math.sqrt(1 + total / 25)
        if obs.battle:
            self.explain = "Escolher uma ação de batalha que aumente dano e progresso."
            weights = np.array([0.07, 0.07, 0.07, 0.07, 0.65, 0.035, 0.002, 0.001, 0.008])
            if self.rng.random() < epsilon:
                return self.rng.choices(range(9), weights=weights, k=1)[0]
            utility += np.array([0, 0, 0, 0, 0.22, -0.22, -1.8, -2, -0.5])
            # Texto/animação pode manter a mesma tela: não martelar eternamente
            # uma escolha ineficaz. A contagem participa dessa decisão.
            if total > 30:
                utility -= 0.2 * np.log1p(counts / 10)
            return int(np.argmax(utility + np.array([self.rng.random() * 0.04 for _ in range(9)])))
        if self.still >= 2 and self.still % 11 < 7:
            self.explain = "Investigar um diálogo, menu ou obstáculo que interrompeu o movimento."
            weights = [0.065, 0.065, 0.065, 0.065, 0.58, 0.13, 0.018, 0.002, 0.01]
            utility += np.array([0, 0, 0, 0, 0.35, -0.03, -0.6, -1.5, -0.5])
            if self.rng.random() < max(0.25, epsilon):
                return self.rng.choices(range(9), weights=weights, k=1)[0]
            return int(np.argmax(utility + np.array([self.rng.random() * 0.08 for _ in range(9)])))
        if not self.path or self.path[0][0] != obs.pos or self.remaining <= 0:
            self.path = self.plan(obs, world, layout, recent)
            self.remaining = 40
        if self.path:
            pos, action = self.path.pop(0)
            self.remaining -= 1
            if action == 4 and layout:
                # Orientação decidida pela posição de um objeto lido no mapa,
                # nunca por coordenadas fixas de uma solução.
                for x, y, flag in layout[3]:
                    delta = (x - obs.x, y - obs.y)
                    if delta in DELTA:
                        face = DELTA.index(delta)
                        if self.facing != face:
                            self.path.insert(0, (pos, action))
                            return face
                        break
            self.explain = "Explorar uma passagem descoberta." if action < 4 else "Testar uma interação ainda pouco explorada."
            # O grafo é o modelo de navegação; Q desempata exploração local.
            if len(self.path) < 1 and action < 4 and self.rng.random() < epsilon * (0.3 + 0.1 * profile):
                return self.rng.randrange(5)
            return action
        self.explain = "Sair de uma região esgotada e procurar novas interações."
        # Fallback persistente também cobre menus quando o layout não existe.
        if self.still > 60:
            return self.rng.choices(range(9), [12, 12, 12, 12, 25, 15, 8, 1, 3])[0]
        candidates = []
        for action in range(5):
            n = world.tries[(obs.pos, obs.quest, action)]
            candidates.append((utility[action] + 1 / math.sqrt(n + 1) + self.rng.random() * 0.5, action))
        return max(candidates)[1]


class EventLogger:
    def __init__(self, path="log.jsonl"):
        self.file = open(path, "w", encoding="utf-8", buffering=1)
        self.maps = set()
        self.levels = {}
        self.wipe_latched = False

    def emit(self, obs, event, intent, **fields):
        record = {"quadro": obs.frame, "evento": event, "mapa": list(obs.map),
                  "x": obs.x, "y": obs.y, "intencao": intent}
        record.update(fields)
        self.file.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")

    def update(self, old, new, intent):
        if new.map not in self.maps:
            self.maps.add(new.map)
            self.emit(new, "mapa_novo", intent)
        if old is None:
            self.levels = self.party_levels(new)
            return
        if new.battle != old.battle:
            self.emit(new, "batalha_comecou" if new.battle else "batalha_terminou", intent)
        if new.caught > old.caught:
            self.emit(new, "captura", intent, total=new.caught, quantidade=new.caught - old.caught)
        if new.badges > old.badges:
            self.emit(new, "insignia", intent, total=new.badges)
        current = self.party_levels(new)
        for species, levels in current.items():
            previous = self.levels.get(species, [])
            # Ordenação por espécie evita contar trocas de slot como level-up.
            for before, after in zip(previous, levels):
                if after > before:
                    self.emit(new, "subiu_de_nivel", intent, especie=species, antes=before, nivel=after)
        self.levels = current
        wiped = bool(new.party and all(p[2] == 0 for p in new.party))
        # Algumas wrappers só expõem a equipe já curada após o blackout.
        inferred = bool(old.battle and not new.battle and old.party and old.hp < 0.30
                        and old.map != new.map and new.money < old.money)
        if (wiped or inferred) and not self.wipe_latched:
            self.emit(new, "time_desmaiou", intent, inferido=bool(inferred and not wiped))
        self.wipe_latched = wiped

    @staticmethod
    def party_levels(obs):
        result = collections.defaultdict(list)
        for species, level, _, _ in obs.party:
            result[species].append(level)
        return {s: sorted(levels, reverse=True) for s, levels in result.items()}

    def close(self):
        self.file.flush()
        self.file.close()


class Agent:
    def __init__(self, seed=0, profile=0):
        self.learner = Learner(seed)
        self.world = World()
        self.nav = Navigator(seed)
        self.reader = MemoryReader()
        self.profile = profile
        self.recent = collections.Counter()
        self.recent_queue = collections.deque()
        self.prev_button = None
        self.prev_moved = True
        self.actions = 0
        self.frames = 0
        self.archive = []
        self.archive_keys = set()
        self.episode_start = 0
        self.last_snapshot = -1000

    def choose(self, env, obs):
        layout = self.reader.layout(env, obs) if not obs.battle else None
        return self.nav.choose(obs, self.world, self.learner, layout, self.recent, self.profile)

    def act(self, env, action, remaining=None):
        """Releases necessários a JOY_NEW; todas as chamadas contam no limite."""
        button = BUTTONS[action]
        used = 0
        if button == self.prev_button and (action >= 4 or not self.prev_moved):
            if remaining is None or remaining >= 48:
                before = int(env.quadro)
                env.step("nada")
                used += max(24, int(env.quadro) - before)
        if remaining is not None and remaining - used < 24:
            return used
        before = int(env.quadro)
        env.step(button)
        used += max(24, int(env.quadro) - before)
        self.prev_button = button
        self.frames += used
        return used

    def update(self, old, action, new, learn=True):
        self.actions += 1
        reward, milestone, wipe = self.world.update(old, action, new)
        self.nav.update(old, action, new)
        self.prev_moved = old.pos != new.pos
        self.recent[new.pos] += 1
        self.recent_queue.append(new.pos)
        if len(self.recent_queue) > 160:
            pos = self.recent_queue.popleft()
            self.recent[pos] -= 1
            if not self.recent[pos]:
                del self.recent[pos]
        if learn:
            self.learner.learn(old.key(), action, reward, new.key(), wipe)
        return milestone, wipe

    def remember(self, env, obs, force=False):
        if obs.battle or (not force and self.actions - self.last_snapshot < 250):
            return
        key = (obs.map, obs.quest, obs.badges, obs.levels, obs.caught)
        if key in self.archive_keys and not force:
            return
        state = zlib.compress(bytes(env.salvar_estado()), 1)
        self.last_snapshot = self.actions
        self.archive_keys.add(key)
        score = (obs.badges, len(self.world.maps), obs.levels, obs.caught)
        self.archive.append({"state": state, "key": key, "score": score, "uses": 0})
        if len(self.archive) > 12:
            # Preserva o início + o melhor estado; retém diversidade recente.
            best = max(range(len(self.archive)), key=lambda i: self.archive[i]["score"])
            remove = next(i for i in range(1, len(self.archive)) if i != best)
            self.archive.pop(remove)

    def restart_episode(self, env):
        if self.archive and self.nav.rng.random() < 0.85:
            scores = sorted({item["score"] for item in self.archive})
            weights = [(1 + scores.index(item["score"])) / math.sqrt(1 + item["uses"])
                       for item in self.archive]
            item = self.nav.rng.choices(self.archive, weights=weights)[0]
            env.carregar_estado(zlib.decompress(item["state"]))
            item["uses"] += 1
        else:
            env.reset()
        self.nav = Navigator(self.nav.rng.randrange(2**32))
        self.recent.clear()
        self.recent_queue.clear()
        self.prev_button = None
        self.prev_moved = True
        self.episode_start = self.actions
        self.world.last_progress = self.world.steps
        return observe(env, self.reader)

    def policy(self):
        # Sem estados de emulador nem arquivo de episódios no artefato final.
        return {"learner": self.learner, "world": self.world, "profile": self.profile}


def make_env():
    from ambiente_firered import FireRed
    return FireRed()


def close_env(env):
    close = getattr(env, "close", None)
    if callable(close):
        close()


def worker_main(worker, deadline, stop, folder):
    global CHECKPOINT
    CHECKPOINT = Path(folder)
    signal.signal(signal.SIGTERM, stop_handler)
    signal.signal(signal.SIGINT, stop_handler)
    env = None
    agent = None
    generation = 0
    started = time.monotonic()
    used_time = 0.0
    last_save = started

    def save():
        nonlocal generation, last_save
        if agent is None or env is None:
            return
        generation += 1
        payload = {"format": FORMAT, "generation": generation, "worker": worker,
                   "agent": agent, "emulator": bytes(env.salvar_estado()),
                   "seconds": used_time + time.monotonic() - started,
                   "score": agent.world.score()}
        atomic_save(CHECKPOINT / f"worker_{worker}.{generation % 2}.pkl.gz", payload)
        # Artefato leve, com duas gerações, para jogar sem ler save states.
        atomic_save(CHECKPOINT / f"policy_{worker}.{generation % 2}.pkl.gz",
                    {"format": FORMAT, "generation": generation, "score": agent.world.score(),
                     "policy": agent.policy(), "actions": agent.actions})
        last_save = time.monotonic()

    try:
        saved = latest_worker(worker, CHECKPOINT)
        env = make_env()
        if saved is not None:
            agent = saved["agent"]
            generation = saved["generation"]
            used_time = saved.get("seconds", 0.0)
            env.carregar_estado(saved["emulator"])
            del saved
        else:
            agent = Agent(1729 + worker * 997, worker)
            env.reset()
        obs = observe(env, agent.reader)
        agent.world.seed(obs)
        if not agent.archive:
            agent.remember(env, obs, force=True)
        # Primeiro snapshot antes de começar; protege blocos muito curtos.
        save()
        next_report = time.monotonic() + 45
        while not STOP and not stop.is_set() and time.monotonic() < deadline:
            a = agent.choose(env, obs)
            agent.act(env, a)
            new = observe(env, agent.reader)
            milestone, wipe = agent.update(obs, a, new)
            obs = new
            if milestone:
                agent.remember(env, obs)
            stalled = agent.world.steps - agent.world.last_progress
            episode = agent.actions - agent.episode_start
            # Só no treino: Go-Explore com estados produzidos por este agente.
            if ((stalled > 1600 + worker * 200 or episode > 18000) and not obs.battle
                    or stalled > 4000 + worker * 200):
                obs = agent.restart_episode(env)
            now = time.monotonic()
            if now - last_save >= 45:
                save()
            if now >= next_report:
                print(json.dumps({"worker": worker, "acoes": agent.actions,
                                  "placar": agent.world.score(), "estados_Q": len(agent.learner.q)},
                                 ensure_ascii=False), flush=True)
                next_report = now + 45
    except BaseException as exc:
        if not isinstance(exc, (KeyboardInterrupt, SystemExit)):
            import traceback
            traceback.print_exc()
        raise
    finally:
        if agent is not None and env is not None:
            try:
                save()
            except Exception:
                import traceback
                traceback.print_exc()
        if env is not None:
            close_env(env)


def load_policies(folder=CHECKPOINT):
    policies = []
    for worker in range(4):
        paths = sorted(Path(folder).glob(f"policy_{worker}.[01].pkl.gz"),
                       key=lambda p: p.stat().st_mtime_ns, reverse=True)
        for path in paths:
            try:
                policies.append(read_save(path))
                break
            except (OSError, EOFError, ValueError, pickle.UnpicklingError, zlib.error) as exc:
                print(f"Política descartada: {path}: {exc}", file=sys.stderr)
    return policies


def combine_policies(policies):
    """Ensemble por contagens de visitas, sem precisar concatenar episódios."""
    best = max(policies, key=lambda p: (tuple(p["score"]), p.get("actions", 0)))
    agent = Agent(20261111, best["policy"]["profile"])
    agent.world = best["policy"]["world"]
    agent.learner = best["policy"]["learner"]
    # Outros trabalhadores ensinam transições físicas e ações já testadas.
    for payload in policies:
        if payload is best:
            continue
        other = payload["policy"]
        agent.world.heals.update(other["world"].heals)
        for pos, edges in other["world"].edges.items():
            agent.world.edges.setdefault(pos, {}).update(
                {a: nxt for a, nxt in edges.items() if a not in agent.world.edges.get(pos, {})})
        for s, row in other["learner"].q.items():
            n = other["learner"].count[s]
            current = agent.learner.q.get(s)
            if current is None:
                if len(agent.learner.q) < agent.learner.limit:
                    agent.learner.q[s] = row.copy()
                    agent.learner.count[s] = n.copy()
                continue
            old_n = agent.learner.count[s]
            denominator = np.maximum(1, old_n.astype(float) + n)
            agent.learner.q[s] = ((current * old_n + row * n) / denominator).astype(np.float32)
            agent.learner.count[s] = np.minimum(old_n.astype(np.uint64) + n, 2**32 - 1).astype(np.uint32)
    # Estatísticas do treino informam o plano; a recompensa/visitas da partida
    # começam vazias. As tentativas são decaídas para retentar bloqueios antigos.
    agent.world.tries = collections.Counter({k: min(2, v) for k, v in agent.world.tries.items()})
    agent.world.interactions = collections.Counter({k: min(1, v) for k, v in agent.world.interactions.items()})
    agent.world.failures.clear()
    agent.world.maps.clear()
    agent.world.tiles.clear()
    agent.world.visits.clear()
    agent.world.bits.clear()
    agent.world.quests.clear()
    agent.world.visuals.clear()
    agent.world.max_badges = agent.world.max_levels = agent.world.max_caught = 0
    agent.world.steps = agent.world.last_progress = 0
    agent.learner.replay.clear()
    return agent


def train(seconds, workers, start_time=None):
    if not math.isfinite(seconds) or seconds <= 0:
        raise ValueError("TEMPO_LIMITE_S precisa ser um número positivo e finito")
    CHECKPOINT.mkdir(parents=True, exist_ok=True)
    start = time.monotonic() if start_time is None else start_time
    # Reserva tempo para compressão/fsync e shutdown; conta todo o bloco.
    reserve = min(20.0, max(0.5, seconds * 0.10))
    work_deadline = start + max(0, seconds - reserve)
    ctx = mp.get_context("spawn")
    stop = ctx.Event()
    children = []
    for worker in range(workers):
        process = ctx.Process(target=worker_main,
                              args=(worker, work_deadline, stop, str(CHECKPOINT.resolve())))
        process.start()
        children.append(process)
    try:
        while any(p.is_alive() for p in children):
            if STOP or time.monotonic() >= work_deadline:
                stop.set()
                break
            for process in children:
                process.join(timeout=0.05)
    finally:
        stop.set()
        for process in children:
            process.join(timeout=max(0, start + seconds - 0.25 - time.monotonic()))
        for process in children:
            if process.is_alive():
                # SIGTERM pede snapshot. O slot anterior já está no disco.
                process.terminate()
        for process in children:
            if process.is_alive():
                process.join(timeout=max(0, start + seconds - time.monotonic()))
            if process.is_alive():
                process.kill()
        for process in children:
            process.join(timeout=0.05)
    failures = [p.exitcode for p in children if p.exitcode not in (0, None)]
    print(json.dumps({"modo": "treinar", "segundos": round(time.monotonic() - start, 3),
                      "workers": workers, "falhas": failures}, ensure_ascii=False), flush=True)
    if failures and len(failures) == workers:
        raise RuntimeError("Nenhum trabalhador concluiu. Consulte os erros acima; checkpoints anteriores foram preservados.")


def play(frame_limit=FINAL_FRAMES):
    policies = load_policies()
    if not policies:
        print("Sem checkpoint válido: exploração inicial sem treinamento.", file=sys.stderr)
        agent = Agent(20261111)
    else:
        agent = combine_policies(policies)
    # Não há carregar_estado neste modo: uma única trajetória desde reset().
    env = make_env()
    logger = EventLogger()
    played = 0
    try:
        env.reset()
        obs = observe(env, agent.reader)
        agent.world.seed(obs)
        logger.update(None, obs, "Começar uma única partida desde o quarto inicial.")
        logger.emit(obs, "inicio", "Explorar usando o aprendizado acumulado.",
                    checkpoint=bool(policies), limite_quadros=frame_limit)
        next_heartbeat = 216_000
        while played + 24 <= frame_limit and not STOP:
            action = agent.choose(env, obs)
            intent = agent.nav.explain
            used = agent.act(env, action, remaining=frame_limit - played)
            if not used:
                break
            played += used
            new = observe(env, agent.reader)
            agent.update(obs, action, new, learn=True)
            logger.update(obs, new, intent)
            obs = new
            if played >= next_heartbeat:
                logger.emit(obs, "andamento", intent, quadros_jogados=played,
                            placar=[obs.badges, len(logger.maps), obs.levels, obs.caught])
                next_heartbeat += 216_000
        logger.emit(obs, "fim", "Encerrar no limite de quadros ou no sinal de parada.",
                    quadros_jogados=played,
                    placar=[obs.badges, len(logger.maps), obs.levels, obs.caught])
    finally:
        logger.close()
        close_env(env)


def main(start_time=None):
    global CHECKPOINT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("modo", choices=("treinar", "jogar"))
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=4)
    parser.add_argument("--checkpoint", type=Path, default=Path("checkpoint"))
    args = parser.parse_args()
    CHECKPOINT = args.checkpoint
    signal.signal(signal.SIGINT, stop_handler)
    signal.signal(signal.SIGTERM, stop_handler)
    if args.modo == "treinar":
        train(float(os.environ.get("TEMPO_LIMITE_S", "10800")), args.workers, start_time=start_time)
    else:
        play()


if __name__ == "__main__":
    # Processos spawn precisam encontrar as classes pelo nome importável;
    # nunca serializar classes como __main__.Agent em arquivos de checkpoint.
    import agente as module
    module.main(start_time=BOOT_TIME)
