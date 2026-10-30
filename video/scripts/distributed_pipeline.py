"""Plan, approve and validate isolated Minecraft capture jobs; no Git writes."""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
PROFILE = ROOT / 'video/scripts/distributed_capture_profile.json'


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def stable_hash(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def capture_sources():
    names = ['minecraft/reencena.mjs', 'minecraft/trajetoria.mjs', 'minecraft/rcon.mjs',
             'minecraft/reencena_dados.mjs', 'minecraft/captura_xvfb.py', 'minecraft/extras/10_anim.mjs',
             'minecraft/package-lock.json', 'minecraft/cliente-replay/build.py',
             'video/scripts/distributed_worker.py', 'video/scripts/distributed_client_setup.sh']
    files = [ROOT / name for name in names]
    files += list((ROOT / 'minecraft/cliente-replay/src').rglob('*.java'))
    files += list((ROOT / 'minecraft/cliente-replay/resources').glob('*.json'))
    return {str(p.relative_to(ROOT)): digest(p) for p in sorted(files)}


def capture_configuration(profile):
    return {key: copy.deepcopy(profile[key]) for key in ('minecraft_version', 'fabric_loader', 'capture_env', 'capture_command')}


def verify(profile):
    if not profile.get('approved') or not all(profile.get('visual_review', {}).get(k) for k in
        ('empty_hand_visible', 'held_item_visible', 'frame_pacing_verified')):
        raise ValueError('Native capture profile needs visual approval before fan-out')
    sources = capture_sources()
    if sources != profile.get('source_sha256'):
        raise ValueError('Capture sources changed after approval; repeat smoke review and approve')
    settings = capture_configuration(profile)
    if settings != profile.get('approved_settings'):
        raise ValueError('Capture settings changed after approval; repeat smoke review and approve')
    return stable_hash({'sources': sources, 'settings': settings})


def windows(path):
    result = []
    for line in Path(path).read_text().splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        row = line.split()
        if len(row) != 4 or float(row[2]) <= float(row[1]):
            raise ValueError('Invalid scene window: ' + line)
        result.append(row)
    if len({r[0] for r in result}) != len(result):
        raise ValueError('Duplicate scene IDs')
    return result


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def plan(args):
    profile = json.loads(PROFILE.read_text())
    native_hash = verify(profile)
    mode = args.mode or profile.get('launch_mode', 'preview')
    if mode not in ('preview', 'full'):
        raise ValueError('mode must be preview or full')
    rows = windows(ROOT / 'video/remotion/public/mc/video/janelas.txt')
    ids = [r[0] for r in rows]
    requested = [x.strip() for x in args.scenes.split(',') if x.strip()]
    if requested and (len(set(requested)) != len(requested) or set(requested) - set(ids)):
        raise ValueError('Unknown or duplicate scene filter')
    selected = set(requested or (['nasc_deepseek', 'deepseek_pedra', 'nasc_claude_gpt'] if mode == 'preview' else ids))
    rows = [r for r in rows if r[0] in selected]
    if not rows:
        raise ValueError('No scenes selected')
    count = min(len(rows), max(1, min(16, int(args.workers or profile.get('workers', 8))))) if mode == 'full' else 1
    groups = [[] for _ in range(count)]
    loads = [0.0] * count
    slow = float(profile['capture_env'].get('LENTO', '2'))
    for row in sorted(rows, key=lambda r: -(float(r[2]) - float(r[1]))):
        group = min(range(count), key=loads.__getitem__)
        groups[group].append(row)
        loads[group] += (float(row[2]) - float(row[1])) * slow + 12
    dest = Path(args.output)
    dest.mkdir(parents=True, exist_ok=True)
    for i, group in enumerate(groups):
        (dest / f'group_{i}.txt').write_text(''.join(' '.join(r) + '\n' for r in group))
    (dest / 'smoke.txt').write_text('empty_hand 2 5 olhos:DeepSeek\nheld_pickaxe 79 82 olhos:DeepSeek\nmotion 16 22 segue:GPT\n')
    original = json.loads((ROOT / 'video/remotion/public/mc/video/abertura.json').read_text())
    montage = copy.deepcopy(original)
    complete = mode == 'full' and not requested
    if not complete:
        montage['cenas'] = [c for c in montage['cenas'] if c['id'] in selected]
    frames = sum(c['dur'] for c in montage['cenas'])
    parts = list(range((frames + 8999) // 9000))
    value = {'schema': 1, 'mode': mode, 'workers': count, 'groups': list(range(count)),
             'scenes': [r[0] for r in rows], 'original_windows': {r[0]: r for r in rows},
             'native_hash': native_hash, 'estimated_seconds_per_group': loads,
             'render_parts': parts, 'frames': frames, 'is_complete_original': complete}
    value['plan_hash'] = stable_hash(value)
    write_json(dest / 'plan.json', value)
    write_json(dest / 'abertura.json', montage)
    outputs = {'capture_matrix': json.dumps({'group': value['groups']}),
               'render_matrix': json.dumps({'part': parts}), 'mode': mode,
               'native_hash': native_hash, 'plan_hash': value['plan_hash']}
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as stream:
            for key, val in outputs.items():
                stream.write(f'{key}={val}\n')
    print(json.dumps(value, indent=2))


def validate(scene_file, clips):
    result = []
    for row in windows(scene_file):
        name = row[0]
        path = Path(clips) / (name + '.mp4')
        meta = path.with_suffix('.captura.json')
        if not path.is_file() or not meta.is_file():
            raise ValueError('Missing clip or capture metadata: ' + name)
        probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
            '-show_entries', 'stream=nb_read_frames:format=duration', '-of', 'json', str(path)],
            check=True, capture_output=True, text=True)
        if probe.stderr.strip():
            raise ValueError('Decode errors in ' + name + ': ' + probe.stderr)
        data = json.loads(probe.stdout)
        frames = int(data['streams'][0]['nb_read_frames'])
        expected = round((float(row[2]) - float(row[1])) * 30)
        if frames != expected or abs(float(data['format']['duration']) - expected / 30) > .08:
            raise ValueError(f'Incomplete clip {name}: {frames}/{expected} frames')
        metadata = json.loads(meta.read_text())
        if metadata.get('modo') not in ('olhos', 'segue', 'orbita', 'fixa'):
            raise ValueError('Invalid camera metadata for ' + name)
        result.append({'id': name, 'frames': frames, 'sha256': digest(path), 'bytes': path.stat().st_size})
    write_json(Path(clips) / 'validated.json', result)
    print(f'Validated {len(result)} clips')
    return result


def main():
    parser = argparse.ArgumentParser(__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    approve = commands.add_parser('approve')
    for key in ('empty-hand', 'held-item', 'motion'):
        approve.add_argument('--' + key, action='store_true', required=True)
    p = commands.add_parser('plan')
    p.add_argument('--mode', default='')
    p.add_argument('--workers', default='')
    p.add_argument('--scenes', default='')
    p.add_argument('--output', required=True)
    v = commands.add_parser('validate')
    v.add_argument('--scenes', required=True)
    v.add_argument('--clips', required=True)
    c = commands.add_parser('collect')
    c.add_argument('--plan', required=True)
    c.add_argument('--input', required=True)
    c.add_argument('--output', required=True)
    args = parser.parse_args()
    if args.command == 'approve':
        p = json.loads(PROFILE.read_text())
        p.update(approved=True, visual_review={'empty_hand_visible': True, 'held_item_visible': True, 'frame_pacing_verified': True},
                 source_sha256=capture_sources(), approved_settings=capture_configuration(p))
        write_json(PROFILE, p)
        print('Approved current capture sources and settings')
    elif args.command == 'plan':
        plan(args)
    elif args.command == 'validate':
        validate(args.scenes, args.clips)
    else:
        plan_data = json.loads(Path(args.plan).read_text())
        output = Path(args.output)
        output.mkdir(parents=True, exist_ok=True)
        for name in plan_data['scenes']:
            files = list(Path(args.input).rglob(name + '.mp4'))
            if len(files) != 1:
                raise ValueError(f'Expected one {name}, found {len(files)}')
            for suffix in ('.mp4', '.captura.json'):
                shutil.copy2(files[0].with_suffix(suffix), output / (name + suffix))
        scene_file = output / 'scenes.txt'
        scene_file.write_text(''.join(' '.join(plan_data['original_windows'][name]) + '\n' for name in plan_data['scenes']))
        validate(scene_file, output)


if __name__ == '__main__':
    main()
