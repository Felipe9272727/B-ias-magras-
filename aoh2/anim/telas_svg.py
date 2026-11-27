#!/usr/bin/env python3
"""Renderizadores SVG vetoriais v2 para telas, HUDs e mini-mapas taticos (1920x1080).

Modulo puro stdlib (+ xml.sax.saxutils.escape), projetado para rasterizacao rapida
via rsvg-convert (sem filtros blur pesados, sem emojis, legibilidade celular >= 24px).

Funcoes publicas:
- render_paged_narrator_bar(texto, progress, ia_meta, max_chars_page=78)
- render_timelapse_hud(partida, turno_atual, turno_alvo, data_str, prog)
- render_a2_poster_v2(topo, mapa, turn0, t_norm, active_fala, render_portrait_fn, ia_meta)
- render_a3_rules_v2(topo, mapa, turn1, t_norm, render_portrait_fn, ia_meta)
- render_dois_baloes_v2(topo, mapa, turn, left_c, right_c, coreo, local_f, fps,
                        active_fala, render_portrait_fn, render_echo_fn, ia_meta)
- render_pensamento_v2(topo, mapa, turn, cita, coreo, local_f, fps, prog,
                       render_portrait_fn, render_echo_fn, ia_meta)
"""

from __future__ import annotations

import math
import re
import unicodedata
from typing import Any, Callable
from xml.sax.saxutils import escape as xml_escape

SVG_W = 1920
SVG_H = 1080

FONT_SANS = "DejaVu Sans, Liberation Sans, Noto Sans, Arial, sans-serif"
FONT_MONO = "DejaVu Sans Mono, DejaVu Sans, monospace"

DEFAULT_IA_META: dict[str, dict[str, str]] = {
    "sonnet": {"nome": "Sonnet", "cor": "#3D7BF2", "fg": "#F8FAFC", "badge": "S"},
    "hydrogen": {"nome": "Hydrogen", "cor": "#19A974", "fg": "#F8FAFC", "badge": "H"},
    "glm": {"nome": "GLM", "cor": "#8E4DE0", "fg": "#F8FAFC", "badge": "G"},
    "ember": {"nome": "Ember", "cor": "#E0262B", "fg": "#F8FAFC", "badge": "E"},
    "deepseek": {"nome": "DeepSeek", "cor": "#1E2430", "fg": "#F8FAFC", "badge": "D"},
    "qwen": {"nome": "Qwen", "cor": "#F2802E", "fg": "#0F172A", "badge": "Q"},
    "inkling": {"nome": "Inkling", "cor": "#22C7D6", "fg": "#0F172A", "badge": "I"},
    "narrador": {"nome": "Felipe", "cor": "#FBBF24", "fg": "#0F172A", "badge": "F"},
}

COUNTRY_NAMES: dict[str, str] = {
    "brasil": "Brasil",
    "argentina": "Argentina",
    "bolivia": "Bolivia",
    "colombia": "Colombia",
    "peru": "Peru",
    "chile": "Chile",
    "venezuela": "Venezuela",
}

A2_ELENCO: list[tuple[str, str, str, str]] = [
    ("ember", "Ember", "Meta Muse Ember · Venezuela -> Chile", "venezuela"),
    ("sonnet", "Sonnet", "Claude Sonnet · Brasil -> Argentina", "brasil"),
    ("hydrogen", "Hydrogen", "Gemini Hydrogen · Bolivia -> Brasil", "bolivia"),
    ("glm", "GLM", "GLM Latest · Chile -> Venezuela", "chile"),
    ("deepseek", "DeepSeek", "DeepSeek Flash · Argentina -> Colombia", "argentina"),
    ("qwen", "Qwen", "Qwen 3.8 27B · Colombia -> Peru", "colombia"),
    ("inkling", "Inkling", "Inkling 2 Mini · Peru -> Bolivia", "peru"),
]

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

_IA_NAMES_ORDER = ("DeepSeek", "Hydrogen", "Inkling", "Sonnet", "Ember", "Qwen", "GLM")
_IA_TOKEN_RE = re.compile(
    r"\b(" + "|".join(re.escape(n) for n in _IA_NAMES_ORDER) + r")\b",
    flags=re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Utilitarios matematicos, texto e cor
# ---------------------------------------------------------------------------


def _clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else (hi if v > hi else v)


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _ease_out(t: float) -> float:
    t = _clamp(t, 0.0, 1.0)
    return 1.0 - (1.0 - t) ** 3


def _ease_in_out(t: float) -> float:
    t = _clamp(t, 0.0, 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def _quad_bezier(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    t: float,
) -> tuple[float, float]:
    u = 1.0 - t
    x = u * u * p0[0] + 2.0 * u * t * p1[0] + t * t * p2[0]
    y = u * u * p0[1] + 2.0 * u * t * p1[1] + t * t * p2[1]
    return (x, y)


def _quad_tangent(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    t: float,
) -> tuple[float, float]:
    dx = 2.0 * (1.0 - t) * (p1[0] - p0[0]) + 2.0 * t * (p2[0] - p1[0])
    dy = 2.0 * (1.0 - t) * (p1[1] - p0[1]) + 2.0 * t * (p2[1] - p1[1])
    return (dx, dy)


def _clean_text(text: Any) -> str:
    if text is None:
        return ""
    s = str(text)
    s = _EMOJI_RE.sub("", s)
    s = _CTRL_RE.sub(" ", s)
    return re.sub(r"\s+", " ", s).strip()


def _esc(text: Any) -> str:
    return xml_escape(_clean_text(text), {'"': "&quot;", "'": "&apos;"})


def _strip_accents(s: str) -> str:
    nfkd = unicodedata.normalize("NFD", s)
    return "".join(ch for ch in nfkd if unicodedata.category(ch) != "Mn")


def _ia_key(name: Any) -> str:
    return _clean_text(name).lower()


def _resolve_ia_meta(ia_meta: dict[str, dict[str, str]] | None) -> dict[str, dict[str, str]]:
    merged = {k: dict(v) for k, v in DEFAULT_IA_META.items()}
    if ia_meta:
        for k, v in ia_meta.items():
            if isinstance(v, dict):
                merged[_ia_key(k)] = dict(v)
    return merged


def _ia_info(ia_meta: dict[str, dict[str, str]], name: Any) -> dict[str, str]:
    k = _ia_key(name)
    if k in ia_meta:
        return ia_meta[k]
    return {"nome": _clean_text(name) or "IA", "cor": "#64748B", "fg": "#F8FAFC", "badge": "?"}


def _hex_luminance(hex_cor: str) -> float:
    c = (hex_cor or "").strip().lstrip("#")
    if len(c) != 6:
        return 0.5
    try:
        r = int(c[0:2], 16) / 255.0
        g = int(c[2:4], 16) / 255.0
        b = int(c[4:6], 16) / 255.0
    except ValueError:
        return 0.5
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _ia_color_on_dark(cor: str) -> str:
    """Garante contraste legivel no fundo escuro (DeepSeek #1E2430 -> #C8D3DD)."""
    if _hex_luminance(cor) < 0.09:
        return "#C8D3DD"
    return cor


def _wrap_words_full(text: str, max_chars: int) -> list[str]:
    """Quebra texto em linhas completas por palavra sem NUNCA truncar com '...'."""
    s = _clean_text(text)
    if not s:
        return []
    width = max(12, int(max_chars))
    words = s.split(" ")
    lines: list[str] = []
    cur: list[str] = []
    cur_len = 0
    for w in words:
        add_len = len(w) if not cur else (cur_len + 1 + len(w))
        if cur and add_len > width:
            lines.append(" ".join(cur))
            cur = [w]
            cur_len = len(w)
        else:
            cur.append(w)
            cur_len = add_len
    if cur:
        lines.append(" ".join(cur))
    return lines


def _char_rel_width(ch: str) -> float:
    if ch in " ilIjtfr.,!|:;'`()[]":
        return 0.34
    if ch in "mwMW@%&":
        return 0.86
    if ch.isupper():
        return 0.68
    if ch.isdigit():
        return 0.58
    return 0.55


def _estimate_text_px(text: str, font_size: float) -> float:
    return sum(_char_rel_width(ch) for ch in text) * font_size


def _fallback_portrait(ia: str, cx: float, cy: float, r: float, highlight: bool = False, ia_meta: dict[str, dict[str, str]] | None = None) -> str:
    meta = _resolve_ia_meta(ia_meta)
    info = _ia_info(meta, ia)
    cor = info["cor"]
    fg = info["fg"]
    rim = "#FDE047" if highlight else ("#C8D3DD" if _ia_key(ia) == "deepseek" else "#F8FAFC")
    return (
        f'<g>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{cor}" stroke="{rim}" stroke-width="{4.5 if highlight else 2.8:.1f}"/>'
        f'<text x="{cx:.1f}" y="{cy + r * 0.34:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="{r * 0.95:.1f}" font-weight="900" fill="{fg}">{_esc(info["badge"])}</text>'
        f'</g>'
    )


def _call_portrait(
    render_portrait_fn: Callable[..., str] | None,
    ia: str,
    cx: float,
    cy: float,
    r: float,
    highlight: bool,
    ia_meta: dict[str, dict[str, str]],
) -> str:
    if render_portrait_fn is not None:
        return render_portrait_fn(ia, cx, cy, r, highlight=highlight)
    return _fallback_portrait(ia, cx, cy, r, highlight=highlight, ia_meta=ia_meta)


def _call_echo(
    render_echo_fn: Callable[..., str] | None,
    cx: float,
    cy: float,
    cor: str,
    t_sec: float,
) -> str:
    if render_echo_fn is not None:
        return render_echo_fn(cx, cy, cor, t_sec)
    parts: list[str] = []
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


def _bg_war_room() -> str:
    grid: list[str] = []
    for gx in range(0, SVG_W + 1, 120):
        grid.append(f'<line x1="{gx}" y1="0" x2="{gx}" y2="{SVG_H}" stroke="#1B2C3A" stroke-width="1"/>')
    for gy in range(0, SVG_H + 1, 120):
        grid.append(f'<line x1="0" y1="{gy}" x2="{SVG_W}" y2="{gy}" stroke="#1B2C3A" stroke-width="1"/>')
    return f'<rect x="0" y="0" width="{SVG_W}" height="{SVG_H}" fill="#0E1A24"/>' + "".join(grid)


def _province_ia_key(mapa: dict[str, Any], turn: dict[str, Any] | None, pid: str) -> str:
    provs_t = (turn or {}).get("provincias") or {}
    dono = (provs_t.get(pid) or {}).get("dono")
    if not dono:
        dono = ((mapa or {}).get("provincias") or {}).get(pid, {}).get("pais_inicial", "")
    nacoes = (mapa or {}).get("nacoes") or {}
    nmeta = nacoes.get(dono) or {}
    return _ia_key(nmeta.get("ia_apelido") or nmeta.get("ia_id") or nmeta.get("ia") or dono)


def _province_fill(
    mapa: dict[str, Any],
    turn: dict[str, Any] | None,
    pid: str,
    ia_meta: dict[str, dict[str, str]],
    default: str = "#263445",
) -> tuple[str, str]:
    """Retorna (fill_hex, ia_key) para a provincia."""
    k = _province_ia_key(mapa, turn, pid)
    if k in ia_meta:
        return (ia_meta[k]["cor"], k)
    return (default, k)


def _collect_topo_bounds(topo: Any, pids: list[str] | None = None) -> tuple[float, float, float, float]:
    xs: list[float] = []
    ys: list[float] = []
    polys = getattr(topo, "polygons", {}) or {}
    target_pids = [p for p in (pids or []) if p in polys and polys[p]]
    if not target_pids:
        target_pids = list(polys.keys())
    for pid in target_pids:
        for x, y in polys[pid]:
            xs.append(float(x))
            ys.append(float(y))
    if not xs or not ys:
        mb = getattr(topo, "map_bounds", (90.0, 95.0, 1420.0, 1030.0))
        return (float(mb[0]), float(mb[1]), float(mb[2]), float(mb[3]))
    return (min(xs), min(ys), max(xs), max(ys))


def _fit_box_transform(
    bounds: tuple[float, float, float, float],
    box: tuple[float, float, float, float],
    pad_frac: float = 0.14,
) -> tuple[float, float, float]:
    """Retorna (scale, tx, ty) para encaixar bounds (x0,y0,x1,y1) dentro de box (bx,by,bw,bh)."""
    x0, y0, x1, y1 = bounds
    bx, by, bw, bh = box
    src_w = max(40.0, x1 - x0)
    src_h = max(40.0, y1 - y0)
    pad_x = bw * pad_frac
    pad_y = bh * pad_frac
    avail_w = max(40.0, bw - 2.0 * pad_x)
    avail_h = max(40.0, bh - 2.0 * pad_y)
    scale = min(avail_w / src_w, avail_h / src_h)
    cx_src = (x0 + x1) * 0.5
    cy_src = (y0 + y1) * 0.5
    cx_dst = bx + bw * 0.5
    cy_dst = by + bh * 0.5
    tx = cx_dst - cx_src * scale
    ty = cy_dst - cy_src * scale
    return (scale, tx, ty)


# ---------------------------------------------------------------------------
# Pecas vetoriais compartilhadas (icones, reticulo, soldado, fortaleza, rasgo)
# ---------------------------------------------------------------------------


def _svg_fortress_icon(cx: float, cy: float, scale: float = 1.0, accent: str = "#FBBF24", rise: float = 1.0) -> str:
    """Icone vetorial de fortaleza de 3 torres erguendo do chao."""
    r = _ease_out(_clamp(rise, 0.0, 1.0))
    sc = scale * (0.55 + 0.45 * r)
    dy = (1.0 - r) * 18.0
    return (
        f'<g transform="translate({cx:.1f},{cy + dy:.1f}) scale({sc:.3f})" opacity="{r:.2f}">'
        f'<ellipse cx="0" cy="22" rx="28" ry="8" fill="#000000" opacity="0.45"/>'
        f'<rect x="-24" y="-8" width="48" height="28" rx="3" fill="#CBD5E1" stroke="#0F172A" stroke-width="2.4"/>'
        f'<rect x="-28" y="-20" width="14" height="40" rx="2" fill="#E2E8F0" stroke="#0F172A" stroke-width="2.2"/>'
        f'<rect x="14" y="-20" width="14" height="40" rx="2" fill="#E2E8F0" stroke="#0F172A" stroke-width="2.2"/>'
        f'<rect x="-9" y="-28" width="18" height="48" rx="2" fill="#F8FAFC" stroke="#0F172A" stroke-width="2.4"/>'
        f'<polygon points="-28,-20 -21,-30 -14,-20" fill="{accent}" stroke="#0F172A" stroke-width="1.8"/>'
        f'<polygon points="14,-20 21,-30 28,-20" fill="{accent}" stroke="#0F172A" stroke-width="1.8"/>'
        f'<polygon points="-10,-28 0,-40 10,-28" fill="{accent}" stroke="#0F172A" stroke-width="2"/>'
        f'<path d="M-6,20 L-6,6 A6,6 0 0,1 6,6 L6,20 Z" fill="#1E293B"/>'
        f'</g>'
    )


def _svg_mini_soldiers(cx: float, cy: float, angle_deg: float, cor: str, t_sec: float, scale: float = 1.0) -> str:
    """Trio compacto de silhuetas de soldados marchando com lanca e escudo."""
    parts = [f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.3f})">']
    offsets = [(-14.0, -7.0, 0.0), (0.0, 0.0, 2.1), (-14.0, 8.0, 4.2)]
    flip = -1.0 if (angle_deg > 90.0 or angle_deg < -90.0) else 1.0
    for ox, oy, ph in offsets:
        bob = math.sin(t_sec * 12.0 + ph) * 2.2
        sx = ox * flip
        sy = oy + bob
        parts.append(
            f'<g transform="translate({sx:.1f},{sy:.1f})">'
            f'<ellipse cx="0" cy="11" rx="7" ry="2.6" fill="#000000" opacity="0.45"/>'
            f'<line x1="{4 * flip:.1f}" y1="8" x2="{10 * flip:.1f}" y2="-13" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round"/>'
            f'<polygon points="{10 * flip:.1f},-15 {13 * flip:.1f},-10 {7 * flip:.1f},-10" fill="#FDE047"/>'
            f'<rect x="-5" y="-3" width="10" height="12" rx="3" fill="{cor}" stroke="#0F172A" stroke-width="1.6"/>'
            f'<circle cx="0" cy="-7" r="4.6" fill="#F8FAFC" stroke="#0F172A" stroke-width="1.6"/>'
            f'<path d="M-5,-8 Q0,-14 5,-8 Z" fill="{cor}" stroke="#0F172A" stroke-width="1.4"/>'
            f'</g>'
        )
    parts.append("</g>")
    return "".join(parts)


def _svg_target_reticle(cx: float, cy: float, t_sec: float, cor: str = "#EF4444", label: str = "") -> str:
    """Reticulo tatico rotativo/pulsante para alvos do plano."""
    rot = (t_sec * 42.0) % 360.0
    pulse = 1.0 + 0.12 * math.sin(t_sec * 5.2)
    r_out = 20.0 * pulse
    r_in = 10.0
    parts = [
        f'<g transform="translate({cx:.1f},{cy:.1f})">',
        f'<circle cx="0" cy="0" r="{r_out + 5:.1f}" fill="{cor}" opacity="0.18"/>',
        f'<g transform="rotate({rot:.1f})">',
        f'<circle cx="0" cy="0" r="{r_out:.1f}" fill="none" stroke="{cor}" stroke-width="2.8" stroke-dasharray="9,6"/>',
        f'<line x1="{-r_out - 6:.1f}" y1="0" x2="{-r_in:.1f}" y2="0" stroke="#F8FAFC" stroke-width="2.4"/>',
        f'<line x1="{r_in:.1f}" y1="0" x2="{r_out + 6:.1f}" y2="0" stroke="#F8FAFC" stroke-width="2.4"/>',
        f'<line x1="0" y1="{-r_out - 6:.1f}" x2="0" y2="{-r_in:.1f}" stroke="#F8FAFC" stroke-width="2.4"/>',
        f'<line x1="0" y1="{r_in:.1f}" x2="0" y2="{r_out + 6:.1f}" stroke="#F8FAFC" stroke-width="2.4"/>',
        "</g>",
        f'<circle cx="0" cy="0" r="3.8" fill="#FDE047" stroke="#0F172A" stroke-width="1.4"/>',
        "</g>",
    ]
    clean_lbl = _clean_text(label).upper()
    if clean_lbl:
        pw = max(92.0, len(clean_lbl) * 12.2 + 24.0)
        px = cx - pw * 0.5
        py = cy + r_out + 8.0
        parts.append(
            f'<rect x="{px:.1f}" y="{py:.1f}" width="{pw:.1f}" height="28" rx="7" '
            f'fill="#070D17" fill-opacity="0.92" stroke="{cor}" stroke-width="2"/>'
            f'<text x="{cx:.1f}" y="{py + 20:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="18" font-weight="800" fill="#F8FAFC">{_esc(clean_lbl)}</text>'
        )
    return "".join(parts)


def _svg_torn_contract(
    cx: float,
    cy: float,
    t_prog: float,
    label_a: str,
    label_b: str,
    tipo: str = "PACTO",
    scale: float = 1.0,
) -> str:
    """Pergaminho de pacto/paz rasgando ao meio com denteado e selo TRAICAO."""
    p = _clamp(t_prog, 0.0, 1.0)
    tear = _ease_out(_clamp((p - 0.25) / 0.45, 0.0, 1.0))
    sep = tear * 26.0
    ang = tear * 11.0
    stamp_op = _ease_out(_clamp((p - 0.55) / 0.22, 0.0, 1.0))
    stamp_sc = 1.35 - 0.35 * stamp_op

    la = _clean_text(label_a).upper()[:12] or "ALIADO A"
    lb = _clean_text(label_b).upper()[:12] or "ALIADO B"
    tp = _clean_text(tipo).upper() or "PACTO"

    # Metade esquerda e direita com borda denteada no corte central (x=0)
    left_path = (
        "M -110,-48 L 0,-48 L -7,-32 L 5,-16 L -8,0 L 6,16 L -6,32 L 2,48 L -110,48 Z"
    )
    right_path = (
        "M 0,-48 L 110,-48 L 110,48 L 2,48 L -6,32 L 6,16 L -8,0 L 5,-16 L -7,-32 Z"
    )

    parts = [
        f'<g transform="translate({cx:.1f},{cy:.1f}) scale({scale:.3f})">',
        # Metade esquerda
        f'<g transform="translate({-sep:.1f},{tear * 5:.1f}) rotate({-ang:.1f})">',
        f'<path d="{left_path}" fill="#F3E2A9" stroke="#78350F" stroke-width="3"/>',
        f'<text x="-58" y="-12" text-anchor="middle" font-family="{FONT_MONO}" font-size="18" font-weight="800" fill="#78350F">{_esc(tp)}</text>',
        f'<text x="-58" y="18" text-anchor="middle" font-family="{FONT_SANS}" font-size="20" font-weight="900" fill="#1E293B">{_esc(la)}</text>',
        "</g>",
        # Metade direita
        f'<g transform="translate({sep:.1f},{tear * 6:.1f}) rotate({ang:.1f})">',
        f'<path d="{right_path}" fill="#F3E2A9" stroke="#78350F" stroke-width="3"/>',
        f'<text x="58" y="-12" text-anchor="middle" font-family="{FONT_MONO}" font-size="18" font-weight="800" fill="#78350F">ASSINADO</text>',
        f'<text x="58" y="18" text-anchor="middle" font-family="{FONT_SANS}" font-size="20" font-weight="900" fill="#1E293B">{_esc(lb)}</text>',
        "</g>",
    ]
    # Faiscas no corte durante o rasgo
    if 0.25 < p < 0.85:
        spark_op = math.sin(_clamp((p - 0.25) / 0.60, 0.0, 1.0) * math.pi)
        parts.append(
            f'<g opacity="{spark_op:.2f}">'
            f'<line x1="-4" y1="-44" x2="4" y2="44" stroke="#EF4444" stroke-width="4" stroke-dasharray="10,6"/>'
            f'<circle cx="0" cy="-22" r="5" fill="#FDE047"/>'
            f'<circle cx="0" cy="20" r="5" fill="#FDE047"/>'
            f'</g>'
        )
    # Selo TRAICAO
    if stamp_op > 0.02:
        parts.append(
            f'<g transform="rotate(-7) scale({stamp_sc:.3f})" opacity="{stamp_op:.2f}">'
            f'<rect x="-92" y="-22" width="184" height="44" rx="8" fill="#7F1D1D" fill-opacity="0.95" stroke="#FCA5A5" stroke-width="3"/>'
            f'<text x="0" y="9" text-anchor="middle" font-family="{FONT_SANS}" font-size="26" font-weight="900" fill="#FEF2F2" letter-spacing="1.6">TRAICAO</text>'
            f'</g>'
        )
    parts.append("</g>")
    return "".join(parts)


def _render_tactical_minimap(
    topo: Any,
    mapa: dict[str, Any],
    turn: dict[str, Any] | None,
    box: tuple[float, float, float, float],
    clip_id: str,
    ia_meta: dict[str, dict[str, str]],
    t_sec: float,
    t_prog: float,
    title: str = "MAPA TATICO",
    focus_pids: list[str] | None = None,
    routes: list[dict[str, Any]] | None = None,
    targets: list[dict[str, Any]] | None = None,
    fortress_pid: str | None = None,
    fortress_rise: float = 1.0,
    recruit_pid: str | None = None,
    recruit_label: str = "",
    recruit_prog: float = 0.0,
    explosion_pid: str | None = None,
    explosion_loss: str = "",
    explosion_prog: float = 0.0,
    torn_treaty: dict[str, Any] | None = None,
    accent_cor: str = "#FBBF24",
    footer_caption: str = "",
) -> str:
    """Mini-mapa tatico animado reutilizavel para A3, Dois Baloes e Pensamento."""
    bx, by, bw, bh = box
    routes = routes or []
    targets = targets or []
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}

    all_focus: list[str] = list(focus_pids or [])
    for r in routes:
        for key in ("de", "para"):
            pid = r.get(key)
            if pid and pid in centers and pid not in all_focus:
                all_focus.append(pid)
    for tg in targets:
        pid = tg.get("pid")
        if pid and pid in centers and pid not in all_focus:
            all_focus.append(pid)
    for extra in (fortress_pid, recruit_pid, explosion_pid):
        if extra and extra in centers and extra not in all_focus:
            all_focus.append(extra)

    # Inclui vizinhos imediatos para dar contexto geografico real
    neighbors_map = getattr(topo, "neighbors", {}) or {}
    context_pids = list(all_focus)
    if all_focus and len(all_focus) <= 6:
        for pid in all_focus:
            for nb in neighbors_map.get(pid, ()):
                if nb not in context_pids:
                    context_pids.append(nb)

    bounds = _collect_topo_bounds(topo, context_pids if context_pids else None)
    header_h = 44.0
    footer_h = 46.0 if footer_caption else 0.0
    map_inner = (bx + 8.0, by + header_h + 4.0, bw - 16.0, bh - header_h - footer_h - 8.0)
    scale, tx, ty = _fit_box_transform(bounds, map_inner, pad_frac=0.10)

    def to_screen(pid: str) -> tuple[float, float] | None:
        pt = centers.get(pid)
        if not pt:
            return None
        return (pt[0] * scale + tx, pt[1] * scale + ty)

    parts = [
        f'<defs><clipPath id="{_esc(clip_id)}">'
        f'<rect x="{bx + 2:.1f}" y="{by + 2:.1f}" width="{bw - 4:.1f}" height="{bh - 4:.1f}" rx="15"/>'
        f'</clipPath></defs>',
        # Sombra dura rapida (sem blur)
        f'<rect x="{bx + 6:.1f}" y="{by + 8:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="16" fill="#000000" opacity="0.52"/>',
        f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="16" fill="#081623" stroke="{accent_cor}" stroke-width="3"/>',
        f'<g clip-path="url(#{_esc(clip_id)})">',
    ]

    # Grade cartografica fina dentro do mini-mapa
    step = 64
    for gx in range(int(bx), int(bx + bw) + 1, step):
        parts.append(f'<line x1="{gx}" y1="{by:.0f}" x2="{gx}" y2="{by + bh:.0f}" stroke="#122B3F" stroke-width="1"/>')
    for gy in range(int(by), int(by + bh) + 1, step):
        parts.append(f'<line x1="{bx:.0f}" y1="{gy}" x2="{bx + bw:.0f}" y2="{gy}" stroke="#122B3F" stroke-width="1"/>')

    # Poligonos do mapa
    focus_set = set(all_focus)
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) scale({scale:.4f})">')
    for pid, pstr in poly_strs.items():
        fill_cor, ia_k = _province_fill(mapa, turn, pid, ia_meta, default="#243447")
        is_focus = pid in focus_set
        stroke_cor = "#FDE047" if is_focus else ("#94A3B8" if ia_k == "deepseek" else "#0B1322")
        sw = (2.4 if is_focus else 1.3) / max(0.35, scale)
        op = "0.96" if (is_focus or not focus_set) else "0.58"
        parts.append(
            f'<polygon points="{pstr}" fill="{fill_cor}" fill-opacity="{op}" '
            f'stroke="{stroke_cor}" stroke-width="{sw:.2f}" stroke-linejoin="round"/>'
        )
    parts.append("</g>")

    # Recrutamento animado (ex: Guayana +tropas)
    if recruit_pid and recruit_prog > 0.01:
        rpt = to_screen(recruit_pid)
        if rpt:
            rx, ry = rpt
            rp = _clamp(recruit_prog, 0.0, 1.0)
            ring_r = 12.0 + 34.0 * rp
            ring_op = max(0.0, 1.0 - rp * 0.85)
            parts.append(
                f'<circle cx="{rx:.1f}" cy="{ry:.1f}" r="{ring_r:.1f}" fill="none" stroke="#19A974" stroke-width="4" opacity="{ring_op:.2f}"/>'
                f'<circle cx="{rx:.1f}" cy="{ry:.1f}" r="14" fill="#19A974" stroke="#F8FAFC" stroke-width="2.5"/>'
                f'<line x1="{rx - 7:.1f}" y1="{ry:.1f}" x2="{rx + 7:.1f}" y2="{ry:.1f}" stroke="#F8FAFC" stroke-width="3.2"/>'
                f'<line x1="{rx:.1f}" y1="{ry - 7:.1f}" x2="{rx:.1f}" y2="{ry + 7:.1f}" stroke="#F8FAFC" stroke-width="3.2"/>'
            )
            if recruit_label:
                lbl = _clean_text(recruit_label)
                pw = max(124.0, len(lbl) * 13.0 + 26.0)
                ly = ry - 38.0 - 12.0 * _ease_out(rp)
                parts.append(
                    f'<rect x="{rx - pw * 0.5:.1f}" y="{ly - 24:.1f}" width="{pw:.1f}" height="32" rx="8" '
                    f'fill="#064E3B" fill-opacity="0.94" stroke="#34D399" stroke-width="2.2"/>'
                    f'<text x="{rx:.1f}" y="{ly - 2:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
                    f'font-size="20" font-weight="800" fill="#ECFDF5">{_esc(lbl)}</text>'
                )

    # Rotas taticas tracejadas + soldados marchando
    dash_off = -((t_sec * 65.0) % 40.0)
    march_p = _clamp(t_prog, 0.0, 1.0)
    for r_idx, route in enumerate(routes):
        p_de = to_screen(route.get("de", ""))
        p_para = to_screen(route.get("para", ""))
        if not p_de or not p_para:
            continue
        ia_r = _ia_key(route.get("ia") or _province_ia_key(mapa, turn, route.get("de", "")))
        cor_r = _ia_color_on_dark(_ia_info(ia_meta, ia_r)["cor"])
        mx = (p_de[0] + p_para[0]) * 0.5
        my = (p_de[1] + p_para[1]) * 0.5
        dx = p_para[0] - p_de[0]
        dy = p_para[1] - p_de[1]
        dist = max(1.0, math.hypot(dx, dy))
        bend = min(56.0, dist * 0.24) * (1.0 if r_idx % 2 == 0 else -1.0)
        ctrl = (mx - dy / dist * bend, my + dx / dist * bend)

        # Linha tracejada animada de plano tatico
        parts.append(
            f'<path d="M{p_de[0]:.1f},{p_de[1]:.1f} Q{ctrl[0]:.1f},{ctrl[1]:.1f} {p_para[0]:.1f},{p_para[1]:.1f}" '
            f'fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" opacity="0.45"/>'
            f'<path d="M{p_de[0]:.1f},{p_de[1]:.1f} Q{ctrl[0]:.1f},{ctrl[1]:.1f} {p_para[0]:.1f},{p_para[1]:.1f}" '
            f'fill="none" stroke="{cor_r}" stroke-width="4.5" stroke-dasharray="14,9" stroke-dashoffset="{dash_off:.1f}" '
            f'stroke-linecap="round"/>'
        )

        # Ponta de flecha no destino
        tx_end, ty_end = _quad_tangent(p_de, ctrl, p_para, 0.96)
        ang_end = math.atan2(ty_end, tx_end)
        ah = 14.0
        a1 = (p_para[0] - ah * math.cos(ang_end - 0.5), p_para[1] - ah * math.sin(ang_end - 0.5))
        a2 = (p_para[0] - ah * math.cos(ang_end + 0.5), p_para[1] - ah * math.sin(ang_end + 0.5))
        parts.append(
            f'<polygon points="{p_para[0]:.1f},{p_para[1]:.1f} {a1[0]:.1f},{a1[1]:.1f} {a2[0]:.1f},{a2[1]:.1f}" '
            f'fill="{cor_r}" stroke="#0F172A" stroke-width="1.5"/>'
        )

        # Soldados marchando ao longo da rota
        col_t = _clamp(march_p, 0.08, 0.92)
        sx, sy = _quad_bezier(p_de, ctrl, p_para, col_t)
        tdx, tdy = _quad_tangent(p_de, ctrl, p_para, col_t)
        ang_deg = math.degrees(math.atan2(tdy, tdx))
        parts.append(_svg_mini_soldiers(sx, sy, ang_deg, cor_r, t_sec, scale=0.95))

        qtd = route.get("qtd")
        if qtd:
            qtxt = f"{int(qtd):,}".replace(",", ".")
            qw = max(68.0, len(qtxt) * 12.0 + 18.0)
            parts.append(
                f'<rect x="{sx - qw * 0.5:.1f}" y="{sy - 38:.1f}" width="{qw:.1f}" height="24" rx="6" '
                f'fill="#070D17" fill-opacity="0.92" stroke="{cor_r}" stroke-width="1.8"/>'
                f'<text x="{sx:.1f}" y="{sy - 20:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
                f'font-size="16" font-weight="800" fill="#F8FAFC">{_esc(qtxt)}</text>'
            )

    # Reticulos de alvos taticos
    for tg in targets:
        tpt = to_screen(tg.get("pid", ""))
        if tpt:
            parts.append(_svg_target_reticle(tpt[0], tpt[1], t_sec, cor="#EF4444", label=tg.get("label", "")))

    # Fortaleza erguendo
    if fortress_pid and fortress_rise > 0.01:
        fpt = to_screen(fortress_pid)
        if fpt:
            parts.append(_svg_fortress_icon(fpt[0], fpt[1], scale=1.05, accent="#FBBF24", rise=fortress_rise))

    # Impacto / pilula de baixas (ex: -1.772 em Roraima)
    if explosion_pid and explosion_prog > 0.01:
        ept = to_screen(explosion_pid)
        if ept:
            ex, ey = ept
            ep = _clamp(explosion_prog, 0.0, 1.0)
            shock_r = 14.0 + 44.0 * _ease_out(ep)
            shock_op = max(0.0, 0.9 - ep * 0.7)
            parts.append(
                f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{shock_r:.1f}" fill="none" stroke="#FDE047" stroke-width="4" opacity="{shock_op:.2f}"/>'
                f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{shock_r * 0.55:.1f}" fill="#EF4444" opacity="{shock_op * 0.5:.2f}"/>'
            )
            if explosion_loss:
                ltxt = _clean_text(explosion_loss)
                lw = max(110.0, len(ltxt) * 15.0 + 28.0)
                pop_y = ey - 32.0 - 16.0 * _ease_out(ep)
                parts.append(
                    f'<rect x="{ex - lw * 0.5:.1f}" y="{pop_y - 26:.1f}" width="{lw:.1f}" height="38" rx="9" '
                    f'fill="#7F1D1D" fill-opacity="0.96" stroke="#FCA5A5" stroke-width="2.5"/>'
                    f'<text x="{ex:.1f}" y="{pop_y + 1:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
                    f'font-size="24" font-weight="900" fill="#FEF2F2">{_esc(ltxt)}</text>'
                )

    # Contrato rasgando ao meio dentro do mini-mapa
    if torn_treaty:
        tcx = bx + bw * 0.5
        tcy = by + header_h + (bh - header_h - footer_h) * 0.66
        t_scale = min(0.76, (bw / 340.0) * 0.45)
        parts.append(
            _svg_torn_contract(
                tcx,
                tcy,
                float(torn_treaty.get("prog", t_prog)),
                str(torn_treaty.get("de_pais", "PACTO")),
                str(torn_treaty.get("para_pais", "ALIADO")),
                str(torn_treaty.get("tipo", "PACTO")),
                scale=t_scale,
            )
        )

    # Barra superior do mini-mapa
    parts.append(
        f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{header_h:.1f}" fill="#070D17" fill-opacity="0.92"/>'
        f'<line x1="{bx:.1f}" y1="{by + header_h:.1f}" x2="{bx + bw:.1f}" y2="{by + header_h:.1f}" stroke="#1E293B" stroke-width="2"/>'
        f'<circle cx="{bx + 22:.1f}" cy="{by + 22:.1f}" r="6" fill="{accent_cor}"/>'
        f'<text x="{bx + 38:.1f}" y="{by + 30:.1f}" font-family="{FONT_MONO}" font-size="21" font-weight="800" fill="#F8FAFC">{_esc(title)}</text>'
    )

    # Rodape opcional dentro do mini-mapa
    if footer_caption:
        fy = by + bh - footer_h
        parts.append(
            f'<rect x="{bx:.1f}" y="{fy:.1f}" width="{bw:.1f}" height="{footer_h:.1f}" fill="#070D17" fill-opacity="0.94"/>'
            f'<line x1="{bx:.1f}" y1="{fy:.1f}" x2="{bx + bw:.1f}" y2="{fy:.1f}" stroke="#334155" stroke-width="1.8"/>'
            f'<text x="{bx + bw * 0.5:.1f}" y="{fy + 31:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="23" font-weight="800" fill="#FDE047">{_esc(footer_caption)}</text>'
        )

    parts.append("</g>")

    # Cantoneiras taticas (visual estado-maior)
    cl = 16.0
    parts.append(
        f'<path d="M{bx + 6:.1f},{by + cl + 6:.1f} L{bx + 6:.1f},{by + 6:.1f} L{bx + cl + 6:.1f},{by + 6:.1f}" '
        f'fill="none" stroke="{accent_cor}" stroke-width="3" stroke-linecap="round"/>'
        f'<path d="M{bx + bw - cl - 6:.1f},{by + bh - 6:.1f} L{bx + bw - 6:.1f},{by + bh - 6:.1f} L{bx + bw - 6:.1f},{by + bh - cl - 6:.1f}" '
        f'fill="none" stroke="{accent_cor}" stroke-width="3" stroke-linecap="round"/>'
    )
    return "".join(parts)


# ---------------------------------------------------------------------------
# 1. Legenda paginada do narrador (NUNCA corta com '...')
# ---------------------------------------------------------------------------


def _paginate_narrator_text(texto: str, max_chars_page: int = 78) -> list[list[str]]:
    """Divide texto em paginas completas de no maximo 2 linhas (~9-12 palavras), sem truncar."""
    s = _clean_text(texto)
    if not s:
        return []
    cap = max(36, int(max_chars_page))
    line_w = max(24, min(46, (cap + 1) // 2 + 4))
    max_words_page = max(8, min(14, round(cap / 6.5)))

    words = s.split(" ")
    raw_pages: list[list[str]] = []
    cur: list[str] = []

    for w in words:
        cand = cur + [w]
        cand_str = " ".join(cand)
        cand_lines = _wrap_words_full(cand_str, line_w)
        too_many_lines = len(cand_lines) > 2
        too_long = len(cand_str) > cap and len(cur) >= 4
        too_many_words = len(cand) > max_words_page and len(cur) >= 7
        natural_break = (
            len(cur) >= 8
            and cur[-1][-1:] in ".!?;:"
            and len(cand_str) > int(cap * 0.65)
        )
        if cur and (too_many_lines or too_long or too_many_words or natural_break):
            raw_pages.append(cur)
            cur = [w]
        else:
            cur = cand
    if cur:
        raw_pages.append(cur)

    # Evita pagina final orfa (1-3 palavras) rebalanceando as duas ultimas paginas se couber
    if len(raw_pages) >= 2 and len(raw_pages[-1]) <= 3:
        combined = raw_pages[-2] + raw_pages[-1]
        mid = len(combined) // 2
        p_a = combined[:mid]
        p_b = combined[mid:]
        la = _wrap_words_full(" ".join(p_a), line_w)
        lb = _wrap_words_full(" ".join(p_b), line_w)
        if len(la) <= 2 and len(lb) <= 2:
            raw_pages[-2] = p_a
            raw_pages[-1] = p_b

    pages: list[list[str]] = []
    for pwords in raw_pages:
        txt = " ".join(pwords)
        lines = _wrap_words_full(txt, line_w)
        # Caso uma palavra gigante gere 3 linhas, expande suavemente a largura da pagina (jamais trunca)
        if len(lines) > 2:
            lines = _wrap_words_full(txt, max(line_w + 10, (len(txt) + 1) // 2 + 2))
        pages.append(lines)
    return pages


def _esc_tspan_seg(text: str) -> str:
    """Escapa texto adjacente a <tspan> preservando espacos de borda no librsvg."""
    if text is None:
        return ""
    s = _EMOJI_RE.sub("", str(text))
    s = _CTRL_RE.sub(" ", s)
    s = re.sub(r"\s+", " ", s)
    s = xml_escape(s, {'"': "&quot;", "'": "&apos;"})
    if s.startswith(" "):
        s = "&#160;" + s[1:]
    if s.endswith(" "):
        s = s[:-1] + "&#160;"
    return s


def _format_ia_highlighted_tspans(line: str, ia_meta: dict[str, dict[str, str]]) -> str:
    """Destaca nomes das 7 IAs na cor oficial delas via <tspan>."""
    out: list[str] = []
    last = 0
    for m in _IA_TOKEN_RE.finditer(line):
        if m.start() > last:
            out.append(_esc_tspan_seg(line[last:m.start()]))
        token = m.group(0)
        info = _ia_info(ia_meta, token)
        cor = _ia_color_on_dark(info["cor"])
        out.append(f'<tspan fill="{cor}" font-weight="900">{_esc_tspan_seg(token)}</tspan>')
        last = m.end()
    if last < len(line):
        out.append(_esc_tspan_seg(line[last:]))
    return "".join(out)


def render_paged_narrator_bar(
    texto: str,
    progress: float,
    ia_meta: dict[str, dict[str, str]] | None,
    max_chars_page: int = 78,
) -> str:
    """Renderiza somente a pagina ativa da fala do narrador com nomes de IAs coloridos."""
    meta = _resolve_ia_meta(ia_meta)
    pages = _paginate_narrator_text(texto, max_chars_page=max_chars_page)
    if not pages:
        return ""

    p = _clamp(float(progress), 0.0, 1.0)
    # Seleciona pagina proporcional ao tamanho de caracteres (ritmo natural de fala)
    weights = [max(10, sum(len(ln) for ln in pg)) for pg in pages]
    total_w = float(sum(weights))
    target = p * total_w
    acc = 0.0
    page_idx = len(pages) - 1
    for i, wt in enumerate(weights):
        acc += wt
        if target <= acc or i == len(pages) - 1:
            page_idx = i
            break

    lines = pages[page_idx]
    font_size = 31 if len(lines) <= 2 else 26
    line_step = 40 if len(lines) <= 2 else 34
    h = 46 + len(lines) * line_step
    w = 1380
    x = (SVG_W - w) * 0.5
    y = SVG_H - h - 20

    parts = [
        "<g>",
        f'<rect x="{x + 4:.0f}" y="{y + 6:.0f}" width="{w}" height="{h}" rx="14" fill="#000000" opacity="0.52"/>',
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w}" height="{h}" rx="14" '
        f'fill="#070D17" fill-opacity="0.93" stroke="#334155" stroke-width="2"/>',
        f'<rect x="{x + 16:.0f}" y="{y + 14:.0f}" width="7" height="{h - 28:.0f}" rx="3.5" fill="#FBBF24"/>',
    ]

    # Barra fina de progresso no rodape do card
    prog_w = max(8.0, (w - 44) * p)
    parts.append(
        f'<rect x="{x + 22:.0f}" y="{y + h - 7:.0f}" width="{w - 44}" height="3" rx="1.5" fill="#1E293B"/>'
        f'<rect x="{x + 22:.0f}" y="{y + h - 7:.0f}" width="{prog_w:.1f}" height="3" rx="1.5" fill="#FBBF24"/>'
    )

    # Indicador discreto de paginas (pontos) quando houver multiplas paginas
    if len(pages) > 1:
        dot_gap = 14
        dots_w = (len(pages) - 1) * dot_gap
        dx0 = x + w - 28 - dots_w
        dy = y + 20
        for i in range(len(pages)):
            dc = "#FBBF24" if i == page_idx else ("#64748B" if i < page_idx else "#334155")
            dr = 4.6 if i == page_idx else 3.2
            parts.append(f'<circle cx="{dx0 + i * dot_gap:.1f}" cy="{dy:.1f}" r="{dr:.1f}" fill="{dc}"/>')

    text_y0 = y + 46 if len(lines) <= 2 else y + 38
    for i, ln in enumerate(lines):
        content_svg = _format_ia_highlighted_tspans(ln, meta)
        parts.append(
            f'<text xml:space="preserve" x="{x + 40:.0f}" y="{text_y0 + i * line_step:.0f}" font-family="{FONT_SANS}" '
            f'font-size="{font_size}" font-weight="700" fill="#F8FAFC">{content_svg}</text>'
        )

    parts.append("</g>")
    return "".join(parts)


_HARD_WORDS_DICT: list[tuple[str, str, str, str]] = [
    ("qwen", "QWEN", "IA", "#F2802E"),
    ("inkling", "INKLING", "IA", "#22C7D6"),
    ("deepseek", "DEEPSEEK", "IA", "#C8D3DD"),
    ("hydrogen", "HYDROGEN", "IA", "#19A974"),
    ("llanos", "LLANOS", "PROVINCIA", "#FBBF24"),
    ("chaco paraguaio", "CHACO PARAGUAIO", "REGIAO", "#FBBF24"),
    ("arequipa", "AREQUIPA", "PROVINCIA", "#FBBF24"),
    ("antioquia", "ANTIOQUIA", "PROVINCIA", "#FBBF24"),
    ("mendoza", "MENDOZA", "PROVINCIA", "#FBBF24"),
    ("pna", "PNA", "PACTO DE NAO-AGRESSAO", "#FBBF24"),
]


def render_hard_words_callout(
    texto: str,
    progress: float,
    dur_sec: float,
    scene_id: str = "",
    ia_meta: dict[str, dict[str, str]] | None = None,
) -> str:
    """Exibe pill discreta apenas durante palavras dificeis/estrangeiras (sem legenda continua)."""
    if (scene_id or "").strip().upper() == "A2":
        return ""
    clean_txt = _clean_text(texto)
    if not clean_txt:
        return ""

    norm_txt, idx_map = _normalize_with_map(clean_txt)
    if not norm_txt or not idx_map:
        return ""

    p = _clamp(float(progress), 0.0, 1.0)
    win_s = 1.25
    half_p = (win_s * 0.5) / max(0.8, float(dur_sec))
    txt_len = float(max(1, len(clean_txt)))

    best: tuple[float, float, str, str, str] | None = None
    for term_pat, label, tag, accent in _HARD_WORDS_DICT:
        for m in re.finditer(rf"\b{re.escape(term_pat)}\b", norm_txt):
            s = idx_map[m.start()]
            e = idx_map[m.end() - 1] + 1
            center_p = ((s + e) * 0.5) / txt_len
            dist = abs(p - center_p)
            if dist <= half_p:
                if best is None or dist < best[0]:
                    best = (dist, center_p, label, tag, accent)

    if best is None:
        return ""

    _, center_p, label, tag, accent = best
    if ia_meta:
        info = _ia_info(ia_meta, label)
        if info.get("cor") and info.get("nome", "").lower() == label.lower():
            accent = _ia_color_on_dark(info["cor"])

    u = _clamp((p - (center_p - half_p)) / max(1e-4, 2.0 * half_p), 0.0, 1.0)
    if u < 0.16:
        alpha = u / 0.16
    elif u > 0.80:
        alpha = (1.0 - u) / 0.20
    else:
        alpha = 1.0
    alpha = _clamp(alpha, 0.0, 1.0)
    if alpha <= 0.01:
        return ""

    sc = 0.92 + 0.08 * _clamp(u / 0.18, 0.0, 1.0)
    cx = 960.0
    cy = 1012.0
    h = 66.0
    w = float(max(220, int(len(label) * 23 + len(tag) * 12 + 86)))
    x = cx - w * 0.5
    y = cy - h * 0.5

    lbl_w = _estimate_text_px(label, 33.0)
    lbl_x = x + 32.0
    tag_x = lbl_x + lbl_w + 18.0

    return (
        f'<g opacity="{alpha:.3f}" transform="translate({cx:.1f},{cy:.1f}) scale({sc:.3f}) translate({-cx:.1f},{-cy:.1f})">'
        f'<rect x="{x + 3:.1f}" y="{y + 5:.1f}" width="{w:.1f}" height="{h:.1f}" rx="14" fill="#000000" opacity="0.50"/>'
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="14" '
        f'fill="#070D17" fill-opacity="0.92" stroke="{accent}" stroke-width="2.5"/>'
        f'<rect x="{x + 14:.1f}" y="{y + 13:.1f}" width="7" height="{h - 26:.1f}" rx="3.5" fill="{accent}"/>'
        f'<text x="{lbl_x:.1f}" y="{cy + 11:.1f}" font-family="{FONT_SANS}" font-size="33" font-weight="900" fill="#F8FAFC">{_esc(label)}</text>'
        f'<text x="{tag_x:.1f}" y="{cy + 6:.1f}" font-family="{FONT_MONO}" font-size="16" font-weight="800" fill="#94A3B8">{_esc(tag)}</text>'
        f'</g>'
    )


# ---------------------------------------------------------------------------
# 2. HUD de Timelapse Linear no topo-centro
# ---------------------------------------------------------------------------


def render_timelapse_hud(
    partida: int,
    turno_atual: int,
    turno_alvo: int,
    data_str: str,
    prog: float,
) -> str:
    """Barra cinematografica no topo-centro durante avanco linear entre turnos."""
    p = _clamp(float(prog), 0.0, 1.0)
    t_a = int(turno_atual)
    t_b = int(turno_alvo)
    t_lo = min(t_a, t_b)
    t_hi = max(t_a, t_b)
    span = max(0, t_hi - t_lo)

    w = 860
    h = 112
    x = (SVG_W - w) * 0.5  # 530..1390 (livre do chip esquerdo e painel direito x>=1455)
    y = 82

    # Lista de turnos exibidos na trilha
    if span == 0:
        ticks = [t_lo]
    elif span <= 6:
        ticks = list(range(t_lo, t_hi + 1))
    else:
        ticks = sorted({t_lo, t_lo + span // 3, t_lo + (2 * span) // 3, t_hi})

    # Sequencia resumida no titulo: T2 -> T3 -> ... -> T6
    if span == 0:
        seq_str = f"T{t_lo}"
    elif span <= 3:
        seq_str = " -> ".join(f"T{n}" for n in range(t_lo, t_hi + 1))
    else:
        seq_str = f"T{t_lo} -> T{t_lo + 1} -> ... -> T{t_hi}"

    header_txt = f"AVANCO LINEAR · {seq_str}"
    clean_date = _clean_text(data_str).upper()
    badge_right = f"P{int(partida)} · {clean_date}" if clean_date else f"PARTIDA {int(partida)}"

    # Posicao do ponteiro animado
    track_x0 = x + 46
    track_x1 = x + w - 46
    track_w = track_x1 - track_x0
    track_y = y + 74
    ptr_x = track_x0 + track_w * p
    cur_turn_est = int(round(_lerp(float(t_lo), float(t_hi), p)))
    pulse = 0.72 + 0.28 * math.sin(p * math.pi * 6.0)

    # Data do log a direita (largura dinamica para nunca cortar)
    badge_w = max(210, min(320, len(badge_right) * 13 + 32))
    badge_x = x + w - badge_w - 18

    parts = [
        "<g>",
        f'<rect x="{x + 5:.0f}" y="{y + 7:.0f}" width="{w}" height="{h}" rx="15" fill="#000000" opacity="0.56"/>',
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w}" height="{h}" rx="15" '
        f'fill="#070D17" fill-opacity="0.94" stroke="#FBBF24" stroke-width="2.6"/>',
        # Icone fast-forward >>
        f'<g opacity="{pulse:.2f}">'
        f'<polygon points="{x + 22:.0f},{y + 18} {x + 36:.0f},{y + 28} {x + 22:.0f},{y + 38}" fill="#FBBF24"/>'
        f'<polygon points="{x + 36:.0f},{y + 18} {x + 50:.0f},{y + 28} {x + 36:.0f},{y + 38}" fill="#FDE047"/>'
        f'</g>',
        f'<text x="{x + 62:.0f}" y="{y + 37}" font-family="{FONT_MONO}" font-size="24" font-weight="800" fill="#FBBF24">{_esc(header_txt)}</text>',
        # Data do log a direita
        f'<rect x="{badge_x:.0f}" y="{y + 12}" width="{badge_w:.0f}" height="34" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>'
        f'<text x="{badge_x + badge_w * 0.5:.0f}" y="{y + 36}" text-anchor="middle" font-family="{FONT_MONO}" font-size="20" font-weight="700" fill="#F8FAFC">{_esc(badge_right)}</text>',
        # Trilha de fundo e progresso
        f'<line x1="{track_x0:.1f}" y1="{track_y}" x2="{track_x1:.1f}" y2="{track_y}" stroke="#1E293B" stroke-width="8" stroke-linecap="round"/>',
        f'<line x1="{track_x0:.1f}" y1="{track_y}" x2="{ptr_x:.1f}" y2="{track_y}" stroke="#FBBF24" stroke-width="8" stroke-linecap="round"/>',
    ]

    # Nos de cada turno na trilha
    for n in ticks:
        frac = 0.0 if span == 0 else (n - t_lo) / float(span)
        nx = track_x0 + track_w * frac
        passed = frac <= p + 0.001
        ncor = "#FBBF24" if passed else "#475569"
        txt_cor = "#F8FAFC" if passed else "#94A3B8"
        parts.append(
            f'<circle cx="{nx:.1f}" cy="{track_y}" r="7.5" fill="{ncor}" stroke="#070D17" stroke-width="2.5"/>'
            f'<text x="{nx:.1f}" y="{track_y + 28}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="20" font-weight="800" fill="{txt_cor}">T{n}</text>'
        )

    # Ponteiro animado em diamante + indicador de turno atual
    parts.append(
        f'<circle cx="{ptr_x:.1f}" cy="{track_y}" r="14" fill="#FBBF24" opacity="0.26"/>'
        f'<polygon points="{ptr_x:.1f},{track_y - 12} {ptr_x + 11:.1f},{track_y} {ptr_x:.1f},{track_y + 12} {ptr_x - 11:.1f},{track_y}" '
        f'fill="#FEF08A" stroke="#0F172A" stroke-width="2.2"/>'
        f'<rect x="{ptr_x - 28:.1f}" y="{track_y - 38}" width="56" height="22" rx="6" fill="#FBBF24"/>'
        f'<text x="{ptr_x:.1f}" y="{track_y - 22}" text-anchor="middle" font-family="{FONT_MONO}" '
        f'font-size="16" font-weight="900" fill="#0F172A">T{cur_turn_est}</text>'
    )

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 3. Abertura A2 Poster v2 (onda nos paises + retratos voando para os cards)
# ---------------------------------------------------------------------------


def _country_screen_anchor(
    topo: Any,
    mapa: dict[str, Any],
    turn0: dict[str, Any] | None,
    ia_k: str,
    fallback_country: str,
    scale: float,
    tx: float,
    ty: float,
) -> tuple[float, float]:
    """Calcula ponto ancora na tela (mapa a esquerda) para uma IA no turno 0."""
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    nacoes = (mapa or {}).get("nacoes") or {}
    # Tenta capital da nacao da IA
    for nid, nmeta in nacoes.items():
        k_n = _ia_key(nmeta.get("ia_apelido") or nmeta.get("ia_id") or "")
        if k_n == ia_k or nid == fallback_country:
            cap = nmeta.get("capital_id")
            if cap and cap in centers:
                cx, cy = centers[cap]
                return (cx * scale + tx, cy * scale + ty)
    # Fallback: media das provincias pertencentes a IA
    pts: list[tuple[float, float]] = []
    for pid, pt in centers.items():
        if _province_ia_key(mapa, turn0, pid) == ia_k:
            pts.append(pt)
    if pts:
        mx = sum(p[0] for p in pts) / len(pts)
        my = sum(p[1] for p in pts) / len(pts)
        return (mx * scale + tx, my * scale + ty)
    return (440.0, 520.0)


def render_a2_poster_v2(
    topo: Any,
    mapa: dict[str, Any],
    turn0: dict[str, Any],
    t_norm: float,
    active_fala: dict[str, Any] | None,
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Poster da Abertura A2: paises acendem em onda e os 7 retratos voam para os cards."""
    meta = _resolve_ia_meta(ia_meta)
    tn = _clamp(float(t_norm), 0.0, 1.0)
    nar_txt = _clean_text((active_fala or {}).get("texto", "")).lower()
    active_ia = _ia_key((active_fala or {}).get("ia", ""))

    # Encaixa America do Sul na metade esquerda (x=48..848, y=156..892)
    bounds = _collect_topo_bounds(topo, None)
    map_box = (48.0, 156.0, 790.0, 736.0)
    scale, tx, ty = _fit_box_transform(bounds, map_box, pad_frac=0.05)

    # Calcula estado de onda/voo de cada uma das 7 IAs
    ia_states: dict[str, dict[str, Any]] = {}
    card_x_base = 940.0
    card_w = 920.0
    card_h = 88.0
    card_y0 = 162.0
    card_step = 102.0

    for idx, (k, nome, sub, pais_p1) in enumerate(A2_ELENCO):
        lit_p = _ease_out(_clamp((tn - idx * 0.055) / 0.11, 0.0, 1.0))
        fly_p = _ease_out(_clamp((tn - (0.09 + idx * 0.072)) / 0.22, 0.0, 1.0))
        cited = (nome.lower() in nar_txt) or (k in nar_txt) or (active_ia == k)
        src_x, src_y = _country_screen_anchor(topo, mapa, turn0, k, pais_p1, scale, tx, ty)
        card_shift = -16.0 if cited else 0.0
        bx = card_x_base + (1.0 - lit_p) * 58.0 + card_shift
        by = card_y0 + idx * card_step
        dst_x = bx + 54.0
        dst_y = by + card_h * 0.5
        ctrl_x = (src_x + dst_x) * 0.5
        ctrl_y = min(src_y, dst_y) - 65.0 - (idx % 3) * 18.0
        cur_x, cur_y = _quad_bezier((src_x, src_y), (ctrl_x, ctrl_y), (dst_x, dst_y), fly_p)
        ia_states[k] = {
            "idx": idx,
            "nome": nome,
            "sub": sub,
            "cor": meta[k]["cor"] if k in meta else "#64748B",
            "lit_p": lit_p,
            "fly_p": fly_p,
            "cited": cited,
            "src": (src_x, src_y),
            "ctrl": (ctrl_x, ctrl_y),
            "dst": (dst_x, dst_y),
            "cur": (cur_x, cur_y),
            "bx": bx,
            "by": by,
        }

    parts = [
        _bg_war_room(),
        # Moldura sutil do mapa a esquerda
        '<rect x="44" y="152" width="800" height="744" rx="20" fill="#081623" fill-opacity="0.72" stroke="#1E3A52" stroke-width="2"/>',
        # Titulo poster
        f'<text x="960" y="82" text-anchor="middle" font-family="{FONT_SANS}" font-size="50" font-weight="900" '
        f'fill="#F8FAFC" letter-spacing="1.4">COLOQUEI 7 IAs PRA JOGAR AGE OF HISTORY 2</text>'
        f'<text x="960" y="124" text-anchor="middle" font-family="{FONT_MONO}" font-size="24" font-weight="700" '
        f'fill="#FBBF24">AMERICA DO SUL · 2 PARTIDAS REAIS · 25 TURNOS CADA</text>',
    ]

    # Mapa com cada pais acendendo em onda
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) scale({scale:.4f})">')
    for pid, pstr in poly_strs.items():
        ia_d = _province_ia_key(mapa, turn0, pid)
        st = ia_states.get(ia_d)
        if st and st["lit_p"] > 0.02:
            cor = st["cor"]
            op = 0.28 + 0.72 * st["lit_p"]
            cited = st["cited"]
            stroke_c = "#FDE047" if cited else ("#C8D3DD" if ia_d == "deepseek" else "#0B1322")
            sw = (3.4 if cited else 1.5) / max(0.35, scale)
        else:
            cor = "#1D2C3C"
            op = 0.85
            stroke_c = "#0B1322"
            sw = 1.3 / max(0.35, scale)
        parts.append(
            f'<polygon points="{pstr}" fill="{cor}" fill-opacity="{op:.2f}" '
            f'stroke="{stroke_c}" stroke-width="{sw:.2f}" stroke-linejoin="round"/>'
        )
    parts.append("</g>")

    # Cards a direita (camada de fundo dos cards)
    for k, _, _, _ in A2_ELENCO:
        st = ia_states[k]
        lit_p = st["lit_p"]
        cited = st["cited"]
        cor = st["cor"]
        cor_vis = _ia_color_on_dark(cor)
        bx, by = st["bx"], st["by"]
        card_op = 0.25 + 0.75 * lit_p
        stroke_c = cor_vis if cited else ("#475569" if lit_p > 0.5 else "#1E293B")
        sw = 4.5 if cited else 2.0
        parts.append(
            f'<g opacity="{card_op:.2f}">'
            f'<rect x="{bx + 5:.1f}" y="{by + 6:.1f}" width="{card_w:.0f}" height="{card_h:.0f}" rx="15" fill="#000000" opacity="0.45"/>'
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="{card_w:.0f}" height="{card_h:.0f}" rx="15" '
            f'fill="#0B1322" fill-opacity="0.95" stroke="{stroke_c}" stroke-width="{sw:.1f}"/>'
            f'<rect x="{bx + 6:.1f}" y="{by + 12:.1f}" width="7" height="{card_h - 24:.0f}" rx="3.5" fill="{cor_vis}" opacity="{1.0 if cited else 0.75:.2f}"/>'
            f'<text x="{bx + 108:.1f}" y="{by + 40:.1f}" font-family="{FONT_SANS}" font-size="30" font-weight="900" '
            f'fill="{"#FDE047" if cited else "#F8FAFC"}">{_esc(st["nome"])}</text>'
            f'<text x="{bx + 108:.1f}" y="{by + 72:.1f}" font-family="{FONT_MONO}" font-size="22" font-weight="700" '
            f'fill="#CBD5E1">{_esc(st["sub"])}</text>'
        )
        if cited:
            parts.append(
                f'<rect x="{bx + card_w - 166:.1f}" y="{by + 24:.1f}" width="144" height="38" rx="9" fill="{cor}" stroke="#FDE047" stroke-width="2"/>'
                f'<text x="{bx + card_w - 94:.1f}" y="{by + 50:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
                f'font-size="18" font-weight="900" fill="{meta[k]["fg"]}">EM FOCO</text>'
            )
        parts.append("</g>")

    # Rastros de ligacao tracejados (do pais no mapa ate o retrato/card)
    for k, _, _, _ in A2_ELENCO:
        st = ia_states[k]
        if st["lit_p"] <= 0.05:
            continue
        sx, sy = st["src"]
        cx_c, cy_c = st["ctrl"]
        ex, ey = st["cur"] if st["fly_p"] < 0.99 else st["dst"]
        cor_vis = _ia_color_on_dark(st["cor"])
        cited = st["cited"]
        in_flight = 0.02 < st["fly_p"] < 0.98
        line_op = 0.95 if (cited or in_flight) else 0.42
        lw = 3.8 if (cited or in_flight) else 2.2
        dash_off = -((tn * 220.0) % 36.0)
        # Curva parcial quando ainda em voo (ponto de controle ajustado)
        p_t = st["fly_p"]
        q1x = _lerp(sx, cx_c, p_t)
        q1y = _lerp(sy, cy_c, p_t)
        parts.append(
            f'<path d="M{sx:.1f},{sy:.1f} Q{q1x:.1f},{q1y:.1f} {ex:.1f},{ey:.1f}" '
            f'fill="none" stroke="{cor_vis}" stroke-width="{lw:.1f}" stroke-dasharray="10,7" '
            f'stroke-dashoffset="{dash_off:.1f}" opacity="{line_op:.2f}"/>'
            # Pino ancora no pais
            f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{9.5 if cited else 6.5:.1f}" fill="{cor_vis}" stroke="#F8FAFC" stroke-width="2.2"/>'
        )
        if cited:
            ring_r = 16.0 + 8.0 * math.sin(tn * math.pi * 10.0)
            parts.append(
                f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{ring_r:.1f}" fill="none" stroke="#FDE047" stroke-width="2.5" opacity="0.85"/>'
            )

    # Camada superior: os 7 retratos VOANDO dos paises ate os cards
    for k, _, _, _ in A2_ELENCO:
        st = ia_states[k]
        if st["lit_p"] <= 0.02:
            continue
        px, py = st["cur"]
        fly_p = st["fly_p"]
        arc_boost = math.sin(fly_p * math.pi) * 8.0
        rad = _lerp(22.0, 30.0, fly_p) + arc_boost
        hi = st["cited"] or (0.04 < fly_p < 0.96)
        parts.append(f'<g opacity="{st["lit_p"]:.2f}">')
        parts.append(_call_portrait(render_portrait_fn, k, px, py, rad, highlight=hi, ia_meta=meta))
        parts.append("</g>")

    return "".join(parts)


# ---------------------------------------------------------------------------
# 4. Tela de Regras A3 v2 (Mini-mapa tatico P1 T1 a esquerda + 4 abas + 3 regras)
# ---------------------------------------------------------------------------


def _svg_tab_icon(kind: str, cx: float, cy: float, cor: str) -> str:
    if kind == "recrutar":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<circle cx="0" cy="0" r="20" fill="{cor}" fill-opacity="0.22" stroke="{cor}" stroke-width="2.5"/>'
            f'<line x1="-10" y1="0" x2="10" y2="0" stroke="{cor}" stroke-width="4" stroke-linecap="round"/>'
            f'<line x1="0" y1="-10" x2="0" y2="10" stroke="{cor}" stroke-width="4" stroke-linecap="round"/>'
            f'</g>'
        )
    if kind == "mover":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<circle cx="0" cy="0" r="20" fill="{cor}" fill-opacity="0.22" stroke="{cor}" stroke-width="2.5"/>'
            f'<path d="M-11,4 L6,4 L6,10 L13,0 L6,-10 L6,-4 L-11,-4 Z" fill="{cor}"/>'
            f'</g>'
        )
    if kind == "construir":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<circle cx="0" cy="0" r="20" fill="{cor}" fill-opacity="0.22" stroke="{cor}" stroke-width="2.5"/>'
            f'<rect x="-11" y="-2" width="22" height="13" fill="{cor}"/>'
            f'<rect x="-11" y="-9" width="6" height="8" fill="{cor}"/>'
            f'<rect x="-3" y="-11" width="6" height="10" fill="{cor}"/>'
            f'<rect x="5" y="-9" width="6" height="8" fill="{cor}"/>'
            f'</g>'
        )
    # diplomacia
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<circle cx="0" cy="0" r="20" fill="{cor}" fill-opacity="0.22" stroke="{cor}" stroke-width="2.5"/>'
        f'<rect x="-11" y="-9" width="22" height="18" rx="3" fill="none" stroke="{cor}" stroke-width="2.8"/>'
        f'<line x1="-6" y1="-3" x2="6" y2="-3" stroke="{cor}" stroke-width="2.2"/>'
        f'<line x1="-6" y1="3" x2="4" y2="3" stroke="{cor}" stroke-width="2.2"/>'
        f'</g>'
    )


def render_a3_rules_v2(
    topo: Any,
    mapa: dict[str, Any],
    turn1: dict[str, Any],
    t_norm: float,
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Tela de regras A3 com mini-mapa tatico P1 T1 animado a esquerda e 4 abas + 3 regras a direita."""
    meta = _resolve_ia_meta(ia_meta)
    tn = _clamp(float(t_norm), 0.0, 1.0)
    t_sec = tn * 14.0

    # 4 fases sincronizadas: 0=RECRUTAR, 1=MOVER, 2=CONSTRUIR, 3=DIPLOMACIA
    if tn < 0.25:
        active_tab = 0
    elif tn < 0.54:
        active_tab = 1
    elif tn < 0.77:
        active_tab = 2
    else:
        active_tab = 3

    recruit_prog = _clamp(tn / 0.24, 0.0, 1.0)
    march_prog = _clamp((tn - 0.24) / 0.22, 0.0, 1.0)
    explosion_prog = _clamp((tn - 0.42) / 0.14, 0.0, 1.0)
    fort_rise = _clamp((tn - 0.54) / 0.16, 0.0, 1.0)
    treaty_prog = _clamp((tn - 0.76) / 0.22, 0.0, 1.0)

    # Provincias reais da Partida 1 Turno 1 (Norte: Venezuela Ember x Brasil Sonnet)
    focus_pids = [
        "ve_guayana",
        "br_roraima_amapa",
        "ve_caracas",
        "ve_llanos",
        "ve_amazonas",
        "br_amazonas",
        "co_bogota",
    ]
    routes = []
    if tn >= 0.22:
        routes.append({
            "de": "ve_guayana",
            "para": "br_roraima_amapa",
            "qtd": 1772,
            "ia": "ember",
            "naval": False,
        })
    targets = []
    if tn >= 0.22:
        targets.append({"pid": "br_roraima_amapa", "label": "RORAIMA"})

    captions = [
        "1. RECRUTAR: EMBER REFORCA GUAYANA",
        "2. MOVER: SOLDADOS MARCHAM PRA RORAIMA (-1.772)",
        "3. CONSTRUIR: FORTALEZA BLINDA A PROVINCIA",
        "4. DIPLOMACIA: QUEBROU PACTO = TRAICAO!",
    ]
    torn_cfg = None
    if tn >= 0.76:
        torn_cfg = {
            "de_pais": "VENEZUELA",
            "para_pais": "BRASIL",
            "tipo": "PACTO",
            "prog": treaty_prog,
        }

    parts = [
        _bg_war_room(),
        # Cabecalho
        f'<text x="960" y="74" text-anchor="middle" font-family="{FONT_SANS}" font-size="48" font-weight="900" '
        f'fill="#F8FAFC" letter-spacing="1.2">A REGRA INTEIRA NUMA TELA</text>'
        f'<text x="960" y="116" text-anchor="middle" font-family="{FONT_MONO}" font-size="24" font-weight="700" '
        f'fill="#FBBF24">EXEMPLO REAL · VENEZUELA (EMBER) · PARTIDA 1 · TURNO 1</text>',
        # Mini-mapa tatico animado a esquerda
        _render_tactical_minimap(
            topo=topo,
            mapa=mapa,
            turn=turn1,
            box=(56.0, 148.0, 820.0, 742.0),
            clip_id="mm_a3_rules_clip",
            ia_meta=meta,
            t_sec=t_sec,
            t_prog=march_prog,
            title="EXEMPLO AO VIVO · PARTIDA 1 · TURNO 1",
            focus_pids=focus_pids,
            routes=routes,
            targets=targets,
            fortress_pid="ve_caracas" if tn >= 0.54 else None,
            fortress_rise=fort_rise,
            recruit_pid="ve_guayana",
            recruit_label="+RECRUTAR GUAYANA",
            recruit_prog=recruit_prog,
            explosion_pid="br_roraima_amapa" if explosion_prog > 0.01 else None,
            explosion_loss="-1.772",
            explosion_prog=explosion_prog,
            torn_treaty=torn_cfg,
            accent_cor="#E0262B" if active_tab in (1, 3) else "#FBBF24",
            footer_caption=captions[active_tab],
        ),
        # Retrato da Ember no canto superior direito do mini-mapa
        _call_portrait(render_portrait_fn, "ember", 832.0, 224.0, 34.0, highlight=True, ia_meta=meta),
    ]

    # 4 Abas a direita (grid 2x2 limpo, zero texto cortado)
    tabs = [
        ("RECRUTAR", "recrutar", "Convoca tropas nas provincias", "Ex: reforcos em Guayana", "#19A974"),
        ("MOVER", "mover", "Marcha e ataca o vizinho", "Guayana -> Roraima: -1.772", "#E0262B"),
        ("CONSTRUIR", "construir", "Fazenda aumenta o ouro", "Fortaleza segura ataques", "#FBBF24"),
        ("DIPLOMACIA", "diplomacia", "Assina Pacto, Alianca ou Paz", "Rasgou acordo = TRAICAO", "#C084FC"),
    ]
    grid_x = [908.0, 1396.0]
    grid_y = [148.0, 350.0]
    tw, th = 468.0, 182.0

    for i, (tname, ikind, l1, l2, tcor) in enumerate(tabs):
        tx_b = grid_x[i % 2]
        ty_b = grid_y[i // 2]
        is_curr = i == active_tab
        is_done = i < active_tab
        brd = tcor if is_curr else ("#19A974" if is_done else "#334155")
        sw = 4.2 if is_curr else 2.2
        bg_fill = "#111D30" if is_curr else "#0B1322"
        parts.append(
            f'<rect x="{tx_b + 5:.0f}" y="{ty_b + 6:.0f}" width="{tw:.0f}" height="{th:.0f}" rx="15" fill="#000000" opacity="0.45"/>'
            f'<rect x="{tx_b:.0f}" y="{ty_b:.0f}" width="{tw:.0f}" height="{th:.0f}" rx="15" '
            f'fill="{bg_fill}" stroke="{brd}" stroke-width="{sw:.1f}"/>'
            + _svg_tab_icon(ikind, tx_b + 42.0, ty_b + 46.0, tcor if (is_curr or is_done) else "#64748B")
            + f'<text x="{tx_b + 76:.0f}" y="{ty_b + 56:.0f}" font-family="{FONT_SANS}" font-size="30" font-weight="900" '
            f'fill="{tcor if is_curr else "#F8FAFC"}">{i + 1}. {_esc(tname)}</text>'
            + f'<text x="{tx_b + 26:.0f}" y="{ty_b + 108:.0f}" font-family="{FONT_SANS}" font-size="24" font-weight="700" '
            f'fill="#E2E8F0">{_esc(l1)}</text>'
            + f'<text x="{tx_b + 26:.0f}" y="{ty_b + 148:.0f}" font-family="{FONT_MONO}" font-size="22" font-weight="700" '
            f'fill="{tcor if is_curr else "#94A3B8"}">{_esc(l2)}</text>'
        )

    # 3 Regras de ouro abaixo das 4 abas (x=908..1864, y=560..890)
    rules = [
        ("REGRA 1", "PACTO = PROIBIDO ATACAR O ALIADO", "#19A974"),
        ("REGRA 2", "QUEBROU O PACTO = CARIMBO TRAICAO", "#EF4444"),
        ("REGRA 3", "VENCE QUEM FIZER MAIS PONTOS NO T25", "#FBBF24"),
    ]
    rw = 956.0
    rh = 96.0
    for i, (rtag, rtxt, rcor) in enumerate(rules):
        ry = 562.0 + i * 114.0
        parts.append(
            f'<rect x="913" y="{ry + 6:.0f}" width="{rw:.0f}" height="{rh:.0f}" rx="14" fill="#000000" opacity="0.45"/>'
            f'<rect x="908" y="{ry:.0f}" width="{rw:.0f}" height="{rh:.0f}" rx="14" '
            f'fill="#0B1322" stroke="{rcor}" stroke-width="2.8"/>'
            f'<rect x="926" y="{ry + 24:.0f}" width="142" height="48" rx="9" fill="{rcor}"/>'
            f'<text x="997" y="{ry + 57:.0f}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="23" font-weight="900" fill="#0F172A">{_esc(rtag)}</text>'
            f'<text x="1090" y="{ry + 58:.0f}" font-family="{FONT_SANS}" '
            f'font-size="27" font-weight="900" fill="#F8FAFC">{_esc(rtxt)}</text>'
        )

    return "".join(parts)


# ---------------------------------------------------------------------------
# 5. Tela Dois Baloes v2 (diagonal 8 graus + mini-mapa tatico topo-centro)
# ---------------------------------------------------------------------------


def _svg_envelope_icon(cx: float, cy: float, cor: str) -> str:
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<rect x="-22" y="-14" width="44" height="28" rx="4" fill="#1E293B" stroke="{cor}" stroke-width="2.5"/>'
        f'<polyline points="-20,-12 0,3 20,-12" fill="none" stroke="{cor}" stroke-width="2.5"/>'
        f'<circle cx="0" cy="3" r="5" fill="#EF4444"/>'
        f'</g>'
    )


def _svg_newspaper_icon(cx: float, cy: float, cor: str) -> str:
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<rect x="-20" y="-15" width="40" height="30" rx="4" fill="#E2E8F0" stroke="{cor}" stroke-width="2.5"/>'
        f'<rect x="-14" y="-9" width="14" height="10" fill="{cor}"/>'
        f'<line x1="4" y1="-7" x2="14" y2="-7" stroke="#0F172A" stroke-width="2.2"/>'
        f'<line x1="4" y1="-1" x2="14" y2="-1" stroke="#0F172A" stroke-width="2.2"/>'
        f'<line x1="-14" y1="6" x2="14" y2="6" stroke="#0F172A" stroke-width="2.2"/>'
        f'<line x1="-14" y1="11" x2="8" y2="11" stroke="#0F172A" stroke-width="2.2"/>'
        f'</g>'
    )


def render_dois_baloes_v2(
    topo: Any,
    mapa: dict[str, Any],
    turn: dict[str, Any],
    left_c: dict[str, Any] | None,
    right_c: dict[str, Any] | None,
    coreo: dict[str, Any] | None,
    local_f: int,
    fps: int,
    active_fala: dict[str, Any] | None,
    render_portrait_fn: Callable[..., str] | None,
    render_echo_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
    left_prog: float = 1.0,
    right_prog: float = 1.0,
) -> str:
    """Tela diagonal 8 graus com mapa real em deriva + mini-mapa tatico + dois baloes sincronizados com a voz."""
    meta = _resolve_ia_meta(ia_meta)
    coreo = coreo or {}
    fps_safe = max(1.0, float(fps or 30))
    t_sec = max(0.0, float(local_f)) / fps_safe
    t_loop = (t_sec % 4.5) / 4.5

    left_ia = _ia_key((left_c or {}).get("ia", ""))
    right_ia = _ia_key((right_c or {}).get("ia", ""))
    left_cor = _ia_info(meta, left_ia)["cor"] if left_ia else "#3D7BF2"
    right_cor = _ia_info(meta, right_ia)["cor"] if right_ia else "#E0262B"

    parts = [_bg_war_room()]

    routes = list(coreo.get("rotas_soldados") or [])
    targets = list(coreo.get("alvos_taticos") or [])
    focus_pids: list[str] = []
    if not routes and not targets:
        nacoes = (mapa or {}).get("nacoes") or {}
        for target_ia in (left_ia, right_ia):
            if not target_ia:
                continue
            for nmeta in nacoes.values():
                if _ia_key(nmeta.get("ia_apelido") or nmeta.get("ia_id") or "") == target_ia:
                    cap = nmeta.get("capital_id")
                    if cap:
                        focus_pids.append(cap)

    # Mapa real em movimento (deriva continua + zoom + frente de batalha piscando) ao fundo
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    bg_focus = [t["pid"] for t in targets if isinstance(t, dict) and t.get("pid") in centers]
    for r in routes:
        if isinstance(r, dict):
            for k_pid in ("de", "para"):
                if r.get(k_pid) in centers and r[k_pid] not in bg_focus:
                    bg_focus.append(r[k_pid])
    if not bg_focus:
        bg_focus = [p for p in focus_pids if p in centers]
    sa_cx = float(getattr(topo, "sa_cx", 720.0))
    sa_cy = float(getattr(topo, "sa_cy", 560.0))
    if bg_focus:
        fx = sum(centers[p][0] for p in bg_focus) / len(bg_focus)
        fy = sum(centers[p][1] for p in bg_focus) / len(bg_focus)
        cam_x = _lerp(sa_cx, fx, 0.50) + math.sin(t_sec * 0.55) * 18.0
        cam_y = _lerp(sa_cy, fy, 0.50) + math.cos(t_sec * 0.45) * 14.0
        bg_zoom = 1.18 + 0.05 * math.sin(t_sec * 0.35)
    else:
        cam_x = sa_cx + math.sin(t_sec * 0.55) * 18.0
        cam_y = sa_cy + math.cos(t_sec * 0.45) * 14.0
        bg_zoom = 0.98 + 0.04 * math.sin(t_sec * 0.35)
    btx = 960.0 - cam_x * bg_zoom
    bty = 540.0 - cam_y * bg_zoom

    parts.append(f'<g opacity="0.32" transform="translate({btx:.2f},{bty:.2f}) scale({bg_zoom:.4f})">')
    for pid, pstr in poly_strs.items():
        fill_c, _ = _province_fill(mapa, turn, pid, meta, default="#334155")
        parts.append(f'<polygon points="{pstr}" fill="{fill_c}" stroke="#0F172A" stroke-width="1.4"/>')
    if bg_focus:
        b_phase = (t_sec * 1.35) % 1.0
        b_rad = 18.0 + 44.0 * _ease_out(b_phase)
        b_op = max(0.0, 0.92 * (1.0 - b_phase))
        for pid in bg_focus[:3]:
            px_b, py_b = centers[pid]
            parts.append(
                f'<circle cx="{px_b:.1f}" cy="{py_b:.1f}" r="{b_rad:.1f}" fill="none" stroke="#FDE047" stroke-width="3.4" opacity="{b_op:.2f}"/>'
                f'<circle cx="{px_b:.1f}" cy="{py_b:.1f}" r="9" fill="#EF4444" stroke="#F8FAFC" stroke-width="2"/>'
            )
    parts.append("</g>")

    # Metades diagonais exatas de 8 graus (tan(8) * 1080 = 151.8 -> x topo=1036, x base=884)
    parts.append(
        f'<polygon points="0,0 1036,0 884,1080 0,1080" fill="{left_cor}" opacity="0.06"/>'
        f'<polygon points="1036,0 1920,0 1920,1080 884,1080" fill="{right_cor}" opacity="0.06"/>'
        '<line x1="1036" y1="0" x2="884" y2="1080" stroke="#FBBF24" stroke-width="4.5" stroke-dasharray="18,12" opacity="0.82"/>'
    )

    raw_contrato = coreo.get("contrato_rasgado")
    torn_cfg: dict[str, Any] | None = None
    if raw_contrato:
        if isinstance(raw_contrato, dict):
            torn_cfg = {
                "de_pais": raw_contrato.get("de_pais") or _ia_info(meta, left_ia)["nome"],
                "para_pais": raw_contrato.get("para_pais") or _ia_info(meta, right_ia)["nome"],
                "tipo": raw_contrato.get("tipo") or "PACTO",
                "prog": _clamp(t_sec / 2.6, 0.0, 1.0),
            }
        else:
            torn_cfg = {
                "de_pais": _ia_info(meta, left_ia)["nome"],
                "para_pais": _ia_info(meta, right_ia)["nome"],
                "tipo": "PACTO",
                "prog": _clamp(t_sec / 2.6, 0.0, 1.0),
            }

    rotulo = _clean_text(coreo.get("rotulo_tatico") or "")
    mm_title = f"TATICA: {rotulo}" if rotulo else "PLANO TATICO AO VIVO"
    parts.append(
        _render_tactical_minimap(
            topo=topo,
            mapa=mapa,
            turn=turn,
            box=(570.0, 24.0, 780.0, 272.0),
            clip_id="mm_dois_baloes_clip",
            ia_meta=meta,
            t_sec=t_sec,
            t_prog=t_loop,
            title=mm_title,
            focus_pids=focus_pids,
            routes=routes,
            targets=targets,
            fortress_pid=coreo.get("fortaleza_pid"),
            fortress_rise=_clamp(t_sec / 1.2, 0.0, 1.0),
            torn_treaty=torn_cfg,
            accent_cor="#EF4444" if torn_cfg else "#FBBF24",
        )
    )

    # Linhas tracejadas conectando o mini-mapa aos dois baloes
    parts.append(
        f'<path d="M570,190 Q460,210 455,318" fill="none" stroke="{_ia_color_on_dark(left_cor)}" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.65"/>'
        f'<path d="M1350,190 Q1460,210 1465,318" fill="none" stroke="{_ia_color_on_dark(right_cor)}" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.65"/>'
    )

    palavras_hi = [_clean_text(w) for w in (coreo.get("palavras_destaque") or []) if _clean_text(w)]

    def draw_balloon(c: dict[str, Any] | None, bx: float, bal_prog: float) -> str:
        if not c:
            return ""
        ia = c.get("ia", "")
        info = _ia_info(meta, ia)
        cor = info["cor"]
        cor_vis = _ia_color_on_dark(cor)
        is_speaking = (
            active_fala is not None
            and (
                (active_fala.get("idx") is not None and active_fala.get("idx") == c.get("idx"))
                or (active_fala.get("texto") and active_fala.get("texto") == c.get("texto"))
            )
        )
        dim_other = (
            active_fala is not None
            and active_fala.get("kind") == "cita"
            and not is_speaking
        )
        tipo = _clean_text(c.get("tipo", "fala")).lower()
        if tipo == "pensamento":
            bg, fg, brd = "#F3E2A9", "#1E293B", "#78350F"
            lbl = "SO VOCE VE · PENSAMENTO"
            lbl_cor = "#92400E"
        elif tipo == "dm":
            bg, fg, brd = "#101B2D", "#F8FAFC", cor_vis
            dest_raw = _clean_text(c.get("destino") or "").lower()
            dest = COUNTRY_NAMES.get(dest_raw, _clean_text(c.get("destino") or ""))
            lbl = f"DM PRIVADA -> {dest.upper()}" if dest else "DM PRIVADA"
            lbl_cor = cor_vis
        else:
            bg, fg, brd = "#F8FAFC", "#0F172A", cor
            lbl = "FALA PUBLICA"
            lbl_cor = cor if _hex_luminance(cor) < 0.65 else "#0F172A"

        y0, pw, ph = 320.0, 848.0, 548.0
        txt = _clean_text(c.get("texto", ""))
        # Ajusta tamanho de fonte dinamicamente para NUNCA cortar nem sobrepor (sempre >= 24px)
        font_sz = 28
        line_h = 39
        wrap_w = 43
        lines = _wrap_words_full(txt, wrap_w)
        if len(lines) > 9:
            font_sz = 25
            line_h = 34
            wrap_w = 49
            lines = _wrap_words_full(txt, wrap_w)
        if len(lines) > 11:
            font_sz = 24
            line_h = 31
            wrap_w = 53
            lines = _wrap_words_full(txt, wrap_w)

        # Se ainda assim exceder a altura interna (~385px), faz rolagem suave sem cortar
        avail_h = ph - 160.0
        total_h = len(lines) * line_h
        scroll_y = 0.0
        if total_h > avail_h:
            scroll_prog = _clamp((t_sec - 0.8) / max(3.0, len(lines) * 0.55), 0.0, 1.0)
            scroll_y = (total_h - avail_h) * scroll_prog

        clip_txt_id = f"db_txt_{int(bx)}"
        op_g = 0.78 if dim_other else 1.0
        sc_b = (1.0 + 0.015 * math.sin(t_sec * 2.4)) if is_speaking else 1.0
        cx_b, cy_b = bx + pw * 0.5, y0 + ph * 0.5
        bp = _clamp(float(bal_prog), 0.0, 1.0)

        out = [
            f'<g opacity="{op_g:.2f}" transform="translate({cx_b:.1f},{cy_b:.1f}) scale({sc_b:.4f}) translate({-cx_b:.1f},{-cy_b:.1f})">',
            f'<defs><clipPath id="{clip_txt_id}">'
            f'<rect x="{bx + 24:.0f}" y="{y0 + 132:.0f}" width="{pw - 48:.0f}" height="{avail_h + 10:.0f}"/>'
            f'</clipPath></defs>',
            f'<rect x="{bx + 8:.0f}" y="{y0 + 10:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" fill="#000000" opacity="0.52"/>',
            f'<rect x="{bx:.0f}" y="{y0:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" '
            f'fill="{bg}" stroke="{cor_vis if is_speaking else brd}" stroke-width="{5.5 if is_speaking else 3.0:.1f}"/>',
            _call_portrait(render_portrait_fn, ia, bx + 78.0, y0 + 68.0, 42.0, highlight=is_speaking, ia_meta=meta),
            f'<text x="{bx + 142:.0f}" y="{y0 + 62:.0f}" font-family="{FONT_SANS}" font-size="33" font-weight="900" fill="{fg}">{_esc(info["nome"])}</text>',
            f'<text x="{bx + 142:.0f}" y="{y0 + 98:.0f}" font-family="{FONT_MONO}" font-size="21" font-weight="800" fill="{lbl_cor}">{_esc(lbl)}</text>',
            f'<line x1="{bx + 28:.0f}" y1="{y0 + 124:.0f}" x2="{bx + pw - 28:.0f}" y2="{y0 + 124:.0f}" '
            f'stroke="{brd}" stroke-width="1.8" opacity="0.35"/>',
        ]

        if tipo == "pensamento":
            out.append(_call_echo(render_echo_fn, bx + pw - 68.0, y0 + 68.0, "#92400E", t_sec))
        elif tipo == "dm":
            out.append(_svg_envelope_icon(bx + pw - 58.0, y0 + 68.0, cor_vis))
        else:
            out.append(_svg_newspaper_icon(bx + pw - 58.0, y0 + 68.0, cor))

        out.append(f'<g clip-path="url(#{clip_txt_id})">')
        hi_color_txt = cor_vis if tipo == "dm" else (cor if _hex_luminance(cor) < 0.52 else "#B45309")
        n_lns = max(1, len(lines))
        for i, ln in enumerate(lines):
            ly = y0 + 168.0 + i * line_h - scroll_y
            ln_svg = _highlight_inline_terms_simple(ln, palavras_hi, hi_color_txt) if palavras_hi else _esc(ln)
            trig_l = (i / float(n_lns)) * 0.78
            op_ln = 1.0 if bp >= 0.99 else _clamp((bp - trig_l + 0.14) / 0.14, 0.14, 1.0)
            out.append(
                f'<text xml:space="preserve" x="{bx + 34:.0f}" y="{ly:.1f}" font-family="{FONT_SANS}" '
                f'font-size="{font_sz}" font-weight="700" fill="{fg}" opacity="{op_ln:.2f}">{ln_svg}</text>'
            )
        out.append("</g></g>")
        return "".join(out)

    # Esquerda: x=42..890 | Direita: x=1030..1878 (folga total da diagonal 884..1036)
    parts.append(draw_balloon(left_c, 42.0, left_prog))
    parts.append(draw_balloon(right_c, 1030.0, right_prog))
    return "".join(parts)


def _highlight_inline_terms_simple(line: str, terms: list[str], color: str) -> str:
    """Realce leve de termos-chave por <tspan> sem alterar o texto literal."""
    spans = _find_accent_insensitive_spans(line, terms)
    if not spans:
        return _esc(line)
    out: list[str] = []
    pos = 0
    for s, e in spans:
        if s > pos:
            out.append(_esc_tspan_seg(line[pos:s]))
        out.append(f'<tspan fill="{color}" font-weight="900">{_esc_tspan_seg(line[s:e])}</tspan>')
        pos = e
    if pos < len(line):
        out.append(_esc_tspan_seg(line[pos:]))
    return "".join(out)


# ---------------------------------------------------------------------------
# 6. Tela Pensamento v2 (Pergaminho SO VOCE VE + marca-texto progressivo + mini-mapa)
# ---------------------------------------------------------------------------


def _normalize_with_map(text: str) -> tuple[str, list[int]]:
    """Retorna (texto_minusculo_sem_acento, mapa_indice_original)."""
    norm_chars: list[str] = []
    idx_map: list[int] = []
    for i, ch in enumerate(text):
        decomp = unicodedata.normalize("NFD", ch)
        for d in decomp:
            if unicodedata.category(d) != "Mn":
                norm_chars.append(d.lower())
                idx_map.append(i)
    return ("".join(norm_chars), idx_map)


def _find_accent_insensitive_spans(text: str, terms: list[str]) -> list[tuple[int, int]]:
    """Localiza ocorrencias dos termos (case/accent-insensitive) e mescla intervalos."""
    if not text or not terms:
        return []
    norm_txt, idx_map = _normalize_with_map(text)
    if not norm_txt:
        return []
    raw_spans: list[tuple[int, int]] = []
    for term in terms:
        nt = _strip_accents(_clean_text(term)).lower()
        if not nt:
            continue
        start = 0
        while True:
            found = norm_txt.find(nt, start)
            if found < 0:
                break
            end_norm = found + len(nt) - 1
            if found < len(idx_map) and end_norm < len(idx_map):
                orig_s = idx_map[found]
                orig_e = idx_map[end_norm] + 1
                raw_spans.append((orig_s, orig_e))
            start = found + len(nt)
    if not raw_spans:
        return []
    raw_spans.sort()
    merged: list[tuple[int, int]] = [raw_spans[0]]
    for s, e in raw_spans[1:]:
        ps, pe = merged[-1]
        if s <= pe:
            merged[-1] = (ps, max(pe, e))
        else:
            merged.append((s, e))
    return merged


def _build_line_offsets(full_text: str, lines: list[str]) -> list[tuple[str, int, int]]:
    """Mapeia cada linha quebrada ao seu intervalo [start, end) no texto original."""
    mapped: list[tuple[str, int, int]] = []
    cursor = 0
    for ln in lines:
        idx = full_text.find(ln, cursor)
        if idx < 0:
            idx = cursor
        end = idx + len(ln)
        mapped.append((ln, idx, end))
        cursor = end
    return mapped


def _parchment_torn_path(x: float, y: float, w: float, h: float) -> str:
    """Contorno vetorial de pergaminho com bordas superior e inferior suavemente rasgadas."""
    pts: list[str] = [f"M{x + 18:.1f},{y:.1f}"]
    steps = 16
    dx = (w - 36.0) / steps
    for i in range(1, steps):
        px = x + 18.0 + i * dx
        py = y + (4.5 if i % 2 == 0 else -3.5) * (1.0 if i % 3 else 0.4)
        pts.append(f"L{px:.1f},{py:.1f}")
    pts.append(f"L{x + w - 18:.1f},{y:.1f}")
    pts.append(f"Q{x + w:.1f},{y:.1f} {x + w:.1f},{y + 18:.1f}")
    pts.append(f"L{x + w:.1f},{y + h - 18:.1f}")
    pts.append(f"Q{x + w:.1f},{y + h:.1f} {x + w - 18:.1f},{y + h:.1f}")
    for i in range(steps - 1, 0, -1):
        px = x + 18.0 + i * dx
        py = y + h + (-4.5 if i % 2 == 0 else 4.0) * (1.0 if (i + 1) % 3 else 0.5)
        pts.append(f"L{px:.1f},{py:.1f}")
    pts.append(f"L{x + 18:.1f},{y + h:.1f}")
    pts.append(f"Q{x:.1f},{y + h:.1f} {x:.1f},{y + h - 18:.1f}")
    pts.append(f"L{x:.1f},{y + 18:.1f}")
    pts.append(f"Q{x:.1f},{y:.1f} {x + 18:.1f},{y:.1f} Z")
    return " ".join(pts)


def render_pensamento_v2(
    topo: Any,
    mapa: dict[str, Any],
    turn: dict[str, Any],
    cita: dict[str, Any] | None,
    coreo: dict[str, Any] | None,
    local_f: int,
    fps: int,
    prog: float,
    render_portrait_fn: Callable[..., str] | None,
    render_echo_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Pergaminho SO VOCE VE com marca-texto progressivo + mini-mapa tatico no canto inferior direito."""
    meta = _resolve_ia_meta(ia_meta)
    coreo = coreo or {}
    fps_safe = max(1.0, float(fps or 30))
    t_sec = max(0.0, float(local_f)) / fps_safe
    p = _clamp(float(prog), 0.0, 1.0)

    parts = [_bg_war_room()]

    # Mapa real em deriva continua + frente de batalha piscando ao fundo
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    bg_focus = [a["pid"] for a in (coreo.get("alvos_taticos") or []) if isinstance(a, dict) and a.get("pid") in centers]
    for r in (coreo.get("rotas_soldados") or []):
        if isinstance(r, dict):
            for k_pid in ("de", "para"):
                if r.get(k_pid) in centers and r[k_pid] not in bg_focus:
                    bg_focus.append(r[k_pid])
    sa_cx = float(getattr(topo, "sa_cx", 720.0))
    sa_cy = float(getattr(topo, "sa_cy", 560.0))
    if bg_focus:
        fx = sum(centers[p][0] for p in bg_focus) / len(bg_focus)
        fy = sum(centers[p][1] for p in bg_focus) / len(bg_focus)
        cam_x = _lerp(sa_cx, fx, 0.52) + math.sin(t_sec * 0.55) * 18.0
        cam_y = _lerp(sa_cy, fy, 0.52) + math.cos(t_sec * 0.45) * 14.0
        bg_zoom = 1.20 + 0.05 * math.sin(t_sec * 0.35)
    else:
        cam_x = sa_cx + math.sin(t_sec * 0.55) * 18.0
        cam_y = sa_cy + math.cos(t_sec * 0.45) * 14.0
        bg_zoom = 1.00 + 0.04 * math.sin(t_sec * 0.35)
    btx = 960.0 - cam_x * bg_zoom
    bty = 540.0 - cam_y * bg_zoom

    parts.append(f'<g opacity="0.30" transform="translate({btx:.2f},{bty:.2f}) scale({bg_zoom:.4f})">')
    for pid, pstr in poly_strs.items():
        fill_c, _ = _province_fill(mapa, turn, pid, meta, default="#334155")
        parts.append(f'<polygon points="{pstr}" fill="{fill_c}" stroke="#0F172A" stroke-width="1.4"/>')
    if bg_focus:
        b_phase = (t_sec * 1.40) % 1.0
        b_rad = 18.0 + 44.0 * _ease_out(b_phase)
        b_op = max(0.0, 0.92 * (1.0 - b_phase))
        for pid in bg_focus[:3]:
            px_b, py_b = centers[pid]
            parts.append(
                f'<circle cx="{px_b:.1f}" cy="{py_b:.1f}" r="{b_rad:.1f}" fill="none" stroke="#FDE047" stroke-width="3.4" opacity="{b_op:.2f}"/>'
                f'<circle cx="{px_b:.1f}" cy="{py_b:.1f}" r="9" fill="#EF4444" stroke="#F8FAFC" stroke-width="2"/>'
            )
    parts.append("</g>")

    if not cita:
        return "".join(parts)

    ia = cita.get("ia", "")
    ia_k = _ia_key(ia)
    info = _ia_info(meta, ia)
    cor = info["cor"]
    cor_hi = "#475569" if _hex_luminance(cor) < 0.09 else cor
    cor_on_dark = _ia_color_on_dark(cor)

    # Pergaminho principal a esquerda (x=72..1232, y=72..872)
    px, py, pw, ph = 72.0, 72.0, 1160.0, 800.0
    parch_path = _parchment_torn_path(px, py, pw, ph)
    parch_shadow = _parchment_torn_path(px + 9.0, py + 11.0, pw, ph)

    parts.extend([
        f'<path d="{parch_shadow}" fill="#000000" opacity="0.54"/>',
        f'<path d="{parch_path}" fill="#F3E2A9" stroke="#78350F" stroke-width="4.5"/>',
        # Moldura interna sutil de manuscrito
        f'<rect x="{px + 20:.0f}" y="{py + 22:.0f}" width="{pw - 40:.0f}" height="{ph - 44:.0f}" rx="14" '
        f'fill="#F8ECC4" fill-opacity="0.48" stroke="#B45309" stroke-width="1.5" stroke-dasharray="10,8" opacity="0.7"/>',
        # Cabecalho do pergaminho
        _call_portrait(render_portrait_fn, ia, px + 98.0, py + 104.0, 52.0, highlight=True, ia_meta=meta),
        f'<text x="{px + 174:.0f}" y="{py + 96:.0f}" font-family="{FONT_SANS}" font-size="40" font-weight="900" fill="#1E293B">{_esc(info["nome"])}</text>',
        f'<rect x="{px + 174:.0f}" y="{py + 112:.0f}" width="444" height="38" rx="8" fill="#78350F"/>'
        f'<text x="{px + 396:.0f}" y="{py + 139:.0f}" text-anchor="middle" font-family="{FONT_MONO}" '
        f'font-size="22" font-weight="800" fill="#FEF3C7">SO VOCE VE · PENSAMENTO SECRETO</text>',
        _call_echo(render_echo_fn, px + pw - 96.0, py + 104.0, "#92400E", t_sec),
        f'<line x1="{px + 42:.0f}" y1="{py + 176:.0f}" x2="{px + pw - 42:.0f}" y2="{py + 176:.0f}" stroke="#92400E" stroke-width="2.2" opacity="0.4"/>',
    ])

    # Texto completo com marca-texto colorido progressivo nas palavras_destaque
    full_txt = _clean_text(cita.get("texto", ""))
    palavras_destaque = [_clean_text(w) for w in (coreo.get("palavras_destaque") or []) if _clean_text(w)]

    font_sz = 34
    line_h = 52
    wrap_w = 45
    lines = _wrap_words_full(full_txt, wrap_w)
    if len(lines) > 10:
        font_sz = 29
        line_h = 44
        wrap_w = 53
        lines = _wrap_words_full(full_txt, wrap_w)
    if len(lines) > 12:
        font_sz = 26
        line_h = 39
        wrap_w = 59
        lines = _wrap_words_full(full_txt, wrap_w)

    line_entries = _build_line_offsets(full_txt, lines)
    spans = _find_accent_insensitive_spans(full_txt, palavras_destaque)
    txt_len = max(1, len(full_txt))

    # Rolagem suave se o texto for excepcionalmente extenso (jamais trunca)
    avail_h = ph - 224.0
    total_h = len(lines) * line_h
    scroll_y = 0.0
    if total_h > avail_h:
        scroll_y = (total_h - avail_h) * _clamp((p - 0.12) / 0.78, 0.0, 1.0)

    text_x0 = px + 52.0
    text_y0 = py + 236.0
    parts.append(
        f'<defs><clipPath id="pens_txt_clip">'
        f'<rect x="{px + 34:.0f}" y="{py + 186:.0f}" width="{pw - 68:.0f}" height="{avail_h + 18:.0f}"/>'
        f'</clipPath></defs>'
        '<g clip-path="url(#pens_txt_clip)">'
    )

    # Camada 1: faixas de marca-texto coloridas atras das palavras destacadas
    for i, (ln, l_start, l_end) in enumerate(line_entries):
        ly = text_y0 + i * line_h - scroll_y
        for sp_s, sp_e in spans:
            ov_s = max(l_start, sp_s)
            ov_e = min(l_end, sp_e)
            if ov_s >= ov_e:
                continue
            # Momento em que a voz chega na palavra (proporcional a posicao no texto)
            trigger = _lerp(0.06, 0.80, sp_s / float(txt_len))
            lit = _ease_out(_clamp((p - trigger) / 0.14, 0.0, 1.0))
            if lit <= 0.01:
                continue
            rel_s = ov_s - l_start
            rel_e = ov_e - l_start
            x_pre = _estimate_text_px(ln[:rel_s], float(font_sz))
            w_seg = max(24.0, _estimate_text_px(ln[rel_s:rel_e], float(font_sz)))
            rect_x = text_x0 + x_pre - 5.0
            rect_w = (w_seg + 10.0) * lit
            rect_y = ly - font_sz * 0.84
            rect_h = font_sz * 1.12
            parts.append(
                f'<rect x="{rect_x:.1f}" y="{rect_y:.1f}" width="{rect_w:.1f}" height="{rect_h:.1f}" '
                f'rx="7" fill="{cor_hi}" fill-opacity="{0.36 * lit:.2f}"/>'
                f'<line x1="{rect_x + 2:.1f}" y1="{rect_y + rect_h - 1:.1f}" '
                f'x2="{rect_x + rect_w - 2:.1f}" y2="{rect_y + rect_h - 1:.1f}" '
                f'stroke="{cor_hi}" stroke-width="3.2" opacity="{0.85 * lit:.2f}"/>'
            )

    # Camada 2: linhas de texto com <tspan> reforcando palavras ja acesas (entra junto da voz)
    n_lns = max(1, len(line_entries))
    for i, (ln, l_start, l_end) in enumerate(line_entries):
        ly = text_y0 + i * line_h - scroll_y
        seg_out: list[str] = []
        cursor = l_start
        for sp_s, sp_e in spans:
            ov_s = max(l_start, sp_s)
            ov_e = min(l_end, sp_e)
            if ov_s >= ov_e:
                continue
            if ov_s > cursor:
                seg_out.append(_esc_tspan_seg(ln[cursor - l_start : ov_s - l_start]))
            trigger = _lerp(0.06, 0.80, sp_s / float(txt_len))
            is_lit = p >= trigger + 0.03
            chunk = _esc_tspan_seg(ln[ov_s - l_start : ov_e - l_start])
            if is_lit:
                seg_out.append(f'<tspan font-weight="900" fill="#0F172A">{chunk}</tspan>')
            else:
                seg_out.append(chunk)
            cursor = ov_e
        if cursor < l_end:
            seg_out.append(_esc_tspan_seg(ln[cursor - l_start :]))
        trig_l = (i / float(n_lns)) * 0.76
        op_ln = 1.0 if p >= 0.99 else _clamp((p - trig_l + 0.14) / 0.14, 0.16, 1.0)
        parts.append(
            f'<text xml:space="preserve" x="{text_x0:.1f}" y="{ly:.1f}" font-family="{FONT_SANS}" '
            f'font-size="{font_sz}" font-weight="700" fill="#1E293B" opacity="{op_ln:.2f}">{"".join(seg_out)}</text>'
        )

    parts.append("</g>")

    # Coluna direita superior: card tatico das palavras-chave acendendo (x=1268..1856, y=72..314)
    dx, dy, dw, dh = 1268.0, 72.0, 588.0, 240.0
    rotulo = _clean_text(coreo.get("rotulo_tatico") or "PLANO SECRETO EM CURSO")
    parts.append(
        f'<rect x="{dx + 6:.0f}" y="{dy + 8:.0f}" width="{dw:.0f}" height="{dh:.0f}" rx="16" fill="#000000" opacity="0.48"/>'
        f'<rect x="{dx:.0f}" y="{dy:.0f}" width="{dw:.0f}" height="{dh:.0f}" rx="16" fill="#0B1322" stroke="{cor_on_dark}" stroke-width="2.8"/>'
        f'<text x="{dx + 24:.0f}" y="{dy + 42:.0f}" font-family="{FONT_MONO}" font-size="21" font-weight="800" fill="#FBBF24">CHAVES DO PLANO</text>'
        f'<text x="{dx + 24:.0f}" y="{dy + 80:.0f}" font-family="{FONT_SANS}" font-size="27" font-weight="900" fill="#F8FAFC">{_esc(rotulo)}</text>'
    )

    # Chips de palavras_destaque que acendem progressivamente
    chip_x = dx + 24.0
    chip_y = dy + 104.0
    shown_terms = palavras_destaque[:4]
    if not shown_terms:
        manobra = _clean_text(coreo.get("manobra_tatica") or "ESTRATEGIA INTERNA").replace("_", " ")
        shown_terms = [manobra]
    for idx_t, term in enumerate(shown_terms):
        # Usa mesma linha do tempo progressiva
        t_spans = _find_accent_insensitive_spans(full_txt, [term])
        trig = _lerp(0.06, 0.80, (t_spans[0][0] / float(txt_len)) if t_spans else (idx_t * 0.22))
        on = p >= trig
        tw_c = min(dw - 48.0, max(124.0, len(term) * 14.5 + 34.0))
        if chip_x + tw_c > dx + dw - 20.0:
            chip_x = dx + 24.0
            chip_y += 54.0
        if chip_y + 42.0 > dy + dh - 8.0:
            break
        c_bg = cor if on else "#1E293B"
        c_fg = info["fg"] if on else "#94A3B8"
        c_brd = "#FDE047" if on else "#334155"
        parts.append(
            f'<rect x="{chip_x:.1f}" y="{chip_y:.1f}" width="{tw_c:.1f}" height="42" rx="10" '
            f'fill="{c_bg}" stroke="{c_brd}" stroke-width="{2.5 if on else 1.5}"/>'
            f'<text x="{chip_x + tw_c * 0.5:.1f}" y="{chip_y + 28:.1f}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="20" font-weight="800" fill="{c_fg}">{_esc(term.upper())}</text>'
        )
        chip_x += tw_c + 12.0

    # Canto inferior direito: MINI-MAPA TATICO ANIMADO (x=1268..1856, y=336..872)
    routes = list(coreo.get("rotas_soldados") or [])
    targets = list(coreo.get("alvos_taticos") or [])
    focus_pids: list[str] = []
    if not routes and not targets:
        nacoes = (mapa or {}).get("nacoes") or {}
        for nmeta in nacoes.values():
            if _ia_key(nmeta.get("ia_apelido") or nmeta.get("ia_id") or "") == ia_k:
                cap = nmeta.get("capital_id")
                if cap:
                    focus_pids.append(cap)
                    break

    raw_contrato = coreo.get("contrato_rasgado")
    torn_cfg: dict[str, Any] | None = None
    if raw_contrato and isinstance(raw_contrato, dict):
        torn_cfg = {
            "de_pais": raw_contrato.get("de_pais") or info["nome"],
            "para_pais": raw_contrato.get("para_pais") or "ALVO",
            "tipo": raw_contrato.get("tipo") or "PACTO",
            "prog": p,
        }

    parts.append(
        _render_tactical_minimap(
            topo=topo,
            mapa=mapa,
            turn=turn,
            box=(1268.0, 336.0, 588.0, 536.0),
            clip_id="mm_pensamento_clip",
            ia_meta=meta,
            t_sec=t_sec,
            t_prog=_clamp(0.10 + 0.85 * p, 0.0, 1.0),
            title="MAPA TATICO · PLANO SECRETO",
            focus_pids=focus_pids,
            routes=routes,
            targets=targets,
            fortress_pid=coreo.get("fortaleza_pid"),
            fortress_rise=p,
            torn_treaty=torn_cfg,
            accent_cor=cor_on_dark,
            footer_caption=rotulo if len(rotulo) <= 34 else "",
        )
    )

    return "".join(parts)
