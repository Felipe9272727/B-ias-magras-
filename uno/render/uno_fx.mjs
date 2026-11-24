/**
 * UNO das IAs — Camada de FX Broadcast (Carta Voando com Spring, Selos Carimbados,
 * Cartao de Abertura/Capitulo, Tela de Elenco 2.5D Wolvesville Acesa por Fala,
 * Podio/Premios da Temporada com Personagens Ilustrados).
 * ZERO emojis — 100% vetor nitido em @napi-rs/canvas!
 */
import {
  W,
  H,
  roundRect,
  hexToRgba,
  drawUnoCard,
  drawAiCharacter,
  drawVectorCrown,
  resolvePlayerId,
} from './uno_canvas.mjs';

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
 * Anima uma carta voando do assento do jogador ate o centro da mesa (ou do monte ate a mao).
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
 * Selo carimbado estilo canal (nunca cortado pelo fim da cena, entrada com slam elastico).
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
 * Cartao de Capitulo / Transicao de Parte (titulo-historia estilo CLAUDE.md, sem lobby!).
 */
export function drawChapterCard(ctx, { kicker = 'PARTIDA 1', title = 'O PACTO DO +4', subtitle = '', accent = '#f59e0b', progress = 0.5 }) {
  const inP = Math.min(1, progress * 5);
  const sc = 0.92 + 0.08 * easeOutBack(inP);

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

  // Titulo gigante
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
 * Tela de Elenco (7 cards com os personagens 2.5D Wolvesville acendendo conforme o narrador cita cada IA!).
 */
export function drawRosterScreen(ctx, {
  elenco,
  activeId = null,
  title = 'AS 7 IAs NA MESA DO UNO',
  subtitle = 'Cada uma com seu modelo real — zero falas inventadas',
  frame = 0,
}) {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 1140);
  bg.addColorStop(0, '#14233d');
  bg.addColorStop(1, '#050811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fde047';
  ctx.font = '900 54px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, W / 2, 84);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 24px "PoppinsBold", sans-serif';
  ctx.fillText(subtitle, W / 2, 136);

  const sampleHands = [
    ['A-7', 'A-REVERTER'],
    ['+4', 'Y-+2'],
    ['G-+2', 'V-+2'],
    ['A-PULAR', '+4'],
    ['V-REVERTER', 'Y-5'],
    ['G-9', 'A-9'],
    ['A-+2', 'V-+2'],
  ];

  // 4 cards na linha de cima, 3 na linha de baixo
  const rows = [elenco.slice(0, 4), elenco.slice(4, 7)];
  rows.forEach((row, rIdx) => {
    const cw = 415;
    const ch = 285;
    const gap = 34;
    const totalW = row.length * cw + (row.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const y = rIdx === 0 ? 198 : 522;

    row.forEach((j, cIdx) => {
      const x = startX + cIdx * (cw + gap);
      const pid = resolvePlayerId(j.id || j.nome);
      const lit = !activeId || resolvePlayerId(activeId) === pid;
      const isFocus = Boolean(activeId && resolvePlayerId(activeId) === pid);
      const lift = isFocus ? -12 - Math.sin(frame * 0.2) * 4 : 0;
      const globalIdx = rIdx * 4 + cIdx;

      ctx.save();
      ctx.globalAlpha = lit ? 1 : 0.34;
      ctx.translate(x, y + lift);

      if (isFocus) {
        ctx.shadowColor = hexToRgba(j.corPerfil, 0.85);
        ctx.shadowBlur = 36;
      }
      roundRect(ctx, 0, 0, cw, ch, 22);
      ctx.fillStyle = '#0e172a';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.lineWidth = isFocus ? 5 : 2.5;
      ctx.strokeStyle = j.corPerfil;
      ctx.stroke();

      // Barra superior colorida
      roundRect(ctx, 0, 0, cw, 14, 8);
      ctx.fillStyle = j.corPerfil;
      ctx.fill();

      // Retrato 2.5D Wolvesville enquadrado na direita do card (com foco luminoso quando ativo)
      const portX = cw - 92;
      const portY = 128;
      ctx.save();
      roundRect(ctx, cw - 172, 26, 156, 198, 16);
      const pbg = ctx.createRadialGradient(portX, portY - 12, 10, portX, portY, 115);
      pbg.addColorStop(0, hexToRgba(j.corPerfil, isFocus ? 0.42 : 0.20));
      pbg.addColorStop(1, 'rgba(9,14,26,0.94)');
      ctx.fillStyle = pbg;
      ctx.fill();
      ctx.clip();

      drawAiCharacter(ctx, {
        id: pid,
        nome: j.nome,
        x: portX,
        y: portY + 6,
        size: 162,
        speaking: isFocus,
        voiceAmp: isFocus ? 0.55 : 0,
        frame,
      });

      // Mini leque de 2 cartas semitransparentes na base do retrato
      const pair = sampleHands[globalIdx % sampleHands.length];
      drawUnoCard(ctx, {
        x: portX - 20,
        y: portY + 68,
        w: 44,
        h: 64,
        codigo: pair[0],
        rot: -0.18,
        translucent: true,
        faceAlpha: 0.76,
      });
      drawUnoCard(ctx, {
        x: portX + 20,
        y: portY + 66,
        w: 44,
        h: 64,
        codigo: pair[1],
        rot: 0.16,
        translucent: true,
        faceAlpha: 0.76,
      });
      ctx.restore();

      // Moldura do retrato
      roundRect(ctx, cw - 172, 26, 156, 198, 16);
      ctx.lineWidth = isFocus ? 2.8 : 1.6;
      ctx.strokeStyle = hexToRgba(j.corPerfil, isFocus ? 0.95 : 0.45);
      ctx.stroke();

      // Nome + modelo + empresa + tagline a esquerda
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "PoppinsExtraBold", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(j.nome, 22, 38);

      ctx.fillStyle = j.corPerfil;
      ctx.font = '800 16px "JetBrainsMono", monospace';
      ctx.fillText(j.modelo, 22, 78);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 17px "PoppinsBold", sans-serif';
      ctx.fillText(j.empresa, 22, 110);

      if (j.tagline) {
        // Quebra limpa em ate 2 linhas na coluna esquerda
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 17px "PoppinsBold", sans-serif';
        const maxW = cw - 205;
        const words = String(j.tagline).split(' ');
        const lines = [];
        let cur = '';
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (ctx.measureText(test).width > maxW && cur) {
            lines.push(cur);
            cur = w;
          } else {
            cur = test;
          }
        }
        if (cur) lines.push(cur);
        lines.slice(0, 2).forEach((ln, li) => {
          ctx.fillText(ln, 22, 166 + li * 24);
        });
      }

      // Badge inferior "EM DESTAQUE" quando aceso
      if (isFocus) {
        roundRect(ctx, 22, ch - 46, 148, 28, 9);
        ctx.fillStyle = j.corPerfil;
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 13px "PoppinsExtraBold", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('NA MESA AGORA', 22 + 74, ch - 32);
      }

      ctx.restore();
    });
  });
}

function awardExpression(titulo = '') {
  const t = String(titulo).toUpperCase();
  if (t.includes('TRAIDOR')) return 'ironico';
  if (t.includes('DALT')) return 'sonhadora';
  if (t.includes('REDEN')) return 'rindo';
  if (t.includes('GAR')) return 'chocado';
  return 'rindo';
}

/**
 * Tela de Podio Final + Premios da Temporada + Pergunta pro Publico
 * com os 7 personagens Wolvesville 2.5D no ranking e nos cards de premios!
 */
export function drawPodiumScreen(ctx, { ranking = [], premios = [], pergunta = '', frame = 0 }) {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 1140);
  bg.addColorStop(0, '#172542');
  bg.addColorStop(1, '#050811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fde047';
  ctx.font = '900 54px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLACAR FINAL E PRÊMIOS DO UNO', W / 2, 74);

  // Coluna esquerda: Ranking das 7 IAs com retrato 2.5D Wolvesville
  const lx = 76;
  const lw = 845;
  ranking.slice(0, 7).forEach((r, idx) => {
    const y = 138 + idx * 96;
    const pid = resolvePlayerId(r.id || r.nome);
    const isChamp = idx === 0;

    roundRect(ctx, lx, y, lw, 84, 16);
    ctx.fillStyle = isChamp ? 'rgba(234,179,8,0.18)' : 'rgba(15,23,42,0.90)';
    ctx.fill();
    ctx.lineWidth = isChamp ? 3.5 : 1.6;
    ctx.strokeStyle = isChamp ? '#fde047' : hexToRgba(r.corPerfil, 0.55);
    ctx.stroke();

    // Rank #1..#7
    ctx.fillStyle = isChamp ? '#fde047' : (idx === 1 ? '#e2e8f0' : (idx === 2 ? '#f59e0b' : '#94a3b8'));
    ctx.font = '900 30px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${idx + 1}`, lx + 20, y + 42);

    // Retrato circular 2.5D do personagem
    const avX = lx + 106;
    const avY = y + 42;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, 33, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1220';
    ctx.fill();
    ctx.save();
    ctx.clip();
    drawAiCharacter(ctx, {
      id: pid,
      nome: r.nome,
      x: avX,
      y: avY + 6,
      size: 74,
      expression: isChamp ? 'rindo' : (idx <= 2 ? 'confiante' : (idx >= 5 ? 'culpado' : null)),
      frame,
    });
    ctx.restore();
    ctx.beginPath();
    ctx.arc(avX, avY, 33, 0, Math.PI * 2);
    ctx.lineWidth = isChamp ? 3 : 2;
    ctx.strokeStyle = isChamp ? '#fde047' : r.corPerfil;
    ctx.stroke();
    if (isChamp) {
      drawVectorCrown(ctx, avX, avY - 34, 0.55);
    }
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.nome, lx + 154, y + 30);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px "JetBrainsMono", monospace';
    ctx.fillText(r.detalhe, lx + 154, y + 58);

    ctx.fillStyle = r.corPerfil;
    ctx.font = '900 23px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(r.placar, lx + lw - 22, y + 42);
  });

  // Coluna direita: 4 Premios Especiais da Temporada com retrato 2.5D do vencedor
  const rx = 956;
  const rw = 888;
  premios.slice(0, 4).forEach((p, idx) => {
    const y = 138 + idx * 168;
    const pid = resolvePlayerId(p.id || p.vencedor);
    const pCor = p.cor || '#a855f7';

    roundRect(ctx, rx, y, rw, 150, 18);
    ctx.fillStyle = 'rgba(14,22,40,0.94)';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = pCor;
    ctx.stroke();

    // Retrato 2.5D do premiado no lado direito do card
    const portX = rx + rw - 78;
    const portY = y + 75;
    ctx.save();
    roundRect(ctx, rx + rw - 144, y + 12, 132, 126, 14);
    const pg = ctx.createRadialGradient(portX, portY, 8, portX, portY, 76);
    pg.addColorStop(0, hexToRgba(pCor, 0.34));
    pg.addColorStop(1, 'rgba(8,13,24,0.95)');
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.clip();
    drawAiCharacter(ctx, {
      id: pid,
      nome: p.vencedor,
      x: portX,
      y: portY + 8,
      size: 122,
      expression: awardExpression(p.titulo),
      frame,
    });
    ctx.restore();
    roundRect(ctx, rx + rw - 144, y + 12, 132, 126, 14);
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexToRgba(pCor, 0.72);
    ctx.stroke();

    ctx.fillStyle = pCor;
    ctx.font = '900 21px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(p.titulo.toUpperCase(), rx + 24, y + 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 31px "PoppinsExtraBold", sans-serif';
    ctx.fillText(p.vencedor, rx + 24, y + 52);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 19px "PoppinsBold", sans-serif';
    const maxW = rw - 186;
    const words = String(p.motivo || '').split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    lines.slice(0, 2).forEach((ln, li) => {
      ctx.fillText(ln, rx + 24, y + 96 + li * 23);
    });
  });

  // Faixa inferior: Pergunta pro publico comentar
  roundRect(ctx, 76, H - 146, W - 152, 92, 20);
  ctx.fillStyle = 'rgba(124,58,237,0.28)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#c084fc';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 29px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pergunta, W / 2, H - 100);
}
