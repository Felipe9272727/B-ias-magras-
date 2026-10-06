import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile} from 'remotion';
import {fontsReady} from './fonts';
import type {Scene, Timeline} from './types';
import {C} from './theme';
import {Captions, ClipView, MemeCard, TextPop} from './components/overlays';
import {SceneVisual} from './scenes/registry';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

export const SceneView: React.FC<{scene: Scene; timeline: Timeline}> = ({scene, timeline}) => {
  const hl = scene.events.filter((e) => e.type === 'hl') as {type: 'hl'; at: number; key: string}[];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {scene.segments.map((sg, i) => (
        <Sequence key={i} from={sg.start} durationInFrames={Math.max(1, sg.end - sg.start)} name={`${sg.clip}@${sg.from}`}>
          <ClipView seg={sg} />
        </Sequence>
      ))}
      {scene.visual.type !== 'clip' ? <SceneVisual scene={scene} timeline={timeline} highlights={hl} /> : null}
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
        if (e.type === 'sfx')
          return (
            <Sequence key={i} from={e.at} name={`sfx ${e.id}`}>
              <Audio src={staticFile(`sfx/${e.id}.wav`)} volume={e.vol ?? 0.55} />
            </Sequence>
          );
        return null;
      })}
      {scene.captions !== false && scene.words.length ? <Captions words={scene.words} offset={scene.audioOffset} /> : null}
      {scene.audio ? (
        <Sequence from={scene.audioOffset} name="voz">
          <Audio src={staticFile(scene.audio)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const Main: React.FC<{timeline: Timeline | null}> = ({timeline}) => {
  useFonts();
  if (!timeline) return <AbsoluteFill style={{background: C.bg}} />;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {timeline.scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.start} durationInFrames={scene.duration} name={`${scene.id} · ${scene.chapter}`}>
          <SceneView scene={scene} timeline={timeline} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
