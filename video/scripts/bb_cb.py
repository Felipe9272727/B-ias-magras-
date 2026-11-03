#!/usr/bin/env python3
"""Vozes do BOMBANANA! com o Chatterbox Multilingual (grátis, MIT), feito para rodar nas máquinas do GitHub Actions.
Lê remotion/public/bb/pedidos_cb.json ({id, texto_cb, ref, exag}) e gera <out>/<id>.mp3 só da parte --index de --count,
clonando a voz de remotion/public/bb/refs/<ref>.wav (narrador = narrador antigo do canal; IAs = uma voz cada).
"""
import argparse, json, subprocess, time
from pathlib import Path
import soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ROOT = Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser()
ap.add_argument('--index', type=int, default=0); ap.add_argument('--count', type=int, default=1); ap.add_argument('--out', default='cb_out')
a = ap.parse_args()
ped = json.loads((ROOT / 'remotion/public/bb/pedidos_cb.json').read_text())
# reparte por tamanho de texto (cada máquina pega mais ou menos o mesmo tanto de fala)
ped.sort(key=lambda p: -len(p['texto_cb']))
carga = [0] * a.count; minha = []
for p in ped:
    i = carga.index(min(carga)); carga[i] += len(p['texto_cb'])
    if i == a.index: minha.append(p)
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
t0 = time.time()
for k, p in enumerate(minha):
    wav = out / f"{p['id']}.wav"
    w = m.generate(p['texto_cb'], language_id='pt', audio_prompt_path=str(ROOT / 'remotion/public/bb/refs' / f"{p['ref']}.wav"), exaggeration=p['exag'], cfg_weight=0.5)
    sf.write(wav, w.squeeze().numpy(), m.sr)
    # tira silêncio do começo/fim e vira mp3
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-b:a', '160k', str(out / f"{p['id']}.mp3")], check=True)
    wav.unlink()
    print(f'{k + 1}/{len(minha)} {p["id"]} ({time.time() - t0:.0f}s)', flush=True)
