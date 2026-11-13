# Nota do visual — "Jogo de Confiança" (Remotion)

Arquivos: `video/remotion/src/confianca/ConfiancaVideo.tsx` (reescrito) e `src/confianca/desenhos.tsx` (novo: telefone-personagem,
ícones SVG, feltro, alicate). Interface igual: `ConfiancaVideo` + `calcConfianca`, mesma timeline, mesmo `partida.json`.
Montador e formato da timeline não foram tocados. `tsc` limpo. Conferi 15 quadros (grades em `out/cf_fable/g1.jpg`, `g2.jpg`
e `out/cf_fable2/g.jpg`); **não vi nada em movimento** e não renderizei o vídeo.

## O que vale para todas as cenas
- **Câmera**: deriva lenta sempre (seno em x/y + zoom crescente) e soco de zoom no selo/meme. Feltro com trama e luz que anda.
- **Telefone-personagem**: disco que gira, olhos que piscam e olham para quem ele ligou, boca no miolo do disco quando fala,
  fone fora do gancho, humores (feliz, bravo, triste, medo, "morto" com X), fantasia de palhaço e de ninja, versão cinza (linha cortada).
- **Citação**: avatar grande de quem fala + balão com texto de 39 a 58 px que entra palavra por palavra (a palavra atual marcada).
  Pensamento = nuvem com eco e "SÓ VOCÊ VÊ"; ligação = balão na cor de quem fala, com "LIGOU PARA O X" tirado do log
  (pelo `mt` da citação); caiu = borda cinza tracejada; poder = crachá amarelo (Ciano: "GUICHÊ DO APRESENTADOR").
- **Selo**: carimbo torto próprio (creme com tinta vermelha; o do crédito do Pursuer é vermelho cheio), ângulo de -6 a +6,
  bate e sai dentro da própria duração. Aceita risco: `~~AMADELO~~ AMARELO` desenha o traço.
- **HUD**: aba do capítulo no canto esquerdo com **"IDEIA DE @Pursuer_M4" o capítulo inteiro**, relógio "TIQUE n DE N" na mesa,
  cadeado "PLACAR SECRETO · FALTAM N" à direita e os dois contadores sem valor (aperto de mão e faca). A1 e Z não têm HUD.
- **Cartão de capítulo (troca de pino)**: painel com 5 tomadas, a mão leva o pino até a do minijogo, o fio vira a linha de base,
  o título é escrito nela; carimbo grande "IDEIA DE @Pursuer_M4". Na revelação os pinos caem e o cadeado abre.

## Por tipo de cena
- **mesa** (A3, A4, D1–D5, B4, V1–V3, F3, X2, X3, X9): telefones maiores em roda sobre o painel de madeira; fio na cor de quem liga,
  balão que para no meio do fio; quando há citação a câmera viaja até quem fala e o destino, e aparece
  "CHEGA NO PRÓXIMO TIQUE" / "A LIGAÇÃO CAIU" / "VIVA-VOZ: TODOS OUVEM" (megafone e fio abrindo para todos). Poder do tique:
  ícone no alvo (tesoura, escuta, lupa, máscara, envelope) e crachá aceso. Apagão (M4, tique 4): escurece e só os discos brilham.
  Etiquetas: nomes, fantasias e estado da bomba **até aquele tique** (do log, sem spoiler).
- **telao** (B1–B3, B5, B6): 4 duplas, botão sob tampa de vidro que abre, aperto de mão ou faca no botão, +moedas, cara de cada um.
- **moedas / vencedor** (B7, D6): barras com o telefone na ponta e número gigante.
- **urna** (V4, V5): uma coluna por IA, cédula com a cor e o nome de quem votou (voto do Juiz conta 2), +3 / -3 carimbados.
- **vestiario** (F1, F2, F4, F5): 8 cortinas abrindo, fantasia desenhada, barbante colorido das apostas com contagem, holofote no ninja.
- **bomba** (A1, X1, X4–X8, X10): painel com TNT, visor, 4 fios com nome, alicate que passeia; folha do manual (a verdade) presa
  no telefone de quem guarda; dono da bomba com medo. Explosão: clarão, estrela em 4 camadas, "BUM!", estilhaços, tremor, fumaça,
  telefone com X nos olhos e fone caindo. Acerto: fio solta faísca, visor "DESARMADA", a luz apaga.
  Em X5, X6, X7 e A1 entra a etiqueta "O QUE O LARANJA DISSE: PRETO" torta sobre o AMARELO e o alicate vai e volta entre os dois.
- **bombas** (X11): 8 cartões, "7/8" gigante e o cadeado tremendo.
- **placar** (R1–R4): barras do último ao primeiro; em R2/R3 os apertos de mão e as facas voam do contador do HUD para a barra
  (um por ponto de bônus), a barra cresce listrada e as linhas trocam de lugar; R4 tem o vencedor grande, coroa, raios e confete.
- **trofeus / cartao** (Z1–Z3, A2): cartões de papel com troféu; comentário do Pursuer com marca-texto e telefones em volta.

## O que você ainda deve conferir
1. **Movimento**: só vi quadros parados. Ver em vídeo: explosão (A1, X7), corte de X10, troca de pino, bônus voando em R2/R3.
2. **Momentos sem marca na timeline** (mantive o critério do rascunho): tampa do telão abre em 55% da cena; corte da bomba é
   10 quadros antes do 1º selo; bônus do placar cai em 40% da cena; +3/-3 da urna em 30%. Conferir contra a narração quando
   as vozes estiverem prontas.
3. **Tique da mesa muda com a citação**: quando a citação tem `mt` do mesmo minijogo, a mesa mostra os fios daquele tique
   (e o relógio muda). Se preferir a mesa presa no `tique` da cena, é uma linha (`tN` em `Mesa` e `tique` em `CenaView`).
4. **Etiqueta da mentira** aparece em X5/X6 por ID de cena (fixo no código) e em toda cena de bomba com `fio` errado. Em X4 não.
   O texto vem do log (`seguiuInstrucaoDe` e `fio`).
5. **Contadores do HUD não têm número** de propósito: no log as facas do Laranja dão 3 (tiques 2, 4, 7), mas o selo de B3
   diz "2" já na rodada 2 e o de B6 "FACA Nº 3" na rodada 6 (que no log é vermelho x vermelho). Vale revisar esses selos.
6. **X10**: a direção pede tela limpa; o selo e o meme entram 10 quadros depois do corte e cobrem o painel. A folha do manual
   continua visível (mostra AZUL).
7. **A1**: virou a cena de bomba normal com a explosão forte, não os "três planos" da direção (a timeline tem um visual só).
8. Selo longo junto com meme fica com letra de 62 px; título "7 PALHAÇOS · 1 NINJA" faz o plural só com "S".
9. Pasta `out/cf_fable*` é só conferência, pode apagar.
