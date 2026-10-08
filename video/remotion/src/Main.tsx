import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontsReady} from './fonts';
import type {Scene, Timeline} from './types';
import {C} from './theme';
import {Captions, ClipInfo, ClipView, MemeCard, TextPop} from './components/overlays';
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
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `scale(${1 + bump})`}}>
      {scene.segments.map((sg, i) => (
        <Sequence key={i} from={sg.start} durationInFrames={Math.max(1, sg.end - sg.start)} name={`${sg.clip}@${sg.from}`}>
          <ClipView seg={sg} info={timeline.clips[sg.clip] as ClipInfo | undefined} />
        </Sequence>
      ))}
      {scene.visual.type !== 'clip' ? <SceneVisual scene={scene} timeline={timeline} highlights={hl} /> : null}
      </AbsoluteFill>
      {flash > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
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
              <Audio src={staticFile(`sfx/${e.file ?? e.id + '.wav'}`)} volume={e.vol ?? 0.3} />
            </Sequence>
          );
        return null;
      })}
      {scene.capGroups?.length ? <Captions groups={scene.capGroups} /> : null}
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

export const Main: React.FC<{timeline: Timeline | null}> = ({timeline}) => {
  useFonts();
  if (!timeline) return <AbsoluteFill style={{background: C.bg}} />;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {timeline.scenes.map((scene, i) => (
        <Sequence key={scene.id} from={scene.start} durationInFrames={scene.duration} name={`${scene.id} · ${scene.chapter}`}>
          <SceneView scene={scene} timeline={timeline} anterior={nomeVisual(timeline.scenes[i - 1])} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
