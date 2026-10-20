# Estilo de edição do Among Us 3 (AU3), para o 60 Segundos das IAs

Análise do vídeo final `video/remotion/out/among_us_3.mp4` (1920x1080, 30 fps, H.264, áudio AAC 48 kHz estéreo, 1493,6 s = 24 min 54 s) e do código que o gerou. Os números vêm de `video/remotion/public/timeline_au3.json`, da verificação `video/scripts/au3/checar_sincronia.ts` (rodada sem alterar o repositório) e de 50 quadros extraídos do vídeo a cada 30 s.

Convenção: caminhos relativos à raiz do repositório (`/home/user/B-ias-magras-/`). `remotion/` é `video/remotion/`.

---

## 1. Estrutura do vídeo

Capítulos reais (`timeline_au3.json`, campo `chapters`):

| Capítulo | Duração | Conteúdo |
|---|---|---|
| Abertura | 83,0 s | Gancho, comentários do canal, ideias, elenco e nave |
| O que mudou | 78,6 s | Funções novas (`AU3Papeis`), elenco, regras |
| Partida 1 · O Palhaço | 306,6 s | Partida cortada na expulsão do Palhaço |
| Partida 2 · O Palhaço não desiste | 457,5 s | Partida mais longa |
| Partida 3 · O Faxineiro | 352,9 s | |
| Partida 4 · Vinte tiques | 122,3 s | Partida mais rápida (20 tiques) |
| Placar e encerramento | 57,2 s | `AU3Placar`, `AU2Premios`, `AU3Nave`, título final |
| Extra · prévia do episódio 4 | 35,5 s | `AU3Previa`, cena montada, não é partida |

Ao todo são 81 cenas (`scenes`), duração média de 18,4 s e mediana de 15,9 s.

Cada partida segue o mesmo ritmo de bloco: `AUTitulo` ou `AU3Elenco`, depois alternância entre `AU3Jogo` (gameplay), `AU3Revela` (impostor revelado), `AU3Chamado` (chamada de reunião), `AU3Reuniao` (discussão no chat), `AU3Votos` (quem votou em quem) e `AU3Ejecao` (expulsão). A lista de cenas e capítulos vem de `video/roteiro/roteiro_au3.py` (`CHAPTERS`, cenas `N(...)` e `CH(...)`).

Medidas por tipo de cena (de `timeline_au3.json`):

| Visual | Cenas | Duração média | Faixa |
|---|---|---|---|
| `AU3Jogo` | 33 (572,9 s, ~38% do vídeo) | 17,4 s (mediana 16,5 s) | 9,9 a 26,4 s |
| `AU3Reuniao` | 8 | 55,1 s | 38,8 a 70,9 s |
| `AU3Votos` | 6 | 8,9 s | mínimo 7,5 s (`min` da cena) |
| `AU3Chamado` | 8 | 5,5 s | 3,4 a 11,0 s |
| `AU3Ejecao` | 6 | 8,8 s | 4,3 a 15,9 s |
| `AU3Revela` | 4 | 16,1 s | 15,1 a 16,9 s |

---

## 2. Elementos visuais

Os nomes abaixo são os da timeline (campo `visual.name`). O despacho fica em `remotion/src/amongus3/Registro.tsx` (`AU3Visual`); os nomes que não começam com `AU3` caem em `remotion/src/amongus/Registro.tsx`.

### 2.1 Legendas
- **Status no AU3 final: nenhuma legenda seletiva.** Todas as 81 cenas têm `capGroups` vazio, e nos 50 quadros amostrados não aparece legenda de fala. O componente existe e está ligado no `Main`, então é só fornecer os grupos.
- Componente: `Captions` em `remotion/src/components/overlays.tsx` (linha 266). Cada palavra falada fica dourada (`C.gold`) e o bloco inteiro entra com pop.
- Regra de quem ganha legenda: `caption_groups` em `video/scripts/build_timeline.py` (linha 380). Entra o bloco que tem marcação `[[cc]]`, termo em `TERMOS` (no AU3 foi sobrescrito em `video/scripts/build_timeline_au3.py`: `Anthropic`, `Skeld`, `tokens`, `JSON`) ou número difícil (`NUMERO_DIFICIL`: `d,d`, 3+ dígitos, `%`, `×`).
- Só existe um `[[cc]]` no roteiro (`video/roteiro/roteiro_au3.py`), e mesmo assim o timeline não gerou grupos. Não investiguei a causa.

### 2.2 Balões de fala (chat e reunião)
- **Bolha de chat**: `Bolha` em `remotion/src/amongus3/Telas.tsx` (linha 175). Avatar da cor (`Cabeca`, 64 px), nome, selo da empresa (`empresa(p, cor)`) e texto em caixa branca com borda preta. Aparece quando a voz da cor começa.
- Chat da reunião: painel "Chat" à direita (x 1190, largura 690, altura 1000 px) dentro de `Votacao` (`Telas.tsx`, linha ~270). Mostra as últimas 6 mensagens.
- Dados das falas: campo `chat` do visual `AU3Reuniao` (39 falas no total), montado em `build_timeline_au3.py`, função `main()`.
- Eventos: 136 eventos de `voz` no total (narrador e falas das cores).
- Som de cada mensagem: `Som nome="chat" vol={0.35}` (`Telas.tsx`, linha 293).

### 2.3 Balões de pensamento
- **Pensamento secreto**: `BalaoPensa` em `remotion/src/amongus3/Telas.tsx` (linha 193). Sai do card do tripulante com três bolinhas que crescem até o balão. Borda azul-roxa para tripulante e vermelha para impostor. O texto é digitado (1 caractere a cada 3,2 quadros, a partir do quadro 6 da entrada). O texto vem do campo `pensamento`, cortado em `curto()` a 170 caracteres (`build_timeline_au3.py`).
- Aparece sobre a tela da reunião quando a fala começa, e some em `ate + 28` a `ate + 40` quadros.
- **Não usado no AU3**: `Frase` (`Telas.tsx`, linha 474, cartão "PENSAMENTO SECRETO" em tela cheia). Nenhuma cena do timeline usa `AU3Frase`.

### 2.4 Selo de velocidade
- `SeloVelocidade` em `remotion/src/amongus3/Jogo.tsx` (fim do arquivo, antes de `ChatImpostores`). Canto superior direito (`right: 30, top: 86`), fundo preto 66%, fonte `FONT.display`.
- Regra: `v > 1.3` mostra `⏩ Nx` (inteiro se `v >= 1.75`, senão uma casa decimal com vírgula); `v < 0.7` e `v > 0.05` mostra `🐢 CÂMERA LENTA`.
- A velocidade vem de `velocidade(mapa, k)` em `remotion/src/amongus3/tempo.ts`: média de `q[k+6] - q[k-6]` dividida por 12, e 1 se houver corte na janela.
- Visto nos quadros: `CÂMERA LENTA` em 4:30, 6:00, 9:30, 13:00, 14:00, 18:30 e 21:00.

### 2.5 Cortes "⏩ TIQUE"
- `Cortes` em `remotion/src/amongus3/Jogo.tsx` (antes de `SeloVelocidade`). Escurece para preto (`interpolate` de -6 a 10 quadros), e o texto aparece no topo (`top: 120`) em caixa preta com borda branca, fonte 40 px.
- Texto: `⏩ TIQUE {n}` no corte de tempo e `DEPOIS DA REUNIÃO` no corte de reunião.
- Gerado a partir de `mapaTempo` (`tempo.ts`). No AU3 final há 3 cortes de tempo (`checar_sincronia`): `p206` em 2,3 s, `p306` em 11,2 s e `p315` em 9,8 s. Nenhum corte de reunião. Os quadros amostrados não pegaram o texto do corte.

### 2.6 Cartões
- **Cartão de função**: `AU3Papeis` em `remotion/src/amongus3/Papeis.tsx`. 16 cartões em grade de 6 colunas (altura 292 px). Cor do fundo pelo time (vermelho impostor, azul tripulante, roxo neutro). Selo amarelo `NOVO` nos papéis novos. O cartão da vez ganha borda amarela, zoom com mola e pulo. Som `faca` ou `tarefa` no início.
- **Título**: `AUTitulo` em `remotion/src/amongus/Cenas.tsx` (linha 31). Usado nas aberturas de partida e no final.
- **Cartão de prêmio**: `Cartao` dentro de `AU2Premios` em `remotion/src/amongus2/Premios.tsx` (linha 53). O prêmio entra com mola, depois sobe para a prateleira.

### 2.7 Pop-ups e memes
- **Meme**: `MemeCard` em `remotion/src/components/overlays.tsx` (linha 162). 50 memes no AU3, todos com `pos: 'right'`, duração de 36 a 90 quadros (1,2 a 3,0 s). Entra com mola (damping 11, stiffness 200) e sai nos últimos 7 quadros. Borda branca de 10 px e sombra. Legenda opcional em `MemeCaption` (fonte `FONT.comic`, 54 px, uppercase).
- Catálogo: `remotion/public/gifs/catalog.json`. Marcação no roteiro: `[[m:id:pos:dur:legenda]]`.
- **Texto grande**: `TextPop` (overlays.tsx, linha 237). Fonte de 132 px, borda e sombra. Usado 0 vezes no AU3 final (nenhum evento `txt`).
- **Soco de câmera**: `punch` em `SceneView` (`remotion/src/Main.tsx`). Zoom de 8% com decaimento e flash branco de 0,45 no pico. 12 usos no AU3.
- **Tremor e TRIGGERED**: existem em `Main.tsx` (`shake`, `trig`), mas o AU3 não usa.
- **Transição de entrada**: `TransicaoEntrada` em `remotion/src/amongus/Transicoes.tsx`. Só nas cenas cujo visual começa com `AU`. Ligada em `Main.tsx`.

### 2.8 Placar
- `AU3Placar` em `remotion/src/amongus3/Placar.tsx`. Uma coluna por partida (altura 800 px), com impostores (mini-tripulantes de 86 px), mortes, impostores pegos, inocentes expulsos, duração em tiques e faixa de quem venceu. Placar geral no topo ("Tripulantes X x Y Impostores x Z Palhaço"), com confete e som `vitoria`.

### 2.9 Prêmios
- `AU3Premios` (`remotion/src/amongus3/Registro.tsx`): usa `AU2Premios` com a lista `PREMIOS3` (3 prêmios). Troféu e título "PRÊMIOS DA TEMPORADA" em 110 px, raios girando atrás.

### 2.10 Extra (prévia)
- `AU3Previa` em `remotion/src/amongus3/Previa.tsx`. Cena montada à mão (não é partida), com selo "PRÉVIA · cena montada" o tempo todo. Cada momento entra na palavra do narrador (`gatilhos` em `Registro.tsx`).

### 2.11 Placar de jogo e tela de vigilância
- HUD do jogo em `Hud` (`Jogo.tsx`): barra de tarefas no topo (verde), lista de tarefas ou "Tarefas falsas" do impostor, papel do foco no canto superior direito, botões de ação no canto inferior direito (`Botao`, 128 px).
- Chat secreto dos impostores: `ChatImpostores` (`Jogo.tsx`), últimas 3 mensagens num celular vermelho no canto inferior esquerdo.
- Câmeras e painel de vigilância: `Monitor.tsx` (`Cameras`, `Admin`, `Vitais`), abre por cima quando o foco está num console.
- Aviso de sabotagem e alerta do Barulhento: `AlertaBarulhento` (faixa amarela e vermelha a 210 px do topo, 150 quadros), `O2` no topo (y 150).
- Nome da sala: no rodapé, centralizado, 30 px, espaçamento 4.

### 2.12 Cores e empresas
- Paleta das cores de tripulante: `COR` em `remotion/src/amongus/Crewmate.tsx`.
- Empresas (cor e nome curto): `EMPRESA` em `Jogo.tsx`, linha 20.

---

## 3. Ritmo

### 3.1 Duração dos cortes
- Média de 18,4 s por cena, mediana de 15,9 s. Gameplay mais curta (17,4 s) que reunião (55 s). Ver a tabela na seção 1.
- Narração e cena são amarradas: a duração da cena é `max(fim da narração + pad, min)`, com `pad` padrão de 0,5 s e `min` de 7,5 s só para `AU3Votos`. Código em `build_timeline_au3.py`, função `main()`.

### 3.2 Aceleração do jogo (relógio da cena de jogo)
Motor: `remotion/src/amongus3/tempo.ts` (`mapaTempo`), com constantes `VMIN = 0.3` (câmera lenta mínima) e `VMIN_REUNIAO = 0.25`. Cada âncora liga um quadro da cena a um quadro da partida. Entre duas âncoras, a partida:
- acelera até `vmax` (padrão 2, configurável por cena com `vmax`);
- desacelera até `VMIN` se o salto for pequeno;
- corta (`Cortes`) se o salto for maior que `vmax`, numa pausa da fala de preferência 3 s antes da âncora seguinte;
- nunca cruza uma reunião: se cruzar, vira corte "DEPOIS DA REUNIÃO".

Medidas reais (`checar_sincronia`, saída em `/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/sincronia.txt`):
- Faixa de velocidade medida nas cenas de jogo: de 0,00 (p302) a 2,93 (p404); a causa do 0,00 em p302 não foi investigada. O pico de 2,93 passa do `vmax` padrão de 2; não verifiquei se p404 define `vmax` próprio.
- 3 cortes de tempo no vídeo inteiro (p206, p306, p315), todos "tempo", nenhum "reunião".

### 3.3 Sincronia do evento com a narração (âncoras)
- Cada cena de jogo declara âncoras no roteiro: `jogo(p, foco, ancoras=[(evento, 'palavras da narração'), ...])` em `video/roteiro/roteiro_au3.py`, linha ~40. O evento acontece no quadro em que o narrador fala a palavra. Busca da palavra em `palavrasNaCena` (`tempo.ts`), sequencial.
- Resultado medido: 41 âncoras no vídeo, nenhuma sem palavra ou evento (`!!` = 0). Em 40 delas a diferença entre a fala e o evento na tela é 0,0 s (precisão de 0,1 s).
- Exceção: p302, âncora "Tique um", evento em 0,0 s, fala em 3,0 s (diferença de -3,0 s). Não corrigida no vídeo final.
- Distância do evento à câmera: em muitas âncoras o evento está a menos de 100 px da câmera (o foco ou o alvo), como em "mata a Rosa" (70 px) e "Recrutada" (0 px). Quando o evento acontece longe (p404 "Armas", 1697 px), ele aparece mesmo assim, com a câmera seguindo o foco.
- `vmax`, `VMIN`, `antes` e `seg` são os parâmetros de ajuste; `antes` (padrão 3 s) é o quanto a cena começa antes do evento de referência.

### 3.4 Chamada de reunião
- `AU3Chamado` (5,5 s em média, componente `Chamado` em `Telas.tsx`, linha 136, não detalhado aqui) fica entre a partida e a reunião.
- `AU3Reuniao` roda na mesma velocidade da narração; a votação (`AU3Votos`) carimba "VOTOU" em 55% da cena e mostra quem votou em quem.

---

## 4. Som

### 4.1 Narração
- Voz: ElevenLabs, modelo `eleven_v4`, ajustes `stability 0.5` e `similarity_boost 0.75` (`build_timeline_au3.py`, `MODELO` e `AJUSTES`).
- Narrador: Gabriel (id `lvkgCBi6spByiTZMPJEK`). Cada cor de IA tem a própria voz (dicionário `VOZES`, 15 vozes).
- Pronúncia só para a voz (`bt.PRONUNCIA`): "Haiku" vira "Raicu", "Among" vira "Amông", "GPT" vira "GêPêTê" etc. A legenda mostra o texto original.
- Narração toca em `<Audio>` sem volume explícito (volume 1), `Main.tsx`, evento `voz`.
- Escrita em estilo falado: sem tags de emoção no narrador.

### 4.2 Efeitos sonoros
- Arquivos: `remotion/public/sfx/` (Mixkit, catálogo em `sfx.json`) e `remotion/public/sfx_au2/` (efeitos do AU2: `faca`, `tiro`, `transformar`, `duto`, `sumir`, `escudo`, `emergencia`, `tarefa`, `voto`, `chat`, `ejecao`, `vitoria` etc.). A função `Som` em `remotion/src/amongus3/Telas.tsx` (linha 13) procura `sfx_au2/<nome>.mp3` quando o nome não tem barra.
- Volume padrão do `Som`: 0,8. Volume padrão do evento `sfx` em `Main.tsx`: 0,3.
- Marcação no roteiro `[[s:efeito:v]]`: o volume vira `min(1, 0,8 × v / 0,55)` (`build_timeline_au3.py`, função `marcas`). Valores que saíram no timeline: 0,58 (v 0,4), 0,73 (v 0,5), 0,87 (v 0,6) e 1,0 (v 0,7 ou mais).
- Volumes fixos usados nos componentes: `voto` 0,4 a 0,5 (votação e placar); `chat` 0,35; `faca` 0,6 (Previa) e 1,0 (`Telas.tsx` linha 448); `tarefa` 0,3 a 0,5; `vitoria` 0,5; `emergencia` 0,4.
- Eventos de jogo (`SonsJogo`, `Jogo.tsx`): `morte` faca, `xerife` tiro, `duto`, `escudo`, `invisivel`, `transformacao`, `limpeza` (passos a 0,4), `foto` (`sfx/camera-shutter.mp3`), `alerta_barulhento` emergencia, `conserto` tarefa. Volume 0,8. Só toca se o evento for perto da câmera (900 px), ou se for do foco, ou for sabotagem ou alerta.
- Efeitos mais usados nas marcações (contagem de `sfx` no timeline): `faca` 7, `impact-epic` 5, `transformar` 5, `death` 4, `tiro` 3, `record-scratch` 3, `emergencia` 3, `reator` 3.

### 4.3 Trilha musical
- Fonte: `remotion/public/music/music.json` (Kevin MacLeod, CC BY 4.0, créditos gerados em `build_timeline.py`).
- Lista de faixas do vídeo: `CUES` em `video/roteiro/roteiro_au3.py` (linha 319). 27 trechos, um por bloco, com nome e início. Cada faixa começa na cena indicada e acaba na próxima. Trechos com `hard` (corte seco) são `a02` (monkeys-spinning-monkeys), `p316` (8bit-dungeon-boss), que param a faixa anterior e entram 0,9 s depois.
- Faixas usadas (ordem do vídeo): sneaky-snitch, monkeys-spinning-monkeys, voxel-revolution, pixel-peeker-polka-faster, 8bit-dungeon-level, thinking-music, despair-and-triumph, fluffing-a-duck, chipper-doodle-v2, relent, pixelland, heroic-age, airship-serenity, quirky-dog, decisions, mega-hyper-ultrastorm, itty-bitty-8-bit, sneaky-snitch, thinking-music, bit-shift, 8bit-dungeon-boss, call-to-adventure, local-forecast-elevator, mega-hyper-ultrastorm, winner-winner, chill-wave, airship-serenity.
- Mudas: `SEM_TRILHA = ['AU3Revela', 'AU3Fim', 'AU3Shhh']` (roteiro_au3.py, linha 348). Nessas cenas a música some.
- Volume: `suggested_bg_volume` da faixa (em `music.json`, entre 0,20 e 0,22 nas que li) × `MUSIC_GAIN` 0,85 × ganho do trecho (1,0 em todos os CUES do AU3).
- Entrada: fade in de 0,8 s (0,3 s no início do vídeo). Saída: fade out de 0,7 s, ou 0,08 s no corte seco.
- Ducking: `sidechaincompress` com `threshold=0.015`, `ratio=9`, `attack=25`, `release=450`, `makeup=1`. Quando há voz ou efeito, a música cai bastante. O comentário no código diz "~10 dB".
- Mixagem: `video/scripts/mix_audio.py` com `--roteiro roteiro_au3` (inferido: o log `montar_au3_x.log` diz "Mixando 27 trechos", igual ao número de CUES). `SEM_SOBREPOR = True` nesse modo, então uma faixa termina exatamente onde a próxima começa.

### 4.4 Normalização
- Alvo no script: `loudnorm=I=-14:TP=-1.5:LRA=11`, seguido de `alimiter=limit=0.79` e `apad`. Nota no código: "limitador: pico real < -1 dBFS após o AAC".
- Medição do arquivo final (`ffmpeg ebur128`): **integrado -14,9 LUFS, pico real -0,7 dBFS, LRA 5,2 LU**. A loudness ficou 0,9 LU abaixo do alvo e o pico passou do alvo de -1,5 dBFS. Não investiguei a causa; vale checar antes de copiar o pipeline.

---

## 5. Como aplicar no 60 Segundos

O 60 Segundos tem duas partes com tecnologias diferentes:

### 5.1 Coleta 3D (60 s, pré-renderizada)
- Composição: `S60Coleta3D` (`video/remotion/src/Root.tsx`, linha 162), componente `video/remotion/src/sessenta/Coleta3D.tsx`. Duração 1950 quadros = 65 s (60 s de jogo + 5 s de folga, `calcColeta3D`). Renderizada com three.js via `@remotion/three`.
- O componente não tem áudio nem legenda. A narração, as trilhas e os efeitos entram depois, na montagem.
- **Remapeamento do tempo**: o algoritmo de `mapaTempo` (`remotion/src/amongus3/tempo.ts`) é genérico (recebe âncoras, duração, pausas e reuniões), então pode ser reaproveitado. Já `mapaDaCena` depende de `sim.ts` (simulação do AU3), então não serve para a coleta. Para a coleta, as âncoras seriam os tiques (2 s cada, 30 tiques, conforme `sessenta/docs/ARQUITETURA.md`).
- Como o clipe já está renderizado, o remapeamento tem de ser feito na montagem do clipe (renderizar o trecho já no tempo novo, ou tocar o clipe com a velocidade do mapa). `sessenta/Previa.tsx` já usa `OffthreadVideo` e `Freeze`, então esse é o ponto de partida.
- Efeitos de eventos: o AU3 põe um `Som` no quadro de cada evento (`SonsJogo`). Na coleta, o equivalente seria um evento por ação de pegar item ou entrar no abrigo, com o mesmo `sfx`.
- Selo `⏩`: a velocidade pode ser calculada do mapa como em `velocidade()`, e o selo pode reaproveitar a mesma caixa (`SeloVelocidade`, canto superior direito).
- Corte "⏩ TIQUE": a coleta tem 30 tiques, então um corte por tique que pular pode usar o mesmo `Cortes`, com o texto `⏩ TIQUE {n}`.

### 5.2 Dias no abrigo (2D)
- Componente: `video/remotion/src/sessenta/Dia.tsx`. Composição `S60Dia` (`Root.tsx`, linha 161). Duração por dia: `duracaoDia` = `(2,6 + 5,5 ou 1,2 + linhas × 2,4 + 2,2) × 30` quadros.
- O diário abre pela direita (`abre`, mola), cada linha do dia entra a cada 2,4 s (`LINHA`). A escolha da IA aparece em `ABRE + 3,6` s com a cor da IA (`ia.cor`) e o texto `✔`. O pensamento aparece por cima em caixa branca com borda da cor da IA (`dia.resposta.pensamento`).
- **Sem áudio no componente**. A prévia `S60Previa` (`sessenta/Previa.tsx`, linhas 70 a 87) mostra o padrão a seguir: narração em volume 1, trilha em volume 0,12 e 0,16 com fade de 20 e 30 quadros, e efeitos `sad-trombone` 0,55, `explosion` 0,6, `swoosh-air` 0,5.
- A narração da prévia é gerada por `video/scripts/previa_s60.py` com `build_timeline_au2.tts` (ElevenLabs, narrador Gabriel, cache por hash). O AU3 usa `build_timeline_au3.py`, então a voz pode vir de lá.
- **Sincronia**: hoje as linhas do diário caem a cada 2,4 s, sem olhar a narração. Para aplicar o estilo do AU3, `Dia.tsx` precisaria aceitar quadros por linha (como os `words` e `ancoras` do AU3), e a duração do dia ficaria `max(narração + pad, mínimo)`, como em `previa_s60.py`.
- Balão de fala e pensamento: o AU3 usa `BalaoPensa` e `Bolha`, que são HTML/React sobre o quadro. O `Dia.tsx` já tem o pensamento em caixa branca. Padronizar com o AU3 é trocar o estilo do balão, não a lógica.
- Legendas: o `Captions` do AU3 espera `scene.capGroups` do `timeline`. O 60 Segundos não tem timeline, então precisa de um (ver 5.3).

### 5.3 Montagem (o que falta no 60 Segundos)
- Não há timeline nem mixagem próprias do 60 Segundos. O `Main.tsx` do AU3 renderiza uma timeline com cenas, e as composições `S60*` não usam `Main`. O caminho é gerar um `timeline_s60.json` no formato do AU3 (`scenes`, `words`, `events`, `capGroups`, `chapters`) e reaproveitar `Main`.
- `video/scripts/mix_audio.py` lê qualquer timeline com `scenes` e `fps`, e usa `CUES` de um roteiro (`--roteiro`). Para o 60 Segundos, o certo é criar um `video/roteiro/roteiro_s60.py` com `CUES` e `SEM_TRILHA`, e não mexer no `mix_audio.py`.
- Trilha: a família e o abrigo pedem tensão e comédia de forma parecida com o AU3 (por exemplo `8bit-dungeon-boss` para perigo e `sneaky-snitch` para suspense). Mesmo volume de base (`suggested_bg_volume` × 0,85) e mesmo ducking.
- Normalização: usar o alvo de -14 LUFS, mas medir o arquivo final (seção 4.4). O AU3 final ficou em -14,9 LUFS e pico -0,7 dBFS, então a conferência é necessária.
- Legendas: definir `TERMOS` do 60 Segundos (nomes de personagens, IAs, itens) em `build_timeline.py`, porque a regra padrão não pega esses nomes. Sem isso o `Captions` fica vazio, como no AU3 final.
- Transições: `TransicaoEntrada` só roda em cenas cujo visual começa com `AU`. Para o 60 Segundos, ou se nomeia as cenas com `AU` ou se estende a regra em `Main.tsx`.

---

## 6. Verificações feitas e limites

- Quadros: 50 quadros do `among_us_3.mp4` a cada 30 s, vistos em 5 folhas de contato. Não vi cada corte em detalhe; os cortes de tempo e os textos `⏩ TIQUE` estão na cena p206 (2,3 s), p306 (11,2 s) e p315 (9,8 s), que não caíram na amostragem.
- Sincronia: `video/scripts/au3/checar_sincronia.ts`, rodado com esbuild do `video/remotion/node_modules` e saída em `scratchpad`. Nenhum arquivo do repositório foi alterado.
- Não medi a qualidade da voz nem a mixagem do áudio por faixa; só a loudness integrada e o pico do arquivo final.
- Não investiguei: a causa de -14,9 LUFS no arquivo final, a âncora de p302 (-3,0 s), o pico de 2,93x em p404, e por que o `[[cc]]` não gerou legenda.
