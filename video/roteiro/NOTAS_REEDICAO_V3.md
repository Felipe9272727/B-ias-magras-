# Reedição do vídeo 3 (pedidos do Felipe após ver os primeiros pedaços)

1. Tirar "terceiro EP dos Jogos Vorazes" e afins do roteiro: não existe isso. Se precisar, é o "terceiro vídeo do canal", ou nada.
2. SEM SPOILER: a abertura/gancho não pode revelar quem vence nem quem trai (Opus × Haiku 2). Gancho só com tensão e mistério.
3. Cenas "pausadas": trechos em que a imagem fica parada enquanto o narrador fala. Toda cena precisa de movimento:
   câmera lenta no mapa (zoom/pan), tributos andando, balões entrando, cortes mais curtos, clipes do Blender em loop ou mais tomadas.
4. Ajustes já anotados pelo vigia: rótulos de nome sobre personagens; texto [[t:...]] cobrindo o selo ELIMINADO / nome no ILMorte.
5. Depois: re-render completo (scripts/pipeline3.sh, apagar out/pedacos/Video3), mix, thumbnail, título, descrição e Shorts.
6. Do vigia (detalhes): tag de personagem cobre rótulo de zona ("Campo Aberto", p003); sprites sobre rótulos "DeepSeek 1"/"Floresta Densa" (p003);
   balão do Qwen Max cobre "Ruínas" (p002); clipe cobre parte do nome no ILMorte (p004). Log completo em ilha/logs/vigia.log.

## MUDANÇA GRANDE (pedido do Felipe): nada de mapa visto de cima — tem que PARECER 3D de verdade
Plano para a próxima sessão:
- Gameplay renderizada no Blender (ilha 3D + tributos low-poly com rig de personagens.py), câmera de jogo em 3ª pessoa / cinematográfica
  seguindo os tributos: andando entre zonas, coletando, bebendo no Lago, fogueira à noite, névoa (volume roxo), maré, ataques e mortes.
- Um "diretor" em Python lê ilha/logs/partida*.json e gera as tomadas por turno (quem está onde, quem fala, quem ataca) → PNGs por quadro
  (EEVEE, retomável), com a mesma lógica dos turnos. Iluminação muda por período (manhã/tarde/noite).
- Remotion só por cima: HUD (dia/período/vivos), balões de fala presos ao personagem (posição projetada exportada do Blender em JSON),
  cartões de pensamento, ELIMINADO, legendas, memes.
- Roteiro e vozes refeitos a partir disso (corrigindo itens 1–3 acima); usar Haikus para o trabalho braçal e economizar cota.
