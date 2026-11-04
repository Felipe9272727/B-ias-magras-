#!/bin/bash
# sobe o 0 A.D. sem imagem com a interface de RL (precisa rodar como usuário comum: zad)
pkill -u zad pyrogenesis 2>/dev/null; sleep 1
cp /home/user/B-ias-magras-/age/arcadia.json /home/zad/w/ 2>/dev/null
su zad -s /bin/bash -c 'cd /home/zad/w; setsid nohup /usr/games/pyrogenesis -mod=public -autostart="scenarios/arcadia" -autostart-nonvisual -rl-interface=127.0.0.1:6000 > pyro.log 2>&1 < /dev/null &'
for i in $(seq 60); do grep -q "RL interface listening" /home/zad/w/pyro.log 2>/dev/null && { echo pronto; exit 0; }; sleep 1; done; echo FALHOU; exit 1
