#!/usr/bin/env bash
# Prepara servidor vanilla 1.21.4 + cliente real 1.21.4 com Fabric (Fabric API + CustomSkinLoader)
# para gravar com Xvfb/llvmpipe numa máquina sem GPU. Idempotente: pode rodar de novo à vontade.
#
#   bash cliente_setup.sh            -> instala tudo (servidor NÃO é iniciado)
#   source cliente_setup.sh          -> instala e deixa as funções iniciar_cliente / iniciar_servidor / rcon
#   bash cliente_setup.sh iniciar    -> instala e já sobe Xvfb + cliente (Camera -> localhost)
#
# Skins locais: $MC_DIR/CustomSkinLoader/LocalSkin/skins/<Nome>.png

SETUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRV_DIR="${SRV_DIR:-/tmp/srv}"
MC_DIR="${MC_DIR:-/tmp/mc-cliente}"
NODE_DIR="${NODE_DIR:-/tmp/mc-node}"
MC_VER=1.21.4
DISPLAY_NUM="${DISPLAY_NUM:-99}"
CLIENTE_LOG="${CLIENTE_LOG:-/tmp/cliente.log}"

_log() { echo "[cliente_setup] $*"; }

# baixa $1 para $2 se não existir ou se o sha1 ($3, opcional) não bater
_baixar() {
  local url="$1" dest="$2" sha1="$3"
  if [ -f "$dest" ] && { [ -z "$sha1" ] || echo "$sha1  $dest" | sha1sum -c --quiet - 2>/dev/null; }; then
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  curl -fsSL --retry 4 "$url" -o "$dest.part" && mv "$dest.part" "$dest"
}

# imprime "url<TAB>sha1<TAB>arquivo" da versão Fabric mais nova do projeto Modrinth $1 para $MC_VER
_modrinth() {
  curl -fsS -G "https://api.modrinth.com/v2/project/$1/version" \
    --data-urlencode "game_versions=[\"$MC_VER\"]" --data-urlencode 'loaders=["fabric"]' |
    python3 -I -c '
import json, sys
v = json.load(sys.stdin)[0]
f = next(f for f in v["files"] if f["primary"])
print(f["url"], f["hashes"]["sha1"], f["filename"], sep="\t")'
}

instalar_dependencias() {
  local falta=()
  command -v Xvfb >/dev/null || falta+=(xvfb)
  command -v xdotool >/dev/null || falta+=(xdotool)
  command -v ffmpeg >/dev/null || falta+=(ffmpeg)
  command -v java >/dev/null || falta+=(openjdk-21-jre-headless)
  if [ ${#falta[@]} -gt 0 ]; then
    _log "apt: ${falta[*]}"
    apt-get update -qq && apt-get install -y -qq "${falta[@]}" >/dev/null
  fi
  command -v portablemc >/dev/null || pip install -q portablemc 2>&1 | grep -v "as the 'root' user"
  if [ ! -d "$NODE_DIR/node_modules/rcon-client" ] || [ ! -d "$NODE_DIR/node_modules/mineflayer" ]; then
    mkdir -p "$NODE_DIR" && (cd "$NODE_DIR" && npm i -s rcon-client mineflayer >/dev/null 2>&1)
  fi
}

instalar_servidor() {
  mkdir -p "$SRV_DIR"
  if [ ! -f "$SRV_DIR/server.jar" ]; then
    local vurl surl
    vurl=$(curl -fsS https://piston-meta.mojang.com/mc/game/version_manifest_v2.json |
      python3 -I -c "import json,sys;print(next(v['url'] for v in json.load(sys.stdin)['versions'] if v['id']=='$MC_VER'))")
    read -r surl ssha < <(curl -fsS "$vurl" | python3 -I -c "import json,sys;s=json.load(sys.stdin)['downloads']['server'];print(s['url'],s['sha1'])")
    _baixar "$surl" "$SRV_DIR/server.jar" "$ssha"
  fi
  echo "eula=true" > "$SRV_DIR/eula.txt"
  local props="$SRV_DIR/server.properties"
  touch "$props"
  # mantém o que o servidor gerar e força só as chaves abaixo
  local kv
  for kv in online-mode=false enable-rcon=true rcon.password=ias_local rcon.port=25575 \
            spawn-protection=0 view-distance=8 simulation-distance=6 allow-flight=true server-port=25565; do
    local k="${kv%%=*}"
    if grep -q "^$k=" "$props"; then sed -i "s|^$k=.*|$kv|" "$props"; else echo "$kv" >> "$props"; fi
  done
}

instalar_cliente() {
  mkdir -p "$MC_DIR/mods"
  # instala Mojang 1.21.4 + Fabric loader sem abrir o jogo
  portablemc --main-dir "$MC_DIR" start --dry "fabric:$MC_VER" >/dev/null 2>&1 ||
    { _log "ERRO: portablemc falhou ao instalar fabric:$MC_VER"; return 1; }
  local proj url sha nome
  for proj in fabric-api customskinloader; do
    IFS=$'\t' read -r url sha nome < <(_modrinth "$proj")
    [ -n "$url" ] || { _log "ERRO: Modrinth sem versão de $proj para $MC_VER"; return 1; }
    # remove versões antigas do mesmo mod antes de baixar a nova
    find "$MC_DIR/mods" -maxdepth 1 -name "${nome%%[-_][0-9]*}*.jar" ! -name "$nome" -delete
    _baixar "$url" "$MC_DIR/mods/$nome" "$sha"
  done
  mkdir -p "$MC_DIR/CustomSkinLoader/LocalSkin/skins"
  escrever_csl_config
  escrever_options
}

# Só LocalSkin: o padrão do CSL consulta Mojang primeiro (um nome que exista lá ganha a skin da conta real)
# e mais 9 sites, o que ainda atrasa ~10 s cada jogador novo.
escrever_csl_config() {
  cat > "$MC_DIR/CustomSkinLoader/CustomSkinLoader.json" <<'EOF'
{
  "version": "15.1",
  "buildNumber": 41,
  "loadlist": [
    {
      "name": "LocalSkin",
      "type": "Legacy",
      "checkPNG": false,
      "skin": "LocalSkin/skins/{USERNAME}.png",
      "model": "auto",
      "cape": "LocalSkin/capes/{USERNAME}.png",
      "elytra": "LocalSkin/elytras/{USERNAME}.png"
    }
  ],
  "enableTransparentSkin": true,
  "forceLoadAllTextures": true,
  "enableCape": false,
  "threadPoolSize": 8,
  "enableLogStdOut": false,
  "cacheExpiry": 0,
  "forceUpdateSkull": false,
  "enableLocalProfileCache": false,
  "enableCacheAutoClean": true,
  "forceDisableCache": true
}
EOF
}

escrever_options() {
  cat > "$MC_DIR/options.txt" <<'EOF'
version:4189
renderDistance:8
simulationDistance:6
graphicsMode:0
maxFps:60
enableVsync:false
guiScale:2
fullscreen:false
overrideWidth:960
overrideHeight:540
pauseOnLostFocus:false
hideGui:false
renderClouds:"false"
entityShadows:false
particles:2
onboardAccessibility:false
tutorialStep:none
skipMultiplayerWarning:true
joinedFirstServer:true
hideBundleTutorial:true
soundCategory_master:0.0
soundCategory_music:0.0
soundCategory_record:0.0
soundCategory_weather:0.0
soundCategory_block:0.0
soundCategory_hostile:0.0
soundCategory_neutral:0.0
soundCategory_player:0.0
soundCategory_ambient:0.0
soundCategory_voice:0.0
EOF
}

iniciar_servidor() {
  (cd "$SRV_DIR" && nohup java -Xmx3G -jar server.jar nogui > "$SRV_DIR/servidor.log" 2>&1 &)
  local i; for i in $(seq 1 120); do grep -q 'Done (' "$SRV_DIR/servidor.log" 2>/dev/null && break; sleep 1; done
  grep -q 'Done (' "$SRV_DIR/servidor.log" && _log "servidor no ar (log $SRV_DIR/servidor.log)"
}

iniciar_cliente() {
  if ! pgrep -f "Xvfb :$DISPLAY_NUM( |$)" >/dev/null; then
    Xvfb ":$DISPLAY_NUM" -screen 0 960x540x24 >/dev/null 2>&1 &
    sleep 2
  fi
  DISPLAY=":$DISPLAY_NUM" LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe nohup \
    portablemc --main-dir "$MC_DIR" start "fabric:$MC_VER" -u Camera \
    --join-server localhost --resolution 960x540 --jvm-arg=-Xmx3G > "$CLIENTE_LOG" 2>&1 &
  _log "cliente iniciando no DISPLAY=:$DISPLAY_NUM (log $CLIENTE_LOG)"
}

# rcon "gamemode spectator Camera" "spectate Bot Camera" ...
rcon() { NODE_PATH="$NODE_DIR/node_modules" node "$SETUP_DIR/rcon.js" "$@"; }

# xdotool no cliente: tecla_cliente F5 | F1 | F3
tecla_cliente() {
  local w; w=$(DISPLAY=":$DISPLAY_NUM" xdotool search --name Minecraft | head -1)
  DISPLAY=":$DISPLAY_NUM" xdotool windowfocus "$w" key --window "$w" "$@"
}

_inicio=$(date +%s)
instalar_dependencias && instalar_servidor && instalar_cliente &&
  _log "setup pronto em $(( $(date +%s) - _inicio ))s — servidor $SRV_DIR, cliente $MC_DIR"

if [ "${1:-}" = "iniciar" ]; then iniciar_cliente; fi

