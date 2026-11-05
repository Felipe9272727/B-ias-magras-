# chaves-ias (mod do Claude Code)

Guarda as chaves de API dos vídeos no armazenamento do mod (nunca no repositório) e mascara no histórico do chat
qualquer texto com cara de chave (`sk-or-v1-`, `sk-`, `sk_`, `sk-ant-`, `xi-`, `ek_`).

- `/chave openrouter <chave>`, `/chave deepseek <chave>`, `/chave elevenlabs <chave>`: guarda.
- `/chave <servico>` sem valor: apaga. `/chave` sozinho: lista (mascarado).
- Os scripts (`amongus/ia.mjs`, `chaveDoMod`) leem `/root/.claude/plugins/store/chaves-ias*.json`.

Este código NÃO contém chave nenhuma. Num contêiner novo: pedir ao Claude para "reinstalar o mod chaves-ias do repositório"
(ele copia esta pasta para a pasta de mods da sessão) e guardar as chaves de novo com `/chave`.
Para as chaves sobreviverem a reinícios do contêiner, o lugar seguro é o ambiente (Network secrets / variáveis
`OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `ELEVENLABS_API_KEY`), que os scripts também leem.
