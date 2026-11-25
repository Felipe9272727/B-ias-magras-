#!/usr/bin/env python3
"""Dublagem simples das falas citadas (entre aspas no começo da fala do Opus), sem gastar ElevenLabs:
o trecho citado ganha outra "voz" (vizinha: mais aguda; vizinho: mais grave; telefone; rádio do sistema).
O resto da fala continua a voz do Opus. Sem eco (eco é só para pensamento). Mantém o nome do mp3 (cache).
Uso: python3 ia_youtuber/dublar_vizinhos.py --ep ia_youtuber/episodios/p4 --modelo eleven_v4 --vozes '{"radio":[3,4],"fone":[17],"mulher":[24],"homem":[12]}'
"""
from __future__ import annotations
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import montar_episodio as m

EFEITO = {
    "mulher": "rubberband=pitch=1.22,equalizer=f=3000:t=q:w=1:g=2",
    "homem": "rubberband=pitch=0.80,equalizer=f=150:t=q:w=1:g=3",
    "fone": "highpass=f=500,lowpass=f=2600,acrusher=bits=8:mix=0.25,volume=1.3",
    "radio": "highpass=f=350,lowpass=f=3200,acrusher=bits=10:mix=0.3,volume=1.15",
}

def dur(p: Path) -> float:
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())

def ponto_de_corte(wav: Path, t_est: float) -> float:
    r = subprocess.run(["ffmpeg", "-i", str(wav), "-af", "silencedetect=noise=-32dB:d=0.07", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    meios = [(a + b) / 2 for a, b in zip(ini, fim) if a > 0.15]
    cand = [t for t in meios if 0.45 * t_est <= t <= 1.9 * t_est + 0.3]
    return min(cand, key=lambda t: abs(t - t_est)) if cand else t_est + 0.1

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ep", type=Path, required=True)
    ap.add_argument("--modelo", default=None)
    ap.add_argument("--vozes", required=True, help='JSON {"mulher":[turnos], "homem":[...], "fone":[...], "radio":[...]}')
    a = ap.parse_args()
    tipo = {int(t): k for k, ts in json.loads(a.vozes).items() for t in ts}
    bak = a.ep / "vozes_originais"; bak.mkdir(exist_ok=True)
    tmp = a.ep / "_dub"; tmp.mkdir(exist_ok=True)
    for ev in m.load_session_log(a.ep / "session_log.jsonl"):
        t = int(ev.get("turno", -1)); f = (ev.get("fala_youtuber") or "").strip()
        if t not in tipo or not f.startswith("'"):
            continue
        q = f.find("'", 1)
        if q < 2:
            continue
        wav = m.tts_eleven_v4(f, model_id=a.modelo, emocao=ev.get("emocao"), piada=bool(ev.get("piada")))
        mp3 = a.ep / "vozes" / (wav.stem + ".mp3")
        if not mp3.is_file():
            print("sem mp3", t); continue
        orig = bak / mp3.name
        if not orig.is_file():
            shutil.copy(mp3, orig)  # sempre dubla a partir do original
        src = tmp / "src.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(orig), "-ar", "44100", "-ac", "1", str(src)], check=True)
        d = dur(src)
        ft = re.sub(r"\[[a-z ]+\]\s*", "", m.normalize_tts_ptbr(f))  # texto falado de verdade (numeros por extenso)
        qt = ft.find("'", 1)
        t_est = d * ((qt if qt > 1 else q) + 1) / len(ft if qt > 1 else f)
        cut = ponto_de_corte(src, t_est)
        fg = (f"[0:a]atrim=0:{cut:.3f},asetpts=PTS-STARTPTS,{EFEITO[tipo[t]]},afade=t=out:st={max(0, cut - 0.04):.3f}:d=0.04[a];"
              f"[0:a]atrim={cut:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03[b];[a][b]concat=n=2:v=0:a=1[o]")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", fg, "-map", "[o]",
                        "-ar", "44100", "-b:a", "128k", str(mp3)], check=True)
        cache_mp3 = wav.with_suffix(".mp3")
        shutil.copy(mp3, cache_mp3); wav.unlink(missing_ok=True)
        print(f"turno {t:3d} {tipo[t]:6s} corte {cut:.2f}s de {d:.2f}s (estimado {t_est:.2f})  {f[:q + 1]}")
    shutil.rmtree(tmp, ignore_errors=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
