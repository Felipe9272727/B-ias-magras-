// "As novas profissões": cartões dos papéis do Among Us 2 entrando um a um (impostores em vermelho, tripulantes em azul).
// Cada cartão tem um tripulante com um acessório desenhado aqui e uma frase curta do poder.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {Som} from './Telas';

type Papel = {nome: string; time: 'impostor' | 'tripulante'; cor: string; poder: string};
export const PAPEIS2: Papel[] = [
  {nome: 'Metamorfo', time: 'impostor', cor: 'Vermelho', poder: 'Vira outro jogador por um tempo.'},
  {nome: 'Fantasma', time: 'impostor', cor: 'Preto', poder: 'Fica invisível (mas não mata assim).'},
  {nome: 'Faxineiro', time: 'impostor', cor: 'Roxo', poder: 'Some com o corpo antes de acharem.'},
  {nome: 'Xerife', time: 'tripulante', cor: 'Amarelo', poder: 'Atira. Errou? Quem morre é ele.'},
  {nome: 'Médico', time: 'tripulante', cor: 'Branco', poder: 'Põe escudo em alguém até a reunião.'},
  {nome: 'Detetive', time: 'tripulante', cor: 'Marrom', poder: 'Examina o corpo: descobre a empresa do assassino.'},
  {nome: 'Prefeito', time: 'tripulante', cor: 'Azul', poder: 'O voto dele vale dois (em segredo).'},
  {nome: 'Rastreador', time: 'tripulante', cor: 'Verde', poder: 'Sabe onde um jogador está.'},
  {nome: 'Cientista', time: 'tripulante', cor: 'Ciano', poder: 'Vê os sinais vitais de qualquer lugar.'},
  {nome: 'Engenheiro', time: 'tripulante', cor: 'Laranja', poder: 'Também usa os dutos.'},
  {nome: 'Barulhento', time: 'tripulante', cor: 'Rosa', poder: 'Se morrer, a nave inteira fica sabendo.'},
  {nome: 'Tripulante', time: 'tripulante', cor: 'Lima', poder: 'Só tarefas e fé.'},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// `focos`: quadro em que o narrador fala cada papel; o cartão da vez acende e os outros apagam
export const AU2Papeis: React.FC<{passo?: number; focos?: number[]}> = ({passo = 14, focos = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ativo = focos.reduce((acc, q, i) => (q >= 0 && q <= f ? i : acc), -1);
  const proximo = focos.slice(ativo + 1).find((q) => q >= 0) ?? (focos[ativo] ?? 0) + 75;
  const atual = ativo >= 0 && f < Math.min(proximo, focos[ativo] + 90) ? ativo : -1;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '2px #000'}}>Papéis</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 150, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22}}>
        {PAPEIS2.map((r, i) => {
          const d = f - 10 - i * passo;
          const e = spring({frame: d, fps, config: {damping: 13, stiffness: 150}});
          const imp = r.time === 'impostor';
          const cor = imp ? '#ff3b3b' : '#8fd3ff';
          const eu = atual === i;
          const dz = eu ? f - focos[i] : 99;
          const zoom = eu ? 1 + 0.1 * spring({frame: dz, fps, config: {damping: 11}}) : 1;
          const pulo = eu ? Math.sin(Math.min(1, dz / 12) * Math.PI) * 26 : 0;
          return (
            <div key={r.nome} style={{position: 'relative', height: 280, borderRadius: 20, background: imp ? 'linear-gradient(#3a0b10, #1a0507)' : 'linear-gradient(#0e2440, #07111f)', border: `5px solid ${eu ? '#ffd84d' : cor}`, boxShadow: eu ? '0 0 40px #ffd84daa' : undefined, zIndex: eu ? 5 : 1, opacity: interpolate(d, [0, 6], [0, 1], cl) * (atual >= 0 && !eu ? 0.4 : 1), transform: `scale(${(0.6 + 0.4 * e) * zoom}) rotate(${(1 - e) * (i % 2 ? 6 : -6)}deg)`, overflow: 'hidden'}}>
              {dz === 0 && <Som nome={imp ? 'faca' : 'tarefa'} vol={0.3} />}
              {d >= 0 && d < 2 && <Som nome={imp ? 'faca' : 'voto'} vol={0.35} />}
              <div style={{position: 'absolute', left: 18, top: 50 - pulo}}><Crewmate cor={r.cor} size={150} t={f + i * 5} /></div>
              <div style={{position: 'absolute', left: 190, right: 16, top: 22}}>
                <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: cor}}>{imp ? 'IMPOSTOR' : 'TRIPULANTE'}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', lineHeight: 1.1}}>{r.nome}</div>
                <div style={{marginTop: 10, fontFamily: FONT.display, fontWeight: 600, fontSize: 23, color: '#dfe6f0', lineHeight: 1.25}}>{r.poder}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
