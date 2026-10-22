// Prévia de teste dos ícones, cartas, selos e HUD do Lobisomem (240 quadros, 30 fps).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';
import {
  BalaoFala,
  BalaoPensa,
  CartaPapel,
  ChatLobos,
  ContadorDia,
  Faixa,
  Icone,
  NomeIcone,
  Papel,
  PlacarVotos,
  SeloMentira,
} from './Icones';

const TODOS: NomeIcone[] = [
  'lobo', 'olho', 'pocao_cura', 'pocao_veneno', 'besta', 'aldeao', 'lua',
  'sol', 'caveira', 'mentira', 'voto', 'carroca', 'fogo', 'escudo',
  'pergaminho', 'garra', 'coracao', 'interrogacao', 'exclamacao', 'check', 'xis',
];

const CARTAS: {papel: Papel; at: number}[] = [
  {papel: 'lobisomem', at: 15},
  {papel: 'vidente', at: 25},
  {papel: 'bruxa', at: 35},
  {papel: 'cacador', at: 45},
  {papel: 'aldeao', at: 55},
];

export const PreviaLIcones: React.FC = () => {
  const frame = useCurrentFrame();
  const noite = frame < 120;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2a1d14 0%, #120c08 80%)',
        fontFamily: FONT.display,
        color: '#f4e4bc',
        overflow: 'hidden',
      }}
    >
      {/* topo: faixa de anúncio e contador */}
      {noite ? (
        <Faixa key="noite" texto="A NOITE CAIU" icone="lua" at={0} />
      ) : (
        <Faixa key="votacao" texto="VOTAÇÃO" icone="voto" at={120} />
      )}
      <ContadorDia dia={noite ? 2 : 3} noite={noite} />

      {/* grade com todos os ícones */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 190,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 140px)',
          rowGap: 14,
        }}
      >
        {TODOS.map((n) => (
          <div
            key={n}
            style={{
              width: 140,
              height: 150,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'rgba(244, 228, 188, 0.06)',
              borderRadius: 16,
            }}
          >
            <Icone nome={n} tamanho={92} />
            <span style={{fontFamily: FONT.mono, fontSize: 18, color: '#c9b58a'}}>{n}</span>
          </div>
        ))}
      </div>

      {/* cartas de papel */}
      <div style={{position: 'absolute', left: 40, top: 700, display: 'flex', gap: 24}}>
        {CARTAS.map((c) => (
          <CartaPapel key={c.papel} papel={c.papel} at={c.at} tamanho={190} />
        ))}
      </div>

      {/* selo de mentira estourando sobre a mesa */}
      <SeloMentira tipo="FABRICAÇÃO" at={90} x={1720} y={540} />

      {/* coluna da direita */}
      <div style={{position: 'absolute', left: 1110, top: 170}}>
        <ChatLobos
          mensagens={[
            {nome: 'Lobo Cinza', cor: '#ff8c80', texto: 'Quem vamos comer hoje?', at: 40},
            {nome: 'Lobo Negro', cor: '#b9a6ff', texto: 'O Bento fala demais.', at: 70},
            {nome: 'Lobo Cinza', cor: '#ff8c80', texto: 'Então ele é o primeiro.', at: 100},
            {nome: 'Lobo Negro', cor: '#b9a6ff', texto: 'Combinado. Ninguém desconfia.', at: 150},
            {nome: 'Lobo Cinza', cor: '#ff8c80', texto: 'Silêncio, a Clara está olhando.', at: 190},
            {nome: 'Lobo Negro', cor: '#b9a6ff', texto: 'Vou votar no Caçador.', at: 215},
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: 1560, top: 170}}>
        <PlacarVotos
          at={130}
          votos={[
            {nome: 'Bento', cor: '#efa1b7', n: 3},
            {nome: 'Clara', cor: '#83cdec', n: 1},
            {nome: 'Davi', cor: '#b9ed88', n: 2},
          ]}
        />
      </div>

      {/* balões de fala e de pensamento */}
      <div style={{position: 'absolute', left: 1110, top: 660}}>
        <BalaoFala nome="Clara" cor="#83cdec" texto="Eu juro que não sou lobo!" at={60} ate={120} lado="esquerda" />
      </div>
      <div style={{position: 'absolute', left: 1460, top: 800}}>
        <BalaoPensa nome="Bento" cor="#efa1b7" texto="Ela sabe demais. Preciso sumir." at={100} ate={150} lado="direita" />
      </div>
    </AbsoluteFill>
  );
};
