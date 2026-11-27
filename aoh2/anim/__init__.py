"""Pacote de animacoes vetoriais SVG para o compositor AoH2 (1920x1080)."""

from __future__ import annotations

from .guerra_svg import (
    DEFAULT_IA_CORES,
    bezier_control_point,
    compute_camera_follow,
    render_battle_explosion_fx,
    render_marching_column,
    render_radial_capture_overlay,
    render_soldiers_clash_fx,
    render_tactical_hud_box,
    render_tactical_war_layer,
    render_torn_treaty_fx,
)

__all__ = [
    "DEFAULT_IA_CORES",
    "bezier_control_point",
    "compute_camera_follow",
    "render_marching_column",
    "render_battle_explosion_fx",
    "render_radial_capture_overlay",
    "render_tactical_war_layer",
    "render_tactical_hud_box",
    "render_torn_treaty_fx",
    "render_soldiers_clash_fx",
]
