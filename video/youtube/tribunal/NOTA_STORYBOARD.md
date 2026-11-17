# Nota do storyboard — Tribunal das IAs (o que conferir)

**Conferido por script** (conferidor em `/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/trib/conferir.py`): as 94 citações existem palavra por palavra no log certo, com a cor, o dia e o campo certos (pensamento é pensamento, depoimento é declaração), e a referência `S#n`/`J#n` bate; 35 memes, nenhum repete, nenhum de `MEMES_RUINS`; todos os sons existem em `public/sfx`; as 20 músicas estão no `music.json` e têm mp3 em `public/music` (as de Halloween têm `file` sem a pasta `music/` no json: o montador tem que procurar em `public/music/`).

**Voz**: 17.247 caracteres (narração 10.330 + falas 6.917), ~20,5 min de fala. Minutagem recalculada por fórmula (14 caracteres/s + cartões, silêncios e tempo de selo): **~23:37**. Sobram só ~250 caracteres da cota: se precisar regravar, cortar primeiro em C1, E1 e J3.

## Para o montador
1. Formato igual ao do Desenha, com estas diferenças: posição `(rodada S|J, dia N)` e, depois da aspa de fechamento, ` — S#15` (referência do evento; tirar se o parser reclamar). Marcadores genéricos usados: `(fala)`, `(pensamento)`, `(sentença)`, `(depoimento)`, `(resposta)`, `(citações)`; por nome: `(Rubi)`, `(Jade)`, `(Topázio)`, `(Turquesa)`, `(Âmbar)`. O mapa nome → cor precisa aceitar acento (Âmbar, Topázio).
2. Mensagens do programa (penalidade, "CADEADO QUEBRADO!", "Julgamento adiado") ficam **sem voz**: o "adiado" é texto do `farol.mjs`, não fala do juiz (o pacote o citava como fala). Conferir que nenhuma vira buraco de >2,5 s.
3. Silêncios de propósito: A1 (0,5 s), G5 (1 s), H4 (3 s, sem música), I5 (1 s).

## Fatos novos (não estavam no pacote) — vale o Felipe olhar
- **22:18 e 22:27** (G5): no log da Jade, "22:18" só aparece na fala do Rubi (J#82) e "22:27" só na da Quartzo (J#80); ninguém tinha dito esses horários. É a virada do dia 3.
- **"Esquece"** (J#74): a ré quase entrega o homem de terno e volta atrás. **Anel do pai → do avô** (S#13, S#21). **A lente: nunca, às nove, à tarde** (S#73, S#79, S#85). **"O contato Patrocinador sou eu"** (S#109) x **"é o número da fundação"** (J#98). **"Se o caco tem O negativo, é sangue de sexta"** (S#109). **"Se existe, que a traga"** e **"Nenhum barco precisa de farol..."** (S#122). O Rubi admitiu os curativos na conversa **nas duas rodadas** (S#17, J#65).
- Correção do pacote: no dia 2 a Jade pressionou o Rubi **6** vezes, não 5.

## Interpretações minhas (aprovar)
- "O círculo é o anel" (o aro): o caso diz que o desenho é o anel dele; a leitura do aro é minha (e do pensamento da Jade, J#7).
- "Quase admite que o sangue é dele" (I2, sobre S#109) e "o exame de sangue que ninguém tinha como trazer" (H4: o jogo não tem prova com o tipo do Rubi).
- O gancho esconde qual advogada condenou até H4 (~17:06); A2 já mostra as duas.
- Contadores com "CÁLCULO NOSSO": VERSÕES DO RUBI (lista com eventos na `direcao_edicao.md`, seção 6), CORAÇÃO EM PEDAÇOS ×5, SÓ A TEMPESTADE ×14.

## Respeitado dos avisos do pacote
Delegado(a) e Quartzo na rodada da Safira não falam; a rodada da Jade não tem fala de sentença ("RÉ CONDENADA" é texto); sem custo; sem `t`/`ms`; "dedo anelar/mínimo", Colônia, Nilo Brandão, fornecedor, fotografia do delegado e enfermeiro tratados como invenções do Rubi; nenhuma citação com asterisco do Peridoto; erros de modelo só com selo (cortei "Rubi Prado" J#57 e a Jade se confundindo com a ré J#22 para caber na cota; voltam se sobrar voz).
