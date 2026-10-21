// "Todas as funções": cartões das funções do Among Us 3 entrando um a um (impostores em vermelho, tripulantes em azul).
// Cada cartão tem um tripulante com um acessório desenhado aqui e uma frase curta do poder.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {Som} from './Telas';

export type Papel = {nome: string; time: 'impostor' | 'tripulante' | 'neutro'; cor: string; poder: string; novo?: boolean};
// todas as funções do Among Us 3 (as novas, pedidas nos comentários, ganham o selo NOVO)
export const PAPEIS3: Papel[] = [
  {nome: 'Metamorfo', time: 'impostor', cor: 'Vermelho', poder: 'Mata disfarçado de outro jogador.'},
  {nome: 'Fantasma', time: 'impostor', cor: 'Preto', poder: 'Fica invisível e vai para outra sala.'},
  {nome: 'Faxineiro', time: 'impostor', cor: 'Roxo', poder: 'Mata e some com o corpo na hora.'},
  {nome: 'Envenenador', time: 'impostor', cor: 'Lima', poder: 'A vítima só cai uns tiques depois, longe dele.', novo: true},
  {nome: 'Gangster', time: 'impostor', cor: 'Bordo', poder: 'Recruta um tripulante para o time dos impostores.', novo: true},
  {nome: 'Palhaço', time: 'neutro', cor: 'Coral', poder: 'Ganha sozinho se for expulso.', novo: true},
  {nome: 'Xerife', time: 'tripulante', cor: 'Amarelo', poder: 'Atira. Errou? Quem morre é ele.'},
  {nome: 'Médico', time: 'tripulante', cor: 'Branco', poder: 'Põe escudo em alguém até a reunião.'},
  {nome: 'Detetive', time: 'tripulante', cor: 'Marrom', poder: 'Examina o corpo: 3 suspeitos, um é o assassino.'},
  {nome: 'Prefeito', time: 'tripulante', cor: 'Azul', poder: 'O voto dele vale dois.'},
  {nome: 'Rastreador', time: 'tripulante', cor: 'Verde', poder: 'Sabe onde um jogador está.'},
  {nome: 'Cientista', time: 'tripulante', cor: 'Ciano', poder: 'Vê os sinais vitais de qualquer lugar.'},
  {nome: 'Engenheiro', time: 'tripulante', cor: 'Laranja', poder: 'Também usa os dutos.'},
  {nome: 'Barulhento', time: 'tripulante', cor: 'Rosa', poder: 'Se morrer, a nave inteira fica sabendo.'},
  {nome: 'Influencer', time: 'tripulante', cor: 'Cinza', poder: 'Posta foto da sala pra nave toda (2 vezes).', novo: true},
  {nome: 'Juiz', time: 'tripulante', cor: 'Branco', poder: 'Anula uma votação (1 vez).', novo: true},
  {nome: 'Segurança', time: 'tripulante', cor: 'Azul', poder: 'Vê as câmeras de qualquer lugar.', novo: true},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// `focos`: quadro em que o narrador fala cada papel; o cartão da vez acende e os outros apagam
// `papeis`/`colunas`/`compacto`: outra lista (AU4: 28 funções em 7 colunas, cartões menores)
export const AU3Papeis: React.FC<{passo?: number; focos?: number[]; papeis?: Papel[]; colunas?: number; compacto?: boolean}> = ({passo = 10, focos = [], papeis = PAPEIS3, colunas = 6, compacto = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ativo = focos.reduce((acc, q, i) => (q >= 0 && q <= f ? i : acc), -1);
  const proximo = focos.slice(ativo + 1).find((q) => q >= 0) ?? (focos[ativo] ?? 0) + 75;
  const atual = ativo >= 0 && f < Math.min(proximo, focos[ativo] + 90) ? ativo : -1;
  const COR_TIME = {impostor: '#ff3b3b', tripulante: '#8fd3ff', neutro: '#c08bff'};
  const ROTULO = {impostor: 'IMPOSTOR', tripulante: 'TRIPULANTE', neutro: 'NEUTRO'};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000'}}>Todas as funções</div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 128, display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: compacto ? 12 : 16}}>
        {papeis.map((r, i) => {
          const d = f - 10 - i * passo;
          const e = spring({frame: d, fps, config: {damping: 13, stiffness: 150}});
          const cor = COR_TIME[r.time];
          const eu = atual === i;
          const dz = eu ? f - focos[i] : 99;
          const zoom = eu ? 1 + 0.12 * spring({frame: dz, fps, config: {damping: 11}}) : 1;
          const pulo = eu ? Math.sin(Math.min(1, dz / 12) * Math.PI) * 20 : 0;
          const fundo = r.time === 'impostor' ? 'linear-gradient(#3a0b10, #1a0507)' : r.time === 'neutro' ? 'linear-gradient(#2c1240, #12071c)' : 'linear-gradient(#0e2440, #07111f)';
          return (
            <div key={r.nome} style={{position: 'relative', height: compacto ? 218 : 292, borderRadius: 18, background: fundo, border: `5px solid ${eu ? '#ffd84d' : cor}`, boxShadow: eu ? '0 0 40px #ffd84daa' : undefined, zIndex: eu ? 5 : 1, opacity: interpolate(d, [0, 6], [0, 1], cl) * (atual >= 0 && !eu ? 0.4 : 1), transform: `scale(${(0.6 + 0.4 * e) * zoom}) rotate(${(1 - e) * (i % 2 ? 6 : -6)}deg)`, overflow: 'hidden'}}>
              {dz === 0 && <Som nome={r.time === 'impostor' ? 'faca' : 'tarefa'} vol={0.3} />}
              {d >= 0 && d < 2 && <Som nome={r.time === 'impostor' ? 'faca' : 'voto'} vol={0.3} />}
              {r.novo && <div style={{position: 'absolute', right: -34, top: 14, width: 140, transform: 'rotate(35deg)', textAlign: 'center', background: '#ffd84d', color: '#000', fontFamily: FONT.display, fontWeight: 900, fontSize: 18, letterSpacing: 2, border: '2px solid #000'}}>NOVO</div>}
              <div style={{position: 'absolute', left: 14, top: (compacto ? 8 : 14) - pulo}}><Crewmate cor={r.cor} size={compacto ? 64 : 96} t={f + i * 5} /></div>
              <div style={{position: 'absolute', left: 14, right: 12, top: compacto ? 80 : 120}}>
                <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 15, letterSpacing: 2, color: cor}}>{ROTULO[r.time]}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: compacto ? 26 : 30, color: '#fff', lineHeight: 1.05}}>{r.nome}</div>
                <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 600, fontSize: compacto ? 17 : 19, color: '#dfe6f0', lineHeight: 1.18}}>{r.poder}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
