// Thumbnail do "Overcooked das IAs" (1280×720): a cozinha do coop de verdade no fundo (tique 87, os quatro brigando
// pela mesma sopa), os 4 chefs grandes em pânico na frente, "4 IAs NO OVERCOOKED", o placar de -120 e um grito real.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, staticFile} from 'remotion';
import {FONT} from '../theme';
import {COR_EMPRESA, Pedidos, type LogOC} from './Cozinha';
import {ChefSprite, Cozinha3D, Sprite} from './Cozinha3D';
import PECAS from '../../public/overcooked/pecas/pecas.json';

const PXM = (PECAS as unknown as {px_m: number}).px_m;

export const calcThumbOC: CalculateMetadataFunction<{log: LogOC | null}> = async () => {
  const log = (await (await fetch(staticFile('overcooked/thumb_log.json'))).json()) as LogOC;
  return {props: {log}};
};

export const ThumbOC: React.FC<{log: LogOC | null}> = ({log}) => (
  <AbsoluteFill style={{background: '#0b1720', overflow: 'hidden'}}>
    {/* a cozinha de verdade, de perto */}
    {log && (
      <div style={{position: 'absolute', inset: 0, filter: 'saturate(1.15) brightness(0.72)'}}>
        <Cozinha3D log={log} cz={0} t={87.7} w={1280} h={720} hud={false} titulo={false} falas={false} Pedidos={Pedidos}
          camera={{s: 1.9, tx: -980, ty: -60}} />
      </div>
    )}
    {/* vinheta pra destacar o texto */}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #000f 0%, #000c 42%, #0004 60%, transparent 72%)'}} />
    {/* os 4 chefs, grandes, em pânico */}
    {[
      {e: 'GPT', x: 800, y: 545, k: 0.95, anim: 'panico', dir: 0},
      {e: 'Gemini', x: 1185, y: 545, k: 0.95, anim: 'panico', dir: 0},
      {e: 'Claude', x: 860, y: 700, k: 1.15, anim: 'carregar', dir: 0},
      {e: 'DeepSeek', x: 1075, y: 712, k: 1.2, anim: 'panico', dir: 0},
    ].map((c, i) => <ChefSprite key={c.e} cor={COR_EMPRESA[c.e]} anim={c.anim} dir={c.dir} x={c.x} y={c.y} k={c.k} frame={i * 5 + 2} z={10 + i * 2} />)}
    {/* o pão que virou prato, na mão do Claude (mesma conta da mão no Cozinha3D) */}
    <Sprite nome="prato" grupo="itens" x={860} y={700 + 0.36 * 1.15 * PXM * 0.788 - 0.62 * 1.15 * PXM * 0.616} k={1.15} esc={0.95} z={15} />
    <Sprite nome="pao" grupo="itens" x={860} y={700 + 0.36 * 1.15 * PXM * 0.788 - 0.62 * 1.15 * PXM * 0.616 - 10} k={1.15} esc={0.75} z={16} />
    {/* grito real (DeepSeek, várias vezes no jogo) */}
    <div style={{position: 'absolute', left: 820, top: 40, padding: '12px 24px', background: '#fff1a8', border: '7px solid #e01b1b', borderRadius: 14, fontFamily: FONT.display, fontWeight: 900, fontSize: 52, lineHeight: 1, color: '#111', transform: 'rotate(4deg)', boxShadow: '0 8px 0 #000a', zIndex: 50}}>
      SAI DA FRENTE!
      <div style={{position: 'absolute', left: 150, bottom: -44, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '40px solid #e01b1b'}} />
    </div>
    <div style={{position: 'absolute', left: 975, top: 470, fontSize: 64, zIndex: 40, transform: 'rotate(12deg)'}}>💢</div>
    {/* título */}
    <div style={{position: 'absolute', left: 34, top: 22, fontFamily: FONT.display, fontWeight: 900, fontSize: 168, lineHeight: 0.9, color: '#ffcf33', WebkitTextStroke: '7px #000', textShadow: '0 10px 0 #000', letterSpacing: -3, zIndex: 50}}>
      4 IAs
    </div>
    <div style={{position: 'absolute', left: 40, top: 196, fontFamily: FONT.display, fontWeight: 900, fontSize: 78, lineHeight: 1, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000', zIndex: 50}}>
      NO OVERCOOKED
    </div>
    <div style={{position: 'absolute', left: 40, top: 302, display: 'flex', flexWrap: 'wrap', gap: 10, width: 640, zIndex: 50}}>
      {['DeepSeek', 'Claude', 'GPT', 'Gemini'].map((e) => (
        <span key={e} style={{padding: '6px 18px', borderRadius: 14, background: COR_EMPRESA[e], border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{e}</span>
      ))}
    </div>
    {/* o placar de verdade do coop */}
    <div style={{position: 'absolute', left: 40, bottom: 34, display: 'flex', alignItems: 'center', gap: 16, transform: 'rotate(-4deg)', zIndex: 50}}>
      <div style={{width: 92, height: 92, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffe680, #e0a800)', border: '7px solid #7a5200'}} />
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 140, lineHeight: 1, color: '#ff3b2f', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000'}}>-120</span>
    </div>
  </AbsoluteFill>
);
