# Memória técnica do canal (ler no começo de cada sessão)

Lições aprendidas na produção, para não repetir erros quando a sessão reinicia ou a cota reseta.

## Render
- Remotion 540p (`--scale=0.5`) e depois Lanczos para 1080p. Nesta máquina `--gl=angle-egl` (~0,45 s/quadro no 3D);
  em outras sessões na nuvem e no GitHub Actions só `--gl=swangle` funciona (~6x mais lento).
- Render distribuído em várias sessões Haiku: o render tem que rodar como tarefa da própria sessão
  (Bash `run_in_background=true`, `timeout=7200000`), nunca com `nohup` solto, senão a máquina hiberna e mata o render.
  Uma metade fixa por sessão (`video/scripts/bb_uma.sh <n>`), sem fila compartilhada. Não usar Send Later (trava pedindo aprovação).
- Reinício do ambiente mata processos: conferir sempre depois de um reinício (`pgrep`) e religar.
- Nunca `pkill -f <texto>`: casa com o próprio shell e mata o comando (exit 144). Matar por PID.
- Disco: a cota da sessão enche rápido. `remotion still` empacota o projeto inteiro em /tmp a cada chamada
  (apagar /tmp/remotion-webpack-bundle-*). Arquivos grandes no public/ (vídeo de 1 GB) quebram o bundle:
  recortar só os trechos necessários.

## Áudio
- O áudio vindo das partes renderizadas pode perder falas. No BOMBANANA o áudio foi refeito direto da timeline
  (`video/scripts/bb_mix2.py`: vozes e efeitos no quadro certo).
- Música SEMPRE abaixando sob a voz, no padrão do canal: `video/scripts/mix_audio.py` / `bb_final.py`
  (volume calibrado do `public/music/music.json`, sidechaincompress threshold 0.015 ratio 9, loudnorm -14 LUFS, limitador).
- Trilhas diferentes por capítulo, com fade. Músicas: Kevin MacLeod (incompetech.com, CC BY 4.0),
  créditos em `public/music/CREDITS.md`.
- CRÉDITOS DE TODAS AS MÚSICAS NA DESCRIÇÃO do vídeo E do Short, sempre (o canal já tomou copyright).

## Vídeo
- Abertura: comentários reais pedindo o vídeo (`youtube/comentarios_*`, componente `amongus3/Comentarios.tsx`).
- Short: roteiro e edição próprios da parte mais marcante (molde `scripts/short_lobo.py`, `short_bb.py`):
  gancho com superlativo que volta no fim, um personagem só, contador, selos, legenda grande. Nunca só um corte do longo.
- Entrega: gofile (`curl -F file=@... https://<server>.gofile.io/contents/uploadfile`).
