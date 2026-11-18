// TRIBUNAL: cenas G1–J4 (dia 3 lado a lado, os dois julgamentos finais, placar, prêmios e a pergunta).
// Mesmo método das outras: âncoras da timeline (X.c citações, X.s selos) + proporções; fatos sempre do log (D).
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {AMBAR, BANG, C, CHUMBO, COR, ease, Icone, janela, LATAO, LUZ, MAD_C, MAD_E, MONO, NOME, PERG, Pedra, POP, quique, RubiGrande, sombra, TINTA, VINHO, type Humor} from './base';
import {Acoes, AncoraConta, Anel, Arpao, Bandeira, Cadeado, Carimbo, Coracao, Estreia, FarolPac, Ficha, Lacre, Mao, Numero, Piso, Placa, PlacaJogo, Registro, Retrato, TagSo, Versoes, estado} from './pecas';
import {Chuva, Divide, Fundo, Gravura, Liso, Mesa, Sala} from './cenarios';
import {palT, sk, type X} from './dados';
import {Cam, Hud, marcasPara, passos, pop, Recorte, Rot, type CenaFn} from './util';
import {Noite} from './cenas1';
import {Flamulas, fala} from './cenas2';

const g = (a: number, b: number, x: number) => a + (b - a) * x;
const penTxt = (X: X, R: string, i: number) => X.D.ev(R, i)?.fala ?? '';

// metade de tela dividida: cenário ilustrado + personagem atrás da bancada + etiqueta da rodada
const Metade: React.FC<{f: number; fundo: string; cor: string; rod: string; humor?: Humor; fl?: boolean; exp?: string; rot: string; x?: number; children?: React.ReactNode}> = ({f, fundo, cor, rod, humor, fl, exp, rot, x = 250, children}) => (
  <AbsoluteFill>
    <Fundo nome={fundo} f={f} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0000 40%, #000a)'}} />
    <div style={{position: 'absolute', left: x, top: 200}}><Pedra cor={cor} s={460} f={f} rod={rod} humor={humor} fala={fl} exp={exp} /></div>
    <div style={{position: 'absolute', left: -20, right: -20, bottom: -10, height: 260, background: `repeating-linear-gradient(90deg, ${MAD_E} 0 70px, #4e311e 70px 74px)`, borderTop: `10px solid ${MAD_C}`, outline: `5px solid ${TINTA}`}} />
    <div style={{position: 'absolute', left: 40, top: 850}}><Rot fs={34} bg={COR[rod === 'S' ? 'Azul' : 'Verde']} cor="#fff">{rot}</Rot></div>
    {children}
  </AbsoluteFill>
);

// gota de sangue com o tipo
const Gota: React.FC<{tipo: string; rot: string; s: number; cor: string; t: number; x?: boolean}> = ({tipo, rot, s, cor, t, x}) => t < 0 ? null : (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `scale(${quique(t, 0, 14)})`}}>
    <div style={{position: 'relative'}}>
      <svg viewBox="0 0 100 120" width={s} height={s * 1.2}><path d="M50 4 C50 4 92 58 92 82 A42 42 0 0 1 8 82 C8 58 50 4 50 4Z" fill={cor} stroke={TINTA} strokeWidth={6} /><ellipse cx={34} cy={74} rx={8} ry={14} fill="#ffffff55" /></svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: s * 0.55, textAlign: 'center', fontFamily: BANG, fontSize: s * 0.36, color: '#fff', ...C(5)}}>{tipo}</div>
      {x ? <div style={{position: 'absolute', inset: 0, opacity: ease(t, 12, 18)}}><Icone n="x" s={s} cor="#3A3F47" /></div> : null}
    </div>
    <Rot fs={Math.max(22, s * 0.16)}>{rot}</Rot>
  </div>
);

// celular da vítima com a última mensagem
const Celular: React.FC<{t: number; msg: string; para: string; hora: string; s?: number}> = ({t, msg, para, hora, s = 1}) => t < 0 ? null : (
  <div style={{width: 360 * s, height: 640 * s, background: '#15171c', border: `${10 * s}px solid #2b2e36`, outline: `5px solid ${TINTA}`, borderRadius: 46 * s, boxShadow: sombra, padding: 22 * s, transform: `translateY(${(1 - quique(t, 0, 16)) * 400}px) rotate(4deg)`}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26 * s, color: '#9aa1ab', textAlign: 'center'}}>{hora}</div>
    <div style={{marginTop: 30 * s, fontFamily: POP, fontWeight: 800, fontSize: 30 * s, color: '#fff', borderBottom: '2px solid #333', paddingBottom: 10}}>Para: <span style={{color: LUZ}}>{para}</span></div>
    <div style={{marginTop: 40 * s, marginLeft: 40 * s, background: '#2f6bd8', color: '#fff', fontFamily: POP, fontWeight: 700, fontSize: 30 * s, lineHeight: 1.25, borderRadius: 22 * s, padding: `${14 * s}px ${18 * s}px`, opacity: ease(t, 10, 16)}}>{msg}</div>
    <div style={{marginTop: 8, textAlign: 'right', fontFamily: MONO, fontSize: 20 * s, color: '#9aa1ab', opacity: ease(t, 14, 20)}}>enviada {hora}</div>
  </div>
);

// cartão empilhado (balão antigo com o número da ação)
const Cartao: React.FC<{t: number; acao: string; txt: string; cor: string; grifo?: string[]; w?: number; fs?: number; f: number}> = ({t, acao, txt, cor, grifo = [], w = 700, fs = 30, f}) => {
  if (t < 0) return null;
  const pisca = 0.5 + 0.5 * Math.sin(f * 0.5);
  const partes: React.ReactNode[] = [];
  let resto = txt;
  for (let guard = 0; guard < 20 && resto; guard++) {
    let melhor = -1, qual = '';
    for (const gr of grifo) { const i = resto.toLowerCase().indexOf(gr.toLowerCase()); if (i >= 0 && (melhor < 0 || i < melhor)) { melhor = i; qual = gr; } }
    if (melhor < 0) { partes.push(resto); break; }
    partes.push(resto.slice(0, melhor));
    partes.push(<span key={guard} style={{background: `rgba(255,226,154,${0.5 + 0.5 * pisca})`, borderBottom: `4px solid ${TINTA}`, padding: '0 4px', borderRadius: 4}}>{resto.slice(melhor, melhor + qual.length)}</span>);
    resto = resto.slice(melhor + qual.length);
  }
  return (
    <div style={{width: w, background: '#FBF6EA', border: `7px solid ${COR[cor]}`, outline: `4px solid ${TINTA}`, borderRadius: 22, boxShadow: sombra, padding: '10px 22px 14px', transform: `scale(${quique(t, 0, 14)}) rotate(${(acao.length % 3) - 1}deg)`}}>
      <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 800, fontSize: fs * 0.75, color: '#fff', background: COR[cor], border: `3px solid ${TINTA}`, borderRadius: 20, padding: '0 14px', marginBottom: 6}}>{acao}</div>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.22, color: TINTA}}>“{partes}”</div>
    </div>
  );
};


// ================= A0: a inspiração (trecho do trailer oficial de Phoenix Wright) e o pedido do @SwordMan333 =================
const A0: CenaFn = (X) => {
  const {f} = X, pop0 = 425, enc = ease(f, 7 * 30, 7 * 30 + 16); // o trecho do jogo toca inteiro, depois a TV encolhe e entra o pedido
  const dias = [0, 1, 2, 3, 4].map((k) => pop0 + 24 + k * 9);
  const texto = 'faz um tribunal das ia, onde tem 5 ia, uma juiz, acusador, acusado e o advogado das duas, e os casos são totalmentes aleatórios...';
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: g(260, 90, enc), top: g(110, 190, enc), width: g(1400, 1000, enc), transform: `rotate(${-1 + enc}deg) scale(${f < 14 ? quique(f, 0, 16) : 1})`, transformOrigin: '50% 50%'}}>
      <div style={{position: 'relative', background: `repeating-linear-gradient(1deg, ${MAD_C} 0 44px, #7b4e2e 44px 48px)`, border: `8px solid ${TINTA}`, borderRadius: 24, padding: 22, boxShadow: sombra}}>
        <div style={{position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', border: `6px solid ${TINTA}`, borderRadius: 12, background: '#000'}}>
          <OffthreadVideo src={staticFile('tribunal/pw_trecho.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div style={{position: 'absolute', left: 40, top: -30}}><Rot fs={34} bg={LUZ}>A INSPIRAÇÃO</Rot></div>
        <div style={{position: 'absolute', right: 30, bottom: -26, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: PERG, background: '#000c', borderRadius: 6, padding: '2px 10px'}}>Phoenix Wright: Ace Attorney Trilogy · trailer oficial (Capcom)</div>
      </div>
    </div>
    {f >= pop0 ? <div style={{position: 'absolute', left: 1130, top: 250, width: 720, transform: `scale(${quique(f, pop0, 16)}) rotate(2deg)`, transformOrigin: '20% 50%'}}>
      <div style={{background: PERG, border: `6px solid ${TINTA}`, borderRadius: 18, boxShadow: sombra, padding: '20px 26px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: '#5a6fb0', border: `4px solid ${TINTA}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BANG, fontSize: 40, color: '#fff'}}>S</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, color: TINTA}}>@SwordMan333</div>
        </div>
        <div style={{marginTop: 12, fontFamily: POP, fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: TINTA}}>{texto}</div>
      </div>
      <div style={{display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center'}}>
        {dias.map((at, k) => <div key={k} style={{opacity: f >= at ? 1 : 0, transform: `scale(${pop(f, at)}) rotate(${(k % 2 ? 4 : -4)}deg)`, fontFamily: BANG, fontSize: 34, color: '#fff', background: VINHO, border: `4px solid ${TINTA}`, borderRadius: 8, padding: '0 10px'}}>DIA {k + 1}</div>)}
      </div>
      {f >= dias[4] + 12 ? <div style={{marginTop: 14, display: 'flex', justifyContent: 'center'}}><Carimbo txt="PEDIU POR 5 DIAS" tipo="aceita" t={f - dias[4] - 12} fs={64} /></div> : null}
    </div> : null}
  </Liso>, h: null};
};

// ================= G1: o laudo (dia 3, lado a lado) =================
const G1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.48), c1 = sk(X, X.c, 1, 0.68);
  const lab = t0 + 24, laudo = t0 + (c0.at - t0) * 0.36, cel = t0 + (c0.at - t0) * 0.7;
  const hud = <Hud f={f} rod={null} dois={{S: passos(D.pac('S', 64)), J: passos(D.pac('J', 60)), rot: 'DIA 3', de: t0}} aparece={t0} />;
  const e8 = D.ficha('E8');
  if (f < laudo) return {m: <Divide f={f}
    esq={<Metade f={f} fundo="investigacao" cor="Azul" rod="S" rot="SAFIRA · AÇÃO 1: LABORATÓRIO" humor="cinico"><div style={{position: 'absolute', left: 560, top: 660, zIndex: 9, transform: `scale(${pop(f, lab)}) rotate(-4deg)`}}><Ficha id="E8" nome={e8.nome} w={300} brilho f={f} tag="NOVA PROVA" /></div></Metade>}
    dir={<Metade f={f} fundo="investigacao" cor="Verde" rod="J" rot="JADE · AÇÃO 1: LABORATÓRIO" humor="normal"><div style={{position: 'absolute', left: 560, top: 660, zIndex: 9, transform: `scale(${pop(f, lab + 6)}) rotate(4deg)`}}><Ficha id="E8" nome={e8.nome} w={300} brilho f={f} tag="NOVA PROVA" /></div></Metade>} />, h: hud};
  if (f < c0.at - 8) return {m: <Cam f={f} k={[[laudo, 900, 540, 1], [cel, 960, 540, 1.04], [c0.at, 1100, 520, 1.06]]}><Liso f={f}>
    <div style={{position: 'absolute', left: 120, top: 150, width: 1060, background: PERG, border: `6px solid ${TINTA}`, borderRadius: 14, boxShadow: sombra, padding: '20px 30px 30px', transform: `translateY(${(1 - quique(f, laudo, 16)) * 500}px) rotate(-1.5deg)`}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#5a5343'}}>LAUDO DA PERÍCIA · {e8.nome.toUpperCase()}</div>
      <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 20}}>
        <Gota tipo="O−" rot="CACO DA LENTE" s={250} cor="#B3122E" t={f - laudo - 10} />
        <Gota tipo="B+" rot="VÍTIMA (LIA)" s={150} cor="#7d6a4a" t={f - laudo - 30} x />
        <Gota tipo="A+" rot="RÉ (QUARTZO)" s={150} cor="#7d6a4a" t={f - laudo - 44} x />
      </div>
    </div>
    <div style={{position: 'absolute', left: 1330, top: 160}}><Celular t={f - cel} msg="Pode vir, estou abrindo agora." para="Patrocinador" hora="22:14" /></div>
    {f > cel + 40 ? <div style={{position: 'absolute', left: 1180, top: 840, transform: `scale(${pop(f, cel + 40)}) rotate(-3deg)`}}><TagSo txt="SÓ VOCÊ VÊ: O PATROCINADOR É O RUBI" fs={30} /></div> : null}
  </Liso></Cam>, h: hud};
  return {m: <Divide f={f} foco={f < c1.at - 10 ? -0.25 * ease(f, c0.at - 8, c0.at + 10) : 0.25 * ease(f, c1.at - 10, c1.at + 8)}
    esq={<Metade f={f} fundo="escritorio" cor="Vermelho" rod="S" rot="RUBI · RODADA DA SAFIRA" humor="triste" x={240} />}
    dir={<Metade f={f} fundo="corredor" cor="Vermelho" rod="J" rot="RUBI · RODADA DA JADE" humor="cinico" fl={fala(X, 1)} x={240} />} />, h: hud};
};

// ================= G2: nunca, às nove, à tarde =================
const G2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.06), c1 = sk(X, X.c, 1, 0.33), c2 = sk(X, X.c, 2, 0.49), c3 = sk(X, X.c, 3, 0.64);
  const ap = D.evs('S').filter((e) => e.dia === 3 && e.tipo === 'apresentar');
  const noRubi = ap.filter((e) => e.pessoa === 'Vermelho');
  const acoes = (e: {i: number}) => (D.acao('S', e.i) ?? 1) - 1;
  const bA = c0.end + 10, bB = c1.at - 12;
  const resp = [c1, c2, c3];
  const nAc = (k: number) => { const r = [73, 79, 85][k]; return D.acao('S', r - 1) ?? '?'; };
  const pac = D.pac('S', 66);
  const hud = <Hud f={f} rod="S" dia={3} farol={{rod: 'S', passos: passos(pac)}} />;
  if (f < bA) return {m: <Cam f={f} k={[[0, 1300, 520, 1.12], [bA, 1400, 500, 1.18]]}><Mesa f={f} rod="S" esq={{cor: 'Azul', humor: 'cinico'}} dir={{cor: 'Verde', humor: 'feliz', fala: fala(X, 0), papel: 'assistente'}}>
    <div style={{position: 'absolute', left: 1370, top: 640, zIndex: 9, transform: `rotate(${-8 + Math.sin(f * 0.2) * 3}deg)`}}>
      <svg width={220} height={150}><path d="M10 30 L200 20 L210 130 L20 140Z" fill="#e8c27a" stroke={TINTA} strokeWidth={6} /><text x={40} y={92} fontFamily="Poppins" fontWeight={800} fontSize={30} fill="#7a3d10">POLVILHO</text>{[0, 1, 2].map((i) => <circle key={i} cx={60 + i * 50} cy={12 - ((f + i * 9) % 30) * 0.6} r={6} fill="#f4e3b8" stroke={TINTA} strokeWidth={2} />)}</svg>
    </div>
  </Mesa></Cam>, h: hud};
  if (f < bB) {
    const marc = noRubi.map((e, k) => ({i: acoes(e), at: bA + 20 + k * ((bB - bA - 40) / Math.max(1, noRubi.length)), cor: 'Vermelho'}));
    return {m: <Liso f={f}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, bA) * 1.6})`}}><Acoes f={f} marcadas={marc} rot="RODADA DA SAFIRA · AÇÕES DO DIA 3" s={60} /></div>
      <div style={{position: 'absolute', left: 260, top: 460, opacity: ease(f, bA + 30, bA + 40)}}><Retrato cor="Vermelho" rod="S" s={300} f={f} humor="cinico" rot="O ALVO PREFERIDO" /></div>
      <div style={{position: 'absolute', left: 760, top: 560, display: 'flex', flexDirection: 'column', gap: 26}}>
        <div style={{transform: `scale(${pop(f, bA + 60)})`, transformOrigin: '0 50%'}}><Numero txt={`${noRubi.length} DE 10`} t={f - bA - 60} fs={200} sub="AÇÕES MOSTRANDO PROVA PRO RUBI" /></div>
      </div>
    </Liso>, h: hud};
  }
  const fim = c3.end + 10;
  const cards = resp.map((c, k) => <div key={k} style={{position: 'absolute', left: 560 + k * 30, top: 90 + k * 175, zIndex: 20 + k}}><Cartao f={f} t={f - c.end} acao={`AÇÃO ${nAc(k)}`} txt={X.cita[k + 1]?.texto ?? ''} cor="Vermelho" w={820} fs={26} grifo={['restaurador', 'Nunca toquei', 'às nove da noite', 'à tarde', 'restauro']} /></div>);
  if (f < fim) {
    const apr = (k: number) => resp[k].at - 26;
    const ficha = (k: number) => D.ficha(D.ev('S', [72, 78, 84][k])?.prova ?? 'E5');
    const kk = f < resp[1].at - 30 ? 0 : f < resp[2].at - 30 ? 1 : 2;
    return {m: <Cam f={f} k={[[bB, 960, 540, 1], [c1.at, 1250, 520, 1.08], [c2.at, 1000, 540, 1.02], [c3.at, 1300, 520, 1.1], [fim, 960, 540, 1]]}><Mesa f={f} rod="S" esq={{cor: 'Azul', gesto: janela(f, apr(kk) - 6, apr(kk) + 24, 6)}} dir={{cor: 'Vermelho', fala: fala(X, 1, 2, 3), humor: kk === 2 ? 'feliz' : 'cinico'}}>
      <div style={{position: 'absolute', left: 760, top: 560, zIndex: 8, transform: `scale(${pop(f, apr(kk))}) rotate(-3deg)`}}><Ficha id={ficha(kk).id} nome={ficha(kk).nome} w={290} f={f} /></div>
      <div style={{position: 'absolute', inset: 0, transform: 'scale(0.55)', transformOrigin: '50% 0%', zIndex: 20}}>{cards}</div>
    </Mesa></Cam>, h: <Hud f={f} rod="S" dia={3} acao={nAc(kk) as number} farol={{rod: 'S', passos: passos(pac)}} />};
  }
  return {m: <Liso f={f}><div style={{position: 'absolute', left: 120, top: 0, transform: `scale(${g(0.8, 1, ease(f, fim, fim + 20))})`, transformOrigin: '50% 0%'}}>{cards}</div>
    <div style={{position: 'absolute', left: 80, top: 330}}><Retrato cor="Vermelho" rod="S" s={330} f={f} humor="feliz" rot="ENGENHEIRO → RESTAURADOR" /></div></Liso>, h: hud};
};

// ================= G3: o cadeado errado (Peridoto, rodada da Jade) =================
const G3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.37), c1 = sk(X, X.c, 1, 0.64), s1 = sk(X, X.s, 1, 0.9);
  const ap = c0.at * 0.12, faisca = c0.at * 0.42, menos = c0.at * 0.62;
  const tH = palT(X, 1, 'homem'), tA = palT(X, 1, 'anel'), tP = palT(X, 1, 'porta');
  const farol = {rod: 'J', passos: passos(D.pac('J', 69), [menos, D.pac('J', 71)]), placa: {txt: penTxt(X, 'J', 71), at: menos}};
  const nT = f < s1.at ? 4 : 9;
  const grav = f >= c1.at - 20;
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [faisca, 1250, 480, 1.12], [c0.at, 1300, 500, 1.1], [c1.at, 960, 460, 1.02], [X.dur, 1100, 480, 1.08]]}>
    <Mesa f={f} rod="J" lugar="cais" esq={{cor: 'Verde', gesto: janela(f, ap - 6, ap + 30, 6), humor: f > menos ? 'triste' : 'normal'}} dir={{cor: 'Lima', cadeados: 2, fala: fala(X, 1), humor: f >= c1.at ? 'cinico' : f >= c0.at ? 'triste' : 'susto'}}>
      <div style={{position: 'absolute', left: 760, top: 560, zIndex: 8, transform: `scale(${pop(f, ap)}) rotate(-3deg)`}}><Ficha id="PF4" nome={D.ficha('PF4').nome} w={280} f={f} tag="PERFIL" /></div>
      <div style={{position: 'absolute', left: 1500, top: 60, zIndex: 9, opacity: grav ? 0 : 1}}><Cadeado s={150} f={f} estado={f >= faisca ? 'faisca' : 'fechado'} t={f - faisca} chaves={f > faisca + 20 ? ['JORNAL ANTIGO', 'PÁGINA QUEIMADA'] : undefined} chK={ease(f, faisca + 20, faisca + 34)} /></div>
      {f > faisca + 30 && !grav ? <div style={{position: 'absolute', left: 600, top: 470, zIndex: 9, transform: `scale(${pop(f, faisca + 30)}) rotate(3deg)`}}><Rot fs={30} bg="#E4DED2">PERFIL DO RUBI: CHAVE ERRADA</Rot></div> : null}
      {grav ? <div style={{position: 'absolute', left: 560, top: 30, width: 820, height: 450, overflow: 'hidden', border: `6px solid ${TINTA}`, borderRadius: 12, zIndex: 2, opacity: ease(f, c1.at - 20, c1.at)}}><div style={{transform: 'scale(0.43)', transformOrigin: '0 0', width: 1920, height: 1080, position: 'relative'}}><Gravura f={f} k={{luz: 0, rubi: ease(f, tH, tH + 10), anel: ease(f, tA, tA + 10), tranca: ease(f, tP, tP + 10), relogio: '22:50'}} /></div><div style={{position: 'absolute', left: 14, top: 12}}><TagSo txt="O QUE ELE VIU · ACENDE ENQUANTO ELE NEGA" fs={26} /></div></div> : null}
      <div style={{position: 'absolute', left: 1560, top: grav ? 520 : 360, zIndex: 9, transform: 'scale(0.8)'}}><AncoraConta n={nT} t={f - (nT === 9 ? s1.at : -99)} s={150} f={f} /></div>
    </Mesa>
  </Cam>, h: <Hud f={f} rod="J" dia={3} acao={D.acao('J', 70)} farol={farol} />};
};

// ================= G4: esquece (a ré fala pela primeira vez) =================
const G4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.15), c1 = sk(X, X.c, 1, 0.39), c2 = sk(X, X.c, 2, 0.74);
  const tHom = palT(X, 1, 'homem de terno'), tEsp = palT(X, 1, 'espera');
  const ap2 = c1.end + (c2.at - c1.end) * 0.3, menos = c1.end + (c2.at - c1.end) * 0.6;
  const farol = {rod: 'J', passos: passos(D.pac('J', 73), [menos, D.pac('J', 79)]), placa: {txt: penTxt(X, 'J', 79), at: menos}};
  const fant = janela(f, tHom - 6, tEsp + 10, 12);
  const hum: Humor = f >= c2.at ? 'triste' : f >= c1.at ? (f > tEsp ? 'susto' : 'bravo') : f >= c0.at ? 'triste' : 'normal';
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 1350, 480, 1.14], [c1.at, 1200, 500, 1.06], [tHom, 1000, 500, 1.02], [c1.end, 960, 540, 1], [c2.at, 1380, 480, 1.16], [X.dur, 1420, 470, 1.2]]}>
    <Mesa f={f} rod="J" esq={{cor: 'Verde', gesto: janela(f, ap2 - 6, ap2 + 30, 6), fala: false}} dir={{cor: 'Rosa', cadeados: 2, fala: fala(X, 1), humor: hum}}>
      <div style={{position: 'absolute', left: 1290, top: 130, zIndex: 9, opacity: janela(f, 20, c0.at + 20, 10), transform: `scale(${pop(f, 20)})`}}><Rot fs={34} bg={COR.Rosa}>QUARTZO · {D.modelo('Rosa')} · 1ª FALA</Rot></div>
      {f >= c0.at - 10 && f < c2.at ? <div style={{position: 'absolute', left: 1180, top: 60, zIndex: 9, transform: 'scale(0.85)'}}><Cadeado s={130} f={f} chaves={['CARTA DO PAI', 'CASACO']} chK={ease(f, c0.at, c0.at + 16)} /></div> : null}
      {fant > 0 ? <div style={{position: 'absolute', left: 980, top: 150, zIndex: 2, opacity: fant * 0.85, transform: `translateX(${(1 - fant) * 60}px)`}}><Pedra cor="Vermelho" s={300} f={f} silh /><div style={{textAlign: 'center', marginTop: -20}}><TagSo txt="O HOMEM DO CORREDOR" fs={24} /></div></div> : null}
      {f >= ap2 ? <div style={{position: 'absolute', left: 760, top: 560, zIndex: 8, transform: `scale(${pop(f, ap2)}) rotate(-3deg)`}}><Ficha id="E8" nome={D.ficha('E8').nome} w={290} f={f} tag="PROVA ERRADA" /></div> : null}
      {f >= ap2 + 10 && f < c2.at + 40 ? <div style={{position: 'absolute', left: 1180, top: 60, zIndex: 10, transform: 'scale(0.85)'}}><Cadeado s={130} f={f} estado="faisca" t={f - ap2 - 10} /></div> : null}
    </Mesa>
  </Cam>, h: <Hud f={f} rod="J" dia={3} acao={D.acao('J', f < ap2 ? 73 : 78)} farol={farol} />};
};

// ================= G5: os dois minutos =================
const G5: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.1), c1 = sk(X, X.c, 1, 0.4), s0 = sk(X, X.s, 0, 0.85);
  const t27 = palT(X, 0, '22:27'), t18 = palT(X, 1, '22:18'), lau = c1.end + 20, sai = c1.end + (s0.at - c1.end) * 0.72;
  const T = (h: string) => (h === '22:27' ? t27 : h === '22:18' ? t18 : 1e9);
  return {m: <>
    <Cam f={f} k={[[0, 960, 600, 1.05], [t27, 1050, 560, 1.15], [c1.at, 960, 560, 1.05], [t18, 1080, 560, 1.18], [lau, 960, 540, 1], [X.dur, 960, 560, 1.04]]}><Noite f={f} T={T} so={['22:27', '22:18']} texto={false} janelaLaudo={ease(f, lau, lau + 20)} /></Cam>
    {f >= t27 + 20 && f < c1.at ? <div style={{position: 'absolute', left: 120, top: 150, transform: `scale(${pop(f, t27 + 20)}) rotate(-2deg)`}}><TagSo txt="22:27 · NINGUÉM TINHA FALADO NESSE HORÁRIO" fs={32} /></div> : null}
    {f >= lau + 30 ? <div style={{position: 'absolute', left: 120, top: 150, display: 'flex', flexDirection: 'column', gap: 14, transform: `scale(${pop(f, lau + 30)})`, transformOrigin: '0 0'}}><Rot fs={34}>O LAUDO: ENTRE 22:15 E 22:25</Rot><Rot fs={34} bg="#ff4a3a" cor="#fff">O RUBI: “22:18”</Rot></div> : null}
    {f >= sai ? <div style={{position: 'absolute', left: g(1300, 2000, ease(f, sai + 30, sai + 90)), top: 330, transform: `scale(${pop(f, sai)})`}}><Pedra cor="Verde" s={300} f={f} rod="J" exp="normal" /><div style={{marginTop: -30}}><Ficha id="E7" nome={D.ficha('E7').nome} w={230} f={f} tag="ÚLTIMA AÇÃO DO DIA" /></div></div> : null}
  </>, h: <Hud f={f} rod="J" dia={3} farol={{rod: 'J', passos: passos(D.pac('J', 82))}} />};
};

// ================= G6: as chaves que ninguém usou (Safira) =================
const G6: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.32), s0 = sk(X, X.s, 0, 0.8);
  const ac = D.evs('S').filter((e) => e.dia === 3 && ['examinar', 'conversar', 'apresentar'].includes(e.tipo));
  const sobra = ac.slice(6).map((e, k) => ({i: 6 + k, at: 120 + k * 40, cor: e.pessoa ?? 'Azul'}));
  const quebra = c0.at - 30, volta = c0.end + 20;
  const farolS = passos(D.pac('S', 80), [quebra, D.pac('S', 81)]);
  const itens = [['E4', 'CHAVE DA QUARTZO'], ['P3', 'CHAVE DA QUARTZO'], ['E6', 'CHAVE DO PERIDOTO'], ['E7', 'CHAVE DO PERIDOTO']] as const;
  const hud = <Hud f={f} rod="S" dia={3} farol={{rod: 'S', passos: farolS}} />;
  if (f < quebra) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 70, top: 120, transform: 'scale(0.78)', transformOrigin: '0 0'}}><Registro f={f} titulo="REGISTRO DA SAFIRA · DIA 3" itens={itens.map(([id, tag], k) => ({...D.ficha(id), brilho: true, tag, tagSo: true, at: 10 + k * 14}))} w={1000} cols={2} /></div>
    <div style={{position: 'absolute', left: 1020, top: 160, transform: `scale(${pop(f, 100) * 1.2})`, transformOrigin: '0 0'}}><Acoes f={f} marcadas={sobra} rot="AÇÕES QUE SOBRARAM: 4" s={54} /></div>
    <div style={{position: 'absolute', left: 1080, top: 420, display: 'flex', gap: 40, opacity: ease(f, 150, 170)}}><Retrato cor="Vermelho" rod="S" s={220} f={f} rot="3 AÇÕES" /><Retrato cor="Amarelo" rod="S" s={220} f={f} rot="1 AÇÃO" /></div>
  </Liso>, h: hud};
  if (f < volta) return {m: <Cam f={f} k={[[quebra, 960, 540, 1], [c0.at, 1250, 500, 1.1]]}><Mesa f={f} rod="S" lugar="corredor" tv esq={{cor: 'Azul', gesto: janela(f, quebra - 10, quebra + 20, 6)}} dir={{cor: 'Amarelo', fala: fala(X, 0), humor: 'feliz'}}>
    <div style={{position: 'absolute', left: 1500, top: 60, zIndex: 9}}><Cadeado s={140} f={f} estado="aberto" t={f - quebra} /></div>
    <div style={{position: 'absolute', left: 1180, top: 120, zIndex: 10, transform: `scale(${pop(f, quebra + 6)})`}}><PlacaJogo txt={penTxt(X, 'S', 81)} /></div>
  </Mesa></Cam>, h: hud};
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 120, top: 300, transform: `scale(${pop(f, volta)})`, transformOrigin: '0 50%'}}><Rot fs={54} bg={LUZ}>AS CHAVES QUE A SAFIRA TINHA</Rot></div>
    <div style={{position: 'absolute', left: 120, top: 430, display: 'flex', gap: 80}}>
      {[['Rosa', ['CARTA DO PAI', 'CASACO']], ['Lima', ['JORNAL ANTIGO', 'PÁGINA QUEIMADA']]].map(([cor, ch], k) => <div key={k} style={{display: 'flex', alignItems: 'flex-start', gap: 10, opacity: ease(f, volta + 10 + k * 16, volta + 22 + k * 16)}}>
        <Retrato cor={cor as string} rod="S" s={240} f={f} cadeados={2} rot={k ? 'NÃO TENTOU' : 'NÃO TENTOU'} />
        <Cadeado s={130} f={f} chaves={ch as string[]} chK={ease(f, volta + 30 + k * 16, volta + 44 + k * 16)} />
      </div>)}
    </div>
  </Liso>, h: <Hud f={f} rod="S" dia={3} farol={{rod: 'S', passos: farolS}} dois={f > s0.at - 20 ? {S: passos(D.pac('S', 87)), J: passos(D.pac('J', 84)), de: s0.at - 20} : null} />};
};

// ================= H1: chamei duas vezes (Jade, dia 4) =================
const H1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.23), c1 = sk(X, X.c, 1, 0.5), c2 = sk(X, X.c, 2, 0.63);
  const dep = D.ev('J', 88), rev = D.ev('J', 93), ob = D.ev('J', 89);
  const lit = (ob?.declaracao ?? 1) - 1, band = t0 + (c0.at - t0) * 0.45;
  const pJ = D.pac('J', 85);
  const hud = <Hud f={f} rod="J" dia={4} aparece={t0} farol={{rod: 'J', passos: passos(pJ)}} />;
  if (f < c0.at - 6) return {m: <Cam f={f} k={[[t0, 900, 520, 1], [band, 700, 520, 1.08], [c0.at, 760, 500, 1.04]]}><Sala plano="banco" f={f} rod="J" quem={{testemunha: {cor: 'Vermelho', humor: 'cinico'}}}>
    <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10}}><Placa cor="Vermelho" decl={dep?.declaracoes ?? []} lit={f > band - 30 ? lit : null} f={f} w={860} max={100} entra={t0} /></div>
    <div style={{position: 'absolute', left: 120, top: 180, zIndex: 30}}><Bandeira t={f - band} ficha={D.ficha(ob?.prova ?? 'E2')} /></div>
  </Sala></Cam>, h: hud};
  if (f < c0.end + 10) return {m: <Cam f={f} k={[[c0.at - 6, 960, 440, 1], [c0.end, 960, 400, 1.1]]}><Sala plano="juiz" f={f} rod="J" quem={{juiz: {cor: 'Roxo', fala: fala(X, 0), gesto: ease(f, c0.end - 24, c0.end - 4)}}}><div style={{position: 'absolute', left: 560, top: 640, zIndex: 20}}><Carimbo txt="OBJEÇÃO ACEITA" tipo="aceita" t={f - (c0.end - 20)} fs={96} /></div></Sala></Cam>, h: hud};
  if (f < c2.at - 6) {
    const re = c0.end + 40, pv = c1.end + 6;
    return {m: <Cam f={f} k={[[c0.end + 10, 960, 540, 1], [c1.at, 640, 520, 1.12], [pv, 960, 520, 1]]}><Sala plano="banco" f={f} rod="J" quem={{testemunha: {cor: 'Vermelho', humor: 'cinico', fala: fala(X, 1)}}}>
      <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10}}><Placa cor="Vermelho" decl={rev?.declaracoes ?? []} lit={0} f={f} w={860} max={100} reescreve={{i: 0, txt: rev?.declaracoes?.[0] ?? '', at: re}} /></div>
      {f >= pv ? <div style={{position: 'absolute', left: 860, top: 560, zIndex: 20, transform: `scale(${0.72 * pop(f, pv)})`, transformOrigin: '0 0'}}><Versoes f={f} marcas={marcasPara('H1', [pv + 12])} w={1300} /></div> : null}
    </Sala></Cam>, h: hud};
  }
  const rec = D.frase('J', 82, '22:18');
  return {m: <Cam f={f} k={[[c2.at - 6, 700, 520, 1.1], [X.dur, 900, 520, 1.02]]}><Sala plano="banco" f={f} rod="J" quem={{testemunha: {cor: 'Vermelho', humor: 'triste'}}}>
    <div style={{position: 'absolute', left: 900, top: 160, zIndex: 12}}><Recorte cor="Vermelho" txt={rec} rod="J" dia={3} ref="J#82" t={f - (c2.end + 4)} w={900} /></div>
    {f > c2.end + 20 ? <div style={{position: 'absolute', left: 980, top: 560, zIndex: 13, fontFamily: MONO, fontWeight: 700, fontSize: 150, color: '#ff4a3a', ...C(9), opacity: 0.6 + 0.4 * Math.sin(f * 0.4), transform: `scale(${pop(f, c2.end + 20)})`}}>22:18</div> : null}
  </Sala></Cam>, h: hud};
};

// ================= H2: toma essa, de novo =================
const H2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.25), c1 = sk(X, X.c, 1, 0.5), s0 = sk(X, X.s, 0, 0.8);
  const pJ = D.pac('J', 95), arp = c0.at - 34, mao = palT(X, 1, 'segurando'), acerta = c1.end + 10;
  const hud = <Hud f={f} rod="J" dia={4} farol={{rod: 'J', passos: passos(pJ), aviso: 'SE ERRAR: -2 = 0', risco: 1}} />;
  if (f < mao - 10) return {m: <Cam f={f} k={[[0, 600, 520, 1.1], [arp, 960, 540, 1], [c0.at + 30, 1450, 520, 1.12], [c1.at, 900, 520, 1.05]]}><Sala plano="tribuna" f={f} rod="J" quem={{advogada: {cor: 'Verde', gesto: ease(f, arp - 10, arp + 6), fala: fala(X, 0, 1), humor: 'bravo'}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Ciano'}, acusado: {cor: 'Vermelho', humor: 'cinico'}}}><Arpao t={f - arp} alvoX={1400} y={860} lento item={D.ficha('E8')} /></Sala></Cam>, h: hud};
  if (f < acerta) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 560, top: 60}}><RubiGrande exp="choque" h={980} f={f} /></div>
    <div style={{position: 'absolute', left: 180, top: 640, transform: `scale(${pop(f, mao)})`}}><Rot fs={40} bg={LUZ}>A DIREITA: ENFAIXADA</Rot></div>
    <div style={{position: 'absolute', left: 1330, top: 360, transform: `scale(${pop(f, mao + 24)})`}}><Rot fs={40} bg={LUZ}>A ESQUERDA: O ANEL</Rot></div>
  </Liso>, h: hud};
  return {m: <Cam f={f} k={[[acerta, 1450, 500, 1.2], [X.dur, 1500, 480, 1.3]]}><Sala plano="tribuna" f={f} rod="J" quem={{advogada: {cor: 'Verde', gesto: 1}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Ciano'}, acusado: {cor: 'Vermelho', humor: 'susto'}}}>
  </Sala></Cam>, h: hud};
};

// ================= H3: a torre de um caco só =================
const Torre: React.FC<{f: number; ids: {id: string; nome: string}[]}> = ({f, ids}) => (
  <div style={{position: 'relative', width: 420, height: 760}}>
    <svg width={420} height={120} style={{position: 'absolute', left: 0, bottom: 0}}><path d="M150 110 L210 10 L260 110Z" fill="#cfe9ff" stroke={TINTA} strokeWidth={6} /><path d="M195 40 L205 90" stroke="#fff" strokeWidth={5} /></svg>
    {ids.map((p, k) => <div key={p.id} style={{position: 'absolute', left: 70 + Math.sin(f * 0.05 + k) * (6 + k * 3), bottom: 100 + k * 130, transform: `rotate(${Math.sin(f * 0.06 + k * 0.7) * (2 + k * 1.2)}deg)`, transformOrigin: '50% 100%'}}><Ficha id={p.id} nome={p.nome} w={280} f={f} /></div>)}
  </div>
);
const H3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.03), c1 = sk(X, X.c, 1, 0.26), c2 = sk(X, X.c, 2, 0.53), c3 = sk(X, X.c, 3, 0.75);
  const pJ = D.pac('J', 97);
  const hud = <Hud f={f} rod="J" dia={4} farol={{rod: 'J', passos: passos(pJ), aviso: 'SE ERRAR: -2 = 0', risco: 1}} />;
  if (f < c1.at - 10) return {m: <Fundo2 f={f}>
    <div style={{position: 'absolute', left: 180, top: 140}}><Torre f={f} ids={['E8', 'E2', 'E5', 'P6'].map((id) => D.ficha(id))} /></div>
    <div style={{position: 'absolute', left: 900, top: 90}}><RubiGrande exp="ajeita_anel" h={1000} f={f} fala={fala(X, 0)} /></div>
  </Fundo2>, h: hud};
  if (f < c3.at - 8) {
    const lado = f < c2.at - 10 ? -0.2 : 0.2;
    return {m: <Divide f={f} foco={lado * ease(f, c1.at - 10, c1.at + 10)}
      esq={<Metade f={f} fundo="mesa_defesa" cor="Vermelho" rod="J" rot="RODADA DA JADE" humor="cinico" fl={fala(X, 1)} x={240}>{f > c1.end ? <div style={{position: 'absolute', left: 60, top: 230, transform: `scale(${pop(f, c1.end)})`}}><Rot fs={34} bg={LUZ}>“É O NÚMERO DA FUNDAÇÃO”</Rot></div> : null}</Metade>}
      dir={<Metade f={f} fundo="estrado" cor="Vermelho" rod="S" rot="RODADA DA SAFIRA" humor="feliz" fl={fala(X, 2)} x={240}>{f > c2.end ? <div style={{position: 'absolute', left: 60, top: 230, transform: `scale(${pop(f, c2.end)})`}}><Rot fs={34} bg={LUZ}>“O PATROCINADOR SOU EU”</Rot></div> : null}</Metade>} />, h: hud};
  }
  const cr = palT(X, 3, 'coração');
  return {m: <Cam f={f} k={[[c3.at - 8, 960, 520, 1], [c3.end, 900, 480, 1.08]]}><Sala plano="promotor" f={f} rod="J" quem={{promotor: {cor: 'Laranja', fala: fala(X, 3), humor: 'triste', gesto: 0.3}}}><div style={{position: 'absolute', left: 1220, top: 230, zIndex: 9}}><Coracao n={f < cr ? 3 : 4} t={f - cr} s={250} f={f} /></div></Sala></Cam>, h: hud};
};
// fundo de cena "estúdio" com o tribunal desfocado
const Fundo2: React.FC<{f: number; nome?: string; children?: React.ReactNode}> = ({f, nome = 'tribunal_geral', children}) => (
  <AbsoluteFill><Fundo nome={nome} f={f} blur={5} luz={0.55} /><AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0000 35%, #000c)'}} />{children}</AbsoluteFill>
);

// ================= H4: sombra não é sangue tipado (a ré é condenada) =================
const H4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0), s0 = sk(X, X.s, 0, 0.84), s1 = sk(X, X.s, 1, 0.91);
  const apaga = c0.end - 10, geral = c0.end + 24, painel = geral + (s0.at - geral) * 0.5;
  const farol = {rod: 'J', passos: passos(D.pac('J', 99), [apaga, D.pac('J', 101)]), placa: {txt: penTxt(X, 'J', 101), at: apaga}, s: 170};
  if (f < geral) return {m: <Cam f={f} k={[[0, 960, 470, 1.04], [c0.end, 960, 420, 1.14]]}><Sala plano="juiz" f={f} clima="noite" contraluz rod="J" quem={{juiz: {cor: 'Roxo', fala: fala(X, 0), exp: 'decisao'}}} /></Cam>, h: <Hud f={f} rod="J" dia={4} farol={farol} />};
  if (f < painel) return {m: <Cam f={f} k={[[geral, 960, 540, 1], [painel, 1350, 600, 1.2]]}><Sala plano="geral" f={f} clima="noite" rod="J" quem={{juiz: {cor: 'Roxo', exp: 'decisao'}, testemunha: {cor: 'Vermelho', exp: 'ajeita_anel'}, advogada: {cor: 'Verde', humor: 'triste'}, re: {cor: 'Rosa', cadeados: 2, humor: 'triste', cabecaBaixa: ease(f, geral + 20, geral + 60)}, promotor: {cor: 'Laranja', humor: 'feliz'}}}>
    <div style={{position: 'absolute', left: 1180, top: 560, zIndex: 20}}><Carimbo txt="RÉ CONDENADA" tipo="condenada" t={f - geral - 12} fs={90} /></div>
    <div style={{position: 'absolute', left: 560, top: 760, zIndex: 21}}><Numero txt="0 DE 6" t={f - geral - 50} fs={200} cor="#9aa1ab" /></div>
  </Sala></Cam>, h: <Hud f={f} rod="J" dia={4} farol={farol} />};
  const marcas = D.penal('J').map((e) => { const m = /(\d+) de 6/.exec(e.fala ?? ''); return {dia: e.dia, txt: (e.fala ?? '').split(':')[0].toUpperCase(), n: m ? Number(m[1]) : 0}; });
  let antes = 6;
  const linhas = marcas.map((m) => { const d = antes - m.n; antes = m.n; return `DIA ${m.dia} · ${m.txt} · -${d}`; });
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 120, top: 150}}><FarolPac rod="J" n={0} s={300} f={f} rot="JADE · FIM" /></div>
    <div style={{position: 'absolute', left: 520, top: 180, display: 'flex', flexDirection: 'column', gap: 22}}>
      {linhas.map((l, k) => <div key={k} style={{opacity: ease(f, painel + 10 + k * 14, painel + 18 + k * 14), transform: `translateX(${(1 - ease(f, painel + 10 + k * 14, painel + 22 + k * 14)) * 200}px)`}}><Rot fs={40} bg={k % 2 ? PERG : '#E4DED2'}>{l}</Rot></div>)}
    </div>
    <div style={{position: 'absolute', left: 1440, top: 200, opacity: ease(f, painel + 80, painel + 96), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}><FarolPac rod="S" n={D.pac('S', 87)} s={240} f={f} rot="SAFIRA · MESMO PONTO" /><Rot fs={30} bg={LUZ}>CHEGA COM {D.pac('S', 87)}</Rot></div>
  </Liso>, h: null};
};

// ================= I1: o fornecedor de madeira (Safira, dia 4) =================
const I1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.37), c1 = sk(X, X.c, 1, 0.72);
  const dep = D.ev('S', 91), rev = D.ev('S', 98), ob1 = D.ev('S', 94), ob2 = D.ev('S', 99);
  const b1 = t0 + (c0.at - t0) * 0.25, ok1 = t0 + (c0.at - t0) * 0.68, b2 = c0.end + (c1.at - c0.end) * 0.25;
  const farol = {rod: 'S', passos: passos(D.pac('S', 88), [c1.end + 4, D.pac('S', 102)]), placa: {txt: penTxt(X, 'S', 102), at: c1.end + 4}};
  const hud = <Hud f={f} rod="S" dia={4} aparece={t0} farol={farol} />;
  const anel = <div style={{position: 'absolute', left: 620, top: 840, zIndex: 9, transform: 'scale(0.6) rotate(-8deg)'}}><Anel s={170} f={f} /><div style={{marginTop: -10}}><Rot fs={30}>O ANEL, NA MESA DESDE O DIA 2</Rot></div></div>;
  if (f < c1.at - 6) {
    const nova = f >= c0.at - 20;
    return {m: <Cam f={f} k={[[t0, 900, 540, 1], [b1, 700, 520, 1.06], [c0.at, 640, 520, 1.12], [c0.end, 960, 540, 1], [b2 + 30, 900, 520, 1.04]]}><Sala plano="banco" f={f} rod="S" quem={{testemunha: {cor: 'Vermelho', humor: nova ? 'cinico' : 'normal', fala: fala(X, 0)}}}>
      {anel}
      <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10}}><Placa cor="Vermelho" decl={(nova ? rev : dep)?.declaracoes ?? []} lit={nova ? 0 : (ob1?.declaracao ?? 1) - 1} f={f} w={860} max={100} entra={t0} carimbos={nova ? [] : [{i: (ob1?.declaracao ?? 1) - 1, txt: 'OBJEÇÃO ACEITA', at: ok1, tipo: 'latao'}]} reescreve={nova ? {i: 0, txt: rev?.declaracoes?.[0] ?? '', at: c0.at - 16} : null} /></div>
      {f >= c0.end - 30 && f < b2 ? <div style={{position: 'absolute', left: 900, top: 560, zIndex: 20, transform: `scale(${0.72 * pop(f, c0.end - 30)})`, transformOrigin: '0 0'}}><Versoes f={f} marcas={marcasPara('I1', [c0.end - 20])} w={1300} /></div> : null}
      <div style={{position: 'absolute', left: 120, top: 180, zIndex: 30}}><Bandeira t={f - b1} ficha={D.ficha(ob1?.prova ?? 'R2')} /></div>
      {f >= b2 ? <div style={{position: 'absolute', left: 120, top: 180, zIndex: 31}}><Bandeira t={f - b2} ficha={D.ficha(ob2?.prova ?? 'E5')} /></div> : null}
    </Sala></Cam>, h: hud};
  }
  return {m: <Cam f={f} k={[[c1.at - 6, 960, 450, 1], [c1.end, 960, 400, 1.1], [X.dur, 960, 420, 1.05]]}><Sala plano="juiz" f={f} rod="S" quem={{juiz: {cor: 'Roxo', fala: fala(X, 1), humor: 'bravo'}}}><div style={{position: 'absolute', left: 600, top: 650, zIndex: 20}}><Carimbo txt="OBJEÇÃO RECUSADA" tipo="recusada" t={f - (c1.end - 16)} fs={90} /></div></Sala></Cam>, h: hud};
};

// ================= I2: a palavra que me traiu =================
const I2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.14), c1 = sk(X, X.c, 1, 0.43), c2 = sk(X, X.c, 2, 0.63), c3 = sk(X, X.c, 3, 0.72);
  const ob = D.ev('S', 105), rev = D.ev('S', 109);
  const farol = {rod: 'S', passos: passos(D.pac('S', 104))};
  const hud = <Hud f={f} rod="S" dia={4} farol={farol} />;
  if (f < c0.at - 6) return {m: <Cam f={f} k={[[0, 600, 520, 1.1], [c0.at, 800, 520, 1.02]]}><Sala plano="tribuna" f={f} rod="S" quem={{advogada: {cor: 'Azul', gesto: ease(f, 10, 24), fala: true}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Verde'}, acusado: {cor: 'Vermelho', humor: 'cinico'}}}><div style={{position: 'absolute', left: 120, top: 120, zIndex: 30}}><Bandeira t={f - 16} ficha={D.ficha(ob?.prova ?? 'E8')} /></div></Sala></Cam>, h: hud};
  if (f < c0.end + 10) { const cr = c0.at + 30; return {m: <Cam f={f} k={[[c0.at - 6, 960, 520, 1], [c0.end, 880, 480, 1.08]]}><Sala plano="promotor" f={f} rod="S" quem={{promotor: {cor: 'Laranja', fala: fala(X, 0), humor: 'triste'}}}><div style={{position: 'absolute', left: 1220, top: 230, zIndex: 9}}><Coracao n={f < cr ? 4 : 5} t={f - cr} s={250} f={f} /></div></Sala></Cam>, h: hud}; }
  const alto = c2.at - 40;
  return {m: <Cam f={f} k={[[c0.end + 10, 960, 540, 1], [c1.at, 640, 520, 1.1], [c2.at, 600, 500, 1.18], [c3.at, 560, 480, 1.25], [X.dur, 600, 500, 1.2]]}><Sala plano="banco" f={f} rod="S" quem={{testemunha: {cor: 'Vermelho', humor: f >= c2.at ? 'triste' : 'cinico', fala: fala(X, 1, 2)}}}>
    <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10, opacity: 1 - ease(f, c2.at - 10, c2.at)}}><Placa cor="Vermelho" decl={rev?.declaracoes ?? []} lit={(D.declIdx('S', 109, X.cita[1]?.texto ?? '') + 9) % 9 >= 0 ? Math.max(0, D.declIdx('S', 109, X.cita[1]?.texto ?? '')) : 0} f={f} w={860} max={100} entra={c0.end + 10} carimbos={[{i: Math.max(0, D.declIdx('S', 109, X.cita[1]?.texto ?? '')), txt: 'OBJEÇÃO ACEITA', at: c0.end + 24, tipo: 'latao'}]} /></div>
    <Flamulas f={f} a={alto} b={alto + 20} n={1} />
  </Sala></Cam>, h: hud};
};

// ================= I3: moldura ou vidro =================
const Lente: React.FC<{f: number; pula: number}> = ({f, pula}) => {
  const k = ease(f, pula, pula + 16), y = 330 - Math.sin(k * Math.PI) * 120;
  return (
    <svg width={900} height={700} viewBox="0 0 900 700">
      <rect x={250} y={520} width={400} height={120} fill="#6a4e26" stroke={TINTA} strokeWidth={8} />
      <text x={450} y={595} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={32} fill={PERG}>BASE</text>
      <path d="M200 520 L260 120 H640 L700 520Z" fill="#cfe9ff88" stroke={TINTA} strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${230 + i * 6} ${470 - i * 100} H${670 - i * 6}`} stroke="#3a3f47" strokeWidth={16} />)}
      <text x={720} y={300} fontFamily="Poppins" fontWeight={800} fontSize={34} fill={LUZ}>MOLDURA (FERRO)</text>
      <text x={330} y={430} fontFamily="Poppins" fontWeight={800} fontSize={34} fill="#fff">VIDRO</text>
      <g transform={`translate(${g(690, 420, k)} ${k < 1 ? y : 480})`}><path d="M0 -28 C0 -28 22 0 22 12 A22 22 0 0 1 -22 12 C-22 0 0 -28 0 -28Z" fill="#B3122E" stroke={TINTA} strokeWidth={4} /></g>
    </svg>
  );
};
const I3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.16), c1 = sk(X, X.c, 1, 0.55);
  const vid = palT(X, 0, 'vidro'), min = palT(X, 1, 'mínimo');
  const hud = <Hud f={f} rod="S" dia={4} farol={{rod: 'S', passos: passos(D.pac('S', 110))}} />;
  if (f < c1.at - 20) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 600, top: 140}}><Lente f={f} pula={vid} /></div>
    <div style={{position: 'absolute', left: 90, top: 210}}><Retrato cor="Vermelho" rod="S" s={320} f={f} humor="cinico" fala={fala(X, 0)} rot="DIA 4 · ALTO LÁ" /></div>
    <div style={{position: 'absolute', left: 620, top: 80, transform: `scale(${pop(f, 20)})`}}><Rot fs={34} bg="#E4DED2">1ª RESPOSTA: “NA MOLDURA”</Rot></div>
    {f > vid + 16 ? <div style={{position: 'absolute', left: 1080, top: 80, transform: `scale(${pop(f, vid + 16)})`}}><Rot fs={34} bg={LUZ}>AGORA: “NO VIDRO”</Rot></div> : null}
  </Liso>, h: hud};
  const k = ease(f, min, min + 18);
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 90, top: 210}}><Retrato cor="Vermelho" rod="S" s={320} f={f} humor="cinico" fala={fala(X, 1)} /></div>
    <div style={{position: 'absolute', left: 660, top: 70}}><Mao s={560} f={f} dedo={k} tag={k < 0.5 ? 'DIA 2: ANELAR' : 'DIA 4: MÍNIMO'} tagT={f - (k < 0.5 ? c1.at - 20 : min)} /></div>
    {f > c1.end + 30 ? <div style={{position: 'absolute', left: 1200, top: 820, transform: `scale(${pop(f, c1.end + 30)}) rotate(-3deg)`}}><TagSo txt="GUARDA ESSE DEDO" fs={36} /></div> : null}
  </Liso>, h: hud};
};

// ================= I4: não vi nada, só a tempestade =================
const I4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.07), c1 = sk(X, X.c, 1, 0.19), c2 = sk(X, X.c, 2, 0.66), c3 = sk(X, X.c, 3, 0.78), s0 = sk(X, X.s, 0, 0.87), s1 = sk(X, X.s, 1, 0.93);
  const dep = D.ev('S', 117), grav = c1.at + c1.dur * 0.25, alto = c2.at - 36;
  const tL = palT(X, 1, 'lanterna'), tT = palT(X, 1, 'trancando'), tA = palT(X, 1, 'anel');
  const n = f < c1.end ? 9 : f < s1.at ? 9 + Math.min(5, Math.floor(ease(f, c1.end, c1.end + 40) * 5)) : 14;
  return {m: <Cam f={f} k={[[0, 700, 520, 1.12], [c1.at, 960, 540, 1], [grav, 1200, 480, 1.05], [c2.at, 900, 500, 1.04], [c3.at, 640, 500, 1.16], [X.dur, 700, 520, 1.1]]}><Sala plano="banco" f={f} rod="S" quem={{testemunha: {cor: 'Lima', cadeados: 2, fala: fala(X, 1, 2), humor: f >= c3.at ? 'triste' : f >= c1.at ? 'feliz' : 'susto'}}}>
    {f < grav + 10 ? <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10, opacity: 1 - ease(f, grav, grav + 10)}}><Placa cor="Lima" decl={dep?.declaracoes ?? []} lit={1} f={f} w={860} max={90} entra={c0.end} /></div> : null}
    {f >= grav ? <div style={{position: 'absolute', left: 860, top: 230, width: 820, height: 462, overflow: 'hidden', border: `7px solid ${LATAO}`, borderRadius: 14, zIndex: 11, opacity: ease(f, grav, grav + 14), boxShadow: sombra}}><div style={{transform: 'scale(0.427)', transformOrigin: '0 0', width: 1920, height: 1080, position: 'relative'}}><Gravura f={f} k={{luz: 0, cores: true, rubi: ease(f, tL, tL + 10), tranca: ease(f, tT, tT + 14), anel: ease(f, tA, tA + 10) * (0.7 + 0.3 * Math.sin(f * 0.3)), janela: ease(f, c2.at, c2.at + 20), envelope: ease(f, c3.at, c3.at + 20), relogio: '22:50'}} /></div><div style={{position: 'absolute', left: 14, top: 12}}><TagSo txt="O CAUSO, EM CORES" fs={26} /></div></div> : null}
    <div style={{position: 'absolute', left: 640, top: 610, zIndex: 12, transform: 'scale(0.8)'}}><Cadeado s={130} f={f} intacto={f >= s0.at - 30} /></div>
    <div style={{position: 'absolute', left: 1640, top: 640, zIndex: 12, transform: 'scale(0.75)'}}><AncoraConta n={n} t={f - c1.end} s={150} f={f} /></div>
    <Flamulas f={f} a={alto} b={alto + 18} n={1} />
  </Sala></Cam>, h: <Hud f={f} rod="S" dia={4} farol={{rod: 'S', passos: passos(D.pac('S', 116))}} />};
};

// ================= I5: toma essa — quinze anos =================
const I5: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.23), c1 = sk(X, X.c, 1, 0.26), c2 = sk(X, X.c, 2, 0.39), c3 = sk(X, X.c, 3, 0.53), c4 = sk(X, X.c, 4, 0.69), s1 = sk(X, X.s, 1, 0.91);
  const reg = c3.end + 10, barco = c4.at - 10, est = c0.at * 0.42;
  const hud = <><Hud f={f} rod="S" dia={4} farol={{rod: 'S', passos: passos(D.pac('S', 119)), aviso: 'SE ERRAR: -2', risco: 1}} /><Estreia titulo="REABRIR O PASSADO" sub="SÓ NO DIA 4 · ERROU, APAGA 2" t={f} dur={est} /></>;
  if (f < c0.at - 10) return {m: <AbsoluteFill><Sala plano="tribuna" f={f} rod="S" quem={{advogada: {cor: 'Azul', humor: 'cinico'}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Verde'}, acusado: {cor: 'Vermelho', humor: 'cinico'}}} /><AbsoluteFill style={{background: '#000a', opacity: ease(f, est - 10, est + 6), zIndex: 70}} /><AbsoluteFill style={{zIndex: 71}}>
    <div style={{position: 'absolute', left: 110, top: 360, opacity: ease(f, est, est + 10), transform: `translateY(${(1 - quique(f, est, 14)) * 200}px)`}}><Rot fs={34} bg="#E4DED2">O CAUSO: “ANEL DOURADO DE ÂNCORA”</Rot></div>
    <div style={{position: 'absolute', left: 640, top: 250, opacity: ease(f, est + 20, est + 30)}}><Mao s={440} f={f} dedo={1} tag="DIA 4: MÍNIMO" tagT={f - est - 30} /></div>
    <div style={{position: 'absolute', left: 1280, top: 330, transform: `scale(${pop(f, est + 50)}) rotate(4deg)`}}><Ficha id="E7" nome={D.ficha('E7').nome} w={420} brilho f={f} tag="FOTO: O RUBI JOVEM COM O ANEL" /></div>
    {[[560, 470], [1220, 470]].map(([x, y], k) => <div key={k} style={{position: 'absolute', left: x, top: y, width: 90, height: 12, background: LUZ, border: `3px solid ${TINTA}`, transform: `scaleX(${ease(f, est + 60 + k * 10, est + 70 + k * 10)})`, transformOrigin: '0 50%'}} />)}
  </AbsoluteFill></AbsoluteFill>, h: hud};
  if (f < reg) return {m: <Cam f={f} k={[[c0.at - 10, 600, 520, 1.1], [c1.end, 960, 540, 1], [c2.at, 1450, 520, 1.12], [c3.end, 1400, 520, 1.08]]}><Sala plano="tribuna" f={f} rod="S" quem={{advogada: {cor: 'Azul', gesto: ease(f, c0.at - 14, c0.at), fala: fala(X, 0, 1), humor: 'bravo'}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Verde'}, acusado: {cor: 'Vermelho', fala: fala(X, 2, 3), humor: 'cinico'}}}>
    <Arpao t={f - (c0.at - 24)} alvoX={1400} y={860} item={D.ficha('E7')} />
    <div style={{position: 'absolute', left: 120, top: 150, zIndex: 30}}><Bandeira t={f - c0.at} ficha={D.ficha('E7')} txt="TOMA ESSA!" /></div>
  </Sala></Cam>, h: hud};
  if (f < barco) return {m: <Liso f={f}><div style={{position: 'absolute', left: 120, top: 100, transform: `scale(${g(0.7, 0.95, ease(f, reg, reg + 30))})`, transformOrigin: '0 0'}}><Registro f={f} titulo="REGISTRO DA SAFIRA" itens={['E4', 'E5', 'E6', 'E7', 'E8', 'R2'].map((id) => ({...D.ficha(id), brilho: id === 'E6', tag: id === 'E6' ? 'DESDE O DIA 3' : undefined, tagSo: id === 'E6', dim: id !== 'E6'}))} w={1300} cols={3} /></div></Liso>, h: hud};
  return {m: <Cam f={f} k={[[barco, 960, 540, 1], [X.dur, 1250, 640, 1.25]]}><Gravura f={f} k={{luz: 0, barco: ease(f, barco, barco + 90), relogio: '22:50'}} /></Cam>, h: hud};
};

// ================= I6: não provado =================
const Relogio2: React.FC<{f: number; s: number}> = ({f, s}) => (
  <svg width={s} height={s} viewBox="0 0 200 200">
    <circle cx={100} cy={100} r={90} fill={PERG} stroke={TINTA} strokeWidth={10} />
    {Array.from({length: 12}).map((_, i) => <path key={i} d={`M${100 + Math.cos((i / 12) * Math.PI * 2) * 74} ${100 + Math.sin((i / 12) * Math.PI * 2) * 74} L${100 + Math.cos((i / 12) * Math.PI * 2) * 84} ${100 + Math.sin((i / 12) * Math.PI * 2) * 84}`} stroke={TINTA} strokeWidth={5} />)}
    <path d={`M100 100 L${100 + Math.cos(-Math.PI / 2 + (50 / 60) * Math.PI * 2) * 70} ${100 + Math.sin(-Math.PI / 2 + (50 / 60) * Math.PI * 2) * 70}`} stroke={VINHO} strokeWidth={9} strokeLinecap="round" />
    <path d={`M100 100 L${100 + Math.cos(-Math.PI / 2) * 70} ${100 + Math.sin(-Math.PI / 2) * 70 + Math.sin(f * 0.3) * 3}`} stroke="#2f6bd8" strokeWidth={9} strokeLinecap="round" />
    <text x={46} y={150} fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill={VINHO}>22:50</text><text x={112} y={64} fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill="#2f6bd8">23:00</text>
  </svg>
);
const I6: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.12), c1 = sk(X, X.c, 1, 0.27), c2 = sk(X, X.c, 2, 0.56);
  const apaga = c2.end + 20;
  const farol = {rod: 'S', passos: passos(D.pac('S', 122), [apaga, D.pac('S', 125)]), placa: {txt: penTxt(X, 'S', 125), at: apaga}};
  const hud = <Hud f={f} rod="S" dia={4} farol={farol} />;
  if (f < c1.at - 6) return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 900, 480, 1.08]]}><Sala plano="promotor" f={f} rod="S" quem={{promotor: {cor: 'Laranja', fala: fala(X, 0), gesto: ease(f, c0.at, c0.at + 16)}}}><div style={{position: 'absolute', left: 1240, top: 160, zIndex: 9, transform: `scale(${pop(f, c0.at - 10)}) rotate(${Math.sin(f * 0.1) * 4}deg)`}}><Relogio2 f={f} s={320} /><div style={{textAlign: 'center'}}><Rot fs={28}>“DUAS HORAS NA MESMA NOITE?”</Rot></div></div></Sala></Cam>, h: hud};
  if (f < c2.end + 14) {
    const pens = f >= c2.at - 6;
    return {m: <Cam f={f} k={[[c1.at - 6, 960, 450, 1], [c1.end, 960, 400, 1.1], [c2.end, 960, 380, 1.16]]}><Sala plano="juiz" f={f} rod="S" quem={{juiz: {cor: 'Roxo', fala: fala(X, 1), humor: pens ? 'cinico' : 'normal'}}}>
      {pens ? <div style={{position: 'absolute', left: 1240, top: 120, zIndex: 20, width: 560, height: 380, background: '#3a2450ee', border: `6px dashed ${LUZ}`, borderRadius: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, c2.at)})`}}><div style={{transform: 'rotate(-4deg)'}}><Ficha id="E6" nome={D.ficha('E6').nome} w={300} f={f} dim tag="SÓ ALEGADA" /></div></div> : null}
    </Sala></Cam>, h: hud};
  }
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 160, top: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${pop(f, c2.end + 14)})`}}><Ficha id="E6" nome={D.ficha('E6').nome} w={420} brilho f={f} /><Carimbo txt="NO BOLSO" tipo="recusada" t={f - c2.end - 30} fs={70} /></div>
    <div style={{position: 'absolute', left: 760, top: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${pop(f, c2.end + 24)})`}}><Ficha id="E7" nome={D.ficha('E7').nome} w={420} f={f} /><Carimbo txt="MOSTRADO" tipo="aceita" t={f - c2.end - 40} fs={70} /></div>
    <div style={{position: 'absolute', left: 1400, top: 200}}><FarolPac rod="S" n={estado(f, farol.passos).n} antes={estado(f, farol.passos).antes} t={estado(f, farol.passos).t} s={300} f={f} rot="SAFIRA" /></div>
  </Liso>, h: null};
};

// ================= I7: absolvida (e o Rubi vai embora na chuva) =================
const I7: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.13), c1 = sk(X, X.c, 1, 0.33), s0 = sk(X, X.s, 0, 0.84);
  const circ = palT(X, 0, 'círculo'), geral = c1.end + 10, sai = geral + (s0.at - geral) * 0.32;
  const hud = <Hud f={f} rod="S" dia={4} farol={{rod: 'S', passos: passos(D.pac('S', 126))}} />;
  if (f < c1.at - 6) return {m: <Cam f={f} k={[[0, 600, 520, 1.1], [circ - 30, 1000, 760, 1.4], [c0.end, 960, 600, 1.1]]}><Sala plano="tribuna" f={f} rod="S" quem={{advogada: {cor: 'Azul', fala: fala(X, 0), gesto: janela(f, circ - 20, circ + 40, 8)}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Verde'}, acusado: {cor: 'Vermelho', humor: 'cinico'}}}>
    <div style={{position: 'absolute', left: 900, top: 760, zIndex: 20}}><Anel s={170} f={f} /><div style={{position: 'absolute', left: -24 + (1 - ease(f, circ - 30, circ)) * -500, top: -24, opacity: ease(f, circ - 40, circ - 20), filter: `drop-shadow(0 0 ${12 * ease(f, circ, circ + 10)}px ${LUZ})`}}><Piso s={218} cor={LUZ} w={5} /></div></div>
    {f > circ + 10 ? <div style={{position: 'absolute', left: 840, top: 980, zIndex: 21, transform: `scale(${pop(f, circ + 10) * 0.6})`, transformOrigin: '0 0'}}><Rot fs={40} bg={LUZ}>ENCAIXOU</Rot></div> : null}
  </Sala></Cam>, h: hud};
  if (f < geral) return {m: <Cam f={f} k={[[c1.at - 6, 960, 450, 1], [c1.end, 960, 400, 1.12]]}><Sala plano="juiz" f={f} rod="S" quem={{juiz: {cor: 'Roxo', fala: fala(X, 1), gesto: ease(f, c1.end - 26, c1.end - 6)}}} /></Cam>, h: hud};
  if (f < sai) return {m: <Cam f={f} k={[[geral, 1300, 600, 1.15], [sai, 1450, 620, 1.25]]}><Sala plano="geral" f={f} rod="S" quem={{juiz: {cor: 'Roxo', exp: 'decisao'}, testemunha: {cor: 'Vermelho', exp: 'frio'}, advogada: {cor: 'Azul', humor: 'feliz'}, re: {cor: 'Rosa', humor: 'feliz'}, promotor: {cor: 'Laranja', humor: 'triste'}, assistente: {cor: 'Verde', humor: 'feliz'}}}>
    <div style={{position: 'absolute', left: 1450, top: 610, zIndex: 20}}><Carimbo txt="ABSOLVIDA" tipo="absolvida" t={f - geral - 8} fs={96} /></div>
  </Sala></Cam>, h: hud};
  const anda = ease(f, sai + 20, X.dur);
  return {m: <AbsoluteFill>
    <Fundo nome="farol_noite" f={f} blur={0.8} luz={0.85} />
    <Chuva f={f} n={90} op={0.55} />
    <div style={{position: 'absolute', left: g(700, 1500, anda), top: 160, transform: `scale(${g(1, 0.55, anda)})`, transformOrigin: '50% 100%', opacity: 1 - ease(f, X.dur - 30, X.dur)}}><RubiGrande exp="frio" h={900} f={f} /></div>
    <AbsoluteFill style={{background: `linear-gradient(100deg, #0000 ${((f % 120) / 120) * 160 - 40}%, ${LUZ}30 ${((f % 120) / 120) * 160 - 22}%, #0000 ${((f % 120) / 120) * 160 - 4}%)`, mixBlendMode: 'screen'}} />
    <div style={{position: 'absolute', left: 120, top: 640}}><Numero txt="2 DE 6" t={f - sai - 10} fs={190} cor={COR.Azul} sub="A SAFIRA TERMINOU COM 2 LUZES" /></div>
  </AbsoluteFill>, h: null};
};

// ================= J1: lado a lado (placar calculado do log) =================
const J1: CenaFn = (X) => {
  const {f, t0, D} = X, s0 = sk(X, X.s, 0, 0.76);
  const st = (R: string) => {
    const ev = D.evs(R);
    const lug = new Set(ev.filter((e) => e.tipo === 'examinar').map((e) => e.local)).size;
    const prov = ev.filter((e) => e.tipo === 'nova_prova').length;
    const conv = ev.filter((e) => e.tipo === 'conversar').length;
    const alto = ev.filter((e) => e.acao === 'pressionar').length;
    const obj = ev.filter((e) => e.acao === 'objecao').length;
    const ok = ev.filter((e) => e.tipo === 'juiz' && e.decisao === 'procede').length;
    const acu = ev.filter((e) => e.acao === 'acusar').length, pas = ev.filter((e) => e.acao === 'passado').length;
    const errC = ev.filter((e) => e.tipo === 'penalidade' && /cadeado/i.test(e.fala ?? '')).length;
    const abre = ev.filter((e) => e.tipo === 'cadeado_quebrado').length;
    const res = D.res(R);
    return [`${lug} DE 8`, `${prov}`, `${conv}`, `${alto}`, `${ok} DE ${obj}`, `${acu}${pas ? ` (+${pas} PASSADO)` : ''}`, `${errC}`, `${abre} DE 5`, `${res.paciencia ?? '?'}`, res.veredito === 're_inocente' ? 'ABSOLVIDA' : 'CONDENADA'];
  };
  const S = st('S'), J = st('J');
  const rot = ['LUGARES EXAMINADOS', 'PROVAS ACHADAS', 'CONVERSAS', 'ALTO LÁ', 'OBJEÇÕES ACEITAS', 'ACUSAÇÕES', 'CADEADO COM PROVA ERRADA', 'CADEADOS ABERTOS', 'PACIÊNCIA NO FIM', 'RESULTADO'];
  const passo = (s0.at - t0 - 40) / (rot.length + 1);
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 180, top: 70, width: 1560, background: '#2a1a10ee', border: `6px solid ${LATAO}`, borderRadius: 18, boxShadow: sombra, padding: '16px 30px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 380px 380px', alignItems: 'center', fontFamily: POP, fontWeight: 800, fontSize: 40, marginBottom: 6}}>
        <div />
        <div style={{display: 'flex', justifyContent: 'center'}}><Pedra cor="Azul" s={120} f={f} busto /></div>
        <div style={{display: 'flex', justifyContent: 'center'}}><Pedra cor="Verde" s={120} f={f} busto /></div>
      </div>
      {rot.map((r, k) => { const at = t0 + 20 + k * passo; const e = ease(f, at, at + 8); const fim = k === rot.length - 1; return (
        <div key={r} style={{display: 'grid', gridTemplateColumns: '1fr 380px 380px', alignItems: 'center', opacity: e, transform: `translateX(${(1 - e) * 120}px)`, borderTop: '2px solid #6d5410', padding: '4px 0'}}>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: fim ? 38 : 30, color: PERG}}>{r}</div>
          {[S[k], J[k]].map((v, j) => <div key={j} style={{textAlign: 'center', fontFamily: fim ? BANG : MONO, fontWeight: 700, fontSize: fim ? 58 : 40, color: fim ? (v === 'ABSOLVIDA' ? LUZ : '#9aa1ab') : COR[j ? 'Verde' : 'Azul'], ...C(fim ? 6 : 0), transform: `scale(${pop(f, at + 4, 10)})`}}>{v}</div>)}
        </div>); })}
      <div style={{marginTop: 8, textAlign: 'center', opacity: ease(f, t0 + 20 + rot.length * passo, t0 + 30 + rot.length * passo)}}><Rot fs={40} bg={LUZ}>O RUBI CONFESSOU? NÃO · NÃO</Rot></div>
    </div>
  </Liso>, h: null};
};

// ================= J2: o que faltou =================
const J2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.59), s1 = sk(X, X.s, 1, 0.87);
  const cad = D.cadeados as any;
  const t1 = 30, t2 = c0.at * 0.4, fora = c0.end + 10;
  if (f < c0.at - 10) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', transform: `scale(${pop(f, 6)})`}}><TagSo txt="SÓ VOCÊ VÊ: O QUE ESTAVA TRANCADO" fs={44} /></div>
    {[['Rosa', 'reu', ['CARTA DO PAI', 'CASACO'], t1], ['Lima', 'pescador', ['JORNAL ANTIGO', 'PÁGINA QUEIMADA'], t2]].map(([cor, key, ch, at], k) => <div key={k} style={{position: 'absolute', left: 90 + k * 900, top: 200, width: 820, display: 'flex', flexDirection: 'column', gap: 16, opacity: ease(f, at as number, (at as number) + 12)}}>
      <div style={{display: 'flex', gap: 10, alignItems: 'flex-start'}}><Retrato cor={cor as string} s={200} f={f} cadeados={2} rot={null} /><Cadeado s={120} f={f} chaves={ch as string[]} chK={ease(f, (at as number) + 14, (at as number) + 26)} /></div>
      <div style={{background: PERG, border: `5px solid ${TINTA}`, borderRadius: 10, boxShadow: sombra, padding: '12px 18px', fontFamily: POP, fontWeight: 700, fontSize: 27, lineHeight: 1.3, color: TINTA, transform: `rotate(${k ? 1.5 : -1.5}deg) scale(${pop(f, (at as number) + 30)})`}}>{String(cad?.[key as string]?.revela?.desc ?? '').replace('{CULPADO}', 'Rubi')}</div>
    </div>)}
  </Liso>, h: null};
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 120, top: 200}}><Recorte cor="Vermelho" txt={D.frase('S', 17, 'peguei dois')} rod="S" dia={1} ref="S#17" t={f - (c0.at - 10)} carimbo={fora - c0.at + 10} w={820} /></div>
    <div style={{position: 'absolute', left: 980, top: 420}}><Recorte cor="Vermelho" txt={X.cita[0]?.texto ?? D.frase('J', 65, 'Usei dois')} rod="J" dia={3} ref="J#65" t={f - c0.at} carimbo={fora - c0.at + 6} w={820} /></div>
    {f > s1.at - 20 ? <div style={{position: 'absolute', left: 560, top: 800, transform: `scale(${pop(f, s1.at - 20)})`}}><Rot fs={40} bg="#E4DED2">NO TRIBUNAL: “NÃO TOQUEI EM NADA”</Rot></div> : null}
  </Liso>, h: null};
};

// ================= J3: os prêmios =================
const J3: CenaFn = (X) => {
  const {f} = X, s0 = sk(X, X.s, 0, 0.8);
  const P: [string, string, string, number, Humor][] = [['Vermelho', 'MENTIROSO DO ANO', 'UM GARÇOM, UM RÁDIO, UM FORNECEDOR E 4 DONOS PRO CÍRCULO', 0.06, 'feliz'], ['Azul', 'DETETIVE DE CENA', '8 DE 8 LUGARES', 0.5, 'feliz'], ['Verde', 'ACERTOU E PERDEU', 'ACUSOU O CULPADO CERTO', 0.6, 'triste'], ['Laranja', 'CORAÇÃO EM PEDAÇOS', 'O PROMOTOR QUE NUNCA PERDEU', 0.68, 'triste'], ['Amarelo', 'TORCEDOR DO ANO', 'LARGOU O POSTO PRA VER A FINAL', 0.76, 'feliz'], ['Lima', 'SÓ A TEMPESTADE', '×14 · CONTOU TUDO JURANDO QUE NÃO VIU', 0.84, 'cinico']];
  return {m: <Liso f={f}>
    {P.map(([cor, tit, sub, fr, hum], k) => { const at = s0.at * fr; const x = 70 + (k % 3) * 610, y = 70 + Math.floor(k / 3) * 480; return f < at ? <div key={cor} style={{position: 'absolute', left: x, top: y, width: 570, height: 440, background: `repeating-linear-gradient(1deg, ${MAD_E} 0 44px, #4e311e 44px 48px)`, border: `6px solid ${TINTA}`, borderRadius: 18, boxShadow: sombra, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, k * 6, k * 6 + 10), transform: `rotate(${(k % 2 ? 1.5 : -1.5)}deg) translateY(${Math.sin(f / 20 + k) * 4}px)`}}><Lacre s={150} rot={Math.sin(f / 25 + k) * 8} /></div> : (
      <div key={cor} style={{position: 'absolute', left: x, top: y, width: 570, height: 440, background: `repeating-linear-gradient(1deg, ${MAD_C} 0 44px, #7b4e2e 44px 48px)`, border: `6px solid ${TINTA}`, borderRadius: 18, boxShadow: sombra, transform: `scale(${quique(f, at, 16)}) rotate(${(k % 2 ? 1.5 : -1.5)}deg)`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 20, top: 30}}><Pedra cor={cor} s={240} f={f} humor={hum} busto /></div>
        <div style={{position: 'absolute', left: 280, top: 30, width: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Lacre s={110} rot={Math.sin(f / 20 + k) * 6} />
          <div style={{fontFamily: BANG, fontSize: 52, lineHeight: 1, textAlign: 'center', color: LUZ, ...C(7)}}>{tit}</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 26, color: '#fff', ...C(4)}}>{NOME[cor].toUpperCase()}</div>
        </div>
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 16, textAlign: 'center'}}><Rot fs={22} rot={0}>{sub}</Rot></div>
      </div>); })}
  </Liso>, h: null};
};

// ================= J4: a lição e a pergunta =================
const J4: CenaFn = (X) => {
  const {f, D} = X, s0 = sk(X, X.s, 0, 0.75), s1 = sk(X, X.s, 1, 0.86);
  const lic = s0.at * 0.12, pag = s0.at * 0.4;
  return {m: <Cam f={f} k={[[0, 960, 540, 1.1], [s0.at, 960, 560, 1], [X.dur, 960, 560, 1.04]]}>
    <Sala plano="geral" f={f} clima="noite" quem={{}} vazio />
    <Chuva f={f} n={70} op={0.5 * (1 - ease(f, s0.at * 0.5, s0.at))} />
    <div style={{position: 'absolute', left: 1330, top: 640, zIndex: 10, transform: `scale(${pop(f, pag)}) rotate(-5deg)`}}><Ficha id="E6" nome={D.ficha('E6').nome} w={260} f={f} tag="“ENGENHEIRO R...”" /></div>
    <div style={{position: 'absolute', left: 300, top: 200, width: 1100, zIndex: 61, opacity: 1 - ease(f, s0.at - 16, s0.at), transform: `translateY(${(1 - quique(f, lic, 16)) * -700}px) rotate(-1deg)`}}>
      <div style={{background: `repeating-linear-gradient(1deg, ${MAD_C} 0 44px, #7b4e2e 44px 48px)`, border: `7px solid ${TINTA}`, borderRadius: 18, boxShadow: sombra, padding: '24px 36px'}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: LUZ}}>O QUE EU APRENDI</div>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: PERG, ...C(5)}}>Pegar o mentiroso na mentira não basta: o juiz só condena com prova.</div>
      </div>
    </div>
    {f > s0.end ? <div style={{position: 'absolute', left: 150, width: 1000, top: 40, zIndex: 62, display: 'flex', justifyContent: 'center', gap: 90}}>{['Azul', 'Verde'].map((cor, i) => <div key={cor} style={{transform: `scale(${pop(f, s0.end + i * 12)})`}}><Retrato cor={cor} rod={i ? 'J' : 'S'} s={230} f={f} humor={i ? 'triste' : 'feliz'} rot={i ? 'ACERTOU E PERDEU' : 'SALVOU A RÉ'} /></div>)}</div> : null}
  </Cam>, h: null};
};

export const CENAS3: Record<string, CenaFn> = {A0, G1, G2, G3, G4, G5, G6, H1, H2, H3, H4, I1, I2, I3, I4, I5, I6, I7, J1, J2, J3, J4};
export {AMBAR, CHUMBO};
