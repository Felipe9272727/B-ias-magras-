import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {AberturaMC} from './AberturaMC';
import {ReutilizarAudioOriginal} from './AudioMC';
import {AudioOnlyMC, MusicMC} from './MusicMC';

type Props = React.ComponentProps<typeof AberturaMC>;
const calculate: CalculateMetadataFunction<Props> = async () => {
  const dados = await (await fetch(staticFile('mc/video/abertura.json'))).json();
  dados.pasta = 'mc/video';
  return {durationInFrames: dados.cenas.reduce((sum: number, scene: {dur: number}) => sum + scene.dur, 0), props: {dados}};
};
const OriginalVoicesAndEffects: React.FC<Props> = (props) => {
  return <ReutilizarAudioOriginal.Provider value={false}>
    <AudioOnlyMC.Provider value={true}>
      <MusicMC.Provider value={false}><AberturaMC {...props} /></MusicMC.Provider>
    </AudioOnlyMC.Provider>
  </ReutilizarAudioOriginal.Provider>;
};
const Root: React.FC = () => <Composition id="MinecraftAudio" component={OriginalVoicesAndEffects} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{dados: null}} calculateMetadata={calculate} />;
registerRoot(Root);
