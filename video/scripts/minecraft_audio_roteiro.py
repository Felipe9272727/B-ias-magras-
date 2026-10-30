"""Keep Minecraft's one original track, base gain and global fades.

The existing mix_audio.py supplies its established sidechain/loudness settings.
"""
import json
from pathlib import Path

music = json.loads((Path(__file__).resolve().parents[1] / 'remotion/public/music/music.json').read_text())
voxel = next(track for track in music if track['id'] == 'voxel-revolution')
CUES = [('gancho', 'voxel-revolution', 0, 0.1 / (voxel.get('suggested_bg_volume', 0.25) * 0.85))]
SEM_TRILHA = []
FADE_IN = 20 / 30
FADE_OUT = 40 / 30
