#!/usr/bin/env python3
"""Empacota UNO das IAs para render em 16 runners (ou render local) + mix -14 LUFS + QA 30s + upload Buzzheavier."""
import json
import os
import tarfile
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
UNO_DIR = Path(os.environ.get("UNO_DIR", Path(__file__).resolve().parent.parent))
ASSETS_DIR = Path(os.environ.get("UNO_ASSETS_DIR", REPO_ROOT / "video" / "remotion" / "public"))
REF_MUSIC_JSON = ASSETS_DIR / "music" / "music.json"
PACK_DIR = Path(os.environ.get("UNO_WORK_DIR", Path(tempfile.gettempdir()) / "gh_uno_pack"))


def load_music_info() -> dict:
    info = {}
    for p in (REF_MUSIC_JSON, ASSETS_DIR / "music" / "music.json"):
        if p.exists():
            for m in json.loads(p.read_text(encoding="utf-8")):
                info.setdefault(m["id"], m)
    return info


def compute_music_blocks(tl: dict, info: dict) -> tuple[list, set]:
    cenas = tl.get("cenas", [])
    fps = int(tl.get("fps", 30))
    blocks = []
    t_frames = 0
    for c in cenas:
        mid = c.get("music") or "quirky-dog"
        if not blocks or blocks[-1]["music_id"] != mid:
            blocks.append({"start_sec": t_frames / fps, "end_sec": None, "music_id": mid})
        t_frames += int(c["dur"])
    total_sec = t_frames / fps
    used = set()
    for i, b in enumerate(blocks):
        b["end_sec"] = blocks[i + 1]["start_sec"] if i + 1 < len(blocks) else total_sec
        b["duration_sec"] = round(max(0.05, b["end_sec"] - b["start_sec"]), 4)
        mid = b["music_id"]
        if mid in ("silencio", "none", "silence"):
            b["vol"] = 0.0
            b["mp3_name"] = None
        else:
            entry = info.get(mid, {})
            b["vol"] = round(float(entry.get("suggested_bg_volume", 0.22)) * 0.82, 4)
            cands = [ASSETS_DIR / "music" / f"{mid}.mp3", ASSETS_DIR / entry.get("file", f"music/{mid}.mp3")]
            found = next((x for x in cands if x.exists()), None)
            if not found:
                raise FileNotFoundError(f"Música faltando: {mid}")
            b["mp3_name"] = found.name
            used.add(found)
    return blocks, used


def main():
    PACK_DIR.mkdir(parents=True, exist_ok=True)
    tl = json.loads((UNO_DIR / "timeline_uno.json").read_text(encoding="utf-8"))
    cenas = tl["cenas"]
    info = load_music_info()
    blocks, used_tracks = compute_music_blocks(tl, info)
    (PACK_DIR / "music_blocks.json").write_text(json.dumps(blocks, indent=2), encoding="utf-8")

    # 8 shards (ou 16) equilibrados por número de cenas
    num_shards = min(16, len(cenas))
    shards = []
    for s in range(num_shards):
        a = (s * len(cenas)) // num_shards
        b = ((s + 1) * len(cenas)) // num_shards
        ids = [sc["id"] for sc in cenas[a:b]]
        dur = round(sum(float(sc["dur_sec"]) for sc in cenas[a:b]), 2)
        shards.append({"shard": s, "scene_ids": ids, "duration_sec": dur})
    (PACK_DIR / "shards.json").write_text(json.dumps(shards, indent=2), encoding="utf-8")

    used_memes = {
        ov["meme"]
        for sc in cenas
        for ov in sc.get("overlays", [])
        if ov.get("tipo") == "meme" and ov.get("meme")
    }

    bundle = PACK_DIR / "bundle_uno.tar"
    with tarfile.open(bundle, "w") as tf:
        for fn in ("uno_rules.mjs", "uno_roster.mjs", "timeline_uno.json"):
            p = UNO_DIR / fn
            if p.exists():
                tf.add(str(p), arcname=f"uno/{fn}")
        for fn in ("uno_canvas.mjs", "uno_fx.mjs", "render_uno.mjs"):
            p = UNO_DIR / "render" / fn
            if p.exists():
                tf.add(str(p), arcname=f"uno/render/{fn}")
        if (ASSETS_DIR / "fonts").exists():
            tf.add(str(ASSETS_DIR / "fonts"), arcname="video/remotion/public/fonts")
        for m in sorted(used_memes):
            gp = ASSETS_DIR / "gifs" / f"{m}.gif"
            if gp.exists():
                tf.add(str(gp), arcname=f"video/remotion/public/gifs/{gp.name}")

    audio_tar = PACK_DIR / "audio_pack_uno.tar"
    with tarfile.open(audio_tar, "w") as tf:
        tf.add(str(UNO_DIR / "voice_sfx_master_uno.flac"), arcname="voice_sfx_master_uno.flac")
        tf.add(str(PACK_DIR / "music_blocks.json"), arcname="music_blocks.json")
        for tp in sorted(used_tracks):
            tf.add(str(tp), arcname=f"music/{tp.name}")

    print(f"[prep_uno] OK! {len(cenas)} cenas, {len(shards)} shards, bundle={bundle.stat().st_size/1e6:.1f} MB, audio={audio_tar.stat().st_size/1e6:.1f} MB")


if __name__ == "__main__":
    main()
