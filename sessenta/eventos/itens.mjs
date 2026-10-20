// 60 Segundos das IAs: EVENTOS DE ITEM. 53 eventos (lista de docs/eventos_itens.md):
// terremoto, machado_gemeos, exercito_galoes, vendedor_porta, mau_cheiro, bandidos_porta, monstros_roedores,
// cartas_ponto, ventilacao_travada, tedio_abrigo, mae_abatida, ferida_mae, detetive_pato, balas_comerciante,
// passeio_cao, fotos_familia, enchente, seguir_cao, comida_cao, vizinhos_protecao, vizinhos_escolta, aniv_filha,
// aniv_filho, remedio_caseiro, pesca_mala, visita_ferida_mae, medicos_visita, infestacao, mala_misteriosa,
// suprimentos_agentes, vizinha_mutante, carta_ajuda, aranhas, enxame, derrubar_ninho, diversao_criancas,
// plano_mapa, cacadora, cavaleiros, vizinhos_porao, sinal_escoteiro, incendio, ferida_filho, duas_patas,
// comunicacao_baratas, academia_escola, barulhos, defender_abrigo, ajuda_refugiados, vencedor_sopa,
// vencedor_agua, monstro_coleira, medicos_retorno
//
// Convenções deste arquivo:
// - "Repelente" da fonte é `inseticida` em itens.mjs.
// - Munição e Foto da família NÃO estão em itens.mjs: contagens em flags['itens.municao'] e flags['itens.foto_familia'].
// - Sanidade é o inverso de loucura: "+sanidade" = enlouquecer com pontos negativos. "ao máximo" = -100 (o estado limita em 0).
// - Valores de sanidade e de chance: a fonte quase não dá números. Usamos 10 pontos por efeito e 50% onde a fonte diz
//   "às vezes" ou não dá critério (comentado em cada caso).
// - Peso: 1 quando a fonte não diz. Eventos automáticos (monstro_coleira, medicos_retorno) usam peso alto para
//   disparar assim que o dia certo chegar.
// - Cadeias e memórias ficam em flags com prefixo 'itens.' (ex.: 'itens.gemeos.obra', 'itens.cao', 'itens.militar.galoes').
// - Lacunas de estado.mjs (sem função): cansaço e fome não podem ser zerados (registramos em flags e anotamos);
//   mutação não tem função (flags 'itens.mutante.<id>'); expedição não tem função: "mandar" alguém usa sair(), com
//   motivo 'expedicao'. Expedições reais devem ser tratadas pelo módulo de expedição.
// - Entradas de expedição que a fonte liga a eventos (ferida da mãe/filho): o módulo de expedição deve listar em
//   flags['itens.expedicao.sem_kit'] os ids que voltaram sem Kit médico. Esses eventos consomem a entrada.
import {anotar, darItem, tirarItem, quebrarItem, adoecer, curar, ferir, cansar, enlouquecer, sair, terminar,
  pessoa, noAbrigo, vivos, tem, nome} from '../estado.mjs'
import {ITENS} from '../itens.mjs'

// ---------------------------------------------------------------- nomes para o texto
const NOME = {
  sopa: 'a Sopa', agua: 'a Água', radio: 'o Rádio', mapa: 'o Mapa', mascara: 'a Máscara de gás', kit: 'o Kit médico',
  rifle: 'o Rifle', machado: 'o Machado', lanterna: 'a Lanterna', cadeado: 'o Cadeado', inseticida: 'o Repelente',
  mala: 'a Mala', baralho: 'o Baralho', damas: 'o Tabuleiro de damas', gaita: 'a Gaita', manual: 'o Guia de escoteiro',
  municao: 'a Munição',
}
const CURTO = {sopa: 'Sopa', agua: 'Água', radio: 'Rádio', mapa: 'Mapa', mascara: 'Máscara', kit: 'Kit médico',
  rifle: 'Rifle', machado: 'Machado', lanterna: 'Lanterna', cadeado: 'Cadeado', inseticida: 'Repelente', mala: 'Mala',
  baralho: 'Baralho', damas: 'Damas', gaita: 'Gaita', manual: 'Guia de escoteiro', municao: 'Munição'}

// escolhe a variante de texto pelo dia (determinístico, sem sortear)
const variante = (e, lista) => lista[e.dia % lista.length]
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const juntar = (l) => (l.length <= 1 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`)
const PONTOS = 10 // pontos de loucura por efeito (a fonte não dá números)
const MUNICAO = 'itens.municao'
const FOTO = 'itens.foto_familia'
const CAO = 'itens.cao'
const SEM_KIT = 'itens.expedicao.sem_kit'

// ---------------------------------------------------------------- helpers (só usam estado.mjs para mexer no estado)
const F = (e, k) => !!e.flags[k]
const marcar = (e, k, v = true) => { e.flags[k] = v }
const contar = (e, k) => e.flags[k] ?? 0
const bump = (e, k) => { const antes = contar(e, k); e.flags[k] = antes + 1; return antes } // devolve a contagem anterior
const presente = (e, id) => { const p = pessoa(e, id); return !!p && p.vivo && p.noAbrigo }
const presentes = (e, lista) => lista.filter((id) => presente(e, id))
// "todos" só se a família tem 2+ vivos; com uma pessoa só, o texto usa o nome dela ({n})
const grupo = (e, plural, singular) => { const v = vivos(e); return v.length === 1 ? singular.replace('{n}', v[0].nome) : plural }
const aoAcaso = (e, rng) => { const ids = noAbrigo(e).map((p) => p.id); return ids.length ? rng.escolher(ids) : null }
const sanTodos = (e, pontos = PONTOS) => vivos(e).forEach((p) => enlouquecer(e, p.id, -pontos))
const loucTodos = (e, pontos = PONTOS) => vivos(e).forEach((p) => enlouquecer(e, p.id, pontos))
const curarTodos = (e) => vivos(e).forEach((p) => { if (p.doente || p.ferido) curar(e, p.id) })
const perder = (e, item) => { if ((e.itens[item] ?? 0) > 0) tirarItem(e, item, 1, `${cap(NOME[item])} se perde.`) }
const munic = (e) => contar(e, MUNICAO)
const gastarMunicao = (e, texto) => { e.flags[MUNICAO] = Math.max(0, munic(e) - 1); anotar(e, texto) }
const saquear = (e, texto) => {
  for (const k of Object.keys(e.itens)) if (e.itens[k] > 0) tirarItem(e, k, e.itens[k])
  e.flags[MUNICAO] = 0
  e.flags[FOTO] = 0
  anotar(e, texto)
}
// "Água ou Sopa" da fonte: gasta a que houver em maior quantidade (empate: Água)
const aguaOuSopa = (e) => {
  const a = tem(e, 'agua') ? e.itens.agua : 0
  const s = tem(e, 'sopa') ? e.itens.sopa : 0
  if (!a && !s) return null
  return a >= s ? 'agua' : 'sopa'
}
const gastarAguaOuSopa = (e, texto) => {
  const item = aguaOuSopa(e)
  if (item) tirarItem(e, item, 1, texto ?? `Entregam 1 ${CURTO[item]}.`)
  return item
}
const semKit = (e, id) => (e.flags[SEM_KIT] ?? []).includes(id)
const resolverSemKit = (e, id) => { e.flags[SEM_KIT] = (e.flags[SEM_KIT] ?? []).filter((x) => x !== id) }
// estado.mjs não tem função de mutação: registramos em flags
const mutar = (e, id, texto) => { if (pessoa(e, id)?.vivo) marcar(e, `itens.mutante.${id}`); anotar(e, texto) }
const caoNoAbrigo = (e) => ['comeu', 'no_abrigo'].includes(e.flags[CAO])
// estado.mjs não tem função para zerar fome: registramos em flags
const zerarFome = (e, texto) => { e.flags['itens.fome_zerada'] = e.dia; anotar(e, texto) }
// Saques da defesa e da ajuda: cada um escreve no diário
const SAQUES_NADA = [
  (e) => anotar(e, 'Os invasores vão embora sem levar nada.'),
  (e) => tirarItem(e, 'sopa', 2, 'Roubam 2 Sopas e somem pela rua.'),
  (e) => tirarItem(e, 'agua', 2, 'Roubam 2 Águas e somem pela rua.'),
  (e) => saquear(e, 'Saqueiam tudo o que há no abrigo.'),
  (e) => ferir(e, 'pai', `${nome(e, 'pai')} sai com um corte feio.`),
  (e) => ferir(e, 'mae', `${nome(e, 'mae')} sai com um corte feio.`),
  (e) => ferir(e, 'filha', `${nome(e, 'filha')} sai com um corte feio.`),
  (e) => ferir(e, 'filho', `${nome(e, 'filho')} sai com um corte feio.`),
  (e) => sair(e, 'pai', 'capturado', `${nome(e, 'pai')} é levado pelos invasores.`),
  (e) => sair(e, 'mae', 'capturada', `${nome(e, 'mae')} é levada pelos invasores.`),
  (e) => sair(e, 'filha', 'capturada', `${nome(e, 'filha')} é levada pelos invasores.`),
  (e) => sair(e, 'filho', 'capturado', `${nome(e, 'filho')} é levado pelos invasores.`),
]

// ================================================================ EVENTOS
// ---------------------------------------------------------------- terremoto (abrigo)
const terremoto = {
  id: 'terremoto', grupo: 'abrigo',
  quando: () => true, // sem dia definido na fonte
  peso: () => 1, // frequência não informada na fonte
  texto: (e) => (!tem(e, 'lanterna') || !tem(e, 'radio') || !tem(e, 'mascara'))
    ? 'Um tremor sacode o porão e a poeira cai do teto. Sem lanterna, rádio ou máscara à mão, ninguém tem muito o que salvar.'
    : 'Um tremor sacode o porão. Lanterna, rádio e máscara estão por perto: dá tempo de segurar uma delas.',
  escolhas: () => [
    {id: 'salvar_lanterna', texto: 'Seguram a Lanterna.', requer: (e) => tem(e, 'lanterna')},
    {id: 'salvar_radio', texto: 'Seguram o Rádio.', requer: (e) => tem(e, 'radio')},
    {id: 'salvar_mascara', texto: 'Seguram a Máscara de gás.', requer: (e) => tem(e, 'mascara')},
    {id: 'nada', texto: 'Ninguém segura nada.'},
  ],
  resolver: (e, id, rng) => {
    const salvo = {salvar_lanterna: 'lanterna', salvar_radio: 'radio', salvar_mascara: 'mascara'}[id]
    anotar(e, salvo ? `Salvam ${NOME[salvo]} na hora do tremor.` : 'O tremor faz a festa sozinho.')
    // o rádio não salvo pode quebrar (a fonte lista o terremoto entre as causas de quebra); chance 50%: a fonte não diz
    if (salvo !== 'radio' && tem(e, 'radio') && rng.chance(0.5)) quebrarItem(e, 'radio', 'O rádio cai e quebra.')
  },
}

// ---------------------------------------------------------------- machado_gemeos (cadeia: gêmeos, passo 1)
const machado_gemeos = {
  id: 'machado_gemeos', grupo: 'cadeia',
  // a fonte não condiciona ao contato da carta; só não repete depois da obra começar
  quando: (e) => !F(e, 'itens.gemeos.obra'),
  peso: () => 1,
  texto: () => 'Os gêmeos Lia e Dino batem na porta com um grupo de sobreviventes. Precisam de braços e de um machado para cortar madeira e erguer o acampamento.',
  escolhas: () => [
    {id: 'machado', texto: 'A família ajuda na obra com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'nada', texto: 'A família recusa.'},
  ],
  resolver: (e, id) => {
    if (id === 'machado') { marcar(e, 'itens.gemeos.obra'); anotar(e, 'O Machado volta intacto e o acampamento começa a subir.') } // o machado não se perde
    else anotar(e, tem(e, 'machado') ? 'A família acha perigoso mexer com madeira e machado, e recusa.' : 'A família diz que não tem como ajudar sem ferramentas.')
  },
}

// ---------------------------------------------------------------- exercito_galoes (cadeia: militar, passos 1-3)
const exercito_galoes = {
  id: 'exercito_galoes', grupo: 'cadeia',
  // a fonte não diz quais condições disparam além do rádio; assumimos Rádio funcionando no abrigo
  quando: (e) => tem(e, 'radio') && contar(e, 'itens.militar.galoes') < 3,
  peso: () => 1,
  texto: (e) => contar(e, 'itens.militar.galoes') === 0
    ? 'O rádio chia: o exército pede que levem galões de gás ao ponto de ônibus. O caminho é perigoso.'
    : 'A mensagem se repete: o exército quer os galões de gás no ponto de ônibus, com mais pressa.',
  escolhas: () => [
    {id: 'mascara', texto: 'A família leva os galões com a Máscara de gás.', requer: (e) => tem(e, 'mascara')},
    {id: 'nada', texto: 'A família acha arriscado sair sem máscara.'},
  ],
  resolver: (e, id) => {
    if (id === 'mascara') {
      const passo = contar(e, 'itens.militar.galoes') + 1
      e.flags['itens.militar.galoes'] = passo
      anotar(e, 'A Máscara de gás não se gasta: os galões chegam ao ponto.')
      // no 3º passo a cadeia militar chega ao final de resgate; o final em si fica para finais.mjs ler a flag
      if (passo === 3) marcar(e, 'itens.militar.resgate')
    } else {
      anotar(e, 'O resgate atrasa. Ninguém leva os galões.')
    }
  },
}

// ---------------------------------------------------------------- vendedor_porta (porta)
const vendedor_porta = {
  id: 'vendedor_porta', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: () => 'Um vendedor de antes do fim do mundo bate na porta, com uma mala de amostras. Quer suprimentos e jura que tem segredos de uma estação espacial.',
  escolhas: (e) => [
    {id: 'agua_ou_sopa', texto: 'Dão 1 Água ou Sopa para ouvir os segredos.', requer: (e2) => !!aguaOuSopa(e2)},
    {id: 'nada', texto: 'Mandam o vendedor embora.'},
  ],
  resolver: (e, id) => {
    if (id === 'agua_ou_sopa') {
      gastarAguaOuSopa(e, 'O vendedor leva 1 Água ou Sopa e sussurra a revelação. É mentira, mas a família se anima.')
      sanTodos(e)
      anotar(e, grupo(e, 'A sanidade de todos sobe um pouco: a conversa foi divertida.', 'A sanidade de {n} sobe um pouco: a conversa foi divertida.'))
    } else anotar(e, 'O vendedor vai embora irritado, resmungando sobre a estação.')
  },
}

// ---------------------------------------------------------------- mau_cheiro (abrigo)
const mau_cheiro = {
  id: 'mau_cheiro', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['O abrigo fede a sujeira. Se ninguém fizer nada, a família adoece.',
    'Está na hora do banho e ninguém quer tomar. O cheiro sobe pela escada.',
    'Um cheiro azedo toma conta do porão. Dá para fazer alguma coisa antes que todos adoeçam.'][e.dia % 3],
  escolhas: () => [
    {id: 'municao', texto: 'Gastam 1 Munição como desinfetante.', requer: (e) => munic(e) > 0},
    {id: 'mascara', texto: 'Usam a Máscara de gás e aguentam o cheiro.', requer: (e) => tem(e, 'mascara')},
    {id: 'repelente', texto: 'Borrifam o Repelente pelo porão.', requer: (e) => tem(e, 'inseticida')},
    {id: 'nada', texto: 'Ninguém faz nada.'},
  ],
  resolver: (e, id) => {
    if (id === 'nada') {
      vivos(e).forEach((p) => adoecer(e, p.id))
      anotar(e, grupo(e, 'Todos adoecem com o ar podre.', '{n} adoece com o ar podre.'))
      return
    }
    if (id === 'municao') gastarMunicao(e, 'A Munição espalha um cheiro forte e o ar melhora.')
    if (id === 'repelente') tirarItem(e, 'inseticida', 1, 'O Repelente é gasto e o cheiro some.')
    // curar() zera doença e ferimento; a fonte só fala de doença (limitação do estado.mjs)
    curarTodos(e)
    anotar(e, id === 'mascara' ? 'A Máscara de gás deixa o ar respirável. Ninguém adoece.' : grupo(e, 'Todos se curam da doença.', '{n} se cura da doença.'))
  },
}

// ---------------------------------------------------------------- bandidos_porta (porta, repete)
const bandidos_porta = {
  id: 'bandidos_porta', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Bandidos batem na porta e ameaçam entrar.',
    'Uma gangue encosta na janela e grita que quer entrar.',
    'Vozes ameaçadoras do lado de fora: é hora de resistir, negociar ou render-se.',
    'Pancadas fortes na porta. Os bandidos avisam que não vão embora de mãos vazias.',
    'Um homem com um pé de cabra quer entrar. A família decide como reagir.',
    'Uma buzina e gritos. O grupo de fora claramente quer confusão.'][e.dia % 6],
  escolhas: (e) => [
    {id: 'gaita', texto: 'Tocam a Gaita.', requer: (e2) => tem(e2, 'gaita')},
    {id: 'cadeado', texto: 'Trancam tudo com o Cadeado.', requer: (e2) => tem(e2, 'cadeado')},
    {id: 'machado', texto: 'Enfrentam com o Machado.', requer: (e2) => tem(e2, 'machado')},
    {id: 'rifle_com_municao', texto: 'Atiram com o Rifle e a Munição.', requer: (e2) => tem(e2, 'rifle') && munic(e2) > 0},
    {id: 'rifle_sem_municao', texto: 'Mostram o Rifle, que não tem bala.', requer: (e2) => tem(e2, 'rifle') && munic(e2) === 0},
    {id: 'nada', texto: 'Sem arma: deixam a defesa com quem estiver por perto.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'gaita') {
      // 1ª vez: os bandidos baixam as armas, sem perda. 2ª vez em diante: a gaita espanta e é gasta.
      // a fonte não diz quando ocorre a 2ª vez; contamos as vezes da gaita
      const antes = bump(e, 'itens.bandidos.gaita')
      if (antes === 0) anotar(e, 'Os bandidos baixam as armas, emocionados com a Gaita. Ninguém perde nada.')
      else tirarItem(e, 'gaita', 1, 'A música horrível espanta os bandidos. A Gaita fica gasta.')
    } else if (id === 'cadeado') {
      tirarItem(e, 'cadeado', 1, 'Os bandidos desistem ao ver o Cadeado e vão embora. A família fica na defesa.')
    } else if (id === 'machado') {
      tirarItem(e, 'machado', 1, 'O Machado quebra na luta. Os bandidos fogem: defesa bem-sucedida.')
    } else if (id === 'rifle_com_municao') {
      gastarMunicao(e, 'A Munição acaba, mas o Rifle segue firme. Defesa bem-sucedida.')
    } else if (id === 'rifle_sem_municao') {
      tirarItem(e, 'rifle', 1, 'Sem munição, o Rifle vira peso de papel. Mesmo assim, os bandidos se assustam e a defesa funciona.')
    } else {
      // nada: a saída depende de quem está no abrigo, na ordem da fonte
      if (presente(e, 'filha')) {
        const antes = bump(e, 'itens.bandidos.filha')
        if (antes === 0) anotar(e, `${nome(e, 'filha')} vence os bandidos sozinha.`)
        else if (rng.chance(0.5)) sair(e, 'filha', 'perseguiu', `${nome(e, 'filha')} persegue os bandidos para longe e some.`)
        else sair(e, 'filha', 'capturada', `${nome(e, 'filha')} é capturada pelos bandidos.`) // 50%: a fonte não diz qual
      } else if (caoNoAbrigo(e)) {
        e.flags[CAO] = 'fora'
        anotar(e, 'O cão late e afugenta os bandidos, mas sai correndo do abrigo.')
      } else if (F(e, 'itens.protegido')) {
        marcar(e, 'itens.protegido', false)
        anotar(e, 'Os vizinhos mutantes entram e afastam os bandidos. Defesa bem-sucedida.')
      } else {
        const cand = presentes(e, ['pai', 'mae', 'filho'])
        if (cand.length) {
          const alvo = rng.escolher(cand)
          sair(e, alvo, 'capturado', `${nome(e, alvo)} é capturado pelos bandidos e sai da família.`)
        } else {
          terminar(e, 'casa_invadida', 'derrota', 'A casa é invadida.', 'Os bandidos entram e levam tudo. Fim de jogo.')
        }
      }
    }
  },
}

// ---------------------------------------------------------------- monstros_roedores (abrigo)
const monstros_roedores = {
  id: 'monstros_roedores', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Um bicho ataca os mantimentos durante a noite.',
    'Roedores fuçam as latas. Ou será algo maior, que observa do escuro?',
    'Alguma coisa está mastigando a comida no canto. A família decide o que fazer.',
    'Barulho de patas perto da despensa. Os mantimentos estão em risco.'][e.dia % 4],
  escolhas: () => [
    {id: 'machado', texto: 'Enfrentam o bicho com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'rifle', texto: 'Atiram no bicho com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'nada', texto: 'Deixam o bicho em paz.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'machado') anotar(e, 'O bicho morre e a comida fica salva. O Machado não se perde.')
    else if (id === 'rifle') {
      anotar(e, 'O bicho morre com um tiro certeiro.')
      // às vezes o rifle explode ao disparar: sem percentual na fonte, 50%
      if (rng.chance(0.5)) tirarItem(e, 'rifle', 1, 'O Rifle explode ao disparar e se perde.')
    } else tirarItem(e, 'sopa', 1, 'O bicho vence, rouba e come 1 Sopa.')
  },
}

// ---------------------------------------------------------------- cartas_ponto (cadeia: militar)
const cartas_ponto = {
  id: 'cartas_ponto', grupo: 'cadeia',
  // passo da cadeia militar: só depois de pelo menos um galão levado
  quando: (e) => contar(e, 'itens.militar.galoes') >= 1 && !F(e, 'itens.militar.cartas'),
  peso: () => 1,
  texto: (e) => ['O exército pede que se deixe, no ponto de ônibus, uma carta com a quantidade de pessoas no abrigo.',
    'Nova ordem do rádio: uma carta no ponto de ônibus, dizendo quantos sobreviventes estão no abrigo.',
    'O exército precisa localizar sobreviventes. Uma carta no ponto resolveria isso.'][contar(e, 'itens.militar.galoes') % 3],
  escolhas: () => [
    {id: 'baralho', texto: 'Deixam as cartas do Baralho no ponto.', requer: (e) => tem(e, 'baralho')},
    {id: 'nada', texto: 'Não deixam nenhuma carta.'},
  ],
  resolver: (e, id) => {
    if (id === 'baralho') {
      marcar(e, 'itens.militar.cartas')
      anotar(e, 'As cartas ficam no ponto. O Baralho não se gasta e a cadeia militar avança.')
    } else {
      e.flags['itens.militar.chance_resgate'] = 'menor'
      anotar(e, 'A família perde a chance de avisar o exército. O resgate fica menos provável.')
    }
  },
}

// ---------------------------------------------------------------- ventilacao_travada (abrigo)
const ventilacao_travada = {
  id: 'ventilacao_travada', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Faz horas que a família sente falta de ar. A ventilação está travada.',
    'O ar do porão está pesado. Alguém precisa descobrir por que a ventilação parou.',
    grupo(e, 'Todos tossem baixinho. O ar piora e a ventilação continua travada.', '{n} tosse baixinho. O ar piora e a ventilação continua travada.')][e.dia % 3],
  escolhas: () => [
    {id: 'lanterna', texto: 'Iluminam a grade com a Lanterna.', requer: (e) => tem(e, 'lanterna')},
    {id: 'guia', texto: 'Consultam o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'repelente', texto: 'Borrifam o Repelente na grade.', requer: (e) => tem(e, 'inseticida')},
    {id: 'nada', texto: 'Esperam passar a noite.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'lanterna') {
      anotar(e, 'Ao iluminar a grade, uma colmeia de insetos morde. A Lanterna não se perde.')
      const alvo = aoAcaso(e, rng)
      if (alvo) ferir(e, alvo, `${nome(e, alvo)} se fere nas mordidas.`)
    } else if (id === 'guia') {
      anotar(e, 'O guia não resolve nada. Os insetos saem e picam.')
      const alvo = aoAcaso(e, rng)
      if (alvo) adoecer(e, alvo, `${nome(e, alvo)} adoece com as picadas.`)
    } else if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O spray limpa a ventilação e o ar volta ao normal. O Repelente é gasto.')
    } else {
      anotar(e, grupo(e, 'Todos tossem por uma noite inteira.', '{n} tosse por uma noite inteira.'))
      // "quem esteve doente recentemente volta a adoecer": o estado não guarda isso; sorteamos 1 pessoa com 50%
      if (rng.chance(0.5)) { const alvo = aoAcaso(e, rng); if (alvo) adoecer(e, alvo, `${nome(e, alvo)} volta a adoecer.`) }
    }
  },
}

// ---------------------------------------------------------------- tedio_abrigo (abrigo)
const tedio_abrigo = {
  id: 'tedio_abrigo', grupo: 'abrigo',
  quando: (e) => presente(e, 'filha') && presente(e, 'filho'),
  peso: () => 1,
  texto: () => 'A filha e o filho estão entediados e a família está ficando louca de tanto esperar. Alguém precisa inventar alguma coisa.',
  escolhas: () => [
    {id: 'rifle', texto: 'Saem para caçar com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'radio', texto: 'Sintonizam o Rádio.', requer: (e) => tem(e, 'radio')},
    {id: 'baralho', texto: 'Jogam Baralho.', requer: (e) => tem(e, 'baralho')},
    {id: 'damas', texto: 'Jogam Damas.', requer: (e) => tem(e, 'damas')},
    {id: 'nada', texto: 'Ficam olhando a parede.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'rifle') {
      // duas saídas: caça (+2 Sopa) ou teste do rifle com ferimento (se pai ou mãe estão no abrigo). Sem chance na fonte: 50%
      if (presente(e, 'pai') || presente(e, 'mae')) {
        if (rng.chance(0.5)) {
          const alvo = rng.escolher(presentes(e, ['pai', 'mae']))
          ferir(e, alvo, `Testam o Rifle e ${nome(e, alvo)} se fere.`)
        } else darItem(e, 'sopa', 2, 'Um homem foge da caçada e deixa 2 Sopas para trás.')
      } else darItem(e, 'sopa', 2, 'Saem para caçar e voltam com 2 Sopas de um homem que fugiu.')
    } else if (id === 'radio') {
      // uma saída só descreve estática; a outra dá sanidade. 50%: a fonte não diz
      if (rng.chance(0.5)) sanTodos(e)
      anotar(e, 'Só estática no Rádio, mas o barulho distrai todo mundo.')
    } else if (id === 'baralho') {
      if (rng.chance(0.5)) { sanTodos(e); anotar(e, 'Jogam paciência e ninguém fala de fim do mundo.') }
      else tirarItem(e, 'lanterna', 1, 'Uma partida de pôquer com latas acaba com a Lanterna quebrada.')
    } else if (id === 'damas') {
      sanTodos(e)
      // "às vezes, se a filha está no abrigo, ela perde sanidade" (marcado "to be checked" na fonte): 50%
      if (presente(e, 'filha') && rng.chance(0.5)) enlouquecer(e, 'filha', PONTOS, 'Perder no jogo de damas deixa a filha mais irritada.')
      else anotar(e, grupo(e, 'Jogam Damas e a sanidade de todos sobe.', '{n} joga Damas e a sanidade sobe.'))
    } else {
      anotar(e, 'A família fica olhando a parede.')
      if (rng.chance(0.5)) cansar(e, 'filha', 2, 'A filha fica cansada de tanto nada.')
      if (rng.chance(0.5)) cansar(e, 'filho', 2, 'O filho fica cansado de tanto nada.')
    }
  },
}

// ---------------------------------------------------------------- mae_abatida (abrigo)
const mae_abatida = {
  id: 'mae_abatida', grupo: 'abrigo',
  quando: (e) => presente(e, 'mae') && pessoa(e, 'mae').cansado > 0,
  peso: () => 1,
  texto: (e) => ['A mãe está apática e não quer nem a sopa. A família tenta animá-la.',
    `${nome(e, 'mae')} está cansada demais para qualquer coisa. Alguém precisa fazer alguma coisa.`,
    'A mãe olha para o teto há horas. Hora de tentar alguma coisa para animá-la.'][e.dia % 3],
  escolhas: () => [
    {id: 'repelente', texto: 'Borrifam o Repelente na mãe.', requer: (e) => tem(e, 'inseticida')},
    {id: 'guia', texto: 'Leem o Guia de escoteiro para ela.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Deixam ela em paz.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'repelente') {
      // duas saídas, 50%: a fonte não dá chance
      if (rng.chance(0.5)) enlouquecer(e, 'mae', -PONTOS, 'A mãe se sente bem com o cabelo cheiroso e a sanidade sobe.')
      else { enlouquecer(e, 'mae', PONTOS); adoecer(e, 'mae', 'A borrifada no rosto deixa a mãe tonta e ela adoece.') }
    } else if (id === 'guia') {
      if (rng.chance(0.5)) {
        enlouquecer(e, 'mae', -PONTOS, 'A mãe gosta da leitura e se acalma.')
        // estado.mjs não tem função para zerar cansaço (cansar só sobe): registramos o descanso em flag
        marcar(e, 'itens.mae.descansou', e.dia)
      } else anotar(e, 'A mãe está cansada demais para ler. Ninguém consegue animá-la.')
    } else {
      // três saídas da fonte sem critério: enlouquece, sanidade cai, e (se o gato está no abrigo) o gato anima a mãe
      const saidas = [
        () => enlouquecer(e, 'mae', 20, 'A mãe enlouquece de vez e passa a falar sozinha.'),
        () => enlouquecer(e, 'mae', PONTOS, 'A sanidade da mãe cai.'),
      ]
      if (F(e, 'itens.gato')) saidas.push(() => enlouquecer(e, 'mae', -PONTOS, 'O gato deita no colo dela e a sanidade sobe.'))
      rng.escolher(saidas)()
    }
  },
}

// ---------------------------------------------------------------- ferida_mae (abrigo)
const ferida_mae = {
  id: 'ferida_mae', grupo: 'abrigo',
  // "às vezes" sem percentual: quem sorteia é o módulo de expedição (flag sem_kit); aqui o peso é 1
  quando: (e) => semKit(e, 'mae') && presente(e, 'mae'),
  peso: () => 1,
  texto: (e) => ['A mãe voltou da rua com um inchaço no pé que infeccionou.',
    'Um arranhão na perna da mãe ficou feio e começou a supurar.'][e.dia % 2],
  escolhas: () => [
    {id: 'machado', texto: 'Aquecem o Machado e limpam a ferida.', requer: (e) => tem(e, 'machado')},
    {id: 'kit', texto: 'Usam o Kit médico.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Esperam a ferida passar.'},
  ],
  resolver: (e, id, rng) => {
    resolverSemKit(e, 'mae')
    if (id === 'machado') {
      tirarItem(e, 'machado', 1, 'O Machado aquecido limpa a ferida e a doença da mãe some. O Machado é gasto.')
      curar(e, 'mae')
      // às vezes o machado escorrega: 50%, sem percentual na fonte
      if (rng.chance(0.5)) ferir(e, 'mae', 'O Machado escorrega e a mãe se fere de novo.')
    } else if (id === 'kit') {
      tirarItem(e, 'kit', 1, 'O Kit médico cura a doença da mãe. O Kit é gasto.')
      curar(e, 'mae')
    } else {
      anotar(e, 'Sem tratamento, a mãe pode adoecer.')
      if (rng.chance(0.5)) adoecer(e, 'mae', 'A mãe adoece de vez.')
    }
  },
}

// ---------------------------------------------------------------- detetive_pato (abrigo)
const detetive_pato = {
  id: 'detetive_pato', grupo: 'abrigo',
  quando: (e) => presente(e, 'filha') && presente(e, 'filho'),
  peso: () => 1,
  texto: () => 'As crianças pedem alguns objetos para brincar de detetive no porão.',
  escolhas: () => [
    {id: 'sorteio', texto: 'Deixam as crianças levarem alguns itens sorteados para a brincadeira.'},
    {id: 'nada', texto: 'Dizem que não há nada para brincar.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'sorteio') {
      // a fonte não diz quais itens entram no sorteio: sorteamos 2 itens presentes; cada um se perde com 50%
      const disponiveis = Object.keys(e.itens).filter((k) => e.itens[k] > 0)
      const sorteados = rng.embaralhar(disponiveis).slice(0, 2)
      if (!sorteados.length) anotar(e, 'As crianças procuram, mas não há nada para esconder.')
      for (const k of sorteados) {
        anotar(e, `A filha esconde ${NOME[k]} e o filho procura.`)
        if (rng.chance(0.5)) tirarItem(e, k, 1, `${CURTO[k]} se perde na brincadeira.`)
      }
      sanTodos(e)
    } else if (rng.chance(0.5)) {
      anotar(e, 'As crianças brincam e ninguém se ajuda: sem efeito.')
    } else {
      anotar(e, 'As crianças empilham latas e garrafas para um muro. Tudo cai.')
      for (const id2 of presentes(e, ['filha', 'filho'])) if (rng.chance(0.5)) ferir(e, id2, `${nome(e, id2)} se fere na queda.`)
    }
  },
}

// ---------------------------------------------------------------- balas_comerciante (porta)
const balas_comerciante = {
  id: 'balas_comerciante', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Um comerciante bate na porta e pede munição. Diz que tem uma troca justa.',
    'Um homem de chapéu quer comprar munição e oferece algo em troca.'][e.dia % 2],
  escolhas: () => [
    {id: 'damas', texto: 'Oferecem o tabuleiro de Damas.', requer: (e) => tem(e, 'damas')},
    {id: 'municao', texto: 'Trocam 1 Munição.', requer: (e) => munic(e) > 0},
    {id: 'nada', texto: 'Dizem que não vendem nada.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'damas') tirarItem(e, 'damas', 1, 'O comerciante não entende a oferta e leva o tabuleiro embora.')
    else if (id === 'municao') {
      e.flags[MUNICAO] = munic(e) - 1
      // o critério entre as duas saídas não é informado: 50%
      if (rng.chance(0.5)) darItem(e, 'sopa', 1, 'O comerciante dá 1 Sopa em troca da munição.')
      else darItem(e, 'radio', 1, 'O comerciante deixa um Rádio funcionando em troca da munição.')
    } else if (rng.chance(0.5)) {
      // usa uma bomba de fumaça e leva munição, se houver
      gastarMunicao(e, 'O homem solta uma bomba de fumaça, pega a munição e some.')
    } else anotar(e, 'O homem vai embora decepcionado, sem levar nada.')
  },
}

// ---------------------------------------------------------------- passeio_cao (cadeia: cão, passo final)
const passeio_cao = {
  id: 'passeio_cao', grupo: 'cadeia', unico: true,
  // a condição da fonte ("Sopa usada duas vezes seguidas no evento ???") não é identificável: usamos cão no abrigo + cadeado
  quando: (e) => caoNoAbrigo(e) && tem(e, 'cadeado') && !F(e, 'itens.cao.passeou'),
  peso: () => 1,
  texto: () => 'O cão se comporta bem. A família pensa em sair junto numa busca e trancar o abrigo com o cadeado.',
  escolhas: () => [
    {id: 'cadeado', texto: 'Trancam o abrigo com o Cadeado e a mãe sai com o cão.', requer: (e) => tem(e, 'cadeado')},
    {id: 'nada', texto: 'Recusam a expedição.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'cadeado') {
      tirarItem(e, 'cadeado', 1, 'O Cadeado é gasto e a mãe sai em expedição com o cão.')
      // a expedição de verdade é do módulo de expedição: marcamos a mãe como fora (motivo 'expedicao')
      sair(e, 'mae', 'expedicao', 'A mãe sai para a busca.')
      // às vezes ela volta doente: 50%, sem percentual na fonte
      if (rng.chance(0.5)) adoecer(e, 'mae', 'A mãe volta da busca doente.')
      marcar(e, 'itens.cao.passeou')
      e.flags[CAO] = 'passeou'
    } else anotar(e, 'A família recusa a expedição. Sem efeito.')
  },
}

// ---------------------------------------------------------------- fotos_familia (abrigo)
const fotos_familia = {
  id: 'fotos_familia', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['A família procura uma foto do tio, que sumiu há muito tempo.',
    'Alguém pergunta pela foto da tia. Ninguém lembra onde guardou.',
    presente(e, 'filho') ? `${nome(e, 'filho')} quer ver a foto do tio e da tia. ${grupo(e, 'Todos procuram pelo abrigo.', '{n} procura pelo abrigo.')}` : 'A família procura a foto do tio e da tia pelo abrigo.'][e.dia % 3],
  escolhas: () => [
    {id: 'guia', texto: 'Procuram entre as páginas do Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Desistem da busca.'},
  ],
  resolver: (e, id) => {
    if (id === 'guia') {
      sanTodos(e)
      // o item "foto da família" não existe em itens.mjs: contagem em flags; a fonte não diz o efeito dele
      e.flags[FOTO] = contar(e, FOTO) + 1
      anotar(e, grupo(e, 'A foto estava guardada entre as páginas do Guia. Todos ficam mais calmos.', 'A foto estava guardada entre as páginas do Guia. {n} se acalma.'))
    } else {
      loucTodos(e)
      anotar(e, grupo(e, 'Sem foto, a família fica triste. A sanidade de todos cai.', 'Sem foto, a família fica triste. A sanidade de {n} cai.'))
    }
  },
}

// ---------------------------------------------------------------- enchente (abrigo)
const enchente = {
  id: 'enchente', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Um tubo estoura e a água invade o abrigo. Só dá para salvar um item.',
    'A água sobe pela escada. A família só consegue pegar uma coisa.',
    'Um cano se rompe e o porão alaga. Ou se salva um item, ou nenhum.'][e.dia % 3],
  escolhas: () => [
    {id: 'mapa', texto: 'Salvam o Mapa.', requer: (e) => tem(e, 'mapa')},
    {id: 'baralho', texto: 'Salvam o Baralho.', requer: (e) => tem(e, 'baralho')},
    {id: 'radio', texto: 'Salvam o Rádio.', requer: (e) => tem(e, 'radio')},
    {id: 'nada', texto: 'Só limpam a água.'},
  ],
  resolver: (e, id) => {
    if (id === 'mapa') { perder(e, 'radio'); perder(e, 'baralho'); anotar(e, 'O Mapa é salvo. O resto encharca.') }
    else if (id === 'baralho') { perder(e, 'radio'); perder(e, 'mapa'); anotar(e, 'O Baralho é salvo. O resto encharca.') }
    else if (id === 'radio') { perder(e, 'baralho'); perder(e, 'mapa'); anotar(e, 'O Rádio é salvo. O resto encharca.') }
    else if (tem(e, 'mapa') && tem(e, 'baralho') && tem(e, 'radio')) {
      // sem escolha, os três se perdem (a fonte marca essa saída como "só se houve perda")
      perder(e, 'mapa'); perder(e, 'baralho'); perder(e, 'radio')
      anotar(e, 'A água leva o Mapa, o Baralho e o Rádio.')
    } else anotar(e, 'A água baixa e deixa só limpeza para trás.')
  },
}

// ---------------------------------------------------------------- seguir_cao (cadeia: cão, passo 2)
const seguir_cao = {
  id: 'seguir_cao', grupo: 'cadeia', unico: true,
  quando: (e) => e.flags[CAO] === 'comeu',
  peso: () => 1,
  texto: (e) => ['O cão volta agitado e quer que a família o siga para algum lugar.',
    `O cão late e puxa ${nome(e, 'filho')} pela manga. Quer mostrar alguma coisa.`,
    'O cão late na porta e quer que a família o acompanhe. Hora de escolher o equipamento.'][e.dia % 3],
  escolhas: () => [
    {id: 'mapa', texto: 'Seguem o cão com o Mapa.', requer: (e) => tem(e, 'mapa')},
    {id: 'rifle', texto: 'Seguem o cão com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'machado', texto: 'Seguem o cão com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'nada', texto: 'Ficam em casa.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'mapa') {
      // o cão acompanha um pouco e vai embora; o mapa não se gasta
      e.flags[CAO] = 'fora'
      anotar(e, 'O cão acompanha a família um pouco e depois vai embora. O Mapa não se gasta.')
      // desvio com o Guia de escoteiro: +3 Sopa; a fonte não diz a chance: 50%
      if (tem(e, 'manual') && rng.chance(0.5)) darItem(e, 'sopa', 3, 'Com o Guia, a família faz um desvio e encontra 3 Sopas.')
    } else if (id === 'rifle') {
      e.flags[CAO] = 'perdido'
      anotar(e, 'Os tiros assustam o cão, que não volta.')
      if (rng.chance(0.5)) { const alvo = aoAcaso(e, rng); if (alvo) ferir(e, alvo, `${nome(e, alvo)} se fere com um estilhaço.`) }
    } else if (id === 'machado') {
      e.flags[CAO] = 'no_abrigo'
      darItem(e, 'agua', 4, 'O cão ajuda a afastar dois bandidos. A família ganha 4 Águas.')
    } else {
      e.flags[CAO] = 'perdido'
      anotar(e, 'A família fica em casa. O cão vai embora e não volta.')
    }
  },
}

// ---------------------------------------------------------------- comida_cao (cadeia: cão, passo 1)
const comida_cao = {
  id: 'comida_cao', grupo: 'cadeia', unico: true,
  quando: (e) => e.flags[CAO] === 'habilitado',
  peso: () => 1,
  texto: (e) => variante(e, ['Um cão cansado e faminto volta e bate na porta.',
    'Um cachorro magro arranha a porta. Parece que a noite foi longa para ele.',
    'O cão da noite passada voltou, com cara de quem quer comer.']),
  escolhas: () => [
    {id: 'sopa', texto: 'Dão 1 Sopa ao cão.', requer: (e) => tem(e, 'sopa')},
    {id: 'nada', texto: 'Não dão nada a ele.'},
  ],
  resolver: (e, id) => {
    if (id === 'sopa') {
      tirarItem(e, 'sopa', 1, 'O cão come tudo, ganha o nome de Pipoca e entra no abrigo.')
      e.flags[CAO] = 'comeu' // fica um tempo e some; pode voltar pelo passo seguinte
    } else {
      e.flags[CAO] = 'perdido'
      anotar(e, 'O cão vai embora e não volta mais.')
    }
  },
}

// ---------------------------------------------------------------- vizinhos_protecao (porta)
const vizinhos_protecao = {
  id: 'vizinhos_protecao', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Um homem com vários braços bate na porta, com o grupo de mutantes atrás dele.',
    presente(e, 'mae') ? `Um grupo de mutantes amigáveis oferece proteção. ${nome(e, 'mae')} desconfia, mas ouve.` : 'Um grupo de mutantes amigáveis oferece proteção.'][e.dia % 2],
  escolhas: () => [
    {id: 'agua_ou_sopa', texto: 'Aceitam: dão 1 Água ou Sopa em troca de proteção.', requer: (e) => !!aguaOuSopa(e)},
    // a fonte não tem saída "nada" nesta versão; incluímos a recusa para ter sempre uma opção sem item
    {id: 'nada', texto: 'Recusam a proposta.'},
  ],
  resolver: (e, id) => {
    marcar(e, 'itens.vizinhos.contato')
    if (id === 'agua_ou_sopa') {
      gastarAguaOuSopa(e, 'A família dá 1 para os mutantes e fica protegida do próximo ataque de bandidos.')
      marcar(e, 'itens.protegido')
    } else anotar(e, 'Quem não aceita não recebe proteção. O grupo vai embora resmungando.')
  },
}

// ---------------------------------------------------------------- vizinhos_escolta (expedição)
const vizinhos_escolta = {
  id: 'vizinhos_escolta', grupo: 'expedicao',
  quando: (e) => F(e, 'itens.vizinhos.contato'),
  peso: () => 1,
  texto: () => 'O mesmo grupo mutante volta. Dizem que estão com dificuldade para achar suprimentos e oferecem escolta na próxima expedição.',
  escolhas: () => [
    {id: 'agua_ou_sopa', texto: 'Aceitam: dão 1 Água ou Sopa pela escolta.', requer: (e) => !!aguaOuSopa(e)},
    {id: 'nada', texto: 'Recusam a escolta.'},
  ],
  resolver: (e, id) => {
    if (id === 'agua_ou_sopa') {
      gastarAguaOuSopa(e, 'Os mutantes prometem escoltar a família na próxima expedição.')
      // a fonte não diz se o efeito vale uma expedição ou todas: registramos a escolta em flag, para o módulo de expedição
      marcar(e, 'itens.expedicao.escolta')
    } else anotar(e, 'O homem fica decepcionado e vai embora.')
  },
}

// ---------------------------------------------------------------- aniv_filha (abrigo, única)
const aniv_filha = {
  id: 'aniv_filha', grupo: 'abrigo', unico: true,
  quando: (e) => presente(e, 'filha'),
  peso: () => 1,
  texto: () => 'É aniversário da filha, e a família precisa escolher um presente.',
  escolhas: () => [
    {id: 'baralho', texto: 'Dão o Baralho de presente.', requer: (e) => tem(e, 'baralho')},
    {id: 'repelente', texto: 'Dão o Repelente de presente, meio sem graça.', requer: (e) => tem(e, 'inseticida')},
    {id: 'kit', texto: 'Dão o Kit médico, que ela acha útil.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Esquecem o aniversário.'},
  ],
  resolver: (e, id) => {
    if (id === 'baralho') enlouquecer(e, 'filha', -PONTOS, 'A filha ganha o Baralho e fica feliz.')
    else if (id === 'repelente') enlouquecer(e, 'filha', -PONTOS, 'A filha ri do Repelente como presente e fica feliz mesmo assim.')
    else if (id === 'kit') { enlouquecer(e, 'filha', -PONTOS); curar(e, 'filha', 'A filha ganha o Kit médico e cura o que tinha.') }
    else enlouquecer(e, 'filha', PONTOS, 'Ninguém lembra do aniversário. A filha fica triste.')
  },
}

// ---------------------------------------------------------------- aniv_filho (abrigo, única)
const aniv_filho = {
  id: 'aniv_filho', grupo: 'abrigo', unico: true,
  quando: (e) => presente(e, 'filho'),
  peso: () => 1,
  texto: () => 'É aniversário do filho, e a família precisa escolher um presente para ele.',
  escolhas: () => [
    {id: 'damas', texto: 'Dão o Tabuleiro de damas, mesmo incompleto.', requer: (e) => tem(e, 'damas')},
    {id: 'guia', texto: 'Dão o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'kit', texto: 'Dão o Kit médico, que também serve como remédio.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Esquecem o aniversário.'},
  ],
  resolver: (e, id) => {
    if (id === 'damas') enlouquecer(e, 'filho', -PONTOS, 'O filho ganha as Damas, com algumas peças faltando, e fica contente.')
    else if (id === 'guia') enlouquecer(e, 'filho', -PONTOS, 'O filho ganha o Guia e passa a tarde lendo.')
    else if (id === 'kit') { enlouquecer(e, 'filho', -PONTOS); curar(e, 'filho', 'O filho ganha o Kit médico e a doença dele melhora.') }
    else enlouquecer(e, 'filho', PONTOS, 'Ninguém se lembra do aniversário. O filho fica triste.')
  },
}

// ---------------------------------------------------------------- remedio_caseiro (abrigo)
const remedio_caseiro = {
  id: 'remedio_caseiro', grupo: 'abrigo',
  // "kit vazio" = contagem zero de Kit médico (o kit é consumido com tirarItem)
  quando: (e) => (e.itens.kit ?? 0) === 0 && tem(e, 'inseticida'),
  peso: () => 1,
  texto: (e) => ['O kit de primeiros socorros está vazio. A família pensa em fazer remédio com o Repelente.',
    `${nome(e, 'pai')} acha que dá para fazer um remédio caseiro. Ninguém tem muita fé.`,
    'Sem Kit médico, a família cogita misturar o Repelente em alguma coisa.'][e.dia % 3],
  escolhas: () => [
    {id: 'repelente', texto: 'Fazem remédio com o Repelente.', requer: (e) => tem(e, 'inseticida')},
    {id: 'nada', texto: 'Descartam a ideia.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O Repelente vira remédio e o kit volta a ficar cheio.')
      darItem(e, 'kit', 1)
      // às vezes, se pai ou mãe estão no abrigo, eles adoecem testando o remédio: 50% cada, sem percentual na fonte
      for (const id2 of presentes(e, ['pai', 'mae'])) if (rng.chance(0.5)) adoecer(e, id2, `${nome(e, id2)} adoece ao testar o remédio.`)
    } else anotar(e, 'A ideia é descartada.')
  },
}

// ---------------------------------------------------------------- pesca_mala (abrigo)
const pesca_mala = {
  id: 'pesca_mala', grupo: 'abrigo',
  quando: (e) => tem(e, 'mala'),
  peso: () => 1,
  texto: (e) => variante(e, ['A família pensa em pescar algo numa poça suja usando a Mala.',
    'Uma poça de água escura no canto. Alguém sugere pescar com a Mala.']),
  escolhas: () => [
    {id: 'mala', texto: 'Pescam com a Mala.', requer: (e) => tem(e, 'mala')},
    {id: 'nada', texto: 'Desistem da pescaria.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'mala') {
      // sorteio entre todos os itens de itens.mjs, menos a própria Mala (a fonte não diz os sorteáveis)
      tirarItem(e, 'mala', 1, 'A Mala se estraga na poça e é gasta.')
      const sorteado = rng.escolher(Object.keys(ITENS).filter((k) => k !== 'mala'))
      darItem(e, sorteado, 1, `Da poça sai: ${CURTO[sorteado]}!`)
    } else anotar(e, 'Sem efeito: a poça fica para depois.')
  },
}

// ---------------------------------------------------------------- visita_ferida_mae (abrigo)
const visita_ferida_mae = {
  id: 'visita_ferida_mae', grupo: 'abrigo',
  // a fonte fala em "ferida ou em agonia": agonia não existe em estado.mjs; usamos mae.ferido
  quando: (e) => presente(e, 'mae') && !!pessoa(e, 'mae').ferido,
  peso: () => 1,
  texto: () => 'A mãe piora: a ferida dela não para de incomodar. A família pode atender.',
  escolhas: () => [
    {id: 'kit', texto: 'Usam o Kit médico nos ferimentos da mãe.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Deixam a mãe sofrer.'},
  ],
  resolver: (e, id) => {
    if (id === 'kit') { curar(e, 'mae', 'O Kit médico cura os ferimentos da mãe. O Kit não se gasta.') }
    else adoecer(e, 'mae', 'A mãe adoece de vez.')
  },
}

// ---------------------------------------------------------------- medicos_visita (cadeia: médicos, passo 1)
const medicos_visita = {
  id: 'medicos_visita', grupo: 'cadeia',
  quando: (e) => e.flags['itens.medicos.agua'] === undefined,
  peso: () => 1,
  texto: (e) => ['Um grupo de pessoas de jaleco bate na porta. Dizem ser uma equipe médica de campo e pedem água para reabastecer os kits.',
    'Gente de jaleco na porta, com cara de cansaço. Pedem água, e prometem voltar se ajudarem.'][e.dia % 2],
  escolhas: () => [
    {id: 'agua', texto: 'Dão 1 Água para a equipe.', requer: (e) => tem(e, 'agua')},
    {id: 'nada', texto: 'Mandam o grupo embora.'},
  ],
  resolver: (e, id) => {
    if (id === 'agua') {
      tirarItem(e, 'agua', 1, 'A equipe leva 1 Água e promete voltar em alguns dias.')
      e.flags['itens.medicos.agua'] = e.dia
    } else anotar(e, 'A família manda o grupo embora. Ninguém volta.')
  },
}

// ---------------------------------------------------------------- infestacao (abrigo)
const infestacao = {
  id: 'infestacao', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['O lixo está cheio e aparecem insetos gigantes que brilham perto do balde.',
    presente(e, 'mae') ? `Baratas enormes e brilhantes rondam o lixo. ${nome(e, 'mae')} jura que cresceram desde ontem.` : 'Baratas enormes e brilhantes rondam o lixo. Ninguém quer chegar perto.',
    'Insetos do tamanho de uma mão aparecem perto do lixo. Ninguém quer encostar neles.'][e.dia % 3],
  escolhas: () => [
    {id: 'repelente', texto: 'Borrifam o Repelente.', requer: (e) => tem(e, 'inseticida')},
    {id: 'guia', texto: 'Afastam os insetos com o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Não fazem nada.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'Escapamos por pouco: o Repelente espanta as baratas, que somem no lixo.')
    } else if (id === 'guia') {
      anotar(e, rng.chance(0.5) ? 'Escapamos por pouco: as baratas somem atrás do lixo.' : 'As baratas se afastam, mas continuam rondando.')
    } else {
      // "a fonte não diz se esse evento cria o estado 'baratas mutantes'": inferido, aqui: se ninguém faz nada, as baratas se firmam
      marcar(e, 'itens.baratas')
      if (rng.chance(0.5)) {
        const alvo = aoAcaso(e, rng)
        if (alvo) adoecer(e, alvo, `${nome(e, alvo)} adoece depois de conviver com as baratas.`)
        else anotar(e, 'As baratas rondam o abrigo, mas ninguém está por perto para sofrer com elas.')
      } else if (F(e, 'itens.gato')) anotar(e, 'O gato caça as baratas durante a noite.')
      else anotar(e, 'As baratas fazem barulho a noite toda, sem ninguém adoecer.')
    }
  },
}

// ---------------------------------------------------------------- mala_misteriosa (porta)
const mala_misteriosa = {
  id: 'mala_misteriosa', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: () => 'Um comerciante de aparência suspeita oferece uma mala por uma Sopa. A mala balança e faz barulhos, e ele não deixa ninguém olhar dentro.',
  escolhas: () => [
    {id: 'sopa', texto: 'Trocam 1 Sopa pela mala.', requer: (e) => tem(e, 'sopa')},
    {id: 'nada', texto: 'Recusam o negócio.'},
  ],
  resolver: (e, id) => {
    if (id === 'sopa') {
      tirarItem(e, 'sopa', 1, 'Dentro da mala há um gato, que entra no abrigo e se acomoda.')
      marcar(e, 'itens.gato')
      sanTodos(e, 100) // "sanidade de todos sobe ao máximo"
      // a fonte tem um "???" no texto da saída do cão; sem identificar, só tratamos o caso "cão sai do abrigo"
      if (caoNoAbrigo(e)) { e.flags[CAO] = 'fora'; anotar(e, 'O cão fica com ciúmes do gato e sai do abrigo.') }
    } else anotar(e, 'A família recusa. O comerciante vai embora com a mala.')
  },
}

// ---------------------------------------------------------------- suprimentos_agentes (cadeia: VIP, 3 visitas)
const vipVisita = (e) => contar(e, 'itens.vip.visitas') // 0, 1 ou 2 (0 = primeira visita)
const suprimentos_agentes = {
  id: 'suprimentos_agentes', grupo: 'cadeia',
  quando: (e) => vipVisita(e) < 3 && !F(e, 'itens.vip.encerrada'),
  peso: () => 1,
  texto: (e) => ['Agentes do governo voltam e pedem 4 Sopas ou 4 Águas para um colega em campo, em troca de um abrigo seguro.',
    'Os mesmos agentes voltam, com o mesmo pedido: 4 Sopas ou 4 Águas, e promessa de abrigo governamental.',
    'Terceira visita dos agentes. Eles pedem de novo as 4 Sopas ou 4 Águas, agora com cara de quem não tem paciência.'][vipVisita(e)],
  escolhas: () => [
    {id: 'sopa', texto: 'Dão as 4 Sopas.', requer: (e) => tem(e, 'sopa', 4)},
    {id: 'agua', texto: 'Dão as 4 Águas.', requer: (e) => tem(e, 'agua', 4)},
    {id: 'nada', texto: 'Recusam o pedido.'},
  ],
  resolver: (e, id) => {
    const visita = vipVisita(e)
    e.flags['itens.vip.visitas'] = visita + 1
    if (id === 'sopa') tirarItem(e, 'sopa', 4, 'A família dá as 4 Sopas. Os agentes prometem contato.')
    else if (id === 'agua') tirarItem(e, 'agua', 4, 'A família dá as 4 Águas. Os agentes prometem contato.')
    else if (visita === 2) {
      marcar(e, 'itens.vip.encerrada')
      anotar(e, 'Recusa definitiva: os agentes vão embora e a cadeia VIP é encerrada.')
    } else anotar(e, 'Sem efeito: os agentes dizem que voltam em outro dia.')
  },
}

// ---------------------------------------------------------------- vizinha_mutante (abrigo)
const vizinha_mutante = {
  id: 'vizinha_mutante', grupo: 'abrigo',
  // "o pai foi em expedição": o módulo de expedição preenche p.fora
  quando: (e) => { const p = pessoa(e, 'pai'); return !!p && p.vivo && !!p.fora },
  peso: () => 1,
  texto: (e) => ['O pai tinha prometido dividir suprimentos com a vizinha mutante. A mãe não aprova.',
    `A vizinha bate na porta cobrando a promessa de ${nome(e, 'pai')}. A mãe cruza os braços.`,
    'A vizinha mutante espera do lado de fora. O pai tinha prometido algo a ela, e a mãe não gostou.'][e.dia % 3],
  escolhas: () => [
    {id: 'sopa', texto: 'Dão 1 Sopa para a vizinha.', requer: (e) => tem(e, 'sopa')},
    {id: 'nada', texto: 'Não dão nada.'},
  ],
  resolver: (e, id, rng) => {
    marcar(e, 'itens.vizinha_feita')
    if (id === 'sopa') {
      tirarItem(e, 'sopa', 1, 'A Sopa vai para a vizinha.')
      // duas saídas, 50%: a fonte não dá critério
      if (rng.chance(0.5)) { sanTodos(e); anotar(e, 'A mãe vai junto entregar a Sopa, e a família se sente melhor.') }
      else ferir(e, 'pai', `${nome(e, 'pai')} sai escondido para entregar a Sopa e se fere.`)
    } else if (rng.chance(0.5)) {
      enlouquecer(e, 'mae', -PONTOS, 'A mãe fica mais calma.')
      enlouquecer(e, 'pai', PONTOS, 'O pai perde a cabeça com a bronca.')
    } else {
      tirarItem(e, 'sopa', 1, 'A vizinha vem sozinha e a família acaba dividindo 1 Sopa.')
    }
  },
}

// ---------------------------------------------------------------- carta_ajuda (cadeia: gêmeos, início)
const carta_ajuda = {
  id: 'carta_ajuda', grupo: 'cadeia',
  // a fonte não dá título nem condição: o nome é nosso; aparece depois da vizinha mutante
  quando: (e) => F(e, 'itens.vizinha_feita') && !F(e, 'itens.gemeos.contato'),
  peso: () => 1,
  texto: (e) => ['Uma carta aparece por baixo da porta. Pede suprimentos para um local marcado no mapa. Quem assina são os gêmeos Lia e Dino.',
    `Outra carta dos gêmeos Lia e Dino. Eles pedem comida para ${nome(e, 'filho')} não se preocupar.`][e.dia % 2],
  escolhas: () => [
    {id: 'sopa', texto: 'Mandam 1 Sopa pelos gêmeos.', requer: (e) => tem(e, 'sopa')},
    {id: 'nada', texto: 'Não mandam nada.'},
  ],
  resolver: (e, id) => {
    if (id === 'sopa') {
      tirarItem(e, 'sopa', 1, 'A família manda 1 Sopa e conhece os gêmeos, que prometem voltar a falar com a família.')
      marcar(e, 'itens.gemeos.contato')
    } else anotar(e, 'A família não manda nada. Três respostas silenciosas e a carta fica na mesa.')
  },
}

// ---------------------------------------------------------------- aranhas (abrigo)
const aranhas = {
  id: 'aranhas', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Aranhas gigantes andam pelo abrigo, em todo lugar. A família precisa agir.',
    'Uma aranha do tamanho de um prato desce pela parede. Há mais no teto.',
    presente(e, 'filha') ? `${nome(e, 'filha')} viu uma aranha grande demais debaixo da cama. Hora de agir.` : 'Aranhas gigantes andam pelo abrigo. A família precisa agir.'][e.dia % 3],
  escolhas: () => [
    {id: 'repelente', texto: 'Borrifam o Repelente nas aranhas.', requer: (e) => tem(e, 'inseticida')},
    {id: 'guia', texto: 'Espantam as aranhas com o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'kit', texto: 'Usam o Kit médico, que tem pílulas fortes.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Lutam sem ferramentas.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O Repelente é gasto.')
      if (rng.chance(0.5)) darItem(e, 'agua', 1, 'As aranhas somem e sobra 1 Água.')
      else {
        darItem(e, 'sopa', 1, 'As aranhas somem e sobra 1 Sopa.')
        if (presente(e, 'filha') && rng.chance(0.5)) mutar(e, 'filha', `Uma aranha morde ${nome(e, 'filha')} e ela vira mutante.`)
      }
    } else if (id === 'guia') {
      if (rng.chance(0.5)) darItem(e, 'sopa', 1, 'O guia espanta as aranhas e sobra 1 Sopa.')
      else darItem(e, 'agua', 1, 'O guia espanta as aranhas e sobra 1 Água.')
      if (presente(e, 'filha') && rng.chance(0.5)) mutar(e, 'filha', `${nome(e, 'filha')} é mordida e vira mutante.`)
    } else if (id === 'kit') {
      anotar(e, 'As pílulas fazem as aranhas sumirem.')
    } else {
      anotar(e, 'A família luta sem ferramentas e fica cansada.')
      for (const id2 of presentes(e, ['pai', 'mae', 'filha', 'filho'])) if (rng.chance(0.5)) cansar(e, id2, 2, `${nome(e, id2)} fica cansado de lutar.`)
      if (presente(e, 'filha') && rng.chance(0.5)) mutar(e, 'filha', `${nome(e, 'filha')} é mordida e vira mutante.`)
      if (F(e, 'itens.gato')) anotar(e, 'Durante a noite, o gato mata as aranhas.')
    }
  },
}

// ---------------------------------------------------------------- enxame (abrigo, repete)
const enxame = {
  id: 'enxame', grupo: 'abrigo',
  quando: (e) => F(e, 'itens.baratas'),
  peso: () => 1,
  texto: (e) => ['Baratas mutantes se organizam e tomam conta de um canto do abrigo.',
    'O enxame de baratas voltou e ocupa a despensa. A família precisa expulsá-las.',
    `As baratas formaram uma fila e ${nome(e, 'pai')} não sabe mais quem manda aqui.`][e.dia % 3],
  escolhas: () => [
    {id: 'rifle', texto: 'Afugentam o enxame com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'repelente', texto: 'Borrifam o Repelente no enxame.', requer: (e) => tem(e, 'inseticida')},
    {id: 'guia', texto: 'Espantam o enxame com o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Esperam o enxame ir embora.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'rifle' || id === 'guia') {
      marcar(e, 'itens.baratas', false)
      anotar(e, `As baratas saem do abrigo. ${id === 'rifle' ? 'O Rifle' : 'O Guia'} não se gasta.`)
    } else if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'As baratas saem. O Repelente é gasto.')
      marcar(e, 'itens.baratas', false)
    } else {
      // quatro saídas da fonte, uma delas com o gato
      const saidas = [
        () => { const alvo = aoAcaso(e, rng); if (alvo) adoecer(e, alvo, `${nome(e, alvo)} adoece com as picadas do enxame.`); else anotar(e, 'As baratas picam o ar, mas não há ninguém por perto.') },
        () => { loucTodos(e); anotar(e, grupo(e, 'A sanidade de todos cai com o barulho do enxame.', 'A sanidade de {n} cai com o barulho do enxame.')) },
        () => {
          if (F(e, 'itens.gato')) { marcar(e, 'itens.baratas', false); anotar(e, 'O gato mata as baratas e elas saem.') }
          else anotar(e, 'O enxame fica no lugar, sem efeito.')
        },
      ]
      rng.escolher(saidas)()
    }
  },
}

// ---------------------------------------------------------------- derrubar_ninho (cadeia: gêmeos, única)
const derrubar_ninho = {
  id: 'derrubar_ninho', grupo: 'cadeia', unico: true,
  quando: (e) => F(e, 'itens.gemeos.obra') && !F(e, 'itens.gemeos.ninho'),
  peso: () => 1,
  texto: (e) => variante(e, ['Os gêmeos, que já montam o acampamento, acham um ninho de baratas mutantes perto dele.',
    'Lia e Dino pedem ajuda: há um ninho de baratas bem ao lado da futura cozinha.',
    'O acampamento está quase de pé, mas um ninho de baratas mutantes está no caminho.']),
  escolhas: () => [
    {id: 'repelente', texto: 'Usam o Repelente no ninho.', requer: (e) => tem(e, 'inseticida')},
    {id: 'rifle', texto: 'Destroem o ninho com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'machado', texto: 'Destroem o ninho com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'nada', texto: 'Recusam a ajuda.'},
  ],
  resolver: (e, id) => {
    if (id === 'nada') {
      const tinha = tem(e, 'inseticida') || tem(e, 'rifle') || tem(e, 'machado')
      anotar(e, tinha ? 'A família recusa e os gêmeos vão embora, desapontados.' : 'Sem nada para ajudar, os gêmeos vão embora de cabeça baixa.')
      return
    }
    marcar(e, 'itens.gemeos.ninho')
    marcar(e, 'itens.baratas', false)
    anotar(e, 'As baratas saem e o ninho é destruído. Nenhum item se gasta e o acampamento segue.')
  },
}

// ---------------------------------------------------------------- diversao_criancas (cadeia: gêmeos, única)
const diversao_criancas = {
  id: 'diversao_criancas', grupo: 'cadeia', unico: true,
  quando: (e) => (F(e, 'itens.gemeos.obra') || F(e, 'itens.gemeos.mapa')) && !F(e, 'itens.gemeos.diversao'),
  peso: () => 1,
  texto: () => 'O acampamento está quase pronto. Faltam brinquedos para as crianças, e Lia e Dino perguntam se a família tem algum jogo.',
  escolhas: () => [
    {id: 'gaita', texto: 'Dão a Gaita.', requer: (e) => tem(e, 'gaita')},
    {id: 'baralho', texto: 'Dão o Baralho.', requer: (e) => tem(e, 'baralho')},
    {id: 'damas', texto: 'Dão o Tabuleiro de damas.', requer: (e) => tem(e, 'damas')},
    {id: 'nada', texto: 'Guardam os jogos.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'nada') {
      anotar(e, rng.chance(0.5) ? 'A família guarda os jogos e as crianças brincam de longe.' : 'A família guarda os jogos no armário. Sem efeito.')
      return
    }
    tirarItem(e, id, 1, `${cap(NOME[id])} vai para as crianças do acampamento. A brincadeira continua.`)
    marcar(e, 'itens.gemeos.diversao')
  },
}

// ---------------------------------------------------------------- plano_mapa (cadeia: gêmeos, única)
const plano_mapa = {
  id: 'plano_mapa', grupo: 'cadeia', unico: true,
  quando: (e) => !F(e, 'itens.gemeos.mapa'),
  peso: () => 1,
  texto: (e) => variante(e, ['Os gêmeos procuram um lugar para o acampamento e pedem um mapa da cidade.',
    'Lia e Dino querem escolher o melhor lugar para o acampamento, e precisam de um mapa.',
    'Os gêmeos estão com o plano pronto, só falta o mapa para marcar o terreno.']),
  escolhas: () => [
    {id: 'mapa', texto: 'Entregam o Mapa.', requer: (e) => tem(e, 'mapa')},
    {id: 'nada', texto: 'Recusam o pedido.'},
  ],
  resolver: (e, id) => {
    if (id === 'mapa') {
      marcar(e, 'itens.gemeos.mapa')
      anotar(e, 'O Mapa é entregue sem se gastar. Os gêmeos marcam o lugar do acampamento.')
    } else anotar(e, 'Duas recusas. Os gêmeos ficam sem mapa e sem plano.')
  },
}

// ---------------------------------------------------------------- cacadora (porta, cadeia: caçadora, passo 1)
const cacadora = {
  id: 'cacadora', grupo: 'porta', unico: true,
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Uma mulher com rifle e roupa de camuflagem bate na porta. Está sem munição e caçando uma aranha gigante.',
    'Vera, a caçadora, aparece com roupa de camuflagem. Pede munição e promete retribuir.']),
  escolhas: () => [
    {id: 'municao', texto: 'Dão 1 Munição para a caçadora.', requer: (e) => munic(e) > 0},
    {id: 'nada', texto: 'Mandam a caçadora embora.'},
  ],
  resolver: (e, id) => {
    if (id === 'municao') {
      gastarMunicao(e, 'Vera fica agradecida e promete voltar. Não há prêmio imediato.')
      e.flags['itens.cacadora.ajudada'] = e.dia
    } else anotar(e, 'Vera vai embora sem sua munição.')
  },
}

// ---------------------------------------------------------------- cavaleiros (porta)
const cavaleiros = {
  id: 'cavaleiros', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Dois homens fantasiados de cavaleiros batem na porta, com som de cavalo feito com pedras. Querem ver o mapa.',
    'Dois cavaleiros de papelão procuram um cálice antigo. Estão perdidos e pedem o Mapa.']),
  escolhas: () => [
    {id: 'mapa', texto: 'Mostram o Mapa.', requer: (e) => tem(e, 'mapa')},
    {id: 'nada', texto: 'Mandam os cavaleiros embora.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'mapa') {
      // sorteio entre três saídas, sem chance na fonte: 1/3 cada
      const saida = rng.escolher([
        () => darItem(e, rng.escolher(Object.keys(ITENS)), 1, 'Os cavaleiros dão suprimentos aleatórios.'),
        () => darItem(e, 'damas', 1, 'Os cavaleiros dão um tabuleiro de Damas.'),
        () => darItem(e, 'machado', 1, 'Os cavaleiros dão um Machado.'),
      ])
      saida()
    } else anotar(e, 'Os cavaleiros ficam ofendidos e vão embora.')
  },
}

// ---------------------------------------------------------------- vizinhos_porao (abrigo, única)
const OPCOES_PORAO = [
  (e) => darItem(e, 'mascara', 1, 'Lá embaixo há uma Máscara de gás.'),
  (e) => darItem(e, 'agua', 2, 'A adega guarda 2 Águas.'),
  (e) => darItem(e, 'kit', 1, 'Um Kit médico esquecido em um caixote.'),
  (e) => darItem(e, 'mapa', 1, 'Um Mapa escondido entre os caixotes.'),
  (e) => anotar(e, 'Só poeira e cimento. Nada para levar.'),
  (e, rng) => { const alvo = aoAcaso(e, rng); if (alvo) ferir(e, alvo, `${nome(e, alvo)} se machuca na escada do porão.`); else anotar(e, 'Ninguém se machuca.') },
]
const REPTIL = (e) => anotar(e, 'Um réptil enorme encara a Lanterna e some na escuridão. Ninguém leva nada.')
const vizinhos_porao = {
  id: 'vizinhos_porao', grupo: 'abrigo', unico: true,
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Barulhos vêm de baixo do piso. Há um alçapão trancado no canto do abrigo.',
    'Alguém bate do outro lado do alçapão. A família ouve vozes abafadas embaixo do chão.',
    'Um alçapão no canto, e barulhos vindos do porão. A família pode abrir ou ignorar.']),
  escolhas: () => [
    {id: 'machado', texto: 'Arrombam o alçapão com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'lanterna', texto: 'Descem com a Lanterna.', requer: (e) => tem(e, 'lanterna')},
    {id: 'nada', texto: 'Deixam o alçapão trancado.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'nada') { loucTodos(e); anotar(e, grupo(e, 'Ficar ouvindo os barulhos deixa a sanidade de todos mais baixa.', 'Ficar ouvindo os barulhos deixa a sanidade de {n} mais baixa.')); return }
    // seis saídas sem chance na fonte: 1/6 cada; com a Lanterna, a primeira é só a cena do réptil
    const saidas = [...OPCOES_PORAO]
    if (id === 'lanterna') saidas[0] = REPTIL
    rng.escolher(saidas)(e, rng)
  },
}

// ---------------------------------------------------------------- sinal_escoteiro (abrigo, única)
const sinal_escoteiro = {
  id: 'sinal_escoteiro', grupo: 'abrigo', unico: true,
  // "pelo menos uma expedição foi feita": o histórico guarda expedições (campo expedicao)
  quando: (e) => presente(e, 'filho') && e.historico.some((h) => h.expedicao),
  peso: () => 1,
  texto: (e) => `Luzes no horizonte, vistas na volta de uma expedição, parecem um sinal de escoteiros. ${nome(e, 'filho')} quer decifrá-lo.`,
  escolhas: () => [
    {id: 'guia', texto: 'Decifram o sinal com o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Desconfiam de armadilha.'},
  ],
  resolver: (e, id) => {
    if (id === 'guia') {
      // a fonte não mostra o evento seguinte da mensagem codificada: fica como flag para os eventos de rádio
      marcar(e, 'itens.sinal.codificado')
      anotar(e, 'O filho decifra o sinal e quer preparar uma mensagem codificada para transmitir.')
    } else {
      enlouquecer(e, 'filho', PONTOS, 'A família desconfia de armadilha, e o filho fica assustado.')
    }
  },
}

// ---------------------------------------------------------------- incendio (abrigo)
const incendio = {
  id: 'incendio', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Há fogo no abrigo, e ele se espalha depressa. Só dá para salvar um item.',
    'Uma faísca pegou em alguma coisa. A fumaça sobe e o fogo cresce no canto.',
    'O fogo se espalha pelas prateleiras. A família precisa decidir o que salvar.']),
  escolhas: () => [
    {id: 'kit', texto: 'Salvam o Kit médico.', requer: (e) => tem(e, 'kit')},
    {id: 'radio', texto: 'Salvam o Rádio.', requer: (e) => tem(e, 'radio')},
    {id: 'guia', texto: 'Salvam o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Tentam apagar o fogo do jeito que dá.'},
  ],
  resolver: (e, id, rng) => {
    const possui = (item) => (e.itens[item] ?? 0) > 0 // o texto só cita o que a família tem de fato
    if (id === 'kit') {
      ['manual', 'radio'].filter(possui).forEach((item) => quebrarItem(e, item, `${cap(NOME[item])} fica danificado.`))
      anotar(e, 'O Kit médico é salvo.')
    } else if (id === 'radio') {
      perder(e, 'manual'); perder(e, 'kit'); anotar(e, 'O Rádio é salvo.')
    } else if (id === 'guia') {
      perder(e, 'radio'); perder(e, 'kit'); anotar(e, 'O Guia de escoteiro é salvo.')
    } else {
      // quatro saídas da fonte, 1/4 cada
      const saidas = [
        () => {
          // o que se perde é só o que estava na família (sem texto por item: a linha final diz tudo)
          const perdidos = ['manual', 'radio', 'kit'].filter(possui)
          if (!perdidos.length) return anotar(e, 'Nada se perde: o fogo é apagado.')
          perdidos.forEach((item) => tirarItem(e, item, 1))
          anotar(e, `${juntar(perdidos.map((item) => CURTO[item]))} ${perdidos.length > 1 ? 'se perdem' : 'se perde'} nas chamas.`)
        },
        () => anotar(e, 'Nada se perde: o fogo é apagado.'),
        () => anotar(e, 'Nada se perde: a família se atira no fogo e o apaga.'),
        () => {
          if (!possui('agua')) return anotar(e, 'Sem Água por perto, a família abafa o fogo com as próprias mãos.')
          // a fonte não diz se a garrafa de água é gasta: 50%
          anotar(e, 'Uma garrafa de água apaga o fogo.')
          if (rng.chance(0.5)) tirarItem(e, 'agua', 1, 'A garrafa de Água é gasta no processo.')
        },
      ]
      rng.escolher(saidas)()
    }
  },
}

// ---------------------------------------------------------------- ferida_filho (abrigo)
const ferida_filho = {
  id: 'ferida_filho', grupo: 'abrigo',
  quando: (e) => semKit(e, 'filho') && presente(e, 'filho'),
  peso: () => 1,
  texto: (e) => variante(e, ['O filho se cortou num metal enferrujado e a ferida infeccionou.',
    'Um corte na mão do filho está feio e vermelho ao redor. Hora de cuidar dele.']),
  escolhas: () => [
    {id: 'machado', texto: 'Limpam a ferida com o Machado aquecido.', requer: (e) => tem(e, 'machado')},
    {id: 'kit', texto: 'Usam o Kit médico.', requer: (e) => tem(e, 'kit')},
    {id: 'nada', texto: 'Esperam a ferida passar.'},
  ],
  resolver: (e, id, rng) => {
    resolverSemKit(e, 'filho')
    if (id === 'machado') {
      tirarItem(e, 'machado', 1, 'O Machado limpa a ferida e a doença do filho some. O Machado é gasto.')
      curar(e, 'filho')
      if (rng.chance(0.5)) ferir(e, 'filho', 'O Machado escorrega e o filho se fere de novo.') // sem percentual: 50%
    } else if (id === 'kit') {
      tirarItem(e, 'kit', 1, 'O Kit médico cura a doença do filho. O Kit é gasto.')
      curar(e, 'filho')
    } else {
      anotar(e, 'Sem tratamento, o filho pode adoecer.')
      if (rng.chance(0.5)) adoecer(e, 'filho', 'O filho adoece de vez.')
    }
  },
}

// ---------------------------------------------------------------- duas_patas (porta)
const duas_patas = {
  id: 'duas_patas', grupo: 'porta',
  quando: (e) => e.flags[CAO] === undefined,
  peso: () => 1,
  texto: (e) => variante(e, ['Quando a família vai olhar lá fora, um bicho de olhos brilhantes rosna no escuro.',
    'Um animal rosna do lado de fora, e a família tem poucos segundos para decidir.',
    'Olhos brilhantes na escuridão e um rosnado baixo. Dá para espantar, matar ou acolher.']),
  escolhas: () => [
    {id: 'repelente', texto: 'Borrifam o Repelente.', requer: (e) => tem(e, 'inseticida')},
    {id: 'rifle', texto: 'Atiram com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'lanterna', texto: 'Iluminam o bicho com a Lanterna.', requer: (e) => tem(e, 'lanterna')},
    {id: 'nada', texto: 'Ficam paralisados de medo.'},
  ],
  resolver: (e, id) => {
    if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O bicho some. O Repelente é gasto.')
      e.flags[CAO] = 'perdido'
    } else if (id === 'rifle') {
      anotar(e, 'O bicho é afugentado com um tiro para o alto.')
      e.flags[CAO] = 'perdido'
    } else if (id === 'lanterna') {
      anotar(e, 'É um cachorro cansado. Ele fica uma noite e vai embora de manhã, mas volta depois.')
      e.flags[CAO] = 'habilitado'
    } else {
      enlouquecer(e, 'filha', PONTOS); enlouquecer(e, 'mae', PONTOS); enlouquecer(e, 'pai', PONTOS); enlouquecer(e, 'filho', PONTOS)
      anotar(e, grupo(e, 'A família se assusta e a sanidade de todos cai. O bicho some na escuridão.', 'A família se assusta e a sanidade de {n} cai. O bicho some na escuridão.'))
      e.flags[CAO] = 'perdido'
    }
  },
}

// ---------------------------------------------------------------- comunicacao_baratas (abrigo)
const comunicacao_baratas = {
  id: 'comunicacao_baratas', grupo: 'abrigo',
  quando: (e) => F(e, 'itens.baratas'),
  peso: () => 1,
  texto: (e) => variante(e, ['As baratas parecem tentar se comunicar com a família. Uma delas segura um cartaz.',
    'Um cartaz feito de papelão aparece na frente das baratas. Parece uma mensagem.']),
  escolhas: () => [
    {id: 'guia', texto: 'Respondem com violência, usando o Guia de escoteiro.', requer: (e) => tem(e, 'manual')},
    {id: 'repelente', texto: 'Respondem com o Repelente.', requer: (e) => tem(e, 'inseticida')},
    {id: 'nada', texto: 'Ignoram o cartaz.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'guia') anotar(e, 'A família responde com violência. Sem efeito de jogo.')
    else if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O Repelente é gasto.')
      // duas saídas alternativas sem critério: 50%
      if (rng.chance(0.5)) anotar(e, 'A família responde com violência. Sem efeito de jogo.')
      else anotar(e, 'A reação com o spray desbloqueia uma conquista. Sem efeito de jogo.')
    } else {
      loucTodos(e)
      anotar(e, grupo(e, 'Ignorar o cartaz deixa todos mais nervosos.', 'Ignorar o cartaz deixa {n} com os nervos à flor da pele.'))
      if (rng.chance(0.5)) mutar(e, 'filha', `${nome(e, 'filha')} vira mutante depois de ver o cartaz.`)
    }
  },
}

// ---------------------------------------------------------------- academia_escola (cadeia: gêmeos, única)
const academia_escola = {
  id: 'academia_escola', grupo: 'cadeia', unico: true,
  // a fonte cita também um evento fora desta lista como condição: ignorado
  quando: (e) => (F(e, 'itens.gemeos.obra') || F(e, 'itens.gemeos.mapa')) && !F(e, 'itens.gemeos.escola'),
  peso: () => 1,
  texto: (e) => variante(e, ['Os gêmeos querem montar uma escola para as crianças do acampamento e pedem livros.',
    'Lia e Dino têm um plano de aula ao ar livre e precisam de um guia para as crianças.']),
  escolhas: () => [
    {id: 'guia', texto: 'Doam o Guia de escoteiro para a escola.', requer: (e) => tem(e, 'manual')},
    {id: 'nada', texto: 'Recusam o pedido.'},
  ],
  resolver: (e, id) => {
    if (id === 'guia') {
      tirarItem(e, 'manual', 1, 'A família doa o Guia de escoteiro. Ele se perde na escola, mas a cadeia continua.')
      marcar(e, 'itens.gemeos.escola')
    } else anotar(e, 'Cinco respostas de recusa e os gêmeos desistem da escola.')
  },
}

// ---------------------------------------------------------------- barulhos (abrigo)
const barulhos = {
  id: 'barulhos', grupo: 'abrigo',
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Barulhos sem origem clara vêm de algum canto do abrigo. Ninguém sabe de onde.',
    'Um estalo, um arrasto, um murmúrio. Os barulhos não param e a família não sabe de onde vêm.',
    'Ruídos estranhos ecoam pelo porão. Isso tira a sanidade de qualquer um.']),
  escolhas: () => [
    {id: 'baralho_ou_damas', texto: 'Jogam Baralho ou Damas para abafar o barulho.', requer: (e) => tem(e, 'baralho') || tem(e, 'damas')},
    {id: 'nada', texto: 'Tentam ignorar o barulho.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'baralho_ou_damas') { sanTodos(e); anotar(e, grupo(e, 'O jogo abafa o barulho e a sanidade de todos sobe.', 'O jogo abafa o barulho e a sanidade de {n} sobe.')); return }
    anotar(e, 'Os barulhos continuam.')
    // quatro consequências da fonte ("às vezes"), 50% cada
    if (presente(e, 'pai') && rng.chance(0.5)) enlouquecer(e, 'pai', PONTOS, `${nome(e, 'pai')} enlouquece com o barulho.`)
    if (presente(e, 'mae') && rng.chance(0.5)) enlouquecer(e, 'mae', PONTOS, `${nome(e, 'mae')} enlouquece com o barulho.`)
    if (presente(e, 'filha') && rng.chance(0.5)) enlouquecer(e, 'filha', PONTOS, `${nome(e, 'filha')} fica mais louca do que já estava.`)
    if (presente(e, 'filho') && rng.chance(0.5)) enlouquecer(e, 'filho', PONTOS, `${nome(e, 'filho')} passa a usar uma lata como capacete.`)
  },
}

// ---------------------------------------------------------------- defender_abrigo (porta)
const defender_abrigo = {
  id: 'defender_abrigo', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => ['Uma gangue tenta entrar no abrigo. A família escolhe como reagir.',
    'Bombeiros falsos batem na porta, com pressa demais. Algo não parece certo.',
    'Senhoras com guarda-chuvas e bengalas querem entrar. Alguém raspa a porta de fora.',
    `Bandidos da vizinhança rondam a porta. ${nome(e, 'pai')} pega um pedaço de pau.`][e.dia % 4],
  escolhas: () => [
    {id: 'cadeado', texto: 'Trancam com o Cadeado.', requer: (e) => tem(e, 'cadeado')},
    {id: 'repelente', texto: 'Jogam o Repelente nos invasores.', requer: (e) => tem(e, 'inseticida')},
    {id: 'machado', texto: 'Afastam o grupo com o Machado.', requer: (e) => tem(e, 'machado')},
    {id: 'rifle', texto: 'Atiram com o Rifle.', requer: (e) => tem(e, 'rifle')},
    {id: 'nada', texto: 'Não fazem nada e esperam.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'cadeado') tirarItem(e, 'cadeado', 1, 'Os invasores desistem ao ver o Cadeado. O Cadeado é gasto.')
    else if (id === 'repelente') {
      tirarItem(e, 'inseticida', 1, 'O Repelente é jogado. O Repelente é gasto.')
      if (rng.chance(0.5)) anotar(e, 'Os invasores recuam, sem perda.')
      else { tirarItem(e, 'sopa', 2, 'Mesmo com o spray, eles roubam 2 Sopas.') }
    } else if (id === 'machado') {
      tirarItem(e, 'machado', 1, 'O Machado é perdido na briga.')
      if (rng.chance(0.5)) darItem(e, 'rifle', 1, 'O grupo se afasta e deixa um Rifle para trás.')
      else anotar(e, 'O grupo se afasta, sem ganho.')
    } else if (id === 'rifle') {
      // duas saídas: ganho de Machado ou Rifle quebrado; 50%
      if (rng.chance(0.5)) darItem(e, 'machado', 1, 'O grupo se afasta e deixa um Machado para trás.')
      else quebrarItem(e, 'rifle', 'O Rifle quebra no meio da briga.')
    } else {
      // quinze saídas da fonte, sem critério: sorteio entre os 12 tipos (as variantes de texto foram unidas)
      rng.escolher(SAQUES_NADA)(e)
    }
  },
}

// ---------------------------------------------------------------- ajuda_refugiados (porta)
const ajuda_refugiados = {
  id: 'ajuda_refugiados', grupo: 'porta',
  quando: () => true,
  peso: () => 1,
  texto: (e) => variante(e, ['Sobreviventes feridos batem na porta pedindo água, comida ou curativos.',
    'Um grupo de refugiados aparece na porta, todos cansados e pedindo ajuda.',
    'Gente machucada chega do lado de fora. Pedem remédio, água ou um lugar para descansar.']),
  escolhas: () => [
    {id: 'kit_agua_ou_sopa', texto: 'Dão o Kit médico e 1 Água ou Sopa.', requer: (e) => tem(e, 'kit') && !!aguaOuSopa(e)},
    {id: 'nada', texto: 'Mandam os refugiados seguirem viagem.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'kit_agua_ou_sopa') {
      // "-1 desse item": a fonte não especifica qual; gastamos 1 Kit e 1 Água/Sopa
      tirarItem(e, 'kit', 1, 'Um Kit médico vai para os refugiados.')
      gastarAguaOuSopa(e, 'A Água ou Sopa também vai para os refugiados.')
      // três saídas da fonte, sem chance: 1/3 cada
      const saidas = [
        () => { darItem(e, 'mapa', 1, 'Os refugiados deixam um Mapa como agradecimento.'); sanTodos(e, 100) },
        () => { darItem(e, 'radio', 1, 'Um Rádio funcionando como agradecimento.'); sanTodos(e, 100) },
        () => sanTodos(e, 100),
      ]
      rng.escolher(saidas)()
    } else if (rng.chance(0.5)) anotar(e, 'Os refugiados seguem viagem. Sem efeito.')
    else saquear(e, 'Os refugiados atacam e roubam tudo o que há no abrigo.') // 50%: a fonte não dá chance
  },
}

// ---------------------------------------------------------------- vencedor_sopa e vencedor_agua (porta)
// "Quem ganha leva tudo": compara o menor e o maior recurso (Sopa x Água). Empate: a fonte não diz; 50% para cada lado.
const apostaCartas = (e, rng, item, outro) => {
  const meu = e.itens[item] ?? 0
  const oposto = e.itens[outro] ?? 0
  if (meu < oposto) darItem(e, item, 2, `${CURTO[item]} é o recurso menor: ganha 2.`)
  else if (meu > oposto) tirarItem(e, item, 2, `${CURTO[item]} é o recurso maior: perde 2.`)
  else if (rng.chance(0.5)) darItem(e, item, 2, `Empate: a família ganha 2 ${CURTO[item]}s.`)
  else tirarItem(e, item, 2, `Empate: a família perde 2 ${CURTO[item]}s.`)
}
const vencedor_sopa = {
  id: 'vencedor_sopa', grupo: 'porta',
  quando: (e) => tem(e, 'sopa', 2),
  peso: () => 1,
  texto: (e) => variante(e, ['Um homem propõe uma partida de cartas, valendo 2 Sopas.',
    'Um sujeito com cara de jogador quer apostar 2 Sopas numa partida de cartas.']),
  escolhas: () => [
    {id: 'baralho', texto: 'Jogam o Baralho e apostam.', requer: (e) => tem(e, 'baralho')},
    {id: 'nada', texto: 'Dizem que não jogam.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'baralho') apostaCartas(e, rng, 'sopa', 'agua')
    else anotar(e, 'O homem vai embora. Sem efeito.')
  },
}
const vencedor_agua = {
  id: 'vencedor_agua', grupo: 'porta',
  quando: (e) => tem(e, 'agua', 2),
  peso: () => 1,
  texto: (e) => variante(e, ['Um homem propõe uma partida de cartas, valendo 2 Águas.',
    'Um desconhecido quer apostar 2 Águas numa rodada de cartas.']),
  escolhas: () => [
    {id: 'baralho', texto: 'Jogam o Baralho e apostam.', requer: (e) => tem(e, 'baralho')},
    {id: 'nada', texto: 'Dizem que não jogam.'},
  ],
  resolver: (e, id, rng) => {
    if (id === 'baralho') apostaCartas(e, rng, 'agua', 'sopa')
    else anotar(e, 'O homem vai embora. Sem efeito.')
  },
}

// ---------------------------------------------------------------- monstro_coleira (cadeia: caçadora, passo 2, automático)
const monstro_coleira = {
  id: 'monstro_coleira', grupo: 'cadeia', unico: true,
  // "alguns dias depois": a fonte não diz quantos; usamos 2 dias. Automático: peso alto para disparar no dia certo
  quando: (e) => e.flags['itens.cacadora.ajudada'] !== undefined && e.dia >= e.flags['itens.cacadora.ajudada'] + 2 && !F(e, 'itens.cacadora.monstro'),
  peso: () => 100,
  texto: () => 'A caçadora volta com a aranha gigante domesticada e divide uma refeição com a família. A aranha ronrona.',
  escolhas: () => [],
  resolver: (e) => {
    marcar(e, 'itens.cacadora.monstro')
    zerarFome(e, grupo(e, 'A família come junto com a aranha. A fome de todos some por um dia.', 'A família come junto com a aranha. A fome de {n} some por um dia.'))
  },
}

// ---------------------------------------------------------------- medicos_retorno (cadeia: médicos, passo 2, automático)
const medicos_retorno = {
  id: 'medicos_retorno', grupo: 'cadeia', unico: true,
  // "alguns dias depois": a fonte não diz quantos; usamos 2 dias. Automático: peso alto para disparar no dia certo
  quando: (e) => e.flags['itens.medicos.agua'] !== undefined && e.dia >= e.flags['itens.medicos.agua'] + 2 && !F(e, 'itens.medicos.retorno'),
  peso: () => 100,
  texto: () => 'Os médicos voltam e aplicam injeções em toda a família.',
  escolhas: () => [],
  resolver: (e) => {
    marcar(e, 'itens.medicos.retorno')
    curarTodos(e)
    anotar(e, grupo(e, 'As injeções curam todos os feridos e doentes da família.', 'As injeções curam {n}, se estiver ferido ou doente.'))
  },
}

// ---------------------------------------------------------------- lista final
export const EVENTOS = [
  terremoto, machado_gemeos, exercito_galoes, vendedor_porta, mau_cheiro, bandidos_porta, monstros_roedores,
  cartas_ponto, ventilacao_travada, tedio_abrigo, mae_abatida, ferida_mae, detetive_pato, balas_comerciante,
  passeio_cao, fotos_familia, enchente, seguir_cao, comida_cao, vizinhos_protecao, vizinhos_escolta, aniv_filha,
  aniv_filho, remedio_caseiro, pesca_mala, visita_ferida_mae, medicos_visita, infestacao, mala_misteriosa,
  suprimentos_agentes, vizinha_mutante, carta_ajuda, aranhas, enxame, derrubar_ninho, diversao_criancas,
  plano_mapa, cacadora, cavaleiros, vizinhos_porao, sinal_escoteiro, incendio, ferida_filho, duas_patas,
  comunicacao_baratas, academia_escola, barulhos, defender_abrigo, ajuda_refugiados, vencedor_sopa,
  vencedor_agua, monstro_coleira, medicos_retorno,
]
