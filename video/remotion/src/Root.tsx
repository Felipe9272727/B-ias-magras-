import {CalculateMetadataFunction, Composition, staticFile, Still} from 'remotion';
import {Main} from './Main';
import {Thumbnail} from './Thumbnail';
import {Thumb2} from './amongus/Thumb2';
import {Thumb3} from './ilha/Thumb3';
import {DadosShort3, ShortDS4} from './ilha/ShortDS4';
import {AU2Tela, AU2Teste, calcTela, calcTeste, PropsTela, PropsTeste} from './amongus2/Teste';
import * as T3 from './amongus3/Teste';
import {AU2AberturaPrevia} from './amongus2/AberturaPrevia';
import {AU2Papeis} from './amongus2/Papeis';
import {AU2Sorteio} from './amongus2/Sorteio';
import {AU2Manual} from './amongus2/Manual';
import {ThumbAU2} from './amongus2/ThumbAU2';
import {ThumbAU3} from './amongus3/ThumbAU3';
import {ThumbAU4} from './amongus4/ThumbAU4';
import {ThumbAU5} from './amongus5/ThumbAU5';
import {AU5Comentarios} from './amongus5/Abertura5';
import {ShortAU2, calcShortAU2} from './amongus2/ShortAU2';
import {ShortFrio, calcShortFrio} from './amongus2/ShortFrio';
import {ShortLaranja, calcShortLaranja} from './amongus2/ShortLaranja';
import {PreviaOC, calcPreviaOC} from './overcooked/Previa';
import {ThumbOC, calcThumbOC} from './overcooked/ThumbOC';
import {ShortOC, calcShortOC} from './overcooked/ShortOC';
import {ShortPao, calcShortPao} from './overcooked/ShortPao';
import {ShortS60, calcShortS60} from './sessenta/ShortS60';
import {ThumbS60} from './sessenta/ThumbS60';
import {AU4Comentarios} from './amongus4/Comentarios4';
import {PreviaAU4, calcPreviaAU4} from './amongus4/PreviaAU4';
import {AU4Roupas, AU4RoupasZoom} from './amongus/AU4Roupas';
import {ShortPalhaco, calcShortPalhaco} from './amongus3/ShortPalhaco';
import {PreviaSala} from './interrogatorio/PreviaSala';
import {PreviaPersonagens} from './interrogatorio/PreviaPersonagens';
import {PreviaHud} from './interrogatorio/PreviaHud';
import {ThumbInt} from './interrogatorio/ThumbInt';
import {ShortInterrogatorio, calcShortInterrogatorio} from './interrogatorio/ShortInterrogatorio';
import {PreviaLobo} from './lobisomem/PreviaLobo';
import {ShortLobo, calcShortLobo} from './lobisomem/ShortLobo';
import {ThumbLobo} from './lobisomem/ThumbLobo';
import {PreviaPolus, RecortePolus} from './amongus5/polus/ArtePolus';
import {Teste5, calcTeste5} from './amongus5/Teste5';
import {ShortPossuidor, calcShortPossuidor} from './amongus4/ShortPossuidor';
import {Dia, calcDia} from './sessenta/Dia';
import {Previa as S60Previa, calcPrevia} from './sessenta/Previa';
import {Coleta3D, calcColeta3D} from './sessenta/Coleta3D';
import {Coleta, calcColeta} from './sessenta/Coleta';
import {DadosShort, ShortAzul} from './amongus/ShortAzul';
import {DadosShort2, ShortAzul2} from './amongus/ShortAzul2';
import {DadosShortMario, ShortMario} from './ShortMario';
import {Vitrine} from './amongus/Vitrine';
import {AU4Elenco} from './amongus/AU4Elenco';
import {AU4Animacoes, calcAnimacoes4} from './amongus4/Animacoes4';
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
const calculateMetadataOC = calcTimeline('timeline_oc.json');
const calculateMetadataS60 = calcTimeline('timeline_s60.json');
const calculateMetadataAU3 = calcTimeline('timeline_au3.json');
const calculateMetadataPreviaAU4 = calcTimeline('timeline_previa_au4.json');
const calculateMetadataPreviaAU5 = calcTimeline('timeline_previa_au5.json');
const calculateMetadataAU5 = calcTimeline('timeline_au5.json');
const calculateMetadataAU4 = calcTimeline('timeline_au4.json');
const calculateMetadataInt = calcTimeline('timeline_int.json');
const calculateMetadataLobo = calcTimeline('timeline_lobo.json');
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
      <Composition id="AU4Elenco" component={AU4Elenco} width={1920} height={1080} fps={30} durationInFrames={240} />
      <Composition id="AU4Animacoes" component={AU4Animacoes} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ps: null, skins: null}} calculateMetadata={calcAnimacoes4} />
      <Still id="Vitrine" component={Vitrine} width={1920} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
      <Composition id="ShortAzul" component={ShortAzul} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShort} />
      <Composition id="AU2AberturaPrevia" component={AU2AberturaPrevia} width={1920} height={1080} fps={30} durationInFrames={550} />
      <Composition id="AU2Teste" component={AU2Teste} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{p: null, de: 200, foco: 'Marrom', partida: 1} as PropsTeste} calculateMetadata={calcTeste} />
      <Composition id="AmongUs2" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataAU2} />
      <Composition id="AmongUs3" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataAU3} />
      <Composition id="Interrogatorio" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataInt} />
      <Composition id="Lobisomem" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataLobo} />
      <Composition id="AmongUs4" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataAU4} />
      <Composition id="AU5Narrado" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataAU5} />
      <Composition id="PreviaAU5Narrada" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataPreviaAU5} />
      <Composition id="PreviaAU4Narrada" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataPreviaAU4} />
      <Composition id="Sessenta" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataS60} />
      <Composition id="Overcooked" component={Main} width={W} height={H} fps={FPS} durationInFrames={300} defaultProps={{timeline: null} as Props} calculateMetadata={calculateMetadataOC} />
      <Composition id="PreviaOC" component={PreviaOC} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{log: null, cz: 0, de: 0, grade: false}} calculateMetadata={calcPreviaOC} />
      <Composition id="ShortLaranja" component={ShortLaranja} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortLaranja} />
      <Composition id="ShortFrio" component={ShortFrio} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortFrio} />
      <Composition id="ShortAU2" component={ShortAU2} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortAU2} />
      <Composition id="ShortOC" component={ShortOC} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortOC} />
      <Composition id="ShortPao" component={ShortPao} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortPao} />
      <Composition id="ShortS60" component={ShortS60} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortS60} />
      <Composition id="S60Previa" component={S60Previa} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{segs: null}} calculateMetadata={calcPrevia} />
      <Composition id="S60Dia" component={Dia} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{dados: null, arquivo: 'teste_mock', dia: 3}} calculateMetadata={calcDia} />
      <Composition id="S60Coleta3D" component={Coleta3D} width={1920} height={1080} fps={30} durationInFrames={1950} defaultProps={{dados: null, ia: null, arquivo: 'piloto_deepseek'}} calculateMetadata={calcColeta3D} />
      <Composition id="S60Coleta" component={Coleta} width={1920} height={1080} fps={30} durationInFrames={1920} defaultProps={{dados: null}} calculateMetadata={calcColeta} />
      <Composition id="ShortPalhaco" component={ShortPalhaco} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortPalhaco} />
      <Composition id="ShortInterrogatorio" component={ShortInterrogatorio} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{blocos: null}} calculateMetadata={calcShortInterrogatorio} />
      <Composition id="ThumbInt" component={ThumbInt} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="PreviaSala" component={PreviaSala} width={1920} height={1080} fps={30} durationInFrames={240} />
      <Composition id="PreviaPersonagens" component={PreviaPersonagens} width={1920} height={1080} fps={30} durationInFrames={240} />
      <Composition id="PreviaHud" component={PreviaHud} width={1920} height={1080} fps={30} durationInFrames={240} />
      <Composition id="PreviaPolus" component={PreviaPolus} width={1920} height={1230} fps={30} durationInFrames={1} />
      <Composition id="Teste5" component={Teste5} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{p: null, skins: null, foco: 'Banana', de: 0}} calculateMetadata={calcTeste5} />
      <Composition id="RecortePolus" component={RecortePolus} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{cx: 60, cy: 45, zoom: 0.75}} />
      <Composition id="ThumbLobo" component={ThumbLobo} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="ShortLobo" component={ShortLobo} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{blocos: null}} calculateMetadata={calcShortLobo} />
      <Composition id="PreviaLobo" component={PreviaLobo} width={1920} height={1080} fps={30} durationInFrames={180} />
      <Composition id="ShortPossuidor" component={ShortPossuidor} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{dados: null}} calculateMetadata={calcShortPossuidor} />
      <Composition id="ThumbOC" component={ThumbOC} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{log: null}} calculateMetadata={calcThumbOC} />
      <Composition id="ThumbAU2" component={ThumbAU2} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="ThumbAU3" component={ThumbAU3} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="IdeiaAU5" component={AU5Comentarios} width={1920} height={1080} fps={30} durationInFrames={165}
        defaultProps={{comentarios: [
          {autor: '@SalvadorM_228', texto: 'Podias usar daquele novo do Carmin jeito que viraliza muito que podia ser tipo "Você deve estar se perguntando como é que esta IA foi acusada 2 vezes..."', likes: 3, selo: 'PEDIDO ACEITO', cor: '#1f6fd1'},
          {autor: 'Inspiração: @carmimdaltonico', texto: 'Os vídeos do Carmim de Among Us: "Você deve estar se perguntando..."\nEdição especial, no estilo dele: só dessa vez.', selo: 'SÓ DESSA VEZ', cor: '#c0262d'},
        ], gatilhos: [0, 60]}} />
      <Composition id="ThumbAU5" component={ThumbAU5} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="ThumbAU4" component={ThumbAU4} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="ThumbS60" component={ThumbS60} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="AU4Comentarios" component={AU4Comentarios} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{lista: 'entrou', passo: 40}} />
      <Composition id="PreviaAU4" component={PreviaAU4} width={1920} height={1080} fps={30} durationInFrames={3600} defaultProps={{p: null, skins: null}} calculateMetadata={calcPreviaAU4} />
      <Composition id="AU4Roupas" component={AU4Roupas} width={1920} height={1080} fps={30} durationInFrames={60} />
      <Composition id="AU4RoupasZoom" component={AU4RoupasZoom} width={1920} height={1080} fps={30} durationInFrames={60} />
      <Composition id="AU3Teste" component={T3.AU3Teste} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{p: null, de: 200, foco: 'Vermelho', partida: 1} as T3.PropsTeste} calculateMetadata={T3.calcTeste} />
      <Composition id="AU3Tela" component={T3.AU3Tela} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{p: null, partida: 1, tela: 'votacao'} as T3.PropsTela} calculateMetadata={T3.calcTela} />
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
      {/* Among Us 4: prévia da nave inteira na v4 (novo piso, paredes e enfeites) e na v3 para comparar */}
      <Still id="AU4Mapa" component={ArtePreview} width={1920} height={1080} defaultProps={{v4: true}} />
      <Still id="AU4MapaV5" component={ArtePreview} width={1920} height={1080} defaultProps={{v5: true}} />
      <Still id="AU4MapaV3" component={ArtePreview} width={1920} height={1080} defaultProps={{v3: true}} />
    </>
  );
};
