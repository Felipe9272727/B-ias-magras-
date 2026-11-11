#!/bin/bash
# Roda UM competidor do início ao fim, numa sessão própria (mesma máquina para os três).
# Uso: CHAVE_ROM=... bash pokemon/rodar_competidor.sh <claude|gemini|gpt> <etapa>
#   etapa=preparar : instala o mGBA 0.10.3 + dependências e decifra a ROM
#   etapa=treinar  : treina em blocos de até 1 h (o código retoma do ./checkpoint), até somar TREINO_TOTAL_S (3 h)
#   etapa=jogar    : partida final gravada (GRAVAR) + vídeo da partida + entrega no branch pokemon-resultado-<ia>
set -e
IA=$1; ETAPA=$2
RAIZ=$(cd "$(dirname "$0")/.." && pwd)
DIR=$RAIZ/pokemon/corrida/$IA; mkdir -p "$DIR"
export POKEMON_ROM=$RAIZ/pokemon/rom/pokemon_firered.gba
export PYTHONPATH=$(ls -d /opt/mgba/build/python/lib.* 2>/dev/null):$RAIZ/pokemon
TOTAL=${TREINO_TOTAL_S:-10800}
case $ETAPA in
preparar)
  bash "$RAIZ/pokemon/instalar_mgba.sh"
  export PYTHONPATH=$(ls -d /opt/mgba/build/python/lib.*):$RAIZ/pokemon
  [ "$IA" = gemini ] && pip install -q torch --index-url https://download.pytorch.org/whl/cpu
  pip install -q -r "$RAIZ/pokemon/$IA/requirements.txt" 2>/dev/null || true
  mkdir -p "$RAIZ/pokemon/rom"
  git -C "$RAIZ" fetch -q origin pokemon-rom-cifrada
  git -C "$RAIZ" show origin/pokemon-rom-cifrada:rom.enc | openssl enc -d -aes-256-cbc -pbkdf2 -pass env:CHAVE_ROM -out "$POKEMON_ROM"
  echo "e26ee0d44e809351c8ce2d73c7400cdd  $POKEMON_ROM" | md5sum -c -
  python3 -c "from ambiente_firered import FireRed; print('ambiente ok', FireRed().info())"
  nproc; free -g | head -2
  ;;
treinar)
  cd "$DIR"
  FEITO=$(cat treino_segundos 2>/dev/null || echo 0)
  while [ "$FEITO" -lt "$TOTAL" ]; do
    BLOCO=$(( TOTAL - FEITO )); [ $BLOCO -gt 3500 ] && BLOCO=3500
    T0=$(date +%s)
    TEMPO_LIMITE_S=$BLOCO python3 "$RAIZ/pokemon/$IA/agente.py" treinar >> treino.log 2>&1 || echo "bloco saiu com erro $?" >> treino.log
    FEITO=$(( FEITO + $(date +%s) - T0 )); echo $FEITO > treino_segundos
    echo "$(date -u +%T) treino $FEITO/$TOTAL s" >> progresso.txt
  done
  echo TREINO_FEITO >> progresso.txt
  ;;
jogar)
  cd "$DIR"
  rm -rf partida && mkdir partida && cd partida
  ln -sfn ../checkpoint checkpoint
  GRAVAR_CADA=8 GRAVAR=$DIR/partida/gravacao python3 "$RAIZ/pokemon/$IA/agente.py" jogar > jogar.log 2>&1 || echo "jogar saiu com erro $?" >> jogar.log
  ffmpeg -v error -y -framerate 30 -pattern_type glob -i 'gravacao/quadros/*.png' -vf scale=480:320:flags=neighbor -c:v libx264 -crf 20 -pix_fmt yuv420p partida_$IA.mp4 || true
  gzip -kf gravacao/trajeto.jsonl
  B=pokemon-resultado-$IA; T=$(mktemp -d)
  cp log.jsonl jogar.log gravacao/trajeto.jsonl.gz "$DIR/treino.log" "$DIR/progresso.txt" "$T"/ 2>/dev/null || true
  (cd "$T" && git init -q && git checkout -q -b $B && git add -A && git -c user.name=pokemon -c user.email=p@l commit -qm "resultado $IA" && git push -q -f "$(git -C "$RAIZ" remote get-url origin)" $B)
  R=$(curl -s -F "file=@partida_$IA.mp4" https://store1.gofile.io/contents/uploadfile); echo "$R" | grep -o '"downloadPage":"[^"]*"' | tee -a "$DIR/progresso.txt"
  echo PARTIDA_FEITA >> "$DIR/progresso.txt"
  ;;
esac
