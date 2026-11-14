// "Coloquei 10 IAs pra jogar Gartic" (Desenha e Adivinha): o ateliê. Folha branca = o que as IAs veem; post-it amarelo = só o público.
// Tudo o que aparece como fato vem de public/desenha/partida.json; as cenas vêm de public/timeline_desenha.json.
// SPEC (no fim) diz, por id de cena, que tela entra e quando: os quadros são relativos ao começo da cena.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {Selo} from '../au7/Hud7';
import {BANG, Boneco, C, CARIMBO, centroDe, cl, claro, COR, Desenho, Dica, ease, Etiqueta, Fita, FOLHA, Folha, hash, Icone, MADEIRA, Mesa, MONO, norm, PAL, POP, POST, quique, rnd, sombra, tempo, TINTA, tracosDe} from './base';
import {Corrida, Elenco, erros, fundoDe, Galeria, Guardados, Mosaico, NOME, ordem, Pergunta, Placar, placarApos, Premios, Quadrinho, Relogios, Rodada2} from './telas';

type CitaO = {tipo: 'cita'; at: number; dur: number; cor: string; tipoCita: string; texto: string; dt: [number, number]; palpite?: string | null};
type Over = CitaO | {tipo: 'selo'; at: number; dur: number; texto: string} | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo} | {tipo: 'capitulo'; at: number; dur: number; titulo: string; sub?: string};
type Cena = {id: string; dur: number; visual: any; over: Over[]; audio: {src: string; at: number; vol?: number}[]};
type TL = {cenas: Cena[]};
type P = any;
type Jan = {tq: number; de: number; ate?: number; so?: string[]; fora?: string[]; pal?: string[]; ok?: boolean; nok?: boolean; livre?: boolean};
type Fase = {
  de: number; tela: string; n?: number; tq?: number | [number, number][]; pronto?: number; des?: [number, number, number][]; jan?: Jan[];
  carta?: number; plano?: string; so?: boolean; conta?: string[]; contaTudo?: string; contaDif?: boolean; regra?: boolean; aviso?: string; grifo?: string;
  confere?: {p: string; de: number; ate: number; contra?: boolean}[]; viu?: {forma: string; quem: string; rot: string; de: number; ate: number}[];
  parede?: {quem: string; de: number; ate: number; pal: string[]; fim: string}; foco?: {pt?: [number, number]; cor?: string; de: number; ate: number; z?: number; rot?: string};
  voa?: {txt: string; cor: string; at: number}[]; gag?: {tipo: 'lapis' | 'giz'; n: number; at: number}; duelo?: {cores: string[]; de: number; ate: number; lanterna?: boolean};
  rola?: {cor: string; de: number}; imagina?: {cor: string; txt: string; de: number; ate: number}[]; fio?: {de: number; ate: number}; postit?: number; confete?: [number, number];
  [k: string]: any;
};

export const calcDesenha: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_desenha.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const FX = 70, FY = 196, FW = 1000, FH = 750, CX = 1140, CW = 740, CY = 190, PASSO = 101, MAXF = 8;
const art = (p: P, cor: string) => (NOME(p, cor) === 'Aquarela' ? 'A' : 'O');
const acertouAntes = (d: any, cor: string, tq: number) => d.acertos.some((a: any) => a.cor === cor && a.tique < tq);

// ---------- contornos pontilhados: desenho NOSSO do que cada IA disse que viu (sempre com etiqueta) ----------
const esp = (cx: number, cy: number, r0: number, r1: number, v: number) => Array.from({length: 70}).map((_, i) => { const t = i / 69, a = t * v * Math.PI * 2, r = r0 + (r1 - r0) * t; return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(0)} ${(cy + r * Math.sin(a)).toFixed(0)}`; }).join(' ');
const bola = (x: number, y: number, r: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;
const VIU: Record<string, {d: string[]; cores?: string[]; rot?: [string, number, number, number, number][]}> = {
  caminhao: {d: ['M190 478 H620 V540 H190Z', 'M620 400 H700 L750 450 V540 H620Z', 'M640 415 H695 L725 448 H640Z', bola(300, 548, 38), bola(690, 548, 38)]},
  jabuti: {d: ['M215 472 Q400 215 605 472Z', 'M605 440 Q680 400 692 450 Q680 492 605 472', 'M270 472 v50 h40 v-50 M500 472 v50 h40 v-50', 'M330 335 L400 292 L480 335 L470 412 L340 412Z']},
  amendoim: {d: ['M400 125 C505 125 495 255 468 272 C525 300 525 445 400 445 C275 445 275 300 332 272 C305 255 295 125 400 125Z', 'M350 180 l20 20 M430 170 l20 20 M360 350 l20 20 M430 380 l20 20']},
  noel: {d: ['M318 418 L400 575 L482 418', bola(400, 578, 18), 'M300 418 H500', 'M345 250 q28 34 55 0 q28 34 55 0']},
  cogumelo: {d: ['M290 222 Q400 60 510 222Z', 'M358 222 V432 Q400 452 442 432 V222', bola(355, 170, 14), bola(440, 150, 14)]},
  mosquito: {d: ['M300 190 Q160 60 110 170 Q190 250 300 190Z', 'M500 190 Q640 60 690 170 Q610 250 500 190Z', 'M400 440 V565']},
  vagalume: {d: ['M330 430 Q400 600 470 430', 'M350 480 h100 M362 520 h76', 'M300 540 l-44 30 M500 540 l44 30 M400 566 v34']},
  solzinho: {d: [Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2 + 0.26; return `M${(400 + 158 * Math.cos(a)).toFixed(0)} ${(300 + 158 * Math.sin(a)).toFixed(0)} L${(400 + 215 * Math.cos(a)).toFixed(0)} ${(300 + 215 * Math.sin(a)).toFixed(0)}`; }).join(' ')]},
  pirulito: {d: ['M400 440 V598', esp(400, 300, 10, 122, 3)]},
  joaninha: {d: ['M400 162 V438', bola(330, 372, 22), bola(470, 372, 22), bola(350, 215, 16), bola(450, 215, 16)]},
  disco: {d: ['M210 70 Q400 10 590 70 Q400 130 210 70Z', 'M320 50 Q400 -30 480 50', 'M250 92 L190 300 M550 92 L610 300']},
  mascara: {d: ['M245 255 Q400 185 555 255 Q580 335 470 345 Q400 300 330 345 Q220 335 245 255Z', 'M330 168 Q250 110 262 30 Q320 70 330 168Z', 'M400 162 Q360 80 410 22 Q440 90 400 162Z', 'M470 168 Q550 110 538 30 Q480 70 470 168Z', 'M262 300 Q200 300 160 330 Q120 370 120 420 M538 300 Q600 300 640 330 Q680 370 680 420'], cores: ['preto', 'roxo', 'rosa', 'azul', 'vermelho']},
  cobra: {d: [esp(400, 300, 20, 126, 3.2), 'M512 250 l40 -14 l-6 30 M552 236 l26 -8 M552 236 l22 14'], rot: [['CABEÇA', 600, 330, 440, 300], ['MARCAS DO CORPO', 440, 210, 482, 100], ['GUIZO', 60, 520, 125, 415]]},
  cama: {d: ['M120 420 H680 V500 H120Z M120 500 v44 M680 500 v44 M120 420 V290 M680 420 V340', 'M130 420 Q140 340 200 345 Q260 350 262 420Z', 'M262 420 Q300 330 470 325 Q640 320 680 420Z', 'M590 100 a62 62 0 1 0 52 94 a50 50 0 1 1 -52 -94Z'], cores: ['azul', 'preto', 'verde', 'amarelo']},
};
const Pontilhado: React.FC<{forma: string; k: number; f: number; cor?: boolean}> = ({forma, k, f, cor}) => {
  const v = VIU[forma];
  if (!v || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 3)}>
      {v.d.map((d, i) => <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">{cor ? null : <path d={d} stroke="#111" strokeWidth={13} strokeDasharray="20 16" strokeDashoffset={-f * 1.2} />}<path d={d} stroke={cor ? PAL[v.cores?.[i] ?? 'preto'] : '#fff'} strokeWidth={cor ? 9 : 7} strokeDasharray="20 16" strokeDashoffset={-f * 1.2} /></g>)}
      {(v.rot ?? []).map(([t, tx, ty, ax, ay], i) => k > 0.25 + i * 0.2 ? <g key={t}><path d={`M${tx + 40} ${ty - 12} L${ax} ${ay}`} stroke="#111" strokeWidth={6} /><circle cx={ax} cy={ay} r={9} fill={CARIMBO} stroke="#111" strokeWidth={4} /><text x={tx} y={ty} fontFamily="Poppins" fontWeight={800} fontSize={34} fill="#fff" stroke="#111" strokeWidth={9} paintOrder="stroke fill">{t}</text></g> : null)}
    </g>
  );
};

// ---------- a ficha de chute que cai no chat ----------
const Grifo: React.FC<{t: string; g?: string}> = ({t, g}) => <>{g ? t.split(/(\s+)/).map((w, i) => (norm(w).includes(norm(g)) ? <span key={i} style={{background: POST, borderBottom: '4px solid #111'}}>{w}</span> : <span key={i}>{w}</span>)) : t}</>;
const Ficha: React.FC<{x: any; p: P; f: number; age: number; kind: string; pts?: number; pulsa?: boolean; coroa?: boolean; lant?: boolean; grifo?: string}> = ({x, p, f, age, kind, pts, pulsa, coroa, lant, grifo}) => {
  const ok = kind === 'ok', velho = age > 18 && kind === 'erro';
  return (
    <div style={{width: CW - 40, height: PASSO - 9, display: 'flex', alignItems: 'center', gap: 6, background: ok ? '#fff' : velho ? '#E6DFCF' : FOLHA, border: '5px solid #111', borderLeft: `18px solid ${COR[x.cor]}`, borderRadius: 14, boxShadow: pulsa ? `0 0 0 8px ${POST}, 0 0 0 12px #111` : ok ? '0 0 0 5px #fff, 7px 7px 0 4px #0007' : '6px 6px 0 #0007', padding: '0 10px 0 2px', position: 'relative', boxSizing: 'border-box', transform: pulsa ? `scale(${1.03 + 0.012 * Math.sin(f * 0.4)})` : undefined}}>
      <Boneco cor={x.cor} s={58} f={f} bracos={false} coroa={coroa} lanterna={lant} humor={ok ? 'feliz' : kind === 'vazio' ? 'susto' : 'normal'} />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: POP, fontWeight: 800, fontSize: 23, lineHeight: 1.05, color: '#5a5343'}}>{NOME(p, x.cor)}<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 21, color: x.ms >= 60000 ? '#fff' : '#5a5343', background: x.ms >= 60000 ? CARIMBO : undefined, borderRadius: 5, padding: '0 6px'}}>{tempo(x.ms)}</span></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 36, lineHeight: 1.08, color: velho ? '#6b6456' : TINTA, whiteSpace: 'nowrap'}}>
          {ok ? <><span style={{fontFamily: MONO}}>*****</span><span style={{fontSize: 27, background: POST, border: '3px solid #111', borderRadius: 6, padding: '0 8px'}}>{String(x.palpite).toUpperCase()}</span></> : null}
          {kind === 'erro' ? String(x.palpite).toUpperCase() : null}
          {kind === 'vazio' ? <><span style={{fontFamily: MONO, fontSize: 25, border: '4px dashed #111', borderRadius: 6, padding: '0 10px', background: '#fff'}}>PALPITE: <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span></span><span style={{fontSize: 24, color: '#fff', background: CARIMBO, border: '3px solid #111', borderRadius: 6, padding: '0 8px'}}>VAZIO</span></> : null}
          {kind === 'chat' ? <span style={{fontSize: 24, color: '#5a5343'}}>JÁ ACERTOU · SÓ CONVERSA</span> : null}
        </div>
        <div style={{fontFamily: POP, fontWeight: 600, fontSize: 21, lineHeight: 1.15, color: '#3d382c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}><Grifo t={x.chat ?? ''} g={grifo} /></div>
      </div>
      {ok ? <div style={{position: 'absolute', right: -14, top: -16, fontFamily: BANG, fontSize: 50, lineHeight: 1.1, color: TINTA, background: POST, border: '5px solid #111', borderRadius: 30, padding: '0 14px', transform: `rotate(6deg) scale(${interpolate(age, [6, 12], [2.4, 1], cl)})`, opacity: age > 6 ? 1 : 0}}>+{pts}</div> : null}
      {velho ? <div style={{position: 'absolute', right: 8, top: 6, opacity: 0.75}}><Icone n="x" s={36} cor="#6b6456" /></div> : null}
    </div>
  );
};

// ---------- conferência letra a letra embaixo da dica (CÁLCULO NOSSO: só compara as letras do chute com a dica real) ----------
const Confere: React.FC<{pal: string; base: string[]; f: number; dur: number; x: number; s: number; contra?: boolean}> = ({pal, base, f, dur, x, s, contra}) => {
  const ls = pal.split(''), gap = s * 0.14, sai = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const falta = Math.max(0, base.length - ls.length), sobra = Math.max(0, ls.length - base.length);
  return (
    <div style={{position: 'absolute', left: x, top: contra ? 96 : 96 + s * 1.25 + 8, opacity: sai, zIndex: 30}}>
      {contra ? <div style={{display: 'flex', gap, marginBottom: 6}}>{base.map((ch, i) => <div key={i} style={{width: s, height: s * 1.25, background: POST, border: '4px solid #111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: s * 0.9, color: TINTA, boxSizing: 'border-box'}}>{ch}</div>)}</div> : null}
      <div style={{display: 'flex', gap}}>
        {ls.map((ch, i) => {
          const at = 6 + i * 5, b = base[i], fora = i >= base.length, bate = !fora && b !== '_' && norm(b) === norm(ch), ruim = !fora && b !== '_' && !bate && !contra;
          const cai = fora ? Math.max(0, f - at - 14) : 0;
          return <div key={i} style={{width: s, height: s * 1.25, flexShrink: 0, background: ruim ? CARIMBO : bate ? POST : fora ? '#d6d0c2' : '#fff', border: '4px solid #111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: s * 0.9, color: ruim ? '#fff' : TINTA, boxSizing: 'border-box', boxShadow: bate ? `0 0 0 5px #fff, 0 0 0 9px #111` : '4px 4px 0 #0006', opacity: f >= at ? 1 : 0, transform: `translate(${ruim ? Math.sin(f * 1.4) * 4 : 0}px, ${(1 - quique(f, at, 10)) * 70 + Math.min(60, cai * cai * 0.12)}px) rotate(${ruim ? 5 : fora ? Math.min(24, cai * 1.6) : 0}deg)`, zIndex: bate || ruim ? 2 : 1, position: 'relative'}}>{ch}{ruim ? <div style={{position: 'absolute', left: -4, right: -4, top: '46%', height: 7, background: '#111', transform: 'rotate(-18deg)'}} /> : null}</div>;
        })}
        {Array.from({length: falta}).map((_, i) => <div key={`v${i}`} style={{width: s, height: s * 1.25, flexShrink: 0, border: `5px dashed ${CARIMBO}`, borderRadius: 8, boxSizing: 'border-box', background: Math.floor(f / 7) % 2 ? '#C2372B55' : '#0000', opacity: f > 6 + ls.length * 5 ? 1 : 0}} />)}
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 10, opacity: ease(f, 10 + ls.length * 5, 18 + ls.length * 5)}}>
        <Etiqueta fs={26} bg="#fff">CÁLCULO NOSSO</Etiqueta>
        {falta || sobra ? <Etiqueta fs={26} bg={CARIMBO} cor="#fff">{ls.length} LETRAS · {base.length} CASAS</Etiqueta> : !contra && ls.some((ch, i) => base[i] !== '_' && norm(base[i]) !== norm(ch)) ? <Etiqueta fs={26} bg={CARIMBO} cor="#fff">NÃO BATE COM A DICA</Etiqueta> : <Etiqueta fs={26}>{contra ? `${ls.filter((ch, i) => norm(base[i]) === norm(ch)).length} LETRAS NO MESMO LUGAR` : 'ENCAIXA NA DICA'}</Etiqueta>}
      </div>
    </div>
  );
};

// ---------- TELA DO JOGO: folha à esquerda, chat à direita, dica em cima, chip e cartão da palavra ----------
const Jogo: React.FC<{fa: Fase; p: P; f: number; c: Cena}> = ({fa, p, f, c}) => {
  const n = fa.n!, d = p.desenhos[n - 1];
  const citas = c.over.filter((o) => o.tipo === 'cita') as CitaO[];
  const tqs: [number, number][] = Array.isArray(fa.tq) ? fa.tq : [[-1, fa.tq ?? 1]];
  const iT = Math.max(0, tqs.filter(([a]) => f >= a).length - 1), tq = tqs[iT][1], fq = f - tqs[iT][0];
  const dicaDe = (t: number) => d.tiques[Math.min(d.tiques.length, t) - 1].dica as string;
  const todos = useMemo(() => tracosDe(d, 9), [d]);
  const cum = (t: number) => tracosDe(d, t).length;
  let vis = cum(fa.pronto ?? 0), fant: number | undefined, fantK = 0, desenhando = false;
  for (const [a, b, t] of fa.des ?? []) {
    vis += (cum(t) - cum(t - 1)) * interpolate(f, [a, b], [0, 1], cl);
    if (f >= a - 10 && f < b + 30 && cum(t - 1) > 0) { fant = cum(t - 1); fantK = ease(f, a - 10, a) * (1 - ease(f, b, b + 30)); }
    if (f >= a && f < b) desenhando = true;
  }
  const antes = n > 1 ? placarApos(p, n - 1) : null, ord = antes ? ordem(antes) : [];
  const lider = antes && antes[ord[0]] > antes[ord[1]] ? ord[0] : null, minimo = antes ? antes[ord[ord.length - 1]] : -1;
  const fichas = useMemo(() => {
    const out: {x: any; tq: number; at: number; kind: string; pts?: number}[] = [];
    for (const j of fa.jan ?? []) {
      const ps = [...d.tiques[j.tq - 1].palpites].filter((x: any) => (!j.so || j.so.includes(x.cor)) && !(j.fora ?? []).includes(x.cor) && (!j.pal || j.pal.includes(norm(x.palpite))) && (!j.ok || x.acertou) && (!j.nok || !x.acertou)).sort((a: any, b: any) => a.ms - b.ms);
      const ate = j.ate ?? j.de + ps.length * 12, m0 = Math.log(Math.max(500, ps[0]?.ms ?? 500)), m1 = Math.log(Math.max(501, ps[ps.length - 1]?.ms ?? 501));
      ps.forEach((x: any, i: number) => {
        const cit = j.livre ? null : citas.find((o) => o.tipoCita === 'chute' && o.cor === x.cor && o.dt[0] === n && o.dt[1] === j.tq);
        const u = ps.length > 1 ? 0.6 * (i / (ps.length - 1)) + 0.4 * ((Math.log(Math.max(500, x.ms)) - m0) / Math.max(0.01, m1 - m0)) : 0;
        const kind = x.acertou ? 'ok' : !x.palpite ? (acertouAntes(d, x.cor, j.tq) ? 'chat' : 'vazio') : 'erro';
        out.push({x, tq: j.tq, at: j.de < 0 ? -100 + i : cit ? cit.at + 3 : Math.round(j.de + (ate - j.de) * u), kind, pts: d.acertos.find((a: any) => a.cor === x.cor)?.pontos});
      });
    }
    return out.sort((a, b) => a.at - b.at);
  }, [fa, d, c]);
  const visF = fichas.filter((x) => x.at <= f);
  const desloc0 = visF.reduce((a, x, i) => a + (i >= MAXF ? ease(f, x.at, x.at + 8) : 0), 0);
  // a ficha de quem está sendo citado sobe para não ficar atrás do balão
  const citAt = citas.find((o) => o.dt[0] === n && f >= o.at && f < o.at + o.dur && visF.some((x) => x.x.cor === o.cor && x.tq === o.dt[1]));
  const iCit = citAt ? visF.findIndex((x) => x.x.cor === citAt.cor && x.tq === citAt.dt[1]) : -1;
  const desloc = desloc0 + (citAt ? Math.max(0, iCit - 4 - desloc0) * ease(f, citAt.at, citAt.at + 12) * (1 - ease(f, citAt.at + citAt.dur - 10, citAt.at + citAt.dur)) : 0);
  const novas = visF.filter((x) => x.at >= 0 || fa.contaJa);
  const badges: [string, number, number][] = [];
  for (const w of fa.conta ?? []) { const m = novas.filter((x) => norm(x.x.palpite) === norm(w)); if (m.length) badges.push([`${w} ×${m.length}`, m[m.length - 1].at, m.length]); }
  if (fa.contaTudo && novas.length) badges.push([`${fa.contaTudo} ×${novas.length}`, novas[novas.length - 1].at, novas.length]);
  if (fa.contaDif && novas.length) { const s = new Set(novas.map((x) => norm(x.x.palpite)).filter(Boolean)); badges.push([`PALAVRAS DIFERENTES: ${s.size}`, novas[novas.length - 1].at, s.size]); }
  const dica = dicaDe(tq), dAnt = iT > 0 ? dicaDe(tqs[iT - 1][1]) : dica, casas = dica.split(' ');
  const sD = Math.min(58, 900 / casas.length / 1.14), xD = FX + (FW - casas.length * sD * 1.14) / 2;
  const fo = fa.foco, fpt = fo ? fo.pt ?? centroDe([...todos].reverse().find((t: any) => String(t.cor).includes(fo.cor ?? '#')) ?? todos[0]) : [400, 300];
  const zk = fo ? ease(f, fo.de, fo.de + 70) * (1 - ease(f, fo.ate - 24, fo.ate)) : 0;
  const restam = 8 - Math.floor(vis + 0.001), palavra = String(d.palavra).toUpperCase();
  const viu = (fa.viu ?? []).find((v) => f >= v.de && f < v.ate);
  const cartaK = fa.carta != null ? ease(f, fa.carta, fa.carta + 12) : 1;
  const sol = todos.find((t: any) => t.cor === 'amarelo') ?? todos[0];
  return (
    <AbsoluteFill>
      {/* chip + barra de tiques */}
      <div style={{position: 'absolute', left: 36, top: 18, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontWeight: 700, fontSize: 34, lineHeight: 1.3, color: '#fff', background: '#1b1b1b', border: '5px solid #111', borderLeft: `20px solid ${COR[d.desenhista]}`, borderRadius: 12, padding: '2px 18px 2px 10px', boxShadow: '6px 6px 0 #0007', whiteSpace: 'nowrap', transform: `rotate(${-1 + Math.sin(f / 70) * 0.5}deg)`}}><Icone n="lapis" s={34} cor="#fff" />DESENHO {n} DE 20 · {NOME(p, d.desenhista).toUpperCase()}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, background: FOLHA, border: '5px solid #111', borderRadius: 30, padding: '3px 14px', boxShadow: '5px 5px 0 #0007'}}>
          <span style={{fontFamily: POP, fontWeight: 800, fontSize: 24, color: TINTA, marginRight: 4}}>TIQUE</span>
          {[1, 2, 3, 4].map((t) => <div key={t} style={{position: 'relative', width: 42, height: 42, borderRadius: 21, border: '4px solid #111', background: t === tq ? POST : t < tq ? '#bdb6a4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: TINTA, transform: t === tq ? `scale(${1.12 + 0.05 * Math.sin(f * 0.25)})` : undefined}}>{t}
            {fa.regra && t >= 3 ? <div style={{position: 'absolute', top: 50, left: t === 3 ? -70 : -6, fontFamily: POP, fontWeight: 800, fontSize: 21, color: TINTA, background: POST, border: '3px solid #111', borderRadius: 6, padding: '0 7px', whiteSpace: 'nowrap', transform: `scale(${quique(f, 250 + t * 22, 12)})`}}>{t === 3 ? '1 LETRA' : '2 LETRAS'}</div> : null}
          </div>)}
        </div>
        {fa.aviso ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 22, color: TINTA, background: '#fff', border: '3px solid #111', borderRadius: 8, padding: '0 10px'}}>{fa.aviso}</div> : null}
      </div>
      {/* dica */}
      <div style={{position: 'absolute', left: xD, top: 96, zIndex: 25}}><Dica dica={dica} antes={dAnt} fq={iT > 0 ? fq : 999} s={sD} /></div>
      {(fa.confere ?? []).map((cf, i) => f >= cf.de && f < cf.ate ? <Confere key={i} pal={cf.p} base={cf.contra ? palavra.split('') : casas} f={f - cf.de} dur={cf.ate - cf.de} x={xD} s={sD} contra={cf.contra} /> : null)}
      {/* a folha */}
      <div style={{position: 'absolute', left: FX, top: FY, transform: `rotate(${Math.sin(f / 110 + n) * 0.5}deg) scale(${1 + ((fo?.z ?? 1.7) - 1) * zk})`, transformOrigin: `${(fpt[0] / 800) * 100}% ${(fpt[1] / 600) * 100}%`, zIndex: zk > 0.01 ? 12 : 1}}>
        <Folha w={FW}>
          <Desenho tr={todos} vis={vis} fant={fant} fantK={fantK} lapis={desenhando ? COR[d.desenhista] : undefined}>
            {viu ? <Pontilhado forma={viu.forma} k={ease(f, viu.de, viu.de + 14) * (1 - ease(f, viu.ate - 10, viu.ate))} f={f} /> : null}
            {fo?.rot && zk > 0.4 ? <g><path d={`M${fpt[0] + 110} ${fpt[1] - 70} L${fpt[0] + 22} ${fpt[1] - 12}`} stroke={CARIMBO} strokeWidth={7} strokeLinecap="round" /><path d={`M${fpt[0] + 22} ${fpt[1] - 12} l22 -2 M${fpt[0] + 22} ${fpt[1] - 12} l6 -20`} stroke={CARIMBO} strokeWidth={7} strokeLinecap="round" /><text x={fpt[0] + 100} y={fpt[1] - 80} fontFamily="Bangers" fontSize={44} fill={CARIMBO} stroke="#fff" strokeWidth={8} paintOrder="stroke fill">{fo.rot}</text></g> : null}
            {fa.fio && f > fa.fio.de ? (() => { const [sx, sy] = centroDe(sol), k = ease(f, fa.fio.de + 10, fa.fio.de + 40); return <path d={`M150 520 Q${150 + (sx - 150) * 0.3} ${sy + 60} ${150 + (sx - 150) * k} ${520 + (sy - 520) * k}`} fill="none" stroke={CARIMBO} strokeWidth={7} strokeDasharray="16 10" strokeLinecap="round" />; })() : null}
          </Desenho>
        </Folha>
        {d.rodada === 2 && restam <= 0 && !desenhando && !viu ? <div style={{position: 'absolute', right: 14, top: 14, display: 'flex', alignItems: 'center', gap: 6, fontFamily: POP, fontWeight: 800, fontSize: 24, color: '#fff', background: '#1b1b1b', border: '4px solid #111', borderRadius: 10, padding: '2px 12px 2px 6px', transform: 'rotate(2deg)'}}><Icone n="cadeado" s={30} cor={POST} />ACABARAM OS TRAÇOS</div> : null}
        {viu ? <div style={{position: 'absolute', left: 16, top: 16, transform: `scale(${quique(f, viu.de, 12)})`, transformOrigin: '0 0'}}><Etiqueta fs={32} rot={-2}><Icone n="olho" s={34} />O QUE {art(p, viu.quem)} {NOME(p, viu.quem).toUpperCase()} VIU: {viu.rot} <span style={{fontSize: 20, opacity: 0.7}}>(desenho nosso)</span></Etiqueta></div> : null}
        {fa.fio && f > fa.fio.de && f < fa.fio.ate ? <div style={{position: 'absolute', left: 20, top: 590, transform: `rotate(-4deg) scale(${quique(f, fa.fio.de, 12)})`}}><div style={{fontFamily: BANG, fontSize: 46, color: '#fff', ...C(7), background: MADEIRA, border: '5px solid #111', borderRadius: 10, padding: '2px 18px', boxShadow: sombra}}>{d.tiques[1]?.reacao}</div><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: TINTA, background: '#fff', border: '3px solid #111', padding: '0 8px', width: 'fit-content'}}>REAÇÃO DO TIQUE 2</div></div> : null}
        {/* quem desenha fica no cavalete */}
        <div style={{position: 'absolute', left: -62, bottom: -40, transform: `rotate(${desenhando ? Math.sin(f * 0.5) * 6 : -4}deg) translateY(${desenhando ? -Math.abs(Math.sin(f * 0.3)) * 10 : 0}px)`, zIndex: 4}}><Boneco cor={d.desenhista} s={128} f={f} olhar={[1, -0.6]} humor={desenhando ? 'feliz' : 'normal'} /></div>
        {d.rodada === 2 ? <div style={{position: 'absolute', left: 80, bottom: -52, display: 'flex', alignItems: 'center', gap: 7, background: FOLHA, border: '4px solid #111', borderRadius: 10, padding: '3px 12px', boxShadow: '5px 5px 0 #0007'}}><span style={{fontFamily: POP, fontWeight: 800, fontSize: 22, color: TINTA, marginRight: 4}}>TRAÇOS</span>{Array.from({length: 8}).map((_, i) => <div key={i} style={{width: 11, height: 34, borderRadius: 4, background: i < restam ? TINTA : '#0000', border: `3px ${i < restam ? 'solid' : 'dashed'} #111`, opacity: i < restam ? 1 : 0.45, transform: `rotate(${(rnd(i) - 0.5) * 14}deg)`}} />)}<span style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: restam > 0 ? TINTA : CARIMBO, marginLeft: 4}}>{Math.max(0, restam)}</span></div> : null}
        {fa.gag && f >= fa.gag.at ? (() => { const g = fa.gag, gf = f - g.at, gd = Math.min(110, c.dur - g.at - 2); return (
          <div style={{position: 'absolute', right: 0, bottom: -58, display: 'flex', alignItems: 'center', gap: 10, background: POST, border: '5px solid #111', borderRadius: 12, padding: '4px 16px', boxShadow: sombra, transform: `rotate(-2deg) scale(${quique(gf, 0, 12) * interpolate(gf, [gd - 7, gd], [1, 0], cl)})`, transformOrigin: '100% 100%', zIndex: 20}}>
            <Boneco cor={g.tipo === 'lapis' ? 'Verde' : 'Rosa'} s={50} f={f} bracos={false} humor="triste" />
            <span style={{fontFamily: BANG, fontSize: 44, letterSpacing: 1.5, color: TINTA}}>{g.tipo === 'lapis' ? 'LÁPIS +2' : 'CONTA DO GIZ'}</span>
            {g.tipo === 'lapis' ? Array.from({length: g.n}).map((_, i) => <span key={i} style={{fontFamily: BANG, fontSize: 36, color: CARIMBO, background: FOLHA, border: `4px solid ${CARIMBO}`, borderRadius: 8, padding: '0 8px', transform: `rotate(${i % 2 ? 6 : -6}deg) scale(${i === g.n - 1 ? interpolate(gf, [4, 10], [2.6, 1], cl) : 1})`}}>+2</span>)
              : [1, 2, 3].map((i) => <span key={i} style={{width: 36, height: 36, borderRadius: 18, border: '4px solid #111', background: i <= g.n ? COR.Rosa : '#fff', transform: `scale(${i === g.n ? interpolate(gf, [4, 10], [2.4, 1], cl) : 1})`}} />)}
          </div>
        ); })() : null}
      </div>
      {/* contadores de fichas iguais */}
      <div style={{position: 'absolute', left: FX + 250, top: FY + FH - 70 - badges.length * 96, width: FW - 230, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 14}}>
        {badges.map(([t, at, k], i) => <div key={i} style={{fontFamily: BANG, fontSize: t.length > 22 ? 62 : 84, lineHeight: 1.05, letterSpacing: 2, color: '#fff', background: '#1b1b1b', border: '6px solid #fff', outline: '5px solid #111', borderRadius: 14, padding: '0 22px', boxShadow: sombra, whiteSpace: 'nowrap', transform: `rotate(${i % 2 ? 2 : -3}deg) scale(${interpolate(f, [at, at + 7], [1.5 + Math.min(0.5, k * 0.06), 1], cl)})`, transformOrigin: '100% 50%'}}>{t}</div>)}
      </div>
      {/* cartão da palavra: post-it, só o público vê */}
      <div style={{position: 'absolute', left: CX, top: 14, width: CW, height: 156, transform: `rotate(${1 + Math.sin(f / 60) * 0.7}deg) scaleX(${Math.abs(Math.cos(cartaK * Math.PI))})`, zIndex: 15}}>
        <div style={{position: 'absolute', inset: 0, background: cartaK < 0.5 ? '#8f7444' : POST, border: '6px solid #111', boxShadow: sombra, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 22px'}}>
          {cartaK < 0.5 ? <div style={{fontFamily: BANG, fontSize: 96, letterSpacing: 8, color: '#fff', ...C(9), textAlign: 'center'}}>? ? ? ? ?</div> : <>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 26, lineHeight: 1.1, color: TINTA}}><Icone n="olho" s={32} />A PALAVRA · SÓ VOCÊ VÊ</div>
            <div style={{fontFamily: BANG, fontSize: Math.min(104, 1250 / palavra.length), lineHeight: 1.02, letterSpacing: 4, color: TINTA, whiteSpace: 'nowrap', transform: `scale(${fa.carta != null ? interpolate(f, [fa.carta + 6, fa.carta + 16], [1.5, 1], cl) : 1})`, transformOrigin: '0 50%'}}>{palavra}</div>
          </>}
        </div>
        <Fita x={300} y={-22} rot={-2} w={140} />
      </div>
      {/* chat ou plano */}
      {fa.plano ? (
        <div style={{position: 'absolute', left: CX, top: CY + 10, width: CW, height: 640, background: POST, border: '6px solid #111', boxShadow: sombra, transform: `rotate(${-1.5 + Math.sin(f / 80) * 0.6}deg)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 30, color: TINTA, padding: '8px 18px 0'}}><Icone n="olho" s={34} />O PLANO D{art(p, d.desenhista)} {NOME(p, d.desenhista).toUpperCase()} · SÓ VOCÊ VÊ</div>
          <svg viewBox="0 0 800 600" width={CW - 12} height={(CW - 12) * 0.75}><Pontilhado forma={fa.plano} k={ease(f, 90, 130)} f={f} cor /></svg>
          <div style={{position: 'absolute', left: -150, top: 300, fontFamily: BANG, fontSize: 80, color: '#fff', ...C(10), transform: `rotate(-6deg) scale(${1 + 0.05 * Math.sin(f * 0.2)})`}}>×</div>
          <div style={{position: 'absolute', left: 18, bottom: 8, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: TINTA}}>(ilustração nossa do plano escrito)</div>
        </div>
      ) : fa.so ? null : (
        <div style={{position: 'absolute', left: CX - 12, top: CY - 12, width: CW, height: 840, background: '#00000030', border: '5px dashed #1118', borderRadius: 20}}>
          {visF.length === 0 ? <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55}}><Icone n="chat" s={110} cor="#111" /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 36, color: '#111'}}>CHUTES</div></div> : null}
        </div>
      )}
      {!fa.plano ? <div style={{position: 'absolute', left: CX + 6, top: CY, width: CW - 40, height: 824, overflow: 'visible'}}>
        {visF.map((x, i) => { const age = f - x.at, slot = i - desloc; if (slot < -1.2) return null; const ci = citas.find((o) => o.cor === x.x.cor && o.dt[0] === n && o.dt[1] === x.tq && f >= o.at && f < o.at + o.dur && o.tipoCita !== 'pensamento');
          return <div key={`${x.x.cor}${x.tq}`} style={{position: 'absolute', left: 0, top: slot * PASSO + (1 - quique(age, 0, 14)) * -(260 + slot * 60), opacity: Math.min(1, Math.max(0, slot + 1.2)) * Math.min(1, age / 3 + (x.at < 0 ? 1 : 0)), zIndex: ci ? 9 : 2}}><Ficha x={x.x} p={p} f={f} age={x.at < 0 ? 99 : age} kind={x.kind} pts={x.pts} pulsa={!!ci} coroa={lider === x.x.cor} lant={!!antes && antes[x.x.cor] === minimo} grifo={fa.grifo} /></div>; })}
      </div> : null}
      {/* +pontos voando */}
      {(fa.voa ?? []).map((v, i) => { const vf = f - v.at; if (vf < 0 || vf > 70) return null; return <div key={i} style={{position: 'absolute', left: 760, top: 420 - vf * 2.2, display: 'flex', alignItems: 'center', gap: 4, opacity: interpolate(vf, [55, 70], [1, 0], cl), transform: `scale(${quique(vf, 0, 12)}) rotate(-5deg)`, zIndex: 40}}><Boneco cor={v.cor} s={150} f={f} humor={v.txt.startsWith('-') ? 'triste' : 'feliz'} /><div style={{fontFamily: BANG, fontSize: 230, lineHeight: 1, color: v.txt.startsWith('-') ? CARIMBO : POST, ...C(20)}}>{v.txt}</div></div>; })}
      {/* parede de palavras testadas (texto real do pensamento) */}
      {fa.parede && f >= fa.parede.de && f < fa.parede.ate ? (() => { const w = fa.parede, wf = f - w.de, passo = (w.ate - w.de - 50) / (w.pal.length + 1), fimAt = passo * w.pal.length; return (
        <div style={{position: 'absolute', left: 640, top: 200, width: 1230, height: 540, background: POST, border: '6px solid #111', borderRadius: 60, boxShadow: '0 16px 0 #0007', padding: '14px 40px', boxSizing: 'border-box', transform: `scale(${quique(wf, 0, 14) * interpolate(wf, [w.ate - w.de - 8, w.ate - w.de], [1, 0], cl)}) rotate(${Math.sin(f / 40) * 0.6}deg)`, zIndex: 35}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 30, color: TINTA}}><Icone n="olho" s={36} />{art(p, w.quem)} {NOME(p, w.quem).toUpperCase()} TESTANDO PALAVRAS · SÓ VOCÊ VÊ</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 34px', alignItems: 'center', marginTop: 8}}>
            {w.pal.map((t, i) => wf > i * passo ? <div key={t} style={{position: 'relative', fontFamily: BANG, fontSize: 92, lineHeight: 1.1, letterSpacing: 3, color: TINTA, opacity: wf > i * passo + passo * 0.75 ? 0.5 : 1, transform: `rotate(${(rnd(i + 3) - 0.5) * 6}deg) scale(${quique(wf, i * passo, 10)})`}}>{t}?<div style={{position: 'absolute', left: -8, top: '48%', height: 12, borderRadius: 6, background: CARIMBO, width: `${ease(wf, i * passo + passo * 0.55, i * passo + passo * 0.8) * 106}%`, transform: 'rotate(-3deg)'}} /></div> : null)}
            {wf > fimAt ? <div style={{fontFamily: BANG, fontSize: 124, lineHeight: 1.1, letterSpacing: 4, color: '#fff', background: '#1b1b1b', border: '6px solid #111', borderRadius: 16, padding: '0 26px', transform: `rotate(-2deg) scale(${interpolate(wf, [fimAt, fimAt + 7], [2.2, 1], cl)})`}}>{w.fim}</div> : null}
          </div>
          <Boneco cor={w.quem} s={120} f={f} olhar={[0, -1]} style={{position: 'absolute', right: 20, bottom: 6}} />
        </div>
      ); })() : null}
      {/* a imaginação de quem copiou a ficha ***** */}
      {(fa.imagina ?? []).map((im, i) => f >= im.de && f < im.ate ? (() => { const lf = f - im.de, sai = interpolate(lf, [im.ate - im.de - 8, im.ate - im.de], [1, 0], cl), ac = d.acertos.find((a: any) => a.tique === 1); return (
        <div key={i} style={{position: 'absolute', left: 600, top: 196, width: 1280, height: 520, zIndex: 35, opacity: sai, transform: `scale(${quique(lf, 0, 14)})`}}>
          <div style={{position: 'absolute', inset: 0, background: '#fffdf4', border: `8px solid ${COR[im.cor]}`, outline: '5px solid #111', borderRadius: 80, boxShadow: '0 16px 0 #0007'}} />
          <div style={{position: 'absolute', left: 40, top: 26, display: 'flex', alignItems: 'center', gap: 12}}><Boneco cor={im.cor} s={120} f={f} olhar={[1, 0]} /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 38, lineHeight: 1.15, color: TINTA}}>{art(p, im.cor)} {NOME(p, im.cor).toUpperCase()} OLHA A FICHA D{art(p, ac.cor)} {NOME(p, ac.cor).toUpperCase()}<br />E IMAGINA O QUE ESTÁ ESCONDIDO:</div></div>
          <div style={{position: 'absolute', left: 60, top: 220, display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: 130, lineHeight: 1.2, color: TINTA, background: '#fff', border: '6px solid #111', borderLeft: `22px solid ${COR[ac.cor]}`, borderRadius: 16, padding: '0 30px', boxShadow: sombra}}>*****
              <div style={{position: 'absolute', left: 20, top: -30, fontFamily: BANG, fontSize: 130, letterSpacing: 6, color: '#555', opacity: 0.4 + 0.5 * ease(lf, 24, 60), transform: `rotate(${-7 + Math.sin(f * 0.7) * 1.5}deg) translate(${Math.sin(f * 0.9) * 3}px, ${Math.cos(f * 1.1) * 3}px)`, whiteSpace: 'nowrap', ...C(6, '#fff'), clipPath: `inset(-20% ${100 - ease(lf, 20, 60) * 105}% -20% -5%)`}}>{im.txt}</div>
            </div>
            <div style={{background: POST, border: '6px solid #111', boxShadow: sombra, padding: '6px 24px', transform: 'rotate(4deg)'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: POP, fontWeight: 800, fontSize: 26, color: TINTA}}><Icone n="olho" s={30} />NA VERDADE · SÓ VOCÊ VÊ</div><div style={{fontFamily: BANG, fontSize: 110, lineHeight: 1.05, letterSpacing: 4, color: TINTA}}>{palavra}</div></div>
          </div>
        </div>
      ); })() : null)}
      {/* duas barras do placar que se encostam */}
      {fa.duelo && f >= fa.duelo.de && f < fa.duelo.ate ? (() => { const du = fa.duelo, lf = f - du.de, A = placarApos(p, n - 1), B = placarApos(p, n), k = ease(lf, 30, 130), M = Math.max(...du.cores.map((x) => B[x])) * 1.12; const v = du.cores.map((x) => A[x] + (B[x] - A[x]) * k); return (
        <div style={{position: 'absolute', left: FX + 30, top: 430, width: FW - 60, background: '#1b1b1bf2', border: '6px solid #111', borderRadius: 22, boxShadow: sombra, padding: '18px 24px', boxSizing: 'border-box', zIndex: 36, transform: `scale(${quique(lf, 0, 14) * interpolate(lf, [du.ate - du.de - 8, du.ate - du.de], [1, 0], cl)})`}}>
          <div style={{fontFamily: BANG, fontSize: 50, letterSpacing: 2, color: POST, marginBottom: 6}}>PLACAR · ANTES E DEPOIS DO DESENHO {n}</div>
          {du.cores.map((cor, i) => <div key={cor} style={{display: 'flex', alignItems: 'center', gap: 10, height: 120}}>
            <Boneco cor={cor} s={84} f={f} bracos={false} lanterna={du.lanterna && v[i] < v[1 - i]} humor={v[i] >= v[1 - i] ? 'feliz' : 'triste'} />
            <div style={{width: 190, fontFamily: POP, fontWeight: 800, fontSize: 42, color: '#fff'}}>{NOME(p, cor)}</div>
            <div style={{height: 70, width: (v[i] / M) * 480, background: COR[cor], border: '5px solid #fff', borderRadius: 12}} />
            <div style={{fontFamily: BANG, fontSize: 100, lineHeight: 1, color: '#fff', ...C(8), transform: `scale(${k >= 1 ? 1 + 0.06 * Math.sin(f * 0.3) : 1})`}}>{Math.round(v[i])}</div>
          </div>)}
        </div>
      ); })() : null}
      {/* o chat que não acaba */}
      {fa.rola && f >= fa.rola.de ? (() => { const r = fa.rola, lf = f - r.de, txt = d.tiques.flatMap((t: any) => t.palpites).filter((x: any) => x.cor === r.cor).map((x: any) => x.chat ?? '').sort((a: string, b: string) => b.length - a.length)[0] as string; return (
        <div style={{position: 'absolute', left: CX - 60, top: CY + 60, width: CW + 30, height: 600, background: FOLHA, border: `8px solid ${COR[r.cor]}`, outline: '5px solid #111', borderRadius: 28, boxShadow: sombra, overflow: 'hidden', zIndex: 36, transform: `scale(${quique(lf, 0, 14)}) rotate(1deg)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: COR[r.cor], borderBottom: '5px solid #111', padding: '4px 16px', fontFamily: POP, fontWeight: 800, fontSize: 34, color: '#fff'}}><Boneco cor={r.cor} s={60} f={f} bracos={false} fala />{NOME(p, r.cor).toUpperCase()} NO CHAT · {txt.split(/\s+/).length} PALAVRAS</div>
          <div style={{padding: '10px 24px', fontFamily: POP, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: TINTA, transform: `translateY(${-Math.max(0, lf - 20) * 3.4}px)`}}>{txt}</div>
        </div>
      ); })() : null}
      {fa.postit != null && f >= fa.postit ? <div style={{position: 'absolute', left: 200, top: 300, zIndex: 38, transform: `rotate(-4deg) scale(${quique(f, fa.postit, 16)})`}}><Guardados f={f - fa.postit} dur={99} risca={22} /></div> : null}
      {fa.confete && f >= fa.confete[0] && f < fa.confete[1] ? <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, zIndex: 34, opacity: interpolate(f, [fa.confete[1] - 30, fa.confete[1]], [1, 0], cl)}}>{Array.from({length: 70}).map((_, i) => { const lf = f - fa.confete![0], x = rnd(i) * 1920 + Math.sin(lf / 14 + i) * 40, y = ((rnd(i + 80) * 1300 + lf * (5 + rnd(i + 7) * 7)) % 1300) - 120; return <rect key={i} x={x} y={y} width={22} height={30} fill={Object.values(PAL)[3 + (i % 9)]} stroke="#111" strokeWidth={3} transform={`rotate(${lf * (4 + (i % 5)) + i * 30} ${x + 11} ${y + 15})`} />; })}</svg> : null}
    </AbsoluteFill>
  );
};

// ---------- citações: nuvem (pensamento, post-it), ficha (chute), balão (chat), plaquinha (reação) ----------
const ROT: Record<string, string> = {pensamento: 'PENSAMENTO · SÓ VOCÊ VÊ', chute: 'CHUTE', chat: 'NO CHAT', 'reação': 'REAÇÃO PRONTA DO DESENHISTA'};
const Cita: React.FC<{o: CitaO; p: P}> = ({o, p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 150}}) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const pens = o.tipoCita === 'pensamento', reac = o.tipoCita.startsWith('rea'), chute = o.tipoCita === 'chute';
  const cor = COR[o.cor] ?? '#888', d = p.desenhos[o.dt[0] - 1];
  const palavras = o.texto.split(' '), n = interpolate(f, [4, Math.max(14, o.dur * 0.42)], [0, palavras.length], cl);
  const L = o.texto.length, fs = reac ? 100 : L > 170 ? 39 : L > 120 ? 44 : L > 70 ? 50 : 58;
  const reg = d.tiques[o.dt[1] - 1]?.palpites.find((x: any) => x.cor === o.cor);
  const ja = d.acertos.find((a: any) => a.cor === o.cor && a.tique < o.dt[1]);
  const pal = chute && o.palpite ? String(o.palpite).toUpperCase() : null, acertou = chute && reg?.acertou;
  const vaza = !pens && !reac ? norm(d.palavra) : '';
  return (
    <div style={{position: 'absolute', left: 46, right: 46, bottom: 30, display: 'flex', gap: 6, alignItems: 'flex-end', opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 90}px)`, zIndex: 50}}>
      <div style={{position: 'relative', width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-Math.abs(Math.sin(f * 0.2)) * (pens ? 3 : 8)}px) rotate(${Math.sin(f / 30) * 2}deg)`}}>
        <Boneco cor={o.cor} s={200} f={f} fala={!pens && n < palavras.length} olhar={pens ? [0.6, -1] : [1, 0]} humor={acertou ? 'feliz' : 'normal'} />
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 38, lineHeight: 1.1, color: '#fff', ...C(8)}}>{NOME(p, o.cor)}</div>
        {ja ? <div style={{position: 'absolute', top: 30, left: -20, fontFamily: BANG, fontSize: 34, lineHeight: 1.05, color: CARIMBO, background: FOLHA, border: `5px solid ${CARIMBO}`, outline: '3px solid #111', borderRadius: 10, padding: '2px 10px', textAlign: 'center', transform: `rotate(-12deg) scale(${interpolate(f, [8, 14], [2.6, 1], cl)})`, opacity: f > 8 ? 1 : 0, whiteSpace: 'nowrap'}}>JÁ ACERTOU<br />NO TIQUE {ja.tique}</div> : null}
      </div>
      {reac ? (
        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', marginBottom: 30}}>
          <div style={{position: 'relative', transform: `rotate(${-4 + Math.sin(f * 0.3) * 3}deg)`, transformOrigin: '10% 100%'}}>
            <div style={{position: 'absolute', left: 60, top: '90%', width: 26, height: 120, background: MADEIRA, border: '6px solid #111'}} />
            <div style={{position: 'relative', background: `repeating-linear-gradient(4deg, ${MADEIRA} 0 26px, #a96a30 26px 30px)`, border: '8px solid #111', borderRadius: 16, boxShadow: sombra, padding: '4px 50px 10px'}}>
              <div style={{fontFamily: POP, fontWeight: 800, fontSize: 26, color: '#fff', ...C(5)}}>{ROT['reação']} · DESENHO {o.dt[0]} · TIQUE {o.dt[1]}</div>
              <div style={{fontFamily: BANG, fontSize: fs, lineHeight: 1.05, letterSpacing: 3, color: '#fff', ...C(11), whiteSpace: 'nowrap'}}>{o.texto}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{position: 'relative', flex: 1, marginBottom: 26}}>
          {pens ? [2, 1].map((k) => <div key={k} style={{position: 'absolute', inset: 0, border: `6px solid ${cor}`, borderRadius: 70, opacity: 0.5 / k, transform: `translate(${k * (12 + 3 * Math.sin(f * 0.15))}px, ${-k * (10 + 3 * Math.sin(f * 0.15))}px)`}} />) : null}
          {pens ? [0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: -20 - k * 20, bottom: 30 - k * 26, width: 34 - k * 8, height: 34 - k * 8, borderRadius: '50%', background: POST, border: '5px solid #111', transform: `translateY(${Math.sin(f * 0.15 + k) * 4}px)`}} />) : <svg width={50} height={60} style={{position: 'absolute', left: -38, bottom: 54, zIndex: 2}}><path d="M48 4 L4 34 L48 52" fill={FOLHA} stroke={cor} strokeWidth={8} strokeLinejoin="round" /><path d="M48 0 V58" stroke={FOLHA} strokeWidth={10} /></svg>}
          <div style={{position: 'relative', background: pens ? POST : FOLHA, border: `8px solid ${pens ? '#111' : cor}`, borderRadius: pens ? 70 : 30, boxShadow: pens ? '0 14px 0 #0007' : sombra, padding: pens ? '18px 50px 24px' : '16px 36px 22px', outline: pens ? undefined : '4px solid #111'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 28, color: pens || !claro(o.cor) ? '#fff' : '#111', background: pens ? '#1b1b1b' : cor, border: '4px solid #111', borderRadius: 30, padding: '0 20px 0 12px', whiteSpace: 'nowrap'}}><Icone n={pens ? 'olho' : 'chat'} s={36} cor={pens || !claro(o.cor) ? '#fff' : '#111'} />{ROT[o.tipoCita] ?? o.tipoCita.toUpperCase()}</div>
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#5a5343', whiteSpace: 'nowrap'}}>DESENHO {o.dt[0]} · TIQUE {o.dt[1]}{reg ? ` · ${tempo(reg.ms)}` : ''}</div>
              {pal ? <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontFamily: BANG, fontSize: 50, lineHeight: 1.1, letterSpacing: 2, color: TINTA, background: acertou ? POST : '#fff', border: '5px solid #111', borderLeft: `16px solid ${cor}`, borderRadius: 12, padding: '0 16px', boxShadow: '5px 5px 0 #0007', transform: `rotate(2deg) scale(${interpolate(f, [6, 13], [2, 1], cl)})`, whiteSpace: 'nowrap', marginTop: -34}}>{acertou ? <Icone n="ok" s={40} /> : null}{pal}</div> : null}
            </div>
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.22, color: TINTA, fontStyle: pens ? 'italic' : 'normal'}}>
              “{palavras.map((w, i) => { const vz = vaza && norm(w).replace(/[^A-Z]/g, '') === vaza, cob = vz && n > i + 3; return <span key={i} style={{opacity: i < n ? 1 : 0, background: vz ? (cob ? '#111' : CARIMBO) : i < n && i >= n - 1 ? POST : undefined, color: vz ? '#fff' : undefined, borderRadius: 6, padding: vz ? '0 8px' : undefined, fontFamily: cob ? MONO : undefined}}>{cob ? '*****' : w}{i < palavras.length - 1 ? ' ' : ''}</span>; })}<span style={{opacity: n >= palavras.length ? 1 : 0}}>”</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- cartão de capítulo: folha nova no cavalete ----------
const Capitulo: React.FC<{o: Extract<Over, {tipo: 'capitulo'}>; id: string}> = ({o, id}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 5], [0, 1], cl) * interpolate(f, [o.dur - 9, o.dur], [1, 0], cl);
  const fs = Math.min(230, 2300 / Math.max(6, o.titulo.length));
  return (
    <AbsoluteFill style={{opacity: a, zIndex: 60}}>
      <Mesa f={f + hash(id) * 9} tom="#8C6A3F" />
      <div style={{position: 'absolute', left: 210, top: 150, transform: `rotate(${-3 + ease(f, 0, 16) * 2 + Math.sin(f / 30) * 0.5}deg) translateY(${(1 - quique(f, 0, 16)) * -1100}px)`}}>
        <Folha w={1500} style={{height: 760}}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: BANG, fontSize: fs, lineHeight: 1, letterSpacing: 6, color: TINTA, whiteSpace: 'nowrap', clipPath: `inset(-20% ${100 - ease(f, 8, 26) * 104}% -20% -5%)`}}>{o.titulo}</div>
            <svg width={1200} height={50}><path d={`M20 24 Q600 ${44 + Math.sin(f / 7) * 5} ${20 + 1160 * ease(f, 22, 34)} 20`} fill="none" stroke={CARIMBO} strokeWidth={12} strokeLinecap="round" /></svg>
            {o.sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: TINTA, background: POST, border: '6px solid #111', padding: '4px 30px', boxShadow: sombra, marginTop: 14, transform: `rotate(-1.5deg) scale(${interpolate(f, [26, 34], [0, 1], {...cl, easing: (t) => 1 - (1 - t) ** 3})})`}}>{o.sub}</div> : null}
          </div>
        </Folha>
      </div>
      <svg viewBox="0 0 200 300" width={230} height={345} style={{position: 'absolute', left: 300 + 1160 * ease(f, 8, 34), top: 560 + Math.sin(f * 0.9) * 10, transform: 'rotate(30deg)'}}><g stroke="#111" strokeWidth={8} strokeLinejoin="round"><path d="M70 60 L100 6 L130 60Z" fill="#e8cfa0" /><path d="M90 24 L100 6 L110 24Z" fill="#111" /><rect x={70} y={60} width={60} height={190} fill={CARIMBO} /><rect x={70} y={250} width={60} height={34} rx={8} fill="#f2a0a0" /></g></svg>
    </AbsoluteFill>
  );
};
// selo: carimbo torto que bate, fica o tempo de ler e sai dentro da própria duração
const Carimbo: React.FC<{texto: string; dur: number; comMeme?: boolean}> = ({texto, dur, comMeme}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, zIndex: 55, opacity: interpolate(f, [dur - 7, dur], [1, 0], cl), transform: `translateY(110px) rotate(${((hash(texto) % 7) - 3) * 0.8}deg) scale(${1 + 0.012 * Math.sin(f * 0.25)})`}}><Selo texto={texto} cor={CARIMBO} f={f} comMeme={comMeme} /></div>;
};

// ---------- o que entra em cada cena (quadros relativos ao começo da cena; com capítulo, o cartão ocupa os primeiros 78) ----------
const J = (n: number, tq: Fase['tq'], x: Partial<Fase> = {}): Fase => ({de: 0, tela: 'jogo', n, tq, pronto: 0, ...x});
const SPEC: Record<string, Fase[]> = {
  A1: [J(12, 3, {pronto: 2, carta: 700, jan: [{tq: 3, de: 24, ate: 165, pal: ['NATUREZA'], livre: true}, {tq: 4, de: 388, so: ['Marrom'], livre: true}], conta: ['NATUREZA'], viu: [{forma: 'jabuti', quem: 'Marrom', rot: 'JABUTI', de: 430, ate: 535}]})],
  A2: [{de: 0, tela: 'elenco'}],
  A3: [J(1, 1, {des: [[20, 150, 1]], jan: [{tq: 1, de: 160, ate: 400}], regra: true, voa: [{txt: '+18', cor: 'Azul', at: 425}]})],
  B1: [{de: 0, tela: 'mosaico'}, J(6, 1, {de: 405, pronto: 1, jan: [{tq: 1, de: 412, so: ['Rosa']}]}), J(3, [[0, 1], [600, 2]], {de: 540, pronto: 2, jan: [{tq: 1, de: 552, so: ['Laranja']}, {tq: 2, de: 606, so: ['Laranja']}]}), J(2, 1, {de: 750, pronto: 1, jan: [{tq: 1, de: 760, so: ['Verde']}]})],
  B2: [J(3, 2, {pronto: 2, jan: [{tq: 1, de: -1}, {tq: 2, de: 372, so: ['Vermelho']}], voa: [{txt: '-2', cor: 'Vermelho', at: 478}]})],
  B3: [{de: 0, tela: 'placar', b: 10, marcas: {Verde: '2º LUGAR', Laranja: 'ÚLTIMO'}}, {de: 330, tela: 'rodada2'}],
  C1: [J(11, 1, {des: [[150, 465, 1]], jan: [{tq: 1, de: 480, ate: 750, fora: ['Laranja']}]})],
  C2: [J(11, 1, {pronto: 1, jan: [{tq: 1, de: -1, fora: ['Laranja']}, {tq: 1, de: 485, so: ['Laranja']}], foco: {cor: 'azul', de: 60, ate: 285, rot: 'SÓ ELE VIU', z: 2}, voa: [{txt: '+10', cor: 'Laranja', at: 560}]})],
  C3: [J(11, [[-1, 2], [436, 3]], {pronto: 1, grifo: 'lagrima', jan: [{tq: 1, de: -1, so: ['Laranja']}, {tq: 2, de: 60, ate: 300, livre: true}, {tq: 3, de: 445, ate: 470, so: ['Laranja', 'Lima', 'Vermelho'], livre: true}], rola: {cor: 'Laranja', de: 612}})],
  D1: [J(12, 1, {des: [[300, 650, 1]], plano: 'cama'})],
  D2: [J(12, 1, {pronto: 1, jan: [{tq: 1, de: 15, ate: 230, livre: true}], conta: ['PAISAGEM', 'MONTANHA'], viu: [{forma: 'caminhao', quem: 'Marrom', rot: 'CAMINHÃO', de: 345, ate: 465}]})],
  D3: [J(12, [[-1, 1], [200, 2]], {pronto: 1, des: [[360, 680, 2]], jan: [{tq: 1, de: -1}, {tq: 2, de: 700, ate: 1000}], conta: ['CAMINHÃO', 'NATUREZA']})],
  D4: [J(12, [[-1, 2], [20, 3]], {pronto: 2, jan: [{tq: 3, de: 60, ate: 340, pal: ['NATUREZA'], livre: true}, {tq: 3, de: 896, so: ['Marrom'], livre: true}], conta: ['NATUREZA'], confere: [{p: 'NATUREZA', de: 200, ate: 880}, {p: 'BICICLETA', de: 905, ate: 1290}]})],
  D5: [J(12, [[-1, 3], [15, 4]], {pronto: 2, confere: [{p: 'NATUREZA', de: 50, ate: 340}, {p: 'VERANEIO', de: 1095, ate: 1532}], parede: {quem: 'Azul', de: 346, ate: 655, pal: ['TELEFONE', 'GELADEIRA', 'SEGREDOS', 'SERPENTE', 'DESPERTAR'], fim: 'CERCADOS'}, jan: [{tq: 4, de: 645, so: ['Azul'], livre: true}, {tq: 4, de: 900, ate: 1090, pal: ['VERANEIO']}], conta: ['VERANEIO'], fio: {de: 1150, ate: 1350}})],
  D6: [J(12, 4, {pronto: 2, jan: [{tq: 4, de: -1, pal: ['VERANEIO', 'CERCADOS']}, {tq: 4, de: 300, so: ['Rosa', 'Marrom']}], confere: [{p: 'NATUREZA', de: 175, ate: 740}], viu: [{forma: 'jabuti', quem: 'Marrom', rot: 'JABUTI', de: 460, ate: 600}], gag: {tipo: 'giz', n: 1, at: 750}})],
  D7: [J(12, 4, {pronto: 2, so: true, foco: {pt: [415, 380], de: 20, ate: 800, z: 1.45}, jan: [{tq: 4, de: 825, so: ['Roxo']}], voa: [{txt: '+10', cor: 'Roxo', at: 900}, {txt: '+2', cor: 'Verde', at: 1232}], gag: {tipo: 'lapis', n: 1, at: 1232}})],
  E1: [J(13, 1, {des: [[90, 300, 1]], jan: [{tq: 1, de: 310, ate: 440}], viu: [{forma: 'amendoim', quem: 'Ciano', rot: 'AMENDOIM', de: 630, ate: 750}, {forma: 'noel', quem: 'Verde', rot: 'PAI NATAL', de: 755, ate: 865}, {forma: 'cogumelo', quem: 'Lima', rot: 'COGUMELO', de: 870, ate: 965}]})],
  E2: [J(13, [[-1, 1], [20, 2], [820, 3], [905, 4]], {pronto: 1, des: [[30, 200, 2]], jan: [{tq: 2, de: 210, ate: 480}, {tq: 3, de: 826, so: ['Verde']}, {tq: 4, de: 915, so: ['Verde']}], voa: [{txt: '+2', cor: 'Verde', at: 1001}], gag: {tipo: 'lapis', n: 2, at: 1001}})],
  F1: [J(14, 1, {des: [[90, 385, 1]], jan: [{tq: 1, de: 396, ate: 650}], contaTudo: 'RAIVA'})],
  F2: [J(14, [[-1, 1], [20, 2], [690, 3]], {pronto: 1, des: [[30, 170, 2]], jan: [{tq: 2, de: 185, ate: 370}, {tq: 3, de: 700, ate: 760, so: ['Roxo', 'Verde']}], conta: ['GARRAFA'], gag: {tipo: 'lapis', n: 3, at: 1049}})],
  G1: [J(15, [[-1, 1], [1000, 2], [1430, 3]], {des: [[90, 330, 1]], jan: [{tq: 1, de: 340, ate: 700}, {tq: 2, de: 1024, ate: 1180}, {tq: 3, de: 1440, so: ['Verde']}], conta: ['ESTACIONAMENTO'], confere: [{p: 'ESTACIONAMENTO', contra: true, de: 1335, ate: 1508}], gag: {tipo: 'lapis', n: 4, at: 1448}})],
  G2: [{de: 0, tela: 'placar', a: 10, b: 15, mov: [40, 230], mais2: {cor: 'Verde', n: 4, at: 250}}],
  H1: [{de: 0, tela: 'corrida'}, {de: 400, tela: 'relogio'}, {de: 545, tela: 'erros'}],
  H2: [{de: 0, tela: 'galeria', ns: [9, 12]}, J(18, 1, {de: 290, des: [[300, 390, 1]], jan: [{tq: 1, de: 395, ate: 480, livre: true}]}), J(19, 1, {de: 490, des: [[500, 590, 1]], jan: [{tq: 1, de: 595, ate: 680, livre: true}]}), {de: 690, tela: 'galeria', ns: [18, 19, 12]}],
  I1: [J(17, 1, {des: [[90, 540, 1]], jan: [{tq: 1, de: 560, ate: 880}], aviso: 'FORA DE ORDEM: O 16 VEM DEPOIS'})],
  I2: [J(17, [[-1, 1], [20, 2]], {pronto: 1, jan: [{tq: 1, de: -1}, {tq: 2, de: 1036, ate: 1150}], imagina: [{cor: 'Verde', txt: 'PENSAR', de: 400, ate: 715}, {cor: 'Rosa', txt: 'DEBATE', de: 716, ate: 905}]})],
  I3: [J(17, [[-1, 2], [15, 3]], {pronto: 1, jan: [{tq: 3, de: 40, ate: 280, ok: true}, {tq: 3, de: 684, so: ['Rosa', 'Lima']}, {tq: 3, de: 862, ate: 900, fora: ['Rosa', 'Lima'], nok: true}], confere: [{p: 'FUZIL', de: 692, ate: 940}], gag: {tipo: 'giz', n: 2, at: 1032}})],
  I4: [J(17, [[-1, 3], [15, 4]], {pronto: 1, jan: [{tq: 4, de: 40, ate: 170, ok: true}, {tq: 4, de: 330, ate: 390, nok: true}], confere: [{p: 'FÔNICA', de: 200, ate: 398}]})],
  J1: [J(16, 1, {des: [[310, 675, 1]], plano: 'mascara'})],
  J2: [J(16, [[-1, 1], [520, 2]], {pronto: 1, jan: [{tq: 1, de: 30, ate: 250}, {tq: 2, de: 560, ate: 890}], contaDif: true, viu: [{forma: 'mosquito', quem: 'Marrom', rot: 'MOSQUITO', de: 258, ate: 372}, {forma: 'vagalume', quem: 'Roxo', rot: 'VAGALUME', de: 380, ate: 522}, {forma: 'solzinho', quem: 'Roxo', rot: 'SOLZINHO', de: 532, ate: 645}, {forma: 'pirulito', quem: 'Lima', rot: 'PIRULITO', de: 742, ate: 792}, {forma: 'joaninha', quem: 'Laranja', rot: 'JOANINHA', de: 798, ate: 900}]})],
  J3: [J(16, [[-1, 2], [190, 3]], {pronto: 1, jan: [{tq: 2, de: -1, fora: ['Ciano']}, {tq: 2, de: 66, so: ['Ciano']}, {tq: 3, de: 500, ate: 850}], conta: ['MARCIANO', 'MARIPOSA'], viu: [{forma: 'disco', quem: 'Ciano', rot: 'MARCIANO', de: 70, ate: 195}], confere: [{p: 'MARCIANO', de: 480, ate: 862}]})],
  J4: [J(16, [[-1, 3], [15, 4]], {pronto: 1, jan: [{tq: 4, de: 436, so: ['Marrom']}], confere: [{p: 'MARCIANO', de: 200, ate: 822}], parede: {quem: 'Azul', de: 834, ate: 1150, pal: ['PALHAÇAL', 'PARAQUEDAL', 'CABELINHAL'], fim: 'CARNAVAL'}})],
  J5: [J(16, 4, {pronto: 1, jan: [{tq: 4, de: 30, ate: 330, ok: true, livre: true}], viu: [{forma: 'mascara', quem: 'Vermelho', rot: 'MÁSCARA', de: 340, ate: 900}], confete: [30, 520]})],
  J6: [J(16, 4, {pronto: 1, jan: [{tq: 4, de: -1, ok: true}, {tq: 4, de: 324, so: ['Lima']}], viu: [{forma: 'cobra', quem: 'Lima', rot: 'CASCAVEL', de: 450, ate: 800}], confere: [{p: 'CASCAVEL', de: 640, ate: 930}], postit: 940})],
  K1: [{de: 0, tela: 'placar', b: 19, colch: [{cores: ['Ciano', 'Amarelo'], txt: '3º LUGAR'}, {cores: ['Lima', 'Laranja'], txt: 'LANTERNA'}]}, J(20, [[-1, 1], [925, 2]], {de: 470, des: [[590, 900, 1], [960, 1040, 2]]})],
  K2: [J(20, 1, {pronto: 1, jan: [{tq: 1, de: 50, ate: 330, so: ['Marrom', 'Amarelo', 'Ciano'], livre: true}, {tq: 1, de: 650, ate: 1040, fora: ['Marrom', 'Amarelo', 'Ciano']}], duelo: {cores: ['Amarelo', 'Ciano'], de: 380, ate: 632}, confere: [{p: 'DORMINDO', de: 800, ate: 1150}], gag: {tipo: 'giz', n: 3, at: 1241}})],
  K3: [J(20, [[-1, 2], [130, 3], [200, 4]], {pronto: 2, jan: [{tq: 2, de: 20, ate: 120, ok: true}, {tq: 3, de: 135, ate: 180, ok: true}, {tq: 4, de: 205, so: ['Verde']}], voa: [{txt: '+2', cor: 'Verde', at: 240}, {txt: '+18', cor: 'Laranja', at: 305}], duelo: {cores: ['Laranja', 'Lima'], de: 335, ate: 585, lanterna: true}, gag: {tipo: 'lapis', n: 5, at: 694}})],
  L1: [{de: 0, tela: 'placar', b: 20, final: true}],
  L2: [{de: 0, tela: 'premios'}],
  L3: [{de: 0, tela: 'galeria', ns: [12, 16], dica: true}, {de: 380, tela: 'pergunta'}],
};

const Tela: React.FC<{fa: Fase; p: P; f: number; c: Cena; t0: number}> = ({fa, p, f, c, t0}) => {
  const lf = f - fa.de;
  if (fa.tela === 'jogo') return <Jogo fa={fa} p={p} f={f} c={c} />;
  if (fa.tela === 'elenco') return <Elenco p={p} f={f} dur={c.dur} />;
  if (fa.tela === 'mosaico') return <Mosaico p={p} f={f} />;
  if (fa.tela === 'rodada2') return <Rodada2 p={p} f={lf} />;
  if (fa.tela === 'corrida') return <Corrida p={p} f={f} t0={t0 + 16} />;
  if (fa.tela === 'relogio') return <Relogios p={p} f={lf} n={12} tq={2} cores={['Rosa', 'Laranja']} />;
  if (fa.tela === 'erros') { const e = erros(p); return <Placar p={p} f={lf} A={e} B={e} titulo="CHUTES ERRADOS" sub="NO JOGO INTEIRO" top={3} un=" erros" />; }
  if (fa.tela === 'galeria') return <Galeria p={p} f={lf} ns={fa.ns} dica={fa.dica} />;
  if (fa.tela === 'premios') return <Premios p={p} f={f} dur={c.dur} />;
  if (fa.tela === 'pergunta') return <Pergunta f={lf} />;
  if (fa.tela === 'placar') {
    const B = placarApos(p, fa.b), A = fa.a != null ? placarApos(p, fa.a) : B, pl = (f: number) => f - Math.min(t0, 64);
    if (fa.final) {
      const desde = p.desenhos.findIndex((_: any, i: number) => p.desenhos.slice(i).every((d: any) => ordem(d.placarDepois)[0] === ordem(B)[0])) + 1;
      return <><Placar p={p} f={f} A={B} B={B} titulo="PLACAR FINAL" sub="20 DESENHOS" modelo entra={[545, 460, 392, 372, 330, 290, 250, 210, 170, 120]} risco={{cor: ordem(B)[0], v: placarApos(p, 10)[ordem(B)[0]], txt: 'RODADA 1', at: 575}} nota={{txt: `1º LUGAR DO DESENHO ${desde} AO 20`, at: 600}} />
        {f > 660 && f < 792 ? <div style={{position: 'absolute', right: 70, top: 420, zIndex: 30, opacity: interpolate(f, [784, 792], [1, 0], cl)}}><Quadrinho p={p} n={12} w={520} f={f} de={660} durD={30} placa={false} /></div> : null}</>;
    }
    return <Placar p={p} f={pl(f)} A={A} B={B} mov={fa.mov} titulo={`PLACAR · DEPOIS DO DESENHO ${fa.b}`} sub={fa.a != null ? `DO DESENHO ${fa.a} AO ${fa.b}` : undefined} marcas={fa.marcas} colch={fa.colch} mais2={fa.mais2} />;
  }
  return null;
};

const CenaView: React.FC<{c: Cena; p: P}> = ({c, p}) => {
  const f = useCurrentFrame();
  const fases = SPEC[c.id] ?? [{de: 0, tela: c.visual.desenho ? 'jogo' : 'placar', n: c.visual.desenho, tq: c.visual.tique ?? 1, pronto: c.visual.tique ?? 1, b: 20}];
  const iF = Math.max(0, fases.filter((x) => f >= x.de).length - 1), fa = fases[iF];
  let soco = 0;
  for (const o of c.over) { const d = f - o.at; if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme')) soco = Math.max(soco, 0.05 * (1 - d / 12)); }
  const wk = Math.min(1, (c.over.filter((o) => o.tipo === 'cita') as CitaO[]).reduce((a, o) => a + ease(f, o.at, o.at + 18) * (1 - ease(f, o.at + o.dur - 14, o.at + o.dur)), 0));
  const cap = c.over.find((o) => o.tipo === 'capitulo');
  const t0 = cap ? cap.at + cap.dur - 14 : 0, sd = hash(c.id);
  const z = 1.0 + 0.035 * (f / Math.max(1, c.dur)) + soco, enc = 1 - 0.17 * wk;
  const ent = fa.de > 0 ? ease(f, fa.de, fa.de + 11) : 1;
  const escuro = fa.tela !== 'jogo' && fa.tela !== 'mosaico' && fa.tela !== 'elenco' && fa.tela !== 'pergunta';
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Mesa f={f + sd} tom={fundoDe(fa.tela)} />
      <AbsoluteFill style={{transform: `translate(${Math.sin(f / 97 + sd) * 12}px, ${Math.cos(f / 131 + sd) * 7}px) scale(${z * enc})`, transformOrigin: '50% 0%'}}>
        <AbsoluteFill style={{transform: `translateX(${(1 - ent) * 1500}px) rotate(${(1 - ent) * 7}deg)`, transformOrigin: '50% 120%'}}>
          <Tela fa={fa} p={p} f={f} c={c} t0={t0} />
        </AbsoluteFill>
      </AbsoluteFill>
      {escuro ? null : <AbsoluteFill style={{background: 'linear-gradient(#0000 78%, #2a1a0a55)', pointerEvents: 'none'}} />}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'cita' ? <Cita o={o} p={p} /> : null}
          {o.tipo === 'selo' ? <Carimbo texto={o.texto} dur={o.dur} comMeme={c.over.some((m) => m.tipo === 'meme' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'capitulo' ? <Capitulo o={o} id={c.id} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const DesenhaVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [p, setP] = useState<P | null>(null);
  const [h] = useState(() => delayRender('partida desenha'));
  useEffect(() => { fetch(staticFile('desenha/partida.json')).then((r) => r.json()).then((d) => { setP(d); continueRender(h); }); }, [h]);
  if (!tl || !p) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => { const s = ini; ini += c.dur; return <Sequence key={c.id} from={s} durationInFrames={c.dur}><CenaView c={c} p={p} /></Sequence>; })}
    </AbsoluteFill>
  );
};
