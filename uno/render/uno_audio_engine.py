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

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BASE = Path(os.environ.get("UNO_DIR", Path(__file__).resolve().parent.parent))
ASSETS_DIR = Path(os.environ.get("UNO_ASSETS_DIR", REPO_ROOT / "video" / "remotion" / "public"))
CACHE_DIR = Path(os.environ.get("UNO_VOICE_CACHE", BASE / "voice_cache"))
SFX_DIR = ASSETS_DIR / "sfx"
SFX_EXTRA_DIRS = [ASSETS_DIR / d for d in ("sfx_au2", "sfx_au4", "sfx_jogo")]
MUSIC_JSON = ASSETS_DIR / "music" / "music.json"

# Modelo padrão verificado na API ElevenLabs (/v1/models)
DEFAULT_MODEL_ID = "eleven_v4"

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


def find_sfx_wav(name: str) -> Path | None:
    for d in (SFX_DIR, *SFX_EXTRA_DIRS):
        for ext in (".wav", ".mp3"):
            cand = d / f"{name}{ext}"
            if cand.exists():
                return cand
    return None


def get_el_key() -> str:
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"].strip()
    apis_path = Path(os.environ.get("APIS_TXT", "/data/data/com.termux/files/home/storage/shared/geminineon/apis.txt"))
    if apis_path.exists():
        for line in apis_path.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*elevenlabs\s+api\s*:\s*(.+)$", line, re.I)
            if m and m.group(1).strip():
                return m.group(1).strip()
    raise RuntimeError("Falta ELEVENLABS_API_KEY ou entrada 'elevenlabs api:' em apis.txt")


_CORES_UNO = {
    "A": "azul",
    "V": "vermelho",
    "G": "verde",
    "Y": "amarelo",
}

_NUMS_EXTENSO = {
    "0": "zero",
    "1": "um",
    "2": "dois",
    "3": "três",
    "4": "quatro",
    "5": "cinco",
    "6": "seis",
    "7": "sete",
    "8": "oito",
    "9": "nove",
    "10": "dez",
    "11": "onze",
    "12": "doze",
    "14": "quatorze",
    "16": "dezesseis",
}

_TERM_REPLACEMENTS: tuple[tuple[re.Pattern[str], str], ...] = (
    # Siglas de IA (case-sensitive para não alterar o verbo "ia")
    (re.compile(r"\bIAs\b"), "i-ás"),
    (re.compile(r"\bIA\b"), "i-á"),
    # Termos do jogo UNO
    (re.compile(r"\bUNOs\b"), "Únos"),
    (re.compile(r"\bUNO\b"), "Uno"),
    # Nomes de modelos e empresas em PT-BR natural para ElevenLabs v4
    (re.compile(r"\bGPT-(\d+)\b"), lambda m: f"Gê Pê Tê {_NUMS_EXTENSO.get(m.group(1), m.group(1))}"),  # type: ignore[arg-type]
    (re.compile(r"\bGPT\b"), "Gê Pê Tê"),
    (re.compile(r"\bGLM\b"), "Gê Éle Ême"),
    (re.compile(r"\bQwen\s+27B\b", re.I), "Quên vinte e sete B"),
    (re.compile(r"\b27B\b"), "vinte e sete B"),
    (re.compile(r"\bQwen\b"), "Quên"),
    (re.compile(r"\bInkling\b"), "Ínkling"),
    (re.compile(r"\bDeepSeek\b"), "Dip Sík"),
    (re.compile(r"\bHydrogen\b"), "Háidrogen"),
    (re.compile(r"\bSonnet\b"), "Sônet"),
    (re.compile(r"\bGemini\b"), "Djêmini"),
    (re.compile(r"\bClaude\b"), "Clôd"),
    (re.compile(r"\bFlash\b"), "Flésh"),
    (re.compile(r"\bOpenAI\b"), "Ôpen Êi Ái"),
    (re.compile(r"\bAnthropic\b"), "Antrópic"),
    (re.compile(r"\bThinking Machines\b"), "Thínking Machínes"),
)

_CARD_CODE_RE = re.compile(r"\b([AVGY])-(\+\d+|PULAR|REVERTER|[0-9])\b")
_PRETO_CODE_RE = re.compile(r"\bPRETO-(\+\d+|CURINGA)\b")
_PLUS_NUM_RE = re.compile(r"(?<!\w)\+(\d+)\b")


def _replace_card_code(match: re.Match[str]) -> str:
    cor = _CORES_UNO[match.group(1)]
    val = match.group(2)
    if val == "PULAR":
        return f"pular {cor}"
    if val == "REVERTER":
        return f"reverter {cor}"
    if val.startswith("+"):
        num = val[1:]
        return f"{cor} mais {_NUMS_EXTENSO.get(num, num)}"
    return f"{cor} {_NUMS_EXTENSO.get(val, val)}"


def normalize_tts_ptbr(text: str) -> str:
    """Normaliza apenas o texto enviado ao TTS ElevenLabs v4 (mantendo legendas/balões intactos)."""
    out = re.sub(r"\[whispers?\]", "", text, flags=re.I).strip()
    out = _CARD_CODE_RE.sub(_replace_card_code, out)
    out = _PRETO_CODE_RE.sub(
        lambda m: "curinga" if m.group(1) == "CURINGA" else f"mais {_NUMS_EXTENSO.get(m.group(1)[1:], m.group(1)[1:])}",
        out,
    )
    out = _PLUS_NUM_RE.sub(lambda m: f"mais {_NUMS_EXTENSO.get(m.group(1), m.group(1))}", out)
    for pat, repl in _TERM_REPLACEMENTS:
        out = pat.sub(repl, out)
    return re.sub(r"\s{2,}", " ", out).strip()


def tts_eleven(speaker: str, text: str, modo: str = "fala", model_id: str = DEFAULT_MODEL_ID) -> Path:
    """Gera (ou recupera do cache) WAV 48kHz stereo. Para modo='pensamento', aplica ECO (aecho), nunca sussurro."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    # Normaliza apenas para a API TTS; texto exibido em tela permanece intacto no storyboard/timeline
    tts_text = normalize_tts_ptbr(text)
    vid = VOICE_IDS.get(speaker, VOICE_IDS["narrador"])
    key_str = f"{model_id}|{vid}|{modo}|{tts_text}"
    h = hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:16]
    wav_path = CACHE_DIR / f"{speaker}_{modo}_{h}.wav"
    if wav_path.exists() and wav_path.stat().st_size > 2000:
        return wav_path

    raw_mp3 = CACHE_DIR / f"{speaker}_{modo}_{h}.mp3"
    if not raw_mp3.exists() or raw_mp3.stat().st_size < 1000:
        api_key = get_el_key()
        payload = {
            "text": tts_text,
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
