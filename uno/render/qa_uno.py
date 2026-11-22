#!/usr/bin/env python3
"""QA automático rigoroso do UNO das IAs (acentuação PT-BR, zero emojis, zero sussurros, zero memes repetidos, duração 10-15 min)."""
import json
import re
import sys
from collections import Counter
from pathlib import Path

TIMELINE = Path("/home/felipexcria750/uno_ias/timeline_uno.json")

BAD_PTBR = [
    r"\bnao\b", r"\bvoce\b", r"\bvoces\b", r"\btambem\b", r"\bentao\b", r"\bso\b",
    r"\bja\b", r"\bmaos\b", r"\bmao\b", r"\bcoracao\b", r"\bacao\b", r"\bacoes\b",
    r"\btraicao\b", r"\bdenuncia\b", r"\bpunicao\b", r"\bnumero\b", r"\bultimo\b",
    r"\bultima\b", r"\bproxima\b", r"\bproximo\b", r"\binicio\b", r"\bvitoria\b",
    r"\bcampeao\b", r"\bpodio\b", r"\bpremios\b", r"\bhorario\b", r"\besta\b",
    r"\bestao\b", r"\bala\b", r"\bsera\b", r"\bfaca\b", r"\bpaciencia\b",
]
EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]")


def main():
    tl = json.loads(TIMELINE.read_text(encoding="utf-8"))
    cenas = tl["cenas"]
    dur_min = tl["durationSec"] / 60.0
    errs = []
    warns = []
    memes = Counter()

    if not (9.5 <= dur_min <= 15.8):
        warns.append(f"Duração fora da faixa 10-15 min: {dur_min:.2f} min")

    for sc in cenas:
        sid = sc["id"]
        dur_f = sc["dur"]
        for seg in sc.get("falas", []):
            txt = seg.get("texto", "")
            if EMOJI_RE.search(txt):
                errs.append(f"[{sid}] Emoji proibido na fala: {txt[:60]}")
            if re.search(r"\[whispers?\]", txt, re.I):
                errs.append(f"[{sid}] Tag proibida [whispers] encontrada: {txt[:60]}")
            for pat in BAD_PTBR:
                if re.search(pat, txt, re.I):
                    warns.append(f"[{sid}] Possível falta de acento ({pat}): {txt[:80]}")
        for ov in sc.get("overlays", []):
            if ov.get("at", 0) + ov.get("dur", 0) > dur_f + 1:
                errs.append(f"[{sid}] Overlay cortado pelo fim da cena: at={ov.get('at')} dur={ov.get('dur')} > {dur_f}")
            if ov.get("tipo") == "meme" and ov.get("meme"):
                memes[ov["meme"]] += 1
            for k in ("text", "subtext", "caption"):
                v = ov.get(k, "")
                if v and EMOJI_RE.search(v):
                    errs.append(f"[{sid}] Emoji em overlay {k}: {v}")

    dups = {k: v for k, v in memes.items() if v > 1}
    if dups:
        errs.append(f"Memes repetidos no vídeo: {dups}")

    print(f"QA UNO: {len(cenas)} cenas · {dur_min:.2f} min ({tl['durationInFrames']}f @ 30fps) · {len(memes)} memes únicos")
    print(f"Erros: {len(errs)} | Avisos: {len(warns)}")
    for e in errs:
        print("  ERROR:", e)
    for w in warns[:20]:
        print("  WARN:", w)
    if errs:
        sys.exit(1)


if __name__ == "__main__":
    main()
