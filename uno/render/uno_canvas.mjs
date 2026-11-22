/**
 * UNO das IAs — Renderer Vetorial 2.5D Premium (1920x1080 @ 30 FPS via @napi-rs/canvas)
 *
 * Regras de ouro do canal (CLAUDE.md + MEMORIA_TECNICA.md):
 *  - ZERO emojis (todos os ícones são desenhados em vetor puro: cartas UNO, setas de reverso,
 *    bloqueio, curinga 4 cores, coroa, sirene, selos carimbados).
 *  - Espectador vê TODAS as cartas reais de cada IA na mesa ("SÓ VOCÊ VÊ").
 *  - Câmera viva com deriva lenta sutil + zoom em quem fala/joga + carta voando com spring physics.
 *  - Cartões distintos para PENSAMENTO SECRETO (translúcido + "SÓ VOCÊ VÊ · PENSAMENTO", áudio em eco)
 *    e FALA NA MESA (borda sólida na cor da IA + "NA MESA").
 */

import { COR_HEX } from '../uno_rules.mjs';

export const W = 1920;
export const H = 1080;

// Posições dos 7 assentos ao redor da mesa oval (coordenadas lógicas 1920x1080)
// Deixamos espaço livre embaixo (y=830..1050) para o balão de Fala/Pensamento sem jamais tampar a mesa!
export const ASSENTOS_7 = [
  { x: 255, y: 230, align: 'left' },   // 0: Gemini Hydrogen (topo-esquerda)
  { x: 690, y: 145, align: 'center' }, // 1: Claude Sonnet (topo-centro-esq)
  { x: 1230, y: 145, align: 'center' },// 2: Inkling Mini (topo-centro-dir)
  { x: 1665, y: 230, align: 'right' }, // 3: DeepSeek (topo-direita)
  { x: 1690, y: 545, align: 'right' }, // 4: Qwen 27B (meio-direita)
  { x: 1410, y: 745, align: 'right' }, // 5: GPT-6 Luna (baixo-direita)
  { x: 235, y: 545, align: 'left' },   // 6: GLM Flash (meio-esquerda)
];

export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function hexToRgba(hex, alpha = 1) {
  const clean = (hex || '#ffffff').replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function parseCodigoCarta(codigo) {
  if (!codigo) return { cor: 'Curinga', valor: '?' };
  if (codigo === '+4') return { cor: 'Curinga', valor: '+4' };
  if (codigo === 'CURINGA') return { cor: 'Curinga', valor: 'CURINGA' };
  const [sig, ...rest] = String(codigo).split('-');
  const valor = rest.join('-');
  const map = { V: 'Vermelho', A: 'Azul', G: 'Verde', Y: 'Amarelo' };
  return { cor: map[sig] || 'Curinga', valor: valor || '?' };
}

/**
 * Desenha uma carta UNO vetorial estilizada (zero emoji, 100% nítida em qualquer escala).
 */
export function drawUnoCard(ctx, { x, y, w = 88, h = 132, codigo = 'V-7', rot = 0, faceDown = false, glowColor = null, alpha = 1 }) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Sombra
  ctx.shadowColor = glowColor ? hexToRgba(glowColor, 0.65) : 'rgba(0,0,0,0.48)';
  ctx.shadowBlur = glowColor ? 24 : 12;
  ctx.shadowOffsetY = glowColor ? 0 : 6;

  // Moldura branca externa
  roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.14);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const pad = Math.max(3, w * 0.065);
  const iw = w - pad * 2;
  const ih = h - pad * 2;

  if (faceDown) {
    roundRect(ctx, -iw / 2, -ih / 2, iw, ih, w * 0.1);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Oval vermelho inclinado clássico do verso
    ctx.save();
    ctx.rotate(-0.45);
    ctx.beginPath();
    ctx.ellipse(0, 0, iw * 0.48, ih * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, w * 0.025);
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fde047';
    ctx.font = `900 ${Math.round(w * 0.27)}px "PoppinsExtraBold", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UNO', 0, 1);
    ctx.restore();
    return;
  }

  const { cor, valor } = parseCodigoCarta(codigo);
  const bg = COR_HEX[cor] || '#1e1b4b';

  // Fundo colorido interno
  roundRect(ctx, -iw / 2, -ih / 2, iw, ih, w * 0.1);
  ctx.fillStyle = bg;
  ctx.fill();

  // Gradiente diagonal sutil de brilho
  const grad = ctx.createLinearGradient(-iw / 2, -ih / 2, iw / 2, ih / 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.22)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Oval branco inclinado central
  ctx.save();
  ctx.rotate(-0.42);
  ctx.beginPath();
  ctx.ellipse(0, 0, iw * 0.46, ih * 0.31, 0, 0, Math.PI * 2);
  ctx.fillStyle = cor === 'Curinga' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.restore();

  // Conteúdo central (vetor puro!)
  if (cor === 'Curinga') {
    // 4 quadrantes coloridos do Curinga
    const r = iw * 0.27;
    const cols = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
      ctx.closePath();
      ctx.fillStyle = cols[i];
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(2, w * 0.03);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    if (valor === '+4') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(w * 0.27)}px "PoppinsExtraBold", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+4', 0, 1);
    }
  } else if (valor === 'PULAR') {
    const r = iw * 0.24;
    ctx.strokeStyle = bg;
    ctx.lineWidth = Math.max(3, w * 0.065);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, r * 0.72);
    ctx.lineTo(r * 0.72, -r * 0.72);
    ctx.stroke();
  } else if (valor === 'REVERTER') {
    const r = iw * 0.22;
    ctx.strokeStyle = bg;
    ctx.fillStyle = bg;
    ctx.lineWidth = Math.max(2.5, w * 0.055);
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.85, Math.PI * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.15, Math.PI * 1.05);
    ctx.stroke();
    // Pontas das setas
    ctx.beginPath();
    ctx.moveTo(r + 4, 2);
    ctx.lineTo(r - 7, -6);
    ctx.lineTo(r - 5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r - 4, -2);
    ctx.lineTo(-r + 7, 6);
    ctx.lineTo(-r + 5, -8);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = bg;
    ctx.font = `900 ${Math.round(valor.length > 1 ? w * 0.36 : w * 0.48)}px "PoppinsExtraBold", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(valor, 0, 2);
  }

  // Cantos superior-esquerdo e inferior-direito
  const cornerTxt = valor === 'PULAR' ? 'X' : valor === 'REVERTER' ? 'R' : valor === 'CURINGA' ? 'W' : valor;
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(w * 0.18)}px "PoppinsExtraBold", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(cornerTxt, -iw / 2 + 5, -ih / 2 + 4);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(cornerTxt, iw / 2 - 5, ih / 2 - 3);

  ctx.restore();
}

/**
 * Desenha o fundo completo da mesa oval 2.5D + anel de direção animado + monte + descarte + alerta de bomba.
 */
export function drawUnoTable(ctx, { corAtiva = 'Vermelho', direcao = 1, pilhaCompra = 0, descarteTop = ['V-7'], deckCount = 48, frame = 0, turno = 1, partidaNum = 1, bannerSub = '' }) {
  const activeHex = COR_HEX[corAtiva] || '#3b82f6';

  // 1. Fundo estúdio escuro com halo radial na cor ativa
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.44, 60, W * 0.5, H * 0.44, 1100);
  bg.addColorStop(0, '#132238');
  bg.addColorStop(0.55, '#0b1220');
  bg.addColorStop(1, '#050811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Halo sutil colorido sob a mesa
  const halo = ctx.createRadialGradient(W * 0.5, H * 0.44, 100, W * 0.5, H * 0.44, 640);
  halo.addColorStop(0, hexToRgba(activeHex, 0.20));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // 2. Mesa Oval Principal (madeira escura + feltro esmeralda-petróleo + borda neon da cor ativa)
  const cx = W * 0.5;
  const cy = H * 0.44;
  const rx = 560;
  const ry = 255;

  // Borda externa madeira
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 22;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 26, ry + 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1b2e';
  ctx.fill();
  ctx.restore();

  // Filete neon na cor ativa
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 8, ry + 8, 0, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(activeHex, 0.85);
  ctx.lineWidth = 4;
  ctx.stroke();

  // Feltro interno
  const felt = ctx.createRadialGradient(cx, cy - 30, 40, cx, cy, rx);
  felt.addColorStop(0, '#14383b');
  felt.addColorStop(0.7, '#0d262b');
  felt.addColorStop(1, '#08181d');
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = felt;
  ctx.fill();

  // Linha interna decorativa + setas giratórias do sentido (horário vs anti-horário)
  const spin = (frame * 0.018) * direcao;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = hexToRgba(activeHex, 0.42);
  ctx.lineWidth = 5;
  for (let k = 0; k < 2; k++) {
    const a0 = spin + k * Math.PI;
    const a1 = a0 + Math.PI * 0.55;
    ctx.beginPath();
    ctx.ellipse(0, 0, 215, 132, 0, a0, a1);
    ctx.stroke();
    // Seta na ponta do arco
    const tipAngle = direcao === 1 ? a1 : a0;
    const tx = Math.cos(tipAngle) * 215;
    const ty = Math.sin(tipAngle) * 132;
    const tan = Math.atan2(Math.cos(tipAngle) * 132 * direcao, -Math.sin(tipAngle) * 215 * direcao);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tan);
    ctx.fillStyle = activeHex;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 3. Monte de Compra (esquerda do centro)
  for (let i = 3; i >= 0; i--) {
    drawUnoCard(ctx, { x: cx - 105 - i * 2, y: cy - i * 2, w: 108, h: 162, faceDown: true });
  }
  // Contador do monte
  roundRect(ctx, cx - 150, cy + 92, 90, 28, 10);
  ctx.fillStyle = 'rgba(15,23,42,0.88)';
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 15px "JetBrainsMono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`MONTE ${deckCount}`, cx - 105, cy + 106);

  // 4. Pilha de Descarte (direita do centro)
  const hist = descarteTop.slice(-4);
  hist.forEach((cod, i) => {
    const isTop = i === hist.length - 1;
    const angle = isTop ? 0.04 : ((i - 1.5) * 0.16);
    drawUnoCard(ctx, {
      x: cx + 92 + (isTop ? 0 : (i - 1) * 5),
      y: cy + (isTop ? 0 : (i - 1) * 3),
      w: 118,
      h: 176,
      codigo: cod,
      rot: angle,
      glowColor: isTop ? activeHex : null,
    });
  });

  // Pill de Cor Ativa abaixo do descarte
  roundRect(ctx, cx + 22, cy + 98, 140, 32, 16);
  ctx.fillStyle = activeHex;
  ctx.fill();
  ctx.fillStyle = corAtiva === 'Amarelo' ? '#0f172a' : '#ffffff';
  ctx.font = '800 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(corAtiva.toUpperCase(), cx + 92, cy + 114);

  // 5. Alerta de Bomba Acumulada (+2, +4, +6, +8...)
  if (pilhaCompra > 0) {
    const pulse = 1 + Math.sin(frame * 0.35) * 0.08;
    ctx.save();
    ctx.translate(cx, cy - 165);
    ctx.scale(pulse, pulse);
    roundRect(ctx, -110, -34, 220, 68, 18);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`BOMBA +${pilhaCompra}!`, 0, 2);
    ctx.restore();
  }

  // 6. Top-Left HUD minimalista (sempre livre de colisão)
  roundRect(ctx, 28, 22, 430, 56, 14);
  ctx.fillStyle = 'rgba(10,15,28,0.86)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fde047';
  ctx.font = '900 20px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`UNO DAS IAs · PARTIDA ${partidaNum}`, 46, 42);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px "JetBrainsMono", monospace';
  ctx.fillText(`TURNO ${turno} · ${direcao === 1 ? 'HORÁRIO' : 'ANTI-HORÁRIO'}${bannerSub ? ` · ${bannerSub}` : ''}`, 46, 64);

  // Selo "SÓ VOCÊ VÊ · CARTAS REAIS" no topo direito
  roundRect(ctx, W - 320, 22, 292, 40, 12);
  ctx.fillStyle = 'rgba(124,58,237,0.88)';
  ctx.fill();
  ctx.strokeStyle = '#e9d5ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SÓ VOCÊ VÊ · MÃOS REAIS', W - 174, 42);
}

/**
 * Desenha o assento de uma IA com sua placa, contagem de cartas, status UNO e leque de cartas REAIS!
 */
export function drawPlayerSeat(ctx, { jogador, seat, isActive = false, frame = 0 }) {
  const { x, y } = seat;
  const cor = jogador.corPerfil || '#3b82f6';
  const nCartas = jogador.mao.length;

  ctx.save();
  // Placa da IA
  const pw = 250;
  const ph = 56;
  const px = x - pw / 2;
  const py = y - 82;

  if (isActive) {
    ctx.shadowColor = hexToRgba(cor, 0.85);
    ctx.shadowBlur = 24;
  }
  roundRect(ctx, px, py, pw, ph, 14);
  ctx.fillStyle = isActive ? 'rgba(15,23,42,0.96)' : 'rgba(12,18,32,0.84)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = isActive ? 3.5 : 1.8;
  ctx.strokeStyle = isActive ? cor : hexToRgba(cor, 0.5);
  ctx.stroke();

  // Bolinha colorida da IA
  ctx.beginPath();
  ctx.arc(px + 24, py + ph / 2, 11, 0, Math.PI * 2);
  ctx.fillStyle = cor;
  ctx.fill();

  // Nome da IA
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 19px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(jogador.nome, px + 44, py + 22);

  // Modelo / Empresa em subtítulo discreto
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px "JetBrainsMono", monospace';
  ctx.fillText(jogador.modelo, px + 44, py + 41);

  // Badge contagem de cartas
  roundRect(ctx, px + pw - 50, py + 11, 40, 34, 10);
  ctx.fillStyle = nCartas <= 2 ? '#dc2626' : '#1e293b';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 19px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(nCartas), px + pw - 30, py + 29);

  // Badge UNO! ou ESQUECEU O UNO!
  if (nCartas === 1) {
    const pulse = 1 + Math.sin(frame * 0.35) * 0.08;
    ctx.save();
    ctx.translate(x, py - 18);
    ctx.scale(pulse, pulse);
    const txt = jogador.gritouUno ? 'GRITOU UNO!' : 'ESQUECEU O UNO!';
    const bw = jogador.gritouUno ? 132 : 178;
    roundRect(ctx, -bw / 2, -14, bw, 28, 10);
    ctx.fillStyle = jogador.gritouUno ? '#eab308' : '#dc2626';
    ctx.fill();
    ctx.fillStyle = jogador.gritouUno ? '#0f172a' : '#ffffff';
    ctx.font = '900 14px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, 1);
    ctx.restore();
  }

  // Leque de cartas REAIS visíveis pro público ("SÓ VOCÊ VÊ")
  const maxShow = Math.min(nCartas, 9);
  const cardW = maxShow > 7 ? 48 : 56;
  const cardH = Math.round(cardW * 1.48);
  const spacing = maxShow > 7 ? 26 : 33;
  const totalW = (maxShow - 1) * spacing;

  for (let i = 0; i < maxShow; i++) {
    const cod = jogador.mao[i];
    const cx = x - totalW / 2 + i * spacing;
    const norm = maxShow > 1 ? (i / (maxShow - 1)) - 0.5 : 0;
    const cy = y + 20 + Math.abs(norm) * 14;
    drawUnoCard(ctx, {
      x: cx,
      y: cy,
      w: cardW,
      h: cardH,
      codigo: cod,
      rot: norm * 0.24,
    });
  }
  if (nCartas > maxShow) {
    roundRect(ctx, x + totalW / 2 + 12, y + 8, 44, 26, 8);
    ctx.fillStyle = 'rgba(15,23,42,0.92)';
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = '800 13px "JetBrainsMono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${nCartas - maxShow}`, x + totalW / 2 + 34, y + 21);
  }

  ctx.restore();
}

/**
 * Desenha o cartão de FALA NA MESA ou PENSAMENTO SECRETO (parte inferior central, sem tampar a mesa!).
 */
export function drawDialogueCard(ctx, { nome, corPerfil = '#3b82f6', texto = '', modo = 'fala', voiceAmp = 0.5 }) {
  if (!texto) return;
  const isThought = modo === 'pensamento';
  const cw = 1120;
  const ch = 152;
  const x = (W - cw) / 2;
  const y = H - ch - 34;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 28;
  roundRect(ctx, x, y, cw, ch, 22);
  ctx.fillStyle = isThought ? 'rgba(30,22,58,0.90)' : 'rgba(10,16,30,0.95)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = isThought ? '#c084fc' : corPerfil;
  if (isThought) ctx.setLineDash([12, 7]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tag superior (quem está falando/pensando)
  const tagTxt = isThought ? `SÓ VOCÊ VÊ · PENSAMENTO DE ${nome.toUpperCase()}` : `${nome.toUpperCase()} NA MESA`;
  roundRect(ctx, x + 24, y - 18, Math.min(540, tagTxt.length * 11 + 42), 34, 12);
  ctx.fillStyle = isThought ? '#7e22ce' : corPerfil;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagTxt, x + 42, y - 1);

  // Mini barras de áudio animadas pelo voiceAmp real
  for (let b = 0; b < 5; b++) {
    const bh = 8 + Math.round(voiceAmp * 26 * (0.55 + 0.45 * Math.sin(b * 1.4 + voiceAmp * 12)));
    ctx.fillStyle = isThought ? '#e9d5ff' : corPerfil;
    roundRect(ctx, x + cw - 78 + b * 11, y + ch / 2 - bh / 2, 6, bh, 3);
    ctx.fill();
  }

  // Quebra de linha limpa do texto PT-BR
  ctx.fillStyle = isThought ? '#f3e8ff' : '#f8fafc';
  ctx.font = `${isThought ? 'italic ' : ''}700 28px "PoppinsBold", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const maxTextW = cw - 125;
  const words = String(texto).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxTextW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  const shown = lines.slice(0, 3);
  const startY = y + (ch - shown.length * 38) / 2 + 4;
  shown.forEach((ln, idx) => {
    ctx.fillText(ln, x + 32, startY + idx * 38);
  });

  ctx.restore();
}
