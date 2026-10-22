// Avatares no estilo do Wolvesville (arte própria): busto com cabeça grande, cores chapadas sem contorno, olhos brancos
// com pupila, sobrancelha grossa. Cada IA tem um personagem da vila (chapéu e roupa da profissão).
// Desenhado num viewBox 200x200 (o quadrado do jogador); a boca mexe quando fala e o avatar pisca sozinho.
import React from 'react';

export type AvatarId = 'padeira' | 'ferreiro' | 'boticaria' | 'lenhador' | 'costureira' | 'pescador' | 'moleiro' | 'bardo';
export type Expressao = 'neutro' | 'desconfiado' | 'assustado' | 'bravo' | 'rindo' | 'culpado' | 'chocado' | 'pensando' | 'chorando' | 'dormindo';

type Visual = {
  pele: string; sombra: string; cabelo: string; estilo: 'coque' | 'curto' | 'careca' | 'longo' | 'cacheado' | 'franja';
  chapeu?: 'chef' | 'gorro' | 'chuva' | 'boina' | 'pena' | 'capuz'; corChapeu?: string;
  roupa: string; roupa2: string; gola?: 'avental' | 'xadrez' | 'capa' | 'fita' | 'colete' | 'gibao';
  barba?: 'cheia' | 'bigode' | 'cavanhaque'; oculos?: boolean; batom?: boolean; bochecha?: boolean;
};

export const AVATARES: Record<AvatarId, Visual & {nome: string; cor: string}> = {
  padeira: {nome: 'Padeira', cor: '#f2994a', pele: '#ffd2b0', sombra: '#f0b48e', cabelo: '#f5c542', estilo: 'coque', chapeu: 'chef', corChapeu: '#ffffff', roupa: '#f2994a', roupa2: '#ffffff', gola: 'avental', batom: true, bochecha: true},
  ferreiro: {nome: 'Ferreiro', cor: '#8d6e63', pele: '#c98b62', sombra: '#ad714b', cabelo: '#2b2b2b', estilo: 'careca', roupa: '#5d6d7e', roupa2: '#6d4c41', gola: 'avental', barba: 'cheia'},
  boticaria: {nome: 'Boticária', cor: '#27ae60', pele: '#f3c9a8', sombra: '#dfae8a', cabelo: '#3b2254', estilo: 'longo', chapeu: 'capuz', corChapeu: '#1e8449', roupa: '#1e8449', roupa2: '#a9dfbf', gola: 'capa', oculos: true, batom: true},
  lenhador: {nome: 'Lenhador', cor: '#e74c3c', pele: '#f1c09a', sombra: '#d9a27a', cabelo: '#7b3f1d', estilo: 'curto', chapeu: 'gorro', corChapeu: '#c0392b', roupa: '#c0392b', roupa2: '#2c3e50', gola: 'xadrez', barba: 'cheia'},
  costureira: {nome: 'Costureira', cor: '#e84393', pele: '#8d5a3b', sombra: '#744628', cabelo: '#1b1b1b', estilo: 'cacheado', roupa: '#e84393', roupa2: '#fbd3e9', gola: 'fita', batom: true, bochecha: true},
  pescador: {nome: 'Pescador', cor: '#f1c40f', pele: '#e8b48c', sombra: '#cf9a70', cabelo: '#9e9e9e', estilo: 'curto', chapeu: 'chuva', corChapeu: '#f1c40f', roupa: '#f1c40f', roupa2: '#2980b9', gola: 'colete', barba: 'bigode'},
  moleiro: {nome: 'Moleiro', cor: '#3498db', pele: '#f6d2b5', sombra: '#e0b693', cabelo: '#6d4c41', estilo: 'franja', chapeu: 'boina', corChapeu: '#34495e', roupa: '#3498db', roupa2: '#ecf0f1', gola: 'colete', barba: 'bigode'},
  bardo: {nome: 'Bardo', cor: '#9b59b6', pele: '#ffdcc2', sombra: '#ecbe9e', cabelo: '#d35400', estilo: 'franja', chapeu: 'pena', corChapeu: '#8e44ad', roupa: '#8e44ad', roupa2: '#f39c12', gola: 'gibao', barba: 'cavanhaque'},
};

const OLHO_Y = 98;

const Olhos: React.FC<{e: Expressao; piscando: boolean; t: number}> = ({e, piscando, t}) => {
  const fechado = piscando || e === 'rindo' || e === 'dormindo';
  const dx = e === 'culpado' ? -4 : e === 'pensando' ? 3 : e === 'desconfiado' ? 3 : 0;
  const dy = e === 'pensando' ? -4 : e === 'culpado' ? 2 : 0;
  const rp = e === 'assustado' || e === 'chocado' ? 3.2 : 5.2;
  const meio = e === 'desconfiado' || e === 'bravo';
  const olho = (cx: number, lado: number) => {
    if (fechado) {
      return e === 'rindo'
        ? <path d={`M${cx - 9} ${OLHO_Y + 2} Q${cx} ${OLHO_Y - 8} ${cx + 9} ${OLHO_Y + 2}`} stroke="#2d1b12" strokeWidth={4} fill="none" strokeLinecap="round" />
        : <path d={`M${cx - 9} ${OLHO_Y} Q${cx} ${OLHO_Y + 6} ${cx + 9} ${OLHO_Y}`} stroke="#2d1b12" strokeWidth={4} fill="none" strokeLinecap="round" />;
    }
    return (
      <g>
        <ellipse cx={cx} cy={OLHO_Y} rx={10} ry={e === 'chocado' || e === 'assustado' ? 13 : 11} fill="#fff" />
        <circle cx={cx + dx} cy={OLHO_Y + dy + 1} r={rp} fill="#2d1b12" />
        <circle cx={cx + dx + 1.8} cy={OLHO_Y + dy - 1.5} r={1.6} fill="#fff" />
        {meio ? <rect x={cx - 11} y={OLHO_Y - 13} width={22} height={lado * 0 + 9} fill="var(--pele)" /> : null}
      </g>
    );
  };
  return (
    <g>
      {olho(80, -1)}
      {olho(120, 1)}
      {e === 'chorando' ? (
        <g fill="#5dade2">
          <path d={`M78 ${OLHO_Y + 10 + (t % 20)} q-4 8 0 10 q4 -2 0 -10z`} />
          <path d={`M122 ${OLHO_Y + 10 + ((t + 10) % 20)} q-4 8 0 10 q4 -2 0 -10z`} />
        </g>
      ) : null}
    </g>
  );
};

const Sobrancelhas: React.FC<{e: Expressao; cor: string}> = ({e, cor}) => {
  // [y externo, y interno] de cada sobrancelha (esquerda, direita)
  const formas: Record<Expressao, [number, number, number, number]> = {
    neutro: [80, 80, 80, 80], desconfiado: [82, 84, 74, 78], assustado: [76, 72, 72, 76], bravo: [78, 88, 88, 78],
    rindo: [78, 78, 78, 78], culpado: [84, 76, 76, 84], chocado: [72, 70, 70, 72], pensando: [78, 80, 74, 76],
    chorando: [84, 74, 74, 84], dormindo: [82, 82, 82, 82],
  };
  const [a, b, c, d] = formas[e];
  return (
    <g stroke={cor} strokeWidth={6} strokeLinecap="round">
      <line x1={70} y1={a} x2={89} y2={b} />
      <line x1={111} y1={c} x2={130} y2={d} />
    </g>
  );
};

const Boca: React.FC<{e: Expressao; abre: number; batom?: boolean}> = ({e, abre, batom}) => {
  const y = 128;
  const cor = batom ? '#c0392b' : '#7b2d26';
  if (abre > 0.15 || e === 'chocado' || e === 'assustado') {
    const h = e === 'chocado' ? 14 : e === 'assustado' ? 9 : 4 + abre * 10;
    const w = e === 'chocado' || e === 'assustado' ? 9 : 13;
    return (
      <g>
        <ellipse cx={100} cy={y + 2} rx={w} ry={h} fill="#5b1f1a" />
        <ellipse cx={100} cy={y + 2 + h * 0.5} rx={w * 0.6} ry={h * 0.35} fill="#e57373" />
      </g>
    );
  }
  if (e === 'rindo') return <path d={`M84 ${y - 3} Q100 ${y + 18} 116 ${y - 3}Z`} fill="#5b1f1a" />;
  if (e === 'bravo' || e === 'chorando' || e === 'culpado') return <path d={`M88 ${y + 5} Q100 ${y - 4} 112 ${y + 5}`} stroke={cor} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  if (e === 'desconfiado' || e === 'pensando') return <path d={`M90 ${y + 2} L110 ${y - 2}`} stroke={cor} strokeWidth={4.5} strokeLinecap="round" />;
  if (e === 'dormindo') return <ellipse cx={100} cy={y + 1} rx={4} ry={3} fill="#5b1f1a" />;
  return <path d={`M89 ${y} Q100 ${y + 8} 111 ${y}`} stroke={cor} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
};

const CabeloAtras: React.FC<{v: Visual}> = ({v}) => {
  if (v.estilo === 'longo') return <path d="M50 92 Q48 40 100 38 Q152 40 150 92 L156 168 Q100 178 44 168Z" fill={v.cabelo} />;
  if (v.estilo === 'cacheado') return <g fill={v.cabelo}>{[[58, 70, 22], [142, 70, 22], [52, 100, 20], [148, 100, 20], [62, 128, 16], [138, 128, 16], [100, 42, 30], [72, 48, 24], [128, 48, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
  if (v.estilo === 'coque') return <circle cx={100} cy={40} r={20} fill={v.cabelo} />;
  return null;
};

const CabeloFrente: React.FC<{v: Visual}> = ({v}) => {
  if (v.estilo === 'careca') return <ellipse cx={86} cy={62} rx={14} ry={6} fill="#fff" opacity={0.25} />;
  if (v.estilo === 'curto') return <path d="M54 92 Q52 48 100 46 Q148 48 146 92 Q140 70 120 66 Q100 74 80 66 Q60 70 54 92Z" fill={v.cabelo} />;
  if (v.estilo === 'franja') return <path d="M52 96 Q50 46 100 44 Q150 46 148 96 Q146 74 134 66 L128 80 L118 66 L106 80 L96 66 L84 80 L74 66 Q58 74 52 96Z" fill={v.cabelo} />;
  if (v.estilo === 'longo') return <path d="M54 100 Q52 48 100 46 Q148 48 146 100 Q138 64 100 62 Q66 62 54 100Z" fill={v.cabelo} />;
  if (v.estilo === 'coque') return <path d="M54 92 Q54 52 100 50 Q146 52 146 92 Q130 64 100 64 Q70 64 54 92Z" fill={v.cabelo} />;
  if (v.estilo === 'cacheado') return <g fill={v.cabelo}>{[[70, 62, 16], [88, 54, 17], [108, 54, 17], [128, 62, 16], [58, 80, 12], [142, 80, 12]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
  return null;
};

const Chapeu: React.FC<{v: Visual; t: number}> = ({v, t}) => {
  const c = v.corChapeu ?? '#333';
  switch (v.chapeu) {
    case 'chef':
      return (
        <g>
          <rect x={62} y={44} width={76} height={18} rx={4} fill="#ecf0f1" />
          {[[74, 30, 18], [100, 22, 22], [126, 30, 18]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} />)}
          <rect x={60} y={50} width={80} height={14} rx={5} fill={c} />
          <rect x={60} y={58} width={80} height={6} rx={3} fill="#dfe6e9" />
        </g>
      );
    case 'gorro':
      return (
        <g>
          <path d="M52 76 Q52 30 100 28 Q148 30 148 76Z" fill={c} />
          <rect x={48} y={66} width={104} height={16} rx={8} fill="#a93226" />
          {[60, 76, 92, 108, 124, 140].map((x) => <rect key={x} x={x - 2} y={68} width={4} height={12} fill="#922b21" />)}
          <circle cx={100} cy={26} r={11} fill="#ecf0f1" />
        </g>
      );
    case 'chuva':
      return (
        <g>
          <path d="M36 80 Q100 60 164 80 Q170 92 150 90 Q100 78 50 90 Q30 92 36 80Z" fill="#d4ac0d" />
          <path d="M58 80 Q56 34 100 32 Q144 34 142 80Z" fill={c} />
          <path d="M62 66 Q100 58 138 66" stroke="#d4ac0d" strokeWidth={4} fill="none" />
        </g>
      );
    case 'boina':
      return (
        <g>
          <ellipse cx={96} cy={58} rx={52} ry={22} fill={c} />
          <path d="M56 66 Q100 84 150 66 L152 74 Q100 92 54 74Z" fill="#2c3e50" />
          <circle cx={92} cy={38} r={4} fill="#2c3e50" />
        </g>
      );
    case 'pena': {
      const balanca = Math.sin(t / 9) * 4;
      return (
        <g>
          <path d={`M120 48 Q${160 + balanca} 0 ${172 + balanca} 18 Q${150 + balanca} 30 132 56Z`} fill="#e74c3c" />
          <path d={`M126 50 Q${158 + balanca} 14 ${168 + balanca} 20`} stroke="#922b21" strokeWidth={2} fill="none" />
          <path d="M44 74 Q100 50 156 74 Q100 64 44 74Z" fill="#6c3483" />
          <path d="M58 70 Q60 30 100 30 Q140 30 142 70Z" fill={c} />
          <rect x={58} y={60} width={84} height={10} fill="#f39c12" />
        </g>
      );
    }
    case 'capuz':
      return <path d="M42 130 Q34 34 100 28 Q166 34 158 130 L148 130 Q150 64 100 58 Q50 64 52 130Z" fill={c} />;
    default:
      return null;
  }
};

const Roupa: React.FC<{v: Visual}> = ({v}) => {
  const ombro = 'M18 200 Q20 160 64 150 L136 150 Q180 160 182 200Z';
  return (
    <g>
      <path d={ombro} fill={v.roupa} />
      {v.gola === 'avental' ? <path d="M70 152 L130 152 L136 200 L64 200Z" fill={v.roupa2} /> : null}
      {v.gola === 'avental' ? <g stroke={v.roupa2} strokeWidth={6}><line x1={72} y1={152} x2={82} y2={142} /><line x1={128} y1={152} x2={118} y2={142} /></g> : null}
      {v.gola === 'xadrez' ? <g opacity={0.35} stroke={v.roupa2} strokeWidth={6}>{[40, 70, 100, 130, 160].map((x) => <line key={x} x1={x} y1={150} x2={x} y2={200} />)}<line x1={18} y1={175} x2={182} y2={175} /></g> : null}
      {v.gola === 'capa' ? <path d="M60 150 Q100 176 140 150 L150 200 L50 200Z" fill={v.roupa2} opacity={0.5} /> : null}
      {v.gola === 'fita' ? <path d="M74 150 Q100 170 126 150 L120 200 L112 200 L116 160 Q100 172 84 160 L88 200 L80 200Z" fill="#f7dc6f" /> : null}
      {v.gola === 'colete' ? <g><path d="M78 150 L100 186 L122 150 L132 200 L68 200Z" fill={v.roupa2} /><circle cx={100} cy={194} r={3} fill="#555" /></g> : null}
      {v.gola === 'gibao' ? <g><path d="M70 150 Q100 168 130 150 L126 160 Q100 178 74 160Z" fill={v.roupa2} />{[176, 190].map((y) => <circle key={y} cx={100} cy={y} r={3.5} fill={v.roupa2} />)}</g> : null}
    </g>
  );
};

const Barba: React.FC<{v: Visual}> = ({v}) => {
  if (v.barba === 'cheia') return <path d="M56 104 Q58 158 100 160 Q142 158 144 104 Q138 128 122 122 Q100 116 78 122 Q62 128 56 104Z" fill={v.cabelo === '#2b2b2b' ? '#3e2723' : v.cabelo} />;
  if (v.barba === 'bigode') return <path d="M82 120 Q92 112 100 118 Q108 112 118 120 Q112 126 100 122 Q88 126 82 120Z" fill={v.cabelo} />;
  if (v.barba === 'cavanhaque') return <path d="M92 140 Q100 156 108 140Z" fill={v.cabelo} />;
  return null;
};

export const Avatar: React.FC<{
  id: AvatarId; expressao?: Expressao; falando?: boolean; t?: number; morto?: boolean;
}> = ({id, expressao = 'neutro', falando = false, t = 0, morto = false}) => {
  const v = AVATARES[id];
  const semente = id.length * 37;
  const piscando = !morto && (t + semente) % 97 < 4;
  const abre = falando ? Math.abs(Math.sin((t + semente) * 0.55)) * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.21))) : 0;
  const e: Expressao = morto ? 'dormindo' : expressao;
  const bob = falando ? Math.sin(t * 0.5) * 1.5 : Math.sin((t + semente) / 30) * 1;
  return (
    <g style={{['--pele' as any]: v.pele}} transform={`translate(0 ${bob})`}>
      <Roupa v={v} />
      <rect x={86} y={134} width={28} height={22} fill={v.sombra} />
      <CabeloAtras v={v} />
      {v.chapeu === 'capuz' ? <path d="M42 130 Q34 34 100 28 Q166 34 158 130Z" fill={v.corChapeu} opacity={0.9} /> : null}
      <ellipse cx={52} cy={104} rx={9} ry={12} fill={v.sombra} />
      <ellipse cx={148} cy={104} rx={9} ry={12} fill={v.sombra} />
      <ellipse cx={100} cy={98} rx={48} ry={50} fill={v.pele} />
      <ellipse cx={100} cy={136} rx={30} ry={10} fill={v.sombra} opacity={0.35} />
      {v.bochecha ? <g fill="#ff8a80" opacity={0.45}><ellipse cx={70} cy={118} rx={8} ry={5} /><ellipse cx={130} cy={118} rx={8} ry={5} /></g> : null}
      <Barba v={v} />
      <CabeloFrente v={v} />
      <Sobrancelhas e={e} cor={v.estilo === 'careca' ? '#3e2723' : v.cabelo === '#f5c542' ? '#b7950b' : v.cabelo} />
      <Olhos e={e} piscando={piscando} t={t} />
      {v.oculos ? <g fill="none" stroke="#2c3e50" strokeWidth={3.5}><circle cx={80} cy={OLHO_Y} r={14} /><circle cx={120} cy={OLHO_Y} r={14} /><line x1={94} y1={OLHO_Y} x2={106} y2={OLHO_Y} /></g> : null}
      <path d="M100 106 Q96 116 102 117" stroke={v.sombra} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {v.barba === 'bigode' ? <Barba v={v} /> : null}
      <Boca e={e} abre={abre} batom={v.batom} />
      {e === 'culpado' ? <path d="M146 72 q-6 10 0 13 q6 -3 0 -13z" fill="#85c1e9" /> : null}
      <Chapeu v={v} t={t} />
      {e === 'dormindo' && !morto ? <text x={150} y={50 - (t % 40) / 3} fontSize={22} fontWeight={900} fill="#fff" opacity={0.85} fontFamily="Poppins">z</text> : null}
    </g>
  );
};
