#!/usr/bin/env python3
"""
Cena 2 (v3) — Abertura Animada do Felipe (2 Planos Cinematograficos)
Renderizacao SVG 1.1 100% compativel com librsvg / rsvg-convert (1280x720 @ 30fps).

Estrutura da Cena 2:
  - PLANO A (c2_start <= t < t_close - 0.35):
      Tela cheia do PC escuro do Felipe (YouTube Studio mostrando views despencando
      ao vivo + lista de videos recentes em queda + Editor de Video renderizando embaixo)
      + WEBCAM DO FELIPE no canto superior esquerdo (mesma posicao/proporcao 16:9
      da webcam que o Robo YouTuber invade depois!), com close-up expressivo do Felipe
      cansando e soltando o suspiro em t_sigh.
  - PLANO B (t_close - 0.35 <= t <= c2_end):
      Corte limpo pro quarto noturno em enquadramento 3/4 de perto:
      Notebook 2.5D realista com chassi metalico, teclado em perspectiva, trackpad,
      dobradica e tampa com espessura real diretamente a frente do Felipe;
      braco com anatomia natural fechando a tampa em arco real em t_close -> t_close+0.45,
      apagando a luz azulada da tela no rosto/mesa e deixando o clima quente do abajur;
      dolly-in cinematografico durante t_f1 e t_f2 com lip-sync real + flash final em c2_end.

Regras:
  - ZERO emojis no SVG (100% vetores puros).
  - Sem dependencias circulares com visuals_v2.py.
"""
from __future__ import annotations

import html
import math

W, H = 1280, 720
CAM_W, CAM_H = 480.0, 270.0


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return lo if v < lo else (hi if v > hi else v)


def ease_in_out(t: float) -> float:
    t = clamp(t)
    return t * t * (3.0 - 2.0 * t)


def ease_out_cubic(t: float) -> float:
    t = clamp(t)
    return 1.0 - (1.0 - t) ** 3


def ease_in_quad(t: float) -> float:
    t = clamp(t)
    return t * t


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * clamp(t)


def _lerp_pt(
    p1: tuple[float, float], p2: tuple[float, float], t: float
) -> tuple[float, float]:
    return (lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t))


def _quad_pt(
    p00: tuple[float, float],
    p10: tuple[float, float],
    p11: tuple[float, float],
    p01: tuple[float, float],
    u: float,
    v: float,
) -> tuple[float, float]:
    """Interpolacao bilinear exata em um quadrilatero 2.5D."""
    top = (p00[0] + (p10[0] - p00[0]) * u, p00[1] + (p10[1] - p00[1]) * u)
    bot = (p01[0] + (p11[0] - p01[0]) * u, p01[1] + (p11[1] - p01[1]) * u)
    return (top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v)


def _pts_str(pts: list[tuple[float, float]]) -> str:
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)


def _quad_poly(
    p00: tuple[float, float],
    p10: tuple[float, float],
    p11: tuple[float, float],
    p01: tuple[float, float],
    u0: float,
    v0: float,
    u1: float,
    v1: float,
) -> str:
    return _pts_str([
        _quad_pt(p00, p10, p11, p01, u0, v0),
        _quad_pt(p00, p10, p11, p01, u1, v0),
        _quad_pt(p00, p10, p11, p01, u1, v1),
        _quad_pt(p00, p10, p11, p01, u0, v1),
    ])


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


def svg_caption(text: str, speaker: str | None = "felipe", emotion: str = "cyan") -> str:
    """Mesmo estilo exato de legenda glassmorphism do visuals_v2.py."""
    if not text:
        return ""
    lines = wrap_caption(text, 48)
    is_robo = speaker == "robo"
    accent = "#00f0ff" if is_robo else "#38bdf8"
    tag = "IA YOUTUBER" if is_robo else "FELIPE"
    tag_bg = "#0284c7" if is_robo else "#1e3a8a"
    tag_stroke = "#cffafe" if is_robo else "#93c5fd"
    tag_w = 148 if is_robo else 108

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


# =============================================================================
# COMPONENTE COMPARTILHADO: CABECA E EXPRESSOES DO FELIPE (CONSISTENCIA TOTAL)
# =============================================================================
def _build_felipe_head_svg(
    id_prefix: str,
    head_tilt: float,
    tired: float,
    lid_eff: float,
    pupil_dx: float,
    pupil_dy: float,
    mouth_open: float,
    amp: float,
    screen_glow: float,
    sigh_p: float,
    sigh_wave: float,
    brow_worry: float = 0.0,
    face_screen_grad: str = "f3FaceScreen",
    face_warm_grad: str = "f3FaceWarm",
    eye_glint_red: float = 0.0,
) -> str:
    """Cabeca estilizada 2.5D do Felipe com anatomia limpa, cel-shading e lip-sync."""
    # Boca expressiva (fala ou suspiro ou boca cansada fechada)
    if mouth_open > 3.0:
        is_sigh_only = amp < 0.08 and sigh_wave > 0.12
        if is_sigh_only:
            # Boca oval suave de suspiro
            m_rx = 7.2 + sigh_wave * 2.5
            m_ry = clamp(3.2 + sigh_wave * 4.8, 2.5, 8.2)
            mouth_svg = f'''
            <g transform="translate(1, 33)">
              <ellipse cx="0" cy="0" rx="{m_rx:.1f}" ry="{m_ry:.1f}" fill="#3b121c" stroke="#18121e" stroke-width="2.5"/>
              <ellipse cx="0" cy="{m_ry * 0.42:.1f}" rx="{m_rx * 0.45:.1f}" ry="{m_ry * 0.28:.1f}" fill="#882336" opacity="0.72"/>
            </g>'''
        else:
            m_rx = 8.5 + amp * 5.2
            m_ry = clamp(mouth_open * 0.58, 2.6, 10.2)
            mouth_svg = f'''
            <g transform="translate(1, 33)">
              <ellipse cx="0" cy="0" rx="{m_rx:.1f}" ry="{m_ry:.1f}" fill="#4a1622" stroke="#18121e" stroke-width="2.6"/>
              <path d="M {-m_rx * 0.65:.1f},{-m_ry * 0.45:.1f} Q 0,{-m_ry * 0.12:.1f} {m_rx * 0.65:.1f},{-m_ry * 0.45:.1f}" fill="none" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round" opacity="0.88"/>
              <ellipse cx="0" cy="{m_ry * 0.52:.1f}" rx="{m_rx * 0.52:.1f}" ry="{m_ry * 0.32:.1f}" fill="#9f2a3e" opacity="0.72"/>
            </g>'''
    else:
        droop = 28.0 + tired * 2.5
        mouth_svg = (
            f'<path d="M -11,34 Q 1,{droop:.1f} 13,34" fill="none" '
            f'stroke="#18121e" stroke-width="3.2" stroke-linecap="round"/>'
        )

    # Sobrancelhas: inclinam internamente para expressar desanimo/sinceridade
    b_in_y = -13.0 - brow_worry * 4.2
    b_out_y = -10.5 + brow_worry * 2.5

    # Nuvem estilizada e sutil de ar no suspiro
    sigh_svg = ""
    if sigh_wave > 0.04:
        sx = 14.0 + sigh_p * 52.0
        sy = 34.0 - sigh_p * 12.0
        sc = 0.50 + sigh_p * 0.72
        sigh_svg = f'''
        <g opacity="{sigh_wave * 0.74:.2f}" transform="translate({sx:.1f}, {sy:.1f}) scale({sc:.2f})">
          <path d="M 0,4 Q 10,-6 21,1 Q 32,-7 40,4 Q 44,13 31,14 Q 20,18 10,13 Q 1,14 0,4 Z" fill="#dbeafe" fill-opacity="0.62" stroke="#93c5fd" stroke-width="1.6"/>
          <path d="M -12,6 Q -6,3 -1,6" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" opacity="0.68"/>
          <path d="M -8,11 Q -3,9 2,11" fill="none" stroke="#bae6fd" stroke-width="1.6" stroke-linecap="round" opacity="0.52"/>
        </g>'''

    # Brilho sutil vermelho/azul do grafico refletido na pupila (Plano A)
    red_glint_l = (
        f'<circle cx="{-20.5 + pupil_dx:.1f}" cy="{4.2 + pupil_dy:.1f}" r="1.4" fill="#fb7185" opacity="{eye_glint_red:.2f}"/>'
        if eye_glint_red > 0.05
        else ""
    )
    red_glint_r = (
        f'<circle cx="{17.5 + pupil_dx:.1f}" cy="{4.2 + pupil_dy:.1f}" r="1.4" fill="#fb7185" opacity="{eye_glint_red:.2f}"/>'
        if eye_glint_red > 0.05
        else ""
    )

    return f'''
    <g transform="rotate({head_tilt:.2f}, 0, 56)">
      <!-- Orelhas -->
      <ellipse cx="-46" cy="7" rx="9.5" ry="13.5" fill="#e5b08a" stroke="#18121e" stroke-width="3.6"/>
      <path d="M -48,2 Q -43,7 -47,12" fill="none" stroke="#b87e5a" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="46" cy="7" rx="9.5" ry="13.5" fill="#f3c5a0" stroke="#18121e" stroke-width="3.6"/>
      <path d="M 48,2 Q 43,7 47,12" fill="none" stroke="#c8926d" stroke-width="2" stroke-linecap="round"/>

      <!-- Rosto esculpido -->
      <path d="M -46,-26 C -46,-54 -26,-62 0,-62 C 26,-62 46,-54 46,-26 L 44,12 C 42,36 22,54 0,56 C -22,54 -42,36 -44,12 Z" fill="url(#{id_prefix}Skin)" stroke="#18121e" stroke-width="4"/>

      <!-- Sombreamento 2.5D + Luz da Tela + Rim Quente recortados no rosto -->
      <g clip-path="url(#{id_prefix}FaceClip)">
        <path d="M -48,-62 L -14,-62 C -26,-24 -26,24 -4,58 L -48,58 Z" fill="#c98c66" opacity="0.28"/>
        <rect x="-50" y="-65" width="100" height="125" fill="url(#{face_screen_grad})"/>
        <rect x="-50" y="-65" width="100" height="125" fill="url(#{face_warm_grad})"/>
      </g>

      <!-- Olheiras sutis de cansaco -->
      <path d="M -29,14.5 Q -18,20.5 -7,14.5" fill="none" stroke="#8f5b67" stroke-width="2.4" stroke-linecap="round" opacity="{0.18 + tired * 0.56:.2f}"/>
      <path d="M 9,14.5 Q 20,20.5 31,14.5" fill="none" stroke="#8f5b67" stroke-width="2.4" stroke-linecap="round" opacity="{0.18 + tired * 0.56:.2f}"/>

      <!-- Olho Esquerdo -->
      <g>
        <ellipse cx="-18" cy="2" rx="11.5" ry="9.8" fill="#f8fafc"/>
        <g clip-path="url(#{id_prefix}EyeLClip)">
          <circle cx="{-18 + pupil_dx:.1f}" cy="{2 + pupil_dy:.1f}" r="5.6" fill="#251d1a"/>
          <circle cx="{-18 + pupil_dx:.1f}" cy="{2 + pupil_dy:.1f}" r="2.9" fill="#09070a"/>
          <circle cx="{-16 + pupil_dx:.1f}" cy="{-0.2 + pupil_dy:.1f}" r="1.9" fill="#ffffff"/>
          {red_glint_l}
          <rect x="-32" y="-10" width="28" height="{4 + 21 * lid_eff:.1f}" fill="#0f172a" opacity="0.16"/>
          <path d="M -32,-12 L -4,-12 L -4,{-9 + 21 * lid_eff:.1f} Q -18,{-6 + 21 * lid_eff:.1f} -32,{-9 + 21 * lid_eff:.1f} Z" fill="#ebb992" stroke="#18121e" stroke-width="2.5"/>
        </g>
        <ellipse cx="-18" cy="2" rx="11.5" ry="9.8" fill="none" stroke="#18121e" stroke-width="2.6"/>
      </g>

      <!-- Olho Direito -->
      <g>
        <ellipse cx="20" cy="2" rx="11.5" ry="9.8" fill="#f8fafc"/>
        <g clip-path="url(#{id_prefix}EyeRClip)">
          <circle cx="{20 + pupil_dx:.1f}" cy="{2 + pupil_dy:.1f}" r="5.6" fill="#251d1a"/>
          <circle cx="{20 + pupil_dx:.1f}" cy="{2 + pupil_dy:.1f}" r="2.9" fill="#09070a"/>
          <circle cx="{22 + pupil_dx:.1f}" cy="{-0.2 + pupil_dy:.1f}" r="1.9" fill="#ffffff"/>
          {red_glint_r}
          <rect x="6" y="-10" width="28" height="{4 + 21 * lid_eff:.1f}" fill="#0f172a" opacity="0.16"/>
          <path d="M 6,-12 L 34,-12 L 34,{-9 + 21 * lid_eff:.1f} Q 20,{-6 + 21 * lid_eff:.1f} 6,{-9 + 21 * lid_eff:.1f} Z" fill="#f2c49e" stroke="#18121e" stroke-width="2.5"/>
        </g>
        <ellipse cx="20" cy="2" rx="11.5" ry="9.8" fill="none" stroke="#18121e" stroke-width="2.6"/>
      </g>

      <!-- Nariz sutil -->
      <path d="M 2,6 L 0,17 L 5,18" fill="none" stroke="#b87e5a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Sobrancelhas expressivas -->
      <path d="M -31,{b_out_y:.1f} Q -18,{b_in_y - 3.0:.1f} -6,{b_in_y:.1f}" fill="none" stroke="#1c182c" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M 8,{b_in_y:.1f} Q 20,{b_in_y - 3.0:.1f} 33,{b_out_y:.1f}" fill="none" stroke="#1c182c" stroke-width="3.8" stroke-linecap="round"/>

      <!-- Boca -->
      {mouth_svg}

      <!-- Cabelo em camadas -->
      <path d="M -50,-10 C -56,-56 -32,-80 4,-79 C 38,-78 58,-56 52,-10 C 46,-24 38,-32 28,-22 C 24,-34 12,-42 -2,-26 C -8,-38 -20,-42 -32,-24 C -38,-32 -45,-26 -50,-10 Z" fill="url(#{id_prefix}Hair)" stroke="#0d0b17" stroke-width="4" stroke-linejoin="round"/>
      <path d="M -18,-74 Q -4,-86 12,-76" fill="none" stroke="#19162b" stroke-width="6" stroke-linecap="round"/>
      <path d="M -28,-56 Q 2,-68 32,-52" fill="none" stroke="#64748b" stroke-width="4.5" stroke-linecap="round" opacity="0.48"/>
      <path d="M 28,-50 Q 44,-36 46,-18" fill="none" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round" opacity="{0.44 * screen_glow:.2f}"/>

      {sigh_svg}
    </g>'''


# =============================================================================
# PLANO A: TELA DO PC (YOUTUBE STUDIO + EDITOR) + WEBCAM DO FELIPE NO CANTO
# =============================================================================
def _build_felipe_webcam_interior(
    t: float,
    local_t: float,
    amp: float,
    tired: float,
    sigh_p: float,
    sigh_wave: float,
    graph_p: float,
) -> str:
    """Interior 480x270 (16:9) da Webcam do Felipe no quarto noturno olhando a tela."""
    # Postura cansando gradualmente + ombros arriando no suspiro
    inhale = math.sin(clamp(sigh_p / 0.28) * math.pi) if sigh_p < 0.28 else 0.0
    exhale = ease_in_out((sigh_p - 0.22) / 0.78) if sigh_p > 0.22 else 0.0
    slump_y = tired * 15.0 - inhale * 4.5 + exhale * 11.0
    breath_y = math.sin(t * 2.2) * 1.4
    head_tilt = tired * 6.5 - inhale * 3.0 + exhale * 6.0

    # Palpebras pesadas + fecha os olhos no auge do suspiro
    blink = 1.0 if (int(t * 10) % 34 == 0) else 0.0
    lid_drop = 0.22 + tired * 0.44 + sigh_wave * 0.34
    lid_eff = clamp(lid_drop + blink * 0.62, 0.16, 0.97)

    # Olhos escaneiam o grafico caindo (olhando ligeiramente pra frente-direita/baixo)
    scan_x = math.sin(local_t * 1.15) * 1.6 + lerp(1.5, 3.2, graph_p)
    scan_y = lerp(0.5, 3.4, graph_p) + exhale * 1.5

    # Mao esquerda sobe suavemente para apoiar o rosto/bochecha cansado
    hand_up = ease_in_out((local_t - 0.85) / 0.95)
    hand_x = lerp(118.0, 196.0, hand_up)
    hand_y = lerp(285.0, 178.0 + slump_y * 0.72, hand_up)
    elb_x = lerp(124.0, 152.0, hand_up)
    elb_y = lerp(296.0, 266.0, hand_up)

    # Boca no suspiro
    mouth_open = 6.2 * sigh_wave
    brow_worry = clamp(tired * 0.85 + sigh_wave * 0.35)

    # Ceu/nuvem na janela de fundo
    cloud_dx = (local_t * 2.4) % 32.0

    # Janelinhas na cidade ao fundo da webcam
    mini_city_wins = []
    for bx, by, bw, bh in [(8, 72, 22, 46), (34, 58, 26, 60), (64, 68, 24, 50), (92, 54, 28, 64)]:
        for wy in range(by + 7, by + bh - 8, 9):
            for wx in range(bx + 5, bx + bw - 6, 8):
                hsh = (wx * 19 + wy * 13) % 9
                if hsh in (1, 4):
                    wcol = "#fde68a" if hsh == 1 else "#93c5fd"
                    mini_city_wins.append(
                        f'<rect x="{wx}" y="{wy}" width="3.5" height="4.8" rx="0.8" fill="{wcol}" opacity="0.68"/>'
                    )

    # Posicao central do Felipe na webcam (close-up bem legivel!)
    fx = 242.0
    fy = 128.0 + slump_y + breath_y

    head_svg = _build_felipe_head_svg(
        id_prefix="wc",
        head_tilt=head_tilt,
        tired=tired,
        lid_eff=lid_eff,
        pupil_dx=scan_x,
        pupil_dy=scan_y,
        mouth_open=mouth_open,
        amp=amp,
        screen_glow=1.0,
        sigh_p=sigh_p,
        sigh_wave=sigh_wave,
        brow_worry=brow_worry,
        face_screen_grad="wcFaceScreen",
        face_warm_grad="wcFaceWarm",
        eye_glint_red=0.55 + 0.35 * graph_p,
    )

    return f'''
    <g>
      <!-- PAREDE NOTURNA DO QUARTO (FUNDO DA WEBCAM) -->
      <rect x="0" y="0" width="480" height="270" fill="url(#wcWall)"/>
      <!-- Halo quente do abajur no canto direito do quarto -->
      <circle cx="436" cy="182" r="165" fill="url(#wcWarmBg)"/>
      <!-- Reflexo azulado do monitor iluminando o ambiente de frente -->
      <ellipse cx="240" cy="255" rx="230" ry="125" fill="url(#wcScreenBounce)"/>

      <!-- JANELA NOTURNA A ESQUERDA -->
      <g transform="translate(16, 22)">
        <rect x="3" y="4" width="124" height="122" rx="5" fill="#02050d" opacity="0.5"/>
        <g clip-path="url(#wcWinClip)">
          <rect x="0" y="0" width="124" height="122" fill="url(#wcSky)"/>
          <circle cx="92" cy="30" r="28" fill="#fef3c7" opacity="0.18"/>
          <circle cx="92" cy="30" r="11" fill="#fef3c7" opacity="0.92"/>
          <circle cx="97" cy="27" r="9.4" fill="#081329"/>
          <circle cx="20" cy="18" r="1.4" fill="#f8fafc" opacity="0.85"/>
          <circle cx="52" cy="14" r="1.1" fill="#93c5fd" opacity="0.72"/>
          <circle cx="64" cy="36" r="1.3" fill="#e2e8f0" opacity="0.78"/>
          <circle cx="28" cy="46" r="1.1" fill="#bfdbfe" opacity="0.65"/>
          <g opacity="0.16" transform="translate({-10 + cloud_dx:.1f}, 0)">
            <ellipse cx="42" cy="42" rx="22" ry="5.5" fill="#93c5fd"/>
            <ellipse cx="88" cy="56" rx="18" ry="4.5" fill="#bfdbfe"/>
          </g>
          <rect x="8" y="72" width="22" height="50" fill="#091022"/>
          <rect x="34" y="58" width="26" height="64" fill="#0b1327"/>
          <rect x="64" y="68" width="24" height="54" fill="#091022"/>
          <rect x="92" y="54" width="28" height="68" fill="#0c152a"/>
          {"".join(mini_city_wins)}
        </g>
        <rect x="0" y="0" width="124" height="122" rx="5" fill="none" stroke="#243152" stroke-width="5.5"/>
        <line x1="62" y1="0" x2="62" y2="122" stroke="#243152" stroke-width="3.2"/>
        <line x1="0" y1="61" x2="124" y2="61" stroke="#243152" stroke-width="3.2"/>
      </g>

      <!-- POSTER FELIPEX007 + PLACA 100K + PRATELEIRA AO FUNDO DIREITO -->
      <g transform="translate(306, 20)">
        <rect x="3" y="4" width="106" height="68" rx="6" fill="#02050d" opacity="0.48"/>
        <rect x="0" y="0" width="106" height="68" rx="6" fill="#111930" stroke="#334155" stroke-width="3"/>
        <rect x="5" y="5" width="96" height="58" rx="3" fill="#0b1124"/>
        <rect x="31" y="13" width="44" height="29" rx="7" fill="#dc2626"/>
        <polygon points="48,20 48,35 61,27.5" fill="#ffffff"/>
        <text x="53" y="55" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="9.5" fill="#e2e8f0" letter-spacing="1.0">FELIPEX007</text>
      </g>
      <!-- Prateleira + Placa Prata 100K -->
      <g transform="translate(364, 96)">
        <rect x="44" y="0" width="32" height="42" rx="4" fill="url(#wcPlaque)" stroke="#1e293b" stroke-width="2"/>
        <rect x="52" y="11" width="16" height="11" rx="3" fill="#1e293b"/>
        <polygon points="58,14 58,19 63,16.5" fill="#e2e8f0"/>
        <line x1="51" y1="29" x2="69" y2="29" stroke="#334155" stroke-width="1.6"/>
        <rect x="-6" y="42" width="108" height="8" rx="3" fill="#24304c" stroke="#0d1324" stroke-width="2"/>
        <rect x="-2" y="49" width="100" height="3" rx="1.5" fill="#818cf8" opacity="0.72" filter="url(#wcGlow)"/>
      </g>
      <!-- Abajur quente no canto direito -->
      <g transform="translate(412, 162)">
        <rect x="20" y="52" width="7" height="56" rx="2" fill="#475569" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="24" cy="52" rx="18" ry="6" fill="#fef08a" opacity="0.65" filter="url(#wcGlow)"/>
        <polygon points="4,54 44,54 35,10 13,10" fill="url(#wcLamp)" stroke="#1e150a" stroke-width="2.4" stroke-linejoin="round"/>
      </g>

      <!-- CADEIRA GAMER ATRAS DO FELIPE -->
      <g transform="translate(148, 86)">
        <path d="M 6,192 L 14,34 C 16,10 44,0 94,0 C 144,0 172,10 174,34 L 182,192 Z" fill="#182238" stroke="#080c17" stroke-width="4"/>
        <path d="M 24,192 L 30,40 C 32,22 54,14 94,14 C 134,14 156,22 158,40 L 164,192 Z" fill="#0f1628"/>
        <path d="M 12,72 L 24,72 L 20,164 L 8,164 Z" fill="#1e3a8a" opacity="0.72"/>
        <path d="M 176,72 L 164,72 L 168,164 L 180,164 Z" fill="#1e3a8a" opacity="0.72"/>
        <rect x="50" y="34" width="88" height="26" rx="11" fill="#26334f" stroke="#090d18" stroke-width="2.5"/>
      </g>

      <!-- FELIPE CLOSE-UP NA WEBCAM -->
      <g transform="translate({fx:.1f}, {fy:.1f}) scale(1.06)">
        <!-- Tronco / Moletom azul com luz frontal da tela -->
        <path d="M -92,164 C -96,98 -64,74 0,74 C 66,74 98,98 94,164 Z" fill="url(#wcHoodie)" stroke="#0b1020" stroke-width="4.2"/>
        <path d="M -88,162 C -90,104 -60,80 -18,76 L -30,162 Z" fill="#13204a" opacity="0.58"/>
        <!-- Luz azulada da tela no peito -->
        <ellipse cx="4" cy="116" rx="58" ry="34" fill="#38bdf8" opacity="0.22"/>
        <!-- Rim quente do abajur no ombro direito -->
        <path d="M 52,78 C 82,92 92,124 92,162 L 76,162 C 74,126 66,96 52,78 Z" fill="#fbbf24" opacity="0.24"/>
        <!-- Capuz dobrado + cordoes -->
        <path d="M -48,78 C -24,106 24,106 48,78 C 28,65 -28,65 -48,78 Z" fill="#1e40af" stroke="#0b1020" stroke-width="3.6"/>
        <path d="M -15,96 Q -18,120 -16,142" fill="none" stroke="#e2e8f0" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M 15,96 Q 19,120 17,140" fill="none" stroke="#e2e8f0" stroke-width="3.2" stroke-linecap="round"/>

        <!-- Headset gamer no pescoco -->
        <path d="M -42,82 Q 0,118 44,82" fill="none" stroke="#0b1020" stroke-width="10.5" stroke-linecap="round"/>
        <path d="M -42,82 Q 0,118 44,82" fill="none" stroke="#1e293b" stroke-width="6.8" stroke-linecap="round"/>
        <rect x="-52" y="70" width="18" height="29" rx="8" fill="#334155" stroke="#090d18" stroke-width="2.8"/>
        <rect x="-47" y="76" width="5" height="16" rx="2.5" fill="#38bdf8" opacity="0.82"/>
        <rect x="36" y="70" width="18" height="29" rx="8" fill="#334155" stroke="#090d18" stroke-width="2.8"/>
        <rect x="44" y="76" width="5" height="16" rx="2.5" fill="#38bdf8" opacity="0.82"/>

        <!-- Pescoco -->
        <path d="M -17,48 L 17,48 L 19,82 Q 0,90 -19,82 Z" fill="#dfa880" stroke="#0b1020" stroke-width="3.6"/>
        <path d="M -16,52 Q 0,66 16,52 L 16,64 Q 0,74 -16,64 Z" fill="#b87e5a" opacity="0.55"/>

        <!-- Cabeca expressiva do Felipe -->
        {head_svg}
      </g>

      <!-- BRACO + MAO ESQUERDA APOIANDO O ROSTO COM ANATOMIA NATURAL -->
      <g opacity="{clamp(hand_up * 1.4):.2f}">
        <path d="M 148,292 Q {elb_x:.1f},{elb_y:.1f} {hand_x - 2:.1f},{hand_y + 12:.1f}" fill="none" stroke="#0b1020" stroke-width="30" stroke-linecap="round"/>
        <path d="M 148,292 Q {elb_x:.1f},{elb_y:.1f} {hand_x - 2:.1f},{hand_y + 12:.1f}" fill="none" stroke="#1d4ed8" stroke-width="22" stroke-linecap="round"/>
        <!-- Punho do moletom -->
        <circle cx="{hand_x - 2:.1f}" cy="{hand_y + 14:.1f}" r="11" fill="#172554" stroke="#0b1020" stroke-width="2.6"/>
        <!-- Mao natural apoiada sob a bochecha esquerda (nao cobre a boca!) -->
        <g transform="translate({hand_x:.1f}, {hand_y:.1f}) rotate(-18)">
          <rect x="-12" y="-8" width="24" height="20" rx="8.5" fill="#f3c5a0" stroke="#18121e" stroke-width="2.8"/>
          <rect x="-12" y="-18" width="5.8" height="14" rx="2.9" fill="#f8d5b8" stroke="#18121e" stroke-width="2"/>
          <rect x="-5.5" y="-21" width="5.8" height="16" rx="2.9" fill="#f8d5b8" stroke="#18121e" stroke-width="2"/>
          <rect x="1" y="-20" width="5.8" height="15" rx="2.9" fill="#f3c5a0" stroke="#18121e" stroke-width="2"/>
          <rect x="7.5" y="-16" width="5.4" height="12" rx="2.7" fill="#e5b08a" stroke="#18121e" stroke-width="2"/>
        </g>
      </g>

      <!-- MICROFONE DISCRETO NO CANTO INFERIOR DIREITO (PARALELO COM A WEBCAM DO ROBO!) -->
      <g opacity="0.92">
        <line x1="490" y1="276" x2="438" y2="236" stroke="#090d18" stroke-width="10" stroke-linecap="round"/>
        <line x1="490" y1="276" x2="438" y2="236" stroke="#273247" stroke-width="6" stroke-linecap="round"/>
        <g transform="translate(428, 212) rotate(-18)">
          <rect x="-13" y="-18" width="26" height="38" rx="11" fill="#1e293b" stroke="#090d18" stroke-width="2.4"/>
          <rect x="-9" y="-14" width="18" height="18" rx="7" fill="#334155"/>
          <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#64748b" stroke-width="1.4"/>
          <line x1="-8" y1="-3" x2="8" y2="-3" stroke="#64748b" stroke-width="1.4"/>
          <rect x="-9" y="8" width="18" height="2.8" rx="1.4" fill="#38bdf8" opacity="{0.55 + sigh_wave * 0.4:.2f}"/>
        </g>
      </g>

      <!-- Vinheta sutil de lente de webcam -->
      <rect x="0" y="0" width="480" height="270" fill="none" stroke="#020617" stroke-width="16" opacity="0.45"/>
    </g>'''


def _render_plano_a_webcam_studio(
    t: float,
    m: dict,
    amp: float,
    caption: str,
) -> str:
    """PLANO A: Tela cheia do PC (YouTube Studio + Editor) + Webcam do Felipe no canto."""
    c2s = m["c2_start"]
    t_sigh = m["t_sigh"]
    t_cut = m["t_close"] - 0.35

    local_t = max(0.0, t - c2s)
    dur_a = max(0.5, t_cut - c2s)

    # Fadiga + curva despencando ao vivo
    tired = ease_in_out(local_t / max(0.6, (t_sigh - c2s + 0.15)))
    graph_p = ease_in_out(local_t / max(0.6, (t_sigh - c2s - 0.25)))

    # Suspiro em t_sigh (acontece completo antes do corte!)
    sigh_dur = max(0.85, min(1.08, t_cut - t_sigh))
    sigh_p = clamp((t - t_sigh) / sigh_dur) if t >= t_sigh else 0.0
    sigh_wave = math.sin(sigh_p * math.pi) if 0.0 < sigh_p < 1.0 else 0.0

    # --- CURVA VERMELHA NEON DO YOUTUBE STUDIO ---
    # Plot: x=462..866 (w=404), y=214..422 (h=208)
    raw_pts = [
        (0.00, 0.08),
        (0.11, 0.12),
        (0.22, 0.10),
        (0.34, 0.24),
        (0.45, 0.21),
        (0.56, 0.44),
        (0.68, 0.58),
        (0.79, 0.74),
        (0.90, 0.86),
        (1.00, 0.94),
    ]
    gx0, gy0, gw, gh = 462.0, 214.0, 404.0, 208.0
    f_idx = 1.0 + graph_p * (len(raw_pts) - 2)
    n_full = int(f_idx)
    frac_seg = f_idx - n_full
    vis_pts = [(gx0 + px * gw, gy0 + py * gh) for px, py in raw_pts[: n_full + 1]]
    if n_full + 1 < len(raw_pts):
        x1, y1 = raw_pts[n_full]
        x2, y2 = raw_pts[n_full + 1]
        vis_pts.append((gx0 + lerp(x1, x2, frac_seg) * gw, gy0 + lerp(y1, y2, frac_seg) * gh))
    poly_pts = _pts_str(vis_pts)
    last_gx, last_gy = vis_pts[-1]
    area_pts = f"{gx0:.1f},{gy0 + gh:.1f} " + poly_pts + f" {last_gx:.1f},{gy0 + gh:.1f}"

    pct_drop = int(round(lerp(-12.0, -68.0, graph_p)))
    views_k = lerp(42.8, 14.2, graph_p)
    views_str = f"{views_k:.1f} mil".replace(".", ",")
    rt_views = int(round(lerp(980, 412, graph_p)))
    pulse = 0.5 + 0.5 * math.sin(t * 7.5)

    # Mini-grafico de barras "Tempo real · 48h" abaixo da webcam
    rt_bars = []
    for i in range(24):
        u = i / 23.0
        # Barras altas na esquerda morrendo pra quase zero na direita
        base_h = (1.0 - u * 0.86) * (0.72 + 0.28 * math.sin(i * 1.4 + 0.3))
        h_px = clamp(base_h * 58.0 * lerp(1.0, 0.78 if u > 0.5 else 1.0, graph_p), 4.0, 58.0)
        bx = 40.0 + i * 13.8
        by = 456.0 - h_px
        bcol = "#38bdf8" if u < 0.45 else ("#f97316" if u < 0.75 else "#f43f5e")
        rt_bars.append(
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="9.2" height="{h_px:.1f}" rx="2.2" fill="{bcol}" opacity="{0.86 if u > 0.75 else 0.74:.2f}"/>'
        )

    # Lista de "Videos recentes" (4 videos mostrando a queda clara!)
    recent_videos = [
        (
            "SOBREVIVI 100 DIAS...",
            "42 mil views",
            "há 3 sem",
            164,
            "#38bdf8",
            "#cbd5e1",
            "14:22",
            False,
            "#0ea5e9",
            "#1e3a8a",
        ),
        (
            "ESSE JOGO ME ASSUSTOU",
            "19 mil views",
            "há 2 sem",
            98,
            "#f59e0b",
            "#fde68a",
            "18:05",
            False,
            "#d97706",
            "#4c1d95",
        ),
        (
            "JOGANDO DE MADRUGADA",
            "6,4 mil views",
            "há 1 sem",
            46,
            "#f97316",
            "#fdba74",
            "12:48",
            False,
            "#ea580c",
            "#1f2937",
        ),
        (
            "NOVO VIDEO DO CANAL",
            "1,8 mil views",
            "ontem",
            18,
            "#f43f5e",
            "#fb7185",
            "16:10",
            True,
            "#e11d48",
            "#181024",
        ),
    ]
    vid_cards_svg = []
    for idx, (title, vtxt, when, bar_w, bar_c, vcol, dur_s, is_worst, th_c1, th_c2) in enumerate(recent_videos):
        cy = 116 + idx * 86
        card_bg = "#1e0d18" if is_worst else "#0f172a"
        card_st = "#f43f5e" if is_worst else "#1e293b"
        st_w = "1.8" if is_worst else "1.2"
        # Miniatura vetorial distinta para cada video
        if idx == 0:
            thumb_art = (
                '<circle cx="44" cy="24" r="14" fill="#38bdf8" opacity="0.32"/>'
                '<polygon points="10,44 34,20 56,36 74,18 86,44" fill="#0f172a" opacity="0.72"/>'
                '<circle cx="64" cy="14" r="5" fill="#fde68a"/>'
            )
        elif idx == 1:
            thumb_art = (
                '<rect x="14" y="10" width="60" height="34" rx="4" fill="#090d18" opacity="0.55"/>'
                '<circle cx="34" cy="26" r="5" fill="#facc15"/>'
                '<circle cx="54" cy="26" r="5" fill="#facc15"/>'
                '<path d="M 32,38 Q 44,32 56,38" fill="none" stroke="#fb7185" stroke-width="2.5" stroke-linecap="round"/>'
            )
        elif idx == 2:
            thumb_art = (
                '<polygon points="24,48 34,14 54,14 64,48" fill="#020617" opacity="0.72"/>'
                '<circle cx="44" cy="22" r="7" fill="#fb923c" opacity="0.75"/>'
                '<line x1="12" y1="42" x2="76" y2="42" stroke="#475569" stroke-width="2"/>'
            )
        else:
            thumb_art = (
                '<rect x="12" y="12" width="64" height="30" rx="4" fill="#090d18" opacity="0.65"/>'
                '<polyline points="18,18 38,24 54,32 70,38" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>'
                '<circle cx="70" cy="38" r="3.5" fill="#ffffff"/>'
            )

        down_arrow = (
            f'<polygon points="{1028 + bar_w + 10},{cy + 58} {1028 + bar_w + 18},{cy + 58} {1028 + bar_w + 14},{cy + 65}" fill="{bar_c}"/>'
            if idx >= 1
            else ""
        )
        worst_badge = (
            f'<rect x="1174" y="{cy + 49}" width="58" height="17" rx="5" fill="#7f1d1d" stroke="#f43f5e" stroke-width="1"/>'
            f'<text x="1203" y="{cy + 61}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="9" fill="#fecdd3">10 de 10</text>'
            if is_worst
            else ""
        )
        vid_cards_svg.append(f'''
        <g>
          <rect x="920" y="{cy}" width="322" height="76" rx="10" fill="{card_bg}" stroke="{card_st}" stroke-width="{st_w}"/>
          <!-- Miniatura vetorial -->
          <g transform="translate(928, {cy + 12})">
            <rect x="0" y="0" width="88" height="52" rx="6" fill="{th_c2}" stroke="#334155" stroke-width="1.2"/>
            <rect x="0" y="0" width="88" height="24" rx="6" fill="{th_c1}" opacity="0.38"/>
            {thumb_art}
            <rect x="55" y="37" width="29" height="12" rx="3" fill="#020617" fill-opacity="0.86"/>
            <text x="69.5" y="46" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="8.2" fill="#f8fafc">{dur_s}</text>
          </g>
          <!-- Titulo + Views + Barrinha caindo -->
          <text x="1028" y="{cy + 22}" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="11.2" fill="#e2e8f0">{title}</text>
          <text x="1028" y="{cy + 41}" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="{vcol}">{vtxt}</text>
          <text x="1232" y="{cy + 41}" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="9.8" fill="#64748b">{when}</text>
          <rect x="1028" y="{cy + 56}" width="174" height="7" rx="3.5" fill="#1e293b"/>
          <rect x="1028" y="{cy + 56}" width="{bar_w}" height="7" rx="3.5" fill="{bar_c}"/>
          {down_arrow}
          {worst_badge}
        </g>''')

    # --- EDITOR DE VIDEO EMBAIXO (TIMELINE + RENDER CANSATIVO) ---
    # Cursor anda enquanto edita e para quando desanima/suspira
    edit_active = clamp(1.0 - ease_in_out((t - (t_sigh - 0.55)) / 0.5))
    playhead_progress = min(local_t, max(0.0, t_sigh - c2s - 0.15))
    playhead_x = 418.0 + (playhead_progress * 68.0) % 790.0
    render_pct = int(34 + clamp(local_t / dur_a) * 3)
    render_w = 302.0 * (render_pct / 100.0)
    shimmer_x = (local_t * 42.0) % 28.0

    # Waveform de audio na timeline A1 (x=418..1228)
    wf_pts = []
    for i in range(116):
        wx = 418.0 + i * 7.0
        wh = 4.0 + 13.0 * abs(math.sin(i * 0.78 + 0.5) * math.cos(i * 0.31))
        wf_pts.append(f"{wx:.1f},{650.0 - wh:.1f}")
    wf_poly = " ".join(wf_pts)

    # Cursor do mouse deslizando sobre o grafico/videos (sincronizado com mouse-click aos ~9.25s!)
    cur_p = ease_in_out(local_t / 2.2)
    cur_x = lerp(640.0, 995.0, cur_p) + math.sin(local_t * 3.0) * 4.0 * edit_active
    cur_y = lerp(310.0, 412.0, cur_p) + math.cos(local_t * 2.5) * 3.0 * edit_active
    click_ring = ""
    if 9.20 <= t <= 9.55:
        cp = (t - 9.20) / 0.35
        click_ring = f'<circle cx="{cur_x:.1f}" cy="{cur_y:.1f}" r="{6.0 + cp * 18.0:.1f}" fill="none" stroke="#fb7185" stroke-width="2.2" opacity="{1.0 - cp:.2f}"/>'

    # --- WEBCAM DO FELIPE (MESMA POSICAO EXATA DA WEBCAM DO ROBO: 22, 22, 368, 207) ---
    wb_x, wb_y, wb_w, wb_h, wb_rx = 22.0, 22.0, 368.0, 207.0, 16.0
    wb_sc = wb_w / CAM_W
    rec_dot = 1.0 if int(t * 2.0) % 2 == 0 else 0.24
    secs = max(0, int(t))
    tc_wb = f"{secs // 60:02d}:{secs % 60:02d}"

    vu_bars = []
    vu_level = max(amp, sigh_wave * 0.52)
    for i in range(4):
        vh = clamp(3.0 + vu_level * 11.0 * (0.45 + 0.55 * abs(math.sin(t * 20.0 + i * 1.1))), 3.0, 12.5)
        vu_bars.append(
            f'<rect x="{84 + i * 4.5:.1f}" y="{18.5 - vh:.1f}" width="2.8" height="{vh:.1f}" rx="1.2" fill="#38bdf8"/>'
        )

    # Cantoneiras da webcam (mesmo DNA visual do visuals_v2.py!)
    bl = 16.0
    x1, y1, x2, y2 = wb_x - 3, wb_y - 3, wb_x + wb_w + 3, wb_y + wb_h + 3

    webcam_inner = _build_felipe_webcam_interior(
        t=t,
        local_t=local_t,
        amp=amp,
        tired=tired,
        sigh_p=sigh_p,
        sigh_wave=sigh_wave,
        graph_p=graph_p,
    )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <!-- Filtros & Clips -->
    <filter id="aGlowRed" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="aShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="wcGlow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="4.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <clipPath id="aWbClip">
      <rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}"/>
    </clipPath>
    <clipPath id="aRenderClip">
      <rect x="44" y="576" width="{render_w:.1f}" height="16" rx="8"/>
    </clipPath>
    <clipPath id="wcWinClip">
      <rect x="0" y="0" width="124" height="122" rx="4"/>
    </clipPath>
    <clipPath id="wcFaceClip">
      <path d="M -46,-26 C -46,-54 -26,-62 0,-62 C 26,-62 46,-54 46,-26 L 44,12 C 42,36 22,54 0,56 C -22,54 -42,36 -44,12 Z"/>
    </clipPath>
    <clipPath id="wcEyeLClip"><ellipse cx="-18" cy="2" rx="11.5" ry="9.8"/></clipPath>
    <clipPath id="wcEyeRClip"><ellipse cx="20" cy="2" rx="11.5" ry="9.8"/></clipPath>

    <!-- Gradientes do Desktop / YouTube Studio -->
    <linearGradient id="aRedArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.46"/>
      <stop offset="68%" stop-color="#ef4444" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aRenderFill" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="65%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>

    <!-- Gradientes da Webcam do Felipe -->
    <linearGradient id="wcWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090e1e"/>
      <stop offset="60%" stop-color="#131c36"/>
      <stop offset="100%" stop-color="#18203a"/>
    </linearGradient>
    <linearGradient id="wcSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#040814"/>
      <stop offset="100%" stop-color="#16254a"/>
    </linearGradient>
    <radialGradient id="wcWarmBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.46"/>
      <stop offset="55%" stop-color="#ea580c" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#090e1e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="wcScreenBounce" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28"/>
      <stop offset="65%" stop-color="#2563eb" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#090e1e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wcSkin" x1="0.15" y1="0.05" x2="0.88" y2="0.95">
      <stop offset="0%" stop-color="#f9d5b7"/>
      <stop offset="58%" stop-color="#efc09b"/>
      <stop offset="100%" stop-color="#dca27b"/>
    </linearGradient>
    <linearGradient id="wcFaceScreen" x1="0.5" y1="1" x2="0.5" y2="0">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="#7dd3fc" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="wcFaceWarm" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0"/>
      <stop offset="78%" stop-color="#fbbf24" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fde68a" stop-opacity="0.36"/>
    </linearGradient>
    <linearGradient id="wcHair" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#2a2642"/>
      <stop offset="55%" stop-color="#19162b"/>
      <stop offset="100%" stop-color="#0f0d1b"/>
    </linearGradient>
    <linearGradient id="wcHoodie" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="55%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <linearGradient id="wcPlaque" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="55%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="wcLamp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>

  <!-- FUNDO DESKTOP ESCURO DO PC -->
  <rect width="{W}" height="{H}" fill="#060912"/>

  <!-- ======================================================================= -->
  <!-- JANELA SUPERIOR: YOUTUBE STUDIO (PAINEL DO CANAL · FELIPEX007)          -->
  <!-- ======================================================================= -->
  <g>
    <rect x="14" y="12" width="1252" height="468" rx="14" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>
    <!-- Barra superior do Studio (a direita da webcam) -->
    <path d="M 28,12 L 1252,12 C 1260,12 1266,18 1266,26 L 1266,64 L 14,64 L 14,26 C 14,18 20,12 28,12 Z" fill="#111827"/>
    <line x1="14" y1="64" x2="1266" y2="64" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Branding YouTube Studio (x >= 412, totalmente livre da webcam!) -->
    <g transform="translate(414, 24)">
      <rect x="0" y="3" width="28" height="20" rx="5" fill="#dc2626"/>
      <polygon points="11,8 11,18 20,13" fill="#ffffff"/>
      <text x="36" y="18" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="16" fill="#f8fafc">YouTube Studio</text>
      <line x1="176" y1="2" x2="176" y2="24" stroke="#334155" stroke-width="1.5"/>
      <text x="190" y="17" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="12.5" fill="#94a3b8">Painel do Canal · </text>
      <text x="302" y="17" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="12.5" fill="#38bdf8">Felipex007</text>
    </g>

    <!-- Barra de pesquisa + botao CRIAR + Avatar -->
    <g transform="translate(836, 23)">
      <rect x="0" y="0" width="234" height="28" rx="14" fill="#070b15" stroke="#26344d" stroke-width="1.4"/>
      <circle cx="17" cy="13" r="5" fill="none" stroke="#64748b" stroke-width="1.8"/>
      <line x1="21" y1="17" x2="25" y2="21" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
      <text x="34" y="18" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="600" font-size="11.5" fill="#64748b">Pesquisar no canal...</text>

      <rect x="248" y="0" width="90" height="28" rx="7" fill="#1e293b" stroke="#334155" stroke-width="1.4"/>
      <line x1="262" y1="14" x2="272" y2="14" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="267" y1="9" x2="267" y2="19" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round"/>
      <text x="282" y="18" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="11.5" fill="#f1f5f9">CRIAR</text>

      <!-- Sino de notificacao com alerta vermelho -->
      <path d="M 358,20 L 372,20 L 370,17 L 370,12 C 370,8 368,6 365,6 C 362,6 360,8 360,12 L 360,17 Z" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="371" cy="8" r="3.6" fill="#ef4444"/>

      <!-- Avatar canal -->
      <circle cx="398" cy="14" r="13.5" fill="#1d4ed8" stroke="#38bdf8" stroke-width="1.8"/>
      <text x="398" y="18" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.5" fill="#ffffff">F07</text>
    </g>

    <!-- COLUNA ESQUERDA (ABAIXO DA WEBCAM: y=242..470) -->
    <g>
      <!-- Card Alerta de Queda -->
      <rect x="24" y="242" width="366" height="86" rx="11" fill="#1a0b14" stroke="#f43f5e" stroke-opacity="0.72" stroke-width="1.6"/>
      <g transform="translate(40, 264)">
        <polygon points="16,2 30,28 2,28" fill="#7f1d1d" stroke="#fb7185" stroke-width="2.2" stroke-linejoin="round"/>
        <line x1="16" y1="11" x2="16" y2="19" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="16" cy="23.5" r="1.5" fill="#ffffff"/>
      </g>
      <text x="84" y="266" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="12.5" fill="#fda4af">ALERTA · QUEDA DE ALCANCE</text>
      <text x="84" y="286" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="13.5" fill="#f8fafc">Views caíram {pct_drop}% em 28 dias</text>
      <text x="84" y="306" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="600" font-size="11" fill="#94a3b8">Taxa de cliques abaixo da média do canal</text>

      <!-- Card Tempo Real 48h -->
      <rect x="24" y="338" width="366" height="132" rx="11" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="42" cy="358" r="4" fill="#ef4444" opacity="{0.45 + 0.55 * pulse:.2f}"/>
      <text x="54" y="362" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="12" fill="#e2e8f0">Tempo real · Últimas 48 horas</text>
      <text x="374" y="362" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="14" fill="#fb7185">{rt_views} views</text>
      <text x="40" y="380" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="600" font-size="10.2" fill="#64748b">Atualizando ao vivo · tendência negativa</text>
      <line x1="38" y1="457" x2="374" y2="457" stroke="#334155" stroke-width="1.2"/>
      {"".join(rt_bars)}
    </g>

    <!-- COLUNA CENTRAL: GRAFICO PRINCIPAL DO YOUTUBE STUDIO -->
    <g>
      <rect x="406" y="74" width="490" height="396" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.6"/>
      <text x="424" y="99" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="15" fill="#f8fafc">Estatísticas do canal · Últimos 28 dias</text>
      <!-- Pill EM QUEDA -->
      <rect x="786" y="82" width="96" height="24" rx="12" fill="#450a14" stroke="#f43f5e" stroke-width="1.4"/>
      <polyline points="797,91 802,96 806,92 811,97" fill="none" stroke="#fb7185" stroke-width="2" stroke-linecap="round"/>
      <text x="844" y="98" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.2" fill="#fda4af">EM QUEDA</text>

      <!-- 3 KPI Mini-Cards -->
      <!-- KPI 1: Visualizacoes -->
      <rect x="422" y="114" width="146" height="62" rx="9" fill="#180d16" stroke="#f43f5e" stroke-width="1.6"/>
      <text x="434" y="132" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.5" fill="#94a3b8">Visualizações</text>
      <text x="434" y="159" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="20" fill="#ffffff">{views_str}</text>
      <text x="558" y="158" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="12.5" fill="#fb7185">{pct_drop}%</text>

      <!-- KPI 2: Tempo de exibicao -->
      <rect x="578" y="114" width="146" height="62" rx="9" fill="#0b1222" stroke="#24324d" stroke-width="1.3"/>
      <text x="590" y="132" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.5" fill="#94a3b8">Exibição (h)</text>
      <text x="590" y="159" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="20" fill="#e2e8f0">1,1 mil</text>
      <text x="714" y="158" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="12" fill="#f87171">-54%</text>

      <!-- KPI 3: Inscritos -->
      <rect x="734" y="114" width="146" height="62" rx="9" fill="#0b1222" stroke="#24324d" stroke-width="1.3"/>
      <text x="746" y="132" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.5" fill="#94a3b8">Inscritos</text>
      <text x="746" y="159" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="20" fill="#fb7185">-340</text>
      <polygon points="862,150 872,150 867,158" fill="#f43f5e"/>

      <!-- Area do Grafico -->
      <rect x="422" y="190" width="458" height="266" rx="10" fill="#070c18" stroke="#1e293b" stroke-width="1.3"/>
      <!-- Eixo Y + Grade tracejada -->
      <g font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.2" fill="#64748b" text-anchor="end">
        <text x="454" y="220">50K</text>
        <text x="454" y="288">25K</text>
        <text x="454" y="356">10K</text>
        <text x="454" y="425">0</text>
      </g>
      <g stroke="#1e293b" stroke-width="1.2" stroke-dasharray="4,5">
        <line x1="462" y1="216" x2="866" y2="216"/>
        <line x1="462" y1="284" x2="866" y2="284"/>
        <line x1="462" y1="352" x2="866" y2="352"/>
      </g>
      <line x1="462" y1="422" x2="866" y2="422" stroke="#334155" stroke-width="1.5"/>
      <!-- Eixo X -->
      <g font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10" fill="#64748b" text-anchor="middle">
        <text x="472" y="444">01</text>
        <text x="568" y="444">07</text>
        <text x="664" y="444">14</text>
        <text x="760" y="444">21</text>
        <text x="854" y="444" fill="#fb7185">Hoje</text>
      </g>

      <!-- Degrade vermelho sob a curva + linha neon despencando -->
      <polygon points="{area_pts}" fill="url(#aRedArea)"/>
      <polyline points="{poly_pts}" fill="none" stroke="#ff264d" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#aGlowRed)"/>
      <polyline points="{poly_pts}" fill="none" stroke="#fecdd3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>

      <!-- Ponto final pulsante -->
      <circle cx="{last_gx:.1f}" cy="{last_gy:.1f}" r="{12 + pulse * 6:.1f}" fill="#ef4444" opacity="{0.26 - pulse * 0.12:.2f}"/>
      <circle cx="{last_gx:.1f}" cy="{last_gy:.1f}" r="6.5" fill="#ffffff" stroke="#ff264d" stroke-width="3.2"/>

      <!-- Card destaque de queda com setas vermelhas pra baixo -->
      <g transform="translate(724, 202)">
        <rect x="0" y="0" width="138" height="54" rx="10" fill="#3b0a14" stroke="#f43f5e" stroke-width="2"/>
        <polyline points="14,18 24,28 30,22 41,33" fill="none" stroke="#fb7185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="34,33 41,33 41,26" fill="none" stroke="#fb7185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="90" y="31" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="24" fill="#fda4af">{pct_drop}%</text>
        <text x="90" y="46" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="9" fill="#fecdd3" letter-spacing="1.1">VIEWS AO VIVO</text>
      </g>

      <!-- Setas vermelhas sutis reforcando a queda -->
      <g opacity="{0.42 + 0.35 * pulse:.2f}" stroke="#f43f5e" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="842" y1="274" x2="842" y2="306"/>
        <polyline points="835,299 842,307 849,299"/>
        <line x1="814" y1="286" x2="814" y2="312" opacity="0.65"/>
        <polyline points="808,306 814,313 820,306" opacity="0.65"/>
      </g>
    </g>

    <!-- COLUNA DIREITA: VIDEOS RECENTES EM QUEDA -->
    <g>
      <rect x="908" y="74" width="346" height="396" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.6"/>
      <text x="922" y="99" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="14.5" fill="#f8fafc">Vídeos recentes</text>
      <text x="1240" y="99" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="10.8" fill="#fb7185">42k -&gt; 1,8k</text>
      {"".join(vid_cards_svg)}
    </g>
  </g>

  <!-- ======================================================================= -->
  <!-- JANELA INFERIOR: EDITOR DE VIDEO (TIMELINE V1/A1 + EXPORTANDO...)       -->
  <!-- ======================================================================= -->
  <g>
    <rect x="14" y="488" width="1252" height="196" rx="12" fill="#0a0f1c" stroke="#1e293b" stroke-width="2"/>
    <path d="M 26,488 L 1254,488 C 1261,488 1266,493 1266,500 L 1266,518 L 14,518 L 14,500 C 14,493 19,488 26,488 Z" fill="#131b2e"/>
    <circle cx="32" cy="503" r="4.5" fill="#ef4444"/>
    <circle cx="47" cy="503" r="4.5" fill="#f59e0b"/>
    <circle cx="62" cy="503" r="4.5" fill="#22c55e"/>
    <text x="82" y="507" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="11.5" fill="#cbd5e1">EditorPro · VIDEO_NOVO_FINAL_v3.proj</text>
    <text x="1248" y="507" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="800" font-size="11.5" fill="#38bdf8">00:08:{14 + int(playhead_progress):02d}:12 · 1080p 60fps</text>

    <!-- Painel esquerdo: Exportando video (render cansativo!) -->
    <rect x="28" y="528" width="334" height="144" rx="9" fill="#0f172a" stroke="#24324d" stroke-width="1.4"/>
    <circle cx="46" cy="548" r="4.2" fill="#f59e0b" opacity="{0.5 + 0.5 * pulse:.2f}"/>
    <text x="58" y="552" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13" fill="#f8fafc">Exportando vídeo...</text>
    <text x="346" y="552" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="14" fill="#38bdf8">{render_pct}%</text>

    <!-- Barra de progresso com shimmer lento -->
    <rect x="44" y="576" width="302" height="16" rx="8" fill="#060a14" stroke="#1e293b" stroke-width="1.4"/>
    <rect x="44" y="576" width="{render_w:.1f}" height="16" rx="8" fill="url(#aRenderFill)"/>
    <g clip-path="url(#aRenderClip)" opacity="0.28">
      <line x1="{16 + shimmer_x:.1f}" y1="572" x2="{6 + shimmer_x:.1f}" y2="596" stroke="#ffffff" stroke-width="5"/>
      <line x1="{44 + shimmer_x:.1f}" y1="572" x2="{34 + shimmer_x:.1f}" y2="596" stroke="#ffffff" stroke-width="5"/>
      <line x1="{72 + shimmer_x:.1f}" y1="572" x2="{62 + shimmer_x:.1f}" y2="596" stroke="#ffffff" stroke-width="5"/>
      <line x1="{100 + shimmer_x:.1f}" y1="572" x2="{90 + shimmer_x:.1f}" y2="596" stroke="#ffffff" stroke-width="5"/>
      <line x1="{128 + shimmer_x:.1f}" y1="572" x2="{118 + shimmer_x:.1f}" y2="596" stroke="#ffffff" stroke-width="5"/>
    </g>
    <text x="44" y="616" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="11" fill="#94a3b8">Tempo restante: 47 min · CPU 96%</text>
    <text x="44" y="635" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="600" font-size="10.2" fill="#64748b">H.264 High · 24 Mbps · 1920x1080</text>
    <rect x="268" y="642" width="78" height="22" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1.2"/>
    <text x="307" y="656.5" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10" fill="#cbd5e1">Cancelar</text>

    <!-- Painel direito: Timeline V2 / V1 / A1 -->
    <rect x="376" y="528" width="876" height="144" rx="9" fill="#070b14" stroke="#24324d" stroke-width="1.4"/>
    <!-- Regua de tempo -->
    <line x1="414" y1="550" x2="1244" y2="550" stroke="#1e293b" stroke-width="1.2"/>
    <g font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="9.5" fill="#64748b">
      <text x="420" y="544">00:00</text>
      <text x="580" y="544">02:00</text>
      <text x="740" y="544">04:00</text>
      <text x="900" y="544">06:00</text>
      <text x="1060" y="544">08:00</text>
      <text x="1205" y="544">10:00</text>
    </g>
    <!-- Labels das trilhas -->
    <text x="394" y="576" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.5" fill="#a78bfa">V2</text>
    <text x="394" y="611" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.5" fill="#60a5fa">V1</text>
    <text x="394" y="648" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.5" fill="#34d399">A1</text>

    <!-- Trilha V2 (legendas/ajustes) -->
    <rect x="422" y="560" width="136" height="22" rx="4" fill="#4c1d95" stroke="#8b5cf6" stroke-width="1"/>
    <rect x="614" y="560" width="212" height="22" rx="4" fill="#5b21b6" stroke="#a78bfa" stroke-width="1"/>
    <rect x="920" y="560" width="188" height="22" rx="4" fill="#4c1d95" stroke="#8b5cf6" stroke-width="1"/>
    <!-- Trilha V1 (cortes de video) -->
    <rect x="418" y="591" width="188" height="28" rx="4" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.2"/>
    <rect x="610" y="591" width="234" height="28" rx="4" fill="#3730a3" stroke="#818cf8" stroke-width="1.2"/>
    <rect x="848" y="591" width="194" height="28" rx="4" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.2"/>
    <rect x="1046" y="591" width="184" height="28" rx="4" fill="#2563eb" stroke="#93c5fd" stroke-width="1.2"/>
    <!-- Trilha A1 (audio + waveform) -->
    <rect x="418" y="627" width="812" height="34" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <polyline points="{wf_poly}" fill="none" stroke="#34d399" stroke-width="1.6" stroke-linejoin="round"/>
    <!-- Playhead -->
    <polygon points="{playhead_x - 6:.1f},546 {playhead_x + 6:.1f},546 {playhead_x:.1f},555" fill="#facc15"/>
    <line x1="{playhead_x:.1f}" y1="554" x2="{playhead_x:.1f}" y2="665" stroke="#facc15" stroke-width="2.2"/>
  </g>

  <!-- BARRA DE TAREFAS DO DESKTOP (RODAPE) -->
  <g>
    <rect x="0" y="692" width="{W}" height="28" fill="#050811"/>
    <line x1="0" y1="692" x2="{W}" y2="692" stroke="#1e293b" stroke-width="1"/>
    <!-- Icones centrais -->
    <rect x="606" y="697" width="18" height="16" rx="4" fill="#dc2626"/>
    <polygon points="613,701 613,709 619,705" fill="#ffffff"/>
    <rect x="609" y="716" width="12" height="2.2" rx="1" fill="#f43f5e"/>

    <rect x="636" y="697" width="18" height="16" rx="4" fill="#2563eb"/>
    <line x1="640" y1="705" x2="650" y2="705" stroke="#ffffff" stroke-width="2"/>
    <rect x="639" y="716" width="12" height="2.2" rx="1" fill="#38bdf8"/>

    <rect x="666" y="698" width="18" height="14" rx="3" fill="#334155"/>
    <!-- Relogio madrugada + Wi-Fi -->
    <path d="M 1196,708 Q 1202,702 1208,708" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="1202" cy="711" r="1.4" fill="#94a3b8"/>
    <text x="1256" y="710" text-anchor="end" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="11.5" fill="#94a3b8">02:47</text>
  </g>

  <!-- CURSOR DO MOUSE NA TELA DO PC -->
  {click_ring}
  <g transform="translate({cur_x:.1f}, {cur_y:.1f})">
    <polygon points="0,0 0,18 4.8,13.6 8.5,21 11.4,19.6 7.7,12.2 13.8,12.2" fill="#ffffff" stroke="#090d18" stroke-width="1.8" stroke-linejoin="round"/>
  </g>

  <!-- ======================================================================= -->
  <!-- WEBCAM DO FELIPE — CANTO SUPERIOR ESQUERDO (EXATO 22, 22, 368x207 16:9) -->
  <!-- ======================================================================= -->
  <g class="webcam-felipe">
    <!-- Sombra projetada + halo sutil -->
    <rect x="{wb_x + 6:.1f}" y="{wb_y + 10:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="#000000" opacity="0.68" filter="url(#aShadow)"/>
    <rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="#38bdf8" stroke-width="6" opacity="0.22" filter="url(#aShadow)"/>

    <!-- Conteudo 480x270 recortado e escalado sem distorcao -->
    <g clip-path="url(#aWbClip)">
      <g transform="translate({wb_x:.1f},{wb_y:.1f}) scale({wb_sc:.5f})">
        {webcam_inner}
      </g>
    </g>

    <!-- Moldura limpa de webcam -->
    <rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="#090d18" stroke-width="6"/>
    <rect x="{wb_x:.1f}" y="{wb_y:.1f}" width="{wb_w:.1f}" height="{wb_h:.1f}" rx="{wb_rx:.1f}" fill="none" stroke="#38bdf8" stroke-width="2.8" filter="url(#wcGlow)"/>
    <rect x="{wb_x + 2.5:.1f}" y="{wb_y + 2.5:.1f}" width="{wb_w - 5:.1f}" height="{wb_h - 5:.1f}" rx="{wb_rx - 2:.1f}" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>

    <!-- Cantoneiras tech -->
    <g stroke="#bae6fd" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.88">
      <path d="M {x1:.1f},{y1 + bl:.1f} L {x1:.1f},{y1 + 6:.1f} Q {x1:.1f},{y1:.1f} {x1 + 6:.1f},{y1:.1f} L {x1 + bl:.1f},{y1:.1f}"/>
      <path d="M {x2 - bl:.1f},{y1:.1f} L {x2 - 6:.1f},{y1:.1f} Q {x2:.1f},{y1:.1f} {x2:.1f},{y1 + 6:.1f} L {x2:.1f},{y1 + bl:.1f}"/>
      <path d="M {x1:.1f},{y2 - bl:.1f} L {x1:.1f},{y2 - 6:.1f} Q {x1:.1f},{y2:.1f} {x1 + 6:.1f},{y2:.1f} L {x1 + bl:.1f},{y2:.1f}"/>
      <path d="M {x2 - bl:.1f},{y2:.1f} L {x2 - 6:.1f},{y2:.1f} Q {x2:.1f},{y2:.1f} {x2:.1f},{y2 - 6:.1f} L {x2:.1f},{y2 - bl:.1f}"/>
    </g>

    <!-- HUD Webcam Superior Esquerdo: REC + Timer + VU -->
    <g transform="translate({wb_x + 11:.1f}, {wb_y + 11:.1f}) scale(0.92)">
      <rect x="0" y="0" width="108" height="24" rx="7" fill="#060913" fill-opacity="0.82" stroke="#334155" stroke-width="1"/>
      <circle cx="13" cy="12" r="4.5" fill="#ef4444" opacity="{rec_dot:.2f}" filter="url(#wcGlow)"/>
      <text x="23" y="16" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="11.5" fill="#ffffff" letter-spacing="0.6">REC</text>
      <text x="51" y="16" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="700" font-size="10.5" fill="#94a3b8">{tc_wb}</text>
      {"".join(vu_bars)}
    </g>

    <!-- HUD Webcam Superior Direito: Badge CAM FELIPE -->
    <g transform="translate({wb_x + wb_w - 11 - 122 * 0.92:.1f}, {wb_y + 11:.1f}) scale(0.92)">
      <rect x="0" y="0" width="122" height="24" rx="7" fill="#060913" fill-opacity="0.84" stroke="#38bdf8" stroke-width="1.3"/>
      <circle cx="12" cy="12" r="3.4" fill="#38bdf8"/>
      <text x="67" y="16" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="10.5" fill="#bae6fd" letter-spacing="0.6">CAM · FELIPE</text>
    </g>
  </g>

  <!-- Legenda (se houver) -->
  {svg_caption(caption, "felipe" if caption else None, "cyan")}
</svg>'''


# =============================================================================
# PLANO B: QUARTO 3/4 DE PERTO — NOTEBOOK 2.5D REALISTA FECHANDO + FALA
# =============================================================================
def _build_realistic_laptop_25d(
    close_p: float,
    screen_glow: float,
    impact_jolt: float,
) -> tuple[str, str, tuple[float, float], float]:
    """
    Constroi o notebook 2.5D realista em perspectiva 3/4 limpa, diretamente a frente
    do Felipe na mesa.

    Retorna:
      - base_and_keys_svg: sombra + chassi metalico + teclado em perspectiva + trackpad + dobradica
      - lid_svg: luz interna + bordas chanfradas com espessura + tampa metalica rotacionando em arco real
      - grab_pt: ponto exato no topo da tampa onde a mao direita do Felipe apoia
      - theta_deg: angulo atual de abertura da tampa (104 deg -> 0 deg)
    """
    # Geometria exata do chassi base em perspectiva 3/4 (sobre a mesa y=492..720)
    # p00 = dobradica esquerda (frente-camera), p10 = dobradica direita
    # p01 = frente-esquerda (perto do Felipe), p11 = frente-direita
    h_l = (602.0, 596.0 + impact_jolt)
    h_r = (864.0, 542.0 + impact_jolt)
    p_fl = (466.0, 538.0 + impact_jolt)
    p_fr = (734.0, 498.0 + impact_jolt)

    # Vetores de profundidade da base (dobradica -> borda perto do Felipe)
    d_l = (p_fl[0] - h_l[0], p_fl[1] - h_l[1])  # (-136, -58)
    d_r = (p_fr[0] - h_r[0], p_fr[1] - h_r[1])  # (-130, -44)

    # Rotacao real da tampa em arco circular (104 deg aberto -> 0 deg fechado rente!)
    theta_deg = lerp(104.0, 0.0, close_p)
    theta = math.radians(theta_deg)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)

    lid_h = 182.0  # altura vertical aparente da tela em 90 graus
    t_l = (h_l[0] + cos_t * d_l[0], h_l[1] + cos_t * d_l[1] - sin_t * lid_h)
    t_r = (h_r[0] + cos_t * d_r[0], h_r[1] + cos_t * d_r[1] - sin_t * lid_h)

    # Vetor normal externo da tampa (da tela interna -> casca de aluminio externa)
    d_len = math.hypot(d_l[0], d_l[1])
    ux, uy = d_l[0] / d_len, d_l[1] / d_len
    n_x = -sin_t * ux
    n_y = -sin_t * uy - cos_t
    n_len = max(0.001, math.hypot(n_x, n_y))
    thick = 8.5
    off_x = (n_x / n_len) * thick
    off_y = (n_y / n_len) * thick

    # 4 cantos da face externa de aluminio da tampa
    o_hl = (h_l[0] + off_x, h_l[1] + off_y)
    o_hr = (h_r[0] + off_x, h_r[1] + off_y)
    o_tr = (t_r[0] + off_x, t_r[1] + off_y)
    o_tl = (t_l[0] + off_x, t_l[1] + off_y)

    # Ponto exato de apoio da mao direita no topo da tampa (u=0.33)
    grab_pt = _lerp_pt(o_tl, o_tr, 0.33)

    # --- BASE METALICA + TECLADO EM PERSPECTIVA + TRACKPAD + DOBRADICA ---
    base_th = 11.0
    h_l_b = (h_l[0], h_l[1] + base_th)
    h_r_b = (h_r[0], h_r[1] + base_th)
    p_fl_b = (p_fl[0], p_fl[1] + base_th - 1.5)

    # Sombra de contato na mesa
    sh_pts = _pts_str([
        (p_fl[0] - 8, p_fl[1] + 15),
        (h_l[0] + 2, h_l[1] + 18),
        (h_r[0] + 12, h_r[1] + 14),
        (p_fr[0] + 6, p_fr[1] + 10),
    ])

    # Teclas individuais em perspectiva exata (5 fileiras x 10 blocos limpos)
    keys_svg = []
    kb_rows = [
        (0.18, 0.24, 10),
        (0.27, 0.34, 10),
        (0.37, 0.44, 10),
        (0.47, 0.54, 9),
        (0.57, 0.63, 6),
    ]
    for v0, v1, n_cols in kb_rows:
        u_start, u_end = 0.11, 0.89
        span = (u_end - u_start) / n_cols
        for c in range(n_cols):
            u0 = u_start + c * span + 0.006
            u1 = u_start + (c + 1) * span - 0.006
            # Barra de espaco na ultima fileira
            if n_cols == 6 and c == 2:
                u1 = u_start + (c + 2) * span - 0.006
            elif n_cols == 6 and c == 3:
                continue
            kp = _quad_poly(h_l, h_r, p_fr, p_fl, u0, v0, u1, v1)
            keys_svg.append(f'<polygon points="{kp}" fill="#111827" stroke="#1e293b" stroke-width="0.9"/>')
            if screen_glow > 0.06:
                keys_svg.append(
                    f'<polygon points="{kp}" fill="none" stroke="#38bdf8" stroke-width="0.7" opacity="{0.38 * screen_glow:.2f}"/>'
                )

    # Portas USB-C laterais na lateral esquerda do chassi
    usb1 = _lerp_pt(p_fl, h_l, 0.28)
    usb2 = _lerp_pt(p_fl, h_l, 0.40)

    # Reflexo azulado da tela sobre o teclado (apaga ao fechar!)
    kb_glow_poly = _quad_poly(h_l, h_r, p_fr, p_fl, 0.04, 0.06, 0.96, 0.92)
    kb_glow_svg = (
        f'<polygon points="{kb_glow_poly}" fill="#38bdf8" opacity="{0.22 * screen_glow:.3f}"/>'
        if screen_glow > 0.02
        else ""
    )

    # Dobradica cilindrica escura real entre h_l e h_r
    hinge_l = _lerp_pt(h_l, h_r, 0.12)
    hinge_r = _lerp_pt(h_l, h_r, 0.88)

    base_svg = f'''
    <g class="laptop-base">
      <!-- Sombra de contato na mesa -->
      <polygon points="{sh_pts}" fill="#050304" opacity="0.62" filter="url(#bBlur)"/>

      <!-- Laterais chanfradas do chassi de aluminio (espessura 3D real!) -->
      <polygon points="{_pts_str([p_fl, h_l, h_l_b, p_fl_b])}" fill="url(#bAlumSideL)" stroke="#090d18" stroke-width="2.4" stroke-linejoin="round"/>
      <polygon points="{_pts_str([h_l, h_r, h_r_b, h_l_b])}" fill="url(#bAlumSideR)" stroke="#090d18" stroke-width="2.4" stroke-linejoin="round"/>
      <!-- Portas USB-C e micro LED lateral -->
      <line x1="{usb1[0]:.1f}" y1="{usb1[1] + 5.2:.1f}" x2="{usb1[0] + 10:.1f}" y2="{usb1[1] + 9.4:.1f}" stroke="#0b1020" stroke-width="3.2" stroke-linecap="round"/>
      <line x1="{usb2[0]:.1f}" y1="{usb2[1] + 5.2:.1f}" x2="{usb2[0] + 10:.1f}" y2="{usb2[1] + 9.4:.1f}" stroke="#0b1020" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="{usb1[0] - 8:.1f}" cy="{usb1[1] + 2.2:.1f}" r="1.6" fill="#38bdf8" opacity="{0.35 + 0.65 * screen_glow:.2f}"/>

      <!-- Deck superior metalico -->
      <polygon points="{_pts_str([h_l, h_r, p_fr, p_fl])}" fill="url(#bAlumDeck)" stroke="#090d18" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- Filete especular na quina do aluminio -->
      <line x1="{p_fl[0] + 3:.1f}" y1="{p_fl[1] + 1:.1f}" x2="{h_l[0] - 2:.1f}" y2="{h_l[1] - 1:.1f}" stroke="#e2e8f0" stroke-opacity="0.45" stroke-width="1.4"/>

      <!-- Rebaixo do teclado + grade de teclas em perspectiva -->
      <polygon points="{_quad_poly(h_l, h_r, p_fr, p_fl, 0.09, 0.14, 0.91, 0.66)}" fill="#0b1120" stroke="#334155" stroke-width="1.3"/>
      {"".join(keys_svg)}

      <!-- Trackpad centralizado com chanfro -->
      <polygon points="{_quad_poly(h_l, h_r, p_fr, p_fl, 0.31, 0.71, 0.69, 0.94)}" fill="#334155" stroke="#64748b" stroke-width="1.3"/>
      <polygon points="{_quad_poly(h_l, h_r, p_fr, p_fl, 0.33, 0.73, 0.67, 0.92)}" fill="#1e293b" opacity="0.55"/>

      <!-- Reflexo da tela no teclado enquanto aberto -->
      {kb_glow_svg}

      <!-- Dobradica cilindrica real bem marcada -->
      <line x1="{hinge_l[0]:.1f}" y1="{hinge_l[1]:.1f}" x2="{hinge_r[0]:.1f}" y2="{hinge_r[1]:.1f}" stroke="#090d18" stroke-width="9.5" stroke-linecap="round"/>
      <line x1="{hinge_l[0]:.1f}" y1="{hinge_l[1] - 0.8:.1f}" x2="{hinge_r[0]:.1f}" y2="{hinge_r[1] - 0.8:.1f}" stroke="#334155" stroke-width="5.2" stroke-linecap="round"/>
      <line x1="{hinge_l[0] + 8:.1f}" y1="{hinge_l[1] - 2.2:.1f}" x2="{hinge_r[0] - 8:.1f}" y2="{hinge_r[1] - 2.2:.1f}" stroke="#64748b" stroke-width="1.4" opacity="0.65" stroke-linecap="round"/>
    </g>'''

    # --- TAMPA 2.5D COM ESPESSURA, BORDA LUMINOSA INTERNA E BRILHO METALICO ---
    # Borda interna brilhando com reflexo azul+vermelho da tela enquanto aberta!
    inner_glow_svg = ""
    if screen_glow > 0.04 and theta_deg > 10.0:
        # Faixa fina da tela/moldura interna visivel na aresta esquerda voltada pro Felipe
        s_in_b = _lerp_pt(h_l, p_fl, 0.04)
        s_in_t = (t_l[0] - 9.0 * screen_glow, t_l[1] + 5.0)
        inner_glow_svg = f'''
        <!-- Reflexo da borda interna da tela (azul + leve vermelho do grafico) -->
        <polygon points="{_pts_str([h_l, t_l, s_in_t, s_in_b])}" fill="url(#bScreenBezelGlow)" opacity="{0.92 * screen_glow:.2f}"/>
        <line x1="{t_l[0] - 3:.1f}" y1="{t_l[1] + 5:.1f}" x2="{h_l[0] - 2:.1f}" y2="{h_l[1] - 6:.1f}" stroke="#e0f2fe" stroke-width="2.2" opacity="{0.82 * screen_glow:.2f}" stroke-linecap="round"/>'''

    # Reflexo especular diagonal na tampa metalica (calculado em coordenadas da tampa!)
    sheen_poly = _quad_poly(o_hl, o_hr, o_tr, o_tl, 0.14, 0.04, 0.42, 0.96)
    sheen_poly2 = _quad_poly(o_hl, o_hr, o_tr, o_tl, 0.48, 0.04, 0.56, 0.96)

    # Emblema minimalista centralizado na tampa em perspectiva real (achata ao fechar!)
    logo_c = _quad_pt(o_hl, o_hr, o_tr, o_tl, 0.50, 0.50)
    logo_r_u = _quad_pt(o_hl, o_hr, o_tr, o_tl, 0.56, 0.50)
    logo_r_v = _quad_pt(o_hl, o_hr, o_tr, o_tl, 0.50, 0.41)
    rx_logo = max(4.0, math.hypot(logo_r_u[0] - logo_c[0], logo_r_u[1] - logo_c[1]))
    ry_logo = max(2.2, math.hypot(logo_r_v[0] - logo_c[0], logo_r_v[1] - logo_c[1]))
    lid_ang = math.degrees(math.atan2(o_hr[1] - o_hl[1], o_hr[0] - o_hl[0]))

    # Borda traseira da dobradica da tampa visivel conforme fecha
    hinge_edge_svg = (
        f'<polygon points="{_pts_str([h_l, h_r, o_hr, o_hl])}" fill="#475569" stroke="#090d18" stroke-width="2.2" stroke-linejoin="round"/>'
        if close_p > 0.18
        else ""
    )

    # Borda frontal do chanfro quando fecha
    front_edge_svg = (
        f'<polygon points="{_pts_str([t_l, t_r, o_tr, o_tl])}" fill="#94a3b8" stroke="#090d18" stroke-width="2.2" stroke-linejoin="round"/>'
    )

    lid_svg = f'''
    <g class="laptop-lid">
      {inner_glow_svg}
      <!-- Borda de espessura lateral esquerda (chanfro aluminio) -->
      <polygon points="{_pts_str([h_l, t_l, o_tl, o_hl])}" fill="url(#bAlumEdge)" stroke="#090d18" stroke-width="2.4" stroke-linejoin="round"/>
      <!-- Borda superior da tampa -->
      {front_edge_svg}
      {hinge_edge_svg}
      <!-- Face externa principal da tampa de aluminio escovado -->
      <polygon points="{_pts_str([o_hl, o_hr, o_tr, o_tl])}" fill="url(#bLidMetal)" stroke="#090d18" stroke-width="3.2" stroke-linejoin="round"/>
      <!-- Reflexo metalico diagonal sutil -->
      <polygon points="{sheen_poly}" fill="#ffffff" opacity="0.065"/>
      <polygon points="{sheen_poly2}" fill="#ffffff" opacity="0.035"/>
      <!-- Aresta de brilho superior da tampa -->
      <line x1="{o_tl[0] + 6:.1f}" y1="{o_tl[1] + 1.5:.1f}" x2="{o_tr[0] - 6:.1f}" y2="{o_tr[1] + 1.5:.1f}" stroke="#e2e8f0" stroke-opacity="0.58" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Logo minimalista metalico em perspectiva -->
      <g transform="translate({logo_c[0]:.1f}, {logo_c[1]:.1f}) rotate({lid_ang:.1f})">
        <ellipse cx="0" cy="0" rx="{rx_logo:.1f}" ry="{ry_logo:.1f}" fill="#1e293b" stroke="#94a3b8" stroke-width="1.4" opacity="0.82"/>
        <ellipse cx="0" cy="0" rx="{rx_logo * 0.56:.1f}" ry="{ry_logo * 0.56:.1f}" fill="#38bdf8" opacity="{0.18 + 0.52 * screen_glow:.2f}"/>
      </g>
    </g>'''

    return base_svg, lid_svg, grab_pt, theta_deg


def _render_plano_b_room_close_and_talk(
    t: float,
    m: dict,
    amp: float,
    caption: str,
) -> str:
    """PLANO B: Quarto 3/4 de perto — fecha notebook realista + luz apaga + fala."""
    t_close = m["t_close"]
    t_cut = t_close - 0.35
    t_f1 = m["t_f1"]
    t_f2 = m.get("t_f2", t_f1 + 1.49)
    c2e = m["c2_end"]

    local_b = max(0.0, t - t_cut)

    # 1) Fechamento do notebook em arco real (t_close -> t_close + 0.45s)
    close_raw = clamp((t - t_close) / 0.45) if t >= t_close else 0.0
    # Curva suave com aceleracao firme no fim (clique realista da tampa!)
    close_p = ease_in_out(close_raw)
    # Pequeno micro-assentamento de impacto quando encosta na base
    impact_t = t - (t_close + 0.42)
    impact_jolt = math.sin(impact_t * 36.0) * math.exp(-impact_t * 14.0) * 2.2 if 0.0 < impact_t < 0.28 else 0.0

    # Luz azulada da tela apaga 100% quando a tampa encosta!
    screen_glow = clamp(1.0 - (close_p ** 1.45))

    # 2) Camera cinematografica: estavel fechando o notebook -> dolly-in suave no rosto falando!
    dolly_p = ease_in_out((t - t_f1) / max(1.0, (c2e - t_f1 - 0.35))) if t >= t_f1 else 0.0
    cam_zoom = 1.0 + 0.24 * dolly_p
    cam_cx = lerp(640.0, 474.0, ease_in_out((t - t_f1) / 2.2) if t >= t_f1 else 0.0)
    cam_cy = lerp(360.0, 318.0, ease_in_out((t - t_f1) / 2.2) if t >= t_f1 else 0.0)

    # 3) Postura & Expressao do Felipe (sincero, cansado, olhando pra camera)
    look_cam = ease_in_out((t - (t_close + 0.48)) / 0.42) if t >= t_close + 0.48 else 0.0
    recover = ease_in_out((t - (t_close + 0.55)) / 0.75) if t >= t_close + 0.55 else 0.0
    # Leve balanco de cabeca sincero durante "cansei de fazer video..." e inclinacao no final "vai ser..."
    talk_nod = math.sin((t - t_f2) * 3.1) * 2.2 * clamp(amp * 2.2) if t >= t_f2 else 0.0
    final_intrigue = ease_in_out((t - (c2e - 2.3)) / 1.5) if t >= c2e - 2.3 else 0.0

    slump_y = lerp(10.0, 0.0, recover) + math.sin(t * 2.0) * 1.4
    head_tilt = lerp(6.0, -1.5, recover) + talk_nod - final_intrigue * 3.0
    tired = lerp(0.88, 0.58, recover) - final_intrigue * 0.16

    # Palpebras cansadas mas acordadas falando com o publico + piscada natural
    blink = 1.0 if (int(t * 10) % 36 == 0) else 0.0
    lid_eff = clamp(lerp(0.56, 0.34, recover) - final_intrigue * 0.10 + blink * 0.62, 0.14, 0.95)
    brow_worry = clamp(lerp(0.75, 0.45, recover) - final_intrigue * 0.35)

    # Olhar: foca na tampa fechando -> vira direto pro espectador!
    pupil_dx = lerp(4.8, 0.0, look_cam)
    pupil_dy = lerp(2.8, 0.0, look_cam)

    # Lip-sync real do Felipe
    mouth_open = (2.2 + amp * 14.5) if t >= t_f1 - 0.05 else 0.0

    # 4) Construir o notebook 2.5D e obter o ponto exato de apoio da mao!
    laptop_base_svg, laptop_lid_svg, grab_pt, theta_deg = _build_realistic_laptop_25d(
        close_p=close_p,
        screen_glow=screen_glow,
        impact_jolt=impact_jolt,
    )

    # 5) Posicao do Felipe (logo atras da mesa, proximo ao notebook!)
    fel_x = 456.0
    fel_y = 286.0 + slump_y
    fel_scale = 1.15

    # Coordenadas exatas dos ombros em espaco do mundo
    l_sh = (fel_x - 74.0, fel_y + 118.0)
    r_sh = (fel_x + 74.0, fel_y + 118.0)

    # --- BRACO DIREITO COM ANATOMIA REAL (ALCANCANDO A TAMPA -> FECHANDO EM ARCO -> RELAXANDO) ---
    # Fase 1 (t_cut -> t_close): mao sobe em arco limpo do canto esquerdo ate o topo da tampa
    reach_p = ease_out_cubic(clamp((t - t_cut) / 0.33)) if t < t_close else 1.0
    # Fase 3 (t_close + 0.58 -> t_close + 1.15): mao relaxa suavemente sobre a tampa fechada/mesa
    relax_p = ease_in_out((t - (t_close + 0.58)) / 0.55) if t >= t_close + 0.58 else 0.0

    if t < t_close:
        # Curva quadratica Bezier levando a mao por cima do canto superior esquerdo (sempre visivel!)
        p0 = (566.0, 492.0)
        p1 = (602.0, 396.0)
        p2 = grab_pt
        u = reach_p
        om = 1.0 - u
        r_hand = (
            om * om * p0[0] + 2 * om * u * p1[0] + u * u * p2[0],
            om * om * p0[1] + 2 * om * u * p1[1] + u * u * p2[1],
        )
        r_elb = (lerp(568.0, 610.0, u), lerp(468.0, 446.0, u))
    else:
        # Acompanha exatamente o arco circular da tampa fechando, depois relaxa no tampo!
        rest_hand = (552.0, 532.0)
        r_hand = _lerp_pt(grab_pt, rest_hand, relax_p)
        # Cotovelo dobra de forma anatomica (ombro -> cotovelo dobrado -> antebraco -> mao!)
        elb_closing = (
            lerp(610.0, 574.0, close_p) - math.sin(close_p * math.pi) * 18.0,
            lerp(446.0, 468.0, close_p) + math.sin(close_p * math.pi) * 6.0,
        )
        r_elb = _lerp_pt(elb_closing, (568.0, 474.0), relax_p)

    # Inclinacao natural da mao direita apoiada na tampa
    r_hand_rot = lerp(-12.0, 14.0, close_p) * (1.0 - relax_p * 0.4)
    # Mao fica sobre a borda da tampa assim que alcanca (t >= t_close - 0.12)
    hand_over_lid = (t >= t_close - 0.12)

    # --- BRACO ESQUERDO NATURAL APOIADO NA MESA (COM MICRO-GESTO NA FALA) ---
    gest_l = math.sin(t * 4.5) * 3.5 * clamp(amp * 1.8) if t >= t_f2 else 0.0
    l_elb = (348.0, 514.0)
    l_hand = (412.0, 526.0 - gest_l)

    # --- COMPONENTES DO QUARTO NOTURNO ---
    cloud_dx = (t * 2.8) % 45.0
    steam_shift = (t * 16.0) % 24.0

    city_windows = []
    for bx, by, bw, bh in [(16, 198, 46, 86), (68, 166, 54, 118), (128, 186, 48, 98), (182, 158, 62, 126)]:
        for wy in range(by + 12, by + bh - 14, 14):
            for wx in range(bx + 8, bx + bw - 10, 13):
                hsh = (wx * 31 + wy * 17) % 11
                if hsh in (1, 4, 7):
                    wcol = "#fde68a" if hsh != 7 else "#93c5fd"
                    city_windows.append(
                        f'<rect x="{wx}" y="{wy}" width="6" height="8" rx="1" fill="{wcol}" opacity="0.72"/>'
                    )

    dust_motes = []
    for i, (dx, dy, dr, spd) in enumerate([
        (985, 290, 2.2, 6.8), (1045, 345, 1.8, 5.4), (1120, 310, 2.4, 7.8),
        (960, 395, 1.7, 6.2), (1165, 385, 2.0, 5.0), (1020, 440, 1.9, 7.2),
        (665, 390, 1.7, 5.8), (585, 425, 1.5, 5.1),
    ]):
        my = dy - ((local_b * spd + i * 19.0) % 54.0)
        mx = dx + math.sin(t * 1.4 + i) * 6.5
        is_warm = dx > 900
        m_op = (0.42 if is_warm else 0.34 * screen_glow) * (0.55 + 0.45 * math.sin(t * 2.2 + i))
        m_col = "#fde68a" if is_warm else "#bae6fd"
        if m_op > 0.03:
            dust_motes.append(f'<circle cx="{mx:.1f}" cy="{my:.1f}" r="{dr:.1f}" fill="{m_col}" opacity="{m_op:.2f}"/>')

    # Cabeca do Felipe
    head_svg = _build_felipe_head_svg(
        id_prefix="b3",
        head_tilt=head_tilt,
        tired=tired,
        lid_eff=lid_eff,
        pupil_dx=pupil_dx,
        pupil_dy=pupil_dy,
        mouth_open=mouth_open,
        amp=amp,
        screen_glow=screen_glow,
        sigh_p=0.0,
        sigh_wave=0.0,
        brow_worry=brow_worry,
        face_screen_grad="b3FaceScreen",
        face_warm_grad="b3FaceWarm",
        eye_glint_red=0.0,
    )

    # Desenho do braco e mao direita (dedos apoiados no topo da tampa!)
    r_hand_svg = f'''
    <g transform="translate({r_hand[0]:.1f}, {r_hand[1]:.1f}) rotate({r_hand_rot:.1f})">
      <rect x="-13" y="-8" width="26" height="17" rx="8" fill="#f6cca8" stroke="#18121e" stroke-width="2.8"/>
      <rect x="7" y="-7.5" width="14" height="5.2" rx="2.6" fill="#f9d5b7" stroke="#18121e" stroke-width="1.9"/>
      <rect x="8" y="-2.2" width="16" height="5.2" rx="2.6" fill="#f9d5b7" stroke="#18121e" stroke-width="1.9"/>
      <rect x="7" y="3.1" width="14" height="5.0" rx="2.5" fill="#efc09b" stroke="#18121e" stroke-width="1.9"/>
      <rect x="-2" y="6.5" width="11" height="5.0" rx="2.5" transform="rotate(24, 2, 8)" fill="#efc09b" stroke="#18121e" stroke-width="1.9"/>
    </g>'''
    r_sleeve_svg = f'''
    <g>
      <path d="M {r_sh[0]:.1f},{r_sh[1]:.1f} Q {r_elb[0]:.1f},{r_elb[1]:.1f} {r_hand[0] - 10:.1f},{r_hand[1] + 2:.1f}" fill="none" stroke="#0b1020" stroke-width="33" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M {r_sh[0]:.1f},{r_sh[1]:.1f} Q {r_elb[0]:.1f},{r_elb[1]:.1f} {r_hand[0] - 10:.1f},{r_hand[1] + 2:.1f}" fill="none" stroke="#2563eb" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="{r_hand[0] - 12:.1f}" cy="{r_hand[1] + 2:.1f}" r="11" fill="#172554" stroke="#0b1020" stroke-width="2.5"/>
    </g>'''
    arm_in_front = (close_p >= 0.88)

    # Flash branco de transicao pro Robo no fim da cena 2
    flash_out = clamp((t - (c2e - 0.15)) / 0.15) if t > c2e - 0.15 else 0.0
    flash_rect = (
        f'<rect width="{W}" height="{H}" fill="#ffffff" opacity="{flash_out:.2f}"/>'
        if flash_out > 0.01
        else ""
    )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="b3Wall" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#090e1e"/>
      <stop offset="58%" stop-color="#131c36"/>
      <stop offset="100%" stop-color="#1a213d"/>
    </linearGradient>
    <linearGradient id="b3Sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#040814"/>
      <stop offset="60%" stop-color="#0d1a38"/>
      <stop offset="100%" stop-color="#192a52"/>
    </linearGradient>
    <radialGradient id="b3MoonHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.45"/>
      <stop offset="55%" stop-color="#93c5fd" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#0d1a38" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b3LampGlow" cx="50%" cy="48%" r="54%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="{0.56 + 0.12 * close_p:.3f}"/>
      <stop offset="38%" stop-color="#f59e0b" stop-opacity="{0.24 + 0.08 * close_p:.3f}"/>
      <stop offset="72%" stop-color="#ea580c" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b3ScreenCone" cx="48%" cy="54%" r="54%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="{0.48 * screen_glow:.3f}"/>
      <stop offset="46%" stop-color="#2563eb" stop-opacity="{0.20 * screen_glow:.3f}"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="b3Desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4d3327"/>
      <stop offset="12%" stop-color="#3a251c"/>
      <stop offset="100%" stop-color="#1c110c"/>
    </linearGradient>
    <linearGradient id="b3Skin" x1="0.15" y1="0.05" x2="0.88" y2="0.95">
      <stop offset="0%" stop-color="#f9d5b7"/>
      <stop offset="58%" stop-color="#efc09b"/>
      <stop offset="100%" stop-color="#dca27b"/>
    </linearGradient>
    <linearGradient id="b3FaceScreen" x1="0" y1="0.3" x2="1" y2="0.6">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0"/>
      <stop offset="48%" stop-color="#38bdf8" stop-opacity="0"/>
      <stop offset="82%" stop-color="#38bdf8" stop-opacity="{0.30 * screen_glow:.3f}"/>
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="{0.52 * screen_glow:.3f}"/>
    </linearGradient>
    <linearGradient id="b3FaceWarm" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0"/>
      <stop offset="76%" stop-color="#fbbf24" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fde68a" stop-opacity="{0.24 + 0.22 * close_p:.3f}"/>
    </linearGradient>
    <linearGradient id="b3Hair" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#2a2642"/>
      <stop offset="55%" stop-color="#19162b"/>
      <stop offset="100%" stop-color="#0f0d1b"/>
    </linearGradient>
    <linearGradient id="b3Hoodie" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="55%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <linearGradient id="b3LampShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="48%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="b3Plaque" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>

    <!-- Gradientes Metalicos Realistas do Notebook 2.5D -->
    <linearGradient id="bAlumDeck" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="48%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="bAlumSideL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="bAlumSideR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="bAlumEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="55%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="bLidMetal" x1="0.1" y1="0.05" x2="0.9" y2="0.95">
      <stop offset="0%" stop-color="#5b6b82"/>
      <stop offset="45%" stop-color="#3c4a60"/>
      <stop offset="100%" stop-color="#1f293b"/>
    </linearGradient>
    <linearGradient id="bScreenBezelGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="55%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#fda4af"/>
    </linearGradient>

    <filter id="bGlowSoft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <clipPath id="b3WinClip"><rect x="0" y="0" width="256" height="278" rx="6"/></clipPath>
    <clipPath id="b3FaceClip">
      <path d="M -46,-26 C -46,-54 -26,-62 0,-62 C 26,-62 46,-54 46,-26 L 44,12 C 42,36 22,54 0,56 C -22,54 -42,36 -44,12 Z"/>
    </clipPath>
    <clipPath id="b3EyeLClip"><ellipse cx="-18" cy="2" rx="11.5" ry="9.8"/></clipPath>
    <clipPath id="b3EyeRClip"><ellipse cx="20" cy="2" rx="11.5" ry="9.8"/></clipPath>
  </defs>

  <rect width="{W}" height="{H}" fill="#060913"/>

  <g transform="translate({cam_cx:.1f},{cam_cy:.1f}) scale({cam_zoom:.4f}) translate({-cam_cx:.1f},{-cam_cy:.1f})">
    <!-- PAREDE DO QUARTO NOTURNO -->
    <rect x="-120" y="-100" width="{W + 240}" height="{H + 200}" fill="url(#b3Wall)"/>
    <line x1="-120" y1="422" x2="{W + 120}" y2="422" stroke="#222e4f" stroke-width="3" opacity="0.55"/>
    <rect x="-120" y="424" width="{W + 240}" height="82" fill="#0d1327" opacity="0.45"/>
    <!-- Feixe suave de luar vindo da janela -->
    <polygon points="56,42 312,42 520,492 120,492" fill="#60a5fa" opacity="0.045"/>

    <!-- JANELA NOTURNA -->
    <g transform="translate(56, 42)">
      <rect x="6" y="8" width="256" height="278" rx="8" fill="#02050d" opacity="0.5"/>
      <g clip-path="url(#b3WinClip)">
        <rect x="0" y="0" width="256" height="278" fill="url(#b3Sky)"/>
        <circle cx="188" cy="68" r="64" fill="url(#b3MoonHalo)"/>
        <circle cx="188" cy="68" r="22" fill="#fef3c7" opacity="0.95"/>
        <circle cx="197" cy="62" r="18.5" fill="#071127"/>
        <circle cx="38" cy="40" r="2.2" fill="#f8fafc" opacity="0.88"/>
        <circle cx="88" cy="28" r="1.4" fill="#93c5fd" opacity="0.72"/>
        <circle cx="112" cy="76" r="1.9" fill="#e2e8f0" opacity="0.78"/>
        <circle cx="52" cy="112" r="1.5" fill="#bfdbfe" opacity="0.65"/>
        <circle cx="152" cy="42" r="1.4" fill="#fef3c7" opacity="0.7"/>
        <circle cx="222" cy="118" r="2.0" fill="#e2e8f0" opacity="0.78"/>
        <g opacity="0.18" transform="translate({-18 + cloud_dx:.1f}, 0)">
          <ellipse cx="72" cy="96" rx="46" ry="11" fill="#93c5fd"/>
          <ellipse cx="96" cy="92" rx="30" ry="9" fill="#bfdbfe"/>
          <ellipse cx="195" cy="134" rx="42" ry="9" fill="#93c5fd"/>
        </g>
        <rect x="0" y="182" width="34" height="96" fill="#0b1328"/>
        <rect x="44" y="152" width="46" height="126" fill="#0c152c"/>
        <rect x="102" y="168" width="50" height="110" fill="#0b1328"/>
        <rect x="164" y="144" width="44" height="134" fill="#0d1730"/>
        <rect x="218" y="170" width="42" height="108" fill="#0b1328"/>
        <rect x="16" y="198" width="46" height="86" fill="#091022"/>
        <rect x="68" y="166" width="54" height="118" fill="#0b1327"/>
        <rect x="128" y="186" width="48" height="98" fill="#091022"/>
        <rect x="182" y="158" width="62" height="126" fill="#0c152a"/>
        <line x1="212" y1="158" x2="212" y2="142" stroke="#1e293b" stroke-width="2"/>
        <circle cx="212" cy="141" r="2" fill="#ef4444" opacity="{0.45 + 0.55 * abs(math.sin(t * 2.5)):.2f}"/>
        {"".join(city_windows)}
        <polygon points="18,0 64,0 0,148 0,98" fill="#ffffff" opacity="0.035"/>
      </g>
      <rect x="0" y="0" width="256" height="278" rx="6" fill="none" stroke="#243152" stroke-width="10"/>
      <line x1="128" y1="0" x2="128" y2="278" stroke="#243152" stroke-width="6"/>
      <line x1="0" y1="140" x2="256" y2="140" stroke="#243152" stroke-width="6"/>
      <rect x="-12" y="276" width="280" height="12" rx="4" fill="#1e2947" stroke="#0b1021" stroke-width="2.5"/>
    </g>

    <!-- DECORACAO DA PAREDE: POSTER FELIPEX007 + PRATELEIRA + PLACA 100K -->
    <g>
      <g transform="translate(382, 26)">
        <rect x="5" y="6" width="152" height="98" rx="7" fill="#02050d" opacity="0.48"/>
        <rect x="0" y="0" width="152" height="98" rx="7" fill="#111930" stroke="#334155" stroke-width="4"/>
        <rect x="6" y="6" width="140" height="86" rx="4" fill="#0b1124"/>
        <rect x="44" y="18" width="64" height="42" rx="11" fill="#dc2626"/>
        <polygon points="69,29 69,49 87,39" fill="#ffffff"/>
        <text x="76" y="80" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="13.5" fill="#e2e8f0" letter-spacing="1.4">FELIPEX007</text>
      </g>
      <g transform="translate(562, 80)">
        <rect x="3" y="4" width="48" height="62" rx="5" fill="#02050d" opacity="0.45"/>
        <rect x="0" y="0" width="48" height="62" rx="5" fill="url(#b3Plaque)" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="5" y="5" width="38" height="52" rx="3" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>
        <rect x="13" y="16" width="22" height="16" rx="4" fill="#1e293b"/>
        <polygon points="21,20 21,28 29,24" fill="#e2e8f0"/>
        <line x1="12" y1="42" x2="36" y2="42" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="48" x2="32" y2="48" stroke="#475569" stroke-width="1.6" stroke-linecap="round"/>
      </g>
      <g transform="translate(628, 112)">
        <rect x="0" y="12" width="22" height="18" rx="3" fill="#334155" stroke="#0f172a" stroke-width="2"/>
        <path d="M 11,12 C 4,0 -1,4 4,12 M 11,12 C 9,-3 15,-3 14,12 M 11,12 C 18,0 23,4 18,12" fill="#10b981" stroke="#064e3b" stroke-width="1.5"/>
      </g>
      <g transform="translate(660, 102)">
        <rect x="0" y="0" width="10" height="40" rx="2" fill="#3b82f6" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="11" y="4" width="10" height="36" rx="2" fill="#6366f1" stroke="#0f172a" stroke-width="1.8"/>
      </g>
      <rect x="364" y="142" width="334" height="14" rx="4" fill="#24304c" stroke="#0d1324" stroke-width="3"/>
      <rect x="370" y="155" width="322" height="4" rx="2" fill="#818cf8" opacity="0.72" filter="url(#bGlowSoft)"/>
    </g>

    <!-- ABAJUR QUENTE CINEMATOGRAFICO (DOMINA A CENA QUANDO A TELA APAGA!) -->
    <circle cx="1084" cy="378" r="360" fill="url(#b3LampGlow)"/>
    <g transform="translate(1042, 326)">
      <rect x="38" y="96" width="12" height="82" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.8"/>
      <line x1="42" y1="98" x2="42" y2="174" stroke="#94a3b8" stroke-width="2" opacity="0.5"/>
      <ellipse cx="44" cy="176" rx="36" ry="10" fill="#334155" stroke="#0f172a" stroke-width="3"/>
      <ellipse cx="44" cy="96" rx="30" ry="10" fill="#fef08a" opacity="0.76" filter="url(#bGlowSoft)"/>
      <polygon points="8,98 80,98 64,20 24,20" fill="url(#b3LampShade)" stroke="#1e150a" stroke-width="3.2" stroke-linejoin="round"/>
      <line x1="28" y1="26" x2="18" y2="92" stroke="#fef9c3" stroke-width="3" stroke-linecap="round" opacity="0.42"/>
      <line x1="24" y1="20" x2="64" y2="20" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- CADEIRA GAMER ATRAS DO FELIPE -->
    <g transform="translate(324, 198)">
      <path d="M 10,308 L 20,44 C 22,12 62,0 132,0 C 202,0 242,12 244,44 L 254,308 Z" fill="#182238" stroke="#080c17" stroke-width="4.8"/>
      <path d="M 36,308 L 42,54 C 44,28 76,20 132,20 C 188,20 220,28 222,54 L 228,308 Z" fill="#0f1628"/>
      <path d="M 18,108 L 34,108 L 28,236 L 12,236 Z" fill="#1e3a8a" opacity="0.72"/>
      <path d="M 246,108 L 230,108 L 236,236 L 252,236 Z" fill="#1e3a8a" opacity="0.72"/>
      <rect x="76" y="48" width="112" height="36" rx="16" fill="#26334f" stroke="#090d18" stroke-width="3.2"/>
    </g>

    <!-- PERSONAGEM FELIPE (ENQUADRAMENTO 3/4 DE PERTO — PROPORCOES NATURAIS!) -->
    <g transform="translate({fel_x:.1f}, {fel_y:.1f}) scale({fel_scale:.3f})">
      <!-- Tronco / Moletom -->
      <path d="M -86,202 C -90,124 -62,82 0,82 C 64,82 92,124 88,202 Z" fill="url(#b3Hoodie)" stroke="#0b1020" stroke-width="4.4"/>
      <path d="M -84,200 C -87,128 -58,88 -16,84 L -28,200 Z" fill="#13204a" opacity="0.62"/>
      <!-- Reflexo azulado da tela no moletom (apaga 100% ao fechar!) -->
      <path d="M 22,86 C 64,96 86,132 86,198 L 58,198 C 56,140 44,106 22,86 Z" fill="#38bdf8" opacity="{0.34 * screen_glow:.3f}"/>
      <!-- Rim quente sutil do abajur no ombro direito quando a tela apaga -->
      <path d="M 52,92 C 78,108 86,142 86,198 L 74,198 C 72,146 66,112 52,92 Z" fill="#fbbf24" opacity="{0.14 + 0.18 * close_p:.3f}"/>
      <!-- Dobras sutis -->
      <path d="M -44,134 Q -24,154 -36,184" fill="none" stroke="#101c42" stroke-width="3" stroke-linecap="round" opacity="0.65"/>
      <path d="M 42,136 Q 26,156 36,182" fill="none" stroke="#101c42" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <!-- Capuz dobrado + cordoes -->
      <path d="M -48,84 C -24,114 24,114 48,84 C 28,70 -28,70 -48,84 Z" fill="#1e40af" stroke="#0b1020" stroke-width="3.8"/>
      <path d="M -15,102 Q -18,128 -16,150" fill="none" stroke="#e2e8f0" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M 15,102 Q 19,126 17,148" fill="none" stroke="#e2e8f0" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="-18" y="148" width="4" height="7" rx="1.5" fill="#94a3b8"/>
      <rect x="15" y="146" width="4" height="7" rx="1.5" fill="#94a3b8"/>

      <!-- Headset gamer no pescoco -->
      <path d="M -42,88 Q 0,126 44,88" fill="none" stroke="#0b1020" stroke-width="11" stroke-linecap="round"/>
      <path d="M -42,88 Q 0,126 44,88" fill="none" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
      <rect x="-52" y="76" width="18" height="30" rx="8" fill="#334155" stroke="#090d18" stroke-width="3"/>
      <rect x="-47" y="83" width="5" height="16" rx="2.5" fill="#38bdf8" opacity="0.8"/>
      <rect x="36" y="76" width="18" height="30" rx="8" fill="#334155" stroke="#090d18" stroke-width="3"/>
      <rect x="44" y="83" width="5" height="16" rx="2.5" fill="#38bdf8" opacity="0.8"/>

      <!-- Pescoco -->
      <path d="M -17,50 L 17,50 L 19,86 Q 0,94 -19,86 Z" fill="#dfa880" stroke="#0b1020" stroke-width="3.8"/>
      <path d="M -16,54 Q 0,68 16,54 L 16,66 Q 0,76 -16,66 Z" fill="#b87e5a" opacity="0.55"/>

      <!-- Cabeca expressiva -->
      {head_svg}
    </g>

    <!-- MESA DE MADEIRA 2.5D + DESK MAT -->
    <polygon points="-100,492 1380,492 1420,760 -140,760" fill="url(#b3Desk)" stroke="#120b08" stroke-width="5"/>
    <line x1="-100" y1="506" x2="1380" y2="506" stroke="#624336" stroke-width="2.5" opacity="0.58"/>
    <line x1="80" y1="588" x2="480" y2="588" stroke="#2a1913" stroke-width="2" opacity="0.45"/>
    <line x1="860" y1="628" x2="1240" y2="628" stroke="#2a1913" stroke-width="2" opacity="0.45"/>
    <!-- Desk mat amplo diretamente na frente do Felipe -->
    <polygon points="418,498 920,498 972,620 364,620" fill="#121827" stroke="#090d18" stroke-width="2.6"/>
    <!-- Reflexo azulado da tela na mesa/deskmat (apaga 100% ao fechar!) -->
    <ellipse cx="615" cy="542" rx="215" ry="38" fill="#38bdf8" opacity="{0.26 * screen_glow:.3f}" filter="url(#bBlur)"/>
    <!-- Reflexo quente sutil do abajur na mesa a direita -->
    <ellipse cx="1075" cy="534" rx="180" ry="34" fill="#fbbf24" opacity="{0.14 + 0.08 * close_p:.3f}" filter="url(#bBlur)"/>

    <!-- CANECA DE CAFE A ESQUERDA -->
    <g transform="translate(174, 446)">
      <ellipse cx="26" cy="54" rx="30" ry="7" fill="#0c0705" opacity="0.55"/>
      <path d="M 14,-6 Q 6,-22 17,-36" fill="none" stroke="#e2e8f0" stroke-width="2.6" stroke-linecap="round" opacity="{0.42 * (1 - steam_shift / 24):.2f}" transform="translate(0, {-steam_shift * 0.65:.1f})"/>
      <path d="M 28,-4 Q 36,-20 25,-34" fill="none" stroke="#e2e8f0" stroke-width="2.4" stroke-linecap="round" opacity="{0.34 * (1 - steam_shift / 24):.2f}" transform="translate(0, {-steam_shift * 0.85:.1f})"/>
      <path d="M 46,12 C 64,12 64,40 46,40" fill="none" stroke="#0f172a" stroke-width="10"/>
      <path d="M 46,12 C 64,12 64,40 46,40" fill="none" stroke="#e2e8f0" stroke-width="5.5"/>
      <rect x="0" y="0" width="48" height="53" rx="8" fill="#f1f5f9" stroke="#0f172a" stroke-width="3.2"/>
      <rect x="0" y="0" width="14" height="53" rx="6" fill="#cbd5e1" opacity="0.55"/>
      <rect x="10" y="18" width="28" height="16" rx="4" fill="#ef4444"/>
      <polygon points="21,22 21,30 29,26" fill="#ffffff"/>
    </g>

    <!-- BRACO + MAO ESQUERDA APOIADOS NATURALMENTE NA MESA -->
    <g>
      <path d="M {l_sh[0]:.1f},{l_sh[1]:.1f} Q {l_elb[0] - 18:.1f},{l_elb[1] - 14:.1f} {l_elb[0]:.1f},{l_elb[1]:.1f} L {l_hand[0]:.1f},{l_hand[1]:.1f}" fill="none" stroke="#0b1020" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M {l_sh[0]:.1f},{l_sh[1]:.1f} Q {l_elb[0] - 18:.1f},{l_elb[1] - 14:.1f} {l_elb[0]:.1f},{l_elb[1]:.1f} L {l_hand[0]:.1f},{l_hand[1]:.1f}" fill="none" stroke="#1d4ed8" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="{l_hand[0] - 8:.1f}" cy="{l_hand[1]:.1f}" r="11.5" fill="#172554" stroke="#0b1020" stroke-width="2.5"/>
      <g transform="translate({l_hand[0] + 6:.1f}, {l_hand[1] - 1:.1f}) rotate(6)">
        <rect x="-12" y="-8" width="24" height="17" rx="8" fill="#f3c5a0" stroke="#18121e" stroke-width="2.8"/>
        <rect x="8" y="-6.5" width="13" height="4.8" rx="2.4" fill="#f8d5b8" stroke="#18121e" stroke-width="1.9"/>
        <rect x="9" y="-1.5" width="14" height="4.8" rx="2.4" fill="#f8d5b8" stroke="#18121e" stroke-width="1.9"/>
        <rect x="8" y="3.5" width="12" height="4.6" rx="2.3" fill="#e5b08a" stroke="#18121e" stroke-width="1.9"/>
      </g>
    </g>

    <!-- NOTEBOOK 2.5D — BASE METALICA + TECLADO + TRACKPAD + DOBRADICA -->
    {laptop_base_svg}

    <!-- CONE DE LUZ DA TELA (APAGA 100% AO FECHAR A TAMPA!) -->
    <ellipse cx="592" cy="414" rx="260" ry="185" fill="url(#b3ScreenCone)"/>

    <!-- BRACO DIREITO ATRAS DA TAMPA ENQUANTO ABERTA -->
    {"" if arm_in_front else r_sleeve_svg}
    {"" if (hand_over_lid or arm_in_front) else r_hand_svg}

    <!-- NOTEBOOK 2.5D — TAMPA COM ESPESSURA ROTACIONANDO EM ARCO REAL -->
    {laptop_lid_svg}

    <!-- BRACO/MAO DIREITA SOBRE O TOPO DA TAMPA (OU APOIADA NO TAMPO FECHADO) -->
    {r_sleeve_svg if arm_in_front else ""}
    {r_hand_svg if (hand_over_lid or arm_in_front) else ""}

    <!-- POEIRA ILUMINADA FLUTUANDO NO AR -->
    <g>{"".join(dust_motes)}</g>
  </g>

  <!-- Vinheta cinematografica suave -->
  <rect width="{W}" height="{H}" fill="none" stroke="#02050e" stroke-width="34" opacity="0.56"/>

  <!-- Legenda (exatamente o mesmo estilo do visuals_v2.py, sem cobrir rosto) -->
  {svg_caption(caption, "felipe" if caption else None, "cyan")}

  <!-- Flash branco no fim da Cena 2 entrando pro Robo -->
  {flash_rect}
</svg>'''


# =============================================================================
# FUNCAO PUBLICA PRINCIPAL
# =============================================================================
def render_felipe_opening_svg(t: float, m: dict, amp: float, caption: str) -> str:
    """
    Renderiza a Cena 2 (Abertura do Felipe) em SVG 1.1 (1280x720):
      - PLANO A (c2_start .. t_close - 0.35): PC fullscreen (YouTube Studio + Editor)
        com Felipe na webcam no canto superior esquerdo vendo as views caindo + suspiro.
      - PLANO B (t_close - 0.35 .. c2_end): Corte limpo pro quarto 3/4 de perto,
        fechando o notebook 2.5D realista com anatomia natural + luz apagando + fala.
    """
    t_cut = m["t_close"] - 0.35
    if t < t_cut:
        return _render_plano_a_webcam_studio(t, m, amp, caption)
    return _render_plano_b_room_close_and_talk(t, m, amp, caption)
