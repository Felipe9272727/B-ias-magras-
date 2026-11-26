#!/usr/bin/env python3
"""Short vertical (1080x1920) de divulgacao do "Porteiro" (That's Not My Neighbor, 2 noites).

Roteiro proprio (nao e corte do longo): gancho com superlativo que volta no fim, um personagem (Opus), contador de
inocentes expulsos, selos e legenda grande sincronizada palavra a palavra (ElevenLabs Scribe, sem gastar credito).
Plantar e colher: "Na duvida, liga. Telefone salva a vida" -> "O telefone me enganou".

Uso: python3 ia_youtuber/short_porteiro.py <porteiro_2_noites.mp4> <scribe.json> <saida.mp4>
  scribe.json = transcricao (palavras com tempo) do audio do longo a partir do instante TEMPO_SCRIBE (em t do corte).
Tempos dos trechos em t do corte da noite 2 (p5); no video juntado t_junto = t + DESLOC.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

DESLOC = 358.8          # t do corte da noite 2 -> tempo no video juntado (v5)
TEMPO_SCRIBE = 110.0    # o audio transcrito comeca em t=110 do corte
W, H, FPS = 1080, 1920, 30
SFX = Path(__file__).resolve().parent.parent / "video" / "remotion" / "public" / "sfx"

TITULO_GANCHO = ["O PORTEIRO MAIS", "CONFIANTE DO MUNDO"]
# (ini, fim, titulo [2 linhas], inocentes_no_contador_ou_None, faixa_extra_ou_None, sfx_no_inicio_ou_None)
CLIPES = [
    (297.05, 301.40, TITULO_GANCHO, None, None, "record-scratch"),
    (251.30, 256.60, ["A REGRA DE", "OURO DELE"], 0, "NA DÚVIDA, LIGA", "notification-pop"),
    (113.60, 119.10, ["ELE LIGOU PRA", "CASA DO ALF"], 0, None, None),
    (123.00, 126.90, ["ELE LIGOU PRA", "CASA DO ALF"], 0, None, None),
    (134.00, 140.20, ["O DA JANELA", "ERA O ALF"], 1, "INOCENTE", "wrong-buzzer"),
    (233.50, 237.10, ["AGORA O", "ROBERTSKY"], 1, None, "whoosh"),
    (240.60, 242.70, ["AGORA O", "ROBERTSKY"], 2, "INOCENTE", "wrong-buzzer"),
    (319.40, 320.70, ["E FOI", "ACELERANDO"], 3, "INOCENTE", "error-beep"),
    (347.70, 349.10, ["E FOI", "ACELERANDO"], 4, "INOCENTE", "error-beep"),
    (405.40, 411.60, ["“EU SABIA!”", "(NÃO SABIA)"], 5, "INOCENTE", "wrong-buzzer"),
    (466.30, 473.30, ["MAIS UM", "PELO TELEFONE"], 6, "INOCENTE", "wrong-buzzer"),
    (493.30, 502.80, TITULO_GANCHO, 6, None, "sad-trombone"),
]
FIM_FAIXA = ["EXPULSOU 6 INOCENTES", "VÍDEO COMPLETO NO CANAL"]


def sh(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def png(svg: str, out: Path) -> Path:
    subprocess.run(["rsvg-convert", "-o", str(out)], input=svg.encode("utf-8"), check=True)
    return out


def svg_wrap(w: int, h: int, corpo: str) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{corpo}</svg>'


def svg_titulo(linhas: list[str]) -> str:
    out = []
    fs = min(92, int(1010 / (0.70 * max(len(l) for l in linhas))))
    for i, l in enumerate(linhas):
        cor = "#ffffff" if i == 0 else "#ffd400"
        y = 112 + i * 104
        out.append(f'<text x="540" y="{y}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="{fs}" '
                   f'fill="{cor}" stroke="#000" stroke-width="14" paint-order="stroke" stroke-linejoin="round">{esc(l)}</text>')
    return svg_wrap(W, 250, "".join(out))


def svg_contador(n: int) -> str:
    return svg_wrap(340, 370, (
        '<rect x="6" y="6" width="328" height="358" rx="28" fill="#120509" stroke="#ef4444" stroke-width="8"/>'
        '<text x="170" y="74" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="40" fill="#fca5a5">INOCENTES</text>'
        '<text x="170" y="120" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="40" fill="#fca5a5">EXPULSOS</text>'
        f'<text x="170" y="320" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="210" fill="#ffffff" '
        f'stroke="#ef4444" stroke-width="6" paint-order="stroke">{n}</text>'))


def svg_faixa(txt: str, cor: str = "#ef4444") -> str:
    largura = min(1040, 90 + 50 * len(txt))
    x0 = (W - largura) / 2
    return svg_wrap(W, 130, (
        f'<g transform="rotate(-3 540 65)"><rect x="{x0}" y="18" width="{largura}" height="96" rx="16" fill="{cor}" stroke="#fff" stroke-width="6"/>'
        f'<text x="540" y="90" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="64" fill="#fff">{esc(txt)}</text></g>'))


def svg_legenda(txt: str) -> str:
    return svg_wrap(W, 200, (
        f'<text x="540" y="120" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="{min(84, int(1010 / (0.70 * max(1, len(txt)))))}" fill="#ffffff" '
        f'stroke="#000" stroke-width="16" paint-order="stroke" stroke-linejoin="round">{esc(txt)}</text>'))


def legendas(words: list[dict], ini: float, fim: float, t0: float) -> list[tuple[float, float, str]]:
    """Palavras do trecho [ini, fim] (t do corte) em blocos de ate 3 palavras / 20 letras, no tempo do Short."""
    ws = [x for x in words if x.get("type") == "word" and ini - 0.05 <= x["start"] + TEMPO_SCRIBE < fim]
    blocos: list[list[dict]] = []
    for x in ws:
        if x["text"].startswith("["):
            continue
        if blocos and len(blocos[-1]) < 3 and len(" ".join(y["text"] for y in blocos[-1] + [x])) <= 20 \
                and x["start"] - blocos[-1][-1]["end"] < 0.45 and not blocos[-1][-1]["text"][-1:] in ".?!":
            blocos[-1].append(x)
        else:
            blocos.append([x])
    out = []
    for i, b in enumerate(blocos):
        a = b[0]["start"] + TEMPO_SCRIBE - ini + t0
        z = (blocos[i + 1][0]["start"] + TEMPO_SCRIBE - ini + t0) if i + 1 < len(blocos) else (fim - ini + t0)
        z = min(z, b[-1]["end"] + TEMPO_SCRIBE - ini + t0 + 0.6)
        out.append((round(a, 3), round(max(z, a + 0.25), 3), " ".join(y["text"] for y in b).upper()))
    return out


def main() -> int:
    longo, scribe, saida = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    words = json.loads(scribe.read_text(encoding="utf-8"))["words"]
    tmp = Path(tempfile.mkdtemp(prefix="short_porteiro_", dir=str(saida.parent)))

    # 1) base vertical de cada trecho: jogo grande no meio, webcam do Opus em cima a esquerda
    lista = []
    for k, (a, b, *_rest) in enumerate(CLIPES):
        d = b - a
        out = tmp / f"c{k:02d}.mp4"
        fg = (f"color=c=0x070b15:s={W}x{H}:r={FPS}:d={d:.3f}[bg];"
              f"[0:v]fps={FPS},split[a][b];[a]crop=1312:984:604:48,scale=1080:810[g];"
              f"[b]crop=564:316:28:28,scale=660:370[w];"
              f"[bg][g]overlay=0:650[t1];[t1][w]overlay=30:270,format=yuv420p[v];"
              f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.06,afade=t=out:st={d - 0.08:.3f}:d=0.08[au]")
        sh(["ffmpeg", "-v", "error", "-y", "-ss", f"{a + DESLOC:.3f}", "-t", f"{d:.3f}", "-i", str(longo),
            "-filter_complex", fg, "-map", "[v]", "-map", "[au]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17",
            "-c:a", "pcm_s16le", "-t", f"{d:.3f}", str(out)])
        lista.append(out)
    (tmp / "lista.txt").write_text("".join(f"file '{p.name}'\n" for p in lista), encoding="utf-8")
    base = tmp / "base.mkv"
    sh(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "lista.txt"), "-c", "copy", str(base)])

    # 2) camadas (titulo, contador, faixa, legendas) e efeitos sonoros no tempo do Short
    camadas: list[tuple[Path, int, int, float, float]] = []  # png, x, y, ini, fim
    sons: list[tuple[str, float, float]] = []
    t = 0.0
    cache: dict[str, Path] = {}

    def img(chave: str, svg: str) -> Path:
        if chave not in cache:
            cache[chave] = png(svg, tmp / f"i{len(cache):03d}.png")
        return cache[chave]

    ultimo_n = None
    for k, (a, b, titulo, n, faixa, sfx) in enumerate(CLIPES):
        d = b - a
        camadas.append((img("T" + "|".join(titulo), svg_titulo(titulo)), 0, 8, t, t + d))
        if n is not None:
            camadas.append((img(f"N{n}", svg_contador(n)), 712, 270, t, t + d))
            if ultimo_n is not None and n > ultimo_n:
                camadas.append((img("flash", svg_wrap(340, 370, '<rect x="0" y="0" width="340" height="370" rx="28" fill="#ffffff" fill-opacity="0.75"/>')),
                                712, 270, t, t + 0.12))
            ultimo_n = n
        if faixa:
            fx = f"{faixa} Nº {n}" if faixa == "INOCENTE" else faixa
            camadas.append((img("F" + fx, svg_faixa(fx, "#ef4444" if faixa == "INOCENTE" else "#0ea5e9")), 0, 1300, t + 0.1, t + min(d, 2.6)))
        if sfx:
            sons.append((sfx, t + 0.05, 0.55 if sfx != "sad-trombone" else 0.45))
        for la, lz, txt in legendas(words, a, b, t):
            camadas.append((img("L" + txt, svg_legenda(txt)), 0, 1455, la, lz))
        t += d
    total = t
    ultimo_ini = total - (CLIPES[-1][1] - CLIPES[-1][0])
    camadas.append((img("FIM0", svg_faixa(FIM_FAIXA[0], "#ef4444")), 0, 1300, ultimo_ini + 3.4, total))
    camadas.append((img("FIM1", svg_faixa(FIM_FAIXA[1], "#0ea5e9")), 0, 1620, ultimo_ini + 5.0, total))

    ins = ["-i", str(base)]
    fg = []
    cur = "0:v"
    for i, (p, x, y, a, z) in enumerate(camadas, start=1):
        ins += ["-i", str(p)]
        fg.append(f"[{cur}][{i}:v]overlay={x}:{y}:enable='between(t,{a:.3f},{z:.3f})'[v{i}]")
        cur = f"v{i}"
    na = len(camadas) + 1
    mix = ["[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0]"]
    for j, (nome, at, vol) in enumerate(sons):
        ins += ["-i", str(SFX / f"{nome}.mp3")]
        ms = int(at * 1000)
        mix.append(f"[{na + j}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:2.5,volume={vol},adelay={ms}|{ms}[s{j}]")
    mix.append("[a0]" + "".join(f"[s{j}]" for j in range(len(sons))) +
               f"amix=inputs={1 + len(sons)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false[aout]")
    sh(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(fg + mix), "-map", f"[{cur}]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{total:.3f}", "-movflags", "+faststart", str(saida)])
    print(f"Short pronto: {saida} ({total:.1f} s, {len(camadas)} camadas, {len(sons)} efeitos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
