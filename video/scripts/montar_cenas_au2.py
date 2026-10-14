#!/usr/bin/env python3
"""Among Us 2: monta o vídeo com cache POR CENA (sucessor de montar_au2_v2.py).

Cada cena vira uma peça em out/cenas/<id>_<hash>.mkv (H.264 + áudio PCM). O hash vem do conteúdo da cena (visual,
duração, palavras, eventos, cena anterior) e de onde a imagem vem; então mudar uma frase refaz só aquela cena, e as
outras continuam valendo mesmo que o vídeo ande alguns segundos.
- cena igual à do vídeo antigo (timeline_au2_v1.json): imagem recortada de out/au2_sem_mix.mp4 + áudio renderizado
  (os efeitos sonoros mudaram desde aquele render);
- cena nova ou mudada: imagem e áudio renderizados.
Cenas vizinhas que faltam são renderizadas numa chamada só e depois cortadas por cena. No fim junta tudo e comprime o
áudio uma vez só (sem emendas de AAC entre as peças).

Uso: python3 montar_cenas_au2.py <bundle> [saida.mp4]
     python3 montar_cenas_au2.py --importar <timeline em public/ usada pelo montar_au2_v2.py>   (corta os trechos já
     feitos pelo script antigo em peças por cena)
"""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import montar_au2_v2 as velho  # noqa: E402

REM = Path(__file__).resolve().parents[1] / 'remotion'
PUB = REM / 'public'
CENAS = REM / 'out' / 'cenas'
VELHO = REM / 'out' / 'au2_sem_mix.mp4'
FPS = 30
BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
VIDEO = ['-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
AUDIO = ['-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2']


def plano(nova='timeline_au2.json'):
    a = json.loads((PUB / 'timeline_au2_v1.json').read_text())['scenes']
    b = json.loads((PUB / nova).read_text())['scenes']
    velhas = {velho.assinatura(s, a[i - 1] if i else None): s for i, s in enumerate(a)}
    out = []
    for i, s in enumerate(b):
        sig = velho.assinatura(s, b[i - 1] if i else None)
        v = velhas.get(sig)
        tipo = 'reusa' if v else 'render'
        ini_v = v['start'] if v else None
        h = hashlib.sha1(json.dumps([tipo, ini_v, sig], ensure_ascii=False).encode()).hexdigest()[:14]
        out.append(dict(id=s['id'], ini=s['start'], fim=s['start'] + s['duration'], tipo=tipo, ini_v=ini_v, arq=CENAS / f"{s['id']}_{h}.mkv"))
    return out


def cortar(src_v, off_v, src_a, off_a, n, destino):
    """Peça de n quadros: imagem de src_v a partir de off_v (s), áudio de src_a a partir de off_a (s)."""
    tmp = destino.with_suffix('.tmp.mkv')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{off_v:.6f}', '-i', src_v, '-ss', f'{off_a:.6f}', '-i', src_a,
                    '-map', '0:v', '-map', '1:a', '-frames:v', str(n), *VIDEO, *AUDIO, '-af', f'apad,atrim=0:{n / FPS:.6f}', tmp], check=True)
    shutil.move(tmp, destino)


def importar(timeline_antiga):
    """Corta em peças por cena os trechos já prontos do montar_au2_v2.py (feitos sobre `timeline_antiga`)."""
    CENAS.mkdir(parents=True, exist_ok=True)
    pc = {c['id']: c for c in plano(timeline_antiga)}
    for k, t in enumerate(velho.trechos(timeline_antiga)):
        # nome antigo (por posição, do processo que já estava rodando) ou o novo (por conteúdo)
        arq = next((x for x in (velho.OUT / f't{k:03d}_{t[0]}_{t[1]}_{t[2]}.mp4', velho.OUT / velho.nome(t)) if x.exists()), None)
        if not arq:
            continue
        tipo, ini, _, _, ids, _ = t
        for sid in ids:
            c = pc[sid]
            if c['arq'].exists():
                continue
            off = (c['ini'] - ini) / FPS
            cortar(arq, off, arq, off, c['fim'] - c['ini'], c['arq'])
        print('importado', arq.name, flush=True)


def corridas(faltam):
    """Agrupa cenas que faltam e são vizinhas (e, no reuso, contínuas no vídeo antigo)."""
    grupos = []
    for c in faltam:
        g = grupos[-1] if grupos else None
        if g and g[-1]['fim'] == c['ini'] and g[-1]['tipo'] == c['tipo'] and (c['tipo'] == 'render' or g[-1]['ini_v'] + (g[-1]['fim'] - g[-1]['ini']) == c['ini_v']):
            g.append(c)
        else:
            grupos.append([c])
    return grupos


def main():
    if sys.argv[1] == '--importar':
        importar(sys.argv[2])
        return
    bundle = sys.argv[1]
    saida = Path(sys.argv[2] if len(sys.argv) > 2 else REM / 'out' / 'au2_v2_sem_mix.mp4')
    CENAS.mkdir(parents=True, exist_ok=True)
    cenas = plano()
    faltam = [c for c in cenas if not c['arq'].exists()]
    grupos = corridas(faltam)
    print(f'{len(cenas)} cenas; faltam {len(faltam)} ({sum(c["fim"] - c["ini"] for c in faltam) / FPS:.0f} s) em {len(grupos)} grupos', flush=True)
    for k, g in enumerate(grupos):
        ini, fim, tipo = g[0]['ini'], g[-1]['fim'], g[0]['tipo']
        print(f'[{k + 1}/{len(grupos)}] {tipo} {g[0]["id"]}..{g[-1]["id"]} ({(fim - ini) / FPS:.1f}s)', flush=True)
        with tempfile.TemporaryDirectory(dir=CENAS) as td:
            tmp = Path(td)
            if tipo == 'render':
                velho.remotion(bundle, tmp / 'r.mp4', ini, fim, ['--crf=16'])
                for c in g:
                    off = (c['ini'] - ini) / FPS
                    cortar(tmp / 'r.mp4', off, tmp / 'r.mp4', off, c['fim'] - c['ini'], c['arq'])
            else:
                velho.remotion(bundle, tmp / 'a.wav', ini, fim, ['--codec=wav'])
                for c in g:
                    cortar(VELHO, c['ini_v'] / FPS, tmp / 'a.wav', (c['ini'] - ini) / FPS, c['fim'] - c['ini'], c['arq'])
    lista = CENAS / 'lista.txt'
    lista.write_text(''.join(f"file '{c['arq']}'\n" for c in cenas))
    junto = CENAS / 'junto.mkv'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', junto], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', junto, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', saida], check=True)
    junto.unlink()
    print('PRONTO', saida, flush=True)


if __name__ == '__main__':
    main()
