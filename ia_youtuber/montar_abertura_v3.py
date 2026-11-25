#!/usr/bin/env python3
"""
Abertura v3 da IA YouTuber (That's Not My Neighbor) — gancho + Felipe + CORTE SECO pro Opus + entrada na gameplay.

Ordem (tempos aproximados, com teaser de ~6,5 s):
  [TEASER]  0,0 - ~7,0   melhor susto da partida (--teaser), zoom lento, borda vermelha, tag "DAQUI A POUCO...";
                         no fim congela, dessatura e bate "COMO A GENTE CHEGOU AQUI?" (record scratch).
  [PC]      +2,0 s       tela do YouTube Studio com as views caindo (trecho da abertura atual), push-in + selo.
  [FELIPE]  ~8,6 s       quarto re-renderizado (felipe_opening_v3) com a boca pela amplitude:
                         fecha o notebook -> "É galera, cansei de fazer vídeo... as views só caindo." (selo VIEWS -68%)
                         -> "Então... apresento a vocês..." (fala nova) com push-in forte no rosto, faixas de cinema,
                         sala escurecendo e riser subindo.
  [CORTE]                CORTE SECO: whoosh + impacto, 2 quadros de flash branco, Opus entra com soco de zoom,
                         tremida e barras de glitch RGB (tudo SVG, sem emoji).
  [OPUS]    ~10,8 s      robô em tela cheia (robot_webcam_v3): "E aí pessoal... Aqui é o Opus..." com placa "OPUS"
                         batendo no nome, selo "FELIPE: DE FOLGA", botão CURTIR em SVG e placa "META: 0 MONSTROS".
  [ENTRADA] 0,9 s        (opcional, --entrada-mp4) a câmera do robô encolhe até o canto (cam_p 0 -> 1) por cima
                         do 1o trecho da gameplay; a gameplay continua de --entrada-ss + --entrada-dur.

Uso (teste):
  python3 ia_youtuber/montar_abertura_v3.py \
     --felipe-wav <felipe_apresento.wav> \
     --teaser previa.mp4 --teaser-ss 0 --teaser-dur 6.45 \
     --entrada-mp4 previa.mp4 --entrada-ss 38.0 \
     --out abertura_v3_teste.mp4

Fontes:
  --base-abertura (padrão episodios/p2/abertura.mp4): dela saem o plano do PC (2,7-4,7 s), o som do notebook,
  a fala "É galera..." (7,38-11,78 s) e as duas falas do Opus (11,95-16,55 s e 17,45-23,40 s).
  O plano do quarto e o do Opus são re-renderizados (sem o rótulo "HYDROGEN" que vaza em ~17 s da abertura atual).

Regras do canal: nada de emoji (tudo SVG), voz normal, nada inventado (falas são as gravadas).
"""
from __future__ import annotations

import argparse
import array
import html
import math
import os
import shutil
import subprocess
import sys
import wave
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

os.environ["TNMN_LAYOUT"] = "center"  # legenda embaixo, no centro (a da gameplay é lateral)

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import felipe_opening_v3 as FO  # noqa: E402
import robot_webcam_v3 as RW  # noqa: E402

W, H = 1280, 720
FPS = 30
SR = 48000
SFX_DIR = REPO_ROOT / "video" / "remotion" / "public" / "sfx"
FONT = "Roboto, DejaVu Sans, sans-serif"

# Trechos da abertura atual (episodios/p2/abertura.mp4)
SRC_PC = (2.7, 4.7)          # YouTube Studio com as views despencando (com o suspiro)
SRC_NOTEBOOK = (4.7, 5.55)   # som do notebook fechando
SRC_FEL_FALA = (7.38, 11.78)  # "É galera, cansei de fazer vídeo... as views só caindo."
SRC_OPUS_1 = (11.95, 16.55)  # "E aí pessoal, tudo beleza? Aqui é o Opus e hoje o Felipe tirou folga!"
SRC_OPUS_2 = (17.45, 23.40)  # "Já senta o dedo no like que a gente vai zerar That's Not My Neighbor sem deixar UM monstro passar!"

# Plano do quarto (tempo virtual "vt" do felipe_opening_v3; o corte do PC pro quarto é em vt=4,7)
VT0 = 4.7
T_CLOSE = 5.05
T_FALA = 5.95      # começa "É galera..."
GAP_APRESENTO = 0.15

# Tempos das palavras (relativos ao começo de cada fala do Opus) — medidos no áudio
OPUS1_NOME = 1.75      # "...Aqui é o Opus"
OPUS1_FOLGA = 2.75     # "e hoje o Felipe tirou folga"
OPUS2_LIKE = 0.15      # "Já senta o dedo no like"
OPUS2_SPLIT = 2.8      # troca de bloco da legenda
OPUS2_META = 4.3       # "sem deixar UM monstro passar"

CAP_FEL_1 = "É galera, cansei de fazer vídeo... as views só caindo."
CAP_FEL_2 = "Então... apresento a vocês..."
CAP_OPUS_1 = "E AÍ PESSOAL, tudo beleza? Aqui é o Opus e hoje o Felipe tirou folga!"
CAP_OPUS_2A = "Já senta o dedo no like que a gente vai zerar..."
CAP_OPUS_2B = "...That's Not My Neighbor sem deixar UM monstro passar!"


# =============================================================================
# util
# =============================================================================
def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def ease_out_cubic(p: float) -> float:
    p = clamp(p)
    return 1 - (1 - p) ** 3


def ease_out_back(p: float) -> float:
    p = clamp(p)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2


def ease_in_out(p: float) -> float:
    p = clamp(p)
    return 3 * p * p - 2 * p * p * p


def ffmpeg() -> str:
    return shutil.which("ffmpeg") or "ffmpeg"


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def probe_dur(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    return float(out)


def sfx(name: str) -> Path | None:
    for ext in (".wav", ".mp3"):
        p = SFX_DIR / f"{name}{ext}"
        if p.is_file():
            return p
    return None


def read_mono(path: Path) -> tuple[array.array, int]:
    with wave.open(str(path), "rb") as w:
        sr, ch = w.getframerate(), w.getnchannels()
        assert w.getsampwidth() == 2, "wav precisa ser 16 bits"
        d = array.array("h", w.readframes(w.getnframes()))
    return (d[::ch] if ch > 1 else d), sr


def speech_end(path: Path, thr_db: float = -40.0) -> float:
    """Fim da última janela de 10 ms acima de thr_db (para cortar seco logo depois da fala)."""
    tmp = path.with_suffix(".s16.wav")
    run([ffmpeg(), "-v", "error", "-y", "-i", str(path), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", str(tmp)])
    d, sr = read_mono(tmp)
    tmp.unlink(missing_ok=True)
    win = sr // 100
    thr = 32768 * 10 ** (thr_db / 20)
    last = 0
    for i in range(0, len(d) - win, win):
        s = d[i:i + win:2]
        if math.sqrt(sum(x * x for x in s) / len(s)) > thr:
            last = i + win
    return last / sr


def amp_per_frame(stem_wav: Path, n_frames: int) -> list[float]:
    """Mesma escala do montar_episodio.compute_rms_30fps (rms * 3,8, até 1)."""
    d, sr = read_mono(stem_wav)
    spf = sr // FPS
    out = []
    for f in range(n_frames):
        s = d[f * spf:(f + 1) * spf:8]
        if not s:
            out.append(0.0)
            continue
        rms = math.sqrt(sum(x * x for x in s) / len(s)) / 32768.0
        out.append(round(min(1.0, rms * 3.8), 3))
    # suaviza 1 quadro pra boca não tremer
    return [round((out[max(0, i - 1)] + 2 * out[i] + out[min(len(out) - 1, i + 1)]) / 4, 3) for i in range(len(out))]


def mix_clips(clips: list[dict], total: float, out_wav: Path) -> None:
    """clips: {src, ss, dur, at, db, fin, fout}. Saída wav estéreo 48 kHz com a duração exata."""
    ff = ffmpeg()
    cmd = [ff, "-v", "error", "-y"]
    parts = []
    for i, c in enumerate(clips):
        cmd += ["-ss", f"{c['ss']:.3f}", "-t", f"{c['dur']:.3f}", "-i", str(c["src"])]
        ms = int(round(c["at"] * 1000))
        chain = f"[{i}:a]aformat=sample_rates={SR}:channel_layouts=stereo,volume={c.get('db', 0.0):.1f}dB"
        if c.get("fin"):
            chain += f",afade=t=in:st=0:d={c['fin']:.3f}"
        if c.get("fout"):
            chain += f",afade=t=out:st={max(0.0, c['dur'] - c['fout']):.3f}:d={c['fout']:.3f}"
        chain += f",adelay={ms}|{ms}[a{i}]"
        parts.append(chain)
    ins = "".join(f"[a{i}]" for i in range(len(clips)))
    parts.append(f"{ins}amix=inputs={len(clips)}:normalize=0:duration=longest,apad=whole_dur={total:.3f},atrim=0:{total:.3f}[out]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[out]", "-c:a", "pcm_s16le", "-ar", str(SR), str(out_wav)]
    run(cmd)


# =============================================================================
# peças SVG (sem emoji, tudo vetor)
# =============================================================================
def big_text(x: float, y: float, txt: str, size: float, fill: str, stroke: str = "#05070d",
             sw: float = 10.0, anchor: str = "middle", ls: float = 2.0) -> str:
    e = html.escape(txt)
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="{FONT}" font-weight="900" '
        f'font-size="{size:.1f}" letter-spacing="{ls}" fill="{stroke}" stroke="{stroke}" stroke-width="{sw}" '
        f'stroke-linejoin="round">{e}</text>'
        f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="{FONT}" font-weight="900" '
        f'font-size="{size:.1f}" letter-spacing="{ls}" fill="{fill}">{e}</text>'
    )


def glitch_bars(seed: int, strength: float) -> str:
    if strength <= 0.01:
        return ""
    out = []
    for k in range(7):
        r = (math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1.0
        r2 = (math.sin(seed * 3.17 + k * 9.91) * 1234.567) % 1.0
        y = r * H
        h = 6 + r2 * 34
        dx = (r2 - 0.5) * 90 * strength
        col = ("#22d3ee", "#ff2bd6", "#ffffff")[k % 3]
        out.append(f'<rect x="{dx:.1f}" y="{y:.1f}" width="{W}" height="{h:.1f}" fill="{col}" '
                   f'opacity="{0.28 * strength:.2f}"/>')
    return "".join(out)


def vignette(op: float, col: str = "#000000", gid: str = "vgn") -> str:
    if op <= 0.01:
        return ""
    return (
        f'<defs><radialGradient id="{gid}" cx="50%" cy="45%" r="70%">'
        f'<stop offset="45%" stop-color="{col}" stop-opacity="0"/>'
        f'<stop offset="100%" stop-color="{col}" stop-opacity="{op:.2f}"/></radialGradient></defs>'
        f'<rect width="{W}" height="{H}" fill="url(#{gid})"/>'
    )


def wrap_svg(body: str, transform: str, overlay: str) -> str:
    """Põe o conteúdo do <svg> num <g transform> (câmera) e acrescenta overlays por cima, fora da câmera."""
    i = body.index("<svg")
    j = body.index(">", i) + 1
    k = body.rindex("</svg>")
    return body[:j] + f'<g transform="{transform}">' + body[j:k] + "</g>" + overlay + body[k:]


def cam(z: float, cx: float, cy: float, dx: float = 0.0, dy: float = 0.0) -> str:
    return f"translate({cx + dx:.2f},{cy + dy:.2f}) scale({z:.4f}) translate({-cx:.2f},{-cy:.2f})"


def stamp_slam(lt: float, t_in: float, dur: float, text: str, cx: float, cy: float, rot: float = -4.0,
               fill: str = "#b91c1c", edge: str = "#fecaca", size: float = 40.0, arrow: bool = False) -> str:
    """Selo que bate (escala 1,6 -> 1,0) e some no fim; arrow=True desenha seta pra baixo (views caindo)."""
    a = lt - t_in
    if a < 0 or a > dur:
        return ""
    s = 1.6 - 0.6 * ease_out_back(a / 0.18)
    op = clamp(a / 0.06) * clamp((dur - a) / 0.15)
    w = len(text) * size * 0.66 + 70 + (60 if arrow else 0)
    hgt = size * 1.7
    arr = ""
    tx = 0.0
    if arrow:
        tx = 28.0
        ax = -w / 2 + 44
        arr = (f'<polygon points="{ax - 18:.1f},{-hgt * 0.22:.1f} {ax + 18:.1f},{-hgt * 0.22:.1f} {ax + 18:.1f},{hgt * 0.02:.1f} '
               f'{ax + 30:.1f},{hgt * 0.02:.1f} {ax:.1f},{hgt * 0.34:.1f} {ax - 30:.1f},{hgt * 0.02:.1f} {ax - 18:.1f},{hgt * 0.02:.1f}" '
               f'fill="#ffffff" stroke="#05070d" stroke-width="3"/>')
    return (
        f'<g opacity="{op:.2f}" transform="translate({cx:.1f},{cy:.1f}) rotate({rot:.1f}) scale({s:.3f})">'
        f'<rect x="{-w / 2 + 6:.1f}" y="{-hgt / 2 + 8:.1f}" width="{w:.1f}" height="{hgt:.1f}" rx="14" fill="#000" fill-opacity="0.5"/>'
        f'<rect x="{-w / 2:.1f}" y="{-hgt / 2:.1f}" width="{w:.1f}" height="{hgt:.1f}" rx="14" fill="{fill}" stroke="{edge}" stroke-width="5"/>'
        f'<rect x="{-w / 2 + 8:.1f}" y="{-hgt / 2 + 8:.1f}" width="{w - 16:.1f}" height="{hgt - 16:.1f}" rx="9" fill="none" '
        f'stroke="{edge}" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="8,5"/>'
        f'{arr}{big_text(tx, size * 0.36, text, size, "#ffffff", "#05070d", 7, "middle", 1.5)}</g>'
    )


def like_button(a: float, dur: float, cx: float, cy: float) -> str:
    """Botão CURTIR desenhado (polegar em path, sem emoji) + toque com onda."""
    if a < 0 or a > dur:
        return ""
    s = ease_out_back(a / 0.25) * (1 - 0.12 * clamp((a - 0.75) / 0.08) * clamp((0.95 - a) / 0.08))
    op = clamp((dur - a) / 0.2)
    pressed = a > 0.85
    bg = "#e11d48" if pressed else "#1f2937"
    ring = ""
    if 0.82 < a < 1.5:
        r = 60 + (a - 0.82) * 260
        ring = f'<circle cx="0" cy="0" r="{r:.1f}" fill="none" stroke="#fda4af" stroke-width="6" opacity="{clamp(1 - (a - 0.82) / 0.68):.2f}"/>'
    thumb = (
        '<g transform="translate(-58,0) scale(1.5)" fill="#ffffff" stroke="#05070d" stroke-width="2.5" stroke-linejoin="round">'
        '<rect x="-34" y="-6" width="14" height="34" rx="3"/>'
        '<path d="M -16 -6 L -4 -6 L 3 -25 Q 7 -35 15 -31 Q 21 -27 18 -16 L 15 -8 L 30 -8 Q 38 -8 37 0 L 33 21 Q 31 28 24 28 L -16 28 Z"/>'
        "</g>"
    )
    return (
        f'<g opacity="{op:.2f}" transform="translate({cx:.1f},{cy:.1f}) scale({s:.3f})">{ring}'
        f'<rect x="-136" y="-52" width="280" height="112" rx="56" fill="#000" fill-opacity="0.5"/>'
        f'<rect x="-140" y="-58" width="280" height="112" rx="56" fill="{bg}" stroke="#ffffff" stroke-width="5"/>'
        f"{thumb}{big_text(42, 14, 'CURTIR', 40, '#ffffff', '#05070d', 6, 'middle', 2)}</g>"
    )


# =============================================================================
# quadros de cada parte
# =============================================================================
def svg_teaser_overlay(lt: float, dur: float, freeze: float, texto: str) -> str:
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    pulse = 0.5 + 0.5 * math.sin(lt * 7.0)
    parts.append(vignette(0.35 + 0.15 * pulse, "#7f0010", "tv"))
    parts.append(f'<rect x="5" y="5" width="{W - 10}" height="{H - 10}" fill="none" stroke="#ff264d" '
                 f'stroke-width="10" opacity="{0.35 + 0.35 * pulse:.2f}"/>')
    if lt < dur:
        tag_op = clamp((lt - 0.15) / 0.2)
        parts.append(
            f'<g opacity="{tag_op:.2f}" transform="translate({W - 330},{H - 74})">'
            f'<rect x="0" y="0" width="300" height="46" rx="10" fill="#0b0f1a" fill-opacity="0.88" stroke="#ff264d" stroke-width="3"/>'
            f'<circle cx="24" cy="23" r="8" fill="#ff264d" opacity="{0.4 + 0.6 * (int(lt * 2) % 2):.2f}"/>'
            f"{big_text(162, 32, 'DAQUI A POUCO...', 24, '#ffffff', '#0b0f1a', 4, 'middle', 1.5)}</g>"
        )
    else:
        a = lt - dur
        parts.append(f'<rect width="{W}" height="{H}" fill="#05070d" opacity="{0.25 + 0.35 * clamp(a / 0.12):.2f}"/>')
        parts.append(glitch_bars(int(lt * FPS), clamp(1 - a / 0.2)))
        s = 1.7 - 0.7 * ease_out_back(a / 0.16)
        l1, _, l2 = texto.partition("|")
        parts.append(f'<g transform="translate({W / 2:.1f},{H / 2 - 20:.1f}) scale({s:.3f}) rotate(-3)">')
        if l2:
            parts.append(big_text(0, -18, l1.strip(), 84, "#ffffff", "#05070d", 16))
            parts.append(big_text(0, 76, l2.strip(), 96, "#ffd426", "#05070d", 18))
        else:
            parts.append(big_text(0, 30, l1.strip(), 88, "#ffd426", "#05070d", 16))
        parts.append("</g>")
    parts.append("</svg>")
    return "".join(parts)


def svg_pc_overlay(lt: float, dur: float) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        + vignette(0.45, "#000000", "pv")
        + glitch_bars(int(lt * FPS) + 7, clamp(1 - lt / 0.3))
        + stamp_slam(lt, 0.35, dur - 0.35, "AS VIEWS DESPENCANDO", 700, 430, -5, "#b91c1c", "#fecaca", 40, arrow=True)
        + "</svg>"
    )


FACE_X, FACE_Y = 456.0, 250.0  # rosto do Felipe no quadro do quarto (com o dolly do felipe_opening_v3 no fim)


def svg_felipe(vt: float, amp: float, m: dict, t_apr: float, t_cut: float, pausa: tuple[float, float]) -> str:
    body = FO.render_felipe_opening_svg(vt, m, amp, "")
    # câmera extra: soquinho no "Então...", segura na pausa, push-in forte no "apresento a vocês..."
    z = 1.0
    if vt >= t_apr:
        z += 0.07 * ease_out_cubic((vt - t_apr) / 0.25)
    if vt >= t_apr + pausa[1]:
        z += 0.42 * ease_in_out((vt - (t_apr + pausa[1])) / max(0.3, t_cut - (t_apr + pausa[1])))
    shake = 0.0
    dx = math.sin(vt * 23.0) * shake
    tr = cam(z, FACE_X, FACE_Y + 40, dx, 0)
    ov = []
    dark = 0.0
    bars = 0.0
    if vt >= t_apr:
        dark = 0.25 + 0.5 * ease_in_out((vt - t_apr) / max(0.3, t_cut - t_apr))
        bars = 64 * ease_out_cubic((vt - t_apr) / 0.35)
    ov.append(vignette(dark, "#000000", "fv"))
    if bars > 0.5:
        ov.append(f'<rect x="0" y="0" width="{W}" height="{bars:.1f}" fill="#000"/>'
                  f'<rect x="0" y="{H - bars:.1f}" width="{W}" height="{bars:.1f}" fill="#000"/>')
    # selo "VIEWS -68%" no "as views só caindo"
    ov.append(stamp_slam(vt, 8.85, 1.55, "VIEWS -68%", 1010, 150, 5, "#b91c1c", "#fecaca", 44, arrow=True))
    cap = CAP_FEL_1 if T_FALA - 0.05 <= vt < t_apr - 0.05 else (CAP_FEL_2 if vt >= t_apr - 0.05 else "")
    if cap:
        cap_svg = FO.svg_caption(cap, "felipe", "cyan")
        if bars > 0.5:  # sobe a legenda acima da faixa de cinema
            cap_svg = f'<g transform="translate(0,{-max(0.0, bars - 40):.1f})">{cap_svg}</g>'
        ov.append(cap_svg)
    return wrap_svg(body, tr, "".join(ov))


def svg_opus(lt: float, amp: float, o1: float, o2: float | None, d1: float, d2: float, total: float) -> str:
    body = RW.render_webcam_overlay_svg(t=lt + 12.0, amp=amp, emotion="green", caption="", cam_p=0.0,
                                        transparent_bg=False, timecode_sec=lt)
    # câmera: soco de zoom no corte + tremida, deriva lenta, soquinho no "Opus"
    z = 1.0 + 0.24 * (1 - ease_out_cubic(lt / 0.32)) + 0.06 * (lt / max(1.0, total))
    a_nome = lt - (o1 + OPUS1_NOME)
    if 0 <= a_nome < 0.6:
        z += 0.07 * math.sin(math.pi * clamp(a_nome / 0.6))
    sh = 14.0 * clamp(1 - lt / 0.3)
    dx, dy = math.sin(lt * 61.0) * sh, math.cos(lt * 47.0) * sh
    tr = cam(z, 640, 330, dx, dy)
    ov = []
    # flash branco do corte (2 quadros cheios) + glitch RGB
    if lt < 0.17:  # 2 quadros cheios + 3 sumindo
        ov.append(f'<rect width="{W}" height="{H}" fill="#ffffff" opacity="{(1.0 if lt < 0.06 else clamp(1 - (lt - 0.06) / 0.1)) * 0.95:.2f}"/>')
    ov.append(glitch_bars(int(lt * FPS) + 99, clamp(1 - lt / 0.3)))
    # placa do nome
    if 0 <= a_nome < 2.2:
        s = 1.8 - 0.8 * ease_out_back(a_nome / 0.18)
        op = clamp((2.2 - a_nome) / 0.2)
        ov.append(
            f'<g opacity="{op:.2f}" transform="translate(250,470) scale({s:.3f}) rotate(-4)">'
            f'<rect x="-200" y="-78" width="400" height="150" rx="22" fill="#000" fill-opacity="0.55" transform="translate(8,10)"/>'
            f'<rect x="-200" y="-78" width="400" height="150" rx="22" fill="#062a1a" stroke="#22ff88" stroke-width="6"/>'
            f"{big_text(0, 22, 'OPUS', 104, '#22ff88', '#04140c', 12, 'middle', 8)}"
            f"{big_text(0, 58, 'IA YOUTUBER DE HOJE', 22, '#dcfce7', '#04140c', 5, 'middle', 3)}</g>"
        )
    # selo FELIPE: DE FOLGA
    a_f = lt - (o1 + OPUS1_FOLGA)
    ov.append(stamp_slam(a_f, 0.15, 1.75, "FELIPE: DE FOLGA", 1000, 175, 5, "#7f1d1d", "#fecaca", 36))
    cap = ""
    if o1 <= lt < o1 + d1 + 0.1:
        cap = CAP_OPUS_1
    if o2 is not None:
        a2 = lt - o2
        ov.append(like_button(a2 - OPUS2_LIKE, 2.0, 1060, 420))
        a_m = a2 - OPUS2_META
        if a_m >= 0:
            s = 1.6 - 0.6 * ease_out_back(a_m / 0.18)
            ov.append(
                f'<g transform="translate(640,128) scale({s:.3f}) rotate(-2)">'
                f'<rect x="-330" y="-56" width="660" height="104" rx="18" fill="#000" fill-opacity="0.5" transform="translate(7,9)"/>'
                f'<rect x="-330" y="-56" width="660" height="104" rx="18" fill="#ffd426" stroke="#05070d" stroke-width="6"/>'
                f"{big_text(0, 20, 'META: 0 MONSTROS', 58, '#05070d', '#ffd426', 2, 'middle', 3)}</g>"
            )
        if o2 <= lt < o2 + OPUS2_SPLIT:
            cap = CAP_OPUS_2A
        elif o2 + OPUS2_SPLIT <= lt:
            cap = CAP_OPUS_2B
    ov.append(RW.svg_caption(cap, "robo", "green"))
    if lt > total - 0.14:  # saída: flash curto pra emendar seco na gameplay
        ov.append(f'<rect width="{W}" height="{H}" fill="#ffffff" opacity="{clamp((lt - (total - 0.14)) / 0.1) * 0.85:.2f}"/>')
    return wrap_svg(body, tr, "".join(ov))


def svg_entrada(lt: float, dur: float) -> str:
    p = ease_in_out(lt / dur)
    emo = "green" if p < 0.5 else "cyan"
    return RW.render_webcam_overlay_svg(t=lt + 40.0, amp=0.0, emotion=emo, caption="", cam_p=p,
                                        transparent_bg=True, timecode_sec=lt)


# =============================================================================
# render paralelo
# =============================================================================
def _job(task: tuple) -> int:
    kind, idx, out_png, kw = task
    if kind == "teaser":
        svg = svg_teaser_overlay(**kw)
    elif kind == "pc":
        svg = svg_pc_overlay(**kw)
    elif kind == "felipe":
        svg = svg_felipe(**kw)
    elif kind == "opus":
        svg = svg_opus(**kw)
    elif kind == "entrada":
        svg = svg_entrada(**kw)
    else:
        raise ValueError(kind)
    subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), "-o", str(out_png)], input=svg.encode("utf-8"), check=True)
    return idx


def render_frames(tasks: list[tuple], workers: int) -> None:
    with ProcessPoolExecutor(max_workers=workers) as ex:
        for _ in ex.map(_job, tasks, chunksize=4):
            pass


def encode_seq(pattern: Path, out_mp4: Path) -> None:
    run([ffmpeg(), "-v", "error", "-y", "-framerate", str(FPS), "-i", str(pattern),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS), str(out_mp4)])


def comp_video_overlay(src: Path, ss: float, dur: float, ov_pattern: Path, out_mp4: Path, zoom: float = 0.0,
                       fx: str = "0.5", fy: str = "0.5", freeze: float = 0.0, extra: str = "") -> None:
    """Trecho de vídeo (1280x720, zoom lento opcional, congelamento no fim) + sequência PNG por cima."""
    n = int(round((dur + freeze) * FPS))
    chain = (f"[0:v]fps={FPS},scale=1920:1080:force_original_aspect_ratio=decrease,"
             f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1")
    if freeze > 0:
        chain += f",tpad=stop_mode=clone:stop_duration={freeze:.3f}"
    if zoom > 0:
        chain += f",zoompan=z='1+{zoom}*on/{n}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s={W}x{H}:fps={FPS}"
    else:
        chain += f",scale={W}:{H}:flags=lanczos"
    if extra:
        chain += "," + extra
    chain += "[b];[b][1:v]overlay=0:0:shortest=1[v]"
    run([ffmpeg(), "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", str(src),
         "-framerate", str(FPS), "-i", str(ov_pattern), "-filter_complex", chain, "-map", "[v]",
         "-frames:v", str(n), "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p",
         "-r", str(FPS), str(out_mp4)])


# =============================================================================
# principal
# =============================================================================
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--base-abertura", type=Path, default=SCRIPT_DIR / "episodios" / "p2" / "abertura.mp4")
    ap.add_argument("--felipe-wav", type=Path, required=True, help='fala nova "Então... apresento a vocês..."')
    ap.add_argument("--felipe-pausa", default="0.78,1.43",
                    help="pausa dentro da fala nova (s, ini,fim): segura o zoom e depois empurra")
    ap.add_argument("--teaser", type=Path, default=None, help="MP4 com o gancho (melhor susto da partida)")
    ap.add_argument("--teaser-ss", type=float, default=0.0)
    ap.add_argument("--teaser-dur", type=float, default=6.5)
    ap.add_argument("--teaser-texto", default="COMO A GENTE|CHEGOU AQUI?", help="'|' quebra a linha")
    ap.add_argument("--teaser-db", type=float, default=0.0)
    ap.add_argument("--sem-scratch", action="store_true", help="sem o record scratch no 1o quadro (quando não há gancho antes)")
    ap.add_argument("--sem-like", action="store_true", help="tira a 2a fala do Opus (like + meta) — abertura ~6 s menor")
    ap.add_argument("--entrada-mp4", type=Path, default=None,
                    help="vídeo da gameplay (o episódio já com a webcam no canto): a câmera do Opus encolhe por cima")
    ap.add_argument("--entrada-ss", type=float, default=0.0)
    ap.add_argument("--entrada-dur", type=float, default=0.9)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--work", type=Path, default=None)
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 4) - 1))
    ap.add_argument("--lufs", type=float, default=-16.0)
    a = ap.parse_args(argv)

    base = a.base_abertura
    work = a.work or a.out.with_suffix("").parent / (a.out.stem + "_work")
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    pausa = tuple(float(x) for x in a.felipe_pausa.split(","))

    # ------------------------------------------------------------------ plano de tempo
    sections: list[tuple[str, float, float]] = []  # (nome, ini global, dur)
    clips: list[dict] = []
    g = 0.0
    freeze = 0.6
    if a.teaser:
        td = a.teaser_dur
        sections.append(("teaser", g, td + freeze))
        clips.append(dict(src=a.teaser, ss=a.teaser_ss, dur=td, at=g, db=a.teaser_db, fin=0.02, fout=0.08))
        rs = sfx("record-scratch")
        if rs:
            clips.append(dict(src=rs, ss=0.0, dur=1.0, at=g + td - 0.03, db=-3.0, fout=0.3))
        g += td + freeze

    elif not a.sem_scratch:
        # o gancho vem antes, colado pela montagem: "volta a fita" com record scratch + glitch no 1o quadro
        rs = sfx("record-scratch")
        if rs:
            clips.append(dict(src=rs, ss=0.0, dur=0.9, at=0.0, db=-5.0, fout=0.3))

    pc_dur = SRC_PC[1] - SRC_PC[0]
    sections.append(("pc", g, pc_dur))
    clips.append(dict(src=base, ss=SRC_PC[0], dur=pc_dur, at=g, fin=0.04))
    g += pc_dur

    # quarto do Felipe
    fel_wav_end = speech_end(a.felipe_wav)
    fel_dur_fala = SRC_FEL_FALA[1] - SRC_FEL_FALA[0]
    t_apr = T_FALA + fel_dur_fala + GAP_APRESENTO
    t_cut = t_apr + fel_wav_end + 0.08
    b_dur = t_cut - VT0
    g_b = g
    sections.append(("felipe", g, b_dur))
    fel_stem = [
        dict(src=base, ss=SRC_NOTEBOOK[0], dur=SRC_NOTEBOOK[1] - SRC_NOTEBOOK[0], at=0.0, fout=0.08),
        dict(src=base, ss=SRC_FEL_FALA[0], dur=fel_dur_fala, at=T_FALA - VT0, fin=0.02, fout=0.05),
        dict(src=a.felipe_wav, ss=0.0, dur=fel_wav_end + 0.05, at=t_apr - VT0, fout=0.05),
    ]
    for c in fel_stem:
        clips.append({**c, "at": c["at"] + g_b})
    riser = sfx("riser")
    if riser:
        rd = probe_dur(riser)
        want = min(rd, t_cut - t_apr)
        clips.append(dict(src=riser, ss=rd - want, dur=want, at=g_b + (t_cut - VT0) - want, db=-9.0, fin=0.4))
    wh = sfx("whoosh")
    if wh:
        clips.append(dict(src=wh, ss=0.0, dur=0.5, at=g_b + (t_cut - VT0) - 0.42, db=-4.0, fout=0.1))
    g += b_dur
    g_cut = g

    # Opus
    imp = sfx("impact-epic")
    if imp:
        clips.append(dict(src=imp, ss=0.0, dur=1.6, at=g_cut, db=-6.0, fout=0.8))
    gl = sfx("glitch")
    if gl:
        clips.append(dict(src=gl, ss=0.0, dur=0.35, at=g_cut, db=-12.0, fout=0.1))
    o1 = 0.12
    d1 = SRC_OPUS_1[1] - SRC_OPUS_1[0]
    o2 = None if a.sem_like else o1 + d1 + 0.2
    d2 = SRC_OPUS_2[1] - SRC_OPUS_2[0]
    o_dur = (o2 + d2 if o2 is not None else o1 + d1) + 0.3
    sections.append(("opus", g, o_dur))
    op_stem = [dict(src=base, ss=SRC_OPUS_1[0], dur=d1, at=o1, fin=0.02, fout=0.05)]
    if o2 is not None:
        op_stem.append(dict(src=base, ss=SRC_OPUS_2[0], dur=d2, at=o2, fin=0.02, fout=0.05))
        pop = sfx("pop")
        if pop:
            clips.append(dict(src=pop, ss=0.0, dur=0.5, at=g + o2 + OPUS2_LIKE + 0.85, db=-8.0))
        ding = sfx("correct-ding")
        if ding:
            clips.append(dict(src=ding, ss=0.0, dur=0.8, at=g + o2 + OPUS2_META, db=-12.0, fout=0.2))
    for c in op_stem:
        clips.append({**c, "at": c["at"] + g})
    g += o_dur

    if a.entrada_mp4:
        sections.append(("entrada", g, a.entrada_dur))
        clips.append(dict(src=a.entrada_mp4, ss=a.entrada_ss, dur=a.entrada_dur, at=g, fin=0.35, db=-2.0))
        sw = sfx("swoosh-air")
        if sw:
            clips.append(dict(src=sw, ss=0.0, dur=0.8, at=g, db=-8.0))
        g += a.entrada_dur
    total = g

    for nome, ini, dur in sections:
        print(f"  {nome:8s} {ini:6.2f} -> {ini + dur:6.2f}  ({dur:.2f} s)", flush=True)
    print(f"TOTAL {total:.2f} s | corte seco pro Opus em {g_cut:.2f} s", flush=True)

    # ------------------------------------------------------------------ amplitudes (boca)
    fel_stem_wav = work / "stem_felipe.wav"
    mix_clips(fel_stem, b_dur, fel_stem_wav)
    op_stem_wav = work / "stem_opus.wav"
    mix_clips(op_stem, o_dur, op_stem_wav)
    n_b = int(round(b_dur * FPS))
    n_o = int(round(o_dur * FPS))
    amp_b = amp_per_frame(fel_stem_wav, n_b)
    amp_o = amp_per_frame(op_stem_wav, n_o)

    m = dict(c2_start=0.0, t_sigh=3.7, t_close=T_CLOSE, t_f1=T_FALA, t_f2=T_FALA, c2_end=t_cut + 0.25)

    # ------------------------------------------------------------------ quadros
    tasks = []
    dirs = {}
    for nome, ini, dur in sections:
        d = work / nome
        d.mkdir()
        dirs[nome] = d
        n = int(round(dur * FPS))
        for i in range(n):
            lt = i / FPS
            out = d / f"f_{i:05d}.png"
            if nome == "teaser":
                kw = dict(lt=lt, dur=a.teaser_dur, freeze=freeze, texto=a.teaser_texto)
            elif nome == "pc":
                kw = dict(lt=lt, dur=dur)
            elif nome == "felipe":
                kw = dict(vt=VT0 + lt, amp=amp_b[min(i, n_b - 1)], m=m, t_apr=t_apr, t_cut=t_cut, pausa=pausa)
            elif nome == "opus":
                kw = dict(lt=lt, amp=amp_o[min(i, n_o - 1)], o1=o1, o2=o2, d1=d1, d2=d2, total=o_dur)
            else:
                kw = dict(lt=lt, dur=dur)
            tasks.append((nome, i, out, kw))
    print(f"Renderizando {len(tasks)} quadros SVG com {a.workers} processos...", flush=True)
    render_frames(tasks, a.workers)

    # ------------------------------------------------------------------ vídeos das partes
    parts = []
    for nome, ini, dur in sections:
        out = work / f"parte_{nome}.mp4"
        pat = dirs[nome] / "f_%05d.png"
        if nome == "teaser":
            comp_video_overlay(a.teaser, a.teaser_ss, a.teaser_dur, pat, out, zoom=0.10, fx="0.62", fy="0.4",
                               freeze=freeze, extra=f"hue=s='if(gte(t,{a.teaser_dur:.3f}),0.15,1)'")
        elif nome == "pc":
            comp_video_overlay(base, SRC_PC[0], dur, pat, out, zoom=0.08, fx="0.42", fy="0.35")
        elif nome == "entrada":
            comp_video_overlay(a.entrada_mp4, a.entrada_ss, dur, pat, out)
        else:
            encode_seq(pat, out)
        parts.append(out)

    lst = work / "partes.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    video = work / "video.mp4"
    run([ffmpeg(), "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(video)])

    # ------------------------------------------------------------------ áudio + final
    mix = work / "mix.wav"
    mix_clips(clips, total, mix)
    a.out.parent.mkdir(parents=True, exist_ok=True)
    run([ffmpeg(), "-v", "error", "-y", "-i", str(video), "-i", str(mix),
         "-filter_complex", f"[1:a]loudnorm=I={a.lufs}:TP=-1.5:LRA=11,aresample={SR},alimiter=limit=0.89[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
         "-t", f"{total:.3f}", "-movflags", "+faststart", str(a.out)])
    print(f"ABERTURA V3 PRONTA: {a.out} ({total:.2f} s)", flush=True)
    if a.entrada_mp4:
        print(f"  a gameplay continua de {a.entrada_ss + a.entrada_dur:.2f} s do --entrada-mp4", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
