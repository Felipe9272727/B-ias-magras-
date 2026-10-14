#!/usr/bin/env bash
# Roda (ou refaz do zero, se foi interrompida) a partida 4 da temporada: Claude Opus de impostor com o manual.
cd "$(dirname "$0")"
grep -q '"memoria"' logs2/partida4.json 2>/dev/null && { echo PARTIDA4_PRONTA; exit 0; }
node jogo2.mjs --temporada logs2/temporada.json --partida 4 --max-tiques 70 > logs2/partida4.txt 2>&1
echo PARTIDA4_PRONTA
