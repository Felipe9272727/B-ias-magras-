import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crewmate} from './Crewmate';
import {ORDEM} from './dados';
import {FONT} from '../theme';

// Vitrine dos tripulantes: todas as cores e poses lado a lado (para conferir o desenho).
export const Vitrine: React.FC = () => {
  const rot = (t: string) => <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#cfd6f5', textAlign: 'center'}}>{t}</div>;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1b2550 0%, #05060c 80%)', padding: 50, gap: 30}}>
      <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end'}}>
        {ORDEM.map((c, i) => (
          <div key={c} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <Crewmate cor={c} size={170} anim="parado" t={i * 9} />
            {rot(c)}
          </div>
        ))}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 40}}>
        {[0, 0.25, 0.5, 0.75].map((ph) => (
          <div key={ph} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Crewmate cor="Vermelho" size={190} passo={ph} anim="andando" />
            {rot(`andando ${Math.round(ph * 100)}%`)}
          </div>
        ))}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Crewmate cor="Azul" size={190} anim="tarefa" />{rot('tarefa')}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Crewmate cor="Amarelo" size={190} anim="susto" t={5} />{rot('susto')}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Crewmate cor="Rosa" size={190} morto />{rot('morto')}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Crewmate cor="Branco" size={190} fantasma t={10} />{rot('fantasma')}</div>
      </div>
    </AbsoluteFill>
  );
};
