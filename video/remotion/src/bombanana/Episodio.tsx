// Episódio do BOMBANANA! das IAs: toca a linha do tempo montada por video/scripts/bb_timeline.py a partir das
// gravações do motor (bombanana/jogo.mjs). Blocos: título, cartão da fase, rodada (falas com voz, gesto do Mudo, ação
// do Cego na bomba), visão do Cego (contornos brancos no preto, como no jogo), explosão, vitória, narrador e placar.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Macaco, Papel} from './Macaco';
import {Bomba, Modulo} from './Bomba';
import {Sala, Lugar} from './Sala';
import {FONT} from '../theme';

export type Fala = {quem: string; papel: Papel; texto: string; audio?: string; ini: number; dur: number; pensa?: boolean};
export type Bloco = {
  tipo: string; dur: number; audio?: {src: string; ini: number; vol?: number}[];
  fase?: any; time?: Record<Papel, string>; lugar?: Lugar; resta?: number; erros?: number; maxErros?: number;
  modulos?: Modulo[]; modulosDepois?: Modulo[]; caos?: {apagao?: boolean; alarme?: boolean};
  falas?: Fala[]; gesto?: {quem: string; gesto: string; ini: number}; acao?: {ini: number; modulo: number; tipo: string; valor: any; ok: boolean | null; texto: string};
  texto?: string; titulo?: string; sub?: string; placar?: any;
};
export type Timeline = {blocos: Bloco[]; cores: Record<string, string>; modelos: Record<string, string>; musica?: string};

const LEGENDA_GESTO: Record<string, (v?: string) => string> = {
  polegar_cima: () => 'JOINHA', polegar_baixo: () => 'POLEGAR PRA BAIXO', dedos: (v) => `${v} DEDO${v === '1' ? '' : 'S'}`,
  apontar: (v) => `APONTA PRA ${String(v).toUpperCase()}`, apontar_banana: (v) => `APONTA A BANANA ${String(v).toUpperCase()}`,
  mao_parada: () => 'ESPERA!', repetir: () => 'DE NOVO!', cabeca_sim: () => 'BALANÇA A CABEÇA: SIM', cabeca_nao: () => 'BALANÇA A CABEÇA: NÃO',
  tapa: () => 'TAPA!', jogar_banana: () => 'JOGOU UMA BANANA!',
};
const legendaGesto = (g: string) => { const [a, b] = g.split(':'); return (LEGENDA_GESTO[a] ?? (() => a.toUpperCase()))(b); };

const Etiqueta: React.FC<{nome: string; papel: Papel; cor: string; modelo: string}> = ({nome, papel, cor, modelo}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
    <div style={{background: cor, color: '#fff', fontFamily: FONT.comic, fontSize: 40, padding: '2px 18px', borderRadius: 12, border: '4px solid #0006', letterSpacing: 1}}>{nome}</div>
    <div style={{background: '#000a', color: '#fff', fontFamily: FONT.display, fontWeight: 800, fontSize: 20, padding: '2px 10px', borderRadius: 8}}>{papel.toUpperCase()} · {modelo}</div>
  </div>
);

const Balao: React.FC<{texto: string; pensa?: boolean; lado: 'esq' | 'dir' | 'meio'; cor: string; f: number}> = ({texto, pensa, lado, cor, f}) => {
  const s = spring({frame: f, fps: 30, config: {damping: 14}});
  return (
    <div style={{position: 'absolute', top: 40, ...(lado === 'esq' ? {left: 60} : lado === 'dir' ? {right: 60} : {left: 560}), maxWidth: 800, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: lado === 'dir' ? 'top right' : 'top left',
      background: pensa ? '#ffffffd9' : '#fff', border: `6px ${pensa ? 'dashed' : 'solid'} ${cor}`, borderRadius: pensa ? 60 : 28, padding: '18px 26px',
      fontFamily: FONT.display, fontWeight: 700, fontSize: 36, color: '#1b1b1b', fontStyle: pensa ? 'italic' : 'normal', boxShadow: '0 10px 0 #0005'}}>
      {pensa ? <div style={{fontSize: 22, color: cor, fontWeight: 900, fontStyle: 'normal', marginBottom: 4}}>PENSANDO...</div> : null}
      {texto}
    </div>
  );
};

const Cronometro: React.FC<{resta: number; erros: number; maxErros: number}> = ({resta, erros, maxErros}) => (
  <div style={{position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 16, background: '#3b4a2a', border: '6px solid #111', borderRadius: 18, padding: '6px 22px'}}>
    <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 64, color: resta <= 30 ? '#ff5252' : '#9cff57'}}>{`${String(Math.floor(Math.max(0, resta) / 60)).padStart(2, '0')}:${String(Math.max(0, Math.floor(resta % 60))).padStart(2, '0')}`}</div>
    <div style={{display: 'flex', gap: 6}}>{Array.from({length: maxErros}, (_, i) => <span key={i} style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: i < erros ? '#ff3b30' : '#55663f'}}>X</span>)}</div>
  </div>
);

// visão do Cego: a mesma bomba só com contornos brancos no preto (filtro de borda), e a mão branca
const POVCego: React.FC<{modulos: Modulo[]; f: number; modulo: number}> = ({modulos, f, modulo}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg width={0} height={0}><filter id="contorno"><feColorMatrix type="saturate" values="0" /><feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" /><feColorMatrix type="matrix" values="4 0 0 0 0  4 0 0 0 0  4 0 0 0 0  0 0 0 1 0" /></filter></svg>
    <div style={{position: 'absolute', inset: '60px 360px', filter: 'url(#contorno)'}}><Bomba modulos={modulos} resta={0} erros={0} maxErros={1} /></div>
    <svg viewBox="0 0 200 260" style={{position: 'absolute', width: 260, left: 760 + ((modulo - 1) % 2) * 240 + Math.sin(f / 8) * 8, top: 420 + Math.floor((modulo - 1) / 2) * 200 + Math.cos(f / 9) * 6}}>
      <path d="M60 250 L60 120 Q60 100 75 100 Q90 100 90 120 L90 20 Q90 0 105 0 Q120 0 120 20 L120 110 L150 110 Q170 110 170 130 L170 250 Z" fill="#fff" />
    </svg>
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 48, color: '#fff', letterSpacing: 2}}>VISÃO DO CEGO</div>
  </AbsoluteFill>
);

const Rodada: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  const t = b.time!;
  const falaAgora = b.falas?.find((x) => f >= x.ini && f < x.ini + x.dur);
  const quemFala = falaAgora && !falaAgora.pensa ? falaAgora.quem : null;
  const boca = (n: string) => (quemFala === n ? 0.3 + 0.5 * Math.abs(Math.sin(f / 3)) : 0);
  const g = b.gesto && f >= b.gesto.ini ? b.gesto.gesto : '';
  const acaoAtiva = b.acao && f >= b.acao.ini;
  const mods = acaoAtiva ? b.modulosDepois ?? b.modulos! : b.modulos!;
  const fa = b.acao ? f - b.acao.ini : -1;
  const erro = acaoAtiva && b.acao!.ok === false && fa < 40;
  const tremor = erro ? Math.sin(fa * 2.3) * 18 * (1 - fa / 40) : 0;
  const pov = b.acao && fa >= -45 && fa < 0;  // 1,5 s de visão do Cego antes da ação
  const zoomBomba = acaoAtiva && fa < 75;
  return (
    <AbsoluteFill style={{transform: `translateX(${tremor}px)`}}>
      <Sala lugar={b.lugar ?? 'van'} frame={f} apagao={b.caos?.apagao} alarme={b.caos?.alarme} />
      <div style={{position: 'absolute', left: 100, top: 330, width: 520, height: 650}}><Macaco papel="Cego" cor={tl.cores[t.Cego]} boca={boca(t.Cego)} frame={f} gesto={acaoAtiva && fa < 30 ? 'apontar:direita' : ''} /></div>
      <div style={{position: 'absolute', left: 760, top: 200, width: 400, height: 500}}><Macaco papel="Mudo" cor={tl.cores[t.Mudo]} gesto={g} manual frame={f} /></div>
      <div style={{position: 'absolute', left: 1300, top: 300, width: 500, height: 620}}><Macaco papel="Surdo" cor={tl.cores[t.Surdo]} boca={boca(t.Surdo)} frame={f} piscar={f % 120 < 4} /></div>
      <div style={{position: 'absolute', left: 230, top: 930}}><Etiqueta nome={t.Cego} papel="Cego" cor={tl.cores[t.Cego]} modelo={tl.modelos[t.Cego]} /></div>
      <div style={{position: 'absolute', left: 820, top: 150}}><Etiqueta nome={t.Mudo} papel="Mudo" cor={tl.cores[t.Mudo]} modelo={tl.modelos[t.Mudo]} /></div>
      <div style={{position: 'absolute', left: 1420, top: 930}}><Etiqueta nome={t.Surdo} papel="Surdo" cor={tl.cores[t.Surdo]} modelo={tl.modelos[t.Surdo]} /></div>
      <div style={{position: 'absolute', left: 640, top: 640, width: 640, height: 380}}><Bomba modulos={mods} resta={b.resta ?? 0} erros={b.erros ?? 0} maxErros={b.maxErros ?? 3} fileira /></div>
      {g ? (
        <div style={{position: 'absolute', left: '50%', top: 560, transform: `translateX(-50%) scale(${spring({frame: f - b.gesto!.ini, fps: 30, config: {damping: 10}})})`, background: tl.cores[t.Mudo], color: '#fff', fontFamily: FONT.comic, fontSize: 54, padding: '6px 26px', borderRadius: 16, border: '5px solid #fff', boxShadow: '0 8px 0 #0006', whiteSpace: 'nowrap'}}>
          {`GESTO DO ${t.Mudo.toUpperCase()}: ${legendaGesto(g)}`}
        </div>
      ) : null}
      {falaAgora ? <Balao key={falaAgora.ini} texto={falaAgora.texto} pensa={falaAgora.pensa} f={f - falaAgora.ini} cor={tl.cores[falaAgora.quem]} lado={falaAgora.papel === 'Cego' ? 'esq' : falaAgora.papel === 'Surdo' ? 'dir' : 'meio'} /> : null}
      {zoomBomba ? (
        <AbsoluteFill style={{background: '#000b', opacity: interpolate(fa, [0, 6, 66, 75], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}}>
          <div style={{position: 'absolute', inset: '40px 460px 120px', transform: `scale(${interpolate(fa, [0, 10], [0.85, 1], {extrapolateRight: 'clamp'})})`}}><Bomba modulos={mods} resta={b.resta ?? 0} erros={b.erros ?? 0} maxErros={b.maxErros ?? 3} foco={b.acao!.modulo - 1} /></div>
          <div style={{position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 60, color: b.acao!.ok === false ? '#ff5252' : b.acao!.ok ? '#69f0ae' : '#fff', textShadow: '0 5px 0 #000'}}>
            {b.acao!.ok === false ? 'ERROU! ' : b.acao!.ok ? 'CERTO! ' : ''}{b.acao!.texto.replace(/: (certo|errado)$/, '').toUpperCase()}
          </div>
        </AbsoluteFill>
      ) : null}
      {pov ? <POVCego modulos={b.modulos!} f={f} modulo={b.acao!.modulo} /> : null}
      {b.caos?.apagao ? <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 70, color: '#ffeb3b'}}>APAGÃO! O SURDO NÃO VÊ NADA</div> : null}
      {b.caos?.alarme ? <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 70, color: '#fff', textShadow: '0 5px 0 #b71c1c'}}>ALARME! NINGUÉM OUVE NADA</div> : null}
      <Cronometro resta={b.resta ?? 0} erros={b.erros ?? 0} maxErros={b.maxErros ?? 3} />
      <div style={{position: 'absolute', top: 30, left: 30, fontFamily: FONT.comic, fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000'}}>FASE {b.fase?.n}</div>
    </AbsoluteFill>
  );
};

const Cartao: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  const s = spring({frame: f, fps: 30, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #ffd54f 0%, #ff8f00 60%, #6d2c00 100%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT.comic, fontSize: 180, color: '#fff', textShadow: '0 10px 0 #6d2c00', transform: `scale(${s})`}}>{b.titulo}</div>
      {b.sub ? <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 52, color: '#3e1a00'}}>{b.sub}</div> : null}
      {b.time ? (
        <div style={{display: 'flex', gap: 60, marginTop: 40}}>
          {(['Cego', 'Surdo', 'Mudo'] as Papel[]).map((p, i) => (
            <div key={p} style={{width: 300, height: 380, transform: `translateY(${(1 - spring({frame: f - 8 - i * 6, fps: 30})) * 400}px)`}}>
              <div style={{height: 300}}><Macaco papel={p} cor={tl.cores[b.time![p]]} manual={p === 'Mudo'} frame={f} /></div>
              <Etiqueta nome={b.time![p]} papel={p} cor={tl.cores[b.time![p]]} modelo={tl.modelos[b.time![p]]} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Explosao: React.FC<{b: Bloco}> = ({b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: f < 6 ? '#fff' : '#1a0800', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      {Array.from({length: 18}, (_, i) => {
        const a = (i / 18) * Math.PI * 2, d = interpolate(f, [0, 30], [0, 900], {extrapolateRight: 'clamp'});
        return <div key={i} style={{position: 'absolute', left: 960 + Math.cos(a) * d - 40, top: 540 + Math.sin(a) * d - 40, width: 80, height: 80, borderRadius: 40, background: i % 2 ? '#ff6d00' : '#ffd600', opacity: interpolate(f, [0, 40], [1, 0], {extrapolateRight: 'clamp'})}} />;
      })}
      <div style={{fontFamily: FONT.comic, fontSize: 260, color: '#ff3d00', textShadow: '0 12px 0 #000', transform: `scale(${spring({frame: f - 4, fps: 30, config: {damping: 8}})}) rotate(-6deg)`}}>{b.titulo ?? 'BOOM!'}</div>
      {b.sub ? <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#fff'}}>{b.sub}</div> : null}
    </AbsoluteFill>
  );
};

const Vitoria: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle, #b2ff59 0%, #2e7d32 75%)', alignItems: 'center', justifyContent: 'center'}}>
      {Array.from({length: 40}, (_, i) => <div key={i} style={{position: 'absolute', left: (i * 97) % 1920, top: ((f * (6 + (i % 5))) + i * 53) % 1100 - 40, width: 18, height: 30, background: ['#ffd600', '#e53935', '#1e88e5', '#fff'][i % 4], transform: `rotate(${f * 9 + i * 20}deg)`}} />)}
      <div style={{fontFamily: FONT.comic, fontSize: 200, color: '#fff', textShadow: '0 10px 0 #1b5e20', transform: `scale(${spring({frame: f, fps: 30, config: {damping: 9}})})`}}>{b.titulo ?? 'DESARMADA!'}</div>
      {b.sub ? <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#fff'}}>{b.sub}</div> : null}
      {b.time ? <div style={{display: 'flex', gap: 30, marginTop: 30}}>{(['Cego', 'Surdo', 'Mudo'] as Papel[]).map((p) => <div key={p} style={{width: 260, height: 320}}><Macaco papel={p} cor={tl.cores[b.time![p]]} gesto="polegar_cima" frame={f * 3} /></div>)}</div> : null}
    </AbsoluteFill>
  );
};

const Narrador: React.FC<{b: Bloco; tl: Timeline}> = ({b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sala lugar={b.lugar ?? 'van'} frame={f} />
      <AbsoluteFill style={{background: '#0009', alignItems: 'center', justifyContent: 'center', padding: 140}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', textAlign: 'center', lineHeight: 1.2, textShadow: '0 5px 0 #000'}}>{b.texto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<{b: Bloco; tl: Timeline}>> = {rodada: Rodada, fase: Cartao, titulo: Cartao, explosao: Explosao as any, vitoria: Vitoria, narrador: Narrador};

export const EpisodioBB: React.FC<{tl: Timeline}> = ({tl}) => {
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.blocos.map((b, i) => {
        const C = BLOCOS[b.tipo] ?? Narrador;
        const s = ini; ini += b.dur;
        return (
          <Sequence key={i} from={s} durationInFrames={b.dur}>
            <C b={b} tl={tl} />
            {(b.audio ?? []).map((a, k) => <Sequence key={k} from={a.ini}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const duracaoBB = (tl: Timeline) => Math.max(1, tl.blocos.reduce((s, b) => s + b.dur, 0));

// composição: lê public/bb/timeline.json (ou outro, pela prop arquivo); música de fundo baixinha por baixo de tudo
export const VideoBB: React.FC<{tl: Timeline | null}> = ({tl}) => tl ? (
  <AbsoluteFill>
    <EpisodioBB tl={tl} />
    {tl.musica ? <Audio src={staticFile(tl.musica)} volume={0.07} loop /> : null}
  </AbsoluteFill>
) : null;
export const calcVideoBB = async ({props}: {props: {tl: Timeline | null; arquivo?: string}}) => {
  const tl = (await (await fetch(staticFile(props.arquivo ?? 'bb/timeline.json'))).json()) as Timeline;
  return {durationInFrames: duracaoBB(tl), fps: 30, props: {...props, tl}};
};
