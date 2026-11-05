import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Jogo, type Log, type Cam} from './Jogo';
export const TesteJogo: React.FC<{partida: number; t0: number; vel: number; cam: Cam}> = ({partida, t0, vel, cam}) => {
  const f = useCurrentFrame();
  const [log, setLog] = useState<Log | null>(null);
  const [h] = useState(() => delayRender('log'));
  useEffect(() => { fetch(staticFile(`zumbi/partida${partida}.json`)).then((r) => r.json()).then((d) => { setLog(d); continueRender(h); }); }, [partida, h]);
  if (!log) return null;
  return <AbsoluteFill><Jogo log={log} T={t0 + (f / 30) * vel} cam={cam} f={f} /></AbsoluteFill>;
};
