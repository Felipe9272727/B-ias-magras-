#!/bin/bash
# reencena_maquina.sh <grupo> <total de grupos>: grava no Minecraft de verdade (minecraft/reencena.mjs) a parte <grupo>
# das cenas do vídeo (janelas.txt, divididas por duração) e devolve os clipes no branch render-pacotes
# (reenc_g<grupo>.tar.part*). Prepara tudo do zero: servidor vanilla 1.21.4 com o mundo da partida, cliente oficial
# 1.21.4 com Fabric + CustomSkinLoader (skins das IAs), Xvfb e a gravação da partida (pacote3 do render-pacotes).
set -u
G=$1; N=$2
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
MC=$RAIZ/minecraft
V=$RAIZ/video/remotion/public/mc/video
P=/tmp/pacotes; SRV=/tmp/srv; CLI=/root/mc; OUT=/tmp/reenc_g$G
log() { echo "[$(date +%T)] $*"; }

# 1) gravação da partida + dependências do node
[ -d $P ] || git clone -q --depth 1 -b render-pacotes https://github.com/Felipe9272727/B-ias-magras- $P
[ -d $MC/gravacoes/partida1/chunks ] || { cd $MC && cat $P/pacote3.tar.part* | tar -xf -; }
cd $MC && { [ -d node_modules ] || npm ci --no-audit --no-fund > /tmp/npm_mc.log 2>&1 || npm install --no-audit --no-fund > /tmp/npm_mc.log 2>&1; }
which xdotool > /dev/null || apt-get install -y -q xdotool > /tmp/apt.log 2>&1
log "gravação e dependências ok"

# 2) servidor com o mundo do fim da partida
if [ ! -f $SRV/server.jar ]; then
  mkdir -p $SRV && cd $SRV
  U=$(curl -s https://piston-meta.mojang.com/mc/game/version_manifest_v2.json | python3 -c "import sys,json;print([v['url'] for v in json.load(sys.stdin)['versions'] if v['id']=='1.21.4'][0])")
  curl -s -o server.jar "$(curl -s "$U" | python3 -c "import sys,json;print(json.load(sys.stdin)['downloads']['server']['url'])")"
  tar -xzf $MC/backup/partida1_mundo.tar.gz
  echo eula=true > eula.txt
  printf 'online-mode=false\nenable-rcon=true\nrcon.password=ias_local\nrcon.port=25575\nserver-port=25565\nlevel-name=mundo\nspawn-protection=0\nview-distance=8\nsimulation-distance=6\nallow-flight=true\nmax-players=20\ngamemode=adventure\ndifficulty=easy\nenforce-secure-profile=false\nnetwork-compression-threshold=-1\n' > server.properties
fi
cd $SRV && (nohup java -Xmx2G -jar server.jar nogui > $SRV/console.log 2>&1 &)
until grep -q "RCON running" $SRV/console.log 2>/dev/null; do sleep 2; done
log "servidor ok"

# 3) cliente oficial com Fabric, CustomSkinLoader e as skins
pip install -q portablemc > /dev/null 2>&1
if [ ! -d $CLI/mods ]; then
  mkdir -p $CLI/mods $CLI/CustomSkinLoader/LocalSkin/skins
  portablemc --main-dir $CLI start fabric:1.21.4 --dry > /tmp/pmc.log 2>&1
  for p in fabric-api customskinloader; do
    u=$(curl -s "https://api.modrinth.com/v2/project/$p/version?game_versions=%5B%221.21.4%22%5D&loaders=%5B%22fabric%22%5D" | python3 -c "import sys,json;v=json.load(sys.stdin);print(v[0]['files'][0]['url'])")
    (cd $CLI/mods && curl -sLO "$u")
  done
  cp $MC/skins/*.png $CLI/CustomSkinLoader/LocalSkin/skins/
  printf 'version:4189\nrenderDistance:8\nsimulationDistance:6\ngraphicsMode:0\nmaxFps:60\nenableVsync:false\npauseOnLostFocus:false\nonboardAccessibility:false\ntutorialStep:none\nskipMultiplayerWarning:true\njoinedFirstServer:true\nsoundCategory_master:0.0\nguiScale:2\nfov:0.0\nbobView:true\nparticles:0\nrenderClouds:"fast"\nnarrator:0\n' > $CLI/options.txt
fi
(Xvfb :99 -screen 0 960x540x24 > /tmp/xvfb.log 2>&1 &)
sleep 1
cd $CLI && (DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe nohup portablemc --main-dir $CLI start fabric:1.21.4 -u Camera --join-server localhost --resolution 960x540 > /tmp/cliente.log 2>&1 &)
until grep -q "Camera joined" $SRV/console.log; do sleep 3; done
cd $MC && node -e "import('./rcon.mjs').then(async m => { const c = m.rcon(); await c('gamemode spectator Camera'); await c('tp Camera 0 100 0'); process.exit(0) })"
sleep 8
# se a câmera morreu ao entrar (caiu no vazio), aperta "Renascer"
DISPLAY=:99 xdotool mousemove 480 297 click 1; sleep 3
log "cliente ok"

# pega a versão mais nova do código antes de gravar (o preparo acima leva ~10 min)
cd $RAIZ && git pull -q origin claude/video-3

# 4) a parte deste grupo (cenas em ordem de duração, distribuídas uma a uma entre os grupos)
python3 - $G $N > /tmp/cenas_g$G.txt <<EOF
import sys
g, n = int(sys.argv[1]), int(sys.argv[2])
cs = [l.split() for l in open('$V/janelas.txt') if l.strip()]
cs.sort(key=lambda c: -(float(c[2]) - float(c[1])))
carga = [0.0] * n; grupo = [[] for _ in range(n)]
for c in cs:
    i = carga.index(min(carga)); grupo[i].append(c); carga[i] += float(c[2]) - float(c[1])
for c in grupo[g]: print(' '.join(c))
EOF
log "cenas: $(wc -l < /tmp/cenas_g$G.txt)"
cd $MC && DISPLAY=:99 LENTO=${LENTO:-3} node reencena.mjs gravacoes/partida1 /tmp/cenas_g$G.txt $OUT > /tmp/reenc_g$G.log 2>&1
log "gravação: $(ls $OUT/*.mp4 | wc -l) clipes"; grep -E "ERRO" /tmp/reenc_g$G.log | head -5

# 5) entrega
cd $P && git pull -q --rebase origin render-pacotes && rm -f reenc_g$G.tar.part* && tar -C $OUT -cf - . | split -b 90m -d - reenc_g$G.tar.part && git add -A reenc_g$G.tar.part* \
  && git -c user.email=render@maquina -c user.name=render commit -qm "reencenação grupo $G" && { git push -q origin render-pacotes || { git pull -q --rebase origin render-pacotes && git push -q origin render-pacotes; }; }
log "FIM grupo $G"
