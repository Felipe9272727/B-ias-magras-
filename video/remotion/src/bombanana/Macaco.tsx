// Macaco do BOMBANANA! em SVG (arte própria, no estilo do jogo: macaco marrom de desenho, cara clara, olhos grandes e
// luva branca). Cada papel tem seu acessório: Cego = venda vermelha, Surdo = fone grande preto, Mudo = fita X na boca
// e o manual azul. A gola tem a cor da IA. Os gestos (polegar, dedos, apontar, mão parada, tapa, banana) saem no
// braço direito; a boca mexe quando fala.
import React from 'react';

export type Papel = 'Cego' | 'Surdo' | 'Mudo';
export type Gesto = string; // "polegar_cima", "dedos:3", "apontar:esquerda", "apontar_banana:azul", "mao_parada", ...

const MARROM = '#7a4a26', MARROM_ESC = '#5a3418', PELE = '#f0c59a', PELE_ESC = '#d9a577';
export const COR_BANANA: Record<string, string> = {vermelho: '#e53935', azul: '#1e88e5', amarelo: '#fdd835', verde: '#43a047', branco: '#f5f5f5', preto: '#222', roxo: '#8e24aa', laranja: '#fb8c00'};

const Luva: React.FC<{gesto: Gesto; x: number; y: number; ang: number}> = ({gesto, x, y, ang}) => {
  const g = gesto.split(':');
  const dedos = g[0] === 'dedos' ? Math.max(0, Math.min(10, Number(g[1]) || 0)) : -1;
  const branco = '#fafafa', borda = '#b9b9b9';
  const dedo = (dx: number, rot: number, len = 30) => <rect key={`${dx}${rot}`} x={dx - 6} y={-len - 8} width={12} height={len} rx={6} fill={branco} stroke={borda} strokeWidth={2} transform={`rotate(${rot} ${dx} -8)`} />;
  let conteudo: React.ReactNode;
  if (g[0] === 'polegar_cima' || g[0] === 'polegar_baixo') {
    conteudo = <g transform={g[0] === 'polegar_baixo' ? 'rotate(180)' : ''}><rect x={-26} y={-14} width={46} height={40} rx={14} fill={branco} stroke={borda} strokeWidth={2} />{[-6, 4, 14].map((yy) => <rect key={yy} x={-2} y={yy - 10} width={30} height={11} rx={5.5} fill={branco} stroke={borda} strokeWidth={2} />)}<rect x={-30} y={-46} width={14} height={36} rx={7} fill={branco} stroke={borda} strokeWidth={2} transform="rotate(-12 -23 -14)" /></g>;
  } else if (dedos >= 0) {
    // até 5 dedos numa mão; de 6 a 10, aparece a outra mão aberta ao lado
    const n1 = Math.min(5, dedos), n2 = Math.max(0, dedos - 5);
    const mao = (n: number, ox: number) => <g transform={`translate(${ox} 0)`}>{Array.from({length: n}, (_, i) => dedo(-20 + i * 10, -16 + i * 8))}<rect x={-24} y={-14} width={48} height={40} rx={16} fill={branco} stroke={borda} strokeWidth={2} /></g>;
    conteudo = <g>{mao(n1, 0)}{n2 > 0 ? mao(n2, -58) : null}</g>;
  } else if (g[0] === 'apontar' || g[0] === 'apontar_banana') {
    conteudo = <g>{dedo(0, 90, 40)}<rect x={-22} y={-18} width={40} height={36} rx={14} fill={branco} stroke={borda} strokeWidth={2} /></g>;
  } else if (g[0] === 'mao_parada') {
    conteudo = <g>{[-15, -5, 5, 15].map((dx) => dedo(dx, 0, 32))}<rect x={-24} y={-14} width={48} height={42} rx={16} fill={branco} stroke={borda} strokeWidth={2} /></g>;
  } else if (g[0] === 'jogar_banana') {
    conteudo = <g><path d="M -10 -50 Q 30 -40 26 0 Q 18 -30 -14 -40 Z" fill="#fdd835" stroke="#8d6e00" strokeWidth={2} /><circle r={22} fill={branco} stroke={borda} strokeWidth={2} /></g>;
  } else {
    conteudo = <circle r={22} fill={branco} stroke={borda} strokeWidth={2} />;
  }
  return <g transform={`translate(${x} ${y}) rotate(${ang}) scale(1.5)`}>{conteudo}</g>;
};

export const Macaco: React.FC<{
  papel: Papel; cor: string; boca?: number; gesto?: Gesto; piscar?: boolean; virado?: boolean; frame?: number; manual?: boolean;
}> = ({papel, cor, boca = 0, gesto = '', piscar = false, virado = false, frame = 0, manual}) => {
  const resp = Math.sin(frame / 18) * 3; // respiração
  const g = gesto.split(':');
  // ângulo do braço direito conforme o gesto
  const dir = g[1];
  let braco = 20, mx = 300, my = 330, angMao = 0;
  if (gesto) {
    if (g[0] === 'apontar' || g[0] === 'apontar_banana') {
      const alvo = g[0] === 'apontar_banana' ? 'cima' : dir;
      const tab: Record<string, [number, number, number, number]> = {cima: [-60, 300, 150, -90], baixo: [60, 300, 400, 90], esquerda: [-150, 120, 300, 180], direita: [-20, 380, 290, 0]};
      [braco, mx, my, angMao] = tab[alvo ?? 'direita'] ?? tab.direita;
    } else if (g[0] === 'tapa') { braco = -100; mx = 230; my = 120; angMao = -40; }
    else if (g[0] === 'jogar_banana') { braco = -80; mx = 330; my = 150; angMao = 20; }
    else if (g[0] === 'polegar_baixo') { braco = 10; mx = 335; my = 330; }
    else { braco = -30; mx = 335; my = 285; }
  }
  const ombro = [270, 300];
  return (
    <svg viewBox="0 0 400 500" style={{width: '100%', height: '100%', overflow: 'visible', transform: virado ? 'scaleX(-1)' : undefined}}>
      <g transform={`translate(0 ${resp})`}>
        {/* corpo e barriga */}
        <ellipse cx={200} cy={400} rx={110} ry={110} fill={MARROM} />
        <ellipse cx={200} cy={420} rx={70} ry={78} fill={PELE} />
        {/* gola com a cor da IA */}
        <path d="M 120 300 Q 200 345 280 300 L 270 325 Q 200 368 130 325 Z" fill={cor} stroke="#0003" strokeWidth={3} />
        {/* braço esquerdo (segura o manual se for o Mudo) */}
        <path d={`M 130 300 Q 80 360 ${manual ? 150 : 110} ${manual ? 380 : 420}`} stroke={MARROM} strokeWidth={34} strokeLinecap="round" fill="none" />
        {manual ? (
          <g transform="translate(110 340) rotate(-8)">
            <rect x={0} y={0} width={150} height={110} rx={10} fill="#a8dcef" stroke="#3d7fa0" strokeWidth={4} />
            <rect x={70} y={4} width={10} height={102} fill="#e85d75" />
            <rect x={14} y={14} width={46} height={6} rx={3} fill="#3d7fa0" /><rect x={14} y={28} width={40} height={6} rx={3} fill="#3d7fa0" /><rect x={92} y={14} width={44} height={6} rx={3} fill="#3d7fa0" />
          </g>
        ) : <circle cx={110} cy={420} r={22} fill="#fafafa" stroke="#b9b9b9" strokeWidth={2} />}
        {/* braço direito + luva com o gesto */}
        <path d={`M ${ombro[0]} ${ombro[1]} Q ${(ombro[0] + mx) / 2 + 30} ${(ombro[1] + my) / 2 + braco * 0.3} ${mx} ${my}`} stroke={MARROM} strokeWidth={34} strokeLinecap="round" fill="none" />
        <Luva gesto={gesto} x={mx} y={my} ang={angMao} />
        {/* cabeça */}
        <g transform={`translate(200 175) rotate(${Math.sin(frame / 40) * 2})`}>
          <circle cx={-118} cy={-10} r={42} fill={MARROM} /><circle cx={-118} cy={-10} r={24} fill={PELE_ESC} />
          <circle cx={118} cy={-10} r={42} fill={MARROM} /><circle cx={118} cy={-10} r={24} fill={PELE_ESC} />
          <circle r={118} fill={MARROM} />
          <path d="M -88 -30 Q -60 -95 0 -55 Q 60 -95 88 -30 Q 105 60 0 95 Q -105 60 -88 -30 Z" fill={PELE} />
          {/* olhos (ou a venda do Cego) */}
          {papel === 'Cego' ? (
            <g>
              <path d="M -125 -45 Q 0 -70 125 -45 L 122 5 Q 0 -18 -122 5 Z" fill="#e53935" stroke="#9a1c1a" strokeWidth={4} />
              <path d="M 118 -30 Q 160 -20 170 20 L 150 25 Q 140 0 115 -5 Z" fill="#e53935" stroke="#9a1c1a" strokeWidth={3} />
            </g>
          ) : (
            <g>
              {[-40, 40].map((ex) => <g key={ex}><ellipse cx={ex} cy={-18} rx={22} ry={piscar ? 3 : 28} fill="#1d1d1d" />{piscar ? null : <circle cx={ex + 7} cy={-30} r={7} fill="#fff" />}</g>)}
            </g>
          )}
          {/* nariz */}
          <ellipse cx={-10} cy={22} rx={6} ry={4} fill={MARROM_ESC} /><ellipse cx={10} cy={22} rx={6} ry={4} fill={MARROM_ESC} />
          {/* boca (ou a fita X do Mudo) */}
          {papel === 'Mudo' ? (
            <g>
              <rect x={-44} y={42} width={88} height={22} rx={4} fill="#f2e2b6" stroke="#c7b07a" strokeWidth={3} transform="rotate(-12)" />
              <rect x={-44} y={42} width={88} height={22} rx={4} fill="#f2e2b6" stroke="#c7b07a" strokeWidth={3} transform="rotate(12)" />
            </g>
          ) : (
            <path d={`M -34 50 Q 0 ${58 + boca * 40} 34 50 Q 0 ${60 + boca * 10} -34 50 Z`} fill={boca > 0.1 ? '#7a1f2b' : MARROM_ESC} stroke={MARROM_ESC} strokeWidth={3} />
          )}
          {/* fone do Surdo */}
          {papel === 'Surdo' ? (
            <g>
              <path d="M -120 -20 Q -120 -150 0 -150 Q 120 -150 120 -20" stroke="#222" strokeWidth={18} fill="none" />
              <rect x={-150} y={-45} width={46} height={80} rx={18} fill="#2b2b2b" stroke="#111" strokeWidth={4} />
              <rect x={104} y={-45} width={46} height={80} rx={18} fill="#2b2b2b" stroke="#111" strokeWidth={4} />
              <circle cx={-127} cy={-5} r={10} fill="#e53935" /><circle cx={127} cy={-5} r={10} fill="#e53935" />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
};
