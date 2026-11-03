// Cenários do BOMBANANA! (arte própria no clima do jogo: van azul com cortina vermelha e luminária laranja, cabine de
// avião, laboratório com placa de radiação), com a mesa de feltro verde no meio, onde fica a bomba.
import React from 'react';

export type Lugar = 'van' | 'aviao' | 'laboratorio';

const Banana: React.FC<{x: number; y: number; cor: string; s?: number}> = ({x, y, cor, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-30 + i * 10} -10 Q ${-10 + i * 10} 40 ${40 + i * 6} 20 Q ${0 + i * 10} 26 ${-24 + i * 10} -14 Z`} fill={cor} stroke="#0004" strokeWidth={3} />)}
    <rect x={-34} y={-22} width={12} height={16} rx={3} fill="#5d4037" />
  </g>
);

export const CORES_BANANA = ['vermelho', 'azul', 'amarelo', 'verde', 'branco', 'preto', 'roxo', 'laranja'];
const HEX: Record<string, string> = {vermelho: '#e53935', azul: '#1e88e5', amarelo: '#fdd835', verde: '#43a047', branco: '#f2f2f2', preto: '#262626', roxo: '#8e24aa', laranja: '#fb8c00'};

export const Sala: React.FC<{lugar: Lugar; frame: number; apagao?: boolean; alarme?: boolean}> = ({lugar, frame, apagao, alarme}) => {
  const balanco = lugar === 'aviao' ? Math.sin(frame / 25) * 4 : lugar === 'van' ? Math.sin(frame / 7) * 1.5 : 0;
  const parede = lugar === 'van' ? '#1f3f8a' : lugar === 'aviao' ? '#d9dde6' : '#2d4a3e';
  const parede2 = lugar === 'van' ? '#183170' : lugar === 'aviao' ? '#b9bfcc' : '#233b31';
  return (
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%'}}>
      <g transform={`rotate(${balanco * 0.3} 960 540) translate(0 ${balanco})`}>
        <rect width={1920} height={1080} fill={parede} />
        {/* teto curvo */}
        <path d="M 0 0 L 1920 0 L 1920 140 Q 960 230 0 140 Z" fill={parede2} />
        {lugar === 'van' ? (
          <g>
            {/* janelas com a rua passando */}
            {[220, 1500].map((x, i) => (
              <g key={i}>
                <rect x={x} y={250} width={260} height={170} rx={30} fill="#9fd3f5" stroke="#0e2150" strokeWidth={14} />
                {[0, 1, 2].map((k) => <rect key={k} x={x + ((frame * 6 + k * 120) % 300) - 30} y={330} width={40} height={90} fill="#5f8f5a" opacity={0.7} />)}
              </g>
            ))}
            {/* cortinas vermelhas */}
            <path d="M 160 230 Q 200 330 170 460 L 230 460 Q 210 330 240 230 Z" fill="#c62828" />
            <path d="M 1740 230 Q 1780 330 1750 460 L 1810 460 Q 1790 330 1820 230 Z" fill="#c62828" />
            {/* luminária laranja */}
            <line x1={960} y1={120} x2={960} y2={200} stroke="#333" strokeWidth={6} />
            <path d="M 890 200 Q 960 150 1030 200 Z" fill="#ff8f00" /><ellipse cx={960} cy={205} rx={70} ry={14} fill="#ffcc80" />
            <ellipse cx={960} cy={420} rx={420} ry={200} fill="#ffcc80" opacity={0.08} />
            {/* placa e rádio */}
            <rect x={620} y={250} width={200} height={90} rx={10} fill="#ffca28" transform="rotate(-4 720 295)" /><text x={720} y={308} textAnchor="middle" fontFamily="Bangers" fontSize={44} fill="#c62828" transform="rotate(-4 720 295)">NO DANGER</text>
            <rect x={1180} y={270} width={150} height={80} rx={12} fill="#4fc3f7" stroke="#01579b" strokeWidth={5} /><circle cx={1215} cy={310} r={22} fill="#263238" /><circle cx={1295} cy={310} r={22} fill="#263238" />
          </g>
        ) : lugar === 'aviao' ? (
          <g>
            {[180, 560, 1300, 1680].map((x, i) => (
              <g key={i}>
                <rect x={x - 70} y={240} width={140} height={190} rx={70} fill="#7ec8f0" stroke="#8a93a5" strokeWidth={14} />
                <ellipse cx={x + ((frame * 4 + i * 60) % 160) - 80} cy={330} rx={40} ry={16} fill="#fff" opacity={0.85} />
              </g>
            ))}
            <rect x={0} y={150} width={1920} height={60} fill="#aab2c2" />
            {[300, 900, 1500].map((x) => <rect key={x} x={x} y={160} width={160} height={40} rx={8} fill="#8a93a5" />)}
            <text x={960} y={190} textAnchor="middle" fontFamily="Bangers" fontSize={36} fill="#c62828">APERTE OS CINTOS</text>
          </g>
        ) : (
          <g>
            <polygon points="960,230 1060,400 860,400" fill="#ffd600" stroke="#222" strokeWidth={10} />
            <circle cx={960} cy={345} r={18} fill="#222" />{[0, 120, 240].map((a) => <path key={a} d="M 960 345 L 940 310 A 40 40 0 0 1 980 310 Z" fill="#222" transform={`rotate(${a} 960 345)`} />)}
            {[300, 1500].map((x) => (
              <g key={x}>
                <rect x={x} y={240} width={180} height={220} rx={12} fill="#455a64" stroke="#263238" strokeWidth={8} />
                {[0, 1, 2].map((k) => <rect key={k} x={x + 20} y={262 + k * 64} width={140} height={44} rx={6} fill={k === Math.floor(frame / 20) % 3 ? '#00e676' : '#1b5e20'} />)}
              </g>
            ))}
            {[700, 1200].map((x, i) => <g key={x}><rect x={x} y={300} width={30} height={100} rx={10} fill="#80deea" opacity={0.8} /><rect x={x} y={300 + (frame / 3 + i * 30) % 80} width={30} height={20} fill="#00bcd4" /></g>)}
          </g>
        )}
        {/* cacho de banana de cada cor na parede (o Mudo aponta para eles) */}
        <g>
          <rect x={1500} y={500} width={400} height={18} rx={6} fill="#6d4c41" />
          {CORES_BANANA.map((c, i) => <Banana key={c} x={1530 + (i % 4) * 95} y={i < 4 ? 470 : 560} cor={HEX[c]} s={0.75} />)}
        </g>
        {/* chão e mesa de feltro verde */}
        <rect x={0} y={760} width={1920} height={320} fill={lugar === 'aviao' ? '#5b6475' : '#3e2c22'} />
        <ellipse cx={960} cy={870} rx={620} ry={150} fill="#8d5a33" />
        <ellipse cx={960} cy={850} rx={580} ry={130} fill="#2e7d32" />
        <ellipse cx={960} cy={850} rx={580} ry={130} fill="none" stroke="#5d3a1f" strokeWidth={16} />
      </g>
      {apagao ? <rect width={1920} height={1080} fill="#000" opacity={0.86} /> : null}
      {alarme ? <rect width={1920} height={1080} fill="#ff1744" opacity={0.18 + 0.18 * Math.abs(Math.sin(frame / 4))} /> : null}
    </svg>
  );
};
