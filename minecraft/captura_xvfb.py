"""Grava o framebuffer XWD do nosso Xvfb sem depender de MIT-SHM."""
import sys, mmap, struct, time, subprocess, select
from pathlib import Path

screen, fps, seconds, output=sys.argv[1:]
fps=float(fps); seconds=float(seconds)
with Path(screen).open('rb') as f:
    h=struct.unpack('>25I',f.read(100))
    header, version, _, _, width, height, _, order, _, _, _, bpp, stride, _, red, green, blue, _, _, colors, *_=h
    if version!=7 or order!=0 or bpp!=32 or (red,green,blue)!=(0xff0000,0xff00,0xff):
        raise RuntimeError('Formato XWD não suportado')
    offset=header+colors*12
    data=mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ)
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pixel_format','bgr0','-video_size',f'{width}x{height}','-framerate',str(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','1','-preset','ultrafast','-crf','14','-pix_fmt','yuv420p',output],stdin=subprocess.PIPE)
    began=time.monotonic(); frames=0
    try:
        for i in range(round(seconds*fps)):
            if select.select([sys.stdin],[],[],0)[0] and 'q' in sys.stdin.read(1):break
            wait=began+i/fps-time.monotonic()
            if wait>0:time.sleep(wait)
            if stride==width*4:raw=data[offset:offset+stride*height]
            else:raw=b''.join(data[offset+y*stride:offset+y*stride+width*4] for y in range(height))
            ff.stdin.write(raw);frames+=1
    finally:
        ff.stdin.close()
        try:code=ff.wait(timeout=15)
        except subprocess.TimeoutExpired:ff.kill();code=ff.wait()
        data.close()
    print(f'Captura: {frames} quadros em {time.monotonic()-began:.2f}s',flush=True)
    sys.exit(code)
