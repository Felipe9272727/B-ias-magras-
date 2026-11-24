#!/usr/bin/env python3
"""
Pos-producao — IA YouTuber (That's Not My Neighbor).

Recebe `gameplay_real.mp4` + `session_log.jsonl` gravados pelo `motor_tnmn.py` e produz
o episodio final pronto para o YouTube:
  1. Normaliza falas em PT-BR (`IA -> i-á`, etc.) e gera audio real no ElevenLabs v4 (`eleven_v4`)
     com cache SHA-256 + envelope RMS a 30 FPS.
  2. Faz corte automatico dos tempos mortos (mantendo apenas trechos ativos + reacoes).
  3. Renderiza a Webcam do Robo YouTuber + Legendas + Selos com fundo transparente usando
     `visuals_v2.render_webcam_overlay_svg(..., transparent_bg=True)` via `rsvg-convert`.
  4. Compone o overlay transparente em cima da gameplay real cortada via FFmpeg.
  5. Prepende a abertura animada do Felipe (ou renderiza a partir de `visuals_v2`).
  6. Mixa SFX do canal + musica Kevin MacLeod com `sidechaincompress` + `loudnorm -14 LUFS`.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass
import hashlib
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
os.environ.setdefault("TNMN_LAYOUT", "side")
ASSETS_DIR = Path(os.environ.get("UNO_ASSETS_DIR", REPO_ROOT / "video" / "remotion" / "public"))
SFX_DIR = ASSETS_DIR / "sfx"
MUSIC_DIR = ASSETS_DIR / "music"
MUSIC_JSON = MUSIC_DIR / "music.json"
DEFAULT_VOICE_CACHE = SCRIPT_DIR / "voice_cache"
DEFAULT_APIS_TXT = Path(
    os.environ.get(
        "APIS_TXT",
        "/data/data/com.termux/files/home/storage/shared/geminineon/apis.txt",
    )
)
PREVIEW_DIR_CANDIDATE = Path(
    "/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/"
    "b175ef9d-02e1-4883-a866-c0168af38f38/scratch/ia_youtuber_preview"
)

ELEVEN_MODEL_V4 = "eleven_v4"
DEFAULT_ROBO_VOICE_ID = "IKne3meq5aSn9XLyUdCD"  # Charlie (agil/expressivo)
FPS = 30
SR = 48000

_TERM_TTS_REPLACEMENTS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\bIAs\b"), "i-ás"),
    (re.compile(r"\bIA\b"), "i-á"),
    (re.compile(r"\bD\.D\.D\.(?!\w)|\bDDD\b"), "Dê Dê Dê"),
    (re.compile(r"\bIDs?\b"), lambda m: "i-dês" if m.group(0).endswith("s") else "i-dê"),  # type: ignore[arg-type]
    (re.compile(r"\bPC\b"), "Pê Cê"),
    (re.compile(r"\bviews\b", re.I), "víus"),
    (re.compile(r"\bThat's Not My Neighbor\b", re.I), "Déts Nót Mái Nêibor"),
    (re.compile(r"\bdoppelg[aä]ngers?\b", re.I), "dôpelgânguer"),
    (re.compile(r"\b3312\b"), "três três um dois"),
)

EMOTION_SFX = {
    "red": ("sirene-ataque", 0.35),
    "yellow": ("notification-pop", 0.45),
    "green": ("whoosh", 0.45),
    "purple": ("glitch", 0.45),
}


def find_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for cand in ("/usr/bin/ffmpeg", "/tmp/ffstatic/node_modules/ffmpeg-static/ffmpeg"):
        if Path(cand).exists():
            return cand
    return "ffmpeg"


def find_rsvg() -> str:
    found = shutil.which("rsvg-convert")
    return found or "rsvg-convert"


def find_sfx(name: str) -> Path | None:
    for d in (SFX_DIR, ASSETS_DIR / "sfx_au2", ASSETS_DIR / "sfx_au4", ASSETS_DIR / "sfx_jogo"):
        for ext in (".wav", ".mp3"):
            cand = d / f"{name}{ext}"
            if cand.is_file():
                return cand
    return None


def get_elevenlabs_key(apis_txt: Path = DEFAULT_APIS_TXT) -> str | None:
    if os.environ.get("ELEVENLABS_API_KEY", "").strip():
        return os.environ["ELEVENLABS_API_KEY"].strip()
    if apis_txt.is_file():
        lines = apis_txt.read_text(encoding="utf-8").splitlines()
        for prefix in (r"elevenlabs2", r"elevenlabs(?:\s+api)?"):
            for line in lines:
                m = re.match(rf"^\s*{prefix}\s*:\s*(.+)$", line, re.I)
                if m and m.group(1).strip():
                    return m.group(1).strip()
    return None


def normalize_tts_ptbr(text: str) -> str:
    """Normaliza apenas o texto enviado ao TTS ElevenLabs v4 (mantendo legendas intactas)."""
    out = re.sub(r"\[whispers?\]", "", text or "", flags=re.I).strip()
    for pat, repl in _TERM_TTS_REPLACEMENTS:
        out = pat.sub(repl, out)
    return re.sub(r"\s{2,}", " ", out).strip()


def tts_eleven_v4(
    text: str,
    voice_id: str = DEFAULT_ROBO_VOICE_ID,
    model_id: str = ELEVEN_MODEL_V4,
    cache_dir: Path = DEFAULT_VOICE_CACHE,
    apis_txt: Path = DEFAULT_APIS_TXT,
) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    tts_text = normalize_tts_ptbr(text)
    h = hashlib.sha256(f"{model_id}|{voice_id}|{tts_text}".encode("utf-8")).hexdigest()[:16]
    wav_path = cache_dir / f"robo_{h}.wav"
    if wav_path.is_file() and wav_path.stat().st_size > 2000:
        return wav_path

    raw_mp3 = cache_dir / f"robo_{h}.mp3"
    if not raw_mp3.is_file() or raw_mp3.stat().st_size < 1000:
        key = get_elevenlabs_key(apis_txt)
        if not key:
            raise RuntimeError("Falta ELEVENLABS_API_KEY ou entrada 'elevenlabs api:' em apis.txt")
        payload = {
            "text": tts_text,
            "model_id": model_id,
            "voice_settings": {
                "stability": 0.36,
                "similarity_boost": 0.78,
                "style": 0.45,
                "use_speaker_boost": True,
            },
        }
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw_mp3.write_bytes(resp.read())

    ff = find_ffmpeg()
    subprocess.run(
        [
            ff, "-v", "error", "-y", "-i", str(raw_mp3),
            "-af", f"aformat=sample_rates={SR}:channel_layouts=stereo,volume=1.0",
            "-c:a", "pcm_s16le", str(wav_path),
        ],
        check=True,
    )
    return wav_path


def wav_duration_sec(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / float(w.getframerate())


def read_wav_stereo_float(path: Path) -> list[tuple[float, float]]:
    with wave.open(str(path), "rb") as w:
        raw = w.readframes(w.getnframes())
    vals = struct.unpack(f"<{len(raw)//2}h", raw)
    scale = 1.0 / 32768.0
    return [(vals[i] * scale, vals[i + 1] * scale) for i in range(0, len(vals), 2)]


def compute_rms_30fps(samples_l: list[float], total_frames: int) -> list[float]:
    spf = SR // FPS
    out: list[float] = []
    n = len(samples_l)
    for f in range(total_frames):
        s0 = f * spf
        s1 = min(n, s0 + spf)
        if s0 >= n:
            out.append(0.0)
            continue
        acc = 0.0
        cnt = 0
        for i in range(s0, s1, 8):
            v = samples_l[i]
            acc += v * v
            cnt += 1
        rms = math.sqrt(acc / max(1, cnt))
        out.append(round(min(1.0, rms * 3.8), 3))
    return out


@dataclass
class CutSegment:
    src_start: float
    src_end: float
    dst_start: float
    events: list[dict[str, Any]]
    freeze_sec: float = 0.0  # congela o 1o quadro (o jogo estava pausado enquanto a IA pensava/falava)


def load_session_log(log_path: Path) -> list[dict[str, Any]]:
    if not log_path.is_file():
        raise FileNotFoundError(f"session_log.jsonl nao encontrado: {log_path}")
    entries: list[dict[str, Any]] = []
    for line in log_path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s:
            entries.append(json.loads(s))
    entries.sort(key=lambda e: float(e.get("t_video_sec", 0.0)))
    return entries


def build_cut_plan(
    entries: list[dict[str, Any]],
    speech_durations: dict[int, float],
    pad_pre: float = 0.6,
    pad_post: float = 0.9,
    merge_gap: float = 2.0,
) -> tuple[list[CutSegment], float]:
    """Corta tempos mortos mantendo trechos ativos + reacoes e remapeia t_video_sec -> t_cut_sec."""
    raw_windows: list[tuple[float, float, dict[str, Any]]] = []
    for idx, ev in enumerate(entries):
        t0 = float(ev.get("t_video_sec", 0.0))
        act_d = float(ev.get("duracao_acoes_sec", 1.5))
        sp_d = float(speech_durations.get(idx, 2.5))
        dur = max(act_d, sp_d)
        w_start = max(0.0, t0 - pad_pre)
        w_end = t0 + dur + pad_post
        raw_windows.append((w_start, w_end, {**ev, "_idx": idx, "_speech_dur": sp_d}))

    if not raw_windows:
        return [], 0.0

    merged: list[list[Any]] = [[raw_windows[0][0], raw_windows[0][1], [raw_windows[0][2]]]]
    for w_start, w_end, ev in raw_windows[1:]:
        prev = merged[-1]
        if w_start <= prev[1] + merge_gap:
            prev[1] = max(prev[1], w_end)
            prev[2].append(ev)
        else:
            merged.append([w_start, w_end, [ev]])

    segments: list[CutSegment] = []
    dst_cursor = 0.0
    for src_s, src_e, evs in merged:
        mapped_evs: list[dict[str, Any]] = []
        last_speech_end = dst_cursor
        for ev in evs:
            t_in_seg = max(0.0, float(ev.get("t_video_sec", src_s)) - src_s)
            speech_start = max(dst_cursor + t_in_seg, last_speech_end + 0.12)
            speech_dur = float(ev["_speech_dur"])
            last_speech_end = speech_start + speech_dur
            mapped_evs.append({
                **ev,
                "t_cut_start": round(speech_start, 3),
                "t_cut_end": round(last_speech_end, 3),
            })
        seg_dur = max(src_e - src_s, last_speech_end - dst_cursor + 0.35)
        segments.append(CutSegment(
            src_start=round(src_s, 3),
            src_end=round(src_s + seg_dur, 3),
            dst_start=round(dst_cursor, 3),
            events=mapped_evs,
        ))
        dst_cursor += seg_dur

    return segments, round(dst_cursor, 3)


def wav_duration_or_probe(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0


def build_turn_plan(
    entries: list[dict[str, Any]],
    turnos: list[int],
    speech_durations: dict[int, float],
    video_dur: float,
) -> tuple[list[CutSegment], float]:
    """Um segmento por turno escolhido: congela o print enquanto o YouTuber fala e depois roda as acoes do turno."""
    segments: list[CutSegment] = []
    dst = 0.0
    for idx, ev in enumerate(entries):
        if int(ev.get("turno", -1)) not in turnos:
            continue
        t0 = float(ev.get("t_video_sec", 0.0))
        t1 = float(entries[idx + 1]["t_video_sec"]) if idx + 1 < len(entries) else min(video_dur, t0 + 4.0)
        t1 = max(t1, t0 + 1.0)
        fala = float(speech_durations.get(idx, 0.0))
        acao = t1 - t0
        freeze = max(0.35, fala + 0.35 - acao) if fala > 0 else 0.0
        mapped = {**ev, "_idx": idx, "_speech_dur": fala, "t_cut_start": round(dst + 0.15, 3), "t_cut_end": round(dst + 0.15 + fala, 3)}
        segments.append(CutSegment(src_start=round(t0, 3), src_end=round(t1, 3), dst_start=round(dst, 3), events=[mapped], freeze_sec=round(freeze, 3)))
        dst += freeze + (t1 - t0)
    return segments, round(dst, 3)


def load_visuals_v2(extra_dir: Path | None = None):
    candidates = [
        extra_dir,
        SCRIPT_DIR,
        Path(os.environ.get("IA_YOUTUBER_VISUALS_DIR", "")) if os.environ.get("IA_YOUTUBER_VISUALS_DIR") else None,
        PREVIEW_DIR_CANDIDATE,
    ]
    for cand in candidates:
        if cand and (cand / "visuals_v2.py").is_file():
            if str(cand) not in sys.path:
                sys.path.insert(0, str(cand))
            import visuals_v2  # type: ignore
            if hasattr(visuals_v2, "render_webcam_overlay_svg"):
                return visuals_v2
    return None


def resolve_music_spec(music_id: str) -> tuple[Path | None, float]:
    if not MUSIC_JSON.is_file():
        return None, 0.25
    entries = json.loads(MUSIC_JSON.read_text(encoding="utf-8"))
    for row in entries:
        if row.get("id") == music_id:
            rel = str(row.get("file") or f"{music_id}.mp3")
            cand = ASSETS_DIR / rel if "/" in rel else MUSIC_DIR / rel
            if cand.is_file():
                return cand, float(row.get("suggested_bg_volume", 0.25))
    cand = MUSIC_DIR / f"{music_id}.mp3"
    return (cand if cand.is_file() else None), 0.25


def _render_overlay_frame(task: tuple[int, float, float, str, str, str, float, float, Path, str | None]) -> int:
    fi, t, amp, emo, cap, stamp, stamp_p, cam_p, out_png, visuals_dir_str = task
    vis = load_visuals_v2(Path(visuals_dir_str) if visuals_dir_str else None)
    if vis is None:
        raise RuntimeError("Modulo visuals_v2.py com render_webcam_overlay_svg nao encontrado.")
    panic_shake = 1.0 if emo == "red" else 0.0
    svg = vis.render_webcam_overlay_svg(
        t=t,
        amp=amp,
        emotion=emo,
        caption=cap,
        cam_p=cam_p,
        stamp_text=stamp,
        stamp_p=stamp_p,
        panic_shake=panic_shake,
        transparent_bg=True,
    )
    subprocess.run(
        [find_rsvg(), "-w", "1280", "-h", "720", "-o", str(out_png)],
        input=svg.encode("utf-8"),
        check=True,
    )
    return fi


STAGE_CROP = "crop=888:666:197:49"  # palco 4:3 do TurboWarp dentro do 1280x720 (sem a borda branca da pagina)
STAGE_W, STAGE_H = 960, 720


def _drift(i: int, dur: float) -> str:
    """Camera com deriva lenta em toda cena (zoom suave, alternando o ponto de foco)."""
    n = max(1, int(round(dur * FPS)))
    fx, fy = [("0.5", "0.5"), ("0.42", "0.45"), ("0.58", "0.45"), ("0.5", "0.6")][i % 4]
    z = f"1+0.055*on/{n}"
    return (
        f",zoompan=z='{z}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s={STAGE_W}x{STAGE_H}:fps={FPS}"
    )


def render_cut_gameplay(gameplay_mp4: Path, segments: list[CutSegment], out_mp4: Path, width: int, height: int) -> None:
    ff = find_ffmpeg()
    parts: list[str] = []
    concat_inputs = ""
    for i, seg in enumerate(segments):
        parts.append(
            f"[0:v]trim=start={seg.src_start:.3f}:end={seg.src_end:.3f},"
            f"setpts=PTS-STARTPTS,fps={FPS},{STAGE_CROP},scale=1920:1440:flags=lanczos"
            + (f",tpad=start_duration={seg.freeze_sec:.3f}:start_mode=clone" if seg.freeze_sec > 0 else "")
            + _drift(i, (seg.src_end - seg.src_start) + seg.freeze_sec)
            + f"[v{i}]"
        )
        concat_inputs += f"[v{i}]"
    parts.append(f"{concat_inputs}concat=n={len(segments)}:v=1:a=0,split[ca][cb]")
    parts.append(f"[ca]scale={width}:{height},boxblur=24:2,eq=brightness=-0.22:saturation=0.55[bg]")
    parts.append(f"[bg][cb]overlay={width - STAGE_W}:0,setsar=1[vout]")
    subprocess.run(
        [
            ff, "-v", "error", "-y", "-i", str(gameplay_mp4),
            "-filter_complex", ";".join(parts),
            "-map", "[vout]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p",
            str(out_mp4),
        ],
        check=True,
    )


def build_voice_sfx_master(
    segments: list[CutSegment],
    speech_wavs: dict[int, Path],
    total_dur: float,
    work_dir: Path,
    out_flac: Path,
) -> list[float]:
    total_samples = max(1, int(math.ceil(total_dur * SR)))
    voz_l = [0.0] * total_samples
    mix_l = [0.0] * total_samples
    mix_r = [0.0] * total_samples
    ff = find_ffmpeg()

    for seg in segments:
        for ev in seg.events:
            idx = int(ev["_idx"])
            wp = speech_wavs.get(idx)
            if wp and wp.is_file():
                st = read_wav_stereo_float(wp)
                off = int(round(ev["t_cut_start"] * SR))
                for i, (lv, rv) in enumerate(st):
                    pos = off + i
                    if pos >= total_samples:
                        break
                    mix_l[pos] += lv
                    mix_r[pos] += rv
                    voz_l[pos] += lv

            emo = ev.get("emocao", "cyan")
            if emo in EMOTION_SFX:
                sfx_name, vol = EMOTION_SFX[emo]
                sp = find_sfx(sfx_name)
                if sp:
                    tmp_s = work_dir / f"_sfx_{sfx_name}_48k.wav"
                    if not tmp_s.is_file():
                        subprocess.run(
                            [ff, "-v", "error", "-y", "-i", str(sp), "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(tmp_s)],
                            check=True,
                        )
                    st = read_wav_stereo_float(tmp_s)
                    off = int(round(ev["t_cut_start"] * SR))
                    for i, (lv, rv) in enumerate(st):
                        pos = off + i
                        if pos >= total_samples:
                            break
                        mix_l[pos] += lv * vol
                        mix_r[pos] += rv * vol

    total_frames = int(math.ceil(total_dur * FPS))
    rms = compute_rms_30fps(voz_l, total_frames)

    peak = max(0.001, max(max(abs(x) for x in mix_l), max(abs(x) for x in mix_r)))
    norm = min(1.0, 0.85 / peak)
    raw_wav = work_dir / "_voice_sfx_master.wav"
    buf = bytearray(total_samples * 4)
    for i in range(total_samples):
        lv = max(-1.0, min(1.0, mix_l[i] * norm))
        rv = max(-1.0, min(1.0, mix_r[i] * norm))
        struct.pack_into("<hh", buf, i * 4, int(lv * 32767), int(rv * 32767))
    with wave.open(str(raw_wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(buf))
    subprocess.run([ff, "-v", "error", "-y", "-i", str(raw_wav), "-c:a", "flac", str(out_flac)], check=True)
    raw_wav.unlink(missing_ok=True)
    return rms


def caption_chunks(fala: str, t0: float, t1: float, max_words: int = 7) -> list[tuple[float, float, str]]:
    """Divide a fala em blocos de ate 7 palavras, com o tempo proporcional ao numero de letras."""
    words = (fala or "").split()
    if not words or t1 <= t0:
        return []
    chunks: list[str] = []
    cur: list[str] = []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words or (len(cur) >= 4 and w[-1:] in ".!?,"):
            chunks.append(" ".join(cur))
            cur = []
    if cur:
        if chunks and len(cur) <= 2:
            chunks[-1] += " " + " ".join(cur)
        else:
            chunks.append(" ".join(cur))
    total = sum(len(c) + 2 for c in chunks)
    out = []
    t = t0
    for i, c in enumerate(chunks):
        d = (t1 - t0) * (len(c) + 2) / total
        end = t + d if i < len(chunks) - 1 else t1 + 0.35
        out.append((t, end, c))
        t += d
    return out


def run_dry_run(args: argparse.Namespace) -> int:
    print("=== MODO --dry-run: Validando montar_episodio.py ===", flush=True)
    sample_tts = normalize_tts_ptbr("Eu ia jogar That's Not My Neighbor e chamar o D.D.D. pro ID 3312 no PC!")
    assert "i-á" not in sample_tts and "Déts Nót Mái Nêibor" in sample_tts
    sample_ia = normalize_tts_ptbr("A IA analisou todas as IAs e deu views pro canal!")
    assert "i-á" in sample_ia and "i-ás" in sample_ia and "víus" in sample_ia
    print(f"normalize_tts_ptbr OK: {sample_ia}", flush=True)

    dummy_entries = [
        {"turno": 1, "t_video_sec": 2.0, "duracao_acoes_sec": 2.0, "fala_youtuber": "Olha esse suspeito!", "emocao": "yellow", "selo": "SUSPEITO"},
        {"turno": 2, "t_video_sec": 18.0, "duracao_acoes_sec": 2.5, "fala_youtuber": "Chama o D.D.D. agora!", "emocao": "red", "selo": "DOPPELGANGER"},
    ]
    segs, dur = build_cut_plan(dummy_entries, {0: 2.2, 1: 2.4})
    assert len(segs) == 2 and dur > 4.0
    print(f"build_cut_plan OK: {len(segs)} blocos ativos, {dur:.2f}s (cortou tempo morto!)", flush=True)

    mus_path, vol = resolve_music_spec(args.music)
    print(f"Musica '{args.music}': path={mus_path}, vol={vol}", flush=True)
    vis = load_visuals_v2(args.visuals_dir)
    print(f"visuals_v2 bridge: {'OK' if vis is not None else 'pendente (sera carregado quando visuals_v2.py existir)'}", flush=True)
    print("=== DRY-RUN CONCLUIDO ===", flush=True)
    return 0


def run_pipeline(args: argparse.Namespace) -> int:
    sess_dir = args.sessao_dir
    gameplay_mp4 = args.video or (sess_dir / "gameplay_real.mp4")
    log_path = sess_dir / "session_log.jsonl"
    if not gameplay_mp4.is_file():
        raise FileNotFoundError(f"Gameplay real MP4 nao encontrada: {gameplay_mp4}")

    vis = load_visuals_v2(args.visuals_dir)
    if vis is None:
        raise RuntimeError(
            "visuals_v2.py (com render_webcam_overlay_svg(..., transparent_bg=True)) nao encontrado. "
            "Passe --visuals-dir ou copie visuals_v2.py para ia_youtuber/."
        )

    entries = load_session_log(log_path)
    if not entries:
        raise ValueError("session_log.jsonl vazio!")

    work_dir = sess_dir / "work_post"
    overlay_dir = work_dir / "overlay_pngs"
    work_dir.mkdir(parents=True, exist_ok=True)
    overlay_dir.mkdir(parents=True, exist_ok=True)
    if args.etapa in ("parte", "final"):
        return run_partes_e_final(args, sess_dir, work_dir, overlay_dir, vis, 0, args.partes)

    # 1. Sintese ElevenLabs v4 + duracoes reais
    speech_wavs: dict[int, Path] = {}
    speech_durs: dict[int, float] = {}
    turnos_sel = [int(x) for x in args.turnos.split(",")] if args.turnos else None
    for idx, ev in enumerate(entries):
        fala = (ev.get("fala_youtuber") or "").strip()
        if turnos_sel is not None and int(ev.get("turno", -1)) not in turnos_sel:
            fala = ""
        if not fala:
            speech_durs[idx] = 0.8
            continue
        wp = tts_eleven_v4(fala, voice_id=args.voice_id, model_id=args.model_id, apis_txt=args.apis_txt)
        speech_wavs[idx] = wp
        speech_durs[idx] = wav_duration_sec(wp)

    # 2. Corte de tempos mortos
    if turnos_sel is not None:
        segments, total_dur = build_turn_plan(entries, turnos_sel, {i: d for i, d in speech_durs.items() if i in speech_wavs}, wav_duration_or_probe(gameplay_mp4))
    else:
        segments, total_dur = build_cut_plan(entries, speech_durs)
    cut_mp4 = work_dir / "gameplay_cortado.mp4"
    render_cut_gameplay(gameplay_mp4, segments, cut_mp4, args.width, args.height)

    # 3. Faixa de voz + SFX + RMS 30fps
    voice_flac = work_dir / "voice_sfx_master.flac"
    rms = build_voice_sfx_master(segments, speech_wavs, total_dur, work_dir, voice_flac)
    total_frames = len(rms)

    # 4. Plano dos quadros da webcam (salvo em frames.json para as 16 partes)
    all_evs = [ev for seg in segments for ev in seg.events]
    quadros = []
    blocos = {id(ev): caption_chunks(ev.get("fala_youtuber", ""), ev["t_cut_start"], ev["t_cut_end"]) for ev in all_evs}
    amp_s = 0.0
    for fi in range(total_frames):
        t = fi / FPS
        active_ev = None
        for ev in all_evs:
            if ev["t_cut_start"] <= t <= ev["t_cut_end"] + 0.35:
                active_ev = ev
                break
        # boca: so a voz, com subida rapida e descida curta; silencio = boca parada
        raw = rms[fi] if rms[fi] >= 0.05 else 0.0
        amp_s = raw if raw > amp_s else amp_s * 0.55 + raw * 0.45
        amp = round(min(1.0, amp_s * 1.25), 3) if amp_s >= 0.03 else 0.0
        emo, cap, stamp, stamp_p = "cyan", "", "", 0.0
        if active_ev:
            dt = t - active_ev["t_cut_start"]
            selo = (active_ev.get("selo") or "").strip()
            e = active_ev.get("emocao", "cyan")
            # expressao neutra na maior parte do tempo: a emocao so aparece no pico (selo ou panico/hype), por ~2 s
            if e != "cyan" and (selo or e in ("red", "green", "purple")) and 0.0 <= dt <= 2.0:
                emo = e
            for c0, c1, txt in blocos[id(active_ev)]:
                if c0 <= t < c1:
                    cap = txt
                    break
            if selo and 0.0 <= dt <= 2.8:
                stamp = selo
                stamp_p = min(1.0, dt / 0.18) if dt < 2.55 else max(0.0, (2.8 - dt) / 0.25)
        quadros.append([fi, round(t, 4), amp, emo, cap, stamp, round(stamp_p, 3), min(1.0, max(0.0, t / 0.6))])
    (work_dir / "frames.json").write_text(json.dumps({"total_dur": total_dur, "quadros": quadros}, ensure_ascii=False), encoding="utf-8")
    if args.etapa == "prep":
        print(f"PREP PRONTA: {total_frames} quadros, {total_dur:.2f}s", flush=True)
        return 0
    return run_partes_e_final(args, sess_dir, work_dir, overlay_dir, vis, 0, 1)


def render_parte(args: argparse.Namespace, work_dir: Path, overlay_dir: Path, vis: Any, k: int, n: int) -> Path:
    """Renderiza os quadros [k/n] da webcam e compoe sobre o mesmo trecho da gameplay (so video)."""
    plano = json.loads((work_dir / "frames.json").read_text(encoding="utf-8"))
    quadros = plano["quadros"]
    a = len(quadros) * k // n
    b = len(quadros) * (k + 1) // n
    vis_dir_str = str(Path(vis.__file__).resolve().parent)
    tasks = [(q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], overlay_dir / f"ov_{q[0]:05d}.png", vis_dir_str) for q in quadros[a:b]]
    workers = min(8, os.cpu_count() or 4)
    with ProcessPoolExecutor(max_workers=workers) as ex:
        list(ex.map(_render_overlay_frame, tasks, chunksize=8))
    out = work_dir / f"parte_{k:02d}.mp4"
    subprocess.run(
        [
            find_ffmpeg(), "-v", "error", "-y",
            "-i", str(work_dir / "gameplay_cortado.mp4"),
            "-framerate", str(FPS), "-start_number", str(a), "-i", str(overlay_dir / "ov_%05d.png"),
            "-filter_complex",
            f"[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[g];[g][1:v]overlay=0:0:shortest=1[vout]",
            "-map", "[vout]", "-frames:v", str(b - a),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", str(out),
        ],
        check=True,
    )
    print(f"PARTE {k + 1}/{n} PRONTA: quadros {a}..{b - 1}", flush=True)
    return out


def run_partes_e_final(args: argparse.Namespace, sess_dir: Path, work_dir: Path, overlay_dir: Path, vis: Any, k0: int, n: int) -> int:
    if args.etapa == "parte":
        render_parte(args, work_dir, overlay_dir, vis, args.parte, args.partes)
        return 0
    if args.etapa == "tudo":
        for k in range(n):
            render_parte(args, work_dir, overlay_dir, vis, k, n)
        n_partes = n
    else:
        n_partes = args.partes
    plano = json.loads((work_dir / "frames.json").read_text(encoding="utf-8"))
    total_dur = float(plano["total_dur"])
    lista = work_dir / "partes.txt"
    lista.write_text("".join(f"file 'parte_{i:02d}.mp4'\n" for i in range(n_partes)), encoding="utf-8")
    cut_mp4 = work_dir / "gameplay_overlay_completo.mp4"
    subprocess.run([find_ffmpeg(), "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(cut_mp4)], check=True)
    voice_flac = work_dir / "voice_sfx_master.flac"

    # 5. Composicao overlay + audio mix (sidechaincompress + loudnorm -14 LUFS)
    ff = find_ffmpeg()
    mus_path, mus_vol = resolve_music_spec(args.music)
    ep_sem_abertura = work_dir / "episodio_gameplay_overlay.mp4"

    if mus_path is not None:
        mus_args = ["-stream_loop", "-1", "-i", str(mus_path)]
        audio_fg = (
            f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo,asplit=2[voz][chave];"
            f"[2:a]aformat=sample_rates={SR}:channel_layouts=stereo,atrim=0:{total_dur:.3f},volume={mus_vol:.4f}[mus];"
            f"[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=350:makeup=1[md];"
            f"[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[aout]"
        )
    else:
        mus_args = []
        audio_fg = (
            f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo,"
            f"loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[aout]"
        )

    v_filter = "[0:v]null"
    if args.upscale_1080p:
        v_filter += ",scale=1920:1080:flags=lanczos,eq=contrast=1.06:saturation=1.18:gamma=0.98,unsharp=5:5:0.5,vignette=angle=0.42"
    v_filter += "[vout]"

    subprocess.run(
        [
            ff, "-v", "error", "-y",
            "-i", str(cut_mp4),
            "-i", str(voice_flac),
            *mus_args,
            "-filter_complex", f"{v_filter};{audio_fg}",
            "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
            "-shortest", "-movflags", "+faststart",
            str(ep_sem_abertura),
        ],
        check=True,
    )

    if args.pergunta_final:
        render_end_card(ep_sem_abertura, args, mus_path, mus_vol, work_dir)

    out_mp4 = args.out or (sess_dir / "episodio_final_youtube.mp4")
    if args.opening_mp4 and args.opening_mp4.is_file() and not args.skip_opening:
        out_w, out_h = (1920, 1080) if args.upscale_1080p else (args.width, args.height)
        subprocess.run(
            [
                ff, "-v", "error", "-y",
                "-i", str(args.opening_mp4),
                "-i", str(ep_sem_abertura),
                "-filter_complex",
                f"[0:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1[v0];"
                f"[1:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1[v1];"
                f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo[a0];"
                f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo[a1];"
                f"[v0][a0][v1][a1]concat=n=2:v=1:a=1[vo][ao]",
                "-map", "[vo]", "-map", "[ao]",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
                "-movflags", "+faststart",
                str(out_mp4),
            ],
            check=True,
        )
    else:
        ep_sem_abertura.replace(out_mp4)

    print(f"EPISODIO FINAL PRONTO: {out_mp4}", flush=True)
    return 0


def _end_card_svg(placar: str, pergunta: str) -> str:
    import html as _h
    linhas = []
    cur = ""
    for w in pergunta.split():
        if cur and len(cur) + 1 + len(w) > 30:
            linhas.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        linhas.append(cur)
    linhas = linhas[:3]
    y0 = 360 - (len(linhas) - 1) * 26
    txt = "".join(
        f'<text x="640" y="{y0 + i * 54}" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" '
        f'font-size="46" fill="#ffffff" stroke="#020617" stroke-width="7" paint-order="stroke">{_h.escape(l)}</text>'
        for i, l in enumerate(linhas)
    )
    placar_svg = (
        f'<rect x="290" y="150" width="700" height="62" rx="14" fill="#7f1d1d" stroke="#fecaca" stroke-width="3"/>'
        f'<text x="640" y="192" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="28" '
        f'fill="#ffffff" letter-spacing="1.5">{_h.escape(placar)}</text>'
    ) if placar else ""
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">'
        '<rect width="1280" height="720" fill="#020617" fill-opacity="0.55"/>'
        f'{placar_svg}{txt}'
        '<rect x="470" y="520" width="340" height="64" rx="32" fill="#00f0ff"/>'
        '<text x="640" y="562" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" font-size="28" fill="#020617">COMENTA AÍ</text>'
        '</svg>'
    )


def render_end_card(ep_mp4: Path, args: argparse.Namespace, mus_path: Path | None, mus_vol: float, work_dir: Path) -> None:
    """Fechamento: placar + pergunta pro publico sobre o ultimo quadro desfocado (5 s), anexado ao fim do episodio."""
    ff = find_ffmpeg()
    dur = 5.0
    card_png = work_dir / "fim_card.png"
    subprocess.run([find_rsvg(), "-w", "1280", "-h", "720", "-o", str(card_png)],
                   input=_end_card_svg(args.placar_final or "", args.pergunta_final).encode("utf-8"), check=True)
    last = work_dir / "fim_ultimo.png"
    subprocess.run([ff, "-v", "error", "-y", "-sseof", "-0.2", "-i", str(ep_mp4), "-frames:v", "1", "-update", "1", str(last)], check=True)
    w, h = (1920, 1080) if args.upscale_1080p else (args.width, args.height)
    aud_in = ["-stream_loop", "-1", "-i", str(mus_path)] if mus_path else ["-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo"]
    vol = min(1.0, mus_vol * 2.2) if mus_path else 1.0
    card = work_dir / "fim_card.mp4"
    subprocess.run([
        ff, "-v", "error", "-y", "-loop", "1", "-i", str(last), "-loop", "1", "-i", str(card_png), *aud_in,
        "-filter_complex",
        f"[0:v]scale={w}:{h},boxblur=18:2,fps={FPS}[bg];[1:v]scale={w}:{h},format=rgba,fade=in:st=0:d=0.35:alpha=1[c];"
        f"[bg][c]overlay,trim=0:{dur},setpts=PTS-STARTPTS,format=yuv420p[v];"
        f"[2:a]aformat=sample_rates={SR}:channel_layouts=stereo,volume={vol:.3f},atrim=0:{dur},afade=t=out:st={dur - 1.5}:d=1.5[a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-c:a", "aac", "-b:a", "192k",
        "-ar", str(SR), str(card),
    ], check=True)
    junto = work_dir / "episodio_com_fim.mp4"
    subprocess.run([
        ff, "-v", "error", "-y", "-i", str(ep_mp4), "-i", str(card), "-filter_complex",
        f"[0:v]fps={FPS},setsar=1[v0];[1:v]fps={FPS},setsar=1[v1];[0:a]aformat=sample_rates={SR}:channel_layouts=stereo[a0];"
        f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), str(junto),
    ], check=True)
    junto.replace(ep_mp4)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Pos-producao IA YouTuber (ElevenLabs v4 + visuals_v2 overlay + mix -14 LUFS)")
    ap.add_argument("--sessao-dir", type=Path, default=SCRIPT_DIR / "gravacoes", help="Diretorio da sessao com gameplay_real.mp4 e session_log.jsonl")
    ap.add_argument("--video", type=Path, default=None, help="Caminho explicito para gameplay_real.mp4")
    ap.add_argument("--out", type=Path, default=None, help="MP4 final de saida")
    ap.add_argument("--opening-mp4", type=Path, default=None, help="MP4 da abertura do Felipe para prepender")
    ap.add_argument("--etapa", choices=["tudo", "prep", "parte", "final"], default="tudo", help="tudo (local) ou prep -> parte (x N, em paralelo) -> final")
    ap.add_argument("--parte", type=int, default=0, help="Indice da parte (0..partes-1) com --etapa parte")
    ap.add_argument("--partes", type=int, default=16, help="Total de partes (padrao: 16)")
    ap.add_argument("--turnos", default=None, help="Turnos escolhidos, ex. 1,7,14 (so esses sao narrados; o jogo congela enquanto o YouTuber fala)")
    ap.add_argument("--skip-opening", action="store_true", help="Nao prepende abertura")
    ap.add_argument("--pergunta-final", default="", help="Pergunta pro publico no cartao final (vazio = sem cartao)")
    ap.add_argument("--placar-final", default="", help="Placar do cartao final (ex.: 3 SALVOS · 1 TRANCADO)")
    ap.add_argument("--music", default="investigations", help="ID da faixa em video/remotion/public/music/music.json")
    ap.add_argument("--voice-id", default=DEFAULT_ROBO_VOICE_ID, help="Voice ID do Robo no ElevenLabs")
    ap.add_argument("--model-id", default=ELEVEN_MODEL_V4, help="Modelo ElevenLabs (padrao: eleven_v4)")
    ap.add_argument("--width", type=int, default=1280, help="Largura base")
    ap.add_argument("--height", type=int, default=720, help="Altura base")
    ap.add_argument("--upscale-1080p", action="store_true", help="Aplica upscale Lanczos 1080p + color grading AGE")
    ap.add_argument("--visuals-dir", type=Path, default=None, help="Pasta contendo visuals_v2.py")
    ap.add_argument("--apis-txt", type=Path, default=DEFAULT_APIS_TXT, help="Caminho para apis.txt")
    ap.add_argument("--dry-run", action="store_true", help="Valida TTS PT-BR, corte, musica e visuals_v2 sem renderizar")
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.dry_run:
        return run_dry_run(args)
    return run_pipeline(args)


if __name__ == "__main__":
    raise SystemExit(main())
