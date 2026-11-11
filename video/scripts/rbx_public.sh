#!/bin/bash
# Pasta public enxuta para o render do Roblox (o public/ inteiro tem 3 GB e o bundle do Remotion copia tudo):
# hardlinks só do que o vídeo usa (fontes, memes do roteiro, vozes, trechos e a timeline). Uso: bash rbx_public.sh
set -e
cd "$(dirname "$0")/../remotion"
rm -rf public_rbx; mkdir -p public_rbx/gifs
cp -al public/fonts public_rbx/fonts
cp -al public/roblox public_rbx/roblox
cp public/timeline_roblox.json public_rbx/
for g in $(python3 -c "import json;print(' '.join(sorted({o['info']['file'] for c in json.load(open('public/timeline_roblox.json'))['cenas'] for o in c['over'] if o['tipo']=='meme'})))"); do cp -al public/gifs/$g public_rbx/gifs/; done
du -sh public_rbx
