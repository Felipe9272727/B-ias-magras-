import {CalculateMetadataFunction, Composition, staticFile, Still} from 'remotion';
import {Main} from './Main';
import {Thumbnail} from './Thumbnail';
import {Thumb2} from './amongus/Thumb2';
import {DadosShort, ShortAzul} from './amongus/ShortAzul';
import {Vitrine} from './amongus/Vitrine';
import {ArtePreview} from './amongus/nave/ArtePreview';
import {AmongUsPreview, calcPreview, PreviewProps} from './amongus/Preview';
import type {Timeline} from './types';
import {FPS, H, W} from './theme';

type Props = {timeline: Timeline | null; from?: number; short?: boolean};

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile('timeline.json'));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {timeline}};
};

const calculateMetadata2: CalculateMetadataFunction<Props> = async ({props}) => {
  const res = await fetch(staticFile('timeline2.json'));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {...props, timeline}};
};

const calcShort: CalculateMetadataFunction<{dados: DadosShort | null}> = async () => {
  const dados = (await (await fetch(staticFile('short/legendas.json'))).json()) as DadosShort;
  return {durationInFrames: dados.intro + dados.base, props: {dados}};
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
      <Composition
        id="AmongUsIA"
        component={Main}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{timeline: null} as Props}
        calculateMetadata={calculateMetadata2}
      />
      <Composition
        id="AmongUsPreview"
        component={AmongUsPreview}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={600}
        defaultProps={{arquivo: 'partida2.json', cena: 'replay', partida: null} as PreviewProps}
        calculateMetadata={calcPreview}
      />
      <Still id="Vitrine" component={Vitrine} width={1920} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
      <Composition id="ShortAzul" component={ShortAzul} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort} />
      <Still id="Thumb2" component={Thumb2} width={1280} height={720} />
      <Still id="ArtePreview" component={ArtePreview} width={1920} height={1080} />
      <Still id="ArteZoom" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 2712, cy: 576, escala: 1.3}} />
      <Still id="ArteReatorMotor" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 420, cy: 2100, escala: 0.7}} />
      <Still id="ArteEletricaDeposito" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 1992, cy: 2376, escala: 1}} />
    </>
  );
};
