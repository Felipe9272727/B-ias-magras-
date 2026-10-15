#!/usr/bin/env bash
# Baixa todos os comentários (e respostas) de um vídeo do YouTube com o yt-dlp, sem baixar o vídeo.
# Uso: bash comentarios_yt.sh <url> <saida.json>
set -euo pipefail
tmp=$(mktemp -d)
yt-dlp --ignore-no-formats-error --skip-download --write-comments --extractor-args "youtube:comment_sort=top;max_comments=all,all,all,all;player_skip=webpage,configs,js;player_client=web" -o "$tmp/v.%(ext)s" "$1" >/dev/null 2>&1 || true
python3 - "$tmp/v.info.json" "$2" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
cs = [{k: c.get(k) for k in ('id', 'parent', 'author', 'text', 'like_count', 'is_pinned', 'author_is_uploader', 'timestamp')} for c in d.get('comments') or []]
json.dump(cs, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(d.get('title'), '| views', d.get('view_count'), '| likes', d.get('like_count'), '| comentários', len(cs))
PY
rm -rf "$tmp"
