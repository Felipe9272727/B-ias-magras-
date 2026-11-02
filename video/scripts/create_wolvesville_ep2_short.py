#!/usr/bin/env python3
"""Verified Wolvesville EP2 vertical Short from the finished native MP4.
This is an editorial excerpt, not regenerated gameplay. Keeps original narration/audio.
"""
from pathlib import Path
import subprocess, sys
src=Path(sys.argv[1]); out=Path(sys.argv[2])
assert src.is_file(), f"Missing source MP4: {src}"
out.parent.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
start=1908.0  # 31:48, before the last bullet
duration=117.0 # to 33:45, through result and invitation
def t(s): return s.replace('\\','\\\\').replace(':','\\:').replace("'", "\\'").replace('%','\\%')
filters=[
'[0:v]split=2[bg][fg]',
'[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:12,eq=brightness=-0.45[back]',
'[fg]scale=1080:-2,setsar=1[main]',
'[back][main]overlay=0:570[base]',
'[base]drawbox=x=0:y=0:w=1080:h=495:color=0x100d1e@0.90:t=fill[a]',
'[a]drawbox=x=0:y=1205:w=1080:h=715:color=0x130f21@0.94:t=fill[b]',
'[b]drawtext=fontfile='+font+":text='16 IAs NO LOBISOMEM':fontsize=69:fontcolor=white:borderw=6:bordercolor=black:x=(w-text_w)/2:y=105[c]",
'[c]drawtext=fontfile='+font+":text='PARTE 2':fontsize=64:fontcolor=0xffce3b:borderw=5:bordercolor=black:x=(w-text_w)/2:y=212[d]",
'[d]drawtext=fontfile='+font+":text='A VILA ACHOU QUE VENCEU...':fontsize=43:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=364[e]",
'[e]drawtext=fontfile='+font+":text='JOGADAS REAIS DAS IAs':fontsize=30:fontcolor=0xf5d863:borderw=3:bordercolor=black:x=(w-text_w)/2:y=1320[f]",
]
cues=[
(0,16,"UMA BALA RESTANTE","E UM LOBO ALFA..."),
(16,45,"3 LOBOS ELIMINADOS","A VILA ESTAVA GANHANDO"),
(45,68,"MAS A ULTIMA VOTACAO","MUDOU TUDO"),
(68,89,"O RELOJOEIRO ERA...","O BOBO!"),
(89,117,"O BOBO VENCEU","SEM VOTAR"),
]
prev='f'
for i,(a,b,top,bot) in enumerate(cues):
    for j,txt in enumerate([top,bot]):
        tag=f'x{i}_{j}'
        y=1418+j*118
        enable=f"between(t\\,{a}\\,{b})"
        color='0xffd23c' if j==1 else 'white'
        filters.append(f"[{prev}]drawtext=fontfile={font}:text='{t(txt)}':fontsize={65 if j==0 else 73}:fontcolor={color}:borderw=6:bordercolor=black:x=(w-text_w)/2:y={y}:enable='{enable}'[{tag}]")
        prev=tag
filters.append(f'[{prev}]format=yuv420p[v]')
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(src),'-t',str(duration),
'-filter_complex',';'.join(filters),'-map','[v]','-map','0:a:0','-r','30','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p',
'-c:a','aac','-b:a','160k','-af',f'afade=t=in:st=0:d=0.35,afade=t=out:st={duration-1.5}:d=1.5','-movflags','+faststart',str(out)]
subprocess.run(cmd,check=True)
p=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_type,width,height','-of','json',str(out)],capture_output=True,text=True,check=True)
print(p.stdout)
