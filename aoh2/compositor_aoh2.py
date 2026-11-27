#!/usr/bin/env python3
"""Compositor multi-tela AoH2 v2 (5 telas + guerra tatica SVG + GIFs + selos + camera follow).

Lê `video/youtube/aoh2/timeline_aoh2.json`, `video/youtube/aoh2/cenas_coreografia.json`
e as gravações (`partida1` e `partida2`), reaproveita a geometria vetorial de
`aoh2/render_aoh2.py` pintando cada província com a cor da IA (`IA_META`),
integra as camadas vetoriais v2 (`anim.guerra_svg` e `anim.telas_svg`),
rasteriza via `rsvg-convert` em paralelo e compõe GIFs animados de meme com Pillow.

Uso:
  python3 aoh2/compositor_aoh2.py --cenas A1,A2,A3,B1,B2 --stills-dir <pasta>
  python3 aoh2/compositor_aoh2.py --cenas A1,A2,A3,B1,B2 --out <mudo_540p.mp4> --width 960 --height 540 --workers 6
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import math
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageSequence

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "aoh2"))
import render_aoh2 as R  # noqa: E402
from anim.guerra_svg import (  # noqa: E402
    bezier_control_point,
    compute_camera_follow,
    render_battle_explosion_fx,
    render_marching_column,
    render_radial_capture_overlay,
    render_soldiers_clash_fx,
    render_tactical_war_layer,
    render_torn_treaty_fx,
)
from anim.telas_svg import (  # noqa: E402
    render_a2_poster_v2,
    render_a3_rules_v2,
    render_dois_baloes_v2,
    render_hard_words_callout,
    render_paged_narrator_bar,
    render_pensamento_v2,
    render_timelapse_hud,
)
from anim.climax_svg import (  # noqa: E402
    render_c1_roleta_v2,
    render_cracking_shield_fx,
    render_dado_grande_v2,
    render_e1_placar_flip,
    render_e2_premios_placas,
    render_e3_ida_vs_revanche,
    render_gag_counters_hud,
)

DEFAULT_TIMELINE = REPO_ROOT / "video" / "youtube" / "aoh2" / "timeline_aoh2.json"
DEFAULT_COREO = REPO_ROOT / "video" / "youtube" / "aoh2" / "cenas_coreografia.json"
GRAV_DIR = REPO_ROOT / "aoh2" / "gravacoes"
PUBLIC_DIR = REPO_ROOT / "video" / "remotion" / "public"

SVG_W, SVG_H = 1920, 1080
FONT_SANS = R.FONT_SANS
FONT_MONO = R.FONT_MONO

# Paleta oficial do canal por IA (direcao_edicao.md)
IA_META: dict[str, dict[str, str]] = {
    "sonnet": {"nome": "Sonnet", "cor": "#3D7BF2", "fg": "#F8FAFC", "badge": "S"},
    "hydrogen": {"nome": "Hydrogen", "cor": "#19A974", "fg": "#F8FAFC", "badge": "H"},
    "glm": {"nome": "GLM", "cor": "#8E4DE0", "fg": "#F8FAFC", "badge": "G"},
    "ember": {"nome": "Ember", "cor": "#E0262B", "fg": "#F8FAFC", "badge": "E"},
    "deepseek": {"nome": "DeepSeek", "cor": "#1E2430", "fg": "#F8FAFC", "badge": "D"},
    "qwen": {"nome": "Qwen", "cor": "#F2802E", "fg": "#0F172A", "badge": "Q"},
    "inkling": {"nome": "Inkling", "cor": "#22C7D6", "fg": "#0F172A", "badge": "I"},
    "narrador": {"nome": "Felipe", "cor": "#FBBF24", "fg": "#0F172A", "badge": "F"},
}

COUNTRY_NAMES = {
    "brasil": "Brasil",
    "argentina": "Argentina",
    "bolivia": "Bolivia",
    "colombia": "Colombia",
    "peru": "Peru",
    "chile": "Chile",
    "venezuela": "Venezuela",
}

_DEFAULT_COREO_CACHE: dict[str, dict[str, Any]] | None = None


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def ease_out(t: float) -> float:
    t = clamp(t, 0.0, 1.0)
    return 1.0 - (1.0 - t) ** 3


def ia_key(name: str) -> str:
    return (name or "").strip().lower()


def ia_info(name: str) -> dict[str, str]:
    return IA_META.get(ia_key(name), {"nome": name, "cor": "#64748B", "fg": "#F8FAFC", "badge": "?"})


def load_coreo_map(coreo_path: str | Path | None = None) -> dict[str, dict[str, Any]]:
    p = Path(coreo_path) if coreo_path else DEFAULT_COREO
    if not p.exists():
        return {}
    raw = json.loads(p.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _get_default_coreo() -> dict[str, dict[str, Any]]:
    global _DEFAULT_COREO_CACHE
    if _DEFAULT_COREO_CACHE is None:
        _DEFAULT_COREO_CACHE = load_coreo_map(DEFAULT_COREO)
    return _DEFAULT_COREO_CACHE


def _resolve_scene_coreo(
    scene: dict[str, Any],
    coreo_map: dict[str, dict[str, Any]] | None,
) -> dict[str, Any]:
    if coreo_map is None:
        coreo_map = _get_default_coreo()
    entry = coreo_map.get(scene["id"])
    return entry if isinstance(entry, dict) else {}


def load_match_recolored(partida_num: int) -> dict[str, Any]:
    gdir = GRAV_DIR / f"partida{partida_num}"
    mapa_raw, turnos = R.carregar_gravacao(gdir)
    # Recolore todas as nacoes para a cor fixa da IA (direcao_edicao.md: cor = IA, nao pais)
    for nid, nmeta in (mapa_raw.get("nacoes") or {}).items():
        ia = ia_key(nmeta.get("ia_apelido") or nmeta.get("ia") or nid)
        if ia in IA_META:
            nmeta["cor"] = IA_META[ia]["cor"]
    for t in turnos:
        for nid, nstate in (t.get("nacoes") or {}).items():
            ia_guess = ia_key(
                nstate.get("ia_apelido")
                or (mapa_raw.get("nacoes") or {}).get(nid, {}).get("ia_apelido")
                or nid
            )
            if ia_guess in IA_META:
                nstate["cor"] = IA_META[ia_guess]["cor"]
    topo = R.MapTopology(mapa_raw)
    ev_hist = R.build_event_history(topo, turnos)
    return {"mapa": mapa_raw, "turnos": turnos, "topo": topo, "ev_hist": ev_hist}


def _province_owner_ia(topo: R.MapTopology, turn: dict[str, Any] | None, pid: str) -> str:
    if not turn:
        return ""
    pstate = (turn.get("provincias") or {}).get(pid) or {}
    dono = pstate.get("dono") or (topo.provincias.get(pid) or {}).get("pais_inicial") or ""
    if not dono:
        return ""
    t_n = (turn.get("nacoes") or {}).get(dono) or {}
    m_n = topo.nation_meta(dono)
    return ia_key(t_n.get("ia_apelido") or m_n.get("ia_apelido") or dono)


def _nation_cor_from_turn(topo: R.MapTopology, turn: dict[str, Any], dono: str) -> str:
    if not dono:
        return "#64748B"
    t_n = (turn.get("nacoes") or {}).get(dono) or {}
    m_n = topo.nation_meta(dono)
    ia = ia_key(t_n.get("ia_apelido") or m_n.get("ia_apelido") or dono)
    if ia in IA_META:
        return IA_META[ia]["cor"]
    return t_n.get("cor") or m_n.get("cor") or "#64748B"


def _parse_loss_from_label(label: Any) -> int:
    if not label:
        return 0
    m = re.search(r"-\s*([0-9][0-9.,]*)", str(label))
    if not m:
        return 0
    digits = re.sub(r"[^0-9]", "", m.group(1))
    return int(digits) if digits else 0


# ---------------------------------------------------------------------------
# Retratos SVG proprios das 7 IAs + Elementos visuais compartilhados
# ---------------------------------------------------------------------------


def render_ia_portrait(ia: str, cx: float, cy: float, r: float, highlight: bool = False) -> str:
    k = ia_key(ia)
    info = ia_info(k)
    cor = info["cor"]
    fg = info["fg"]
    rim = "#FDE047" if highlight else ("#C8D3DD" if k == "deepseek" else "#F8FAFC")
    rim_w = 5.0 if highlight else 3.0
    halo = (
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r + 9:.1f}" fill="{cor}" opacity="0.28"/>'
        if highlight
        else ""
    )

    icon = ""
    if k == "ember":
        # Chama no topo
        icon = (
            f'<path d="M{cx:.1f},{cy - r - 12:.1f} '
            f'C{cx - r * 0.25:.1f},{cy - r * 0.65:.1f} {cx - r * 0.35:.1f},{cy - r * 0.25:.1f} {cx:.1f},{cy - r * 0.42:.1f} '
            f'C{cx + r * 0.35:.1f},{cy - r * 0.25:.1f} {cx + r * 0.25:.1f},{cy - r * 0.65:.1f} {cx:.1f},{cy - r - 12:.1f}Z" '
            f'fill="#FDE047" stroke="#991B1B" stroke-width="2"/>'
        )
    elif k == "hydrogen":
        # Oculos escuros estilizados na parte superior
        gw = r * 0.42
        icon = (
            f'<rect x="{cx - gw - 3:.1f}" y="{cy - r * 0.68:.1f}" width="{gw:.1f}" height="{r * 0.24:.1f}" rx="4" fill="#0F172A" stroke="#F8FAFC" stroke-width="1.6"/>'
            f'<rect x="{cx + 3:.1f}" y="{cy - r * 0.68:.1f}" width="{gw:.1f}" height="{r * 0.24:.1f}" rx="4" fill="#0F172A" stroke="#F8FAFC" stroke-width="1.6"/>'
            f'<line x1="{cx - 3:.1f}" y1="{cy - r * 0.56:.1f}" x2="{cx + 3:.1f}" y2="{cy - r * 0.56:.1f}" stroke="#F8FAFC" stroke-width="2"/>'
        )
    elif k == "glm":
        # Coroa de louro/pontas douradas
        icon = (
            f'<polygon points="{cx - r * 0.45:.1f},{cy - r + 4:.1f} {cx - r * 0.25:.1f},{cy - r - 10:.1f} '
            f'{cx:.1f},{cy - r + 1:.1f} {cx + r * 0.25:.1f},{cy - r - 10:.1f} {cx + r * 0.45:.1f},{cy - r + 4:.1f}" '
            f'fill="#FBBF24" stroke="#4C1D95" stroke-width="2" stroke-linejoin="round"/>'
        )
    elif k == "sonnet":
        # Crista de elmo
        icon = (
            f'<path d="M{cx - r * 0.48:.1f},{cy - r * 0.58:.1f} Q{cx:.1f},{cy - r * 1.18:.1f} {cx + r * 0.48:.1f},{cy - r * 0.58:.1f}" '
            f'fill="none" stroke="#93C5FD" stroke-width="4.5" stroke-linecap="round"/>'
        )
    elif k == "deepseek":
        # Moeda rachada no topo-direito
        mx, my = cx + r * 0.58, cy - r * 0.58
        icon = (
            f'<circle cx="{mx:.1f}" cy="{my:.1f}" r="{r * 0.26:.1f}" fill="#FBBF24" stroke="#0F172A" stroke-width="1.8"/>'
            f'<path d="M{mx - 2:.1f},{my - r * 0.2:.1f} L{mx + 2:.1f},{my:.1f} L{mx - 2:.1f},{my + r * 0.2:.1f}" stroke="#7F1D1D" stroke-width="2" fill="none"/>'
        )
    elif k == "qwen":
        # Megafone lateral
        mx, my = cx + r * 0.62, cy - r * 0.52
        icon = (
            f'<polygon points="{mx - 8:.1f},{my} {mx + 10:.1f},{my - 9:.1f} {mx + 10:.1f},{my + 9:.1f}" '
            f'fill="#FDE047" stroke="#7C2D12" stroke-width="1.8" stroke-linejoin="round"/>'
        )
    elif k == "inkling":
        # Pena de escrever
        mx, my = cx + r * 0.56, cy - r * 0.58
        icon = (
            f'<path d="M{mx - 6:.1f},{my + 10:.1f} Q{mx + 4:.1f},{my - 12:.1f} {mx + 14:.1f},{my - 14:.1f} '
            f'Q{mx + 8:.1f},{my + 4:.1f} {mx - 6:.1f},{my + 10:.1f}Z" fill="#F8FAFC" stroke="#0E7490" stroke-width="1.6"/>'
        )

    return (
        f'<g>'
        f'{halo}'
        f'<circle cx="{cx + 2:.1f}" cy="{cy + 4:.1f}" r="{r:.1f}" fill="#000000" opacity="0.45"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{cor}" stroke="{rim}" stroke-width="{rim_w:.1f}"/>'
        f'<text x="{cx:.1f}" y="{cy + r * 0.34:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="{r * 0.96:.1f}" font-weight="900" fill="{fg}">{R.esc(info["badge"])}</text>'
        f'{icon}'
        f'</g>'
    )


def render_echo_arcs(cx: float, cy: float, cor: str, t_sec: float) -> str:
    """Tres arcos de eco pulsantes para pensamentos secretos (substitui sussurro)."""
    parts = []
    for i in range(3):
        phase = (t_sec * 1.8 - i * 0.25) % 1.0
        op = 0.25 + 0.65 * math.sin(phase * math.pi)
        rad = 18.0 + i * 14.0
        parts.append(
            f'<path d="M{cx + rad * 0.7:.1f},{cy - rad * 0.7:.1f} '
            f'A{rad:.1f},{rad:.1f} 0 0,1 {cx + rad * 0.7:.1f},{cy + rad * 0.7:.1f}" '
            f'fill="none" stroke="{cor}" stroke-width="3.2" stroke-linecap="round" opacity="{op:.2f}"/>'
        )
    return "".join(parts)


def render_narrator_bar(texto: str, progress: float = 1.0) -> str:
    """Wrapper compativel para a legenda paginada v2 (ZERO '...' cortando frases)."""
    return render_paged_narrator_bar(texto, progress, IA_META)


def render_seal_svg(
    texto: str,
    cx: float,
    cy: float,
    angle: float,
    prog: float,
    accent: str = "#EF4444",
    max_w: float | None = None,
) -> str:
    e = ease_out(clamp(prog / 0.18, 0.0, 1.0))
    scale = 1.45 - 0.45 * e
    op = clamp(prog / 0.10, 0.0, 1.0) * clamp((1.0 - prog) / 0.12, 0.0, 1.0)
    w = max(320, len(texto) * 23 + 64)
    if max_w is not None and w > max_w:
        scale *= max(0.55, max_w / float(w))
    h = 74
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f}) rotate({angle:.1f}) scale({scale:.3f})" opacity="{op:.2f}">'
        f'<rect x="{-w * 0.5 + 4:.1f}" y="{-h * 0.5 + 6:.1f}" width="{w:.1f}" height="{h}" rx="10" fill="#000000" opacity="0.55"/>'
        f'<rect x="{-w * 0.5:.1f}" y="{-h * 0.5:.1f}" width="{w:.1f}" height="{h}" rx="10" '
        f'fill="#0B111E" fill-opacity="0.94" stroke="{accent}" stroke-width="5"/>'
        f'<rect x="{-w * 0.5 + 6:.1f}" y="{-h * 0.5 + 6:.1f}" width="{w - 12:.1f}" height="{h - 12}" rx="6" '
        f'fill="none" stroke="{accent}" stroke-width="1.5" stroke-dasharray="10,4" opacity="0.65"/>'
        f'<text x="0" y="13" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="34" font-weight="900" fill="#F8FAFC" letter-spacing="1.8">{R.esc(texto)}</text>'
        f'</g>'
    )


def render_speech_overlay(fala: dict[str, Any], t_sec: float, prog: float, cor_override: str | None = None) -> str:
    ia = fala["ia"]
    tipo = fala["tipo"]
    info = ia_info(ia)
    cor = cor_override or info["cor"]
    texto = fala["texto"]

    x, w = 32, 880
    # Wrap conservador por palavra sem truncar e sem estourar a borda direita
    lines = R.wrap_lines(texto, width=42, max_lines=20)
    font_sz, line_h = 27, 35
    if len(lines) > 5:
        lines = R.wrap_lines(texto, width=46, max_lines=24)
        font_sz, line_h = 25, 32
    vis_lines = min(len(lines), 6)
    h = max(195, 114 + vis_lines * line_h)
    y = SVG_H - h - 22

    if tipo == "pensamento":
        bg = "#F3E2A9"
        fg = "#1E293B"
        border = "#78350F"
        tag = "SO VOCE VE · PENSAMENTO"
        tag_bg = "#78350F"
        tag_fg = "#FEF3C7"
    elif tipo == "dm":
        bg = "#131D2E"
        fg = "#F8FAFC"
        border = cor
        dest = COUNTRY_NAMES.get((fala.get("destino") or "").lower(), fala.get("destino") or "")
        tag = f"MENSAGEM PRIVADA -> {dest.upper()}" if dest else "MENSAGEM PRIVADA"
        tag_bg = cor
        tag_fg = info["fg"]
    else:
        bg = "#F8FAFC"
        fg = "#0F172A"
        border = cor
        tag = "FALA PUBLICA"
        tag_bg = cor
        tag_fg = info["fg"]

    op = clamp(prog / 0.08, 0.0, 1.0)
    avail_h = h - 104
    total_txt_h = len(lines) * line_h
    scroll_y = max(0.0, total_txt_h - avail_h) * clamp((prog - 0.14) / 0.74, 0.0, 1.0) if total_txt_h > avail_h else 0.0
    clip_id = f"sp_clip_{ia}_{int(fala.get('at', 0))}"

    parts = [
        f'<g opacity="{op:.2f}">',
        f'<defs><clipPath id="{clip_id}"><rect x="{x + 18}" y="{y + 78}" width="{w - 38}" height="{avail_h + 6}"/></clipPath></defs>',
        f'<rect x="{x + 5}" y="{y + 7}" width="{w}" height="{h}" rx="16" fill="#000000" opacity="0.55"/>',
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{bg}" stroke="{border}" stroke-width="3.5"/>',
        render_ia_portrait(ia, x + 48, y + 46, 30, highlight=True),
        f'<text x="{x + 92}" y="{y + 44}" font-family="{FONT_SANS}" font-size="28" font-weight="900" fill="{fg}">{R.esc(info["nome"])}</text>',
        f'<rect x="{x + w - 344}" y="{y + 18}" width="322" height="34" rx="8" fill="{tag_bg}"/>',
        f'<text x="{x + w - 183}" y="{y + 42}" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" font-weight="700" fill="{tag_fg}">{R.esc(tag)}</text>',
    ]
    if tipo == "pensamento":
        parts.append(render_echo_arcs(x + w - 42, y + h - 42, "#92400E", t_sec))

    parts.append(f'<g clip-path="url(#{clip_id})">')
    n_lns = max(1, len(lines))
    for i, ln in enumerate(lines):
        trig_l = (i / float(n_lns)) * 0.75
        op_ln = clamp((prog - trig_l + 0.16) / 0.14, 0.22, 1.0)
        parts.append(
            f'<text x="{x + 26}" y="{y + 106 + i * line_h - scroll_y:.1f}" font-family="{FONT_SANS}" '
            f'font-size="{font_sz}" font-weight="700" fill="{fg}" opacity="{op_ln:.2f}">{R.esc(ln)}</text>'
        )
    parts.append("</g></g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# Determinacao de camera e estado do mapa por cena
# ---------------------------------------------------------------------------


def scene_map_context(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    coreo: dict[str, Any] | None = None,
) -> tuple[int, int, tuple[float, float] | None, float, float]:
    sid = scene["id"]
    coreo = coreo or {}
    # Defaults extraidos da coreografia ou das citacoes
    partida = 2 if sid.startswith(("A1", "A3", "C", "D", "E")) else 1
    turno = 25 if sid == "A1" else 1
    if coreo.get("partida") is not None:
        partida = int(coreo["partida"])
    if coreo.get("turno") is not None:
        turno = int(coreo["turno"])
    else:
        for f in scene.get("falas", []):
            if f.get("partida") and f.get("turno") is not None:
                partida = int(f["partida"])
                turno = int(f["turno"])
                break

    m = matches[partida]
    topo: R.MapTopology = m["topo"]
    dur = max(1, scene["dur"])
    t_norm = local_f / dur

    focus_pids: list[str] = []
    extra_zoom = 1.0
    freeze_tanim: float | None = None

    if sid == "A1":
        partida, turno = 2, 25
        focus_pids = ["ar_buenos_aires", "cs_montevideu", "cs_litoral_uy"]
        # Zoom de soco no meio do Rio da Prata e congela antes do resultado!
        punch = ease_out(clamp((t_norm - 0.55) / 0.12, 0.0, 1.0))
        extra_zoom = 1.15 + 0.22 * punch
        freeze_tanim = min(0.46, t_norm * 0.65)
    elif sid == "B1":
        partida, turno = 1, 1
        focus_pids = ["ve_guayana", "br_roraima_amapa", "br_amazonas", "ve_caracas"]
        extra_zoom = 1.08 + 0.05 * t_norm
    elif sid == "B4":
        partida, turno = 1, 7 if t_norm < 0.55 else 10
        focus_pids = ["co_bogota", "ve_caracas", "ve_zulia"]
    elif sid == "B6":
        partida, turno = 1, 13
        focus_pids = ["ve_guayana", "co_bogota", "co_andes_norte"]
    elif sid == "B8":
        focus_pids = ["br_brasilia", "br_centro_oeste", "br_sul"]
    elif sid in ("B10", "D1"):
        focus_pids = ["cs_chaco_py", "ar_chaco_meso", "cs_assuncao"]
    elif sid in ("B12", "D18", "D20"):
        focus_pids = ["ar_buenos_aires", "cs_montevideu", "cs_litoral_uy"]
    elif sid in ("D5", "D10"):
        focus_pids = ["pe_arequipa", "bo_la_paz", "pe_lima"]
    elif sid in ("D6", "D13", "D14", "D16", "D22"):
        focus_pids = ["ve_caracas", "co_bogota", "br_roraima_amapa", "br_brasilia"]

    center_pt: tuple[float, float] | None = None
    if focus_pids:
        pts = [topo.centers[p] for p in focus_pids if p in topo.centers]
        if pts:
            center_pt = (sum(x for x, _ in pts) / len(pts), sum(y for _, y in pts) / len(pts))

    t_anim = freeze_tanim if freeze_tanim is not None else clamp(0.18 + 0.72 * t_norm, 0.05, 0.96)
    return partida, turno, center_pt, extra_zoom if sid == "A1" else (1.06 + 0.04 * t_norm), t_anim


# ---------------------------------------------------------------------------
# Renderizadores das 5 telas (v2)
# ---------------------------------------------------------------------------


def render_bg_war_room() -> str:
    grid = []
    for gx in range(0, SVG_W + 1, 120):
        grid.append(f'<line x1="{gx}" y1="0" x2="{gx}" y2="{SVG_H}" stroke="#1B2C3A" stroke-width="1"/>')
    for gy in range(0, SVG_H + 1, 120):
        grid.append(f'<line x1="0" y1="{gy}" x2="{SVG_W}" y2="{gy}" stroke="#1B2C3A" stroke-width="1"/>')
    return (
        f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="#0E1A24"/>'
        + "".join(grid)
    )


def _river_climax_anchor(topo: R.MapTopology) -> tuple[float, float]:
    p_mvd = topo.centers.get("cs_montevideu")
    p_bsas = topo.centers.get("ar_buenos_aires")
    if p_mvd and p_bsas:
        return ((p_mvd[0] + p_bsas[0]) * 0.5, (p_mvd[1] + p_bsas[1]) * 0.5)
    return (topo.sa_cx, topo.sa_cy + 140.0)


def _render_screen_mapa_meta(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> tuple[str, int, int]:
    sid = scene["id"]
    dur = max(1, int(scene["dur"]))
    fps_safe = max(1.0, float(fps or 30))
    t_sec = local_f / fps_safe
    coreo = _resolve_scene_coreo(scene, coreo_map)
    is_cold_open = sid == "A1"
    is_d20_river = sid == "D20"
    is_d17_ba = sid == "D17"

    partida, target_turno, center_pt, _cam_zoom, _t_anim_fb = scene_map_context(
        scene, local_f, matches, coreo=coreo
    )
    m = matches[partida]
    topo: R.MapTopology = m["topo"]
    turnos: list[dict[str, Any]] = m["turnos"]
    target_turno = int(clamp(target_turno, 0, len(turnos) - 1))

    # 1. Timelapse linear dos turnos intermediarios (timelapse_de -> ... -> turno)
    raw_tl_de = coreo.get("timelapse_de")
    has_timelapse = (
        not is_cold_open
        and not is_d20_river
        and raw_tl_de is not None
        and int(raw_tl_de) < target_turno
        and dur > 2
    )
    if has_timelapse:
        tl_start = int(clamp(int(raw_tl_de), 0, target_turno - 1))
        tl_frames = min(42, max(24, dur // 5))
        tl_frames = min(tl_frames, dur - 1)
    else:
        tl_start = target_turno
        tl_frames = 0

    in_timelapse = has_timelapse and local_f < tl_frames

    if in_timelapse:
        tl_prog = clamp(local_f / max(1, tl_frames - 1), 0.0, 1.0)
        span = max(1, target_turno - tl_start)
        f_step = tl_prog * span
        step_i = int(math.floor(f_step))
        turno_idx = min(target_turno, tl_start + step_i)
        sub_t = 0.85 if turno_idx >= target_turno else (f_step - step_i)
        t_anim = clamp(0.20 + 0.72 * sub_t, 0.15, 0.95)
        t_action = 0.0
    else:
        tl_prog = 1.0
        turno_idx = target_turno
        action_dur = max(1, dur - tl_frames)
        action_f = max(0, local_f - tl_frames)
        t_action = clamp(action_f / action_dur, 0.0, 1.0)
        if is_cold_open:
            # A1: seta avanca ate o meio do Rio da Prata, leva zoom de soco e CONGELA
            t_anim = min(0.46, t_action * 0.95)
        elif is_d20_river:
            # D20: comeca exatamente no quadro congelado de A1, quebra em BsAs e cai Montevideu
            if t_action < 0.18:
                t_anim = 0.46
            elif t_action < 0.62:
                t_anim = 0.46 + 0.16 * ((t_action - 0.18) / 0.44)
            elif t_action < 0.90:
                t_anim = 0.65
            else:
                t_anim = clamp(0.70 + 0.26 * ((t_action - 0.90) / 0.10), 0.70, 0.96)
        else:
            if t_action < 0.62:
                t_anim = clamp(0.18 + 0.44 * (t_action / 0.62), 0.15, 0.62)
            elif t_action < 0.90:
                t_anim = 0.65
            else:
                t_anim = clamp(0.70 + 0.26 * ((t_action - 0.90) / 0.10), 0.70, 0.96)

    turn = turnos[turno_idx]
    prev_turn = turnos[turno_idx - 1] if turno_idx > 0 else None

    # Na abertura A1 e no inicio congelado de D20, nao entregar vencedor nem eliminacao!
    hide_t25_end = is_cold_open or (is_d20_river and t_action < 0.62)
    turn_hud = dict(turn)
    ev_list = m["ev_hist"][turno_idx]
    if hide_t25_end and prev_turn is not None:
        turn_hud.pop("vencedor", None)
        ev_list = m["ev_hist"][max(0, turno_idx - 1)]
        war_pairs, war_by_nation = R._extract_wars(prev_turn)
        ranking = R._build_ranking(topo, prev_turn, war_by_nation)
    else:
        war_pairs, war_by_nation = R._extract_wars(turn)
        ranking = R._build_ranking(topo, turn, war_by_nation)

    # Preencher battle_pids / conquered_pids / baixas do turno
    battle_pids: set[str] = set()
    battle_losses: dict[str, int] = {}
    conquered_pids: set[str] = set()
    mov_losses: dict[str, int] = {}
    mov_atk_cor: dict[str, str] = {}

    for mov in turn.get("movimentos") or []:
        para = mov.get("para")
        if not para:
            continue
        perdas = int(round(float(mov.get("perdas_atk") or 0))) + int(round(float(mov.get("perdas_def") or 0)))
        is_atk = str(mov.get("tipo") or "").lower() in ("ataque", "invasao", "combate")
        is_conq = bool(mov.get("conquistada"))
        if perdas > 0 or is_conq or is_atk:
            battle_pids.add(para)
            if perdas > 0:
                mov_losses[para] = mov_losses.get(para, 0) + perdas
                if not hide_t25_end and (in_timelapse or t_action >= 0.62):
                    battle_losses[para] = battle_losses.get(para, 0) + perdas
            de = mov.get("de")
            if de and para not in mov_atk_cor:
                atk_ia = _province_owner_ia(topo, prev_turn or turn, de)
                if atk_ia in IA_META:
                    mov_atk_cor[para] = IA_META[atk_ia]["cor"]
        if is_conq:
            conquered_pids.add(para)

    if prev_turn is not None:
        cur_provs = turn.get("provincias") or {}
        prev_provs = prev_turn.get("provincias") or {}
        for pid in topo.provincias:
            d_now = (cur_provs.get(pid) or {}).get("dono")
            d_prev = (prev_provs.get(pid) or {}).get("dono")
            if d_now and d_prev and d_now != d_prev:
                conquered_pids.add(pid)

    # 2. Camera follow acompanhando rotas_soldados + framing especial A1 / D17 / D20
    rotas_soldados = [r for r in (coreo.get("rotas_soldados") or []) if isinstance(r, dict)]
    alvos_taticos = [a for a in (coreo.get("alvos_taticos") or []) if isinstance(a, dict)]

    cam_rotas: list[dict[str, Any]] = list(rotas_soldados)
    if not cam_rotas and alvos_taticos:
        cam_rotas = [{"para": a["pid"]} for a in alvos_taticos if a.get("pid") in topo.centers]
    if not cam_rotas and center_pt is not None and topo.centers:
        best_pid = min(
            topo.centers.keys(),
            key=lambda p: (topo.centers[p][0] - center_pt[0]) ** 2 + (topo.centers[p][1] - center_pt[1]) ** 2,
        )
        cam_rotas = [{"para": best_pid}]

    impacto_shake = bool(coreo.get("impacto_shake"))
    base_zoom = 1.14 if rotas_soldados else 1.08
    punch_zoom = impacto_shake and not is_cold_open and not is_d20_river
    shake_at = 0.62 if impacto_shake else None

    if is_cold_open:
        rx, ry = _river_climax_anchor(topo)
        cam_cx, cam_cy = rx, ry
        # Zoom de soco 1.56 -> 1.84 em ~0.12s perto de t_action=0.40 e CONGELA
        punch_u = ease_out(clamp((t_action - 0.36) / 0.06, 0.0, 1.0))
        zoom = 1.56 + 0.28 * punch_u
        if t_action < 0.44:
            cam_cx += math.sin(t_action * 5.0) * 3.0
            cam_cy += math.cos(t_action * 4.0) * 2.5
        shake_dx, shake_dy = 0.0, 0.0
    elif is_d20_river:
        rx, ry = _river_climax_anchor(topo)
        mvd_pt = topo.centers.get("cs_montevideu", (rx + 18.0, ry + 6.0))
        pan_mvd = ease_out(clamp((t_action - 0.50) / 0.22, 0.0, 1.0))
        cam_cx = rx + (mvd_pt[0] - rx) * 0.45 * pan_mvd
        cam_cy = ry + (mvd_pt[1] - ry) * 0.45 * pan_mvd
        zoom = 1.84 - 0.22 * pan_mvd
        # Shake em BsAs (0.44) e em Montevideu (0.66)
        shake_dx, shake_dy = 0.0, 0.0
        for s_t in (0.44, 0.66):
            if s_t <= t_action <= s_t + 0.14:
                dt_s = (t_action - s_t) / 0.14
                amp = 14.0 * math.exp(-dt_s * 4.2)
                shake_dx += amp * math.sin(dt_s * 42.0)
                shake_dy += amp * 0.7 * math.cos(dt_s * 36.0)
    elif is_d17_ba and not in_timelapse:
        ba_pt = topo.centers.get("ar_buenos_aires", _river_climax_anchor(topo))
        cam_cx = ba_pt[0] + math.sin(t_action * 4.0) * 4.0
        cam_cy = ba_pt[1] + math.cos(t_action * 3.5) * 3.5
        zoom = 1.58 + 0.08 * t_action
        shake_dx, shake_dy = 0.0, 0.0
        if 0.80 <= t_action <= 0.94:
            dt_s = (t_action - 0.80) / 0.14
            amp = 15.0 * math.exp(-dt_s * 4.0)
            shake_dx = amp * math.sin(dt_s * 45.0)
            shake_dy = amp * 0.7 * math.cos(dt_s * 38.0)
    elif in_timelapse:
        cx0, cy0, z0, _, _ = compute_camera_follow(
            topo,
            cam_rotas,
            0.0,
            base_zoom=base_zoom,
            punch_zoom=False,
            shake_at=None,
        )
        e_tl = ease_out(tl_prog)
        cam_cx = topo.sa_cx + (cx0 - topo.sa_cx) * e_tl
        cam_cy = topo.sa_cy + (cy0 - topo.sa_cy) * e_tl
        zoom = 1.02 + (z0 - 1.02) * e_tl
        shake_dx, shake_dy = 0.0, 0.0
    else:
        cam_cx, cam_cy, zoom, shake_dx, shake_dy = compute_camera_follow(
            topo,
            cam_rotas,
            t_action,
            base_zoom=base_zoom,
            punch_zoom=punch_zoom,
            shake_at=shake_at,
        )

    # Enquadramento vertical seguro: evita cortar Norte sob HUD (y=72) e Sul sob balao inferior
    if is_cold_open or is_d20_river or is_d17_ba:
        view_cy = 485.0
    elif cam_cy < 420.0:
        view_cy = 576.0 + (622.0 - 576.0) * clamp((420.0 - cam_cy) / 160.0, 0.0, 1.0)
    elif cam_cy > 670.0:
        view_cy = 576.0 - (576.0 - 498.0) * clamp((cam_cy - 670.0) / 180.0, 0.0, 1.0)
    else:
        view_cy = R.VIEWPORT_CENTER_Y

    tx = R.VIEWPORT_CENTER_X - cam_cx * zoom + shake_dx
    ty = view_cy - cam_cy * zoom + shake_dy

    provs_svg, resolved = R._render_provinces_and_borders(
        topo, turn, prev_turn, t_anim, war_pairs, battle_pids, conquered_pids
    )

    # 3. Camadas de guerra v2 (onda radial de captura, tatica, soldados marchando, explosoes)
    capture_svgs: list[str] = []
    tactical_map_svg = ""
    march_svgs: list[str] = []
    clash_svgs: list[str] = []
    explosion_svgs: list[str] = []
    expl_targets: dict[str, tuple[str, int, bool]] = {}
    ba_shield_svg = ""
    ba_waves_held = 0
    d20_badge_svg = ""

    if not in_timelapse:
        if not (is_d20_river and t_action < 0.18) and not (is_d17_ba and t_action < 0.82):
            tactical_map_svg = render_tactical_war_layer(
                topo,
                coreo,
                t_action,
                t_sec,
                IA_META,
                include_map_layer=True,
                include_hud_box=False,
            )

        # Colunas marchando (soldados terrestres ou navios de guerra)
        for idx, rota in enumerate(rotas_soldados):
            de = rota.get("de")
            para = rota.get("para")
            if not de or not para or de == para:
                continue
            if de not in topo.centers or para not in topo.centers:
                continue
            x0, y0 = topo.centers[de]
            x2, y2 = topo.centers[para]
            x1, y1 = bezier_control_point(x0, y0, x2, y2, idx=idx, bend_factor=0.19)
            r_ia = ia_key(rota.get("ia") or "")
            cor_r = ia_info(r_ia)["cor"] if r_ia else "#EF4444"
            qtd_r = rota.get("qtd") or 0
            naval_r = bool(rota.get("naval"))
            col_lbl = ""

            if is_cold_open:
                # A1: avanca ate a metade do Rio da Prata (0.50) ate t_action=0.42 e CONGELA
                march_p = clamp(t_action / 0.42, 0.08, 1.0) * 0.50
                col_lbl = "SOLDADOS"
            elif is_d20_river:
                if idx == 0:
                    # Seta azul "165": comeca exatamente parada no meio (0.50) e quebra em BsAs em 0.44
                    if t_action < 0.18:
                        march_p = 0.50
                    elif t_action <= 0.46:
                        march_p = 0.50 + 0.50 * clamp((t_action - 0.18) / 0.26, 0.0, 1.0)
                    else:
                        march_p = 0.0
                    col_lbl = "SOLDADOS"
                else:
                    # Setas vermelhas do Chile so partem depois do congelamento inicial
                    march_p = clamp((t_action - 0.36) / 0.30, 0.0, 1.0)
            elif is_d17_ba:
                # D17 usa o visual ritmado de 9 ondas no escudo de Buenos Aires
                march_p = 0.0
            else:
                stagger = min(0.16, idx * 0.04)
                march_p = clamp((t_action - stagger) / max(0.18, 0.62 - stagger), 0.0, 1.0)

            if march_p > 0.01:
                march_svgs.append(
                    render_marching_column(
                        x0,
                        y0,
                        x1,
                        y1,
                        x2,
                        y2,
                        march_p,
                        cor_r,
                        qtd_r,
                        naval=naval_r,
                        t_sec=0.0 if (is_cold_open and t_action >= 0.44) else t_sec,
                        label=col_lbl,
                    )
                )

        # Escudo rachando em Buenos Aires na D17
        if is_d17_ba and "ar_buenos_aires" in topo.centers:
            bx_ba, by_ba = topo.centers["ar_buenos_aires"]
            ba_shield_svg, ba_waves_held = render_cracking_shield_fx(bx_ba, by_ba, t_action, t_sec)

        # Impacto + captura radial (t_action >= 0.62, ou climax D20 por fase)
        if not is_cold_open:
            label_losses: dict[str, int] = {}
            for alvo in alvos_taticos:
                apid = alvo.get("pid")
                if apid:
                    lv = _parse_loss_from_label(alvo.get("label"))
                    if lv > 0:
                        label_losses[apid] = lv

            if is_d20_river:
                # D20: primeiro quebra a seta azul 165 em BsAs (-267 em 0.44), depois Montevideu (-161 em 0.66)
                if t_action >= 0.44 and "ar_buenos_aires" in topo.centers:
                    k_bs = clamp((t_action - 0.44) / 0.34, 0.0, 1.0)
                    bx_p, by_p = topo.centers["ar_buenos_aires"]
                    explosion_svgs.append(
                        render_battle_explosion_fx(bx_p, by_p, k_bs, "#3D7BF2", perdas=267, conquistada=False)
                    )
                if t_action >= 0.62 and "cs_montevideu" in topo.centers:
                    k_cap_m = clamp((t_action - 0.62) / 0.24, 0.0, 1.0)
                    k_exp_m = clamp((t_action - 0.64) / 0.32, 0.0, 1.0)
                    poly_m = topo.poly_points_str.get("cs_montevideu", "")
                    mx_p, my_p = topo.centers["cs_montevideu"]
                    if poly_m:
                        capture_svgs.append(
                            render_radial_capture_overlay(poly_m, mx_p, my_p, k_cap_m, "#E0262B", f"cap_d20_mvd")
                        )
                    explosion_svgs.append(
                        render_battle_explosion_fx(mx_p, my_p, k_exp_m, "#E0262B", perdas=161, conquistada=True)
                    )
                if t_action >= 0.68:
                    # Retrato cinza do Sonnet + badge ELIMINADO sobre Montevideu
                    d20_badge_svg = (
                        '<g transform="translate(1150,245)">'
                        '<rect x="-210" y="-44" width="420" height="88" rx="16" fill="#090F1A" fill-opacity="0.95" stroke="#64748B" stroke-width="3"/>'
                        '<circle cx="-154" cy="0" r="28" fill="#475569" stroke="#CBD5E1" stroke-width="2.5"/>'
                        '<text x="-154" y="10" text-anchor="middle" font-family="' + FONT_SANS + '" font-size="28" font-weight="900" fill="#E2E8F0">S</text>'
                        '<text x="-108" y="-6" font-family="' + FONT_SANS + '" font-size="23" font-weight="900" fill="#F8FAFC">SONNET ELIMINADO</text>'
                        '<text x="-108" y="22" font-family="' + FONT_MONO + '" font-size="16" font-weight="800" fill="#FCA5A5">TURNO 25 · ULTIMA PROVINCIA</text>'
                        '</g>'
                    )
            else:
                for rota in rotas_soldados:
                    para = rota.get("para")
                    if not para or para not in topo.centers:
                        continue
                    r_ia = ia_key(rota.get("ia") or "")
                    r_cor = ia_info(r_ia)["cor"] if r_ia else mov_atk_cor.get(para, "#EF4444")
                    def_ia = _province_owner_ia(topo, prev_turn or turn, para)
                    is_hostile = (
                        para in battle_pids
                        or para in conquered_pids
                        or (bool(r_ia) and bool(def_ia) and r_ia != def_ia)
                        or para in label_losses
                    )
                    if not is_hostile:
                        continue
                    perdas = mov_losses.get(para, 0) or label_losses.get(para, 0)
                    expl_targets[para] = (r_cor, perdas, para in conquered_pids)

                if not expl_targets and not is_d17_ba:
                    cand_pids = sorted(
                        (p for p in (conquered_pids | battle_pids) if p in topo.centers),
                        key=lambda p: (1 if p in conquered_pids else 0, mov_losses.get(p, 0)),
                        reverse=True,
                    )[:4]
                    for pid in cand_pids:
                        dono_now = ((turn.get("provincias") or {}).get(pid) or {}).get("dono") or ""
                        atk_cor = mov_atk_cor.get(pid) or _nation_cor_from_turn(topo, turn, dono_now)
                        perdas = mov_losses.get(pid, 0) or label_losses.get(pid, 0)
                        expl_targets[pid] = (atk_cor, perdas, pid in conquered_pids)

                if 0.46 <= t_action < 0.64 and not is_d17_ba:
                    for pid, (cor_atk, _perdas, _is_conq) in expl_targets.items():
                        cx_e, cy_e = topo.centers[pid]
                        def_ia = _province_owner_ia(topo, prev_turn or turn, pid)
                        cor_def = ia_info(def_ia)["cor"] if def_ia in IA_META else "#64748B"
                        clash_svgs.append(render_soldiers_clash_fx(cx_e, cy_e, t_sec, cor_atk, cor_def))

                if t_action >= 0.62 and not is_d17_ba:
                    k_cap = clamp((t_action - 0.62) / 0.28, 0.0, 1.0)
                    k_exp = clamp((t_action - 0.62) / 0.34, 0.0, 1.0)
                    for pid in sorted(conquered_pids):
                        poly_str = topo.poly_points_str.get(pid, "")
                        pt = topo.centers.get(pid)
                        if not poly_str or not pt:
                            continue
                        dono_now = ((turn.get("provincias") or {}).get(pid) or {}).get("dono") or ""
                        new_cor = _nation_cor_from_turn(topo, turn, dono_now)
                        capture_svgs.append(
                            render_radial_capture_overlay(
                                poly_str,
                                pt[0],
                                pt[1],
                                k_cap,
                                new_cor,
                                f"cap_{sid}_{turno_idx}_{pid}",
                            )
                        )
                    for pid, (cor_atk, perdas, is_conq) in expl_targets.items():
                        cx_e, cy_e = topo.centers[pid]
                        explosion_svgs.append(
                            render_battle_explosion_fx(
                                cx_e,
                                cy_e,
                                k_exp,
                                cor_atk,
                                perdas=perdas,
                                conquistada=is_conq,
                            )
                        )

    if not in_timelapse and not is_cold_open and t_action >= 0.62 and (expl_targets or is_d20_river or is_d17_ba):
        skip_set = set(expl_targets.keys())
        if is_d20_river:
            skip_set |= {"ar_buenos_aires", "cs_montevideu"}
        if is_d17_ba:
            skip_set |= {"ar_buenos_aires"}
        badge_losses = {k: v for k, v in battle_losses.items() if k not in skip_set}
    else:
        badge_losses = battle_losses

    legacy_arrows_svg = (
        R._render_arrows_and_impacts(topo, turn_hud, t_anim)
        if (in_timelapse or (not rotas_soldados and not is_cold_open and not is_d20_river and not is_d17_ba))
        else ""
    )

    parts = [
        f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="#040C18"/>',
        f'<g transform="translate({tx:.2f},{ty:.2f}) scale({zoom:.4f})">',
        R._render_ocean_and_grid(topo),
        R._render_continent_shadow(topo),
        provs_svg,
        "".join(capture_svgs),
        R._render_nation_watermarks(topo, turn_hud, resolved),
        legacy_arrows_svg,
        R._render_troop_badges_and_icons(topo, turn_hud, resolved, t_anim, battle_losses=badge_losses),
        tactical_map_svg,
        "".join(march_svgs),
        ba_shield_svg,
        "".join(clash_svgs),
        "".join(explosion_svgs),
        "</g>",
        R._render_top_hud(topo, turn_hud, ranking, len(war_pairs)),
        R._render_right_panel(topo, ranking, ev_list, len(war_pairs)),
        d20_badge_svg,
    ]

    # Chip de partida / turno mais legivel no topo esquerdo
    data_str = R.clean_text(turn.get("data") or turn.get("data_texto") or "").upper()
    if is_cold_open or (is_d20_river and t_action < 0.62):
        chip = f"PARTIDA {partida} · TURNO {turno_idx} · ULTIMO"
    else:
        chip = f"PARTIDA {partida} · TURNO {turno_idx} · {data_str}" if data_str else f"PARTIDA {partida} · TURNO {turno_idx}"
    parts.append(
        f'<rect x="18" y="84" width="{len(chip) * 13 + 32}" height="38" rx="8" fill="#070D17" fill-opacity="0.88" stroke="#334155" stroke-width="1.5"/>'
        f'<text x="34" y="109" font-family="{FONT_MONO}" font-size="20" font-weight="700" fill="#F8FAFC">{R.esc(chip)}</text>'
    )

    if in_timelapse:
        parts.append(render_timelapse_hud(partida, tl_start, target_turno, data_str, tl_prog))
    else:
        parts.append(
            render_tactical_war_layer(
                topo,
                coreo,
                t_action,
                t_sec,
                IA_META,
                include_map_layer=False,
                include_hud_box=True,
            )
        )
        contrato = coreo.get("contrato_rasgado")
        if isinstance(contrato, dict):
            treaty_prog = clamp((t_action - 0.08) / 0.56, 0.0, 1.0)
            parts.append(
                render_torn_treaty_fx(
                    1170.0,
                    730.0,
                    treaty_prog,
                    str(contrato.get("de_pais") or "LADO A"),
                    str(contrato.get("para_pais") or "LADO B"),
                    str(contrato.get("tipo") or "PACTO"),
                )
            )

    # Cartao de capitulo centralizado nos primeiros 2.0s (60 frames)
    if scene.get("capitulo") and local_f < 60:
        cap = scene["capitulo"]
        op_c = clamp((60 - local_f) / 12.0, 0.0, 1.0)
        sc_c = 0.94 + 0.06 * ease_out(clamp(local_f / 14.0, 0.0, 1.0))
        parts.append(
            f'<g opacity="{op_c:.2f}" transform="translate(730,310) scale({sc_c:.3f}) translate(-730,-310)">'
            f'<rect x="120" y="218" width="1220" height="184" rx="18" fill="#081221" fill-opacity="0.95" stroke="#FBBF24" stroke-width="3.6"/>'
            f'<text x="730" y="282" text-anchor="middle" font-family="{FONT_MONO}" font-size="26" font-weight="800" fill="#FBBF24">{R.esc(cap["titulo"])}</text>'
            f'<text x="730" y="352" text-anchor="middle" font-family="{FONT_SANS}" font-size="48" font-weight="900" fill="#F8FAFC">{R.esc(cap["subtitulo"])}</text>'
            f'</g>'
        )
    return "".join(parts), turno_idx, ba_waves_held


def render_screen_mapa(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> str:
    svg, _, _ = _render_screen_mapa_meta(scene, local_f, matches, coreo_map=coreo_map, fps=fps)
    return svg


def render_screen_capitulo(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    active_fala: dict[str, Any] | None,
    fps: int = 30,
) -> str:
    sid = scene["id"]
    dur = max(1, scene["dur"])
    t_norm = clamp(local_f / dur, 0.0, 1.0)
    t_sec = local_f / max(1.0, float(fps or 30))
    m = matches[1]
    topo: R.MapTopology = m["topo"]

    if sid == "A2":
        return render_a2_poster_v2(
            topo=topo,
            mapa=m["mapa"],
            turn0=m["turnos"][0],
            t_norm=t_norm,
            active_fala=active_fala,
            render_portrait_fn=render_ia_portrait,
            ia_meta=IA_META,
        )
    if sid == "C1":
        m2 = matches[2]
        return render_c1_roleta_v2(
            topo=topo,
            mapa1=m["mapa"],
            turn1_end=m["turnos"][-1],
            mapa2=m2["mapa"],
            turn2_start=m2["turnos"][0],
            t_norm=t_norm,
            t_sec=t_sec,
            render_portrait_fn=render_ia_portrait,
            ia_meta=IA_META,
        )
    if sid == "E2":
        m2 = matches[2]
        return render_e2_premios_placas(
            t_norm=t_norm,
            t_sec=t_sec,
            topo=m2["topo"],
            mapa=m2["mapa"],
            turn_end=m2["turnos"][-1],
            render_portrait_fn=render_ia_portrait,
            ia_meta=IA_META,
        )

    if sid == "E4":
        return render_e4_cartao_final(t_norm, t_sec)

    parts = [render_bg_war_room()]
    title = (scene.get("capitulo") or {}).get("subtitulo") or scene["titulo"]
    parts.append(
        f'<rect x="210" y="340" width="1500" height="320" rx="22" fill="#0B1322" fill-opacity="0.95" stroke="#FBBF24" stroke-width="4"/>'
        f'<text x="960" y="470" text-anchor="middle" font-family="{FONT_SANS}" font-size="60" font-weight="900" fill="#F8FAFC">{R.esc(title.upper())}</text>'
        f'<text x="960" y="560" text-anchor="middle" font-family="{FONT_MONO}" font-size="28" font-weight="700" fill="#FBBF24">{R.esc(scene["titulo"])}</text>'
    )
    return "".join(parts)


def render_e4_cartao_final(t_norm: float, t_sec: float) -> str:
    """Cartão final (~6 s): as 7 IAs entram uma a uma, a pergunta fica e sobra espaço livre
    para os elementos da tela final do YouTube (vídeo à esquerda, inscrição à direita)."""
    parts = [render_bg_war_room()]
    ordem = ["Hydrogen", "GLM", "Ember", "Qwen", "DeepSeek", "Inkling", "Sonnet"]
    for i, ia in enumerate(ordem):
        u = clamp((t_sec - 0.15 * i) / 0.45, 0.0, 1.0)
        if u <= 0:
            continue
        cx = 960.0 + (i - 3) * 150.0
        cy = 200.0 - 40.0 * (1.0 - ease_out(u))
        parts.append(f'<g opacity="{u:.2f}">' + render_ia_portrait(ia, cx, cy, 56.0, highlight=(ia == "Ember")) + "</g>")
        parts.append(f'<text x="{cx:.0f}" y="{cy + 92:.0f}" text-anchor="middle" font-family="{FONT_MONO}" '
                     f'font-size="22" font-weight="800" fill="{"#CBD5E1" if ia == "DeepSeek" else ia_info(ia)["cor"]}" opacity="{u:.2f}">{R.esc(ia.upper())}</text>')
    a = clamp((t_sec - 1.0) / 0.5, 0.0, 1.0)
    pulse = 1.0 + 0.02 * math.sin(t_sec * 3.0)
    parts.append(
        f'<g opacity="{a:.2f}" transform="translate(960,385) scale({pulse:.3f}) translate(-960,-385)">'
        f'<text x="960" y="370" text-anchor="middle" font-family="{FONT_SANS}" font-size="64" font-weight="900" fill="#F8FAFC">QUEM VOCE QUER VER DE CHILE?</text>'
        f'<text x="960" y="420" text-anchor="middle" font-family="{FONT_MONO}" font-size="26" font-weight="700" fill="#FBBF24">COMENTA AI · E SE INSCREVE PRA VER A PROXIMA</text></g>'
    )
    # moldura discreta onde o YouTube põe os elementos da tela final
    b = clamp((t_sec - 1.6) / 0.6, 0.0, 1.0)
    parts.append(
        f'<g opacity="{0.55 * b:.2f}" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="14 10">'
        f'<rect x="250" y="540" width="760" height="428" rx="18"/><circle cx="1400" cy="754" r="190"/></g>'
    )
    return "".join(parts)


def render_screen_dado_grande(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> str:
    sid = scene["id"]
    dur = max(1, scene["dur"])
    t_norm = clamp(local_f / dur, 0.0, 1.0)
    t_sec = local_f / max(1.0, float(fps or 30))

    if sid == "A3":
        m1 = matches[1]
        turn1 = m1["turnos"][min(1, len(m1["turnos"]) - 1)]
        return render_a3_rules_v2(
            topo=m1["topo"],
            mapa=m1["mapa"],
            turn1=turn1,
            t_norm=t_norm,
            render_portrait_fn=render_ia_portrait,
            ia_meta=IA_META,
        )
    if sid == "E1":
        m2 = matches[2]
        return render_e1_placar_flip(
            t_norm=t_norm,
            t_sec=t_sec,
            topo=m2["topo"],
            mapa=m2["mapa"],
            turn_end=m2["turnos"][-1],
            render_portrait_fn=render_ia_portrait,
            ia_meta=IA_META,
        )
    if sid == "E3":
        return render_e3_ida_vs_revanche(
            t_norm=t_norm,
            t_sec=t_sec,
            matches=matches,
            ia_meta=IA_META,
        )

    coreo = _resolve_scene_coreo(scene, coreo_map)
    return render_dado_grande_v2(
        scene=scene,
        local_f=local_f,
        fps=fps,
        matches=matches,
        coreo=coreo,
        render_portrait_fn=render_ia_portrait,
        ia_meta=IA_META,
    )


def render_screen_dois_baloes(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    active_fala: dict[str, Any] | None,
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> str:
    citas = [f for f in scene.get("falas", []) if f["kind"] == "cita"]
    left_c = citas[0] if citas else None
    right_c = citas[1] if len(citas) > 1 else None
    if active_fala and active_fala.get("kind") == "cita" and len(citas) > 2:
        for idx, c in enumerate(citas):
            if c.get("idx") == active_fala.get("idx") and idx >= 2:
                left_c = citas[idx - 1]
                right_c = citas[idx]
                break

    coreo = _resolve_scene_coreo(scene, coreo_map)
    partida = int(
        coreo.get("partida")
        or (left_c or {}).get("partida")
        or (right_c or {}).get("partida")
        or 1
    )
    m = matches[partida]
    topo: R.MapTopology = m["topo"]
    raw_turno = (
        coreo.get("turno")
        if coreo.get("turno") is not None
        else (
            (left_c or {}).get("turno")
            if (left_c or {}).get("turno") is not None
            else (right_c or {}).get("turno")
        )
    )
    turno_val = 1 if raw_turno is None else int(raw_turno)
    turno_idx = int(clamp(turno_val, 0, len(m["turnos"]) - 1))
    turn = m["turnos"][turno_idx]

    def _cita_prog(c: dict[str, Any] | None) -> float:
        if not c or c.get("at") is None or not c.get("dur"):
            return 1.0
        if local_f < c["at"]:
            return 0.0
        return clamp((local_f - c["at"]) / max(1, c["dur"]), 0.0, 1.0)

    return render_dois_baloes_v2(
        topo=topo,
        mapa=m["mapa"],
        turn=turn,
        left_c=left_c,
        right_c=right_c,
        coreo=coreo,
        local_f=local_f,
        fps=fps,
        active_fala=active_fala,
        render_portrait_fn=render_ia_portrait,
        render_echo_fn=render_echo_arcs,
        ia_meta=IA_META,
        left_prog=_cita_prog(left_c),
        right_prog=_cita_prog(right_c),
    )


def render_screen_pensamento(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    active_fala: dict[str, Any] | None,
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> str:
    citas = [f for f in scene.get("falas", []) if f["kind"] == "cita"]
    if active_fala and active_fala["kind"] == "cita":
        c = active_fala
    else:
        # Sem citação tocando: mantém a última que já começou (antes voltava para a primeira e
        # mostrava o pensamento de novo depois da fala, ex. B3 Qwen)
        iniciadas = [f for f in citas if f["at"] <= local_f]
        c = iniciadas[-1] if iniciadas else (citas[0] if citas else None)
    coreo = _resolve_scene_coreo(scene, coreo_map)
    partida = int(coreo.get("partida") or (c or {}).get("partida") or 1)
    m = matches[partida]
    topo: R.MapTopology = m["topo"]
    raw_turno = (
        coreo.get("turno")
        if coreo.get("turno") is not None
        else (c or {}).get("turno")
    )
    turno_val = 1 if raw_turno is None else int(raw_turno)
    turno_idx = int(clamp(turno_val, 0, len(m["turnos"]) - 1))
    turn = m["turnos"][turno_idx]

    if c and c.get("at") is not None and c.get("dur"):
        if local_f < c["at"]:
            prog = 0.0
        else:
            prog = clamp((local_f - c["at"]) / max(1, c["dur"]), 0.0, 1.0)
    else:
        prog = clamp(local_f / max(1, scene["dur"]), 0.0, 1.0)

    return render_pensamento_v2(
        topo=topo,
        mapa=m["mapa"],
        turn=turn,
        cita=c,
        coreo=coreo,
        local_f=local_f,
        fps=fps,
        prog=prog,
        render_portrait_fn=render_ia_portrait,
        render_echo_fn=render_echo_arcs,
        ia_meta=IA_META,
    )


def build_frame_svg(
    scene: dict[str, Any],
    local_f: int,
    matches: dict[int, dict[str, Any]],
    coreo_map: dict[str, dict[str, Any]] | None = None,
    fps: int = 30,
) -> str:
    if coreo_map is None:
        coreo_map = _get_default_coreo()
    fps_safe = max(1.0, float(fps or 30))
    coreo = _resolve_scene_coreo(scene, coreo_map)

    # Descobrir fala ativa (mantem balao de IA 10 frames extras = ~0.33s)
    active_fala: dict[str, Any] | None = None
    for f in scene.get("falas", []):
        pad = 10 if f["kind"] == "cita" else 0
        if f["at"] <= local_f <= f["at"] + f["dur"] + pad:
            active_fala = f
            break

    tela_tipo = scene["tela"]["tipo"]
    turno_for_hud = int(coreo.get("turno") or 1)
    ba_waves_held = 0

    if tela_tipo == "mapa":
        body, turno_for_hud, ba_waves_held = _render_screen_mapa_meta(
            scene, local_f, matches, coreo_map=coreo_map, fps=fps
        )
        if active_fala and active_fala["kind"] == "cita":
            prog = (local_f - active_fala["at"]) / max(1, active_fala["dur"])
            body += render_speech_overlay(active_fala, local_f / fps_safe, prog)
    elif tela_tipo == "capitulo":
        body = render_screen_capitulo(scene, local_f, matches, active_fala, fps=fps)
    elif tela_tipo == "dado_grande":
        body = render_screen_dado_grande(scene, local_f, matches, coreo_map=coreo_map, fps=fps)
        if active_fala and active_fala["kind"] == "cita":
            prog = (local_f - active_fala["at"]) / max(1, active_fala["dur"])
            body += render_speech_overlay(active_fala, local_f / fps_safe, prog)
    elif tela_tipo == "dois_baloes":
        body = render_screen_dois_baloes(scene, local_f, matches, active_fala, coreo_map=coreo_map, fps=fps)
    elif tela_tipo == "pensamento":
        body = render_screen_pensamento(scene, local_f, matches, active_fala, coreo_map=coreo_map, fps=fps)
    else:
        body, turno_for_hud, ba_waves_held = _render_screen_mapa_meta(
            scene, local_f, matches, coreo_map=coreo_map, fps=fps
        )

    # Câmera viva nas telas de texto (pensamento / dois balões): zoom lento 1.00 -> 1.06 com deriva
    # lateral e um respiro curto quando entra cada citação, para nunca ficar parado 30-45 s.
    if tela_tipo in ("pensamento", "dois_baloes"):
        tn = clamp(local_f / max(1, scene["dur"]), 0.0, 1.0)
        z = 1.0 + 0.06 * tn
        for f in scene.get("falas", []):
            if f["kind"] == "cita" and 0 <= local_f - f["at"] < 12:
                z += 0.015 * (1.0 - (local_f - f["at"]) / 12.0)
        dx = -16.0 * math.sin(tn * math.pi)  # sempre menor que a margem criada pelo zoom
        dy = -10.0 * tn
        cx, cy = SVG_W / 2.0, SVG_H / 2.0
        body = (f'<g transform="translate({cx + dx:.1f},{cy + dy:.1f}) scale({z:.4f}) translate({-cx:.1f},{-cy:.1f})">'
                + body + "</g>")

    # Contadores de gag fixos (canto superior direito em JetBrains Mono)
    has_meme_now = any(m["at"] <= local_f < m["at"] + m["dur"] for m in scene.get("memes", []))
    body += render_gag_counters_hud(
        scene["id"],
        local_f,
        fps,
        tela_tipo,
        matches,
        turno_for_hud,
        ba_waves_held=ba_waves_held,
        has_top_right_meme=has_meme_now,
    )

    # Sem legenda continua: exibe apenas pill discreta para palavras dificeis/estrangeiras
    if active_fala and active_fala["kind"] == "narrador":
        nar_prog = clamp((local_f - active_fala["at"]) / max(1, active_fala["dur"]), 0.0, 1.0)
        body += render_hard_words_callout(
            active_fala["texto"],
            nar_prog,
            active_fala["dur"] / fps_safe,
            scene_id=scene["id"],
            ia_meta=IA_META,
            # meme no canto inferior direito (mapa/dado_grande) cobria a pílula centralizada (ex. B10 5:15)
            cx=560.0 if (has_meme_now and tela_tipo in ("mapa", "dado_grande")) else 960.0,
        )

    # Selos inclinados SVG posicionados em zonas seguras (sem tampar seta 165, balao ou texto)
    for s_idx, selo in enumerate(scene.get("selos", [])):
        if scene["id"] in ("C1", "E1", "E3"):
            continue  # C1/E1/E3 ja têm o título na própria tela (o selo repetia e cobria o subtítulo)
        if selo["at"] <= local_f <= selo["at"] + selo["dur"]:
            prog = (local_f - selo["at"]) / max(1, selo["dur"])
            max_w: float | None = None
            if scene["id"] == "A1":
                # Terco superior esquerdo do mapa, longe da seta "165" no Rio da Prata!
                sx, sy, ang = 560.0, 198.0 + s_idx * 78.0, -3.5
                max_w = 720.0
            elif scene["id"] == "A2":
                sx, sy, ang = 444.0, 845.0 - s_idx * 85.0, -4.0
                max_w = 720.0
            elif scene["id"] == "A3":
                # Canto superior direito ao lado do titulo (sem cobrir TELA, REGRA 3 nem legenda)
                sx, sy, ang = 1656.0, 74.0 + s_idx * 68.0, -2.5
                max_w = 420.0
            elif tela_tipo == "dois_baloes":
                # Canto superior esquerdo ao lado do mini-mapa (x=570..1350), acima dos baloes (y>=320)
                sx, sy, ang = 286.0, 165.0 + s_idx * 84.0, -4.0
                max_w = 510.0
            elif tela_tipo == "pensamento":
                # Base do pergaminho a esquerda, longe do mini-mapa (x>=1268) e acima do meme
                # Deslocado para a direita do meme (canto inferior esquerdo, x<=~460)
                sx, sy, ang = 860.0, 874.0 - s_idx * 84.0, -3.5
                max_w = 640.0
            elif tela_tipo == "dado_grande":
                # Topo acima do numero gigante (y>=210) e longe do balao inferior (B6 4:08 / B13 7:11)
                sx, sy, ang = 960.0, 146.0 + s_idx * 78.0, -3.0
                max_w = 880.0
            elif tela_tipo == "mapa":
                # Abaixo da caixa TATICA (y<=176) e do HUD, livre do centro e do painel direito
                sx, sy, ang = 540.0, 238.0 + s_idx * 88.0, -4.0
                max_w = 780.0
            else:
                sx, sy, ang = 960.0, 170.0 + s_idx * 80.0, -3.5
            body += render_seal_svg(selo["texto"], sx, sy, ang, prog, max_w=max_w)

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SVG_W}" height="{SVG_H}" viewBox="0 0 {SVG_W} {SVG_H}">'
        + R._svg_defs()
        + body
        + f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="url(#canvas-vignette)" opacity="0.25" pointer-events="none"/>'
        + "</svg>"
    )


# ---------------------------------------------------------------------------
# Cache e composicao de memes GIF animados (~25% da tela com margem segura)
# ---------------------------------------------------------------------------


def load_meme_frames(meme_ids: set[str], out_w: int, out_h: int) -> dict[str, dict[str, Any]]:
    scale = out_w / float(SVG_W)
    box_w = max(220, int(round(560 * scale)))
    box_h = max(160, int(round(410 * scale)))
    loaded: dict[str, dict[str, Any]] = {}
    for mid in meme_ids:
        gif_p = PUBLIC_DIR / "gifs" / f"{mid}.gif"
        if not gif_p.exists():
            continue
        im = Image.open(gif_p)
        frames: list[Image.Image] = []
        durations_ms: list[int] = []
        for fr in ImageSequence.Iterator(im):
            rgba = fr.convert("RGBA")
            rgba.thumbnail((box_w - 10, box_h - 10), Image.Resampling.LANCZOS)
            # Moldura limpa escura ao redor do GIF
            card = Image.new("RGBA", (rgba.width + 12, rgba.height + 12), (15, 23, 42, 238))
            draw = ImageDraw.Draw(card)
            draw.rectangle([0, 0, card.width - 1, card.height - 1], outline=(251, 191, 36, 255), width=3)
            card.paste(rgba, (6, 6), rgba)
            frames.append(card)
            durations_ms.append(int(fr.info.get("duration", 80) or 80))
        if frames:
            loaded[mid] = {"frames": frames, "durs": durations_ms}
    return loaded


def composite_meme_on_png(
    png_path: Path,
    meme_data: dict[str, Any],
    rel_f: int,
    fps: int,
    tela_tipo: str,
    out_w: int,
    out_h: int,
) -> None:
    ms = int(rel_f * 1000.0 / max(1, fps))
    total_ms = max(1, sum(meme_data["durs"]))
    t_ms = ms % total_ms
    acc = 0
    chosen = meme_data["frames"][0]
    for fr, d in zip(meme_data["frames"], meme_data["durs"]):
        acc += d
        if t_ms <= acc:
            chosen = fr
            break

    base = Image.open(png_path).convert("RGBA")
    margin = max(16, int(round(40 * (out_w / float(SVG_W)))))

    if tela_tipo == "dois_baloes":
        # Topo direito acima do balao da direita (y<=300 em 1080p)
        max_h_db = max(90, int(round(278 * (out_h / float(SVG_H)))))
        if chosen.height > max_h_db:
            nw = max(120, int(round(chosen.width * (max_h_db / float(chosen.height)))))
            chosen = chosen.resize((nw, max_h_db), Image.Resampling.LANCZOS)
        px = out_w - chosen.width - margin
        py = int(round(18 * (out_h / float(SVG_H))))
    elif tela_tipo == "mapa":
        # Canto inferior direito da area do mapa (nao tampa centro do mapa em 17:00 nem balao a esquerda)
        max_w_map = int(round(420 * (out_w / float(SVG_W))))
        if chosen.width > max_w_map:
            nh = max(90, int(round(chosen.height * (max_w_map / float(chosen.width)))))
            chosen = chosen.resize((max_w_map, nh), Image.Resampling.LANCZOS)
        px = int(out_w * 0.75) - chosen.width - int(round(16 * (out_w / float(SVG_W))))
        py = out_h - chosen.height - margin
    elif tela_tipo == "pensamento":
        # Canto inferior esquerdo com margem segura, abaixo/ao lado do pergaminho sem cobrir mini-mapa
        max_h_p = int(round(300 * (out_h / float(SVG_H))))
        if chosen.height > max_h_p:
            nw = max(120, int(round(chosen.width * (max_h_p / float(chosen.height)))))
            chosen = chosen.resize((nw, max_h_p), Image.Resampling.LANCZOS)
        px = margin
        py = out_h - chosen.height - int(round(24 * (out_h / float(SVG_H))))
    else:
        # dado_grande / capitulo: canto inferior direito fora do balao esquerdo e numero gigante
        px = out_w - chosen.width - margin
        py = out_h - chosen.height - margin

    base.paste(chosen, (max(margin // 2, px), max(12, py)), chosen)
    base.convert("RGB").save(png_path, format="PNG")


# ---------------------------------------------------------------------------
# Worker global por processo
# ---------------------------------------------------------------------------

_W_MATCHES: dict[int, dict[str, Any]] = {}
_W_MEMES: dict[str, dict[str, Any]] = {}
_W_COREO: dict[str, dict[str, Any]] = {}
_W_OUT_W = 960
_W_OUT_H = 540
_W_FPS = 30
_W_TMP: Path | None = None


def _init_worker(
    out_w: int,
    out_h: int,
    fps: int,
    meme_ids: list[str],
    tmp_dir: str,
    coreo_path: str = "",
) -> None:
    global _W_MATCHES, _W_MEMES, _W_COREO, _W_OUT_W, _W_OUT_H, _W_FPS, _W_TMP
    _W_OUT_W, _W_OUT_H, _W_FPS = out_w, out_h, fps
    _W_TMP = Path(tmp_dir)
    _W_MATCHES = {1: load_match_recolored(1), 2: load_match_recolored(2)}
    _W_MEMES = load_meme_frames(set(meme_ids), out_w, out_h)
    _W_COREO = load_coreo_map(coreo_path or DEFAULT_COREO)


def _render_one(job: tuple[int, dict[str, Any], int, str]) -> str:
    global_idx, scene, local_f, out_png_str = job
    out_png = Path(out_png_str)
    svg = build_frame_svg(scene, local_f, _W_MATCHES, coreo_map=_W_COREO, fps=_W_FPS)
    R.rasterize_svg_to_png(svg, out_png, _W_TMP, f"f_{global_idx:06d}", _W_OUT_W, _W_OUT_H)
    for m in scene.get("memes", []):
        if m["at"] <= local_f < m["at"] + m["dur"] and m["id"] in _W_MEMES:
            composite_meme_on_png(
                out_png,
                _W_MEMES[m["id"]],
                local_f - m["at"],
                _W_FPS,
                scene["tela"]["tipo"],
                _W_OUT_W,
                _W_OUT_H,
            )
            break
    return out_png_str


def main() -> None:
    ap = argparse.ArgumentParser(description="Compositor multi-tela AoH2 v2 (540p + stills).")
    ap.add_argument("--timeline", default=str(DEFAULT_TIMELINE))
    ap.add_argument("--coreo", default=str(DEFAULT_COREO), help="JSON de coreografia por cena (opcional)")
    ap.add_argument("--out", default="", help="MP4 mudo de saida")
    ap.add_argument("--cenas", default="", help="IDs separados por virgula (ex: A1,A2,A3,B1,B2)")
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--stills-dir", default="", help="Se informado, gera apenas 1 PNG de conferencia por cena")
    ap.add_argument("--parte", type=int, default=0, help="Indice da fatia (0-based) para render paralelo")
    ap.add_argument("--total-partes", type=int, default=1, help="Total de fatias paralelas")
    args = ap.parse_args()

    tl = json.loads(Path(args.timeline).read_text(encoding="utf-8"))
    cenas_all = tl["cenas"]
    if args.cenas.strip():
        wanted = [x.strip() for x in args.cenas.split(",") if x.strip()]
        by_id = {c["id"]: c for c in cenas_all}
        cenas = [by_id[x] for x in wanted]
    else:
        cenas = list(cenas_all)

    meme_ids = sorted({m["id"] for c in cenas for m in c.get("memes", [])})

    if args.stills_dir:
        sdir = Path(args.stills_dir)
        sdir.mkdir(parents=True, exist_ok=True)
        matches = {1: load_match_recolored(1), 2: load_match_recolored(2)}
        memes = load_meme_frames(set(meme_ids), args.width, args.height)
        coreo_map = load_coreo_map(args.coreo)
        with tempfile.TemporaryDirectory(prefix="aoh2_stills_") as td:
            td_p = Path(td)
            for sc in cenas:
                # Escolhe momento mais rico (quando tem cita/selo/meme)
                if sc.get("selos"):
                    lf = min(sc["dur"] - 5, sc["selos"][0]["at"] + max(8, sc["selos"][0]["dur"] // 2))
                else:
                    lf = int(sc["dur"] * 0.68)
                out_png = sdir / f"still_{sc['id']}.png"
                svg = build_frame_svg(sc, lf, matches, coreo_map=coreo_map, fps=args.fps)
                R.rasterize_svg_to_png(svg, out_png, td_p, f"st_{sc['id']}", args.width, args.height)
                for m in sc.get("memes", []):
                    if m["at"] <= lf < m["at"] + m["dur"] and m["id"] in memes:
                        composite_meme_on_png(
                            out_png,
                            memes[m["id"]],
                            lf - m["at"],
                            args.fps,
                            sc["tela"]["tipo"],
                            args.width,
                            args.height,
                        )
                        break
                print(f"[still] {out_png} (frame {lf}/{sc['dur']})")
        return

    if not args.out:
        raise SystemExit("Informe --out ou --stills-dir")

    out_mp4 = Path(args.out)
    out_mp4.parent.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    with tempfile.TemporaryDirectory(prefix="aoh2_frames_") as td:
        td_p = Path(td)
        jobs: list[tuple[int, dict[str, Any], int, str]] = []
        g_idx = 0
        for sc in cenas:
            for lf in range(sc["dur"]):
                jobs.append((g_idx, sc, lf, str(td_p / f"frame_{g_idx:06d}.png")))
                g_idx += 1

        if args.total_partes > 1:
            if not (0 <= args.parte < args.total_partes):
                raise SystemExit(f"--parte deve estar entre 0 e {args.total_partes - 1}")
            n_all = len(jobs)
            p_start = (n_all * args.parte) // args.total_partes
            p_end = (n_all * (args.parte + 1)) // args.total_partes
            sliced = jobs[p_start:p_end]
            jobs = [
                (p_start + loc_i, sc, lf, str(td_p / f"frame_{loc_i:06d}.png"))
                for loc_i, (_old_g, sc, lf, _old_png) in enumerate(sliced)
            ]
            print(f"[compositor] Parte {args.parte}/{args.total_partes}: quadros {p_start}..{p_end - 1} ({len(jobs)} quadros)", flush=True)

        total = len(jobs)
        print(
            f"[compositor] Renderizando {total} quadros ({len(cenas)} cenas, {args.width}x{args.height}, {args.workers} workers)...",
            flush=True,
        )
        with concurrent.futures.ProcessPoolExecutor(
            max_workers=args.workers,
            initializer=_init_worker,
            initargs=(args.width, args.height, args.fps, meme_ids, str(td_p), args.coreo),
        ) as ex:
            done = 0
            for _ in ex.map(_render_one, jobs, chunksize=8):
                done += 1
                if done % 150 == 0 or done == total:
                    el = time.time() - t0
                    fps_real = done / max(0.1, el)
                    print(
                        f"  progresso: {done}/{total} ({100.0 * done / total:.1f}%) | {fps_real:.1f} q/s | {el:.1f}s",
                        flush=True,
                    )

        print(f"[compositor] Empacotando MP4 mudo -> {out_mp4}", flush=True)
        subprocess.run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-framerate",
                str(args.fps),
                "-i",
                str(td_p / "frame_%06d.png"),
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "18",
                "-pix_fmt",
                "yuv420p",
                str(out_mp4),
            ],
            check=True,
        )
    print(f"[compositor] Concluido em {time.time() - t0:.1f}s: {out_mp4}")


if __name__ == "__main__":
    main()
