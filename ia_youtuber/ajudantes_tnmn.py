#!/usr/bin/env python3
"""
Ajudantes do IA YouTuber no That's Not My Neighbor (remake Scratch 1151980401, TurboWarp).

A IA pensa devagar (o jogo fica pausado enquanto ela decide), entao o motor ganha "reflexos" em Python,
lidos direto da VM do Scratch (window.vm), sem trapaca: NUNCA le se o visitante e doppelganger.

  - estado_jogo(): porta aberta/fechada, visitante na janela ou andando, pasta aberta (andar/ficha),
    emergencia armada, telefone aberto, quantos ja entraram/foram removidos, numero do visitante.
  - clicar_sprite(): clica no botao pelo lugar REAL do sprite (a camera segue o mouse, entao a posicao muda);
    move o mouse, recalcula e so entao clica.
  - Vigia (thread): porta aberta + alguem acabou de passar -> fecha a porta sozinho na hora.
  - Macros: liberar, chamar_ddd (emergencia + 3312), ligar NNNN, abrir_pasta andar/ficha, fechar_pastas,
    documento_pedido, documento_id, checklist, perguntar.

Mecanica (lida do projeto): a lista "Things" do palco guarda
  [1] "<0|1> Puerta"  [2..4] "<ficha 0-4> Carpeta N"  [5] "<0|1> Emergencia"
  [6] moradores dentro  [7] doppelgangers dentro  [8] moradores removidos  [9] doppelgangers capturados
  [13] contador de visitantes. Com a porta aberta TODO visitante que chega atravessa direto.
"""
from __future__ import annotations

import json
import threading
import time
from typing import Any, Callable

# ----------------------------------------------------------------------------------------------
# JavaScript (roda na pagina do TurboWarp)
# ----------------------------------------------------------------------------------------------
JS_ESTADO = r"""(()=>{const v=window.vm;if(!v)return null;const st=v.runtime.getTargetForStage();
const L=n=>{for(const id in st.variables){const x=st.variables[id];if(x.name===n&&x.type==='list')return x.value}return []};
const V=n=>{for(const id in st.variables){if(st.variables[id].name===n)return st.variables[id].value}return null};
const vis=n=>v.runtime.targets.filter(t=>!t.isStage&&t.sprite.name===n&&t.visible);
const T=L('Things').map(String);
const d=vis('Dopplegangers');
return JSON.stringify({things:T,posX:V('pos X'),stop:V('STOP GAME'),
 visitante:d.length>0,phone:vis('Phone').length,
 btn:vis('Buttons').map(t=>t.getCostumes()[t.currentCostume].name),checklist:vis('Checklist').length,
 docs:vis('documents').map(t=>t.getCostumes()[t.currentCostume].name.replace(/^[A-Z] /,'')),
 closed:vis('CLOSED').length,endmenu:vis('End menu').length});})()"""

JS_ALVO = r"""(()=>{const v=window.vm;if(!v)return null;const r=v.renderer;
const cv=document.querySelector('canvas');if(!cv)return null;const rc=cv.getBoundingClientRect();
const W=v.runtime.stageWidth||480,H=v.runtime.stageHeight||360;
const re=new RegExp(%(regex)s);
const ts=v.runtime.targets.filter(t=>!t.isStage&&t.sprite.name===%(sprite)s&&t.visible&&re.test(t.getCostumes()[t.currentCostume].name));
if(!ts.length)return null;
ts.sort((a,b)=>r._drawList.indexOf(b.drawableID)-r._drawList.indexOf(a.drawableID));
const t=ts[0];const b=r.getBounds(t.drawableID);if(!b)return null;
const cw=cv.clientWidth,ch=cv.clientHeight;
const ign=new Set(['Pointer','left hand','right hand','Film effect','LIGHTS','Particles','Text','Text Engine']);
const cand=v.runtime.targets.filter(x=>!x.isStage&&x.visible&&!ign.has(x.sprite.name)).map(x=>x.drawableID);
const pts=[[.5,.5],[.5,.4],[.5,.6],[.4,.5],[.6,.5],[.35,.35],[.65,.65],[.35,.65],[.65,.35],[.5,.25],[.5,.75],[.25,.5],[.75,.5]];
for(const [fx,fy] of pts){const sx=b.left+(b.right-b.left)*fx,sy=b.bottom+(b.top-b.bottom)*fy;
 const cx=(sx+W/2)/W*cw,cy=(H/2-sy)/H*ch;
 if(r.pick(cx,cy,1,1,cand)===t.drawableID)return [rc.left+cx,rc.top+cy,1];}
return [rc.left+((b.left+b.right)/2+W/2)/W*cw,rc.top+(H/2-(b.top+b.bottom)/2)/H*ch,0];})()"""

JS_CLICADO = r"""(()=>{const v=window.vm;if(!v)return 0;const re=new RegExp(%(regex)s);
const ts=v.runtime.targets.filter(t=>!t.isStage&&t.sprite.name===%(sprite)s&&t.visible&&re.test(t.getCostumes()[t.currentCostume].name));
if(!ts.length)return 0;v.runtime.startHats('event_whenthisspriteclicked',null,ts[0]);return 1;})()"""

# botoes que ficam debaixo da caixa de dialogo do jogo: o clique e entregue direto ao botao (mesmo evento do Scratch)
DIRETO = {"porta", "caixa_perigo"}

# (sprite, regex do nome do traje)
ALVOS: dict[str, tuple[str, str]] = {
    "porta": ("Buttons", r"^1 [01]$"),
    "pasta_andar_1": ("Buttons", r"^2 \d$"),
    "pasta_andar_2": ("Buttons", r"^3 \d$"),
    "pasta_andar_3": ("Buttons", r"^4 \d$"),
    "caixa_perigo": ("Buttons", r"^5 [01] ?$"),
    "telefone": ("Buttons", r"^6$"),
    "checklist": ("Buttons", r"^7$"),
    "documento_pedido": ("documents", r"Solicitud$"),
    "documento_id": ("documents", r"[Ii]dentificador$"),
    "perguntar": ("Checklist", r"^Queston$"),
    "telefone_voltar": ("Phone", r"^Back$"),
}
for _d in "123456789":
    ALVOS[f"tecla_{_d}"] = ("Phone", rf"^{_d}$")

# nomes antigos do coords_tnmn.json -> alvo novo
APELIDOS = {
    "botao_verde_destrancar": "liberar",
    "botao_vermelho_trancar": "porta",
    "documento_mesa": "documento_pedido",
}


def _num(s: str) -> int:
    try:
        return int(str(s).strip().split(" ")[0])
    except (ValueError, IndexError):
        return 0


class Ajudantes:
    def __init__(self, backend: Any, log: Callable[[str], None] = print):
        self.b = backend
        self.log = log
        self.eventos: list[str] = []  # o que os reflexos fizeram sozinhos (vai pro pedido do proximo turno)
        self._vigia_on = False
        self._lock = threading.Lock()
        self._passados_ao_abrir: int | None = None

    # ------------------------------------------------------------------ baixo nivel
    def js(self, expr: str, timeout: float = 15.0) -> Any:
        res = self.b._cdp.call("Runtime.evaluate", {"expression": expr, "returnByValue": True}, timeout=timeout)
        return (res or {}).get("result", {}).get("value")

    def estado(self) -> dict[str, Any] | None:
        try:
            raw = self.js(JS_ESTADO)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    @staticmethod
    def _contagens(e: dict[str, Any]) -> dict[str, int]:
        t = e.get("things") or []
        g = lambda i: _num(t[i]) if len(t) > i else 0  # noqa: E731
        c = {
            "porta": g(0), "pasta1": g(1), "pasta2": g(2), "pasta3": g(3), "emerg": g(4),
            "passaram": g(5) + g(6), "removidos": g(7) + g(8), "visitante_n": g(12),
        }
        # O que esta desenhado na tela manda: traje "1 1" = porta aberta, "2 3" = pasta do andar 1 na ficha R03, "5 1" = emergencia
        btn = [str(x).strip() for x in (e.get("btn") or [])]
        if btn:
            c["porta"] = 1 if "1 1" in btn else 0
            c["emerg"] = 1 if any(x.startswith("5 1") for x in btn) else 0
            for andar in (1, 2, 3):
                pag = [int(x[2]) for x in btn if len(x) == 3 and x[0] == str(andar + 1) and x[2].isdigit()]
                c[f"pasta{andar}"] = max(pag) if pag else 0
        return c

    def _alvo(self, nome: str) -> tuple[float, float, int] | None:
        sprite, regex = ALVOS[nome]
        try:
            r = self.js(JS_ALVO % {"sprite": json.dumps(sprite), "regex": json.dumps(regex)})
        except Exception:
            return None
        return (float(r[0]), float(r[1]), int(r[2])) if r else None

    def clicar_sprite(self, nome: str) -> bool:
        """A camera anda com o mouse: aproxima o mouse do botao, recalcula e clica onde ele esta de verdade."""
        alvo = self._alvo(nome)
        if alvo is None:
            self.log(f"[ajudante] '{nome}' nao esta na tela")
            return False
        for _ in range(3):
            self.b.move_px(alvo[0], alvo[1])
            time.sleep(0.12)
            novo = self._alvo(nome)
            if novo is None:
                break
            if abs(novo[0] - alvo[0]) < 2 and abs(novo[1] - alvo[1]) < 2:
                alvo = novo
                break
            alvo = novo
        if nome in DIRETO:
            sprite, regex = ALVOS[nome]
            ok = self.js(JS_CLICADO % {"sprite": json.dumps(sprite), "regex": json.dumps(regex)})
            return bool(ok)
        if alvo[2] == 0:
            self.log(f"[ajudante] '{nome}': ponto exato nao confirmado, clicando no centro do botao")
        self.b.click_px(alvo[0], alvo[1])
        return True

    # ------------------------------------------------------------------ vigia (reflexo da porta)
    def iniciar_vigia(self) -> None:
        if self._vigia_on:
            return
        self._vigia_on = True
        threading.Thread(target=self._loop_vigia, daemon=True).start()

    def parar_vigia(self) -> None:
        self._vigia_on = False

    def _loop_vigia(self) -> None:
        while self._vigia_on:
            time.sleep(0.2)
            if getattr(self.b, "_pause_start", None) is not None:
                continue  # jogo pausado (a IA esta pensando)
            e = self.estado()
            if not e:
                continue
            c = self._contagens(e)
            with self._lock:
                if c["porta"] != 1:
                    self._passados_ao_abrir = None
                    continue
                if self._passados_ao_abrir is None:
                    self._passados_ao_abrir = c["passaram"]
                    continue
                if c["passaram"] > self._passados_ao_abrir:
                    self.log("[ajudante] visitante entrou -> fechando a porta")
                    if self.clicar_sprite("porta"):
                        self.eventos.append("o reflexo fechou a porta logo depois que o visitante entrou")
                    self._passados_ao_abrir = None
                    time.sleep(0.6)

    # ------------------------------------------------------------------ texto pro pedido da IA
    def resumo_texto(self) -> str:
        e = self.estado()
        if not e:
            return "ESTADO DO JOGO: indisponivel"
        c = self._contagens(e)
        if e.get("endmenu"):
            return "ESTADO DO JOGO: turno ENCERRADO (tela de resumo final)."
        pastas = [f"andar {i} na ficha R0{c[f'pasta{i}']}" for i in (1, 2, 3) if c[f"pasta{i}"] > 0]
        linhas = [
            f"porta: {'ABERTA (todo mundo que chegar entra!)' if c['porta'] == 1 else 'fechada'}",
            "visitante: " + ("parado na janela" if e.get("visitante") and abs(float(e.get("posX") or 0)) < 1 else
                             ("andando (chegando ou saindo)" if e.get("visitante") else "ninguem na janela")),
            "pasta aberta: " + (", ".join(pastas) if pastas else "nenhuma"),
            f"emergencia (grade baixada): {'SIM' if c['emerg'] == 1 or e.get('closed') else 'nao'}",
            f"telefone: {'ABERTO (disco na tela)' if e.get('phone') else 'fechado'}",
            f"checklist: {'aberta' if e.get('checklist') else 'fechada'}",
            "papeis na mesa: " + (", ".join(sorted(set(e.get('docs') or []))) or "nenhum"),
            f"visitante numero {c['visitante_n'] + 1}; ja entraram {c['passaram']}; removidos pelo D.D.D. {c['removidos']}",
        ]
        ev = self.eventos[-3:]
        self.eventos.clear()
        if ev:
            linhas.append("reflexos automaticos desde o ultimo turno: " + "; ".join(ev))
        return "ESTADO DO JOGO (lido do jogo, confiavel):\n- " + "\n- ".join(linhas)

    # ------------------------------------------------------------------ macros
    def executar(self, act: dict[str, Any]) -> bool:
        tipo = act.get("tipo")
        nome = APELIDOS.get(str(act.get("nome", "")), str(act.get("nome", "")))
        if tipo == "acao_semantica" and nome == "liberar":
            return self.liberar()
        if tipo == "acao_semantica" and nome in ("chamar_ddd", "doppelganger"):
            return self.chamar_ddd()
        if tipo == "acao_semantica" and nome == "fechar_pastas":
            return self.fechar_pastas()
        if tipo == "acao_semantica" and nome in ALVOS:
            return self.clicar_sprite(nome)
        if tipo in ("ligar", "discar") and act.get("numero"):
            return self.ligar(str(act["numero"]))
        if tipo == "pasta":
            return self.abrir_pasta(int(act.get("andar", 1)), int(act.get("ficha", act.get("apto", 1))))
        return False

    def _limpar_mesa(self) -> None:
        self.fechar_pastas()
        if (self.estado() or {}).get("phone"):
            self.clicar_sprite("telefone_voltar")
            time.sleep(0.5)

    def liberar(self) -> bool:
        c = self._contagens(self.estado() or {})
        if c["porta"] == 1:
            return True
        self._limpar_mesa()
        ok = self.clicar_sprite("porta")
        with self._lock:
            self._passados_ao_abrir = c["passaram"]
        return ok

    def fechar_pastas(self) -> bool:
        for _ in range(12):
            c = self._contagens(self.estado() or {})
            abertas = [i for i in (1, 2, 3) if c[f"pasta{i}"] > 0]
            if not abertas:
                return True
            self.clicar_sprite(f"pasta_andar_{abertas[0]}")
            time.sleep(0.35)
        return False

    def abrir_pasta(self, andar: int, ficha: int) -> bool:
        andar = max(1, min(3, andar))
        ficha = max(1, min(4, ficha))
        for _ in range(8):
            c = self._contagens(self.estado() or {})
            if c[f"pasta{andar}"] == ficha:
                return True
            outras = [i for i in (1, 2, 3) if i != andar and c[f"pasta{i}"] > 0]
            if outras:
                self.fechar_pastas()
                continue
            self.clicar_sprite(f"pasta_andar_{andar}")
            time.sleep(0.4)
        return False

    def ligar(self, numero: str) -> bool:
        digitos = [d for d in numero if d in "123456789"]
        if not digitos:
            return False
        e = self.estado() or {}
        if not e.get("phone"):
            self.fechar_pastas()
            self.clicar_sprite("telefone")
            for _ in range(15):
                time.sleep(0.2)
                if (self.estado() or {}).get("phone"):
                    break
        for d in digitos:
            self.clicar_sprite(f"tecla_{d}")
            time.sleep(0.3)
        return True

    def chamar_ddd(self) -> bool:
        c = self._contagens(self.estado() or {})
        if c["emerg"] != 1:
            self._limpar_mesa()
            self.clicar_sprite("caixa_perigo")
            time.sleep(1.2)
        return self.ligar("3312")
