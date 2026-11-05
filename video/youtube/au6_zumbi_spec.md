# AMONG IA 6 — ESPECIAL DE HALLOWEEN: MODO ZUMBI (especificação)

Pedido do Felipe (5/11). O que está marcado **[Felipe]** é decisão dele; **[proposta]** é escolha nossa, pode mudar.

## Elenco
- **[Felipe]** **20 jogadores.** Mesmo elenco do AU5 + **Tencent HY4** e **Liquid LFM 2.5 24B** (9 modelos).
- **[Felipe]** Não precisa ser só modelo pequeno: os mais eficientes e inteligentes, para ter mais caos.
- **[Felipe]** O motor do Among Us continua como está (`amongus/jogo5.mjs` intocado); o modo zumbi é um motor SEPARADO
  (`amongus/zumbi.mjs`), reaproveitando só utilidades (chamada das IAs, log).
- (antes:) Mesmo elenco do AU5 + 1 modelo novo. AU5 (18 jogadores): MiniMax M3.1 Flash, Claude Haiku, GLM 5.3 Flash,
  Qwen 3.8 27B, GPT-6.1 Terra, DeepSeek Flash, MiMo V2.6 Flash. Modelo novo: a escolher (lista no fim).
- **[Felipe]** Saídas das IAs 100% verídicas: falas, pensamentos e ações vêm do log, nunca editadas nem inventadas.

## Mapa
- **[Felipe]** MIRA HQ com tema de Halloween. **[proposta]** Mesmas salas e corredores do Mira HQ (laboratório, estufa,
  refeitório, escritório, comunicações, vestiário, descontaminação, lançamento, reator, enfermaria, balcão),
  à noite: luz roxa/laranja, abóboras, teias, neblina no chão, lâmpadas piscando. Arte própria em SVG/pré-render.

## Zumbis
- **[Felipe]** Mordido: fica com **contorno verde** (só para mostrar a mordida) durante a incubação.
  Quando vira zumbi de verdade: **totalmente verde e com skin diferente** (zumbi).
- **[Felipe]** Paciente Zero: no começo **ninguém sabe quem é, nem ele mesmo**.
  **[proposta]** Ele vira zumbi sozinho depois de ~6 tiques (sem aviso antes); a partir daí ele sabe.
- **[proposta]** Quem é mordido SABE que foi mordido (sente a mordida) → pode esconder ou pedir ajuda. É a fonte de mentira.
  Incubação de ~5 tiques; o Doutor pode curar enquanto ainda é contorno verde; depois de virar, não tem cura.
- **[Felipe]** Tipos de zumbi: normal, grande, rápido e outros. **[proposta]**
  - **Normal**: morde quem está na mesma sala.
  - **Grande**: quebra barricada em 1 tique; o atordoamento dura metade.
  - **Rápido**: anda 2 salas por tique.
  - **Cuspidor**: morde de uma sala vizinha (alcance), mas tem recarga maior.
  - **Uivador**: ouve as conversas das salas vizinhas e, 1 vez, solta um uivo que assusta (humanos da sala fogem 1 sala).
  O tipo é sorteado quando o mordido vira zumbi.

## Sem reunião: conversa por proximidade
- **[Felipe]** Não há reunião nem votação. **[proposta]** A cada tique, cada jogador fala no máximo 1 frase que só quem está
  na MESMA sala ouve (o Uivador ouve as vizinhas). O vídeo mostra o balão em cima de quem fala.

## Loja: armas e barricadas
- **[Felipe]** Dá para comprar armas e barricadas. Armas NÃO matam: **só atordoam o zumbi por um tempo**.
- **[proposta]** Moeda = tarefas feitas (cada tarefa dá moedas). Loja no Refeitório (ou terminal em qualquer sala):
  - **Taser** (atordoa 1 zumbi da sala por 3 tiques; 2 cargas).
  - **Barricada** (fecha uma porta por 6 tiques; zumbi normal leva 2 tiques para quebrar, grande 1).
  - **Lanterna UV** (atordoa todos os zumbis da sala por 1 tique; 1 uso).

## Profissões (humanos)
- **[Felipe]** Sobrevivente, Doutor, Paciente Zero (secreto, nem ele sabe), Enlouquecido (neutro, regra nossa).
- **[proposta]**
  - **Sobrevivente**: faz tarefas, ganha moedas, compra itens.
  - **Doutor**: cura 1 mordido (contorno verde) a cada 8 tiques; sabe quem está mordido se estiver na mesma sala.
  - **Enlouquecido** (neutro): imune à PRIMEIRA mordida e ninguém sabe disso. **Ganha sozinho se, no amanhecer, for o
    último humano não mordido OU se os zumbis vencerem com ele ainda humano.** Pode mentir à vontade, abrir barricadas
    (sabotar) e guiar humanos para a horda.
  - **Engenheiro**: barricada de graça a cada 6 tiques e conserta barricada quebrada.
  - **Vigia**: na sala de comunicações vê as câmeras (onde estão os zumbis) e pode avisar quem estiver por perto.

## Objetivo e vitória
- **[proposta]** Humanos: sobreviver até o **amanhecer** (tique 60) OU completar o **rádio de resgate** (barra de tarefas)
  e chegar à sala de Lançamento. Zumbis: todos os humanos mordidos/zumbis antes disso. Enlouquecido: regra acima.

## O que o espectador sabe antes das IAs (regra do canal)
- Quem é o Paciente Zero desde o começo (selo + contorno discreto só para o espectador), relógio da incubação de cada
  mordido, placar Humanos · Mordidos · Zumbis · Rádio, pensamento secreto com ECO. Sem emoji: ícones em SVG.

## Modelo novo (candidatos recentes, baratos, OpenRouter)
- Tencent HY4 (lançado 4/11; US$ 0,42/1,25 por M tokens)
- Ripple 65B preview (4/11; 0,20/0,60)
- Liquid LFM 2.5 24B-A2B (13/10; 0,05/0,70) — bem pequeno
- Inception Mercury 3 (16/10; 0,10/0,35) — modelo de difusão, muito rápido
