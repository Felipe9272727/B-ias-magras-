// Among Us 3, extra do fim: PRÉVIA do episódio 4 (funções de fantasma). Cena MONTADA à mão, não é uma partida: o selo
// "PRÉVIA · cena montada" fica na tela o tempo todo. Cada momento entra quando o narrador fala a palavra (`marcas`).
//   morre → vira fantasma → atravessa a parede → faz tarefa → reunião (grita e ninguém ouve) → Anjo da Guarda (escudo)
//   → Influencer fantasma (pista do além) → "será?" → EPISÓDIO 4
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {Arte} from '../amongus/nave/Arte';
import {NAVE} from '../amongus/nave/mapa';
import {TILE} from '../amongus/nave/spec';
import {FONT} from '../theme';
import {Som} from './Telas';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
type Pt = {x: number; y: number};
export type MarcasPrevia = {morre: number; fantasma: number; parede: number; tarefa: number; reuniao: number; anjo: number; influencer: number; confiar: number; fim: number};

// lugares no Refeitório (px de mundo; mesa do botão em 2659, 576)
const P = {
  verde: {x: 2440, y: 640}, vermelhoIni: {x: 2200, y: 520}, vermelhoMata: {x: 2380, y: 640},
  parede: {x: 3560, y: 470}, tarefa: {x: 3250, y: 940},
  mesa: {x: 2659, y: 576}, rosa: {x: 2330, y: 880},
};
const VIVOS_MESA: [string, Pt][] = [['Vermelho', {x: 2500, y: 470}], ['Azul', {x: 2820, y: 470}], ['Amarelo', {x: 2500, y: 760}], ['Laranja', {x: 2820, y: 760}], ['Ciano', {x: 2930, y: 620}]];

const lerp = (a: Pt, b: Pt, k: number): Pt => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});
const suave = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});

const Balao: React.FC<{txt: string; cor?: string; k: number; pensa?: boolean}> = ({txt, cor = '#000', k, pensa}) => (
  <div style={{position: 'absolute', left: '50%', bottom: 118, transform: `translateX(-50%) scale(${k})`, transformOrigin: '50% 100%', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: pensa ? 30 : 14, background: '#fff', border: '4px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: cor, boxShadow: '0 5px 0 #0008'}}>{txt}</div>
);

const Boneco: React.FC<{cor: string; p: Pt; f: number; fantasma?: boolean; morto?: boolean; virado?: boolean; andando?: boolean; alpha?: number; children?: React.ReactNode; nome?: boolean}> = ({cor, p, f, fantasma, morto, virado, andando, alpha = 1, children, nome = true}) => (
  <div style={{position: 'absolute', left: p.x - 38, top: p.y - 88, opacity: alpha}}>
    {!fantasma && <div style={{position: 'absolute', left: 8, top: 82, width: 60, height: 14, borderRadius: '50%', background: '#00000055'}} />}
    <div style={{filter: fantasma ? 'drop-shadow(0 0 10px #d6ecff) drop-shadow(0 0 4px #ffffff)' : undefined}}><Crewmate cor={cor} size={76} morto={morto} fantasma={fantasma} t={f} virado={virado} passo={andando ? f / 8.5 : 0} anim={andando ? 'andando' : 'parado'} /></div>
    {nome && !morto && <div style={{position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 800, fontSize: 19, color: fantasma ? '#cfe6ff' : '#fff', WebkitTextStroke: '0.8px #000'}}>{cor}{fantasma ? ' 👻' : ''}</div>}
    {children}
  </div>
);

export const AU3Previa: React.FC<{m: MarcasPrevia}> = ({m}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  // 1) Vermelho anda até o Verde e mata
  const ataque = suave(f, m.morre - 40, m.morre);
  const vermelho = f < m.reuniao ? lerp(P.vermelhoIni, P.vermelhoMata, ataque) : null;
  const vivoVerde = f < m.morre;
  // 2) o fantasma sobe do corpo; 3) atravessa a parede; 4) faz tarefa; 5) vai pra reunião (flutua em cima da mesa)
  const sobe = suave(f, m.fantasma, m.fantasma + 25);
  let g: Pt = {x: P.verde.x, y: P.verde.y - 70 * sobe};
  if (f >= m.parede) g = lerp(g, P.parede, suave(f, m.parede, m.parede + 60));
  if (f >= m.tarefa) g = lerp(P.parede, P.tarefa, suave(f, m.tarefa - 10, m.tarefa + 30));
  if (f >= m.reuniao) g = lerp(P.tarefa, {x: 3090, y: 520}, suave(f, m.reuniao, m.reuniao + 25));
  const tarefaK = interpolate(f, [m.tarefa + 30, m.tarefa + 75], [0, 1], cl);
  // câmera: segue a ação de cada momento
  const alvos: [number, Pt, number][] = [
    [0, {x: 2400, y: 590}, 1.9], [m.parede, {x: 3300, y: 520}, 1.6], [m.tarefa, {x: 3230, y: 820}, 1.75],
    [m.reuniao, {x: 2700, y: 590}, 1.6], [m.influencer, {x: 2620, y: 640}, 1.6], [m.fim, {x: 2700, y: 590}, 1.6],
  ];
  let cam = alvos[0][1], z = alvos[0][2];
  for (let i = 1; i < alvos.length; i++) {
    const k = suave(f, alvos[i][0], alvos[i][0] + 30);
    if (k > 0) { cam = lerp(cam, alvos[i][1], k); z = z + (alvos[i][2] - z) * k }
  }
  const naMesa = f >= m.reuniao;
  const anjo = f >= m.anjo;
  const influ = f >= m.influencer;
  const fim = interpolate(f, [m.fim - 4, m.fim + 10], [0, 1], cl);
  const tremeGrito = naMesa && f < m.anjo ? Math.sin(f * 1.7) * 3 : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: NAVE.cols * TILE, height: NAVE.rows * TILE, transformOrigin: '0 0', transform: `translate(${960 - cam.x * z}px, ${540 - cam.y * z}px) scale(${z})`, filter: naMesa ? 'saturate(0.85)' : undefined}}>
        <Arte v3 />
        {/* corpo do Verde (some na reunião, como no jogo) */}
        {!vivoVerde && !naMesa && <div style={{position: 'absolute', left: P.verde.x - 40, top: P.verde.y - 78}}><Crewmate cor="Verde" size={80} morto /></div>}
        {vivoVerde && <Boneco cor="Verde" p={P.verde} f={f} virado />}
        {vermelho && <Boneco cor="Vermelho" p={vermelho} f={f} andando={ataque > 0 && ataque < 1} />}
        {f >= m.morre && f < m.morre + 10 && <div style={{position: 'absolute', left: P.verde.x - 300, top: P.verde.y - 340, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,30,30,${0.5 * (1 - (f - m.morre) / 10)}) 0%, transparent 65%)`}} />}
        {/* os vivos na reunião */}
        {naMesa && VIVOS_MESA.map(([c, p]) => (
          <Boneco key={c} cor={c} p={p} f={f} virado={p.x > P.mesa.x}>
            {c === 'Vermelho' && f < m.anjo && <Balao txt="Eu tava no Admin, juro." k={spring({frame: f - m.reuniao - 20, fps, config: {damping: 12}})} />}
            {c === 'Azul' && anjo && <div style={{position: 'absolute', left: -34, top: -40, width: 144, height: 144, borderRadius: '50%', border: '8px solid #6dff8a', boxShadow: '0 0 34px #6dff8a', opacity: interpolate(f, [m.anjo + 10, m.anjo + 20], [0, 1], cl), transform: `scale(${spring({frame: f - m.anjo - 10, fps, config: {damping: 10}})})`}} />}
            {c === 'Amarelo' && influ && <Balao txt={f < m.confiar ? '📩 recebi uma pista...' : '🤔 será que é verdade?'} pensa k={spring({frame: f - m.influencer - 30, fps, config: {damping: 12}})} />}
          </Boneco>
        ))}
        {/* o fantasma Verde (Anjo da Guarda depois) */}
        {f >= m.fantasma && (
          <Boneco cor="Verde" p={{x: g.x + tremeGrito, y: g.y}} f={f} fantasma>
            {anjo && <div style={{position: 'absolute', left: 14, top: -18, width: 48, height: 14, borderRadius: '50%', border: '5px solid #ffe14d', boxShadow: '0 0 16px #ffe14d'}} />}
            {f >= m.tarefa + 30 && f < m.reuniao && (
              <div style={{position: 'absolute', left: 90, top: 10, width: 150, height: 18, background: '#2a2e38', border: '4px solid #000', borderRadius: 6}}>
                <div style={{width: `${tarefaK * 100}%`, height: '100%', background: '#57e04f'}} />
                {tarefaK >= 1 && <div style={{position: 'absolute', left: 0, top: 18, fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#57e04f', WebkitTextStroke: '1px #000'}}>✔ tarefa feita</div>}
              </div>
            )}
            {naMesa && f < m.anjo && <Balao txt="FOI ELE!!! 🔇" cor="#c00" k={spring({frame: f - m.reuniao - 45, fps, config: {damping: 9}})} />}
          </Boneco>
        )}
        {/* o fantasma Rosa: Influencer fantasma, manda a pista pro Amarelo */}
        {influ && (
          <Boneco cor="Rosa" p={{x: P.rosa.x, y: P.rosa.y - 30 * spring({frame: f - m.influencer, fps})}} f={f} fantasma alpha={interpolate(f, [m.influencer, m.influencer + 15], [0, 1], cl)}>
            {(() => {
              const k = suave(f, m.influencer + 15, m.influencer + 40);
              const a = VIVOS_MESA[2][1];
              return k > 0 && k < 1 ? <div style={{position: 'absolute', left: 30 + (a.x - P.rosa.x) * k, top: 10 + (a.y - P.rosa.y + 30) * k, fontSize: 40}}>📩</div> : null;
            })()}
          </Boneco>
        )}
      </div>
      {/* legendas dos momentos */}
      {naMesa && f < m.anjo && <Faixa txt="fantasma não fala na reunião" f={f - m.reuniao - 45} />}
      {anjo && f < m.influencer && <Faixa txt="😇 ANJO DA GUARDA: escudo nos vivos" f={f - m.anjo} />}
      {influ && f < m.fim && (
        <div style={{position: 'absolute', right: 30, bottom: 36, width: 520, padding: '20px 26px', borderRadius: 22, background: 'rgba(30,10,50,.92)', border: '5px solid #c08bff', boxShadow: '0 0 30px #c08bff88', opacity: interpolate(f, [m.influencer + 35, m.influencer + 45], [0, 1], cl)}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#c08bff', letterSpacing: 2}}>📩 PISTA DO ALÉM (Rosa 👻)</div>
          <div style={{marginTop: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: '#fff', lineHeight: 1.15}}>“O impostor está na Navegação.”</div>
        </div>
      )}
      {/* selo: cena montada */}
      <div style={{position: 'absolute', left: 30, top: 26, padding: '8px 20px', borderRadius: 12, background: '#000c', border: '4px solid #ffd84d', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#ffd84d', letterSpacing: 2}}>
        PRÉVIA · EPISÓDIO 4 <span style={{fontSize: 20, color: '#fff', letterSpacing: 0}}>(cena montada, não é partida)</span>
      </div>
      {f === m.morre && <Som nome="faca" vol={0.6} />}
      {f === m.fantasma && <Som nome="sumir" vol={0.5} />}
      {f === m.tarefa + 75 && <Som nome="tarefa" vol={0.5} />}
      {f === m.reuniao && <Som nome="emergencia" vol={0.4} />}
      {f === m.anjo + 10 && <Som nome="escudo" vol={0.5} />}
      {f === m.influencer + 40 && <Som nome="chat" vol={0.6} />}
      {/* fecho */}
      {fim > 0 && (
        <AbsoluteFill style={{background: `rgba(5,3,15,${0.9 * fim})`, display: 'grid', placeItems: 'center'}}>
          <div style={{textAlign: 'center', transform: `scale(${0.8 + 0.2 * spring({frame: f - m.fim, fps})})`, opacity: fim}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16}}>
              {['Verde', 'Rosa', 'Ciano', 'Roxo'].map((c, i) => <div key={c} style={{filter: 'drop-shadow(0 0 12px #d6ecff)', transform: `translateY(${Math.sin((f + i * 20) / 12) * 10}px)`}}><Crewmate cor={c} size={110} fantasma t={f + i * 15} /></div>)}
            </div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 10px 0 #000'}}>EPISÓDIO 4</div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#cfe6ff', WebkitTextStroke: '2px #000'}}>👻 com fantasmas</div>
          </div>
        </AbsoluteFill>
      )}
      {/* sem cortar o fim seco */}
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [durationInFrames - 12, durationInFrames - 1], [0, 1], cl), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const Faixa: React.FC<{txt: string; f: number}> = ({txt, f}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', opacity: interpolate(f, [0, 8], [0, 1], cl)}}>
    <span style={{padding: '10px 28px', borderRadius: 14, background: '#000c', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff'}}>{txt}</span>
  </div>
);
