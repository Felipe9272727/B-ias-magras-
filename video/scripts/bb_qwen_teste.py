#!/usr/bin/env python3
"""Teste de voz com o Qwen3-TTS (Apache 2.0) na CPU de uma máquina do GitHub: vozes criadas por descrição (VoiceDesign)
e clonagem do narrador antigo do canal (Base). Saída: qwen_out/*.mp3"""
import subprocess, time, torch, soundfile as sf
from pathlib import Path
from qwen_tts import Qwen3TTSModel
out = Path('qwen_out'); out.mkdir(exist_ok=True)
def salvar(nome, wavs, sr):
    sf.write(out / f'{nome}.wav', wavs[0], sr)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(out / f'{nome}.wav'), '-b:a', '160k', str(out / f'{nome}.mp3')], check=True)
    (out / f'{nome}.wav').unlink(); print(nome, round(time.time() - t0), 's', flush=True)
t0 = time.time()
m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map='cpu', dtype=torch.float32)
casos = [
  ('qwen_narrador', 'Nove inteligências artificiais. Três macacos por vez. Um cego, um surdo e um mudo. E uma bomba que explode em dois minutos e meio.', 'Narrador brasileiro de vídeo de YouTube de games, voz masculina grave, animado, ritmo rápido e envolvente, sotaque paulista.'),
  ('qwen_cego_grito', 'Mudo, cadê a regra dos cabos?! Faltam trinta segundos, cara, eu não vou cortar nada no chute!', 'Jovem brasileiro desesperado e gritando, voz aguda e cômica de desenho animado, falando muito rápido, em pânico.'),
  ('qwen_surdo', 'Cego, corta o primeiro cabo da esquerda: o azul! Vai, vai, vai!', 'Mulher brasileira enérgica e mandona, falando alto e rápido, com urgência, tom de comédia.'),
  ('qwen_pensamento', 'Esse surdo jumento não descreve a bomba. Como é que eu vou saber qual fio cortar?', 'Homem brasileiro irritado resmungando baixo consigo mesmo, sarcástico, voz rouca.'),
]
for nome, txt, ins in casos:
    salvar(nome, *m.generate_voice_design(text=txt, language='Portuguese', instruct=ins))
del m
m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
ref = 'video/remotion/public/bb/refs/narrador.wav'
ref_txt = 'Essa IA passou cinco dias tentando ser expulsa da vila.'
salvar('qwen_clone_narrador', *m.generate_voice_clone(text=casos[0][1], language='Portuguese', ref_audio=ref, ref_text=ref_txt, x_vector_only_mode=True))
