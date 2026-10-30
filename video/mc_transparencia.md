# Esclarecimentos da revisão de Minecraft

## Regra de edição do Felipe

Manter a edição o mais próxima possível das anteriores: os cortes, memes, efeitos e o timing foram escolhidos a dedo. A substituição de gameplay corrige a imagem; não autoriza remontar a história, condensar cenas ou trocar as piadas. Uma alteração de narração deve ficar restrita ao esclarecimento necessário e conservar a voz e o estilo anteriores. Esta regra também está em CLAUDE.md.

## O que os arquivos da partida mostram

A partida rodou no Minecraft Java 1.21.4 com jogadores controlados por Mineflayer. Os modelos recebiam observações em texto, não imagens da tela: vida, fome, posição, inventário, recursos e entidades próximos, chat, resultado da última ação e uma nota de memória.

Cada resposta escolhia uma habilidade e seus argumentos, com campos de pensamento, chat e nota. Código executava a habilidade. Navegação, coleta e combate usavam rotinas de controle; havia alimentação automática, reação a mobs e um reflexo para subir na água. Portanto, um comportamento ruim pode vir da decisão, da instrução, da informação disponível ou da execução. A partida não isola a capacidade geral de cada modelo.

O prompt tinha uma estrutura compartilhada com identificação de cada participante, regras e habilidades. As observações eram individuais. Os textos chamados de pensamentos no vídeo são o campo textual solicitado na resposta; não são acesso a um processo interno oculto do modelo.

Fontes do código, na versão usada como base:
- [Participantes e regras](https://github.com/Felipe9272727/B-ias-magras-/blob/32585b9be814896627fafdac06c8c818b3c41581/minecraft/partida.mjs)
- [Prompt, observações e automatismos](https://github.com/Felipe9272727/B-ias-magras-/blob/32585b9be814896627fafdac06c8c818b3c41581/minecraft/bot.mjs)
- [Habilidades do controle](https://github.com/Felipe9272727/B-ias-magras-/blob/32585b9be814896627fafdac06c8c818b3c41581/minecraft/habilidades.mjs)
- [Roteamento das chamadas](https://github.com/Felipe9272727/B-ias-magras-/blob/32585b9be814896627fafdac06c8c818b3c41581/amongus/ia.mjs)
- [Gravação original, incluindo config.json e logs de entrada](https://github.com/Felipe9272727/B-ias-magras-/blob/32585b9be814896627fafdac06c8c818b3c41581/minecraft/backup/partida1_gravacao.tar.gz)

## Identificações registradas

Os seis nomes abaixo foram conferidos no config.json dentro do backup e nos eventos de entrada de cada jogador.

| Jogador | Nome registrado | Identificador configurado |
|---|---|---|
| DeepSeek | DeepSeek V4.1 Flash | or:deepseek/deepseek-v4.1-flash |
| Qwen | Qwen 3.8 27B | or:qwen/qwen3.8-27b |
| Claude | Claude Sonnet 5.5 | sonnet |
| GPT | GPT-5.6 Luna | or:openai/gpt-5.6-luna |
| GLM | GLM 5.3 Flash | or:z-ai/glm-5.3-flash |
| MiMo | MiMo V2.6 Flash | or:xiaomi/mimo-v2.6-flash |

Limite da evidência: nome registrado e configuração não são uma confirmação independente do backend servido. O Claude usa a ponte pelo alias sonnet. No modo IA_DIRETO, o código do DeepSeek envia o alias deepseek-flash à API própria. Não foi encontrada nesses arquivos uma identificação imutável retornada pelo provedor para cada resposta. Não apresentar os rótulos como prova adicional que os logs não fornecem.

## Imagem da revisão

A gameplay está sendo reencenada no cliente real do Minecraft a partir de posições, equipamentos, mudanças de blocos e eventos gravados. As posições foram amostradas; os movimentos entre elas são reconstruídos. Não chamar a nova imagem de filmagem recuperada da sessão original.

## Fala curta preparada, ainda não gerada nem inserida

“As IAs recebem relatórios em texto e escolhem o que fazer. Um programa executa as ações no Minecraft. Então, o resultado depende das decisões delas, dos prompts e também das limitações desse controle.”

Usar a mesma voz do narrador. Preservar as falas das personagens, os memes e os cortes originais. Não substituir esse áudio por uma voz genérica. Caso seja necessário inserir um esclarecimento, tratar como um trecho pontual, sem reorganizar a montagem.

## Estado da revisão

A regra de edição foi registrada. A descrição proposta inclui método, modelos registrados, limite dos aliases, origem da reencenação e crédito da música. Qualquer nova narração depende de acesso autorizado ao ElevenLabs. A correção do ducking reutiliza as vozes e os efeitos originais com o script de mixagem já usado nas edições anteriores; nenhuma nova voz foi gerada nesta etapa.
