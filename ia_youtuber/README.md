# IA YouTuber — That's Not My Neighbor (Gameplay Real + Pós-Produção)

Motor autônomo com Vision LLM para jogar **That's Not My Neighbor** de verdade, gravar a gameplay contínua em MP4 e montar o episódio final com a webcam do Robô YouTuber em overlay transparente (`visuals_v2.py`), narração ElevenLabs v4 e mix padrão do canal (`-14 LUFS`).

---

## Arquivos do Pacote

- [coords_tnmn.json](file:///data/data/com.termux/files/home/storage/shared/geminineon/B-ias-magras-/ia_youtuber/coords_tnmn.json) — Mapa normalizado (`0..1000`) das ações principais do jogo (`persiana_corda`, `pasta_registros`, `lista_hoje`, `documento_mesa`, `fechar_documento`, `perguntar_btn`, `telefone_gancho`, `teclado_telefone` `0`–`9`, `botao_verde`, `botao_vermelho_ddd`, `tela_continuar`) com `"calibrado": false`.
- [motor_tnmn.py](file:///data/data/com.termux/files/home/storage/shared/geminineon/B-ias-magras-/ia_youtuber/motor_tnmn.py) — Motor principal (Vision LLM + execução real nos 3 backends + gravação MP4 contínua + grade visual 0..1000 em memória + trava de orçamento OpenRouter + checkpoint/`--retomar`).
- [montar_episodio.py](file:///data/data/com.termux/files/home/storage/shared/geminineon/B-ias-magras-/ia_youtuber/montar_episodio.py) — Pós-produção: corte automático de tempos mortos, TTS ElevenLabs v4 com normalização PT-BR, overlay transparente do robô/legendas/selos via `visuals_v2.py`, abertura do Felipe, SFX e trilha com `sidechaincompress` + `loudnorm -14 LUFS`.
- [setup_codespace.sh](file:///data/data/com.termux/files/home/storage/shared/geminineon/B-ias-magras-/ia_youtuber/setup_codespace.sh) — Preparação automática de ambiente Linux / GitHub Codespace.

---

## Os 3 Modos de Execução (`--backend`)

### 1. Linux / GitHub Codespace (`--backend x11`)
Usa `Xvfb` + `xdotool` + `scrot` e grava continuamente com `ffmpeg -f x11grab`:

```bash
bash ia_youtuber/setup_codespace.sh /caminho/para/tnmn.x86_64
DISPLAY=:99 /caminho/para/tnmn.x86_64 &
DISPLAY=:99 python3 ia_youtuber/motor_tnmn.py --backend x11 --window-name "Neighbor" --orcamento-usd 0.80
```

> **Regra de persistência (`CORDIAL_SETUP.md`):** Nunca grave em `/tmp`. O motor salva por padrão em `ia_youtuber/gravacoes/<sessao>/` e registra a exclusão no `.git/info/exclude`. Suba para o Gofile logo ao fim de cada gravação.

### 2. PC Local Windows / macOS (`--backend desktop`)
Usa `mss` / `PIL.ImageGrab` + `pyautogui` e grava a tela com `ffmpeg -f gdigrab` (Windows) ou `avfoundation` (macOS):

```bash
pip install pillow mss pyautogui
python ia_youtuber/motor_tnmn.py --backend desktop --orcamento-usd 0.80
```

### 3. Android APK (`--backend adb`)
Usa `adb exec-out screencap -p`, `adb shell input tap/swipe` e `adb shell screenrecord` (puxando o MP4 automaticamente ao encerrar):

```bash
python3 ia_youtuber/motor_tnmn.py --backend adb --orcamento-usd 0.80
```

---

## Calibração e Grade Visual (`0..1000`)

1. Para validar o motor sem abrir o jogo:
   ```bash
   python3 ia_youtuber/motor_tnmn.py --dry-run
   ```
2. Para calibrar as posições exatas na sua tela:
   ```bash
   python3 ia_youtuber/motor_tnmn.py --backend x11 --calibrar
   ```
   Abra o arquivo `calibracao_grade_0_1000.png` gerado na pasta da sessão, atualize os pontos em `ia_youtuber/coords_tnmn.json` e mude `"calibrado": true`.
3. A grade `0..1000` é desenhada **somente na cópia em memória enviada ao Vision LLM** — nunca aparece na gravação `gameplay_real.mp4`.

---

## Trava de Orçamento e Retomada

- A chave é lida de `OPENROUTER_API_KEY` ou de `/data/data/com.termux/files/home/storage/shared/geminineon/apis.txt` (nunca impressa em logs).
- Antes de cada turno, o motor consulta `GET https://openrouter.ai/api/v1/key` (`data.usage`) e encerra graciosamente o `ffmpeg` ao atingir `--orcamento-usd` (padrão `0.80`).
- Para continuar uma sessão interrompida:
  ```bash
  python3 ia_youtuber/motor_tnmn.py --backend x11 --retomar ia_youtuber/gravacoes/<sessao>
  ```

---

## Pós-Produção (MP4 Final do YouTube)

Teste o pipeline sem gastar cota ElevenLabs:
```bash
python3 ia_youtuber/montar_episodio.py --dry-run
```

Renderize o episódio final a partir de uma sessão gravada:
```bash
python3 ia_youtuber/montar_episodio.py \
  --sessao-dir ia_youtuber/gravacoes/<sessao> \
  --opening-mp4 /caminho/para/abertura_felipe.mp4 \
  --music investigations \
  --upscale-1080p
```
