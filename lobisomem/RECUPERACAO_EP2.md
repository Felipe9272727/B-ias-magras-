# Checkpoint de recuperação — 31/10/2026

O ambiente local ficou indisponível durante a noite 2 da primeira partida.
Nenhuma das quatro partidas novas foi concluída. A última resposta ainda acessível
está em recovery/ultima_resposta_recebida.json e NÃO é um log de partida completa.
As demais respostas e o vídeo de abertura renderizado dependem da recuperação do
disco do ambiente anterior. O áudio da abertura permanece no ElevenLabs: seus IDs
de fluxo, geração e sessão estão em video/remotion/public/voice_lobo_ep2/abertura.source.json.

Este checkpoint restaura as mudanças recuperáveis do código e o elenco corrigido.
Gemini 2.5 Flash Lite e Mistral Small 2603 saíram. Ling 3.1 Flash e Solar Mini 4
entraram. Todos os modelos selecionados foram verificados no catálogo entre agosto
e outubro de 2026. Papéis novos: Padre, Xerife, Vidente Espiritual, Detetive,
Prefeito e Lobo Alfa. São funções oficiais, não profissões inventadas.

A reconstrução do motor passou por verificação de sintaxe e uma partida sintética
em memória, identificada como synthetic. Os testes completos em Node e a revisão
visual precisam ser repetidos no runner após este commit. Não usar o resultado
sintético no vídeo.

Regras editoriais: no mínimo 25 min; alvo 28–32 min; máximo do canal ~35 min.
Abertura com os comentários reais e “finalmente chegou a parte 2”. Sem emojis.
Preservar a edição da primeira parte, pensamentos em voz normal com eco, sem lobby.
Variar trilhas por clima, aplicar o ducking existente e creditar as faixas utilizadas.

Uso da conta OpenRouter observado desde o começo desta produção: diferença de
US$ 0,061152085 (17,114690159 menos 17,053538074). Esse é um delta da conta,
não uma atribuição perfeita por chamada. Mantém-se o teto inicial total de US$ 2.
Não reiniciar inferências pagas antes de confirmar uma execução recuperável.

## Nova recuperação em 31/10/2026

Ponto de partida efetivamente encontrado: `dbad6d2`, posterior ao checkpoint
`6d4eb0f`. O Actions `41213911435` terminou com sucesso; suas prévias estavam
versionadas, sem artefatos adicionais para baixar. Histórico do Git, branch de
recuperação, busca de arquivos e contexto anterior não forneceram as decisões
integrais da partida 5. O fragmento da Luna foi mantido sem alterações. Não se sabe
o resultado da noite 2. A consulta ao OpenRouter confirmou a geração e custo de
US$ 0,0002743; isso não recupera as outras respostas.

O MP3 da abertura foi recuperado diretamente da geração existente do ElevenLabs.
Está em `video/remotion/public/voice_lobo_ep2/abertura.mp3`, duração 26,906122 s,
com SHA-256 registrado no arquivo source. Nenhuma voz foi gerada novamente.
Uma nova montagem dessa abertura tem 27 s, com componentes do canal, trechos de
comentários conferidos, duas faixas do catálogo, ducking e upscale Lanczos a 1080p.
É uma PRÉVIA da abertura, não o vídeo final nem o render perdido do ambiente antigo.

Foram recuperadas a análise já existente do vídeo original no vidIQ (0 créditos
adicionais) e as oito faixas do catálogo. Os dez modelos do elenco foram
consultados no catálogo atual, sem inferência. Os preços máximos do elenco foram
mantidos como reservas conservadoras; há descontos de horário no catálogo.

### Retomada e preservação

- `durabilidade_ep2.mjs` salva os pedidos e as respostas de cada decisão, por
  personagem, incluindo o generation ID. Replay só aceita a mesma semente,
  configuração, memória e código, e reutiliza as respostas preservadas.
- `checkpoint_ep2.py` reúne logs e transporte em `recovery/checkpoints/current.json`.
  Salvar esse arquivo pelo conector GitHub, ou usar `--push` onde o CLI esteja
  autenticado. Antes de novas chamadas após respostas concluídas, a ponte faz uma
  leitura do remoto e exige as respostas e o ledger já preservados ali. A falta
  do checkpoint bloqueia novas cobranças. Repetir o salvamento no fim da execução.
- Depois de clonar o projeto, `checkpoint_ep2.py --restore` restaura o snapshot
  sem substituir arquivos locais diferentes. Respostas incertas permanecem
  reservadas; não são reenviadas silenciosamente.
- O orçamento novo carrega US$ 0,061152085 de reserva do delta anterior da conta.
  Não somar novamente a geração da Luna, que já está dentro desse período.
- A partida 5 permanece bloqueada por `recovery/status.json`, e 6–8 exigem a
  predecessora concluída. Não remover esse bloqueio para fingir uma recuperação.
  É preciso o estado original completo ou autorização do criador para substituir
  somente a partida interrompida, arquivando o fragmento.

### Verificações realizadas

14 testes Node passaram (incluindo integridade, replay, isolamento privado e
orçamento), além de 1 teste Python de restauração com conflito. TypeScript dos
componentes de prévia passou. A prévia foi renderizada e inspecionada por quadros;
o retrato deslocado foi corrigido, assim como o tempo de entrada dos 16 jogadores.
Detalhes editoriais e limites: `recovery/FIDELIDADE_EP2.md`.
Conferência das regras e divergência documental do Alfa:
`recovery/REGRAS_VERIFICADAS.md`.

Estado real: 0/4 partidas concluídas; episódio de 25–35 minutos, vozes das novas
partidas, juiz, montagem final e revisão editorial por quadros ainda pendentes.
