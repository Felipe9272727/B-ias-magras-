import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Jogo, relogio, type Log, type Cam} from './Jogo';
export const TesteJogo: React.FC<{partida: number; t0: number; vel: number; cam: Cam; tk?: [number, number][]}> = ({partida, t0, vel, cam, tk}) => {
  const f = useCurrentFrame();
  const [log, setLog] = useState<Log | null>(null);
  const [h] = useState(() => delayRender('log'));
  useEffect(() => { fetch(staticFile(`zumbi/partida${partida}.json`)).then((r) => r.json()).then((d) => { setLog(d); continueRender(h); }); }, [partida, h]);
  const R = useMemo(() => relogio(t0, vel / 30, tk ?? [], log?.tiques.length ?? 60), [t0, vel, tk, log]);
  if (!log) return null;
  return <AbsoluteFill><Jogo log={log} R={R} cam={cam} f={f} /></AbsoluteFill>;
};
