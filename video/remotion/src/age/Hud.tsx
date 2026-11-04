// Interface no estilo do Age of Empires IV (painéis escuros com borda dourada), desenhada em SVG/CSS, sem emoji:
// barra de recursos do império em foco, placar das 6 IAs, minimapa, balão de pensamento secreto, chat, selos e tempo.
import React, {useMemo} from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {CORES_J, type Quadro, type Recurso} from './Mapa';

export const FONTE = "'Poppins', sans-serif";
const OURO = '#d9b45a';
const PAINEL: React.CSSProperties = {background: 'linear-gradient(#1d1a16f0, #12100df0)', border: `3px solid ${OURO}`, borderRadius: 10, boxShadow: '0 8px 24px #000a, inset 0 0 0 2px #0008'};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export type IA = {nome: string; modelo: string; empresa: string};
const FASE: Record<string, string> = {village: 'I', town: 'II', city: 'III'};

const IconeRec: React.FC<{r: string; s?: number}> = ({r, s = 34}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    {r === 'food' ? <g><ellipse cx="12" cy="13" rx="8" ry="7" fill="#d9463b" /><path d="M12 6 Q14 2 17 3" stroke="#3a7a2a" strokeWidth="2" fill="none" /></g> : null}
    {r === 'wood' ? <g><rect x="3" y="8" width="18" height="8" rx="4" fill="#8a5a2b" /><circle cx="19" cy="12" r="3.5" fill="#d8a96a" /><circle cx="19" cy="12" r="1.5" fill="#8a5a2b" /></g> : null}
    {r === 'stone' ? <path d="M3 18 L6 8 L12 5 L19 8 L21 18 Z" fill="#b8b8b0" stroke="#666" strokeWidth="1.2" /> : null}
    {r === 'metal' ? <g><path d="M3 18 L6 9 L12 6 L19 9 L21 18 Z" fill="#8a8578" /><path d="M8 12 L11 10 M13 14 L16 12 M9 16 L12 15" stroke="#f2cc4a" strokeWidth="2" /></g> : null}
    {r === 'pop' ? <g><circle cx="12" cy="7" r="4" fill="#e8d8b0" /><path d="M4 21 Q12 10 20 21 Z" fill="#e8d8b0" /></g> : null}
  </svg>
);

export const BarraRecursos: React.FC<{q: Quadro; j: number; ia: IA}> = ({q, j, ia}) => {
  const p = q.jogadores[j];
  if (!p) return null;
  return (
    <div style={{position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: 22, padding: '10px 26px', ...PAINEL, borderTop: 'none', borderLeft: 'none', borderRadius: '0 0 16px 0'}}>
      <div style={{width: 20, height: 44, background: CORES_J[j], borderRadius: 4, border: '2px solid #000'}} />
      <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff'}}>{ia.nome}</div>
      {(['food', 'wood', 'stone', 'metal'] as const).map((r) => (
        <div key={r} style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: '#f3ead2'}}><IconeRec r={r} />{p.rec[r]}</div>
      ))}
      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: '#f3ead2'}}><IconeRec r="pop" />{p.pop}/{p.lim}</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 30, color: OURO, border: `2px solid ${OURO}`, borderRadius: 8, padding: '0 12px'}}>ERA {FASE[p.fase] ?? '?'}</div>
    </div>
  );
};

export const Placar: React.FC<{q: Quadro; ias: IA[]; foco?: number; derrotas?: number[]}> = ({q, ias, foco}) => {
  const cont = useMemo(() => {
    const c = [0, 0, 0, 0, 0, 0, 0];
    for (const e of q.ents) if (e[1] > 0 && (e[2].includes('infantry') || e[2].includes('cavalry') || e[2].includes('champion'))) c[e[1]]++;
    return c;
  }, [q]);
  const mil = (j: number) => cont[j];
  return (
    <div style={{position: 'absolute', top: 90, right: 18, width: 330, padding: '10px 12px', ...PAINEL}}>
      {ias.map((ia, i) => {
        const j = i + 1;
        const p = q.jogadores[j];
        const fora = p?.estado !== 'active';
        return (
          <div key={j} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px', borderRadius: 8, background: foco === j ? '#ffffff22' : undefined, opacity: fora ? 0.45 : 1}}>
            <div style={{width: 14, height: 34, background: CORES_J[j], borderRadius: 3, border: '2px solid #000'}} />
            <div style={{flex: 1, fontFamily: FONTE, fontWeight: 800, fontSize: 25, color: '#fff', textDecoration: fora ? 'line-through' : undefined}}>{ia.nome}</div>
            {fora ? <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 18, color: '#ff6b5b'}}>DERROTADO</div> : (
              <>
                <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 20, color: '#f3ead2', width: 52, textAlign: 'right'}}>{p?.pop}</div>
                <svg width={22} height={22} viewBox="0 0 24 24"><path d="M4 20 L16 8 M14 6 L18 10 M5 15 L9 19" stroke="#ddd" strokeWidth="2.5" strokeLinecap="round" /></svg>
                <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 20, color: '#ffb0a0', width: 34}}>{mil(j)}</div>
                <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 18, color: OURO, width: 30}}>{FASE[p?.fase] ?? ''}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Minimapa: React.FC<{q: Quadro; recursos: Recurso[]; tam: number; cx: number; cz: number; vw: number; vh: number}> = ({q, recursos, tam, cx, cz, vw, vh}) => {
  const S = 250;
  const k = S / tam;
  // recursos do minimapa: uma <path> por cor, calculada uma vez (não muda)
  const camadas = useMemo(() => {
    const d: Record<string, string> = {};
    recursos.forEach(([x, z, m], i) => {
      if (i % 3) return;
      const c = m.includes('tree') ? '#2f5a20' : m.includes('rock') || m.includes('ore') ? '#bbb' : '#c33';
      d[c] = (d[c] ?? '') + `M${x * k - 1} ${S - z * k - 1}h2v2h-2z`;
    });
    return d;
  }, [recursos, k]);
  return (
    <div style={{position: 'absolute', left: 18, bottom: 18, width: S + 12, height: S + 12, ...PAINEL, borderRadius: '50%', overflow: 'hidden', padding: 6}}>
      <svg width={S} height={S} style={{borderRadius: '50%', background: '#5d8a38'}}>
        {Object.entries(camadas).map(([c, d]) => <path key={c} d={d} fill={c} />)}
        {q.ents.filter((e) => e[1] > 0).map((e) => {
          const pred = e[2].includes('civil_centre') || e[2].includes('house') || e[2].includes('barracks') || e[2].includes('tower') || e[2].includes('fortress');
          return <rect key={e[0]} x={e[3] * k - (pred ? 2.5 : 1.2)} y={S - e[4] * k - (pred ? 2.5 : 1.2)} width={pred ? 5 : 2.4} height={pred ? 5 : 2.4} fill={CORES_J[e[1]]} />;
        })}
        <rect x={(cx - vw / 2) * k} y={S - (cz + vh / 2) * k} width={vw * k} height={vh * k} fill="none" stroke="#fff" strokeWidth={2} />
      </svg>
    </div>
  );
};

// balão de pensamento secreto (o público vê, as outras IAs não)
export const Pensamento: React.FC<{ia: IA; j: number; texto: string; f: number; dur: number}> = ({ia, j, texto, f, dur}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const n = Math.floor(interpolate(f, [4, Math.max(8, Math.min(dur * 0.35, texto.length * 0.9))], [0, texto.length], cl));
  return (
    <div style={{position: 'absolute', left: 300, right: 380, bottom: 40, transform: `translateY(${(1 - e) * 300}px)`, opacity: e}}>
      <div style={{...PAINEL, border: '3px dashed #b9a7ff', background: 'linear-gradient(#2a2440f2, #1a1630f2)', padding: '16px 24px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <svg width={30} height={30} viewBox="0 0 24 24"><path d="M2 12 Q12 3 22 12 Q12 21 2 12 Z" fill="none" stroke="#b9a7ff" strokeWidth="2" /><circle cx="12" cy="12" r="3.5" fill="#b9a7ff" /></svg>
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 22, letterSpacing: 2, color: '#b9a7ff'}}>PENSAMENTO SECRETO</span>
          <span style={{width: 12, height: 26, background: CORES_J[j], borderRadius: 3}} />
          <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 26, color: '#fff'}}>{ia.nome}</span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: '#f2eeff'}}>{texto.slice(0, n)}</div>
      </div>
    </div>
  );
};

// fala pública ou mensagem privada
export const Fala: React.FC<{ia: IA; j: number; texto: string; f: number; dur: number; privado?: string}> = ({ia, j, texto, f, dur, privado}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const n = Math.floor(interpolate(f, [4, Math.max(8, Math.min(dur * 0.35, texto.length * 0.9))], [0, texto.length], cl));
  return (
    <div style={{position: 'absolute', left: 300, right: 380, bottom: 40, transform: `translateY(${(1 - e) * 300}px)`, opacity: e}}>
      <div style={{...PAINEL, padding: '16px 24px', borderColor: privado ? '#ff9f43' : OURO}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <span style={{width: 12, height: 26, background: CORES_J[j], borderRadius: 3}} />
          <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 28, color: '#fff'}}>{ia.nome}</span>
          <span style={{fontFamily: FONTE, fontWeight: 600, fontSize: 20, color: '#bbb'}}>{ia.modelo}</span>
          <span style={{marginLeft: 'auto', fontFamily: FONTE, fontWeight: 900, fontSize: 20, letterSpacing: 2, color: privado ? '#ff9f43' : OURO}}>{privado ? `MENSAGEM SECRETA PARA ${privado.toUpperCase()}` : 'CHAT GERAL'}</span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: '#f3ead2'}}>{texto.slice(0, n)}</div>
      </div>
    </div>
  );
};

export const Selo: React.FC<{texto: string; f: number; cor?: string; top?: number}> = ({texto, f, cor = '#d92b2b', top = 200}) => {
  const e = interpolate(f, [0, 6], [2.4, 1], cl);
  return (
    <div style={{position: 'absolute', top, left: 300, right: 380, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: texto.length > 22 ? 48 : 64, color: '#fff', background: cor, border: '7px solid #fff', maxWidth: 1180, textAlign: 'center', borderRadius: 16, padding: '4px 34px', transform: `rotate(-6deg) scale(${e})`, opacity: interpolate(f, [0, 3], [0, 1], cl), boxShadow: '0 12px 0 #0008', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill'}}>{texto}</div>
    </div>
  );
};

export const Tempo: React.FC<{t: number}> = ({t}) => {
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return (
    <div style={{position: 'absolute', top: 18, right: 18, ...PAINEL, padding: '6px 20px', fontFamily: FONTE, fontWeight: 800, fontSize: 32, color: '#f3ead2'}}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
};

export const CartaoMarco: React.FC<{titulo: string; sub?: string; f: number}> = ({titulo, sub, f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 150}});
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{...PAINEL, padding: '14px 44px', textAlign: 'center', transform: `scale(${0.6 + 0.4 * e})`, opacity: e}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 64, color: OURO, letterSpacing: 2}}>{titulo}</div>
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: '#f3ead2'}}>{sub}</div> : null}
      </div>
    </div>
  );
};
