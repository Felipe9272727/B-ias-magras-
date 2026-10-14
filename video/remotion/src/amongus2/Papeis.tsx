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

export const AU2Papeis: React.FC<{passo?: number}> = ({passo = 14}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '2px #000'}}>Papéis</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 150, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22}}>
        {PAPEIS2.map((r, i) => {
          const d = f - 10 - i * passo;
          const e = spring({frame: d, fps, config: {damping: 13, stiffness: 150}});
          const imp = r.time === 'impostor';
          const cor = imp ? '#ff3b3b' : '#8fd3ff';
          return (
            <div key={r.nome} style={{position: 'relative', height: 280, borderRadius: 20, background: imp ? 'linear-gradient(#3a0b10, #1a0507)' : 'linear-gradient(#0e2440, #07111f)', border: `5px solid ${cor}`, opacity: interpolate(d, [0, 6], [0, 1], cl), transform: `scale(${0.6 + 0.4 * e}) rotate(${(1 - e) * (i % 2 ? 6 : -6)}deg)`, overflow: 'hidden'}}>
              {d >= 0 && d < 2 && <Som nome={imp ? 'faca' : 'voto'} vol={0.35} />}
              <div style={{position: 'absolute', left: 18, top: 50}}><Crewmate cor={r.cor} size={150} t={f + i * 5} /></div>
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
