// Prévia da arte nova (estilo Wolvesville): quadro 0-59 = tela do dia, 60-119 = noite com chat dos lobos,
// 120+ = folha com as expressões e os ícones dos papéis.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Avatar, AvatarId, AVATARES, Expressao} from './Avatar';
import {IconePapel, Papel, PAPEIS} from './Papeis';
import {Barra, Chat, Faixa, Fundo, Grade, Jogador, Msg} from './Tela';

const IDS = Object.keys(AVATARES) as AvatarId[];
const MODELOS = ['Claude Haiku', 'Claude Haiku', 'GLM 5.3 Flash', 'GLM 5.3 Flash', 'Qwen 3.8 27B', 'Qwen 3.8 27B', 'DeepSeek Flash', 'MiniMax M3.1 Flash'];
const PS: Papel[] = ['vidente', 'aldeao', 'medico', 'lobisomem', 'bobo', 'carcereiro', 'pistoleiro', 'lobo_vidente'];
const JS: Jogador[] = IDS.map((id, i) => ({id, nome: AVATARES[id].nome, modelo: MODELOS[i], papel: PS[i], numero: i + 1}));

export const PreviaLobo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 120) {
    const noite = f >= 60;
    const msgs: Msg[] = noite
      ? [
          {tipo: 'sistema', texto: 'Noite 1 começou', at: 0, cor: '#283593'},
          {tipo: 'jogador', j: JS[3], texto: 'Vamos no Bardo, ele fala demais.', at: 0},
          {tipo: 'jogador', j: JS[7], texto: 'Fechado. Bardo hoje.', at: 0},
          {tipo: 'pensa', j: JS[7], texto: 'Se o Lenhador cair, eu finjo que sou vidente.', at: 0},
        ]
      : [
          {tipo: 'sistema', texto: 'Dia 1 começou. Preparem-se para discutir!', at: 0},
          {tipo: 'sistema', texto: 'O Bardo foi morto pelos lobos. Ele era Aldeão.', at: 0, cor: '#c62828'},
          {tipo: 'jogador', j: JS[5], texto: 'Bardo de Aldeão? Os lobos já saíram caçando né. Quem tava mais quieto ontem?', at: 0},
          {tipo: 'jogador', j: JS[0], texto: 'Ué, Pescador, ficar quieto não prova nada.', at: 0},
          {tipo: 'pensa', j: JS[3], texto: 'Ninguém desconfia de mim. Perfeito.', at: 0},
        ];
    return (
      <AbsoluteFill>
        <Fundo noite={noite} />
        <Barra texto={noite ? 'Noite 1' : 'Dia 1 · Discussão'} noite={noite} icone={noite ? 'lua' : 'sol'} />
        <Grade js={JS} noite={noite} estado={(j) => ({
          falando: !noite && j.id === 'padeira', destaque: !noite && j.id === 'padeira', expressao: j.id === 'lenhador' ? 'desconfiado' : 'neutro',
          morto: j.id === 'bardo' && !noite, lobo: noite && (j.papel === 'lobisomem' || j.papel === 'lobo_vidente'), votos: !noite && j.id === 'pescador' ? 3 : 0,
          preso: noite && j.id === 'boticaria',
        })} />
        <Faixa texto={noite ? 'Os lobos escolhem a vítima' : 'A Padeira acusa o Pescador'} />
        <Chat msgs={msgs} titulo={noite ? 'Chat dos lobos' : 'Chat da vila'} tema={noite ? 'lobos' : 'dia'} />
      </AbsoluteFill>
    );
  }
  const EX: Expressao[] = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando', 'dormindo'];
  return (
    <AbsoluteFill style={{background: '#9fe3fb'}}>
      <svg width={1920} height={880} viewBox="0 0 2000 880">
        {IDS.map((id, r) => EX.map((e, c) => (
          <g key={id + e} transform={`translate(${c * 200} ${r * 110}) scale(0.55)`}><Avatar id={id} expressao={e} t={f} falando={e === 'neutro' && f % 10 < 5} /></g>
        )))}
      </svg>
      <div style={{position: 'absolute', bottom: 20, left: 40, display: 'flex', gap: 30}}>
        {(Object.keys(PAPEIS) as Papel[]).map((p) => <div key={p} style={{textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800}}><IconePapel papel={p} tamanho={140} /><div>{PAPEIS[p].nome}</div></div>)}
      </div>
    </AbsoluteFill>
  );
};
