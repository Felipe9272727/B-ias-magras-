"""
Facade unificada v3 (combinando os dois modulos produzidos pelos 2 agentes Neon High):
  - felipe_opening_v3.py: Abertura com Felipe na Webcam vendo views cairem + Notebook 2.5D realista fechando
  - robot_webcam_v3.py:   Robo YouTuber com bracos/ombros/cotovelos/maos mecha articulados + boca LED fechada
                          + overlay transparente pronto para gameplay real!
"""
from __future__ import annotations

import sys
from pathlib import Path

_DIR = str(Path(__file__).resolve().parent)
if _DIR not in sys.path:
    sys.path.insert(0, _DIR)

from felipe_opening_v3 import render_felipe_opening_svg  # noqa: E402, F401
from robot_webcam_v3 import (  # noqa: E402, F401
    EMOTION_COLORS,
    H,
    W,
    clamp,
    dynamic_caption,
    ease_in_out,
    ease_out_back,
    lerp,
    render_gameplay_scene_svg,
    render_outro_card_svg,
    render_tnmn_backdrop_svg,
    render_webcam_overlay_svg,
    svg_caption,
)

# Compatibilidade com render_preview.py e montar_episodio.py
render_gameplay_composite_svg = render_gameplay_scene_svg
