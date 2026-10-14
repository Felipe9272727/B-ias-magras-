// O sorteio da temporada no terminal: o comando em Python, a fonte de aleatoriedade e os impostores de cada partida
// aparecendo linha a linha (com as carinhas ao lado). Os dados são os de amongus/logs2/sorteio.txt.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {Som} from './Telas';

export type LinhaSorteio = {partida: number; impostores: {cor: string; papel: string; modelo: string}[]; nota?: string};
export const SORTEIO: LinhaSorteio[] = [
  {partida: 1, impostores: [{cor: 'Verde', papel: 'Fantasma', modelo: 'Gemini'}, {cor: 'Laranja', papel: 'Faxineiro', modelo: 'GPT'}, {cor: 'Marrom', papel: 'Metamorfo', modelo: 'Claude Haiku'}]},
  {partida: 2, impostores: [{cor: 'Azul', papel: 'Metamorfo', modelo: 'DeepSeek'}, {cor: 'Verde', papel: 'Faxineiro', modelo: 'Gemini'}, {cor: 'Roxo', papel: 'Fantasma', modelo: 'GPT'}], nota: 'estratégia da Maria → Verde'},
  {partida: 3, impostores: [{cor: 'Azul', papel: 'Metamorfo', modelo: 'DeepSeek'}, {cor: 'Preto', papel: 'Fantasma', modelo: 'Grok'}, {cor: 'Branco', papel: 'Faxineiro', modelo: 'Claude Haiku'}]},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const Digita: React.FC<{txt: string; de: number; vel?: number; cor?: string}> = ({txt, de, vel = 1.4, cor = '#e6edf3'}) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [de, de + txt.length / vel], [0, txt.length], cl));
  if (f < de) return null;
  return <span style={{color: cor}}>{txt.slice(0, n)}{n < txt.length && f % 16 < 8 ? '█' : ''}</span>;
};

export const AU2Sorteio: React.FC<{linhas?: LinhaSorteio[]}> = ({linhas = SORTEIO}) => {
  const f = useCurrentFrame();
  const cmd = '$ python3 sorteio.py --partidas 3';
  const t0 = 8 + cmd.length / 3 + 6;
  const zoom = interpolate(f, [0, 400], [1, 1.07], cl);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1a2030, #06080c 80%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${zoom})`, width: 1640, height: 900, borderRadius: 18, background: '#0d1117', border: '2px solid #30363d', boxShadow: '0 30px 80px #000c', overflow: 'hidden'}}>
        <div style={{height: 52, background: '#161b22', borderBottom: '2px solid #30363d', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px'}}>
          {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
          <div style={{marginLeft: 20, fontFamily: MONO, fontSize: 22, color: '#8b949e'}}>amongus — sorteio da temporada</div>
        </div>
        <div style={{padding: '30px 40px', fontFamily: MONO, fontSize: 32, lineHeight: 1.55}}>
          <div><Digita txt={cmd} de={8} vel={3} cor="#7ee787" /></div>
          <div><Digita txt="fonte: secrets.SystemRandom()  # aleatoriedade do sistema operacional" de={t0} vel={6} cor="#8b949e" /></div>
          {linhas.map((l, i) => {
            const de = t0 + 18 + i * 30;
            return (
              <div key={l.partida} style={{marginTop: 22, opacity: f >= de ? 1 : 0}}>
                {f >= de && f < de + 2 && <Som nome="voto" vol={0.5} />}
                <Digita txt={`partida ${l.partida}: impostores =`} de={de} vel={2.5} cor="#e6edf3" />
                <div style={{display: 'flex', gap: 34, marginTop: 8, marginLeft: 40}}>
                  {l.impostores.map((im, k) => {
                    const a = interpolate(f, [de + 14 + k * 8, de + 22 + k * 8], [0, 1], cl);
                    return (
                      <div key={im.cor} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
                        <Crewmate cor={im.cor} size={62} />
                        <div style={{lineHeight: 1.15}}>
                          <div style={{color: '#ff7b72', fontWeight: 700}}>{im.cor}</div>
                          <div style={{fontSize: 22, color: '#8b949e'}}>{im.papel} · {im.modelo}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {l.nota && <div style={{marginLeft: 40, fontSize: 24, color: '#d2a8ff', opacity: interpolate(f, [de + 44, de + 52], [0, 1], cl)}}># {l.nota}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
