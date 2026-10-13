# Revisão de edição: Vídeo 3 (Jogos Vorazes das IAs)

Status (atualizado em 2026-10-13): pipeline `completo3.sh` em andamento na etapa 3D (log com linhas `TOMADA`). Os pedaços do Remotion (`pNNN.mp4`) ainda não existem, então a etapa B está pendente. Esta revisão cobre a etapa A (cenários `ilha/3d/*.jpg`, 61 stills vistos em folhas de contato). Os tempos são o início da cena na `timeline3_completo.json` (mm:ss).

## Etapa A: cenários (stills 3D)

### Problemas recorrentes (prioridade alta)

- **Bloco preto chapado.** Um volume preto sem sombreamento ou textura aparece em r05, p108, p205 (como "caverna"), p209 e pl03_2 (canto). A laje cinza enorme aparece em p210_2. Parece material ou asset quebrado, não rocha. Verificar o asset antes de renderizar de novo.
- **Cornucópia repetida.** O mesmo acampamento (Cornucópia + baú + bonecos, mesmo ângulo quase) aparece em cerca de 15 cenas (f01, p202, p203, p206b, p212, p214b, p216b, p217_1, p218, p222, p223, p225, p226, p227, pl03, t05). O espectador vê a mesma imagem por 2 minutos. Sugestão: variar ângulo, distância e hora do dia, ou usar a Cornucópia só nas cenas de abertura e de encerramento.
- **Tomadas longas sem personagem.** Cenas de 20 s ou mais com cenário vazio, enquanto a narração descreve ação entre IAs. Os pos.json mostram que a maioria dos atores fica parada em cada tomada.
- **Localizações que não aparecem.** A narração cita Caverna, Lago, Campo e Floresta, mas as imagens mostram mar, praia ou morro vazio. A caverna quase nunca aparece como caverna (só como bloco preto).

### Achados por cena

| Tempo | Cena | Problema | Sugestão |
|---|---|---|---|
| 02:46 | r05 | Bloco preto chapado ocupa 1/3 esquerdo; sem personagens. Narração "Aliança vale. Mentir vale..." sem imagem correspondente. | Refazer o cenário sem o bloco. Mostrar duas IAs juntas. |
| 02:59 | p102 | Narração "A Floresta", imagem mostra Cornucópia e campo, com poucas árvores no canto. | Plano com mata densa, ou ajustar o texto. |
| 04:06 | p105 | 22,5 s de morro vazio, copas cortadas no topo, nenhum boneco. | Colocar personagens ou cortar a tomada pela metade. |
| 04:28 | p106 | Narração cita "Riacho / Córrego", mas não há água na imagem. | Mostrar o curso d'água ou trocar a referência. |
| 04:50 | p107 | Narração "No Campo", imagem é praia com palmeiras e mar. Tronco de palmeira gigante ocupa o centro-esquerdo. | Ajustar o nome do local ou trocar a tomada. |
| 05:14 | p108 | Bloco preto liso ocupa o terço esquerdo; narração "Na Caverna" sem caverna visível. | Refazer com entrada de caverna legível (como p205, sem o bloco). |
| 05:46 | p110 | 20,7 s sem personagens. Narração trata de uma proposta de aliança entre dois Qwen. | Colocar os dois Qwen na tomada. |
| 06:07 | p111 | "o Lago tava ali, cheio d'água" mostra mar, não lago. Sem bonecos. | Mostrar o lago (c01) ou ajustar o texto. |
| 06:18 | c01 | Vista aérea do lago, bem enquadrada. Os 8 bonecos têm ppm 23 a 30 (1 a 2 px de altura), não dá para ler quem está ali. | Zoom na tomada ou marcadores nos nomes. |
| 06:27 | c02 | 11,9 s de morros vazios para "um mapa da ilha". Nenhum mapa, nenhum boneco. | Inserir um mapa (overlay) ou mostrar o aviso sobre a água. |
| 07:24 | p205 | "Primeira noite" mas a tomada é diurna e clara. Bloco preto como caverna. | Escurecer a cena (noite) ou tirar a palavra "noite". |
| 07:43 | p206 | "dividindo a caverna com dois líderes" mas a imagem é morro com flores, sem caverna e sem bonecos. | Trocar pela caverna com os dois líderes. |
| 08:31 | p208 | "dez dos doze estão no Lago. E o Opus faz o discurso" mas a tomada é morro escuro e vazio. | Tomada do lago com os dez personagens. |
| 09:02 | p209 | "na Caverna" com bloco preto ocupando a direita; sem caverna legível. | Mesmo que p108. |
| 09:21 | p209b | 26,6 s com a câmera colada no morro. Quase tudo é grama, só um canto de céu. | Recuar a câmera. |
| 09:48 | p210 | Tomada 2 é uma laje cinza enorme em primeiro plano, ocupando a metade inferior, com bonecos minúsculos ao fundo. | Tirar a laje ou recuar a câmera. |
| 09:59 | p210b | 34,1 s de tomadas sem personagens: morro roxo escuro e câmera colada na encosta (tomada 1), sem bonecos legíveis. Tomada mais longa sem boneco do vídeo até aqui. | Cortar para metade ou colocar personagens. Recuar a câmera. |
| 10:55 | p213 | "alguém ataca. Machadada do DeepSeek" mas a tomada mostra árvores e mar, sem personagem nem golpe. | Mostrar a machadada. |
| 11:12 | p213b | Tomada 0 escura, com faixa roxa de glitch na lateral direita. Tomada 1 (fogueira à noite) funciona. | Corrigir a faixa de glitch. |
| 11:46 | p214b | Cornucópia cortada na borda direita em duas das três tomadas (_1 e _2). | Reenquadrar. |
| 12:22 | p215 | Névoa lava a metade de baixo do quadro (cinza e roxo pálido), perde contraste. | Reduzir a opacidade da névoa. |
| 12:39 | p216 | 13,6 s de morro roxo vazio, sem bonecos. Narração "o Qwen 27B-1 faz a mesma conta" sem personagem na imagem. | Colocar personagens ou cortar. |
| 13:14 | p217 | Tomada 0 é mar com duas árvores, sem personagens. Narração fala de "beber no Lago". | Mostrar o lago ou ajustar o texto. |
| 13:55 | p219 | 31 s de noite com mar escuro e árvores secas, sem bonecos. Narração "dentro da névoa" sem névoa na imagem. | Adicionar névoa e o Sonnet e o DeepSeek 2, ou cortar. |
| 15:17 | p224 | 13,6 s sem narração (campo `words` vazio) e com tomada vazia. Figura cortada na borda inferior. | Tirar o trecho ou enquadrar a figura. |
| 15:31 | p225 | 30,9 s de Cornucópia repetida. Narração descreve o golpe ("vinte e oito de dano"), sem ação na imagem. | Mostrar o golpe ou encurtar. |
| 16:09 | p227 | Narração anuncia o vencedor (Haiku 2). Imagem é a mesma Cornucópia, sem destaque. | Close no Haiku 2 com marcação de vitória. |
| 14:26 | p220 | Narração "Sobraram três: o Opus, o Haiku 2... e o DeepSeek 2", mas a tomada mostra um único boneco minúsculo no meio, com colina roxa e fumaça ao fundo. | Mostrar os três tributos, maiores, ou reescrever a frase. |
| 14:31 | p221 | Bonecos pequenos ao fundo, pouco legíveis. | Opcional: aproximar. |
| 01:43 | r01 | Tomada 0 (r01_0) é colina vazia com um trecho de lago pequeno, sem personagens, por 17 s de narração sobre turnos. | Colocar um boneco ou um marcador de turno. |
| 02:53 | p101 | p101_0 é a Cornucópia de novo (mais uma repetição), bem enquadrada, bonecos pequenos. | Trocar por outro cenário ou variar. |
| 16:39 | pl03 | Cornucópia cortada na borda direita (pl03_0). Bloco preto de novo na borda inferior direita (pl03_2). | Reenquadrar e checar o asset preto. |

### Pendências da etapa A

- Cenas ainda sem still: p104, p201, p204, p214, p220, t01 a t04, pl01. Rever quando saírem.
- Cenas a04 a a07 existem como `.mp4` (sem still) e entram na etapa B. Ver o primeiro quadro de cada uma.
- Bonecos quase imóveis dentro das tomadas: na maioria das tomadas o campo `atores` tem a mesma posição em todos os quadros (ex.: p102, p203). Confirmar se é intencional ou se o `anims: coletar` deveria mover os bonecos.
- Campo `atores` tem 10 atores por cena, mas só 1 a 5 ficam dentro do quadro (x entre 0 e 1). Os demais têm x > 1 (fora de cena), o que é esperado.

## Etapa B: pedaços do Remotion

Pendente. Os `pNNN.mp4` ainda não foram gerados.

## Vigia do pipeline

- Processo `completo3.sh` (PID 24875) ativo na etapa 3D até a última verificação. Log sem Traceback.
- Pausa pedida pelo coordenador: o processo foi parado de propósito para corrigir cenários (caverna, lago, câmera perto de objetos, névoa). Arquivo `ilha/logs/PAUSA_PRINCIPAL` presente. Último trecho do log: `TOMADA p218_1`.
- Não relançar enquanto `PAUSA_PRINCIPAL` existir. Quando sumir, voltar a vigiar. O relançamento é do coordenador.
- Pausa removida às 17:21. O pipeline voltou (PID 27946, `completo3.sh`), com renderização 3D em andamento: 95 tomadas, 88 pendentes (22801 quadros), 2 processos de render (`render3d.py`, Blender). A pasta `ilha/3d` foi regenerada. Os stills da etapa A revisados antes da pausa são de versões anteriores e precisam ser refeitos quando as novas tomadas estiverem prontas.

## 10 piores coisas (preliminar, a fechar com a etapa B)

1. Bloco preto chapado em r05, p108, p205, p209 e p210 (asset/material quebrado).
2. Cornucópia repetida em cerca de 15 cenas (monotonia).
3. p219 (31 s), p210b (34 s), p225 (31 s) e t05 (30 s): tomadas longas sem personagem ou sem ação.
4. Caverna nunca aparece como caverna, apesar de citada em p108, p206, p209.
5. p213: narração fala de ataque, a imagem não tem ataque.
6. p224: 13,6 s sem narração e com tomada vazia.
7. p209b e p210b: câmera colada no morro.
8. c02: "mapa" sem mapa.
9. p205: "noite" em cena clara.
10. p215: névoa lava o quadro.
