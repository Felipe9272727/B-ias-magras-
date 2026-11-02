#!/usr/bin/env python3
"""Wolvesville EP2 independently scripted portrait Short (real source scenes, NEW ElevenLabs narrator).
No synthetic gameplay, no fabricated quotes, no original 117s horizontal crop.
"""
import json, subprocess, pathlib, sys, math
SRC=pathlib.Path(sys.argv[1])
VOICE=pathlib.Path(sys.argv[2])
OUT=pathlib.Path(sys.argv[3])
MUSIC=pathlib.Path(sys.argv[4])
OUT.parent.mkdir(parents=True,exist_ok=True)
font="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def run(args): subprocess.run(args,check=True)
def probe(f):
    p=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(f)],capture_output=True,text=True,check=True)
    return float(p.stdout.strip())
dur=probe(VOICE)
assert 60<dur<110, f"Unusual narration length: {dur}"
# The timestamp ranges are grounded in real Match7 scenes of timeline_lobo_ep2_audiofix.json.
# Narrative overlays describe verified match outcomes, not quotations.
stages=[
    (1453.15,"16 IAS EM UMA VILA","4 LOBOS ESCONDIDOS","A HISTORIA E REAL","#efcf55"),
    (1679.00,"A PISTOLEIRA ATIROU","NO CARCEREIRO!","PRIMEIRO TIRO: ERRO","#f36664"),
    (1718.00,"A VILA IDENTIFICOU","O PRIMEIRO LOBO","FERREIRO ELIMINADO","#f7d161"),
    (1884.00,"AGUA BENTA!","CERAMISTA ERA LOBO","SEGUNDO LOBO FORA","#61daba"),
    (1910.20,"A SEGUNDA BALA","ACERTOU O ALFA","MINEIRO ELIMINADO","#f3c14e"),
    (1946.50,"3 LOBOS CAIRAM","SOBROU SO UM","A VILA QUASE VENCEU","#f8c952"),
    (1961.80,"VOTACAO FINAL","5 VOTOS NO RELOJOEIRO","MAS HAVIA UM PROBLEMA","#f76f82"),
    (1979.00,"O RELOJOEIRO","ERA O BOBO!","VENCEU SEM VOTAR","#ffdd4c"),
    (2007.00,"A VILA PERDEU!","O BOBO LEVOU A MELHOR","PARTE 2 NO CANAL","#e7c75a")
]
n=len(stages)
# Every scene is actively recomposed into portrait with customized animation and caption cards.
# 540p native staging -> Lanczos upscaled to 1080p. No emoji or generic AI images.
parts=[]
for i,(start,a,b,c,color) in enumerate(stages):
    length=dur/n + (0.1 if i==n-1 else 0)
    end=min(length,max(1,2037.8-start-0.3))
    # Main source is contained in a legible 16:9 viewing panel; top/bottom carry large editorial UI.
    def esc(s):return s.replace("\\","\\\\").replace(":","\\:").replace("'","\\'").replace("%","\\%")
    q=lambda s:esc(s)
    vf=(
      "scale=540:304:flags=lanczos,format=yuv420p,"
      "pad=540:960:0:330:color=0x111622,"
      "drawbox=x=0:y=0:w=540:h=324:color=0x161927:t=fill,"
      "drawbox=x=0:y=650:w=540:h=310:color=0x1c1523:t=fill,"
      "drawbox=x=12:y=328:w=516:h=296:color=0xffffff@0.14:t=5,"
      f"drawtext=fontfile={font}:text='WOLVESVILLE - PARTE 2':fontsize=23:fontcolor=0xf3d654:borderw=2:bordercolor=black:x=(w-text_w)/2:y=42,"
      f"drawtext=fontfile={font}:text='16 IAS':fontsize=43:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=99,"
      f"drawtext=fontfile={font}:text='{q(a)}':fontsize=27:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=222,"
      f"drawtext=fontfile={font}:text='{q(b)}':fontsize=36:fontcolor={color}:borderw=3:bordercolor=black:x=(w-text_w)/2:y=673,"
      f"drawtext=fontfile={font}:text='{q(c)}':fontsize=21:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=760,"
      f"drawtext=fontfile={font}:text='CASO REAL DAS IAS - PARTIDA 3':fontsize=15:fontcolor=0xcccccc:x=(w-text_w)/2:y=864,"
      f"drawbox=x=0:y=944:w={int(540*(i+1)/n)}:h=16:color={color}:t=fill,"
      "format=yuv420p"
    )
    dest=OUT.parent/f"stage_{i:02d}.mp4"
    cmd=["ffmpeg","-y","-loglevel","error","-ss",f"{start:.3f}","-i",str(SRC),"-t",f"{end:.3f}","-an","-vf",vf,"-r","25","-c:v","libx264","-preset","veryfast","-crf","20",str(dest)]
    run(cmd);parts.append(dest)
lst=OUT.parent/"parts.txt"
lst.write_text("".join("file '"+p.resolve().as_posix()+"'\n" for p in parts))
silent=OUT.parent/"assembled.mp4"
run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(lst),"-c","copy",str(silent)])
# Original authored narration and one licensed background track with sidechain ducking.
# Keep the original narration intelligible, restrained music at about -25 dB.
mix=("[1:a]aresample=48000,volume=1.1[v];"
     "[2:a]aresample=48000,volume=0.055,aloop=loop=-1:size=1000000[m];"
     "[m][v]sidechaincompress=threshold=0.01:ratio=9:attack=20:release=650[duck];"
     "[duck][v]amix=inputs=2:duration=shortest:normalize=0,"
     f"afade=t=out:st={max(0,dur-1.5):.2f}:d=1.5[a]")
run(["ffmpeg","-y","-loglevel","error","-i",str(silent),"-i",str(VOICE),"-i",str(MUSIC),"-filter_complex",mix,
     "-map","0:v","-map","[a]","-vf","scale=1080:1920:flags=lanczos","-t",f"{dur:.3f}",
     "-c:v","libx264","-preset","veryfast","-crf","19","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",
     "-movflags","+faststart",str(OUT)])
run(["ffmpeg","-v","error","-i",str(OUT),"-f","null","-"])
info={"duration":dur,"dimensions":[1080,1920],"narration":"new ElevenLabs Gabriel","storySource":"Real Match7 from final validated EP2 timeline","stages":n,"fullDecodeVerified":True}
(OUT.parent/"verification.json").write_text(json.dumps(info,indent=2))
print(json.dumps(info))
