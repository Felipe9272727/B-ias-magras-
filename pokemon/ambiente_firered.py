"""Ambiente do Pokémon FireRed (GBA, USA 1.0) para a competição "3 IAs criaram as próprias IAs".
Igual para as três IAs. Emulador: mGBA 0.10 (bindings Python), sem tela, o mais rápido que a CPU deixar.
A ROM NÃO fica no repositório: caminho em POKEMON_ROM (padrão: pokemon/rom/pokemon_firered.gba).
O começo é o estado inicio.state: quarto do protagonista ("IA"), logo depois da introdução (rival: GREEN).

Endereços de memória do FireRed USA 1.0 (projeto de engenharia reversa pokefirered):
  gSaveBlock1Ptr 0x03005008 (posição, mapa, dinheiro, flags), gSaveBlock2Ptr 0x0300500C (pokédex, chave do dinheiro),
  gPlayerPartyCount 0x02024029, gPlayerParty 0x02024284 (100 bytes por Pokémon), gMain 0x030030F0 (inBattle).
Gravação para o vídeo (só o organizador usa): FireRed(gravar="pasta") salva info() a cada passo e um quadro a cada
GRAVAR_CADA passos (os quadros viram a gameplay da edição)."""
import json
import os
from pathlib import Path

import numpy as np
import mgba.core
import mgba.image
import mgba.log
from mgba._pylib import ffi
from mgba.gba import GBA

AQUI = Path(__file__).resolve().parent
ROM = os.environ.get('POKEMON_ROM', str(AQUI / 'rom' / 'pokemon_firered.gba'))
INICIO = AQUI / 'inicio.state'
BOTOES = {'cima': GBA.KEY_UP, 'baixo': GBA.KEY_DOWN, 'esquerda': GBA.KEY_LEFT, 'direita': GBA.KEY_RIGHT,
          'A': GBA.KEY_A, 'B': GBA.KEY_B, 'START': GBA.KEY_START, 'SELECT': GBA.KEY_SELECT, 'nada': None}
SEGURA, PASSO = 8, 24  # aperta 8 quadros e solta; cada step avança 24 quadros
GRAVAR_CADA = int(os.environ.get('GRAVAR_CADA', '4'))
# ordem das 4 subestruturas criptografadas do Pokémon (personalidade % 24): G=crescimento A=ataques E=EVs M=outros
ORDENS = ['GAEM', 'GAME', 'GEAM', 'GEMA', 'GMAE', 'GMEA', 'AGEM', 'AGME', 'AEGM', 'AEMG', 'AMGE', 'AMEG',
          'EGAM', 'EGMA', 'EAGM', 'EAMG', 'EMGA', 'EMAG', 'MGAE', 'MGEA', 'MAGE', 'MAEG', 'MEGA', 'MEAG']
mgba.log.silence()


class FireRed:
    def __init__(self, gravar=None):
        self.core = mgba.core.load_path(ROM)
        if self.core is None:
            raise FileNotFoundError(f'ROM não encontrada: {ROM}')
        self._img = mgba.image.Image(240, 160)
        self.core.set_video_buffer(self._img)
        self.core.reset()
        self._c = self.core._core
        self._inicio = INICIO.read_bytes()
        self.quadro = 0
        gravar = gravar or os.environ.get('GRAVAR')  # o organizador liga a gravação na partida final, sem mexer no código das IAs
        self._gravar = Path(gravar) if gravar else None
        self._passos = 0
        if self._gravar:
            (self._gravar / 'quadros').mkdir(parents=True, exist_ok=True)
            self._log = open(self._gravar / 'trajeto.jsonl', 'a')
        self.reset()

    # ---------- básico ----------
    def reset(self):
        self.carregar_estado(self._inicio)
        self.quadro = 0
        return self.tela()

    def step(self, botao):
        k = BOTOES[botao]
        if k is not None:
            self.core.set_keys(k)
        for i in range(PASSO):
            if i == SEGURA:
                self.core.set_keys()
            self.core.run_frame()
        self.core.set_keys()
        self.quadro += PASSO
        self._passos += 1
        if self._gravar:
            self._grava(botao)
        return self.tela()

    def tela(self):
        a = np.asarray(self._img.to_pil().convert('RGB'))
        return a

    def ram(self, endereco, tamanho=1):
        return bytes(self._c.busRead8(self._c, endereco + i) for i in range(tamanho))

    def salvar_estado(self):
        return bytes(ffi.buffer(self.core.save_raw_state()))

    def carregar_estado(self, estado):
        self.core.load_raw_state(ffi.from_buffer(estado))

    @staticmethod
    def copias(n, **k):
        return [FireRed(**k) for _ in range(n)]

    # ---------- leitura da memória ----------
    def _r8(self, a):
        return self._c.busRead8(self._c, a)

    def _r16(self, a):
        return self._c.busRead16(self._c, a)

    def _r32(self, a):
        return self._c.busRead32(self._c, a)

    def _especie(self, base):
        pers, otid = self._r32(base), self._r32(base + 4)
        chave = pers ^ otid
        ordem = ORDENS[pers % 24]
        g = ordem.index('G')
        palavra = self._r32(base + 0x20 + 12 * g) ^ chave
        return palavra & 0xFFFF

    def info(self):
        sb1, sb2 = self._r32(0x03005008), self._r32(0x0300500C)
        x, y = self._r16(sb1), self._r16(sb1 + 2)
        grupo, numero = self._r8(sb1 + 4), self._r8(sb1 + 5)
        dinheiro = self._r32(sb1 + 0x290) ^ self._r32(sb2 + 0xF20)
        insignias = bin(self._r8(sb1 + 0xEE0 + 0x104)).count('1')  # FLAG_BADGE01_GET = 0x820
        time = []
        for i in range(min(6, self._r8(0x02024029))):
            b = 0x02024284 + 100 * i
            time.append(dict(especie=self._especie(b), nivel=self._r8(b + 0x54), hp=self._r16(b + 0x56), hp_max=self._r16(b + 0x58)))
        vistos = sum(bin(self._r8(sb2 + 0x5C + i)).count('1') for i in range(52))
        capturados = sum(bin(self._r8(sb2 + 0x28 + i)).count('1') for i in range(52))
        em_batalha = bool((self._r8(0x030030F0 + 0x439) >> 1) & 1)
        return dict(mapa=(grupo, numero), x=x, y=y, insignias=insignias, em_batalha=em_batalha, time=time,
                    dinheiro=dinheiro, pokedex_vistos=vistos, pokedex_capturados=capturados)

    # ---------- gravação para o vídeo ----------
    def _grava(self, botao):
        i = self.info()
        self._log.write(json.dumps(dict(p=self._passos, q=self.quadro, b=botao, **i)) + '\n')
        if self._passos % GRAVAR_CADA == 0:
            self._img.to_pil().convert('RGB').save(self._gravar / 'quadros' / f'{self._passos:08d}.png', optimize=False, compress_level=1)
