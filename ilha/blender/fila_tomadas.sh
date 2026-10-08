#!/usr/bin/env bash
# Renderiza as tomadas da ilha em sequência (retomável: pula quadros já feitos).
cd "$(dirname "$0")/../.."
for t in praia plataformas aerea; do
  xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/tomadas.py -- $t render /home/user/B-ias-magras-/ilha/render/$t
done
echo FILA_PRONTA
