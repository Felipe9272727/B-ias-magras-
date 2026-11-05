#!/usr/bin/env bash
# Ponte pelo git entre o Claude e o Codespace: a cada 10 s olha o branch "roblox-cmd" (arquivo cmd.sh com um id na
# primeira linha); se o id mudou, executa e manda a saída (e tudo que estiver em /tmp/roblox_status) para "roblox-status".
# Rodar uma vez no terminal do Codespace:  nohup setsid bash roblox/ponte.sh > /tmp/ponte.log 2>&1 &
cd "$(dirname "$0")/.."
URL=$(git remote get-url origin)
ST=/tmp/roblox_status; mkdir -p $ST
ULT=""
envia() {
  D=/tmp/roblox_push; rm -rf $D; mkdir -p $D; cp -r $ST/. $D/ 2>/dev/null
  (cd $D && git init -q && git checkout -q -b roblox-status && git add -A && git -c user.name=roblox -c user.email=roblox@local commit -qm "status $(date -u +%H:%M:%S)" && git push -q -f "$URL" roblox-status)
}
echo "ponte ligada $(date -u)" > $ST/ponte.txt; envia
while true; do
  C=/tmp/roblox_cmd; rm -rf $C
  if git clone -q --depth 1 -b roblox-cmd "$URL" $C 2>/dev/null; then
    ID=$(head -1 $C/cmd.sh)
    if [ "$ID" != "$ULT" ]; then
      ULT=$ID
      echo "== $ID $(date -u)" > $ST/saida.txt
      timeout 900 bash $C/cmd.sh >> $ST/saida.txt 2>&1
      echo "== fim $? $(date -u)" >> $ST/saida.txt
      envia
    fi
  fi
  sleep 10
done
