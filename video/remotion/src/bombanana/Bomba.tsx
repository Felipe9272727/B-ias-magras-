// A bomba do BOMBANANA! vista de perto (arte própria no estilo do jogo: maleta preta com cronômetro de LCD verde e
// módulos coloridos). Recebe o retrato dos módulos gravado pelo motor (bombanana/jogo.mjs) a cada rodada.
import React from 'react';

const COR: Record<string, string> = {vermelho: '#e53935', vermelha: '#e53935', azul: '#1e88e5', amarelo: '#fdd835', amarela: '#fdd835', verde: '#43a047', branco: '#f2f2f2', preto: '#1a1a1a', roxo: '#8e24aa', laranja: '#fb8c00'};
const LCD = '#9cff57';

export type Modulo = Record<string, any> & {tipo: string; resolvido: boolean};

const Painel: React.FC<{x: number; y: number; w: number; h: number; ok: boolean; titulo: string; destaque?: boolean; children: React.ReactNode}> = ({x, y, w, h, ok, titulo, destaque, children}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} rx={18} fill="#3a3f4a" stroke={destaque ? '#ffd54f' : '#1d2026'} strokeWidth={destaque ? 8 : 6} />
    <rect x={10} y={10} width={w - 20} height={h - 20} rx={12} fill="#4a505d" />
    <circle cx={w - 28} cy={28} r={12} fill={ok ? '#4cff6a' : '#3a1d1d'} stroke="#111" strokeWidth={3} />
    {ok ? <circle cx={w - 28} cy={28} r={20} fill="#4cff6a" opacity={0.35} /> : null}
    <text x={22} y={36} fontFamily="Poppins" fontWeight={800} fontSize={20} fill="#cfd6e4">{titulo}</text>
    {children}
  </g>
);

const Luz: React.FC<{cx: number; cy: number; cor?: string; r?: number}> = ({cx, cy, cor, r = 20}) => (
  <g>
    {cor ? <circle cx={cx} cy={cy} r={r * 1.9} fill={COR[cor] ?? cor} opacity={0.3} /> : null}
    <circle cx={cx} cy={cy} r={r} fill={cor ? COR[cor] ?? cor : '#222'} stroke="#111" strokeWidth={4} />
    <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.3} fill="#fff" opacity={0.5} />
  </g>
);

export const Simbolo: React.FC<{nome: string; s?: number; cor?: string}> = ({nome, s = 1, cor = '#f5f5f5'}) => {
  const p: Record<string, React.ReactNode> = {
    estrela: <path d="M0,-22 L6,-7 L22,-7 L9,3 L14,19 L0,9 L-14,19 L-9,3 L-22,-7 L-6,-7 Z" fill={cor} />,
    lua: <path d="M8,-20 A20,20 0 1,0 8,20 A14,14 0 1,1 8,-20 Z" fill={cor} />,
    'triângulo': <path d="M0,-20 L19,16 L-19,16 Z" fill={cor} />,
    espiral: <path d="M0,0 m-2,0 a2,2 0 1,1 4,0 a6,6 0 1,1 -10,0 a10,10 0 1,1 18,0 a14,14 0 1,1 -26,0" fill="none" stroke={cor} strokeWidth={4} />,
    coroa: <path d="M-20,14 L-20,-10 L-10,2 L0,-16 L10,2 L20,-10 L20,14 Z" fill={cor} />,
    olho: <g><path d="M-22,0 Q0,-18 22,0 Q0,18 -22,0 Z" fill={cor} /><circle r={7} fill="#333" /></g>,
  };
  return <g transform={`scale(${s})`}>{p[nome] ?? null}</g>;
};

// número em Braille (pontos 1-6 do padrão a-j para 1-9)
const BRAILLE: Record<number, number[]> = {1: [1], 2: [1, 2], 3: [1, 4], 4: [1, 4, 5], 5: [1, 5], 6: [1, 2, 4], 7: [1, 2, 4, 5], 9: [2, 4]};
const Braille: React.FC<{n: number; x: number; y: number}> = ({n, x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-34} y={-46} width={68} height={92} rx={10} fill="#cfc6a8" stroke="#8a8166" strokeWidth={3} />
    {[1, 2, 3, 4, 5, 6].map((d) => {
      const col = d <= 3 ? -12 : 12, lin = ((d - 1) % 3) * 24 - 24;
      const on = (BRAILLE[n] ?? []).includes(d);
      return <circle key={d} cx={col} cy={lin} r={on ? 7 : 3} fill={on ? '#6b6250' : '#b5ad92'} />;
    })}
  </g>
);

function conteudo(m: Modulo, w: number, h: number): React.ReactNode {
  const cx = w / 2;
  switch (m.tipo) {
    case 'cabo': {
      const n = m.cabos.length;
      return (
        <g>
          <Luz cx={cx} cy={70} cor={m.luz} />
          <rect x={30} y={110} width={30} height={h - 150} rx={8} fill="#2a2d34" />
          <rect x={w - 60} y={110} width={30} height={h - 150} rx={8} fill="#2a2d34" />
          {m.cabos.map((c: string, i: number) => {
            const y = 130 + ((h - 190) / (n - 1 || 1)) * i;
            const cortado = m.cortados?.includes(i + 1);
            const corr = COR[c] ?? '#888';
            return cortado ? (
              <g key={i}>
                <path d={`M 60 ${y} Q ${cx - 60} ${y + 30} ${cx - 25} ${y + 10}`} stroke={corr} strokeWidth={16} fill="none" strokeLinecap="round" />
                <path d={`M ${cx + 25} ${y + 14} Q ${cx + 60} ${y + 30} ${w - 60} ${y}`} stroke={corr} strokeWidth={16} fill="none" strokeLinecap="round" />
                <path d={`M ${cx - 12} ${y - 4} L ${cx + 12} ${y + 28} M ${cx + 12} ${y - 4} L ${cx - 12} ${y + 28}`} stroke="#ffd54f" strokeWidth={4} strokeLinecap="round" />
              </g>
            ) : <path key={i} d={`M 60 ${y} Q ${cx} ${y + 34} ${w - 60} ${y}`} stroke={corr} strokeWidth={16} fill="none" strokeLinecap="round" />;
          })}
        </g>
      );
    }
    case 'slider': {
      const tx = 50, tw = w - 100, ty = h - 80;
      return (
        <g>
          <rect x={cx - 90} y={60} width={180} height={90} rx={10} fill="#111" stroke="#222" strokeWidth={4} />
          <rect x={cx - 78} y={72} width={156} height={66} rx={6} fill={COR[m.cor] ?? '#888'} />
          <rect x={tx} y={ty - 8} width={tw} height={16} rx={8} fill="#1c1f25" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={tx + (tw / 4) * i - 3} y={ty - 22} width={6} height={44} fill="#9aa3b5" />)}
          <rect x={tx + (tw / 4) * (m.pos - 1) - 22} y={ty - 30} width={44} height={60} rx={10} fill="#e0e4ec" stroke="#555" strokeWidth={4} />
        </g>
      );
    }
    case 'direcao': {
      const e = m.etapas[Math.min(m.etapa, 1)];
      const seta = (rot: number, dx: number, dy: number) => (
        <g key={rot} transform={`translate(${cx + dx} ${h / 2 + 30 + dy}) rotate(${rot})`}>
          <rect x={-30} y={-30} width={60} height={60} rx={12} fill="#2b2f38" stroke="#111" strokeWidth={4} />
          <path d="M0,-18 L16,6 L6,6 L6,18 L-6,18 L-6,6 L-16,6 Z" fill="#e0e4ec" />
        </g>
      );
      return (
        <g>
          <Luz cx={60} cy={80} cor={m.resolvido ? undefined : e.luz} />
          {seta(0, 0, -70)}{seta(90, 70, 0)}{seta(180, 0, 70)}{seta(270, -70, 0)}
          <Braille n={e.num} x={w - 70} y={h - 80} />
        </g>
      );
    }
    case 'calculadora': {
      const tela = m.etapa === 0 ? `${m.conta} = ?` : `${m.res} OK`;
      return (
        <g>
          <rect x={30} y={55} width={w - 60} height={70} rx={8} fill="#18210f" stroke="#0b0f07" strokeWidth={4} />
          <text x={w - 45} y={105} textAnchor="end" fontFamily="JetBrains Mono" fontWeight={700} fontSize={34} fill={LCD}>{tela}</text>
          {m.etapa > 0 ? <Luz cx={50} cy={150} cor={m.luz} r={14} /> : null}
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', ''].map((k, i) => k ? (
            <g key={i} transform={`translate(${cx - 90 + (i % 3) * 70} ${170 + Math.floor(i / 3) * 56})`}>
              <rect x={-28} y={-22} width={56} height={44} rx={8} fill="#e8e8e8" stroke="#666" strokeWidth={3} />
              <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={24} fill="#333">{k}</text>
            </g>
          ) : null)}
        </g>
      );
    }
    case 'simbolo': {
      const r = 80, ccx = cx, ccy = 170;
      return (
        <g>
          <circle cx={ccx} cy={ccy} r={r + 30} fill="#2b2f38" stroke="#111" strokeWidth={4} />
          {m.simbs.map((s: string, i: number) => {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
            return <g key={i} transform={`translate(${ccx + Math.cos(a) * r} ${ccy + Math.sin(a) * r})`}><Simbolo nome={s} cor={i === m.sel ? '#ffd54f' : '#e0e4ec'} /></g>;
          })}
          <g transform={`translate(${ccx} ${ccy}) rotate(${m.sel * 90})`}>
            <path d="M -10 0 L 0 -54 L 10 0 Z" fill="#e53935" /><circle r={14} fill="#999" stroke="#333" strokeWidth={3} />
          </g>
          {m.botoes.map((b: string, i: number) => <circle key={i} cx={cx - 105 + i * 70} cy={h - 50} r={26} fill={COR[b]} stroke="#111" strokeWidth={4} />)}
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={w - 40} cy={70 + i * 34} r={10} fill={i < m.etapa ? '#4cff6a' : '#2a2a2a'} stroke="#111" strokeWidth={2} />)}
        </g>
      );
    }
  }
  return null;
}

const NOMES: Record<string, string> = {cabo: 'CABOS', slider: 'SLIDER DE COR', direcao: 'DIREÇÃO', calculadora: 'CALCULADORA', simbolo: 'SÍMBOLO'};

export const Bomba: React.FC<{modulos: Modulo[]; resta: number; erros: number; maxErros: number; foco?: number; piscar?: boolean; fileira?: boolean}> = ({modulos, resta, erros, maxErros, foco, piscar, fileira}) => {
  const n = modulos.length;
  const cols = fileira ? Math.max(2, n) : n <= 2 ? n : 2, rows = Math.ceil(n / cols);
  const pw = 420, ph = 420, gap = 30;
  const W = cols * pw + (cols - 1) * gap + 80, H = rows * ph + (rows - 1) * gap + 210;
  const mm = Math.max(0, Math.floor(resta / 60)), ss = Math.max(0, Math.floor(resta % 60));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', height: '100%', overflow: 'visible'}}>
      <rect x={0} y={0} width={W} height={H} rx={40} fill="#23262d" stroke="#0f1013" strokeWidth={10} />
      <rect x={14} y={14} width={W - 28} height={H - 28} rx={30} fill="#2d3139" />
      {/* cronômetro + X de erros */}
      <g transform={`translate(${W / 2 - 200} 30)`}>
        <rect width={400} height={130} rx={16} fill="#3b4a2a" stroke="#111" strokeWidth={8} />
        <rect x={16} y={14} width={250} height={102} rx={10} fill="#1a2412" />
        <text x={141} y={95} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={80} fill={LCD} opacity={piscar && resta <= 30 ? 0.35 : 1}>{`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`}</text>
        {Array.from({length: Math.max(1, maxErros)}, (_, i) => (
          <text key={i} x={300 + i * 32} y={84} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={40} fill={i < erros ? '#ff3b30' : '#4c5a3c'}>X</text>
        ))}
      </g>
      {modulos.map((m, i) => (
        <Painel key={i} x={40 + (i % cols) * (pw + gap)} y={180 + Math.floor(i / cols) * (ph + gap)} w={pw} h={ph} ok={m.resolvido} titulo={`${i + 1} · ${NOMES[m.tipo] ?? m.tipo}`} destaque={foco === i}>
          {conteudo(m, pw, ph)}
        </Painel>
      ))}
    </svg>
  );
};
