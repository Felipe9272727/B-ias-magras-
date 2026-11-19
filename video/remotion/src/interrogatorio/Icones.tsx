// Ícones do Interrogatório desenhados em SVG (regra do canal: NENHUM emoji dentro do vídeo).
// Todos no sistema 100×100, contorno preto grosso e cores chapadas, no estilo do HUD.
import React from 'react';

const K = '#141414';
const S = {stroke: K, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// desenha o grupo duas vezes: primeiro só o contorno grosso, depois o preenchimento (formas sobrepostas sem risco no meio)
const Duplo: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    <g stroke={K} strokeWidth={10} strokeLinejoin="round">{children}</g>
    <g stroke="none">{children}</g>
  </>
);

export const CORACAO_PATH = 'M12 21 C4 14 2 11 2 7.5 C2 4.5 4.5 2 7.5 2 C9.5 2 11 3.2 12 5 C13 3.2 14.5 2 16.5 2 C19.5 2 22 4.5 22 7.5 C22 11 20 14 12 21 Z';

const DESENHOS: Record<string, React.ReactNode> = {
  celular: (<><rect x={30} y={8} width={40} height={84} rx={9} fill="#2b2f38" {...S} /><rect x={36} y={18} width={28} height={56} rx={3} fill="#7fd3ff" /><circle cx={50} cy={83} r={4} fill="#ddd" /></>),
  camera: (<><rect x={8} y={30} width={60} height={42} rx={8} fill="#4a4f5a" {...S} /><path d="M68 44 L92 30 V72 L68 58 Z" fill="#6b717d" {...S} /><circle cx={22} cy={42} r={6} fill="#e8202a" /><circle cx={40} cy={52} r={10} fill="#1d2027" stroke="#9aa3b2" strokeWidth={3} /></>),
  bolo: (<><rect x={16} y={48} width={68} height={38} rx={6} fill="#f2c27a" {...S} /><path d="M16 50 Q25 64 33 52 Q42 64 50 52 Q58 64 67 52 Q75 64 84 50 V48 H16 Z" fill="#ff8fb8" {...S} /><rect x={46} y={26} width={8} height={22} fill="#6ec6ff" {...S} /><path d="M50 6 Q58 16 50 22 Q42 16 50 6 Z" fill="#ffb020" {...S} /></>),
  digital: (<>{[12, 20, 28, 36].map((r, i) => <ellipse key={i} cx={50} cy={52} rx={r * 0.8} ry={r * 1.1} fill="none" stroke="#3b5bdb" strokeWidth={6} strokeDasharray={i % 2 ? '30 8' : '50 10'} strokeLinecap="round" />)}<circle cx={50} cy={52} r={4} fill="#3b5bdb" /></>),
  lupa: (<><line x1={62} y1={62} x2={88} y2={88} stroke="#6b3a1f" strokeWidth={14} strokeLinecap="round" /><circle cx={42} cy={42} r={26} fill="#bfe9ff" {...S} strokeWidth={7} /><path d="M28 34 Q32 24 42 22" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /></>),
  wifi: (<>{['M14 44 Q50 8 86 44', 'M26 58 Q50 34 74 58', 'M38 71 Q50 60 62 71'].map((d, i) => <path key={i} d={d} fill="none" stroke="#1f8fff" strokeWidth={10} strokeLinecap="round" />)}<circle cx={50} cy={84} r={7} fill="#1f8fff" {...S} strokeWidth={3} /></>),
  olho: (<><path d="M6 50 Q50 8 94 50 Q50 92 6 50 Z" fill="#fff" {...S} /><circle cx={50} cy={50} r={18} fill="#3b8bff" {...S} strokeWidth={4} /><circle cx={50} cy={50} r={8} fill={K} /><circle cx={56} cy={44} r={4} fill="#fff" /></>),
  pizza: (<><path d="M50 94 L12 22 Q50 2 88 22 Z" fill="#f7c948" {...S} /><path d="M12 22 Q50 2 88 22" fill="none" stroke="#c47a2c" strokeWidth={12} strokeLinecap="round" /><circle cx={40} cy={36} r={7} fill="#d9342b" /><circle cx={60} cy={42} r={7} fill="#d9342b" /><circle cx={50} cy={62} r={6} fill="#d9342b" /></>),
  chat: (<><path d="M14 16 H86 Q94 16 94 24 V62 Q94 70 86 70 H42 L22 88 V70 H14 Q6 70 6 62 V24 Q6 16 14 16 Z" fill="#fff" {...S} /><circle cx={32} cy={43} r={6} fill="#555" /><circle cx={50} cy={43} r={6} fill="#555" /><circle cx={68} cy={43} r={6} fill="#555" /></>),
  copo: (<><line x1={56} y1={34} x2={72} y2={4} stroke="#fff" strokeWidth={7} strokeLinecap="round" /><path d="M24 30 L32 94 H68 L76 30 Z" fill="#ff5fa2" {...S} /><rect x={20} y={24} width={60} height={9} rx={4} fill="#ffd0e4" {...S} strokeWidth={4} /><circle cx={44} cy={58} r={5} fill="#ffd0e4" /><circle cx={58} cy={72} r={4} fill="#ffd0e4" /></>),
  pegada: (<>{[[34, 64, -12], [66, 34, 14]].map(([x, y, r], i) => (
    <g key={i} transform={`rotate(${r} ${x} ${y})`}><ellipse cx={x} cy={y + 6} rx={12} ry={17} fill="#ff5fa2" {...S} strokeWidth={4} />{[-9, -3, 3, 9].map((dx, j) => <circle key={j} cx={x + dx} cy={y - 16 + Math.abs(dx) * 0.4} r={3.6} fill="#ff5fa2" {...S} strokeWidth={2.5} />)}</g>
  ))}</>),
  elevador: (<><rect x={18} y={6} width={64} height={88} rx={5} fill="#7b8594" {...S} /><rect x={24} y={20} width={25} height={70} fill="#cfd6e0" {...S} strokeWidth={3} /><rect x={51} y={20} width={25} height={70} fill="#cfd6e0" {...S} strokeWidth={3} /><path d="M44 15 L50 9 L56 15 Z" fill="#ffd21f" /></>),
  fogo: (<><path d="M50 94 C20 94 16 66 30 48 C32 60 40 64 40 64 C36 42 46 22 60 8 C58 30 82 40 82 64 C82 84 68 94 50 94 Z" fill="#ff7a1a" {...S} /><path d="M50 90 C36 90 34 76 42 66 C44 74 50 74 50 74 C48 64 54 54 60 48 C62 62 70 68 68 78 C66 86 60 90 50 90 Z" fill="#ffd23f" /></>),
  saco: (<><circle cx={40} cy={26} r={8} fill="#222" /><circle cx={54} cy={22} r={8} fill="#333" /><circle cx={64} cy={28} r={7} fill="#222" /><path d="M24 32 Q16 94 30 94 H70 Q84 94 76 32 Z" fill="#8b6a45" {...S} /><path d="M30 46 H70" stroke="#5a4028" strokeWidth={4} /></>),
  nota: (<><ellipse cx={34} cy={76} rx={15} ry={11} transform="rotate(-20 34 76)" fill="#ffd21f" {...S} /><rect x={44} y={14} width={7} height={62} fill="#ffd21f" {...S} strokeWidth={4} /><path d="M51 14 Q82 24 74 52 Q70 36 51 32 Z" fill="#ffd21f" {...S} strokeWidth={4} /></>),
  notas: (<><ellipse cx={26} cy={74} rx={12} ry={9} fill="#ffd21f" {...S} /><ellipse cx={70} cy={66} rx={12} ry={9} fill="#ffd21f" {...S} /><path d="M35 72 V24 L79 14 V64" fill="none" stroke={K} strokeWidth={7} /><path d="M35 34 L79 24" stroke={K} strokeWidth={9} /></>),
  mochila: (<><path d="M38 24 Q50 4 62 24" fill="none" stroke={K} strokeWidth={7} /><rect x={20} y={22} width={60} height={70} rx={16} fill="#2f6bff" {...S} /><rect x={30} y={54} width={40} height={28} rx={7} fill="#1f4fcf" {...S} strokeWidth={4} /><line x1={30} y1={62} x2={70} y2={62} stroke="#ffd21f" strokeWidth={3} /></>),
  bilhete: (<g transform="rotate(-6 50 50)"><path d="M20 10 H72 L82 20 V90 H20 Z" fill="#fff6c8" {...S} />{[32, 46, 60, 74].map((y) => <line key={y} x1={30} y1={y} x2={y === 74 ? 56 : 72} y2={y} stroke="#8a7a50" strokeWidth={4} strokeLinecap="round" />)}</g>),
  folha: (<><path d="M16 86 C16 42 48 16 88 12 C86 54 60 86 16 86 Z" fill="#3fbf5a" {...S} /><path d="M18 84 L68 32" stroke="#1f7a33" strokeWidth={5} strokeLinecap="round" /></>),
  caderno: (<><rect x={22} y={8} width={60} height={84} rx={5} fill="#e2325a" {...S} /><rect x={38} y={24} width={34} height={16} rx={3} fill="#fff" {...S} strokeWidth={3} />{[20, 34, 48, 62, 76].map((y) => <circle key={y} cx={22} cy={y} r={5} fill="#d6dbe2" {...S} strokeWidth={3} />)}</>),
  girassol: (<><Duplo>{Array.from({length: 12}, (_, i) => <ellipse key={i} cx={50} cy={22} rx={8} ry={17} fill="#ffd21f" transform={`rotate(${i * 30} 50 50)`} />)}</Duplo><circle cx={50} cy={50} r={16} fill="#6b3a1f" {...S} strokeWidth={4} /><circle cx={45} cy={46} r={2.5} fill="#3a1f0c" /><circle cx={55} cy={54} r={2.5} fill="#3a1f0c" /></>),
  multa: (<><rect x={10} y={22} width={80} height={56} rx={5} fill="#fff" {...S} /><rect x={10} y={22} width={80} height={16} rx={5} fill="#e8202a" {...S} strokeWidth={4} /><text x={50} y={68} textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize={28} fill={K}>R$</text></>),
  lua: (<><path d="M60 8 A42 42 0 1 0 92 64 A34 34 0 1 1 60 8 Z" fill="#ffe680" {...S} /><circle cx={38} cy={58} r={5} fill="#e8c84a" /><circle cx={30} cy={38} r={3} fill="#e8c84a" /></>),
  osso: (<Duplo><rect x={22} y={42} width={56} height={16} fill="#fff" /><circle cx={22} cy={40} r={11} fill="#fff" /><circle cx={22} cy={60} r={11} fill="#fff" /><circle cx={78} cy={40} r={11} fill="#fff" /><circle cx={78} cy={60} r={11} fill="#fff" /></Duplo>),
  pata: (<Duplo><ellipse cx={50} cy={66} rx={21} ry={18} fill="#d9a46a" /><ellipse cx={24} cy={44} rx={9} ry={11} fill="#d9a46a" /><ellipse cx={40} cy={26} rx={9} ry={12} fill="#d9a46a" /><ellipse cx={60} cy={26} rx={9} ry={12} fill="#d9a46a" /><ellipse cx={76} cy={44} rx={9} ry={11} fill="#d9a46a" /></Duplo>),
  coracao: (<g transform="translate(2 4) scale(4)"><path d={CORACAO_PATH} fill="#ff4d6d" stroke={K} strokeWidth={1.3} strokeLinejoin="round" /></g>),
  balanca: (<><line x1={50} y1={12} x2={50} y2={84} stroke={K} strokeWidth={8} /><rect x={28} y={82} width={44} height={10} rx={3} fill="#ffd21f" {...S} /><line x1={14} y1={24} x2={86} y2={24} stroke={K} strokeWidth={7} strokeLinecap="round" /><circle cx={50} cy={14} r={6} fill="#ffd21f" {...S} strokeWidth={3} />{[16, 84].map((x) => (<g key={x}><path d={`M${x} 24 L${x - 12} 56 M${x} 24 L${x + 12} 56`} stroke={K} strokeWidth={3} /><path d={`M${x - 16} 56 Q${x} 74 ${x + 16} 56 Z`} fill="#ffd21f" {...S} strokeWidth={4} /></g>))}</>),
  alerta: (<><path d="M50 6 L95 90 H5 Z" fill="#ffd21f" {...S} strokeWidth={6} /><rect x={45} y={34} width={10} height={32} rx={4} fill={K} /><circle cx={50} cy={77} r={6} fill={K} /></>),
  certo: (<><circle cx={50} cy={50} r={44} fill="#1f8f3a" {...S} /><path d="M27 52 L44 69 L74 33" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /></>),
  errado: (<><circle cx={50} cy={50} r={44} fill="#e8202a" {...S} /><path d="M32 32 L68 68 M68 32 L32 68" stroke="#fff" strokeWidth={12} strokeLinecap="round" /></>),
  microfone: (<><path d="M28 40 Q28 68 50 68 Q72 68 72 40" fill="none" stroke={K} strokeWidth={6} strokeLinecap="round" /><line x1={50} y1={68} x2={50} y2={86} stroke={K} strokeWidth={6} /><line x1={34} y1={88} x2={66} y2={88} stroke={K} strokeWidth={7} strokeLinecap="round" /><rect x={36} y={6} width={28} height={48} rx={14} fill="#9aa3b2" {...S} /><path d="M38 20 H62 M38 30 H62 M38 40 H62" stroke="#5a6270" strokeWidth={3} /></>),
  meia: (<><path d="M36 8 H62 V56 L82 68 Q94 76 86 88 Q78 96 66 88 L38 74 Q28 68 32 58 Z" fill="#ff7fbf" {...S} /><rect x={36} y={8} width={26} height={13} fill="#fff" {...S} strokeWidth={4} /><path d="M66 70 Q72 80 82 80" stroke="#ff3b9a" strokeWidth={4} fill="none" /></>),
  tomate: (<><circle cx={50} cy={58} r={34} fill="#e8402a" {...S} /><path d="M50 26 L40 16 L48 22 L50 10 L52 22 L60 16 Z" fill="#2f9e44" {...S} strokeWidth={4} /><ellipse cx={36} cy={48} rx={7} ry={10} fill="#fff" opacity={0.55} /></>),
  papagaio: (<><path d="M36 82 L26 98 L48 88 Z" fill="#e8202a" {...S} strokeWidth={4} /><ellipse cx={46} cy={60} rx={23} ry={29} fill="#2fbf4a" {...S} /><circle cx={56} cy={30} r={19} fill="#2fbf4a" {...S} /><path d="M70 24 Q90 30 72 46 Z" fill="#ffb020" {...S} strokeWidth={4} /><circle cx={60} cy={26} r={6} fill="#fff" {...S} strokeWidth={2} /><circle cx={61} cy={26} r={3} fill={K} /><path d="M30 54 Q44 48 52 72 Q38 74 30 54 Z" fill="#1f8f3a" {...S} strokeWidth={3} /></>),
  cartao: (<><rect x={8} y={22} width={84} height={56} rx={9} fill="#3b8bff" {...S} /><rect x={10} y={34} width={80} height={11} fill={K} /><rect x={18} y={54} width={18} height={14} rx={3} fill="#ffd21f" {...S} strokeWidth={3} /></>),
  lampada: (<><rect x={38} y={64} width={24} height={20} rx={3} fill="#9aa3b2" {...S} /><path d="M50 8 A27 27 0 0 1 64 58 V66 H36 V58 A27 27 0 0 1 50 8 Z" fill="#fff27a" {...S} /><path d="M42 40 L50 48 L58 40" stroke="#c9a400" strokeWidth={3} fill="none" /><line x1={44} y1={90} x2={56} y2={90} stroke={K} strokeWidth={6} strokeLinecap="round" /></>),
  gnomo: (<><path d="M30 56 Q50 102 70 56 Q50 66 30 56 Z" fill="#fff" {...S} /><circle cx={50} cy={54} r={15} fill="#ffd0a8" {...S} strokeWidth={4} /><path d="M50 4 L76 48 H24 Z" fill="#e8202a" {...S} /><circle cx={50} cy={58} r={5} fill="#ff8a7a" /><circle cx={43} cy={50} r={2.5} fill={K} /><circle cx={57} cy={50} r={2.5} fill={K} /></>),
  alto: (<><path d="M12 38 H32 L56 16 V84 L32 62 H12 Z" fill="#5a6270" {...S} /><path d="M66 36 Q76 50 66 64 M76 26 Q92 50 76 74" fill="none" stroke={K} strokeWidth={6} strokeLinecap="round" /></>),
  fone: (<><path d="M20 62 Q20 16 50 16 Q80 16 80 62" fill="none" stroke={K} strokeWidth={9} strokeLinecap="round" /><rect x={10} y={54} width={20} height={34} rx={7} fill="#e2325a" {...S} /><rect x={70} y={54} width={20} height={34} rx={7} fill="#e2325a" {...S} /></>),
  garfo: (<><rect x={45} y={44} width={10} height={50} rx={5} fill="#c9ced6" {...S} /><path d="M32 6 V34 Q32 48 50 48 Q68 48 68 34 V6 H61 V30 H55 V6 H45 V30 H39 V6 Z" fill="#c9ced6" {...S} /></>),
  vela: (<><rect x={38} y={34} width={24} height={58} rx={3} fill="#fff" {...S} /><line x1={50} y1={34} x2={50} y2={26} stroke={K} strokeWidth={3} /><path d="M50 6 Q60 18 50 26 Q40 18 50 6 Z" fill="#ffb020" {...S} strokeWidth={4} /><path d="M38 48 Q44 54 50 48" stroke="#ddd" strokeWidth={3} fill="none" /></>),
  chocolate: (<><rect x={22} y={10} width={56} height={80} rx={4} fill="#6b3a1f" {...S} /><path d="M22 30 H78 M22 48 H78 M50 10 V60" stroke="#4a2410" strokeWidth={4} /><rect x={22} y={60} width={56} height={30} rx={3} fill="#e8202a" {...S} strokeWidth={4} /></>),
  carro: (<><path d="M8 66 V52 Q10 42 22 40 L32 24 H66 L80 40 Q92 42 92 52 V66 Z" fill="#ff5fa2" {...S} /><path d="M36 30 H48 V40 H28 Z M54 30 H64 L72 40 H54 Z" fill="#bfe9ff" {...S} strokeWidth={3} /><circle cx={28} cy={68} r={11} fill="#222" {...S} strokeWidth={3} /><circle cx={72} cy={68} r={11} fill="#222" {...S} strokeWidth={3} /></>),
  esmalte: (<><rect x={40} y={8} width={20} height={38} rx={4} fill="#222" {...S} /><rect x={28} y={44} width={44} height={48} rx={12} fill="#ff3bb0" {...S} /><ellipse cx={40} cy={62} rx={5} ry={10} fill="#fff" opacity={0.5} /></>),
  brilho: (<><path d="M50 4 Q56 44 96 50 Q56 56 50 96 Q44 56 4 50 Q44 44 50 4 Z" fill="#ffe680" {...S} strokeWidth={4} /><path d="M80 8 Q82 18 92 20 Q82 22 80 32 Q78 22 68 20 Q78 18 80 8 Z" fill="#fff" {...S} strokeWidth={2.5} /></>),
  paleta: (<><path d="M50 8 C80 8 96 30 92 52 C88 70 70 66 64 74 C58 84 66 94 50 94 C20 94 6 72 6 50 C6 26 24 8 50 8 Z" fill="#e0b46a" {...S} /><circle cx={30} cy={36} r={8} fill="#e8202a" /><circle cx={52} cy={26} r={8} fill="#3b8bff" /><circle cx={72} cy={38} r={8} fill="#ffd21f" /><circle cx={26} cy={60} r={8} fill="#ff3bb0" /><circle cx={48} cy={74} r={7} fill="#fff" {...S} strokeWidth={3} /></>),
  dinheiro: (<><rect x={6} y={24} width={88} height={52} rx={6} fill="#5fd17a" {...S} /><circle cx={50} cy={50} r={15} fill="#3aa35a" {...S} strokeWidth={3} /><text x={50} y={60} textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize={26} fill="#0f4a22">$</text></>),
  chuveiro: (<><path d="M18 8 V28 Q18 36 28 36 H52" fill="none" stroke={K} strokeWidth={8} strokeLinecap="round" /><path d="M36 36 H76 L68 52 H44 Z" fill="#9aa3b2" {...S} />{[46, 56, 66].map((x, i) => <line key={x} x1={x} y1={62 + (i % 2) * 6} x2={x - 4} y2={80 + (i % 2) * 6} stroke="#3b8bff" strokeWidth={6} strokeLinecap="round" />)}</>),
  tomada: (<><rect x={38} y={8} width={7} height={22} fill="#c9ced6" {...S} strokeWidth={3} /><rect x={55} y={8} width={7} height={22} fill="#c9ced6" {...S} strokeWidth={3} /><rect x={28} y={28} width={44} height={40} rx={9} fill="#ff5fa2" {...S} /><path d="M50 68 Q50 94 84 90" fill="none" stroke={K} strokeWidth={7} strokeLinecap="round" /></>),
  bateria: (<><rect x={10} y={28} width={72} height={44} rx={7} fill="#222" {...S} /><rect x={82} y={42} width={9} height={16} rx={2} fill="#222" {...S} strokeWidth={3} /><rect x={17} y={35} width={58} height={30} rx={3} fill="#39ff7a" /></>),
  controle: (<><path d="M22 36 Q8 36 8 58 Q8 84 24 84 Q34 84 40 70 H60 Q66 84 76 84 Q92 84 92 58 Q92 36 78 36 Z" fill="#4a4f5a" {...S} /><path d="M22 54 H36 M29 47 V61" stroke="#fff" strokeWidth={5} strokeLinecap="round" /><circle cx={70} cy={50} r={5} fill="#e8202a" /><circle cx={78} cy={58} r={5} fill="#3b8bff" /><circle cx={62} cy={58} r={5} fill="#ffd21f" /></>),
  cama: (<><rect x={8} y={56} width={84} height={18} rx={3} fill="#8b5a2b" {...S} /><rect x={8} y={74} width={8} height={14} fill="#8b5a2b" {...S} strokeWidth={3} /><rect x={84} y={74} width={8} height={14} fill="#8b5a2b" {...S} strokeWidth={3} /><rect x={12} y={44} width={76} height={14} rx={4} fill="#fff" {...S} strokeWidth={4} /><ellipse cx={24} cy={40} rx={12} ry={8} fill="#fff" {...S} strokeWidth={4} /><rect x={38} y={38} width={52} height={20} rx={5} fill="#3b8bff" {...S} strokeWidth={4} /></>),
  peixe: (<><path d="M64 50 L92 30 V70 Z" fill="#ff9a1f" {...S} /><path d="M8 50 Q38 16 70 50 Q38 84 8 50 Z" fill="#ffb020" {...S} /><circle cx={26} cy={46} r={5} fill="#fff" {...S} strokeWidth={2} /><circle cx={26} cy={46} r={2.5} fill={K} /><path d="M40 36 Q46 50 40 64" stroke="#c97a10" strokeWidth={4} fill="none" /></>),
  bolhas: (<>{[[34, 62, 24], [68, 34, 16], [70, 74, 11], [40, 22, 9]].map(([x, y, r], i) => <g key={i}><circle cx={x} cy={y} r={r} fill="#bfe9ff" fillOpacity={0.5} stroke="#7fd3ff" strokeWidth={5} /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" /></g>)}</>),
  cafe: (<><path d="M70 40 Q90 40 88 56 Q86 70 68 66" fill="none" stroke={K} strokeWidth={7} /><path d="M16 34 H74 V70 Q74 90 54 90 H36 Q16 90 16 70 Z" fill="#fff" {...S} /><rect x={20} y={38} width={50} height={9} fill="#6b3a1f" />{[32, 46, 60].map((x) => <path key={x} d={`M${x} 26 Q${x - 6} 18 ${x} 10`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />)}</>),
  casaco: (<><path d="M30 10 L50 22 L70 10 L90 26 L82 50 L74 46 V92 H26 V46 L18 50 L10 26 Z" fill="#f1e3c8" {...S} /><path d="M50 22 V92" stroke="#c9b48a" strokeWidth={4} />{[30, 44, 58, 72].map((y) => <circle key={y} cx={40} cy={y} r={3} fill="#c9b48a" />)}{[36, 50, 64, 78].map((y) => <circle key={y} cx={62} cy={y} r={3} fill="#c9b48a" />)}</>),
};

export const ICONES_INT = Object.keys(DESENHOS);

export const Icone: React.FC<{nome: string; tam?: number; style?: React.CSSProperties}> = ({nome, tam = 100, style}) => (
  <svg viewBox="0 0 100 100" width={tam} height={tam} style={{display: 'block', overflow: 'visible', ...style}}>
    {DESENHOS[nome] ?? DESENHOS.lupa}
  </svg>
);

// pista da pasta -> ícone (os quatro primeiros são os da parte 1, na mesma ordem)
const PISTAS: [RegExp, string][] = [
  [/pegada/i, 'pegada'],
  [/celular|telefone|mensagem|chamada|postou/i, 'celular'],
  [/câmera|camera|vídeo|video|gravaç|corredor/i, 'camera'],
  [/bolo|migalha|comida|prato|garfo|copo/i, 'bolo'],
  [/digital|impress|luva|fio|cabelo/i, 'digital'],
  [/wi-?fi/i, 'wifi'],
  [/porteiro|pijama/i, 'olho'],
  [/pizza/i, 'pizza'],
  [/grupo|reclamad/i, 'chat'],
  [/suco/i, 'copo'],
  [/elevador|painel/i, 'elevador'],
  [/churrasco/i, 'fogo'],
  [/carvão/i, 'saco'],
  [/assobi/i, 'nota'],
  [/mochila/i, 'mochila'],
  [/tênis|terra/i, 'pegada'],
  [/bilhete|letra/i, 'bilhete'],
  [/planta/i, 'folha'],
  [/caderno/i, 'caderno'],
  [/girassol|semente/i, 'girassol'],
  [/multou|multa/i, 'multa'],
  [/uivo/i, 'lua'],
  [/petisco/i, 'osso'],
  [/pelos/i, 'pata'],
  [/garoto|ouviu/i, 'chat'],
];
export const iconePista = (texto: string) => PISTAS.find(([re]) => re.test(texto))?.[1] ?? 'lupa';
