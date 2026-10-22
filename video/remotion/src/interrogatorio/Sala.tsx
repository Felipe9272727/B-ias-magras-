// Sala de interrogatório em 2.5D: cenário em camadas com paralaxe, desenhado em SVG e divs (nada de imagem externa).
// Camadas, de trás para frente:
//   fundo      paredes, chão, teto, relógio, monitor, espelho falso, porta, câmera, cartazes
//   meio       cadeiras e os dois personagens (slots), que ficam atrás das bancadas
//   frente     as duas bancadas com os objetos em cima (pasta, caneta, caneca, copo d'água, algemas)
//   luz        lâmpada balançando, cone de luz e poeira no feixe
//   primeiro   planta desfocada bem na frente, para dar profundidade
// Cada camada tem uma profundidade (PROF): quanto maior, mais ela anda e cresce com a câmera (paralaxe).
import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

export type Camera = {x: number; zoom: number}; // x: -1 (detetive, esquerda) .. 0 (geral) .. 1 (suspeito, direita); zoom 1..1.8
export const ASSENTO = {detetive: {x: 520, y: 760}, suspeito: {x: 1400, y: 760}, altura: 460};

const CX = 960; // centro da tela (origem das transformações)
const CY = 540;
const PAD = 600; // margem extra: o cenário continua além da borda, para o paralaxe não mostrar vazio
const INK = '#14141f'; // contorno grosso do estilo do canal
const SW = 6;
const U_MIN = -1.6; // parede lateral segue além da tela pelo mesmo caminho em perspectiva

// profundidade de cada camada
const PROF = {fundo: 0, meio: 0.8, luz: 0.5, frente: 1, primeiro: 1.4};

// transformação da camada: a escala cresce menos nas camadas de trás, e o deslocamento também
function transformacao(cam: Camera, d: number): string {
  const s = 1 + (cam.zoom - 1) * (0.5 + 0.5 * d);
  const pan = 0.45 + 0.55 * d;
  const fx = CX + cam.x * 480; // x = -1 foca em 480, x = 1 em 1440
  const tx = -(fx - CX) * s * pan;
  return `translate(${tx}px, 0px) scale(${s})`;
}

// Camada: div 1920x1080 transformada pela câmera; o conteúdo usa coordenadas do cenário
const Camada: React.FC<{cam: Camera; d: number; z: number; children: React.ReactNode}> = ({cam, d, z, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${CX}px ${CY}px`, transform: transformacao(cam, d), zIndex: z}}>
    {children}
  </div>
);

// SVG que cobre a camada inteira (com margem), usando as coordenadas do cenário
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg
    width={1920 + 2 * PAD}
    height={1080 + 2 * PAD}
    viewBox={`${-PAD} ${-PAD} ${1920 + 2 * PAD} ${1080 + 2 * PAD}`}
    style={{position: 'absolute', left: -PAD, top: -PAD, overflow: 'visible'}}
  >
    {children}
  </svg>
);

// Personagem num slot: a base do busto (ASSENTO.x, ASSENTO.y) fica no fundo da caixa
const Slot: React.FC<{p: {x: number; y: number}; children?: React.ReactNode}> = ({p, children}) => (
  <div
    style={{
      position: 'absolute',
      left: p.x - ASSENTO.altura / 2,
      top: p.y - ASSENTO.altura,
      width: ASSENTO.altura,
      height: ASSENTO.altura,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

// Perspectiva das paredes laterais: u = 0 na borda da tela, 1 no canto com o fundo; v = 0 em cima, 1 embaixo
const ladoEsq = (u: number, v: number): [number, number] => [330 * u, 130 * u + v * (1080 - 510 * u)];
const ladoDir = (u: number, v: number): [number, number] => [1920 - 330 * u, 130 * u + v * (1080 - 510 * u)];
// quadrilátero num lado da sala (porta, espelho)
const quad = (lado: typeof ladoEsq, u0: number, v0: number, u1: number, v1: number): [number, number][] => [
  lado(u0, v0),
  lado(u1, v0),
  lado(u1, v1),
  lado(u0, v1),
];
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

// pseudo-aleatório determinístico (para o tremor não ser igual a cada quadro)
const rnd = (n: number) => {
  const x = Math.sin(n * 91.345 + 7.13) * 43758.5453;
  return x - Math.floor(x);
};

// ponteiros do relógio a partir de "HH:MM"
function ponteiros(hora: string) {
  const m = /(\d{1,2}):(\d{2})/.exec(hora);
  const h = m ? Number(m[1]) % 12 : 12;
  const mi = m ? Number(m[2]) : 0;
  return {hora: (h + mi / 60) * 30, minuto: mi * 6};
}

// Bancada da frente: tampo visto de cima (perspectiva leve), face de madeira e rodapé, com contorno grosso
const Bancada: React.FC<{cx: number; children?: React.ReactNode}> = ({cx, children}) => (
  <g>
    {/* sombra no chão */}
    <ellipse cx={cx} cy={928} rx={380} ry={24} fill="#000" opacity={0.38} />
    {/* face frontal */}
    <rect x={cx - 350} y={792} width={700} height={110} fill="#9c6436" stroke={INK} strokeWidth={SW} />
    <rect x={cx - 350} y={792} width={700} height={14} fill="#6e4424" />
    {/* veios da madeira e painéis */}
    {[818, 846, 874].map((y) => (
      <path key={y} d={`M${cx - 330} ${y} Q${cx} ${y + 6} ${cx + 330} ${y}`} stroke="#7d4d26" strokeWidth={4} fill="none" opacity={0.7} />
    ))}
    <rect x={cx - 300} y={824} width={220} height={52} rx={6} fill="none" stroke="#7d4d26" strokeWidth={4} opacity={0.6} />
    <rect x={cx + 80} y={824} width={220} height={52} rx={6} fill="none" stroke="#7d4d26" strokeWidth={4} opacity={0.6} />
    {/* rodapé */}
    <rect x={cx - 362} y={902} width={724} height={18} rx={4} fill="#5a3a22" stroke={INK} strokeWidth={5} />
    {/* tampo: topo da bancada, com a borda da frente mais grossa (cel shading) */}
    <polygon points={`${cx - 320},735 ${cx + 320},735 ${cx + 350},792 ${cx - 350},792`} fill="#e2b07a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <polygon points={`${cx - 350},792 ${cx + 350},792 ${cx + 336},772 ${cx - 336},772`} fill="#c98f5a" />
    <line x1={cx - 300} y1={748} x2={cx + 300} y2={748} stroke="#f7dcb5" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
    {children}
  </g>
);

// Caneca de café com vapor animado
const Caneca: React.FC<{cx: number; f: number}> = ({cx, f}) => (
  <g>
    {/* vapor: três fios que sobem e somem em loop */}
    {[0, 1, 2].map((i) => {
      const k = ((f * 0.7 + i * 17) % 34) / 34;
      return (
        <path
          key={i}
          d={`M${cx + 92 + i * 14} ${690} c -12 -8 12 -16 0 -26 c -10 -8 8 -14 0 -22`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.85 * (1 - k)}
          transform={`translate(0, ${-k * 26})`}
        />
      );
    })}
    <path d={`M${cx + 128} 726 q 24 2 0 24`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d={`M${cx + 128} 726 q 24 2 0 24`} fill="none" stroke="#fff7ea" strokeWidth={4} strokeLinecap="round" />
    <rect x={cx + 70} y={716} width={62} height={56} rx={10} fill="#fff7ea" stroke={INK} strokeWidth={SW} />
    <rect x={cx + 72} y={740} width={58} height={10} fill="#ff7a59" />
    <ellipse cx={cx + 101} cy={716} rx={28} ry={6} fill="#5b3420" stroke={INK} strokeWidth={4} />
  </g>
);

// Pasta de caso manila com etiqueta, papéis saindo e uma caneta
const PastaCaso: React.FC<{cx: number}> = ({cx}) => (
  <g>
    <g transform={`rotate(3 ${cx - 205} 712)`}>
      <rect x={cx - 262} y={690} width={130} height={44} fill="#fbfaf3" stroke={INK} strokeWidth={4} />
    </g>
    <rect x={cx - 290} y={700} width={170} height={72} rx={4} fill="#e8c46a" stroke={INK} strokeWidth={SW} />
    <rect x={cx - 290} y={690} width={62} height={18} rx={3} fill="#f2d68a" stroke={INK} strokeWidth={5} />
    <rect x={cx - 262} y={724} width={112} height={32} fill="#ffffff" stroke={INK} strokeWidth={3} />
    <text x={cx - 206} y={747} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={19} fill={INK}>CASO 047</text>
    <g transform={`rotate(-14 ${cx - 60} 766)`}>
      <rect x={cx - 70} y={760} width={110} height={12} rx={6} fill="#1f4fd1" stroke={INK} strokeWidth={4} />
      <rect x={cx + 36} y={758} width={12} height={16} fill="#c9d1dc" stroke={INK} strokeWidth={3} />
    </g>
  </g>
);

// Copo d'água: a água balança com o tremor da câmera (impacto)
const CopoAgua: React.FC<{cx: number; f: number; tremor: number}> = ({cx, f, tremor}) => {
  const amp = 1.5 + tremor * 12;
  const onda = (i: number) => 722 + amp * Math.sin(f * 0.3 + i * 2.4);
  return (
    <g>
      <ellipse cx={cx} cy={690} rx={32} ry={6} fill="#dff3fb" stroke={INK} strokeWidth={4} />
      <polygon
        points={`${cx - 32},690 ${cx + 32},690 ${cx + 24},772 ${cx - 24},772`}
        fill="rgba(200,235,255,0.28)"
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <polygon
        points={`${cx - 29},${onda(0)} ${cx - 20},${onda(1)} ${cx - 8},${onda(2)} ${cx + 4},${onda(3)} ${cx + 16},${onda(4)} ${cx + 28},${onda(5)} ${cx + 23},772 ${cx - 23},772`}
        fill="#4fb3e6"
      />
      <path
        d={`M${cx - 29} ${onda(0)} L${cx - 20} ${onda(1)} L${cx - 8} ${onda(2)} L${cx + 4} ${onda(3)} L${cx + 16} ${onda(4)} L${cx + 28} ${onda(5)}`}
        fill="none"
        stroke="#dff6ff"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <line x1={cx - 22} y1={700} x2={cx - 18} y2={750} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

// Algemas largadas em cima da bancada
const Algemas: React.FC<{cx: number}> = ({cx}) => (
  <g>
    <path d={`M${cx + 14} 758 q 34 -12 60 2`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d={`M${cx + 14} 758 q 34 -12 60 2`} fill="none" stroke="#c9d1dc" strokeWidth={4} strokeLinecap="round" />
    <circle cx={cx + 6} cy={762} r={13} fill="none" stroke={INK} strokeWidth={12} />
    <circle cx={cx + 6} cy={762} r={13} fill="none" stroke="#c9d1dc" strokeWidth={5} />
    <circle cx={cx + 82} cy={764} r={13} fill="none" stroke={INK} strokeWidth={12} />
    <circle cx={cx + 82} cy={764} r={13} fill="none" stroke="#c9d1dc" strokeWidth={5} />
  </g>
);

// Cadeira de escritório atrás do personagem (só as laterais e o encosto aparecem)
const Cadeira: React.FC<{cx: number}> = ({cx}) => (
  <g>
    <rect x={cx - 220} y={420} width={440} height={380} rx={44} fill="#3a4150" stroke={INK} strokeWidth={SW} />
    <rect x={cx - 204} y={436} width={60} height={340} rx={24} fill="#56607a" opacity={0.7} />
    <rect x={cx - 150} y={800} width={300} height={22} rx={8} fill="#2c3240" stroke={INK} strokeWidth={5} />
  </g>
);

export const SalaInterrogatorio: React.FC<{
  camera: Camera;
  detetive?: React.ReactNode;
  suspeito?: React.ReactNode;
  monitor?: React.ReactNode;
  relogio?: string;
  luz?: number;
  tremor?: number;
}> = ({camera, detetive, suspeito, monitor, relogio = '12:00', luz = 1, tremor = 0}) => {
  const f = useCurrentFrame();
  const uid = useId().replace(/:/g, '');
  const idChao = `${uid}-chao`;
  const idEsq = `${uid}-esq`;
  const idDir = `${uid}-dir`;
  const idTeto = `${uid}-teto`;
  const idCone = `${uid}-cone`;
  const idBrilho = `${uid}-brilho`;
  const idBorrao = `${uid}-borrao`;
  const idVidro = `${uid}-vidro`;
  const idPorta = `${uid}-porta`;
  const cam = camera;
  const L = Math.max(0, Math.min(1, luz));
  const T = Math.max(0, Math.min(1, tremor));

  // tremor: sacode o cenário inteiro (câmera), com intensidade que cai com o valor
  const sx = (rnd(f) - 0.5) * 2 * T * 22;
  const sy = (rnd(f + 500) - 0.5) * 2 * T * 16;

  // chão em perspectiva: linhas que convergem para o ponto de fuga (960, 380)
  const chaoPontos: [number, number][] = [ladoEsq(U_MIN, 1), ladoDir(U_MIN, 1), ladoDir(1, 1), ladoEsq(1, 1)];
  const fuga = (xb: number, yb: number, yFim: number) => {
    const t = (yFim - 380) / (yb - 380);
    return [960 + (xb - 960) * t, yFim] as [number, number];
  };
  const linhasChao: React.ReactNode[] = [];
  for (let i = -8; i <= 8; i++) {
    const xb = 960 + i * 120;
    const [xf, yf] = fuga(xb, 700, 1700);
    linhasChao.push(<line key={`cv${i}`} x1={xb} y1={700} x2={xf} y2={yf} stroke="#6d4a2c" strokeWidth={4} opacity={0.55} />);
  }
  for (const y of [700, 748, 812, 892, 990, 1110, 1260, 1450]) {
    linhasChao.push(<line key={`ch${y}`} x1={-600} y1={y} x2={2520} y2={y} stroke="#6d4a2c" strokeWidth={4} opacity={0.55} />);
  }

  // teto: vigas de perspectiva
  const linhasTeto: React.ReactNode[] = [];
  for (let i = -6; i <= 6; i++) {
    const xb = 960 + i * 110;
    const t = (-260 - 380) / (130 - 380);
    linhasTeto.push(<line key={`tv${i}`} x1={xb} y1={130} x2={960 + (xb - 960) * t} y2={-260} stroke="#1c212b" strokeWidth={4} opacity={0.6} />);
  }

  // azulejos das paredes laterais (linhas na perspectiva)
  const azEsq: React.ReactNode[] = [];
  const azDir: React.ReactNode[] = [];
  for (const u of [0.25, 0.5, 0.75, 1]) {
    const [x0, y0] = ladoEsq(u, 0);
    const [x1, y1] = ladoEsq(u, 1);
    azEsq.push(<line key={`e${u}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2f5f58" strokeWidth={3} opacity={0.5} />);
    const [x2, y2] = ladoDir(u, 0);
    const [x3, y3] = ladoDir(u, 1);
    azDir.push(<line key={`d${u}`} x1={x2} y1={y2} x2={x3} y2={y3} stroke="#2f5f58" strokeWidth={3} opacity={0.5} />);
  }
  for (const v of [0.2, 0.4, 0.6, 0.8]) {
    const [x0, y0] = ladoEsq(U_MIN, v);
    const [x1, y1] = ladoEsq(1, v);
    azEsq.push(<line key={`eh${v}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2f5f58" strokeWidth={3} opacity={0.5} />);
    const [x2, y2] = ladoDir(U_MIN, v);
    const [x3, y3] = ladoDir(1, v);
    azDir.push(<line key={`dh${v}`} x1={x2} y1={y2} x2={x3} y2={y3} stroke="#2f5f58" strokeWidth={3} opacity={0.5} />);
  }

  // porta de metal na parede esquerda: moldura, folha, painéis e janelinha
  const porta = (
    <g>
      <polygon points={pts(quad(ladoEsq, 0.16, 0.1, 0.52, 0.98))} fill="#2e3440" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <polygon points={pts(quad(ladoEsq, 0.19, 0.13, 0.49, 0.95))} fill="#8a95a2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <polygon points={pts(quad(ladoEsq, 0.22, 0.2, 0.46, 0.5))} fill="#7c8694" stroke="#5c6572" strokeWidth={3} />
      <polygon points={pts(quad(ladoEsq, 0.22, 0.56, 0.46, 0.9))} fill="#7c8694" stroke="#5c6572" strokeWidth={3} />
      <polygon points={pts(quad(ladoEsq, 0.28, 0.24, 0.4, 0.36))} fill="#1d2a35" stroke={INK} strokeWidth={4} />
      <polygon points={pts([ladoEsq(0.3, 0.27), ladoEsq(0.34, 0.27), ladoEsq(0.3, 0.31)])} fill="#ffffff" opacity={0.35} />
      <circle cx={ladoEsq(0.46, 0.55)[0]} cy={ladoEsq(0.46, 0.55)[1]} r={9} fill="#e8ecf2" stroke={INK} strokeWidth={4} />
      {/* placa da sala */}
      <rect x={ladoEsq(0.25, 0.1)[0] - 28} y={ladoEsq(0.25, 0.1)[1] - 6} width={56} height={22} rx={3} fill="#ffd21f" stroke={INK} strokeWidth={3} />
    </g>
  );

  // espelho falso grande na parede direita: vidro escuro, reflexo e uma silhueta bem discreta do outro lado
  const [cxEsp, cyEsp] = ladoDir(0.6, 0.42);
  const espelho = (
    <g>
      <polygon points={pts(quad(ladoDir, 0.3, 0.08, 0.92, 0.74))} fill="#c9ced6" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <polygon points={pts(quad(ladoDir, 0.36, 0.14, 0.86, 0.68))} fill={`url(#${idVidro})`} stroke={INK} strokeWidth={4} />
      <polygon
        points={pts([ladoDir(0.7, 0.14), ladoDir(0.8, 0.14), ladoDir(0.5, 0.68), ladoDir(0.4, 0.68)])}
        fill="#ffffff"
        opacity={0.12}
      />
      <g opacity={0.14 + 0.08 * Math.sin(f / 45)}>
        <ellipse cx={cxEsp} cy={cyEsp - 40} rx={15} ry={19} fill="#0a1218" />
        <path d={`M${cxEsp - 46} ${cyEsp + 120} Q${cxEsp} ${cyEsp + 26} ${cxEsp + 46} ${cyEsp + 120} Z`} fill="#0a1218" />
      </g>
    </g>
  );

  // cartazes e placas da parede do fundo
  const relogioPonteiros = ponteiros(relogio);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0c0d14'}}>
      {/* tremor da câmera: sacode tudo, sem afetar o paralaxe */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`, overflow: 'hidden', background: '#0c0d14'}}>
        {/* ===== FUNDO ===== */}
        <Camada cam={cam} d={PROF.fundo} z={0}>
          <Svg>
            <defs>
              <clipPath id={idChao}>
                <polygon points={pts(chaoPontos)} />
              </clipPath>
              <clipPath id={idEsq}>
                <polygon points={pts([ladoEsq(U_MIN, 0), ladoEsq(1, 0), ladoEsq(1, 1), ladoEsq(U_MIN, 1)])} />
              </clipPath>
              <clipPath id={idDir}>
                <polygon points={pts([ladoDir(U_MIN, 0), ladoDir(1, 0), ladoDir(1, 1), ladoDir(U_MIN, 1)])} />
              </clipPath>
              <clipPath id={idTeto}>
                <polygon points={pts([ladoEsq(U_MIN, 0), ladoDir(U_MIN, 0), ladoDir(1, 0), ladoEsq(1, 0)])} />
              </clipPath>
              <radialGradient id={`${idBrilho}-parede`}>
                <stop offset="0" stopColor="#fff2c0" stopOpacity={0.45} />
                <stop offset="1" stopColor="#fff2c0" stopOpacity={0} />
              </radialGradient>
              <linearGradient id={idVidro} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#33454f" />
                <stop offset="0.5" stopColor="#1a252d" />
                <stop offset="1" stopColor="#24333c" />
              </linearGradient>
            </defs>

            {/* teto */}
            <polygon points={pts([ladoEsq(U_MIN, 0), ladoDir(U_MIN, 0), ladoDir(1, 0), ladoEsq(1, 0)])} fill="#2c3340" />
            <g clipPath={`url(#${idTeto})`}>{linhasTeto}</g>
            <polygon points={pts([ladoEsq(U_MIN, 0), ladoDir(U_MIN, 0), ladoDir(1, 0), ladoEsq(1, 0)])} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />

            {/* parede esquerda (mais escura, sem a luz da lâmpada) */}
            <polygon points={pts([ladoEsq(U_MIN, 0), ladoEsq(1, 0), ladoEsq(1, 1), ladoEsq(U_MIN, 1)])} fill="#5b9488" />
            <g clipPath={`url(#${idEsq})`}>{azEsq}</g>
            <polygon points={pts([ladoEsq(U_MIN, 0), ladoEsq(1, 0), ladoEsq(1, 1), ladoEsq(U_MIN, 1)])} fill="none" stroke={INK} strokeWidth={SW} />

            {/* rodapés das paredes laterais, para fechar a sala com a parede do fundo */}
            <polygon points={pts([ladoEsq(U_MIN, 0.975), ladoEsq(1, 0.975), ladoEsq(1, 1), ladoEsq(U_MIN, 1)])} fill="#2b2f3a" />
            <polygon points={pts([ladoDir(U_MIN, 0.975), ladoDir(1, 0.975), ladoDir(1, 1), ladoDir(U_MIN, 1)])} fill="#262a34" />

            {/* parede direita */}
            <polygon points={pts([ladoDir(U_MIN, 0), ladoDir(1, 0), ladoDir(1, 1), ladoDir(U_MIN, 1)])} fill="#4c8077" />
            <g clipPath={`url(#${idDir})`}>{azDir}</g>
            <polygon points={pts([ladoDir(U_MIN, 0), ladoDir(1, 0), ladoDir(1, 1), ladoDir(U_MIN, 1)])} fill="none" stroke={INK} strokeWidth={SW} />

            {/* parede do fundo: azulejo verde-água com rodapé escuro */}
            <rect x={330} y={130} width={1260} height={570} fill="#7dbfb4" />
            {Array.from({length: 15}, (_, i) => (
              <line key={`av${i}`} x1={330 + i * 90} y1={130} x2={330 + i * 90} y2={700} stroke="#5ea398" strokeWidth={3} />
            ))}
            {Array.from({length: 7}, (_, i) => (
              <line key={`ah${i}`} x1={330} y1={130 + i * 95} x2={1590} y2={130 + i * 95} stroke="#5ea398" strokeWidth={3} />
            ))}
            <rect x={330} y={612} width={1260} height={88} fill="#4f9288" />
            <rect x={330} y={612} width={1260} height={8} fill="#2b5f58" />
            <rect x={330} y={692} width={1260} height={8} fill="#2b2f3a" />

            {/* poça de luz da lâmpada na parede do fundo (dá sensação de luz quente no centro) */}
            <ellipse cx={960} cy={430} rx={640} ry={330} fill={`url(#${idBrilho}-parede)`} opacity={0.5 * L + 0.2} />

            {/* porta de metal */}
            {porta}

            {/* espelho falso */}
            {espelho}

            {/* chão em perspectiva (tacos cinza-marrom) */}
            <polygon points={pts(chaoPontos)} fill="#a87a4f" />
            <g clipPath={`url(#${idChao})`}>{linhasChao}</g>
            <polygon points={pts(chaoPontos)} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />

            {/* sombra da parede no chão, logo atrás da sala */}
            <rect x={330} y={700} width={1260} height={30} fill="#000" opacity={0.25} />

            {/* ----- relógio de parede ----- */}
            <g>
              <rect x={424} y={130} width={12} height={20} fill="#2a2f3b" />
              <circle cx={430} cy={190} r={58} fill="#f6efdc" stroke={INK} strokeWidth={SW} />
              <circle cx={430} cy={190} r={50} fill="none" stroke="#d9573b" strokeWidth={8} />
              {Array.from({length: 12}, (_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return (
                  <line key={`tk${i}`} x1={430 + Math.sin(a) * 38} y1={190 - Math.cos(a) * 38} x2={430 + Math.sin(a) * 44} y2={190 - Math.cos(a) * 44} stroke={INK} strokeWidth={4} strokeLinecap="round" />
                );
              })}
              <line x1={430} y1={190} x2={430 + Math.sin((relogioPonteiros.hora * Math.PI) / 180) * 24} y2={190 - Math.cos((relogioPonteiros.hora * Math.PI) / 180) * 24} stroke={INK} strokeWidth={9} strokeLinecap="round" />
              <line x1={430} y1={190} x2={430 + Math.sin((relogioPonteiros.minuto * Math.PI) / 180) * 36} y2={190 - Math.cos((relogioPonteiros.minuto * Math.PI) / 180) * 36} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <circle cx={430} cy={190} r={5} fill="#d9573b" stroke={INK} strokeWidth={3} />
              <rect x={372} y={254} width={116} height={30} rx={6} fill="#1e2430" stroke={INK} strokeWidth={4} />
            </g>

            {/* ----- câmera de segurança no canto, com LED vermelho piscando ----- */}
            <g>
              <line x1={1540} y1={130} x2={1540} y2={164} stroke={INK} strokeWidth={8} />
              <g transform="rotate(-12 1520 196)">
                <rect x={1466} y={164} width={96} height={46} rx={14} fill="#3d4352" stroke={INK} strokeWidth={SW} />
                <circle cx={1478} cy={187} r={13} fill="#0c0d14" stroke={INK} strokeWidth={4} />
                <circle cx={1474} cy={183} r={3.5} fill="#7fa6c9" />
              </g>
              <circle cx={1566} cy={178} r={7} fill={Math.floor(f / 12) % 2 === 0 ? '#ff2a2a' : '#6b1414'} stroke={INK} strokeWidth={3} />
              {Math.floor(f / 12) % 2 === 0 && <circle cx={1566} cy={178} r={16} fill="#ff2a2a" opacity={0.25} />}
            </g>

            {/* ----- cartazes ----- */}
            <g transform="rotate(-4 1295 238)">
              <rect x={1190} y={168} width={210} height={140} fill="#ffd21f" stroke={INK} strokeWidth={SW} />
              <rect x={1200} y={178} width={190} height={120} fill="none" stroke="#e63946" strokeWidth={3} strokeDasharray="8 6" />
              <text x={1295} y={222} textAnchor="middle" fontFamily={FONT.comic} fontSize={46} fill="#e63946" stroke={INK} strokeWidth={2}>PROIBIDO</text>
              <text x={1295} y={284} textAnchor="middle" fontFamily={FONT.comic} fontSize={58} fill="#e63946" stroke={INK} strokeWidth={2}>MENTIR</text>
              <circle cx={1295} cy={172} r={7} fill="#e63946" stroke={INK} strokeWidth={3} />
            </g>
            <g transform="rotate(1.5 960 605)">
              <rect x={752} y={560} width={416} height={90} rx={6} fill="#d7263d" stroke={INK} strokeWidth={SW} />
              <rect x={762} y={570} width={396} height={70} rx={3} fill="none" stroke="#ffffff" strokeWidth={3} strokeDasharray="10 7" />
              <text x={960} y={598} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={24} fill="#ffffff">SORRIA, VOCÊ ESTÁ</text>
              <text x={960} y={632} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={24} fill="#ffd21f">SENDO INTERROGADO</text>
            </g>

            {/* suporte do monitor */}
            <rect x={938} y={504} width={44} height={16} rx={4} fill="#2a2f3b" stroke={INK} strokeWidth={4} />
          </Svg>

          {/* moldura do monitor (bezel) e a tela, que recebe o conteúdo do HUD */}
          <div style={{position: 'absolute', left: 764, top: 254, width: 392, height: 252, boxSizing: 'border-box', background: '#1b1e27', border: `${SW}px solid ${INK}`, borderRadius: 14, boxShadow: '0 10px 0 rgba(20,20,31,0.35)'}} />
          <div style={{position: 'absolute', left: 780, top: 270, width: 360, height: 220, overflow: 'hidden', borderRadius: 6, background: '#05080c', boxShadow: '0 0 40px rgba(120,220,255,0.22)'}}>
            {monitor}
            {/* linhas de varredura por cima da tela */}
            <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)'}} />
          </div>
        </Camada>

        {/* ===== MEIO: cadeiras e personagens (atrás das bancadas) ===== */}
        <Camada cam={cam} d={PROF.meio} z={1}>
          <Svg>
            <Cadeira cx={ASSENTO.detetive.x} />
            <Cadeira cx={ASSENTO.suspeito.x} />
          </Svg>
          <Slot p={ASSENTO.detetive}>{detetive}</Slot>
          <Slot p={ASSENTO.suspeito}>{suspeito}</Slot>
        </Camada>

        {/* ===== FRENTE: as duas bancadas com os objetos em cima ===== */}
        <Camada cam={cam} d={PROF.frente} z={2}>
          <Svg>
            <Bancada cx={ASSENTO.detetive.x}>
              <PastaCaso cx={ASSENTO.detetive.x} />
              <Caneca cx={ASSENTO.detetive.x} f={f} />
            </Bancada>
            <Bancada cx={ASSENTO.suspeito.x}>
              <CopoAgua cx={ASSENTO.suspeito.x - 40} f={f} tremor={T} />
              <Algemas cx={ASSENTO.suspeito.x} />
            </Bancada>
          </Svg>
        </Camada>

        {/* ===== LUZ: lâmpada balançando, cone de luz e poeira no feixe ===== */}
        <Camada cam={cam} d={PROF.luz} z={3}>
          <Svg>
            <defs>
              <linearGradient id={idCone} gradientUnits="userSpaceOnUse" x1={0} y1={236} x2={0} y2={1010}>
                <stop offset="0" stopColor="#fff3c4" stopOpacity={0.75} />
                <stop offset="0.55" stopColor="#ffe08a" stopOpacity={0.22} />
                <stop offset="1" stopColor="#ffe08a" stopOpacity={0} />
              </linearGradient>
              <radialGradient id={idBrilho}>
                <stop offset="0" stopColor="#fff6c9" stopOpacity={0.95} />
                <stop offset="1" stopColor="#ffe38a" stopOpacity={0} />
              </radialGradient>
            </defs>
            {(() => {
              const balanco = Math.sin(f * 0.045) * 2.2; // graus
              const poeira = Array.from({length: 12}, (_, i) => {
                const t = (f * 0.5 + i * 53) % 500;
                const y = 260 + t * 1.4;
                const x = 960 + Math.sin((f + i * 40) / 60) * (t * 0.5 + 40) * (i % 2 ? 1 : -1) * 0.6;
                return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#fff7d6" opacity={0.6 * L} />;
              });
              return (
                <g>
                  <g transform={`rotate(${balanco} 960 -40)`} opacity={0.15 + 0.85 * L}>
                    <polygon points="896,236 1024,236 1560,1010 360,1010" fill={`url(#${idCone})`} />
                    <line x1={960} y1={-40} x2={960} y2={168} stroke={INK} strokeWidth={5} />
                    <rect x={935} y={160} width={50} height={12} rx={3} fill="#3a4150" stroke={INK} strokeWidth={4} />
                    <path d="M905 178 L1015 178 L1060 236 L860 236 Z" fill="#f9d65c" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
                    <path d="M960 178 L1015 178 L1060 236 L960 236 Z" fill="#c99a1f" opacity={0.6} />
                    <circle cx={960} cy={238} r={20} fill="#fff6c9" />
                    <circle cx={960} cy={238} r={120} fill={`url(#${idBrilho})`} opacity={0.5 * L} />
                  </g>
                  <g>{poeira}</g>
                </g>
              );
            })()}
          </Svg>
        </Camada>

        {/* ===== PRIMEIRO PLANO: planta desfocada, bem perto da câmera ===== */}
        <Camada cam={cam} d={PROF.primeiro} z={4}>
          <Svg>
            <defs>
              <filter id={idBorrao} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={9} />
              </filter>
            </defs>
            <g filter={`url(#${idBorrao})`}>
              <ellipse cx={1760} cy={880} rx={70} ry={150} transform="rotate(-25 1760 880)" fill="#2f7d4a" stroke={INK} strokeWidth={SW} />
              <ellipse cx={1840} cy={860} rx={60} ry={140} transform="rotate(20 1840 860)" fill="#3f9a5c" stroke={INK} strokeWidth={SW} />
              <ellipse cx={1800} cy={820} rx={40} ry={110} fill="#56b36f" stroke={INK} strokeWidth={SW} />
              <path d="M1690 960 L1890 960 L1870 1130 L1710 1130 Z" fill="#b5542d" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            </g>
          </Svg>
        </Camada>

        {/* ===== ATMOSFERA: escuro nas bordas e escurecimento quando a luz cai (sem paralaxe) ===== */}
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, background: 'radial-gradient(ellipse 70% 66% at 50% 40%, rgba(0,0,0,0) 40%, rgba(8,6,16,0.88) 100%)'}} />
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11, background: `rgba(6,6,18,${0.55 * (1 - L)})`}} />
      </div>
    </div>
  );
};
