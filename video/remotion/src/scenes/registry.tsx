import React from 'react';
import type {Scene, Timeline} from '../types';
import {TitleCard} from './TitleCard';
import {RLLoop} from './RLLoop';
import {RewardTable} from './RewardTable';
import {NeuralNet} from './NeuralNet';
import {Evolution} from './Evolution';
import {QValues, ReplayBuffer} from './DQN';
import {RainbowCards} from './Rainbow';
import {BeamSearch} from './BeamSearch';
import {LearningCurve, Scoreboard} from './Charts';
import {BigText, EndScreen, Lessons, PlannerVsNet, SensorPanel, UIPan} from './Misc';
import type {HL} from './hl';
import {AmongUsVisual} from '../amongus/Registro';

type Props = {scene: Scene; timeline: Timeline; highlights: HL};

// Liga o nome usado no roteiro ao componente React correspondente.
export const SceneVisual: React.FC<Props> = ({scene, timeline, highlights}) => {
  const v = scene.visual;
  if (v.type === 'title') return <TitleCard kicker={v.kicker} title={v.title} subtitle={v.subtitle} color={v.color} />;
  if (v.type === 'ui') return <UIPan src={v.src} keys={v.keys} srcW={timeline.clips[v.src]?.width ?? 1925} speed={v.rate ?? 1} />;
  if (v.type !== 'component') return null;
  const p = (v.props ?? {}) as Record<string, any>;
  switch (v.name) {
    case 'RLLoop':
      return <RLLoop highlights={highlights} />;
    case 'RewardTable':
      return <RewardTable highlights={highlights} />;
    case 'NeuralNet':
      return <NeuralNet highlights={highlights} {...p} />;
    case 'Evolution':
      return <Evolution highlights={highlights} />;
    case 'QValues':
      return <QValues highlights={highlights} />;
    case 'ReplayBuffer':
      return <ReplayBuffer highlights={highlights} />;
    case 'RainbowCards':
      return <RainbowCards highlights={highlights} />;
    case 'BeamSearch':
      return <BeamSearch highlights={highlights} />;
    case 'Scoreboard':
      return <Scoreboard highlights={highlights} rows={p.rows} title={p.title} subtitle={p.subtitle} />;
    case 'LearningCurve':
      return <LearningCurve highlights={highlights} series={p.series} color={p.color} title={p.title} marks={p.marks} yLabel={p.yLabel} />;
    case 'Lessons':
      return <Lessons highlights={highlights} items={p.items} title={p.title} />;
    case 'EndScreen':
      return <EndScreen highlights={highlights} credits={p.credits} />;
    case 'SensorPanel':
      return <SensorPanel highlights={highlights} items={p.items} title={p.title} />;
    case 'PlannerVsNet':
      return <PlannerVsNet highlights={highlights} />;
    case 'BigText':
      return <BigText text={p.text} sub={p.sub} color={p.color} />;
    default:
      if (v.name.startsWith('AU')) return <AmongUsVisual name={v.name} props={p} scene={scene} timeline={timeline} />;
      return null;
  }
};
