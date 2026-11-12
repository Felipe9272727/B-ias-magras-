# Direção de edição — "3 IAs criaram as próprias IAs pra zerar Pokémon"

Complemento do `storyboard.md` (não o substitui). Aprovado pelo Felipe: o narrador diz "o Frederico" e a faixa "mais linhas, menos Pokémon" entra em F1.

## 1. Identidade visual

- **Ideia**: uma "bancada de laboratório de fita cassete". Fundo azul-noite `#12162B` com grade fina de pixels; tudo que é papel (diário, README, relatório) é creme `#F4EBD0`. O contraste papel x tela de jogo é o vídeo: **papel = o que a IA escreveu, tela = o que aconteceu**.
- **Cores fixas**: Claude laranja `#E8763A`; Gemini azul `#3D7BF2`; GPT verde `#19A974`. Vermelho `#E0262B` só para carimbo e erro; amarelo `#FFC83D` só para número-chave. A cor da IA pinta a borda da gameplay, a etiqueta de quem fala e o post-it dela.
- **Cartões**: cantos de 6 px, borda grossa de 4 px na cor da IA, sombra dura deslocada (sem desfoque), entrada com um quique curto. Selos são carimbos tortos (de -6 a +6 graus), com textura de tinta falhada. Post-its das promessas (T5) ficam enfileirados no rodapé e voltam idênticos na colheita.
- **Tipografia** (já em `public/fonts`): **Bangers** em selos e números gigantes; **Poppins 800** em títulos de cartão e **600** em legenda; **JetBrains Mono** em código, log e contadores.
- **Código legível e engraçado**: nunca o arquivo inteiro. No máximo **3 linhas** por vez, corpo de 44 px ou mais em 1080p, o resto do arquivo vira borrão rolando atrás. A linha da piada acende em marca-texto amarelo, com seta desenhada à mão e uma anotação de 2 ou 3 palavras ("ele sabia", "olha a multa"). O Gemini ganha os `====` dele como moldura pomposa; o do Claude é um bilhete curto; o do GPT, uma página com carimbo "AVISADO". Log inventado sempre em papel; log real sempre em terminal escuro.

## 2. Gameplay do GBA (240x160)

- **Escala inteira, sem suavizar** (vizinho mais próximo): x4 no Remotion a 540p vira x8 no 1080p. Nada de esticar para 16:9.
- **Moldura**: a tela do jogo dentro de um console desenhado em SVG, na cor da IA, ocupando cerca de 62% da largura à esquerda. A coluna da direita é o painel: relógio de jogo (0 a 48 h), placar "INSÍGNIAS 0", Pokédex e o contador da cena.
- **Zoom**: sempre com deriva lenta. Zoom de soco (até x1,6, 8 quadros) só no evento da cena: a caixa do inicial, a vida chegando a zero, o encosto na parede. Em trecho acelerado, mostrar "x60" ou "x600" no canto; a câmera segue o boneco, sem pular.
- **Tela dividida**: divisória diagonal de 8 graus com costura branca. Promessa (papel) à esquerda, realidade (jogo) à direita, sempre nessa ordem.
- **Contadores**: estilo odômetro mecânico, em JetBrains Mono, que sobe **ligado ao trajeto** (não é número animado solto). "A x 112.027" nasce pequeno no painel, cresce até cobrir meia tela e, a cada 10 mil, o botão A desenhado afunda e solta um estalo. Relógios: o do diário é um despertador de papel; o do jogo é digital. Quando os dois aparecem juntos, o de papel fica parado.
- **Tela parada** (parede, laboratório): cortar para o mapa de calor ou para o controle visto de cima a cada 8 s, no máximo.

## 3. Transição, música e ritmo

- **Transição própria**: o **"salvando o jogo"**. A tela é tomada por uma caixa de texto no estilo do jogo, desenhada por nós, com o título do capítulo sendo digitado e a setinha piscando; ao apertar A (som `mouse-click`), a caixa abre na cena seguinte. 1,2 s. Na partida do GPT, a transição **falha**: a caixa apaga no meio com `glitch` (é a queda da máquina). Entre cenas do mesmo capítulo: corte seco ou `whoosh` com empurrão lateral.
- **Música** (Kevin MacLeod, já em `public/music`; conferir `CREDITS.md`), com fade de 1 s entre capítulos e volume baixo sob citação:

| Capítulo | Clima | Trilha |
|---|---|---|
| Abertura | impacto, mistério curto | `hitman` |
| Treino 1 e 2 (planos, diário) | esperteza, golpe em andamento | `sneaky-snitch` |
| Treino 3 e 4 (relatórios) | relógio que não anda | `thinking-music` |
| Treino 5 (apostas) | programa de auditório | `scheming-weasel-faster` |
| Partida Gemini | bobo e repetitivo | `monkeys-spinning-monkeys` |
| Partida GPT, até P2e | 8 bits animado | `pixelland` |
| P2f a P2h (quedas) | tenso, sem graça de propósito | `investigations` |
| Partida Claude | caos crescente | `run-amok`, depois `comedic-juggernaut` em P3f |
| Fechamento | prêmios | `winner-winner` |

- **Silêncio é efeito**: cortar a música em `time=[]` (T3c), no apagar da barra (P2g) e 1 s antes do `sad-trombone` (P3h).
- **Ritmo**: plano novo a cada 3 a 5 s nas explicações; 1 a 2 s nas montagens (escada, desmaios), acelerando; 6 a 8 s de respiro só nos números gigantes. Selo e meme ficam o mesmo tempo (mínimo 2,5 s) e nunca são cortados pelo fim da cena.

## 4. As 5 cenas para caprichar

- **A1 (gancho)**: quadro 1, o papel em close, a linha da insígnia sendo digitada. Quadro 2, o carimbo "INVENTADO ANTES DE RODAR" bate e a tela treme. Quadro 3, a diagonal rasga o papel e revela a parede, com o odômetro já em alta. Quadro 4, congela no "Guarda essa parede" e o som some.
- **T3b/T3c (as 15 linhas e o `time=[]`)**: as linhas caem como peças de Tetris, cada uma mais cinza. A câmera desce a pilha em um movimento só e, no fim, empurra até os colchetes ocuparem a tela. Os colchetes abrem como tampa de caixa: dentro, nada, e 1 s de silêncio total. "POKÉMON: 0" entra por baixo.
- **P1e (A x 112.027)**: começa normal, com o jogo na moldura. A cada frase do narrador, o odômetro toma mais tela e o jogo encolhe, até sobrar só o botão A afundando. O post-it "lembra de cada parede" desce e gruda em cima do contador. Último quadro: Pokédex "0 · 0" piscando sozinha.
- **P2g (a barra apagada)**: as barras crescem em ordem, com som subindo de tom. A verde do GPT vai até 34 h com `heartbeat`; uma borracha desenhada apaga da direita para a esquerda e deixa farelo. Sobra o toquinho de 3 h 30 min. Dois segundos sem música antes da frase final.
- **P3f (23 desmaios)**: montagem em grade que vai enchendo, um quadradinho por desmaio, cada um com o boneco sumindo da grama. A carteira no centro perde moedas que caem para fora da tela. Os cortes aceleram de 1,5 s para 0,3 s. Freia de uma vez no mapa de calor, e o post-it laranja "sequência longa e exata" entra com o selo "ELE AVISOU".

## 5. O que evitar

- Emoji em qualquer tela; sussurro em qualquer voz; transição de lobby; meme repetido.
- Arquivo de código inteiro na tela, letra pequena ou mais de 3 linhas para ler.
- Gameplay borrada, esticada ou com filtro; mais de 20 s só de jogo; mais de 2 cenas seguidas com o mesmo enquadramento.
- Imagem de jogo para a tentativa perdida do GPT (as ~34 h são só barra e texto com "anotação, sem gravação").
- Coroa, medalha ou cor de destaque que favoreça uma IA fora do F2: os três têm o mesmo peso visual.
- Número falado que não esteja na tela, e número na tela diferente do storyboard (quedas: 6; Gemini: 35 h 53 min).
- Logo oficial de Pokémon ou música do jogo; a caixa de texto e o console são desenho nosso.
- Palavra "mentiu" em selo ou legenda sobre o Gemini.
