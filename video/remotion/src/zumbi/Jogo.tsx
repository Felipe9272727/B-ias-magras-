// Uma partida do modo zumbi desenhada a partir do log real (amongus/logs_zumbi/partidaN.json):
// o intervalo entre o fim do tique n-1 e o fim do tique n mostra o tique n: as mordidas, tasers, curas e transformações
// acontecem no começo (como no motor, antes de qualquer um sair da sala) e depois cada um anda pelos corredores reais
// até a sala nova. Câmera suave (média dos alvos num intervalo), segue uma sala, uma cor ou mostra o mapa todo.
import React, {useMemo} from 'react';
import {ArteMira, CamadaViva} from './ArteMira';
import {aoLongo, caminho, centro, MUNDO, SALAS, spotN, type Pt, type SalaId} from './mapaMira';
import {Personagem, type Estado} from './Personagem';

export type EstadoJ = {cor: string; sala: SalaId; estado: Estado; tipo: string | null; atordoado: boolean; salvo: boolean; viraEm: number | null};
export type Tique = {tique: number; radio: number; resgateEm: number | null; barricadas: Record<string, {vida: number; ate: number}>; estados: EstadoJ[]};
export type Evento = {tique: number; tipo: string; [k: string]: unknown};
export type Log = {jogadores: {cor: string; modelo: string; papel: string; pacienteZero: boolean}[]; tiques: Tique[]; eventos: Evento[]; cfg: {amanhecer: number; radioMeta: number}; resultado: unknown};
export type Cam = {sala?: SalaId; cor?: string; mapa?: boolean; zoom?: number};

const W = 1920, H = 1080;
const MOVE = [0.35, 0.85]; // parte do tique em que se anda
const estadosEm = (log: Log, n: number) => log.tiques[Math.max(0, Math.min(log.tiques.length - 1, n - 1))].estados;
// lugares de todos num tique (cada um numa célula própria da sala), com memória por tique
const LUGARES = new WeakMap<EstadoJ[], Map<string, Pt>>();
function lugares(es: EstadoJ[]): Map<string, Pt> {
  let m = LUGARES.get(es);
  if (m) return m;
  m = new Map();
  const por: Record<string, string[]> = {};
  for (const e of es) (por[e.sala] ??= []).push(e.cor);
  for (const [sala, cores] of Object.entries(por)) cores.forEach((c, i) => m!.set(c, spotN(sala as SalaId, i, cores.length)));
  LUGARES.set(es, m);
  return m;
}

// posição de cada cor no tempo T (tique fracionário)
export function posicoes(log: Log, T: number) {
  const n = Math.max(1, Math.ceil(T));
  const k = T - (n - 1);
  const A = n <= 1 ? estadosEm(log, 1) : estadosEm(log, n - 1);
  const B = estadosEm(log, n);
  return B.map((b, i) => {
    const a = A[i];
    const pa = lugares(A).get(b.cor)!, pb = lugares(B).get(b.cor)!;
    let p: Pt = pa, andando = false, virado = false;
    if (a.sala !== b.sala) {
      const m = Math.max(0, Math.min(1, (k - MOVE[0]) / (MOVE[1] - MOVE[0])));
      const pts = caminho(a.sala, b.sala, pa, pb);
      p = aoLongo(pts, m * m * (3 - 2 * m));
      const q = aoLongo(pts, Math.min(1, m + 0.02));
      andando = m > 0 && m < 1;
      virado = q.x < p.x - 0.5;
    } else {
      // mesma sala: desliza devagar do lugar antigo para o novo (quando alguém entra ou sai, a sala se rearruma)
      const m = Math.max(0, Math.min(1, (k - MOVE[0]) / (MOVE[1] - MOVE[0])));
      const e = m * m * (3 - 2 * m);
      p = {x: pa.x + (pb.x - pa.x) * e, y: pa.y + (pb.y - pa.y) * e};
      andando = Math.hypot(pb.x - pa.x, pb.y - pa.y) > 20 && m > 0 && m < 1;
    }
    const estado: Estado = k < 0.3 && a.estado !== 'zumbi' ? (a.estado as Estado) : (b.estado as Estado);
    return {cor: b.cor, p, andando, virado, estado, tipo: estado === 'zumbi' ? b.tipo : null, atordoado: b.atordoado && k > 0.3, salvo: b.salvo && k > 0.9, sala: k < 0.6 ? a.sala : b.sala};
  });
}

function alvoCam(log: Log, T: number, cam: Cam): {x: number; y: number; s: number} {
  const fit = Math.min(W / MUNDO.w, H / MUNDO.h);
  if (cam.mapa || (!cam.sala && !cam.cor)) return {x: MUNDO.w / 2, y: MUNDO.h / 2, s: fit * (cam.zoom ?? 1)};
  const s = 0.62 * (cam.zoom ?? 1.6);
  if (cam.sala) return {...centro(cam.sala), s};
  const p = posicoes(log, T).find((x) => x.cor === cam.cor)?.p ?? {x: MUNDO.w / 2, y: MUNDO.h / 2};
  return {x: p.x, y: p.y - 60, s};
}

// ---------- efeitos dos eventos ----------
const pos = (log: Log, T: number, cor?: unknown) => posicoes(log, T).find((x) => x.cor === cor)?.p;

const Fx: React.FC<{log: Log; T: number; f: number}> = ({log, T, f}) => {
  const n = Math.max(1, Math.ceil(T));
  const k = T - (n - 1);
  const evs = log.eventos.filter((e) => e.tique === n);
  return (
    <>
      {evs.map((e, i) => {
        const p = pos(log, T, e.alvo ?? e.cor ?? e.zumbi);
        if (!p && e.tipo !== 'barricada_quebrou') return null;
        const vida = Math.max(0, Math.min(1, (k - 0.08) / 0.5));
        if (vida <= 0 || vida >= 1) return null;
        const a = 1 - vida;
        switch (e.tipo) {
          case 'mordida':
          case 'mordida_imune':
            return (
              <div key={i} style={{position: 'absolute', left: p!.x - 90, top: p!.y - 190, width: 180, height: 180, transform: `scale(${0.6 + vida})`, opacity: a}}>
                <svg viewBox="-50 -50 100 100" width={180} height={180}>
                  <circle r={44} fill={e.tipo === 'mordida' ? '#ff2a2a55' : '#ffffff33'} />
                  {[-22, -8, 6, 20].map((x) => <path key={x} d={`M${x - 5} -14 L${x} -2 L${x + 5} -14 Z M${x - 5} 14 L${x} 2 L${x + 5} 14 Z`} fill="#fff" stroke="#000" strokeWidth={2.5} />)}
                </svg>
                <div style={{position: 'absolute', top: -20, width: '100%', textAlign: 'center', font: '900 34px Inter, Arial', color: e.tipo === 'mordida' ? '#ff4a3a' : '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{e.tipo === 'mordida' ? (e.como === 'cuspe' ? 'CUSPE!' : 'NHAC!') : 'IMUNE?!'}</div>
              </div>
            );
          case 'virou_zumbi':
            return (
              <svg key={i} width={420} height={420} viewBox="-100 -100 200 200" style={{position: 'absolute', left: p!.x - 210, top: p!.y - 270, opacity: a}}>
                {Array.from({length: 14}).map((_, j) => { const an = (j / 14) * Math.PI * 2; const r = 30 + vida * 70; return <circle key={j} cx={r * Math.cos(an)} cy={r * Math.sin(an)} r={14 * a + 4} fill="#7dff4a" opacity={0.7} />; })}
                <circle r={40 * vida + 10} fill="none" stroke="#b6ff5a" strokeWidth={10 * a} />
              </svg>
            );
          case 'atordoou': {
            const q = pos(log, T, e.por);
            if (!q) return null;
            const d = `M${q.x} ${q.y - 70} L${(q.x + p!.x) / 2 + 20} ${(q.y + p!.y) / 2 - 90} L${(q.x + p!.x) / 2 - 10} ${(q.y + p!.y) / 2 - 60} L${p!.x} ${p!.y - 70}`;
            return (
              <svg key={i} width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, opacity: f % 4 < 2 ? a : a * 0.5}}>
                <path d={d} stroke={e.como === 'uv' ? '#c48aff' : '#7ae8ff'} strokeWidth={22} fill="none" opacity={0.4} />
                <path d={d} stroke="#fff" strokeWidth={7} fill="none" />
              </svg>
            );
          }
          case 'cura':
            return (
              <svg key={i} width={200} height={200} viewBox="-50 -50 100 100" style={{position: 'absolute', left: p!.x - 100, top: p!.y - 230 - vida * 40, opacity: a}}>
                <path d="M-10 -30 H10 V-10 H30 V10 H10 V30 H-10 V10 H-30 V-10 H-10 Z" fill="#4aff8a" stroke="#000" strokeWidth={4} />
              </svg>
            );
          case 'uivo':
            return (
              <svg key={i} width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: p!.x - 450, top: p!.y - 510, opacity: a}}>
                {[0, 1, 2].map((j) => <circle key={j} r={((vida * 300 + j * 100) % 400) + 20} fill="none" stroke="#c9b8ff" strokeWidth={12} opacity={0.6} />)}
              </svg>
            );
          case 'barricada_quebrou': {
            const s = SALAS[e.sala as SalaId];
            return s ? <div key={i} style={{position: 'absolute', left: s.porta.x - 80, top: s.porta.y - 120, font: '900 40px Inter, Arial', color: '#ffb04a', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.8 + vida * 0.6})`}}>CRASH!</div> : null;
          }
          default:
            return null;
        }
      })}
    </>
  );
};

// tábuas pregadas na porta de cada sala com barricada (racham conforme perdem vida)
const Barricadas: React.FC<{t: Tique}> = ({t}) => (
  <>
    {Object.entries(t.barricadas ?? {}).map(([sala, b]) => {
      const s = SALAS[sala as SalaId];
      if (!s) return null;
      return (
        <svg key={sala} width={220} height={220} viewBox="-110 -110 220 220" style={{position: 'absolute', left: s.porta.x - 110, top: s.porta.y - 110}}>
          {[-50, 0, 50].map((y, j) => (
            <g key={j} transform={`rotate(${j % 2 ? -14 : 12})`}>
              <rect x={-95} y={y - 16} width={190} height={32} rx={6} fill="#a8743a" stroke="#000" strokeWidth={6} />
              {b.vida < 2 && j === 1 ? <path d={`M-10 ${y - 16} L4 ${y} L-6 ${y + 16}`} stroke="#000" strokeWidth={5} fill="none" /> : null}
              <circle cx={-78} cy={y} r={5} fill="#555" /><circle cx={78} cy={y} r={5} fill="#555" />
            </g>
          ))}
        </svg>
      );
    })}
  </>
);

export const Jogo: React.FC<{log: Log; T: number; cam: Cam; f: number; foco?: string; amostras?: number}> = ({log, T, cam, f, foco}) => {
  // câmera: média dos alvos num intervalo curto, para não dar trancos
  const c = useMemo(() => {
    let x = 0, y = 0, s = 0;
    const N = 9;
    for (let i = 0; i < N; i++) { const a = alvoCam(log, Math.max(0, T + (i - (N - 1) / 2) * 0.04), cam); x += a.x; y += a.y; s += a.s; }
    return {x: x / N, y: y / N, s: s / N};
  }, [log, T, cam]);
  const ps = posicoes(log, T).filter((p) => !p.salvo).sort((a, b) => a.p.y - b.p.y);
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(T) - 1))];
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0b0820'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${W / 2 - c.x * c.s}px, ${H / 2 - c.y * c.s}px) scale(${c.s})`}}>
        <ArteMira />
        <CamadaViva f={f} />
        <Barricadas t={tq} />
        {ps.map((p) => (
          <div key={p.cor} style={{position: 'absolute', left: p.p.x, top: p.p.y}}>
            <Personagem cor={p.cor} estado={p.estado} f={f + p.cor.length * 7} s={p.tipo === 'Grande' ? 150 : 108} andando={p.andando} virado={p.virado} atordoado={p.atordoado} destaque={foco === p.cor} />
          </div>
        ))}
        <Fx log={log} T={T} f={f} />
      </div>
      {/* vinheta noturna */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, #05020dcc 100%)', pointerEvents: 'none'}} />
    </div>
  );
};
