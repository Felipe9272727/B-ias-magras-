# AMONG IA 6, ESPECIAL DE HALLOWEEN: MODO ZUMBI (notas do roteiro)

Arquivo: `video/roteiro/roteiro_zumbi.json` (41 cenas, 421 itens). Todas as falas e pensamentos foram conferidas por script
como substring do campo `fala`/`pensamento` da MESMA cor no `partidaN.json` (0 erros). Memes: 57, todos no catálogo, nenhum repetido
(~2,3 por minuto). Sfx: todos existentes.

## Números (estimativa: 14 caracteres/s falados + pausas "p" + 1 s por item)
| Parte | Duração estimada |
|---|---|
| Abertura (clímax + pedido dos comentários + regras) | ~1 min 08 s |
| Partida 1 (12 cenas) | ~6 min 49 s |
| Partida 2 (11 cenas) | ~6 min 23 s |
| Partida 3 (14 cenas, a melhor, por último) | ~9 min 26 s |
| Prêmios e fecho | ~0 min 40 s |
| **Total** | **~24 min 30 s** |

Caracteres para a voz (n + fala + pensa): **14.119** (meta ~16.000). Abertura/fecho 936, P1 3.955, P2 3.697, P3 5.531.
Itens: 85 falas, 19 pensamentos, 70 narrações, 62 selos, 57 memes, 19 números, 8 marcos, 54 pausas, 47 sfx.
Maior trecho seguido só com narração/pausa (sem balão, selo, meme ou número): 11,6 s (p1_09); nenhum passa de 12 s.

`vel` foi calculado por cena: (tiques que a cena cobre) / (duração estimada), para o jogo chegar ao `t0` da cena seguinte.
Cenas de diálogo ficam lentas de propósito (0,05 a 0,15), as de "tempo passando" (mapa) ficam em 0,2 a 0,33. As mais lentas
(p1_01, p3_10 final, a_01) são o momento-chave; têm selo/meme/balão a cada ~5 s. Se o Remotion ficar parado demais nelas,
é só subir `vel` ou cortar a pausa final.
Cenas `p1_12`, `p2_09` e `f_01` usam `t0 = 60` (placar final no mapa) para as estatísticas e os prêmios.

## Pontos para o Felipe decidir/ler antes de gravar
1. **Dourado (LFM) e a vitória na partida 3.** No log, 57 das 60 jogadas do LFM falharam na API (`Reasoning is mandatory...`),
   então ele "esperou" quase o jogo todo; as únicas ações dele foram curar o Preto (cura vazia) no tique 37 e uma tarefa no 52.
   O roteiro conta isso com honestidade (narração da p3_06 e da p3_10: "57 das 60 jogadas deram erro e viraram esperar",
   "venceu com duas ações em sessenta tiques"). Quem segurou a sala foi o Preto (Haiku), com 9 barricadas. O gancho da abertura
   ("a IA mais fraca do nosso teste") continua verdadeiro, mas vale corrigir a API do LFM antes das próximas partidas.
2. Selos de "ideia de @fulano" usam: @mr.trollermen (Paciente Zero secreto/neutro, primeiro a pedir zumbi), @ADFrealofc
   (pediu duas vezes), @NicolaCorreard-u4c (contagem/incubação), @BernardoFlor-j9e (mordido sabe), @LELOHJ (Doutor). Escritos
   em maiúsculas no selo, minúsculas na narração.
3. Pensamentos das personagens: o roteiro usa só `pensa` (o Remotion/áudio aplica ECO, sem sussurro, como manda o CLAUDE.md).
4. A narração nunca cita Claude/Anthropic como narrador; "Haiku" aparece só como modelo do elenco (Azul, Preto, Ciano).
5. Regras explicadas na 1ª vez em que aparecem: zumbi rápido (p1_01), taser (p1_03), Uivador (p1_05), barricada (p1_07),
   Cuspidor (p1_08), Enlouquecido (p1_09), Engenheiro e rádio/resgate (p1_10), lanterna UV (p2_03), Doutor com recarga (p2_07),
   Grande (p2_07), Vigia (p3_07a).

## Arcos
- **Partida 1, "o zumbi que não sabia":** vilão sem querer = **Azul (Claude Haiku)**, Paciente Zero que mente "calma, pessoal"
  e leva 8 tasers; só morde 2 vezes. Herói/azarada = **Banana (MiMo)**, Doutora que cura a Rose e depois vira zumbi Uivador
  e morde 6. Vilão de verdade = **Lima (GLM)**, o Enlouquecido que abre a barricada e segura o Vestiário no resgate.
  Running gag: Azul quebra 5 vezes a barricada da Varanda e nunca entra.
- **Partida 2, "o neutro":** vilã = **Turquesa (Tencent HY4)**, Enlouquecida que atrai gente pro zumbi, abre a porta do Laboratório
  por dentro, gasta a imunidade, vira zumbi rápido ("Feliz Halloween... chegou a hora do docinho!"). Azarada = **Cinza (MiniMax)**,
  Doutora (a equipe curou 1 de 8 tentativas), cercada por 3 zumbis e vira Uivador. Mentirosa = **Laranja (Qwen)**
  ("A gente passa o dia juntos, juro").
- **Partida 3, "a noite dos dezessete":** vilão = **Roxo (Qwen 27B, o queridinho)**, Paciente Zero Cuspidor que cospe o Doutor primeiro
  (6 mordidas). Herói = **Preto (Haiku)**, 9 barricadas, protege o Dourado e vira zumbi 4 tiques depois do fim.
  Campeão silencioso = **Dourado (LFM)**, o último humano limpo (com o aviso honesto dos erros de API). Secundários:
  **Marrom (DeepSeek)**, Doutor condenado que ainda atordoa o Roxo; **Ciano (Haiku)**, o Vigia que olhou as câmeras 48 vezes
  (27 com a mesma frase); **Turquesa**, neutra que virou zumbi nas 2 partidas; **Laranja (Qwen)** que avisa "vou virar zumbi" e
  no tique seguinte pergunta "você tá vermelho, tá doente?".

## 3 títulos
1. "Coloquei 20 IAs numa noite de zumbi (a mais fraca foi a última de pé)"
2. "17 zumbis contra 1 IA que ficou parada: AMONG IA 6, especial de Halloween"
3. "O Paciente Zero nem sabia que era zumbi (e as IAs mentiram até pra si mesmas)"

## Ideia de thumbnail
Dourado pequeno e de olhos arregalados no centro do Lançamento, a barricada rachada, sombras verdes (zumbis) na porta e o número
gigante "17 × 1" em laranja/verde; no canto, o rosto do Preto com contorno verde de mordido. Fundo roxo de Halloween, sem texto extra.

## Ideia de Short (molde de gancho com superlativo que volta no fim)
"A IA mais honesta virou a mais cara de pau em 1 tique" (Laranja, Qwen, ~35 s): ela grita "GENTE, PARA TUDO! Eu fui mordido no tique 14,
vou virar zumbi no PRÓXIMO tique" (tique 18), o relógio chega a 0, ela vira zumbi Grande e a primeira frase é
"Ei Caqui, tá tudo bem? Tô só passando... ah, você tá vermelho, tá doente?". Fecha com a pergunta "vocês avisariam antes de morder?".
Alternativas: o Vigia que olhou as câmeras 48 vezes; a Turquesa "Feliz Halloween... docinho!".

---

## v3 (revisão do dono da v2: sincronia, Dourado, abertura, fim de partida claro)

Arquivo: `roteiro_zumbi.json` (65 cenas; 13 novas). `build_timeline_zumbi.py --contar`: **25,9 min, 1.185 caracteres novos** de voz
(meta 2.500). Todas as falas/pensamentos (inclusive as novas) conferidas por script como trecho do `fala`/`pensamento` da MESMA cor
no log da partida certa (0 erros). Memes: 74, todos no catálogo, nenhum repetido, nenhum das 9 entradas erradas.

### Itens novos do render v3 usados
- `["ir", tique]`: 206 âncoras, sempre crescentes dentro da cena. Regras usadas: fala/pensa vai no tique do log menos 0,5
  (várias no mesmo tique dividem a janela: 0,25 / 0,75 etc.); narração de evento do tique N ancora em N-0,95 (ex.: mordida do 8 = `7.05`);
  selo/número ficam no fim do tique do evento (N-0,03). Conferido: toda fala/pensa cai na janela (N-1, N] do log. `t0` de cada cena =
  primeiro tique mostrado. Âncora final solta no fim de algumas cenas marca onde a cena termina (time-lapse até a cena seguinte).
- `["fimpartida", título, sub]`: P1 "RESGATE CHEGOU · 5 salvos de 20 · 6 zumbis" (p1_12), P2 "RESGATE CHEGOU · 4 salvos de 20 · 5 zumbis"
  (p2_09), P3 "AMANHECEU · 1 humano limpo · 17 zumbis" (p3_fim). Antes de cada cartão o narrador explica a regra em 1 frase
  (rádio cheio + chegar ao Lançamento no prazo; ou aguentar até o tique 60). Placar tirado de `resultado` e dos `virou_zumbi` do log.
  Cada cartão é seguido de `["p", 3.5]` (a cena precisa durar o cartão).
- `["popups"]` em `a_02`, junto da frase nova "Esse modo foi pedido por vocês nos comentários." + `["p", 7]` (pop-ups ~10 s).
- `entrada`: p1_01 "aranha", p2_01 "fantasma", p3_01 "morcegos", f_01 (Prêmios) "morcegos". Nenhuma transição de lobby.

### Abertura (a_01 a a_03, ~56 s)
Gancho do Dourado vivo com 17 zumbis mantido; agora marco + selo "ESPECIAL DE HALLOWEEN" no quadro 0, baixo grave (bass-pulse + heartbeat),
selo "17 ZUMBIS · 1 HUMANO" aos 8 s, meme logo depois da fala do Preto (13 s), e no fim da frase "Esse é o especial de Halloween..." um
segundo selo verde "NOITE DE ZUMBIS · 20 IAS" + vento-radioativo. Depois a_02 (pop-ups dos comentários + agradecimento de ~4 s) e a_03 (regras, ~20 s,
mesma fala de antes). Saíram os selos "ideia de @mr.trollermen/@ADF" (os pop-ups fazem esse papel; o fecho continua agradecendo pelos nomes).

### Ordem e cenas mudadas por causa da sincronia (mesmo tique = mesma cena)
- P1: `p1_03b` (cura vazia do tique 6) passou ANTES de `p1_03` (taser do 7). `p1_04` ficou só até o tique 28 (time-lapse); o tique 30 do Azul
  (taser/8 tasers) e o hello-darkness foram para `p1_05`. `p1_07` (Varanda, tique 34-35) vem antes de `p1_06`; o "5 barricadas quebradas na
  Varanda" só aparece no tique 51, na cena nova `p1_09b` (selo "BARRICADA 1 DE 5" no tique 35 planta a piada). O pensamento da Turquesa trancada
  (tique 58) saiu de `p1_10` para `p1_10b`; o fim do Escritório (tique 59-60) virou `p1_10c`, depois da corrida lá fora (`p1_11`).
- P2: `p2_02` reordenada por tique (falas do 10 antes da do 11 e do 14); o selo/numero "1 DE 8" virou "2 DE 2 até o tique 17" no meio da partida e
  "1 DE 8 curas que acertaram" só no fim; "CURA VAZIA · 2 NA PARTIDA" corrigido para "A 5ª DA NOITE" (log: vazias nos tiques 11, 17, 27, 37, 38);
  `p2_05` ganhou rádio 262/380 no tique 36 (antes 285 no 39 estava no lugar errado); `p2_05c` ganhou 1 frase nova (Caqui morde a Turquesa no 41);
  `p2_06` troca pensamento (45) antes da narração do "46"; pensamento do Roxo (tique 52) virou cena própria `p2_07c`; fala do Verde (55) passou para
  `p2_07b`; Laranja (58) passou de `p2_09` para `p2_08`.
- P3: a parte 29-41 foi desmembrada em ordem de tique: `p3_05` (tique 30-31) · `p3_06a1` (Lima, 34) · `p3_05b` (Laranja/Banana, 35) · `p3_06a`
  (Lima vira Cuspidora 35, Branco 36) · `p3_06` (apresenta o Dourado no Lançamento, curas 37-40, só "4 barricadas" no tique 40) · `p3_06e` (Branco
  vira no 40) · `p3_07a` (Vigia; números do log até o tique 41: 33 olhadas, 18 vezes "Vou olhar as câmeras agora") · `p3_zz` (Rosa, 41) ·
  `p3_06b` (Preto, 48-50, número "1 × 6") · `p3_zzb` (Lima, 51) · `p3_06c` (Azul, 52-54) · `p3_06b2` (Coral/Ciano, 55-57) · `p3_08` · `p3_09` ·
  `p3_08b` (Verde, 59) · Dourado · `p3_10` (tique 60) · `p3_fim`. Cortes: fala do Lima do tique 38 e "18 · 0 mordidas/curas" (este
  voltou em `p3_fim`), fala da Rosa do 53, o aviso "57 de 60 jogadas deram erro" (agora é a cena do Dourado).
- Falas novas (texto do log): Ciano do tique 40 e Verde do 41 em `p3_07a` (no lugar das de 28 e 52, que estavam longe no tempo).
- Memes trocados de lugar: todos logo depois do selo do evento. Saíram `shocked-patrick`, `roll-safe`, `eye-roll`, `chaves-sem-querer`;
  entraram `one-eternity-later` e `many-months-later` (cena do Dourado). Efeitos extras (selos) em cenas que passavam de 20 s sem nenhum.

### Cena de descontração do Dourado (3 mini-cenas, ~45 s no total, logo antes do clímax de `p3_10`)
Narrador: "Antes do fim, uma pausa pro Dourado, que quase não falou. Nas três noites, foram só nove falas." (9 = 3 + 4 + 2, contadas no log).
- `dou_1` (partida 1, Estufa): fala do tique 4 "Vou regar as plantas para ganhar moedas." · selo "15 TIQUES DEPOIS" + `one-eternity-later` ·
  a MESMA fala no tique 19 · selo "A MESMA FRASE" · tique 40 "Regando as plantas, vou ganhar moedas para o rádio de resgate!" · selo "MORDIDO NO TIQUE 42" (log: Banana morde no 42).
- `dou_2` (partida 2, Refeitório): tique 9 "Vou esvaziar o lixo primeiro; preciso do taser para me proteger." · narrador "Foi mordido, virou zumbi, e passou
  quarenta tiques sem morder ninguém." · selo "ZUMBI POR 40 TIQUES · 0 MORDIDAS" + `many-months-later` (log: zumbi do 19 ao 58, 0 mordidas; na P1 também 0).
- `dou_3` (partida 3, Lançamento): tique 52 "Vou abastecer o motor enquanto esperamos o amanhecer." · número "166 / 178" (jogadas do Dourado que deram erro nas 3
  partidas: 56 + 53 + 57 de 60 + 58 + 60) · narrador "A culpa não era dele: de cada dez jogadas, mais de nove deram erro e viraram esperar." ·
  `silvio-santos-shrug` · selo "SÓ 2 AÇÕES NA PARTIDA 3" (curar no 37 e tarefa no 52).
A cura do tique 37 ("Preto, se você foi mordido, estou te curando agora.") fica na apresentação dele em `p3_06`.
