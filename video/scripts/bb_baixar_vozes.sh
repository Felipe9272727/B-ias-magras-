#!/bin/bash
# Baixa as vozes do Chatterbox geradas no GitHub Actions (branch bb-vozes) para remotion/public/bb/voz/
# (substituem as do Edge com o mesmo id; o eco dos pensamentos é refeito pelo bb_timeline.py).
set -e
D=$(mktemp -d)
git clone -q --depth 1 -b bb-vozes https://github.com/Felipe9272727/B-ias-magras- $D
cp $D/*.mp3 "$(dirname "$0")/../remotion/public/bb/voz/"
echo "$(ls $D/*.mp3 | wc -l) vozes copiadas"; rm -rf $D
