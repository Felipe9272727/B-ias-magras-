import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

// Transições de entrada de cena no estilo Among Us.
// Tudo é SVG/CSS inline, sem assets externos. Cada efeito é uma sobreposição que
// começa no primeiro quadro da cena (quadro 0 = início da cena) e some após `dur`.

export type TipoTransicao = 'estrelas' | 'iris' | 'deslize' | 'flash' | 'glitch' | 'nenhuma';

// Resolução de referência do vídeo (Full HD). O SVG usa viewBox nessas dimensões.
const W = 1920;
const H = 1080;
const DIAGONAL_META = Math.sqrt(W * W + H * H) / 2;

// Quadros de glitch: o efeito dura no máximo isso, mesmo com `dur` maior.
const QUADROS_GLITCH = 4;

// PRNG determinístico (mulberry32). Mesma semente gera o mesmo resultado em qualquer
// render, então o efeito não depende do relógio de parede nem da ordem de renderização.
const aleatorio = (semente: number) => {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

// Campo de estrelas fixo: gerado uma vez, com profundidade (z) para paralaxe.
const PAINEL_ESTRELAS_W = W + 240;
const ESTRELAS = (() => {
  const r = aleatorio(7);
  const cores = ['#ffffff', '#ffffff', '#cfefff', '#9fd8ff', '#ffe9c4'];
  return Array.from({length: 170}, () => {
    const z = 0.25 + r() * 0.75; // estrelas mais próximas são maiores e mais rápidas
    return {
      x: r() * PAINEL_ESTRELAS_W,
      y: r() * H,
      z,
      comp: 0.4 + r() * 0.6,
      cor: cores[Math.floor(r() * cores.length)],
      op: 0.35 + 0.65 * z,
    };
  });
})();

// 1) Estrelas: painel espacial escuro com rastros, saindo pela esquerda (como a ejeção no espaço).
const Estrelas: React.FC<{frame: number; dur: number}> = ({frame, dur}) => {
  // Termina em 90% da duração, para o último quadro já estar limpo.
  const p = interpolate(frame, [0, dur * 0.9], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Pico no meio do movimento: os rastros alongam e depois encurtam.
  const pico = Math.sin(Math.PI * p);
  const deslocX = -p * PAINEL_ESTRELAS_W;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="tr-estrelas-fundo" cx="62%" cy="45%" r="78%">
          <stop offset="0" stopColor="#1f1450" />
          <stop offset="0.5" stopColor="#0b0d26" />
          <stop offset="1" stopColor="#020308" />
        </radialGradient>
        <linearGradient id="tr-estrelas-borda" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#83cdec" stopOpacity="0" />
          <stop offset="1" stopColor="#c9f1ff" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <g transform={`translate(${deslocX} 0)`}>
        <rect x={0} y={0} width={PAINEL_ESTRELAS_W} height={H} fill="url(#tr-estrelas-fundo)" />
        {ESTRELAS.map((e, i) => {
          // As estrelas também andam para a esquerda, em relação ao painel (paralaxe).
          const x = mod(e.x - p * e.z * 900, PAINEL_ESTRELAS_W);
          const comp = e.comp * (10 + 240 * pico * e.z);
          return (
            <line
              key={i}
              x1={x}
              y1={e.y}
              x2={x + comp}
              y2={e.y}
              stroke={e.cor}
              strokeWidth={0.8 + e.z * 1.8}
              strokeLinecap="round"
              opacity={e.op}
            />
          );
        })}
        {/* Brilho na borda de fuga do painel */}
        <rect x={PAINEL_ESTRELAS_W - 220} y={0} width={220} height={H} fill="url(#tr-estrelas-borda)" opacity={0.5 + 0.5 * pico} />
      </g>
    </svg>
  );
};

// 2) Íris: tela preta com um buraco circular que abre do centro (visor / lente de câmera).
const Iris: React.FC<{frame: number; dur: number}> = ({frame, dur}) => {
  const p = interpolate(frame, [0, dur], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cx = W / 2;
  const cy = H / 2;
  // Raio final passa dos cantos, então nenhum canto fica preto no último quadro.
  const r = p * (DIAGONAL_META + 24);
  // Retângulo da tela com um círculo recortado (evenodd): cria o buraco da íris.
  const caminho =
    `M0 0H${W}V${H}H0Z ` + `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  // Anel de "visor" que some quando a íris termina de abrir.
  const visor = interpolate(p, [0, 0.7, 1], [1, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={caminho} fill="#000" fillRule="evenodd" />
      {r > 2 ? (
        <>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#83cdec" strokeWidth={14} opacity={0.12 * visor} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e6fbff" strokeWidth={2.5} opacity={0.85 * visor} />
        </>
      ) : null}
    </svg>
  );
};

// 3) Deslize: painel vermelho diagonal com contorno preto, saindo para a esquerda.
const Deslize: React.FC<{frame: number; dur: number}> = ({frame, dur}) => {
  // Começa devagar e acelera. Bezier dá um movimento de "porta" mais firme que cúbica.
  const p = interpolate(frame, [0, dur * 0.95], [0, 1], {
    easing: Easing.bezier(0.7, 0, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Painel: a borda esquerda começa perto da borda da tela (cobre tudo no quadro 0, mas
  // sem folga grande, para o movimento aparecer logo) e sai pela esquerda.
  const tx = -p * (W + 900);
  const x0 = -200;
  const largura = W + 400;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(${tx} 0) rotate(-14 ${W / 2} ${H / 2})`}>
        {/* Sombra projetada, à frente do painel, para dar profundidade à borda */}
        <rect x={x0 - 34} y={-700} width={largura} height={H + 1400} fill="#000" opacity={0.55} />
        <rect x={x0} y={-700} width={largura} height={H + 1400} fill="#c51111" stroke="#000" strokeWidth={22} />
        {/* Faixa clara fina acompanhando a borda, para um acabamento mais limpo */}
        <rect x={x0 + 40} y={-700} width={largura - 40} height={H + 1400} fill="none" stroke="#ff6b6b" strokeOpacity={0.35} strokeWidth={3} />
      </g>
    </svg>
  );
};

// 4) Flash: branco que se apaga rápido, com cauda longa.
const Flash: React.FC<{frame: number; dur: number}> = ({frame, dur}) => {
  const p = interpolate(frame, [0, dur], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{background: '#fff', opacity: 1 - p}} />;
};

// 5) Glitch: fatias com separação RGB, faixas pretas de perda de sinal e ruído.
// Sobrepõe a cena com mix-blend-mode, sem precisar ler os pixels dela.
const Glitch: React.FC<{frame: number}> = ({frame}) => {
  // Semente muda a cada quadro, então cada quadro de glitch tem uma forma diferente.
  const r = aleatorio(9000 + frame * 131);
  const bandas = Array.from({length: 26}, () => ({
    y: r() * H,
    h: 4 + r() * r() * 150,
    dx: (r() - 0.5) * 180 * (0.4 + r()),
    preto: r() < 0.3,
  }));

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <filter id="tr-glitch-ruido" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={2} seed={2 + frame * 7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <pattern id="tr-glitch-linhas" width="1" height="4" patternUnits="userSpaceOnUse">
          <rect width={W} height={2} fill="#000" opacity={0.22} />
        </pattern>
      </defs>
      {bandas.map((b, i) =>
        b.preto ? (
          <rect key={i} x={0} y={b.y} width={W} height={b.h} fill="#000" opacity={0.92} />
        ) : (
          <g key={i}>
            <rect x={b.dx} y={b.y} width={W} height={b.h} fill="#00f0ff" opacity={0.6} style={{mixBlendMode: 'screen'}} />
            <rect x={-b.dx} y={b.y} width={W} height={b.h} fill="#ff1744" opacity={0.6} style={{mixBlendMode: 'screen'}} />
          </g>
        ),
      )}
      <rect width={W} height={H} filter="url(#tr-glitch-ruido)" opacity={0.22} style={{mixBlendMode: 'overlay'}} />
      <rect width={W} height={H} fill="url(#tr-glitch-linhas)" />
    </svg>
  );
};

/**
 * Sobreposição de entrada de cena. Renderize como último filho da cena (por cima de tudo).
 * Usa o quadro atual relativo ao início da cena e some quando `frame >= dur`.
 */
export const TransicaoEntrada: React.FC<{tipo: TipoTransicao; dur?: number}> = ({tipo, dur = 14}) => {
  const frame = useCurrentFrame();
  if (tipo === 'nenhuma' || frame < 0 || frame >= dur) return null;

  const conteudo = (() => {
    switch (tipo) {
      case 'estrelas':
        return <Estrelas frame={frame} dur={dur} />;
      case 'iris':
        return <Iris frame={frame} dur={dur} />;
      case 'deslize':
        return <Deslize frame={frame} dur={dur} />;
      case 'flash':
        return <Flash frame={frame} dur={dur} />;
      case 'glitch':
        if (frame >= Math.min(QUADROS_GLITCH, dur)) return null;
        return <Glitch frame={frame} />;
      default:
        return null;
    }
  })();

  return <AbsoluteFill style={{pointerEvents: 'none'}}>{conteudo}</AbsoluteFill>;
};

// Cenas de gameplay (partida em replay). As demais são reunião, votação, títulos etc.
const GAMEPLAY = new Set(['AUReplay', 'AUSplit']);

/**
 * Escolhe a transição de entrada a partir do componente visual da cena anterior e da atual.
 * `anterior` é undefined no início do vídeo ou quando a cena anterior não é um componente.
 */
export function escolherTransicao(anterior: string | undefined, atual: string): TipoTransicao {
  // Mesmo componente em sequência (ex.: replays encadeados): continuidade, sem efeito.
  if (anterior === atual) return 'nenhuma';
  // Abertura de cada bloco narrativo: o painel espacial marca a mudança de assunto.
  if (atual === 'AUTitulo') return 'estrelas';
  // Ejeção: mesma linguagem espacial da ejeção no jogo.
  if (atual === 'AUEjecao') return 'estrelas';
  // Votação e frases de chat entram com o painel vermelho.
  if (atual === 'AUVotos') return 'deslize';
  if (atual === 'AUFrase' || atual === 'AUPrompt') return 'deslize';
  // Volta à partida depois de um quadro sem gameplay: abertura de íris, como um visor.
  if (GAMEPLAY.has(atual) && anterior !== undefined && !GAMEPLAY.has(anterior)) return 'iris';
  // Entrada na reunião vinda da partida: o flash complementa o cartaz de reunião que já existe.
  if (atual === 'AUReuniao' && anterior !== undefined && GAMEPLAY.has(anterior)) return 'flash';
  return 'nenhuma';
}
