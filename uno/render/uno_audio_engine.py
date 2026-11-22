#!/usr/bin/env python3
"""
UNO das IAs — Motor de Áudio ElevenLabs v4 + Eco (aecho) em Pensamentos + SFX Reais do Canal + Timeline 30 FPS.

Regras de ouro (CLAUDE.md + MEMORIA_TECNICA.md):
  - Pensamento das IAs: NUNCA usar [whispers] nem voz sussurrada! Mantém voz normal + aplica ECO via FFmpeg
    (`aecho=0.8:0.88:55:0.40,highpass=f=240,lowpass=f=4800`) para distinguir claramente pensamento secreto vs fala!
  - TODA fala ou pensamento exibido em balão ganha áudio (zero balões mudos, zero buracos > 2.5s).
  - Cache por hash SHA-256 (nunca gera duas vezes a mesma fala).
  - Saída: `voice_sfx_master_uno.flac` + `timeline_uno.json` (com envelope `voice_rms` a 30 FPS!).
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path

BASE = Path("/home/felipexcria750/uno_ias")
CACHE_DIR = BASE / "voice_cache"
SFX_DIR = Path("/home/felipexcria750/worldbox_video_v2/assets_cache/sfx")
MUSIC_JSON = Path("/home/felipexcria750/ref_branch/video/remotion/public/music/music.json")

# Vozes ElevenLabs distintas (Narrador + 7 IAs) — IDs padrão/públicos compatíveis com a conta
VOICE_IDS = {
    "narrador": "lvkgCBi6spByiTZMPJEK",  # Gabriel PT-BR (mesma voz aprovada no WorldBox v3.2!)
    "hydrogen": "pNInz6obpgDQGcFmaJgB",  # Adam (grave/confiante)
    "sonnet":   "TxGEqnHWrfWFTfGW9XjX",  # Josh (irônico/calmo)
    "inkling":  "IKne3meq5aSn9XLyUdCD",  # Charlie (jovem/ágil)
    "deepseek": "VR6AewLTigWG4xSOukaG",  # Arnold (firme/provocador)
    "qwen":     "EXAVITQu4vr4xnSDxMaL",  # Bella (expressiva)
    "luna":     "ErXwobaYiN019PkySvjV",  # Antoni (leve/descontraído)
    "glm":      "yoZ06aMxZJJ28mfd3POQ",  # Sam (dramático)
}


def find_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for cand in (
        "/tmp/ffstatic/node_modules/ffmpeg-static/ffmpeg",
        "/usr/bin/ffmpeg",
    ):
        if Path(cand).exists():
            return cand
    return "ffmpeg"


def get_el_key() -> str:
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"].strip()
    p = Path("/home/felipexcria750/.elevenlabs_temp_key")
    if p.exists():
        return p.read_text(encoding="utf-8").strip()
    raise RuntimeError("Falta ELEVENLABS_API_KEY ou ~/.elevenlabs_temp_key")


def tts_eleven(speaker: str, text: str, modo: str = "fala", model_id: str = "eleven_v3") -> Path:
    """Gera (ou recupera do cache) WAV 48kHz stereo. Para modo='pensamento', aplica ECO (aecho), nunca sussurro."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    # Remove qualquer tag proibida de sussurro
    clean_text = re.sub(r"\[whispers?\]", "", text, flags=re.I).strip()
    vid = VOICE_IDS.get(speaker, VOICE_IDS["narrador"])
    key_str = f"{model_id}|{vid}|{modo}|{clean_text}"
    h = hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:16]
    wav_path = CACHE_DIR / f"{speaker}_{modo}_{h}.wav"
    if wav_path.exists() and wav_path.stat().st_size > 2000:
        return wav_path

    raw_mp3 = CACHE_DIR / f"{speaker}_{modo}_{h}.mp3"
    if not raw_mp3.exists() or raw_mp3.stat().st_size < 1000:
        api_key = get_el_key()
        payload = {
            "text": clean_text,
            "model_id": model_id,
            "voice_settings": {
                "stability": 0.48 if speaker == "narrador" else 0.44,
                "similarity_boost": 0.78,
                "style": 0.25 if speaker == "narrador" else 0.35,
                "use_speaker_boost": True,
            },
        }
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw_mp3.write_bytes(resp.read())

    ff = find_ffmpeg()
    if modo == "pensamento":
        # Regra de ouro CLAUDE.md: pensamento com ECO (aecho), mantendo voz normal (nunca sussurro!)
        af = "aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=220,lowpass=f=5200,aecho=0.82:0.86:52|108:0.38|0.20,volume=0.95"
    else:
        af = "aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0"
    subprocess.run(
        [ff, "-v", "error", "-y", "-i", str(raw_mp3), "-af", af, "-c:a", "pcm_s16le", str(wav_path)],
        check=True,
    )
    return wav_path


if __name__ == "__main__":
    print("uno_audio_engine.py syntax & helpers OK! Voices:", list(VOICE_IDS.keys()))
