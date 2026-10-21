export LIBGL_ALWAYS_SOFTWARE=1 GALLIUM_DRIVER=llvmpipe
cd /home/user/B-ias-magras-/video/remotion
# espera o render do Claude (órfão da fila2) terminar
while pgrep -f "coletas/ep5_claude.mp4" >/dev/null; do sleep 20; done
echo "OK ep5_claude $(date +%T)"
n=ep5_minimax; out=public/sessenta/coletas/$n.mp4
[ -f $out ] || npx remotion render S60Coleta3D $out --props="{\"arquivo\":\"$n\",\"dados\":null,\"ia\":null}" --gl=angle-egl --concurrency=2 --timeout=180000 --log=error
echo "OK $n $(date +%T)"
# testes: só o fim importa; renderiza do quadro 1200 em diante e completa o começo com preto (mantém o tempo do clipe)
for n in ep1_gpt_luna ep1_gpt_luna_revanche ep1_deepseek_coleta1 ep1_deepseek_coleta2; do
  out=public/sessenta/coletas/$n.mp4; [ -f $out ] && continue
  tmp=/tmp/parcial_$n.mp4
  npx remotion render S60Coleta3D $tmp --frames=1200- --props="{\"arquivo\":\"$n\",\"dados\":null,\"ia\":null}" --gl=angle-egl --concurrency=2 --timeout=180000 --log=error
  ffmpeg -y -loglevel error -i $tmp -vf "tpad=start=1200:start_mode=add:color=black" -c:v libx264 -crf 18 -pix_fmt yuv420p -g 30 $out && rm $tmp
  echo "OK $n $(date +%T)"
done
echo FIM
