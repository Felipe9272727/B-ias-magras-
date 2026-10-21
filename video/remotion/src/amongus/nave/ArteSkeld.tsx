// Mapa v5 do Among Us 4: a mesma nave (mesmas coordenadas de mundo do motor, mapa.ts e pontos3.json), desenhada em
// VETOR seguindo a planta do The Skeld: cada sala é um polígono dentro do seu retângulo (Refeitório e Depósito
// octogonais, Reator e Navegação em ponta, cantos cortados nas outras; tabela CANTOS em Melhorias4.tsx), o casco é a
// união das salas e corredores com contorno grosso e suave, e o piso de cada sala tem a cor da planta. Arte própria:
// só forma, proporção e cores seguem o jogo.
// Pontos que caem num canto cortado (jogador, console, duto, corpo) passam por foraDoCanto() antes de serem desenhados.
import React, {useMemo} from 'react';
import {NAVE} from './mapa';
import {SALAS_ORDEM, TILE, type Sala} from './spec';
import {DESENHOS, props3Absolutos, consoleTarefa3} from './Props3';
import {CANTOS, FundoEspaco, JanelaNavegacao, foraDoCanto, poligonoSala, ret} from './Melhorias4';

const W = NAVE.cols * TILE;
const H = NAVE.rows * TILE;
const CONTORNO = '#0b0d14';
const PAREDE = 34; // quanto a parede avança para fora do piso (px)
const BORDA = 9; // contorno escuro em volta da parede
const FACE = 44; // face da parede de cima (perspectiva do jogo)

// piso de cada sala (cor base, cor da junta e tamanho do ladrilho), seguindo a planta
const PISO: Record<Sala, {a: string; b: string; t: number; tipo?: 'xadrez' | 'placas' | 'grade' | 'diagonal'}> = {
  Refeitorio: {a: '#b9b4a6', b: '#a8a394', t: 96, tipo: 'xadrez'},
  Armas: {a: '#8d97a4', b: '#7a8491', t: 96, tipo: 'placas'},
  O2: {a: '#7f9f92', b: '#6e8d80', t: 72, tipo: 'grade'},
  Navegacao: {a: '#8f9aab', b: '#7b8697', t: 96, tipo: 'placas'},
  Escudos: {a: '#99a2ad', b: '#868f9a', t: 96, tipo: 'placas'},
  Comunicacoes: {a: '#8f98a4', b: '#7c8591', t: 72, tipo: 'grade'},
  Deposito: {a: '#8a8e86', b: '#787c74', t: 96, tipo: 'diagonal'},
  Admin: {a: '#4f8f86', b: '#437d75', t: 72, tipo: 'grade'},
  Eletrica: {a: '#7b7850', b: '#696643', t: 72, tipo: 'grade'},
  MotorInferior: {a: '#6c7784', b: '#5d6774', t: 96, tipo: 'placas'},
  MotorSuperior: {a: '#6c7784', b: '#5d6774', t: 96, tipo: 'placas'},
  Reator: {a: '#5c6b7c', b: '#4e5c6c', t: 96, tipo: 'placas'},
  Seguranca: {a: '#5d6874', b: '#4f5965', t: 72, tipo: 'grade'},
  Enfermaria: {a: '#a8d3c3', b: '#93bfae', t: 72, tipo: 'xadrez'},
};
const CORR = {a: '#7d8da2', b: '#6a7a8f'};
// cor da face da parede (um tom abaixo do piso) e do topo do casco
const escurece = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};
const TOPO = '#4a5462';

const pontosD = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;
const R = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

// corredores: células ',' e 'D' da grade, juntadas em faixas por linha
function corredores() {
  let d = '';
  const g = NAVE.grid;
  for (let r = 0; r < NAVE.rows; r++) {
    let c = 0;
    while (c < NAVE.cols) {
      if (g[r][c] === ',' || g[r][c] === 'D') {
        const c0 = c;
        while (c < NAVE.cols && (g[r][c] === ',' || g[r][c] === 'D')) c++;
        d += R(c0 * TILE, r * TILE, (c - c0) * TILE, TILE);
      } else c++;
    }
  }
  return d;
}

// portas que caem num canto cortado: o piso da sala avança pela diagonal até a porta (o corredor "entra" na parede)
function entradasNosCantos(s: Sala) {
  const {c, r, w, h} = NAVE.salas[s].rect;
  const cs = CANTOS[s] ?? {};
  const g = NAVE.grid;
  let d = '';
  const kc = (canto: keyof typeof cs) => Math.ceil((cs[canto] ?? 0) / TILE);
  for (let x = c; x < c + w; x++) {
    // porta em cima (linha r-1) e embaixo (linha r+h)
    if (g[r - 1]?.[x] === 'D') { const prof = Math.max(kc('tl') - (x - c), kc('tr') - (c + w - 1 - x), 0); if (prof > 0) d += R(x * TILE, r * TILE, TILE, (prof + 1) * TILE); }
    if (g[r + h]?.[x] === 'D') { const prof = Math.max(kc('bl') - (x - c), kc('br') - (c + w - 1 - x), 0); if (prof > 0) d += R(x * TILE, (r + h - prof - 1) * TILE, TILE, (prof + 1) * TILE); }
  }
  for (let y = r; y < r + h; y++) {
    if (g[y]?.[c - 1] === 'D') { const prof = Math.max(kc('tl') - (y - r), kc('bl') - (r + h - 1 - y), 0); if (prof > 0) d += R(c * TILE, y * TILE, (prof + 1) * TILE, TILE); }
    if (g[y]?.[c + w] === 'D') { const prof = Math.max(kc('tr') - (y - r), kc('br') - (r + h - 1 - y), 0); if (prof > 0) d += R((c + w - prof - 1) * TILE, y * TILE, (prof + 1) * TILE, TILE); }
  }
  return d;
}

// face da parede de cima: faixa abaixo das arestas de cima do polígono (a horizontal e as diagonais de cima)
function faceDeCima(s: Sala) {
  const pts = poligonoSala(s);
  const {y0} = ret(s);
  const cs = CANTOS[s] ?? {};
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const deCima = ay === y0 && by === y0 && bx > ax; // aresta de cima
    const diagCima = (ay === y0 && bx > ax && by > ay && by <= y0 + (cs.tr ?? 0)) || (by === y0 && bx > ax && ay > by && ay <= y0 + (cs.tl ?? 0));
    if (deCima || diagCima) d += `M${ax} ${ay} L${bx} ${by} L${bx} ${by + FACE} L${ax} ${ay + FACE} Z`;
  }
  return d;
}

function padroes() {
  return (
    <>
      {SALAS_ORDEM.map((s) => {
        const p = PISO[s];
        const t = p.t;
        return (
          <pattern key={s} id={`sk-p-${s}`} width={t} height={t} patternUnits="userSpaceOnUse">
            <rect width={t} height={t} fill={p.a} />
            {p.tipo === 'xadrez' && <><rect width={t / 2} height={t / 2} fill={p.b} opacity={0.5} /><rect x={t / 2} y={t / 2} width={t / 2} height={t / 2} fill={p.b} opacity={0.5} /></>}
            {p.tipo === 'diagonal' && <path d={`M0 ${t} L${t} 0 M${-t / 2} ${t / 2} L${t / 2} ${-t / 2} M${t / 2} ${t * 1.5} L${t * 1.5} ${t / 2}`} stroke={p.b} strokeWidth={5} />}
            {p.tipo === 'placas' && <><rect x={6} y={6} width={t - 12} height={t - 12} rx={4} fill="none" stroke={p.b} strokeWidth={3} /><circle cx={12} cy={12} r={2.5} fill={p.b} /><circle cx={t - 12} cy={t - 12} r={2.5} fill={p.b} /></>}
            <path d={`M0 0 H${t} M0 0 V${t}`} stroke={p.b} strokeWidth={2.5} />
          </pattern>
        );
      })}
      <pattern id="sk-corr" width={48} height={48} patternUnits="userSpaceOnUse">
        <rect width={48} height={48} fill={CORR.a} />
        <rect x={4} y={4} width={40} height={40} rx={3} fill="none" stroke={CORR.b} strokeWidth={2.5} />
        <path d="M0 0 H48 M0 0 V48" stroke={CORR.b} strokeWidth={2} />
        {[12, 24, 36].map((x) => <rect key={x} x={x - 1} y={14} width={2} height={20} fill={CORR.b} opacity={0.6} />)}
      </pattern>
      <filter id="sk-halo" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={30} /></filter>
    </>
  );
}

// mesa redonda azul do Refeitório (como na planta), com bancos em volta
function mesaAzul(cx: number, cy: number, raio: number, botao: boolean, chave: string) {
  const bancos = [0, 60, 120, 180, 240, 300];
  return (
    <g key={chave} transform={`translate(${cx} ${cy})`}>
      <ellipse cx={8} cy={14} rx={raio + 30} ry={raio + 24} fill="#000" opacity={0.18} />
      {bancos.map((a) => {
        const rad = (a * Math.PI) / 180;
        return <g key={a} transform={`translate(${Math.cos(rad) * (raio + 24)} ${Math.sin(rad) * (raio + 20)}) rotate(${a + 90})`}><rect x={-18} y={-8} width={36} height={16} rx={6} fill="#5c87b8" stroke={CONTORNO} strokeWidth={4} /></g>;
      })}
      <circle r={raio} fill="#3f6fa6" stroke={CONTORNO} strokeWidth={6} />
      <circle r={raio - 12} fill="#4f84c2" />
      <ellipse cx={-raio * 0.3} cy={-raio * 0.35} rx={raio * 0.35} ry={raio * 0.18} fill="#fff" opacity={0.18} />
      {botao && (
        <g>
          <circle r={26} fill="#d8dde4" stroke={CONTORNO} strokeWidth={4} />
          <circle r={17} fill="#e02626" stroke={CONTORNO} strokeWidth={3} />
          <ellipse cx={-5} cy={-6} rx={6} ry={3.5} fill="#fff" opacity={0.6} />
        </g>
      )}
    </g>
  );
}

function duto(x: number, y: number, chave: string) {
  const w = 56, h = 40;
  return (
    <g key={chave} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 3} y={-h / 2 + 4} width={w} height={h} rx={5} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="#2a313c" stroke={CONTORNO} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-w / 2 + 7} y={-h / 2 + 7 + i * 7} width={w - 14} height={3.5} rx={1.5} fill="#0f1319" />)}
    </g>
  );
}

function montar(): React.ReactNode {
  const salas = SALAS_ORDEM.map((s) => ({s, d: pontosD(poligonoSala(s))}));
  const dCorr = corredores();
  const dTudo = salas.map((x) => x.d).join(' ') + dCorr;
  const props = props3Absolutos().filter((p) => !(p.sala === 'Refeitorio' && (p.tipo === 'mesaRedonda' || p.tipo === 'mesaBotao')));
  const mesas = props3Absolutos().filter((p) => p.sala === 'Refeitorio' && (p.tipo === 'mesaRedonda' || p.tipo === 'mesaBotao'));
  return (
    <>
      <defs>{padroes()}</defs>
      {/* halo, contorno do casco e a parede (a união de salas e corredores, alargada) */}
      <path d={dTudo} fill="#4c7fd6" stroke="#4c7fd6" strokeWidth={2 * (PAREDE + BORDA) + 40} strokeLinejoin="round" opacity={0.4} filter="url(#sk-halo)" />
      <path d={dTudo} fill={CONTORNO} stroke={CONTORNO} strokeWidth={2 * (PAREDE + BORDA)} strokeLinejoin="round" />
      <path d={dTudo} fill={TOPO} stroke={TOPO} strokeWidth={2 * PAREDE} strokeLinejoin="round" />
      <path d={dTudo} fill="none" stroke="#5f6a79" strokeWidth={2 * PAREDE - 18} strokeLinejoin="round" opacity={0.5} />
      {/* pisos */}
      <path d={dCorr} fill="url(#sk-corr)" />
      {salas.map(({s, d}) => (
        <g key={s}>
          <path d={d} fill={`url(#sk-p-${s})`} />
          <path d={entradasNosCantos(s)} fill={`url(#sk-p-${s})`} />
        </g>
      ))}
      {/* sombra junto às paredes, por dentro de cada sala */}
      {salas.map(({s, d}) => (
        <g key={`sb-${s}`}>
          <clipPath id={`sk-clip-${s}`}><path d={d} /></clipPath>
          <path d={d} fill="none" stroke="#000" strokeWidth={34} opacity={0.18} clipPath={`url(#sk-clip-${s})`} strokeLinejoin="round" />
          <path d={faceDeCima(s)} fill={escurece(PISO[s].a, 0.58)} clipPath={`url(#sk-clip-${s})`} />
          <path d={faceDeCima(s)} fill="none" stroke="#fff" strokeWidth={2} opacity={0.15} clipPath={`url(#sk-clip-${s})`} />
          <path d={d} fill="none" stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" opacity={0.55} />
        </g>
      ))}
      {/* faixa central clara nos corredores */}
      <path d={dCorr} fill="none" stroke="#fff" strokeWidth={1} opacity={0.05} />
      {/* nomes das salas */}
      {SALAS_ORDEM.map((s) => {
        const {x0, y0} = ret(s);
        const tl = CANTOS[s]?.tl ?? 0;
        return <text key={`n-${s}`} x={x0 + tl + 26} y={y0 + FACE + 34} fill="#fff" opacity={0.4} fontSize={26} fontWeight={800} fontFamily="Arial, Helvetica, sans-serif" style={{letterSpacing: 4}}>{NAVE.salas[s].nome.toUpperCase()}</text>;
      })}
      <JanelaNavegacao />
      {/* objetos (os da v3/v4) e as mesas azuis do Refeitório */}
      {props.map((p, i) => {
        const q = foraDoCanto(p.sala, {x: p.cx, y: p.cy});
        return <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${p.rot ?? 0})`}>{DESENHOS[p.tipo]?.(p.pw, p.ph, p.v)}</g>;
      })}
      {mesas.map((p, i) => mesaAzul(p.cx, p.cy, p.pw * 0.3, p.tipo === 'mesaBotao', `mesa-${i}`))}
      {SALAS_ORDEM.flatMap((s) => NAVE.salas[s].consoles.map((p0, i) => { const p = foraDoCanto(s, p0); return consoleTarefa3(p.x, p.y, `${s}-c${i}`); }))}
      {SALAS_ORDEM.flatMap((s) => { const d0 = NAVE.salas[s].duto; if (!d0) return []; const d = foraDoCanto(s, d0); return [duto(d.x, d.y, `${s}-d`)]; })}
    </>
  );
}

const Estatico = React.memo(function Estatico() {
  const cena = useMemo(() => montar(), []);
  return <>{cena}</>;
});

// a nave v5 inteira (fundo de espaço + desenho estático) e o alerta do reator por cima
export const ArteSkeld: React.FC<{alertaReator?: number}> = ({alertaReator = 0}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <FundoEspaco />
    <Estatico />
    {alertaReator > 0 && <rect x={0} y={0} width={W} height={H} fill="#ff1e1e" opacity={Math.min(1, alertaReator)} />}
  </svg>
);

// posição de um ponto de sala no mapa v5 (o vídeo usa para jogadores e corpos)
export const pontoV5 = foraDoCanto;
