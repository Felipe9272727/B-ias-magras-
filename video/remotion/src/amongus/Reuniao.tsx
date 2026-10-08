import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate, COR} from './Crewmate';
import {ORDEM, papelDe, Partida, siglaModelo} from './dados';
import {FONT} from '../theme';

const Badge: React.FC<{modelo: string; size?: number}> = ({modelo, size = 14}) => {
  const ds = siglaModelo(modelo) === 'DeepSeek';
  return (
    <span style={{fontSize: size, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: ds ? '#2f6bff' : '#d97a47', color: '#fff', fontFamily: FONT.display}}>
      {ds ? 'DeepSeek' : 'Haiku'}
    </span>
  );
};

const Cabeca: React.FC<{cor: string; size: number; morto?: boolean}> = ({cor, size, morto}) => (
  <div style={{width: size, height: size * 0.8, overflow: 'hidden', position: 'relative', filter: morto ? 'grayscale(0.7) brightness(0.6)' : undefined}}>
    <Crewmate cor={cor} size={size} />
  </div>
);

type Props = {
  p: Partida;
  indice: number; // qual reunião
  falaDe?: number; // primeira fala visível
  falaAte?: number; // última fala (exclusiva)
  framesPorFala?: number;
  inicioFalas?: number[]; // alternativa: frame em que cada fala aparece (relativo)
  votos?: boolean; // fase de votação
  pensamentoDe?: string; // mostra o pensamento secreto de quem fala, se for essa cor
  mostrarPapeis?: boolean;
  chat?: {cor: string; texto: string; at: number; pensamento?: string}[]; // falas na ordem do roteiro, com o quadro em que aparecem
  duracao?: number; // na votação: espalha os votos pela cena
};

export const Reuniao: React.FC<Props> = ({p, indice, falaDe = 0, falaAte, framesPorFala = 75, inicioFalas, votos, pensamentoDe, mostrarPapeis, chat, duracao}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = p.reunioes[indice];
  const ate = falaAte ?? r.falas.length;
  const falas = chat
    ? chat.map((c) => ({cor: c.cor, rodada: 0, texto: c.texto, pensamento: c.pensamento ?? ''}))
    : r.falas.slice(falaDe, ate);
  const quando = (i: number) => (chat ? chat[i].at : inicioFalas ? inicioFalas[i] : i * framesPorFala);
  if (chat) pensamentoDe = '*';
  const visiveis = falas.filter((_, i) => frame >= quando(i));
  const mortos = new Set(p.eventos.filter((e) => e.tipo === 'morte' && e.tique <= r.tique).map((e) => e.vitima));
  for (const q of p.reunioes) if (q.expulso && q.tique < r.tique) mortos.add(q.expulso);
  const entrada = spring({frame, fps, config: {damping: 16}});
  const ultima = visiveis[visiveis.length - 1];

  // votação: cada voto aparece em sequência
  const ordemVotos = Object.entries(r.votos);
  const passo = duracao ? Math.max(8, Math.min(24, (duracao * 0.6) / Math.max(1, Object.keys(r.votos).length))) : 14;
  const votoVisivel = (i: number) => votos && frame >= 15 + i * passo;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b52 0%, #070a16 80%)', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          width: 1780, height: 960, background: '#c3cbe0', border: '10px solid #0b0d14', borderRadius: 34, display: 'flex', gap: 24, padding: 28,
          transform: `scale(${0.9 + 0.1 * entrada}) translateY(${(1 - entrada) * 60}px)`, boxShadow: '0 20px 0 rgba(0,0,0,.4)',
        }}
      >
        {/* esquerda: jogadores */}
        <div style={{width: 760, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#0b0d14', textAlign: 'center'}}>
            {votos ? 'QUEM É O IMPOSTOR?' : r.tipo === 'corpo' ? '☠️ CORPO ENCONTRADO' : '🚨 REUNIÃO DE EMERGÊNCIA'}
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            {ORDEM.map((cor) => {
              const morto = mortos.has(cor);
              const info = papelDe(p, cor);
              const falando = ultima?.cor === cor && !votos;
              const recebidos = ordemVotos.map(([de, para], i) => ({de, para, i})).filter((v) => v.para === cor && votoVisivel(v.i));
              const votou = votos && ordemVotos.findIndex(([de]) => de === cor) >= 0 && votoVisivel(ordemVotos.findIndex(([de]) => de === cor));
              return (
                <div
                  key={cor}
                  style={{
                    height: 150, borderRadius: 14, border: `5px solid ${falando ? '#f5f557' : '#0b0d14'}`, background: morto ? '#7d8396' : '#eef1f8',
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', position: 'relative', opacity: morto ? 0.75 : 1,
                  }}
                >
                  <Cabeca cor={cor} size={84} morto={morto} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start'}}>
                    <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: mostrarPapeis && info.time === 'impostor' ? '#d10000' : '#0b0d14'}}>
                      {cor} {r.chamador === cor ? '📣' : ''}
                    </div>
                    <Badge modelo={info.modelo} />
                    <div style={{display: 'flex', gap: 4, minHeight: 30}}>
                      {recebidos.map((v) => (
                        <div key={v.de} style={{width: 30, height: 30, borderRadius: 15, background: COR[v.de].body, border: '3px solid #000'}} />
                      ))}
                    </div>
                  </div>
                  {morto && <div style={{position: 'absolute', right: 18, top: 10, fontSize: 64, color: '#c00000', fontWeight: 900, fontFamily: FONT.display}}>✖</div>}
                  {votou && <div style={{position: 'absolute', right: 12, bottom: 10, padding: '2px 8px', background: '#d10000', color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 16, borderRadius: 6, transform: 'rotate(-8deg)'}}>VOTOU</div>}
                </div>
              );
            })}
          </div>
          {votos && (
            <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#0b0d14'}}>
              PULAR:
              {ordemVotos.map(([de, para], i) => (para === 'pular' && votoVisivel(i) ? <div key={de} style={{width: 30, height: 30, borderRadius: 15, background: COR[de].body, border: '3px solid #000'}} /> : null))}
            </div>
          )}
        </div>
        {/* direita: chat */}
        <div style={{flex: 1, background: '#f4f6fb', border: '6px solid #0b0d14', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, overflow: 'hidden'}}>
          {votos && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center', height: '100%'}}>
              {ordemVotos.map(([de, para], i) =>
                votoVisivel(i) ? (
                  <div key={de} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#0b0d14'}}>
                    <Cabeca cor={de} size={64} />
                    <span>{de}</span>
                    <span style={{color: '#888'}}>➜</span>
                    {para === 'pular' ? <span style={{color: '#666'}}>pulou</span> : (<><Cabeca cor={para} size={64} /><span style={{color: COR[para].shade}}>{para}</span></>)}
                  </div>
                ) : null,
              )}
            </div>
          )}
          {!votos && visiveis.slice(-5).map((f) => {
            const i = falas.indexOf(f);
            const t = frame - quando(i);
            const o = interpolate(t, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
            const info = papelDe(p, f.cor);
            return (
              <div key={i} style={{display: 'flex', gap: 12, alignItems: 'flex-start', opacity: o, transform: `translateY(${(1 - o) * 30}px)`}}>
                <Cabeca cor={f.cor} size={62} />
                <div style={{flex: 1, background: '#fff', border: '4px solid #0b0d14', borderRadius: 14, padding: '8px 14px'}}>
                  <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 20, color: COR[f.cor].shade, display: 'flex', gap: 8, alignItems: 'center'}}>
                    {f.cor} <Badge modelo={info.modelo} size={12} />
                  </div>
                  <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 25, color: '#111', lineHeight: 1.25}}>{f.texto}</div>
                  {(pensamentoDe === f.cor || pensamentoDe === '*') && f.pensamento && (
                    <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 600, fontStyle: 'italic', fontSize: 21, color: '#b00000'}}>💭 (pensando: {f.pensamento})</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Tela de expulsão: tripulante girando no espaço + texto digitado
export const Ejecao: React.FC<{p: Partida; indice: number}> = ({p, indice}) => {
  const frame = useCurrentFrame();
  const r = p.reunioes[indice];
  const txt = r.expulso ? `${r.expulso} ${r.eraImpostor ? 'era' : 'não era'} um impostor.` : r.empate ? 'Ninguém foi expulso. (Empate)' : 'Ninguém foi expulso. (Pulado)';
  const n = Math.floor(interpolate(frame, [50, 50 + txt.length * 2.2], [0, txt.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const x = interpolate(frame, [0, 170], [-200, 2100]);
  const stars = React.useMemo(() => Array.from({length: 120}, (_, i) => ({x: (i * 7919) % 1920, y: (i * 104729) % 1080, r: 1 + (i % 3)})), []);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {stars.map((s, i) => (
          <circle key={i} cx={(s.x + frame * (1 + (i % 3))) % 1920} cy={s.y} r={s.r} fill="#fff" opacity={0.6} />
        ))}
      </svg>
      {r.expulso && (
        <div style={{position: 'absolute', left: x, top: 430, transform: `rotate(${frame * 6}deg)`}}>
          <Crewmate cor={r.expulso} size={170} />
        </div>
      )}
      <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: '#fff'}}>
        {txt.slice(0, n)}
      </div>
    </AbsoluteFill>
  );
};

// Tela de revelação de papel (início da partida)
export const RevelaPapel: React.FC<{p: Partida; cor: string}> = ({p, cor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const info = papelDe(p, cor);
  const imp = info.time === 'impostor';
  const s = spring({frame, fps, config: {damping: 14}});
  const time = p.jogadores.filter((j) => (imp ? j.time === 'impostor' : true));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 70%, ' + (imp ? '#5a0000' : '#0a2a5a') + ' 0%, #000 70%)', alignItems: 'center'}}>
      <div style={{marginTop: 120, fontFamily: FONT.display, fontWeight: 900, fontSize: 140, color: imp ? '#ff1a1a' : '#8ad8ff', transform: `scale(${s})`, letterSpacing: 4}}>
        {imp ? 'IMPOSTOR' : 'TRIPULANTE'}
      </div>
      <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: '#ddd'}}>{info.papel !== 'Impostor' && info.papel !== 'Tripulante' ? info.papel : ''}</div>
      <div style={{display: 'flex', gap: 30, marginTop: 80, alignItems: 'flex-end'}}>
        {time.map((j, i) => (
          <div key={j.cor} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: interpolate(frame, [10 + i * 4, 20 + i * 4], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'})}}>
            <Crewmate cor={j.cor} size={j.cor === cor ? 190 : 130} />
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: '#fff'}}>{j.cor}</div>
            <Badge modelo={j.modelo} size={18} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
