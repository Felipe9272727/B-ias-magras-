// A bomba do BOMBANANA! recriada para as IAs: módulos inspirados nos do jogo (Cabos, Slider de Cor, Direção,
// Calculadora e Símbolo), cada um com o que o Cego sente pelo tato, o que o Surdo vê, o que se ouve (bipes) e a regra
// do manual (que só o Mudo lê). As regras do manual são nossas (o jogo não publica as tabelas).

const sorteio = (r, l) => l[Math.floor(r() * l.length)]
export function aleatorio (semente) {  // mulberry32: as mesmas fases para todos os times
  let a = semente >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

const CORES_CABO = ['vermelho', 'azul', 'amarelo', 'branco', 'preto']
const LUZES = ['verde', 'vermelha', 'azul']
const ord = n => ['primeiro', 'segundo', 'terceiro', 'quarto'][n - 1]

// ---------- Cabos
function regraCabo (cabos, luz) {
  const n = cabos.length, ultimo = c => cabos.lastIndexOf(c) + 1, tem = c => cabos.includes(c)
  if (luz === 'verde') return n === 3 ? (tem('vermelho') ? ultimo('vermelho') : 2) : (cabos.filter(c => c === 'azul').length > 1 ? ultimo('azul') : 1)
  if (luz === 'vermelha') return n === 3 ? (cabos[2] === 'branco' ? 3 : 1) : (tem('amarelo') ? 4 : 3)
  return n === 3 ? (cabos[1] === 'azul' ? 2 : 3) : (cabos[0] === cabos[3] ? 2 : 1)
}
const MANUAL_CABO = `CABOS (contar os cabos da esquerda para a direita, do ponto de vista de quem está de frente para a bomba):
- Luz VERDE: com 3 cabos, se houver algum vermelho corte o ÚLTIMO vermelho; se não houver vermelho corte o 2º. Com 4 cabos, se houver mais de um azul corte o ÚLTIMO azul; senão corte o 1º.
- Luz VERMELHA: com 3 cabos, se o último for branco corte o 3º; senão corte o 1º. Com 4 cabos, se houver algum amarelo corte o 4º; senão corte o 3º.
- Luz AZUL: com 3 cabos, se o do meio for azul corte o 2º; senão corte o 3º. Com 4 cabos, se o 1º e o 4º forem da mesma cor corte o 2º; senão corte o 1º.`
function cabo (r) {
  const n = 3 + Math.floor(r() * 2)
  const cabos = Array.from({ length: n }, () => sorteio(r, CORES_CABO))
  const luz = sorteio(r, LUZES)
  return {
    tipo: 'cabo', nome: 'Cabos', cabos, luz, cortados: [], resolvido: false,
    certo: () => regraCabo(cabos, luz),
    tato: m => `${m.cabos.length} cabos esticados (posições 1 a ${m.cabos.length}, da esquerda para a direita)${m.cortados.length ? `; já cortados: ${m.cortados.join(', ')}` : ''}. Não dá pra sentir cor nem luz.`,
    visao: m => `${m.cabos.length} cabos, da esquerda para a direita: ${m.cabos.map((c, i) => `${i + 1}º ${c}${m.cortados.includes(i + 1) ? ' (cortado)' : ''}`).join(', ')}. Luz acesa: ${m.luz}.`,
    acoes: 'cortar_cabo(posição 1..N)'
  }
}

// ---------- Slider de cor
const CORES_SLIDER = { vermelho: 4, azul: 1, amarelo: 5, verde: 2, roxo: 3, laranja: 2 }
const MANUAL_SLIDER = `SLIDER DE COR (uma tela mostra uma cor; o slider tem 5 entalhes, 1 = ponta esquerda, 5 = ponta direita; leve o slider ao entalhe certo e trave):
vermelho -> 4 | azul -> 1 | amarelo -> 5 | verde -> 2 | roxo -> 3 | laranja -> 2. Se a bomba já tiver algum erro (X aceso), use o entalhe seguinte (5 vira 1).`
function slider (r) {
  const cor = sorteio(r, Object.keys(CORES_SLIDER))
  return {
    tipo: 'slider', nome: 'Slider de Cor', cor, pos: 3, resolvido: false,
    certo: (m, erros) => erros > 0 ? (CORES_SLIDER[cor] % 5) + 1 : CORES_SLIDER[cor],
    tato: m => `um slider com 5 entalhes (1 = esquerda, 5 = direita), agora no entalhe ${m.pos}, e um botão de travar. Tem uma tela lisa (não dá pra sentir nada nela).`,
    visao: m => `a tela do slider mostra a cor ${m.cor}; o slider está no entalhe ${m.pos} de 5.`,
    acoes: 'travar_slider(entalhe 1..5)'
  }
}

// ---------- Direção (luz + número em Braille)
const SETAS = ['cima', 'direita', 'baixo', 'esquerda']
const LUZ_DIR = ['verde', 'vermelha', 'azul', 'amarela']
const NUMS = [1, 2, 3, 4, 5, 6, 7, 9]
const TAB_DIR = { verde: [0, 1, 2, 3, 1, 2, 3, 0], vermelha: [2, 3, 0, 1, 3, 0, 1, 2], azul: [3, 0, 1, 2, 0, 1, 2, 3], amarela: [1, 2, 3, 0, 2, 3, 0, 1] }
const MANUAL_DIRECAO = `DIREÇÃO (uma luz colorida + um número em Braille que só dá pra ler com o dedo; aperte a seta certa; são 2 etapas, cada etapa troca a luz e o número):
Números na ordem 1,2,3,4,5,6,7,9 (não existe 8):
- luz VERDE:    cima, direita, baixo, esquerda, direita, baixo, esquerda, cima
- luz VERMELHA: baixo, esquerda, cima, direita, esquerda, cima, direita, baixo
- luz AZUL:     esquerda, cima, direita, baixo, cima, direita, baixo, esquerda
- luz AMARELA:  direita, baixo, esquerda, cima, baixo, esquerda, cima, direita
Esquerda e direita são do ponto de vista de quem está de frente para a bomba.`
function direcao (r) {
  const etapas = [0, 1].map(() => ({ luz: sorteio(r, LUZ_DIR), num: sorteio(r, NUMS) }))
  return {
    tipo: 'direcao', nome: 'Direção', etapas, etapa: 0, resolvido: false,
    certo: m => SETAS[TAB_DIR[m.etapas[m.etapa].luz][NUMS.indexOf(m.etapas[m.etapa].num)]],
    tato: m => `quatro botões de seta (cima, direita, baixo, esquerda) e uma plaquinha em Braille que diz o número ${m.etapas[m.etapa].num} (etapa ${m.etapa + 1} de 2). Não dá pra sentir a luz.`,
    visao: m => `luz ${m.etapas[m.etapa].luz} acesa, quatro setas; tem uma plaquinha com bolinhas em relevo (Braille) que você não sabe ler (etapa ${m.etapa + 1} de 2).`,
    acoes: 'apertar_seta(cima|direita|baixo|esquerda)'
  }
}

// ---------- Calculadora (2 etapas)
const TAB_CALC = { verde: { par: 3, impar: 7 }, vermelha: { par: 1, impar: 9 }, azul: { par: 6, impar: 2 } }
const MANUAL_CALC = `CALCULADORA (2 etapas): ETAPA 1: digite o resultado da conta que aparece na tela. ETAPA 2: depois do resultado aceito, acende uma luz; digite a tecla da tabela conforme a luz e se o resultado da etapa 1 era PAR ou ÍMPAR:
- luz VERDE: par -> 3, ímpar -> 7 | luz VERMELHA: par -> 1, ímpar -> 9 | luz AZUL: par -> 6, ímpar -> 2`
function calculadora (r) {
  const op = sorteio(r, ['+', '-', 'x'])
  let a = 10 + Math.floor(r() * 80), b = 2 + Math.floor(r() * 30)
  if (op === 'x') { a = 2 + Math.floor(r() * 12); b = 2 + Math.floor(r() * 9) }
  if (op === '-' && b > a) [a, b] = [b, a]
  const res = op === '+' ? a + b : op === '-' ? a - b : a * b
  const luz = sorteio(r, Object.keys(TAB_CALC))
  return {
    tipo: 'calculadora', nome: 'Calculadora', conta: `${a} ${op} ${b}`, res, luz, etapa: 0, resolvido: false,
    certo: m => m.etapa === 0 ? String(m.res) : String(TAB_CALC[m.luz][m.res % 2 === 0 ? 'par' : 'impar']),
    tato: m => `um teclado numérico com as teclas marcadas em Braille (0 a 9) e uma tela lisa (etapa ${m.etapa + 1} de 2).`,
    visao: m => m.etapa === 0 ? `a tela mostra a conta ${m.conta} = ?` : `a tela mostra "${m.res} OK" e acendeu a luz ${m.luz} (etapa 2 de 2).`,
    acoes: 'digitar(número)'
  }
}

// ---------- Símbolo (o seletor gira; só um símbolo apita, e só quem ouve percebe)
const SIMBOLOS = ['estrela', 'lua', 'triângulo', 'espiral', 'coroa', 'olho']
const BOTOES = ['vermelho', 'azul', 'verde', 'amarelo']
const TAB_SIMB = { estrela: ['azul', 'vermelho', 'amarelo', 'verde'], lua: ['verde', 'amarelo', 'azul', 'vermelho'], 'triângulo': ['vermelho', 'verde', 'vermelho', 'azul'], espiral: ['amarelo', 'azul', 'verde', 'amarelo'], coroa: ['verde', 'vermelho', 'azul', 'vermelho'], olho: ['azul', 'amarelo', 'vermelho', 'verde'] }
const MANUAL_SIMB = `SÍMBOLO (um seletor gira entre 4 símbolos; SÓ UM deles faz um bipe quando o seletor está nele - só quem ouve percebe; ache o símbolo que apita e aperte o botão da cor da tabela para a etapa atual; 4 etapas, o símbolo que apita é sempre o mesmo):
- estrela: azul, vermelho, amarelo, verde | lua: verde, amarelo, azul, vermelho | triângulo: vermelho, verde, vermelho, azul
- espiral: amarelo, azul, verde, amarelo | coroa: verde, vermelho, azul, vermelho | olho: azul, amarelo, vermelho, verde`
function simbolo (r) {
  const simbs = [...SIMBOLOS].sort(() => r() - 0.5).slice(0, 4)
  const bipa = Math.floor(r() * 4)
  const botoes = [...BOTOES].sort(() => r() - 0.5)
  return {
    tipo: 'simbolo', nome: 'Símbolo', simbs, bipa, botoes, sel: 0, etapa: 0, resolvido: false,
    certo: m => String(m.botoes.indexOf(TAB_SIMB[m.simbs[m.bipa]][m.etapa]) + 1),
    tato: m => `um seletor giratório com 4 posições (agora na posição ${m.sel + 1}) e 4 botões redondos iguais (posições 1 a 4, da esquerda para a direita). Etapa: dá pra sentir ${m.etapa} de 4 pinos levantados.`,
    som: m => m.sel === m.bipa ? `o módulo de símbolo está APITANDO (bip bip) com o seletor na posição ${m.sel + 1}` : `o módulo de símbolo está em silêncio (seletor na posição ${m.sel + 1})`,
    visao: m => `seletor apontando para o símbolo ${m.simbs[m.sel]} (posição ${m.sel + 1}; os 4 símbolos são ${m.simbs.map((s, i) => `${i + 1}:${s}`).join(', ')}); botões da esquerda para a direita: ${m.botoes.map((b, i) => `${i + 1}:${b}`).join(', ')}; ${m.etapa} de 4 luzinhas de etapa acesas. Você não ouve o bipe.`,
    acoes: 'girar_seletor(posição 1..4) e apertar_botao(posição 1..4)'
  }
}

export const MODULOS = { cabo, slider, direcao, calculadora, simbolo }
export const MANUAL = { cabo: MANUAL_CABO, slider: MANUAL_SLIDER, direcao: MANUAL_DIRECAO, calculadora: MANUAL_CALC, simbolo: MANUAL_SIMB }

// aplica uma ação do Cego; devolve { ok: true|false|null (null = só mexeu, não conta), texto, som }
export function aplicar (bomba, acao) {
  const m = bomba.modulos[acao.modulo - 1]
  if (!m) return { ok: null, texto: `não existe módulo ${acao.modulo}` }
  if (m.resolvido) return { ok: null, texto: `o módulo ${acao.modulo} (${m.nome}) já está desarmado` }
  const v = String(acao.valor ?? '').toLowerCase().trim()
  const acerto = (texto, fim = true) => { if (fim) m.resolvido = true; return { ok: true, texto, som: fim ? 'ding de módulo desarmado' : 'clique de etapa certa' } }
  const erro = texto => { bomba.erros++; return { ok: false, texto, som: 'BUZINA DE ERRO (um X acendeu)' } }
  switch (`${m.tipo}:${acao.tipo}`) {
    case 'cabo:cortar_cabo': {
      const p = Number(v); if (!(p >= 1 && p <= m.cabos.length) || m.cortados.includes(p)) return { ok: null, texto: 'esse cabo não existe ou já foi cortado' }
      m.cortados.push(p)
      return p === m.certo(m) ? acerto(`cortou o ${ord(p)} cabo: certo`) : erro(`cortou o ${ord(p)} cabo: errado`)
    }
    case 'slider:travar_slider': {
      const p = Number(v); if (!(p >= 1 && p <= 5)) return { ok: null, texto: 'entalhe inválido' }
      m.pos = p
      return p === m.certo(m, bomba.erros) ? acerto(`travou o slider no entalhe ${p}: certo`) : erro(`travou o slider no entalhe ${p}: errado`)
    }
    case 'direcao:apertar_seta': {
      if (!SETAS.includes(v)) return { ok: null, texto: 'seta inválida' }
      if (v !== m.certo(m)) return erro(`apertou a seta ${v}: errado`)
      m.etapa++
      return m.etapa >= 2 ? acerto(`apertou a seta ${v}: módulo desarmado`) : acerto(`apertou a seta ${v}: etapa 1 certa, troca luz e número`, false)
    }
    case 'calculadora:digitar': {
      const n = v.replace(/[^0-9-]/g, ''); if (!n) return { ok: null, texto: 'número inválido' }
      if (n !== m.certo(m)) return erro(`digitou ${n}: errado`)
      m.etapa++
      return m.etapa >= 2 ? acerto(`digitou ${n}: calculadora desarmada`) : acerto(`digitou ${n}: resultado aceito, agora acendeu uma luz`, false)
    }
    case 'simbolo:girar_seletor': {
      const p = Number(v); if (!(p >= 1 && p <= 4)) return { ok: null, texto: 'posição inválida' }
      m.sel = p - 1
      return { ok: null, texto: `girou o seletor para a posição ${p}`, som: m.sel === m.bipa ? 'bip bip bip' : null }
    }
    case 'simbolo:apertar_botao': {
      const p = Number(v); if (!(p >= 1 && p <= 4)) return { ok: null, texto: 'botão inválido' }
      if (String(p) !== m.certo(m)) return erro(`apertou o botão ${p}: errado`)
      m.etapa++
      return m.etapa >= 4 ? acerto(`apertou o botão ${p}: símbolo desarmado`) : acerto(`apertou o botão ${p}: etapa ${m.etapa} de 4 certa`, false)
    }
  }
  return { ok: null, texto: `a ação ${acao.tipo} não serve no módulo ${m.nome}` }
}
