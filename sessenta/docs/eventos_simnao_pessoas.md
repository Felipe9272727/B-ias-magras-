# Catálogo de eventos: SIM/NÃO, ESCOLHER ALGUÉM e MANDAR ALGUÉM

Recriação própria do 60 Segundos! Os textos abaixo foram escritos por nós (paráfrase da situação, sem copiar frases). A fonte deu só a mecânica, os números e a lista de eventos. Nada de 60 Parsecs.

## Contagem

| Lista da wiki | Eventos na lista original | Eventos escritos aqui |
|---|---|---|
| Sim ou Não (Yes Or No) | 55 | 55 |
| Escolher alguém (Choose Someone) | 8 | 8 |
| Mandar alguém (Send Someone) | 13 | 13 |
| **Total** | **76** | **76** |

Como contamos: um evento = um título próprio da lista da wiki. Em Sim/Não, as duas séries de "batida na porta" (início da partida e fase final) são eventos separados, como a própria wiki separa. As variações de redação de um mesmo evento (a wiki traz 2 ou 3 textos para a mesma pergunta) ficam num evento só, com a nota na linha de observações.

## Convenções (ler antes)

- **Pessoas**: pai, mãe, filha, filho (como em ARQUITETURA.md). Nenhum nome próprio da fonte aparece aqui.
- **Estados**: fome, sede, cansaço, doença, loucura, ferimento. "Sanidade ↑/↓" é o inverso da loucura (sanidade ↑ = loucura ↓). "Fica louco" = loucura sobe ao máximo.
- **Itens**: "+ X" = ganha X; "− X" = perde X. "+ item aleatório" / "− item aleatório" = sorteio entre os itens disponíveis (abrigo ou inventário, a definir no código).
- **Sorteio**: a fonte lista vários resultados para a mesma escolha sem dar chances. Tratar como sorteio uniforme até decidirmos.
- **Mandar alguém**: a pessoa sai numa expedição de 1 dia (fica com cansaço, fome sobe mais rápido, sede pausa, pode não voltar). Esses eventos não ocorrem enquanto outra pessoa estiver fora; se ocorreriam, acontecem logo após a volta.
- **requer: nada** = a escolha existe sempre.
- **cadeia:<nome>** = o evento só aparece depois de uma escolha anterior (o passo anterior está nas observações).

---

## 1. Sim ou Não (55 eventos)

### dieta_fungo — Fungo comestível na parede
- grupo: abrigo
- aparece quando: sem pré-requisito na fonte (pode surgir a qualquer momento).
- frequência: não indicada.
- situação: um fungo comestível cresce numa parede do abrigo. Perguntam se comem.
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) todos comem e ficam alimentados (fome zerada para todos).
    - B) alguém pode adoecer (doença em um ou mais membros).
  - nao (requer: nada): sem efeito.
- observações: três redações da mesma pergunta; mecânica igual.

### encontro_proibido — Encontro às escondidas
- grupo: abrigo
- aparece quando: mãe e filha no abrigo + a filha já foi mandada em expedição.
- frequência: não indicada.
- situação: a filha saiu escondida à noite para ver um rapaz que conheceu numa expedição. Ela pede para mandar um bilhete de desculpas.
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) o rapaz foi atacado por um bicho antes do encontro; a filha aceita o desfecho → sanidade da filha ↑.
    - B) a filha volta ferida depois de ver o rapaz com outra garota → filha ganha ferimento.
  - nao (requer: nada): sorteio entre:
    - A) a discussão fica tensa, sem efeito.
    - B) a filha implora e a mãe se recusa a ceder → sanidade da filha ↓.
- observações: nenhuma.

### vigilancia — Os espiões voltam
- grupo: cadeia:bunker_vip
- aparece quando: sim em "fio_gato".
- frequência: única.
- situação: os homens que espionavam a família batem à porta e querem explicar.
- escolhas:
  - sim (requer: nada): eles dizem que são agentes de uma missão secreta e que o grampo não era para a família, e sim para o gato (suspeito de ser espião de um país rival). Prometem levar a família a um refúgio com suprimentos se ajudarem em missões → inicia o final "bunker VIP" (passo 1).
  - nao (requer: nada): mandam os homens embora → final "bunker VIP" deixa de ser possível.
- observações: nenhuma.

### disputa_lata — Briga pela última lata
- grupo: abrigo
- aparece quando: filha e filho no abrigo + comida em nível baixo.
- frequência: não indicada.
- situação: as crianças brigam por uma lata de sopa. A família decide se intervém.
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) a lata some e o filho não recebe nada (sem efeito listado).
    - B) divisão com regra: o filho recebe parte, a filha come a dela → −1 sopa.
  - nao (requer: nada): a lata cai e derrama → −1 sopa; filha e filho ficam cansados (cansaço ↑) e sanidade dos dois ↓.
- observações: nenhuma.

### tuba — Instrumento da filha
- grupo: expedicao
- aparece quando: filha no abrigo + nenhuma expedição em andamento.
- frequência: não indicada.
- situação: a filha sente falta de tocar. Ela pede para procurar o instrumento nas ruínas da casa.
- escolhas:
  - sim (requer: nada): a filha sai por 1 dia (expedição de 1 dia) → sanidade da filha ↑.
  - nao (requer: nada): sanidade da filha ↓↓ (muito).
- observações: a fonte não diz o que a filha acharia lá fora; a busca não tem resultado listado.

### passeio_filho — Passeio do filho
- grupo: expedicao
- aparece quando: filho no abrigo + alguma expedição em andamento (a fonte fala assim; provavelmente a condição real é "nenhuma expedição em andamento", a confirmar).
- frequência: não indicada (três redações).
- situação: o filho quer sair para correr na superfície. A família decide.
- escolhas:
  - sim (requer: nada): sanidade do filho ↑; o filho sai por 2 dias.
  - nao (requer: nada): sanidade do filho ↓↓.
- observações: condição de expedição confusa na fonte (ver acima).

### xerifes — Visita do bando de verde
- grupo: porta
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada.
- situação: um bando vestido de verde bate à porta dizendo que tira dos ricos para dar aos pobres. Deixam entrar?
- escolhas:
  - sim (requer: nada; o efeito depende do número de itens no abrigo):
    - com até 6 itens no abrigo, sorteio entre:
      - A) +1 rádio (eles acham que a família não tem rádio e dão um).
      - B) +1 kit médico.
      - C) +3 água.
    - com mais de 6 itens no abrigo: levam 2 itens aleatórios (− item aleatório ×2) e vão embora.
  - nao (requer: nada): sem efeito; a porta fica trancada.
- observações: limite de 6 itens vem da fonte.

### canibalismo — Fome extrema
- grupo: abrigo
- aparece quando: sem comida no abrigo + pelo menos dois membros da família no abrigo (a fonte pede confirmação).
- frequência: não indicada.
- situação: sem comida, a família cogita sacrificar um dos próprios membros para comer. A fonte não traz desfecho definido.
- escolhas:
  - sim (requer: nada): a família decide que vai escolher quem. Sem consequência definida na fonte.
  - nao (requer: nada): recusam; sem efeito.
- observações: ATENÇÃO: evento sensível e sem consequência na fonte. Antes de implementar, decidir se troca por outro desfecho (racionar, pedir ajuda, etc.). Condição também a confirmar.

### mimica — Jogo de mímica
- grupo: abrigo
- aparece quando: pai e filho no abrigo.
- frequência: não indicada.
- situação: o filho quer brincar de mímica com o pai, que está de mau humor e não quer nada.
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) a brincadeira vira briga e acusações → sanidade do pai e do filho ↓.
    - B) o filho se debate e derruba objetos → − item aleatório.
  - nao (requer: nada): sorteio entre:
    - A) o pai se recusa; o filho acha suprimento escondido → + item aleatório.
    - B) (requer: filha no abrigo) o filho se anima com a irmã → sanidade do filho ↑.
    - C) o filho tenta sair, a porta emperra e entra ar contaminado → alguns ficam doentes (doença).
- observações: resultado B de "nao" só entra se a filha estiver no abrigo.

### limpeza — Experimento com baratas
- grupo: abrigo
- aparece quando: baratas mutantes no abrigo + mãe e filho no abrigo.
- frequência: não indicada.
- situação: o filho fez experimentos com baratas mutantes e deixou uma aberta na mesa. A mãe quer dar uma lição.
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) o filho limpa o dia todo e acha um suprimento perdido → + item aleatório.
    - B) o filho foge para fora e volta enjoado → filho fica doente.
  - nao (requer: nada): sorteio entre:
    - A) a mãe limpa sozinha; o filho se arrepende e ajuda no resto; sem efeito listado.
    - B) o filho finge que dorme; a mãe tropeça ao espanar → mãe ganha ferimento.
- observações: nenhuma.

### propaganda — Quadrinhos suspeitos
- grupo: abrigo
- aparece quando: filho no abrigo.
- frequência: única.
- situação: as revistas do filho têm heróis de um país rival. A família acha traição e quer jogar tudo fora.
- escolhas:
  - sim (requer: nada): o filho é expulso do abrigo e leva as revistas consigo (saída; a fonte não diz se ele volta).
  - nao (requer: nada): o filho fica; as revistas viram papel higiênico (sem efeito listado).
- observações: o original cita um país específico; aqui usamos "país rival".

### casa_vizinha — Casa da moça desaparecida
- grupo: radio
- aparece quando: sem pré-requisito na fonte (surge logo após uma mensagem de rádio com gritos e silêncio).
- frequência: única.
- situação: o rádio cala depois de gritos. Antes disso, uma mulher deu nome e endereço de uma casa da cidade. Vão até lá?
- escolhas:
  - sim (requer: nada): na casa há roupas de trabalho, patins e suprimentos; no fundo da pia, papéis de um programa civil de viagens espaciais → +2 sopa; desbloqueia a conquista "A casa da moça".
  - nao (requer: nada): sem efeito; acham que é armadilha ou brincadeira.
- observações: o "nao" é pré-requisito do evento "nao_sozinho".

### sinal_estranho — Sinal sob a estática
- grupo: radio
- aparece quando: rádio no abrigo.
- frequência: não indicada.
- situação: sons escondidos atrás da estática. Querem sintonizar?
- escolhas:
  - sim (requer: nada): o sinal melhora; uma voz de mulher diz que está presa no espaço e que a tripulação enlouqueceu e comeu toda a sopa. Sem efeito mecânico listado (é gancho narrativo).
  - nao (requer: nada): sem efeito.
- observações: nenhuma.

### nao_sozinho — Não estamos sozinhos
- grupo: cadeia:radio
- aparece quando: nao em "casa_vizinha" + gaita no abrigo.
- frequência: única.
- situação: a voz parou, mas o rádio continua com bipes e um som parecido com gaita. Respondem?
- escolhas:
  - sim (requer: nada): a família toca do lado de fora; luzes respondem no céu → sanidade de todos ↑; conquista "Não estamos sozinhos".
  - nao (requer: nada): sem efeito; ficam com medo do que possa vir.
- observações: a fonte usa uma sequência de luz que faz referência a outra série de TV. Trocar por um sinal próprio (decisão nossa).

### diario — Diário escondido
- grupo: abrigo
- aparece quando: filha no abrigo + manual de escoteiro no abrigo.
- frequência: única.
- situação: a filha esconde um diário dentro do manual de escoteiro. Lêem em voz alta?
- escolhas:
  - sim (requer: nada): a leitura dá errado; o diário some → sanidade da filha ↓ + alguém da família ganha ferimento (membro sorteado; a fonte não diz quem).
  - nao (requer: nada): a filha agradece, rasga e queima as páginas → sanidade da filha ↑.
- observações: nenhuma.

### carta_codigo — Carta decifrada
- grupo: cadeia:codigo
- aparece quando: sim em "codigo" + alguma expedição em andamento (condição da fonte; a confirmar).
- frequência: única.
- situação: a mãe decifrou a mensagem: há um local secreto perto do abrigo e ela deve ir sozinha.
- escolhas:
  - sim (requer: nada): a mãe sai por 2 dias. Ao voltar, traz resultados independentes: +2 água ou nada; +2 sopa ou nada (chances não indicadas) → sanidade da mãe ↑; conquista "Enigma".
  - nao (requer: nada): sanidade da mãe ↓.
- observações: a carta é de uma antiga colega, que hoje mora num abrigo com outros colegas de trabalho. A fonte não diz se o "nao" também fecha a cadeia (ver obs. de "codigo").

### disputa_familia — Briga por causa da porta
- grupo: cadeia:claustrofobia
- aparece quando: mãe no abrigo + sim em "claustrofobia" com a mãe presente.
- frequência: única.
- situação: a mãe ainda está brava com a porta aberta. A família tenta conversar?
- escolhas:
  - sim (requer: nada): a conversa acalma; todos ficam cansados (cansaço de todos ↑).
  - nao (requer: nada): a tensão cresce → sanidade de todos ↓.
- observações: nenhuma.

### atividade_extra — Visita ao antigo professor
- grupo: expedicao
- aparece quando: filha no abrigo + sim em "escola_filha".
- frequência: única.
- situação: a filha descobriu o endereço do antigo professor de música, um veterano que mora perto. Ela quer visitar.
- escolhas:
  - sim (requer: nada): a filha volta cansada, mas mais animada (sanidade da filha ↑, cansaço da filha ↑). Sorteio entre:
    - A) +1 gaita.
    - B) +1 sopa e +1 água.
  - nao (requer: nada): sem efeito listado.
- observações: duração da saída não indicada na fonte (tratar como 1 dia).

### conversa_mae — Conversa com a mãe
- grupo: abrigo
- aparece quando: mãe no abrigo.
- frequência: não indicada (duas redações).
- situação: a mãe anda calada. Conversam com ela?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) a conversa ajuda → sanidade da mãe ↑.
    - B) (requer: alguém já louco no abrigo) a conversa faz a mãe enlouquecer → mãe fica louca.
  - nao (requer: nada): sorteio entre:
    - A) a mãe se acalma sozinha → sanidade da mãe ↑.
    - B) ninguém conversa e a mãe piora → sanidade da mãe ↓.
    - C) a mãe piora → mãe fica louca.
- observações: a opção B do "sim" só entra se alguém já estiver louco.

### conversa_filha — Conversa com a filha
- grupo: abrigo
- aparece quando: filha no abrigo.
- frequência: não indicada (duas redações).
- situação: a filha ficou em silêncio o dia todo. Vão conversar?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) sanidade da filha ↑.
    - B) (requer: alguém já louco no abrigo) a filha fica louca.
  - nao (requer: nada): sorteio entre:
    - A) a filha volta a falar → sanidade da filha ↑.
    - B) sanidade da filha ↓.
    - C) a filha fica louca.
- observações: a opção B do "sim" só entra se alguém já estiver louco.

### conversa_filha_mutante — Filha transformada
- grupo: abrigo
- aparece quando: filha mutante (a fonte não diz qual evento a transforma; definir).
- frequência: não indicada.
- situação: a filha mudou, fica parada sorrindo. Tentam se aproximar?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) tudo parece normal; efeito não definido na fonte ("???").
    - B) ela reage com violência → alguém (a definir) ganha ferimento.
    - C) de manhã ela sumiu, deixando um bilhete ilegível → a filha sai do abrigo.
  - nao (requer: nada): sorteio entre:
    - A) o silêncio e a presença dela deixam todos inquietos → sanidade de todos ↓.
    - B) de manhã ela sumiu junto com a porta destruída → a filha sai do abrigo; a porta precisa de conserto.
- observações: efeito "???" do "sim/A" precisa de definição.

### conversa_filho — Conversa com o filho
- grupo: abrigo
- aparece quando: filho no abrigo.
- frequência: não indicada (duas redações).
- situação: o filho está abatido, olhando o vazio. Vão conversar?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) sanidade do filho ↑.
    - B) (requer: alguém já louco no abrigo) o filho fica louco.
  - nao (requer: nada): sorteio entre:
    - A) o filho se abre → sanidade do filho ↑.
    - B) gritar para ele melhorar não ajuda → sanidade do filho ↓.
    - C) o filho fica louco.
- observações: nenhuma.

### rastro_gato — Seguir o rastro
- grupo: cadeia:gato
- aparece quando: gato no abrigo.
- frequência: única.
- situação: a coleira do gato traz um endereço. Vão até lá?
- escolhas:
  - sim (requer: nada): dois homens de sobretudo e chapéu chegam e levam o gato de volta ao dono. Dias depois, o gato reaparece no abrigo → gato sai e volta depois.
  - nao (requer: nada): o gato fica no abrigo; sem efeito listado. Libera "fuga_gato".
- observações: nenhuma.

### jogo_gato_damas — Gato e o jogo de damas
- grupo: abrigo
- aparece quando: gato no abrigo + jogo de damas no abrigo.
- frequência: não indicada.
- situação: o gato empurra as peças do jogo para o chão a cada poucos segundos. Deixam ele brincar?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) o gato se entedia e se deita em cima do tabuleiro; sem efeito.
    - B) o gato quebra o tabuleiro ao meio → − jogo de damas.
  - nao (requer: nada): o gato fica bravo e a família foge; → − jogo de damas.
- observações: a fonte parece ter trocado as descrições: o texto "quando negado" aparece sob o "sim". Mecânica conferida pelo texto de cada opção; confirmar.

### comida_fresca — Colheita da planta
- grupo: cadeia:plantacao
- aparece quando: sim em "plantacao" (a fonte diz "às vezes": chance não indicada).
- frequência: única.
- situação: a planta cresce rápido e brilha no escuro. Colher o fruto agora?
- escolhas:
  - sim (requer: nada): +4 sopa (colheita).
  - nao (requer: nada): de noite a planta vira cinza; sem efeito.
- observações: nenhuma.

### fio_gato — Fio arrancado da parede
- grupo: cadeia:bunker_vip
- aparece quando: gato no abrigo.
- frequência: única.
- situação: o gato puxa um fio da parede e arranca reboco. O fio parece importante. Investigam?
- escolhas:
  - sim (requer: nada): seguem o fio até um caminhão velho onde dois homens de fones de ouvido espionavam o abrigo → libera "vigilancia".
  - nao (requer: nada): deixam o fio; sem efeito.
- observações: nenhuma.

### grandes_expectativas — Aula em casa
- grupo: abrigo
- aparece quando: mãe e filha no abrigo.
- frequência: não indicada.
- situação: a mãe descobre que a filha não sabe soletrar uma palavra enorme e resolve dar aula.
- escolhas:
  - sim (requer: nada): a aula vira faxina e conserto → conserta 1 item quebrado do abrigo (exceto rádio); sanidade da mãe e da filha ↑; filha fica cansada.
  - nao (requer: nada): sanidade da mãe e da filha ↓.
- observações: nenhuma.

### show_harmonica — Show improvisado
- grupo: abrigo
- aparece quando: gaita no abrigo.
- frequência: não indicada.
- situação: alguém toca a gaita e, de repente, baratas saem das frestas e dançam no ritmo.
- escolhas:
  - sim (requer: nada): baratas mutantes entram no abrigo.
  - nao (requer: nada): sem efeito; ficam dias em silêncio.
- observações: nenhuma.

### batida_sobrevivencia — Batida na porta (início)
- grupo: porta
- aparece quando: começo da partida (aprox. dias 2 a 6 da fase do abrigo) e só para membros da família que não entraram no abrigo na coleta. Cada membro só entra uma vez.
- frequência: única por membro; o evento se repete como batida enquanto houver membro de fora.
- situação: alguém bate na escotilha. Quem poderia ser a esta hora? Abrem?
- escolhas:
  - sim (requer: nada): sorteio entre (chances não indicadas):
    - A) pai entra (se estiver fora do abrigo).
    - B) filha entra (idem).
    - C) filho entra (idem).
    - D) mãe entra (idem).
    - E) não tem ninguém; era pegadinha; sem efeito.
    - F) tiro através da escotilha → um adulto ganha ferimento.
    - G) alguém começa a tossir → doença em um membro (pode acontecer junto com outro resultado).
    - H) +2 água (viajantes de máscara de gás).
    - I) +2 sopa (um homem estranho de terno).
  - nao (requer: nada): sem efeito; quem bateu vai embora.
- observações: quem entra recebe valores aleatórios em fome, sede, cansaço, doença, ferimento e loucura. Se algum estado começar no zero, a pessoa morre ao entrar (regra da fonte).

### batida_final — Batida na porta (fase final)
- grupo: final
- aparece quando: depois de pelo menos um final de resgate (militar, gêmeos, bunker VIP) ou de "estrelas" já estar em andamento. Repete a cada 10 dias.
- frequência: repete (a cada 10 dias).
- situação: batidas insistentes na escotilha. É o resgate, ou a última porta a abrir?
- escolhas:
  - sim (requer: nada): sorteio entre os desfechos liberados (chances não indicadas):
    - A) (requer: cachorro no abrigo) o cachorro se sacrifica para salvar a família → perde o cachorro para sempre.
    - B) o bando saqueia o abrigo → todos os itens do abrigo somem e a sanidade de quem está no abrigo cai muito (↓↓). Em seguida, pode cair em "fim".
    - C) final "fim" (derrota): ninguém sobrevive ao bando; sem esperança.
    - D) resgate militar → final "militar".
    - E) resgate pelos gêmeos → final "gêmeos" (novo acampamento).
    - F) transferência para o bunker presidencial → final "bunker VIP".
    - G) a nave do cientista leva a família às estrelas → final "estrelas".
  - nao (requer: nada): sorteio entre:
    - A) ignoram a batida → sanidade de todos no abrigo ↓.
    - B) ficam em silêncio; a batida para e não volta → sem efeito.
- observações: a sequência das batidas finais depende de qual cadeia de final foi completada; a lista de finais fica em finais.mjs. Esta batida só existe nessa fase; a batida do início é outro evento.

### linguagem — Língua estrangeira
- grupo: radio
- aparece quando: rádio no abrigo.
- frequência: não indicada.
- situação: por trás da estática, uma voz em língua que ninguém entende. Pode ser alguém hostil?
- escolhas:
  - sim (requer: nada): alívio geral (sabe-se que são estrangeiros, mas não é inimigo) → sanidade de todos ↑.
  - nao (requer: nada): desligam o rádio; sem efeito.
- observações: nenhuma.

### claustrofobia — A porta
- grupo: cadeia:claustrofobia
- aparece quando: pai no abrigo.
- frequência: única.
- situação: o pai entra em pânico, sente que o abrigo está encolhendo e exige abrir a porta.
- escolhas:
  - sim (requer: nada): a porta abre; ar contaminado entra e o pai fica doente → libera "disputa_familia" (se a mãe estiver presente).
  - nao (requer: nada): a porta fica fechada; sanidade do pai ↓↓.
- observações: nenhuma.

### aviso_final — Aviso no rádio (contagem final)
- grupo: radio
- aparece quando: sem pré-requisito listado; faz parte do desafio "contagem final" (a lista de desafios não está neste arquivo).
- frequência: não indicada.
- situação: um homem de sotaque forte avisa no rádio que há um lançamento de suprimentos perto, para quem for resgatado. Correr para pegar?
- escolhas:
  - sim (requer: nada): há briga pelos suprimentos; a família pega o que consegue → +2 sopa e +2 água.
  - nao (requer: nada): não arriscam; sem efeito (o estoque vai para outro grupo).
- observações: nenhuma.

### escola_filha — Escola da filha
- grupo: expedicao
- aparece quando: filha no abrigo + alguma expedição em andamento (condição da fonte; a confirmar).
- frequência: não indicada.
- situação: a filha quer voltar à antiga escola de música, mais longe do que a do irmão. Deixar ir?
- escolhas:
  - sim (requer: nada): a filha sai por 3 dias → libera "atividade_extra".
  - nao (requer: nada): sanidade da filha ↓.
- observações: nenhuma.

### passeio_cachorro — Passeio do cachorro
- grupo: expedicao
- aparece quando: cachorro no abrigo.
- frequência: não indicada (cinco redações).
- situação: o cachorro late sem parar e precisa correr. Mandar para fora?
- escolhas:
  - sim (requer: nada): o cachorro sai (duração não indicada; tratar como expedição de 1 dia) e volta com algo (sorteio):
    - A) +1 água.
    - B) +1 sopa.
    - C) +1 máscara de gás.
    - D) +1 kit médico.
    - E) +1 munição.
    - F) +1 lanterna.
    - G) (requer: desafio "mulher e seu cachorro" ativo) +1 item aleatório (três redações com o mesmo efeito).
    - H) volta sem nada (só o cachorro).
  - nao (requer: nada): sem efeito.
- observações: o desafio de G está em outra lista, não neste arquivo.

### fantasma_mapa — Mapa que cai
- grupo: abrigo
- aparece quando: mapa no abrigo.
- frequência: não indicada.
- situação: o mapa cai sozinho da parede e revela um cofre escondido atrás. Abrir?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) +1 sopa.
    - B) +1 água.
    - C) +1 item aleatório.
    - D) apagão: a sopa some → −1 sopa.
  - nao (requer: nada): sem efeito.
- observações: nenhuma.

### picnic_casal — Piquenique
- grupo: abrigo
- aparece quando: pai e mãe no abrigo.
- frequência: não indicada.
- situação: os dois não têm nenhuma privacidade. Um piquenique num parque destruído ajudaria?
- escolhas:
  - sim (requer: nada): sanidade do pai e da mãe ↑.
  - nao (requer: nada): sanidade do pai e da mãe ↓.
- observações: nenhuma.

### fuga_gato — Gato que sai de noite
- grupo: cadeia:gato
- aparece quando: nao em "rastro_gato" + gato no abrigo.
- frequência: não indicada.
- situação: barulhos à noite: o gato passa por um buraco na parede e volta de manhã. Seguir na próxima saída?
- escolhas:
  - sim (requer: nada): a família segue o gato até um ferro-velho onde um cientista maluco vive num ônibus transformado em laboratório. O gato volta ao abrigo depois → gato sai e volta depois. O cientista é recorrente (ver "cobaia" e "batida_final").
  - nao (requer: nada): sem efeito; o gato segue livre.
- observações: nenhuma.

### escoteiro — Sinal dos escoteiros
- grupo: porta
- aparece quando: filho no abrigo + um item foi usado no evento "por favor responda" (evento de outra lista, não neste arquivo).
- frequência: única.
- situação: batidas na porta: são os amigos escoteiros do filho, que captaram o sinal que ele mandou pelo rádio.
- escolhas:
  - sim (requer: nada): +1 item aleatório e sanidade do filho ↑.
  - nao (requer: nada): as batidas param; sem efeito.
- observações: depende de evento de outra lista.

### mau_humor_mae — Mãe de mau humor
- grupo: abrigo
- aparece quando: mãe louca.
- frequência: não indicada.
- situação: a mãe está agitada e perigosa. Tentar acalmá-la ou deixá-la de lado?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) a família a acalma → mãe deixa de estar louca.
    - B) a agitação contagia alguém (membro sorteado) → esse membro fica louco.
    - C) alguém (membro sorteado) se fere → ferimento.
  - nao (requer: nada): sorteio entre:
    - A) a mãe se recupera com o tempo → mãe deixa de estar louca.
    - B) a família a deixa de lado; sem efeito.
    - C) (requer: gato no abrigo) o gato se deita no colo dela → mãe deixa de estar louca.
- observações: a fonte marca os efeitos de "sim/B" e "sim/C" como "a confirmar".

### cheiro_buraco — Cheiro vindo da parede
- grupo: abrigo
- aparece quando: sem pré-requisito listado.
- frequência: não indicada.
- situação: um tijolo solta e revela um buraco com um cheiro horrível. Investigar?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) um rato morto tentava roubar uma lata → +1 sopa.
    - B) uma criatura pula, derruba o rádio e some → − rádio (se houver rádio).
  - nao (requer: nada): quem esteve doente recentemente volta a ficar doente (doença).
- observações: nenhuma.

### pega_pega — Pega-pega
- grupo: abrigo
- aparece quando: filha e filho no abrigo.
- frequência: não indicada.
- situação: as crianças estão agitadas e querem correr. Deixar brincar no pouco espaço?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) sanidade da filha e do filho ↑ + uma lata de sopa aparece no canto → +1 sopa.
    - B) sanidade da filha e do filho ↑ + uma garrafa de água no canto → +1 água.
    - C) sanidade da filha e do filho ↑; ao trombarem, derrubam suprimentos → − item aleatório; e (sorteio) um dos dois ganha ferimento, ou ninguém se machuca.
    - D) mesmo efeito do C, com outra redação.
  - nao (requer: nada): sanidade da filha e do filho ↓.
- observações: nenhuma.

### carro_pai — Carro do pai
- grupo: cadeia:carro_pai
- aparece quando: pai no abrigo + alguma expedição em andamento (condição da fonte; a confirmar).
- frequência: única.
- situação: o pai achou chaves no bolso e quer procurar o carro que tinha antes da explosão.
- escolhas:
  - sim (requer: nada): o pai sai do abrigo, sem prazo na fonte → libera "churrasco".
  - nao (requer: nada): sanidade do pai ↓.
- observações: nenhuma.

### codigo — Bilhete cifrado
- grupo: cadeia:codigo
- aparece quando: mãe no abrigo.
- frequência: única.
- situação: um bilhete cifrado aparece na porta. A mãe quer tentar decifrar?
- escolhas:
  - sim (requer: nada): a mãe passa a noite decifrando → cansaço da mãe ↑; libera "carta_codigo".
  - nao (requer: nada): a mãe tenta na folga, mas o bilhete some de noite → cansaço da mãe ↑ e sanidade da mãe ↓.
- observações: a fonte não diz se o "nao" libera "carta_codigo" (assumimos que não).

### lado_sombrio_idosos — Lado sombrio: abrigo de idosos
- grupo: cadeia:lado_sombrio
- aparece quando: sem pré-requisito na fonte (escolha moral).
- frequência: única por cadeia.
- situação: os suprimentos acabam. Sabem de um grupo de idosos num asilo em ruínas. Pegar o que têm?
- escolhas:
  - sim (requer: nada): sorteio entre (efeito fixo para todos os desfechos: sanidade de todos ↓, + marca de sangue, gêmeos deixam de poder resgatar, conquista "Lado sombrio"):
    - A) +4 sopa e +4 água.
    - B) +1 item aleatório.
    - C) tiros para o alto; eles fogem sem nada.
    - D) são xingados e saem sem nada.
  - nao (requer: nada): sanidade de todos ↑.
- observações: "marca de sangue" é um marcador novo, sem regra definida na fonte.

### lado_sombrio_vizinha — Lado sombrio: abrigo da vizinha
- grupo: cadeia:lado_sombrio
- aparece quando: sem pré-requisito na fonte.
- frequência: única por cadeia.
- situação: o abrigo da vizinha tem uma escotilha quebrada e pode ter suprimentos. Ela e os filhos podem ter conseguido entrar, mas a família precisa de comida.
- escolhas:
  - sim (requer: nada): sorteio entre (mesmos efeitos fixos de "lado_sombrio_idosos"):
    - A) +4 sopa e +4 água.
    - B) +1 item aleatório.
    - C) armadilha de placas e estilingues; a família foge.
    - D) armados na escotilha dão um tiro de aviso; a família foge.
  - nao (requer: nada): sanidade de todos ↑.
- observações: efeitos fixos iguais aos de "lado_sombrio_idosos".

### lado_sombrio_professora — Lado sombrio: escola
- grupo: cadeia:lado_sombrio
- aparece quando: sem pré-requisito na fonte.
- frequência: única por cadeia.
- situação: uma professora salvou crianças e as levou para um prédio. Os suprimentos da escola da cidade são de todos, então, por que não pegar?
- escolhas:
  - sim (requer: nada): sorteio entre (mesmos efeitos fixos de "lado_sombrio_idosos"):
    - A) +4 sopa e +4 água.
    - B) +1 item aleatório.
    - C) alarme; os adultos atacam com objetos; a família foge (as crianças ficaram lá).
    - D) os professores batem e a família foge.
  - nao (requer: nada): sanidade de todos ↑.
- observações: efeitos fixos iguais aos de "lado_sombrio_idosos".

### telescopio — Telescópio
- grupo: expedicao
- aparece quando: filho já foi mandado em expedição antes.
- frequência: não indicada.
- situação: o filho encontrou o velho telescópio entre os escombros e quer olhar as estrelas à noite.
- escolhas:
  - sim (requer: nada): o filho sai à noite e volta de manhã, cansado. Sorteio entre:
    - A) sanidade do filho ↑ (diz que viu uma nave).
    - B) sem efeito (diz que viu um homem de bigode na lua; provavelmente mancha na lente).
  - nao (requer: nada): sanidade do filho ↓.
- observações: duração da saída não indicada (tratar como expedição de 1 dia).

### radio_conserto — Consertar o rádio
- grupo: radio
- aparece quando: rádio no abrigo.
- frequência: não indicada (três redações).
- situação: o rádio está mudo há horas. Mexer nele?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) não resolve → sanidade de todos ↓.
    - B) o rádio quebra de vez → − rádio.
  - nao (requer: nada): a família fica tentando achar desculpa técnica → sanidade de todos ↓.
- observações: nenhuma.

### mala_misteriosa — Presente na porta
- grupo: porta
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada (três redações).
- situação: de manhã, uma mala sem nome está na porta. Abrir?
- escolhas:
  - sim (requer: nada): sorteio entre (chances não indicadas):
    - A) +1 sopa.
    - B) +1 água.
    - C) +1 mala (item).
    - D) +1 item aleatório (dinheiro e joias; a família joga fora o que não serve).
    - E) sopa vencida: alguém fica doente (doença).
    - F) água contaminada: alguém fica doente (doença).
    - G) armadilha: a mala explode → alguém ganha ferimento.
  - nao (requer: nada): sem efeito; a mala some no dia seguinte.
- observações: a fonte fala de dinheiro e joias como item aleatório; manter esse resultado ou trocar.

### gato_entra — Gato sobrevivente
- grupo: porta (inicia cadeia:gato)
- aparece quando: alguma expedição feita após o dia 20.
- frequência: única.
- situação: a família volta de expedição e ouve arranhões na escotilha. Um gato sobreviveu perto de um acampamento destruído.
- escolhas:
  - sim (requer: nada): o gato entra e se torna membro do abrigo → libera "rastro_gato", "jogo_gato_damas" e "fio_gato".
  - nao (requer: nada): sem efeito; o gato some.
- observações: nenhuma.

### pedra_vendedor — Vendedor de pedras
- grupo: porta (cadeia:vendedor)
- aparece quando: sem pré-requisito na fonte.
- frequência: única por cadeia.
- situação: um homem velho e sem casa bate na escotilha e pergunta se querem comprar uma pedra.
- escolhas:
  - sim (requer: nada): ganham uma pedra de graça (item sem efeito listado; a fonte diz que dá sorte). Alguns dias depois, o homem volta com uma garrafa grande de água e divide com todos → sede zerada para todos.
  - nao (requer: nada): sem efeito; o homem vai embora.
- observações: a fonte chama o item de "pedra"; o efeito de sorte não tem regra.

### churrasco — Festa na rua
- grupo: cadeia:carro_pai
- aparece quando: sim em "carro_pai".
- frequência: única.
- situação: o pai não achou o carro, mas encontrou uma festa de churrasco num gramado queimado da vizinhança. Espiar?
- escolhas:
  - sim (requer: nada): o pai volta desmaiado, com cheiro de bebida de tomate → +2 sopa e sanidade do pai ↑.
  - nao (requer: nada): o pai volta de qualquer jeito, com um espeto de rato e passa mal (doença do pai) → +1 sopa; sanidade do pai ↑.
- observações: nenhuma.

### jovens_armados — Jovens armados
- grupo: porta
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada.
- situação: do lado de fora ouvem gritos "em nome da liberdade". São jovens armados, que perguntam por inimigos na área. Abrir?
- escolhas:
  - sim (requer: nada): sorteio entre:
    - A) não são de nenhum lado; dão 2 água → +2 água.
    - B) deixam um rifle → + rifle.
    - C) deixam um machado → + machado.
  - nao (requer: nada): sem efeito; o grupo vai embora.
- observações: a fonte dá um nome ao grupo; no nosso texto não.

### plantacao — Semente
- grupo: cadeia:plantacao
- aparece quando: filha no abrigo.
- frequência: única.
- situação: a filha acha uma semente escondida. Plantar com um pouco de água?
- escolhas:
  - sim (requer: 1 água): −1 água; ganha "vaso de planta" no abrigo → libera "comida_fresca" (às vezes).
  - nao (requer: nada): sanidade da filha ↓.
- observações: a fonte fala que precisa de uma garrafa de água para plantar; por isso o requisito.

---

## 2. Escolher alguém (8 eventos)

Cada escolha é uma pessoa (ou ninguém). A pessoa escolhida é a que sofre o efeito.

### fazenda_formigas — Fazenda de formigas
- grupo: abrigo
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada.
- situação: do bolso do filho saem formigas mutantes. A mãe quer matá-las; o filho quer criar uma fazenda. Quem decide?
- escolhas:
  - escolher_filho (requer: nada; o efeito depende de sopa no abrigo):
    - com pelo menos 1 sopa: as formigas devoram uma lata de sopa e fogem → −1 sopa.
    - com menos de 1 sopa: o filho faz um "circo de formigas" e todos riem → sanidade de todos ↑.
  - escolher_mae (requer: nada): sorteio entre:
    - A) ela esmaga todas → sanidade do filho ↓ e sanidade da mãe ↑.
    - B) as formigas fogem e uma morde o filho → sanidade do filho ↓ e filho fica doente.
  - ninguém (requer: nada): uma formiga morde o filho → sanidade do filho ↓ e filho fica doente.
- observações: nenhuma.

### briga_irmaos — Briga dos irmãos
- grupo: abrigo
- aparece quando: filha e filho no abrigo.
- frequência: não indicada.
- situação: a filha puxa o cabelo do filho, que chuta a canela dela. Cada um acha que o outro começou.
- escolhas:
  - escolher_filho (requer: nada): sorteio entre:
    - A) o filho admite que pegou a gaita da irmã e devolve → +1 gaita.
    - B) a filha é vista como ameaça porque pegou um machado para perseguir o irmão; o machado é confiscado → +1 machado.
    - C) brigavam por uma lata extra; a lata é confiscada → +1 sopa.
    - D) fazem as pazes sozinhos; sem efeito.
  - escolher_filha (requer: nada): sorteio entre:
    - A) os dois gritam e os gritos deixam todos mais tranquilos → sanidade de todos ↑.
    - B) o filho é repreendido, a filha ri → sanidade do filho ↓ e sanidade da filha ↑.
    - C) a lata extra é confiscada → +1 sopa.
    - D) sem efeito.
  - ninguém (requer: nada): sorteio entre:
    - A) a lata extra é confiscada → +1 sopa.
    - B) fazem as pazes sozinhos; sem efeito.
- observações: nenhuma.

### maestro — Show de gaita
- grupo: abrigo
- aparece quando: gaita no abrigo.
- frequência: não indicada.
- situação: estão entediados, e a gaita está ali. Quem toca?
- escolhas:
  - escolher_pai (requer: nada): sanidade de todos ↑ (a fonte diz "todos"; o link da fonte aponta para a filha, a confirmar).
  - escolher_mae (requer: nada): o barulho dá dor de cabeça e enjoo → alguém fica doente.
  - escolher_filha (requer: nada): ela se voluntaria, tenta a tarde toda, adormece sem tocar; sem efeito listado (a fonte sugere cansaço, não marcado).
  - escolher_filho (requer: nada): ele trava, fica vermelho → sanidade do filho ↓.
  - ninguém (requer: nada): ninguém se sente pronto; o desconforto de todos → sanidade de todos ↓.
- observações: nenhuma.

### debate_filmes — Debate sobre filmes
- grupo: abrigo
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada.
- situação: o pai e a filha discutem qual personagem venceria numa batalha (um grupo de anões contra bandidos, uma ave contra baratas, dois monstros gigantes, ou duas vilãs com armas diferentes). Quem tem razão?
- escolhas:
  - escolher_filha (requer: nada): sorteio entre:
    - A) ela vence no volume → sanidade da filha ↑ e sanidade do pai ↓.
    - B) ela usa botões e pedrinhas para marcar pontos e acha munição → +1 munição (quantidade não indicada; tratar como 1 pacote).
  - escolher_pai (requer: nada): sorteio entre:
    - A) ele ganha; a filha aposta uma lata e perde → +1 sopa.
    - B) ele tapa os ouvidos; a filha joga objetos → − item aleatório.
  - ninguém (requer: nada): sorteio entre:
    - A) cansam de discutir → sanidade do pai e da filha ↓.
    - B) ficam animados com a discussão → sanidade do pai e da filha ↑.
- observações: nenhuma.

### veiculo_rua — Veículo misterioso na rua
- grupo: expedicao
- aparece quando: já foram feitas expedições suficientes (o número não é dado na fonte).
- frequência: única.
- situação: uma expedição viu um veículo estranho parado na rua. Mandar alguém para checar?
- escolhas:
  - escolher_pai_ou_mae (requer: pai ou mãe no abrigo): adiciona um desenho de tanque na parede do abrigo (sem efeito listado).
  - escolher_filha_ou_filho (requer: filha ou filho no abrigo): adiciona um desenho de caminhão de sorvete na parede (sem efeito listado).
  - ninguém (requer: nada): sem efeito; pode ser armadilha, então não se arriscam.
- observações: a fonte não diz se o "desenho" é item, decoração ou conquista. Definir.

### furto_lata — Lata sumiu
- grupo: abrigo
- aparece quando: sem pré-requisito na fonte.
- frequência: não indicada.
- situação: na contagem diária, uma lata de sopa sumiu. Quem pegou?
- escolhas:
  - escolher_pai (requer: nada): sorteio entre:
    - A) admite que escondeu, devolve a lata → sanidade do pai ↓.
    - B) nega e a lata cai do esconderijo: era ele → −1 sopa e sanidade do pai ↓.
    - C) foi erro na contagem → sanidade do pai ↓.
  - escolher_mae (requer: nada): sorteio entre:
    - A) aponta a bagunça e pede desculpas depois → sanidade da mãe ↓.
    - B) a lata foi achada atrás do armário; ela é a culpada → −1 sopa e sanidade da mãe ↓.
    - C) foi erro na contagem → sanidade da mãe ↓.
  - escolher_filha (requer: nada): sorteio entre:
    - A) a família acusa e ela se revolta → −1 sopa; sanidade da filha ↓ (a fonte traz este efeito junto).
    - B) ela joga uma lata cheia contra a parede e derrama → −1 sopa.
    - C) foi erro na contagem → sanidade da filha ↓.
  - escolher_filho (requer: nada): sorteio entre:
    - A) é proibido de tocar nas latas → −1 sopa e sanidade do filho ↓.
    - B) admite que derramou sem querer → −1 sopa e sanidade do filho ↓.
    - C) foi erro na contagem → sanidade do filho ↓.
  - ninguém (requer: nada): não vale a briga; a família deixa pra lá → sanidade de todos ↑.
- observações: a fonte traz efeitos de sanidade duplicados em algumas opções; confirmamos quando a implementação estiver pronta.

### balde — Balde da discórdia
- grupo: abrigo
- aparece quando: pai e mãe no abrigo.
- frequência: não indicada.
- situação: os dois brigam sobre quem deve levar o balde para fora. Ninguém admite que é a vez dele.
- escolhas:
  - escolher_pai (requer: nada): sorteio entre:
    - A) a mãe admite que era a vez dela, mas está indisposta; o pai aceita e ela ri das piadas dele → sanidade do pai e da mãe ↑.
    - B) o pai alega dor nas costas, a mãe insiste, ele escorrega com o balde → ferimento no pai.
  - escolher_mae (requer: nada): sorteio entre:
    - A) há alguém desacordado (ou morto) bloqueando a escotilha; a família o tira dali e acha suprimentos com ele → +1 item aleatório e sanidade da mãe ↓.
    - B) a mãe pega o balde, o pai tenta ajudar, os dois escorregam e perdem coisas → − item aleatório e sanidade de todos ↓.
  - ninguém (requer: nada): o balde enche, o cheiro piora → sanidade de todos ↓; alguns podem adoecer.
- observações: nenhuma.

### aniversario — Aniversário de casamento
- grupo: abrigo
- aparece quando: pai e mãe no abrigo.
- frequência: única.
- situação: é o aniversário de casamento do casal. Os dois prepararam presentes. Quem abre o seu primeiro?
- escolhas:
  - escolher_pai (requer: nada): resultado único: a mãe dá uma lata de sopa (+1 sopa) e o pai faz um grafite de coração com as iniciais dos dois na parede do abrigo (sem efeito listado).
  - escolher_mae (requer: nada): sorteio entre:
    - A) grafite de coração com as iniciais (ela acha vandalismo) + a lata de sopa da mãe (+1 sopa).
    - B) o pai dá uma máscara de gás "elegante" (+1 máscara de gás) e a mãe dá a lata de sopa (+1 sopa).
  - ninguém (requer: nada): sanidade do pai e da mãe ↓ (a fonte repete o efeito duas vezes; a confirmar se é uma vez).
- observações: o grafite e o presente de sopa são o mesmo par nas duas escolhas; muda só a ordem de abertura.

---

## 3. Mandar alguém (13 eventos)

Cada escolha é mandar uma pessoa para fora (expedição de 1 dia, ver Convenções) ou ninguém.

### nova_esperanca — Nova esperança
- grupo: cadeia:gemeos
- aparece quando: alguém foi mandado no evento "ligacao" (ver abaixo).
- frequência: única.
- situação: um bilhete na porta pede que a família mande um representante, desarmado, para um encontro à noite. Mandar alguém?
- escolhas:
  - mandar (requer: 1 membro disponível, sem arma): o representante encontra um grupo de sobreviventes liderado por dois irmãos gêmeos (um rapaz e uma moça). Prometem manter contato → cadeia "gemeos" continua.
  - ninguém (requer: nada): ficam esperando o exército; sem efeito.
- observações: nenhuma.

### ligacao — Ligação inesperada
- grupo: cadeia:gemeos
- aparece quando: sem pré-requisito na fonte (inicia a cadeia de gêmeos).
- frequência: única.
- situação: um telefone de orelhão do outro lado da rua toca. Alguém atende?
- escolhas:
  - mandar (requer: 1 membro disponível): ao atender, ouvem alívio de um sobrevivente de outra cidade; a ligação cai no meio → inicia "gemeos".
  - ninguém (requer: nada): o telefone toca por muito tempo → sanidade de todos ↓.
- observações: nenhuma.

### encontro_militar — Encontro com militares
- grupo: cadeia:militar
- aparece quando: rádio no abrigo + já aconteceu um dos eventos militares de outra lista (ver observações).
- frequência: única.
- situação: os militares pedem um representante de cada grupo de sobreviventes para responder perguntas antes da evacuação. Mandar?
- escolhas:
  - mandar (requer: 1 membro disponível): o representante responde às perguntas dos soldados → cadeia "militar" continua.
  - ninguém (requer: nada): não arriscam; sem efeito.
- observações: os eventos militares que liberam este (um deles é "tanque_antigo", por exemplo) estão fora desta lista; checar no catálogo.

### cafe_expedicao — Café de verdade
- grupo: expedicao
- aparece quando: mãe no abrigo.
- frequência: única.
- situação: a mãe quer café de verdade. O restaurante que ela gostava foi destruído, mas talvez tenha algum café. Mandar alguém?
- escolhas:
  - mandar (requer: 1 membro disponível): sorteio entre:
    - A) volta com café frio: todos bebem (sede zerada para todos), descansam (cansaço zerado para todos) e ficam mais animados (sanidade de todos ↑; a fonte marca "a confirmar").
    - B) volta de mãos vazias; o restaurante virou um buraco; sem efeito.
  - ninguém (requer: nada): sem efeito.
- observações: nenhuma.

### perigo_selvagem — Caça na superfície
- grupo: expedicao
- aparece quando: rifle no abrigo.
- frequência: não indicada (duas redações).
- situação: ouvem uma manada passando por cima do abrigo, onde antes havia um gramado. Mandar caçar comida?
- escolhas:
  - mandar (requer: 1 membro disponível e rifle): sorteio entre:
    - A) acham a manada e derrubam um bicho que carregava um pacote; uma ave grande leva a carcaça, e caem 3 latas de sopa → +3 sopa.
    - B) abatem uma criatura estranha que tem gosto de sopa → − munição (quantidade não indicada); alimenta todos (fome zerada para todos).
    - C) erram todos os tiros; sem efeito.
    - D) era um bando de predadores parecidos com dinossauros; o enviado morre → − rifle.
  - ninguém (requer: nada): sem efeito.
- observações: a fonte pede o rifle só como condição de aparição.

### mapa_pichado — Mapa pichado no muro
- grupo: expedicao
- aparece quando: alguém já foi mandado em expedição antes.
- frequência: não indicada (duas redações).
- situação: no muro perto do abrigo há um mapa rabiscado com um X. Vale checar?
- escolhas:
  - mandar (requer: 1 membro disponível): sorteio entre:
    - A) o X marca um esconderijo → + item aleatório.
    - B) o X marca um pacote → + item aleatório.
    - C) o X marca suprimentos escondidos → + item aleatório.
    - D) o esconderijo já foi saqueado; sem efeito.
    - E) era brincadeira; sem efeito.
  - ninguém (requer: nada): sem efeito.
- observações: nenhuma.

### cofre_vizinho — Cofre do vizinho
- grupo: expedicao
- aparece quando: sem pré-requisito na fonte.
- frequência: única.
- situação: a família sempre quis saber o que tem dentro do cofre da sala do vizinho, que nunca foi querido. Mandar alguém roubar?
- escolhas:
  - mandar (requer: 1 membro disponível): sorteio entre:
    - A) o cofre foi aberto pela explosão; pega 1 item aleatório; o vizinho não foi achado.
    - B) o cofre estava armadilhado: sai fumaça fedida; pega 1 item aleatório e o enviado fica doente.
  - ninguém (requer: nada): sem efeito.
- observações: nenhuma.

### cobaia — Cobaia do cientista
- grupo: cadeia:estrelas
- aparece quando: evento anterior de outra lista já aconteceu (ver observações). Repete 3 vezes.
- frequência: repete 3 vezes.
- situação: o cientista pede um voluntário para um experimento sobre doenças da região. Ele diz que é para um foguete para sair do deserto.
- escolhas:
  - mandar (requer: 1 membro disponível): o enviado fica 4 dias fora. Ao voltar, está ferido; um dia depois fica doente e louco → final "estrelas" continua.
  - ninguém (requer: nada): 1ª e 2ª vezes: sem efeito. 3ª vez: final "estrelas" deixa de ser possível.
- observações: o evento anterior ("???" na fonte) não está nesta lista. O cientista é o mesmo de "fuga_gato".

### reconhecimento — Missão de reconhecimento
- grupo: cadeia:bunker_vip
- aparece quando: evento anterior de outra lista já aconteceu ("provisões", ver observações). Repete 3 vezes.
- frequência: repete 3 vezes.
- situação: os agentes pedem que alguém saia, cumpra um reconhecimento e anote o que viu. Mandar?
- escolhas:
  - mandar (requer: 1 membro disponível): o enviado volta ferido, mas cumpriu a missão → ferimento no enviado; cadeia "bunker VIP" continua.
  - ninguém (requer: nada): 1ª e 2ª vezes: sem efeito. 3ª vez: final "bunker VIP" deixa de ser possível.
- observações: "provisões" está em outra lista.

### reencontro_gemeos — Resgate do irmão
- grupo: cadeia:gemeos
- aparece quando: alguém foi mandado no evento "ligacao" (ou no "nova_esperanca").
- frequência: única (6 redações, mesmo efeito).
- situação: uma jovem de branco pede ajuda para resgatar o irmão gêmeo, preso num acampamento de bandidos por ter desafiado o líder. Ajudar?
- escolhas:
  - mandar (requer: 1 membro disponível): o grupo resgata o irmão, que perdeu uma mão e vai sobreviver → cadeia "gemeos" continua.
  - ninguém (requer: nada): sem efeito listado; os gêmeos seguem sem ajuda.
- observações: nenhuma.

### laco_familiar — Laços de família
- grupo: abrigo
- aparece quando: comida OU água em nível baixo + pelo menos 3 membros no abrigo.
- frequência: única.
- situação: o abrigo não cabe todos. Alguém precisa sair e se virar lá fora. Quem?
- escolhas:
  - mandar pai (requer: nada): o pai sai do abrigo.
  - mandar mãe (requer: nada): a mãe sai do abrigo.
  - mandar filha (requer: nada): a filha sai do abrigo (se oferece).
  - mandar filho (requer: nada): o filho sai do abrigo.
  - ninguém (requer: nada): ninguém sai → sanidade de todos ↑.
- observações: a fonte não diz se quem sai pode voltar (tratar como saída definitiva até confirmar).

### tanque_antigo — Tanque abandonado
- grupo: cadeia:militar
- aparece quando: alguém já foi mandado em expedição antes.
- frequência: única.
- situação: a última expedição viu um tanque abandonado entre os escombros. Mandar alguém investigar?
- escolhas:
  - mandar (requer: 1 membro disponível): sorteio entre:
    - A) rações de exército → +1 sopa e +1 água.
    - B) equipamento de proteção → +1 máscara de gás.
    - C) rádio funcionando; o exército entra em contato e oferece ajuda → +1 rádio e libera "encontro_militar" (a fonte marca "às vezes", ou seja, o rádio não é garantido).
    - D) +1 rifle.
    - E) munição solta → +1 munição.
    - F) o tanque tinha explosivos; o enviado morre.
  - ninguém (requer: nada): sem efeito.
- observações: a condição "às vezes" do item de rádio não tem regra na fonte.

### ilha_tesouro — Ilha do tesouro
- grupo: expedicao
- aparece quando: mapa no abrigo.
- frequência: não indicada (três redações).
- situação: no mapa há rabiscos com instruções para achar algo enterrado. Mandar alguém?
- escolhas:
  - mandar (requer: 1 membro disponível): sorteio entre:
    - A) latas enterradas embaixo de uma árvore no quintal de um vizinho → +2 sopa.
    - B) um oco numa árvore com um jogo de damas → + jogo de damas.
    - C) no parque destruído, uma lanterna que funciona → + lanterna.
    - D) nada; era brincadeira de criança; sem efeito.
    - E) o enviado tropeça num monte de entulho e perde o mapa → − mapa.
  - ninguém (requer: nada): sem efeito.
- observações: nenhuma.

---

## Pendências gerais

- Canibalismo ("canibalismo"): evento sensível e sem consequência definida na fonte. Decidir o desfecho antes de implementar.
- Condições que vêm de outras listas (não estão neste arquivo): "por favor responda" (escoteiro), "provisões" (reconhecimento), "???" (cobaia e conversa_filha_mutante), eventos militares (encontro_militar), desafios "contagem final" (aviso_final) e "mulher e seu cachorro" (passeio_cachorro).
- Inconsistências da fonte: "jogo_gato_damas" (textos trocados entre sim e não); "maestro" (link de sanidade aponta para a filha, mas o texto diz "todos"); "aniversario" (efeito de sanidade repetido); "furto_lata" (efeitos duplicados).
- Estados que a fonte não define: "marca de sangue" (lado sombrio), "desenho" (veiculo_rua), "conquista" (várias: definir se entram no jogo).
- Eventos com "a confirmar" na fonte: "passeio_filho", "escola_filha", "carro_pai", "carta_codigo" (condição de expedição), "comida_fresca" (chance "às vezes"), "tanque_antigo" (rádio "às vezes").
