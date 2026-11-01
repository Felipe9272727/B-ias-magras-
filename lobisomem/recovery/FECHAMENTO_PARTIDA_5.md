# Fechamento da primeira partida nova (partida 5)

A vila venceu no dia 5. A apuração usa exclusivamente as ações preservadas da execução real, sem acrescentar falas ou decisões.

| Fase | Resultado real |
| --- | --- |
| Noite 1 | Padeira, Pistoleiro, morreu pelos lobos. |
| Dia 1 | Ferreiro, Lobisomem, foi linchado. |
| Noite 2 | Pescador, Vidente Espiritual, morreu pelos lobos. |
| Dia 2 | Lenhador, Lobo Vidente, foi linchado. |
| Noite 3 | Ninguém morreu. |
| Dia 3 | Florista, Lobisomem, foi linchada. |
| Noite 4 | Costureira, Xerife, morreu pelos lobos. |
| Dia 4 | Boticária, Padre, morreu após errar água benta em Cozinheira. Cozinheira, Médica, foi linchada. |
| Noite 5 | Moleiro, Vidente, morreu pelos lobos. |
| Dia 5 | Mineiro, Lobo Alfa e último lobo vivo, foi linchado. |

Sobreviveram Bardo, Viajante, Astrônoma, Ceramista, Carteiro e Relojoeiro.

## Estado auditável

O jogo e o fechamento de memória estão completos. As 16 reflexões reais foram recebidas e o diário está completo. `partida5.json` é o registro canônico. A apuração independente está em `logs_ep2/partida5.apuracao.json`, com hashes dos arquivos de origem.

O criador autorizou mais duas partidas, totalizando três novas. A partida 6 começou com memória individual legítima. O fragmento da execução perdida e os testes sintéticos continuam excluídos das partidas reais. A abertura recuperada já existe; as vozes e a renderização final do episódio ainda não foram produzidas.

## Histórico de bloqueios anteriores — resolvido para a partida 5

A revisão automática rejeitou os pedidos de reflexão de Moleiro e Lenhador por exigir autorização explícita para enviar os prompts e logs ficcionais ao OpenRouter. Os retornos de rejeição foram preservados em `raw_tools` e `audit` no checkpoint. Não houve tentativa de contornar a revisão. Uma chamada de Bardo está sem resultado recuperado; sua reserva continua contabilizada e não deve ser reenviada automaticamente.

Os GPTs são executados pela assinatura Work, com IDs reais dos subagentes e pedidos. O transporte bloqueia modelos `openai/` no OpenRouter.

As reflexões ausentes mencionadas neste histórico já foram concluídas. Não reiniciar nem completar a partida 5 novamente. Para o bloqueio atual da partida 6, consultar `RETOMADA_20261031.md` e `conciliacao_20261031.json`.


A autorização explícita para os dados no OpenRouter e GitHub foi confirmada pelo criador. As rejeições anteriores permanecem preservadas como histórico.
