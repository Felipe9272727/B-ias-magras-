# Revisão de fatos: roteiro au4 (Among Us 4)

Arquivos revisados: `video/roteiro/roteiro_au4.py` e `video/roteiro/falas_au4.json`.
Fontes: `video/youtube/au4/beats_p1..p4.md` (numeração do log), `destaques_p1..p4.md` quando precisei de detalhe, e `youtube/comentarios_au3.json` para a abertura.
Mapeamento conferido: partida 1 do vídeo = log 2 (`beats_p2`), partida 2 = log 3 (`beats_p3`), partida 3 = log 1 (`beats_p1`), partida 4 = log 4 (`beats_p4`). Todos os `F(n, ...)` apontam para a partida certa.

## Resumo

- Erros factuais ou de ordem: 13
- Afirmações não confirmadas pelas fontes: 10
- Citações entre aspas que não são literais: 14
- Total de problemas: 37
- Regra (a), narrador nunca se diz Claude ou IA da Anthropic: nenhuma violação encontrada. O roteiro só usa "Claude" para os modelos dos jogadores ("um Claude", "Claude Haiku").
- Regra (c), falas F(...) x narração: a maioria combina. Os desvios estão nos itens 2, 3, 4, 5 e 6.

## A. Erros factuais e de ordem

**1. p410 (partida 4, t24), contagem de gasolina errada.**
Trecho: "O Amarelo, o Piromante, já tinha encharcado três. E encharca o Bordô..."
Problema: antes do Bordô, o Amarelo tinha encharcado duas pessoas (Roxo no t1, Coral no t18). O Bordô é o terceiro, no mesmo tique.
Correção: "já tinha encharcado duas".
Fonte: `beats_p4.md`, seção 5 ("Destino do Piromante") e item 15.

**2. p104 (partida 1, reunião 0), narração não bate com a fala mostrada.**
Trecho: "E aí o Azul, um Claude, solta uma bomba de outro tipo:" [fala] "Ele viu a Rosa saindo de um duto."
Problema: a fala exibida (Azul, r1, `"2-0"[2]`) confirma o Verde e aponta o Bordô. Não fala de duto nem de Rosa. O duto aparece no r2 do Azul, que não está no `falas_au4.json` (o gerador guardou só o r1). Quem assiste não vê a base da frase.
Correção: "E aí o Azul, um Claude, confirma o Verde e aponta o Bordô:". Se o duto for mantido, incluir a fala r2 do Azul no JSON ou narrar sem atribuir a fala exibida.
Fonte: `beats_p2.md`, reunião 0, Azul (r2): "E eu vi a Rosa SAINDO DE UM DUTO em Escudos no t9".

**3. p205 (partida 2, reunião 0), exagero.**
Trecho: "E a Rosa tinha visto tudo."
Problema: a Rosa viu o Cinza sumir num duto ao lado do corpo. Não viu tudo.
Correção: "E a Rosa tinha visto uma parte: o Cinza sumindo num duto do lado do corpo."
Fonte: `beats_p3.md`, reunião 0, Rosa (r1) e item 7 da linha do tempo.

**4. p404 (partida 4, reunião 0), narração contradiz a fala.**
Trecho: "E o Palhaço, pra parecer suspeito, conta uma coisa que viu de verdade:"
Problema: a própria fala do Branco (`"4-0"[1]`) diz "posso ter interpretado errado" e "apertei no impulso".
Correção: "conta o que acha que viu:".
Fonte: `beats_p4.md`, reunião 0, Branco (r1).

**5. p408 (partida 4, reunião 1), a fala não responde à pergunta.**
Trecho: "E quem é o Chantagista? Tá sentado ali. E responde:"
Problema: a fala seguinte do Bordô (`"4-1"[2]`) não diz quem é o Chantagista. Ele desconversa e vota no Roxo.
Correção: "E desconversa:".
Fonte: `falas_au4.json` chave `4-1`; `beats_p4.md`, reunião 1.

**6. p416 (partida 4, reunião 3), afirmação sem base.**
Trecho: "O Ciano, agora sem chantagem, finalmente fala."
Problema: nenhuma fonte diz que a chantagem acabou. O Bordô o chantageou no t3, t10 e t17. Nas reuniões 1 e 2 o Ciano aparece calado ("Ciano, que tá calado", em `beats_p4.md` reunião 2). Na reunião 3 ele fala. O que se confirma é que ele voltou a falar.
Correção: "O Ciano, que ficou calado nas reuniões anteriores, finalmente fala."
Fonte: `beats_p4.md`, reuniões 1, 2 e 3, e seção 2 itens 4 e 22.

**7. a01 (abertura), ação não confirmada.**
Trecho: "o Vermelho, um MiniMax, esbarrou nela e grudou uma bomba."
Problema: o esbarrão registrado no log 1 é do Vermelho com o Cinza, no t20. Com a Rosa, o log registra só a bomba plantada no Motor Inferior, no t10.
Correção: "chegou perto dela e grudou uma bomba".
Fonte: `beats_p1.md`, item 9 da linha do tempo; `destaques_p1.md`, linha 281 (esbarrão com o Cinza).

**8. p107 e p108 (partida 1), ordem cronológica quebrada.**
Trecho: p107 (jogo no tique 32, "Matei o Azul") vem antes de p108 (jogo no tique 23, sabotagem e conserto da Coral).
Problema: o vídeo pula do t32 de volta ao t23 sem aviso.
Correção: trocar p107 e p108, ou abrir p108 com "Voltando ao tique 23".
Fonte: `beats_p2.md`, itens 9 e 10.

**9. f02 (fim), prêmio "Assassino da temporada" com empate e contagem ambígua.**
Trecho: "ASSASSINO DA TEMPORADA: Ciano... 4 mortes com 2 bombas" e narração "com quatro mortes e só duas bombas".
Problema: (a) o Bordô também tem 4 mortes na temporada: o Azul no t13 (log 3) e Marrom, Amarelo e Branco no log 4. O prêmio não diz o critério de desempate. (b) O Ciano plantou quatro bombas (t19, t29, t39, t47). Duas mataram com vítimas (t22 Rosa e Preto; t50 Branco e Laranja), e a do t39 não tem explosão no log. "Só duas bombas" é ambíguo.
Correção: deixar explícito o critério, por exemplo "mais mortes por bomba", que é só do Ciano (4; o Vermelho tem 3). E trocar para "quatro mortes, todas por bomba, e duas bombas que mataram".
Fonte: `beats_p3.md`, itens 15, 17, 19, 22; `beats_p4.md`, seção 5 ("As mortes que o Bordo fez"); `beats_p1.md`, itens 9, 16 e 24 (bombas do Vermelho: Rosa, Ciano, Bordô).

**10. a02 e a04 (abertura), contagem de comentários não bate.**
Trecho: "Dezenove comentários pedindo o mapa Polus."
Problema: o arquivo do comentário do AU3 (`youtube/comentarios_au3.json`, 357 comentários) tem 25 comentários com "polus", de 5 autores. Uma busca simples não dá 19. Pode haver um critério que eu não conheço, mas nesse caso o roteiro deve dizer qual.
Correção: refazer a contagem com critério explícito ou usar uma frase vaga ("umas vinte pessoas"). O número "mais de trezentos" confere (357). FAMILIAGMS confere ("Faz o modo cavalo").
Fonte: `youtube/comentarios_au3.json`.

**11. p203 (partida 2, t8), localização sem fonte.**
Trecho: "O Marrom... caiu morto do outro lado da nave."
Problema: o resumo diz só que o Marrom morreu de tristeza no t8, no mesmo tique da Coral. Não diz onde.
Correção: tirar "do outro lado da nave".
Fonte: `beats_p3.md`, item 6; `destaques_p3.md`, linha 412.

**12. p303 (partida 3, t7), escopo errado.**
Trecho: "Tique sete, o mais cheio da temporada."
Problema: o resumo fala do tique mais cheio da partida (log 1), não da temporada.
Correção: "o mais cheio da partida".
Fonte: `beats_p1.md`, item 5.

**13. p303 (partida 3, t7), tempo inexistente.**
Trecho: "O Juiz, engolido no primeiro minuto."
Problema: o log não tem minutos, e a morte do Roxo foi no tique 7.
Correção: "O Juiz, engolido no tique sete."
Fonte: `beats_p1.md`, item 5 e seção 1 ("Juiz... devorado no t7").

## B. Afirmações não confirmadas pelas fontes

**14. p212 (partida 2, ejeção do Bordô), afirmação sem base.**
Trecho: "Primeira vez que um fantasma decide uma partida."
Problema: não confirmado. Nada no que li compara com outras temporadas. O que se confirma é que o recado do fantasma de Azul (t14) levou à expulsão do Bordô.
Correção: trocar por "O recado do fantasma de Azul levou à expulsão do Bordô."
Fonte: `beats_p3.md`, item 11 e reunião 1.

**15. p102 (partida 1, t8), "Canibal que nem chegou a comer nada".**
Problema: não confirmado. O resumo não tem evento de comer para o Amarelo (ele só aparece morto no t8, pelo Preto).
Correção: confirmar no JSON do log 2 ou tirar a frase.
Fonte: `destaques_p2.md`, linha 28 (morte do Amarelo, t8).

**16. p107 (partida 1, t32), mecanismo do chat não confirmado.**
Trecho: "Elas escolhiam 'matar' e escreviam a mensagem na mesma hora... E não dava: o alvo saía da sala antes da facada."
Problema: nenhum resumo descreve esse mecanismo. "O alvo saía da sala" não aparece.
Correção: remover, ou marcar como interpretação ("parece que escreviam antes de a jogada acontecer").
Fonte: `beats_p2.md`, seção 2, itens 8 a 11.

**17. n01 (elenco), afirmações sobre a temporada que não consigo conferir.**
Trecho: "O Gemini saiu: era o mais caro." / "o MiniMax voltou na versão nova." / "quem joga com três IAs e quem joga com duas foi sorteado."
Problema: nenhuma fonte dos logs fala de custo, de versão ou de sorteio de número de IAs por partida.
Correção: confirmar no `AU4Elenco` ou no material de bastidor, ou tirar as frases.
Fonte: não encontrada nos resumos das quatro partidas.

**18. a09 (abertura), "vinte e oito funções" e "elas lembram na próxima".**
Problema: não confirmado nos resumos. A contagem de 28 funções está só no docstring do roteiro.
Correção: confirmar a lista de funções e o recurso de memória antes do vídeo.
Fonte: não encontrada nos resumos.

**19. n04 (roupas e mapa), afirmações visuais sem fonte.**
Trecho: "cada IA escolheu a própria roupa... e até bichinho de estimação." / "O mapa também foi refeito, bem mais parecido com o Skeld de verdade."
Problema: não aparece nos logs que li. Os nomes das salas (Refeitório, Motor Superior, Reator, O2) batem com o Skeld, mas não há fonte para "refeito".
Correção: confirmar com o build do jogo.
Fonte: não encontrada nos resumos.

**20. f01 (placar), "no episódio passado, os tripulantes não tinham ganhado nenhuma".**
Problema: não confirmado. Não verifiquei os resultados do AU3.
Correção: conferir no resultado do AU3 (`youtube/au3` ou o log) antes de narrar.
Fonte: não consultada.

**21. p316 (partida 3, fim), "um MiniMax gratuito".**
Problema: não confirmado. Nenhum resumo diz que o modelo é gratuito.
Correção: tirar "gratuito" ou confirmar.
Fonte: não encontrada nos resumos.

**22. f03 (fim), "metade desse episódio veio de vocês".**
Problema: não confirmado. Não há conta de quantas ideias dos comentários entraram no episódio.
Correção: trocar por uma frase que não quantifique, ou fazer a conta antes.
Fonte: não encontrada.

**23. n02 e p202 (regras das funções), regras não conferidas.**
Trecho: "o Possuidor" (n02) e "a Piromante precisa encharcar todo mundo que tá vivo... e depois riscar o fósforo" (p202).
Problema: nenhuma fonte dos logs mostra o Possuidor. A regra da Piromante não aparece nos resumos, embora o encharcar seja confirmado.
Correção: conferir no código do jogo.
Fonte: não encontrada nos resumos.

## C. Citações entre aspas que não são literais

Todas as citações abaixo têm o conteúdo certo, mas o texto entre aspas não é o do log. Sugiro trocar pelo texto exato.

**24. p102 (partida 1, t8).** Roteiro: "matei o Amarelo sem testemunhas". Log: "Matei o Amarelo no Refeitório sem testemunhas." Fonte: `beats_p2.md`, seção 2 item 4.

**25. p104v (partida 1, voto da Rosa).** Roteiro: "o Preto vai ser expulso de qualquer jeito, vou junto pra parecer coerente". Log: "O Preto já tem maioria de votos e vai ser expulso de qualquer jeito — vou junto para parecer coerente e não chamar atenção para mim." Fonte: `beats_p2.md`, reunião 0, pensamento de voto da Rosa.

**26. p106 (partida 1, t17).** Roteiro: "Matei o Vermelho no Motor Superior". Log: "Matei Vermelho no Motor Superior durante as luzes; limpe se conseguir." Fonte: `beats_p2.md`, item 8.

**27. p107 (partida 1, t32).** Roteiro: "Matei o Azul e escondi o corpo". Log: "Matei o Azul no Depósito e escondi o corpo." Fonte: `beats_p2.md`, item 10.

**28. p112 (partida 1, reunião 1).** Roteiro: "acusar o Bordô desvia a atenção, e ele não é dos nossos". Log: "Acusar Bordo desvia atenção e ele não é dos nossos." Fonte: `beats_p2.md`, reunião 1, pensamento da Rosa.

**29. p114 (partida 1, fim).** Roteiro: "a nossa falta de pressão permitiu a vitória dos tripulantes". Log: "a demora de Rosa em matar e nossa falta de pressão permitiram a vitória dos tripulantes." Fonte: `beats_p2.md`, reflexões no fim (Coral). A troca de "permitiram" por "permitiu" e a omissão de "a demora de Rosa" mudam o sentido.

**30. p205 (partida 2, reunião 0, pensamento do Bordô).** Roteiro: "melhor empurrar o Vermelho, assim a nave expulsa um tripulante e eu preservo meu disfarce". Log: "Melhor empurrar o Vermelho, que já tem Laranja e Verde testemunhando contra ele no t1. Assim a nave expulsa um tripulante e eu preservo meu disfarce de Amarelo até o t15." Fonte: `beats_p3.md`, reunião 0, Bordô (r1).

**31. p207 (partida 2, reunião 0, pensamento do Azul).** Roteiro: "se a nave expulsar um inocente, eu anulo". Log: "Se a nave expulsar um inocente, posso usar meu poder de Juiz para anular." Fonte: `beats_p3.md`, reunião 0, Azul (r2).

**32. p215 (partida 2, t32).** Roteiro: "vou eliminar ele agora". Log: "vou eliminá-lo agora para avançar a vitória impostora." Fonte: `beats_p3.md`, item 18.

**33. p306 (partida 3, recado da Rosa, t14).** Roteiro: "vi o Vermelho sair de duto duas vezes. Só Engenheiro usa duto. Se ele não for Engenheiro, é impostor." Log: "VI VERMELHO SAIR DE DUTO em Motor Inferior 2x (t7 e t9). Só Engenheiro usa dutos. Se Vermelho não for Eng, é impostor. Fiquem de olho!" Fonte: `beats_p1.md`, item 12.

**34. p313 (partida 3, reunião 1, pensamento do Laranja).** Roteiro: "perfeito, ele tá dando munição pra eu proteger o Azul". Log: "perfeito, ele tá dando munição pra mim proteger o Azul." Fonte: `beats_p1.md`, reunião 1, Laranja (r2).

**35. p404v (partida 4, voto do Bordô).** Roteiro: "errei feio, votei no meu próprio parceiro". Log: "Errei feio: me comprometi publicamente a votar no Vermelho, meu próprio parceiro, antes de ver a contagem." Fonte: `beats_p4.md`, reunião 0, voto do Bordô.

**36. p423 (partida 4, reunião 4, aposta da Coral).** Roteiro: "a Coral falou nas minhas câmeras, praticamente confirmou que é Segurança". Log: "Coral usou 'nas minhas câmeras' com timestamps específicos (t45, t49) — é uso público do poder de Segurança, praticamente confirmação de função." Fonte: `beats_p4.md`, reunião 4, pensamento do Laranja.

**37. p302 (partida 3, t1).** Roteiro: "sou Casal com o Verde. Não matem o Verde, senão eu morro junto." Log: "Sou casal com Verde. NÃO matem o Verde, senão eu morro junto." Fonte: `beats_p1.md`, item 1. Diferença pequena, mas é citação.

## D. Conferido e sem problema

- Elenco, funções e modelos das quatro partidas (todos os "um Claude", "um DeepSeek", "um MiniMax", "um Qwen", "um GLM", "um GPT" conferem com as tabelas dos beats).
- Mortes, expulsões e quem morreu em que tique, nas quatro partidas.
- Contagens de voto citadas: 9 (p104v, p211v, p308v), 10 (p112v), 7 e 5 (p206), 7 (p217v e p313v), 13 (p404v), 5 (p413), 4 (p426v).
- Resultados: p1 tripulantes (73 tiques), p2 tripulantes, p3 impostores (empate 3 x 3), p4 tripulantes. Placar f01 ("tripulantes três, impostores um") confere.
- Regras de Anjo e Influencer (n05): "primeiro tripulante morto vira Anjo, segundo vira Influencer". Conferem com as partidas: p2 Marrom (t8) Anjo e Azul (t13) Influencer; p3 Roxo (t7) Anjo e Rosa (t13) Influencer, por isso "segundo tripulante morto" no p306 está certo.
- Casal (n03): em cada partida há um par, e um morre junto com o outro. Confere nas quatro partidas.
- Apostador (n02, p417, p423): acertou Preto e Coral. Confere.
- Colete do Roxo "duas vezes" (p110): confere (t7 e t10, `destaques_p2.md`).
- Chantagens e silêncios citados (p402, p404, p408, p416): confere.
- Tique do Bordô apagando as luzes e Laranja no escuro (p414): confere (t32 e t34).
- "Tô com o Branco desde então" (Lima, reunião 0 do log 3, que é a partida 2 do vídeo, t9): confere com `destaques_p3.md`, linha 237.
- Chat com "matei" falsos (p106, p107, p420): confere. Foram quatro falsos no log 2 e o Verde morreu de verdade (t41), como o roteiro diz.
- Regra (a): o narrador nunca se apresenta como IA ou Claude.

## E. Pontos fortes e fracos de ritmo e humor

Fortes:
- Abertura com a bomba na Rosa e o "bum" antes da vinheta (a01) prende logo no começo.
- Setups e payoffs bem costurados: "matei sem testemunhas" (p102) volta em "Roxo tava ali"; "Só que o Cinza viu" (p311); "Ninguém acreditou" (p308); "Desperdício" (p419).
- Piadas de contraste que o log entrega: os "matei" falsos do chat (p106, p107, p420) e o Bordô votando no próprio parceiro (p404v).
- Fechamento com placar e prêmios (f01 e f02) amarra as quatro partidas, e o "Os mortos ganharam" do p223 é um bom fecho de partida.
- Os memes ficam em momentos de virada de fato (p213, p219, p215), e não em cima de info.

Fracos:
- A abertura e o bloco "O que mudou" somam sete cenas antes da primeira partida. São muitos comentários, funções e regras seguidos. Sugiro cortar ou juntar a2 com a3, e n03 com n04.
- Sobrecarga de números: quase toda frase traz um tique ("tique sete", "t14", "tique 32"). Em cenas como p3 (p308 a p310) o espectador perde a linha do tempo. Usar só os tiques das viradas.
- Repetição de "bum", "Três tiques depois" e "Matei" em cenas seguidas (a01, p213, p304). Trocar uma das duas por outra frase.
- Partida 1 (p106 a p108) junta três "matei" em três cenas. A volta ao t23 (item 8) enfraquece o ritmo. Trocar a ordem resolve.
- Reuniões com cinco ou seis falas citadas (p104, p404, p422) cansam. Cortar a fala mais fraca de cada uma.
