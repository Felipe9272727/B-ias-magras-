// Short do Among Us 4 (1080×1920): "essa IA QUIS ser expulsa" — o Bordô (DeepSeek), Possuidor da partida bônus (log 5).
// Cópia do molde do ShortPalhaco (AU3), que deu certo: a partida na vertical seguindo quem importa, selos no ritmo da
// fala, o chat secreto dos impostores em cartão grande, e as telas de reunião/ejeção do vídeo encaixadas no meio.
// Narração em scripts/short_au4_possuidor.py (fatos conferidos em amongus/logs4/partida5.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Crewmate} from '../amongus/Crewmate';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import {EMPRESA, Mundo, SonsJogo, type Skins} from '../amongus3/Jogo';
import {Ejecao2, Votacao} from '../amongus3/Telas';
import {simular, type Partida2} from '../amongus3/sim';

type Palavra = {w: string; s: number; e: number; chef?: string};
type Aud = {src: string; at: number; de: number; ate?: number; chef?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};
type Dados = {blocos: Bloco[]; p: Partida2; skins: Skins};

export const calcShortPossuidor: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_au4/short_au4.json'))).json();
  const tl = await (await fetch(staticFile('timeline_au4.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, p: tl.data.partidas['5'], skins: tl.data.skins}}};
};

const W = 1080;
const H = 1920;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const DEEPSEEK = EMPRESA['DeepSeek Flash'].cor;
const ROXO_FANTASMA = '#8e5cf7';
const nb = (b: Bloco, w: string, n = 1) => naPalavra(b as never, w, n);
const fala = (b: Bloco, n = 1) => b.audios.filter((a) => a.chef)[n - 1];
const fimFala = (b: Bloco, n = 1) => { const a = fala(b, n); return a ? a.at + (a.ate ?? 120) : 0 };

// a partida na vertical seguindo `foco`, a partir do quadro `de` da simulação
const JogoV: React.FC<{d: Dados; de: number; dur: number; foco?: string; escala?: number}> = ({d, de, dur, foco = 'Bordo', escala = 1.6}) => {
  const frame = useCurrentFrame();
  const s = simular(d.p);
  const f = de + frame;
  let cx = 0, cy = 0, n = 0;
  for (let k = 0; k < 8; k++) {
    const q = s.q(foco, f - k);
    if (q) { cx += q.x; cy += q.y; n++ }
  }
  if (!n) { const c = s.corpos(f).find((c) => c.cor === foco); cx = c?.x ?? 1500; cy = c?.y ?? 800; n = 1 }
  cx /= n; cy = cy / n - 40;
  const morte = s.eventos.find((e) => e.tipo === 'morte' && f >= e.quadro && f < e.quadro + 14 && Math.hypot(e.x - cx, e.y - cy) < 700);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Mundo p={d.p} s={s} f={f} frame={frame} cx={cx} cy={cy} escala={escala} w={W} h={H} papeis skins={d.skins} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 46% at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)'}} />
      {morte && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morte.quadro, [0, 3, 14], [0, 0.55, 0], cl)}} />}
      <SonsJogo s={s} de={de} dur={dur} foco={foco} />
    </AbsoluteFill>
  );
};

// uma tela 1920×1080 do vídeo encaixada no meio da vertical, com o fundo desfocado
const Tela: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#070b14'}}>
    <div style={{position: 'absolute', left: -420, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: '50% 0', filter: 'blur(26px) brightness(0.45)'}}>{children}</div>
    <div style={{position: 'absolute', left: 0, top: 720, width: 1920, height: 1080, transform: 'scale(0.5625)', transformOrigin: '0 0', borderTop: '6px solid #fff3', borderBottom: '6px solid #fff3'}}>{children}</div>
  </AbsoluteFill>
);

const Etiqueta: React.FC<{cor: string}> = ({cor}) => (
  <span style={{fontSize: 22, padding: '2px 10px', borderRadius: 8, color: '#fff', background: DEEPSEEK, marginLeft: 8}}>
    {cor === 'Cinza' ? 'Bordô no corpo do Cinza 👻' : 'DeepSeek · POSSUIDOR 👻'}
  </span>
);

// balão de fala da reunião (a voz da IA está tocando)
const FalaCard: React.FC<{cor: string; texto: string; at: number; ate: number; top?: number}> = ({cor, texto, at, ate, top = 300}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at || f > ate + 20) return null;
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const sai = interpolate(f, [ate, ate + 20], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, opacity: k * sai, transform: `translateY(${(1 - k) * -60}px)`}}>
      <div style={{background: '#fff', borderRadius: 26, border: '6px solid #000', padding: '22px 26px 22px 150px', boxShadow: '0 14px 0 #0008', position: 'relative', minHeight: 130}}>
        <div style={{position: 'absolute', left: 20, top: 16}}><Crewmate cor={cor} size={110} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#000'}}>{cor === 'Bordo' ? 'Bordô' : cor}<Etiqueta cor={cor} /></div>
        <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.18, color: '#111'}}>“{texto}”</div>
      </div>
    </div>
  );
};

// o chat secreto dos impostores, em cartão grande (a mensagem é a do log)
const ChatCard: React.FC<{cor: string; texto: string; destaque: string; at: number; ate: number; top?: number}> = ({cor, texto, destaque, at, ate, top = 1120}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at || f > ate + 15) return null;
  const k = spring({frame: f - at, fps, config: {damping: 12, stiffness: 200}});
  const sai = interpolate(f, [ate, ate + 15], [1, 0], cl);
  const [a, z] = texto.split(destaque);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, opacity: sai, transform: `scale(${0.6 + 0.4 * k}) rotate(-1.5deg)`}}>
      <div style={{background: 'rgba(40,6,10,.96)', borderRadius: 26, border: '6px solid #ff3b3b', padding: '18px 26px 22px 140px', boxShadow: '0 0 40px #ff3b3b88, 0 12px 0 #000', position: 'relative'}}>
        <div style={{position: 'absolute', left: 18, top: 22}}><Crewmate cor={cor} size={100} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 28, letterSpacing: 2, color: '#ff8a8a'}}>🔒 CHAT DOS IMPOSTORES · {cor === 'Bordo' ? 'BORDÔ' : cor.toUpperCase()}</div>
        <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 800, fontSize: 40, lineHeight: 1.18, color: '#fff'}}>
          “{a}<span style={{color: '#ffd21f'}}>{destaque}</span>{z}”
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- blocos
type PB = {d: Dados; b: Bloco};
const sim = (d: Dados) => simular(d.p);
const tq = (d: Dados, t: number) => sim(d).inicioTique[t] ?? 0;
const quadroDe = (d: Dados, tipo: string, t: number) => sim(d).eventos.find((e) => e.tipo === tipo && (e as {tique?: number}).tique === t)?.quadro ?? tq(d, t);

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.3, 1.06])})`}}>
        <JogoV d={d} de={quadroDe(d, 'possessao_corpo', 55) - 10} dur={b.dur} foco="Cinza" escala={1.8} />
      </AbsoluteFill>
      <Selo txt="👻 POSSUIDOR" cor={ROXO_FANTASMA} at={6} y={300} rot={-3} size={76} />
      <Selo txt="QUIS SER EXPULSO" at={nb(b, 'expulsa')} y={440} rot={3} size={64} />
      <Selo txt="💀 PRA VOLTAR NUM MORTO" cor="#111" at={nb(b, 'corpo')} y={560} rot={-2} size={54} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
      <Sfx src="glitch" at={nb(b, 'corpo')} vol={0.4} />
    </AbsoluteFill>
  );
};

const Regra: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <JogoV d={d} de={tq(d, 50)} dur={b.dur} />
    <Selo txt="IA DO DEEPSEEK 🤖" cor={DEEPSEEK} at={nb(b, 'DeepSeek')} y={300} rot={3} size={62} />
    <Selo txt="👻 POSSUIDOR" cor={ROXO_FANTASMA} at={nb(b, 'Possuidor')} y={420} rot={-3} size={66} />
    <Selo txt="MORREU = REVIVE NUM MORTO" cor="#1f8f3a" at={nb(b, 'revive')} y={545} rot={2} size={50} />
    <Sfx src="pop" at={nb(b, 'DeepSeek')} />
    <Sfx src="powerup-8bit" at={nb(b, 'Possuidor')} vol={0.4} />
    <Sfx src="level-up" at={nb(b, 'revive')} vol={0.4} />
  </AbsoluteFill>
);

const Plano: React.FC<PB> = ({d, b}) => {
  const tMata = nb(b, 'mata', 2);
  const morte = quadroDe(d, 'morte', 53);
  return (
    <AbsoluteFill>
      <JogoV d={d} de={Math.max(0, morte - tMata)} dur={b.dur} escala={1.8} />
      <Selo txt="🔒 CHAT SECRETO" cor="#c0392b" at={nb(b, 'chat')} y={300} rot={-3} size={64} />
      <ChatCard cor="Bordo" at={nb(b, 'vou')} ate={tMata - 4} destaque="pra me expulsarem"
        texto="Coral, vou matar Lima na frente de Preto/Roxo pra me expulsarem. Se eu morrer/for expulso, revivo como Possuidor em algum corpo morto." />
      <Selo txt="🔪 NA FRENTE DAS TESTEMUNHAS" at={nb(b, 'testemunhas')} y={430} rot={3} size={50} />
      <Sfx src="notification-pop" at={nb(b, 'vou')} vol={0.5} />
      <Sfx src="gasp" at={nb(b, 'testemunhas')} vol={0.45} />
    </AbsoluteFill>
  );
};

const Expulso: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b);
  const tDez = nb(b, 'Dez');
  const tExp = nb(b, 'Expulso');
  const k = Math.max(0, f - tDez);
  return (
    <AbsoluteFill>
      {f < tExp ? (
        <Tela><Votacao p={d.p} idx={1} fase={f >= tDez ? 'votacao' : 'discussao'} votos={f >= tDez ? Math.min(1, k / 30) : 0} chat={false} timer={f >= tDez ? 0 : 45} /></Tela>
      ) : (
        <Sequence from={tExp} layout="none"><Ejecao2 p={d.p} idx={1} /></Sequence>
      )}
      <Selo txt="🎭 TEATRO" cor="#e67e22" at={nb(b, 'teatro')} y={300} rot={-3} size={70} />
      <FalaCard cor="Bordo" texto="Engraçado que o Laranja só apareceu no Reator no fim, mas jura que viu tudo" at={a.at} ate={fimFala(b)} top={430} />
      <Selo txt="🗳️ 10 VOTOS" at={tDez} y={300} rot={-3} size={76} />
      <Selo txt="✅ COMO ELE PLANEJOU" cor="#1f8f3a" at={nb(b, 'planejou')} y={1250} rot={2} size={60} />
      <Sfx src="crowd-boo" at={tDez} vol={0.3} />
      <Sfx src="ba-dum-tss" at={nb(b, 'planejou') + 8} vol={0.4} />
    </AbsoluteFill>
  );
};

const Volta: React.FC<PB> = ({d, b}) => {
  const tLev = nb(b, 'levanta');
  const pos = quadroDe(d, 'possessao_corpo', 55);
  return (
    <AbsoluteFill>
      <JogoV d={d} de={Math.max(0, pos - tLev)} dur={b.dur} foco="Cinza" escala={1.9} />
      <Selo txt="💀 MORTO DESDE O TIQUE 5" cor="#111" at={nb(b, 'cinco')} y={300} rot={-3} size={58} />
      <Selo txt="👻 LEVANTOU" cor={ROXO_FANTASMA} at={tLev} y={420} rot={3} size={80} />
      <ChatCard cor="Bordo" at={nb(b, 'chat')} ate={b.dur} destaque="voltei no corpo do Cinza"
        texto="Sou eu, Bordo, voltei no corpo do Cinza. Não me mate — age normal que eu finjo ser ele." />
      <Sfx src="riser" at={Math.max(0, tLev - 30)} vol={0.4} />
      <Sfx src="impact-epic" at={tLev} vol={0.5} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b);
  const tSeis = nb(b, 'Seis');
  const tExp = nb(b, 'Expulso');
  const k = Math.max(0, f - tSeis);
  return (
    <AbsoluteFill>
      {f < tExp ? (
        <Tela><Votacao p={d.p} idx={3} fase={f >= tSeis ? 'votacao' : 'discussao'} votos={f >= tSeis ? Math.min(1, k / 30) : 0} chat={false} timer={f >= tSeis ? 0 : 45} /></Tela>
      ) : (
        <Sequence from={tExp} layout="none"><Ejecao2 p={d.p} idx={3} mostrarPapel={false} /></Sequence>
      )}
      <Selo txt="👀 TODO MUNDO VIU" cor="#111" at={nb(b, 'inteira')} y={300} rot={2} size={60} />
      <FalaCard cor="Cinza" texto="Não morri nada, gente" at={a.at} ate={fimFala(b) + 10} top={430} />
      {f > fimFala(b) && <Selo txt="🤥 NÃO MORRI NADA" cor="#e67e22" at={fimFala(b)} y={430} rot={-3} size={66} />}
      <Selo txt="🗳️ EXPULSO DE NOVO" at={tExp} y={1200} rot={3} size={66} />
      <Selo txt="SEM VOLTA ❌" cor="#111" at={nb(b, 'volta')} y={1320} rot={-2} size={70} />
      <Sfx src="crowd-laugh" at={fimFala(b)} vol={0.35} />
      <Sfx src="sad-trombone" at={nb(b, 'volta')} vol={0.4} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, regra: Regra, plano: Plano, expulso: Expulso, volta: Volta, fim: Fim};

export const ShortPossuidor: React.FC<{dados: Dados | null}> = ({dados}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {dados.blocos.map((b) => {
        const de = t;
        t += b.dur;
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C d={dados} b={b} />}
            <Legenda palavras={b.palavras.filter((p) => !p.chef)} y={1560} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.08} />
    </AbsoluteFill>
  );
};
