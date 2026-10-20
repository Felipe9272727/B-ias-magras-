# Estilo de roteiro (narração) e base para o "60 Segundos das IAs"

Documento de referência para escrever `video/roteiro/roteiro_s60.py` no mesmo estilo dos Among Us 2 e 3.

Fontes lidas (caminhos absolutos):
- `/home/user/B-ias-magras-/video/roteiro/roteiro_au3.py` (AU3, 81 cenas)
- `/home/user/B-ias-magras-/video/roteiro/roteiro_au2.py` (AU2, 105 cenas)
- `/home/user/B-ias-magras-/video/roteiro/gerar_falas_au3.py` (como as falas de reunião entram no roteiro)
- `/home/user/B-ias-magras-/video/scripts/build_timeline_au3.py` (como o roteiro vira linha do tempo)
- `/home/user/B-ias-magras-/video/youtube/descricao_au3.md` (o que o público viu na descrição; o caminho `youtube/` do pedido é `video/youtube/`)
- `/home/user/B-ias-magras-/video/youtube/comentarios_au2_v2.json` (146 comentários do AU2)
- `/home/user/B-ias-magras-/video/scripts/previa_s60.py` (a única narração já escrita para o 60 Segundos)
- `/home/user/B-ias-magras-/sessenta/docs/ARQUITETURA.md`, `CONTRATO.md`, `sessenta/logs/*.json`, `video/remotion/src/sessenta/*.tsx`

---

## 0. Resumo do estilo

Narrador em primeira pessoa do singular ("eu fiz", "eu explico"), falando direto com o público ("vocês"). As IAs são tratadas como personagens: ganham cor, modelo e papel, e a graça sai do contraste entre o que a IA pensa (texto do log) e o que acontece. Frases curtas, gíria leve, bordões de virada ("Só que...", "Guarda isso"), memes como soco de piada, efeitos sonoros marcando cada morte ou virada, e um placar com prêmios no fim.

---

## 1. Tom do narrador

**Pessoa.** AU2 e AU3 usam "eu" para quem faz o vídeo ("eu sorteei com Python", "eu explico", "Eu fui conferir no log"). As IAs são sempre 3ª pessoa ("ele pensa", "o Vermelho, da Mistral"). O público é "vocês". A prévia do 60 Segundos (`previa_s60.py`) usa "a gente" ("a gente deu uma revanche", "a gente avisou o que deu errado"). Para o 60 Segundos, decidir uma só: recomendo "a gente" para não quebrar a prévia que já está gravada.

**Gírias e jeito de falar.** Coloquial sem exagero: "pra", "tá", "tá frita", "o defunto", "Sério.", "Relaxa, ninguém decora todos.", "Bora.", "Por pouco.", "vivíssimos". Reticências em pausa de suspense (34 nos roteiros AU3). Nada de "kkk" na narração (isso fica nos comentários).

**Ironia.** Premiar o erro. Impostor "vegano" e "impostor medroso, não" (AU2). O impostor que denuncia o próprio corpo. O Médico que dá escudo ao assassino. O Palhaço que ganha porque a tripulação o expulsa.

**Como zoa as IAs.** Sempre com a fala ou o pensamento da própria IA contra ela. O narrador não xinga a IA: ele repete o raciocínio dela com a aspa e deixa o resultado falar. Exemplo: "O Médico gastou o escudo no assassino." Não é insulto: é o fato, com cara de piada.

**Apelidos e rótulos.** Cor + papel + modelo: "O Vermelho, da Mistral: Gangster." (AU3). "um Claude Haiku", "um Gemini", "um GPT" (AU2). Papel como nome: "o Palhaço", "o Xerife", "a Juíza". Títulos de prêmio: "Médico do ano", "Assassino da temporada", "Motorista do duto".

**Bordões recorrentes.**
- "Bora." (abertura de cada bloco)
- "Guarda isso." / "Grava essa mentira, porque ela vai cobrar o preço." (plantar o gancho)
- "Só que..." (virada; 12 vezes no AU3, 10 no AU2)
- "E aí..." e "E olha..." (encadear)
- "Repara:" (chamar atenção pro detalhe)
- "Eu fui conferir no log." (checagem em voz alta; AU2)
- "Deixa nos comentários, que eu leio todos." (fechamento)
- "Te vejo lá." (despedida do extra; prévia)

**Frases reais (exemplos).** Sem as marcações `[[...]]`.

1. "Quinze inteligências artificiais jogando Among Us." (AU3, `a01`)
2. "Sério. Vocês me encheram de ideias boas... mas infelizmente não consegui fazer todas." (AU3, `a03`)
3. "Primeiro, o elenco. O Grok saiu: no último vídeo ele foi caro e jogou mal." (AU3, `n01`)
4. "Não precisa decorar: quando cada uma aparecer, eu explico." (AU3, `n02`)
5. "Só você." (AU3, `n04`, depois de "Os outros não veem nada disso.")
6. "O impostor. O Médico gastou o escudo no assassino." (AU3, `p102`)
7. "A mentira do impostor matou o Xerife." (AU3, `p109`)
8. "Expulsaram o Palhaço. Ele ganhou, e a partida acabou ali mesmo." (AU3, `p113`)
9. "O assassino... denunciou o próprio corpo." (AU3, `p207`)
10. "Sem medo de Palhaço." Eles aprenderam. (AU3, `p304`)
11. "Ela comprou a testemunha." (AU3, `p307`)
12. "O impostor mais rápido da história do canal." (AU3, `p305`)
13. "Vocês pediram impostor mais forte. Acho que exagerei." (AU3, `f01`)
14. "E as quatro partidas, com quinze IAs pensando a cada tique, custaram menos de dois dólares." (AU3, `f03`)
15. "Não funcionou." (AU2, `a02`, depois de a IA ser expulsa pela própria mentira)
16. "Impostor vegano, sim." (AU2, `a03`)
17. "Relaxa, ninguém decora todos. Só guarda isso: cada IA só sabe o próprio papel." (AU2, `n01`)
18. "Sessenta segundos. É o tempo que uma família tem pra salvar tudo o que importa antes da bomba cair." (60s, `previa_s60.py`)
19. "Eles parecem mais felizes. A radiação é a mesma." (60s, `previa_s60.py`, aviso CC0)
20. "Duas partidas, zero dias." (60s, `previa_s60.py`)
21. "Ah, e antes de você ir..." (AU3, `x01`)

---

## 2. Estrutura

| Bloco | Como faz | Exemplo real |
|---|---|---|
| Gancho (30 s) | Cena cortada no meio de um momento forte, com o resultado entregue cedo e a promessa de explicar | AU3 `a01`: "E essa aqui, o Preto, ganhou a partida sozinho... [...] Daqui a pouco você vai ver como." AU2 `a01`: começa numa reunião, com a IA já mentindo, e termina "Será que funcionou?" |
| Apresentação de cada IA | Um card/tela com a cor, o modelo e o papel; a narração diz só o que importa para a piada | AU3 `p301`: "O Preto, um Claude, de Faxineiro, o que some com os corpos." |
| Regras | Em pedaços, no momento em que a coisa aparece. Nunca um bloco de regras de uma vez. Cada regra vem com um "não precisa decorar" ou "relaxa" | AU3 `n02`, AU2 `n01` |
| Jogada a jogada | "Tique N, em <Sala>." + "Ele pensa:" + ação + consequência + [[p]] (soco) + meme | AU3 `p103`: "Tique nove, em Escudos. O Vermelho... pensa: '...' E recruta o Branco. [[p]]" |
| Pensamento ou fala da IA | Inline com aspas ("Ele pensa: '...'") e, nas reuniões, balões de chat com voz própria; o narrador entra entre as falas | AU3 `p107` a `p113` (CH): N, falas, N, falas... |
| Fechamento de partida | Uma frase com o resultado, o sfx de virada e um número que resume ("quatro mortes e quatro corpos") | AU3 `p113`, `p317`, `p408`: "Tique vinte. O reator explodiu." |
| Placar | Contagem por time, com ironia no fim | AU3 `f01`: "Palhaço dois, impostores dois, tripulantes... zero." |
| Prêmios | Lista de títulos no formato "Título: nome, o modelo. Motivo em uma frase" | AU2 `f01b` (Assassino da temporada, Impostor mais frio, Motorista do duto, Médico do ano, Xerife, Profissão mais perigosa) |
| Final | Pergunta para os comentários, CTA e "Até o próximo!" | AU3 `f04`, AU2 `f02` |
| Extra | Teaser montado, fora da partida, com "Ah, e antes de você ir..." e "Te vejo lá." | AU3 `x01` (prévia do episódio 4, com fantasmas) |

**Gancho dos primeiros 30 s.** Três jeitos usados: (a) entregar o resultado cedo e prometer o como (AU3); (b) começar no meio de uma reunião com a IA mentindo (AU2); (c) fazer a pergunta que o vídeo responde. Para o 60 Segundos: começar pelo desfecho mais forte de uma das 4 partidas ou pela frase "quem fica do lado de fora" (a cena de erro do GPT Luna serve bem), com um "[FATO DO LOG]".

**Apresentação das IAs.** Sempre três informações: cor/nome, modelo (com empresa), papel. Na partida, "revela" em lista rápida ("O Amarelo, do GPT: Envenenador."). No 60 Segundos, cada partida abre com o nome da IA e o modelo (`or:openai/gpt-5.6-terra`, `minimax-m3.1-flash`, `sonnet`).

**Regras sem ficar maçante.** Cada regra em uma ou duas frases, entregue na hora em que a tela mostra. Frases de alívio ("Relaxa", "Não precisa decorar") reduzem a sensação de prova. Quando a regra é complexa, o card visual faz o trabalho e a narração só comenta.

**Jogada a jogada.** Estrutura fixa: (1) horário ou tique ("Tique nove, em Escudos."), (2) o que a IA pensa, (3) a ação, (4) a consequência, (5) um soco de câmera ou meme. Cada cena de jogo tem de 1 a 3 jogadas, e a narração acompanha a ação por âncora (ver seção 3).

**Quando cita o pensamento ou a fala.** Dois modos:
- Inline na narração: `Ele pensa: "..."` (20 ocorrências no AU3). A aspa é o pensamento do log, às vezes encurtado.
- Chat (`CH`): as falas da reunião entram como balões coloridos, com voz própria por cor. O narrador comenta entre elas ("Repara:", "E o Verde, que é Gemini, responde com toda a calma do mundo..."). O pensamento secreto aparece no balão, puxado do log pelo builder (`pensamento_da_fala`).

**Como fecha cada partida.** Um sfx de virada (`[[s:death]]`, `[[s:explosion]]`, `[[s:crowd-laugh]]`), uma frase com o resultado e um número ("Quatro mortes e quatro corpos escondidos"), depois um meme. Quando a partida tem um detalhe irônico, ele vem por último.

**Placar, prêmios, final e extra.** Placar com ironia (AU3: "Acho que exagerei."). Prêmios em lista com cara de premiação, cada um com o nome da IA e o motivo, sempre com fato do log. Final com pergunta e CTA. Extra com teaser fora da partida, marcado como tal na descrição.

---

## 3. Ritmo e tamanho

Medidas tiradas de `roteiro_au3.py`, `roteiro_au2.py` e `video/remotion/public/timeline_au3.json` (AU3, 24,9 min):

| Medida | AU3 | AU2 |
|---|---|---|
| Cenas narradas (texto do narrador) | 73 | 88 |
| Palavras do narrador (fora de chat) | 2.476 | 2.213 |
| Palavras do narrador, total com interlúdios de chat | 2.798 | 2.984 |
| Média de palavras por cena narrada | 34 (mediana 36) | 25 |
| Falas de IA nas reuniões | 39 falas, média 21,6 palavras, cortadas até ~135 caracteres | n/d |
| Interlúdio do narrador dentro do chat | 24 linhas, média ~13 palavras | 17 cenas de chat |
| Velocidade de fala (palavras por segundo falado) | ~2,2 (~133 palavras/min) | n/d |
| Média geral de narração (palavras/min de vídeo) | ~112 | n/d |
| Tempo com narração (de 1ª a última palavra de cada cena) | ~85% | n/d |
| Cenas de jogo (`AU3Jogo`) | 33, média de 17 s cada | 20 |
| Marcas: memes `[[m:]]` / efeitos `[[s:]]` / soco `[[p]]` / legendas `[[t:]]` | 44 / 58 / 12 / 0 | 39 / 34 / 12 / 12 |

**Palavras por fala.** Narrador: 25 a 35 palavras por cena. Falas de IA: 20 a 25 palavras (o gerador corta em fim de frase). Interlúdio do narrador no chat: 10 a 15 palavras.

**Densidade.** A narração ocupa a maior parte do vídeo (~85%). Os silêncios são curtos e marcados (pausa `pad` de 0,5 s por padrão, ou `[[s:whoosh]]` como transição). Cenas de vinheta (título, placar, fim) não têm trilha (`SEM_TRILHA`).

**Total para ~25 min.** Com a taxa do AU3, o total fica em ~2.800 palavras de narrador. Para o 60 Segundos a conta muda, porque cada dia já aparece escrito na tela (o diário). Ver a seção 6 para o orçamento real.

**Âncoras (evento ↔ palavra).** Cada cena de jogo pode ter `ancoras=[(evento, 'palavra da narração'), ...]`: o evento da partida acontece no instante em que o narrador fala aquela palavra. Quem faz a ponte é `remotion/src/amongus3/tempo.ts`:
- entre duas âncoras, a partida acelera (até `vmax`, padrão 2) ou desacelera (até VMIN 0,3);
- se o salto é grande demais, a cena corta numa pausa da narração e chega na âncora seguinte;
- na reunião a cena nunca atravessa: desacelera ou vira corte ("depois da reunião").
Resultado: 24 das 33 cenas de jogo do AU3 têm âncoras. A palavra precisa existir no texto da narração (o builder compara com o alinhamento de palavras).

---

## 4. Regras de fato

O roteiro só narra o que está no log. Como o AU3 garante isso:

1. **Falas de reunião são copiadas, não escritas.** `gerar_falas_au3.py` lê `amongus/logs3/partidaN.json` e escolhe, por (cor, rodada), a fala que entra. Corta só em fim de frase (limite de 135 caracteres, ou maior quando a frase é a comentada). Gera `falas_au3.json`, que o roteiro lê com `F(n, i, a, b)`. Se alguma fala falta no log, o script lista em `faltou`.
2. **Pensamentos vêm do campo `pensamento` do log.** Nos balões, o builder puxa o pensamento da mesma fala. Na narração, a aspa é do log, mas pode vir encurtada ou com pequena normalização.
3. **Eventos de jogo vêm do log.** Cada âncora usa um evento real (`morte`, `recrutamento`, `xerife`, `foto`, `sabotagem`, `duto`, `escudo`, `portas`, `reuniao`...). Os tiques, quem morreu e quem votou em quem são lidos do log.
4. **Resumo conferido antes de gravar.** `video/youtube/au3/destaques_p1..p4.md` tem o elenco (papel e modelo de cada cor) e a linha do tempo (evento por tique). É a folha de conferência para cada afirmação do roteiro.
5. **Opinião é permitida, fato não.** "E quando o Xerife erra, quem morre é ele." é comentário do narrador (não vem do log); está ok porque é uma regra do jogo, não um fato da partida. Já "o Xerife atirou no Cinza" é fato e precisa estar no log.

**Verificação feita nesta análise.** Testei cinco trechos do AU3 contra os logs. "tarefa visual", "Sem medo de Palhaço" e "vou me transformar em Vermelho" estão no log. "no jogo dois ele foi Palhaço" é uma paráfrase fiel de "no jogo 2 ele foi Palhaço". A frase do narrador "quem morre é ele" não está no log e é opinião (não é aspas). Conclusão: as aspas são fiéis em espírito, mas não são cópia literal.

**Para o 60 Segundos, a regra deve ser mais forte:**
- Toda fala de IA e todo pensamento entram literalmente de `coleta.falas[].fala` e `coleta.falas[].pensamento`, ou de `dias[].resposta.pensamento` e `dias[].diario`. Se precisar cortar, corta em fim de frase (como o AU3), e o corte fica marcado.
- Todo número (dias, mortes, tiques, segundos) vem do log. Na prévia, "Aos cinquenta e um segundos" é um tempo da partida; deve vir da soma de `tempoMs` dos registros (a conferir, não verifiquei a conta).
- Cada `[FATO DO LOG]` do esqueleto (seção 6) precisa ser conferido no JSON antes da gravação.
- Criar um conferidor (ainda não existe) que confira os números e as aspas do roteiro contra `sessenta/logs/<semente>_<ia>.json`.

---

## 5. Formato técnico (`roteiro_*.py`)

### Estrutura do arquivo

```python
CHAPTERS = {'abertura': 'Abertura', 'p1': 'Partida 1 · ...', 'fim': 'Placar e encerramento', 'extra': 'Extra'}

def comp(name, **props): return dict(type='component', name=name, props=props)
def titulo(kicker, title, sub='', cor='#ff4d4d'): ...        # AUTitulo
def N(id, chapter, visual, text, **kw): return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)
def CH(id, chapter, visual, falas, **kw): return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)
_FALAS = json.loads(Path(__file__).with_name('falas_s60.json').read_text())   # padrão do AU3
def F(n, i, a=0, b=None): return [tuple(x) for x in _FALAS[f'{n}-{i}'][a:b]]

SCENES = [ ... ]   # ordem da narração
CUES = [('a01', 'sneaky-snitch', 0), ...]          # uma música por bloco, sem repetir faixa
SEM_TRILHA = ['AUTitulo', ...]                       # vinhetas sem música
```

### Campos de uma cena

- `id`: `a01`, `n02`, `p107`, `p107v`, `p113`... (letra do bloco + número; sufixo `v` para votos, `e` para ejeção, `c` para chamado; o AU3 usou esse padrão).
- `chapter`: a chave de `CHAPTERS`.
- `visual`: `comp('Nome', **props)`: o componente do Remotion e o que ele recebe.
- `text` (cena de narrador) ou `falas` (cena de chat, lista de `(quem, texto)`, em que `quem` é `'N'` ou o nome da cor).
- `pad`: segundos extras depois da fala (padrão 0,5). Use 1,5 a 3 em placares e votos.
- `lead`: segundos antes da fala (padrão 0,25; títulos, 0,5).
- `min`: duração mínima (votos: 7,5 s por padrão, para dar tempo de ler quem votou em quem).

### Marcações no texto da narração

| Marca | Efeito |
|---|---|
| `[[m:meme:right:2.5]]` | Meme/GIF (catálogo `gifs/catalog.json`), posição, duração em segundos |
| `[[s:efeito:0.5]]` | Efeito sonoro (catálogo `sfx/` e `sfx_au2/`), volume |
| `[[p]]` | Soco de câmera (corte seco antes de uma virada) |
| `[[t:TEXTO:1.8:#ff3b3b]]` | Legenda de destaque em tela cheia (usada no AU2; zero no AU3) |
| `[[cc]]` | Declarado no docstring; não usado nos roteiros AU2/AU3 |
| `...` | Reticências são só texto (suspense). O builder apenas tira as que vêm logo antes de uma marca |

### Componentes (AU3) e o que recebem

- `AUTitulo(kicker, title, subtitle, color)`: título/vinheta
- `AU3Comentarios(passo)`, `AU3Ideias(marca)`, `AU3Nave`, `AU3Elenco(partida, quemSaiu, novos, gatilhoSaiu, gatilhoNovas)`, `AU3Papeis(passo)`, `AU3Shhh`: abertura e "o que mudou"
- `AU3Jogo(partida, foco, tique | evento+antes, papeis, seg, chat, ancoras, vmax)`: cena de jogo; `foco` é a cor seguida
- `AU3Revela(partida, foco)`: revela os papéis do início da partida
- `AU3Chamado(partida, indice)`, `AU3Reuniao(partida, indice)`, `AU3Votos`, `AU3Ejecao`, `AU3Resultado`: reunião em etapas
- `AU3Fim(partida, foco)`, `AU3Placar(corte)`, `AU3Premios`, `AU3Previa`: fechamento e extra

Eventos aceitos em `evento=` e `ancoras=`: dicionários `{'tipo': ..., ...}` no formato do log: `morte` (`vitima`), `recrutamento` (`alvo`), `xerife` (`xerife`, `alvo`), `foto` (`cor`), `sabotagem` (`cor`, `subtipo`, `tique`), `duto`, `escudo` (`assassino`), `portas`, `conserto`, `limpeza`, `transformacao`, `invisivel`, `chat` (`cor`, `contem`), `reuniao` (`chamador`). Um `tique` (número) também vale.

### Para o 60 Segundos (proposta, nada disso existe ainda)

O 60 Segundos já tem composições no Remotion (`video/remotion/src/Root.tsx`), mas com outros nomes e sem âncoras:
- `S60Coleta3D` (props: `arquivo`, `ia`, `rapido`, `semFx`): duração fixa de 1950 quadros = **65 s** (60 s de coleta + 5 s). Não dá para encurtar a coleta sem mudar o componente.
- `S60Dia` (props: `arquivo`, `dia`, `vel`): um dia no abrigo. `vel` acelera a reprodução.
- `S60Coleta` (versão 2D, 1920 quadros = 64 s), `S60Previa` (segmentos `card`, `video`, `dia`, `titulo`).
- Os logs precisam ser convertidos antes: `node sessenta/ferramentas/partida_remotion.mjs ep5_gpt ep5_minimax ep5_claude` (hoje só `ep5_gpt.json` está em `public/sessenta/partidas/`).

Cena proposta:

```python
N('g01', 'gpt', comp('S60Coleta3D', arquivo='ep5_gpt', ia={'nome': 'GPT TERRA', 'cor': '#0b7a5f'}),
  'Texto da narração da coleta, com [[m:...]] e [[s:...]] como no AU3.')
N('g02', 'gpt', comp('S60Dia', arquivo='ep5_gpt', dia=1, vel=2), '...')
```

Âncoras para o 60 Segundos (a implementar): ligar palavra da narração a `registro` (índice da ação, com `tempoMs`) e a `dias[n]` (dia). O `tempo.ts` é genérico (recebe pares quadro da cena / quadro da partida), então o componente precisaria expor esse mapa.

Observação: `ARQUITETURA.md` fala em 3 IAs (Claude, DeepSeek, GPT). O plano atual tem 4 partidas (GPT Terra, MiniMax, DeepSeek, Claude). O doc de arquitetura está desatualizado nesse ponto.

---

## 6. Esqueleto para o 60 Segundos (25–30 min)

Orçamento: ~25 min 30 s. Palavras de narração: ~2.250 (ritmo de ~88 palavras/min, porque os dias já estão escritos na tela; ver a nota no fim).

Legenda: **[FATO DO LOG]** = informação que precisa ser conferida no JSON antes de virar narração. Os fatos já checados nesta análise estão marcados como "(verificado)".

| # | Bloco | Duração | Palavras | Conteúdo |
|---|---|---|---|---|
| 1 | Abertura / gancho | 1:00 | 110 | Gancho de 30 s (60 palavras) + o que é o jogo (30 s) |
| 2 | Regras do jogo | 1:45 | 190 | Coleta de 60 s, o abrigo em dias, quem fica de fora, mesma casa para todas |
| 3 | Aviso dos modelos CC0 | 0:40 | 70 | Curto e engraçado; o bordão da prévia ("A radiação é a mesma.") |
| 4 | Erros de gravação | 1:20 | 150 | GPT Luna 2x e DeepSeek 2x na coleta |
| 5 | Partida 1: GPT Terra (30 dias) | 4:40 | 350 | Card + intro 0:25, coleta 1:05, dias 2:45, fecho 0:25 |
| 6 | Partida 2: MiniMax (23 dias) | 4:15 | 330 | Card + intro 0:25, coleta 1:05, dias 2:20, fecho 0:25 |
| 7 | Partida 3: DeepSeek | 4:15 | 330 | Mesma estrutura; log ainda não existe |
| 8 | Partida 4: Claude (grande final, 51 dias) | 5:50 | 410 | Card + intro 0:25, coleta 1:05, dias 3:35, fecho 0:45 |
| 9 | Placar e prêmios | 1:30 | 170 | Placar por IA + lista de prêmios |
| 10 | Fim / encerramento | 0:30 | 50 | Pergunta para os comentários, CTA |
| 11 | Extra | 0:45 | 90 | Teaser do próximo episódio (a decidir) |
| | **Total** | **~25:30** | **~2.250** | |

### 1. Abertura e gancho (1:00, ~110 palavras)
- 0:00–0:30 (~60 palavras): cena cortada de um momento forte de uma das partidas, sem explicação, depois "Daqui a pouco você vai ver como." Sugestão: desfecho da partida de Claude ou a primeira vez que alguém "fica do lado de fora". [FATO DO LOG: escolher o momento e conferir a frase no log.]
- 0:30–1:00 (~50 palavras): o que é o 60 Segundos (`previa_s60.py` já tem o texto: "Sessenta segundos. É o tempo que uma família tem pra salvar tudo o que importa antes da bomba cair.").
- Trilha: uma música só, sem repetir nas outras partes.

### 2. Regras do jogo (1:45, ~190 palavras)
- Coleta: 60 segundos, o pai (ou a família) corre pela casa e leva o que consegue para o abrigo. Quem não chega morre ou fica do lado de fora. Fato de estrutura (ARQUITETURA.md).
- Abrigo: um dia por vez; cada dia tem situação, evento com escolha da IA, ração de sopa e água, expedição e fim.
- Cada IA recebe o que vê e responde com uma ação e um pensamento secreto (do log: `coleta.falas[].pensamento`).
- Mesma casa, mesma família, mesmos itens para todas as IAs (ARQUITETURA.md; `sessenta/CONTRATO.md`).
- Escrever cada regra em uma ou duas frases, com um card visual. Bordão: "Relaxa, ninguém decora todos."

### 3. Aviso dos modelos CC0 (0:40, ~70 palavras)
- Curto e engraçado. Base da prévia: "Os modelos oficiais têm direitos autorais, então a família foi trocada por uns bonecos de domínio público. Eles parecem mais felizes. A radiação é a mesma."
- Conferir a licença antes de afirmar "CC0 (Kenney)": o card da prévia diz isso. [CONFERIR: licença dos modelos em `video/youtube/creditos_assets.md` e em `video/remotion/public/sessenta/3d`.]

### 4. Erros de gravação (1:20, ~150 palavras)
Tom: "a gente avisou o que deu errado". Os erros são de gravação, não de jogo.
- **GPT Luna, 2 partidas que terminaram com o pai do lado de fora no dia 0.** Logs: `sessenta/logs/ep1_gpt_luna.json` e `ep1_gpt_luna_revanche.json`. (verificado: as duas têm `final.id = pai_fora` e `dia = 0`). A segunda tem no campo `aviso` um texto de revanche que conta à IA o que deu errado (verificado). [FATO DO LOG: o que a IA fez no tique que deu errado, em cada uma.]
- **DeepSeek, 2 partidas com o mesmo fim na coleta.** Logs: `ep1_deepseek_coleta1.json` e `ep1_deepseek_coleta2.json` (verificado: ambas `pai_fora`, dia 0). [FATO DO LOG: a causa do erro, se estiver registrada; não está nos JSONs que li.]
- Opcional, a decidir: `ep1_deepseek_bug.json` e `ep1_minimax_bug_ids.json` também são erros de gravação com log. Não estão no plano.
- Não afirmar causa (bug de código, falta de crédito, etc.) sem conferir.

### 5–8. As quatro partidas (~5 min cada; mesma estrutura)

Estrutura de cada partida:
1. **Card** (5 s): nome da IA e modelo. [FATO DO LOG: `provider` do JSON.]
2. **Intro** (0:25, ~40 palavras): quem é, por que está na casa, o que se espera dela. Sem revelar o resultado.
3. **Coleta 3D** (1:05, fixo pela composição, ~100 palavras): início (primeira ação, verificada em `registro[0]`), meio (item-chave), fim (o que entrou no abrigo e quem ficou de fora). [FATO DO LOG: `coleta.resultado` (pessoas, itens) e os registros do tique final.]
4. **Dias no abrigo**: os dias não cabem em velocidade normal. Dia com evento dura ~15 s e dia sem evento ~11 s, com 2 linhas de diário (fórmula de `Dia.tsx`: 2,6 s de abertura + 1,2 s ou 5,5 s com evento + 2,4 s por linha + 2,2 s; `vel` acelera). Nos logs da temporada 5 a média é de 4 a 6 linhas por dia (GPT 5,2; MiniMax 6,0; Claude 4,0), então a conta sobe. Estratégia:
   - dias marcantes (morte, expedição, o dia com evento mais forte) em `vel=1`, com narração;
   - dias comuns em `vel=2` ou mais, sem narração, ou em card com resumo de intervalo ("dias 7 a 17: ...").
   - Por partida, 3 a 6 dias com narração, o resto em card.
   - [FATO DO LOG: contar dias com evento, mortes, expedições e a lista de dias marcantes.]
5. **Fecho** (0:25 a 0:45, ~40–50 palavras): o final (id, dia e motivo do JSON) em uma frase, com um sfx e um meme.

**GPT Terra (Partida 1, ~5:00 incl. card e fecho, ~350 palavras).** Arquivo: `sessenta/logs/ep5_gpt.json`.
- Modelo: `or:openai/gpt-5.6-terra` (verificado).
- Dias: 30 (verificado). Final: `ninguem_adulto`, dia 30, motivo "nenhum adulto vivo no abrigo" (verificado). Dias com evento: 20 de 30 (verificado).
- Custo: 0,17 USD (verificado em `uso.custo`).
- [FATO DO LOG: detalhes da coleta e dos dias marcantes.]
- Atenção: a prévia (`previa_s60.py`) diz "GPT TERRA: 12 DIAS", mas com o log `ep1_gpt.json`, de outra semente. Os dois números vão conflitar no mesmo ano. Decidir se a prévia é atualizada ou se o vídeo deixa claro que é outra casa.

**MiniMax (Partida 2, ~4:15, ~330 palavras).** Arquivo: `sessenta/logs/ep5_minimax.json`.
- Modelo: `or:minimax/minimax-m3.1-flash:free` (verificado; é o modelo gratuito).
- Dias: 23 (verificado). Final: `ninguem_adulto`, dia 23 (verificado). Dias com evento: 13 de 23 (verificado).
- Custo: 0 (o modelo é `:free`). Não comparar com o custo do GPT.
- [FATO DO LOG: detalhes da coleta e dos dias marcantes.]

**DeepSeek (Partida 3, ~4:15, ~330 palavras).** Não há `sessenta/logs/ep5_deepseek.json`. Antes de escrever, gerar o log com a mesma semente `ep5` (ver `sessenta/jogo.mjs`). [FATO DO LOG pendente: modelo, dias, final.] Não reaproveitar `ep1_deepseek` (semente diferente, 8 dias).

**Claude (Partida 4, grande final, ~5:50, ~410 palavras).** Arquivo: `sessenta/logs/ep5_claude.json`.
- Modelo: `sonnet` (verificado, `provider`).
- Dias: 51 (verificado). Final: `expulso`, dia 51, motivo "ninguém dentro do abrigo" (verificado). Dias com evento: 37 de 51 (verificado).
- Bloco mais longo do vídeo. O tempo de dias (3:35) precisa de corte: os dias com evento em `vel=1` somam quase 3 min sozinhos. Mostrar os dias com evento e resumir os demais em cards.
- [FATO DO LOG: o que aconteceu no final de Claude (quem saiu e como).]

### 9. Placar e prêmios (1:30, ~170 palavras)
- Placar (modelo do AU2 `f01` e do AU3 `f01`): "Placar final. [...] Tripulantes... zero." Aqui, quantos dias cada IA sobreviveu e se alguém chegou ao final de "abrigo com adulto".
- Prêmios (no formato do AU2 `f01b`), cada um com nome, IA e motivo em uma frase. Sugestões, todas a conferir: Mais dias (Claude, 51, verificado), Primeiro a ficar de fora (GPT Luna, dia 0, verificado nas duas partidas de erro), Pior coleta (DeepSeek, dia 0, verificado nas duas partidas de erro), Mais expedições (a conferir nos `dias[].expedicao`).
- [FATO DO LOG em cada prêmio.]

### 10. Fim (0:30, ~50 palavras)
- Pergunta para os comentários ("qual IA você quer ver no próximo?"), CTA de inscrição, "Até o próximo!".

### 11. Extra (0:45, ~90 palavras)
- Teaser fora da partida, marcado como tal. Modelo: `x01` do AU3 ("Ah, e antes de você ir... [...] Te vejo lá."). Decidir o que é: prévia do episódio 2, ou o trailer do 60 Segundos. Não usar nada que não esteja decidido.

---

## 7. Pontos para decidir ou corrigir antes de escrever

1. **DeepSeek sem log na semente ep5.** Sem ele, a partida 3 não pode ser escrita.
2. **Prévia com "GPT TERRA: 12 DIAS"** (log de outra semente). Conflita com os 30 dias do episódio.
3. **Pessoa do narrador.** Escolher "a gente" (como na prévia) ou "eu" (como no AU3) e manter.
4. **Orçamento de dias.** Claude com 51 dias e GPT com 30 não cabem em velocidade normal. Sem corte, o vídeo passa de 30 min. Plano atual: dias marcantes em `vel=1`, o resto em card. Definir o número de dias marcantes por partida.
5. **Densidade.** Com ~2.250 palavras para 25–30 min, a narração fica ~20% menos densa que o AU3. Se quiser a densidade do AU3 (~112 palavras/min), são ~400 a 500 palavras a mais, sobretudo em coleta e dias marcantes.
6. **Âncoras no 60 Segundos.** Hoje não existem. Sem elas, a narração não acompanha o evento palavra a palavra; o vídeo fica como "narrador por cima do replay". Decidir se vale implementar.
7. **Pronúncia.** O builder do AU3 tem um dicionário (`bt.PRONUNCIA`, exemplo "Haiku" → "Raicu"). Para o 60 Segundos, incluir nomes de modelos e personagens ("Terra", "Luna", "MiniMax") se a voz ler errado.
8. **Aspas não literais.** No AU3, algumas aspas são paráfrases. No 60 Segundos, decidir: aspas literais do log (mais trabalho, zero dúvida) ou paráfrase marcada.
9. **Custo.** Só o GPT Terra tem custo registrado (0,17 USD). MiniMax é grátis e o Claude aparece com custo zero no log. Não escrever "custou X" para as quatro sem conferir.
