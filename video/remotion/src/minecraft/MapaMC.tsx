// Mapa visto de cima (estilo mapa do Minecraft) com as IAs andando no tempo da partida.
// Cada IA é a cabeça da skin com o nome embaixo, deixa um rastro na cor dela, tem um anel no ponto de nascimento
// e uma caveira (SVG, sem emoji) em cada morte que já aconteceu. Relógio da partida no canto.
// Dados: public/mc/mapa/ (mapa.png, mapa.json, rastros.json), gerados por minecraft/mapa.mjs.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';

const W = 1920;
const H = 1080;
const HEAD = 46; // tamanho da cabeça na tela (px)
const SALTO = 30; // blocos entre dois pontos de 2 s; acima disso é respawn ou teleporte, o rastro não liga os dois
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Foco = {x: number; z: number; zoom: number};
type Ponto = [number, number, number];
type Morte = {t: number; x: number; z: number; fase: string};
type IA = {cor: string; nascimento: {t: number; x: number; z: number}; pontos: Ponto[]; mortes: Morte[]};
type Dados = {mapa: {xMin: number; zMin: number; largura: number; altura: number}; rastros: {duracao: number; ias: Record<string, IA>}};

export type MapaProps = {
  tIni: number; // segundo da partida no primeiro quadro
  tFim: number; // segundo da partida no último quadro
  duracao?: number; // quadros (padrão: duração da composição)
  foco?: Foco; // centro (x, z em blocos) e zoom (pixels de tela por bloco)
  focoFim?: Foco; // se dado, a câmera anda suave do foco até focoFim
  rastroDesde?: number; // segundo a partir do qual o rastro aparece (padrão 0)
  legenda?: boolean;
};

// carrega mapa.json e rastros.json e espera as fontes; o quadro não sai antes disso
function useDados(): Dados | null {
  const [h] = useState(() => delayRender('mapa MC'));
  const [dados, setDados] = useState<Dados | null>(null);
  useEffect(() => {
    Promise.all([
      fetch(staticFile('mc/mapa/mapa.json')).then((r) => r.json()),
      fetch(staticFile('mc/mapa/rastros.json')).then((r) => r.json()),
      fontsReady,
    ])
      .then(([mapa, rastros]) => setDados({mapa, rastros}))
      .catch((e) => console.error(e))
      .finally(() => continueRender(h));
  }, [h]);
  return dados;
}

// posição da IA no instante t, interpolada entre os pontos de 2 s
function posicaoEm(pontos: Ponto[], t: number): {x: number; z: number} {
  if (pontos.length === 0) return {x: 0, z: 0};
  if (t <= pontos[0][0]) return {x: pontos[0][1], z: pontos[0][2]};
  const ult = pontos[pontos.length - 1];
  if (t >= ult[0]) return {x: ult[1], z: ult[2]};
  let lo = 0;
  let hi = pontos.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (pontos[m][0] <= t) lo = m;
    else hi = m;
  }
  const [t0, x0, z0] = pontos[lo];
  const [t1, x1, z1] = pontos[hi];
  if (Math.hypot(x1 - x0, z1 - z0) > SALTO) return {x: x0, z: z0};
  const k = (t - t0) / Math.max(1e-6, t1 - t0);
  return {x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k};
}

type Cam = {cx: number; cz: number; s: number};
const tela = (x: number, z: number, cam: Cam): [number, number] => [W / 2 + (x - cam.cx) * cam.s, H / 2 + (z - cam.cz) * cam.s];

// caminho SVG do rastro até o instante t (quebra onde há salto), com a posição atual no fim
function caminho(pontos: Ponto[], t: number, desde: number, cam: Cam, atual: {x: number; z: number}): string {
  let d = '';
  let ant: Ponto | null = null;
  for (const p of pontos) {
    if (p[0] > t) break;
    if (p[0] < desde) continue;
    const [sx, sy] = tela(p[1], p[2], cam);
    const salto = !ant || Math.hypot(p[1] - ant[1], p[2] - ant[2]) > SALTO;
    d += `${salto ? 'M' : 'L'}${sx.toFixed(1)} ${sy.toFixed(1)}`;
    ant = p;
  }
  if (ant && Math.hypot(atual.x - ant[1], atual.z - ant[2]) <= SALTO) {
    const [sx, sy] = tela(atual.x, atual.z, cam);
    d += `L${sx.toFixed(1)} ${sy.toFixed(1)}`;
  }
  return d;
}

// cabeça da skin (cara = 8x8 em 8,8; chapéu = 8x8 em 40,8), pixelada, com moldura na cor da IA
const Cabeca: React.FC<{nome: string; tam: number; cor: string}> = ({nome, tam, cor}) => {
  const borda = Math.max(3, Math.round(tam / 12));
  return (
    <div style={{width: tam, height: tam, overflow: 'hidden', position: 'relative', boxShadow: `0 0 0 ${borda}px ${cor}, 0 0 0 ${borda + 3}px #000`, flexShrink: 0}}>
      <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam, top: -tam, imageRendering: 'pixelated'}} />
      <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam * 5, top: -tam, imageRendering: 'pixelated'}} />
    </div>
  );
};

// caveira em SVG (sem emoji)
const Caveira: React.FC<{x: number; y: number; tam: number}> = ({x, y, tam}) => (
  <svg x={x - tam / 2} y={y - tam / 2} width={tam} height={tam} viewBox="0 0 24 24" style={{overflow: 'visible'}}>
    <path d="M12 2C6.9 2 3 5.7 3 10.3c0 2.8 1.4 5 3.5 6.5V20h3v-2h1v2h3v-2h1v2h3v-3.2c2-1.5 3.5-3.7 3.5-6.5C21 5.7 17.1 2 12 2z" fill="#f4f1ea" stroke="#111" strokeWidth={1.2} />
    <rect x={6.2} y={9} width={4} height={4.2} fill="#111" />
    <rect x={13.8} y={9} width={4} height={4.2} fill="#111" />
    <path d="M11 13.8h2l-1 2.2z" fill="#111" />
  </svg>
);

const relogio = (t: number) => {
  const s = Math.floor(t);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const MapaMC: React.FC<MapaProps> = ({tIni, tFim, duracao, foco, focoFim, rastroDesde = 0, legenda = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const dados = useDados();
  if (!dados) return <AbsoluteFill style={{background: '#1b1b1b'}} />;

  const {mapa, rastros} = dados;
  const dur = duracao ?? durationInFrames;
  const fim = Math.max(1, dur - 1);
  const t = tIni + (tFim - tIni) * interpolate(frame, [0, fim], [0, 1], clamp);

  // câmera: foco padrão = mapa inteiro; com focoFim, anda suave (ease in-out)
  const padrao: Foco = {x: mapa.xMin + mapa.largura / 2, z: mapa.zMin + mapa.altura / 2, zoom: (Math.min(W / mapa.largura, H / mapa.altura)) * 0.92};
  const fa = foco ?? padrao;
  const fb = focoFim ?? fa;
  const pc = interpolate(frame, [0, fim], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cam: Cam = {cx: lerp(fa.x, fb.x, pc), cz: lerp(fa.z, fb.z, pc), s: lerp(fa.zoom, fb.zoom, pc)};

  const ias = Object.entries(rastros.ias);
  const mortesAte = (ia: IA) => ia.mortes.filter((m) => m.t <= t).length;

  return (
    <AbsoluteFill style={{background: '#1b1b1b', overflow: 'hidden'}}>
      {/* mapa: 1 pixel = 1 bloco */}
      <Img
        src={staticFile('mc/mapa/mapa.png')}
        style={{
          position: 'absolute',
          left: W / 2 + (mapa.xMin - cam.cx) * cam.s,
          top: H / 2 + (mapa.zMin - cam.cz) * cam.s,
          width: mapa.largura * cam.s,
          height: mapa.altura * cam.s,
          imageRendering: 'pixelated',
        }}
      />

      {/* rastros, anel de nascimento e caveiras */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {ias.map(([nome, ia]) => {
          const d = caminho(ia.pontos, t, rastroDesde, cam, posicaoEm(ia.pontos, t));
          return (
            <g key={`rastro-${nome}`}>
              <path d={d} fill="none" stroke="#000" strokeWidth={10} strokeOpacity={0.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke={ia.cor} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
        {ias.map(([nome, ia]) => {
          const [bx, by] = tela(ia.nascimento.x, ia.nascimento.z, cam);
          return (
            <g key={`nasc-${nome}`}>
              <circle cx={bx} cy={by} r={15} fill="none" stroke="#000" strokeWidth={8} />
              <circle cx={bx} cy={by} r={15} fill="none" stroke={ia.cor} strokeWidth={4} />
            </g>
          );
        })}
        {ias.flatMap(([nome, ia]) =>
          ia.mortes
            .filter((m) => m.t <= t)
            .map((m, i) => {
              const [mx, my] = tela(m.x, m.z, cam);
              return <Caveira key={`morte-${nome}-${i}`} x={mx} y={my} tam={44} />;
            }),
        )}
      </svg>

      {/* cabeças e nomes */}
      {ias.map(([nome, ia]) => {
        const p = posicaoEm(ia.pontos, t);
        const [sx, sy] = tela(p.x, p.z, cam);
        return (
          <React.Fragment key={`cabeca-${nome}`}>
            <div style={{position: 'absolute', left: sx - HEAD / 2, top: sy - HEAD / 2}}>
              <Cabeca nome={nome} tam={HEAD} cor={ia.cor} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: sx - 110,
                width: 220,
                top: sy + HEAD / 2 + 8,
                textAlign: 'center',
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 28,
                color: '#fff',
                textShadow: '0 0 4px #000, 0 2px 0 #000, 2px 0 0 #000, -2px 0 0 #000',
                lineHeight: 1,
              }}
            >
              {nome}
            </div>
          </React.Fragment>
        );
      })}

      {/* legenda: cor, nome e mortes até agora */}
      {legenda && (
        <div style={{position: 'absolute', left: 40, top: 40, background: 'rgba(0,0,0,0.72)', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10}}>
          {ias.map(([nome, ia]) => (
            <div key={`leg-${nome}`} style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.display}}>
              <div style={{width: 22, height: 22, background: ia.cor, border: '3px solid #000'}} />
              <div style={{fontWeight: 800, fontSize: 30, color: '#fff', width: 170}}>{nome}</div>
              <svg width={26} height={26} viewBox="0 0 24 24">
                <path d="M12 2C6.9 2 3 5.7 3 10.3c0 2.8 1.4 5 3.5 6.5V20h3v-2h1v2h3v-2h1v2h3v-3.2c2-1.5 3.5-3.7 3.5-6.5C21 5.7 17.1 2 12 2z" fill="#f4f1ea" stroke="#111" strokeWidth={1.2} />
                <rect x={6.2} y={9} width={4} height={4.2} fill="#111" />
                <rect x={13.8} y={9} width={4} height={4.2} fill="#111" />
              </svg>
              <div style={{fontWeight: 800, fontSize: 30, color: '#ff8c80', width: 30, textAlign: 'right'}}>{mortesAte(ia)}</div>
            </div>
          ))}
        </div>
      )}

      {/* relógio da partida */}
      <div style={{position: 'absolute', right: 40, top: 40, background: 'rgba(0,0,0,0.72)', padding: '10px 26px', textAlign: 'center', fontFamily: FONT.display}}>
        <div style={{fontSize: 20, fontWeight: 800, color: '#a7b5b0', letterSpacing: 3}}>PARTIDA</div>
        <div style={{fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>{relogio(t)}</div>
      </div>
    </AbsoluteFill>
  );
};

// composição de teste: os primeiros 10 min da partida (nascimentos e primeiros rastros)
export const TesteMapaMC: React.FC = () => <MapaMC tIni={0} tFim={600} duracao={300} foco={{x: 40, z: 38, zoom: 7}} />;
