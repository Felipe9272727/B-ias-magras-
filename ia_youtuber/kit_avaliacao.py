#!/usr/bin/env python3
"""Kit para o avaliador (subagente Sonnet) dar nota 0-10 ao episodio comparando com a colinha dos YouTubers.

Gera, a partir do MP4 final e da pasta do episodio:
  - folhas de quadros (3x3, um quadro a cada N s, com o tempo escrito) -> folha_XX.jpg
  - transcricao das falas do Opus com o tempo no video final -> transcricao.txt
  - medicoes de audio a cada 30 s (volume medio e pico do video final) -> audio.txt
Uso: python3 ia_youtuber/kit_avaliacao.py --video final.mp4 --ep ia_youtuber/episodios/p4 --out pasta
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


def dur(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", type=Path, required=True)
    ap.add_argument("--ep", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--passo", type=float, default=12.0, help="segundos entre quadros")
    a = ap.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    total = dur(a.video)

    # folhas de quadros com o tempo escrito (1 quadro por busca rapida, montagem 3x3 com PIL)
    from PIL import Image, ImageDraw
    tmp = a.out / "_q.jpg"
    quadros = []
    t = 0.0
    while t < total - 0.5:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(a.video), "-frames:v", "1",
                        "-vf", "scale=480:270", str(tmp)], check=False)
        if tmp.is_file():
            im = Image.open(tmp).convert("RGB")
            d = ImageDraw.Draw(im)
            rot = f"{int(t // 60):02d}:{int(t % 60):02d}"
            d.rectangle([0, 0, 70, 22], fill=(0, 0, 0))
            d.text((6, 5), rot, fill=(255, 230, 0))
            quadros.append(im)
        t += a.passo
    for k in range(0, len(quadros), 9):
        folha = Image.new("RGB", (1440, 810), (0, 0, 0))
        for j, im in enumerate(quadros[k:k + 9]):
            folha.paste(im, ((j % 3) * 480, (j // 3) * 270))
        folha.save(a.out / f"folha_{k // 9:02d}.jpg", quality=82)
    tmp.unlink(missing_ok=True)

    # transcricao: falas na ordem do plano (frames.json tem a legenda de cada quadro do trecho de gameplay)
    fj = a.ep / "work_post" / "frames.json"
    linhas = []
    if fj.is_file():
        plano = json.loads(fj.read_text(encoding="utf-8"))
        tz = float(plano.get("fim_seg1", 0.0))
        abertura = a.ep / "abertura.mp4"
        off = dur(abertura) if abertura.is_file() else 0.0
        ult = ""
        for q in plano["quadros"]:
            t, cap = float(q[1]), str(q[4] or "")
            if cap and cap != ult:
                tf = t if t < tz else t + off
                linhas.append(f"[{int(tf // 60):02d}:{tf % 60:04.1f}] {cap}" + (f"   (SELO: {q[5]})" if q[5] else ""))
            ult = cap
    (a.out / "transcricao.txt").write_text("\n".join(linhas) + "\n", encoding="utf-8")

    # audio a cada 30 s
    med = []
    t = 0.0
    while t < total:
        r = subprocess.run(["ffmpeg", "-v", "info", "-ss", f"{t:.1f}", "-t", "30", "-i", str(a.video), "-vn", "-af", "volumedetect",
                            "-f", "null", "-"], capture_output=True, text=True)
        mv = re.search(r"mean_volume: ([-\d.]+)", r.stderr)
        mx = re.search(r"max_volume: ([-\d.]+)", r.stderr)
        med.append(f"{int(t // 60):02d}:{int(t % 60):02d}  medio {mv.group(1) if mv else '?'} dB  pico {mx.group(1) if mx else '?'} dB")
        t += 30
    (a.out / "audio.txt").write_text("\n".join(med) + "\n", encoding="utf-8")
    print(f"kit pronto em {a.out}: {len(list(a.out.glob('folha_*.jpg')))} folhas, {len(linhas)} falas, duracao {total:.0f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
