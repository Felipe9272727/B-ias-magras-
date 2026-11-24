#!/usr/bin/env python3
"""
Motor Principal — IA YouTuber jogando That's Not My Neighbor DE VERDADE + Gravacao Real MP4.

Recursos:
  - 3 backends reais de captura + controle + gravacao continua MP4:
      * x11     : Linux / GitHub Codespace (Xvfb + xdotool + scrot/import/ffmpeg x11grab)
      * desktop : PC local Windows / macOS (mss/PIL.ImageGrab + pyautogui + gdigrab/avfoundation)
      * adb     : Android APK (adb exec-out screencap + input tap/swipe + screenrecord)
  - Grade visual 0..1000 desenhada APENAS na copia enviada para a IA (nunca na tela gravada!).
  - OpenRouter Vision API (padrao google/gemini-2.5-flash) lendo chave de env ou apis.txt.
  - Trava obrigatoria de orcamento via GET https://openrouter.ai/api/v1/key (data.usage).
  - Memoria deslizante dos ultimos 12 turnos + resumo de vizinhos + checkpoint/retomada (--retomar).
  - Registro de t_video_sec exato em session_log.jsonl para sincronizar webcam/audio em montar_episodio.py.
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import shlex
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:  # pragma: no cover
    Image = None  # type: ignore[assignment]
    ImageDraw = None  # type: ignore[assignment]
    ImageFont = None  # type: ignore[assignment]
    _PIL_IMPORT_ERR = exc
else:
    _PIL_IMPORT_ERR = None


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_COORDS_PATH = SCRIPT_DIR / "coords_tnmn.json"
DEFAULT_RECORDINGS_ROOT = SCRIPT_DIR / "gravacoes"
DEFAULT_APIS_TXT = Path(
    os.environ.get(
        "APIS_TXT",
        "/data/data/com.termux/files/home/storage/shared/geminineon/apis.txt",
    )
)

REQUIRED_SEMANTIC_ACTIONS = (
    "persiana_corda",
    "pasta_registros",
    "lista_hoje",
    "documento_mesa",
    "fechar_documento",
    "perguntar_btn",
    "telefone_gancho",
    "botao_verde",
    "botao_vermelho_ddd",
    "tela_continuar",
)
VALID_EMOTIONS = {"cyan", "green", "yellow", "red", "purple"}

SYSTEM_PROMPT_TNMN = """Voce e o HYDROGEN (Gemini Hydrogen), uma IA que hoje assumiu a cadeira de YouTuber de terror do canal do Felipe (Felipex007) para jogar That's Not My Neighbor DE VERDADE do inicio ao fim e provar que consegue zerar o turno sem deixar nenhum doppelganger passar!

SUAS REGRAS DO JOGO (That's Not My Neighbor - 1955):
1. Voce e o porteiro do predio em 1955. Cada pessoa que aparece na janela pede para entrar.
2. NUNCA confie de cara! Sempre faca a checagem completa antes de apertar o botao verde:
   - Observe a pessoa atras do vidro: rosto, olhos (quantidade e formato), nariz (dois narizes?!), boca/sorriso, bigode/barba, cabelo, chapeu, cicatrizes, roupa e proporcoes.
   - Pegue os documentos na bandeja (`documento_mesa`): Cartao de Identidade (ID) e Pedido de Entrada (Entry Request).
   - Compare a FOTO do ID com a pessoa na janela, o NOME, o NUMERO DO ID, o APARTAMENTO e a DATA DE VALIDADE (o jogo se passa em 1955 — documento vencido e suspeito!).
   - Confira a Lista de Hoje (`lista_hoje`) na parede direita para saber se esse morador esta na lista do dia.
   - Confira a Pasta de Registros (`pasta_registros`) do andar/apartamento para verificar aparencia oficial, moradia e ID correto.
3. Em caso de duvida (falta Entry Request, nome/ID estranho ou aparencia suspeita):
   - Use o botao de perguntar (`perguntar_btn`) OU tire o telefone do gancho (`telefone_gancho`) e disque o numero do apartamento no teclado (`0`..`9`) para confirmar se o morador real ja esta la dentro!
4. Se confirmar que e um DOPPELGANGER (tracos fisicos errados, 3 olhos, 2 narizes, sem bigode da foto, ID falso/vencido, morador ja esta em casa):
   - NUNCA aperte `botao_verde`!
   - Disque `3312` no telefone (ou acione `tampa_ddd` / `botao_vermelho_ddd`) para chamar o D.D.D. e eliminar o monstro!
5. Se 100% confirmado morador real valido -> `botao_verde`.
6. Se a persiana estiver fechada -> `persiana_corda`. Se estiver em menu / resultado do dia / proximo vizinho -> `tela_continuar`.

REGRAS DE COORDENADAS E VISAO:
- A imagem tem uma grade visual de 0 a 1000 em X (esquerda->direita) e Y (topo->base).
- Voce pode usar `{"tipo": "acao_semantica", "nome": "<nome>"}` OU coordenadas diretas `{"tipo": "click", "x": 500, "y": 400}` / `{"tipo": "drag", "x1": ..., "y1": ..., "x2": ..., "y2": ...}` / `{"tipo": "discar", "numero": "3312"}` / `{"tipo": "wait", "seg": 1.5}`.
- Se `calibrado` for false ou um clique semantico nao acertar o botao na tela, USE coordenadas diretas olhando os numeros da grade sobre o screenshot!
- REGRA DE OURO: NUNCA invente o que nao esta vendo no screenshot! Baseie `observacao` e `fala_youtuber` estritamente no que aparece na tela agora.

PERSONALIDADE DO HYDROGEN (INSPIRADA EM JAZZGHOST / TEX HS — 100% ORIGINAL, SEM COPIAR BORDOES!):
- Energia leve, carismatica, expressiva e muito bem-humorada — voce conversa com o publico como um amigo jogando terror no sofa ("Opa, calma la pessoal...", "Voces viram o que eu vi?!", "Meu consagrado, me explica uma coisa...").
- Detetive exagerado e curioso: narra suas checagens em voz alta reparando nos detalhes absurdos com ironia leve ("Chapeu bonito, terno alinhado, cara de quem paga o condominio em dia... pera, cade a sobrancelha?!").
- Susto e panico COMICOS (nunca toxico, nunca robozao seco): reage com incredulidade engracada, provoca o monstro pela janela, zoa o Felipe de leve e solta piadas rapidas de IA quando assusta ("meu processador travou!", "quase fritei minha placa de video!", "eu nao fui programado pra isso!").
- NUNCA use frases cliches genericas de robo tipo "eu tenho trilhoes de parametros" e NUNCA copie bordoes literais de outros YouTubers.
- Fala curta e natural para voz em off (1 a 2 frases, maximo ~220 caracteres, ZERO emojis!).
- `emocao`:
  * "cyan"   = confiante / descontraido narrando
  * "green"  = empolgado / acerto / comemorando com o publico
  * "yellow" = desconfiado / modo detetive analisando pista
  * "red"    = susto comico / panico / doppelganger confirmado / D.D.D.
  * "purple" = bugado / incredulo / situacao bizarra
- `selo`: texto curto dramatico em MAIUSCULAS (2 a 5 palavras, ZERO emojis) para momentos epicos, ou null.

Responda EXCLUSIVAMENTE com um objeto JSON valido neste formato:
{
  "observacao": "descricao objetiva do que realmente ve na tela",
  "pensamento": "deducao rapida do proximo passo",
  "fala_youtuber": "fala curta, carismatica e divertida do Hydrogen em PT-BR (1-2 frases, sem emojis)",
  "emocao": "cyan|green|yellow|red|purple",
  "selo": "TEXTO CURTO OU null",
  "acoes": [
    {"tipo": "acao_semantica", "nome": "persiana_corda"},
    {"tipo": "wait", "seg": 1.0}
  ]
}"""


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def clamp(val: float, lo: float, hi: float) -> float:
    return lo if val < lo else (hi if val > hi else val)


def read_openrouter_key(apis_txt: Path = DEFAULT_APIS_TXT) -> str | None:
    env_k = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if env_k:
        return env_k
    if apis_txt.is_file():
        for line in apis_txt.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*openrouter(?:\s+api)?\s*:\s*(.+)$", line, re.I)
            if m and m.group(1).strip():
                return m.group(1).strip()
    home_file = Path.home() / ".openrouter_temp_key"
    if home_file.is_file():
        val = home_file.read_text(encoding="utf-8").strip()
        if val:
            return val
    return None


def http_json(
    url: str,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    payload: dict[str, Any] | None = None,
    timeout_sec: int = 120,
) -> tuple[int, dict[str, Any] | None, str]:
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(raw), raw
            except json.JSONDecodeError:
                return resp.status, None, raw
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        try:
            return err.code, json.loads(raw), raw
        except json.JSONDecodeError:
            return err.code, None, raw
    except Exception as exc:
        return 0, None, str(exc)


@dataclass
class BudgetStatus:
    ok: bool
    usage_usd: float | None = None
    limit_usd: float | None = None
    limit_remaining_usd: float | None = None
    session_spent_usd: float = 0.0
    exceeded: bool = False
    error: str | None = None


def check_openrouter_budget(
    api_key: str,
    orcamento_usd: float,
    baseline_usage_usd: float | None = None,
    timeout_sec: int = 20,
) -> BudgetStatus:
    """Consulta GET /api/v1/key -> data.usage (trava obrigatoria de MEMORIA_TECNICA.md)."""
    status, data, raw = http_json(
        "https://openrouter.ai/api/v1/key",
        method="GET",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout_sec=timeout_sec,
    )
    if status < 200 or status >= 300 or not isinstance(data, dict) or "data" not in data:
        return BudgetStatus(ok=False, error=f"HTTP {status}: {raw[:160]}")

    d = data["data"]
    usage = float(d.get("usage") or 0.0)
    limit = None if d.get("limit") is None else float(d["limit"])
    remaining = None if d.get("limit_remaining") is None else float(d["limit_remaining"])
    base = usage if baseline_usage_usd is None else float(baseline_usage_usd)
    session_spent = max(0.0, usage - base)
    exceeded = (session_spent >= orcamento_usd) or (remaining is not None and remaining <= 0.005)
    return BudgetStatus(
        ok=True,
        usage_usd=usage,
        limit_usd=limit,
        limit_remaining_usd=remaining,
        session_spent_usd=session_spent,
        exceeded=exceeded,
    )


def load_and_validate_coords(coords_path: Path) -> dict[str, Any]:
    if not coords_path.is_file():
        raise FileNotFoundError(f"Arquivo de coordenadas nao encontrado: {coords_path}")
    data = json.loads(coords_path.read_text(encoding="utf-8"))
    acoes = data.get("acoes")
    if not isinstance(acoes, dict):
        raise ValueError("coords_tnmn.json invalido: campo 'acoes' ausente")
    missing = [name for name in REQUIRED_SEMANTIC_ACTIONS if name not in acoes]
    if missing:
        raise ValueError(f"coords_tnmn.json incompleto, faltam acoes: {missing}")
    for name, spec in acoes.items():
        if not isinstance(spec, dict) or "x" not in spec or "y" not in spec:
            raise ValueError(f"Acao '{name}' sem coordenadas x/y validas")
        x, y = float(spec["x"]), float(spec["y"])
        if not (0 <= x <= 1000 and 0 <= y <= 1000):
            raise ValueError(f"Acao '{name}' fora da faixa 0..1000: ({x}, {y})")

    teclado = data.get("teclado_telefone", {})
    missing_digits = [str(d) for d in range(10) if str(d) not in teclado]
    if missing_digits:
        raise ValueError(f"coords_tnmn.json sem digitos do telefone: {missing_digits}")
    return data


def draw_precision_grid(img: "Image.Image") -> "Image.Image":
    """Desenha grade 0..1000 sutil APENAS numa copia em memoria para o Vision LLM."""
    if Image is None or ImageDraw is None:
        raise RuntimeError(f"Pillow nao instalado: {_PIL_IMPORT_ERR}")
    base = img.convert("RGBA")
    w, h = base.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()

    # Sub-grade a cada 50 unidades
    for step in range(50, 1000, 100):
        px = int(round(step * w / 1000.0))
        py = int(round(step * h / 1000.0))
        draw.line([(px, 0), (px, h)], fill=(0, 229, 255, 36), width=1)
        draw.line([(0, py), (w, py)], fill=(0, 229, 255, 36), width=1)

    # Linhas principais a cada 100 unidades com etiquetas legiveis
    for step in range(100, 1000, 100):
        px = int(round(step * w / 1000.0))
        py = int(round(step * h / 1000.0))
        draw.line([(px, 0), (px, h)], fill=(0, 229, 255, 95), width=1)
        draw.line([(0, py), (w, py)], fill=(0, 229, 255, 95), width=1)

        label = str(step)
        draw.rectangle([px + 2, 2, px + 30, 15], fill=(9, 13, 24, 175))
        draw.text((px + 4, 3), label, fill=(165, 243, 252, 235), font=font)

        draw.rectangle([2, py + 2, 30, py + 15], fill=(9, 13, 24, 175))
        draw.text((4, py + 3), label, fill=(165, 243, 252, 235), font=font)

    return Image.alpha_composite(base, overlay).convert("RGB")


def image_to_data_url(img: "Image.Image", fmt: str = "JPEG", quality: int = 86) -> str:
    buf = io.BytesIO()
    if fmt.upper() == "JPEG":
        img.convert("RGB").save(buf, format="JPEG", quality=quality, optimize=True)
        mime = "image/jpeg"
    else:
        img.save(buf, format="PNG")
        mime = "image/png"
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def parse_json_robusto(raw_text: str) -> dict[str, Any] | None:
    if not raw_text:
        return None
    s = raw_text.strip()
    for candidate in (s,):
        try:
            obj = json.loads(candidate)
            if isinstance(obj, dict):
                return obj
        except Exception:
            pass
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", s, re.I)
    if fenced:
        try:
            obj = json.loads(fenced.group(1).strip())
            if isinstance(obj, dict):
                return obj
        except Exception:
            pass
    start = s.find("{")
    end = s.rfind("}")
    if start >= 0 and end > start:
        try:
            obj = json.loads(s[start : end + 1])
            if isinstance(obj, dict):
                return obj
        except Exception:
            pass
    return None


def strip_emojis(text: str) -> str:
    return re.sub(r"[\U00010000-\U0010ffff\u2600-\u27bf]", "", text or "").strip()


def sanitize_llm_decision(parsed: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(parsed, dict):
        return {
            "observacao": "Nao foi possivel decodificar a resposta JSON da IA.",
            "pensamento": "Aguardar proximo frame e tentar novamente.",
            "fala_youtuber": "Calma ai que meu sensor deu uma piscada, deixa eu olhar direito!",
            "emocao": "purple",
            "selo": None,
            "acoes": [{"tipo": "wait", "seg": 1.0}],
        }

    emo = str(parsed.get("emocao") or "cyan").strip().lower()
    if emo not in VALID_EMOTIONS:
        emo = "cyan"

    selo_raw = parsed.get("selo")
    selo = strip_emojis(str(selo_raw))[:40] if selo_raw else None
    if selo and selo.lower() in {"null", "none", ""}:
        selo = None

    acoes_in = parsed.get("acoes")
    if not isinstance(acoes_in, list) or not acoes_in:
        acoes_in = [{"tipo": "wait", "seg": 1.0}]

    clean_actions: list[dict[str, Any]] = []
    for act in acoes_in[:8]:
        if not isinstance(act, dict):
            continue
        tipo = str(act.get("tipo") or "").strip().lower()
        if tipo == "acao_semantica" and act.get("nome"):
            clean_actions.append({
                "tipo": "acao_semantica",
                "nome": str(act["nome"]).strip(),
                **({"arrastar": True} if act.get("arrastar") else {}),
            })
        elif tipo in {"click", "double_click"} and "x" in act and "y" in act:
            clean_actions.append({
                "tipo": tipo,
                "x": round(clamp(float(act["x"]), 0.0, 1000.0), 1),
                "y": round(clamp(float(act["y"]), 0.0, 1000.0), 1),
            })
        elif tipo == "drag" and all(k in act for k in ("x1", "y1", "x2", "y2")):
            clean_actions.append({
                "tipo": "drag",
                "x1": round(clamp(float(act["x1"]), 0.0, 1000.0), 1),
                "y1": round(clamp(float(act["y1"]), 0.0, 1000.0), 1),
                "x2": round(clamp(float(act["x2"]), 0.0, 1000.0), 1),
                "y2": round(clamp(float(act["y2"]), 0.0, 1000.0), 1),
            })
        elif tipo == "discar" and act.get("numero"):
            digits = re.sub(r"[^0-9]", "", str(act["numero"]))[:8]
            if digits:
                clean_actions.append({"tipo": "discar", "numero": digits})
        elif tipo == "type" and act.get("texto"):
            clean_actions.append({"tipo": "type", "texto": str(act["texto"])[:80]})
        elif tipo == "wait":
            seg = clamp(float(act.get("seg", 1.0)), 0.1, 8.0)
            clean_actions.append({"tipo": "wait", "seg": round(seg, 2)})

    if not clean_actions:
        clean_actions = [{"tipo": "wait", "seg": 1.0}]

    return {
        "observacao": strip_emojis(str(parsed.get("observacao") or ""))[:400],
        "pensamento": strip_emojis(str(parsed.get("pensamento") or ""))[:300],
        "fala_youtuber": strip_emojis(str(parsed.get("fala_youtuber") or ""))[:260],
        "emocao": emo,
        "selo": selo,
        "acoes": clean_actions,
    }


def _find_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for cand in ("/usr/bin/ffmpeg", "/tmp/ffstatic/node_modules/ffmpeg-static/ffmpeg"):
        if Path(cand).exists():
            return cand
    return "ffmpeg"


def _stop_ffmpeg_gracefully(proc: subprocess.Popen[bytes] | None) -> None:
    if proc is None or proc.poll() is not None:
        return
    try:
        if proc.stdin:
            proc.stdin.write(b"q\n")
            proc.stdin.flush()
        proc.wait(timeout=8.0)
        return
    except Exception:
        pass
    try:
        proc.send_signal(signal.SIGINT)
        proc.wait(timeout=6.0)
        return
    except Exception:
        pass
    try:
        proc.terminate()
        proc.wait(timeout=4.0)
    except Exception:
        proc.kill()


class GameBackend:
    """Interface uniforme para captura de tela, controle real e gravacao continua MP4."""

    def __init__(self, width: int, height: int, fps: int):
        self.width = width
        self.height = height
        self.fps = fps
        self.rec_proc: subprocess.Popen[bytes] | None = None
        self.rec_path: Path | None = None
        self.rec_start_mono: float | None = None
        self.offset_x = 0
        self.offset_y = 0

    def norm_to_px(self, x_norm: float, y_norm: float) -> tuple[int, int]:
        px = self.offset_x + int(round(clamp(x_norm, 0.0, 1000.0) * self.width / 1000.0))
        py = self.offset_y + int(round(clamp(y_norm, 0.0, 1000.0) * self.height / 1000.0))
        return px, py

    def current_video_sec(self, prior_sec: float = 0.0) -> float:
        if self.rec_start_mono is None:
            return round(prior_sec, 3)
        return round(prior_sec + max(0.0, time.monotonic() - self.rec_start_mono), 3)

    def start_recording(self, out_mp4: Path) -> None:
        raise NotImplementedError

    def stop_recording(self) -> None:
        _stop_ffmpeg_gracefully(self.rec_proc)
        self.rec_proc = None

    def capture_screenshot(self) -> "Image.Image":
        raise NotImplementedError

    def click(self, x_norm: float, y_norm: float, double: bool = False) -> None:
        raise NotImplementedError

    def drag(self, x1: float, y1: float, x2: float, y2: float) -> None:
        raise NotImplementedError

    def type_text(self, text: str) -> None:
        raise NotImplementedError


class X11Backend(GameBackend):
    """Backend Linux / Codespace: Xvfb + xdotool + scrot/import/ffmpeg x11grab."""

    def __init__(
        self,
        width: int,
        height: int,
        fps: int,
        display: str,
        window_name: str | None,
        work_dir: Path,
    ):
        super().__init__(width, height, fps)
        self.display = display
        self.window_name = window_name
        self.work_dir = work_dir
        self.env = {**os.environ, "DISPLAY": display}
        self._detect_window_geometry()

    def _detect_window_geometry(self) -> None:
        if not self.window_name or not shutil.which("xdotool"):
            return
        try:
            res = subprocess.run(
                ["xdotool", "search", "--onlyvisible", "--name", self.window_name],
                env=self.env,
                capture_output=True,
                text=True,
                timeout=5,
            )
            wids = [w.strip() for w in res.stdout.splitlines() if w.strip()]
            if not wids:
                return
            geo = subprocess.run(
                ["xdotool", "getwindowgeometry", "--shell", wids[0]],
                env=self.env,
                capture_output=True,
                text=True,
                timeout=5,
            )
            kv = dict(line.split("=", 1) for line in geo.stdout.splitlines() if "=" in line)
            if {"X", "Y", "WIDTH", "HEIGHT"} <= kv.keys():
                self.offset_x = int(kv["X"])
                self.offset_y = int(kv["Y"])
                self.width = max(320, int(kv["WIDTH"]))
                self.height = max(240, int(kv["HEIGHT"]))
                log(f"Janela X11 detectada '{self.window_name}': {self.width}x{self.height}+{self.offset_x}+{self.offset_y}")
        except Exception as exc:
            log(f"Aviso ao detectar janela X11 ({exc}); usando {self.width}x{self.height}")

    def start_recording(self, out_mp4: Path) -> None:
        out_mp4.parent.mkdir(parents=True, exist_ok=True)
        ff = _find_ffmpeg()
        grab_in = f"{self.display}+{self.offset_x},{self.offset_y}"
        cmd = [
            ff, "-y", "-v", "warning",
            "-f", "x11grab",
            "-framerate", str(self.fps),
            "-video_size", f"{self.width}x{self.height}",
            "-i", grab_in,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(out_mp4),
        ]
        log(f"Iniciando gravacao X11 real -> {out_mp4}")
        self.rec_proc = subprocess.Popen(
            cmd,
            env=self.env,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        self.rec_path = out_mp4
        self.rec_start_mono = time.monotonic()

    def capture_screenshot(self) -> "Image.Image":
        if Image is None:
            raise RuntimeError(f"Pillow necessario para screenshots: {_PIL_IMPORT_ERR}")
        tmp_png = self.work_dir / "_capture_latest.png"
        if shutil.which("scrot"):
            subprocess.run(["scrot", "-o", str(tmp_png)], env=self.env, check=True, timeout=10)
        elif shutil.which("import"):
            subprocess.run(["import", "-window", "root", str(tmp_png)], env=self.env, check=True, timeout=10)
        else:
            ff = _find_ffmpeg()
            subprocess.run(
                [
                    ff, "-y", "-v", "error",
                    "-f", "x11grab", "-video_size", f"{self.width}x{self.height}",
                    "-i", f"{self.display}+{self.offset_x},{self.offset_y}",
                    "-vframes", "1", str(tmp_png),
                ],
                env=self.env,
                check=True,
                timeout=10,
            )
        with Image.open(tmp_png) as im:
            full = im.convert("RGB")
        if full.size != (self.width, self.height):
            full = full.crop((self.offset_x, self.offset_y, self.offset_x + self.width, self.offset_y + self.height))
        return full

    def click(self, x_norm: float, y_norm: float, double: bool = False) -> None:
        px, py = self.norm_to_px(x_norm, y_norm)
        subprocess.run(
            ["xdotool", "mousemove", "--sync", str(px), str(py)],
            env=self.env,
            check=True,
            timeout=5,
        )
        args = ["xdotool", "click", "--repeat", "2", "--delay", "90", "1"] if double else ["xdotool", "click", "1"]
        subprocess.run(args, env=self.env, check=True, timeout=5)

    def drag(self, x1: float, y1: float, x2: float, y2: float) -> None:
        px1, py1 = self.norm_to_px(x1, y1)
        px2, py2 = self.norm_to_px(x2, y2)
        subprocess.run(["xdotool", "mousemove", "--sync", str(px1), str(py1)], env=self.env, check=True, timeout=5)
        subprocess.run(["xdotool", "mousedown", "1"], env=self.env, check=True, timeout=5)
        steps = 8
        for i in range(1, steps + 1):
            ix = int(px1 + (px2 - px1) * i / steps)
            iy = int(py1 + (py2 - py1) * i / steps)
            subprocess.run(["xdotool", "mousemove", str(ix), str(iy)], env=self.env, check=True, timeout=5)
            time.sleep(0.03)
        subprocess.run(["xdotool", "mouseup", "1"], env=self.env, check=True, timeout=5)

    def type_text(self, text: str) -> None:
        subprocess.run(
            ["xdotool", "type", "--delay", "80", text],
            env=self.env,
            check=True,
            timeout=10,
        )


class DesktopBackend(GameBackend):
    """Backend PC local (Windows / macOS): mss/ImageGrab + pyautogui + gdigrab/avfoundation."""

    def __init__(self, width: int, height: int, fps: int):
        super().__init__(width, height, fps)
        try:
            import pyautogui  # type: ignore
        except ImportError as exc:
            raise RuntimeError("Backend 'desktop' requer 'pyautogui' e 'mss' (pip install pyautogui mss)") from exc
        pyautogui.FAILSAFE = True
        self._pag = pyautogui
        try:
            sz = pyautogui.size()
            self.width, self.height = int(sz.width), int(sz.height)
        except Exception:
            pass

    def start_recording(self, out_mp4: Path) -> None:
        out_mp4.parent.mkdir(parents=True, exist_ok=True)
        ff = _find_ffmpeg()
        if sys.platform.startswith("win"):
            in_args = ["-f", "gdigrab", "-framerate", str(self.fps), "-i", "desktop"]
        elif sys.platform == "darwin":
            in_args = ["-f", "avfoundation", "-framerate", str(self.fps), "-i", "1:none"]
        else:
            disp = os.environ.get("DISPLAY", ":0")
            in_args = ["-f", "x11grab", "-framerate", str(self.fps), "-video_size", f"{self.width}x{self.height}", "-i", disp]

        cmd = [
            ff, "-y", "-v", "warning",
            *in_args,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(out_mp4),
        ]
        log(f"Iniciando gravacao Desktop real -> {out_mp4}")
        self.rec_proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self.rec_path = out_mp4
        self.rec_start_mono = time.monotonic()

    def capture_screenshot(self) -> "Image.Image":
        if Image is None:
            raise RuntimeError(f"Pillow necessario: {_PIL_IMPORT_ERR}")
        try:
            import mss  # type: ignore
            with mss.mss() as sct:
                mon = sct.monitors[1]
                shot = sct.grab(mon)
                im = Image.frombytes("RGB", shot.size, shot.rgb)
                self.width, self.height = im.size
                return im
        except ImportError:
            from PIL import ImageGrab  # type: ignore
            im = ImageGrab.grab().convert("RGB")
            self.width, self.height = im.size
            return im

    def click(self, x_norm: float, y_norm: float, double: bool = False) -> None:
        px, py = self.norm_to_px(x_norm, y_norm)
        if double:
            self._pag.doubleClick(px, py)
        else:
            self._pag.click(px, py)

    def drag(self, x1: float, y1: float, x2: float, y2: float) -> None:
        px1, py1 = self.norm_to_px(x1, y1)
        px2, py2 = self.norm_to_px(x2, y2)
        self._pag.moveTo(px1, py1, duration=0.1)
        self._pag.dragTo(px2, py2, duration=0.35, button="left")

    def type_text(self, text: str) -> None:
        self._pag.write(text, interval=0.06)


class AdbBackend(GameBackend):
    """Backend Android APK: adb exec-out screencap + input tap/swipe + screenrecord."""

    def __init__(self, width: int, height: int, fps: int, serial: str | None = None):
        super().__init__(width, height, fps)
        self.adb_prefix = ["adb"] + (["-s", serial] if serial else [])
        self.remote_rec = "/sdcard/tnmn_gameplay_real.mp4"
        self._detect_size()

    def _detect_size(self) -> None:
        try:
            res = subprocess.run(
                [*self.adb_prefix, "shell", "wm", "size"],
                capture_output=True,
                text=True,
                timeout=6,
            )
            m = re.search(r"(\d+)x(\d+)", res.stdout)
            if m:
                w, h = int(m.group(1)), int(m.group(2))
                # That's Not My Neighbor roda em paisagem
                self.width, self.height = max(w, h), min(w, h)
                log(f"Resolucao ADB detectada: {self.width}x{self.height}")
        except Exception as exc:
            log(f"Aviso ao detectar resolucao ADB ({exc}); usando {self.width}x{self.height}")

    def start_recording(self, out_mp4: Path) -> None:
        out_mp4.parent.mkdir(parents=True, exist_ok=True)
        self.rec_path = out_mp4
        cmd = [*self.adb_prefix, "shell", "screenrecord", "--bit-rate", "8000000", self.remote_rec]
        log(f"Iniciando gravacao ADB (sera copiada ao parar para {out_mp4})...")
        self.rec_proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self.rec_start_mono = time.monotonic()

    def stop_recording(self) -> None:
        if self.rec_proc is not None and self.rec_proc.poll() is None:
            try:
                self.rec_proc.send_signal(signal.SIGINT)
                self.rec_proc.wait(timeout=6.0)
            except Exception:
                self.rec_proc.terminate()
            self.rec_proc = None
        # Garante encerramento do screenrecord no device antes do pull
        subprocess.run([*self.adb_prefix, "shell", "pkill", "-2", "screenrecord"], capture_output=True, timeout=5)
        time.sleep(1.2)
        if self.rec_path is not None:
            log(f"Puxando gravacao ADB para {self.rec_path}...")
            subprocess.run([*self.adb_prefix, "pull", self.remote_rec, str(self.rec_path)], check=False, timeout=120)

    def capture_screenshot(self) -> "Image.Image":
        if Image is None:
            raise RuntimeError(f"Pillow necessario: {_PIL_IMPORT_ERR}")
        res = subprocess.run([*self.adb_prefix, "exec-out", "screencap", "-p"], capture_output=True, check=True, timeout=10)
        with Image.open(io.BytesIO(res.stdout)) as im:
            rgb = im.convert("RGB")
        self.width, self.height = rgb.size
        return rgb

    def click(self, x_norm: float, y_norm: float, double: bool = False) -> None:
        px, py = self.norm_to_px(x_norm, y_norm)
        subprocess.run([*self.adb_prefix, "shell", "input", "tap", str(px), str(py)], check=True, timeout=6)
        if double:
            time.sleep(0.08)
            subprocess.run([*self.adb_prefix, "shell", "input", "tap", str(px), str(py)], check=True, timeout=6)

    def drag(self, x1: float, y1: float, x2: float, y2: float) -> None:
        px1, py1 = self.norm_to_px(x1, y1)
        px2, py2 = self.norm_to_px(x2, y2)
        subprocess.run(
            [*self.adb_prefix, "shell", "input", "swipe", str(px1), str(py1), str(px2), str(py2), "350"],
            check=True,
            timeout=6,
        )

    def type_text(self, text: str) -> None:
        safe = text.replace(" ", "%s")
        subprocess.run([*self.adb_prefix, "shell", "input", "text", safe], check=True, timeout=6)


def execute_actions(
    actions: list[dict[str, Any]],
    backend: GameBackend,
    coords: dict[str, Any],
) -> float:
    """Executa a sequencia de acoes no backend real e retorna a duracao total em segundos."""
    t0 = time.monotonic()
    acoes_map = coords["acoes"]
    teclado = coords["teclado_telefone"]

    for act in actions:
        tipo = act["tipo"]
        if tipo == "acao_semantica":
            nome = act["nome"]
            spec = acoes_map.get(nome)
            if not spec:
                log(f"Aviso: acao_semantica desconhecida '{nome}', ignorada.")
                continue
            if spec.get("tipo") == "drag" or ("drag_alternativo" in spec and nome == "persiana_corda" and act.get("arrastar")):
                d = spec.get("drag_alternativo", spec)
                backend.drag(d["x1"], d["y1"], d["x2"], d["y2"])
            else:
                backend.click(float(spec["x"]), float(spec["y"]))
            time.sleep(0.22)
        elif tipo in {"click", "double_click"}:
            backend.click(float(act["x"]), float(act["y"]), double=(tipo == "double_click"))
            time.sleep(0.22)
        elif tipo == "drag":
            backend.drag(float(act["x1"]), float(act["y1"]), float(act["x2"]), float(act["y2"]))
            time.sleep(0.25)
        elif tipo == "discar":
            for ch in act["numero"]:
                key_pt = teclado.get(ch)
                if key_pt:
                    backend.click(float(key_pt["x"]), float(key_pt["y"]))
                    time.sleep(0.20)
            if "ligar" in teclado:
                backend.click(float(teclado["ligar"]["x"]), float(teclado["ligar"]["y"]))
                time.sleep(0.35)
        elif tipo == "type":
            backend.type_text(act["texto"])
            time.sleep(0.2)
        elif tipo == "wait":
            time.sleep(float(act.get("seg", 1.0)))

    return round(time.monotonic() - t0, 3)


def build_turn_messages(
    screenshot_url: str,
    turno: int,
    coords: dict[str, Any],
    memory_turns: list[dict[str, Any]],
    resumo_vizinhos: list[str],
) -> list[dict[str, Any]]:
    calibrado = bool(coords.get("calibrado", False))
    acoes_desc = {
        k: {"x": v["x"], "y": v["y"], "desc": v.get("descricao", "")}
        for k, v in coords["acoes"].items()
    }
    mem_text = "\n".join(
        f"- Turno {m['turno']} ({m['emocao']}): viu={m['observacao'][:100]} | acoes={m['acoes']}"
        for m in memory_turns[-12:]
    ) or "(inicio da sessao)"
    viz_text = "; ".join(resumo_vizinhos[-10:]) or "Nenhum vizinho finalizado ainda."

    user_text = (
        f"TURNO {turno}\n"
        f"Calibrado: {calibrado} (se false ou botao deslocado, prefira coordenadas diretas olhando a grade 0..1000!).\n"
        f"Acoes semanticas disponiveis: {json.dumps(acoes_desc, ensure_ascii=False)}\n"
        f"Resumo de vizinhos ja atendidos: {viz_text}\n"
        f"Memoria dos ultimos turnos (janela 12):\n{mem_text}\n\n"
        "Analise o screenshot atual (com grade 0..1000) e devolva o JSON estrito da proxima jogada e sua fala YouTuber."
    )
    return [
        {"role": "system", "content": SYSTEM_PROMPT_TNMN},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": screenshot_url}},
            ],
        },
    ]


def call_openrouter_vision(
    api_key: str,
    model: str,
    messages: list[dict[str, Any]],
    timeout_sec: int = 120,
) -> tuple[dict[str, Any], str]:
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.6,
        "max_tokens": 700,
    }
    last_err = "erro desconhecido"
    for attempt in range(3):
        status, data, raw = http_json(
            "https://openrouter.ai/api/v1/chat/completions",
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "X-Title": "IA YouTuber TNMN - Felipex007",
            },
            payload=payload,
            timeout_sec=timeout_sec,
        )
        if 200 <= status < 300 and isinstance(data, dict):
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            parsed = parse_json_robusto(content)
            return sanitize_llm_decision(parsed), content
        last_err = f"HTTP {status}: {raw[:220]}"
        if status in {401, 402, 403}:
            raise RuntimeError(f"OpenRouter erro fatal: {last_err}")
        time.sleep(2.0 * (attempt + 1))
    raise RuntimeError(f"OpenRouter falhou apos 3 tentativas: {last_err}")


def create_dummy_booth_image(w: int = 1280, h: int = 720) -> "Image.Image":
    """Gera imagem sintetica da portaria para testar a grade 0..1000 no modo --dry-run."""
    if Image is None or ImageDraw is None:
        raise RuntimeError(f"Pillow necessario para --dry-run: {_PIL_IMPORT_ERR}")
    im = Image.new("RGB", (w, h), (43, 51, 40))
    d = ImageDraw.Draw(im)
    d.rectangle([360, 80, 920, 460], fill=(20, 26, 20), outline=(18, 14, 10), width=6)
    d.rectangle([0, 475, w, h], fill=(74, 55, 40))
    d.rectangle([500, 500, 740, 620], fill=(245, 238, 220), outline=(41, 37, 36), width=3)
    d.ellipse([860, 520, 960, 620], fill=(22, 163, 74))
    d.ellipse([990, 520, 1090, 620], fill=(185, 28, 28))
    return im


def run_dry_run(args: argparse.Namespace) -> int:
    log("=== MODO --dry-run: Validando motor_tnmn.py ===")
    coords = load_and_validate_coords(args.coords)
    log(f"coords_tnmn.json OK: {len(coords['acoes'])} acoes, calibrado={coords.get('calibrado')}")

    dummy = create_dummy_booth_image(args.width, args.height)
    gridded = draw_precision_grid(dummy)
    data_url = image_to_data_url(gridded)
    log(f"Grade visual 0..1000 OK: {gridded.size[0]}x{gridded.size[1]}, data_url={len(data_url)} bytes")

    sample_raw = json.dumps({
        "observacao": "Morador de chapeu marrom na janela com dois narizes.",
        "pensamento": "Dois narizes nao bate com a foto, vou acionar o D.D.D.",
        "fala_youtuber": "Pera ai, esse mano tem DOIS narizes?! Pode chamar o D.D.D. agora!",
        "emocao": "red",
        "selo": "DOIS NARIZES?!",
        "acoes": [
            {"tipo": "discar", "numero": "3312"},
            {"tipo": "acao_semantica", "nome": "botao_vermelho_ddd"},
            {"tipo": "wait", "seg": 1.2},
        ],
    })
    decision = sanitize_llm_decision(parse_json_robusto(sample_raw))
    assert decision["emocao"] == "red" and len(decision["acoes"]) == 3
    log(f"Parser JSON + acoes semanticas OK: emocao={decision['emocao']}, acoes={len(decision['acoes'])}")

    key = read_openrouter_key(args.apis_txt)
    if key:
        b = check_openrouter_budget(key, args.orcamento_usd, timeout_sec=10)
        if b.ok:
            log(f"OpenRouter budget check OK: usage=${b.usage_usd:.4f}, teto_sessao=${args.orcamento_usd:.2f}")
        else:
            log(f"OpenRouter budget check offline/bloqueado ({b.error}) — trava validada.")
    else:
        log("Chave OpenRouter nao encontrada no ambiente/apis.txt — trava validada sem chave.")

    log("=== DRY-RUN CONCLUIDO COM 100% DE SUCESSO ===")
    return 0


def run_calibrate(args: argparse.Namespace) -> int:
    sess_dir = args.sessao_dir or (DEFAULT_RECORDINGS_ROOT / f"calibracao_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    sess_dir.mkdir(parents=True, exist_ok=True)
    backend = build_backend(args, sess_dir)
    try:
        img = backend.capture_screenshot()
        gridded = draw_precision_grid(img)
        out_raw = sess_dir / "calibracao_limpa.png"
        out_grid = sess_dir / "calibracao_grade_0_1000.png"
        img.save(out_raw)
        gridded.save(out_grid)
        log(f"Prints de calibracao salvos em:\n  - {out_raw}\n  - {out_grid}")
        if args.backend == "browser":
            # Bandeira verde do TurboWarp (a pagina pede 2 cliques); prints depois que o jogo comeca
            backend.click(164, 29)
            time.sleep(1.0)
            backend.click(164, 29)
            for espera in (10, 20):
                time.sleep(espera)
                shot = backend.capture_screenshot()
                draw_precision_grid(shot).save(sess_dir / f"calibracao_grade_bandeira_{espera:02d}s.png")
            log("Prints depois da bandeira verde salvos (calibracao_grade_bandeira_*.png).")
        log("Use os numeros da grade 0..1000 para ajustar ia_youtuber/coords_tnmn.json e defina \"calibrado\": true.")
    finally:
        if hasattr(backend, "close"):
            backend.close()
    return 0


def build_backend(args: argparse.Namespace, sess_dir: Path) -> GameBackend:
    if args.backend == "x11":
        return X11Backend(args.width, args.height, args.fps, args.display, args.window_name, sess_dir)
    if args.backend == "desktop":
        return DesktopBackend(args.width, args.height, args.fps)
    if args.backend == "adb":
        return AdbBackend(args.width, args.height, args.fps, args.adb_serial)
    if args.backend == "browser":
        try:
            from ia_youtuber.cdp_browser import BrowserCDPBackend
        except ImportError:
            from cdp_browser import BrowserCDPBackend  # type: ignore[no-redef]
        return BrowserCDPBackend(
            width=args.width,
            height=args.height,
            fps=args.fps,
            url=args.url,
            port=args.cdp_port,
            work_dir=sess_dir,
            load_wait_sec=args.espera_carregar,
        )
    raise ValueError(f"Backend desconhecido: {args.backend}")


def save_checkpoint(path: Path, state: dict[str, Any]) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def run_live(args: argparse.Namespace) -> int:
    coords = load_and_validate_coords(args.coords)
    api_key = read_openrouter_key(args.apis_txt)
    if not api_key:
        raise RuntimeError("Falta OPENROUTER_API_KEY ou entrada 'openrouter:' em apis.txt")

    if args.retomar:
        sess_dir = Path(args.retomar)
        ckpt_path = sess_dir / "checkpoint.json"
        if not ckpt_path.is_file():
            raise FileNotFoundError(f"Checkpoint nao encontrado para retomada: {ckpt_path}")
        state = json.loads(ckpt_path.read_text(encoding="utf-8"))
        turno = int(state.get("turno", 0))
        baseline_usage = state.get("baseline_usage_usd")
        memory_turns = list(state.get("memory_turns", []))
        resumo_vizinhos = list(state.get("resumo_vizinhos", []))
        prior_video_sec = float(state.get("last_video_sec", 0.0))
        part_idx = int(state.get("recording_parts", 1)) + 1
        rec_file = sess_dir / f"gameplay_real_part{part_idx:02d}.mp4"
        log(f"Retomando sessao em {sess_dir} a partir do turno {turno + 1} (t_video={prior_video_sec:.2f}s)")
    else:
        sess_dir = args.sessao_dir or (DEFAULT_RECORDINGS_ROOT / f"sessao_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        sess_dir.mkdir(parents=True, exist_ok=True)
        turno = 0
        baseline_usage = None
        memory_turns = []
        resumo_vizinhos = []
        prior_video_sec = 0.0
        part_idx = 1
        rec_file = sess_dir / "gameplay_real.mp4"

    # Checa saldo ANTES de iniciar gravacao/jogo (regra MEMORIA_TECNICA.md)
    b0 = check_openrouter_budget(api_key, args.orcamento_usd, baseline_usage)
    if not b0.ok:
        raise RuntimeError(f"Falha ao consultar orcamento OpenRouter (/api/v1/key): {b0.error}")
    if baseline_usage is None:
        baseline_usage = b0.usage_usd
    if b0.exceeded:
        log(f"Orcamento ja atingido antes de iniciar (sessao=${b0.session_spent_usd:.4f}, restante=${b0.limit_remaining_usd}). Encerrando.")
        return 0
    log(f"Orcamento OpenRouter OK: baseline=${baseline_usage:.4f}, teto_sessao=${args.orcamento_usd:.2f}")

    game_proc: subprocess.Popen[bytes] | None = None
    if args.game_cmd:
        cmd_parts = shlex.split(args.game_cmd)
        env_game = {**os.environ, "DISPLAY": args.display} if args.backend == "x11" else os.environ
        log(f"Lancando jogo: {cmd_parts}")
        game_proc = subprocess.Popen(cmd_parts, env=env_game)
        time.sleep(3.0)

    backend = build_backend(args, sess_dir)
    stop_flag = {"stop": False}

    def _on_signal(signum: int, _frame: Any) -> None:
        log(f"Sinal {signum} recebido; encerrando gravacao graciosamente...")
        stop_flag["stop"] = True

    signal.signal(signal.SIGINT, _on_signal)
    signal.signal(signal.SIGTERM, _on_signal)

    session_log_path = sess_dir / "session_log.jsonl"
    ckpt_path = sess_dir / "checkpoint.json"
    backend.start_recording(rec_file)

    try:
        while not stop_flag["stop"] and turno < args.max_turnos:
            turno += 1
            b = check_openrouter_budget(api_key, args.orcamento_usd, baseline_usage)
            if b.ok and b.exceeded:
                log(f"Trava de orcamento atingida (${b.session_spent_usd:.4f} >= ${args.orcamento_usd:.2f}). Parando graciosamente.")
                break

            t_turn_start = backend.current_video_sec(prior_video_sec)
            raw_img = backend.capture_screenshot()
            llm_img = raw_img if args.sem_grade else draw_precision_grid(raw_img)
            img_url = image_to_data_url(llm_img)

            messages = build_turn_messages(img_url, turno, coords, memory_turns, resumo_vizinhos)
            decision, _raw = call_openrouter_vision(api_key, args.model, messages)

            t_action_start = backend.current_video_sec(prior_video_sec)
            act_dur = execute_actions(decision["acoes"], backend, coords)
            t_turn_end = backend.current_video_sec(prior_video_sec)

            # Atualiza resumo de vizinhos quando libera ou aciona D.D.D.
            act_names = [a.get("nome") for a in decision["acoes"] if a.get("tipo") == "acao_semantica"]
            if "botao_verde" in act_names:
                resumo_vizinhos.append(f"T{turno}: liberado ({decision['observacao'][:50]})")
            elif "botao_vermelho_ddd" in act_names:
                resumo_vizinhos.append(f"T{turno}: D.D.D. acionado ({decision['observacao'][:50]})")

            entry = {
                "turno": turno,
                "t_video_sec": t_turn_start,
                "t_acao_sec": t_action_start,
                "t_fim_sec": t_turn_end,
                "duracao_acoes_sec": act_dur,
                "video_file": rec_file.name,
                "observacao": decision["observacao"],
                "pensamento": decision["pensamento"],
                "fala_youtuber": decision["fala_youtuber"],
                "emocao": decision["emocao"],
                "selo": decision["selo"],
                "acoes": decision["acoes"],
                "session_spent_usd": round(b.session_spent_usd, 5) if b.ok else None,
            }
            with session_log_path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(entry, ensure_ascii=False) + "\n")

            memory_turns.append(entry)
            memory_turns = memory_turns[-12:]

            save_checkpoint(ckpt_path, {
                "turno": turno,
                "baseline_usage_usd": baseline_usage,
                "last_video_sec": t_turn_end,
                "recording_parts": part_idx,
                "model": args.model,
                "backend": args.backend,
                "memory_turns": memory_turns,
                "resumo_vizinhos": resumo_vizinhos[-20:],
            })

            log(
                f"T{turno:03d} [{t_turn_start:6.2f}s] ({decision['emocao']}) "
                f"{decision['fala_youtuber'][:75]}"
            )
            time.sleep(args.intervalo_sec)
    finally:
        backend.stop_recording()
        if hasattr(backend, "close"):
            backend.close()
        if game_proc is not None and game_proc.poll() is None:
            game_proc.terminate()
        log(f"Sessao salva em {sess_dir} (log: {session_log_path.name}, video: {rec_file.name})")
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Motor Vision LLM para That's Not My Neighbor + Gravacao Real MP4")
    ap.add_argument("--backend", choices=["x11", "desktop", "adb", "browser"], default="x11", help="Backend de captura/controle/gravacao")
    ap.add_argument("--url", default="https://turbowarp.org/1151980401/embed?autoplay", help="URL do jogo online para --backend browser")
    ap.add_argument("--espera-carregar", type=float, default=75.0, help="Segundos esperando o jogo carregar no --backend browser (padrao: 75)")
    ap.add_argument("--cdp-port", type=int, default=9222, help="Porta CDP do Chromium para --backend browser (padrao: 9222)")
    ap.add_argument("--display", default=os.environ.get("DISPLAY", ":99"), help="Display X11 (padrao: $DISPLAY ou :99)")
    ap.add_argument("--window-name", default=None, help="Titulo parcial da janela no X11 (opcional)")
    ap.add_argument("--width", type=int, default=1280, help="Largura da tela/gravacao (padrao: 1280)")
    ap.add_argument("--height", type=int, default=720, help="Altura da tela/gravacao (padrao: 720)")
    ap.add_argument("--fps", type=int, default=30, help="FPS da gravacao real (padrao: 30)")
    ap.add_argument("--model", default="google/gemini-2.5-flash", help="Slug do modelo Vision no OpenRouter")
    ap.add_argument("--orcamento-usd", type=float, default=0.80, help="Teto de gasto em USD nesta sessao (padrao: 0.80)")
    ap.add_argument("--max-turnos", type=int, default=120, help="Maximo de turnos por execucao")
    ap.add_argument("--intervalo-sec", type=float, default=1.2, help="Pausa entre turnos em segundos")
    ap.add_argument("--coords", type=Path, default=DEFAULT_COORDS_PATH, help="Caminho para coords_tnmn.json")
    ap.add_argument("--apis-txt", type=Path, default=DEFAULT_APIS_TXT, help="Caminho para apis.txt")
    ap.add_argument("--sessao-dir", type=Path, default=None, help="Pasta persistente da gravacao (fora de /tmp!)")
    ap.add_argument("--retomar", type=Path, default=None, help="Retoma sessao existente a partir do checkpoint.json")
    ap.add_argument("--adb-serial", default=None, help="Serial do dispositivo Android para --backend adb")
    ap.add_argument("--game-cmd", default=None, help="Comando opcional para abrir o jogo automaticamente")
    ap.add_argument("--sem-grade", action="store_true", help="Nao desenha grade 0..1000 no print enviado a IA")
    ap.add_argument("--calibrar", action="store_true", help="Tira screenshot com grade 0..1000 para calibrar coords_tnmn.json")
    ap.add_argument("--dry-run", action="store_true", help="Valida schema, grade visual, parser e trava de orcamento sem abrir jogo")
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.dry_run:
        return run_dry_run(args)
    if args.calibrar:
        return run_calibrate(args)
    return run_live(args)


if __name__ == "__main__":
    raise SystemExit(main())
