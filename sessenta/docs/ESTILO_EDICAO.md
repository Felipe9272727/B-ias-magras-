# Guia de estilo de edição do canal, a partir do Overcooked das IAs (OC)

Escopo: este guia cobre a EDIÇÃO e o ROTEIRO do Overcooked (`video/roteiro/roteiro_oc.py`, `video/scripts/build_timeline_oc.py`,
`video/remotion/src/overcooked/`). O Among Us 3 (AU3) entra só para comparar. Os guias do AU3 ficam em
`sessenta/docs/ESTILO_AU3_EDICAO.md` e `sessenta/docs/ESTILO_ROTEIRO.md` (outros autores; não editei).

Como foi feito: li os roteiros, os `build_timeline_*`, os componentes e `mix_audio.py`; medi `timeline_oc.json`, `timeline_au3.json`
e os `words.json` das vozes; extraí quadros de `video/remotion/out/overcooked_das_ias.mp4` (1560,8 s, 1920x1080, 30 fps, 5 folhas de
contato, 1 quadro a cada 20 s), de `among_us_3.mp4` (1493,6 s, mesmos parâmetros) e de `s60_previa_final.mp4` (139,9 s, 1 quadro a cada 9 s).
O que não consegui confirmar está marcado como "não verificado" na última seção.

---

## 1. Estrutura do vídeo

### 1.1 Overcooked (26,0 min, 71 cenas, tempos medidos no `timeline_oc.json`)

| Capítulo (`CHAPTERS`) | Início | Duração | % do vídeo | Cenas | O que é |
|---|---|---|---|---|---|
| Abertura (`a01`-`a04`) | 0:00 | 70,7 s | 4,5% | 4 | gancho em 3 golpes + cartão de título |
| Como as IAs jogam (`r01`-`r05`) | 1:10 | 103,0 s | 6,6% | 5 | elenco, regras, receitas, o prompt, como o versus é justo |
| Fase 1 · Sopa pra todo mundo | 2:53 | 346,5 s | 22,2% | 17 | versus |
| Fase 2 · O balcão no meio | 8:40 | 234,6 s | 15,0% | 11 | versus |
| Fase 3 · Hambúrguer em chamas | 12:34 | 291,5 s | 18,7% | 14 | versus |
| Coop · As 4 IAs na mesma cozinha | 17:26 | 449,6 s | 28,8% | 17 | a "cozinha do caos"; o maior bloco e o último |
| Placar final e prêmios (`z01`-`z03`) | 24:55 | 64,9 s | 4,2% | 3 | campeão, prêmios, lição e despedida |

Não há "extra" depois do final no OC. No AU3 existe (`x01`, `AU3Previa`, 35,5 s, "prévia do episódio 4", cena montada, não partida).

Comparação (AU3, 24,9 min, 81 cenas): abertura 83 s (5,6%), "O que mudou" 79 s (5,3%), partidas 307 / 458 / 353 / 122 s
(20,5% / 30,6% / 23,6% / 8,2%), placar e encerramento 57 s (3,8%), extra 35 s (2,4%). O AU2 (33,4 min) tem abertura 98 s, "O que mudou" 72 s,
quatro partidas de 403 a 529 s e final de 73 s.

Regras que se repetem nos dois:
- Abertura entre 70 e 100 s, "como funciona" entre 70 e 105 s, final entre 57 e 73 s. O resto (85% a 90%) é o conteúdo.
- A partida mais longa/mais caótica vem por último no OC (coop, 7,5 min) e no meio-fim no AU3 (partida 2, 7,6 min). Partida curta no AU3 (partida 4, 122 s) é aceita quando ela é curta de verdade.
- Nunca há cena sem voz: 0 cenas mudas nos dois vídeos (medido). O silêncio é só o `pad` de 0,5 s no fim de cada cena (e `lead` de 0,25 s no começo; 0,5 s no `OCTitulo`).

### 1.2 Gancho (abertura OC, 70,7 s)
Três cenas em ordem, depois o título:
1. `a01` (CH, 21,1 s): `OCJogo` do coop em replay no pior momento (`de=86`, rótulo "COOP · AS 4 IAs JUNTAS"), duas falas de chefs em caixa alta com TRIGGERED e a frase "Elas tão no menos cento e vinte pontos. E isso aqui é o momento BOM da partida." com `[[x:0.7:16]]` (tremida).
2. `a02` (CH, 20,0 s): trecho do versus com a briga ("p*rra" censurado na tela), "o clima esquentou".
3. `a03` (18,5 s): versus em modo `auto`, `vel=2`, `sons=False`, promete a piada final ("entregou um pão. Só um pão. Como prato.") e solta o primeiro meme (`gordon-ramsay-angry`).
4. `a04` (11,1 s): `OCTitulo` (kicker "DeepSeek · Claude · GPT · Gemini", título "COLOQUEI 4 IAs PRA JOGAR OVERCOOKED", `[[s:impact-epic:0.6]]`, "Bora.").

O AU3 abre igual em espírito: `a01` mostra a jogada mais absurda (o Palhaço que ganha sendo expulso), `a02` comentários do vídeo anterior
(`AU3Comentarios`), `a03` ideias dos inscritos (`AU3Ideias`), `a04` a nave nova (`AU3Nave`), `a05` título (`AUTitulo`). Fórmula do canal: resultado absurdo primeiro, promessa de
explicar depois ("Daqui a pouco você vai ver como"), título só no fim da abertura.

### 1.3 Como cada bloco de jogo é apresentado (OC)
1. Cartão `OCTitulo` (kicker "Fase 1", título em caixa alta, subtítulo com a regra), narrador ~10 s com `[[s:largada:0.5]]` e `[[m:...]]` opcional. Ex.: `f101`, `f201`, `f301`, `c01` (cor `#ff5a3c` para o coop).
2. Cena de ambientação narrada, com a grade 2x2 (`modo='grade'`) para o versus ("as quatro cozinhas jogam a mesma fase ao mesmo tempo").
3. Cenas de "momento" (CH), uma por lance: ver 1.4.
4. Cena `modo='auto'` (rodízio de cozinhas) para resumir quem entregou o quê.
5. `OCPlacar` acumulado ao fim de cada fase (`f117`, `f211`, `f312`), com `[[s:drumroll:0.4]]`, `[[p]]` e um `[[s:sad-trombone:0.4]]` na pior colocada.

Sobre o AU3: cada partida abre com `AU3Revela` (impostores/Palhaço, `[[s:faca:0.4]]` por impostor, `[[s:impact-epic:0.4]]`) e fecha com `AU3Fim` (`pad=1.4`).

### 1.4 A "cena de momento" (unidade básica; 20,4 s em média)
Padrão CH: 3 a 5 batidas dentro de uma cena só:
```
N  setup curto, "no tique X / no DeepSeek..."              (3 a 8 s)
chef  fala copiada do log (voz própria + balão no jogo)     (2 a 6 s cada)
N  "pensa:" + o pensamento secreto lido/citado              (opcional)
N  punchline com número ou contradição + [[m:meme]]         (3 a 6 s)
```
Exemplos: `f109` (Seek "não largo o prato de jeito nenhum" -> `[[s:record-scratch:0.5]]` -> "Largou. Durou dois segundos."), `f111` (`congela=40.9`, `zoom` 1.9, `[[p]]`, `[[t:1 CEBOLA DE 3:2:#ff5a3c]]`), `f116` (a Gêmea acerta; "E ela tava certa.").
Tamanho das cenas: mediana de `OCJogo` 19,3 s; mínimo de cena 7,0 s, máximo 42,7 s; média por capítulo: f1 20,4 s, f2 21,3 s, f3 20,8 s, coop 26,4 s.

### 1.5 Placar, final e extra
- Placar por fase: `OCPlacar` (`video/remotion/src/overcooked/Cenas.tsx`), linhas ordenadas por total, entrada em cascata (`passo=14` quadros), 1º lugar com borda dourada e o chef em `anim='panico'`. Narrador diz as 4 posições em ordem inversa do suspense (1º, 2º, ..., o pior com trombone).
- Números curiosos: `OCNumeros` (barras por empresa), 2 usos: "QUANTO CADA UMA GRITOU" (GPT 499, DeepSeek 455, Gemini 320, Claude 6) e "A COZINHA DO CAOS" (vezes que travou alguém: 89 / 46 / 44 / 6).
- Prêmios no OC: não há tela própria; é o narrador sobre `OCElenco` (`passo=8`, `destaque='Gemini'`), 4 prêmios cada um com `[[s:pop:0.4]]` (chef mais calmo, o gritão, o rei da espera, o trator da cozinha). No AU3 há tela própria (`AU3Premios`, que usa `AU2Premios` + `PREMIOS3`; gatilhos por palavra).
- Final do OC (`z03`): jogo em `modo='um'`, `sons=False`, `falas=True`, `replay=True`, 1 lição, pedido de comentário ("qual jogo você quer ver"), "Se inscreve, deixa o like", `pad=1.4`. No AU3: `f04` com `AUTitulo` ("SE INSCREVE NO CANAL") e `[[s:tada:0.5]]`.

---

## 2. Narração

### 2.1 Tom
- Fala corrida, coloquial, escrita para ser dita (sem tags de emoção): "Eu recriei o Overcooked do zero", "Bora.", "Guarda esse número.", "Bom... guarda esse número.".
- Números por extenso, no texto falado ("quatrocentas e noventa e nove"); a legenda mostra algarismos quando entra (`bt.LEGENDA`, vazio no OC; `bt.TERMOS` = JSON, tokens, DeepSeek, Overcooked).
- Pergunta retórica -> prova do log -> piada. Tudo é "copiado do log" (o roteiro avisa, `build_timeline_oc.py` confere cada fala pelo tique e pelo chef). Frase fixa do canal: "Tudo o que aparece no vídeo aconteceu de verdade" (descrição, `youtube/descricao_oc.md`).
- Autocrítica leve ("Acho que exagerei", AU3; "Pelo menos ele admitiu", OC).

### 2.2 Tamanho das falas e silêncio (medido nos `words.json` das vozes)
| | OC | AU3 |
|---|---|---|
| Fala (um arquivo de voz) média / mediana / máx | 7,5 s / 5,7 s / 28,9 s | 10,1 s / 8,4 s / 33,7 s |
| Vozes (arquivos) | 188 | 136 |
| Narrador, taxa dentro da fala | 158 palavras/min | 157 palavras/min |
| Narrador, fração do vídeo | 64% (997 s, 2.628 palavras) | 72% (1.074 s, 2.809 palavras) |
| Vozes das IAs/chefs, fração do vídeo | 26% (410 s, 1.175 palavras) | 20% (295 s, 844 palavras) |
| Pausa mediana entre vozes | 0,31 s | 0,75 s |
| Pausas maiores que 2 s / maior | 23 / 3,7 s | 12 / 3,6 s |
| Vídeo com alguma voz tocando | 90% | 92% |

Em CH, entre as falas de chefs o `build_timeline` deixa 0,3 s (narrador) ou 0,35 s (chef). Frase do narrador: de 1 a 4 sentenças por bloco, quase sempre acabando em
gancho curto ("Não tinha acabado."; "E ela tava certa."; "Durou dois segundos.").

### 2.3 Como o narrador fala das IAs
- Cada empresa é uma dupla de chefs com apelidos fixos, ditos sempre iguais: DeepSeek = "Deep e Seek"; Claude (Haiku) = "Claudinho e Claudete"; GPT = "Gepeto e Gepeta"; Gemini = "Gêmeo e Gêmea". No AU3, a IA é a cor + a empresa ("o Marrom, do DeepSeek").
- Cada IA ganha um traço de personalidade e ele vira piada recorrente: o GPT grita tudo (499 de 500 falas), o Claude espera (110 esperas), o Gemini "tava certo" (aparece em `f116` e `f311`), o DeepSeek xinga o próprio DeepSeek. Os callbacks são anunciados ("lembra do começo do vídeo?", "guarda esse número").
- Ironia de narrador esportivo: não opina sobre "IA é boa/ruim" em abstrato; mostra a contradição entre a fala e a ação ("Não pega outro tomate." / "E o Gepeto pegou outro tomate.").
- Padrões de piada que se repetem (úteis para o 60 Segundos):
  1. Citar a fala e desmentir no tique seguinte ("Não largo o prato de jeito nenhum." / "Largou.").
  2. Número exato que desmonta a cena ("1 CEBOLA DE 3", "44 SEGUNDOS", "185 ESBARRÕES", `[[t:...]]`).
  3. Enumeração em ritmo ("Larga, pega, larga, pega").
  4. Resultado do lance dito em uma frase de 3 a 6 palavras + `[[s:...]]` + meme.
  5. Contraste entre o "pensamento secreto" e a fala.
- Palavrão do log: na voz vira "pô" (`fala_chef`: `\bporra\b` -> `pô`) e na tela fica "p*rra" (`censura`), com `[[s:censor-beep:0.4]]` quando o narrador comenta.

### 2.4 Vozes das IAs (ElevenLabs)
- Modelo `eleven_v4`, `{'stability': 0.5, 'similarity_boost': 0.75}`, endpoint `with-timestamps` (devolve as palavras com tempos para legendas e âncoras). Cache por hash em `remotion/public/voice_oc/` (`voice_au3/`, `voice_au2/`).
- Narrador: Gabriel (`lvkgCBi6spByiTZMPJEK`).
- Chefs do OC (`VOZES` em `build_timeline_oc.py`): Deep = Mário `YU8EsJtXFMyKMxYtheDk`; Seek = Rafael Valente `dX7gRq1dIvLTgUaWpEFn`; Claudinho = Davi `2CECaLAGTS5NRGxgbcxr`; Claudete = Raquel `GDzHdQOi6jjf8zaXhCYD`; Gepeto = Weverton `YbP0Eq5RE5uOoCEl7F3T`; Gepeta = Roberta `ohZOfA9iwlZ5nOsoY7LB`; Gêmeo = Lucas `7lu3ze7orhWaNeSPowWx`; Gêmea = Keren `33B4UnXyTNbgLmdEDh5P`.
- AU3 (`build_timeline_au3.py`): 15 vozes, uma por cor (Mário, Rafael Valente, Davi, Raquel, Weverton, Lendário, Marcelo Costa, Lucas, Arnold, M, Roberta, Keren, Luiz Henrique, Larissa, Wallace). Uma voz para o mesmo personagem em todos os vídeos.
- Gritos: texto em caixa alta é convertido para minúsculas com a tag `[shouting] ` (o modelo lê CAIXA ALTA soletrando).
- Pronúncia só para a voz (`bt.PRONUNCIA`): `Haiku` -> `Raicu`, `GPT` -> `GêPêTê`, `Gemini` -> `Djêmini`, `DeepSeek` -> `Dípsíque`, `Deep` -> `Dípi`, `Seek` -> `Síqui`, `Gepeto` -> `Gepéto`, `Overcooked` -> `Ôvercúqued`, `Luna` -> `Lúna`, `Flash` -> `Fléch`, `tokens` -> `tôkens`. Nomes do 60 Segundos (Osvaldo, Celeste, Juju, Tico, "60 Seconds") precisam entrar nesse dicionário.
- Pensamento secreto: aparece como nuvem no jogo (`Nuvem` em `Cozinha3D.tsx`, prop `pensa`/`pensaJanelas`) e é lido com a voz do chef quando a fala do roteiro tem `{'pensa': True}`; o narrador introduz ("E no pensamento:", "A fala é normal. Mas a cabeça...").

---

## 3. Elementos visuais recorrentes (e onde estão)

Pipeline comum (OC e AU3 usam o mesmo): `roteiro_*.py` -> `build_timeline_*.py` (vozes + `timeline_*.json` em `video/remotion/public/`) ->
composição `Overcooked` / `AmongUs3` em `video/remotion/src/Root.tsx` (usa `Main` em `video/remotion/src/Main.tsx`, `calcTimeline('timeline_oc.json')`) ->
`montar_cenas_*.py` (render por cena com cache por hash) -> `mix_audio.py`. `video/remotion/src/scenes/registry.tsx` roteia por prefixo do nome (`AU*`, `IL*`, `OC*`).

| Elemento | Componente / função | Arquivo | Como entra no roteiro | Valores |
|---|---|---|---|---|
| Legenda seletiva (não é palavra a palavra o tempo todo) | `Captions` | `video/remotion/src/components/overlays.tsx` | automática para termos/números difíceis (`TERMOS`, `NUMERO_DIFICIL`) e `[[cc]]` | blocos de até 7 palavras ou 38 caracteres, 58 px, 900, contorno 11 px, palavra falada em dourado `C.gold`; 24 blocos no OC inteiro; some no modo Short (`ModoShort`) |
| Meme / GIF | `MemeCard` | `overlays.tsx` | `[[m:id:pos:dur:legenda]]` | `pos` right/left/top/center/full; borda branca 10 px, inclinação 3 graus, mola `damping 11, stiffness 200`; padrão `right` e 2,2 a 2,6 s; catálogo `public/gifs/catalog.json` (78 GIFs); OC usa 52 memes (39 diferentes), 2,0 por minuto, igual ao AU3 (50; 2,0 por minuto); o tempo é o da fala |
| Texto que explode | `TextPop` | `overlays.tsx` | `[[t:TEXTO:dur:cor]]` | 132 px, `FONT.comic`; OC usa 6 vezes (todas com número) |
| Soco de câmera | em `SceneView` (`Main.tsx`) | `Main.tsx` | `[[p]]` | zoom `0.08*exp(-d/5)` e flash branco 0,45, 24 quadros; OC 8, AU3 12 |
| TRIGGERED / tremida | `trig`, `shake` em `SceneView` | `Main.tsx` | `[[g:dur:TEXTO]]` / `[[x:dur:força]]` ou opção `{'trig': True}` na fala do chef | vermelho multiplicado 0,55, faixa de 150 px; OC 14 TRIGGERED, 6 tremidas |
| Cena de jogo | `OCJogo` | `overcooked/Cenas.tsx` | `J(log, cz, de=..., vel=..., zoom=..., modo=..., rotulo=..., replay=..., congela=...)` | 55 das 71 cenas; modos `um` 44, `auto` 7, `grade` 4; 1 tique = 60 quadros em `vel=1` (`TICK_F`) |
| Cozinha 3D desenhada | `Cozinha3D`, `ChefSprite`, `Sprite`, `Pedidos` | `overcooked/Cozinha3D.tsx`, `Cozinha.tsx` | dentro do `OCJogo` | HUD: pedidos no topo, moedas/pontos embaixo à esquerda, relógio embaixo à direita (vermelho `#ff5a3c` abaixo de 30 s), etiqueta "Cozinha X" no topo à direita |
| Balão de fala | `Balao` | `Cozinha3D.tsx` | automático (campo `fala` do log); `so` filtra quem aparece | caixa alta vira balão amarelo-vermelho |
| Balão de pensamento | `Nuvem` | `Cozinha3D.tsx` | `pensa`, `pensaJanelas`, ou opção `{'pensa': True}` | nuvem cinza-azulada com "PENSA:" |
| Frase em destaque | `OCFrase` | `overcooked/Cenas.tsx` | `frase(chef, texto, modo)` | existe e está registrado, mas o roteiro do OC não usa (0 usos); o equivalente AU3 é `Frase` em `amongus3/Telas.tsx` |
| Selo de velocidade | rótulo em `OCJogo` (`rotulo`) | `Cenas.tsx` | `rotulo='ACELERADO 2×'` ou `'auto'` (vira "ACELERADO n×" quando `vel >= 1,6`, `build_timeline_oc.py` linhas 281-302) | faixa vermelha `#e84118` 60%, borda preta, 34 px, centro-baixo; 5 vezes "2×" e 1 vez "4×" |
| Selo no AU3 | `SeloVelocidade` (não exportado) | `amongus3/Jogo.tsx` | automático pelo mapa de tempo | texto "⏩ 2x" ou "CÂMERA LENTA", direita, 26 px |
| Corte "⏩ TIQUE n" | `Cortes` | `amongus3/Jogo.tsx` | automático (corte quando `mapaTempo` não consegue acelerar) | escurece 6 quadros antes e 10 depois; legenda "⏩ TIQUE n" ou "DEPOIS DA REUNIÃO" |
| Rodízio de câmera | `cortesAuto` | `overcooked/Cenas.tsx` | `modo='auto'` | trecho = `SEG = 96` quadros (3,2 s); sempre a cozinha com mais "caos" (`PESO`) e bônus a quem ficou tempo sem aparecer; flash branco 0,5 de 6 quadros em cada corte |
| Zoom / punch-in | `camera` | `Cenas.tsx` | `zoom=dict(chef='Deep', s=1.5)` ou `dict(x=6, y=0, s=1.35)` | `s` de 1,3 a 1,9; entra em 18 quadros; 9 cenas |
| Congelar | `congela` | `Cenas.tsx` | `congela=40.9` (só em `f111`) | tique fixo, sem sons do jogo |
| Cartão de capítulo | `OCTitulo` | `Cenas.tsx` | `titulo(kicker, title, subtitle, cor)` | 128 px (96 se > 26 caracteres), chefs girando em volta; 5 cenas; `lead` 0,5 s; música cortada (`SEM_TRILHA = ['OCTitulo']`) |
| Elenco / duplas | `OCElenco` | `Cenas.tsx` | `comp('OCElenco', passo=24)`, `destaque='Gemini'` | usado na apresentação (`r01`) e nos prêmios (`z02`) |
| Receitas | `OCReceitas` | `Cenas.tsx` | `comp('OCReceitas', receitas=[...])` | 2 usos |
| Prompt | `OCPrompt` | `Cenas.tsx` | `comp('OCPrompt', texto=PROMPT, resposta=RESPOSTA, chef='Deep')` | mostra o texto que a IA recebe e a resposta JSON com `acao`, `fala`, `pensa` |
| Placar | `OCPlacar` | `Cenas.tsx` | `placar(['fase1','fase2'], titulo)` | 4 usos; cascata `passo=14` |
| Números | `OCNumeros` | `Cenas.tsx` | `comp('OCNumeros', titulo, sub, valores=[...])` | 2 usos; barras na cor da empresa `COR_EMPRESA` |
| Comentários dos inscritos | `AU2Comentarios` (cena `AU3Comentarios`), `AU3Ideias` | `amongus3/Comentarios.tsx`, `Abertura.tsx` | `comp('AU3Comentarios', passo=40)` | só AU3 (e AU2); o OC não tem |
| Transições entre cenas | `TransicaoEntrada`, `escolherTransicao` | `amongus/Transicoes.tsx` | automático, só em cenas cujo nome começa com `AU` | estrelas, deslize, íris, flash; o OC não usa transição: corte seco |
| Fundo das telas de apoio | `Fundo` | `Cenas.tsx` (privado) | usado por `OCTitulo`, `OCPlacar`... | azulejo de cozinha `#1d3b4f`, grade rolando |
| Sons do jogo dentro do visual | `Sons` | `Cenas.tsx` | automático por evento do log, `sons=False` desliga | tabela em 4.3 |

Observação: no OC, as bolhas de fala vêm do próprio registro da partida (`q.fala`) e do `falas` do componente; as vozes (`type='voz'`) são sincronizadas por quadro pelo `build_timeline_oc.py`.

---

## 4. Som

### 4.1 Trilhas (`remotion/public/music/music.json`, 25 faixas, Kevin MacLeod CC BY 4.0)
Uma música por bloco, trocando só em fronteira de cena (lista `CUES` no fim do roteiro: `(primeira cena, faixa, início em s[, ganho, corte seco])`).
No OC são 19 trilhas em 26 min (média 82 s; mín. 16 s, máx. 172 s):

| Momento | Faixa | Duração do bloco |
|---|---|---|
| Abertura (`a01`) | `mega-hyper-ultrastorm` | 41 s |
| Abertura 2 (`a03`) | `pixel-peeker-polka-faster` | 30 s |
| Como jogam (`r01`) | `chipper-doodle-v2` | 103 s |
| Fase 1 (`f101`) | `fluffing-a-duck` | 143 s |
| Pensamento secreto (`f109`) | `sneaky-snitch` | 90 s |
| Entregas da fase 1 (`f112`) | `monkeys-spinning-monkeys` | 97 s |
| Placar fase 1 (`f117`) | `winner-winner` | 16 s |
| Fase 2 (`f201`) | `quirky-dog` | 80 s |
| Meio da fase 2 (`f206`) | `itty-bitty-8-bit` | 135 s |
| Placar desastroso fase 2 (`f211`) | `heartbreaking` | 20 s |
| Fase 3 (`f301`) | `voxel-revolution` | 116 s |
| A briga do hambúrguer (`f307`) | `8bit-dungeon-boss` | 102 s |
| Placar do versus (`f312`) | `heroic-age` | 74 s |
| Coop, título (`c01`) | `mega-hyper-ultrastorm` (início em 30 s) | 121 s |
| Coop, engarrafamento (`c06`) | `bit-shift` | 172 s |
| Primeira entrega (`c11`) | `call-to-adventure` | 134 s |
| Resultado coop (`c15`) | `despair-and-triumph` | 23 s |
| Campeão (`z01`) | `winner-winner` (início em 20 s) | 43 s |
| Lição final (`z03`) | `local-forecast-elevator` | 22 s |

Lógica (confere com os campos `mood` e `use_pt` do `music.json`): caos -> `mega-hyper-ultrastorm`; explicação -> `chipper-doodle-v2`; fails em fila -> `fluffing-a-duck`; "a IA pensando" -> `sneaky-snitch`; resultado ruim -> `heartbreaking`/`despair-and-triumph`; resultado bom -> `winner-winner`/`heroic-age`; despedida -> `local-forecast-elevator`.
Em AU3 a regra é a mesma (27 trilhas; `thinking-music` na reunião, `despair-and-triumph` na morte do Xerife, `8bit-dungeon-boss` na sabotagem).
Troca sempre sem sobrepor (`SEM_SOBREPOR=True` em `mix_audio.py` quando se usa `--roteiro`); fade de saída 0,7 s (0,08 s no "corte seco"), entrada 0,8 s.

### 4.2 Volume e normalização (`video/scripts/mix_audio.py`, chamado por `oc_final.sh`: `python3 ../scripts/mix_audio.py out/overcooked_sem_mix.mp4 out/overcooked_das_ias.mp4 --timeline public/timeline_oc.json --roteiro roteiro_oc`)
1. Volume da trilha = `suggested_bg_volume` da faixa (`music.json`, de 0,14 a 1,0) x `MUSIC_GAIN` 0,85 x ganho do `CUES`. É calibrado pela loudness da faixa (ex.: `quirky-dog` -8,9 LUFS -> 0,14; `heartbreaking` -31,2 LUFS -> 1,0).
2. Faixas em `SEM_TRILHA` (componente `OCTitulo`; AU3: `AU3Revela`, `AU3Fim`, `AU3Shhh`) ficam sem música.
3. Ducking: `sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450`, a música cai uns 10 dB sob voz e efeitos.
4. Mistura final: `loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79`, AAC 192 kb/s, 48 kHz. Medido: AU3 trecho 300-420 s tem `mean_volume` -18,1 dB e pico -1,4 dB; a prévia do 60 Segundos tem -17,8 dB e pico -0,9 dB.
5. Os efeitos e as vozes entram já no render do Remotion (`Audio` dentro de `SceneView`); só a trilha e a normalização são feitas no ffmpeg.

### 4.3 Efeitos
- Catálogo geral: `remotion/public/sfx/sfx.json` (43 sons: `whoosh`, `boom`, `death`, `tada`, `level-up`, `drumroll`, `coin`, `pop`, `record-scratch`, `sad-trombone`, `fail-piano`, `riser`, `impact-epic`, `heartbeat`, `explosion`, `censor-beep`, `ba-dum-tss`, `crowd-*`, `typing`...).
- OC: 22 efeitos de cozinha gerados no ElevenLabs (`video/scripts/sfx_eleven_oc.py`, text-to-sound-effects, `remotion/public/overcooked/sfx/`): `picar`, `fritar`, `ferver`, `pronto`, `pedido`, `alarme`, `relogio`, `moeda`, `quebrou`, `lavar`, `pegar`, `largar`, `jogar_panela`, `buzzer`, `expirou`, `esbarrao`, `largada`, `fim`, `fogo`, `extintor`, `estrelas`...
- AU3: efeitos em `sfx_au2/` (Mixkit; ver `FONTES.md`: `faca`, `tiro`, `transformar`, `duto`, `escudo`...).
- Marcação no roteiro: `[[s:efeito:vol]]`. O volume efetivo é `min(1, 0,8 x vol / 0,55)`, então `0.4` = 0,58, `0.5` = 0,73, `0.6` = 0,87. Valores usados no OC: 0,3 a 0,7; o mais comum 0,4 a 0,5.
- Efeitos mais usados no OC: `expirou` x10, `moeda` x8, `pop` x6, `drumroll` x6, `impact-epic` x4, `record-scratch` x4, `buzzer` x4, `largada` x3, `fim` x3, `sad-trombone` x3.
- Sons do jogo (tabela `SOM` em `Cenas.tsx`, volume x `volume` do `OCJogo` x 0,7; na grade x 0,8, e só os marcados "grade"): `picar` 0,22; `pegar` 0,30; `largar` 0,25; `jogar_panela` 0,35; `pronto` 0,40; `moeda` (entrega) 0,55; `expirou` 0,45; `esbarrao` 0,35; `fogo` 0,50; `extintor` 0,45; `buzzer` (recusado) 0,45; `alarme` 0,40; `pedido` 0,30. `ferver` 0,09 e `fritar` 0,10 só na cozinha única.
- Regra de uso: o efeito acompanha a palavra do narrador que descreve o lance (a marcação fica antes da palavra); evento de jogo e efeito do narrador não competem porque o jogo fica em volume baixo.

---

## 5. Ritmo

- Cena de jogo narrada: 15 a 25 s. Cena de título: 6 a 10 s. Cena de placar: 15 a 30 s. Dentro do modo `auto`, corte a cada 3,2 s (96 quadros).
- Meme a cada ~30 s em média (2 por minuto), sempre num ponto de virada (final da frase), 2,2 a 2,6 s.
- Aceleração e câmera lenta: quando a cena tem falas de chefs (CH), o jogo anda até o tique de cada fala e, depois da última, fica em `vel=0.3` (câmera lenta) enquanto a narração comenta (`build_timeline_oc.py` linha 263: 34 das 55 cenas de jogo ficam em 0,3). Em cena só narrada (sem falas), o `vel` é calculado para a partida chegar no ponto da próxima cena: limitado a 0,35 a 4,0 (linhas 281-302), e o selo "ACELERADO n×" aparece quando `vel >= 1,6`. Resumos longos usam `vel=2` (ou `vel=4` uma vez, em `f3`).
- Quadro congelado só como golpe: `f111` (`congela=40.9`, zoom 1,9 e `[[p]]`).
- Âncoras (OC): em cena CH, cada fala vem com o tique da partida; o `build_timeline_oc` cria dois eventos `tk` por fala (tique+0,05 no começo da voz e tique+0,95 no fim), 148 no vídeo todo. `OCJogo` recebe as chaves e usa `tempoEm()` (interpolação linear entre chaves). Também existe `[[k:tique]]` para sincronizar uma palavra do narrador com um tique.
- Âncoras (AU3, mais sofisticada; `video/remotion/src/amongus3/tempo.ts`): `jogo(..., ancoras=[(evento, 'palavras da narração')])`. `mapaDaCena()` acha o quadro em que o narrador fala cada termo (`palavrasNaCena`), calcula o quadro do evento no jogo (`quadroDoEvento`) e `mapaTempo()` entrega o mapa quadro->quadro: acelera até `vmax` (padrão 2, `vmax=3` numa cena), desacelera até `VMIN=0.3`, e corta numa pausa de fala (>= 6 quadros) quando precisaria passar de `vmax`, 3 s antes da âncora seguinte; nunca congela. Reunião no meio vira "DEPOIS DA REUNIÃO".
- Regra editorial: o evento acontece na palavra que o descreve ("E recruta", "Atira", "mata a Rosa").
- Ritmo de uma fase do OC (f1, 346 s): 17 cenas; ~5 CH, 3 resumos auto/grade, 1 placar.

---

## 6. Estrutura proposta para 25-30 min (60 Segundos das IAs)

Material (dos relatos do coordenador e dos arquivos): 4 partidas completas na mesma casa (semente ep5), `GPT Terra` 30 dias (`sessenta/logs/ep5_gpt.json`; 29 dias com registro em `remotion/public/sessenta/partidas/ep5_gpt.json`, 9 com escolha, coleta com 22 registros), `MiniMax` 23 dias (`ep5_minimax.json`), `DeepSeek` e `Claude` ainda jogando (em `sessenta/logs/` só existe `ep5_claude.json`; não há `ep5_deepseek`); "erros de gravação" da semente antiga ep1: GPT Luna ficou de fora 2 vezes na coleta, DeepSeek 2 vezes, todos morreram na 1ª e na 2ª expedição.

Distribuição usada nos vídeos: abertura 4,5%-5,6%; "como funciona" 5,3%-6,6%; partidas 77%-87% (OC: 4 fases = 84,7%; AU3: 4 partidas = 83,0%); placar e encerramento 3,8%-4,2%; extra 2,4% (só AU3). A partida mais longa pesa 28,8% (OC coop) ou 30,6% (AU3 partida 2); a menor 8,2%.

| # | Bloco | Início | Alvo | Mín. | Referência | Conteúdo |
|---|---|---|---|---|---|---|
| 0 | Abertura | 0:00 | 1:15 | 1:10 | OC 70,7 s; AU3 83 s | gancho (pior momento: pai fora do abrigo com 1 s de folga ou um dia absurdo), promessa, cartão de título `S60Titulo` |
| 1 | Como funciona | 1:15 | 1:45 | 1:40 | OC `regras` 103 s | as duas fases (60 s de coleta e dias no abrigo), família, o prompt que a IA recebe, as 4 IAs, aviso de modelos CC0 (curto) |
| 2 | Os testes que deram errado (ep1) | 3:00 | 3:00 | 2:45 | OC Fase 1 (347 s) reduzida | Luna fora 2 vezes, DeepSeek 2 vezes, "todos morreram na 1ª e na 2ª expedição" em grade de 4 coletas lado a lado |
| 3 | Partida A (a que durou menos dias) | 6:00 | 4:00 | 3:45 | AU3 p4 122 s, OC f2 235 s | abre a escalada |
| 4 | Partida B | 10:00 | 4:30 | 4:15 | OC f2 235 s, AU3 p1 307 s | |
| 5 | Partida C (MiniMax, 23 dias) | 14:30 | 5:15 | 4:45 | OC f3 292 s, AU3 p3 353 s | |
| 6 | Partida D (GPT Terra, 30 dias) | 19:45 | 6:30 | 6:00 | OC coop 450 s, AU3 p2 458 s | a mais longa e por último, como o coop do OC |
| 7 | Placar e prêmios | 26:15 | 1:30 | 1:20 | OC 65 s, AU3 57 s | `OCPlacar`-like por dias vividos; prêmios |
| 8 | Encerramento e extra | 27:45 | 0:30 | 0:30 | AU3 `x01` 35,5 s | pedido de comentário, "se inscreve", prévia do próximo |
| | **Total** | | **28:15** | **26:10** | | |

Notas:
- A ordem das partidas A-D deve ser decidida pelos dias vividos, crescente, com o recorde por último. Hoje só se sabe que GPT Terra = 30 e MiniMax = 23; DeepSeek e Claude ainda estão em jogo, então a ordem final não está definida (não presumi nada).
- Mínimo (26:10) já passa de 25 min sem esticar; o máximo natural é ~31 min se uma partida precisar de mais dias.
- Ajuste ao que existir: se o bloco 2 não render 3 min de material, não encher; passar o tempo para a partida mais rica. Não congelar quadro para completar tempo (o canal só congela por efeito, 1 cena).
- Receita interna de cada partida (modelo para o roteiro): cartão `OCTitulo`-like da IA (6-8 s, cor da empresa em `EMPRESA`/`COR_EMPRESA`) -> coleta 3D 75-100 s narrada (ver seção 7: não sobra 60 s de relógio cru) -> 8 a 12 dias do abrigo de 18-25 s cada (cerca de 3 a 4,5 min; GPT Terra tem 582 s de dias em velocidade 1, então escolher e acelerar com selo) -> final de 20-30 s com tela de números (dias vividos, quem morreu, o que quebrou).
- Orçamento de palavras para 28 min: narrador ~64%-72% do vídeo (17-20 min, ~2.600 a 3.200 palavras a 157 palavras/min) e voz das IAs 20-26%.

---

## 7. Como aplicar no 60 Segundos

### 7.1 Reaproveitar direto (sem mexer no desenho)
- Pipeline inteiro: `roteiro_*.py` + `build_timeline_*.py` + `Main.tsx` (`SceneView`, `Captions`, `MemeCard`, `TextPop`, punch/shake/TRIGGERED, eventos `voz`/`sfx`) + `montar_cenas_*.py` (cache por cena) + `mix_audio.py --roteiro`. Cópia mínima: `video/roteiro/roteiro_s60.py` (SCENES, CHAPTERS, CUES, SEM_TRILHA), `video/scripts/build_timeline_s60.py` (derivado de `build_timeline_oc.py`), `Sessenta` em `Root.tsx` com `calcTimeline('timeline_s60.json')`, `video/scripts/montar_cenas_s60.py` (derivado de `montar_cenas_au3.py`), `remotion/src/sessenta/Registro.tsx` e a linha `if (v.name.startsWith('S60'))` em `scenes/registry.tsx`.
- Narrador, modelo e parâmetros: `NARRADOR` Gabriel e `eleven_v4` 0,5/0,75; marcações `[[m:]]`, `[[s:]]`, `[[p]]`, `[[t:]]`, `[[cc]]`, `[[x:]]`, `[[g:]]`, `[[k:]]`.
- Memes (`gifs/catalog.json`, 78) e efeitos (`sfx/sfx.json`, 43; já existem `heartbeat`, `explosion`, `riser`, `death`, `sad-trombone`, `crowd-boo`, `system-breakdown`, `record-scratch`).
- Trilhas: `music.json` com os rótulos já certos para o 60 Segundos: `mega-hyper-ultrastorm` (corrida desesperada; é o uso descrito em `use_pt`) e `8bit-dungeon-level` (tensão) para a coleta; `heartbreaking`, `despair-and-triumph`, `relent` (tristeza) para o abrigo; `decisions` (suspense antes do resultado) para cada dia com escolha; `thinking-music`/`sneaky-snitch` para o pensamento da IA; `winner-winner` e `heroic-age` para recordes; `local-forecast-elevator` para despedida.
- Mixagem: `mix_audio.py` (volume por `suggested_bg_volume` x 0,85, ducking, `loudnorm=-14`).
- Telas de apoio: `OCTitulo`/`OCPlacar`/`OCNumeros` como modelo (ver "adaptar"), `AU2Premios` (`amongus2/Premios.tsx`, gatilhos por palavra) para prêmios.
- Sons de cozinha do OC não servem; os de Among Us tampouco. Usar `sfx.json` e criar poucos efeitos novos no ElevenLabs com o mesmo método (`sfx_eleven_oc.py`).
- `Dia` (`remotion/src/sessenta/Dia.tsx`): já tem `duracaoDia`, `carregarDia` e `vel`; serve como visual de cena do abrigo.
- `Coleta3D`/clipes: ver 7.2; o clipe pré-renderizado entra pelo mesmo caminho de `ClipView` (`overlays.tsx`: `Segment` com `clip`, `from`, `rate`, `zoom`, `ox`, `oy`, `label`; arquivos em `public/footage/`).

### 7.2 Adaptar
1. Registro das cenas S60. `Dia` precisa de `dados`; hoje vem de `calcDia`/`carregarDia` (fetch assíncrono). No pipeline por timeline, colocar os dados em `timeline.data` (como `partidas` no AU3 e `logs` no OC) e ler em `Registro.tsx`; `Coleta3D` fica fora do timeline (renderiza pesado, 65 s = 1950 quadros, ver `calcColeta3D`): continuar pré-renderizando e entrar como `type='clip'`/`segments` ou como `OffthreadVideo` num `S60Coleta`.
2. Âncoras na coleta. A coleta 3D é tempo real de 60 s; precisa de uma cópia de `mapaTempo`/`palavrasNaCena` (de `amongus3/tempo.ts`, funções puras) usando `registro.tempoMs` como "quadro da partida" e as palavras do narrador (ex.: "Aí, faltando quatro segundos..." <- `registro` do último item). Como os clipes já existem em MP4, a velocidade vira `playbackRate` por segmento (`Segment.rate`) + selo "⏩ 2×" (copiar `SeloVelocidade` de `amongus3/Jogo.tsx` e exportar). Sem congelar o final do clipe.
3. Narração e vozes. Gabriel como narrador. Escolher uma voz por IA (para `fala` e `pensamento` do log), dentre as 15 já usadas, sem repetir a do narrador, ou fixar uma por empresa e reutilizá-la em todo o vídeo; `OCFrase` -> `S60Frase` (usa o mesmo molde: chef/IA à esquerda, balão `modo='pensa'|'fala'`) ou o balão `PENSAMENTO SECRETO` já existente na tela do diário em `Dia.tsx` (nuvem no rodapé, 27 px, hoje dura ~3 s).
4. Cartões. `Cartao` em `Previa.tsx` -> `S60Titulo` com a cor da empresa (`EMPRESA`/`COR_EMPRESA`), mini-ícone da família, `[[s:largada:0.5]]`-equivalente (`sfx.json`: `whoosh` ou `impact-epic`), `lead` 0,5 s e sem trilha (`SEM_TRILHA`).
5. Dia 2D. Hoje cada dia dura `duracaoDia(d) = 2,6 + (5,5 se escolha manual senão 1,2) + 2,4 x linhas do diário + 2,2` s (em `ep5_gpt` média 20,1 s por dia, 582 s no total). Escolher 8 a 12 dias por partida; nos que ficarem, `vel` entre 1 e 2 e sempre com o selo; nunca 3x. O pensamento da IA fica na tela 3 s e a narração deve citá-lo ("E no pensamento:"), como no OC.
6. Grade 2x2 de coletas. Para o bloco 2 (erros de ep1) e o placar: nova cena `S60Grade` com 4 `OffthreadVideo` em 960x540, no molde de `OCJogo modo='grade'` (bordas pretas 3 px, rótulo central).
7. Placar e números. `OCPlacar`/`OCNumeros` como base: colunas "dias vividos / quem morreu / itens quebrados" por IA, linhas ordenadas, 1º em dourado.
8. Legendas: o `Captions` seletivo funciona igual; adicionar à lista `TERMOS` do `build_timeline_s60.py` os nomes que a voz soletra mal (60 Seconds, Osvaldo, Celeste, Juju, Tico) e a `PRONUNCIA` equivalente.
9. Trilha por bloco com a mesma lógica de `CUES`; uma faixa por capítulo da partida, trocando entre coleta (tensa) e abrigo (triste).

### 7.3 Não reaproveitar
`AU*Telas` de reunião/votação (não há reunião), sons do jogo (`SonsJogo`, `Sons`), `Transicoes.tsx` (restrito a `AU*`) a menos que se queira o mesmo corte com `iris`/`estrelas` entre coleta e abrigo (decisão editorial).

---

## 8. A prévia atual (`video/remotion/src/sessenta/Previa.tsx` + `video/scripts/previa_s60.py`): o que está fora do estilo

Dados da prévia (`public/sessenta/previa/dados.json`): 15 segmentos, 139,9 s. 5 são cartões estáticos (41,3 s, 30% do tempo), 4 são clipes 3D (60,9 s, 44%), 5 são dias 2D (31,1 s, 22%), 1 título (6,6 s).

Por ordem de gravidade:
1. Congela o quadro final do clipe e ainda deixa o narrador falando por cima (`Clipe` usa `Freeze` quando `f >= durClipe`). O `abertura.mp4` tem só 4,0 s e o segmento 10,6 s: 6,6 s (62%) de imagem parada com narração. `luna1` congela ~3,7 s; `terra_fim` cabe (clipe 18,5 s para 18,5 s de segmento). O canal nunca congela no meio da ação (`tempo.ts`: "Nunca congela no meio"; só `congela` pontual em `f111`); resolve com `playbackRate` menor (`VMIN` 0,3) ou cortando para outro plano.
2. Cartões estáticos longos com narração longa: o "AVISO" dura 14,2 s com 13,6 s de fala sobre um único texto. No canal, o texto de apoio acompanha animação (ver `AU3Nave`) e a ressalva legal vai em frase curta (cena de ~10 s) e na descrição. Os demais cartões ("GPT LUNA", "REVANCHE", "GPT TERRA", "GPT TERRA: 12 DIAS") têm 5 a 8 s e são aceitáveis como `OCTitulo`, mas faltam o efeito `largada`/`whoosh` e o `lead` de 0,5 s com a música cortada.
3. Sem os componentes do pipeline: nenhuma legenda seletiva (`Captions`), nenhum meme (`MemeCard`), nenhum `[[t:]]` (número grande, ex.: "FALTANDO 4 SEGUNDOS", "12 DIAS"), nenhum `[[p]]` de soco, nenhum `[[x:]]`/TRIGGERED. O canal tem ~2 memes por minuto e algum destaque de número em quase todo bloco; a prévia tem 0 em 140 s.
4. Não usa o pipeline (`SceneView`, `build_timeline_*`, `mix_audio.py`, `montar_cenas_*`): é uma composição isolada (`S60Previa`) que monta áudio dentro do Remotion. Consequência: sem cache por cena, sem trocar uma frase sem refazer tudo, sem ducking (a trilha é um volume fixo, `trilha.vol` 0,12 e 0,16), sem `loudnorm -14` no próprio fluxo (o script que gerou `s60_previa_final.mp4` não está no repositório).
5. Trilha fora da calibração do `music.json`: `heartbreaking` tem `suggested_bg_volume` 1,0 (loudness -31,2 LUFS) e a prévia usa 0,16, ou seja, cerca de 5x mais baixo que o padrão do canal (0,85 após `MUSIC_GAIN`). `mega-hyper-ultrastorm` usa 0,12 contra 0,17 x 0,85 = 0,14 do padrão. Só 2 faixas em 140 s (o canal troca a cada ~80 s e por tipo de cena: tensão, pensamento, resultado).
6. Aceleração sem aviso: `Dia vel={Math.max(1, Math.min(3, duracaoDia(...) / s.dur))}` empurra o dia até 3x, sem selo "⏩ n×". O canal só passa de 1x quando o selo está na tela e limita a `vmax` 2 (OC chega a 4x só em resumo longo com "ACELERADO 4×").
7. Sem sincronia palavra-evento: os efeitos são presos ao fim do clipe (`sad-trombone` a 75 quadros do fim nos clipes `luna*`, `explosion` a 105 quadros do fim nos demais), e a narração cobre o clipe inteiro. O canal faz o evento acontecer na palavra (âncoras/`tk`/`mapaTempo`), com o efeito logo antes da palavra.
8. Falas só de narrador: a IA não tem voz nem balão sincronizado (os "Vou pegar sopa!" do clipe são o texto do log embutido no render 3D, sem voz). O canal faz ~20-26% do tempo com a voz das IAs e o narrador cita o pensamento ("pensamento secreto") lido em voz de personagem.
9. Efeitos soltos e constantes: `sfx/swoosh-air.mp3` em todo cartão (vol 0,5), `sfx/explosion.mp3` em todo clipe de coleta (0,6): repetitivo. O canal varia (`[[s:...]]` por lance) e usa o catálogo `sfx.json`.
10. Narração por segmento tem 1 só fala longa por cena (4,5 a 18 s); o canal alterna narrador / IA / narrador em ~3 a 5 batidas por cena de 20 s e termina cada cena com uma frase curta de gancho.
11. Falta capítulo no meio: título, cartões de IA e prévia de dias são uma lista plana; o OC marca capítulos (`CHAPTERS`) que viram os capítulos do YouTube na descrição (`youtube/descricao_oc.md`).
12. O contador `0:58` do `Titulo` desce de 60 para 56 em 6,6 s e não bate com o 0:57 do primeiro quadro da coleta; é decorativo, mas induz leitura errada do relógio. Melhor manter o mesmo relógio do jogo (como o HUD de `Cozinha3D`).

O que a prévia já faz certo e deve ficar: narração com Gabriel pelo mesmo `b.tts`, números por extenso, tom irônico ("Eles parecem mais felizes. A radiação é a mesma."), cartão de revanche com contagem de partidas, cartões com cor da empresa, `FICOU DE FORA` como golpe visual, diário que abre pela direita no `Dia.tsx`.

---

## 9. Pendências e o que não consegui verificar
- `remotion/public/sessenta/coletas/` está vazio nesta cópia (os vídeos 3D ficam fora do git, conforme o commit "vídeos pré-renderizados fora do git"); os clipes existentes estão em `remotion/public/sessenta/previa/` (`abertura.mp4`, `luna1.mp4`, `luna2.mp4`; `terra_fim.mp4`). Não vi os clipes por partida do ep5.
- Os logs de DeepSeek e Claude do ep5: só encontrei `sessenta/logs/ep5_claude.json`; `ep5_deepseek` não está na pasta. Não abri os desfechos e não estimei dias vividos de nenhum dos dois.
- Os números "30 dias" (GPT Terra) e "23 dias" (MiniMax) vêm do coordenador; para `ep5_gpt` contei 29 dias registrados (sem os dias de "virada") em `partidas/ep5_gpt.json`.
- Os guias detalhados da edição do AU3 e do roteiro estão em outros arquivos; neste só usei medidas de comparação.
