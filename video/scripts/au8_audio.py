#!/usr/bin/env python3
"""AMONG IA 8 (The Skeld): monta a faixa de vozes + efeitos direto da timeline.
Usa numpy quando disponível ou fallback nativo via Node.js Float32Array (zero dependências extras).
Uso (de video/remotion): python3 ../scripts/au8_audio.py out/au8_voz.flac
"""
import json
import subprocess
import sys
from pathlib import Path

SR, FPS = 48000, 30
PUB = Path('public')
out_file = sys.argv[1]

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

if HAS_NUMPY:
    tl = json.loads((PUB / 'timeline_au8.json').read_text())
    total = sum(c['dur'] for c in tl['cenas'])
    mix = np.zeros((total * SR // FPS + SR, 2), dtype=np.float32)
    cache = {}
    def ler(src):
        if src not in cache:
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(PUB / src), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
            cache[src] = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
        return cache[src]
    ini = 0
    for c in tl['cenas']:
        fim = (ini + c['dur']) * SR // FPS
        for a in c['audio']:
            s = ler(a['src']) * a.get('vol', 1)
            p = (ini + a['at']) * SR // FPS
            n = max(0, min(len(s), fim - p))
            mix[p:p + n] += s[:n]
        ini += c['dur']
    mix = mix[:total * SR // FPS]
    print('pico', float(np.abs(mix).max()))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'flac', out_file], input=mix.tobytes(), check=True)
    print('ok', out_file, total / FPS / 60, 'min')
else:
    js = r"""
const fs = require('fs');
const { spawnSync, spawn } = require('child_process');
const SR = 48000, FPS = 30;
const outFile = process.argv[1];
const tl = JSON.parse(fs.readFileSync('public/timeline_au8.json', 'utf8'));
const totalFrames = tl.cenas.reduce((a, c) => a + c.dur, 0);
const totalSamples = Math.floor(totalFrames * SR / FPS);
const mix = new Float32Array(totalSamples * 2);
const cache = new Map();
function ler(src) {
  if (!cache.has(src)) {
    const r = spawnSync('ffmpeg', ['-v', 'error', '-i', 'public/' + src, '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-'], { maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error('ffmpeg decode failed: ' + src);
    const buf = r.stdout;
    const f32 = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
    cache.set(src, f32);
  }
  return cache.get(src);
}
let ini = 0;
for (const c of tl.cenas) {
  const fim = Math.floor((ini + c.dur) * SR / FPS);
  for (const a of c.audio) {
    const s = ler(a.src);
    const vol = a.vol ?? 1;
    const p = Math.floor((ini + a.at) * SR / FPS);
    const maxSamples = Math.max(0, Math.min(Math.floor(s.length / 2), Math.min(fim, totalSamples) - p));
    let dst = p * 2;
    for (let i = 0; i < maxSamples * 2; i++) {
      mix[dst + i] += s[i] * vol;
    }
  }
  ini += c.dur;
}
let pico = 0;
for (let i = 0; i < mix.length; i++) {
  const v = Math.abs(mix[i]);
  if (v > pico) pico = v;
}
console.log('pico', pico);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', '-', '-c:a', 'flac', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
const raw = Buffer.from(mix.buffer, mix.byteOffset, mix.byteLength);
const CHUNK = 4 * 1024 * 1024;
(async () => {
  for (let off = 0; off < raw.length; off += CHUNK) {
    const slice = raw.subarray(off, Math.min(raw.length, off + CHUNK));
    if (!ff.stdin.write(slice)) {
      await new Promise((res) => ff.stdin.once('drain', res));
    }
  }
  ff.stdin.end();
})();
ff.on('exit', (code) => {
  if (code !== 0) process.exit(code || 1);
  console.log('ok', outFile, (totalFrames / FPS / 60).toFixed(2), 'min');
});
"""
    subprocess.run(['node', '-e', js, out_file], check=True)
