import {CalculateMetadataFunction, Composition, staticFile, Still} from 'remotion';
import {Main} from './Main';
import {Thumbnail} from './Thumbnail';
import {Thumb2} from './amongus/Thumb2';
import {Thumb3} from './ilha/Thumb3';
import {DadosShort3, ShortDS4} from './ilha/ShortDS4';
import {AU2Tela, AU2Teste, calcTela, calcTeste, PropsTela, PropsTeste} from './amongus2/Teste';
import {AU2AberturaPrevia} from './amongus2/AberturaPrevia';
import {AU2Papeis} from './amongus2/Papeis';
import {AU2Sorteio} from './amongus2/Sorteio';
import {AU2Manual} from './amongus2/Manual';
import {ThumbAU2} from './amongus2/ThumbAU2';
import {ShortAU2, duracaoShortAU2} from './amongus2/ShortAU2';
import {DadosShort, ShortAzul} from './amongus/ShortAzul';
import {DadosShort2, ShortAzul2} from './amongus/ShortAzul2';
import {DadosShortMario, ShortMario} from './ShortMario';
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

// Lê um timeline de public/ (vídeos 2 e 3 usam o mesmo formato).
const calcTimeline = (arquivo: string): CalculateMetadataFunction<Props> => async ({props}) => {
  const res = await fetch(staticFile(arquivo));
  const timeline = (await res.json()) as Timeline;
  return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {...props, timeline}};
};

const calculateMetadata2 = calcTimeline('timeline2.json');
const calculateMetadata3 = calcTimeline('timeline3.json');
const calculateMetadataAU2 = calcTimeline('timeline_au2.json');
const calculateMetadata3a = calcTimeline('timeline3_amostra.json');
const calculateMetadata3c = calcTimeline('timeline3_completo.json');

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

const calcShort3: CalculateMetadataFunction<{dados: DadosShort3 | null}> = async () => {
  const dados = (await (await fetch(staticFile('short3/short3.json'))).json()) as DadosShort3;
  return {durationInFrames: dados.blocos.reduce((a, b) => a + b.dur, 0), props: {dados}};
};
const calcShortMario: CalculateMetadataFunction<{dados: DadosShortMario | null}> = async () => {
  const dados = (await (await fetch(staticFile('short_mario/short_mario.json'))).json()) as DadosShortMario;
  return {durationInFrames: dados.blocos.reduce((a, b) => a + b.dur, 0), props: {dados}};
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
      <Composition
        id="Video3Amostra"
        component={Main}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{timeline: null} as Props}
        calculateMetadata={calculateMetadata3a}
      />
      <Composition
        id="Video3Completo"
        component={Main}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={300}
        defaultProps={{timeline: null} as Props}
        calculateMetadata={calculateMetadata3c}
      />
      <Still id="Vitrine" component={Vitrine} width={1920} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
      <Composition id="ShortAzul" component={ShortAzul} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort} />
      <Composition id="AU2AberturaPrevia" component={AU2AberturaPrevia} width={1920} height={1080} fps={30} durationInFrames={550} />
      <Composition id="AU2Teste" component={AU2Teste} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{p: null, de: 200, foco: 'Marrom', partida: 1} as PropsTeste} calculateMetadata={calcTeste} />
      <Composition id="AmongUs2" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataAU2} />
      <Composition id="ShortAU2" component={ShortAU2} width={1080} height={1920} fps={30} durationInFrames={duracaoShortAU2} />
      <Composition id="ThumbAU2" component={ThumbAU2} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="AU2Tela" component={AU2Tela} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{p: null, partida: 2, tela: 'shhh'} as PropsTela} calculateMetadata={calcTela} />
      <Composition id="AU2Papeis" component={AU2Papeis} width={1920} height={1080} fps={30} durationInFrames={330} />
      <Composition id="AU2Sorteio" component={AU2Sorteio} width={1920} height={1080} fps={30} durationInFrames={330} />
      <Composition id="AU2Manual" component={AU2Manual} width={1920} height={1080} fps={30} durationInFrames={330} defaultProps={{destaque: [3, 6, 10]}} />
      <Composition id="ShortDS4" component={ShortDS4} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort3} />
      <Composition id="ShortAzul2" component={ShortAzul2} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort2} />
      <Composition id="ShortMario" component={ShortMario} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortMario} />
      <Still id="Thumb2" component={Thumb2} width={1280} height={720} />
      <Still id="Thumb3" component={Thumb3} width={1280} height={720} />
      <Still id="ArtePreview" component={ArtePreview} width={1920} height={1080} />
      <Still id="ArteZoom" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 2712, cy: 576, escala: 1.3}} />
      <Still id="ArteReatorMotor" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 420, cy: 2100, escala: 0.7}} />
      <Still id="ArteEletricaDeposito" component={ArtePreview} width={1920} height={1080} defaultProps={{cx: 1992, cy: 2376, escala: 1}} />
    </>
  );
};
