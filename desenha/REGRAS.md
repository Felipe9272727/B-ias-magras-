# Desenha e Adivinha (ideia do Felipe: "Coloquei 4 IAs diferentes pra jogar Gartic")

Versão própria do canal (visual e regras nossas), no estilo dos jogos de desenhar e adivinhar.

- **Elenco (barato, todas enxergam imagem):** Rabisco (vermelho) = Claude Haiku (assinatura, via ponte), Borrão (amarelo) = GPT-6 Luna,
  Giz (rosa) = MiMo V2.6 Flash, Pincel (roxo) = DeepSeek V4.1 Flash (pelo OpenRouter, porque a API oficial não recebe imagem).
- **Desenho:** a IA manda traços em JSON (linha, círculo, retângulo, polígono; 13 cores) numa tela 800x600; `raster.py`
  transforma em PNG e é essa imagem que as outras veem. Proibido escrever letras ou números no desenho.
- **4 tiques por desenho:** no 1 o desenhista desenha; do 2 ao 4 ele vê os chutes e pode completar. Dica: tracinhos
  com o tamanho da palavra, 1 letra no tique 3 e 2 letras no tique 4. O desenhista não escreve no chat, só manda uma
  reação da lista ("quase!", "tá frio"...).
- **Pontos:** o primeiro a acertar leva 10, o segundo 8 e o terceiro 6 (dentro do mesmo tique, vale quem respondeu antes).
  O desenhista leva 3 por acerto. Escrever a palavra no chat depois de já ter acertado custa 2 pontos.
- **Rodadas:** 1 normal (palavras fáceis), 2 SÓ CANETA PRETA (médias), 3 NO MÁXIMO 8 TRAÇOS (difíceis:
  saudade, engarrafamento, preguiça, eclipse).
- **Rodar:** `IA_DIRETO=1 PONTE_ASSINATURA=1 ORCAMENTO_USD=1 node jogo.mjs --saida logs/partidaN.json --semente N`
  com `node ../confianca/ponte_assinatura.mjs &` no ar. Teste sem gastar: `--mock`. Só os N primeiros desenhos: `--so N`.
- Emoji do chat das IAs é tirado antes de gravar (nada de emoji no vídeo).
