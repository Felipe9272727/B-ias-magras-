#!/usr/bin/env python3
"""Benchmark comparativo de modelos TTS gratuitos em CPU (GitHub Actions).

Gera os mesmos cortes reais do canal (Among Us 5: k01 + p1b e pensamento p1n2_2)
para comparar diretamente contra a voz oficial do ElevenLabs.
"""

from __future__ import annotations

import argparse
import asyncio
import subprocess
import time
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "video" / "remotion" / "public" / "bb" / "refs"
REF_NARRADOR = REFS / "narrador.wav"
REF_NARRADOR_TXT = "Essa IA passou cinco dias tentando ser expulsa da vila."
REF_CLAUDE = REFS / "Claude.wav"

TEXTO_CORTE = (
    "Essa é a Rose. E essa... também é a Rose. "
    "Só que uma delas acabou de matar a outra. "
    "O Roxo é o Xerife. Viu o Cinza entrar num duto... e atirou. "
    "Era o Envenenador. Um impostor a menos em cinco tiques."
)

TEXTO_CORTE_TAGS = (
    "Essa é a Rose. E essa... também é a Rose. [sigh] "
    "Só que uma delas acabou de matar a outra. [laughter] "
    "Um impostor a menos em cinco tiques!"
)

TEXTO_PENSAMENTO = (
    "Banana é Juiz e viu o Branco matar, isso é péssimo pra nós. "
    "Preciso minar o testemunho dele sem parecer que tô defendendo o Branco diretamente."
)

FILTER_POS_EQ = (
    "highpass=f=80,"
    "acompressor=threshold=-18dB:ratio=3:attack=10:release=120,"
    "loudnorm=I=-14:TP=-1.5:LRA=11"
)
FILTER_AECHO = "aecho=0.8:0.7:90|180:0.35|0.2,apad=pad_dur=0.35"
FILTER_TRIM = (
    "silenceremove=start_periods=1:start_threshold=-45dB,"
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
)


def _run_ffmpeg(args: list[str]) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def to_mp3(wav_path: Path, mp3_path: Path) -> None:
    _run_ffmpeg(["-i", str(wav_path), "-af", FILTER_TRIM, "-b:a", "160k", str(mp3_path)])
    wav_path.unlink(missing_ok=True)


def to_pos_eq(src_mp3: Path, dst_mp3: Path) -> None:
    _run_ffmpeg(["-i", str(src_mp3), "-af", FILTER_POS_EQ, "-b:a", "160k", str(dst_mp3)])


def to_aecho(src_mp3: Path, dst_mp3: Path) -> None:
    _run_ffmpeg(["-i", str(src_mp3), "-af", FILTER_AECHO, "-b:a", "160k", str(dst_mp3)])


def _to_numpy_audio(audio: object):
    import numpy as np

    a = audio[0] if isinstance(audio, (list, tuple)) else audio
    if hasattr(a, "detach"):
        a = a.detach().cpu().numpy()
    arr = np.asarray(a, dtype=np.float32).squeeze()
    if arr.ndim > 1:
        arr = arr.reshape(-1)
    return arr


def _write_timing(out: Path, engine: str, lines: list[str]) -> None:
    (out / f"timing_{engine}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_omnivoice(out: Path) -> None:
    import soundfile as sf
    import torch
    from omnivoice import OmniVoice

    logs = ["engine=omnivoice"]
    t0 = time.time()
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
    load_s = time.time() - t0
    logs.append(f"load_sec={load_s:.2f}")
    sr = int(getattr(model, "sample_rate", 24000) or 24000)

    def gen(name: str, text: str, ref_wav: Path, ref_txt: str | None) -> Path | None:
        ts = time.time()
        wav = out / f"{name}.wav"
        mp3 = out / f"{name}.mp3"
        try:
            kwargs = {"text": text, "ref_audio": str(ref_wav)}
            if ref_txt:
                kwargs["ref_text"] = ref_txt
            audio = model.generate(**kwargs)
            arr = _to_numpy_audio(audio)
            sf.write(wav, arr, sr)
            to_mp3(wav, mp3)
            logs.append(f"{name}={time.time() - ts:.2f}s ok")
            return mp3
        except Exception as exc:
            logs.append(f"{name}=ERR {type(exc).__name__}: {exc}")
            traceback.print_exc()
            return None

    base = gen("01_omnivoice_06b_clone", TEXTO_CORTE, REF_NARRADOR, REF_NARRADOR_TXT)
    if base and base.exists():
        to_pos_eq(base, out / "01b_omnivoice_06b_pos_eq.mp3")
        logs.append("01b_omnivoice_06b_pos_eq=ok")

    gen("01c_omnivoice_06b_com_tags", TEXTO_CORTE_TAGS, REF_NARRADOR, REF_NARRADOR_TXT)

    pensa_raw = gen("01d_omnivoice_tmp_pensa", TEXTO_PENSAMENTO, REF_CLAUDE, None)
    if not pensa_raw or not pensa_raw.exists():
        pensa_raw = gen("01d_omnivoice_tmp_pensa", TEXTO_PENSAMENTO, REF_NARRADOR, REF_NARRADOR_TXT)
    if pensa_raw and pensa_raw.exists():
        to_aecho(pensa_raw, out / "01d_omnivoice_06b_pensamento_aecho.mp3")
        pensa_raw.unlink(missing_ok=True)
        logs.append("01d_omnivoice_06b_pensamento_aecho=ok")

    logs.append(f"total_sec={time.time() - t0:.2f}")
    _write_timing(out, "omnivoice", logs)


def run_qwen3(out: Path) -> None:
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel

    logs = ["engine=qwen3"]
    t0 = time.time()

    def save_wavs(name: str, wavs, sr: int) -> Path:
        wav = out / f"{name}.wav"
        mp3 = out / f"{name}.mp3"
        sf.write(wav, wavs[0], sr)
        to_mp3(wav, mp3)
        return mp3

    t_load_base = time.time()
    base_model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32
    )
    logs.append(f"load_base_sec={time.time() - t_load_base:.2f}")

    ts = time.time()
    wavs, sr = base_model.generate_voice_clone(
        text=TEXTO_CORTE,
        language="Portuguese",
        ref_audio=str(REF_NARRADOR),
        ref_text=REF_NARRADOR_TXT,
        x_vector_only_mode=True,
    )
    c_mp3 = save_wavs("02_qwen3_clone", wavs, sr)
    to_pos_eq(c_mp3, out / "02b_qwen3_clone_pos_eq.mp3")
    logs.append(f"02_qwen3_clone={time.time() - ts:.2f}s ok")

    ts = time.time()
    wavs_p, sr_p = base_model.generate_voice_clone(
        text=TEXTO_PENSAMENTO,
        language="Portuguese",
        ref_audio=str(REF_CLAUDE if REF_CLAUDE.exists() else REF_NARRADOR),
        ref_text="",
        x_vector_only_mode=True,
    )
    p_tmp = save_wavs("02d_qwen3_tmp_pensa", wavs_p, sr_p)
    to_aecho(p_tmp, out / "02d_qwen3_pensamento_aecho.mp3")
    p_tmp.unlink(missing_ok=True)
    logs.append(f"02d_qwen3_pensamento_aecho={time.time() - ts:.2f}s ok")
    del base_model

    t_load_vd = time.time()
    vd_model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32
    )
    logs.append(f"load_vd_sec={time.time() - t_load_vd:.2f}")

    ts = time.time()
    wavs_vd, sr_vd = vd_model.generate_voice_design(
        text=TEXTO_CORTE,
        language="Portuguese",
        instruct=(
            "Narrador brasileiro de video de YouTube de games, voz masculina expressiva, "
            "ritmo agil e envolvente, tom de suspense e humor."
        ),
    )
    save_wavs("02c_qwen3_voicedesign", wavs_vd, sr_vd)
    logs.append(f"02c_qwen3_voicedesign={time.time() - ts:.2f}s ok")
    logs.append(f"total_sec={time.time() - t0:.2f}")
    _write_timing(out, "qwen3", logs)


def run_chatterbox(out: Path) -> None:
    import soundfile as sf
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    logs = ["engine=chatterbox"]
    t0 = time.time()
    model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    logs.append(f"load_sec={time.time() - t0:.2f}")

    ts = time.time()
    w = model.generate(
        TEXTO_CORTE,
        language_id="pt",
        audio_prompt_path=str(REF_NARRADOR),
        exaggeration=0.65,
        cfg_weight=0.45,
    )
    wav = out / "03_chatterbox_mtl_clone.wav"
    mp3 = out / "03_chatterbox_mtl_clone.mp3"
    sf.write(wav, w.squeeze().numpy(), model.sr)
    to_mp3(wav, mp3)
    to_pos_eq(mp3, out / "03b_chatterbox_mtl_pos_eq.mp3")
    logs.append(f"03_chatterbox_mtl_clone={time.time() - ts:.2f}s ok")

    ts = time.time()
    wp = model.generate(
        TEXTO_PENSAMENTO,
        language_id="pt",
        audio_prompt_path=str(REF_CLAUDE if REF_CLAUDE.exists() else REF_NARRADOR),
        exaggeration=0.55,
        cfg_weight=0.50,
    )
    wav_p = out / "03c_chatterbox_tmp_pensa.wav"
    mp3_p = out / "03c_chatterbox_tmp_pensa.mp3"
    sf.write(wav_p, wp.squeeze().numpy(), model.sr)
    to_mp3(wav_p, mp3_p)
    to_aecho(mp3_p, out / "03c_chatterbox_pensamento_aecho.mp3")
    mp3_p.unlink(missing_ok=True)
    logs.append(f"03c_chatterbox_pensamento_aecho={time.time() - ts:.2f}s ok")
    logs.append(f"total_sec={time.time() - t0:.2f}")
    _write_timing(out, "chatterbox", logs)


def run_kokoro(out: Path) -> None:
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    logs = ["engine=kokoro"]
    t0 = time.time()
    pipe = KPipeline(lang_code="p", repo_id="hexgrad/Kokoro-82M")
    logs.append(f"load_sec={time.time() - t0:.2f}")

    for voice, out_name in [("pm_alex", "04_kokoro_82m_pm_alex"), ("pm_santa", "04b_kokoro_82m_pm_santa")]:
        ts = time.time()
        chunks = [audio for _, _, audio in pipe(TEXTO_CORTE, voice=voice)]
        arr = np.concatenate([_to_numpy_audio(c) for c in chunks])
        wav = out / f"{out_name}.wav"
        mp3 = out / f"{out_name}.mp3"
        sf.write(wav, arr, 24000)
        to_mp3(wav, mp3)
        logs.append(f"{out_name}={time.time() - ts:.2f}s ok")

    logs.append(f"total_sec={time.time() - t0:.2f}")
    _write_timing(out, "kokoro", logs)


def run_edge(out: Path) -> None:
    import edge_tts

    logs = ["engine=edge"]
    t0 = time.time()

    async def gen_all() -> None:
        cases = [
            ("pt-BR-AntonioNeural", "+8%", "05_edge_antonio"),
            ("pt-BR-FabioNeural", "+6%", "05b_edge_fabio"),
        ]
        for voice, rate, name in cases:
            ts = time.time()
            raw = out / f"{name}.raw.mp3"
            dst = out / f"{name}.mp3"
            com = edge_tts.Communicate(TEXTO_CORTE, voice, rate=rate)
            await com.save(str(raw))
            _run_ffmpeg(["-i", str(raw), "-af", FILTER_TRIM, "-b:a", "160k", str(dst)])
            raw.unlink(missing_ok=True)
            logs.append(f"{name}={time.time() - ts:.2f}s ok")

    asyncio.run(gen_all())
    logs.append(f"total_sec={time.time() - t0:.2f}")
    _write_timing(out, "edge", logs)


ENGINES = {
    "omnivoice": run_omnivoice,
    "qwen3": run_qwen3,
    "chatterbox": run_chatterbox,
    "kokoro": run_kokoro,
    "edge": run_edge,
}


def main() -> None:
    ap = argparse.ArgumentParser(description="Benchmark comparativo TTS em CPU no GitHub Actions")
    ap.add_argument("--engine", required=True, choices=sorted(ENGINES))
    ap.add_argument("--out", default="bench_out")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    try:
        ENGINES[args.engine](out)
    except Exception as exc:
        _write_timing(out, args.engine, [f"engine={args.engine}", f"FATAL={type(exc).__name__}: {exc}", traceback.format_exc()])
        raise


if __name__ == "__main__":
    main()
