// Arte da nave (estilo The Skeld, desenho próprio). Tudo em px de mundo: a grade tem
// NAVE.cols x NAVE.rows células de TILE px. O desenho estático é montado uma vez (React.memo +
// useMemo) e agrupado em poucos <path> por cor, para manter o DOM pequeno. Só o alerta do
// reator muda a cada quadro.
import React, {useMemo} from 'react';
import {NAVE} from './mapa';
import {SALAS_ORDEM, TILE, type Prop, type Sala} from './spec';

const COLS = NAVE.cols;
const ROWS = NAVE.rows;
const W = COLS * TILE;
const H = ROWS * TILE;

const FACE = 30; // altura visível da face frontal da parede (px), que cai sobre o piso de baixo
const CONTORNO = 7; // espessura do contorno escuro da casca (px)
const CONTORNO_COR = '#0b0d14';
const PAREDE_PADRAO = '#7a8594'; // face frontal quando o piso de baixo é corredor
const TOPO_PADRAO = '#4b5563';
const TOPO_CASCO = '#3a4250'; // topo de parede que dá para o espaço

// Retângulo como subcaminho (um <path> guarda milhares deles)
const R = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

// Acumula subcaminhos por cor: cada cor vira um único <path>
class Tintas {
  private m = new Map<string, string>();
  add(cor: string, d: string) { this.m.set(cor, (this.m.get(cor) ?? '') + d); }
  entradas(): [string, string][] { return [...this.m.entries()]; }
}

// Leitura da grade (fora do mapa = espaço)
const ch = (c: number, r: number): string =>
  c < 0 || r < 0 || c >= COLS || r >= ROWS ? ' ' : NAVE.grid[r].charAt(c) || ' ';
const ehParede = (c: number, r: number) => ch(c, r) === '#';
const ehFora = (c: number, r: number) => ch(c, r) === ' ';
const ehPisoAberto = (c: number, r: number) => {
  const k = ch(c, r);
  return k === '.' || k === ',' || k === 'D';
};

// Sala dona de cada célula de piso (null em corredor, porta e parede)
const SALA_DE: (Sala | null)[] = new Array(COLS * ROWS).fill(null);
for (const s of SALAS_ORDEM) {
  const {c, r, w, h} = NAVE.salas[s].rect;
  for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) SALA_DE[y * COLS + x] = s;
}
const salaEm = (c: number, r: number): Sala | null =>
  c < 0 || r < 0 || c >= COLS || r >= ROWS ? null : SALA_DE[r * COLS + c];

// Ruído determinístico por célula, entre 0 e 1 (mesmo resultado a cada render)
function ruido(c: number, r: number): number {
  let n = Math.imul(c, 374761393) ^ Math.imul(r, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

// Gradientes e padrões compartilhados (ids com prefixo 'ar-' para não colidir com outros SVGs)
function Definicoes(): React.ReactNode {
  return (
    <>
      <linearGradient id="ar-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b9c3cf" /><stop offset="0.5" stopColor="#7e8896" /><stop offset="1" stopColor="#4f5865" />
      </linearGradient>
      <linearGradient id="ar-metal-esc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a8491" /><stop offset="0.6" stopColor="#4a5260" /><stop offset="1" stopColor="#2a313c" />
      </linearGradient>
      <linearGradient id="ar-madeira" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c99762" /><stop offset="1" stopColor="#8a5d37" />
      </linearGradient>
      <linearGradient id="ar-mesa" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6f9fc" /><stop offset="1" stopColor="#b9c6d4" />
      </linearGradient>
      <linearGradient id="ar-tela" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#173d50" /><stop offset="1" stopColor="#2a7896" />
      </linearGradient>
      <radialGradient id="ar-botao" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#ffd9d2" /><stop offset="0.45" stopColor="#ff4a3d" />
        <stop offset="0.85" stopColor="#b3151b" /><stop offset="1" stopColor="#6a0a0e" />
      </radialGradient>
      <radialGradient id="ar-laranja">
        <stop offset="0" stopColor="#fff6d0" stopOpacity={1} />
        <stop offset="0.28" stopColor="#ffbb44" stopOpacity={0.95} />
        <stop offset="0.6" stopColor="#ff6a12" stopOpacity={0.85} />
        <stop offset="1" stopColor="#ff3b00" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="ar-azul">
        <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
        <stop offset="0.2" stopColor="#bfeeff" stopOpacity={1} />
        <stop offset="0.5" stopColor="#3fa6ff" stopOpacity={0.9} />
        <stop offset="0.8" stopColor="#1d4fb8" stopOpacity={0.35} />
        <stop offset="1" stopColor="#1d4fb8" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="ar-verde">
        <stop offset="0" stopColor="#f2fff6" stopOpacity={1} />
        <stop offset="0.32" stopColor="#8dffa8" stopOpacity={0.95} />
        <stop offset="0.62" stopColor="#2fe07a" stopOpacity={0.8} />
        <stop offset="1" stopColor="#2fe07a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="ar-ciano">
        <stop offset="0" stopColor="#ecfdff" stopOpacity={1} />
        <stop offset="0.35" stopColor="#63e6ff" stopOpacity={0.9} />
        <stop offset="0.7" stopColor="#1aa9d6" stopOpacity={0.5} />
        <stop offset="1" stopColor="#1aa9d6" stopOpacity={0} />
      </radialGradient>
      {/* Piso de corredor: chapas de metal com rebites e nervuras de grade */}
      <pattern id="ar-corr" patternUnits="userSpaceOnUse" width={TILE} height={TILE}>
        <rect width={TILE} height={TILE} fill="#5f6873" />
        <rect width={TILE} height={1.5} fill="#8e99a6" />
        <rect width={1.5} height={TILE} fill="#8e99a6" />
        <rect x={TILE - 2} width={2} height={TILE} fill="#2a3038" />
        <rect y={TILE - 2} width={TILE} height={2} fill="#2a3038" />
        {[14, 20, 28, 34].map((x) => (
          <g key={x}>
            <rect x={x} y={9} width={1.6} height={30} fill="#2a3038" opacity={0.4} />
            <rect x={x + 1.6} y={9} width={0.8} height={30} fill="#b5bfcc" opacity={0.18} />
          </g>
        ))}
        {[[7, 7], [41, 7], [7, 41], [41, 41]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={2.2} fill="#3b4450" />
            <circle cx={x - 0.6} cy={y - 0.6} r={0.8} fill="#d3dae3" opacity={0.6} />
          </g>
        ))}
      </pattern>
      {/* Piso de sala: ladrilhos com rejunte (piso2) e bisel, uma trama por sala */}
      {SALAS_ORDEM.map((s) => {
        const t = NAVE.salas[s].tema;
        return (
          <pattern key={s} id={`ar-pis-${s}`} patternUnits="userSpaceOnUse" width={TILE} height={TILE}>
            <rect width={TILE} height={TILE} fill={t.piso} />
            <rect x={5} y={5} width={TILE - 10} height={TILE - 10} rx={3} fill="none" stroke={t.piso2} strokeWidth={1} opacity={0.35} />
            <rect x={TILE - 2} width={2} height={TILE} fill={t.piso2} />
            <rect y={TILE - 2} width={TILE} height={2} fill={t.piso2} />
            <rect width={TILE} height={1.5} fill="#ffffff" opacity={0.12} />
            <rect width={1.5} height={TILE} fill="#ffffff" opacity={0.08} />
          </pattern>
        );
      })}
    </>
  );
}

// Monta o desenho estático inteiro (chamado uma vez)
function montarCena(): React.ReactNode {
  const salas = NAVE.salas;
  let contorno = '';
  const pisoSala = new Map<Sala, string>();
  let pisoCorr = '';
  let varEscura = '';
  let varClara = '';
  let sombraA = '';
  let sombraB = '';
  let barrasEscuras = '';
  let barrasClaras = '';
  const faces = new Tintas();
  let juntasFace = '';
  let bordaFace = '';
  let brilhoFace = '';
  const topos = new Tintas();
  let brilhoTopo = '';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const k = ch(c, r);
      if (k === ' ') continue;
      const x = c * TILE, y = r * TILE;
      // silhueta escura: cada célula da nave é dilatada; só aparece onde a casca encosta no espaço
      contorno += R(x - CONTORNO, y - CONTORNO, TILE + 2 * CONTORNO, TILE + 2 * CONTORNO);

      if (k === '#') {
        // Cor da parede: a sala vizinha (prefere a de baixo, onde a face aparece)
        const vizinhos: [number, number][] = [[c, r + 1], [c, r - 1], [c - 1, r], [c + 1, r]];
        let salaPar: Sala | null = null;
        for (const [vc, vr] of vizinhos) {
          const sv = salaEm(vc, vr);
          if (sv) { salaPar = sv; break; }
        }
        const casco = vizinhos.some(([vc, vr]) => ehFora(vc, vr));
        topos.add(salaPar ? salas[salaPar].tema.paredeTopo : casco ? TOPO_CASCO : TOPO_PADRAO, R(x, y, TILE, TILE));
        brilhoTopo += R(x, y, TILE, 3);
        // Face frontal: só quando o piso de baixo é andável (a face "olha" para a sala)
        if (ehPisoAberto(c, r + 1)) {
          const sb = salaEm(c, r + 1);
          faces.add(sb ? salas[sb].tema.parede : PAREDE_PADRAO, R(x, y + TILE, TILE, FACE));
          juntasFace += R(x, y + TILE, 1.5, FACE);
          bordaFace += R(x, y + TILE + FACE - 3, TILE, 3);
          brilhoFace += R(x, y + TILE, TILE, 2);
        }
        continue;
      }

      // Piso: sala (trama própria), corredor e porta (chapa de metal)
      const s = k === '.' ? salaEm(c, r) : null;
      const quad = R(x, y, TILE, TILE);
      if (s) pisoSala.set(s, (pisoSala.get(s) ?? '') + quad);
      else pisoCorr += quad;

      // Variação sutil por ladrilho
      const h = ruido(c, r);
      if (h < 0.2) varEscura += quad;
      else if (h > 0.85) varClara += quad;

      // Sombra suave do piso junto às paredes (a de cima começa abaixo da face)
      if (ehParede(c, r - 1)) { sombraA += R(x, y + FACE, TILE, 8); sombraB += R(x, y + FACE + 8, TILE, 14); }
      if (ehParede(c - 1, r)) { sombraA += R(x, y, 8, TILE); sombraB += R(x + 8, y, 14, TILE); }
      if (ehParede(c + 1, r)) { sombraA += R(x + TILE - 8, y, 8, TILE); sombraB += R(x + TILE - 22, y, 14, TILE); }
      if (ehParede(c, r + 1)) { sombraA += R(x, y + TILE - 8, TILE, 8); sombraB += R(x, y + TILE - 22, TILE, 14); }

      // Soleira: barras de metal nas bordas da porta que dão para piso aberto
      if (k === 'D') {
        const aberto = (vc: number, vr: number) => ehPisoAberto(vc, vr) && ch(vc, vr) !== 'D';
        if (aberto(c, r - 1)) { barrasEscuras += R(x, y, TILE, 9); barrasClaras += R(x, y + 2, TILE, 5); }
        if (aberto(c, r + 1)) { barrasEscuras += R(x, y + TILE - 9, TILE, 9); barrasClaras += R(x, y + TILE - 7, TILE, 5); }
        if (aberto(c - 1, r)) { barrasEscuras += R(x, y, 9, TILE); barrasClaras += R(x + 2, y, 5, TILE); }
        if (aberto(c + 1, r)) { barrasEscuras += R(x + TILE - 9, y, 9, TILE); barrasClaras += R(x + TILE - 7, y, 5, TILE); }
      }
    }
  }

  // Nome da sala: sinalização discreta no piso, logo abaixo da face da parede de cima
  const rotulos = SALAS_ORDEM.map((s) => {
    const {c, r} = salas[s].rect;
    return (
      <text key={`t-${s}`} x={c * TILE + 22} y={r * TILE + FACE + 34} fill="#ffffff" opacity={0.3}
        fontSize={24} fontWeight={800} fontFamily="Arial, Helvetica, sans-serif" style={{letterSpacing: 4}}>
        {salas[s].nome.toUpperCase()}
      </text>
    );
  });

  // Props de todas as salas
  const props = SALAS_ORDEM.flatMap((s) => salas[s].props.map((p, i) => propSvg(p, `${s}-${i}`)));

  // Consoles de tarefa (contorno amarelo) e dutos
  const consoles = SALAS_ORDEM.flatMap((s) => salas[s].consoles.map((p, i) => consoleTarefa(p.x, p.y, `${s}-c${i}`)));
  const dutos = SALAS_ORDEM.flatMap((s) => {
    const d = salas[s].duto;
    return d ? [duto(d.x, d.y, `${s}-d`)] : [];
  });

  return (
    <>
      <defs>
        <Definicoes />
      </defs>
      <path d={contorno} fill={CONTORNO_COR} />
      {SALAS_ORDEM.map((s) => {
        const d = pisoSala.get(s);
        return d ? <path key={s} d={d} fill={`url(#ar-pis-${s})`} /> : null;
      })}
      <path d={pisoCorr} fill="url(#ar-corr)" />
      <path d={varEscura} fill="#000" opacity={0.07} />
      <path d={varClara} fill="#fff" opacity={0.045} />
      <path d={sombraA} fill="#000" opacity={0.24} />
      <path d={sombraB} fill="#000" opacity={0.1} />
      <path d={barrasEscuras} fill="#161b23" />
      <path d={barrasClaras} fill="#cfd8e2" />
      {faces.entradas().map(([cor, d]) => <path key={`f-${cor}`} d={d} fill={cor} />)}
      <path d={juntasFace} fill="#000" opacity={0.28} />
      <path d={brilhoFace} fill="#fff" opacity={0.14} />
      <path d={bordaFace} fill={CONTORNO_COR} opacity={0.7} />
      {topos.entradas().map(([cor, d]) => <path key={`t-${cor}`} d={d} fill={cor} />)}
      <path d={brilhoTopo} fill="#fff" opacity={0.14} />
      {rotulos}
      {props}
      {consoles}
      {dutos}
    </>
  );
}

// Componente memorizado: o desenho é montado uma vez e não refaz trabalho a cada quadro
const Estatico = React.memo(function Estatico() {
  const cena = useMemo(() => montarCena(), []);
  return <>{cena}</>;
});

// ---------------------------------------------------------------------------
// Props: desenhados em coordenadas locais centradas em (0,0), com tamanho w x h
// ---------------------------------------------------------------------------

function propSvg(p: Prop, chave: string): React.ReactNode {
  const {w, h} = p;
  let corpo: React.ReactNode;
  switch (p.tipo) {
    case 'mesa': corpo = mesa(w, h); break;
    case 'botao': corpo = botao(w, h); break;
    case 'motor': corpo = motor(w, h); break;
    case 'reator': corpo = reator(w, h); break;
    case 'painel': corpo = painel(w, h, Math.round(p.x + p.y)); break;
    case 'caixa': corpo = caixa(w, h); break;
    case 'cama': corpo = cama(w, h); break;
    case 'scanner': corpo = scanner(w, h); break;
    case 'monitor': corpo = monitor(w, h); break;
    case 'planta': corpo = planta(w, h); break;
    case 'mapa': corpo = mapaHolo(w, h); break;
    case 'antena': corpo = antena(w, h); break;
    case 'escudo': corpo = escudo(w, h); break;
    case 'leme': corpo = leme(w, h); break;
    case 'canhao': corpo = canhao(w, h); break;
    case 'cano': corpo = cano(w, h); break;
    case 'armario': corpo = armario(w, h); break;
    case 'banco': corpo = banco(w, h); break;
    default: corpo = consoleGenerico(w, h); break;
  }
  return <g key={chave} transform={`translate(${p.x} ${p.y}) rotate(${p.rot ?? 0})`}>{corpo}</g>;
}

// Mesa de cafeteria: redonda com bancos nos quatro lados; retangular com bancos nos lados longos
function mesa(w: number, h: number) {
  if (Math.abs(w - h) < 12) {
    const r = Math.min(w, h) / 2;
    return (
      <>
        <circle cx={5} cy={7} r={r * 1.05} fill="#000" opacity={0.3} />
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <rect x={-r * 0.44} y={r * 0.84} width={r * 0.88} height={r * 0.36} rx={r * 0.16} fill="#5a6676" stroke="#1b2029" strokeWidth={2.5} />
            <rect x={-r * 0.34} y={r * 0.9} width={r * 0.68} height={r * 0.07} rx={3} fill="#9aa6b6" opacity={0.6} />
          </g>
        ))}
        <circle r={r} fill="#2b333e" stroke="#12161d" strokeWidth={3} />
        <circle r={r * 0.9} fill="url(#ar-mesa)" />
        <circle r={r * 0.5} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} />
        <circle r={r * 0.14} fill="#2b333e" />
      </>
    );
  }
  const horiz = w >= h;
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={14} fill="#000" opacity={0.3} />
      {horiz ? (
        <>
          <rect x={-w * 0.36} y={-h / 2 - h * 0.32} width={w * 0.72} height={h * 0.28} rx={8} fill="#5a6676" stroke="#1b2029" strokeWidth={2.5} />
          <rect x={-w * 0.36} y={h / 2 + h * 0.04} width={w * 0.72} height={h * 0.28} rx={8} fill="#5a6676" stroke="#1b2029" strokeWidth={2.5} />
        </>
      ) : (
        <>
          <rect x={-w / 2 - w * 0.32} y={-h * 0.36} width={w * 0.28} height={h * 0.72} rx={8} fill="#5a6676" stroke="#1b2029" strokeWidth={2.5} />
          <rect x={w / 2 + w * 0.04} y={-h * 0.36} width={w * 0.28} height={h * 0.72} rx={8} fill="#5a6676" stroke="#1b2029" strokeWidth={2.5} />
        </>
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="url(#ar-mesa)" stroke="#12161d" strokeWidth={3} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={9} fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={2} />
    </>
  );
}

// Botão de emergência: domo vermelho num pedestal, com anel amarelo
function botao(w: number, h: number) {
  const r = Math.min(w, h) * 0.3;
  return (
    <>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="url(#ar-metal-esc)" stroke="#12161d" strokeWidth={3} />
      <circle r={r * 1.35} fill="none" stroke="#ffd84d" strokeWidth={3} opacity={0.75} />
      <circle cx={2} cy={4} r={r} fill="#000" opacity={0.35} />
      <circle r={r} fill="url(#ar-botao)" />
      <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.32} ry={r * 0.18} fill="#ffffff" opacity={0.6} />
    </>
  );
}

// Motor: cilindro com ventilador e exaustão laranja que brilha para fora
function motor(w: number, h: number) {
  const r = Math.min(w, h) / 2;
  return (
    <>
      <circle cx={6} cy={8} r={r} fill="#000" opacity={0.3} />
      <circle cx={0} cy={r * 1.05} r={r * 0.75} fill="url(#ar-laranja)" />
      <circle r={r} fill="url(#ar-metal-esc)" stroke="#0e1218" strokeWidth={4} />
      <circle r={r * 0.74} fill="#2c343f" />
      {[0, 45, 90, 135].map((a) => (
        <ellipse key={a} rx={r * 0.6} ry={r * 0.1} fill="#8f9bab" transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.16} fill="#171c24" />
      <path d={`M${-r * 0.7} ${-r * 0.2} A${r * 0.75} ${r * 0.75} 0 0 1 ${-r * 0.2} ${-r * 0.72}`} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} fill="none" />
    </>
  );
}

// Reator: núcleo azul brilhante com anéis
function reator(w: number, h: number) {
  const r = Math.min(w, h) / 2;
  return (
    <>
      <circle cx={6} cy={8} r={r} fill="#000" opacity={0.3} />
      <circle r={r} fill="#1c2638" stroke="#0c1220" strokeWidth={4} />
      <circle r={r * 0.9} fill="none" stroke="#3a4f73" strokeWidth={r * 0.1} />
      <circle r={r * 0.8} fill="none" stroke="#2b3a55" strokeWidth={4} strokeDasharray={`${r * 0.22} ${r * 0.1}`} />
      <circle r={r * 0.7} fill="url(#ar-azul)" />
      <circle r={r * 0.5} fill="none" stroke="#8fe0ff" strokeWidth={2} opacity={0.6} />
      <circle r={r * 0.34} fill="url(#ar-azul)" />
      <circle r={r * 0.14} fill="#f4fbff" />
    </>
  );
}

// Painel elétrico: caixa com luzes e fios saindo por baixo
function painel(w: number, h: number, semente: number) {
  const cores = ['#5dff8a', '#ffd84d', '#ff5d5d', '#4fe3ff'];
  const colunas = Math.max(2, Math.floor((w - 16) / 13) + 1);
  const linhas = Math.max(1, Math.floor((h - 14) / 13) + 1);
  const x0 = -((colunas - 1) * 13) / 2, y0 = -((linhas - 1) * 13) / 2;
  const luzes: React.ReactNode[] = [];
  for (let i = 0; i < linhas; i++) for (let j = 0; j < colunas; j++) {
    luzes.push(<circle key={`${i}-${j}`} cx={x0 + j * 13} cy={y0 + i * 13} r={2.6} fill={cores[Math.abs(semente + i * 7 + j * 3) % cores.length]} />);
  }
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={5} fill="#000" opacity={0.3} />
      <path d={`M${-w * 0.3} ${h / 2} C${-w * 0.3} ${h / 2 + 14} ${w * 0.1} ${h / 2 + 10} ${w * 0.1} ${h / 2 + 24}`} stroke="#1b1f27" strokeWidth={4} fill="none" />
      <path d={`M${w * 0.25} ${h / 2} C${w * 0.25} ${h / 2 + 10} ${-w * 0.05} ${h / 2 + 8} ${-w * 0.05} ${h / 2 + 18}`} stroke="#1b1f27" strokeWidth={4} fill="none" />
      <path d={`M${-w * 0.3} ${h / 2} C${-w * 0.3} ${h / 2 + 14} ${w * 0.1} ${h / 2 + 10} ${w * 0.1} ${h / 2 + 24}`} stroke="#ffd84d" strokeWidth={1.5} fill="none" opacity={0.8} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="url(#ar-metal-esc)" stroke="#12161d" strokeWidth={2.5} />
      <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={3} fill="#20262f" />
      {luzes}
    </>
  );
}

// Caixa de carga: madeira com tábuas e reforço em X
function caixa(w: number, h: number) {
  const m = 6;
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={5} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="url(#ar-madeira)" stroke="#3b2a1a" strokeWidth={3} />
      <rect x={-w / 2 + m} y={-h / 2 + m} width={w - 2 * m} height={h - 2 * m} rx={2} fill="none" stroke="#5b3f22" strokeWidth={2.5} />
      <line x1={-w / 2 + m} y1={-h / 2 + m} x2={w / 2 - m} y2={h / 2 - m} stroke="#5b3f22" strokeWidth={4} />
      <line x1={w / 2 - m} y1={-h / 2 + m} x2={-w / 2 + m} y2={h / 2 - m} stroke="#5b3f22" strokeWidth={4} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
        <circle key={`${sx}${sy}`} cx={sx * (w / 2 - 10)} cy={sy * (h / 2 - 10)} r={2.5} fill="#2a1d10" />
      ))}
    </>
  );
}

// Cama da enfermaria: estrutura, colchão, cobertor e travesseiro
function cama(w: number, h: number) {
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#34404f" stroke="#131821" strokeWidth={3} />
      <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={8} fill="#eef7f6" />
      <rect x={-w * 0.08} y={-h / 2 + 5} width={w * 0.5 - 5} height={h - 10} rx={6} fill="#2ec4b6" />
      <rect x={-w * 0.08} y={-h / 2 + 5} width={w * 0.5 - 5} height={4} rx={2} fill="#ffffff" opacity={0.25} />
      <rect x={-w / 2 + 8} y={-h / 2 + 9} width={w * 0.22} height={h - 18} rx={7} fill="#ffffff" stroke="#c7e3df" strokeWidth={1.5} />
    </>
  );
}

// Scanner da enfermaria: disco no chão com brilho verde
function scanner(w: number, h: number) {
  return (
    <>
      <ellipse cx={5} cy={7} rx={w / 2} ry={h / 2} fill="#000" opacity={0.3} />
      <ellipse rx={w / 2} ry={h / 2} fill="#7f8c99" stroke="#262e39" strokeWidth={3} />
      <ellipse rx={w * 0.36} ry={h * 0.36} fill="#4e5b68" />
      <ellipse rx={w * 0.28} ry={h * 0.28} fill="url(#ar-verde)" />
      <ellipse rx={w * 0.4} ry={h * 0.4} fill="none" stroke="#7dff9b" strokeWidth={2} opacity={0.6} />
    </>
  );
}

// Mesa de segurança: duas telas empilhadas com linhas de varredura
function monitor(w: number, h: number) {
  const alt = (h - 24) / 2;
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={6} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#2b3440" stroke="#12161d" strokeWidth={3} />
      {[0, 1].map((i) => {
        const y = -h / 2 + 8 + i * (alt + 8);
        return (
          <g key={i}>
            <rect x={-w / 2 + 8} y={y} width={w - 16} height={alt} rx={3} fill="url(#ar-tela)" stroke="#4fe3ff" strokeWidth={1.5} />
            {[0.3, 0.55, 0.8].map((f) => (
              <line key={f} x1={-w / 2 + 12} x2={w / 2 - 12} y1={y + alt * f} y2={y + alt * f} stroke="#9ff2ff" strokeOpacity={0.18} strokeWidth={1.5} />
            ))}
          </g>
        );
      })}
    </>
  );
}

// Caixas de plantas do O2: folhas radiais em três tons de verde
function planta(w: number, h: number) {
  const folhas = [0, 1, 2, 3, 4, 5, 6];
  const tons = ['#3fbf6a', '#2e9e55', '#5fd98a'];
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={8} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#7a5a3c" stroke="#3b2a1a" strokeWidth={3} />
      <rect x={-w / 2 + 7} y={-h / 2 + 7} width={w - 14} height={h - 14} rx={4} fill="#3b2a1a" />
      {folhas.map((i) => (
        <g key={i} transform={`rotate(${(i * 360) / folhas.length + 12})`}>
          <ellipse cx={w * 0.22} cy={0} rx={w * 0.2} ry={w * 0.085} fill={tons[i % 3]} stroke="#1d5b33" strokeWidth={1.2} />
        </g>
      ))}
      <circle r={w * 0.1} fill="#2e8b4e" />
    </>
  );
}

// Mesa holográfica do admin: tampo escuro com mapa verde brilhante
function mapaHolo(w: number, h: number) {
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#1f3236" stroke="#0a1719" strokeWidth={3} />
      <rect x={-w / 2 + 8} y={-h / 2 + 8} width={w - 16} height={h - 16} rx={8} fill="#0f2a2c" />
      {[1, 2, 3, 4].map((i) => (
        <g key={i} stroke="#7dffb0" strokeOpacity={0.14} strokeWidth={1}>
          <line x1={-w / 2 + 8 + (i * (w - 16)) / 5} x2={-w / 2 + 8 + (i * (w - 16)) / 5} y1={-h / 2 + 8} y2={h / 2 - 8} />
          <line y1={-h / 2 + 8 + (i * (h - 16)) / 5} y2={-h / 2 + 8 + (i * (h - 16)) / 5} x1={-w / 2 + 8} x2={w / 2 - 8} />
        </g>
      ))}
      <path
        d={`M${-w * 0.3} ${-h * 0.2} Q${-w * 0.1} ${-h * 0.3} ${w * 0.05} ${-h * 0.18} T${w * 0.2} ${-h * 0.05} Q${w * 0.25} ${h * 0.1} ${w * 0.1} ${h * 0.2} Q${-w * 0.05} ${h * 0.28} ${-w * 0.2} ${h * 0.12} Z`}
        fill="#7dffb0" fillOpacity={0.4} stroke="#c8ffe0" strokeWidth={1.5}
      />
      <circle r={w * 0.42} fill="url(#ar-verde)" opacity={0.3} />
    </>
  );
}

// Antena de comunicações: prato com anéis e aro amarelo
function antena(w: number, h: number) {
  const r = Math.min(w, h) / 2;
  return (
    <>
      <circle cx={5} cy={7} r={r} fill="#000" opacity={0.3} />
      <circle r={r} fill="#c5cdd8" stroke="#262e39" strokeWidth={3} />
      <circle r={r * 0.72} fill="#8792a1" />
      <circle r={r * 0.45} fill="none" stroke="#eef3f8" strokeWidth={2.5} />
      <circle r={r * 0.2} fill="#2b3440" />
      <circle r={r * 0.9} fill="none" stroke="#ffd84d" strokeWidth={2} opacity={0.7} />
    </>
  );
}

// Hexágono de raio rad (vértices em pares x,y separados por espaço)
const hexagono = (rad: number) =>
  Array.from({length: 6}, (_, i) => `${rad * Math.cos((Math.PI / 3) * i)},${rad * Math.sin((Math.PI / 3) * i)}`).join(' ');

// Painel de escudo: hexágono com anel ciano e vértices luminosos
function escudo(w: number, h: number) {
  const r = Math.min(w, h) / 2;
  const vertices = Array.from({length: 6}, (_, i) => [r * 0.9 * Math.cos((Math.PI / 3) * i), r * 0.9 * Math.sin((Math.PI / 3) * i)]);
  return (
    <>
      <polygon points={hexagono(r)} transform="translate(5 7)" fill="#000" opacity={0.3} />
      <polygon points={hexagono(r)} fill="#2a4a5a" stroke="#0b1d26" strokeWidth={4} />
      <polygon points={hexagono(r * 0.72)} fill="#54d8ff" opacity={0.18} />
      <polygon points={hexagono(r * 0.72)} fill="none" stroke="#54d8ff" strokeWidth={3} />
      {vertices.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#dff9ff" />)}
      <circle r={r * 0.18} fill="#54d8ff" />
    </>
  );
}

// Leme / console de navegação: volante de metal sobre um painel com tela verde
function leme(w: number, h: number) {
  const r = Math.min(w, h) * 0.27;
  const cy = -h * 0.12;
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={12} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill="url(#ar-metal)" stroke="#12161d" strokeWidth={3} />
      <rect x={-w / 2 + 10} y={h / 2 - h * 0.3} width={w - 20} height={h * 0.22} rx={4} fill="url(#ar-tela)" stroke="#5dffa0" strokeWidth={1.5} />
      <circle cx={0} cy={cy} r={r} fill="none" stroke="#2b3440" strokeWidth={12} />
      <circle cx={0} cy={cy} r={r} fill="none" stroke="#d6dde6" strokeWidth={6} />
      {[-90, 30, 150].map((a) => (
        <line key={a} x1={0} y1={cy} x2={r * Math.cos((a * Math.PI) / 180)} y2={cy + r * Math.sin((a * Math.PI) / 180)} stroke="#d6dde6" strokeWidth={4} />
      ))}
      <circle cx={0} cy={cy} r={r * 0.25} fill="#e8edf3" />
    </>
  );
}

// Canhão: cadeira do artilheiro e console de mira com retículo
function canhao(w: number, h: number) {
  const r = Math.min(w, h) * 0.36;
  const cy = -h * 0.08;
  return (
    <>
      <rect x={-w * 0.3} y={h * 0.05} width={w * 0.6} height={h * 0.4} rx={w * 0.14} fill="#3b4452" stroke="#141a22" strokeWidth={3} />
      <circle cx={5} cy={cy + 7} r={r} fill="#000" opacity={0.3} />
      <circle cx={0} cy={cy} r={r} fill="#2d3644" stroke="#0e1218" strokeWidth={4} />
      <circle cx={0} cy={cy} r={r * 0.78} fill="none" stroke="#4fe3ff" strokeWidth={3} opacity={0.85} />
      <circle cx={0} cy={cy} r={r * 0.5} fill="url(#ar-ciano)" opacity={0.4} />
      <line x1={-r * 0.78} x2={r * 0.78} y1={cy} y2={cy} stroke="#4fe3ff" strokeWidth={1.5} opacity={0.7} />
      <line x1={0} x2={0} y1={cy - r * 0.78} y2={cy + r * 0.78} stroke="#4fe3ff" strokeWidth={1.5} opacity={0.7} />
      <circle cx={0} cy={cy} r={r * 0.08} fill="#ff5d5d" />
    </>
  );
}

// Cano: tubo metálico com flanges nas pontas e reflexo
function cano(w: number, h: number) {
  const horiz = w >= h;
  const L = Math.max(w, h), T = Math.min(w, h);
  return (
    <>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx={T / 2} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={T / 2} fill="#7d8897" stroke="#1b1f27" strokeWidth={2.5} />
      {horiz ? (
        <>
          <line x1={-L / 2 + 8} x2={L / 2 - 8} y1={-T * 0.22} y2={-T * 0.22} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
          <rect x={-L / 2} y={-T / 2 - 3} width={8} height={T + 6} fill="#4a5361" stroke="#1b1f27" strokeWidth={2} />
          <rect x={L / 2 - 8} y={-T / 2 - 3} width={8} height={T + 6} fill="#4a5361" stroke="#1b1f27" strokeWidth={2} />
        </>
      ) : (
        <>
          <line y1={-L / 2 + 8} y2={L / 2 - 8} x1={-T * 0.22} x2={-T * 0.22} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
          <rect y={-L / 2} x={-T / 2 - 3} height={8} width={T + 6} fill="#4a5361" stroke="#1b1f27" strokeWidth={2} />
          <rect y={L / 2 - 8} x={-T / 2 - 3} height={8} width={T + 6} fill="#4a5361" stroke="#1b1f27" strokeWidth={2} />
        </>
      )}
    </>
  );
}

// Armário: porta dupla com fresta de ventilação e puxadores
function armario(w: number, h: number) {
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={4} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#5b6c85" stroke="#1b2330" strokeWidth={3} />
      <line x1={0} x2={0} y1={-h / 2} y2={h / 2} stroke="#1b2330" strokeWidth={2.5} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-w / 2 + 6} x2={w / 2 - 6} y1={-h / 2 + 10 + i * 6} y2={-h / 2 + 10 + i * 6} stroke="#2e3a4c" strokeWidth={2} />
      ))}
      <circle cx={-6} cy={0} r={3} fill="#d6dde6" />
      <circle cx={6} cy={0} r={3} fill="#d6dde6" />
    </>
  );
}

// Banco: assento com ripas
function banco(w: number, h: number) {
  const horiz = w >= h;
  const ripas = [1, 2, 3].map((i) =>
    horiz
      ? <line key={i} x1={-w / 2 + (i * w) / 4} x2={-w / 2 + (i * w) / 4} y1={-h / 2 + 6} y2={h / 2 - 6} stroke="#4d5664" strokeWidth={3} />
      : <line key={i} y1={-h / 2 + (i * h) / 4} y2={-h / 2 + (i * h) / 4} x1={-w / 2 + 6} x2={w / 2 - 6} stroke="#4d5664" strokeWidth={3} />,
  );
  return (
    <>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#6e7a8b" stroke="#1b1f27" strokeWidth={3} />
      {ripas}
    </>
  );
}

// Console genérico (tipo desconhecido)
function consoleGenerico(w: number, h: number) {
  return (
    <>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={8} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#2b3440" stroke="#12161d" strokeWidth={3} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={h * 0.5} rx={3} fill="url(#ar-tela)" />
      <circle cx={-w / 4} cy={h / 4} r={3} fill="#5dffa0" />
      <circle cx={0} cy={h / 4} r={3} fill="#ffd84d" />
      <circle cx={w / 4} cy={h / 4} r={3} fill="#ff5d5d" />
    </>
  );
}

// Console de tarefa: pequeno terminal na parede com contorno amarelo (sutil)
function consoleTarefa(x: number, y: number, chave: string) {
  const w = 34, h = 26;
  return (
    <g key={chave} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="none" stroke="#ffd84d" strokeWidth={9} opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="#1d2430" stroke="#ffd84d" strokeWidth={2.5} />
      <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 14} rx={2} fill="url(#ar-tela)" />
      <circle cx={w / 2 - 6} cy={h / 2 - 5} r={2} fill="#ffd84d" />
    </g>
  );
}

// Saída de duto: grade metálica escura com ripas e parafusos
function duto(x: number, y: number, chave: string) {
  const w = 56, h = 40;
  return (
    <g key={chave} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 3} y={-h / 2 + 4} width={w} height={h} rx={5} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="#2a313c" stroke="#0b0d14" strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-w / 2 + 7} y={-h / 2 + 7 + i * 7} width={w - 14} height={3.5} rx={1.5} fill="#0f1319" />
      ))}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
        <circle key={`${sx}${sy}`} cx={sx * (w / 2 - 5)} cy={sy * (h / 2 - 5)} r={2.2} fill="#8a94a3" />
      ))}
    </g>
  );
}

// Nave completa: estática (memorizada) + alerta de reator por cima
export const Arte: React.FC<{alertaReator?: number}> = ({alertaReator = 0}) => (
  <svg
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
    style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
  >
    <Estatico />
    {alertaReator > 0 && (
      <rect x={0} y={0} width={W} height={H} fill="#ff1e1e" opacity={Math.min(1, alertaReator)} />
    )}
  </svg>
);
