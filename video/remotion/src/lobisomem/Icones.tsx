// Ícones, cartas, selos e HUD do vídeo do Lobisomem.
// Tudo é SVG/CSS desenhado aqui: nenhuma imagem externa e nenhum emoji.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

// ---------------------------------------------------------------- Ícones

export type NomeIcone =
  | 'lobo' | 'olho' | 'pocao_cura' | 'pocao_veneno' | 'besta' | 'aldeao' | 'lua' | 'sol'
  | 'caveira' | 'mentira' | 'voto' | 'carroca' | 'fogo' | 'escudo' | 'pergaminho' | 'garra'
  | 'coracao' | 'interrogacao' | 'exclamacao' | 'check' | 'xis';

export type Papel = 'lobisomem' | 'vidente' | 'bruxa' | 'cacador' | 'aldeao';

const TINTA = '#1d1410';
const PERGAMINHO_CLARO = '#fff6dc';
const MADEIRA = '#8a5a32';
const MADEIRA_ESCURA = '#5b3a1f';
const PELE = '#f2c79a';
const OURO = '#f1c40f';

// Forma preenchida com contorno grosso escuro (a marca do estilo cartoon).
const Forma: React.FC<{d: string; cor: string; w?: number}> = ({d, cor, w = 6}) => (
  <path d={d} fill={cor} stroke={TINTA} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
);

// Traço de linha com contorno: o traço escuro fica por baixo, a cor por cima.
const Trilha: React.FC<{d: string; cor: string; w?: number}> = ({d, cor, w = 9}) => (
  <>
    <path d={d} fill="none" stroke={TINTA} strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// Círculo com contorno (w = 0 tira o contorno, para pupilas e brilhos).
const Disco: React.FC<{cx: number; cy: number; r: number; cor: string; w?: number}> = ({cx, cy, r, cor, w = 5}) => (
  <circle cx={cx} cy={cy} r={r} fill={cor} stroke={w ? TINTA : 'none'} strokeWidth={w} />
);

// Frasco de poção: corpo com a cor do líquido, rolha de madeira e um símbolo por dentro.
const Frasco: React.FC<{cor: string; children?: React.ReactNode}> = ({cor, children}) => (
  <>
    <Forma d="M40 14 H60 V30 Q84 42 84 66 Q84 90 50 90 Q16 90 16 66 Q16 42 40 30 Z" cor={cor} />
    <path d="M26 62 Q26 46 37 41" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" />
    <Forma d="M36 6 H64 V16 H36 Z" cor={MADEIRA} w={5} />
    {children}
  </>
);

const Desenho: React.FC<{nome: NomeIcone; cor?: string}> = ({nome, cor}) => {
  switch (nome) {
    case 'lobo': {
      const c = cor ?? '#7b8190';
      return (
        <>
          <Forma d="M18 10 L38 32 L62 32 L82 10 L86 50 Q92 66 72 84 L50 94 L28 84 Q8 66 14 50 Z" cor={c} />
          <Forma d="M34 62 Q50 50 66 62 Q62 84 50 86 Q38 84 34 62 Z" cor="#dfe2ea" w={5} />
          <Disco cx={37} cy={46} r={7} cor="#ffd23f" w={4} />
          <Disco cx={63} cy={46} r={7} cor="#ffd23f" w={4} />
          <circle cx={38} cy={47} r={3} fill={TINTA} />
          <circle cx={62} cy={47} r={3} fill={TINTA} />
          <Forma d="M43 66 L57 66 L50 75 Z" cor={TINTA} w={3} />
        </>
      );
    }
    case 'olho': {
      const c = cor ?? '#2f7fb0';
      return (
        <>
          <Forma d="M4 50 C24 14 76 14 96 50 C76 86 24 86 4 50 Z" cor={PERGAMINHO_CLARO} />
          <Disco cx={50} cy={50} r={21} cor={c} w={5} />
          <Disco cx={50} cy={50} r={9} cor={TINTA} w={0} />
          <circle cx={57} cy={43} r={3.5} fill={PERGAMINHO_CLARO} />
        </>
      );
    }
    case 'pocao_cura': {
      const c = cor ?? '#e0465c';
      return (
        <Frasco cor={c}>
          <path d="M50 54 V78 M38 66 H62" stroke={PERGAMINHO_CLARO} strokeWidth={8} strokeLinecap="round" />
        </Frasco>
      );
    }
    case 'pocao_veneno': {
      const c = cor ?? '#6fc23a';
      return (
        <Frasco cor={c}>
          <Disco cx={40} cy={72} r={6} cor="#e9ffd0" w={3} />
          <Disco cx={60} cy={58} r={4.5} cor="#e9ffd0" w={3} />
          <Disco cx={56} cy={80} r={7} cor="#e9ffd0" w={3} />
        </Frasco>
      );
    }
    case 'besta': {
      const c = cor ?? MADEIRA;
      return (
        <>
          <Trilha d="M8 36 Q50 60 92 36" cor={MADEIRA_ESCURA} w={11} />
          <path d="M8 36 L50 62 L92 36" fill="none" stroke="#e8dcc0" strokeWidth={2.5} />
          <Forma d="M44 40 H56 L62 88 H38 Z" cor={c} w={5} />
          <Forma d="M50 14 L57 30 H43 Z" cor="#9aa3ad" w={4} />
          <Trilha d="M50 62 V24" cor="#c9b58a" w={4} />
        </>
      );
    }
    case 'aldeao': {
      const chapeu = cor ?? MADEIRA;
      return (
        <>
          <Disco cx={50} cy={58} r={30} cor={PELE} w={6} />
          <Forma d="M28 40 Q28 14 50 14 Q72 14 72 40 Z" cor={chapeu} w={5} />
          <Forma d="M14 40 Q50 26 86 40 Q86 48 50 48 Q14 48 14 40 Z" cor={chapeu} w={5} />
          <circle cx={40} cy={60} r={3.8} fill={TINTA} />
          <circle cx={60} cy={60} r={3.8} fill={TINTA} />
          <circle cx={33} cy={70} r={4.5} fill="#f0867a" opacity={0.7} />
          <circle cx={67} cy={70} r={4.5} fill="#f0867a" opacity={0.7} />
          <path d="M41 73 Q50 81 59 73" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    }
    case 'lua': {
      const c = cor ?? '#f7e7a1';
      return (
        <>
          <Forma d="M62 10 A40 40 0 1 0 90 68 A32 32 0 0 1 62 10 Z" cor={c} />
          <Disco cx={38} cy={46} r={6} cor="#d8c07a" w={3} />
          <Disco cx={44} cy={70} r={4} cor="#d8c07a" w={3} />
          <Disco cx={28} cy={64} r={3} cor="#d8c07a" w={2} />
        </>
      );
    }
    case 'sol': {
      const c = cor ?? '#ffc83d';
      const raios = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const a = (k * Math.PI) / 4;
        const x1 = 50 + 34 * Math.cos(a);
        const y1 = 50 + 34 * Math.sin(a);
        const x2 = 50 + 46 * Math.cos(a);
        const y2 = 50 + 46 * Math.sin(a);
        return <Trilha key={k} d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} cor={c} w={8} />;
      });
      return (
        <>
          {raios}
          <Disco cx={50} cy={50} r={24} cor={c} w={6} />
        </>
      );
    }
    case 'caveira': {
      const c = cor ?? '#f4efe0';
      return (
        <>
          <Forma d="M50 10 C24 10 14 30 16 48 C17 60 24 66 28 70 L28 84 L38 84 L38 90 L62 90 L62 84 L72 84 L72 70 C76 66 83 60 84 48 C86 30 76 10 50 10 Z" cor={c} />
          <circle cx={36} cy={50} r={10} fill={TINTA} />
          <circle cx={64} cy={50} r={10} fill={TINTA} />
          <Forma d="M50 58 L44 70 L56 70 Z" cor={TINTA} w={2} />
          <path d="M42 76 V84 M50 76 V84 M58 76 V84" stroke={TINTA} strokeWidth={3} />
        </>
      );
    }
    case 'mentira': {
      const c = cor ?? PELE;
      return (
        <>
          <Disco cx={40} cy={58} r={28} cor={c} w={6} />
          <Forma d="M58 52 L98 36 L60 66 Z" cor={MADEIRA} w={5} />
          <path d="M22 40 L36 44 M46 44 L58 40" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <circle cx={31} cy={54} r={4} fill={TINTA} />
          <circle cx={48} cy={54} r={4} fill={TINTA} />
          <path d="M24 68 Q34 60 46 68" fill="none" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    }
    case 'voto': {
      const c = cor ?? MADEIRA;
      return (
        <>
          <Forma d="M30 14 L62 6 L70 44 L38 52 Z" cor={PERGAMINHO_CLARO} w={5} />
          <Trilha d="M42 28 L50 36 L62 20" cor="#3f7d3a" w={5} />
          <Forma d="M16 44 H84 V88 H16 Z" cor={c} />
          <rect x={30} y={50} width={40} height={6} rx={3} fill={TINTA} />
        </>
      );
    }
    case 'carroca': {
      const c = cor ?? MADEIRA;
      return (
        <>
          <Trilha d="M74 54 L94 40" cor={MADEIRA_ESCURA} w={7} />
          <Forma d="M14 30 H74 V66 H14 Z" cor={c} />
          <path d="M34 32 V64 M54 32 V64" stroke={TINTA} strokeWidth={3} />
          <Disco cx={30} cy={76} r={13} cor={MADEIRA_ESCURA} w={6} />
          <Disco cx={66} cy={76} r={13} cor={MADEIRA_ESCURA} w={6} />
          <path d="M30 66 V86 M20 76 H40 M66 66 V86 M56 76 H76" stroke={TINTA} strokeWidth={3} />
        </>
      );
    }
    case 'fogo': {
      const c = cor ?? '#ff7a1a';
      return (
        <>
          <Forma d="M50 6 C58 28 84 40 82 66 C80 84 66 94 50 94 C34 94 18 84 18 64 C18 46 30 38 34 28 C40 38 42 44 46 46 C44 30 46 18 50 6 Z" cor={c} />
          <Forma d="M50 48 C58 60 70 66 68 78 C66 88 58 92 50 92 C42 92 34 86 34 76 C34 66 44 60 50 48 Z" cor="#ffe27a" w={4} />
        </>
      );
    }
    case 'escudo': {
      const c = cor ?? '#3b6fb0';
      return (
        <>
          <Forma d="M50 6 L88 18 V48 C88 72 70 88 50 96 C30 88 12 72 12 48 V18 Z" cor={c} />
          <Trilha d="M50 22 V86" cor={OURO} w={9} />
          <Trilha d="M24 46 H76" cor={OURO} w={9} />
        </>
      );
    }
    case 'pergaminho': {
      const c = cor ?? '#f1dfae';
      return (
        <>
          <Forma d="M22 22 H78 V80 H22 Z" cor={c} w={5} />
          <path d="M32 38 H68 M32 50 H68 M32 62 H58" stroke="#7a5a33" strokeWidth={4} strokeLinecap="round" />
          <Forma d="M14 14 H86 V28 H14 Z" cor={MADEIRA} w={5} />
          <Forma d="M14 76 H86 V90 H14 Z" cor={MADEIRA} w={5} />
        </>
      );
    }
    case 'garra': {
      const c = cor ?? '#b3262e';
      return (
        <>
          <Trilha d="M22 16 Q34 40 30 86" cor={c} w={9} />
          <Trilha d="M48 10 Q60 40 54 90" cor={c} w={9} />
          <Trilha d="M74 16 Q86 42 80 84" cor={c} w={9} />
        </>
      );
    }
    case 'coracao': {
      const c = cor ?? '#d7263d';
      return (
        <>
          <Forma d="M50 88 C20 66 8 50 8 32 C8 18 18 10 30 10 C40 10 46 16 50 24 C54 16 60 10 70 10 C82 10 92 18 92 32 C92 50 80 66 50 88 Z" cor={c} />
          <path d="M22 30 Q24 21 33 20" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
        </>
      );
    }
    case 'interrogacao': {
      const c = cor ?? '#ffc83d';
      return (
        <>
          <Trilha d="M34 36 C34 18 66 16 66 38 C66 52 50 54 50 66" cor={c} w={11} />
          <Disco cx={50} cy={82} r={7} cor={c} w={5} />
        </>
      );
    }
    case 'exclamacao': {
      const c = cor ?? '#ffc83d';
      return (
        <>
          <Trilha d="M50 12 V62" cor={c} w={13} />
          <Disco cx={50} cy={82} r={7} cor={c} w={5} />
        </>
      );
    }
    case 'check': {
      const c = cor ?? '#3fa34d';
      return <Trilha d="M18 52 L40 74 L84 26" cor={c} w={14} />;
    }
    case 'xis': {
      const c = cor ?? '#d7263d';
      return (
        <>
          <Trilha d="M22 22 L78 78" cor={c} w={14} />
          <Trilha d="M78 22 L22 78" cor={c} w={14} />
        </>
      );
    }
    default:
      return null;
  }
};

export const Icone: React.FC<{nome: NomeIcone; tamanho?: number; cor?: string}> = ({nome, tamanho = 120, cor}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible', flexShrink: 0}}>
    <Desenho nome={nome} cor={cor} />
  </svg>
);

// ---------------------------------------------------------------- Cartas de papel

const PAPEIS: Record<Papel, {nome: string; desc: string; icone: NomeIcone; acento: string}> = {
  lobisomem: {nome: 'LOBISOMEM', desc: 'Devora um aldeão a cada noite.', icone: 'lobo', acento: '#8c1d1d'},
  vidente: {nome: 'VIDENTE', desc: 'Descobre se alguém é lobo.', icone: 'olho', acento: '#2f5a9a'},
  bruxa: {nome: 'BRUXA', desc: 'Uma poção salva, outra mata.', icone: 'pocao_veneno', acento: '#2f7a3c'},
  cacador: {nome: 'CAÇADOR', desc: 'Ao morrer, leva alguém junto.', icone: 'besta', acento: '#7a4a24'},
  aldeao: {nome: 'ALDEÃO', desc: 'Sem poder. Só vota e sobrevive.', icone: 'aldeao', acento: '#6b5b3e'},
};

// Carta de tarô: começa de costas e gira (mola) até mostrar a frente no frame `at`.
// Com virada=true a carta já nasce com a frente visível.
export const CartaPapel: React.FC<{papel: Papel; at: number; virada?: boolean; tamanho?: number}> = ({
  papel,
  at,
  virada = false,
  tamanho = 220,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const info = PAPEIS[papel];
  const largura = tamanho;
  const altura = tamanho * 1.45;
  const borda = Math.max(4, largura * 0.035);
  const raio = largura * 0.07;
  const t = Math.max(0, frame - at);

  let angulo = 0;
  let ondula = 0;
  if (virada) {
    ondula = Math.sin(frame / 22) * 4;
  } else {
    const p = spring({frame: t, fps, config: {damping: 13, stiffness: 110, mass: 0.9}});
    angulo = 180 * (1 - p);
    ondula = Math.sin(t / 14) * 3 * Math.min(1, Math.max(0, p));
  }

  const moldura: React.CSSProperties = {
    position: 'absolute',
    left: largura * 0.04,
    top: largura * 0.04,
    right: largura * 0.04,
    bottom: largura * 0.04,
    borderRadius: raio * 0.6,
    border: `${Math.max(2, largura * 0.012)}px dashed rgba(139, 90, 40, 0.75)`,
    pointerEvents: 'none',
  };

  return (
    <div style={{position: 'relative', width: largura, height: altura, perspective: 1400, flexShrink: 0}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${angulo + ondula}deg)`,
        }}
      >
        {/* frente */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: raio,
            border: `${borda}px solid ${TINTA}`,
            background: 'linear-gradient(170deg, #fbf0d6 0%, #efd9a6 55%, #dcbc7c 100%)',
            boxShadow: `0 ${borda * 2}px 0 rgba(0,0,0,0.45)`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={moldura} />
          <div
            style={{
              height: '22%',
              background: info.acento,
              borderBottom: `${borda}px solid ${TINTA}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.comic,
              fontSize: largura * 0.15,
              lineHeight: 1,
              letterSpacing: 2,
              color: PERGAMINHO_CLARO,
              textShadow: `${borda * 0.6}px ${borda * 0.6}px 0 ${TINTA}`,
              whiteSpace: 'nowrap',
            }}
          >
            {info.nome}
          </div>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icone nome={info.icone} tamanho={largura * 0.5} />
          </div>
          <div
            style={{
              padding: `0 ${largura * 0.07}px ${largura * 0.1}px`,
              textAlign: 'center',
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: largura * 0.088,
              lineHeight: 1.25,
              color: TINTA,
            }}
          >
            {info.desc}
          </div>
        </div>

        {/* verso */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: raio,
            border: `${borda}px solid ${TINTA}`,
            background: 'repeating-linear-gradient(45deg, #4a2e18 0 10px, #5e3b20 10px 20px)',
            boxShadow: `0 ${borda * 2}px 0 rgba(0,0,0,0.45)`,
            overflow: 'hidden',
          }}
        >
          <div style={{...moldura, border: `${Math.max(2, largura * 0.012)}px solid #f1cf6c`}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{background: '#4a2e18', borderRadius: '50%', padding: largura * 0.05}}>
              <Icone nome="lua" tamanho={largura * 0.5} cor="#f1cf6c" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Selo de mentira

const CORES_SELO: Record<string, string> = {
  OMISSÃO: '#e8862a',
  DISTORÇÃO: '#8b4fd6',
  FABRICAÇÃO: '#d7263d',
  VERDADE: '#3fa34d',
};

// Estrela de 20 pontas que serve de carimbo.
const ESTRELA = Array.from({length: 40}, (_, k) => {
  const r = k % 2 === 0 ? 102 : 82;
  const a = (k * Math.PI) / 20 - Math.PI / 2;
  return `${(110 + r * Math.cos(a)).toFixed(1)},${(110 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

// Carimbo que estoura na tela: entra grande, bate e assenta com mola.
export const SeloMentira: React.FC<{tipo: string; at: number; x?: number; y?: number}> = ({
  tipo,
  at,
  x = 960,
  y = 540,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const t = frame - at;
  const p = spring({frame: t, fps, config: {damping: 9, stiffness: 170, mass: 0.6}});
  const escala = interpolate(p, [0, 1], [2.6, 1]);
  const giro = interpolate(p, [0, 1], [-25, -8]);
  const opacidade = interpolate(t, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cor = CORES_SELO[tipo] ?? '#d7263d';
  const longo = tipo.length > 8;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 220,
        height: 220,
        transform: `translate(-50%, -50%) scale(${escala}) rotate(${giro}deg)`,
        opacity: opacidade,
        pointerEvents: 'none',
      }}
    >
      <svg width={220} height={220} viewBox="0 0 220 220" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <polygon points={ESTRELA} fill={cor} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={110} cy={110} r={66} fill="none" stroke={PERGAMINHO_CLARO} strokeWidth={3} strokeDasharray="8 6" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: PERGAMINHO_CLARO,
        }}
      >
        <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 17, letterSpacing: 3}}>
          {tipo === 'VERDADE' ? 'CONFIRMADO' : 'MENTIRA'}
        </span>
        <span
          style={{
            fontFamily: FONT.comic,
            fontSize: longo ? 36 : 46,
            lineHeight: 1,
            marginTop: 6,
            whiteSpace: 'nowrap',
            textShadow: `4px 4px 0 ${TINTA}`,
          }}
        >
          {tipo}
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Faixa de anúncio

// Faixa de pergaminho no topo da tela, desce com mola no frame `at`.
export const Faixa: React.FC<{texto: string; icone?: NomeIcone; at: number; cor?: string}> = ({texto, icone, at, cor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: Math.max(0, frame - at), fps, config: {damping: 16, stiffness: 120}});
  const y = interpolate(p, [0, 1], [-220, 0]);
  const rolo: React.CSSProperties = {
    position: 'absolute',
    top: -12,
    bottom: -12,
    width: 44,
    borderRadius: 22,
    background: MADEIRA,
    border: `5px solid ${TINTA}`,
  };
  return (
    <div
      style={{
        position: 'absolute',
        top: 28,
        left: '50%',
        transform: `translate(-50%, ${y}px)`,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '20px 80px',
          background: 'linear-gradient(180deg, #f8ebc6 0%, #e6cb8c 100%)',
          border: `6px solid ${TINTA}`,
          borderRadius: 14,
          boxShadow: '0 10px 0 rgba(0,0,0,0.4)',
        }}
      >
        <div style={{...rolo, left: -26}} />
        <div style={{...rolo, right: -26}} />
        {icone ? <Icone nome={icone} tamanho={72} /> : null}
        <span
          style={{
            fontFamily: FONT.comic,
            fontSize: 76,
            lineHeight: 1,
            letterSpacing: 2,
            color: cor ?? '#3b1f0c',
          }}
        >
          {texto}
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Placar de votos

// Barras de votos que crescem em sequência; o mais votado pisca.
export const PlacarVotos: React.FC<{votos: {nome: string; cor: string; n: number}[]; at: number}> = ({votos, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrada = spring({frame: Math.max(0, frame - at), fps, config: {damping: 18}});
  if (frame < at - 4) return null;
  const max = Math.max(1, ...votos.map((v) => v.n));
  const ordenados = [...votos].sort((a, b) => b.n - a.n);
  const brilho = Math.sin(frame * 0.35) > 0;

  return (
    <div
      style={{
        width: 360,
        padding: '18px 22px 20px',
        background: 'linear-gradient(180deg, #f8ebc6 0%, #e6cb8c 100%)',
        border: `6px solid ${TINTA}`,
        borderRadius: 16,
        boxShadow: '0 10px 0 rgba(0,0,0,0.4)',
        opacity: Math.min(1, entrada * 1.5),
        transform: `translateY(${(1 - entrada) * 40}px)`,
        fontFamily: FONT.display,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
        <Icone nome="voto" tamanho={50} />
        <span style={{fontFamily: FONT.comic, fontSize: 50, lineHeight: 1, letterSpacing: 2, color: TINTA}}>VOTAÇÃO</span>
      </div>
      {ordenados.map((v, i) => {
        const p = Math.min(1, Math.max(0, spring({frame: Math.max(0, frame - at - 12 - i * 6), fps, config: {damping: 15, stiffness: 90}})));
        const lider = v.n === max && max > 0;
        const larguraBarra = (v.n / max) * 100 * p;
        return (
          <div
            key={v.nome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              padding: '4px 6px',
              borderRadius: 12,
              background: lider && brilho ? 'rgba(255, 210, 63, 0.7)' : 'transparent',
            }}
          >
            <div style={{width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{width: 18, height: 18, borderRadius: 9, background: v.cor, border: `3px solid ${TINTA}`, flexShrink: 0}} />
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 22,
                  color: TINTA,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {v.nome}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                height: 32,
                borderRadius: 16,
                background: '#d7bd82',
                border: `4px solid ${TINTA}`,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${larguraBarra}%`,
                  background: v.cor,
                  borderRight: larguraBarra > 0 ? `4px solid ${TINTA}` : 'none',
                }}
              />
            </div>
            <span style={{width: 40, textAlign: 'right', fontFamily: FONT.comic, fontSize: 40, lineHeight: 1, color: TINTA}}>
              {Math.round(v.n * p)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- Balões

type BalaoProps = {nome: string; cor: string; texto: string; at: number; ate: number; lado: 'esquerda' | 'direita'};

// Núcleo dos dois balões: o texto aparece letra a letra entre `at` e `ate`.
// O texto inteiro fica no layout (letras ainda não reveladas ficam invisíveis), então a caixa não treme.
const BalaoBase: React.FC<BalaoProps & {pensa: boolean}> = ({nome, cor, texto, at, ate, lado, pensa}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const entrada = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 150}});
  const letras = Math.round(
    interpolate(frame, [at, Math.max(ate, at + 1)], [0, texto.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  const dir = lado === 'direita';
  const lateral = dir ? {right: 70} : {left: 70};
  const corFundo = pensa ? '#ece6ff' : '#fff6e0';

  return (
    <div
      style={{
        position: 'relative',
        width: 430,
        display: 'flex',
        flexDirection: 'column',
        alignItems: dir ? 'flex-end' : 'flex-start',
        opacity: Math.min(1, entrada * 1.5),
        transform: `scale(${0.6 + 0.4 * entrada})`,
        transformOrigin: dir ? 'bottom right' : 'bottom left',
        fontFamily: FONT.display,
      }}
    >
      <div
        style={{
          ...(dir ? {marginRight: 40} : {marginLeft: 40}),
          marginBottom: -20,
          zIndex: 2,
          padding: '6px 22px',
          borderRadius: 999,
          background: cor,
          border: `5px solid ${TINTA}`,
          fontWeight: 900,
          fontSize: 28,
          color: TINTA,
          letterSpacing: 1,
          boxShadow: `0 4px 0 ${TINTA}`,
          whiteSpace: 'nowrap',
        }}
      >
        {nome}
      </div>
      <div
        style={{
          alignSelf: 'stretch',
          padding: '30px 30px 28px',
          minHeight: 100,
          background: corFundo,
          border: `6px ${pensa ? 'dashed' : 'solid'} ${TINTA}`,
          borderRadius: pensa ? '64px 54px 60px 50px' : 28,
          boxShadow: pensa ? 'none' : `0 8px 0 rgba(0,0,0,0.4)`,
          fontSize: 34,
          fontWeight: 600,
          fontStyle: pensa ? 'italic' : 'normal',
          lineHeight: 1.3,
          color: TINTA,
        }}
      >
        {texto.slice(0, letras)}
        <span style={{opacity: 0}}>{texto.slice(letras)}</span>
      </div>
      {pensa ? (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: -34,
              ...lateral,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: corFundo,
              border: `4px solid ${TINTA}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -58,
              ...(dir ? {right: 48} : {left: 48}),
              width: 14,
              height: 14,
              borderRadius: 7,
              background: corFundo,
              border: `3px solid ${TINTA}`,
            }}
          />
        </>
      ) : (
        <svg width={60} height={34} viewBox="0 0 60 34" style={{position: 'absolute', bottom: -33, ...lateral, overflow: 'visible'}}>
          <polygon
            points={dir ? '6,0 54,0 44,33' : '6,0 54,0 16,33'}
            fill={corFundo}
            stroke={TINTA}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export const BalaoFala: React.FC<BalaoProps> = (props) => <BalaoBase {...props} pensa={false} />;
export const BalaoPensa: React.FC<BalaoProps> = (props) => <BalaoBase {...props} pensa={true} />;

// ---------------------------------------------------------------- Chat dos lobos

// Pergaminho vermelho com garras. Mostra as últimas 4 mensagens já enviadas.
export const ChatLobos: React.FC<{mensagens: {nome: string; cor: string; texto: string; at: number}[]}> = ({mensagens}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inicio = mensagens.length ? Math.min(...mensagens.map((m) => m.at)) : 0;
  if (frame < inicio - 15) return null;
  const entrada = spring({frame: Math.max(0, frame - (inicio - 15)), fps, config: {damping: 16}});
  const visiveis = mensagens
    .map((m, i) => ({m, i}))
    .filter(({m}) => frame >= m.at)
    .slice(-4);

  return (
    <div
      style={{
        width: 430,
        padding: '18px 26px 26px',
        background: 'linear-gradient(180deg, #a52a2a 0%, #7a1719 100%)',
        border: `7px solid ${TINTA}`,
        borderRadius: 16,
        boxShadow: '0 10px 0 rgba(0,0,0,0.45)',
        opacity: Math.min(1, entrada * 1.5),
        transform: `translateY(${(1 - entrada) * 40}px)`,
        fontFamily: FONT.display,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingBottom: 12,
          marginBottom: 16,
          borderBottom: '4px dashed rgba(244, 228, 188, 0.5)',
        }}
      >
        <Icone nome="garra" tamanho={58} cor="#f4e4bc" />
        <span
          style={{
            fontFamily: FONT.comic,
            fontSize: 46,
            lineHeight: 1,
            letterSpacing: 2,
            color: '#f4e4bc',
            whiteSpace: 'nowrap',
            textShadow: `3px 3px 0 ${TINTA}`,
          }}
        >
          CHAT DOS LOBOS
        </span>
      </div>
      {visiveis.map(({m, i}) => {
        const s = spring({frame: Math.max(0, frame - m.at), fps, config: {damping: 16, stiffness: 160}});
        return (
          <div key={i} style={{marginBottom: 14, opacity: Math.min(1, s * 1.6), transform: `translateX(${(1 - s) * -50}px)`}}>
            <span style={{fontWeight: 900, fontSize: 26, color: m.cor, textShadow: `2px 2px 0 ${TINTA}`, marginRight: 10}}>
              {m.nome}:
            </span>
            <span style={{fontWeight: 600, fontSize: 26, lineHeight: 1.3, color: '#fff3dc'}}>{m.texto}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- Contador de dia/noite

// Plaquinha no canto superior direito: lua na noite, sol de dia.
export const ContadorDia: React.FC<{dia: number; noite: boolean}> = ({dia, noite}) => (
  <div
    style={{
      position: 'absolute',
      top: 36,
      right: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 26px 12px 16px',
      background: noite ? 'linear-gradient(180deg, #2c3a6b 0%, #1a2249 100%)' : 'linear-gradient(180deg, #ffe08a 0%, #f4b64a 100%)',
      border: `6px solid ${TINTA}`,
      borderRadius: 16,
      boxShadow: '0 8px 0 rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}
  >
    <Icone nome={noite ? 'lua' : 'sol'} tamanho={64} />
    <span
      style={{
        fontFamily: FONT.comic,
        fontSize: 60,
        lineHeight: 1,
        letterSpacing: 2,
        color: noite ? '#f4e4bc' : TINTA,
        whiteSpace: 'nowrap',
      }}
    >
      {noite ? `NOITE ${dia}` : `DIA ${dia}`}
    </span>
  </div>
);
