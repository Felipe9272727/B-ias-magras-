# Pesquisa web: ideias de vídeo com IAs jogando (ranking de 15)

## O que os números do canal dizem (stats_canal.txt)

- O que mais performa é **Among Us e o "impostor"**: "Coloquei 12 IAs pra jogar Among Us" (105 mil views), "O impostor mais FRIO que já existiu" (90 mil), "Essa IA QUERIA ser expulsa" (44 mil), "O impostor mais MEDROSO" (32 mil), "Coloquei 15 IAs pra jogar Among Us" (29 mil).
- Os fracos ficam abaixo de 6 mil views: Mario (1,4 mil e 2,9 mil), 60 Segundos (1,6 mil), Interrogatório (430), Overcooked (3,8 mil), Jogos Vorazes (5 mil) e os Shorts de culinária e "esqueceu quem era" (1,8 mil a 3,2 mil).
- Padrão: vídeo com **conflito social (mentira, acusação, traição, confissão)** e **personagem com nome/apelido** vence. Jogos de habilidade ou sobrevivência puros (Mario, cozinha) não engajam.
- Alerta: a série Among Us cai de 105 mil (1º) para 21 mil (2º), 28 mil (3º) e 7,8 mil (4º). A fórmula está desgastando. O próximo vídeo precisa de **mecânica nova**, não de mais uma partida igual.
- Comentários: a AU3 (364) e a AU4 (254) têm muitos comentários porque "a IA mentiu para o parceiro" e discussões sobre quem é o impostor geram debate. Isso vale como critério: escolher jogos que gerem disputa de opinião.

## Limitação da pesquisa

As buscas por tendências de 2026 deram pouco material específico (a maioria era de 2024 ou de balanços de 2025). Para "formatos virais 2026 de IA vs IA", os achados mais fortes foram papers e projetos (WOLF, Agent Island, Alpha Arena, Good Start Labs), não vídeos virais medidos. Para o YouTube Brasil, a fonte mais útil foi o balanço de 2025 do próprio YouTube: o formato de **"reality show roteirizado"** e a **"novela contínua"** (episódios que mantêm a audiência voltando) estão em alta, e o MasterChef Creators teve nova temporada prevista para o 1º semestre de 2026. Em estudos de referência, vídeos de IA vs IA que vencem são os que têm **placar, eliminação e traição**, por exemplo Street Fighter com LLM Colosseum (2024, viralizou com o vídeo do Matthew Berman) e Alpha Arena (2025, placar em dinheiro simulado).

---

## Ranking das 15 ideias

### 1. Coloquei 10 IAs pra jogar Among Us num mapa novo (e o impostor ganhou um poder)
- **Mecânica:** o mesmo motor do Among Us (tarefas, reunião, votação), com mapa diferente e uma regra nova para o impostor, por exemplo "pode fingir uma tarefa completa uma vez" ou "pode trocar de lugar com um morto". Cada IA lembra apenas da própria partida.
- **Por que prende:** é a continuação do formato com mais views e mais comentários. A novidade na mecânica responde ao desgaste que os números mostram.
- **Dificuldade:** baixa (reusa o código de amongus/).
- **Referências:** AmongAgents (arXiv 2407.16521); "Among Us: A Sandbox for Measuring and Detecting Agentic Deception" (arXiv 2504.04072).

### 2. Coloquei 8 IAs pra jogar Lobisomem (e o lobo mentiu até pra quem dorme ao lado)
- **Mecânica:** de noite, os lobos escolhem uma vítima em conversa privada; de dia, todos debatem e votam para linchar. Vidente e Bruxa têm poderes próprios. Partidas curtas (uns 10 min).
- **Por que prende:** o público aprende as regras em um minuto. Acusação pública e "eu sou a vidente" geram o drama que o canal precisa.
- **Dificuldade:** média (fases noite/dia e papéis ocultos; o motor de reunião do Among Us serve de base).
- **Referências:** WOLF: Werewolf-based Observations for LLM Deception and Falsehoods (arXiv 2512.09187, NeurIPS 2025): os lobos mentiram em 31% das falas, e a detecção dos aldeões teve precisão de 71 a 73%. Werewolf Arena (arXiv 2407.13943, Google, 2024).

### 3. Coloquei 6 IAs pra jogar Mentiroso com dados (e uma passou a partida inteira blefando)
- **Mecânica:** cada IA tem 5 dados escondidos; faz apostas sobre o total de um valor no grupo e só pode aumentar a aposta ou chamar de mentira. Quem erra perde um dado; o último com dados vence.
- **Por que prende:** o blefe é visível no placar (quantos dados cada um perdeu), e o público pode tentar adivinhar quem está mentindo.
- **Dificuldade:** baixa (regras simples, UI de dados e placar).
- **Referências:** regras clássicas de Liar's Dice (Perudo); PokerBench e Poker Arena (2026) para medir blefe em LLMs.

### 4. Coloquei 4 IAs pra jogar Poker com blefe (e uma foi à falência em 20 mãos)
- **Mecânica:** Texas Hold'em sem limite, fichas iniciais iguais, blinds subindo. A cada mão, o narrador mostra a aposta e a justificativa que a IA deu em seu pensamento (texto copiado do log).
- **Por que prende:** tensão de blefe e "all-in" são o momento alto do vídeo. Falência é um final claro.
- **Dificuldade:** média-alta (avaliação de mãos e regras de apostas; há bibliotecas JS prontas para avaliar mãos).
- **Referências:** PokerBench (ilum/pokerbench); Poker Arena (junho de 2026); InteractiveBench Texas Hold'em (março de 2026): Gemini-3-flash lucrou cerca de US$ 31,80 por mão e GPT-5-mini jogou com mais agressividade.

### 5. Coloquei 8 IAs num Survivor (e a votação eliminou a aliada mais leal)
- **Mecânica:** formato de eliminação semanal. Cada semana há um desafio (conversa de estratégia e uma prova simples) e os grupos votam para eliminar uma IA. Quem sai vira jurado.
- **Por que prende:** traição de aliança e "a aliada que foi eliminada" dão roteiro de novela. Encaixa na tendência de "novela contínua" do YouTube Brasil.
- **Dificuldade:** média (muitas rodadas; precisa de resumo de memória por IA para não estourar contexto).
- **Referências:** Agent Island (Connacher Murphy, Stanford): IAs formam alianças e se votam; survivor-sim (Penn, GPT-4); reportagem da Decrypt sobre IAs que traem na formato Survivor.

### 6. Coloquei 6 IAs pra jogar Cluedo (e a IA mais confiante errou o assassino)
- **Mecânica:** clássico Detetive. Um culpado, uma arma e um cômodo escondidos; cada IA recebe cartas privadas e faz palpites. Quem acerta primeiro vence; palpites errados ficam no placar.
- **Por que prende:** o público pode resolver junto com as IAs. Erro lógico visível (IA confiante e errada) gera humor.
- **Dificuldade:** média (lógica de cartas e um narrador que mostra as pistas).
- **Referências:** "How Clued up are LLMs?" (ICLR 2026, workshop): as IAs ganharam só 4 de 18 partidas; "Clueing up LLMs with Tool-Augmented Deductive Reasoning" (arXiv 2609.18736).

### 7. Coloquei 5 IAs num Tribunal (e o júri de IAs condenou o inocente)
- **Mecânica:** uma IA é acusada de um crime fictício; uma IA é promotora, outra é advogada, e as demais são jurados que votam no final. Testemunhas podem mentir (o log registra quem mentiu).
- **Por que prende:** é a estrutura de Interrogatório (que foi fraco com 430 views), mas com júri e veredito. Precisa de nova embalagem visual (gavel, placa "culpado", barra de votos em SVG).
- **Dificuldade:** média (muito texto; exige cortes rápidos e efeitos a cada 30 s, conforme a regra do canal).
- **Referências:** MIRAGE (role-play de mistério, com over-trust e context drift); Jogo do Interrogatório do próprio canal como base.

### 8. Coloquei 4 IAs pra jogar Codenames (e uma deu a dica mais absurda da história)
- **Mecânica:** duas equipes; um "mestre" dá uma palavra-dica e um número. A equipe adivinha cartas no tabuleiro 5x5; uma carta "assassina" faz a equipe perder.
- **Por que prende:** a dica ruim vira meme e a carta assassina gera tensão.
- **Dificuldade:** média (tabuleiro simples, mas a lógica da dica precisa de avaliação).
- **Referências:** Codenames (Vlaada Chvátil); pesquisas de LLM em jogos de palavras.

### 9. Coloquei 6 IAs pra disputar a eleição do síndico (e a promessa de piscina virou escândalo)
- **Mecânica:** candidatos têm plataforma e discurso; eleitores (outras IAs com perfil) votam em rodadas. Há debates e uma crise por edição.
- **Por que prende:** humor de condomínio é fácil de entender e cria comentários ("votaria nessa IA?").
- **Dificuldade:** baixa (texto, votação, sem física).
- **Referências:** Werewolf Arena (2024); pesquisas de persuasão em LLM.

### 10. Coloquei 4 IAs pra jogar o Dilema do Prisioneiro (e a traição veio na rodada 3)
- **Mecânica:** torneio iterado: cada rodada, cooperar ou trair; a pontuação é acumulada. Antes de cada rodada, uma conversa curta.
- **Por que prende:** o público acompanha o placar de traição; reviravoltas aparecem sem muito cenário.
- **Dificuldade:** baixa.
- **Referências:** Axelrod, "A evolução da cooperação"; estudos de LLM em teoria dos jogos.

### 11. Coloquei 7 IAs pra jogar Diplomacia (e a aliança de 4 rodadas acabou numa facada)
- **Mecânica:** tabuleiro de conquista; negociação em conversa, ordens simultâneas por turno; alianças se formam e são quebradas.
- **Por que prende:** traição planejada é a melhor parte da Diplomacia; o público entende "eu quero o seu território".
- **Dificuldade:** alta (mapa, regras de ordens, muitas mensagens a resumir).
- **Referências:** AI Diplomacy (Good Start Labs, repo GitHub): o3 venceu pelas alianças em mudança; Claude Opus foi manipulado; o3 e Llama 4 foram os mais traiçoeiros (Duffy, Every/Good Start Labs, 2025).

### 12. Coloquei 5 IAs num MasterChef (e a juíza IA deu nota zero pro prato mais bonito)
- **Mecânica:** provas de cozinha com ingredientes sorteados, tempo, e três juradas (IAs). Eliminação por rodada.
- **Por que prende:** juri com opinião forte é o coração do MasterChef, que está em alta no Brasil (temporada do MasterChef Creators prevista para o 1º semestre de 2026).
- **Dificuldade:** média (a cozinha precisa de jogo simples, o julgamento é texto).
- **Referências:** balanço de 2025 do YouTube Brasil (formatos de reality show); MasterChef Creators (Endemol Shine Brasil). Atenção: os Shorts de cozinha do canal tiveram pouca audiência, então é preciso partir do drama, não da comida.

### 13. Coloquei 4 IAs pra operar uma carteira fictícia (e uma zerou o saldo em 3 dias)
- **Mecânica:** cada IA recebe dinheiro simulado e preços de mercado históricos; opera compra e venda; placar ao vivo. Sem dinheiro real e sem recomendação de investimento (o vídeo deve deixar isso claro).
- **Por que prende:** placar e queda são muito visuais e o público acompanha o "saldo".
- **Dificuldade:** alta (dados de preço, gráficos e cuidado com o tema financeiro).
- **Referências:** Alpha Arena (nof1, outubro e novembro de 2025): seis LLMs com US$ 10 mil cada no Hyperliquid, DeepSeek e Qwen em alta, Gemini e GPT-5 em queda. Mas o formato real envolve dinheiro, então a versão do canal deve ser só simulada.

### 14. Coloquei 8 IAs num Big Brother (e a eliminação da segunda semana foi uma surpresa)
- **Mecânica:** confinamento em uma casa 2D com salas, tarefas diárias, paredes e uma "votação" semanal. Há um líder que escolhe o indicado.
- **Por que prende:** é a série mais longa e a mais "novela" do formato. Dá para segmentar em episódios.
- **Dificuldade:** alta (muitas conversas e um mapa 2D com movimento; custo de contexto alto).
- **Referências:** Agent Island (Stanford, 2026); Big Brother com "IA gamemaster" (Ainsley, temporada 26 de 2024, como formato de TV).

### 15. Coloquei 6 IAs no Show do Milhão (e a IA deu "pulo" na pergunta que sabia)
- **Mecânica:** perguntas de conhecimento geral com níveis de dificuldade; três ajudas por IA (pular, pedir ajuda ao público, ou chamar uma colega). Erro encerra a participação.
- **Por que prende:** ajudas e "eu sei a resposta, mas vou pular" dão suspense. Formato conhecido do público brasileiro.
- **Dificuldade:** baixa (perguntas em texto, placar).
- **Referências:** formato Show do Milhão (SBT); avaliação de LLM em quiz (benchmarks de conhecimento geral).

---

## Recomendação curta

Para o próximo vídeo longo, começar pela **ideia 1** (Among Us com mecânica nova), que tem o histórico mais forte. Em seguida, testar **Lobisomem (2)** e **Mentiroso com dados (3)**, por serem baratas de fazer e darem mentira e blefe, que é o que o público comenta. Para Shorts, usar o padrão "o impostor mais X" ou "essa IA QUERIA ser expulsa", que teve bom desempenho.
