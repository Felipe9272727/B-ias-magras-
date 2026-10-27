// Arte do mapa Polus (Among Us 5), desenhada do zero em SVG em cima da grade de mapaPolus.ts,
// no visual do jogo: chão roxo com manchas de neve, penhascos escuros, prédios de parede verde-escura com
// contorno preto, faixa bege com listra laranja e janelas azuis, e piso próprio em cada sala
// (carpete roxo no Admin/Escritório, grade escura em Comunicações, azulejo branco-azul no Laboratório...).
// Coordenadas de mundo: TILE = 48 px por célula (as mesmas da Skeld), mundo = cols*48 x rows*48.
import React, {useMemo} from 'react';
import {POLUS, SALAS_POLUS, type SalaPolus} from './mapaPolus';

export const TILE = 48;
const W = POLUS.cols * TILE;
const H = POLUS.rows * TILE;
const ch = (c: number, r: number) => (c < 0 || r < 0 || c >= POLUS.cols || r >= POLUS.rows ? ' ' : POLUS.grid[r].charAt(c));
const LINHA = '#141414'; // contorno preto do desenho do jogo

// retângulos de linhas contínuas de um mesmo caractere (desenho leve)
const corridas = (alvo: string) => {
  const out: {c: number; r: number; w: number}[] = [];
  for (let r = 0; r < POLUS.rows; r++) {
    let c = 0;
    while (c < POLUS.cols) {
      if (alvo.includes(ch(c, r))) {
        const c0 = c;
        while (c < POLUS.cols && alvo.includes(ch(c, r))) c++;
        out.push({c: c0, r, w: c - c0});
      } else c++;
    }
  }
  return out;
};
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- exterior ----------
// fora da área andável: penhasco escuro roxo-acinzentado com pedras
const Chao: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#2d2840" />
    {Array.from({length: 120}).map((_, i) => {
      const x = rnd(i) * W, y = rnd(i + 900) * H, r = 40 + rnd(i + 3) * 110;
      return (
        <g key={i}>
          <ellipse cx={x} cy={y + r * 0.25} rx={r} ry={r * 0.6} fill="#221e31" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill={i % 3 ? '#3a3352' : '#443c5e'} stroke={LINHA} strokeWidth={6} />
          <ellipse cx={x - r * 0.3} cy={y - r * 0.18} rx={r * 0.35} ry={r * 0.15} fill="#575079" opacity={0.7} />
        </g>
      );
    })}
  </g>
);

// área andável de fora: chão roxo com borda de penhasco, manchas de neve, rachaduras e pedrinhas
const Terreno: React.FC = () => {
  const cs = useMemo(() => corridas(',D'), []);
  const neve = useMemo(() => {
    const ns: {x: number; y: number; w: number; h: number; k: number}[] = [];
    corridas(',').forEach((k, i) => {
      if (k.w >= 6 && rnd(i * 7 + 1) < 0.22) ns.push({x: (k.c + rnd(i) * (k.w - 4) + 2) * TILE, y: (k.r + 0.5) * TILE, w: (3 + rnd(i + 4) * 7) * TILE, h: (1.2 + rnd(i + 9) * 1.6) * TILE, k: i});
    });
    return ns;
  }, []);
  return (
    <g>
      {/* borda do penhasco (sombra embaixo e contorno) */}
      {cs.map((k, i) => <rect key={`s${i}`} x={k.c * TILE - 14} y={k.r * TILE - 10} width={k.w * TILE + 28} height={TILE + 34} fill="#1d1a29" />)}
      {cs.map((k, i) => <rect key={`b${i}`} x={k.c * TILE - 8} y={k.r * TILE - 8} width={k.w * TILE + 16} height={TILE + 16} fill="#4a3c66" />)}
      {cs.map((k, i) => <rect key={`c${i}`} x={k.c * TILE} y={k.r * TILE} width={k.w * TILE} height={TILE + 1} fill="#6a5590" />)}
      {/* manchas de neve: placas chatas e irregulares, brancas com borda azul-clara (neve no chão, não nuvem) */}
      {neve.map((n) => {
        const pts = Array.from({length: 10}).map((_, j) => {
          const a = (j / 10) * Math.PI * 2, k = 0.75 + rnd(n.k * 31 + j) * 0.35;
          return [n.x + Math.cos(a) * n.w * 0.55 * k, n.y + Math.sin(a) * n.h * 0.5 * k];
        });
        const d = 'M' + pts.map(([px, py]) => `${px} ${py}`).join(' L') + 'Z';
        return (
          <g key={`n${n.k}`}>
            <path d={d} fill="#a9c4e4" stroke="#a9c4e4" strokeWidth={26} strokeLinejoin="round" />
            <path d={d} fill="#f2f6fb" stroke="#f2f6fb" strokeWidth={8} strokeLinejoin="round" />
            <path d={`M${n.x - n.w * 0.3} ${n.y - n.h * 0.1} q${n.w * 0.2} -14 ${n.w * 0.4} 0`} stroke="#d5e3f3" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {/* rachaduras e pedrinhas no chão roxo */}
      {corridas(',').filter((_, i) => i % 4 === 0).map((k, i) => {
        const x = (k.c + rnd(i + 30) * k.w) * TILE, y = (k.r + 0.5) * TILE;
        return i % 2 ? (
          <path key={`r${i}`} d={`M${x} ${y} l40 -12 l30 18 l46 -8`} fill="none" stroke="#4a3c66" strokeWidth={6} strokeLinecap="round" />
        ) : (
          <ellipse key={`r${i}`} cx={x} cy={y} rx={16} ry={10} fill="#8e7cb3" stroke={LINHA} strokeWidth={4} />
        );
      })}
    </g>
  );
};

// ---------- salas ----------
type Piso = 'azulejo' | 'carpete' | 'grade' | 'lab' | 'chapa' | 'listra';
const ESTILO: Record<SalaPolus, {piso: Piso; a: string; b: string}> = {
  Dropship: {piso: 'chapa', a: '#b6a874', b: '#857a50'},
  Eletrica: {piso: 'azulejo', a: '#a8b0b6', b: '#959ea5'},
  Seguranca: {piso: 'grade', a: '#4b5552', b: '#3a4340'},
  O2: {piso: 'azulejo', a: '#b4bcc2', b: '#a2abb2'},
  Caldeira: {piso: 'grade', a: '#5d544c', b: '#4a423b'},
  Comunicacoes: {piso: 'grade', a: '#4f5856', b: '#3d4543'},
  Armas: {piso: 'chapa', a: '#8794a0', b: '#6f7b86'},
  Deposito: {piso: 'azulejo', a: '#a3abb2', b: '#929aa1'},
  Escritorio: {piso: 'carpete', a: '#6b4e8e', b: '#5d4380'},
  Admin: {piso: 'carpete', a: '#6b4e8e', b: '#5d4380'},
  Descontaminacao: {piso: 'listra', a: '#c9d1d8', b: '#e0b93a'},
  Laboratorio: {piso: 'lab', a: '#e9eff4', b: '#5f9fd6'},
  DescontaminacaoInf: {piso: 'listra', a: '#c9d1d8', b: '#e0b93a'},
  Especime: {piso: 'azulejo', a: '#b9c1c8', b: '#a7b0b8'},
};

const PadraoPiso: React.FC<{id: string; piso: Piso; a: string; b: string}> = ({id, piso, a, b}) => {
  if (piso === 'carpete')
    return (
      <pattern id={id} width={96} height={96} patternUnits="userSpaceOnUse">
        <rect width={96} height={96} fill={a} />
        <circle cx={24} cy={24} r={4} fill={b} />
        <circle cx={72} cy={72} r={4} fill={b} />
      </pattern>
    );
  if (piso === 'grade')
    return (
      <pattern id={id} width={48} height={24} patternUnits="userSpaceOnUse">
        <rect width={48} height={24} fill={a} />
        <rect y={18} width={48} height={6} fill={b} />
      </pattern>
    );
  if (piso === 'lab')
    return (
      <pattern id={id} width={144} height={144} patternUnits="userSpaceOnUse">
        <rect width={144} height={144} fill={a} />
        <rect x={48} y={48} width={48} height={48} fill={b} />
        <path d="M0 0H144V144" fill="none" stroke="#c4ced6" strokeWidth={3} />
        <path d="M48 0V144M96 0V144M0 48H144M0 96H144" stroke="#d3dce3" strokeWidth={2} />
      </pattern>
    );
  if (piso === 'listra')
    return (
      <pattern id={id} width={96} height={96} patternUnits="userSpaceOnUse">
        <rect width={96} height={96} fill={a} />
        <path d="M0 0H96" stroke="#aab3bb" strokeWidth={4} />
      </pattern>
    );
  if (piso === 'chapa')
    return (
      <pattern id={id} width={144} height={96} patternUnits="userSpaceOnUse">
        <rect width={144} height={96} fill={a} />
        <path d="M0 0H144M0 0V96" stroke={b} strokeWidth={5} />
        <circle cx={10} cy={10} r={3} fill={b} />
      </pattern>
    );
  return (
    <pattern id={id} width={96} height={96} patternUnits="userSpaceOnUse">
      <rect width={96} height={96} fill={a} />
      <path d="M0 0H96M0 0V96M0 48H96M48 0V96" stroke={b} strokeWidth={3} />
    </pattern>
  );
};

const Sala: React.FC<{s: SalaPolus}> = ({s}) => {
  const {c, r, w, h} = POLUS.salas[s].rect;
  const x = c * TILE, y = r * TILE, ww = w * TILE, hh = h * TILE;
  const e = ESTILO[s];
  const P = 'p' + s;
  const face = Math.min(78, hh * 0.3); // parede de cima vista de frente
  const nj = Math.max(0, Math.floor(w / 7));
  return (
    <g>
      <defs>
        <PadraoPiso id={P} piso={e.piso} a={e.a} b={e.b} />
      </defs>
      {/* sombra e parede grossa verde-escura com contorno preto */}
      <rect x={x - TILE + 10} y={y - TILE + 22} width={ww + 2 * TILE} height={hh + 2 * TILE} fill="#16131f" opacity={0.6} rx={8} />
      <rect x={x - TILE} y={y - TILE} width={ww + 2 * TILE} height={hh + 2 * TILE} fill="#33423f" stroke={LINHA} strokeWidth={10} rx={8} />
      <rect x={x - TILE + 12} y={y - TILE + 10} width={ww + 2 * TILE - 24} height={14} fill="#4c5f5b" rx={4} />
      {/* piso */}
      <rect x={x} y={y} width={ww} height={hh} fill={`url(#${P})`} stroke={LINHA} strokeWidth={6} />
      {e.piso === 'listra' ? (
        <>
          <rect x={x} y={y + hh - 40} width={ww} height={22} fill="#e0b93a" />
          {Array.from({length: Math.floor(ww / 60)}).map((_, i) => <rect key={i} x={x + i * 60} y={y + hh - 40} width={30} height={22} fill={LINHA} />)}
        </>
      ) : null}
      {/* face da parede de cima: painéis bege, listra laranja, janelas azuis */}
      <rect x={x} y={y} width={ww} height={face} fill="#ddd0ac" stroke={LINHA} strokeWidth={5} />
      <rect x={x} y={y + face - 14} width={ww} height={10} fill="#e8893a" />
      {Array.from({length: Math.floor(w / 3)}).map((_, i) => <rect key={`pl${i}`} x={x + i * 3 * TILE} y={y} width={5} height={face - 14} fill="#b9ab86" />)}
      {Array.from({length: nj}).map((_, i) => {
        const jx = x + ((i + 0.5) * ww) / nj - 90;
        return (
          <g key={`j${i}`}>
            <rect x={jx} y={y + 10} width={180} height={face - 34} fill="#4e6fc8" stroke={LINHA} strokeWidth={5} />
            <path d={`M${jx + 40} ${y + face - 26} l40 ${-(face - 38)} M${jx + 90} ${y + face - 26} l30 ${-(face - 38)}`} stroke="#b9cdf7" strokeWidth={8} />
          </g>
        );
      })}
    </g>
  );
};

// portas: vão no piso cinza com batentes verdes
const Portas: React.FC = () => {
  const cs = useMemo(() => corridas('D'), []);
  return (
    <g>
      {cs.map((k, i) => (
        <g key={i}>
          <rect x={k.c * TILE - 2} y={k.r * TILE - 2} width={k.w * TILE + 4} height={TILE + 4} fill="#8e98a2" />
          <rect x={k.c * TILE} y={k.r * TILE + 6} width={k.w * TILE} height={TILE - 12} fill="#a9b2bb" />
        </g>
      ))}
      {cs.filter((k) => k.w >= 2).map((k, i) => (
        <g key={`b${i}`}>
          <rect x={k.c * TILE - 16} y={k.r * TILE - 10} width={18} height={TILE + 20} fill="#2e7d5b" stroke={LINHA} strokeWidth={5} />
          <rect x={(k.c + k.w) * TILE - 2} y={k.r * TILE - 10} width={18} height={TILE + 20} fill="#2e7d5b" stroke={LINHA} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

// ---------- objetos ----------
const Caixa: React.FC<{x: number; y: number; w: number; h: number; cor: string; tampa?: string}> = ({x, y, w, h, cor, tampa}) => (
  <g>
    <rect x={x + 6} y={y + 12} width={w} height={h} fill="#000" opacity={0.25} rx={6} />
    <rect x={x} y={y} width={w} height={h} fill={cor} stroke={LINHA} strokeWidth={6} rx={6} />
    {tampa ? <rect x={x + 6} y={y + 6} width={w - 12} height={Math.min(30, h * 0.3)} fill={tampa} rx={4} /> : null}
  </g>
);
const Planta: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 46}) => (
  <g>
    <rect x={x - r * 0.5} y={y + r * 0.4} width={r} height={r * 0.8} fill="#a05a9c" stroke={LINHA} strokeWidth={5} rx={6} />
    <circle cx={x} cy={y} r={r} fill="#4caf50" stroke={LINHA} strokeWidth={5} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#81c784" />
  </g>
);
const Monitor: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 110}) => (
  <g>
    <rect x={x} y={y} width={w} height={w * 0.7} fill="#2b3433" stroke={LINHA} strokeWidth={5} rx={6} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={w * 0.7 - 20} fill="#4fc3f7" />
    <path d={`M${x + 18} ${y + w * 0.5} l${w * 0.25} -${w * 0.22}`} stroke="#e1f5fe" strokeWidth={6} />
  </g>
);
const Estante: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#6d4c41" stroke={LINHA} strokeWidth={6} />
    {Array.from({length: Math.floor(h / 50)}).map((_, i) => (
      <g key={i}>
        <rect x={x + 8} y={y + 10 + i * 50} width={w - 16} height={34} fill="#3e2723" />
        {[0, 1, 2, 3].map((j) => <rect key={j} x={x + 12 + j * ((w - 24) / 4)} y={y + 14 + i * 50} width={(w - 24) / 4 - 4} height={28} fill={['#e53935', '#1e88e5', '#fdd835', '#43a047'][(i + j) % 4]} />)}
      </g>
    ))}
  </g>
);

const Detalhes: React.FC = () => {
  const R = (s: SalaPolus) => {
    const {c, r, w, h} = POLUS.salas[s].rect;
    return {x: c * TILE, y: r * TILE, w: w * TILE, h: h * TILE};
  };
  const lab = R('Laboratorio'), esp = R('Especime'), o2 = R('O2'), cal = R('Caldeira'), arm = R('Armas'), adm = R('Admin');
  const esc = R('Escritorio'), dep = R('Deposito'), com = R('Comunicacoes'), ele = R('Eletrica'), seg = R('Seguranca');
  const top = 90; // abaixo da face da parede
  return (
    <g>
      {/* laboratório: telescópio, bancada com frascos, broca, foguete de amostra */}
      <g>
        <rect x={lab.x + lab.w * 0.42} y={lab.y + lab.h * 0.45} width={lab.w * 0.22} height={110} fill="#455a64" stroke={LINHA} strokeWidth={6} rx={8} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={lab.x + lab.w * 0.44 + i * 70} y={lab.y + lab.h * 0.45 - 40} width={34} height={56} fill={['#80deea', '#a5d6a7', '#ce93d8', '#fff59d'][i]} stroke={LINHA} strokeWidth={4} rx={10} />)}
        <g transform={`translate(${lab.x + lab.w - 260},${lab.y + top + 40})`}>
          <path d="M-50 120 L0 20 L50 120" stroke={LINHA} strokeWidth={10} fill="none" />
          <rect x={-30} y={-60} width={70} height={130} fill="#eceff1" stroke={LINHA} strokeWidth={6} rx={10} transform="rotate(-25)" />
        </g>
        <g transform={`translate(${lab.x + 220},${lab.y + lab.h - 260})`}>
          <rect x={-60} y={-40} width={120} height={160} fill="#90a4ae" stroke={LINHA} strokeWidth={6} rx={14} />
          <circle cx={0} cy={0} r={34} fill="#37474f" stroke={LINHA} strokeWidth={5} />
          <path d="M0 120 l-20 50 h40z" fill="#ffb300" stroke={LINHA} strokeWidth={5} />
        </g>
        {[0, 1, 2, 3, 4].map((i) => <rect key={`a${i}`} x={lab.x + lab.w * 0.12 + i * 64} y={lab.y + top + 10} width={56} height={90} fill="#2e7d5b" stroke={LINHA} strokeWidth={5} rx={4} />)}
      </g>
      {/* sala de espécimes: tubos com amostras coloridas */}
      {[0, 1, 2, 3].map((i) => {
        const cx = esp.x + esp.w * (0.2 + i * 0.2), cy = esp.y + esp.h * 0.6;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy + 70} rx={70} ry={26} fill="#455a64" stroke={LINHA} strokeWidth={5} />
            <rect x={cx - 52} y={cy - 110} width={104} height={180} fill="#b3e5fc" opacity={0.75} stroke={LINHA} strokeWidth={5} rx={40} />
            <circle cx={cx} cy={cy - 10} r={30} fill={['#7e57c2', '#26a69a', '#ec407a', '#42a5f5'][i]} stroke={LINHA} strokeWidth={4} />
          </g>
        );
      })}
      {/* O2: plantas em vasos e galões */}
      {[0, 1, 2].map((i) => <Planta key={i} x={o2.x + 110 + (i % 2) * (o2.w - 220)} y={o2.y + top + 80 + i * (o2.h * 0.3)} />)}
      {[0, 1].map((i) => <Caixa key={`g${i}`} x={o2.x + o2.w / 2 - 70 + i * 80} y={o2.y + o2.h * 0.55} w={60} h={110} cor="#4fc3f7" tampa="#b3e5fc" />)}
      {/* caldeira: canos grossos e válvulas */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={cal.x + 120 + i * ((cal.w - 240) / 3)} y={cal.y + top} width={96} height={cal.h - top - 40} fill="#8d6e63" stroke={LINHA} strokeWidth={6} rx={40} />
          <circle cx={cal.x + 168 + i * ((cal.w - 240) / 3)} cy={cal.y + cal.h * 0.6} r={26} fill="#e53935" stroke={LINHA} strokeWidth={5} />
        </g>
      ))}
      {/* armas: canhão grande com painel */}
      <circle cx={arm.x + arm.w / 2} cy={arm.y + arm.h * 0.58} r={160} fill="#546e7a" stroke={LINHA} strokeWidth={8} />
      <circle cx={arm.x + arm.w / 2} cy={arm.y + arm.h * 0.58} r={80} fill="#37474f" stroke={LINHA} strokeWidth={6} />
      <rect x={arm.x + arm.w / 2 - 36} y={arm.y + top} width={72} height={arm.h * 0.58 - top - 60} fill="#263238" stroke={LINHA} strokeWidth={6} />
      <Monitor x={arm.x + 60} y={arm.y + top + 20} />
      {/* admin: mesa do mapa verde e estantes */}
      <rect x={adm.x + adm.w / 2 - 300} y={adm.y + adm.h / 2 - 140} width={600} height={300} rx={20} fill="#cfd8dc" stroke={LINHA} strokeWidth={8} />
      <rect x={adm.x + adm.w / 2 - 250} y={adm.y + adm.h / 2 - 100} width={500} height={220} fill="#43a047" stroke={LINHA} strokeWidth={5} />
      <path d={`M${adm.x + adm.w / 2 - 200} ${adm.y + adm.h / 2 - 40} h150 v80 h120 v-60 h100`} fill="none" stroke="#a5d6a7" strokeWidth={14} />
      <Estante x={adm.x + 60} y={adm.y + adm.h - 320} w={130} h={260} />
      <Planta x={adm.x + adm.w - 110} y={adm.y + top + 70} />
      {/* escritório: mesas, estantes, botão de emergência */}
      {[0, 1].map((i) => <Caixa key={i} x={esc.x + 200 + i * (esc.w - 820)} y={esc.y + esc.h - 170} w={420} h={100} cor="#8d6e63" tampa="#a1887f" />)}
      <Estante x={esc.x + esc.w * 0.36} y={esc.y + top + 4} w={150} h={140} />
      <Estante x={esc.x + esc.w * 0.6} y={esc.y + top + 4} w={150} h={140} />
      <g>
        <circle cx={esc.x + esc.w / 2} cy={esc.y + esc.h * 0.62} r={92} fill="#b0bec5" stroke={LINHA} strokeWidth={8} />
        <circle cx={esc.x + esc.w / 2} cy={esc.y + esc.h * 0.62} r={58} fill="#e53935" stroke={LINHA} strokeWidth={6} />
        <circle cx={esc.x + esc.w / 2 - 18} cy={esc.y + esc.h * 0.62 - 18} r={16} fill="#ff8a80" />
      </g>
      {/* depósito: caixotes e galões de combustível */}
      {[0, 1, 2].map((i) => <Caixa key={i} x={dep.x + 120 + i * ((dep.w - 240) / 3)} y={dep.y + top + 30 + (i % 2) * 60} w={170} h={140} cor="#a1887f" tampa="#bcaaa4" />)}
      {[0, 1].map((i) => <Caixa key={`f${i}`} x={dep.x + dep.w - 200 + i * 70} y={dep.y + dep.h - 150} w={56} h={90} cor="#e53935" tampa="#ef9a9a" />)}
      {/* comunicações: mesa com monitores e rádio */}
      <Caixa x={com.x + 50} y={com.y + top + 10} w={com.w - 100} h={110} cor="#546e7a" />
      <Monitor x={com.x + 80} y={com.y + top - 20} w={100} />
      <Monitor x={com.x + com.w - 180} y={com.y + top - 20} w={100} />
      <ellipse cx={com.x + com.w / 2} cy={com.y + com.h * 0.62} rx={110} ry={70} fill="#7cb342" stroke={LINHA} strokeWidth={6} />
      {/* elétrica: transformadores com bobinas e cerca */}
      {[0, 1, 2, 3].map((i) => {
        const tx = ele.x + 120 + (i % 2) * (ele.w / 2), ty = ele.y + top + 60 + Math.floor(i / 2) * (ele.h * 0.38);
        return (
          <g key={i}>
            <Caixa x={tx} y={ty} w={200} h={150} cor="#90a4ae" tampa="#cfd8dc" />
            {[0, 1, 2].map((j) => <rect key={j} x={tx + 30 + j * 55} y={ty - 50} width={22} height={70} fill="#d84315" stroke={LINHA} strokeWidth={4} rx={6} />)}
          </g>
        );
      })}
      {/* segurança: monitores das câmeras */}
      <Caixa x={seg.x + 40} y={seg.y + top} w={seg.w - 80} h={80} cor="#455a64" />
      {[0, 1].map((i) => <Monitor key={i} x={seg.x + 60 + i * 130} y={seg.y + top - 30} w={100} />)}
    </g>
  );
};

// a nave de pouso: casco verde-escuro arredondado, turbinas dos lados e piso amarelo quadriculado
const NavePouso: React.FC = () => {
  const {c, r, w, h} = POLUS.salas.Dropship.rect;
  const x = c * TILE, y = r * TILE, ww = w * TILE, hh = h * TILE;
  const cx = x + ww / 2;
  return (
    <g>
      {[-1, 1].map((ld) => {
        const ex = ld < 0 ? x - 330 : x + ww + 30;
        return (
          <g key={ld}>
            <path d={`M${ld < 0 ? x : x + ww} ${y + 260} L${ld < 0 ? x - 160 : x + ww + 160} ${y + 180} L${ld < 0 ? x - 160 : x + ww + 160} ${y + 560} L${ld < 0 ? x : x + ww} ${y + 620}Z`} fill="#2c4a5e" stroke={LINHA} strokeWidth={10} />
            <rect x={ex} y={y + 480} width={300} height={360} rx={30} fill="#2c4a5e" stroke={LINHA} strokeWidth={10} />
            {[0, 1].map((k) => (
              <g key={k}>
                <circle cx={ex + 150} cy={y + 580 + k * 160} r={68} fill="#263238" stroke={LINHA} strokeWidth={8} />
                <path d={`M${ex + 100} ${y + 580 + k * 160} h100 M${ex + 150} ${y + 530 + k * 160} v100`} stroke="#78909c" strokeWidth={12} />
              </g>
            ))}
          </g>
        );
      })}
      <path d={`M${x - 40} ${y + hh + 40} L${x - 40} ${y + 260} Q${cx} ${y - 200} ${x + ww + 40} ${y + 260} L${x + ww + 40} ${y + hh + 40}Z`} fill="#3c4d4b" stroke={LINHA} strokeWidth={12} />
      <path d={`M${x + 30} ${y + hh} L${x + 30} ${y + 300} Q${cx} ${y - 90} ${x + ww - 30} ${y + 300} L${x + ww - 30} ${y + hh}Z`} fill="#c7ccce" stroke={LINHA} strokeWidth={8} />
      <rect x={cx - 150} y={y - 40} width={300} height={44} fill="#4e8fd6" stroke={LINHA} strokeWidth={6} rx={8} />
      {/* fileiras de assentos azuis */}
      {[-1, 1].map((ld) => Array.from({length: 4}).map((_, i) => (
        <rect key={`${ld}${i}`} x={cx + ld * 120 + (ld < 0 ? -i * 70 - 60 : i * 70)} y={y + 340} width={56} height={60} rx={14} fill="#26a6c9" stroke={LINHA} strokeWidth={5} />
      )))}
      <rect x={cx - 60} y={y + 250} width={120} height={150} rx={20} fill="#90a4ae" stroke={LINHA} strokeWidth={6} />
      {/* piso de carga amarelo quadriculado */}
      <rect x={x + 60} y={y + 470} width={ww - 120} height={hh - 500} fill="#a99b68" stroke={LINHA} strokeWidth={6} />
      {Array.from({length: Math.floor((ww - 120) / 110)}).map((_, i) => <rect key={`v${i}`} x={x + 60 + (i + 1) * 110} y={y + 470} width={6} height={hh - 500} fill="#d7c56e" />)}
      {Array.from({length: Math.floor((hh - 500) / 110)}).map((_, i) => <rect key={`h${i}`} x={x + 60} y={y + 470 + (i + 1) * 110} width={ww - 120} height={6} fill="#d7c56e" />)}
    </g>
  );
};

// antenas parabólicas e postes de luz no exterior (perto da nave, como no jogo)
const Exterior: React.FC = () => {
  const {c, r, w} = POLUS.salas.Dropship.rect;
  const dx = c * TILE, dy = r * TILE, dw = w * TILE;
  const antenas = [[dx - 1700, dy + 500], [dx + dw + 1300, dy + 500]];
  return (
    <g>
      {antenas.map(([ax, ay], i) => (
        <g key={i}>
          <rect x={ax - 22} y={ay} width={44} height={420} fill="#90a4ae" stroke={LINHA} strokeWidth={6} />
          <ellipse cx={ax} cy={ay - 10} rx={140} ry={110} fill="#eceff1" stroke={LINHA} strokeWidth={10} />
          <ellipse cx={ax} cy={ay - 10} rx={80} ry={60} fill="#cfd8dc" />
          <path d={`M${ax} ${ay - 10} l70 -90`} stroke={LINHA} strokeWidth={10} />
          <circle cx={ax + 70} cy={ay - 100} r={18} fill="#ff7043" stroke={LINHA} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

const Nomes: React.FC = () => (
  <g>
    {SALAS_POLUS.map((s) => {
      const {c, r, w, h} = POLUS.salas[s].rect;
      const nome = POLUS.salas[s].nome;
      const meia = nome.length * 35; // meia largura aproximada do texto (fonte 110)
      const cx = Math.min(W - meia - 30, Math.max(meia + 30, (c + w / 2) * TILE));
      return (
        <text key={s} x={cx} y={(r + h / 2) * TILE + 30} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={110} fill="#fff" stroke="#000" strokeWidth={14} paintOrder="stroke">
          {POLUS.salas[s].nome}
        </text>
      );
    })}
  </g>
);

// o mapa inteiro em coordenadas de mundo (para a câmera do jogo escalar/recortar)
export const ArtePolus: React.FC<{nomes?: boolean}> = React.memo(({nomes = false}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Chao />
    <Terreno />
    <Exterior />
    {SALAS_POLUS.filter((s) => s !== 'Dropship').map((s) => <Sala key={s} s={s} />)}
    <Portas />
    <NavePouso />
    <Detalhes />
    {nomes ? <Nomes /> : null}
  </svg>
));

// prévia: o mapa inteiro com os nomes, escalado para 1920 de largura
export const PreviaPolus: React.FC = () => (
  <div style={{width: 1920, height: 1230, background: '#1c2029', overflow: 'hidden'}}>
    <div style={{transform: `scale(${1920 / W})`, transformOrigin: '0 0'}}>
      <ArtePolus nomes />
    </div>
  </div>
);

// recorte de perto (como a câmera do jogo vai ver): centro (cx, cy) em células, zoom 1 = 48 px por célula
export const RecortePolus: React.FC<{cx?: number; cy?: number; zoom?: number}> = ({cx = 60, cy = 45, zoom = 0.75}) => (
  <div style={{width: 1920, height: 1080, background: '#1c2029', overflow: 'hidden', position: 'relative'}}>
    <div style={{position: 'absolute', left: 960 - cx * TILE * zoom, top: 540 - cy * TILE * zoom, transform: `scale(${zoom})`, transformOrigin: '0 0'}}>
      <ArtePolus />
    </div>
  </div>
);
