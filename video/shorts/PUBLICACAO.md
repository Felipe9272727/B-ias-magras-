# Shorts de 9 a 12 de outubro de 2026

Quatro edições verticais, 1080 × 1920, 30 fps. Narração do Gabriel já salva no repositório; nenhuma nova síntese ou consumo de créditos da ElevenLabs. Datas sugeridas, sem upload ou agendamento no YouTube.

| Dia | Arquivo | Duração | Título |
|---|---|---|---|
| Sexta, 09/10 | `01-ia-pega-no-flagra.mp4` | 22,33 s | A IA entrou no duto na frente de 3 pessoas 🤦 #shorts |
| Sábado, 10/10 | `02-ia-simula-o-pulo.mp4` | 21,63 s | A IA zerou Mario de primeira. Como? 🧠 #shorts |
| Domingo, 11/10 | `03-impostor-engana-o-parceiro.mp4` | 25,80 s | A IA fingiu tarefa para o próprio parceiro 🤡 #shorts |
| Segunda, 12/10 | `04-tres-ias-travadas-no-mario.mp4` | 33,53 s | 3 IAs tentando passar do começo do Mario 🎮 #shorts |

## Descrições prontas

### 01 — Pega no flagra
Coloquei IAs para jogar uma simulação de Among Us. O impostor evitava atacar perto dos outros… e acabou entrando no duto com 3 pessoas olhando. As decisões vêm do log da partida; o replay reconstrói esses acontecimentos.

#shorts #AmongUs #InteligenciaArtificial

### 02 — O simulador
No nosso experimento com 4 IAs no Mario, a adaptativa completou as 32 fases: 48 dos 64 agentes chegaram ao final. O segredo era simular a física antes de escolher o pulo. A comparação com “gabarito” é uma brincadeira sobre o planejamento, não uma conclusão sobre toda IA. Este Short mostra uma visualização animada dos resultados e do algoritmo.

#shorts #Mario #InteligenciaArtificial

### 03 — O parceiro
O impostor passou 7 tiques fingindo tarefa do lado do próprio parceiro, que já sabia o papel dele. Essa partida da simulação de Among Us terminou com os tripulantes vencendo por tarefas e sem mortes. Replay reconstruído a partir das decisões registradas pelas IAs.

#shorts #AmongUs #IA

### 04 — As três tentativas
Neuroevolução, Double DQN e Rainbow no nosso experimento de Mario: 402 gerações na primeira; 528 gerações e 10 bandeiras no DQN; 8.881 bandeiras acumuladas no Rainbow. Nenhuma dessas três zerou nesse treino. Bandeiras acumuladas incluem fases repetidas — não são 8.881 fases diferentes. Visualização animada dos dados do experimento.

#shorts #Mario #AprendizadoPorReforco

## Fontes e edição

- Base: `claude/video-3`, commit `11c7f369ccb43b9894cf4a4c5996ab29ac69e11a`.
- Among Us: `remotion/public/amongus/partida1.json` e `remotion/public/short2/`.
- Mario: `data/runs_canon/{evolution,ddqn,rainbow,adaptive}/summary.json` e `remotion/public/short_mario/`.
- Os Shorts de Mario usam diagramas e placares animados. As gravações de gameplay ignoradas pelo git não estavam disponíveis; nenhuma gravação foi inventada ou substituída por resultado fictício.
- Efeitos sonoros existentes: consultar `youtube/creditos_assets.md` e `remotion/public/sfx/sfx.json`.
- Sem trilha externa obrigatória: voz e efeitos normalizados a -14 LUFS, alvo de pico verdadeiro -1,5 dBTP.
- O vídeo da ilha fica reservado para a reedição 3D; estes Shorts não antecipam vencedor ou traição.

## Refazer

```bash
cd video/remotion
npm ci
# Ajuste --browser-executable para seu Chromium, se necessário.
npx remotion render src/index.ts ShortDiarioFlagra out/shorts/01-render.mp4
npx remotion render src/index.ts ShortDiarioSimulador out/shorts/02-render.mp4
npx remotion render src/index.ts ShortDiarioParceiro out/shorts/03-render.mp4
npx remotion render src/index.ts ShortDiarioTentativas out/shorts/04-render.mp4
python3 ../scripts/finish_daily_shorts.py
```

O arquivo `src/shorts/pack.ts` escolhe os blocos de voz e calcula a duração real de cada corte. O render não faz chamadas à ElevenLabs. Para narrativas novas, gere a voz no seu painel e envie somente o MP3, ou use uma conexão que exponha síntese de voz. Nunca inclua a chave no código, nos logs ou em um commit.
