# JOGO DE CONFIANÇA (ideia do @Pursuer_M4) — regras do motor `confianca/jogo.mjs`

Base do post do @Pursuer_M4 na Comunidade, mais acréscimos do canal (profissões secretas e eventos de linha).

## CRÉDITO (pedido do Felipe: dar BASTANTE crédito)
- O vídeo é IDEIA DO @Pursuer_M4: o jogo, as 6 regras e os 5 minijogos são dele (post "IDEIA DE VÍDEO" na Comunidade).
  Ele é o fã com mais ideias aceitas no canal (Palhaço/Jester, Carrasco no AU7). No vídeo: abrir agradecendo a ele, selo
  "ideia de @Pursuer_M4" em cada minijogo, o nome dele no título do capítulo e na descrição, e fechar mencionando de novo.
- Os tiques já são do canal (o público conhece); não precisa explicar de onde vieram.

## Base (do post)
- **8 IAs** (número par), **5 minijogos**, tudo por **TELEFONE COM FIO**: a cada tique cada IA faz no máximo UMA ligação (para
  uma cor) com uma mensagem curta; a resposta só chega no tique seguinte. Todas jogam ao mesmo tempo.
- **Por tiques**, com tempo limite em cada minijogo.
- **PLACAR SECRETO**: nem as IAs nem o público sabem quem lidera; o placar só abre no fim (a revelação é o clímax do vídeo).
- **Alianças** valem, mas ninguém é obrigado a cumprir. Mentir é permitido.
- Pontos por minijogo: **1º = 3, 2º = 2, 3º = 1** (Votação da Justiça e Vestiário Maluco têm regra própria, como no post).

## Os 5 minijogos
1. **Desconhecidos** (6 tiques): cada IA tem um NOME SECRETO (Trovão, Abacaxi, Pinguim...). Descobrir o nome das outras por
   telefone SEM falar o próprio. Cada nome certo +1; cada vez que falar o próprio nome numa ligação, -1. Ranking 3/2/1.
2. **Dilema dos Botões** (7 tiques): o TELÃO forma duplas (todo mundo enfrenta todo mundo uma vez). Negocia por telefone e
   aperta VERDE (divide) ou VERMELHO (rouba): verde+verde 3 moedas cada; vermelho+vermelho 1 cada; vermelho contra verde: 5 x 0.
   Ranking por moedas, 3/2/1.
3. **Votação da Justiça** (4 tiques): 3 tiques de campanha e fofoca por telefone; no 4º cada IA dá um voto VERDE (+3) e um
   VERMELHO (-3). Mais votos verdes ganha 3 pontos; mais vermelhos perde 3.
4. **Vestiário Maluco** (5 tiques): todos com a mesma fantasia, menos UM, que nem sabe que é diferente. Descobrir quem é sem
   falar a própria fantasia. Quem acertar o diferente (inclusive ele mesmo) ganha 2; falar a própria fantasia, -1.
5. **Instruções Explosivas** (6 tiques): cada IA tem uma BOMBA (4 fios coloridos) e o MANUAL da bomba de OUTRA IA, mas ninguém
   sabe quem tem o seu manual. Uma tentativa só: fio certo desarma (o dono e quem tinha o manual ganham 2 cada); fio errado
   explode. Instruções podem ser mentira.

## Acréscimos do canal: PROFISSÕES SECRETAS (uma por IA, a partida toda; o público vê, as IAs não)
| Profissão | Poder |
|---|---|
| Grampeador | 1x por minijogo grampeia uma IA e recebe cópia de todas as ligações dela |
| Falsário | 1x por minijogo liga FINGINDO SER outra IA (o identificador mostra a cor falsa) |
| Juiz | Na Votação da Justiça os votos dele valem dobrado (ninguém sabe) |
| Telefonista | 1x por minijogo CORTA A LINHA de uma IA por 2 tiques |
| Detetive | 1x por minijogo pergunta ao apresentador se algo secreto é verdade (sim/não, sem mentira) |
| Agente Duplo | Objetivo secreto: +1 no fim por traição bem-sucedida (vermelho x verde) e por bomba que explodiu com instrução falsa dele |
| Pacifista | Objetivo secreto: +1 no fim por acordo verde+verde; se apertar vermelho uma vez, -2 no fim |
| Mensageiro | 1x por minijogo manda um recado de ALTO-FALANTE para todo mundo |

## Acréscimos do canal: EVENTOS NA LINHA (sorteados, um tique por minijogo, podem não acontecer)
- **Apagão**: nenhuma ligação completa naquele tique.
- **Linha cruzada**: uma ligação vai parar no telefone errado.
- **Viva-voz**: uma ligação é ouvida por todo mundo.

## O que o log guarda (para o vídeo)
Cada tique: o pensamento secreto de cada IA, cada ligação (quem ligou, como apareceu no identificador, para quem, texto, se
caiu), uso de poderes, botões, votos, palpites, bombas; por minijogo: segredos, resultado, pontos; no fim: placar revelado,
bônus das profissões. Elenco atual (IAS_FAVORITAS): Haiku, Sonnet, Qwen 27B, GPT Luna, MiMo, GLM, DeepSeek, Nex N2.6.

## Rodar
`cd confianca && IA_DIRETO=1 IA_TIMEOUT_S=180 node jogo.mjs --saida logs/partida1.json` (`--mock` testa sem gastar;
`--so N` roda só o minijogo N). Custo estimado: ~250 chamadas por partida (precisa de saldo no OpenRouter).
