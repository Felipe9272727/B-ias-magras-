"""Junta p4 (noite 1) e p5 (noite 2) num episodio so:
gancho do p5 + abertura -> cartao NOITE 1 -> gameplay p4 -> cartao fim da noite 1 (placar + gancho) -> cartao NOITE 2 -> gameplay p5 + cartao final.
Uso: python3 junta.py P4.mp4 P5.mp4 SAIDA.mp4 T5_INICIO_GAMEPLAY"""
import html
import subprocess
import sys
from pathlib import Path

P4, P5, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
T5 = float(sys.argv[4])  # inicio da gameplay no p5 (fim do gancho + abertura)
D = OUT.parent / "tmp_junta"
D.mkdir(exist_ok=True)
P4_INI, P4_FIM = 28.933, 346.83
MUS = Path("video/remotion/public/music")
FF = "ffmpeg"
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]


def svg(titulo: str, sub: str, faixa: str = "") -> str:
    e = html.escape
    fx = (f'<rect x="240" y="190" width="800" height="64" rx="14" fill="#7f1d1d" stroke="#fecaca" stroke-width="3"/>'
          f'<text x="640" y="233" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" '
          f'font-size="28" fill="#fff" letter-spacing="1.5">{e(faixa)}</text>') if faixa else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">'
            '<rect width="1280" height="720" fill="#020617" fill-opacity="0.6"/>' + fx +
            f'<text x="640" y="372" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" '
            f'font-size="96" fill="#facc15" stroke="#020617" stroke-width="10" paint-order="stroke">{e(titulo)}</text>'
            f'<text x="640" y="452" text-anchor="middle" font-family="Roboto, DejaVu Sans, sans-serif" font-weight="900" '
            f'font-size="44" fill="#fff" stroke="#020617" stroke-width="7" paint-order="stroke">{e(sub)}</text></svg>')


def cartao(nome: str, fundo_mp4: Path, t_fundo: float, s: str, dur: float, musica: str) -> Path:
    png, bg, out = D / f"{nome}.png", D / f"{nome}_bg.png", D / f"{nome}.mp4"
    subprocess.run(["rsvg-convert", "-w", "1920", "-h", "1080", "-o", str(png)], input=s.encode(), check=True)
    subprocess.run([FF, "-v", "error", "-y", "-ss", f"{t_fundo:.2f}", "-i", str(fundo_mp4), "-frames:v", "1", str(bg)], check=True)
    subprocess.run([FF, "-v", "error", "-y", "-loop", "1", "-i", str(bg), "-loop", "1", "-i", str(png), "-i", str(MUS / f"{musica}.mp3"),
                    "-filter_complex",
                    f"[0:v]scale=1920:1080,boxblur=18:2,fps=30[b];[1:v]format=rgba,fade=in:st=0:d=0.3:alpha=1[c];"
                    f"[b][c]overlay,trim=0:{dur},setpts=PTS-STARTPTS,fade=out:st={dur - 0.25}:d=0.25,format=yuv420p[v];"
                    f"[2:a]volume=0.35,atrim=0:{dur},afade=t=in:d=0.3,afade=t=out:st={dur - 0.6}:d=0.6[a]",
                    "-map", "[v]", "-map", "[a]", *ENC, str(out)], check=True)
    return out


def trecho(nome: str, src: Path, a: float, b: float | None) -> Path:
    out = D / f"{nome}.mp4"
    cmd = [FF, "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", str(src)]
    if b is not None:
        cmd += ["-t", f"{b - a:.3f}"]
    subprocess.run(cmd + ["-af", "aresample=async=1", *ENC, str(out)], check=True)
    return out


partes = [
    trecho("a_gancho_abertura", P5, 0.0, T5),
    cartao("b_noite1", P4, P4_INI + 1.0, svg("NOITE 1", "A senhora que veio em dobro"), 2.5, "lobby-time"),
    trecho("c_p4", P4, P4_INI, P4_FIM),
    cartao("d_fim1", P4, P4_FIM - 0.2, svg("FIM DA NOITE 1", "E a noite 2... foi pior.", "3 REMOVIDOS · 1 LIBERADA · 2 MARGARETTES"), 3.5, "hitman"),
    cartao("e_noite2", P5, T5 + 1.0, svg("NOITE 2", "O telefone que enganou o Opus"), 2.5, "lobby-time"),
    trecho("f_p5", P5, T5, None),
]
lista = D / "lista.txt"
lista.write_text("".join(f"file '{p.resolve()}'\n" for p in partes))
subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", "-movflags", "+faststart", str(OUT)], check=True)
r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT)], capture_output=True, text=True)
print("pronto", OUT, r.stdout.strip(), "s")
for p in partes:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    print(" ", p.name, r.stdout.strip())
