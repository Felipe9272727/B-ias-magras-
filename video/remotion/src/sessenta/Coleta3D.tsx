// 60 Segundos das IAs — a coleta em 3D com câmera em 3ª pessoa (como no jogo): os modelos são feitos no Blender
// (sessenta/blender/*.py --glb → public/sessenta/3d/*.glb) e renderizados aqui com three.js, quadro a quadro.
// O pai anda pela rota exata do registro (sessenta/coleta.mjs); a família em pânico até ser pega; os itens brilham
// com contorno branco; as paredes entre a câmera e o pai abrem um buraco para não tapar a ação.
import React, {useEffect, useMemo, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {FONT} from '../theme';

type Pt = {x: number; y: number};
type Reg = {tique: number; acao: string; tipo: string; de: Pt; para: Pt; rota: Pt[] | null; uids: string[]; maosUids: string[]; tempoMs: number};
type Coisa = {uid: string; id: string; x: number; y: number};
export type DadosColeta3D = {
  semente: string; casa: {itens: Coisa[]; pessoas: {id: string; x: number; y: number}[]; inicio: Pt; abrigo: Pt; alt: number};
  log: Reg[]; fim: {resultado: string; pessoas: string[]; itens: Record<string, number>}; falas?: {registro: number; fala: string}[];
};
type Props = {dados: DadosColeta3D | null; ia: {nome: string; cor: string} | null; arquivo?: string};

export const calcColeta3D: CalculateMetadataFunction<Props> = async ({props}) => {
  const arq = props.arquivo ? `sessenta/partidas/${props.arquivo}.json` : 'sessenta/coleta_teste.json';
  const bruto = await (await fetch(staticFile(arq))).json();
  const dados = bruto.coleta ?? bruto;
  dados.casa.alt = dados.casa.alt ?? 15;
  return {durationInFrames: 30 * (60 + 5), props: {...props, dados, ia: bruto.iaVisual ?? props.ia}};
};

const FPS = 30;
const INTRO = 1.5;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const PESSOAS = ['pai', 'mae', 'filha', 'filho'];

// ---------------------------------------------------------------- modelos (carregados uma vez por aba)
type Pessoa3D = THREE.Group & {mixer?: THREE.AnimationMixer; clipes?: Record<string, THREE.AnimationClip>};
type Modelos = {casa: THREE.Group; pessoas: Record<string, Pessoa3D>; itens: Record<string, THREE.Object3D>};
// personagens: Mini Characters da Kenney (CC0), com esqueleto e animações; altura em metros na cena
const ALTURA: Record<string, number> = {pai: 1.55, mae: 1.45, filha: 1.15, filho: 1.0};
let promessa: Promise<Modelos> | null = null;
function carregar(): Promise<Modelos> {
  if (promessa) return promessa;
  const l = new GLTFLoader();
  const g = (n: string) => l.loadAsync(staticFile(`sessenta/3d/${n}.glb`)).then((r) => r.scene);
  const pessoa = (n: string) => l.loadAsync(staticFile(`sessenta/3d/k_${n}.glb`)).then((r) => {
    const raiz = new THREE.Group() as Pessoa3D;
    const cena = r.scene;
    const caixa = new THREE.Box3().setFromObject(cena);
    cena.scale.setScalar(ALTURA[n] / (caixa.max.y - caixa.min.y));
    raiz.add(cena);
    raiz.mixer = new THREE.AnimationMixer(cena);
    raiz.clipes = Object.fromEntries(r.animations.map((a) => [a.name, a]));
    return raiz;
  });
  promessa = Promise.all([g('casa'), ...PESSOAS.map(pessoa), g('itens')]).then(([casa, ...resto]) => {
    const itensG = resto.pop()!;
    const itens: Record<string, THREE.Object3D> = {};
    for (const c of itensG.children) itens[c.name] = c;
    for (const o of [casa, ...resto]) o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true } });
    return {casa, pessoas: Object.fromEntries(PESSOAS.map((p, i) => [p, resto[i]])), itens};
  });
  return promessa;
}

// buraco nas paredes: descarta o que está perto da linha câmera→pai e acima da cintura (shader injetado)
const U = {uPai: {value: new THREE.Vector3()}, uCam: {value: new THREE.Vector3()}};
function furar(casa: THREE.Group) {
  casa.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (!m || (m as any).__furado) return;
    (m as any).__furado = true;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uPai = U.uPai;
      sh.uniforms.uCam = U.uCam;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMundo;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vMundo;\nuniform vec3 uPai;\nuniform vec3 uCam;').replace(
        'void main() {',
        `void main() {
          vec3 ab = uCam - uPai; float t = clamp(dot(vMundo - uPai, ab) / dot(ab, ab), 0.0, 1.0);
          float d = length(vMundo - (uPai + ab * t));
          if (vMundo.y > 0.35 && t > 0.06 && d < 1.25) discard;`,
      );
    };
  });
}

// posição do pai no instante t (ms de jogo), em casas fracionárias
function estadoPai(log: Reg[], inicio: Pt, t: number) {
  let t0 = 0;
  let pos: Pt = inicio;
  for (const r of log) {
    if (t < r.tempoMs) {
      const k = (t - t0) / Math.max(1, r.tempoMs - t0);
      if (r.rota && r.rota.length > 1) {
        const n = r.rota.length - 1;
        const s = Math.min(n - 1e-6, k * n);
        const i = Math.floor(s);
        const a = r.rota[i], b = r.rota[i + 1];
        return {x: a.x + (b.x - a.x) * (s - i), y: a.y + (b.y - a.y) * (s - i), dx: b.x - a.x, dy: b.y - a.y, andando: true, reg: r};
      }
      return {...pos, dx: 0, dy: 0, andando: false, reg: r};
    }
    t0 = r.tempoMs;
    pos = r.para;
  }
  return {...pos, dx: 0, dy: 0, andando: false, reg: null as Reg | null};
}

// animação do esqueleto: o clipe certo no tempo exato do quadro (determinístico para o render)
const CLIPE = {parado: 'idle', correr: 'sprint', carregar: 'sprint', panico: 'emote-no', andar: 'walk'} as const;
function posar(g: Pessoa3D, anim: keyof typeof CLIPE, s: number, fase = 0) {
  const c = g.clipes?.[CLIPE[anim]] ?? g.clipes?.idle;
  if (!g.mixer || !c) return;
  g.mixer.stopAllAction();
  g.mixer.clipAction(c).play();
  g.mixer.setTime((s + fase) % c.duration);
}

// luz de ambiente de estúdio (reflexos suaves) e tom de cinema (ACES)
const Ambiente: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;
  }, [gl, scene]);
  return null;
};

const Camera: React.FC<{pos: THREE.Vector3; alvo: THREE.Vector3; fov: number}> = ({pos, alvo, fov}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix() }
  camera.position.copy(pos);
  camera.lookAt(alvo);
  camera.updateMatrixWorld();
  return null;
};
// sol com sombra que acompanha o pai (o alvo da luz precisa estar na cena)
const Sol: React.FC<{alvo: THREE.Vector3}> = ({alvo}) => {
  const l = useMemo(() => {
    const d = new THREE.DirectionalLight('#fff3dc', 2.4);
    d.castShadow = true;
    d.shadow.mapSize.set(1024, 1024);
    Object.assign(d.shadow.camera, {left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40});
    d.shadow.bias = -0.0005;
    return d;
  }, []);
  l.position.set(alvo.x - 5, 12, alvo.z + 6);
  l.target.position.set(alvo.x, 0, alvo.z);
  l.target.updateMatrixWorld();
  return (<><primitive object={l} /><primitive object={l.target} /></>);
};

// lista de planos da coleta: abertura, seguir/lateral alternando, close a cada pegada, frente na corrida final, cima no fim
type Plano = {de: number; ate: number; tipo: 'abertura' | 'seguir' | 'lateral' | 'close' | 'frente' | 'cima'};
const cachePlanos = new WeakMap<Reg[], Plano[]>();
function planos(log: Reg[]): Plano[] {
  const c = cachePlanos.get(log);
  if (c) return c;
  const ps: Plano[] = [{de: 0, ate: 3200, tipo: 'abertura'}];
  let t0 = 0;
  for (const r of log) {
    if (r.tipo === 'pegar' && r.tempoMs - t0 >= 400) {
      const meio = t0 + (r.tempoMs - t0) / 2;
      ps.push({de: Math.max(3200, meio - 900), ate: meio + 1300, tipo: 'close'});
    }
    if (r.tipo === 'abrigo' && r.tempoMs > 42000 && r.rota && r.rota.length > 4) ps.push({de: Math.max(3200, t0 + 300), ate: r.tempoMs - 200, tipo: 'frente'});
    t0 = r.tempoMs;
  }
  ps.push({de: 60000, ate: 1e9, tipo: 'cima'});
  // preenche os buracos alternando seguir e lateral (planos de pelo menos 1,6 s; buraco curto vira seguir)
  ps.sort((a, b) => a.de - b.de);
  const fim: Plano[] = [];
  let cur = 0, alterna = 0;
  for (const p of ps) {
    if (p.de < cur) { if (p.ate > cur) fim.push({...p, de: cur}); cur = Math.max(cur, p.ate); continue }
    for (let a = cur; a < p.de; ) {
      const b = p.de - a < 3200 ? p.de : Math.min(p.de, a + 6500);
      fim.push({de: a, ate: b, tipo: alterna++ % 3 === 2 ? 'lateral' : 'seguir'});
      a = b;
    }
    fim.push(p);
    cur = p.ate;
  }
  cachePlanos.set(log, fim);
  return fim;
}
const plano = (ps: Plano[], t: number) => ps.find((p) => t >= p.de && t < p.ate) ?? ps[ps.length - 1];

const mundo = (alt: number, p: Pt, y = 0) => new THREE.Vector3(p.x + 0.5, y, p.y + 0.5 - alt);

const Cena: React.FC<{m: Modelos; d: DadosColeta3D; t: number; s: number}> = ({m, d, t, s}) => {
  const {alt} = d.casa;
  const pai = estadoPai(d.log, d.casa.inicio, Math.min(t, 59999));
  // o que já foi pego / largado / está nas mãos
  const pegos = new Set<string>();
  const largados = new Map<string, Pt>();
  let maos: string[] = [];
  let t0 = 0;
  for (const r of d.log) {
    if (t >= t0 + (r.tempoMs - t0) * 0.5) {
      if (r.tipo === 'pegar') for (const u of r.uids) { pegos.add(u); largados.delete(u) }
      if (r.tipo === 'largar') for (const u of r.uids) largados.set(u, r.para);
      maos = r.maosUids;
    }
    t0 = r.tempoMs;
  }
  const ehPessoa = (u: string) => PESSOAS.includes(u);
  const acabou = t >= 60000;
  const pP = mundo(alt, pai);
  // câmera fixa em orientação, acima e atrás (sul) do pai, com leve atraso
  const atras = estadoPai(d.log, d.casa.inicio, Math.max(0, Math.min(t, 59999) - 250));
  const alvo = mundo(alt, atras).lerp(pP, 0.6);
  // edição: vários planos de câmera escolhidos pelos acontecimentos do registro (corte seco entre eles)
  const pl = plano(planos(d.log), t);
  const tremor = t > 50000 && t < 60000 ? 0.05 * (t - 50000) / 10000 : 0;
  const tr = new THREE.Vector3(tremor * Math.sin(s * 37), tremor * Math.sin(s * 29), 0);
  const frenteP = new THREE.Vector3(pai.dx, 0, pai.dy).normalize();
  if (!pai.dx && !pai.dy) frenteP.set(0, 0, 1);
  let cam: THREE.Vector3;
  let olhar = new THREE.Vector3(alvo.x, 0.6, alvo.z);
  let fov = 46;
  if (pl.tipo === 'abertura') {
    // voo sobre a casa inteira, descendo até o pai
    const k = THREE.MathUtils.smoothstep(t, 0, pl.ate);
    const ang = -0.6 + 0.5 * k;
    const longe = new THREE.Vector3(9.5 + 13 * Math.sin(ang), 13, -7.5 + 13 * Math.cos(ang));
    cam = longe.lerp(new THREE.Vector3(alvo.x, 5, alvo.z + 4.1), k * k);
    olhar = new THREE.Vector3(9.5, 0, -7.5).lerp(olhar, k * k);
  } else if (pl.tipo === 'close') {
    // close lateral quando ele pega alguma coisa
    cam = pP.clone().add(new THREE.Vector3(2.4, 2.5, 2.3));
    olhar = pP.clone().setY(0.7);
    fov = 40;
  } else if (pl.tipo === 'lateral') {
    cam = alvo.clone().add(new THREE.Vector3(4.0, 3.4, 1.4));
    olhar = alvo.clone().setY(0.7);
  } else if (pl.tipo === 'frente') {
    // câmera baixa na frente, ele corre na direção dela (corrida para o abrigo)
    cam = pP.clone().add(frenteP.clone().multiplyScalar(3.3)).setY(2.4);
    olhar = pP.clone().setY(0.8);
    fov = 50;
  } else if (pl.tipo === 'cima') {
    const a = mundo(alt, d.casa.abrigo);
    cam = a.clone().add(new THREE.Vector3(0, 9 + (t - 60000) / 900, 3));
    olhar = a;
  } else {
    cam = new THREE.Vector3(alvo.x, 5.0, alvo.z + 4.1);
  }
  cam.add(tr);
  U.uPai.value.copy(pP).setY(1.0);
  U.uCam.value.copy(cam);
  const yaw = (dx: number, dy: number, padrao = 0) => (dx || dy ? Math.atan2(dx, dy) : padrao);

  const itens = useMemo(() => {
    const r: Record<string, THREE.Object3D> = {};
    for (const it of d.casa.itens) {
      const base = m.itens[it.id];
      if (!base) continue;
      const g = new THREE.Group();
      const c = base.clone(true);
      c.position.set(0, 0, 0);
      g.add(c);
      // contorno branco (casca invertida) como o brilho dos itens no jogo
      const casca = base.clone(true);
      casca.position.set(0, 0, 0);
      casca.scale.multiplyScalar(1.12);
      casca.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: '#ffffff', side: THREE.BackSide}) });
      g.add(casca);
      r[it.uid] = g;
    }
    return r;
  }, [m, d]);
  useMemo(() => furar(m.casa), [m]);

  const levadas = maos.filter(ehPessoa);
  const pilha = maos.filter((u) => !ehPessoa(u));
  const animPai = acabou ? 'parado' : pai.andando ? (pilha.length ? 'carregar' : 'correr') : 'parado';
  posar(m.pessoas.pai, animPai, s);
  m.pessoas.pai.position.copy(pP);
  m.pessoas.pai.rotation.y = yaw(pai.dx, pai.dy, m.pessoas.pai.rotation.y);
  m.pessoas.pai.visible = !(acabou && d.fim.resultado === 'ok');
  for (const pe of d.casa.pessoas) {
    const g = m.pessoas[pe.id];
    if (!g) continue;
    const i = levadas.indexOf(pe.id);
    if (i >= 0) {
      const seg = estadoPai(d.log, d.casa.inicio, Math.max(0, Math.min(t, 59999) - 300 * (i + 1)));
      // segue um pouco de lado (alternando) para não tapar o pai na frente da câmera
      g.position.copy(mundo(alt, seg)).add(new THREE.Vector3((i % 2 ? -1 : 1) * 0.42, 0, 0.1));
      g.rotation.y = yaw(seg.dx, seg.dy, g.rotation.y);
      posar(g, seg.andando ? 'correr' : 'parado', s, i * 0.2);
      g.visible = !acabou;
    } else if (pegos.has(pe.id)) {
      g.visible = false; // já desceu para o abrigo
    } else {
      g.position.copy(mundo(alt, pe));
      g.rotation.y = 0;
      posar(g, 'panico', s, pe.x * 0.13);
      g.visible = true;
    }
  }

  return (
    <>
      <Camera pos={cam} alvo={olhar} fov={fov} />
      <Ambiente />
      <hemisphereLight args={['#ffe9c8', '#4a3a28', 0.55]} />
      <fog attach="fog" args={['#cfe2c4', pl.tipo === 'abertura' || pl.tipo === 'cima' ? 30 : 9, pl.tipo === 'abertura' || pl.tipo === 'cima' ? 60 : 22]} />
      <Sol alvo={alvo} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, -0.07, -7.5]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#5f9a48" />
      </mesh>
      <primitive object={m.casa} />
      {Object.values(m.pessoas).map((g, i) => <primitive key={i} object={g} />)}
      {d.casa.itens.map((it) => {
        const g = itens[it.uid];
        if (!g) return null;
        const chao = largados.get(it.uid);
        const naMao = pilha.indexOf(it.uid);
        if (naMao >= 0 && !acabou) {
          g.position.copy(pP).add(new THREE.Vector3(0, 1.85 + naMao * 0.3, 0));
          g.rotation.y = s * 0.6;
          g.visible = true;
        } else if (pegos.has(it.uid) && !chao) {
          g.visible = false;
        } else {
          g.position.copy(mundo(alt, chao ?? it));
          g.position.y = 0.05 + 0.04 * Math.sin(s * 3 + it.x);
          g.rotation.y = s * 0.8 + it.y;
          g.visible = true;
        }
        return <primitive key={it.uid} object={g} />;
      })}
    </>
  );
};

export const Coleta3D: React.FC<Props> = ({dados, ia}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const [m, setM] = useState<Modelos | null>(null);
  const [h] = useState(() => delayRender('carregando modelos 3D'));
  useEffect(() => { carregar().then((x) => { setM(x); continueRender(h) }) }, [h]);
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  const s = frame / FPS;
  const t = Math.max(0, (s - INTRO) * 1000);
  const acabou = t >= 60000;
  const restante = Math.max(0, Math.ceil((60000 - t) / 1000));
  const urgente = restante <= 10 && !acabou;

  // mãos, abrigo e fala (o HUD é desenhado por cima do 3D)
  let maos: string[] = [];
  let noAbrigo: string[] = [];
  let t0 = 0;
  for (const r of dados.log) {
    if (t >= t0 + (r.tempoMs - t0) * 0.5) {
      if (r.tipo === 'depositar' || r.tipo === 'depositar_tudo') noAbrigo = [...noAbrigo, ...r.uids];
      maos = r.maosUids;
    }
    t0 = r.tempoMs;
  }
  const idDe = (u: string) => dados.casa.itens.find((i) => i.uid === u)?.id ?? u;
  const pai = estadoPai(dados.log, dados.casa.inicio, Math.min(t, 59999));
  const idx = pai.reg ? dados.log.indexOf(pai.reg) : dados.log.length;
  let fala = '';
  for (let i = idx; i >= 0 && dados.falas; i--) {
    const f = dados.falas.find((x) => x.registro === i);
    if (!f?.fala) continue;
    const ti = i > 0 ? dados.log[i - 1].tempoMs : 0;
    if (t - ti < 2200) fala = f.fala;
    break;
  }
  const naoEntrou = acabou && dados.fim.resultado !== 'ok';
  const flash = acabou ? interpolate(t - 60000, [0, 200, 2500], [0, 1, 0.85], cl) : 0;

  return (
    <AbsoluteFill style={{background: '#5f9a48'}}>
      {m && (
        <ThreeCanvas width={width} height={height} dpr={0.7} shadows camera={{fov: 46, near: 0.1, far: 80}} gl={{antialias: true, preserveDrawingBuffer: true}}>
          <Cena m={m} d={dados} t={t} s={s} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{backdropFilter: 'blur(3px)', WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 22%, transparent 78%, #000 100%)', maskImage: 'linear-gradient(to bottom, #000 0%, transparent 22%, transparent 78%, #000 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(30,15,0,0.55) 100%)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{opacity: 0.08, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' seed='${frame % 13}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
      {urgente && <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 + 60 * Math.abs(Math.sin(frame / 6))}px rgba(200,0,0,0.75)`}} />}
      {fala && !acabou && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center'}}>
          <div style={{maxWidth: 1100, padding: '14px 28px', borderRadius: 30, background: '#fff', border: '6px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 42, color: '#111', textAlign: 'center'}}>{fala}</div>
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center'}}>
        <span style={{display: 'inline-block', padding: '6px 34px', borderRadius: 18, background: urgente ? '#b3131b' : '#000c', border: '5px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 84, color: '#fff', letterSpacing: 3, transform: urgente ? `scale(${1 + 0.06 * Math.sin(frame / 2.5)})` : undefined}}>
          0:{String(restante).padStart(2, '0')}
        </span>
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 30, display: 'flex', gap: 10, alignItems: 'flex-end'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#fff', marginRight: 8, WebkitTextStroke: '1.5px #000'}}>MÃOS</div>
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} style={{width: 96, height: 96, borderRadius: 16, background: maos[i] ? '#fffe' : '#0006', border: '5px solid #000', display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 20, textAlign: 'center'}}>
            {maos[i] ? (NOMES[idDe(maos[i])] ?? idDe(maos[i])) : ''}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 30, bottom: 30, padding: '12px 18px', borderRadius: 16, background: '#000b', border: '4px solid #f2c230', fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', maxWidth: 560}}>
        <div style={{color: '#f2c230', fontWeight: 900}}>☢️ NO ABRIGO: {noAbrigo.length}</div>
        <div style={{fontSize: 22, opacity: 0.9}}>{resumo(noAbrigo.map(idDe))}</div>
      </div>
      {ia && <div style={{position: 'absolute', left: 30, top: 34, padding: '8px 18px', borderRadius: 12, background: ia.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{ia.nome}</div>}
      {acabou && <AbsoluteFill style={{background: '#fff8e0', opacity: flash}} />}
      {acabou && t - 60000 > 600 && (
        <AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: naoEntrou ? '#b3131b' : '#222', textAlign: 'center', lineHeight: 1}}>
            {naoEntrou ? 'FICOU DE FORA' : 'BOOM!'}
            <div style={{fontSize: 48, marginTop: 14}}>{naoEntrou ? 'o pai não chegou ao abrigo' : `${dados.fim.pessoas.length} pessoa(s) e ${Object.values(dados.fim.itens).reduce((a, b) => a + b, 0)} itens no abrigo`}</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const NOMES: Record<string, string> = {sopa: 'sopa', agua: 'água', radio: 'rádio', mapa: 'mapa', mascara: 'máscara', kit: 'kit médico', rifle: 'rifle', machado: 'machado', lanterna: 'lanterna', cadeado: 'cadeado', inseticida: 'inseticida', mala: 'mala', baralho: 'baralho', damas: 'damas', gaita: 'gaita', manual: 'manual', municao: 'munição', mae: 'Celeste', filha: 'Juju', filho: 'Tico'};
function resumo(ids: string[]) {
  const c: Record<string, number> = {};
  for (const i of ids) c[i] = (c[i] ?? 0) + 1;
  return Object.entries(c).map(([k, n]) => (n > 1 ? `${n}× ${NOMES[k] ?? k}` : NOMES[k] ?? k)).join(' · ') || '—';
}
