#!/usr/bin/env bash
# Liga o servidor (se não estiver ligado) e continua a partida de onde parou. Uso: bash retomar.sh <nome da gravação> [minutos]
cd "$(dirname "$0")"
if ! (exec 3<>/dev/tcp/127.0.0.1/25575) 2>/dev/null; then
  (cd servidor && nohup java -Xms2G -Xmx4G -jar server.jar nogui >> ../servidor.log 2>&1 &)
  for i in $(seq 1 90); do (exec 3<>/dev/tcp/127.0.0.1/25575) 2>/dev/null && break; sleep 2; done
fi
IA_DIRETO=1 SONNET_EFFORT=low RETOMAR=1 NOME_GRAVACAO="$1" node partida.mjs "${2:-180}" >> "partida_$1.log" 2>&1
