import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {tributo, TRIBUTOS, DISTRITOS} from './regras';
import {efeitosDo, estadoDe, MAPA_H, MAPA_W, Partida, posicoes, turnoDe, ZONAS, centroDe, EstadoTrib} from './dados';
import {Caveira, Personagem, Retrato} from './comum';

export type ItemChat = {cor: string; texto: string; at: number; pensamento?: string};

type Props = {
  dados: Partida | null;
  turno: number;
  foco?: string;
  pensamentos?: string[];
  aviso?: string;
  chat?: ItemChat[];
};

const SPR = 104; // altura do sprite na tela (px)
const DUR = 40; // quadros do deslize entre turnos
const PASSO_EFEITO = 24; // quadros entre um ataque/morte e o próximo
const INICIO_EFEITO = 50;
const VIDA_CHAT = 210; // quadros que um balão fica na tela
const ZOOM_FOCO = 2.2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = Easing.out(Easing.cubic);
const corPeriodo: Record<string, string> = {manhã: '#f1cf6c', tarde: '#ff9f5a', noite: '#7aa7ff'};

export const ILMapa: React.FC<Props> = ({dados, turno, foco, pensamentos = [], aviso, chat = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (!dados) {
    return (
      <AbsoluteFill style={{background: '#0b1a22', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT.display, fontSize: 44}}>
        partida "{turno}" não encontrada em timeline.data.partidas
      </AbsoluteFill>
    );
  }
  const p = dados;
  const t = turnoDe(p, turno);
  const estAtual = estadoDe(p, turno);
  const estAnt = estadoDe(p, turno - 1);
  const tAnt = turnoDe(p, turno - 1);
  const posAtual = posicoes(estAtual);
  const posAnt = posicoes(estAnt);

  // movimento entre turnos e câmera
  const m = interpolate(frame, [0, DUR], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const alvoZona = foco && ZONAS[foco] ? foco : null;
  const zoom = alvoZona ? lerp(1, ZOOM_FOCO, m) : 1;
  const [cxF, cyF] = alvoZona ? centroDe(alvoZona) : [MAPA_W / 2, MAPA_H / 2];
  const fx = lerp(MAPA_W / 2, cxF, m);
  const fy = lerp(MAPA_H / 2, cyF, m);
  const k = 0.5 * zoom; // escala do mundo (3840 px) para a tela
  const tx = clamp(960 - fx * k, 1920 - MAPA_W * k, 0);
  const ty = clamp(540 - fy * k, 1080 - MAPA_H * k, 0);
  const paraTela = (x: number, y: number): [number, number] => [tx + x * k, ty + y * k];

  // noite: transição entre o turno anterior e este
  const noiteAgora = t?.periodo === 'noite' ? 1 : 0;
  const noiteAntes = tAnt?.periodo === 'noite' ? 1 : 0;
  const noite = lerp(noiteAntes, noiteAgora, m);

  // efeitos de combate do turno (ataques, revides, mortes), em sequência
  const efeitos = efeitosDo(t).map((e, i) => ({...e, at: INICIO_EFEITO + i * PASSO_EFEITO}));
  const quandoMorreu = (id: string) => efeitos.find((e) => e.tipo === 'morte' && e.vitima === id)?.at;
  const atacando = (id: string) => efeitos.find((e) => (e.tipo === 'ataque' || e.tipo === 'revide') && e.id === id && frame >= e.at - 6 && frame < e.at + 10);

  // balões: só o último fala de cada tributo fica visível
  const ultimoPorCor: Record<string, number> = {};
  chat.forEach((c, i) => {
    if (frame >= c.at) ultimoPorCor[c.cor] = i;
  });
  const acenando = (id: string) => chat.some((c) => c.cor === id && frame >= c.at && frame < c.at + 40);

  // HUD
  const vivos = TRIBUTOS.filter((tr) => estAtual.get(tr.id)?.vivo !== false);
  const vivosDistrito = (d: string) => vivos.filter((tr) => tr.distrito === d).length;
  const periodo = (t?.periodo ?? '').toUpperCase();
  const corHud = corPeriodo[t?.periodo ?? ''] ?? '#f1cf6c';

  // cartões de pensamento
  const cartoes = pensamentos
    .map((x) => {
      const tr = tributo(x);
      if (tr) {
        const d = t?.decisoes.find((dd) => dd.id === x && dd.pensamento);
        return d?.pensamento ? {tr, texto: d.pensamento} : null;
      }
      return x ? {tr: undefined, texto: x} : null;
    })
    .filter((c): c is {tr: (typeof TRIBUTOS)[number] | undefined; texto: string} => c !== null)
    .slice(0, 3);

  const entrada = spring({frame, fps, config: {damping: 16}});

  return (
    <AbsoluteFill style={{background: '#0b1a22', overflow: 'hidden'}}>
      {/* mundo: mapa 2.5D, névoa e maré (coordenadas em pixels do mapa) */}
      <div style={{position: 'absolute', left: 0, top: 0, width: MAPA_W, height: MAPA_H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${k})`}}>
        <Img src={staticFile('ilha/mapa.png')} style={{position: 'absolute', left: 0, top: 0, width: MAPA_W, height: MAPA_H}} />
        <Img src={staticFile('ilha/mapa_noite.png')} style={{position: 'absolute', left: 0, top: 0, width: MAPA_W, height: MAPA_H, opacity: noite}} />
        <svg width={MAPA_W} height={MAPA_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <defs>
            <filter id="ilhaBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
          {Object.entries(ZONAS).map(([id, z]) => {
            const zt = t?.zonas[id];
            const nev = zt?.nevoa;
            const mar = zt?.inundada;
            return (
              <g key={id}>
                {mar && (
                  <polygon
                    points={z.pontos.map(([x, y]) => `${x},${y}`).join(' ')}
                    fill="rgba(40,140,255,0.55)"
                    stroke={`rgba(160,220,255,${0.5 + 0.3 * Math.sin(frame / 10)})`}
                    strokeWidth={10}
                    strokeDasharray="30 18"
                    strokeDashoffset={-frame * 2}
                  />
                )}
                {nev &&
                  [0, 1, 2, 3, 4].map((j) => {
                    const a = (j / 5) * Math.PI * 2 + frame / 60;
                    const [cx, cy] = z.centro;
                    return (
                      <circle
                        key={j}
                        cx={cx + Math.cos(a) * 90 + Math.sin(frame / 25 + j) * 25}
                        cy={cy + Math.sin(a) * 70}
                        r={150 + 30 * Math.sin(frame / 20 + j)}
                        fill="rgba(150,60,230,0.5)"
                        filter="url(#ilhaBlur)"
                      />
                    );
                  })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* filtro de noite */}
      <AbsoluteFill style={{background: `rgba(4,10,42,${0.4 * noite})`, pointerEvents: 'none'}} />

      {/* nomes das zonas */}
      {Object.entries(ZONAS).map(([id, z]) => {
        const [sx, sy] = paraTela(z.centro[0], z.centro[1] + 150);
        const zt = t?.zonas[id];
        return (
          <div
            key={id}
            style={{
              position: 'absolute', left: sx, top: sy, transform: 'translate(-50%, 0)', padding: '3px 12px', borderRadius: 10,
              background: 'rgba(8,12,20,0.72)', color: zt?.nevoa ? '#e2c4ff' : zt?.inundada ? '#bfe4ff' : '#f0f3df',
              fontFamily: FONT.display, fontWeight: 800, fontSize: 22, whiteSpace: 'nowrap', letterSpacing: 0.5,
            }}
          >
            {z.nome}
            {zt?.nevoa ? ' · NÉVOA' : ''}
            {zt?.inundada ? ' · MARÉ' : ''}
          </div>
        );
      })}

      {/* sprites: vivos e mortos (cinza) */}
      {TRIBUTOS.map((tr) => {
        const [ax, ay] = posAnt[tr.id] ?? posAtual[tr.id];
        const [bx, by] = posAtual[tr.id];
        const wx = lerp(ax, bx, m);
        const wy = lerp(ay, by, m);
        const [sx, sy] = paraTela(wx, wy);
        const est: EstadoTrib | undefined = estAtual.get(tr.id);
        const vivoAgora = est?.vivo !== false;
        const morrendo = quandoMorreu(tr.id);
        const morto = !vivoAgora && (morrendo === undefined || frame >= morrendo);
        const acao = t?.decisoes.find((d) => d.id === tr.id)?.acao ?? '';
        const andando = Math.hypot(bx - ax, by - ay) > 2 && m < 1;
        const ataque = atacando(tr.id);
        let pose = 'parado';
        if (morto) pose = 'morto';
        else if (ataque) pose = 'atacando';
        else if (acenando(tr.id)) pose = 'acenando';
        else if (andando) pose = Math.floor(frame / 8) % 2 ? 'andando_a' : 'andando_b';
        else if (/coletar|pegar|beber|comer|curar/.test(acao)) pose = 'coletando';
        else if (/descansar|esconder/.test(acao)) pose = t?.periodo === 'noite' ? 'dormindo' : 'sentado';
        const flip = bx < ax - 1;
        const h = SPR;
        const barra = est ? clamp(est.vida, 0, 100) / 100 : 0;
        return (
          <React.Fragment key={tr.id}>
            <div style={{position: 'absolute', left: sx - h / 2, top: sy - h * 0.92, width: h, height: h, transform: `scale(${1 + (ataque ? 0.06 : 0)})`}}>
              <Personagem id={tr.id} pose={pose} size={h} flip={flip} cinza={morto} />
            </div>
            <div
              style={{
                position: 'absolute', left: sx, top: sy - h * 0.92 - 34, transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, opacity: morto ? 0.7 : 1,
              }}
            >
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 20, color: morto ? '#9aa0a8' : '#fff', background: 'rgba(8,12,20,.8)', padding: '1px 8px', borderRadius: 7, borderBottom: `3px solid ${tr.cor}`, whiteSpace: 'nowrap'}}>
                {tr.nome}
              </div>
              {!morto && (
                <div style={{width: 84, height: 9, background: 'rgba(0,0,0,.6)', border: '2px solid #000', borderRadius: 5, overflow: 'hidden'}}>
                  <div style={{width: `${barra * 100}%`, height: '100%', background: barra > 0.5 ? '#b9ed88' : barra > 0.25 ? '#f1cf6c' : '#ff6b6b'}} />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* efeitos: dano, flash de ataque e canhão */}
      {efeitos.map((e, i) => {
        const d = frame - e.at;
        if (d < 0 || d > 60) return null;
        const alvo = e.tipo === 'morte' ? (e.vitima as string) : (e.alvo as string | undefined);
        if (!alvo) return null;
        const [wx, wy] = posAtual[alvo] ?? [0, 0];
        const [sx, sy] = paraTela(wx, wy);
        if (e.tipo === 'morte') {
          const r = 20 + d * 4;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: sx - r, top: sy - r - 40, width: 2 * r, height: 2 * r, borderRadius: '50%', border: '8px solid #ffd27a', opacity: interpolate(d, [0, 40], [1, 0], {extrapolateRight: 'clamp'})}} />
              <div style={{position: 'absolute', left: sx - 34, top: sy - 110 - d, opacity: interpolate(d, [0, 12, 50], [0, 1, 0], {extrapolateRight: 'clamp'}), filter: 'drop-shadow(0 4px 0 #000)'}}>
                <Caveira size={68} />
              </div>
              <div style={{position: 'absolute', left: sx, top: sy + 6, transform: 'translate(-50%, 0)', fontFamily: FONT.comic, fontSize: 40, color: '#ffd27a', textShadow: '0 4px 0 #000', opacity: interpolate(d, [0, 10, 50], [0, 1, 0], {extrapolateRight: 'clamp'})}}>
                {e.causa === 'combate' ? 'CANHÃO' : String(e.causa ?? '').toUpperCase()}
              </div>
            </React.Fragment>
          );
        }
        const cor = e.tipo === 'revide' ? '#ffb26b' : '#ff3b3b';
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: sx - 70, top: sy - 110, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${cor}aa 0%, transparent 70%)`, opacity: interpolate(d, [0, 18], [1, 0], {extrapolateRight: 'clamp'})}} />
            <div style={{position: 'absolute', left: sx, top: sy - 130 - d * 1.6, transform: 'translate(-50%, 0)', fontFamily: FONT.comic, fontSize: 56, color: cor, textShadow: '0 4px 0 #000', opacity: interpolate(d, [0, 8, 40], [0, 1, 0], {extrapolateRight: 'clamp'})}}>
              -{Number(e.dano ?? 0)}
            </div>
          </React.Fragment>
        );
      })}

      {/* balões de fala */}
      {Object.entries(ultimoPorCor).map(([cor, idx]) => {
        const c = chat[idx];
        const age = frame - c.at;
        if (age > VIDA_CHAT) return null;
        const tr = tributo(cor);
        const [wx, wy] = posAtual[cor] ?? [0, 0];
        const [sx, sy] = paraTela(wx, wy);
        const o = spring({frame: age, fps, config: {damping: 14}});
        const left = clamp(sx, 200, 1720);
        const top = Math.max(120, sy - SPR * 0.92 - 52);
        return (
          <div
            key={cor}
            style={{
              position: 'absolute', left, top, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * o})`, opacity: clamp(o, 0, 1),
              width: 380, background: '#fff', border: '4px solid #0b0d14', borderRadius: 16, padding: '10px 14px 12px', boxShadow: '0 6px 0 rgba(0,0,0,.5)',
            }}
          >
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 18, color: tr?.cor ?? '#333', marginBottom: 2}}>{tr?.nome ?? cor}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 23, color: '#111', lineHeight: 1.25}}>{c.texto}</div>
            {c.pensamento && (
              <div style={{marginTop: 8, paddingTop: 6, borderTop: '2px dashed #9a7ac8', fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 500, fontSize: 17, color: '#5b3a8c', lineHeight: 1.25}}>
                {c.pensamento}
              </div>
            )}
            <div style={{position: 'absolute', left: '50%', bottom: -18, width: 0, height: 0, transform: 'translateX(-50%)', borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '18px solid #0b0d14'}} />
          </div>
        );
      })}

      {/* cartões de pensamento secreto */}
      {cartoes.map((c, i) => {
        const o = spring({frame: frame - i * 8, fps, config: {damping: 15}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute', right: 24, top: 130 + i * 250, width: 300, padding: 14, background: 'rgba(12,16,26,.9)', border: `4px solid ${c.tr?.cor ?? '#ff6b6b'}`,
              borderRadius: 16, transform: `translateX(${(1 - o) * 120}px)`, opacity: clamp(o, 0, 1),
            }}
          >
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              {c.tr ? <Retrato id={c.tr.id} size={84} /> : <div style={{width: 84, height: 84, borderRadius: 42, background: '#2a0f14', border: '3px dashed #ff6b6b'}} />}
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: c.tr?.cor ?? '#ff8a8a', lineHeight: 1.1}}>
                {c.tr?.nome ?? 'PENSAMENTO'}
                <div style={{fontSize: 14, color: '#ff8a8a', letterSpacing: 1}}>💭 SÓ A GENTE VÊ</div>
              </div>
            </div>
            <div style={{marginTop: 8, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 500, fontSize: 19, color: '#ffe3e3', lineHeight: 1.25}}>{c.texto}</div>
          </div>
        );
      })}

      {/* HUD */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 36px', background: 'rgba(8,12,20,.82)', borderBottom: `5px solid ${corHud}`, opacity: clamp(entrada, 0, 1),
        }}
      >
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>
          DIA {t?.dia ?? '–'} <span style={{color: corHud}}>· {periodo}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>
          VIVOS <span style={{color: '#b9ed88'}}>{vivos.length}</span>/12
        </div>
        <div style={{display: 'flex', gap: 10}}>
          {DISTRITOS.map((d) => (
            <div key={d.nome} style={{padding: '4px 12px', borderRadius: 10, background: '#0b0d14', border: `3px solid ${d.cor}`, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: '#fff'}}>
              {d.nome} <span style={{color: d.cor}}>{vivosDistrito(d.nome)}/4</span>
            </div>
          ))}
        </div>
      </div>

      {aviso && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.78)', borderTop: '4px solid #f1cf6c', fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: '#fff', padding: '0 40px', textAlign: 'center'}}>
          {aviso}
        </div>
      )}
    </AbsoluteFill>
  );
};

