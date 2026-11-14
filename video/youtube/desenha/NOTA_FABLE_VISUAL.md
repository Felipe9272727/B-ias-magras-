# Nota do Fable — visual do "Desenha e Adivinha" no Remotion

Sem render, sem voz, sem commit. Tipos limpos (`npx tsc --noEmit -p . | grep desenha` não devolve nada).
Conferi 12 quadros (`out/ds_fable/grade1.png` e `grade2.png`): A1+8, A2+9, A3+10, B3+4, D1+17, D4+31, D5+15, E2+23, H1+9, J6+19, K2+16, L2+21.
Depois deles fiz 5 ajustes que **não foram re-renderizados** (lista no fim).

## Arquivos
- `video/remotion/src/desenha/base.tsx`: cores, mesa kraft, os 10 personagens (`Boneco`), folha com fita, traços animados (`Traco`, `Desenho`), dica em casas, ícones.
- `video/remotion/src/desenha/telas.tsx`: placar em barras, galeria, mosaico, elenco, cartão RODADA 2, corrida, relógios, prêmios, pergunta.
- `video/remotion/src/desenha/DesenhaVideo.tsx`: tela do jogo, citações, capítulo, selo e a tabela `SPEC` (o que entra em cada cena e em que quadro). Exporta `DesenhaVideo` e `calcDesenha`.
- `video/remotion/src/Root.tsx`: composição `DesenhaVideo` registrada igual à do Confiança.

## Como funciona
- Cada cena lê `SPEC[id]`: uma lista de fases (`jogo`, `placar`, `galeria`, `mosaico`, `elenco`, `rodada2`, `corrida`, `relogio`, `erros`, `premios`, `pergunta`). Os quadros são relativos ao começo da cena. Para ressincronizar depois da voz, basta mexer nos números do `SPEC`.
- **Tela do jogo**: folha à esquerda com os traços reais entrando um a um (contorno e depois preenchimento, com a ponta do lápis na cor de quem desenha), chip "DESENHO N DE 20 · nome", barra de tiques, dica em casas (a letra nova cai e pisca), cartão da palavra em post-it "SÓ VOCÊ VÊ", contador de traços da rodada 2 com cadeado, desenhista no canto da folha.
- **Chat**: as fichas caem na ordem real dos `ms` (tempo escrito em cada uma; acima de 1 min fica em destaque). Acerto mostra `*****` com a palavra em etiqueta amarela e "+pontos". Erro acinzenta com um X. Palpite vazio vira "PALPITE: | VAZIO" (gag do Lápis). Quem já acertou e só conversa aparece como "JÁ ACERTOU · SÓ CONVERSA". A ficha de quem tem citação de chute cai no quadro da citação e pulsa enquanto ela dura. Coroa no líder e lanterna no último saem do `placarDepois` do desenho anterior.
- **Citações**: pensamento = nuvem em post-it com ondas de eco; chute = balão com a ficha do palpite; chat = balão (se a fala contém a palavra do desenho, ela acende e é coberta por `*****`: é o vazamento do Rabisco em B2); reação = plaquinha de madeira. Carimbo "JÁ ACERTOU NO TIQUE N" sai sozinho quando quem fala já tinha acertado (I4, B2).
- **Selo**: `Selo` do `au7/Hud7` com saída própria dentro da duração. **Meme**: `MemeCard`. **Capítulo**: folha nova com título escrito e sublinhado a lápis.

## Por cena
- **A1**: desenho 12 pronto, 7 fichas NATUREZA com contador "NATUREZA ×7", ficha JABUTI com contorno pontilhado, cartão virando PESADELO no quadro 700.
- **A2**: título, estojo, os dez pulando para a grade com nome e modelo; destaque em Pincel, Aquarela, Borrão, Carvão; post-it PESADELO / CASCAVEL.
- **A3**: farol traço a traço, nove fichas com 10..2, "+18", etiquetas "1 LETRA" e "2 LETRAS" nos tiques 3 e 4.
- **B1**: mosaico dos 10 desenhos com carimbo, número gigante (calculado: acertos de primeira), depois banana, dinossauro e foguete com o campo vazio.
- **B2**: fichas do tique 1 já no chat, vazamento coberto, "-2".
- **B3**: placar do desenho 10 com marcas no Lápis e no Tinta; cartão RODADA 2 com os 8 riscos e as 10 palavras.
- **C1 a C3**: saudade ao vivo; zoom no traço azul com "SÓ ELE VIU"; "lagrima" grifada nas fichas; painel do chat do Tinta rolando com a contagem de palavras.
- **D1, J1**: plano em post-it pontilhado (cama, máscara) ao lado do quadro real.
- **D2 a D7**: contadores de fichas iguais, contornos (caminhão, jabuti), conferência letra a letra (NATUREZA, BICICLETA, VERANEIO), parede de palavras da Aquarela, fio da plaquinha até o sol, D7 só com o quadro e zoom nos X, contadores CONTA DO GIZ e LÁPIS +2.
- **E1, E2**: contornos amendoim, Pai Natal, cogumelo; campo vazio do Lápis nos tiques 2 e 3.
- **F1, F2**: "RAIVA ×9"; garrafa entrando com o antes a 40%; "GARRAFA ×2".
- **G1**: ENGARRAFAMENTO sobre ESTACIONAMENTO, letra sobre letra. **G2**: barras deslizando do desenho 10 ao 15 e quatro "+2".
- **H1**: corrida pela mediana real, relógios do Giz e do Tinta (desenho 12, tique 2), barras de chutes errados. **H2**: galeria (sereia e pesadelo), eclipse e aniversário ao vivo, galeria final.
- **I1 a I4**: fofoca; painel "imagina o que está escondido" (PENSAR, DEBATE) com FOFOCA no post-it; FUZIL e FÔNICA conferidos na dica.
- **J2 a J6**: contornos dos bichos, "PALAVRAS DIFERENTES: N", MARCIANO conferido (o O bate no L), palavras inventadas riscadas até CARNAVAL, confete e máscara pontilhada, cobra com setas, post-it de A2 riscando CASCAVEL.
- **K1 a K3**: placar com colchetes (diferença calculada), churrasco ao vivo, duelo de barras 155 × 155 e Tinta × Grafite com a lanterna trocando.
- **L1 a L3**: placar final do último ao primeiro com modelos, marca "RODADA 1" e "1º LUGAR DO DESENHO N AO 20" (calculado); quatro medalhas; os dois desenhos com a dica final; folha em branco com a pergunta.

## O que conferir
1. **Sincronia**: os quadros do `SPEC` foram estimados pelos `at` das citações e pela posição das frases na narração. Onde não há citação por perto pode estar adiantado ou atrasado: A2 (destaques em 150, 215, 280, 335), B3 (troca em 330), H1 (400 e 545), H2 (290, 490, 690), L1 (entrada das barras), L2 (medalhas em 0%, 42%, 62% e 83% da cena).
2. **Telas que não vi em quadro** (limite de 12): cartão de capítulo, selo com meme, mosaico de B1, galeria (H2, L3), relógios e erros de H1, painel "imagina" de I2, duelo com lanterna de K3, placar final de L1, pergunta de L3, plaquinha de reação, contadores de gag, "+pontos" voando, confete.
3. **Ordem de H2**: pus o eclipse (18) antes do aniversário (19), cada um com ~6,5 s, e a galeria final durante o pensamento do Borrão. A plaquinha mostra "N de 9 de primeira · N de 9 no fim", não a "nota do desenhista".
4. **Música**: o campo `musica` das cenas não é tocado pela composição (igual ao Confiança, que só toca `audio`). Se a trilha não entra na mixagem depois, precisa ser incluída em `audio`.
5. **Dados que vêm do texto do storyboard, não do json**: as palavras da parede (TELEFONE, GELADEIRA, SEGREDOS, SERPENTE, DESPERTAR; PALHAÇAL, PARAQUEDAL, CABELINHAL), "PENSAR" e "DEBATE" em I2, o "-2" de B2 e os nomes dos prêmios. O `partida.json` não tem pensamento nem penalidade.
6. **Contornos pontilhados e planos** são desenho nosso e levam etiqueta "(desenho nosso)" / "(ilustração nossa do plano escrito)". A cama de D1 ficou simples; vale olhar se lê como cama.
7. **"Erros" em H1**: contei palpite errado e não vazio no jogo inteiro (Grafite 18, Giz 15, Carvão 14, bate com o storyboard).
8. **Não fiz**: antes e depois lado a lado em D3 (uso o antes a 40%), a folha arrancada indo para a parede entre desenhos (a troca é a folha entrando de lado), o quadro parado de 1 s em D7, a lanterna trocando de cabeça com balão em K3 (ela troca no duelo de barras), o jeito próprio de cada personagem (pó do Giz, gota da Aquarela).
9. Rodar os Haikus a cada ~30 s depois da montagem.

## Ajustes feitos depois dos 12 quadros (sem novo quadro)
- Posição no placar em Poppins (em Bangers o "º" saía como zero: "10", "20").
- Linha de chegada da corrida mais à esquerda (o tempo encostava na borda).
- Rótulo "MARCAS DO CORPO" da cobra em J6 reposicionado (estava cortado pela folha).
- Etiqueta "ACABARAM OS TRAÇOS" some enquanto há contorno "O QUE ELE VIU" (as duas se sobrepunham).
- A ficha de quem está sendo citado sobe no chat para não ficar atrás do balão (acontecia em E2 e J6).
