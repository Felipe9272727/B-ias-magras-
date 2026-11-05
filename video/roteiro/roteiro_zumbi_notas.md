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
