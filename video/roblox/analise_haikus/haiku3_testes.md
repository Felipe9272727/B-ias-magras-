# Haiku 3: testes técnicos e teste_final (análise dos quadros)

Revisão em 11/11/2026. Foram vistos todos os quadros de `q/teste_final` (25), `q/nds_gameplay` (8), `q/teste_repo_*` (9 + 38 + 12 + 17) e `q/teste_technical-validation` (4), além dos 4 PNGs de erro e teste e dos `events.jsonl` e `manifest.json`.

Como ler os tempos: são posições dentro de cada arquivo (mm:ss). Os quadros são a cada 10 s, então cada faixa tem margem de ±10 s. O relógio no canto superior da tela é UTC. `q/teste_realtime-validation` não tem quadros extraídos.

Escala da nota: 1 = cortar. 3–4 = só como resumo de 3 a 5 s. 5–6 = usar com corte. 7–8 = usar. 9 = clímax.

## Avisos antes de usar

1. **Quem operou os testes 279 foi o agente Codex** (campo `actor` dos eventos). Jev e Haiku não jogaram nesses testes (`CONTEXTO_DOS_TESTES.md`). A narração não pode dizer que a IA do canal jogou nesses trechos.
2. **Log e tela divergem cerca de 55 s.** No flicker-02 o erro 279 aparece na tela em 4:20 (quadro 0027), mas o jsonl registra em 5:15 (315 s). No nds-01 aparece em 1:00 e o log registra em 1:56. O nds-diag segue o mesmo padrão. Para o vídeo, usar o tempo da tela e conferir no arquivo final.
3. **`momentos_teste_nds.md` é de `partida_ia.mp4`, não do teste_final.** As marcas "inventou lava" são desse arquivo. Nos quadros do teste_final a ameaça é areia e tempestade, e não há lava.
4. **technical-validation tem inconsistência.** O manifest diz 4,2 s, mas o cronômetro dos quadros vai de 4,9 s a 34,9 s. Não usar a duração como prova.
5. **Os erros 279 são telas de carregamento.** Nenhum quadro de erro mostra partida, morte ou fala de IA.
6. **Datas.** Os upload no GoFile de `nds_gameplay` (15:58 BRT) e `teste_final` (17:58 BRT) são depois dos testes (16:20 a 16:36 UTC, ou 13:20 a 13:36 BRT). Data de upload não é horário de gravação.

## 1. Por gravação

### 1.1 repo_flicker-connection-01 (90 s, 9 quadros)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–01:20 | Home logada (Carlosalberto1234736, amigo Bush), relógio 04:21 a 04:22. Nada muda, cursor parado. | Só prova que o cliente abriu logado. Tela parada. | 1 |

Log: nenhuma ação, só início e fim da captura. **Cortar.**

### 1.2 repo_flicker-connection-02 (377 s, 38 quadros)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–03:10 | Home parada (quadros 1 a 20), sem ação. | Tela parada. Pode virar selo "3 MIN NA HOME" em 1 s. | 1 |
| 03:20–03:30 | Busca abre. "Visitadas recentemente" mostra Natural Disaster. Depois, busca vazia. | Filler. | 3 |
| 03:40–03:50 | Digita "Flicker". O primeiro resultado é "Tremer" (JJ Studios). Página do jogo com botão Play. | Apresenta o jogo e a tentativa 1. Mostra que o nome em inglês vira "Tremer". | 5 |
| 04:00–04:10 | Play. Tela "Piscamento / JJ Studios" com "Entrando no servidor" por cerca de 20 s. | Carregando eterno. | 5 |
| 04:20 | **ERRO 279** ("Erro ao se conectar à experiência. Não há resposta do servidor."). | **ERRO 279 #1.** Principal imagem de erro. | 8 |
| 04:30–05:10 | Mesmo erro, sem mudança (quadros 28 a 32). | Tela parada. | 2 |
| 05:20–05:30 | Cursor em "Tentar de novo" e clique (o botão fica apagado em 05:30). | Momento de retry. | 4 |
| 05:40–06:17 | Erro parado, cursor sobre o botão. | Tela parada. | 1 |

Dados do jsonl (texto, não visual): 183 pacotes UDP de saída e 0 de entrada, contados no contêiner e não por partida.

### 1.3 repo_natural-disasters-connection-01 (116 s, 12 quadros)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–00:10 | Home logada (2 quadros), 04:28. | Início. | 1 |
| 00:20 | Busca: card "Sobrevivência de Desastres Naturais" em visitadas (90%, 6,5 mil em atividade). | Apresenta o jogo. | 5 |
| 00:30 | Página do jogo (Stickmasterluke) com Play. | Apresenta o jogo. | 5 |
| 00:40–00:50 | Play. Tela de carregamento com logo, "Entrando no servidor". | Carregando. | 4 |
| 01:00 | **ERRO 279 #2**, mesmo texto. | **ERRO 279 #2.** | 7 |
| 01:10–01:50 | Erro parado até o fim da captura (quadros 8 a 12). | Tela parada. | 2 |

Log: erro em 1:56 (relógio do log), `match_started: false`.

### 1.4 repo_natural-disasters-network-diagnostic (174 s, 17 quadros)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–00:30 | Erro 279 já na tela no início (o log diz que o diálogo continuava da gravação anterior). Cursor em "Tentar de novo"; retry registrado em cerca de 00:12. | Contexto. | 3 |
| 00:40–00:50 | Volta à página do NDS e aperta Play. | Retry de nova entrada. | 4 |
| 00:50–01:00 | "Entrando no servidor". | Carregando. | 4 |
| 01:10–02:40 | **ERRO 279 #3**, tela parada por cerca de 90 s. | **ERRO 279 #3**, o último. | 2 (corte para 3 s) |

Dados do log (texto): 26 pacotes UDP de saída, 0 de entrada e 13 respostas ICMP "porta inacessível" em 40 s. Pode virar uma linha na tela, não precisa de imagem.

### 1.5 teste_technical-validation (4 quadros, manifest 4,2 s)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–00:34 | Mira sintética: barras vermelha, verde, amarela, azul, magenta e ciano, linha diagonal, cronômetro no canto. | Nada. Não é Roblox. | 1 |

**Fora do vídeo.**

### 1.6 teste_realtime-validation

Sem quadros extraídos. Manifest de 2,1 s, sem resultado. Não avaliado visualmente. **Não usar.**

### 1.7 nds_gameplay (75 s, 8 quadros)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00 | Área com caixas e objetos no chão, mar ao fundo, chat ao lado. Sem personagem em destaque. | Abertura do gameplay. | 3 |
| 00:10 | Lista "Sobreviventes" com 5 nomes (wandinha_adamans, psychosis, kailanes1, tulliim0_0, itz_darkinho875). | Rodada começando. | 5 |
| 00:20 | Avatar de cabelo laranja e camisa preta andando, chat. | Filler. | 3 |
| 00:30 | Banner "Próximo Mapa: Loucura da Fábrica". | Anuncia o mapa com texto na tela. | 6 |
| 00:40 | Multidão, balão "que tal um abraço". | Ruído. | 4 |
| 00:50–01:00 | Caminhada perto de blocos laranja, chat ilegível. | Filler. | 3 |
| 01:10 | Balão de chat "...virar um galo gigantesco" (trecho legível). | Fala engraçada. Ilegível em parte. | 5 |

Não dá para confirmar nos quadros que o avatar é a IA. O chat em 540p é pequeno demais para citar com segurança.

### 1.8 teste_final (252 s, 25 quadros; o último quadro é de 04:00)

| Tempo | O que aparece | Serve para | Nota |
|---|---|---|---|
| 00:00–00:20 | Multidão no mapa, nomes e chat (Acoustic, Spider-Man, Minatinho). Já começa dentro da partida. | Abertura. Não mostra a entrada. | 5 |
| 00:30 | **"AVISO DE DESASTRE: Tempestade de Areia! Desvie de objetos voadores!"** Tela borrada de chuva de areia. | Desastre com aviso legível. Visual forte. | 8 |
| 00:40–00:50 | Close em personagens na areia. Bush e Oepitaph visíveis. | Filler dentro da tempestade. | 4 |
| 01:00 | Chat (Bush): "ei Carlos Alberto como vc esta". | Primeira fala dirigida à IA nos quadros. | 6 |
| 01:10–01:20 | IA digita e envia: "tranquilo mn so tentando nao morrer nessa areia kkk". | **Primeira fala da IA visível.** Contraste: a tela é areia e a fala diz "tranquilo". | 8 |
| 01:30–01:50 | Balões: "ou vem ca", "ja vou mn nao to erwergando nada kkkk", "oi geral kkkk de boa bush ja te respondi mn". | Diálogo, mas repete "de boa" e "tranquilo". Resumir. | 4 |
| 02:00–02:10 | Lista "Sobreviventes" com 15 nomes visíveis. O primeiro é **CarlosAlberto1234736**. | **Clímax.** A IA aparece entre os sobreviventes do desastre. | 9 |
| 02:20–02:30 | Personagem sozinho numa plataforma com céu, depois "Próximo Mapa: ValMarte". | Transição para o próximo mapa, com nome na tela. | 6 |
| 02:40 | Balão: "quase mesmo mn aquela areia nao deixava ver nada kkkk". Chat: "aeee sobrevivi mn eu falei q ia kkkk". | Confirma a fala de sobrevivência. | 7 |
| 02:50–03:10 | Caminhada em grupo, balões "ou Carlos, me segue", "bora mn vai na frente q eu te sigo". | Repetitivo ("me segue", "vem ca"). Cortar a metade. | 4 |
| 03:20 | **"AVISO DE DESASTRE: Saia para fora e fique longe dos edifícios!"** Na caixa de chat, a IA digita "to indo mn calma". | Segundo desastre. Contraste: o aviso manda sair e a fala diz "calma". | 7 |
| 03:30–04:00 | Caminhada no gramado, balões "to indo mn calma ai kkkk" e "kkkk calma mn aqui ta aberto longe dos predio". | Filler. Sem desastre na tela. | 3 |
| 04:00–04:12 | Sem quadros. Os 12 s finais não foram extraídos. | Não avaliado. | - |

Observação: a única fala de morte visível ("morreu pra areia") aparece no chat por volta de 2:00 a 2:30, com autor ilegível em 540p. Não usar sem conferir.

### 1.9 PNGs de erro e teste

| Arquivo | O que aparece | Serve para | Nota |
|---|---|---|---|
| `repo_flicker-connection-02/connection-error-279.png` | Erro 279 sobre a página Piscamento, 04:27. | **ERRO 279 #1** em tela cheia. | 8 |
| `repo_natural-disasters-connection-01/connection-error-279.png` | Erro 279 sobre o fundo do NDS, 04:30. | ERRO 279 #2. Repete o #1. | 6 |
| `repo_natural-disasters-network-diagnostic/connection-error-279.png` | Erro 279 sobre o fundo do NDS, 04:34. | ERRO 279 #3. Repete o #2. | 6 |
| `repo_natural-disasters-network-diagnostic/independent-gles-3d-test.png` | Engrenagens 3D desenhadas por um teste separado sobre o erro do NDS, 04:32. | "O gráfico funciona, o problema é a rede" (conforme o CONTEXTO). Contraste forte. | 8 |

## 2. Sequência sugerida de ~60 s: "como começou"

Ideia: os erros em ordem, depois a primeira partida, com a contagem na tela.

| Tempo no vídeo | Trecho (arquivo e quadro) | Selo ou texto na tela | Duração |
|---|---|---|---|
| 0:00–0:04 | Abertura: ERRO 279 da 3ª tentativa (nds-diag, quadro 0016). | "ERRO 279 · 3ª VEZ" | 4 s |
| 0:04–0:12 | Tentativa 1 (flicker-02): quadro 0020 da Home (1 s), busca "Flicker" (0023), página Tremer com Play (0024 a 0025). | "TENTATIVA 1 · FLICKER" e "3 MIN NA HOME" | 8 s |
| 0:12–0:17 | "Piscamento / Entrando no servidor" (0026) e ERRO 279 #1 (0027). | "ERRO 279 #1" | 5 s |
| 0:17–0:30 | Tentativa 2 (nds-01): card visitadas (quadro 0003), página e Play (0004), "Entrando" (0005 a 0006), ERRO 279 #2 (0007). | "TENTATIVA 2 · NATURAL DISASTER" e "ERRO 279 #2" | 13 s |
| 0:30–0:42 | Tentativa 3 com diagnóstico: PNG das engrenagens 3D (3 s), "Tentar de novo" (2 s), página e Play (2 s), ERRO 279 #3 (3 s). | "O GRÁFICO FUNCIONA" e, ao final, "ERRO 279 x3" | 12 s |
| 0:42–0:52 | Primeira partida: nds_gameplay 0:10 (lista Sobreviventes, 2 s); teste_final 0:30 (aviso de tempestade, 3 s); teste_final 2:00 a 2:10 (lista com CarlosAlberto1234736, 3 s). | "PRIMEIRA PARTIDA" | 10 s |
| 0:52–1:00 | Fechamento: "3 ERROS 279 · 1 PARTIDA" e a pergunta ao público. | Pergunta: "Você teria desistido na 2ª tentativa?" | 8 s |

Contagem que dá para mostrar: **ERRO 279 x3** (flicker-02, nds-01 e nds-diag; o log confirma os três). O erro já aparecia no início do nds-diag, mas a contagem usa só os três registros de `connection_result`. Dá para mostrar também "Tentar de novo: 2 vezes" (um no flicker e um no nds-diag, conforme o log).

## 3. Trechos para cortar

- `repo_flicker-connection-01` inteiro (Home parada por 90 s).
- `repo_flicker-connection-02`: 00:00–03:10 (Home) fica em 1 s. 05:40–06:17 (erro parado) sai.
- `repo_natural-disasters-connection-01`: 01:10–01:50 (erro parado) sai, fica só 1 s do erro.
- `repo_natural-disasters-network-diagnostic`: 01:10–02:40 (erro parado, cerca de 90 s) fica em 3 s.
- `teste_technical-validation` inteiro (mira sintética). `teste_realtime-validation` (sem quadros).
- `nds_gameplay`: 00:20 e 00:50–01:00 (caminhada) saem.
- `teste_final`: 01:30–01:50 (balões repetitivos) vira resumo de 5 s. 02:50–03:10 (seguir em grupo) corta pela metade. 03:30–04:00 (caminhada com "to indo mn calma") vira 3 s.

## 4. Pendências

- Não há quadro de morte, de vitória, nem da entrada da IA na partida (o teste_final já começa dentro).
- O teste_final não tem quadros de 4:00 a 4:12.
- O chat em 540p não é legível em parte. Conferir cada fala no arquivo original antes de citar no narrador.
- A identidade "IA = Carlos Alberto" vem do nome que as falas usam (no chat e na lista de sobreviventes), não de um rótulo na tela.
