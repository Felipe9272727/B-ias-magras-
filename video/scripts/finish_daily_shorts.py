#!/usr/bin/env python3
"""Valida e normaliza os quatro renders dos Shorts. Não usa nenhuma API."""
import argparse
import json
import subprocess
from pathlib import Path

FILES = [
    ('01-render.mp4', '01-ia-pega-no-flagra.mp4', 670),
    ('02-render.mp4', '02-ia-simula-o-pulo.mp4', 649),
    ('03-render.mp4', '03-impostor-engana-o-parceiro.mp4', 774),
    ('04-render.mp4', '04-tres-ias-travadas-no-mario.mp4', 1006),
]


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path),
    ]))


def validate(path, frames):
    info = probe(path)
    video = next(s for s in info['streams'] if s['codec_type'] == 'video')
    if (video['width'], video['height'], video['r_frame_rate']) != (1080, 1920, '30/1'):
        raise ValueError(f'{path.name}: formato inesperado')
    if int(video['nb_frames']) != frames:
        raise ValueError(f'{path.name}: render incompleto')
    if not any(s['codec_type'] == 'audio' for s in info['streams']):
        raise ValueError(f'{path.name}: áudio ausente')
    return info


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', nargs='?', type=Path,
                        default=Path(__file__).resolve().parents[1] / 'remotion/out/shorts')
    args = parser.parse_args()
    # Confere o lote antes de escrever: falhas de render não viram um MP4 final silencioso.
    for src, _, frames in FILES:
        validate(args.directory / src, frames)
    results = []
    for src, dst, frames in FILES:
        source, target = args.directory / src, args.directory / dst
        analysis = subprocess.run([
            'ffmpeg', '-hide_banner', '-nostdin', '-i', str(source), '-vn',
            '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-',
        ], capture_output=True, text=True, check=True)
        log = analysis.stderr
        stats = json.loads(log[log.rfind('{'):log.rfind('}') + 1])
        if stats['input_i'] == '-inf':
            raise ValueError(f'{source.name}: áudio em silêncio')
        filt = ('loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:'
                f"measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:"
                f"measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:"
                f"offset={stats['target_offset']}")
        subprocess.run([
            'ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(source),
            '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-af', filt,
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', str(target),
        ], check=True)
        info = validate(target, frames)
        results.append({'file': dst, 'frames': frames, 'duration': float(info['format']['duration']),
                        'bytes': target.stat().st_size, 'input_lufs': stats['input_i']})
        print(f'{dst}: {frames / 30:.2f}s · 1080x1920 · áudio normalizado')
    (args.directory / 'verificacao.json').write_text(json.dumps(results, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
