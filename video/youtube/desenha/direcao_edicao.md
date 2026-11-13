# Direção de edição — "Coloquei 10 IAs pra jogar Gartic" (Desenha e Adivinha)

Complemento do `storyboard.md` (não o substitui). Narrador: eu, em 1ª pessoa. Sem emoji, sem sussurro (pensamento = voz normal com eco), sem lobby, sem meme repetido. "Gartic" só na fala e no título: nada de logo, cores ou tela da marca.

## 1. Identidade visual: o ateliê

- **Ideia**: uma mesa de desenho vista de frente. Fundo papel kraft `#C9A66B` com textura leve e sombra de mesa; o quadro é uma folha branca `#FDFBF5` presa com fita crepe. **Papel branco = o que as IAs veem. Post-it amarelo `#FFE66D` = o que só o público vê** (cartão da palavra, plano do desenhista, pensamentos), sempre com a etiqueta "SÓ VOCÊ VÊ".
- **Cores das IAs** (retrato, borda da ficha, balão, barra do placar): Vermelho `#E0262B`, Azul `#3D7BF2`, Amarelo `#FFC83D`, Rosa `#FF6FB5`, Roxo `#8E4DE0`, Verde `#19A974`, Ciano `#22C7D6`, Laranja `#F2802E`, Marrom `#8B5A2B`, Lima `#A6D608`. Texto preto sobre Amarelo, Lima, Ciano e Rosa; branco nas outras.
- **Atenção**: os traços dos desenhos também têm cor (amarelo, verde, azul, vermelho...). Cor de IA nunca entra dentro do quadro: fica só em ficha, moldura e retrato. Certo e errado não usam verde e vermelho chapados (confunde com Lápis e Rabisco): acerto = ficha com carimbo "OK" e brilho branco; erro = ficha acinzentada com risco. Onde o storyboard diz "ficha verde" ou "ficha vermelha", leia acerto e erro nesse estilo.
- **Tipografia** (em `public/fonts`): **Bangers** em selos, palavra do cartão e números gigantes; **Poppins** 800 em nomes e títulos, 600 em chat e legendas; **JetBrains Mono** na dica (`_ E _ _ _ E _ _`), nos cronômetros, no chip "DESENHO N DE 20" e em toda conferência letra a letra. A dica é sempre monoespaçada para as letras do chute encaixarem casa por casa embaixo dela.
- **Selos**: carimbo torto (de -6 a +6 graus) com borda de tinta falhada, mínimo 2,5 s, mesmo tempo do meme, nunca cortado pelo fim da cena.
- **Câmera**: deriva lenta em toda cena. Ela mora no quadro e vai até o chat seguindo a ficha que cai; zoom de soco só no evento (o X do pesadelo, a lágrima, o L da dica, o campo de palpite vazio).

## 2. As cinco telas (nunca mais de 2 cenas seguidas na mesma)

1. **Jogo**: quadro à esquerda (60%), chat à direita, dica em cima, barra de tiques 1 a 4, chip do desenho. Sem placar acumulado.
2. **Dois balões**: plano do desenhista (pontilhado, no post-it) contra o quadro real. Usada em B2, D1, E2, J1.
3. **Pensamento**: o quadro encolhe para o canto e a nuvem da IA ocupa a tela, com as palavras testadas aparecendo e sendo riscadas (D5, I2, J4, J6).
4. **Dado grande**: fundo liso, um número ou gráfico só (B3, G2, H1, K1, L1).
5. **Galeria**: parede com molduras e plaquinha de museu (B1, H2).

## 3. O desenho sendo feito, traço a traço

- Fonte: `desenhos[n].tiques[t].novos` em `desenha/logs/partida1.json` (ordem real). Quatro tipos: `linha` (pontos, espessura), `circulo` (centro, raio), `retangulo` (de, ate), `poligono` (pontos); `cor`, `preenchido`. Os PNG de `desenha/logs/partida1/` servem de conferência do resultado final (`dNN_tT.png`, `_antes`).
- Animação: contorno com `stroke-dashoffset` (0,35 s por traço na rodada 2; 0,12 s na rodada 1, que tem até 30 traços), depois o preenchimento entra como hachura de giz por 0,15 s. Uma ponta de lápis na cor do desenhista acompanha a linha. `caneta` por traço, com tom um pouco diferente a cada um.
- **Contador de traços** na rodada 2: oito pauzinhos na borda do quadro; cada traço apaga um. Quando zera, carimbo "ACABARAM OS TRAÇOS" e o quadro ganha um cadeado desenhado (pesadelo no tique 2; fofoca e carnaval já no tique 1).
- Traços novos de um tique entram com o "antes" em 40% de opacidade por 1 s (os X do pesadelo, a garrafa, a carne).
- **Contorno pontilhado do que cada IA viu**: recurso central das piadas. Linha tracejada branca com borda escura por cima do desenho, 1 s, sem tapar o original (caminhão, jabuti, Papai Noel, amendoim, mosquito, disco voador, cobra). É desenho nosso, sempre com etiqueta "O QUE ELE VIU".

## 4. O chat com os chutes caindo

- Cada chute é uma **ficha** que cai de cima com quique (`pop`): retrato + nome + palpite em Poppins 800 maiúsculo. Entram **na ordem e no ritmo real dos `ms`**, comprimidos (1 s de tela = 3 s de jogo; quem passa de 60 s entra com um relógio pequeno e o tempo escrito).
- A fala `[chute]` abre como balão ao lado da ficha só para as citações do storyboard; as da lista entram só como ficha.
- Fichas iguais **empilham** e o contador cresce em Bangers ("NATUREZA ×7", "MARCIANO ×5"). É o efeito da abertura.
- Acerto: a ficha mostra `*****` (como no jogo) e o palpite aparece ao lado só para o público, com "+10" voando para o retrato. `correct-ding` em escada (cada acerto um tom acima).
- **Conferência letra a letra**: o chute desce para baixo da dica e cada letra entra na sua casa; a que não bate treme e fica riscada (A de NATUREZA, O de MARCIANO), a que sobra cai para fora (o A final de BICICLETA, a casa vazia do FUZIL). Etiqueta "CÁLCULO NOSSO".
- `[reação]` do desenhista: plaquinha de madeira erguida ao lado do quadro. `[pensamento]`: nuvem em post-it com ondas de eco.
- **Campo vazio** (gag do Lápis): o balão de chat com `*****` e, embaixo, a caixa "PALPITE" vazia com cursor piscando.

## 5. Placar e contadores

- Placar acumulado só em **B3, G2, K1 e L1**: barras horizontais com retrato, que trocam de posição deslizando. Nas outras cenas, "+pontos" sobe do chat para os retratos e some.
- Três contadores de gag, pequenos, no canto inferior, que só aparecem quando mudam: **LÁPIS +2** (carimbos enfileirados, de D7 a K3), **CONTA DO GIZ** (ábaco de três contas: D6, I3, K2) e **lanterna de papel** na cabeça do último colocado (Tinta até K3, depois Grafite).
- Fechamento: barras entram do último ao primeiro com tambor; medalhas de papel recortado nos prêmios.

## 6. Transição entre desenhos: virar a folha

A mão arranca a folha do quadro (`pagina`), ela voa e vai parar pequena na parede da galeria ao fundo, com o carimbo do resultado ("1 DE 9", "7 DE 9"). A folha nova já vem com o chip e o cartão da palavra. 1 s. A parede vai enchendo e é a mesma de H2 e L3. Em D7 e J6 a folha **não** é arrancada na hora: fica 1 s parada em silêncio. Dentro do mesmo desenho, a passagem de tique é a barra 1 a 4 avançando com a dica descendo do teto (`riser`).

## 7. Os personagens

Dez materiais de desenho com dois olhos e braços de risco, cada um na sua cor, sempre no mesmo lugar do chat. O traço do corpo imita o material.

| Nome | Cor | Forma | Jeito |
|---|---|---|---|
| Rabisco | Vermelho | caneta esferográfica mordida | faz rabisco no ar quando fala |
| Aquarela | Azul | pastilha de aquarela com pincelzinho | escorre uma gota quando pensa |
| Borrão | Amarelo | mancha de tinta | quase não abre a boca; só a ficha cai |
| Giz | Rosa | toco de giz | solta pó quando erra a conta |
| Pincel | Roxo | pincel de cerda larga | coroa de papel quando lidera |
| Lápis | Verde | lápis com a ponta quebrada | a ponta quebra a cada "+2" |
| Traço | Ciano | régua com marca-texto | olha para os lados antes de chutar |
| Tinta | Laranja | tubo de tinta apertado | derrama texto: o balão dele sempre transborda |
| Carvão | Marrom | bastão de carvão | deixa rastro de velocidade, chega primeiro |
| Grafite | Lima | lapiseira | o mais lento: entra andando devagar, relógio ao lado |

Quem desenha vai para o cavalete e fica de costas para o chat (ele não escreve, só ergue a plaquinha). Modelo aparece embaixo do nome só em A2 e L1.

## 8. Música por capítulo (`public/music/music.json`, Kevin MacLeod; créditos na descrição)

| Capítulo | Clima | Trilha (id) |
|---|---|---|
| A1 | tensão, corte seco no `record-scratch` | `decisions` |
| A2, A3 e rodada 1 (B) | animado, joguinho | `pixel-peeker-polka-faster` |
| C saudade | triste de propósito; corta no acerto do Tinta | `heartbreaking` |
| D1 a D3 pesadelo | assombração de brincadeira | `ghost-story` |
| D4 a D6 | confusão crescendo | `comedic-juggernaut` |
| D7 | silêncio de 1 s, depois vitória | `call-to-adventure` |
| E preguiça | música de elevador | `local-forecast-elevator` |
| F ressaca | bobo, cambaleando | `quirky-dog` |
| G engarrafamento e placar | comédia leve | `monkeys-spinning-monkeys` |
| H1 corrida | correria | `run-amok` |
| H2 galeria | calmo, museu | `chill-wave` |
| I fofoca | cochicho, esperteza | `sneaky-snitch` |
| J1 a J3 carnaval | comédia acelerando | `fluffing-a-duck` |
| J4 | suspense com humor | `thinking-music` |
| J5 | festa; corta seco para o silêncio de J6 | `chipper-doodle-v2` |
| K churrasco | decisão | `mega-hyper-ultrastorm` |
| L1, L2 | premiação | `winner-winner` |
| L3 | fecho épico curto | `heroic-age` |

Fade de 1 s entre capítulos; volume baixo sob citação. **Silêncio é efeito** em: D7 (1 s antes da ficha do Pincel), J6 (cena inteira sem música até o riso) e K2 (só `heartbeat` na câmera lenta).

## 9. As 5 cenas para caprichar

- **A1 (gancho)**: três planos em 14 s: as sete fichas empilhando até "NATUREZA ×7", soco na ficha JABUTI, cartão virando PESADELO. Sem cartão da palavra antes do fim: o espectador também tem que achar que é paisagem.
- **D5 (a parede de palavras)**: o pensamento da Aquarela rolando de verdade (texto real do log), cada palavra riscada no ritmo do `typing`, e "DESPERTAR?" passando devagar bem ao lado do cartão PESADELO. Depois o fio que liga a plaquinha "tá esquentando" ao VERANEIO.
- **D7 (o único)**: tela limpa, só os X; pensamento linha por linha; 1 s parado; uma ficha. É a única cena do vídeo sem nada se mexendo antes do acerto.
- **I2 (a cola errada)**: mostrar o que o Lápis e o Giz imaginam por cima da ficha `*****` da Aquarela (PENSAR e DEBATE escritos a lápis, tremidos), com a FOFOCA de verdade visível no post-it do público.
- **J4 a J6 (o L, as sete, a cascavel)**: o L piscando, a soletração do Carvão batendo no L, as palavras inventadas da Aquarela, a máscara pontilhada finalmente encaixando em J5 e, em J6, a cobra pontilhada com setas "cabeça / marcas / guizo". O post-it de A2 volta e risca CASCAVEL.

## 10. O que evitar

Emoji; sussurro; lobby; meme repetido; logo, cores ou nome de marca na arte; placar acumulado fora de B3, G2, K1 e L1; verde ou vermelho chapado para certo e errado; mostrar a palavra na ficha de quem acertou para as IAs (é `*****`); dizer "pensou por 6 minutos" (é tempo de resposta); ler em voz alta dica, soletração ou lista de chutes (a tela mostra, eu resumo); o pensamento do Lápis no desenho 17 tique 4 (tem caracteres estranhos); a frase do Giz com "emoji" e a do Tinta sobre a bandeira; esconder o chip "DESENHO N DE 20" nas cenas fora de ordem (H2, I, J).
