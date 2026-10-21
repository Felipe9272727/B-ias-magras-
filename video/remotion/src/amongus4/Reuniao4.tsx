// Among Us 4, telas da reunião que são novas: a APOSTA do Apostador (o dado rola, o palpite aparece, e quem errou
// morre na hora: o alvo se acertou, o próprio Apostador se errou) e a ejeção com o tripulante novo (skin) e o
// Casal morrendo junto.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {FONT} from '../theme';
import type {Skins} from '../amongus3/Jogo';
import {PAPEL_NOME} from '../amongus3/Jogo';
import type {Partida2} from '../amongus3/sim';
import {Estrelas, Som, papelEm} from '../amongus3/Telas';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const nomeP = (x: string) => PAPEL_NOME[x] ?? ({Cientista: 'Cientista', Seguranca: 'Segurança'} as Record<string, string>)[x] ?? x;
const Boneco: React.FC<{cor: string; skins?: Skins; size: number; morto?: boolean; t?: number}> = ({cor, skins, size, morto, t}) => (
  <Crewmate4 cor={cor} size={size} morto={morto} t={t} cosmetico={skins?.[cor]?.cabeca ?? undefined} roupa={skins?.[cor]?.roupa ?? undefined} pet={morto ? undefined : skins?.[cor]?.pet ?? undefined} />
);

// a aposta: `k` (padrão 0) escolhe qual aposta da reunião, quando há mais de uma
export const AU4Aposta: React.FC<{p: Partida2; idx: number; skins?: Skins; k?: number}> = ({p, idx, skins, k = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = p.reunioes[idx] as any;
  const a = (r.apostas ?? [])[k] ?? p.eventos.filter((e) => e.tipo === 'aposta' && e.tique === r.tique)[k];
  if (!a) return <AbsoluteFill style={{background: '#000'}} />;
  // 0-40 dado rolando; 40 palpite; 90 resultado; 110 tiro / X no morto
  const dado = Math.floor(f / 3) % 6;
  const ent = spring({frame: f, fps, config: {damping: 13}});
  const palp = spring({frame: f - 40, fps, config: {damping: 12}});
  const res = spring({frame: f - 90, fps, config: {damping: 9}});
  const tiro = f >= 110;
  const morto = a.morto ?? (a.acertou ? a.alvo : a.apostador);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a1240 0%, #07040d 75%)', overflow: 'hidden'}}>
      <Som nome="sfx/drumroll.mp3" vol={0.5} />
      <Som nome={a.acertou ? 'sfx/correct-ding.mp3' : 'sfx/wrong-buzzer.mp3'} em={90} vol={0.6} />
      <Som nome="tiro" em={110} vol={0.8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 84, color: '#ffd84d', WebkitTextStroke: '3px #000', transform: `scale(${ent})`}}>🎲 APOSTA!</div>
      {/* o dado */}
      <div style={{position: 'absolute', left: 900, top: 190, width: 120, height: 120, borderRadius: 22, background: '#fff', border: '6px solid #000', transform: `rotate(${f < 40 ? f * 23 : 0}deg) scale(${f < 40 ? 1 : interpolate(f, [40, 50], [1, 0], cl)})`, display: 'grid', placeItems: 'center', fontSize: 70}}>{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dado]}</div>
      {/* apostador x alvo */}
      {[{c: a.apostador, x: 420, rot: 'Apostador'}, {c: a.alvo, x: 1300, rot: 'alvo'}].map((q) => {
        const caiu = tiro && morto === q.c;
        return (
          <div key={q.c} style={{position: 'absolute', left: q.x, top: 330, width: 200, textAlign: 'center', transform: `scale(${ent})`}}>
            <div style={{transform: caiu ? `translateY(${interpolate(f, [110, 120], [0, 40], cl)}px)` : undefined}}>
              <Boneco cor={q.c} skins={skins} size={200} morto={caiu && f > 116} t={f} />
            </div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', WebkitTextStroke: '1.5px #000'}}>{q.c}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: '#c9b8ff'}}>{q.rot}</div>
            {caiu && <div style={{position: 'absolute', left: -20, top: 20, fontSize: 200, color: '#ff2b2b', fontWeight: 900, fontFamily: FONT.display, opacity: interpolate(f, [116, 122], [0, 1], cl), WebkitTextStroke: '4px #000'}}>✕</div>}
          </div>
        );
      })}
      {/* o palpite */}
      <div style={{position: 'absolute', left: 560, right: 560, top: 420, textAlign: 'center', opacity: palp, transform: `scale(${palp})`}}>
        <div style={{display: 'inline-block', padding: '16px 28px', borderRadius: 22, background: '#fff', border: '5px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#000'}}>
          “{a.alvo} é {nomeP(a.funcao)}!”
        </div>
      </div>
      {/* resultado */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', transform: `scale(${res})`, opacity: res}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 96, color: a.acertou ? '#5dff8a' : '#ff3b3b', WebkitTextStroke: '3px #000'}}>{a.acertou ? 'ACERTOU!' : 'ERROU!'}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 6, opacity: interpolate(f, [120, 130], [0, 1], cl)}}>{morto} morreu na hora.</div>
      </div>
      {tiro && <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [110, 113, 122], [0, 0.8, 0], cl)}} />}
    </AbsoluteFill>
  );
};

// ejeção com o tripulante novo (skin) e a linha do Casal
export const AU4Ejecao: React.FC<{p: Partida2; idx: number; skins?: Skins}> = ({p, idx, skins}) => {
  const f = useCurrentFrame();
  const r = p.reunioes[idx] as any;
  const est = p.tiques[r.tique]?.estado?.jogadores ?? [];
  const restam = est.filter((j) => j.vivo && j.time === 'impostor').length;
  const pe = r.expulso ? papelEm(p, r.expulso, r.tique) : null;
  const l1 = r.anulada ? 'Ninguém foi ejetado. (O Juiz anulou)' : r.expulso ? (pe?.nome === 'Palhaço' ? `${r.expulso} era o Palhaço. E era isso que ele queria.` : `${r.expulso} ${r.eraImpostor ? 'era' : 'não era'} um Impostor. (${pe?.nome})`) : r.empate ? 'Ninguém foi ejetado. (Empate)' : 'Ninguém foi ejetado. (Pulado)';
  const l2 = `${restam} Impostor${restam === 1 ? '' : 'es'} restante${restam === 1 ? '' : 's'}.`;
  const l3 = r.casalMorreu ? `💔 E ${r.casalMorreu}, o par do Casal, morreu junto.` : '';
  const tl = l1.length + l2.length;
  const n = Math.floor(interpolate(f, [40, 40 + tl * 2], [0, tl], cl));
  const x = interpolate(f, [0, 200], [-260, 2180], {easing: Easing.linear});
  const fim3 = 40 + tl * 2 + 12;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Estrelas vel={3} />
      <Som nome="ejecao" vol={0.7} />
      {Array.from({length: Math.ceil((tl * 2) / 58)}, (_, i) => <Som key={'d' + i} nome="digitando" em={40 + i * 58} vol={0.35} />)}
      {l3 && <Som nome="sfx_au4/coracao.mp3" em={fim3} vol={0.7} />}
      {r.expulso && (
        <div style={{position: 'absolute', left: x, top: 380, transform: `rotate(${f * 5}deg)`}}>
          <Boneco cor={r.expulso} skins={skins} size={200} t={f} />
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: FONT.display, fontWeight: 600, fontSize: 70, color: '#fff', lineHeight: 1.4}}>
        <div>{l1.slice(0, n)}</div>
        <div style={{fontSize: 52, opacity: 0.9}}>{n > l1.length ? l2.slice(0, n - l1.length) : ''}</div>
        {l3 && <div style={{fontSize: 46, color: '#ff7aa8', opacity: interpolate(f, [fim3, fim3 + 10], [0, 1], cl), transform: `scale(${interpolate(f, [fim3, fim3 + 10], [1.4, 1], cl)})`}}>{l3}</div>}
      </div>
    </AbsoluteFill>
  );
};
