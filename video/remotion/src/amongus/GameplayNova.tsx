import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Crewmate, COR} from './Crewmate';
import {ORDEM, papelDe, Partida, salasNoTique, siglaModelo} from './dados';
import {FONT} from '../theme';
import {NAVE, caminho, centroSala} from './nave/mapa';
import {Arte} from './nave/Arte';
import type {Pt, Sala} from './nave/spec';

// Gameplay "estilo Among Us": a nave é uma grade com paredes; cada jogador anda por caminhos
// calculados (A*) em velocidade constante, então ninguém atravessa parede. Tudo sai do log da
// partida: em que sala cada um estava a cada tique, tarefas, dutos, sabotagens e mortes.

const VEL = 7; // px de mundo por quadro (~4 ladrilhos/s)
const MUNDO = {w: NAVE.cols * 48, h: NAVE.rows * 48};

const idx = (cor: string) => ORDEM.indexOf(cor);
const sala = (k: string) => NAVE.salas[k as Sala];

// ponto de descanso do jogador no fim do tique t (varia de tique em tique: eles circulam pela sala)
function descanso(p: Partida, cor: string, t: number): {pt: Pt; sala: string; tarefa: boolean} | null {
  const s = salasNoTique(p, t)[cor];
  if (!s) return null;
  const d = p.tiques[t]?.decisoes.find((x) => x.cor === cor);
  const ds = sala(s.sala);
  const tarefa = !!d && /^(fazer tarefa|fingir que faz tarefa)/.test(d.acao) && d.de === d.para;
  if (tarefa) return {pt: ds.consoles[(idx(cor) + t) % ds.consoles.length], sala: s.sala, tarefa};
  return {pt: ds.spots[(idx(cor) * 3 + t) % ds.spots.length], sala: s.sala, tarefa: false};
}

function comprimento(pts: Pt[]) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}
function aoLongo(pts: Pt[], d: number): {p: Pt; dir: number} {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= seg || i === pts.length - 1) {
      const f = seg ? Math.min(1, d / seg) : 1;
      return {p: {x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f}, dir: Math.sign(b.x - a.x)};
    }
    d -= seg;
  }
  return {p: pts[pts.length - 1], dir: 0};
}

export type Pose = {p: Pt; dir: number; andando: boolean; alpha: number; escala: number; tarefa: boolean; aparente: string};

// posição contínua do jogador; fpt = quadros por tique naquele trecho (para andar em velocidade constante)
export function poseNova(p: Partida, cor: string, tf: number, fpt: number, deTique: number): Pose | null {
  const t0 = Math.floor(tf);
  const t1 = t0 + 1;
  const frac = tf - t0;
  const ini = descanso(p, cor, t0);
  if (!ini) return null;
  const fimSala = salasNoTique(p, t1)[cor];
  const aparente = fimSala?.aparente ?? salasNoTique(p, t0)[cor]?.aparente ?? cor;
  const reuniao = p.reunioes.some((r) => r.tique === t0) && t0 >= deTique;
  if (p.reunioes.some((r) => r.tique === t0 && r.expulso === cor)) return null;
  const inicio: Pt = reuniao ? sala('Refeitorio').spots[idx(cor)] : ini.pt;
  const morte = p.eventos.find((e) => e.tipo === 'morte' && e.tique === t1 && (e.vitima === cor || e.assassino === cor));
  // vítima: anda normalmente e cai na metade do tique
  if (morte?.vitima === cor && frac >= 0.5) return null;

  let destino: Pt;
  let tarefa = false;
  const fim = descanso(p, cor, t1);
  if (morte && morte.assassino === cor) {
    // impostor vai até onde a vítima vai estar e chega um pouco antes da facada
    const v = posVitima(p, morte.vitima, t1, fpt, deTique);
    destino = {x: v.x + 70, y: v.y};
  } else if (fim) {
    destino = fim.pt;
    tarefa = fim.tarefa;
  } else destino = inicio;

  // duto: anda até o duto da sala, afunda; aparece no duto da outra sala
  const duto = p.eventos.find((e) => e.tipo === 'duto' && e.tique === t1 && e.cor === cor);
  if (duto && sala(duto.de).duto && sala(duto.para).duto) {
    const vA = sala(duto.de).duto!;
    const vB = sala(duto.para).duto!;
    if (frac < 0.45) {
      const rota = caminho(inicio, vA);
      const L = comprimento(rota);
      const d = Math.min(L, VEL * fpt * frac);
      const r = aoLongo(rota, d);
      const afunda = d >= L ? Math.min(1, (frac - (L / (VEL * fpt))) / 0.1) : 0;
      return {p: r.p, dir: r.dir, andando: d < L, alpha: 1 - afunda, escala: 1 - 0.5 * afunda, tarefa: false, aparente};
    }
    const sobe = Math.min(1, (frac - 0.45) / 0.12);
    return {p: vB, dir: 0, andando: false, alpha: sobe, escala: 0.5 + 0.5 * sobe, tarefa: false, aparente};
  }

  const rota = caminho(inicio, destino);
  const L = comprimento(rota);
  // velocidade constante; se o caminho não couber em 85% do tique, acelera só o necessário
  const vel = Math.max(VEL, L / Math.max(1, fpt * (morte?.assassino === cor ? 0.42 : 0.85)));
  const d = Math.min(L, vel * fpt * frac);
  const r = aoLongo(rota, d);
  const chegou = d >= L - 0.5;
  return {p: r.p, dir: r.dir, andando: !chegou, alpha: 1, escala: 1, tarefa: chegou && tarefa, aparente};
}

// onde a vítima estará na hora da morte (metade do tique)
function posVitima(p: Partida, cor: string, t1: number, fpt: number, deTique: number): Pt {
  const q = poseNova(p, cor, t1 - 1 + 0.499, fpt, deTique);
  return q ? q.p : centroSala((salasNoTique(p, t1 - 1)[cor]?.sala ?? 'Refeitorio') as Sala);
}

function corposEm(p: Partida, tf: number, fpt: number, deTique: number) {
  const t1 = Math.floor(tf) + 1;
  const frac = tf - Math.floor(tf);
  const out: {cor: string; pt: Pt}[] = [];
  for (const e of p.eventos) {
    if (e.tipo !== 'morte') continue;
    const visivel = e.tique < t1 || (e.tique === t1 && frac >= 0.5);
    const limpo = p.reunioes.some((r) => r.tique >= e.tique && r.tique < Math.floor(tf) + (frac > 0 ? 0 : 0) && r.tique < t1 - (e.tique === t1 ? 1 : 0));
    if (visivel && !limpo) out.push({cor: e.vitima, pt: posVitima(p, e.vitima, e.tique, fpt, deTique)});
  }
  return out;
}

// ---------------------------------------------------------------- relógio (quadro → tique)
export type ChaveTique = {at: number; tick: number};
export function relogio(de: number, ate: number, dur: number, chaves: ChaveTique[] = []) {
  const pts = [{at: 0, tf: de}, ...chaves.map((c) => ({at: c.at, tf: c.tick - 0.5})).filter((c) => c.tf > de && c.tf < ate), {at: Math.max(1, dur), tf: ate - 0.001}].sort((x, y) => x.at - y.at);
  return (f: number) => {
    if (f <= pts[0].at) return pts[0].tf;
    for (let i = 1; i < pts.length; i++) {
      if (f <= pts[i].at) {
        const a = pts[i - 1];
        const b = pts[i];
        return a.tf + ((b.tf - a.tf) * (f - a.at)) / Math.max(1, b.at - a.at);
      }
    }
    return pts[pts.length - 1].tf;
  };
}

// ---------------------------------------------------------------- animação de morte (estilo do jogo)
const CenaMorte: React.FC<{assassino: string; vitima: string; k: number; w: number}> = ({assassino, vitima, k, w}) => {
  const entra = Math.min(1, k / 0.2);
  const golpe = k > 0.25;
  const s = w / 1920;
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.7 * Math.min(1, k * 4)})`, display: 'grid', placeItems: 'center'}}>
      <div style={{position: 'relative', width: 900 * s, height: 420 * s, background: '#6e0b0b', border: `${8 * s}px solid #000`, borderRadius: 30 * s, overflow: 'hidden', transform: `scale(${0.85 + 0.15 * Math.min(1, k * 5)})`}}>
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, #841212 0 ${40 * s}px, #6e0b0b ${40 * s}px ${80 * s}px)`}} />
        <div style={{position: 'absolute', left: (120 + entra * 230) * s, top: 80 * s}}>
          <Crewmate cor={assassino} size={220 * s} anim="andando" passo={k * 4} />
        </div>
        {golpe && <div style={{position: 'absolute', left: 520 * s, top: 120 * s, fontSize: 130 * s, transform: `rotate(${-40 + (k - 0.25) * 140}deg)`}}>🔪</div>}
        <div style={{position: 'absolute', left: 560 * s, top: (golpe ? 150 : 80) * s}}>
          <Crewmate cor={vitima} size={220 * s} morto={golpe} anim={golpe ? undefined : 'susto'} t={k * 30} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- uma "câmera"
type VistaProps = {p: Partida; numero?: number; tfDe: (f: number) => number; w: number; h: number; foco?: string; zoom?: string | null; mostrarPapeis: boolean; deTique: number; hud?: boolean};

const Vista: React.FC<VistaProps> = ({p, numero, tfDe, w, h, foco: focoPedido, zoom, mostrarPapeis, deTique, hud = true}) => {
  const frame = useCurrentFrame();
  const tf = tfDe(frame);
  const fpt = 1 / Math.max(1e-4, tfDe(frame + 1) - tf);
  const t1 = Math.floor(tf) + 1;
  const frac = tf - Math.floor(tf);
  const poses: Record<string, Pose | null> = {};
  for (const cor of ORDEM) poses[cor] = poseNova(p, cor, tf, fpt, deTique);
  const foco = focoPedido && poses[focoPedido] ? focoPedido : undefined;

  // câmera: segue o foco com suavização (média das últimas posições)
  let cam: Pt;
  if (zoom) cam = centroSala(zoom as Sala);
  else if (focoPedido) {
    let sx = 0, sy = 0, n = 0;
    for (let d = 0; d <= 16; d += 4) {
      const tfd = tfDe(frame - d);
      const fp = 1 / Math.max(1e-4, tfDe(frame - d + 1) - tfd);
      const q = poseNova(p, focoPedido, tfd, fp, deTique);
      if (q) { sx += q.p.x; sy += q.p.y; n++ }
    }
    cam = n ? {x: sx / n, y: sy / n} : corposEm(p, tf, fpt, deTique).find((c) => c.cor === focoPedido)?.pt ?? centroSala('Refeitorio');
  } else cam = {x: MUNDO.w / 2, y: MUNDO.h / 2};
  const escala = zoom ? 1.05 : focoPedido ? 1.3 * (w / 1920) : Math.min(w / MUNDO.w, h / MUNDO.h) * 0.98;

  const est = p.tiques[t1]?.estado ?? p.tiques[Math.floor(tf)]?.estado;
  const sab = est?.sabotagem ?? null;
  const luzes = sab?.tipo === 'Luzes';
  const corpos = corposEm(p, tf, fpt, deTique);
  const morte = p.eventos.find((e) => e.tipo === 'morte' && e.tique === t1);
  const salaFoco = foco ? (salasNoTique(p, t1)[foco]?.sala ?? salasNoTique(p, Math.floor(tf))[foco]?.sala) : undefined;
  const veMorte = !!morte && (zoom === morte.sala || salaFoco === morte.sala || foco === morte.assassino || foco === morte.vitima);
  const kMorte = veMorte ? (frac - 0.5) / 0.25 : -1; // começa no instante da morte (impostor já chegou)
  const flash = veMorte ? interpolate(frac, [0.75, 0.78, 0.9], [0, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const raio = (luzes ? 300 : 820) * (w / 1920);

  const mundo: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0',
    transform: `translate(${w / 2 - cam.x * escala}px, ${h / 2 - cam.y * escala}px) scale(${escala})`,
  };
  // ordem de desenho por y (quem está mais embaixo fica na frente)
  const vivos = ORDEM.filter((c) => poses[c]).sort((a, b) => poses[a]!.p.y - poses[b]!.p.y);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      <div style={mundo}>
        <Arte alertaReator={sab?.tipo === 'Reator' ? 0.1 + 0.08 * Math.sin(frame / 4) : 0} />
        {corpos.map((c) => (
          <div key={'c' + c.cor} style={{position: 'absolute', left: c.pt.x - 40, top: c.pt.y - 78}}>
            <Crewmate cor={c.cor} size={80} morto />
          </div>
        ))}
        {vivos.map((cor) => {
          const q = poses[cor]!;
          const info = papelDe(p, cor);
          const imp = mostrarPapeis && info.time === 'impostor';
          const nome = q.aparente !== cor ? `${q.aparente}*` : cor;
          return (
            <div key={cor} style={{position: 'absolute', left: q.p.x - 38, top: q.p.y - 88, opacity: q.alpha, transform: `scale(${q.escala})`, transformOrigin: '50% 100%'}}>
              <div style={{position: 'absolute', left: 8, top: 82, width: 60, height: 14, borderRadius: '50%', background: '#00000055'}} />
              <Crewmate cor={q.aparente} size={76} passo={q.andando ? (frame + idx(cor) * 5) / 9 : 0} anim={q.andando ? 'andando' : q.tarefa ? 'tarefa' : 'parado'} t={frame + idx(cor) * 11} virado={q.dir < 0} />
              <div style={{position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 800, fontSize: 20,
                color: imp ? '#ff5050' : '#fff', WebkitTextStroke: '1px #000', textShadow: '0 2px 0 #000, 0 0 4px #000'}}>
                {nome}
                <span style={{marginLeft: 5, fontSize: 12, padding: '1px 5px', borderRadius: 5, verticalAlign: 'middle', background: siglaModelo(info.modelo) === 'DeepSeek' ? '#2f6bff' : '#d97a47', color: '#fff', WebkitTextStroke: '0', textShadow: 'none'}}>
                  {siglaModelo(info.modelo)}
                </span>
              </div>
              {q.tarefa && (
                <div style={{position: 'absolute', top: -52, left: 4, width: 68, height: 10, background: '#111', border: '2px solid #000', borderRadius: 3}}>
                  <div style={{width: `${Math.min(100, frac * 130)}%`, height: '100%', background: '#43d43b'}} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {focoPedido && !zoom && (
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, transparent ${raio * 0.7}px, rgba(0,0,0,${luzes ? 0.94 : 0.55}) ${raio}px)`}} />
      )}
      {(!focoPedido || zoom) && luzes && <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)'}} />}
      {kMorte > 0 && kMorte < 1 && morte && <CenaMorte assassino={morte.aparente ?? morte.assassino} vitima={morte.vitima} k={kMorte} w={w} />}
      <div style={{position: 'absolute', inset: 0, background: '#ff1e1e', opacity: flash}} />
      {hud && <Hud p={p} tf={tf} frame={frame} numero={numero} />}
    </div>
  );
};

// ---------------------------------------------------------------- HUD: barra de tarefas, sabotagem e "feed" de eventos
const Hud: React.FC<{p: Partida; tf: number; frame: number; numero?: number}> = ({p, tf, frame, numero}) => {
  const t1 = Math.floor(tf) + 1;
  const est = p.tiques[t1]?.estado ?? p.tiques[Math.floor(tf)]?.estado;
  const sab = est?.sabotagem ?? null;
  const tarefas = est ? est.tarefas / est.totalTarefas : 0;
  // eventos recentes (aparecem quando acontecem e somem depois de ~1,5 tique)
  const feed = p.eventos
    .filter((e) => ['morte', 'duto', 'Luzes', 'Reator', 'Comunicações', 'transformacao'].includes(e.tipo))
    .map((e) => ({e, quando: e.tique - 0.5}))
    .filter(({quando}) => tf >= quando && tf < quando + 1.6)
    .slice(-3);
  const texto = (e: any) =>
    e.tipo === 'morte' ? `🔪 ${e.assassino} eliminou ${e.vitima}` : e.tipo === 'duto' ? `🕳️ ${e.cor} entrou no duto` : e.tipo === 'transformacao' ? `🎭 ${e.cor} virou ${e.em}` : `⚡ ${e.cor ?? ''} sabotou: ${e.tipo}`;
  return (
    <>
      <div style={{position: 'absolute', left: 30, top: 24, width: 520}}>
        <div style={{height: 36, background: '#2b2f3c', border: '5px solid #000', borderRadius: 4, overflow: 'hidden', position: 'relative'}}>
          <div style={{width: `${tarefas * 100}%`, height: '100%', background: 'linear-gradient(#5be35a, #34b233)'}} />
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 16, color: '#fff', textShadow: '0 0 4px #000'}}>TAREFAS CONCLUÍDAS</div>
        </div>
        <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>
          <span style={{padding: '3px 12px', background: '#000c', color: '#fff', borderRadius: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 18}}>
            {numero ? `PARTIDA ${numero} · ` : ''}TIQUE {t1}
          </span>
          <span style={{padding: '3px 12px', background: '#7a0000dd', color: '#fff', borderRadius: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 18, display: 'flex', gap: 6, alignItems: 'center'}}>
            🔪 {p.jogadores.filter((j) => j.time === 'impostor').map((j) => `${j.cor} (${siglaModelo(j.modelo)})`).join(' · ')}
          </span>
        </div>
      </div>
      {sab && (
        <div style={{position: 'absolute', left: '50%', top: 26, transform: 'translateX(-50%)', padding: '8px 22px', background: '#b80000', border: '5px solid #000', borderRadius: 10,
          fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#fff', opacity: 0.75 + 0.25 * Math.sin(frame / 3), whiteSpace: 'nowrap'}}>
          ⚠ SABOTAGEM: {sab.tipo.toUpperCase()}
        </div>
      )}
      <div style={{position: 'absolute', right: 30, top: 24, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
        {feed.map(({e, quando}) => (
          <div key={e.tipo + e.tique + (e.cor ?? e.vitima)} style={{padding: '6px 14px', background: '#000b', border: '3px solid #fff4', borderRadius: 10, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: '#fff',
            opacity: interpolate(tf - quando, [0, 0.08, 1.4, 1.6], [0, 1, 1, 0])}}>
            {texto(e)}
          </div>
        ))}
      </div>
    </>
  );
};

const Pensamento: React.FC<{p: Partida; cor: string; texto?: string; mostrarPapeis: boolean; opacidade: number; largura?: number}> = ({p, cor, texto, mostrarPapeis, opacidade, largura = 900}) => {
  if (!texto) return null;
  const info = papelDe(p, cor);
  return (
    <div style={{maxWidth: largura, display: 'flex', gap: 14, alignItems: 'center', padding: '12px 18px', borderRadius: 20, background: '#fffdf2',
      border: `5px solid ${mostrarPapeis && info.time === 'impostor' ? '#d10000' : '#000'}`, boxShadow: '0 8px 0 rgba(0,0,0,.4)', opacity: opacidade}}>
      <Crewmate cor={cor} size={56} />
      <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: '#111'}}>
        <b style={{color: COR[cor].shade}}>💭 {cor}:</b> {texto}
      </div>
    </div>
  );
};

type Props = {p: Partida; numero?: number; deTique: number; ateTique: number; duracao: number; chaves?: ChaveTique[]; pensamentos?: string[]; mostrarPapeis?: boolean; zoom?: string | null};

// Cena de gameplay: uma câmera. Com dois "pensantes", a câmera passa do primeiro para o segundo na metade.
export const GameplayNova: React.FC<Props> = ({p, numero, deTique, ateTique, duracao, chaves, pensamentos = [], mostrarPapeis = true, zoom}) => {
  const frame = useCurrentFrame();
  const tfDe = React.useMemo(() => relogio(deTique, ateTique, duracao, chaves), [deTique, ateTique, duracao, chaves]);
  const tf = tfDe(frame);
  const t1 = Math.floor(tf) + 1;
  const frac = tf - Math.floor(tf);
  const troca = pensamentos.length > 1 && !zoom ? duracao * 0.55 : Infinity;
  const foco = frame < troca ? pensamentos[0] : pensamentos[1];
  const fala = (cor?: string) => (cor ? p.tiques[t1]?.decisoes.find((d) => d.cor === cor)?.pensamento : undefined);
  // na cena com zoom (duas pessoas na mesma sala), mostra o pensamento de quem age naquele tique
  const quemFala = zoom ? pensamentos.find((c) => /matar|duto|sabotar|denunciar/.test(p.tiques[t1]?.decisoes.find((d) => d.cor === c)?.acao ?? '')) ?? pensamentos[0] : foco;
  const papelFoco = foco ? papelDe(p, foco) : undefined;
  const corte = Number.isFinite(troca) ? interpolate(frame, [troca - 6, troca, troca + 6], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill>
      <Vista p={p} tfDe={tfDe} w={1920} h={1080} foco={foco} zoom={zoom} mostrarPapeis={mostrarPapeis} deTique={deTique} numero={numero} />
      {papelFoco && (
        <div style={{position: 'absolute', right: 30, bottom: 30, display: 'flex', gap: 14}}>
          {(papelFoco.time === 'impostor' ? ['MATAR', 'SABOTAR', 'DUTO'] : ['USAR', 'DENUNCIAR']).map((b) => (
            <div key={b} style={{width: 104, height: 104, borderRadius: 16, background: '#ffffff1f', border: '4px solid #ffffffaa', display: 'grid', placeItems: 'center',
              fontFamily: FONT.display, fontWeight: 900, fontSize: 16, color: '#fff', textShadow: '0 0 4px #000'}}>
              {b}
            </div>
          ))}
        </div>
      )}
      <div style={{position: 'absolute', left: 30, bottom: 30, right: 420}}>
        <Pensamento p={p} cor={quemFala ?? ''} texto={fala(quemFala)} mostrarPapeis={mostrarPapeis} opacidade={interpolate(frac, [0, 0.08, 0.92, 1], [0.4, 1, 1, 0.9])} largura={1300} />
      </div>
      <AbsoluteFill style={{background: '#000', opacity: corte, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// Tela dividida "ENQUANTO ISSO…"
export const GameplayNovaDividida: React.FC<Props & {esquerda: string; direita: string}> = ({p, deTique, ateTique, duracao, chaves, esquerda, direita, mostrarPapeis = true}) => {
  const frame = useCurrentFrame();
  const tfDe = React.useMemo(() => relogio(deTique, ateTique, duracao, chaves), [deTique, ateTique, duracao, chaves]);
  const tf = tfDe(frame);
  const t1 = Math.floor(tf) + 1;
  const entra = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  const lado = (cor: string, x: number) => {
    const s = salasNoTique(p, t1)[cor]?.sala ?? salasNoTique(p, Math.floor(tf))[cor]?.sala;
    return (
      <div style={{position: 'absolute', left: x, top: 0, width: 954, height: 1080, overflow: 'hidden'}}>
        <Vista p={p} tfDe={tfDe} w={954} h={1080} foco={cor} mostrarPapeis={mostrarPapeis} deTique={deTique} hud={false} />
        <div style={{position: 'absolute', ...(x === 0 ? {left: 24} : {right: 24}), top: 96, padding: '8px 18px', background: '#000c', border: `4px solid ${COR[cor].body}`, borderRadius: 12,
          fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff'}}>
          {cor}{s ? ` · ${NAVE.salas[s as Sala].nome}` : ''}
        </div>
        <div style={{position: 'absolute', left: 20, right: 20, bottom: 28}}>
          <Pensamento p={p} cor={cor} texto={p.tiques[t1]?.decisoes.find((d) => d.cor === cor)?.pensamento} mostrarPapeis={mostrarPapeis} opacidade={1} largura={914} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - entra) * -200}px)`, opacity: entra}}>{lado(esquerda, 0)}</div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - entra) * 200}px)`, opacity: entra}}>{lado(direita, 966)}</div>
      <div style={{position: 'absolute', left: 954, top: 0, width: 12, height: 1080, background: '#ffd84d'}} />
      <div style={{position: 'absolute', left: '50%', top: 22, transform: 'translateX(-50%)', padding: '8px 26px', background: '#ffd84d', border: '5px solid #000', borderRadius: 14,
        fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#000', whiteSpace: 'nowrap'}}>
        ENQUANTO ISSO…
      </div>
    </AbsoluteFill>
  );
};
