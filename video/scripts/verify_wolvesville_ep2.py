"""Verify the actual exported episode before reporting a completed render."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'video/remotion/public'


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('video', type=Path)
    parser.add_argument('--timeline', type=Path, default=PUBLIC / 'timeline_lobo_ep2.json')
    parser.add_argument('--report', type=Path)
    parser.add_argument('--decode', action='store_true', help='Decode every audio/video packet, failing on errors')
    args = parser.parse_args()
    if not args.video.is_file() or args.video.stat().st_size == 0:
        raise RuntimeError('Actual video export is missing or empty')
    timeline = json.loads(args.timeline.read_text())
    ids = timeline['data']['actualMatchIds']
    if len(ids) != 3 or set(map(int, ids)) != {5, 6, 7}:
        raise RuntimeError('Episode must contain exactly Matches 5, 6 and 7')
    matches = []
    for number in (5, 6, 7):
        file = ROOT / f'lobisomem/logs_ep2/partida{number}.json'
        match = json.loads(file.read_text())
        journal = json.loads((file.parent / f'execucao{number}/decisoes.json').read_text())
        if match.get('synthetic') or not match.get('resultado') or len(match.get('reflexoes', {})) != 16:
            raise RuntimeError(f'Match {number} lacks actual gameplay or all 16 reflections')
        if journal.get('status') != 'completed' or any(not d.get('resposta') for d in journal['decisoes']):
            raise RuntimeError(f'Match {number} journal is incomplete')
        for migration in journal.get('identityMigrations', []):
            archived = ROOT / migration['archivedJournal']
            if sha256(archived) != migration['originalJournalSha256']:
                raise RuntimeError('Original archived journal changed')
            original = json.loads(archived.read_text())
            for before, after in zip(original['decisoes'], journal['decisoes']):
                if before.get('resposta'):
                    if before != after:
                        raise RuntimeError('An existing actual decision was replaced during continuation')
                elif any(before[k] != after[k] for k in ('i', 'id', 'pedido')):
                    raise RuntimeError('An existing pending request changed during continuation')
            if len(journal['decisoes']) < len(original['decisoes']):
                raise RuntimeError('Original decisions were removed during continuation')
            if journal['identidade']['semente'] != original['identidade']['semente']:
                raise RuntimeError('Original seed changed during continuation')
        for decision in journal['decisoes']:
            answer = decision['resposta']
            if not answer.get('ok') or not answer.get('text', '').strip():
                raise RuntimeError('Missing actual AI decision')
            if answer.get('model', '').startswith('openai/'):
                if answer.get('source') != 'chatgpt-work-subagent' or not answer.get('agentId') or answer.get('generationId'):
                    raise RuntimeError('OpenAI decision lacks actual Work provenance')
        matches.append({'match': number, 'sha256': sha256(file), 'decisions': len(journal['decisoes']), 'reflections': 16})
    if matches[0]['sha256'] != '8f503af30b637a1fcdf2efa8a5409dc7ffa45557e538f21b2212e7ee1af81cc8':
        raise RuntimeError('Completed Match 5 was modified')
    opening = json.loads((PUBLIC / 'voice_lobo_ep2/abertura.source.json').read_text())
    if sha256(PUBLIC / 'voice_lobo_ep2/abertura.mp3') != opening['audioSha256']:
        raise RuntimeError('Recovered original opening audio changed')
    opening_scenes = [s for s in timeline['scenes'] if s['visual'].get('name') == 'EP2AberturaRecuperada']
    if len(opening_scenes) != 1:
        raise RuntimeError('Timeline must include the recovered opening exactly once')
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(args.video)]))
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    audio = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
    duration = float(probe['format']['duration'])
    if not 1500 <= duration <= 2100:
        raise RuntimeError(f'Export duration {duration:.3f}s is outside the 25–35 minute target')
    if (video['width'], video['height']) != (1920, 1080):
        raise RuntimeError('Final export must be 1080p')
    expected = timeline['durationInFrames'] / timeline['fps']
    if abs(duration - expected) > 1:
        raise RuntimeError('Actual export duration differs from the edited timeline')
    if abs(float(video.get('duration', duration)) - float(audio.get('duration', duration))) > 1:
        raise RuntimeError('Audio and video lengths differ')
    if args.decode:
        subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(args.video), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], check=True)
    report = {'verifiedActualExport': True, 'video': str(args.video.resolve()), 'durationSeconds': duration, 'dimensions': [video['width'], video['height']], 'videoCodec': video['codec_name'], 'audioCodec': audio['codec_name'], 'bytes': args.video.stat().st_size, 'sha256': sha256(args.video), 'fullDecodeVerified': args.decode, 'matches': matches, 'originalOpeningAudioSha256': opening['audioSha256'], 'timelineSha256': sha256(args.timeline)}
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
