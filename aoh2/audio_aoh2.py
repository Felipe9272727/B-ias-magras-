#!/usr/bin/env python3
"""Monta o audio mixado (-14 LUFS + sidechain ducking + musicas Kevin MacLeod)
a partir de video/youtube/aoh2/timeline_aoh2.json.

Funciona 100% via ffmpeg (sem depender de numpy) e aceita um recorte `--cenas`
para previas rapidas ou todas as 45 cenas do video completo.

Uso:
  python3 aoh2/audio_aoh2.py --out video/youtube/aoh2/previa_audio.m4a --cenas A1,A2,A3,B1,B2
"""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TIMELINE = REPO_ROOT / "video" / "youtube" / "aoh2" / "timeline_aoh2.json"
PUBLIC_DIR = REPO_ROOT / "video" / "remotion" / "public"
MUSIC_JSON = PUBLIC_DIR / "music" / "music.json"

SR = 48000


def ffprobe_dur(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        text=True,
    ).strip()
    return float(out or 0.0)


def build_scene_voice_sfx(scene: dict[str, Any], fps: int, out_wav: Path) -> None:
    dur_s = scene["dur"] / fps
    clips: list[tuple[Path, int, float]] = []

    for a in scene.get("audio", []):
        p = PUBLIC_DIR / a["src"]
        if p.exists():
            clips.append((p, round(a["at"] * 1000.0 / fps), float(a.get("vol", 1.0))))

    for s in scene.get("sfx", []):
        p = PUBLIC_DIR / s["src"]
        if p.exists():
            # SFX calibrado para pontuar sem cobrir narrador/IA
            clips.append((p, round(s["at"] * 1000.0 / fps), min(0.62, float(s.get("vol", 0.60)))))

    if not clips:
        subprocess.run(
            [
                "ffmpeg", "-v", "error", "-y",
                "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo:d={dur_s:.4f}",
                "-c:a", "pcm_s16le", str(out_wav),
            ],
            check=True,
        )
        return

    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo:d={dur_s:.4f}",
    ]
    filt = ["[0:a]aformat=sample_rates=48000:channel_layouts=stereo[base]"]
    labels = ["[base]"]
    for idx, (path, delay_ms, vol) in enumerate(clips, start=1):
        cmd += ["-i", str(path)]
        lbl = f"[c{idx}]"
        filt.append(
            f"[{idx}:a]aformat=sample_rates={SR}:channel_layouts=stereo,"
            f"volume={vol:.3f},adelay={max(0, delay_ms)}|{max(0, delay_ms)},apad[p{idx}];"
            f"[p{idx}]atrim=0:{dur_s:.4f},asetpts=PTS-STARTPTS{lbl}"
        )
        labels.append(lbl)

    filt.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0:duration=first:dropout_transition=0,"
        + f"atrim=0:{dur_s:.4f},asetpts=PTS-STARTPTS[out]"
    )
    cmd += ["-filter_complex", ";".join(filt), "-map", "[out]", "-c:a", "pcm_s16le", str(out_wav)]
    subprocess.run(cmd, check=True)


def main() -> None:
    ap = argparse.ArgumentParser(description="Monta faixa de audio final AoH2 (-14 LUFS + sidechain).")
    ap.add_argument("--timeline", default=str(DEFAULT_TIMELINE))
    ap.add_argument("--out", required=True, help="Arquivo de saida (.m4a, .flac ou .wav)")
    ap.add_argument("--cenas", default="", help="Lista opcional de IDs separados por virgula (ex: A1,A2,A3,B1,B2)")
    ap.add_argument("--music-gain", type=float, default=0.36, help="Multiplicador sobre suggested_bg_volume (padrao: 0.36)")
    args = ap.parse_args()

    tl = json.loads(Path(args.timeline).read_text(encoding="utf-8"))
    fps = int(tl.get("fps", 30))
    music_info = {m["id"]: m for m in json.loads(MUSIC_JSON.read_text(encoding="utf-8"))}

    # Propagar música ativa por toda a timeline antes de filtrar `--cenas`
    active_music = "hitman"
    cenas_all = tl["cenas"]
    for sc in cenas_all:
        if sc.get("musica") and sc["musica"].get("id"):
            active_music = sc["musica"]["id"]
        sc["_resolved_music"] = active_music

    if args.cenas.strip():
        wanted = [x.strip() for x in args.cenas.split(",") if x.strip()]
        by_id = {c["id"]: c for c in cenas_all}
        missing = [x for x in wanted if x not in by_id]
        if missing:
            raise SystemExit(f"Cenas nao encontradas na timeline: {missing}")
        cenas = [by_id[x] for x in wanted]
    else:
        cenas = list(cenas_all)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="aoh2_audio_") as tmpdir:
        tmp = Path(tmpdir)
        scene_wavs: list[Path] = []
        for idx, sc in enumerate(cenas):
            w = tmp / f"sc_{idx:03d}_{sc['id']}.wav"
            build_scene_voice_sfx(sc, fps, w)
            scene_wavs.append(w)

        concat_txt = tmp / "concat.txt"
        concat_txt.write_text(
            "\n".join(f"file '{w.as_posix()}'" for w in scene_wavs) + "\n",
            encoding="utf-8",
        )
        voice_track = tmp / "voz_sfx.wav"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_txt), "-c:a", "pcm_s16le", str(voice_track)],
            check=True,
        )

        # Agrupar blocos contínuos de música nas cenas selecionadas
        blocks: list[dict[str, Any]] = []
        for sc in cenas:
            d = sc["dur"] / fps
            mid = sc["_resolved_music"]
            if blocks and blocks[-1]["id"] == mid:
                blocks[-1]["dur"] += d
            else:
                blocks.append({"id": mid, "dur": d})

        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(voice_track)]
        fil = [f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo,asplit=2[voz][chave]"]
        in_idx = 1
        m_labels = []
        for b_idx, blk in enumerate(blocks):
            mid = blk["id"]
            d = blk["dur"]
            lbl = f"[m{b_idx}]"
            if mid == "silencio":
                cmd += ["-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo:d={d:.4f}"]
                fil.append(f"[{in_idx}:a]aformat=sample_rates={SR}:channel_layouts=stereo,atrim=0:{d:.4f},asetpts=PTS-STARTPTS{lbl}")
            else:
                mfile = PUBLIC_DIR / "music" / f"{mid}.mp3"
                if not mfile.exists():
                    raise SystemExit(f"Musica faltando: {mfile}")
                vol = float(music_info.get(mid, {}).get("suggested_bg_volume", 0.25)) * float(args.music_gain)
                cmd += ["-stream_loop", "-1", "-i", str(mfile)]
                fout_st = max(0.0, d - 1.0)
                fil.append(
                    f"[{in_idx}:a]aformat=sample_rates={SR}:channel_layouts=stereo,"
                    f"atrim=0:{d:.4f},asetpts=PTS-STARTPTS,"
                    f"volume={vol:.3f},afade=t=in:d=0.6,afade=t=out:st={fout_st:.4f}:d=1.0{lbl}"
                )
            in_idx += 1
            m_labels.append(lbl)

        fil.append("".join(m_labels) + f"concat=n={len(blocks)}:v=0:a=1[mus]")
        fil.append("[mus][chave]sidechaincompress=threshold=0.008:ratio=10:attack=20:release=550:makeup=1[md]")
        fil.append("[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[a]")

        ext = out_path.suffix.lower()
        if ext == ".flac":
            codec_args = ["-c:a", "flac"]
        elif ext == ".wav":
            codec_args = ["-c:a", "pcm_s16le"]
        else:
            codec_args = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]

        cmd += ["-filter_complex", ";".join(fil), "-map", "[a]", *codec_args, str(out_path)]
        subprocess.run(cmd, check=True)

    total_dur = ffprobe_dur(out_path)
    print(f"[audio_aoh2] OK -> {out_path} ({len(cenas)} cenas, dur={total_dur:.2f}s)")


if __name__ == "__main__":
    main()
