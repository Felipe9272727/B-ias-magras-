#!/usr/bin/env python3
"""Upscale de vídeo com Real-ESRGAN (spandrel + PyTorch, no processador): lê o vídeo pequeno, aumenta 4x cada quadro
e grava (com ffmpeg) já no tamanho final pedido. Uso:
  python3 upscale_ia.py <entrada.mp4> <saida.mp4> <modelo.pth> [largura=1920] [altura=1080]
"""
import subprocess
import sys

import numpy as np
import torch
from spandrel import ModelLoader

ent, sai, modelo = sys.argv[1:4]
W = int(sys.argv[4]) if len(sys.argv) > 4 else 1920
H = int(sys.argv[5]) if len(sys.argv) > 5 else 1080
torch.set_num_threads(int(__import__('os').environ.get('THREADS', '4')))

info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                       '-of', 'csv=p=0', ent], capture_output=True, text=True).stdout.strip().split(',')
w, h, fps = int(info[0]), int(info[1]), info[2]
net = ModelLoader().load_from_file(modelo).model.eval().to(memory_format=torch.channels_last)
# o processador tem AMX: em bfloat16 a rede roda bem mais rápido (BF16=0 desliga)
BF16 = __import__('os').environ.get('BF16', '1') == '1'

le = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', ent, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
grava = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w * 4}x{h * 4}', '-r', fps, '-i', '-',
                          '-vf', f'scale={W}:{H}:flags=lanczos', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', sai],
                         stdin=subprocess.PIPE)
n = 0
with torch.inference_mode():
    while True:
        buf = le.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        x = (torch.from_numpy(np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()).permute(2, 0, 1)[None].float() / 255).contiguous(memory_format=torch.channels_last)
        with torch.autocast('cpu', dtype=torch.bfloat16, enabled=BF16):
            y = net(x)
        y = y.float().clamp(0, 1)[0].permute(1, 2, 0).mul(255).round().byte().numpy()
        grava.stdin.write(y.tobytes())
        n += 1
        if n % 30 == 0:
            print(n, 'quadros', flush=True)
grava.stdin.close()
grava.wait()
print('feito', n, 'quadros ->', sai)
