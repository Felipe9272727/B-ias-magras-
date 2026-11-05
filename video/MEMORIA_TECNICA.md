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

## Vídeo longo com muitos áudios (AGE, 20 min): não deixar o Remotion mixar
- A mixagem de áudio do Remotion (mergeAudioTrackUnlimited) junta os clipes de 10 em 10 e grava cada bloco como WAV do
  tamanho do vídeo inteiro (~230 MB por bloco em 20 min): com centenas de vozes lotou o disco DEPOIS de renderizar todos os quadros.
- Fazer assim: render com `--muted`, faixa de vozes/efeitos montada da timeline em numpy (`video/scripts/age_audio.py`, 30 s,
  ~100 MB em FLAC) e juntar com `ffmpeg -c:v copy`. Depois o mix padrão (trilha, sidechain, loudnorm).

## RECEITA DO AGE DAS IAs v4 (o Felipe aprovou: "nesse aí vc se superou") — repetir nos próximos vídeos
Fluxo: jogo real rodando com as IAs (log de turnos + quadros de posição) -> destaques -> roteiro com falas copiadas do log
-> timeline + vozes (ElevenLabs, cache por hash) -> Remotion mudo em 16 máquinas do GitHub Actions -> áudio montado fora
-> mix padrão + edição de cor -> gofile. Arquivos: `age/` (motor), `video/scripts/build_timeline_age.py`, `age_audio.py`,
`age_render_parte.sh`, `age_final.py`, `.github/workflows/age-render.yml`, `src/age/*`.

O que fez a diferença (aplicar sempre):
1. **Câmera contínua**: nunca seguir o "quadro do log mais próximo" (pula a cada amostra = sensação de 2 FPS). Média
   gaussiana no tempo (sigma ~3,5 s de jogo) dos pontos de cada quadro; em batalha, centro do MAIOR GRUPO em luta
   (estado COMBAT/FIGHTING, vizinhos a <55 m), nunca média de grupos espalhados (cai no mato).
2. **Deriva lenta em toda cena** (zoom +9% ao longo da cena e passeio de poucos metros): acaba com tela parada.
3. **Selo/meme/número não podem ser cortados pelo fim da cena**: a cena dura até o último terminar. Selo = tempo de
   leitura (0,9 s + 0,3 s por palavra, entre 1,6 e 3 s); selo seguido de selo espera o anterior sair; **meme fica o
   mesmo tempo do selo da cena** (o Felipe pediu assim; sem selo, 2,2 s). Conferir: nenhum overlay com at+dur > dur da cena.
4. Memes sem repetição no vídeo inteiro (contar com Counter antes de renderizar).
5. Elenco: card de cada personagem acende quando o narrador fala o nome (posição do nome no texto x duração da fala).
6. Mix final: Lanczos 1080p + `eq=contrast=1.06:saturation=1.18:gamma=0.98,unsharp=5:5:0.5,vignette=angle=0.42`, preset veryfast.
7. Revisão dos Haikus a cada 30 s (quadros +8 s e +22 s + texto da janela) e consertar câmera fora do assunto,
   tela parada e meme repetido. Notas de "selo não aparece no quadro" costumam ser só amostragem.

Render rápido (22 min de vídeo: quadros em ~3 min, total ~25 min com mix e upload):
- Dados que o git não tem (quadros.json, vozes, gifs ignorados) vão num branch órfão `age-dados` em pedaços de 60 MB
  (`split -b 60M`; o GitHub recusa arquivo >100 MB).
- Workflow com matriz de 16 partes, checkout esparso SÓ do necessário — mas inclua os JSON que o código importa de
  `public/` (bb/manual.json, ilha/mapa.json, overcooked/...), senão o webpack falha em 13 s, e o arquivo de pedido.
- Cada parte entrega num branch `<prefixo>-parte-NN`; o proxy daqui NÃO deixa apagar branch remoto, então cada pedido
  usa prefixo novo (`prefixo` em `public/age_pedido.json`). Commit nesse arquivo dispara o workflow.
- Local: bundle copia o `public/` inteiro (3 GB): para stills, usar `publicDir` com uma pasta de hardlinks (`cp -al`).

## GASTO NO OPENROUTER (5/11: o modo zumbi gastou ~US$ 4 num dia e zerou o crédito do Felipe — não pode repetir)
- SEMPRE rodar partidas com teto de gasto lido do OpenRouter (`GET /api/v1/key` -> `usage`), não com a soma do motor:
  o custo que o motor anota (`usage.cost` das respostas boas) deixou de fora ~metade (chamadas cortadas por tempo e
  repetidas também são cobradas). `zumbi.mjs` já para sozinho em `ORCAMENTO_USD` (padrão 0,80 por partida).
- Antes de rodar várias partidas, avisar o Felipe do custo estimado (custo real de 1 partida x número de partidas) e o saldo.
- Os caros do elenco: GPT-6.1 Terra (US$ 1/5 por M tokens, 43% do gasto) e Qwen 3.8 27B (raciocínio longo, 29%).
- `IA_TIMEOUT_S` baixo (90) faz a chamada ser cortada e repetida = paga duas vezes; preferir 180.
