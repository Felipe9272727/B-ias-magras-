#!/usr/bin/env python3
"""
Motor Visual Vetorial 2.5D Premium (v3) — Robo YouTuber Mecha + Portaria TNMN
Renderizacao SVG 1.1 otimizada para librsvg / rsvg-convert (1280x720 @ 30fps).

Upgrade v3 (Artista Senior Mecha — estilo Astro Bot / Baymax / Clank 2.5D):
  - Anatomia Mecha 100% conectada e proporcional:
    Ombreira deltoide arredondada -> Braco superior cilindrico sombreado ->
    Junta esferica de cotovelo -> Antebraco chanfrado com anel LED ->
    Pulso metalico -> Mao mecha robusta estilizada (3 dedos arredondados + polegar).
  - Poses naturais e coerentes por emocao:
    * cyan   : postura natural de streamer (bracos relaxados rumo a mesa/teclado)
    * green  : aceno limpo articulado no cotovelo + joinha mecha robusto
    * yellow : esquerdo relaxado + direito dobrado em diagonal apoiado sob o queixo
               (sem jamais tampar a boca LED fechada!)
    * red    : ombros encolhidos + cotovelos abertos em V anatomico + maos segurando
               as laterais do headset tremendo
    * purple : postura levemente desalinhada/torta com tremor glitch sutil
  - REGRA SAGRADA mantida: Boca LED 100% FECHADA (nunca abre, apenas brilha/pulsa).
  - ZERO emojis no SVG. 100% compativel com SVG 1.1 / rsvg-convert.
"""
from __future__ import annotations

import html
import math
import os

W, H = 1280, 720
CAM_W, CAM_H = 480.0, 270.0  # 16:9 exato -> zero distorcao fullscreen ou canto

# Paleta por emocao: (main, dark, highlight, glow, label)
EMOTION_PALETTES = {
    "cyan":   ("#00f0ff", "#0284c7", "#cffafe", "#06b6d4", "MODO: CONFIANTE"),
    "green":  ("#22ff88", "#15803d", "#dcfce7", "#10b981", "MODO: HYPE"),
    "yellow": ("#ffd426", "#b45309", "#fef9c3", "#f59e0b", "MODO: SUSPEITO"),
    "red":    ("#ff264d", "#991b1b", "#ffe4e6", "#ef4444", "MODO: PANICO!!"),
    "purple": ("#c084fc", "#6b21a8", "#f3e8ff", "#a855f7", "MODO: BUGADO"),
}

# Compatibilidade simples (main, dark, hi)
EMOTION_COLORS = {k: (v[0], v[1], v[2]) for k, v in EMOTION_PALETTES.items()}


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return lo if v < lo else (hi if v > hi else v)


def ease_in_out(t: float) -> float:
    t = clamp(t)
    return t * t * (3.0 - 2.0 * t)


def ease_out_cubic(t: float) -> float:
    t = clamp(t)
    return 1.0 - (1.0 - t) ** 3


def ease_out_back(t: float) -> float:
    t = clamp(t)
    c1 = 1.70158
    c3 = c1 + 1.0
    return 1.0 + c3 * ((t - 1.0) ** 3) + c1 * ((t - 1.0) ** 2)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * clamp(t)


def get_palette(emotion: str) -> tuple[str, str, str, str, str]:
    return EMOTION_PALETTES.get(emotion, EMOTION_PALETTES["cyan"])


def wrap_caption(text: str, max_chars: int = 48) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > max_chars:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines[:3]


def dynamic_caption(t: float, manifest: dict, fallback_cap: str) -> str:
    """Divide falas longas em blocos curtos sincronizados no tempo."""
    for ev in manifest.get("events", []):
        if ev["start"] <= t <= ev["end"]:
            cid = ev["id"]
            frac = (t - ev["start"]) / max(0.01, ev["end"] - ev["start"])
            if cid == "felipe_2":
                return (
                    "É galera, cansei de fazer vídeo... as views só caindo."
                    if frac < 0.48
                    else "Então hoje não sou eu que vou gravar... vai ser o Opus."
                )
            if cid == "robo_intro":
                return (
                    "E AÍ PESSOAL, tudo beleza? Aqui é o Opus e hoje o Felipe tirou folga!"
                    if frac < 0.46
                    else "Já senta o dedo no like que a gente vai zerar That's Not My Neighbor sem deixar UM monstro passar!"
                )
            if cid == "robo_susp":
                return (
                    "Opa, calma lá... na foto o Carlos tem um bigode de respeito..."
                    if frac < 0.48
                    else "Cadê o bigode, meu consagrado? E por que você tá com DOIS narizes?!"
                )
            if cid == "robo_panic":
                return (
                    "OH LOUCO, ELE BATEU NO VIDRO!! D.D.D., ALÔ?!"
                    if frac < 0.45
                    else "Vem buscar esse bichão agora que eu não fui programado pra isso!!"
                )
            if cid == "felipe_sigh":
                return ""
            return ev.get("screen", fallback_cap)
    return fallback_cap


def _hex_points(cx: float, cy: float, r: float) -> str:
    pts = []
    for i in range(6):
        ang = math.radians(60 * i - 30)
        pts.append(f"{cx + r * math.cos(ang):.1f},{cy + r * math.sin(ang):.1f}")
    return " ".join(pts)


# =============================================================================
# LEGENDAS & SELOS DRAMATICOS (POLIMENTO YOUTUBE PREMIUM)
# =============================================================================
def svg_caption(text: str, speaker: str | None, emotion: str) -> str:
    if not text:
        return ""
    if os.environ.get("TNMN_LAYOUT") == "side":
        return _svg_caption_side(text, speaker, emotion)
    lines = wrap_caption(text, 48)
    col_main, col_dark, col_hi, _, _ = get_palette(emotion)
    is_robo = speaker == "robo"
    accent = col_main if is_robo else "#38bdf8"
    tag = "OPUS" if is_robo else "FELIPE"
    tag_bg = col_dark if is_robo else "#1e3a8a"
    tag_stroke = col_hi if is_robo else "#93c5fd"
    tag_w = 132 if is_robo else 108

    n = len(lines)
    y_base = 666 if n == 1 else (642 if n == 2 else 618)
    box_h = 54 if n == 1 else (84 if n == 2 else 112)
    box_y = y_base - 34
    max_len = max(len(ln) for ln in lines)
    box_w = min(1152.0, max(460.0, max_len * 15.6 + 112.0))
    box_x = (W - box_w) / 2.0

    parts = [
        '<g class="caption">',
        f'  <rect x="{box_x + 3:.1f}" y="{box_y + 6:.1f}" width="{box_w:.1f}" height="{box_h:.1f}" rx="16" fill="#000000" fill-opacity="0.58"/>',
        f'  <rect x="{box_x:.1f}" y="{box_y:.1f}" width="{box_w:.1f}" height="{box_h:.1f}" rx="16" fill="#070b15" fill-opacity="0.90" stroke="{accent}" stroke-width="2.4"/>',
        f'  <line x1="{box_x + 20:.1f}" y1="{box_y + 2.5:.1f}" x2="{box_x + box_w - 20:.1f}" y2="{box_y + 2.5:.1f}" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5" stroke-linecap="round"/>',
        f'  <rect x="{box_x + 8:.1f}" y="{box_y + 12:.1f}" width="4" height="{box_h - 24:.1f}" rx="2" fill="{accent}" fill-opacity="0.88"/>',
        f'  <rect x="{box_x + 20:.1f}" y="{box_y - 16:.1f}" width="{tag_w}" height="26" rx="8" fill="{tag_bg}" stroke="{tag_stroke}" stroke-width="1.6"/>',
        f'  <circle cx="{box_x + 34:.1f}" cy="{box_y - 3:.1f}" r="3.6" fill="{accent}"/>',
        f'  <text x="{box_x + 20 + (tag_w + 10) / 2.0:.1f}" y="{box_y + 1.5:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#ffffff" letter-spacing="1.1">{tag}</text>',
    ]
    for idx, line in enumerate(lines):
        ly = y_base + idx * 29
        esc = html.escape(line)
        parts.append(
            f'  <text x="{W / 2.0:.1f}" y="{ly:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="23.5" fill="#020617" stroke="#020617" stroke-width="5.5" stroke-linejoin="round">{esc}</text>'
            f'  <text x="{W / 2.0:.1f}" y="{ly:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="23.5" fill="#f8fafc">{esc}</text>'
        )
    parts.append("</g>")
    return "\n".join(parts)


def _svg_caption_side(text: str, speaker: str | None, emotion: str) -> str:
    """Legenda na coluna da esquerda (o palco do jogo fica em x=320..1280 e nada tapa o jogo)."""
    lines = wrap_caption(text, 19)[:4]
    col_main, col_dark, col_hi, _, _ = get_palette(emotion)
    n = len(lines)
    lh = 31.0
    box_x, box_w = 14.0, 292.0
    box_h = 30.0 + n * lh
    box_y = 470.0 - box_h / 2.0
    parts = [
        '<g class="caption">',
        f'  <rect x="{box_x + 3:.1f}" y="{box_y + 5:.1f}" width="{box_w:.1f}" height="{box_h:.1f}" rx="14" fill="#000000" fill-opacity="0.55"/>',
        f'  <rect x="{box_x:.1f}" y="{box_y:.1f}" width="{box_w:.1f}" height="{box_h:.1f}" rx="14" fill="#070b15" fill-opacity="0.92" stroke="{col_main}" stroke-width="2.4"/>',
        f'  <rect x="{box_x + 18:.1f}" y="{box_y - 15:.1f}" width="80" height="26" rx="8" fill="{col_dark}" stroke="{col_hi}" stroke-width="1.6"/>',
        f'  <text x="{box_x + 58:.1f}" y="{box_y + 2.5:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#ffffff" letter-spacing="1.1">OPUS</text>',
    ]
    for idx, line in enumerate(lines):
        ly = box_y + 38.0 + idx * lh
        esc = html.escape(line)
        parts.append(
            f'  <text x="{box_x + box_w / 2:.1f}" y="{ly:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="25" fill="#020617" stroke="#020617" stroke-width="5.5" stroke-linejoin="round">{esc}</text>'
            f'  <text x="{box_x + box_w / 2:.1f}" y="{ly:.1f}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="25" fill="#f8fafc">{esc}</text>'
        )
    parts.append("</g>")
    return "\n".join(parts)


def _svg_stamp(stamp_text: str, stamp_p: float) -> str:
    if not stamp_text or stamp_p <= 0.01:
        return ""
    esc = html.escape(stamp_text)
    sw = min(510.0, max(310.0, len(stamp_text) * 15.8 + 94.0))
    cx = min(1240.0 - sw / 2.0, 980.0)
    cy = 88.0
    half_w = sw / 2.0
    return f'''
    <g transform="translate({cx:.1f}, {cy:.1f}) rotate(3.2) scale({stamp_p:.3f})">
      <rect x="{-half_w + 5:.1f}" y="-28" width="{sw:.1f}" height="64" rx="13" fill="#000000" fill-opacity="0.52"/>
      <rect x="{-half_w:.1f}" y="-33" width="{sw:.1f}" height="64" rx="13" fill="#7f1d1d" fill-opacity="0.96" stroke="#fecaca" stroke-width="3.6"/>
      <rect x="{-half_w + 6:.1f}" y="-27" width="{sw - 12:.1f}" height="52" rx="9" fill="none" stroke="#f87171" stroke-width="1.5" stroke-dasharray="6,4" stroke-opacity="0.72"/>
      <polygon points="{-half_w + 18:.1f},-13 {-half_w + 30:.1f},-13 {-half_w + 22:.1f},11 {-half_w + 10:.1f},11" fill="#fca5a5" fill-opacity="0.32"/>
      <polygon points="{half_w - 22:.1f},-13 {half_w - 10:.1f},-13 {half_w - 18:.1f},11 {half_w - 30:.1f},11" fill="#fca5a5" fill-opacity="0.32"/>
      <text x="0" y="7" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="21" fill="#090d18" stroke="#090d18" stroke-width="3" stroke-linejoin="round" letter-spacing="1.1">{esc}</text>
      <text x="0" y="7" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="21" fill="#ffffff" letter-spacing="1.1">{esc}</text>
    </g>'''


# =============================================================================
# DEFS DA WEBCAM + MATERIAIS MECHA 2.5D (ASTRO BOT / BAYMAX / CLANK)
# =============================================================================
def _build_webcam_defs(
    emotion: str,
    amp: float,
    wb_x: float,
    wb_y: float,
    wb_w: float,
    wb_h: float,
    wb_rx: float,
) -> str:
    col_main, col_dark, col_hi, col_glow, _ = get_palette(emotion)
    return f'''
    <filter id="roboGlow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="4.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="roboGlowSoft" x="-55%" y="-55%" width="210%" height="210%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="wbShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <clipPath id="wbClip">
      <rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}"/>
    </clipPath>
    <clipPath id="roboVisorClip">
      <path d="M 186,74 L 294,74 C 304,74 308,82 308,94 L 306,118 C 305,129 298,134 286,134 L 194,134 C 182,134 175,129 174,118 L 172,94 C 172,82 176,74 186,74 Z"/>
    </clipPath>
    <clipPath id="roboMouthClip">
      <rect x="193" y="141" width="94" height="22" rx="9"/>
    </clipPath>
    <clipPath id="roboHelmetClip">
      <path d="M 164,90 C 164,60 186,52 240,52 C 294,52 316,60 316,90 L 314,136 C 313,162 290,171 240,171 C 190,171 167,162 166,136 Z"/>
    </clipPath>
    <linearGradient id="wbWallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070b17"/>
      <stop offset="55%" stop-color="#10172b"/>
      <stop offset="100%" stop-color="#080c18"/>
    </linearGradient>
    <radialGradient id="wbGlowLeft" cx="18%" cy="28%" r="55%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0.34"/>
      <stop offset="60%" stop-color="#4c1d95" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#070b17" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="wbGlowRight" cx="84%" cy="28%" r="55%">
      <stop offset="0%" stop-color="{col_main}" stop-opacity="{0.30 + amp * 0.12:.3f}"/>
      <stop offset="60%" stop-color="{col_dark}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#070b17" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="wbBacklight" cx="50%" cy="56%" r="44%">
      <stop offset="0%" stop-color="{col_main}" stop-opacity="{0.26 + amp * 0.16:.3f}"/>
      <stop offset="58%" stop-color="{col_dark}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#070b17" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="roboShellGrad" x1="0.15" y1="0.0" x2="0.88" y2="1.0">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="32%" stop-color="#e2e8f0"/>
      <stop offset="72%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#8b9bb4"/>
    </linearGradient>
    <linearGradient id="roboShellDark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <!-- Sombreamento cilindrico 3D verdadeiro para bracos e antebracos em espaco local -->
    <linearGradient id="roboCylGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#e8eef5"/>
      <stop offset="58%" stop-color="#cbd5e1"/>
      <stop offset="86%" stop-color="#8b9bb4"/>
      <stop offset="100%" stop-color="#5a6b84"/>
    </linearGradient>
    <!-- Ombreira deltoide ceramica com brilho suave -->
    <linearGradient id="roboPauldronGrad" x1="0.18" y1="0.0" x2="0.82" y2="1.0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#edf2f7"/>
      <stop offset="68%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#7c8ea6"/>
    </linearGradient>
    <!-- Mao mecha robusta com volume 2.5D -->
    <linearGradient id="roboHandPalmGrad" x1="0.15" y1="0.05" x2="0.88" y2="0.95">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="36%" stop-color="#e8eef5"/>
      <stop offset="74%" stop-color="#c2cfdf"/>
      <stop offset="100%" stop-color="#7c8ea6"/>
    </linearGradient>
    <!-- Dedos mecha arredondados -->
    <linearGradient id="roboFingerGrad" x1="0.1" y1="0.0" x2="0.9" y2="1.0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <!-- Junta esferica metalica de cotovelo/pulso/ombro -->
    <radialGradient id="roboJointGrad" cx="36%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="45%" stop-color="#334155"/>
      <stop offset="85%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0b1120"/>
    </radialGradient>
    <linearGradient id="roboRimRight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{col_main}" stop-opacity="0"/>
      <stop offset="74%" stop-color="{col_main}" stop-opacity="0"/>
      <stop offset="93%" stop-color="{col_main}" stop-opacity="{0.42 + amp * 0.25:.3f}"/>
      <stop offset="100%" stop-color="{col_hi}" stop-opacity="{0.75 + amp * 0.22:.3f}"/>
    </linearGradient>
    <linearGradient id="roboRimLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.52"/>
      <stop offset="14%" stop-color="#9333ea" stop-opacity="0.16"/>
      <stop offset="32%" stop-color="#9333ea" stop-opacity="0"/>
      <stop offset="100%" stop-color="#9333ea" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="roboVisorGrad" cx="50%" cy="46%" r="64%">
      <stop offset="0%" stop-color="#111d33"/>
      <stop offset="68%" stop-color="#070c17"/>
      <stop offset="100%" stop-color="#03050a"/>
    </radialGradient>
    <radialGradient id="roboVisorScreenGlow" cx="50%" cy="54%" r="55%">
      <stop offset="0%" stop-color="{col_glow}" stop-opacity="{0.26 + amp * 0.16:.3f}"/>
      <stop offset="100%" stop-color="#03050a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="roboJacketGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#29354d"/>
      <stop offset="50%" stop-color="#161f33"/>
      <stop offset="100%" stop-color="#0a0f1d"/>
    </linearGradient>
    <linearGradient id="roboChairGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22283d"/>
      <stop offset="50%" stop-color="#141828"/>
      <stop offset="100%" stop-color="#0b0e1a"/>
    </linearGradient>
    <linearGradient id="roboPlayGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="48%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="roboMicGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="40%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d18"/>
    </linearGradient>'''


# =============================================================================
# SISTEMA ANATOMICO MECHA v3: OMBROS -> BRACO SUPERIOR -> COTOVELO -> ANTEBRACO -> MAOS
# =============================================================================
def _draw_upper_arm_segment(
    sx: float,
    sy: float,
    ex: float,
    ey: float,
) -> str:
    """Braco superior cilindrico com volume 3D conectando exatamente o ombro ao cotovelo."""
    dx, dy = ex - sx, ey - sy
    dist = max(12.0, math.hypot(dx, dy))
    ang = math.degrees(math.atan2(dy, dx))
    r1 = 10.6
    r2 = 8.8
    # Traco do segmento interno escuro + blindagem cilindrica branca (encaixe limpo no ombro e cotovelo)
    arm_start = 5.5
    arm_end = max(arm_start + 8.0, dist - 8.0)
    rod_end = max(arm_start + 4.0, dist - 5.5)
    return f'''
    <g transform="translate({sx:.1f}, {sy:.1f}) rotate({ang:.2f})">
      <!-- Haste estrutural interna entre ombro e cotovelo -->
      <line x1="0" y1="0" x2="{rod_end:.1f}" y2="0" stroke="#090d18" stroke-width="15.0" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="{rod_end:.1f}" y2="0" stroke="#334155" stroke-width="10.0" stroke-linecap="round"/>
      <!-- Blindagem cilindrica do braco superior -->
      <path d="M {arm_start:.1f},{-r1:.1f}
               C {arm_start + (arm_end - arm_start) * 0.35:.1f},{-r1 - 1.1:.1f} {arm_end - 8:.1f},{-r2 - 0.4:.1f} {arm_end:.1f},{-r2:.1f}
               Q {arm_end + 2.8:.1f},0 {arm_end:.1f},{r2:.1f}
               C {arm_end - 8:.1f},{r2 + 0.4:.1f} {arm_start + (arm_end - arm_start) * 0.35:.1f},{r1 + 1.1:.1f} {arm_start:.1f},{r1:.1f}
               Q {arm_start - 3.2:.1f},0 {arm_start:.1f},{-r1:.1f} Z"
            fill="url(#roboCylGrad)" stroke="#090d18" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Brilho especular cilindrico superior -->
      <line x1="{arm_start + 5:.1f}" y1="{-r1 * 0.48:.1f}" x2="{arm_end - 4:.1f}" y2="{-r2 * 0.46:.1f}"
            stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.68"/>
      <!-- Sombra de volume inferior -->
      <line x1="{arm_start + 5:.1f}" y1="{r1 * 0.56:.1f}" x2="{arm_end - 4:.1f}" y2="{r2 * 0.54:.1f}"
            stroke="#334155" stroke-width="2.2" stroke-linecap="round" opacity="0.34"/>
    </g>'''


def _draw_shoulder_pauldron(
    sx: float,
    sy: float,
    ex: float,
    ey: float,
    side: int,
    col_main: str,
    col_hi: str,
) -> str:
    """
    Ombreira deltoide arredondada 2.5D (estilo Astro Bot / Baymax) ancorada no ombro.
    side = -1 (esquerda da imagem), +1 (direita da imagem).
    Acompanham suavemente o angulo do braco superior.
    """
    # Calcula o quanto o braco levantou para inclinar a ombreira anatomicamente
    dx = (ex - sx) * side  # positivo = para fora
    dy = ey - sy           # positivo = para baixo, negativo = para cima
    arm_ang = math.degrees(math.atan2(dy, max(1.0, dx)))  # ~55 deg relaxado, ~12 deg em panico
    # Relaxado ~55 deg -> tilt 0; levantado ~12 deg -> ombreira ergue -16 deg (espelhado pelo side)
    lift_deg = clamp((55.0 - arm_ang) / 48.0, -0.35, 1.0) * (-18.0) * side
    return f'''
    <g transform="translate({sx:.1f}, {sy:.1f}) rotate({lift_deg:.1f}) scale({side}, 1)">
      <!-- Soquete esferico escuro do ombro conectado ao tronco -->
      <circle cx="-4" cy="2" r="13.5" fill="url(#roboJointGrad)" stroke="#090d18" stroke-width="2.6"/>
      <!-- Domo deltoide metalico esculpido e arredondado -->
      <path d="M -14,-10
               C -8,-19 8,-19 16,-9
               C 22,-1 21,11 13,16
               C 6,13 -5,11 -13,12
               C -18,6 -18,-3 -14,-10 Z"
            fill="url(#roboPauldronGrad)" stroke="#090d18" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- Brilho especular no topo do deltoide -->
      <path d="M -8,-11 C -1,-15 8,-13 13,-7" fill="none" stroke="#ffffff" stroke-width="3.0" stroke-linecap="round" opacity="0.78"/>
      <!-- Sombra de chanfro na base da ombreira -->
      <path d="M -11,8 C -3,6 6,8 13,12" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/>
      <!-- Filete LED de emocao integrado na ombreira -->
      <path d="M -6,-1 Q 4,-3 12,2" fill="none" stroke="{col_main}" stroke-width="2.8" stroke-linecap="round" filter="url(#roboGlow)"/>
      <path d="M -5,-1 Q 4,-3 11,2" fill="none" stroke="{col_hi}" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>
    </g>'''


def _draw_elbow_joint(ex: float, ey: float, col_main: str) -> str:
    """Junta esferica metalica de cotovelo com pino central e chanfro 3D."""
    return f'''
    <g transform="translate({ex:.1f}, {ey:.1f})">
      <circle cx="0" cy="0" r="11.2" fill="url(#roboJointGrad)" stroke="#090d18" stroke-width="2.6"/>
      <circle cx="0" cy="0" r="7.4" fill="none" stroke="#64748b" stroke-width="1.3" opacity="0.7"/>
      <circle cx="0" cy="0" r="4.0" fill="#94a3b8" stroke="#0f172a" stroke-width="1.4"/>
      <circle cx="-1.3" cy="-1.3" r="1.4" fill="#ffffff" opacity="0.85"/>
      <circle cx="0" cy="0" r="1.6" fill="{col_main}" opacity="0.55"/>
    </g>'''


def _draw_forearm_segment(
    ex: float,
    ey: float,
    wx: float,
    wy: float,
    col_main: str,
    col_hi: str,
    draw_wrist_ball: bool = True,
) -> str:
    """Antebraco mecha chanfrado e afunilado com anel LED da emocao + pulso metalico."""
    dx, dy = wx - ex, wy - ey
    dist = max(14.0, math.hypot(dx, dy))
    ang = math.degrees(math.atan2(dy, dx))
    r_elb = 10.2
    r_mid = 11.4
    r_wri = 8.4
    f_start = 8.0
    f_end = max(f_start + 10.0, dist - 4.5)
    f_len = f_end - f_start
    cuff_x = f_start + f_len * 0.74
    cuff_w = 5.2
    wrist_svg = ""
    if draw_wrist_ball:
        wrist_svg = f'''
      <!-- Pulso metalico articulado -->
      <circle cx="{dist:.1f}" cy="0" r="6.8" fill="url(#roboJointGrad)" stroke="#090d18" stroke-width="2.2"/>
      <circle cx="{dist - 1.2:.1f}" cy="-1.6" r="1.8" fill="#cbd5e1" opacity="0.55"/>'''

    return f'''
    <g transform="translate({ex:.1f}, {ey:.1f}) rotate({ang:.2f})">
      <!-- Eixo interno do antebraco (sem cobrir o pino central do cotovelo!) -->
      <line x1="7.0" y1="0" x2="{dist:.1f}" y2="0" stroke="#090d18" stroke-width="14.2" stroke-linecap="round"/>
      <line x1="7.0" y1="0" x2="{dist:.1f}" y2="0" stroke="#334155" stroke-width="9.2" stroke-linecap="round"/>
      <!-- Manopla / Antebraco chanfrado com volume 3D -->
      <path d="M {f_start:.1f},{-r_elb:.1f}
               C {f_start + f_len * 0.28:.1f},{-r_mid:.1f} {f_start + f_len * 0.68:.1f},{-r_wri - 1.4:.1f} {f_end:.1f},{-r_wri:.1f}
               Q {f_end + 2.8:.1f},0 {f_end:.1f},{r_wri:.1f}
               C {f_start + f_len * 0.68:.1f},{r_wri + 1.4:.1f} {f_start + f_len * 0.28:.1f},{r_mid:.1f} {f_start:.1f},{r_elb:.1f}
               Q {f_start - 2.4:.1f},0 {f_start:.1f},{-r_elb:.1f} Z"
            fill="url(#roboCylGrad)" stroke="#090d18" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Linha sutil de chanfro longitudinal -->
      <line x1="{f_start + 5:.1f}" y1="-1.5" x2="{cuff_x - 3:.1f}" y2="-1.2"
            stroke="#64748b" stroke-width="1.2" opacity="0.48"/>
      <!-- Brilho especular superior -->
      <line x1="{f_start + 5:.1f}" y1="{-r_elb * 0.54:.1f}" x2="{f_end - 5:.1f}" y2="{-r_wri * 0.50:.1f}"
            stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.72"/>
      <!-- Sombra de volume inferior -->
      <line x1="{f_start + 5:.1f}" y1="{r_elb * 0.58:.1f}" x2="{f_end - 5:.1f}" y2="{r_wri * 0.54:.1f}"
            stroke="#334155" stroke-width="2.2" stroke-linecap="round" opacity="0.34"/>
      <!-- Anel LED luminoso na cor da emocao -->
      <rect x="{cuff_x:.1f}" y="{-(r_wri + 0.6):.1f}" width="{cuff_w:.1f}" height="{(r_wri + 0.6) * 2:.1f}" rx="2.5"
            fill="#0f172a" stroke="#090d18" stroke-width="1.4"/>
      <rect x="{cuff_x + 0.9:.1f}" y="{-(r_wri - 0.8):.1f}" width="{cuff_w - 1.8:.1f}" height="{(r_wri - 0.8) * 2:.1f}" rx="1.6"
            fill="{col_main}" filter="url(#roboGlow)"/>
      <rect x="{cuff_x + 1.8:.1f}" y="{-(r_wri - 2.2):.1f}" width="1.6" height="{(r_wri - 2.2) * 2:.1f}" rx="0.8"
            fill="{col_hi}" opacity="0.9"/>
      {wrist_svg}
    </g>'''


# =============================================================================
# MAOS MECHA ESTILIZADAS (3 DEDOS ARREDONDADOS + POLEGAR — ZERO PALMAS CHAPADAS!)
# =============================================================================
def _svg_hand_wave(col_main: str, col_hi: str) -> str:
    """Mao aberta acenando (lado esquerdo da imagem): 3 dedos robustos arredondados + polegar interno."""
    return f'''
    <g>
      <!-- 3 Dedos mecha arredondados, robustos e bem sombreados (em leque natural) -->
      <!-- Dedo externo -->
      <g transform="translate(-10.5, -18.5) rotate(-17)">
        <rect x="-4.4" y="-17.5" width="8.8" height="20.0" rx="4.4" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
        <path d="M -3.2,-7.5 Q 0,-6.0 3.2,-7.5" fill="none" stroke="#64748b" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="-1.3" cy="-12.5" rx="1.5" ry="3.2" fill="#ffffff" opacity="0.72"/>
      </g>
      <!-- Dedo medio (mais alto) -->
      <g transform="translate(0.0, -21.0) rotate(0)">
        <rect x="-4.6" y="-20.0" width="9.2" height="22.5" rx="4.6" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
        <path d="M -3.4,-8.5 Q 0,-7.0 3.4,-8.5" fill="none" stroke="#64748b" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="-1.4" cy="-14.2" rx="1.6" ry="3.6" fill="#ffffff" opacity="0.76"/>
      </g>
      <!-- Dedo indicador (interno) -->
      <g transform="translate(10.5, -18.5) rotate(14)">
        <rect x="-4.5" y="-18.5" width="9.0" height="21.0" rx="4.5" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
        <path d="M -3.3,-8.0 Q 0,-6.5 3.3,-8.0" fill="none" stroke="#64748b" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="-1.3" cy="-13.0" rx="1.5" ry="3.3" fill="#ffffff" opacity="0.74"/>
      </g>

      <!-- Polegar robusto interno (anatomicamente correto para palma voltada a camera) -->
      <g transform="translate(12.5, -7.5) rotate(40)">
        <rect x="-4.6" y="-14.5" width="9.2" height="17.5" rx="4.6" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
        <path d="M -3.2,-5.5 Q 0,-4.2 3.2,-5.5" fill="none" stroke="#64748b" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="-1.2" cy="-9.8" rx="1.5" ry="2.8" fill="#ffffff" opacity="0.72"/>
      </g>

      <!-- Palma mecha organica/arredondada (NUNCA retangulo chapado!) -->
      <path d="M -11.5,1.5
               C -16.0,-2.5 -16.8,-13.0 -13.0,-19.2
               C -9.2,-23.6 9.2,-23.6 13.0,-19.2
               C 16.8,-13.0 16.0,-2.5 11.5,1.5
               C 7.5,4.8 -7.5,4.8 -11.5,1.5 Z"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Sombra suave na base da palma -->
      <path d="M -11.5,-1.5 Q 0,3.2 11.5,-1.5" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" opacity="0.42"/>
      <!-- Brilho suave no topo da palma -->
      <path d="M -9.5,-18.0 Q 0,-20.5 9.5,-18.0" fill="none" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round" opacity="0.68"/>
      <!-- Emissor circular luminoso no centro da palma -->
      <circle cx="0" cy="-9.5" r="6.2" fill="#1e293b" stroke="#090d18" stroke-width="1.6"/>
      <circle cx="0" cy="-9.5" r="4.1" fill="{col_main}" filter="url(#roboGlow)"/>
      <circle cx="-1.1" cy="-10.6" r="1.5" fill="{col_hi}" opacity="0.92"/>
    </g>'''


def _svg_hand_thumbs_up(col_main: str, col_hi: str) -> str:
    """Joinha mecha robusto e bem sombreado (3 dedos dobrados + polegar forte erguido)."""
    return f'''
    <g>
      <!-- Polegar mecha robusto e levemente curvado para cima -->
      <path d="M -10.5,-10.5
               C -13.2,-22.0 -8.5,-35.5 -0.8,-36.0
               C 6.5,-36.5 9.2,-27.5 6.8,-15.5
               L 5.5,-9.5 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Articulacao e brilho no polegar -->
      <path d="M -6.8,-22.5 Q -1.2,-20.8 4.4,-22.2" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M -6.5,-29.5 C -5.5,-32.5 -3.0,-33.5 -0.5,-33.2" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.82"/>

      <!-- Corpo arredondado do punho -->
      <path d="M -13.5,-9.5
               C -15.5,-14.0 -10.5,-16.5 -2.5,-15.5
               L 8.5,-14.5
               C 13.5,-14.0 15.0,-8.5 14.5,1.5
               C 14.0,9.5 10.5,13.5 4.0,14.0
               L -7.5,13.5
               C -13.5,13.0 -15.5,7.5 -15.0,0.0
               Z"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.6" stroke-linejoin="round"/>

      <!-- Acento LED lateral na manopla -->
      <rect x="-12.2" y="-5.5" width="4.6" height="12.5" rx="2.3" fill="#0f172a" stroke="#090d18" stroke-width="1.2"/>
      <rect x="-11.2" y="-4.3" width="2.6" height="10.1" rx="1.3" fill="{col_main}" filter="url(#roboGlow)"/>

      <!-- 3 Dedos robustos dobrados com volume 3D e sombra entre eles -->
      <!-- Dedo superior (indicador) -->
      <rect x="-2.0" y="-14.2" width="19.5" height="9.4" rx="4.7" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
      <line x1="2.0" y1="-11.5" x2="12.5" y2="-11.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.72"/>
      <line x1="7.5" y1="-13.5" x2="7.5" y2="-5.6" stroke="#64748b" stroke-width="1.3" opacity="0.55"/>
      <!-- Dedo do meio -->
      <rect x="-1.2" y="-5.2" width="20.2" height="9.2" rx="4.6" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3"/>
      <line x1="2.5" y1="-2.6" x2="13.5" y2="-2.6" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.62"/>
      <line x1="8.2" y1="-4.5" x2="8.2" y2="3.2" stroke="#64748b" stroke-width="1.3" opacity="0.55"/>
      <!-- Dedo inferior -->
      <rect x="-2.4" y="3.6" width="18.2" height="8.8" rx="4.4" fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.3"/>
      <line x1="6.8" y1="4.4" x2="6.8" y2="11.6" stroke="#64748b" stroke-width="1.3" opacity="0.55"/>
    </g>'''


def _svg_hand_chin_think(col_main: str, col_hi: str) -> str:
    """
    Mao pensativa encostada suavemente sob o queixo (100% fora da boca LED!).
    Origem local (0,0) = pulso; polegar apoia sob o queixo e indicador toca a bochecha externa.
    """
    return f'''
    <g>
      <!-- Polegar arredondado apoiado suavemente sob a curva inferior do queixo -->
      <path d="M -6.0,-6.0
               L -27.5,-11.0
               C -33.0,-12.5 -32.2,-20.0 -26.2,-19.2
               L -5.5,-14.8 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3" stroke-linejoin="round"/>
      <line x1="-24.5" y1="-16.4" x2="-10.5" y2="-13.6" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" opacity="0.72"/>

      <!-- Dedo indicador arredondado encostado na bochecha externa direita (fora da boca LED!) -->
      <path d="M 0.5,-13.0
               L 4.5,-27.0
               C 6.0,-32.2 13.0,-30.5 11.5,-24.8
               L 8.5,-11.0 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3" stroke-linejoin="round"/>
      <line x1="6.8" y1="-26.5" x2="4.2" y2="-15.5" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" opacity="0.74"/>

      <!-- Dorso arredondado da mao mecha -->
      <path d="M -9.5,2.5
               C -14.5,-2.5 -14.0,-12.5 -7.5,-16.2
               C -1.0,-19.6 8.0,-17.5 11.2,-11.0
               C 14.2,-4.8 11.5,3.5 4.5,5.5
               C -1.5,7.0 -6.5,5.5 -9.5,2.5 Z"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- 2 dedos inferiores dobrados suavemente sob a palma -->
      <rect x="-15.5" y="-9.0" width="14.5" height="7.6" rx="3.8" transform="rotate(-12, -8, -5)"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.1"/>
      <rect x="-13.5" y="-1.8" width="13.5" height="7.2" rx="3.6" transform="rotate(-8, -7, 2)"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.1"/>

      <!-- Emissor LED no dorso da mao -->
      <rect x="-1.5" y="-10.0" width="7.2" height="4.2" rx="2.1" transform="rotate(-14, 2, -8)"
            fill="{col_main}" filter="url(#roboGlow)"/>
      <circle cx="2.0" cy="-8.0" r="1.3" fill="{col_hi}" opacity="0.9"/>
    </g>'''


def _svg_hand_headset_grab(col_main: str, col_hi: str) -> str:
    """
    Mao mecha robusta em vista 3/4 segurando a lateral externa do headset (espelhada pro lado direito).
    3 dedos grossos curvados abracando o fone + polegar de apoio.
    """
    return f'''
    <g>
      <!-- Dedo traseiro (curvado em direcao ao topo do fone) -->
      <path d="M 3.0,-14.0 C 5.5,-24.5 11.5,-30.5 16.5,-28.0 C 20.5,-26.0 18.5,-18.0 13.0,-11.0 Z"
            fill="#cbd5e1" stroke="#090d18" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- Dedo medio robusto abracando o fone -->
      <path d="M -3.0,-15.5 C -1.5,-28.0 5.5,-34.5 11.5,-32.5 C 16.5,-30.8 14.5,-21.5 9.0,-13.0 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M 1.5,-23.0 Q 5.5,-27.5 9.5,-27.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.76"/>
      <!-- Dedo frontal (indicador) robusto -->
      <path d="M -9.5,-13.5 C -9.0,-25.5 -2.5,-31.5 3.5,-29.5 C 8.5,-27.8 7.5,-19.0 2.5,-11.5 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M -5.2,-21.5 Q -1.5,-25.5 2.2,-25.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.78"/>

      <!-- Polegar apoiando a lateral frontal inferior do fone -->
      <path d="M 5.5,-2.5 C 12.5,-5.0 17.5,-1.5 16.5,4.0 C 15.5,8.5 9.5,9.5 3.5,7.0 Z"
            fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.3" stroke-linejoin="round"/>

      <!-- Manopla / Dorso arredondado da mao -->
      <path d="M -11.0,2.5
               C -14.5,-3.5 -14.0,-13.5 -8.0,-16.8
               C -1.5,-20.0 7.5,-17.5 10.5,-10.5
               C 13.0,-4.0 11.5,4.5 6.0,7.5
               C 0.5,10.0 -7.5,8.0 -11.0,2.5 Z"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Brilho especular na lateral do dorso -->
      <path d="M -9.5,-10.0 C -9.0,-14.0 -4.5,-16.2 0.5,-15.5" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.72"/>
      <!-- Luz LED de alerta na mao -->
      <circle cx="-1.5" cy="-4.5" r="5.0" fill="#1e293b" stroke="#090d18" stroke-width="1.5"/>
      <circle cx="-1.5" cy="-4.5" r="3.3" fill="{col_main}" filter="url(#roboGlow)"/>
      <circle cx="-2.4" cy="-5.4" r="1.2" fill="{col_hi}" opacity="0.92"/>
    </g>'''


def _svg_hand_glitch(col_main: str, col_hi: str, alt_col: str) -> str:
    """Mao mecha robusta meio tensa/travada para o modo bugado (3 dedos arredondados + polegar)."""
    return f'''
    <g>
      <g transform="translate(-8.8, -16.5) rotate(-14)">
        <rect x="-4.0" y="-14.5" width="8.0" height="16.8" rx="4.0" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.2"/>
      </g>
      <g transform="translate(0.5, -18.5) rotate(3)">
        <rect x="-4.2" y="-16.5" width="8.4" height="18.8" rx="4.2" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.2"/>
      </g>
      <g transform="translate(9.2, -16.0) rotate(18)">
        <rect x="-4.0" y="-14.0" width="8.0" height="16.2" rx="4.0" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.2"/>
      </g>
      <g transform="translate(11.5, -6.5) rotate(36)">
        <rect x="-4.2" y="-12.0" width="8.4" height="14.5" rx="4.2" fill="url(#roboFingerGrad)" stroke="#090d18" stroke-width="2.2"/>
      </g>
      <path d="M -10.5,1.5 C -14.5,-2.5 -15.0,-12.0 -11.5,-17.2 C -8.0,-21.2 8.0,-21.2 11.5,-17.2 C 15.0,-12.0 14.5,-2.5 10.5,1.5 C 6.5,4.2 -6.5,4.2 -10.5,1.5 Z"
            fill="url(#roboHandPalmGrad)" stroke="#090d18" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="0" cy="-8.2" r="5.4" fill="#1e293b" stroke="#090d18" stroke-width="1.5"/>
      <circle cx="0" cy="-8.2" r="3.4" fill="{alt_col}" filter="url(#roboGlow)"/>
      <circle cx="-1.0" cy="-9.2" r="1.2" fill="{col_hi}"/>
    </g>'''


def _compute_robot_arm_rig(
    t: float,
    amp: float,
    emotion: str,
    panic_shake: float,
) -> tuple[str, str]:
    """
    Calcula o rig completo de ambos os bracos do robo e devolve:
      (back_arms_svg, front_arms_svg)
    - back_arms_svg  : bracos superiores + ombreiras deltoides (camada do tronco, atras da cabeca)
    - front_arms_svg : juntas de cotovelo + antebracos chanfrados + pulsos + maos + FX (frente!)
    Todas as juntas sao matematicamente conectadas (Ombro -> Cotovelo -> Pulso -> Mao).
    """
    col_main, _, col_hi, _, _ = get_palette(emotion)

    if emotion == "green":
        # HYPE / INTRO:
        # Esquerdo: ombro -> cotovelo dobrado naturalmente -> antebraco articulado acenando!
        # Direito : ombro -> cotovelo dobrado naturalmente -> antebraco subindo -> JOINHA ROBUSTO!
        wave_rad = math.radians(-104.0 + math.sin(t * 10.5) * 11.5)
        thumb_bob = math.sin(t * 8.0) * 3.0 - amp * 3.5

        sl_x, sl_y = 166.0, 205.0
        el_x, el_y = 122.0, 232.0
        wl_x = el_x + 52.0 * math.cos(wave_rad)
        wl_y = el_y + 52.0 * math.sin(wave_rad)
        # Angulo da mao acompanhando exatamente o antebraco + leve balanco organico de pulso
        hand_l_rot = math.degrees(wave_rad) + 90.0 + math.sin(t * 10.5 - 0.55) * 5.0

        sr_x, sr_y = 314.0, 205.0
        er_x, er_y = 358.0, 236.0 + thumb_bob * 0.35
        wr_x, wr_y = 352.0, 184.0 + thumb_bob
        hand_r_rot = 4.5 + math.sin(t * 8.0) * 3.5

        back_svg = (
            _draw_upper_arm_segment(sl_x, sl_y, el_x, el_y)
            + _draw_upper_arm_segment(sr_x, sr_y, er_x, er_y)
            + _draw_shoulder_pauldron(sl_x, sl_y, el_x, el_y, -1, col_main, col_hi)
            + _draw_shoulder_pauldron(sr_x, sr_y, er_x, er_y, +1, col_main, col_hi)
        )
        front_svg = (
            _draw_elbow_joint(el_x, el_y, col_main)
            + _draw_forearm_segment(el_x, el_y, wl_x, wl_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wl_x:.1f}, {wl_y:.1f}) rotate({hand_l_rot:.1f})">
              {_svg_hand_wave(col_main, col_hi)}
              <!-- Linhas sutis de movimento do aceno -->
              <path d="M -23,-28 Q -29,-17 -24,-6" fill="none" stroke="{col_hi}" stroke-width="2.2" stroke-linecap="round" opacity="0.78"/>
              <path d="M -30,-23 Q -35,-15 -31,-6" fill="none" stroke="{col_main}" stroke-width="1.8" stroke-linecap="round" opacity="0.52"/>
            </g>'''
            + _draw_elbow_joint(er_x, er_y, col_main)
            + _draw_forearm_segment(er_x, er_y, wr_x, wr_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wr_x:.1f}, {wr_y - 10.0:.1f}) rotate({hand_r_rot:.1f})">
              {_svg_hand_thumbs_up(col_main, col_hi)}
              <!-- Raios limpos de destaque no joinha -->
              <line x1="12" y1="-34" x2="19" y2="-40" stroke="{col_hi}" stroke-width="2.3" stroke-linecap="round" opacity="0.86"/>
              <line x1="18" y1="-22" x2="26" y2="-23" stroke="{col_main}" stroke-width="2.1" stroke-linecap="round" opacity="0.74"/>
              <line x1="-17" y1="-32" x2="-24" y2="-38" stroke="{col_hi}" stroke-width="2.1" stroke-linecap="round" opacity="0.72"/>
            </g>'''
        )
        return back_svg, front_svg

    if emotion == "yellow":
        # DESCONFIADO:
        # Esquerdo: relaxado descendo naturalmente para a mesa/teclado.
        # Direito : ombro -> cotovelo apoiado -> antebraco em diagonal suave -> mao sob o queixo (sem tampar boca!).
        tap = math.sin(t * 4.6) * 1.3
        sway = math.sin(t * 2.8) * 1.2

        sl_x, sl_y = 166.0, 206.0
        el_x, el_y = 142.0 - sway, 249.0
        wl_x, wl_y = 156.0, 286.0

        sr_x, sr_y = 314.0, 205.0
        er_x, er_y = 340.0, 244.0
        wr_x, wr_y = 299.0, 198.0 + tap

        back_svg = (
            _draw_upper_arm_segment(sl_x, sl_y, el_x, el_y)
            + _draw_upper_arm_segment(sr_x, sr_y, er_x, er_y)
            + _draw_shoulder_pauldron(sl_x, sl_y, el_x, el_y, -1, col_main, col_hi)
            + _draw_shoulder_pauldron(sr_x, sr_y, er_x, er_y, +1, col_main, col_hi)
        )
        front_svg = (
            # Braco esquerdo relaxado na mesa
            _draw_elbow_joint(el_x, el_y, col_main)
            + _draw_forearm_segment(el_x, el_y, wl_x, wl_y, col_main, col_hi, False)
            # Braco direito dobrado em diagonal limpa ate sob o queixo
            + _draw_elbow_joint(er_x, er_y, col_main)
            + _draw_forearm_segment(er_x, er_y, wr_x, wr_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wr_x - 2.0:.1f}, {wr_y - 3.0:.1f})">
              {_svg_hand_chin_think(col_main, col_hi)}
            </g>'''
        )
        return back_svg, front_svg

    if emotion == "red":
        # PANICO / JUMPSCARE:
        # Ombros encolhidos/levantados + cotovelos abertos para os lados (V anatomico nitido!)
        # + maos mecha robustas segurando as laterais do headset tremendo!
        sh = max(0.55, panic_shake)
        jx_l = math.sin(t * 50.0) * 2.5 * sh
        jy_l = math.cos(t * 54.0) * 2.1 * sh
        jx_r = math.cos(t * 52.0) * 2.5 * sh
        jy_r = math.sin(t * 56.0) * 2.1 * sh

        # Ombros encolhidos (y=198 vs 206)
        sl_x, sl_y = 165.0 + jx_l * 0.25, 198.0 + jy_l * 0.25
        el_x, el_y = 107.0 + jx_l * 0.65, 212.0 + jy_l * 0.55
        wl_x, wl_y = 128.0 + jx_l, 147.0 + jy_l

        sr_x, sr_y = 315.0 + jx_r * 0.25, 198.0 + jy_r * 0.25
        er_x, er_y = 372.0 + jx_r * 0.65, 212.0 + jy_r * 0.55
        wr_x, wr_y = 352.0 + jx_r, 147.0 + jy_r

        shock_op = 0.65 + 0.35 * abs(math.sin(t * 28.0))

        back_svg = (
            _draw_upper_arm_segment(sl_x, sl_y, el_x, el_y)
            + _draw_upper_arm_segment(sr_x, sr_y, er_x, er_y)
            + _draw_shoulder_pauldron(sl_x, sl_y, el_x, el_y, -1, col_main, col_hi)
            + _draw_shoulder_pauldron(sr_x, sr_y, er_x, er_y, +1, col_main, col_hi)
        )
        front_svg = (
            # Braco + Mao Esquerda agarrando o fone esquerdo (V anatomico!)
            _draw_elbow_joint(el_x, el_y, col_main)
            + _draw_forearm_segment(el_x, el_y, wl_x, wl_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wl_x + 3.0:.1f}, {wl_y - 10.0:.1f}) rotate(12)">
              {_svg_hand_headset_grab(col_main, col_hi)}
            </g>'''
            # Braco + Mao Direita agarrando o fone direito (V anatomico espelhado!)
            + _draw_elbow_joint(er_x, er_y, col_main)
            + _draw_forearm_segment(er_x, er_y, wr_x, wr_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wr_x - 3.0:.1f}, {wr_y - 10.0:.1f}) rotate(-12) scale(-1, 1)">
              {_svg_hand_headset_grab(col_main, col_hi)}
            </g>'''
            # Linhas de choque/panico ao redor da cabeca
            + f'''
            <g stroke="{col_hi}" stroke-width="2.4" stroke-linecap="round" opacity="{shock_op:.2f}">
              <line x1="106" y1="76" x2="122" y2="85"/>
              <line x1="99" y1="97" x2="116" y2="99"/>
              <line x1="374" y1="76" x2="358" y2="85"/>
              <line x1="381" y1="97" x2="364" y2="99"/>
            </g>'''
        )
        return back_svg, front_svg

    if emotion == "purple":
        # BUGADO: postura levemente desalinhada/torta com tremor sutil de servos reiniciando
        gl_x = math.sin(t * 34.0) * 2.4
        gl_y = math.cos(t * 28.0) * 1.8

        sl_x, sl_y = 166.0, 200.0
        el_x, el_y = 126.0 + gl_x * 0.6, 232.0 + gl_y * 0.5
        wl_x, wl_y = 132.0 + gl_x, 186.0 - gl_y

        sr_x, sr_y = 314.0, 212.0
        er_x, er_y = 348.0 - gl_x * 0.6, 250.0 + gl_y * 0.5
        wr_x, wr_y = 335.0 - gl_x, 220.0 + gl_y

        back_svg = (
            _draw_upper_arm_segment(sl_x, sl_y, el_x, el_y)
            + _draw_upper_arm_segment(sr_x, sr_y, er_x, er_y)
            + _draw_shoulder_pauldron(sl_x, sl_y, el_x, el_y, -1, col_main, col_hi)
            + _draw_shoulder_pauldron(sr_x, sr_y, er_x, er_y, +1, col_main, col_hi)
        )
        front_svg = (
            _draw_elbow_joint(el_x, el_y, col_main)
            + _draw_forearm_segment(el_x, el_y, wl_x, wl_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wl_x:.1f}, {wl_y - 3.0:.1f}) rotate(-14)">
              {_svg_hand_glitch(col_main, col_hi, col_main)}
            </g>'''
            + _draw_elbow_joint(er_x, er_y, col_main)
            + _draw_forearm_segment(er_x, er_y, wr_x, wr_y, col_main, col_hi, True)
            + f'''
            <g transform="translate({wr_x:.1f}, {wr_y - 3.0:.1f}) rotate(22) scale(-1, 1)">
              {_svg_hand_glitch(col_main, col_hi, "#00f0ff")}
            </g>'''
        )
        return back_svg, front_svg

    # CYAN (CONFIANTE / NARRANDO):
    # Postura natural de streamer — ambos os bracos relaxados descendo naturalmente dos ombros
    # em direcao a mesa/teclado, sem maos flutuando a toa, com leve balanco de respiracao/fala.
    sway = math.sin(t * 4.2) * 1.8
    talk_lift = amp * 2.6

    sl_x, sl_y = 166.0, 206.0 - talk_lift * 0.25
    el_x, el_y = 140.0 - sway, 248.0 - talk_lift * 0.55
    wl_x, wl_y = 154.0, 286.0

    sr_x, sr_y = 314.0, 206.0 - talk_lift * 0.25
    er_x, er_y = 340.0 + sway, 248.0 - talk_lift * 0.55
    wr_x, wr_y = 326.0, 286.0

    back_svg = (
        _draw_upper_arm_segment(sl_x, sl_y, el_x, el_y)
        + _draw_upper_arm_segment(sr_x, sr_y, er_x, er_y)
        + _draw_shoulder_pauldron(sl_x, sl_y, el_x, el_y, -1, col_main, col_hi)
        + _draw_shoulder_pauldron(sr_x, sr_y, er_x, er_y, +1, col_main, col_hi)
    )
    front_svg = (
        _draw_elbow_joint(el_x, el_y, col_main)
        + _draw_forearm_segment(el_x, el_y, wl_x, wl_y, col_main, col_hi, False)
        + _draw_elbow_joint(er_x, er_y, col_main)
        + _draw_forearm_segment(er_x, er_y, wr_x, wr_y, col_main, col_hi, False)
    )
    return back_svg, front_svg


# =============================================================================
# COMPONENTE 1: ROBO YOUTUBER + QUARTO GAMER 2.5D (SISTEMA EXATO 480x270 16:9)
# =============================================================================
def _draw_robot_inside_box(
    t: float,
    amp: float,
    emotion: str,
    panic_shake: float = 0.0,
) -> str:
    """Quarto gamer 2.5D + Robo YouTuber super detalhado no espaco 480x270 (16:9)."""
    col_main, col_dark, col_hi, _, _ = get_palette(emotion)

    # Animacoes organicas
    bob = math.sin(t * 4.2) * 3.0 - amp * 3.8
    tilt = (
        math.sin(t * 2.4) * 2.4
        + (7.0 if emotion == "yellow" else 0.0)
        + (math.sin(t * 44.0) * 5.2 if emotion == "red" else 0.0)
        + (math.sin(t * 16.0) * 6.5 if emotion == "purple" else 0.0)
    )
    ant_wag = (
        math.sin(t * 8.5) * 7.0
        + (math.sin(t * 46.0) * 15.0 if emotion == "red" else 0.0)
        + (math.sin(t * 22.0) * 12.0 if emotion == "purple" else 0.0)
    )
    fan_rot = (t * 240.0) % 360.0
    reticle_rot = (t * 58.0) % 360.0

    # Rig conectado dos bracos & maos mecha
    arms_back_svg, arms_front_svg = _compute_robot_arm_rig(t, amp, emotion, panic_shake)

    # --- OLHOS DIGITAIS ULTRA EXPRESSIVOS (centro visor: x=240, y=104) ---
    blink = (int(t * 10) % 33 == 0) and emotion not in ("red", "purple")
    eye_shift_x = math.sin(t * 1.8) * 2.4 if emotion in ("cyan", "yellow") else 0.0

    if blink:
        eyes_svg = (
            f'<path d="M 193,106 Q 210,111 227,106" fill="none" stroke="{col_main}" stroke-width="4.8" stroke-linecap="round" filter="url(#roboGlow)"/>'
            f'<path d="M 253,106 Q 270,111 287,106" fill="none" stroke="{col_main}" stroke-width="4.8" stroke-linecap="round" filter="url(#roboGlow)"/>'
        )
    elif emotion == "cyan":
        eyes_svg = f'''
        <g transform="translate({eye_shift_x:.1f}, 0)">
          <path d="M 192,86 L 228,92" fill="none" stroke="{col_hi}" stroke-width="3.2" stroke-linecap="round" opacity="0.85"/>
          <path d="M 288,86 L 252,92" fill="none" stroke="{col_hi}" stroke-width="3.2" stroke-linecap="round" opacity="0.85"/>
          <rect x="194" y="94" width="32" height="28" rx="10" fill="{col_main}" filter="url(#roboGlow)"/>
          <rect x="254" y="94" width="32" height="28" rx="10" fill="{col_main}" filter="url(#roboGlow)"/>
          <rect x="200" y="100" width="20" height="17" rx="6" fill="{col_hi}" opacity="0.55"/>
          <rect x="260" y="100" width="20" height="17" rx="6" fill="{col_hi}" opacity="0.55"/>
          <polygon points="190,91 230,99 230,91" fill="#070c17"/>
          <polygon points="290,91 250,99 250,91" fill="#070c17"/>
          <circle cx="216" cy="104" r="4.2" fill="#ffffff"/>
          <circle cx="206" cy="114" r="1.9" fill="#ffffff" opacity="0.8"/>
          <circle cx="276" cy="104" r="4.2" fill="#ffffff"/>
          <circle cx="266" cy="114" r="1.9" fill="#ffffff" opacity="0.8"/>
        </g>'''
    elif emotion == "green":
        eyes_svg = f'''
        <g>
          <path d="M 193,115 Q 210,87 227,115" fill="none" stroke="{col_main}" stroke-width="9.5" stroke-linecap="round" filter="url(#roboGlow)"/>
          <path d="M 193,115 Q 210,87 227,115" fill="none" stroke="{col_hi}" stroke-width="3.8" stroke-linecap="round"/>
          <path d="M 253,115 Q 270,87 287,115" fill="none" stroke="{col_main}" stroke-width="9.5" stroke-linecap="round" filter="url(#roboGlow)"/>
          <path d="M 253,115 Q 270,87 287,115" fill="none" stroke="{col_hi}" stroke-width="3.8" stroke-linecap="round"/>
          <g stroke="#34d399" stroke-width="2.2" stroke-linecap="round" opacity="0.65">
            <line x1="184" y1="125" x2="189" y2="120"/>
            <line x1="191" y1="125" x2="196" y2="120"/>
            <line x1="284" y1="125" x2="289" y2="120"/>
            <line x1="291" y1="125" x2="296" y2="120"/>
          </g>
        </g>'''
    elif emotion == "yellow":
        eyes_svg = f'''
        <g>
          <path d="M 191,92 L 228,99" fill="none" stroke="{col_hi}" stroke-width="3.4" stroke-linecap="round"/>
          <rect x="193" y="103" width="34" height="11" rx="5.5" fill="{col_main}" filter="url(#roboGlow)"/>
          <rect x="199" y="106" width="22" height="4.5" rx="2.2" fill="{col_hi}" opacity="0.72"/>
          <path d="M 252,88 Q 270,79 289,88" fill="none" stroke="{col_hi}" stroke-width="3.2" stroke-linecap="round"/>
          <g transform="translate(271, 108)">
            <circle cx="0" cy="0" r="18" fill="{col_main}" opacity="0.22" filter="url(#roboGlow)"/>
            <circle cx="0" cy="0" r="15.5" fill="none" stroke="{col_main}" stroke-width="3.6" filter="url(#roboGlow)"/>
            <g transform="rotate({reticle_rot:.1f})">
              <circle cx="0" cy="0" r="11" fill="none" stroke="{col_hi}" stroke-width="1.6" stroke-dasharray="6,4"/>
              <line x1="0" y1="-19" x2="0" y2="-13" stroke="{col_hi}" stroke-width="2"/>
              <line x1="0" y1="13" x2="0" y2="19" stroke="{col_hi}" stroke-width="2"/>
              <line x1="-19" y1="0" x2="-13" y2="0" stroke="{col_hi}" stroke-width="2"/>
              <line x1="13" y1="0" x2="19" y2="0" stroke="{col_hi}" stroke-width="2"/>
            </g>
            <circle cx="{eye_shift_x * 0.9:.1f}" cy="0" r="5.5" fill="{col_main}"/>
            <circle cx="{eye_shift_x * 0.9 + 1.8:.1f}" cy="-2" r="2.1" fill="#ffffff"/>
          </g>
        </g>'''
    elif emotion == "purple":
        sp_rot = (t * 180.0) % 360.0
        eyes_svg = f'''
        <g>
          <g transform="translate(210, 106) rotate({sp_rot:.1f})">
            <circle cx="0" cy="0" r="15" fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-dasharray="18,8" opacity="0.7"/>
            <circle cx="0" cy="0" r="10" fill="none" stroke="{col_main}" stroke-width="3.2" stroke-dasharray="14,6" filter="url(#roboGlow)"/>
            <circle cx="0" cy="0" r="4.5" fill="{col_hi}"/>
          </g>
          <g transform="translate(270, 106)">
            <rect x="-15" y="-12" width="30" height="7" rx="2" fill="#00f0ff" opacity="0.75"/>
            <rect x="-11" y="-2" width="26" height="8" rx="2" fill="{col_main}" filter="url(#roboGlow)"/>
            <rect x="-16" y="8" width="24" height="6" rx="2" fill="{col_hi}" opacity="0.85"/>
          </g>
        </g>'''
    else:
        jx = math.sin(t * 70.0) * 1.8
        eyes_svg = f'''
        <g transform="translate({jx:.1f}, 0)">
          <polyline points="190,90 223,106 190,122" fill="none" stroke="#00f0ff" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" transform="translate(-3.5, 0)"/>
          <polyline points="290,90 257,106 290,122" fill="none" stroke="#00f0ff" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45" transform="translate(3.5, 0)"/>
          <polyline points="190,90 223,106 190,122" fill="none" stroke="{col_main}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#roboGlow)"/>
          <polyline points="190,90 223,106 190,122" fill="none" stroke="{col_hi}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="290,90 257,106 290,122" fill="none" stroke="{col_main}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#roboGlow)"/>
          <polyline points="290,90 257,106 290,122" fill="none" stroke="{col_hi}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 181,82 L 181,78 L 188,78 M 299,82 L 299,78 L 292,78" fill="none" stroke="{col_hi}" stroke-width="1.8" opacity="0.8"/>
        </g>'''

    # --- BOCA LUMINOSA FECHADA (REGRA SAGRADA: NAO ABRE — APENAS BRILHA E PULSA!) ---
    base_glow = 0.42 + amp * 0.58
    n_bars = 9
    bar_elems = []
    wave_pts = []
    for i in range(n_bars):
        dist = abs(i - 4)
        freq_wave = 0.50 + 0.50 * math.sin(t * 27.0 + i * 1.12)
        freq_wave2 = 0.50 + 0.50 * math.cos(t * 19.0 - i * 0.85)
        envelope = 1.0 - dist * 0.145
        h_bar = 3.6 + amp * 15.8 * envelope * (0.55 * freq_wave + 0.45 * freq_wave2)
        h_bar = clamp(h_bar, 3.2, 18.2)
        bx = 200.5 + i * 9.0
        by = 152.0 - h_bar / 2.0
        bar_elems.append(
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="6.2" height="{h_bar:.1f}" rx="3.1" fill="{col_main}" opacity="{clamp(base_glow):.2f}" filter="url(#roboGlow)"/>'
            f'<rect x="{bx + 1.4:.1f}" y="{by + 1.1:.1f}" width="3.4" height="{max(1.5, h_bar - 2.2):.1f}" rx="1.7" fill="{col_hi}" opacity="{clamp(0.42 + amp * 0.55):.2f}"/>'
        )
        wy = 152.0 + math.sin(t * 32.0 + i * 1.05) * (amp * 7.0 * envelope)
        wave_pts.append(f"{bx + 3.1:.1f},{wy:.1f}")

    mouth_svg = f'''
    <!-- MODULO DE VOZ LED FECHADO (NAO ABRE — APENAS BRILHA E PULSA!) -->
    <g>
      <rect x="190" y="139" width="100" height="26" rx="11" fill="#1e293b" stroke="#090d18" stroke-width="2.4"/>
      <rect x="193" y="141" width="94" height="22" rx="9" fill="#04070f" stroke="{col_dark}" stroke-width="1.8"/>
      <g clip-path="url(#roboMouthClip)">
        <rect x="195" y="143" width="90" height="18" rx="7" fill="{col_main}" opacity="{0.14 + amp * 0.44:.2f}" filter="url(#roboGlow)"/>
        <line x1="194" y1="147" x2="286" y2="147" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
        <line x1="194" y1="152" x2="286" y2="152" stroke="{col_main}" stroke-opacity="0.22" stroke-width="1"/>
        <line x1="194" y1="157" x2="286" y2="157" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
        {"".join(bar_elems)}
        <polyline points="{" ".join(wave_pts)}" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="{0.35 + amp * 0.55:.2f}"/>
        <line x1="200" y1="143.2" x2="280" y2="143.2" stroke="#ffffff" stroke-opacity="0.24" stroke-width="1.4" stroke-linecap="round"/>
      </g>
    </g>'''

    # --- PAINEIS ACUSTICOS HEXAGONAIS NA PAREDE DO QUARTO GAMER ---
    left_hexes = [
        (36, 46, False), (74, 46, True), (55, 79, False),
        (93, 79, False), (36, 112, False), (74, 112, False),
    ]
    right_hexes = [
        (404, 46, True), (442, 46, False), (385, 79, False),
        (423, 79, False), (461, 79, False),
    ]
    hex_elems = []
    for hx, hy, is_lit in left_hexes:
        stroke_c = "#a855f7" if is_lit else "#1e2942"
        sw = "2.2" if is_lit else "1.4"
        flt = ' filter="url(#roboGlow)"' if is_lit else ""
        hex_elems.append(
            f'<polygon points="{_hex_points(hx, hy, 18.5)}" fill="#11182c" stroke="{stroke_c}" stroke-width="{sw}"{flt}/>'
            f'<polygon points="{_hex_points(hx, hy, 13.5)}" fill="#162038" opacity="0.65"/>'
        )
    for hx, hy, is_lit in right_hexes:
        stroke_c = col_main if is_lit else "#1e2942"
        sw = "2.2" if is_lit else "1.4"
        flt = ' filter="url(#roboGlow)"' if is_lit else ""
        hex_elems.append(
            f'<polygon points="{_hex_points(hx, hy, 18.5)}" fill="#11182c" stroke="{stroke_c}" stroke-width="{sw}"{flt}/>'
            f'<polygon points="{_hex_points(hx, hy, 13.5)}" fill="#162038" opacity="0.65"/>'
        )

    # --- FANS RGB GIRANDO NO GABINETE PC ---
    fan_colors = ("#00f0ff", "#a855f7", col_main)
    fans_svg = []
    for idx, fcy in enumerate((176, 210, 244)):
        fc = fan_colors[idx]
        fans_svg.append(f'''
        <g transform="translate(56, {fcy})">
          <circle cx="0" cy="0" r="13.5" fill="#060914" stroke="{fc}" stroke-width="2.2" opacity="0.82" filter="url(#roboGlow)"/>
          <g transform="rotate({(fan_rot + idx * 45) % 360:.1f})" opacity="0.58">
            <line x1="-10" y1="0" x2="10" y2="0" stroke="{fc}" stroke-width="2.4" stroke-linecap="round"/>
            <line x1="0" y1="-10" x2="0" y2="10" stroke="{fc}" stroke-width="2.4" stroke-linecap="round"/>
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="{fc}" stroke-width="1.8" stroke-linecap="round"/>
          </g>
          <circle cx="0" cy="0" r="3.6" fill="#1e293b" stroke="{fc}" stroke-width="1.2"/>
        </g>''')

    # --- SCANLINES FINISSIMAS NO VISOR ---
    scanlines = "".join(
        f'<line x1="170" y1="{y}" x2="310" y2="{y}" stroke="#ffffff" stroke-opacity="0.065" stroke-width="1"/>'
        for y in range(77, 134, 4)
    )

    # --- GLITCH & ALERTA NO PANICO / BUGADO ---
    glitch_fx = ""
    if emotion == "red":
        alert_op = 0.14 + 0.14 * (0.5 + 0.5 * math.sin(t * 22.0))
        glitch_fx = f'<rect x="0" y="0" width="480" height="270" fill="none" stroke="#ff264d" stroke-width="14" opacity="{alert_op:.2f}"/>'
        if int(t * 24) % 3 == 0:
            gy = 42 + (int(t * 179) % 175)
            glitch_fx += (
                f'<rect x="0" y="{gy}" width="480" height="7" fill="#ff264d" opacity="0.42"/>'
                f'<rect x="0" y="{(gy + 38) % 235}" width="480" height="4" fill="#00f0ff" opacity="0.34"/>'
            )
    elif emotion == "purple" and int(t * 20) % 2 == 0:
        gy = 50 + (int(t * 131) % 160)
        glitch_fx = (
            f'<rect x="0" y="{gy}" width="480" height="5" fill="#c084fc" opacity="0.34"/>'
            f'<rect x="0" y="{(gy + 52) % 230}" width="480" height="3.5" fill="#00f0ff" opacity="0.28"/>'
        )

    # Tremor da camera em panico
    sx = math.sin(t * 60.0) * 5.2 * panic_shake
    sy = math.cos(t * 66.0) * 4.2 * panic_shake

    return f'''
    <g transform="translate({sx:.1f},{sy:.1f})">
      <!-- FUNDO: ESTUDIO GAMER 2.5D COM PROFUNDIDADE -->
      <rect x="-16" y="-16" width="512" height="302" fill="url(#wbWallGrad)"/>
      <rect x="0" y="0" width="480" height="270" fill="url(#wbGlowLeft)"/>
      <rect x="0" y="0" width="480" height="270" fill="url(#wbGlowRight)"/>
      <rect x="0" y="0" width="480" height="270" fill="url(#wbBacklight)"/>

      <!-- Sanca LED superior -->
      <line x1="20" y1="6" x2="210" y2="6" stroke="#a855f7" stroke-width="4" stroke-linecap="round" opacity="0.72" filter="url(#roboGlow)"/>
      <line x1="270" y1="6" x2="460" y2="6" stroke="{col_main}" stroke-width="4" stroke-linecap="round" opacity="0.78" filter="url(#roboGlow)"/>

      <!-- Paineis acusticos hexagonais na parede -->
      <g opacity="0.92">
        {"".join(hex_elems)}
      </g>

      <!-- Barras geometricas LED neon laterais -->
      <line x1="16" y1="146" x2="72" y2="112" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" opacity="0.72" filter="url(#roboGlow)"/>
      <line x1="464" y1="118" x2="412" y2="96" stroke="{col_main}" stroke-width="4" stroke-linecap="round" opacity="0.76" filter="url(#roboGlow)"/>

      <!-- GABINETE PC GAMER RGB NO FUNDO ESQUERDO -->
      <g opacity="0.92">
        <rect x="18" y="148" width="84" height="128" rx="7" fill="#0b101d" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="26" y="156" width="68" height="112" rx="4" fill="#050811" stroke="#334155" stroke-width="1.5"/>
        {"".join(fans_svg)}
        <rect x="74" y="198" width="16" height="4" rx="2" fill="{col_main}" opacity="0.85" filter="url(#roboGlow)"/>
        <polygon points="28,158 54,158 34,266 28,266" fill="#ffffff" opacity="0.05"/>
      </g>

      <!-- PRATELEIRA GEEK NO FUNDO DIREITO -->
      <g>
        <rect x="352" y="96" width="34" height="40" rx="4" fill="url(#roboPlayGrad)" stroke="#0f172a" stroke-width="2"/>
        <rect x="356" y="100" width="26" height="32" rx="2.5" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>
        <polygon points="365,109 365,123 377,116" fill="#0f172a"/>
        <rect x="394" y="104" width="24" height="32" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <rect x="398" y="108" width="16" height="11" rx="2" fill="{col_main}" opacity="0.72"/>
        <circle cx="402" cy="126" r="2.2" fill="#94a3b8"/>
        <circle cx="411" cy="125" r="1.8" fill="#ef4444"/>
        <rect x="426" y="120" width="22" height="16" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M 437,120 C 431,110 425,112 428,120 M 437,120 C 437,106 443,106 441,120 M 437,120 C 444,110 450,113 446,120" fill="#10b981" stroke="#064e3b" stroke-width="1.4"/>
        <rect x="338" y="136" width="128" height="9" rx="3" fill="#1e293b" stroke="#090d18" stroke-width="2"/>
        <line x1="344" y1="146" x2="460" y2="146" stroke="{col_main}" stroke-width="3" stroke-linecap="round" opacity="0.82" filter="url(#roboGlow)"/>
      </g>

      <!-- CADEIRA GAMER ERGONOMICA 2.5D ATRAS DO ROBO -->
      <g>
        <path d="M 142,274 L 154,84 C 156,64 190,56 240,56 C 290,56 324,64 326,84 L 338,274 Z" fill="url(#roboChairGrad)" stroke="#06080f" stroke-width="3.5"/>
        <path d="M 152,118 L 166,118 L 161,226 L 146,226 Z" fill="{col_dark}" opacity="0.82"/>
        <path d="M 328,118 L 314,118 L 319,226 L 334,226 Z" fill="{col_dark}" opacity="0.82"/>
        <line x1="158" y1="122" x2="153" y2="222" stroke="{col_main}" stroke-width="1.5" opacity="0.7"/>
        <line x1="322" y1="122" x2="327" y2="222" stroke="{col_main}" stroke-width="1.5" opacity="0.7"/>
        <path d="M 168,274 L 176,98 Q 240,84 304,98 L 312,274 Z" fill="#0e1221"/>
        <line x1="184" y1="142" x2="296" y2="142" stroke="#1e293b" stroke-width="1.5" opacity="0.6"/>
        <line x1="182" y1="176" x2="298" y2="176" stroke="#1e293b" stroke-width="1.5" opacity="0.6"/>
        <rect x="200" y="70" width="80" height="24" rx="11" fill="#1e263b" stroke="#090d18" stroke-width="2.5"/>
        <line x1="208" y1="76" x2="272" y2="76" stroke="#475569" stroke-width="1.4" opacity="0.5"/>
      </g>

      <!-- HEROI: ROBO YOUTUBER 2.5D (TRONCO + BRACOS CONECTADOS + CABECA) -->
      <g transform="translate(0, {bob:.1f})">
        <!-- Tronco / Jaqueta Tech Mecha esculpida (proporcional as ombreiras deltoides!) -->
        <path d="M 164,278 C 166,216 184,186 240,186 C 296,186 314,216 316,278 Z" fill="url(#roboJacketGrad)" stroke="#060912" stroke-width="3.8"/>
        <!-- Peitoral interno + Gola tech -->
        <path d="M 182,278 L 196,190 L 284,190 L 298,278 Z" fill="#0d1322" stroke="#1e293b" stroke-width="2"/>
        <path d="M 206,186 Q 240,203 274,186" fill="none" stroke="#334155" stroke-width="5" stroke-linecap="round"/>

        <!-- Nucleo Arc-Core no peito (visivel acima da legenda!) -->
        <g transform="translate(240, 214)">
          <polygon points="0,-19 19,-6 12,16 -12,16 -19,-6" fill="#1e293b" stroke="#090d18" stroke-width="2.5"/>
          <polygon points="0,-13 13,-4 8,11 -8,11 -13,-4" fill="{col_main}" opacity="{0.62 + amp * 0.36:.2f}" filter="url(#roboGlow)"/>
          <polygon points="0,-7 7,-2 4,6 -4,6 -7,-2" fill="#ffffff" opacity="0.86"/>
          <rect x="-38" y="-3" width="12" height="3.5" rx="1.6" fill="{col_main}" opacity="0.72"/>
          <rect x="-38" y="4" width="8" height="3.5" rx="1.6" fill="{col_dark}" opacity="0.75"/>
          <rect x="26" y="-3" width="12" height="3.5" rx="1.6" fill="{col_main}" opacity="0.72"/>
          <rect x="30" y="4" width="8" height="3.5" rx="1.6" fill="{col_dark}" opacity="0.75"/>
        </g>

        <!-- BRACOS SUPERIORES + OMBREIRAS DELTOIDES (CONECTADOS AO TRONCO!) -->
        {arms_back_svg}

        <!-- Pescoco mecanico articulado -->
        <rect x="220" y="164" width="40" height="25" rx="7" fill="url(#roboShellDark)" stroke="#090d18" stroke-width="3"/>
        <line x1="223" y1="173" x2="257" y2="173" stroke="#64748b" stroke-width="2.2"/>
        <line x1="223" y1="181" x2="257" y2="181" stroke="#475569" stroke-width="2.2"/>
        <rect x="234" y="168" width="12" height="17" rx="3" fill="#ffffff" opacity="0.08"/>

        <!-- CABECA ROBOTICA MECHA 2.5D -->
        <g transform="rotate({tilt:.2f}, 240, 168)">
          <!-- Antena superior articulada com cristal LED -->
          <g transform="rotate({ant_wag:.1f}, 240, 52)">
            <path d="M 229,54 Q 240,46 251,54 Z" fill="#334155" stroke="#090d18" stroke-width="2.2"/>
            <line x1="240" y1="50" x2="240" y2="27" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="239" y1="48" x2="239" y2="29" stroke="#f1f5f9" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="240" cy="23" r="10" fill="{col_main}" opacity="0.34" filter="url(#roboGlowSoft)"/>
            <circle cx="240" cy="23" r="6.8" fill="{col_main}" stroke="{col_dark}" stroke-width="1.4" filter="url(#roboGlow)"/>
            <circle cx="238.5" cy="21.5" r="2.8" fill="#ffffff"/>
          </g>

          <!-- Arco do Headset Gamer -->
          <path d="M 152,118 C 150,36 330,36 328,118" fill="none" stroke="#090d18" stroke-width="18" stroke-linecap="round"/>
          <path d="M 152,118 C 150,36 330,36 328,118" fill="none" stroke="#1e293b" stroke-width="13" stroke-linecap="round"/>
          <path d="M 192,50 Q 240,40 288,50" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round"/>
          <path d="M 158,114 C 158,45 322,45 322,114" fill="none" stroke="{col_main}" stroke-width="3.2" stroke-linecap="round" opacity="0.88" filter="url(#roboGlow)"/>

          <!-- CAPACETE PRINCIPAL ESCULPIDO -->
          <path d="M 164,90 C 164,60 186,52 240,52 C 294,52 316,60 316,90 L 314,136 C 313,162 290,171 240,171 C 190,171 167,162 166,136 Z" fill="url(#roboShellGrad)" stroke="#090d18" stroke-width="4"/>

          <!-- Sombreamento 3D, linhas de painel e Rim Lights dentro do capacete -->
          <g clip-path="url(#roboHelmetClip)">
            <rect x="160" y="48" width="160" height="128" fill="url(#roboRimRight)"/>
            <rect x="160" y="48" width="160" height="128" fill="url(#roboRimLeft)"/>
            <path d="M 182,58 Q 240,51 298,58 Q 272,66 240,66 Q 208,66 182,58 Z" fill="#ffffff" opacity="0.62"/>
            <path d="M 165,134 L 188,144 M 315,134 L 292,144" fill="none" stroke="#64748b" stroke-width="1.4" opacity="0.65"/>
            <path d="M 188,54 L 194,68 M 292,54 L 286,68" fill="none" stroke="#94a3b8" stroke-width="1.4" opacity="0.72"/>
            <path d="M 164,158 Q 240,176 316,158 L 316,176 L 164,176 Z" fill="#475569" opacity="0.34"/>
          </g>

          <!-- Placa central da testa -->
          <path d="M 212,53 L 268,53 L 263,65 L 217,65 Z" fill="#1e293b" stroke="#090d18" stroke-width="2"/>
          <rect x="228" y="57" width="24" height="3.8" rx="1.9" fill="{col_main}" opacity="0.9"/>

          <!-- FONES LATERAIS DO HEADSET GAMER -->
          <rect x="156" y="88" width="13" height="54" rx="6" fill="#0b101d" stroke="#090d18" stroke-width="2"/>
          <rect x="139" y="86" width="21" height="58" rx="9" fill="url(#roboShellDark)" stroke="#090d18" stroke-width="3"/>
          <rect x="144" y="96" width="7.5" height="38" rx="3.7" fill="{col_main}" filter="url(#roboGlow)"/>
          <rect x="146" y="100" width="3" height="30" rx="1.5" fill="{col_hi}" opacity="0.85"/>
          <circle cx="155" cy="94" r="2.2" fill="#64748b"/>
          <circle cx="155" cy="136" r="2.2" fill="#64748b"/>

          <rect x="311" y="88" width="13" height="54" rx="6" fill="#0b101d" stroke="#090d18" stroke-width="2"/>
          <rect x="320" y="86" width="21" height="58" rx="9" fill="url(#roboShellDark)" stroke="#090d18" stroke-width="3"/>
          <rect x="328.5" y="96" width="7.5" height="38" rx="3.7" fill="{col_main}" filter="url(#roboGlow)"/>
          <rect x="331" y="100" width="3" height="30" rx="1.5" fill="{col_hi}" opacity="0.85"/>
          <circle cx="325" cy="94" r="2.2" fill="#64748b"/>
          <circle cx="325" cy="136" r="2.2" fill="#64748b"/>

          <!-- VISOR FRONTAL CURVO DE VIDRO ESCURO -->
          <path d="M 184,71 L 296,71 C 308,71 312,80 312,94 L 310,120 C 309,132 300,137 286,137 L 194,137 C 180,137 171,132 170,120 L 168,94 C 168,80 172,71 184,71 Z" fill="#1e293b" stroke="#090d18" stroke-width="2.8"/>
          <g clip-path="url(#roboVisorClip)">
            <rect x="168" y="70" width="144" height="68" fill="url(#roboVisorGrad)"/>
            <rect x="168" y="70" width="144" height="68" fill="url(#roboVisorScreenGlow)"/>
            {scanlines}
            {eyes_svg}
            <path d="M 176,75 L 222,75 L 198,108 L 173,108 Z" fill="#ffffff" opacity="0.085"/>
            <path d="M 232,75 L 246,75 L 224,104 L 210,104 Z" fill="#ffffff" opacity="0.045"/>
          </g>
          <path d="M 186,74 L 294,74 C 304,74 308,82 308,94 L 306,118 C 305,129 298,134 286,134 L 194,134 C 182,134 175,129 174,118 L 172,94 C 172,82 176,74 186,74 Z" fill="none" stroke="{col_main}" stroke-opacity="0.28" stroke-width="1.4"/>

          <!-- BOCA LUMINOSA FECHADA (MODULO LED REATIVO A VOZ) -->
          {mouth_svg}

          <!-- Microfone articulado do Headset -->
          <path d="M 148,138 C 148,160 162,165 182,160" fill="none" stroke="#090d18" stroke-width="6.5" stroke-linecap="round"/>
          <path d="M 148,138 C 148,160 162,165 182,160" fill="none" stroke="#334155" stroke-width="3.6" stroke-linecap="round"/>
          <ellipse cx="184" cy="159" rx="6.5" ry="4.5" transform="rotate(-12, 184, 159)" fill="#0f172a" stroke="#475569" stroke-width="1.6"/>
          <circle cx="188" cy="158" r="1.7" fill="{col_main}" filter="url(#roboGlow)"/>
        </g>

        <!-- JUNTAS DE COTOVELO + ANTEBRACOS CHANFRADOS + PULSOS + MAOS MECHA (FRENTE) -->
        {arms_front_svg}
      </g>

      <!-- MICROFONE CONDENSADOR DE ESTUDIO + POP-FILTER (PRIMEIRO PLANO DIREITO) -->
      <g>
        <line x1="488" y1="274" x2="432" y2="232" stroke="#090d18" stroke-width="11" stroke-linecap="round"/>
        <line x1="488" y1="274" x2="432" y2="232" stroke="#273247" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="432" cy="232" r="6" fill="#334155" stroke="#090d18" stroke-width="2"/>
        <g transform="translate(422, 206) rotate(-18)">
          <rect x="-15" y="-20" width="30" height="44" rx="13" fill="url(#roboMicGrad)" stroke="#090d18" stroke-width="2.6"/>
          <rect x="-11" y="-16" width="22" height="22" rx="9" fill="#334155" stroke="#1e293b" stroke-width="1.4"/>
          <line x1="-9" y1="-10" x2="9" y2="-10" stroke="#64748b" stroke-width="1.5"/>
          <line x1="-10" y1="-5" x2="10" y2="-5" stroke="#64748b" stroke-width="1.5"/>
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#64748b" stroke-width="1.5"/>
          <rect x="-11" y="9" width="22" height="3.2" rx="1.6" fill="{col_main}" opacity="{0.6 + amp * 0.4:.2f}" filter="url(#roboGlow)"/>
        </g>
        <path d="M 432,232 Q 406,238 394,218" fill="none" stroke="#1e293b" stroke-width="3.2" stroke-linecap="round"/>
        <ellipse cx="390" cy="202" rx="15" ry="20" transform="rotate(-14, 390, 202)" fill="#070b15" fill-opacity="0.62" stroke="#334155" stroke-width="2.8"/>
        <ellipse cx="390" cy="202" rx="11" ry="16" transform="rotate(-14, 390, 202)" fill="none" stroke="#64748b" stroke-opacity="0.28" stroke-width="1" stroke-dasharray="2,2"/>
      </g>

      {glitch_fx}
    </g>'''


def _build_webcam_layer(
    t: float,
    amp: float,
    emotion: str,
    cam_p: float,
    panic_shake: float,
    timecode_sec: float | None = None,
) -> str:
    col_main, _, col_hi, _, emo_label = get_palette(emotion)

    # Interpolacao 16:9 exata: fullscreen (0,0,1280,720) -> canto superior esquerdo (22,22,368,207)
    wb_x = lerp(0.0, 22.0, cam_p)
    wb_y = lerp(0.0, 22.0, cam_p)
    wb_w = lerp(float(W), 368.0, cam_p)
    wb_h = lerp(float(H), 207.0, cam_p)
    wb_rx = lerp(0.0, 16.0, cam_p)

    sc = wb_w / CAM_W

    rec_dot = 1.0 if int(t * 2.0) % 2 == 0 else 0.24
    tc_val = t if timecode_sec is None else timecode_sec
    secs = max(0, int(tc_val))
    tc = f"{secs // 60:02d}:{secs % 60:02d}"

    vu_bars = []
    for i in range(4):
        vh = clamp(3.0 + amp * 12.0 * (0.45 + 0.55 * abs(math.sin(t * 24.0 + i * 1.1))), 3.0, 13.0)
        vu_bars.append(
            f'<rect x="{84 + i * 4.5:.1f}" y="{18.5 - vh:.1f}" width="2.8" height="{vh:.1f}" rx="1.2" fill="{col_main}"/>'
        )

    hud_scale = lerp(1.12, 0.92, cam_p)
    badge_w = 152.0
    hud_pad = lerp(22.0, 11.0, cam_p)

    brackets = ""
    if cam_p > 0.25:
        bl = 16.0
        bop = clamp((cam_p - 0.25) / 0.4) * 0.92
        x1, y1, x2, y2 = wb_x - 3, wb_y - 3, wb_x + wb_w + 3, wb_y + wb_h + 3
        brackets = f'''
        <g stroke="{col_hi}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="{bop:.2f}">
          <path d="M {x1:.1f},{y1 + bl:.1f} L {x1:.1f},{y1 + 6:.1f} Q {x1:.1f},{y1:.1f} {x1 + 6:.1f},{y1:.1f} L {x1 + bl:.1f},{y1:.1f}"/>
          <path d="M {x2 - bl:.1f},{y1:.1f} L {x2 - 6:.1f},{y1:.1f} Q {x2:.1f},{y1:.1f} {x2:.1f},{y1 + 6:.1f} L {x2:.1f},{y1 + bl:.1f}"/>
          <path d="M {x1:.1f},{y2 - bl:.1f} L {x1:.1f},{y2 - 6:.1f} Q {x1:.1f},{y2:.1f} {x1 + 6:.1f},{y2:.1f} L {x1 + bl:.1f},{y2:.1f}"/>
          <path d="M {x2 - bl:.1f},{y2:.1f} L {x2 - 6:.1f},{y2:.1f} Q {x2:.1f},{y2:.1f} {x2:.1f},{y2 - 6:.1f} L {x2:.1f},{y2 - bl:.1f}"/>
        </g>'''

    shadow_svg = ""
    if cam_p > 0.08:
        sh_op = clamp(cam_p) * 0.64
        shadow_svg = (
            f'<rect x="{wb_x + 6:.1f}" y="{wb_y + 10:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="#000000" opacity="{sh_op:.2f}" filter="url(#wbShadowBlur)"/>'
            f'<rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="{col_main}" stroke-width="7" opacity="{0.26 * cam_p:.2f}" filter="url(#wbShadowBlur)"/>'
        )

    border_svg = ""
    if cam_p > 0.04:
        border_svg = (
            f'<rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="#090d18" stroke-width="{lerp(0, 6.5, cam_p):.1f}"/>'
            f'<rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="{col_main}" stroke-width="{lerp(0, 3.2, cam_p):.1f}" filter="url(#roboGlow)"/>'
            f'<rect x="{wb_x + 2.5:.1f}" y="{wb_y + 2.5:.1f}" width="{wb_w - 5:.1f}" height="{wb_h - 5:.1f}" rx="{max(0.0, wb_rx - 2):.1f}" fill="none" stroke="#ffffff" stroke-opacity="{0.18 * cam_p:.2f}" stroke-width="1.1"/>'
        )

    return f'''
    <g class="webcam-robo">
      {shadow_svg}
      <g clip-path="url(#wbClip)">
        <g transform="translate({wb_x:.1f},{wb_y:.1f}) scale({sc:.5f})">
          {_draw_robot_inside_box(t, amp, emotion, panic_shake)}
        </g>
      </g>
      {border_svg}
      {brackets}

      <!-- HUD Superior Esquerdo: REC + Timer + VU Meter -->
      <g transform="translate({wb_x + hud_pad:.1f}, {wb_y + hud_pad:.1f}) scale({hud_scale:.3f})">
        <rect x="0" y="0" width="108" height="24" rx="7" fill="#060913" fill-opacity="0.82" stroke="#334155" stroke-width="1"/>
        <circle cx="13" cy="12" r="4.5" fill="#ef4444" opacity="{rec_dot:.2f}" filter="url(#roboGlow)"/>
        <text x="23" y="16" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="11.5" fill="#ffffff" letter-spacing="0.6">REC</text>
        <text x="51" y="16" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.5" fill="#94a3b8">{tc}</text>
        {"".join(vu_bars)}
      </g>

      <!-- HUD Superior Direito: Badge de Modo/Emocao -->
      <g transform="translate({wb_x + wb_w - hud_pad - badge_w * hud_scale:.1f}, {wb_y + hud_pad:.1f}) scale({hud_scale:.3f})">
        <rect x="0" y="0" width="{badge_w:.1f}" height="24" rx="7" fill="#060913" fill-opacity="0.84" stroke="{col_main}" stroke-width="1.4"/>
        <circle cx="12" cy="12" r="3.4" fill="{col_main}"/>
        <text x="{(badge_w + 12) / 2.0:.1f}" y="16" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.8" fill="{col_hi}" letter-spacing="0.6">{emo_label}</text>
      </g>
    </g>'''


def render_webcam_overlay_svg(
    t: float,
    amp: float,
    emotion: str,
    caption: str,
    cam_p: float = 1.0,
    stamp_text: str = "",
    stamp_p: float = 0.0,
    panic_shake: float = 0.0,
    transparent_bg: bool = True,
    timecode_sec: float | None = None,
) -> str:
    """
    Gera SVG 1280x720 da Webcam do Robo YouTuber + selo dramatico + legenda.
    Quando transparent_bg=True, o fundo externo e 100% transparente (pronto para
    compo em cima de gameplay MP4 real via FFmpeg overlay!).
    """
    wb_x = lerp(0.0, 22.0, cam_p)
    wb_y = lerp(0.0, 22.0, cam_p)
    wb_w = lerp(float(W), 368.0, cam_p)
    wb_h = lerp(float(H), 207.0, cam_p)
    wb_rx = lerp(0.0, 16.0, cam_p)

    bg_rect = "" if transparent_bg else f'<rect width="{W}" height="{H}" fill="#050811"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    {_build_webcam_defs(emotion, amp, wb_x, wb_y, wb_w, wb_h, wb_rx)}
  </defs>
  {bg_rect}
  {_build_webcam_layer(t, amp, emotion, cam_p, panic_shake, timecode_sec=timecode_sec)}
  {_svg_stamp(stamp_text, stamp_p)}
  {svg_caption(caption, "robo" if caption else None, emotion)}
</svg>'''


# =============================================================================
# COMPONENTE 2: PORTARIA RETRO 1955 — THAT'S NOT MY NEIGHBOR (2.5D PREMIUM)
# =============================================================================
def _build_tnmn_defs(alarm_on: bool) -> str:
    return f'''
    <linearGradient id="tnmnWallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c231b"/>
      <stop offset="28%" stop-color="#2a3327"/>
      <stop offset="100%" stop-color="#20281e"/>
    </linearGradient>
    <radialGradient id="tnmnHallLamp" cx="50%" cy="12%" r="68%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.34"/>
      <stop offset="45%" stop-color="#a3b18a" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#070a08" stop-opacity="0.88"/>
    </radialGradient>
    <linearGradient id="tnmnCounterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5b4331"/>
      <stop offset="12%" stop-color="#483324"/>
      <stop offset="100%" stop-color="#281b12"/>
    </linearGradient>
    <linearGradient id="tnmnColdSkin" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#e7e5e4"/>
      <stop offset="60%" stop-color="#c9c5c0"/>
      <stop offset="100%" stop-color="#9e9994"/>
    </linearGradient>
    <linearGradient id="tnmnWarmSkin" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#f0d3b6"/>
      <stop offset="60%" stop-color="#dfb895"/>
      <stop offset="100%" stop-color="#b98e6a"/>
    </linearGradient>
    <radialGradient id="tnmnRedBtn" cx="38%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#ff6b7d"/>
      <stop offset="45%" stop-color="{'#ff1e38' if alarm_on else '#dc2626'}"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <filter id="tnmnGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="tnmnWinClip">
      <rect x="404" y="72" width="532" height="372" rx="10"/>
    </clipPath>'''


def _build_tnmn_layer(t: float, mode: str, scare_prog: float = 0.0) -> str:
    alarm_on = scare_prog > 0.05
    alarm_pulse = (0.5 + 0.5 * math.sin(t * 20.0)) if alarm_on else 0.0
    mon_scale = 1.0 + scare_prog * 0.44
    mon_y = lerp(0.0, 26.0, scare_prog)

    cx_n = 670.0
    if mode == "cold":
        neighbor_svg = f'''
        <g transform="translate({cx_n:.1f}, {278 + mon_y:.1f}) scale({mon_scale:.3f}) translate({-cx_n:.1f}, -278)">
          <path d="M 548,465 C 556,374 600,348 670,348 C 740,348 784,374 792,465 Z" fill="#2f3742" stroke="#0d1117" stroke-width="4.5"/>
          <path d="M 616,350 L 652,438 L 620,420 Z" fill="#1f252e" stroke="#0d1117" stroke-width="2.5"/>
          <path d="M 724,350 L 688,438 L 720,420 Z" fill="#1f252e" stroke="#0d1117" stroke-width="2.5"/>
          <polygon points="648,350 692,350 670,426" fill="#e5e7eb"/>
          <polygon points="663,358 677,358 674,422 666,422" fill="#7f1d1d"/>
          <rect x="648" y="324" width="44" height="34" rx="8" fill="#a8a29e" stroke="#0d1117" stroke-width="3.5"/>
          <ellipse cx="604" cy="264" rx="10" ry="16" fill="#bab6b0" stroke="#0d1117" stroke-width="3.5"/>
          <ellipse cx="736" cy="264" rx="10" ry="16" fill="#c9c5c0" stroke="#0d1117" stroke-width="3.5"/>
          <path d="M 606,246 C 604,190 634,174 670,174 C 706,174 736,190 734,246 L 728,294 C 722,332 698,350 670,352 C 642,350 618,332 612,294 Z" fill="url(#tnmnColdSkin)" stroke="#0d1117" stroke-width="4.5"/>
          <ellipse cx="638" cy="264" rx="18" ry="14" fill="#57534e" opacity="0.34"/>
          <ellipse cx="702" cy="264" rx="18" ry="14" fill="#57534e" opacity="0.34"/>
          <ellipse cx="670" cy="224" rx="19" ry="13" fill="#57534e" opacity="0.34"/>
          <path d="M 604,232 C 602,174 644,162 682,166 C 724,170 738,196 735,234 C 718,204 692,196 664,198 C 638,200 618,210 604,232 Z" fill="#181512" stroke="#09090b" stroke-width="4"/>
          <path d="M 632,176 Q 674,170 712,188" fill="none" stroke="#3f3f46" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
          <ellipse cx="638" cy="260" rx="15" ry="11.5" fill="#fef2f2" stroke="#0d1117" stroke-width="3"/>
          <circle cx="638" cy="260" r="{4.5 + scare_prog * 3.5:.1f}" fill="{'#dc2626' if alarm_on else '#18181b'}"/>
          <circle cx="636" cy="258" r="1.8" fill="#ffffff"/>
          <ellipse cx="702" cy="260" rx="15" ry="11.5" fill="#fef2f2" stroke="#0d1117" stroke-width="3"/>
          <circle cx="702" cy="260" r="{4.5 + scare_prog * 3.5:.1f}" fill="{'#dc2626' if alarm_on else '#18181b'}"/>
          <circle cx="700" cy="258" r="1.8" fill="#ffffff"/>
          <ellipse cx="670" cy="224" rx="17" ry="10.5" fill="#fee2e2" stroke="#0d1117" stroke-width="3"/>
          <circle cx="670" cy="224" r="{4.8 + scare_prog * 3.5:.1f}" fill="#dc2626"/>
          <circle cx="668" cy="222" r="1.8" fill="#ffffff"/>
          <path d="M 670,264 L 665,286 L 675,286" fill="none" stroke="#57534e" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M 622,302 Q 670,{344 + scare_prog * 22:.1f} 718,302 Q 670,316 622,302 Z" fill="#18181b" stroke="#09090b" stroke-width="3.2"/>
          <g stroke="#e7e5e4" stroke-width="3.2" stroke-linecap="round">
            <line x1="638" y1="308" x2="638" y2="322"/>
            <line x1="654" y1="312" x2="654" y2="329"/>
            <line x1="670" y1="313" x2="670" y2="331"/>
            <line x1="686" y1="312" x2="686" y2="329"/>
            <line x1="702" y1="308" x2="702" y2="322"/>
          </g>
        </g>'''
    else:
        wobble = math.sin(t * 2.5) * 2.8
        impact_ring = ""
        hands_svg = ""
        if alarm_on:
            r_imp = 26 + scare_prog * 34
            impact_ring = f'''
            <g opacity="{clamp(scare_prog * 1.6) * 0.45:.2f}" stroke="#e2e8f0" stroke-width="2" fill="none">
              <circle cx="556" cy="316" r="{r_imp:.1f}"/>
              <circle cx="784" cy="316" r="{r_imp:.1f}"/>
              <line x1="556" y1="316" x2="532" y2="294"/>
              <line x1="784" y1="316" x2="808" y2="294"/>
            </g>'''
            hands_svg = f'''
          <g opacity="{clamp(scare_prog * 2.0):.2f}">
            <g transform="translate(556, 330) rotate(-10)">
              <rect x="-24" y="-12" width="48" height="44" rx="16" fill="url(#tnmnWarmSkin)" stroke="#1c1410" stroke-width="3.4"/>
              <rect x="-24" y="-42" width="10" height="34" rx="5" fill="#e8c3a3" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="-12" y="-50" width="10" height="42" rx="5" fill="#f0d3b6" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="0" y="-52" width="10" height="44" rx="5" fill="#f0d3b6" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="12" y="-44" width="10" height="36" rx="5" fill="#dfb895" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="20" y="-10" width="12" height="28" rx="6" transform="rotate(28, 24, 4)" fill="#dfb895" stroke="#1c1410" stroke-width="2.8"/>
              <path d="M -12,6 Q 0,0 12,8" fill="none" stroke="#b98e6a" stroke-width="2.2" stroke-linecap="round"/>
            </g>
            <g transform="translate(784, 330) rotate(10) scale(-1, 1)">
              <rect x="-24" y="-12" width="48" height="44" rx="16" fill="url(#tnmnWarmSkin)" stroke="#1c1410" stroke-width="3.4"/>
              <rect x="-24" y="-42" width="10" height="34" rx="5" fill="#e8c3a3" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="-12" y="-50" width="10" height="42" rx="5" fill="#f0d3b6" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="0" y="-52" width="10" height="44" rx="5" fill="#f0d3b6" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="12" y="-44" width="10" height="36" rx="5" fill="#dfb895" stroke="#1c1410" stroke-width="2.8"/>
              <rect x="20" y="-10" width="12" height="28" rx="6" transform="rotate(28, 24, 4)" fill="#dfb895" stroke="#1c1410" stroke-width="2.8"/>
              <path d="M -12,6 Q 0,0 12,8" fill="none" stroke="#b98e6a" stroke-width="2.2" stroke-linecap="round"/>
            </g>
          </g>'''
        mouth_close = "Q 670,318 632,312 Z" if alarm_on else ""
        mouth_fill = "#18181b" if alarm_on else "none"
        neighbor_svg = f'''
        <g transform="translate({cx_n:.1f}, {286 + mon_y:.1f}) scale({mon_scale:.3f}) translate({-cx_n:.1f}, -286)">
          <path d="M 552,465 C 562,376 604,350 670,350 C 736,350 778,376 788,465 Z" fill="#574133" stroke="#1c1410" stroke-width="4.5"/>
          <path d="M 618,352 L 654,436 L 622,422 Z" fill="#3f2e24" stroke="#1c1410" stroke-width="2.5"/>
          <path d="M 722,352 L 686,436 L 718,422 Z" fill="#3f2e24" stroke="#1c1410" stroke-width="2.5"/>
          <polygon points="648,352 692,352 670,428" fill="#f5eedc"/>
          <polygon points="664,360 676,360 674,424 666,424" fill="#14532d"/>
          <rect x="650" y="328" width="40" height="30" rx="8" fill="#cfa684" stroke="#1c1410" stroke-width="3.5"/>
          <g transform="translate(0, {wobble:.1f})">
            <ellipse cx="608" cy="272" rx="10" ry="15" fill="#d8b08e" stroke="#1c1410" stroke-width="3.5"/>
            <ellipse cx="732" cy="272" rx="10" ry="15" fill="#e6c3a4" stroke="#1c1410" stroke-width="3.5"/>
            <path d="M 610,252 C 608,200 634,186 670,186 C 706,186 732,200 730,252 L 724,296 C 718,332 696,348 670,350 C 644,348 622,332 616,296 Z" fill="url(#tnmnWarmSkin)" stroke="#1c1410" stroke-width="4.5"/>
            <path d="M 612,220 Q 670,236 728,220 L 728,236 Q 670,250 612,236 Z" fill="#1c1410" opacity="0.22"/>
            <ellipse cx="670" cy="212" rx="88" ry="15" fill="#3b2d25" stroke="#18110d" stroke-width="4"/>
            <path d="M 612,210 L 626,158 Q 652,150 670,158 Q 688,150 714,158 L 728,210 Z" fill="#4f3d33" stroke="#18110d" stroke-width="4" stroke-linejoin="round"/>
            <path d="M 616,197 Q 670,204 724,197 L 726,208 Q 670,215 614,208 Z" fill="#7f1d1d"/>
            <ellipse cx="642" cy="254" rx="11.5" ry="9" fill="#ffffff" stroke="#1c1410" stroke-width="2.8"/>
            <circle cx="642" cy="254" r="4.2" fill="#111827"/>
            <circle cx="640.5" cy="252.5" r="1.4" fill="#ffffff"/>
            <ellipse cx="700" cy="251" rx="15.5" ry="13.5" fill="#ffffff" stroke="#1c1410" stroke-width="2.8"/>
            <circle cx="700" cy="251" r="5" fill="#111827"/>
            <circle cx="698" cy="249" r="1.8" fill="#ffffff"/>
            <path d="M 652,262 C 642,276 638,292 652,293 C 660,293 662,286 658,282" fill="#cfa27e" stroke="#1c1410" stroke-width="3.4" stroke-linecap="round"/>
            <circle cx="648" cy="288" r="2.2" fill="#3f271a"/>
            <path d="M 688,262 C 698,276 702,292 688,293 C 680,293 678,286 682,282" fill="#cfa27e" stroke="#1c1410" stroke-width="3.4" stroke-linecap="round"/>
            <circle cx="692" cy="288" r="2.2" fill="#3f271a"/>
            <path d="M 632,312 Q 670,{332 + scare_prog * 30:.1f} 708,312 {mouth_close}" fill="{mouth_fill}" stroke="#1c1410" stroke-width="3.8" stroke-linecap="round"/>
          </g>
          {hands_svg}
          {impact_ring}
        </g>'''

    btn_glow_attr = ' filter="url(#tnmnGlow)"' if alarm_on else ""

    return f'''
    <rect x="-24" y="-24" width="{W + 48}" height="{H + 48}" fill="url(#tnmnWallGrad)"/>
    <rect x="-24" y="-24" width="{W + 48}" height="106" fill="#171d16"/>
    <line x1="-24" y1="82" x2="{W + 24}" y2="82" stroke="#364133" stroke-width="3"/>
    <line x1="-24" y1="382" x2="{W + 24}" y2="382" stroke="#181f17" stroke-width="3"/>

    <!-- QUADRO DE REGISTROS NA PAREDE DIREITA -->
    <g transform="translate(982, 152)">
      <rect x="6" y="8" width="250" height="278" rx="8" fill="#090c08" opacity="0.52"/>
      <rect x="0" y="0" width="250" height="278" rx="8" fill="#3a2c20" stroke="#17110b" stroke-width="4.5"/>
      <rect x="14" y="14" width="222" height="250" rx="3" fill="#ded4bd"/>
      <circle cx="125" cy="24" r="6" fill="#b91c1c" stroke="#450a0a" stroke-width="2"/>
      <circle cx="123" cy="22" r="2" fill="#fca5a5"/>
      <text x="125" y="50" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="14.5" fill="#292524" letter-spacing="0.5">LISTA DE HOJE · 1955</text>
      <line x1="28" y1="62" x2="222" y2="62" stroke="#78716c" stroke-width="2"/>
      <g font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="11" fill="#44403c">
        <rect x="30" y="76" width="12" height="12" rx="2" fill="none" stroke="#57534e" stroke-width="1.8"/>
        <text x="50" y="86">APTO 101 · M. COSTA</text>
        <rect x="30" y="102" width="12" height="12" rx="2" fill="none" stroke="#57534e" stroke-width="1.8"/>
        <text x="50" y="112">APTO 204 · A. LIMA</text>
        <rect x="30" y="128" width="12" height="12" rx="2" fill="#bbf7d0" stroke="#15803d" stroke-width="1.8"/>
        <text x="50" y="138" fill="#1c1917" font-weight="900">APTO 302 · VERIFICAR</text>
      </g>
      <rect x="28" y="168" width="194" height="38" rx="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2.2"/>
      <text x="125" y="191" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="12" fill="#713f12" letter-spacing="0.4">D.D.D. EMERGENCIA: 3312</text>
      <rect x="44" y="220" width="162" height="28" rx="4" fill="none" stroke="#991b1b" stroke-width="1.8" stroke-dasharray="4,3" opacity="0.72"/>
      <text x="125" y="238" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="10.5" fill="#991b1b" letter-spacing="0.8">CONFIRA O ROSTO!</text>
    </g>

    <!-- JANELA DA PORTARIA -->
    <rect x="390" y="58" width="560" height="400" rx="14" fill="#181410" stroke="#0c0a08" stroke-width="6"/>
    <rect x="398" y="66" width="544" height="384" rx="12" fill="none" stroke="#362e26" stroke-width="2"/>
    <g clip-path="url(#tnmnWinClip)">
      <rect x="404" y="72" width="532" height="372" fill="#101611"/>
      <rect x="436" y="156" width="62" height="190" fill="#0b100c" stroke="#1e271f" stroke-width="2"/>
      <rect x="842" y="156" width="62" height="190" fill="#0b100c" stroke="#1e271f" stroke-width="2"/>
      <line x1="404" y1="306" x2="936" y2="306" stroke="#1f2820" stroke-width="2.5"/>
      <rect x="404" y="72" width="532" height="372" fill="url(#tnmnHallLamp)"/>
      {neighbor_svg}
      <polygon points="424,72 508,72 414,444 404,444" fill="#ffffff" opacity="0.055"/>
      <polygon points="546,72 582,72 488,444 452,444" fill="#ffffff" opacity="0.032"/>
      <g transform="translate(670, 404)">
        <circle cx="0" cy="0" r="24" fill="#27272a" fill-opacity="0.82" stroke="#52525b" stroke-width="3"/>
        <circle cx="0" cy="0" r="16" fill="none" stroke="#71717a" stroke-width="1.5" stroke-dasharray="3,3"/>
        <circle cx="0" cy="0" r="5" fill="#18181b"/>
      </g>
    </g>

    <!-- BALCAO DE MADEIRA DA PORTARIA -->
    <polygon points="-24,460 {W + 24},460 {W + 24},{H + 24} -24,{H + 24}" fill="url(#tnmnCounterGrad)" stroke="#17100b" stroke-width="5"/>
    <line x1="-24" y1="474" x2="{W + 24}" y2="474" stroke="#715540" stroke-width="3" opacity="0.72"/>

    <g transform="translate(38, 480) rotate(3)">
      <rect x="5" y="7" width="210" height="114" rx="8" fill="#140d08" opacity="0.5"/>
      <rect x="0" y="0" width="210" height="114" rx="8" fill="#3f6212" stroke="#1a2e05" stroke-width="4"/>
      <rect x="14" y="13" width="182" height="88" rx="4" fill="#fefce8"/>
      <text x="105" y="40" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#1c1917">REGISTRO DE</text>
      <text x="105" y="57" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#1c1917">MORADORES</text>
      <line x1="28" y1="73" x2="182" y2="73" stroke="#a8a29e" stroke-width="2.5"/>
      <line x1="28" y1="86" x2="152" y2="86" stroke="#a8a29e" stroke-width="2.5"/>
    </g>

    <!-- CARTAO DE IDENTIDADE NA MESA -->
    <g transform="translate(498, 470) rotate(-2)">
      <rect x="6" y="7" width="272" height="122" rx="10" fill="#140d08" opacity="0.52"/>
      <rect x="0" y="0" width="272" height="122" rx="10" fill="#f5eedc" stroke="#292524" stroke-width="3.8"/>
      <path d="M 10,0 L 262,0 C 268,0 272,4 272,10 L 272,25 L 0,25 L 0,10 C 0,4 4,0 10,0 Z" fill="#166534"/>
      <text x="136" y="17" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="12.5" fill="#ffffff" letter-spacing="1">ID MORADOR · APTO 302</text>
      <rect x="14" y="34" width="66" height="74" rx="4" fill="#cbd5e1" stroke="#475569" stroke-width="2.4"/>
      <path d="M 24,106 C 28,90 36,86 47,86 C 58,86 66,90 70,106 Z" fill="#4f3d33"/>
      <circle cx="47" cy="64" r="17" fill="#e5c6a8" stroke="#1c1410" stroke-width="2"/>
      <circle cx="41" cy="61" r="2.2" fill="#111827"/>
      <circle cx="53" cy="61" r="2.2" fill="#111827"/>
      <path d="M 47,63 L 45,69 L 49,69" fill="none" stroke="#1c1410" stroke-width="1.8"/>
      <path d="M 37,73 Q 47,69 57,73" fill="none" stroke="#292524" stroke-width="4" stroke-linecap="round"/>
      <text x="94" y="51" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#1c1917">{'ROBERTO ALVES' if mode == 'cold' else 'CARLOS SILVA'}</text>
      <text x="94" y="69" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="11.5" fill="#44403c">{'OLHOS: 2 (DOIS)' if mode == 'cold' else 'TRACOS: BIGODE'}</text>
      <text x="94" y="85" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="11.5" fill="#44403c">{'SORRISO: NORMAL' if mode == 'cold' else 'NARIZES: 1 (UM)'}</text>
      <rect x="94" y="93" width="114" height="17" rx="4" fill="#bbf7d0" stroke="#15803d" stroke-width="1.5"/>
      <text x="151" y="105" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10" fill="#14532d" letter-spacing="0.5">FOTO OFICIAL</text>
    </g>

    <!-- PAINEL DE BOTOES RETRO: VERDE (ABRIR) + VERMELHO EMERGENCIA (D.D.D.) -->
    <g transform="translate(838, 480)">
      <rect x="4" y="20" width="100" height="72" rx="12" fill="#140d08" opacity="0.45"/>
      <rect x="0" y="14" width="100" height="72" rx="12" fill="#1f2937" stroke="#090d18" stroke-width="3.8"/>
      <rect x="12" y="24" width="76" height="48" rx="8" fill="#16a34a" stroke="#052e16" stroke-width="2.8"/>
      <line x1="18" y1="28" x2="82" y2="28" stroke="#86efac" stroke-width="2" opacity="0.55"/>
      <text x="50" y="53" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#ffffff" letter-spacing="0.6">ABRIR</text>

      <rect x="124" y="10" width="136" height="92" rx="16" fill="#140d08" opacity="0.48"/>
      <rect x="118" y="4" width="136" height="92" rx="16" fill="#27272a" stroke="#090d18" stroke-width="4"/>
      <circle cx="186" cy="50" r="39" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
      {f'<circle cx="186" cy="50" r="44" fill="none" stroke="#ff264d" stroke-width="3" opacity="{0.45 + 0.55 * alarm_pulse:.2f}" filter="url(#tnmnGlow)"/>' if alarm_on else ''}
      <circle cx="186" cy="50" r="33" fill="url(#tnmnRedBtn)" stroke="#450a0a" stroke-width="3.5"{btn_glow_attr}/>
      <ellipse cx="177" cy="36" rx="12" ry="6" transform="rotate(-24, 177, 36)" fill="#ffffff" opacity="0.28"/>
      <text x="186" y="55" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="15.5" fill="#ffffff" letter-spacing="0.8">D.D.D.</text>
    </g>

    <!-- Telefone retro 1955 -->
    <g transform="translate(1134, 488)">
      <path d="M 14,22 C 24,2 96,2 106,22 L 106,42 C 92,48 80,44 76,34 L 44,34 C 40,44 28,48 14,42 Z" fill="#1c1917" stroke="#09090b" stroke-width="3.5"/>
      <rect x="26" y="40" width="68" height="44" rx="10" fill="#292524" stroke="#09090b" stroke-width="3.5"/>
      <circle cx="60" cy="62" r="15" fill="#e7e5e4" stroke="#1c1917" stroke-width="2.5"/>
      <circle cx="60" cy="62" r="5" fill="#1c1917"/>
    </g>

    {f'<rect x="-24" y="-24" width="{W + 48}" height="{H + 48}" fill="#dc2626" opacity="{0.24 * alarm_pulse:.3f}"/>' if alarm_on else ''}'''


def render_tnmn_backdrop_svg(t: float, mode: str = "gameplay", scare_prog: float = 0.0) -> str:
    """Retorna SVG standalone 1280x720 do cenario 1955 de That's Not My Neighbor."""
    alarm_on = scare_prog > 0.05
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    {_build_tnmn_defs(alarm_on)}
  </defs>
  {_build_tnmn_layer(t, mode, scare_prog)}
</svg>'''


# =============================================================================
# COMPOSICAO COMPLETA CENA 1 (COLD OPEN) & CENA 3 (FULLSCREEN -> WEBCAM)
# =============================================================================
def render_gameplay_scene_svg(
    t: float,
    m: dict,
    amp: float,
    emotion: str,
    caption: str,
    scene: int,
) -> str:
    """Compoe o cenario TNMN + Webcam do Robo YouTuber v3 + Selo + Legenda num unico SVG."""
    if scene == 1:
        t_scare = m.get("t_scare", 9999.0)
        scare_p = ease_in_out((t - t_scare) / 0.30) if t >= t_scare else 0.0
        emo = "red" if t >= t_scare else (emotion or "cyan")
        cam_p = 1.0
        mode = "cold"
        panic_shake = 1.0 if t >= t_scare else 0.0
        stamp_text = "ERRO CRITICO DE CORAGEM" if t >= t_scare + 0.55 else ""
        stamp_p = ease_out_back((t - (t_scare + 0.55)) / 0.25) if stamp_text else 0.0
    else:
        t_shrink = m.get("t_shrink", 9999.0)
        t_bang = m.get("t_bang", 9999.0)
        t_rsusp = m.get("t_rsusp", 9999.0)
        t_rintro = m.get("t_rintro", 9999.0)
        shrink_p = ease_in_out((t - t_shrink) / 0.55) if t >= t_shrink else 0.0
        cam_p = shrink_p
        scare_p = ease_in_out((t - t_bang) / 0.28) if t >= t_bang else 0.0
        if t >= t_bang:
            emo = "red"
        elif t >= t_rsusp - 0.15:
            emo = "yellow"
        elif t >= t_rintro + 3.2:
            emo = "green"
        else:
            emo = emotion if emotion in EMOTION_PALETTES else "cyan"
        mode = "gameplay"
        panic_shake = 1.0 if t >= t_bang else 0.0
        stamp_text = "D.D.D. ACIONADO!" if t >= t_bang + 0.35 else ""
        stamp_p = ease_out_back((t - (t_bang + 0.35)) / 0.25) if stamp_text else 0.0

    wb_x = lerp(0.0, 22.0, cam_p)
    wb_y = lerp(0.0, 22.0, cam_p)
    wb_w = lerp(float(W), 368.0, cam_p)
    wb_h = lerp(float(H), 207.0, cam_p)
    wb_rx = lerp(0.0, 16.0, cam_p)

    g_shake_x = math.sin(t * 62.0) * 8.5 * panic_shake
    g_shake_y = math.cos(t * 54.0) * 6.5 * panic_shake
    alarm_on = scare_p > 0.05

    c3_start = m.get("c3_start", -99.0)
    flash_in = clamp(1.0 - (t - c3_start) / 0.20) if scene == 3 and c3_start <= t < c3_start + 0.20 else 0.0

    backdrop_svg = ""
    if cam_p > 0.02:
        backdrop_svg = f'<g transform="translate({g_shake_x:.1f},{g_shake_y:.1f})">{_build_tnmn_layer(t, mode, scare_p)}</g>'

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    {_build_tnmn_defs(alarm_on) if cam_p > 0.02 else ""}
    {_build_webcam_defs(emo, amp, wb_x, wb_y, wb_w, wb_h, wb_rx)}
  </defs>

  <rect width="{W}" height="{H}" fill="#050811"/>
  {backdrop_svg}
  {_build_webcam_layer(t, amp, emo, cam_p, panic_shake)}
  {_svg_stamp(stamp_text, stamp_p)}
  {svg_caption(caption, "robo" if caption else None, emo)}
  {f'<rect width="{W}" height="{H}" fill="#ffffff" opacity="{flash_in:.2f}"/>' if flash_in > 0.01 else ''}
</svg>'''


# Alias de compatibilidade com v2
render_gameplay_composite_svg = render_gameplay_scene_svg


# =============================================================================
# CARTAO FINAL (OUTRO)
# =============================================================================
def render_outro_card_svg(t: float, m: dict) -> str:
    p = ease_in_out((t - m.get("c3_end", 0.0)) / 0.45)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <radialGradient id="outroGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#050811" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="#050811"/>
  <rect width="{W}" height="{H}" fill="url(#outroGlow)"/>
  <g opacity="{p:.3f}">
    <rect x="240" y="228" width="800" height="264" rx="24" fill="#0b1224" stroke="#00f0ff" stroke-width="3"/>
    <line x1="280" y1="231" x2="1000" y2="231" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>
    <text x="640" y="318" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="38" fill="#ffffff" letter-spacing="1.6">PRÉVIA · OPUS YOUTUBER</text>
    <text x="640" y="368" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="22" fill="#38bdf8" letter-spacing="1">THAT'S NOT MY NEIGHBOR · FELIPEX007</text>
    <text x="640" y="422" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="500" font-size="17" fill="#94a3b8">Opus no comando · Abertura Webcam + Mecha Articulado + Boca LED</text>
  </g>
</svg>'''
