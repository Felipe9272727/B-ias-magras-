"""Prepare actual frames + timed speech for independent Haiku editorial review.

This only prepares multimodal requests; it never calls or impersonates a reviewer.
"""
import argparse
import base64
import concurrent.futures
import json
import hashlib
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'video/remotion/public'


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('video', type=Path, nargs='?')
    parser.add_argument('--composition-frames', type=Path, help='Actual Remotion frames from the identical final composition before encoding')
    parser.add_argument('--image-base-url', help='Public HTTP location of the identical committed review frames; needed by the batch API')
    parser.add_argument('--timeline', type=Path, default=PUBLIC / 'timeline_lobo_ep2.json')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    timeline = json.loads(args.timeline.read_text())
    fps = timeline['fps']
    rendered=None
    if args.composition_frames:
        rendered=json.loads((args.composition_frames/'composition_frames.json').read_text())
        if rendered['timelineSha256']!=hashlib.sha256(args.timeline.read_bytes()).hexdigest():
            raise RuntimeError('Review frames do not match the actual edited timeline')
        duration=rendered['durationSeconds']
    elif args.video:
        duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(args.video)]))
    else:
        parser.error('Provide an actual video or actual composition frames')
    blocks = [(start, min(duration, start + 30)) for start in range(0, int(duration + .999), 30)]
    opening_prompt = json.loads((PUBLIC / 'voice_lobo_ep2/abertura.source.json').read_text())['prompt']

    def prepare(block):
        start, end = block
        frames = []
        for index, position in enumerate((start + (end - start) / 6, start + 2 * (end - start) / 3)):
            path = args.out / f'frame_{start:04d}_{index}.jpg'
            if rendered:
                source=next(b for b in rendered['blocks'] if b['start']==start)['frames'][index]
                data=(args.composition_frames/source['file']).read_bytes()
                if hashlib.sha256(data).hexdigest()!=source['sha256']:raise RuntimeError('Review frame changed')
                path.write_bytes(data);position=source['seconds']
            else:
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(position), '-i', str(args.video), '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '8', str(path)], check=True)
            frames.append({'seconds': position, 'file': path.name, 'data': base64.b64encode(path.read_bytes()).decode(), 'url': args.image_base_url.rstrip('/')+'/'+path.name if args.image_base_url else None})
        speech, scenes, facts = [], [], []
        for scene in timeline['scenes']:
            a, b = scene['start'] / fps, (scene['start'] + scene['duration']) / fps
            if a >= end or b <= start:
                continue
            visual = scene['visual']
            props = visual.get('props', {})
            scenes.append({'id': scene['id'], 'visual': visual.get('name'), 'start': a, 'end': b})
            words = [w['w'] for w in scene.get('words', []) if start <= (scene['start'] + w['s']) / fps < end]
            if words:
                timed=[w for w in scene['words'] if start <= (scene['start']+w['s'])/fps < end]
                speech.append({'speaker': 'Narrador', 'startSeconds': (scene['start']+timed[0]['s'])/fps, 'endSeconds': (scene['start']+timed[-1]['e'])/fps, 'text': ' '.join(words)})
            for item in props.get('chat', []):
                if a + item['at'] / fps < end and a + item.get('ate', item['at'] + 1) / fps > start:
                    speech.append({'speaker': item.get('cor'), 'startSeconds': a+item['at']/fps, 'endSeconds': a+item.get('ate',item['at']+1)/fps, 'thought': item.get('pensa', False), 'text': item['texto']})
            if visual.get('name') == 'EP2AberturaRecuperada':
                speech.append({'speaker': 'Narrador', 'text': opening_prompt})
            match = timeline['data'].get('partidas', {}).get(str(props.get('partida')))
            if match:
                record = {'match': match['partida'], 'roles': [{'name': j['nome'], 'role': j['papel']} for j in match['jogadores']]}
                current=props.get('dia',props.get('noite',999))
                record['earlierDays']=[{'n':d['n'],'linchado':d['linchado'],'tiros':d.get('tiros',[]),'acoes':d.get('acoes',[])} for d in match['dias'] if d['n']<current]
                record['earlierNights']=[{'n':n['n'],'mortes':n['mortes'],'cela':{'preso':n['cela']['preso'],'executou':n['cela']['executou']} if n.get('cela') else None} for n in match['noites'] if n['n']<=current-(1 if props.get('noite') else 0)]
                record['visibleActionsAtSceneStart']={'tiros':props.get('tiros',0),'acoes':props.get('acoes',0)}
                if props.get('dia'):
                    day = next(d for d in match['dias'] if d['n'] == props['dia'])
                    record['day'] = {k: v for k, v in day.items() if k not in ('falas', 'pensamentosVoto')}
                if props.get('noite'):
                    night = next(n for n in match['noites'] if n['n'] == props['noite'])
                    record['night'] = {k: v for k, v in night.items() if k not in ('chat', 'cela')}
                facts.append(record)
        info = {'frameSource': 'exact_composition_frames_before_encoding' if rendered else 'encoded_video', 'startSeconds': start, 'endSeconds': end, 'framesAtSeconds': [f['seconds'] for f in frames], 'scenes': scenes, 'timedSpeech': speech, 'sourceFacts': facts}
        content = [{'type': 'text', 'text': json.dumps(info, ensure_ascii=False)}]
        content.extend({'type': 'image_url', 'image_url': {'url': frame['url'] or 'data:image/jpeg;base64,' + frame['data']}} for frame in frames)
        system = ('Você avalia um trecho REAL de Wolvesville do canal Felipex007. Examine as imagens e o texto falado fornecidos. '
                  'Não finja ter assistido aos quadros intermediários ou ouvido áudio: aqui há duas imagens e falas com tempo. '
                  'Falas dos jogadores incluem mentiras e erros reais: não peça para reescrevê-las. Verifique a fidelidade da narração e das imagens aos acontecimentos. '
                  'O texto é digitado progressivamente enquanto a voz toca; frase ainda sendo digitada não é recorte geométrico. Cortinas rosas e clarões no início de cenas são transições intencionais curtas. '
                  'Compare cada imagem com os horários exatos das falas, não com falas que só ocorrem depois dela. Consulte também o histórico anterior para mortes e prisões; o registro do dia contém ações que ainda podem acontecer após aquele quadro. '
                  'O canal usa Poppins, rosa/azul, avatares próprios, chat, pensamentos em voz normal com eco, memes pontuais, '
                  'humor ligado ao acontecimento e suspense. Não use emojis nem sugira lobby. '
                  'Avalie atenção, entretenimento e variedade visual de 0 a 10; marque texto cortado/sobreposto, confusão visual, '
                  'possível tela parada e narração que contradiz os fatos fornecidos. Sugira correções concretas só quando necessárias. '
                  'Seja conciso: até 3 defeitos e 3 correções, cada um até 120 caracteres; factualConcerns só para contradições reais, não elogios ou falta de dados. '
                  'Retorne SOMENTE JSON: {"attention":0,"entertainment":0,"visualVariety":0,"defects":[],"factualConcerns":[],"fixes":[]}.')
        request = {'custom_id': f'ep2qa-{start:04d}', 'body': {'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': content}], 'max_tokens': 4096, 'reasoning_effort': 'low', 'response_format': {'type': 'json_object'}}}
        return request, {'id': request['custom_id'], **info, 'frameFiles': [f['file'] for f in frames]}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        prepared = list(pool.map(prepare, blocks))
    batches = []
    for index in range(0, len(prepared), 20):
        path = args.out / f'requests_{index // 20}.json'
        value = {'endpoint': '/v1/chat/completions', 'model': 'anthropic/claude-haiku-5.5', 'requests': [p[0] for p in prepared[index:index + 20]]}
        data = json.dumps(value, ensure_ascii=False)
        if len(data.encode()) > 8_000_000:
            raise RuntimeError('Review batch exceeds tool payload limit')
        path.write_text(data)
        batches.append({'file': path.name, 'requests': len(value['requests']), 'bytes': len(data.encode())})
    (args.out / 'review_manifest.json').write_text(json.dumps({'video': str(args.video.resolve()) if args.video else None, 'frameSource': 'exact_composition_frames_before_encoding' if rendered else 'encoded_video', 'finalEncodedVideoVerified': False, 'durationSeconds': duration, 'reviewPerformed': False, 'blocks': [p[1] for p in prepared], 'batches': batches}, ensure_ascii=False, indent=2))
    print(json.dumps({'preparedBlocks': len(prepared), 'batches': batches, 'reviewPerformed': False}))


if __name__ == '__main__':
    main()
