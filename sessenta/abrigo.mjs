// Fase do abrigo (dias): situação para a IA, ração, expedições, doenças, loucura, mortes, fugas e o dia seguinte.
// Regras: docs/mecanica_abrigo.md (seções 1 a 5 e "Modelo para o código"). Fontes entre colchetes:
// [W] wiki de fãs, [W-O]/[W-R] só na versão original/Reatomized, [D] fontes divergem, [I] inferido,
// [NE] não encontrado na wiki, [P] proposta nossa a calibrar.
//
// Mudanças de estado passam pelas funções de estado.mjs (anotar, darItem, tirarItem, quebrarItem, adoecer, curar,
// ferir, cansar, enlouquecer, matar, sair, voltar). Três coisas NÃO têm função lá e são escritas direto aqui:
// os contadores de fome/sede/dias em casa/cansaço (são de abrigo.mjs), o campo `fora` e `noAbrigo` ao partir
// para uma expedição, e o `historico` que virarDia fecha. Vale passar isso para estado.mjs depois.
import {pessoa, noAbrigo, tem, anotar, darItem, tirarItem, quebrarItem, adoecer, curar, ferir, cansar, enlouquecer, matar, sair, voltar} from './estado.mjs'
import {ITENS} from './itens.mjs'

// ---------------------------------------------------------------- constantes

// Ração
export const QUARTOS_POR_LATA = 4           // [W] 1 lata de sopa = 4 rações (cada pessoa come 1/4 de lata)
export const QUARTOS_POR_GARRAFA = 4        // [W] 1 garrafa de água = 4 rações (cada pessoa bebe 1/4)
export const FOME_AVISO = 6                 // [W, D] "com fome" a partir de 6 dias sem refeição completa (texto de Soup; Hunger/Thirst diz 10)
export const FOME_FAMINTO = 10              // [W] faminto a partir de 10 dias sem sopa (limite)
export const FOME_MORTE = 11                // [W] morre no 11º dia sem sopa
export const FOME_APOS_FAMINTO = 8          // [W] faminto que come volta a 8; só a 2ª refeição seguida zera (morte ~3 dias depois sem ela)
export const SEDE_COM_SEDE = 3              // [P] "com sede" a partir de 3 dias sem água
export const SEDE_AVISO = 5                 // [W] 5 dias sem água = desidratado (limite)
export const SEDE_MORTE = 6                 // [W] morre no 6º dia sem água
export const FOME_DOBRADA = 2               // [W] em expedição (e no dia da volta) a fome sobe 2 por dia
export const CURA_SOPA = {0: 3, 1: 3, 2: 5, 3: 8, 4: 9} // [W] sopas seguidas para curar a doença básica, pelo número de dias sem refeição completa; 5+ = sem cura pela sopa [NE]. Contamos dias sem refeição com semComer no momento da sopa [P]

// Doença e ferimento
export const DOENCA_MORTE = [15, 20]        // [W] morte de 15 a 20 dias depois (infobox diz 20 a 40 [D])
export const FERIMENTO_MORTE = [8, 10]      // [W] morte de 8 a 10 dias sem tratamento
export const AGONIA_DIAS = 3                // [W-R] agonia nos 3 últimos dias antes da morte por ferimento (só exibido no texto)
export const FADIGA_DIAS = 20               // [W] fatigado após ~20 dias seguidos em casa, sem expedição; não cura
export const DIAS_CANSADO = 2               // [P] dias de cansaço depois de uma volta (duração não encontrada [NE])
export const CHANCE_CANSADO_NA_VOLTA = 0.3  // [P] "volta cansada em alguns casos" [W]; chance não informada

// Loucura (escala oculta 0 a 100 de estado.mjs; sobe com medo e tédio)
export const LOUCURA_LIMITE = 60            // [P] acima disso a pessoa está louca
export const LOUCURA_LEVE = 30              // [P] só para o texto: "um pouco estranho(a)"
export const LOUCURA_PRAZO = [25, 30]       // [W] sai de casa 25 a 30 dias depois de enlouquecer (faixa 20 a 35)
export const LOUCURA_SOZINHO_DIAS = 1       // [W] adulto sozinho em casa enlouquece no 2º dia (1 dia depois do começo)
export const LOUCURA_CRIANCA_SOZINHA = 5    // [P] pontos por dia para criança sozinha (a wiki diz só "uma chance", sem número)
export const DESVAIRADO_FRACAO = 0.9        // [P] "desvairado" quando passa 90% do prazo

// Clima lá fora
export const RADIACAO_FIM = 20              // [W] a radiação termina por volta do dia 20
export const RADIACAO_RADIO_INICIO = 7      // [W] com rádio, a queda pode ser anunciada entre os dias 7 e 20
export const CHANCE_RADIO_FIM_DIA = 0.2     // [P] chance por dia de o rádio anunciar a queda
export const CHANCE_EXPEDICAO_SEGUIDA = 0.3 // [P] chance de uma volta em clima neutro trazer o aviso de "seguida"
export const DIAS_ATE_BANDIDOS = 20         // [W] contagem de ~20 dias depois do aviso de "seguida"
export const BANDIDOS_ATAQUE_CADA = 3       // [W] ataques ao abrigo a cada 3 dias
export const CHANCE_DEFESA_ATAQUE = 0.7     // [P] chance de rifle ou machado espantar o ataque (não informada)

// Expedições
export const DIAS_EXPEDICAO = 2             // [P] duração comum não encontrada [NE]; saídas de evento são de 2 dias [W]
export const MAX_ITENS_SEM_MALA = 1         // [W] leva-se um item por expedição
export const MAX_ITENS_COM_MALA = 4         // [W] com a mala são 4 itens, a própria mala conta
// chances (%) de [volta bem, volta machucado, não volta]. Em radiação, "machucado" = doente; em bandidos = ferido.
export const RETORNO = {
  radioMascara: {bem: 70, seg: 20, nao: 10},      // [W] radiação, com máscara
  radioSemMascara: {bem: 10, seg: 70, nao: 20},   // [W] radiação, sem máscara
  radioJaDoente: {bem: 0, seg: 76, nao: 24},      // [W, a confirmar] já doente, com radiação
  neutro: {bem: 85, seg: 10, nao: 5},             // [P] wiki não encontrou [NE]; "a opção mais segura, mas ainda pode falhar" [W]
  bandidos: {bem: 20, seg: 20, nao: 60},          // [P] "risco extremamente alto" [W]; "não volta" vira captura
}
export const AJUSTE_MAU_ESTADO = 5          // [P] cada estado ruim (doente, ferido, louco, fatigado) tira 5 pontos de "volta bem"
export const AJUDA_MAU_ESTADO = 10          // [P] item que ajuda (abaixo) devolve 10 pontos quando alguém está em mau estado
export const ITENS_QUE_AJUDAM = ['mapa', 'lanterna', 'manual', 'sopa', 'agua'] // [W] §4.5
export const CONSUMIVEIS = ['sopa', 'agua', 'kit', 'inseticida']             // [W] usados ou perdidos na estrada (repelente é consumido)
export const CHANCE_ITEM_PERDIDO = 0.05     // [P] item que fica lá fora (chance não informada [NE])
export const CHANCE_ITEM_QUEBRA = 0.15      // [P] item que volta quebrado (chance não informada [NE]; "aumenta com a dificuldade" [W])
export const CHANCE_ACHAR_ITEM = 0.6        // [P] chance de cada sorteio do local achar um item
export const CHANCE_ACHAR_ITEM_FATIGADO = 0.3 // [P] fadiga reduz os itens encontrados [W]
export const CHANCE_BONUS_ITEM = 0.5        // [P] item levado "pode" trazer o extra da tabela 4.6 [W]

// Locais de busca (§4.7): sopa e água que dá, e os itens que podem sair. 'ALEATORIO' = qualquer item do catálogo.
// Ajustes: "munição" não existe no itens.mjs e sai das listas; "repelente" = inseticida; "Macaco que acompanha" virou
// "Um macaco simpático" (nosso texto). A nave caída usa só a variante "aleatório" [W, uma das três].
const NADA = {nome: 'nada', nada: true}
export const LOCAIS = [
  {nome: 'Banco', sopa: 4, agua: 1, itens: ['baralho', 'cadeado', 'mala']},
  {nome: 'Bar', sopa: 1, agua: 2, itens: ['baralho', 'damas']},
  {nome: 'Boliche', sopa: 3, agua: 2, itens: ['cadeado', 'damas', 'radio']},
  {nome: 'Rodoviária', sopa: 1, agua: 2, itens: ['radio']},
  {nome: 'Igreja', sopa: 1, agua: 2, itens: ['lanterna']},
  {nome: 'Cinema', sopa: 2, agua: 2, itens: ['cadeado', 'baralho', 'lanterna']},
  {nome: 'Prefeitura', sopa: 0, agua: 2, itens: ['radio', 'kit', 'mapa']},
  {nome: 'Docas', sopa: 5, agua: 4, itens: ['damas']},
  {nome: 'Casa de um colega', sopa: 2, agua: 2, itens: ['damas', 'mascara', 'mala']},
  {nome: 'Corpo de bombeiros', sopa: 0, agua: 3, itens: ['machado', 'cadeado', 'inseticida']},
  {nome: 'Posto de gasolina', sopa: 1, agua: 1, itens: ['inseticida', 'mapa', 'baralho']},
  {nome: 'Hospital', sopa: 1, agua: 2, itens: ['kit', 'mascara', 'machado']},
  {nome: 'Hotel', sopa: 1, agua: 1, itens: ['damas', 'lanterna', 'machado']},
  {nome: 'Biblioteca', sopa: 1, agua: 2, itens: ['rifle', 'manual']},
  {nome: 'Quintal da família', sopa: 2, agua: 2, itens: ['machado', 'rifle', 'inseticida', 'manual', 'ALEATORIO']},
  {nome: 'Estação de metrô', sopa: 2, agua: 2, itens: ['inseticida', 'mala']},
  {nome: 'Um macaco simpático', sopa: 2, agua: 1, itens: ['kit']},
  {nome: 'Museu', sopa: 2, agua: 2, itens: ['mascara', 'cadeado']},
  {nome: 'Vizinhança', sopa: 1, agua: 1, itens: ['manual', 'lanterna']},
  {nome: 'Estacionamento', sopa: 2, agua: 2, itens: ['mala', 'machado', 'lanterna']},
  {nome: 'Delegacia', sopa: 1, agua: 1, itens: ['rifle', 'mapa']},
  {nome: 'Escola', sopa: 1, agua: 2, itens: ['manual', 'mapa', 'mascara']},
  {nome: 'Nave caída', sopa: 0, agua: 2, itens: ['ALEATORIO']},
  {nome: 'Loja', sopa: 4, agua: 4, itens: ['radio', 'kit', 'mascara']},
  {nome: 'Supermercado', sopa: 4, agua: 6, itens: ['radio', 'mapa', 'rifle', 'inseticida', 'lanterna']},
  {nome: 'Lançamento de suprimentos', sopa: 2, agua: 2, itens: ['machado', 'radio', 'kit', 'rifle', 'mascara']},
  {nome: 'Teatro', sopa: 2, agua: 3, itens: ['cadeado', 'mala', 'machado']},
  {nome: 'Lixeiras', sopa: 1, agua: 1, itens: ['radio', 'rifle', 'mascara']},
  {nome: 'Mochila de saqueador', sopa: 1, agua: 2, itens: ['kit', 'baralho']},
  {nome: 'Feiticeiros', sopa: 0, agua: 0, itens: [], escambo: true}, // escambo: troca um item seu por rádio [W]
  {nome: 'Iate', sopa: 1, agua: 2, itens: ['mapa', 'radio']},
  {nome: 'Zoológico', sopa: 0, agua: 2, itens: ['ALEATORIO'], sorteios: 3}, // "3 aleatórios" [W]
  NADA,
]

// Bônus por item levado (§4.6): cada item tem uma sequência de três saídas, uma por expedição em que volta com ele.
// "Munição" não existe no catálogo: vira 'ALEATORIO' [P].
export const BONUS_ITEM = {
  baralho: [{agua: 2}, {item: 'manual'}, {item: 'mapa'}],
  damas: [{sopa: 3}, {item: 'radio'}, {item: 'ALEATORIO'}],
  gaita: [{item: 'ALEATORIO'}, {item: 'ALEATORIO'}],
  cadeado: [{agua: 2}, {item: 'manual'}, {item: 'rifle'}],
  radio: [{agua: 3}, {item: 'kit'}, {item: 'rifle'}],
  inseticida: [{sopa: 2}, {item: 'mapa'}, {item: 'radio'}],
}

// O que cada pessoa destrói quando enlouquece, na metade do prazo (§2.5) [W]
export const DESTROI_LOUCURA = {
  pai: ['mascara', 'mapa', 'sopa', 'agua'],
  mae: ['radio', 'baralho', 'sopa', 'agua'],
  filha: ['lanterna', 'machado', 'sopa', 'agua'],
  filho: ['kit', 'manual', 'sopa', 'agua'],
}

// ---------------------------------------------------------------- utilitários

const ADULTOS = ['pai', 'mae']
const ehAdulto = (p) => ADULTOS.includes(p.id)
const dias = (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`
const climaAtual = (e) => e.flags['abrigo.clima'] ?? 'radioativo'
const TODOS_ITENS = Object.keys(ITENS).filter((k) => k !== 'sopa' && k !== 'agua')
const CAUSA = {fome: 'à fome', sede: 'à sede', doença: 'à doença', ferimento: 'ao ferimento'}
const MOTIVO_FUGA = {
  loucura: 'saiu de casa por loucura (conta como perdido)',
  capturado: 'foi levado(a) pelos bandidos',
  fome: 'fugiu de casa com fome',
  sede: 'fugiu de casa com sede',
  doença: 'fugiu de casa doente',
  ferimento: 'fugiu de casa ferido(a)',
}
const DESCRICAO_CLIMA = {
  radioativo: 'o ar é radioativo (sem máscara de gás, quem sai adoece com muita chance; a radiação deve acabar por volta do dia 20)',
  neutro: 'a radiação já passou, mas lá fora ainda é perigoso',
  bandidos: 'há bandidos rondando: sair é uma roleta e a casa pode ser atacada',
}

const porcaoDe = (tipo) => (tipo === 'sopa' ? QUARTOS_POR_LATA : QUARTOS_POR_GARRAFA)
const chaveQuartos = (tipo) => (tipo === 'sopa' ? 'abrigo.quartos_sopa' : 'abrigo.quartos_agua')
const quartosDe = (e, tipo) => e.flags[chaveQuartos(tipo)] ?? 0
const setQuartos = (e, tipo, n) => { e.flags[chaveQuartos(tipo)] = n }
export const quartosTotais = (e, tipo) => (e.itens[tipo] ?? 0) * porcaoDe(tipo) + quartosDe(e, tipo)

// Sorteia uma vez a duração (doença, ferimento, prazo da loucura) e guarda: fica igual até o fim da partida.
function limite(e, chave, [min, max]) {
  const k = `abrigo.limite.${chave}`
  if (e.flags[k] === undefined) e.flags[k] = e.rng.estados.int(min, max)
  return e.flags[k]
}
const limiteLido = (e, chave) => e.flags[`abrigo.limite.${chave}`] // sem sortear (usado na situação)

// estado.mjs não tem função para pôr alguém em expedição nem para tirar; escrevemos os campos aqui.
function partir(p, fora) {
  p.fora = fora
  p.noAbrigo = false
  p.diasDentro = 0
}
function liberarFora(p) {
  p.fora = null
}

// ---------------------------------------------------------------- situação (texto para a IA)

function descreverPessoa(e, p) {
  if (!p.vivo) {
    if (p.perdido) return 'perdido(a): ficou na casa quando o abrigo fechou'
    return p.morte ? `morto(a) no dia ${p.morte.dia} (${p.morte.causa})` : 'morto(a) antes do abrigo'
  }
  if (p.fugiu) return MOTIVO_FUGA[p.fugiu] ?? 'fugiu de casa'
  if (p.fora) {
    const levou = p.fora.itens.length ? `, levou ${p.fora.itens.map((i) => ITENS[i].nome).join(' e ')}` : ''
    return `fora em expedição até o dia ${p.fora.volta}${levou}`
  }
  const partes = ['no abrigo']
  if (p.semComer >= FOME_FAMINTO) partes.push(`com muita fome (${dias(p.semComer)} sem refeição completa)`)
  else if (p.semComer >= FOME_AVISO) partes.push(`com fome (${dias(p.semComer)} sem refeição completa)`)
  if (p.semBeber >= SEDE_AVISO) partes.push(`desidratado(a) (${dias(p.semBeber)} sem água)`)
  else if (p.semBeber >= SEDE_COM_SEDE) partes.push('com sede')
  if (p.doente) partes.push(`doente há ${dias(e.dia - p.doente.desde)}`)
  if (p.ferido) {
    const d = e.dia - p.ferido.desde
    const lim = limiteLido(e, `ferimento.${p.id}.${p.ferido.desde}`)
    partes.push(lim !== undefined && d >= lim - AGONIA_DIAS ? 'à beira da morte (agonia)' : `ferido(a) há ${dias(d)}`)
  }
  if (p.cansado > 0) partes.push('cansado(a)')
  if (e.flags[`abrigo.fadigado.${p.id}`]) partes.push('fatigado(a) de tanto ficar em casa')
  if (p.loucura >= LOUCURA_LIMITE) {
    const L = e.flags[`abrigo.loucura.${p.id}`]
    const desvairado = L && e.dia - L.inicio >= L.prazo * DESVAIRADO_FRACAO
    partes.push(desvairado ? 'desvairado(a)' : 'estranho(a), com olhar perdido')
  } else if (p.loucura >= LOUCURA_LEVE) partes.push('um pouco estranho(a)')
  if (p.mutante) partes.push('mutante (não precisa de água)')
  return partes.join(', ')
}

// Texto em português para a IA no começo do dia.
export function situacao(e) {
  const linhas = [`Dia ${e.dia}. Lá fora: ${DESCRICAO_CLIMA[climaAtual(e)]}.`, '', 'Pessoas (nas escolhas, use o id entre colchetes):']
  for (const p of e.pessoas) linhas.push(`- ${p.nome} [${p.id}], ${p.papel}: ${descreverPessoa(e, p)}.`)
  linhas.push('', 'Recursos:')
  const gente = Math.max(1, noAbrigo(e).length)
  for (const tipo of ['sopa', 'agua']) {
    const nomeT = tipo === 'sopa' ? 'Sopa' : 'Água'
    const unidade = tipo === 'sopa' ? 'lata(s)' : 'garrafa(s)'
    const racoes = Math.floor(quartosTotais(e, tipo) / gente)
    linhas.push(`- ${nomeT}: ${e.itens[tipo]} ${unidade} fechada(s) e ${quartosDe(e, tipo)} quarto(s) aberto(s); dá para cerca de ${racoes} ração(ões) para cada um no abrigo.`)
  }
  const outros = TODOS_ITENS.filter((k) => (e.itens[k] ?? 0) > 0)
  linhas.push(`- Itens: ${outros.length ? outros.map((k) => ITENS[k].nome + (e.quebrados[k] ? ' (quebrado)' : '')).join(', ') : 'nenhum'}.`)
  linhas.push('', 'Diário de ontem:')
  const ontem = e.historico[e.historico.length - 1]
  if (!ontem) linhas.push('- Ainda não há: este é o primeiro dia.')
  else if (!ontem.diario.length) linhas.push('- Nada anotado.')
  else for (const l of ontem.diario) linhas.push(`- ${l}`)
  return linhas.join('\n')
}

// ---------------------------------------------------------------- ração

// Quem pode receber sopa e água hoje: quem está no abrigo e vivo (a mutante não bebe água [W]).
export function opcoesRacao(e) {
  const presentes = noAbrigo(e)
  return {
    sopa: presentes.map((p) => p.id),
    agua: presentes.filter((p) => !p.mutante).map((p) => p.id),
    estoque: {sopa: quartosTotais(e, 'sopa'), agua: quartosTotais(e, 'agua')}, // em quartos
  }
}

// Tira 1 quarto do estoque; se acabou, abre uma lata/garrafa inteira (vira 4 quartos). Falso se não há nada.
function gastarPorcao(e, tipo) {
  let q = quartosDe(e, tipo)
  if (q < 1) {
    if ((e.itens[tipo] ?? 0) < 1) return false
    tirarItem(e, tipo, 1, `Abrimos ${ITENS[tipo].nome}: dá para ${porcaoDe(tipo)} porções.`)
    q += porcaoDe(tipo)
  }
  setQuartos(e, tipo, q - 1)
  return true
}

// Cura pela sopa (§3.3): só doença sem ferimento, porque curar() de estado.mjs tiraria os dois de uma vez.
// diasSemComer = quantos dias a pessoa estava sem refeição completa antes desta sopa.
function tentarCurarPelaSopa(e, p, diasSemComer) {
  const k = `abrigo.sopas_cura.${p.id}`
  const precisa = CURA_SOPA[diasSemComer]
  if (precisa === undefined) return // faz dias demais sem comer: a sopa não cura mais [W]
  const n = (e.flags[k] ?? 0) + 1
  if (n >= precisa) {
    e.flags[k] = 0
    curar(e, p.id, `${p.nome} melhorou com a sopa.`)
    return
  }
  e.flags[k] = n
  anotar(e, `${p.nome} tomou sopa e continua doente (${n} de ${precisa}).`)
}

// Aplica a ração de hoje. Uma vez por dia. escolha = {sopa: [ids], agua: [ids]}.
export function aplicarRacao(e, escolha = {}) {
  if (e.flags['abrigo.racao_dia'] === e.dia) return {ok: false, motivo: 'hoje já houve racionamento'}
  e.flags['abrigo.racao_dia'] = e.dia
  const op = opcoesRacao(e)
  const comeram = []
  const beberam = []
  const faltouSopa = []
  const faltouAgua = []
  for (const id of new Set(escolha.sopa ?? [])) {
    const p = pessoa(e, id)
    if (!op.sopa.includes(id)) continue
    if (!gastarPorcao(e, 'sopa')) { faltouSopa.push(id); continue }
    comeram.push(id)
    const diasSemComer = p.semComer
    p.semComer = p.semComer >= FOME_FAMINTO ? FOME_APOS_FAMINTO : 0
    e.flags[`abrigo.comeu.${id}`] = e.dia
    if (p.doente && !p.ferido) tentarCurarPelaSopa(e, p, diasSemComer)
  }
  for (const id of new Set(escolha.agua ?? [])) {
    const p = pessoa(e, id)
    if (!op.agua.includes(id)) continue
    if (!gastarPorcao(e, 'agua')) { faltouAgua.push(id); continue }
    beberam.push(id)
    p.semBeber = 0 // uma água zera a sede, mesmo para quem está desidratado [W]
  }
  const nomes = (ids) => ids.map((id) => pessoa(e, id).nome).join(', ')
  anotar(e, comeram.length ? `Sopa para ${nomes(comeram)}.` : 'Hoje ninguém comeu. Fingimos que não estamos com fome.')
  anotar(e, beberam.length ? `Água para ${nomes(beberam)}.` : 'Hoje ninguém bebeu.')
  if (faltouSopa.length) anotar(e, `Faltou sopa para ${nomes(faltouSopa)}. O estoque acabou.`)
  if (faltouAgua.length) anotar(e, `Faltou água para ${nomes(faltouAgua)}. O estoque acabou.`)
  return {ok: true, sopa: comeram, agua: beberam, faltou: [...new Set([...faltouSopa, ...faltouAgua])]}
}

// ---------------------------------------------------------------- expedições

// Quem pode sair e que itens pode levar (uma pessoa de cada vez [I]; cansado não sai [W]).
// A última pessoa no abrigo só sai se o cadeado ficar na casa [W]: "se a última pessoa sai sem deixar o cadeado,
// o abrigo pode ser tomado". A consequência (tomada) é do módulo de finais.
export function opcoesExpedicao(e) {
  if (e.pessoas.some((p) => p.vivo && p.fora)) {
    return {quem: [], itens: [], motivo: 'alguém já está em expedição (só uma pessoa sai por vez)'}
  }
  const presentes = noAbrigo(e)
  const ultimo = presentes.length === 1
  const cadeadoEmCasa = tem(e, 'cadeado')
  return {
    quem: presentes.filter((p) => p.cansado <= 0 && (!ultimo || cadeadoEmCasa)).map((p) => p.id),
    itens: Object.keys(ITENS).filter((k) => tem(e, k) && !(ultimo && k === 'cadeado')),
    capacidade: {semMala: MAX_ITENS_SEM_MALA, comMala: MAX_ITENS_COM_MALA},
  }
}

// Manda uma pessoa para fora com itens. Os itens saem do estoque até ela voltar.
export function enviarExpedicao(e, quem, itens = []) {
  const op = opcoesExpedicao(e)
  const p = pessoa(e, quem)
  if (!op.quem.includes(quem)) return {ok: false, motivo: op.motivo ?? `${p?.nome ?? quem} não pode sair agora`}
  const lista = [...new Set(itens)]
  const cap = lista.includes('mala') ? MAX_ITENS_COM_MALA : MAX_ITENS_SEM_MALA
  if (lista.length > cap) return {ok: false, motivo: `cabem no máximo ${cap} itens`}
  if (p.mutante && lista.length) return {ok: false, motivo: 'a mutante não leva item'}
  for (const it of lista) {
    if (!tem(e, it)) return {ok: false, motivo: `não temos ${ITENS[it]?.nome ?? it} em bom estado`}
  }
  for (const it of lista) tirarItem(e, it, 1, `${ITENS[it].nome} foi com ${p.nome}.`)
  partir(p, {
    local: null, // sorteado na volta (virarDia), como a wiki faz com o local [P]
    saiu: e.dia,
    volta: e.dia + DIAS_EXPEDICAO,
    itens: lista,
    fadigado: !!e.flags[`abrigo.fadigado.${p.id}`],
  })
  anotar(e, `${p.nome} saiu para expedição${lista.length ? ` com ${lista.map((i) => ITENS[i].nome).join(', ')}` : ' de mãos vazias'}.`)
  return {ok: true, fora: p.fora}
}

// Chances de [bem, machucado, não volta] para a condição lá fora e o estado de quem sai.
function chancesDeRetorno(clima, p, mascara) {
  if (clima === 'bandidos') return {...RETORNO.bandidos}
  if (clima === 'radioativo') {
    if (p.doente) return {...RETORNO.radioJaDoente}
    return {...(mascara ? RETORNO.radioMascara : RETORNO.radioSemMascara)}
  }
  return {...RETORNO.neutro}
}

// Sorteia um item da lista do local. Quem já tem um item funcional não o acha de novo [W, regra do mapa; [I] para os outros].
function sortearItem(e, lista) {
  const pool = new Set()
  for (const x of lista) {
    for (const k of x === 'ALEATORIO' ? TODOS_ITENS : [x]) {
      if (!tem(e, k) && k !== 'sopa' && k !== 'agua') pool.add(k)
    }
  }
  if (!pool.size) return null
  return e.rng.expedicao.escolher([...pool])
}

function aplicarBonus(e, origem, res) {
  const txt = `${ITENS[origem].nome} trouxe um extra`
  if (res.sopa) return darItem(e, 'sopa', res.sopa, `${txt}: ${res.sopa} latas de sopa.`)
  if (res.agua) return darItem(e, 'agua', res.agua, `${txt}: ${res.agua} garrafas de água.`)
  const item = res.item === 'ALEATORIO' ? sortearItem(e, ['ALEATORIO']) : res.item
  if (item) darItem(e, item, 1, `${txt}: ${ITENS[item].nome}.`)
}

// Busca no local sorteado (§4.7) e o extra de cada item levado (§4.6). Itens trocados não voltam.
function saquear(e, p, f, trocados) {
  const local = e.rng.expedicao.escolher(LOCAIS)
  if (local.nada) {
    anotar(e, `${p.nome} procurou e não achou nada que valesse a pena.`)
  } else if (local.escambo) {
    const troca = f.itens.find((i) => !trocados.has(i) && !CONSUMIVEIS.includes(i))
    if (troca) {
      trocados.add(troca)
      darItem(e, 'radio', 1, `Os feiticeiros aceitaram ${ITENS[troca].nome} em troca de um rádio.`)
    } else anotar(e, 'Os feiticeiros queriam alguma coisa em troca, e não levamos nada.')
  } else {
    anotar(e, `Lugar da busca: ${local.nome}.`)
    if (local.sopa) darItem(e, 'sopa', local.sopa, `${p.nome} trouxe ${local.sopa} lata(s) de sopa.`)
    if (local.agua) darItem(e, 'agua', local.agua, `${p.nome} trouxe ${local.agua} garrafa(s) de água.`)
    const chance = f.fadigado ? CHANCE_ACHAR_ITEM_FATIGADO : CHANCE_ACHAR_ITEM
    for (let k = 0; k < (local.sorteios ?? 1); k++) {
      if (e.rng.expedicao() >= chance) continue
      const item = sortearItem(e, local.itens)
      if (item) darItem(e, item, 1, `${p.nome} achou: ${ITENS[item].nome}.`)
    }
  }
  for (const it of f.itens) {
    const kB = `abrigo.bonus.${it}`
    const lista = BONUS_ITEM[it]
    const passo = e.flags[kB] ?? 0
    if (trocados.has(it) || !lista || passo >= lista.length) continue
    if (e.rng.expedicao() >= CHANCE_BONUS_ITEM) continue
    e.flags[kB] = passo + 1
    aplicarBonus(e, it, lista[passo])
  }
}

// Itens que voltam para a casa (consumidos somem; alguns ficam lá fora ou quebram).
function devolverItens(e, p, f, trocados) {
  for (const it of f.itens) {
    if (trocados.has(it)) continue
    const nomeIt = ITENS[it].nome
    if (CONSUMIVEIS.includes(it)) { anotar(e, `${nomeIt} foi gasto na estrada.`); continue }
    if (e.rng.expedicao() < CHANCE_ITEM_PERDIDO) { anotar(e, `${nomeIt} ficou lá fora.`); continue }
    darItem(e, it, 1, `${nomeIt} voltou com ${p.nome}.`)
    if (e.rng.expedicao() < CHANCE_ITEM_QUEBRA) quebrarItem(e, it, `${nomeIt} voltou quebrado.`)
  }
}

// Resolve a volta de uma expedição: sorteia o desfecho e o que trouxe.
function resolverRetorno(e, p) {
  const f = p.fora
  const hoje = e.dia
  const clima = climaAtual(e)
  const mau = [p.doente, p.ferido, p.loucura >= LOUCURA_LIMITE, f.fadigado].filter(Boolean).length
  const mascara = f.itens.includes('mascara')
  let {bem, seg, nao} = chancesDeRetorno(clima, p, mascara)
  const tirado = Math.min(bem, mau * AJUSTE_MAU_ESTADO)
  bem -= tirado
  nao += tirado
  if (mau > 0 && f.itens.some((i) => ITENS_QUE_AJUDAM.includes(i))) {
    const ajuda = Math.min(nao, AJUDA_MAU_ESTADO)
    nao -= ajuda
    bem += ajuda
  }
  const total = bem + seg + nao
  const sorte = e.rng.expedicao() * total
  const desfecho = sorte < bem ? 'bem' : sorte < bem + seg ? 'seg' : 'nao'

  liberarFora(p)
  if (desfecho === 'nao') {
    if (clima === 'bandidos') sair(e, p.id, 'capturado', `${p.nome} não voltou: os bandidos levaram. O que tinha na mão ficou com eles.`)
    else matar(e, p.id, 'expedição', `${p.nome} não voltou da expedição. Ficou lá fora com tudo o que levou.`)
    return
  }

  const seguro = desfecho === 'bem'
  voltar(e, p.id, `${p.nome} voltou da expedição.`)
  e.flags[`abrigo.voltou.${p.id}`] = hoje
  if (!seguro) {
    if (clima === 'bandidos') ferir(e, p.id, `${p.nome} voltou ferido(a), com cara de quem viu coisa feia.`)
    else adoecer(e, p.id, `${p.nome} voltou doente. Alguém me dá um chá.`)
  } else if (e.rng.expedicao() < CHANCE_CANSADO_NA_VOLTA) {
    cansar(e, p.id, DIAS_CANSADO, `${p.nome} voltou cansado(a).`)
  }
  if (clima === 'neutro' && e.flags['abrigo.bandidos_em'] === undefined && e.rng.expedicao() < CHANCE_EXPEDICAO_SEGUIDA) {
    e.flags['abrigo.bandidos_em'] = hoje + DIAS_ATE_BANDIDOS
    anotar(e, 'Voltamos com a sensação de que alguém nos seguiu. Ainda não sabemos quem.')
  }

  const trocados = new Set()
  saquear(e, p, f, trocados)
  devolverItens(e, p, f, trocados)
}

// ---------------------------------------------------------------- o dia seguinte

function atualizarClima(e) {
  const hoje = e.dia
  const clima = climaAtual(e)
  if (clima === 'bandidos') return
  const bandidosEm = e.flags['abrigo.bandidos_em']
  if (bandidosEm !== undefined && hoje >= bandidosEm) {
    e.flags['abrigo.clima'] = 'bandidos'
    e.flags['abrigo.bandidos_desde'] = hoje
    anotar(e, 'Os bandidos chegaram ao bairro. Agora cada saída é uma roleta.')
    return
  }
  if (clima === 'radioativo') {
    const radioAvisa = hoje >= RADIACAO_RADIO_INICIO && tem(e, 'radio') && e.rng.geral.chance(CHANCE_RADIO_FIM_DIA)
    if (radioAvisa || hoje >= RADIACAO_FIM) {
      e.flags['abrigo.clima'] = 'neutro'
      anotar(e, radioAvisa ? 'O rádio anunciou: a radiação lá fora caiu.' : 'A radiação lá fora acabou. Dá para respirar sem máscara, mais ou menos.')
    }
  }
}

function ataqueDeBandidos(e) {
  if ((tem(e, 'rifle') || tem(e, 'machado')) && e.rng.geral.chance(CHANCE_DEFESA_ATAQUE)) {
    anotar(e, 'Os bandidos vieram. O rifle (ou o machado) fez o serviço e eles foram embora.')
    return
  }
  const candidatos = Object.keys(e.itens).filter((k) => e.itens[k] > 0)
  if (!candidatos.length) { anotar(e, 'Os bandidos vieram e não acharam nada. Ficaram ofendidos.'); return }
  const item = e.rng.geral.escolher(candidatos)
  tirarItem(e, item, 1, `Os bandidos levaram ${ITENS[item].nome}.`)
}

function destruirPorLoucura(e, p) {
  const candidatos = DESTROI_LOUCURA[p.id].filter((i) => tem(e, i))
  if (!candidatos.length) { anotar(e, `${p.nome} quebrou o que tinha à mão, mas não sobrou nada útil.`); return }
  const item = e.rng.estados.escolher(candidatos)
  if (item === 'sopa' || item === 'agua') tirarItem(e, item, 1, `${p.nome}, fora de si, jogou fora ${ITENS[item].nome}.`)
  else quebrarItem(e, item, `${p.nome}, fora de si, quebrou ${ITENS[item].nome}.`)
}

function morrerOuFugir(e, p, causa) {
  if (ehAdulto(p)) return matar(e, p.id, causa, `${p.nome} não resistiu ${CAUSA[causa]}. Nós vamos sentir falta.`)
  return sair(e, p.id, causa, `${p.nome} não resistiu ${CAUSA[causa]} e fugiu de casa. Não morreu: fugiu. Nós preferimos acreditar nisso.`)
}

// Avança um dia: fecha o diário de hoje, resolve as voltas, sobe os contadores, checa mortes, fugas e loucura.
export function virarDia(e) {
  if (e.final) return
  e.historico.push({dia: e.dia, diario: e.diario})
  e.diario = []
  e.dia += 1
  const hoje = e.dia

  atualizarClima(e)

  for (const p of e.pessoas) {
    if (p.vivo && p.fora && hoje >= p.fora.volta) resolverRetorno(e, p)
  }

  // contadores: fome, sede, dias em casa, cansaço, fadiga
  for (const p of e.pessoas) {
    if (!p.vivo || p.fugiu) continue
    if (p.fora) { p.semComer += FOME_DOBRADA; continue } // em expedição: come o dobro e a sede pausa [W]
    const antesF = p.semComer
    const antesS = p.semBeber
    const voltouHoje = e.flags[`abrigo.voltou.${p.id}`] === hoje
    p.semComer += voltouHoje ? FOME_DOBRADA : 1
    if (!p.mutante) p.semBeber += 1
    p.diasDentro += 1
    if (p.cansado > 0 && !voltouHoje) p.cansado -= 1
    const kF = `abrigo.fadigado.${p.id}`
    if (p.diasDentro >= FADIGA_DIAS && !e.flags[kF]) {
      e.flags[kF] = true
      anotar(e, `${p.nome} está fatigado(a): ficou tempo demais em casa.`)
    }
    if (antesF < FOME_AVISO && p.semComer >= FOME_AVISO) anotar(e, `${p.nome} está com fome: já faz ${dias(p.semComer)} que come direito.`)
    if (antesF < FOME_FAMINTO && p.semComer >= FOME_FAMINTO) anotar(e, `${p.nome} está faminto(a). Uma refeição não resolve mais.`)
    if (antesS < SEDE_AVISO && p.semBeber >= SEDE_AVISO) anotar(e, `${p.nome} está desidratado(a). Água, rápido.`)
  }

  // doenças e ferimentos: sorteia a duração quando aparecem; a cura pela sopa exige dias seguidos [W]
  for (const p of e.pessoas) {
    if (!p.vivo || p.fugiu) continue
    if (p.doente) {
      limite(e, `doenca.${p.id}.${p.doente.desde}`, DOENCA_MORTE)
      if (e.flags[`abrigo.comeu.${p.id}`] !== hoje - 1) e.flags[`abrigo.sopas_cura.${p.id}`] = 0
    }
    if (p.ferido) limite(e, `ferimento.${p.id}.${p.ferido.desde}`, FERIMENTO_MORTE)
  }

  // loucura: adulto sozinho enlouquece no 2º dia; criança sozinha vai acumulando; prazo para sair de casa
  const presentes = noAbrigo(e)
  for (const p of e.pessoas) {
    if (!p.vivo || p.fugiu || p.fora || !p.noAbrigo) continue
    const kS = `abrigo.sozinho.${p.id}`
    if (presentes.length === 1) {
      if (e.flags[kS] === undefined) e.flags[kS] = hoje
      const faz = hoje - e.flags[kS]
      if (ehAdulto(p) && faz >= LOUCURA_SOZINHO_DIAS && p.loucura < LOUCURA_LIMITE) {
        enlouquecer(e, p.id, LOUCURA_LIMITE, `${p.nome} está sozinho(a) em casa há ${dias(faz)}. A cabeça começou a girar.`)
      } else if (!ehAdulto(p)) {
        enlouquecer(e, p.id, LOUCURA_CRIANCA_SOZINHA, `${p.nome} está sozinho(a) e fica inquieto(a).`)
      }
    } else delete e.flags[kS]
    const kL = `abrigo.loucura.${p.id}`
    if (p.loucura >= LOUCURA_LIMITE && e.flags[kL] === undefined) {
      e.flags[kL] = {inicio: hoje, prazo: e.rng.estados.int(LOUCURA_PRAZO[0], LOUCURA_PRAZO[1]), destruiu: false}
      anotar(e, `${p.nome} não está mais batendo bem.`)
    }
    const L = e.flags[kL]
    if (!L) continue
    const decorrido = hoje - L.inicio
    if (!L.destruiu && decorrido >= Math.floor(L.prazo / 2)) {
      L.destruiu = true
      destruirPorLoucura(e, p)
    }
    if (decorrido >= L.prazo) sair(e, p.id, 'loucura', `${p.nome} saiu de casa de vez, atrás de uma coisa que só a cabeça cansada enxergava. Não volta mais.`)
  }

  // mortes e fugas: fome, sede, doença e ferimento (criança foge em vez de morrer [W])
  for (const p of e.pessoas) {
    if (!p.vivo || p.fugiu || p.fora || !p.noAbrigo) continue
    let causa = null
    if (p.semComer >= FOME_MORTE) causa = 'fome'
    else if (!p.mutante && p.semBeber >= SEDE_MORTE) causa = 'sede'
    else if (p.doente && hoje - p.doente.desde >= limite(e, `doenca.${p.id}.${p.doente.desde}`, DOENCA_MORTE)) causa = 'doença'
    else if (p.ferido && hoje - p.ferido.desde >= limite(e, `ferimento.${p.id}.${p.ferido.desde}`, FERIMENTO_MORTE)) causa = 'ferimento'
    if (causa) morrerOuFugir(e, p, causa)
  }

  // ataques de bandidos, a cada 3 dias depois que começam
  if (climaAtual(e) === 'bandidos') {
    const faz = hoje - (e.flags['abrigo.bandidos_desde'] ?? hoje)
    if (faz > 0 && faz % BANDIDOS_ATAQUE_CADA === 0) ataqueDeBandidos(e)
  }
}

// Motivo de derrota padrão: todos morreram, ou ninguém sobrou no abrigo nem em expedição.
// (Os outros finais, como a morte dos dois adultos, são do módulo de finais.)
export function derrotaPadrao(e) {
  const vivos = e.pessoas.filter((p) => p.vivo)
  if (!vivos.length) return 'Todos morreram.'
  const presentes = vivos.filter((p) => (p.noAbrigo || p.fora) && !p.fugiu)
  if (!presentes.length) return 'Ninguém sobrou no abrigo: quem não morreu fugiu, foi levado ou ficou lá fora sem volta.'
  return null
}
