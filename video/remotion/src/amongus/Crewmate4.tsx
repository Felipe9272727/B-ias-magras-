import React, {useId} from 'react';
import {COR, AnimCrewmate} from './Crewmate';
import {CosmeticoId} from './cosmeticos';
import {PETS, ROUPAS} from './roupas4';

// Versão 4 do tripulante: corpo mais fiel ao jogo, visor com reflexo, sombra na base
// e cosméticos desenhados em SVG que acompanham o corpo (inclusive virado e andando).
// Desenho próprio. O Crewmate.tsx antigo continua igual e não é usado aqui.

type Props = {
  cor: string;
  size?: number;
  morto?: boolean; // corpo partido ao meio
  fantasma?: boolean;
  passo?: number; // fase da animação de andar (em ciclos; 1 = um passo completo)
  virado?: boolean; // olhando para a esquerda
  anim?: AnimCrewmate; // pose/animação; sem valor: anda se passo != 0, senão parado
  t?: number; // tempo em frames, usado por respiração, andar sem passo e flutuação
  cosmetico?: string; // chapéu/rosto/acessório: id do catálogo (ver cosmeticos.ts); sem valor: sem cosmético
  roupa?: string; // id de ROUPAS (roupas4.tsx)
  pet?: string; // id de PETS (roupas4.tsx): anda ao lado dos pés
  style?: React.CSSProperties;
};

// Contorno preto principal (corpo) e dos membros
const CONTORNO = 6;

// Silhueta do feijão: topo mais redondo, base reta com cantos suaves
const CORPO = 'M22 60 C22 30 34 10 51 10 C69 10 80 30 80 60 L80 94 Q80 102 72 102 L30 102 Q22 102 22 94 Z';
// Metade de baixo do corpo (corte curvo no alto, como um corte de verdade), usada no estado morto
const CORPO_MORTO = 'M22 66 Q51 56 80 66 L80 94 Q80 102 72 102 L30 102 Q22 102 22 94 Z';
// Visor: retângulo arredondado no terço de cima, saindo um pouco do corpo pela direita
const VISOR = {x: 43, y: 24, w: 41, h: 25, r: 12.5};

// Perna em "joelho": quadril -> joelho -> pé. sw: -1..1 (quanto a perna está avançando)
const Perna: React.FC<{hx: number; sw: number; cor: string}> = ({hx, sw, cor}) => {
  const frente = Math.max(0, sw);
  const kx = hx + 4 * sw;
  const ky = 100 - 2 * frente;
  const fx = hx + 8 * sw;
  const fy = 108 - 4 * frente;
  const d = `M${hx} 90 L${kx} ${ky} L${fx} ${fy}`;
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
  let d = 'M22 56 C22 26 34 12 51 12 C69 12 80 26 80 56 L80 ' + (100 + onda);
  for (let i = 0; i < 4; i++) {
    const xa = 80 - 14.5 * i;
    const xb = xa - 14.5;
    d += ` Q${xa - 7.25} ${112 + onda} ${xb} ${100 + onda}`;
  }
  return d + ' Z';
};

// Visor com faixa escura embaixo e reflexo branco no canto de cima
const Visor: React.FC<{idVisor: string}> = ({idVisor}) => (
  <>
    <defs>
      <clipPath id={idVisor}>
        <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} />
      </clipPath>
    </defs>
    <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} fill="#a7d7e6" />
    <g clipPath={`url(#${idVisor})`}>
      {/* metade de baixo do visor, mais escura */}
      <rect x={VISOR.x} y={VISOR.y + 15} width={VISOR.w} height={VISOR.h} fill="#5e8fa0" />
    </g>
    {/* reflexo: faixa branca e um pontinho ao lado */}
    <rect x="50" y="29" width="18" height="5.5" rx="2.75" fill="#ffffff" />
    <circle cx="74" cy="33" r="2.4" fill="#ffffff" opacity={0.9} />
    <rect x={VISOR.x} y={VISOR.y} width={VISOR.w} height={VISOR.h} rx={VISOR.r} fill="none" stroke="#000" strokeWidth={4.5} />
  </>
);

// Desenhos dos cosméticos. Coordenadas no mesmo espaço do corpo (topo da cabeça em y=10, x=51).
// Ficam dentro do grupo que balança com o corpo, então acompanham o andar e a inclinação.
const DESENHO: Record<CosmeticoId, React.ReactNode> = {
  // chapéus
  coroa: (
    <g strokeLinejoin="round">
      <path d="M33 17 L33 3 L42 11 L51 -1 L60 11 L69 3 L69 17 Z" fill="#f7c843" stroke="#000" strokeWidth={3.5} />
      <circle cx="51" cy="10" r="2.6" fill="#e0245e" stroke="#000" strokeWidth={1.5} />
    </g>
  ),
  chapeu_chef: (
    <g stroke="#000" strokeWidth={3} strokeLinejoin="round">
      <rect x="37" y="11" width="28" height="7" rx="2" fill="#f2f2f2" />
      <circle cx="40" cy="7" r="6.5" fill="#ffffff" />
      <circle cx="51" cy="3" r="7.5" fill="#ffffff" />
      <circle cx="62" cy="7" r="6.5" fill="#ffffff" />
    </g>
  ),
  cartola: (
    <g stroke="#000" strokeWidth={3} strokeLinejoin="round">
      <rect x="29" y="13" width="44" height="6" rx="3" fill="#1d1d24" />
      <rect x="38" y="-12" width="26" height="26" rx="3" fill="#1d1d24" />
      <rect x="38" y="4" width="26" height="6" fill="#c51111" stroke="none" />
    </g>
  ),
  bone: (
    <g stroke="#000" strokeWidth={3} strokeLinejoin="round">
      <path d="M30 17 Q32 3 52 3 Q70 3 72 17 Z" fill="#e8542c" />
      {/* aba virada para a frente (lado do visor) */}
      <path d="M68 14 L86 16 Q88 20 84 21 L68 19 Z" fill="#c23b1c" />
    </g>
  ),
  capacete: (
    <g stroke="#000" strokeWidth={3} strokeLinejoin="round">
      <path d="M29 17 Q30 1 52 1 Q74 1 75 17 Z" fill="#ffd21f" />
      <rect x="25" y="14" width="52" height="5" rx="2.5" fill="#f0b400" />
      <path d="M52 3 L52 13" fill="none" strokeWidth={2} />
    </g>
  ),
  bandana: (
    <g stroke="#000" strokeWidth={2.5} strokeLinejoin="round">
      {/* pontas soltas atrás da cabeça */}
      <path d="M12 15 L24 19 L26 27 L12 23 Z" fill="#e53935" />
      <path d="M24 13 Q52 5 80 11 L81 19 Q52 13 24 21 Z" fill="#e53935" />
      <circle cx="40" cy="14" r="1.6" fill="#ffffff" stroke="none" />
      <circle cx="56" cy="11" r="1.6" fill="#ffffff" stroke="none" />
      <circle cx="70" cy="14" r="1.6" fill="#ffffff" stroke="none" />
    </g>
  ),
  chifrinhos: (
    <g stroke="#000" strokeWidth={3} strokeLinejoin="round" fill="#f3efe0">
      <path d="M34 16 Q26 4 34 -6 Q39 4 42 14 Z" />
      <path d="M68 16 Q76 4 68 -6 Q63 4 60 14 Z" />
    </g>
  ),
  folhinha: (
    <g strokeLinejoin="round">
      <path d="M51 10 Q51 2 51 -2" stroke="#000" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M51 10 Q51 2 51 -2" stroke="#4caf50" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M51 2 Q40 -10 35 -3 Q42 4 51 2 Z" fill="#4caf50" stroke="#000" strokeWidth={2.5} />
      <path d="M51 2 Q62 -10 67 -3 Q60 4 51 2 Z" fill="#66bb6a" stroke="#000" strokeWidth={2.5} />
    </g>
  ),
  // rosto (sobre o visor e abaixo dele)
  oculos_escuros: (
    <g stroke="#000" strokeWidth={2.5} strokeLinejoin="round">
      <rect x="46" y="28" width="15" height="9" rx="3" fill="#101418" />
      <rect x="65" y="28" width="15" height="9" rx="3" fill="#101418" />
      <path d="M61 31.5 L65 31.5" fill="none" strokeWidth={2.5} />
      <path d="M49 31 L53 30" stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.6} />
    </g>
  ),
  fones: (
    <g strokeLinecap="round" fill="none">
      <path d="M25 42 Q22 2 51 2 Q80 2 77 42" stroke="#000" strokeWidth={8} />
      <path d="M25 42 Q22 2 51 2 Q80 2 77 42" stroke="#3b3b44" strokeWidth={4.5} />
      <rect x="17" y="36" width="11" height="17" rx="5" fill="#e53935" stroke="#000" strokeWidth={2.5} />
      <rect x="75" y="36" width="11" height="17" rx="5" fill="#e53935" stroke="#000" strokeWidth={2.5} />
    </g>
  ),
  bigode: (
    <path
      d="M43 55 Q50 48 55 54 Q60 48 69 55 Q62 60 56 57 Q50 60 43 55 Z"
      fill="#2b1a0e"
      stroke="#000"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  ),
  tapa_olho: (
    <g stroke="#000" strokeWidth={2.5} strokeLinejoin="round">
      <path d="M42 26 Q64 18 84 28" fill="none" stroke="#111" strokeWidth={3} />
      <ellipse cx="55" cy="36" rx="8.5" ry="7.5" fill="#111" />
    </g>
  ),
  // pets e acessórios
  antena: (
    <g strokeLinecap="round">
      <path d="M51 10 L49 -8" stroke="#000" strokeWidth={6} fill="none" />
      <path d="M51 10 L49 -8" stroke="#d9d9d9" strokeWidth={2.5} fill="none" />
      <circle cx="49" cy="-11" r="5" fill="#ff3131" stroke="#000" strokeWidth={2.5} />
    </g>
  ),
  aureola: (
    <g>
      <ellipse cx="51" cy="-2" rx="16" ry="5" fill="none" stroke="#000" strokeWidth={6} />
      <ellipse cx="51" cy="-2" rx="16" ry="5" fill="none" stroke="#ffe27a" strokeWidth={3} />
    </g>
  ),
  laco_mochila: (
    <g stroke="#000" strokeWidth={2.5} strokeLinejoin="round" fill="#e91e63">
      <path d="M14 40 L3 31 L3 49 Z" />
      <path d="M14 40 L24 31 L24 49 Z" />
      <circle cx="14" cy="40" r="3.5" />
    </g>
  ),
};

// Cosméticos de cabeça e rosto ficam em cima do visor; os de pet ficam no mesmo grupo.
// Todos são desenhados depois do visor, então sempre aparecem por cima.

// Tripulante em forma de "feijão": corpo, mochila, visor e pernas. viewBox 100x120.
export const Crewmate4: React.FC<Props> = ({cor, size = 80, morto, fantasma, passo = 0, virado, anim, t, cosmetico, roupa, pet, style}) => {
  // id único para os clipPaths (evita conflito entre várias instâncias na mesma página)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = COR[cor] ?? COR.Branco;
  const tt = t ?? 0;
  const modo = anim ?? (passo !== 0 ? 'andando' : 'parado');
  const vivo = !morto && !fantasma;
  const andando = vivo && modo === 'andando';
  const ciclo = passo !== 0 ? passo : tt / 12;
  const th = ciclo * Math.PI * 2;

  // Andar: pernas alternadas; corpo sobe/desce 2.5 unidades e inclina +-4 graus
  const s = andando ? Math.sin(th) : 0;
  const bob = andando ? -2.5 * (1 - Math.abs(s)) : 0;
  let inclina = andando ? 4 * s : 0;
  // Mochila atrasa um pouco em relação ao corpo
  const giroMochila = andando ? 3 * Math.sin(th - 0.9) : 0;

  // Pose de tarefa: corpo inclinado para a frente, com o braço estendido
  if (modo === 'tarefa' && vivo) inclina = 6;

  // Respiração (parado): escala Y de 1 a 1.02
  const respira = modo === 'parado' && vivo ? 1 + 0.01 + 0.01 * Math.sin((tt * Math.PI * 2) / 90) : 1;

  // Susto: squash & stretch com leve tremida
  const susto = modo === 'susto' && vivo;
  const sx = susto ? 0.9 : 1;
  const sy = susto ? 1.1 : respira;
  const jx = susto ? 1.2 * Math.sin(tt * 1.7) : 0;

  // Fantasma: flutua de leve
  const flutua = fantasma ? 2 * Math.sin((tt * Math.PI * 2) / 80) : 0;

  const idCorpo = `cm4${uid}corpo`;
  const idVisor = `cm4${uid}visor`;
  const idMochila = `cm4${uid}mochila`;
  const idMorto = `cm4${uid}morto`;

  const svgBase: React.CSSProperties = {overflow: 'visible', transform: virado ? 'scaleX(-1)' : undefined};
  const desenhoCosmetico = cosmetico ? DESENHO[cosmetico as CosmeticoId] : undefined;
  const desenhoRoupa = roupa && ROUPAS[roupa] ? ROUPAS[roupa].desenho({body: c.body, shade: c.shade}) : null;
  // pet: quadro 40x40 ao lado do pé de trás, pulando de leve quando o dono anda
  const desenhoPet = pet && PETS[pet] && !morto ? <g transform={`translate(-34 ${80 + (andando ? -2 * Math.abs(Math.sin(th * 1.3)) : 0)})`}>{PETS[pet].desenho(tt)}</g> : null

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
        <ellipse cx="51" cy="110" rx="44" ry="8" fill="#4a0000" />
        <ellipse cx="47" cy="109" rx="26" ry="4.5" fill="#8a0c0c" opacity={0.8} />
        {/* osso (fica atrás do corte, então a parte de baixo some no corpo) */}
        <path d="M51 70 L51 46" stroke="#000" strokeWidth={11} strokeLinecap="round" />
        <circle cx="46.5" cy="45" r="7" fill="#000" />
        <circle cx="55.5" cy="45" r="7" fill="#000" />
        <path d="M51 70 L51 46" stroke="#f3efe0" strokeWidth={5} strokeLinecap="round" />
        <circle cx="46.5" cy="45" r="4" fill="#f3efe0" />
        <circle cx="55.5" cy="45" r="4" fill="#f3efe0" />
        {/* pernas */}
        <Perna hx={38} sw={0} cor={c.shade} />
        <Perna hx={64} sw={0} cor={c.shade} />
        {/* corpo cortado */}
        <path d={CORPO_MORTO} fill={c.body} />
        <g clipPath={`url(#${idMorto})`}>
          <path d="M10 50 L36 50 Q32 80 32 100 Q32 110 40 120 L10 120 Z" fill={c.shade} />
          {/* carne exposta no corte: faixa vermelha escura seguindo a curva do corte */}
          <path d="M18 64 Q51 54 84 64 L84 74 Q51 64 18 74 Z" fill="#6b0a0a" />
          <path d="M18 72 Q51 62 84 72 L84 75 Q51 65 18 75 Z" fill="#3e0505" />
        </g>
        <path d={CORPO_MORTO} fill="none" stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />
      </svg>
    );
  }

  if (fantasma) {
    // fantasma: sem pernas, cauda ondulada, translúcido via opacity; cosmético acompanha
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{...svgBase, opacity: 0.45, ...style}}>
        <g transform={`translate(0 ${flutua})`}>
          {/* mochila */}
          <rect x="6" y="44" width="20" height="44" rx="8" fill={c.shade} stroke="#000" strokeWidth={5} />
          <path d={corpoFantasma(tt)} fill={c.body} stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />
          <path d="M30 30 Q34 20 46 18" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.3} />
          <Visor idVisor={idVisor} />
          {desenhoCosmetico}
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
      <g transform={`translate(${jx} 0) translate(51 116) scale(${sx} ${sy}) translate(-51 -116)`}>
        {/* pernas (atrás do corpo); na pose de tarefa ficam paradas */}
        <Perna hx={38} sw={andando ? s : 0} cor={c.shade} />
        <Perna hx={64} sw={andando ? -s : 0} cor={c.shade} />

        <g transform={`translate(0 ${bob}) rotate(${inclina} 51 104)`}>
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
            <path d="M8 0 L34 0 Q30 30 30 60 Q30 92 36 120 L8 120 Z" fill={c.shade} />
            {/* sombra na base do corpo */}
            <rect x="20" y="93" width="64" height="12" fill={c.shade} opacity={0.55} />
            {/* brilho sutil no alto à esquerda */}
            <path d="M30 36 Q33 24 44 19" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.3} />
            {desenhoRoupa}
          </g>
          <path d={CORPO} fill="none" stroke="#000" strokeWidth={CONTORNO} strokeLinejoin="round" />

          {/* braço estendido na pose de tarefa */}
          {modo === 'tarefa' && (
            <g>
              <path d="M70 66 L86 72 L96 80" fill="none" stroke="#000" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 66 L86 72 L96 80" fill="none" stroke={c.body} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="97" cy="80" r="7.5" fill="#000" />
              <circle cx="97" cy="80" r="4.5" fill={c.body} />
            </g>
          )}

          {/* cabeça: visor e cosmético */}
          <Visor idVisor={idVisor} />
          {desenhoCosmetico}
        </g>
      </g>

      {desenhoPet}
      {/* "!" de susto */}
      {susto && (
        <g>
          <rect x="84" y="-14" width="9" height="20" rx="4.5" fill="#ff3131" stroke="#000" strokeWidth={3} />
          <circle cx="88.5" cy="13" r="5" fill="#ff3131" stroke="#000" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
};
