import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontsReady} from './fonts';
import type {Scene, Timeline} from './types';
import {C} from './theme';
import {Captions, ClipInfo, ClipView, MemeCard, ModoShort, TextPop} from './components/overlays';
import {SceneVisual} from './scenes/registry';
import {escolherTransicao, TransicaoEntrada} from './amongus/Transicoes';

// Nome do componente visual da cena (só para cenas de componente); usado nas transições.
const nomeVisual = (s: Scene | undefined): string | undefined =>
  s && s.visual.type === 'component' ? s.visual.name : undefined;

const useFonts = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

export const SceneView: React.FC<{scene: Scene; timeline: Timeline; anterior?: string}> = ({scene, timeline, anterior}) => {
  const hl = scene.events.filter((e) => e.type === 'hl') as {type: 'hl'; at: number; key: string}[];
  const frame = useCurrentFrame();
  const short = React.useContext(ModoShort);
  // "soco" de câmera: zoom rápido que assenta, com um flash branco curto
  let bump = 0;
  let flash = 0;
  for (const e of scene.events) {
    if (e.type !== 'punch') continue;
    const d = frame - e.at;
    if (d >= 0 && d < 24) {
      bump += 0.08 * Math.exp(-d / 5);
      flash = Math.max(flash, 0.45 * Math.exp(-d / 2.5));
    }
  }
  // "TRIGGERED" (vermelho tremendo, faixa embaixo) e tremidas de câmera
  let tremor = 0;
  let trig: {text: string; d: number; dur: number} | null = null;
  for (const e of scene.events) {
    if (e.type === 'trig') {
      const d = frame - e.at;
      if (d >= 0 && d < e.dur) {
        trig = {text: e.text ?? 'TRIGGERED', d, dur: e.dur};
        tremor = Math.max(tremor, 16);
      }
    }
    if (e.type === 'shake') {
      const d = frame - e.at;
      if (d >= 0 && d < e.dur) tremor = Math.max(tremor, (e.force ?? 14) * (1 - d / e.dur));
    }
  }
  const rnd = (k: number) => {
    const x = Math.sin(frame * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x) - 0.5;
  };
  const tx = tremor * rnd(1) * 2, ty = tremor * rnd(2) * 2;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${1 + bump + (trig ? 0.06 : 0)})`}}>
      {scene.segments.map((sg, i) => (
        <Sequence key={i} from={sg.start} durationInFrames={Math.max(1, sg.end - sg.start)} name={`${sg.clip}@${sg.from}`}>
          <ClipView seg={sg} info={timeline.clips[sg.clip] as ClipInfo | undefined} />
        </Sequence>
      ))}
      {scene.visual.type !== 'clip' ? <SceneVisual scene={scene} timeline={timeline} highlights={hl} /> : null}
      </AbsoluteFill>
      {flash > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
      {trig ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <AbsoluteFill style={{background: '#ff1a1a', mixBlendMode: 'multiply', opacity: 0.55 * Math.min(1, trig.d / 3) * Math.min(1, (trig.dur - trig.d) / 4)}} />
          <AbsoluteFill style={{background: 'radial-gradient(circle, transparent 45%, #8a0000cc 100%)', opacity: Math.min(1, (trig.dur - trig.d) / 4)}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 70 + rnd(3) * 16, height: 150, background: '#e01010', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${rnd(4) * 26}px)`, borderTop: '6px solid #000', borderBottom: '6px solid #000', opacity: Math.min(1, (trig.dur - trig.d) / 3)}}>
            <span style={{fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 112, letterSpacing: 10, fontStyle: 'italic', color: '#fff', textShadow: '5px 5px 0 #000', transform: `translate(${rnd(5) * 10}px, ${rnd(6) * 8}px)`}}>{trig.text}</span>
          </div>
        </AbsoluteFill>
      ) : null}
      {scene.events.map((e, i) => {
        if (e.type === 'meme') {
          const info = timeline.memes[e.id];
          if (!info) return null;
          return (
            <Sequence key={i} from={e.at} durationInFrames={e.dur} name={`meme ${e.id}`}>
              <MemeCard info={info} dur={e.dur} pos={e.pos} caption={e.caption} />
            </Sequence>
          );
        }
        if (e.type === 'txt')
          return (
            <Sequence key={i} from={e.at} durationInFrames={e.dur} name={`txt ${e.text}`}>
              <TextPop text={e.text} dur={e.dur} color={e.color} />
            </Sequence>
          );
        if (e.type === 'voz')
          return (
            <Sequence key={i} from={e.at} name={`voz ${e.src}`}>
              <Audio src={staticFile(e.src)} />
            </Sequence>
          );
        if (e.type === 'sfx')
          return (
            <Sequence key={i} from={e.at} name={`sfx ${e.id}`}>
              <Audio src={staticFile(e.file?.includes('/') ? e.file : `sfx/${e.file ?? e.id + '.wav'}`)} volume={e.vol ?? 0.3} />
            </Sequence>
          );
        return null;
      })}
      {scene.capGroups?.length && !short ? <Captions groups={scene.capGroups} topo={scene.visual.type === 'component' && ['AUReplay', 'AUSplit', 'AUReuniao', 'AUFrase'].includes(scene.visual.name)} /> : null}
      {scene.audio ? (
        <Sequence from={scene.audioOffset} name="voz">
          <Audio src={staticFile(scene.audio)} />
        </Sequence>
      ) : null}
      {/* Transição de entrada (Among Us): só nas cenas de componente AU, por cima de tudo */}
      {scene.visual.type === 'component' && scene.visual.name.startsWith('AU') ? (
        <TransicaoEntrada tipo={escolherTransicao(anterior, scene.visual.name)} />
      ) : null}
    </AbsoluteFill>
  );
};

export const Main: React.FC<{timeline: Timeline | null; short?: boolean}> = ({timeline, short}) => {
  useFonts();
  if (!timeline) return <AbsoluteFill style={{background: C.bg}} />;
  return (
    <ModoShort.Provider value={!!short}>
    <AbsoluteFill style={{background: C.bg}}>
      {timeline.scenes.map((scene, i) => (
        <Sequence key={scene.id} from={scene.start} durationInFrames={scene.duration} name={`${scene.id} · ${scene.chapter}`}>
          <SceneView scene={scene} timeline={timeline} anterior={nomeVisual(timeline.scenes[i - 1])} />
        </Sequence>
      ))}
    </AbsoluteFill>
    </ModoShort.Provider>
  );
};
