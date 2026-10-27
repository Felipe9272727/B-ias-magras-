// Arte do mapa Polus (Among Us 5), desenhada do zero em SVG em cima da grade de mapaPolus.ts:
// planeta gelado com neve, poças de lava, rochas, antenas, a nave de pouso e prédios de parede marrom com luz laranja.
// Coordenadas de mundo: TILE = 48 px por célula (as mesmas da Skeld), mundo = cols*48 x rows*48.
import React, {useMemo} from 'react';
import {POLUS, SALAS_POLUS, type SalaPolus} from './mapaPolus';

export const TILE = 48;
const W = POLUS.cols * TILE;
const H = POLUS.rows * TILE;
const ch = (c: number, r: number) => (c < 0 || r < 0 || c >= POLUS.cols || r >= POLUS.rows ? ' ' : POLUS.grid[r].charAt(c));

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

const Chao: React.FC = () => {
  // terreno rochoso escuro fora da base, com montes de neve e poças de lava
  const lavas = [[3, 74, 7, 3], [30, 76, 6, 3], [62, 78, 8, 3], [108, 76, 9, 4], [118, 12, 6, 4], [8, 6, 7, 4], [96, 4, 5, 3]];
  return (
    <g>
      <rect width={W} height={H} fill="#3a3f4b" />
      {Array.from({length: 140}).map((_, i) => (
        <ellipse key={i} cx={rnd(i) * W} cy={rnd(i + 900) * H} rx={60 + rnd(i + 3) * 160} ry={30 + rnd(i + 7) * 70} fill={i % 3 ? '#454b58' : '#4f5664'} opacity={0.8} />
      ))}
      {Array.from({length: 60}).map((_, i) => (
        <ellipse key={`n${i}`} cx={rnd(i + 40) * W} cy={rnd(i + 70) * H} rx={80 + rnd(i + 5) * 200} ry={30 + rnd(i + 8) * 60} fill="#dfe6ee" opacity={0.55} />
      ))}
      {lavas.map(([c, r, w, h], i) => (
        <g key={`l${i}`}>
          <ellipse cx={(c + w / 2) * TILE} cy={(r + h / 2) * TILE} rx={(w / 2 + 0.6) * TILE} ry={(h / 2 + 0.6) * TILE} fill="#2b2222" />
          <ellipse cx={(c + w / 2) * TILE} cy={(r + h / 2) * TILE} rx={(w / 2) * TILE} ry={(h / 2) * TILE} fill="#ff5722" />
          <ellipse cx={(c + w / 2) * TILE} cy={(r + h / 2) * TILE} rx={(w / 2.6) * TILE} ry={(h / 2.8) * TILE} fill="#ffab40" opacity={0.8} />
        </g>
      ))}
    </g>
  );
};

const Neve: React.FC = () => {
  const cs = useMemo(() => corridas(','), []);
  return (
    <g>
      {cs.map((k, i) => <rect key={i} x={k.c * TILE - 6} y={k.r * TILE - 6} width={k.w * TILE + 12} height={TILE + 12} fill="#b9c4d0" />)}
      {cs.map((k, i) => <rect key={`b${i}`} x={k.c * TILE} y={k.r * TILE} width={k.w * TILE} height={TILE} fill="#eef3f8" />)}
      {/* sombras azuladas, pegadas e pedrinhas na neve */}
      {cs.filter((_, i) => i % 3 === 0).map((k, i) => (
        <g key={`d${i}`}>
          {Array.from({length: Math.max(1, Math.floor(k.w / 9))}).map((_, j) => {
            const x = (k.c + 2 + j * 9 + rnd(i * 13 + j) * 4) * TILE, y = (k.r + 0.5) * TILE;
            return j % 3 === 0 ? <ellipse key={j} cx={x} cy={y} rx={22} ry={12} fill="#8d97a6" /> : <ellipse key={j} cx={x} cy={y} rx={70} ry={14} fill="#d6e0ea" opacity={0.8} />;
          })}
        </g>
      ))}
    </g>
  );
};

// passarelas de metal entre as portas (o caminho que o jogador vê na neve)
const Passarelas: React.FC = () => {
  const portas = useMemo(() => {
    const ps: {x: number; y: number}[] = [];
    for (let r = 0; r < POLUS.rows; r++) for (let c = 0; c < POLUS.cols; c++) if (ch(c, r) === 'D' && ch(c - 1, r) !== 'D' && ch(c, r - 1) !== 'D') ps.push({x: (c + 1) * TILE, y: (r + 1) * TILE});
    return ps;
  }, []);
  return (
    <g opacity={0.9}>
      {portas.map((p, i) => <rect key={i} x={p.x - 100} y={p.y - 100} width={200} height={200} rx={20} fill="#9aa5b1" stroke="#6b7684" strokeWidth={8} />)}
    </g>
  );
};

const Sala: React.FC<{s: SalaPolus}> = ({s}) => {
  const d = POLUS.salas[s];
  const {c, r, w, h} = d.rect;
  const x = c * TILE, y = r * TILE, ww = w * TILE, hh = h * TILE;
  const t = d.tema;
  const P = 'p' + s;
  return (
    <g>
      <defs>
        <pattern id={P} width={96} height={96} patternUnits="userSpaceOnUse">
          <rect width={96} height={96} fill={t.piso} />
          <rect width={48} height={48} fill={t.piso2} />
          <rect x={48} y={48} width={48} height={48} fill={t.piso2} />
        </pattern>
      </defs>
      {/* parede: topo (escuro) + face (marrom) */}
      <rect x={x - TILE} y={y - TILE} width={ww + 2 * TILE} height={hh + 2 * TILE} fill={t.paredeTopo} rx={10} />
      <rect x={x} y={y} width={ww} height={hh} fill={`url(#${P})`} />
      <rect x={x} y={y} width={ww} height={36} fill={t.parede} />
      {Array.from({length: Math.max(1, Math.floor(w / 6))}).map((_, i) => (
        <circle key={i} cx={x + (i + 0.5) * (ww / Math.max(1, Math.floor(w / 6)))} cy={y + 18} r={8} fill="#ffb74d" />
      ))}
    </g>
  );
};

const Portas: React.FC = () => {
  const cs = useMemo(() => corridas('D'), []);
  return <g>{cs.map((k, i) => <rect key={i} x={k.c * TILE} y={k.r * TILE} width={k.w * TILE} height={TILE} fill="#cfd8dc" stroke="#ffb74d" strokeWidth={6} />)}</g>;
};

// detalhes de cada sala (objetos simples no estilo do jogo)
const Detalhes: React.FC = () => {
  const R = (s: SalaPolus) => {
    const {c, r, w, h} = POLUS.salas[s].rect;
    return {x: c * TILE, y: r * TILE, w: w * TILE, h: h * TILE};
  };
  const ds = R('Dropship'), lab = R('Laboratorio'), esp = R('Especime'), o2 = R('O2'), cal = R('Caldeira'), arm = R('Armas'), adm = R('Admin');
  const esc = R('Escritorio'), dep = R('Deposito'), com = R('Comunicacoes'), ele = R('Eletrica'), seg = R('Seguranca');
  return (
    <g>
      {/* nave de pouso: casco arredondado com asas */}
      <path d={`M${ds.x + 20} ${ds.y + ds.h} L${ds.x + 20} ${ds.y + 160} Q${ds.x + ds.w / 2} ${ds.y - 120} ${ds.x + ds.w - 20} ${ds.y + 160} L${ds.x + ds.w - 20} ${ds.y + ds.h}Z`} fill="#b0bec5" stroke="#455a64" strokeWidth={14} opacity={0.55} />
      <path d={`M${ds.x - 220} ${ds.y + 380} L${ds.x - 30} ${ds.y + 300} L${ds.x - 30} ${ds.y + 760} L${ds.x - 180} ${ds.y + 820}Z`} fill="#37474f" stroke="#cfd8dc" strokeWidth={10} />
      <path d={`M${ds.x + ds.w + 220} ${ds.y + 380} L${ds.x + ds.w + 30} ${ds.y + 300} L${ds.x + ds.w + 30} ${ds.y + 760} L${ds.x + ds.w + 180} ${ds.y + 820}Z`} fill="#37474f" stroke="#cfd8dc" strokeWidth={10} />
      {/* antenas parabólicas ao lado da nave */}
      {[ds.x - 1700, ds.x + ds.w + 1300].map((ax, i) => (
        <g key={i}>
          <rect x={ax - 24} y={ds.y + 420} width={48} height={560} fill="#b0bec5" />
          <circle cx={ax} cy={ds.y + 400} r={110} fill="#eceff1" stroke="#78909c" strokeWidth={12} />
        </g>
      ))}
      {/* laboratório: bancadas, telescópio, broca */}
      {[0, 1, 2].map((i) => <rect key={i} x={lab.x + 160 + i * ((lab.w - 320) / 3)} y={lab.y + lab.h - 260} width={(lab.w - 320) / 3 - 120} height={110} rx={14} fill="#eceff1" stroke="#90a4ae" strokeWidth={8} />)}
      <circle cx={lab.x + lab.w - 320} cy={lab.y + 260} r={120} fill="#37474f" stroke="#80deea" strokeWidth={12} />
      <rect x={lab.x + 220} y={lab.y + 120} width={180} height={180} rx={20} fill="#ffb300" stroke="#6d4c41" strokeWidth={10} />
      {/* sala de espécimes: octógono com vitrines */}
      <polygon points={[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `${esp.x + esp.w / 2 + Math.cos((k / 8) * Math.PI * 2 + Math.PI / 8) * esp.w * 0.42},${esp.y + esp.h / 2 + Math.sin((k / 8) * Math.PI * 2 + Math.PI / 8) * esp.h * 0.42}`).join(' ')} fill="none" stroke="#b388ff" strokeWidth={14} />
      {[0, 1, 2].map((i) => <rect key={i} x={esp.x + esp.w / 2 - 300 + i * 220} y={esp.y + esp.h / 2 - 90} width={140} height={180} rx={20} fill="#ce93d8" opacity={0.55} stroke="#6a1b9a" strokeWidth={8} />)}
      {/* O2: árvore e galões */}
      <circle cx={o2.x + o2.w / 2} cy={o2.y + o2.h * 0.45} r={190} fill="#43a047" stroke="#1b5e20" strokeWidth={12} />
      <rect x={o2.x + o2.w / 2 - 30} y={o2.y + o2.h * 0.45 + 120} width={60} height={160} fill="#6d4c41" />
      {/* caldeira: canos */}
      {[0, 1, 2].map((i) => <rect key={i} x={cal.x + 160 + i * 220} y={cal.y + 80} width={110} height={cal.h - 160} rx={50} fill="#8d6e63" stroke="#4e342e" strokeWidth={8} />)}
      {/* armas: canhão */}
      <circle cx={arm.x + arm.w / 2} cy={arm.y + arm.h / 2} r={180} fill="#546e7a" stroke="#263238" strokeWidth={12} />
      <rect x={arm.x + arm.w / 2 - 40} y={arm.y + arm.h / 2 - 420} width={80} height={300} fill="#37474f" />
      {/* admin: mesa do mapa */}
      <rect x={adm.x + adm.w / 2 - 330} y={adm.y + adm.h / 2 - 170} width={660} height={340} rx={30} fill="#26a69a" stroke="#004d40" strokeWidth={12} />
      {/* escritório: mesas e o botão de emergência */}
      {[0, 1, 2, 3].filter((i) => i !== 1).map((i) => <rect key={i} x={esc.x + 160 + i * ((esc.w - 320) / 4)} y={esc.y + esc.h - 200} width={(esc.w - 320) / 4 - 160} height={110} rx={14} fill="#8d6e63" stroke="#4e342e" strokeWidth={8} />)}
      <circle cx={esc.x + esc.w / 2} cy={esc.y + esc.h / 2 + 30} r={90} fill="#e53935" stroke="#7f0000" strokeWidth={14} />
      {/* depósito: caixas */}
      {[0, 1, 2].map((i) => <rect key={i} x={dep.x + 120 + i * ((dep.w - 240) / 3)} y={dep.y + 120 + (i % 2) * 120} width={220} height={180} rx={12} fill="#a1887f" stroke="#5d4037" strokeWidth={8} />)}
      {/* comunicações: antena */}
      <circle cx={com.x + com.w / 2} cy={com.y + 300} r={150} fill="#cfd8dc" stroke="#546e7a" strokeWidth={12} />
      {/* elétrica: painéis */}
      {[0, 1].map((i) => <rect key={i} x={ele.x + 120 + i * ((ele.w - 240) / 2)} y={ele.y + 60} width={(ele.w - 240) / 2 - 80} height={160} rx={10} fill="#455a64" stroke="#ffd54f" strokeWidth={8} />)}
      {/* segurança: monitores */}
      <rect x={seg.x + 120} y={seg.y + 60} width={seg.w - 240} height={150} rx={12} fill="#263238" stroke="#4fc3f7" strokeWidth={8} />
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
    <Neve />
    <Passarelas />
    {SALAS_POLUS.map((s) => <Sala key={s} s={s} />)}
    <Portas />
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
