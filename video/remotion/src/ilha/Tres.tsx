import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {Retrato} from './comum';
import {estadoDe, Partida, turnoDe} from './dados';
import {DISTRITOS, TRIBUTOS, tributo} from './regras';

// Gameplay 3D renderizada no Blender (public/ilha/3d/<id>.mp4 + <id>.json com a posição das cabeças na tela),
// com título, HUD de battle royale e balões de fala presos à cabeça de quem fala.

export type Tomada3D = {id: string; de: number; ate: number; turno: number; partida: string; periodo?: string | null};
export type Fala3D = {id: string; texto: string; at: number; dur: number; pensa?: boolean};
export type Elim3D = {id: string; at: number; causa?: string};
type Telas = Record<string, [number, number, number]>[];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------- bonecos 3D pré-renderizados sobre o cenário
type MetaBonecos = {quadro: [number, number]; pe: [number, number]; ppm: number; anims: Record<string, {n: number; dur: number; laco: boolean}>; tiras?: Record<string, string[]>};
type PosPlaca = {anims: string[]; atores: Record<string, ([number, number, number, number, number, number] | null)[]>};
let metaCache: MetaBonecos | null = null;

const FILTRO: Record<string, string> = {
  noite: 'brightness(0.6) saturate(0.7) contrast(1.05) hue-rotate(8deg)',
  manhã: 'sepia(0.12) saturate(1.1) brightness(1.02)',
  tarde: 'none',
};

const Boneco: React.FC<{id: string; v: [number, number, number, number, number, number]; nomes: string[]; meta: MetaBonecos; filtro: string}> = ({id, v, nomes, meta, filtro}) => {
  const [x, y, ppm, dir0, ai, ta] = v;
  const espelho = dir0 > 180;  // 225/270/315 = 135/90/45 espelhados
  const dir = espelho ? 360 - dir0 : dir0;
  let anim = nomes[ai] ?? 'parado';
  const tem = meta.tiras?.[id];
  if (tem && !tem.includes(anim)) anim = anim.startsWith('atacar_') && tem.includes('atacar_maos') ? 'atacar_maos' : 'parado';
  const A = meta.anims[anim] ?? meta.anims.parado;
  const fr = A.laco ? Math.floor((((ta / A.dur) % 1) + 1) % 1 * A.n) : Math.min(A.n - 1, Math.max(0, Math.floor((ta / A.dur) * A.n)));
  const [QW, QH] = meta.quadro;
  const s = ppm / meta.ppm;
  const px = x * 1920, py = y * 1080;
  return (
    <>
      <div style={{position: 'absolute', left: px - 0.38 * ppm, top: py - 0.1 * ppm, width: 0.76 * ppm, height: 0.2 * ppm, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,.42) 0%, rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: px - (espelho ? 1 - meta.pe[0] : meta.pe[0]) * QW * s, top: py - meta.pe[1] * QH * s, width: QW, height: QH, overflow: 'hidden', transform: `scale(${s})`, transformOrigin: 'top left'}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', transform: espelho ? 'scaleX(-1)' : undefined}}>
          <Img src={staticFile(`ilha/bonecos/${id}/${anim}_${dir}.png`)} style={{position: 'absolute', left: -fr * QW, top: 0, width: QW * A.n, height: QH, maxWidth: 'none', filter: filtro}} />
        </div>
      </div>
    </>
  );
};

const Placa: React.FC<{id: string; periodo: string; dur: number}> = ({id, periodo, dur}) => {
  const f = useCurrentFrame();
  const [pos, setPos] = useState<PosPlaca | null>(null);
  const [meta, setMeta] = useState<MetaBonecos | null>(metaCache);
  const [h] = useState(() => delayRender(`placa ${id}`));
  useEffect(() => {
    Promise.all([
      fetch(staticFile(`ilha/3d/${id}.json`)).then((r) => r.json()),
      metaCache ? Promise.resolve(metaCache) : fetch(staticFile('ilha/bonecos/bonecos.json')).then((r) => r.json()),
    ])
      .then(([p, m]) => {
        metaCache = m;
        setPos(p);
        setMeta(m);
      })
      .catch(() => null)
      .finally(() => continueRender(h));
  }, [id, h]);
  const zoom = 1 + 0.06 * (f / Math.max(1, dur));
  const atores = pos && meta
    ? Object.entries(pos.atores)
        .map(([tid, tr]) => [tid, tr[Math.min(f, tr.length - 1)]] as const)
        .filter((e): e is readonly [string, [number, number, number, number, number, number]] => !!e[1])
        .sort((a, b) => a[1][2] - b[1][2])
    : [];
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%'}}>
        <Img src={staticFile(`ilha/3d/${id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {meta && atores.map(([tid, v]) => <Boneco key={tid} id={tid} v={v} nomes={pos!.anims} meta={meta} filtro={FILTRO[periodo] ?? 'none'} />)}
        {periodo === 'noite' && <AbsoluteFill style={{background: 'rgba(30,50,120,.10)', mixBlendMode: 'multiply'}} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Tomada: React.FC<{id: string; periodo?: string; dur?: number}> = ({id, periodo = 'tarde', dur = 100}) => {
  const [ok, setOk] = useState<'mp4' | 'placa' | false | null>(null);
  const [h] = useState(() => delayRender(`3d ${id}`));
  useEffect(() => {
    fetch(staticFile(`ilha/3d/${id}.mp4`), {method: 'HEAD'})
      .then(async (r) => {
        if (r.ok) return setOk('mp4');
        const j = await fetch(staticFile(`ilha/3d/${id}.jpg`), {method: 'HEAD'});
        setOk(j.ok ? 'placa' : false);
      })
      .catch(() => setOk(false))
      .finally(() => continueRender(h));
  }, [id, h]);
  if (ok === 'placa') return <Placa id={id} periodo={periodo} dur={dur} />;
  if (ok === 'mp4') return <OffthreadVideo src={staticFile(`ilha/3d/${id}.mp4`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b33 0%, #05080b 80%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT.mono, fontSize: 34, color: '#83cdec'}}>{ok === null ? 'carregando' : 'tomada 3D ainda não renderizada'}</div>
      <div style={{fontFamily: FONT.mono, fontSize: 44, color: '#f0f3df', marginTop: 16}}>{id}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- título por cima do 3D
const TituloCinema: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string; retratos?: boolean}> = ({kicker, title, subtitle, color = '#ffcc33', retratos = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bate = spring({frame: f - 4, fps, config: {damping: 11, stiffness: 160}});
  const escala = interpolate(bate, [0, 1], [1.9, 1]);
  const blur = interpolate(f, [4, 12], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = interpolate(f, [8, 11, 22], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const brilho = interpolate(f, [20, 46], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kick = clamp01((f - 16) / 10);
  const [l1, l2] = title.includes(' DAS ') ? [title.split(' DAS ')[0], 'DAS ' + title.split(' DAS ')[1]] : [title, ''];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(4,6,12,${0.18 + 0.32 * clamp01(f / 12)})`}} />
      <AbsoluteFill style={{background: `rgba(255,240,200,${flash})`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{transform: `scale(${escala})`, filter: `blur(${blur}px)`, textAlign: 'center', position: 'relative'}}>
          <div style={{position: 'relative'}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 168, lineHeight: 0.95, letterSpacing: 4, color, WebkitTextStroke: '5px #120c02', textShadow: '0 10px 0 #000, 0 0 60px rgba(255,180,40,.55)'}}>
              {l1}
            </div>
            <div
              style={{
                position: 'absolute', inset: 0, fontFamily: FONT.display, fontWeight: 900, fontSize: 168, lineHeight: 0.95, letterSpacing: 4, color: 'transparent',
                backgroundImage: `linear-gradient(100deg, transparent ${brilho - 10}%, rgba(255,255,255,.9) ${brilho}%, transparent ${brilho + 10}%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
              }}
            >
              {l1}
            </div>
          </div>
          {l2 && (
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 112, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>
              {l2}
            </div>
          )}
        </div>
        {kicker && (
          <div style={{marginTop: 34, fontFamily: FONT.display, fontWeight: 800, fontSize: 38, letterSpacing: 7, color: '#e9edff', textTransform: 'uppercase', opacity: kick, transform: `translateY(${(1 - kick) * 24}px)`, textShadow: '0 4px 0 #000'}}>
            {kicker}
          </div>
        )}
        {subtitle && <div style={{marginTop: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: '#fff', opacity: kick}}>{subtitle}</div>}
        {retratos && <div style={{display: 'flex', gap: 34, marginTop: 44}}>
          {DISTRITOS.map((d, di) => (
            <div key={d.nome} style={{display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 60, background: 'rgba(0,0,0,.45)', border: `3px solid ${d.cor}`}}>
              {TRIBUTOS.filter((t) => t.distrito === d.nome).map((t, i) => {
                const o = spring({frame: f - 26 - di * 6 - i * 3, fps, config: {damping: 12}});
                return (
                  <div key={t.id} style={{transform: `scale(${o})`}}>
                    <Retrato id={t.id} size={70} borda={t.cor} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar: mortes por causa (partida oficial)
const ROTULO: Record<string, [string, string]> = {'névoa': ['NÉVOA TÓXICA', '#c77dff'], fome: ['FOME', '#ffb26b'], sede: ['SEDE', '#83cdec'], combate: ['COMBATE', '#ff3b3b']};
const Placar: React.FC<{dados: Partida}> = ({dados}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Record<string, string[]> = {};
  for (const t of dados.turnos) for (const e of t.eventos ?? []) if (e.tipo === 'morte') (grupos[String(e.causa)] ??= []).push(String(e.vitima));
  const ordem = Object.keys(grupos).sort((a, b) => grupos[b].length - grupos[a].length);
  const total = Object.values(grupos).reduce((a, b) => a + b.length, 0);
  return (
    <AbsoluteFill style={{background: 'rgba(4,6,12,.55)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 96, color: '#fff', WebkitTextStroke: '3px #000', textShadow: '0 8px 0 #000', transform: `scale(${spring({frame: f, fps, config: {damping: 12}})})`}}>
        {total} MORTES
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 30}}>
        {ordem.map((c, i) => {
          const o = spring({frame: f - 10 - i * 7, fps, config: {damping: 14}});
          const [nome, cor] = ROTULO[c] ?? [c.toUpperCase(), '#fff'];
          return (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: o, transform: `translateX(${(1 - o) * -80}px)`}}>
              <div style={{width: 330, textAlign: 'right', fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: cor, textShadow: '0 4px 0 #000'}}>{nome}</div>
              <div style={{width: 74, fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#fff', textShadow: '0 4px 0 #000'}}>{grupos[c].length}</div>
              <div style={{display: 'flex', gap: 8}}>
                {grupos[c].map((id) => <Retrato key={id} id={id} size={66} cinza borda={cor} />)}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- HUD de battle royale
const Sol: React.FC<{noite: boolean}> = ({noite}) =>
  noite ? (
    <svg width={40} height={40} viewBox="0 0 24 24"><path d="M20 15.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 11.5z" fill="#cfe0ff" stroke="#000" strokeWidth={1.2} /></svg>
  ) : (
    <svg width={40} height={40} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={5} fill="#ffd34d" stroke="#000" strokeWidth={1.2} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={12 + 7.5 * Math.cos((a * Math.PI) / 180)} y1={12 + 7.5 * Math.sin((a * Math.PI) / 180)} x2={12 + 10 * Math.cos((a * Math.PI) / 180)} y2={12 + 10 * Math.sin((a * Math.PI) / 180)} stroke="#ffd34d" strokeWidth={2} />
      ))}
    </svg>
  );

const HUD: React.FC<{dados: Partida; turno: number; periodo?: string | null}> = ({dados, turno, periodo}) => {
  const f = useCurrentFrame();
  const t = turnoDe(dados, turno);
  const est = estadoDe(dados, turno);
  const per = periodo ?? t?.periodo ?? 'manhã';
  const vivos = TRIBUTOS.filter((x) => est.get(x.id)?.vivo !== false).length;
  const entra = clamp01(f / 8);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 44, top: 36, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px 10px 16px', borderRadius: 40, background: 'rgba(8,10,18,.72)', border: '3px solid rgba(255,255,255,.18)', opacity: entra}}>
        <Sol noite={per === 'noite'} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: 2}}>
          DIA {t?.dia ?? 1} <span style={{color: per === 'noite' ? '#9fb8ff' : '#ffd34d'}}>· {per.toUpperCase()}</span>
        </div>
      </div>
      <div style={{position: 'absolute', right: 44, top: 32, display: 'flex', alignItems: 'center', gap: 16, opacity: entra}}>
        {DISTRITOS.map((d) => (
          <div key={d.nome} style={{display: 'flex', gap: 5, padding: '6px 9px', borderRadius: 40, background: 'rgba(8,10,18,.72)', border: `3px solid ${d.cor}`}}>
            {TRIBUTOS.filter((x) => x.distrito === d.nome).map((x) => {
              const morto = est.get(x.id)?.vivo === false;
              return (
                <div key={x.id} style={{position: 'relative'}}>
                  <Retrato id={x.id} size={44} cinza={morto} borda={morto ? '#333' : x.cor} />
                  {morto && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3b3b', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, textShadow: '0 2px 0 #000'}}>✕</div>}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{padding: '8px 20px', borderRadius: 14, background: '#ff3b3b', border: '3px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>
          {vivos} VIVOS
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- balão preso à cabeça
const Balao: React.FC<{fala: Fala3D; x: number | null; y: number | null; frame: number}> = ({fala, x, y, frame}) => {
  const t = tributo(fala.id);
  const d = frame - fala.at;
  const entra = clamp01(d / 6);
  const sai = 1 - clamp01((d - fala.dur - 10) / 6);
  const chars = Math.ceil(fala.texto.length * clamp01(d / Math.max(1, fala.dur * 0.9)));
  const W = 660;
  const preso = x !== null && y !== null;
  const bx = preso ? Math.min(1920 - W - 40, Math.max(40, x - W / 2)) : 60;
  const by = preso ? Math.max(120, y - 40) : 820;
  return (
    <div style={{position: 'absolute', left: bx, top: by, transform: `translateY(-100%) scale(${0.85 + 0.15 * entra})`, transformOrigin: 'bottom center', opacity: entra * sai, width: W}}>
      <div style={{background: '#fffdf6', border: '5px solid #0b0d14', borderRadius: 26, padding: '16px 24px 18px', boxShadow: '0 8px 0 rgba(0,0,0,.35)', position: 'relative'}}>
        <div style={{position: 'absolute', top: -24, left: 22, padding: '3px 16px', borderRadius: 14, background: t?.cor ?? '#888', border: '4px solid #0b0d14', fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#0b0d14'}}>
          {t?.nome ?? fala.id}
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 32, lineHeight: 1.25, color: '#14161f', marginTop: 8}}>
          {fala.texto.slice(0, chars)}
          <span style={{opacity: 0}}>{fala.texto.slice(chars)}</span>
        </div>
      </div>
      {preso && (
        <svg width={44} height={30} style={{position: 'absolute', left: Math.min(W - 60, Math.max(16, x! - bx - 22)), bottom: -26}}>
          <path d="M0 0 L44 0 L22 28 Z" fill="#fffdf6" stroke="#0b0d14" strokeWidth={5} strokeLinejoin="round" />
          <rect x={4} y={-6} width={36} height={9} fill="#fffdf6" />
        </svg>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- pensamento secreto (cartão lateral)
const Pensamento: React.FC<{fala: Fala3D; frame: number}> = ({fala, frame}) => {
  const t = tributo(fala.id);
  const d = frame - fala.at;
  const {fps} = useVideoConfig();
  const entra = spring({frame: d, fps, config: {damping: 15}});
  const sai = clamp01((d - fala.dur - 8) / 8);
  const chars = Math.ceil(fala.texto.length * clamp01(d / Math.max(1, fala.dur * 0.92)));
  return (
    <div style={{position: 'absolute', right: 50, top: 150, width: 720, transform: `translateX(${(1 - entra) * 800 + sai * 800}px)`}}>
      <div style={{background: 'rgba(10,12,22,.93)', border: `5px solid ${t?.cor ?? '#888'}`, borderRadius: 26, padding: '22px 26px', boxShadow: '0 10px 0 rgba(0,0,0,.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
          <Retrato id={fala.id} size={84} borda={t?.cor} />
          <div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{t?.nome}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: t?.cor}}>🔒 PENSAMENTO SECRETO</div>
          </div>
        </div>
        <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 600, fontSize: 31, lineHeight: 1.3, color: '#e9ecff'}}>
          “{fala.texto.slice(0, chars)}<span style={{opacity: 0}}>{fala.texto.slice(chars)}</span>”
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- eliminado (faixa com o retrato)
const CAUSA: Record<string, string> = {sede: 'morreu de sede', fome: 'morreu de fome', 'névoa': 'morreu na névoa tóxica', frio: 'morreu de frio', combate: 'eliminado em combate'};
const Eliminado: React.FC<{e: Elim3D; frame: number}> = ({e, frame}) => {
  const t = tributo(e.id);
  const d = frame - e.at;
  const {fps} = useVideoConfig();
  const bate = spring({frame: d, fps, config: {damping: 10, stiffness: 170}});
  const sai = clamp01((d - 66) / 8);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 230, opacity: 1 - sai}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 34px 14px 18px', background: 'rgba(12,4,6,.9)', border: '5px solid #ff3b3b', borderRadius: 20, transform: `scale(${interpolate(bate, [0, 1], [1.8, 1])}) rotate(${(1 - bate) * -4}deg)`, boxShadow: '0 0 40px rgba(255,40,40,.45)'}}>
        <Retrato id={e.id} size={96} cinza borda="#ff3b3b" />
        <div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#ff3b3b', letterSpacing: 3, lineHeight: 1, WebkitTextStroke: '2px #000'}}>ELIMINADO</div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 6}}>
            {t?.nome} <span style={{color: '#ffb3b3', fontWeight: 600}}>· {CAUSA[e.causa ?? ''] ?? e.causa}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composição
export const IL3D: React.FC<{
  tomadas: Tomada3D[];
  hud?: boolean | null;
  titulo?: {kicker?: string; title: string; subtitle?: string; color?: string} | null;
  chat?: Fala3D[];
  eliminados?: Elim3D[];
  placar?: boolean | null;
  partidas: Record<string, Partida>;
}> = ({tomadas, hud, titulo, chat = [], eliminados = [], placar, partidas}) => {
  const frame = useCurrentFrame();
  const [telas, setTelas] = useState<Record<string, Telas>>({});
  const [h] = useState(() => delayRender('posições 3D'));
  useEffect(() => {
    if (!chat.length) {
      continueRender(h);
      return;
    }
    Promise.all(
      tomadas.map((tm) =>
        fetch(staticFile(`ilha/3d/${tm.id}.json`))
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => [tm.id, j?.telas ?? []] as const)
          .catch(() => [tm.id, []] as const),
      ),
    )
      .then((pares) => setTelas(Object.fromEntries(pares)))
      .finally(() => continueRender(h));
  }, [tomadas, chat.length, h]);

  const atual = tomadas.find((tm) => frame >= tm.de && frame < tm.ate) ?? tomadas[tomadas.length - 1];
  const dados = atual ? partidas[atual.partida] : undefined;
  const ancora = (id: string): [number, number] | null => {
    if (!atual) return null;
    const p = telas[atual.id]?.[frame - atual.de]?.[id];
    return p ? [p[0] * 1920, p[1] * 1080] : null;
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tomadas.map((tm) => (
        <Sequence key={tm.id} from={tm.de} durationInFrames={Math.max(1, tm.ate - tm.de)}>
          <Tomada id={tm.id} dur={tm.ate - tm.de} periodo={tm.periodo ?? (partidas[tm.partida] ? turnoDe(partidas[tm.partida], tm.turno)?.periodo : undefined) ?? 'tarde'} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%)'}} />
      {hud && dados && atual && <HUD dados={dados} turno={atual.turno} periodo={atual.periodo} />}
      {chat
        .filter((c) => !c.pensa && frame >= c.at && frame < c.at + c.dur + 16)
        .map((c) => {
          const a = ancora(c.id);
          return <Balao key={`${c.id}-${c.at}`} fala={c} x={a ? a[0] : null} y={a ? a[1] : null} frame={frame} />;
        })}
      {chat
        .filter((c) => c.pensa && frame >= c.at && frame < c.at + c.dur + 18)
        .map((c) => (
          <Pensamento key={`p-${c.id}-${c.at}`} fala={c} frame={frame} />
        ))}
      {eliminados
        .filter((e) => frame >= e.at && frame < e.at + 76)
        .map((e) => (
          <Eliminado key={`x-${e.id}`} e={e} frame={frame} />
        ))}
      {placar && partidas.oficial && <Placar dados={partidas.oficial} />}
      {titulo && <TituloCinema {...titulo} />}
    </AbsoluteFill>
  );
};
