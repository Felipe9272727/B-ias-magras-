#!/usr/bin/env python3
"""
UNO das IAs — Mix final 1080p (Lanczos + AGE color grading) + Trilha + Ducking + Loudnorm -14 LUFS.

Concatena os arquivos <scene_id>.mkv na ordem exata de `timeline_uno.json`, monta a trilha de fundo
a partir de `music_blocks.json` com fades suaves e volume calibrado, aplica sidechain compression
sob `voice_sfx_master_uno.flac` (threshold=0.015, ratio=9, attack=25, release=350), normaliza para
-14 LUFS com limitador e faz upscale 720p -> 1080p Lanczos com color grading padrão do canal.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_UNO_DIR = Path(os.environ.get("UNO_DIR", SCRIPT_DIR.parent))
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_ASSETS_DIR = Path(os.environ.get("UNO_ASSETS_DIR", REPO_ROOT / "video" / "remotion" / "public"))
DEFAULT_SCENES_DIR = Path(os.environ.get("UNO_WORK_DIR", "/tmp/uno_scenes"))

SILENT_IDS = {"silencio", "none", "silence"}


def resolve_music_track(block: dict, music_dir: Path) -> Path | None:
    """Retorna o caminho do .mp3 do bloco, ou None se for bloco de silêncio."""
    mid = str(block.get("music_id") or "").strip()
    vol = float(block.get("vol", 0.0))
    mp3_name = block.get("mp3_name")
    if mid in SILENT_IDS or vol <= 0.0 or (mp3_name is None and not mid):
        return None
    candidates = []
    if mp3_name:
        candidates.append(music_dir / mp3_name)
    if mid:
        candidates.append(music_dir / f"{mid}.mp3")
    for cand in candidates:
        if cand.is_file() and cand.stat().st_size > 0:
            return cand
    expected = candidates[0] if candidates else music_dir / "<desconhecido>.mp3"
    raise FileNotFoundError(f"Faixa de música ausente ou vazia para '{mid}': {expected}")


def validate_inputs(
    scenes_dir: Path,
    timeline_path: Path,
    voice_flac: Path,
    music_blocks_path: Path,
    music_dir: Path,
) -> tuple[list[Path], list[dict], float]:
    """Valida todos os insumos necessários antes de invocar o FFmpeg."""
    if not shutil.which("ffmpeg"):
        raise RuntimeError("Executável 'ffmpeg' não encontrado no PATH.")
    if not timeline_path.is_file():
        raise FileNotFoundError(f"Timeline não encontrada: {timeline_path}")
    if not scenes_dir.is_dir():
        raise FileNotFoundError(f"Diretório de cenas não encontrado: {scenes_dir}")
    if not voice_flac.is_file() or voice_flac.stat().st_size == 0:
        raise FileNotFoundError(f"Faixa master de voz/SFX ausente ou vazia: {voice_flac}")
    if not music_blocks_path.is_file():
        raise FileNotFoundError(f"Arquivo music_blocks.json não encontrado: {music_blocks_path}")
    if not music_dir.is_dir():
        raise FileNotFoundError(f"Diretório de músicas não encontrado: {music_dir}")

    tl = json.loads(timeline_path.read_text(encoding="utf-8"))
    cenas = tl.get("cenas") or []
    if not cenas:
        raise ValueError(f"Timeline sem cenas em {timeline_path}")

    scene_files: list[Path] = []
    missing_scenes: list[str] = []
    for idx, sc in enumerate(cenas):
        sid = sc.get("id")
        if not sid:
            raise ValueError(f"Cena no índice {idx} sem campo 'id' em {timeline_path}")
        mkv = scenes_dir / f"{sid}.mkv"
        if not mkv.is_file() or mkv.stat().st_size == 0:
            missing_scenes.append(str(mkv))
        else:
            scene_files.append(mkv)

    if missing_scenes:
        preview = ", ".join(missing_scenes[:8])
        extra = f" (+{len(missing_scenes) - 8} outras)" if len(missing_scenes) > 8 else ""
        raise FileNotFoundError(
            f"{len(missing_scenes)} cena(s) .mkv ausente(s) ou vazia(s): {preview}{extra}"
        )

    blocks_raw = json.loads(music_blocks_path.read_text(encoding="utf-8"))
    if not isinstance(blocks_raw, list):
        raise ValueError(f"music_blocks.json deve ser uma lista JSON: {music_blocks_path}")

    resolved_blocks: list[dict] = []
    for idx, b in enumerate(blocks_raw):
        dur = b.get("duration_sec")
        if dur is None and b.get("start_sec") is not None and b.get("end_sec") is not None:
            dur = float(b["end_sec"]) - float(b["start_sec"])
        dur_f = float(dur or 0.0)
        if dur_f <= 0.0:
            raise ValueError(f"Bloco de música #{idx} com duration_sec inválido ({dur}): {b}")
        track = resolve_music_track(b, music_dir)
        resolved_blocks.append({
            "music_id": b.get("music_id", "silencio"),
            "duration_sec": dur_f,
            "vol": float(b.get("vol", 0.0)),
            "track_path": track,
        })

    fps = int(tl.get("fps", 30))
    total_sec = float(tl.get("durationSec") or sum(int(c["dur"]) for c in cenas) / fps)
    return scene_files, resolved_blocks, total_sec


def build_filter_graph(blocks: list[dict], total_sec: float) -> tuple[list[str], str]:
    """Monta entradas de música e filter_complex completo (música + ducking + 1080p AGE)."""
    music_inputs: list[str] = []
    filters: list[str] = []

    if blocks:
        for i, b in enumerate(blocks):
            in_idx = 2 + i
            dur = max(0.05, b["duration_sec"])
            track = b["track_path"]
            if track is None:
                music_inputs += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
                filters.append(f"[{in_idx}:a]atrim=0:{dur:.4f},asetpts=PTS-STARTPTS[m{i}]")
            else:
                fade_in = min(0.8, dur * 0.4)
                fade_out = min(1.2, dur * 0.4)
                fade_out_start = max(0.0, dur - fade_out)
                music_inputs += ["-stream_loop", "-1", "-i", str(track)]
                filters.append(
                    f"[{in_idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                    f"atrim=0:{dur:.4f},asetpts=PTS-STARTPTS,volume={b['vol']:.4f},"
                    f"afade=t=in:st=0:d={fade_in:.4f},"
                    f"afade=t=out:st={fade_out_start:.4f}:d={fade_out:.4f}[m{i}]"
                )
        concat_pins = "".join(f"[m{i}]" for i in range(len(blocks)))
        filters.append(f"{concat_pins}concat=n={len(blocks)}:v=0:a=1[mus]")
    else:
        music_inputs += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        filters.append(f"[2:a]atrim=0:{max(0.1, total_sec):.4f},asetpts=PTS-STARTPTS[mus]")

    filters.append("[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave]")
    filters.append("[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=350:makeup=1[md]")
    filters.append(
        "[voz][md]amix=inputs=2:normalize=0:duration=first,"
        "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false,apad[a]"
    )
    filters.append(
        "[0:v]scale=1920:1080:flags=lanczos,"
        "eq=contrast=1.06:saturation=1.18:gamma=0.98,"
        "unsharp=5:5:0.5,vignette=angle=0.42[v]"
    )
    return music_inputs, ";".join(filters)


def run_mix(
    scene_files: list[Path],
    voice_flac: Path,
    blocks: list[dict],
    total_sec: float,
    out_path: Path,
    preset: str = "veryfast",
    crf: int = 18,
) -> None:
    """Concatena cenas .mkv e executa a mixagem + upscale 1080p final."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_out = out_path.with_name(f".{out_path.stem}.tmp{out_path.suffix}")

    with tempfile.TemporaryDirectory(prefix="uno_final_mix_") as tmp_dir:
        tmp = Path(tmp_dir)
        concat_list = tmp / "concat_scenes.txt"
        lines = []
        for mkv in scene_files:
            escaped = str(mkv.resolve()).replace("'", "'\\''")
            lines.append(f"file '{escaped}'")
        concat_list.write_text("\n".join(lines) + "\n", encoding="utf-8")

        concat_mkv = tmp / "concat_video.mkv"
        print(f"[uno_final_mix] Concatenando {len(scene_files)} cenas .mkv...")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-c", "copy", str(concat_mkv)],
            check=True,
        )

        music_inputs, filter_graph = build_filter_graph(blocks, total_sec)

        cmd = [
            "ffmpeg", "-v", "error", "-y",
            "-i", str(concat_mkv),
            "-i", str(voice_flac),
            *music_inputs,
            "-filter_complex", filter_graph,
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-movflags", "+faststart", "-shortest",
            str(tmp_out),
        ]
        print(f"[uno_final_mix] Renderizando 1080p Lanczos + mix -14 LUFS ({len(blocks)} blocos de música)...")
        try:
            subprocess.run(cmd, check=True)
            tmp_out.replace(out_path)
        except Exception:
            tmp_out.unlink(missing_ok=True)
            raise

    size_mb = out_path.stat().st_size / (1024 * 1024)
    print(f"[uno_final_mix] OK: {out_path} ({size_mb:.1f} MB)")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Mix final 1080p do UNO das IAs")
    ap.add_argument("--scenes-dir", type=Path, default=DEFAULT_SCENES_DIR, help="Diretório com <scene_id>.mkv")
    ap.add_argument("--timeline", type=Path, default=DEFAULT_UNO_DIR / "timeline_uno.json", help="Caminho para timeline_uno.json")
    ap.add_argument("--voice-flac", type=Path, default=DEFAULT_UNO_DIR / "voice_sfx_master_uno.flac", help="Faixa master FLAC de voz+SFX")
    ap.add_argument("--music-blocks", type=Path, default=DEFAULT_UNO_DIR / "music_blocks.json", help="Arquivo music_blocks.json")
    ap.add_argument("--music-dir", type=Path, default=DEFAULT_ASSETS_DIR / "music", help="Diretório com faixas .mp3")
    ap.add_argument("--out", type=Path, default=DEFAULT_UNO_DIR / "uno_das_ias_1080p.mp4", help="Arquivo MP4 final 1080p")
    ap.add_argument("--preset", default="veryfast", help="Preset x264 (padrão: veryfast)")
    ap.add_argument("--crf", type=int, default=18, help="CRF x264 (padrão: 18)")
    ap.add_argument("--check-only", action="store_true", help="Valida entradas sem executar o FFmpeg")
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        scene_files, blocks, total_sec = validate_inputs(
            scenes_dir=args.scenes_dir,
            timeline_path=args.timeline,
            voice_flac=args.voice_flac,
            music_blocks_path=args.music_blocks,
            music_dir=args.music_dir,
        )
    except Exception as exc:
        print(f"[uno_final_mix] ERRO de validação: {exc}", file=sys.stderr)
        return 1

    print(
        f"[uno_final_mix] Validação OK: {len(scene_files)} cenas ({total_sec:.1f}s) · "
        f"{len(blocks)} blocos de música · saída={args.out}"
    )
    if args.check_only:
        return 0

    try:
        run_mix(
            scene_files=scene_files,
            voice_flac=args.voice_flac,
            blocks=blocks,
            total_sec=total_sec,
            out_path=args.out,
            preset=args.preset,
            crf=args.crf,
        )
    except Exception as exc:
        print(f"[uno_final_mix] ERRO no FFmpeg: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
