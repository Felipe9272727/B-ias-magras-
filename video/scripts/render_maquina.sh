#!/bin/bash
# render_maquina.sh <pedaços...>: renderiza pedaços (9000 quadros cada) do VideoMC numa máquina auxiliar, do zero:
# baixa os arquivos grandes do branch render-pacotes, instala dependências, faz o 3D só das cenas desses pedaços
# (replay.mjs), a água, a montagem no Remotion e devolve cada pedaço (partes de 90 MB) no branch render-pacotes.
# Uso: video/scripts/render_maquina.sh 0 1
set -u
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
V=$RAIZ/video/remotion/public/mc/video
P=/tmp/pacotes
PED=9000
log() { echo "[$(date +%T)] $*"; }

# 1) arquivos grandes
if [ ! -d $P ]; then git clone -q --depth 1 -b render-pacotes https://github.com/Felipe9272727/B-ias-magras- $P; else git -C $P pull -q --rebase origin render-pacotes; fi
cd $RAIZ/video/remotion && cat $P/pacote1.tar.part* | tar -xf - && log "pacote1 ok"
cd $RAIZ/minecraft && cat $P/pacote3.tar.part* | tar -xf - && log "pacote3 ok (gravação + texturas)"

# 2) dependências
cd $RAIZ/minecraft && { [ -d node_modules ] || npm ci --no-audit --no-fund > /tmp/npm_mc.log 2>&1 || npm install --no-audit --no-fund > /tmp/npm_mc.log 2>&1; } && log "npm minecraft ok"
cd $RAIZ/video/remotion && { [ -d node_modules ] || npm ci --no-audit --no-fund > /tmp/npm_rm.log 2>&1 || npm install --no-audit --no-fund > /tmp/npm_rm.log 2>&1; } && log "npm remotion ok"
BROWSER=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)

# 3) cenas que esses pedaços usam
JAN=/tmp/janelas_maquina.txt
python3 - "$@" > $JAN <<EOF
import json, sys
d = json.load(open('$V/abertura.json')); peds = {int(x) for x in sys.argv[1:]}; a = 0; ids = set()
for c in d['cenas']:
    if c['visual']['tipo'] == 'replay' and any(a // $PED <= k <= (a + c['dur'] - 1) // $PED for k in peds): ids.add(c['id'])
    a += c['dur']
for l in open('$V/janelas.txt'):
    if l.split()[0] in ids: print(l.strip())
EOF
log "cenas 3D: $(wc -l < $JAN)"

# 4) 3D (3 por vez) e água
cd $RAIZ/minecraft
while read id t0 t1 cam; do echo "GL=llvmpipe RAIO=2 ./render_seguro.sh gravacoes/partida1 $V/$id.mp4 $t0 $t1 $cam"; done < $JAN | xargs -P 3 -I{} bash -c "{}" | grep -v "^feito"
while read id t0 t1 cam; do SO_AGUA=1 node replay.mjs gravacoes/partida1 $V/$id.mp4 $t0 $t1 $cam 30 > /dev/null 2>&1; done < $JAN
log "3D e água ok"

# 5) montagem e entrega
cd $RAIZ/video/remotion
total=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('$V/abertura.json'))['cenas']))")
for k in "$@"; do
  a=$((k * PED)); b=$(( a + PED - 1 < total - 1 ? a + PED - 1 : total - 1 ))
  for tent in 1 2 3; do
    npx remotion render src/index.ts VideoMC out/p$k.mp4 --frames=$a-$b --scale=0.5 --concurrency=4 --crf=16 --timeout=120000 --log=error ${BROWSER:+--browser-executable=$BROWSER} > /tmp/p$k.log 2>&1 && break
    log "pedaço $k falhou (tentativa $tent)"; grep -v "^    at " /tmp/p$k.log | tail -3
  done
  cd $P && git pull -q --rebase origin render-pacotes && rm -f p$k.mp4.part* && split -b 90m -d $RAIZ/video/remotion/out/p$k.mp4 p$k.mp4.part && git add -A p$k.mp4.part* \
    && git -c user.email=render@maquina -c user.name=render commit -qm "pedaço $k" && { git push -q origin render-pacotes || { git pull -q --rebase origin render-pacotes && git push -q origin render-pacotes; }; }
  log "pedaço $k entregue"; cd $RAIZ/video/remotion
done
log "FIM"
