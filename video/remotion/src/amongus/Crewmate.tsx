import React, {useId} from 'react';

// Cores dos jogadores (tons próximos aos do jogo, desenho próprio em SVG)
export const COR: Record<string, {body: string; shade: string}> = {
  Vermelho: {body: '#c51111', shade: '#7a0838'},
  Azul: {body: '#132ed1', shade: '#09158e'},
  Verde: {body: '#117f2d', shade: '#0a4d2e'},
  Rosa: {body: '#ed54ba', shade: '#ab2bad'},
  Laranja: {body: '#ef7d0d', shade: '#b33e15'},
  Amarelo: {body: '#f5f557', shade: '#c38823'},
  Preto: {body: '#3f474e', shade: '#1e1f26'},
  Branco: {body: '#d6e0f0', shade: '#8394bf'},
};

export type AnimCrewmate = 'parado' | 'andando' | 'tarefa' | 'susto';

type Props = {
  cor: string;
  size?: number;
  morto?: boolean; // corpo partido ao meio
  fantasma?: boolean;
  passo?: number; // fase da animação de andar (em ciclos; 1 = um passo completo)
  virado?: boolean; // olhando para a esquerda
  anim?: AnimCrewmate; // pose/animação; sem valor: anda se passo != 0, senão parado
  t?: number; // tempo em frames, usado por respiração, andar sem passo e flutuação
  style?: React.CSSProperties;
};

// Contorno preto principal (corpo) e dos membros
const CONTORNO = 6;

// Silhueta do feijão (corpo inteiro)
const CORPO = 'M24 56 C24 26 36 12 53 12 C71 12 82 26 82 56 L82 94 Q82 102 74 102 L32 102 Q24 102 24 94 Z';
// Metade de baixo do corpo (cortada reta no alto)
const CORPO_MORTO = 'M24 60 L82 60 L82 94 Q82 102 74 102 L32 102 Q24 102 24 94 Z';
// Visor (retângulo arredondado)
const VISOR = {x: 44, y: 26, w: 50, h: 26, r: 13};

// Perna em "joelho": quadril -> joelho -> pé. sw: -1..1 (quanto a perna está avançando)
const Perna: React.FC<{hx: number; sw: number; cor: string}> = ({hx, sw, cor}) => {
  const frente = Math.max(0, sw);
  const kx = hx + 4 * sw;
  const ky = 98 - 2 * frente;
  const fx = hx + 8 * sw;
  const fy = 106 - 4 * frente;
  const d = `M${hx} 88 L${kx} ${ky} L${fx} ${fy}`;
  return (
    <g>
      <path d={d} fill="none" stroke="#000" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={cor} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Contorno do fantasma: cúpula em cima e "rabo" ondulado embaixo
const corpoFantasma = (tt: number): string => {
  const onda = 2 * Math.sin((tt * Math.PI * 2) / 40);
  let d = 'M24 56 C24 26 36 12 53 12 C71 12 82 26 82 56 L82 ' + (100 + onda);
  for (let i = 0; i < 4; i++) {
    const xa = 82 - 14.5 * i;
    const xb = xa - 14.5;
    d += ` Q${xa - 7.25} ${112 + onda} ${xb} ${100 + onda}`;
  }
  return d + ' Z';
};

// Tripulante em forma de "feijão": corpo, mochila, visor e pernas. viewBox 100x120.
export const Crewmate: React.FC<Props> = ({cor, size = 80, morto, fantasma, passo = 0, virado, anim, t, style}) => {
  // id único para os clipPaths (evita conflito entre várias instâncias na mesma página)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = COR[cor] ?? COR.Branco;
  const tt = t ?? 0;
  const modo = anim ?? (passo !== 0 ? 'andando' : 'parado');
  const andando = !morto && !fantasma && modo === 'andando';
  const ciclo = passo !== 0 ? passo : tt / 12;
  const th = ciclo * Math.PI * 2;

  // Andar: pernas alternadas; corpo sobe/desce 2.5 unidades e inclina +-4 graus
  const s = andando ? Math.sin(th) : 0;
  const bob = andando ? -2.5 * (1 - Math.abs(s)) : 0;
  let inclina = andando ? 4 * s : 0;
  // Mochila atrasa um pouco em relação ao corpo
  const giroMochila = andando ? 3 * Math.sin(th - 0.9) : 0;

  // Pose de tarefa: corpo inclinado para a frente, com o braço estendido
  if (modo === 'tarefa' && !morto && !fantasma) inclina = 6;

  // Respiração (parado): escala Y de 1 a 1.02
  const respira = modo === 'parado' && !morto && !fantasma ? 1 + 0.01 + 0.01 * Math.sin((tt * Math.PI * 2) / 90) : 1;

  // Susto: squash & stretch com leve tremida
  const susto = modo === 'susto' && !morto && !fantasma;
  const sx = susto ? 0.9 : 1;
  const sy = susto ? 1.1 : respira;
  const jx = susto ? 1.2 * Math.sin(tt * 1.7) : 0;

  // Fantasma: flutua de leve
  const flutua = fantasma ? 2 * Math.sin((tt * Math.PI * 2) / 80) : 0;

  const idCorpo = `cm${uid}corpo`;
  const idVisor = `cm${uid}visor`;
  const idMochila = `cm${uid}mochila`;
  const idMorto = `cm${uid}morto`;

  const svgBase: React.CSSProperties = {overflow: 'visible', transform: virado ? 'scaleX(-1)' : undefined};

  if (morto) {
    // metade de baixo do corpo, pernas, osso saindo do corte e poça de sangue
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{...svgBase, ...style}}>
        <defs>
          <clipPath id={idMorto}>
            <path d={CORPO_MORTO} />
          </clipPath>
        </defs>
        {/* poça de sangue */}
        <ellipse cx="50" cy="110" rx="44" ry="8" fill="#4a0000" />
        <ellipse cx="46" cy="109" rx="26" ry="4.5" fill="#8a0c0c" opacity={0.8} />
        {/* osso (fica atrás do corte, então a parte de baixo some no corpo) */}
        <path d="M56 66 L56 42" stroke="#000" strokeWidth={11} strokeLinecap="round" />
        <circle cx="51.5" cy="41" r="7" fill="#000" />
        <circle cx="60.5" cy="41" r="7" fill="#000" />
        <path d="M56 66 L56 42" stroke="#f3efe0" strokeWidth={5} strokeLinecap="round" />
        <circle cx="51.5" cy="41" r="4" fill="#f3efe0" />
        <circle cx="60.5" cy="41" r="4" fill="#f3efe0" />
        {/* pernas */}
        <Perna hx={40} sw={0} cor={c.shade} />
        <Perna hx={66} sw={0} cor={c.shade} />
        {/* corpo cortado */}
        <path d={CORPO_MORTO} fill={c.body} />
        <g clipPath={`url(#${idMorto})`}>
          <path d="M10 50 L38 50 Q34 80 34 100 Q34 110 42 120 L10 120 Z" fill={c.shade} />
          {/* carne exposta no corte */}
          <rect x="20" y="60" width="66" height="6" fill="#6b0a0a" />
        </g>
        <path d={CORPO_MORTO} fill="none" stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />
      </svg>
    );
  }

  const cabeca = (
    <>
      {/* visor */}
      <defs>
        <clipPath id={idVisor}>
          <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} />
        </clipPath>
      </defs>
      <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} fill="#b4d8e4" />
      <g clipPath={`url(#${idVisor})`}>
        {/* parte de baixo do visor mais escura */}
        <rect x={VISOR.x} y={VISOR.y + 14} width={VISOR.w} height={VISOR.h} fill="#56808f" />
      </g>
      {/* brilho branco */}
      <rect x="52" y="30" width="22" height="6" rx="3" fill="#ffffff" />
      <circle cx="80" cy="35" r="2.5" fill="#ffffff" opacity={0.85} />
      <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} fill="none" stroke="#000" strokeWidth={4.5} />
    </>
  );

  if (fantasma) {
    // fantasma: sem pernas, cauda ondulada, translúcido via opacity
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{...svgBase, opacity: 0.45, ...style}}>
        <g transform={`translate(0 ${flutua})`}>
          {/* mochila */}
          <rect x="8" y="44" width="20" height="44" rx="8" fill={c.shade} stroke="#000" strokeWidth={5} />
          <path d={corpoFantasma(tt)} fill={c.body} stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />
          <path d="M34 30 Q38 20 50 18" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.3} />
          {cabeca}
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{...svgBase, ...style}}>
      <defs>
        <clipPath id={idCorpo}>
          <path d={CORPO} />
        </clipPath>
        <clipPath id={idMochila}>
          <rect x="6" y="40" width="22" height="52" rx="9" />
        </clipPath>
      </defs>

      {/* pose de susto: squash & stretch em volta da base; o "!" fica fora do esticamento */}
      <g transform={`translate(${jx} 0) translate(54 116) scale(${sx} ${sy}) translate(-54 -116)`}>
        {/* pernas (atrás do corpo) */}
        {/* na pose de tarefa as pernas ficam paradas */}
        <Perna hx={40} sw={andando ? s : 0} cor={c.shade} />
        <Perna hx={66} sw={andando ? -s : 0} cor={c.shade} />

        <g transform={`translate(0 ${bob}) rotate(${inclina} 54 104)`}>
          {/* mochila, com giro atrasado */}
          <g transform={`rotate(${giroMochila} 26 60)`}>
            <rect x="6" y="40" width="22" height="52" rx="9" fill={c.shade} />
            <g clipPath={`url(#${idMochila})`}>
              {/* sombra interna e brilho da mochila */}
              <rect x="18" y="36" width="12" height="60" fill="#000" opacity={0.22} />
              <rect x="9" y="46" width="3.5" height="30" rx="1.75" fill="#fff" opacity={0.2} />
            </g>
            <rect x="6" y="40" width="22" height="52" rx="9" fill="none" stroke="#000" strokeWidth={5} />
            <path d="M8 74 L26 74" stroke="#000" strokeWidth={2.5} opacity={0.5} />
          </g>

          {/* corpo */}
          <path d={CORPO} fill={c.body} />
          <g clipPath={`url(#${idCorpo})`}>
            {/* faixa de sombra à esquerda/costas */}
            <path d="M10 0 L38 0 Q34 26 34 60 Q34 92 42 120 L10 120 Z" fill={c.shade} />
            {/* brilho sutil no alto à esquerda */}
            <path d="M34 30 Q38 20 50 18" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.3} />
          </g>
          <path d={CORPO} fill="none" stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />

          {/* braço estendido na pose de tarefa */}
          {modo === 'tarefa' && (
            <g>
              <path d="M72 70 L86 76 L96 82" fill="none" stroke="#000" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M72 70 L86 76 L96 82" fill="none" stroke={c.body} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="97" cy="82" r="7.5" fill="#000" />
              <circle cx="97" cy="82" r="4.5" fill={c.body} />
            </g>
          )}

          {/* cabeça: visor */}
          {cabeca}
        </g>
      </g>

      {/* "!" de susto */}
      {susto && (
        <g>
          <rect x="82" y="-14" width="9" height="20" rx="4.5" fill="#ff3131" stroke="#000" strokeWidth={3} />
          <circle cx="86.5" cy="13" r="5" fill="#ff3131" stroke="#000" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
};
