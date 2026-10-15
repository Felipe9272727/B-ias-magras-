import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COR, Crewmate} from './Crewmate';
import {Crewmate4} from './Crewmate4';
import {COSMETICO_PADRAO, nomeCosmetico} from './cosmeticos';

// Prévia de design do AU4: os 15 tripulantes novos com seus cosméticos, a comparação com o
// Crewmate antigo, as poses de animação e os estados morto e fantasma. Só para conferir visual.
export const AU4Elenco: React.FC = () => {
  // o tempo em frames alimenta a respiração, a animação de andar e o fantasma
  const frame = useCurrentFrame();
  const cores = Object.keys(COR);

  const texto: React.CSSProperties = {color: '#f2f5fb', fontFamily: 'sans-serif', whiteSpace: 'nowrap', textAlign: 'center'};
  const painel: React.CSSProperties = {position: 'absolute', background: '#2b3756', borderRadius: 14};

  return (
    <AbsoluteFill style={{background: '#1e2740'}}>
      {/* título */}
      <div style={{...texto, position: 'absolute', top: 40, width: '100%', fontSize: 52, fontWeight: 800}}>
        TRIPULANTES 4 · ELENCO
      </div>
      <div style={{...texto, position: 'absolute', top: 108, width: '100%', fontSize: 22, color: '#aab4c8'}}>
        15 cores, 15 cosméticos diferentes (desenho próprio em SVG)
      </div>

      {/* elenco: os 15 jogadores lado a lado */}
      {cores.map((cor, i) => {
        const x = 75 + i * 118;
        const cosmetico = COSMETICO_PADRAO[cor];
        return (
          <React.Fragment key={cor}>
            <div style={{...painel, left: x + 4, top: 170, width: 110, height: 230}} />
            <Crewmate4
              cor={cor}
              size={92}
              t={frame}
              cosmetico={cosmetico}
              style={{position: 'absolute', left: x + 13, top: 190}}
            />
            <div style={{...texto, position: 'absolute', left: x, top: 332, width: 118, fontSize: 19, fontWeight: 700}}>{cor}</div>
            <div style={{...texto, position: 'absolute', left: x, top: 360, width: 118, fontSize: 14, color: '#aab4c8'}}>
              {nomeCosmetico(cosmetico)}
            </div>
          </React.Fragment>
        );
      })}

      {/* seções de baixo, deslocadas para o meio da tela (o elenco fica em cima) */}
      <div style={{position: 'absolute', top: 60, left: 0, width: '100%', height: 700}}>
      {/* comparação: Crewmate antigo x novo, mesma cor (Azul) */}
      <div style={{...texto, position: 'absolute', left: 120, top: 430, width: 560, fontSize: 24, fontWeight: 700}}>
        Antigo x novo (Azul)
      </div>
      <Crewmate cor="Azul" size={150} t={frame} style={{position: 'absolute', left: 170, top: 480}} />
      <div style={{...texto, position: 'absolute', left: 150, top: 690, width: 190, fontSize: 18, color: '#aab4c8'}}>Crewmate (antigo)</div>
      <div style={{...texto, position: 'absolute', left: 360, top: 540, width: 60, fontSize: 40, color: '#aab4c8'}}>→</div>
      <Crewmate4 cor="Azul" size={150} t={frame} cosmetico={COSMETICO_PADRAO.Azul} style={{position: 'absolute', left: 430, top: 480}} />
      <div style={{...texto, position: 'absolute', left: 410, top: 690, width: 190, fontSize: 18, color: '#aab4c8'}}>Crewmate4 (novo)</div>

      {/* poses da animação do Crewmate4 (Vermelho com coroa) */}
      <div style={{...texto, position: 'absolute', left: 700, top: 430, width: 560, fontSize: 24, fontWeight: 700}}>
        Poses (Crewmate4)
      </div>
      {(['parado', 'andando', 'tarefa', 'susto'] as const).map((pose, i) => (
        <React.Fragment key={pose}>
          <Crewmate4
            cor="Vermelho"
            size={110}
            anim={pose}
            t={frame}
            cosmetico={COSMETICO_PADRAO.Vermelho}
            style={{position: 'absolute', left: 710 + i * 135, top: 500}}
          />
          <div style={{...texto, position: 'absolute', left: 690 + i * 135, top: 660, width: 130, fontSize: 18, color: '#aab4c8'}}>{pose}</div>
        </React.Fragment>
      ))}

      {/* morto e fantasma */}
      <div style={{...texto, position: 'absolute', left: 1300, top: 430, width: 540, fontSize: 24, fontWeight: 700}}>
        Morto e fantasma
      </div>
      <Crewmate4 cor="Verde" size={150} morto t={frame} style={{position: 'absolute', left: 1330, top: 480}} />
      <div style={{...texto, position: 'absolute', left: 1310, top: 690, width: 190, fontSize: 18, color: '#aab4c8'}}>morto (Verde)</div>
      <Crewmate4 cor="Rosa" size={150} fantasma t={frame} cosmetico={COSMETICO_PADRAO.Rosa} style={{position: 'absolute', left: 1560, top: 480}} />
      <div style={{...texto, position: 'absolute', left: 1540, top: 690, width: 190, fontSize: 18, color: '#aab4c8'}}>fantasma (Rosa)</div>

      </div>

      {/* rodapé */}
      <div style={{...texto, position: 'absolute', bottom: 40, width: '100%', fontSize: 20, color: '#8190ab'}}>
        Prévia de design · AU4 · cosméticos originais
      </div>
    </AbsoluteFill>
  );
};
