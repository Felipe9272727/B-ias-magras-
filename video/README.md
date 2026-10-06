# Vídeo: "4 IAs jogando Mario" (Mario RL Lab)

Vídeo de ~14 min, narrado em pt-BR, feito a partir do projeto `jogo/index_mario_32_fases_v11.html`.
Todo o gameplay foi **gravado de treinos reais**, e os números citados vêm dos logs desses treinos.

## Ferramentas

| Etapa | Ferramenta |
|---|---|
| Captura do jogo, quadro a quadro | Playwright + Chromium headless (`scripts/lab.mjs`, `scripts/capture.mjs`) |
| Voz de IA (gratuita) | Microsoft Edge TTS via `edge-tts`, voz **pt-BR-AntonioNeural** a +8% (`scripts/tts.py`) |
| Conferência da voz | Whisper large-v3-turbo transcreve a narração de volta (`scripts/check_voice.py`) |
| Edição e animação | **Remotion** (React): cenas, diagramas, legendas palavra a palavra, memes em GIF (`remotion/`) |
| Mixagem final | **FFmpeg**: trilha por capítulo, ducking sob a voz e loudnorm a -14 LUFS (`scripts/mix_audio.py`) |
| Efeitos sonoros | Sintetizados com numpy, sem licenças de terceiros (`scripts/make_sfx.py`) |

## Estrutura

```
video/
  roteiro/roteiro.py        roteiro com marcações [[...]] de cortes, memes, sons e destaques
  scripts/                  captura, treino, voz, linha do tempo, mixagem
  data/runs_canon/          logs e resumos dos treinos gravados (os números do vídeo)
  pesquisa/youtubers_rl.md  pesquisa de canais de RL no YouTube e guia de estilo
  youtube/descricao.md      títulos, descrição com capítulos e créditos
  remotion/                 projeto Remotion (src/) e mídia (public/)
```

## Como refazer do zero

```bash
# 0) dependências
cd video/scripts && npm install                  # Playwright (usa o Chromium já instalado)
cd ../remotion && npm install                    # Remotion + React
python3 -m venv ../.venv-tts && ../.venv-tts/bin/pip install edge-tts certifi faster-whisper

# 1) treinos + gravações (cada algoritmo: 1,2 milhão de passos de física, seed 7)
cd ../scripts
node capture.mjs evolution && node capture.mjs ddqn && node capture.mjs rainbow
node capture.mjs adaptive && node capture.mjs extras && node capture_human.mjs

# 2) efeitos sonoros
python3 make_sfx.py ../remotion/public/sfx

# 3) narração + linha do tempo (remotion/public/timeline.json)
SSL_CERT_FILE=/caminho/ca.crt ../.venv-tts/bin/python build_timeline.py   # SSL_CERT_FILE só atrás de proxy
../.venv-tts/bin/python check_voice.py           # opcional: confere a pronúncia com Whisper

# 4) render e mixagem
cd ../remotion && npx remotion render src/index.ts MarioRL out/video_sem_mix.mp4 --crf=20
cd ../scripts && python3 mix_audio.py ../remotion/out/video_sem_mix.mp4 ../remotion/out/mario_rl_video_final.mp4

# thumbnail
cd ../remotion && npx remotion still src/index.ts Thumbnail out/thumbnail.png
```

Para revisar o vídeo no navegador: `cd remotion && npx remotion studio`.

GIFs e músicas não ficam no git. Para baixá-los de novo, use os campos `media_url` de
`remotion/public/gifs/catalog.json` e `remotion/public/music/music.json`. Gravações e voz
são recriadas pelos passos acima.

## Editando o roteiro

Cada cena em `roteiro/roteiro.py` tem um visual base e um texto. Marcações entre `[[ ]]` disparam
no instante em que a próxima palavra é falada:

- `[[c:clipe@início*velocidade|RÓTULO|subtítulo]]` troca o trecho de gameplay. O início aceita
  segundos (`12.5`), quadro (`f512`), `stage:2-2+3`, `clear`, `done-4` ou `end-5`.
- `[[f:clipe@done+0.1]]` congela um quadro.
- `[[m:meme:pos:dur:legenda]]` mostra um GIF de `public/gifs/catalog.json`.
- `[[s:efeito:volume]]` toca um efeito sonoro; `[[h:chave]]` destaca parte de um diagrama;
  `[[t:TEXTO:dur:cor]]` mostra um texto grande na tela.
- `{evo.firstClearGen}` e similares são preenchidos com os resultados reais dos treinos.

Depois de editar, rode `build_timeline.py` de novo. Só as cenas com texto alterado geram voz nova.

## Observação sobre o jogo

Na cópia usada para gravar (e só nela), `lab.mjs` corrige um detalhe visual: o avanço seguro é
pago via `award(a,'custom',…)`, e por isso o rótulo "0 custom" aparecia sobre o Mario. O arquivo
original em `jogo/` não foi alterado.
