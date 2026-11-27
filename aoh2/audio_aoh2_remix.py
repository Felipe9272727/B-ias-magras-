#!/usr/bin/env python3
"""Remix do áudio do AoH2 (Opus, após a avaliação dos 3 Sonnets).

Mesma entrada do audio_aoh2.py (timeline_aoh2.json), com as correções do relatorio_som.md:
  1. Cada voz normalizada para o mesmo nível (-19 LUFS por arquivo), com fade-in 15 ms e fade-out 30 ms.
     (Qwen e DeepSeek estavam 5-10 dB abaixo do narrador.)
  2. SFX com volume por id (sirene, bomba, rádio, caneta e tic-tac estavam no nível do narrador)
     e abaixados mais 10 dB quando caem em cima de uma voz.
  3. Música audível: ganho 0.60 e sidechain mais leve (threshold 0.02, ratio 3.5, release 300).
  4. Trocas de música com crossfade de 1.5 s (antes abria um buraco de 0.5-1.3 s a cada troca).
O eco dos pensamentos continua o padrão do canal (já vem nos arquivos de voz).

Uso:
  python3 aoh2/audio_aoh2_remix.py --out /caminho/audio.m4a [--cenas A1,A2] [--video final.mp4 --video-out remix.mp4]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TIMELINE = REPO_ROOT / "video" / "youtube" / "aoh2" / "timeline_aoh2.json"
PUBLIC_DIR = REPO_ROOT / "video" / "remotion" / "public"
MUSIC_JSON = PUBLIC_DIR / "music" / "music.json"
CACHE_LUFS = REPO_ROOT / "aoh2" / ".lufs_vozes.json"

SR = 48000
ALVO_VOZ = -19.0          # LUFS por arquivo de voz
GANHO_MAX_DB = 12.0
XFADE = 1.5               # s de crossfade entre músicas
DUCK_SFX = 0.32           # ~ -10 dB quando o SFX cai em cima de voz
SFX_VOL = {               # volume por id (antes: tudo ~0.6)
    "sirene-ataque": 0.25, "bomba-distante": 0.32, "radio-chiado": 0.30, "caneta": 0.35,
    "tic-tac": 0.30, "heartbeat": 0.45, "impact-epic": 0.45, "explosion": 0.40, "boom": 0.42,
    "record-scratch": 0.40, "crowd-boo": 0.40, "crowd-cheer": 0.40, "crowd-laugh": 0.38,
    "crowd-applause": 0.38, "death": 0.45, "game-over-8bit": 0.38, "coin": 0.55,
}
SFX_PADRAO = 0.42


def ffprobe_dur(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], text=True
    ).strip()
    return float(out or 0.0)


def lufs(path: Path) -> float | None:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else None


def ganhos_vozes(cenas: list[dict[str, Any]]) -> dict[str, float]:
    cache: dict[str, float] = {}
    if CACHE_LUFS.exists():
        cache = json.loads(CACHE_LUFS.read_text(encoding="utf-8"))
    mudou = False
    for sc in cenas:
        for a in sc.get("audio", []):
            src = a["src"]
            if src in cache or not (PUBLIC_DIR / src).exists():
                continue
            v = lufs(PUBLIC_DIR / src)
            if v is not None and v > -70:
                cache[src] = v
                mudou = True
    if mudou:
        CACHE_LUFS.write_text(json.dumps(cache, indent=1), encoding="utf-8")
    return {k: max(-GANHO_MAX_DB, min(GANHO_MAX_DB, ALVO_VOZ - v)) for k, v in cache.items()}


def build_scene(scene: dict[str, Any], fps: int, out_wav: Path, ganho: dict[str, float]) -> None:
    dur_s = scene["dur"] / fps
    clips: list[tuple[Path, float, str]] = []  # (arquivo, atraso s, filtro)
    vozes: list[tuple[float, float]] = []
    for a in scene.get("audio", []):
        p = PUBLIC_DIR / a["src"]
        if not p.exists():
            continue
        at = a["at"] / fps
        d = a.get("dur", 0) / fps or ffprobe_dur(p)
        vozes.append((at, at + d))
        g = ganho.get(a["src"], 0.0)
        fo = max(0.0, d - 0.03)
        clips.append((p, at, f"volume={g:+.2f}dB,afade=t=in:d=0.015,afade=t=out:st={fo:.3f}:d=0.03"))
    for s in scene.get("sfx", []):
        p = PUBLIC_DIR / s["src"]
        if not p.exists():
            continue
        at = s["at"] / fps
        d = ffprobe_dur(p)
        vol = SFX_VOL.get(s["id"], SFX_PADRAO)
        if any(at < b and at + d > a for a, b in vozes):
            vol *= DUCK_SFX
        clips.append((p, at, f"volume={vol:.3f}"))

    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo:d={dur_s:.4f}"]
    filt = ["[0:a]aformat=sample_rates=48000:channel_layouts=stereo[base]"]
    labels = ["[base]"]
    for i, (p, at, f) in enumerate(clips, start=1):
        cmd += ["-i", str(p)]
        ms = max(0, round(at * 1000))
        filt.append(f"[{i}:a]aformat=sample_rates={SR}:channel_layouts=stereo,{f},adelay={ms}|{ms},apad,"
                    f"atrim=0:{dur_s:.4f},asetpts=PTS-STARTPTS[c{i}]")
        labels.append(f"[c{i}]")
    filt.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first:dropout_transition=0,"
                f"atrim=0:{dur_s:.4f},asetpts=PTS-STARTPTS[out]")
    cmd += ["-filter_complex", ";".join(filt), "-map", "[out]", "-c:a", "pcm_s16le", str(out_wav)]
    subprocess.run(cmd, check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--timeline", default=str(DEFAULT_TIMELINE))
    ap.add_argument("--out", required=True)
    ap.add_argument("--cenas", default="")
    ap.add_argument("--music-gain", type=float, default=0.60)
    ap.add_argument("--video", default="", help="vídeo já renderizado para trocar só o áudio")
    ap.add_argument("--video-out", default="")
    args = ap.parse_args()

    tl = json.loads(Path(args.timeline).read_text(encoding="utf-8"))
    fps = int(tl.get("fps", 30))
    music_info = {m["id"]: m for m in json.loads(MUSIC_JSON.read_text(encoding="utf-8"))}
    ativa = "hitman"
    for sc in tl["cenas"]:
        if sc.get("musica") and sc["musica"].get("id"):
            ativa = sc["musica"]["id"]
        sc["_mus"] = ativa
    cenas = tl["cenas"]
    if args.cenas.strip():
        by_id = {c["id"]: c for c in cenas}
        cenas = [by_id[x.strip()] for x in args.cenas.split(",") if x.strip()]

    ganho = ganhos_vozes(cenas)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="aoh2_remix_") as td:
        tmp = Path(td)
        wavs = []
        for i, sc in enumerate(cenas):
            w = tmp / f"sc_{i:03d}.wav"
            build_scene(sc, fps, w, ganho)
            wavs.append(w)
        (tmp / "concat.txt").write_text("".join(f"file '{w.as_posix()}'\n" for w in wavs), encoding="utf-8")
        voz = tmp / "voz_sfx.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "concat.txt"),
                        "-c:a", "pcm_s16le", str(voz)], check=True)

        blocos: list[dict[str, Any]] = []
        for sc in cenas:
            d = sc["dur"] / fps
            if blocos and blocos[-1]["id"] == sc["_mus"]:
                blocos[-1]["dur"] += d
            else:
                blocos.append({"id": sc["_mus"], "dur": d})

        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(voz)]
        fil = [f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo,asplit=2[voz][chave]"]
        n = len(blocos)
        for b, blk in enumerate(blocos):
            # cada bloco (menos o último) ganha XFADE s a mais, que o crossfade consome
            d = blk["dur"] + (XFADE if b < n - 1 else 0.0)
            if blk["id"] == "silencio":
                cmd += ["-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo:d={d:.4f}"]
                fil.append(f"[{b+1}:a]aformat=sample_rates={SR}:channel_layouts=stereo,atrim=0:{d:.4f},asetpts=PTS-STARTPTS[m{b}]")
            else:
                mf = PUBLIC_DIR / "music" / f"{blk['id']}.mp3"
                if not mf.exists():
                    raise SystemExit(f"Musica faltando: {mf}")
                vol = float(music_info.get(blk["id"], {}).get("suggested_bg_volume", 0.25)) * args.music_gain
                cmd += ["-stream_loop", "-1", "-i", str(mf)]
                fil.append(f"[{b+1}:a]aformat=sample_rates={SR}:channel_layouts=stereo,atrim=0:{d:.4f},"
                           f"asetpts=PTS-STARTPTS,volume={vol:.3f}[m{b}]")
        cur = "[m0]"
        for b in range(1, n):
            fil.append(f"{cur}[m{b}]acrossfade=d={XFADE}:c1=tri:c2=tri[x{b}]")
            cur = f"[x{b}]"
        total = sum(sc["dur"] for sc in cenas) / fps
        fil.append(f"{cur}afade=t=in:d=0.6,atrim=0:{total:.4f},asetpts=PTS-STARTPTS,"
                   f"afade=t=out:st={max(0.0, total - 3.0):.3f}:d=3[mus]")
        fil.append("[mus][chave]sidechaincompress=threshold=0.02:ratio=3.5:attack=15:release=300:makeup=1[md]")
        fil.append("[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,"
                   "alimiter=limit=0.84:level=false[a]")
        ext = out_path.suffix.lower()
        codec = ["-c:a", "flac"] if ext == ".flac" else ["-c:a", "pcm_s16le"] if ext == ".wav" else \
            ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
        cmd += ["-filter_complex", ";".join(fil), "-map", "[a]", *codec, str(out_path)]
        subprocess.run(cmd, check=True)

    print(f"[audio_aoh2_remix] OK -> {out_path} ({len(cenas)} cenas, dur={ffprobe_dur(out_path):.2f}s)")
    if args.video and args.video_out:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", args.video, "-i", str(out_path), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", args.video_out], check=True)
        print(f"[audio_aoh2_remix] vídeo -> {args.video_out}")


if __name__ == "__main__":
    main()
