// As cenas do "BOMBANANA! das IAs" no pipeline do canal (roteiro/roteiro_bb.py -> build_timeline_bb.py ->
// timeline_bb.json -> Main). O narrador, as legendas (só palavras difíceis), os memes e os sons vêm do Main; aqui fica
// a cena 3D (uma só, persistente: CenaPersistente no Main) com a câmera cortando para quem fala, e por cima:
//  - fala da IA: caixa branca com cabeça do macaco, nome, empresa e o texto entrando enquanto a voz toca (chat do AU);
//  - pensamento: balão "PENSAMENTO SECRETO" (a voz tem eco no áudio, nunca sussurro);
//  - gesto do Mudo: a visão do Mudo com o manual e depois a figurinha do gesto;
//  - ação do Cego: visão do Cego (contornos) e o close do painel com o selo de fita CERTO / ERROU.
// Sem emoji (regra do canal).
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene, Timeline} from '../types';
import {FONT} from '../theme';
import {Cena3D, camPadrao, misturarCam, cabecaMacaco, Cam, Papel3D, Ator, Lugar3D} from './Cena3Dv2';
import {Figurinha, MaoCego} from './Figurinha';
import {Cronometro, Manual, FiltroContorno, projetar, legendaGesto, COR_PAPEL, NOME_PAPEL} from './Episodio3D';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const sen = Math.sin;
const PAPEIS: Papel3D[] = ['Cego', 'Surdo', 'Mudo'];
const NOMES: Record<string, string> = {claude: 'Claude', gpt: 'GPT', gemini: 'Gemini', grok: 'Grok', deepseek: 'DeepSeek', qwen: 'Qwen', glm: 'GLM', mimo: 'MiMo', mistral: 'Mistral'};
const EMP: Record<string, {nome: string; cor: string; modelo: string}> = {
  claude: {nome: 'Anthropic', cor: '#d97757', modelo: 'Claude Haiku 5.5'}, gpt: {nome: 'OpenAI', cor: '#10a37f', modelo: 'GPT-5.6 Luna'},
  gemini: {nome: 'Google', cor: '#4285f4', modelo: 'Gemini 3.8 Flash'}, grok: {nome: 'xAI', cor: '#6b6b6b', modelo: 'Grok 4.7'},
  deepseek: {nome: 'DeepSeek', cor: '#4d6bfe', modelo: 'DeepSeek V4.1 Flash'}, qwen: {nome: 'Alibaba', cor: '#8b6cff', modelo: 'Qwen 3.8 Flash'},
  glm: {nome: 'Zhipu', cor: '#3d7bff', modelo: 'GLM 5.3 Flash'}, mimo: {nome: 'Xiaomi', cor: '#ff6900', modelo: 'MiMo V2.6 Flash'},
  mistral: {nome: 'Mistral AI', cor: '#fa520f', modelo: 'Mistral Large 4'},
};
const IDDE = (nome: string) => nome.toLowerCase();
const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

type Item = {tipo?: 'gesto' | 'acao'; cor?: string; texto?: string; pensa?: boolean; gesto?: string; at: number; ate: number};
type FaseLog = {inicio: any; rodadas: any[]; fim: any};
const fasesDe = (tl: Timeline) => ((tl as any).data?.fases ?? {}) as Record<string, FaseLog>;

// cabeça do macaco desenhada (ícone da caixa de fala), com o acessório do papel
export const CabecaMacaco: React.FC<{papel: Papel3D; size: number; cor?: string}> = ({papel, size, cor = '#7a4a2c'}) => (
  <svg viewBox="-60 -60 120 120" width={size} height={size}>
    <circle cx={-44} cy={-2} r={17} fill={cor} /><circle cx={-44} cy={-2} r={9} fill="#e8b48a" />
    <circle cx={44} cy={-2} r={17} fill={cor} /><circle cx={44} cy={-2} r={9} fill="#e8b48a" />
    <ellipse cx={0} cy={2} rx={42} ry={40} fill={cor} />
    <path d="M-6,-38 Q2,-58 14,-44 Q6,-42 5,-34 Z" fill="#5e3720" />
    <path d="M-33,8 Q-32,-20 -12,-16 Q0,-23 12,-16 Q32,-20 33,8 Q32,34 0,37 Q-32,34 -33,8 Z" fill="#e8b48a" />
    {papel === 'Cego' ? <rect x={-36} y={-14} width={72} height={16} rx={6} fill="#e8402f" /> : <g><ellipse cx={-14} cy={-5} rx={6} ry={8} fill="#141414" /><ellipse cx={14} cy={-5} rx={6} ry={8} fill="#141414" /></g>}
    <ellipse cx={0} cy={10} rx={6} ry={4} fill="#d8553a" />
    {papel === 'Mudo' ? <g stroke="#e8402f" strokeWidth={6} strokeLinecap="round"><path d="M-14,14 L14,30" /><path d="M14,14 L-14,30" /></g> : <path d="M-11,19 Q0,28 11,19" stroke="#3a2010" strokeWidth={3} fill="none" strokeLinecap="round" />}
    {papel === 'Surdo' ? <g><path d="M-44,-14 Q0,-66 44,-14" stroke="#1d1d22" strokeWidth={7} fill="none" /><circle cx={-46} cy={-2} r={15} fill="#e8402f" /><circle cx={46} cy={-2} r={15} fill="#e8402f" /></g> : null}
  </svg>
);

// caixa de fala (estilo do chat do Among Us do canal): ícone, nome, empresa, papel e o texto entrando com a voz
const CaixaFala: React.FC<{it: Item; papel: Papel3D; f: number}> = ({it, papel, f}) => {
  const id = it.cor!;
  const d = f - it.at;
  const ent = spring({frame: d, fps: 30, config: {damping: 14, stiffness: 170}});
  const sai = interpolate(f, [it.ate + 6, it.ate + 14], [1, 0], cl);
  const txt = it.texto ?? '';
  const n = Math.ceil(interpolate(d, [0, Math.max(10, it.ate - it.at - 6)], [0, txt.length], cl));
  return (
    <div style={{position: 'absolute', left: 260, right: 260, bottom: 54, display: 'flex', gap: 16, alignItems: 'flex-start', opacity: Math.min(ent, sai), transform: `translateY(${(1 - ent) * 40}px)`}}>
      <div style={{flex: 'none', width: 104, height: 104, borderRadius: 16, background: '#fff', border: '4px solid #2a2f3a', display: 'grid', placeItems: 'center', boxShadow: '0 5px 0 #0004'}}><CabecaMacaco papel={papel} size={92} /></div>
      <div style={{flex: 1, background: '#fff', borderRadius: 12, border: '4px solid #2a2f3a', padding: '10px 18px 12px', boxShadow: '0 5px 0 #0004'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#000'}}>
          {NOMES[id] ?? id}
          <span style={{fontSize: 18, padding: '2px 9px', borderRadius: 7, background: EMP[id]?.cor ?? '#555', color: '#fff'}}>{EMP[id]?.nome}</span>
          <span style={{fontSize: 18, padding: '2px 9px', borderRadius: 7, background: COR_PAPEL[papel], color: '#fff'}}>{NOME_PAPEL[papel]}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: txt.length > 120 ? 34 : 38, lineHeight: 1.22, color: '#111'}}>
          {txt.slice(0, n)}<span style={{color: '#0000'}}>{txt.slice(n)}</span>
        </div>
      </div>
    </div>
  );
};

// balão de pensamento secreto (estilo do Among Us 5)
const BalaoPensa: React.FC<{it: Item; papel: Papel3D; f: number}> = ({it, papel, f}) => {
  const id = it.cor!;
  const d = f - it.at;
  const ent = spring({frame: d, fps: 30, config: {damping: 14, stiffness: 170}});
  const sai = interpolate(f, [it.ate + 6, it.ate + 16], [1, 0], cl);
  const txt = it.texto ?? '';
  const n = Math.ceil(interpolate(d, [4, Math.max(12, it.ate - it.at - 4)], [0, txt.length], cl));
  const borda = '#5b3fc4';
  return (
    <div style={{position: 'absolute', left: 380, right: 380, top: 120, opacity: Math.min(ent, sai), transform: `scale(${0.75 + 0.25 * ent})`, transformOrigin: '50% 0%'}}>
      <div style={{boxSizing: 'border-box', padding: '18px 30px 22px', borderRadius: 46, background: '#fffdf2', border: `7px solid ${borda}`, boxShadow: '0 12px 0 rgba(0,0,0,.45)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <CabecaMacaco papel={papel} size={50} />
          <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 24, letterSpacing: 3, color: borda}}>PENSAMENTO SECRETO · {(NOMES[id] ?? id).toUpperCase()}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontStyle: 'italic', fontSize: txt.length > 110 ? 32 : 36, lineHeight: 1.25, color: '#14121c'}}>
          “{txt.slice(0, n)}{n < txt.length ? '' : '”'}
        </div>
      </div>
    </div>
  );
};

// selo de fita (como o ELIMINADO do canal), torto, entra batendo
const Selo: React.FC<{texto: string; cor: string; f: number; rot?: number; top?: number}> = ({texto, cor, f, rot = -6, top = 330}) => {
  const s = spring({frame: f, fps: 30, config: {damping: 10, stiffness: 260}});
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{background: cor, color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 92, letterSpacing: 10, padding: '8px 46px', transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * s})`, opacity: Math.min(1, f / 3), boxShadow: '0 10px 0 #0006', border: '6px solid #fff'}}>{texto}</div>
    </div>
  );
};

type Plano = {ini: number; cam: string; pov?: Papel3D; manual?: string; contorno?: boolean};

// ---------------------------------------------------------------- uma rodada (cena CH do roteiro)
const Rodada: React.FC<{scene: Scene; timeline: Timeline; p: Record<string, any>}> = ({scene, timeline, p}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const F = fasesDe(timeline)[String(p.fase)];
  if (!F) return null;
  const r = F.rodadas[Math.min(p.rodada ?? 0, F.rodadas.length - 1)];
  const ini = F.inicio;
  const time = ini.time as Record<Papel3D, string>;
  const papelDe = (id: string) => (PAPEIS.find((x) => IDDE(time[x]) === id) ?? 'Surdo') as Papel3D;
  const chat: Item[] = (p.chat ?? []) as Item[];
  const dur = scene.duration;
  // planos de câmera: um por item; nos intervalos do narrador, plano aberto
  const ps: Plano[] = [{ini: 0, cam: p.cam ?? (hash(scene.id) % 2 ? 'jogo' : 'geral')}];
  const modAberto = (r.modulos ?? []).find((m: any) => !m.resolvido)?.tipo ?? ini.modulos?.[0]?.tipo ?? 'cabo';
  chat.forEach((it, i) => {
    const k = hash(scene.id + i) % 4;
    if (it.tipo === 'gesto') {
      ps.push({ini: it.at - 18, cam: 'pov:Mudo', pov: 'Mudo', manual: modAberto});
      ps.push({ini: it.at + 8, cam: k % 2 ? 'close:Mudo' : 'meio:Mudo'});
    } else if (it.tipo === 'acao') {
      ps.push({ini: it.at, cam: 'pov:Cego', pov: 'Cego', contorno: true});
      ps.push({ini: it.at + 36, cam: 'painel'});
    } else {
      const pa = papelDe(it.cor!);
      const op: Record<Papel3D, string[]> = {
        Surdo: ['pov:Surdo', 'close:Surdo', 'meio:Surdo', 'ombro:Surdo', 'baixo', 'trilho'],
        Cego: ['close:Cego', 'lado', 'meio:Cego', 'ombro:Cego', 'trilho', 'frente'],
        Mudo: ['close:Mudo', 'meio:Mudo', 'frente', 'lado'],
      };
      const lista = op[pa];
      const c1 = it.pensa ? `close:${pa}` : lista[hash(scene.id + 'c' + i) % lista.length];
      ps.push({ini: it.at, cam: c1, pov: c1.startsWith('pov:') ? pa : undefined});
      // fala longa: corta no meio para outro ângulo (nada de plano parado)
      if (it.ate - it.at > 150) {
        const c2 = it.pensa ? 'lado' : lista[(hash(scene.id + 'c' + i) + 2) % lista.length];
        ps.push({ini: it.at + Math.round((it.ate - it.at) / 2), cam: c2 === c1 ? 'trilho' : c2, pov: c2.startsWith('pov:') ? pa : undefined});
      }
    }
    // depois do item, se vier narrador, volta pro aberto
    const prox = chat[i + 1];
    if (!prox || prox.at - it.ate > 20) ps.push({ini: it.ate + 4, cam: ['jogo', 'geral', 'frente', 'trilho', 'lado'][hash(scene.id + 'n' + i) % 5]});
  });
  ps.sort((a, b) => a.ini - b.ini);
  const pi = ps.reduce((acc, x, i) => (f >= x.ini ? i : acc), 0);
  const pl = ps[pi];
  const df = f - pl.ini;
  let cam: Cam = camPadrao(pl.cam, f);
  cam = {...cam, fov: (cam.fov ?? 45) * (1 - Math.min(1, df / 150) * 0.06)};
  if (pi > 0 && df < 6 && !pl.pov && !ps[pi - 1].pov) cam = misturarCam(camPadrao(ps[pi - 1].cam, f), cam, df / 6);
  const agora = chat.find((it) => f >= it.at && f < it.ate);
  const falando = agora && !agora.tipo && !agora.pensa ? papelDe(agora.cor!) : null;
  const gestoIt = chat.find((it) => it.tipo === 'gesto' && f >= it.at && f < it.ate + 20);
  const acaoIt = chat.find((it) => it.tipo === 'acao');
  const fa = acaoIt ? f - acaoIt.at - 36 : -999;
  const ef = r.efeito ?? {};
  const acaoFeita = acaoIt && fa >= 0;
  const mods = acaoFeita ? r.modulos : (F.rodadas[(p.rodada ?? 0) - 1]?.modulos ?? ini.modulos);
  const erroAgora = acaoFeita && ef.ok === false && fa < 40;
  const errosAntes = (r.erros ?? 0) - (ef.ok === false ? 1 : 0);
  const erros = acaoFeita ? r.erros ?? 0 : errosAntes;
  const atores = {} as Record<Papel3D, Ator>;
  for (const pa of PAPEIS) {
    let gesto = '', tg = 0;
    if (falando === pa) { gesto = 'falar'; tg = agora!.at; }
    if (agora?.pensa && papelDe(agora.cor!) === pa) { gesto = 'pensar'; tg = agora.at; }
    if (pa === 'Mudo' && gestoIt) { gesto = gestoIt.gesto!; tg = gestoIt.at; }
    if (pa === 'Cego' && acaoIt && f >= acaoIt.at && fa < 25) { gesto = 'mexer'; tg = acaoIt.at; }
    if (erroAgora) { gesto = pa === 'Cego' ? 'desespero' : 'susto'; tg = acaoIt!.at + 36; }
    if (acaoFeita && ef.ok === true && fa < 45 && pa === 'Surdo') { gesto = 'comemorar'; tg = acaoIt!.at + 36; }
    atores[pa] = {boca: falando === pa ? 0.25 + 0.75 * Math.abs(sen(f / 2.6)) * (0.6 + 0.4 * sen(f / 7)) : 0, gesto, tg};
  }
  const tremor = erroAgora ? 1 - fa / 40 : 0;
  const resta = (ini.fase.tempo - r.t) - 10 * Math.min(1, f / Math.max(1, dur));
  const contorno = !!pl.contorno;
  const tela = Object.fromEntries(PAPEIS.map((pa) => [pa, projetar(cam, cabecaMacaco(pa), W, H)])) as Record<Papel3D, {x: number; y: number; dentro: boolean}>;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <FiltroContorno />
      <Cena3D estilo={{transform: `translate(${tremor * sen(f * 2.7) * 22}px, ${tremor * sen(f * 3.3) * 14}px)`, filter: contorno ? 'url(#bb-contorno)' : undefined}}
        width={W} height={H} t={f + p.fase * 1000 + (p.rodada ?? 0) * 77} camera={cam} atores={atores} resta={resta} erros={erros} maxErros={ini.fase.erros}
        lugar={ini.fase.lugar as Lugar3D} apagao={r.caos?.apagao ? 1 : 0} alarme={r.caos?.alarme ? 1 : 0} tremor={tremor} modulos={mods}
        foco={r.acao ? Number(r.acao.modulo) - 1 : undefined} pov={pl.pov} contorno={contorno}
        banana={gestoIt?.gesto === 'jogar_banana' ? {de: 'Mudo', para: 'Surdo', k: (f - gestoIt.at - 8) / 22} : undefined} />
      {r.caos?.apagao ? <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #0000 10%, #000c 70%)'}} /> : null}
      {r.caos?.alarme ? <AbsoluteFill style={{background: '#ff1a0a', opacity: 0.1 + 0.08 * sen(f / 3), mixBlendMode: 'screen'}} /> : null}
      {contorno ? (
        <>
          <div style={{position: 'absolute', left: W / 2 - 120 + ((Number(r.acao?.modulo ?? 1) - 1) % 2 ? 130 : -130) + sen(f / 6) * 10, top: H - 330 - Math.min(1, df / 30) * 110}}><MaoCego tam={230} /></div>
          <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, letterSpacing: 6, color: '#fff'}}>VISÃO DO CEGO · {time.Cego.toUpperCase()}</div>
        </>
      ) : null}
      {pl.manual ? <Manual tipo={pl.manual} f={df} /> : null}
      {pl.pov && !contorno && !pl.manual ? (
        <div style={{position: 'absolute', top: 120, left: 40, fontFamily: FONT.display, fontWeight: 900, fontSize: 28, letterSpacing: 4, color: '#fff', background: COR_PAPEL[pl.pov], padding: '6px 16px', borderRadius: 10}}>VISÃO DO {NOME_PAPEL[pl.pov]} · {time[pl.pov].toUpperCase()}</div>
      ) : null}
      {/* etiquetas nos macacos nos planos abertos */}
      {!contorno && !pl.manual && !pl.cam.startsWith('close') ? PAPEIS.filter((pa) => tela[pa].dentro && pa !== pl.pov).map((pa) => (
        <div key={pa} style={{position: 'absolute', left: tela[pa].x, top: Math.max(150, tela[pa].y - 175), transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3}}>
          <div style={{background: '#fff', color: '#000', fontFamily: FONT.display, fontWeight: 900, fontSize: 26, padding: '1px 12px', borderRadius: 8, border: '3px solid #2a2f3a'}}>{time[pa]}</div>
          <div style={{background: COR_PAPEL[pa], color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 15, letterSpacing: 2, padding: '1px 8px', borderRadius: 6}}>{NOME_PAPEL[pa]}</div>
        </div>
      )) : null}
      {gestoIt && f >= gestoIt.at + 8 ? (
        <div style={{position: 'absolute', left: Math.max(60, Math.min(W - 330, tela.Mudo.x + 150)), top: Math.max(150, Math.min(H - 420, tela.Mudo.y - 200)), transform: `scale(${spring({frame: f - gestoIt.at - 8, fps: 30, config: {damping: 10}})})`}}>
          <Figurinha gesto={gestoIt.gesto!} tam={250} />
          <div style={{marginTop: 8, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: '#000c', borderRadius: 10, padding: '4px 10px'}}>{legendaGesto(gestoIt.gesto!)}</div>
        </div>
      ) : null}
      {agora && !agora.tipo && !agora.pensa ? <CaixaFala it={agora} papel={papelDe(agora.cor!)} f={f} /> : null}
      {agora && agora.pensa ? <BalaoPensa it={agora} papel={papelDe(agora.cor!)} f={f} /> : null}
      {acaoFeita && fa < 70 && ef.ok !== null && ef.ok !== undefined ? (
        <>
          {fa < 7 ? <AbsoluteFill style={{background: ef.ok ? '#7dff8a' : '#ff2a1a', opacity: 0.45 * (1 - fa / 7)}} /> : null}
          <Selo texto={ef.ok ? 'CERTO' : 'ERROU'} cor={ef.ok ? '#1f9d47' : '#d4140b'} f={fa} rot={ef.ok ? -5 : 6} />
          <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff', textShadow: '0 4px 0 #000'}}>{String(ef.texto ?? '').replace(/: (certo|errado)$/, '').toUpperCase()}</div>
        </>
      ) : null}
      {!contorno ? <Cronometro resta={resta} erros={erros} maxErros={ini.fase.erros} f={f} /> : null}
      <div style={{position: 'absolute', top: 28, left: 32, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: '#fff', background: '#000a', padding: '4px 14px', borderRadius: 10}}>FASE {p.fase}</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- telas
const atoresParados = (g: Partial<Record<Papel3D, string>> = {}) => Object.fromEntries(PAPEIS.map((pa) => [pa, {boca: 0, gesto: g[pa] ?? '', tg: 0}])) as Record<Papel3D, Ator>;

const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const s = spring({frame: f - 4, fps: 30, config: {damping: 8, stiffness: 120}});
  return (
    <AbsoluteFill>
      <Cena3D width={W} height={H} t={f} camera={camPadrao('orbita', f * 5)} atores={atoresParados({Surdo: 'falar', Cego: 'mexer'})} resta={150} erros={0} maxErros={3} lugar="van" />
      <AbsoluteFill style={{background: 'radial-gradient(circle, #0000 0%, #000a 85%)'}} />
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', transform: `scale(${s}) rotate(-3deg)`}}>
        <span style={{fontFamily: FONT.comic, fontSize: 240, color: '#ffd21f', WebkitTextStroke: '14px #b3220f', paintOrder: 'stroke', textShadow: '0 16px 0 #000a', letterSpacing: 6}}>BOMBANANA!</span>
      </div>
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 54, letterSpacing: 10, color: '#fff', opacity: interpolate(f, [20, 30], [0, 1], cl)}}>9 IAs · 3 MACACOS · 1 BOMBA</div>
    </AbsoluteFill>
  );
};

const Papel: React.FC<{papel: Papel3D}> = ({papel}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const FR: Record<Papel3D, string> = {Cego: 'NÃO VÊ', Surdo: 'NÃO OUVE', Mudo: 'NÃO FALA'};
  const ent = spring({frame: f, fps: 30, config: {damping: 13}});
  const dir = papel !== 'Surdo';
  return (
    <AbsoluteFill>
      <Cena3D estilo={{transform: `translateX(${dir ? -220 : 220}px)`}} width={W} height={H} t={f} camera={{...camPadrao(`close:${papel}`, f), fov: 42 - f * 0.03}} atores={atoresParados({Surdo: 'falar', Mudo: 'mao_parada', Cego: 'cabeca_nao'})} resta={150} erros={0} maxErros={3} lugar="van" />
      <div style={{position: 'absolute', top: -40, bottom: -40, width: 720, [dir ? 'right' : 'left']: -60, background: COR_PAPEL[papel], transform: `translateX(${(1 - ent) * (dir ? 900 : -900)}px) rotate(${dir ? 4 : -4}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: dir ? '14px solid #fff' : undefined, borderRight: dir ? undefined : '14px solid #fff'}}>
        <div style={{fontFamily: FONT.comic, fontSize: 140, color: '#fff', lineHeight: 0.95, textAlign: 'center', transform: `rotate(${dir ? -4 : 4}deg)`, textShadow: '0 10px 0 #0005'}}>UM<br />{FR[papel]}</div>
      </div>
    </AbsoluteFill>
  );
};

const Regras: React.FC<{times?: boolean; timeline: Timeline}> = ({times, timeline}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const fases = fasesDe(timeline);
  const passos = [['SURDO', 'descreve a bomba', '#2f7de8'], ['MUDO', 'acha a regra e gesticula', '#f2b01e'], ['SURDO', 'traduz o gesto', '#2f7de8'], ['CEGO', 'mexe na bomba', '#e8402f']];
  return (
    <AbsoluteFill>
      <Cena3D estilo={{filter: 'blur(4px) brightness(0.6)'}} width={W} height={H} t={f} camera={camPadrao('jogo', f)} atores={atoresParados()} resta={150} erros={0} maxErros={3} lugar="van" />
      {!times ? (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
          {passos.map(([a, b, c], i) => {
            const k = spring({frame: f - i * 12, fps: 30, config: {damping: 12}});
            return (
              <React.Fragment key={i}>
                <div style={{width: 330, padding: '26px 18px', background: '#fff', border: '5px solid #2a2f3a', borderRadius: 18, textAlign: 'center', transform: `scale(${k})`, boxShadow: '0 8px 0 #0006'}}>
                  <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: c as string}}>{a}</div>
                  <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: '#222'}}>{b}</div>
                </div>
                {i < 3 ? <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: '#fff', opacity: k}}>›</div> : null}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 120, right: 120, top: 130, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
          {Object.entries(fases).map(([n, F], i) => {
            const k = spring({frame: f - i * 5, fps: 30, config: {damping: 13}});
            return (
              <div key={n} style={{background: '#fff', border: '4px solid #2a2f3a', borderRadius: 14, padding: '10px 14px', transform: `scale(${k})`, boxShadow: '0 6px 0 #0005'}}>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#222'}}>FASE {n}</div>
                {PAPEIS.map((pa) => <div key={pa} style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 24}}><span style={{background: COR_PAPEL[pa], color: '#fff', fontSize: 15, padding: '1px 7px', borderRadius: 5, width: 62, textAlign: 'center'}}>{NOME_PAPEL[pa]}</span>{F.inicio.time[pa]}</div>)}
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

const LUGAR: Record<string, string> = {van: 'NA VAN', aviao: 'NO AVIÃO', laboratorio: 'NO LABORATÓRIO'};
const NOME_MOD: Record<string, string> = {cabo: 'CABOS', slider: 'SLIDER', direcao: 'SETAS', calculadora: 'CALCULADORA', simbolo: 'SÍMBOLO'};

const Fase: React.FC<{fase: number; timeline: Timeline}> = ({fase, timeline}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const F = fasesDe(timeline)[String(fase)];
  const fz = F.inicio.fase;
  const s = spring({frame: f, fps: 30, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Cena3D estilo={{filter: 'blur(3px) brightness(0.65)'}} width={W} height={H} t={f} camera={camPadrao('orbita', f * 2 + fase * 40)} atores={atoresParados()} resta={fz.tempo} erros={0} maxErros={fz.erros} lugar={fz.lugar as Lugar3D} />
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', transform: `scale(${s})`}}>
        <span style={{fontFamily: FONT.comic, fontSize: 150, color: '#fff', WebkitTextStroke: '10px #1d1530', paintOrder: 'stroke', letterSpacing: 6}}>FASE {fase}</span>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 38, letterSpacing: 6, color: '#ffe066', textShadow: '0 4px 0 #000'}}>{LUGAR[fz.lugar]} · {fz.mods.map((m: string) => NOME_MOD[m] ?? m).join(' + ')} · {Math.floor(fz.tempo / 60)}:{String(fz.tempo % 60).padStart(2, '0')}</div>
      </div>
      <div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
        {PAPEIS.map((pa, i) => {
          const k = spring({frame: f - 10 - i * 7, fps: 30, config: {damping: 12}});
          const id = IDDE(F.inicio.time[pa]);
          return (
            <div key={pa} style={{width: 420, background: '#fff', border: '5px solid #2a2f3a', borderRadius: 18, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', transform: `translateY(${(1 - k) * 600}px)`, boxShadow: '0 8px 0 #0006'}}>
              <CabecaMacaco papel={pa} size={110} />
              <div>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#000'}}>{F.inicio.time[pa]}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 20, color: '#555'}}>{EMP[id]?.modelo}</div>
                <div style={{display: 'inline-block', marginTop: 6, fontFamily: FONT.display, fontWeight: 900, fontSize: 20, letterSpacing: 2, color: '#fff', background: COR_PAPEL[pa], padding: '2px 10px', borderRadius: 7}}>{NOME_PAPEL[pa]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Explosao: React.FC<{fase: number; timeline: Timeline}> = ({fase, timeline}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const F = fasesDe(timeline)[String(fase)];
  const k = Math.min(1.4, f / 40);
  const sh = f < 30 ? (1 - f / 30) * 30 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Cena3D estilo={{transform: `translate(${sen(f * 3) * sh}px, ${sen(f * 2.3) * sh}px)`}} width={W} height={H} t={f} camera={f < 40 ? camPadrao('bomba', f) : camPadrao('jogo', f)}
        atores={atoresParados({Cego: f > 40 ? 'explodiu' : 'susto', Surdo: f > 40 ? 'explodiu' : 'susto', Mudo: f > 40 ? 'explodiu' : 'susto'})} resta={0} erros={F.fim?.erros ?? 0} maxErros={F.inicio.fase.erros}
        lugar={F.inicio.fase.lugar as Lugar3D} explosao={f < 40 ? k : 0.5 + (f - 40) / 200} />
      {f < 6 ? <AbsoluteFill style={{background: '#fff'}} /> : null}
      {f < 70 ? Array.from({length: 22}, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + i, d = interpolate(f, [0, 50], [0, 1100], cl);
        return <div key={i} style={{position: 'absolute', left: W / 2 + Math.cos(a) * d - 90, top: H / 2 + Math.sin(a) * d * 0.7 - 90, width: 180 + (i % 4) * 50, height: 160 + (i % 3) * 50, borderRadius: '50%', background: i % 3 ? '#8f9fd6' : '#ff9a2a', opacity: interpolate(f, [0, 70], [1, 0], cl)}} />;
      }) : null}
      <Selo texto="BOOM" cor="#d4140b" f={f - 2} top={150} />
    </AbsoluteFill>
  );
};

const Vitoria: React.FC<{fase: number; timeline: Timeline}> = ({fase, timeline}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const F = fasesDe(timeline)[String(fase)];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Cena3D width={W} height={H} t={f} camera={camPadrao('orbita', f * 3)} atores={Object.fromEntries(PAPEIS.map((pa, i) => [pa, {boca: 0.5 + 0.5 * Math.abs(sen(f / 3)), gesto: 'comemorar', tg: i * 5}])) as Record<Papel3D, Ator>}
        resta={0} erros={0} maxErros={F.inicio.fase.erros} lugar={F.inicio.fase.lugar as Lugar3D} />
      {Array.from({length: 50}, (_, i) => <div key={i} style={{position: 'absolute', left: (i * 97) % W, top: ((f * (7 + (i % 6))) + i * 61) % (H + 80) - 60, width: 16, height: 28, background: ['#ffd600', '#e53935', '#1e88e5', '#43a047', '#fff'][i % 5], transform: `rotate(${f * 9 + i * 23}deg)`}} />)}
      <Selo texto="DESARMADA" cor="#1f9d47" f={f} top={150} rot={-4} />
    </AbsoluteFill>
  );
};

const Placar: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const fases = fasesDe(timeline);
  return (
    <AbsoluteFill>
      <Cena3D estilo={{filter: 'blur(4px) brightness(0.55)'}} width={W} height={H} t={f} camera={camPadrao('orbita', f * 2)} atores={atoresParados()} resta={0} erros={0} maxErros={3} lugar="laboratorio" />
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, letterSpacing: 8, color: '#fff', textShadow: '0 6px 0 #000'}}>PLACAR FINAL</div>
      <div style={{position: 'absolute', left: 160, right: 160, top: 210, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20}}>
        {Object.entries(fases).map(([n, F], i) => {
          const ok = F.fim?.resultado === 'desarmou';
          const k = spring({frame: f - i * 6, fps: 30, config: {damping: 12}});
          return (
            <div key={n} style={{background: '#fff', border: `6px solid ${ok ? '#1f9d47' : '#d4140b'}`, borderRadius: 16, padding: '12px 16px', transform: `scale(${k})`, boxShadow: '0 6px 0 #0006'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.display, fontWeight: 900, fontSize: 28}}><span>FASE {n}</span><span style={{color: ok ? '#1f9d47' : '#d4140b'}}>{ok ? 'DESARMOU' : 'BOOM'}</span></div>
              <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 22, color: '#333'}}>{PAPEIS.map((pa) => F.inicio.time[pa]).join(' · ')}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const BBVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props, scene, timeline}) => {
  switch (name) {
    case 'BBRodada': return <Rodada scene={scene} timeline={timeline} p={props} />;
    case 'BBAbertura': return <Abertura />;
    case 'BBPapel': return <Papel papel={props.papel} />;
    case 'BBRegras': return <Regras times={props.times} timeline={timeline} />;
    case 'BBFase': return <Fase fase={props.fase} timeline={timeline} />;
    case 'BBExplosao': return <Explosao fase={props.fase} timeline={timeline} />;
    case 'BBVitoria': return <Vitoria fase={props.fase} timeline={timeline} />;
    case 'BBPlacar': return <Placar timeline={timeline} />;
  }
  return null;
};
