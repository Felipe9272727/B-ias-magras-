// Ícones dos papéis (os do Wolvesville, desenhados do zero): círculo colorido com borda grossa e o símbolo no meio.
import React from 'react';

export type Papel = 'lobisomem' | 'lobo_vidente' | 'vidente' | 'medico' | 'carcereiro' | 'pistoleiro' | 'bobo' | 'aldeao' | 'padre' | 'xerife' | 'vidente_espiritual';

export const PAPEIS: Record<Papel, {nome: string; cor: string; time: 'lobos' | 'vila' | 'solo'; desc: string}> = {
  lobisomem: {nome: 'Lobisomem', cor: '#e53935', time: 'lobos', desc: 'Toda noite escolhe alguém para devorar'},
  lobo_vidente: {nome: 'Lobo Vidente', cor: '#c62828', time: 'lobos', desc: 'Lobo que vê o papel de alguém por noite'},
  vidente: {nome: 'Vidente', cor: '#8e44ad', time: 'vila', desc: 'Descobre o papel exato de alguém por noite'},
  medico: {nome: 'Médico', cor: '#27ae60', time: 'vila', desc: 'Protege um jogador dos lobos por noite'},
  carcereiro: {nome: 'Carcereiro', cor: '#546e7a', time: 'vila', desc: 'Prende alguém à noite e pode executar uma vez'},
  pistoleiro: {nome: 'Pistoleiro', cor: '#a0522d', time: 'vila', desc: 'Duas balas para atirar de dia'},
  bobo: {nome: 'Bobo', cor: '#ff3d7f', time: 'solo', desc: 'Vence sozinho se a vila linchar ele'},
  aldeao: {nome: 'Aldeão', cor: '#43a047', time: 'vila', desc: 'Sem poder: só o voto e a lábia'},
  padre: {nome:'Padre',cor:'#e0a52d',time:'vila',desc:'Água benta: mata um lobo; se errar, morre'},
  xerife: {nome:'Xerife',cor:'#b57a34',time:'vila',desc:'Vigia à noite e recebe dois suspeitos se o alvo morrer'},
  vidente_espiritual: {nome:'Vidente Espiritual',cor:'#5c6bc0',time:'vila',desc:'Verifica se alguém entre até dois alvos matou à noite'},
};

const Lobo: React.FC<{olho?: string}> = ({olho = '#ffd54f'}) => (
  <g>
    <path d="M24 30 L34 58 L28 70 L50 82 L72 70 L66 58 L76 30 L60 44 L40 44Z" fill="#455a64" />
    <path d="M28 32 L36 48 L42 44Z M72 32 L64 48 L58 44Z" fill="#263238" />
    <path d="M40 62 L50 80 L60 62 Q50 58 40 62Z" fill="#cfd8dc" />
    <path d="M46 70 L50 76 L54 70Z" fill="#212121" />
    <path d="M36 54 L46 56 L40 58Z M64 54 L54 56 L60 58Z" fill={olho} />
  </g>
);

const Simbolo: React.FC<{p: Papel}> = ({p}) => {
  switch (p) {
    case 'lobisomem':
      return <Lobo />;
    case 'lobo_vidente':
      return <g><Lobo olho="#ce93d8" /><circle cx={50} cy={26} r={9} fill="#fff" /><circle cx={50} cy={26} r={4.5} fill="#6a1b9a" /></g>;
    case 'vidente':
      return (
        <g>
          <path d="M18 50 Q50 18 82 50 Q50 82 18 50Z" fill="#fff" />
          <circle cx={50} cy={50} r={14} fill="#6a1b9a" />
          <circle cx={50} cy={50} r={6} fill="#1a0a24" />
          <circle cx={55} cy={45} r={3} fill="#fff" />
        </g>
      );
    case 'medico':
      return (
        <g>
          <rect x={22} y={30} width={56} height={44} rx={8} fill="#fff" />
          <rect x={40} y={22} width={20} height={10} rx={3} fill="none" stroke="#fff" strokeWidth={5} />
          <rect x={45} y={38} width={10} height={28} fill="#e53935" />
          <rect x={36} y={47} width={28} height={10} fill="#e53935" />
        </g>
      );
    case 'carcereiro':
      return (
        <g>
          {[30, 43, 56, 69].map((x) => <rect key={x} x={x} y={20} width={6} height={60} rx={3} fill="#cfd8dc" />)}
          <rect x={22} y={26} width={56} height={6} rx={3} fill="#90a4ae" />
          <rect x={22} y={68} width={56} height={6} rx={3} fill="#90a4ae" />
          <circle cx={66} cy={56} r={9} fill="none" stroke="#ffca28" strokeWidth={5} />
          <path d="M60 62 L42 80 M48 74 L52 78 M44 78 L47 81" stroke="#ffca28" strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    case 'pistoleiro':
      return (
        <g>
          <path d="M20 40 L76 40 L80 36 L84 40 L84 50 L50 50 L48 56 L40 56 L42 50 L36 50 L30 76 L18 76 L24 50 L20 50Z" fill="#eceff1" />
          <rect x={46} y={42} width={16} height={6} fill="#90a4ae" />
          <path d="M40 56 Q44 64 52 56" stroke="#eceff1" strokeWidth={3} fill="none" />
        </g>
      );
    case 'bobo':
      return (
        <g>
          <path d="M22 70 L28 34 L44 54 L50 24 L56 54 L72 34 L78 70Z" fill="#ffeb3b" />
          <path d="M22 70 L28 34 L44 54Z M56 54 L72 34 L78 70Z" fill="#7e57c2" />
          <rect x={20} y={66} width={60} height={12} rx={5} fill="#fff" />
          {[[28, 32], [50, 22], [72, 32]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={6} fill="#fff" />)}
        </g>
      );
    case 'aldeao':
      return (
        <g>
          <rect x={47} y={36} width={6} height={46} rx={3} fill="#a1887f" />
          <path d="M30 22 L30 38 Q30 44 50 44 Q70 44 70 38 L70 22" stroke="#eceff1" strokeWidth={6} fill="none" strokeLinecap="round" />
          <line x1={50} y1={22} x2={50} y2={44} stroke="#eceff1" strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case 'padre':
      return <g><path d="M39 24H61V41L70 56V78H30V56L39 41Z" fill="#e3f2fd" stroke="#fff" strokeWidth={3}/><path d="M34 60H66V76H34Z" fill="#64b5f6"/><path d="M50 30V54M42 39H58" stroke="#e0a52d" strokeWidth={5}/><rect x={37} y={19} width={26} height={9} rx={3} fill="#795548"/></g>;
    case 'xerife':
      return <g><path d="M50 18L59 37L80 37L68 54L74 76L50 65L26 76L32 54L20 37L41 37Z" fill="#ffd54f" stroke="#fff" strokeWidth={3}/><circle cx={50} cy={48} r={12} fill="#795548"/><circle cx={50} cy={48} r={6} fill="#fff3e0"/></g>;
    case 'vidente_espiritual':
      return <g><path d="M26 73V48Q26 24 50 24Q74 24 74 48V73L63 66L50 77L37 66Z" fill="#e8eaf6"/><path d="M33 49Q50 32 67 49Q50 65 33 49Z" fill="#7986cb"/><circle cx={50} cy={49} r={7} fill="#283593"/><circle cx={53} cy={46} r={2} fill="#fff"/></g>;
  }
};

export const IconePapel: React.FC<{papel: Papel; tamanho?: number; style?: React.CSSProperties}> = ({papel, tamanho = 80, style}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={style}>
    <circle cx={50} cy={50} r={46} fill={PAPEIS[papel].cor} stroke="#fff" strokeWidth={6} />
    <circle cx={50} cy={50} r={40} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={3} />
    <Simbolo p={papel} />
  </svg>
);

// Ícones pequenos da interface (sem emoji): lua, sol, caveira, balão, urna, alvo, cadeado, relógio
export const IconeUi: React.FC<{nome: 'lua' | 'sol' | 'caveira' | 'balao' | 'urna' | 'alvo' | 'cadeado' | 'relogio' | 'pata'; tamanho?: number; cor?: string}> = ({nome, tamanho = 40, cor = '#fff'}) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 40 40">
    {nome === 'lua' ? <path d="M26 4 A16 16 0 1 0 36 28 A13 13 0 1 1 26 4Z" fill={cor} /> : null}
    {nome === 'sol' ? <g fill={cor}><circle cx={20} cy={20} r={8} />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x={18.5} y={2} width={3} height={7} rx={1.5} transform={`rotate(${a} 20 20)`} />)}</g> : null}
    {nome === 'caveira' ? <g><path d="M8 18 Q8 4 20 4 Q32 4 32 18 Q32 24 28 26 L28 32 L12 32 L12 26 Q8 24 8 18Z" fill={cor} /><circle cx={15} cy={18} r={4} fill="#222" /><circle cx={25} cy={18} r={4} fill="#222" /><path d="M18 25 L20 22 L22 25Z" fill="#222" /></g> : null}
    {nome === 'balao' ? <path d="M6 8 Q6 4 10 4 L30 4 Q34 4 34 8 L34 24 Q34 28 30 28 L16 28 L8 35 L10 28 Q6 28 6 24Z" fill={cor} /> : null}
    {nome === 'urna' ? <g fill={cor}><rect x={6} y={18} width={28} height={18} rx={3} /><rect x={14} y={4} width={12} height={16} rx={2} transform="rotate(10 20 12)" /><rect x={10} y={20} width={20} height={3} fill="#222" /></g> : null}
    {nome === 'alvo' ? <g fill="none" stroke={cor} strokeWidth={3}><circle cx={20} cy={20} r={14} /><circle cx={20} cy={20} r={7} /><line x1={20} y1={0} x2={20} y2={10} /><line x1={20} y1={30} x2={20} y2={40} /><line x1={0} y1={20} x2={10} y2={20} /><line x1={30} y1={20} x2={40} y2={20} /></g> : null}
    {nome === 'cadeado' ? <g><path d="M12 18 L12 12 Q12 4 20 4 Q28 4 28 12 L28 18" fill="none" stroke={cor} strokeWidth={4} /><rect x={8} y={17} width={24} height={19} rx={4} fill={cor} /><circle cx={20} cy={26} r={3} fill="#222" /></g> : null}
    {nome === 'relogio' ? <g><circle cx={20} cy={20} r={16} fill="none" stroke={cor} strokeWidth={4} /><path d="M20 10 L20 20 L27 24" stroke={cor} strokeWidth={4} fill="none" strokeLinecap="round" /></g> : null}
    {nome === 'pata' ? <g fill={cor}><ellipse cx={20} cy={27} rx={9} ry={8} /><circle cx={9} cy={16} r={4} /><circle cx={16} cy={9} r={4} /><circle cx={24} cy={9} r={4} /><circle cx={31} cy={16} r={4} /></g> : null}
  </svg>
);

