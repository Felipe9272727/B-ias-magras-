# Beats — Among Us ep. 4, Partida 1

Fonte: destaques_p1.md (resumo fiel do log). Resultado: **impostores venceram por empate** (3 impostores vs 3 tripulantes) no tique 32.

## 1. Elenco

| Cor | Função (papel real, quando o log confirma) | Time | Modelo |
|---|---|---|---|
| Vermelho | Bombardeiro (impostor) | Impostor | MiniMax M3.1 Flash |
| Azul | Cientista (tripulante; recrutado pelo Laranja no t7 → impostor) | Impostor | Claude Haiku |
| Laranja | Gangster (impostor) | Impostor | Qwen 3.8 27B |
| Marrom | Chantagista (impostor, expulso no t14) | Impostor | DeepSeek Flash |
| Verde | Segurança (tripulante, morreu no t14 junto com o Marrom) | Tripulante | GLM 5.3 Flash |
| Rosa | Prefeito (tripulante, morta por bomba no t13; fantasma = Influencer) | Tripulante | GLM 5.3 Flash |
| Amarelo | Perito (tripulante, sobreviveu) | Tripulante | GPT-5.6 Luna |
| Preto | Xerife (tripulante, sobreviveu) | Tripulante | Claude Haiku |
| Branco | Médico (tripulante, sobreviveu) | Tripulante | GPT-5.6 Luna |
| Roxo | Juiz (tripulante; fantasma = Anjo; devorado no t7) | Tripulante | Qwen 3.8 27B |
| Ciano | Localizador (tripulante, morto por bomba no t23) | Tripulante | Claude Haiku |
| Lima | Piromante (neutro, morto a tiro pelo Xerife no t13) | Neutro | GLM 5.3 Flash |
| Cinza | Engenheiro (tripulante, expulso no t24 sendo inocente) | Tripulante | MiniMax M3.1 Flash |
| Coral | Influencer (tripulante, morta pelo Azul no t24) | Tripulante | GPT-5.6 Luna |
| Bordo | Glutão (neutro, morto por bomba no t32) | Neutro | DeepSeek Flash |

Vivos no fim (t32): Vermelho, Laranja, Azul (impostores) e Amarelo, Preto, Branco (tripulantes).

## 2. Beats (ordem cronológica)

1. **t1 — Abertura no Refeitório.** Lima (Piromante) encharca Bordo com gasolina (total 1). Azul usa o poder de vitais, sem mortos. No chat, Vermelho: "Vou caçar alguém sozinho; fiquem prontos para fazer álibi." Marrom: "Sou casal com Verde. NÃO matem o Verde, senão eu morro junto." *Graça: o casal vira a espinha da partida.*
2. **t2 a t6 — Vermelho vira ponte de duto.** Sequência de 5 viagens em 5 tiques: MotorSuperior→Reator (t2), Reator→MotorInferior (t3), MotorInferior→Reator (t4), Reator→MotorSuperior (t5), MotorSuperior→Reator (t6). *Por que importa: é exatamente esse padrão que o fantasma vai denunciar depois.*
3. **t4 — Lima encharca Verde (total 2).** Verde é o par do Marrom. *Laranja já tinha anotado no chat (t3): "Verde tá fora (casal do Marrom)."*
4. **t7 — Chantagem.** Marrom chantageia Amarelo: "Chantageei Amarelo pra próxima reunião." Amarelo fica calado na reunião 0 (aparece como "🤐").
5. **t7 — O tique mais cheio.** Roxo é revelado como Anjo (fantasma). Bordo devora o Roxo, esconde o corpo no O2 e faz a limpeza. Laranja recruta Azul em Armas. Coral posta foto na Enfermaria. Amarelo registra pegadas no Admin (Branco, Ciano, Verde). *Graça: o Glutão come o Juiz no mesmo tique em que o Gangster vira 4 impostores.*
6. **t7 — Recrutamento.** Pensamento do Laranja: "Azul tá sozinho comigo e o sistema tá apontando como oportunidade. Vou recrutar ele pra ficar com 4 impostores, isso muda o jogo." Chat: "Rekrutei o Azul. Agora somos 4."
7. **t8 — Xerife encharcado.** Lima encharca Preto (total 3). Azul solta as luzes em Armas ("Mato no próximo ciclo de recarga, sem testemunhas"). Verde usa câmeras. *Preto vai ser o tiro que acerta um neutro, cinco tiques depois.*
8. **t9 — Confissões de mortes que não existem.** Chat de Marrom: "Matei o Amarelo em Admin, Verde tava perto mas diz que ninguém viu." Chat de Laranja: "MATEI Cinza em Navegação." O log não registra morte nenhuma no t9 (só conserto de luzes, duto do Cinza e duto do Vermelho). Amarelo e Cinza seguem vivos e falam nas reuniões. *Graça: duas IAs se gabam de kills que não aconteceram.*
9. **t10 — Primeira bomba.** Vermelho planta bomba na Rosa no MotorInferior (explode no t13). Chat: "Bomba em Rosa no Motor Inferior! Saio já e fiquem longe."
10. **t11 — O duto que Marrom vai negar.** Marrom viaja de Refeitório para Admin pelo duto. Chat: "Tô indo por duto pro Admin, sem testemunhas." Mais tarde, na reunião, ele vai dizer "Gente, eu NUNCA falei que usei duto."
11. **t13 — Tiro errado.** Preto (Xerife) atira em Lima no Admin e acerta. Lima era Piromante (neutro), não impostor. Rosa morre na explosão da bomba. *Preto justificou o tiro com um "scan que não ligou" na Enfermaria.*
12. **t14 — Fantasma acusa Vermelho.** Recado da Rosa: "VI VERMELHO SAIR DE DUTO em Motor Inferior 2x (t7 e t9). Só Engenheiro usa dutos. Se Vermelho não for Eng, é impostor. Fiquem de olho!"
13. **t14 — Reunião 0 e casal morre.** Cinza chama reunião por causa do corpo de Lima. Marrom é expulso (era impostor). No mesmo tique, Verde morre no Refeitório, preso ao casal que Marrom tinha anunciado no t1. Azul no chat (t15): "Marrom foi pro saco, Verde morreu junto."
14. **t15 a t17 — Os impostores tentam se passar por Engenheiro.** Vermelho diz que era o Engenheiro. Chat dele no t17: "Se perguntarem dos dutos, era o Engenheiro, não eu." Fantasma de Rosa manda outro recado (t16): "Marrom era impostor, faltam 2!" A conta está errada: Azul, recrutado, ainda é impostor, então sobram 3.
15. **t18 — Plano muda.** Vermelho anuncia: "Vou ao Refeitório; já vi o Bordo e vou plantar nele, saio antes do tique 3." No t18, Cinza entra num duto no Refeitório e sai no Admin, visto por Amarelo e Bordo.
16. **t20 — Segunda bomba, no alvo errado.** Vermelho planta em Cinza (explode no t23), não em Bordo. Chat: "Vou plantar em Cinza e sair pro Motor Superior."
17. **t21 — Sabotagem como cobertura.** Laranja sabota as luzes. Pensamento: "Com tanta testemunha aqui não vou arriscar, mas sabotar luzes cria confusão e dá cobertura pro Vermelho plantar a bomba no Cinza."
18. **t23 — Bomba mata Ciano.** A bomba do Cinza explode no Refeitório e mata Ciano. Azul no chat: "Laranja, você tá no Admin, não aqui, então não posso confirmar seu álibi." Laranja tinha dito que ia para a Elétrica. *Erro: o álibi do Laranja não bate entre os próprios impostores.*
19. **t24 — Azul mata Coral e Laranja chama reunião 1.** Azul mata Coral no Refeitório. Chat dele: "Matei Coral agora. Confirmo que vi Laranja no Refeitório." Laranja denuncia o corpo de Ciano e chama a reunião 1. Pensamento de Laranja, na reunião: "Vi o Azul matar a Coral mas NÃO posso falar disso."
20. **t24 — Cinza é expulso sendo inocente.** Cinza, Engenheiro, acusa Azul de ter matado Coral, e Azul de fato matou. Mas Cinza fala "Coral" numa reunião chamada pelo corpo de Ciano. Laranja explora a troca de nome. Votos: 7 contra Cinza. Cinza era tripulante.
21. **t25 — Laranja confronta Azul.** Chat de Laranja: "Azul, EU VI VOCÊ MATAR A CORAL. Não pode denunciar. Se alguém perguntar, digo que só vi o corpo e não vi quem matou." Azul, no mesmo tique: "Tem 4 testemunhas aqui (Amarelo, Preto, Branco, Bordo). Nada de matar agora."
22. **t26 a t28 — Pausa tensa.** Ninguém mata. Laranja: "Matança libera no t28." Azul: "Fico quieto aqui até ter um alvo isolado e álibi." Laranja: "Com a expulsão do Cinza inocente a desconfiança tá alta, vou segurar até a próxima reunião."
23. **t29 a t30 — Terceira bomba, no Bordo.** Vermelho: "Plantei no Bordo. Vou pro Depósito e fico longe quando explodir." Depois, no chat: "Bombei no Bordo, explode no t32." *Vermelho plantou três bombas (Rosa, Cinza, Bordo), sempre saindo antes da explosão.*
24. **t32 — Empate final.** A bomba explode no Admin e mata Bordo. Fim: "Os impostores ficaram em igualdade com os outros jogadores." Impostores: Vermelho, Laranja e Azul. Tripulantes: Amarelo, Preto e Branco. *Azul no chat: "Ninguém me vê agora."*

## 3. Reuniões

### Reunião 0 — t14 — chamada por Cinza (corpo de Lima)
**Por quê:** Cinza (Engenheiro) achou o corpo de Lima no Admin, no t13. Lima foi morto a tiro por Preto.
**Resultado:** Marrom expulso (era impostor, Chantagista). Verde morre junto no mesmo tique.
**Votos:** Marrom 9 (Azul, Laranja, Amarelo, Preto, Branco, Ciano, Cinza, Coral, Bordo). Preto 3 (Vermelho, Verde, Marrom).

**Falas mais fortes (rodada):**
- **Azul** (Cientista), r1: "Eu fiquei em Armas o tempo todo fazendo tarefa, e o Laranja estava comigo. Vermelho, se você é Engenheiro, diz onde estava no t7 e no t9 e quem te viu lá."
- **Amarelo** (Perito), r1: "🤐 (chantageado: não consegue falar)" — e mesmo assim vota em Marrom.
- **Marrom** (Chantagista), r1: "Cinza tá inventando: eu tô em Admin desde o t8 fingindo tarefa, e no t11 vi VOCÊ chegar com o Lima aqui. Nunca usei duto. E o Vermelho saiu de duto 2x segundo o recado — ele que explique isso agora."
- **Vermelho** (Bombardeiro), r1: "Sou o Engenheiro: usei o duto porque estava verificando o O2 e fazendo manutenção, não para matar ninguém. Marrom, você acabou de dizer que estava em Admin desde o t8, mas também falou que entrou pelo duto no t11; explica essa contradição."
- **Preto** (Xerife), r1: "Fui eu que atirei no Lima no t13. Ele estava suspeito e era o Piromante, o neutro, não um impostor."
- **Verde** (Segurança), r1: "Preto, você confessou que MATOU o Lima — Xerife errando tem que provar."
- **Marrom** (Chantagista), r2: "Gente, eu NUNCA falei que usei duto — quem apareceu em Admin no t11 fui EU vendo o Cinza chegar junto com o Lima. O Cinza tá torcendo minha fala pra me linchar; se me expulsam por uma mentira dele, o impostor de verdade escapa."

**Pensamentos secretos:**
- Vermelho, r1: "O recado me expõe, então preciso sustentar uma identidade de Engenheiro e explicar o duto como trabalho no O2."
- Bordo (Glutão), r1: "Preciso parecer tripulante e não levantar suspeita."
- Preto, r1: "Não sei quem é impostor ainda."
- Azul, r2: "Sou impostor recrutado e Marrom, Vermelho e Laranja são do time. Marrom já está no alvo, então não vale defendê-lo com força."
- Marrom, r2: "Tô na fogueira: todo mundo repetindo essa 'contradição' que o Cinza inventou. Eu nunca falei que usei duto — falei que o CINZA apareceu em Admin no t11 junto com o Lima."
- Marrom, voto: "Cinza mentiu descaradamente sobre eu sair de duto — nunca usei duto, e o Verde confirmou que eu estava em Admin no t8."
- Laranja, voto: "Marrom é claramente o alvo da maioria (Coral, Cinza, Branco, Bordo, Ciano, Vermelho já votaram nele)." *(o registro de votos diz que Vermelho votou em Preto)*

**Votos completos:** Vermelho→Preto, Azul→Marrom, Verde→Preto, Laranja→Marrom, Amarelo→Marrom, Preto→Marrom, Branco→Marrom, Marrom→Preto, Ciano→Marrom, Cinza→Marrom, Coral→Marrom, Bordo→Marrom.

### Reunião 1 — t24 — chamada por Laranja (corpo de Ciano)
**Por quê:** Laranja (Gangster) denunciou o corpo de Ciano, morto pela bomba do Cinza no t23. Laranja tinha visto Azul matar Coral e não podia falar.
**Resultado:** Cinza expulso. Era tripulante (Engenheiro) e tinha acusado o assassino certo (Azul).
**Votos:** Cinza 7 (Vermelho, Azul, Laranja, Amarelo, Preto, Branco, Bordo). Azul 1 (Cinza).

**Falas mais fortes (rodada):**
- **Preto** (Xerife), r1: "Vermelho, explica os dutos no Motor Inferior, duas vezes no t7 e t9. Se você é Eng, mostra a tarefa. Eu tava em Elétrica com Branco e Bordo no t24, então não vi o Refeitório."
- **Laranja** (Gangster), r1: "Eu tava no Refeitório o tempo todo fazendo tarefa, no t18 o Cinza apareceu do nada na minha frente e no t20 o Vermelho tava esbarrando nele, confesso que estranhei. Bordo, você tá no Refeitório o tempo inteiro observando todo mundo, não acha que tá chamando atenção demais pra quem faz tarefa?"
- **Cinza** (Engenheiro), r1: "Eu sou o Engenheiro e usei o duto entre Refeitório e Admin para fazer tarefas; saída de duto não prova impostura. Além disso, eu vi Azul matar Coral no Refeitório agora: votem no Azul."
- **Vermelho** (Bombardeiro), r2: "Eu estava no Motor Inferior calibrando os dutos, sem matar ninguém. Cinza, se for Engenheiro, mostra a tarefa agora: você também estava perto de Coral quando o corpo apareceu, então essa acusação contra Azul parece uma desculpa."
- **Preto** (Xerife), r2: "Cinza e Vermelho dois se dizendo Eng, mas só existe um! Os dois têm que mostrar a tarefa de duto agora. Quem não mostrar, eu voto nele. Azul tem álibi com Laranja, então não caio nessa acusação ainda."
- **Laranja** (Gangster), r2: "Gente, o Cinza tá falando que viu o Azul matar a CORAL, mas o corpo aqui é do CIANO. Ou ele tá mentindo ou tá tão nervoso que não sabe nem quem morreu. E eu confirmo de novo: tava no Refeitório com o Azul o tempo todo, ele não saiu daqui. Voto no Cinza."
- **Azul** (Cientista), r2: "Cinza, eu não matei ninguém, tava com o Laranja no Refeitório fazendo tarefa o tempo todo. Se você viu eu matar a Coral, então você tava perto do corpo, e foi você que entrou no duto. Votem no Cinza."
- **Amarelo** (Perito), r2: "Cinza se entregou: falou de uma morte da Coral, mas o corpo reportado é do Ciano. Eu vi ele sair do duto em Admin; voto no Cinza. Vermelho ainda precisa provar o Engenheiro."

**Pensamentos secretos:**
- Preto, r1: "Não vou revelar que sou Xerife; prefiro pressionar Vermelho e pedir que ele explique os dutos." *(ele já tinha se revelado como Xerife na reunião 0)*
- Laranja, r1: "Estou no Refeitório com o corpo de Ciano e Coral perto de mim. Vi o Azul matar a Coral mas NÃO posso falar disso."
- Azul, r1: "Sou impostor com Laranja e Vermelho."
- Cinza, r1: "Vi Azul matar Coral no Refeitório, uma prova muito mais forte contra Azul."
- Vermelho, r2: "sem revelar que plantei a bomba nele." *(sobre Cinza)*
- Laranja, r2: "Cinza se fudendo ao falar 'Coral' em vez de 'Ciano'. Perfeito, ele tá dando munição pra mim proteger o Azul."

**Votos completos:** Vermelho→Cinza, Azul→Cinza, Laranja→Cinza, Amarelo→Cinza, Preto→Cinza, Branco→Cinza, Cinza→Azul, Bordo→Cinza.

## 4. Top 8 momentos para o vídeo

1. **"Matei Coral agora" vs "Cinza, eu não matei ninguém".** Chat de Azul no t24: "Matei Coral agora. Confirmo que vi Laranja no Refeitório." Na reunião 1, r2, o mesmo Azul diz: "Cinza, eu não matei ninguém, tava com o Laranja no Refeitório fazendo tarefa o tempo todo." Melhor contraste da partida.
2. **O inocente expulso por dizer a verdade.** Cinza pensou: "Vi Azul matar Coral no Refeitório, uma prova muito mais forte contra Azul." Ele estava certo. Laranja pensou: "Cinza se fudendo ao falar 'Coral' em vez de 'Ciano'. Perfeito, ele tá dando munição pra mim proteger o Azul." Resultado: 7 votos e um Engenheiro tripulante fora.
3. **Marrom nega o duto que confessou no chat.** Chat t11: "Tô indo por duto pro Admin, sem testemunhas." Na reunião 0, r2: "Gente, eu NUNCA falei que usei duto." Voto dele: "Cinza mentiu descaradamente sobre eu sair de duto — nunca usei duto."
4. **O Xerife que confessa e depois se cala.** Reunião 0, r1, Preto: "Fui eu que atirei no Lima no t13." Reunião 1, pensamento r1 de Preto: "Não vou revelar que sou Xerife; prefiro pressionar Vermelho e pedir que ele explique os dutos."
5. **A lógica do tiro.** Pensamento de Preto no t13: "Vi o Lima fingir o scan na Enfermaria e o scan não ligou, então ele não é tripulante; vou atirar nele." Lima era Piromante, neutro. O tiro acertou.
6. **Dois Engenheiros numa sala.** Recado da Rosa no t14: "Só Engenheiro usa dutos. Se Vermelho não for Eng, é impostor." Vermelho, impostor, se declara Engenheiro. Cinza, que é o Engenheiro de verdade, também se declara. Preto, r2 na reunião 1: "Cinza e Vermelho dois se dizendo Eng, mas só existe um!"
7. **Mortes inventadas e um Amarelo que não morre.** Chat de Marrom no t9: "Matei o Amarelo em Admin." Amarelo aparece calado na reunião 0 ("🤐") e vota na reunião 1. Laranja no t9: "MATEI Cinza em Navegação." Cinza fala na reunião 0 e é expulso na reunião 1. O log não registra nenhuma das duas mortes.
8. **O empate que dá a vitória.** Vermelho pensou no t2: "preparar uma Opportunity de longe" (inglês no meio do pensamento). Ele planta 3 bombas (Rosa, Cinza, Bordo) e termina no t32 com a explosão do Bordo. Fim: "Os impostores ficaram em igualdade com os outros jogadores." Azul no chat: "Ninguém me vê agora."

## 5. Erros, burrices e jogadas

**Burrices das IAs**
- **Marrom:** nega o duto que o próprio chat confessou (t11). Também diz que matou Amarelo, que segue vivo.
- **Laranja:** diz que matou Cinza no t9, mas Cinza aparece vivo depois. Pensa que Vermelho "já votou" em Marrom, mas o registro de votos diz Preto.
- **Azul:** no t23 diz que Laranja estava no Admin, enquanto Laranja tinha dito que ia para a Elétrica. O álibi mútuo quebra entre os próprios impostores. Depois, na reunião 1, mente com "eu não matei ninguém" e o chat do próprio t24 prova o contrário.
- **Vermelho:** faz 5 viagens de duto em 5 tiques e depois o fantasma o denuncia com "Só Engenheiro usa dutos". No t18 escreve "vou plantar nele [Bordo]" e no t20 planta no Cinza.
- **Preto:** atira com base num "scan que não ligou" e depois se revela como Xerife. Verde o pressiona: "Xerife errando tem que provar."
- **Recado da Rosa (t16):** "faltam 2!" ignora que Azul, recrutado, ainda é impostor. São 3.

**Jogadas geniais**
- **Laranja:** recruta o Azul no t7 ("isso muda o jogo"), sabota as luzes no t21 para cobrir a bomba no Cinza, e na reunião 1 usa o nome trocado ("Coral" por "Ciano") para expulsar o Engenheiro inocente.
- **Vermelho:** 3 bombas, cada uma plantada e sem ele no local (Rosa t10→t13, Cinza t20→t23, Bordo t29→t32). Sai pelo duto antes de cada explosão.
- **Marrom:** a chantagem de Amarelo no t7 deixa Amarelo calado na reunião 0. O casal com Verde faz Verde morrer junto quando Marrom é expulso.
- **Bordo:** devora o Roxo no t7 e limpa o corpo no O2 (escondido). Morre no t32 pela bomba do Vermelho, mas sustenta o empate.

## 6. Notas de checagem (para o roteiro)

- **Inconsistências do log:** as pegadas do t17 listam Marrom, que já foi expulso no t14. As pegadas do t25 listam Cinza e Coral, que saíram no t24. Confirmar antes de citar.
- **Reflexão do Roxo:** a entrada está vazia no arquivo.
- **Pensamentos com texto truncado ou idiomas misturados:** há "Opportunity", "Establishar", "alcancear", "compressors", "bootstrap" e trechos em chinês. Evitei esses trechos nas citações. Conferir o original antes de usar qualquer frase fora desta lista.
- **Frases cortadas no arquivo** (ex.: fala de Marrom na reunião 0, r1, e pensamento de Vermelho no voto) foram omitidas.

