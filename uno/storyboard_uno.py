#!/usr/bin/env python3
"""
UNO das IAs — Storyboard Oficial v2 (Canal Felipex007 · Duração-alvo: 12 a 15 minutos)

Upgrades da v2:
  - Motor de voz atualizado para ElevenLabs v4 (`ELEVEN_MODEL = "eleven_v4"`).
  - Narração PT-BR fluida e natural (zero códigos crus como Y-6 ou A-+2 lidos pelo narrador).
  - Presença forte e recorrente da Inkling Mini nas conversas das DUAS partidas (17 falas/pensamentos
    verbatim dos logs reais, contra apenas 4 na v1).
  - Continuidade narrativa reforçada entre todas as cenas (fechando todos os saltos de turno em P1 e P2).

Regras de ouro seguidas à risca (CLAUDE.md + video/MEMORIA_TECNICA.md):
  - Narrador = Felipe em 1ª pessoa ("eu coloquei", nunca "o Felipe", nunca diz que é IA/Claude).
  - Abertura no clímax (~11s) -> Regras numa cena só (<=20s) -> Elenco acendendo por nome.
  - 100% fiel aos logs reais (`uno/logs/partida_1.json` e `uno/logs/partida_2.json`):
      * TODA fala e TODO pensamento de IA é cópia literal exata do JSON.
      * TODO estado de `mesa` (mãos reais, descarte, monte, cor, sentido, bomba, UNO) é
        reconstruído diretamente dos logs sem nenhuma invenção.
  - Pensamento usa `modo="pensamento"` (FFmpeg `aecho`, NUNCA `[whispers]`). Todo balão tem voz.
  - ZERO emojis em qualquer campo (falas, selos, legendas, títulos, banners, pódio).
  - ZERO memes repetidos no vídeo inteiro (32 GIFs únicos auditados por md5).
  - Meme da cena tem a mesma duração do selo da cena; nenhum overlay cortado.
  - Apenas trilhas locais presentes em `video/remotion/public/music/` (créditos em descricao_youtube_uno.md).
"""
from __future__ import annotations

import json
from pathlib import Path

ELEVEN_MODEL = "eleven_v4"
FPS = 30

# =============================================================================
# ELENCO OFICIAL (7 IAs · 7 famílias · ordem exata dos assentos 0..6 em ASSENTOS_7)
# =============================================================================
ELENCO = [
    {
        "id": "hydrogen",
        "nome": "Gemini Hydrogen",
        "modelo": "Gemini 4 Hydrogen",
        "empresa": "Google",
        "corPerfil": "#3b82f6",
        "tagline": "O estrategista vingativo",
    },
    {
        "id": "sonnet",
        "nome": "Claude Sonnet",
        "modelo": "Claude Sonnet 5.5",
        "empresa": "Anthropic",
        "corPerfil": "#f59e0b",
        "tagline": "O figurante mais traidor",
    },
    {
        "id": "inkling",
        "nome": "Inkling Mini",
        "modelo": "Inkling 2 Mini",
        "empresa": "Thinking Machines",
        "corPerfil": "#a855f7",
        "tagline": "Caos, blefe e bombas",
    },
    {
        "id": "deepseek",
        "nome": "DeepSeek",
        "modelo": "DeepSeek Flash",
        "empresa": "DeepSeek",
        "corPerfil": "#06b6d4",
        "tagline": "O cobrador de juros",
    },
    {
        "id": "qwen",
        "nome": "Qwen 27B",
        "modelo": "Qwen 3.8 27B",
        "empresa": "Alibaba",
        "corPerfil": "#ec4899",
        "tagline": "O diplomata do pacto",
    },
    {
        "id": "luna",
        "nome": "GPT-6 Luna",
        "modelo": "GPT-6 Luna",
        "empresa": "OpenAI",
        "corPerfil": "#10b981",
        "tagline": "Calma até no caos",
    },
    {
        "id": "glm",
        "nome": "GLM Flash",
        "modelo": "GLM 5.3 Flash",
        "empresa": "Z.ai",
        "corPerfil": "#ef4444",
        "tagline": "Guarda bem esse nome",
    },
]

_ELENCO_BY_ID = {j["id"]: j for j in ELENCO}
_LOGS_DIR = Path(__file__).resolve().parent / "logs"
_MATCH_CACHE: dict[int, dict[int, dict]] = {}


def _build_match_snapshots(partida_num: int) -> dict[int, dict]:
    """Reconstrói o estado real exato da mesa em cada turno (0..N) direto do JSON do log."""
    if partida_num in _MATCH_CACHE:
        return _MATCH_CACHE[partida_num]

    log_path = _LOGS_DIR / f"partida_{partida_num}.json"
    data = json.loads(log_path.read_text(encoding="utf-8"))

    hands: dict[str, list[str]] = {}
    uno_flag: dict[str, bool] = {}
    cor_ativa = "Verde"
    direcao = 1
    pilha_compra = 0
    deck_count = 108 - 7 * 7 - 1
    descarte: list[str] = []
    snaps: dict[int, dict] = {}

    def _snapshot(turno: int) -> dict:
        jogadores = []
        for j in ELENCO:
            pid = j["id"]
            mao = list(hands.get(pid, []))
            jogadores.append({
                "id": pid,
                "nome": j["nome"],
                "modelo": j["modelo"],
                "corPerfil": j["corPerfil"],
                "mao": mao,
                "gritouUno": bool(uno_flag.get(pid, False)) and len(mao) == 1,
            })
        return {
            "corAtiva": cor_ativa,
            "direcao": direcao,
            "pilhaCompra": pilha_compra,
            "descarteTop": list(descarte[-4:]),
            "deckCount": deck_count,
            "turno": turno,
            "partidaNum": partida_num,
            "bannerSub": "",
            "ativoIdx": None,
            "jogadores": jogadores,
        }

    for ev in data["eventos"]:
        t = ev.get("tipo")
        tr = int(ev.get("turno", 0))
        if t == "inicio_partida":
            cor_ativa = ev["corAtiva"]
            descarte = [ev["primeiraCarta"]["codigo"]]
            for m in ev["maosIniciais"]:
                hands[m["id"]] = list(m["mao"])
                uno_flag[m["id"]] = False
            snaps[0] = _snapshot(0)
        elif t == "jogada":
            pid = ev["playerId"]
            hands[pid] = list(ev["maoRestante"])
            uno_flag[pid] = bool(ev.get("gritouUno", False)) and len(hands[pid]) == 1
            descarte.append(ev["cartaCodigo"])
            cor_ativa = ev["corAtiva"]
            direcao = int(ev["direcao"])
            pilha_compra = int(ev["pilhaCompra"])
            snaps[tr] = _snapshot(tr)
        elif t == "bomba_tomada":
            pid = ev["playerId"]
            deck_count -= int(ev["qtd"])
            hands[pid] = list(ev["maoRestante"])
            uno_flag[pid] = False
            pilha_compra = 0
            snaps[tr] = _snapshot(tr)
        elif t == "compra":
            pid = ev["playerId"]
            deck_count -= int(ev["qtd"])
            hands[pid] = list(ev["maoRestante"])
            uno_flag[pid] = False
            if ev.get("jogouComprada"):
                jc = ev["jogouComprada"]
                descarte.append(jc)
                if "REVERTER" in jc:
                    direcao = -direcao
            cor_ativa = ev["corAtiva"]
            pilha_compra = int(ev["pilhaCompra"])
            snaps[tr] = _snapshot(tr)
        elif t == "reembaralhar":
            deck_count = int(ev["cartasRecicladas"])
            descarte = descarte[-1:]

    _MATCH_CACHE[partida_num] = snaps
    return snaps


def mesa_turno(partida_num: int, turno: int, ativo_idx: int | None = None, banner_sub: str = "") -> dict:
    """Retorna cópia independente do estado real da mesa no turno indicado."""
    base = _build_match_snapshots(partida_num)[turno]
    return {
        "corAtiva": base["corAtiva"],
        "direcao": base["direcao"],
        "pilhaCompra": base["pilhaCompra"],
        "descarteTop": list(base["descarteTop"]),
        "deckCount": base["deckCount"],
        "turno": base["turno"],
        "partidaNum": base["partidaNum"],
        "bannerSub": banner_sub,
        "ativoIdx": ativo_idx,
        "jogadores": [
            {**j, "mao": list(j["mao"])}
            for j in base["jogadores"]
        ],
    }


def _nar(texto: str, pause_before: float = 0.12) -> dict:
    return {
        "speaker": "narrador",
        "nome": "Narrador",
        "corPerfil": "#fde047",
        "modo": "fala",
        "texto": texto,
        "pause_before": pause_before,
    }


def _ia(player_id: str, texto: str, modo: str = "fala", pause_before: float = 0.14) -> dict:
    j = _ELENCO_BY_ID[player_id]
    return {
        "speaker": player_id,
        "nome": j["nome"],
        "corPerfil": j["corPerfil"],
        "modo": modo,
        "texto": texto,
        "pause_before": pause_before,
    }


def _selo_dur(text: str, subtext: str = "") -> float:
    """Regra MEMORIA_TECNICA.md: 0.9s + 0.3s por palavra (entre 1.6s e 3.0s)."""
    n_words = len(f"{text} {subtext}".split())
    return round(min(3.0, max(1.6, 0.9 + 0.3 * n_words)), 1)


def _selo(text: str, subtext: str = "", color: str = "#dc2626", at_sec: float = 1.0,
          dur_sec: float | None = None, x: int = 960, y: int = 245) -> dict:
    d = dur_sec if dur_sec is not None else _selo_dur(text, subtext)
    return {
        "tipo": "selo",
        "text": text,
        "subtext": subtext,
        "color": color,
        "x": x,
        "y": y,
        "at_sec": at_sec,
        "dur_sec": d,
    }


def _meme(meme_id: str, caption: str = "", at_sec: float = 1.0, dur_sec: float = 2.2,
          x: int = 42, y: int = 710, w: int = 330) -> dict:
    """Meme posicionado no canto inferior esquerdo livre (zero colisão com assentos ou balão)."""
    return {
        "tipo": "meme",
        "meme": meme_id,
        "caption": caption,
        "x": x,
        "y": y,
        "w": w,
        "at_sec": at_sec,
        "dur_sec": dur_sec,
    }


def _pair_selo_meme(selo_text: str, selo_sub: str, color: str, meme_id: str, meme_cap: str,
                    at_sec: float, y: int = 245, dur_sec: float | None = None) -> list[dict]:
    """Cria selo + meme sincronizados com exatamente a mesma duração (regra do Felipe)."""
    d = dur_sec if dur_sec is not None else _selo_dur(selo_text, selo_sub)
    return [
        _selo(selo_text, selo_sub, color=color, at_sec=at_sec, dur_sec=d, y=y),
        _meme(meme_id, caption=meme_cap, at_sec=at_sec, dur_sec=d),
    ]


def _est_sec(texto: str) -> float:
    return max(0.85, len(texto.split()) / 2.65)


def _build_elenco_highlights(falas: list[dict], lead_in: float = 0.20) -> list[dict]:
    """Calcula janelas em quadros (30 fps) para acender cada card exatamente na fala daquela IA."""
    order = ["hydrogen", "sonnet", "inkling", "deepseek", "qwen", "luna", "glm"]
    cursor = lead_in
    out = []
    for idx, seg in enumerate(falas):
        if idx > 0:
            cursor += float(seg.get("pause_before", 0.12))
        dur = _est_sec(seg["texto"])
        if 1 <= idx <= len(order):
            out.append({
                "id": order[idx - 1],
                "at": int(round(cursor * FPS)),
                "dur": int(round(dur * FPS)),
            })
        cursor += dur
    return out


_ELENCO_FALAS = [
    _nar("Na mesa hoje:", pause_before=0.08),
    _nar("Gemini Hydrogen, Google, o vingativo.", pause_before=0.12),
    _nar("Claude Sonnet, Anthropic, o falso coitado.", pause_before=0.12),
    _nar("Inkling Mini, puro caos e bomba.", pause_before=0.12),
    _nar("DeepSeek Flash, o cobrador de juros.", pause_before=0.12),
    _nar("Qwen 27B, o diplomata.", pause_before=0.12),
    _nar("GPT-6 Luna, OpenAI, calma até demais.", pause_before=0.12),
    _nar("E GLM Flash. Guarda bem esse nome.", pause_before=0.12),
]

# =============================================================================
# SCENES — 42 CENAS · RITMO ÁGIL · CONTINUIDADE TOTAL (~13.8 min · ~2,100 palavras)
# =============================================================================
SCENES = [
    # -------------------------------------------------------------------------
    # ATO 0 — ABERTURA NO CLÍMAX (~11s) + REGRAS (<=20s) + ELENCO (~16s)
    # -------------------------------------------------------------------------
    {
        "id": "S01_hook",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.15,
        "tail_sec": 0.30,
        "focusIdx": 0,
        "mesa": mesa_turno(2, 67, ativo_idx=0, banner_sub="CLÍMAX FINAL"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "A-REVERTER",
            "faceDown": False,
            "at": 20,
            "dur": 22,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Três UNOs seguidos. A quarta IA compra... e joga o Reverter errado."),
            _ia("hydrogen", "Três UNOs seguidos?! Se Claude Sonnet, Inkling ou DeepSeek não mudarem essa cor agora, acabou o jogo!"),
            _nar("Já volto aqui."),
        ],
        "overlays": _pair_selo_meme(
            "3 UNOs SEGUIDOS!",
            "E UM REVERTER FATAL",
            "#dc2626",
            "homer-panic",
            "DEVOLVEU A VEZ",
            at_sec=1.1,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "sirene-ataque", "at_sec": 0.15, "vol": 0.34},
            {"name": "swoosh-fly", "at_sec": 0.65, "vol": 0.36},
            {"name": "record-scratch", "at_sec": 10.2, "vol": 0.38},
        ],
    },
    {
        "id": "S02_regras",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": None,
        "mesa": mesa_turno(1, 0, ativo_idx=None, banner_sub="AS REGRAS"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "G-5",
            "faceDown": False,
            "at": 80,
            "dur": 26,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar(
                "Eu coloquei sete IAs numa mesa de UNO real, com empilhamento de mais dois e mais quatro, "
                "grito de UNO e memória entre partidas. "
                "Você vê todas as cartas e ouve o pensamento secreto com eco. Elas só ouvem mentira."
            ),
        ],
        "overlays": [
            *_pair_selo_meme(
                "EMPILHAMENTO ATIVO",
                "+2 E +4 ACUMULAM SEM DÓ",
                "#f59e0b",
                "lets-go",
                "VALENDO TUDO",
                at_sec=2.5,
                dur_sec=2.5,
            ),
            _selo("SÓ VOCÊ VÊ AS CARTAS", "ELAS SÓ OUVEM BLEFE", color="#7e22ce", at_sec=10.5, dur_sec=2.4),
        ],
        "sfx": [
            {"name": "pop", "at_sec": 0.18, "vol": 0.32},
            {"name": "swish-triple", "at_sec": 2.5, "vol": 0.30},
            {"name": "notification-pop", "at_sec": 10.5, "vol": 0.32},
        ],
    },
    {
        "id": "S03_elenco",
        "tipo": "elenco",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.20,
        "tail_sec": 0.45,
        "elencoMeta": {
            "title": "AS 7 IAs NA MESA DO UNO",
            "subtitle": "Cada uma com seu modelo real — zero falas inventadas",
        },
        "highlights": _build_elenco_highlights(_ELENCO_FALAS, lead_in=0.20),
        "falas": _ELENCO_FALAS,
        "overlays": [
            _selo("7 IAs · 7 FAMÍLIAS", "MEMÓRIA ATIVA ENTRE PARTIDAS", color="#3b82f6", at_sec=0.3, dur_sec=2.2, y=975),
        ],
        "sfx": [
            {"name": "pop", "at_sec": 1.2, "vol": 0.26},
            {"name": "pop", "at_sec": 3.2, "vol": 0.26},
            {"name": "pop", "at_sec": 5.3, "vol": 0.26},
            {"name": "pop", "at_sec": 7.3, "vol": 0.26},
            {"name": "pop", "at_sec": 9.3, "vol": 0.26},
            {"name": "pop", "at_sec": 11.2, "vol": 0.26},
            {"name": "notification-pop", "at_sec": 13.6, "vol": 0.34},
        ],
    },

    # -------------------------------------------------------------------------
    # ATO 1 — PARTIDA 1: "FESTIVAL DE BLEFE"
    # -------------------------------------------------------------------------
    {
        "id": "S04_cap1",
        "tipo": "capitulo",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "capitulo": {
            "kicker": "PARTIDA 1",
            "title": "FESTIVAL DE BLEFE",
            "subtitle": "63 turnos, 0 piedade e uma IA que trocou as cores",
            "accent": "#3b82f6",
        },
        "falas": [
            _nar("Partida um. Eu abri o microfone antes da primeira carta. Todo mundo mentiu."),
        ],
        "overlays": [],
        "sfx": [
            {"name": "pagina", "at_sec": 0.15, "vol": 0.34},
            {"name": "swoosh-fly", "at_sec": 0.35, "vol": 0.26},
        ],
    },
    {
        "id": "S05_p1_blefes_t00",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(1, 0, ativo_idx=0, banner_sub="MESA ABERTA"),
        "falas": [
            _nar("Gemini com três Reverter, Claude com mais dois e Inkling Mini escondendo dois mais dois e Curinga. Escuta a cara de pau."),
            _ia("hydrogen", "Olha, vim só pra assistir essa partida porque minha mão veio um deserto..."),
            _ia("sonnet", "Que mão horrível a minha, só carta pequena. Podem ficar tranquilos, hoje eu sou figurante."),
            _ia("inkling", "Se alguém acha que eu tenho +4, sinto muito, mas não é o caso."),
            _nar("Guarda o apelido de figurante — e olha essa Inkling."),
        ],
        "overlays": _pair_selo_meme(
            "TRIO DA CARA DE PAU",
            "3 MÃOS CHEIAS DE BOMBA",
            "#3b82f6",
            "side-eye-dog",
            "CONFIA NO FIGURANTE",
            at_sec=5.5,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "ba-dum-tss", "at_sec": 17.5, "vol": 0.32},
        ],
    },
    {
        "id": "S06_p1_bomba_deepseek",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(1, 4, ativo_idx=3, banner_sub="GUERRA ABERTA"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "G-+2",
            "faceDown": False,
            "at": 22,
            "dur": 22,
            "glowColor": "#a855f7",
        },
        "falas": [
            _nar("Turno três: a Inkling já dispara mais dois verde no DeepSeek!"),
            _ia("inkling", "Verde agora, sem drama: vira a mesa e quem quiser empilhar que aceite a responsabilidade."),
            _nar("Ele sobe pra nove cartas — mas pesca um mais quatro no monte."),
            _ia("deepseek", "Bomba pra mim? Beleza, pago agora mas anota aí: essa conta vai voltar com juros."),
        ],
        "overlays": _pair_selo_meme(
            "INKLING ABRE FOGO · +2",
            "DEEPSEEK PESCA UM +4",
            "#a855f7",
            "dicaprio-pointing",
            "ANOTA OS JUROS",
            at_sec=3.2,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "explosion-arcade", "at_sec": 0.9, "vol": 0.32},
            {"name": "coin", "at_sec": 9.8, "vol": 0.30},
        ],
    },
    {
        "id": "S07_p1_luna_daltonica_1",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.45,
        "focusIdx": 5,
        "mesa": mesa_turno(1, 6, ativo_idx=5, banner_sub="A COR DA LUNA"),
        "flyCard": {
            "fromIdx": 5,
            "to": "discard",
            "codigo": "Y-4",
            "faceDown": False,
            "at": 20,
            "dur": 24,
            "glowColor": "#eab308",
        },
        "falas": [
            _nar("Na sequência, chega na GPT-6 Luna: um verde e cinco cartas azuis. Só que azul começa com a letra A. Escuta."),
            _ia("luna", "Jogo Y-4 para mudar para amarelo, minha cor mais forte: fico com quatro amarelas e um verde.", modo="pensamento"),
            _nar("Ela leu A de azul achando que era amarelo! E ninguém desconfia."),
        ],
        "overlays": _pair_selo_meme(
            "A = AZUL, NÃO AMARELO!",
            "DALTONISMO DA LUNA · #1",
            "#10b981",
            "nazare-confusa",
            "A DE AMARELO?!",
            at_sec=6.8,
            dur_sec=2.7,
        ),
        "sfx": [
            {"name": "record-scratch", "at_sec": 6.6, "vol": 0.36},
            {"name": "boing", "at_sec": 12.2, "vol": 0.32},
        ],
    },
    {
        "id": "S08_p1_combo_pular_reverter",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 0,
        "mesa": mesa_turno(1, 12, ativo_idx=0, banner_sub="SENTIDO INVERTIDO"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "A-REVERTER",
            "faceDown": False,
            "at": 42,
            "dur": 24,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Três Pulares seguidos travam a mesa: GLM pula o Gemini, Claude pula a Inkling e GLM cai pra cinco cartas puxando pro azul. O Gemini revida com Reverter."),
            _ia("hydrogen", "Toma esse Reverter de volta e mostra o que você tá escondendo aí com cinco cartas!"),
            _ia("glm", "Gemini, que raiva de você, viu?"),
        ],
        "overlays": _pair_selo_meme(
            "3 PULARES + REVERTER",
            "MESA NO ANTI-HORÁRIO",
            "#3b82f6",
            "avengers-assemble",
            "GUERRA ABERTA",
            at_sec=2.4,
            dur_sec=2.4,
        ),
        "sfx": [
            {"name": "swish-triple", "at_sec": 1.3, "vol": 0.32},
            {"name": "whoosh", "at_sec": 2.0, "vol": 0.34},
        ],
    },
    {
        "id": "S09_p1_sonnet_empilha_4",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 1,
        "mesa": mesa_turno(1, 18, ativo_idx=1, banner_sub="EMPILHOU +4!"),
        "flyCard": {
            "fromIdx": 1,
            "to": "discard",
            "codigo": "V-+2",
            "faceDown": False,
            "at": 36,
            "dur": 24,
            "glowColor": "#ef4444",
        },
        "falas": [
            _nar("No sentido invertido, a Inkling Mini joga o segundo mais dois no figurante!"),
            _ia("inkling", "Claude, é com você a vez depois disso. A bomba é sua, hein."),
            _nar("O figurante empilha mais dois vermelho e empurra quatro cartas pro Gemini!"),
            _ia("sonnet", "Inkling, a bomba voltou com juros. Gemini, esse +4 acumulado é presente meu, de coração."),
            _ia("hydrogen", "Ah, Claude Sonnet, você não presta!"),
            _nar("Gemini sobe pra nove — mas pesca um mais quatro."),
        ],
        "overlays": _pair_selo_meme(
            "EMPILHOU +4!",
            "O FIGURANTE ATACOU",
            "#dc2626",
            "surprised-pikachu",
            "ERA FIGURANTE NÉ",
            at_sec=7.5,
            y=795,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "explosion", "at_sec": 1.4, "vol": 0.36},
            {"name": "crowd-boo", "at_sec": 15.0, "vol": 0.30},
        ],
    },
    {
        "id": "S10_p1_deepseek_vinga_inkling",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 3,
        "mesa": mesa_turno(1, 24, ativo_idx=2, banner_sub="JUROS COBRADOS"),
        "flyCard": {
            "fromIdx": 3,
            "to": "discard",
            "codigo": "+4",
            "faceDown": False,
            "at": 24,
            "dur": 24,
            "glowColor": "#eab308",
        },
        "falas": [
            _nar("Logo depois, DeepSeek encontra a Inkling na mira e cobra os juros com aquele mais quatro!"),
            _ia("deepseek", "Inkling, presente pra você, com carinho."),
            _nar("Ela explode pra nove cartas — e ainda debocha."),
            _ia("inkling", "Bomba é minha, gente. Curinga e PULAR ficaram no bolso pra quando a mesa chorar a conta."),
        ],
        "overlays": _pair_selo_meme(
            "JUROS COBRADOS · +4",
            "INKLING SOBE PRA 9 CARTAS",
            "#06b6d4",
            "thanos-inevitable",
            "A CONTA CHEGOU",
            at_sec=3.6,
            y=795,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "impact-epic", "at_sec": 1.0, "vol": 0.36},
            {"name": "bomba-distante", "at_sec": 7.5, "vol": 0.30},
        ],
    },
    {
        "id": "S11_p1_hydrogen_destroi_glm",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.45,
        "focusIdx": 6,
        "mesa": mesa_turno(1, 26, ativo_idx=0, banner_sub="RANCOR PLANTADO"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "+4",
            "faceDown": False,
            "at": 32,
            "dur": 24,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar("Dois turnos depois, GLM Flash lidera com três cartas. Aí o Gemini saca o mais quatro que pescou."),
            _ia("hydrogen", "Desculpa aí, GLM Flash, mas com três cartas não dá pra te deixar passear! Toma esse +4 de presente e vamos pro Verde!"),
            _ia("glm", "Obrigado, Gemini, adorei o presente... vou embalar e devolver com juros pra alguém dessa mesa."),
        ],
        "overlays": _pair_selo_meme(
            "+4 NO FAVORITO!",
            "GLM SOBE DE 3 PRA 7 CARTAS",
            "#ef4444",
            "hello-darkness",
            "RANCOR PLANTADO",
            at_sec=4.2,
            y=795,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "explosion", "at_sec": 1.2, "vol": 0.36},
            {"name": "sad-trombone", "at_sec": 11.4, "vol": 0.30},
        ],
    },
    {
        "id": "S12_p1_inkling_vira_verde",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(1, 37, ativo_idx=2, banner_sub="CURINGA NO VERDE"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "CURINGA",
            "faceDown": False,
            "at": 32,
            "dur": 24,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar("Qwen e DeepSeek disparam no amarelo. No turno trinta e sete, a Inkling Mini puxa o Curinga do bolso e vira pro verde!"),
            _ia("inkling", "Verde agora, Qwen e DeepSeek: desmoronem ou peguem bomba."),
            _nar("Só que isso armou a próxima bomba do Gemini."),
        ],
        "overlays": [
            _selo("CURINGA DA INKLING!", "VIROU PRO VERDE NO T37", color="#a855f7", at_sec=3.6, dur_sec=2.5),
        ],
        "sfx": [
            {"name": "swoosh-fly", "at_sec": 1.1, "vol": 0.32},
            {"name": "notification-pop", "at_sec": 3.6, "vol": 0.32},
        ],
    },
    {
        "id": "S13_p1_glm_afunda_pingpong",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 0,
        "mesa": mesa_turno(1, 45, ativo_idx=0, banner_sub="GLM EM 9 CARTAS"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "G-REVERTER",
            "faceDown": False,
            "at": 48,
            "dur": 24,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar("No verde da Inkling, Gemini acerta mais dois de novo no GLM Flash, que afunda pra nove cartas — e trava num ping-pong de Reverter com o Claude."),
            _ia("glm", "Gemini, levei sua bomba de jeito, mas anota aí: vermelho tava me servindo tão bem que guardo uma cópia pra ti."),
            _ia("sonnet", "Gemini, esse reverter foi educado demais."),
        ],
        "overlays": _pair_selo_meme(
            "GLM NA LANTERNA · 9",
            "DOIS ATAQUES DO GEMINI",
            "#ef4444",
            "spongebob-waiting",
            "E O TURNO NÃO ANDA",
            at_sec=4.2,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "boing", "at_sec": 1.8, "vol": 0.30},
            {"name": "swoosh-fly", "at_sec": 10.6, "vol": 0.28},
        ],
    },
    {
        "id": "S14_p1_luna_daltonica_2",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 5,
        "mesa": mesa_turno(1, 48, ativo_idx=5, banner_sub="DALTONISMO #2"),
        "falas": [
            _nar("O ping-pong volta pro sete amarelo no turno quarenta e oito. Mão da Luna: sete azul, nove azul, sete azul. Escuta a conta."),
            _ia("luna", "Tenho duas cópias de A-7 e A-9, então consigo zerar a mão em duas jogadas se mantiverem o amarelo.", modo="pensamento"),
            _nar("E no turno seguinte ela tenta jogar o nove azul no sete amarelo."),
        ],
        "overlays": _pair_selo_meme(
            "DALTONISMO DA LUNA · #2",
            "A-7 E A-9 NÃO SÃO AMARELAS!",
            "#eab308",
            "math-lady",
            "CONTAS DA LUNA",
            at_sec=5.2,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "glitch", "at_sec": 5.0, "vol": 0.32},
            {"name": "fail-piano", "at_sec": 11.2, "vol": 0.30},
        ],
    },
    {
        "id": "S15_p1_jogada_invalida_t49",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": None,
        "mesa": mesa_turno(1, 49, ativo_idx=5, banner_sub="JOGOU AZUL!"),
        "flyCard": {
            "fromIdx": 5,
            "to": "discard",
            "codigo": "A-7",
            "faceDown": False,
            "at": 24,
            "dur": 24,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("O motor bloqueia o nove e força o sete azul. A mesa vira azul na frente de todos. Olha a Luna."),
            _ia("luna", "Amarelo continua; Qwen, segura essa mudança de número. Ainda não é hora de cantar vitória."),
            _nar("Um sete azul brilhando, e ela anunciando amarelo!"),
        ],
        "overlays": _pair_selo_meme(
            "JOGOU AZUL · FALOU AMARELO",
            "TENTOU A-9 INVÁLIDO",
            "#dc2626",
            "faustao-errou",
            "ERROU A COR DE NOVO",
            at_sec=4.2,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "wrong-buzzer", "at_sec": 0.8, "vol": 0.34},
            {"name": "crowd-laugh", "at_sec": 8.6, "vol": 0.32},
        ],
    },
    {
        "id": "S16_p1_curinga_do_hydrogen",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 0,
        "mesa": mesa_turno(1, 54, ativo_idx=0, banner_sub="CURINGA PRO AZUL"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "CURINGA",
            "faceDown": False,
            "at": 34,
            "dur": 24,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Qwen e DeepSeek mudam pro vermelho empatados com a Luna em duas cartas. Gemini queima o Curinga pro azul achando que travou todo mundo."),
            _ia("hydrogen", "Vou queimar meu Curinga pra puxar pro Azul, que não aparece faz tempo, pra travar esses três!", modo="pensamento"),
            _nar("Entregou a cor exata da Luna! E nem ela viu."),
            _ia("luna", "Não tenho carta azul nem curinga; vou comprar e guardar os dois amarelos para quando a cor virar.", modo="pensamento"),
        ],
        "overlays": _pair_selo_meme(
            "DUAS AZUIS NA MÃO",
            "E ELA ACHOU QUE IA COMPRAR!",
            "#7e22ce",
            "picard-facepalm",
            "NÃO É POSSÍVEL",
            at_sec=11.0,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "gasp", "at_sec": 10.8, "vol": 0.34},
            {"name": "slide-whistle-fall", "at_sec": 15.8, "vol": 0.30},
        ],
    },
    {
        "id": "S17_p1_uno_daltonico",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 5,
        "mesa": mesa_turno(1, 56, ativo_idx=5, banner_sub="LUNA GRITA UNO!"),
        "flyCard": {
            "fromIdx": 5,
            "to": "discard",
            "codigo": "A-7",
            "faceDown": False,
            "at": 22,
            "dur": 22,
            "glowColor": "#10b981",
        },
        "falas": [
            _nar("Dois turnos depois, a Luna baixa o sete azul, grita UNO e teima no amarelo!"),
            _ia("luna", "Amarelo, Qwen. Agora tenta adivinhar meu último número."),
        ],
        "overlays": _pair_selo_meme(
            "GRITOU UNO NO AZUL",
            "CHAMANDO DE AMARELO",
            "#10b981",
            "confused-travolta",
            "QUE COR É ESSA?!",
            at_sec=3.6,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "sirene-ataque", "at_sec": 0.7, "vol": 0.32},
            {"name": "error-beep", "at_sec": 3.5, "vol": 0.30},
        ],
    },
    {
        "id": "S18_p1_panico_mesa_t60",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(1, 60, ativo_idx=None, banner_sub="PÂNICO NO T60"),
        "falas": [
            _nar("Qwen e DeepSeek compram sem azul. Na mesa aberta do turno sessenta, a Inkling bota pressão — enquanto a Luna reza por amarelo segurando um nove azul!"),
            _ia("inkling", "Luna, uma carta é tudo de bom, mas azul não perdoa quem comemora."),
            _ia("luna", "Minha última carta é Amarelo 9, então preciso que alguém leve a cor para amarelo antes da minha vez.", modo="pensamento"),
        ],
        "overlays": [
            _selo("MESA EM PÂNICO · T60", "LUNA REZA POR AMARELO", color="#dc2626", at_sec=4.8, dur_sec=2.5),
        ],
        "sfx": [
            {"name": "heartbeat", "at_sec": 0.4, "vol": 0.32},
            {"name": "emergencia", "at_sec": 4.8, "vol": 0.28},
        ],
    },
    {
        "id": "S19_p1_vitoria_luna",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.50,
        "focusIdx": None,
        "mesa": mesa_turno(1, 63, ativo_idx=5, banner_sub="LUNA VENCE P1!"),
        "flyCard": {
            "fromIdx": 5,
            "to": "discard",
            "codigo": "A-9",
            "faceDown": False,
            "at": 40,
            "dur": 26,
            "glowColor": "#10b981",
        },
        "falas": [
            _nar("Gemini compra. GLM compra e morre na lanterna com nove cartas. A vez volta no azul e a Luna enfim lê a cor certa."),
            _ia("luna", "Nove azul. A conta fechou; podem guardar a munição."),
            _nar("GPT-6 Luna vence daltônica! GLM fica em último. Agora eu ligo a memória. E a Partida dois vira guerra."),
        ],
        "overlays": _pair_selo_meme(
            "CAMPEÃ PARTIDA 1 · LUNA",
            "0 CARTAS · GLM EM ÚLTIMO COM 9",
            "#10b981",
            "we-did-it",
            "GANHOU DALTÔNICA",
            at_sec=4.8,
            dur_sec=2.8,
        ),
        "sfx": [
            {"name": "tada", "at_sec": 4.6, "vol": 0.36},
            {"name": "crowd-applause", "at_sec": 6.6, "vol": 0.30},
        ],
    },

    # -------------------------------------------------------------------------
    # ATO 2 — PARTIDA 2: "MEMÓRIA ATIVA, O PACTO QUEBRADO E A BOMBA +6"
    # -------------------------------------------------------------------------
    {
        "id": "S20_cap2",
        "tipo": "capitulo",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "capitulo": {
            "kicker": "PARTIDA 2",
            "title": "O PACTO DO +4",
            "subtitle": "Memória ligada — agora todas lembram quem explodiu quem",
            "accent": "#ef4444",
        },
        "falas": [
            _nar("Partida dois. Eu contei pra cada IA quem ganhou e quem jogou bomba nela."),
        ],
        "overlays": [],
        "sfx": [
            {"name": "impact-epic", "at_sec": 0.15, "vol": 0.34},
            {"name": "pagina", "at_sec": 0.35, "vol": 0.28},
        ],
    },
    {
        "id": "S21_p2_rancores_pacto",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 1,
        "mesa": mesa_turno(2, 0, ativo_idx=1, banner_sub="MEMÓRIA ATIVA"),
        "falas": [
            _nar("Turno zero: GLM cobra o Gemini, Qwen propõe paz, Claude esconde um mais quatro jurando inocência e a Inkling assume a fama."),
            _ia("glm", "Gemini, abre a Partida 2 já me devendo? Anota aí: hoje a conta é minha."),
            _ia("qwen", "Quem quiser, a gente faz pacto de não usar +4 até o meio do jogo, combinado?"),
            _ia("sonnet", "Eu estou com mão fraca, sem +4 nenhum, juro."),
            _ia("inkling", "Bom jogo de mesa, começo fingindo mão ruim e só fecho a aposta quando tiver +2 na conta. Alguém confia em mim ainda?"),
        ],
        "overlays": _pair_selo_meme(
            "SEM +4 NENHUM, JURO",
            "TEM UM +4 NA MÃO AGORA",
            "#f59e0b",
            "monkey-puppet-awkward",
            "CARA DE PAU",
            at_sec=11.5,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "revela_impostor", "at_sec": 11.3, "vol": 0.34},
            {"name": "pop", "at_sec": 14.5, "vol": 0.28},
        ],
    },
    {
        "id": "S22_p2_dejavu_deepseek",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 3, ativo_idx=3, banner_sub="DÉJÀ VU +2"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "V-+2",
            "faceDown": False,
            "at": 22,
            "dur": 22,
            "glowColor": "#a855f7",
        },
        "falas": [
            _nar("Dois turnos depois, déjà vu absurdo: Inkling mete mais dois no DeepSeek de novo!"),
            _ia("inkling", "DeepSeek, viu essa +2? A conta da última partida voltou, e eu ainda nem acendi o curinga."),
            _nar("Ele vai pra nove cartas e pesca outro mais quatro!"),
            _ia("deepseek", "Inkling, essa +2 vai voltar com juros. Engraçado que sempre sobra pra mim, né?"),
        ],
        "overlays": _pair_selo_meme(
            "DÉJÀ VU · +2 NO T02",
            "DEEPSEEK PESCA +4 DE NOVO",
            "#06b6d4",
            "sad-violin",
            "SEMPRE NO DEEPSEEK",
            at_sec=3.6,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "explosion-arcade", "at_sec": 0.9, "vol": 0.32},
            {"name": "wah-wah-trombone", "at_sec": 11.0, "vol": 0.28},
        ],
    },
    {
        "id": "S23_p2_pacto_e_curinga_inkling",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 9, ativo_idx=2, banner_sub="CURINGA SEM VERGONHA"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "CURINGA",
            "faceDown": False,
            "at": 36,
            "dur": 22,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar("No turno oito, Claude renova a mentira do pacto. Na jogada seguinte, a Inkling acende o Curinga pro verde!"),
            _ia("sonnet", "Vermelho, três. Qwen, o pacto do +4 está vivo, pode confiar em mim."),
            _ia("inkling", "DeepSeek, troquei pra Verde e te deixei mirando a própria bomba. Curinga não tem vergonha."),
        ],
        "overlays": _pair_selo_meme(
            "PODE CONFIAR EM MIM",
            "E A INKLING VIROU PRO VERDE",
            "#f59e0b",
            "roll-safe",
            "SEM VERGONHA",
            at_sec=4.5,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "shhh", "at_sec": 4.3, "vol": 0.30},
            {"name": "swoosh-fly", "at_sec": 8.8, "vol": 0.30},
        ],
    },
    {
        "id": "S24_p2_mesa_aberta_t12",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 1,
        "mesa": mesa_turno(2, 12, ativo_idx=None, banner_sub="ARMADILHA NO VERDE"),
        "falas": [
            _nar("No turno doze, Claude diz que ama verde. A Inkling cutuca o pacto e o DeepSeek lê o futuro."),
            _ia("inkling", "Qwen e Claude, pacto de +4 pode esperar, eu não vi vocês segurando o mesmo medo."),
            _ia("deepseek", "Qwen, esse pacto do +4 tá cheirando a papel molhado."),
        ],
        "overlays": [
            _selo("PAPEL MOLHADO · T12", "GEMINI OUVIU TUDO", color="#22c55e", at_sec=4.2, dur_sec=2.4),
        ],
        "sfx": [
            {"name": "tic-tac", "at_sec": 4.0, "vol": 0.28},
            {"name": "notification-pop", "at_sec": 9.8, "vol": 0.30},
        ],
    },
    {
        "id": "S25_p2_vinganca_hydrogen",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 0,
        "mesa": mesa_turno(2, 13, ativo_idx=0, banner_sub="VINGANÇA +2"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "G-+2",
            "faceDown": False,
            "at": 24,
            "dur": 22,
            "glowColor": "#22c55e",
        },
        "falas": [
            _nar("Gemini Hydrogen ouviu o Claude chamar verde de cor favorita e puxou o gatilho."),
            _ia("hydrogen", "Se Verde é sua cor favorita, Claude Sonnet, então toma esse +2 de presente! Vamos ver se o seu pacto com o Qwen te salva dessa."),
        ],
        "overlays": _pair_selo_meme(
            "TROCO DA PARTIDA 1",
            "G-+2 NO COLO DO SONNET",
            "#22c55e",
            "big-brain-patrick",
            "TESTANDO O PACTO",
            at_sec=3.8,
            y=795,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "riser", "at_sec": 0.8, "vol": 0.32},
            {"name": "swoosh-fly", "at_sec": 1.1, "vol": 0.32},
        ],
    },
    {
        "id": "S26_p2_bomba_6_sonnet",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.45,
        "focusIdx": 1,
        "mesa": mesa_turno(2, 14, ativo_idx=1, banner_sub="BOMBA +6!!"),
        "flyCard": {
            "fromIdx": 1,
            "to": "discard",
            "codigo": "+4",
            "faceDown": False,
            "at": 32,
            "dur": 26,
            "glowColor": "#dc2626",
        },
        "falas": [
            _nar("Claude podia comprar duas. Em vez disso, sacou o mais quatro secreto e montou uma bomba de mais seis na Inkling!"),
            _ia("sonnet", "Pacto quebrado, mas faz parte.", modo="pensamento"),
            _ia("sonnet", "Qwen, o pacto era até o meio do jogo e eu acabei de ter pressa. Inkling, seis cartas, de nada."),
            _nar("Eu acabei de ter pressa! O pacto durou catorze turnos."),
        ],
        "overlays": _pair_selo_meme(
            "BOMBA +6 · PACTO MORREU",
            "EU ACABEI DE TER PRESSA",
            "#dc2626",
            "gordon-ramsay-angry",
            "TRAIÇÃO AO VIVO",
            at_sec=4.6,
            y=795,
            dur_sec=2.8,
        ),
        "sfx": [
            {"name": "impact-epic", "at_sec": 1.0, "vol": 0.38},
            {"name": "explosion", "at_sec": 4.5, "vol": 0.38},
        ],
    },
    {
        "id": "S27_p2_inkling_11_cartas",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 15, ativo_idx=2, banner_sub="11 CARTAS!!"),
        "flyCard": {
            "fromIdx": "deck",
            "to": 2,
            "codigo": "A-PULAR",
            "faceDown": True,
            "at": 20,
            "dur": 24,
            "glowColor": "#a855f7",
        },
        "falas": [
            _nar("Sem escudo, a Inkling Mini engole seis cartas e bate onze na mão — recorde absoluto de sofrimento."),
            _ia("inkling", "Pacto de +4 caiu por terra, Claude. Compra +6 com raiva e espero que DeepSeek pague a conta."),
        ],
        "overlays": _pair_selo_meme(
            "11 CARTAS NA MÃO",
            "RECORDE DE SOFRIMENTO",
            "#a855f7",
            "coffin-dance",
            "DESCANSE EM PAZ",
            at_sec=2.8,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "system-breakdown", "at_sec": 0.6, "vol": 0.36},
            {"name": "derrota", "at_sec": 2.8, "vol": 0.30},
        ],
    },
    {
        "id": "S28_p2_alucinacao_inkling",
        "tipo": "mesa",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 20, ativo_idx=2, banner_sub="V-4 NÃO É +4!"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "V-4",
            "faceDown": False,
            "at": 22,
            "dur": 22,
            "glowColor": "#ef4444",
        },
        "falas": [
            _nar("A bomba fritou a cabeça da Inkling! Cinco turnos depois, ela baixa um quatro vermelho comum achando que é um mais quatro!"),
            _ia("inkling", "Tenho 11 cartas e um +4 guardado. DeepSeek está com 7 e é o próximo — jogar +4 nele é justo.", modo="pensamento"),
            _ia("inkling", "DeepSeek, esse +4 é pra você. Boa sorte com o amarelo."),
            _nar("Era um quatro vermelho normal!"),
        ],
        "overlays": _pair_selo_meme(
            "JOGOU V-4 · ACHOU +4",
            "TRAUMA DA BOMBA +6",
            "#a855f7",
            "galaxy-brain",
            "MESTRE DO BLEFE",
            at_sec=4.6,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "boing", "at_sec": 0.8, "vol": 0.32},
            {"name": "crowd-laugh", "at_sec": 12.2, "vol": 0.32},
        ],
    },
    {
        "id": "S29_p2_deepseek_trai_qwen",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 4,
        "mesa": mesa_turno(2, 21, ativo_idx=3, banner_sub="TRAIÇÃO NO QWEN"),
        "flyCard": {
            "fromIdx": 3,
            "to": "discard",
            "codigo": "+4",
            "faceDown": False,
            "at": 26,
            "dur": 24,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Logo depois, DeepSeek mostrou um mais quatro de verdade — na cara do Qwen, dono do pacto."),
            _ia("deepseek", "Qwen, o pacto caiu mesmo, mas esse +4 é azul e é seu. Vamos ver se você tem outro escondido."),
            _ia("qwen", "DeepSeek, esse +4 azul eu vou cobrar com juros."),
            _nar("De quatro pra oito cartas num segundo."),
        ],
        "overlays": _pair_selo_meme(
            "PACTO DA PAZ: +4 NA CARA",
            "QWEN SOBE DE 4 PRA 8",
            "#ec4899",
            "not-stonks",
            "DIPLOMACIA ZERO",
            at_sec=3.6,
            y=795,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "explosion-arcade", "at_sec": 0.9, "vol": 0.34},
            {"name": "crowd-boo", "at_sec": 10.6, "vol": 0.30},
        ],
    },
    {
        "id": "S30_p2_emboscada_glm",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 6,
        "mesa": mesa_turno(2, 36, ativo_idx=6, banner_sub="MÃO 100% AZUL"),
        "falas": [
            _nar("O jogo trava no verde até o turno trinta e seis. Enquanto isso, o GLM limpou as sobras e ficou escondido com quatro cartas — todas azuis!"),
            _ia("glm", "Minha mão é toda azul e a mesa está travada no verde — vou ter que torcer por alguém puxar pra azul ou usar um +2 pra forçar cor.", modo="pensamento"),
            _ia("glm", "Gemini, aquele +4 da partida passada ainda está na minha conta."),
        ],
        "overlays": _pair_selo_meme(
            "MÃO 100% AZUL · GLM",
            "ESPERANDO A VINGANÇA",
            "#ef4444",
            "mr-bean-waiting",
            "ESPERANDO O AZUL",
            at_sec=4.8,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "bass-pulse", "at_sec": 0.8, "vol": 0.30},
            {"name": "notification-pop", "at_sec": 13.5, "vol": 0.32},
        ],
    },
    {
        "id": "S31_p2_qwen_salva_mesa",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 4,
        "mesa": mesa_turno(2, 43, ativo_idx=4, banner_sub="BLOQUEIO CLUTCH"),
        "flyCard": {
            "fromIdx": 4,
            "to": "discard",
            "codigo": "Y-1",
            "faceDown": False,
            "at": 48,
            "dur": 22,
            "glowColor": "#eab308",
        },
        "falas": [
            _nar("Luna cai pra duas cartas, GLM puxa pro azul e a mesa pressiona o Qwen a impedir o bi."),
            _ia("inkling", "Qwen, Luna com duas cartas não vira almoço de graça."),
            _nar("Ele lê perfeito e vira pro amarelo!"),
            _ia("qwen", "Y-1 muda pra amarelo e Luna com 2 cartas provavelmente não tem amarelo. Bloqueio ela agora antes que ela bata.", modo="pensamento"),
            _ia("luna", "Sem jogada, compro. GLM, não comemora ainda: duas cartas também podem virar uma surpresa."),
        ],
        "overlays": _pair_selo_meme(
            "BLOQUEIO CIRÚRGICO",
            "LUNA E GLM COMPRANDO",
            "#ec4899",
            "success-kid",
            "SALVOU A MESA",
            at_sec=7.8,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "correct-ding", "at_sec": 7.6, "vol": 0.32},
            {"name": "swoosh-fly", "at_sec": 8.0, "vol": 0.28},
        ],
    },
    {
        "id": "S32_p2_sonnet_chorando",
        "tipo": "mesa",
        "music": "investigations",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 1,
        "mesa": mesa_turno(2, 48, ativo_idx=1, banner_sub="BLEFE BARATO"),
        "falas": [
            _nar("No amarelo, Claude Sonnet cai pra duas cartas... e tenta meter esse migué."),
            _ia("sonnet", "Amarelo de novo, que beleza. Minha mão está um caos, tenho cartas demais e nenhuma boa."),
            _ia("hydrogen", "Cartas demais, Claude Sonnet?! Você tá com duas cartas na mão!"),
            _nar("Ninguém caiu. GLM e Gemini viram pro vermelho e o Claude trava."),
        ],
        "overlays": _pair_selo_meme(
            "CARTAS DEMAIS = 2",
            "BLEFE MENOS SUTIL DO UNO",
            "#f59e0b",
            "this-is-fine",
            "MÃO NUM CAOS",
            at_sec=4.5,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "ba-dum-tss", "at_sec": 7.6, "vol": 0.32},
            {"name": "wrong-buzzer", "at_sec": 11.4, "vol": 0.28},
        ],
    },
    {
        "id": "S33_p2_fregues_deepseek",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 55, ativo_idx=2, banner_sub="3x +2 NO DEEPSEEK"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "V-+2",
            "faceDown": False,
            "at": 24,
            "dur": 22,
            "glowColor": "#ef4444",
        },
        "falas": [
            _nar("Esse vermelho abre espaço pra Inkling Mini acertar o terceiro mais dois no DeepSeek!"),
            _ia("inkling", "Toma, DeepSeek. Mais um +2 pra debaixo do seu nariz — se eu soubesse que ia render isso, teria comprado antes."),
            _ia("deepseek", "Bomba em cima de mim e sem escudo? Beleza, Inkling, compro as duas e volto com juros."),
        ],
        "overlays": _pair_selo_meme(
            "FREGUÊS OFICIAL · 3x +2",
            "INKLING CONTRA DEEPSEEK",
            "#a855f7",
            "crying-jordan",
            "DE NOVO NÃO",
            at_sec=3.8,
            y=795,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "explosion-arcade", "at_sec": 0.9, "vol": 0.32},
            {"name": "sad-party-horn", "at_sec": 11.8, "vol": 0.30},
        ],
    },
    {
        "id": "S34_p2_virada_pro_azul",
        "tipo": "mesa",
        "music": "hitman",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": 2,
        "mesa": mesa_turno(2, 62, ativo_idx=2, banner_sub="AZUL DE VOLTA"),
        "flyCard": {
            "fromIdx": 2,
            "to": "discard",
            "codigo": "A-0",
            "faceDown": False,
            "at": 42,
            "dur": 22,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Qwen e Luna caem pra duas cartas, GLM vira pro azul com duas também e a Inkling joga seu último azul cutucando o DeepSeek."),
            _ia("inkling", "A-0 sai, DeepSeek, agora me mostra azul que você não pode mentir pra mim."),
            _nar("Ele baixa um azul. E começa o final mais insano do canal."),
        ],
        "overlays": _pair_selo_meme(
            "MESA ABERTA NO AZUL",
            "3 RIVAIS COM 2 CARTAS",
            "#3b82f6",
            "one-eternity-later",
            "AGORA VAI EXPLODIR",
            at_sec=4.5,
            dur_sec=2.5,
        ),
        "sfx": [
            {"name": "swoosh-fly", "at_sec": 1.4, "vol": 0.30},
            {"name": "riser", "at_sec": 9.8, "vol": 0.32},
        ],
    },

    # -------------------------------------------------------------------------
    # ATO 3 — O CLÍMAX: "TRÊS UNOs SEGUIDOS E O REVERTER FATAL"
    # -------------------------------------------------------------------------
    {
        "id": "S35_cap3",
        "tipo": "capitulo",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "capitulo": {
            "kicker": "RETA FINAL",
            "title": "TRÊS UNOs SEGUIDOS",
            "subtitle": "Turnos 63 a 68 — o desfecho mais cruel da história",
            "accent": "#eab308",
        },
        "falas": [
            _nar("Turno sessenta e três. Três rivais colados com duas cartas. E o azul escancarado."),
        ],
        "overlays": [],
        "sfx": [
            {"name": "drumroll", "at_sec": 0.15, "vol": 0.34},
            {"name": "riser", "at_sec": 1.6, "vol": 0.32},
        ],
    },
    {
        "id": "S36_p2_t63_tensao",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.40,
        "focusIdx": None,
        "mesa": mesa_turno(2, 63, ativo_idx=None, banner_sub="AZUL ABERTO!"),
        "falas": [
            _nar("Qwen, Luna e GLM armados no azul — e ninguém mais tem azul na mão!"),
            _ia("hydrogen", "Qwen, Luna e GLM com duas cartas colados um no outro?! Se ninguém mudar esse Azul agora, a partida acaba antes de voltar pra cá!"),
            _ia("inkling", "Qwen, pensa duas vezes antes de arriscar; eu não preciso de segredo, só de azul que não existe aqui."),
            _ia("glm", "Qwen, respira fundo, que o +2 tá aqui esperando seu nome."),
        ],
        "overlays": _pair_selo_meme(
            "3 RIVAIS · 2 CARTAS CADA",
            "TODOS ARMADOS NO AZUL",
            "#eab308",
            "sweating",
            "NINGUÉM TEM AZUL",
            at_sec=4.2,
            dur_sec=2.6,
        ),
        "sfx": [
            {"name": "heartbeat", "at_sec": 0.4, "vol": 0.34},
            {"name": "emergencia", "at_sec": 4.2, "vol": 0.28},
        ],
    },
    {
        "id": "S37_p2_uno_1_qwen",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.15,
        "tail_sec": 0.35,
        "focusIdx": 4,
        "mesa": mesa_turno(2, 64, ativo_idx=4, banner_sub="UNO #1 · QWEN"),
        "flyCard": {
            "fromIdx": 4,
            "to": "discard",
            "codigo": "A-4",
            "faceDown": False,
            "at": 18,
            "dur": 20,
            "glowColor": "#ec4899",
        },
        "falas": [
            _nar("Turno sessenta e quatro. Qwen baixa quatro azul e puxa a fila."),
            _ia("qwen", "A-4 na mesa, Luna. Agora é a sua vez de se despedir do azul ou comprar e chorar. Gritando UNO, já adianto."),
        ],
        "overlays": [
            _selo("UNO #1 · QWEN 27B", "RESTA APENAS A-5", color="#ec4899", at_sec=1.2, dur_sec=2.3),
        ],
        "sfx": [
            {"name": "sirene-ataque", "at_sec": 0.4, "vol": 0.30},
            {"name": "swoosh-fly", "at_sec": 0.6, "vol": 0.32},
        ],
    },
    {
        "id": "S38_p2_uno_2_luna",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.15,
        "tail_sec": 0.35,
        "focusIdx": 5,
        "mesa": mesa_turno(2, 65, ativo_idx=5, banner_sub="UNO #2 · LUNA"),
        "flyCard": {
            "fromIdx": 5,
            "to": "discard",
            "codigo": "A-3",
            "faceDown": False,
            "at": 18,
            "dur": 20,
            "glowColor": "#10b981",
        },
        "falas": [
            _nar("Na sequência, a campeã baixa três azul e crava o segundo UNO!"),
            _ia("luna", "UNO. GLM, se tiver verde, hoje é seu grande momento — não desperdiça."),
        ],
        "overlays": [
            _selo("UNO #2 · GPT-6 LUNA", "RESTA APENAS G-8", color="#10b981", at_sec=1.2, dur_sec=2.3),
        ],
        "sfx": [
            {"name": "sirene-ataque", "at_sec": 0.4, "vol": 0.32},
            {"name": "pop", "at_sec": 1.2, "vol": 0.32},
        ],
    },
    {
        "id": "S39_p2_uno_3_glm",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.15,
        "tail_sec": 0.40,
        "focusIdx": 6,
        "mesa": mesa_turno(2, 66, ativo_idx=6, banner_sub="TRIPLO UNO!!"),
        "flyCard": {
            "fromIdx": 6,
            "to": "discard",
            "codigo": "A-5",
            "faceDown": False,
            "at": 20,
            "dur": 22,
            "glowColor": "#ef4444",
        },
        "falas": [
            _nar("GLM baixa cinco azul, guarda o mais dois azul e fecha o triplo UNO!"),
            _ia("glm", "UNO! A-5 na mesa. Qwen e Luna, a conta de vocês ainda vem, mas primeiro sobrevivo eu."),
            _nar("A vez cai no Gemini, sem nenhum azul."),
        ],
        "overlays": _pair_selo_meme(
            "TRIPLO UNO NA MESA!",
            "QWEN · LUNA · GLM COM 1 CARTA",
            "#dc2626",
            "skeleton-waiting",
            "HAJA CORAÇÃO",
            at_sec=1.8,
            dur_sec=2.8,
        ),
        "sfx": [
            {"name": "sirene-ataque", "at_sec": 0.4, "vol": 0.36},
            {"name": "impact-epic", "at_sec": 1.8, "vol": 0.36},
        ],
    },
    {
        "id": "S40_p2_reverter_fatal",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.45,
        "focusIdx": 0,
        "mesa": mesa_turno(2, 67, ativo_idx=0, banner_sub="REVERTER FATAL"),
        "flyCard": {
            "fromIdx": 0,
            "to": "discard",
            "codigo": "A-REVERTER",
            "faceDown": False,
            "at": 28,
            "dur": 26,
            "glowColor": "#3b82f6",
        },
        "falas": [
            _nar("Voltamos pra abertura. Gemini compra e tira um Reverter azul — baixado na hora."),
            _ia("hydrogen", "TRÊS gritos de UNO seguidos na minha frente (Qwen, Luna e GLM) e eu continuo travado sem nada Azul!", modo="pensamento"),
            _ia("hydrogen", "Três UNOs seguidos?! Se Claude Sonnet, Inkling ou DeepSeek não mudarem essa cor agora, acabou o jogo!"),
            _nar("Só que o Reverter devolveu a vez pro GLM Flash — com mais dois azul na mão!"),
        ],
        "overlays": _pair_selo_meme(
            "REVERTER FATAL!",
            "DEVOLVEU PRO GLM FLASH",
            "#dc2626",
            "homer-bushes",
            "SUMINDO NO ARBUSTO",
            at_sec=9.6,
            dur_sec=2.7,
        ),
        "sfx": [
            {"name": "record-scratch", "at_sec": 9.4, "vol": 0.38},
            {"name": "gasp", "at_sec": 9.8, "vol": 0.34},
            {"name": "error-beep", "at_sec": 12.4, "vol": 0.32},
        ],
    },
    {
        "id": "S41_p2_vitoria_glm",
        "tipo": "mesa",
        "music": "run-amok",
        "lead_in_sec": 0.18,
        "tail_sec": 0.55,
        "focusIdx": 6,
        "mesa": mesa_turno(2, 68, ativo_idx=6, banner_sub="GLM CAMPEÃO!!"),
        "flyCard": {
            "fromIdx": 6,
            "to": "discard",
            "codigo": "A-+2",
            "faceDown": False,
            "at": 26,
            "dur": 26,
            "glowColor": "#ef4444",
        },
        "falas": [
            _nar("O lanterna da primeira partida sorriu pra Luna e bateu a porta com um mais dois azul!"),
            _ia("glm", "Luna, chegou a conta: +2 na sua cara! Reza pra não ter outro +2 na mão, porque senão esse jogo é meu!"),
            _nar("GLM Flash zera no turno sessenta e oito! De último a campeão. E o Gemini entregou os dois títulos de bandeja."),
        ],
        "overlays": _pair_selo_meme(
            "CAMPEÃO PARTIDA 2 · GLM!",
            "BATEU COM A-+2 · DE ÚLTIMO A 1º",
            "#ef4444",
            "sad-pablo",
            "LUNA E QWEN EM UNO",
            at_sec=4.5,
            y=795,
            dur_sec=2.9,
        ),
        "sfx": [
            {"name": "explosion", "at_sec": 0.9, "vol": 0.36},
            {"name": "tada", "at_sec": 4.4, "vol": 0.38},
            {"name": "crowd-cheer", "at_sec": 6.0, "vol": 0.32},
        ],
    },

    # -------------------------------------------------------------------------
    # ATO 4 — FECHAMENTO EM 3 PASSOS (PLACAR + PRÊMIOS + LIÇÃO + PERGUNTA)
    # -------------------------------------------------------------------------
    {
        "id": "S42_podio_encerramento",
        "tipo": "podio",
        "music": "monkeys-spinning-monkeys",
        "lead_in_sec": 0.20,
        "tail_sec": 0.70,
        "podio": {
            "ranking": [
                {
                    "nome": "GPT-6 Luna",
                    "corPerfil": "#10b981",
                    "detalhe": "P1: 1º (0) · P2: 2º (1 · UNO!) · 0 bombas",
                    "placar": "1 VIT · 1 CTA",
                },
                {
                    "nome": "GLM Flash",
                    "corPerfil": "#ef4444",
                    "detalhe": "P1: 7º (9) · P2: 1º (0 · bateu com A-+2)",
                    "placar": "1 VIT · 9 CTS",
                },
                {
                    "nome": "Qwen 27B",
                    "corPerfil": "#ec4899",
                    "detalhe": "P1: 3 cartas · P2: 1 carta (UNO!)",
                    "placar": "0 VIT · 4 CTS",
                },
                {
                    "nome": "Inkling Mini",
                    "corPerfil": "#a855f7",
                    "detalhe": "4x +2 jogados · Recorde de 11 cartas · V-4 = +4",
                    "placar": "0 VIT · 7 CTS",
                },
                {
                    "nome": "DeepSeek",
                    "corPerfil": "#06b6d4",
                    "detalhe": "2x +4 jogados · Levou 3x +2 da Inkling",
                    "placar": "0 VIT · 8 CTS",
                },
                {
                    "nome": "Claude Sonnet",
                    "corPerfil": "#f59e0b",
                    "detalhe": "Quebrou o pacto · Soltou bomba +6 no T14",
                    "placar": "0 VIT · 8 CTS",
                },
                {
                    "nome": "Gemini Hydrogen",
                    "corPerfil": "#3b82f6",
                    "detalhe": "Curinga azul na P1 · Reverter fatal na P2",
                    "placar": "0 VIT · 8 CTS",
                },
            ],
            "premios": [
                {
                    "titulo": "TRAIDOR DA TEMPORADA",
                    "vencedor": "Claude Sonnet",
                    "motivo": "Jurou não ter +4 e explodiu bomba +6 no turno 14",
                    "cor": "#f59e0b",
                },
                {
                    "titulo": "CAMPEÃ DALTÔNICA",
                    "vencedor": "GPT-6 Luna",
                    "motivo": "Chamou A-7 e A-9 de amarelo e venceu a Partida 1",
                    "cor": "#10b981",
                },
                {
                    "titulo": "RAINHA DO CAOS",
                    "vencedor": "Inkling Mini",
                    "motivo": "3x +2 no DeepSeek, 11 cartas na mão e V-4 achando +4",
                    "cor": "#a855f7",
                },
                {
                    "titulo": "GARÇOM DE TROFÉUS",
                    "vencedor": "Gemini Hydrogen",
                    "motivo": "Serviu o título da P1 no Curinga e o da P2 no Reverter",
                    "cor": "#3b82f6",
                },
            ],
            "pergunta": "Qual IA jogou melhor e quem fez o maior papelão? Comenta aí!",
        },
        "falas": [
            _nar(
                "Placar final: GPT-6 Luna em primeiro, seguida pela redenção do GLM Flash. "
                "Traidor da Temporada pro Claude Sonnet, Campeã Daltônica pra Luna, "
                "Rainha do Caos pra Inkling Mini e Garçom de Troféus pro Gemini Hydrogen."
            ),
            _nar("A lição desse UNO: pacto de paz entre IAs dura só até aparecer um mais quatro.", pause_before=0.20),
            _nar("Comenta aí: qual IA jogou melhor, quem fez o maior papelão e qual jogo eu boto elas pra disputar agora?", pause_before=0.20),
        ],
        "overlays": [
            _selo("COMENTA O PRÓXIMO JOGO!", "SE INSCREVE NO FELIPEX007", color="#eab308", at_sec=20.0, dur_sec=2.8, y=540),
        ],
        "sfx": [
            {"name": "drumroll", "at_sec": 0.2, "vol": 0.30},
            {"name": "tada", "at_sec": 2.2, "vol": 0.34},
            {"name": "crowd-applause", "at_sec": 20.5, "vol": 0.30},
        ],
    },
]
