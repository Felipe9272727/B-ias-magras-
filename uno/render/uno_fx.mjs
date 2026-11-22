/**
 * UNO das IAs — Camada de FX Broadcast (Carta Voando com Spring, Selos Carimbados,
 * Cartão de Abertura/Capítulo, Tela de Elenco Acesa por Fala, Pódio/Prêmios da Temporada).
 * ZERO emojis — 100% vetor nítido em @napi-rs/canvas!
 */
import { W, H, roundRect, hexToRgba, drawUnoCard } from './uno_canvas.mjs';

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const u = Math.max(0, Math.min(1, t));
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
}

export function easeOutCubic(t) {
  const u = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - u, 3);
}

/**
 * Anima uma carta voando do assento do jogador até o centro da mesa (ou do monte até a mão).
 */
export function drawFlyingCard(ctx, { fromX, fromY, toX, toY, progress, codigo, faceDown = false, glowColor = null }) {
  const p = Math.max(0, Math.min(1, progress));
  const e = easeOutCubic(p);
  const arc = Math.sin(p * Math.PI) * -95;
  const x = fromX + (toX - fromX) * e;
  const y = fromY + (toY - fromY) * e + arc;
  const scale = 0.72 + 0.48 * Math.sin(p * Math.PI) + 0.28 * e;
  const rot = (1 - e) * -0.65 + 0.04;
  drawUnoCard(ctx, {
    x,
    y,
    w: Math.round(108 * scale),
    h: Math.round(162 * scale),
    codigo,
    rot,
    faceDown,
    glowColor,
  });
}

/**
 * Selo carimbado estilo canal (nunca cortado pelo fim da cena, entrada com slam elástico).
 */
export function drawStampSeal(ctx, { text, subtext = '', color = '#dc2626', x = W * 0.5, y = 265, localFrame = 0, durFrames = 65 }) {
  if (localFrame < 0 || localFrame > durFrames) return;
  const inP = Math.min(1, localFrame / 8);
  const outP = localFrame > durFrames - 8 ? (durFrames - localFrame) / 8 : 1;
  const scale = 1.65 - 0.65 * easeOutBack(inP);
  const alpha = Math.max(0, Math.min(1, inP * 1.4)) * Math.max(0, Math.min(1, outP));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(-0.07);
  ctx.scale(scale, scale);

  ctx.font = '900 44px "Bangers", "PoppinsExtraBold", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 68);
  const th = subtext ? 104 : 76;

  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 24;
  roundRect(ctx, -tw / 2, -th / 2, tw, th, 16);
  ctx.fillStyle = 'rgba(10,14,26,0.92)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, subtext ? -12 : 2);

  if (subtext) {
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 20px "PoppinsExtraBold", sans-serif';
    ctx.fillText(subtext, 0, 26);
  }
  ctx.restore();
}

/**
 * Cartão de Capítulo / Transição de Parte (título-história estilo CLAUDE.md, sem lobby!).
 */
export function drawChapterCard(ctx, { kicker = 'PARTIDA 1', title = 'O PACTO DO +4', subtitle = '', accent = '#f59e0b', progress = 0.5 }) {
  const inP = Math.min(1, progress * 5);
  const sc = 0.92 + 0.08 * easeOutBack(inP);

  // Fundo escuro cinematográfico
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 1100);
  bg.addColorStop(0, '#18223a');
  bg.addColorStop(1, '#060913');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cartas decorativas sutis nos cantos
  drawUnoCard(ctx, { x: 210, y: 230, w: 150, h: 225, codigo: '+4', rot: -0.26, alpha: 0.25 });
  drawUnoCard(ctx, { x: W - 210, y: H - 230, w: 150, h: 225, codigo: 'V-+2', rot: 0.24, alpha: 0.25 });

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(sc, sc);

  // Kicker pill
  roundRect(ctx, -180, -145, 360, 46, 23);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 22px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(kicker.toUpperCase(), 0, -122);

  // Título gigante
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px "PoppinsExtraBold", sans-serif';
  ctx.fillText(title.toUpperCase(), 0, -20);

  if (subtitle) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 32px "PoppinsBold", sans-serif';
    ctx.fillText(subtitle, 0, 72);
  }
  ctx.restore();
}

/**
 * Tela de Elenco (7 cards que acendem conforme o narrador cita cada IA — regra do MEMORIA_TECNICA.md!).
 */
export function drawRosterScreen(ctx, { elenco, activeId = null, title = 'AS 7 IAs NA MESA DO UNO', subtitle = 'Cada uma com seu modelo real — zero falas inventadas', frame = 0 }) {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 1100);
  bg.addColorStop(0, '#132038');
  bg.addColorStop(1, '#060912');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fde047';
  ctx.font = '900 54px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, W / 2, 92);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 24px "PoppinsBold", sans-serif';
  ctx.fillText(subtitle, W / 2, 146);

  // 4 cards na linha de cima, 3 na linha de baixo
  const rows = [elenco.slice(0, 4), elenco.slice(4, 7)];
  rows.forEach((row, rIdx) => {
    const cw = 370;
    const ch = 260;
    const gap = 38;
    const totalW = row.length * cw + (row.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const y = rIdx === 0 ? 230 : 540;

    row.forEach((j, cIdx) => {
      const x = startX + cIdx * (cw + gap);
      const lit = !activeId || activeId === j.id;
      const isFocus = activeId === j.id;
      const lift = isFocus ? -12 - Math.sin(frame * 0.2) * 4 : 0;

      ctx.save();
      ctx.globalAlpha = lit ? 1 : 0.36;
      ctx.translate(x, y + lift);

      if (isFocus) {
        ctx.shadowColor = hexToRgba(j.corPerfil, 0.85);
        ctx.shadowBlur = 35;
      }
      roundRect(ctx, 0, 0, cw, ch, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.lineWidth = isFocus ? 5 : 2.5;
      ctx.strokeStyle = j.corPerfil;
      ctx.stroke();

      // Barra superior colorida
      roundRect(ctx, 0, 0, cw, 16, 8);
      ctx.fillStyle = j.corPerfil;
      ctx.fill();

      // Mini carta decorativa com a cor do perfil
      const sampleCards = ['A-7', 'Y-+2', '+4', 'A-PULAR', 'V-REVERTER', 'G-9', 'V-+2'];
      const globalIdx = rIdx * 4 + cIdx;
      drawUnoCard(ctx, { x: cw - 66, y: 120, w: 80, h: 120, codigo: sampleCards[globalIdx % sampleCards.length], rot: 0.12 });

      // Nome + modelo + empresa
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px "PoppinsExtraBold", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(j.nome, 24, 42);

      ctx.fillStyle = j.corPerfil;
      ctx.font = '800 18px "JetBrainsMono", monospace';
      ctx.fillText(j.modelo, 24, 86);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 18px "PoppinsBold", sans-serif';
      ctx.fillText(j.empresa, 24, 122);

      if (j.tagline) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 17px "PoppinsBold", sans-serif';
        ctx.fillText(j.tagline, 24, 186);
      }
      ctx.restore();
    });
  });
}

/**
 * Tela de Pódio Final + Prêmios da Temporada + Pergunta pro Público (Fechamento em 3 passos do CLAUDE.md).
 */
export function drawPodiumScreen(ctx, { ranking, premios, pergunta }) {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 1100);
  bg.addColorStop(0, '#17233f');
  bg.addColorStop(1, '#050811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fde047';
  ctx.font = '900 54px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLACAR FINAL E PRÊMIOS DO UNO', W / 2, 78);

  // Coluna esquerda: Ranking das 7 IAs
  const lx = 90;
  const lw = 820;
  ranking.slice(0, 7).forEach((r, idx) => {
    const y = 148 + idx * 96;
    roundRect(ctx, lx, y, lw, 82, 16);
    ctx.fillStyle = idx === 0 ? 'rgba(234,179,8,0.18)' : 'rgba(15,23,42,0.88)';
    ctx.fill();
    ctx.lineWidth = idx === 0 ? 3.5 : 1.5;
    ctx.strokeStyle = idx === 0 ? '#fde047' : hexToRgba(r.corPerfil, 0.55);
    ctx.stroke();

    ctx.fillStyle = idx === 0 ? '#fde047' : '#94a3b8';
    ctx.font = '900 32px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${idx + 1}`, lx + 24, y + 41);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "PoppinsExtraBold", sans-serif';
    ctx.fillText(r.nome, lx + 96, y + 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 17px "JetBrainsMono", monospace';
    ctx.fillText(r.detalhe, lx + 96, y + 60);

    ctx.fillStyle = r.corPerfil;
    ctx.font = '900 24px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(r.placar, lx + lw - 24, y + 41);
  });

  // Coluna direita: 4 Prêmios Especiais da Temporada
  const rx = 965;
  const rw = 865;
  premios.slice(0, 4).forEach((p, idx) => {
    const y = 148 + idx * 168;
    roundRect(ctx, rx, y, rw, 148, 18);
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = p.cor || '#a855f7';
    ctx.stroke();

    ctx.fillStyle = p.cor || '#fde047';
    ctx.font = '900 22px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(p.titulo.toUpperCase(), rx + 26, y + 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "PoppinsExtraBold", sans-serif';
    ctx.fillText(p.vencedor, rx + 26, y + 54);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 20px "PoppinsBold", sans-serif';
    ctx.fillText(p.motivo, rx + 26, y + 102);
  });

  // Faixa inferior: Pergunta pro público comentar
  roundRect(ctx, 90, H - 150, W - 180, 94, 20);
  ctx.fillStyle = 'rgba(124,58,237,0.28)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#c084fc';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pergunta, W / 2, H - 103);
}
