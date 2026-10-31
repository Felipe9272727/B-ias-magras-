# Wolvesville / Lobisomem — episódio 2

Base recuperada: branch `claude/video-3`, commit `32585b9be814896627fafdac06c8c818b3c41581`.
Referência publicada: https://www.youtube.com/watch?v=lLJfOOiDbDo
Análise visual concluída pelo vidIQ: `job_03ebccad-b4ab-4d1e-bcd9-67633d75e100` (25 créditos).

## Elenco e partidas

16 jogadores independentes de 10 modelos; configuração exata em `elenco_ep2.json`.
Preservados os oito personagens da primeira parte; oito personagens novos.
Uma instância do GPT-6.1 Terra representa a vaga do ChatGPT. Ela recebe apenas
o próprio papel e informações permitidas, separada do assistente que organiza o vídeo.
Não é uma alegação de que a conversa de produção participa conhecendo todos os papéis.
Luna: uma instância; DeepSeek: uma instância, snapshot V4.1 Flash 1017.
Os modelos repetidos têm nomes, prompts, segredos e reflexões separados.

Quatro partidas novas, numeradas 5–8 para preservar a continuidade da campanha.
As quatro memórias anteriores vêm do arquivo original `logs/memoria.json`.
Só quem tem reflexão registrada recebe memória pessoal de uma partida anterior.
Papéis sorteados novamente: 3 Lobisomens, 1 Lobo Vidente, Vidente, Médico,
Carcereiro, Pistoleiro, Bobo, Padre, Xerife, Vidente Espiritual e 4 Aldeões.
São funções oficiais; esta seleção ainda é um rascunho da composição, não uma
alegação de reproduzir o preset ranqueado completo do jogo original.
O usuário pediu ampliar a pesquisa antes de fechar a seleção e iniciar partidas.
Funções inventadas foram expressamente excluídas pelo usuário.

## Integridade

- Todos os lobos conhecem os outros três parceiros.
- O Lobo Vidente consulta ANTES do chat/ataque; o resultado chega aos parceiros livres na mesma noite.
- Padre: um uso de água benta; acerto mata o lobo, erro mata o Padre. Não há conversão.
- Xerife: até dois vigiados; morte gera par de suspeitos, sem declarar qual é o executor.
- Vidente Espiritual: resultado conjunto de até dois alvos; um ataque bloqueado não conta como morte.
- Investigadores mortos à noite não recebem a pista do amanhecer.
- As habilidades de Bruxa, Médium, Cupido, Metamorfo e demais candidatos ainda não foram implementadas.
- Ataque dos lobos usa maioria; desempates usam a semente registrada.
- Vitória depende de todos os lobos restantes, sem a contagem fixa de dois.
- Falha de API/JSON pausa a partida; não cria falas, pensamentos ou votos de substituição.
- Respostas reais ficam em cache para retomar sem cobrar as mesmas decisões novamente.
- Testes sintéticos são identificados e ficam em diretório temporário; não entram no vídeo.
- Transporte via MCP OpenRouter conectado: nenhuma chave é lida de arquivos privados.
- A ponte registra modelo, ID da geração e custo; reserva máxima antes das chamadas.
- Limite inicial de US$ 2 para inferências desta continuação, mantendo margem do saldo consultado.

## Edição

Preservar os componentes originais, fundo rosa/azul, vila 2D, chat lateral,
memes/efeitos pontuais, carimbos do juiz e vozes próprias. Pensamentos com voz
normal e eco, nunca sussurro; sem emojis dentro do vídeo; sem lobby entre partidas.
Grade 4×4 e painel maior para o personagem ativo. A grade de oito continua compatível.
Falas/pensamentos saem dos novos logs; roteiro narrado e melhor partida final
serão escolhidos depois dos resultados. Não antecipar resultados no roteiro.

## Estado

Motor de 16 e três novas funções testados tecnicamente (8 testes).
A interface foi adaptada em código; a revisão visual de vídeo ainda está pendente. As partidas reais e a
produção de voz/vídeo ainda precisam ser concluídas; testes não são partidas reais.


## Pesquisa dos comentários e funções oficiais — 31/10/2026

Foram recebidos 40 comentários principais e 15 respostas, sem próxima página,
ordenados por relevância. Pedidos do próprio canal excluídos da análise. A amostra
é de um único vídeo, não uma votação representativa do público inteiro.
Padre foi pedido em 2 comentários; Ladrão, Xerife, Vidente Espiritual, Feiticeira e
Lobo Cego apareceram em pedidos individuais. Há também sugestões de funções
caseiras, excluídas pela instrução posterior do Felipe.

Referência de origem: https://www.youtube.com/watch?v=lLJfOOiDbDo
Catálogo oficial localizado: https://www.wolvesville.com/pt-BR/
A página inclui dados de 129 entradas, inclusive funções sazonais ou suspensas;
constar nela sozinho não prova disponibilidade permanente. Prayer está fora:
https://blog.wolvesville.com/2026/09/01/update-gyaru/

Candidatos oficiais para avaliar, sem alegar que já foram implementados:

- Aldeia: Bruxa, Médium, Detetive, Cupido, Prefeito, Caçador de Feras,
  Guarda-costas, Fofoqueiro, Vingador, Pacifista.
- Lobos: Lobisomem Alfa, Lobisomem Júnior, Lobisomem dos Pesadelos,
  Lobo Sombrio, Lobo Xamã; Lobo Cego ou Feiticeira como alternativa informativa.
- Objetivo independente: Caçador de Cabeças, Incendiário, Metamorfo.

O pedido de Ladrão é semelhante ao Metamorfo, mas não define sua regra oficial:
o Metamorfo muda a identidade que investigadores veem, sem herdar os poderes da vítima.
Lançamento confirmado: https://blog.wolvesville.com/2025/05/02/update-gothic/
Bruxa (aldeia) e Feiticeira (lobos) são funções diferentes.

A correção de informação compartilhada do Lobo Vidente é confirmada pelo update
Gothic acima. Para o Xerife, o anúncio oficial Dark Magic explicita dois vigiados,
enquanto a descrição resumida da landing page usa singular. O motor usa a regra
explícita de dois: https://blog.wolvesville.com/2023/01/01/update-darkmagic/
As mecânicas anteriores do jogo do canal são uma adaptação por turnos; os limites
e exceções devem continuar sendo conferidos antes das partidas reais.


## Direção de edição atualizada pelo Felipe

- Abrir com pedidos reais dos comentários, seguidos do anúncio de que finalmente chegou a parte 2.
- Duração mínima: 25 minutos. Mirar 28–32 minutos, respeitando o teto do canal de ~35.
- Variar músicas por clima e por partida; não manter a mesma faixa em loop no vídeo inteiro.
- Reaproveitar o ducking já existente: trilha abaixa durante falas.
- Conferir licença e incluir os créditos de todas as faixas realmente utilizadas na descrição.
- Trechos de comentário para a abertura: “Adiciona o Padre”; “faz com 16”; “FAZ PARTE 2”.
  São excertos reais, curtos e sem identificação do autor. Não reconstruir falas completas.
- Separar nome do personagem (ex.: Padeira) do papel secreto sorteado (ex.: Vidente).
- Novas adições pausadas após o Felipe contestar a seleção como inventada;
  esclarecer se a objeção é aos nomes dos personagens ou aos papéis, sem iniciar partidas reais.
