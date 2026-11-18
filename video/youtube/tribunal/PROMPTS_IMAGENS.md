# Tribunal das IAs — prompts das imagens (para gerar no ChatGPT)

Como usar: abra UMA conversa nova no ChatGPT só para este projeto e cole primeiro o **BLOCO 0 (estilo)**. Depois peça as
imagens na ordem deste arquivo, uma por mensagem, sempre dizendo "mesmo estilo do bloco 0". Para os personagens, gere
primeiro a **ficha** (pose normal) e depois as expressões **na mesma conversa**, dizendo "mesmo personagem da imagem
anterior, só muda a expressão/pose". Baixe cada imagem com o nome indicado (ex.: `rubi_normal.png`) e me mande.

---

## BLOCO 0 — estilo (colar no começo da conversa)

```
Vou te pedir uma série de imagens para um vídeo do YouTube em formato de jogo de tribunal (visual novel de tribunal),
com personagens e cenários 100% originais. Todas as imagens precisam ter EXATAMENTE o mesmo estilo:

ESTILO
- Ilustração 2D estilo anime de visual novel, cel-shading com 2 a 3 tons de sombra, contorno preto/marrom-escuro
  limpo e de espessura constante, cores chapadas e saturadas, sem textura de pintura a óleo e sem brilho de plástico.
- Proporções de anime adulto (cabeça ~1/7 da altura), rostos expressivos e exagerados nas emoções (estilo comédia
  dramática de tribunal), olhos grandes mas não infantis.
- Iluminação simples e coerente: luz principal vindo de cima à esquerda, uma luz de recorte suave do lado direito.

O QUE EVITAR (muito importante, nada de cara de "imagem de IA"):
- Nada de texto, letras, números, assinaturas, marcas d'água ou logotipos escritos em lugar nenhum.
- Mãos: no máximo uma mão visível e simples por personagem, 5 dedos, sem objetos fundidos na mão.
- Nada de excesso de detalhes, brilhos, partículas flutuando, bokeh, "glow" mágico, fumaça decorativa ou HDR.
- Nada de rosto genérico de banco de imagem; cada personagem tem um rosto próprio e marcante.
- Nada de simetria perfeita artificial, nada de olhos diferentes entre si, nada de joias derretidas ou costuras sem sentido.
- Fundo do cenário sem pessoas (os personagens entram separados).
- Não copiar personagens, cenários ou elementos de nenhum jogo, anime ou série existente.

PADRÕES TÉCNICOS
- Personagens: enquadramento da cintura para cima, levemente de 3/4, centralizados, FUNDO TRANSPARENTE (PNG).
  Mesmo tamanho e enquadramento em todas as expressões do mesmo personagem.
- Cenários: formato 16:9 horizontal, o mais largo/grande possível, sem personagens, com profundidade (2.5D: primeiro
  plano, plano médio e fundo bem separados por luz e cor).
```

---

## BLOCO 1 — personagens (ficha + expressões)

Cada personagem é uma IA, com o nome de uma pedra preciosa e a cor da pedra como cor principal. Cada um tem **um
detalhe discreto** que lembra a empresa/IA (não o logotipo, só uma referência sutil). Gere: a ficha (`_normal`) e as
expressões listadas. Fundo transparente em todas.

### 1. RUBI — o culpado (Claude Haiku, da Anthropic) — vermelho-rubi
```
Personagem: RUBI, homem de uns 45 anos, dono de um estaleiro numa vila de pescadores, elegante e frio. Terno escuro
cinza-chumbo bem cortado, camisa vinho, gravata vermelho-rubi. Cabelo grisalho penteado para trás, barba curta bem
aparada, olhar calmo e calculista, meio sorriso educado. Anel dourado com uma ÂNCORA na mão ESQUERDA (bem visível).
Mão direita com uma faixa/curativo branco (fica abaixada, discreta). Detalhe sutil: um alfinete de gravata cor de
terracota em forma de pequena estrela de raios finos (como um asterisco), e um pequeno lenço de bolso terracota.
Personalidade: educado, fala de barcos e do mar, nunca perde a calma.
```
Expressões: `rubi_normal` (meio sorriso calmo, mãos para trás) · `rubi_ajeita_anel` (girando o anel, olhar de canto,
confiante) · `rubi_suando` (ainda sorrindo, mas uma gota de suor e o olho tremendo) · `rubi_choque` (choque
exagerado de comédia, inclinado para trás, cabelo desarrumado) · `rubi_frio` (olhar sério e ameaçador, sem sorriso).

### 2. SAFIRA — advogada (Claude Sonnet, da Anthropic) — azul-safira
```
Personagem: SAFIRA, mulher de uns 30 anos, advogada de defesa metódica e brilhante, um pouco fria. Blazer azul-safira
estruturado, camisa branca, cabelo preto curto em corte chanel reto, óculos finos de aro prateado. Detalhe sutil: um
broche cor de terracota em forma de pequena estrela de raios finos na lapela (mesma família visual do alfinete do Rubi),
e uma caneta-tinteiro presa no bolso.
```
Expressões: `safira_normal` (braços cruzados, sobrancelha levantada) · `safira_objecao` (apontando o dedo para frente
com força, boca aberta gritando, cabelo jogado pelo movimento) · `safira_pensando` (mão no queixo, olhar para baixo) ·
`safira_abalada` (recuando, suor, olhos arregalados) · `safira_alivio` (sorriso cansado, olhos fechados).

### 3. JADE — advogada (Qwen 27B, da Alibaba) — verde-jade
```
Personagem: JADE, mulher de uns 27 anos, advogada de defesa impulsiva, falante e corajosa. Terno verde-jade com
gravata fina amarela, cabelo castanho comprido preso num rabo de cavalo alto com franja, sorriso confiante. Detalhe
sutil: um prendedor de cabelo geométrico em forma de hexágono lilás/roxo claro, e um pequeno broche laranja em forma de
sorriso (meia-lua).
```
Expressões: `jade_normal` (mão na cintura, sorriso) · `jade_objecao` (apontando, gritando, energia exagerada) ·
`jade_toma_essa` (batendo a mão na mesa, inclinada para frente) · `jade_derrota` (cabeça baixa, cabelo caindo no rosto,
uma lágrima, sombra no rosto) · `jade_confusa` (coçando a cabeça, gota de suor).

### 4. QUARTZO — a ré (MiMo, da Xiaomi) — rosa-quartzo
```
Personagem: QUARTZO PRADO, mulher de uns 25 anos, filha de um faroleiro, acusada injustamente. Casaco de lã rosa
desbotado (com pequenos cacos de vidro brilhando na barra), cabelo ruivo-claro ondulado e solto, sardas. Colar com um
PINGENTE DE ÂNCORA prateado (simples, sem círculo em volta). Detalhe sutil: uma presilha de cabelo laranja em forma de
quadrado de cantos bem arredondados.
```
Expressões: `quartzo_normal` (assustada, mãos juntas no peito) · `quartzo_chorando` (lágrimas, segurando o pingente) ·
`quartzo_ironica` (meio sorriso amargo, olhar de lado) · `quartzo_alivio` (chorando de alívio, sorriso).

### 5. AMETISTA — o juiz (DeepSeek) — roxo-ametista
```
Personagem: AMETISTA, juiz idoso de uns 70 anos, teatral e rigoroso. Toga roxo-ametista escura, gola branca, barba
branca longa e bem penteada, sobrancelhas grossas brancas, careca no topo. Martelo de madeira. Detalhe sutil: o cabo do
martelo esculpido em forma de pequena baleia azul.
```
Expressões: `ametista_normal` (sério, martelo na mão) · `ametista_martelo` (batendo o martelo, cara brava, linhas de
movimento) · `ametista_surpreso` (olhos arregalados, barba balançando) · `ametista_contraluz` (sério, rosto meio na
sombra, solene).

### 6. ÂMBAR — o promotor (GLM, da Zhipu/Z.ai) — laranja-âmbar
```
Personagem: ÂMBAR, homem de uns 35 anos, promotor vaidoso e teatral que nunca perdeu um caso. Terno laranja-âmbar
cintilante com lapelas largas, plastron/gravata de seda branca, cabelo loiro volumoso com topete, uma mecha caindo na
testa. Detalhe sutil: um alfinete de lapela em zigue-zague (forma de "Z" estilizado) dourado.
```
Expressões: `ambar_normal` (arrogante, mão no peito) · `ambar_objecao` (apontando com o dedo e jogando o cabelo) ·
`ambar_coracao_partido` (mão no peito, olhos fechados de dor exagerada, uma lágrima dramática) · `ambar_choque`
(cabelo despenteado, boca aberta).

### 7. TOPÁZIO — o vigia (GPT-6 Luna, da OpenAI) — amarelo-topázio
```
Personagem: TOPÁZIO, homem de uns 50 anos, vigia noturno do museu, torcedor fanático, bonachão. Uniforme de vigia
azul-marinho com quepe, cachecol de time listrado amarelo e preto, bigode grosso, barriga. Detalhe sutil: um bordado
no bolso com um nó entrelaçado de seis voltas (tipo roseta de corda) e um pequeno broche de lua crescente.
```
Expressões: `topazio_normal` (sorriso, polegar para cima) · `topazio_vergonha` (corado, tirando o quepe, suando) ·
`topazio_comemora` (braços para cima, comemorando gol, boca aberta).

### 8. PERIDOTO — o pescador (Mistral) — verde-oliva/lima
```
Personagem: PERIDOTO, pescador aposentado de uns 65 anos, contador de causos, carrega uma culpa antiga. Capa de chuva
amarelo-mostarda velha sobre suéter de lã verde-oliva, gorro de lã, barba grisalha desgrenhada pelo vento, rosto
queimado de sol, cachimbo apagado. Detalhe sutil: um remendo quadriculado em blocos laranja e amarelo (padrão de
quadradinhos, como pixels) no ombro da capa.
```
Expressões: `peridoto_causo` (gesticulando, contando história, olhar distante) · `peridoto_culpa` (cabeça baixa,
segurando o gorro, olhos marejados) · `peridoto_tempestade` (olhar assustado, como quem revive uma lembrança).

### 9. TURQUESA — delegado/assistente (MiniMax) — turquesa
```
Personagem: TURQUESA, mulher de uns 35 anos, atrapalhada, simpática e sempre com fome. Jaqueta de couro turquesa por
cima de colete de polícia, cabelo azul-esverdeado curto e bagunçado, segurando um sanduíche meio comido. Detalhe sutil:
brincos em forma de pequena onda sonora (ondinha).
```
Expressões: `turquesa_normal` (sorriso, sanduíche) · `turquesa_teoria` (dedo para cima, cara de "tive uma ideia"
absurda) · `turquesa_assustada` (sanduíche caindo).

### 10. LIA MORAES — a vítima (só em flashback/retrato)
```
Retrato emoldurado, estilo foto antiga pintada: LIA MORAES, restauradora de uns 40 anos, cabelo castanho preso num
coque com um lápis atravessado, avental de trabalho, luvas, sorriso gentil, segurando uma pequena lupa. Moldura de
madeira simples. Fundo neutro. (Sem violência, nada de corpo; ela só aparece neste retrato.)
```
Arquivo: `lia_retrato`.

### 11. ANSELMO PRADO — o faroleiro de 15 anos atrás (flashback)
```
Personagem: ANSELMO PRADO, faroleiro de uns 55 anos, capa de chuva escura encharcada, barba, lanterna na mão, olhar
desesperado. Fundo transparente.
```
Arquivo: `anselmo_flashback`.

---

## BLOCO 2 — cenários 2.5D (16:9, sem personagens)

Para dar profundidade (2.5D), quando indicado peça também a **camada da frente separada** com fundo transparente (por
exemplo a mureta do banco das testemunhas), para eu pôr o personagem entre o fundo e a frente.

```
1. tribunal_geral — Tribunal de uma vila de pescadores construído como o interior de um navio antigo: madeira escura de
   navio, detalhes de latão, lanternas de navio acesas, janela redonda grande ao fundo (como uma escotilha com vitral)
   mostrando um farol numa noite de chuva, tribuna alta do juiz ao centro no fundo, banco das testemunhas no meio, mesas
   da defesa (esquerda) e da acusação (direita). Vista geral de frente, câmera na altura dos olhos. Noite, chuva.
2. tribunal_banco — Close do banco das testemunhas (mureta de madeira com um timão de navio entalhado na frente),
   fundo da sala desfocado. Pedir também a camada da frente: só a mureta, fundo transparente (tribunal_banco_frente).
3. tribunal_defesa — Visão por trás da mesa da defesa, olhando para o outro lado da sala: mesa de madeira com papéis e
   uma pasta de provas. Camada da frente: só a mesa (tribunal_defesa_frente).
4. tribunal_promotor — Mesa da acusação, lado direito, mais luxuosa (latão polido, flor num vaso). Camada da frente:
   só a mesa (tribunal_promotor_frente).
5. tribunal_juiz — Tribuna alta do juiz vista de baixo para cima (contra-plongée), imponente, com a janela redonda e o
   farol atrás. Camada da frente: só o tampo da tribuna (tribunal_juiz_frente).
6. museu_salao_lente — Salão do Museu do Farol à noite: uma enorme lente antiga de farol (lente de Fresnel em anéis de
   vidro) estilhaçada no chão, cacos brilhando, a base de metal com um pequeno compartimento secreto aberto e vazio,
   fita de isolamento policial, um extintor amassado caído. Sem pessoas, sem corpo, sem sangue (no máximo uma marca de
   giz discreta no chão). Luz fria de lanterna.
7. museu_corredor — Corredor estreito do museu levando a um terraço, meia-luz, uma caixa de primeiros socorros
   vermelha aberta na parede, porta do terraço entreaberta com chuva lá fora.
8. museu_terraco — Terraço do museu à beira-mar à noite, chuva fina, placa de metal na parede (SEM texto legível,
   só um desenho de celular riscado), mar escuro e o farol ao longe.
9. sala_seguranca — Pequena sala de segurança com monitores apagados e uma TV antiga ligada mostrando um jogo de
   futebol (sem texto), cadeira giratória, xícara de café.
10. cais_noite — Pátio do cais atrás do museu à noite, um barco de madeira elegante atracado, cordas, postes de luz
    amarelada, reflexos na água.
11. farol_15_anos — Flashback: o farol numa noite de tempestade violenta, ondas enormes, a luz do farol APAGADA, a porta
    da torre trancada com um cadeado, um pequeno barco de pesca lutando contra as ondas ao longe. Estilo de gravura
    antiga em tons sépia e azul-acinzentado (diferente dos outros cenários, para marcar o passado).
12. festa_lareira — Salão de festa do museu: lareira de pedra acesa, mesas com taças, bandeirolas, sem pessoas.
13. arquivo_jornal — Sala de arquivo de jornal antiga: estantes com pastas, uma mesa com lupa e recortes de jornal
    amarelados (recortes sem texto legível).
14. laboratorio_pericia — Laboratório de perícia simples: bancada, microscópio, cacos de vidro em placas, tubos de
    ensaio, luz branca.
15. investigacao_mesa — Vista de cima de uma mesa de madeira com provas espalhadas: pasta de arquivo, fotos (sem rostos),
    lupa, mapa da vila, xícara de café. (Fundo para a tela de investigação/Registro.)
```

---

## Dicas para ficar sem cara de IA
- Se uma imagem vier com texto, letras tortas, dedos a mais ou objeto derretido, peça de novo: "refaça sem texto e com
  as mãos simples".
- Se o estilo começar a mudar no meio da conversa, cole o BLOCO 0 de novo.
- Prefira expressões BEM exageradas (é o que dá graça no jogo de tribunal), mas sem deformar o rosto.
- Me mande as imagens com os nomes de arquivo indicados; eu recorto, ajusto as cores e monto as camadas 2.5D no vídeo.
