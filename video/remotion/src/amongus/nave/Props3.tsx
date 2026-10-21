// Among Us 3: objetos da nave redesenhados, maiores e mais parecidos com os do jogo (desenho próprio):
// mesas redondas com bancos e o botão de emergência no Refeitório, motores enormes, o núcleo do reator, o scanner e
// as camas da Enfermaria, a mesa de monitores da Segurança, os painéis e cabos da Elétrica, a mesa holográfica do
// Admin, a cadeira de tiro de Armas, jardineiras e tanques do O2, a janela e o painel de Navegação, os hexágonos de
// Escudos, o radar de Comunicações, as pilhas de carga do Depósito e os terminais de tarefa com contorno amarelo.
// As posições ficam em casas relativas à sala e foram conferidas contra os lugares onde os jogadores param
// (scripts/au3/checar_props.ts).
import React from 'react';
import {NAVE, caminho} from './mapa';
import {SALAS_ORDEM, TILE, type Sala} from './spec';

export type P3 = {tipo: string; x: number; y: number; w: number; h: number; rot?: number; v?: number};

// x, y, w, h em casas, relativos ao canto da sala
export const LAYOUT3: Record<Sala, P3[]> = {
  Refeitorio: [
    {tipo: 'mesaBotao', x: 13.4, y: 9, w: 3.8, h: 3.8},
    {tipo: 'mesaRedonda', x: 6, y: 4.6, w: 4.6, h: 4.6},
    {tipo: 'mesaRedonda', x: 22.5, y: 4.6, w: 4.6, h: 4.6},
    {tipo: 'mesaRedonda', x: 5.4, y: 13, w: 4.4, h: 4.4},
    {tipo: 'mesaRedonda', x: 22.5, y: 12.6, w: 4.6, h: 4.6},
    {tipo: 'balcao', x: 17.5, y: 0.9, w: 6, h: 1.4},
  ],
  MotorSuperior: [{tipo: 'motorGrande', x: 11.4, y: 2.6, w: 6, h: 3.2}, {tipo: 'canos', x: 11.4, y: 0.5, w: 6, h: 0.7}],
  MotorInferior: [{tipo: 'motorGrande', x: 9.8, y: 4.0, w: 5.0, h: 2.8}, {tipo: 'canos', x: 1.0, y: 6.8, w: 0.7, h: 5}],
  Reator: [{tipo: 'reatorNucleo', x: 5.2, y: 6.6, w: 4.2, h: 5.2}, {tipo: 'canos', x: 1.0, y: 6.6, w: 0.7, h: 6}, {tipo: 'canos', x: 9.9, y: 3.2, w: 0.7, h: 2.0}],
  Seguranca: [{tipo: 'monitores', x: 7.2, y: 7.4, w: 2.4, h: 2.0}, {tipo: 'rack', x: 1.8, y: 5.6, w: 1.4, h: 1.8}],
  Enfermaria: [
    {tipo: 'scannerMed', x: 8.2, y: 6.8, w: 2.8, h: 2.8},
    {tipo: 'camaMed', x: 2.0, y: 7.6, w: 2.8, h: 1.3},
    {tipo: 'camaMed', x: 7.9, y: 2.4, w: 2.6, h: 1.3},
    {tipo: 'amostras', x: 11.2, y: 7.6, w: 1.6, h: 1.6},
  ],
  Eletrica: [
    {tipo: 'painelEletrico', x: 8.6, y: 0.9, w: 3.6, h: 1.5},
    {tipo: 'distribuidor', x: 1.4, y: 6.4, w: 2.0, h: 3.2},
    {tipo: 'cabos', x: 8.0, y: 8.0, w: 3.6, h: 1.4},
  ],
  Admin: [{tipo: 'mesaAdmin', x: 6.2, y: 4.3, w: 4.2, h: 2.6}, {tipo: 'leitorCartao', x: 9.6, y: 8.8, w: 1.4, h: 1.0}],
  Armas: [
    {tipo: 'cadeiraArmas', x: 13.8, y: 2.6, w: 3.8, h: 3.4},
    {tipo: 'jardineira', x: 5.6, y: 1.0, w: 3.0, h: 1.1},
    {tipo: 'canos', x: 11.6, y: 7.6, w: 4, h: 0.7},
  ],
  O2: [
    {tipo: 'jardineira', x: 2.6, y: 3.8, w: 3.4, h: 1.2},
    {tipo: 'jardineira', x: 2.6, y: 6.6, w: 3.4, h: 1.2},
    {tipo: 'tanquesO2', x: 8.9, y: 6.1, w: 2.4, h: 2.0},
    {tipo: 'filtroO2', x: 4.6, y: 1.0, w: 2.4, h: 1.2},
  ],
  Navegacao: [
    {tipo: 'janelaNav', x: 8.2, y: 4.8, w: 3.8, h: 4.2},
    {tipo: 'painelNav', x: 3.6, y: 10.2, w: 3.2, h: 1.6},
  ],
  Escudos: [{tipo: 'hexEscudos', x: 7.6, y: 4.2, w: 4.2, h: 3.6}, {tipo: 'gerador', x: 4.0, y: 8.6, w: 2.0, h: 2.0}, {tipo: 'gerador', x: 10.2, y: 8.0, w: 2.0, h: 2.0}],
  Comunicacoes: [{tipo: 'radar', x: 4.2, y: 6.0, w: 2.8, h: 2.8}, {tipo: 'mesaComms', x: 10.8, y: 6.1, w: 3.0, h: 1.6}],
  Deposito: [
    {tipo: 'pilhaCaixas', x: 4.4, y: 4.2, w: 3.0, h: 3.0},
    {tipo: 'pilhaCaixas', x: 12.6, y: 10.6, w: 3.0, h: 3.0, v: 1},
    {tipo: 'barris', x: 12.8, y: 3.6, w: 2.6, h: 1.6},
    {tipo: 'galoes', x: 4.6, y: 10.2, w: 2.4, h: 1.4},
  ],
};

// em px de mundo
export function props3Absolutos() {
  return SALAS_ORDEM.flatMap((s) => {
    const r = NAVE.salas[s].rect;
    return LAYOUT3[s].map((p) => ({...p, sala: s, cx: (r.c + p.x) * TILE, cy: (r.r + p.y) * TILE, pw: p.w * TILE, ph: p.h * TILE}));
  });
}

// ---------------------------------------------------------------- desenho (coordenadas locais centradas em 0,0)
const sombra = (w: number, h: number, rx = 14) => <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={rx} fill="#000" opacity={0.28} />;
const CONT = '#10141b';

function mesaRedonda(w: number) {
  const r = w * 0.31;
  return (
    <>
      <ellipse cx={6} cy={12} rx={w * 0.5} ry={w * 0.5} fill="#000" opacity={0.22} />
      {[20, 110, 200, 290].map((a) => (
        <path key={a} transform={`rotate(${a})`} d={`M${r * 1.25} ${-r * 0.55} A${r * 1.37} ${r * 1.37} 0 0 1 ${r * 1.25} ${r * 0.55} L${r * 1.55} ${r * 0.68} A${r * 1.7} ${r * 1.7} 0 0 0 ${r * 1.55} ${-r * 0.68} Z`}
          fill="#6f7d91" stroke={CONT} strokeWidth={3} />
      ))}
      <ellipse cx={0} cy={r * 0.16} rx={r} ry={r} fill="#8d99a8" stroke={CONT} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.94} fill="#eef2f6" stroke={CONT} strokeWidth={4} />
      <ellipse cx={-r * 0.25} cy={-r * 0.28} rx={r * 0.45} ry={r * 0.22} fill="#fff" opacity={0.7} />
      <circle r={r * 0.5} fill="none" stroke="#c9d2dc" strokeWidth={3} />
    </>
  );
}
function mesaBotao(w: number) {
  const r = w * 0.36;
  return (
    <>
      {mesaRedonda(w * 1.05)}
      <ellipse cx={0} cy={r * 0.18} rx={r * 0.5} ry={r * 0.42} fill="#4a5361" stroke={CONT} strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={r * 0.46} ry={r * 0.38} fill="#d0d6dd" stroke={CONT} strokeWidth={3} />
      <ellipse cx={0} cy={-r * 0.06} rx={r * 0.3} ry={r * 0.25} fill="#e3242b" stroke="#6b0d10" strokeWidth={3} />
      <ellipse cx={-r * 0.1} cy={-r * 0.14} rx={r * 0.12} ry={r * 0.07} fill="#ff9b9b" />
      <path d={`M${-r * 0.42} ${-r * 0.02} Q0 ${-r * 0.75} ${r * 0.42} ${-r * 0.02}`} fill="#bfefff" opacity={0.35} stroke="#e8fbff" strokeWidth={2} />
    </>
  );
}
function balcao(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 10)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#b7c2cf" stroke={CONT} strokeWidth={3} />
      <rect x={-w / 2} y={h * 0.05} width={w} height={h * 0.45} rx={8} fill="#7f8b9b" />
      {[-0.32, -0.1, 0.12, 0.34].map((f, i) => (
        <g key={i} transform={`translate(${f * w} ${-h * 0.12})`}>
          <rect x={-w * 0.07} y={-h * 0.22} width={w * 0.14} height={h * 0.34} rx={5} fill={['#ffcf4d', '#ff8f5a', '#7ee787', '#8fd3ff'][i]} stroke={CONT} strokeWidth={2} />
        </g>
      ))}
    </>
  );
}
function motorGrande(w: number, h: number) {
  return (
    <>
      {sombra(w, h, h / 2)}
      {/* corpo cilíndrico deitado */}
      <rect x={-w / 2 + h * 0.3} y={-h / 2} width={w - h * 0.6} height={h} rx={h * 0.22} fill="#8793a3" stroke={CONT} strokeWidth={4} />
      <rect x={-w / 2 + h * 0.3} y={-h / 2 + h * 0.08} width={w - h * 0.6} height={h * 0.2} rx={6} fill="#c9d2dc" opacity={0.55} />
      <rect x={-w / 2 + h * 0.3} y={h * 0.18} width={w - h * 0.6} height={h * 0.32} rx={6} fill="#5d6876" opacity={0.6} />
      {[-0.22, 0, 0.22].map((f) => <rect key={f} x={f * w - 7} y={-h / 2} width={14} height={h} fill="#4c5664" stroke={CONT} strokeWidth={2} />)}
      {/* bocal de exaustão com brilho laranja */}
      <path d={`M${w / 2 - h * 0.32} ${-h * 0.42} L${w / 2} ${-h * 0.3} L${w / 2} ${h * 0.3} L${w / 2 - h * 0.32} ${h * 0.42} Z`} fill="#3a424e" stroke={CONT} strokeWidth={4} />
      <ellipse cx={w / 2 + 8} cy={0} rx={h * 0.24} ry={h * 0.32} fill="url(#ar-laranja)" opacity={0.95} />
      <ellipse cx={w / 2 + 4} cy={0} rx={h * 0.1} ry={h * 0.18} fill="#fff4c2" />
      {/* turbina na frente */}
      <ellipse cx={-w / 2 + h * 0.32} cy={0} rx={h * 0.32} ry={h * 0.5} fill="#2c343f" stroke={CONT} strokeWidth={4} />
      {[0, 40, 80, 120, 160].map((a) => <ellipse key={a} cx={-w / 2 + h * 0.32} cy={0} rx={h * 0.06} ry={h * 0.42} fill="#9aa6b6" transform={`rotate(${a} ${-w / 2 + h * 0.32} 0)`} />)}
      <circle cx={-w / 2 + h * 0.32} cy={0} r={h * 0.1} fill="#171c24" />
      {/* luzes */}
      {[-0.1, 0.1].map((f) => <circle key={f} cx={f * w} cy={-h * 0.3} r={5} fill="#ffd84d" stroke={CONT} strokeWidth={1.5} />)}
    </>
  );
}
function canos(w: number, h: number) {
  const horiz = w >= h;
  const L = Math.max(w, h), T = Math.min(w, h);
  const linhas = [0.28, 0.72].map((f) => (horiz
    ? <rect key={f} x={-L / 2} y={-T / 2 + T * f - T * 0.18} width={L} height={T * 0.36} rx={T * 0.18} fill={f < 0.5 ? '#9aa6b6' : '#6f7c8d'} stroke={CONT} strokeWidth={2.5} />
    : <rect key={f} y={-L / 2} x={-T / 2 + T * f - T * 0.18} height={L} width={T * 0.36} rx={T * 0.18} fill={f < 0.5 ? '#9aa6b6' : '#6f7c8d'} stroke={CONT} strokeWidth={2.5} />));
  const flanges = [-0.4, 0, 0.4].map((f) => (horiz
    ? <rect key={f} x={f * L - 5} y={-T / 2 - 2} width={10} height={T + 4} rx={3} fill="#4c5664" stroke={CONT} strokeWidth={2} />
    : <rect key={f} y={f * L - 5} x={-T / 2 - 2} height={10} width={T + 4} rx={3} fill="#4c5664" stroke={CONT} strokeWidth={2} />));
  return <>{linhas}{flanges}</>;
}
function reatorNucleo(w: number, h: number) {
  const rx = w * 0.32, ry = rx * 0.42;
  const topo = -h / 2 + ry + 10, base = h / 2 - ry - 10;
  return (
    <>
      <ellipse cx={8} cy={base + 14} rx={w * 0.48} ry={ry * 1.6} fill="#000" opacity={0.3} />
      {/* base larga */}
      <ellipse cx={0} cy={base + 8} rx={w * 0.46} ry={ry * 1.5} fill="#3a4556" stroke={CONT} strokeWidth={4} />
      <ellipse cx={0} cy={base} rx={w * 0.46} ry={ry * 1.5} fill="#6b788b" stroke={CONT} strokeWidth={4} />
      {/* coluna de vidro com energia azul */}
      <rect x={-rx} y={topo} width={rx * 2} height={base - topo} fill="url(#ar-azul)" opacity={0.85} />
      <rect x={-rx} y={topo} width={rx * 2} height={base - topo} fill="none" stroke={CONT} strokeWidth={4} />
      <rect x={-rx * 0.55} y={topo} width={rx * 0.3} height={base - topo} fill="#e8fbff" opacity={0.45} />
      {[0.3, 0.6].map((f) => <rect key={f} x={-rx - 6} y={topo + (base - topo) * f - 7} width={rx * 2 + 12} height={14} rx={5} fill="#8c97a8" stroke={CONT} strokeWidth={3} />)}
      <ellipse cx={0} cy={base} rx={rx} ry={ry} fill="#7fd9ff" stroke={CONT} strokeWidth={3} opacity={0.9} />
      {/* tampa */}
      <ellipse cx={0} cy={topo} rx={rx * 1.25} ry={ry * 1.25} fill="#6b788b" stroke={CONT} strokeWidth={4} />
      <ellipse cx={0} cy={topo - 4} rx={rx * 0.8} ry={ry * 0.8} fill="#b9f1ff" stroke={CONT} strokeWidth={2} />
    </>
  );
}
function monitores(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 8)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#3b4555" stroke={CONT} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => {
        const cw = (w - 22) / 2, chh = (h * 0.7 - 22) / 2;
        const x = -w / 2 + 8 + (i % 2) * (cw + 6), y = -h / 2 + 8 + Math.floor(i / 2) * (chh + 6);
        return <g key={i}><rect x={x} y={y} width={cw} height={chh} rx={4} fill="url(#ar-tela)" stroke="#4fe3ff" strokeWidth={2} /><rect x={x + 4} y={y + chh * 0.55} width={cw * 0.4} height={chh * 0.3} fill="#9ff2ff" opacity={0.25} /></g>;
      })}
      <rect x={-w / 2 + 8} y={h * 0.25} width={w - 16} height={h * 0.16} rx={4} fill="#262e3a" />
      <circle cx={w * 0.55} cy={h * 0.1} r={w * 0.22} fill="#59647a" stroke={CONT} strokeWidth={3} />
    </>
  );
}
function rack(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 6)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#2b333f" stroke={CONT} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={-w / 2 + 7} y={-h / 2 + 8 + i * (h - 16) / 5} width={w - 14} height={(h - 16) / 5 - 5} rx={2} fill="#1b2029" /><circle cx={w / 2 - 12} cy={-h / 2 + 8 + i * (h - 16) / 5 + 6} r={3} fill={i % 2 ? '#5dff8a' : '#ffd84d'} /></g>)}
    </>
  );
}
function scannerMed(w: number) {
  const r = w * 0.42;
  return (
    <>
      <ellipse cx={6} cy={12} rx={r * 1.05} ry={r * 0.7} fill="#000" opacity={0.25} />
      <ellipse cx={0} cy={8} rx={r} ry={r * 0.66} fill="#5c6878" stroke={CONT} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.66} fill="#c9d2dc" stroke={CONT} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={r * 0.72} ry={r * 0.47} fill="#26303b" />
      <ellipse cx={0} cy={0} rx={r * 0.62} ry={r * 0.4} fill="url(#ar-verde)" opacity={0.9} />
      <ellipse cx={0} cy={0} rx={r * 0.78} ry={r * 0.52} fill="none" stroke="#7dff9b" strokeWidth={3} opacity={0.8} />
      <rect x={r * 0.8} y={-r * 0.85} width={r * 0.42} height={r * 0.7} rx={6} fill="#3b4555" stroke={CONT} strokeWidth={3} />
      <rect x={r * 0.86} y={-r * 0.78} width={r * 0.3} height={r * 0.3} rx={3} fill="url(#ar-tela)" />
    </>
  );
}
function camaMed(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 12)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill="#4a5666" stroke={CONT} strokeWidth={4} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} rx={9} fill="#f2f8fa" />
      <rect x={-w * 0.12} y={-h / 2 + 6} width={w * 0.56} height={h - 12} rx={8} fill="#5fb7d6" />
      <rect x={-w / 2 + 10} y={-h / 2 + 11} width={w * 0.22} height={h - 22} rx={9} fill="#fff" stroke="#c5dce3" strokeWidth={2} />
    </>
  );
}
function amostras(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 8)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#c9d2dc" stroke={CONT} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-w / 2 + 9 + i * (w - 18) / 4} y={-h * 0.25} width={(w - 18) / 4 - 4} height={h * 0.5} rx={5} fill={['#7dff9b', '#4fe3ff', '#ff8f8f', '#ffd84d'][i]} stroke={CONT} strokeWidth={2} />)}
    </>
  );
}
function painelEletrico(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 6)}
      {[0, 1, 2].map((i) => {
        const pw = (w - 8) / 3;
        const x = -w / 2 + i * (pw + 4);
        return (
          <g key={i}>
            <rect x={x} y={-h / 2} width={pw} height={h} rx={5} fill="#5d6b7c" stroke={CONT} strokeWidth={3} />
            <rect x={x + 6} y={-h / 2 + 6} width={pw - 12} height={h * 0.55} rx={3} fill="#26303b" />
            {[0, 1, 2].map((k) => <circle key={k} cx={x + 12 + k * (pw - 24) / 2} cy={-h / 2 + 6 + h * 0.27} r={4} fill={['#ff5d5d', '#ffd84d', '#5dff8a'][(i + k) % 3]} />)}
            <path d={`M${x + pw * 0.3} ${h / 2} q0 18 ${pw * 0.2} 30`} stroke={['#ff5d5d', '#4fe3ff', '#ffd84d'][i]} strokeWidth={5} fill="none" />
          </g>
        );
      })}
    </>
  );
}
function distribuidor(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 6)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#6a7686" stroke={CONT} strokeWidth={3} />
      {[0, 1, 2].map((i) => <g key={i}><circle cx={0} cy={-h / 2 + h * (0.2 + i * 0.3)} r={w * 0.26} fill="#26303b" stroke={CONT} strokeWidth={2} /><line x1={0} y1={-h / 2 + h * (0.2 + i * 0.3)} x2={w * 0.18} y2={-h / 2 + h * (0.2 + i * 0.3) - w * 0.12} stroke={['#ffd84d', '#4fe3ff', '#ff5d5d'][i]} strokeWidth={4} /></g>)}
    </>
  );
}
function cabos(w: number, h: number) {
  const cores = ['#ff5d5d', '#4fe3ff', '#ffd84d', '#c77dff'];
  return (
    <>
      {cores.map((c, i) => (
        <path key={c} d={`M${-w / 2} ${-h / 2 + i * h / 4 + 6} C${-w / 4} ${-h / 2 + i * h / 4 + 26} ${w / 4} ${h / 2 - i * h / 5 - 18} ${w / 2} ${-h / 2 + ((i + 2) % 4) * h / 4 + 6}`} stroke="#141921" strokeWidth={8} fill="none" opacity={0.7} />
      ))}
      {cores.map((c, i) => (
        <path key={`c${c}`} d={`M${-w / 2} ${-h / 2 + i * h / 4 + 6} C${-w / 4} ${-h / 2 + i * h / 4 + 26} ${w / 4} ${h / 2 - i * h / 5 - 18} ${w / 2} ${-h / 2 + ((i + 2) % 4) * h / 4 + 6}`} stroke={c} strokeWidth={4} fill="none" />
      ))}
    </>
  );
}
function mesaAdmin(w: number, h: number) {
  return (
    <>
      {sombra(w, h, h / 2)}
      <rect x={-w / 2} y={-h / 2 + 10} width={w} height={h - 10} rx={h * 0.4} fill="#3b4555" stroke={CONT} strokeWidth={4} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h - 12} rx={h * 0.4} fill="#4d5a6b" stroke={CONT} strokeWidth={4} />
      <rect x={-w / 2 + 12} y={-h / 2 + 10} width={w - 24} height={h - 32} rx={h * 0.3} fill="#0e2b2f" />
      {/* holograma do mapa da nave */}
      <path d={`M${-w * 0.33} ${-h * 0.12} h${w * 0.18} v${-h * 0.14} h${w * 0.22} v${h * 0.14} h${w * 0.12} v${h * 0.24} h${-w * 0.2} v${h * 0.08} h${-w * 0.2} v${-h * 0.08} h${-w * 0.12} Z`} fill="#7dffb0" fillOpacity={0.35} stroke="#c8ffe0" strokeWidth={2} />
      <ellipse cx={0} cy={-h * 0.04} rx={w * 0.42} ry={h * 0.32} fill="url(#ar-verde)" opacity={0.28} />
    </>
  );
}
function leitorCartao(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 6)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#8c97a8" stroke={CONT} strokeWidth={3} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h * 0.3} rx={2} fill="#1b2029" />
      <rect x={-w * 0.25} y={0} width={w * 0.5} height={h * 0.3} rx={3} fill="#ffd84d" stroke={CONT} strokeWidth={2} />
    </>
  );
}
function cadeiraArmas(w: number, h: number) {
  const r = h * 0.42;
  return (
    <>
      <ellipse cx={8} cy={12} rx={w * 0.48} ry={h * 0.46} fill="#000" opacity={0.25} />
      {/* canhão atravessando a parede */}
      <rect x={-w * 0.08} y={-h / 2 - 20} width={w * 0.16} height={h * 0.5} rx={8} fill="#6b788b" stroke={CONT} strokeWidth={4} />
      <circle cx={0} cy={-h * 0.05} r={r} fill="#2d3644" stroke={CONT} strokeWidth={5} />
      <circle cx={0} cy={-h * 0.05} r={r * 0.78} fill="url(#ar-tela)" stroke="#4fe3ff" strokeWidth={3} />
      <circle cx={0} cy={-h * 0.05} r={r * 0.38} fill="none" stroke="#4fe3ff" strokeWidth={2} opacity={0.8} />
      <line x1={-r * 0.7} x2={r * 0.7} y1={-h * 0.05} y2={-h * 0.05} stroke="#4fe3ff" strokeWidth={2} />
      <line x1={0} x2={0} y1={-h * 0.05 - r * 0.7} y2={-h * 0.05 + r * 0.7} stroke="#4fe3ff" strokeWidth={2} />
      <circle cx={r * 0.3} cy={-h * 0.18} r={6} fill="#ff5d5d" />
      {/* assento do artilheiro */}
      <rect x={-w * 0.22} y={h * 0.26} width={w * 0.44} height={h * 0.24} rx={14} fill="#c0392b" stroke={CONT} strokeWidth={4} />
      <rect x={-w * 0.16} y={h * 0.3} width={w * 0.32} height={h * 0.08} rx={6} fill="#ff7b6b" opacity={0.6} />
    </>
  );
}
function jardineira(w: number, h: number) {
  const n = Math.max(3, Math.round(w / 40));
  return (
    <>
      {sombra(w, h, 10)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#8a6a48" stroke={CONT} strokeWidth={3} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h - 12} rx={6} fill="#4a3522" />
      {Array.from({length: n}, (_, i) => {
        const x = -w / 2 + (i + 0.5) * (w / n);
        return (
          <g key={i} transform={`translate(${x} ${-h * 0.18})`}>
            {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx={h * 0.32} cy={0} rx={h * 0.34} ry={h * 0.14} transform={`rotate(${a + i * 17})`} fill={['#3fbf6a', '#2e9e55', '#5fd98a'][(a / 60 + i) % 3]} stroke="#1d5b33" strokeWidth={1.5} />)}
          </g>
        );
      })}
    </>
  );
}
function tanquesO2(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 10)}
      {[-0.28, 0, 0.28].map((f, i) => (
        <g key={i}>
          <rect x={f * w - w * 0.13} y={-h / 2} width={w * 0.26} height={h} rx={w * 0.13} fill={['#d8e6ef', '#9fd8ff', '#d8e6ef'][i]} stroke={CONT} strokeWidth={3} />
          <rect x={f * w - w * 0.07} y={-h / 2 + 8} width={w * 0.05} height={h - 24} rx={3} fill="#fff" opacity={0.7} />
          <rect x={f * w - w * 0.13} y={-h * 0.05} width={w * 0.26} height={h * 0.12} fill="#2f9ee0" />
        </g>
      ))}
    </>
  );
}
function filtroO2(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 8)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#7f8c9c" stroke={CONT} strokeWidth={3} />
      {Array.from({length: 6}, (_, i) => <rect key={i} x={-w / 2 + 8 + i * (w - 16) / 6} y={-h / 2 + 8} width={(w - 16) / 6 - 4} height={h - 16} rx={3} fill="#3e4a58" />)}
      <circle cx={w / 2 - 14} cy={-h / 2 + 12} r={5} fill="#7dff9b" />
    </>
  );
}
function janelaNav(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 20)}
      {/* janela para o espaço, com estrelas */}
      <path d={`M${-w / 2} ${-h * 0.1} Q${-w / 2} ${-h / 2} 0 ${-h / 2} Q${w / 2} ${-h / 2} ${w / 2} ${-h * 0.1} L${w / 2} ${h * 0.12} L${-w / 2} ${h * 0.12} Z`} fill="#06081a" stroke="#8c97a8" strokeWidth={8} />
      {Array.from({length: 18}, (_, i) => <circle key={i} cx={-w * 0.42 + ((i * 53) % 100) / 100 * w * 0.84} cy={-h * 0.38 + ((i * 37) % 100) / 100 * h * 0.44} r={i % 4 ? 1.8 : 3} fill="#fff" opacity={0.85} />)}
      <circle cx={w * 0.22} cy={-h * 0.22} r={h * 0.07} fill="#ffb15c" opacity={0.9} />
      {/* painel e cadeira do piloto */}
      <rect x={-w / 2 + 6} y={h * 0.12} width={w - 12} height={h * 0.18} rx={8} fill="#4d5a6b" stroke={CONT} strokeWidth={4} />
      {[-0.28, 0, 0.28].map((f) => <rect key={f} x={f * w - w * 0.1} y={h * 0.15} width={w * 0.2} height={h * 0.09} rx={3} fill="url(#ar-tela)" stroke="#5dffa0" strokeWidth={1.5} />)}
      <rect x={-w * 0.17} y={h * 0.34} width={w * 0.34} height={h * 0.16} rx={14} fill="#3f6fd6" stroke={CONT} strokeWidth={4} />
    </>
  );
}
function painelNav(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 10)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#4d5a6b" stroke={CONT} strokeWidth={3} />
      <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16} rx={6} fill="#0e2033" />
      <path d={`M${-w * 0.35} ${h * 0.15} Q${-w * 0.1} ${-h * 0.35} ${w * 0.1} ${h * 0.05} T${w * 0.36} ${-h * 0.2}`} stroke="#5dffa0" strokeWidth={3} fill="none" strokeDasharray="8 6" />
      <circle cx={w * 0.36} cy={-h * 0.2} r={6} fill="#ffd84d" />
    </>
  );
}
const hexagono = (rad: number) => Array.from({length: 6}, (_, i) => `${rad * Math.cos((Math.PI / 3) * i + Math.PI / 6)},${rad * Math.sin((Math.PI / 3) * i + Math.PI / 6)}`).join(' ');
function hexEscudos(w: number, h: number) {
  const r = Math.min(w, h) * 0.2;
  const centros = [[0, 0], [r * 1.75, 0], [-r * 1.75, 0], [r * 0.87, -r * 1.5], [-r * 0.87, -r * 1.5], [r * 0.87, r * 1.5], [-r * 0.87, r * 1.5]];
  return (
    <>
      <ellipse cx={8} cy={12} rx={w * 0.5} ry={h * 0.48} fill="#000" opacity={0.22} />
      {centros.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <polygon points={hexagono(r)} fill="#24425a" stroke={CONT} strokeWidth={4} />
          <polygon points={hexagono(r * 0.72)} fill={i % 3 === 0 ? '#54d8ff' : '#2f86b0'} opacity={0.75} />
          <polygon points={hexagono(r * 0.72)} fill="none" stroke="#bff3ff" strokeWidth={2} />
        </g>
      ))}
    </>
  );
}
function gerador(w: number, h: number) {
  return (
    <>
      <ellipse cx={6} cy={10} rx={w * 0.48} ry={h * 0.44} fill="#000" opacity={0.25} />
      <circle r={w * 0.45} fill="#6b788b" stroke={CONT} strokeWidth={4} />
      <circle r={w * 0.32} fill="#24425a" stroke={CONT} strokeWidth={3} />
      <circle r={w * 0.18} fill="#54d8ff" />
      {[0, 90, 180, 270].map((a) => <rect key={a} x={w * 0.36} y={-5} width={w * 0.12} height={10} rx={3} fill="#3a4556" transform={`rotate(${a})`} />)}
    </>
  );
}
function radar(w: number) {
  const r = w * 0.42;
  return (
    <>
      <ellipse cx={6} cy={12} rx={r * 1.05} ry={r * 0.95} fill="#000" opacity={0.25} />
      <rect x={-r * 0.25} y={r * 0.2} width={r * 0.5} height={r * 0.8} rx={8} fill="#4c5664" stroke={CONT} strokeWidth={3} />
      <circle cx={0} cy={-r * 0.08} r={r} fill="#d6dde6" stroke={CONT} strokeWidth={5} />
      <circle cx={0} cy={-r * 0.08} r={r * 0.72} fill="#b3bdc9" stroke="#8792a1" strokeWidth={3} />
      <circle cx={0} cy={-r * 0.08} r={r * 0.42} fill="none" stroke="#eef3f8" strokeWidth={4} />
      <line x1={0} y1={-r * 0.08} x2={r * 0.55} y2={-r * 0.62} stroke="#2b3440" strokeWidth={6} />
      <circle cx={r * 0.55} cy={-r * 0.62} r={r * 0.1} fill="#ff5d5d" stroke={CONT} strokeWidth={2} />
    </>
  );
}
function mesaComms(w: number, h: number) {
  return (
    <>
      {sombra(w, h, 8)}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#56637a" stroke={CONT} strokeWidth={3} />
      <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w * 0.45} height={h - 16} rx={4} fill="url(#ar-tela)" stroke="#4fe3ff" strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={w * 0.05 + i * (w * 0.38) / 5} y={-h * 0.2} width={6} height={h * 0.4 * (0.4 + ((i * 37) % 10) / 16)} fill="#5dff8a" />)}
      <path d={`M${w * 0.15} ${h * 0.32} a ${w * 0.09} ${w * 0.09} 0 0 1 ${w * 0.18} 0`} stroke="#1b2029" strokeWidth={6} fill="none" />
    </>
  );
}
function pilhaCaixas(w: number, h: number, v = 0) {
  const caixa = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y})`}>
      <rect x={-s / 2 + 4} y={-s / 2 + 6} width={s} height={s} rx={5} fill="#000" opacity={0.28} />
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={5} fill={k % 2 ? '#b98a52' : '#c99a5e'} stroke="#3b2a1a" strokeWidth={3} />
      <rect x={-s / 2 + 6} y={-s / 2 + 6} width={s - 12} height={s - 12} rx={2} fill="none" stroke="#6b4a26" strokeWidth={2.5} />
      <line x1={-s / 2 + 6} y1={-s / 2 + 6} x2={s / 2 - 6} y2={s / 2 - 6} stroke="#6b4a26" strokeWidth={4} />
      <rect x={-s * 0.12} y={-s / 2} width={s * 0.24} height={s} fill="#2f6bd6" opacity={k === 2 ? 0.8 : 0} />
    </g>
  );
  const s = w * 0.48;
  return v ? <>{caixa(-s * 0.52, s * 0.25, s, 0)}{caixa(s * 0.5, s * 0.25, s, 1)}{caixa(0, -s * 0.5, s, 2)}</> : <>{caixa(-s * 0.52, -s * 0.5, s, 0)}{caixa(s * 0.5, -s * 0.5, s, 1)}{caixa(-s * 0.52, s * 0.52, s, 2)}{caixa(s * 0.5, s * 0.52, s, 3)}</>;
}
function barris(w: number, h: number) {
  return (
    <>
      {[-0.3, 0, 0.3].map((f, i) => (
        <g key={i} transform={`translate(${f * w} ${i === 1 ? -h * 0.1 : h * 0.08})`}>
          <ellipse cx={4} cy={h * 0.36} rx={w * 0.16} ry={h * 0.16} fill="#000" opacity={0.28} />
          <rect x={-w * 0.15} y={-h * 0.38} width={w * 0.3} height={h * 0.72} rx={10} fill={['#d9534f', '#3e8ed0', '#d9534f'][i]} stroke={CONT} strokeWidth={3} />
          <ellipse cx={0} cy={-h * 0.38} rx={w * 0.15} ry={h * 0.12} fill="#c0c8d2" stroke={CONT} strokeWidth={3} />
          <rect x={-w * 0.15} y={-h * 0.05} width={w * 0.3} height={6} fill="#000" opacity={0.3} />
        </g>
      ))}
    </>
  );
}
function galoes(w: number, h: number) {
  return (
    <>
      {[-0.25, 0.25].map((f, i) => (
        <g key={i} transform={`translate(${f * w} 0)`}>
          <rect x={-w * 0.2 + 4} y={-h * 0.4 + 6} width={w * 0.4} height={h * 0.8} rx={8} fill="#000" opacity={0.28} />
          <rect x={-w * 0.2} y={-h * 0.4} width={w * 0.4} height={h * 0.8} rx={8} fill="#e8b23a" stroke={CONT} strokeWidth={3} />
          <rect x={w * 0.02} y={-h * 0.52} width={w * 0.12} height={h * 0.16} rx={3} fill="#4c5664" stroke={CONT} strokeWidth={2} />
          <path d={`M${-w * 0.12} ${-h * 0.15} l${w * 0.24} ${h * 0.3} M${w * 0.12} ${-h * 0.15} l${-w * 0.24} ${h * 0.3}`} stroke="#8a5a12" strokeWidth={3} />
        </g>
      ))}
    </>
  );
}

export const DESENHOS: Record<string, (w: number, h: number, v?: number) => React.ReactNode> = {
  mesaRedonda: (w) => mesaRedonda(w), mesaBotao: (w) => mesaBotao(w), balcao, motorGrande, canos, reatorNucleo, monitores, rack,
  scannerMed: (w) => scannerMed(w), camaMed, amostras, painelEletrico, distribuidor, cabos, mesaAdmin, leitorCartao, cadeiraArmas,
  jardineira, tanquesO2, filtroO2, janelaNav, painelNav, hexEscudos, gerador, radar: (w) => radar(w), mesaComms, pilhaCaixas, barris, galoes,
};

export const Props3: React.FC = React.memo(() => (
  <>
    {props3Absolutos().map((p, i) => (
      <g key={i} transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot ?? 0})`}>{DESENHOS[p.tipo]?.(p.pw, p.ph, p.v)}</g>
    ))}
  </>
));

// terminal de tarefa do Among Us 3: maior, encostado na parede, com o contorno amarelo do jogo
export function consoleTarefa3(x: number, y: number, chave: string) {
  const w = 58, h = 44;
  return (
    <g key={chave} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} rx={9} fill="none" stroke="#ffd84d" strokeWidth={10} opacity={0.18} />
      <rect x={-w / 2 + 4} y={-h / 2 + 7} width={w} height={h} rx={7} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={7} fill="#4d5a6b" stroke="#ffd84d" strokeWidth={3.5} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h * 0.5} rx={3} fill="url(#ar-tela)" />
      {[0, 1, 2].map((i) => <circle key={i} cx={-w / 2 + 14 + i * 14} cy={h / 2 - 9} r={3.5} fill={['#5dff8a', '#ffd84d', '#ff5d5d'][i]} />)}
    </g>
  );
}

// ---------------------------------------------------------------- parede alta e objetos pequenos (Among Us 3)
export const FACE_V3 = 56;
const celula = (c: number, r: number) => (c < 0 || r < 0 || r >= NAVE.rows ? ' ' : NAVE.grid[r].charAt(c) || ' ');
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
type Pt = {x: number; y: number};
const distRet = (p: Pt, cx: number, cy: number, w: number, h: number) =>
  Math.hypot(Math.max(Math.abs(p.x - cx) - w / 2, 0), Math.max(Math.abs(p.y - cy) - h / 2, 0));
const distSeg = (p: Pt, a: Pt, b: Pt) => {
  const vx = b.x - a.x, vy = b.y - a.y, L = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L));
  return Math.hypot(p.x - a.x - t * vx, p.y - a.y - t * vy);
};

// Decoração da face da parede de cima de cada sala: janelas para o espaço (parede do casco), painéis com luzes,
// grades de ventilação, faixas de aviso e canos. Pula a coluna do console de tarefa e do duto.
export function decorParedes() {
  const out: {tipo: string; x: number; y: number; w: number}[] = [];
  for (const s of SALAS_ORDEM) {
    const d = NAVE.salas[s], {c, r, w} = d.rect;
    const ocupado = [...d.consoles, ...(d.duto ? [d.duto] : [])].filter((q) => q.y < (r + 1.6) * TILE).map((q) => q.x / TILE);
    // objetos grandes encostados na parede de cima (topo a menos de 2 casas dela) também tapam a face
    const encostados = LAYOUT3[s].filter((p) => p.y - p.h / 2 < 2).map((p) => [c + p.x - p.w / 2, c + p.x + p.w / 2]);
    const livre = (c0: number, c1: number) => {
      for (let cc = c0; cc <= c1; cc++) if (celula(cc, r - 1) !== '#' || celula(cc, r) === 'D') return false;
      if (encostados.some(([x0, x1]) => x0 < c1 + 1.3 && x1 > c0 - 0.3)) return false;
      return ocupado.every((ox) => ox < c0 - 0.6 || ox > c1 + 1.6);
    };
    let i = 0;
    for (let cc = c + 1; cc < c + w - 1;) {
      const casco = celula(cc, r - 2) === ' ' && celula(cc + 1, r - 2) === ' ';
      const tipo = casco && i % 3 !== 2 ? 'janela' : ['painelLuzes', 'grade', 'aviso', 'canoV', 'painelLuzes'][Math.floor(hash(cc, r) * 5)];
      const largura = tipo === 'janela' ? 2 : tipo === 'canoV' ? 1 : 2;
      if (cc + largura <= c + w - 1 && livre(cc, cc + largura - 1) && (i++ % 2 === 0 || casco)) {
        out.push({tipo, x: cc * TILE, y: r * TILE, w: largura * TILE});
        cc += largura + 1;
      } else cc += 1;
    }
  }
  return out;
}

function decorSvg(tipo: string, w: number) {
  const h = FACE_V3 - 10;
  switch (tipo) {
    case 'janela':
      return (
        <>
          <rect x={6} y={6} width={w - 12} height={h - 4} rx={8} fill="#05070f" stroke="#1a2130" strokeWidth={4} />
          {[0.2, 0.55, 0.8, 0.35, 0.7].map((f, k) => <circle key={k} cx={10 + f * (w - 20)} cy={12 + ((k * 37) % 26)} r={k % 2 ? 1.6 : 1.1} fill="#fff" opacity={0.85} />)}
          <path d={`M${10} ${h} L${w * 0.45} ${10}`} stroke="#9fd4ff" strokeWidth={3} opacity={0.18} />
        </>
      );
    case 'painelLuzes':
      return (
        <>
          <rect x={8} y={6} width={w - 16} height={h - 6} rx={4} fill="#3a4554" stroke="#141a22" strokeWidth={2.5} />
          <rect x={14} y={11} width={w * 0.45} height={h * 0.4} rx={2} fill="url(#ar-tela)" />
          {[0, 1, 2].map((k) => <circle key={k} cx={w * 0.66 + k * 9} cy={16} r={3} fill={['#5dff8a', '#ffd84d', '#ff5d5d'][k]} />)}
          <rect x={14} y={h - 10} width={w - 28} height={4} rx={2} fill="#141a22" />
        </>
      );
    case 'grade':
      return (
        <>
          <rect x={10} y={8} width={w - 20} height={h - 10} rx={4} fill="#262d37" stroke="#141a22" strokeWidth={2.5} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={16} y={13 + k * 7.5} width={w - 32} height={3.5} rx={1.5} fill="#0e1218" />)}
        </>
      );
    case 'aviso':
      return (
        <>
          <rect x={6} y={h - 12} width={w - 12} height={10} fill="#e8b23a" />
          {Array.from({length: Math.floor((w - 12) / 14)}, (_, k) => <path key={k} d={`M${10 + k * 14} ${h - 2} l8 -10 h6 l-8 10 z`} fill="#1a1a1a" />)}
          <rect x={w / 2 - 14} y={6} width={28} height={22} rx={3} fill="#e8b23a" stroke="#1a1a1a" strokeWidth={2} />
          <path d={`M${w / 2} 10 l8 14 h-16 z`} fill="none" stroke="#1a1a1a" strokeWidth={2.5} />
        </>
      );
    default: // canoV
      return (
        <>
          <rect x={w / 2 - 8} y={-4} width={16} height={h + 8} fill="#8b95a3" stroke="#141a22" strokeWidth={2.5} />
          <rect x={w / 2 - 11} y={h * 0.35} width={22} height={7} rx={2} fill="#5d6673" stroke="#141a22" strokeWidth={2} />
          <rect x={w / 2 - 4} y={-4} width={3} height={h + 8} fill="#fff" opacity={0.25} />
        </>
      );
  }
}

export const DecorParedes: React.FC = React.memo(() => (
  <>{decorParedes().map((d, i) => <g key={i} transform={`translate(${d.x} ${d.y})`}>{decorSvg(d.tipo, d.w)}</g>)}</>
));

// Objetos pequenos encostados nas paredes (caixas, lixeiras, extintores, armários, vasos): só onde não atrapalham
// os lugares de parada, os consoles, o duto, as portas, os objetos grandes nem o caminho das portas até os pontos.
const ENTULHO_SALA: Partial<Record<Sala, string[]>> = {
  Refeitorio: ['lixeira', 'vaso', 'lixeira', 'caixaP'], Enfermaria: ['armario', 'vaso', 'lixeira'],
  Eletrica: ['caixaP', 'extintor', 'armario', 'caixaP'], Deposito: ['caixaP', 'caixaP', 'barril', 'caixaP'],
  MotorSuperior: ['caixaP', 'extintor', 'barril'], MotorInferior: ['caixaP', 'extintor', 'barril'], Reator: ['extintor', 'caixaP', 'barril'],
  Seguranca: ['armario', 'lixeira'], Admin: ['vaso', 'arquivo', 'lixeira'], Armas: ['caixaP', 'armario', 'extintor'],
  O2: ['vaso', 'extintor', 'vaso'], Navegacao: ['vaso', 'arquivo', 'extintor'], Escudos: ['caixaP', 'extintor', 'armario'],
  Comunicacoes: ['arquivo', 'lixeira', 'caixaP'],
};

export function entulho() {
  const out: {tipo: string; x: number; y: number; sala: Sala}[] = [];
  const grandes = props3Absolutos();
  for (const s of SALAS_ORDEM) {
    const d = NAVE.salas[s], {c, r, w, h} = d.rect;
    const portas: Pt[] = [];
    for (let rr = r - 1; rr <= r + h; rr++) for (let cc = c - 1; cc <= c + w; cc++) if (celula(cc, rr) === 'D') portas.push({x: (cc + 0.5) * TILE, y: (rr + 0.5) * TILE});
    const alvos = [...d.spots, ...d.consoles];
    const rotas: [Pt, Pt][] = [];
    for (const pt of portas) for (const a of alvos) {
      const cam = [pt, ...caminho(pt, a)];
      for (let k = 1; k < cam.length; k++) rotas.push([cam[k - 1], cam[k]]);
    }
    const cand: Pt[] = [];
    for (let rr = r + 1; rr < r + h; rr++) for (let cc = c; cc < c + w; cc++) {
      const encosta = celula(cc - 1, rr) === '#' || celula(cc + 1, rr) === '#' || celula(cc, rr + 1) === '#';
      if (encosta && celula(cc, rr) === '.') cand.push({x: (cc + 0.5) * TILE, y: (rr + 0.5) * TILE});
    }
    cand.sort((a, b) => hash(a.x, a.y) - hash(b.x, b.y));
    const tipos = ENTULHO_SALA[s] ?? ['caixaP'];
    const max = Math.min(7, Math.round((w * h) / 26));
    const meus: Pt[] = [];
    const T = TILE;
    for (const p of cand) {
      if (meus.length >= max) break;
      if (alvos.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1.25 * T)) continue;
      if (d.duto && Math.hypot(d.duto.x - p.x, d.duto.y - p.y) < 1.4 * T) continue;
      if (portas.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 2.4 * T)) continue;
      if (grandes.some((g) => g.sala === s && distRet(p, g.cx, g.cy, g.pw, g.ph) < 0.9 * T)) continue;
      if (rotas.some(([a, b]) => distSeg(p, a, b) < 0.85 * T)) continue;
      if (meus.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 2.2 * T)) continue;
      meus.push(p);
      out.push({tipo: tipos[out.length % tipos.length], x: p.x, y: p.y, sala: s});
    }
  }
  return out;
}

function entulhoSvg(tipo: string) {
  const s = TILE * 1.05;
  switch (tipo) {
    case 'lixeira':
      return (<>
        <ellipse cx={4} cy={s * 0.42} rx={s * 0.32} ry={s * 0.12} fill="#000" opacity={0.3} />
        <path d={`M${-s * 0.3} ${-s * 0.3} L${-s * 0.24} ${s * 0.4} H${s * 0.24} L${s * 0.3} ${-s * 0.3} Z`} fill="#6f7b8a" stroke={CONT} strokeWidth={3} />
        <ellipse cx={0} cy={-s * 0.3} rx={s * 0.32} ry={s * 0.1} fill="#a7b1bd" stroke={CONT} strokeWidth={3} />
        <path d={`M${-s * 0.1} ${-s * 0.15} V${s * 0.3} M${s * 0.1} ${-s * 0.15} V${s * 0.3}`} stroke="#4a5462" strokeWidth={3} />
      </>);
    case 'vaso':
      return (<>
        <ellipse cx={4} cy={s * 0.42} rx={s * 0.3} ry={s * 0.1} fill="#000" opacity={0.3} />
        {[-0.5, -0.15, 0.2, 0.5].map((a, k) => <ellipse key={k} cx={Math.sin(a * 3) * s * 0.22} cy={-s * 0.2 - Math.cos(a) * s * 0.12} rx={s * 0.16} ry={s * 0.28} transform={`rotate(${a * 60} ${Math.sin(a * 3) * s * 0.22} ${-s * 0.2})`} fill={k % 2 ? '#3fae57' : '#2f8f45'} stroke={CONT} strokeWidth={2.5} />)}
        <path d={`M${-s * 0.24} ${s * 0.05} L${-s * 0.18} ${s * 0.42} H${s * 0.18} L${s * 0.24} ${s * 0.05} Z`} fill="#c56a3d" stroke={CONT} strokeWidth={3} />
      </>);
    case 'extintor':
      return (<>
        <ellipse cx={4} cy={s * 0.42} rx={s * 0.2} ry={s * 0.08} fill="#000" opacity={0.3} />
        <rect x={-s * 0.15} y={-s * 0.28} width={s * 0.3} height={s * 0.7} rx={s * 0.14} fill="#d9343a" stroke={CONT} strokeWidth={3} />
        <rect x={-s * 0.07} y={-s * 0.42} width={s * 0.14} height={s * 0.16} fill="#30363f" stroke={CONT} strokeWidth={2} />
        <path d={`M${s * 0.06} ${-s * 0.36} q${s * 0.2} 0 ${s * 0.18} ${s * 0.3}`} fill="none" stroke="#30363f" strokeWidth={3} />
        <rect x={-s * 0.15} y={0} width={s * 0.3} height={s * 0.1} fill="#fff" opacity={0.75} />
      </>);
    case 'armario':
      return (<>
        <rect x={-s * 0.36 + 4} y={-s * 0.55 + 6} width={s * 0.72} height={s * 1.0} rx={4} fill="#000" opacity={0.3} />
        <rect x={-s * 0.36} y={-s * 0.55} width={s * 0.72} height={s * 1.0} rx={4} fill="#7e8a99" stroke={CONT} strokeWidth={3} />
        <path d={`M0 ${-s * 0.55} V${s * 0.45}`} stroke={CONT} strokeWidth={2.5} />
        {[-1, 1].map((k) => <g key={k}>{[0, 1, 2].map((j) => <rect key={j} x={k * s * 0.18 - s * 0.1} y={-s * 0.45 + j * 6} width={s * 0.2} height={2.5} fill="#3d4652" />)}<rect x={k * s * 0.06 - 2} y={-s * 0.05} width={4} height={10} rx={2} fill="#d0d6dd" /></g>)}
      </>);
    case 'arquivo':
      return (<>
        <rect x={-s * 0.3 + 4} y={-s * 0.45 + 6} width={s * 0.6} height={s * 0.85} rx={3} fill="#000" opacity={0.3} />
        <rect x={-s * 0.3} y={-s * 0.45} width={s * 0.6} height={s * 0.85} rx={3} fill="#9aa5b2" stroke={CONT} strokeWidth={3} />
        {[0, 1, 2].map((j) => <g key={j}><rect x={-s * 0.24} y={-s * 0.4 + j * s * 0.27} width={s * 0.48} height={s * 0.22} rx={2} fill="#b8c1cc" stroke="#55606d" strokeWidth={1.5} /><rect x={-5} y={-s * 0.32 + j * s * 0.27} width={10} height={3} rx={1.5} fill="#30363f" /></g>)}
      </>);
    case 'barril':
      return (<>
        <ellipse cx={4} cy={s * 0.4} rx={s * 0.3} ry={s * 0.1} fill="#000" opacity={0.3} />
        <rect x={-s * 0.28} y={-s * 0.32} width={s * 0.56} height={s * 0.7} rx={8} fill="#3e8ed0" stroke={CONT} strokeWidth={3} />
        <ellipse cx={0} cy={-s * 0.32} rx={s * 0.28} ry={s * 0.11} fill="#c0c8d2" stroke={CONT} strokeWidth={3} />
        <rect x={-s * 0.28} y={0} width={s * 0.56} height={5} fill="#000" opacity={0.3} />
      </>);
    default: // caixaP
      return (<>
        <rect x={-s * 0.38 + 4} y={-s * 0.38 + 6} width={s * 0.76} height={s * 0.76} rx={4} fill="#000" opacity={0.3} />
        <rect x={-s * 0.38} y={-s * 0.38} width={s * 0.76} height={s * 0.76} rx={4} fill="#c99a5e" stroke="#3b2a1a" strokeWidth={3} />
        <rect x={-s * 0.3} y={-s * 0.3} width={s * 0.6} height={s * 0.6} rx={2} fill="none" stroke="#6b4a26" strokeWidth={2} />
        <path d={`M${-s * 0.3} ${-s * 0.3} L${s * 0.3} ${s * 0.3}`} stroke="#6b4a26" strokeWidth={3} />
      </>);
  }
}

export const Entulho: React.FC = React.memo(() => (
  <>{entulho().map((e, i) => <g key={i} transform={`translate(${e.x} ${e.y})`}>{entulhoSvg(e.tipo)}</g>)}</>
));
