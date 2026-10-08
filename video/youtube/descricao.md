# Pacote para o YouTube

## Opções de título

1. **Coloquei 4 IAs pra zerar o Mario. Só uma conseguiu (e ela trapaceou)**
2. Treinei 64 IAs para zerar as 32 fases do Mario
3. 4 cérebros, 1 Mario: qual IA zera o jogo?
4. Inteligência Artificial aprendendo a jogar MARIO (4 métodos diferentes)
5. Neuroevolução vs DQN vs Rainbow vs Planejador: quem zera o Mario?

> Sugestão: o título 1 casa com o gancho do vídeo. O vídeo mostra de fato o porquê da "trapaça": o planejador conhece a física do jogo.

## Descrição (copiar e colar)

```
Coloquei 4 tipos de inteligência artificial pra jogar um Mario que eu recriei do zero, num único arquivo HTML que roda no navegador: 32 fases (do 1-1 ao Bowser no 8-4), 64 agentes por geração e física a 60 Hz. Neuroevolução, Double DQN, Rainbow-IQN e uma IA adaptativa que planeja usando a física do jogo e ensina uma rede neural por imitação. Só uma zerou. E a vitória dela é... meio que trapaça.

Todos os números do vídeo vêm de treinos reais, com o mesmo orçamento de 1,2 milhão de passos de física para cada método:
• Neuroevolução: 402 gerações, 1ª bandeira na geração 70, travou no 1-3
• Double DQN: 528 gerações, só 10 bandeiras no total, chegou ao 1-2
• Rainbow-IQN: 283 gerações, 8.881 bandeiras, chegou a 70% do 1-3
• Adaptativa (planejar + imitar): zerou as 32 fases na 1ª tentativa (48 dos 64 Marios), em ~1 minuto de CPU

CAPÍTULOS
0:00 Abertura
0:52 O laboratório
1:50 O que é aprendizado por reforço
3:12 Os olhos da IA (44 e 400 sensores)
4:08 IA #1: Neuroevolução
6:15 IA #2: Double DQN
8:03 IA #3: Rainbow-IQN
10:22 IA #4: Adaptativa (planejar + imitar)
12:41 Placar final e lições
14:01 Encerramento

DETALHES TÉCNICOS
• Neuroevolução: rede 44→12→2, elite de 10%, 10% de novatos, mutação 0,18
• Double DQN: rede 44→32→6, replay de 10.000 experiências, ε-greedy, Huber + Adam
• Rainbow-IQN: Double Q + dueling + replay priorizado + retorno de 5 passos + NoisyNets + IQN; 400 sensores (112 locais + grade 12×6×4 sobre 1.250×480 px)
• Adaptativa: busca em feixe (6 ações × blocos de 6 quadros, 48 futuros, ~2 s à frente) + rede 44→32→6 treinada por imitação (inspirada no DAgger)
• Recompensas: +1 pouso novo, +2 plataforma/buraco superado, +100 fase, +10 Bowser, −1 morte, −0,05/s parado, +0,2 por bloco de avanço seguro

Referências: Double DQN (van Hasselt et al., 2015) · Rainbow (Hessel et al., 2017) · IQN (Dabney et al., 2018) · DAgger (Ross, Gordon & Bagnell, 2011)
Inspirações: SethBling (MarI/O), Code Bullet, AI Warehouse, b2studios

Jogo de plataforma estilo Mario recriado do zero: não usa ROM, código nem arte oficial da Nintendo. Mario é marca da Nintendo; este é um projeto de fã, sem fins comerciais.

Narração gerada por IA (voz neural gratuita do Microsoft Edge, pt-BR-AntonioNeural).
Editado com Remotion e FFmpeg.

MÚSICAS (Kevin MacLeod, incompetech.com, licença CC BY 4.0: http://creativecommons.org/licenses/by/4.0/)
"Monkeys Spinning Monkeys" Kevin MacLeod (incompetech.com)
"Pixel Peeker Polka - faster" Kevin MacLeod (incompetech.com)
"Chipper Doodle v2" Kevin MacLeod (incompetech.com)
"Itty Bitty 8 Bit" Kevin MacLeod (incompetech.com)
"Sneaky Snitch" Kevin MacLeod (incompetech.com)
"Fluffing a Duck" Kevin MacLeod (incompetech.com)
"8bit Dungeon Boss" Kevin MacLeod (incompetech.com)
"Heroic Age" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License

Memes/GIFs de reação usados em contexto de comentário e paródia (fontes: Tenor/Giphy).

#inteligenciaartificial #machinelearning #mario #aprendizadoporreforco #ia
```

## Sobre direitos autorais (leia antes de publicar)

- **Músicas:** CC BY 4.0. Basta manter a atribuição acima na descrição.
- **Voz:** o edge-tts usa o serviço de leitura em voz alta do Microsoft Edge. É gratuito e muito usado por criadores, mas não tem uma licença comercial explícita. Se o canal for monetizado e você quiser zero risco, troque por **Kokoro** (licença Apache 2.0, roda offline e tem vozes pt-BR). O `tts.py` é o único ponto a trocar.
- **GIFs/memes:** são trechos de filmes, séries e programas. Em vídeos de comentário costumam ser tolerados, mas podem gerar reivindicação de Content ID, principalmente os de filmes da Marvel (Avengers e Thanos). Se der problema, o roteiro troca qualquer meme mudando uma linha.
- **Mario:** o jogo é uma recriação independente, mas personagens e nome são marcas da Nintendo. Evite arte oficial na thumbnail; use os sprites do próprio projeto. A pesquisa em `video/pesquisa/youtubers_rl.md` comenta isso.

## Ideias de thumbnail (da pesquisa)

- "GERAÇÃO 1 vs ZEROU": à esquerda, o enxame de Marios morrendo; à direita, a tela "CAMPANHA COMPLETA!".
- "4 CÉREBROS": quatro cérebros nas cores dos métodos, com o texto "QUAL ZERA?".

## Short: "Só uma IA zerou o Mario... e trapaceou"

Arquivo: `remotion/out/short_mario.mp4` (1080×1920, 59 s, composição `ShortMario`; narração do Gabriel em `scripts/short_mario.py`).

Título: **Só UMA IA zerou o Mario... e ela TRAPACEOU 🤡 #shorts**

Descrição:
```
Coloquei 4 IAs pra zerar o Mario. Neuroevolução travou no 1-3, o Double DQN parou no 1-2, o Rainbow chegou a 70% do 1-3... e a quarta zerou as 32 fases na primeira tentativa. Só que ela simula a física do jogo antes de cada pulo 👀

Vídeo completo no canal: "Coloquei 4 IAs pra zerar o Mario"

Jogo recriado do zero (não usa arte nem sons originais). Mario é marca da Nintendo.
Música: "Sneaky Snitch" Kevin MacLeod (incompetech.com), CC BY 4.0 (creativecommons.org/licenses/by/4.0)
#shorts #Mario #IA #InteligenciaArtificial #MachineLearning
```
