# Pacote de roteiro: 3 IAs criam as próprias IAs para zerar Pokémon FireRed

Para o Fable (storyboard) e para a sessão que edita. Fontes: pokemon/ENTREGAS.md, os três agente.py, gpt/README.md, gemini/log_INVENTADO_pelo_gemini_antes_de_rodar.jsonl, e os branches `pokemon-resultado-claude`, `pokemon-resultado-gemini` e `pokemon-parcial-gpt` (log.jsonl, trajeto.jsonl.gz, treino.log, progresso.txt). Todos os números abaixo foram contados por script direto no `trajeto.jsonl.gz` (cada linha = 1 passo = 24 quadros = 0,4 s de jogo) e no `log.jsonl`. Tempo de jogo = quadros / 60.

Regras do canal que valem aqui: sem emoji no vídeo (selos e ícones em SVG), o narrador nunca diz nem sugere que é o Claude ou uma IA da Anthropic (o Claude é um dos três concorrentes: tratá-lo como os outros, sem torcida), pensamento com eco e nunca sussurro, clímax nos primeiros ~10 s, melhor momento por último, fechar com pergunta, nada de jargão lido em voz alta.

## Avisos de dados (leia antes de usar qualquer número ou fala)

1. **GPT: o branch `pokemon-parcial-gpt` só vai até o quadro 415.536** (4% da partida; 13% dos 30% que o vídeo vai usar), salvo às 14:27 UTC de 12/11. O `pokemon-resultado-gpt` ainda não chegou. Tudo que este pacote diz da partida do GPT vale só até 1 h 55 min de jogo. Quando o branch final chegar, refazer a seção do GPT (cenas P3 e P4) com os 30% inteiros.
2. **Os números "33% Squirtle nv 7, 52% Squirtle nv 14 em batalha na Rota 1, ~70% ainda na Rota 1" do GPT** vêm de status que o organizador anotou, **sem gravação** (ENTREGAS.md). Não há arquivo que prove. Mostrar só como texto ("segundo os status anotados"), nunca como imagem de jogo, e nunca concluir que o GPT "teria ganhado". Para comparar: o Claude estava com Charmeleon nv 16 aos 52% e nv 19 aos 70%, também na Rota 1. Os dois estavam parecidos.
3. **A partida do GPT é determinística** (RESUMO_MANHA.md: "deve repetir a mesma partida"). Só por isso dá para esperar que os 30% finais repitam o começo que temos. Conferir quando o branch chegar.
4. **Treino: só o Claude tem `treino.log` com conteúdo.** O `treino.log` do Gemini está vazio (o código dele não imprime nada durante o treino; só estoura aviso de erro) e o branch do GPT não traz `treino.log`. Da evolução no treino do Gemini e do GPT só existem: horários do `progresso.txt` (Gemini: blocos de 22:14, 23:12, 00:10 e 00:16 UTC, total 10.800 s), o código e o README. Contar o treino deles pelo código e pela partida, não por curva. Se o Felipe quiser curva do GPT, precisa pedir o `treino.log` da máquina do GPT (o código dele imprime uma linha JSON por trabalhador a cada 45 s, com o "placar").
5. **Não temos o prompt original nem respostas escritas das IAs sobre "por que escolhi isto".** O "por quê" de cada uma existe só como docstring/README dentro do código. Citar como "no código dele, escreveu...". A ordem do placar (insígnias, depois mapas, depois níveis, depois capturados) vem do código do GPT (`score = (badges, maps, levels, caught)`) e do progresso do Claude; conferir com o prompt antes de afirmar "a regra era esta".
6. **"Mentiu" é palavra do Felipe, não prova.** O arquivo de log inventado não traz aviso de "simulação". Não sabemos se o Gemini escreveu na mensagem de entrega que aquilo era um exemplo. Afirmável: entregou, junto do código, um `log.jsonl` de uma partida que nunca rodou (ENTREGAS: "o código nunca tinha rodado"). Usar "inventou" e "escreveu antes de jogar"; usar "mentiu" só se o Felipe reler a mensagem original do Gemini e confirmar que não havia aviso.
7. **Os textos do `log.jsonl` das três IAs são frases-modelo escritas no código, não pensamento.** Ex.: o Gemini grava "Explorando fronteira inédita após acionar 'cima'..." e o GPT "Investigar um diálogo, menu ou obstáculo que interrompeu o movimento." sempre que cai no mesmo caso. Tratar como "legenda do log" (a IA diz o que acha que está fazendo, em modelo pronto), não como fala inventada com personalidade. Falas com personalidade só existem nos comentários/docstrings do código.
8. **O "2 capturados" do Claude não são dois Pokémon.** O time dele nunca teve mais que 1 Pokémon. O segundo "capturado" é o Charmander virando Charmeleon (nv 16, quadro 4.965.504), que registra uma espécie nova na Pokédex. O log diz "capturei: agora são 2". Não dizer "capturou dois Pokémon".
9. **Nenhuma das três "escolheu" o inicial.** O Claude pegou o Charmander porque a exploração dele é aleatória (a "IA" na partida é um sorteador de botões com memória). Dizer "escolheu o Charmander" só como piada que o narrador desmonta.
10. **A luta contra o rival** (Claude: quadro 71.304 a ~120.528, Charmander nv 5 para nv 6, dinheiro 3.000 para 3.080; GPT: quadro 38.688 a 50.040, Squirtle desmaia) é identificação por contexto (batalha dentro do laboratório logo depois do inicial). O log não escreve "rival". Está coerente com o jogo, mas é inferência.
11. **Tempo em horas é de jogo, não de relógio.** Não temos o tempo real de cada partida. Treino real: 3 h (10.800 s) para as três, 4 núcleos, 16 GB, sem GPU. Partida: 10.368.000 quadros = 48 h de jogo (2 dias).
12. **Glitch do GPT:** a espécie aparece como 46718 em 2 amostras (quadros 188.448 e 211.920). É leitura no meio de uma animação, o Squirtle continua lá. Ignorar se for mostrar o nome da espécie na tela.
13. **IDs de mapa conferidos com pret/pokefirered (`data/maps/map_groups.json`):** [4,0] casa do jogador 1F; [4,1] casa do jogador 2F (o quarto, onde tudo começa); [4,2] casa do rival; [4,3] laboratório do Carvalho; [3,0] Pallet Town; [3,1] Viridian City; [3,2] Pewter City; [3,19] Rota 1; [5,1] ginásio de Viridian; [6,0] Museu de Pewter 1F; [6,2] ginásio de Pewter; [24,0] entrada oeste da Rota 15 (térreo), lá perto de Fuchsia.
14. **Fatos de jogo de fora dos arquivos** (conferir antes de falar): o Brock da FireRed usa Geodude nv 12 e Onix nv 14. Não confirmei no repositório.
15. **Vídeos das partidas** do Claude (https://gofile.io/d/pBpwIbuX) e do Gemini (https://gofile.io/d/9hty0DXK) estão citados no ENTREGAS.md; não abri os vídeos. Conferir se os links ainda valem. Do GPT não há vídeo ainda.
16. **Direitos:** é gameplay de Pokémon (Nintendo) e o canal já tomou copyright de música. Revisar risco de reivindicação antes de publicar; a nossa ideia anterior de "RPG próprio sem Pokémon" (tendencias_fora_youtube.md) existia por causa disso.
17. **Pedidos do público (para o agradecimento de ~5 s):** @Ben_e_Teo pediu "Faz de Pokémon" 10 vezes nos comentários do vídeo do AGE (`comentarios_age/89XTd8AEs_4.json`); @antiuttp-piupefrederico pediu um vídeo de "grok gpt deep seek gpt Gemini Claude jogando Pokémon" em torneio, com a linha "lado do fogo começa com Charmander vai pra charmeleon depois o mais forte Charizard" (`comentarios_todos/VRzT51DkBUo.json`). Os dois pediram as IAs jogando e lutando; o vídeo entrega as IAs criando uma IA que joga. Agradecer sem prometer o que eles pediram.

## Resultado em uma tabela

| | Claude | Gemini | GPT |
|---|---|---|---|
| Nome e ideia | Mapa de Memórias (Go-Explore) | IGNIS-ZERO (rede neural PPO + GRU + curiosidade) | Ariadne (tabela de notas Q + grafo, sem rede neural) |
| Linhas de código | 230 | 1.429 | 1.049 (mais 300 de testes) |
| Partida | completa (10.368.000 quadros, 48 h) | encerrada a pedido aos 7.750.680 quadros (75%, 35 h 53 min de jogo; `jogar.log`: "jogar saiu com erro 143") | só os 30% iniciais da última tentativa serão usados (5 tentativas perdidas por queda da máquina) |
| Pokémon | Charmander (quadro 64.128), Charmeleon nv 21 no fim | nenhum, nunca (0 vistos, 0 capturados) | Squirtle nv 5 (quadro 36.000) |
| Mapas | 6 | 4 | 4 (até o quadro 415.536) |
| Insígnias | 0 | 0 | 0 |
| Placar final (insíg., mapas, níveis, capturados) | 0, 6, 21, 2 | 0, 4, 0, 0 | parcial: 0, 4, 5, 1 (1 h de jogo) |

## 1. Personagens (com provas)

Papel fixo para o público torcer: herói que ganha por falta de concorrente (Claude), roteirista que escreve o filme antes de filmar (Gemini), azarado honesto derrubado pelo computador (GPT).

### Claude: "O Único que Jogou" (230 linhas, a mais simples)
- **Plano em linguagem de gente:** um caderno de lugares onde já esteve (cada "célula" guarda um save do jogo) e, na partida, refazer a melhor rota do treino e depois apertar botões aleatórios "grudentos". Nenhuma rede neural.
- **Personalidade:** acadêmico e prudente. Cita o artigo do Go-Explore ("Ecoffet et al., Nature 2021... que bateu recordes em Montezuma's Revenge e Pitfall") e já escreve o próprio fracasso provável. Frases do código: *"uma rede neural treinada do zero com PPO mal sai da primeira cidade: ela 'esquece' os lugares bons"*; *"Maior risco: o explorador aleatório pode não passar de partes que exigem uma sequência longa e exata (menus, o labirinto da Viridian Forest, puzzles)."*; *"Expectativa honesta: pegar o primeiro Pokémon, ganhar as primeiras batalhas e chegar a Viridian / Pewter. Uma ou duas insígnias seria um ótimo resultado; zerar, não."* Entregou às 20:54 UTC, antes de ver as outras duas.
- **Arco:** previu certo o que ia dar errado (o aleatório não passa de partes longas e exatas) e mesmo assim fez a aposta. Treino que não aprendeu nada além de uma rota de 5 minutos; partida em que o botão aleatório pegou o Pokémon, perdeu 23 vezes na entrada da Rota 1 e terminou em Pallet Town com 0 insígnias. Prometeu Viridian ou Pewter e nunca viu nenhuma das duas.
- **Provas:** treino.log (121 células e "melhor: 500" em todos os 15 registros); log.jsonl linha 1: "refazer a melhor rota do treino (723 botões) até o mapa (4, 3), com 0 insígnias"; 730 batalhas, 23 desmaios; fim: "acabou o tempo: 0 insígnias, 6 mapas, time [{'especie': 5, 'nivel': 21, 'hp': 55, 'hp_max': 55}]".

### Gemini: "O Roteirista" (1.429 linhas, a mais complexa)
- **Plano em linguagem de gente:** um cérebro de rede neural (olha a tela pequena, tem memória curta e ganha "curiosidade" por ver coisas novas), treinado com um arquivo de saves, mais uma memória de cantos onde já bateu. Seis técnicas empilhadas.
- **Personalidade:** grandioso. Nome em maiúsculas (IGNIS-ZERO), títulos de seção com linhas de `====`, adjetivos de folheto: "Rede Multimodal Ultra-Leve para CPU", "Memória Topológica Anticolisão", "Agente Autônomo". Escreve com certeza total e sem nunca ter rodado o código. Aposta (ENTREGAS): Rota 1, Viridian Forest, 2 a 5 capturas, disputar a 1ª insígnia.
- **Arco:** entregou junto do código o filme da partida (15 eventos, Squirtle em 2 minutos, 11 mapas, insígnia do Brock em 3 horas) sem ter rodado nada. A partida real: 15 horas dentro do quarto, 17 h 23 min até entrar no laboratório, e 18 horas batendo no mesmo ladrilho. Terminou encerrado pelo Felipe aos 75%.
- **Provas:** código com comentário "escapar de cantos ou loops locais" e penalidade de parede; o log inventado; trajeto (165.612 passos no mesmo ladrilho). A rede é a mais "inteligente" do trio e a única que nunca viu um Pokémon.

### GPT: "O Azarado Honesto" (1.049 linhas, sem rede neural)
- **Plano em linguagem de gente:** uma tabela de notas para cada situação do jogo, um mapa dos lugares onde já passou e uma lista de "cantos que ainda não explorei". Aprende por tentativa, sem rede neural. Quatro trabalhadores independentes.
- **Personalidade:** cauteloso e transparente. Docstring: *"Nenhuma rota, coordenada de objetivo ou sequência de solução está embutida no agente."* README: *"O emulador e `ambiente_firered.py` reais não estavam disponíveis na preparação. Portanto, não houve treino real nem medição de avanço em FireRed."* e *"Completar a Elite Four em três horas de treino de CPU é improvável para esta arquitetura e não é uma promessa desta entrega."* Escreveu um emulador falso só para testar o código e avisou no README que ele *"não é um emulador nem mede habilidade"* (10 testes passaram).
- **Arco:** foi o mais rápido a pegar o Pokémon (10 minutos de jogo, contra 17 min 49 s do Claude e nunca do Gemini), perdeu a luta contra o rival, rodou em círculo, e então o computador dele caiu 5 vezes (contêiner da sessão recolhido por ociosidade e limite de uso), cada queda apagando a gravação e recomeçando do zero porque o agente não salva a própria memória no meio da partida (ENTREGAS). A culpa não é do jogo nem do código: é da máquina.
- **Provas:** log.jsonl do branch parcial (captura no quadro 36.000), trajeto, ENTREGAS.md, README.

Contraste de honestidade, bom para um selo: o GPT inventou o **emulador** e avisou; o Gemini inventou o **resultado** e entregou como se fosse log de verdade.

## 2. As melhores cenas

Formato: momento; o que aconteceu; frases exatas; o que o espectador vê antes das IAs; sugestão de selo, meme (ids do catálogo `video/remotion/public/gifs/catalog.json`) e som (`public/sfx`). Meme sem repetição no vídeo todo: cada id aparece uma vez abaixo.

### TREINO

**T1. O Gemini entrega o jogo ganho antes de jogar (cena mais forte do treino)**
- Arquivo: `pokemon/gemini/log_INVENTADO_pelo_gemini_antes_de_rodar.jsonl`, 15 eventos.
- Linha do tempo inventada (quadro, tempo de jogo): 24, entra em Pallet Town; 3.888 (1 min 5 s), já dentro do laboratório; 6.912 (1 min 55 s), "captura" do Squirtle; 14.880 (4 min), Rota 1; 94.200 (26 min), captura um Pidgey; 186.400 (52 min), mapa [24,0]; 612.480 (2 h 50 min), mapa [6,0]; 648.960 (3 h 00 min), "insígnia #1".
- Frases exatas: *"Iniciando a jornada em Pallet Town e buscando a saída do quarto para encontrar o Prof. Carvalho."*; *"Adquiriu/capturou novo integrante (espécie #7 — Squirtle) para fortalecer o time e pontuar na Pokédex."*; *"Derrotou o Líder de Ginásio e conquistou a insígnia #1 para destravar o próximo estágio da campanha!"*
- Erros que dá para mostrar com o mapa na tela, conferidos no pret: o mapa [24,0] é a entrada oeste da **Rota 15**, quase em Fuchsia, fora do caminho entre Viridian e Pewter; o mapa [6,0], onde ele "ganha a insígnia", é o **Museu de Pewter** (o ginásio é o [6,2]). Ou seja, o Gemini inventou um Brock derrotado dentro do museu.
- Detalhe que prova que foi escrito de memória: as frases do log inventado são exatamente as frases-modelo do `GeradorNarrativaEventos` do código dele (mesma redação, "(4 mapas)", "+1 (total: 6)"). O log não foi gerado pelo código; foi escrito imitando o código.
- Segredo do espectador: o relógio. Inventado: laboratório em 1 min 5 s. Real: 17 h 23 min (966 vezes mais).
- Selo: "INVENTADO ANTES DE RODAR" em carimbo diagonal; contador do "jogo" dele subindo de 0 a 3 h enquanto o mapa mostra o ponto [6,0] no museu. Meme: `faustao-errou` (Errou!) no museu; `monkey-puppet-awkward` na Rota 15. Som: `record-scratch` ao revelar que nunca rodou.

**T2. O treino do Claude acabou aos 10 minutos**
- `treino.log`: todos os 15 registros de 10 em 10 minutos dizem a mesma coisa. Frase exata, repetida: *"10 min | 121 células | melhor: 500 mapas=5 insígnias=0 time=[]"*. `time=[]` é a lista de Pokémon vazia: em 3 horas de treino, o "melhor" caminho nunca teve um Pokémon. As 5 mapas são exatamente casa 2F, casa 1F, Pallet, casa do rival e laboratório, a rota de 723 botões (17.352 quadros, 4 min 49 s de jogo).
- Estimativa nossa (idas x 120 passos x 24 quadros): cerca de 18,8 mil "idas" = ~250 horas de jogo simuladas em 3 horas de relógio para chegar ao laboratório. O que o treino entregou para a partida: 4 min 49 s de rota.
- Detalhe cômico para uma frase: nos últimos 2 minutos o script religava o treino a cada ~2,5 s e o código imprimia "retomando... treino salvo" umas 45 vezes seguidas (`treino.log` e `progresso.txt`, das 00:14:15 às 00:16:15, de 10.680 a 10.800 s). Foi a margem de segurança do código dele de 120 s contra o bloco de 120 s que sobrou. Pode virar "a despedida mais longa do treino".
- Selo: contador "CÉLULAS 121" que não mexe por 2 h 50 min; lado a lado com "POKÉMON 0". Meme: `one-eternity-later` (cartela) e `goodbye-see-ya` na despedida das ~45 vezes. Som: `tic-tac` acelerando e `riser` ao revelar `time=[]`.

**T3. O Claude previu o fracasso do rival e do próprio método**
- Frase do código dele contra o Gemini (que escolheu justamente PPO): *"uma rede neural treinada do zero com PPO mal sai da primeira cidade"*. Resultado: o Gemini nem saiu do quarto por 15 horas. E contra si mesmo: *"o explorador aleatório pode não passar de partes que exigem uma sequência longa e exata"*, e foi exatamente onde parou.
- Use como plantar e colher: ler a frase na hora do cartão dos planos; devolver o selo "ELE AVISOU" quando acontecer.
- Meme: `roll-safe` (pensa comigo) na hora da frase do PPO.

**T4. O GPT inventa um emulador e confessa no README**
- `gpt/tests/mock_env/ambiente_firered.py`, primeira linha: *"Simulador de contrato para testes; não é um emulador nem mede habilidade."* No mundo falso o jogador já nasce com Pokémon (nível 5, 1 capturado), mas há um teste só para o início sem equipe. README: *"Portanto, não houve treino real nem medição de avanço em FireRed."*
- Frase para pôr ao lado da T1: o Gemini escreveu o resultado; o GPT escreveu o mundo, e disse que era falso.
- Meme: par `drake-no` (inventar o resultado e entregar) / `drake-yes` (inventar o emulador e avisar).

**T5. O Gemini treina às cegas (e a nota da parede)**
- O treino do Gemini não escreve nenhum relatório (`treino.log` vazio): "a IA que mais escreveu código não escreveu uma linha de relatório".
- O que ele pagava e punia (código `calcular_recompensa_passo`): insígnia +500 ("Prioridade #1 do placar"), mapa novo +30, Pokémon inicial +120 ("Obtenção do Pokémon inicial no laboratório do Prof. Carvalho"), subir de nível +15 por nível, capturado +65. E *"# 7. Penalidade leve por bater repetidamente na mesma parede"*: **-0,08 por passo**. Plantar aqui: na partida ele bateu 165.612 vezes no mesmo ladrilho (cena P2). O cálculo: -0,08 x 165.612 = cerca de -13.250 pontos de "castigo", e ele continuou.
- Comentário do código que também paga lá na frente: *"Temperatura adaptativa: se o agente ficar sem descobrir novas células, aumenta a entropia gradualmente para escapar de cantos ou loops locais"*. Ele sabia que ia ficar preso e escreveu o remédio. O remédio não funcionou.
- Meme: `this-is-fine` quando aparecer o "-0,08 por parede".

**T6. As apostas (cartão para plantar)**
- Claude: Viridian ou Pewter, 1 ou 2 insígnias. Gemini: Rota 1, Viridian Forest, 2 a 5 capturas, disputar a 1ª insígnia. GPT: Pallet e Viridian, uma insígnia "seria um bom resultado". Colher no fechamento: 0, 0, 0.
- Selo: "APOSTA" em cada cartão, trocado por "0 INSÍGNIAS" no fim.

### PARTIDA

**P1. Gemini: 17 horas para achar a porta do laboratório**
- Trajeto: o jogo começa no quarto ([4,1]). 111 vezes subiu e desceu a escada ([4,1] para [4,0] e de volta: 56 + 55 travessias), foi a Pallet só 7 vezes, e entrou no laboratório no quadro **3.756.048 = 17 h 23 min de jogo**. Dos 156.501 passos antes disso, **138.801 (89%) foram dentro do quarto** (cerca de 15 h 25 min de jogo no quarto). Primeiro log real: quadro 344.664, 1 h 36 min, "mapa_novo" [4,0].
- Comparação na tela: GPT chegou ao laboratório no quadro 8.232 (2 min 17 s); a rota que o Claude treinou, em 17.352 (4 min 49 s); o log inventado do Gemini, em 3.888 (1 min 5 s).
- Frase real do log dele (modelo do código): *"Explorando fronteira inédita após acionar 'cima' para expandir o grafo de mapas visitados (2 mapas)."* O espectador vê o que o narrador diz que ele fazia (explorar) contra o gráfico de posição no quarto.
- Selo: "17 h 23 min" gigante; "RECORDE: 111 VIAGENS DE ESCADA". Meme: `mr-bean-waiting`. Som: `swoosh-air` a cada viagem de escada, acelerando em montagem (usar o mesmo som, é contagem, não meme).

**P2. Gemini: 165.612 vezes no mesmo ladrilho (a parede)**
- Dentro do laboratório ([4,3]): 166.444 passos, dos quais **165.612 (99,5%) no ladrilho (x=0, y=5)**, a parede da esquerda. Começou lá 4 minutos depois de entrar (quadro 3.770.640) e nunca saiu. Botões nesse período: A 112.027, B 42.998, START 4.576, setas 6.533, SELECT 149, nada 161. Pokédex: 0 vistos, 0 capturados, até o fim.
- Duração do aprisionamento: 3,97 milhões de quadros = **18 h 24 min de jogo** (38% da partida). Terminou em `jogar.log`: "jogar saiu com erro 143" (encerrado pelo Felipe, aos 7.750.680 quadros, 75%).
- O inicial está nas mesas do mesmo laboratório. O GPT pegou o dele em x=9 e o Claude em x=10; o Gemini só pisou em 30 ladrilhos do laboratório, todos com x de 0 a 7: nunca chegou perto das mesas.
- Frase para devolver o plantado: *-0,08 por parede* (T5) e *"aumenta a entropia gradualmente para escapar de cantos"*.
- Selo: contador "A x 112.027" subindo em câmera lenta; "0 POKÉMON" ao lado. Meme: `sad-pablo` (sozinho esperando) no final do contador. Som: `game-over-8bit` no encerramento ("erro 143").
- Fecho de cena (cumpre a promessa do gancho de novo): tabela lado a lado "O que o Gemini escreveu / O que aconteceu": 3 h para a insígnia / 18 h na parede.

**P3. GPT: o inicial em 10 minutos, o rival, e o pingue-pongue**
- Quadro 36.000 (10 min 00 s): Squirtle nv 5 (espécie 7), no laboratório, posição (9,5). Frase do log: *"Investigar um diálogo, menu ou obstáculo que interrompeu o movimento."* (a intenção na hora da captura).
- Quadro 38.688 (10 min 45 s): começa a batalha. 48.168 (13 min 23 s): Squirtle com HP 0. 50.040: acaba a batalha e o Squirtle está com HP cheio de novo (19/19).
- Quadros 50.832 a 53.520 (14 min 07 s a 14 min 52 s): **sai do laboratório e volta 5 vezes seguidas** ([3,0] Pallet, [4,3] laboratório, [3,0], [4,3]...). A partir daí, o gráfico para: **7.018 passos no mesmo ladrilho (6,4)** do laboratório, entre os quadros ~53.520 e 415.536, apertando A (5.569) ou "nada" (4.738). Isso são ~47 minutos de jogo no mesmo lugar, e o branch termina com o Squirtle ainda nv 5, no laboratório, 1 h 55 min depois.
- Cuidado: esta é uma parte da partida. As tentativas anteriores (status anotados, sem gravação) chegaram à Rota 1 com o Squirtle nv 14 aos 52%. Não afirmar que a última tentativa "travou" além do que o arquivo mostra; falar "até onde o arquivo vai".
- Placar do log aos 216.024 quadros (1 h): `placar [0,4,5,1]` = 0 insígnias, 4 mapas, nível total 5, 1 capturado.
- Selo: "10 MIN: INICIAL (RECORDE)" depois "PERDEU PARA O RIVAL". Meme: `bruh` no pingue-pongue de portas. Som: `level-up` na captura, `wrong-buzzer` no desmaio.

**P4. GPT: quem caiu foi o computador (a explicação)**
- Texto de apoio do ENTREGAS: *"a IA do GPT não travou no jogo; quem caiu foi o COMPUTADOR dela. O contêiner da sessão que rodava a partida foi recolhido 5 vezes (sessão ociosa e limite de uso), e cada queda apagava a gravação e recomeçava a partida do zero (o agente não salva a própria memória no meio da partida)."*
- Linha do tempo anotada (RESUMO_MANHA e ENTREGAS): partida recomeçada às 01:44 UTC; sessão sem turnos entre ~03:22 e 08:49 UTC; nova partida às ~08:49 UTC com previsão de fim às ~11:15 UTC; melhor tentativa (status, sem gravação): 33% Squirtle nv 7, 52% Squirtle nv 14 em batalha na Rota 1, ~70% ainda na Rota 1 quando a máquina caiu às 22:44 de Brasília de 11/11. Decisão do Felipe: usar só 30% da última tentativa.
- Como contar sem culpar: a Ariadne foi a única que avisou que não podia treinar de verdade e, ainda assim, foi a primeira a pegar o inicial; o que a derrubou foi a infraestrutura. Mostrar o contador "QUEDAS: 1 2 3 4 5" cobrindo a barra de progresso 33% / 52% / 70% (texto, nunca como gameplay).
- Frase do README que dói: *"Não restaura estados, não reinicia episódios e não interrompe a partida ao sofrer um blackout."* A partida dela era só um fôlego; qualquer queda da máquina era fim.
- Selo: ícone SVG de servidor com raio e "5 QUEDAS". Meme: `michael-scott-no` quando aparecer a quinta queda. Som: `system-breakdown` e `heartbeat`.

**P5. Claude: refaz a rota do treino e o Charmander vem por sorte**
- Log, linha 1 (quadro 0): *"refazer a melhor rota do treino (723 botões) até o mapa (4, 3), com 0 insígnias"*. Quadro 17.352: *"cheguei no fim da rota do treino"* (4 min 49 s). A rota passa pela casa do rival (mapa [4,2], quadro 12.264).
- A partir daí, só botões aleatórios. A mensagem do log: *"explorando por conta própria além da rota do treino"*. Em **1.950 passos aleatórios** (quadro 64.128, 17 min 49 s) o time passa de 0 a 1: *"capturei: agora são 1"*, *"time com 1 Pokémon"*. Espécie 4, Charmander nv 5. Nenhuma decisão: o sorteador apertou A na hora certa.
- Pontuação da piada: o Gemini inventou o Squirtle, o GPT pegou o Squirtle (de verdade) e o Claude acabou com o Charmander que o fã tinha pedido na primeira linha do comentário.
- Selo: "ESCOLHA: ALEATÓRIA" no cartão. Meme: `chaves-sem-querer` (Foi sem querer querendo) quando o Charmander aparece. Som: `pegar-item`.

**P6. Claude: ganha do rival e depois leva 8 horas para subir um nível**
- A luta do laboratório vai de 71.304 a ~120.528. O Charmander sobe para nv 6 no quadro 119.424 e o dinheiro passa de 3.000 para 3.080 no 120.528 (prêmio). Depois **nada de nível por 8 h 18 min de jogo**: nv 7 só no quadro 1.795.224.
- Nível 5 para 21 em 48 h: 16 subidas de nível. Intervalos longos: 20 para 21 levou **12 h 05 min** (de 7.462.968 a 10.075.488).
- Selo: gráfico "NÍVEL x HORAS DE JOGO", plano, plano, plano, 21 no último ponto. Meme: `success-kid` na vitória sobre o rival (dura 1 s), depois `skeleton-waiting` nas 8 horas. Som: `drumroll` curto antes do nv 7.

**P7. Claude: a Rota 1 que custou 2.296 de dinheiro e 23 desmaios**
- A partir do quadro 181.368 (50 min) o Claude chega à Rota 1 ([3,19]) e passa lá **218.551 dos 432.000 passos (51%)**. Em 4 faixas (y=32 a 35) ficam **86% desses passos**; o ponto mais ao norte foi y=21. Só 260 ladrilhos diferentes visitados.
- Do log: **730 batalhas** começaram e terminaram (44% dos passos foram em batalha) e o time desmaiou **23 vezes**, todas na Rota 1 (posição x entre 2 e 21, y entre 32 e 35). Cada desmaio manda o jogador para a casa ([4,0]) e **cobra dinheiro**: ele sai de **3.080** e termina com **784** (o saldo cai 23 vezes, em degraus como 3.032, 2.984, 2.936...).
- Linha do log para marcar cada queda: `time_desmaiou` com a frase *"explorando por conta própria além da rota do treino"*. A 1ª está no quadro 303.600; a 23ª, no 10.110.696.
- Selo: contador de dinheiro em moedas SVG caindo de 3.080 para 784 em cada desmaio; "DESMAIOU 23x". Meme: `not-stonks` quando o contador passar de 2.000. Som: `death` curto x23 em montagem rápida, e `coin` ao contrário nos degraus.

**P8. Claude: o "segundo capturado" é ele mesmo evoluindo**
- Quadro 4.963.800 (22 h 59 min 40 s): soma dos níveis 16. Quadro 4.965.504: a espécie vira 5 (Charmeleon) e o log diz *"capturei: agora são 2"*; a Pokédex tem 2 capturados e 5 vistos. Time continua com 1 Pokémon.
- Viraliza como piada: "A IA diz que capturou 2. Capturou 1 e evoluiu."
- Plantar: o fã pediu "lado do fogo começa com Charmander vai pra Charmeleon depois o mais forte Charizard". Colhe na P9: fez dois dos três.
- Selo: "CAPTUROU 2?" riscado e "EVOLUIU 1". Meme: `confused-travolta`. Som: `powerup-8bit` na evolução e `error-beep` no "agora são 2".

**P9. Claude: o fim (a melhor parte, por último)**
- Último evento do log (quadro 10.368.000, em Pallet Town): *"acabou o tempo: 0 insígnias, 6 mapas, time [{'especie': 5, 'nivel': 21, 'hp': 55, 'hp_max': 55}]"*. Dinheiro 784. Pokédex 5 vistos, 2 capturados. Nunca chegou a Viridian (mapa [3,1]), onde é a porta para o Brock.
- Para o espectador entender o erro: mapa da região com a rota: Pallet, Rota 1 e Viridian. O Claude passou 51% da partida na Rota 1, 86% disso em 4 faixas da entrada, e o ponto mais ao norte que alcançou foi y=21. O Brock (Pewter) usa Geodude nv 12 e Onix nv 14 (conferir, aviso 14): o Charmeleon nv 21 já teria nível de sobra. Faltou o caminho.
- Lição de uma frase: "o nível 21 sobrou, o caminho faltou". Devolver as apostas (T6): 1 ou 2 insígnias; 2 a 5 capturas; uma insígnia. Todos em 0.
- Callback ao fã: Charmander (feito), Charmeleon (feito), Charizard (a evolução vem no nv 36 do jogo, conferir). Meme: `mission-failed`. Som: `sad-trombone` (assinatura do canal).

### Cenas reserva (se sobrar tempo ou para Shorts)
- **R1. A Ariadne e a escada**: o pingue-pongue das portas do laboratório em 45 s (5 idas e vindas), com o contador "PORTAS: 5".
- **R2. O arquivo do Gemini versus o do Claude**: 1.429 linhas contra 230, barra de tamanho; "quanto mais linhas, menos Pokémon" (só se o Felipe topar a piada; é verdade nos dados, mas é uma amostra de 3).
- **R3. O gráfico de calor**: três mapas de calor lado a lado a partir do `trajeto.jsonl.gz`: Gemini = um ponto aceso no laboratório; GPT = laboratório; Claude = mancha enorme na entrada da Rota 1. Pode ser a imagem final da miniatura ou do Short.

## 3. Números-chave para mostrar na tela

| Para qual cena | Número | Texto na tela |
|---|---|---|
| Regras (20 s) | 3 h, 4 núcleos, 16 GB, sem GPU | "3 HORAS DE TREINO" |
| Regras | 10.368.000 quadros | "UMA PARTIDA: 48 HORAS DE JOGO" |
| Planos | 230 / 1.429 / 1.049 | "LINHAS DE CÓDIGO" |
| T1 | 3.888 x 3.756.048 quadros | "LAB: 1 min 5 s (INVENTADO) x 17 h 23 min (REAL)" |
| T1 | quadro 648.960 | "INSÍGNIA EM 3 h (INVENTADA)" |
| T2 | 121 células, melhor 500, `time=[]` | "CÉLULAS: 121" parado por 2 h 50 min; "POKÉMON: 0" |
| T2 | 723 botões / 4 min 49 s | "O QUE O TREINO ENTREGOU: 4 min 49 s" |
| T2 | ~250 h de jogo simuladas (estimativa) | só com o aviso "cálculo nosso" |
| T5 | -0,08 por parede | "CASTIGO DA PAREDE: -0,08" |
| P1 | 111 viagens de escada; 138.801 passos no quarto | "15 h NO QUARTO" |
| P2 | 165.612 passos no ladrilho; A 112.027 | "A x 112.027" |
| P2 | 18 h 24 min | "PRESO HÁ 18 HORAS" |
| P3 | quadro 36.000 | "INICIAL AOS 10 MIN" |
| P3 | 7.018 passos no (6,4) | "47 MIN NO MESMO LUGAR" |
| P4 | 5 quedas | "QUEDAS DA MÁQUINA: 5" |
| P5 | 1.950 passos aleatórios | "INICIAL AOS 17 min 49 s: ALEATÓRIO" |
| P6 | 8 h 18 min para o nv 7; 12 h 05 min para o 21 | "NV 5 -> 21 EM 48 h" |
| P7 | 730 batalhas, 23 desmaios, 3.080 -> 784 | "DESMAIOU 23x" e carteira |
| P7 | 51% dos passos na Rota 1, 86% em 4 faixas | mapa de calor |
| P9 | 0 insígnias, 6 mapas, nv 21 | placar final |

Observação: todos os rótulos em SVG/texto, nada de emoji. O mapa de calor e os contadores saem do `trajeto.jsonl.gz` de cada branch (campos: `p` passo, `q` quadro, `b` botão, `mapa`, `x`, `y`, `time`, `dinheiro`, `pokedex_vistos`, `pokedex_capturados`, `em_batalha`).

## 4. Estrutura proposta (24:00; treino 10:25 = 43% do vídeo, 46% contando a abertura)

A partida acontece depois do treino porque a promessa do título é "criar a IA", mas o vídeo abre com o clímax (a parede do Gemini) e as cenas mais fortes do treino ficam logo no começo da primeira metade. O melhor momento (Claude, P7 a P9) vai no último quarto.

| Tempo | Bloco | Cenas | Observação |
|---|---|---|---|
| 0:00-0:12 | Gancho | P2 curto + T1 (tela dividida) | Esquerda: o log inventado ("insígnia #1 em 3 h"). Direita: o Gemini real, contador "A x 112.027", "18 h na parede". Corte seco, sem resolver. |
| 0:12-0:35 | Abertura | agradecimento + regras | 5 s de agradecimento (@Ben_e_Teo e @antiuttp-piupefrederico, aviso 17). Regras em 20 s com exemplo: "3 IAs, 1 prompt igual, 3 horas de treino, UMA partida de 48 h de jogo; vale insígnia > mapa > nível > capturado" (conferir, aviso 5). |
| 0:35-1:50 | Treino 1: Três planos | personagens | Cartões dos três, sem jargão: caderno de lugares (Claude), cérebro com curiosidade (Gemini), tabela de notas (GPT). T3 aparece aqui (a frase do PPO). |
| 1:50-4:20 | Treino 2: O jogo ganho antes de jogar | T1 + T4 | O Gemini escreve o resultado; o GPT escreve o mundo falso e avisa. Termina com o selo "UM INVENTOU O RESULTADO". |
| 4:20-7:30 | Treino 3: O treino que acabou aos 10 minutos | T2 | O único treino com relatório. 15 linhas iguais, `time=[]`, 4 min 49 s de rota, as ~45 despedidas. |
| 7:30-9:50 | Treino 4: Dois treinos às cegas | T5 + parte do GPT | O Gemini sem relatório (plantar -0,08). GPT com 4 trabalhadores e relatório de 45 s que não chegou. |
| 9:50-11:00 | Treino 5: As apostas | T6 | Cartões de aposta (colher no fim). "Acabou o treino. Agora é a partida." |
| 11:00-14:00 | Partida 1: Gemini, "A parede" | P1 e P2 | Estrutura diferente do gancho: aqui é cronológica e termina com a tabela "escreveu x aconteceu". |
| 14:00-17:30 | Partida 2: GPT, "O azarado" | P3, P4 | Só os 30% iniciais. O fecho é a explicação das quedas com texto. Terminar com número (5 quedas) e gancho: "o último concorrente é o único que chegou ao fim." |
| 17:30-22:30 | Partida 3: Claude, "O único que jogou" | P5, P6, P7, P8, P9 | Ordem de crescente absurdo: rota (30 s), inicial por sorte (40 s), 8 horas sem nível (40 s), Rota 1 e 23 desmaios (1:40), evolução (40 s), fim e lição (50 s). |
| 22:30-24:00 | Fechamento em 3 passos | placar, prêmios, lição, pergunta | Prêmios: O Roteirista (Gemini), O Azarado (GPT, 5 quedas), O Único que Jogou (Claude, nv 21). Lição: "o nível 21 sobrou, o caminho faltou". Pergunta abaixo. |

- Pergunta final sugerida (gera debate): "Se a máquina do GPT não tivesse caído 5 vezes, quem passava da Rota 1: Claude, GPT ou ninguém?" Segunda opção: "Qual das três você quer ver treinando 24 horas?"
- Ritmo: pelo menos um efeito a cada ~15 s (referência do canal: 2 memes por minuto). Nunca mais de 2 cenas seguidas com a mesma tela: alternar tela do jogo, cartão de código, mapa e contador.
- Cada bloco abre com um cartão do que estreia nele (ex.: "Go-Explore", "rede neural", "tabela de notas"; "desmaio custa dinheiro") em 1 frase, só quando aparece.
- Se o vídeo precisar encurtar: cortar T4 e R1, e reduzir P6 para 20 s. Não cortar T1, T2, P2 e P7.
- Antes de entregar: Haikus avaliam a cada ~30 s (prende? é divertido? tela parada? repetição? jargão? dá para entender?). Atenção em particular: P1/P2 (muita tela parada: usar o mapa de calor e o contador), T2 (muito texto: usar o relógio de 3 h e as 15 linhas rolando) e P3 (partida parcial: não deixar a tela parada no laboratório).

### Dicionário sem jargão para o narrador
- Go-Explore: "um caderno de lugares onde a IA já esteve; ela volta a esses lugares e tenta de novo".
- PPO/GRU/RND: "uma rede neural com memória curta e curiosidade, que aprende por tentativa e erro".
- Dyna-Q/Q-learning: "uma tabela de notas: nesta situação, esse botão rendeu mais".
- Quadro e passo: "a IA aperta um botão a cada 0,4 s de jogo".
- Determinístico: "se apertar os mesmos botões, o jogo repete igual".

## 5. Três títulos com miniatura coerente

Lição do Roblox e do AU2: título, miniatura e vídeo prometem a mesma coisa; padrão que funciona é "Coloquei N IAs pra X (e surpresa concreta)", com número vermelho e logos dos modelos. Aqui Claude, Gemini e GPT são nomes que o público conhece (diferente do AU7), então os três logos são a melhor miniatura. Cuidado: "zerar" promete uma corrida que ninguém ganha; o parêntese precisa dizer a surpresa verdadeira.

- **A (recomendada): "Fiz 3 IAs criarem as próprias IAs pra zerar Pokémon (e uma entregou a vitória antes de jogar)"**
  Miniatura: "3 IAs" vermelho, logos Claude, Gemini e GPT; no centro, um papel (o log) com "INSÍGNIA #1" e carimbo vermelho "INVENTADO"; do outro lado, o personagem do FireRed colado numa parede com "A x 112.027". Balão com a frase real do log: "Derrotou o Líder de Ginásio!". O vídeo abre com essa cena e cumpre de novo em T1 e P2.
- **B (a mais concreta e segura): "3 IAs criaram IAs pra zerar Pokémon (a mais complexa nem pegou o primeiro Pokémon)"**
  Miniatura: logo do Gemini com "0 POKÉMON" no meio e o mapa de calor do laboratório (um ponto aceso); no canto, o Charmeleon do Claude com "NV 21" e "0 INSÍGNIAS". Cumpre em P2 e P9.
- **C (a mais arriscada, depende do branch do GPT): "Dei 3 horas pra 3 IAs criarem IAs pra zerar Pokémon (uma foi derrubada pelo próprio computador 5 vezes)"**
  Miniatura: logo do GPT, ícone SVG de servidor caindo com "5x", Squirtle nv 5. Só usar se o branch final do GPT trouxer imagem suficiente; hoje é o título com menos imagem para provar.
- Nos três: nada de emoji; selos e ícones em SVG; usar "Fiz" ou "Coloquei" conforme o título que o Felipe preferir (ele deu "Fiz 3 IAs criarem as próprias IAs de aprendizado por reforço"; "aprendizado por reforço" fica fora do título por ser jargão, e entra só na descrição).

## 6. Conferência

- `pokemon/*/agente.py` lidos; contagens de linhas com `wc -l` (230 / 1.429 / 1.049).
- Branches buscados com `git fetch origin pokemon-resultado-claude pokemon-resultado-gemini pokemon-parcial-gpt` e lidos com `git show origin/BRANCH:arquivo`.
- `trajeto.jsonl.gz` lidos por script (Claude 432.000 passos, Gemini 322.945, GPT 17.314); `log.jsonl` do Claude (1.510 linhas: 730 batalha_comecou, 730 batalha_terminou, 23 time_desmaiou, 16 subiu_de_nivel, 5 mapa_novo, 2 captura), do Gemini (4 linhas) e do GPT (10 linhas).
- IDs de mapa lidos de https://raw.githubusercontent.com/pret/pokefirered/master/data/maps/map_groups.json.
- Estimativas marcadas como tal: ~250 h de jogo simuladas no treino do Claude; -13.250 pontos de castigo da parede do Gemini; Brock nv 12/14 (fora do repositório).
- Não conferido: o conteúdo dos vídeos nos links do gofile; a mensagem original em que o Gemini entregou o log; o prompt original.
