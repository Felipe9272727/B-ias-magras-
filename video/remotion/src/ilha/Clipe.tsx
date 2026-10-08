import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

// Vídeo de public/<src>, a partir de `inicio` segundos. Sem o arquivo, fundo escuro com o nome do src.
export const ILClipe: React.FC<{src: string; inicio?: number}> = ({src, inicio = 0}) => {
  const {fps} = useVideoConfig();
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'falta'>('carregando');
  const [handle] = useState(() => delayRender(`clipe ${src}`));
  useEffect(() => {
    let vivo = true;
    fetch(staticFile(src), {method: 'HEAD'})
      .then((r) => vivo && setEstado(r.ok ? 'ok' : 'falta'))
      .catch(() => vivo && setEstado('falta'))
      .finally(() => continueRender(handle));
    return () => {
      vivo = false;
    };
  }, [src, handle]);

  if (estado === 'ok')
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <OffthreadVideo src={staticFile(src)} trimBefore={Math.max(0, Math.round(inicio * fps))} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2b33 0%, #05080b 80%)', alignItems: 'center', justifyContent: 'center', padding: 80}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: '#83cdec', letterSpacing: 2, marginBottom: 20}}>
        {estado === 'carregando' ? 'CARREGANDO CLIPE' : 'CLIPE AINDA NÃO GERADO'}
      </div>
      <div style={{fontFamily: FONT.mono, fontSize: 40, color: '#f0f3df', textAlign: 'center', wordBreak: 'break-all'}}>{src}</div>
    </AbsoluteFill>
  );
};
