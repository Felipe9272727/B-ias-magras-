// Roupas e pets do Crewmate4 (AU4). Desenho próprio em SVG, nada copiado do jogo.
// ROUPA: desenhada no espaço do corpo (viewBox 0..100 x 0..120), por cima do corpo e RECORTADA na silhueta do corpo
// (clipPath do CORPO); recebe as cores do jogador (body = cor principal, shade = sombra) para combinar se quiser.
// PET: desenhado num quadro próprio de 40x40 (chão em y=40); o Crewmate4 põe o pet ao lado dos pés.
import React from 'react';

export type CoresRoupa = {body: string; shade: string};

// Flor simples (estampa da camisa havaiana): 5 pétalas em círculo e miolo amarelo
const Flor: React.FC<{x: number; y: number; r: number; cor: string}> = ({x, y, r, cor}) => (
  <g stroke="#000" strokeWidth={1.2}>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return <circle key={i} cx={x + r * 0.9 * Math.cos(a)} cy={y + r * 0.9 * Math.sin(a)} r={r * 0.5} fill={cor} />;
    })}
    <circle cx={x} cy={y} r={r * 0.4} fill="#ffd54f" />
  </g>
);

export const ROUPAS: Record<string, {nome: string; desenho: (c: CoresRoupa) => React.ReactNode}> = {
  jaleco: {
    nome: 'Jaleco de cientista',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* jaleco branco cobrindo o tronco */}
        <rect x="0" y="50" width="100" height="62" fill="#f4f6fa" />
        <rect x="0" y="50" width="24" height="62" fill="#c9d1dc" />
        {/* camisa azul aparecendo na abertura da frente */}
        <path d="M50 50 L64 50 L64 112 L50 112 Z" fill="#8fc1e3" />
        {/* lapelas */}
        <path d="M50 50 L40 50 L50 74 Z" fill="#f4f6fa" stroke="#000" strokeWidth={2.5} />
        <path d="M64 50 L74 50 L64 74 Z" fill="#f4f6fa" stroke="#000" strokeWidth={2.5} />
        <path d="M50 74 L50 112 M64 74 L64 112" fill="none" stroke="#000" strokeWidth={2.5} />
        {/* caneta no bolso */}
        <rect x="69" y="71" width="3.4" height="12" rx="1.5" fill="#1f5fd6" stroke="#000" strokeWidth={1.2} />
        <rect x="69" y="71" width="3.4" height="3" rx="1" fill="#e0245e" stroke="#000" strokeWidth={1} />
        <rect x="66" y="80" width="10" height="10" rx="2" fill="#f4f6fa" stroke="#000" strokeWidth={2} />
      </g>
    ),
  },
  terno: {
    nome: 'Terno e gravata',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* paletó escuro */}
        <rect x="0" y="50" width="100" height="62" fill="#2c3340" />
        <rect x="0" y="50" width="22" height="62" fill="#1d222b" />
        {/* camisa branca em V */}
        <path d="M42 50 L60 50 L51 80 Z" fill="#ffffff" stroke="#000" strokeWidth={2} />
        {/* lapelas */}
        <path d="M30 50 L42 50 L51 80 L36 70 Z" fill="#3b4150" stroke="#000" strokeWidth={2.5} />
        <path d="M72 50 L60 50 L51 80 L66 70 Z" fill="#3b4150" stroke="#000" strokeWidth={2.5} />
        {/* gravata vermelha e nó */}
        <path d="M48 57 L54 57 L55 64 L51 92 L47 64 Z" fill="#d32f2f" stroke="#000" strokeWidth={2} />
        <rect x="48.5" y="54" width="5" height="5" rx="1" fill="#a31919" stroke="#000" strokeWidth={1.5} />
        {/* botões */}
        <circle cx="60" cy="88" r="1.8" fill="#c8ccd4" stroke="#000" strokeWidth={1} />
        <circle cx="60" cy="98" r="1.8" fill="#c8ccd4" stroke="#000" strokeWidth={1} />
      </g>
    ),
  },
  macacao: {
    nome: 'Macacão de mecânico',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* macacão azul */}
        <rect x="0" y="50" width="100" height="62" fill="#2466d1" />
        <rect x="0" y="50" width="22" height="62" fill="#1b4fa6" />
        {/* camisa por baixo, aparecendo entre as alças */}
        <rect x="40" y="50" width="22" height="14" fill="#e8ecf2" />
        {/* alças */}
        <path d="M40 66 L38 50 M62 66 L64 50" fill="none" stroke="#000" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M40 66 L38 50 M62 66 L64 50" fill="none" stroke="#2466d1" strokeWidth={2.5} strokeLinecap="round" />
        {/* peitilho */}
        <rect x="38" y="64" width="26" height="24" rx="3" fill="#1f5bc0" stroke="#000" strokeWidth={2.2} />
        {/* bolso com caneta */}
        <rect x="46" y="66" width="2.4" height="9" fill="#ffd21f" stroke="#000" strokeWidth={1} />
        <rect x="44" y="71" width="11" height="8" rx="1.5" fill="#1f5bc0" stroke="#000" strokeWidth={1.6} />
        {/* botões das alças */}
        <circle cx="41" cy="66.5" r="1.6" fill="#ffd21f" stroke="#000" strokeWidth={1} />
        <circle cx="61" cy="66.5" r="1.6" fill="#ffd21f" stroke="#000" strokeWidth={1} />
        {/* mancha de graxa */}
        <ellipse cx="70" cy="84" rx="5" ry="3.2" fill="#2b2b2b" opacity={0.85} />
        <circle cx="76" cy="90" r="1.5" fill="#2b2b2b" />
      </g>
    ),
  },
  havaiana: {
    nome: 'Camisa havaiana',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* camisa turquesa */}
        <rect x="0" y="50" width="100" height="62" fill="#2bb3c7" />
        <rect x="0" y="50" width="20" height="62" fill="#1c8ea0" />
        {/* folhas */}
        <ellipse cx="24" cy="88" rx="4.5" ry="2.2" fill="#2e8b57" stroke="#000" strokeWidth={1.2} transform="rotate(-35 24 88)" />
        <ellipse cx="78" cy="90" rx="4.5" ry="2.2" fill="#2e8b57" stroke="#000" strokeWidth={1.2} transform="rotate(30 78 90)" />
        {/* flores */}
        <Flor x={30} y={70} r={6} cor="#ff5c8a" />
        <Flor x={72} y={70} r={6} cor="#ffd54f" />
        <Flor x={38} y={98} r={5.5} cor="#ff9f1c" />
        <Flor x={68} y={100} r={6} cor="#ff5c8a" />
        {/* colarinho em V e abertura da frente */}
        <path d="M38 50 L64 50 L51 70 Z" fill="#fff3c4" stroke="#000" strokeWidth={2.5} />
        <path d="M51 70 L51 110" fill="none" stroke="#000" strokeWidth={2} />
        <circle cx="51" cy="82" r="1.6" fill="#ffffff" stroke="#000" strokeWidth={1} />
        <circle cx="51" cy="94" r="1.6" fill="#ffffff" stroke="#000" strokeWidth={1} />
      </g>
    ),
  },
  capa: {
    nome: 'Capa de herói',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* capa vermelha no lado de trás (esquerda), com dobra escura */}
        <path d="M0 50 L60 50 Q58 74 66 88 Q60 96 64 110 L0 110 Z" fill="#d32f2f" stroke="#000" strokeWidth={2.5} />
        <path d="M0 50 L12 50 L12 110 L0 110 Z" fill="#9a1212" />
        {/* barra da capa, ondulada na ponta */}
        <path d="M60 50 Q58 74 66 88 Q60 96 64 110" fill="none" stroke="#7a0e0e" strokeWidth={2.5} />
        {/* gola alta da capa */}
        <path d="M26 50 L76 50 L76 58 L26 58 Z" fill="#b71c1c" stroke="#000" strokeWidth={2.5} />
        {/* fecho dourado no pescoço */}
        <circle cx="51" cy="56" r="3.5" fill="#ffd21f" stroke="#000" strokeWidth={2} />
        {/* faixa dourada na cintura, com fivela */}
        <rect x="0" y="90" width="100" height="6" fill="#f7c843" stroke="#000" strokeWidth={2} />
        <rect x="46" y="88" width="10" height="10" rx="2" fill="#f7c843" stroke="#000" strokeWidth={2} />
        {/* estrela no peito */}
        <polygon
          points="70,61 71.8,65.6 76.7,65.8 72.9,68.9 74.1,73.7 70,71 65.9,73.7 67.1,68.9 63.3,65.8 68.2,65.6"
          fill="#ffd21f"
          stroke="#000"
          strokeWidth={1.5}
        />
      </g>
    ),
  },
  avental: {
    nome: 'Avental de cozinheiro',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* alças do pescoço */}
        <path d="M37 58 L44 50 M65 58 L58 50" fill="none" stroke="#000" strokeWidth={2.5} strokeLinecap="round" />
        {/* avental branco */}
        <path d="M36 58 L66 58 L70 110 L32 110 Z" fill="#fafafa" stroke="#000" strokeWidth={2.5} />
        {/* bolso frontal */}
        <rect x="42" y="84" width="18" height="12" rx="2" fill="#eceff3" stroke="#000" strokeWidth={2} />
        {/* mancha de molho */}
        <circle cx="60" cy="70" r="3.2" fill="#e53935" stroke="#000" strokeWidth={1.2} />
        {/* laço lateral: nó e as duas pontas */}
        <path d="M34 80 L22 74 L22 86 Z" fill="#fafafa" stroke="#000" strokeWidth={2} />
        <circle cx="34" cy="80" r="2.6" fill="#fafafa" stroke="#000" strokeWidth={1.6} />
      </g>
    ),
  },
  moletom: {
    nome: 'Moletom com capuz',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* moletom */}
        <rect x="0" y="50" width="100" height="62" fill="#4b5566" />
        <rect x="0" y="50" width="20" height="62" fill="#3a4250" />
        {/* capuz enrolado atrás da cabeça, na altura do visor */}
        <path d="M0 12 L38 12 Q40 33 37 54 L0 54 Z" fill="#4b5566" stroke="#000" strokeWidth={2.5} />
        <path d="M0 12 L12 12 L12 54 L0 54 Z" fill="#3a4250" />
        {/* cordões do capuz */}
        <path d="M49 54 L48 66 M55 54 L56 66" fill="none" stroke="#e8e8e8" strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="48" cy="67" r="1.5" fill="#e8e8e8" />
        <circle cx="56" cy="67" r="1.5" fill="#e8e8e8" />
        {/* bolso canguru */}
        <path d="M36 82 L66 82 L70 94 L32 94 Z" fill="#3a4250" stroke="#000" strokeWidth={2.5} />
        {/* barra de cima do bolso e barra da cintura */}
        <rect x="0" y="97" width="100" height="8" fill="#2f3643" stroke="#000" strokeWidth={2} />
      </g>
    ),
  },
  colete: {
    nome: 'Colete salva-vidas',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* colete laranja */}
        <rect x="0" y="50" width="100" height="62" fill="#ff7a1a" />
        <rect x="0" y="50" width="22" height="62" fill="#d95f0c" />
        {/* gola */}
        <path d="M30 50 Q51 60 72 50 L72 56 Q51 66 30 56 Z" fill="#e86a0c" stroke="#000" strokeWidth={2} />
        {/* faixas refletivas */}
        <rect x="0" y="74" width="100" height="5" fill="#eef4fb" stroke="#000" strokeWidth={1.4} />
        <rect x="0" y="86" width="100" height="5" fill="#eef4fb" stroke="#000" strokeWidth={1.4} />
        {/* zíper na frente */}
        <path d="M51 56 L51 110" fill="none" stroke="#000" strokeWidth={2.5} />
        {/* bolsos */}
        <rect x="32" y="62" width="13" height="9" rx="2" fill="#e86a0c" stroke="#000" strokeWidth={2} />
        <rect x="57" y="62" width="13" height="9" rx="2" fill="#e86a0c" stroke="#000" strokeWidth={2} />
      </g>
    ),
  },
  smoking: {
    nome: 'Smoking com gravata-borboleta',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* paletó preto */}
        <rect x="0" y="50" width="100" height="62" fill="#16161c" />
        {/* camisa branca em V */}
        <path d="M40 50 L62 50 L51 84 Z" fill="#ffffff" stroke="#000" strokeWidth={2} />
        {/* lapelas de cetim */}
        <path d="M30 50 L40 50 L51 84 L36 72 Z" fill="#2a2a33" stroke="#000" strokeWidth={2.5} />
        <path d="M72 50 L62 50 L51 84 L66 72 Z" fill="#2a2a33" stroke="#000" strokeWidth={2.5} />
        <path d="M37 58 L46 80 M65 58 L56 80" fill="none" stroke="#8a8fa0" strokeWidth={1.2} />
        {/* gravata-borboleta */}
        <path d="M51 58 L42 53 L42 63 Z" fill="#000" stroke="#000" strokeWidth={1.5} />
        <path d="M51 58 L60 53 L60 63 Z" fill="#000" stroke="#000" strokeWidth={1.5} />
        <circle cx="51" cy="58" r="2.2" fill="#333" stroke="#000" strokeWidth={1} />
        {/* botão de pérola */}
        <circle cx="51" cy="96" r="1.6" fill="#ffffff" stroke="#000" strokeWidth={1} />
      </g>
    ),
  },
  pijama: {
    nome: 'Pijama listrado',
    desenho: () => (
      <g strokeLinejoin="round">
        {/* pijama branco */}
        <rect x="0" y="50" width="100" height="62" fill="#fbfbfd" />
        <rect x="0" y="50" width="20" height="62" fill="#e1e6ee" />
        {/* listras azuis */}
        {[56, 64, 72, 80, 88, 96, 104].map((y) => (
          <rect key={y} x="0" y={y} width="100" height="4" fill="#5b9bd5" />
        ))}
        {/* gola redonda */}
        <path d="M38 50 Q51 62 64 50" fill="none" stroke="#000" strokeWidth={2.5} />
        {/* botões */}
        {[72, 84, 96].map((y) => (
          <circle key={y} cx="51" cy={y} r="2" fill="#ffd54f" stroke="#000" strokeWidth={1.2} />
        ))}
      </g>
    ),
  },
};

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
