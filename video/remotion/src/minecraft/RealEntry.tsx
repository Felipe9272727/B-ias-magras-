import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {AberturaMC} from './AberturaMC';
import {ReutilizarAudioOriginal} from './AudioMC';

type Props = React.ComponentProps<typeof AberturaMC>;
const calcular: CalculateMetadataFunction<Props> = async ({props}) => {
  const dados = await (await fetch(staticFile(`${props.pasta ?? 'mc/video_real'}/abertura.json`))).json();
  return {durationInFrames: dados.cenas.reduce((s: number, c: {dur: number}) => s + c.dur, 0), props: {dados}};
};
const Visual: React.FC<Props> = (props) => <ReutilizarAudioOriginal.Provider value={true}><AberturaMC {...props} /></ReutilizarAudioOriginal.Provider>;
const Root: React.FC = () => <Composition id="MinecraftReal" component={Visual} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{dados: null, pasta: 'mc/video_real'}} calculateMetadata={calcular} />;
registerRoot(Root);
