import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {DISTRITOS, PERIODOS, TRIBUTOS, tributo} from './regras';
import {mortePorId, nomeZona, Partida, ultimoPensamento, ZONAS} from './dados';
import {Personagem, Retrato, FundoBaixoPoli, Caveira} from './comum';

const pop = (frame: number, fps: number, atraso = 0, damping = 14) => spring({frame: frame - atraso, fps, config: {damping}});
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const cardBase: React.CSSProperties = {background: 'rgba(12,16,26,.92)', border: '5px solid #0b0d14', borderRadius: 22, boxShadow: '0 8px 0 rgba(0,0,0,.45)'};

// ---------------------------------------------------------------- título
export const ILTitulo: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string}> = ({kicker, title, subtitle, color = '#f1cf6c'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps, 0, 13);
  const s2 = pop(frame, fps, 8, 15);
  return (
    <FundoBaixoPoli destaque={color}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 120px'}}>
        {kicker && (
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: '#cfd6f5', letterSpacing: 6, textTransform: 'uppercase', opacity: clamp01(s2), marginBottom: 14}}>
            {kicker}
          </div>
        )}
        <div
          style={{
            fontFamily: FONT.display, fontWeight: 900, fontSize: title.length > 26 ? 92 : 124, color, textAlign: 'center', lineHeight: 1.02,
            transform: `scale(${0.6 + 0.4 * s})`, textShadow: '0 8px 0 #000, 0 0 40px rgba(0,0,0,.6)', WebkitTextStroke: '3px #000',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 26, opacity: clamp01(s2), textAlign: 'center', maxWidth: 1400}}>
            {subtitle}
          </div>
        )}
        <div style={{display: 'flex', gap: 14, marginTop: 56}}>
          {TRIBUTOS.map((t, i) => {
            const o = pop(frame, fps, 20 + i * 4, 12);
            return (
              <div key={t.id} style={{transform: `translateY(${(1 - o) * 60}px) scale(${0.5 + 0.5 * o})`, opacity: clamp01(o)}}>
                <Retrato id={t.id} size={92} borda={t.cor} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </FundoBaixoPoli>
  );
};

// ---------------------------------------------------------------- elenco
export const ILElenco: React.FC<{destaque?: string}> = ({destaque}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1d2b3a 0%, #070b12 80%)', padding: '56px 80px'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#f0f3df', textAlign: 'center', textShadow: '0 5px 0 #000', opacity: clamp01(pop(frame, fps, 0, 14))}}>
        OS 12 TRIBUTOS
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, marginTop: 36}}>
        {DISTRITOS.map((d, di) => (
          <div key={d.nome}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: d.cor, textAlign: 'center', letterSpacing: 3, marginBottom: 14, textShadow: '0 4px 0 #000'}}>
              DISTRITO {d.nome.toUpperCase()}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
              {TRIBUTOS.filter((t) => t.distrito === d.nome).map((t, i) => {
                const o = pop(frame, fps, di * 10 + i * 6, 15);
                const dest = destaque === t.id;
                const apagado = destaque && !dest;
                return (
                  <div
                    key={t.id}
                    style={{
                      ...cardBase, display: 'flex', alignItems: 'center', gap: 20, padding: '10px 18px', height: 170, boxSizing: 'border-box',
                      borderColor: dest ? '#f1cf6c' : t.cor, boxShadow: dest ? `0 0 60px ${t.cor}, 0 8px 0 rgba(0,0,0,.45)` : cardBase.boxShadow,
                      transform: `translateX(${(1 - o) * (di === 1 ? 80 : -80)}px) scale(${dest ? 1.04 : 1})`, opacity: clamp01(o) * (apagado ? 0.4 : 1),
                    }}
                  >
                    <Retrato id={t.id} size={132} borda={t.cor} />
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#fff', lineHeight: 1}}>{t.nome}</div>
                      {t.lider && (
                        <div style={{alignSelf: 'flex-start', fontFamily: FONT.display, fontWeight: 900, fontSize: 20, color: '#0b0d14', background: '#f1cf6c', padding: '3px 12px', borderRadius: 10, letterSpacing: 2}}>
                          LÍDER
                        </div>
                      )}
                      <div style={{width: 14, height: 14, borderRadius: 7, background: t.cor}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- ficha
export const ILFicha: React.FC<{dados: Partida | null; id: string; texto?: string}> = ({dados, id, texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tr = tributo(id);
  const o = pop(frame, fps, 0, 14);
  if (!tr) return null;
  const ult = dados ? ultimoPensamento(dados, id) : null;
  const morte = dados ? mortePorId(dados, id) : null;
  const ultimo = dados ? [...dados.turnos].reverse().find((t) => t.estado.some((e) => e.id === id)) : undefined;
  const est = ultimo?.estado.find((e) => e.id === id);
  const corpo = texto ?? ult?.texto ?? '';
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 28% 50%, ${tr.cor}55 0%, #070b12 62%)`, padding: '90px 120px', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 90, alignItems: 'center', width: '100%'}}>
        <div style={{position: 'relative', opacity: clamp01(o), transform: `scale(${0.85 + 0.15 * o})`}}>
          <div style={{position: 'absolute', inset: -30, borderRadius: '50%', background: `radial-gradient(circle, ${tr.cor} 0%, transparent 70%)`, opacity: 0.55}} />
          <Retrato id={id} size={520} borda={tr.cor} cinza={!!morte} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 26}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 124, color: '#fff', lineHeight: 0.95, textShadow: '0 8px 0 #000', transform: `translateX(${(1 - pop(frame, fps, 6)) * 120}px)`}}>
            {tr.nome}
          </div>
          <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
            <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#0b0d14', background: tr.cor, padding: '4px 16px', borderRadius: 12}}>DISTRITO {tr.distrito.toUpperCase()}</span>
            {tr.lider && <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#0b0d14', background: '#f1cf6c', padding: '4px 16px', borderRadius: 12}}>LÍDER</span>}
            {morte && <span style={{fontFamily: FONT.comic, fontSize: 40, color: '#ff6b6b', textShadow: '0 4px 0 #000', marginLeft: 8}}>ELIMINADO · DIA {morte.turno.dia}</span>}
          </div>
          {!morte && est && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 760}}>
              {[
                ['VIDA', est.vida, '#b9ed88'],
                ['FOME', est.fome, '#f1cf6c'],
                ['SEDE', est.sede, '#83cdec'],
              ].map(([nome, valor, cor]) => (
                <div key={String(nome)} style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff'}}>
                  <span style={{width: 110}}>{nome}</span>
                  <div style={{flex: 1, height: 22, background: '#000', border: '3px solid #000', borderRadius: 8, overflow: 'hidden'}}>
                    <div style={{width: `${interpolate(frame, [0, 30], [0, Math.min(100, Number(valor))], {extrapolateRight: 'clamp'})}%`, height: '100%', background: String(cor)}} />
                  </div>
                  <span style={{width: 60, textAlign: 'right'}}>{Number(valor)}</span>
                </div>
              ))}
            </div>
          )}
          {corpo && (
            <div style={{...cardBase, padding: '22px 28px', maxWidth: 1000, opacity: clamp01(pop(frame, fps, 14))}}>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 20, color: '#ff8a8a', letterSpacing: 2, marginBottom: 8}}>
                {texto ? 'ÚLTIMA FALA' : '💭 ÚLTIMO PENSAMENTO SECRETO'}
              </div>
              <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 600, fontSize: 34, color: '#ffe3e3', lineHeight: 1.3}}>{corpo}</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- morte
export const ILMorte: React.FC<{dados: Partida | null; id: string}> = ({dados, id}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tr = tributo(id);
  const morte = dados ? mortePorId(dados, id) : null;
  const carimbo = pop(frame, fps, 14, 9);
  if (!tr) return null;
  const causa = morte ? (morte.causa === 'combate' && morte.por ? `combate, por ${tributo(morte.por)?.nome ?? morte.por}` : morte.causa) : '';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a0d12 0%, #05060a 80%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...cardBase, width: 900, padding: '48px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, position: 'relative', borderColor: tr.cor}}>
        <Retrato id={id} size={300} borda={tr.cor} cinza />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: '0 4px 0 #000'}}>{tr.nome}</div>
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: '#cfd6f5', letterSpacing: 2}}>
          {morte ? `DIA ${morte.turno.dia} · ${morte.turno.periodo.toUpperCase()} · ${nomeZona(morte.zona).toUpperCase()}` : ''}
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 32, color: '#ffd2d2'}}>{causa ? `causa: ${causa}` : ''}</div>
        <div
          style={{
            position: 'absolute', top: 40, right: 36, fontFamily: FONT.comic, fontSize: 96, color: '#ff3b3b', border: '8px solid #ff3b3b', borderRadius: 14,
            padding: '0 22px', transform: `rotate(-8deg) scale(${1.8 - 0.8 * carimbo})`, opacity: clamp01(carimbo * 1.5), textShadow: '0 5px 0 #000', background: 'rgba(10,6,8,.6)',
          }}
        >
          ELIMINADO
        </div>
        <div style={{position: 'absolute', left: 36, bottom: 30, opacity: 0.8}}>
          <Caveira size={56} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- infográficos de regras
const Titulo: React.FC<{texto: string; sub?: string}> = ({texto, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', opacity: clamp01(pop(frame, fps))}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 72, color: '#f0f3df', textShadow: '0 6px 0 #000'}}>{texto}</div>
      {sub && <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 32, color: '#cfd6f5', marginTop: 10}}>{sub}</div>}
    </div>
  );
};

const Distritos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)'}}>
      <Titulo texto="3 DISTRITOS, 12 TRIBUTOS" sub="cada distrito tem um LÍDER: os outros esperam ordens" />
      <div style={{position: 'absolute', top: 260, left: 90, right: 90, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40}}>
        {DISTRITOS.map((d, di) => (
          <div key={d.nome} style={{...cardBase, borderColor: d.cor, padding: '24px 20px', opacity: clamp01(pop(frame, fps, di * 12))}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: d.cor, textAlign: 'center', marginBottom: 16}}>{d.nome}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, justifyItems: 'center'}}>
              {TRIBUTOS.filter((t) => t.distrito === d.nome).map((t, i) => {
                const o = pop(frame, fps, di * 12 + 10 + i * 5, 12);
                return (
                  <div key={t.id} style={{transform: `scale(${0.4 + 0.6 * o})`, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: '#fff'}}>
                    <Retrato id={t.id} size={120} borda={t.cor} />
                    <div>{t.lider ? '★ ' : ''}{t.nome}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Status: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fome = interpolate(frame, [20, 150], [10, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sede = interpolate(frame, [40, 170], [10, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vida = interpolate(frame, [150, 240], [100, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const barra = (nome: string, valor: number, cor: string, aviso?: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34}}>
      <div style={{width: 220, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>{nome}</div>
      <div style={{flex: 1, height: 52, background: '#000', border: '4px solid #000', borderRadius: 14, overflow: 'hidden', position: 'relative'}}>
        <div style={{width: `${valor}%`, height: '100%', background: cor}} />
        {aviso && <div style={{position: 'absolute', right: 14, top: 8, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#fff'}}>{aviso}</div>}
      </div>
      <div style={{width: 110, textAlign: 'right', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>{Math.round(valor)}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)', padding: '0 180px', justifyContent: 'center'}}>
      <Titulo texto="VIDA, FOME E SEDE" sub="fome e sede sobem todo turno: em 100 você perde vida até morrer" />
      <div style={{marginTop: 140, opacity: clamp01(pop(frame, fps, 6))}}>
        {barra('FOME', fome, '#f1cf6c', fome >= 100 ? 'CRÍTICO' : undefined)}
        {barra('SEDE', sede, '#83cdec', sede >= 100 ? 'CRÍTICO' : undefined)}
        {barra('VIDA', vida, '#b9ed88', vida <= 0 ? 'ELIMINADO' : undefined)}
      </div>
    </AbsoluteFill>
  );
};

const Turnos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ativo = Math.floor(frame / 40) % 3;
  const cor = ['#f1cf6c', '#ff9f5a', '#7aa7ff'];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)'}}>
      <Titulo texto="UM DIA, TRÊS TURNOS" sub="todos decidem ao mesmo tempo · à noite o frio mata" />
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 50}}>
        {PERIODOS.map((p, i) => {
          const on = ativo === i;
          const o = pop(frame, fps, i * 6, 12);
          return (
            <div
              key={p}
              style={{
                ...cardBase, width: 400, height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                borderColor: on ? cor[i] : '#2a3440', transform: `translateY(${(1 - o) * 80}px) scale(${on ? 1.05 : 1})`, opacity: clamp01(o) * (on ? 1 : 0.55),
                background: on ? `${cor[i]}22` : 'rgba(12,16,26,.92)',
              }}
            >
              <div style={{fontSize: 96}}>{i === 0 ? '☀️' : i === 1 ? '🌤️' : '🌙'}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: cor[i], textTransform: 'uppercase'}}>{p}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const MAPA_ZONAS_BIOMA: Record<string, string> = {lago: 'ÁGUA POTÁVEL', caverna: 'ABRIGO E ÁGUA', praia_sul: 'ÁGUA DO MAR: NÃO BEBA', praia_leste: 'ÁGUA DO MAR: NÃO BEBA', pantano: 'MANGUE · COBRAS', cornucopia: 'SUPRIMENTOS'};

const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#0b1a22'}}>
      <Img src={staticFile('ilha/mapa.png')} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,.25)'}} />
      {Object.entries(ZONAS).map(([id, z], i) => {
        const o = pop(frame, fps, 10 + i * 9, 12);
        const tag = MAPA_ZONAS_BIOMA[id];
        return (
          <div key={id} style={{position: 'absolute', left: z.centro[0] / 2, top: z.centro[1] / 2, transform: `translate(-50%, -50%) scale(${o})`, textAlign: 'center', opacity: clamp01(o)}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#fff', background: 'rgba(8,12,20,.85)', padding: '4px 12px', borderRadius: 10, whiteSpace: 'nowrap'}}>{z.nome}</div>
            {tag && <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: '#0b0d14', background: '#f1cf6c', padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap'}}>{tag}</div>}
          </div>
        );
      })}
      <Titulo texto="A ILHA" sub="12 zonas · Cornucópia no centro · água, comida e abrigo são disputados" />
    </AbsoluteFill>
  );
};

const EVENTOS_REGRA = [
  {quando: 'DIA 2 · TARDE', texto: 'Paraquedas de suprimentos cai numa zona', cor: '#b9ed88'},
  {quando: 'DIA 3 · MANHÃ', texto: 'Nova regra: os 2 últimos do MESMO distrito vencem juntos', cor: '#f1cf6c'},
  {quando: 'DIA 4 · MANHÃ', texto: 'A maré sobe: praias e mangue inundados', cor: '#83cdec'},
  {quando: 'DIA 6+ · MANHÃ', texto: 'Névoa tóxica fecha zonas, uma a uma', cor: '#b9a6ff'},
];

const Eventos: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)'}}>
      <Titulo texto="A ARENA MUDA A ILHA" />
      <div style={{position: 'absolute', top: 430, left: 140, right: 140, height: 10, background: '#2a3440', borderRadius: 5}}>
        <div style={{width: `${interpolate(frame, [0, 180], [0, 100], {extrapolateRight: 'clamp'})}%`, height: '100%', background: '#f1cf6c', borderRadius: 5}} />
      </div>
      {EVENTOS_REGRA.map((e, i) => {
        const o = pop(frame, fps, 20 + i * 45, 12);
        return (
          <div key={e.quando} style={{position: 'absolute', top: 330, left: 140 + i * 420, width: 380, opacity: clamp01(o), transform: `translateY(${(1 - o) * 40}px)`}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: e.cor, border: '5px solid #0b0d14', margin: '0 auto 22px'}} />
            <div style={{...cardBase, borderColor: e.cor, padding: '18px 20px', textAlign: 'center'}}>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: e.cor, marginBottom: 8}}>{e.quando}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: '#fff', lineHeight: 1.25}}>{e.texto}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Dupla: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(frame, fps, 0, 12);
  const b = pop(frame, fps, 8, 12);
  const link = interpolate(frame, [30, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)'}}>
      <Titulo texto="REGRA DA DUPLA" sub="se só sobrarem DOIS do mesmo distrito, os dois vencem juntos" />
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 80}}>
        <div style={{transform: `translateX(${(1 - a) * -200}px)`, opacity: clamp01(a), textAlign: 'center'}}>
          <Retrato id="ds1" size={300} borda="#4FC3F7" />
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', marginTop: 12}}>DeepSeek 1</div>
        </div>
        <svg width={260} height={80} viewBox="0 0 260 80">
          <line x1={0} y1={40} x2={260 * link} y2={40} stroke="#f1cf6c" strokeWidth={12} strokeLinecap="round" strokeDasharray="20 14" />
          <text x={130} y={24} textAnchor="middle" fill="#f1cf6c" fontSize={30} fontFamily={FONT.display} fontWeight={900}>MESMO</text>
        </svg>
        <div style={{transform: `translateX(${(1 - b) * 200}px)`, opacity: clamp01(b), textAlign: 'center'}}>
          <Retrato id="ds2" size={300} borda="#4FC3F7" />
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', marginTop: 12}}>DeepSeek 2</div>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 48, color: '#b9ed88', opacity: clamp01(pop(frame, fps, 80))}}>
        DOIS VENCEM · SÃO DO MESMO DISTRITO
      </div>
    </AbsoluteFill>
  );
};

export const ILRegra: React.FC<{item: 'distritos' | 'status' | 'turnos' | 'mapa' | 'eventos' | 'dupla'}> = ({item}) => {
  switch (item) {
    case 'distritos':
      return <Distritos />;
    case 'status':
      return <Status />;
    case 'turnos':
      return <Turnos />;
    case 'mapa':
      return <Mapa />;
    case 'eventos':
      return <Eventos />;
    case 'dupla':
      return <Dupla />;
    default:
      return null;
  }
};

// ---------------------------------------------------------------- placar
const CAUSAS = ['combate', 'fome', 'sede', 'névoa', 'afogamento', 'frio'];

export const ILPlacar: React.FC<{partidas: Record<string, Partida>}> = ({partidas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colunas = [
    {chave: 'oficial', titulo: 'PARTIDA OFICIAL', cor: '#f1cf6c'},
    {chave: 'teste', titulo: 'PARTIDA DE TESTE (ABORTADA)', cor: '#83cdec'},
  ].map((c) => {
    const p = partidas[c.chave];
    const mortes = (p?.turnos ?? []).flatMap((t) => t.eventos.filter((e) => e.tipo === 'morte').map((e) => String(e.causa ?? 'outra')));
    const contagem = Object.fromEntries(CAUSAS.map((k) => [k, mortes.filter((m) => m === k).length]));
    const outras = [...new Set(mortes)].filter((m) => !CAUSAS.includes(m));
    const venc = p?.fim?.vencedores?.map((id) => tributo(id)?.nome ?? id).join(' + ');
    return {...c, p, mortes: mortes.length, contagem, outras, venc};
  });
  const max = Math.max(1, ...colunas.flatMap((c) => Object.values(c.contagem)));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #070b12 80%)', padding: '60px 120px'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#f0f3df', textAlign: 'center', textShadow: '0 5px 0 #000'}}>COMO MORRERAM</div>
      <div style={{display: 'flex', gap: 60, marginTop: 40}}>
        {colunas.map((c, ci) => (
          <div key={c.chave} style={{...cardBase, flex: 1, padding: '28px 36px', borderColor: c.cor, opacity: clamp01(pop(frame, fps, ci * 10))}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: c.cor, marginBottom: 20}}>{c.titulo}</div>
            {CAUSAS.map((k, i) => {
              const v = c.contagem[k];
              const w = interpolate(frame, [30 + i * 8, 90 + i * 8], [0, (v / max) * 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: '#fff'}}>
                  <span style={{width: 200, textTransform: 'uppercase'}}>{k}</span>
                  <div style={{flex: 1, height: 30, background: '#000', borderRadius: 8, overflow: 'hidden'}}>
                    <div style={{width: `${w}%`, height: '100%', background: c.cor}} />
                  </div>
                  <span style={{width: 50, textAlign: 'right'}}>{v}</span>
                </div>
              );
            })}
            {c.outras.length > 0 && <div style={{fontFamily: FONT.display, fontSize: 22, color: '#cfd6f5'}}>outras: {c.outras.join(', ')}</div>}
            <div style={{marginTop: 18, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff'}}>
              {c.mortes} eliminações
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', opacity: clamp01(pop(frame, fps, 120))}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: '#b9ed88', textShadow: '0 5px 0 #000'}}>
          VENCEDOR: {colunas[0].venc ?? '—'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

