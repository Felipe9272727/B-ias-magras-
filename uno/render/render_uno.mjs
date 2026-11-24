#!/usr/bin/env node
/**
 * UNO das IAs — Renderizador Unificado 30.000 FPS (Node Skia Canvas -> FFmpeg rawvideo pipe)
 * Compativel com render local E sharding em 16 maquinas do GitHub Actions (`--only ...`).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import {
  W,
  H,
  ASSENTOS_7,
  resolvePlayerId,
  drawUnoTable,
  drawTableHud,
  drawPlayerSeat,
  drawDialogueCard,
} from './uno_canvas.mjs';
import { drawFlyingCard, drawStampSeal, drawChapterCard, drawRosterScreen, drawPodiumScreen } from './uno_fx.mjs';

const REC_W = 1280;
const REC_H = 720;
const DPR = REC_W / W;
const FPS = 30;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const UNO_DIR = process.env.UNO_DIR || path.resolve(__dirname, '..');
const ASSETS_DIR = process.env.UNO_ASSETS_DIR || path.join(REPO_ROOT, 'video', 'remotion', 'public');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');
const GIFS_DIR = path.join(ASSETS_DIR, 'gifs');
const WORK_DIR = process.env.UNO_WORK_DIR || path.join(os.tmpdir(), 'uno_scenes');
const GIF_CACHE_DIR = process.env.UNO_GIF_CACHE_DIR || path.join(os.tmpdir(), 'uno_gifs_frames');

function registerFonts() {
  const map = [
    [['Bangers-Regular.ttf', 'Bangers-400-latin.woff2'], 'Bangers'],
    [['Poppins-ExtraBold.ttf', 'Poppins-800-latin.woff2'], 'PoppinsExtraBold'],
    [['Poppins-Bold.ttf', 'Poppins-900-latin.woff2', 'Poppins-800-latin.woff2'], 'PoppinsBold'],
    [['Poppins-SemiBold.ttf', 'Poppins-600-latin.woff2'], 'PoppinsSemiBold'],
    [['JetBrainsMono-Bold.ttf', 'JetBrainsMono-700-latin.woff2'], 'JetBrainsMono'],
  ];
  for (const [candidates, family] of map) {
    for (const fn of candidates) {
      const p = path.join(FONTS_DIR, fn);
      if (fs.existsSync(p)) {
        GlobalFonts.registerFromPath(p, family);
        break;
      }
    }
  }
}

const _gifFramesCache = new Map();
async function loadGifFrames(memeName, ffmpegBin) {
  if (_gifFramesCache.has(memeName)) return _gifFramesCache.get(memeName);
  const gifPath = path.join(GIFS_DIR, `${memeName}.gif`);
  if (!fs.existsSync(gifPath)) {
    _gifFramesCache.set(memeName, []);
    return [];
  }
  const outDir = path.join(GIF_CACHE_DIR, memeName);
  fs.mkdirSync(outDir, { recursive: true });
  let files = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).sort();
  if (files.length === 0) {
    spawnSync(ffmpegBin, ['-v', 'error', '-y', '-i', gifPath, '-vf', 'fps=12,scale=360:-1:flags=lanczos', path.join(outDir, 'f_%03d.png')]);
    files = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).sort();
  }
  const imgs = [];
  for (const f of files.slice(0, 72)) {
    imgs.push(await loadImage(path.join(outDir, f)));
  }
  _gifFramesCache.set(memeName, imgs);
  return imgs;
}

function drawMemeBox(ctx, imgs, { x = 1480, y = 700, w = 340, caption = '', localFrame = 0, durFrames = 65 }) {
  if (!imgs?.length || localFrame < 0 || localFrame > durFrames) return;
  const inP = Math.min(1, localFrame / 6);
  const outP = localFrame > durFrames - 6 ? (durFrames - localFrame) / 6 : 1;
  const alpha = Math.max(0, Math.min(1, inP)) * Math.max(0, Math.min(1, outP));
  const img = imgs[Math.floor((localFrame / FPS) * 12) % imgs.length];
  const aspect = img.height / Math.max(1, img.width);
  const h = Math.min(240, Math.round(w * aspect));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 6, y - 6, w + 12, h + (caption ? 42 : 12));
  ctx.drawImage(img, x, y, w, h);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 4, y - 4, w + 8, h + (caption ? 38 : 8));
  if (caption) {
    ctx.fillStyle = '#fde047';
    ctx.font = '900 18px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(caption.toUpperCase(), x + w / 2, y + h + 18);
  }
  ctx.restore();
}

function parseArgs(argv) {
  const out = {
    timeline: path.join(UNO_DIR, 'timeline_uno.json'),
    only: null,
    smokeTest: false,
    ffmpeg: 'ffmpeg',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--timeline') out.timeline = argv[++i];
    else if (a === '--only') out.only = new Set(argv[++i].split(',').map((s) => s.trim()).filter(Boolean));
    else if (a === '--smoke-test') out.smokeTest = true;
    else if (a === '--ffmpeg') out.ffmpeg = argv[++i];
  }
  return out;
}

async function renderScene(scene, tl, ffmpegBin, outPath) {
  const durFrames = Math.max(15, Number(scene.dur || 90));
  const canvas = createCanvas(REC_W, REC_H);
  const ctx = canvas.getContext('2d');
  const tmpPath = `${outPath}.tmp.${process.pid}.mkv`;

  // Pre-carrega GIFs usados nesta cena
  const memeAssets = new Map();
  for (const ov of scene.overlays || []) {
    if (ov.tipo === 'meme' && ov.meme) {
      memeAssets.set(ov.meme, await loadGifFrames(ov.meme, ffmpegBin));
    }
  }

  const ff = spawn(ffmpegBin, [
    '-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${REC_W}x${REC_H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-threads', '2',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), tmpPath,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let errTxt = '';
  ff.stderr.on('data', (d) => { errTxt += d.toString(); });

  const rmsArr = scene.voice_rms || [];
  const startGlobal = Number(scene.start_frame || 0);

  for (let f = 0; f < durFrames; f++) {
    const progress = f / Math.max(1, durFrames - 1);
    const voiceAmp = rmsArr[f] ?? 0.35;
    const globalFrame = startGlobal + f;

    // Limpa completamente o framebuffer antes do pan/zoom (elimina fantasmas de meme/bordas!)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#04070f';
    ctx.fillRect(0, 0, REC_W, REC_H);

    // Detecta qual IA esta falando ou pensando exatamente neste frame para animar boca/expressao!
    let activeFala = null;
    for (const seg of scene.falas || []) {
      if (f >= seg.at && f < seg.at + seg.dur && seg.speaker !== 'narrador') {
        activeFala = seg;
        break;
      }
    }
    const speakingId = activeFala ? resolvePlayerId(activeFala.speaker || activeFala.nome) : null;
    const speakingMode = activeFala ? (activeFala.modo || 'fala') : 'fala';

    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Deriva lenta suave de camera (+4.5% zoom ao longo da cena para nunca ficar tela estatica!)
    const zoom = scene.tipo === 'mesa' ? 1.0 + 0.045 * progress : 1.0 + 0.025 * progress;
    const focusIdx = typeof scene.focusIdx === 'number' ? scene.focusIdx : null;
    const targetX = focusIdx !== null && ASSENTOS_7[focusIdx] ? W * 0.5 + (ASSENTOS_7[focusIdx].x - W * 0.5) * 0.14 : W * 0.5;
    const targetY = focusIdx !== null && ASSENTOS_7[focusIdx] ? H * 0.5 + (ASSENTOS_7[focusIdx].y - H * 0.5) * 0.12 : H * 0.5;

    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-targetX, -targetY);

    if (scene.tipo === 'capitulo') {
      drawChapterCard(ctx, { ...scene.capitulo, progress });
    } else if (scene.tipo === 'elenco') {
      // Acende a IA conforme o narrador cita o nome dela!
      let activeId = null;
      for (const h of scene.highlights || []) {
        if (f >= h.at && f < h.at + h.dur) activeId = h.id;
      }
      drawRosterScreen(ctx, { elenco: tl.elenco, activeId, frame: globalFrame, ...(scene.elencoMeta || {}) });
    } else if (scene.tipo === 'podio') {
      drawPodiumScreen(ctx, { ...scene.podio, frame: globalFrame });
    } else {
      // Cena principal de mesa UNO 2.5D
      const st = scene.mesa;
      const jogadores = st.jogadores || [];

      // Cone de luz da mesa aponta para quem esta falando agora ou para o jogador da vez
      let spotlightIdx = typeof st.ativoIdx === 'number' ? st.ativoIdx : null;
      if (speakingId) {
        const spIdx = jogadores.findIndex((j) => resolvePlayerId(j.id || j.nome) === speakingId);
        if (spIdx >= 0) spotlightIdx = spIdx;
      }
      const activeSeat = spotlightIdx !== null ? ASSENTOS_7[spotlightIdx] : null;
      const activeColor = spotlightIdx !== null && jogadores[spotlightIdx] ? jogadores[spotlightIdx].corPerfil : null;

      drawUnoTable(ctx, {
        corAtiva: st.corAtiva,
        direcao: st.direcao,
        pilhaCompra: st.pilhaCompra,
        descarteTop: st.descarteTop,
        deckCount: st.deckCount,
        frame: globalFrame,
        turno: st.turno,
        partidaNum: st.partidaNum,
        bannerSub: st.bannerSub || '',
        activeSeat,
        activeColor,
      });

      // Desenha os 7 personagens 2.5D + leques semitransparentes ordenados de tras para frente (profundidade 2.5D!)
      const drawOrder = jogadores
        .map((j, idx) => ({ j, idx, seat: ASSENTOS_7[idx] }))
        .filter((item) => Boolean(item.seat))
        .sort((a, b) => a.seat.y - b.seat.y);

      for (const { j, idx, seat } of drawOrder) {
        const pid = resolvePlayerId(j.id || j.nome);
        const isThisSpeaker = Boolean(speakingId && pid === speakingId);
        drawPlayerSeat(ctx, {
          jogador: j,
          seat,
          isActive: idx === st.ativoIdx,
          isSpeaking: isThisSpeaker && speakingMode !== 'pensamento',
          isThinking: isThisSpeaker && speakingMode === 'pensamento',
          speakingId,
          speakingMode,
          voiceAmp,
          pilhaCompra: st.pilhaCompra || 0,
          frame: globalFrame,
        });
      }

      // Carta voando (se houver animacao nesta cena)
      if (scene.flyCard && f >= scene.flyCard.at && f <= scene.flyCard.at + scene.flyCard.dur) {
        const fp = (f - scene.flyCard.at) / Math.max(1, scene.flyCard.dur);
        const sIdx = scene.flyCard.fromIdx;
        const from = sIdx === 'deck' ? { x: W * 0.5 - 108, y: H * 0.445 } : ASSENTOS_7[sIdx];
        const to = scene.flyCard.to === 'discard' ? { x: W * 0.5 + 94, y: H * 0.445 } : ASSENTOS_7[scene.flyCard.to];
        if (from && to) {
          drawFlyingCard(ctx, {
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            progress: fp,
            codigo: scene.flyCard.codigo,
            faceDown: Boolean(scene.flyCard.faceDown),
            glowColor: scene.flyCard.glowColor || null,
          });
        }
      }
    }

    ctx.restore();

    // Camada HUD fixa (sem zoom): HUD de mesa + Baloes de dialogo/pensamento + Selos + Memes
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const isTableScene = scene.tipo !== 'capitulo' && scene.tipo !== 'elenco' && scene.tipo !== 'podio';
    if (isTableScene && scene.mesa) {
      drawTableHud(ctx, {
        turno: scene.mesa.turno,
        partidaNum: scene.mesa.partidaNum,
        direcao: scene.mesa.direcao,
        bannerSub: scene.mesa.bannerSub || '',
        corAtiva: scene.mesa.corAtiva,
        pilhaCompra: scene.mesa.pilhaCompra || 0,
        frame: globalFrame,
      });
    }

    for (const seg of scene.falas || []) {
      if (f >= seg.at && f < seg.at + seg.dur && seg.speaker !== 'narrador') {
        drawDialogueCard(ctx, {
          id: seg.speaker,
          nome: seg.nome,
          corPerfil: seg.corPerfil,
          texto: seg.texto,
          modo: seg.modo || 'fala',
          voiceAmp,
          frame: globalFrame,
        });
      }
    }

    for (const ov of scene.overlays || []) {
      const lf = f - ov.at;
      if (lf < 0 || lf > ov.dur) continue;
      if (ov.tipo === 'selo') {
        drawStampSeal(ctx, {
          text: ov.text,
          subtext: ov.subtext || '',
          color: ov.color || '#dc2626',
          x: ov.x ?? W * 0.5,
          y: ov.y ?? 330,
          localFrame: lf,
          durFrames: ov.dur,
          pilhaCompra: scene.mesa?.pilhaCompra || 0,
        });
      } else if (ov.tipo === 'meme') {
        const imgs = memeAssets.get(ov.meme) || [];
        drawMemeBox(ctx, imgs, {
          x: ov.x ?? 1490,
          y: ov.y ?? 680,
          w: ov.w ?? 350,
          caption: ov.caption || '',
          localFrame: lf,
          durFrames: ov.dur,
        });
      }
    }

    ctx.restore();

    const buf = canvas.data();
    if (!ff.stdin.write(buf)) {
      await once(ff.stdin, 'drain');
    }
  }

  ff.stdin.end();
  const [code] = await once(ff, 'close');
  if (code !== 0) {
    throw new Error(`ffmpeg falhou na cena ${scene.id} (code=${code}): ${errTxt}`);
  }
  fs.renameSync(tmpPath, outPath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  registerFonts();
  fs.mkdirSync(WORK_DIR, { recursive: true });
  const tl = JSON.parse(fs.readFileSync(args.timeline, 'utf8'));
  const cenas = args.smokeTest
    ? [tl.cenas[0]]
    : tl.cenas.filter((c) => !args.only || args.only.has(c.id));

  for (const sc of cenas) {
    const outPath = path.join(WORK_DIR, `${sc.id}.mkv`);
    const t0 = Date.now();
    await renderScene(sc, tl, args.ffmpeg, outPath);
    console.log(`[render_uno] ${sc.id} (${sc.dur}f) OK em ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}

main().catch((err) => {
  console.error('[render_uno] ERRO:', err);
  process.exit(1);
});
