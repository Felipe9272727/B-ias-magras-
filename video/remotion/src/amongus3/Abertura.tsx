// Abertura do Among Us 3: os comentários do vídeo anterior (texto como foi escrito, só cortado com "…") e a frase
// "vocês me encheram de ideias boas, mas infelizmente não consegui fazer todas" com as ideias pipocando em volta.
// No fim as que entraram no jogo ganham o selo FEITO; as outras ficam apagadas (conferido no motor jogo3.mjs).
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Comentario} from './Comentarios';
import {FONT} from '../theme';
import {Som} from './Telas';
import {Crewmate} from '../amongus/Crewmate';
import {EMPRESA} from './Jogo';

export const COMENTARIOS3: Comentario[] = [
  {usuario: '@manodoRoblox-d8p', texto: 'uma coisa á se pontuar, os impostores raramente usam suas habilidades de classe', destaque: 'raramente usam suas habilidades', likes: 13, quando: 'há 6 dias'},
  {usuario: '@Raffa_desenha', texto: 'Da próxima vez vê se dá pra explicar o que cada função é pras IAS, e adiciona o juiz e o fotógrafo!', destaque: 'adiciona o juiz e o fotógrafo', likes: 11, quando: 'há 6 dias'},
  {usuario: '@SnowMickツ', texto: 'Imagina com 15 Ias kkkkk ia dar muito ruim, cada IA se acusando', destaque: 'Imagina com 15 Ias', likes: 4, quando: 'há 5 dias'},
  {usuario: '@jogando-brpaz', texto: 'Adiciona um chat para impostor', destaque: 'chat para impostor', likes: 1, quando: 'há 5 dias'},
  {usuario: '@manodoRoblox-d8p', texto: 'inclusive, coloque para as ias ver apenas o seu campo de visão, e não a sala inteira', destaque: 'apenas o seu campo de visão', likes: 2, quando: 'há 6 dias'},
  {usuario: '@LELOHJ', texto: 'Coloca o palhaço, uma função NEUTRO', destaque: 'palhaço', quando: 'há 4 dias'},
];

type Ideia = {txt: string; quem: string; feito: boolean};
export const IDEIAS3: Ideia[] = [
  {txt: 'Impostores usarem as habilidades', quem: '@manodoRoblox-d8p', feito: true},
  {txt: 'Função Juiz', quem: '@Raffa_desenha', feito: true},
  {txt: '20 IAs com 5 impostores', quem: '@RealyoSyz_BR', feito: false},
  {txt: 'Influencer / fotógrafo', quem: '@Invasores4562', feito: true},
  {txt: 'Colocar a Luiza', quem: '@DavidSilvaporto-k2y', feito: false},
  {txt: 'Ver só o campo de visão', quem: '@manodoRoblox-d8p', feito: true},
  {txt: 'Palhaço (neutro)', quem: '@ZYX-DDFloornoir', feito: true},
  {txt: 'Função Verme', quem: '@DavidSilvaporto-k2y', feito: false},
  {txt: 'Chat dos impostores', quem: '@jogando-brpaz', feito: true},
  {txt: 'Mapa Polus ou The Fungle', quem: '@ZYX-DDFloornoir', feito: false},
  {txt: 'Trancar as portas', quem: '@Invasores4562', feito: true},
  {txt: 'Função Mágico', quem: '@NathanResende-r8i', feito: false},
  {txt: 'Gangster que recruta', quem: '@ZYX-DDFloornoir', feito: true},
  {txt: 'IAs no BedWars', quem: '@cabritofutebolista', feito: false},
  {txt: 'Função Veneno', quem: '@itzgreenish', feito: true},
  {txt: 'Função Minador', quem: '@itzgreenish', feito: false},
  {txt: 'Segurança: câmeras de qualquer lugar', quem: '@manodoRoblox-d8p', feito: true},
  {txt: 'Jogar contra elas', quem: '@Osenhorlaranjaburro67', feito: false},
  {txt: 'Tela com todas as funções', quem: '@beydavi-b3t', feito: true},
  {txt: 'Personalidade pra cada IA', quem: '@manodoRoblox-d8p', feito: false},
  {txt: 'Função do lado do nome', quem: '@manodoRoblox-d8p', feito: true},
  {txt: 'Colocar o Copilot', quem: '@fabiobatistadejesus8682', feito: false},
  {txt: '15 IAs e 3 impostores', quem: '@BrunoLaercio-y5m4i', feito: true},
  {txt: 'Anjo da guarda', quem: '@cookie_bonitinha', feito: false},
  {txt: 'Nerf no Detetive', quem: '@astron-3T', feito: true},
  {txt: 'Revelar os impostores no fim', quem: '@Invasores4562', feito: true},
  {txt: 'Reportar corpo na sabotagem', quem: '@Davijogosedit-dav', feito: true},
  {txt: 'IAs saberem as funções', quem: '@arthurpinheiro9248', feito: true},
  {txt: 'Mais sabotagens', quem: '@manodoRoblox-d8p', feito: true},
  {txt: 'Bateria no tablet das câmeras', quem: '@manodoRoblox-d8p', feito: false},
];

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const CORES_AVATAR = ['#e0533c', '#2f8f5b', '#3b6fd8', '#c2410c', '#7c3aed', '#0f766e', '#b45309', '#be185d'];
const h = (i: number, k: number) => { const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453; return x - Math.floor(x); };

// vagas: 3 linhas x 5 colunas acima da frase e 3 x 5 abaixo (30 vagas), preenchidas em ordem embaralhada,
// com um pouco de tremido e inclinação para parecer pop-up
function lugar(i: number) {
  const vaga = (i * 17 + 5) % 30;
  const col = vaga % 5, lin = Math.floor(vaga / 5);
  const y = lin < 3 ? 62 + lin * 102 : 822 + (lin - 3) * 102;
  return {x: 196 + col * 382 + (h(i, 2) - 0.5) * 24, y: y + (h(i, 3) - 0.5) * 14, rot: (h(i, 4) - 0.5) * 9};
}

// `inicio`: quadro em que as ideias começam a pipocar; `passo`: intervalo entre elas; `frase2`: quadro do "mas
// infelizmente…"; `marca`: quadro em que entram os selos FEITO
export const AU3Ideias: React.FC<{inicio?: number; passo?: number; frase2?: number; marca?: number}> = ({inicio = 20, passo = 5, frase2 = 120, marca = 230}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = 'Vocês me encheram de ideias boas…';
  const t2 = 'mas infelizmente não consegui fazer todas.';
  const n1 = Math.floor(interpolate(f, [0, 22], [0, t1.length], cl));
  const n2 = Math.floor(interpolate(f, [frase2, frase2 + 26], [0, t2.length], cl));
  const tremor = f >= frase2 && f < frase2 + 10 ? Math.sin(f * 3) * 6 : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1d2a48, #05070d 78%)', overflow: 'hidden'}}>
      {IDEIAS3.map((d, i) => {
        const em = inicio + i * passo;
        const e = spring({frame: f - em, fps, config: {damping: 11, stiffness: 190}});
        if (f < em) return null;
        const {x, y, rot} = lugar(i);
        const depois = f >= marca;
        const sel = spring({frame: f - marca - (i % 10) * 2, fps, config: {damping: 10, stiffness: 200}});
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${e})`, opacity: depois && !d.feito ? interpolate(f - marca, [0, 12], [1, 0.28], cl) : 1}}>
            {f - em === 0 && <Som nome="sfx/pop.mp3" vol={0.22} />}
            <div style={{display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 16, background: '#fff', border: '3px solid #0f0f0f', boxShadow: '0 8px 0 rgba(0,0,0,.45)', width: 340, boxSizing: 'border-box'}}>
              <div style={{flex: '0 0 40px', height: 40, borderRadius: '50%', background: CORES_AVATAR[i % CORES_AVATAR.length], display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 20, color: '#fff'}}>{d.quem.replace('@', '')[0].toUpperCase()}</div>
              <div style={{minWidth: 0}}>
                <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: '#606060'}}>{d.quem}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 21, lineHeight: 1.12, color: '#0f0f0f'}}>{d.txt}</div>
              </div>
            </div>
            {depois && d.feito && (
              <div style={{position: 'absolute', right: -18, top: -20, transform: `rotate(12deg) scale(${sel})`, padding: '3px 12px', borderRadius: 10, background: '#20c05c', border: '3px solid #063d1b', fontFamily: FONT.display, fontWeight: 900, fontSize: 20, color: '#fff'}}>✓ FEITO</div>
            )}
          </div>
        );
      })}
      {f === marca && <Som nome="tarefa" vol={0.5} />}
      <div style={{position: 'absolute', left: 300, right: 300, top: 410, textAlign: 'center', transform: `translateX(${tremor}px)`, zIndex: 50}}>
        <div style={{display: 'inline-block', padding: '22px 40px', borderRadius: 26, background: 'rgba(5,7,13,.86)', border: '4px solid #ffffff22'}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, lineHeight: 1.12, color: '#fff'}}>{t1.slice(0, n1)}</div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 52, lineHeight: 1.15, color: '#ff5a5a', minHeight: 60}}>{t2.slice(0, n2)}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Elenco da temporada: uma coluna por empresa com as cores dela (vindas do log da partida 1). O Grok aparece riscado
// ("saiu") e Mistral e GLM ganham o selo NOVA. `marcas`: quadros em que o narrador fala de cada empresa (acende).
const ORDEM_EMPRESAS = ['DeepSeek Flash', 'Claude Haiku', 'GPT-5.6 Luna', 'Gemini 3.8 Flash', 'Mistral Large 4', 'GLM 5.3 Flash'];
export const AU3Elenco: React.FC<{p: {jogadores: {cor: string; modelo: string}[]}; saiu?: number; novas?: number}> = ({p, saiu = 30, novas = 70}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grok = spring({frame: f - saiu, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1b2440, #05070d 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000'}}>15 IAs · 6 empresas</div>
      {/* o Grok saindo */}
      <div style={{position: 'absolute', left: 760, top: 130, width: 400, textAlign: 'center', opacity: interpolate(f, [saiu, saiu + 8, novas - 6, novas + 4], [0, 1, 1, 0], cl), transform: `scale(${grok}) rotate(${-4 * grok}deg)`}}>
        <div style={{display: 'inline-block', padding: '8px 26px', borderRadius: 14, background: '#111', border: '4px solid #ff3b3b', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff', textDecoration: 'line-through', textDecorationColor: '#ff3b3b', textDecorationThickness: 6}}>Grok</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#ff3b3b', marginTop: 4}}>SAIU</div>
      </div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 260, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18}}>
        {ORDEM_EMPRESAS.map((m, i) => {
          const nova = m.startsWith('Mistral') || m.startsWith('GLM');
          const em = nova ? novas + (m.startsWith('GLM') ? 12 : 0) : 6 + i * 5;
          const e = spring({frame: f - em, fps, config: {damping: 12, stiffness: 160}});
          const cores = p.jogadores.filter((j) => j.modelo === m).map((j) => j.cor);
          const emp = EMPRESA[m] ?? {nome: m, cor: '#555'};
          return (
            <div key={m} style={{position: 'relative', height: 640, borderRadius: 20, background: 'rgba(255,255,255,.06)', border: `5px solid ${emp.cor}`, opacity: interpolate(f - em, [0, 6], [0, 1], cl), transform: `translateY(${(1 - e) * 80}px)`, overflow: 'hidden'}}>
              {nova && <div style={{position: 'absolute', right: -36, top: 18, width: 150, transform: 'rotate(35deg)', textAlign: 'center', background: '#ffd84d', color: '#000', fontFamily: FONT.display, fontWeight: 900, fontSize: 20, letterSpacing: 2, border: '2px solid #000'}}>NOVA</div>}
              <div style={{margin: '20px 16px 0', padding: '8px 0', borderRadius: 12, background: emp.cor, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', WebkitTextStroke: '1px #000'}}>{emp.nome}</div>
              <div style={{textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 20, color: '#cfd8e6', marginTop: 6}}>{m}</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                {cores.map((c, k) => (
                  <div key={c} style={{display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${spring({frame: f - em - 6 - k * 4, fps, config: {damping: 11}})})`}}>
                    <Crewmate cor={c} size={110} t={f + k * 7} />
                    <span style={{width: 110, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: '#fff', WebkitTextStroke: '1px #000'}}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: cores.length === 3 ? '#7ee787' : '#cfd8e6'}}>{cores.length} IAs</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
