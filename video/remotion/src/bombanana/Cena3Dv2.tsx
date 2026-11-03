// BOMBANANA! em 3D, versão 2: a sala da folha de referência (bombanana/blender/sala2.py -> bb/3d/sala2.glb), a bomba
// (bomba2.glb: maleta cinza, tela verde 'lcd', painel azul) na mesa hexagonal do centro e os três macacos de vinil
// (macaco3.py -> bb/3d/macaco3_<papel>.glb), sentados nos banquinhos como no jogo. Os macacos são animados pelos ossos
// (quadril, coluna, cabeca, braco/mao/polegar .L/.R) mirando cada braço numa direção no espaço do macaco, então a pose
// não depende do "roll" dos ossos do Blender. three.js quadro a quadro (determinístico: tudo vem de t).
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {renderToStaticMarkup} from 'react-dom/server';
import {PainelModulos, Modulo} from './Bomba';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Papel3D = 'Cego' | 'Surdo' | 'Mudo';
// gesto: '' | polegar_cima | polegar_baixo | dedos:N | apontar:dir | apontar_banana:cor | mao_parada | repetir |
//        cabeca_sim | cabeca_nao | tapa | jogar_banana | mexer (Cego na bomba) | comemorar | desespero | explodiu | falar
export type Ator = {boca: number; gesto: string; tg?: number; olhar?: number};
export type Cam = {pos: [number, number, number]; alvo: [number, number, number]; fov?: number; roll?: number};
export type Lugar3D = 'van' | 'aviao' | 'laboratorio';

// ---------------------------------------------------------------- posições (Blender (x, y, z) -> three (x, z, -y))
const B = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y);
export const MESA = B(0, 0, 0.76);
const ASSENTO: Record<Papel3D, [number, number]> = {Cego: [-0.56, -0.98], Surdo: [0.56, -0.98], Mudo: [0, 0.98]};  // Cego e Surdo lado a lado, Mudo na frente
export const ESCALA_MACACO = 1.0;
export const posMacaco = (p: Papel3D) => {
  const [x, y] = ASSENTO[p];
  return B(x, y, 0.36);
};
const rotMacaco = (p: Papel3D) => {
  const m = posMacaco(p);
  // o macaco olha para +Z no próprio espaço; gira em Y até olhar para o outro lado da mesa (um pouco para o centro)
  return Math.atan2((MESA.x - m.x) * 0.5, MESA.z - m.z);
};
// ponto da cabeça de cada macaco (para mirar câmeras e prender balões)
export const cabecaMacaco = (p: Papel3D) => posMacaco(p).clone().add(new THREE.Vector3(0, 0.82 * ESCALA_MACACO, 0));

// ---------------------------------------------------------------- carregamento (uma vez por arquivo)
const cache: Record<string, Promise<THREE.Group>> = {};
const carregar = (arq: string) => (cache[arq] ??= new GLTFLoader().loadAsync(staticFile(`bb/3d/${arq}`)).then((g) => g.scene));

function prepararMacaco(g: THREE.Group) {
  if (g.userData.pronto) return g;
  g.userData.pronto = true;
  g.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true; c.receiveShadow = true; c.frustumCulled = false;
      if (c.material) {
        c.material.roughness = Math.max(0.6, c.material.roughness ?? 0.7); c.material.metalness = 0;
        // pelo mais marrom e menos laranja (como os macacos do jogo)
        if (['pelo', 'pele_pintada', 'topete'].includes(c.material.name)) c.material.color.multiply(new THREE.Color('#b9967f'));
      }
    }
    if (c.isBone) c.userData.rest = c.quaternion.clone();
  });
  g.updateMatrixWorld(true);
  // boca aberta: elipse escura presa no osso da cabeça, no lugar do sorriso (escala = quanto abre)
  const boca = g.getObjectByName('boca') as THREE.Mesh | undefined;
  const cab = g.getObjectByName('cabeca')!;
  if (boca) {
    const bb = new THREE.Box3().setFromObject(boca);
    const c = bb.getCenter(new THREE.Vector3());
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshStandardMaterial({color: '#4a1010', roughness: 0.8}));
    m.scale.set(0.055, 0.001, 0.012); m.position.set(c.x, c.y + 0.004, bb.max.z - 0.004); m.name = 'boca_aberta';
    g.add(m); cab.attach(m); m.userData.esc = m.scale.clone();
    const lingua = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), new THREE.MeshStandardMaterial({color: '#e2546a', roughness: 0.7}));
    lingua.scale.set(0.6, 0.5, 0.6); lingua.position.set(0, -0.45, 0.2); m.add(lingua);
  }
  return g;
}

// ---------------------------------------------------------------- poses
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _a = new THREE.Vector3(), _b = new THREE.Vector3();

// gira o osso para que o segmento osso->filho aponte para dir (no espaço do macaco), com peso p
function mirar(raiz: THREE.Object3D, osso: THREE.Object3D, filho: THREE.Object3D, dir: THREE.Vector3, p = 1) {
  raiz.updateMatrixWorld(true);
  osso.getWorldPosition(_a); filho.getWorldPosition(_b);
  const atual = _b.sub(_a).normalize();
  raiz.getWorldQuaternion(_q2);
  const alvo = dir.clone().applyQuaternion(_q2).normalize();
  const delta = new THREE.Quaternion().setFromUnitVectors(atual, alvo);
  const mundo = osso.getWorldQuaternion(new THREE.Quaternion());
  const novoMundo = delta.multiply(mundo);
  const paiQ = osso.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
  const local = paiQ.multiply(novoMundo);
  osso.quaternion.slerp(local, p);
}
// gira o osso em torno de um eixo do espaço do macaco
function girar(raiz: THREE.Object3D, osso: THREE.Object3D, eixo: THREE.Vector3, ang: number) {
  raiz.updateMatrixWorld(true);
  raiz.getWorldQuaternion(_q2);
  const e = eixo.clone().applyQuaternion(_q2).normalize();
  const delta = new THREE.Quaternion().setFromAxisAngle(e, ang);
  const mundo = osso.getWorldQuaternion(new THREE.Quaternion());
  const paiQ = osso.parent!.getWorldQuaternion(new THREE.Quaternion()).invert();
  osso.quaternion.copy(paiQ.multiply(delta.multiply(mundo)));
}

type Pose = {L: THREE.Vector3; R: THREE.Vector3; maoL?: THREE.Vector3; maoR?: THREE.Vector3; nod: number; vira: number; tomba: number; inclina: number; pulo: number};
const sen = Math.sin;
// direções no espaço do macaco: +Z = frente (para a mesa), +Y = cima, +X = lado do braço .R
function pose(gesto: string, t: number, papel: Papel3D): Pose {
  const [g, v] = gesto.split(':');
  const resp = sen(t / 22) * 0.04;
  const base: Pose = {L: V(-0.45, -0.85, 0.35), R: V(0.45, -0.85, 0.35), nod: resp * 0.6, vira: 0, tomba: sen(t / 37) * 0.03, inclina: 0.05, pulo: 0};
  const lado = (d: string) => (d === 'direita' ? -1 : 1);  // direita do macaco = -X
  switch (g) {
    case 'falar': return {...base, L: V(-0.5 + sen(t / 5) * 0.15, -0.45 + sen(t / 4) * 0.2, 0.7), R: V(0.5 + sen(t / 6) * 0.12, -0.5 + sen(t / 4.6 + 1) * 0.22, 0.7), nod: sen(t / 3.2) * 0.06, vira: sen(t / 11) * 0.12};
    case 'mexer': return {...base, L: V(-0.22 + sen(t / 3) * 0.05, -0.55 + sen(t / 2.4) * 0.07, 0.85), R: V(0.22 + sen(t / 2.7) * 0.05, -0.55 + sen(t / 2.2 + 2) * 0.07, 0.85), nod: 0.28, inclina: 0.3, vira: sen(t / 9) * 0.1};
    case 'polegar_cima': return {...base, R: V(0.35, 0.25, 0.9), maoR: V(0, 1, 0.2), nod: -0.08};
    case 'polegar_baixo': return {...base, R: V(0.35, 0.1, 0.95), maoR: V(0, -1, 0.2), nod: 0.1};
    case 'dedos': return {...base, R: V(0.35, 0.75, 0.55), maoR: V(0.1, 1, 0.1), nod: -0.1};
    case 'apontar': {
      const d: Record<string, THREE.Vector3> = {cima: V(0.15, 1, 0.15), baixo: V(0.1, -0.5, 1), esquerda: V(1, 0.15, 0.35), direita: V(-1, 0.15, 0.35)};
      const dir = d[v] ?? V(0, 0, 1);
      return lado(v) < 0 ? {...base, L: dir, maoL: dir} : {...base, R: dir, maoR: dir};
    }
    case 'apontar_banana': return {...base, R: V(0.6, 0.45, -0.6), maoR: V(0.6, 0.45, -0.6), vira: 0.6, nod: -0.15};
    case 'mao_parada': return {...base, L: V(-0.2, 0.35, 0.95), R: V(0.2, 0.35, 0.95), maoL: V(0, 1, 0.2), maoR: V(0, 1, 0.2), nod: -0.05};
    case 'repetir': return {...base, R: V(0.35 + sen(t / 2.5) * 0.25, 0.55 + Math.cos(t / 2.5) * 0.25, 0.7)};
    case 'cabeca_sim': return {...base, nod: sen(t / 2.4) * 0.3};
    case 'cabeca_nao': return {...base, vira: sen(t / 2.4) * 0.45};
    case 'tapa': { const k = Math.min(1, ((t % 24) / 8)); return {...base, R: V(0.9 - k * 1.6, 0.6 - k * 0.5, 0.5), vira: -0.4}; }
    case 'jogar_banana': { const k = Math.min(1, (t % 40) / 12); return {...base, R: V(0.3, 1 - k * 0.9, -0.5 + k * 1.5), nod: -0.1}; }
    case 'comemorar': return {...base, L: V(-0.45, 0.9, 0.15), R: V(0.45, 0.9, 0.15), nod: -0.25 + sen(t / 2.5) * 0.08, vira: sen(t / 4) * 0.15, pulo: Math.abs(sen(t / 3.2)) * 0.12};
    case 'desespero': return {...base, L: V(-0.35, 0.95, 0.05), R: V(0.35, 0.95, 0.05), nod: 0.15 + sen(t / 2) * 0.03, vira: sen(t / 1.6) * 0.18};
    case 'explodiu': return {...base, L: V(-0.9, -0.2, -0.2), R: V(0.9, -0.2, -0.2), nod: -0.35, tomba: 0.25, inclina: -0.25};
    case 'pensar': return {...base, R: V(0.25, 0.55, 0.8), maoR: V(-0.3, 1, 0.3), vira: 0.25, tomba: 0.12, nod: -0.1};
    case 'susto': return {...base, L: V(-0.75, 0.3, 0.4), R: V(0.75, 0.3, 0.4), nod: -0.2, pulo: 0.06};
  }
  if (papel === 'Mudo') return {...base, L: V(-0.3, -0.3, 0.9), R: V(0.4, -0.75, 0.45), nod: 0.22};  // lendo o manual
  return base;
}

const Macaco: React.FC<{g: THREE.Group; papel: Papel3D; ator: Ator; t: number; sujo: number}> = ({g, papel, ator, t, sujo}) => {
  const raiz = g;
  // volta ao repouso e aplica a pose deste quadro
  raiz.traverse((c: any) => { if (c.isBone && c.userData.rest) c.quaternion.copy(c.userData.rest); });
  const p0 = posMacaco(papel);
  const tg = t - (ator.tg ?? 0);
  const p = pose(ator.gesto, tg, papel);
  raiz.position.set(p0.x, p0.y + p.pulo, p0.z);
  raiz.rotation.set(0, rotMacaco(papel) + (ator.olhar ?? 0), 0);
  raiz.scale.setScalar(ESCALA_MACACO);
  const n = (x: string) => raiz.getObjectByName(x)!;
  const entra = Math.min(1, tg / 6);  // 0,2 s para chegar na pose (sem estalo)
  girar(raiz, n('coluna'), V(1, 0, 0), p.inclina * entra);
  girar(raiz, n('coluna'), V(0, 0, 1), p.tomba * entra);
  girar(raiz, n('cabeca'), V(1, 0, 0), p.nod * entra);
  girar(raiz, n('cabeca'), V(0, 1, 0), p.vira * entra);
  mirar(raiz, n('bracoL'), n('maoL'), p.L, entra);
  mirar(raiz, n('bracoR'), n('maoR'), p.R, entra);
  const pL = n('maoL').children.find((c: any) => c.isBone) ?? n('polegarL');
  const pR = n('maoR').children.find((c: any) => c.isBone) ?? n('polegarR');
  if (p.maoL && pL) mirar(raiz, n('maoL'), pL, p.maoL, entra);
  if (p.maoR && pR) mirar(raiz, n('maoR'), pR, p.maoR, entra);
  // boca (fala) e piscada
  const ba = raiz.getObjectByName('boca_aberta');
  if (ba) {
    const e = ba.userData.esc as THREE.Vector3;
    const a = Math.max(0, Math.min(1, ator.boca));
    ba.visible = a > 0.03;
    ba.scale.set(e.x * (0.7 + 0.3 * a), 0.001 + 0.03 * a, e.z);
  }
  const pisca = (t + papel.length * 37) % 110 < 4 ? 0.1 : 1;
  for (const o of ['olho_L', 'olho_R']) { const ol = raiz.getObjectByName(o); if (ol) ol.scale.set(1, pisca, 1); }
  // fuligem depois da explosão
  raiz.traverse((c: any) => {
    if (c.isMesh && c.material) {
      if (!c.userData.cor0) c.userData.cor0 = c.material.color.clone();
      c.material.color.copy(c.userData.cor0).lerp(new THREE.Color('#1a1210'), sujo * 0.75);
    }
  });
  return <primitive object={raiz} />;
};

// ---------------------------------------------------------------- texturas da bomba
const canvasCache: Record<string, THREE.CanvasTexture> = {};
function texLCD(resta: number, erros: number, maxErros: number, alerta: boolean) {
  const txt = `${String(Math.floor(Math.max(0, resta) / 60)).padStart(2, '0')}:${String(Math.max(0, Math.floor(resta % 60))).padStart(2, '0')}`;
  const chave = `${txt}|${erros}|${maxErros}|${alerta}`;
  if (canvasCache[chave]) return canvasCache[chave];
  const c = document.createElement('canvas'); c.width = 512; c.height = 340;
  const x = c.getContext('2d')!;
  x.fillStyle = alerta ? '#3a0d0d' : '#123a12'; x.fillRect(0, 0, 512, 340);
  x.strokeStyle = '#ffffff22'; for (let i = 0; i < 340; i += 6) { x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
  x.fillStyle = alerta ? '#ff5a4f' : '#8dff6a'; x.font = 'bold 170px JetBrains Mono, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(txt, 256, 140);
  for (let i = 0; i < maxErros; i++) {
    x.font = 'bold 90px sans-serif'; x.fillStyle = i < erros ? '#ff3b30' : '#ffffff30';
    x.fillText('X', 256 + (i - (maxErros - 1) / 2) * 100, 275);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false;
  return (canvasCache[chave] = t);
}

const texSVG: Record<string, THREE.Texture> = {};
const pendente: Record<string, number> = {};  // svg -> handle do delayRender
function texturaModulos(modulos: Modulo[] | undefined, foco: number | undefined, avisar: () => void): {tex: THREE.Texture | null; svg: string} {
  if (!modulos?.length) return {tex: null, svg: ''};
  const svg = renderToStaticMarkup(<PainelModulos modulos={modulos} foco={foco} />);
  if (texSVG[svg]) return {tex: texSVG[svg], svg};
  if (pendente[svg] === undefined) {
    pendente[svg] = delayRender('textura dos módulos');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 683;
      const x = c.getContext('2d')!; x.fillStyle = '#1c1715'; x.fillRect(0, 0, c.width, c.height);
      const k = Math.min(c.width / img.width, c.height / img.height);
      x.drawImage(img, (c.width - img.width * k) / 2, (c.height - img.height * k) / 2, img.width * k, img.height * k);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.flipY = false;
      texSVG[svg] = t; avisar();
      // garante que o quadro é liberado mesmo se o componente já trocou de módulos
      setTimeout(() => { if (pendente[svg] >= 0) { const h = pendente[svg]; pendente[svg] = -1; continueRender(h); } }, 400);
    };
    img.onerror = () => { if (pendente[svg] >= 0) { continueRender(pendente[svg]); pendente[svg] = -1; } };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  return {tex: null, svg};
}

const Bomba: React.FC<{g: THREE.Group; resta: number; erros: number; maxErros: number; t: number; tremor: number; modulos?: Modulo[]; foco?: number; contorno?: boolean}> = ({g, resta, erros, maxErros, t, tremor, modulos, foco, contorno}) => {
  const [v, forca] = useState(0);
  const {advance} = useThree();
  const {tex: texM, svg} = texturaModulos(modulos, foco, () => forca((x) => x + 1));
  useEffect(() => {
    // textura nova chegou: aplica, redesenha e só então libera o quadro
    if (texM && pendente[svg] !== undefined && pendente[svg] >= 0) {
      const h = pendente[svg]; pendente[svg] = -1;
      advance(performance.now());
      requestAnimationFrame(() => { advance(performance.now()); continueRender(h); });
    }
  }, [texM, svg, v, advance]);
  // materiais fixos (um por bomba), só a textura troca
  const mats = useMemo(() => ({
    painel: new THREE.MeshStandardMaterial({roughness: 0.7, color: '#ffffff', emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35}),
    painelVazio: new THREE.MeshStandardMaterial({roughness: 0.7, color: '#3a3433'}),
    lcd: new THREE.MeshBasicMaterial({toneMapped: false}),
  }), []);
  const painel = g.getObjectByName('painel') as THREE.Mesh | undefined;
  if (painel) {
    if (texM) {
      if (mats.painel.map !== texM) { mats.painel.map = texM; mats.painel.emissiveMap = texM; mats.painel.needsUpdate = true; }
      painel.material = mats.painel;
    } else painel.material = mats.painelVazio;
  }
  const lcd = g.getObjectByName('lcd') as THREE.Mesh;
  if (lcd) lcd.visible = !contorno;  // o Cego não lê telas
  const alerta = resta <= 30 && Math.floor(t / 8) % 2 === 0;
  const tex = texLCD(resta, erros, maxErros, alerta);
  if (lcd) {
    if (mats.lcd.map !== tex) { mats.lcd.map = tex; mats.lcd.needsUpdate = true; }
    lcd.material = mats.lcd;
  }
  g.position.set(sen(t * 2.1) * 0.01 * tremor, Math.abs(sen(t * 1.7)) * 0.012 * tremor, 0);
  g.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  const pino = g.getObjectByName('bomba_pino_botao') as THREE.Mesh | undefined;
  if (pino) (pino.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(Math.floor(t / 15) % 2 ? '#ff2020' : '#300000');
  return <primitive object={g} />;
};

// ---------------------------------------------------------------- sala (troca as cores conforme o lugar)
const COR_LUGAR: Record<Lugar3D, {parede: string; parede2: string; teto: string; chao: string; ceu: string}> = {
  van: {parede: '#16254f', parede2: '#22398a', teto: '#2e2d52', chao: '#23252f', ceu: '#d6f1ff'},
  aviao: {parede: '#c9d0de', parede2: '#9aa7c2', teto: '#e4e8f0', chao: '#3c4558', ceu: '#9fd4ff'},
  laboratorio: {parede: '#1d4a43', parede2: '#2c6b60', teto: '#2a3f3c', chao: '#2b3236', ceu: '#b9fff0'},
};
const Sala: React.FC<{g: THREE.Group; lugar: Lugar3D}> = ({g, lugar}) => {
  useMemo(() => {
    const c = COR_LUGAR[lugar];
    g.traverse((o: any) => {
      if (!o.isMesh) return;
      o.receiveShadow = true; o.castShadow = !/^(parede|teto|piso|canto_teto|nervura|janela|painel_baixo|friso|parabrisa)/.test(o.name);
      const m = o.material as THREE.MeshStandardMaterial;
      if (!m) return;
      if (!o.userData.mat0) { o.material = m.clone(); o.userData.mat0 = true; }
      const mm = o.material as THREE.MeshStandardMaterial;
      if (mm.name === 'van_parede') mm.color.set(c.parede);
      if (mm.name === 'van_painel') mm.color.set(c.parede2);
      if (mm.name === 'van_teto') mm.color.set(c.teto);
      if (mm.name === 'van_piso') mm.color.set(c.chao);
      if (mm.name === 'vidro_fosco') { mm.color.set(c.ceu); mm.emissive.set(c.ceu); mm.emissiveIntensity = 0.55; }
      if (mm.name === 'luz') { mm.emissive.set('#ffe2a0'); mm.emissiveIntensity = 3; }
    });
  }, [g, lugar]);
  return <primitive object={g} />;
};

// ---------------------------------------------------------------- luz, câmera e efeitos
const Ambiente: React.FC<{t: number; apagao: number; alarme: number; flash: number}> = ({t, apagao, alarme, flash}) => {
  const {scene, gl} = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [scene, gl]);
  const luz = 1 - apagao * 0.85;
  scene.environmentIntensity = 0.35 * (1 - apagao * 0.9);
  gl.toneMappingExposure = 1.0 - apagao * 0.45;
  const sirene = alarme ? (0.5 + 0.5 * sen(t / 3)) : 0;
  return (
    <>
      <hemisphereLight args={['#dfe6ff', '#4a4060', 1.1 * luz]} />
      <ambientLight intensity={0.35 * luz} />
      <pointLight position={[MESA.x, 2.05, MESA.z]} intensity={9 * luz + flash * 60} distance={8} decay={1.6} color="#ffd59a" />
      <directionalLight position={[-1.5, 4, 4]} intensity={1.3 * luz} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0015} />
      <directionalLight position={[3, 2, -2]} intensity={0.5 * luz} color="#bcd4ff" />
      {apagao ? <pointLight position={[MESA.x, 1.2, MESA.z]} intensity={2.5 * apagao} distance={3} color="#7dff6a" /> : null}
      {alarme ? <pointLight position={[0, 2.5, 0]} intensity={14 * sirene * alarme} distance={9} color="#ff2010" /> : null}
    </>
  );
};

const Camera: React.FC<{c: Cam}> = ({c}) => {
  const {camera} = useThree();
  camera.position.set(...c.pos);
  camera.up.set(Math.sin(c.roll ?? 0), Math.cos(c.roll ?? 0), 0);
  camera.lookAt(...c.alvo);
  const pc = camera as THREE.PerspectiveCamera;
  if (pc.fov !== (c.fov ?? 45)) { pc.fov = c.fov ?? 45; pc.updateProjectionMatrix(); }
  return null;
};

// fumaça/fogo da explosão: bolas que crescem e somem (determinístico)
const Explosao: React.FC<{k: number}> = ({k}) => {
  if (k <= 0) return null;
  const bolas = Array.from({length: 26}, (_, i) => {
    const a = i * 2.39996, r = 0.15 + (i % 7) * 0.12;
    const s = (0.18 + (i % 5) * 0.06) * Math.min(1, k * 3) * (1 + k);
    return {p: [MESA.x + Math.cos(a) * r * (0.5 + k), MESA.y + 0.2 + (i % 4) * 0.15 + k * 0.8, MESA.z + Math.sin(a) * r * (0.5 + k)] as [number, number, number], s, c: i % 3 === 0 ? '#ffb300' : i % 3 === 1 ? '#ff5a1f' : '#3a3030'};
  });
  return (
    <group>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p} scale={b.s}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={b.c} emissive={b.c === '#3a3030' ? '#000' : b.c} emissiveIntensity={Math.max(0, 2 - k * 2.5)} transparent opacity={Math.max(0, 1 - k * 0.9)} />
        </mesh>
      ))}
    </group>
  );
};

// banana voando (jogar_banana): do macaco que joga até o alvo
const BananaVoando: React.FC<{de: THREE.Vector3; para: THREE.Vector3; k: number}> = ({de, para, k}) => {
  if (k <= 0 || k >= 1) return null;
  const p = de.clone().lerp(para, k); p.y += Math.sin(k * Math.PI) * 0.6;
  return (
    <mesh position={p} rotation={[k * 12, k * 7, 0]} castShadow>
      <torusGeometry args={[0.09, 0.03, 10, 20, Math.PI * 0.9]} />
      <meshStandardMaterial color="#ffd23a" roughness={0.5} />
    </mesh>
  );
};

// o ThreeCanvas do Remotion não tem laço de quadros (frameloop 'never'): quando os GLBs chegam é preciso desenhar
// de novo na mão (e compilar os shaders) antes de liberar o quadro
const Pronto: React.FC<{ok: boolean; h: number}> = ({ok, h}) => {
  const {advance, gl, scene, camera} = useThree();
  useEffect(() => {
    if (!ok) return;
    gl.compile(scene, camera);
    advance(performance.now());
    requestAnimationFrame(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); });
  }, [ok, h, advance, gl, scene, camera]);
  return null;
};

// visão do Cego: cada objeto vira uma cor lisa própria (o filtro de bordas da edição desenha só os contornos)
const idMats: Record<string, THREE.MeshBasicMaterial> = {};
const idMat = (nome: string) => {
  if (idMats[nome]) return idMats[nome];
  let h = 0; for (const c of nome) h = (h * 131 + c.charCodeAt(0)) >>> 0;
  return (idMats[nome] = new THREE.MeshBasicMaterial({color: new THREE.Color().setHSL((h % 360) / 360, 0.7, 0.25 + ((h >> 9) % 50) / 100)}));
};
const Restaura: React.FC = () => {
  const {scene} = useThree();
  scene.traverse((o: any) => { if (o.isMesh && o.userData.matOrig) { o.material = o.userData.matOrig; o.userData.matOrig = null; } });
  return null;
};
const TrocaContorno: React.FC<{on: boolean}> = ({on}) => {
  const {scene} = useThree();
  if (on) scene.traverse((o: any) => { if (o.isMesh && !o.userData.matOrig) { o.userData.matOrig = o.material; o.material = idMat(o.name + (o.parent?.name ?? '')); } });
  return null;
};

export type Cena3DProps = {
  atores: Record<Papel3D, Ator>; camera: Cam; t: number; resta: number; erros: number; maxErros: number; lugar: Lugar3D;
  width: number; height: number; apagao?: number; alarme?: number; explosao?: number; tremor?: number;
  banana?: {de: Papel3D; para: Papel3D; k: number}; debug?: string; modulos?: Modulo[]; foco?: number; pov?: Papel3D; contorno?: boolean;
};

const Cena3DReal: React.FC<Cena3DProps> = (pr) => {
  const [g, setG] = useState<{sala: THREE.Group; bomba: THREE.Group; m: Record<Papel3D, THREE.Group>} | null>(null);
  const [h] = useState(() => delayRender('cena 3D bombanana', {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    Promise.all([carregar('van.glb'), carregar('bomba3.glb'), carregar('macaco3_cego.glb'), carregar('macaco3_surdo.glb'), carregar('macaco3_mudo.glb')])
      .then(([sala, bomba, c, s, m]) => { setG({sala, bomba, m: {Cego: prepararMacaco(c), Surdo: prepararMacaco(s), Mudo: prepararMacaco(m)}}); });
  }, [h]);
  const exp = pr.explosao ?? 0;
  return (
    <ThreeCanvas width={pr.width} height={pr.height} shadows camera={{fov: 45, near: 0.05, far: 40}} gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'}}>
      <Restaura />
      <Ambiente t={pr.t} apagao={pr.apagao ?? 0} alarme={pr.alarme ?? 0} flash={exp > 0 && exp < 0.15 ? 1 - exp / 0.15 : 0} />
      <Camera c={pr.camera} />
      <Pronto ok={!!g} h={h} />
      {pr.debug === 'cubo' ? <mesh position={[MESA.x, MESA.y + 0.3, MESA.z]}><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="red" /></mesh> : null}
      {g && pr.debug !== 'cubo' ? (
        <>
          {pr.debug !== 'semsala' ? <Sala g={g.sala} lugar={pr.lugar} /> : null}
          {exp < 0.08 && pr.debug !== 'sembomba' ? <Bomba g={g.bomba} resta={pr.resta} erros={pr.erros} maxErros={pr.maxErros} t={pr.t} tremor={pr.tremor ?? 0} modulos={pr.modulos} foco={pr.foco} contorno={pr.contorno} /> : null}
          {pr.debug === 'semmacaco' || pr.debug === 'sembomba' ? null : (['Cego', 'Surdo', 'Mudo'] as Papel3D[]).map((p) => (
            pr.pov === p ? null : <Macaco key={p} g={g.m[p]} papel={p} ator={pr.atores[p]} t={pr.t} sujo={exp > 0 ? Math.min(1, exp * 4) : 0} />
          ))}
          <Explosao k={exp} />
          {pr.banana ? <BananaVoando de={cabecaMacaco(pr.banana.de)} para={cabecaMacaco(pr.banana.para)} k={pr.banana.k} /> : null}
        </>
      ) : null}
      <TrocaContorno on={!!pr.contorno} />
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------- câmeras prontas (o editor mistura e mexe nelas)
const tr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
export function camPadrao(nome: string, t = 0): Cam {
  const m = MESA;
  const orbita = (ang: number, r: number, y: number, fov = 45): Cam => {
    const a = (ang * Math.PI) / 180;
    return {pos: [m.x + Math.cos(a) * r, y, m.z - Math.sin(a) * r], alvo: [m.x, m.y + 0.1, m.z], fov};
  };
  switch (nome) {
    case 'jogo': return {pos: [0, 2.15, 2.25], alvo: [0, 0.95, -0.25], fov: 50};          // atrás do Cego e do Surdo, de cima
    case 'geral': return {pos: [sen(t / 240) * 0.6, 2.05, 2.35], alvo: [0, 1.0, -0.3], fov: 55};
    case 'frente': return {pos: [0.3, 1.9, -2.3], alvo: [0, 1.0, 0.4], fov: 52};          // de trás do Mudo, vendo Cego e Surdo
    case 'lado': return {pos: [-1.35, 1.75, 0.0], alvo: [0.3, 1.0, 0.0], fov: 55};
    case 'orbita': return orbita(270 + sen(t / 150) * 40, 2.2, 2.0, 52);
    case 'bomba': return {pos: [m.x + 0.05, m.y + 0.8, m.z + 0.75], alvo: [m.x, m.y + 0.15, m.z - 0.1], fov: 42};
    case 'lcd': return {pos: [m.x, m.y + 0.42, m.z + 0.5], alvo: [m.x, m.y + 0.38, m.z - 0.3], fov: 34};
    case 'painel': return {pos: [m.x, m.y + 0.75, m.z + 0.28], alvo: [m.x, m.y + 0.1, m.z - 0.02], fov: 40};
    case 'teto': return {pos: [m.x, 2.2, m.z + 0.01], alvo: [m.x, 0, m.z], fov: 70, roll: t * 0.002};
  }
  // primeira pessoa (como no jogo): olhos do macaco; o Surdo e o Cego olham a bomba, o Mudo olha os outros dois
  if (nome.startsWith('pov:')) {
    const p = nome.split(':')[1] as Papel3D;
    const olho = cabecaMacaco(p).add(new THREE.Vector3(0, p === 'Mudo' ? 0.25 : 0.11, 0));
    const pm = posMacaco(p); const dir = MESA.clone().sub(pm).setY(0).normalize();
    olho.add(dir.clone().multiplyScalar(0.12));
    const alvo = p === 'Mudo' ? new THREE.Vector3(0, 1.3, MESA.z + 0.98) : MESA.clone().add(new THREE.Vector3(0, 0.22, 0));
    const bal = sen(t / 23) * 0.012;
    return {pos: [olho.x + bal, olho.y + sen(t / 31) * 0.01, olho.z], alvo: tr(alvo), fov: 68};
  }
  // close de um macaco: a câmera fica do outro lado da mesa, olhando o rosto
  if (nome.startsWith('close:') || nome.startsWith('meio:')) {
    // a câmera fica na frente do macaco mas deslocada para fora da mesa, para a tampa da bomba não tapar
    const p = nome.split(':')[1] as Papel3D;
    const cab = cabecaMacaco(p);
    const dir = MESA.clone().sub(posMacaco(p)).setY(0).normalize();
    const fora = new THREE.Vector3(p === 'Mudo' ? 1 : Math.sign(posMacaco(p).x) || 1, 0, 0);
    const perto = nome.startsWith('close:');
    const pos = cab.clone().add(dir.clone().multiplyScalar(perto ? 0.95 : 1.3)).add(fora.multiplyScalar(perto ? (p === 'Mudo' ? 0.7 : 0.5) : (p === 'Mudo' ? 1.25 : 0.85))).add(new THREE.Vector3(0, perto ? 0.1 : 0.32, 0));
    return {pos: tr(pos), alvo: tr(cab.clone().add(new THREE.Vector3(0, perto ? -0.1 : -0.3, 0))), fov: perto ? 42 : 50};
  }
  // por cima do ombro de um macaco olhando a bomba
  if (nome.startsWith('ombro:')) {
    const p = nome.split(':')[1] as Papel3D;
    const pm = posMacaco(p);
    const dir = MESA.clone().sub(pm).setY(0).normalize();
    const pos = pm.clone().sub(dir.clone().multiplyScalar(0.85)).add(new THREE.Vector3(0, 1.75, 0)).add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.3));
    return {pos: tr(pos), alvo: [m.x, m.y + 0.15, m.z], fov: 50};
  }
  return orbita(270, 3, 2.4);
}
export const misturarCam = (a: Cam, b: Cam, k: number): Cam => {
  const e = k * k * (3 - 2 * k);
  const L = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * e) as [number, number, number];
  return {pos: L(a.pos, b.pos), alvo: L(a.alvo, b.alvo), fov: (a.fov ?? 45) + ((b.fov ?? 45) - (a.fov ?? 45)) * e, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * e};
};

// Uma cena 3D só para o vídeo inteiro: os blocos "pedem" a cena (Cena3D guarda as props deste quadro) e o
// CenaPersistente, que fica fixo embaixo de tudo, desenha. Assim o WebGL e os modelos carregam uma vez por aba,
// em vez de recriar tudo (13 s) a cada bloco.
const SLOT: {p: (Cena3DProps & {estilo?: React.CSSProperties}) | null} = {p: null};
export const Cena3D: React.FC<Cena3DProps & {estilo?: React.CSSProperties}> = (pr) => { SLOT.p = pr; return null; };
export const CenaPersistente: React.FC = () => {
  useCurrentFrame();
  const p = SLOT.p;
  if (!p) return null;
  const {estilo, ...resto} = p;
  return <AbsoluteFill style={estilo}><Cena3DReal {...resto} /></AbsoluteFill>;
};
