#!/usr/bin/env python3
"""Analisa logs reais de partidas do UNO das IAs e gera pacote_roteiro.md fiel 100% aos logs (zero invenção)."""
import json
import sys
from pathlib import Path

LOGS = Path("/home/felipexcria750/uno_ias/logs")


def summarize_match(path: Path) -> str:
    d = json.loads(path.read_text(encoding="utf-8"))
    out = []
    out.append(f"# PARTIDA {d['partidaNum']} (seed={d['seed']})")
    out.append(f"- **Status:** {d['status']} · **Turnos:** {d['turno']} · **Vencedor:** {d['vencedor']} ({d.get('motivoFim')})")
    out.append(f"- **Custo OpenRouter:** ${d.get('custoUsd', 0):.4f}")
    out.append("\n## Placar Final & Estatísticas")
    for j in sorted(d["jogadores"], key=lambda x: len(x["mao"])):
        st = j["estatisticas"]
        out.append(
            f"- **{j['nome']}** ({j['modelo']}): {len(j['mao'])} cartas restantes | "
            f"jogou={st['cartasJogadas']} | comprou={st['cartasCompradas']} | "
            f"+2={st['maisDoisJogados']} | +4={st['maisQuatroJogados']} | "
            f"maiorBomba=+{st['maiorBombaTomada']} | maxMao={st['maxCartasMao']} | "
            f"esqueceuUno={st['esquecimentosUno']} | denuncias={st['denunciasFeitas']}"
        )

    out.append("\n## Cronologia Completa (Falas & Pensamentos EXATOS do log)")
    for ev in d["eventos"]:
        t = ev.get("tipo")
        tr = ev.get("turno", 0)
        if t == "inicio_partida":
            out.append(f"- **[INÍCIO]** 1ª carta: `{ev['primeiraCarta']['codigo']}` (cor `{ev['corAtiva']}`)")
            for m in ev["maosIniciais"]:
                out.append(f"  - Mão inicial `{m['id']}`: {', '.join(m['mao'])}")
        elif t == "mesa_aberta":
            out.append(f"\n### [T{tr:02d}] MESA ABERTA — {ev['motivo']}")
            for f in ev["falas"]:
                out.append(f"- **{f['nome']}** ({f['cartasNaMao']} cartas: `{', '.join(f['maoReal'])}`)")
                out.append(f"  - *Pensamento (ECO):* \"{f['pensamento']}\"")
                out.append(f"  - *Fala na mesa:* \"{f['fala']}\"")
        elif t == "jogada":
            flags = []
            if ev.get("corEscolhida"):
                flags.append(f"cor->{ev['corEscolhida']}")
            if ev.get("pilhaCompra", 0) > 0:
                flags.append(f"BOMBA=+{ev['pilhaCompra']}")
            if ev.get("gritouUno"):
                flags.append("GRITOU UNO!")
            if ev.get("esqueceuUno"):
                flags.append("ESQUECEU UNO!!")
            if ev.get("tentativaInvalida"):
                flags.append(f"tentou_invalida={ev['tentativaInvalida']}")
            fl = f" [{' · '.join(flags)}]" if flags else ""
            out.append(f"- **[T{tr:02d}] {ev['nome']}** jogou `{ev['cartaCodigo']}`{fl} (restam {ev['restantes']}: `{', '.join(ev.get('maoRestante', []))}`)")
            if ev.get("pensamento"):
                out.append(f"  - *Pensamento (ECO):* \"{ev['pensamento']}\"")
            if ev.get("fala"):
                out.append(f"  - *Fala:* \"{ev['fala']}\"")
        elif t == "bomba_tomada":
            out.append(f"- **[T{tr:02d}] 💥 {ev['nome']} TOMOU BOMBA +{ev['qtd']}** (culpa: {ev.get('culpadoNome')}) -> agora {ev['restantes']} cartas")
            if ev.get("pensamento"):
                out.append(f"  - *Pensamento (ECO):* \"{ev['pensamento']}\"")
            if ev.get("fala"):
                out.append(f"  - *Fala:* \"{ev['fala']}\"")
        elif t == "compra":
            extra = f" e JOGOU NA HORA `{ev['jogouComprada']}`" if ev.get("jogouComprada") else ""
            out.append(f"- **[T{tr:02d}] {ev['nome']}** comprou 1 (`{ev.get('cartaComprada')}`){extra} -> {ev['restantes']} cartas")
            if ev.get("pensamento"):
                out.append(f"  - *Pensamento (ECO):* \"{ev['pensamento']}\"")
            if ev.get("fala"):
                out.append(f"  - *Fala:* \"{ev['fala']}\"")
        elif t == "denuncia_uno":
            out.append(f"- **[T{tr:02d}] 🚨 DENÚNCIA UNO!** **{ev['acusadorNome']}** denunciou **{ev['alvoNome']}** (+2 multa: `{', '.join(ev['multaCartas'])}` -> {ev['novoTotalAlvo']} cartas)")
            out.append(f"  - *Pensamento:* \"{ev['pensamento']}\"")
            out.append(f"  - *Fala:* \"{ev['fala']}\"")
        elif t == "fim_partida":
            out.append(f"\n### [T{tr:02d}] 🏆 FIM DA PARTIDA — {ev['motivo']}\n")
    return "\n".join(out)


def main():
    files = sorted(LOGS.glob("partida_*.json"))
    if not files:
        print("Nenhuma partida encontrada em", LOGS)
        return
    parts = [summarize_match(f) for f in files]
    dest = Path("/home/felipexcria750/uno_ias/pacote_logs_uno.md")
    dest.write_text("\n\n---\n\n".join(parts), encoding="utf-8")
    print(f"Gerado {dest} ({len(files)} partidas, {dest.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
