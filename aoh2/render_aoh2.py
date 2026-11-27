#!/usr/bin/env python3
"""
Renderizador visual AoH2 (Age of History 2 — America do Sul das IAs)
===================================================================
Converte gravacoes (`mapa.json` + `turnos.jsonl`) em quadros SVG cartograficos
1920x1080 (rasterizados via `rsvg-convert` para 1280x720) e videos MP4 via `ffmpeg`.

Padrao visual:
- Fiel ao Age of History 2 (oceano profundo com grade cartografica, sombra suave
  sob a America do Sul, fronteiras internas discretas vs internacionais nitidas,
  hachura diagonal em provincias com baixa lealdade, placas de tropas com filete
  da nacao, setas Bezier animadas com impacto em batalhas, HUD metalico escuro,
  ranking ao vivo, feed diplomatico, pop-ups diplomaticos com duas bandeiras e
  card de fala publica / pensamento secreto).
- Receita AGE v4: camera continua suavizada por kernel gaussiano no tempo, foco
  no maior cluster de combate/evento e deriva senoidal lenta em toda a partida.
- 100% vetorial SVG (ZERO emojis em qualquer texto ou icone).
- Usa `tempfile.gettempdir()` (nunca `/tmp`).
"""

from __future__ import annotations

import argparse
import concurrent.futures
import itertools
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape as xml_escape

# Dimensoes logicas do canvas SVG
SVG_W = 1920
SVG_H = 1080

# Area livre do mapa (fora da barra superior y=0..72 e painel direito x=1455..1920)
VIEWPORT_MAP_X0 = 0.0
VIEWPORT_MAP_Y0 = 72.0
VIEWPORT_MAP_X1 = 1455.0
VIEWPORT_MAP_Y1 = 1080.0
VIEWPORT_CENTER_X = (VIEWPORT_MAP_X0 + VIEWPORT_MAP_X1) * 0.5  # 727.5
VIEWPORT_CENTER_Y = (VIEWPORT_MAP_Y0 + VIEWPORT_MAP_Y1) * 0.5  # 576.0

FONT_SANS = "DejaVu Sans, Liberation Sans, Noto Sans, Arial, sans-serif"
FONT_MONO = "DejaVu Sans Mono, DejaVu Sans, monospace"

# Filtro de remocao de emojis / pictogramas / controles (mantem PT-BR acentuado)
_EMOJI_RE = re.compile(
    "["
    "\U0001F000-\U0001FFFF"
    "\U00002600-\U000027BF"
    "\U00002300-\U000023FF"
    "\U00002B00-\U00002BFF"
    "\U0000FE00-\U0000FE0F"
    "\U0000200D"
    "\U000020E3"
    "\U000E0000-\U000E007F"
    "]+",
    flags=re.UNICODE,
)
_CTRL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

STRONG_EVENT_PRIORITY = {
    "traicao": 5,
    "eliminacao": 4,
    "guerra": 3,
    "ultimato": 2,
    "ultimato_aceito": 2,
    "paz": 1,
}

EVENT_STYLE = {
    "traicao": {
        "cor": "#c026d3",
        "bg": "#240a2b",
        "titulo": "TRAICAO DIPLOMATICA",
        "tag": "TRAICAO",
    },
    "eliminacao": {
        "cor": "#f97316",
        "bg": "#291206",
        "titulo": "NACAO ELIMINADA",
        "tag": "ELIMINACAO",
    },
    "guerra": {
        "cor": "#ef4444",
        "bg": "#2b0c12",
        "titulo": "GUERRA DECLARADA",
        "tag": "GUERRA",
    },
    "ultimato": {
        "cor": "#f59e0b",
        "bg": "#291b06",
        "titulo": "ULTIMATO DIPLOMATICO",
        "tag": "ULTIMATO",
    },
    "ultimato_aceito": {
        "cor": "#f59e0b",
        "bg": "#291b06",
        "titulo": "TERRITORIO CEDIDO",
        "tag": "ULTIMATO",
    },
    "paz": {
        "cor": "#10b981",
        "bg": "#08241b",
        "titulo": "TRATADO DE PAZ",
        "tag": "PAZ",
    },
    "alianca": {
        "cor": "#22c55e",
        "bg": "#092415",
        "titulo": "ALIANCA FIRMADA",
        "tag": "ALIANCA",
    },
    "pna": {
        "cor": "#38bdf8",
        "bg": "#082030",
        "titulo": "PACTO DE NAO AGRESSAO",
        "tag": "PACTO",
    },
    "quebra_pacto": {
        "cor": "#e879f9",
        "bg": "#240a2b",
        "titulo": "PACTO ROMPIDO",
        "tag": "RUPTURA",
    },
    "insulto": {
        "cor": "#fb7185",
        "bg": "#2b0c18",
        "titulo": "INSULTO DIPLOMATICO",
        "tag": "INSULTO",
    },
    "desercao": {
        "cor": "#fb923c",
        "bg": "#291206",
        "titulo": "CRISE E DESERCAO",
        "tag": "DESERCAO",
    },
    "revolta": {
        "cor": "#f43f5e",
        "bg": "#2b0c18",
        "titulo": "REVOLTA POPULAR",
        "tag": "REVOLTA",
    },
    "batalha": {
        "cor": "#eab308",
        "bg": "#261d08",
        "titulo": "GRANDE BATALHA",
        "tag": "BATALHA",
    },
    "conquista": {
        "cor": "#fbbf24",
        "bg": "#241a08",
        "titulo": "TERRITORIO CONQUISTADO",
        "tag": "CONQUISTA",
    },
}

TERRAIN_SHADE = {
    "planicie": (1.00, "#000000", 0.00),
    "urbano": (1.07, "#ffffff", 0.04),
    "floresta": (0.91, "#0b2e13", 0.08),
    "montanha": (0.87, "#334155", 0.14),
    "deserto": (1.08, "#f59e0b", 0.08),
}


# ---------------------------------------------------------------------------
# Utilitarios de texto, cor e matematica
# ---------------------------------------------------------------------------


def clean_text(text: Any) -> str:
    """Remove emojis/controles e normaliza espacos mantendo acentos PT-BR."""
    if text is None:
        return ""
    s = str(text)
    s = _EMOJI_RE.sub("", s)
    s = _CTRL_RE.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def esc(text: Any) -> str:
    """Limpa emojis e faz escape XML seguro para SVG."""
    return xml_escape(clean_text(text), {'"': "&quot;", "'": "&apos;"})


def truncate_text(text: str, max_chars: int) -> str:
    s = clean_text(text)
    if len(s) <= max_chars:
        return s
    if max_chars <= 3:
        return s[:max_chars]
    return s[: max_chars - 3].rstrip() + "..."


def wrap_lines(text: str, width: int, max_lines: int) -> list[str]:
    """Quebra texto em no maximo `max_lines` linhas sem estourar a largura."""
    s = clean_text(text)
    if not s:
        return []
    lines = textwrap.wrap(
        s,
        width=max(8, width),
        break_long_words=True,
        break_on_hyphens=True,
    )
    if len(lines) <= max_lines:
        return lines
    kept = lines[:max_lines]
    last = kept[-1]
    if len(last) > max(4, width - 3):
        last = last[: max(1, width - 3)].rstrip()
    kept[-1] = last.rstrip(".,;: ") + "..."
    return kept


def clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else (hi if v > hi else v)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_out_cubic(t: float) -> float:
    t = clamp(t, 0.0, 1.0)
    return 1.0 - (1.0 - t) ** 3


def ease_in_out_sine(t: float) -> float:
    t = clamp(t, 0.0, 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def parse_hex_color(color: Any, default: str = "#3b82f6") -> tuple[int, int, int]:
    if not isinstance(color, str):
        color = default
    c = color.strip().lstrip("#")
    if len(c) == 3 and all(ch in "0123456789abcdefABCDEF" for ch in c):
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6 or not all(ch in "0123456789abcdefABCDEF" for ch in c):
        c = default.lstrip("#")
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


def rgb_to_hex(r: float, g: float, b: float) -> str:
    ri = int(clamp(round(r), 0, 255))
    gi = int(clamp(round(g), 0, 255))
    bi = int(clamp(round(b), 0, 255))
    return f"#{ri:02x}{gi:02x}{bi:02x}"


def blend_hex(c1: str, c2: str, alpha: float) -> str:
    r1, g1, b1 = parse_hex_color(c1)
    r2, g2, b2 = parse_hex_color(c2)
    a = clamp(alpha, 0.0, 1.0)
    return rgb_to_hex(lerp(r1, r2, a), lerp(g1, g2, a), lerp(b1, b2, a))


def shade_province_color(base_hex: str, terreno: str, battle_boost: float = 0.0) -> str:
    factor, tint, tint_alpha = TERRAIN_SHADE.get(terreno, (1.0, "#000000", 0.0))
    r, g, b = parse_hex_color(base_hex)
    shaded = rgb_to_hex(r * factor, g * factor, b * factor)
    if tint_alpha > 0.0:
        shaded = blend_hex(shaded, tint, tint_alpha)
    if battle_boost > 0.0:
        shaded = blend_hex(shaded, "#ffedd5", clamp(battle_boost * 0.28, 0.0, 0.30))
    return shaded


def fmt_troops(n: Any) -> str:
    try:
        val = int(round(float(n)))
    except (TypeError, ValueError):
        return "0"
    if val < 0:
        val = 0
    if val >= 1_000_000:
        s = f"{val / 1_000_000:.1f}".rstrip("0").rstrip(".")
        return f"{s}M"
    if val >= 10_000:
        s = f"{val / 1000:.1f}".rstrip("0").rstrip(".")
        return f"{s}k"
    if val >= 1000:
        s = f"{val / 1000:.1f}"
        if s.endswith(".0"):
            s = s[:-2]
        return f"{s}k"
    return str(val)


def polygon_centroid(pts: list[tuple[float, float]]) -> tuple[float, float]:
    if not pts:
        return (720.0, 540.0)
    area2 = 0.0
    cx = 0.0
    cy = 0.0
    n = len(pts)
    for i in range(n):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area2 += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if abs(area2) < 1e-4:
        return (sum(p[0] for p in pts) / n, sum(p[1] for p in pts) / n)
    return (cx / (3.0 * area2), cy / (3.0 * area2))


def polygon_area(pts: list[tuple[float, float]]) -> float:
    n = len(pts)
    if n < 3:
        return 0.0
    s = 0.0
    for i in range(n):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        s += x0 * y1 - x1 * y0
    return abs(s) * 0.5


# ---------------------------------------------------------------------------
# Carregamento e Topologia do Mapa
# ---------------------------------------------------------------------------


class MapTopology:
    """Pre-processa poligonos, arestas compartilhadas, limites e bandeiras."""

    def __init__(self, mapa: dict[str, Any]) -> None:
        self.raw = mapa
        vb = mapa.get("viewbox") or [SVG_W, SVG_H]
        self.viewbox = (float(vb[0]), float(vb[1]))
        self.nacoes: dict[str, dict[str, Any]] = mapa.get("nacoes") or {}
        self.provincias: dict[str, dict[str, Any]] = mapa.get("provincias") or {}

        self.polygons: dict[str, list[tuple[float, float]]] = {}
        self.poly_points_str: dict[str, str] = {}
        self.centers: dict[str, tuple[float, float]] = {}
        self.areas: dict[str, float] = {}

        all_xs: list[float] = []
        all_ys: list[float] = []

        for pid, pinfo in self.provincias.items():
            raw_poly = pinfo.get("poligono") or []
            pts = [(float(pt[0]), float(pt[1])) for pt in raw_poly if len(pt) >= 2]
            self.polygons[pid] = pts
            self.poly_points_str[pid] = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            self.areas[pid] = max(10.0, polygon_area(pts))

            for x, y in pts:
                all_xs.append(x)
                all_ys.append(y)

            c = pinfo.get("centro")
            if c and len(c) >= 2:
                self.centers[pid] = (float(c[0]), float(c[1]))
            else:
                self.centers[pid] = polygon_centroid(pts)

        mb = mapa.get("map_bounds")
        if mb and len(mb) >= 4:
            self.map_bounds = (float(mb[0]), float(mb[1]), float(mb[2]), float(mb[3]))
        elif all_xs and all_ys:
            self.map_bounds = (min(all_xs), min(all_ys), max(all_xs), max(all_ys))
        else:
            self.map_bounds = (90.0, 95.0, 1420.0, 1030.0)

        self.sa_cx = (self.map_bounds[0] + self.map_bounds[2]) * 0.5
        self.sa_cy = (self.map_bounds[1] + self.map_bounds[3]) * 0.5

        # Extracao de arestas compartilhadas (costa / interna / internacional)
        edge_map: dict[
            tuple[tuple[float, float], tuple[float, float]],
            dict[str, Any],
        ] = {}
        for pid, pts in self.polygons.items():
            n = len(pts)
            if n < 2:
                continue
            for i in range(n):
                p1 = pts[i]
                p2 = pts[(i + 1) % n]
                q1 = (round(p1[0], 1), round(p1[1], 1))
                q2 = (round(p2[0], 1), round(p2[1], 1))
                if q1 == q2:
                    continue
                key = (q1, q2) if q1 < q2 else (q2, q1)
                entry = edge_map.get(key)
                if entry is None:
                    edge_map[key] = {"p1": p1, "p2": p2, "pids": [pid]}
                else:
                    if pid not in entry["pids"]:
                        entry["pids"].append(pid)

        self.edges: list[dict[str, Any]] = list(edge_map.values())

        # Grafo de adjacencia terrestre a partir de arestas compartilhadas (para blocos conexos)
        self.neighbors: dict[str, set[str]] = {pid: set() for pid in self.provincias}
        for edge in self.edges:
            epids = edge["pids"]
            if len(epids) >= 2:
                for i in range(len(epids)):
                    for j in range(i + 1, len(epids)):
                        a, b = epids[i], epids[j]
                        if a in self.neighbors and b in self.neighbors:
                            self.neighbors[a].add(b)
                            self.neighbors[b].add(a)
        # Fallback discreto se alguma provincia nao compartilhou vertices exatos
        for pid, pinfo in self.provincias.items():
            if self.neighbors.get(pid):
                continue
            cx, cy = self.centers.get(pid, (0.0, 0.0))
            for vid in pinfo.get("vizinhos") or []:
                if vid in self.neighbors and vid != pid and vid in self.centers:
                    vx, vy = self.centers[vid]
                    if math.hypot(vx - cx, vy - cy) <= 220.0:
                        self.neighbors[pid].add(vid)
                        self.neighbors[vid].add(pid)

    def nation_meta(self, nid: str | None) -> dict[str, Any]:
        if not nid:
            return {
                "id": "",
                "nome": "Neutro",
                "ia_apelido": "Neutro",
                "cor": "#475569",
                "cor_borda": "#1e293b",
                "cor_texto": "#ffffff",
                "capital_id": "",
                "bandeira_svg": "",
            }
        m = self.nacoes.get(nid)
        if m:
            return m
        return {
            "id": nid,
            "nome": nid.replace("_", " ").title(),
            "ia_apelido": nid.replace("_", " ").title(),
            "cor": "#64748b",
            "cor_borda": "#1e293b",
            "cor_texto": "#ffffff",
            "capital_id": "",
            "bandeira_svg": "",
        }


def carregar_gravacao(gravacao_dir: str | Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    gdir = Path(gravacao_dir)
    mapa_path = gdir / "mapa.json"
    turnos_path = gdir / "turnos.jsonl"

    if not mapa_path.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {mapa_path}")
    if not turnos_path.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {turnos_path}")

    with mapa_path.open("r", encoding="utf-8") as f:
        mapa = json.load(f)

    turnos: list[dict[str, Any]] = []
    with turnos_path.open("r", encoding="utf-8") as f:
        for line_no, raw in enumerate(f, start=1):
            s = raw.strip()
            if not s:
                continue
            try:
                turnos.append(json.loads(s))
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"JSON invalido em {turnos_path} linha {line_no}: {exc}"
                ) from exc

    if not turnos:
        raise ValueError(f"Nenhum turno encontrado em {turnos_path}")

    return mapa, turnos


# ---------------------------------------------------------------------------
# Camera Continua + Deriva Lenta (Receita AGE v4)
# ---------------------------------------------------------------------------


def _event_point(
    ev: dict[str, Any],
    topo: MapTopology,
) -> tuple[float, float] | None:
    pid = ev.get("provincia")
    if pid and pid in topo.centers:
        return topo.centers[pid]
    ator = ev.get("ator")
    alvo = ev.get("alvo")
    pts: list[tuple[float, float]] = []
    for nid in (ator, alvo):
        if not nid:
            continue
        cap = topo.nation_meta(nid).get("capital_id")
        if cap and cap in topo.centers:
            pts.append(topo.centers[cap])
    if pts:
        return (
            sum(p[0] for p in pts) / len(pts),
            sum(p[1] for p in pts) / len(pts),
        )
    return None


class CameraTrack:
    """
    Calcula foco continuo e suave entre turnos (Receita AGE v4):
    - Em combate/eventos, foca no maior cluster ativo (evitando media no vazio).
    - Interpola entre ancoras de turno com kernel gaussiano continuo.
    - Soma deriva senoidal lenta para eliminar qualquer sensacao de tela parada.
    """

    def __init__(self, topo: MapTopology, turnos: list[dict[str, Any]]) -> None:
        self.topo = topo
        self.anchors: list[tuple[float, float, float]] = []
        for idx, turn in enumerate(turnos):
            self.anchors.append(self._compute_turn_anchor(idx, turn))

    def _compute_turn_anchor(
        self, idx: int, turn: dict[str, Any]
    ) -> tuple[float, float, float]:
        topo = self.topo
        if idx == 0:
            return (topo.sa_cx, topo.sa_cy, 1.02)

        action_pts: list[tuple[float, float, float]] = []

        # 1. Movimentos de combate / invasao
        for mov in turn.get("movimentos") or []:
            de = mov.get("de")
            para = mov.get("para")
            if para not in topo.centers:
                continue
            px, py = topo.centers[para]
            if de in topo.centers:
                dx, dy = topo.centers[de]
                mx = dx * 0.30 + px * 0.70
                my = dy * 0.30 + py * 0.70
            else:
                mx, my = px, py

            tipo = str(mov.get("tipo") or "").lower()
            perdas = float(mov.get("perdas_atk") or 0) + float(mov.get("perdas_def") or 0)
            conq = bool(mov.get("conquistada"))
            if tipo in ("ataque", "invasao", "combate") or perdas > 0 or conq:
                w = 2.2 + min(5.0, perdas / 400.0) + (2.5 if conq else 0.0)
                action_pts.append((mx, my, w))
            elif tipo == "maritimo":
                action_pts.append((mx, my, 1.1))
            elif float(mov.get("qtd") or 0) >= 600:
                action_pts.append((mx, my, 0.5))

        # 2. Provincias marcadas em batalha
        for pid, pstate in (turn.get("provincias") or {}).items():
            if pstate.get("em_batalha") and pid in topo.centers:
                cx, cy = topo.centers[pid]
                action_pts.append((cx, cy, 2.2))

        # 3. Eventos diplomaticos fortes
        for ev in turn.get("eventos") or []:
            tipo = str(ev.get("tipo") or "").lower()
            prio = STRONG_EVENT_PRIORITY.get(tipo, 0)
            if prio > 0:
                pt = _event_point(ev, topo)
                if pt is not None:
                    action_pts.append((pt[0], pt[1], 1.5 + prio * 0.9))

        if not action_pts:
            return (topo.sa_cx, topo.sa_cy, 1.04)

        # Receita AGE v4: escolher centro do MAIOR CLUSTER de acao (raio 270px)
        best_weight = -1.0
        best_cx = topo.sa_cx
        best_cy = topo.sa_cy
        radius2 = 270.0 * 270.0
        for x0, y0, _w0 in action_pts:
            w_sum = 0.0
            sx = 0.0
            sy = 0.0
            for x1, y1, w1 in action_pts:
                if (x1 - x0) ** 2 + (y1 - y0) ** 2 <= radius2:
                    w_sum += w1
                    sx += x1 * w1
                    sy += y1 * w1
            if w_sum > best_weight:
                best_weight = w_sum
                best_cx = sx / max(1e-6, w_sum)
                best_cy = sy / max(1e-6, w_sum)

        # Puxa 22% de volta para o centro continental para manter contexto geografico
        fx = lerp(best_cx, topo.sa_cx, 0.22)
        fy = lerp(best_cy, topo.sa_cy, 0.22)

        # Zoom proporcional a intensidade do cluster (1.14 .. 1.32)
        intensity = clamp((best_weight - 1.5) / 14.0, 0.0, 1.0)
        fz = 1.12 + intensity * 0.19
        return (fx, fy, fz)

    def sample(self, turno_idx: int, t_anim: float) -> tuple[float, float, float]:
        """Retorna (tx, ty, zoom) para `<g transform="translate(tx, ty) scale(zoom)">`."""
        n = len(self.anchors)
        if n == 0:
            cam_x, cam_y, zoom = self.topo.sa_cx, self.topo.sa_cy, 1.02
        elif n == 1:
            cam_x, cam_y, zoom = self.anchors[0]
        else:
            # Tempo continuo: t_anim=0.5 representa o centro do turno
            u = float(turno_idx) + clamp(t_anim, 0.0, 1.0) - 0.5
            u = clamp(u, 0.0, float(n - 1))

            # Media gaussiana continua no tempo (sigma = 0.62 turnos)
            sigma = 0.62
            inv2s2 = 0.5 / (sigma * sigma)
            sx = 0.0
            sy = 0.0
            sz = 0.0
            sw = 0.0
            lo = max(0, int(math.floor(u)) - 2)
            hi = min(n - 1, int(math.ceil(u)) + 2)
            for i in range(lo, hi + 1):
                d = u - float(i)
                w = math.exp(-(d * d) * inv2s2)
                # No turno 0, mantem visao panoramica da America do Sul mais firme
                if i == 0 and u < 0.45:
                    w *= 2.2
                ax, ay, az = self.anchors[i]
                sx += ax * w
                sy += ay * w
                sz += az * w
                sw += w
            cam_x = sx / max(1e-6, sw)
            cam_y = sy / max(1e-6, sw)
            zoom = sz / max(1e-6, sw)

        # Deriva senoidal lenta (Receita AGE v4)
        phase = float(turno_idx) + clamp(t_anim, 0.0, 1.0)
        drift_x = 12.0 * math.sin(phase * 1.05 + 0.35)
        drift_y = 9.0 * math.cos(phase * 0.78 + 1.15)
        drift_z = 0.018 * math.sin(phase * 0.65 + 0.20)

        zoom = clamp(zoom + drift_z, 1.00, 1.34)
        cam_x += drift_x
        cam_y += drift_y

        # Protecao de bordas: nunca cortar demais o continente
        bx0, by0, bx1, by1 = self.topo.map_bounds
        pad_x = 190.0 / zoom
        pad_y = 165.0 / zoom
        min_cx = min(self.topo.sa_cx, bx0 + pad_x)
        max_cx = max(self.topo.sa_cx, bx1 - pad_x)
        min_cy = min(self.topo.sa_cy, by0 + pad_y)
        max_cy = max(self.topo.sa_cy, by1 - pad_y)

        # Com zoom proximo a 1.0, limita ainda mais o deslocamento para nao vazar bordas
        zoom_factor = clamp((zoom - 1.0) / 0.30, 0.0, 1.0)
        cam_x = lerp(self.topo.sa_cx, clamp(cam_x, min_cx, max_cx), 0.35 + 0.65 * zoom_factor)
        cam_y = lerp(self.topo.sa_cy, clamp(cam_y, min_cy, max_cy), 0.35 + 0.65 * zoom_factor)

        tx = VIEWPORT_CENTER_X - cam_x * zoom
        ty = VIEWPORT_CENTER_Y - cam_y * zoom
        return (tx, ty, zoom)


# ---------------------------------------------------------------------------
# Normalizacao de Estado por Turno e Feed Acumulado
# ---------------------------------------------------------------------------


def _nation_display(
    nid: str,
    topo: MapTopology,
    turn_nacoes: dict[str, Any],
) -> tuple[str, str, str]:
    """Retorna (ia_apelido, nome_pais, cor)."""
    m = topo.nation_meta(nid)
    t = turn_nacoes.get(nid) or {}
    nome = clean_text(t.get("nome") or m.get("nome") or nid)
    ia = clean_text(t.get("ia_apelido") or m.get("ia_apelido") or nome)
    cor = t.get("cor") or m.get("cor") or "#64748b"
    return ia, nome, cor


def _extract_wars(turn: dict[str, Any]) -> tuple[set[frozenset[str]], dict[str, set[str]]]:
    """Retorna (pares_em_guerra, mapa_guerreando_com)."""
    war_pairs: set[frozenset[str]] = set()
    by_nation: dict[str, set[str]] = {}

    for rel in turn.get("relacoes") or []:
        if str(rel.get("tipo") or "").lower() == "guerra":
            a = rel.get("a")
            b = rel.get("b")
            if a and b and a != b:
                war_pairs.add(frozenset((a, b)))
                by_nation.setdefault(a, set()).add(b)
                by_nation.setdefault(b, set()).add(a)

    for nid, ninfo in (turn.get("nacoes") or {}).items():
        for enemy in ninfo.get("guerreando_com") or []:
            if enemy and enemy != nid:
                war_pairs.add(frozenset((nid, enemy)))
                by_nation.setdefault(nid, set()).add(enemy)
                by_nation.setdefault(enemy, set()).add(nid)

    return war_pairs, by_nation


def _build_ranking(
    topo: MapTopology,
    turn: dict[str, Any],
    war_by_nation: dict[str, set[str]],
) -> list[dict[str, Any]]:
    """Monta lista ordenada das nacoes vivas e eliminadas para o HUD."""
    turn_nacoes = turn.get("nacoes") or {}
    turn_provs = turn.get("provincias") or {}

    prov_counts: dict[str, int] = {}
    troop_sums: dict[str, int] = {}
    for pid, pinfo in topo.provincias.items():
        ps = turn_provs.get(pid) or {}
        dono = ps.get("dono") or pinfo.get("pais_inicial") or ""
        if dono:
            prov_counts[dono] = prov_counts.get(dono, 0) + 1
            troop_sums[dono] = troop_sums.get(dono, 0) + int(round(float(ps.get("tropas") or 0)))

    all_nids = list(dict.fromkeys(list(topo.nacoes.keys()) + list(turn_nacoes.keys())))
    rows: list[dict[str, Any]] = []
    for nid in all_nids:
        tinfo = turn_nacoes.get(nid) or {}
        ia, nome, cor = _nation_display(nid, topo, turn_nacoes)

        raw_p = tinfo.get("provincias")
        if isinstance(raw_p, list):
            pcount = len(raw_p)
        elif raw_p is not None:
            pcount = int(raw_p)
        else:
            pcount = prov_counts.get(nid, 0)

        tropas = (
            int(round(float(tinfo["tropas_total"])))
            if tinfo.get("tropas_total") is not None
            else troop_sums.get(nid, 0)
        )
        viva = bool(tinfo.get("viva", pcount > 0)) and pcount > 0
        pont = float(tinfo.get("pontuacao") or (pcount * 100 + tropas * 0.05))
        em_guerra = viva and bool(war_by_nation.get(nid))

        rows.append(
            {
                "id": nid,
                "ia": ia,
                "nome": nome,
                "cor": cor,
                "provincias": pcount,
                "tropas": tropas,
                "viva": viva,
                "pontuacao": pont,
                "em_guerra": em_guerra,
            }
        )

    rows.sort(key=lambda r: (1 if r["viva"] else 0, r["provincias"], r["tropas"], r["pontuacao"]), reverse=True)
    return rows


def build_event_history(
    topo: MapTopology, turnos: list[dict[str, Any]]
) -> list[list[dict[str, Any]]]:
    """Pre-calcula para cada turno os eventos acumulados ate aquele turno."""
    history: list[list[dict[str, Any]]] = []
    acc: list[dict[str, Any]] = []

    for idx, turn in enumerate(turnos):
        t_num = int(turn.get("turno", idx))
        turn_nacoes = turn.get("nacoes") or {}
        evs = turn.get("eventos") or []

        if idx == 0 and not evs:
            nacoes = turn_nacoes or topo.nacoes
            acc.append(
                {
                    "turno": t_num,
                    "tipo": "pna",
                    "titulo": "INICIO DA PARTIDA",
                    "descricao": f"{len(nacoes)} IAs assumem o comando das nacoes da America do Sul.",
                }
            )

        for ev in evs:
            tipo = str(ev.get("tipo") or "batalha").lower()
            titulo = clean_text(ev.get("titulo") or EVENT_STYLE.get(tipo, {}).get("tag", tipo.upper()))
            desc = clean_text(ev.get("descricao") or "")
            if not desc:
                ator = ev.get("ator")
                alvo = ev.get("alvo")
                ia_a, nom_a, _ = _nation_display(ator, topo, turn_nacoes) if ator else ("", "", "")
                ia_b, nom_b, _ = _nation_display(alvo, topo, turn_nacoes) if alvo else ("", "", "")
                if ator and alvo:
                    desc = f"{ia_a} ({nom_a}) vs {ia_b} ({nom_b})"
                elif ator:
                    desc = f"{ia_a} ({nom_a}): {titulo}"
                else:
                    desc = titulo
            acc.append(
                {
                    "turno": t_num,
                    "tipo": tipo,
                    "titulo": titulo,
                    "descricao": desc,
                }
            )

        # Se houve conquistas importantes sem evento explicito, resume 1 conquista pro feed
        if not evs:
            conqs = [m for m in (turn.get("movimentos") or []) if m.get("conquistada")]
            if conqs:
                top_m = max(
                    conqs,
                    key=lambda m: float(m.get("perdas_atk") or 0) + float(m.get("perdas_def") or 0) + float(m.get("qtd") or 0),
                )
                pais = top_m.get("pais") or ""
                para = top_m.get("para") or ""
                ia_a, nom_a, _ = _nation_display(pais, topo, turn_nacoes)
                pnome = clean_text((topo.provincias.get(para) or {}).get("nome") or para)
                acc.append(
                    {
                        "turno": t_num,
                        "tipo": "conquista",
                        "titulo": "CONQUISTA",
                        "descricao": f"{ia_a} ({nom_a}) tomou {pnome}.",
                    }
                )

        history.append(list(acc))

    return history


def _pick_strong_event(turn: dict[str, Any]) -> dict[str, Any] | None:
    best: dict[str, Any] | None = None
    best_prio = 0
    for ev in turn.get("eventos") or []:
        tipo = str(ev.get("tipo") or "").lower()
        prio = STRONG_EVENT_PRIORITY.get(tipo, 0)
        if prio > best_prio:
            best_prio = prio
            best = ev
    return best


def _pick_speech_card(
    topo: MapTopology,
    turn: dict[str, Any],
    t_anim: float,
    force_mode: str | None = None,
) -> tuple[dict[str, Any] | None, float]:
    """
    Seleciona qual cartao de `pensamento` ou `fala` exibir no momento `t_anim`.
    Retorna `(card_dict | None, slot_progress 0..1)`.
    """
    decisoes = turn.get("decisoes") or {}
    if not decisoes:
        return None, 0.0

    # Pontua protagonismo das nacoes neste turno
    scores: dict[str, float] = {}
    t_num = int(turn.get("turno", 0))
    for i, nid in enumerate(decisoes.keys()):
        # Rotacao deterministica suave entre turnos
        scores[nid] = 0.2 * ((i + t_num) % max(1, len(decisoes)))

    for ev in turn.get("eventos") or []:
        prio = STRONG_EVENT_PRIORITY.get(str(ev.get("tipo") or "").lower(), 1)
        for key in ("ator", "alvo"):
            nid = ev.get(key)
            if nid in scores:
                scores[nid] += 3.0 + prio * 2.5

    for mov in turn.get("movimentos") or []:
        pais = mov.get("pais")
        if pais in scores:
            perdas = float(mov.get("perdas_atk") or 0) + float(mov.get("perdas_def") or 0)
            scores[pais] += 1.5 + (2.0 if mov.get("conquistada") else 0.0) + min(3.0, perdas / 500.0)

    ranked_nids = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)

    # Se modo forcado (ex: sample_04 pensamento secreto)
    if force_mode in ("pensamento", "fala"):
        for nid in ranked_nids:
            d = decisoes.get(nid) or {}
            txt = clean_text(d.get(force_mode) or "")
            if txt:
                return {"nid": nid, "modo": force_mode, "texto": txt}, 0.5
        return None, 0.0

    # Monta ate 2 slots bem legiveis no turno: 1o pensamento secreto, 2o fala publica
    slots: list[dict[str, Any]] = []
    for nid in ranked_nids:
        d = decisoes.get(nid) or {}
        pens = clean_text(d.get("pensamento") or "")
        fala = clean_text(d.get("fala") or "")
        if pens and not any(s["modo"] == "pensamento" for s in slots):
            slots.append({"nid": nid, "modo": "pensamento", "texto": pens})
        if fala and len(slots) < 2 and not any(s["modo"] == "fala" for s in slots):
            slots.append({"nid": nid, "modo": "fala", "texto": fala})
        if len(slots) >= 2:
            break

    # Se so houver um tipo disponivel, tenta completar com segunda nacao
    if len(slots) < 2:
        for nid in ranked_nids:
            d = decisoes.get(nid) or {}
            for modo in ("pensamento", "fala"):
                txt = clean_text(d.get(modo) or "")
                if txt and not any(s["nid"] == nid and s["modo"] == modo for s in slots):
                    slots.append({"nid": nid, "modo": modo, "texto": txt})
                    break
            if len(slots) >= 2:
                break

    if not slots:
        return None, 0.0

    if len(slots) == 1:
        return slots[0], clamp(t_anim, 0.0, 1.0)

    if t_anim < 0.5:
        return slots[0], clamp(t_anim / 0.5, 0.0, 1.0)
    return slots[1], clamp((t_anim - 0.5) / 0.5, 0.0, 1.0)


# ---------------------------------------------------------------------------
# Helpers Vetoriais SVG (ZERO EMOJIS!)
# ---------------------------------------------------------------------------


_FLAG_ID_COUNTER = itertools.count(1)


def _render_flag_svg(
    topo: MapTopology,
    nid: str | None,
    x: float,
    y: float,
    w: float,
    h: float,
    border_color: str = "#cbd5e1",
) -> str:
    """Renderiza bandeira inline em viewBox="0 0 60 40" com borda e brilho sutil."""
    uid = next(_FLAG_ID_COUNTER)

    meta = topo.nation_meta(nid)
    raw = (meta.get("bandeira_svg") or "").strip()
    if raw:
        # Remove wrapper <svg> externo se vier embutido
        inner = re.sub(r"^\s*<svg[^>]*>\s*|\s*</svg>\s*$", "", raw, flags=re.I | re.S).strip()
        # Garante unicidade de ids internos se houver defs/clips na bandeira
        if "id=" in inner:
            def _prefix_id(match: re.Match[str]) -> str:
                return f'id="flg{uid}_{match.group(1)}"'

            inner = re.sub(r'id="([^"]+)"', _prefix_id, inner)
            inner = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#flg{uid}_{m.group(1)})', inner)
            inner = re.sub(r'href="#([^"]+)"', lambda m: f'href="#flg{uid}_{m.group(1)}"', inner)
    else:
        c1 = meta.get("cor") or "#3b82f6"
        c2 = meta.get("cor_borda") or "#0f172a"
        inner = (
            f'<rect x="0" y="0" width="60" height="40" fill="{esc(c1)}"/>'
            f'<rect x="0" y="0" width="60" height="12" fill="{esc(c2)}" opacity="0.55"/>'
            f'<polygon points="30,11 33,19 41,19 34.5,24 37,32 30,27 23,32 25.5,24 19,19 27,19" '
            f'fill="#f8fafc" opacity="0.9"/>'
        )

    return (
        f'<g>'
        f'<svg x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
        f'viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice">'
        f"{inner}"
        f'<rect x="0" y="0" width="60" height="40" fill="url(#flag-gloss)" opacity="0.35"/>'
        f"</svg>"
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="2" '
        f'fill="none" stroke="{esc(border_color)}" stroke-width="1.2" opacity="0.85"/>'
        f"</g>"
    )


def _icon_capital_star(cx: float, cy: float, r_outer: float = 8.5) -> str:
    r_inner = r_outer * 0.44
    pts: list[str] = []
    for i in range(10):
        ang = -math.pi * 0.5 + i * math.pi / 5.0
        r = r_outer if i % 2 == 0 else r_inner
        pts.append(f"{cx + r * math.cos(ang):.1f},{cy + r * math.sin(ang):.1f}")
    return (
        f'<g>'
        f'<polygon points="{" ".join(pts)}" fill="#fbbf24" stroke="#78350f" '
        f'stroke-width="1.3" stroke-linejoin="round"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r_outer * 0.22:.1f}" fill="#fef08a"/>'
        f"</g>"
    )


def _icon_fortress(cx: float, cy: float, scale: float = 1.0) -> str:
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        f'<path d="M-7,7 L-7,-3 L-5,-3 L-5,-7 L-2.5,-7 L-2.5,-4 L-1,-4 L-1,-7 '
        f'L1,-7 L1,-4 L2.5,-4 L2.5,-7 L5,-7 L5,-3 L7,-3 L7,7 Z" '
        f'fill="#cbd5e1" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round"/>'
        f'<path d="M-2.2,7 L-2.2,2.2 A2.2,2.2 0 0,1 2.2,2.2 L2.2,7 Z" fill="#1e293b"/>'
        f'<rect x="-5" y="-1" width="2" height="2.4" fill="#334155"/>'
        f'<rect x="3" y="-1" width="2" height="2.4" fill="#334155"/>'
        f"</g>"
    )


def _icon_anchor(cx: float, cy: float, scale: float = 1.0) -> str:
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        f'<circle cx="0" cy="-6" r="2.3" fill="none" stroke="#7dd3fc" stroke-width="1.7"/>'
        f'<line x1="0" y1="-3.7" x2="0" y2="6.2" stroke="#7dd3fc" stroke-width="1.9" stroke-linecap="round"/>'
        f'<line x1="-4.5" y1="-1.5" x2="4.5" y2="-1.5" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round"/>'
        f'<path d="M-6.2,2.2 C-5.5,6.8 -2.2,7.2 0,6.5 C2.2,7.2 5.5,6.8 6.2,2.2" '
        f'fill="none" stroke="#7dd3fc" stroke-width="1.9" stroke-linecap="round"/>'
        f'<polygon points="-7.6,2.8 -5.8,0.4 -4.5,3.2" fill="#e0f2fe"/>'
        f'<polygon points="7.6,2.8 5.8,0.4 4.5,3.2" fill="#e0f2fe"/>'
        f"</g>"
    )


def _icon_crossed_swords(
    cx: float,
    cy: float,
    scale: float = 1.0,
    pulse_phase: float = 0.0,
    with_ring: bool = True,
) -> str:
    parts: list[str] = []
    if with_ring:
        pulse = 0.5 + 0.5 * math.sin(pulse_phase * math.tau)
        r1 = 13.5 + pulse * 5.0
        r2 = 17.5 + pulse * 8.5
        op1 = 0.85 - pulse * 0.35
        op2 = 0.55 - pulse * 0.40
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r2:.1f}" fill="none" '
            f'stroke="#ef4444" stroke-width="2.0" opacity="{op2:.2f}"/>'
        )
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r1:.1f}" fill="#7f1d1d" '
            f'fill-opacity="0.30" stroke="#f87171" stroke-width="2.2" opacity="{op1:.2f}"/>'
        )
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="11.5" fill="#180a10" '
            f'stroke="#ef4444" stroke-width="1.8"/>'
        )

    parts.append(
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        # Lamina 1 (esq-baixo -> dir-cima)
        f'<line x1="-6.5" y1="6.5" x2="6.8" y2="-6.8" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round"/>'
        f'<line x1="-6.0" y1="2.2" x2="-2.2" y2="6.0" stroke="#fbbf24" stroke-width="2.3" stroke-linecap="round"/>'
        f'<circle cx="-7.2" cy="7.2" r="1.5" fill="#fbbf24"/>'
        # Lamina 2 (dir-baixo -> esq-cima)
        f'<line x1="6.5" y1="6.5" x2="-6.8" y2="-6.8" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round"/>'
        f'<line x1="6.0" y1="2.2" x2="2.2" y2="6.0" stroke="#fbbf24" stroke-width="2.3" stroke-linecap="round"/>'
        f'<circle cx="7.2" cy="7.2" r="1.5" fill="#fbbf24"/>'
        f"</g>"
    )
    return "".join(parts)


def _icon_diplomacy_emblem(tipo: str, cx: float, cy: float, cor: str) -> str:
    """Icone vetorial central para o Pop-up Diplomatico (zero emoji)."""
    if tipo == "guerra":
        return _icon_crossed_swords(cx, cy, scale=1.35, with_ring=False)
    if tipo == "traicao":
        # Escudo partido ao meio + adaga
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<path d="M-2,-13 L-12,-9 L-12,1 C-12,8 -6,13 -2,15 L-4,2 L-1,-3 Z" '
            f'fill="#3b0764" stroke="{esc(cor)}" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M3,-13 L13,-9 L13,1 C13,8 7,13 2,15 L5,1 L1,-4 Z" '
            f'fill="#581c87" stroke="#f0abfc" stroke-width="1.8" stroke-linejoin="round"/>'
            f'<path d="M-1,-16 L3,-3 L-3,2 L2,17" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round"/>'
            f"</g>"
        )
    if tipo == "ultimato":
        # Pergaminho selado com aviso
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<rect x="-12" y="-12" width="24" height="24" rx="4" fill="#291b06" stroke="#f59e0b" stroke-width="2"/>'
            f'<line x1="0" y1="-7" x2="0" y2="2" stroke="#fef08a" stroke-width="3.2" stroke-linecap="round"/>'
            f'<circle cx="0" cy="7.2" r="2.0" fill="#fef08a"/>'
            f"</g>"
        )
    if tipo == "paz":
        # Escudo com ramo / check diplomatico
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#34d399" stroke-width="2"/>'
            f'<path d="M-6,1 L-1.5,5.5 L7,-5" fill="none" stroke="#ecfdf5" stroke-width="2.8" '
            f'stroke-linecap="round" stroke-linejoin="round"/>'
            f"</g>"
        )
    # eliminacao / padrao: coroa partida
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<polygon points="-13,8 -15,-6 -6,1 0,-10 6,1 15,-6 13,8" '
        f'fill="#431407" stroke="#fb923c" stroke-width="2" stroke-linejoin="round"/>'
        f'<line x1="-14" y1="11" x2="14" y2="-11" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round"/>'
        f"</g>"
    )


def _icon_gold_crown(cx: float, cy: float, scale: float = 1.0) -> str:
    """Coroa vetorial dourada para o #1 do Ranking (zero emoji)."""
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        f'<path d="M-9.5,5.5 L-11.0,-4.2 L-5.2,0.5 L0.0,-6.8 L5.2,0.5 L11.0,-4.2 L9.5,5.5 Z" '
        f'fill="url(#gold-crown-grad)" stroke="#78350f" stroke-width="1.3" stroke-linejoin="round"/>'
        f'<rect x="-9.2" y="3.8" width="18.4" height="2.4" rx="1.0" fill="#b45309" stroke="#78350f" stroke-width="0.8"/>'
        f'<circle cx="-11.0" cy="-4.8" r="1.4" fill="#fef08a"/>'
        f'<circle cx="0.0" cy="-7.4" r="1.7" fill="#fef9c3"/>'
        f'<circle cx="11.0" cy="-4.8" r="1.4" fill="#fef08a"/>'
        f'<circle cx="0.0" cy="2.2" r="1.2" fill="#ef4444"/>'
        f"</g>"
    )


def _icon_thought_bubble(cx: float, cy: float, scale: float = 1.0) -> str:
    """Icone vetorial de pensamento secreto (nuvem de pensamento, zero emoji)."""
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        f'<path d="M-6.5,2.5 C-9.2,2.5 -10.5,0.2 -9.0,-2.0 C-9.2,-5.0 -6.2,-7.0 -3.2,-6.0 '
        f'C-1.5,-8.5 3.0,-8.5 4.8,-5.8 C7.8,-6.0 9.8,-3.5 9.0,-0.8 '
        f'C10.2,1.2 8.6,3.0 6.2,2.8 L-6.5,2.5 Z" '
        f'fill="#e9d5ff" fill-opacity="0.22" stroke="#f3e8ff" stroke-width="1.5" stroke-linejoin="round"/>'
        f'<circle cx="-5.5" cy="5.8" r="1.6" fill="#e9d5ff"/>'
        f'<circle cx="-8.2" cy="8.2" r="1.0" fill="#d8b4fe"/>'
        f"</g>"
    )


def _icon_sound_waves(cx: float, cy: float, scale: float = 1.0) -> str:
    """Icone vetorial de fala publica (alto-falante com ondas sonoras, zero emoji)."""
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.2f})">'
        f'<polygon points="-8.5,-3.2 -3.8,-3.2 2.2,-7.5 2.2,7.5 -3.8,3.2 -8.5,3.2" '
        f'fill="#f8fafc" stroke="#f8fafc" stroke-width="0.6" stroke-linejoin="round"/>'
        f'<path d="M5.0,-3.8 C7.4,-1.8 7.4,1.8 5.0,3.8" fill="none" stroke="#f8fafc" '
        f'stroke-width="1.6" stroke-linecap="round"/>'
        f'<path d="M7.6,-6.2 C11.2,-2.8 11.2,2.8 7.6,6.2" fill="none" stroke="#e2e8f0" '
        f'stroke-width="1.5" stroke-linecap="round" opacity="0.82"/>'
        f"</g>"
    )


def _icon_compass_rose(cx: float, cy: float, r: float = 46.0) -> str:
    """Rosa dos ventos cartografica minimalista no oceano."""
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})" opacity="0.34">'
        f'<circle cx="0" cy="0" r="{r:.1f}" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4,4"/>'
        f'<circle cx="0" cy="0" r="{r * 0.72:.1f}" fill="none" stroke="#60a5fa" stroke-width="0.9"/>'
        f'<polygon points="0,{-r:.1f} 6,-8 0,-12" fill="#93c5fd"/>'
        f'<polygon points="0,{-r:.1f} -6,-8 0,-12" fill="#1e3a5f"/>'
        f'<polygon points="0,{r:.1f} 6,8 0,12" fill="#1e3a5f"/>'
        f'<polygon points="0,{r:.1f} -6,8 0,12" fill="#60a5fa"/>'
        f'<polygon points="{r:.1f},0 8,6 12,0" fill="#1e3a5f"/>'
        f'<polygon points="{r:.1f},0 8,-6 12,0" fill="#60a5fa"/>'
        f'<polygon points="{-r:.1f},0 -8,6 -12,0" fill="#60a5fa"/>'
        f'<polygon points="{-r:.1f},0 -8,-6 -12,0" fill="#1e3a5f"/>'
        f'<circle cx="0" cy="0" r="3.5" fill="#93c5fd"/>'
        f'<text x="0" y="{-r - 6:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="11" font-weight="700" fill="#93c5fd" letter-spacing="1">N</text>'
        f"</g>"
    )


# ---------------------------------------------------------------------------
# Renderizacao SVG Principal de Um Quadro
# ---------------------------------------------------------------------------


def _svg_defs() -> str:
    return (
        "<defs>"
        # Gradiente do oceano profundo (#102d4f -> #091b33 -> #040c18)
        '<radialGradient id="ocean-grad" cx="44%" cy="48%" r="66%">'
        '<stop offset="0%" stop-color="#102d4f"/>'
        '<stop offset="48%" stop-color="#091b33"/>'
        '<stop offset="100%" stop-color="#040c18"/>'
        "</radialGradient>"
        # Iluminacao cartografica 2.5D suave por provincia (leve brilho no topo-esquerdo)
        '<linearGradient id="map-sheen" x1="0%" y1="0%" x2="100%" y2="100%">'
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>'
        '<stop offset="32%" stop-color="#ffffff" stop-opacity="0.06"/>'
        '<stop offset="62%" stop-color="#000000" stop-opacity="0.00"/>'
        '<stop offset="100%" stop-color="#020617" stop-opacity="0.22"/>'
        "</linearGradient>"
        # Textura vetorial sutil por terreno: montanha (picos vetoriais, opacity=0.22)
        '<pattern id="terrain-montanha" width="34" height="28" patternUnits="userSpaceOnUse">'
        '<g opacity="0.22">'
        '<path d="M2,16 L9,6 L16,16" fill="none" stroke="#0b1320" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M9,6 L12.5,11" fill="none" stroke="#f8fafc" stroke-width="1.0" stroke-linecap="round"/>'
        '<path d="M18,26 L25,16 L32,26" fill="none" stroke="#0b1320" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M25,16 L28.5,21" fill="none" stroke="#f8fafc" stroke-width="0.9" stroke-linecap="round"/>'
        "</g>"
        "</pattern>"
        # Textura vetorial sutil por terreno: floresta (copas discretas, opacity=0.18)
        '<pattern id="terrain-floresta" width="32" height="30" patternUnits="userSpaceOnUse">'
        '<g opacity="0.18">'
        '<path d="M5,13 C5,9.5 7.2,8 9,8 C10.8,8 13,9.5 13,13 Z" fill="#052e16"/>'
        '<circle cx="7.4" cy="10.4" r="2.1" fill="#064e3b"/>'
        '<circle cx="10.6" cy="10.4" r="1.9" fill="#052e16"/>'
        '<line x1="9" y1="13" x2="9" y2="15.2" stroke="#052e16" stroke-width="1.2" stroke-linecap="round"/>'
        '<path d="M6.8,9.8 C8,8.5 10,8.5 11.2,9.8" fill="none" stroke="#dcfce7" stroke-width="0.8" opacity="0.55"/>'
        '<path d="M20.5,24.5 C20.5,21.5 22.4,20 24,20 C25.6,20 27.5,21.5 27.5,24.5 Z" fill="#052e16"/>'
        '<line x1="24" y1="24.5" x2="24" y2="26.5" stroke="#052e16" stroke-width="1.1" stroke-linecap="round"/>'
        "</g>"
        "</pattern>"
        # Textura vetorial sutil por terreno: deserto (ondas de duna finas, opacity=0.18)
        '<pattern id="terrain-deserto" width="36" height="24" patternUnits="userSpaceOnUse">'
        '<g opacity="0.18">'
        '<path d="M0,8 Q9,4 18,8 T36,8" fill="none" stroke="#fef3c7" stroke-width="1.25" stroke-linecap="round"/>'
        '<path d="M0,9.5 Q9,5.5 18,9.5 T36,9.5" fill="none" stroke="#78350f" stroke-width="0.9" stroke-linecap="round" opacity="0.7"/>'
        '<path d="M0,20 Q9,16 18,20 T36,20" fill="none" stroke="#fef3c7" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>'
        "</g>"
        "</pattern>"
        # Gradiente metalico escuro do HUD superior
        '<linearGradient id="hud-top-bg" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#162238"/>'
        '<stop offset="52%" stop-color="#0b1220"/>'
        '<stop offset="100%" stop-color="#060a12"/>'
        "</linearGradient>"
        # Brilho metalico sutil na borda superior do header
        '<linearGradient id="hud-top-shine" x1="0%" y1="0%" x2="100%" y2="0%">'
        '<stop offset="0%" stop-color="#1e3a5f" stop-opacity="0.20"/>'
        '<stop offset="22%" stop-color="#93c5fd" stop-opacity="0.45"/>'
        '<stop offset="50%" stop-color="#fde68a" stop-opacity="0.58"/>'
        '<stop offset="78%" stop-color="#93c5fd" stop-opacity="0.45"/>'
        '<stop offset="100%" stop-color="#1e3a5f" stop-opacity="0.20"/>'
        "</linearGradient>"
        '<linearGradient id="hud-top-bevel" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>'
        '<stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>'
        "</linearGradient>"
        # Separador vertical dourado do header
        '<linearGradient id="gold-divider" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/>'
        '<stop offset="50%" stop-color="#fbbf24" stop-opacity="1.0"/>'
        '<stop offset="100%" stop-color="#b45309" stop-opacity="0.85"/>'
        "</linearGradient>"
        # Coroa dourada do #1 no Ranking
        '<linearGradient id="gold-crown-grad" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#fef08a"/>'
        '<stop offset="55%" stop-color="#fbbf24"/>'
        '<stop offset="100%" stop-color="#d97706"/>'
        "</linearGradient>"
        # Fundo especial do #1 no Ranking
        '<linearGradient id="rank-first-bg" x1="0%" y1="0%" x2="100%" y2="0%">'
        '<stop offset="0%" stop-color="#201a0c"/>'
        '<stop offset="45%" stop-color="#152036"/>'
        '<stop offset="100%" stop-color="#101829"/>'
        "</linearGradient>"
        # Brilho sutil sobre barras de territorio no Ranking
        '<linearGradient id="bar-gloss" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.30"/>'
        '<stop offset="50%" stop-color="#ffffff" stop-opacity="0.0"/>'
        '<stop offset="100%" stop-color="#000000" stop-opacity="0.20"/>'
        "</linearGradient>"
        # Fundos cinematograficos do card de fala / pensamento
        '<linearGradient id="speech-secret-bg" x1="0%" y1="0%" x2="100%" y2="100%">'
        '<stop offset="0%" stop-color="#1c1033"/>'
        '<stop offset="100%" stop-color="#0f081f"/>'
        "</linearGradient>"
        '<linearGradient id="speech-public-bg" x1="0%" y1="0%" x2="100%" y2="100%">'
        '<stop offset="0%" stop-color="#111c32"/>'
        '<stop offset="100%" stop-color="#09101d"/>'
        "</linearGradient>"
        # Brilho sutil de bandeira
        '<linearGradient id="flag-gloss" x1="0%" y1="0%" x2="0%" y2="100%">'
        '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>'
        '<stop offset="45%" stop-color="#ffffff" stop-opacity="0.0"/>'
        '<stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>'
        "</linearGradient>"
        # Padrao diagonal SVG para provincias instaveis (lealdade < 0.55)
        '<pattern id="unrest-hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
        '<line x1="0" y1="0" x2="0" y2="11" stroke="#090d14" stroke-width="3.0" stroke-opacity="0.34"/>'
        '<line x1="5.5" y1="0" x2="5.5" y2="11" stroke="#ef4444" stroke-width="1.6" stroke-opacity="0.28"/>'
        "</pattern>"
        # Padrao diagonal mais intenso (lealdade < 0.38)
        '<pattern id="unrest-hatch-high" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
        '<line x1="0" y1="0" x2="0" y2="9" stroke="#090d14" stroke-width="3.2" stroke-opacity="0.45"/>'
        '<line x1="4.5" y1="0" x2="4.5" y2="9" stroke="#ef4444" stroke-width="2.2" stroke-opacity="0.42"/>'
        "</pattern>"
        # Vinheta sutil sobre o mapa
        '<radialGradient id="screen-vignette" cx="46%" cy="52%" r="68%">'
        '<stop offset="68%" stop-color="#000000" stop-opacity="0.0"/>'
        '<stop offset="100%" stop-color="#02060d" stop-opacity="0.20"/>'
        "</radialGradient>"
        # Vinheta radial cinematografica discreta nas bordas do canvas (aplicada com opacity=0.30)
        '<radialGradient id="canvas-vignette" cx="50%" cy="50%" r="72%">'
        '<stop offset="56%" stop-color="#000000" stop-opacity="0.0"/>'
        '<stop offset="84%" stop-color="#02060d" stop-opacity="0.55"/>'
        '<stop offset="100%" stop-color="#010409" stop-opacity="1.0"/>'
        "</radialGradient>"
        # Clip paths de seguranca para HUD (nunca transbordar texto!)
        '<clipPath id="clip-speech-card"><rect x="36" y="876" width="572" height="172" rx="8"/></clipPath>'
        '<clipPath id="clip-feed-panel"><rect x="1462" y="704" width="426" height="350" rx="6"/></clipPath>'
        '<clipPath id="clip-rank-panel"><rect x="1462" y="126" width="426" height="528" rx="6"/></clipPath>'
        '<clipPath id="clip-top-leader"><rect x="1494" y="12" width="394" height="48" rx="4"/></clipPath>'
        '<clipPath id="clip-victory-banner"><rect x="384" y="94" width="686" height="54" rx="8"/></clipPath>'
        "</defs>"
    )


def _render_ocean_and_grid(topo: MapTopology) -> str:
    """Fundo oceano cartografico + grade elegante lat/lon + Equador/Capricornio + rosa dos ventos."""
    parts: list[str] = []
    # Retangulo amplo para cobrir qualquer pan/zoom da camera sem mostrar bordas
    parts.append('<rect x="-1200" y="-800" width="4400" height="2800" fill="url(#ocean-grad)"/>')

    # Grade cartografica elegante em dois niveis (linhas finas + meridianos/paralelos principais)
    parts.append('<g stroke="#142d4c" stroke-width="0.9" opacity="0.46">')
    for gx in range(-480, 2500, 110):
        parts.append(f'<line x1="{gx}" y1="-600" x2="{gx}" y2="1800"/>')
    for gy in range(-400, 1800, 100):
        parts.append(f'<line x1="-800" y1="{gy}" x2="2600" y2="{gy}"/>')
    parts.append("</g>")

    parts.append('<g stroke="#1f4770" stroke-width="1.15" opacity="0.48">')
    for gx in range(-480, 2500, 220):
        parts.append(f'<line x1="{gx}" y1="-600" x2="{gx}" y2="1800"/>')
    for gy in range(-400, 1800, 200):
        parts.append(f'<line x1="-800" y1="{gy}" x2="2600" y2="{gy}"/>')
    parts.append("</g>")

    # Linhas de referencia cartograficas (Equador e Tropico de Capricornio aproximados)
    bx0, by0, bx1, by1 = topo.map_bounds
    bh = by1 - by0
    eq_y = by0 + bh * 0.19
    cap_y = by0 + bh * 0.54
    parts.append(
        f'<g stroke="#295a8a" stroke-width="1.25" stroke-dasharray="10,7" opacity="0.56">'
        f'<line x1="-400" y1="{eq_y:.1f}" x2="2200" y2="{eq_y:.1f}"/>'
        f'<line x1="-400" y1="{cap_y:.1f}" x2="2200" y2="{cap_y:.1f}"/>'
        f"</g>"
    )
    parts.append(
        f'<g font-family="{FONT_MONO}" font-size="10.5" fill="#4679ad" opacity="0.76">'
        f'<text x="{bx0 - 38:.1f}" y="{eq_y - 5:.1f}">0 DEG EQ</text>'
        f'<text x="{bx0 - 38:.1f}" y="{cap_y - 5:.1f}">23.5 S</text>'
        f"</g>"
    )

    # Rosa dos ventos no Oceano Pacifico Sul (lado inferior esquerdo do mapa)
    compass_x = bx0 + 115.0
    compass_y = by1 - 240.0
    parts.append(_icon_compass_rose(compass_x, compass_y, r=44.0))

    return "".join(parts)


def _render_continent_shadow(topo: MapTopology) -> str:
    """Batimetria costeira em 2 camadas (azul-petroleo) + sombra 2.5D sob o continente."""
    all_polys = [pstr for pstr in topo.poly_points_str.values() if pstr]
    if not all_polys:
        return ""
    poly_tags = "".join(f'<polygon points="{p}"/>' for p in all_polys)

    parts = [
        # Batimetria costeira em 2 camadas (aura/glow azul-petroleo suave abracando a America do Sul)
        f'<g fill="none" stroke="#0d4a6b" stroke-width="46" stroke-linejoin="round" stroke-linecap="round" opacity="0.26">{poly_tags}</g>',
        f'<g fill="none" stroke="#167a9e" stroke-width="20" stroke-linejoin="round" stroke-linecap="round" opacity="0.34">{poly_tags}</g>',
        # Filete luminoso sutil na linha d'agua costeira
        f'<g fill="none" stroke="#38bdf8" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.20">{poly_tags}</g>',
        # Sombra 2.5D suave multicamadas deslocada
        f'<g transform="translate(13,17)" fill="#02060d" stroke="#02060d" stroke-width="14" stroke-linejoin="round" opacity="0.24">{poly_tags}</g>',
        f'<g transform="translate(8,11)" fill="#02060d" stroke="#02060d" stroke-width="8" stroke-linejoin="round" opacity="0.34">{poly_tags}</g>',
        f'<g transform="translate(3.5,5)" fill="#02060d" stroke="#02060d" stroke-width="3" stroke-linejoin="round" opacity="0.44">{poly_tags}</g>',
    ]
    return "".join(parts)


def _effective_owner_and_troops(
    pid: str,
    topo: MapTopology,
    turn: dict[str, Any],
    prev_turn: dict[str, Any] | None,
    t_anim: float,
    conquered_pids: set[str],
) -> tuple[str, int, float, list[str], bool, bool]:
    """
    Retorna `(dono, tropas, lealdade, edificios, em_batalha, flash_conquista)`
    interpolando conquista no instante t_anim >= 0.68 quando houver `prev_turn`.
    """
    pmeta = topo.provincias.get(pid) or {}
    pstate = (turn.get("provincias") or {}).get(pid) or {}
    dono = pstate.get("dono") or pmeta.get("pais_inicial") or ""
    tropas = int(round(float(pstate.get("tropas") or 0)))
    lealdade = float(pstate.get("lealdade") if pstate.get("lealdade") is not None else 1.0)
    edificios = list(pstate.get("edificios") or [])
    em_batalha = bool(pstate.get("em_batalha"))
    flash_conquista = False

    if prev_turn is not None and pid in conquered_pids:
        prev_ps = (prev_turn.get("provincias") or {}).get(pid) or {}
        prev_dono = prev_ps.get("dono") or pmeta.get("pais_inicial") or dono
        if t_anim < 0.68:
            dono = prev_dono
            tropas = int(round(float(prev_ps.get("tropas") if prev_ps.get("tropas") is not None else tropas)))
        else:
            flash_conquista = True

    return dono, tropas, lealdade, edificios, em_batalha, flash_conquista


def _render_provinces_and_borders(
    topo: MapTopology,
    turn: dict[str, Any],
    prev_turn: dict[str, Any] | None,
    t_anim: float,
    war_pairs: set[frozenset[str]],
    battle_pids: set[str],
    conquered_pids: set[str],
) -> tuple[str, dict[str, dict[str, Any]]]:
    """Desenha poligonos das provincias, texturas de terreno, iluminacao 2.5D, hachuras e fronteiras."""
    parts: list[str] = []
    resolved: dict[str, dict[str, Any]] = {}
    turn_nacoes = turn.get("nacoes") or {}

    # 1. Preenchimento das provincias
    for pid, pmeta in topo.provincias.items():
        pstr = topo.poly_points_str.get(pid)
        if not pstr:
            continue
        dono, tropas, lealdade, edificios, em_bat, flash_conq = _effective_owner_and_troops(
            pid, topo, turn, prev_turn, t_anim, conquered_pids
        )
        in_battle = em_bat or (pid in battle_pids)
        resolved[pid] = {
            "dono": dono,
            "tropas": tropas,
            "lealdade": lealdade,
            "edificios": edificios,
            "em_batalha": in_battle,
            "flash_conquista": flash_conq,
        }

        _ia, _nome, base_cor = _nation_display(dono, topo, turn_nacoes)
        terreno = str(pmeta.get("terreno") or "planicie").lower()
        battle_boost = (0.55 + 0.45 * math.sin(t_anim * math.tau * 2.0)) if in_battle else 0.0
        fill_cor = shade_province_color(base_cor, terreno, battle_boost=battle_boost)

        if flash_conq:
            # Pulso brilhante imediato apos a captura da provincia
            k = clamp((t_anim - 0.68) / 0.32, 0.0, 1.0)
            fill_cor = blend_hex(fill_cor, "#ffffff", (1.0 - k) * 0.48)

        # Borda base finissima para eliminar micro-frestas de antialiasing
        parts.append(
            f'<polygon points="{pstr}" fill="{fill_cor}" stroke="{fill_cor}" stroke-width="0.9"/>'
        )
        # Textura vetorial sutil por terreno (automaticamente recortada pelo poligono)
        if terreno in ("montanha", "montanhas", "cordilheira"):
            parts.append(f'<polygon points="{pstr}" fill="url(#terrain-montanha)"/>')
        elif terreno in ("floresta", "florestas", "selva", "amazonia"):
            parts.append(f'<polygon points="{pstr}" fill="url(#terrain-floresta)"/>')
        elif terreno in ("deserto", "arido", "dunas"):
            parts.append(f'<polygon points="{pstr}" fill="url(#terrain-deserto)"/>')

        # Sobreposicao de brilho cartografico 2.5D suave (topo-esquerdo)
        parts.append(f'<polygon points="{pstr}" fill="url(#map-sheen)"/>')

        # Hachura diagonal SVG para baixa lealdade (< 0.55)
        if lealdade < 0.55:
            pat = "url(#unrest-hatch-high)" if lealdade < 0.38 else "url(#unrest-hatch)"
            parts.append(f'<polygon points="{pstr}" fill="{pat}"/>')

        # Brilho rubro sutil na provincia em batalha
        if in_battle:
            pulse = 0.16 + 0.12 * (0.5 + 0.5 * math.sin(t_anim * math.tau * 2.0))
            parts.append(
                f'<polygon points="{pstr}" fill="#ef4444" fill-opacity="{pulse:.2f}"/>'
            )

    # 2. Fronteiras classificadas (internas, costeiras, internacionais, frente de guerra)
    internal_segs: list[str] = []
    coastal_segs: list[str] = []
    intl_segs: list[str] = []
    warfront_segs: list[str] = []

    for edge in topo.edges:
        p1 = edge["p1"]
        p2 = edge["p2"]
        pids = edge["pids"]
        seg = f"M{p1[0]:.1f},{p1[1]:.1f}L{p2[0]:.1f},{p2[1]:.1f}"
        if len(pids) == 1:
            coastal_segs.append(seg)
        else:
            d0 = (resolved.get(pids[0]) or {}).get("dono", "")
            d1 = (resolved.get(pids[1]) or {}).get("dono", "")
            if d0 == d1:
                internal_segs.append(seg)
            else:
                intl_segs.append(seg)
                if d0 and d1 and frozenset((d0, d1)) in war_pairs:
                    warfront_segs.append(seg)

    # Fronteiras internas (mesmo dono): finas e discretas
    if internal_segs:
        parts.append(
            f'<path d="{" ".join(internal_segs)}" fill="none" stroke="#0b1322" '
            f'stroke-width="1.05" stroke-opacity="0.38" stroke-linecap="round"/>'
        )
    # Costa continental nitida com leve relevo 2.5D
    if coastal_segs:
        coastal_d = " ".join(coastal_segs)
        parts.append(
            f'<path d="{coastal_d}" fill="none" stroke="#040914" '
            f'stroke-width="4.4" stroke-opacity="0.34" stroke-linecap="round" stroke-linejoin="round"/>'
        )
        parts.append(
            f'<path d="{coastal_d}" fill="none" stroke="#080e18" '
            f'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
        )
        parts.append(
            f'<path d="{coastal_d}" fill="none" stroke="#7dd3fc" '
            f'stroke-width="0.7" stroke-opacity="0.22" stroke-linecap="round"/>'
        )
    # Fronteiras internacionais bem definidas com halo escuro sutil e filete claro
    if intl_segs:
        intl_d = " ".join(intl_segs)
        parts.append(
            f'<path d="{intl_d}" fill="none" stroke="#040812" '
            f'stroke-width="6.8" stroke-opacity="0.28" stroke-linecap="round" stroke-linejoin="round"/>'
        )
        parts.append(
            f'<path d="{intl_d}" fill="none" stroke="#070c14" '
            f'stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'
        )
        parts.append(
            f'<path d="{intl_d}" fill="none" stroke="#f1f5f9" '
            f'stroke-width="0.9" stroke-opacity="0.32" stroke-linecap="round" stroke-linejoin="round"/>'
        )
    # Linha de frente ativa (paises em guerra): tracejado vermelho sutil
    if warfront_segs:
        dash_off = t_anim * 24.0
        parts.append(
            f'<path d="{" ".join(warfront_segs)}" fill="none" stroke="#ef4444" '
            f'stroke-width="2.0" stroke-dasharray="7,5" stroke-dashoffset="{dash_off:.1f}" '
            f'stroke-opacity="0.88" stroke-linecap="round"/>'
        )

    return "".join(parts), resolved


def _render_nation_watermarks(
    topo: MapTopology,
    turn: dict[str, Any],
    resolved: dict[str, dict[str, Any]],
) -> str:
    """Rotulos cartograficos com halo escuro limpo no maior bloco conexo de cada nacao."""
    by_owner: dict[str, list[str]] = {}
    for pid, rinfo in resolved.items():
        dono = rinfo["dono"]
        if not dono or pid not in topo.centers:
            continue
        by_owner.setdefault(dono, []).append(pid)

    turn_nacoes = turn.get("nacoes") or {}
    parts: list[str] = []
    for nid, owned_pids in by_owner.items():
        owned_set = set(owned_pids)
        # Decompoe em blocos conexos via adjacencia de provincias e escolhe o maior por area
        visited: set[str] = set()
        best_comp: list[str] = []
        best_score = (-1.0, -1)

        for start in owned_pids:
            if start in visited:
                continue
            comp: list[str] = []
            stack = [start]
            visited.add(start)
            while stack:
                cur = stack.pop()
                comp.append(cur)
                for nb in topo.neighbors.get(cur, ()):
                    if nb in owned_set and nb not in visited:
                        visited.add(nb)
                        stack.append(nb)
            comp_area = sum(topo.areas.get(p, 100.0) for p in comp)
            score = (comp_area, len(comp))
            if score > best_score:
                best_score = score
                best_comp = comp

        comp_area = best_score[0]
        if len(best_comp) < 2 and comp_area < 9500.0:
            continue

        tot_a = sum(topo.areas.get(p, 100.0) for p in best_comp)
        wx = sum(topo.centers[p][0] * topo.areas.get(p, 100.0) for p in best_comp) / max(1.0, tot_a)
        wy = sum(topo.centers[p][1] * topo.areas.get(p, 100.0) for p in best_comp) / max(1.0, tot_a)

        # Em territorios curvados, garante que o rotulo permaneca ancorado ao bloco conexo
        nearest_pid = min(
            best_comp,
            key=lambda p: (topo.centers[p][0] - wx) ** 2 + (topo.centers[p][1] - wy) ** 2,
        )
        nx, ny = topo.centers[nearest_pid]
        if math.hypot(nx - wx, ny - wy) > 85.0:
            wx = lerp(wx, nx, 0.55)
            wy = lerp(wy, ny, 0.55)

        # Evita cair exatamente sobre placa de tropas / icone de batalha de uma provincia
        for p in best_comp:
            px, py = topo.centers[p]
            if abs(wx - px) < 34.0 and abs(wy - py) < 15.0:
                in_bat = bool((resolved.get(p) or {}).get("em_batalha"))
                wy = py + (36.0 if in_bat else -22.0)
                break

        _ia, nome, _cor = _nation_display(nid, topo, turn_nacoes)
        nome_up = nome.upper()
        label = esc(nome_up)

        xs = [topo.centers[p][0] for p in best_comp]
        span_x = (max(xs) - min(xs)) + 95.0
        base_fsize = clamp(12.0 + math.sqrt(len(best_comp)) * 4.6, 14.0, 30.0)
        est_char_factor = max(1, len(nome_up)) * 0.78
        max_fit_fsize = max(12.5, (span_x * 1.12) / est_char_factor)
        fsize = clamp(min(base_fsize, max_fit_fsize), 12.5, 30.0)
        letter_sp = clamp(fsize * 0.14, 1.8, 4.0)

        parts.append(
            f'<text x="{wx:.1f}" y="{wy + fsize * 0.32:.1f}" text-anchor="middle" '
            f'font-family="{FONT_SANS}" font-size="{fsize:.1f}" font-weight="800" '
            f'letter-spacing="{letter_sp:.1f}" fill="#ffffff" fill-opacity="0.34" '
            f'stroke="#07111f" stroke-width="5" stroke-opacity="0.62" '
            f'stroke-linejoin="round" paint-order="stroke">{label}</text>'
        )
    return "".join(parts)


def _render_arrows_and_impacts(
    topo: MapTopology,
    turn: dict[str, Any],
    t_anim: float,
) -> str:
    """Setas Bezier animadas de invasao/movimento + explosao de impacto em batalhas."""
    movimentos = turn.get("movimentos") or []
    if not movimentos:
        return ""

    turn_nacoes = turn.get("nacoes") or {}
    parts: list[str] = []
    impacts: list[str] = []

    # Progresso da seta: varre 0.0 -> 0.72 e sustenta no alvo em 0.72 -> 1.0
    p = clamp(ease_out_cubic(min(1.0, t_anim / 0.72)), 0.08, 1.0)

    for idx, mov in enumerate(movimentos):
        de = mov.get("de")
        para = mov.get("para")
        if de not in topo.centers or para not in topo.centers or de == para:
            continue
        x0, y0 = topo.centers[de]
        x2, y2 = topo.centers[para]
        dx = x2 - x0
        dy = y2 - y0
        dist = math.hypot(dx, dy)
        if dist < 4.0:
            continue

        # Curvatura perpendicular suave (alternando sentido para evitar sobreposicao)
        nx = -dy / dist
        ny = dx / dist
        sign = 1.0 if ((idx + hash((de, para))) % 2 == 0) else -1.0
        bend = clamp(dist * 0.17, 16.0, 62.0) * sign
        x1 = (x0 + x2) * 0.5 + nx * bend
        y1 = (y0 + y2) * 0.5 + ny * bend

        # De Casteljau: sub-curva quadratica exata de u=0 ate u=p
        q1x = lerp(x0, x1, p)
        q1y = lerp(y0, y1, p)
        r1x = lerp(x1, x2, p)
        r1y = lerp(y1, y2, p)
        tip_x = lerp(q1x, r1x, p)
        tip_y = lerp(q1y, r1y, p)

        # Tangente exata na ponta (u = p)
        tx = 2.0 * (1.0 - p) * (x1 - x0) + 2.0 * p * (x2 - x1)
        ty = 2.0 * (1.0 - p) * (y1 - y0) + 2.0 * p * (y2 - y1)
        tlen = max(1e-5, math.hypot(tx, ty))
        ux, uy = tx / tlen, ty / tlen
        px_n, py_n = -uy, ux

        tipo = str(mov.get("tipo") or "reforco").lower()
        perdas_atk = int(round(float(mov.get("perdas_atk") or 0)))
        perdas_def = int(round(float(mov.get("perdas_def") or 0)))
        is_combat = (
            tipo in ("ataque", "invasao", "combate")
            or (perdas_atk + perdas_def > 0)
            or bool(mov.get("conquistada"))
        )
        is_sea = tipo in ("maritimo", "naval", "desembarque")
        pais = mov.get("pais") or ""
        _ia, _nome, ncor = _nation_display(pais, topo, turn_nacoes)

        if is_combat and not is_sea:
            stroke_outer = "#7f1d1d"
            stroke_main = "#ef4444"
            stroke_core = "#fbbf24"
            width_main = 6.2
            dash_attr = ""
        elif is_sea:
            stroke_outer = "#083344"
            stroke_main = "#22d3ee"
            stroke_core = "#ecfeff"
            width_main = 5.4
            dash_attr = ' stroke-dasharray="10,6"'
        else:
            stroke_outer = "#0f172a"
            stroke_main = blend_hex(ncor, "#ffffff", 0.35)
            stroke_core = "#ffffff"
            width_main = 4.6
            dash_attr = ""

        # Encurta levemente a haste atras da ponta da seta para encaixe limpo
        head_len = 17.0 if is_combat else 14.0
        head_w = 10.5 if is_combat else 8.5

        path_d = f"M{x0:.1f},{y0:.1f} Q{q1x:.1f},{q1y:.1f} {tip_x:.1f},{tip_y:.1f}"

        # Sombra/contorno escuro da seta
        parts.append(
            f'<path d="{path_d}" fill="none" stroke="{stroke_outer}" '
            f'stroke-width="{width_main + 3.4:.1f}" stroke-linecap="round" opacity="0.72"/>'
        )
        # Corpo principal da seta
        parts.append(
            f'<path d="{path_d}" fill="none" stroke="{stroke_main}" '
            f'stroke-width="{width_main:.1f}" stroke-linecap="round"{dash_attr} opacity="0.95"/>'
        )
        # Filete luminoso interno
        parts.append(
            f'<path d="{path_d}" fill="none" stroke="{stroke_core}" '
            f'stroke-width="{max(1.5, width_main * 0.32):.1f}" stroke-linecap="round" opacity="0.88"/>'
        )

        # Ponta de seta orientada pela tangente
        base_x = tip_x - ux * head_len
        base_y = tip_y - uy * head_len
        left_x = base_x + px_n * head_w
        left_y = base_y + py_n * head_w
        right_x = base_x - px_n * head_w
        right_y = base_y - py_n * head_w
        tip_ext_x = tip_x + ux * 3.5
        tip_ext_y = tip_y + uy * 3.5
        parts.append(
            f'<polygon points="{tip_ext_x:.1f},{tip_ext_y:.1f} {left_x:.1f},{left_y:.1f} '
            f'{base_x + ux * 3.2:.1f},{base_y + uy * 3.2:.1f} {right_x:.1f},{right_y:.1f}" '
            f'fill="{stroke_core if is_combat else stroke_main}" stroke="{stroke_outer}" '
            f'stroke-width="1.6" stroke-linejoin="round"/>'
        )

        # Marcador compacto da quantidade de tropas movidas sobre o meio da seta
        qtd = int(round(float(mov.get("qtd") or 0)))
        if qtd > 0 and p > 0.32:
            um = p * 0.52
            mx = (1 - um) ** 2 * x0 + 2 * (1 - um) * um * x1 + um ** 2 * x2
            my = (1 - um) ** 2 * y0 + 2 * (1 - um) * um * y1 + um ** 2 * y2
            qtxt = fmt_troops(qtd)
            qw = max(30.0, len(qtxt) * 7.2 + 12.0)
            parts.append(
                f'<g>'
                f'<rect x="{mx - qw * 0.5:.1f}" y="{my - 9.5:.1f}" width="{qw:.1f}" height="17" rx="4" '
                f'fill="#090f1a" fill-opacity="0.88" stroke="{stroke_main}" stroke-width="1.2"/>'
                f'<text x="{mx:.1f}" y="{my + 2.8:.1f}" text-anchor="middle" '
                f'font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="#f8fafc">{esc(qtxt)}</text>'
                f"</g>"
            )

        # Explosao / anel de impacto quando t_anim > 0.65 em batalhas (sem texto sobreposto!)
        if is_combat and t_anim > 0.65:
            k = clamp((t_anim - 0.65) / 0.35, 0.0, 1.0)
            r_ring = 12.0 + ease_out_cubic(k) * 34.0
            r_inner = 6.0 + ease_out_cubic(k) * 20.0
            op = clamp(1.0 - k * 0.85, 0.12, 1.0)
            imp_y = y2 - 18.0
            burst_rays: list[str] = []
            for ri in range(8):
                ang = ri * (math.pi / 4.0) + 0.2
                r_a = 8.0 + k * 14.0
                r_b = 18.0 + k * 24.0
                burst_rays.append(
                    f'<line x1="{x2 + math.cos(ang) * r_a:.1f}" y1="{imp_y + math.sin(ang) * r_a:.1f}" '
                    f'x2="{x2 + math.cos(ang) * r_b:.1f}" y2="{imp_y + math.sin(ang) * r_b:.1f}" '
                    f'stroke="#fde047" stroke-width="{2.6 * (1.0 - k * 0.6):.1f}" stroke-linecap="round" '
                    f'opacity="{op:.2f}"/>'
                )
            impacts.append(
                f'<g>'
                f'<circle cx="{x2:.1f}" cy="{imp_y:.1f}" r="{r_ring:.1f}" fill="none" '
                f'stroke="#ef4444" stroke-width="{3.8 * (1.0 - k * 0.5):.1f}" opacity="{op:.2f}"/>'
                f'<circle cx="{x2:.1f}" cy="{imp_y:.1f}" r="{r_inner:.1f}" fill="#fbbf24" '
                f'fill-opacity="{op * 0.32:.2f}" stroke="#fef08a" stroke-width="2.0" opacity="{op:.2f}"/>'
                f'{"".join(burst_rays)}'
                f"</g>"
            )
            if mov.get("conquistada"):
                impacts.append(
                    f'<circle cx="{x2:.1f}" cy="{imp_y:.1f}" r="{r_ring + 7.0:.1f}" fill="none" '
                    f'stroke="{esc(ncor)}" stroke-width="2.8" stroke-dasharray="8,4" opacity="{op:.2f}"/>'
                )

    return "".join(parts) + "".join(impacts)


def _render_troop_badges_and_icons(
    topo: MapTopology,
    turn: dict[str, Any],
    resolved: dict[str, dict[str, Any]],
    t_anim: float,
    battle_losses: dict[str, int] | None = None,
) -> str:
    """Placas de tropas estilo AoH2 + estrela de capital + fortaleza + porto + combate sem sobreposicao."""
    turn_nacoes = turn.get("nacoes") or {}
    losses_map = battle_losses or {}
    parts: list[str] = []

    # Capitais ativas pertencentes as suas respectivas nacoes
    active_capitals: set[str] = set()
    for nid, nmeta in topo.nacoes.items():
        cap = nmeta.get("capital_id")
        if cap and (resolved.get(cap) or {}).get("dono") == nid:
            active_capitals.add(cap)

    for pid, pmeta in topo.provincias.items():
        if pid not in topo.centers or pid not in resolved:
            continue
        cx, cy = topo.centers[pid]
        rinfo = resolved[pid]
        dono = rinfo["dono"]
        tropas = rinfo["tropas"]
        edificios = set(str(e).lower() for e in rinfo["edificios"])
        em_batalha = bool(rinfo["em_batalha"])
        _ia, _nome, ncor = _nation_display(dono, topo, turn_nacoes)

        is_capital = (pid in active_capitals) or (
            bool(pmeta.get("capital")) and dono == pmeta.get("pais_inicial")
        )

        # Em combate, desloca a placa de tropas para (cx, cy + 16) e espadas para (cx, cy - 18)
        badge_cy = cy + 16.0 if em_batalha else cy
        badge_w = 0.0
        badge_h = 20.0

        # 1. Placa de tropas estilo AoH2
        if tropas > 0:
            t_str = fmt_troops(tropas)
            badge_w = max(40.0, len(t_str) * 7.8 + 18.0)
            bx = cx - badge_w * 0.5
            by = badge_cy - badge_h * 0.5
            border_c = "#ef4444" if em_batalha else "#334766"
            parts.append(
                f'<g>'
                f'<rect x="{bx:.1f}" y="{by:.1f}" width="{badge_w:.1f}" height="{badge_h:.1f}" rx="4" '
                f'fill="#0d131f" fill-opacity="0.90" stroke="{border_c}" stroke-width="1.25"/>'
                # Filete lateral na cor da nacao
                f'<rect x="{bx + 1.0:.1f}" y="{by + 1.2:.1f}" width="5.2" height="{badge_h - 2.4:.1f}" '
                f'rx="2.2" fill="{esc(ncor)}"/>'
                f'<text x="{bx + 7.5 + (badge_w - 8.5) * 0.5:.1f}" y="{badge_cy + 4.2:.1f}" '
                f'text-anchor="middle" font-family="{FONT_MONO}" font-size="12" font-weight="700" '
                f'fill="#f8fafc">{esc(t_str)}</text>'
                f"</g>"
            )

        # Coordenadas de ancoragem para icones sem sobrepor a placa nem o emblema de combate
        half_w = badge_w * 0.5 if badge_w > 0 else 6.0
        half_h = badge_h * 0.5 if badge_w > 0 else 6.0

        # 2. Estrela dourada na capital
        if is_capital:
            if em_batalha:
                sx = cx - half_w - 5.0 if badge_w > 0 else cx - 18.0
                sy = badge_cy
            else:
                sx = cx - half_w - 2.0 if badge_w > 0 else cx
                sy = badge_cy - half_h - 1.5 if badge_w > 0 else badge_cy
            parts.append(_icon_capital_star(sx, sy, r_outer=8.4))

        # 3. Fortaleza (torre/castelo pequeno)
        if "fortaleza" in edificios:
            fx = cx + half_w + 5.5
            fy = badge_cy if em_batalha else (badge_cy - half_h + 1.0)
            parts.append(_icon_fortress(fx, fy, scale=0.92))

        # 4. Porto (ancora discreta)
        if "porto" in edificios:
            ax = cx + half_w + 5.5
            ay = badge_cy + (9.0 if (em_batalha and "fortaleza" in edificios) else (half_h - 1.0))
            parts.append(_icon_anchor(ax, ay, scale=0.88))

        # 5. Emblema de espadas cruzadas + anel pulsante em (cx, cy - 18) + mini-badge pill de baixas ao lado
        if em_batalha:
            sword_y = cy - 18.0
            parts.append(
                _icon_crossed_swords(cx, sword_y, scale=0.95, pulse_phase=t_anim * 2.0, with_ring=True)
            )
            losses = int(losses_map.get(pid) or 0)
            if losses > 0:
                loss_txt = f"-{fmt_troops(losses)}"
                pill_h = 18.0
                pill_w = max(36.0, len(loss_txt) * 6.8 + 12.0)
                # Mini-badge pill vermelho limpo ao lado (ancorado em cx + 28 sem invadir o emblema)
                pill_x = max(cx + 18.0, (cx + 28.0) - pill_w * 0.20)
                pill_y = sword_y - pill_h * 0.5
                pill_op = clamp(0.80 + t_anim * 0.20, 0.80, 1.0)
                parts.append(
                    f'<g opacity="{pill_op:.2f}">'
                    f'<rect x="{pill_x:.1f}" y="{pill_y:.1f}" width="{pill_w:.1f}" height="{pill_h:.1f}" '
                    f'rx="9" fill="#7f1d1d" fill-opacity="0.96" stroke="#f87171" stroke-width="1.3"/>'
                    f'<text x="{pill_x + pill_w * 0.5:.1f}" y="{sword_y + 3.6:.1f}" '
                    f'text-anchor="middle" font-family="{FONT_MONO}" font-size="10.5" font-weight="800" '
                    f'fill="#fef2f2">{esc(loss_txt)}</text>'
                    f"</g>"
                )

    return "".join(parts)


# ---------------------------------------------------------------------------
# HUD Fixo (Barra Superior, Painel Direito, Pop-up Diplomatico, Fala/Pensamento)
# ---------------------------------------------------------------------------


def _render_top_hud(
    topo: MapTopology,
    turn: dict[str, Any],
    ranking: list[dict[str, Any]],
    war_count: int,
) -> str:
    t_num = int(turn.get("turno", 0))
    data_str = clean_text(turn.get("data") or f"TURNO {t_num:02d}").upper()
    vencedor = turn.get("vencedor")

    leader = ranking[0] if ranking else None
    if vencedor:
        for r in ranking:
            if r["id"] == vencedor:
                leader = r
                break

    parts: list[str] = []
    # Barra metalica escura y=0..72 com brilho sutil na borda superior metalica
    parts.append('<rect x="0" y="0" width="1920" height="72" fill="url(#hud-top-bg)"/>')
    parts.append('<rect x="0" y="0" width="1920" height="16" fill="url(#hud-top-bevel)"/>')
    parts.append('<rect x="0" y="0" width="1920" height="2.2" fill="url(#hud-top-shine)"/>')
    parts.append('<line x1="0" y1="71.5" x2="1920" y2="71.5" stroke="#2c4163" stroke-width="1.5"/>')
    parts.append('<line x1="0" y1="69.5" x2="1920" y2="69.5" stroke="#fbbf24" stroke-width="0.9" opacity="0.38"/>')

    # Emblema vetorial AoH2 + Titulo com separador vertical dourado limpo
    parts.append(
        '<g transform="translate(38,36)">'
        '<polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#17253d" stroke="#fbbf24" stroke-width="1.8"/>'
        '<circle cx="0" cy="0" r="7.5" fill="none" stroke="#93c5fd" stroke-width="1.2"/>'
        '<ellipse cx="0" cy="0" rx="3.8" ry="7.5" fill="none" stroke="#93c5fd" stroke-width="1.0"/>'
        '<line x1="-7.5" y1="0" x2="7.5" y2="0" stroke="#93c5fd" stroke-width="1.0"/>'
        "</g>"
    )
    parts.append(
        f'<text x="64" y="43.5" font-family="{FONT_SANS}" font-size="20.5" font-weight="800" '
        f'letter-spacing="1.0" fill="#fbbf24">AGE OF HISTORY 2</text>'
    )
    # Separador vertical dourado limpo (glow suave + barra metalica dourada)
    parts.append(
        '<line x1="330.2" y1="17" x2="330.2" y2="55" stroke="#fbbf24" stroke-width="6" '
        'opacity="0.14" stroke-linecap="round"/>'
        '<rect x="329" y="18" width="2.4" height="36" rx="1.2" fill="url(#gold-divider)"/>'
    )
    parts.append(
        f'<text x="348" y="43" font-family="{FONT_SANS}" font-size="18.5" font-weight="700" '
        f'letter-spacing="1.3" fill="#e2e8f0">AMERICA DO SUL DAS IAS</text>'
    )

    # Pilula da data / turno
    pill_txt = f"{data_str}  ·  TURNO {t_num:02d}"
    parts.append(
        f'<g>'
        f'<rect x="752" y="14" width="296" height="44" rx="8" fill="#121d31" stroke="#354f78" stroke-width="1.4"/>'
        f'<rect x="754" y="16" width="292" height="18" rx="6" fill="#ffffff" opacity="0.04"/>'
        f'<text x="900" y="42" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" '
        f'font-weight="700" fill="#f8fafc" letter-spacing="0.8">{esc(pill_txt)}</text>'
        f"</g>"
    )

    # Contador de guerras ativas
    if war_count > 0:
        w_bg = "#2a0e16"
        w_stroke = "#ef4444"
        w_fill = "#fecaca"
        w_label = f"{war_count} GUERRA ATIVA" if war_count == 1 else f"{war_count} GUERRAS ATIVAS"
    else:
        w_bg = "#101b2e"
        w_stroke = "#334155"
        w_fill = "#94a3b8"
        w_label = "0 GUERRAS ATIVAS"

    parts.append(
        f'<g>'
        f'<rect x="1068" y="14" width="232" height="44" rx="8" fill="{w_bg}" stroke="{w_stroke}" stroke-width="1.4"/>'
        f'{_icon_crossed_swords(1096, 36, scale=0.82, with_ring=False)}'
        f'<text x="1116" y="41" font-family="{FONT_SANS}" font-size="14" font-weight="800" '
        f'fill="{w_fill}" letter-spacing="0.6">{esc(w_label)}</text>'
        f"</g>"
    )

    # Destaque de quem esta em 1o lugar (ou VENCEDOR)
    if leader:
        is_win = bool(vencedor)
        l_stroke = "#fbbf24" if is_win else "#d97706"
        l_bg = "#241a08" if is_win else "#111929"
        tag = "VENCEDOR" if is_win else "1o LUGAR"
        name_line = truncate_text(f"{leader['ia']} · {leader['nome']}", 28)
        stat_line = f"{leader['provincias']} prov · {fmt_troops(leader['tropas'])}"

        parts.append(
            f'<g>'
            f'<rect x="1320" y="10" width="576" height="52" rx="9" fill="{l_bg}" '
            f'stroke="{l_stroke}" stroke-width="1.6"/>'
            # Badge 1o LUGAR / VENCEDOR
            f'<rect x="1332" y="21" width="96" height="30" rx="5" fill="#fbbf24"/>'
            f'<text x="1380" y="41" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="12.5" font-weight="900" fill="#0b111c" letter-spacing="0.6">{esc(tag)}</text>'
            # Bandeira inline 60x40
            f'{_render_flag_svg(topo, leader["id"], 1442, 22, 42, 28, border_color="#fbbf24")}'
            # Texto lider protegido por clipPath
            f'<g clip-path="url(#clip-top-leader)">'
            f'<text x="1498" y="34" font-family="{FONT_SANS}" font-size="15.5" font-weight="800" '
            f'fill="#f8fafc">{esc(name_line)}</text>'
            f'<text x="1498" y="53" font-family="{FONT_MONO}" font-size="12.5" font-weight="700" '
            f'fill="#fcd34d">{esc(stat_line)}</text>'
            f"</g>"
            f"</g>"
        )

    return "".join(parts)


def _render_right_panel(
    topo: MapTopology,
    ranking: list[dict[str, Any]],
    recent_events: list[dict[str, Any]],
    war_count: int,
) -> str:
    """Painel Direito x=1455..1895: Ranking ao vivo (Top 8) com coroa #1 + Feed Diplomatico."""
    parts: list[str] = []
    top8 = ranking[:8]

    # Gradientes suaves das barras de territorio para cada linha do ranking
    bar_defs: list[str] = ["<defs>"]
    for idx, row in enumerate(top8):
        c_dark = blend_hex(row["cor"], "#000000", 0.22)
        c_mid = blend_hex(row["cor"], "#000000", 0.0)
        c_hi = blend_hex(row["cor"], "#ffffff", 0.30)
        bar_defs.append(
            f'<linearGradient id="rank-bar-{idx}" x1="0%" y1="0%" x2="100%" y2="0%">'
            f'<stop offset="0%" stop-color="{c_dark}"/>'
            f'<stop offset="65%" stop-color="{c_mid}"/>'
            f'<stop offset="100%" stop-color="{c_hi}"/>'
            f"</linearGradient>"
        )
    bar_defs.append("</defs>")
    parts.append("".join(bar_defs))

    # Fundo principal do painel direito
    parts.append(
        '<rect x="1455" y="84" width="440" height="978" rx="10" '
        'fill="#0b111c" fill-opacity="0.93" stroke="#263854" stroke-width="1.5"/>'
    )

    # --- BLOCO 1: RANKING AO VIVO (Top 8) ---
    parts.append(
        '<path d="M1456,94 Q1456,85 1465,85 L1885,85 Q1894,85 1894,94 L1894,122 L1456,122 Z" '
        'fill="#121d31"/>'
    )
    parts.append('<line x1="1456" y1="122" x2="1894" y2="122" stroke="#263854" stroke-width="1.2"/>')
    parts.append(
        f'<text x="1472" y="109" font-family="{FONT_SANS}" font-size="14" font-weight="800" '
        f'fill="#f8fafc" letter-spacing="1.2">RANKING AO VIVO</text>'
    )
    parts.append(
        f'<text x="1880" y="109" text-anchor="end" font-family="{FONT_MONO}" font-size="11.5" '
        f'font-weight="700" fill="#94a3b8">PROV · TROPAS</text>'
    )

    max_provs = max([1] + [r["provincias"] for r in ranking])
    parts.append('<g clip-path="url(#clip-rank-panel)">')
    for idx, row in enumerate(top8):
        ry = 130 + idx * 64
        op = "1.0" if row["viva"] else "0.52"
        row_bg = "url(#rank-first-bg)" if idx == 0 else "#0f1728"
        row_stroke = "#f59e0b" if idx == 0 else ("#7f1d1d" if row["em_guerra"] else "#1f2e47")

        rank_color = "#fbbf24" if idx == 0 else ("#cbd5e1" if idx == 1 else ("#d97706" if idx == 2 else "#64748b"))
        bar_w_max = 210.0
        bar_fill_w = max(0.0, (row["provincias"] / float(max_provs)) * bar_w_max) if row["provincias"] > 0 else 0.0

        ia_txt = truncate_text(row["ia"], 14)
        pais_txt = truncate_text(row["nome"], 13)
        stat_txt = f"{row['provincias']}p · {fmt_troops(row['tropas'])}"

        badge_svg = ""
        if not row["viva"]:
            badge_svg = (
                f'<rect x="1798" y="{ry + 7}" width="78" height="18" rx="4" '
                f'fill="#3b1118" stroke="#991b1b" stroke-width="1"/>'
                f'<text x="1837" y="{ry + 19.5}" text-anchor="middle" font-family="{FONT_SANS}" '
                f'font-size="9.5" font-weight="800" fill="#fca5a5" letter-spacing="0.5">ELIMINADA</text>'
            )
        elif row["em_guerra"]:
            badge_svg = (
                f'<rect x="1814" y="{ry + 7}" width="62" height="18" rx="4" '
                f'fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>'
                f'<text x="1845" y="{ry + 19.5}" text-anchor="middle" font-family="{FONT_SANS}" '
                f'font-size="9.5" font-weight="800" fill="#fee2e2" letter-spacing="0.6">GUERRA</text>'
            )

        if bar_fill_w > 0:
            bar_fill_svg = (
                f'<rect x="1544" y="{ry + 35}" width="{bar_fill_w:.1f}" height="9.5" rx="4.5" '
                f'fill="url(#rank-bar-{idx})"/>'
                f'<rect x="1544" y="{ry + 35}" width="{bar_fill_w:.1f}" height="9.5" rx="4.5" '
                f'fill="url(#bar-gloss)"/>'
            )
        else:
            bar_fill_svg = ""

        # Coroa vetorial dourada no #1 do Ranking
        if idx == 0:
            rank_slot_svg = (
                f"{_icon_gold_crown(1484.5, ry + 16.5, scale=0.78)}"
                f'<text x="1484.5" y="{ry + 43}" text-anchor="middle" font-family="{FONT_MONO}" '
                f'font-size="13.5" font-weight="800" fill="{rank_color}">#1</text>'
            )
        else:
            rank_slot_svg = (
                f'<text x="1484.5" y="{ry + 34}" text-anchor="middle" font-family="{FONT_MONO}" '
                f'font-size="13.5" font-weight="800" fill="{rank_color}">#{idx + 1}</text>'
            )

        flag_border = "#fbbf24" if idx == 0 else "#475569"

        parts.append(
            f'<g opacity="{op}">'
            f'<rect x="1466" y="{ry}" width="418" height="58" rx="6" fill="{row_bg}" '
            f'stroke="{row_stroke}" stroke-width="{1.4 if idx == 0 else 1.2}"/>'
            # Filete lateral na cor do pais
            f'<rect x="1467" y="{ry + 2}" width="4.5" height="54" rx="2" fill="{esc(row["cor"])}"/>'
            # Posicao #1 (com coroa dourada) .. #8
            f"{rank_slot_svg}"
            # Bandeira 36x24
            f'{_render_flag_svg(topo, row["id"], 1498, ry + 16, 36, 24, border_color=flag_border)}'
            # Apelido IA + Pais
            f'<text x="1544" y="{ry + 22}" font-family="{FONT_SANS}" font-size="13.5" font-weight="800">'
            f'<tspan fill="#f8fafc">{esc(ia_txt)}</tspan>'
            f'<tspan fill="#64748b"> · </tspan>'
            f'<tspan fill="#94a3b8" font-size="12" font-weight="600">{esc(pais_txt)}</tspan>'
            f"</text>"
            f"{badge_svg}"
            # Barra de progresso proporcional de provincias com gradiente suave
            f'<rect x="1544" y="{ry + 35}" width="{bar_w_max:.0f}" height="9.5" rx="4.5" '
            f'fill="#162235" stroke="#24344d" stroke-width="0.7"/>'
            f"{bar_fill_svg}"
            # Stats a direita
            f'<text x="1876" y="{ry + 44}" text-anchor="end" font-family="{FONT_MONO}" '
            f'font-size="12" font-weight="700" fill="#e2e8f0">{esc(stat_txt)}</text>'
            f"</g>"
        )
    parts.append("</g>")

    # --- BLOCO 2: FEED DIPLOMATICO / EVENTOS AO VIVO (ultimos 5) ---
    parts.append('<line x1="1456" y1="664" x2="1894" y2="664" stroke="#263854" stroke-width="1.5"/>')
    parts.append('<rect x="1456" y="665" width="438" height="36" fill="#121d31"/>')
    parts.append('<line x1="1456" y1="701" x2="1894" y2="701" stroke="#263854" stroke-width="1.2"/>')
    dot_cor = "#ef4444" if war_count > 0 else "#22c55e"
    parts.append(f'<circle cx="1474" cy="683" r="4.5" fill="{dot_cor}"/>')
    parts.append(
        f'<text x="1488" y="688" font-family="{FONT_SANS}" font-size="13.5" font-weight="800" '
        f'fill="#f8fafc" letter-spacing="1.1">FEED DIPLOMATICO</text>'
    )
    parts.append(
        f'<text x="1880" y="688" text-anchor="end" font-family="{FONT_MONO}" font-size="11" '
        f'fill="#94a3b8">ULTIMOS EVENTOS</text>'
    )

    last5 = list(reversed(recent_events[-5:]))
    parts.append('<g clip-path="url(#clip-feed-panel)">')
    for idx, ev in enumerate(last5):
        ey = 710 + idx * 68
        tipo = str(ev.get("tipo") or "batalha").lower()
        st = EVENT_STYLE.get(tipo) or {"cor": "#38bdf8", "tag": tipo.upper()}
        ev_cor = st["cor"]
        tag = truncate_text(ev.get("titulo") or st["tag"], 28).upper()
        header = f"T{int(ev.get('turno', 0)):02d} · {tag}"
        desc_lines = wrap_lines(ev.get("descricao") or "", width=45, max_lines=2)

        parts.append(
            f'<g>'
            f'<rect x="1466" y="{ey}" width="418" height="62" rx="6" fill="#0f1728" '
            f'stroke="#1f2e47" stroke-width="1.1"/>'
            f'<rect x="1467" y="{ey + 2}" width="4.5" height="58" rx="2" fill="{esc(ev_cor)}"/>'
            f'<text x="1480" y="{ey + 18}" font-family="{FONT_MONO}" font-size="10.8" '
            f'font-weight="800" fill="{esc(ev_cor)}" letter-spacing="0.4">{esc(header)}</text>'
        )
        for li, line in enumerate(desc_lines):
            parts.append(
                f'<text x="1480" y="{ey + 36 + li * 16}" font-family="{FONT_SANS}" '
                f'font-size="12.2" font-weight="500" fill="#e2e8f0">{esc(line)}</text>'
            )
        parts.append("</g>")
    parts.append("</g>")

    return "".join(parts)


def _render_speech_card(
    topo: MapTopology,
    turn: dict[str, Any],
    card: dict[str, Any] | None,
    slot_progress: float,
    instant_opaque: bool = False,
) -> str:
    """
    Card compacto, moderno e cinematografico de Fala Publica / Pensamento Secreto
    (canto inferior esquerdo: x=32, largura=580, altura adaptativa 126..172 ancorada em y_bottom=1052).
    """
    if not card:
        return ""

    nid = card["nid"]
    modo = card["modo"]
    texto = clean_text(card["texto"])
    if not texto:
        return ""

    turn_nacoes = turn.get("nacoes") or {}
    ia, nome, ncor = _nation_display(nid, topo, turn_nacoes)

    is_secret = modo == "pensamento"
    display_src = texto if is_secret else f'"{texto}"'
    lines = wrap_lines(display_src, width=42, max_lines=3)
    if not lines:
        return ""

    n_lines = len(lines)
    # Altura adaptativa rigorosamente entre 126..172px ancorada em y_bottom=1052 (zero espaco morto)
    if n_lines == 1:
        h = 126.0
    elif n_lines == 2:
        h = 148.0
    else:
        h = 172.0

    x = 32.0
    w = 580.0
    y_bottom = 1052.0
    y = y_bottom - h

    if is_secret:
        bg_fill = "url(#speech-secret-bg)"
        border_cor = "#a855f7"
        accent_cor = "#c084fc"
        badge_bg = "#581c87"
        badge_stroke = "#d8b4fe"
        badge_txt = "PENSAMENTO SECRETO"
        badge_fg = "#f3e8ff"
        text_style = ' font-style="italic"'
        text_fill = "#f3e8ff"
        badge_w = 198.0
        ia_max_chars = 17
    else:
        bg_fill = "url(#speech-public-bg)"
        border_cor = blend_hex("#334a6e", ncor, 0.55)
        accent_cor = ncor
        badge_bg = blend_hex("#0b111c", ncor, 0.44)
        badge_stroke = ncor
        badge_txt = "FALA PUBLICA"
        badge_fg = "#f8fafc"
        text_style = ""
        text_fill = "#f8fafc"
        badge_w = 152.0
        ia_max_chars = 21

    # Fade suave nas transicoes do card (100% opaco em amostras)
    if instant_opaque:
        card_op = 1.0
    else:
        fade_in = clamp(slot_progress / 0.12, 0.0, 1.0)
        fade_out = clamp((1.0 - slot_progress) / 0.10, 0.0, 1.0)
        card_op = min(fade_in, fade_out)

    badge_h = 28.0
    badge_x = x + w - 16.0 - badge_w
    badge_y = y + 16.0
    prog_x = x + 18.0
    prog_max_w = w - 36.0
    prog_w = clamp(slot_progress, 0.0, 1.0) * prog_max_w

    header_clip_x = x + 84.0
    header_clip_w = max(80.0, badge_x - header_clip_x - 10.0)

    if is_secret:
        badge_icon = _icon_thought_bubble(badge_x + 17.5, badge_y + 13.5, scale=0.86)
        badge_tx = badge_x + 112.0
        card_shell = (
            # Sombra externa + glow roxo suave
            f'<rect x="{x + 4:.1f}" y="{y + 6:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="#02060d" opacity="0.52"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="none" stroke="#a855f7" stroke-width="10" opacity="0.14"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="none" stroke="#c084fc" stroke-width="5" opacity="0.22"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="{bg_fill}" fill-opacity="0.96" stroke="#a855f7" stroke-width="2.4" stroke-dasharray="9,5"/>'
        )
    else:
        badge_icon = _icon_sound_waves(badge_x + 18.0, badge_y + 14.0, scale=0.86)
        badge_tx = badge_x + 90.0
        card_shell = (
            # Sombra externa + card cinematografico com barra lateral grossa na cor da nacao
            f'<rect x="{x + 4:.1f}" y="{y + 6:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="#02060d" opacity="0.52"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="12" '
            f'fill="{bg_fill}" fill-opacity="0.96" stroke="{esc(border_cor)}" stroke-width="1.8"/>'
            f'<rect x="{x + 1.5:.1f}" y="{y + 2.0:.1f}" width="7.5" height="{h - 4.0:.1f}" rx="3.5" '
            f'fill="{esc(ncor)}"/>'
            f'<rect x="{x + 2.5:.1f}" y="{y + 4.0:.1f}" width="2.0" height="{h - 8.0:.1f}" rx="1" '
            f'fill="#ffffff" opacity="0.24"/>'
        )

    parts = [
        f'<g opacity="{card_op:.2f}">',
        "<defs>",
        f'<clipPath id="clip-speech-header"><rect x="{header_clip_x:.1f}" y="{y + 6.0:.1f}" '
        f'width="{header_clip_w:.1f}" height="52" rx="2"/></clipPath>',
        f'<clipPath id="clip-speech-body"><rect x="{x + 16.0:.1f}" y="{y + 62.0:.1f}" '
        f'width="{w - 32.0:.1f}" height="{h - 74.0:.1f}" rx="4"/></clipPath>',
        "</defs>",
        card_shell,
        # Bandeira maior 54x36 com moldura metalica
        f'<rect x="{x + 18.5:.1f}" y="{y + 12.5:.1f}" width="57" height="39" rx="3.5" '
        f'fill="#0f172a" stroke="#64748b" stroke-width="1.0" opacity="0.85"/>',
        _render_flag_svg(topo, nid, x + 20.0, y + 14.0, 54.0, 36.0, border_color="#e2e8f0"),
        # Nome da IA em destaque (22px bold) + Nome do pais (com clipPath anti-colisao)
        '<g clip-path="url(#clip-speech-header)">',
        f'<text x="{x + 86.0:.1f}" y="{y + 34.0:.1f}" font-family="{FONT_SANS}" font-size="22" '
        f'font-weight="800" fill="#f8fafc">{esc(truncate_text(ia, ia_max_chars))}</text>',
        f'<text x="{x + 86.0:.1f}" y="{y + 51.0:.1f}" font-family="{FONT_SANS}" font-size="13.5" '
        f'font-weight="600" fill="#94a3b8">{esc(truncate_text(nome, 24))}</text>',
        "</g>",
        # Badge modo com icone vetorial
        f'<rect x="{badge_x:.1f}" y="{badge_y:.1f}" width="{badge_w:.1f}" height="{badge_h:.1f}" rx="7" '
        f'fill="{esc(badge_bg)}" stroke="{esc(badge_stroke)}" stroke-width="1.3"/>',
        badge_icon,
        f'<text x="{badge_tx:.1f}" y="{badge_y + 18.0:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="10.8" font-weight="800" fill="{badge_fg}" letter-spacing="0.55">{esc(badge_txt)}</text>',
        # Divisoria sutil
        f'<line x1="{x + 20.0:.1f}" y1="{y + 60.0:.1f}" x2="{x + w - 16.0:.1f}" y2="{y + 60.0:.1f}" '
        f'stroke="{esc(accent_cor)}" stroke-width="1.0" opacity="0.32"/>',
        # Corpo do texto em 20px limpo (ate 3 linhas, protegido por clipPath adaptativo)
        '<g clip-path="url(#clip-speech-body)">',
    ]

    for i, line in enumerate(lines):
        parts.append(
            f'<text x="{x + 22.0:.1f}" y="{y + 88.0 + i * 26.0:.1f}" font-family="{FONT_SANS}" '
            f'font-size="20" font-weight="500"{text_style} fill="{text_fill}">{esc(line)}</text>'
        )

    parts.append("</g>")
    # Barra de progresso sutil na base do card
    parts.append(
        f'<rect x="{prog_x:.1f}" y="{y + h - 8.5:.1f}" width="{prog_max_w:.1f}" height="3.2" rx="1.6" '
        f'fill="#1e293b"/>'
    )
    parts.append(
        f'<rect x="{prog_x:.1f}" y="{y + h - 8.5:.1f}" width="{prog_w:.1f}" height="3.2" rx="1.6" '
        f'fill="{esc(accent_cor)}" opacity="0.90"/>'
    )
    parts.append("</g>")
    return "".join(parts)


def _render_diplomatic_popup(
    topo: MapTopology,
    turn: dict[str, Any],
    ev: dict[str, Any] | None,
    has_speech_card: bool,
    t_anim: float,
    instant_opaque: bool = False,
) -> str:
    """
    Pop-up Diplomatico AoH2 para eventos fortes (guerra, traicao, ultimato, paz, eliminacao).
    Ajusta posicao automaticamente para jamais sobrepor o card de fala/pensamento!
    """
    if not ev:
        return ""

    tipo = str(ev.get("tipo") or "guerra").lower()
    st = EVENT_STYLE.get(tipo) or EVENT_STYLE["guerra"]
    accent = st["cor"]
    bg = st["bg"]

    raw_titulo = clean_text(ev.get("titulo") or "")
    titulo = raw_titulo.upper() if (raw_titulo and len(raw_titulo) <= 34) else st["titulo"]

    ator = ev.get("ator")
    alvo = ev.get("alvo")
    turn_nacoes = turn.get("nacoes") or {}

    desc = clean_text(ev.get("descricao") or "")
    if not desc:
        ia_a, nom_a, _ = _nation_display(ator, topo, turn_nacoes) if ator else ("", "", "")
        ia_b, nom_b, _ = _nation_display(alvo, topo, turn_nacoes) if alvo else ("", "", "")
        if ator and alvo:
            desc = f"{ia_a} ({nom_a}) contra {ia_b} ({nom_b})."
        elif ator:
            desc = f"{ia_a} ({nom_a}) — {titulo}."

    # Posicao inteligente alinhada em y_bottom=1052: com speech card (x=32..612), fica em x=642..1426
    if has_speech_card:
        px, py, pw, ph = 642.0, 852.0, 784.0, 200.0
    else:
        px, py, pw, ph = 460.0, 852.0, 580.0, 200.0

    # Animacao suave de entrada (slide-up + fade)
    if instant_opaque:
        op = 1.0
        dy = 0.0
    else:
        e_in = ease_out_cubic(clamp(t_anim / 0.14, 0.0, 1.0))
        e_out = clamp((1.0 - t_anim) / 0.08, 0.0, 1.0)
        op = min(e_in, e_out)
        dy = (1.0 - e_in) * 24.0

    cx = px + pw * 0.5
    wrap_w = max(48, int((pw - 48) / 8.4))
    desc_lines = wrap_lines(desc, width=wrap_w, max_lines=2)

    parts = [
        f'<g transform="translate(0,{dy:.1f})" opacity="{op:.2f}">',
        "<defs>",
        f'<clipPath id="clip-popup-body"><rect x="{px + 10:.1f}" y="{py + 4:.1f}" '
        f'width="{pw - 20:.1f}" height="{ph - 8:.1f}" rx="8"/></clipPath>',
        "</defs>",
        # Sombra externa do pop-up
        f'<rect x="{px + 6:.0f}" y="{py + 8:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="12" '
        f'fill="#000000" opacity="0.52"/>',
        # Corpo do card
        f'<rect x="{px:.0f}" y="{py:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="12" '
        f'fill="#0b111c" fill-opacity="0.96" stroke="{esc(accent)}" stroke-width="2.6"/>',
        f'<rect x="{px + 5:.0f}" y="{py + 5:.0f}" width="{pw - 10:.0f}" height="{ph - 10:.0f}" rx="9" '
        f'fill="none" stroke="{esc(accent)}" stroke-width="0.9" opacity="0.35"/>',
        # Faixa de titulo em CAIXA ALTA
        f'<path d="M{px + 2:.0f},{py + 12:.0f} Q{px + 2:.0f},{py + 2:.0f} {px + 12:.0f},{py + 2:.0f} '
        f'L{px + pw - 12:.0f},{py + 2:.0f} Q{px + pw - 2:.0f},{py + 2:.0f} {px + pw - 2:.0f},{py + 12:.0f} '
        f'L{px + pw - 2:.0f},{py + 42:.0f} L{px + 2:.0f},{py + 42:.0f} Z" fill="{esc(bg)}"/>',
        f'<line x1="{px + 2:.0f}" y1="{py + 42:.0f}" x2="{px + pw - 2:.0f}" y2="{py + 42:.0f}" '
        f'stroke="{esc(accent)}" stroke-width="1.4" opacity="0.8"/>',
        '<g clip-path="url(#clip-popup-body)">',
        f'<text x="{cx:.1f}" y="{py + 29:.0f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="16.5" font-weight="900" fill="#f8fafc" letter-spacing="2.0">{esc(titulo)}</text>',
    ]

    # Linha do meio: Duas bandeiras frente a frente (ou 1 nacao destacada se nao houver alvo)
    mid_y = py + 86.0
    if ator and alvo:
        ia_a, nom_a, cor_a = _nation_display(ator, topo, turn_nacoes)
        ia_b, nom_b, cor_b = _nation_display(alvo, topo, turn_nacoes)

        flag_w, flag_h = 66.0, 44.0
        left_fx = cx - 44.0 - flag_w
        right_fx = cx + 44.0

        parts.append(_render_flag_svg(topo, ator, left_fx, mid_y - flag_h * 0.5, flag_w, flag_h, border_color=cor_a))
        parts.append(_render_flag_svg(topo, alvo, right_fx, mid_y - flag_h * 0.5, flag_w, flag_h, border_color=cor_b))
        parts.append(_icon_diplomacy_emblem(tipo, cx, mid_y, accent))

        # Nomes alinhados externamente as bandeiras
        parts.append(
            f'<text x="{left_fx - 14:.1f}" y="{mid_y - 4:.1f}" text-anchor="end" '
            f'font-family="{FONT_SANS}" font-size="16" font-weight="800" fill="#f8fafc">'
            f"{esc(truncate_text(ia_a, 18))}</text>"
        )
        parts.append(
            f'<text x="{left_fx - 14:.1f}" y="{mid_y + 15:.1f}" text-anchor="end" '
            f'font-family="{FONT_SANS}" font-size="12.5" font-weight="600" fill="#94a3b8">'
            f"{esc(truncate_text(nom_a, 20))}</text>"
        )
        parts.append(
            f'<text x="{right_fx + flag_w + 14:.1f}" y="{mid_y - 4:.1f}" text-anchor="start" '
            f'font-family="{FONT_SANS}" font-size="16" font-weight="800" fill="#f8fafc">'
            f"{esc(truncate_text(ia_b, 18))}</text>"
        )
        parts.append(
            f'<text x="{right_fx + flag_w + 14:.1f}" y="{mid_y + 15:.1f}" text-anchor="start" '
            f'font-family="{FONT_SANS}" font-size="12.5" font-weight="600" fill="#94a3b8">'
            f"{esc(truncate_text(nom_b, 20))}</text>"
        )
    else:
        solo = ator or alvo
        ia_s, nom_s, cor_s = _nation_display(solo, topo, turn_nacoes)
        flag_w, flag_h = 66.0, 44.0
        fx = cx - flag_w - 18.0
        parts.append(_render_flag_svg(topo, solo, fx, mid_y - flag_h * 0.5, flag_w, flag_h, border_color=cor_s))
        if tipo == "eliminacao":
            parts.append(
                f'<line x1="{fx:.1f}" y1="{mid_y + flag_h * 0.5:.1f}" '
                f'x2="{fx + flag_w:.1f}" y2="{mid_y - flag_h * 0.5:.1f}" '
                f'stroke="#ef4444" stroke-width="3.2" stroke-linecap="round"/>'
            )
        parts.append(_icon_diplomacy_emblem(tipo, cx + 12.0, mid_y, accent))
        parts.append(
            f'<text x="{cx + 38.0:.1f}" y="{mid_y - 3:.1f}" font-family="{FONT_SANS}" '
            f'font-size="16.5" font-weight="800" fill="#f8fafc">{esc(truncate_text(ia_s, 22))}</text>'
        )
        parts.append(
            f'<text x="{cx + 38.0:.1f}" y="{mid_y + 16:.1f}" font-family="{FONT_SANS}" '
            f'font-size="13" font-weight="600" fill="#94a3b8">{esc(truncate_text(nom_s, 24))}</text>'
        )

    # Descricao limpa na base do pop-up
    parts.append(
        f'<line x1="{px + 24:.0f}" y1="{py + 126:.0f}" x2="{px + pw - 24:.0f}" y2="{py + 126:.0f}" '
        f'stroke="#334155" stroke-width="1.0" opacity="0.6"/>'
    )
    for li, line in enumerate(desc_lines):
        parts.append(
            f'<text x="{cx:.1f}" y="{py + 150 + li * 22:.0f}" text-anchor="middle" '
            f'font-family="{FONT_SANS}" font-size="14.2" font-weight="600" fill="#e2e8f0">{esc(line)}</text>'
        )

    parts.append("</g>")
    parts.append("</g>")
    return "".join(parts)


def _render_victory_banner(topo: MapTopology, turn: dict[str, Any]) -> str:
    """Faixa dourada no topo do mapa quando ha `vencedor` declarado."""
    vencedor = turn.get("vencedor")
    if not vencedor:
        return ""
    turn_nacoes = turn.get("nacoes") or {}
    ia, nome, _cor = _nation_display(vencedor, topo, turn_nacoes)
    title = f"HEGEMONIA SUL-AMERICANA  ·  {ia.upper()} ({nome.upper()})"
    return (
        f'<g>'
        f'<rect x="380" y="92" width="695" height="58" rx="10" fill="#1e1506" fill-opacity="0.95" '
        f'stroke="#fbbf24" stroke-width="2.4"/>'
        f'<g clip-path="url(#clip-victory-banner)">'
        f'{_render_flag_svg(topo, vencedor, 398, 107, 42, 28, border_color="#fbbf24")}'
        f'<text x="456" y="127" font-family="{FONT_SANS}" font-size="18" font-weight="900" '
        f'fill="#fde047" letter-spacing="1.0">{esc(truncate_text(title, 54))}</text>'
        f"</g>"
        f"</g>"
    )


def render_frame_svg(
    topo: MapTopology,
    turnos: list[dict[str, Any]],
    camera: CameraTrack,
    event_history: list[list[dict[str, Any]]],
    turno_idx: int,
    t_anim: float = 0.5,
    force_card_mode: str | None = None,
    instant_opaque: bool = False,
) -> str:
    """Gera o documento SVG 1920x1080 completo de um unico quadro."""
    turno_idx = int(clamp(turno_idx, 0, len(turnos) - 1))
    t_anim = clamp(t_anim, 0.0, 1.0)
    turn = turnos[turno_idx]
    prev_turn = turnos[turno_idx - 1] if turno_idx > 0 else None

    war_pairs, war_by_nation = _extract_wars(turn)
    ranking = _build_ranking(topo, turn, war_by_nation)

    battle_pids: set[str] = set()
    battle_losses: dict[str, int] = {}
    conquered_pids: set[str] = set()
    for mov in turn.get("movimentos") or []:
        para = mov.get("para")
        tipo = str(mov.get("tipo") or "").lower()
        perdas = int(round(float(mov.get("perdas_atk") or 0))) + int(round(float(mov.get("perdas_def") or 0)))
        if para and (tipo in ("ataque", "invasao", "combate") or perdas > 0 or mov.get("conquistada")):
            battle_pids.add(para)
            if perdas > 0:
                battle_losses[para] = battle_losses.get(para, 0) + perdas
        if para and mov.get("conquistada"):
            conquered_pids.add(para)

    tx, ty, zoom = camera.sample(turno_idx, t_anim)

    provs_svg, resolved = _render_provinces_and_borders(
        topo, turn, prev_turn, t_anim, war_pairs, battle_pids, conquered_pids
    )

    card, slot_prog = _pick_speech_card(topo, turn, t_anim, force_mode=force_card_mode)
    strong_ev = _pick_strong_event(turn)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SVG_W}" height="{SVG_H}" '
        f'viewBox="0 0 {SVG_W} {SVG_H}">',
        _svg_defs(),
        # Base segura escura fora da camera
        f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="#040c18"/>',
        # Camada do mapa com camera continua + deriva lenta
        f'<g transform="translate({tx:.2f},{ty:.2f}) scale({zoom:.4f})">',
        _render_ocean_and_grid(topo),
        _render_continent_shadow(topo),
        provs_svg,
        _render_nation_watermarks(topo, turn, resolved),
        _render_arrows_and_impacts(topo, turn, t_anim),
        _render_troop_badges_and_icons(topo, turn, resolved, t_anim, battle_losses=battle_losses),
        "</g>",
        # Vinheta sutil de profundidade sobre o mapa (atras do HUD)
        f'<rect x="0" y="72" width="1455" height="{SVG_H - 72}" fill="url(#screen-vignette)" pointer-events="none"/>',
        # HUD fixo na frente
        _render_victory_banner(topo, turn),
        _render_top_hud(topo, turn, ranking, len(war_pairs)),
        _render_right_panel(topo, ranking, event_history[turno_idx], len(war_pairs)),
        _render_speech_card(topo, turn, card, slot_prog, instant_opaque=instant_opaque),
        _render_diplomatic_popup(
            topo,
            turn,
            strong_ev,
            has_speech_card=(card is not None),
            t_anim=t_anim,
            instant_opaque=instant_opaque,
        ),
        # Vignette radial cinematografica discreta (opacity=0.30) nas bordas do canvas
        f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="url(#canvas-vignette)" opacity="0.30" pointer-events="none"/>',
        "</svg>",
    ]
    return "".join(parts)


# ---------------------------------------------------------------------------
# Rasterizacao via rsvg-convert e Empacotamento MP4 via ffmpeg
# ---------------------------------------------------------------------------


def rasterize_svg_to_png(
    svg_content: str,
    out_png: Path,
    tmp_dir: Path,
    stem: str,
    width: int = 1280,
    height: int = 720,
) -> Path:
    svg_path = tmp_dir / f"{stem}.svg"
    svg_path.write_text(svg_content, encoding="utf-8")
    try:
        subprocess.run(
            [
                "rsvg-convert",
                "-w",
                str(width),
                "-h",
                str(height),
                "-o",
                str(out_png),
                str(svg_path),
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    finally:
        try:
            svg_path.unlink(missing_ok=True)
        except OSError:
            pass
    return out_png


def _select_sample_moments(
    turnos: list[dict[str, Any]],
) -> list[tuple[str, int, float, str | None]]:
    """
    Escolhe 6 momentos variados e representativos:
    1. Turno 0 inicial
    2. Batalha com setas + impacto
    3. Evento diplomatico / pop-up
    4. Pensamento secreto
    5. Meio da partida
    6. Ultimo turno
    """
    n = len(turnos)
    last_idx = max(0, n - 1)
    mid_idx = max(0, n // 2)

    # Melhor batalha com setas
    best_battle_idx = min(1, last_idx)
    best_battle_score = -1.0
    for i, t in enumerate(turnos):
        score = 0.0
        for mov in t.get("movimentos") or []:
            tipo = str(mov.get("tipo") or "").lower()
            perdas = float(mov.get("perdas_atk") or 0) + float(mov.get("perdas_def") or 0)
            if tipo in ("ataque", "invasao", "combate") or perdas > 0 or mov.get("conquistada"):
                score += 2.0 + perdas / 200.0 + (3.0 if mov.get("conquistada") else 0.0)
            else:
                score += 0.3
        if score > best_battle_score:
            best_battle_score = score
            best_battle_idx = i

    # Melhor evento diplomatico forte (pop-up)
    best_ev_idx = min(2, last_idx)
    best_ev_prio = -1
    for i, t in enumerate(turnos):
        ev = _pick_strong_event(t)
        if ev:
            p = STRONG_EVENT_PRIORITY.get(str(ev.get("tipo") or "").lower(), 0)
            # Preferir turno diferente do de batalha quando empatado
            bonus = 1 if i != best_battle_idx else 0
            if p * 10 + bonus > best_ev_prio:
                best_ev_prio = p * 10 + bonus
                best_ev_idx = i

    # Melhor turno com pensamento secreto (evitando duplicar best_ev_idx se possivel)
    best_thought_idx = min(3, last_idx)
    best_thought_score = -1
    for i, t in enumerate(turnos):
        decs = t.get("decisoes") or {}
        max_len = 0
        for d in decs.values():
            p_txt = clean_text((d or {}).get("pensamento") or "")
            if len(p_txt) > max_len:
                max_len = len(p_txt)
        if max_len > 0:
            sc = max_len + (60 if i not in (0, best_battle_idx, best_ev_idx, last_idx) else 0)
            if sc > best_thought_score:
                best_thought_score = sc
                best_thought_idx = i

    return [
        ("sample_01.png", 0, 0.25, None),
        ("sample_02.png", best_battle_idx, 0.74, None),
        ("sample_03.png", best_ev_idx, 0.48, None),
        ("sample_04.png", best_thought_idx, 0.32, "pensamento"),
        ("sample_05.png", mid_idx, 0.58, None),
        ("sample_06.png", last_idx, 0.82, None),
    ]


def gerar_samples(
    topo: MapTopology,
    turnos: list[dict[str, Any]],
    camera: CameraTrack,
    event_history: list[list[dict[str, Any]]],
    out_dir: str | Path,
    width: int = 1280,
    height: int = 720,
    workers: int = 4,
) -> list[Path]:
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    moments = _select_sample_moments(turnos)

    tmp_dir = Path(tempfile.mkdtemp(prefix="aoh2_sample_", dir=tempfile.gettempdir()))
    try:
        jobs: list[tuple[str, Path, str]] = []
        for fname, tidx, tanim, force_mode in moments:
            svg = render_frame_svg(
                topo,
                turnos,
                camera,
                event_history,
                turno_idx=tidx,
                t_anim=tanim,
                force_card_mode=force_mode,
                instant_opaque=True,
            )
            jobs.append((fname.replace(".png", ""), out_path / fname, svg))

        results: list[Path] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, max(1, workers))) as ex:
            futs = [
                ex.submit(rasterize_svg_to_png, svg, png, tmp_dir, stem, width, height)
                for stem, png, svg in jobs
            ]
            for fut in futs:
                results.append(fut.result())

        print(f"[aoh2-render] {len(results)} samples salvos em {out_path}")
        for (fname, tidx, tanim, mode), p in zip(moments, results):
            tag = f" ({mode})" if mode else ""
            print(f"  - {p.name}: turno={tidx} t={tanim:.2f}{tag}")
        return results
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def gerar_preview_mp4(
    topo: MapTopology,
    turnos: list[dict[str, Any]],
    camera: CameraTrack,
    event_history: list[list[dict[str, Any]]],
    out_mp4: str | Path,
    max_turnos: int = 6,
    fps: int = 20,
    secs_per_turn: float = 3.5,
    width: int = 1280,
    height: int = 720,
    workers: int = 4,
) -> Path:
    out_path = Path(out_mp4)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    num_turns = len(turnos) if (not max_turnos or max_turnos <= 0) else min(len(turnos), max_turnos)
    frames_per_turn = max(1, int(round(fps * secs_per_turn)))
    total_frames = num_turns * frames_per_turn

    tmp_dir = Path(tempfile.mkdtemp(prefix="aoh2_mp4_", dir=tempfile.gettempdir()))
    try:
        frame_specs: list[tuple[int, int, float]] = []
        frame_no = 1
        for tidx in range(num_turns):
            for fi in range(frames_per_turn):
                t_anim = fi / float(max(1, frames_per_turn - 1)) if frames_per_turn > 1 else 0.5
                frame_specs.append((frame_no, tidx, t_anim))
                frame_no += 1

        print(
            f"[aoh2-render] Renderizando {total_frames} quadros "
            f"({num_turns} turnos x {frames_per_turn} quadros @ {fps} fps)..."
        )

        def _render_one(spec: tuple[int, int, float]) -> Path:
            fno, tidx, tanim = spec
            svg = render_frame_svg(
                topo,
                turnos,
                camera,
                event_history,
                turno_idx=tidx,
                t_anim=tanim,
                force_card_mode=None,
                instant_opaque=False,
            )
            png_path = tmp_dir / f"frame_{fno:05d}.png"
            return rasterize_svg_to_png(
                svg, png_path, tmp_dir, f"frame_{fno:05d}", width=width, height=height
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, max(1, workers))) as ex:
            for done_count, fut in enumerate(
                concurrent.futures.as_completed([ex.submit(_render_one, s) for s in frame_specs]),
                start=1,
            ):
                fut.result()
                if done_count % max(1, total_frames // 5) == 0 or done_count == total_frames:
                    print(f"  progresso: {done_count}/{total_frames} quadros")

        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-framerate",
            str(fps),
            "-i",
            str(tmp_dir / "frame_%05d.png"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-movflags",
            "+faststart",
            str(out_path),
        ]
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[aoh2-render] Preview MP4 gerado com sucesso: {out_path}")
        return out_path
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Renderizador Age of History 2 (America do Sul das IAs) -> PNG / MP4"
    )
    p.add_argument(
        "--gravacao",
        required=True,
        help="Diretorio contendo mapa.json e turnos.jsonl",
    )
    p.add_argument(
        "--sample",
        default=None,
        help="Diretorio de saida para 6 PNGs de amostra (sample_01.png .. sample_06.png)",
    )
    p.add_argument(
        "--preview-mp4",
        default=None,
        help="Caminho do arquivo MP4 de preview a ser gerado",
    )
    p.add_argument(
        "--max-turnos",
        type=int,
        default=6,
        help="Maximo de turnos no preview MP4 (0 = todos; padrao: 6)",
    )
    p.add_argument(
        "--fps",
        type=int,
        default=20,
        help="Quadros por segundo do preview MP4 (padrao: 20)",
    )
    p.add_argument(
        "--secs-per-turn",
        type=float,
        default=3.5,
        help="Segundos por turno no preview MP4 (padrao: 3.5)",
    )
    p.add_argument(
        "--width",
        type=int,
        default=1280,
        help="Largura de rasterizacao PNG (padrao: 1280)",
    )
    p.add_argument(
        "--height",
        type=int,
        default=720,
        help="Altura de rasterizacao PNG (padrao: 720)",
    )
    p.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Numero de workers paralelos para rsvg-convert (padrao: 4)",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if not args.sample and not args.preview_mp4:
        print(
            "Erro: informe --sample <dir_out> e/ou --preview-mp4 <path.mp4>.",
            file=sys.stderr,
        )
        return 2

    mapa, turnos = carregar_gravacao(args.gravacao)
    topo = MapTopology(mapa)
    camera = CameraTrack(topo, turnos)
    event_history = build_event_history(topo, turnos)

    if args.sample:
        gerar_samples(
            topo,
            turnos,
            camera,
            event_history,
            out_dir=args.sample,
            width=args.width,
            height=args.height,
            workers=args.workers,
        )

    if args.preview_mp4:
        gerar_preview_mp4(
            topo,
            turnos,
            camera,
            event_history,
            out_mp4=args.preview_mp4,
            max_turnos=args.max_turnos,
            fps=args.fps,
            secs_per_turn=args.secs_per_turn,
            width=args.width,
            height=args.height,
            workers=args.workers,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
