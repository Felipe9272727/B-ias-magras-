"""Simulador de contrato para testes; não é um emulador nem mede habilidade."""
import os
import pickle
import struct

import numpy as np


class FireRed:
    def __init__(self):
        self.reset()

    @classmethod
    def copias(cls, n):
        return [cls() for _ in range(n)]

    def reset(self):
        if os.environ.get("FORBID_LOAD_STATE") and getattr(self, "quadro", 0) > 0:
            raise AssertionError("reset() depois de jogar proibido na partida final")
        self.quadro = 0
        self.x = 2
        self.y = 2
        self.map = (1, 0)
        self.battle = False
        self.badges = 0
        self.level = 5
        self.hp = 20
        self.caught = 1
        self.money = 1000
        self.dialog = 0
        self.foe = 20
        self.cursor = 0
        self.flags = 0
        self.key_item = 0
        self.prev = "nada"
        self.battle_done = False
        self.startup_pid = os.getpid()

    def step(self, button):
        assert button in ("cima", "baixo", "esquerda", "direita", "A", "B", "START", "SELECT", "nada")
        self.quadro += 24
        fresh = button != self.prev
        self.prev = button
        if self.battle:
            if button in ("cima", "baixo", "esquerda", "direita") and fresh:
                self.cursor = (self.cursor + 1) % 4
            if button == "A" and fresh:
                self.foe -= 5 if self.cursor != 3 else 0
                if self.foe <= 0:
                    self.battle = False
                    self.battle_done = True
                    self.level += 1
                    self.caught += 1
                    self.badges += 1
                    self.flags |= 2
            return
        if self.dialog:
            if button == "A" and fresh:
                self.dialog -= 1
                if not self.dialog:
                    self.flags |= 1
            return
        directions = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}
        if button in directions:
            dx, dy = directions[button]
            nx, ny = self.x + dx, self.y + dy
            if 1 <= nx <= 6 and 1 <= ny <= 6 and (nx, ny) != (4, 3):
                self.x, self.y = nx, ny
                if (nx, ny) == (6, 6):
                    self.map = (1, 1 - self.map[1])
                    self.x, self.y = 1, 1
                elif (nx, ny) == (3, 3) and not self.battle_done and self.map == (1, 1):
                    self.battle = True
        if button == "A" and fresh and abs(self.x - 4) + abs(self.y - 3) == 1 and not self.flags & 1:
            self.dialog = 2

    def info(self):
        return {"mapa": self.map, "x": self.x, "y": self.y, "insignias": self.badges,
                "em_batalha": self.battle,
                "time": [{"especie": 1, "nivel": self.level, "hp": self.hp, "hp_max": 20}],
                "dinheiro": self.money, "pokedex_vistos": self.caught, "pokedex_capturados": self.caught}

    def tela(self):
        screen = np.full((160, 240, 3), 80 + self.map[1] * 40, np.uint8)
        screen[self.y * 10:self.y * 10 + 8, self.x * 10:self.x * 10 + 8] = 255
        if self.battle or self.dialog:
            screen[100:] = 240
            screen[110:120, self.cursor * 40:self.cursor * 40 + 12] = 0
            if self.dialog:
                screen[130:140, 10:10 + self.dialog * 30] = 0
        return screen

    def ram(self, addr, size):
        segments = {
            0x03005008: struct.pack("<I", 0x02001000),
            0x02001000: struct.pack("<HHBB", self.x, self.y, *self.map),
            0x02001EE0: bytes([self.flags]) + bytes(287),
            0x020013B8: struct.pack("<HH", self.key_item, 1) + bytes(116),
            0x02036DFC: struct.pack("<IIII", 0x08000100, 0x08000200, 0, 0),
            0x08000100: struct.pack("<IIII", 8, 8, 0, 0x08001000),
            0x08000200: struct.pack("<BBBBIIII", 1, 1, 0, 0, 0x08000300, 0x08000400, 0, 0),
            0x08000300: struct.pack("<BBBBhhBBBBHHIHxx", 1, 0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 1),
            0x08000400: struct.pack("<hhBBBB", 6, 6, 0, 0, 1 - self.map[1], 1),
        }
        grid = np.zeros((8, 8), dtype="<u2")
        grid[0, :] = grid[7, :] = grid[:, 0] = grid[:, 7] = 0x400
        grid[3, 4] = 0x400
        segments[0x08001000] = grid.tobytes()
        if self.battle:
            combat = bytearray(176)
            for offset, species, hp in ((0, 1, self.hp), (88, 4, self.foe)):
                struct.pack_into("<H", combat, offset, species)
                struct.pack_into("<4H", combat, offset + 12, 33, 45, 0, 0)
                combat[offset + 36:offset + 40] = bytes([20, 20, 0, 0])
                struct.pack_into("<H", combat, offset + 40, max(0, hp))
                combat[offset + 42] = self.level
                struct.pack_into("<H", combat, offset + 44, 20)
            segments[0x02023BE4] = bytes(combat)
        for start, data in segments.items():
            if start <= addr and addr + size <= start + len(data):
                return data[addr - start:addr - start + size]
        return bytes(size)

    def salvar_estado(self):
        return pickle.dumps(self.__dict__, protocol=5)

    def carregar_estado(self, state):
        if os.environ.get("FORBID_LOAD_STATE"):
            raise AssertionError("carregar_estado() proibido na partida final")
        self.__dict__.update(pickle.loads(state))

    def close(self):
        pass
