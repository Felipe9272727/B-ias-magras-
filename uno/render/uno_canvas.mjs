/**
 * UNO das IAs — Renderer Vetorial 2.5D Premium (1920x1080 @ 30 FPS via @napi-rs/canvas)
 *
 * Regras de ouro do canal (CLAUDE.md + MEMORIA_TECNICA.md):
 *  - ZERO emojis (todos os icones e personagens sao desenhados em vetor puro Canvas 2D).
 *  - 7 personagens ilustrados 2.5D inspirados em Wolvesville (contornos escuros nitidos,
 *    cel-shading em 2 tons, piscada automatica, lip-sync real via voiceAmp, reacoes de
 *    pensamento, choque de bomba +4/+6 e triunfo de UNO!).
 *  - Espectador ve TODAS as cartas reais de cada IA seguradas em leque semitransparente
 *    a frente do personagem ("SO VOCE VE") com valores 100% opacos e nitidos ate 12 cartas.
 *  - Mesa 2.5D inclinada com borda de madeira em relevo, feltro iluminado, cone de foco
 *    no jogador ativo e assentos com profundidade real.
 */

import { COR_HEX } from '../uno_rules.mjs';

export const W = 1920;
export const H = 1080;

// Posicoes 2.5D dos 7 assentos ao redor da mesa oval (coordenadas logicas 1920x1080).
// Preserva zona livre inferior (y ~ 835..1055) para o cartao de fala/pensamento e
// zona livre lateral direita (x >= 1490, y >= 680) para caixas de meme!
export const ASSENTOS_7 = [
  { x: 245,  y: 252, align: 'left',   scale: 0.92, depth: 1, facing:  1 }, // 0: Gemini Hydrogen (topo-esquerda)
  { x: 685,  y: 164, align: 'center', scale: 0.88, depth: 0, facing:  0.3 }, // 1: Claude Sonnet (topo-centro-esq)
  { x: 1235, y: 164, align: 'center', scale: 0.88, depth: 0, facing: -0.3 }, // 2: Inkling Mini (topo-centro-dir)
  { x: 1675, y: 252, align: 'right',  scale: 0.92, depth: 1, facing: -1 }, // 3: DeepSeek (topo-direita)
  { x: 1696, y: 516, align: 'right',  scale: 0.98, depth: 2, facing: -1 }, // 4: Qwen 27B (meio-direita, acima do meme box)
  { x: 1285, y: 720, align: 'center', scale: 1.02, depth: 3, facing: -0.4 }, // 5: GPT-6 Luna (baixo-centro-dir, livre de meme e dialogo)
  { x: 242,  y: 562, align: 'left',   scale: 0.98, depth: 2, facing:  1 }, // 6: GLM Flash (meio-esquerda)
];

const OUTLINE = '#161124';

// =============================================================================
// PERFIS VISUAIS WOLVESVILLE 2.5D DAS 7 IAs
// =============================================================================
export const AI_CHARACTERS = {
  hydrogen: {
    id: 'hydrogen',
    cor: '#3b82f6',
    pele: '#f5cfa8',
    sombra: '#dba478',
    cabelo: '#1b2646',
    cabeloHi: '#38bdf8',
    estiloCabelo: 'spiky-sweep',
    roupa: '#2563eb',
    roupa2: '#0f172a',
    detalhe: '#38bdf8',
    gola: 'hoodie-tech',
    acessorio: 'visor',
    pin: 'twin-star',
    defaultExpr: 'confiante',
    seed: 17,
    scaleMod: 1.0,
  },
  sonnet: {
    id: 'sonnet',
    cor: '#f59e0b',
    pele: '#f8d7ba',
    sombra: '#deb18d',
    cabelo: '#5b3720',
    cabeloHi: '#9a643d',
    estiloCabelo: 'scholar-part',
    roupa: '#b45309',
    roupa2: '#fef3c7',
    detalhe: '#f59e0b',
    gola: 'scarf-waistcoat',
    acessorio: 'round-glasses',
    pin: null,
    defaultExpr: 'ironico',
    seed: 41,
    scaleMod: 1.0,
  },
  inkling: {
    id: 'inkling',
    cor: '#a855f7',
    pele: '#ffe1c6',
    sombra: '#e8b691',
    cabelo: '#3b165e',
    cabeloHi: '#c084fc',
    estiloCabelo: 'messy-tufts',
    roupa: '#7e22ce',
    roupa2: '#f3e8ff',
    detalhe: '#e879f9',
    gola: 'ink-scarf',
    acessorio: 'beret',
    pin: 'ink-splat',
    bochecha: true,
    defaultExpr: 'travesso',
    seed: 67,
    scaleMod: 0.96,
  },
  deepseek: {
    id: 'deepseek',
    cor: '#06b6d4',
    pele: '#efd0b4',
    sombra: '#d1ac8b',
    cabelo: '#111b29',
    cabeloHi: '#22d3ee',
    estiloCabelo: 'sharp-fringe',
    roupa: '#164e63',
    roupa2: '#083344',
    detalhe: '#22d3ee',
    gola: 'tactical-coat',
    acessorio: 'earpiece',
    pin: 'chevron',
    defaultExpr: 'focado',
    seed: 89,
    scaleMod: 1.0,
  },
  qwen: {
    id: 'qwen',
    cor: '#ec4899',
    pele: '#e7b792',
    sombra: '#ca936c',
    cabelo: '#241428',
    cabeloHi: '#f472b6',
    estiloCabelo: 'stylish-wave',
    roupa: '#db2777',
    roupa2: '#1f162a',
    detalhe: '#f9a8d4',
    gola: 'bomber-collar',
    acessorio: 'headphones',
    pin: null,
    bochecha: true,
    defaultExpr: 'competitivo',
    seed: 113,
    scaleMod: 1.0,
  },
  luna: {
    id: 'luna',
    cor: '#10b981',
    pele: '#f7d8c0',
    sombra: '#ddb295',
    cabelo: '#113a33',
    cabeloHi: '#34d399',
    estiloCabelo: 'long-flow',
    roupa: '#047857',
    roupa2: '#a7f3d0',
    detalhe: '#fde047',
    gola: 'emerald-cloak',
    acessorio: 'crescent-clip',
    pin: 'crescent',
    bochecha: true,
    defaultExpr: 'sonhadora',
    seed: 149,
    scaleMod: 1.0,
  },
  glm: {
    id: 'glm',
    cor: '#ef4444',
    pele: '#d89a72',
    sombra: '#b67a54',
    cabelo: '#291114',
    cabeloHi: '#f87171',
    estiloCabelo: 'wild-spikes',
    roupa: '#b91c1c',
    roupa2: '#1f1622',
    detalhe: '#fbbf24',
    gola: 'crimson-cape',
    acessorio: 'lightning-band',
    pin: 'lightning',
    defaultExpr: 'intenso',
    seed: 179,
    scaleMod: 1.02,
  },
};

export function resolvePlayerId(idOrName) {
  if (!idOrName) return 'hydrogen';
  const raw = String(idOrName).trim().toLowerCase();
  if (AI_CHARACTERS[raw]) return raw;
  if (raw.includes('hydrogen') || raw.includes('gemini')) return 'hydrogen';
  if (raw.includes('sonnet') || raw.includes('claude')) return 'sonnet';
  if (raw.includes('inkling')) return 'inkling';
  if (raw.includes('deepseek')) return 'deepseek';
  if (raw.includes('qwen')) return 'qwen';
  if (raw.includes('luna') || raw.includes('gpt')) return 'luna';
  if (raw.includes('glm')) return 'glm';
  return 'hydrogen';
}

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

function drawFourPointStar(ctx, cx, cy, rOuter, rInner, fill) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawVectorCrown(ctx, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-22, 12);
  ctx.lineTo(-26, -12);
  ctx.lineTo(-10, -2);
  ctx.lineTo(0, -20);
  ctx.lineTo(10, -2);
  ctx.lineTo(26, -12);
  ctx.lineTo(22, 12);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -20, 0, 12);
  g.addColorStop(0, '#fef08a');
  g.addColorStop(0.55, '#eab308');
  g.addColorStop(1, '#b45309');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();

  // Joias da coroa
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 3, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-12, 4, 2.6, 0, Math.PI * 2);
  ctx.arc(12, 4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =============================================================================
// DESENHO DOS 7 PERSONAGENS WOLVESVILLE 2.5D (VETOR PURO CANVAS 2D)
// =============================================================================

function drawHairBack(ctx, ch) {
  ctx.save();
  ctx.fillStyle = ch.cabelo;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';

  if (ch.estiloCabelo === 'long-flow') {
    ctx.beginPath();
    ctx.moveTo(46, 86);
    ctx.quadraticCurveTo(42, 34, 100, 32);
    ctx.quadraticCurveTo(158, 34, 154, 86);
    ctx.lineTo(162, 166);
    ctx.quadraticCurveTo(100, 180, 38, 166);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (ch.estiloCabelo === 'stylish-wave') {
    ctx.beginPath();
    ctx.moveTo(48, 84);
    ctx.quadraticCurveTo(46, 36, 100, 34);
    ctx.quadraticCurveTo(154, 36, 152, 84);
    ctx.quadraticCurveTo(162, 126, 150, 154);
    ctx.quadraticCurveTo(100, 166, 50, 154);
    ctx.quadraticCurveTo(38, 126, 48, 84);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (ch.estiloCabelo === 'wild-spikes') {
    ctx.beginPath();
    ctx.moveTo(46, 98);
    ctx.lineTo(32, 74);
    ctx.lineTo(48, 66);
    ctx.lineTo(40, 38);
    ctx.lineTo(66, 48);
    ctx.lineTo(78, 22);
    ctx.lineTo(100, 38);
    ctx.lineTo(122, 20);
    ctx.lineTo(132, 46);
    ctx.lineTo(160, 36);
    ctx.lineTo(152, 66);
    ctx.lineTo(168, 76);
    ctx.lineTo(154, 98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (ch.estiloCabelo === 'messy-tufts') {
    ctx.beginPath();
    ctx.moveTo(46, 98);
    ctx.quadraticCurveTo(38, 60, 62, 44);
    ctx.quadraticCurveTo(100, 30, 138, 44);
    ctx.quadraticCurveTo(162, 60, 154, 98);
    ctx.quadraticCurveTo(160, 124, 146, 134);
    ctx.lineTo(54, 134);
    ctx.quadraticCurveTo(40, 124, 46, 98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawOutfit(ctx, ch) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Silhueta principal dos ombros/busto (estilo Wolvesville robusto com contorno nitido)
  ctx.beginPath();
  ctx.moveTo(16, 202);
  ctx.quadraticCurveTo(20, 154, 66, 144);
  ctx.lineTo(134, 144);
  ctx.quadraticCurveTo(180, 154, 184, 202);
  ctx.closePath();
  ctx.fillStyle = ch.roupa;
  ctx.fill();

  // Cel-shading lateral direito da roupa + brilho suave topo esquerdo
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.moveTo(116, 140);
  ctx.lineTo(190, 140);
  ctx.lineTo(190, 206);
  ctx.lineTo(130, 206);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(52, 160, 30, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Detalhes especificos por personagem
  if (ch.gola === 'hoodie-tech') {
    // Faixas escuras nos ombros + ziper central + faixas ciano
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(16, 198);
    ctx.lineTo(54, 150);
    ctx.lineTo(66, 144);
    ctx.lineTo(44, 202);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(184, 198);
    ctx.lineTo(146, 150);
    ctx.lineTo(134, 144);
    ctx.lineTo(156, 202);
    ctx.closePath();
    ctx.fill();
    // Gola alta tech
    ctx.beginPath();
    ctx.moveTo(72, 144);
    ctx.lineTo(100, 174);
    ctx.lineTo(128, 144);
    ctx.lineTo(124, 158);
    ctx.lineTo(100, 184);
    ctx.lineTo(76, 158);
    ctx.closePath();
    ctx.fillStyle = ch.detalhe;
    ctx.fill();
    // Ziper
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 174);
    ctx.lineTo(100, 202);
    ctx.stroke();
    // Twin-star Gemini pin
    drawFourPointStar(ctx, 134, 173, 7, 2.5, '#fef08a');
    drawFourPointStar(ctx, 145, 166, 4.5, 1.8, '#38bdf8');
  } else if (ch.gola === 'scarf-waistcoat') {
    // Camisa creme em V + colete ambar + botoes
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(78, 144);
    ctx.lineTo(100, 192);
    ctx.lineTo(122, 144);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Botoes do colete
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(100, 188, 3.2, 0, Math.PI * 2);
    ctx.fill();
    // Cachecol terracota enrolado + ponta caindo
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
    roundRect(ctx, 64, 138, 72, 22, 10);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(116, 155);
    ctx.lineTo(136, 155);
    ctx.lineTo(140, 196);
    ctx.lineTo(114, 192);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Listras no cachecol
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(117, 178);
    ctx.lineTo(138, 180);
    ctx.moveTo(116, 185);
    ctx.lineTo(138, 187);
    ctx.stroke();
  } else if (ch.gola === 'ink-scarf') {
    // Cachecol branco/lilas respingado de tinta roxa e magenta
    ctx.fillStyle = ch.roupa2;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3;
    roundRect(ctx, 62, 138, 76, 24, 11);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(72, 158);
    ctx.lineTo(94, 158);
    ctx.lineTo(86, 196);
    ctx.lineTo(62, 192);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Respingos vetoriais de tinta
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(82, 149, 4.5, 0, Math.PI * 2);
    ctx.arc(118, 151, 3.5, 0, Math.PI * 2);
    ctx.arc(76, 176, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(103, 148, 3.2, 0, Math.PI * 2);
    ctx.arc(83, 184, 2.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (ch.gola === 'tactical-coat') {
    // Sobretudo tatico de gola alta com forro ciano e fecho chevron
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(64, 142);
    ctx.lineTo(100, 188);
    ctx.lineTo(136, 142);
    ctx.lineTo(148, 202);
    ctx.lineTo(52, 202);
    ctx.closePath();
    ctx.fill();
    // Lapelas ciano estrategista
    ctx.fillStyle = ch.detalhe;
    ctx.beginPath();
    ctx.moveTo(62, 144);
    ctx.lineTo(82, 144);
    ctx.lineTo(100, 176);
    ctx.lineTo(74, 170);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(138, 144);
    ctx.lineTo(118, 144);
    ctx.lineTo(100, 176);
    ctx.lineTo(126, 170);
    ctx.closePath();
    ctx.fill();
    // Chevron tatico no peito
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(126, 184);
    ctx.lineTo(136, 178);
    ctx.lineTo(146, 184);
    ctx.stroke();
  } else if (ch.gola === 'bomber-collar') {
    // Camiseta escura central + jaqueta bomber magenta com faixas
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(76, 144);
    ctx.lineTo(124, 144);
    ctx.lineTo(120, 202);
    ctx.lineTo(80, 202);
    ctx.closePath();
    ctx.fill();
    // Gola bomber listrada
    ctx.strokeStyle = ch.detalhe;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(66, 148);
    ctx.quadraticCurveTo(100, 166, 134, 148);
    ctx.stroke();
    // Listras de manga
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(46, 162);
    ctx.lineTo(34, 198);
    ctx.moveTo(154, 162);
    ctx.lineTo(166, 198);
    ctx.stroke();
  } else if (ch.gola === 'emerald-cloak') {
    // Manto esmeralda com barra menta + emblema de lua crescente dourada
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(56, 146);
    ctx.quadraticCurveTo(100, 182, 144, 146);
    ctx.lineTo(140, 160);
    ctx.quadraticCurveTo(100, 194, 60, 160);
    ctx.closePath();
    ctx.fill();
    // Broche circular + lua crescente dourada
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(100, 171, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(99, 171, 6.2, 0.45, Math.PI * 2 - 0.45);
    ctx.arc(102, 171, 4.8, Math.PI * 2 - 0.55, 0.55, true);
    ctx.closePath();
    ctx.fill();
  } else if (ch.gola === 'crimson-cape') {
    // Tunica escura interna + capa dramatica carmesim com gola alta + fecho raio dourado
    ctx.fillStyle = ch.roupa2;
    ctx.beginPath();
    ctx.moveTo(76, 144);
    ctx.lineTo(124, 144);
    ctx.lineTo(116, 202);
    ctx.lineTo(84, 202);
    ctx.closePath();
    ctx.fill();
    // Borda dourada da capa
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(64, 146);
    ctx.lineTo(84, 202);
    ctx.moveTo(136, 146);
    ctx.lineTo(116, 202);
    ctx.stroke();
    // Raio dourado no fecho
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(103, 158);
    ctx.lineTo(94, 172);
    ctx.lineTo(101, 172);
    ctx.lineTo(97, 186);
    ctx.lineTo(107, 170);
    ctx.lineTo(100, 170);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Contorno Wolvesville limpo da silhueta da roupa
  ctx.beginPath();
  ctx.moveTo(16, 202);
  ctx.quadraticCurveTo(20, 154, 66, 144);
  ctx.lineTo(134, 144);
  ctx.quadraticCurveTo(180, 154, 184, 202);
  ctx.closePath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();

  // Gola alta pontuda por cima para GLM (capa dramatica) e DeepSeek (tactical coat)
  if (ch.gola === 'crimson-cape') {
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(58, 146);
    ctx.lineTo(44, 118);
    ctx.lineTo(74, 138);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(142, 146);
    ctx.lineTo(156, 118);
    ctx.lineTo(126, 138);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (ch.gola === 'tactical-coat') {
    ctx.fillStyle = '#164e63';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(64, 146);
    ctx.lineTo(54, 126);
    ctx.lineTo(80, 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(136, 146);
    ctx.lineTo(146, 126);
    ctx.lineTo(120, 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawHairFront(ctx, ch) {
  ctx.save();
  ctx.fillStyle = ch.cabelo;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3.6;
  ctx.lineJoin = 'round';

  if (ch.estiloCabelo === 'spiky-sweep') {
    ctx.beginPath();
    ctx.moveTo(50, 92);
    ctx.quadraticCurveTo(48, 42, 98, 38);
    ctx.quadraticCurveTo(150, 40, 150, 92);
    ctx.quadraticCurveTo(142, 68, 126, 62);
    ctx.lineTo(118, 76);
    ctx.lineTo(106, 58);
    ctx.lineTo(88, 76);
    ctx.lineTo(78, 60);
    ctx.quadraticCurveTo(58, 68, 50, 92);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mecha de destaque ciano
    ctx.fillStyle = ch.cabeloHi;
    ctx.beginPath();
    ctx.moveTo(86, 46);
    ctx.quadraticCurveTo(102, 42, 112, 54);
    ctx.quadraticCurveTo(98, 52, 86, 46);
    ctx.fill();
  } else if (ch.estiloCabelo === 'scholar-part') {
    ctx.beginPath();
    ctx.moveTo(50, 94);
    ctx.quadraticCurveTo(48, 44, 100, 40);
    ctx.quadraticCurveTo(152, 44, 150, 94);
    ctx.quadraticCurveTo(142, 68, 118, 64);
    ctx.quadraticCurveTo(86, 62, 66, 78);
    ctx.quadraticCurveTo(56, 84, 50, 94);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ch.cabeloHi;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(74, 52);
    ctx.quadraticCurveTo(100, 48, 124, 56);
    ctx.stroke();
  } else if (ch.estiloCabelo === 'messy-tufts') {
    ctx.beginPath();
    ctx.moveTo(50, 96);
    ctx.quadraticCurveTo(48, 48, 100, 46);
    ctx.quadraticCurveTo(152, 48, 150, 96);
    ctx.lineTo(138, 70);
    ctx.lineTo(126, 84);
    ctx.lineTo(112, 66);
    ctx.lineTo(98, 84);
    ctx.lineTo(84, 66);
    ctx.lineTo(70, 82);
    ctx.lineTo(60, 72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pontinhas neon violeta
    ctx.fillStyle = ch.cabeloHi;
    ctx.beginPath();
    ctx.moveTo(98, 82);
    ctx.lineTo(92, 70);
    ctx.lineTo(104, 70);
    ctx.closePath();
    ctx.fill();
  } else if (ch.estiloCabelo === 'sharp-fringe') {
    ctx.beginPath();
    ctx.moveTo(50, 92);
    ctx.quadraticCurveTo(48, 42, 100, 38);
    ctx.quadraticCurveTo(152, 42, 150, 92);
    ctx.lineTo(140, 66);
    ctx.lineTo(122, 82);
    ctx.lineTo(112, 62);
    ctx.lineTo(92, 84);
    ctx.lineTo(80, 64);
    ctx.lineTo(60, 74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ch.cabeloHi;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(64, 52);
    ctx.quadraticCurveTo(98, 44, 134, 52);
    ctx.stroke();
  } else if (ch.estiloCabelo === 'stylish-wave') {
    ctx.beginPath();
    ctx.moveTo(50, 98);
    ctx.quadraticCurveTo(48, 44, 100, 40);
    ctx.quadraticCurveTo(152, 44, 150, 98);
    ctx.quadraticCurveTo(140, 64, 114, 62);
    ctx.quadraticCurveTo(84, 62, 62, 84);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mecha estilosa magenta
    ctx.fillStyle = ch.cabeloHi;
    ctx.beginPath();
    ctx.moveTo(60, 78);
    ctx.quadraticCurveTo(72, 60, 92, 58);
    ctx.quadraticCurveTo(78, 70, 64, 84);
    ctx.closePath();
    ctx.fill();
  } else if (ch.estiloCabelo === 'long-flow') {
    ctx.beginPath();
    ctx.moveTo(50, 104);
    ctx.quadraticCurveTo(48, 44, 100, 42);
    ctx.quadraticCurveTo(152, 44, 150, 104);
    ctx.quadraticCurveTo(136, 62, 100, 62);
    ctx.quadraticCurveTo(64, 62, 50, 104);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ch.cabeloHi;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(72, 54);
    ctx.quadraticCurveTo(100, 48, 128, 54);
    ctx.stroke();
  } else if (ch.estiloCabelo === 'wild-spikes') {
    ctx.beginPath();
    ctx.moveTo(50, 90);
    ctx.quadraticCurveTo(50, 44, 100, 40);
    ctx.quadraticCurveTo(150, 44, 150, 90);
    ctx.lineTo(138, 68);
    ctx.lineTo(126, 82);
    ctx.lineTo(114, 64);
    ctx.lineTo(100, 82);
    ctx.lineTo(86, 64);
    ctx.lineTo(74, 82);
    ctx.lineTo(62, 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pontas vermelho-brasa
    ctx.fillStyle = ch.cabeloHi;
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(94, 68);
    ctx.lineTo(106, 68);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawEyesAndBrows(ctx, ch, { expr, blink, facing = 0, frame = 0 }) {
  const eyeY = 100;
  const lookX = expr === 'pensando' ? 4.2 : expr === 'culpado' ? -4 : expr === 'desconfiado' ? 3 : facing * 2.2;
  const lookY = expr === 'pensando' ? -4.5 : expr === 'sonhadora' ? -1.5 : 0.6;
  const isShocked = expr === 'chocado' || expr === 'assustado';
  const isClosed = blink || expr === 'rindo';
  const isHalfLid = expr === 'desconfiado' || expr === 'focado' || expr === 'bravo' || expr === 'sonhadora' || expr === 'ironico' || expr === 'intenso';
  const pupilR = isShocked ? 3.2 : 5.4;

  // Olhos (esquerdo x=80, direito x=120)
  for (const cx of [80, 120]) {
    if (isClosed) {
      ctx.strokeStyle = '#251510';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (expr === 'rindo') {
        ctx.moveTo(cx - 10, eyeY + 2);
        ctx.quadraticCurveTo(cx, eyeY - 9, cx + 10, eyeY + 2);
      } else {
        ctx.moveTo(cx - 10, eyeY);
        ctx.quadraticCurveTo(cx, eyeY + 6, cx + 10, eyeY);
      }
      ctx.stroke();
      continue;
    }

    const ry = isShocked ? 13.5 : 11.5;
    // Esclera branca com contorno fino
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, 10.5, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();

    // Iris sutil na cor da IA + pupila escura + brilho branco
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx + lookX, eyeY + lookY, pupilR + 2.1, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(ch.cor, 0.32);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + lookX, eyeY + lookY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1310';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + lookX + 2.0, eyeY + lookY - 2.0, 2.0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Palpebra superior estilizada (expressao calma/estrategista/sonhadora/brava)
    if (isHalfLid) {
      const lidH = expr === 'sonhadora' ? 9.5 : expr === 'bravo' || expr === 'intenso' ? 8.5 : 7.0;
      ctx.fillStyle = ch.pele;
      ctx.fillRect(cx - 12, eyeY - ry - 2, 24, lidH);
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 11, eyeY - ry - 2 + lidH);
      ctx.lineTo(cx + 11, eyeY - ry - 2 + lidH);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Sobrancelhas grossas expressivas (estilo Wolvesville)
  const browForms = {
    neutro:      [80, 80, 80, 80],
    confiante:   [80, 77, 79, 75],
    ironico:     [82, 83, 75, 79],
    travesso:    [79, 84, 84, 79],
    focado:      [80, 85, 85, 80],
    competitivo: [78, 82, 82, 78],
    sonhadora:   [77, 75, 75, 77],
    intenso:     [78, 88, 88, 78],
    bravo:       [77, 89, 89, 77],
    chocado:     [70, 68, 68, 70],
    assustado:   [75, 70, 70, 75],
    pensando:    [79, 82, 73, 76],
    rindo:       [76, 74, 74, 76],
    desconfiado: [82, 85, 75, 78],
    culpado:     [84, 76, 76, 84],
  };
  const [y1, y2, y3, y4] = browForms[expr] || browForms.neutro;
  ctx.strokeStyle = ch.cabelo;
  ctx.lineWidth = 6.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(68, y1);
  ctx.lineTo(90, y2);
  ctx.moveTo(110, y3);
  ctx.lineTo(132, y4);
  ctx.stroke();

  // Gota de suor animada quando chocado/assustado/culpado
  if (isShocked || expr === 'culpado') {
    const dropY = 72 + ((frame * 0.45) % 10);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(145, dropY);
    ctx.quadraticCurveTo(138, dropY + 11, 145, dropY + 15);
    ctx.quadraticCurveTo(152, dropY + 11, 145, dropY);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(143.5, dropY + 9, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMouth(ctx, { expr, speaking = false, voiceAmp = 0, frame = 0, seed = 0 }) {
  const y = 128;
  const openAmt = speaking
    ? Math.max(0.18, Math.min(1, voiceAmp * 1.45 * (0.72 + 0.28 * Math.abs(Math.sin((frame + seed) * 0.65)))))
    : 0;

  if (openAmt > 0.14 || expr === 'chocado' || expr === 'assustado') {
    const h = expr === 'chocado' && !speaking ? 13.5 : expr === 'assustado' && !speaking ? 9.5 : 4.2 + openAmt * 10.5;
    const w = expr === 'chocado' && !speaking ? 9.5 : 10.5 + openAmt * 4.5;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(100, y + 2, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4f181a';
    ctx.fill();
    ctx.save();
    ctx.clip();
    // Dentes superiores sutis
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(100 - w, y + 2 - h, w * 2, Math.max(2.5, h * 0.34));
    // Lingua
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(100, y + 2 + h * 0.58, w * 0.65, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.strokeStyle = '#6c2420';
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (expr === 'rindo' || expr === 'travesso') {
    ctx.beginPath();
    ctx.moveTo(84, y - 2);
    ctx.quadraticCurveTo(100, y + 17, 116, y - 2);
    ctx.closePath();
    ctx.fillStyle = '#4f181a';
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    // Dentes brancos brilhantes no sorriso travesso
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(87, y - 1);
    ctx.lineTo(113, y - 1);
    ctx.quadraticCurveTo(100, y + 5, 87, y - 1);
    ctx.fill();
  } else if (expr === 'bravo' || expr === 'intenso' || expr === 'culpado') {
    ctx.beginPath();
    ctx.moveTo(88, y + 5);
    ctx.quadraticCurveTo(100, y - 4, 112, y + 5);
    ctx.stroke();
  } else if (expr === 'pensando' || expr === 'focado' || expr === 'desconfiado') {
    ctx.beginPath();
    ctx.moveTo(90, y + 2);
    ctx.lineTo(110, y - 2);
    ctx.stroke();
  } else if (expr === 'ironico' || expr === 'confiante') {
    ctx.beginPath();
    ctx.moveTo(88, y + 2);
    ctx.quadraticCurveTo(102, y + 7, 114, y - 3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(89, y);
    ctx.quadraticCurveTo(100, y + 8, 111, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAccessory(ctx, ch, frame = 0) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (ch.acessorio === 'visor') {
    // Visor cyber translucido futurista (Gemini Hydrogen)
    roundRect(ctx, 62, 86, 76, 26, 9);
    ctx.fillStyle = 'rgba(56,189,248,0.28)';
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    // Borda luminosa superior
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(68, 90);
    ctx.lineTo(132, 90);
    ctx.stroke();
    // Reflexo diagonal
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(74, 108);
    ctx.lineTo(86, 90);
    ctx.stroke();
  } else if (ch.acessorio === 'round-glasses') {
    // Oculos redondos elegantes (Claude Sonnet)
    ctx.fillStyle = 'rgba(254,243,199,0.16)';
    ctx.strokeStyle = '#3b2416';
    ctx.lineWidth = 3.2;
    for (const cx of [80, 120]) {
      ctx.beginPath();
      ctx.arc(cx, 100, 14.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, 100, 10, -2.5, -1.8);
      ctx.stroke();
      ctx.strokeStyle = '#3b2416';
      ctx.lineWidth = 3.2;
    }
    ctx.beginPath();
    ctx.moveTo(94.5, 100);
    ctx.lineTo(105.5, 100);
    ctx.stroke();
  } else if (ch.acessorio === 'beret') {
    // Boina violeta estilosa (Inkling Mini)
    ctx.save();
    ctx.translate(100, 50);
    ctx.rotate(-0.12);
    // Haste da boina
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(-10, -30);
    ctx.stroke();
    // Corpo da boina
    ctx.beginPath();
    ctx.ellipse(2, -4, 54, 21, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#9333ea';
    ctx.fill();
    ctx.lineWidth = 3.8;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    // Brilho superior + respingo magenta na boina
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(-12, -11, 22, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(24, -6, 4.5, 0, Math.PI * 2);
    ctx.arc(32, -1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Faixa inferior da boina
    ctx.beginPath();
    ctx.moveTo(-44, 10);
    ctx.quadraticCurveTo(0, 22, 46, 10);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#581c87';
    ctx.stroke();
    ctx.restore();
  } else if (ch.acessorio === 'earpiece') {
    // Comunicador/scanner tatico ciano na orelha direita (DeepSeek)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.8;
    roundRect(ctx, 144, 92, 13, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(150.5, 101, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(148, 114);
    ctx.quadraticCurveTo(136, 126, 118, 127);
    ctx.stroke();
  } else if (ch.acessorio === 'headphones') {
    // Headphones estilosos magenta/branco (Qwen 27B)
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.arc(100, 92, 54, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(100, 92, 58, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
    // Earcups
    for (const ex of [42, 145]) {
      roundRect(ctx, ex, 84, 15, 34, 7);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.fillStyle = '#fce7f3';
      roundRect(ctx, ex + 4, 92, 7, 18, 3);
      ctx.fill();
    }
  } else if (ch.acessorio === 'crescent-clip') {
    // Presilha de lua crescente dourada no cabelo (GPT-6 Luna)
    ctx.save();
    ctx.translate(132, 66);
    ctx.rotate(0.25);
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0.4, Math.PI * 2 - 0.4);
    ctx.arc(3.8, 0, 6.8, Math.PI * 2 - 0.5, 0.5, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (ch.acessorio === 'lightning-band') {
    // Faixa vermelha e dourada na testa com fitas esvoacando (GLM Flash)
    const flutter = Math.sin(frame * 0.16) * 4;
    // Fitas atras da cabeca
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(148, 72);
    ctx.quadraticCurveTo(168, 66 + flutter, 178, 78 + flutter);
    ctx.lineTo(168, 86 + flutter);
    ctx.quadraticCurveTo(156, 78, 146, 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Faixa frontal
    ctx.beginPath();
    ctx.moveTo(52, 74);
    ctx.quadraticCurveTo(100, 62, 148, 74);
    ctx.lineTo(149, 85);
    ctx.quadraticCurveTo(100, 74, 51, 85);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.stroke();
    // Plaquinha central com raio
    roundRect(ctx, 88, 66, 24, 14, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(102, 68);
    ctx.lineTo(96, 74);
    ctx.lineTo(100, 74);
    ctx.lineTo(98, 79);
    ctx.lineTo(104, 72);
    ctx.lineTo(100, 72);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Desenha um dos 7 personagens 2.5D inspirados em Wolvesville (coordenadas internas 200x200).
 */
export function drawAiCharacter(ctx, {
  id,
  nome,
  x,
  y,
  size = 148,
  expression = null,
  speaking = false,
  thinking = false,
  voiceAmp = 0,
  frame = 0,
  facing = 0,
  crown = false,
}) {
  const pid = resolvePlayerId(id || nome);
  const ch = AI_CHARACTERS[pid] || AI_CHARACTERS.hydrogen;
  const expr = thinking ? 'pensando' : (expression || ch.defaultExpr || 'neutro');
  const blink = expr !== 'chocado' && expr !== 'assustado' && expr !== 'rindo' && ((frame + ch.seed) % 97 < 4);
  const bob = speaking
    ? Math.sin(frame * 0.48) * 2.4 * (0.45 + voiceAmp * 0.7)
    : Math.sin((frame + ch.seed) * 0.075) * 1.8;

  const sc = (size / 200) * (ch.scaleMod || 1);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.translate(-100, -106 + bob);

  // Halo suave de pensamento ou energia de fala atras do busto
  if (thinking) {
    const pulse = 0.24 + 0.1 * Math.sin(frame * 0.18);
    const tg = ctx.createRadialGradient(100, 100, 16, 100, 100, 104);
    tg.addColorStop(0, `rgba(192,132,252,${pulse + 0.18})`);
    tg.addColorStop(1, 'rgba(192,132,252,0)');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(100, 100, 104, 0, Math.PI * 2);
    ctx.fill();
  } else if (speaking) {
    const pulse = 0.20 + voiceAmp * 0.26;
    const sg = ctx.createRadialGradient(100, 104, 18, 100, 104, 104);
    sg.addColorStop(0, hexToRgba(ch.cor, pulse));
    sg.addColorStop(1, hexToRgba(ch.cor, 0));
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(100, 104, 104, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Roupa / Ombros
  drawOutfit(ctx, ch);

  // 2. Cabelo de tras
  drawHairBack(ctx, ch);

  // 3. Pescoco com sombra de cel-shading
  ctx.fillStyle = ch.sombra;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3.5;
  roundRect(ctx, 85, 132, 30, 24, 8);
  ctx.fill();
  ctx.stroke();

  // 4. Orelhas com contorno
  for (const ex of [52, 148]) {
    ctx.beginPath();
    ctx.ellipse(ex, 104, 9.5, 12.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = ch.sombra;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }

  // 5. Cabeca grande estilo Wolvesville (2 tons cel-shading + brilho suave + contorno escuro)
  ctx.beginPath();
  ctx.ellipse(100, 98, 48, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = ch.pele;
  ctx.fill();

  ctx.save();
  ctx.clip();
  // Sombra direita + queixo (2.5D)
  ctx.fillStyle = ch.sombra;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.ellipse(134, 104, 28, 54, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(100, 139, 34, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Brilho suave na bochecha/testa
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.ellipse(78, 76, 16, 10, -0.35, 0, Math.PI * 2);
  ctx.fill();
  // Rubor opcional
  if (ch.bochecha) {
    ctx.fillStyle = 'rgba(255,120,130,0.36)';
    ctx.beginPath();
    ctx.ellipse(70, 117, 9, 5.2, 0, 0, Math.PI * 2);
    ctx.ellipse(130, 117, 9, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Contorno nitido da cabeca
  ctx.beginPath();
  ctx.ellipse(100, 98, 48, 50, 0, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();

  // 6. Cabelo frontal
  drawHairFront(ctx, ch);

  // 7. Olhos e sobrancelhas expressivas
  drawEyesAndBrows(ctx, ch, { expr, blink, facing, frame });

  // 8. Nariz sutil Wolvesville
  ctx.strokeStyle = ch.sombra;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 107);
  ctx.quadraticCurveTo(96, 116, 102, 117);
  ctx.stroke();

  // 9. Boca animada com lip-sync real
  drawMouth(ctx, { expr, speaking, voiceAmp, frame, seed: ch.seed });

  // 10. Acessorios / chapeus / oculos
  drawAccessory(ctx, ch, frame);

  // 11. Gesto de mao no queixo + bolhinhas vetoriais de pensamento quando modo='pensamento'
  if (thinking) {
    // Mao estilizada pensativa no queixo
    ctx.save();
    ctx.fillStyle = ch.pele;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(122, 146, 12, 10, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bolhinhas de pensamento flutuando (vetoriais, zero emoji!)
    const drift = Math.sin(frame * 0.14) * 3;
    const bubbles = [
      { bx: 152, by: 66 + drift * 0.4, r: 5 },
      { bx: 164, by: 52 + drift * 0.7, r: 7.5 },
      { bx: 178, by: 36 + drift, r: 10.5 },
    ];
    for (const b of bubbles) {
      ctx.beginPath();
      ctx.arc(b.bx, b.by, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(233,213,255,0.9)';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#7e22ce';
      ctx.stroke();
    }
    ctx.restore();
  }

  // 12. Coroa vetorial opcional (para #1 no podio ou vencedor!)
  if (crown) {
    drawVectorCrown(ctx, 100, 22, 1.05);
  }

  ctx.restore();
}

// =============================================================================
// CARTA UNO VETORIAL (SOLIDA OU SEMITRANSPARENTE COM VALORES 100% OPACOS!)
// =============================================================================

/**
 * Desenha uma carta UNO vetorial estilizada (zero emoji, 100% nitida em qualquer escala).
 * Quando `translucent: true`, o corpo da carta fica semitransparente (~0.72 alpha) para
 * deixar o personagem/roupa visivel atras, enquanto borda e numeros/simbolos ficam 100% opacos!
 */
export function drawUnoCard(ctx, {
  x,
  y,
  w = 88,
  h = 132,
  codigo = 'V-7',
  rot = 0,
  faceDown = false,
  glowColor = null,
  alpha = 1,
  translucent = false,
  faceAlpha = 0.72,
  rimColor = null,
}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  const bodyAlpha = translucent ? alpha * faceAlpha : alpha;
  const borderAlpha = translucent ? alpha * 0.88 : alpha;
  const pad = Math.max(2.6, w * 0.068);
  const iw = w - pad * 2;
  const ih = h - pad * 2;

  // 1. Sombra + Moldura externa
  ctx.save();
  ctx.globalAlpha = borderAlpha;
  ctx.shadowColor = glowColor ? hexToRgba(glowColor, 0.72) : 'rgba(0,0,0,0.52)';
  ctx.shadowBlur = glowColor ? 22 : (translucent ? 10 : 12);
  ctx.shadowOffsetY = glowColor ? 0 : 5;

  roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.14);
  ctx.fillStyle = translucent ? 'rgba(248,250,252,0.88)' : '#f8fafc';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Contorno externo fino para separar cartas sobrepostas no leque
  ctx.lineWidth = Math.max(1.2, w * 0.024);
  ctx.strokeStyle = rimColor || (translucent ? 'rgba(15,23,42,0.72)' : 'rgba(15,23,42,0.35)');
  ctx.stroke();
  ctx.restore();

  if (faceDown) {
    ctx.save();
    ctx.globalAlpha = alpha;
    roundRect(ctx, -iw / 2, -ih / 2, iw, ih, w * 0.1);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

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
    ctx.restore();
    return;
  }

  const { cor, valor } = parseCodigoCarta(codigo);
  const bg = COR_HEX[cor] || '#1e1b4b';

  // 2. Corpo colorido da carta (semitransparente quando `translucent: true`!)
  ctx.save();
  ctx.globalAlpha = bodyAlpha;
  roundRect(ctx, -iw / 2, -ih / 2, iw, ih, w * 0.1);
  ctx.fillStyle = bg;
  ctx.fill();

  // Gradiente glassmorfico diagonal
  const grad = ctx.createLinearGradient(-iw / 2, -ih / 2, iw / 2, ih / 2);
  grad.addColorStop(0, translucent ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.22)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Borda interna luminosa na cor da carta
  if (translucent) {
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = cor === 'Curinga' ? '#c084fc' : '#ffffff';
    ctx.stroke();
  }

  // Oval branco central (levemente mais opaco para maximo contraste do numero)
  ctx.globalAlpha = translucent ? alpha * 0.84 : alpha;
  ctx.save();
  ctx.rotate(-0.42);
  ctx.beginPath();
  ctx.ellipse(0, 0, iw * 0.45, ih * 0.30, 0, 0, Math.PI * 2);
  ctx.fillStyle = cor === 'Curinga' ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // 3. Simbolos centrais + indices de canto 100% OPACOS (nitidos ate com 11 cartas!)
  ctx.save();
  ctx.globalAlpha = alpha;

  if (cor === 'Curinga') {
    const r = iw * 0.28;
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
    ctx.lineWidth = Math.max(1.8, w * 0.032);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    if (valor === '+4') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.66, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(w * 0.29)}px "PoppinsExtraBold", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+4', 0, 1);
    }
  } else if (valor === 'PULAR') {
    const r = iw * 0.24;
    ctx.strokeStyle = bg;
    ctx.lineWidth = Math.max(2.6, w * 0.072);
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
    ctx.lineWidth = Math.max(2.2, w * 0.06);
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.85, Math.PI * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.15, Math.PI * 1.05);
    ctx.stroke();
    const ah = Math.max(4, w * 0.085);
    ctx.beginPath();
    ctx.moveTo(r + ah * 0.6, 2);
    ctx.lineTo(r - ah, -ah * 0.8);
    ctx.lineTo(r - ah * 0.7, ah);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r - ah * 0.6, -2);
    ctx.lineTo(-r + ah, ah * 0.8);
    ctx.lineTo(-r + ah * 0.7, -ah);
    ctx.closePath();
    ctx.fill();
  } else {
    const numColor = cor === 'Amarelo' ? '#a16207' : bg;
    ctx.fillStyle = numColor;
    ctx.font = `900 ${Math.round(valor.length > 1 ? w * 0.37 : w * 0.49)}px "PoppinsExtraBold", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(valor, 0, 2);
  }

  // Indices de canto com contorno escuro sutil para leitura instantanea mesmo sobrepostas!
  const cornerTxt = valor === 'PULAR' ? 'X' : valor === 'REVERTER' ? 'R' : valor === 'CURINGA' ? 'W' : valor;
  const cornerSize = Math.max(9, Math.round(w * (cornerTxt.length > 1 ? 0.20 : 0.23)));
  ctx.font = `900 ${cornerSize}px "PoppinsExtraBold", sans-serif`;
  ctx.lineWidth = Math.max(2.2, w * 0.045);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(15,23,42,0.88)';
  ctx.fillStyle = '#ffffff';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.strokeText(cornerTxt, -iw / 2 + 3.5, -ih / 2 + 3);
  ctx.fillText(cornerTxt, -iw / 2 + 3.5, -ih / 2 + 3);

  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.strokeText(cornerTxt, iw / 2 - 3.5, ih / 2 - 2);
  ctx.fillText(cornerTxt, iw / 2 - 3.5, ih / 2 - 2);

  ctx.restore();
  ctx.restore();
}

// =============================================================================
// MESA OVAL 2.5D PREMIUM COM RELEVO DE MADEIRA, LUZ DE TETO E CONE DE FOCO
// =============================================================================

export function drawUnoTable(ctx, {
  corAtiva = 'Vermelho',
  direcao = 1,
  pilhaCompra = 0,
  descarteTop = ['V-7'],
  deckCount = 48,
  frame = 0,
  turno = 1,
  partidaNum = 1,
  bannerSub = '',
  activeSeat = null,
  activeColor = null,
}) {
  const activeHex = COR_HEX[corAtiva] || '#3b82f6';
  const cx = W * 0.5;
  const cy = H * 0.445;
  const rx = 550;
  const ry = 246;

  // 1. Fundo estudio lounge escuro com profundidade arquitetonica + halo da cor ativa (overscan contra pan/zoom)
  const bg = ctx.createRadialGradient(cx, cy - 80, 60, cx, cy, 1380);
  bg.addColorStop(0, '#162540');
  bg.addColorStop(0.5, '#0b1324');
  bg.addColorStop(1, '#04070f');
  ctx.fillStyle = bg;
  ctx.fillRect(-260, -160, W + 520, H + 320);

  // Linhas sutis de perspectiva do chao/estudio estendidas alem da area de overscan
  ctx.save();
  ctx.strokeStyle = 'rgba(148,163,184,0.045)';
  ctx.lineWidth = 1.5;
  const topY = -180;
  const botY = H + 180;
  const topFactor = 0.45 + 0.55 * (topY / H);
  const botFactor = 0.45 + 0.55 * (botY / H);
  for (let gx = -2600; gx <= W + 2600; gx += 160) {
    ctx.beginPath();
    ctx.moveTo(cx + (gx - cx) * topFactor, topY);
    ctx.lineTo(cx + (gx - cx) * botFactor, botY);
    ctx.stroke();
  }
  ctx.restore();

  // Cone de luminaria suspensa central (iluminacao dramatica de mesa de cartas)
  const lamp = ctx.createRadialGradient(cx, cy - 110, 30, cx, cy, 860);
  lamp.addColorStop(0, 'rgba(255,246,214,0.09)');
  lamp.addColorStop(0.55, hexToRgba(activeHex, 0.14));
  lamp.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(-260, -160, W + 520, H + 320);

  // 2. Sombra projetada da mesa no piso 2.5D
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 46, rx + 58, ry + 42, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.fill();
  ctx.restore();

  // 3. Espessura 3D da saia de madeira (extrusao inferior para volume real!)
  const apronGrad = ctx.createLinearGradient(cx - rx - 34, cy, cx + rx + 34, cy);
  apronGrad.addColorStop(0, '#170d12');
  apronGrad.addColorStop(0.25, '#3b2119');
  apronGrad.addColorStop(0.5, '#4c2c21');
  apronGrad.addColorStop(0.75, '#361e17');
  apronGrad.addColorStop(1, '#140b10');
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, rx + 34, ry + 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = apronGrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#0d070a';
  ctx.stroke();

  // 4. Borda superior de madeira polida (bevel 2.5D)
  const woodGrad = ctx.createLinearGradient(cx, cy - ry - 30, cx, cy + ry + 30);
  woodGrad.addColorStop(0, '#5a3627');
  woodGrad.addColorStop(0.45, '#3a221a');
  woodGrad.addColorStop(1, '#221310');
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 32, ry + 28, 0, 0, Math.PI * 2);
  ctx.fillStyle = woodGrad;
  ctx.fill();

  // Brilho especular na quina superior da madeira
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 30, ry + 26, 0, Math.PI * 1.12, Math.PI * 1.88);
  ctx.strokeStyle = 'rgba(255,224,185,0.28)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Contorno externo nitido da mesa
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 32, ry + 28, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#120a0d';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 5. Filete LED neon na cor ativa (com pulso sutil)
  const ledPulse = 0.78 + 0.22 * Math.sin(frame * 0.1);
  ctx.save();
  ctx.shadowColor = hexToRgba(activeHex, 0.8);
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 8, ry + 8, 0, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(activeHex, ledPulse);
  ctx.lineWidth = 4.5;
  ctx.stroke();
  ctx.restore();

  // 6. Feltro interno com gradiente de luminaria + textura sutil + sombra da borda
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  const felt = ctx.createRadialGradient(cx, cy - 42, 35, cx, cy, rx * 1.04);
  felt.addColorStop(0, '#1a4c4f');
  felt.addColorStop(0.55, '#103237');
  felt.addColorStop(0.88, '#091f24');
  felt.addColorStop(1, '#051216');
  ctx.fillStyle = felt;
  ctx.fill();

  // Trama sutil do feltro (linhas finissimas de baixa opacidade)
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let d = -rx - ry; d < rx + ry; d += 26) {
    ctx.beginPath();
    ctx.moveTo(cx + d, cy - ry);
    ctx.lineTo(cx + d + ry, cy + ry);
    ctx.stroke();
  }

  // Cone de foco direcional na mesa apontando para o jogador ativo/falante!
  if (activeSeat) {
    const beamCol = activeColor || activeHex;
    const dx = activeSeat.x - cx;
    const dy = activeSeat.y - cy;
    const ang = Math.atan2(dy, dx);
    const beamG = ctx.createRadialGradient(activeSeat.x, activeSeat.y, 10, activeSeat.x, activeSeat.y, 380);
    beamG.addColorStop(0, hexToRgba(beamCol, 0.32));
    beamG.addColorStop(0.55, hexToRgba(beamCol, 0.10));
    beamG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rx + 20, ang - 0.38, ang + 0.38);
    ctx.closePath();
    ctx.fill();
  }

  // Sombra interna da borda de madeira sobre o feltro (profundidade rebaixada)
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, rx, ry, 0, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = 'rgba(0,0,0,0.42)';
  ctx.stroke();

  // Linha decorativa interna da mesa
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 34, ry - 26, 0, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.stroke();
  ctx.restore();

  // 7. Anel animado do sentido de jogo (horario vs anti-horario)
  const spin = (frame * 0.02) * direcao;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = hexToRgba(activeHex, 0.48);
  ctx.lineWidth = 5;
  for (let k = 0; k < 2; k++) {
    const a0 = spin + k * Math.PI;
    const a1 = a0 + Math.PI * 0.56;
    ctx.beginPath();
    ctx.ellipse(0, 0, 224, 134, 0, a0, a1);
    ctx.stroke();
    const tipAngle = direcao === 1 ? a1 : a0;
    const tx = Math.cos(tipAngle) * 224;
    const ty = Math.sin(tipAngle) * 134;
    const tan = Math.atan2(Math.cos(tipAngle) * 134 * direcao, -Math.sin(tipAngle) * 224 * direcao);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tan);
    ctx.fillStyle = activeHex;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-9, -9);
    ctx.lineTo(-9, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 8. Monte de Compra com espessura 2.5D (esquerda do centro)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx - 102, cy + 16, 62, 76, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  for (let i = 5; i >= 0; i--) {
    drawUnoCard(ctx, { x: cx - 108 - i * 1.8, y: cy - i * 2.2, w: 108, h: 162, faceDown: true });
  }
  roundRect(ctx, cx - 156, cy + 92, 98, 28, 10);
  ctx.fillStyle = 'rgba(10,16,30,0.90)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 15px "JetBrainsMono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`MONTE ${deckCount}`, cx - 107, cy + 106);

  // 9. Pilha de Descarte com halo no feltro (direita do centro)
  const discGlow = ctx.createRadialGradient(cx + 94, cy, 15, cx + 94, cy, 118);
  discGlow.addColorStop(0, hexToRgba(activeHex, 0.42));
  discGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = discGlow;
  ctx.beginPath();
  ctx.arc(cx + 94, cy, 118, 0, Math.PI * 2);
  ctx.fill();

  const hist = descarteTop.slice(-4);
  hist.forEach((cod, i) => {
    const isTop = i === hist.length - 1;
    const angle = isTop ? 0.04 : ((i - 1.5) * 0.16);
    drawUnoCard(ctx, {
      x: cx + 94 + (isTop ? 0 : (i - 1) * 5),
      y: cy + (isTop ? 0 : (i - 1) * 3),
      w: 118,
      h: 176,
      codigo: cod,
      rot: angle,
      glowColor: isTop ? activeHex : null,
    });
  });

  // Pill de Cor Ativa abaixo do descarte
  roundRect(ctx, cx + 24, cy + 98, 140, 32, 16);
  ctx.fillStyle = activeHex;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.stroke();
  ctx.fillStyle = corAtiva === 'Amarelo' ? '#0f172a' : '#ffffff';
  ctx.font = '800 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(corAtiva.toUpperCase(), cx + 94, cy + 114);

  // 10. Alerta de Bomba Acumulada (+2, +4, +6, +8...)
  if (pilhaCompra > 0) {
    const pulse = 1 + Math.sin(frame * 0.35) * 0.08;
    ctx.save();
    ctx.translate(cx, cy - 160);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = 'rgba(220,38,38,0.85)';
    ctx.shadowBlur = 24;
    roundRect(ctx, -114, -34, 228, 68, 18);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.shadowBlur = 0;
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
}

// =============================================================================
// HUD FIXO DE MESA (SEM ZOOM/PAN DE CAMERA — NUNCA CORTADO NAS BORDAS!)
// =============================================================================

export function drawTableHud(ctx, {
  turno = 1,
  partidaNum = 1,
  direcao = 1,
  bannerSub = '',
  corAtiva = 'Vermelho',
  pilhaCompra = 0,
  frame = 0,
}) {
  const activeHex = COR_HEX[corAtiva] || '#3b82f6';
  const titleTxt = `UNO DAS IAs · PARTIDA ${partidaNum}`;
  const subTxt = `TURNO ${turno} · ${direcao === 1 ? 'HORÁRIO' : 'ANTI-HORÁRIO'}${bannerSub ? ` · ${bannerSub}` : ''}`;

  ctx.save();

  // Top-Left HUD minimalista (margem segura x >= 28, y >= 22, sempre livre de colisao)
  ctx.font = '900 20px "PoppinsExtraBold", sans-serif';
  const titleW = ctx.measureText(titleTxt).width;
  ctx.font = '700 14px "JetBrainsMono", monospace';
  const subW = ctx.measureText(subTxt).width;
  const hudW = Math.max(430, Math.min(600, Math.ceil(Math.max(titleW + 24, subW)) + 44));

  roundRect(ctx, 28, 22, hudW, 56, 14);
  ctx.fillStyle = 'rgba(10,15,28,0.90)';
  ctx.fill();
  ctx.strokeStyle = pilhaCompra > 0 && (Math.floor(frame / 10) % 2 === 0)
    ? 'rgba(239,68,68,0.65)'
    : 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Indicador discreto da cor ativa
  ctx.beginPath();
  ctx.arc(46, 42, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = activeHex;
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.font = '900 20px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleTxt, 60, 42);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px "JetBrainsMono", monospace';
  ctx.fillText(subTxt, 46, 64);

  // Selo "SO VOCE VE · MAOS REAIS" no topo direito (borda direita em W - 28)
  const badgeW = 292;
  const badgeX = W - 28 - badgeW;
  roundRect(ctx, badgeX, 22, badgeW, 40, 12);
  ctx.fillStyle = 'rgba(124,58,237,0.92)';
  ctx.fill();
  ctx.strokeStyle = '#e9d5ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SÓ VOCÊ VÊ · MÃOS REAIS', badgeX + badgeW / 2, 42);

  ctx.restore();
}

// =============================================================================
// ASSENTO 2.5D DO JOGADOR: PERSONAGEM WOLVESVILLE + LEQUE SEMITRANSPARENTE
// =============================================================================

export function drawPlayerSeat(ctx, {
  jogador,
  seat,
  isActive = false,
  isSpeaking = false,
  isThinking = false,
  speakingId = null,
  speakingMode = 'fala',
  voiceAmp = 0,
  pilhaCompra = 0,
  frame = 0,
}) {
  const { x, y, scale = 1, facing = 0 } = seat;
  const pid = resolvePlayerId(jogador.id || jogador.nome);
  const ch = AI_CHARACTERS[pid] || AI_CHARACTERS.hydrogen;
  const cor = jogador.corPerfil || ch.cor || '#3b82f6';
  const nCartas = (jogador.mao || []).length;

  const speakingNow = Boolean(
    isSpeaking || (speakingId && resolvePlayerId(speakingId) === pid && speakingMode !== 'pensamento')
  );
  const thinkingNow = Boolean(
    isThinking || (speakingId && resolvePlayerId(speakingId) === pid && speakingMode === 'pensamento')
  );

  // Expressao dinamica guiada pelo estado real da mesa
  let expr = ch.defaultExpr;
  if (thinkingNow) {
    expr = 'pensando';
  } else if (nCartas === 0) {
    expr = 'rindo';
  } else if (nCartas >= 9 || (pilhaCompra >= 4 && isActive)) {
    expr = 'chocado';
  } else if ((nCartas === 1 && !jogador.gritouUno) || (pilhaCompra >= 2 && isActive)) {
    expr = 'assustado';
  } else if (nCartas === 1 && jogador.gritouUno) {
    expr = 'rindo';
  } else if (speakingNow) {
    expr = ch.defaultExpr;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Sombra aterrada + halo luminoso do assento ativo/falante
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 48, 86, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.48)';
  ctx.fill();

  if (isActive || speakingNow || thinkingNow) {
    const glowHex = thinkingNow ? '#c084fc' : cor;
    const pulse = 0.52 + 0.22 * Math.sin(frame * 0.22);
    const rg = ctx.createRadialGradient(0, -18, 16, 0, -18, 112);
    rg.addColorStop(0, hexToRgba(glowHex, pulse * 0.65));
    rg.addColorStop(0.65, hexToRgba(glowHex, pulse * 0.22));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, -18, 112, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Medalhao/encosto estilizado discreto atras dos ombros do personagem
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -34, 62, 0, Math.PI * 2);
  ctx.fillStyle = isActive || speakingNow ? 'rgba(15,23,42,0.88)' : 'rgba(10,16,30,0.72)';
  ctx.fill();
  ctx.lineWidth = isActive || speakingNow ? 3.8 : 2.2;
  ctx.strokeStyle = thinkingNow ? '#c084fc' : (isActive || speakingNow ? cor : hexToRgba(cor, 0.55));
  if (thinkingNow) ctx.setLineDash([8, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 3. Personagem 2.5D estilo Wolvesville (sentado atras das cartas!)
  drawAiCharacter(ctx, {
    id: pid,
    nome: jogador.nome,
    x: 0,
    y: -30,
    size: 146,
    expression: expr,
    speaking: speakingNow,
    thinking: thinkingNow,
    voiceAmp,
    frame,
    facing,
    crown: nCartas === 0,
  });

  // 4. Leque de cartas UNO SEMITRANSPARENTES na frente do tronco/maos ("SO VOCE VE")
  // Mostra TODAS as cartas ate 12 cartas sem cortar (inclusive a explosao de 11 cartas da Inkling!).
  const maxShow = Math.min(nCartas, 12);
  let cardW = 56;
  let spacing = 34;
  let fanAngle = 0.24;
  if (maxShow >= 10) {
    cardW = 45;
    spacing = 20;
    fanAngle = 0.36;
  } else if (maxShow >= 8) {
    cardW = 49;
    spacing = 24;
    fanAngle = 0.31;
  } else if (maxShow >= 6) {
    cardW = 53;
    spacing = 29;
    fanAngle = 0.27;
  }
  if (isActive) {
    spacing = Math.round(spacing * 1.08);
  }
  const cardH = Math.round(cardW * 1.46);
  const totalW = maxShow > 1 ? (maxShow - 1) * spacing : 0;
  const activeLift = isActive ? -9 - Math.sin(frame * 0.16) * 2.5 : 0;
  const fanBaseY = 26 + activeLift;

  for (let i = 0; i < maxShow; i++) {
    const cod = jogador.mao[i];
    const cx = -totalW / 2 + i * spacing;
    const norm = maxShow > 1 ? (i / (maxShow - 1)) - 0.5 : 0;
    const wave = Math.sin(frame * 0.09 + i * 0.48 + ch.seed) * 1.6;
    const cy = fanBaseY + Math.abs(norm) * 15 + wave;
    drawUnoCard(ctx, {
      x: cx,
      y: cy,
      w: cardW,
      h: cardH,
      codigo: cod,
      rot: norm * fanAngle,
      translucent: true,
      faceAlpha: 0.72,
      glowColor: isActive ? cor : null,
      rimColor: isActive ? hexToRgba(cor, 0.92) : 'rgba(15,23,42,0.78)',
    });
  }

  // Maozinhas estilizadas segurando as bordas inferiores do leque de cartas
  if (maxShow > 0) {
    const gripX = Math.min(82, totalW / 2 + cardW * 0.22);
    const gripY = fanBaseY + cardH * 0.30;
    ctx.save();
    ctx.fillStyle = ch.pele;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.6;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * gripX, gripY, 9.5, 7.2, side * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  if (nCartas > maxShow) {
    roundRect(ctx, totalW / 2 + cardW * 0.42, fanBaseY - 8, 42, 24, 8);
    ctx.fillStyle = 'rgba(15,23,42,0.94)';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.font = '800 13px "JetBrainsMono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${nCartas - maxShow}`, totalW / 2 + cardW * 0.42 + 21, fanBaseY + 4);
  }

  // 5. Placa compacta de nome + contagem de cartas logo abaixo do leque
  const pw = 228;
  const ph = 38;
  const px = -pw / 2;
  const py = 66;

  ctx.save();
  if (isActive || speakingNow) {
    ctx.shadowColor = hexToRgba(thinkingNow ? '#c084fc' : cor, 0.8);
    ctx.shadowBlur = 18;
  }
  roundRect(ctx, px, py, pw, ph, 12);
  ctx.fillStyle = isActive || speakingNow ? 'rgba(12,18,34,0.96)' : 'rgba(10,15,28,0.88)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = isActive || speakingNow ? 3 : 1.6;
  ctx.strokeStyle = thinkingNow ? '#c084fc' : (isActive || speakingNow ? cor : hexToRgba(cor, 0.55));
  ctx.stroke();

  // Barrinha vertical na cor da IA
  roundRect(ctx, px + 7, py + 7, 6, ph - 14, 3);
  ctx.fillStyle = cor;
  ctx.fill();

  // Nome da IA
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(jogador.nome, px + 20, py + 14);

  // Subtitulo modelo
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 10.5px "JetBrainsMono", monospace';
  ctx.fillText(jogador.modelo || '', px + 20, py + 29);

  // Badge contagem de cartas
  roundRect(ctx, px + pw - 40, py + 6, 33, 26, 8);
  ctx.fillStyle = nCartas <= 2 ? '#dc2626' : (nCartas >= 9 ? '#9333ea' : '#1e293b');
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(nCartas), px + pw - 23.5, py + 20);
  ctx.restore();

  // 6. Badge UNO! / ESQUECEU O UNO! acima da cabeca
  if (nCartas === 1) {
    const pulse = 1 + Math.sin(frame * 0.35) * 0.08;
    ctx.save();
    ctx.translate(0, -106);
    ctx.scale(pulse, pulse);
    const txt = jogador.gritouUno ? 'GRITOU UNO!' : 'ESQUECEU O UNO!';
    const bw = jogador.gritouUno ? 132 : 178;
    roundRect(ctx, -bw / 2, -14, bw, 28, 10);
    ctx.fillStyle = jogador.gritouUno ? '#eab308' : '#dc2626';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.fillStyle = jogador.gritouUno ? '#0f172a' : '#ffffff';
    ctx.font = '900 14px "PoppinsExtraBold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, 1);
    ctx.restore();
  }

  ctx.restore();
}

// =============================================================================
// CARTAO DE FALA NA MESA / PENSAMENTO SECRETO (COM MINI RETRATO WOLVESVILLE!)
// =============================================================================

export function drawDialogueCard(ctx, {
  id = null,
  nome,
  corPerfil = '#3b82f6',
  texto = '',
  modo = 'fala',
  voiceAmp = 0.5,
  frame = 0,
}) {
  if (!texto) return;
  const isThought = modo === 'pensamento';
  const cw = 1120;
  const ch = 152;
  const x = (W - cw) / 2;
  const y = H - ch - 34;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.68)';
  ctx.shadowBlur = 28;
  roundRect(ctx, x, y, cw, ch, 22);
  ctx.fillStyle = isThought ? 'rgba(28,18,56,0.92)' : 'rgba(10,16,30,0.96)';
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = isThought ? '#c084fc' : corPerfil;
  if (isThought) ctx.setLineDash([12, 7]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Retrato circular 2.5D do personagem falando/pensando na esquerda do cartao
  const avCx = x + 76;
  const avCy = y + ch / 2 + 4;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avCx, avCy, 52, 0, Math.PI * 2);
  ctx.fillStyle = isThought ? '#2e1065' : '#111c33';
  ctx.fill();
  ctx.save();
  ctx.clip();
  drawAiCharacter(ctx, {
    id: id || nome,
    nome,
    x: avCx,
    y: avCy + 8,
    size: 108,
    speaking: !isThought,
    thinking: isThought,
    voiceAmp,
    frame,
  });
  ctx.restore();
  ctx.beginPath();
  ctx.arc(avCx, avCy, 52, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = isThought ? '#c084fc' : corPerfil;
  ctx.stroke();
  ctx.restore();

  // Tag superior (quem esta falando/pensando)
  const tagTxt = isThought ? `SÓ VOCÊ VÊ · PENSAMENTO DE ${nome.toUpperCase()}` : `${nome.toUpperCase()} NA MESA`;
  roundRect(ctx, x + 142, y - 18, Math.min(580, tagTxt.length * 11 + 42), 34, 12);
  ctx.fillStyle = isThought ? '#7e22ce' : corPerfil;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "PoppinsExtraBold", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagTxt, x + 160, y - 1);

  // Mini barras de audio animadas pelo voiceAmp real
  for (let b = 0; b < 5; b++) {
    const bh = 8 + Math.round(voiceAmp * 26 * (0.55 + 0.45 * Math.sin(b * 1.4 + voiceAmp * 12)));
    ctx.fillStyle = isThought ? '#e9d5ff' : corPerfil;
    roundRect(ctx, x + cw - 78 + b * 11, y + ch / 2 - bh / 2, 6, bh, 3);
    ctx.fill();
  }

  // Quebra de linha limpa do texto PT-BR
  ctx.fillStyle = isThought ? '#f3e8ff' : '#f8fafc';
  ctx.font = `${isThought ? 'italic ' : ''}700 27px "PoppinsBold", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const textX = x + 146;
  const maxTextW = cw - 245;
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
    ctx.fillText(ln, textX, startY + idx * 38);
  });

  ctx.restore();
}
