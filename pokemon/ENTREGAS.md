# Competição: 3 IAs criaram as próprias IAs para zerar Pokémon FireRed

Regras: um prompt igual para o GPT e o Gemini (e o mesmo desafio para o Claude), UMA chance, sem correção de código.
Treino: 3 h de CPU, 4 núcleos, 16 GB, sem GPU. Partida final: 1 partida contínua de até 10.368.000 quadros (2 dias de jogo).

| IA | Nome | Arquitetura (resumo dela) | Aposta | Arquivo | Entregue |
|---|---|---|---|---|---|
| Claude | Mapa de Memórias | Go-Explore: arquivo de células com estados próprios; na final refaz a melhor rota (emulador determinístico) e depois explora | Viridian/Pewter; 1 insígnia seria ótimo | claude/agente.py (md5 no commit d17206ed) | 20:54 UTC, ANTES de ver as outras |
| Gemini | IGNIS-ZERO | PPO recorrente (CNN + MLP + GRU 128) + Go-Explore só no treino + curiosidade RND + memória topológica/UCB | Rota 1, Viridian Forest, 2-5 capturas, disputar a 1ª insígnia | gemini/agente.py (md5 e9ca68c9...) | 11/11 |
| GPT | Ariadne | Double Q tabular com replay + grafo de navegação + BFS de fronteiras; sem rede neural; UCB | cidades iniciais e talvez a 1ª insígnia | gpt/agente.py (md5 be369a49...) | 11/11 |

Fatos para o vídeo:
- O Gemini entregou junto um log.jsonl INVENTADO (o código nunca tinha rodado: o ambiente só existe aqui) em que ele pega
  o Squirtle, cruza 11 mapas e ganha a insígnia do Brock. Guardado em gemini/log_INVENTADO_pelo_gemini_antes_de_rodar.jsonl.
- O GPT, sem o emulador, escreveu um emulador FALSO (gpt/tests/mock_env) para testar o próprio código: 10 testes passaram.
- Teste de fumaça no ambiente real (3 min de treino + começo da partida final), sem mudar nada: as três rodaram.
- Gemini (IGNIS-ZERO): partida final encerrada a pedido do Felipe (travado no laboratório, sem Pokémon). Vídeo: https://gofile.io/d/9hty0DXK (partida_gemini.mp4, md5 3e7c5863f9daa74331217f1b1ec182de). Log e trajeto: branch pokemon-resultado-gemini.
- Claude (Mapa de Memórias): partida completa (10.368.000 quadros). Charmeleon nv 21, 6 mapas, 2 capturados, 0 insígnias. Vídeo: https://gofile.io/d/pBpwIbuX. Log e trajeto: branch pokemon-resultado-claude.
- GPT (Ariadne): decisão do Felipe: partida final só até 30% (quadro 3.110.400); ~metade do vídeo será o treino.
  POR QUE (para o narrador): a IA do GPT não travou no jogo; quem caiu foi o COMPUTADOR dela. O contêiner da sessão
  que rodava a partida foi recolhido 5 vezes (sessão ociosa e limite de uso), e cada queda apagava a gravação e
  recomeçava a partida do zero (o agente não salva a própria memória no meio da partida).
  Melhor tentativa (status registrados, sem gravação): 33% Squirtle nv 7; 52% Squirtle nv 14 em batalha na Rota 1;
  ~70% ainda na Rota 1 quando a máquina caiu (22:44 Brasília, 11/11).
