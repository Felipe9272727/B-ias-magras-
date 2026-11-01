"""Split already completed ElevenLabs takes using recovered word timings.

Never calls a generation API. Exact prompt/voice matches are required. Alignment
quality and source ranges remain reviewable in the recovery manifest.
"""
import argparse
import bisect
import concurrent.futures
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

PUBLIC = Path(__file__).resolve().parents[1] / 'remotion/public'


def normalize(word):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', word.lower()).encode('ascii', 'ignore').decode())


def run(jobs_file, recovered):
    jobs = json.loads(jobs_file.read_text())
    manifest = json.loads((recovered / 'manifest.json').read_text())
    sources, clips, found = [], [], set()
    for asset in manifest['assets']:
        source = recovered / asset['audioFile']
        if hashlib.sha256(source.read_bytes()).hexdigest() != asset['audioSha256']:
            raise RuntimeError('Recovered audio changed: ' + str(source))
        transcript = json.loads((recovered / (asset['id'] + '.transcript.json')).read_text())
        words = [w for w in transcript['words'] if w.get('type', 'word') == 'word']
        paragraphs = asset['prompt'].split('\n\n')
        tokens, offsets, selected = [], [0], []
        for text in paragraphs:
            candidates = [j for j in jobs if j['voiceId'] == asset['voice_id'] and j['text'] == text and j['id'] not in found]
            if len(candidates) != 1:
                raise RuntimeError('Ambiguous or missing exact prompt/voice match: ' + text[:80])
            job = candidates[0]
            found.add(job['id'])
            selected.append(job)
            tokens.extend(text.split())
            offsets.append(len(tokens))
        matcher = difflib.SequenceMatcher(None, [normalize(t) for t in tokens], [normalize(w['text']) for w in words], autojunk=False)
        anchors = {}
        for block in matcher.get_matching_blocks():
            for i in range(block.size):
                anchors[block.a + i] = words[block.b + i]
        if matcher.ratio() < .85:
            raise RuntimeError(f'Alignment needs manual review: {asset["id"]} ratio={matcher.ratio():.3f}')
        indices = sorted(anchors)
        timed = []
        for i, token in enumerate(tokens):
            if i in anchors:
                start, end = anchors[i]['start'], anchors[i]['end']
            else:
                pos = bisect.bisect_left(indices, i)
                before = indices[pos - 1] if pos else -1
                after = indices[pos] if pos < len(indices) else len(tokens)
                left = anchors[before]['end'] if before >= 0 else 0
                right = anchors[after]['start'] if after < len(tokens) else asset['durationSeconds']
                start = left + (right - left) * (i - before - 1) / (after - before - 1)
                end = left + (right - left) * (i - before) / (after - before - 1)
            timed.append({'word': token, 'start': start, 'end': max(start, end)})
        boundaries = [0]
        for offset in offsets[1:-1]:
            boundaries.append((timed[offset - 1]['end'] + timed[offset]['start']) / 2)
        boundaries.append(asset['durationSeconds'])
        sources.append({'nodeId': asset['id'], 'generationId': asset['generations'][0]['generation_id'], 'alignmentRatio': matcher.ratio(), 'clips': len(selected)})
        for i, job in enumerate(selected):
            start, end = boundaries[i:i + 2]
            a, b = offsets[i:i + 2]
            if end <= start:
                raise RuntimeError('Invalid speech range: ' + job['id'])
            base = PUBLIC / 'voice_lobo_ep2/scenes' / job['id']
            clip_words = [{'word': w['word'], 'start': max(0, w['start'] - start), 'end': min(end - start, max(0, w['end'] - start))} for w in timed[a:b]]
            provenance = {'nodeId': asset['id'], 'generationId': asset['generations'][0]['generation_id'], 'sourceAudioSha256': asset['audioSha256'], 'start': start, 'end': end, 'recoveredWithoutRegeneration': True, 'alignmentRatio': sum(k in anchors for k in range(a, b)) / (b - a)}
            clips.append((source, base, job, clip_words, provenance))
    if found != {j['id'] for j in jobs}:
        raise RuntimeError('Not every speech job was recovered')

    def export(item):
        source, base, job, words, provenance = item
        base.parent.mkdir(parents=True, exist_ok=True)
        audio = base.with_suffix('.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-ss', str(provenance['start']), '-t', str(provenance['end'] - provenance['start']), '-c:a', 'libmp3lame', '-b:a', '128k', str(audio)], check=True)
        duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(audio)]))
        base.with_suffix('.words.json').write_text(json.dumps({'hash': job['hash'], 'words': words, 'dur': duration, 'source': provenance}, ensure_ascii=False))
        return {'id': job['id'], 'duration': duration, **provenance}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        exported = list(pool.map(export, clips))
    report = {'sources': sources, 'clips': exported, 'newGenerations': 0}
    (recovered / 'split_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'clips': len(exported), 'seconds': sum(c['duration'] for c in exported), 'minimumAlignment': min(s['alignmentRatio'] for s in sources)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--jobs', type=Path, default=PUBLIC / 'voice_lobo_ep2/jobs.json')
    parser.add_argument('--recovered', type=Path, default=PUBLIC / 'voice_lobo_ep2/recovered_p5')
    args = parser.parse_args()
    run(args.jobs, args.recovered)
