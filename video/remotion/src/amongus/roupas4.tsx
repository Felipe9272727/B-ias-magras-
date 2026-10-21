// Roupas e pets do Crewmate4 (AU4). Desenho próprio em SVG, nada copiado do jogo.
// ROUPA: desenhada no espaço do corpo (viewBox 0..100 x 0..120) e RECORTADA na silhueta do corpo. Toda roupa parte
// da mesma "peça" (VESTE): a gola sobe nas costas e passa por baixo do visor, como um tecido nos ombros, em vez de uma
// borda reta. Depois da roupa, o Crewmate4 aplica de novo a sombra e o brilho do corpo (para ela parecer vestida, não
// colada) e pinta a mochila com a cor `mochila` da roupa. O lado do visor (direita) é a FRENTE do tripulante.
// PET: desenhado num quadro próprio de 40x40 (chão em y=40); o Crewmate4 põe o pet ao lado dos pés.
import React from 'react';

export type CoresRoupa = {body: string; shade: string};

// a peça básica: gola curva nos ombros (y≈38 nas costas, y≈47 na frente, escondida pelo visor) até embaixo
export const VESTE = 'M8 45 Q22 34 40 45 L94 45 L94 124 L8 124 Z';
const GOLA = 'M8 45 Q22 34 40 45 L94 45';
const L = {stroke: '#000', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

const Gola: React.FC<{cor?: string}> = ({cor = '#000'}) => <path d={GOLA} fill="none" stroke={cor} strokeWidth={3.2} strokeLinecap="round" />;

export const ROUPAS: Record<string, {nome: string; mochila: string; desenho: (c: CoresRoupa) => React.ReactNode}> = {
  jaleco: {nome: 'Jaleco de cientista', mochila: '#e9edf2', desenho: () => (
    <g>
      <path d={VESTE} fill="#f4f6f9" />
      {/* camisa azul aparecendo na abertura da frente */}
      <path d="M58 45 L72 45 L67 124 L61 124 Z" fill="#9cc8ea" />
      <path d="M59 45 L64 72 L56 60 Z M71 45 L66 72 L74 60 Z" fill="#dfe5ec" {...L} strokeWidth={2.4} />
      <path d="M61 124 L64 72 M67 124 L66 72" {...L} strokeWidth={2.4} fill="none" />
      {/* bolso com caneta */}
      <rect x="70" y="80" width="10" height="11" rx="1.5" fill="#e3e8ee" {...L} strokeWidth={2.2} />
      <rect x="73" y="73" width="3" height="10" rx="1.5" fill="#2f6fe0" stroke="#000" strokeWidth={1.4} />
      <path d="M36 98 L36 124" stroke="#c9d1db" strokeWidth={3} />
      <Gola />
    </g>
  )},
  terno: {nome: 'Terno e gravata', mochila: '#2b3040', desenho: () => (
    <g>
      <path d={VESTE} fill="#2b3040" />
      <path d="M57 45 L73 45 L65 76 Z" fill="#f4f4f4" {...L} strokeWidth={2.2} />
      <path d="M63 47 L67 47 L68 52 L66 74 L64 74 L62 52 Z" fill="#d12b2b" {...L} strokeWidth={1.8} />
      <path d="M56 45 L63 78 L52 64 Z M74 45 L67 78 L78 64 Z" fill="#3b4256" {...L} strokeWidth={2.2} />
      <circle cx="66" cy="88" r="2.2" fill="#9aa3b5" stroke="#000" strokeWidth={1.2} />
      <circle cx="66" cy="98" r="2.2" fill="#9aa3b5" stroke="#000" strokeWidth={1.2} />
      <path d="M72 84 L80 84" stroke="#fff" strokeWidth={2.4} />
      <Gola />
    </g>
  )},
  macacao: {nome: 'Macacão de mecânico', mochila: '#3a6dbd', desenho: () => (
    <g>
      {/* alças sobre o corpo (a camiseta é a cor do jogador) e o peitilho do macacão */}
      <path d="M8 74 L94 74 L94 124 L8 124 Z" fill="#3a6dbd" />
      <path d="M50 58 L80 58 L80 76 L50 76 Z" fill="#3a6dbd" {...L} strokeWidth={2.4} />
      <path d="M53 45 L53 60 M76 45 L76 60" stroke="#2a508e" strokeWidth={6} strokeLinecap="round" />
      <path d="M53 45 L53 60 M76 45 L76 60" stroke="#000" strokeWidth={1.4} opacity={0.6} />
      <circle cx="53" cy="61" r="2.6" fill="#f2c94c" stroke="#000" strokeWidth={1.3} />
      <circle cx="76" cy="61" r="2.6" fill="#f2c94c" stroke="#000" strokeWidth={1.3} />
      <rect x="58" y="63" width="14" height="9" rx="1.5" fill="#2f5ea8" {...L} strokeWidth={1.8} />
      <path d="M8 74 L94 74" {...L} fill="none" />
      <ellipse cx="38" cy="96" rx="6" ry="3.5" fill="#1d2b44" opacity={0.7} />
      <path d="M58 100 L58 124" stroke="#2a508e" strokeWidth={2.2} />
    </g>
  )},
  havaiana: {nome: 'Camisa havaiana', mochila: '#22a9bd', desenho: () => (
    <g>
      <path d={VESTE} fill="#22a9bd" />
      {[[30, 60], [46, 86], [72, 92], [32, 104], [58, 112], [80, 70], [24, 84]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x - 9} ${y + 4} q5 -9 12 -4`} fill="#1f8a4c" stroke="#000" strokeWidth={1.2} />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 4 * Math.cos((a * Math.PI) / 180)} cy={y + 4 * Math.sin((a * Math.PI) / 180)} r={3.2} fill={i % 2 ? '#ffd23f' : '#ff5c8a'} stroke="#000" strokeWidth={1} />)}
          <circle cx={x} cy={y} r={1.8} fill="#fff4c2" />
        </g>
      ))}
      <path d="M58 45 L66 62 L74 45" fill="#1a8797" {...L} strokeWidth={2.2} />
      <circle cx="66" cy="74" r="1.8" fill="#fff" stroke="#000" strokeWidth={1} />
      <circle cx="66" cy="90" r="1.8" fill="#fff" stroke="#000" strokeWidth={1} />
      <Gola />
    </g>
  )},
  capa: {nome: 'Capa de herói', mochila: '#d32626', desenho: () => (
    <g>
      {/* a capa cai pelas costas: faixa vermelha atrás e a gola alta presa com um broche dourado na frente */}
      <path d="M8 40 Q16 70 18 124 L36 124 Q30 80 32 44 Z" fill="#d32626" {...L} strokeWidth={2.6} />
      <path d="M8 45 Q22 34 40 45 L94 45 L94 53 L40 53 Q22 42 8 53 Z" fill="#d32626" {...L} strokeWidth={2.6} />
      <circle cx="74" cy="56" r="4.5" fill="#f5c542" stroke="#000" strokeWidth={2} />
      <path d="M58 70 l4 8 l8 1 l-6 5 l2 8 l-8 -4 l-7 4 l2 -8 l-6 -5 l8 -1 z" fill="#f5c542" stroke="#000" strokeWidth={1.8} />
    </g>
  )},
  avental: {nome: 'Avental de cozinheiro', mochila: '', desenho: () => (
    <g>
      {/* só na frente: peitilho, saia e a fita amarrada nas costas */}
      <path d="M54 52 L78 52 L80 74 L94 124 L48 124 L52 74 Z" fill="#f7f7f4" {...L} strokeWidth={2.4} />
      <path d="M56 52 L52 45 M76 52 L80 45" stroke="#f7f7f4" strokeWidth={4} />
      <path d="M8 76 L52 74" stroke="#f7f7f4" strokeWidth={5} />
      <path d="M8 76 L52 74" stroke="#000" strokeWidth={1.4} opacity={0.5} />
      <path d="M26 76 l-6 7 M26 76 l5 8" stroke="#f7f7f4" strokeWidth={4} strokeLinecap="round" />
      <rect x="60" y="88" width="16" height="11" rx="2" fill="#e6e6df" {...L} strokeWidth={1.8} />
      <circle cx="65" cy="62" r="2.4" fill="#e53935" />
    </g>
  )},
  moletom: {nome: 'Moletom com capuz', mochila: '#5d6573', desenho: () => (
    <g>
      <path d={VESTE} fill="#6b7383" />
      {/* capuz enrolado nas costas, atrás da cabeça */}
      <path d="M6 54 Q8 32 30 36 Q44 40 42 52 Q24 44 6 54 Z" fill="#5a6170" {...L} strokeWidth={2.6} />
      <path d="M60 47 L58 66 M70 47 L72 66" stroke="#f1f1f1" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M50 86 L82 86 L86 104 L46 104 Z" fill="#5f6777" {...L} strokeWidth={2.4} />
      <path d="M8 116 L94 116" stroke="#4d5462" strokeWidth={6} />
      <Gola />
    </g>
  )},
  colete: {nome: 'Colete salva-vidas', mochila: '', desenho: () => (
    <g>
      {/* colete laranja aberto na frente (aparece a cor do jogador) com faixas refletivas */}
      <path d="M8 45 Q22 34 40 45 L58 45 L58 104 L8 104 Z" fill="#ff7a1a" {...L} strokeWidth={2.6} />
      <path d="M72 45 L94 45 L94 104 L72 104 Z" fill="#ff7a1a" {...L} strokeWidth={2.6} />
      <path d="M8 66 L58 66 M72 66 L94 66 M8 86 L58 86 M72 86 L94 86" stroke="#e7ebf0" strokeWidth={6} />
      <path d="M8 66 L58 66 M72 66 L94 66 M8 86 L58 86 M72 86 L94 86" stroke="#000" strokeWidth={1} opacity={0.4} />
      <path d="M58 76 L72 76" stroke="#222" strokeWidth={3} />
      <rect x="62" y="73" width="6" height="6" rx="1" fill="#bbb" stroke="#000" strokeWidth={1.2} />
    </g>
  )},
  smoking: {nome: 'Smoking com gravata-borboleta', mochila: '#16181d', desenho: () => (
    <g>
      <path d={VESTE} fill="#16181d" />
      <path d="M56 45 L74 45 L65 84 Z" fill="#fbfbfb" {...L} strokeWidth={2.2} />
      <path d="M55 45 L64 86 L50 66 Z M75 45 L66 86 L80 66 Z" fill="#2a2d35" {...L} strokeWidth={2.2} />
      <path d="M58 50 L65 54 L58 58 Z M72 50 L65 54 L72 58 Z" fill="#111" stroke="#000" strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx="65" cy="54" r="2" fill="#111" />
      <circle cx="65" cy="66" r="1.5" fill="#222" />
      <circle cx="65" cy="74" r="1.5" fill="#222" />
      <Gola />
    </g>
  )},
  pijama: {nome: 'Pijama listrado', mochila: '#bcd6f2', desenho: () => (
    <g>
      <path d={VESTE} fill="#bcd6f2" />
      {[14, 26, 38, 50, 62, 74, 86].map((x) => <rect key={x} x={x} y="40" width="5" height="90" fill="#6f98d1" />)}
      <path d="M58 45 L66 58 L74 45" fill="#ffffff" {...L} strokeWidth={2} />
      {[70, 84, 98].map((y) => <circle key={y} cx="66" cy={y} r="2" fill="#fff" stroke="#000" strokeWidth={1.1} />)}
      <Gola />
    </g>
  )},
}

export const PETS: Record<string, {nome: string; desenho: (t: number) => React.ReactNode}> = {
  mini_tripulante: {
    nome: 'Mini tripulante',
    desenho: (t) => {
      const sobe = -1.5 * Math.abs(Math.sin((t * Math.PI) / 30));
      const piscando = t % 110 > 104;
      return (
        <g strokeLinejoin="round">
          {/* pernas (ficam paradas no chão) */}
          <rect x="14" y="33" width="5" height="7" rx="2" fill="#1f7a8c" stroke="#000" strokeWidth={1.6} />
          <rect x="22" y="33" width="5" height="7" rx="2" fill="#1f7a8c" stroke="#000" strokeWidth={1.6} />
          <g transform={`translate(0 ${sobe})`}>
            {/* corpo em forma de feijão, verde-azulado */}
            <path
              d="M10 22 C10 10 14 4 20 4 C26 4 30 10 30 22 L30 33 Q30 36 27 36 L13 36 Q10 36 10 33 Z"
              fill="#2ec4b6"
              stroke="#000"
              strokeWidth={2}
            />
            {/* visor */}
            <rect x="16" y="10" width="11" height="8" rx="3.5" fill="#a7d7e6" stroke="#000" strokeWidth={1.6} />
            {piscando ? (
              <path d="M19 14 L21 14 M23 14 L25 14" fill="none" stroke="#000" strokeWidth={1.2} />
            ) : (
              <circle cx="21" cy="14" r="1" fill="#ffffff" />
            )}
          </g>
        </g>
      );
    },
  },
  cachorro: {
    nome: 'Cachorrinho',
    desenho: (t) => {
      const rabo = 16 * Math.sin((t * Math.PI * 2) / 24);
      const piscando = t % 120 < 6;
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          {/* rabo que balança */}
          <path d="M8 26 Q2 20 4 12" fill="none" stroke="#000" strokeWidth={5} transform={`rotate(${rabo} 8 26)`} />
          <path d="M8 26 Q2 20 4 12" fill="none" stroke="#e0b07a" strokeWidth={2.2} transform={`rotate(${rabo} 8 26)`} />
          {/* patas */}
          <rect x="10" y="31" width="5" height="9" rx="2" fill="#b07a45" stroke="#000" strokeWidth={1.6} />
          <rect x="20" y="31" width="5" height="9" rx="2" fill="#b07a45" stroke="#000" strokeWidth={1.6} />
          {/* corpo e cabeça (mais alto e maior para ler em tamanho pequeno) */}
          <ellipse cx="18" cy="25" rx="11.5" ry="8" fill="#c9a06b" stroke="#000" strokeWidth={1.8} />
          {/* mancha escura nas costas */}
          <ellipse cx="14" cy="22" rx="4" ry="2.5" fill="#8a5a2b" opacity={0.7} />
          <circle cx="28" cy="18" r="7" fill="#c9a06b" stroke="#000" strokeWidth={1.8} />
          {/* orelha caída */}
          <ellipse cx="24" cy="20" rx="2.8" ry="5" fill="#7a4a22" stroke="#000" strokeWidth={1.4} transform="rotate(15 24 20)" />
          {/* focinho, nariz e língua */}
          <ellipse cx="33" cy="21" rx="4" ry="3" fill="#f0d5b0" stroke="#000" strokeWidth={1.2} />
          <circle cx="35.5" cy="19.8" r="1.4" fill="#000" />
          <ellipse cx="33" cy="25" rx="1.5" ry="2" fill="#ff7096" stroke="#000" strokeWidth={0.8} />
          {/* olho (pisca de vez em quando) */}
          {piscando ? (
            <path d="M27 16 L29.5 16" fill="none" stroke="#000" strokeWidth={1.2} />
          ) : (
            <circle cx="29.5" cy="15.5" r="1.4" fill="#000" />
          )}
        </g>
      );
    },
  },
  gato: {
    nome: 'Gatinho',
    desenho: (t) => {
      const rabo = 8 * Math.sin((t * Math.PI * 2) / 60);
      const piscando = t % 100 > 94;
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          {/* rabo que balança, saindo de trás do corpo */}
          <path d="M26 38 Q38 38 36 26 Q35 20 32 22" fill="none" stroke="#000" strokeWidth={5} transform={`rotate(${rabo} 26 38)`} />
          <path d="M26 38 Q38 38 36 26 Q35 20 32 22" fill="none" stroke="#9aa3b2" strokeWidth={2.2} transform={`rotate(${rabo} 26 38)`} />
          {/* corpo sentado */}
          <path d="M9 40 Q6 26 16 22 Q28 20 29 40 Z" fill="#9aa3b2" stroke="#000" strokeWidth={1.8} />
          <path d="M12 28 Q14 30 12 33 M24 27 Q22 30 24 33" fill="none" stroke="#5e6676" strokeWidth={1.4} />
          {/* patas da frente */}
          <ellipse cx="15" cy="39" rx="3.5" ry="2" fill="#c9ced8" stroke="#000" strokeWidth={1.4} />
          <ellipse cx="23" cy="39" rx="3.5" ry="2" fill="#c9ced8" stroke="#000" strokeWidth={1.4} />
          {/* cabeça com orelhas */}
          <path d="M13 15 L14 2 L21 8.5 Q24 8 27 8.5 L34 2 L35 15 Q35 23 24 23 Q13 23 13 15 Z" fill="#9aa3b2" stroke="#000" strokeWidth={1.8} />
          {/* orelhas internas */}
          <path d="M15.5 12 L15.8 6 L19.5 9.5 Z M32.5 12 L32.2 6 L28.5 9.5 Z" fill="#ff8fa3" opacity={0.8} />
          {piscando ? (
            <path d="M18.5 15 L21.5 15 M26.5 15 L29.5 15" fill="none" stroke="#000" strokeWidth={1.2} />
          ) : (
            <>
              <circle cx="20" cy="15" r="1.3" fill="#000" />
              <circle cx="28" cy="15" r="1.3" fill="#000" />
            </>
          )}
          <path d="M22.5 18 L25.5 18 L24 19.8 Z" fill="#ff8fa3" stroke="#000" strokeWidth={0.8} />
          <path d="M19 18.5 L13 17.5 M19 20 L13 21 M29 18.5 L35 17.5 M29 20 L35 21" fill="none" stroke="#000" strokeWidth={0.9} />
        </g>
      );
    },
  },
  robo: {
    nome: 'Robozinho',
    desenho: (t) => {
      // flutua de leve (propulsor embaixo); a sombra no chão encolhe quando ele sobe
      const alt = 1.5 + 1.5 * Math.sin((t * Math.PI * 2) / 48);
      const fogo = 1 + 0.3 * Math.sin(t * 0.9);
      const piscando = t % 80 > 76;
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          <ellipse cx="20" cy="39.5" rx={7.5 - alt} ry={1.2} fill="#000" opacity={0.25} />
          <g transform={`translate(0 ${-alt})`}>
            {/* propulsor */}
            <path d={`M15 33 L20 33 L17.5 ${36 + 3 * fogo} Z`} fill="#ffb300" stroke="#000" strokeWidth={1} />
            {/* antena */}
            <path d="M20 6 L20 2" fill="none" stroke="#000" strokeWidth={2.2} />
            <path d="M20 6 L20 2" fill="none" stroke="#b0bec5" strokeWidth={1} />
            <circle cx="20" cy="1.5" r="1.8" fill="#ff3131" stroke="#000" strokeWidth={1.2} />
            {/* braços */}
            <path d="M12 24 L7 28 M28 24 L33 28" fill="none" stroke="#000" strokeWidth={3.5} />
            <path d="M12 24 L7 28 M28 24 L33 28" fill="none" stroke="#78909c" strokeWidth={1.6} />
            {/* cabeça com tela */}
            <rect x="10" y="6" width="20" height="14" rx="3" fill="#cfd8dc" stroke="#000" strokeWidth={1.8} />
            <rect x="13" y="9" width="14" height="7" rx="1.5" fill="#1e88e5" stroke="#000" strokeWidth={1.2} />
            {piscando ? (
              <path d="M15.5 12.5 L18 12.5 M22 12.5 L24.5 12.5" fill="none" stroke="#e3f2fd" strokeWidth={1.4} />
            ) : (
              <>
                <rect x="15.5" y="11" width="2.5" height="3" fill="#e3f2fd" />
                <rect x="21.5" y="11" width="2.5" height="3" fill="#e3f2fd" />
              </>
            )}
            {/* corpo com botão */}
            <rect x="12" y="21" width="16" height="12" rx="3" fill="#90a4ae" stroke="#000" strokeWidth={1.8} />
            <circle cx="20" cy="26" r="1.8" fill="#ffca28" stroke="#000" strokeWidth={1} />
          </g>
        </g>
      );
    },
  },
  passarinho: {
    nome: 'Passarinho',
    desenho: (t) => {
      const bate = Math.sin((t * Math.PI * 2) / 12);
      const piscando = t % 110 < 5;
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          {/* pernas */}
          <path d="M17 33 L16 40 M22 33 L23 40 M14 40 L18 40 M21 40 L25 40" fill="none" stroke="#ff7043" strokeWidth={1.8} />
          {/* rabo */}
          <path d="M10 24 L2 18 L3 30 Z" fill="#f0a500" stroke="#000" strokeWidth={1.6} />
          {/* corpo e barriga */}
          <ellipse cx="18" cy="26" rx="10.5" ry="7.5" fill="#ffd23f" stroke="#000" strokeWidth={1.8} />
          <ellipse cx="21" cy="29" rx="6" ry="3.5" fill="#fff3b0" />
          {/* asa batendo */}
          <path d="M9 26 Q13 16 24 22 Q18 29 9 26 Z" fill="#f5b700" stroke="#000" strokeWidth={1.4} transform={`rotate(${bate * 10} 16 24)`} />
          {/* cabeça com topete */}
          <path d="M22 11 Q21 6 26 9.5" fill="#ffb300" stroke="#000" strokeWidth={1.6} />
          <circle cx="27" cy="16" r="6.5" fill="#ffd23f" stroke="#000" strokeWidth={1.8} />
          <circle cx="26" cy="18.5" r="1.2" fill="#ff8a80" opacity={0.7} />
          {/* bico */}
          <path d="M32 14.5 L38 16.5 L32 18.5 Z" fill="#ff7043" stroke="#000" strokeWidth={1.2} />
          {/* olho */}
          {piscando ? (
            <path d="M27.5 14.5 L30.5 14.5" fill="none" stroke="#000" strokeWidth={1.2} />
          ) : (
            <>
              <circle cx="29" cy="14.5" r="1.5" fill="#000" />
              <circle cx="29.5" cy="14" r="0.5" fill="#ffffff" />
            </>
          )}
        </g>
      );
    },
  },
  slime: {
    nome: 'Slime',
    desenho: (t) => {
      // quica: achata e estica em volta da base (que fica no chão)
      const p = Math.sin((t * Math.PI * 2) / 36);
      const sx = 1 + 0.06 * p;
      const sy = 1 - 0.07 * p;
      const piscando = t % 110 > 104;
      return (
        <g transform={`translate(20 40) scale(${sx} ${sy}) translate(-20 -40)`} strokeLinejoin="round">
          <path d="M5 40 C3 24 9 12 20 12 C31 12 37 24 35 40 Z" fill="#5ce07a" stroke="#000" strokeWidth={2} />
          <path d="M5 40 C5 36 10 35 20 35 C30 35 35 36 35 40 Z" fill="#3fb85a" />
          <ellipse cx="13" cy="20" rx="3.5" ry="2.2" fill="#ffffff" opacity={0.55} transform="rotate(-25 13 20)" />
          {piscando ? (
            <path d="M13 28 L17 28 M23 28 L27 28" fill="none" stroke="#000" strokeWidth={1.5} strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="15" cy="28" rx="1.8" ry="2.6" fill="#000" />
              <ellipse cx="25" cy="28" rx="1.8" ry="2.6" fill="#000" />
            </>
          )}
          <path d="M16 33 Q20 36 24 33" fill="none" stroke="#000" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx="10" cy="33" r="2" fill="#ff8fa3" opacity={0.6} />
          <circle cx="30" cy="33" r="2" fill="#ff8fa3" opacity={0.6} />
        </g>
      );
    },
  },
};
