"""Empacota a produção existente. Não gera vídeo, vozes ou novas decisões."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[2]


def main():
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('output', type=Path)
    args = ap.parse_args()
    selected = set()
    def add(path):
        p = ROOT / path
        if p.is_file():
            selected.add(p)
        elif p.is_dir():
            selected.update(f for f in p.rglob('*') if f.is_file()
                and '__pycache__' not in f.parts and 'node_modules' not in f.parts
                and f.suffix not in ['.pyc', '.tmp', '.lock'])
        else:
            raise FileNotFoundError(path)
    for path in ['CLAUDE.md', 'lobisomem', 'video/roteiro', 'video/remotion/src',
        'video/remotion/package.json', 'video/remotion/package-lock.json',
        'video/remotion/tsconfig.json', 'video/remotion/remotion.config.ts',
        'video/remotion/public/fonts', 'video/remotion/public/music',
        'video/remotion/public/sfx', 'video/remotion/public/gifs',
        'video/remotion/public/voice_lobo_ep2', 'video/remotion/public/timeline_lobo.json',
        'video/remotion/out/wolvesville_ep2_abertura_recuperada.mp4',
        'video/remotion/out/CREDITOS_PREVIA.md',
        'video/youtube/descricao_lobo.md']:
        add(path)
    for p in (ROOT / 'video/scripts').glob('*.py'):
        add(p.relative_to(ROOT))
    files = sorted(selected)
    manifest = []
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.output, 'w', ZIP_DEFLATED, compresslevel=6) as z:
        for p in files:
            data = p.read_bytes()
            name = str(p.relative_to(ROOT))
            z.writestr(name, data)
            manifest.append({'path': name, 'size': len(data),
                'sha256': hashlib.sha256(data).hexdigest()})
        z.writestr('LEIA_PRIMEIRO.md', '''# Wolvesville Parte 2 — produção recuperada

Este pacote contém os arquivos reais existentes. Não é o episódio final.

- Abertura MP4: `video/remotion/out/wolvesville_ep2_abertura_recuperada.mp4`, 27 segundos em 1080p. Reutilizada sem regeneração.
- Partida 5 concluída: `lobisomem/logs_ep2/partida5.json`; diário de 263 decisões e 16 reflexões preservados. Vila venceu no dia 5.
- Partida 6: oito decisões recebidas, mesma semente 20308545, mesma memória. A próxima resposta da Florista está incerta; não reenviar automaticamente.
- Estado e instruções: `lobisomem/recovery/RETOMADA_20261031.md`.
- Checkpoint restaurável: `lobisomem/recovery/checkpoints/current.json`.
- Roteiro do capítulo 5: `video/roteiro/roteiro_lobo_ep2_p5.md` e `.py`; 35 cenas, 58 falas/pensamentos com fontes verificadas.
- Textos preparados para as vozes: `video/remotion/public/voice_lobo_ep2/jobs.json`; 93 trechos. Esses áudios ainda não foram gerados.
- Componentes de edição, fontes, efeitos, oito trilhas e créditos existentes estão incluídos. A renderização final exige as partidas 6 e 7 concluídas, narração e timeline final.

Não usar testes sintéticos como partidas reais. Não gerar novamente a abertura. GPTs exclusivamente pela assinatura Work. Teto do OpenRouter mantido em US$ 2; reservas incertas não foram liberadas.

Auditoria offline: `python3 lobisomem/reconciliar_ep2.py --require-clear`.
O código 2 indica que a chamada incerta continua bloqueando a retomada.

Cada arquivo consta em `MANIFEST.sha256.json`. Credenciais, dependências instaladas e metadados do Git foram excluídos.
''')
        z.writestr('MANIFEST.sha256.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    with ZipFile(args.output) as z:
        bad = z.testzip()
        if bad:
            raise RuntimeError('ZIP inválido: ' + bad)
    print(json.dumps({'file': str(args.output), 'entries': len(manifest) + 2,
        'bytes': args.output.stat().st_size,
        'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
