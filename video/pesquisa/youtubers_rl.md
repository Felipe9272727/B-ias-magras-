# YouTubers de RL e "IA aprende a jogar": pesquisa e guia de estilo para o vídeo do **Mario RL Lab**

> **Coleta:** 06/10/2026. Inscritos, visualizações, durações e capítulos foram lidos nas páginas públicas do YouTube nessa data (valores arredondados; mudam todo dia). Alguns capítulos são gerados automaticamente pelo YouTube. "Pico de replay" = gráfico **"Mais repetidos"** do player (intensidade relativa dentro de cada vídeo). Todos os canais e vídeos citados foram verificados; o que é **recomendação nossa** está marcado como tal (seção 6).

## Sumário

1. [Resumo executivo](#1-resumo-executivo)
2. [Panorama dos canais (tabela)](#2-panorama-dos-canais)
3. [Fichas: canais internacionais](#3-fichas-canais-internacionais)
4. [Canais brasileiros / em português (verificados)](#4-canais-brasileiros--em-português-verificados)
5. [O que os números dizem](#5-o-que-os-números-dizem)
6. [Guia de estilo para o nosso vídeo](#6-guia-de-estilo-para-o-nosso-vídeo)
7. [Fontes](#7-fontes)

---

## 1. Resumo executivo

- **O gênero tem uma gramática estável:** promessa clara → personagem → fracasso engraçado → progresso visível → final com payoff. Exemplos: Yosh ("treinei uma IA… até não conseguir vencê-la", 17,7 mi de views), AI Warehouse (o agente Albert, 13,7 mi) e Code Bullet (Flappy Bird, 14,8 mi).
- **Duração:** os canais de referência ficam entre 10 e 17 min. Medianas: AI Warehouse ≈10:45, cozmouz ≈10:40, b2studios ≈12:40, Pezzza ≈13:40, Yosh ≈16:10, Universo Programado ≈16:00 e Code Bullet ≈17:10. Os nossos 10–12 min estão bem no meio do gênero.
- **Introdução curta:** em 24 vídeos com capítulos, o primeiro bloco dura **≈43 s** (mediana). Depois disso, um bloco novo começa a cada **≈1 min 24 s** (mediana).
- **O clímax é o que mais se revê:** em **13 de 20** vídeos analisados, o pico de "Mais repetidos" cai no último terço, onde ficam a corrida final, o recorde ou o timelapse.
- **Comparar métodos em sequência já funciona:** Code Bullet passou por algoritmo genético → NEAT → PPO em *Donkey Kong* (5,3 mi), e Yosh foi de algoritmo genético para Deep Q-Learning em *Trackmania* (7,45 mi). Os nossos 4 métodos cabem nessa mesma "escada".
- **Mario + IA tem histórico forte:** SethBling MarI/O (11,5 mi), Code Bullet *AI Learns to Play Mario* (1,46 mi em ~6 semanas, ago/2026) e Kush Gupta (1,27 mi num canal que só tem 2 vídeos).
- **Em PT-BR, a referência é o Universo Programado** (612 mil inscritos; "IA destruindo no dinossauro da Google", 4,48 mi). Nas buscas que fizemos, quase ninguém em PT-BR publicou recentemente uma comparação de métodos modernos (DQN, Rainbow, imitação) num mesmo jogo. **Esse espaço está livre.**
- **O que só nós temos e precisa estar na tela e no título:** 64 agentes ao mesmo tempo, 32 fases, 4 "cérebros" diferentes, tudo rodando no navegador, recompensas editáveis e o modo **"Aprender comigo"**, em que o humano ensina a IA.

---

## 2. Panorama dos canais

| Canal | Inscritos | Foco | Duração típica | Vídeo de referência (views) |
|---|---|---|---|---|
| [Code Bullet](https://www.youtube.com/@CodeBullet) | 3,47 mi | recria jogos e treina IA, com muito humor | ~17 min | *A.I. Learns to play Flappy Bird*: 14,8 mi |
| [AI Warehouse](https://www.youtube.com/@aiwarehouse) | 833 mil | agentes Unity com personagem (Albert/Kai) | ~10–11 min | *AI Learns to Walk*: 13,7 mi |
| [SethBling](https://www.youtube.com/@SethBling) | 1,97 mi | Minecraft; MarI/O | MarI/O: 5:58 | *MarI/O*: 11,5 mi |
| [b2studios](https://www.youtube.com/@b2stud) | 356 mil | IA + física, guiado por dados | ~12–13 min | *AI Learns Insane Monopoly Strategies*: 12,0 mi |
| [Yosh](https://www.youtube.com/@yoshtm) | 411 mil | RL em Trackmania | ~16 min | *Training an unbeatable AI in Trackmania*: 17,7 mi |
| [Pezzza's Work](https://www.youtube.com/@PezzzasWork) | 204 mil | simulações feitas do zero (C++) | ~13–14 min | *Evolving AIs – Predator vs Prey*: 3,0 mi |
| [Two Minute Papers](https://www.youtube.com/@TwoMinutePapers) | 1,84 mi | resumos de papers | ~5 min | *OpenAI Plays Hide and Seek…*: 11,0 mi |
| [sentdex](https://www.youtube.com/@sentdex) | 1,44 mi | tutoriais de Python/ML | 15–45 min | *Python plays GTA* p.14: 1,58 mi |
| [Emergent Garden](https://www.youtube.com/@EmergentGarden) | 283 mil | vida artificial, redes neurais | ~24 min | *4 AIs Survive 10 Days in Minecraft*: 1,86 mi |
| [Primer](https://www.youtube.com/@PrimerBlobs) | 1,94 mi | simulações de evolução com "blobs" | ~14 min | *Simulating the Evolution of Aggression*: 25,0 mi |
| [Peter Whidden](https://www.youtube.com/@peterwhidden) | 72,2 mil | um único vídeo (Pokémon com RL) | 33:53 | *Training AI to Play Pokemon with RL*: 10,1 mi |
| [Kush Gupta](https://www.youtube.com/@KushGupta1) | 12,6 mil | 2 vídeos | ~8 min | *AI Learns to Speedrun Mario*: 1,27 mi |
| [AI Tango](https://www.youtube.com/@aitango) | 24,1 mil | Mario Kart Wii com Rainbow DQN | ~10 min | *AI Learns to DESTROY old CPUs*: 1,53 mi |
| [cozmouz](https://www.youtube.com/@cozmouz) | 98,8 mil | agentes físicos "torturados" | ~10–11 min | *I Trapped this AI Centipede… 1000 Years*: 2,75 mi |
| [carykh](https://www.youtube.com/@carykh) | 740 mil | Evolution Simulator, entre outros | ~10 min | *Evolution Simulator (Part 1/4)*: 5,2 mi |
| [Chrispresso](https://www.youtube.com/@Chrispresso) | 4,79 mil | algoritmo genético + rede neural em Mario | ~9 min | *AI Learns to Play Super Mario Bros!*: 362 mil |
| [suckerpinch (Tom 7)](https://www.youtube.com/@tom7) | 202 mil | projetos absurdos, IA no NES | 16 min | *Computer program that learns to play classic NES games*: 2,2 mi |

---

## 3. Fichas: canais internacionais

### 3.1 Code Bullet
- **URL:** https://www.youtube.com/@CodeBullet. Tem 3,47 mi de inscritos e 94 vídeos. É australiano (Evan Gresham). Slogan do canal: *"Just an idiot with a computer science degree trying his best."*
- **O que cobre:** recria jogos do zero (Flappy Bird, Jump King, Donkey Kong, Happy Wheels, Mario) e treina IA neles com algoritmo genético, NEAT, PPO e DQN. Também faz "trapaças" com autoclicker e algoritmos clássicos (*Piano Tiles*, 17 mi; cubo mágico 55×55×55, 17 mi).
- **Duração típica:** mediana de ≈17 min. Os vídeos recentes têm de 14 a 25 min.
- **Formato e estrutura:** metade é *devlog* (construir o jogo) e metade é treino.
  - *AI Learns to Play Mario* (13:55, 21/08/2026): introdução de 0:00 a 0:37 → construção do Mario → ajuste do movimento → montagem da fase → patrocínio (4:48) → inimigos e mecânicas → **o treino da IA só começa em 8:08 (58%)** → "desafio do Bullet Bill" (10:44) → conclusão (12:53).
  - *DESTROYING Donkey Kong with AI* (29:46): constrói o jogo até 8:24 e depois sobe uma escada de algoritmos: genético (8:24) → NEAT (15:05) → PPO (21:06) → resultado final (27:36).
- **Humor e memes:** autodepreciativo e sarcástico. A IA vira um personagem teimoso e burro. As descrições seguem o mesmo tom: *"I used math, science and tears to create a snake AI which always wins (sometimes)"*; *"Watch AIs learn to walk while avoiding a DEATH LAZER"*. Nos vídeos principais ele usa arte cartunesca (créditos "Art created by Dachi.art"). Manteve a identidade escondida por anos.
- **Visual:** montagens aceleradas de programação, a população inteira jogando ao mesmo tempo e "vilões" que forçam o progresso, como o *DEATH LAZER* do vídeo de andar.
- **Narração:** a voz dele, rápida e conversacional, com piadas no meio da explicação.
- **Extras:** o treino completo, sem cortes, vai para o segundo canal *Code Bullets Day Off* (ex.: "A.I. Learning to play Jump King unedited"). A versão dele de Jump King tem link para jogar no navegador.
- **Vídeos notáveis:**
  - Flappy Bird: 14,8 mi (2018, 7:46)
  - *A.I. Learns To Walk*: 10,4 mi (2019)
  - *Jump King*: 9,05 mi (2022, 27:12)
  - *Donkey Kong (Deep RL)*: 5,3 mi (2023)
  - *AI Learns to Play Mario*: 1,46 mi (ago/2026)
- **O que levar para o nosso vídeo:**
  1. A escada de métodos do Donkey Kong é o esqueleto natural para apresentar 4 métodos.
  2. Mostrar rápido como o jogo foi construído (32 fases feitas do zero) dá credibilidade. No nosso caso isso deve caber em **≤ 1 min**, porque a estrela é o aprendizado.
  3. O vídeo de Mario dele é de agosto de 2026 e o público vai comparar. **Diferencie-se** com 64 agentes, 32 fases, 4 cérebros, humano ensinando e narração em PT-BR.

### 3.2 AI Warehouse
- **URL:** https://www.youtube.com/@aiwarehouse. Tem 833 mil inscritos e 21 vídeos. É um canal canadense, criado em out/2022, e tudo é feito em Unity (ML-Agents).
- **O que cobre:** um agente que aprende desafios físicos com deep RL: fugir de salas, andar, pega-pega, futebol, queimada e sumô.
- **Duração típica:** de 8 a 14 min (mediana ≈10:45).
- **Formato:** um desafio dividido em fases crescentes ("Albert precisa escapar de 5 salas"), e cada sala acrescenta uma dificuldade. Nos vídeos com dois agentes há rivalidade entre **Albert e Kai**.
- **Humor:** personificação total. Albert é um cubo laranja com olhos e ganhou corpo humanoide em *AI Learns to Walk*. Kai é um cubo azul com sobrancelhas de bravo. Os títulos prometem caos: *"(and breaks the game)"*, *"(and breaks physics)"*. Na descrição aparece até o "Current Subscribers: …".
- **Narração:** **não tem voz**. São comentários em texto inseridos na edição, com música por baixo. Prova de que dá para fazer o gênero sem narração falada.
- **Visual:** câmera 3D limpa e o Albert se debatendo no chão e "fazendo a minhoca" antes de andar (Hackaday). Nos bastidores, de 50 a 200 cópias do Albert treinam em paralelo, segundo os comentários fixados citados pela wiki.
- **Descrição padrão:** explica RL numa frase (*"rewarding the agent for doing something correctly, and punishing it for doing anything incorrectly"*) e manda para o **comentário fixado** com os detalhes técnicos.
- **Vídeos notáveis:**
  - *AI Learns to Walk*: 13,7 mi (2023, 8:40)
  - *AI Learns to Play Tag*: 9,6 mi (2024)
  - *AI Agent Learns to Escape*: 8,66 mi (2022)
  - *AI Learns to Play Soccer*: 8,64 mi (2025)
- **Dados:** o pico de replay fica em 69% do vídeo (*Walk*) e em 82% (*Tag*). O que as pessoas reveem é o clímax.
- **O que levar:** dar **nome e rosto** ao agente, estruturar as fases como "salas" de dificuldade crescente e deixar o detalhe técnico para o comentário fixado.

### 3.3 SethBling (MarI/O)
- **URL:** https://www.youtube.com/@SethBling. Tem 1,97 mi de inscritos. O canal é quase todo de Minecraft, mas o MarI/O é o marco fundador do gênero.
- **Vídeo:** *MarI/O – Machine Learning for Video Games* (13/06/2015), 5:58, **11,5 mi**.
- **Como funciona:** usa NEAT (neuroevolução) com população de **300** genomas, segundo o código publicado. A fitness é, grosso modo, "o quanto andou para a direita, descontado o tempo". Completou a fase Donut Plains 1 depois de **34 gerações, em ~24 h**, dando spin-jump pela fase inteira (Wikipedia).
- **Visual:** a rede neural fica desenhada por cima do jogo. As entradas são blocos e inimigos simplificados e as saídas são botões. O HUD mostra *"Gen X species Y genome Z (N%)"* e *"Fitness: N / Max Fitness"* (está no código Lua).
- **Narração:** calma e didática. Quase o vídeo todo é explicação por cima da gameplay (capítulos "Mario's Brain", "Inputs", "How Neural Networks Work", "Sample Neural Network"). O **pico de replay fica justamente na explicação da rede de exemplo (≈53%)**.
- **Desdobramentos:** **MariFlow** (2017) foi treinado com gravações da gameplay do próprio SethBling em Super Mario Kart. É o precedente direto do nosso "Aprender comigo". Em 2024 ele publicou a entrevista *The brain behind MarI/O: Ken Stanley*.
- **O que levar:** um HUD no estilo MarI/O (geração, agente, fitness, recorde) é reconhecido na hora pelo público. Mostrar a rede "acendendo" enquanto o agente joga.

### 3.4 b2studios
- **URL:** https://www.youtube.com/@b2stud. Tem 356 mil inscritos e 23 vídeos. Slogan: *"I go to great lengths programming things to entertain myself"*.
- **O que cobre:** IA com física: Monopoly, Spider-Man, boliche, tênis de mesa, golfe, "movimento em 4D" e *Can AI Run McDonalds?* (out/2026).
- **Duração típica:** mediana de ≈12:40.
- **Formato:** muito guiado por dados (capítulos do Monopoly: *Win Rates*, *Most Visited Tiles*, *Relative Win Rate*, *Building the Perfect AI*). Explica RL de verdade: no vídeo do Spider-Man passa por estados/ações/recompensas, fator de desconto, redes neurais, PPO, *policy gradient* e *clamping*. Fecha com "o que a IA aprendeu".
- **Humor:** seco e absurdo, com personagens de gelatina. Descrição do Spider-Man: *"J Jonah Jellynose suspects Spiderman is an AI. Captain Blubber is arrested twice."*
- **Vídeos notáveis:**
  - *Monopoly*: 12,0 mi (2021; **11,2 milhões de partidas de self-play**)
  - *Spiderman*: 7,46 mi (2023)
  - *Bowling*: 3,9 mi
- **O que levar:** gráficos e estatísticas viram "descobertas" ("a IA prefere X"). Dá para explicar PPO e DQN a fundo desde que a explicação venha intercalada com resultado visual.

### 3.5 Yosh (Trackmania)
- **URL:** https://www.youtube.com/@yoshtm. Tem 411 mil inscritos e 23 vídeos. Slogan: *"Teaching AI to master the world's best racing game"*.
- **Duração típica:** mediana de ≈16 min, variando de 15 a 37 min.
- **Formato:** um projeto longo (uma jornada de ~3 anos, de 2020 a 2023), narrado como aventura, no formato **humano contra IA**, com recordes mundiais como clímax. Estrutura de *Training an unbeatable AI in Trackmania* (20:41): intro de 1:00 → "entendendo redes neurais" → obstáculos iniciais → vitória na primeira pista → mapa complexo → **humano vs IA** → generalização → drift → conclusão.
- **Visual:** replays de **centenas de carros sobrepostos**, coloridos pela etapa do treino: vermelho (quase aleatório) → amarelo → verde. O aprendizado fica óbvio sem explicação (The Autopian).
- **Como explica:** compara RL a **adestrar um animal de estimação com recompensa** (The Autopian) e explica as entradas da rede (velocidade, distância às paredes). Usa "**rodinhas de treino**": uma recompensa extra temporária para ensinar uma técnica, que é removida depois (Hall of Dreams).
- **Narração:** voz própria, calma e honesta sobre as falhas, com música da Epidemic Sound. No vídeo de 2026, o sound design e a mixagem foram feitos por um profissional (crédito na descrição).
- **Vídeos notáveis:**
  - *Training an unbeatable AI*: 17,65 mi (2023)
  - *AI just Broke Trackmania's Greatest World Record*: 7,6 mi (2025)
  - *AI Learns to Drive From Scratch*: 7,45 mi (2022). Segue a sequência algoritmo genético → Deep Q-Learning → exploração → *overfitting* → combinação.
  - *I Trained an AI to Beat This Absurd World Record*: 6,1 mi (2026)
- **O que levar:**
  1. "Fantasmas" dos 64 agentes coloridos por geração.
  2. O enquadramento **"eu vs a IA"**, usando o modo Aprender comigo.
  3. Recompensas temporárias ("rodinhas"): as nossas recompensas editáveis viram parte da história.

### 3.6 Pezzza's Work
- **URL:** https://www.youtube.com/@PezzzasWork. Tem 204 mil inscritos e 120 vídeos. Mostra projetos pessoais feitos quase todos do zero em C++ (GitHub *johnBuffer*).
- **O que cobre:** simulações de física, formigas, evolução (predador vs presa), agentes aprendendo a correr (gato, galinha) e gladiador contra zumbis.
- **Duração típica:** ~13–14 min, chegando a 29 min.
- **Estrutura:**
  - *Predator vs Prey*: Introduction → Simulation → **Timelapse** → Ending.
  - *AI Cat Learns to Run*: iterações explícitas ("First iteration", "2nd iteration", "3rd iteration").
- **Visual:** simulações grandes e bonitas, timelapse no final e engenharia à mostra (desempenho do motor de física).
- **Vídeos notáveis:**
  - *Predator vs Prey*: 3,04 mi (2022)
  - *Phalanx*: 2,9 mi
  - *AI Cat Learns to Run*: 1,41 mi (2025)
- **Dados:** o pico de replay está no timelapse, em ≈92% do vídeo.
- **O que levar:** mostrar "versões" (v1, v2, v3 das recompensas e dos sensores) como capítulos, e fechar com um timelapse das 32 fases.

### 3.7 Two Minute Papers
- **URL:** https://www.youtube.com/@TwoMinutePapers. Tem 1,84 mi de inscritos e é apresentado pelo Dr. Károly Zsolnai-Fehér.
- **Formato:** cerca de 5 min por paper. Bordões: *"Dear Fellow Scholars"*, *"What a time to be alive!"* e *"hold on to your papers"*.
- **Estrutura de escalada de surpresas** (*OpenAI Plays Hide and Seek…*, 11,0 mi, 2019): "Start – Pandemonium!" → "A little learning" → "**But then – something happened!**" → "**They learned what?!**" → "**It gets even weirder**" → "Amazing teamwork".
- **O que levar:** criar um bordão próprio de abertura e de despedida, e roteirizar as descobertas emergentes no esquema "e aí… aconteceu uma coisa".

### 3.8 sentdex
- **URL:** https://www.youtube.com/@sentdex. Tem 1,44 mi de inscritos e faz tutoriais de Python e ML.
- **Série "Python plays GTA V" (2017):** a parte 1 tem 613 mil views e a parte 14 (*Self driving car neural network in the city*) tem **1,58 mi**. **O carro da IA ganhou nome: "Charles"** (*Charles 2.0*, 2018).
- **Formato:** série em partes, programação direto na tela, código aberto (*pygta5*) e tutoriais em texto. Hoje os vídeos têm de 20 a 70 min e falam de LLMs e agentes.
- **O que levar:** o público técnico quer código e parâmetros, então ofereça link e uma versão técnica. E de novo: **dê nome ao agente**.

### 3.9 Emergent Garden
- **URL:** https://www.youtube.com/@EmergentGarden. Tem 283 mil inscritos. Descrição: *"Artificial life, artificial intelligence, emergence, and weird programs."* (Max Robinson).
- **Formato:** longo e reflexivo (mediana ≈24 min). Exemplos:
  - *Watching Neural Networks Learn*: 1,69 mi. Visualiza redes neurais aprendendo funções; foi submissão do #SoME3.
  - *4 AIs Survive 10 Days in Minecraft*: 1,86 mi, 1h27. Bots controlados por LLMs.
- **Humor:** seco, nas descrições: *"They really really really like collecting wood."*
- **O que levar:** visualizar a rede "aprendendo" (os pesos mudando) dá um respiro bonito entre uma gag e outra.

### 3.10 Primer
- **URL:** https://www.youtube.com/@PrimerBlobs. Tem 1,94 mi de inscritos e é feito por Justin Helps.
- **Formato:** simulações com "blobs" animados no Blender, narração calma e música ambiente. Ele evita palavrão para que professores possam usar os vídeos em aula e diz que "evocar emoção faz parte do objetivo".
- **Estrutura:** regras simples → simulação → resultado surpreendente → análise (teoria dos jogos, equilíbrio de Nash) → nova simulação → mundo real.
- **Vídeos notáveis:**
  - *Simulating the Evolution of Aggression*: **25,0 mi** (2019, 13:17)
  - *Simulating Natural Selection*: 15,7 mi (2018, 10:00)
- **Dados:** o pico de replay fica no final, em ≈94% do vídeo.
- **O que levar:** personagens simples e "fofos" com gráficos limpos, e uma pausa para o espectador **prever** o resultado antes de mostrá-lo.

### 3.11 Peter Whidden (Pokémon com RL)
- **URL:** https://www.youtube.com/@peterwhidden. Tem 72,2 mil inscritos e um único vídeo: *Training AI to Play Pokemon with Reinforcement Learning* (08/10/2023), 33:53, **10,1 mi**.
- **Estrutura em duas camadas:** a primeira parte é a história para todo mundo e vai até o "First Outro" (20:07). Depois vem a parte técnica: desafios, simplificação, iteração eficiente, ambiente e função de recompensa, métricas e visualização, melhorias futuras e **"Run it yourself"**.
- **Comportamentos personificados:**
  - Capítulo "**PC Trauma**": a IA passa a evitar o PC depois de "perder" níveis ao depositar um Pokémon.
  - Capítulo "**Exploration, distraction**": a IA fica hipnotizada pela água e pelos NPCs em Pallet Town (HyScaler).
- **Visual:** capítulo "Map Visualizations", com trajetórias de muitas execuções desenhadas sobre o mapa. São mais de 50 mil horas de jogo acumuladas.
- **Dados:** os picos de replay estão em "RNG manipulation" (59%), "Future Improvements" (86%) e "Run it yourself" (97%). Ou seja, **a parte técnica também é revista**.
- **CTA:** código no GitHub e "Run it yourself". Tem humor até na descrição: *"Buy me a tuna melt"*.
- **O que levar:** separar "história" de "bastidores técnicos", transformar manias da IA em traços de personalidade e mostrar um mapa das 32 fases com trajetórias e mortes.

### 3.12 Kush Gupta
- **URL:** https://www.youtube.com/@KushGupta1. Tem 12,6 mil inscritos e 2 vídeos. *AI Learns to Speedrun Mario* (28/08/2023) dura 8:07 e tem **1,27 mi**.
- **Gancho:** promessa de recorde com lacuna de curiosidade: *"it might have hit the speedrun record. You have to watch to find out :)"*. Usa código open-source (*uvipen*) e dá o crédito.
- **CTA:** *"SUBSCRIBE and I'll make your AI ideas."*
- **O que levar:** um canal minúsculo chegou a 1,27 mi com Mario e uma aposta clara. Título simples, promessa forte.

### 3.13 AI Tango
- **URL:** https://www.youtube.com/@aitango. Tem 24,1 mil inscritos. Joga Mario Kart Wii com uma **variante do Rainbow DQN** (*AI Learns to DESTROY old CPUs*, **1,53 mi**, 2023). Também fez Super Mario 64, Smash e Galaxy.
- **Humor:** na descrição do canal, as IAs vão "encontrar novas e maravilhosas maneiras de me decepcionar".
- **O que levar:** o Rainbow, da mesma família do nosso Rainbow-IQN, rende vídeo popular quando o enquadramento é "IA contra CPUs ou contra humanos".

### 3.14 cozmouz
- **URL:** https://www.youtube.com/@cozmouz. Tem 98,8 mil inscritos. Slogan: *"I Torture AI Agents for a Living"*.
- **Títulos com compressão de tempo:**
  - *I Trapped this AI Centipede in a Simulation for 1000 Years*: 2,75 mi
  - *…Worm… 1000 Years*: 2,6 mi
- **Capítulos por sessão de treino:** "1st Training Session" → "2nd Prototype" → "Final Training Session".
- **O que levar:** transformar o tempo de treino em "anos" ou em "horas de jogo humano" é um gancho de título que já foi testado.

### 3.15 carykh (Evolution Simulator)
- **URL:** https://www.youtube.com/@carykh. Tem 740 mil inscritos. *Evolution Simulator (Part 1/4)* (2015) tem 5,2 mi.
- **Visual:** 1000 criaturas aleatórias, contador de geração, gráfico da distância mediana e gráfico de **espécies** ao longo das gerações.
- **O que levar:** um gráfico de linhagens ou "espécies" para a parte de neuroevolução.

### 3.16 Chrispresso
- **URL:** https://www.youtube.com/@Chrispresso. Tem 4,79 mil inscritos. *AI Learns to Play Super Mario Bros!* (2020) tem 362 mil views e usa uma **população** com algoritmo genético e rede neural.
- **Capítulos:** representação das entradas → rede e treino → resultados → fase avançada → "**Wall Jump Technique**" (a IA descobre uma técnica sozinha). O pico de replay fica em 89%.
- **O que levar:** o momento "a IA descobriu um truque" é obrigatório.

### 3.17 suckerpinch (Tom 7)
- **URL:** https://www.youtube.com/@tom7. Tem 202 mil inscritos. *Computer program that learns to play classic NES games* (01/04/2013) tem 2,2 mi e apresenta o learnfun & playfun (paper no SIGBOVIK).
- **Momento icônico:** no Tetris, o programa aprende a **pausar o jogo para sempre** para não perder.
- **O que levar:** é a referência perfeita para um segmento "a IA trapaceou a recompensa".

### 3.18 Outras referências úteis (formato e explicação)
- **Sebastian Lague** (https://www.youtube.com/@SebastianLague, 1,4 mi): série *Coding Adventure*, devlog calmo e muito visual (*Coding Adventure: Chess*, 4,2 mi).
- **ThinMatrix** (https://www.youtube.com/@ThinMatrix, 261 mil): devlogs de jogo indie (*My 10 YEAR Indie Game Development Journey*, 797 mil).
- **3Blue1Brown** (https://www.youtube.com/@3blue1brown, 8,68 mi): *But what is a neural network?*, 24 mi. É o padrão-ouro de visualização de rede neural.
- **Nicholas Renotte** (https://www.youtube.com/@NicholasRenotte, 329 mil): *Build an Mario AI Model with Python | Gaming Reinforcement Learning* (183 mil, 1h17). Mostra que existe um público técnico para "Mario + RL".

---

## 4. Canais brasileiros / em português (verificados)

**Como buscamos:** fizemos buscas no YouTube em PT-BR com os termos "IA aprende a jogar", "inteligência artificial aprende a jogar", "inteligência artificial aprendendo a jogar", "rede neural aprende a jogar", "aprendizado por reforço jogo", "IA aprende a jogar Mario", "treinei uma IA para jogar", "deixei uma IA evoluir", "neuroevolução jogo", "simulação de evolução inteligência artificial" e "Deep Q Learning jogo". **Só entram aqui canais reais, com página verificada.**

| Canal | Inscritos | O que faz | Vídeos de referência (views, data, duração) |
|---|---|---|---|
| [Universo Programado](https://www.youtube.com/@UniversoProgramado) | 612 mil | projetos próprios de IA em jogos (C + SDL) e explicações de papers | "IA destruindo no dinossauro da Google! (Rede Neural)": **4,48 mi** (jan/2019, 11:50) · "IA ESTACIONANDO carros!": **3,19 mi** (2020, 15:38) · "IA brincando de Pique-Esconde": 2,26 mi (2020) · "IA ZERANDO o jogo mais difícil do mundo!": **1,97 mi** (2020, 18:40) · "IA jogando Flappy Bird!!": 1,80 mi · "IA aprendendo a DIRIGIR!! (Deep Cars)": 1,58 mi · "IA jogando 2048!!": 1,54 mi · "IA aprendendo a pilotar FOGUETES!": 1,16 mi (2023, 24:00) · "Rede Neural aprendendo a jogar o jogo da cobrinha": 876 mil |
| [Ivan Seidel](https://www.youtube.com/@IvanSeidel) | 17,9 mil | pioneiro: projeto de faculdade com rede neural + algoritmo genético | "Inteligência Artificial com Dinossauro da Google": **1,26 mi** (dez/2015, 31:23) |
| [Filipe Deschamps](https://www.youtube.com/@FilipeDeschamps) | 818 mil | programação em geral | "Inteligência Artificial aprendendo a JOGAR!!! (com Redes Neurais e Algoritmos Genéticos)": 187 mil (jan/2019, 10:51). É a interpretação dele do vídeo do Ivan Seidel. |
| [Didática Tech](https://www.youtube.com/channel/UC0BiVs5EYh57gzGVvhddjsA) | 137 mil | cursos de IA e ML | "Inteligência Artificial aprende a jogar Street Fighter sozinha": **392 mil** (2020, 14:10). Aprende a partir dos pixels, no estilo DeepMind/Atari. |
| [Andrezitos](https://www.youtube.com/@Andrezitos) | 1,03 mi | entretenimento e gamedev (é autor de jogos como *9 Kings*) | "Deixei a A.I. evoluir sozinha e isso aconteceu...": **983 mil** (2023) · "Deixei a A.I. evoluir mais do que devia...": 804 mil (2024) · "A.I. aprendendo a PULAR (foi mais alto do que eu esperava)": 339 mil · "Criando meu próprio SIMULADOR de EVOLUÇÃO": 245 mil (ago/2026) |
| [IAxus](https://www.youtube.com/@iaxus3848) | 4,83 mil | notícias e explicações de IA | "IA aprende a jogar POKEMON com Aprendizado por Reforço": **188 mil** (out/2023). Explica em PT o projeto do Peter Whidden. |
| [Talendar](https://www.youtube.com/@talendar7068) | 1,78 mil | projetos de computação e IA | "Inteligência Artificial Aprende a Jogar Super Mario Bros (Aprendizado por Reforço)": 36 mil (abr/2021, 18:59). Usa Deep Q-Learning e, segundo a descrição, **"completou 20 dos 32 níveis"** · também fez neuroevolução (Snake, pouso na Lua) |
| [Ensinando Máquinas](https://www.youtube.com/channel/UCW-KXQEYn6Jk_do0n2ybh3A) | 14,6 mil | projetos de IA | "Fazendo um BOT que Joga Piano Tiles": 372 mil · "Inteligência Artificial Jogando Snake": 352 mil (algoritmo genético + rede neural) · "Inteligência Artificial Jogando Asteroids": 62 mil |
| [Programador Sagaz](https://www.youtube.com/@ProgramadorSagaz) | 40,7 mil | carreira e programação | "IA Aprende A Jogar 'Ping-Pong' Usando Rede Neural": 85 mil (2018) |
| [Ciência Todo Dia](https://www.youtube.com/@CienciaTodoDia) | 7,93 mi | divulgação científica (Pedro Loos) | "O Verdadeiro Problema de Inteligências Artificiais" (problema do alinhamento): **2,33 mi** (2023) · "DEEP LEARNING EXPLICADO": 305 mil |
| [Danilo Gato – Inteligência Artificial](https://www.youtube.com/@odanilogato) | 72,8 mil | sobretudo tutoriais de ferramentas de IA; começou a fazer experimentos de RL em set/2026 | "Dei um CORPO pra uma IA e ensinei ela a ANDAR do zero com aprendizado por reforço!": 2,9 mil (set/2026) |

**Sinais adjacentes, que não são RL:**
- **Pai Troll** (https://www.youtube.com/@ThePaiTroll, 1,48 mi) publicou *"Mario World, mas o Mario é uma Inteligência Artificial TROLL e IRRITANTE!"* (233 mil, jan/2026). Ele joga conversando com um "Mario IA", então não é aprendizado por reforço. Mesmo assim, confirma que **Mario + IA** atrai o público brasileiro.
- Existe um canal **"Code Bullet em Português"** (@CodeBullet_ptg) que republica vídeos do Code Bullet dublados e tem entre 2 e 13 views por vídeo. **Não verificamos se é oficial**, então não deve ser usado como referência.

### 4.1 Destaque: Universo Programado
- **Quem é:** Victor Dias, do Rio de Janeiro, bacharel em Ciência da Computação. No GitHub dele estão os repositórios *Dinossauro-Google* (873★), *DeepCars* e *FlappIA-Bird*. O canal se define assim: "muita programação (principalmente de jogos), algoritmos e bastante Inteligência Artificial".
- **Transparência técnica nas descrições:**
  - Dinossauro: perceptron multicamadas com 6 sensores, 6 neurônios ocultos e 3 saídas (agachar, pular, nada), ReLU, aprendizado por "**mutações aleatórias**" e população de 1000 a 5000 indivíduos. **É praticamente o nosso modo Neuroevolução.** O público brasileiro já conhece esse formato e gostou dele (4,48 mi).
  - "ZERANDO o jogo mais difícil do mundo": usa uma variante do **A\*** que procura caminho "no espaço e também no tempo" por causa dos inimigos que se movem. As 30 fases foram resolvidas em cerca de 18 min. **É o paralelo direto do nosso planejador físico (Adaptativa)**: o público aceita um "planejador" como IA (1,97 mi).
- **Extras e comunidade:** a descrição abre com "Seja muito bem vindo ao Universo Programado!". Oferece link de **timelapse do algoritmo executando**, de **editor de fases** ("crie suas próprias fases") e da **versão dele do jogo com as 30 fases**. Também indica vídeos de outros criadores brasileiros (Código Fonte TV, Filipe Deschamps).
- **Formato atual:** a duração típica é de ≈16 min, alternando projeto próprio com explicação de paper (Pique-Esconde, boxe, "Essa IA aprendeu a ganhar sem fazer NADA!", 382 mil).
- **Dados:** o pico de replay fica em 87% (Pique-Esconde), 94% (Estacionando) e 71% (Foguetes). Também aqui o clímax é o mais revisto.

### 4.2 Lições do lado brasileiro
1. **Fórmula de título do UP:** "Inteligência Artificial + verbo no gerúndio + OBJETO EM CAIXA ALTA + !". Exemplos: "...ESTACIONANDO carros!" (3,19 mi), "...aprendendo a DIRIGIR!!" (1,58 mi), "...ZERANDO o jogo mais difícil do mundo!" (1,97 mi).
2. **Embalagem de curiosidade:** "Deixei a A.I. evoluir sozinha e isso aconteceu..." (Andrezitos, 983 mil). Usa reticências e um parêntese de surpresa, como em "(foi mais alto do que eu esperava)".
3. **Explicar em PT-BR um sucesso gringo funciona:** o IAxus chegou a 188 mil views com 4,8 mil inscritos explicando o projeto de Pokémon do Peter Whidden.
4. **"32 fases" já tem precedente brasileiro:** o Talendar, com DQN, completou "20 dos 32 níveis". Um placar de **32/32** é um payoff natural para o nosso vídeo.
5. **Estrutura "um capítulo por adversário":** a Didática Tech fez um capítulo por oponente no Street Fighter (Honda, Chun Li, Sagat…). No nosso caso vira "um capítulo por mundo".
6. **O público de massa entende "IA cumpre a regra mas não o objetivo":** o vídeo de alinhamento do Ciência Todo Dia tem 2,33 mi, e o do UP sobre ganhar sem fazer nada tem 382 mil. Isso abre espaço para um segmento de *reward hacking*.
7. **Há uma lacuna:** em 2025 e 2026, o conteúdo brasileiro de "IA + jogo" migrou para LLMs e ferramentas. Projetos próprios de RL com vários métodos lado a lado são raros nas buscas que fizemos.

---

## 5. O que os números dizem

### 5.1 Durações típicas
Medianas calculadas sobre até 20 vídeos (populares + recentes) de cada canal:

| Canal | Mediana | Canal | Mediana |
|---|---|---|---|
| Two Minute Papers | 5:26 | Pezzza's Work | 13:39 |
| Kush Gupta | 8:31 | Primer | 14:03 |
| Chrispresso | 9:16 | Universo Programado | 15:59 |
| carykh | 9:45 | Yosh | 16:08 |
| AI Tango | 10:17 | Code Bullet | 17:14 |
| cozmouz | 10:38 | Andrezitos | 18:31 |
| AI Warehouse | 10:45 | Emergent Garden | 23:52 |
| b2studios | 12:39 | Peter Whidden | 33:53 (vídeo único) |

**Conclusão:** de **10 a 13 min** é o terreno dos canais "IA + jogo" mais focados (AI Warehouse, cozmouz, b2studios, AI Tango). Para ir além de 15 min, o vídeo precisa de uma jornada longa (Yosh) ou de devlog junto (Code Bullet).

### 5.2 Introdução e ritmo dos blocos
Amostra de 24 vídeos de RL e evolução com capítulos:
- **Primeiro bloco (intro):** mediana de **43 s**, variando de 17 s a 2:46. Jump King tem 0:17, Donkey Kong 0:23, Happy Wheels 0:27, Mario do Code Bullet 0:37, MarI/O 0:35, Yosh de 0:40 a 1:04.
- **Distância entre capítulos:** mediana de **1:24**. Entre os mais rápidos, Two Minute Papers fica em ≈0:31 e MarI/O em ≈0:26. Code Bullet e Yosh ficam entre 1:20 e 1:45.

### 5.3 Onde está o pico de "Mais repetidos"

| Vídeo | Duração | Pico mais forte | O que acontece |
|---|---|---|---|
| AI Warehouse: Walk | 8:40 | 5:58 (69%) | clímax final |
| AI Warehouse: Tag | 10:29 | 8:35 (82%) | final |
| Code Bullet: Jump King | 27:12 | 23:39 (87%) | resultado final do treino |
| Yosh: Drive From Scratch | 16:51 | 14:19 (85%) | "Combine" (resultado) |
| b2studios: Monopoly | 11:30 | 9:05 (79%) | descobertas finais |
| Kush Gupta: Mario speedrun | 8:07 | 6:24 (79%) | reta final |
| Chrispresso: SMB | 9:04 | 8:04 (89%) | final |
| Primer: Aggression | 13:17 | 12:29 (94%) | conclusão |
| Pezzza: Predator vs Prey | 12:15 | 11:16 (92%) | timelapse |
| cozmouz: Centipede | 10:25 | 10:06 (97%) | sessão final |
| Universo Programado: Pique-Esconde | 13:11 | 11:28 (87%) | final |
| Universo Programado: Estacionando | 15:38 | 14:41 (94%) | final |
| Universo Programado: Foguetes | 24:00 | 17:02 (71%) | último terço |
| Code Bullet: Flappy Bird | 7:46 | 4:39 (60%) | IA jogando |
| Peter Whidden: Pokémon | 33:53 | 19:59 (59%) | manipulação de RNG (picos quase iguais em 86% e 97%) |
| SethBling: MarI/O | 5:58 | 3:09 (53%) | explicação da rede de exemplo |
| Code Bullet: Mario (2026) | 13:55 | 5:59 (43%) | fim do patrocínio (efeito de quem pula o patrocínio) |
| Yosh: unbeatable AI | 20:41 | 8:16 (40%) | treino no mapa complexo |
| Code Bullet: Donkey Kong | 29:46 | 11:36 (39%) | treino com algoritmo genético |
| Code Bullet: Walk | 16:15 | 4:42 (29%) | teste do editor de física (gag) |

**Leitura:**
- Em **13 de 20** vídeos, o momento mais revisto está no último terço. Guarde o melhor material (corrida final, recorde, timelapse) para **75–90%** do vídeo.
- Uma **explicação visual bem-feita** também é revista (MarI/O).
- Um pico logo **depois do patrocínio** quase sempre é gente pulando o patrocínio, não interesse no conteúdo.

### 5.4 Fórmulas de título comprovadas
- **"AI Learns to [verbo] [jogo]"**: AI Warehouse *Walk* (13,7 mi), Code Bullet *Flappy Bird* (14,8 mi), Kush Gupta *Speedrun Mario* (1,27 mi), Code Bullet *Play Mario* (1,46 mi).
- **"Training an unbeatable AI in [jogo]"**: Yosh, 17,65 mi. É a fórmula do desafio contra o próprio criador.
- **Parêntese de caos**, como "*(and breaks the game)*": AI Warehouse, 9,6 mi.
- **Compressão de tempo**, como "*…for 1000 Years*": cozmouz, 2,75 mi. AI Tango usa "*1000 DAYS OF SELF-PLAY*".
- **Em PT**, "Inteligência Artificial [gerúndio] [OBJETO]!": UP com 4,48 mi, 3,19 mi e 1,97 mi. E "Deixei a A.I. … e isso aconteceu…": Andrezitos, 983 mil.

### 5.5 "Comparar métodos" é um formato provado
- **Code Bullet, *Donkey Kong*:** algoritmo genético → NEAT → PPO, 5,3 mi.
- **Yosh, *Drive From Scratch*:** algoritmo genético → DQN → combinação, 7,45 mi.
- **Universo Programado:** varia de método conforme o projeto (mutações aleatórias, algoritmo genético, A\*) e explica cada um na descrição.

---

## 6. Guia de estilo para o nosso vídeo

> Esta seção é **recomendação nossa**, construída a partir dos padrões acima. Onde dá, cada item indica o criador ou dado que o inspira.

### 6.1 Fórmulas de gancho (primeiros 30 s)

**Regra dos 30 s.** O YouTube mede quantos espectadores ainda estão assistindo aos 30 s (métrica "Intro"). Se a abertura não entrega o que o título e a thumbnail prometeram, a pessoa vai embora.
- **0–5 s:** imagem de payoff.
- **5–15 s:** objetivo e aposta.
- **15–25 s:** o que é novo (64 agentes, 32 fases, navegador, 4 cérebros).
- **25–30 s:** uma pergunta aberta.
- **Nada de** "fala galera, tudo bem?" antes do gancho.

| # | Fórmula | Inspiração | Exemplo para o Mario RL Lab (rascunho em PT-BR) |
|---|---|---|---|
| G1 | **Antes e depois em 6 s** | padrão do gênero; Yosh, Code Bullet | *(64 Marios caem juntos no primeiro buraco: "GERAÇÃO 1". Corte seco para um único Mario atravessando a fase em velocidade: "GERAÇÃO 300".)* "Isso aqui era a mesma inteligência artificial. A diferença? Umas 12 mil mortes." |
| G2 | **Promessa + aposta contra o criador** | Yosh, "…until I couldn't beat it" | "Eu dei pra 64 IAs um Mario feito do zero, com 32 fases, e uma única regra: aprender sozinhas. Vou treinar até que elas me vençam na última fase." |
| G3 | **Torneio de cérebros** | Code Bullet DK, Yosh 2022 | "Neuroevolução, Double DQN, Rainbow-IQN ou um planejador que ensina uma rede? Quatro cérebros, as mesmas fases. Só um chega no último castelo." |
| G4 | **Contador de falhas** | Code Bullet; *schadenfreude* de robô (TIME) | *(montagem de mortes com o contador subindo de 0 para 12.408)* "Essa é a história de 12.408 mortes… e de uma vitória." |
| G5 | **Spoiler parcial** | Kush Gupta, "you have to watch to find out" | *(a melhor IA a 1 bloco da bandeira, frame congelado)* "Se ela conseguiu? Primeiro, deixa eu te mostrar como ela era burra." |
| G6 | **A IA trapaceou** | AI Warehouse, "(and breaks the game)"; Tom 7 | "Em algum momento desse treino, uma das IAs descobriu um jeito de ganhar pontos sem jogar. E a culpa foi minha." |

> Os números dos exemplos (12 mil mortes, geração 300) são **marcadores**. Troque pelos valores reais dos runs em `video/data/runs`.

### 6.2 Ritmo e pacing
- **Intro ≤ 40–45 s.** A mediana do gênero é 43 s.
- **Um bloco novo a cada 60–100 s** (mediana de 1:24): método novo, virada, descoberta ou placar.
- **Nas montagens, uma micro-gag a cada 20–40 s:** efeito sonoro, zoom, legenda irônica, congelamento de frame. *(Heurística nossa.)*
- **Recap a cada 2–3 min:** mostrar o placar das 32 fases e lembrar "onde estamos".
- **Velocidade explícita:** "x64" no canto durante o treino acelerado, voltando a 1x (ou câmera lenta) nos saltos decisivos.
- **Explicação de no máximo 45–60 s**, sempre seguida de resultado na tela. O SethBling explica *por cima* da gameplay.
- **Clímax entre 75% e 90%** do vídeo (13 de 20 picos estão no último terço).
- **Patrocínio, se houver:** depois do primeiro payoff, por volta de 30–40% (o Code Bullet coloca em ~34%). E curto, porque as pessoas pulam.

### 6.3 Estrutura em atos (alvo de ~11:30)

| Tempo | Bloco | Conteúdo | Tela / gag |
|---|---|---|---|
| 0:00–0:30 | **Cold open + promessa** | Geração 1 vs final; frase-promessa; os 4 cérebros aparecem 1 s cada | contador de mortes disparando; ícone e cor de cada método |
| 0:30–1:15 | **O laboratório** (devlog relâmpago) | 32 fases recriadas do zero, no navegador, sem ROM; 64 agentes; o que a IA "vê" (sensores); a tabela de pontos | pop-ups de "+1 / +2 / −1 / +100"; *speedrun* do devlog em x16 |
| 1:15–3:15 | **Cérebro 1: Neuroevolução** | 64 redes aleatórias (44→12→2) com mutação, como um "reality show"; caos na Geração 1 → primeira fase vencida → limite | HUD estilo MarI/O; fantasmas coloridos; o campeão ganha nome |
| 3:15–5:00 | **Cérebro 2: Double DQN** | "caderno de jogadas" (replay), "dado da curiosidade" (ε), "dois juízes" (Double) | uma mania ou personalidade; compilação "jeitos idiotas de morrer" |
| 5:00–5:45 | **Interlúdio: a IA trapaceou** | editar uma recompensa ao vivo → exploit → conserto | referência ao Tetris pausado e ao barco do CoastRunners |
| 5:45–7:30 | **Cérebro 3: Rainbow-IQN** | "o mesmo aluno com 6 superpoderes"; a visão 12×6×4 (400 sensores) | tela dividida com o DQN; curva de aprendizado comparada |
| 7:30–9:15 | **Cérebro 4: Adaptativa + "Aprender comigo"** | planejador físico ("GPS de futuros") gera o gabarito, a rede imita (DAgger); eu jogo e ela aprende | humano vs IA; "o aluno supera o professor?" |
| 9:15–10:45 | **Grande final** | torneio dos 4 cérebros nas mesmas fases, de preferência com o mesmo orçamento de treino; placar das 32 fases; tentativa na 8-4 | câmera lenta no salto decisivo; silêncio e depois música |
| 10:45–11:30 | **Conclusão + CTA** | em que cada método é melhor; números finais (mortes, gerações, horas); link "treine você mesmo"; desafio; próximo vídeo | bordão de despedida |

**Variante em duas camadas (Peter Whidden):** depois do encerramento, 60–90 s de "bastidores técnicos" para quem quiser ficar, ou um vídeo separado com a versão técnica. O pico de replay dele na parte técnica mostra que esse público existe.

### 6.4 Como explicar os 4 métodos (analogias)

| Método | Analogia | Visual sugerido | Frase pronta (rascunho) |
|---|---|---|---|
| **RL em geral** | adestrar um bichinho com petisco (Yosh) | pop-ups de pontos sobre o Mario | "Ninguém ensina o Mario a pular. A gente só dá um petisco quando ele faz algo bom e um puxão de orelha quando morre." |
| **Neuroevolução** (44→12→2, mutação) | reality show / seleção natural (MarI/O, carykh) | grade 8×8 com os 64; os melhores ganham coroa e "filhos" levemente mutados; árvore de linhagem | "Aqui ninguém aprende nada em vida. Quem vai mais longe tem filhos, e os filhos nascem com pequenas mutações. É Darwin com cogumelo." |
| **Double DQN** (44→32→6, replay, ε-greedy) | aluno com caderno de jogadas, dado da curiosidade, dois juízes | caderno folheando páginas (memórias); dado rolando; dois juízes com plaquinhas | "Esse é um estudante: anota cada jogada num caderno e revisa à noite, misturando páginas velhas e novas. Às vezes joga um dado e aperta um botão aleatório só pra ver o que acontece. E, pra não se achar demais, um juiz escolhe a jogada e outro dá a nota." |
| **Rainbow-IQN** (Double + dueling + replay priorizado + 5 passos + NoisyNets + IQN; 400 sensores) | o mesmo aluno com **6 superpoderes** | 6 "cartas de poder" aparecendo; a grade 12×6×4 como minimapa pixelado do que a IA enxerga | "Dueling: separa 'essa situação é boa?' de 'qual botão é melhor?'. Prioridade: estuda mais as provas que errou. Cinco passos: antes de dar nota, olha cinco jogadas à frente. Ruído na rede: a curiosidade vem de dentro do cérebro, não de um dado. E o IQN não pensa só na média: imagina o melhor e o pior cenário, como previsão do tempo com chance de chuva." |
| **Adaptativa** (planejador *beam search* + imitação, inspirada em DAgger) | GPS + aprendiz | árvore de futuros desenhada à frente do Mario, com os galhos ruins se apagando | "O planejador é um GPS: simula vários futuros com a física do jogo e fica com os melhores caminhos. A rede é o aprendiz que copia o GPS. E quando o aprendiz se mete numa enrascada nova, o GPS corrige exatamente ali. Essa é a ideia do DAgger." |
| **"Aprender comigo"** | eu viro o GPS (precedente: o MariFlow do SethBling) | picture-in-picture das minhas mãos ou do teclado; contador "exemplos ensinados" | "Agora o professor sou eu. Cada vez que eu jogo, ela anota. A pergunta é: ela vai copiar meus erros também?" |

**Regras para as explicações:**
- Uma analogia por método, mantida até o fim do vídeo.
- Um visual que **se mexe**.
- No máximo 2 termos técnicos por bloco, mostrados como legenda (ex.: "replay buffer").
- Fechar sempre com o resultado na tela.

### 6.5 Gags recorrentes (personagens, contadores e compilações)
1. **Nomes para os agentes** (precedentes: Albert e Kai, Charles). Sugestões: "Darwin" (Neuroevolução), "Dênis" (D-Q-N), "Arco-Íris" (Rainbow), "Ada" (Adaptativa). Outra opção é numerar o campeão de cada geração ("Marinho I, II, III…").
2. **Rivalidade** no estilo Albert vs Kai: o Rainbow é o "nerd caro" com 400 sensores; a Adaptativa é a "aluna aplicada que cola do GPS".
3. **Contador de mortes permanente** no HUD, com "causa da morte" (buraco, inimigo, tempo esgotado).
4. **Compilação "os jeitos mais idiotas de morrer"**, de 15 a 25 s, com música. O público adora ver robô falhando (*schadenfreude*, TIME 2026).
5. **"A IA trapaceou"** (Tom 7 e o Tetris pausado; o barco do CoastRunners que fica girando para pegar pontos; a lista da DeepMind). Mude uma recompensa ao vivo, por exemplo "+0,2 por bloco seguro" sem exigir progresso, mostre o exploit e depois conserte. Isso transforma as recompensas editáveis em história.
6. **Traumas e manias** (o "PC Trauma" do Peter Whidden): "a geração 40 desenvolveu medo de cano", "o DQN descobriu que ficar parado é ruim… mas pular parado é ótimo". **Só use comportamentos que realmente aconteceram nos runs.**
7. **Criador humilhado** (autodepreciação do Code Bullet; as IAs que "decepcionam" do AI Tango): "eu levei X tentativas na 4-4; ela levou Y".
8. **Vilão de pressão** (o *DEATH LAZER* do Code Bullet): a penalidade de −0,05/s parado vira um **taxímetro** que corre na tela enquanto o agente enrola.
9. **Bordão de despedida** (no estilo Two Minute Papers): por exemplo, "Até a próxima geração!".
10. **Pausa dramática:** zoom e silêncio antes de um salto difícil, depois o resultado com música.

### 6.6 Como mostrar o progresso do treino
- **HUD estilo MarI/O:** `Ger 37 · agente 12/64 · fitness 1.240 · recorde 1.880 · mortes 18.403`.
- **Fantasmas coloridos** (Yosh): os 64 agentes semitransparentes, vermelho no início → amarelo → verde no fim, com o líder destacado por contorno ou coroa.
- **Tela dividida:** Geração 1 vs Geração N, ou um **2×2 com os 4 métodos** na mesma fase.
- **Curva de aprendizado** com um marcador "você está aqui" e anotações de "eureka" (ex.: "aqui ela descobriu o pulo no inimigo").
- **Placar das 32 fases** (precedente: Talendar com 20/32): um mapa-múndi ou álbum de figurinhas com as fases conquistadas por cada método, voltando a cada 2–3 min.
- **Mapa de mortes e trajetórias por fase** (os mapas do Peter Whidden): onde a população morre mais.
- **Conversão de tempo** (cozmouz, AI Tango): "isso equivale a N horas de uma pessoa jogando sem parar".
- **Timelapse final** (Pezzza; "timelapse do algoritmo" do UP) das 32 fases.
- **Treino sem cortes** num vídeo ou live separado (*Code Bullets Day Off*).

### 6.7 Final e CTA
- **"Treine você mesmo no navegador"**, com link fixado. Precedentes: *Run it yourself* do Peter Whidden, o Jump King jogável do Code Bullet e "minha versão do jogo (com as 30 fases)" do UP. **Esse é o nosso maior trunfo:** roda no navegador.
- **Desafio:** "consegue bater a IA na 8-4 no modo Aprender comigo? Manda o print."
- **Próximo vídeo escolhido nos comentários** (Kush Gupta: *"I'll make your AI ideas"*).
- **Comentário fixado com os detalhes técnicos** (AI Warehouse): arquiteturas, hiperparâmetros e tabela de recompensas.
- **Tela final** apontando para o "treino sem cortes" ou para a "versão técnica".
- **Fechar com o bordão.** Não termine num gráfico: termine numa imagem, como o agente na bandeira da 8-4.

### 6.8 15 técnicas acionáveis
1. **Cold open "Geração 1 vs Geração final" em ≤ 8 s.** É o payoff visual imediato. *(Gênero; métrica Intro do YouTube.)*
2. **Promessa + aposta numa frase até 0:15.** Modelo do Yosh: "treinei… até ela me vencer".
3. **Dê nome, cor e ícone a cada método e mantenha em TODO lugar:** HUD, gráficos, thumbnail, legendas. *(Albert/Kai; Charles.)*
4. **HUD estilo MarI/O,** com geração, agente, fitness, recorde e mortes.
5. **Fantasmas coloridos por geração,** com os 64 sobrepostos e o líder destacado. *(Yosh.)*
6. **Pontos flutuando na tela** ("+1 plataforma nova", "+2 passou", "−1 morte", "+100 fim da fase", "+0,2 bloco seguro", "−0,05/s parado"). O espectador aprende a função de recompensa sem aula. *(O MarI/O mostrava o fitness.)*
7. **Escada de métodos:** cada cérebro tem um mini-arco (promessa → falha engraçada → ajuste → conquista → limite) e passa o bastão: "ela travou na 1-3… hora de um cérebro mais forte". *(Code Bullet DK; Yosh 2022.)*
8. **Explicação de ≤ 60 s com analogia e imagem que se mexe,** sempre seguida de resultado. *(SethBling; Yosh e o bichinho.)*
9. **Segmento "a IA trapaceou",** editando uma recompensa ao vivo. *(Tom 7; DeepMind/CoastRunners; UP "ganhar sem fazer NADA".)*
10. **Personalidade a partir de manias reais.** *("PC Trauma" do Peter Whidden.)*
11. **Contador de mortes e compilação de falhas com música.** *(Code Bullet; TIME sobre a schadenfreude de robô.)*
12. **Humano vs IA no "Aprender comigo":** eu ensino, ela imita, e no fim "o aluno supera o professor?". *(Yosh; MariFlow do SethBling.)*
13. **Placar das 32 fases** como fio condutor e recap a cada 2–3 min. *(Talendar, 20/32.)*
14. **Clímax entre 75% e 90%:** torneio final e tentativa na 8-4 em câmera lenta. *(13 de 20 picos de replay estão no último terço.)*
15. **Final com "rode você mesmo no navegador",** desafio e enquete do próximo desafio, além de comentário fixado com os detalhes técnicos. *(Peter Whidden; Code Bullet; UP; Kush Gupta; AI Warehouse.)*

**Bônus:** publique o treino sem cortes ou o timelapse das 32 fases como vídeo à parte, e tire 3 Shorts do material: "Geração 1 vs 500" (15–20 s), "a IA trapaceou" (30 s) e "eu vs IA na 8-4" (30 s).

### 6.9 Títulos e thumbnails

**5 opções de título em PT-BR:**
1. **"Treinei 64 IAs para zerar as 32 fases do Mario"**: números concretos e a fórmula "treinei…" (Yosh, cozmouz).
2. **"Inteligência Artificial aprendendo a jogar MARIO! (4 métodos diferentes)"**: fórmula do Universo Programado (até 4,48 mi).
3. **"4 cérebros, 1 Mario: qual IA zera o jogo primeiro?"**: formato de torneio, com lacuna de curiosidade.
4. **"Ensinei uma IA a jogar Mario… e ela aprendeu a TRAPACEAR"**: curiosidade no estilo "(and breaks the game)". Só use se o exploit aparecer no vídeo.
5. **"Treinei uma IA de Mario até eu não conseguir mais vencer"**: fórmula do Yosh (17,7 mi) somada ao "Aprender comigo".

> "Mario" no título tem precedentes (Code Bullet, Kush Gupta, Talendar). Mas o projeto não usa ROM nem código da Nintendo e recria as fases de forma independente, então **use só sprites e arte do próprio projeto na thumbnail**. A Nintendo tem histórico de derrubar fan games: em 2016, mandou derrubar 562 jogos no Game Jolt. Na descrição, vale dizer "jogo de plataforma estilo Mario, recriado do zero".

**3 ideias de thumbnail:**
- **A. "GEN 1 vs GEN 500" (antes e depois):** diagonal dividida. À esquerda, um enxame de Marios do projeto despencando num buraco, com fundo avermelhado e "GEN 1". À direita, um único Mario de coroa na bandeira, com fundo verde e "GEN 500". No máximo 2 palavras de cada lado.
- **B. "4 CÉREBROS":** quatro cérebros estilizados nas cores dos métodos (as mesmas do HUD), cada um ligado por um fio a um Mario na linha de largada. Texto: "QUAL VENCE?".
- **C. "EU vs IA":** à esquerda, o criador ou suas mãos no teclado, com cara de choque. À direita, o Mario-IA com olhos brilhando e a grade 12×6×4 luminosa por cima. Um selo com o placar "8-4: EU 0 × 1 IA" ou "12.408 MORTES".

**Regras gerais:**
- No máximo 3 elementos.
- Texto de até 3 palavras e que **não repita o título**.
- Alto contraste e legível em tamanho de celular.
- A promessa da thumbnail precisa aparecer nos primeiros 30 s. O YouTube relaciona a retenção da intro com a expectativa criada pelo título e pela thumbnail.

### 6.10 O que evitar
- Saudação longa ou vinheta antes do gancho.
- Explicar matemática antes de mostrar o problema na tela.
- Mostrar treino sem objetivo claro (o que significa vencer?) e números sem referência. Diga sempre "x de 32".
- Métodos sem identidade visual fixa, com cores ou nomes que mudam de um bloco para outro.
- Explicações de mais de 90 s sem imagem nova.
- Terminar no gráfico ou num "é isso, pessoal" sem payoff.
- Inventar manias que não aconteceram nos runs. O público técnico percebe, e o comentário fixado com os dados reais protege a credibilidade.
- Usar arte oficial da Nintendo na thumbnail.

### 6.11 Checklist de overlays para a edição (Remotion)
Os componentes que esse guia pressupõe:
- `HUD` (geração, agente, fitness, recorde, mortes)
- `RewardPopup` (+1, +2, −1, +100, +0,2, −0,05/s)
- `MethodBadge` (nome, cor e ícone de cada cérebro)
- `GhostLegend` (vermelho → amarelo → verde)
- `StageBoard` (placar das 32 fases)
- `LearningCurve` com marcador e anotações
- `DeathCounter`
- `SpeedTag` (x1, x16, x64)
- `SplitScreen2x2`

---

## 7. Fontes

**Dados do YouTube** (páginas públicas de canais e vídeos, lidas em 06/10/2026; inscritos, views, datas, durações, capítulos e gráfico "Mais repetidos"):
- Code Bullet: https://www.youtube.com/@CodeBullet · https://www.youtube.com/watch?v=zy-ZowzY8rI · https://www.youtube.com/watch?v=ovIykchkW5I · https://www.youtube.com/watch?v=DmQ4Dqxs0HI · https://www.youtube.com/watch?v=WSW-5m8lRMs · https://www.youtube.com/watch?v=K-wIZuAA3EY · https://www.youtube.com/watch?v=tjQIO1rqTBE · https://www.youtube.com/watch?v=0EVEzVz1iTY
- AI Warehouse: https://www.youtube.com/@aiwarehouse · https://www.youtube.com/watch?v=L_4BPjLBF4E · https://www.youtube.com/watch?v=hCmrMOzx5VA · https://www.youtube.com/watch?v=v3UBlEJDXR0 · https://www.youtube.com/watch?v=ta99S6Fh53c
- SethBling: https://www.youtube.com/@SethBling · https://www.youtube.com/watch?v=qv6UVOQ0F44
- b2studios: https://www.youtube.com/@b2stud · https://www.youtube.com/watch?v=dkvFcYBznPI · https://www.youtube.com/watch?v=Y48Vk77MoYg
- Yosh: https://www.youtube.com/@yoshtm · https://www.youtube.com/watch?v=Dw3BZ6O_8LY · https://www.youtube.com/watch?v=SX08NT55YhA · https://www.youtube.com/watch?v=zFLQU70QstY · https://www.youtube.com/watch?v=1AGVABna3xQ
- Pezzza's Work: https://www.youtube.com/@PezzzasWork · https://www.youtube.com/watch?v=qwrp3lB-jkQ · https://www.youtube.com/watch?v=aBp-3pmKNBY
- Two Minute Papers: https://www.youtube.com/@TwoMinutePapers · https://www.youtube.com/watch?v=Lu56xVlZ40M · https://www.youtube.com/watch?v=V1eYniJ0Rnk
- sentdex: https://www.youtube.com/@sentdex · https://www.youtube.com/watch?v=ks4MPfMq8aQ · https://www.youtube.com/watch?v=KSX2psajYrg · https://www.youtube.com/watch?v=rvnHikUJ9T0
- Emergent Garden: https://www.youtube.com/@EmergentGarden · https://www.youtube.com/watch?v=TkwXa7Cvfr8 · https://www.youtube.com/watch?v=KxaPYhfJV4U
- Primer: https://www.youtube.com/@PrimerBlobs · https://www.youtube.com/watch?v=YNMkADpvO4w · https://www.youtube.com/watch?v=0ZGbIKd0XrM
- Peter Whidden: https://www.youtube.com/@peterwhidden · https://www.youtube.com/watch?v=DcYLT37ImBY
- Kush Gupta: https://www.youtube.com/@KushGupta1 · https://www.youtube.com/watch?v=OQitI066aI0
- AI Tango: https://www.youtube.com/@aitango · https://www.youtube.com/watch?v=VIwGxOdXGfw
- cozmouz: https://www.youtube.com/@cozmouz · https://www.youtube.com/watch?v=oFqwcngsts8
- carykh: https://www.youtube.com/@carykh · https://www.youtube.com/watch?v=GOFws_hhZs8
- Chrispresso: https://www.youtube.com/@Chrispresso · https://www.youtube.com/watch?v=CI3FRsSAa_U
- suckerpinch: https://www.youtube.com/@tom7 · https://www.youtube.com/watch?v=xOCurBYI_gY
- Outras: https://www.youtube.com/@SebastianLague · https://www.youtube.com/@ThinMatrix · https://www.youtube.com/@3blue1brown · https://www.youtube.com/watch?v=aircAruvnKk · https://www.youtube.com/@NicholasRenotte · https://www.youtube.com/watch?v=2eeYqJ0uBKE
- Brasil:
  - Universo Programado: https://www.youtube.com/@UniversoProgramado · https://www.youtube.com/watch?v=NZlIYr1slAk · https://www.youtube.com/watch?v=r8KWciNmEGw · https://www.youtube.com/watch?v=46SLsu4ihqA · https://www.youtube.com/watch?v=QD-gHp81G4M · https://www.youtube.com/watch?v=vavXvu_SMeM · https://www.youtube.com/watch?v=gnfkfUQvKDw · https://www.youtube.com/watch?v=BQ6a8Thjpsk · https://www.youtube.com/watch?v=Y_Qv6hsW3oI · https://www.youtube.com/watch?v=awz1ghokP3k · https://www.youtube.com/watch?v=leehJmA7_e8 · https://www.youtube.com/watch?v=Tg6-yDPlOcc
  - Ivan Seidel: https://www.youtube.com/@IvanSeidel · https://www.youtube.com/watch?v=P7XHzqZjXQs
  - Filipe Deschamps: https://www.youtube.com/@FilipeDeschamps · https://www.youtube.com/watch?v=aTRLMi70lxk
  - Didática Tech: https://www.youtube.com/channel/UC0BiVs5EYh57gzGVvhddjsA · https://www.youtube.com/watch?v=3SLNbON-upI
  - Andrezitos: https://www.youtube.com/@Andrezitos · https://www.youtube.com/watch?v=kPyzEE3p3Vk · https://www.youtube.com/watch?v=Z4dv5jOzHnM · https://www.youtube.com/watch?v=vDkDb0SGKQM · https://www.youtube.com/watch?v=DPWFVbE-cZk
  - IAxus: https://www.youtube.com/@iaxus3848 · https://www.youtube.com/watch?v=pjjWiuTmGmg
  - Talendar: https://www.youtube.com/@talendar7068 · https://www.youtube.com/watch?v=9nqwVYCxQls
  - Ensinando Máquinas: https://www.youtube.com/channel/UCW-KXQEYn6Jk_do0n2ybh3A · https://www.youtube.com/watch?v=0WVAWjVOygE · https://www.youtube.com/watch?v=M2PKAHv8jqc
  - Programador Sagaz: https://www.youtube.com/@ProgramadorSagaz · https://www.youtube.com/watch?v=ETn61j8kIaU
  - Ciência Todo Dia: https://www.youtube.com/@CienciaTodoDia · https://www.youtube.com/watch?v=IH-wBijX53M
  - Danilo Gato: https://www.youtube.com/@odanilogato · https://www.youtube.com/watch?v=OXi0OILqqPY
  - Pai Troll: https://www.youtube.com/@ThePaiTroll · https://www.youtube.com/watch?v=87qQAUXsRTs
  - Code Bullet em Português: https://www.youtube.com/@CodeBullet_ptg

**Artigos, wikis e documentos:**
- MarI/O, Wikipedia: https://en.wikipedia.org/wiki/SethBling
- Código do MarI/O, gist do SethBling (população, HUD e fitness): https://gist.github.com/SethBling/598639f8d5e8afb5453a0b9519be51ff
- Engadget sobre o MarI/O: https://www.engadget.com/2015-06-17-super-mario-world-self-learning-ai.html
- AI Warehouse, Hackaday: https://hackaday.com/2023/07/21/ai-learns-to-walk-in-3d-training-grounds/
- AI Warehouse, 80.lv: https://80.lv/articles/ai-teaches-itself-to-walk-using-deep-reinforcement-learning
- AI Warehouse, YouTube Wiki (fandom): https://youtube.fandom.com/wiki/AI_Warehouse
- Code Bullet, YouTube Wiki (fandom): https://youtube.fandom.com/wiki/Code_Bullet
- Code Bullet, entrevista (NTP Talent): https://ntptalent.com.au/community-spotlight-interview-with-code-bullet/
- Two Minute Papers, YouTube Wiki (fandom): https://youtube.fandom.com/wiki/Two_Minute_Papers
- "Hold on to your papers": https://hinative.com/questions/16348670 · https://www.patreon.com/cw/TwoMinutePapers
- Primer, YouTube Wiki (fandom): https://youtube.fandom.com/wiki/Primer
- Yosh, The Autopian: https://www.theautopian.com/how-a-youtuber-spent-years-teaching-ai-how-to-beat-him-at-virtual-racing/
- Yosh, Hall of Dreams: https://hallofdreams.org/posts/trackmania-1/
- Yosh, PC Gamer (resultado de busca): https://www.pcgamer.com/one-mans-years-long-quest-to-train-an-unbeatable-trackmania-ai-may-have-finally-crossed-the-line/
- Peter Whidden, HyScaler: https://hyscaler.com/insights/ai-learns-pokemon-red-in-50000-hours/
- carykh Evolution Simulator, wiki: https://carykh.fandom.com/wiki/Evolution_Simulator
- b2studios Monopoly, Adafruit: https://blog.adafruit.com/2022/01/17/ai-learns-insane-monopoly-strategies/
- Tom 7 e o Tetris pausado, Hacker News: https://news.ycombinator.com/item?id=5548556
- Specification gaming, DeepMind: https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/
- Universo Programado, GitHub de Victor Dias: https://github.com/JVictorDias
- Métrica "Intro" (30 s) e momentos-chave de retenção, YouTube Help: https://support.google.com/youtube/answer/9314415
- "Why We Love Watching Robots Fail", TIME (27/08/2026): https://time.com/article/2026/08/27/why-we-love-watching-robots-fail/
- Nintendo derruba 562 fan games no Game Jolt, Game Developer: https://www.gamedeveloper.com/business/500-fan-games-on-game-jolt-targeted-by-nintendo-dmca-takedown
