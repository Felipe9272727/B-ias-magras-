"""Read verified render artifacts, upscale independently, then concatenate by copy."""
import argparse
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.request
import zipfile

from distributed_pipeline import digest, stable_hash, write_json

SOURCE_RUN = '41086710011'
SOURCE_HEAD = '4decb4dc9f222f0b384ba1da5e4cd20969b4314e'
NATIVE_HASH = '2b24f096aa53e89213a1359ac8ab23fd80d50a09b37657e1d81dc3b616faadb6'


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, newurl):
        return None


class GitHub:
    def __init__(self, repo, run):
        if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repo) or not str(run).isdigit():
            raise ValueError('Invalid source repository or run ID')
        token = os.environ.get('GITHUB_TOKEN')
        if not token:
            raise ValueError('GITHUB_TOKEN with actions:read is required')
        self.root = 'https://api.github.com/repos/' + repo
        self.run = str(run)
        self.headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'minecraft-parallel-upscale'}
        self.opener = urllib.request.build_opener(NoRedirect())
        self.cached = {}

    def api(self, path):
        headers = dict(self.headers)
        if path in self.cached and self.cached[path][0]:
            headers['If-None-Match'] = self.cached[path][0]
        try:
            with self.opener.open(urllib.request.Request(self.root + path, headers=headers), timeout=90) as response:
                data = json.load(response)
                self.cached[path] = (response.headers.get('ETag'), data)
                return data
        except urllib.error.HTTPError as error:
            if error.code == 304 and path in self.cached:
                return self.cached[path][1]
            raise RuntimeError(f'GitHub API status {error.code} for {path}') from None

    def wait_artifact(self, name, timeout):
        deadline = time.monotonic() + timeout
        print('Waiting for source artifact:', name, flush=True)
        while time.monotonic() < deadline:
            page, artifacts = 1, []
            while True:
                data = self.api(f'/actions/runs/{self.run}/artifacts?per_page=100&page={page}')
                artifacts.extend(data['artifacts'])
                if len(artifacts) >= data['total_count']:
                    break
                page += 1
            found = [a for a in artifacts if a['name'] == name and not a['expired']]
            if len(found) == 1:
                return found[0]
            if len(found) > 1:
                raise ValueError('Ambiguous source artifact: ' + name)
            run = self.api('/actions/runs/' + self.run)
            if run['status'] == 'completed':
                raise ValueError('Source run completed without required artifact: ' + name)
            time.sleep(min(10, max(0, deadline - time.monotonic())))
        raise TimeoutError('Source artifact was not ready within the polling limit: ' + name)

    def download(self, artifact, folder):
        folder.mkdir(parents=True, exist_ok=True)
        archive = folder / 'artifact.zip'
        url = self.root + f"/actions/artifacts/{artifact['id']}/zip"
        try:
            response = self.opener.open(urllib.request.Request(url, headers=self.headers), timeout=90)
        except urllib.error.HTTPError as error:
            if error.code not in (301, 302, 303, 307, 308):
                raise RuntimeError(f'GitHub artifact download status {error.code}') from None
            location = error.headers.get('Location', '')
            if not location.startswith('https://'):
                raise ValueError('Expected HTTPS artifact download redirect')
            # Signed storage redirects receive no GitHub credential headers.
            response = urllib.request.urlopen(location, timeout=180)
        with response, archive.open('wb') as target:
            shutil.copyfileobj(response, target, 1024 * 1024)
        expected_digest = artifact.get('digest')
        if expected_digest and expected_digest.startswith('sha256:') and digest(archive) != expected_digest[7:]:
            raise ValueError('GitHub artifact ZIP digest mismatch')
        with zipfile.ZipFile(archive) as zipped:
            for item in zipped.infolist():
                path = PurePosixPath(item.filename)
                if path.is_absolute() or '..' in path.parts or (item.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError('Unsafe path in artifact ZIP')
            zipped.extractall(folder)
        archive.unlink()


def video_info(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
        '-show_entries', 'stream=nb_read_frames,width,height,avg_frame_rate,codec_name,pix_fmt,time_base',
        '-of', 'json', str(path)], check=True, capture_output=True, text=True)
    if result.stderr.strip():
        raise ValueError('Video decode error: ' + result.stderr)
    return json.loads(result.stdout)['streams'][0]


def validate_plan(plan, expected_native):
    if (plan.get('frames'), plan.get('mode'), plan.get('is_complete_original'), plan.get('render_parts')) != (55422, 'full', True, list(range(7))):
        raise ValueError('Expected the complete original 55422-frame montage in seven parts')
    if plan['native_hash'] != expected_native:
        raise ValueError('Source native capture hash mismatch')
    if stable_hash({k: v for k, v in plan.items() if k != 'plan_hash'}) != plan['plan_hash']:
        raise ValueError('Source plan hash mismatch')


def encode_part(source, output, expected_frames, tail):
    info = video_info(source)
    if int(info['nb_read_frames']) != expected_frames or info['avg_frame_rate'] != '30/1':
        raise ValueError('Source render part frame count/rate mismatch')
    filters = 'scale=1920:1080:flags=lanczos'
    if tail:
        filters += ',tpad=stop_mode=clone:stop_duration=0.1'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(source), '-vf', filters, '-an',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-threads', '4',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output)], check=True)
    result = video_info(output)
    if int(result['nb_read_frames']) != expected_frames + tail or (result['width'], result['height']) != (1920, 1080):
        raise ValueError('Upscaled render part validation failed')
    return result


def upscale(args):
    if not 0 <= args.part <= 6:
        raise ValueError('Part must be0..6')
    work = Path(args.work).resolve()
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    client = GitHub(args.repo, args.source_run)
    run = client.api('/actions/runs/' + str(args.source_run))
    if run['head_sha'] != args.expected_head:
        raise ValueError('Source run commit differs from the reviewed expected commit')
    plan_artifact = client.wait_artifact('mc-plan', args.wait_seconds)
    client.download(plan_artifact, work / 'plan')
    plan = json.loads((work / 'plan/plan.json').read_text())
    validate_plan(plan, args.expected_native_hash)
    artifact = client.wait_artifact(f'mc-render-part-{args.part}', args.wait_seconds)
    client.download(artifact, work / 'part')
    source = work / f'part/parte_{args.part}.mp4'
    original_metadata = json.loads((work / f'part/parte_{args.part}.json').read_text())
    begin, end = args.part * 9000, min(plan['frames'], (args.part + 1) * 9000)
    expected = end - begin
    if (original_metadata['parte'], original_metadata['de'], original_metadata['ate'], original_metadata['quadros']) != (args.part, begin, end - 1, expected):
        raise ValueError('Source part frame-window metadata mismatch')
    tail = 3 if args.part == 6 else 0
    video = output / f'upscaled_{args.part}.mp4'
    info = encode_part(source, video, expected, tail)
    write_json(output / f'upscaled_{args.part}.json', {'part': args.part, 'start_frame': begin,
        'end_frame_exclusive': end, 'content_frames': expected, 'frames': expected + tail,
        'tail_padding_frames': tail, 'fps': 30, 'source_run': str(args.source_run),
        'source_head': args.expected_head, 'source_artifact_id': artifact['id'],
        'source_sha256': digest(source), 'sha256': digest(video), 'native_hash': plan['native_hash'],
        'plan_hash': plan['plan_hash'], 'encoding': {k: info[k] for k in
            ('width', 'height', 'avg_frame_rate', 'codec_name', 'pix_fmt', 'time_base')}})
    print('Upscaled and validated part:', args.part, flush=True)


def concat(parts, output):
    manifest = output.parent / 'upscaled-concat.txt'
    if any("'" in str(path) or '\n' in str(path) for path in parts):
        raise ValueError('Unsupported concat filename')
    manifest.write_text(''.join("file '" + str(path.resolve()) + "'\n" for path in parts))
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(manifest),
        '-map', '0:v:0', '-c:v', 'copy', '-an', '-movflags', '+faststart', str(output)], check=True)
    manifest.unlink()


def merge(args):
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    parts, metadata, encoding = [], [], None
    for part in range(7):
        matches = list(Path(args.parts).rglob(f'upscaled_{part}.json'))
        if len(matches) != 1:
            raise ValueError('Missing or duplicate upscaled part: ' + str(part))
        meta = json.loads(matches[0].read_text())
        video = matches[0].with_suffix('.mp4')
        begin, end = part * 9000, min(55422, (part + 1) * 9000)
        tail = 3 if part == 6 else 0
        if (meta['part'], meta['start_frame'], meta['end_frame_exclusive'], meta['frames'], meta['tail_padding_frames']) != (part, begin, end, end - begin + tail, tail):
            raise ValueError('Upscaled part timeline mismatch')
        if meta['source_run'] != str(args.source_run) or meta['source_head'] != args.expected_head or meta['native_hash'] != args.expected_native_hash:
            raise ValueError('Upscaled part source identity mismatch')
        if digest(video) != meta['sha256']:
            raise ValueError('Upscaled part bytes changed')
        if metadata and meta['plan_hash'] != metadata[0]['plan_hash']:
            raise ValueError('Upscaled parts use different source plans')
        if encoding is not None and meta['encoding'] != encoding:
            raise ValueError('Upscaled codec parameters differ between parts')
        encoding = meta['encoding']
        parts.append(video)
        metadata.append(meta)
    video = output / 'mc-video-silent-full.mp4'
    concat(parts, video)
    info = video_info(video)
    if int(info['nb_read_frames']) != 55425 or (info['width'], info['height'], info['avg_frame_rate']) != (1920, 1080, '30/1'):
        raise ValueError('Stream-copy final movie frame/resolution mismatch')
    write_json(output / 'timeline.json', {'schema': 1, 'mode': 'full', 'frames': 55425, 'fps': 30,
        'tail_padding_frames': 3, 'audio_included': False, 'is_complete_original': True,
        'source_run': str(args.source_run), 'source_head': args.expected_head,
        'native_hash': metadata[0]['native_hash'], 'plan_hash': metadata[0]['plan_hash'],
        'sha256': digest(video), 'merge_method': 'stream-copy', 'parts': metadata})
    print('Validated stream-copy full movie:', video, flush=True)


def main():
    parser = argparse.ArgumentParser(__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('upscale', 'merge'):
        p = commands.add_parser(name)
        p.add_argument('--source-run', default=SOURCE_RUN)
        p.add_argument('--expected-head', default=SOURCE_HEAD)
        p.add_argument('--expected-native-hash', default=NATIVE_HASH)
        p.add_argument('--output', required=True)
        if name == 'upscale':
            p.add_argument('--repo', default=os.environ.get('GITHUB_REPOSITORY', 'Felipe9272727/B-ias-magras-'))
            p.add_argument('--part', type=int, required=True)
            p.add_argument('--work', required=True)
            p.add_argument('--wait-seconds', type=int, default=1800)
        else:
            p.add_argument('--parts', required=True)
    args = parser.parse_args()
    {'upscale': upscale, 'merge': merge}[args.command](args)


if __name__ == '__main__':
    main()
