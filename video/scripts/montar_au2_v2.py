#!/usr/bin/env python3
"""Among Us 2, versão 2: monta o vídeo novo sem renderizar tudo de novo.

Compara a timeline nova (public/timeline_au2.json) com a antiga (public/timeline_au2_v1.json), cena a cena:
- cena igual (mesmo visual, duração, palavras, eventos e cena anterior): a imagem vem recortada do vídeo pronto
  (out/au2_sem_mix.mp4) e só o áudio é renderizado (os efeitos sonoros mudaram desde aquele render);
- cena nova ou mudada: renderiza imagem e áudio.
Cenas vizinhas do mesmo tipo viram um trecho só. Cada trecho fica salvo em out/v2/ (retomável) e no fim tudo é juntado.

Uso: python3 montar_au2_v2.py <bundle do remotion> [saida.mp4]
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REM = Path(__file__).resolve().parents[1] / 'remotion'
PUB = REM / 'public'
OUT = REM / 'out' / 'v2'
VELHO = REM / 'out' / 'au2_sem_mix.mp4'
FPS = 30
BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'


def assinatura(sc, ant):
    return json.dumps([sc['visual'], sc['duration'], sc['words'], sc['events'], sc['segments'], sc['capGroups'],
                       (ant or {}).get('visual', {}).get('name')], sort_keys=True, ensure_ascii=False)


def trechos():
    a = json.loads((PUB / 'timeline_au2_v1.json').read_text())['scenes']
    b = json.loads((PUB / 'timeline_au2.json').read_text())['scenes']
    velhas = {assinatura(s, a[i - 1] if i else None): s for i, s in enumerate(a)}
    out = []  # (tipo, ini_novo, fim_novo, ini_velho, ids)
    for i, s in enumerate(b):
        v = velhas.get(assinatura(s, b[i - 1] if i else None))
        tipo = 'reusa' if v else 'render'
        ini_v = v['start'] if v else None
        ult = out[-1] if out else None
        # junta com o trecho anterior se for do mesmo tipo (e, no reuso, contínuo no vídeo antigo)
        if ult and ult[0] == tipo and (tipo == 'render' or ult[3] + (ult[2] - ult[1]) == ini_v):
            out[-1] = (tipo, ult[1], s['start'] + s['duration'], ult[3], ult[4] + [s['id']])
        else:
            out.append((tipo, s['start'], s['start'] + s['duration'], ini_v, [s['id']]))
    return out


def limpar_tmp():
    for p in Path('/tmp').glob('remotion-*'):
        shutil.rmtree(p, ignore_errors=True)
    for p in Path('/tmp').glob('react-motion-render*'):
        shutil.rmtree(p, ignore_errors=True)


def remotion(bundle, saida, ini, fim, extra):
    subprocess.run(['npx', 'remotion', 'render', bundle, 'AmongUs2', str(saida), f'--frames={ini}-{fim - 1}', '--concurrency=4',
                    f'--browser-executable={BROWSER}', '--log=error', *extra], cwd=REM, check=True)
    limpar_tmp()


def main():
    bundle = sys.argv[1]
    saida = Path(sys.argv[2] if len(sys.argv) > 2 else REM / 'out' / 'au2_v2_sem_mix.mp4')
    OUT.mkdir(parents=True, exist_ok=True)
    lista = trechos()
    tot = sum(t[2] - t[1] for t in lista if t[0] == 'render')
    print(f'{len(lista)} trechos; renderizar {tot / FPS / 60:.1f} min, reaproveitar {sum(t[2] - t[1] for t in lista if t[0] == "reusa") / FPS / 60:.1f} min', flush=True)
    arqs = []
    for k, (tipo, ini, fim, ini_v, ids) in enumerate(lista):
        arq = OUT / f't{k:03d}_{tipo}_{ini}_{fim}.mp4'
        arqs.append(arq)
        if arq.exists():
            continue
        print(f'[{k + 1}/{len(lista)}] {tipo} {ids[0]}..{ids[-1]} ({(fim - ini) / FPS:.1f}s)', flush=True)
        with tempfile.TemporaryDirectory(dir=OUT) as td:
            tmp = Path(td)
            n = fim - ini
            if tipo == 'render':
                remotion(bundle, tmp / 'r.mp4', ini, fim, ['--crf=18'])
                # mesma codificação dos trechos reaproveitados, para o concat final sem recodificar
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp / 'r.mp4', '-map', '0:v', '-map', '0:a', '-c:v', 'libx264', '-crf', '18',
                                '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', arq], check=True)
            else:
                remotion(bundle, tmp / 'a.wav', ini, fim, ['--codec=wav'])
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini_v / FPS:.6f}', '-i', VELHO, '-i', tmp / 'a.wav',
                                '-map', '0:v', '-map', '1:a', '-frames:v', str(n), '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast',
                                '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
                                '-af', f'apad,atrim=0:{n / FPS:.6f}', arq], check=True)
    (OUT / 'lista.txt').write_text(''.join(f"file '{a}'\n" for a in arqs))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', OUT / 'lista.txt', '-c', 'copy', saida], check=True)
    print('PRONTO', saida, flush=True)


if __name__ == '__main__':
    main()
