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
# v4 turbo: mesma familia do v4 (entende [laughs], [shouting]...) e custa ~0,2 credito por caractere (o v4 custa 1)
ELEVEN_MODEL_PADRAO = "eleven_v4_turbo"
RESERVA_CREDITOS = 400  # nunca deixa a conta do ElevenLabs abaixo disso
_GASTO: dict[str, Any] = {"saldo": None, "n": 0}


def creditos_restantes(apis_txt: Path = DEFAULT_APIS_TXT) -> int | None:
    key = get_elevenlabs_key(apis_txt)
    if not key:
        return None
    try:
        req = urllib.request.Request("https://api.elevenlabs.io/v1/history?page_size=1", headers={"xi-api-key": key})
        h = (json.load(urllib.request.urlopen(req, timeout=30)).get("history") or [{}])[0]
        req2 = urllib.request.Request("https://api.elevenlabs.io/v1/user/subscription", headers={"xi-api-key": key})
        sub = json.load(urllib.request.urlopen(req2, timeout=30))
        usados = max(int(sub.get("character_count") or 0), int(h.get("character_count_change_to") or 0))
        return int(sub.get("character_limit") or 0) - usados
    except Exception:
        return None
# Voz do Opus (25/11): "Gabriel - Casual" da Voice Library (PT-BR nativo, jovem, verificada no eleven_v4).
# A antiga era a Charlie (premade em ingles, sotaque australiano), que o Felipe achou "de narrador, parece IA"
# e lia "AI MEU DEUS" como "A.I.". Para re-renderizar episodios antigos com a voz velha: --voice-id IKne3meq5aSn9XLyUdCD.
DEFAULT_ROBO_VOICE_ID = "BECjFqjKpX1jVslC0trK"  # Gabriel - Casual (voz de "amigo contando historia")
VOZ_ANTIGA_CHARLIE = "IKne3meq5aSn9XLyUdCD"
# Config por modelo. eleven_v4 ignora style/speaker_boost; stability baixa = mais expressiva; speed 1.1 = ritmo de YouTuber.
# eleven_v3 so aceita stability 0.0 / 0.5 / 1.0.
ROBO_VOICE_SETTINGS: dict[str, dict[str, Any]] = {
    "eleven_v4": {"stability": 0.25, "similarity_boost": 0.78, "speed": 1.1},
    "eleven_v4_turbo": {"stability": 0.25, "similarity_boost": 0.78, "speed": 1.1},
    "eleven_v3": {"stability": 0.5, "similarity_boost": 0.78},
    "eleven_multilingual_v2": {"stability": 0.3, "similarity_boost": 0.78, "style": 0.45,
                               "use_speaker_boost": True, "speed": 1.1},
}
# Modelos que entendem tags de audio ([laughs], [shouting]...): conferido no v4 e no v3 (a tag nao e lida em voz alta).
MODELOS_COM_TAGS = ("eleven_v3", "eleven_v3_conversational", "eleven_v4", "eleven_v4_turbo")
PRONUNCIA_JSON = SCRIPT_DIR / "pronuncia_ptbr.json"
FPS = 30
SR = 48000


def _carregar_pronuncia(path: Path = PRONUNCIA_JSON) -> tuple[list[tuple[re.Pattern[str], str]], set[str]]:
    """Le o dicionario de pronuncia (so para o TTS). Ver ia_youtuber/pronuncia_ptbr.json."""
    regras: list[tuple[re.Pattern[str], str]] = []
    telefones: set[str] = set()
    if path.is_file():
        data = json.loads(path.read_text(encoding="utf-8"))
        for r in data.get("substituicoes", []):
            flags = re.I if "i" in str(r.get("flags", "")) else 0
            regras.append((re.compile(r["padrao"], flags), r["tts"]))
        telefones = {str(t) for t in data.get("telefones", [])}
    return regras, telefones


_TERM_TTS_REPLACEMENTS, _TELEFONES_TTS = _carregar_pronuncia()

_UNID = ("zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove")
_DEZ_A_DEZENOVE = ("dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove")
_DEZENAS = ("", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa")
_CENTENAS = ("", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos",
             "oitocentos", "novecentos")


def por_extenso(n: int) -> str:
    """0..9999 por extenso em PT-BR (1955 -> 'mil novecentos e cinquenta e cinco')."""
    if n < 10:
        return _UNID[n]
    if n < 20:
        return _DEZ_A_DEZENOVE[n - 10]
    if n < 100:
        d, u = divmod(n, 10)
        return _DEZENAS[d] + (f" e {_UNID[u]}" if u else "")
    if n < 1000:
        if n == 100:
            return "cem"
        c, r = divmod(n, 100)
        return _CENTENAS[c] + (f" e {por_extenso(r)}" if r else "")
    m, r = divmod(n, 1000)
    mil = "mil" if m == 1 else f"{por_extenso(m)} mil"
    if not r:
        return mil
    return f"{mil} e {por_extenso(r)}" if (r < 100 or r % 100 == 0) else f"{mil} {por_extenso(r)}"


def _digitos(s: str) -> str:
    return " ".join(_UNID[int(c)] for c in s)


def _numeros_tts(text: str) -> str:
    # telefones do jogo e "player9914": digito por digito
    out = re.sub(r"\bplayer(\d+)\b", lambda m: "player " + _digitos(m.group(1)), text, flags=re.I)
    for tel in _TELEFONES_TTS:
        out = re.sub(rf"(?<![\d.,]){re.escape(tel)}(?![\d.,]\d)", _digitos(tel), out)
    # apartamento "2-02" -> "dois zero dois"
    out = re.sub(r"\b(\d)-(\d{2})\b", lambda m: _digitos(m.group(1) + m.group(2)), out)
    # sequencias longas (numero de documento) -> digito por digito
    out = re.sub(r"(?<![\d.,])\d{5,}(?![\d.,]\d)", lambda m: _digitos(m.group(0)), out)
    # anos 1000-2099 -> por extenso
    out = re.sub(r"(?<![\d.,])(1\d{3}|20\d{2})(?![\d.,]\d)", lambda m: por_extenso(int(m.group(1))), out)
    return out


# ---- Tags de emocao (eleven_v3 / eleven_v4) -------------------------------------------------------------
# So acrescenta tags entre colchetes com base na pontuacao/emocao do turno: nunca inventa palavra.
# Risada escrita (kkk, haha, rsrs) vira [laughs]. NUNCA [whispers] (regra do canal: pensamento = eco).
_SIGLAS_MAIUSC = {"QUESTION", "DDD", "ID", "IDS", "IA", "IAS", "PC", "OK", "TV", "SOS"}
_RE_RISADA = re.compile(r"\b(?:k{3,}|(?:ha){2,}h?|(?:he){2,}|(?:rs){2,})\b", re.I)
_RE_GRITO = re.compile(r"\bA{2,}H*\b|\bAI MEU DEUS\b|\bSOCORRO\b|\bMEU DEUS\b")
_TAG_EMOCAO = {"red": "[scared]", "purple": "[surprised]", "yellow": "[curious]", "green": "[excited]"}


def _tem_maiuscula_de_grito(s: str) -> bool:
    for w in re.findall(r"[A-ZÀ-Ý]{3,}", s):
        if w not in _SIGLAS_MAIUSC:
            return True
    return False


def adicionar_tags_emocao(text: str, emocao: str | None = None, piada: bool = False, max_tags: int = 3) -> str:
    """Acrescenta tags de audio ao texto do TTS (nao muda a legenda).

    - risada escrita (kkk/haha/rsrs) -> [laughs]
    - frase com grito ("AAAH", "AI MEU DEUS", palavra em CAIXA ALTA) -> [shouting] antes dela
    - primeira frase sem grito recebe a emocao do turno (red=[scared], purple=[surprised], yellow=[curious],
      green=[excited] so se tiver '!'); a frase logo depois de um grito de red/purple tambem
    - "Ufa" -> [sighs]; frase que comeca com "Mentira" ou turno marcado como piada -> [laughs] antes da ultima frase
    """
    text = re.sub(r"\[\s*whisper(?:s|ing)?\s*\]", "", text or "", flags=re.I)
    text = _RE_RISADA.sub("[laughs]", text)
    frases = re.split(r"(?<=[.!?…])\s+", text.strip())
    n_tags = len(re.findall(r"\[[a-z ]+\]", text))
    emo = (emocao or "").lower()
    out: list[str] = []

    def _e_grito(i: int, fr: str) -> bool:
        return bool(_RE_GRITO.search(fr)) or (_tem_maiuscula_de_grito(fr) and ("!" in fr or i == 0 or len(fr.split()) <= 3))

    # se o grito vem no meio da fala (ex.: "Dois a zero! E o proximo... NAO."), a emocao vai depois do grito
    grito_no_meio = any(_e_grito(i, fr) for i, fr in enumerate(frases) if i > 0) and not _e_grito(0, frases[0])
    grito_antes = False
    for i, fr in enumerate(frases):
        tag = ""
        if fr.startswith("["):
            pass
        elif _e_grito(i, fr):
            tag = "[shouting]"
        elif re.match(r"(?i)ufa\b", fr):
            tag = "[sighs]"
        elif re.match(r"(?i)mentira\b", fr) or (piada and i == len(frases) - 1 and i > 0):
            tag = "[laughs]"
        elif ((i == 0 and not grito_no_meio) or grito_antes) and emo in _TAG_EMOCAO:
            if emo != "green" or "!" in fr:
                if not (grito_antes and emo in ("yellow", "green")):
                    tag = _TAG_EMOCAO[emo]
        grito_antes = tag == "[shouting]"
        if tag and n_tags < max_tags:
            fr = f"{tag} {fr}"
            n_tags += 1
        out.append(fr)
    return " ".join(out)

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
    """Normaliza apenas o texto enviado ao TTS ElevenLabs (mantendo legendas intactas).

    Dicionario de pronuncia em ia_youtuber/pronuncia_ptbr.json + numeros (anos por extenso, telefones do jogo,
    apartamentos e numeros de documento digito por digito).
    """
    out = re.sub(r"\[\s*whisper(?:s|ing)?\s*\]", "", text or "", flags=re.I).strip()
    for pat, repl in _TERM_TTS_REPLACEMENTS:
        out = pat.sub(repl, out)
    out = _numeros_tts(out)
    return re.sub(r"\s{2,}", " ", out).strip()


def tts_eleven_v4(
    text: str,
    voice_id: str = DEFAULT_ROBO_VOICE_ID,
    model_id: str | None = None,
    cache_dir: Path = DEFAULT_VOICE_CACHE,
    apis_txt: Path = DEFAULT_APIS_TXT,
    emocao: str | None = None,
    piada: bool = False,
    tags: bool = True,
) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    model_id = model_id or ELEVEN_MODEL_PADRAO
    if tags and model_id in MODELOS_COM_TAGS:
        text = adicionar_tags_emocao(text, emocao, piada)
    tts_text = normalize_tts_ptbr(text)
    h = hashlib.sha256(f"{model_id}|{voice_id}|{tts_text}".encode("utf-8")).hexdigest()[:16]
    wav_path = cache_dir / f"robo_{h}.wav"
    if wav_path.is_file() and wav_path.stat().st_size > 2000:
        return wav_path

    raw_mp3 = cache_dir / f"robo_{h}.mp3"
    if not raw_mp3.is_file() or raw_mp3.stat().st_size < 1000:
        key = get_elevenlabs_key(apis_txt)
        if not key:
            raise RuntimeError(f"Falta ELEVENLABS_API_KEY (voz fora do cache: {raw_mp3.name} | {model_id} | {voice_id} | {tts_text!r})")
        # trava de gasto: confere o saldo de verdade a cada ~40 falas novas e para antes de passar da reserva
        _GASTO["n"] += 1
        if _GASTO["saldo"] is None or _GASTO["n"] % 40 == 1:
            _GASTO["saldo"] = creditos_restantes(apis_txt)
        fator = 0.25 if model_id in ("eleven_v4_turbo", "eleven_flash_v2_5", "eleven_turbo_v2_5", "eleven_v3_conversational") else 1.0
        custo = int(len(tts_text) * fator) + 1
        if _GASTO["saldo"] is not None:
            if _GASTO["saldo"] - custo < RESERVA_CREDITOS:
                raise RuntimeError(f"Saldo do ElevenLabs acabando ({_GASTO['saldo']} creditos): parei para nao passar da reserva")
            _GASTO["saldo"] -= custo
        payload = {
            "text": tts_text,
            "model_id": model_id,
            "language_code": "pt",
            "voice_settings": dict(ROBO_VOICE_SETTINGS.get(model_id, ROBO_VOICE_SETTINGS["eleven_v4"])),
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
    freeze_end: float = 0.0  # congela o ultimo quadro (gancho: segura o susto na tela enquanto o grito toca)


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
    congelar: dict[int, float] | None = None,
) -> tuple[list[CutSegment], float]:
    """Um segmento por turno escolhido: congela o print enquanto o YouTuber fala e depois roda as acoes do turno."""
    segments: list[CutSegment] = []
    dst = 0.0
    pos = {int(ev.get("turno", -1)): i for i, ev in enumerate(entries)}
    for tn in turnos:
        if tn not in pos:
            continue
        idx = pos[tn]
        ev = entries[idx]
        t0 = float(ev.get("t_video_sec", 0.0))
        t1 = float(entries[idx + 1]["t_video_sec"]) if idx + 1 < len(entries) else min(video_dur, t0 + 4.0)
        t1 = max(t1, t0 + 1.0)
        fala = float(speech_durations.get(idx, 0.0))
        acao = t1 - t0
        freeze = max(0.35, fala + 0.35 - acao) if fala > 0 else 0.0
        if fala > 0 and congelar and tn in congelar:
            # turno em que a fala comenta o print: segura a tela parada (com deriva) por essa fracao da fala
            freeze = max(freeze, fala * float(congelar[tn]))
        mapped = {**ev, "_idx": idx, "_speech_dur": fala, "t_cut_start": round(dst + 0.15, 3), "t_cut_end": round(dst + 0.15 + fala, 3)}
        segments.append(CutSegment(src_start=round(t0, 3), src_end=round(t1, 3), dst_start=round(dst, 3), events=[mapped], freeze_sec=round(freeze, 3)))
        dst += freeze + (t1 - t0)
    return segments, round(dst, 3)


def build_linear_plan(
    entries: list[dict[str, Any]],
    speech_durations: dict[int, float],
    video_dur: float,
    cortes: list[list[float]],
    teaser: list[float] | None,
) -> tuple[list[CutSegment], float]:
    """Gameplay corrida (tempo real): so tira os trechos de `cortes`; cada fala entra no instante real do turno.
    `teaser` (opcional) e um trecho repetido no comeco, antes da abertura."""
    cs = sorted((max(0.0, float(a)), min(video_dur, float(b))) for a, b in (cortes or []) if float(b) > float(a))
    keep: list[tuple[float, float]] = []
    cur = 0.0
    for a, b in cs:
        if a > cur:
            keep.append((cur, a))
        cur = max(cur, b)
    if cur < video_dur:
        keep.append((cur, video_dur))
    ranges = ([(float(teaser[0]), float(teaser[1]))] if teaser else []) + keep
    congela_fim = float(teaser[2]) if teaser and len(teaser) > 2 else 0.0
    segments: list[CutSegment] = []
    dst = 0.0
    for ri, (a, b) in enumerate(ranges):
        fe = congela_fim if (teaser and ri == 0) else 0.0
        segments.append(CutSegment(src_start=round(a, 3), src_end=round(b, 3), dst_start=round(dst, 3), events=[], freeze_sec=0.0, freeze_end=round(fe, 3)))
        dst += b - a + fe
    prev_end = -1.0
    max_atraso = 0.0
    for si, seg in enumerate(segments):
        seg_end_dst = seg.dst_start + (seg.src_end - seg.src_start) + seg.freeze_end
        so_teaser = [i for i, e in enumerate(entries) if e.get("_so_teaser")]
        for idx, ev in enumerate(entries):
            dur = speech_durations.get(idx)
            if not dur:
                continue
            if teaser and si == 0 and so_teaser and idx not in so_teaser:
                continue  # o gancho usa a fala curta propria
            if ev.get("_so_teaser") and not (teaser and si == 0):
                continue
            t = float(ev.get("t_video_sec", 0.0))
            if not (seg.src_start <= t < seg.src_end):
                continue
            ideal = seg.dst_start + (t - seg.src_start) + 0.2
            start = max(ideal, prev_end + 0.15)
            if teaser and si == 0 and start + dur > seg_end_dst:
                continue  # fala que nao cabe no gancho fica so na hora certa
            max_atraso = max(max_atraso, start - ideal)
            seg.events.append({**ev, "_idx": idx, "_speech_dur": dur, "t_cut_start": round(start, 3), "t_cut_end": round(start + dur, 3)})
            prev_end = start + dur
        if teaser and si == 0:
            prev_end = seg_end_dst
    print(f"Plano linear: {len(ranges)} trechos, {dst:.1f}s, maior atraso de fala {max_atraso:.1f}s", flush=True)
    return segments, round(dst, 3)


def render_game_audio(gameplay_mp4: Path, segments: list[CutSegment], out_m4a: Path) -> bool:
    """Som do proprio jogo nos mesmos trechos do video (normalizado baixinho, pra ficar de fundo)."""
    ff = find_ffmpeg()
    probe = subprocess.run([ff, "-v", "error", "-i", str(gameplay_mp4), "-map", "0:a:0", "-t", "0.1", "-f", "null", "-"], capture_output=True)
    if probe.returncode != 0:
        print("Gameplay sem audio do jogo", flush=True)
        return False
    parts = [
        f"[0:a]atrim=start={sg.src_start:.3f}:end={sg.src_end:.3f},asetpts=PTS-STARTPTS,"
        f"aformat=sample_rates={SR}:channel_layouts=stereo,apad=whole_dur={sg.src_end - sg.src_start + sg.freeze_end:.3f},"
        f"atrim=0:{sg.src_end - sg.src_start + sg.freeze_end:.3f}[a{i}]"
        for i, sg in enumerate(segments)
    ]
    parts.append("".join(f"[a{i}]" for i in range(len(segments))) + f"concat=n={len(segments)}:v=0:a=1,aformat=sample_rates={SR}:channel_layouts=stereo,loudnorm=I=-24:TP=-3[aout]")
    subprocess.run([ff, "-v", "error", "-y", "-i", str(gameplay_mp4), "-filter_complex", ";".join(parts), "-map", "[aout]",
                    "-c:a", "aac", "-b:a", "192k", str(out_m4a)], check=True)
    return True


def write_duck_envelopes(events: list[dict[str, Any]], total_dur: float, work_dir: Path) -> None:
    """Curvas de volume (100 Hz): a trilha abaixa forte e o som do jogo abaixa um pouco enquanto o narrador fala."""
    rate = 100
    n = int(math.ceil(total_dur * rate)) + 1
    fala = [0.0] * n
    for ev in events:
        a = int(max(0.0, ev["t_cut_start"] - 0.15) * rate)
        b = int(min(total_dur, ev["t_cut_end"] + 0.25) * rate)
        for i in range(a, min(n, b + 1)):
            fala[i] = 1.0
    # rampas: desce em 0.15 s, sobe em 0.6 s
    s = [0.0] * n
    v = 0.0
    for i in range(n):
        alvo = fala[i]
        v = min(alvo, v + 1.0 / (0.15 * rate)) if alvo > v else max(alvo, v - 1.0 / (0.6 * rate))
        s[i] = v
    # jogo: -10 dB embaixo da fala (voz clara) e volume cheio quando o Opus cala
    for nome, prof in (("duck_musica.wav", 0.78), ("duck_jogo.wav", 0.7)):
        buf = bytearray(n * 4)
        for i in range(n):
            g = int((1.0 - prof * s[i]) * 32767)
            struct.pack_into("<hh", buf, i * 4, g, g)
        with wave.open(str(work_dir / nome), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(bytes(buf))


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


def build_music_bed(trilha: list[Any], total_dur: float, out_wav: Path) -> bool:
    """Trilha com varias musicas intercaladas: trilha = [[inicio_seg, id], ...] (tempo do episodio sem a abertura).
    Cada faixa entra no seu volume sugerido, com fade de 2 s e cruzamento de 2 s com a proxima."""
    blocos = sorted([(float(a), str(b)) for a, b in trilha if float(a) < total_dur])
    if not blocos:
        return False
    ff = find_ffmpeg()
    ins: list[str] = []
    fg: list[str] = []
    k = 0
    for i, (t0, mid) in enumerate(blocos):
        path, vol = resolve_music_spec(mid)
        if path is None:
            print(f"AVISO: musica '{mid}' nao encontrada, pulando", flush=True)
            continue
        t1 = blocos[i + 1][0] if i + 1 < len(blocos) else total_dur
        ini = max(0.0, t0 - (1.0 if i else 0.0))
        dur = (t1 + (1.0 if i + 1 < len(blocos) else 0.0)) - ini
        ins += ["-stream_loop", "-1", "-i", str(path)]
        fg.append(f"[{k}:a]aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=stereo,atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,"
                  f"volume={vol:.4f},afade=t=in:st=0:d={2.0 if i else 0.5},afade=t=out:st={max(0.0, dur - 2.0):.3f}:d=2,"
                  f"adelay={int(ini * 1000)}|{int(ini * 1000)}[m{k}]")
        k += 1
    if not k:
        return False
    fg.append("".join(f"[m{j}]" for j in range(k)) + f"amix=inputs={k}:normalize=0:duration=longest,apad,atrim=0:{total_dur:.3f}[out]")
    subprocess.run([ff, "-v", "error", "-y", *ins, "-filter_complex", ";".join(fg), "-map", "[out]", "-c:a", "pcm_s16le", str(out_wav)], check=True)
    print(f"Trilha intercalada: {k} musicas", flush=True)
    return True


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
    inputs: list[str] = []
    for i, seg in enumerate(segments):
        # uma entrada por trecho (busca direta): o ffmpeg nao precisa guardar o video inteiro na memoria
        inputs += ["-ss", f"{seg.src_start:.3f}", "-t", f"{seg.src_end - seg.src_start:.3f}", "-i", str(gameplay_mp4)]
        parts.append(
            f"[{i}:v]setpts=PTS-STARTPTS,fps={FPS},{STAGE_CROP},scale=1920:1440:flags=lanczos"
            + (f",tpad=start_duration={seg.freeze_sec:.3f}:start_mode=clone" if seg.freeze_sec > 0 else "")
            + (f",tpad=stop_duration={seg.freeze_end:.3f}:stop_mode=clone" if seg.freeze_end > 0 else "")
            + _drift(i, (seg.src_end - seg.src_start) + seg.freeze_sec + seg.freeze_end)
            + f"[v{i}]"
        )
        concat_inputs += f"[v{i}]"
    parts.append(f"{concat_inputs}concat=n={len(segments)}:v=1:a=0,split[ca][cb]")
    parts.append(f"[ca]scale={width}:{height},boxblur=24:2,eq=brightness=-0.22:saturation=0.55[bg]")
    parts.append(f"[bg][cb]overlay={width - STAGE_W}:0,setsar=1[vout]")
    subprocess.run(
        [
            ff, "-v", "error", "-y", *inputs,
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
    sem_sfx: bool = False,
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
            if emo in EMOTION_SFX and not sem_sfx:
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
    sample_num = normalize_tts_ptbr("Em 1955 liguei pro 3312, apto 2-02, doc 456985512369, player9914.")
    assert "mil novecentos e cinquenta e cinco" in sample_num and "três três um dois" in sample_num
    assert "dois zero dois" in sample_num and "player nove nove um quatro" in sample_num
    sample_tag = adicionar_tags_emocao("AI MEU DEUS. A boca dela tá costurada. kkk", "red")
    assert sample_tag.startswith("[shouting]") and "[scared]" in sample_tag and "[laughs]" in sample_tag
    assert "whisper" not in adicionar_tags_emocao("[whispers] oi", "red")
    print(f"tags OK: {normalize_tts_ptbr(sample_tag)}", flush=True)

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
    congelar: dict[int, float] = {}
    mj = sess_dir / "montar.json"
    cfg = json.loads(mj.read_text(encoding="utf-8")) if mj.is_file() else {}
    congelar = {int(k): float(v) for k, v in (cfg.get("congelar") or {}).items()}
    linear = cfg.get("modo") == "linear"
    if cfg.get("modelo_voz"):
        args.model_id = str(cfg["modelo_voz"])  # o modelo com que as vozes do cache foram geradas
    mudos = {int(x) for x in (cfg.get("mudos") or [])}
    selos_cfg = {int(k): str(v) for k, v in (cfg.get("selos") or {}).items()}
    for ev in entries:
        if int(ev.get("turno", -1)) in selos_cfg:
            ev["selo"] = selos_cfg[int(ev["turno"])]  # selo editorial (fato conferido no log)
    tz_cfg = cfg.get("teaser_trecho")
    if linear and tz_cfg and cfg.get("teaser_fala"):
        entries.append({"turno": int(cfg.get("teaser_turno", 0)), "t_video_sec": float(tz_cfg[0]) + float(cfg.get("teaser_fala_em", 0.3)),
                        "fala_youtuber": str(cfg["teaser_fala"]), "selo": cfg.get("teaser_selo", ""), "emocao": "red", "_so_teaser": True})
    for idx, ev in enumerate(entries):
        fala = (ev.get("fala_youtuber") or "").strip()
        if turnos_sel is not None and int(ev.get("turno", -1)) not in turnos_sel:
            fala = ""
        if int(ev.get("turno", -1)) in mudos:
            fala = ""
        if not fala:
            speech_durs[idx] = 0.8
            continue
        wp = tts_eleven_v4(fala, voice_id=args.voice_id, model_id=args.model_id, apis_txt=args.apis_txt,
                           emocao=ev.get("emocao"), piada=bool(ev.get("piada")), tags=not getattr(args, "sem_tags", False))
        speech_wavs[idx] = wp
        speech_durs[idx] = wav_duration_sec(wp)

    # 2. Corte de tempos mortos
    if linear:
        segments, total_dur = build_linear_plan(entries, {i: d for i, d in speech_durs.items() if i in speech_wavs},
                                                wav_duration_or_probe(gameplay_mp4), cfg.get("cortes") or [], cfg.get("teaser_trecho"))
    elif turnos_sel is not None:
        segments, total_dur = build_turn_plan(entries, turnos_sel, {i: d for i, d in speech_durs.items() if i in speech_wavs}, wav_duration_or_probe(gameplay_mp4), congelar)
    else:
        segments, total_dur = build_cut_plan(entries, speech_durs)
    cut_mp4 = work_dir / "gameplay_cortado.mp4"
    render_cut_gameplay(gameplay_mp4, segments, cut_mp4, args.width, args.height)

    # 3. Faixa de voz + SFX + RMS 30fps
    voice_flac = work_dir / "voice_sfx_master.flac"
    rms = build_voice_sfx_master(segments, speech_wavs, total_dur, work_dir, voice_flac, sem_sfx=linear)
    total_frames = len(rms)
    if linear:
        render_game_audio(gameplay_mp4, segments, work_dir / "jogo.m4a")
        write_duck_envelopes([ev for sg in segments for ev in sg.events], total_dur, work_dir)

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
            if selo and 0.0 <= dt <= 3.5:
                stamp = selo
                stamp_p = min(1.0, dt / 0.18) if dt < 3.25 else max(0.0, (3.5 - dt) / 0.25)
        quadros.append([fi, round(t, 4), amp, emo, cap, stamp, round(stamp_p, 3), min(1.0, max(0.0, t / 0.6))])
    (work_dir / "frames.json").write_text(json.dumps({"total_dur": total_dur, "fim_seg1": (segments[1].dst_start if len(segments) > 1 else total_dur), "quadros": quadros}, ensure_ascii=False), encoding="utf-8")
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

    jogo = work_dir / "jogo.m4a"
    mjf = sess_dir / "montar.json"
    trilha = (json.loads(mjf.read_text(encoding="utf-8")).get("trilha") if mjf.is_file() else None) or []
    bed = work_dir / "trilha_intercalada.wav"
    if trilha and build_music_bed(trilha, total_dur, bed):
        mus_path, mus_vol = bed, 1.0
    if mus_path is not None and jogo.is_file() and (work_dir / "duck_musica.wav").is_file():
        mg = float(getattr(args, "musica_ganho", 0.45))
        mus_args = ["-stream_loop", "-1", "-i", str(mus_path), "-i", str(jogo),
                    "-i", str(work_dir / "duck_musica.wav"), "-i", str(work_dir / "duck_jogo.wav")]
        st = f"aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=stereo"
        audio_fg = (
            f"[1:a]{st}[voz];"
            f"[2:a]{st},atrim=0:{total_dur:.3f},volume={mus_vol * mg:.4f}[m0];"
            f"[4:a]aresample={SR},{st},apad,atrim=0:{total_dur:.3f}[em];[m0][em]amultiply[mus];"
            f"[3:a]{st},apad,atrim=0:{total_dur:.3f},volume=0.9[g0];"
            f"[5:a]aresample={SR},{st},apad,atrim=0:{total_dur:.3f}[eg];[g0][eg]amultiply[jg];"
            f"[voz][mus][jg]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[aout]"
        )
    elif jogo.is_file() and (work_dir / "duck_jogo.wav").is_file():
        print("AVISO: trilha nao encontrada; mixando voz + som do jogo", flush=True)
        mus_args = ["-i", str(jogo), "-i", str(work_dir / "duck_jogo.wav")]
        st = f"aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=stereo"
        audio_fg = (
            f"[1:a]{st}[voz];"
            f"[2:a]{st},apad,atrim=0:{total_dur:.3f},volume=0.9[g0];"
            f"[3:a]aresample={SR},{st},apad,atrim=0:{total_dur:.3f}[eg];[g0][eg]amultiply[jg];"
            f"[voz][jg]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[aout]"
        )
    elif mus_path is not None:
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
    tz = float(plano.get("fim_seg1", 0.0)) if args.teaser else 0.0
    if args.opening_mp4 and args.opening_mp4.is_file() and not args.skip_opening:
        out_w, out_h = (1920, 1080) if args.upscale_1080p else (args.width, args.height)
        subprocess.run(
            [
                ff, "-v", "error", "-y",
                "-i", str(args.opening_mp4),
                "-i", str(ep_sem_abertura),
                "-filter_complex",
                (
                    f"[0:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1[v0];"
                    f"[1:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1,split[vt0][v1a];"
                    f"[vt0]trim=0:{tz:.3f},setpts=PTS-STARTPTS[vt];[v1a]trim={tz:.3f},setpts=PTS-STARTPTS[v1];"
                    f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo[a0];"
                    f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo,asplit[at0][a1a];"
                    f"[at0]atrim=0:{tz:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.0, tz - 0.4):.3f}:d=0.4[at];"
                    f"[a1a]atrim={tz:.3f},asetpts=PTS-STARTPTS[a1];"
                    f"[vt][at][v0][a0][v1][a1]concat=n=3:v=1:a=1[vo][ao]"
                ) if tz > 0 else (
                    f"[0:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1[v0];"
                    f"[1:v]scale={out_w}:{out_h}:flags=lanczos,fps={FPS},setsar=1[v1];"
                    f"[0:a]aformat=sample_rates={SR}:channel_layouts=stereo[a0];"
                    f"[1:a]aformat=sample_rates={SR}:channel_layouts=stereo[a1];"
                    f"[v0][a0][v1][a1]concat=n=2:v=1:a=1[vo][ao]"
                ),
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
    ap.add_argument("--musica-ganho", type=float, default=0.45, help="Multiplica o volume sugerido da trilha (modo linear)")
    ap.add_argument("--teaser", action="store_true", help="O 1o turno escolhido vira o gancho antes da abertura")
    ap.add_argument("--pergunta-final", default="", help="Pergunta pro publico no cartao final (vazio = sem cartao)")
    ap.add_argument("--placar-final", default="", help="Placar do cartao final (ex.: 3 SALVOS · 1 TRANCADO)")
    ap.add_argument("--music", default="investigations", help="ID da faixa em video/remotion/public/music/music.json")
    ap.add_argument("--voice-id", default=DEFAULT_ROBO_VOICE_ID, help="Voice ID do Robo no ElevenLabs")
    ap.add_argument("--model-id", default=ELEVEN_MODEL_PADRAO, help="Modelo ElevenLabs (padrao: eleven_v4_turbo)")
    ap.add_argument("--sem-tags", action="store_true",
                    help="Nao acrescentar tags de emocao ([shouting], [laughs]...) no texto do TTS")
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
