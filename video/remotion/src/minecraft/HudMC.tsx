// HUD do Minecraft por cima do vídeo: barra de itens (hotbar), vida, fome e armadura, como no jogo
// (escala 3 em 1080p). Os dados vêm de public/mc/hud (scripts/hud_mc.py, tirados dos logs) e as
// texturas são as oficiais, pixeladas. O tempo t é o segundo da partida. Sem emoji (regra do canal).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';

type Serie<T> = [number, T][];
type Item = [string, number];
type Hud = {
  nome: string;
  inv: Serie<Item[]>;
  mao: Serie<string | null>;
  arm: Serie<(string | null)[]>;
  vida: Serie<number>;
  fome: Serie<number>;
};
type Tex = {tipo: 'plano'; img: string} | {tipo: 'cubo'; topo: string; esq: string; dir: string};
type Dados = {hud: Hud; itens: Record<string, Tex>};

// pontos de armadura por material: capacete, peito, calça, bota
const ARMADURA: Record<string, number[]> = {
  leather: [1, 3, 2, 1],
  iron: [2, 6, 5, 2],
  golden: [2, 5, 3, 1],
  diamond: [3, 8, 6, 3],
  chainmail: [2, 5, 4, 1],
};

// cada arquivo é lido uma vez (o Remotion renderiza o mesmo quadro mais de uma vez)
const cache = new Map<string, Promise<unknown>>();
function carregar<T>(arquivo: string): Promise<T> {
  if (!cache.has(arquivo)) cache.set(arquivo, fetch(staticFile(arquivo)).then((r) => r.json()));
  return cache.get(arquivo) as Promise<T>;
}

// dados do jogador e das texturas; o quadro só sai depois que tudo carregou
function useDados(nome: string): Dados | null {
  const [dados, setDados] = useState<Dados | null>(null);
  const [h] = useState(() => delayRender(`HUD ${nome}`));
  useEffect(() => {
    Promise.all([carregar<Hud>(`mc/hud/${nome}.json`), carregar<Record<string, Tex>>('mc/hud/itens.json'), fontsReady])
      .then(([hud, itens]) => setDados({hud, itens}))
      .catch(() => continueRender(h));
  }, [nome, h]);
  useEffect(() => {
    if (dados) continueRender(h);
  }, [dados, h]);
  return dados;
}

// valor da série no tempo t: o último ponto com tempo <= t (as séries guardam só as mudanças)
function noTempo<T>(serie: Serie<T>, t: number): T {
  let lo = 0;
  let hi = serie.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (serie[m][0] <= t) {
      ans = m;
      lo = m + 1;
    } else {
      hi = m - 1;
    }
  }
  return serie[ans][1];
}

// faces do cubo isométrico: matriz afim (a, b, c, d, e, f) que leva a textura 16x16 ao paralelogramo da face
const FACES: {campo: 'topo' | 'esq' | 'dir'; m: number[]; luz: number}[] = [
  {campo: 'topo', m: [0.5, -0.25, 0.5, 0.25, 0, 4], luz: 1},
  {campo: 'esq', m: [0.5, 0.25, 0, 0.5, 0, 4], luz: 0.8},
  {campo: 'dir', m: [0.5, -0.25, 0, 0.5, 8, 8], luz: 0.6},
];

// ícone de item: textura plana, ou cubo com 3 faces em CSS (topo mais claro; esquerda e direita mais escuras)
const IconeItem: React.FC<{nome: string; itens: Record<string, Tex>; s: number}> = ({nome, itens, s}) => {
  const tex = itens[nome];
  const tam = 16 * s;
  // sem textura: quadriculado roxo e preto, como o do jogo
  if (!tex) return <div style={{width: tam, height: tam, background: 'repeating-conic-gradient(#000 0 25%, #f0f 0 50%) 0 0 / 50% 50%'}} />;
  if (tex.tipo === 'plano') {
    return <Img src={staticFile(`mc/${tex.img}`)} style={{width: tam, height: tam, display: 'block', imageRendering: 'pixelated'}} />;
  }
  return (
    <div style={{position: 'relative', width: tam, height: tam}}>
      {FACES.map((f) => (
        <div
          key={f.campo}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 16,
            height: 16,
            transformOrigin: '0 0',
            transform: `matrix(${f.m.map((v) => v * s).join(',')})`,
            filter: f.luz < 1 ? `brightness(${f.luz})` : undefined,
          }}
        >
          <Img src={staticFile(`mc/${tex[f.campo]}`)} style={{width: 16, height: 16, display: 'block', imageRendering: 'pixelated'}} />
        </div>
      ))}
    </div>
  );
};

// quantidade no canto inferior direito da casa (só acima de 1), branca com sombra cinza, letra do jogo
const Quantidade: React.FC<{n: number; s: number}> = ({n, s}) => (
  <div
    style={{
      position: 'absolute',
      right: -s,
      bottom: -s,
      fontFamily: FONT.pixel,
      fontSize: 8 * s,
      lineHeight: `${8 * s}px`,
      letterSpacing: `${-s}px`, // avanço de 7 por dígito, como no jogo
      color: '#fff',
      textShadow: `${s}px ${s}px 0 #3f3f3f`,
      whiteSpace: 'nowrap',
    }}
  >
    {n}
  </div>
);

// casa com um item (ícone + quantidade) na posição x, y da GUI (em unidades de 1 px da GUI)
const Casa: React.FC<{item?: Item; x: number; y: number; itens: Record<string, Tex>; s: number}> = ({item, x, y, itens, s}) => {
  if (!item) return null;
  return (
    <div style={{position: 'absolute', left: x * s, top: y * s, width: 16 * s, height: 16 * s}}>
      <IconeItem nome={item[0]} itens={itens} s={s} />
      {item[1] > 1 ? <Quantidade n={item[1]} s={s} /> : null}
    </div>
  );
};

// sprite de 9x9 (coração, fome ou armadura) na posição x, y da barra
const Sp: React.FC<{arq: string; x: number; y: number; s: number}> = ({arq, x, y, s}) => (
  <Img src={staticFile(`mc/gui/${arq}`)} style={{position: 'absolute', left: x * s, top: y * s, width: 9 * s, height: 9 * s, imageRendering: 'pixelated'}} />
);

// linha de 10 ícones de 2 pontos cada: vazio por baixo, depois o cheio ou o meio conforme o valor
const Linha: React.FC<{valor: number; x: (i: number) => number; y: number; sprites: [string, string, string]; s: number}> = ({valor, x, y, sprites: [vazio, cheio, meio], s}) => (
  <>
    {Array.from({length: 10}, (_, i) => (
      <React.Fragment key={i}>
        <Sp arq={vazio} x={x(i)} y={y} s={s} />
        {valor >= 2 * i + 2 ? <Sp arq={cheio} x={x(i)} y={y} s={s} /> : valor === 2 * i + 1 ? <Sp arq={meio} x={x(i)} y={y} s={s} /> : null}
      </React.Fragment>
    ))}
  </>
);

// pontos de armadura de uma peça (ex.: 'iron_chestplate' na posição 1 = 6 pontos)
function pontosDaPeca(peca: string | null, pos: number): number {
  if (!peca) return 0;
  const material = peca.replace(/_(helmet|chestplate|leggings|boots)$/, '');
  return ARMADURA[material]?.[pos] ?? 0;
}

// barra de itens com vida (esquerda), armadura (acima da vida) e fome (direita), no rodapé central
export const HudMC: React.FC<{nome: string; t: number; escala?: number}> = ({nome, t, escala = 3}) => {
  const dados = useDados(nome);
  if (!dados) return null;
  const s = escala;
  const {hud, itens} = dados;
  const casas = noTempo(hud.inv, t).slice(0, 9);
  const mao = noTempo(hud.mao, t);
  // a casa selecionada é a do item na mão; sem ele, a primeira
  const sel = Math.max(0, casas.findIndex(([n]) => n === mao));
  const arm = noTempo(hud.arm, t);
  const pontos = arm.reduce((soma, peca, i) => soma + pontosDaPeca(peca, i), 0);
  const vida = noTempo(hud.vida, t);
  const fome = noTempo(hud.fome, t);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: '50%', bottom: 0, marginLeft: -91 * s, width: 182 * s, height: 22 * s}}>
        <Img src={staticFile('mc/gui/hotbar.png')} style={{position: 'absolute', left: 0, top: 0, width: 182 * s, height: 22 * s, imageRendering: 'pixelated'}} />
        <Img src={staticFile('mc/gui/hotbar_selection.png')} style={{position: 'absolute', left: (20 * sel - 1) * s, top: -s, width: 24 * s, height: 23 * s, imageRendering: 'pixelated'}} />
        {casas.map((item, i) => (
          <Casa key={i} item={item} x={3 + 20 * i} y={3} itens={itens} s={s} />
        ))}
        <Linha valor={vida} x={(i) => 8 * i} y={-17} sprites={['heart_container.png', 'heart_full.png', 'heart_half.png']} s={s} />
        <Linha valor={fome} x={(i) => 173 - 8 * i} y={-17} sprites={['food_empty.png', 'food_full.png', 'food_half.png']} s={s} />
        {pontos > 0 ? <Linha valor={pontos} x={(i) => 8 * i} y={-27} sprites={['armor_empty.png', 'armor_full.png', 'armor_half.png']} s={s} /> : null}
      </div>
    </div>
  );
};

// inventário completo (janela de 176x166 do jogo): 3x9 de itens, e a linha da hotbar embaixo
export const InventarioMC: React.FC<{nome: string; t: number; escala?: number}> = ({nome, t, escala = 3}) => {
  const dados = useDados(nome);
  if (!dados) return null;
  const s = escala;
  const {hud, itens} = dados;
  const inv = noTempo(hud.inv, t);
  return (
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 176 * s, height: 166 * s, marginLeft: -88 * s, marginTop: -83 * s, overflow: 'hidden', pointerEvents: 'none'}}>
      <Img src={staticFile('mc/gui/inventory.png')} style={{position: 'absolute', left: 0, top: 0, width: 256 * s, height: 256 * s, imageRendering: 'pixelated'}} />
      {Array.from({length: 27}, (_, k) => (
        <Casa key={k} item={inv[9 + k]} x={9 + 18 * (k % 9)} y={85 + 18 * Math.floor(k / 9)} itens={itens} s={s} />
      ))}
      {Array.from({length: 9}, (_, c) => (
        <Casa key={`h${c}`} item={inv[c]} x={9 + 18 * c} y={143} itens={itens} s={s} />
      ))}
    </div>
  );
};

// teste: GLM (t=100) no quadrante de cima à esquerda, inventário do Claude (t=3805) em cima à direita,
// e a barra do Claude embaixo
export const TesteHudMC: React.FC = () => (
  <AbsoluteFill style={{background: '#4a4a4a'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 540, overflow: 'hidden'}}>
      <HudMC nome="GLM" t={100} />
    </div>
    <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 540, overflow: 'hidden'}}>
      <InventarioMC nome="Claude" t={3805} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 540, width: 1920, height: 540, overflow: 'hidden'}}>
      <HudMC nome="Claude" t={3805} />
    </div>
  </AbsoluteFill>
);
