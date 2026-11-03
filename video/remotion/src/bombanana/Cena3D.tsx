// BOMBANANA! em 3D (como o jogo): a van/avião/laboratório, a mesa redonda de feltro verde com a bomba (maleta preta,
// LCD verde) e os três macacos (bombanana/blender/macaco.py -> public/bb/3d/macaco.glb), animados pelos pivôs
// nomeados: cabeça, boca (fala), braços e dedos (gestos do Mudo, mão na bomba do Cego). three.js quadro a quadro.
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Papel3D = 'Cego' | 'Surdo' | 'Mudo';
export type Ator = {papel: Papel3D; cor: string; boca: number; gesto: string; olhando?: number; mexendo?: number};
export type Camera3D = {pos: [number, number, number]; alvo: [number, number, number]; fov?: number};

let promessa: Promise<THREE.Group> | null = null;
const carregar = () => (promessa ??= new GLTFLoader().loadAsync(staticFile('bb/3d/macaco.glb')).then((g) => g.scene));

// pose de cada gesto: ângulos (rad) de ombro/cotovelo do braço direito e quanto cada dedo dobra (0 aberto, 1 fechado)
type Pose = {ombro: [number, number, number]; cotovelo: number; dedos: number[]; polegar: number};
const ABERTA = [0, 0, 0, 0], FECHADA = [1.5, 1.5, 1.5, 1.5];
function pose(gesto: string, t: number): Pose {
  const [g, v] = gesto.split(':');
  const n = Number(v);
  switch (g) {
    case 'polegar_cima': return {ombro: [-0.75, 0, 0.3], cotovelo: -1.15, dedos: FECHADA, polegar: -0.6};
    case 'polegar_baixo': return {ombro: [-0.75, 0, 0.3], cotovelo: -0.6, dedos: FECHADA, polegar: 2.4};
    case 'dedos': return {ombro: [-0.85, 0, 0.3], cotovelo: -1.1, dedos: [0, 1, 2, 3].map((i) => (i < n ? 0 : 1.5)), polegar: n >= 5 ? 0 : 1.2};
    case 'apontar': {
      const d = {cima: [-2.0, 0, 0.2], baixo: [-0.5, 0, 0.2], esquerda: [-1.3, 0, -0.8], direita: [-1.3, 0, 0.9]}[v as 'cima'] ?? [-1.3, 0, 0];
      return {ombro: d as [number, number, number], cotovelo: -0.15, dedos: [0, 1.5, 1.5, 1.5], polegar: 1.2};
    }
    case 'apontar_banana': return {ombro: [-1.7, 0, 0.9], cotovelo: -0.15, dedos: [0, 1.5, 1.5, 1.5], polegar: 1.2};
    case 'mao_parada': return {ombro: [-0.95, 0, 0.3], cotovelo: -1.35, dedos: ABERTA, polegar: 0};
    case 'tapa': return {ombro: [-1.8 + Math.sin(t * 0.8) * 0.9, 0, 0.5], cotovelo: -0.5, dedos: ABERTA, polegar: 0};
    case 'jogar_banana': return {ombro: [-2.2 + Math.min(1, (t % 30) / 10) * 1.6, 0, 0.3], cotovelo: -0.4, dedos: [0.6, 0.6, 0.6, 0.6], polegar: 0.5};
    case 'repetir': return {ombro: [-0.9, 0, 0.35], cotovelo: -1.2 + Math.sin(t * 0.5) * 0.3, dedos: [0, 1.5, 1.5, 1.5], polegar: 1.2};
  }
  return {ombro: [-0.25, 0, 0.1], cotovelo: -1.1, dedos: [0.3, 0.3, 0.3, 0.3], polegar: 0.2};
}

const Macaco3D: React.FC<{base: THREE.Group; ator: Ator; pos: [number, number, number]; rot: number; t: number}> = ({base, ator, pos, rot, t}) => {
  const obj = useMemo(() => {
    const o = base.clone(true);
    o.traverse((c: any) => {
      if (c.isMesh) {
        c.castShadow = true; c.receiveShadow = true;
        c.material = c.material.clone();
        if (c.material.name === 'gola') c.material.color = new THREE.Color(ator.cor);
      }
    });
    return o;
  }, [base, ator.cor]);
  const no = (n: string) => obj.getObjectByName(n);
  no('venda')!.visible = ator.papel === 'Cego';
  no('fone')!.visible = ator.papel === 'Surdo';
  no('fita')!.visible = ator.papel === 'Mudo';
  for (const n of ['olho_e', 'olho_d']) no(n)!.visible = ator.papel !== 'Cego';
  no('boca')!.visible = ator.papel !== 'Mudo';
  no('manual')!.visible = ator.papel === 'Mudo';
  const cab = no('cabeca')!;
  const [g] = ator.gesto.split(':');
  cab.rotation.set(Math.sin(t / 20) * 0.04 + (g === 'cabeca_sim' ? Math.sin(t * 0.6) * 0.25 : 0), (ator.olhando ?? 0) + (g === 'cabeca_nao' ? Math.sin(t * 0.6) * 0.35 : 0), Math.sin(t / 33) * 0.03);
  const boca = no('boca')!;
  boca.scale.set(1, 1 + ator.boca * 1.5, 1 + ator.boca * 3);
  // braço direito: gesto; esquerdo: segura o manual (Mudo) ou descansa
  const p = ator.gesto === 'zero' ? {ombro: [0, 0, 0] as [number, number, number], cotovelo: 0, dedos: ABERTA, polegar: 0} : ator.gesto === 'teste' ? {ombro: [-0.8, 0, 0] as [number, number, number], cotovelo: 0, dedos: ABERTA, polegar: 0} : pose(ator.gesto, t);
  const od = no('ombro_d')!, cd = no('cotovelo_d')!;
  od.rotation.set(p.ombro[0], p.ombro[1], p.ombro[2]);
  cd.rotation.set(p.cotovelo, 0, 0);
  for (let k = 1; k <= 4; k++) no(`dedo_d_${k}`)!.rotation.set(p.dedos[k - 1], 0, 0);
  no('polegar_d')!.rotation.set(0, 0, p.polegar);
  const oe = no('ombro_e')!;
  if (ator.papel === 'Mudo') oe.rotation.set(-0.45, 0, -0.25);
  else if (ator.papel === 'Cego' && ator.mexendo) oe.rotation.set(-0.6 + Math.sin(t / 4) * 0.08, 0, 0.3);
  else oe.rotation.set(-0.25 + Math.sin(t / 25) * 0.05, 0, -0.1);
  no('cotovelo_e')!.rotation.set(ator.papel === 'Mudo' ? -1.2 : -1.1, 0, 0);
  obj.position.set(...pos); obj.rotation.set(0, rot, 0);
  obj.position.y = pos[1] + 0.42 + Math.abs(Math.sin(t / 18)) * 0.01;
  return <primitive object={obj} />;
};

// LCD do cronômetro da bomba como textura
function texturaLCD(texto: string) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96;
  const x = c.getContext('2d')!;
  x.fillStyle = '#16210f'; x.fillRect(0, 0, 256, 96);
  x.fillStyle = '#9cff57'; x.font = 'bold 70px JetBrains Mono, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(texto, 128, 52);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const Bomba3D: React.FC<{resta: number; luzes: string[]; t: number}> = ({resta, luzes, t}) => {
  const txt = `${String(Math.floor(Math.max(0, resta) / 60)).padStart(2, '0')}:${String(Math.max(0, Math.floor(resta % 60))).padStart(2, '0')}`;
  const tex = useMemo(() => texturaLCD(txt), [txt]);
  const COR: Record<string, string> = {vermelho: '#e53935', vermelha: '#e53935', azul: '#1e88e5', amarelo: '#fdd835', amarela: '#fdd835', verde: '#43a047', branco: '#eee', preto: '#222'};
  return (
    <group position={[0, 0.82, 0]}>
      <mesh castShadow receiveShadow><boxGeometry args={[0.9, 0.16, 0.6]} /><meshStandardMaterial color="#2b2e35" roughness={0.6} /></mesh>
      {/* tampa aberta com o LCD */}
      <group position={[0, 0.08, -0.3]} rotation={[-0.6, 0, 0]}>
        <mesh castShadow position={[0, 0.17, 0]}><boxGeometry args={[0.9, 0.34, 0.05]} /><meshStandardMaterial color="#25282e" roughness={0.6} /></mesh>
        <mesh position={[0, 0.19, 0.03]}><planeGeometry args={[0.5, 0.19]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      </group>
      {/* fios coloridos e luzes dos módulos */}
      {['#e53935', '#1e88e5', '#fdd835', '#eee'].map((c, i) => (
        <mesh key={i} position={[-0.28 + i * 0.05, 0.1, 0.08]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.012, 8, 24, Math.PI]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>
      ))}
      {luzes.map((c, i) => (
        <mesh key={i} position={[0.1 + i * 0.1, 0.1, 0.15]}><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color={COR[c] ?? c} emissive={COR[c] ?? c} emissiveIntensity={1.5 + Math.sin(t / 5) * 0.5} /></mesh>
      ))}
    </group>
  );
};

const Van: React.FC<{t: number; lugar: string}> = ({t, lugar}) => {
  const parede = lugar === 'aviao' ? '#dfe3ea' : lugar === 'laboratorio' ? '#2f4f42' : '#2a4fa8';
  return (
    <group>
      {/* chão, paredes e teto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial color={lugar === 'aviao' ? '#5b6475' : '#5a3b28'} roughness={0.9} /></mesh>
      <mesh position={[0, 1.6, -2.2]} receiveShadow><boxGeometry args={[8, 3.2, 0.1]} /><meshStandardMaterial color={parede} roughness={0.8} /></mesh>
      <mesh position={[-2.6, 1.6, 0]} receiveShadow><boxGeometry args={[0.1, 3.2, 6]} /><meshStandardMaterial color={parede} roughness={0.8} /></mesh>
      <mesh position={[2.6, 1.6, 0]} receiveShadow><boxGeometry args={[0.1, 3.2, 6]} /><meshStandardMaterial color={parede} roughness={0.8} /></mesh>
      <mesh position={[0, 2.9, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#1b2f66" side={THREE.DoubleSide} /></mesh>
      {/* janelas e cortinas vermelhas */}
      {[-1.2, 1.2].map((x) => (
        <group key={x} position={[x, 1.7, -2.14]}>
          <mesh><planeGeometry args={[1.0, 0.6]} /><meshBasicMaterial color="#9fd3f5" /></mesh>
          <mesh position={[-0.6, -0.1, 0.05]}><boxGeometry args={[0.25, 0.9, 0.05]} /><meshStandardMaterial color="#c62828" roughness={0.9} /></mesh>
          <mesh position={[0.6, -0.1, 0.05]}><boxGeometry args={[0.25, 0.9, 0.05]} /><meshStandardMaterial color="#c62828" roughness={0.9} /></mesh>
        </group>
      ))}
      {/* luminária laranja em cima da mesa */}
      <mesh position={[0, 2.45, 0]}><coneGeometry args={[0.28, 0.2, 32, 1, true]} /><meshStandardMaterial color="#ff8f00" side={THREE.DoubleSide} emissive="#ff8f00" emissiveIntensity={0.4} /></mesh>
      <pointLight position={[0, 2.3, 0]} intensity={6} distance={6} color="#ffcc80" castShadow />
      {/* mesa redonda de feltro verde */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow><cylinderGeometry args={[1.1, 1.1, 0.08, 64]} /><meshStandardMaterial color="#2e7d32" roughness={0.95} /></mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.1, 0.06, 16, 64]} /><meshStandardMaterial color="#6d4325" roughness={0.6} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.12, 0.2, 0.7, 24]} /><meshStandardMaterial color="#5d3a1f" /></mesh>
      {[[-1.35, 0.45], [0, -1.4], [1.35, 0.45]].map(([x, z]) => <mesh key={x} position={[x, 0.22, z]} castShadow><cylinderGeometry args={[0.3, 0.26, 0.44, 32]} /><meshStandardMaterial color="#e8eef5" roughness={0.4} /></mesh>)}
      {/* bananas de cada cor numa prateleira (o Mudo aponta para elas) */}
      {['#e53935', '#1e88e5', '#fdd835', '#43a047', '#f2f2f2', '#262626', '#8e24aa', '#fb8c00'].map((c, i) => (
        <mesh key={c} position={[2.5, 1.5 + Math.floor(i / 4) * 0.3, -1.2 + (i % 4) * 0.35]} rotation={[0, 0, 0.6]} castShadow><capsuleGeometry args={[0.05, 0.22, 8, 16]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
      ))}
    </group>
  );
};

const Luzes: React.FC = () => {
  const {scene, gl} = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  }, [scene, gl]);
  return (
    <>
      <hemisphereLight args={['#dfe8ff', '#5a3b28', 0.8]} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    </>
  );
};

const Camera: React.FC<{c: Camera3D}> = ({c}) => {
  const {camera} = useThree();
  camera.position.set(...c.pos);
  camera.lookAt(...c.alvo);
  if ((camera as THREE.PerspectiveCamera).fov !== (c.fov ?? 42)) { (camera as THREE.PerspectiveCamera).fov = c.fov ?? 42; camera.updateProjectionMatrix(); }
  return null;
};

export const CAMERAS: Record<string, Camera3D> = {
  geral: {pos: [0, 2.5, 3.4], alvo: [0, 1.15, 0]},
  Cego: {pos: [0.2, 1.75, 1.7], alvo: [-1.35, 1.45, 0.45], fov: 34},
  Surdo: {pos: [-0.2, 1.75, 1.7], alvo: [1.35, 1.45, 0.45], fov: 34},
  Mudo: {pos: [0, 1.6, 1.2], alvo: [0, 1.2, -0.95], fov: 38},
  teste: {pos: [0, 1.4, 0.6], alvo: [0, 1.0, -1.4], fov: 45},
  lado: {pos: [1.6, 1.3, -1.4], alvo: [0, 1.0, -1.4], fov: 45},
  bomba: {pos: [0, 1.7, 1.0], alvo: [0, 0.85, 0], fov: 40},
};

export const Cena3D: React.FC<{atores: Record<Papel3D, Ator>; camera: Camera3D; t: number; resta: number; luzes: string[]; lugar: string; width: number; height: number}> = ({atores, camera, t, resta, luzes, lugar, width, height}) => {
  const [base, setBase] = useState<THREE.Group | null>(null);
  const [h] = useState(() => delayRender('macaco 3D'));
  useEffect(() => { carregar().then((g) => { setBase(g); continueRender(h); }); }, [h]);
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{fov: 42, near: 0.05, far: 50}} gl={{antialias: true, preserveDrawingBuffer: true}}>
      <Luzes />
      <Camera c={camera} />
      <Van t={t} lugar={lugar} />
      <Bomba3D resta={resta} luzes={luzes} t={t} />
      {base ? (
        <>
          <Macaco3D base={base} ator={atores.Cego} pos={[-1.35, 0, 0.45]} rot={1.25} t={t} />
          <Macaco3D base={base} ator={atores.Mudo} pos={[0, 0, -1.4]} rot={0} t={t + 40} />
          <Macaco3D base={base} ator={atores.Surdo} pos={[1.35, 0, 0.45]} rot={-1.25} t={t + 80} />
        </>
      ) : null}
    </ThreeCanvas>
  );
};
