#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IGNIS-ZERO: Agente Autônomo de Aprendizado por Reforço para Pokémon FireRed (GBA)
Arquitetura: PPO Recorrente Multimodal (GRU + Spatial Conv + Telemetry MLP)
             + Go-Explore Frontier Archive (treino) + Random Network Distillation (RND)
             + Memória Topológica Anticolisão / Contagem UCB (inferência)
Projetado para execução em CPU (4 núcleos, 16 GB RAM, sem GPU).
"""

import os
import sys
import time
import json
import math
import random
import pickle
import shutil
from collections import deque, defaultdict
from typing import Dict, List, Tuple, Any, Optional

import numpy as np

# Configuração estrita de threads antes de importar PyTorch para evitar contenção em 4 núcleos
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

try:
    torch.set_num_threads(2)
    torch.set_num_interop_threads(1)
except Exception:
    pass

from ambiente_firered import FireRed

# ==============================================================================
# CONSTANTES E HIPERPARÂMETROS
# ==============================================================================
BOTOES: List[str] = [
    "cima",
    "baixo",
    "esquerda",
    "direita",
    "A",
    "B",
    "START",
    "SELECT",
    "nada",
]
NUM_ACOES: int = len(BOTOES)
DIR_DELTAS: Dict[int, Tuple[int, int]] = {
    0: (0, -1),  # cima
    1: (0, 1),   # baixo
    2: (-1, 0),  # esquerda
    3: (1, 0),   # direita
}

QUADROS_PARTIDA_FINAL: int = 10_368_000
PASSO_QUADROS_ESTIMADO: int = 24
CHECKPOINT_DIR: str = "./checkpoint"
CKPT_FILE: str = os.path.join(CHECKPOINT_DIR, "ignis_zero_ckpt.pt")
CKPT_BACKUP: str = os.path.join(CHECKPOINT_DIR, "ignis_zero_ckpt.bak.pt")
ARCHIVE_FILE: str = os.path.join(CHECKPOINT_DIR, "go_explore_archive.pkl")
LOG_JSONL_FILE: str = "log.jsonl"

# Endereços de RAM do Pokémon FireRed (USA v1.0/v1.1) — SOMENTE LEITURA
# Usados de forma defensiva como sinais extras de interface/menu/batalha
RAM_FLAGS_END: int = 0x02020000
RAM_BATTLE_OUTCOME: int = 0x02023E82
RAM_TEXT_PRINTER: int = 0x02020180


# ==============================================================================
# UTILITÁRIOS DE EXTRAÇÃO DE ESTADO E OBSERVAÇÃO
# ==============================================================================
def normalizar_mapa(mapa_raw: Any) -> Tuple[int, int]:
    """Garante que o identificador do mapa seja sempre uma tupla (grupo, numero)."""
    if isinstance(mapa_raw, (tuple, list)) and len(mapa_raw) >= 2:
        return (int(mapa_raw[0]), int(mapa_raw[1]))
    if isinstance(mapa_raw, dict):
        return (int(mapa_raw.get("grupo", 0)), int(mapa_raw.get("numero", 0)))
    return (0, 0)


def extrair_metricas_time(info: Dict[str, Any]) -> Dict[str, float]:
    """Extrai métricas agregadas do time de Pokémon com proteção contra listas vazias."""
    time_lista = info.get("time") or []
    if not isinstance(time_lista, list) or len(time_lista) == 0:
        return {
            "tamanho": 0.0,
            "soma_niveis": 0.0,
            "max_nivel": 0.0,
            "hp_total": 0.0,
            "hp_max_total": 0.0,
            "hp_ratio": 1.0,
            "vivos": 0.0,
            "especies_unicas": 0.0,
        }

    soma_niveis = 0.0
    max_nivel = 0.0
    hp_total = 0.0
    hp_max_total = 0.0
    vivos = 0.0
    especies = set()

    for p in time_lista:
        if not isinstance(p, dict):
            continue
        nv = float(p.get("nivel", 0))
        hp = max(0.0, float(p.get("hp", 0)))
        hp_max = max(1.0, float(p.get("hp_max", 1)))
        esp = p.get("especie", 0)

        soma_niveis += nv
        if nv > max_nivel:
            max_nivel = nv
        hp_total += hp
        hp_max_total += hp_max
        if hp > 0:
            vivos += 1.0
        especies.add(esp)

    hp_ratio = hp_total / max(1.0, hp_max_total)
    return {
        "tamanho": float(len(time_lista)),
        "soma_niveis": soma_niveis,
        "max_nivel": max_nivel,
        "hp_total": hp_total,
        "hp_max_total": hp_max_total,
        "hp_ratio": float(np.clip(hp_ratio, 0.0, 1.0)),
        "vivos": vivos,
        "especies_unicas": float(len(especies)),
    }


def detectar_caixa_dialogo_ou_menu(tela: np.ndarray) -> Tuple[float, float, float]:
    """
    Analisa a imagem (160, 240, 3) para detectar:
    1. Caixa de diálogo inferior típica do GBA FireRed (linhas 114..154, colunas 8..232)
    2. Menu lateral direito (START menu: linhas 4..110, colunas 168..236)
    3. Brilho médio da tela (para detectar transições de tela preta/branca)
    """
    if tela is None or not isinstance(tela, np.ndarray) or tela.shape != (160, 240, 3):
        return 0.0, 0.0, 0.5

    # Caixa inferior: texto claro/escuro sobre fundo uniforme com borda
    strip_inf = tela[114:154, 10:230].astype(np.float32)
    brilho_inf = np.mean(strip_inf) / 255.0
    std_inf = np.std(strip_inf) / 128.0
    # Presença de fundo branco/azul claro típico de caixa de texto com caracteres escuros
    pixels_claros = np.mean((strip_inf[:, :, 0] > 210) & (strip_inf[:, :, 1] > 210))
    dialogo_score = float(np.clip(pixels_claros * 1.8 if std_inf > 0.12 else 0.0, 0.0, 1.0))

    # Menu lateral direito (START)
    strip_dir = tela[6:108, 170:234].astype(np.float32)
    pixels_claros_dir = np.mean((strip_dir[:, :, 0] > 215) & (strip_dir[:, :, 1] > 215))
    menu_score = float(np.clip(pixels_claros_dir * 1.7, 0.0, 1.0))

    brilho_global = float(np.mean(tela) / 255.0)
    return dialogo_score, menu_score, brilho_global


def ler_sinais_ram_seguro(env: Any) -> np.ndarray:
    """
    Lê pequenos blocos da RAM (somente leitura) com fallback seguro caso o emulador
    restrinja faixas de endereço. Retorna 8 features normalizadas em [0, 1].
    """
    sinais = np.zeros(8, dtype=np.float32)
    try:
        raw = env.ram(RAM_TEXT_PRINTER, 8)
        if raw is not None and len(raw) >= 8:
            arr = np.frombuffer(bytes(raw[:8]), dtype=np.uint8).astype(np.float32) / 255.0
            sinais[: len(arr)] = arr
    except Exception:
        pass
    return sinais


class MemoriaTopologica:
    """
    Mantém o grafo espacial e contagens de visitas por célula (mapa, x, y),
    além de rastrear paredes/colisões por direção e janelas de estagnação.
    Usado tanto no treino quanto na partida final (sem trapacear ou roteirizar).
    """

    def __init__(self) -> None:
        self.mapas_visitados: set = set()
        self.visitas_celula: Dict[Tuple[int, int, int, int], int] = defaultdict(int)
        self.colisoes_direcao: Dict[Tuple[int, int, int, int, int], int] = defaultdict(int)
        self.transicoes_portal: Dict[Tuple[int, int, int, int], Tuple[int, int]] = {}
        self.historico_posicoes: deque = deque(maxlen=32)
        self.passos_sem_progresso: int = 0
        self.ultimo_hash_tela: int = 0
        self.telas_repetidas_consecutivas: int = 0

    def registrar_passo(
        self,
        mapa_ant: Tuple[int, int],
        x_ant: int,
        y_ant: int,
        acao: int,
        mapa_atual: Tuple[int, int],
        x_atual: int,
        y_atual: int,
        em_batalha: bool,
        hash_tela: int,
    ) -> Tuple[bool, bool, bool]:
        """
        Atualiza estatísticas espaciais e retorna:
        (mapa_inedito, celula_inedita, colidiu_parede)
        """
        mapa_inedito = mapa_atual not in self.mapas_visitados
        self.mapas_visitados.add(mapa_atual)

        chave_celula = (mapa_atual[0], mapa_atual[1], x_atual, y_atual)
        celula_inedita = self.visitas_celula[chave_celula] == 0
        self.visitas_celula[chave_celula] += 1
        self.historico_posicoes.append(chave_celula)

        if hash_tela == self.ultimo_hash_tela:
            self.telas_repetidas_consecutivas += 1
        else:
            self.telas_repetidas_consecutivas = 0
        self.ultimo_hash_tela = hash_tela

        colidiu_parede = False
        if not em_batalha and acao in DIR_DELTAS:
            if mapa_atual == mapa_ant and x_atual == x_ant and y_atual == y_ant:
                # Se tentou mover e nem posição nem tela mudaram significativamente
                if self.telas_repetidas_consecutivas >= 1:
                    colidiu_parede = True
                    chave_col = (mapa_ant[0], mapa_ant[1], x_ant, y_ant, acao)
                    self.colisoes_direcao[chave_col] = min(20, self.colisoes_direcao[chave_col] + 1)
            else:
                # Movimento funcionou: limpa suspeita de parede naquela direção
                chave_col = (mapa_ant[0], mapa_ant[1], x_ant, y_ant, acao)
                self.colisoes_direcao[chave_col] = 0
                if mapa_atual != mapa_ant:
                    self.transicoes_portal[(mapa_ant[0], mapa_ant[1], x_ant, y_ant)] = mapa_atual

        if mapa_inedito or celula_inedita:
            self.passos_sem_progresso = 0
        else:
            self.passos_sem_progresso += 1

        return mapa_inedito, celula_inedita, colidiu_parede

    def features_vizinhanca(self, mapa: Tuple[int, int], x: int, y: int) -> np.ndarray:
        """
        Retorna vetor de 29 features locais:
        - 25 valores: 1 / sqrt(visitas + 1) na grade 5x5 centrada em (x, y)
        - 4 valores: indicador de parede conhecida nas 4 direções cardeais
        """
        feats = np.zeros(29, dtype=np.float32)
        idx = 0
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                v = self.visitas_celula.get((mapa[0], mapa[1], x + dx, y + dy), 0)
                feats[idx] = 1.0 / math.sqrt(float(v) + 1.0)
                idx += 1

        for acao_dir in range(4):
            c = self.colisoes_direcao.get((mapa[0], mapa[1], x, y, acao_dir), 0)
            feats[25 + acao_dir] = min(1.0, float(c) / 4.0)

        return feats

    def bonus_ucb_direcoes(self, mapa: Tuple[int, int], x: int, y: int, em_batalha: bool) -> np.ndarray:
        """
        Calcula um potencial de curiosidade local para cada uma das 9 ações,
        penalizando paredes comprovadas e incentivando células adjacentes menos visitadas.
        """
        bonus = np.zeros(NUM_ACOES, dtype=np.float32)
        if em_batalha:
            # Em batalha, prioriza confirmação e navegação de ataques
            bonus[4] = 0.25  # A
            bonus[0] = 0.10  # cima
            bonus[1] = 0.10  # baixo
            bonus[2] = 0.08  # esquerda
            bonus[3] = 0.08  # direita
            bonus[5] = -0.15 # Evita fugir/cancelar à toa
            return bonus

        for acao_dir, (dx, dy) in DIR_DELTAS.items():
            nx, ny = x + dx, y + dy
            visitas_adj = self.visitas_celula.get((mapa[0], mapa[1], nx, ny), 0)
            colisoes = self.colisoes_direcao.get((mapa[0], mapa[1], x, y, acao_dir), 0)

            # Bônus para células inéditas ou pouco visitadas
            exploracao = 0.45 / math.sqrt(float(visitas_adj) + 1.0)
            # Penalidade se já bateu várias vezes nessa parede exata
            penalidade_parede = -0.65 * min(1.0, float(colisoes) / 3.0)
            bonus[acao_dir] = exploracao + penalidade_parede

        # Se a tela está estática ou em possível diálogo/objeto interativo
        if self.telas_repetidas_consecutivas >= 2:
            bonus[4] += 0.30  # A (interagir / avançar diálogo)
            bonus[5] += 0.20  # B (fechar caixa presa / correr)

        # Penaliza SELECT e START excessivos no overworld para não travar em menus
        bonus[6] = -0.35 if self.passos_sem_progresso < 120 else 0.10
        bonus[7] = -0.50
        bonus[8] = -0.60  # Evita ação "nada"
        return bonus


def construir_observacao(
    tela: np.ndarray,
    info: Dict[str, Any],
    memoria: MemoriaTopologica,
    ram_feats: np.ndarray,
    ultima_acao: int,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Constrói o par de observações para a rede neural:
    1. Tensor Visual Compacto: (4, 40, 60) float32 em [0, 1]
       (RGB subamostrado 4x + canal de borda/contraste local)
    2. Vetor Estruturado de Telemetria + Memória Espacial: (64,) float32
    """
    # 1. Processamento Visual Rápido (160x240x3 -> 40x60x4)
    if tela is not None and isinstance(tela, np.ndarray) and tela.shape == (160, 240, 3):
        # Subamostragem 4x por fatia rápida (sem custo de interpolação pesada)
        rgb_small = tela[::4, ::4, :].astype(np.float32) / 255.0  # (40, 60, 3)
        lum = np.mean(rgb_small, axis=2, keepdims=True)
        # Gradiente espacial simples para destacar sprites, portas e caixas de texto
        grad_x = np.abs(np.diff(lum, axis=1, prepend=lum[:, :1, :]))
        grad_y = np.abs(np.diff(lum, axis=0, prepend=lum[:1, :, :]))
        borda = np.clip((grad_x + grad_y) * 2.5, 0.0, 1.0)
        vis = np.concatenate([rgb_small, borda], axis=2)  # (40, 60, 4)
        vis_chw = np.transpose(vis, (2, 0, 1)).astype(np.float32)
    else:
        vis_chw = np.zeros((4, 40, 60), dtype=np.float32)

    # 2. Vetor Estruturado (64 dimensões)
    vec = np.zeros(64, dtype=np.float32)
    mapa = normalizar_mapa(info.get("mapa", (0, 0)))
    x = int(info.get("x", 0))
    y = int(info.get("y", 0))
    insignias = float(info.get("insignias", 0))
    em_batalha = 1.0 if info.get("em_batalha", False) else 0.0
    dinheiro = float(info.get("dinheiro", 0))
    vistos = float(info.get("pokedex_vistos", 0))
    capturados = float(info.get("pokedex_capturados", 0))

    metricas_time = extrair_metricas_time(info)
    dialogo_score, menu_score, brilho = detectar_caixa_dialogo_ou_menu(tela)

    # Codificação trigonométrica/hash de mapa e coordenadas
    vec[0] = float(mapa[0] % 32) / 32.0
    vec[1] = float(mapa[1] % 128) / 128.0
    vec[2] = math.sin(float(mapa[0]) * 0.7 + float(mapa[1]) * 0.3)
    vec[3] = math.cos(float(mapa[0]) * 0.3 - float(mapa[1]) * 0.7)
    vec[4] = np.clip(float(x) / 64.0, -1.0, 2.0)
    vec[5] = np.clip(float(y) / 64.0, -1.0, 2.0)
    vec[6] = math.sin(float(x) * 0.5)
    vec[7] = math.cos(float(y) * 0.5)

    # Estado de jogo e progresso
    vec[8] = insignias / 8.0
    vec[9] = em_batalha
    vec[10] = math.log1p(max(0.0, dinheiro)) / 12.0
    vec[11] = vistos / 151.0
    vec[12] = capturados / 151.0
    vec[13] = metricas_time["tamanho"] / 6.0
    vec[14] = metricas_time["soma_niveis"] / 300.0
    vec[15] = metricas_time["max_nivel"] / 100.0
    vec[16] = metricas_time["hp_ratio"]
    vec[17] = metricas_time["vivos"] / 6.0

    # Estado de interface visual e estagnação
    vec[18] = dialogo_score
    vec[19] = menu_score
    vec[20] = brilho
    vec[21] = min(1.0, float(memoria.passos_sem_progresso) / 200.0)
    vec[22] = min(1.0, float(memoria.telas_repetidas_consecutivas) / 10.0)

    # One-hot da última ação (9 posições: 23..31)
    if 0 <= ultima_acao < NUM_ACOES:
        vec[23 + ultima_acao] = 1.0

    # Vizinhança 5x5 + paredes (29 posições: 32..60)
    viz = memoria.features_vizinhanca(mapa, x, y)
    vec[32:61] = viz

    # Sinais extras de RAM (3 posições: 61..63)
    vec[61:64] = ram_feats[:3]

    return vis_chw, vec


# ==============================================================================
# ARQUITETURA NEURAL: ACTOR-CRITIC RECORRENTE (PPO) + RND CURIOSITY
# ==============================================================================
class RedeIgnisZero(nn.Module):
    """
    Rede Multimodal Ultra-Leve para CPU:
    - Codificador Visual: 3 camadas Conv2d rápidas sobre entrada (4, 40, 60)
    - Codificador de Telemetria: MLP com LayerNorm sobre vetor (64,)
    - Fusão + GRU Recorrente (128 unidades) para memória de curto prazo (portas, menus, diálogos)
    - Cabeças Actor (9 ações) e Critic (valor extrínseco + valor intrínseco)
    """

    def __init__(self, num_acoes: int = NUM_ACOES, hidden_dim: int = 128) -> None:
        super().__init__()
        self.hidden_dim = hidden_dim

        self.conv = nn.Sequential(
            nn.Conv2d(4, 16, kernel_size=4, stride=2, padding=1),  # -> (16, 20, 30)
            nn.SiLU(),
            nn.Conv2d(16, 32, kernel_size=4, stride=2, padding=1),  # -> (32, 10, 15)
            nn.SiLU(),
            nn.Conv2d(32, 32, kernel_size=3, stride=2, padding=1),  # -> (32, 5, 8)
            nn.SiLU(),
            nn.Flatten(),  # 32 * 5 * 8 = 1280
            nn.Linear(1280, 128),
            nn.LayerNorm(128),
            nn.SiLU(),
        )

        self.vec_net = nn.Sequential(
            nn.Linear(64, 96),
            nn.LayerNorm(96),
            nn.SiLU(),
            nn.Linear(96, 64),
            nn.LayerNorm(64),
            nn.SiLU(),
        )

        self.gru = nn.GRUCell(128 + 64, hidden_dim)

        self.actor = nn.Sequential(
            nn.Linear(hidden_dim, 96),
            nn.SiLU(),
            nn.Linear(96, num_acoes),
        )

        self.critic = nn.Sequential(
            nn.Linear(hidden_dim, 96),
            nn.SiLU(),
            nn.Linear(96, 1),
        )

        # Redes Random Network Distillation (RND) para curiosidade intrínseca
        self.rnd_target = nn.Sequential(
            nn.Linear(128 + 64, 96),
            nn.SiLU(),
            nn.Linear(96, 32),
        )
        for p in self.rnd_target.parameters():
            p.requires_grad = False

        self.rnd_predictor = nn.Sequential(
            nn.Linear(128 + 64, 96),
            nn.SiLU(),
            nn.Linear(96, 64),
            nn.SiLU(),
            nn.Linear(64, 32),
        )

        self._inicializar_pesos()

    def _inicializar_pesos(self) -> None:
        for m in self.modules():
            if isinstance(m, (nn.Linear, nn.Conv2d)):
                nn.init.orthogonal_(m.weight, gain=math.sqrt(2))
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0.0)
        # Inicializa última camada do actor com ganho baixo para exploração inicial equilibrada
        nn.init.orthogonal_(self.actor[-1].weight, gain=0.05)

    def codificar(self, vis: torch.Tensor, vec: torch.Tensor) -> torch.Tensor:
        v_emb = self.conv(vis)
        s_emb = self.vec_net(vec)
        return torch.cat([v_emb, s_emb], dim=-1)

    def forward(
        self,
        vis: torch.Tensor,
        vec: torch.Tensor,
        hx: torch.Tensor,
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        fusao = self.codificar(vis, vec)
        novo_hx = self.gru(fusao, hx)
        logits = self.actor(novo_hx)
        valor = self.critic(novo_hx).squeeze(-1)

        with torch.no_grad():
            alvo_rnd = self.rnd_target(fusao)
        pred_rnd = self.rnd_predictor(fusao)
        erro_rnd = torch.mean((pred_rnd - alvo_rnd) ** 2, dim=-1)

        return logits, valor, novo_hx, erro_rnd


# ==============================================================================
# ARQUIVO DE FRONTEIRA GO-EXPLORE (USADO EXCLUSIVAMENTE NO TREINO)
# ==============================================================================
class ArquivoGoExplore:
    """
    Armazena saves (`env.salvar_estado()`) gerados pelo próprio agente durante o treino
    nas células de fronteira mais promissoras. Permite retomar rapidamente de novos mapas,
    após escolher o Pokémon inicial ou ganhar insígnias, sem desperdiçar horas refazendo
    o quarto inicial.
    """

    def __init__(self, max_celulas: int = 180) -> None:
        self.max_celulas = max_celulas
        # Chave: (grupo_mapa, num_mapa, x_grid, y_grid, insignias, tem_time, capturados_bucket)
        self.celulas: Dict[Tuple[int, ...], Dict[str, Any]] = {}
        self.melhor_score_global: float = -1.0

    def calcular_score_progresso(
        self,
        info: Dict[str, Any],
        num_mapas_visitados: int,
    ) -> float:
        metricas = extrair_metricas_time(info)
        insignias = float(info.get("insignias", 0))
        capturados = float(info.get("pokedex_capturados", 0))
        vistos = float(info.get("pokedex_vistos", 0))
        tem_pokemon = 1.0 if metricas["tamanho"] > 0 else 0.0

        # Ordem estrita de importância do campeonato:
        # 1. Insígnias  2. Mapas diferentes  3. Soma dos níveis  4. Pokémon capturados
        return (
            insignias * 10000.0
            + tem_pokemon * 500.0
            + float(num_mapas_visitados) * 120.0
            + metricas["soma_niveis"] * 12.0
            + capturados * 80.0
            + vistos * 5.0
        )

    def tentar_arquivar(
        self,
        env: Any,
        info: Dict[str, Any],
        num_mapas_visitados: int,
    ) -> bool:
        metricas = extrair_metricas_time(info)
        # Não salva estado no meio de derrota/blackout
        if metricas["tamanho"] > 0 and metricas["vivos"] == 0:
            return False

        mapa = normalizar_mapa(info.get("mapa", (0, 0)))
        x_grid = int(info.get("x", 0)) // 5
        y_grid = int(info.get("y", 0)) // 5
        insignias = int(info.get("insignias", 0))
        tem_time = 1 if metricas["tamanho"] > 0 else 0
        cap_bucket = min(10, int(info.get("pokedex_capturados", 0)))

        chave = (mapa[0], mapa[1], x_grid, y_grid, insignias, tem_time, cap_bucket)
        score = self.calcular_score_progresso(info, num_mapas_visitados)

        existente = self.celulas.get(chave)
        deve_salvar = False
        if existente is None:
            deve_salvar = True
        elif score > existente["score"] + 5.0:
            deve_salvar = True

        if not deve_salvar:
            return False

        try:
            estado_bytes = env.salvar_estado()
            if not estado_bytes:
                return False
        except Exception:
            return False

        self.celulas[chave] = {
            "estado": estado_bytes,
            "score": score,
            "visitas": existente["visitas"] if existente else 1,
            "mapa": mapa,
            "x": int(info.get("x", 0)),
            "y": int(info.get("y", 0)),
            "insignias": insignias,
            "soma_niveis": metricas["soma_niveis"],
            "capturados": int(info.get("pokedex_capturados", 0)),
            "timestamp": time.time(),
        }

        if score > self.melhor_score_global:
            self.melhor_score_global = score

        # Poda se exceder limite de memória
        if len(self.celulas) > self.max_celulas:
            chaves_ordenadas = sorted(
                self.celulas.keys(),
                key=lambda k: self.celulas[k]["score"],
            )
            for k_rem in chaves_ordenadas[: len(self.celulas) - self.max_celulas]:
                del self.celulas[k_rem]

        return True

    def amostrar_estado(self) -> Optional[Dict[str, Any]]:
        if not self.celulas:
            return None

        chaves = list(self.celulas.keys())
        pesos = []
        max_s = max(1.0, max(self.celulas[k]["score"] for k in chaves))
        for k in chaves:
            item = self.celulas[k]
            # Prioriza estados de alto progresso e menos re-explorados
            progresso_rel = (item["score"] + 100.0) / (max_s + 100.0)
            novidade = 1.0 / math.sqrt(float(item["visitas"]) + 1.0)
            pesos.append((progresso_rel ** 2) * novidade)

        soma_pesos = sum(pesos)
        if soma_pesos <= 0:
            escolhida = random.choice(chaves)
        else:
            probs = [p / soma_pesos for p in pesos]
            escolhida = random.choices(chaves, weights=probs, k=1)[0]

        self.celulas[escolhida]["visitas"] += 1
        return self.celulas[escolhida]


# ==============================================================================
# GERENCIADOR DE EVENTOS E LOG.JSONL (MODO JOGAR)
# ==============================================================================
class GeradorNarrativaEventos:
    """
    Detecta eventos importantes na partida final e grava imediatamente em `log.jsonl`
    com `quadro`, `evento`, `mapa`, `x`, `y` e uma explicação concisa da intenção tática.
    """

    def __init__(self, caminho_arquivo: str = LOG_JSONL_FILE) -> None:
        self.caminho_arquivo = caminho_arquivo
        self.mapas_conhecidos: set = set()
        self.inicializado: bool = False
        self.em_batalha_ant: bool = False
        self.insignias_ant: int = 0
        self.capturados_ant: int = 0
        self.soma_niveis_ant: float = 0.0
        self.tamanho_time_ant: int = 0
        self.estava_desmaiado: bool = False

    def inicializar(self, info: Dict[str, Any], quadro: int) -> None:
        mapa = normalizar_mapa(info.get("mapa", (0, 0)))
        self.mapas_conhecidos.add(mapa)
        self.em_batalha_ant = bool(info.get("em_batalha", False))
        self.insignias_ant = int(info.get("insignias", 0))
        self.capturados_ant = int(info.get("pokedex_capturados", 0))
        metricas = extrair_metricas_time(info)
        self.soma_niveis_ant = metricas["soma_niveis"]
        self.tamanho_time_ant = int(metricas["tamanho"])
        self.estava_desmaiado = False
        self.inicializado = True

        self._gravar_linha(
            quadro=quadro,
            evento="mapa_novo",
            mapa=mapa,
            x=int(info.get("x", 0)),
            y=int(info.get("y", 0)),
            explicacao="Iniciando a jornada em Pallet Town e buscando a saída do quarto para encontrar o Prof. Carvalho.",
        )

    def _gravar_linha(
        self,
        quadro: int,
        evento: str,
        mapa: Tuple[int, int],
        x: int,
        y: int,
        explicacao: str,
    ) -> None:
        registro = {
            "quadro": int(quadro),
            "evento": str(evento),
            "mapa": [int(mapa[0]), int(mapa[1])],
            "x": int(x),
            "y": int(y),
            "explicacao": str(explicacao),
        }
        try:
            with open(self.caminho_arquivo, "a", encoding="utf-8") as f:
                f.write(json.dumps(registro, ensure_ascii=False) + "\n")
                f.flush()
        except Exception:
            pass

    def verificar_e_logar(
        self,
        info: Dict[str, Any],
        quadro: int,
        acao_escolhida: str,
        passos_sem_progresso: int,
    ) -> None:
        if not self.inicializado:
            self.inicializar(info, quadro)
            return

        mapa = normalizar_mapa(info.get("mapa", (0, 0)))
        x = int(info.get("x", 0))
        y = int(info.get("y", 0))
        em_batalha = bool(info.get("em_batalha", False))
        insignias = int(info.get("insignias", 0))
        capturados = int(info.get("pokedex_capturados", 0))
        metricas = extrair_metricas_time(info)
        soma_niveis = metricas["soma_niveis"]
        tamanho_time = int(metricas["tamanho"])
        vivos = int(metricas["vivos"])

        # 1. Mapa novo visitado
        if mapa not in self.mapas_conhecidos:
            self.mapas_conhecidos.add(mapa)
            self._gravar_linha(
                quadro=quadro,
                evento="mapa_novo",
                mapa=mapa,
                x=x,
                y=y,
                explicacao=f"Explorando fronteira inédita após acionar '{acao_escolhida}' para expandir o grafo de mapas visitados ({len(self.mapas_conhecidos)} mapas).",
            )

        # 2. Batalha começou ou terminou
        if em_batalha and not self.em_batalha_ant:
            self._gravar_linha(
                quadro=quadro,
                evento="batalha_iniciada",
                mapa=mapa,
                x=x,
                y=y,
                explicacao="Entrou em combate ao avançar pelo mapa; priorizando ataques ofensivos para ganhar experiência ou capturar.",
            )
        elif not em_batalha and self.em_batalha_ant:
            motivo_fim = (
                "Concluiu o combate com vitória e retomou a navegação tática pela rota."
                if vivos > 0
                else "Combate encerrado após exaustão do time; reposicionando a partir do ponto de recuperação."
            )
            self._gravar_linha(
                quadro=quadro,
                evento="batalha_encerrada",
                mapa=mapa,
                x=x,
                y=y,
                explicacao=motivo_fim,
            )

        # 3. Captura de Pokémon (ou obtenção de novo Pokémon na Pokédex)
        if capturados > self.capturados_ant or (tamanho_time > self.tamanho_time_ant and self.tamanho_time_ant == 0):
            especie_nova = "Pokémon"
            time_lista = info.get("time") or []
            if isinstance(time_lista, list) and len(time_lista) > 0 and isinstance(time_lista[-1], dict):
                especie_nova = f"espécie #{time_lista[-1].get('especie', '?')}"
            self._gravar_linha(
                quadro=quadro,
                evento="captura",
                mapa=mapa,
                x=x,
                y=y,
                explicacao=f"Adquiriu/capturou novo integrante ({especie_nova}) para fortalecer o time e pontuar na Pokédex.",
            )

        # 4. Subiu de nível (descontando aumento causado apenas por captura de novo membro, ou quando nível total sobe com mesmo tamanho)
        if tamanho_time > 0 and tamanho_time == self.tamanho_time_ant and soma_niveis > self.soma_niveis_ant:
            delta_nv = int(soma_niveis - self.soma_niveis_ant)
            self._gravar_linha(
                quadro=quadro,
                evento="subiu_de_nivel",
                mapa=mapa,
                x=x,
                y=y,
                explicacao=f"Venceu confronto para acumular experiência e elevou a soma de níveis do time em +{delta_nv} (total: {int(soma_niveis)}).",
            )

        # 5. Insígnia conquistada
        if insignias > self.insignias_ant:
            self._gravar_linha(
                quadro=quadro,
                evento="insignia",
                mapa=mapa,
                x=x,
                y=y,
                explicacao=f"Derrotou o Líder de Ginásio e conquistou a insígnia #{insignias} para destravar o próximo estágio da campanha!",
            )

        # 6. Time desmaiou
        desmaiou_agora = tamanho_time > 0 and vivos == 0
        if desmaiou_agora and not self.estava_desmaiado:
            self._gravar_linha(
                quadro=quadro,
                evento="time_desmaiou",
                mapa=mapa,
                x=x,
                y=y,
                explicacao="O time perdeu todo o HP tentando avançar em área hostil; retornando ao Centro Pokémon para restaurar forças.",
            )

        self.em_batalha_ant = em_batalha
        self.insignias_ant = max(self.insignias_ant, insignias)
        self.capturados_ant = max(self.capturados_ant, capturados)
        self.soma_niveis_ant = soma_niveis
        self.tamanho_time_ant = tamanho_time
        self.estava_desmaiado = desmaiou_agora


# ==============================================================================
# PERSISTÊNCIA ATÔMICA DE CHECKPOINT
# ==============================================================================
def salvar_checkpoint(
    rede: RedeIgnisZero,
    otimizador: optim.Optimizer,
    arquivo_go: ArquivoGoExplore,
    memoria_global: MemoriaTopologica,
    passos_totais: int,
    atualizacoes_ppo: int,
) -> None:
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    tmp_ckpt = CKPT_FILE + ".tmp"
    dados = {
        "model_state": rede.state_dict(),
        "optim_state": otimizador.state_dict(),
        "passos_totais": passos_totais,
        "atualizacoes_ppo": atualizacoes_ppo,
        "mapas_visitados": list(memoria_global.mapas_visitados),
        "transicoes_portal": dict(memoria_global.transicoes_portal),
        "timestamp": time.time(),
    }
    try:
        torch.save(dados, tmp_ckpt)
        if os.path.exists(CKPT_FILE):
            shutil.copy2(CKPT_FILE, CKPT_BACKUP)
        os.replace(tmp_ckpt, CKPT_FILE)
    except Exception as e:
        sys.stderr.write(f"[WARN] Falha ao salvar checkpoint principal: {e}\n")

    # Salva arquivo Go-Explore separadamente de forma atômica
    tmp_arch = ARCHIVE_FILE + ".tmp"
    try:
        with open(tmp_arch, "wb") as f:
            pickle.dump(
                {
                    "celulas": arquivo_go.celulas,
                    "melhor_score_global": arquivo_go.melhor_score_global,
                },
                f,
                protocol=pickle.HIGHEST_PROTOCOL,
            )
        os.replace(tmp_arch, ARCHIVE_FILE)
    except Exception as e:
        sys.stderr.write(f"[WARN] Falha ao salvar arquivo Go-Explore: {e}\n")


def carregar_checkpoint(
    rede: RedeIgnisZero,
    otimizador: Optional[optim.Optimizer] = None,
    arquivo_go: Optional[ArquivoGoExplore] = None,
    memoria_global: Optional[MemoriaTopologica] = None,
) -> Tuple[int, int]:
    passos_totais = 0
    atualizacoes_ppo = 0

    for caminho in (CKPT_FILE, CKPT_BACKUP):
        if os.path.exists(caminho):
            try:
                dados = torch.load(caminho, map_location="cpu", weights_only=False)
                rede.load_state_dict(dados["model_state"])
                if otimizador is not None and "optim_state" in dados:
                    otimizador.load_state_dict(dados["optim_state"])
                passos_totais = int(dados.get("passos_totais", 0))
                atualizacoes_ppo = int(dados.get("atualizacoes_ppo", 0))
                if memoria_global is not None:
                    for m in dados.get("mapas_visitados", []):
                        memoria_global.mapas_visitados.add(normalizar_mapa(m))
                    for k, v in dados.get("transicoes_portal", {}).items():
                        memoria_global.transicoes_portal[k] = normalizar_mapa(v)
                break
            except Exception as e:
                sys.stderr.write(f"[WARN] Erro lendo {caminho}: {e}\n")

    if arquivo_go is not None and os.path.exists(ARCHIVE_FILE):
        try:
            with open(ARCHIVE_FILE, "rb") as f:
                arch_data = pickle.load(f)
                arquivo_go.celulas = arch_data.get("celulas", {})
                arquivo_go.melhor_score_global = float(arch_data.get("melhor_score_global", -1.0))
        except Exception as e:
            sys.stderr.write(f"[WARN] Erro lendo arquivo Go-Explore: {e}\n")

    return passos_totais, atualizacoes_ppo


# ==============================================================================
# CÁLCULO DE RECOMPENSA (ALINHADO AO PLACAR OFICIAL)
# ==============================================================================
def calcular_recompensa_passo(
    info_ant: Dict[str, Any],
    info_atual: Dict[str, Any],
    mapa_inedito: bool,
    celula_inedita: bool,
    colidiu_parede: bool,
    visitas_celula_atual: int,
    erro_rnd: float,
) -> float:
    r = 0.0

    # 1. Insígnias (Prioridade #1 do placar)
    ins_ant = int(info_ant.get("insignias", 0))
    ins_atual = int(info_atual.get("insignias", 0))
    if ins_atual > ins_ant:
        r += 500.0 * float(ins_atual - ins_ant)

    # 2. Mapas diferentes visitados (Prioridade #2 do placar)
    if mapa_inedito:
        r += 30.0

    # 3. Exploração espacial de coordenadas (x, y)
    if celula_inedita:
        r += 1.5
    elif visitas_celula_atual <= 4:
        r += 0.15 / math.sqrt(float(visitas_celula_atual))

    # 4. Métricas de Time e Níveis (Prioridade #3 do placar)
    m_ant = extrair_metricas_time(info_ant)
    m_atual = extrair_metricas_time(info_atual)

    # Obtenção do Pokémon inicial no laboratório do Prof. Carvalho
    if m_ant["tamanho"] == 0 and m_atual["tamanho"] > 0:
        r += 120.0

    # Subida de nível real
    if m_atual["tamanho"] >= m_ant["tamanho"] and m_atual["soma_niveis"] > m_ant["soma_niveis"]:
        delta_nv = m_atual["soma_niveis"] - m_ant["soma_niveis"]
        # Se o time não aumentou de tamanho, todo o delta é level up puro
        if m_atual["tamanho"] == m_ant["tamanho"]:
            r += 15.0 * delta_nv
        else:
            r += 5.0

    # 5. Pokémon Capturados e Vistos (Prioridade #4 do placar)
    cap_ant = int(info_ant.get("pokedex_capturados", 0))
    cap_atual = int(info_atual.get("pokedex_capturados", 0))
    if cap_atual > cap_ant:
        r += 65.0 * float(cap_atual - cap_ant)

    vis_ant = int(info_ant.get("pokedex_vistos", 0))
    vis_atual = int(info_atual.get("pokedex_vistos", 0))
    if vis_atual > vis_ant:
        r += 4.0 * float(vis_atual - vis_ant)

    # 6. Saúde do time e vitórias em batalha
    if m_atual["tamanho"] > 0:
        if m_atual["vivos"] == 0 and m_ant["vivos"] > 0:
            r -= 12.0  # Penalidade moderada por blackout
        elif m_atual["hp_ratio"] > m_ant["hp_ratio"] + 0.25 and not info_atual.get("em_batalha", False):
            r += 2.0  # Curou no Centro Pokémon / poção

    # 7. Penalidade leve por bater repetidamente na mesma parede
    if colidiu_parede:
        r -= 0.08

    # 8. Bônus intrínseco RND limitado
    r += float(np.clip(erro_rnd * 0.15, 0.0, 0.6))

    return float(r)


# ==============================================================================
# MODO 1: TREINAMENTO PARALELO (PPO + GO-EXPLORE + RND)
# ==============================================================================
def executar_treinamento() -> None:
    tempo_inicio = time.time()
    tempo_limite_s = float(os.environ.get("TEMPO_LIMITE_S", "10800"))
    # Margem de segurança de 15 segundos(ou 5% em testes curtos) para fechar checkpoint limpo
    margem_seguranca = min(15.0, max(1.5, tempo_limite_s * 0.08))
    deadline = tempo_inicio + max(2.0, tempo_limite_s - margem_seguranca)

    num_envs = 4
    try:
        envs = FireRed.copias(num_envs)
        if not isinstance(envs, (list, tuple)) or len(envs) == 0:
            envs = [FireRed() for _ in range(num_envs)]
    except Exception:
        envs = [FireRed() for _ in range(num_envs)]
    num_envs = len(envs)

    rede = RedeIgnisZero(num_acoes=NUM_ACOES, hidden_dim=128)
    otimizador = optim.Adam(rede.parameters(), lr=3e-4, eps=1e-5)
    arquivo_go = ArquivoGoExplore(max_celulas=180)
    memoria_global = MemoriaTopologica()

    passos_totais, atualizacoes_ppo = carregar_checkpoint(
        rede=rede,
        otimizador=otimizador,
        arquivo_go=arquivo_go,
        memoria_global=memoria_global,
    )

    memorias_env = [MemoriaTopologica() for _ in range(num_envs)]
    for m in memorias_env:
        m.mapas_visitados = set(memoria_global.mapas_visitados)
        m.transicoes_portal = dict(memoria_global.transicoes_portal)

    infos_atuais: List[Dict[str, Any]] = []
    telas_atuais: List[np.ndarray] = []
    ultimas_acoes = [8 for _ in range(num_envs)]
    passos_desde_teleport = [0 for _ in range(num_envs)]

    for i, env in enumerate(envs):
        try:
            if arquivo_go.celulas and i > 0 and random.random() < 0.65:
                amostra = arquivo_go.amostrar_estado()
                if amostra is not None:
                    env.carregar_estado(amostra["estado"])
                else:
                    env.reset()
            else:
                env.reset()
        except Exception:
            env.reset()

        info_i = env.info()
        tela_i = env.tela()
        infos_atuais.append(info_i)
        telas_atuais.append(tela_i)
        arquivo_go.tentar_arquivar(env, info_i, len(memorias_env[i].mapas_visitados))

    hx = torch.zeros((num_envs, 128), dtype=torch.float32)
    horizonte = 64  # Rollout curto para atualizações rápidas em CPU
    gamma = 0.995
    gae_lambda = 0.95
    clip_eps = 0.2
    ultimo_salvamento = time.time()

    while time.time() < deadline:
        # Buffers de rollout PPO
        buf_vis = np.zeros((horizonte, num_envs, 4, 40, 60), dtype=np.float32)
        buf_vec = np.zeros((horizonte, num_envs, 64), dtype=np.float32)
        buf_hx = np.zeros((horizonte, num_envs, 128), dtype=np.float32)
        buf_acoes = np.zeros((horizonte, num_envs), dtype=np.int64)
        buf_logprobs = np.zeros((horizonte, num_envs), dtype=np.float32)
        buf_valores = np.zeros((horizonte, num_envs), dtype=np.float32)
        buf_recompensas = np.zeros((horizonte, num_envs), dtype=np.float32)
        buf_dones = np.zeros((horizonte, num_envs), dtype=np.float32)

        passos_coletados = 0
        for t in range(horizonte):
            if time.time() >= deadline:
                break

            obs_vis_list = []
            obs_vec_list = []
            bonus_ucb_list = []

            for i in range(num_envs):
                ram_f = ler_sinais_ram_seguro(envs[i])
                vis_i, vec_i = construir_observacao(
                    telas_atuais[i],
                    infos_atuais[i],
                    memorias_env[i],
                    ram_f,
                    ultimas_acoes[i],
                )
                obs_vis_list.append(vis_i)
                obs_vec_list.append(vec_i)

                mapa_i = normalizar_mapa(infos_atuais[i].get("mapa", (0, 0)))
                x_i = int(infos_atuais[i].get("x", 0))
                y_i = int(infos_atuais[i].get("y", 0))
                em_bat_i = bool(infos_atuais[i].get("em_batalha", False))
                bonus_ucb_list.append(memorias_env[i].bonus_ucb_direcoes(mapa_i, x_i, y_i, em_bat_i))

            vis_t = torch.from_numpy(np.stack(obs_vis_list, axis=0))
            vec_t = torch.from_numpy(np.stack(obs_vec_list, axis=0))
            bonus_t = torch.from_numpy(np.stack(bonus_ucb_list, axis=0))

            buf_vis[t] = vis_t.numpy()
            buf_vec[t] = vec_t.numpy()
            buf_hx[t] = hx.detach().numpy()

            with torch.no_grad():
                logits, valores, novo_hx, erros_rnd = rede(vis_t, vec_t, hx)
                logits_guiados = logits + bonus_t
                dist = torch.distributions.Categorical(logits=logits_guiados)
                acoes_t = dist.sample()
                logprobs_t = dist.log_prob(acoes_t)

            hx = novo_hx.detach()
            acoes_np = acoes_t.numpy()
            buf_acoes[t] = acoes_np
            buf_logprobs[t] = logprobs_t.numpy()
            buf_valores[t] = valores.numpy()
            erros_rnd_np = erros_rnd.numpy()

            # Executa passo em cada emulador
            for i in range(num_envs):
                acao_idx = int(acoes_np[i])
                botao = BOTOES[acao_idx]
                info_ant = infos_atuais[i]
                mapa_ant = normalizar_mapa(info_ant.get("mapa", (0, 0)))
                x_ant = int(info_ant.get("x", 0))
                y_ant = int(info_ant.get("y", 0))

                envs[i].step(botao)
                info_novo = envs[i].info()
                tela_nova = envs[i].tela()

                mapa_novo = normalizar_mapa(info_novo.get("mapa", (0, 0)))
                x_novo = int(info_novo.get("x", 0))
                y_novo = int(info_novo.get("y", 0))
                em_batalha_novo = bool(info_novo.get("em_batalha", False))

                hash_tela = int(np.sum(tela_nova[::8, ::8])) if isinstance(tela_nova, np.ndarray) else 0
                mapa_ined, cel_ined, colidiu = memorias_env[i].registrar_passo(
                    mapa_ant=mapa_ant,
                    x_ant=x_ant,
                    y_ant=y_ant,
                    acao=acao_idx,
                    mapa_atual=mapa_novo,
                    x_atual=x_novo,
                    y_atual=y_novo,
                    em_batalha=em_batalha_novo,
                    hash_tela=hash_tela,
                )
                memoria_global.mapas_visitados.add(mapa_novo)
                memoria_global.visitas_celula[(mapa_novo[0], mapa_novo[1], x_novo, y_novo)] += 1

                visitas_cel = memorias_env[i].visitas_celula[(mapa_novo[0], mapa_novo[1], x_novo, y_novo)]
                recomp = calcular_recompensa_passo(
                    info_ant=info_ant,
                    info_atual=info_novo,
                    mapa_inedito=mapa_ined,
                    celula_inedita=cel_ined,
                    colidiu_parede=colidiu,
                    visitas_celula_atual=visitas_cel,
                    erro_rnd=float(erros_rnd_np[i]),
                )

                buf_recompensas[t, i] = recomp
                infos_atuais[i] = info_novo
                telas_atuais[i] = tela_nova
                ultimas_acoes[i] = acao_idx
                passos_desde_teleport[i] += 1
                passos_totais += 1

                # Arquiva fronteiras promissoras no Go-Explore
                if mapa_ined or cel_ined or recomp >= 10.0:
                    arquivo_go.tentar_arquivar(envs[i], info_novo, len(memoria_global.mapas_visitados))

                # Se o worker estagnou por muitos passos, carrega estado de fronteira Go-Explore
                limite_estagnacao = 280 if i > 0 else 450
                if (
                    memorias_env[i].passos_sem_progresso >= limite_estagnacao
                    and passos_desde_teleport[i] >= 180
                    and arquivo_go.celulas
                ):
                    amostra = arquivo_go.amostrar_estado()
                    if amostra is not None:
                        try:
                            envs[i].carregar_estado(amostra["estado"])
                            infos_atuais[i] = envs[i].info()
                            telas_atuais[i] = envs[i].tela()
                            memorias_env[i].passos_sem_progresso = 0
                            passos_desde_teleport[i] = 0
                            buf_dones[t, i] = 1.0
                            hx[i].zero_()
                        except Exception:
                            pass

            passos_coletados += 1

        if passos_coletados < 8:
            break

        # Cálculo de Vantagens GAE (Generalized Advantage Estimation)
        with torch.no_grad():
            obs_vis_ult = []
            obs_vec_ult = []
            for i in range(num_envs):
                ram_f = ler_sinais_ram_seguro(envs[i])
                v_i, s_i = construir_observacao(
                    telas_atuais[i],
                    infos_atuais[i],
                    memorias_env[i],
                    ram_f,
                    ultimas_acoes[i],
                )
                obs_vis_ult.append(v_i)
                obs_vec_ult.append(s_i)
            _, prox_valores, _, _ = rede(
                torch.from_numpy(np.stack(obs_vis_ult, axis=0)),
                torch.from_numpy(np.stack(obs_vec_ult, axis=0)),
                hx,
            )
            prox_valores_np = prox_valores.numpy()

        vantagens = np.zeros((passos_coletados, num_envs), dtype=np.float32)
        ult_gae = np.zeros(num_envs, dtype=np.float32)
        for t in reversed(range(passos_coletados)):
            if t == passos_coletados - 1:
                nao_terminal = 1.0 - buf_dones[t]
                prox_val = prox_valores_np
            else:
                nao_terminal = 1.0 - buf_dones[t]
                prox_val = buf_valores[t + 1]
            delta = buf_recompensas[t] + gamma * prox_val * nao_terminal - buf_valores[t]
            ult_gae = delta + gamma * gae_lambda * nao_terminal * ult_gae
            vantagens[t] = ult_gae

        retornos = vantagens + buf_valores[:passos_coletados]

        # Achata batch para atualização PPO + RND
        b_vis = torch.from_numpy(buf_vis[:passos_coletados].reshape(-1, 4, 40, 60))
        b_vec = torch.from_numpy(buf_vec[:passos_coletados].reshape(-1, 64))
        b_hx = torch.from_numpy(buf_hx[:passos_coletados].reshape(-1, 128))
        b_acoes = torch.from_numpy(buf_acoes[:passos_coletados].reshape(-1))
        b_logprobs = torch.from_numpy(buf_logprobs[:passos_coletados].reshape(-1))
        b_vantagens = torch.from_numpy(vantagens.reshape(-1))
        b_retornos = torch.from_numpy(retornos.reshape(-1))

        # Normaliza vantagens
        b_vantagens = (b_vantagens - b_vantagens.mean()) / (b_vantagens.std() + 1e-8)

        total_amostras = b_vis.shape[0]
        indices = np.arange(total_amostras)
        mini_batch = max(16, total_amostras // 2)

        for _ in range(2):
            if time.time() >= deadline:
                break
            np.random.shuffle(indices)
            for inicio_mb in range(0, total_amostras, mini_batch):
                idx_mb = indices[inicio_mb : inicio_mb + mini_batch]
                logits_mb, valores_mb, _, erro_rnd_mb = rede(
                    b_vis[idx_mb],
                    b_vec[idx_mb],
                    b_hx[idx_mb],
                )
                dist_mb = torch.distributions.Categorical(logits=logits_mb)
                novos_logprobs = dist_mb.log_prob(b_acoes[idx_mb])
                entropia = dist_mb.entropy().mean()

                razao = torch.exp(novos_logprobs - b_logprobs[idx_mb])
                surr1 = razao * b_vantagens[idx_mb]
                surr2 = torch.clamp(razao, 1.0 - clip_eps, 1.0 + clip_eps) * b_vantagens[idx_mb]
                perda_politica = -torch.min(surr1, surr2).mean()
                perda_valor = 0.5 * F.mse_loss(valores_mb, b_retornos[idx_mb])
                perda_rnd = erro_rnd_mb.mean()

                perda_total = perda_politica + 0.5 * perda_valor - 0.015 * entropia + 0.25 * perda_rnd

                otimizador.zero_grad()
                perda_total.backward()
                nn.utils.clip_grad_norm_(rede.parameters(), max_norm=0.8)
                otimizador.step()

        atualizacoes_ppo += 1

        # Salva checkpoint periodicamente (a cada 45 segundos)
        if time.time() - ultimo_salvamento >= 45.0:
            salvar_checkpoint(
                rede=rede,
                otimizador=otimizador,
                arquivo_go=arquivo_go,
                memoria_global=memoria_global,
                passos_totais=passos_totais,
                atualizacoes_ppo=atualizacoes_ppo,
            )
            ultimo_salvamento = time.time()

    # Salvamento final garantido antes de encerrar o bloco de treino
    salvar_checkpoint(
        rede=rede,
        otimizador=otimizador,
        arquivo_go=arquivo_go,
        memoria_global=memoria_global,
        passos_totais=passos_totais,
        atualizacoes_ppo=atualizacoes_ppo,
    )


# ==============================================================================
# MODO 2: PARTIDA FINAL CONTÍNUA (JOGAR ATÉ 10.368.000 QUADROS)
# ==============================================================================
def executar_partida_final() -> None:
    """
    Carrega o checkpoint treinado e joga UMA partida contínua desde o começo do jogo
    até 10.368.000 quadros, sem usar carregar_estado, gravando todos os eventos em log.jsonl.
    """
    rede = RedeIgnisZero(num_acoes=NUM_ACOES, hidden_dim=128)
    memoria = MemoriaTopologica()
    carregar_checkpoint(
        rede=rede,
        otimizador=None,
        arquivo_go=None,
        memoria_global=memoria,
    )
    rede.eval()

    # Limpa conjuntos de visita da partida para pontuar exploração real desta run,
    # mas preserva o conhecimento neural aprendido no checkpoint
    memoria_partida = MemoriaTopologica()
    logger_eventos = GeradorNarrativaEventos(caminho_arquivo=LOG_JSONL_FILE)

    env = FireRed()
    env.reset()

    info_atual = env.info()
    tela_atual = env.tela()
    quadro_atual = int(getattr(env, "quadro", 0))
    logger_eventos.inicializar(info_atual, quadro_atual)

    hx = torch.zeros((1, 128), dtype=torch.float32)
    ultima_acao = 4  # Começa com intenção de interação 'A'
    passos_executados = 0
    max_passos_seguranca = (QUADROS_PARTIDA_FINAL // 24) + 100

    while quadro_atual < QUADROS_PARTIDA_FINAL and passos_executados < max_passos_seguranca:
        ram_f = ler_sinais_ram_seguro(env)
        vis_np, vec_np = construir_observacao(
            tela=tela_atual,
            info=info_atual,
            memoria=memoria_partida,
            ram_feats=ram_f,
            ultima_acao=ultima_acao,
        )

        mapa_ant = normalizar_mapa(info_atual.get("mapa", (0, 0)))
        x_ant = int(info_atual.get("x", 0))
        y_ant = int(info_atual.get("y", 0))
        em_batalha_ant = bool(info_atual.get("em_batalha", False))

        bonus_ucb = memoria_partida.bonus_ucb_direcoes(mapa_ant, x_ant, y_ant, em_batalha_ant)

        with torch.no_grad():
            vis_t = torch.from_numpy(vis_np).unsqueeze(0)
            vec_t = torch.from_numpy(vec_np).unsqueeze(0)
            logits, _, hx, _ = rede(vis_t, vec_t, hx)
            logits_np = logits.squeeze(0).numpy()

        # Temperatura adaptativa: se o agente ficar sem descobrir novas células,
        # aumenta a entropia gradualmente para escapar de cantos ou loops locais
        fator_estagnacao = min(1.0, float(memoria_partida.passos_sem_progresso) / 250.0)
        temperatura = 0.75 + 0.85 * fator_estagnacao
        logits_combinados = (logits_np / temperatura) + bonus_ucb

        # Softmax numericamente estável
        logits_shift = logits_combinados - np.max(logits_combinados)
        probs = np.exp(logits_shift)
        soma_probs = np.sum(probs)
        if not np.isfinite(soma_probs) or soma_probs <= 0:
            probs = np.ones(NUM_ACOES, dtype=np.float32) / float(NUM_ACOES)
        else:
            probs = probs / soma_probs

        acao_idx = int(np.random.choice(NUM_ACOES, p=probs))
        botao = BOTOES[acao_idx]

        # Executa ação no emulador
        env.step(botao)
        passos_executados += 1

        info_novo = env.info()
        tela_nova = env.tela()
        quadro_novo = int(getattr(env, "quadro", passos_executados * PASSO_QUADROS_ESTIMADO))
        if quadro_novo <= quadro_atual:
            quadro_atual += PASSO_QUADROS_ESTIMADO
        else:
            quadro_atual = quadro_novo

        mapa_novo = normalizar_mapa(info_novo.get("mapa", (0, 0)))
        x_novo = int(info_novo.get("x", 0))
        y_novo = int(info_novo.get("y", 0))
        em_batalha_novo = bool(info_novo.get("em_batalha", False))

        hash_tela = int(np.sum(tela_nova[::8, ::8])) if isinstance(tela_nova, np.ndarray) else 0
        memoria_partida.registrar_passo(
            mapa_ant=mapa_ant,
            x_ant=x_ant,
            y_ant=y_ant,
            acao=acao_idx,
            mapa_atual=mapa_novo,
            x_atual=x_novo,
            y_atual=y_novo,
            em_batalha=em_batalha_novo,
            hash_tela=hash_tela,
        )

        # Verifica e registra eventos importantes no log.jsonl
        logger_eventos.verificar_e_logar(
            info=info_novo,
            quadro=quadro_atual,
            acao_escolhida=botao,
            passos_sem_progresso=memoria_partida.passos_sem_progresso,
        )

        info_atual = info_novo
        tela_atual = tela_nova
        ultima_acao = acao_idx


# ==============================================================================
# PONTO DE ENTRADA CLI
# ==============================================================================
def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python agente.py [treinar|jogar]")
        sys.exit(1)

    modo = sys.argv[1].strip().lower()
    if modo == "treinar":
        executar_treinamento()
    elif modo == "jogar":
        executar_partida_final()
    else:
        print(f"Modo desconhecido: '{modo}'. Use 'treinar' ou 'jogar'.")
        sys.exit(1)


if __name__ == "__main__":
    main()
