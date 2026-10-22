// Prévia do HUD do Interrogatório: tudo junto numa sala escura, 240 quadros (8 s a 30 fps).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {fontsReady} from '../fonts';
import {Carimbo, Contador, Fala, MonitorEstresse, PastaCaso, PensamentoSecreto, Placa} from './Hud';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const PreviaHud: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('carregando fontes do HUD'));
  // as fontes precisam estar prontas antes do quadro ser desenhado (ver fonts.ts)
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  // estresse sobe de 20 a 95 e o bpm de 70 a 150 ao longo da prévia
  const estresse = interpolate(f, [0, 239], [20, 95], clamp);
  const bpm = interpolate(f, [0, 239], [70, 150], clamp);
  // contador: uma pergunta a cada 12 quadros, até 20
  const n = Math.min(20, Math.floor(f / 12) + 1);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2f3a 0%, #151a22 55%, #07090c 100%)', overflow: 'hidden', fontFamily: 'Poppins, sans-serif'}}>
      {/* monitor de sinais vitais no canto superior esquerdo */}
      <div style={{position: 'absolute', left: 36, top: 36}}>
        <MonitorEstresse estresse={estresse} bpm={bpm} t={f} largura={420} altura={256} />
      </div>

      <Contador n={n} total={20} />

      <PastaCaso
        titulo="O bolo sumiu"
        local="Cozinha"
        hora="21:30 – 22:30"
        abre={30}
        t={f}
        pistas={[
          {texto: 'Celular desligado das 21:30 às 21:50', at: 70},
          {texto: 'Câmera do corredor: movimento às 22:10', at: 105},
          {texto: 'Migalhas de bolo na mesa', at: 140},
        ]}
      />

      <Placa nome="DeepSeek" papel="DETETIVE" cor="#2e5bff" at={0} lado="esquerda" />
      <Placa nome="Gemini" papel="SUSPEITO" cor="#ff8c3b" at={20} lado="direita" />

      <Fala nome="DeepSeek" cor="#2e5bff" texto="Onde você estava entre 21:30 e 21:50?" at={170} ate={200} lado="esquerda" />
      <PensamentoSecreto nome="Gemini" cor="#ff8c3b" texto="Se eu disser que estava no banheiro, ninguém confere o celular..." at={205} ate={236} lado="direita" />

      <Carimbo texto="MENTIRA?" at={150} x={1480} y={300} rot={-10} />
    </AbsoluteFill>
  );
};
