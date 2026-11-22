# UNO das IAs — Projeto Completo (Branch `uno-ias`)

Vídeo curto planejado (**10–14 min**) para o canal **Felipex007** seguindo 100% as regras de `CLAUDE.md`, `video/MEMORIA_TECNICA.md` e `video/IAS_FAVORITAS.md`.

## Elenco Real (7 IAs · 7 empresas)
1. **Gemini Hydrogen** (`gemini-4-hydrogen-medium`) — local/plataforma (grátis)
2. **Claude Sonnet** (`claude-sonnet-5-5-medium`) — local/plataforma (grátis)
3. **Inkling Mini** (`thinkingmachines/inkling-2-mini`) — OpenRouter
4. **DeepSeek** (`deepseek-flash` via API oficial `api.deepseek.com`)
5. **Qwen 27B** (`qwen/qwen3.8-27b`) — OpenRouter (`effort: low`)
6. **GPT-6 Luna** (`openai/gpt-6-luna`) — OpenRouter
7. **GLM Flash** (`z-ai/glm-5.3-flash`) — OpenRouter

## Estado Atual dos Logs
- **Partida 1 (`logs/partida_1.json`) — CONCLUÍDA (63 turnos):**
  - Vencedor: **GPT-6 Luna** (zerou a mão no Turno 63 achando que `A-7`/`A-9` Azuis eram Amarelos durante a partida inteira!).
  - Memórias pós-partida salvas em `logs/memorias_pos_p1.json`.
- **Partida 2 (`logs/partida_2.json`) — CHECKPOINT NO TURNO 45 (reta final):**
  - Teve empilhamento **`+6`** (**Gemini Hydrogen `+2` -> Claude Sonnet `+4` -> Inkling Mini explodindo pra 11 cartas**), `+4` do DeepSeek no Qwen, e 5 IAs com 3–4 cartas no Turno 45.
  - Próximo turno pendente: **Turno 46 (`Gemini Hydrogen`)**, salvo em `logs/pending_local_p2.json` e `logs/inbox_hydrogen.txt`.
- **Resumo completo de todas as falas e pensamentos reais:** `pacote_logs_uno.md`.

## Estrutura dos Arquivos
- `uno_rules.mjs`: motor puro determinístico de 108 cartas, empilhamento de `+2`/`+4`, Pular, Reverter, Curinga, reciclagem e denúncia de esquecimento de `"UNO!"`.
- `uno_roster.mjs`: elenco de 7 IAs e prompts de Mesa Aberta (conversa/blefe pré-rodada), turno individual (pensamento secreto + fala + jogada) e denúncia de UNO.
- `uno_clients.mjs`: clientes OpenRouter (com checagem real em `/api/v1/key`), DeepSeek API oficial, ponte local gratuita (`local:...`) e modo `--mock`.
- `uno_runner.mjs`: orquestrador com checkpoint por turno (`--retomar`), `ORCAMENTO_USD`, memória entre partidas e auto-collect/auto-prepare da ponte local.
- `uno_bridge.mjs`, `uno_check_keys.mjs`, `test_uno.mjs`, `uno_digest.py`: utilitários de ponte, teste de chaves/saldo, testes unitários e digest dos logs.
- `render/uno_canvas.mjs`: mesa 2.5D em `@napi-rs/canvas` (`1920x1080`, zero emojis, leque de cartas reais `SÓ VOCÊ VÊ`, alerta de bomba, anel giratório de sentido, balões Pensamento vs Fala).
- `render/uno_fx.mjs`: animações spring de carta voando, selos carimbados, cartão de capítulo, tela de elenco acesa por fala e pódio/prêmios.
- `render/render_uno.mjs`: renderizador 30.000 FPS compatível com 16 runners no GitHub Actions (`--only`).
- `render/uno_audio_engine.py` & `render/uno_timeline_builder.py`: ElevenLabs com **ECO `aecho`** nos pensamentos secretos (nunca sussurro), SFX reais do canal e `voice_rms` 30 FPS.
- `render/qa_uno.py` & `render/prep_uno_pack.py`: linter QA (PT-BR, zero emojis, zero memes repetidos, zero overlays cortados) e empacotador pro render distribuído.

## Como Retomar a Partida 2 do Turno 46
```bash
export DEEPSEEK_API_KEY="..."
export OPENROUTER_API_KEY="..."
node uno_ias/uno_runner.mjs --partida 2 --retomar --max-turnos 85 --orcamento 0.70
```
*(Chaves de API nunca são commitadas no repositório.)*
