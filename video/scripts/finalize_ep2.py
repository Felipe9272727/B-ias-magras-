"""Finish the actual render, mix, upscale and decode verification without replaying gameplay."""
import datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT=Path(__file__).resolve().parents[2]
REC=ROOT/'lobisomem/recovery'
OUT=ROOT/'video/remotion/out'
STATUS=REC/'finalization_runtime.json'
TIMELINE=ROOT/'video/remotion/public/timeline_lobo_ep2.json'

def update(stage,**extra):
    value={'pid':os.getpid(),'stage':stage,'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),**extra}
    temp=STATUS.with_suffix('.tmp');temp.write_text(json.dumps(value,indent=2));temp.replace(STATUS)
    print(json.dumps(value),flush=True)

def alive(pid):
    try:return Path(f'/proc/{pid}/stat').read_text().split()[2]!='Z'
    except FileNotFoundError:return False

def main():
    if STATUS.exists():
        prior=json.loads(STATUS.read_text())
        if alive(prior['pid']):raise RuntimeError('Another finalizer is active')
        if prior['stage']=='mechanically_verified_awaiting_editorial_review':return
    render=json.loads((REC/'render_runtime.json').read_text())
    raw=Path(render['output']);mixed=OUT/'wolvesville_ep2_mix_540.mp4';final=OUT/'wolvesville_ep2_1080p.mp4'
    if final.exists():raise RuntimeError('Existing final export: inspect instead of overwriting')
    update('waiting_for_actual_render',renderPid=render['pid'],raw=str(raw))
    while alive(render['pid']):time.sleep(10)
    if not raw.exists():raise RuntimeError('Render stopped without an output; inspect its log')
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(raw)]))
    expected=json.loads(TIMELINE.read_text())['durationInFrames']/30
    if abs(float(probe['format']['duration'])-expected)>1:raise RuntimeError('Raw render is incomplete')
    assert any(s['codec_type']=='audio' for s in probe['streams'])
    update('mixing_original_music',raw=str(raw),mixed=str(mixed))
    subprocess.run([sys.executable,str(ROOT/'video/scripts/mix_audio.py'),str(raw),str(mixed),'--timeline',str(TIMELINE),'--roteiro','roteiro_lobo_ep2'],check=True,cwd=ROOT)
    update('upscaling_lanczos_1080p',mixed=str(mixed),final=str(final))
    temporary=final.with_name('wolvesville_ep2_1080p.rendering.mp4')
    subprocess.run(['ffmpeg','-y','-loglevel','warning','-i',str(mixed),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','veryfast','-crf','18','-threads','3','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','-progress','pipe:1',str(temporary)],check=True)
    temporary.replace(final)
    update('verifying_complete_audio_and_video',final=str(final))
    report=REC/'verified_export_ep2.json'
    subprocess.run([sys.executable,str(ROOT/'video/scripts/verify_wolvesville_ep2.py'),str(final),'--timeline',str(TIMELINE),'--report',str(report),'--decode'],check=True,cwd=ROOT)
    update('mechanically_verified_awaiting_editorial_review',final=str(final),report=str(report))

if __name__=='__main__':
    try:main()
    except Exception as error:
        update('failed',error=str(error));raise
