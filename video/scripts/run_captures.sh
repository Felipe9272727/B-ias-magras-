#!/usr/bin/env bash
# Executa as gravações canônicas em duas filas paralelas.
cd "$(dirname "$0")"
L=../data/logs
( node capture.mjs evolution > $L/cap_evolution.log 2>&1; node capture.mjs ddqn > $L/cap_ddqn.log 2>&1; node capture.mjs extras > $L/cap_extras.log 2>&1 ) &
( node capture.mjs adaptive > $L/cap_adaptive.log 2>&1; node capture.mjs rainbow > $L/cap_rainbow.log 2>&1 ) &
wait
echo ALL_DONE
