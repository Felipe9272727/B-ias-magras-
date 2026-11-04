# Revisão Haiku C: janelas 14:00 a 20:30 (Age of Empires, 6 IAs)

Notas de 0 a 10. Em "Tela parada" o 10 é "nada parado". Em "Repetição/jargão" o 10 é "nenhuma".
Cada janela foi avaliada com o texto de `texto_30s.json` e os 2 quadros (início+8 s e início+22 s).
Janela 20:30 tem só o quadro t1238 (o t1252 não existe no conjunto).

| Janela | Prende | Diversão | Tela parada | Entende | Repetição/jargão | Média | Problema principal → correção |
|---|---|---|---|---|---|---|---|
| 14:00 | 6 | 6 | 3 | 4 | 6 | 5.0 | Os quadros (t0848, t0862) mostram a partida 2 ainda rodando, com HUD e nenhum selo, meme ou placar de prêmios. Os dois quadros são o mapa parado. → Abrir com o placar de prêmios em tela cheia (DeepSeek "ARTISTA DA TRAIÇÃO · 5 PAGADORES") e pôr o meme e o selo sobre o quadro. Cortar a cena de base parada. |
| 14:30 | 8 | 6 | 5 | 5 | 7 | 6.2 | Gancho forte ("Atenas cai agora"), mas o quadro de +8 s é campo vazio e ninguém sabe qual cidade é a do MiMo. → Começar em t0892 (batalha), com selo grande "MINUTO 27 · MIMO: 0 ALDEÕES" e o nome "Atenas (MiMo)" na tela. |
| 15:00 | 6 | 6 | 5 | 6 | 6 | 5.8 | "Quartel falhou de novo" e "MESMA JOGADA · DE NOVO" dizem a mesma coisa. O quartel não aparece em close. → Sair um dos "de novo". Mostrar o quartel em close com contador grande ("5 MIN DE TENTATIVA"). |
| 15:30 | 6 | 6 | 5 | 5 | 6 | 5.6 | A fala de 25 s do DeepSeek ("Irmão, preciso ser honesto...") é bloco único lido sem corte; a tela só mostra o exército. → Ficar só com "Que tal ceder a área ao norte?" e pôr o selo "PROPOSTA DE PAZ · 13 SOLDADOS". |
| 16:00 | 6 | 6 | 5 | 4 | 6 | 5.4 | O quadro +22 s (Qwen, 36/40) é base parada longe da porta do DeepSeek, e "1.350" aparece sem legenda. → Mostrar o exército do Qwen parado na porta do DeepSeek e legendar "1.350 de quê?" (ou tirar o número). |
| 16:30 | 6 | 6 | 4 | 5 | 6 | 5.4 | O narrador fala do MiMo batendo na muralha, mas o quadro +8 s mostra a base do Qwen. Há "150 de comida" e "100 de comida" lidos em voz alta. → Cortar a cena do Qwen, mostrar o MiMo na muralha com "13 → 1" na tela e tirar os números da fala. |
| 17:00 | 5 | 5 | 5 | 4 | 6 | 5.0 | A narração fala do GPT e dos 8 soldados, mas os quadros mostram a base do DeepSeek e unidades azuis sem nome. O exército amarelo não aparece. → Mostrar o exército amarelo marchando com selo "ROMA: 8 SOLDADOS" no momento da fala. |
| 17:30 | 6 | 6 | 6 | 5 | 6 | 5.8 | O exército de Roma em marcha funciona bem; "ataque de teatro" é a melhor piada, mas ninguém explica o conceito. → Uma frase na tela: "Ataque de teatro: custa zero, é só fingir". |
| 18:00 | 7 | 6 | 7 | 5 | 6 | 6.2 | Boa cena (MiMo com 0 aldeões, exército roxo atacando). Jargão "0/60" e "recuo" sem explicação. → Trocar "0/60" por um número grande "0 ALDEÕES" e explicar em uma frase o recuo do GLM. |
| 18:30 | 5 | 5 | 4 | 4 | 5 | 4.6 | Pior janela: fala cheia de número ("158 de comida", "5 turnos", "14 soldados", "15 → 3", "1 soldado") e quadros da base do Qwen enquanto se fala do cerco do GLM. → Cortar os números da fala; mostrar o cerco do GLM ao MiMo com selo "14 SOLDADOS vs 0 ALDEÕES". |
| 19:00 | 6 | 7 | 6 | 5 | 6 | 6.0 | "A vítima paga o atacante" é a melhor ironia da janela e o selo com galaxy-brain funciona. "Esparta sangrando em Atenas" precisa de legenda de quem é Esparta. → Pôr "ESPARTA = GLM" no quadro. |
| 19:30 | 6 | 6 | 6 | 5 | 4 | 5.4 | Repete a estrutura do 14:00 ("Fim de jogo. Hora dos prêmios" e três selos em 11 s), e o meme mr-bean repete no 20:00. → Mostrar só um prêmio com número grande (MENDIGO MILIONÁRIO 5 → 65) e deixar os outros dois para o fechamento. Variar o formato do final. |
| 20:00 | 6 | 6 | 5 | 6 | 5 | 5.6 | Três selos empilhados em 13 s; o recap de três partidas (t1222) é mapa aberto parado e sem selo visível. A lição é uma frase longa. Mic-drop repete do 14:00. → Espaçar os selos (um por vez), trocar o recap por montagem de 3 cortes curtos e encurtar a lição para uma frase. |
| 20:30 | 5 | 6 | 6 | 8 | 7 | 6.4 | Fecha bem: pergunta ao público, selo "COMENTA" e meme de Michael Jackson. Só 10 s, e a pergunta é dupla ("Em qual confiaria? Quem trairia?"). → Deixar só "Quem te trairia primeiro?" e pôr o nome do fã (ideia de @Lucss) como selo. |

## Notas por critério (média das 14 janelas)

| Critério | Média |
|---|---|
| Prende a atenção | 6.0 |
| Diversão/piada | 5.9 |
| Tela parada (10 = nada parado) | 5.1 |
| Dá para entender | 5.1 |
| Repetição/jargão (10 = nenhuma) | 5.9 |
| **Média geral** | **5.6** |

## Fechamento

- Fecha bem: placar e prêmios com nome e número ("CLAUDE · MAIOR POPULAÇÃO NAS 3", "DEEPSEEK · MENTIU NAS 3"), lição de uma frase e pergunta ao público no 20:30.
- Problema: a lição do 20:00 é longa, e o placar do 14:00 não aparece nos quadros.
- Observação técnica: em quase todas as janelas os selos e memes descritos no texto não aparecem nos dois quadros amostrados (só as legendas de chat e o meme do 20:30 aparecem). Vale checar se a sincronia entre `texto_30s.json` e o render está certa antes de cortar qualquer coisa.

## As 3 piores janelas

1. 18:30 (4.6): números lidos em voz alta e base do Qwen parada no lugar do cerco.
2. 14:00 (5.0): nenhum efeito nos quadros, partida rodando no lugar do placar de prêmios.
3. 17:00 (5.0): a narração fala do GPT e a tela mostra a base do DeepSeek.
