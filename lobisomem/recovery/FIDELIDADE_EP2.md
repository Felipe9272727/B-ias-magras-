# Referência editorial da Parte 2

Fontes revisadas: `video/roteiro/roteiro_lobo.py`, `video/scripts/build_timeline_lobo.py`,
`video/remotion/src/lobisomem/{Cenas,Tela,Avatar,Papeis,Transicoes}.tsx`, roteiros do Among Us
e análise já existente do vídeo publicado, recuperada sem nova cobrança do vidIQ.

## O que caracteriza o canal

- O narrador comenta um acontecimento específico e abre espaço para a fala real. Exemplos
  do roteiro original: a votação contra o Vidente, os dois lobos presos e o Bobo votando
  em si mesmo. A piada depende do que acabou de acontecer, sem frases genéricas repetidas.
- Alternância entre conversa pública e pensamento privado: a graça surge da contradição.
  Não escrever diálogo para criar essa contradição. Selecioná-la nos registros reais.
- Intervenções curtas do narrador, perguntas retóricas pontuais, pausas de revelação de
  papel, meme e efeito sonoro na conclusão da piada. Não colocar meme em cada frase.
- Fonte Poppins, rosa `#ff3d7f`, noite azul, avatares e colinas próprios. Chat à direita,
  papel revelado na morte e carimbo de mentira junto de quem falou. As cores precisas
  de cada modelo vêm de `Tela.tsx`, não do relatório automático do vidIQ.
- Transição de lua/sol para fases; faixas diagonais rosas nos capítulos; flash nos impactos.
  Sem lobby entre partidas. Pensamentos com voz normal e eco; nenhum emoji no vídeo.

## Evolução para 16 personagens

Manter a grade 4×4 e o painel lateral. O retrato ampliado destaca o personagem ativo,
sem trocar a estética. A revisão do render encontrou e corrigiu o SVG deslocado no
retrato ampliado: faltava fixar `left:0, top:0`. A entrada do elenco agora cabe na
duração da cena e mostra os 16 personagens antes da troca de tela.

Os três trechos de comentários foram conferidos no export
`video/youtube/comentarios_mine/lLJfOOiDbDo.json`. IDs, links e origem dos trechos estão
em `video/remotion/public/voice_lobo_ep2/comentarios.source.json`. Exibir só os trechos
registrados, com autor oculto e sem data ou número de likes inventado.

## Estrutura que depende dos resultados

A abertura recuperada é um segmento de 27 segundos, não o episódio final. Depois
das quatro partidas reais: selecionar um gancho forte, definir os blocos narrativos,
preservar a ordem quando a memória exigir e posicionar o melhor desfecho no final
quando isso não distorcer a continuidade. Medir a duração final: 25–35 minutos,
alvo 28–32. Não preencher tempo com lobby, repetição ou cenas estáticas.

Usar a seleção por clima das faixas já presentes no canal: Decisions (suspense),
Thinking Music (investigação), Sneaky Snitch (discussão), Relent (decisão),
Fluffing a Duck e Quirky Dog (humor), Heroic Age (desfecho), Monkeys Spinning Monkeys
(placar). As oito foram novamente baixadas pelos URLs do catálogo existente.
Só as faixas efetivamente usadas entram nos créditos do vídeo final. Aplicar ducking.

## Limitações da referência automática

O relatório do vidIQ descreve cores e timestamps que divergem dos arquivos originais.
As descrições do vídeo e a timeline original prevalecem para tempos exatos; os SVGs,
as fontes e `Tela.tsx` prevalecem para cores e composição. O relatório não substitui
a revisão dos quadros e do áudio final. A prévia remontada ainda não passou pela
avaliação editorial Haiku por quadros exigida em `CLAUDE.md` para entrega final.
