"""Attach the finished AAC soundtrack without changing packets or its start time.

python mux_minecraft_audio.py SILENT_VIDEO FINISHED_AUDIO OUTPUT
The video has already been decoded and validated by the distributed merge.
The soundtrack may be the existing mixer output or the retained reference AAC.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries',
        'format=duration:stream=codec_type,codec_name,width,height,start_time,duration,nb_frames',
        '-of', 'json', str(path)]))


def packet_hash(path, kind):
    return subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-map', f'0:{kind}:0',
        '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-'], text=True).strip()


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('silent_video', type=Path)
    parser.add_argument('original_audio', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--expected-frames', type=int, default=55425)
    args = parser.parse_args()
    video, audio, output = (p.resolve() for p in (args.silent_video, args.original_audio, args.output))
    if output in (video, audio):
        raise ValueError('Output must be separate from both source files')
    video_info, audio_info = probe(video), probe(audio)
    v = next(s for s in video_info['streams'] if s['codec_type'] == 'video')
    a = next(s for s in audio_info['streams'] if s['codec_type'] == 'audio')
    if int(v['nb_frames']) != args.expected_frames:
        raise ValueError('Silent video frame count does not match the approved montage')
    if a['codec_name'] != 'aac':
        raise ValueError('Expected a finished AAC soundtrack')
    if abs(float(v['duration']) - float(a['duration'])) > .1:
        raise ValueError('Audio and video do not cover the same full montage')
    expected_audio = packet_hash(audio, 'a')
    expected_video = packet_hash(video, 'v')
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.stem + '.partial.mp4')
    subprocess.run([
        'ffmpeg', '-y', '-v', 'error', '-copyts', '-i', str(video), '-i', str(audio),
        '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-avoid_negative_ts', 'disabled',
        '-movflags', '+faststart', str(temporary)], check=True)
    with temporary.open('rb+') as stream:
        os.fsync(stream.fileno())
    final_info = probe(temporary)
    final_video = next(s for s in final_info['streams'] if s['codec_type'] == 'video')
    final_audio = next(s for s in final_info['streams'] if s['codec_type'] == 'audio')
    if int(final_video['nb_frames']) != args.expected_frames:
        raise ValueError('Output video frame count changed')
    if int(final_audio['nb_frames']) != int(a['nb_frames']):
        raise ValueError('Original audio packets were lost')
    if abs(float(final_audio['start_time']) - float(a['start_time'])) > .0001:
        raise ValueError('Original audio offset changed')
    if packet_hash(temporary, 'a') != expected_audio or packet_hash(temporary, 'v') != expected_video:
        raise ValueError('Stream packet bytes changed during mux')
    temporary.replace(output)
    report = {'video_frames': args.expected_frames, 'audio_packets': int(a['nb_frames']),
              'audio_start_time': a['start_time'], 'audio_packet_sha256': expected_audio,
              'video_packet_sha256': expected_video, 'audio_reencoded': False,
              'video_reencoded': False, 'bytes': output.stat().st_size}
    output.with_suffix('.validation.json').write_text(json.dumps(report, indent=2) + '\n')
    print('Validated original-audio mux:', output, flush=True)


if __name__ == '__main__':
    main()
