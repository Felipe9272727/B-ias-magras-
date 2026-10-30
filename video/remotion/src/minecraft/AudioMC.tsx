import React, {createContext, useContext} from 'react';
import {Audio} from 'remotion';

// A regravação visual reutiliza a faixa completa do vídeo original na muxagem.
// As composições existentes continuam gerando áudio normalmente.
export const ReutilizarAudioOriginal = createContext(false);
export const AudioMC: React.FC<React.ComponentProps<typeof Audio>> = (props) => {
  const preservar = useContext(ReutilizarAudioOriginal);
  return preservar ? null : <Audio {...props} />;
};
