#!/usr/bin/env python3
"""
Cliente Chrome DevTools Protocol (CDP) em Python 3 puro (apenas stdlib + Pillow opcional).

Recursos:
  - Mini-cliente WebSocket RFC 6455 completo sobre 127.0.0.1:<porta>:
      * Handshake HTTP/1.1 Upgrade com Sec-WebSocket-Key / Sec-WebSocket-Accept
      * Mascaramento cliente->servidor obrigatorio
      * Payloads de 7 bits, 16 bits (126) e 64 bits (127) ate 32 MB
      * Fragmentacao (FIN=0 / opcode 0x0) e controle (Ping/Pong/Close)
      * Thread leitora dedicada + dict de pending Events (100% thread-safe)
  - BrowserCDPBackend compativel com GameBackend de motor_tnmn.py:
      * Inicia Chromium/Chrome headless com SwiftShader/ANGLE
      * Gravacao REAL de gameplay em MP4 via Page.startScreencast + ffconcat + ffmpeg
      * Acoes reais via Input.dispatchMouseEvent / Input.insertText / Page.captureScreenshot
  - Modo CLI de teste rapido:
      python3 ia_youtuber/cdp_browser.py --test-url <URL> --out <png>
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import shutil
import socket
import struct
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    Image = None  # type: ignore[assignment]
    _PIL_IMPORT_ERR = exc
else:
    _PIL_IMPORT_ERR = None


WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
MAX_WS_PAYLOAD = 32 * 1024 * 1024  # 32 MB

DEFAULT_GAME_URL = "https://turbowarp.org/1151980401/embed?autoplay"


def _log(msg: str) -> None:
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] [cdp] {msg}", flush=True)


def _clamp(val: float, lo: float, hi: float) -> float:
    return lo if val < lo else (hi if val > hi else val)


def _find_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for cand in (
        "/data/data/com.termux/files/usr/bin/ffmpeg",
        "/usr/bin/ffmpeg",
        "/tmp/ffstatic/node_modules/ffmpeg-static/ffmpeg",
    ):
        if Path(cand).exists():
            return cand
    return "ffmpeg"


def find_chromium_binary() -> str:
    """Detecta automaticamente o binario do Chromium/Chrome disponivel."""
    env_bin = os.environ.get("CHROMIUM_BIN", "").strip()
    if env_bin and Path(env_bin).exists():
        return env_bin

    names = ("chromium-browser", "chromium", "google-chrome", "google-chrome-stable")
    for name in names:
        found = shutil.which(name)
        if found:
            return found

    candidates = (
        "/data/data/com.termux/files/usr/bin/chromium-browser",
        "/data/data/com.termux/files/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
    )
    for cand in candidates:
        if Path(cand).exists():
            return cand

    raise FileNotFoundError(
        "Nenhum binario Chromium/Chrome encontrado (chromium-browser, chromium, google-chrome)."
    )


def _is_port_free(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) != 0


def _pick_free_port(preferred: int = 9222) -> int:
    if _is_port_free(preferred):
        return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


class WebSocketError(RuntimeError):
    """Erro de protocolo ou conexao WebSocket."""


class MiniWebSocketClient:
    """Cliente WebSocket RFC 6455 leve e thread-safe em Python stdlib pura."""

    def __init__(self, ws_url: str, timeout: float = 15.0):
        parsed = urlparse(ws_url)
        if parsed.scheme not in {"ws", "wss"}:
            raise ValueError(f"URL WebSocket invalida: {ws_url}")
        if parsed.scheme == "wss":
            raise ValueError("MiniWebSocketClient suporta apenas ws:// local (CDP)")

        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or 80
        self.path = parsed.path or "/"
        if parsed.query:
            self.path = f"{self.path}?{parsed.query}"

        self._sock = socket.create_connection((self.host, self.port), timeout=timeout)
        self._sock.settimeout(None)
        self._send_lock = threading.Lock()
        self._recv_buf = bytearray()
        self._closed = False

        self._handshake(timeout=timeout)

    def _handshake(self, timeout: float) -> None:
        key_bytes = os.urandom(16)
        sec_key = base64.b64encode(key_bytes).decode("ascii")
        expected_accept = base64.b64encode(
            hashlib.sha1((sec_key + WS_GUID).encode("ascii")).digest()
        ).decode("ascii")

        req_lines = [
            f"GET {self.path} HTTP/1.1",
            f"Host: {self.host}:{self.port}",
            "Upgrade: websocket",
            "Connection: Upgrade",
            f"Sec-WebSocket-Key: {sec_key}",
            "Sec-WebSocket-Version: 13",
            "",
            "",
        ]
        self._sock.settimeout(timeout)
        self._sock.sendall("\r\n".join(req_lines).encode("ascii"))

        raw_hdr = bytearray()
        while b"\r\n\r\n" not in raw_hdr:
            chunk = self._sock.recv(4096)
            if not chunk:
                raise WebSocketError("Conexao fechada durante handshake WebSocket")
            raw_hdr.extend(chunk)
            if len(raw_hdr) > 65536:
                raise WebSocketError("Cabecalho HTTP de handshake muito grande")

        hdr_end = raw_hdr.index(b"\r\n\r\n") + 4
        leftover = raw_hdr[hdr_end:]
        if leftover:
            self._recv_buf.extend(leftover)

        header_text = raw_hdr[:hdr_end].decode("latin1", errors="replace")
        lines = header_text.split("\r\n")
        if not lines or "101" not in lines[0]:
            raise WebSocketError(f"Handshake WebSocket falhou: {lines[0] if lines else ''}")

        headers: dict[str, str] = {}
        for line in lines[1:]:
            if ":" in line:
                k, v = line.split(":", 1)
                headers[k.strip().lower()] = v.strip()

        accept = headers.get("sec-websocket-accept", "")
        if accept and accept != expected_accept:
            raise WebSocketError("Sec-WebSocket-Accept invalido no handshake")

        self._sock.settimeout(None)

    def _recv_exact(self, n: int) -> bytes:
        while len(self._recv_buf) < n:
            chunk = self._sock.recv(max(4096, n - len(self._recv_buf)))
            if not chunk:
                raise WebSocketError("Socket WebSocket fechado pelo servidor")
            self._recv_buf.extend(chunk)
        out = bytes(self._recv_buf[:n])
        del self._recv_buf[:n]
        return out

    def _send_frame(self, opcode: int, payload: bytes) -> None:
        if self._closed:
            raise WebSocketError("WebSocket ja fechado")
        length = len(payload)
        first_byte = 0x80 | (opcode & 0x0F)
        mask_bit = 0x80

        header = bytearray([first_byte])
        if length < 126:
            header.append(mask_bit | length)
        elif length < 65536:
            header.append(mask_bit | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(mask_bit | 127)
            header.extend(struct.pack("!Q", length))

        mask_key = os.urandom(4)
        header.extend(mask_key)

        masked = bytes(b ^ mask_key[i & 3] for i, b in enumerate(payload))
        frame = bytes(header) + masked

        with self._send_lock:
            if self._closed:
                raise WebSocketError("WebSocket ja fechado")
            self._sock.sendall(frame)

    def send_text(self, text: str) -> None:
        self._send_frame(0x1, text.encode("utf-8"))

    def send_pong(self, payload: bytes = b"") -> None:
        self._send_frame(0xA, payload[:125])

    def recv_message(self) -> str | None:
        """Le uma mensagem completa (tratando fragmentacao e ping/pong/close)."""
        fragments: list[bytes] = []
        msg_opcode: int | None = None

        while True:
            b1, b2 = self._recv_exact(2)
            fin = (b1 & 0x80) != 0
            opcode = b1 & 0x0F
            masked = (b2 & 0x80) != 0
            length = b2 & 0x7F

            if length == 126:
                (length,) = struct.unpack("!H", self._recv_exact(2))
            elif length == 127:
                (length,) = struct.unpack("!Q", self._recv_exact(8))

            if length > MAX_WS_PAYLOAD:
                raise WebSocketError(f"Frame WebSocket excede limite ({length} bytes)")

            mask_key = self._recv_exact(4) if masked else b""
            payload = self._recv_exact(length) if length > 0 else b""
            if masked and payload:
                payload = bytes(b ^ mask_key[i & 3] for i, b in enumerate(payload))

            # Frames de controle podem ocorrer no meio de mensagens fragmentadas
            if opcode == 0x8:  # Close
                try:
                    self._send_frame(0x8, payload[:2])
                except Exception:
                    pass
                self.close()
                return None
            if opcode == 0x9:  # Ping
                try:
                    self.send_pong(payload)
                except Exception:
                    pass
                continue
            if opcode == 0xA:  # Pong
                continue

            if opcode in (0x1, 0x2):
                msg_opcode = opcode
                fragments = [payload]
            elif opcode == 0x0:
                if msg_opcode is None:
                    raise WebSocketError("Frame de continuacao sem inicio")
                fragments.append(payload)
            else:
                continue

            if fin:
                full = b"".join(fragments)
                if msg_opcode == 0x1:
                    return full.decode("utf-8", errors="replace")
                return full.decode("latin1", errors="replace")

    def close(self) -> None:
        if self._closed:
            return
        self._closed = True
        try:
            self._sock.shutdown(socket.SHUT_RDWR)
        except Exception:
            pass
        try:
            self._sock.close()
        except Exception:
            pass


class CDPClient:
    """Cliente CDP assincrono/thread-safe sobre MiniWebSocketClient."""

    def __init__(self, ws_url: str):
        self._ws = MiniWebSocketClient(ws_url)
        self._next_id = 1
        self._id_lock = threading.Lock()
        self._pending_lock = threading.Lock()
        self._pending: dict[int, tuple[threading.Event, dict[str, Any]]] = {}
        self._event_lock = threading.Lock()
        self._event_handlers: dict[str, list[Callable[[dict[str, Any]], None]]] = {}
        self._closed = False

        self._reader_thread = threading.Thread(
            target=self._reader_loop, name="cdp-reader", daemon=True
        )
        self._reader_thread.start()

    def on(self, method: str, callback: Callable[[dict[str, Any]], None]) -> None:
        with self._event_lock:
            self._event_handlers.setdefault(method, []).append(callback)

    def off(self, method: str, callback: Callable[[dict[str, Any]], None]) -> None:
        with self._event_lock:
            lst = self._event_handlers.get(method)
            if lst and callback in lst:
                lst.remove(callback)

    def _alloc_id(self) -> int:
        with self._id_lock:
            cid = self._next_id
            self._next_id += 1
            return cid

    def send_async(self, method: str, params: dict[str, Any] | None = None) -> int:
        """Envia comando CDP sem aguardar resposta (seguro para chamar dentro de callbacks)."""
        cid = self._alloc_id()
        msg: dict[str, Any] = {"id": cid, "method": method}
        if params is not None:
            msg["params"] = params
        self._ws.send_text(json.dumps(msg))
        return cid

    def call(
        self,
        method: str,
        params: dict[str, Any] | None = None,
        timeout: float = 20.0,
    ) -> dict[str, Any]:
        """Envia comando CDP e aguarda resposta correspondente por id."""
        if self._closed:
            raise WebSocketError("CDPClient fechado")
        cid = self._alloc_id()
        ev = threading.Event()
        slot: dict[str, Any] = {}
        with self._pending_lock:
            self._pending[cid] = (ev, slot)

        msg: dict[str, Any] = {"id": cid, "method": method}
        if params is not None:
            msg["params"] = params

        try:
            self._ws.send_text(json.dumps(msg))
        except Exception:
            with self._pending_lock:
                self._pending.pop(cid, None)
            raise

        if not ev.wait(timeout=timeout):
            with self._pending_lock:
                self._pending.pop(cid, None)
            raise TimeoutError(f"Timeout ({timeout}s) aguardando CDP {method}")

        if "error" in slot:
            err = slot["error"]
            raise RuntimeError(f"Erro CDP em {method}: {err}")
        return slot.get("result", {})

    def _reader_loop(self) -> None:
        try:
            while not self._closed:
                raw = self._ws.recv_message()
                if raw is None:
                    break
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    continue

                if "id" in data:
                    cid = data["id"]
                    with self._pending_lock:
                        entry = self._pending.pop(cid, None)
                    if entry is not None:
                        ev, slot = entry
                        if "error" in data:
                            slot["error"] = data["error"]
                        else:
                            slot["result"] = data.get("result", {})
                        ev.set()
                elif "method" in data:
                    method = data["method"]
                    params = data.get("params", {})
                    with self._event_lock:
                        callbacks = list(self._event_handlers.get(method, ()))
                    for cb in callbacks:
                        try:
                            cb(params)
                        except Exception:
                            pass
        except Exception:
            pass
        finally:
            self._closed = True
            with self._pending_lock:
                for _cid, (ev, slot) in self._pending.items():
                    slot["error"] = {"message": "Conexao CDP encerrada"}
                    ev.set()
                self._pending.clear()

    def close(self) -> None:
        self._closed = True
        self._ws.close()


class BrowserCDPBackend:
    """
    Backend Chromium headless via CDP puro (compativel com GameBackend de motor_tnmn.py).

    Grava gameplay real em MP4 usando Page.startScreencast + timestamps reais + ffconcat,
    enquanto permite capture_screenshot(), click(), drag() e type_text() concorrentes.
    """

    def __init__(
        self,
        width: int = 1280,
        height: int = 720,
        fps: int = 30,
        url: str = DEFAULT_GAME_URL,
        port: int = 9222,
        work_dir: Path | None = None,
        chromium_bin: str | None = None,
        load_wait_sec: float = 2.0,
    ):
        self.width = int(width)
        self.height = int(height)
        self.fps = int(fps)
        self.url = url
        self.port = _pick_free_port(int(port))
        self.work_dir = Path(work_dir) if work_dir else Path(tempfile.mkdtemp(prefix="tnmn_cdp_"))
        self.work_dir.mkdir(parents=True, exist_ok=True)
        self._owns_profile_dir = True
        self._profile_dir = self.work_dir / f"_chromium_profile_{self.port}"
        self._profile_dir.mkdir(parents=True, exist_ok=True)
        self._chromium_bin = chromium_bin or find_chromium_binary()
        self._load_wait_sec = float(load_wait_sec)

        # Compatibilidade com GameBackend
        self.offset_x = 0
        self.offset_y = 0
        self.rec_proc: subprocess.Popen[bytes] | None = None
        self.rec_path: Path | None = None
        self.rec_start_mono: float | None = None
        # Pausa do jogo (relay com o subagente): o tempo pausado some da gravacao
        self._paused_total = 0.0
        self._pause_start: float | None = None

        self._browser_proc: subprocess.Popen[bytes] | None = None
        self._cdp: CDPClient | None = None
        self._action_lock = threading.Lock()

        # Estado de gravacao via screencast
        self._recording = False
        self._frames_dir: Path | None = None
        self._frame_records: list[tuple[str, float]] = []
        self._frame_lock = threading.Lock()
        self._sc_handler: Callable[[dict[str, Any]], None] | None = None

        self._start_browser_and_connect()

    def norm_to_px(self, x_norm: float, y_norm: float) -> tuple[int, int]:
        px = self.offset_x + int(round(_clamp(x_norm, 0.0, 1000.0) * self.width / 1000.0))
        py = self.offset_y + int(round(_clamp(y_norm, 0.0, 1000.0) * self.height / 1000.0))
        return px, py

    def current_video_sec(self, prior_sec: float = 0.0) -> float:
        if self.rec_start_mono is None:
            return round(prior_sec, 3)
        return round(prior_sec + max(0.0, self._clock() - self.rec_start_mono), 3)

    def _clock(self) -> float:
        """Relogio da gravacao: monotonic menos o tempo em que o jogo ficou pausado."""
        agora = self._pause_start if self._pause_start is not None else time.monotonic()
        return agora - self._paused_total

    def set_paused(self, pausado: bool) -> None:
        """Congela/descongela o Scratch (frameLoop do TurboWarp) e a gravacao."""
        if not self._cdp:
            return
        js = "(()=>{const v=window.vm||(window.scaffolding&&scaffolding.vm);if(!v)return 'sem vm';v.runtime.frameLoop.%s();return 'ok'})()" % ("stop" if pausado else "start")
        if pausado and self._pause_start is None:
            self._cdp.call("Runtime.evaluate", {"expression": js, "returnByValue": True})
            time.sleep(0.3)  # deixa o ultimo quadro chegar antes de cortar a gravacao
            self._pause_start = time.monotonic()
        elif not pausado and self._pause_start is not None:
            self._paused_total += time.monotonic() - self._pause_start
            self._pause_start = None
            self._cdp.call("Runtime.evaluate", {"expression": js, "returnByValue": True})

    def _build_launch_cmd(self, fallback_headless: bool = False) -> list[str]:
        headless_flag = "--headless" if fallback_headless else "--headless=new"
        cmd = [
            self._chromium_bin,
            headless_flag,
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            f"--window-size={self.width},{self.height}",
            f"--remote-debugging-port={self.port}",
            "--remote-allow-origins=*",
            f"--user-data-dir={self._profile_dir}",
            "--autoplay-policy=no-user-gesture-required",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--ignore-gpu-blocklist",
            "--enable-webgl",
            "--enable-unsafe-swiftshader",
        ]
        if fallback_headless:
            cmd.append("--disable-gpu")
        else:
            # Termux/Android: so ANGLE+SwiftShader liga o WebGL. TNMN_GL_FLAGS troca as flags sem editar o codigo.
            gl_flags = os.environ.get("TNMN_GL_FLAGS")
            cmd.extend(gl_flags.split() if gl_flags else ["--use-gl=angle", "--use-angle=swiftshader-webgl", "--disable-gpu-watchdog", "--disable-gpu-process-crash-limit"])
        cmd.append("about:blank")
        return cmd

    def _fetch_ws_debugger_url(self, timeout: float = 15.0) -> str:
        deadline = time.monotonic() + timeout
        list_url = f"http://127.0.0.1:{self.port}/json"
        last_err: Exception | None = None

        while time.monotonic() < deadline:
            if self._browser_proc is not None and self._browser_proc.poll() is not None:
                raise RuntimeError(
                    f"Chromium encerrou prematuramente (codigo {self._browser_proc.returncode})"
                )
            try:
                with urllib.request.urlopen(list_url, timeout=2.0) as resp:
                    targets = json.loads(resp.read().decode("utf-8"))
                for t in targets:
                    if t.get("type") == "page" and t.get("webSocketDebuggerUrl"):
                        return str(t["webSocketDebuggerUrl"])
            except Exception as exc:
                last_err = exc
            time.sleep(0.25)

        raise RuntimeError(
            f"Nao foi possivel obter alvo CDP em {list_url} apos {timeout}s ({last_err})"
        )

    def _start_browser_and_connect(self) -> None:
        log_stderr = (self.work_dir / "_chromium_stderr.log").open("wb")
        try:
            cmd = self._build_launch_cmd(fallback_headless=False)
            _log(f"Iniciando Chromium ({self._chromium_bin}) na porta CDP {self.port}...")
            self._browser_proc = subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=log_stderr,
            )
            time.sleep(1.0)
            if self._browser_proc.poll() is not None:
                _log("Fallback de flags Chromium (--headless --disable-gpu)...")
                cmd = self._build_launch_cmd(fallback_headless=True)
                self._browser_proc = subprocess.Popen(
                    cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=log_stderr,
                )
        finally:
            log_stderr.close()

        ws_url = self._fetch_ws_debugger_url(timeout=45.0)
        self._cdp = CDPClient(ws_url)
        self._cdp.call("Page.enable")
        self._cdp.call("Runtime.enable")
        self._cdp.call(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": self.width,
                "height": self.height,
                "deviceScaleFactor": 1,
                "mobile": False,
            },
        )

        if self.url:
            self.navigate(self.url, wait_sec=self._load_wait_sec)

    def navigate(self, url: str, timeout: float = 20.0, wait_sec: float = 2.0) -> None:
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        loaded = threading.Event()

        def _on_load(_params: dict[str, Any]) -> None:
            loaded.set()

        self._cdp.on("Page.loadEventFired", _on_load)
        try:
            _log(f"Navegando para {url}...")
            self._cdp.call("Page.navigate", {"url": url}, timeout=timeout)
            loaded.wait(timeout=timeout)
        finally:
            self._cdp.off("Page.loadEventFired", _on_load)

        if wait_sec > 0:
            time.sleep(wait_sec)

    def screenshot(self, out_path: str | Path) -> Path:
        """Captura screenshot PNG real da aba e salva em out_path."""
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        with self._action_lock:
            res = self._cdp.call("Page.captureScreenshot", {"format": "png"}, timeout=20.0)
        raw = base64.b64decode(res["data"])
        dest = Path(out_path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        return dest

    def capture_screenshot(self) -> "Image.Image":
        """Interface GameBackend: retorna PIL.Image RGB real 1280x720."""
        if Image is None:
            raise RuntimeError(f"Pillow necessario para capture_screenshot(): {_PIL_IMPORT_ERR}")
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        with self._action_lock:
            res = self._cdp.call("Page.captureScreenshot", {"format": "png"}, timeout=20.0)
        raw = base64.b64decode(res["data"])
        with Image.open(io.BytesIO(raw)) as im:
            rgb = im.convert("RGB")
        self.width, self.height = rgb.size
        return rgb

    def click(self, x_norm: float, y_norm: float, double: bool = False) -> None:
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        px, py = self.norm_to_px(x_norm, y_norm)
        with self._action_lock:
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mouseMoved", "x": px, "y": py, "button": "none"},
            )
            # Scratch le o mouse 1x por quadro e o SwiftShader e lento: passar por cima e segurar o clique
            time.sleep(0.15)
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mousePressed", "x": px, "y": py, "button": "left", "clickCount": 1},
            )
            time.sleep(0.25)
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mouseReleased", "x": px, "y": py, "button": "left", "clickCount": 1},
            )
            if double:
                time.sleep(0.06)
                self._cdp.call(
                    "Input.dispatchMouseEvent",
                    {"type": "mousePressed", "x": px, "y": py, "button": "left", "clickCount": 2},
                )
                time.sleep(0.05)
                self._cdp.call(
                    "Input.dispatchMouseEvent",
                    {"type": "mouseReleased", "x": px, "y": py, "button": "left", "clickCount": 2},
                )

    def drag(self, x1: float, y1: float, x2: float, y2: float) -> None:
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        px1, py1 = self.norm_to_px(x1, y1)
        px2, py2 = self.norm_to_px(x2, y2)
        steps = 10
        with self._action_lock:
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mouseMoved", "x": px1, "y": py1, "button": "none"},
            )
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mousePressed", "x": px1, "y": py1, "button": "left", "clickCount": 1},
            )
            for i in range(1, steps + 1):
                ix = int(round(px1 + (px2 - px1) * i / steps))
                iy = int(round(py1 + (py2 - py1) * i / steps))
                self._cdp.call(
                    "Input.dispatchMouseEvent",
                    {"type": "mouseMoved", "x": ix, "y": iy, "button": "left", "buttons": 1},
                )
                time.sleep(0.025)
            self._cdp.call(
                "Input.dispatchMouseEvent",
                {"type": "mouseReleased", "x": px2, "y": py2, "button": "left", "clickCount": 1},
            )

    def type_text(self, text: str) -> None:
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        with self._action_lock:
            has_newline = text.endswith("\n") or text.endswith("\r")
            clean = text.rstrip("\r\n")
            if clean:
                self._cdp.call("Input.insertText", {"text": clean})
            if has_newline:
                self._cdp.call(
                    "Input.dispatchKeyEvent",
                    {"type": "keyDown", "key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13},
                )
                self._cdp.call(
                    "Input.dispatchKeyEvent",
                    {"type": "keyUp", "key": "Enter", "code": "Enter", "windowsVirtualKeyCode": 13},
                )

    def start_recording(self, out_mp4: Path) -> None:
        if not self._cdp:
            raise RuntimeError("CDP nao conectado")
        out_mp4 = Path(out_mp4)
        out_mp4.parent.mkdir(parents=True, exist_ok=True)
        self.rec_path = out_mp4
        self._frames_dir = out_mp4.parent / f"_frames_{out_mp4.stem}"
        shutil.rmtree(self._frames_dir, ignore_errors=True)
        self._frames_dir.mkdir(parents=True, exist_ok=True)

        with self._frame_lock:
            self._frame_records = []
            self._recording = True

        self.rec_start_mono = time.monotonic()

        def _on_screencast_frame(params: dict[str, Any]) -> None:
            session_id = params.get("sessionId")
            b64_data = params.get("data")
            if session_id is not None and self._cdp:
                # Ack imediato nao-bloqueante para manter o fluxo do screencast
                try:
                    self._cdp.send_async(
                        "Page.screencastFrameAck", {"sessionId": session_id}
                    )
                except Exception:
                    pass
            if not b64_data:
                return
            if self._pause_start is not None:
                return  # jogo pausado: nada vai pra gravacao
            t_now = self._clock()
            with self._frame_lock:
                if not self._recording or self._frames_dir is None:
                    return
                idx = len(self._frame_records)
                fname = f"frame_{idx:06d}.jpg"
                fpath = self._frames_dir / fname
                self._frame_records.append((fname, t_now))
            try:
                fpath.write_bytes(base64.b64decode(b64_data))
            except Exception:
                pass

        self._sc_handler = _on_screencast_frame
        self._cdp.on("Page.screencastFrame", _on_screencast_frame)
        self._cdp.call(
            "Page.startScreencast",
            {
                "format": "jpeg",
                "quality": 82,
                "maxWidth": self.width,
                "maxHeight": self.height,
                "everyNthFrame": 1,
            },
        )
        _log(f"Gravacao CDP screencast iniciada -> {out_mp4}")

    def stop_recording(self) -> None:
        if not self._recording:
            return
        t_stop = self._clock()
        with self._frame_lock:
            self._recording = False

        if self._cdp:
            try:
                self._cdp.call("Page.stopScreencast", timeout=5.0)
            except Exception:
                pass
            if self._sc_handler is not None:
                self._cdp.off("Page.screencastFrame", self._sc_handler)
                self._sc_handler = None

        if self.rec_path is None or self._frames_dir is None:
            return

        with self._frame_lock:
            records = list(self._frame_records)

        # Se nenhum frame chegou (tela totalmente estatica), captura 1 frame fallback
        if not records and self._cdp:
            try:
                res = self._cdp.call("Page.captureScreenshot", {"format": "jpeg", "quality": 82}, timeout=10.0)
                fallback_name = "frame_000000.jpg"
                (self._frames_dir / fallback_name).write_bytes(base64.b64decode(res["data"]))
                records.append((fallback_name, self.rec_start_mono or t_stop))
            except Exception:
                pass

        if not records:
            _log("Aviso: nenhum frame capturado no screencast; MP4 nao gerado.")
            return

        t0 = self.rec_start_mono if self.rec_start_mono is not None else records[0][1]
        ts_meta = [
            {"file": fname, "t_sec": round(max(0.0, ts - t0), 4)}
            for fname, ts in records
        ]
        (self._frames_dir / "timestamps.json").write_text(
            json.dumps(ts_meta, indent=2), encoding="utf-8"
        )

        # Gera ffconcat com duracoes reais entre frames para sincronia exata com t_video_sec
        concat_lines = ["ffconcat version 1.0"]
        for i, (fname, ts) in enumerate(records):
            fpath = (self._frames_dir / fname).resolve()
            if i == 0 and (ts - t0) > 0.05:
                # Cobre eventual atraso antes do primeiro frame
                dur = (records[1][1] - t0) if len(records) > 1 else max(0.04, t_stop - t0)
            elif i + 1 < len(records):
                dur = records[i + 1][1] - ts
            else:
                dur = t_stop - ts
            dur = max(0.02, dur)
            concat_lines.append(f"file '{fpath}'")
            concat_lines.append(f"duration {dur:.6f}")

        # Repete o ultimo arquivo sem duration para que ffmpeg respeite a duracao final
        last_fpath = (self._frames_dir / records[-1][0]).resolve()
        concat_lines.append(f"file '{last_fpath}'")

        concat_path = self._frames_dir / "frames.ffconcat"
        concat_path.write_text("\n".join(concat_lines) + "\n", encoding="utf-8")

        ff = _find_ffmpeg()
        vf = (
            f"fps={self.fps},"
            f"scale={self.width}:{self.height}:force_original_aspect_ratio=decrease,"
            f"pad={self.width}:{self.height}:(ow-iw)/2:(oh-ih)/2,"
            "format=yuv420p"
        )
        cmd = [
            ff,
            "-y",
            "-v",
            "warning",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_path),
            "-vf",
            vf,
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "20",
            "-movflags",
            "+faststart",
            str(self.rec_path),
        ]
        _log(f"Montando MP4 ({len(records)} frames reais, {t_stop - t0:.2f}s) -> {self.rec_path}")
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if res.returncode != 0:
            _log(f"Erro ffmpeg ao gerar MP4: {res.stderr[:400]}")
        else:
            shutil.rmtree(self._frames_dir, ignore_errors=True)
            _log(f"Gravacao MP4 finalizada: {self.rec_path}")

    def close(self) -> None:
        try:
            if self._recording:
                self.stop_recording()
        except Exception:
            pass
        if self._cdp is not None:
            try:
                self._cdp.close()
            except Exception:
                pass
            self._cdp = None
        if self._browser_proc is not None and self._browser_proc.poll() is None:
            try:
                self._browser_proc.terminate()
                self._browser_proc.wait(timeout=5.0)
            except Exception:
                try:
                    self._browser_proc.kill()
                except Exception:
                    pass
            self._browser_proc = None

    def __del__(self) -> None:
        self.close()


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Teste rapido do cliente CDP / Chromium headless")
    ap.add_argument("--test-url", required=True, help="URL para abrir e capturar screenshot")
    ap.add_argument("--out", type=Path, required=True, help="Caminho do PNG de saida")
    ap.add_argument("--width", type=int, default=1280, help="Largura da viewport (padrao: 1280)")
    ap.add_argument("--height", type=int, default=720, help="Altura da viewport (padrao: 720)")
    ap.add_argument("--port", type=int, default=9222, help="Porta CDP (padrao: 9222)")
    ap.add_argument("--wait", type=float, default=6.0, help="Segundos de espera apos carregar (padrao: 6.0)")
    return ap.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    backend = BrowserCDPBackend(
        width=args.width,
        height=args.height,
        url=args.test_url,
        port=args.port,
        load_wait_sec=args.wait,
    )
    try:
        saved = backend.screenshot(args.out)
        _log(f"Screenshot salvo em {saved}")
    finally:
        backend.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
