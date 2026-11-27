#!/usr/bin/env python3
"""Encurta citações longas (> 15 s) na timeline_aoh2.json, cortando o áudio numa pausa entre frases.

Roda DEPOIS do build_timeline_aoh2.py. O texto que fica é um trecho literal do log (começo ou fim da citação).
Cria um mp3 novo por corte (aoh2/voz/<orig>_c.mp3), atualiza fala/áudio e puxa para trás tudo o que vem depois
na cena (falas, vozes, selos, sfx, memes), encurtando a cena e recalculando os starts.

Uso: python3 aoh2/encurtar_citas.py
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TL = REPO / "video" / "youtube" / "aoh2" / "timeline_aoh2.json"
PUB = REPO / "video" / "remotion" / "public"

# (cena, ia, modo, marcador): "prefixo" mantém até o fim do marcador; "sufixo" mantém a partir do marcador.
CORTES = [
    ("B3", "Qwen", "prefixo", "o que a torna presa fácil."),
    ("B7", "Sonnet", "sufixo", "A Venezuela tem so Antioquia"),
    ("D4", "Hydrogen", "sufixo", "Vou oferecer paz a Bolivia"),
    ("D12", "Ember", "prefixo", "retomar Cordoba, Noroeste e Patagonia Norte"),
]


def dur(p: Path) -> float:
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], text=True))


def pausas(p: Path) -> list[tuple[float, float]]:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "silencedetect=n=-32dB:d=0.10", "-f", "null", "-"],
                       capture_output=True, text=True)
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(ini, fim))


def main() -> None:
    tl = json.loads(TL.read_text(encoding="utf-8"))
    fps = tl["fps"]
    for cid, ia, modo, marca in CORTES:
        sc = next(c for c in tl["cenas"] if c["id"] == cid)
        f = next(x for x in sc["falas"] if x["kind"] == "cita" and x["ia"] == ia)
        texto = f["texto"]
        if f.get("cortado"):
            continue
        i = texto.find(marca)
        assert i >= 0, (cid, marca)
        src = PUB / f["src"]
        total = dur(src)
        voz_total = total - 0.35  # o build põe 0.35 s de apad no fim
        if modo == "prefixo":
            corte_txt = i + len(marca)
            est = voz_total * corte_txt / len(texto)
            novo_txt = texto[:corte_txt].rstrip(" ,;")
        else:
            est = voz_total * i / len(texto)
            novo_txt = texto[i:]
        cand = [p for p in pausas(src) if abs((p[0] + p[1]) / 2 - est) < 1.6]
        if cand:
            p = min(cand, key=lambda p: abs((p[0] + p[1]) / 2 - est))
            t_corte = p[0] + 0.06 if modo == "prefixo" else max(0.0, p[1] - 0.04)
        else:
            t_corte = est
        out = src.with_name(src.stem + "_c.mp3")
        if modo == "prefixo":
            af = f"atrim=0:{t_corte:.3f},afade=t=out:st={max(0, t_corte - 0.25):.3f}:d=0.25,apad=pad_dur=0.45"
        else:
            af = f"atrim=start={t_corte:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.05"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, "-b:a", "128k", str(out)], check=True)
        novo_dur = round(dur(out) * fps)
        delta = f["dur"] - novo_dur
        at0 = f["at"]
        rel = str(out.relative_to(PUB))
        for a in sc["audio"]:
            if a["src"] == f["src"] and a["at"] == at0:
                a["src"], a["dur"] = rel, novo_dur
        f["src"], f["dur"], f["texto"], f["cortado"] = rel, novo_dur, novo_txt, modo
        for lista in ("falas", "audio", "selos", "sfx", "memes"):
            for x in sc.get(lista, []):
                if x is not f and x.get("at", 0) > at0:
                    x["at"] = max(at0 + novo_dur, x["at"] - delta)
        sc["dur"] -= delta
        print(f"{cid} {ia}: {modo} em {t_corte:.2f}s (estimado {est:.2f}s) -> -{delta / fps:.1f}s | {novo_txt[:70]}")
    cur = 0
    for c in tl["cenas"]:
        c["start"] = cur
        cur += c["dur"]
    tl["total_frames"] = cur
    tl["duration_sec"] = round(cur / fps, 2)
    TL.write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"timeline: {cur / fps:.1f}s")


if __name__ == "__main__":
    main()
