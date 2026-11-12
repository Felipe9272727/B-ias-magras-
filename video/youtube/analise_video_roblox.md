# Por que o vídeo do Roblox foi mal (análise das primeiras ~4 h, 12/11)

Título publicado: "Coloquei uma IA pra jogar ROBLOX SOZINHA... e ela controla TUDO" (10:58, 11/11 às 18h).
Fontes: prints do Studio, `yt-dlp` (metadados e comentários públicos), roteiro `rbx_gera_roteiro.py`, CLAUDE.md. A curva de retenção ainda não saiu: o que é de retenção abaixo é hipótese.

## Resumo
O problema principal é CLIQUE, não retenção. Quem abriu o vídeo gostou (comentários e curtidas bons); o que faltou foi gente abrindo. A hipótese do tamanho explica só os números de tempo (duração média e horas), não a queda de visualizações.

## Causas, em ordem de peso

### 1. Tema e formato fora do que o canal vende (clique)
- Prova: o Studio diz que os inscritos clicaram menos (queda de 46%; 537 contra ~1.000 esperadas). 360 das 537 views vieram de recomendações e 100 de páginas do canal: quem já conhecia o canal foi pouco.
- Comparação (views finais, `yt-dlp`): Among Us 262 mil, 47 mil, 24 mil, 24 mil; todo o resto, exceto o 1º Lobisomem (35 mil), fica entre 1,8 e 7,6 mil (Mario, 60 Segundos, Overcooked, Minecraft, Bomba, Impérios). O público do canal clica em Among Us; este é um jogo novo, e o 1º vídeo com UMA IA só e gameplay real de Roblox.
- A miniatura (rosto de avatar Roblox + "É UMA IA?!") não tem a marca que vende nos outros: número grande em vermelho ("12 IAs", "15 IAs", "20 IAs", "6 IAs") + logos dos modelos. Na grade de recomendados ela parece de outro canal.
- O que fazer: miniatura sempre no molde do canal (número + logos dos modelos + 1 frase de conflito). Se o vídeo for de um jogo novo, pôr o jogo que o público já conhece e o elenco de IAs (ex.: "3 IAs no Roblox: Claude, GPT, DeepSeek"), não uma IA só. Alternar jogo novo com formato que já provou (Among Us, Lobisomem).

### 2. Título, miniatura e vídeo prometem coisas diferentes (clique)
- Título: poder ("SOZINHA", "controla TUDO"). Miniatura: adivinhação ("É UMA IA?!"). Vídeo: comédia de uma IA que morre 8 vezes e jura que está viva, com o Felipe do lado (não é "sozinha"). O título que a gente recomendou em `descricao_roblox.md` ("...ela morreu 8 vezes e não admitiu nenhuma") tinha o gancho engraçado e específico, e não foi o publicado.
- Os que deram certo seguem "Coloquei N IAs pra jogar X (e <surpresa concreta>)". Este não tem número nem parêntese.
- O que fazer: título = a piada mais concreta do vídeo ("e ela jurou que estava viva depois de morrer 8 vezes"), sem prometer o que o vídeo não mostra; miniatura mostrando a mesma cena (o "VIVO" em cima do morto), não uma pergunta genérica.

### 3. Duração: explica o tempo, não as views (hipótese do Felipe)
- Honestamente: o aviso "4:01 abaixo da média" e "74 h abaixo" são em boa parte efeito de comparar 11 min com um canal de 26 min em média (16 vídeos, `yt-dlp`). Um vídeo de 10:58 NÃO consegue ter média de 8:12.
- Proporção: 4:11 de 10:58 = 38%. Já 25,7 h / 537 views = 2:52 por view = 26% (os dois números do Studio não batem, são parciais). O canal faz ~6:00 por view em ~26 min (~23%). Ou seja, em porcentagem a retenção está igual ou melhor que a média do canal.
- Views não seguem a duração: 14,5 min (Mario) teve 1,8 mil, mas 17,6 min teve 5,9 mil e 22,7 min teve 35 mil; o 262 mil tem 33 min. Quem decide é o tema/clique.
- Efeito possível, a confirmar: YouTube expande o vídeo conforme minutos assistidos por impressão; a curva de duração média sobe até ~4:30 e cai para ~3:30 conforme chega público novo (print 23), sinal de que o público frio sai cedo.
- O que fazer: não alongar por alongar. Manter 10-15 min se a história pede, mas com o clímax mais perto do fim (ver 4).

### 4. Pontos fracos de retenção no roteiro (hipótese; conferir na curva)
- Mesma piada repetida: "morri/ninguém morreu/tô vivo" aparece em a2, c2, h2, k2, s2-s3, m4 e q5 (ao menos 8 cenas). A regra do CLAUDE.md é cortar repetição e variar finais.
- Jargão e explicação cedo: abre o clímax (bom), mas logo depois vem "Jev, Haiku, três IAs" (p1) e "Haiku/Sonnet/Opus" ao longo de todo o vídeo, nomes que quem veio pelo Among Us não conhece.
- O "grande momento" (7:36) é um erro de limite da assinatura (`You've hit your five hour limit`): promete "o mais forte de todos" e entrega um aviso de erro. O Opus nunca joga de verdade. Depois vêm "72 minutos depois", gravações perdidas (g1-g5, só prints, ~1 min) e placar: o fim é o trecho mais fraco, contra a regra "melhor parte por último".
- Revisão dos Haikus ficou em média 5,8 (partes com nota 4-5 por tela parada e repetição); a nota é do rascunho e não temos prova de que tudo foi corrigido na v4.
- O que fazer: no máximo 3 mortes "negadas" (as melhores, com contagem crescente); explicar cérebro/modelos em 1 frase só quando mudam; guardar o melhor momento real para o último quarto; nunca terminar com "gravação perdida" (gravar 2 cópias).

### 5. Fatores menores
- Cadência: 4 vídeos entre 2 e 6/11 (Lobisomem 2, Bomba 4, Impérios 5, Zumbi 6) e depois o Roblox em 11/11, já com Short no mesmo dia. Pode ter cansado os inscritos, mas não dá para provar. Sugestão: 1 vídeo longo por semana, Short entre eles.
- Hype 0 e receita 0 são consequência do alcance pequeno, não causa.

## O que NÃO foi o problema
- Qualidade percebida: 32 curtidas / 496 views = 6,5% (Zumbi 3,6%, Lobisomem 3,5%) e 15 comentários = 3% das views (Zumbi 1,2%). Comentários: "Melhor vídeo", "faz mais vídeos assim", "ficou muito mais interessante ver a IA jogando no jogo original". Há demanda: pedem parte 2.

## Próximo vídeo (checklist)
1. Miniatura no molde do canal (número + logos + conflito) e título com número e parêntese concreto, igual aos vencedores.
2. Jogo novo só com elenco de várias IAs e uma regra que o público entenda em 10 s.
3. Um único "segredo" explicado em 1 frase; sem listas de modelos.
4. Melhor momento no último quarto; nada de fechamento com "gravação perdida".
5. Quando a retenção sair (até 2 dias), conferir onde a curva cai (0:30, 2:57 e 7:36 são os suspeitos) e atualizar esta análise.
