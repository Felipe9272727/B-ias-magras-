#!/usr/bin/env python3
"""Animacoes SVG de climax, roleta, escudos, placar flip, placas e contadores (AoH2 v3).

Modulo puro stdlib (ZERO emojis, ZERO filtros <filter> blur para rsvg-convert rapido).
Projeto visual 1920x1080 compatibilizado com `compositor_aoh2.py`, `guerra_svg.py` e `telas_svg.py`.
"""

from __future__ import annotations

import math
import re
from typing import Any, Callable
from xml.sax.saxutils import escape as xml_escape

SVG_W = 1920
SVG_H = 1080

FONT_SANS = "DejaVu Sans, Liberation Sans, Noto Sans, Arial, sans-serif"
FONT_MONO = "DejaVu Sans Mono, DejaVu Sans, monospace"

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

DEFAULT_IA_META: dict[str, dict[str, str]] = {
    "sonnet": {"nome": "Sonnet", "cor": "#3D7BF2", "fg": "#F8FAFC", "badge": "S"},
    "hydrogen": {"nome": "Hydrogen", "cor": "#19A974", "fg": "#F8FAFC", "badge": "H"},
    "glm": {"nome": "GLM", "cor": "#8E4DE0", "fg": "#F8FAFC", "badge": "G"},
    "ember": {"nome": "Ember", "cor": "#E0262B", "fg": "#F8FAFC", "badge": "E"},
    "deepseek": {"nome": "DeepSeek", "cor": "#1E2430", "fg": "#F8FAFC", "badge": "D"},
    "qwen": {"nome": "Qwen", "cor": "#F2802E", "fg": "#0F172A", "badge": "Q"},
    "inkling": {"nome": "Inkling", "cor": "#22C7D6", "fg": "#0F172A", "badge": "I"},
}

COUNTRY_NAMES = {
    "brasil": "BRASIL",
    "argentina": "ARGENTINA",
    "bolivia": "BOLIVIA",
    "colombia": "COLOMBIA",
    "peru": "PERU",
    "chile": "CHILE",
    "venezuela": "VENEZUELA",
}


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


def _ease_out_back(t: float, s: float = 1.65) -> float:
    t = _clamp(t, 0.0, 1.0)
    u = t - 1.0
    return 1.0 + (s + 1.0) * (u ** 3) + s * (u ** 2)


def _clean(text: Any) -> str:
    if text is None:
        return ""
    s = _EMOJI_RE.sub("", str(text))
    s = _CTRL_RE.sub(" ", s)
    return re.sub(r"\s+", " ", s).strip()


def _esc(text: Any) -> str:
    return xml_escape(_clean(text), {'"': "&quot;", "'": "&apos;"})


def _fmt_pt(val: int | float) -> str:
    n = int(round(float(val)))
    sign = "-" if n < 0 else ""
    s = f"{abs(n):,}".replace(",", ".")
    return f"{sign}{s}"


def _ia_info(ia_meta: dict[str, dict[str, str]] | None, ia_k: str) -> dict[str, str]:
    k = (ia_k or "").strip().lower()
    if ia_meta and k in ia_meta:
        return ia_meta[k]
    return DEFAULT_IA_META.get(k, {"nome": k.upper() or "IA", "cor": "#64748B", "fg": "#F8FAFC", "badge": "?"})


def _ia_vis_cor(ia_meta: dict[str, dict[str, str]] | None, ia_k: str) -> str:
    cor = _ia_info(ia_meta, ia_k)["cor"]
    return "#C8D3DD" if (ia_k or "").strip().lower() == "deepseek" else cor


def _call_portrait(
    render_portrait_fn: Callable[..., str] | None,
    ia: str,
    cx: float,
    cy: float,
    r: float,
    highlight: bool = False,
    ia_meta: dict[str, dict[str, str]] | None = None,
) -> str:
    if render_portrait_fn is not None:
        return render_portrait_fn(ia, cx, cy, r, highlight=highlight)
    info = _ia_info(ia_meta, ia)
    cor = info["cor"]
    rim = "#FDE047" if highlight else "#F8FAFC"
    return (
        f'<g><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{cor}" stroke="{rim}" stroke-width="3.5"/>'
        f'<text x="{cx:.1f}" y="{cy + r * 0.34:.1f}" text-anchor="middle" font-family="{FONT_SANS}" '
        f'font-size="{r * 0.95:.1f}" font-weight="900" fill="{info["fg"]}">{_esc(info["badge"])}</text></g>'
    )


def _bg_war_room() -> str:
    lines = ['<rect x="0" y="0" width="1920" height="1080" fill="#07111C"/>']
    for gx in range(0, 1921, 120):
        lines.append(f'<line x1="{gx}" y1="0" x2="{gx}" y2="1080" stroke="#132333" stroke-width="1"/>')
    for gy in range(0, 1081, 120):
        lines.append(f'<line x1="0" y1="{gy}" x2="1920" y2="{gy}" stroke="#132333" stroke-width="1"/>')
    return "".join(lines)


def _map_backdrop_svg(
    topo: Any,
    turn: dict[str, Any],
    ia_meta: dict[str, dict[str, str]] | None,
    mapa: dict[str, Any],
    focus_pids: list[str] | None = None,
    t_sec: float = 0.0,
    opacity: float = 0.34,
    pulse_targets: bool = True,
) -> str:
    """Desenha o mapa real com deriva continua e foco suave sobre as provincias da cena."""
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    sa_cx = float(getattr(topo, "sa_cx", 720.0))
    sa_cy = float(getattr(topo, "sa_cy", 560.0))

    focus = [p for p in (focus_pids or []) if p in centers]
    if focus:
        fcx = sum(centers[p][0] for p in focus) / len(focus)
        fcy = sum(centers[p][1] for p in focus) / len(focus)
        # Mistura foco local com centro continental para manter silhueta da America do Sul
        cam_cx = _lerp(sa_cx, fcx, 0.55)
        cam_cy = _lerp(sa_cy, fcy, 0.55)
        zoom = 1.24 + 0.04 * math.sin(t_sec * 0.45)
    else:
        cam_cx = sa_cx
        cam_cy = sa_cy
        zoom = 1.02 + 0.04 * math.sin(t_sec * 0.40)

    cam_cx += math.sin(t_sec * 0.65) * 16.0
    cam_cy += math.cos(t_sec * 0.52) * 12.0
    tx = 960.0 - cam_cx * zoom
    ty = 540.0 - cam_cy * zoom

    nacoes_meta = (mapa or {}).get("nacoes") or {}
    t_nacoes = (turn or {}).get("nacoes") or {}
    provs_st = (turn or {}).get("provincias") or {}

    parts = [f'<g opacity="{opacity:.2f}" transform="translate({tx:.2f},{ty:.2f}) scale({zoom:.4f})">']
    for pid, pstr in poly_strs.items():
        dono = (provs_st.get(pid) or {}).get("dono") or ""
        ia_k = ((t_nacoes.get(dono) or {}).get("ia_apelido") or (nacoes_meta.get(dono) or {}).get("ia_apelido") or "").lower()
        cor = _ia_info(ia_meta, ia_k)["cor"] if ia_k else "#334155"
        stroke = "#C8D3DD" if ia_k == "deepseek" else "#0F172A"
        sw = "2.2" if ia_k == "deepseek" else "1.3"
        parts.append(f'<polygon points="{pstr}" fill="{cor}" stroke="{stroke}" stroke-width="{sw}"/>')

    if pulse_targets and focus:
        phase = (t_sec * 1.4) % 1.0
        r_ring = 18.0 + 38.0 * _ease_out(phase)
        op_ring = max(0.0, 0.90 * (1.0 - phase))
        for pid in focus[:4]:
            px, py = centers[pid]
            parts.append(
                f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{r_ring:.1f}" fill="none" '
                f'stroke="#FDE047" stroke-width="3.2" opacity="{op_ring:.2f}"/>'
                f'<circle cx="{px:.1f}" cy="{py:.1f}" r="9.0" fill="#EF4444" stroke="#F8FAFC" stroke-width="2.0"/>'
            )

    parts.append("</g>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# 1. Contadores de Gag Fixos (canto superior direito, JetBrains Mono)
# ---------------------------------------------------------------------------

_P1_BETRAYAL_SCENES = ("B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15")
_P2_CHILE_BREACH_SCHEDULE: list[tuple[str, int, bool]] = [
    # (scene_id, count, flashes_here)
    ("D2", 1, True), ("D3", 1, False), ("D4", 1, False),
    ("D5", 2, True), ("D6", 2, False), ("D7", 2, False),
    ("D8", 3, True), ("D9", 3, False), ("D10", 3, False), ("D11", 3, False),
    ("D12", 4, True), ("D13", 4, False), ("D14", 4, False),
    ("D15", 5, True), ("D16", 5, False), ("D17", 5, False), ("D18", 5, False),
    ("D19", 5, False), ("D20", 5, False), ("D21", 5, False), ("D22", 5, False),
]
_P2_CHILE_MAP = {sid: (cnt, fl) for sid, cnt, fl in _P2_CHILE_BREACH_SCHEDULE}
_P2_BRASIL_TROOPS_SCENES = {
    "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11",
    "D13", "D14", "D15", "D16", "D18", "D19", "D20", "D21", "D22",
}


def _brazil_troops_in_turn(turn: dict[str, Any] | None) -> int:
    if not turn:
        return 15600
    nac = (turn.get("nacoes") or {}).get("brasil") or {}
    val = nac.get("tropas_total")
    if val is not None:
        return int(round(float(val)))
    provs = turn.get("provincias") or {}
    return sum(int(round(float(pv.get("tropas") or 0))) for pv in provs.values() if pv.get("dono") == "brasil")


def render_gag_counters_hud(
    scene_id: str,
    local_f: int,
    fps: int,
    tela_tipo: str,
    matches: dict[int, dict[str, Any]],
    turno_idx: int,
    ba_waves_held: int = 0,
    has_top_right_meme: bool = False,
) -> str:
    """Renderiza no maximo 2 contadores de gag fixos em JetBrains Mono na cor da IA."""
    sid = (scene_id or "").strip().upper()
    if sid in ("A1", "A2", "A3", "B1", "B2", "B16", "C1", "E1", "E2", "E3"):
        return ""

    t_sec = max(0.0, float(local_f)) / max(1.0, float(fps or 30))
    items: list[tuple[str, str, str, bool]] = []  # (label, value, cor, flash)

    # Partida 1: Traicoes acumuladas
    if sid in _P1_BETRAYAL_SCENES:
        if sid in ("B3", "B4"):
            cnt, fl = 1, (sid == "B3")
        elif sid in ("B5", "B6", "B7"):
            cnt, fl = 2, (sid == "B5")
        else:
            cnt, fl = 3, (sid == "B8")
        items.append(("TRAICOES NA IDA", f"{cnt}/3", "#FBBF24", fl and t_sec < 1.35))

    # Partida 2: Acordos rasgados pelo Chile (N/5)
    if sid in _P2_CHILE_MAP:
        cnt, fl = _P2_CHILE_MAP[sid]
        items.append(("ACORDOS RASGADOS (CHILE)", f"{cnt}/5", "#E0262B", fl and t_sec < 1.35))

    # Partida 2: Buenos Aires Segurou (D12 e D17) — prioridade quando em par
    if sid == "D12":
        items.append(("BUENOS AIRES SEGUROU", "2", "#3D7BF2", t_sec < 1.35))
    elif sid == "D17":
        if ba_waves_held >= 9:
            items.append(("BUENOS AIRES", "CAIU NA 9A", "#EF4444", True))
        else:
            shown = max(3, int(ba_waves_held))
            # Pisca curto a cada onda ganha
            wave_pulse = (t_sec * 0.8) % 1.0 < 0.35
            items.append(("BUENOS AIRES SEGUROU", f"{shown}/8", "#3D7BF2", wave_pulse or t_sec < 1.0))

    # Partida 2: Tropas do Brasil (lidas do log real, trava em 25.093 no T25 / D22)
    if sid in _P2_BRASIL_TROOPS_SCENES and len(items) < 2:
        m2 = matches.get(2)
        if m2 and m2.get("turnos"):
            turnos2 = m2["turnos"]
            t_use = turnos2[min(max(0, int(turno_idx)), len(turnos2) - 1)]
            tropas_br = 25093 if sid == "D22" else _brazil_troops_in_turn(t_use)
        else:
            tropas_br = 25093 if sid == "D22" else 15600
        fl_br = sid in ("D3", "D18", "D22") and t_sec < 1.35
        items.append(("TROPAS DO BRASIL", _fmt_pt(tropas_br), "#19A974", fl_br))

    if not items:
        return ""
    items = items[:2]

    # Posicionamento seguro por tipo de tela
    if tela_tipo == "mapa":
        bx = 1044.0
        bw = 396.0
        y0 = 84.0
    elif tela_tipo == "dois_baloes" and has_top_right_meme:
        # Quando ha meme no canto superior direito, ancora no topo-esquerdo acima do selo (y>=118)
        bx = 24.0
        bw = 436.0
        y0 = 18.0
    elif tela_tipo == "pensamento":
        # Abaixo do painel "CHAVES DO PLANO"/mini-mapa (no topo cobria o título do painel)
        bx = 1452.0
        bw = 442.0
        y0 = 1080.0 - len(items) * 44.0 - (len(items) - 1) * 8.0 - 10.0
    else:
        bx = 1452.0
        bw = 442.0
        y0 = 18.0

    bh = 44.0
    gap = 8.0
    out = ["<g>"]
    for idx, (lbl, val, cor, flashing) in enumerate(items):
        cy_box = y0 + idx * (bh + gap)
        pulse = abs(math.sin(t_sec * math.pi * 3.5)) if flashing else 0.0
        sc = 1.0 + 0.045 * pulse
        bg = "#1E1015" if (flashing and pulse > 0.5 and cor in ("#E0262B", "#EF4444")) else "#070D17"
        stroke_w = 3.2 if flashing else 2.0
        cx_mid = bx + bw * 0.5
        cy_mid = cy_box + bh * 0.5

        out.append(
            f'<g transform="translate({cx_mid:.1f},{cy_mid:.1f}) scale({sc:.3f}) translate({-cx_mid:.1f},{-cy_mid:.1f})">'
            f'<rect x="{bx + 3:.1f}" y="{cy_box + 4:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="9" fill="#000000" opacity="0.55"/>'
            f'<rect x="{bx:.1f}" y="{cy_box:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="9" '
            f'fill="{bg}" fill-opacity="0.94" stroke="{cor}" stroke-width="{stroke_w:.1f}"/>'
            f'<rect x="{bx + 2:.1f}" y="{cy_box + 4:.1f}" width="6" height="{bh - 8:.1f}" rx="3" fill="{cor}"/>'
            f'<text x="{bx + 18:.1f}" y="{cy_box + 28:.1f}" font-family="{FONT_MONO}" font-size="16" font-weight="800" fill="#CBD5E1">{_esc(lbl)}</text>'
            f'<text x="{bx + bw - 16:.1f}" y="{cy_box + 29:.1f}" text-anchor="end" font-family="{FONT_MONO}" font-size="21" font-weight="900" fill="{cor}">{_esc(val)}</text>'
            f'</g>'
        )
    out.append("</g>")
    return "".join(out)


# ---------------------------------------------------------------------------
# 2. Roleta Animada C1 ("PAISES TROCADOS" — ~6.5s de giro + zoom na Ember)
# ---------------------------------------------------------------------------

_C1_SWAPS: list[tuple[str, str, str, str, float, float]] = [
    # (ia_k, p1_cap, p2_cap, p2_country_id, t_start, t_end)
    ("sonnet", "br_tocantins_go", "ar_buenos_aires", "argentina", 0.04, 0.14),
    ("hydrogen", "bo_la_paz", "br_tocantins_go", "brasil", 0.10, 0.20),
    ("glm", "cl_santiago", "ve_caracas", "venezuela", 0.16, 0.26),
    ("deepseek", "ar_buenos_aires", "co_bogota", "colombia", 0.22, 0.32),
    ("qwen", "co_bogota", "pe_lima", "peru", 0.27, 0.36),
    ("inkling", "pe_lima", "bo_la_paz", "bolivia", 0.32, 0.40),
    ("ember", "ve_caracas", "cl_santiago", "chile", 0.38, 0.50),  # Ember por ultimo!
]


def render_c1_roleta_v2(
    topo: Any,
    mapa1: dict[str, Any],
    turn1_end: dict[str, Any],
    mapa2: dict[str, Any],
    turn2_start: dict[str, Any],
    t_norm: float,
    t_sec: float,
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Roleta C1: retratos saltam para os paises novos em ~6.5s; Ember cai por ultimo no Chile."""
    tn = _clamp(float(t_norm), 0.0, 1.0)
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    sa_cx = float(getattr(topo, "sa_cx", 720.0))
    sa_cy = float(getattr(topo, "sa_cy", 560.0))

    # Descobre quais paises ja trocaram para a cor da Partida 2 neste instante
    swapped_countries: set[str] = set()
    for _ia, _c1, _c2, cid, _ts, te in _C1_SWAPS:
        if tn >= te:
            swapped_countries.add(cid)

    # Camera: visao continental durante a roleta -> zoom suave para o Chile quando Ember pousa!
    chile_pt = centers.get("cl_santiago", (560.0, 740.0))
    zoom_p = _ease_in_out(_clamp((tn - 0.52) / 0.36, 0.0, 1.0))
    cam_cx = _lerp(sa_cx, chile_pt[0], 0.42 * zoom_p) + math.sin(t_sec * 0.9) * 6.0
    cam_cy = _lerp(sa_cy + 15.0, chile_pt[1], 0.42 * zoom_p) + math.cos(t_sec * 0.7) * 5.0
    zoom = _lerp(0.86, 1.24, zoom_p)
    view_cx = 640.0
    view_cy = 560.0
    tx = view_cx - cam_cx * zoom
    ty = view_cy - cam_cy * zoom

    nacoes1 = (mapa1 or {}).get("nacoes") or {}
    nacoes2 = (mapa2 or {}).get("nacoes") or {}
    provs1 = (turn1_end or {}).get("provincias") or {}
    provs2 = (turn2_start or {}).get("provincias") or {}

    parts = [_bg_war_room()]
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) scale({zoom:.4f})">')

    # Mapa real mudando de cor conforme cada pais recebe sua nova IA
    for pid, pstr in poly_strs.items():
        dono2 = (provs2.get(pid) or {}).get("dono") or ""
        if dono2 in swapped_countries:
            ia_k = ((nacoes2.get(dono2) or {}).get("ia_apelido") or "").lower()
            cor = _ia_info(ia_meta, ia_k)["cor"]
            op_p = "0.95"
        else:
            dono1 = (provs1.get(pid) or {}).get("dono") or dono2
            ia_k = ((nacoes1.get(dono1) or {}).get("ia_apelido") or "").lower()
            cor = _ia_info(ia_meta, ia_k)["cor"] if ia_k else "#334155"
            op_p = "0.52"
        stroke = "#C8D3DD" if ia_k == "deepseek" else "#0F172A"
        parts.append(f'<polygon points="{pstr}" fill="{cor}" fill-opacity="{op_p}" stroke="{stroke}" stroke-width="1.6"/>')

    # Aro de roleta girando no centro do mapa durante o sorteio
    if tn < 0.56:
        spin = (t_sec * 300.0) % 360.0
        op_r = _clamp((0.56 - tn) / 0.10, 0.0, 1.0)
        parts.append(
            f'<g transform="translate({sa_cx:.1f},{sa_cy:.1f}) rotate({spin:.1f})" opacity="{0.65 * op_r:.2f}">'
            f'<circle cx="0" cy="0" r="245" fill="none" stroke="#FBBF24" stroke-width="4" stroke-dasharray="28,18"/>'
            f'<circle cx="0" cy="0" r="195" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="14,22"/>'
            f'</g>'
        )

    # Retratos voando do pais antigo ao pais novo
    for idx, (ia_k, p1_cap, p2_cap, _cid, ts, te) in enumerate(_C1_SWAPS):
        pt0 = centers.get(p1_cap, (sa_cx, sa_cy))
        pt2 = centers.get(p2_cap, (sa_cx, sa_cy))
        mx = (pt0[0] + pt2[0]) * 0.5
        my = (pt0[1] + pt2[1]) * 0.5 - (95.0 if ia_k == "ember" else 55.0)
        cor_ia = _ia_vis_cor(ia_meta, ia_k)

        if tn < ts:
            cx_p, cy_p = pt0
            r_p = 21.0
            hl = False
        elif tn <= te:
            u = _ease_out((tn - ts) / max(0.01, te - ts))
            mu = 1.0 - u
            cx_p = mu * mu * pt0[0] + 2.0 * mu * u * mx + u * u * pt2[0]
            cy_p = mu * mu * pt0[1] + 2.0 * mu * u * my + u * u * pt2[1]
            r_p = 26.0 if ia_k == "ember" else 23.0
            hl = True
            # Rastro tracejado do salto
            parts.append(
                f'<path d="M{pt0[0]:.1f},{pt0[1]:.1f} Q{mx:.1f},{my:.1f} {pt2[0]:.1f},{pt2[1]:.1f}" '
                f'fill="none" stroke="{cor_ia}" stroke-width="3.5" stroke-dasharray="10,7" opacity="0.85"/>'
            )
        else:
            cx_p, cy_p = pt2
            if ia_k == "ember":
                since = tn - te
                bang = _ease_out_back(_clamp(since / 0.14, 0.0, 1.0))
                r_p = 32.0 * (0.85 + 0.15 * bang)
                hl = True
                # Onda de impacto vermelha quando Ember cai no Chile
                if since < 0.25:
                    sr = 28.0 + (since / 0.25) * 110.0
                    sop = max(0.0, 1.0 - since / 0.25)
                    parts.append(
                        f'<circle cx="{cx_p:.1f}" cy="{cy_p:.1f}" r="{sr:.1f}" fill="none" '
                        f'stroke="#EF4444" stroke-width="5.5" opacity="{sop:.2f}"/>'
                    )
            else:
                r_p = 22.0
                hl = False

        parts.append(_call_portrait(render_portrait_fn, ia_k, cx_p, cy_p, r_p, highlight=hl, ia_meta=ia_meta))
        # Brilho vermelho no olho/chama da Ember ao pousar no Chile
        if ia_k == "ember" and tn >= te:
            glint = 0.72 + 0.28 * math.sin(t_sec * 10.0)
            parts.append(
                f'<circle cx="{cx_p:.1f}" cy="{cy_p:.1f}" r="{r_p + 12:.1f}" fill="none" '
                f'stroke="#EF4444" stroke-width="4" opacity="{glint:.2f}"/>'
                f'<circle cx="{cx_p + 10:.1f}" cy="{cy_p - 6:.1f}" r="5.5" fill="#FEF08A" opacity="{glint:.2f}"/>'
            )

    parts.append("</g>")

    # Cabecalho claro no topo
    ember_landed = tn >= 0.48
    sub_txt = "A EMBER CAIU NO CHILE · O PAIS QUE COMEU O PRATA" if ember_landed else "ROLETA DA REVANCHE · CADA IA NUM PAIS NOVO"
    sub_cor = "#FCA5A5" if ember_landed else "#FBBF24"
    parts.append(
        '<rect x="0" y="0" width="1920" height="128" fill="#060D17" fill-opacity="0.92"/>'
        '<line x1="0" y1="128" x2="1920" y2="128" stroke="#1E293B" stroke-width="2"/>'
        f'<text x="960" y="66" text-anchor="middle" font-family="{FONT_SANS}" font-size="46" font-weight="900" '
        f'fill="#F8FAFC" letter-spacing="1.4">A REVANCHE: PAISES TROCADOS</text>'
        f'<text x="960" y="108" text-anchor="middle" font-family="{FONT_MONO}" font-size="22" font-weight="800" '
        f'fill="{sub_cor}">{_esc(sub_txt)}</text>'
    )

    # Coluna direita com a lista das 7 trocas acendendo na ordem (x=1230..1868)
    px0, py0, pw, rh, gap = 1230.0, 160.0, 636.0, 96.0, 14.0
    for idx, (ia_k, _p1, _p2, cid, ts, te) in enumerate(_C1_SWAPS):
        ry = py0 + idx * (rh + gap)
        locked = tn >= te
        moving = ts <= tn < te
        info = _ia_info(ia_meta, ia_k)
        cor_vis = _ia_vis_cor(ia_meta, ia_k)
        is_ember_end = ia_k == "ember" and locked
        bg = "#2A0D13" if is_ember_end else ("#111D30" if (locked or moving) else "#0A1220")
        brd = "#EF4444" if is_ember_end else (cor_vis if (locked or moving) else "#1E293B")
        op_card = 1.0 if (locked or moving) else 0.45
        p_label = COUNTRY_NAMES.get(cid, cid.upper()) if locked else ("SORTEANDO..." if moving else "AGUARDANDO")

        parts.append(
            f'<g opacity="{op_card:.2f}">'
            f'<rect x="{px0 + 4:.0f}" y="{ry + 5:.0f}" width="{pw:.0f}" height="{rh:.0f}" rx="14" fill="#000000" opacity="0.45"/>'
            f'<rect x="{px0:.0f}" y="{ry:.0f}" width="{pw:.0f}" height="{rh:.0f}" rx="14" '
            f'fill="{bg}" stroke="{brd}" stroke-width="{3.8 if is_ember_end else 2.2:.1f}"/>'
            + _call_portrait(render_portrait_fn, ia_k, px0 + 54.0, ry + rh * 0.5, 29.0, highlight=is_ember_end or moving, ia_meta=ia_meta)
            + f'<text x="{px0 + 104:.0f}" y="{ry + 42:.0f}" font-family="{FONT_SANS}" font-size="27" font-weight="900" fill="#F8FAFC">{_esc(info["nome"])}</text>'
            + f'<text x="{px0 + 104:.0f}" y="{ry + 74:.0f}" font-family="{FONT_MONO}" font-size="18" font-weight="700" fill="#94A3B8">NOVO PAIS</text>'
            + f'<text x="{px0 + pw - 26:.0f}" y="{ry + 58:.0f}" text-anchor="end" font-family="{FONT_MONO}" '
            f'font-size="26" font-weight="900" fill="{("#FCA5A5" if is_ember_end else (cor_vis if locked else "#64748B"))}">{_esc(p_label)}</text>'
            + '</g>'
        )

    return "".join(parts)


# ---------------------------------------------------------------------------
# 3. D17: Escudo Rachando em Buenos Aires (8 ondas -> quebra na 9a)
# ---------------------------------------------------------------------------


def render_cracking_shield_fx(
    cx: float,
    cy: float,
    t_action: float,
    t_sec: float,
) -> tuple[str, int]:
    """Desenha escudo azul sobre Buenos Aires ganhando rachaduras 1..8 e estilhacando na 9a onda."""
    ta = _clamp(float(t_action), 0.0, 1.0)
    # 9 ondas distribuidas entre 0.06 e 0.86
    waves_hit = 0
    for wi in range(1, 10):
        t_hit = 0.06 + (wi - 1) * 0.092
        if ta >= t_hit:
            waves_hit = wi

    shattered = ta >= 0.82
    waves_held = 9 if shattered else min(8, waves_hit)

    parts = [f'<g transform="translate({cx:.1f},{cy:.1f})">']

    # Setas vermelhas atacando o escudo em ritmo de marcha a cada onda ativa
    wave_origins = [
        (-74, -46), (-86, -12), (-70, 32), (-36, 62), (10, 68),
        (54, 48), (68, 6), (48, -42), (-18, -68),
    ]
    for wi in range(1, 10):
        t_start = 0.01 + (wi - 1) * 0.092
        t_hit = t_start + 0.055
        if ta < t_start or ta > t_hit + 0.09:
            continue
        ox, oy = wave_origins[(wi - 1) % len(wave_origins)]
        if ta < t_hit:
            u = (ta - t_start) / max(1e-4, t_hit - t_start)
            ax = _lerp(ox, ox * 0.24, u)
            ay = _lerp(oy, oy * 0.24, u)
            ang = math.degrees(math.atan2(-oy, -ox))
            parts.append(
                f'<line x1="{ox:.1f}" y1="{oy:.1f}" x2="{ax:.1f}" y2="{ay:.1f}" '
                f'stroke="#EF4444" stroke-width="5.0" stroke-linecap="round" opacity="0.90"/>'
                f'<g transform="translate({ax:.1f},{ay:.1f}) rotate({ang:.1f})">'
                f'<polygon points="10,0 -6,-6 -6,6" fill="#FCA5A5" stroke="#7F1D1D" stroke-width="1.2"/></g>'
            )
        else:
            # Impacto/faisca na borda do escudo
            dt_i = (ta - t_hit) / 0.09
            r_sp = 10.0 + dt_i * 26.0
            op_sp = max(0.0, 1.0 - dt_i)
            parts.append(
                f'<circle cx="{ox * 0.24:.1f}" cy="{oy * 0.24:.1f}" r="{r_sp:.1f}" fill="none" '
                f'stroke="#FDE047" stroke-width="3.2" opacity="{op_sp:.2f}"/>'
            )

    crack_paths = [
        "M-14,-22 L-4,-8 L-10,2",
        "M15,-20 L4,-6 L12,4",
        "M0,-28 L-2,-10 L6,0",
        "M-20,-4 L-6,6 L-12,18",
        "M20,-2 L6,8 L14,20",
        "M-6,12 L2,22 L-2,30",
        "M-16,-14 L4,-14 L18,-6",
        "M-14,14 L0,10 L16,14",
    ]

    if not shattered:
        # Pulso elastico a cada golpe segurado
        hit_bump = 0.0
        if waves_hit >= 1:
            t_last_hit = 0.06 + (waves_hit - 1) * 0.092
            dt_h = ta - t_last_hit
            if 0.0 <= dt_h <= 0.08:
                hit_bump = math.sin((dt_h / 0.08) * math.pi) * 0.14
        sc = 1.28 + hit_bump
        parts.append(f'<g transform="scale({sc:.3f})">')
        parts.append(
            '<circle cx="0" cy="0" r="34" fill="#1D4ED8" fill-opacity="0.18" stroke="#60A5FA" stroke-width="2.2" stroke-dasharray="6,4"/>'
            '<path d="M-24,-26 L0,-34 L24,-26 L22,6 C20,24 8,34 0,38 C-8,34 -20,24 -22,6 Z" '
            'fill="#1E40AF" fill-opacity="0.92" stroke="#93C5FD" stroke-width="3.2" stroke-linejoin="round"/>'
            '<path d="M-16,-19 L0,-25 L16,-19 L14,5 C13,18 5,25 0,28 C-5,25 -13,18 -14,5 Z" '
            'fill="#3B82F6" fill-opacity="0.55"/>'
        )
        # Rachaduras acumuladas 1..8
        for ci in range(min(8, waves_hit)):
            parts.append(
                f'<path d="{crack_paths[ci]}" fill="none" stroke="#F8FAFC" stroke-width="2.4" stroke-linecap="round"/>'
                f'<path d="{crack_paths[ci]}" fill="none" stroke="#FDE047" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>'
            )
        parts.append("</g>")

        if waves_hit >= 1:
            badge_txt = f"SEGUROU {min(8, waves_hit)}/8"
            parts.append(
                f'<rect x="-66" y="-76" width="132" height="28" rx="8" fill="#0B1322" fill-opacity="0.95" stroke="#60A5FA" stroke-width="2.2"/>'
                f'<text x="0" y="-57" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" font-weight="900" fill="#93C5FD">{badge_txt}</text>'
            )
    else:
        # 9a ONDA: Cacos do escudo voando + coroa dourada caindo!
        sk = _clamp((ta - 0.82) / 0.18, 0.0, 1.0)
        e_sk = _ease_out(sk)
        op_sh = max(0.0, 1.0 - sk * 0.35)
        shards = [
            (-12, -18, -42, -32, -45),
            (14, -16, 46, -28, 52),
            (-18, 4, -52, 8, -68),
            (18, 6, 48, 12, 60),
            (-8, 22, -30, 44, -38),
            (10, 22, 34, 42, 42),
            (0, 0, -6, 52, 95),
        ]
        for x0, y0, dx, dy, rot in shards:
            parts.append(
                f'<polygon points="-8,-6 9,-4 6,8 -7,6" fill="#3B82F6" stroke="#BAE6FD" stroke-width="1.6" '
                f'transform="translate({x0 + dx * e_sk:.1f},{y0 + dy * e_sk:.1f}) rotate({rot * e_sk:.1f})" opacity="{op_sh:.2f}"/>'
            )
        # Coroa dourada tombando
        parts.append(
            f'<g transform="translate({12 * e_sk:.1f},{-16 + 34 * e_sk:.1f}) rotate({42 * e_sk:.1f})" opacity="{max(0.25, 1.0 - sk * 0.5):.2f}">'
            f'<polygon points="-14,8 -16,-8 -6,0 0,-12 6,0 16,-8 14,8" fill="#FBBF24" stroke="#78350F" stroke-width="1.8"/>'
            f'</g>'
            f'<circle cx="0" cy="0" r="{24 + 68 * e_sk:.1f}" fill="none" stroke="#EF4444" stroke-width="4.5" opacity="{max(0.0, 1.0 - sk):.2f}"/>'
            f'<rect x="-92" y="-76" width="184" height="30" rx="8" fill="#7F1D1D" fill-opacity="0.96" stroke="#FCA5A5" stroke-width="2.4"/>'
            f'<text x="0" y="-56" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" font-weight="900" fill="#FEF2F2">9A ONDA · CAIU!</text>'
        )

    parts.append("</g>")
    return "".join(parts), waves_held


# ---------------------------------------------------------------------------
# 4. E1 Plot Twist: Ranking por Provincias Gira -> Placar Oficial por Pontos
# ---------------------------------------------------------------------------

_E1_PROVINCES_BOARD = [
    ("ember", "Chile", "15 prov", 15, "#E0262B"),
    ("hydrogen", "Brasil", "14 prov", 14, "#19A974"),
    ("glm", "Venezuela", "9 prov", 9, "#8E4DE0"),
    ("qwen", "Peru", "5 prov", 5, "#F2802E"),
    ("deepseek", "Colombia", "3 prov", 3, "#C8D3DD"),
    ("inkling", "Bolivia", "2 prov", 2, "#22C7D6"),
    ("sonnet", "Argentina", "0 prov", 0, "#3D7BF2"),
]

_E1_POINTS_BOARD = [
    ("hydrogen", "Brasil", "17.181 pts", 17181, "#19A974"),
    ("glm", "Venezuela", "11.203 pts", 11203, "#8E4DE0"),
    ("ember", "Chile", "10.654 pts", 10654, "#E0262B"),
    ("qwen", "Peru", "8.090 pts", 8090, "#F2802E"),
    ("deepseek", "Colombia", "8.028 pts", 8028, "#C8D3DD"),
    ("inkling", "Bolivia", "5.849 pts", 5849, "#22C7D6"),
    ("sonnet", "Argentina", "0 pts", 0, "#3D7BF2"),
]


def render_e1_placar_flip(
    t_norm: float,
    t_sec: float,
    topo: Any,
    mapa: dict[str, Any],
    turn_end: dict[str, Any],
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Ranking por provincias gira em placa para revelar o placar por pontos + Ember cai 15 -> 3o."""
    tn = _clamp(float(t_norm), 0.0, 1.0)
    parts = [
        _bg_war_room(),
        _map_backdrop_svg(topo, turn_end, ia_meta, mapa, focus_pids=["cl_santiago", "br_tocantins_go"], t_sec=t_sec, opacity=0.22, pulse_targets=False),
    ]

    # Cabecalho
    parts.append(
        '<text x="960" y="72" text-anchor="middle" font-family="' + FONT_SANS + '" font-size="46" font-weight="900" '
        'fill="#F8FAFC" letter-spacing="1.2">NAO GANHA QUEM TEM MAIS TERRA</text>'
        '<text x="960" y="112" text-anchor="middle" font-family="' + FONT_MONO + '" font-size="22" font-weight="800" '
        'fill="#FBBF24">PONTOS = PROVINCIAS + ECONOMIA + TROPAS + PREDIOS</text>'
    )

    # Giro da placa do ranking: cresce (0..0.16), gira 180 deg em 0.34..0.48
    flip_start, flip_end = 0.34, 0.48
    flip_mid = 0.41
    is_points = tn >= flip_mid
    if flip_start <= tn <= flip_end:
        fu = (tn - flip_start) / (flip_end - flip_start)
        scale_x = max(0.05, abs(math.cos(fu * math.pi)))
    else:
        scale_x = 1.0

    grow = _ease_out_back(_clamp(tn / 0.14, 0.0, 1.0), s=1.2)
    px0, py0, pw, ph = 86.0, 154.0, 1080.0, 810.0
    pcx, pcy = px0 + pw * 0.5, py0 + ph * 0.5

    rows = _E1_POINTS_BOARD if is_points else _E1_PROVINCES_BOARD
    max_val = 17181.0 if is_points else 15.0
    board_title = "PLACAR OFICIAL POR PONTOS (VENCEDOR)" if is_points else "RANKING POR PROVINCIAS (APARENTE)"
    board_cor = "#19A974" if is_points else "#E0262B"

    parts.append(
        f'<g transform="translate({pcx:.1f},{pcy:.1f}) scale({scale_x * (0.85 + 0.15 * grow):.4f},{0.85 + 0.15 * grow:.4f}) translate({-pcx:.1f},{-pcy:.1f})">'
        f'<rect x="{px0 + 8:.0f}" y="{py0 + 10:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" fill="#000000" opacity="0.55"/>'
        f'<rect x="{px0:.0f}" y="{py0:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" fill="#0B1322" stroke="{board_cor}" stroke-width="3.5"/>'
        f'<rect x="{px0:.0f}" y="{py0:.0f}" width="{pw:.0f}" height="68" rx="20" fill="#111D30"/>'
        f'<text x="{px0 + 34:.0f}" y="{py0 + 44:.0f}" font-family="{FONT_MONO}" font-size="25" font-weight="900" fill="{board_cor}">{_esc(board_title)}</text>'
    )

    for idx, (ia_k, country, val_str, num_val, cor_b) in enumerate(rows):
        ry = py0 + 88.0 + idx * 98.0
        is_ember = ia_k == "ember"
        is_hydro = ia_k == "hydrogen"
        row_bg = "#2A0D13" if is_ember else ("#0A2E20" if (is_points and is_hydro) else "#0F172A")
        row_brd = "#EF4444" if is_ember else ("#34D399" if (is_points and is_hydro) else "#1E293B")
        bar_w = max(8.0, (pw - 640.0) * (num_val / max_val))
        info = _ia_info(ia_meta, ia_k)
        parts.append(
            f'<rect x="{px0 + 24:.0f}" y="{ry:.0f}" width="{pw - 48:.0f}" height="82" rx="14" '
            f'fill="{row_bg}" stroke="{row_brd}" stroke-width="{3.0 if (is_ember or (is_points and is_hydro)) else 1.5:.1f}"/>'
            f'<text x="{px0 + 58:.0f}" y="{ry + 51:.0f}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="30" font-weight="900" fill="{("#FBBF24" if idx == 0 else "#94A3B8")}">{idx + 1}o</text>'
            + _call_portrait(render_portrait_fn, ia_k, px0 + 126.0, ry + 41.0, 27.0, highlight=(idx == 0 or is_ember), ia_meta=ia_meta)
            + f'<text x="{px0 + 174:.0f}" y="{ry + 38:.0f}" font-family="{FONT_SANS}" font-size="26" font-weight="900" fill="#F8FAFC">{_esc(info["nome"])}</text>'
            + f'<text x="{px0 + 174:.0f}" y="{ry + 66:.0f}" font-family="{FONT_MONO}" font-size="17" font-weight="700" fill="#94A3B8">{_esc(country)}</text>'
            + f'<rect x="{px0 + 380:.0f}" y="{ry + 28:.0f}" width="{bar_w:.1f}" height="24" rx="7" fill="{cor_b}" opacity="0.88"/>'
            + f'<text x="{px0 + pw - 44:.0f}" y="{ry + 51:.0f}" text-anchor="end" font-family="{FONT_MONO}" '
            f'font-size="27" font-weight="900" fill="{cor_b}">{_esc(val_str)}</text>'
        )
    parts.append("</g>")

    # Painel direito Hero: "15" despencando -> "3o" para a Ember
    hx0, hy0, hw, hh = 1208.0, 154.0, 628.0, 810.0
    hcx = hx0 + hw * 0.5
    parts.append(
        f'<rect x="{hx0 + 8:.0f}" y="{hy0 + 10:.0f}" width="{hw:.0f}" height="{hh:.0f}" rx="20" fill="#000000" opacity="0.55"/>'
        f'<rect x="{hx0:.0f}" y="{hy0:.0f}" width="{hw:.0f}" height="{hh:.0f}" rx="20" '
        f'fill="#0B1322" stroke="{("#FBBF24" if is_points else "#E0262B")}" stroke-width="3.5"/>'
        + _call_portrait(render_portrait_fn, "ember", hcx, hy0 + 104.0, 56.0, highlight=True, ia_meta=ia_meta)
        + f'<text x="{hcx:.0f}" y="{hy0 + 196:.0f}" text-anchor="middle" font-family="{FONT_SANS}" font-size="34" font-weight="900" fill="#F8FAFC">EMBER · CHILE</text>'
    )

    if tn < flip_mid:
        parts.append(
            f'<text x="{hcx:.0f}" y="{hy0 + 470:.0f}" text-anchor="middle" font-family="{FONT_SANS}" '
            f'font-size="250" font-weight="900" fill="#EF4444">15</text>'
            f'<text x="{hcx:.0f}" y="{hy0 + 550:.0f}" text-anchor="middle" font-family="{FONT_MONO}" '
            f'font-size="28" font-weight="900" fill="#FCA5A5">PROVINCIAS · MAIS QUE TODOS</text>'
        )
    else:
        drop_u = _clamp((tn - flip_mid) / 0.18, 0.0, 1.0)
        drop_e = _ease_out(drop_u)
        # O 15 cai e some em vermelho
        if drop_u < 0.85:
            op15 = max(0.0, 1.0 - drop_u / 0.85)
            dy15 = drop_e * 230.0
            parts.append(
                f'<text x="{hcx:.0f}" y="{hy0 + 470 + dy15:.0f}" text-anchor="middle" font-family="{FONT_SANS}" '
                f'font-size="{250 - 90 * drop_e:.0f}" font-weight="900" fill="#EF4444" opacity="{op15:.2f}">15</text>'
            )
        # "3o" entra com soco!
        bang3 = _ease_out_back(drop_u)
        sc3 = _lerp(1.48, 1.0, drop_e)
        parts.append(
            f'<g transform="translate({hcx:.0f},{hy0 + 420:.0f}) scale({sc3:.3f})" opacity="{_clamp(drop_u * 2.5, 0.0, 1.0):.2f}">'
            f'<text x="0" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="250" font-weight="900" fill="#FBBF24">3o</text>'
            f'</g>'
            f'<rect x="{hx0 + 44:.0f}" y="{hy0 + 585:.0f}" width="{hw - 88:.0f}" height="68" rx="12" fill="#7F1D1D" stroke="#FCA5A5" stroke-width="2.5"/>'
            f'<text x="{hcx:.0f}" y="{hy0 + 629:.0f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="25" font-weight="900" fill="#FEF2F2">15 PROVINCIAS = 3o LUGAR</text>'
            f'<rect x="{hx0 + 44:.0f}" y="{hy0 + 675:.0f}" width="{hw - 88:.0f}" height="64" rx="12" fill="#064E3B" stroke="#34D399" stroke-width="2.2"/>'
            f'<text x="{hcx:.0f}" y="{hy0 + 716:.0f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="23" font-weight="900" fill="#ECFDF5">CAMPEAO HYDROGEN · 17.181 PTS</text>'
        )

    return "".join(parts)


# ---------------------------------------------------------------------------
# 5. E2: 5 Placas Douradas de Premio (uma por vez com retrato e numero)
# ---------------------------------------------------------------------------

_E2_AWARDS = [
    (0.03, "CAMPEAO DA IDA", "glm", "14.867 PTS", "CHILE · 14 PROVINCIAS", "#8E4DE0"),
    (0.20, "CAMPEAO DA REVANCHE", "hydrogen", "17.181 PTS", "BRASIL · 25.093 TROPAS · 0 TRAICOES", "#19A974"),
    (0.38, "TRAIDORA DA TEMPORADA", "ember", "5 DE 5", "CHILE · ACORDOS RASGADOS", "#E0262B"),
    (0.56, "MURALHA", "sonnet", "8 ATAQUES", "ARGENTINA · BUENOS AIRES SEGUROU", "#3D7BF2"),
    (0.74, "PLANO ECONOMICO DO ANO", "deepseek", "-98 OURO", "PLANO: SAQUEAR NO T25", "#C8D3DD"),
]


def _svg_trophy_badge(cx: float, cy: float, cor: str) -> str:
    return (
        f'<g transform="translate({cx:.1f},{cy:.1f})">'
        f'<path d="M-16,-16 L16,-16 L12,4 C10,12 -10,12 -12,4 Z" fill="{cor}" stroke="#FEF08A" stroke-width="2"/>'
        f'<path d="M-16,-12 C-24,-12 -24,0 -13,2" fill="none" stroke="#FEF08A" stroke-width="2"/>'
        f'<path d="M16,-12 C24,-12 24,0 13,2" fill="none" stroke="#FEF08A" stroke-width="2"/>'
        f'<rect x="-4" y="10" width="8" height="10" fill="#FEF08A"/>'
        f'<rect x="-12" y="18" width="24" height="6" rx="2" fill="#FBBF24"/>'
        f'</g>'
    )


def render_e2_premios_placas(
    t_norm: float,
    t_sec: float,
    topo: Any,
    mapa: dict[str, Any],
    turn_end: dict[str, Any],
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """E2: cinco placas douradas entrando uma por vez com retrato e numero."""
    tn = _clamp(float(t_norm), 0.0, 1.0)
    parts = [
        _bg_war_room(),
        _map_backdrop_svg(topo, turn_end, ia_meta, mapa, focus_pids=None, t_sec=t_sec, opacity=0.18, pulse_targets=False),
        f'<text x="960" y="84" text-anchor="middle" font-family="{FONT_SANS}" font-size="52" font-weight="900" '
        f'fill="#FBBF24" letter-spacing="2.0">PREMIOS DA TEMPORADA</text>'
        f'<text x="960" y="124" text-anchor="middle" font-family="{FONT_MONO}" font-size="22" font-weight="700" '
        f'fill="#CBD5E1">RESUMO OFICIAL DAS DUAS PARTIDAS</text>',
    ]

    slots = [
        (64.0, 160.0),
        (672.0, 160.0),
        (1280.0, 160.0),
        (368.0, 548.0),
        (976.0, 548.0),
    ]
    pw, ph = 576.0, 356.0

    for idx, (t_in, title, ia_k, big_num, sub, accent) in enumerate(_E2_AWARDS):
        if tn < t_in:
            continue
        u = _clamp((tn - t_in) / 0.10, 0.0, 1.0)
        sc = _lerp(0.80, 1.0, _ease_out_back(u))
        op = _clamp(u / 0.5, 0.0, 1.0)
        x, y = slots[idx]
        cx_c, cy_c = x + pw * 0.5, y + ph * 0.5
        flash = _clamp(1.0 - (tn - t_in) / 0.14, 0.0, 1.0)
        info = _ia_info(ia_meta, ia_k)
        brd_w = 3.2 + 3.5 * flash

        parts.append(
            f'<g transform="translate({cx_c:.1f},{cy_c:.1f}) scale({sc:.3f}) translate({-cx_c:.1f},{-cy_c:.1f})" opacity="{op:.2f}">'
            f'<rect x="{x + 8:.0f}" y="{y + 10:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" fill="#000000" opacity="0.55"/>'
            f'<rect x="{x:.0f}" y="{y:.0f}" width="{pw:.0f}" height="{ph:.0f}" rx="20" fill="#0B1322" stroke="#FBBF24" stroke-width="{brd_w:.1f}"/>'
            f'<rect x="{x + 12:.0f}" y="{y + 12:.0f}" width="{pw - 24:.0f}" height="48" rx="12" fill="{accent}" fill-opacity="0.22" stroke="{accent}" stroke-width="1.6"/>'
            f'<text x="{cx_c:.0f}" y="{y + 44:.0f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="21" font-weight="900" fill="#FEF08A">{_esc(title)}</text>'
            + _call_portrait(render_portrait_fn, ia_k, x + 98.0, y + 148.0, 48.0, highlight=(flash > 0.1), ia_meta=ia_meta)
            + _svg_trophy_badge(x + pw - 58.0, y + 142.0, "#FBBF24")
            + f'<text x="{x + 172:.0f}" y="{y + 142:.0f}" font-family="{FONT_SANS}" font-size="34" font-weight="900" fill="#F8FAFC">{_esc(info["nome"])}</text>'
            + f'<text x="{x + 172:.0f}" y="{y + 178:.0f}" font-family="{FONT_MONO}" font-size="18" font-weight="700" fill="{accent}">RECORDE DA TEMPORADA</text>'
            + f'<text x="{cx_c:.0f}" y="{y + 270:.0f}" text-anchor="middle" font-family="{FONT_SANS}" font-size="66" font-weight="900" fill="#FBBF24">{_esc(big_num)}</text>'
            + f'<text x="{cx_c:.0f}" y="{y + 322:.0f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="19" font-weight="800" fill="#E2E8F0">{_esc(sub)}</text>'
            + '</g>'
        )

    return "".join(parts)


# ---------------------------------------------------------------------------
# 6. E3: Tela Dividida IDA x REVANCHE + Pergunta Grande Sem Corte de Texto
# ---------------------------------------------------------------------------


def render_e3_ida_vs_revanche(
    t_norm: float,
    t_sec: float,
    matches: dict[int, dict[str, Any]],
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """E3: Comparacao ida x revanche com setas de Bogota e Montevideu acendendo juntas + pergunta final."""
    tn = _clamp(float(t_norm), 0.0, 1.0)
    m1, m2 = matches[1], matches[2]
    topo = m1["topo"]
    centers: dict[str, tuple[float, float]] = getattr(topo, "centers", {}) or {}
    poly_strs: dict[str, str] = getattr(topo, "poly_points_str", {}) or {}

    parts = [
        _bg_war_room(),
        f'<text x="960" y="64" text-anchor="middle" font-family="{FONT_SANS}" font-size="42" font-weight="900" '
        f'fill="#F8FAFC" letter-spacing="1.2">MUDOU A IA · NAO MUDOU O MAPA</text>',
    ]

    bog_prog = _clamp((tn - 0.12) / 0.18, 0.0, 1.0)
    mvd_prog = _clamp((tn - 0.36) / 0.18, 0.0, 1.0)

    def draw_half_map(
        box: tuple[float, float, float, float],
        clip_id: str,
        match_obj: dict[str, Any],
        title: str,
        bog_cor: str,
        mvd_cor: str,
    ) -> str:
        bx, by, bw, bh = box
        mapa = match_obj["mapa"]
        turn = match_obj["turnos"][-1]
        nacoes_meta = (mapa or {}).get("nacoes") or {}
        t_nacoes = (turn or {}).get("nacoes") or {}
        provs_st = (turn or {}).get("provincias") or {}

        b = getattr(topo, "map_bounds", (120.0, 90.0, 1360.0, 1020.0))
        mw = max(100.0, float(b[2] - b[0]))
        mh = max(100.0, float(b[3] - b[1]))
        sc = min((bw - 40.0) / mw, (bh - 80.0) / mh) * (1.01 + 0.02 * math.sin(t_sec * 0.7))
        mx0 = (b[0] + b[2]) * 0.5
        my0 = (b[1] + b[3]) * 0.5
        tx = bx + bw * 0.5 - mx0 * sc
        ty = by + 54.0 + (bh - 60.0) * 0.5 - my0 * sc

        out = [
            f'<defs><clipPath id="{clip_id}"><rect x="{bx:.0f}" y="{by:.0f}" width="{bw:.0f}" height="{bh:.0f}" rx="18"/></clipPath></defs>',
            f'<rect x="{bx + 6:.0f}" y="{by + 8:.0f}" width="{bw:.0f}" height="{bh:.0f}" rx="18" fill="#000000" opacity="0.50"/>',
            f'<rect x="{bx:.0f}" y="{by:.0f}" width="{bw:.0f}" height="{bh:.0f}" rx="18" fill="#071320" stroke="#334155" stroke-width="2.5"/>',
            f'<g clip-path="url(#{clip_id})">',
            f'<g transform="translate({tx:.2f},{ty:.2f}) scale({sc:.4f})">',
        ]
        for pid, pstr in poly_strs.items():
            dono = (provs_st.get(pid) or {}).get("dono") or ""
            ia_k = ((t_nacoes.get(dono) or {}).get("ia_apelido") or (nacoes_meta.get(dono) or {}).get("ia_apelido") or "").lower()
            cor = _ia_info(ia_meta, ia_k)["cor"] if ia_k else "#334155"
            out.append(f'<polygon points="{pstr}" fill="{cor}" stroke="#0F172A" stroke-width="1.6"/>')

        def draw_sync_arrow(de_pid: str, para_pid: str, cor_a: str, prog: float, tag: str) -> None:
            if prog <= 0.01 or de_pid not in centers or para_pid not in centers:
                return
            x0, y0 = centers[de_pid]
            x2, y2 = centers[para_pid]
            ex = _lerp(x0, x2, _ease_out(prog))
            ey = _lerp(y0, y2, _ease_out(prog))
            pulse = 1.0 + 0.16 * math.sin(t_sec * 6.0)
            out.append(
                f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="#020617" stroke-width="14" stroke-linecap="round" opacity="0.75"/>'
                f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{cor_a}" stroke-width="8" stroke-linecap="round"/>'
                f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="{22.0 * pulse:.1f}" fill="none" stroke="#FDE047" stroke-width="4.5" opacity="0.92"/>'
                f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="11" fill="#FDE047" stroke="#0F172A" stroke-width="2.2"/>'
            )
            if prog >= 0.8:
                out.append(
                    f'<rect x="{x2 - 68:.1f}" y="{y2 - 52:.1f}" width="136" height="28" rx="7" fill="#070D17" fill-opacity="0.94" stroke="#FDE047" stroke-width="2"/>'
                    f'<text x="{x2:.1f}" y="{y2 - 33:.1f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" font-weight="900" fill="#F8FAFC">{_esc(tag)}</text>'
                )

        draw_sync_arrow("ve_caracas", "co_bogota", bog_cor, bog_prog, "BOGOTA")
        draw_sync_arrow("cl_santiago", "cs_montevideu", mvd_cor, mvd_prog, "MONTEVIDEU")
        out.append("</g>")
        # Barra de titulo da metade
        out.append(
            f'<rect x="{bx:.0f}" y="{by:.0f}" width="{bw:.0f}" height="48" fill="#070D17" fill-opacity="0.92"/>'
            f'<text x="{bx + bw * 0.5:.0f}" y="{by + 33:.0f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="22" font-weight="900" fill="#FBBF24">{_esc(title)}</text>'
            '</g>'
        )
        return "".join(out)

    parts.append(draw_half_map((48.0, 86.0, 888.0, 628.0), "e3_ida_clip", m1, "PARTIDA 1 · IDA", "#E0262B", "#8E4DE0"))
    parts.append(draw_half_map((984.0, 86.0, 888.0, 628.0), "e3_rev_clip", m2, "PARTIDA 2 · REVANCHE", "#8E4DE0", "#E0262B"))

    # Duas linhas limpas dentro da margem (ZERO corte lateral)
    op_l1 = _clamp((tn - 0.14) / 0.10, 0.0, 1.0)
    op_l2 = _clamp((tn - 0.38) / 0.10, 0.0, 1.0)
    parts.append(
        f'<g opacity="{op_l1:.2f}">'
        f'<rect x="180" y="732" width="1560" height="58" rx="12" fill="#0B1322" stroke="#E0262B" stroke-width="2.6"/>'
        f'<text x="960" y="772" text-anchor="middle" font-family="{FONT_SANS}" font-size="34" font-weight="900" fill="#F8FAFC">A VENEZUELA TOMOU BOGOTA</text>'
        f'</g>'
        f'<g opacity="{op_l2:.2f}">'
        f'<rect x="180" y="802" width="1560" height="58" rx="12" fill="#0B1322" stroke="#FBBF24" stroke-width="2.6"/>'
        f'<text x="960" y="842" text-anchor="middle" font-family="{FONT_SANS}" font-size="34" font-weight="900" fill="#FDE047">O CHILE TERMINOU EM MONTEVIDEU</text>'
        f'</g>'
    )

    # Pergunta final grande e centralizada com margem segura
    op_q = _clamp((tn - 0.62) / 0.12, 0.0, 1.0)
    if op_q > 0.01:
        sc_q = _lerp(0.88, 1.0, _ease_out_back(op_q))
        parts.append(
            f'<g transform="translate(960,962) scale({sc_q:.3f}) translate(-960,-962)" opacity="{op_q:.2f}">'
            f'<rect x="120" y="878" width="1680" height="166" rx="20" fill="#091526" stroke="#FBBF24" stroke-width="4.2"/>'
            f'<text x="960" y="962" text-anchor="middle" font-family="{FONT_SANS}" font-size="60" font-weight="900" fill="#F8FAFC" letter-spacing="1.0">QUEM VOCE QUER VER DE CHILE?</text>'
            f'<text x="960" y="1014" text-anchor="middle" font-family="{FONT_MONO}" font-size="25" font-weight="800" fill="#FBBF24">COMENTA AI EMBAIXO PRO PROXIMO EPISODIO</text>'
            f'</g>'
        )

    return "".join(parts)


# ---------------------------------------------------------------------------
# 7. B16 Podio da Ida + Telas dado_grande com numero gigante + mapa real
# ---------------------------------------------------------------------------

_B16_STANDINGS = [
    ("glm", "Chile", 14867, 14, "#8E4DE0"),
    ("sonnet", "Brasil", 10800, 10, "#3D7BF2"),
    ("inkling", "Peru", 10680, 9, "#22C7D6"),
    ("qwen", "Colombia", 9606, 7, "#F2802E"),
    ("hydrogen", "Bolivia", 9207, 6, "#19A974"),
    ("deepseek", "Argentina", 4911, 2, "#C8D3DD"),
    ("ember", "Venezuela", 0, 0, "#E0262B"),
]


def render_b16_podio_v2(
    t_norm: float,
    t_sec: float,
    topo: Any,
    mapa: dict[str, Any],
    turn_end: dict[str, Any],
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """B16: Podio animado da Partida 1 (GLM 1o, Sonnet 2o, Inkling 3o) + placar completo."""
    tn = _clamp(float(t_norm), 0.0, 1.0)
    parts = [
        _bg_war_room(),
        _map_backdrop_svg(topo, turn_end, ia_meta, mapa, focus_pids=["cl_santiago", "cs_montevideu", "br_tocantins_go"], t_sec=t_sec, opacity=0.25, pulse_targets=False),
        f'<text x="960" y="82" text-anchor="middle" font-family="{FONT_SANS}" font-size="50" font-weight="900" fill="#F8FAFC">PLACAR FINAL DA PARTIDA 1</text>'
        f'<text x="960" y="122" text-anchor="middle" font-family="{FONT_MONO}" font-size="23" font-weight="800" fill="#FBBF24">GLM CAMPEAO · 14 PROVINCIAS · 14.867 PONTOS</text>',
    ]

    # Podio top-3 no centro (ordem visual: 2o esquerda, 1o centro, 3o direita)
    podium_cfg = [
        (1, "sonnet", "2o LUGAR", "10.800 PTS", 350.0, 210.0, 0.14),
        (0, "glm", "1o CAMPEAO", "14.867 PTS", 770.0, 290.0, 0.04),
        (2, "inkling", "3o LUGAR", "10.680 PTS", 1190.0, 175.0, 0.24),
    ]
    base_y = 650.0
    col_w = 380.0
    for _rank, ia_k, tag, pts_s, x, h_col, t_in in podium_cfg:
        u = _ease_out_back(_clamp((tn - t_in) / 0.16, 0.0, 1.0), s=1.3)
        h_cur = h_col * u
        y_top = base_y - h_cur
        cor_v = _ia_vis_cor(ia_meta, ia_k)
        info = _ia_info(ia_meta, ia_k)
        parts.append(
            f'<rect x="{x:.0f}" y="{y_top:.1f}" width="{col_w:.0f}" height="{h_cur:.1f}" rx="16" fill="#0B1322" stroke="{cor_v}" stroke-width="3.5"/>'
            f'<rect x="{x + 12:.0f}" y="{y_top + 12:.1f}" width="{col_w - 24:.0f}" height="44" rx="10" fill="{cor_v}" fill-opacity="0.24"/>'
            f'<text x="{x + col_w * 0.5:.0f}" y="{y_top + 42:.1f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="22" font-weight="900" fill="#F8FAFC">{tag}</text>'
            + _call_portrait(render_portrait_fn, ia_k, x + col_w * 0.5, y_top - 48.0, 44.0, highlight=(ia_k == "glm"), ia_meta=ia_meta)
            + f'<text x="{x + col_w * 0.5:.0f}" y="{y_top + 96:.1f}" text-anchor="middle" font-family="{FONT_SANS}" font-size="32" font-weight="900" fill="#F8FAFC">{_esc(info["nome"])}</text>'
            + f'<text x="{x + col_w * 0.5:.0f}" y="{y_top + 138:.1f}" text-anchor="middle" font-family="{FONT_MONO}" font-size="26" font-weight="900" fill="{cor_v}">{pts_s}</text>'
        )

    # Faixa inferior com todos os 7 colocados
    parts.append('<rect x="80" y="690" width="1760" height="270" rx="18" fill="#070D17" fill-opacity="0.90" stroke="#1E293B" stroke-width="2"/>')
    for idx, (ia_k, country, pts, prov, cor_b) in enumerate(_B16_STANDINGS):
        cx_i = 120.0 + idx * 246.0
        info = _ia_info(ia_meta, ia_k)
        parts.append(
            f'<rect x="{cx_i:.0f}" y="716" width="228" height="218" rx="14" fill="#0F172A" stroke="{cor_b}" stroke-width="2"/>'
            + _call_portrait(render_portrait_fn, ia_k, cx_i + 114.0, 768.0, 30.0, highlight=(idx == 0), ia_meta=ia_meta)
            + f'<text x="{cx_i + 114:.0f}" y="828" text-anchor="middle" font-family="{FONT_SANS}" font-size="23" font-weight="900" fill="#F8FAFC">{idx + 1}o {_esc(info["nome"])}</text>'
            + f'<text x="{cx_i + 114:.0f}" y="858" text-anchor="middle" font-family="{FONT_MONO}" font-size="16" font-weight="700" fill="#94A3B8">{_esc(country)} · {prov} prov</text>'
            + f'<text x="{cx_i + 114:.0f}" y="902" text-anchor="middle" font-family="{FONT_MONO}" font-size="24" font-weight="900" fill="{cor_b}">{_fmt_pt(pts)} pts</text>'
        )

    return "".join(parts)


_DADO_SPECS: dict[str, tuple[int, str, str, str, str]] = {
    # scene_id -> (target_num, prefix, subtitulo, cor, rota_info)
    "B6": (437, "", "ULTIMA PROVINCIA DA VENEZUELA · ANTIOQUIA · TURNO 13", "#E0262B", "Ember"),
    "B13": (-98, "", "OURO DA ARGENTINA NO TURNO 25 · 1 PROVINCIA RESTANTE", "#EF4444", "DeepSeek"),
    "D9": (5222, "", "BAIXAS CHILENAS NAS TRES INVASOES · PEDIDO RECUSADO", "#3D7BF2", "Sonnet"),
    "D16": (-5843, "", "CARIBE COLOMBIANO · MAIOR BATALHA DA REVANCHE · T23", "#8E4DE0", "DeepSeek x GLM"),
}


def render_dado_grande_v2(
    scene: dict[str, Any],
    local_f: int,
    fps: int,
    matches: dict[int, dict[str, Any]],
    coreo: dict[str, Any] | None,
    render_portrait_fn: Callable[..., str] | None,
    ia_meta: dict[str, dict[str, str]] | None,
) -> str:
    """Telas dado_grande com mapa real em foco ao fundo e numero gigante (~340px)."""
    sid = scene["id"]
    dur = max(1, int(scene["dur"]))
    t_norm = _clamp(local_f / float(dur), 0.0, 1.0)
    t_sec = local_f / max(1.0, float(fps or 30))
    coreo = coreo or {}

    if sid == "B16":
        m1 = matches[1]
        return render_b16_podio_v2(t_norm, t_sec, m1["topo"], m1["mapa"], m1["turnos"][-1], render_portrait_fn, ia_meta)

    partida = int(coreo.get("partida") or (2 if sid.startswith("D") else 1))
    m = matches[partida]
    topo = m["topo"]
    t_idx = int(_clamp(int(coreo.get("turno") or 1), 0, len(m["turnos"]) - 1))
    turn = m["turnos"][t_idx]
    focus_pids = [a["pid"] for a in (coreo.get("alvos_taticos") or []) if isinstance(a, dict) and a.get("pid")]

    spec = _DADO_SPECS.get(sid)
    if spec:
        target_val, _pref, sub_txt, cor, actor = spec
    else:
        m_num = re.search(r'"([^"]+)"', scene.get("tela", {}).get("desc", ""))
        raw_s = m_num.group(1) if m_num else "0"
        digits = re.sub(r"[^0-9-]", "", raw_s)
        target_val = int(digits) if digits and digits != "-" else 0
        sub_txt = scene.get("titulo", "").upper()
        cor = "#FBBF24"
        actor = ""

    # Contagem rapida 0 -> target nos primeiros 0.7s (~21 frames) com soco elastico
    cnt_u = _clamp(t_sec / 0.70, 0.0, 1.0)
    cur_val = int(round(target_val * _ease_out(cnt_u)))
    num_str = _fmt_pt(cur_val)
    bang_sc = 1.0 + 0.10 * max(0.0, 1.0 - abs(t_sec - 0.70) / 0.18) if 0.55 <= t_sec <= 0.90 else 1.0

    parts = [
        _bg_war_room(),
        _map_backdrop_svg(topo, turn, ia_meta, m["mapa"], focus_pids=focus_pids, t_sec=t_sec, opacity=0.40, pulse_targets=True),
        # Vinheta suave para contraste absoluto do numero gigante
        '<rect x="0" y="0" width="1920" height="1080" fill="#040C18" opacity="0.45"/>',
    ]

    # Numero gigante ocupando metade da altura (~340px), centralizado acima da faixa do balao
    parts.append(
        f'<g transform="translate(960,410) scale({bang_sc:.3f}) translate(-960,-410)">'
        f'<text x="965" y="492" text-anchor="middle" font-family="{FONT_SANS}" font-size="330" font-weight="900" '
        f'fill="#000000" opacity="0.55">{_esc(num_str)}</text>'
        f'<text x="960" y="485" text-anchor="middle" font-family="{FONT_SANS}" font-size="330" font-weight="900" '
        f'fill="{cor}" stroke="#0B1322" stroke-width="6" paint-order="stroke">{_esc(num_str)}</text>'
        f'</g>'
        f'<rect x="260" y="554" width="1400" height="60" rx="14" fill="#070D17" fill-opacity="0.92" stroke="{cor}" stroke-width="2.5"/>'
        f'<text x="960" y="593" text-anchor="middle" font-family="{FONT_MONO}" font-size="25" font-weight="900" fill="#F8FAFC">{_esc(sub_txt)}</text>'
    )
    if actor:
        parts.append(
            f'<text x="960" y="218" text-anchor="middle" font-family="{FONT_MONO}" font-size="24" font-weight="800" fill="#FBBF24">{_esc(actor.upper())}</text>'
        )

    return "".join(parts)
