# Revisão de edição — Vídeo 3 "Jogos Vorazes das IAs" (render completo, pedaços p000–p008)

Legenda de gravidade: **BUG grave** (quebra a leitura ou a história), **BUG leve** (defeito visível que não quebra a cena), **MELHORIA** (sugestão de polimento).

Convenção: "pNNN @ mm:ss" = tempo dentro do pedaço; "global" = quadro global (N*3000 + t*24); cena = id em timeline3_completo.json. Tempos das folhas de contato podem variar cerca de ±0,5 s em relação aos quadros de tamanho cheio.

Status: a primeira rodada (p000 a p004) foi revisada e os pedaços foram apagados pelo coordenador para um novo render, que recomeçou às 20:20 do p000. As seções abaixo descrevem a rodada anterior. A seção "Verificação das correções" confere se os itens foram resolvidos no novo render. Pendentes: p000 a p008 do novo render (os de p005 a p008 ainda não foram revisados).

---

## p000 (quadros 0–2999, cenas a01 a r02)

### MELHORIA — Opus quase imóvel por cerca de 27 s
- Pedaço: p000 @ 01:12 a 01:39
- Global: 1728 a 2376 (aprox.)
- Cena: t05 (Opus com cartão de pensamento)
- Descrição: na folha de contato, Opus fica praticamente na mesma pose por quase meio minuto. O cartão PENSAMENTO SECRETO aparece e é digitado corretamente, mas o boneco só mexe o braço de forma sutil. Em tamanho cheio (p000 @ 01:27 e 01:30) a pose é a mesma.
- Sugestão: adicionar respiração/idle (balanço leve, piscada, giro lento de câmera) ou cortar a fala do pensamento para um plano mais curto.

### MELHORIA — Foto/meme de pessoa real na abertura (verificar direitos)
- Pedaço: p000 @ 00:36 em diante
- Global: 872 aprox.
- Cena: a06 (meme "sweating", pos right, at 92 quadros da cena)
- Descrição: o meme é um retrato de pessoa real aparecendo sobre o cenário enquanto a narração fala de "IAs morrendo de sede". Não é defeito técnico, mas vale checar licença/direito de uso de imagem. Os memes de p103, p104b, p106, p203, p225 e pl01 também usam imagens de pessoas reais.
- Sugestão: confirmar a fonte e a licença de cada meme com rosto humano, ou trocar por versões ilustradas quando houver dúvida.

### BUG leve — boneco cortado na borda direita
- Pedaço: p000 @ 02:00 (ponta do quadro)
- Global: 2880 aprox.
- Cena: r01 (Como funciona, IL3D com HUD)
- Descrição: um boneco laranja de frente aparece cortado pela borda direita do quadro, ocupando uma faixa grande e impedindo ver quem é. Não é grave, mas a câmera deveria enquadrar o personagem principal.
- Sugestão: ajustar o enquadramento da câmera nesse plano ou afastar o boneco da lente.

---

---

## p001 (quadros 3000–5999, cenas r02 final a p105)

### BUG leve — legendas de cena do mapa sobrepostas e coladas nas bordas (mapa "A ILHA: 10 REGIÕES")
- Pedaço: p001 @ 00:18 (fica visível de 00:09 a 00:24)
- Global: 3432 aprox.
- Cena: r03 (Manim, ILClipe)
- Descrição: o rótulo "um pouco d'água" encosta no contorno do círculo da caverna e o rótulo "Caverna" toca a borda do círculo, ficando apertado. Os outros 10 rótulos estão legíveis.
- Sugestão: afastar os rótulos "um pouco d'água" e "Caverna" do círculo (ou pôr um leader line curto) e deixar pelo menos 20 px de respiro.

### BUG leve — legenda cai em cima do mapa da arena
- Pedaço: p001 @ 00:30 a 00:36
- Global: 3720 a 3864 aprox.
- Cena: r04 (Manim, ILClipe; narração "mesmo distrito, os dois vencem")
- Descrição: a legenda "mesmo distrito, os dois vencem." fica sobre a base da ilha (em cima do círculo da Praia do Naufrágio e do contorno). Confirmado em tamanho cheio em p001 @ 00:32. O texto segue legível, mas a sobreposição é visível.
- Sugestão: subir o mapa da arena uns 80 a 100 px ou colocar a legenda numa faixa escura própria, mantendo a área segura abaixo do mapa.

### BUG leve — boneco de primeiro plano gigante, cortado, colado na câmera
- Pedaço: p001 @ 00:42 (também visível em 00:45)
- Global: 4008 aprox.
- Cena: r05 (IL3D, "Aliança vale. Mentir vale.")
- Descrição: a cabeça de um boneco (cabeça calva com faixa laranja, provavelmente Opus) aparece enorme no canto inferior direito, cortada, e outro boneco aparece cortado no canto inferior esquerdo. O boneco da cena com o rótulo "Sonnet" fica pequeno e no centro, o que cria uma disputa de foco.
- Sugestão: afastar a câmera ou tirar o boneco do primeiro plano; se for um plano de propósito, deixar só um personagem em destaque.

### MELHORIA — meme com pessoa real (verificar direitos)
- Pedaço: p001 @ 01:24 (Picard, "picard-facepalm") e p001 @ 01:58 (monkey-puppet-awkward)
- Global: 5044 aprox. e 5833 aprox.
- Cena: p103 e p104b
- Descrição: os memes de rosto humano seguem o mesmo ponto da seção de p000. Ver a nota da seção p000.
- Sugestão: mesma da seção p000.

### MELHORIA — pose que parece "flutuar" (verificar)
- Pedaço: p001 @ 02:03
- Global: 5952 aprox.
- Cena: p105 (início)
- Descrição: o boneco roxo à esquerda (Qwen) está com as pernas dobradas, como sentado no ar, sem apoio visível. A sombra fica sob os pés, então talvez seja só uma pose de agachamento, mas a silhueta dá impressão de flutuar. Na mesma tomada, o boneco azul de costas ocupa o centro da tela e fica cortado pela borda inferior.
- Sugestão: checar o contato do quadril com o chão nessa pose; se ficar estranho, usar uma pose de agachado mais baixa. Para o boneco de costas, trocar o enquadramento ou virar a câmera para mostrar o rosto de quem fala.

### Itens observados e considerados OK (p001)
- Título "O TESTE / PARTIDA 1" (00:48) entra limpo na transição de p101.
- Cartão PENSAMENTO SECRETO do DeepSeek 1 (01:48 a 01:57) está legível em tamanho cheio (p001 @ 01:54), com a fala quebrando bem entre linhas.
- Linha do tempo da arena (D1 a D10) com paraquedas em D2, regra da dupla em D3, maré em D4 e névoa em D6 bate com a narração.
- HUD "COMO SE MORRE" da r02 (00:00 a 00:06) anima as barras de forma coerente com a narração.
- Balões de fala das falas dos Qwen (01:00 a 01:45) estão presos às cabeças dos bonecos que falam.

---

## p002 (quadros 6000–8999, cenas p105 final a c01 início)

### BUG leve — etiqueta "DeepSeek 2" duplicada atrás do balão
- Pedaço: p002 @ 00:57 a 01:03 (balão "Qwen2, você já está morto de pé")
- Global: 7368 a 7512 aprox.
- Cena: p107
- Descrição: a etiqueta de fala "DeepSeek 2" do próprio balão fica por cima de uma segunda etiqueta "DeepSeek 2" do mundo 3D, que aparece meio escondida sob a borda do balão. Fica como texto duplicado e borrado. Confirmado em p002 @ 01:00 (tamanho cheio).
- Sugestão: esconder a etiqueta do mundo 3D enquanto o balão do mesmo personagem estiver na tela, ou remover o cabeçalho do balão.

### BUG leve — balão aponta para personagem quase fora do quadro
- Pedaço: p002 @ 01:24 a 01:33 (balão "Preciso de água. Vou me mover")
- Global: 8016 a 8232 aprox.
- Cena: p109 (balão do Qwen Max)
- Descrição: no quadro em tamanho cheio (p002 @ 01:27), o balão fica no alto à direita, mas quem fala está na borda direita, quase todo fora da tela (só cabeça e uma perna aparecem). O espectador não consegue associar a fala ao boneco.
- Sugestão: reenquadrar a câmera para mostrar o Qwen Max inteiro ao falar, ou puxar o balão para perto do personagem.

### BUG leve — quem fala está de costas para a câmera (cartão de pensamento)
- Pedaço: p002 @ 00:00 a 00:15 (cartão "DeepSeek 1 · Se o Qwen 27B-1 ficar vivo")
- Global: 6000 a 6360 aprox. (confirmado em p002 @ 00:06, global 6144)
- Cena: p105
- Descrição: o cartão é do DeepSeek 1, mas o boneco do primeiro plano que o pensa aparece de costas, com a mochila (quadrado marrom) virada para a câmera. O cartão e o boneco não se conectam visualmente. O mesmo problema aparece nos balões de p002 @ 01:27 (Qwen Max de costas com a mochila).
- Sugestão: girar o boneco para a câmera nos planos em que ele fala ou pensa, ou escolher o ângulo onde o rosto aparece.

### BUG leve — corpo do eliminado sai do quadro (Qwen 27B-2)
- Pedaço: p002 @ 01:54 a 01:58 (banner "ELIMINADO · Qwen 27B-2 · morreu de sede")
- Global: 8736 a 8832 aprox. (evento do JSON em 8754)
- Cena: p110
- Descrição: no momento da eliminação, a câmera está apontada para o chão e para o céu, e só aparecem os pés roxos na borda inferior. A morte fica pouco visível, só com o banner. O corpo de Qwen Max (p002 @ 01:33) aparece, mas o do Qwen 27B-2 não.
- Sugestão: reenquadrar a câmera para mostrar o corpo caído, ou mover a câmera para o personagem na hora do banner.

### MELHORIA — pose "sentada" no ar (Qwen 27B-1 antes da morte)
- Pedaço: p002 @ 00:00 a 00:15 (e continua em p001 @ 02:03)
- Global: 6000 a 6360 aprox.
- Cena: p105
- Descrição: o boneco roxo à esquerda fica sentado com as pernas dobradas por mais de 15 s, sem apoio visível. Parece suspenso no ar. Ver também a observação de p001 @ 02:03.
- Sugestão: pôr o quadril no chão ou usar uma pose de descanso mais baixa.

### MELHORIA — memes com pessoa real (verificar direitos)
- Pedaço: p002 @ 00:36 (meme "visible-confusion", foto de homem sobre o boneco roxo)
- Global: 6864 aprox.
- Cena: p106
- Descrição: mesma observação da seção p000 sobre fotos de pessoas reais em memes.
- Sugestão: confirmar licença ou trocar por versão ilustrada.

### Itens observados e considerados OK (p002)
- Banners ELIMINADO (Qwen 27B-1 em 01:03, Qwen Max em 01:33, Qwen 27B-2 em 01:56) batem com os eventos do JSON (causa "combate" e "sede") e são legíveis. O corpo do Qwen 27B-1 cai antes do banner (p002 @ 01:00), o que está correto.
- Cartões de pensamento do Qwen 27B-2 (01:42 a 01:50) aparecem depois da morte do Qwen Max (01:32), como o roteiro pede.
- Balões de "Preciso de água" (00:24 e 00:30) apontam para os personagens certos.

---

## p003 (quadros 9000–11999, cenas p111 final a p207 início)

### BUG leve — balão mostra o identificador interno "ds1" em vez de "DeepSeek 1"
- Pedaço: p003 @ 01:52 a 02:03 (balão do DeepSeek 4: "DeepSeek, aqui é o ds1. O kit médico fica comigo...")
- Global: 11696 a 11832 aprox.
- Cena: p206b (narração: "Ele não é o DeepSeek 1")
- Descrição: confirmado em tamanho cheio (p003 @ 01:54): o texto do balão traz "ds1", a sigla de id do JSON, e não "DeepSeek 1". Para quem assiste, "ds1" soa como código e não como nome. A fala também fica estranha por começar com "DeepSeek," como vocativo.
- Sugestão: trocar o texto por "DeepSeek 1" escrito por extenso e revisar a frase completa ("DeepSeek 1, aqui é o DeepSeek 4..."), com a voz regravada se necessário.

### BUG leve — entrada da caverna é um bloco preto chapado
- Pedaço: p003 @ 01:10 a 01:24 (noite, Dia 1)
- Global: 10674 a 11016 aprox.
- Cena: p205 ("Primeira noite")
- Descrição: a entrada da caverna é um polígono preto sólido, sem textura nem sombreamento. Em p003 @ 01:21 e 01:10 ele parece um buraco vazio no cenário e não uma caverna. O resto da noite está escuro, mas legível.
- Sugestão: dar textura ou um gradiente de luz à boca da caverna (fogueira ou brilho da água pingando) para que não pareça um recorte preto.

### BUG leve — boneco de primeiro plano bloqueia a briga
- Pedaço: p003 @ 01:09 (briga pelo arco, luta em torno do arco)
- Global: 10656 aprox.
- Cena: p204 ("seis IAs tentam pegar o mesmo arco")
- Descrição: em tamanho cheio, um boneco azul de costas, cortado pela borda inferior, cobre quase metade do quadro e esconde os personagens que brigam atrás dele. A ação principal fica pouco visível.
- Sugestão: afastar a câmera ou subir o ângulo para que a briga apareça inteira.

### MELHORIA — poses sentadas sem apoio (DeepSeek 4 e outros)
- Pedaço: p003 @ 01:54 (DeepSeek 4 sentado) e, nas seções anteriores, p002 @ 00:00 e p001 @ 02:03
- Global: 11736 aprox.
- Cena: p206b
- Descrição: o DeepSeek 4 aparece sentado no ar, com as pernas dobradas e sem banco nem chão de apoio. O mesmo problema já tinha aparecido em outros bonecos sentados (roxo à esquerda em p001 e p002).
- Sugestão: colocar um apoio visível (caixa, pedra, tronco) ou usar uma pose de agachado mais baixa.

### MELHORIA — personagem parado por cerca de 18 s durante o balão do Qwen 27B-1
- Pedaço: p003 @ 01:27 a 01:45
- Global: 11088 a 11520 aprox.
- Cena: p206 ("Essa caverna é minha")
- Descrição: o boneco roxo fica praticamente sem movimento enquanto o balão está na tela. A fala é boa, mas a imagem fica parada.
- Sugestão: idle sutil (respiração, troca de peso, olhar para o lado) ou um corte para outro ângulo durante a fala.

### MELHORIA — etiquetas de nome pequenas nas tomadas largas do lago
- Pedaço: p003 @ 00:03 a 00:21
- Global: 9072 a 9504 aprox.
- Cena: c01 e c02
- Descrição: na tomada aérea do lago, as etiquetas de nome ("Qwen 27B-3", "DeepSeek 2" etc.) ficam muito pequenas e tremidas. Na folha de contato são ilegíveis.
- Sugestão: aumentar as etiquetas nas tomadas largas ou mostrar só os nomes dos personagens que falam.

### Itens observados e considerados OK (p003)
- Título "PRA VALER / PARTIDA 2" (00:24 a 00:30) entra limpo, com a legenda "Os doze saem correndo pra Cornucópia" legível.
- Balão do Anthropic/Sonnet (00:30 a 00:42) está preso ao Opus, com a fala completa dentro do balão.
- Cartões de pensamento do Qwen 27B-1 (00:51 a 00:57) batem com o JSON (p203, at 156).
- Banner de noite (Dia 1 · Noite) e o escurecimento da transição combinam com a narração.
- Nenhum ELIMINADO neste pedaço, o que bate com o JSON (sem entradas de eliminados em p111 a p207).

---

## p004 (quadros 12000–14999, cenas p207 final a p210b)

### BUG grave — HUD de dia e de vivos vai e volta no tempo
- Pedaço: p004 @ 00:48 (DIA 5 · MANHÃ, 12 VIVOS), p004 @ 01:33 (DIA 6 · NOITE, 11 VIVOS), p004 @ 01:54 (DIA 5 · MANHÃ, 12 VIVOS), p004 @ 02:03 (DIA 6 · NOITE, 11 VIVOS). Confirmado em tamanho cheio.
- Global: 13152, 14232, 14736 e 14952 aprox.
- Cenas: p209 (turno 13), p210 (turnos 14, 15, 18) e p210b (turno 13, depois 14 e 18)
- Descrição: a ordem dos turnos nas tomadas não é crescente. Sequência de turnos: p207 = 7, p208 = 9, p208b = 8, p209 = 13, p209b = 10 e 11, p210 = 14, 15 e 18, p210b = 13, 14 e 18. O HUD acompanha esses números, então o espectador vê o dia voltar de "Dia 6 noite" para "Dia 5 manhã" e depois avançar de novo. A contagem de vivos também oscila: 12 para 11 para 12 para 11, sem nenhuma morte nova entre um e outro.
- Sugestão: reordenar as tomadas pelo turno (ou corrigir o campo "turno" de cada tomada) para que sejam crescentes de p207 a p210b. Depois conferir o HUD nos quadros de 0:48, 1:33, 1:54 e 2:03.

### BUG grave — corpos de "descansar" lidos como mortos; morte real sem banner
- Pedaço: p004 @ 01:27 a 01:45 (HUD "11 VIVOS", com X no anel roxo; corpos caídos visíveis em 01:33 e 01:39)
- Global: 14088 a 14520 aprox.
- Cena: p210 (início) e p210b
- Descrição: no quadro de 01:33 e 01:39 aparecem três personagens deitados no chão: marrom à esquerda (Sonnet), roxo no centro-alto (Qwen Max) e azul no canto inferior direito (DeepSeek 3). Pelo JSON, esses três estão vivos. No turno 18 eles têm a ação "descansar" (Sonnet, Qwen Max e DeepSeek 3), e a pose de descanso é um corpo deitado idêntico a um corpo morto. As etiquetas de nome continuam sobre esses bonecos. Enquanto isso, a única morte da partida (Qwen 27B-2, qwen3, vida 0 no turno 17, Dia 6 tarde) aparece só no HUD, sem banner ELIMINADO e sem narração. No JSON, o primeiro registro de eliminado desta partida é o da p212, muito depois.
- Sugestão: trocar a pose de "descansar" por algo que não se confunda com morte (sentado encostado, deitado de lado com um símbolo de sono ou um brilho de descanso). Tirar a etiqueta de nome de quem não está ativo nesse plano. Adicionar um banner ELIMINADO e uma linha de narração para a morte do Qwen 27B-2, no momento em que ela acontece.

### BUG leve — boneco de primeiro plano translúcido e cortado
- Pedaço: p004 @ 00:42 a 00:57 (o boneco escuro à direita, cortado na borda inferior, aparece em 00:48 tamanho cheio)
- Global: 13008 a 13368 aprox. (o trecho em tamanho cheio é 13152)
- Cena: p209
- Descrição: o boneco grande à direita está semi-transparente, com uma faixa verde-amarela passando por cima do corpo, e o chão aparece através dele. O resto da cena está opaco. Ele também ocupa boa parte do quadro e é cortado pela borda inferior.
- Sugestão: checar a opacidade desse personagem (névoa ou fade aplicado no objeto errado?) e afastar a câmera ou tirar o boneco do primeiro plano.

### MELHORIA — etiquetas de nome pequenas e tremidas nas tomadas largas
- Pedaço: p004 @ 00:00 a 00:21 e 01:18 a 01:27
- Global: 12000 a 12504 e 13872 a 14520 aprox.
- Cena: p207, p210 (tomadas largas)
- Descrição: nas tomadas largas, as etiquetas de nome ficam muito pequenas e são ilegíveis na folha de contato. Mesma observação de p003.
- Sugestão: mostrar só as etiquetas dos personagens que falam nessas tomadas, ou aumentar a fonte.

### Itens observados e considerados OK (p004)
- Título "NOVA REGRA" (00:03) entra limpo sobre a cena.
- Balões do Opus (00:18 a 00:24) e do Sonnet (00:42 a 00:51) estão presos aos bonecos certos e as falas cabem no balão.
- Cartões de pensamento do Opus (00:54 a 00:57), do Qwen 27B-3 (01:51 e 02:03) e do DeepSeek 2 (01:57 e 02:00) batem com as falas do JSON.
- Quadro de 02:03 mostra o balão do Qwen 27B-3 ("Estamos juntos até") com a etiqueta correta.

---

## Verificação das correções (novo render, a partir de 20:20)

Esta seção confere, pedaço a pedaço, se os itens das seções anteriores foram resolvidos no novo render e se alguma correção criou problema novo.

### p000 (novo render, gerado às 20:28)
- Opus parado em t05 (1:12 a 1:39): NÃO RESOLVIDO. A pose continua igual nas tomadas de 1:12 a 1:24 e o cartão aparece e some sem movimento de câmera perceptível.
- Boneco cortado na borda direita em r01 (2:00): NÃO RESOLVIDO. O boneco marrom continua cortado pela borda direita. A tomada mudou um pouco de ângulo, mas o corte permanece.
- Meme com pessoa real (0:36, "sweating"): sem mudança. Continua pendente de verificação de direitos.
- Problema novo: nenhum identificado neste pedaço.

### p001, p002, p003, p004 (novo render)
- A verificar quando forem gerados.

---

## Resumo parcial (até agora)
1. MELHORIA — Opus parado por ~27 s em t05 (p000 @ 01:12–01:39).
2. MELHORIA — memes com pessoas reais: checar direitos (p000 @ 00:36; p001 @ 01:24 e 01:58).
3. BUG leve — boneco cortado na borda em r01 (p000 @ 02:00).
4. BUG leve — legenda "mesmo distrito, os dois vencem." sobre o mapa da arena (p001 @ 00:32).
5. BUG leve — rótulos "um pouco d'água" e "Caverna" apertados no mapa da ilha (p001 @ 00:18).
6. BUG leve — boneco gigante e cortado no primeiro plano da r05 (p001 @ 00:42).
