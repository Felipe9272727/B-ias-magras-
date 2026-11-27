#!/usr/bin/env python3
"""Camada vetorial SVG de guerra, tatica e coreografia para AoH2 (1920x1080).

Funcoes puras de geracao de fragmentos SVG (Python 3.11+, apenas stdlib):
- ZERO emojis em qualquer texto ou icone.
- ZERO filtros `<filter>` pesados (sem feGaussianBlur) para rasterizacao rapida
  em `rsvg-convert`.
- Projetado para o canvas 1920x1080 e a topologia `MapTopology` de
  `aoh2/render_aoh2.py` e `aoh2/compositor_aoh2.py`.
"""

from __future__ import annotations

import math
import re
from typing import Any
from xml.sax.saxutils import escape as xml_escape

SVG_W = 1920
SVG_H = 1080

FONT_SANS = "DejaVu Sans, Liberation Sans, Noto Sans, Arial, sans-serif"
FONT_MONO = "DejaVu Sans Mono, DejaVu Sans, monospace"

# Paleta oficial das IAs (espelhando compositor_aoh2.py)
DEFAULT_IA_CORES: dict[str, str] = {
    "sonnet": "#3D7BF2",
    "hydrogen": "#19A974",
    "glm": "#8E4DE0",
    "ember": "#E0262B",
    "deepseek": "#1E2430",
    "qwen": "#F2802E",
    "inkling": "#22C7D6",
    "narrador": "#FBBF24",
}

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
_SAFE_ID_RE = re.compile(r"[^A-Za-z0-9_-]+")


# ---------------------------------------------------------------------------
# Utilitarios matematicos, de cor, texto e geometria Bezier
# ---------------------------------------------------------------------------


def _clean_text(text: Any) -> str:
    if text is None:
        return ""
    s = str(text)
    s = _EMOJI_RE.sub("", s)
    s = _CTRL_RE.sub(" ", s)
    return re.sub(r"\s+", " ", s).strip()


def _esc(text: Any) -> str:
    return xml_escape(_clean_text(text), {'"': "&quot;", "'": "&apos;"})


def _safe_xml_id(raw: Any, fallback: str = "clip_cap") -> str:
    s = _SAFE_ID_RE.sub("_", str(raw or "")).strip("_")
    if not s:
        return fallback
    if s[0].isdigit():
        return f"id_{s}"
    return s


def _clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else (hi if v > hi else v)


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _ease_out_cubic(t: float) -> float:
    t = _clamp(t, 0.0, 1.0)
    return 1.0 - (1.0 - t) ** 3


def _ease_in_out_sine(t: float) -> float:
    t = _clamp(t, 0.0, 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def _ease_out_back(t: float, s: float = 1.70158) -> float:
    t = _clamp(t, 0.0, 1.0)
    u = t - 1.0
    return 1.0 + (s + 1.0) * (u ** 3) + s * (u ** 2)


def _ease_out_elastic(t: float) -> float:
    t = _clamp(t, 0.0, 1.0)
    if t <= 0.0:
        return 0.0
    if t >= 1.0:
        return 1.0
    c4 = (2.0 * math.pi) / 3.0
    return (2.0 ** (-9.0 * t)) * math.sin((t * 8.5 - 0.75) * c4) + 1.0


def _parse_hex(color: Any, default: str = "#FBBF24") -> tuple[int, int, int]:
    if not isinstance(color, str):
        color = default
    c = color.strip().lstrip("#")
    if len(c) == 3 and all(ch in "0123456789abcdefABCDEF" for ch in c):
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6 or not all(ch in "0123456789abcdefABCDEF" for ch in c):
        c = default.lstrip("#")
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


def _rgb_to_hex(r: float, g: float, b: float) -> str:
    ri = int(_clamp(round(r), 0, 255))
    gi = int(_clamp(round(g), 0, 255))
    bi = int(_clamp(round(b), 0, 255))
    return f"#{ri:02x}{gi:02x}{bi:02x}"


def _blend_hex(c1: str, c2: str, alpha: float) -> str:
    r1, g1, b1 = _parse_hex(c1)
    r2, g2, b2 = _parse_hex(c2)
    a = _clamp(alpha, 0.0, 1.0)
    return _rgb_to_hex(_lerp(r1, r2, a), _lerp(g1, g2, a), _lerp(b1, b2, a))


def _is_dark_color(color: str) -> bool:
    r, g, b = _parse_hex(color)
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luma < 75.0


def _visible_accent(color: str) -> str:
    """Garante contraste nitido mesmo para cores muito escuras (ex: DeepSeek #1E2430)."""
    if _is_dark_color(color):
        return _blend_hex(color, "#94A3B8", 0.58)
    return color


def _resolve_ia_color(
    ia_name: Any,
    ia_cores: dict[str, Any] | None = None,
    default: str = "#FBBF24",
) -> str:
    key = _clean_text(ia_name).lower()
    if ia_cores:
        # Aceita chave exata ou minuscula, e valor str ou dict({"cor": ...})
        raw = ia_cores.get(key)
        if raw is None and isinstance(ia_name, str):
            raw = ia_cores.get(ia_name)
        if isinstance(raw, dict):
            c = raw.get("cor")
            if isinstance(c, str) and c.strip():
                return c.strip()
        elif isinstance(raw, str) and raw.strip():
            return raw.strip()
    if key in DEFAULT_IA_CORES:
        return DEFAULT_IA_CORES[key]
    return default


def _fmt_num_ptbr(n: Any) -> str:
    """Formata numero de tropas/baixas em PT-BR compacto (ex: 1.772, 554, 120k)."""
    try:
        val = int(round(abs(float(n))))
    except (TypeError, ValueError):
        return "0"
    if val >= 1_000_000:
        s = f"{val / 1_000_000:.1f}".rstrip("0").rstrip(".")
        return f"{s}M"
    if val >= 100_000:
        s = f"{val / 1000:.0f}"
        return f"{s}k"
    if val >= 1000:
        return f"{val:,}".replace(",", ".")
    return str(val)


def bezier_control_point(
    x0: float,
    y0: float,
    x2: float,
    y2: float,
    idx: int = 0,
    bend_factor: float = 0.17,
) -> tuple[float, float]:
    """Calcula ponto de controle quadratico suave entre dois centros de provincia."""
    dx = x2 - x0
    dy = y2 - y0
    dist = math.hypot(dx, dy)
    if dist < 1e-3:
        return ((x0 + x2) * 0.5, (y0 + y2) * 0.5)
    nx = -dy / dist
    ny = dx / dist
    sign = 1.0 if (idx % 2 == 0) else -1.0
    bend = _clamp(dist * bend_factor, 16.0, 68.0) * sign
    return ((x0 + x2) * 0.5 + nx * bend, (y0 + y2) * 0.5 + ny * bend)


def _quad_pt(
    x0: float, y0: float, x1: float, y1: float, x2: float, y2: float, u: float
) -> tuple[float, float]:
    u = _clamp(u, 0.0, 1.0)
    mu = 1.0 - u
    return (
        mu * mu * x0 + 2.0 * mu * u * x1 + u * u * x2,
        mu * mu * y0 + 2.0 * mu * u * y1 + u * u * y2,
    )


def _quad_tangent(
    x0: float, y0: float, x1: float, y1: float, x2: float, y2: float, u: float
) -> tuple[float, float]:
    u = _clamp(u, 0.0, 1.0)
    tx = 2.0 * (1.0 - u) * (x1 - x0) + 2.0 * u * (x2 - x1)
    ty = 2.0 * (1.0 - u) * (y1 - y0) + 2.0 * u * (y2 - y1)
    tlen = math.hypot(tx, ty)
    if tlen < 1e-5:
        dx, dy = x2 - x0, y2 - y0
        dlen = math.hypot(dx, dy)
        if dlen < 1e-5:
            return (1.0, 0.0)
        return (dx / dlen, dy / dlen)
    return (tx / tlen, ty / tlen)


def _quad_arc_length(
    x0: float, y0: float, x1: float, y1: float, x2: float, y2: float, steps: int = 10
) -> float:
    total = 0.0
    px, py = x0, y0
    for i in range(1, steps + 1):
        qx, qy = _quad_pt(x0, y0, x1, y1, x2, y2, i / steps)
        total += math.hypot(qx - px, qy - py)
        px, py = qx, qy
    return total


def _quad_subcurve(
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    u0: float,
    u1: float,
) -> tuple[float, float, float, float, float, float]:
    """Sub-curva Bezier quadratica exata (De Casteljau) para o intervalo [u0, u1]."""
    u0 = _clamp(u0, 0.0, 1.0)
    u1 = _clamp(u1, u0, 1.0)
    # 1) Recorta [0, u1]
    a1x, a1y = _lerp(x0, x1, u1), _lerp(y0, y1, u1)
    b1x, b1y = _lerp(x1, x2, u1), _lerp(y1, y2, u1)
    ex, ey = _lerp(a1x, b1x, u1), _lerp(a1y, b1y, u1)
    if u0 <= 1e-6 or u1 <= 1e-6:
        return (x0, y0, a1x, a1y, ex, ey)
    # 2) Recorta [s, 1] da curva (x0, a1, e) com s = u0 / u1
    s = _clamp(u0 / u1, 0.0, 1.0)
    sx, sy = _quad_pt(x0, y0, a1x, a1y, ex, ey, s)
    cx, cy = _lerp(a1x, ex, s), _lerp(a1y, ey, s)
    return (sx, sy, cx, cy, ex, ey)


# ---------------------------------------------------------------------------
# 1. Camera Follow + Punch Zoom + Shake Amortecido
# ---------------------------------------------------------------------------


def compute_camera_follow(
    topo: Any,
    rotas: list[dict[str, Any]] | None,
    t_norm: float,
    base_zoom: float = 1.12,
    punch_zoom: bool = False,
    shake_at: float | None = None,
) -> tuple[float, float, float, float, float]:
    """Calcula `(cam_cx, cam_cy, zoom, shake_dx, shake_dy)` acompanhando a coluna.

    - Acompanha suavemente a 1a coluna marchando de `de` ate `para`.
    - Se houver varias rotas, pondera o foco na 1a coluna (72%) com o centro
      ponderado das demais (28%) para enquadrar flanqueamentos e pincas.
    - Aplica zoom progressivo, `punch_zoom` cinematografico opcional e
      camera shake senoidal amortecido logo apos `shake_at` (0..1).
    """
    t = _clamp(float(t_norm), 0.0, 1.0)
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", None) or {}
    sa_cx = float(getattr(topo, "sa_cx", 720.0))
    sa_cy = float(getattr(topo, "sa_cy", 560.0))
    bounds = getattr(topo, "map_bounds", (90.0, 95.0, 1420.0, 1030.0))
    bx0, by0, bx1, by1 = (float(bounds[0]), float(bounds[1]), float(bounds[2]), float(bounds[3]))

    # Coleta rotas validas com coordenadas resolvidas
    resolved_routes: list[tuple[float, float, float, float, float]] = []
    for r in rotas or []:
        if not isinstance(r, dict):
            continue
        de = r.get("de")
        para = r.get("para")
        has_de = isinstance(de, str) and de in centers
        has_para = isinstance(para, str) and para in centers
        if not has_de and not has_para:
            continue
        if has_de and has_para:
            x0, y0 = centers[de]
            x2, y2 = centers[para]
        elif has_para:
            x0, y0 = centers[para]
            x2, y2 = x0, y0
        else:
            x0, y0 = centers[de]
            x2, y2 = x0, y0
        try:
            qtd = max(100.0, float(r.get("qtd") or 500.0))
        except (TypeError, ValueError):
            qtd = 500.0
        resolved_routes.append((x0, y0, x2, y2, qtd))

    # Progresso suave acompanhando a marcha (comeca perto de `de` e pousa em `para`)
    march_u = _lerp(0.14, 0.94, _ease_in_out_sine(_clamp(t / 0.88, 0.0, 1.0)))

    if resolved_routes:
        x0, y0, x2, y2, _q0 = resolved_routes[0]
        cx1, cy1 = bezier_control_point(x0, y0, x2, y2, idx=0, bend_factor=0.14)
        p1x, p1y = _quad_pt(x0, y0, cx1, cy1, x2, y2, march_u)

        if len(resolved_routes) == 1:
            target_x, target_y = p1x, p1y
        else:
            w_sum = 0.0
            sx = 0.0
            sy = 0.0
            for idx, (rx0, ry0, rx2, ry2, rq) in enumerate(resolved_routes[1:], start=1):
                rcx, rcy = bezier_control_point(rx0, ry0, rx2, ry2, idx=idx, bend_factor=0.14)
                rpx, rpy = _quad_pt(rx0, ry0, rcx, rcy, rx2, ry2, march_u)
                w = math.sqrt(rq)
                sx += rpx * w
                sy += rpy * w
                w_sum += w
            other_x = sx / max(1e-6, w_sum)
            other_y = sy / max(1e-6, w_sum)
            # 1a coluna comanda o enquadramento com centro ponderado das demais
            target_x = _lerp(p1x, other_x, 0.28)
            target_y = _lerp(p1y, other_y, 0.28)

        # Leve ancoragem ao continente (10%) para manter contexto geografico
        cam_cx = _lerp(target_x, sa_cx, 0.10)
        cam_cy = _lerp(target_y, sa_cy, 0.10)
    else:
        cam_cx = sa_cx
        cam_cy = sa_cy

    # Deriva organica sutil (impede sensacao de quadro congelado)
    cam_cx += math.sin(t * math.pi * 1.6 + 0.3) * 6.5
    cam_cy += math.cos(t * math.pi * 1.2 + 0.8) * 5.0

    # Zoom progressivo + soco opcional
    zoom = float(base_zoom) + 0.10 * _ease_in_out_sine(t)
    if punch_zoom:
        punch_center = float(shake_at) if shake_at is not None else 0.60
        punch_start = max(0.0, punch_center - 0.14)
        punch_rise = _ease_out_cubic(_clamp((t - punch_start) / 0.16, 0.0, 1.0))
        # Pequeno overshoot elástico no impacto + sustentacao
        overshoot = 0.0
        if t >= punch_center:
            dt_p = t - punch_center
            overshoot = 0.045 * math.exp(-dt_p * 12.0) * math.cos(dt_p * 26.0)
        zoom += 0.18 * punch_rise + overshoot

    zoom = _clamp(zoom, 1.00, 1.65)

    # Protecao de bordas continentais proporcional ao zoom (evita cortar Norte sob HUD y=72 e Sul sob balao)
    pad_x = 185.0 / zoom
    pad_y_top = 215.0 / zoom
    pad_y_bot = 185.0 / zoom
    min_cx = min(sa_cx, bx0 + pad_x)
    max_cx = max(sa_cx, bx1 - pad_x)
    min_cy = min(sa_cy, by0 + pad_y_top)
    max_cy = max(sa_cy, by1 - pad_y_bot)
    zoom_freedom = _clamp((zoom - 1.0) / 0.28, 0.0, 1.0)
    cam_cx = _lerp(sa_cx, _clamp(cam_cx, min_cx, max_cx), 0.35 + 0.65 * zoom_freedom)
    cam_cy = _lerp(sa_cy, _clamp(cam_cy, min_cy, max_cy), 0.35 + 0.65 * zoom_freedom)

    # Camera shake senoidal amortecido logo apos shake_at
    shake_dx = 0.0
    shake_dy = 0.0
    if shake_at is not None:
        sa = float(shake_at)
        if t >= sa:
            dt = t - sa
            if dt <= 0.36:
                decay = math.exp(-dt * 13.5)
                amp = (17.0 if punch_zoom else 13.5) * decay
                shake_dx = amp * math.sin(dt * 98.0 + 1.25)
                shake_dy = amp * 0.76 * math.cos(dt * 82.0 + 0.45)

    return (cam_cx, cam_cy, zoom, shake_dx, shake_dy)


# ---------------------------------------------------------------------------
# 2. Coluna Marchando (Soldados Terrestres ou Navios de Guerra)
# ---------------------------------------------------------------------------


def _render_soldier_unit(
    x: float,
    y: float,
    facing: float,
    cor: str,
    t_sec: float,
    phase_offset: float,
    scale: float = 1.0,
) -> str:
    """Silhueta vetorial de soldado marchando com elmo, lanca, escudo e passo oscilante."""
    phase = t_sec * 11.0 + phase_offset
    step = math.sin(phase)
    bob_y = -abs(step) * 3.4
    tilt = step * 5.0
    leg_a = step * 4.4
    leg_b = -leg_a
    flag_wave = math.sin(t_sec * 14.0 + phase_offset * 1.4) * 2.2

    body_col = cor
    rim_col = _blend_hex(cor, "#FFFFFF", 0.55)
    dark_col = _blend_hex(cor, "#050914", 0.58)
    shield_accent = "#FBBF24" if not _is_dark_color(cor) else "#E2E8F0"

    return (
        f'<g transform="translate({x:.1f},{y:.1f}) scale({scale:.2f})">'
        # Sombra no solo
        f'<ellipse cx="0" cy="11.5" rx="9.5" ry="3.2" fill="#020617" opacity="0.48"/>'
        f'<g transform="translate(0,{bob_y:.1f}) scale({facing:.0f},1) rotate({tilt:.1f})">'
        # Lanca inclinada para frente + flâmula da nacao
        f'<line x1="-6.5" y1="4.0" x2="14.5" y2="-14.5" stroke="#475569" stroke-width="2.4" stroke-linecap="round"/>'
        f'<line x1="-6.0" y1="3.5" x2="14.0" y2="-14.0" stroke="#CBD5E1" stroke-width="1.1" stroke-linecap="round"/>'
        f'<polygon points="16.8,-16.6 11.4,-13.8 13.6,-11.4" fill="#F8FAFC" stroke="#0F172A" stroke-width="0.8"/>'
        f'<path d="M10.5,-10.8 Q{13.0:.1f},{-9.2 + flag_wave * 0.5:.1f} {15.5:.1f},{-10.2 + flag_wave:.1f} '
        f'L{13.8:.1f},{-7.6 + flag_wave * 0.6:.1f} L8.6,-9.0 Z" fill="{body_col}" stroke="{rim_col}" stroke-width="0.6"/>'
        # Pernas em marcha alternada
        f'<line x1="-1.5" y1="3.5" x2="{-1.5 + leg_b:.1f}" y2="10.8" stroke="#090F1A" stroke-width="3.6" stroke-linecap="round"/>'
        f'<line x1="-1.5" y1="3.5" x2="{-1.5 + leg_b:.1f}" y2="10.4" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>'
        f'<line x1="1.8" y1="3.5" x2="{1.8 + leg_a:.1f}" y2="10.8" stroke="#090F1A" stroke-width="3.6" stroke-linecap="round"/>'
        f'<line x1="1.8" y1="3.5" x2="{1.8 + leg_a:.1f}" y2="10.4" stroke="#475569" stroke-width="1.8" stroke-linecap="round"/>'
        # Capa traseira leve
        f'<path d="M-3.0,-4.5 L-8.5,4.2 L-2.0,3.2 Z" fill="{dark_col}" stroke="#090F1A" stroke-width="1.0" stroke-linejoin="round"/>'
        # Tronco com couraca na cor da IA
        f'<path d="M-4.6,-5.2 L4.6,-5.2 L5.4,4.4 L-4.8,4.4 Z" fill="{body_col}" stroke="#090F1A" stroke-width="1.5" stroke-linejoin="round"/>'
        f'<line x1="-3.4" y1="-2.2" x2="3.6" y2="-2.2" stroke="{rim_col}" stroke-width="1.2" opacity="0.75"/>'
        # Elmo metalico com crista da nacao
        f'<path d="M-5.2,-9.2 C-5.2,-14.6 5.2,-14.6 5.2,-9.2 L5.6,-6.2 L-4.8,-6.2 Z" '
        f'fill="#1E293B" stroke="#090F1A" stroke-width="1.4" stroke-linejoin="round"/>'
        f'<path d="M-3.5,-13.4 Q0.5,-17.5 4.2,-12.5" fill="none" stroke="{rim_col}" stroke-width="2.4" stroke-linecap="round"/>'
        f'<line x1="0.8" y1="-8.8" x2="4.8" y2="-8.8" stroke="#E2E8F0" stroke-width="1.4" stroke-linecap="round"/>'
        # Escudo frontal com filete dourado
        f'<path d="M2.2,-4.6 L9.8,-3.6 L9.4,2.8 C9.0,6.2 6.0,8.2 4.6,8.8 C3.2,8.0 2.0,5.6 2.0,2.5 Z" '
        f'fill="{body_col}" stroke="{shield_accent}" stroke-width="1.6" stroke-linejoin="round"/>'
        f'<circle cx="5.9" cy="1.2" r="1.5" fill="{shield_accent}"/>'
        f"</g>"
        f"</g>"
    )


def _render_warship_unit(
    x: float,
    y: float,
    facing: float,
    cor: str,
    t_sec: float,
    phase_offset: float,
    scale: float = 1.0,
) -> str:
    """Silhueta vetorial de navio de guerra/desembarque com onda de proa animada."""
    heave = math.sin(t_sec * 5.8 + phase_offset) * 2.2
    pitch = math.cos(t_sec * 5.2 + phase_offset) * 3.8
    spray = 0.55 + 0.45 * math.sin(t_sec * 9.5 + phase_offset)
    pennant = math.sin(t_sec * 12.0 + phase_offset) * 2.4

    accent = _visible_accent(cor)
    rim = _blend_hex(accent, "#FFFFFF", 0.50)

    return (
        f'<g transform="translate({x:.1f},{y + heave:.1f}) scale({scale:.2f})">'
        f'<g transform="scale({facing:.0f},1) rotate({pitch:.1f})">'
        # Sombra e linha dagua
        f'<ellipse cx="0" cy="7.5" rx="18.0" ry="4.2" fill="#04182B" opacity="0.65"/>'
        # Casco blindado
        f'<path d="M-16.5,1.0 L-14.0,6.8 L12.5,6.8 L18.5,-1.2 L12.5,-0.2 L-16.5,-0.2 Z" '
        f'fill="#1E293B" stroke="#020617" stroke-width="1.6" stroke-linejoin="round"/>'
        # Faixa da nacao no casco
        f'<path d="M-14.5,1.8 L14.8,1.8 L13.4,4.0 L-13.8,4.0 Z" fill="{accent}"/>'
        # Superestrutura / ponte de comando
        f'<path d="M-8.0,-0.2 L-6.5,-6.2 L4.0,-6.2 L6.5,-0.2 Z" '
        f'fill="#334155" stroke="#0F172A" stroke-width="1.3" stroke-linejoin="round"/>'
        f'<rect x="-4.0" y="-4.4" width="3.2" height="1.8" rx="0.6" fill="#BAE6FD"/>'
        f'<rect x="0.8" y="-4.4" width="3.2" height="1.8" rx="0.6" fill="#BAE6FD"/>'
        # Mastro e bandeira ondulante
        f'<line x1="-1.5" y1="-6.2" x2="-1.5" y2="-15.5" stroke="#CBD5E1" stroke-width="1.7" stroke-linecap="round"/>'
        f'<path d="M-1.5,-15.0 L{-1.5 - 9.5:.1f},{-13.4 + pennant:.1f} L-1.5,-10.6 Z" '
        f'fill="{accent}" stroke="{rim}" stroke-width="0.7"/>'
        # Canhao de proa
        f'<line x1="8.0" y1="-1.6" x2="14.2" y2="-4.0" stroke="#94A3B8" stroke-width="2.1" stroke-linecap="round"/>'
        # Onda branca na proa (animada)
        f'<path d="M12.0,6.5 Q17.5,4.2 {21.5 + spray * 3.0:.1f},{6.6:.1f}" '
        f'fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" opacity="{0.65 + 0.30 * spray:.2f}"/>'
        f'<path d="M14.5,2.4 Q19.5,0.2 {22.5 + spray * 2.5:.1f},{3.2:.1f}" '
        f'fill="none" stroke="#7DD3FC" stroke-width="1.6" stroke-linecap="round" opacity="{0.45 + 0.35 * spray:.2f}"/>'
        f'<path d="M-17.0,6.8 Q-6.0,9.5 11.0,7.2" fill="none" stroke="#BAE6FD" stroke-width="1.5" '
        f'stroke-linecap="round" opacity="0.68"/>'
        f"</g>"
        f"</g>"
    )


def render_marching_column(
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    p: float,
    cor: str,
    qtd: int | float,
    naval: bool = False,
    t_sec: float = 0.0,
    label: str = "",
) -> str:
    """Desenha rota tatica brilhante + 3 soldados marchando (ou 2 navios) + rastro + pilula de tropas."""
    p = _clamp(float(p), 0.0, 1.0)
    if p <= 0.01:
        return ""

    accent = _visible_accent(cor or "#EF4444")
    bright = _blend_hex(accent, "#FFFFFF", 0.55)
    route_col = "#22D3EE" if naval else accent
    route_core = "#ECFEFF" if naval else _blend_hex(accent, "#FEF08A", 0.65)
    route_outer = "#082F49" if naval else "#090F1A"

    arc_len = max(30.0, _quad_arc_length(x0, y0, x1, y1, x2, y2))
    parts: list[str] = ["<g>"]

    # 1. Previa discreta do restante da rota (p -> 1.0)
    if p < 0.96:
        fx0, fy0, fx1, fy1, fx2, fy2 = _quad_subcurve(x0, y0, x1, y1, x2, y2, p, 1.0)
        rem_d = f"M{fx0:.1f},{fy0:.1f} Q{fx1:.1f},{fy1:.1f} {fx2:.1f},{fy2:.1f}"
        parts.append(
            f'<path d="{rem_d}" fill="none" stroke="{route_col}" stroke-width="2.6" '
            f'stroke-dasharray="7,7" stroke-dashoffset="{-t_sec * 28.0:.1f}" '
            f'stroke-linecap="round" opacity="0.34"/>'
        )

    # 2. Rota tatica ativa brilhante (0 -> p)
    ax0, ay0, ax1, ay1, head_x, head_y = _quad_subcurve(x0, y0, x1, y1, x2, y2, 0.0, p)
    act_d = f"M{ax0:.1f},{ay0:.1f} Q{ax1:.1f},{ay1:.1f} {head_x:.1f},{head_y:.1f}"
    parts.append(
        # Halo luminoso sem filtro blur
        f'<path d="{act_d}" fill="none" stroke="{route_col}" stroke-width="13.0" '
        f'stroke-linecap="round" opacity="0.22"/>'
        # Contorno escuro para contraste sobre qualquer provincia
        f'<path d="{act_d}" fill="none" stroke="{route_outer}" stroke-width="8.4" '
        f'stroke-linecap="round" opacity="0.78"/>'
        # Corpo principal da rota
        f'<path d="{act_d}" fill="none" stroke="{route_col}" stroke-width="4.8" '
        f'stroke-linecap="round" opacity="0.96"/>'
        # Fluxo energetico animado correndo no centro da rota
        f'<path d="{act_d}" fill="none" stroke="{route_core}" stroke-width="2.1" '
        f'stroke-dasharray="10,8" stroke-dashoffset="{-t_sec * 56.0:.1f}" '
        f'stroke-linecap="round" opacity="0.92"/>'
        # No de partida
        f'<circle cx="{x0:.1f}" cy="{y0:.1f}" r="5.5" fill="{route_outer}" stroke="{route_col}" stroke-width="2.2"/>'
        f'<circle cx="{x0:.1f}" cy="{y0:.1f}" r="2.2" fill="{route_core}"/>'
    )

    # Ponta de seta tatica a frente da coluna
    ux, uy = _quad_tangent(x0, y0, x1, y1, x2, y2, p)
    px_n, py_n = -uy, ux
    tip_x = head_x + ux * 16.0
    tip_y = head_y + uy * 16.0
    base_x = head_x + ux * 2.0
    base_y = head_y + uy * 2.0
    parts.append(
        f'<polygon points="{tip_x:.1f},{tip_y:.1f} '
        f'{base_x + px_n * 8.5:.1f},{base_y + py_n * 8.5:.1f} '
        f'{base_x + ux * 3.5:.1f},{base_y + uy * 3.5:.1f} '
        f'{base_x - px_n * 8.5:.1f},{base_y - py_n * 8.5:.1f}" '
        f'fill="{route_core}" stroke="{route_outer}" stroke-width="1.6" stroke-linejoin="round"/>'
    )

    # 3. Rastro de poeira (terra) ou espuma (naval) atras da coluna
    unit_count = 2 if naval else 3
    spacing_px = 34.0 if naval else 22.0
    du = _clamp(spacing_px / arc_len, 0.045, 0.20)
    tail_u = max(0.0, p - unit_count * du)

    for di in range(5):
        u_d = tail_u - di * (du * 0.42)
        if u_d < 0.01:
            continue
        dx_p, dy_p = _quad_pt(x0, y0, x1, y1, x2, y2, u_d)
        tux, tuy = _quad_tangent(x0, y0, x1, y1, x2, y2, u_d)
        tnx, tny = -tuy, tux
        wobble = math.sin(t_sec * 7.0 + di * 1.7) * 3.2
        fade = _clamp(1.0 - di * 0.19, 0.14, 0.85)
        if naval:
            # Espuma em V atras dos navios
            spread = 4.5 + di * 2.8
            parts.append(
                f'<circle cx="{dx_p + tnx * spread:.1f}" cy="{dy_p + tny * spread:.1f}" '
                f'r="{2.2 + di * 0.6:.1f}" fill="#E0F2FE" opacity="{fade * 0.72:.2f}"/>'
                f'<circle cx="{dx_p - tnx * spread:.1f}" cy="{dy_p - tny * spread:.1f}" '
                f'r="{2.2 + di * 0.6:.1f}" fill="#BAE6FD" opacity="{fade * 0.72:.2f}"/>'
            )
        else:
            # Nuvens estilizadas de poeira levantadas pelas botas
            r_dust = 4.2 + di * 1.45
            parts.append(
                f'<circle cx="{dx_p + tnx * wobble:.1f}" cy="{dy_p + 7.5 + tny * wobble:.1f}" '
                f'r="{r_dust:.1f}" fill="#E2D3B3" opacity="{fade * 0.48:.2f}"/>'
                f'<circle cx="{dx_p - tnx * (wobble * 0.7):.1f}" cy="{dy_p + 5.5:.1f}" '
                f'r="{r_dust * 0.68:.1f}" fill="#F5ECD8" opacity="{fade * 0.36:.2f}"/>'
            )

    # 4. Unidades marchando (desenha de tras para frente para sobreposicao natural)
    for ui in range(unit_count - 1, -1, -1):
        u_pos = p - ui * du
        if u_pos < 0.01:
            continue
        sx, sy = _quad_pt(x0, y0, x1, y1, x2, y2, u_pos)
        sux, suy = _quad_tangent(x0, y0, x1, y1, x2, y2, u_pos)
        facing = 1.0 if sux >= -0.05 else -1.0
        # Leve desalinhamento em formacao cerrada
        lat = ((ui % 2) * 2 - 1) * (3.0 if not naval else 4.0) if ui > 0 else 0.0
        px_u = sx + (-suy) * lat
        py_u = sy + sux * lat
        unit_scale = 1.06 if ui == 0 else (0.96 if ui == 1 else 0.88)
        if naval:
            parts.append(
                _render_warship_unit(px_u, py_u, facing, cor, t_sec, ui * 2.1, scale=unit_scale)
            )
        else:
            parts.append(
                _render_soldier_unit(px_u, py_u, facing, cor, t_sec, ui * 2.05, scale=unit_scale)
            )

    # 5. Pilula de tropas viajando junto da coluna
    try:
        qtd_val = int(round(float(qtd or 0)))
    except (TypeError, ValueError):
        qtd_val = 0
    clean_lbl = _clean_text(label).upper()

    if qtd_val > 0 or clean_lbl:
        pill_x = head_x
        pill_y = head_y - 34.0
        q_str = _fmt_num_ptbr(qtd_val) if qtd_val > 0 else ""
        main_txt = f"{clean_lbl} · {q_str}" if (clean_lbl and q_str) else (q_str or clean_lbl)
        pill_h = 24.0
        pill_w = max(56.0, len(main_txt) * 8.4 + 26.0)
        bx = pill_x - pill_w * 0.5
        by = pill_y - pill_h * 0.5

        parts.append(
            f'<g>'
            # Haste discreta ligando pilula a cabeca da coluna
            f'<line x1="{pill_x:.1f}" y1="{by + pill_h:.1f}" x2="{head_x:.1f}" y2="{head_y - 14.0:.1f}" '
            f'stroke="{accent}" stroke-width="1.6" stroke-dasharray="3,2" opacity="0.80"/>'
            # Sombra e corpo da pilula
            f'<rect x="{bx + 2.0:.1f}" y="{by + 2.5:.1f}" width="{pill_w:.1f}" height="{pill_h:.1f}" '
            f'rx="12" fill="#020617" opacity="0.60"/>'
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="{pill_w:.1f}" height="{pill_h:.1f}" '
            f'rx="12" fill="#070D17" fill-opacity="0.94" stroke="{accent}" stroke-width="2.0"/>'
            # Filete colorido + bolinha indicadora
            f'<circle cx="{bx + 11.5:.1f}" cy="{pill_y:.1f}" r="4.2" fill="{accent}" stroke="{bright}" stroke-width="1.0"/>'
            f'<text x="{bx + 18.0 + (pill_w - 22.0) * 0.5:.1f}" y="{pill_y + 4.6:.1f}" '
            f'text-anchor="middle" font-family="{FONT_MONO}" font-size="13.5" font-weight="800" '
            f'fill="#F8FAFC">{_esc(main_txt)}</text>'
            f"</g>"
        )

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 3. Explosao Cinematografica de Batalha + Baixas `-N` Elasticas
# ---------------------------------------------------------------------------


def render_battle_explosion_fx(
    cx: float,
    cy: float,
    k: float,
    cor_atk: str,
    perdas: int = 0,
    conquistada: bool = False,
) -> str:
    """Explosao cinematografica em camadas (k: 0..1) + pilula `-N` com curva elastica."""
    k = float(k)
    if k <= 0.0 or k >= 1.05:
        return ""
    k = _clamp(k, 0.0, 1.0)
    e_out = _ease_out_cubic(k)
    atk_col = _visible_accent(cor_atk or "#EF4444")
    parts: list[str] = ["<g>"]

    # 1. Aneis de choque concentricos
    ring1_r = 10.0 + e_out * 72.0
    ring1_op = _clamp(1.0 - k * 0.95, 0.0, 1.0)
    ring1_w = max(1.2, 6.8 * (1.0 - k * 0.80))
    parts.append(
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{ring1_r:.1f}" fill="none" '
        f'stroke="#EF4444" stroke-width="{ring1_w:.1f}" opacity="{ring1_op * 0.90:.2f}"/>'
    )

    k2 = _clamp((k - 0.06) / 0.94, 0.0, 1.0)
    if k2 > 0.0:
        ring2_r = 6.0 + _ease_out_cubic(k2) * 54.0
        ring2_op = _clamp(1.0 - k2 * 0.92, 0.0, 1.0)
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{ring2_r:.1f}" fill="#F97316" '
            f'fill-opacity="{ring2_op * 0.18:.2f}" stroke="#FDE047" '
            f'stroke-width="{max(1.0, 4.2 * (1.0 - k2 * 0.75)):.1f}" opacity="{ring2_op:.2f}"/>'
        )

    if conquistada:
        conq_r = 16.0 + e_out * 86.0
        conq_op = _clamp(1.0 - k * 0.78, 0.0, 1.0)
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{conq_r:.1f}" fill="none" '
            f'stroke="{atk_col}" stroke-width="{max(1.8, 5.2 * (1.0 - k * 0.55)):.1f}" '
            f'stroke-dasharray="14,7" opacity="{conq_op:.2f}"/>'
        )

    # 2. Nuvens de fumaca estilizadas (7 lobs organicos sem blur)
    smoke_op = _clamp((1.0 - _clamp((k - 0.35) / 0.65, 0.0, 1.0)) * 0.78, 0.0, 0.78)
    if smoke_op > 0.02:
        smoke_specs = [
            (0.2, 1.00, 15.0),
            (1.1, 0.86, 12.5),
            (2.05, 1.08, 16.0),
            (2.95, 0.92, 13.5),
            (3.85, 1.04, 15.5),
            (4.75, 0.88, 12.0),
            (5.55, 0.96, 14.0),
        ]
        for ang, dist_mul, base_r in smoke_specs:
            d = (7.0 + e_out * 36.0) * dist_mul
            sx = cx + math.cos(ang) * d
            sy = cy + math.sin(ang) * d - k * 8.0
            sr = base_r * (0.45 + 0.85 * e_out)
            outer_smoke = _blend_hex("#334155", "#0F172A", k * 0.6)
            inner_smoke = _blend_hex("#F97316", "#64748B", _clamp(k * 1.6, 0.0, 1.0))
            parts.append(
                f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{sr:.1f}" fill="{outer_smoke}" opacity="{smoke_op * 0.78:.2f}"/>'
                f'<circle cx="{sx - sr * 0.16:.1f}" cy="{sy - sr * 0.16:.1f}" r="{sr * 0.64:.1f}" '
                f'fill="{inner_smoke}" opacity="{smoke_op * 0.58:.2f}"/>'
            )

    # 3. Flash estrelado inicial no nucleo (k < 0.42)
    if k < 0.42:
        fk = k / 0.42
        f_scale = _ease_out_cubic(min(1.0, fk * 2.5)) * (1.0 - fk * 0.55)
        f_op = _clamp(1.0 - fk * 1.05, 0.0, 1.0)
        star_pts: list[str] = []
        for si in range(16):
            ang = si * (math.pi / 8.0)
            rad = (34.0 if si % 2 == 0 else 14.5) * f_scale
            star_pts.append(f"{cx + math.cos(ang) * rad:.1f},{cy + math.sin(ang) * rad:.1f}")
        parts.append(
            f'<polygon points="{" ".join(star_pts)}" fill="#FEF08A" stroke="#F97316" '
            f'stroke-width="1.6" opacity="{f_op:.2f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{max(1.0, 13.0 * f_scale):.1f}" '
            f'fill="#FFFFFF" opacity="{f_op:.2f}"/>'
        )

    # 4. Raios dourados disparando radialmente
    ray_op = _clamp(1.0 - _clamp((k - 0.15) / 0.75, 0.0, 1.0), 0.0, 1.0)
    if ray_op > 0.03:
        for ri in range(12):
            ang = ri * (math.tau / 12.0) + 0.18
            is_long = ri % 2 == 0
            r_in = 10.0 + e_out * (26.0 if is_long else 18.0)
            r_out = (26.0 if is_long else 19.0) + e_out * (46.0 if is_long else 32.0)
            rc = "#FEF08A" if is_long else "#FBBF24"
            rw = (3.4 if is_long else 2.2) * (1.0 - k * 0.55)
            parts.append(
                f'<line x1="{cx + math.cos(ang) * r_in:.1f}" y1="{cy + math.sin(ang) * r_in:.1f}" '
                f'x2="{cx + math.cos(ang) * r_out:.1f}" y2="{cy + math.sin(ang) * r_out:.1f}" '
                f'stroke="{rc}" stroke-width="{max(0.8, rw):.1f}" stroke-linecap="round" opacity="{ray_op:.2f}"/>'
            )

    # 5. Faiscas voando com curva balistica
    spark_op = _clamp(1.0 - _clamp((k - 0.25) / 0.75, 0.0, 1.0), 0.0, 1.0)
    if spark_op > 0.03:
        for pi in range(14):
            ang = pi * 2.399963 + 0.4  # angulo aureo para distribuicao organica
            spd = 42.0 + (pi % 4) * 16.0
            vx = math.cos(ang) * spd
            vy = math.sin(ang) * spd - 16.0
            px = cx + vx * e_out
            py = cy + vy * e_out + 24.0 * (k * k)
            tail_x = px - vx * 0.09
            tail_y = py - (vy + 48.0 * k) * 0.09
            scol = "#FEF9C3" if pi % 3 == 0 else ("#FBBF24" if pi % 3 == 1 else atk_col)
            parts.append(
                f'<line x1="{tail_x:.1f}" y1="{tail_y:.1f}" x2="{px:.1f}" y2="{py:.1f}" '
                f'stroke="{scol}" stroke-width="2.2" stroke-linecap="round" opacity="{spark_op:.2f}"/>'
                f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{1.8 + (pi % 2) * 0.8:.1f}" '
                f'fill="#FFFFFF" opacity="{spark_op:.2f}"/>'
            )

    # 6. Espadas cruzadas batendo no impacto
    sword_op = _clamp(1.0 - _clamp((k - 0.76) / 0.24, 0.0, 1.0), 0.0, 1.0)
    if sword_op > 0.02:
        if k < 0.18:
            sk = _ease_out_cubic(k / 0.18)
            swing = _lerp(32.0, 0.0, sk)
            sw_scale = _lerp(0.65, 1.18, sk)
        else:
            dt_s = k - 0.18
            swing = math.sin(dt_s * 34.0) * math.exp(-dt_s * 12.0) * 10.0
            sw_scale = 1.05 + 0.12 * math.exp(-dt_s * 10.0)
        parts.append(
            f'<g transform="translate({cx:.1f},{cy - 2.0:.1f}) scale({sw_scale:.2f})" opacity="{sword_op:.2f}">'
            # Espada esquerda
            f'<g transform="rotate({-swing:.1f})">'
            f'<line x1="-15.5" y1="15.5" x2="15.5" y2="-15.5" stroke="#090F1A" stroke-width="6.2" stroke-linecap="round"/>'
            f'<line x1="-15.0" y1="15.0" x2="15.0" y2="-15.0" stroke="#F8FAFC" stroke-width="3.6" stroke-linecap="round"/>'
            f'<line x1="-12.0" y1="5.0" x2="-5.0" y2="12.0" stroke="#FBBF24" stroke-width="3.6" stroke-linecap="round"/>'
            f'<circle cx="-16.2" cy="16.2" r="2.6" fill="{atk_col}" stroke="#FBBF24" stroke-width="1.0"/>'
            f"</g>"
            # Espada direita
            f'<g transform="rotate({swing:.1f})">'
            f'<line x1="15.5" y1="15.5" x2="-15.5" y2="-15.5" stroke="#090F1A" stroke-width="6.2" stroke-linecap="round"/>'
            f'<line x1="15.0" y1="15.0" x2="-15.0" y2="-15.0" stroke="#E2E8F0" stroke-width="3.6" stroke-linecap="round"/>'
            f'<line x1="12.0" y1="5.0" x2="5.0" y2="12.0" stroke="#FBBF24" stroke-width="3.6" stroke-linecap="round"/>'
            f'<circle cx="16.2" cy="16.2" r="2.6" fill="#EF4444" stroke="#FBBF24" stroke-width="1.0"/>'
            f"</g>"
            f"</g>"
        )
        # Brilho de faisca no ponto de choque das laminas
        if 0.14 <= k <= 0.42:
            gk = 1.0 - abs(k - 0.22) / 0.20
            gk = _clamp(gk, 0.0, 1.0)
            gr = 14.0 * gk
            parts.append(
                f'<polygon points="{cx:.1f},{cy - 2.0 - gr:.1f} {cx + gr * 0.28:.1f},{cy - 2.0 - gr * 0.28:.1f} '
                f'{cx + gr:.1f},{cy - 2.0:.1f} {cx + gr * 0.28:.1f},{cy - 2.0 + gr * 0.28:.1f} '
                f'{cx:.1f},{cy - 2.0 + gr:.1f} {cx - gr * 0.28:.1f},{cy - 2.0 + gr * 0.28:.1f} '
                f'{cx - gr:.1f},{cy - 2.0:.1f} {cx - gr * 0.28:.1f},{cy - 2.0 - gr * 0.28:.1f}" '
                f'fill="#FFFFFF" stroke="#FEF08A" stroke-width="1.0" opacity="{gk:.2f}"/>'
            )

    # 7. Pilula de baixas `-N` pulando com curva elastica
    try:
        perdas_val = int(round(abs(float(perdas or 0))))
    except (TypeError, ValueError):
        perdas_val = 0

    if perdas_val > 0 and k >= 0.06:
        pk = _clamp((k - 0.06) / 0.52, 0.0, 1.0)
        pop = _ease_out_elastic(pk)
        rise = _ease_out_back(min(1.0, pk * 1.15), s=1.45)
        pill_op = _clamp((k - 0.06) / 0.10, 0.0, 1.0) * _clamp((1.0 - k) / 0.14, 0.0, 1.0)
        pill_y = cy - 16.0 - rise * 44.0
        pill_scale = _clamp(0.45 + 0.55 * pop, 0.40, 1.32)
        loss_txt = f"-{_fmt_num_ptbr(perdas_val)}"
        pill_w = max(62.0, len(loss_txt) * 11.2 + 24.0)
        pill_h = 28.0
        parts.append(
            f'<g transform="translate({cx:.1f},{pill_y:.1f}) scale({pill_scale:.3f})" opacity="{pill_op:.2f}">'
            f'<rect x="{-pill_w * 0.5 + 2.0:.1f}" y="{-pill_h * 0.5 + 3.0:.1f}" width="{pill_w:.1f}" '
            f'height="{pill_h:.1f}" rx="14" fill="#020617" opacity="0.65"/>'
            f'<rect x="{-pill_w * 0.5:.1f}" y="{-pill_h * 0.5:.1f}" width="{pill_w:.1f}" '
            f'height="{pill_h:.1f}" rx="14" fill="#7F1D1D" stroke="#FCA5A5" stroke-width="2.2"/>'
            f'<text x="0" y="5.8" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="16.5" font-weight="900" fill="#FEF2F2">{_esc(loss_txt)}</text>'
            f"</g>"
        )

    # Etiqueta extra de conquista quando a provincia muda de dono
    if conquistada and k >= 0.22:
        ck = _clamp((k - 0.22) / 0.24, 0.0, 1.0)
        c_op = ck * _clamp((1.0 - k) / 0.16, 0.0, 1.0)
        cy_tag = cy + 28.0 + (1.0 - _ease_out_cubic(ck)) * 10.0
        parts.append(
            f'<g transform="translate({cx:.1f},{cy_tag:.1f})" opacity="{c_op:.2f}">'
            f'<rect x="-54" y="-11" width="108" height="22" rx="11" fill="#070D17" '
            f'fill-opacity="0.94" stroke="{atk_col}" stroke-width="2.0"/>'
            f'<text x="0" y="4.2" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="11.5" font-weight="900" fill="#FEF08A" letter-spacing="1.0">CONQUISTA</text>'
            f"</g>"
        )

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 4. Onda Radial de Captura de Provincia (<clipPath> circular r=0..280)
# ---------------------------------------------------------------------------


def render_radial_capture_overlay(
    poly_points_str: str,
    cx: float,
    cy: float,
    k: float,
    fill_cor: str,
    clip_id: str,
) -> str:
    """Pinta provincia capturada em onda circular `r=0..280` com anel de contorno luminoso."""
    if not poly_points_str or not poly_points_str.strip():
        return ""
    k = _clamp(float(k), 0.0, 1.0)
    if k <= 0.001:
        return ""

    e = _ease_out_cubic(k)
    r = 280.0 * e
    safe_id = _safe_xml_id(clip_id, fallback="radial_cap")
    poly_clip_id = f"{safe_id}_poly"

    base_col = fill_cor or "#FBBF24"
    glow_col = _blend_hex(_visible_accent(base_col), "#FFFFFF", 0.55)
    ring_op = _clamp(1.0 - _clamp((k - 0.65) / 0.35, 0.0, 1.0), 0.0, 1.0)
    sheen_op = _clamp((1.0 - k) * 0.34, 0.0, 0.34)
    border_op = _clamp(k * 1.4, 0.0, 0.92) * _clamp((1.0 - k) / 0.25 + 0.35, 0.35, 1.0)

    parts = [
        "<g>",
        "<defs>",
        f'<clipPath id="{safe_id}"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}"/></clipPath>',
        f'<clipPath id="{poly_clip_id}"><polygon points="{poly_points_str}"/></clipPath>',
        "</defs>",
        # Preenchimento da provincia recortado pelo circulo crescente
        f'<g clip-path="url(#{safe_id})">',
        f'<polygon points="{poly_points_str}" fill="{base_col}" fill-opacity="0.94" '
        f'stroke="{base_col}" stroke-width="1.0"/>',
    ]
    if sheen_op > 0.01:
        parts.append(
            f'<polygon points="{poly_points_str}" fill="#FFFFFF" fill-opacity="{sheen_op:.2f}"/>'
        )
    parts.append("</g>")

    # Anel de contorno luminoso na crista da onda (recortado pelo poligono da provincia)
    if ring_op > 0.02 and r > 1.0:
        parts.append(
            f'<g clip-path="url(#{poly_clip_id})">'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="{glow_col}" stroke-width="15.0" opacity="{ring_op * 0.34:.2f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="#FEF08A" stroke-width="6.2" opacity="{ring_op * 0.80:.2f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" '
            f'stroke="#FFFFFF" stroke-width="2.4" opacity="{ring_op:.2f}"/>'
            f"</g>"
        )

    # Brilho de contorno da provincia recem-tomada
    parts.append(
        f'<polygon points="{poly_points_str}" fill="none" stroke="{glow_col}" '
        f'stroke-width="2.6" stroke-linejoin="round" opacity="{border_op:.2f}"/>'
    )
    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 5. Camada de Estado-Maior (Estrategia da IA + Miras + Fortaleza + Caixa HUD)
# ---------------------------------------------------------------------------


def _render_maneuver_glyph(manobra: str, cx: float, cy: float, cor: str) -> str:
    m = _clean_text(manobra).upper()
    if m == "FORTALEZA":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<path d="M-8,8 L-8,-3 L-5.5,-3 L-5.5,-8 L-2.5,-8 L-2.5,-4.5 L0,-4.5 '
            f'L0,-8 L2.5,-8 L2.5,-4.5 L5.5,-4.5 L5.5,-8 L8,-8 L8,8 Z" '
            f'fill="{cor}" stroke="#070D17" stroke-width="1.2"/>'
            f"</g>"
        )
    if m == "TRAICAO_PACTO":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<polygon points="-9,-8 -1,-8 -3,0 1,8 -9,8" fill="#EF4444" stroke="#FEF2F2" stroke-width="1.0"/>'
            f'<polygon points="2,-8 9,-8 9,8 4,8 0,0" fill="#991B1B" stroke="#FEF2F2" stroke-width="1.0"/>'
            f'<path d="M-1,-10 L2,-2 L-2,2 L2,10" fill="none" stroke="#FDE047" stroke-width="2.0"/>'
            f"</g>"
        )
    if m == "DESEMBARQUE":
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<circle cx="0" cy="-6" r="2.5" fill="none" stroke="#38BDF8" stroke-width="1.8"/>'
            f'<line x1="0" y1="-3.5" x2="0" y2="7" stroke="#38BDF8" stroke-width="2.0"/>'
            f'<line x1="-5" y1="-1" x2="5" y2="-1" stroke="#38BDF8" stroke-width="1.8"/>'
            f'<path d="M-7,3 C-6,8 6,8 7,3" fill="none" stroke="#38BDF8" stroke-width="2.0" stroke-linecap="round"/>'
            f"</g>"
        )
    if m in ("PINCA", "CERCO", "FLANQUEAMENTO"):
        return (
            f'<g transform="translate({cx:.1f},{cy:.1f})">'
            f'<path d="M-8,-6 Q0,-10 7,-2" fill="none" stroke="{cor}" stroke-width="2.4" stroke-linecap="round"/>'
            f'<path d="M-8,6 Q0,10 7,2" fill="none" stroke="{cor}" stroke-width="2.4" stroke-linecap="round"/>'
            f'<circle cx="7" cy="0" r="2.8" fill="#FDE047"/>'
            f"</g>"
        )
    # Padrao: reticulo tatico (BLITZ, CONTRA_ATAQUE, ECONOMIA, etc.)
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<circle cx="0" cy="0" r="8" fill="none" stroke="{cor}" stroke-width="2.0"/>'
        f'<line x1="-10.5" y1="0" x2="-4.5" y2="0" stroke="{cor}" stroke-width="1.8"/>'
        f'<line x1="4.5" y1="0" x2="10.5" y2="0" stroke="{cor}" stroke-width="1.8"/>'
        f'<line x1="0" y1="-10.5" x2="0" y2="-4.5" stroke="{cor}" stroke-width="1.8"/>'
        f'<line x1="0" y1="4.5" x2="0" y2="10.5" stroke="{cor}" stroke-width="1.8"/>'
        f'<circle cx="0" cy="0" r="2.4" fill="#FDE047"/>'
        f"</g>"
    )


def _render_target_reticle(
    cx: float,
    cy: float,
    label: str,
    t_sec: float,
    accent: str,
    idx: int = 0,
) -> str:
    """Reticulo de mira girando e pulsando sobre provincia alvo + etiqueta tatica."""
    pulse = 0.5 + 0.5 * math.sin(t_sec * 5.2 + idx * 1.3)
    rot_outer = (t_sec * 44.0 + idx * 35.0) % 360.0
    rot_inner = (-t_sec * 68.0 - idx * 25.0) % 360.0
    r_outer = 24.0 + pulse * 4.5
    r_inner = 14.0 + pulse * 2.0
    clean_lbl = _clean_text(label).upper() or "ALVO"

    parts = [
        f'<g transform="translate({cx:.1f},{cy:.1f})">',
        # Pulso de radar expandindo
        f'<circle cx="0" cy="0" r="{r_outer + 7.5:.1f}" fill="none" stroke="{accent}" '
        f'stroke-width="1.6" opacity="{0.50 - pulse * 0.30:.2f}"/>',
        # Anel externo giratorio segmentado + 4 marcas de mira
        f'<g transform="rotate({rot_outer:.1f})">',
        f'<circle cx="0" cy="0" r="{r_outer:.1f}" fill="none" stroke="#070D17" '
        f'stroke-width="5.0" stroke-dasharray="14,10" opacity="0.65"/>',
        f'<circle cx="0" cy="0" r="{r_outer:.1f}" fill="none" stroke="{accent}" '
        f'stroke-width="2.6" stroke-dasharray="14,10" opacity="0.94"/>',
        f'<line x1="{-r_outer - 6.0:.1f}" y1="0" x2="{-r_outer + 4.0:.1f}" y2="0" stroke="#FEF08A" stroke-width="2.4"/>',
        f'<line x1="{r_outer - 4.0:.1f}" y1="0" x2="{r_outer + 6.0:.1f}" y2="0" stroke="#FEF08A" stroke-width="2.4"/>',
        f'<line x1="0" y1="{-r_outer - 6.0:.1f}" x2="0" y2="{-r_outer + 4.0:.1f}" stroke="#FEF08A" stroke-width="2.4"/>',
        f'<line x1="0" y1="{r_outer - 4.0:.1f}" x2="0" y2="{r_outer + 6.0:.1f}" stroke="#FEF08A" stroke-width="2.4"/>',
        "</g>",
        # Anel interno contra-rotativo
        f'<g transform="rotate({rot_inner:.1f})">',
        f'<circle cx="0" cy="0" r="{r_inner:.1f}" fill="none" stroke="#FEF08A" '
        f'stroke-width="1.6" stroke-dasharray="6,6" opacity="0.86"/>',
        "</g>",
        # Ponto central pulsante
        f'<circle cx="0" cy="0" r="{3.2 + pulse * 1.4:.1f}" fill="#EF4444" stroke="#FEF9C3" stroke-width="1.4"/>',
    ]

    # Etiqueta tatica conectada por linha de chamada limpa
    tag_w = max(56.0, len(clean_lbl) * 8.2 + 18.0)
    tag_h = 21.0
    tx = 22.0
    ty = -36.0
    parts.append(
        f'<polyline points="12.0,-12.0 {tx:.1f},{ty + tag_h * 0.5:.1f} {tx + 8.0:.1f},{ty + tag_h * 0.5:.1f}" '
        f'fill="none" stroke="{accent}" stroke-width="1.8" stroke-linejoin="round"/>'
        f'<rect x="{tx + 6.0:.1f}" y="{ty:.1f}" width="{tag_w:.1f}" height="{tag_h:.1f}" rx="5" '
        f'fill="#070D17" fill-opacity="0.93" stroke="{accent}" stroke-width="1.8"/>'
        f'<text x="{tx + 6.0 + tag_w * 0.5:.1f}" y="{ty + 14.5:.1f}" text-anchor="middle" '
        f'font-family="{FONT_MONO}" font-size="11.5" font-weight="800" fill="#FEF08A" '
        f'letter-spacing="0.8">{_esc(clean_lbl)}</text>'
        f"</g>"
    )
    return "".join(parts)


def _render_rising_fortress(
    cx: float,
    cy: float,
    t_norm: float,
    t_sec: float,
    accent: str,
    clip_uid: str,
) -> str:
    """Torre de fortaleza erguendo do chao com aura defensiva e escudo."""
    rise = _ease_out_back(_clamp(t_norm / 0.36, 0.0, 1.0), s=1.35)
    y_offset = (1.0 - rise) * 44.0
    pulse = 0.5 + 0.5 * math.sin(t_sec * 4.5)
    shield_op = _clamp((t_norm - 0.18) / 0.25, 0.0, 1.0) * (0.55 + 0.30 * pulse)
    cid = _safe_xml_id(clip_uid, fallback="fort_rise")

    parts = [
        f'<g transform="translate({cx:.1f},{cy:.1f})">',
        "<defs>",
        f'<clipPath id="{cid}"><rect x="-42" y="-64" width="84" height="76"/></clipPath>',
        "</defs>",
        # Base / anel de poeira no solo
        f'<ellipse cx="0" cy="11.0" rx="{22.0 + pulse * 4.0:.1f}" ry="7.2" '
        f'fill="#070D17" fill-opacity="0.58" stroke="{accent}" stroke-width="2.0" opacity="0.82"/>',
        # Torre erguendo de baixo da linha de recorte do solo
        f'<g clip-path="url(#{cid})">',
        f'<g transform="translate(0,{y_offset:.1f})">',
        # Bastioes laterais
        f'<path d="M-21,11 L-21,-11 L-17,-11 L-17,-16 L-13,-16 L-13,-11 L-9,-11 L-9,11 Z" '
        f'fill="#94A3B8" stroke="#0F172A" stroke-width="1.8" stroke-linejoin="round"/>',
        f'<path d="M9,11 L9,-11 L13,-11 L13,-16 L17,-16 L17,-11 L21,-11 L21,11 Z" '
        f'fill="#94A3B8" stroke="#0F172A" stroke-width="1.8" stroke-linejoin="round"/>',
        # Torre central principal com ameias
        f'<path d="M-12,11 L-12,-24 L-9,-24 L-9,-30 L-4.5,-30 L-4.5,-24 L-1.5,-24 '
        f'L-1.5,-30 L1.5,-30 L1.5,-24 L4.5,-24 L4.5,-30 L9,-30 L9,-24 L12,-24 L12,11 Z" '
        f'fill="#E2E8F0" stroke="#0F172A" stroke-width="2.0" stroke-linejoin="round"/>',
        # Sombra lateral 2.5D da torre
        f'<rect x="2" y="-23" width="9" height="33" fill="#64748B" opacity="0.38"/>',
        # Portao arqueado e frestas de defesa
        f'<path d="M-5.0,11 L-5.0,1.5 A5.0,5.0 0 0,1 5.0,1.5 L5.0,11 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.2"/>',
        f'<rect x="-7.5" y="-17" width="3.0" height="7.0" rx="1.2" fill="#1E293B"/>',
        f'<rect x="4.5" y="-17" width="3.0" height="7.0" rx="1.2" fill="#1E293B"/>',
        # Estandarte no topo da torre
        f'<line x1="0" y1="-30" x2="0" y2="-45" stroke="#F8FAFC" stroke-width="2.0" stroke-linecap="round"/>',
        f'<polygon points="0,-45 14,-40 0,-35" fill="{accent}" stroke="#0F172A" stroke-width="1.0"/>',
        "</g>",
        "</g>",
    ]

    # Arco de escudo energetico sobre a fortaleza
    if shield_op > 0.02:
        parts.append(
            f'<path d="M-26,4 A27,27 0 0,1 26,4" fill="none" stroke="#38BDF8" '
            f'stroke-width="2.8" stroke-dasharray="7,4" stroke-linecap="round" opacity="{shield_op:.2f}"/>'
        )

    # Etiqueta compacta abaixo da torre
    parts.append(
        f'<rect x="-46" y="16" width="92" height="19" rx="5" fill="#070D17" '
        f'fill-opacity="0.92" stroke="{accent}" stroke-width="1.6"/>'
        f'<text x="0" y="29.5" text-anchor="middle" font-family="{FONT_MONO}" '
        f'font-size="10.8" font-weight="800" fill="#F8FAFC" letter-spacing="0.8">FORTALEZA</text>'
        f"</g>"
    )
    return "".join(parts)


def render_tactical_hud_box(
    coreo: dict[str, Any] | None,
    t_norm: float = 1.0,
    ia_cores: dict[str, Any] | None = None,
) -> str:
    """Caixa tatica no canto superior esquerdo abaixo do chip (`TATICA: <rotulo_tatico>`)."""
    if not coreo or not isinstance(coreo, dict):
        return ""

    rotulo = _clean_text(coreo.get("rotulo_tatico") or "").upper()
    manobra = _clean_text(coreo.get("manobra_tatica") or "").upper()
    if not rotulo and not manobra:
        return ""
    if not rotulo:
        rotulo = manobra.replace("_", " ")

    # Cor de destaque vinda da 1a rota ou amarelo tatico
    accent = "#FBBF24"
    rotas = coreo.get("rotas_soldados") or []
    if rotas and isinstance(rotas[0], dict) and rotas[0].get("ia"):
        accent = _visible_accent(_resolve_ia_color(rotas[0]["ia"], ia_cores, default="#FBBF24"))
    elif manobra == "TRAICAO_PACTO":
        accent = "#EF4444"
    elif manobra == "FORTALEZA":
        accent = "#38BDF8"

    slide = _ease_out_cubic(_clamp(float(t_norm) / 0.14, 0.0, 1.0))
    bx = 18.0 - (1.0 - slide) * 42.0
    by = 132.0  # Logo abaixo do chip de partida/turno (y=84..122 em compositor_aoh2.py)
    bh = 44.0
    prefix = "TATICA:"
    r_font = 19.5
    est_w = 152.0 + len(rotulo) * 14.8 + 28.0
    if est_w > 680.0:
        r_font = 16.5
        est_w = 148.0 + len(rotulo) * 12.6 + 28.0
    bw = min(740.0, max(300.0, est_w))
    clip_uid = _safe_xml_id(f"tatica_hud_{len(rotulo)}")

    return (
        f'<g opacity="{slide:.2f}">'
        f'<defs><clipPath id="{clip_uid}"><rect x="{bx + 44.0:.1f}" y="{by:.1f}" width="{bw - 52.0:.1f}" height="{bh:.1f}"/></clipPath></defs>'
        f'<rect x="{bx + 3.0:.1f}" y="{by + 4.0:.1f}" width="{bw:.1f}" height="{bh:.1f}" '
        f'rx="8" fill="#020617" opacity="0.62"/>'
        f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{bh:.1f}" '
        f'rx="8" fill="#070D17" fill-opacity="0.93" stroke="{accent}" stroke-width="2.0"/>'
        # Filete lateral esquerdo
        f'<rect x="{bx + 2.0:.1f}" y="{by + 4.0:.1f}" width="6.0" height="{bh - 8.0:.1f}" '
        f'rx="3" fill="{accent}"/>'
        # Cantoneiras militares de estado-maior
        f'<polyline points="{bx + bw - 14.0:.1f},{by + 2.0:.1f} {bx + bw - 2.0:.1f},{by + 2.0:.1f} '
        f'{bx + bw - 2.0:.1f},{by + 14.0:.1f}" fill="none" stroke="#FEF08A" stroke-width="2.0"/>'
        f'<polyline points="{bx + bw - 14.0:.1f},{by + bh - 2.0:.1f} {bx + bw - 2.0:.1f},{by + bh - 2.0:.1f} '
        f'{bx + bw - 2.0:.1f},{by + bh - 14.0:.1f}" fill="none" stroke="#FEF08A" stroke-width="2.0"/>'
        + _render_maneuver_glyph(manobra, bx + 28.0, by + bh * 0.5, accent)
        + f'<g clip-path="url(#{clip_uid})">'
        + f'<text x="{bx + 48.0:.1f}" y="{by + 29.0:.1f}" font-family="{FONT_MONO}" '
        f'font-size="19.5" font-weight="900" fill="#FBBF24">{prefix}</text>'
        f'<text x="{bx + 142.0:.1f}" y="{by + 29.0:.1f}" font-family="{FONT_SANS}" '
        f'font-size="{r_font:.1f}" font-weight="900" fill="#F8FAFC" letter-spacing="0.3">{_esc(rotulo)}</text>'
        f"</g></g>"
    )


def render_tactical_war_layer(
    topo: Any,
    coreo: dict[str, Any] | None,
    t_norm: float,
    t_sec: float,
    ia_cores: dict[str, Any] | None = None,
    *,
    include_map_layer: bool = True,
    include_hud_box: bool = True,
    cam_tx: float | None = None,
    cam_ty: float | None = None,
    cam_zoom: float | None = None,
) -> str:
    """Camada de estado-maior da IA: linhas de plano, miras nos alvos, fortaleza e caixa TATICA."""
    if not coreo or not isinstance(coreo, dict):
        return ""

    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", None) or {}
    t_norm = _clamp(float(t_norm), 0.0, 1.0)
    t_sec = float(t_sec)
    parts: list[str] = ["<g>"]

    if include_map_layer:
        rotas = coreo.get("rotas_soldados") or []
        alvos = coreo.get("alvos_taticos") or []
        manobra = _clean_text(coreo.get("manobra_tatica") or "").upper()

        # 1. Linhas tracejadas de plano estrategico correndo (`stroke-dashoffset`)
        dash_off = -t_sec * 44.0
        for idx, rota in enumerate(rotas):
            if not isinstance(rota, dict):
                continue
            de = rota.get("de")
            para = rota.get("para")
            if de not in centers or para not in centers or de == para:
                continue
            x0, y0 = centers[de]
            x2, y2 = centers[para]
            x1, y1 = bezier_control_point(x0, y0, x2, y2, idx=idx, bend_factor=0.19)
            r_col = _visible_accent(_resolve_ia_color(rota.get("ia"), ia_cores, default="#FBBF24"))
            is_naval = bool(rota.get("naval"))
            line_col = "#38BDF8" if is_naval else r_col
            path_d = f"M{x0:.1f},{y0:.1f} Q{x1:.1f},{y1:.1f} {x2:.1f},{y2:.1f}"

            parts.append(
                f'<path d="{path_d}" fill="none" stroke="#050B14" stroke-width="6.2" '
                f'stroke-dasharray="14,10" stroke-dashoffset="{dash_off:.1f}" '
                f'stroke-linecap="round" opacity="0.58"/>'
                f'<path d="{path_d}" fill="none" stroke="{line_col}" stroke-width="3.2" '
                f'stroke-dasharray="14,10" stroke-dashoffset="{dash_off:.1f}" '
                f'stroke-linecap="round" opacity="0.90"/>'
            )

            # Setas direcionais (chevrons) deslizando continuamente ao longo do plano
            for ci in range(3):
                u_c = (t_sec * 0.42 + ci / 3.0) % 1.0
                if u_c < 0.08 or u_c > 0.92:
                    continue
                cx_p, cy_p = _quad_pt(x0, y0, x1, y1, x2, y2, u_c)
                ux, uy = _quad_tangent(x0, y0, x1, y1, x2, y2, u_c)
                px_n, py_n = -uy, ux
                tip_x, tip_y = cx_p + ux * 6.0, cy_p + uy * 6.0
                b1x, b1y = cx_p - ux * 5.0 + px_n * 6.0, cy_p - uy * 5.0 + py_n * 6.0
                b2x, b2y = cx_p - ux * 5.0 - px_n * 6.0, cy_p - uy * 5.0 - py_n * 6.0
                parts.append(
                    f'<polyline points="{b1x:.1f},{b1y:.1f} {tip_x:.1f},{tip_y:.1f} {b2x:.1f},{b2y:.1f}" '
                    f'fill="none" stroke="#FEF08A" stroke-width="2.2" stroke-linecap="round" '
                    f'stroke-linejoin="round" opacity="0.88"/>'
                )

        # Se nao houver rotas mas houver >= 2 alvos, liga os alvos com linha de setor tatico
        if not rotas and len(alvos) >= 2:
            valid_pts = [
                centers[a["pid"]]
                for a in alvos
                if isinstance(a, dict) and a.get("pid") in centers
            ]
            if len(valid_pts) >= 2:
                seg_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in valid_pts)
                parts.append(
                    f'<polyline points="{seg_pts}" fill="none" stroke="#FBBF24" stroke-width="2.6" '
                    f'stroke-dasharray="10,8" stroke-dashoffset="{dash_off:.1f}" opacity="0.72"/>'
                )

        # 2. Reticulas de mira girando/pulsando nos alvos_taticos
        for idx, alvo in enumerate(alvos):
            if not isinstance(alvo, dict):
                continue
            pid = alvo.get("pid")
            if not pid or pid not in centers:
                continue
            ax, ay = centers[pid]
            lbl = alvo.get("label") or "ALVO"
            a_col = "#EF4444"
            if alvo.get("ia"):
                a_col = _visible_accent(_resolve_ia_color(alvo["ia"], ia_cores, default="#EF4444"))
            elif manobra == "FORTALEZA":
                a_col = "#38BDF8"
            elif manobra == "ECONOMIA":
                a_col = "#10B981"
            parts.append(_render_target_reticle(ax, ay, lbl, t_sec, a_col, idx=idx))

        # 3. Torre de fortaleza erguendo do chao em fortaleza_pid
        fort_pid = coreo.get("fortaleza_pid")
        if isinstance(fort_pid, str) and fort_pid in centers:
            fx, fy = centers[fort_pid]
            fort_accent = "#38BDF8"
            if rotas and isinstance(rotas[0], dict) and rotas[0].get("ia"):
                fort_accent = _visible_accent(_resolve_ia_color(rotas[0]["ia"], ia_cores, default="#38BDF8"))
            parts.append(
                _render_rising_fortress(fx, fy, t_norm, t_sec, fort_accent, f"fort_{fort_pid}")
            )

    # 4. Caixa tatica no canto superior esquerdo abaixo do chip
    if include_hud_box:
        hud_svg = render_tactical_hud_box(coreo, t_norm=t_norm, ia_cores=ia_cores)
        if hud_svg:
            if cam_tx is not None and cam_ty is not None and cam_zoom:
                inv_z = 1.0 / max(1e-4, float(cam_zoom))
                parts.append(
                    f'<g transform="scale({inv_z:.6f}) translate({-float(cam_tx):.2f},{-float(cam_ty):.2f})">'
                    + hud_svg
                    + "</g>"
                )
            else:
                parts.append(hud_svg)

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 6. Pergaminho de Tratado Assinado e Rasgado ao Meio (`TRAICAO`)
# ---------------------------------------------------------------------------


def render_torn_treaty_fx(
    cx: float,
    cy: float,
    t_prog: float,
    label_a: str,
    label_b: str,
    tipo: str = "PACTO",
) -> str:
    """Pergaminho sendo assinado e RASGADO AO MEIO em duas metades com selo `TRAICAO`."""
    p = _clamp(float(t_prog), 0.0, 1.0)
    if p <= 0.001:
        return ""

    tipo_clean = _clean_text(tipo).upper() or "PACTO"
    lbl_a = _clean_text(label_a).upper() or "LADO A"
    lbl_b = _clean_text(label_b).upper() or "LADO B"
    header_txt = f"TRATADO DE {tipo_clean}" if tipo_clean in ("PAZ", "ALIANCA") else f"{tipo_clean} DE NAO AGRESSAO"

    # Dimensoes do pergaminho
    hw = 165.0  # largura total 330
    hh = 102.0  # altura total 204

    # Entrada elastica do pergaminho (0.0 .. 0.14); mantem visivel no desfecho ate p=1.0
    enter = _ease_out_back(_clamp(p / 0.14, 0.0, 1.0), s=1.25)
    overall_op = _clamp(p / 0.07, 0.0, 1.0)

    # Progresso da assinatura (0.08 .. 0.28)
    sign_p = _clamp((p - 0.08) / 0.20, 0.0, 1.0)
    seal_p = _ease_out_back(_clamp((p - 0.20) / 0.10, 0.0, 1.0), s=1.5)

    # Progresso do rasgo central (0.30 .. 0.42) e separacao das duas metades (0.38 .. 0.85)
    crack_p = _clamp((p - 0.30) / 0.12, 0.0, 1.0)
    split_p = _ease_out_cubic(_clamp((p - 0.38) / 0.42, 0.0, 1.0))

    # Micro-tremor durante o rasgo
    rip_shake_x = 0.0
    rip_shake_y = 0.0
    if 0.30 <= p <= 0.46:
        rk = (p - 0.30) / 0.16
        amp = 7.5 * (1.0 - rk)
        rip_shake_x = amp * math.sin(rk * 46.0)
        rip_shake_y = amp * 0.65 * math.cos(rk * 38.0)

    sep_x = split_p * 56.0
    drop_y = split_p * 18.0
    rot_l = -split_p * 14.5
    rot_r = split_p * 15.5

    # Denteado compartilhado de rasgo (de topo y=-hh ate base y=+hh)
    tear_pts = [
        (0.0, -hh),
        (-9.0, -78.0),
        (8.0, -54.0),
        (-10.0, -28.0),
        (9.0, -2.0),
        (-8.0, 24.0),
        (10.0, 50.0),
        (-7.0, 76.0),
        (0.0, hh),
    ]

    # Contorno da metade esquerda (fechando pelo denteado)
    left_poly_pts = [(-hw, -hh)] + tear_pts + [(-hw, hh)]
    left_path = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in left_poly_pts) + " Z"

    # Contorno da metade direita (fechando pelo mesmo denteado invertido)
    right_poly_pts = [(hw, -hh), (hw, hh)] + list(reversed(tear_pts))
    right_path = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in right_poly_pts) + " Z"

    tear_line_d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in tear_pts)

    # Identificadores de clip deterministas baseados na posicao
    uid = _safe_xml_id(f"treaty_{int(cx)}_{int(cy)}")
    clip_l = f"{uid}_L"
    clip_r = f"{uid}_R"

    def _treaty_interior() -> str:
        # Conteudo completo do pergaminho (sera recortado na metade L e na metade R)
        sig_l_dash = 95.0
        sig_l_off = sig_l_dash * (1.0 - _clamp(sign_p * 2.0, 0.0, 1.0))
        sig_r_off = sig_l_dash * (1.0 - _clamp((sign_p - 0.45) / 0.55, 0.0, 1.0))
        s_scale = _clamp(seal_p, 0.0, 1.2)
        return (
            # Moldura interna dupla de pergaminho diplomatico
            f'<rect x="{-hw + 12:.1f}" y="{-hh + 12:.1f}" width="{hw * 2 - 24:.1f}" height="{hh * 2 - 24:.1f}" '
            f'rx="6" fill="none" stroke="#92400E" stroke-width="2.2" opacity="0.82"/>'
            f'<rect x="{-hw + 18:.1f}" y="{-hh + 18:.1f}" width="{hw * 2 - 36:.1f}" height="{hh * 2 - 36:.1f}" '
            f'rx="4" fill="none" stroke="#B45309" stroke-width="1.0" stroke-dasharray="6,4" opacity="0.65"/>'
            # Titulo do tratado
            f'<text x="0" y="-58" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="17" font-weight="900" fill="#451A03" letter-spacing="1.2">{_esc(header_txt)}</text>'
            f'<line x1="-122" y1="-44" x2="122" y2="-44" stroke="#92400E" stroke-width="1.6" opacity="0.7"/>'
            # Linhas estilizadas de clausulas diplomaticas
            f'<line x1="-116" y1="-22" x2="116" y2="-22" stroke="#78350F" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>'
            f'<line x1="-102" y1="-6" x2="108" y2="-6" stroke="#78350F" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>'
            f'<line x1="-110" y1="10" x2="94" y2="10" stroke="#78350F" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>'
            # Nomes das partes e assinaturas manuscritas animadas
            f'<text x="-84" y="42" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="16" font-weight="900" fill="#1E293B">{_esc(lbl_a)}</text>'
            f'<line x1="-132" y1="74" x2="-36" y2="74" stroke="#78350F" stroke-width="1.4"/>'
            f'<path d="M-126,68 Q-110,50 -96,66 T-66,62 T-42,66" fill="none" stroke="#1E3A8A" '
            f'stroke-width="2.6" stroke-linecap="round" stroke-dasharray="{sig_l_dash:.0f}" '
            f'stroke-dashoffset="{sig_l_off:.1f}"/>'
            f'<text x="84" y="42" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="16" font-weight="900" fill="#1E293B">{_esc(lbl_b)}</text>'
            f'<line x1="36" y1="74" x2="132" y2="74" stroke="#78350F" stroke-width="1.4"/>'
            f'<path d="M42,66 Q58,50 74,66 T104,60 T126,67" fill="none" stroke="#7F1D1D" '
            f'stroke-width="2.6" stroke-linecap="round" stroke-dasharray="{sig_l_dash:.0f}" '
            f'stroke-dashoffset="{sig_r_off:.1f}"/>'
            # Selo de cera central (parte ao meio junto com o pergaminho!)
            + (
                f'<g transform="translate(0,56) scale({s_scale:.2f})">'
                f'<circle cx="0" cy="0" r="19" fill="#991B1B" stroke="#7F1D1D" stroke-width="2.2"/>'
                f'<circle cx="0" cy="0" r="14" fill="none" stroke="#FCA5A5" stroke-width="1.4" stroke-dasharray="4,2"/>'
                f'<polygon points="0,-8 2.5,-2 8.5,-2 3.6,1.8 5.4,8 0,4.2 -5.4,8 -3.6,1.8 -8.5,-2 -2.5,-2" fill="#FEF08A"/>'
                f"</g>"
                if p >= 0.20
                else ""
            )
        )

    interior = _treaty_interior()
    parts = [
        f'<g transform="translate({cx + rip_shake_x:.1f},{cy + rip_shake_y:.1f}) scale({enter:.3f})" '
        f'opacity="{overall_op:.2f}">',
        "<defs>",
        f'<clipPath id="{clip_l}"><path d="{left_path}"/></clipPath>',
        f'<clipPath id="{clip_r}"><path d="{right_path}"/></clipPath>',
        "</defs>",
        # Metade esquerda
        f'<g transform="translate({-sep_x:.1f},{drop_y:.1f}) rotate({rot_l:.1f})">',
        f'<path d="{left_path}" transform="translate(4,6)" fill="#020617" opacity="0.52"/>',
        f'<path d="{left_path}" fill="#F5E6C4" stroke="#78350F" stroke-width="2.6" stroke-linejoin="round"/>',
        f'<g clip-path="url(#{clip_l})">{interior}</g>',
        # Filete claro na borda rasgada
        (
            f'<path d="{tear_line_d}" fill="none" stroke="#FFFBEB" stroke-width="2.2" '
            f'stroke-linejoin="round" opacity="{0.85 if split_p > 0.02 else 0.0:.2f}"/>'
        ),
        "</g>",
        # Metade direita
        f'<g transform="translate({sep_x:.1f},{drop_y * 1.15:.1f}) rotate({rot_r:.1f})">',
        f'<path d="{right_path}" transform="translate(4,6)" fill="#020617" opacity="0.52"/>',
        f'<path d="{right_path}" fill="#EFE0BA" stroke="#78350F" stroke-width="2.6" stroke-linejoin="round"/>',
        f'<g clip-path="url(#{clip_r})">{interior}</g>',
        (
            f'<path d="{tear_line_d}" fill="none" stroke="#FFFBEB" stroke-width="2.2" '
            f'stroke-linejoin="round" opacity="{0.85 if split_p > 0.02 else 0.0:.2f}"/>'
        ),
        "</g>",
    ]

    # Raio de ruptura correndo do topo a base (0.30 .. 0.45)
    if 0.30 <= p <= 0.48:
        crack_len = 230.0
        crack_off = crack_len * (1.0 - crack_p)
        crack_op = _clamp(1.0 - (p - 0.38) / 0.10, 0.0, 1.0)
        parts.append(
            f'<path d="{tear_line_d}" fill="none" stroke="#EF4444" stroke-width="5.2" '
            f'stroke-dasharray="{crack_len:.0f}" stroke-dashoffset="{crack_off:.1f}" '
            f'stroke-linejoin="round" opacity="{crack_op:.2f}"/>'
            f'<path d="{tear_line_d}" fill="none" stroke="#FEF08A" stroke-width="2.0" '
            f'stroke-dasharray="{crack_len:.0f}" stroke-dashoffset="{crack_off:.1f}" '
            f'stroke-linejoin="round" opacity="{crack_op:.2f}"/>'
        )

    # Fragmentos de papel rasgado voando do centro
    if split_p > 0.02:
        scrap_op = _clamp(1.0 - _clamp((p - 0.65) / 0.30, 0.0, 1.0), 0.0, 1.0)
        if scrap_op > 0.02:
            scraps = [
                (-18.0, -52.0, -24.0, -28.0, 35.0),
                (22.0, -34.0, 30.0, -18.0, -40.0),
                (-14.0, 12.0, -32.0, 26.0, 55.0),
                (16.0, 38.0, 28.0, 34.0, -50.0),
                (-8.0, -10.0, -18.0, 42.0, 25.0),
                (10.0, 62.0, 22.0, 48.0, -30.0),
            ]
            for sx0, sy0, dvx, dvy, srot in scraps:
                fx = sx0 + dvx * split_p
                fy = sy0 + dvy * split_p + 18.0 * (split_p * split_p)
                ang = srot * split_p
                parts.append(
                    f'<polygon points="-5,-3 5,-2 3,4 -4,3" fill="#F5E6C4" stroke="#92400E" '
                    f'stroke-width="0.9" transform="translate({fx:.1f},{fy:.1f}) rotate({ang:.1f})" '
                    f'opacity="{scrap_op:.2f}"/>'
                )

    # Carimbo pesado `TRAICAO` batendo sobre o rasgo (p >= 0.46)
    if p >= 0.46:
        st_k = _ease_out_cubic(_clamp((p - 0.46) / 0.14, 0.0, 1.0))
        st_scale = _lerp(1.85, 1.0, st_k)
        st_op = _clamp((p - 0.46) / 0.06, 0.0, 1.0)
        parts.append(
            f'<g transform="translate(0,4) rotate(-8.0) scale({st_scale:.3f})" opacity="{st_op:.2f}">'
            f'<rect x="-126" y="-33" width="252" height="66" rx="10" fill="#090F1A" fill-opacity="0.94" '
            f'stroke="#EF4444" stroke-width="5.2"/>'
            f'<rect x="-118" y="-25" width="236" height="50" rx="6" fill="none" '
            f'stroke="#FCA5A5" stroke-width="1.8" stroke-dasharray="10,4" opacity="0.82"/>'
            f'<text x="0" y="13" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="36" font-weight="900" fill="#FEF2F2" letter-spacing="3.5">TRAICAO</text>'
            f"</g>"
        )

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 7. Micro-Animacao de Confronto Ativo (Escudos + Lancas Colidindo + Faisca)
# ---------------------------------------------------------------------------


def render_soldiers_clash_fx(
    cx: float,
    cy: float,
    t_sec: float,
    cor_a: str,
    cor_b: str,
) -> str:
    """Micro-animacao de confronto (dois escudos/lancas colidindo com faisca) sobre combate ativo."""
    t_sec = float(t_sec)
    # Ciclo ritmado de impacto a 2.5 golpes por segundo
    cycle = (t_sec * 2.5) % 1.0
    if cycle < 0.30:
        # Recuo preparando o golpe
        u = cycle / 0.30
        sep = _lerp(9.5, 14.5, _ease_in_out_sine(u))
        tilt = _lerp(6.0, 14.0, u)
        spark_k = 0.0
    elif cycle < 0.44:
        # Avanco rapido ate a colisao
        u = (cycle - 0.30) / 0.14
        sep = _lerp(14.5, 3.2, u * u)
        tilt = _lerp(14.0, -8.0, u)
        spark_k = _clamp((u - 0.65) / 0.35, 0.0, 1.0)
    elif cycle < 0.72:
        # Impacto + recuo vibrante + faisca voando
        u = (cycle - 0.44) / 0.28
        sep = _lerp(3.2, 10.5, _ease_out_cubic(u)) + math.sin(u * 22.0) * (1.0 - u) * 1.6
        tilt = _lerp(-8.0, 6.0, _ease_out_cubic(u))
        spark_k = 1.0 - u
    else:
        u = (cycle - 0.72) / 0.28
        sep = _lerp(10.5, 9.5, u)
        tilt = 6.0
        spark_k = 0.0

    col_a = _visible_accent(cor_a or "#EF4444")
    col_b = _visible_accent(cor_b or "#3D7BF2")
    rim_a = _blend_hex(col_a, "#FFFFFF", 0.55)
    rim_b = _blend_hex(col_b, "#FFFFFF", 0.55)
    pulse = 0.5 + 0.5 * math.sin(t_sec * 6.0)

    parts = [
        f'<g transform="translate({cx:.1f},{cy:.1f})">',
        # Medalhao escuro discreto + anel rubro pulsante
        f'<circle cx="0" cy="0" r="{23.0 + pulse * 3.5:.1f}" fill="none" stroke="#EF4444" '
        f'stroke-width="1.8" opacity="{0.58 - pulse * 0.28:.2f}"/>',
        f'<circle cx="0" cy="0" r="19.5" fill="#070D17" fill-opacity="0.78" '
        f'stroke="#EF4444" stroke-width="1.6"/>',
        # Lado A (esquerda -> colide para a direita)
        f'<g transform="translate({-sep:.1f},1.0) rotate({-tilt:.1f})">',
        # Lanca A
        f'<line x1="-10.0" y1="8.0" x2="12.5" y2="-9.5" stroke="#090F1A" stroke-width="4.0" stroke-linecap="round"/>'
        f'<line x1="-9.5" y1="7.5" x2="12.0" y2="-9.0" stroke="#E2E8F0" stroke-width="2.0" stroke-linecap="round"/>'
        f'<polygon points="14.5,-11.0 9.5,-9.5 11.4,-7.2" fill="#FFFFFF"/>'
        # Escudo A
        f'<path d="M-4.5,-8.0 L5.5,-6.5 L5.2,2.0 C4.8,6.8 1.2,9.8 -0.5,10.6 C-2.6,9.5 -4.8,6.2 -4.8,1.8 Z" '
        f'fill="{col_a}" stroke="{rim_a}" stroke-width="1.8" stroke-linejoin="round"/>'
        f'<circle cx="0.3" cy="0.5" r="2.0" fill="#FEF08A"/>'
        f"</g>",
        # Lado B (direita -> colide para a esquerda)
        f'<g transform="translate({sep:.1f},1.0) rotate({tilt:.1f})">',
        # Lanca B
        f'<line x1="10.0" y1="8.0" x2="-12.5" y2="-9.5" stroke="#090F1A" stroke-width="4.0" stroke-linecap="round"/>'
        f'<line x1="9.5" y1="7.5" x2="-12.0" y2="-9.0" stroke="#E2E8F0" stroke-width="2.0" stroke-linecap="round"/>'
        f'<polygon points="-14.5,-11.0 -9.5,-9.5 -11.4,-7.2" fill="#FFFFFF"/>'
        # Escudo B
        f'<path d="M4.5,-8.0 L-5.5,-6.5 L-5.2,2.0 C-4.8,6.8 -1.2,9.8 0.5,10.6 C2.6,9.5 4.8,6.2 4.8,1.8 Z" '
        f'fill="{col_b}" stroke="{rim_b}" stroke-width="1.8" stroke-linejoin="round"/>'
        f'<circle cx="-0.3" cy="0.5" r="2.0" fill="#FEF08A"/>'
        f"</g>",
    ]

    # Faisca viva no instante de choque dos escudos/lancas
    if spark_k > 0.04:
        sr = 5.0 + spark_k * 10.0
        parts.append(
            f'<g transform="translate(0,-3.0)" opacity="{spark_k:.2f}">'
            f'<polygon points="0,{-sr:.1f} {sr * 0.28:.1f},{-sr * 0.28:.1f} {sr:.1f},0 '
            f'{sr * 0.28:.1f},{sr * 0.28:.1f} 0,{sr:.1f} {-sr * 0.28:.1f},{sr * 0.28:.1f} '
            f'{-sr:.1f},0 {-sr * 0.28:.1f},{-sr * 0.28:.1f}" fill="#FFFFFF" stroke="#FBBF24" stroke-width="1.0"/>'
        )
        for ri in range(6):
            ang = ri * (math.tau / 6.0) + 0.35
            r0 = 4.0 + (1.0 - spark_k) * 7.0
            r1 = r0 + 5.5 + spark_k * 4.5
            parts.append(
                f'<line x1="{math.cos(ang) * r0:.1f}" y1="{math.sin(ang) * r0:.1f}" '
                f'x2="{math.cos(ang) * r1:.1f}" y2="{math.sin(ang) * r1:.1f}" '
                f'stroke="#FDE047" stroke-width="1.8" stroke-linecap="round"/>'
            )
        parts.append("</g>")

    parts.append("</g>")
    return "".join(parts)
