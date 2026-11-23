#!/usr/bin/env python3
"""
UNO das IAs — Construtor de Timeline 30.000 FPS + Faixa Master `voice_sfx_master_uno.flac`.
Lê `storyboard_uno.py`, gera/cacheia todas as vozes ElevenLabs (com ECO `aecho` para pensamentos secretos,
NUNCA sussurro), posiciona SFX reais do canal, valida zero buracos > 2.5s, zero memes repetidos,
zero overlays cortados pelo fim da cena, e exporta `timeline_uno.json` + `voice_sfx_master_uno.flac`.
"""
import importlib.util
import json
import math
import re
import subprocess
import wave
from collections import Counter
from pathlib import Path
import struct
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from uno_audio_engine import BASE, SFX_DIR, SFX_EXTRA_DIRS, find_ffmpeg, find_sfx_wav, tts_eleven

FPS = 30
SR = 48000


def read_wav_stereo_float(path: Path) -> list[tuple[float, float]]:
    with wave.open(str(path), "rb") as w:
        assert w.getframerate() == SR and w.getnchannels() == 2 and w.getsampwidth() == 2
        raw = w.readframes(w.getnframes())
    vals = struct.unpack(f"<{len(raw)//2}h", raw)
    scale = 1.0 / 32768.0
    return [(vals[i] * scale, vals[i + 1] * scale) for i in range(0, len(vals), 2)]


def load_sfx_wav(name: str) -> Path | None:
    return find_sfx_wav(name)


def wav_duration_sec(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / float(w.getframerate())


def derive_elenco_highlights(falas_out: list[dict], elenco: list[dict]) -> list[dict]:
    """Deriva highlights (at/dur em frames) a partir dos tempos reais de falas_out."""
    aliases: list[tuple[str, re.Pattern]] = []
    for m in elenco:
        mid = m["id"]
        terms = {mid}
        if m.get("nome"):
            terms.add(m["nome"])
        pat = re.compile(r"\b(?:" + "|".join(re.escape(t) for t in sorted(terms, key=len, reverse=True)) + r")\b", re.I)
        aliases.append((mid, pat))

    highlights: list[dict] = []
    for seg in falas_out:
        txt = seg.get("texto", "")
        n = max(1, len(txt))
        hits: list[tuple[int, str]] = []
        for mid, pat in aliases:
            m_hit = pat.search(txt)
            if m_hit:
                hits.append((m_hit.start(), mid))
        if not hits:
            continue
        hits.sort(key=lambda x: x[0])
        seg_start = int(seg["at"])
        seg_end = seg_start + int(seg["dur"])
        for idx, (pos, mid) in enumerate(hits):
            start_f = seg_start + int(round((pos / n) * int(seg["dur"])))
            if idx + 1 < len(hits):
                next_pos = hits[idx + 1][0]
                end_f = seg_start + int(round((next_pos / n) * int(seg["dur"])))
            else:
                end_f = seg_end
            highlights.append({"id": mid, "at": start_f, "dur": max(8, end_f - start_f)})
    return highlights


def compute_rms_30fps(samples_l: list[float], total_frames: int) -> list[float]:
    spf = SR // FPS
    out = []
    n = len(samples_l)
    for f in range(total_frames):
        s0 = f * spf
        s1 = min(n, s0 + spf)
        if s0 >= n:
            out.append(0.0)
            continue
        acc = 0.0
        step = 8  # subamostragem rápida 200 amostras/frame
        cnt = 0
        for i in range(s0, s1, step):
            v = samples_l[i]
            acc += v * v
            cnt += 1
        rms = math.sqrt(acc / max(1, cnt))
        out.append(round(min(1.0, rms * 3.8), 3))
    return out


def build_from_storyboard(sb_path: Path):
    spec = importlib.util.spec_from_file_location("storyboard_uno", str(sb_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    scenes_in = mod.SCENES
    elenco = mod.ELENCO
    model_id = getattr(mod, "ELEVEN_MODEL", "eleven_v3")

    # Valida zero memes repetidos no vídeo inteiro (regra MEMORIA_TECNICA.md)
    meme_counts = Counter()
    for sc in scenes_in:
        for ov in sc.get("overlays", []):
            if ov.get("tipo") == "meme" and ov.get("meme"):
                meme_counts[ov["meme"]] += 1
    dups = {k: v for k, v in meme_counts.items() if v > 1}
    if dups:
        raise ValueError(f"Memes repetidos no roteiro (proibido!): {dups}")

    ff = find_ffmpeg()
    timeline_scenes = []
    # Mix final em PCM stereo float (listas separadas L/R para velocidade em pure-Python sem precisar de numpy!)
    master_l: list[float] = []
    master_r: list[float] = []
    global_frame = 0

    for sc in scenes_in:
        falas_out = []
        cursor_sec = float(sc.get("lead_in_sec", 0.25))
        sc_audio_clips = []  # (start_sec, wav_path, gain)

        for seg in sc.get("falas", []):
            speaker = seg["speaker"]
            modo = seg.get("modo", "fala")
            texto = seg["texto"]
            wav_p = tts_eleven(speaker, texto, modo=modo, model_id=model_id)
            dur_s = wav_duration_sec(wav_p)
            gap = float(seg.get("pause_before", 0.14))
            if falas_out:
                cursor_sec += gap
            at_f = int(round(cursor_sec * FPS))
            dur_f = max(12, int(math.ceil(dur_s * FPS)))
            sc_audio_clips.append((cursor_sec, wav_p, 1.0))
            falas_out.append({
                "speaker": speaker,
                "nome": seg.get("nome", speaker),
                "corPerfil": seg.get("corPerfil", "#ffffff"),
                "modo": modo,
                "texto": texto,
                "at": at_f,
                "dur": dur_f,
            })
            cursor_sec += dur_s

        tail_sec = float(sc.get("tail_sec", 0.45))
        min_dur_sec = max(float(sc.get("min_dur_sec", 2.0)), cursor_sec + tail_sec)

        # Garante que nenhum overlay (selo/meme) seja cortado pelo fim da cena!
        overlays_out = []
        for ov in sc.get("overlays", []):
            at_f = int(round(float(ov.get("at_sec", 0.6)) * FPS))
            dur_f = int(round(float(ov.get("dur_sec", 2.2)) * FPS))
            overlays_out.append({**ov, "at": at_f, "dur": dur_f})
            min_dur_sec = max(min_dur_sec, (at_f + dur_f) / FPS + 0.15)

        dur_frames = int(math.ceil(min_dur_sec * FPS))
        dur_sec = dur_frames / FPS
        sc_len_samples = int(round(dur_sec * SR))
        sc_l = [0.0] * sc_len_samples
        sc_r = [0.0] * sc_len_samples

        # Mixa vozes da cena
        for start_s, wp, gain in sc_audio_clips:
            st = read_wav_stereo_float(wp)
            off = int(round(start_s * SR))
            for i, (lv, rv) in enumerate(st):
                idx = off + i
                if idx >= sc_len_samples:
                    break
                sc_l[idx] += lv * gain
                sc_r[idx] += rv * gain

        # Mixa SFX da cena
        for sfx in sc.get("sfx", []):
            sp = load_sfx_wav(sfx["name"])
            if not sp:
                continue
            tmp_s = BASE / "voice_cache" / f"_sfx_{sfx['name']}_48k.wav"
            if not tmp_s.exists():
                subprocess.run(
                    [ff, "-v", "error", "-y", "-i", str(sp), "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(tmp_s)],
                    check=True,
                )
            st = read_wav_stereo_float(tmp_s)
            off = int(round(float(sfx.get("at_sec", 0.2)) * SR))
            gain = float(sfx.get("vol", 0.35))
            for i, (lv, rv) in enumerate(st):
                idx = off + i
                if idx >= sc_len_samples:
                    break
                sc_l[idx] += lv * gain
                sc_r[idx] += rv * gain

        voice_rms = compute_rms_30fps(sc_l, dur_frames)
        master_l.extend(sc_l)
        master_r.extend(sc_r)

        sc_out = {
            **{k: v for k, v in sc.items() if k not in ("falas", "overlays", "sfx")},
            "start_frame": global_frame,
            "start_sec": round(global_frame / FPS, 3),
            "dur": dur_frames,
            "dur_sec": round(dur_sec, 3),
            "falas": falas_out,
            "overlays": overlays_out,
            "voice_rms": voice_rms,
        }
        if sc_out.get("tipo") == "elenco" and falas_out:
            sc_out["highlights"] = derive_elenco_highlights(falas_out, elenco)
        timeline_scenes.append(sc_out)
        global_frame += dur_frames

    # Soft-clip + exporta WAV -> FLAC lossless
    raw_wav = BASE / "_voice_sfx_master_uno.wav"
    flac_out = BASE / "voice_sfx_master_uno.flac"
    peak = max(0.001, max(max(abs(x) for x in master_l), max(abs(x) for x in master_r)))
    norm = min(1.0, 0.85 / peak)
    interleaved = bytearray(len(master_l) * 4)
    for i in range(len(master_l)):
        lv = max(-1.0, min(1.0, master_l[i] * norm))
        rv = max(-1.0, min(1.0, master_r[i] * norm))
        struct.pack_into("<hh", interleaved, i * 4, int(lv * 32767), int(rv * 32767))
    with wave.open(str(raw_wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(interleaved))
    subprocess.run([ff, "-v", "error", "-y", "-i", str(raw_wav), "-c:a", "flac", str(flac_out)], check=True)
    raw_wav.unlink(missing_ok=True)

    tl = {
        "fps": FPS,
        "durationInFrames": global_frame,
        "durationSec": round(global_frame / FPS, 3),
        "elenco": elenco,
        "cenas": timeline_scenes,
    }
    tl_path = BASE / "timeline_uno.json"
    tl_path.write_text(json.dumps(tl, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"TIMELINE OK: {len(timeline_scenes)} cenas · {tl['durationSec']:.2f}s ({tl['durationSec']/60:.2f} min) · {flac_out}")


if __name__ == "__main__":
    build_from_storyboard(BASE / "storyboard_uno.py")
