# Direção de edição — "Jogo de Confiança" (ideia do @Pursuer_M4)

Complemento do `storyboard.md` (não o substitui). Narrador: eu, em 1ª pessoa. Sem emoji, sem sussurro (pensamento = voz normal com eco), sem lobby, sem meme repetido.

## 1. Identidade visual: a mesa telefônica

- **Ideia**: uma central telefônica antiga vista de cima. Fundo verde-garrafa `#10261F` com textura de feltro; papel (manual, cédula, post-it, cartão do Pursuer) em creme `#F4EBD0`. **Fio = o que foi dito; papel = a verdade que só o público vê.**
- **Cores das IAs** (telefone, fio, balão, barra): Vermelho `#E0262B`, Azul `#3D7BF2`, Verde `#19A974`, Amarelo `#FFC83D`, Rosa `#FF6FB5`, Laranja `#F2802E`, Roxo `#8E4DE0`, Ciano `#22C7D6`. Botão vermelho e fio vermelho usam um vermelho mais escuro `#9E1B1F` para não confundir com a IA Vermelho.
- **Telefone com fio**: 8 telefones de disco em roda, sempre na mesma posição. Ligar = o fone sai do gancho e um fio espiral na cor de quem liga é plugado no painel até o outro telefone.
- **Ligação**: o balão viaja pelo fio como um pulso de luz e **para no meio com "CHEGA NO PRÓXIMO TIQUE"**; só encosta no destino na cena em que foi ouvida. Ligação que caiu se desfaz em chiado. Viva-voz: o fio se divide em oito e sai um megafone. Linha cortada: tesoura, fio no chão, telefone cinza. Apagão: lâmpadas estouram, só os mostradores acesos.
- **Três balões, sempre iguais**: pensamento = nuvem com ondas de eco e etiqueta "SÓ VOCÊ VÊ"; ligação = balão com fone na cor de quem fala; poder = crachá que cresce, com guichê "APRESENTADOR" no caso do Detetive. Citação "só na tela" entra menor, sem animar a boca do telefone.
- **Profissões**: crachá de papel embaixo de cada telefone, visível o vídeo inteiro, pequeno. Acende e cresce só quando o poder age (e aí o narrador explica em uma frase). Objetivos secretos (Pacifista, Agente Duplo) têm o valor coberto por tarja "NO FIM" até R2 e R3.
- **Placar secreto**: cadeado fixo no canto superior direito, "PLACAR SECRETO · FALTAM N MINIJOGOS", que gira e bate a cada fim de minijogo. Antes de R1: nenhuma soma, nenhum ranking geral. Dois contadores ficam à vista sem valor: **apertos de mão** (Vermelho) e **facas** (Laranja). Eles são o placar escondido e pagam na revelação.
- **Os 5 minijogos, uma tela para cada**: 1 mesa com etiquetas de nome; 2 telão de duplas com botões sob tampa; 3 balança com cédulas na cor do eleitor; 4 vestiário de 8 cortinas e quadro de barbante; 5 painel da bomba com 4 fios e a folha do manual presa no telefone de quem guarda. Cartão de capítulo sempre com o selo **"IDEIA DE @Pursuer_M4"** e a regra dele em uma frase.
- **Tipografia** (em `public/fonts`): Bangers em selos e números gigantes; Poppins 800/600 em cartões e legendas; JetBrains Mono em contadores e no relógio "TIQUE n DE 6". Selos são carimbos tortos (de -6 a +6 graus), mínimo 2,5 s, mesmo tempo do meme, nunca cortados pelo fim da cena.
- **Câmera**: deriva lenta em toda cena; ela viaja pelo fio de um telefone ao outro (nunca corte seco entre os dois lados de uma ligação). Zoom de soco só no evento: tampa do botão abrindo, carimbo, alicate fechando.

## 2. Transição própria: a troca de pino

A câmera sobe para o painel da central; uma mão desenhada puxa o pino do minijogo que acabou e pluga no seguinte (`mouse-click`); o fio estica, vira a linha de base do cartão de capítulo e o título é escrito nele. 1,2 s. Em X11 a transição **não acontece**: os pinos caem todos e sobra o cadeado. Dentro do capítulo: corte seco ou `whoosh` seguindo o fio.

## 3. Música por capítulo (`public/music`, conferir `CREDITS.md`)

| Capítulo | Clima | Trilha |
|---|---|---|
| Abertura | impacto e mistério | `hitman` |
| M1 Desconhecidos | fofoca, esperteza | `sneaky-snitch` |
| M2 Dilema dos Botões | golpe em andamento | `scheming-weasel-faster` |
| M3 Votação da Justiça | tribunal desconfiado | `investigations` |
| M4 Vestiário Maluco | bobo, de palhaço | `quirky-dog` (apagão: corta tudo) |
| M5, X1 a X3 | suspense com humor | `thinking-music` |
| M5, X4 a X7 (a mentira) | sombrio, crescendo | `darkest-child` |
| M5, X8 a X10 (o salto de fé) | tensão máxima | `night-of-chaos`, cortada no alicate |
| Revelação | mágica, depois festa | `spellbound` em R1; `heroic-age` a partir do 15 em R2 |
| Fechamento | prêmios | `winner-winner` |

Fade de 1 s entre capítulos; volume baixo sob citação. **Silêncio é efeito** em: explosão de X7 (0,5 s antes), corte de X10 (1 s), X11 inteiro e 1 s antes do `sad-trombone` de R4.

## 4. As 5 cenas para caprichar

- **A1 (gancho)**: três planos em 11 s: alicate no preto, explosão com tremor, telefone roxo caindo do gancho. Carimbo "ERA MENTIRA" bate no último quadro e o som some.
- **B4 (viva-voz)**: o fio único se abrindo em oito num movimento só, os 6 fones levantando em cascata; depois os três pensamentos em cortes de 5 s e o contador de apertos de mão subindo no ritmo.
- **X5 e X6 (a mentira)**: a etiqueta "PRETO" colada torta por cima do AMARELO, com a folha verdadeira sempre visível por baixo; alicate indo e voltando entre os dois fios enquanto os 4 carimbos caem.
- **X10 (salto de fé)**: tela vazia, só bomba e alicate; pensamento linha por linha; 1 s de quadro parado e silêncio total antes do clique. Nenhum meme ou selo cobre a tela até a luz apagar.
- **R1 a R3 (revelação)**: barras entrando do último ao primeiro com tambor; apertos de mão e facas **voando dos contadores** para as barras (o público reconhece o que guardou); a barra do Laranja parando colada na do Roxo.

## 5. O que evitar

Emoji; sussurro; lobby; meme repetido ou da lista proibida; qualquer soma de pontos antes de R1; balão encostando no destino antes da hora; mais de 2 cenas seguidas na mesma tela; fala do Verde fora dos trechos do storyboard; dar às profissões e aos eventos o crédito do @Pursuer_M4 (são acréscimo meu) ou tirar dele o resto (é tudo dele).
