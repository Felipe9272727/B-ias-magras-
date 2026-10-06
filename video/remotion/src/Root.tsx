import {CalculateMetadataFunction, Composition, staticFile, Still} from 'remotion';
import {Main} from './Main';
import {Thumbnail} from './Thumbnail';
import type {Timeline} from './types';
import {FPS, H, W} from './theme';

type Props = {timeline: Timeline | null; from?: number};

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile('timeline.json'));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {timeline}};
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MarioRL"
        component={Main}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{timeline: null} as Props}
        calculateMetadata={calculateMetadata}
      />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
    </>
  );
};
