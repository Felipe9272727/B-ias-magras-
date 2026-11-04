import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Mapa, type Pecas, type Quadro, type Recurso} from './Mapa';

export const AgeTeste: React.FC<{partida?: string; j?: number; t0?: number; zoom?: number}> = ({partida = 'partida1', j = 1, t0 = 130000, zoom = 1}) => {
  const f = useCurrentFrame();
  const [d, setD] = useState<{qs: Quadro[]; rec: Recurso[]; pecas: Pecas | null} | null>(null);
  const [h] = useState(() => delayRender('dados'));
  useEffect(() => {
    (async () => {
      const qs = await (await fetch(staticFile(`age/${partida}/quadros.json`))).json();
      const m = await (await fetch(staticFile(`age/${partida}/mapa.json`))).json();
      let pecas = null;
      try { pecas = await (await fetch(staticFile('age/pecas/pecas.json'))).json(); } catch { /* ainda sem sprites */ }
      setD({qs, rec: m.recursos, pecas});
      continueRender(h);
    })();
  }, [h, partida]);
  if (!d) return null;
  const t = t0 + (f / 30) * 1000;
  const cc = d.qs[d.qs.length - 1].ents.find((e) => e[1] === j && e[2].includes('civil_centre'));
  return (
    <AbsoluteFill>
      <Mapa qs={d.qs} recursos={d.rec} pecas={d.pecas} t={t} cx={cc ? cc[3] : 640} cz={cc ? cc[4] : 640} zoom={zoom} f={f} />
    </AbsoluteFill>
  );
};
