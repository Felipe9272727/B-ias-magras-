import {CalculateMetadataFunction, Composition, staticFile, Still} from 'remotion';
import {Main} from './Main';
import {Thumbnail} from './Thumbnail';
import {Thumb2} from './amongus/Thumb2';
import {DadosShort, ShortAzul} from './amongus/ShortAzul';
import {DadosShort2, ShortAzul2} from './amongus/ShortAzul2';
import {DadosShortMario, ShortMario} from './ShortMario';
import {Vitrine} from './amongus/Vitrine';
import {ArtePreview} from './amongus/nave/ArtePreview';
import {AmongUsPreview, calcPreview, PreviewProps} from './amongus/Preview';
import type {Timeline} from './types';
import {DailyShort} from './shorts/DailyShort';
import {metadataFor, PACK, type ShortKey} from './shorts/pack';
import {Arte} from './amongus/nave/Arte';
import {NAVE} from './amongus/nave/mapa';
import {FPS, H, W} from './theme';

type Props = {timeline: Timeline | null; from?: number; short?: boolean};

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile('timeline.json'));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {timeline}};
};

// Lê um timeline de public/ (vídeos 2 e 3 usam o mesmo formato).
const calcTimeline = (arquivo: string): CalculateMetadataFunction<Props> => async ({props}) => {
  const res = await fetch(staticFile(arquivo));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {...props, timeline}};
};

const calculateMetadata2 = calcTimeline('timeline2.json');
const calculateMetadata3 = calcTimeline('timeline3.json');

const calcShort: CalculateMetadataFunction<{dados: DadosShort | null}> = async () => {
  const dados = (await (await fetch(staticFile('short/legendas.json'))).json()) as DadosShort;
  return {durationInFrames: dados.intro + dados.base, props: {dados}};
};

const calcShort2: CalculateMetadataFunction<{dados: DadosShort2 | null}> = async () => {
  const s2 = await (await fetch(staticFile('short2/short2.json'))).json();
  const tl = (await (await fetch(staticFile('timeline2.json'))).json()) as Timeline;
  const partida = (tl as any).data.partidas['1'];
  const total = s2.blocos.reduce((a: number, b: {dur: number}) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: s2.blocos, partida}}};
};

const calcShortMario: CalculateMetadataFunction<{dados: DadosShortMario | null}> = async () => {
  const dados = (await (await fetch(staticFile('short_mario/short_mario.json'))).json()) as DadosShortMario;
  return {durationInFrames: dados.blocos.reduce((a, b) => a + b.dur, 0), props: {dados}};
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still id="NaveBitmap" component={Arte} width={NAVE.cols * 48} height={NAVE.rows * 48} />
      {(Object.keys(PACK) as ShortKey[]).map(short => <Composition key={short} id={PACK[short].composition} component={DailyShort} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{short, blocks: [], partida: null, mapFile: null}} calculateMetadata={metadataFor(short)} />)}
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
      <Composition
        id="Video3"
        component={Main}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{timeline: null} as Props}
        calculateMetadata={calculateMetadata3}
      />
      <Still id="Vitrine" component={Vitrine} width={1920} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
      <Composition id="ShortAzul" component={ShortAzul} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort} />
      <Composition id="ShortAzul2" component={ShortAzul2} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort2} />
      <Composition id="ShortMario" component={ShortMario} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortMario} />
      <Still id="Thumb2" component={Thumb2} width={1280} height={720} />
      <Still id="ArtePreview" component={ArtePreview} width={1920} height={1080} />
      <Still id="ArteZoom" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 2712, cy: 576, escala: 1.3}} />
      <Still id="ArteReatorMotor" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 420, cy: 2100, escala: 0.7}} />
      <Still id="ArteEletricaDeposito" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 1992, cy: 2376, escala: 1}} />
    </>
  );
};
