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

## AU6 zumbi (5/11): o que deu errado e como ficou
- Contêiner reiniciado do zero apaga tudo que não está no git: GIFs dos memes (*.gif é ignorado), músicas (*.mp3), chaves.
  GIFs: baixar de novo pelo `media_url` do catalog.json E REDUZIR (≤400 px, 12 fps), senão o render no Actions estoura a
  memória ("Array buffer allocation failed"). ATENÇÃO: 9 entradas do catálogo têm `media_url` errado (todas baixam o
  "avengers-assemble"): cat-ok-thumbs-up, coffin-dance-byu, goodbye-see-ya, hangry-cat, hide-the-pain-harold, im-hungry-cat,
  nuclear-mushroom-cloud, running-from-problems, wait-who-are-you. Conferir md5 duplicado antes de usar.
- Mesmo com --muted, o Remotion lê os arquivos de áudio (duração): o render no Actions precisa das vozes no checkout.
- Cena com t0+vel*dur além do fim da partida: travar o tique no último (senão aparece "TIQUE 62/60").
- Revisão dos Haikus deu ~5/10 por "tela parada" com personagens imóveis: personagens passeiam pela sala o tempo todo e
  um painel de eventos ao vivo (kill feed) mostra o que o log registrou. Fazer isso em todo vídeo de mapa.
- Upload: a API de servidores do gofile às vezes não responde; cair para store1.

## Lições do AU6 v3 (zumbi)
- Movimento por QUADRO, não por fração de tique: velocidade constante (px/s de vídeo), passeio em passinhos que some
  perto de uma caminhada (sem teleporte), empurrão suave entre vizinhos, lado = movimento real com janelas presas a uma
  grade de 4 quadros (não pisca). Avanço rápido de tiques mostra rastro. Conferir com script: maior salto por quadro.
- Sincronia: item ["ir", tique] no roteiro (relógio por âncoras) e meme junto com o selo do evento.
- Meme NOVO no roteiro precisa estar nos dados do render do Actions (branch de dados): senão a parte quebra com
  "Wrong content type: application/json". GIF grande: reduzir para 400 px / 12 fps antes.
- Render local é rápido para remendo: ~2900 quadros em 1,5 min (scale 0.5, 4 núcleos). Erro visual em poucas cenas:
  renderizar só esses trechos e encaixar com overlay no tempo exato, sem refazer o render inteiro.
- Cartão de capítulo duplicado: não pôr ["marco"] numa cena que já tem "cap" (dois cartões se sobrepõem).
- Pop-ups de comentário: nunca número de curtidas inventado.

## Custo do Fable no vídeo do Roblox (11/11) e como dividir o trabalho daqui pra frente
- O que pesou: 191 turnos num único contexto que cresceu até ~525 mil tokens (retomado 3 vezes, nunca recomeçado).
  Cada turno relê o contexto inteiro: ~58,5 milhões de tokens lidos do cache + 5,1 mi escritos + 388 mil de saída.
  121 dos 191 turnos já estavam acima de 300 mil tokens (50 mi dos 58 mi lidos).
- O que encheu o contexto: 44 imagens lidas (quadros e prints), ~270 mil caracteres de saída de comandos, e trabalho que
  não era de edição: 23 comandos de render/ffmpeg, 13 de espera/progresso do render, 9 de voz/timeline.
- Regra nova: EU (agente principal) entrego ao Fable um pacote pronto (trechos utilizáveis com tempos, falas copiadas do
  log, fatos conferidos, prints escolhidos, lista de memes livres e os componentes que já existem); o Fable só escreve o
  roteiro e a edição (scripts/composição) e para. Render, vozes, stills de conferência, mix, upload e revisão: eu.
  Cada rodada de correção = agente NOVO com um resumo curto (não retomar o mesmo contexto gigante). Sem ler imagens
  além do necessário (pedir no máximo ~10).

## Sessões filhas longas (corrida Pokémon, nov/2026)
- O contêiner da sessão do GPT reiniciou no meio da partida final (RAM e disco folgados: não foi OOM nem disco cheio).
  Processo em segundo plano NÃO segura o contêiner: ele é recolhido por INATIVIDADE da sessão (sem turnos).
- Medida: a sessão-mãe manda um send_message curto (status + "relance se morreu") para cada sessão filha a cada ~20 min
  enquanto houver processo longo rodando. Cada ping é um turno e mantém o contêiner vivo.
- Passo longo sem retomada (ex.: partida final que recomeça do quadro 0) só é aceitável se for determinístico;
  ainda assim custa horas. Em projetos novos: o ORGANIZADOR guarda checkpoint (estado do emulador + log) a cada N min.

## FLUXO DE TRABALHO APROVADO (AU7, nov/2026) — usar em TODOS os vídeos
1. Dados: as partidas/gameplays rodam e os logs vão para o git (nada de depender de sessão filha frágil: ela cai por
   inatividade e por limite de uso; o que for longo roda aqui ou salva progresso no git a cada poucos minutos).
2. SONNET monta o PACOTE (video/youtube/<video>/pacote_roteiro.md): personagens com provas, melhores cenas com falas exatas
   do log, números-chave, estrutura com minutagem, 3 títulos+miniatura, avisos de dados. Se a cota acabar, salva com
   "ONDE PAREI" e é RETOMADO (SendMessage) depois.
3. FABLE escreve o ROTEIRO como STORYBOARD (narração + memes + efeitos sonoros + o que aparece na tela, cena a cena),
   em cima do pacote. Ele é caro: contexto COMPACTO (só caminhos dos arquivos), nota de progresso (NOTA_FABLE.md) a cada
   etapa, agente novo com resumo em vez de retomar contexto gigante. Adições e consertos depois: EU faço, não o Fable.
4. EU edito (timeline/Remotion), renderizo (540p em partes + upscale) e conserto o que o Felipe pedir.
- Câmera: amostrar o alvo numa GRADE FIXA de quadros e interpolar (Catmull-Rom). Média de amostras que andam com o quadro
  dá degraus de ~5/s quando o alvo pula (troca de quem fala, duto, teleporte) e parece "2 fps" (erro da v2 do AU7).
- NARRADOR = O FELIPE (1ª pessoa): nunca "o Felipe perguntou/encerrou"; sempre "eu perguntei/encerrei". Avisar isso ao
  Fable/Sonnet no prompt do storyboard. Trocar fala depois do render: video/scripts/pk_troca_falas.py (só a faixa de áudio).
- Pokémon v1 (Sonnet pacote -> Fable storyboard -> eu edito) foi elogiado como um dos melhores do canal: repetir o fluxo.

## Jogo de Confiança v1 (13/11): falas "só na tela" viraram buraco sem áudio
- O storyboard marcava 14 falas de IA como "só na tela": o balão aparecia sem voz e ficavam 4-10 s de silêncio. O Felipe
  reclamou ("partes sem áudio"). Regra: TODA fala/pensamento de IA que aparece em balão ganha voz (pensamento com eco).
  Só fica muda a citação sem cor (post do fã). Não dá para consertar só no áudio: a voz é mais longa que o balão mudo
  (até 2,5x), então remonta a timeline e renderiza de novo.
- Antes de entregar, checar buracos: trechos de >2,5 s sem voz na faixa (RMS em janelas de 0,1 s) e balões sem áudio.

## Relatório do Gemini sobre o canal (14/11): o que vale e o que não vale
- VALE: elenco de 8 a 12 IAs com NOME de personagem (dá pra torcer); vídeos de 18 a 24 min; ação nos primeiros 90 s
  (nada de introdução longa); alternar formatos (não emendar vários Among Us: fadiga da mesma série); Shorts com 1
  micro-conflito e tela limpa (pensamento x fala pública), nunca 20 bonecos na tela.
- Ideias do relatório que já estão no deck do Felipe: "1 humano infiltrado entre 9 IAs" (Among Us com o Felipe) e
  "10 IAs numa ilha com comida para 3" (Utopia).
- NÃO VALE: comparar likes/1k ou views de vídeo com menos de uma semana (Pokémon tinha < 1 dia: 63,8 likes/1k e 1.223
  views); concluir que 16-20 IAs derrubam views (os vídeos grandes são os mais recentes: confunde com a queda do canal
  depois do viral de 265 mil); medianas puxadas por um único viral. Elenco sugerido com Grok/Gemini: ignorar
  (ver IAS_FAVORITAS.md). Rever os números quando os vídeos novos tiverem ~2 semanas.
