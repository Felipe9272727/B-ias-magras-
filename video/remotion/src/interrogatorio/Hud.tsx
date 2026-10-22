// HUD da sala de interrogatório ("Interrogatório das IAs").
// Tudo em SVG/HTML inline, sem imagens externas. Entradas e saídas com mola (spring) do Remotion.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// mola segura: antes do quadro 0 (ou antes de começar) fica em 0
const mola = (quadro: number, fps: number, config: {damping: number; stiffness: number; mass?: number}) =>
  quadro <= 0 ? 0 : spring({frame: quadro, fps, config});

// quanto do texto já apareceu, de 0 a 1, entre `at` e `ate` (ritmo da fala)
const progresso = (f: number, at: number, ate: number) => interpolate(f, [at, Math.max(at + 1, ate)], [0, 1], clamp);

// mistura duas cores hex (de a até b, p de 0 a 1)
const mistura = (a: string, b: string, p: number) => {
  const q = Math.max(0, Math.min(1, p));
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * q).toString(16).padStart(2, '0')).join('');
};

// verde (0) -> amarelo (50) -> vermelho (100)
const corEstresse = (v: number) => {
  const p = Math.max(0, Math.min(100, v));
  return p <= 50 ? mistura('#39ff7a', '#ffd23f', p / 50) : mistura('#ffd23f', '#ff3b30', (p - 50) / 50);
};

// forma de um batimento (p de 0 a 1): onda P, complexo QRS e onda T, somadas como gaussianas
const ecgAmp = (p: number) => {
  const g = (c: number, w: number, a: number) => a * Math.exp(-((p - c) ** 2) / (2 * w * w));
  return g(0.12, 0.025, 0.15) + g(0.36, 0.008, -0.15) + g(0.4, 0.012, 1) + g(0.44, 0.009, -0.3) + g(0.62, 0.05, 0.3);
};

const CORACAO = 'M12 21 C4 14 2 11 2 7.5 C2 4.5 4.5 2 7.5 2 C9.5 2 11 3.2 12 5 C13 3.2 14.5 2 16.5 2 C19.5 2 22 4.5 22 7.5 C22 11 20 14 12 21 Z';

// Monitor de sinais vitais. `t` é o quadro atual (o mesmo do vídeo), usado para rolar o ECG e bater o coração.
// Desenhado no sistema 360×220; `largura`/`altura` só mudam o tamanho na tela.
export const MonitorEstresse: React.FC<{estresse: number; bpm: number; t: number; largura?: number; altura?: number}> = ({
  estresse,
  bpm,
  t,
  largura = 360,
  altura = 220,
}) => {
  const {fps} = useVideoConfig();
  const seg = t / fps;
  const bpmOk = Math.max(30, Math.min(220, bpm));
  const e = Math.max(0, Math.min(100, estresse));
  const alerta = e > 80;
  const cor = corEstresse(e);

  // ECG: a trilha rola para a esquerda; cada batida ocupa VEL*60/bpm px, então o espaçamento segue o bpm
  const VEL = 90;
  const porBatida = (VEL * 60) / bpmOk;
  const desloc = seg * VEL;
  const pontos: string[] = [];
  for (let x = 12; x <= 348; x += 2) {
    const p = ((((x + desloc) / porBatida) % 1) + 1) % 1;
    pontos.push(`${x},${(68 - ecgAmp(p) * 36).toFixed(1)}`);
  }

  // coração: pulso forte no início de cada batida
  const faseCoracao = ((seg * bpmOk) / 60) % 1;
  const pulso = 1 + 0.25 * Math.exp(-(faseCoracao ** 2) / (2 * 0.06 ** 2));

  // alerta: a tela pisca em vermelho (~2 Hz)
  const piscando = alerta ? 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(seg * Math.PI * 2 * 2)) : 0;

  return (
    <svg viewBox="0 0 360 220" width={largura} height={altura} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <linearGradient id="hud-tela" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06210f" />
          <stop offset="1" stopColor="#020c06" />
        </linearGradient>
        <pattern id="hud-grade" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="#39ff7a" strokeOpacity="0.09" strokeWidth="1" />
        </pattern>
      </defs>
      {/* aparelho e tela */}
      <rect x="2" y="2" width="356" height="216" rx="18" fill="#20242a" stroke="#000" strokeWidth="4" />
      <rect x="12" y="12" width="336" height="196" rx="10" fill="url(#hud-tela)" stroke="#000" strokeWidth="3" />
      <rect x="12" y="12" width="336" height="196" rx="10" fill="url(#hud-grade)" />
      {/* ECG */}
      <polyline points={pontos.join(' ')} fill="none" stroke={alerta ? '#ff7070' : '#39ff7a'} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="22" y1="124" x2="338" y2="124" stroke="#39ff7a" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 4" />
      {/* BPM (esquerda) */}
      <text x="22" y="146" fontFamily={FONT.mono} fontWeight={700} fontSize="12" fill="#7dffa6" letterSpacing="2" opacity="0.85">
        BPM
      </text>
      <text x="22" y="190" fontFamily={FONT.display} fontWeight={900} fontSize="46" fill="#7dffa6">
        {Math.round(bpm)}
      </text>
      <g transform={`translate(128 150) scale(${pulso * 0.95}) translate(-12 -12)`}>
        <path d={CORACAO} fill="#ff4d6d" stroke="#000" strokeWidth="1.5" />
      </g>
      {/* ESTRESSE (direita) */}
      <text x="196" y="146" fontFamily={FONT.mono} fontWeight={700} fontSize="12" fill="#7dffa6" letterSpacing="2" opacity="0.85">
        ESTRESSE
      </text>
      <text x="340" y="146" textAnchor="end" fontFamily={FONT.display} fontWeight={900} fontSize="22" fill={cor}>
        {Math.round(e)}%
      </text>
      <rect x="196" y="158" width="144" height="16" rx="8" fill="#0b2a17" stroke="#1f5a33" strokeWidth="1.5" />
      <rect x="196" y="158" width={Math.max(0, 144 * (e / 100))} height="16" rx="8" fill={cor} />
      <text x="196" y="192" fontFamily={FONT.mono} fontSize="10" fill="#7dffa6" opacity="0.6">
        0
      </text>
      <text x="340" y="192" textAnchor="end" fontFamily={FONT.mono} fontSize="10" fill="#7dffa6" opacity="0.6">
        100
      </text>
      {/* alerta: piscar vermelho e a faixa de aviso */}
      {alerta && (
        <>
          <rect x="12" y="12" width="336" height="196" rx="10" fill="#ff1e1e" opacity={piscando} />
          <rect x="108" y="22" width="144" height="30" rx="8" fill="#ff1e1e" stroke="#fff" strokeWidth="2.5" />
          <text x="180" y="44" textAnchor="middle" fontFamily={FONT.comic} fontSize="22" fill="#fff" letterSpacing="2">
            ⚠ ALERTA
          </text>
        </>
      )}
      {/* reflexo do vidro */}
      <rect x="12" y="12" width="336" height="80" rx="10" fill="#fff" opacity="0.04" />
    </svg>
  );
};

// Ícone por palavra-chave da pista
const ICONES: [RegExp, string][] = [
  [/celular|telefone|mensagem|chamada/i, '📱'],
  [/câmera|camera|vídeo|video|gravaç|corredor/i, '🎥'],
  [/bolo|migalha|comida|prato|garfo|copo/i, '🍰'],
  [/digital|impress|pegada|luva|fio|cabelo/i, '🖐️'],
];
const iconeDe = (texto: string) => ICONES.find(([re]) => re.test(texto))?.[1] ?? '🔍';

// Foto polaroid do local: um desenho simples de cozinha, com um pedaço de bolo na mesa
const FotoLocal: React.FC = () => (
  <svg viewBox="0 0 166 150" width={166} height={150} style={{display: 'block'}}>
    <rect width="166" height="150" fill="#f3e0b5" />
    <rect x="18" y="18" width="56" height="48" fill="#83cdec" stroke="#2b1d0e" strokeWidth="4" />
    <path d="M46 18 V66 M18 42 H74" stroke="#2b1d0e" strokeWidth="3" />
    <rect x="0" y="104" width="166" height="46" fill="#8b5a2b" stroke="#2b1d0e" strokeWidth="3" />
    <ellipse cx="90" cy="100" rx="52" ry="10" fill="#fff" stroke="#888" strokeWidth="2" />
    <path d="M70 98 L104 74 L118 96 Z" fill="#f1cf6c" stroke="#2b1d0e" strokeWidth="3" strokeLinejoin="round" />
    <path d="M104 74 L118 96 L110 96 L100 80 Z" fill="#efa1b7" stroke="#2b1d0e" strokeWidth="2" />
    <circle cx="60" cy="96" r="3" fill="#7a4a1a" />
    <circle cx="56" cy="103" r="2" fill="#7a4a1a" />
    <circle cx="128" cy="101" r="3" fill="#7a4a1a" />
  </svg>
);

// Pasta do caso (manila): fechada entra na tela, abre no quadro `abre` e as pistas aparecem no seu quadro `at`.
// `t` é o quadro atual, no mesmo referencial de `abre` e de `at`.
export const PastaCaso: React.FC<{titulo: string; local: string; hora: string; pistas: {texto: string; at: number}[]; abre: number; t: number}> = ({
  titulo,
  local,
  hora,
  pistas,
  abre,
  t,
}) => {
  const {fps} = useVideoConfig();
  // a pasta fechada sobe de baixo (começa 40 quadros antes de abrir)
  const entrada = mola(t - (abre - 40), fps, {damping: 16, stiffness: 140});
  // a capa sobe e sai; a folha desliza para fora da pasta logo depois
  const capa = mola(t - abre, fps, {damping: 18, stiffness: 120});
  const folha = mola(t - abre - 6, fps, {damping: 16, stiffness: 150});
  const folhaTopo = 150 - 110 * folha;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 900,
        height: 620,
        marginLeft: -450,
        marginTop: -310,
        transform: `translateY(${(1 - entrada) * 900}px)`,
        overflow: 'hidden',
      }}
    >
      {/* aba do arquivo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 300,
          height: 74,
          boxSizing: 'border-box',
          background: '#b98a45',
          border: '6px solid #3b2a12',
          borderBottom: 'none',
          borderRadius: '18px 18px 0 0',
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 2,
          color: '#2b1d0e',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 22,
        }}
      >
        ARQUIVO Nº 0042
      </div>
      {/* corpo de trás da pasta */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 60,
          width: 900,
          height: 560,
          boxSizing: 'border-box',
          background: '#c99a55',
          border: '6px solid #3b2a12',
          borderRadius: '0 18px 18px 18px',
          boxShadow: '0 18px 0 #0009',
        }}
      />
      {/* folha de dentro (aparece quando a capa sobe) */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: folhaTopo,
          width: 800,
          height: 500,
          boxSizing: 'border-box',
          background: '#f7f0dc',
          border: '4px solid #7a6040',
          borderRadius: 6,
          boxShadow: '0 6px 14px #0006',
        }}
      >
        {/* clipe de papel */}
        <svg style={{position: 'absolute', left: 14, top: -22, transform: 'rotate(-12deg)'}} width="46" height="78" viewBox="0 0 46 78">
          <path d="M10 40 V12 a10 10 0 0 1 20 0 V56 a7 7 0 0 1 -14 0 V16" fill="none" stroke="#7d8790" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: 40, top: 34, width: 520, fontFamily: FONT.display, fontWeight: 900, fontSize: 42, lineHeight: 1.1, color: '#2b1d0e'}}>
          {titulo.toUpperCase()}
        </div>
        <div style={{position: 'absolute', left: 40, top: 112, fontFamily: FONT.mono, fontWeight: 700, fontSize: 19, color: '#5a4630'}}>
          Local: {local} · Hora: {hora}
        </div>
        <div style={{position: 'absolute', left: 40, top: 150, width: 520, borderTop: '3px solid #2b1d0e'}} />
        {/* carimbo CONFIDENCIAL */}
        <div
          style={{
            position: 'absolute',
            right: 34,
            top: 22,
            transform: 'rotate(7deg)',
            fontFamily: FONT.comic,
            fontSize: 34,
            letterSpacing: 2,
            color: '#e8202a',
            border: '4px solid #e8202a',
            borderRadius: 6,
            padding: '0 12px',
            opacity: 0.9,
          }}
        >
          CONFIDENCIAL
        </div>
        {/* polaroid do local */}
        <div
          style={{
            position: 'absolute',
            left: 572,
            top: 96,
            width: 190,
            boxSizing: 'border-box',
            background: '#fff',
            padding: '12px 12px 0',
            border: '2px solid #ddd',
            boxShadow: '0 8px 14px #0005',
            transform: 'rotate(4deg)',
          }}
        >
          <FotoLocal />
          <div style={{height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.comic, fontSize: 28, color: '#2b1d0e', letterSpacing: 1}}>
            {local.toUpperCase()}
          </div>
        </div>
        {/* pistas: digitadas uma a uma e depois carimbadas com OK */}
        <div style={{position: 'absolute', left: 40, top: 190, width: 470, display: 'flex', flexDirection: 'column', gap: 18}}>
          {pistas.map((p, i) => {
            const dt = t - p.at;
            const k = mola(dt, fps, {damping: 12, stiffness: 220});
            const inicioDigita = 4;
            const duracao = Math.max(14, Math.min(60, p.texto.length * 1.1));
            const pDig = Math.max(0, Math.min(1, (dt - inicioDigita) / duracao));
            const chars = Math.round(p.texto.length * pDig);
            const digitando = dt >= inicioDigita && pDig < 1;
            const dtCarimbo = dt - (inicioDigita + duracao);
            const carimbo = mola(dtCarimbo, fps, {damping: 9, stiffness: 300});
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  minHeight: 84,
                  opacity: dt < 0 ? 0 : Math.min(1, k * 2),
                  transform: `translateX(${(1 - k) * -80}px)`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '4px solid #3b2a12',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                  }}
                >
                  {iconeDe(p.texto)}
                </div>
                <div style={{flex: 1, fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, lineHeight: 1.3, color: '#2b1d0e'}}>
                  {p.texto.slice(0, chars)}
                  {digitando && <span style={{opacity: t % 8 < 4 ? 1 : 0}}>▌</span>}
                </div>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                    borderRadius: '50%',
                    border: '4px solid #e8202a',
                    color: '#e8202a',
                    fontFamily: FONT.comic,
                    fontSize: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `rotate(-14deg) scale(${1.7 - 0.7 * carimbo})`,
                    opacity: dtCarimbo < 0 ? 0 : Math.min(1, carimbo * 2),
                  }}
                >
                  OK
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* capa da pasta, com a etiqueta do caso (sai para cima ao abrir) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 60,
          width: 900,
          height: 560,
          boxSizing: 'border-box',
          background: '#e0b46a',
          border: '6px solid #3b2a12',
          borderRadius: '0 18px 18px 18px',
          transform: `translateY(${-capa * 700}px) rotate(${-capa * 3}deg)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 170,
            top: 150,
            width: 560,
            height: 220,
            boxSizing: 'border-box',
            background: '#fff',
            border: '3px solid #3b2a12',
            borderRadius: 8,
            padding: '24px 30px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 6px 0 #0005',
          }}
        >
          <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 18, color: '#5a4630', letterSpacing: 2}}>CASO EM ABERTO</div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, lineHeight: 1.1, color: '#2b1d0e', marginTop: 8}}>{titulo}</div>
          <div style={{fontFamily: FONT.mono, fontSize: 18, color: '#5a4630', marginTop: 12}}>{local} · {hora}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 470,
            top: 280,
            fontFamily: FONT.comic,
            fontSize: 60,
            color: '#e8202a',
            border: '6px solid #e8202a',
            borderRadius: 10,
            padding: '0 18px',
            transform: 'rotate(-9deg)',
            background: 'rgba(255,255,255,0.35)',
            ...strokeText(0),
          }}
        >
          CONFIDENCIAL
        </div>
      </div>
    </div>
  );
};

// Carimbo enorme que bate na tela: cai com mola, treme no impacto. x/y são o centro, em px.
export const Carimbo: React.FC<{texto: string; cor?: string; at: number; x?: number; y?: number; rot?: number}> = ({
  texto,
  cor = '#e8202a',
  at,
  x = 960,
  y = 540,
  rot = -8,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const dt = f - at;
  const k = spring({frame: dt, fps, config: {damping: 8, stiffness: 320, mass: 0.6}});
  const escala = 2.4 - 1.4 * k; // vem de cima e assenta com um pequeno repique
  const tremor = dt < 24 ? Math.sin(dt * 2.3) * (1 - dt / 24) * 16 : 0;
  const tam = texto.length > 10 ? 120 : texto.length > 7 ? 160 : 210;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${tremor}px, ${tremor * 0.4}px) rotate(${rot}deg) scale(${escala})`,
        opacity: Math.min(1, dt / 3),
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: FONT.comic,
          fontSize: tam,
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
          color: '#fff',
          background: cor,
          padding: '8px 48px 0',
          borderRadius: 26,
          border: '12px solid #fff',
          boxShadow: '0 22px 0 #0008',
          letterSpacing: 6,
          ...strokeText(10),
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// Contador de perguntas do detetive, no canto superior direito
export const Contador: React.FC<{n: number; total: number}> = ({n, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = mola(f + 1, fps, {damping: 14, stiffness: 200});
  const pct = Math.max(0, Math.min(100, (n / total) * 100));
  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        top: 30,
        background: '#fff',
        border: '6px solid #000',
        borderRadius: 16,
        padding: '6px 22px 14px',
        boxShadow: '0 10px 0 #000a',
        transform: `translateY(${(1 - k) * -120}px) scale(${0.6 + 0.4 * k})`,
        opacity: Math.min(1, k * 2),
        minWidth: 300,
      }}
    >
      <div style={{fontFamily: FONT.comic, fontSize: 52, color: '#111', letterSpacing: 2, lineHeight: 1.05}}>
        PERGUNTA {n}/{total}
      </div>
      <div style={{height: 14, borderRadius: 7, background: '#ddd', border: '3px solid #000', overflow: 'hidden', marginTop: 4}}>
        <div style={{width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #b9ed88, #f1cf6c)'}} />
      </div>
    </div>
  );
};

// Placa com quem é quem: entra deslizando do lado com mola, embaixo da tela
export const Placa: React.FC<{nome: string; papel: 'DETETIVE' | 'SUSPEITO'; cor: string; at: number; lado: 'esquerda' | 'direita'}> = ({
  nome,
  papel,
  cor,
  at,
  lado,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = mola(f - at, fps, {damping: 11, stiffness: 200, mass: 0.6});
  const esquerda = lado === 'esquerda';
  const lateral = esquerda ? {left: 36} : {right: 36};
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 36,
        ...lateral,
        width: 340,
        transform: `translateX(${(1 - k) * (esquerda ? -320 : 320)}px) rotate(${(1 - k) * (esquerda ? -6 : 6)}deg)`,
        opacity: Math.min(1, k * 2),
      }}
    >
      <div style={{background: '#fff', border: '6px solid #0b0b0b', borderRadius: 18, boxShadow: '0 10px 0 #000a', overflow: 'hidden'}}>
        <div
          style={{
            background: cor,
            color: '#fff',
            fontFamily: FONT.comic,
            fontSize: 30,
            letterSpacing: 3,
            padding: '4px 16px 2px',
            ...strokeText(3, '#000'),
          }}
        >
          {papel}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px'}}>
          <div
            style={{
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: '50%',
              background: cor,
              border: '4px solid #000',
              color: '#fff',
              fontFamily: FONT.comic,
              fontSize: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {nome.charAt(0).toUpperCase()}
          </div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#111', lineHeight: 1}}>{nome}</div>
        </div>
      </div>
    </div>
  );
};

// Balão de fala: o texto aparece no ritmo entre `at` e `ate` e some com mola depois de `ate`
export const Fala: React.FC<{nome: string; cor: string; texto: string; at: number; ate: number; lado: 'esquerda' | 'direita'}> = ({
  nome,
  cor,
  texto,
  at,
  ate,
  lado,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const entra = mola(f - at, fps, {damping: 13, stiffness: 220});
  const saiu = f > ate ? spring({frame: f - ate, fps, config: {damping: 20, stiffness: 200}}) : 0;
  const vis = Math.max(0, Math.min(1, entra * (1 - saiu)));
  const chars = Math.round(texto.length * progresso(f, at, ate));
  const falando = f < ate;
  const esquerda = lado === 'esquerda';
  const lateral = esquerda ? {left: 36} : {right: 36};
  const lado2 = esquerda ? {left: 76} : {right: 76};
  return (
    <div style={{position: 'absolute', bottom: 210, ...lateral, width: 640, transform: `translateY(${(1 - entra) * 40}px) scale(${0.85 + 0.15 * vis})`, opacity: vis}}>
      <div style={{position: 'relative', background: '#fff', border: '6px solid #0b0b0b', borderRadius: 28, padding: '16px 26px 20px', boxShadow: '0 12px 0 #000a'}}>
        <div
          style={{
            display: 'inline-block',
            background: cor,
            color: '#fff',
            fontFamily: FONT.comic,
            fontSize: 28,
            letterSpacing: 2,
            padding: '0 14px',
            borderRadius: 10,
            border: '4px solid #000',
            ...strokeText(2, '#000'),
          }}
        >
          {nome.toUpperCase()}
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: '#111', marginTop: 8, minHeight: 100}}>
          {texto.slice(0, chars)}
          {falando && <span style={{color: cor, opacity: f % 8 < 4 ? 1 : 0}}>▌</span>}
        </div>
      </div>
      {/* rabinho do balão, apontando para a placa */}
      <div style={{position: 'absolute', bottom: -34, ...lado2, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '34px solid #0b0b0b'}} />
      <div style={{position: 'absolute', bottom: -26, ...lado2, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '28px solid #fff'}} />
    </div>
  );
};

// Pensamento secreto: nuvem de borda tracejada, bolinhas de "pensamento" e o título fixo
export const PensamentoSecreto: React.FC<{nome: string; cor: string; texto: string; at: number; ate: number; lado: 'esquerda' | 'direita'}> = ({
  nome,
  cor,
  texto,
  at,
  ate,
  lado,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const entra = mola(f - at, fps, {damping: 13, stiffness: 200});
  const saiu = f > ate ? spring({frame: f - ate, fps, config: {damping: 20, stiffness: 200}}) : 0;
  const vis = Math.max(0, Math.min(1, entra * (1 - saiu)));
  const chars = Math.round(texto.length * progresso(f, at, ate));
  const esquerda = lado === 'esquerda';
  const lateral = esquerda ? {left: 36} : {right: 36};
  const balanco = Math.sin(f / 18) * 4; // a nuvem balança de leve
  const bolinhas = [
    {tam: 26, bottom: -40, lado: 90},
    {tam: 16, bottom: -66, lado: 66},
    {tam: 10, bottom: -84, lado: 50},
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 230,
        ...lateral,
        width: 640,
        transform: `translateY(${(1 - entra) * 40 + balanco}px) scale(${0.85 + 0.15 * vis})`,
        opacity: vis,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(28, 20, 52, 0.94)',
          border: `6px dashed ${cor}`,
          borderRadius: 60,
          padding: '20px 34px 24px',
          boxShadow: `0 0 30px ${cor}66`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
          <div style={{fontFamily: FONT.comic, fontSize: 30, letterSpacing: 2, color: '#fff'}}>PENSAMENTO SECRETO</div>
          <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 18, color: cor}}>{nome.toUpperCase()}</div>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontStyle: 'italic', fontSize: 34, lineHeight: 1.3, color: '#f4efff', marginTop: 8, minHeight: 90}}>
          “{texto.slice(0, chars)}
          {f < ate && <span style={{color: cor, fontStyle: 'normal', opacity: f % 8 < 4 ? 1 : 0}}>▌</span>}”
        </div>
      </div>
      {bolinhas.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: b.bottom,
            ...(esquerda ? {left: b.lado} : {right: b.lado}),
            width: b.tam,
            height: b.tam,
            borderRadius: '50%',
            background: 'rgba(28, 20, 52, 0.94)',
            border: `4px dashed ${cor}`,
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
};
