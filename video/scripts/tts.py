#!/usr/bin/env python3
"""Gera a narração com uma voz neural gratuita (Microsoft Edge TTS, via edge-tts).

Uso:
  python tts.py pedido.json pasta_saida [--engine edge] [--voice pt-BR-AntonioNeural] [--rate +8%]

pedido.json: [{"id": "s01", "text": "...", "voice"?: "...", "rate"?: "+8%", "pitch"?: "+0Hz"}, ...]
Saída: <id>.mp3 e <id>.words.json com {"hash", "voice", "words": [{"word", "start", "end"}]} (segundos).
Itens cujo texto/voz não mudou são reaproveitados (cache por hash).

Requer o pacote edge-tts (pip install edge-tts). Em redes com proxy TLS,
o certificado em SSL_CERT_FILE é adicionado ao contexto SSL do edge-tts.
"""
import argparse
import asyncio
import hashlib
import json
import os
import ssl
import subprocess
import sys
from pathlib import Path

DEFAULT_VOICE = 'pt-BR-AntonioNeural'
DEFAULT_RATE = '+8%'
DEFAULT_PITCH = '+0Hz'


def edge_setup():
    import edge_tts
    import edge_tts.communicate as ec

    try:
        import certifi

        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    if os.environ.get('SSL_CERT_FILE') and Path(os.environ['SSL_CERT_FILE']).exists():
        ctx.load_verify_locations(cafile=os.environ['SSL_CERT_FILE'])
    ec._SSL_CTX = ctx
    return edge_tts


def item_hash(engine, voice, rate, pitch, text):
    return hashlib.sha1(f'{engine}|{voice}|{rate}|{pitch}|{text}'.encode()).hexdigest()[:16]


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True)
    return float(out.stdout.strip() or 0)


async def edge_one(edge_tts, item, out_dir, sem, retries=5):
    voice = item.get('voice') or DEFAULT_VOICE
    rate = item.get('rate') or DEFAULT_RATE
    pitch = item.get('pitch') or DEFAULT_PITCH
    h = item_hash('edge', voice, rate, pitch, item['text'])
    mp3 = out_dir / f"{item['id']}.mp3"
    wj = out_dir / f"{item['id']}.words.json"
    if mp3.exists() and wj.exists():
        try:
            if json.loads(wj.read_text()).get('hash') == h:
                return item['id'], duration(mp3), True
        except json.JSONDecodeError:
            pass
    async with sem:
        delay = 2
        for attempt in range(retries):
            try:
                words = []
                tmp = mp3.with_suffix('.part.mp3')
                com = edge_tts.Communicate(item['text'], voice, rate=rate, pitch=pitch, boundary='WordBoundary')
                with open(tmp, 'wb') as f:
                    async for ch in com.stream():
                        if ch['type'] == 'audio':
                            f.write(ch['data'])
                        elif ch['type'] == 'WordBoundary':
                            s = ch['offset'] / 1e7
                            words.append(dict(word=ch['text'], start=round(s, 3), end=round(s + ch['duration'] / 1e7, 3)))
                if not words or tmp.stat().st_size < 1000:
                    raise RuntimeError('resposta vazia')
                tmp.replace(mp3)
                wj.write_text(json.dumps(dict(hash=h, engine='edge', voice=voice, rate=rate, pitch=pitch, words=words), ensure_ascii=False))
                return item['id'], duration(mp3), False
            except Exception as e:  # rede instável: tenta de novo com espera crescente
                if attempt == retries - 1:
                    raise
                print(f"  {item['id']}: {type(e).__name__}: {e} — nova tentativa em {delay}s", file=sys.stderr)
                await asyncio.sleep(delay)
                delay *= 2


async def run_edge(items, out_dir, concurrency):
    edge_tts = edge_setup()
    sem = asyncio.Semaphore(concurrency)
    results = await asyncio.gather(*(edge_one(edge_tts, it, out_dir, sem) for it in items))
    total = 0
    for sid, d, cached in results:
        total += d
        print(f"{sid:6s} {d:6.2f}s {'(cache)' if cached else ''}")
    print(f'Total de narração: {total / 60:.2f} min')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('request')
    ap.add_argument('out_dir')
    ap.add_argument('--engine', default='edge', choices=['edge'])
    ap.add_argument('--voice', default=None)
    ap.add_argument('--rate', default=None)
    ap.add_argument('--concurrency', type=int, default=4)
    args = ap.parse_args()
    items = json.loads(Path(args.request).read_text())
    for it in items:
        if args.voice and not it.get('voice'):
            it['voice'] = args.voice
        if args.rate and not it.get('rate'):
            it['rate'] = args.rate
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    asyncio.run(run_edge(items, out_dir, args.concurrency))


if __name__ == '__main__':
    main()
