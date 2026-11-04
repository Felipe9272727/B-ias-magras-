# Regras do canal (Felipex007) — valem para todos os vídeos

- **Pensamento das personagens: NUNCA usar sussurro** (nada de `[whispers]` no ElevenLabs nem voz sussurrada). Para mostrar que é
  pensamento, usar **ECO** na voz (ex.: ffmpeg `aecho`) mantendo a voz normal. Regra de ouro do Felipe.
- **NUNCA usar emoji dentro dos vídeos** (principalmente nos Shorts): selos, balões, placas, ícones e efeitos são desenhados
  em SVG (ícone próprio, inline). Regra de ouro do Felipe (crítica do público). Emoji só pode aparecer em texto de título/descrição.
- O narrador nunca diz nem sugere que é o Claude ou uma IA da Anthropic.
- Vídeos longos: no máximo ~35 min. A melhor partida/parte vai por último.
- **Sem transição de lobby** entre partidas (o Felipe não quer mais). Usar transições próprias de cada vídeo.
- Jogo baseado em jogo real (ex.: Wolvesville): visual parecido com o original e as funções reais do jogo.
- Render: Remotion em 540p (`ESCALA=0.5`) e upscale para 1080p com Lanczos no ffmpeg.
- Tudo o que aparece como fato das partidas vem dos logs; falas e pensamentos das IAs são copiados, nunca inventados.

## Lições (o 60 Segundos ficou mediano)
- Efeito visual o tempo todo, no padrão do Among Us: meme, selo, pop-up, zoom, animação. Nenhum trecho longo de tela parada.
- A parte principal do vídeo recebe o tempo; partes extras (ex.: a 3D do 60 Segundos) ficam curtas.
- Antes de entregar qualquer vídeo: Haikus avaliam cada ~30 s (prende a atenção? é divertido? tela parada?) a partir de
  quadros do vídeo + fala do trecho; consertar os trechos com nota baixa antes de mandar.

- Antes de começar qualquer coisa, ler `video/MEMORIA_TECNICA.md` (lições técnicas de render, áudio, Shorts e entrega).

## Lições de retenção (o BOMBANANA teve retenção baixa) — valem para TODOS os vídeos, de qualquer jogo
- **Abrir com o clímax** (a melhor falha, morte, explosão ou virada) nos primeiros ~10 s; só depois as regras.
  Agradecer quem pediu o vídeo cabe em ~5 s, nunca uma abertura inteira.
- **Regras em no máximo ~20 s**, mostrando um exemplo na tela em vez de várias cenas explicando.
- **Nada de jargão lido em voz alta**: números, coordenadas, cores, posições, recursos, nomes de unidades em lista.
  O narrador resume ("ele mandou o cabo errado", "atacou com 3 arqueiros contra 20 cavaleiros") e a tela mostra o dado.
- **O espectador sempre tem que entender o erro**: mostrar na tela a regra certa, o mapa ou o que a IA devia ter feito.
- **Cortar repetição sem dó**: cada cena de fala de IA com no máximo ~15 s; se duas rodadas dizem a mesma coisa, sai uma.
  Partes fáceis ou sem conflito viram resumo de ~20 s.
- **O narrador interpreta** (aponta a besteira, a intenção, a rivalidade); não repete o que a tela já mostra.
- **Aposta sempre visível**: placar, tempo restante, quem está ganhando; o narrador promete o que vem ("a próxima é pior").
- **Personagens fixos**: 2 ou 3 IAs com papel claro (herói, vilão, azarado) e um arco do começo ao fim, para o público torcer.
- **Variar os finais** de cada parte (não repetir a mesma estrutura em sequência) e guardar o melhor momento para o último quarto.
- **Fechar com uma pergunta** para o público comentar.
- Na revisão dos Haikus a cada ~30 s, avaliar também repetição, jargão e se dá para entender o que está acontecendo.

## O que os vídeos que mais prendem fazem (Among Us 4: 12 min de média; 60 Segundos: 10:57; Among Us 5: 10:49) — vale para TODOS os vídeos
- **O espectador sabe o segredo antes das IAs** (papéis, manual, plano, pensamento secreto): todo erro ou mentira tem
  que ser conferível na tela. É isso que transforma a fala da IA em piada.
- **Cada cena = 1 evento + 1 virada**, fechada com meme, selo ou frase de efeito ("...sem testemunhas. Só que o Roxo tava ali.").
- **Contraste fala x realidade**: quando a IA diz uma coisa e a tela mostra outra, pôr selo ("4 MATEI · 0 MORTES").
  Partida monótona vira a própria piada ("a partida mais lenta").
- **Só os eventos grandes** (morte, traição, erro enorme, batalha); o resto pula com marcador de tempo na tela ("Dia 14", "Ano 30").
- **Moldura do narrador**: antes da fala diz quem fala e por quê; cita só 1-2 frases (as melhores); depois reage. Nunca a rodada inteira.
- **Nunca mais de 2 cenas seguidas com a mesma tela**: trocar câmera, foco ou componente a cada cena.
- **Função/unidade/mecânica nova explicada em 1 frase na primeira vez que age** (nunca em lista no começo);
  cada parte abre com um cartão do que estreia nela.
- **Número-chave em texto grande na tela** (tempo, dias, baixas, placar), pelo menos um por parte.
- **Ritmo de efeitos**: pelo menos 1 efeito (meme, selo, texto, zoom, som) a cada ~15-20 s; referência dos sucessos ~2 memes/min.
- **Cada parte tem título-história** (pela virada, não "Fase 3"), um protagonista e termina com número na tela + gancho
  para a próxima ("E o próximo... deixou a filha pra trás no primeiro minuto").
- **Plantar e colher**: citar cedo algo que só paga depois ("guarda esse nome"); cena misteriosa da abertura é explicada no fim.
- **Público dentro do vídeo**: pedidos de comentário viram elemento do jogo com selo "ideia de @fulano"; fãs recorrentes viram gag.
- **Fechamento em 3 passos**: placar/prêmios com nome e número ("ASSASSINO DA TEMPORADA"), uma lição de uma frase, pergunta ao público.
- Ao escolher as IAs de um vídeo, seguir `video/IAS_FAVORITAS.md` (favoritas, moderadas, evitar e preferência por modelos novos e pequenos).
