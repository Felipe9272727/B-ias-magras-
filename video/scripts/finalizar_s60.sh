set -x
R=/home/user/B-ias-magras-; S=/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad
cd $R
while ps -eo cmd | grep -v grep | grep -q montar_cenas_s60; do sleep 30; done
while ps -eo cmd | grep -v grep | grep -q "remotion render S60Coleta3D"; do sleep 30; done
cp $R/sessenta/timeline_s60_final.json video/remotion/public/timeline_s60.json
python3 video/scripts/build_timeline_s60.py --parcial
cd video/remotion && rm -rf out/bundle_s60b && npx remotion bundle --out-dir=out/bundle_s60b --log=error && rm -rf out/bundle_s60b/public && ln -s ../../public out/bundle_s60b/public && cd $R
python3 video/scripts/montar_cenas_s60.py $R/video/remotion/out/bundle_s60b $R/video/remotion/out/sessenta_sem_mix.mp4 || python3 video/scripts/montar_cenas_s60.py $R/video/remotion/out/bundle_s60b $R/video/remotion/out/sessenta_sem_mix.mp4
cd video/scripts && python3 mix_audio.py ../remotion/out/sessenta_sem_mix.mp4 ../remotion/out/sessenta_mix.mp4 --timeline ../remotion/public/timeline_s60.json --roteiro roteiro_s60 && cd $R
python3 video/scripts/pelicula_s60.py video/remotion/out/sessenta_mix.mp4 video/remotion/out/sessenta_final.mp4
git add -A video sessenta && git commit -qm "60s: vídeo final montado e mixado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Woq95yLbPN57ZkuGg4Yt9F"
for i in 1 2 3 4; do git push -u origin claude/video-3 && break; sleep $((2**i)); done
echo FINALIZADO $(date +%T)
