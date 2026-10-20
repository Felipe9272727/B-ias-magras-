// Eventos de SIM/NÃO do 60 Segundos das IAs: 55 eventos (seção 1 de docs/eventos_simnao_pessoas.md).
// Ids (55): dieta_fungo, encontro_proibido, vigilancia, disputa_lata, tuba, passeio_filho, xerifes, canibalismo,
// mimica, limpeza, propaganda, casa_vizinha, sinal_estranho, nao_sozinho, diario, carta_codigo, disputa_familia,
// atividade_extra, conversa_mae, conversa_filha, conversa_filha_mutante, conversa_filho, rastro_gato,
// jogo_gato_damas, comida_fresca, fio_gato, grandes_expectativas, show_harmonica, batida_sobrevivencia,
// batida_final, linguagem, claustrofobia, aviso_final, escola_filha, passeio_cachorro, fantasma_mapa,
// picnic_casal, fuga_gato, escoteiro, mau_humor_mae, cheiro_buraco, pega_pega, carro_pai, codigo,
// lado_sombrio_idosos, lado_sombrio_vizinha, lado_sombrio_professora, telescopio, radio_conserto,
// mala_misteriosa, gato_entra, pedra_vendedor, churrasco, jovens_armados, plantacao.
//
// Convenções deste arquivo (ver também docs/CONTRATO.md):
// - Flags com prefixo 'simnao.': libera.<evento> (desbloqueia outro evento); final.<cadeia> = 'andamento' | 'fechado'
//   (estado das cadeias de final; batida_final lê também 'pessoas.final.<cadeia>'); gato.no_abrigo / gato.volta;
//   batida.entrou.<id> (dia em que a pessoa entrou pela batida); conquista.<nome>; marca_sangue; baratas; cientista.
// - Flags 'expedicao.saiu.<id>' = dia da saída. Quem manda alguém para fora deve gravar; aqui só lemos.
// - Sanidade ↑/↓ = loucura -/+ SAN; ↓↓ = SAN2. Os números são nossos (a fonte não dá).
// - Efeitos que não têm função em estado.mjs (fome/sede/cansaço zerados, consertar item, gato/cachorro como
//   membro) entram só no diário, com comentário. Gato e cachorro não existem no estado: o gato usa a flag
//   'simnao.gato.no_abrigo'; o cachorro fica inativo (nenhum evento deste arquivo o põe no abrigo).
// - Sorteio sem chance na fonte: uniforme (rng.escolher). Escolha binária sem chance: 50% (rng.chance).
// - Trocas da fonte: canibalismo (sim) virou racionamento leve, sem gore.
import {ITENS} from '../itens.mjs'
import {
  adoecer, adultosVivos, anotar, cansar, darItem, enlouquecer, ferir, pessoa, quebrarItem, sair, terminar, tirarItem,
  voltar, noAbrigo, nome, tem, vivos,
} from '../estado.mjs'

const SAN = 15 // sanidade ↑/↓ (pontos de loucura)
const SAN2 = 30 // sanidade ↓↓
const LOUCO = 100 // "fica louco" = loucura no máximo; "alguém louco" = loucura no máximo

// ---------------------------------------------------------------- consultas
const ids = (e) => vivos(e).map((p) => p.id)
const presentes = (e) => noAbrigo(e).map((p) => p.id)
const esta = (e, ...lista) => lista.every((id) => presentes(e).includes(id))
// "todos" só se a família tem 2+ vivos; com uma pessoa só, o texto usa o nome dela ({n})
const grupo = (e, plural, singular) => { const v = vivos(e); return v.length === 1 ? singular.replace('{n}', v[0].nome) : plural }
const alguemFora = (e) => e.pessoas.some((p) => p.vivo && p.fora)
const expedicoes = (e) => Object.entries(e.flags).filter(([k]) => k.startsWith('expedicao.saiu.'))
const jaSaiu = (e, id) => (id ? e.flags[`expedicao.saiu.${id}`] !== undefined : expedicoes(e).length > 0)
const alguemLouco = (e) => vivos(e).some((p) => p.loucura >= LOUCO)
const louco = (e, id) => (pessoa(e, id)?.loucura ?? 0) >= LOUCO
const baixo = (e, item) => (e.itens[item] ?? 0) <= 2 // "nível baixo": limite nosso, a fonte não dá
const visto = (e, id) => (e.eventosVistos?.[id] ?? 0) > 0
const perdidos = (e) => e.pessoas.filter((p) => p.perdido && !p.noAbrigo && !p.morte) // ficaram na casa e ainda não entraram
const gatoNoAbrigo = (e) =>
  e.flags['simnao.gato.no_abrigo'] === true ||
  (e.flags['simnao.gato.volta'] !== undefined && e.dia >= e.flags['simnao.gato.volta'])
const RESGATES = ['militar', 'gemeos', 'bunker_vip', 'estrelas']

// status compartilhado das cadeias de final (este arquivo e pessoas.mjs gravam os seus)
const cadeiaStatus = (e, c) => {
  const s = ['simnao', 'pessoas'].map((m) => e.flags[`${m}.final.${c}`])
  return s.includes('fechado') ? 'fechado' : s.includes('andamento') ? 'andamento' : null
}

// ---------------------------------------------------------------- flags, sanidade, sorteios
const marca = (e, k, v = true) => {
  e.flags[`simnao.${k}`] = v
}
const lido = (e, k) => e.flags[`simnao.${k}`]
const sanidadeUp = (e, lista, pts = SAN) => lista.forEach((id) => enlouquecer(e, id, -pts))
const sanidadeDown = (e, lista, pts = SAN) => lista.forEach((id) => enlouquecer(e, id, pts))
const louqueceu = (e, id, texto) => enlouquecer(e, id, LOUCO, texto)
const sorteia = (rng, ...opcoes) => rng.escolher(opcoes)()
const sorte = (rng, lista) => (lista.length ? rng.escolher(lista) : null)
const SN = (sim, nao) => () => [
  {id: 'sim', texto: sim},
  {id: 'nao', texto: nao},
]

// chance não informada na fonte: 50% por pessoa
function adoeceAlguns(e, rng, lista) {
  const escolhidos = lista.filter(() => rng.chance(0.5))
  if (!escolhidos.length) return anotar(e, 'Ninguém adoece, por enquanto.')
  return escolhidos.forEach((id) => adoecer(e, id, `${nome(e, id)} adoece.`))
}

function darAleatorio(e, rng, texto) {
  const k = rng.escolher(Object.keys(ITENS))
  darItem(e, k, 1, `${texto}: ${ITENS[k].nome}.`)
}

function tirarAleatorio(e, rng, texto) {
  const ks = Object.keys(ITENS).filter((k) => tem(e, k))
  if (!ks.length) return anotar(e, `${texto}. Não havia nada para perder.`)
  const k = rng.escolher(ks)
  tirarItem(e, k, 1, `${texto}: ${ITENS[k].nome}.`)
}

// ---------------------------------------------------------------- expedição, batida, gato, final
// Manda alguém numa tarefa fora (expedição de `dias` dias). O motor do abrigo traz a pessoa de volta no dia `volta`.
function mandarFora(e, id, tarefa, dias = 1) {
  const p = pessoa(e, id)
  if (!p?.vivo || !p.noAbrigo) return null
  p.fora = {local: `tarefa:${tarefa}`, saiu: e.dia, volta: e.dia + dias, itens: []}
  p.noAbrigo = false
  cansar(e, id, 2)
  e.flags[`expedicao.saiu.${id}`] = e.dia
  return p
}

function gatoSai(e, dias) {
  e.flags['simnao.gato.no_abrigo'] = false
  e.flags['simnao.gato.volta'] = e.dia + dias
}

// quem entra pela batida: estados aleatórios com chance não informada (50%)
// fome e sede iniciais não têm função em estado.mjs; a regra de morte ao entrar também fica de fora
function entrar(e, rng, id) {
  marca(e, `batida.entrou.${id}`, e.dia)
  voltar(e, id, `${nome(e, id)} entra no abrigo.`)
  if (rng.chance(0.5)) ferir(e, id, `${nome(e, id)} entra machucado.`)
  if (rng.chance(0.5)) adoecer(e, id, `${nome(e, id)} entra doente.`)
  cansar(e, id, rng.int(0, 2))
  enlouquecer(e, id, rng.int(0, 30))
}

function saque(e, rng) {
  anotar(e, 'O bando saqueia o abrigo e leva tudo o que encontra.')
  for (const k of Object.keys(e.itens)) if (e.itens[k] > 0) tirarItem(e, k, e.itens[k])
  sanidadeDown(e, presentes(e), SAN2)
  // "pode cair em fim": chance não informada na fonte, 50%
  if (rng.chance(0.5)) terminar(e, 'fim', 'derrota', 'saque', 'Sem nada e sem esperança, ninguém resiste.')
}

// efeito fixo do lado sombrio (todos os desfechos): sanidade de todos ↓, marca de sangue, gêmeos fechados
function ladoSombrioSim(e, rng, textos) {
  sanidadeDown(e, ids(e))
  marca(e, 'marca_sangue') // marcador novo; a fonte não define regra
  marca(e, 'final.gemeos', 'fechado') // gêmeos deixam de poder resgatar
  marca(e, 'conquista.lado_sombrio')
  sorteia(
    rng,
    () => {
      anotar(e, textos[0])
      darItem(e, 'sopa', 4)
      darItem(e, 'agua', 4)
    },
    () => darAleatorio(e, rng, textos[1]),
    () => anotar(e, textos[2]),
    () => anotar(e, textos[3]),
  )
  anotar(e, 'Ficam com uma marca de sangue. Conquista: lado sombrio.')
}

// ---------------------------------------------------------------- eventos
export const EVENTOS = [
  {
    id: 'dieta_fungo', grupo: 'abrigo',
    quando: () => true,
    peso: () => 1, // frequência não indicada
    texto: () => 'Um fungo comestível cresceu numa parede do abrigo. Alguém se arrisca a provar?',
    escolhas: SN('Provar', 'Nem olhar'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'nao') return anotar(e, 'Ninguém encosta no fungo. Por enquanto.')
      return sorteia(
        rng,
        () => anotar(e, grupo(e, 'O fungo tem gosto de cogumelo. Todos comem e se sentem alimentados.', 'O fungo tem gosto de cogumelo. {n} come e fica de barriga cheia.')), // fome zerada: sem função
        () => adoeceAlguns(e, rng, ids(e)),
      )
    },
  },
  {
    id: 'encontro_proibido', grupo: 'abrigo',
    quando: (e) => esta(e, 'mae', 'filha') && jaSaiu(e, 'filha'),
    peso: () => 1,
    texto: (e) => `${nome(e, 'filha')} saiu escondida à noite para ver um rapaz que conheceu lá fora. Agora pede para mandar um bilhete de desculpas. Deixamos?`,
    escolhas: SN('Deixar mandar', 'Fica de castigo'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'O rapaz foi atacado por um bicho antes do encontro. A filha aceita e se acalma.')
            sanidadeUp(e, ['filha'])
          },
          () => {
            anotar(e, 'Ela volta ferida: viu o rapaz com outra garota.')
            ferir(e, 'filha', `${nome(e, 'filha')} volta ferida.`)
          },
        )
      }
      return sorteia(
        rng,
        () => anotar(e, 'A discussão esquenta, mas ninguém cede.'),
        () => {
          anotar(e, 'A filha implora e a mãe não cede. A filha fica abalada.')
          sanidadeDown(e, ['filha'])
        },
      )
    },
  },
  {
    id: 'vigilancia', grupo: 'cadeia',
    quando: (e) => lido(e, 'libera.vigilancia') === true,
    peso: () => 1,
    unico: true,
    texto: () => 'Os homens que espionavam a família batem na escotilha e querem explicar.',
    escolhas: SN('Ouvir', 'Mandar embora'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'final.bunker_vip', 'andamento') // passo 1 da cadeia bunker VIP
        return anotar(e, 'Dizem ser agentes de uma missão secreta. O grampo era para o gato, suspeito de espionar. Prometem um refúgio com suprimentos se ajudarem nas missões.')
      }
      marca(e, 'final.bunker_vip', 'fechado')
      return anotar(e, 'Mandam os homens embora. O refúgio ficou para trás.')
    },
  },
  {
    id: 'disputa_lata', grupo: 'abrigo',
    quando: (e) => esta(e, 'filha', 'filho') && baixo(e, 'sopa'),
    peso: () => 1,
    texto: () => 'As crianças brigam pela última lata de sopa. A família decide se intervém.',
    escolhas: SN('Intervir', 'Deixar brigar'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => anotar(e, 'A lata some e o filho não recebe nada.'),
          () => {
            anotar(e, 'Divisão com regra: o filho leva a parte dele, a filha come a dela.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
          },
        )
      }
      anotar(e, 'A lata cai e derrama. As crianças ficam cansadas e nervosas.')
      tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
      cansar(e, 'filha', 2)
      cansar(e, 'filho', 2)
      sanidadeDown(e, ['filha', 'filho'])
      return undefined
    },
  },
  {
    id: 'tuba', grupo: 'expedicao',
    quando: (e) => esta(e, 'filha') && !alguemFora(e),
    peso: () => 1,
    texto: () => 'A filha sente falta de tocar. Ela pede para procurar o instrumento nas ruínas da casa.',
    escolhas: SN('Deixar procurar', 'Dizer que não'),
    resolver(e, esc) {
      if (esc === 'sim') {
        mandarFora(e, 'filha', 'tuba', 1) // a fonte não diz o que ela acha: sem resultado listado
        sanidadeUp(e, ['filha'])
        return anotar(e, 'A filha sai para procurar o instrumento e vai ficar fora um dia.')
      }
      sanidadeDown(e, ['filha'], SAN2)
      return anotar(e, 'A filha fecha a porta do quarto e fica dias sem falar.')
    },
  },
  {
    id: 'passeio_filho', grupo: 'expedicao',
    // a fonte diz "alguma expedição em andamento" (condição a confirmar; conflita com a regra de não mandar com alguém fora)
    quando: (e) => esta(e, 'filho') && alguemFora(e),
    peso: () => 1,
    texto: () => 'O filho quer sair para correr na superfície. A família decide.',
    escolhas: SN('Deixar correr', 'Não, fica em casa'),
    resolver(e, esc) {
      if (esc === 'sim') {
        mandarFora(e, 'filho', 'passeio', 2)
        sanidadeUp(e, ['filho'])
        return anotar(e, 'O filho sai para correr e promete voltar cansado e feliz.')
      }
      sanidadeDown(e, ['filho'], SAN2)
      return anotar(e, 'O filho chora e bate o pé. Passa o dia emburrado.')
    },
  },
  {
    id: 'xerifes', grupo: 'porta',
    quando: () => true,
    peso: () => 1,
    texto: () => 'Um bando vestido de verde bate à porta: diz que tira dos ricos para dar aos pobres. Deixamos entrar?',
    escolhas: SN('Deixar entrar', 'Manter trancada'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'nao') return anotar(e, 'A porta fica trancada. Ninguém responde.')
      const total = Object.values(e.itens).reduce((s, n) => s + n, 0)
      if (total <= 6) {
        return sorteia(
          rng,
          () => darItem(e, 'radio', 1, 'Eles acham que a família não tem rádio e dão um.'),
          () => darItem(e, 'kit', 1, 'Deixam um kit médico de presente.'),
          () => darItem(e, 'agua', 3, 'Deixam três garrafas de água.'),
        )
      }
      anotar(e, 'Com tanta coisa no abrigo, o bando leva dois itens e vai embora.')
      tirarAleatorio(e, rng, 'Levam')
      return tirarAleatorio(e, rng, 'Levam mais um')
    },
  },
  {
    id: 'canibalismo', grupo: 'abrigo',
    // TROCA: a fonte não define desfecho (e o original é gore). Aqui, o "sim" vira racionamento leve, sem consequência violenta.
    quando: (e) => (e.itens.sopa ?? 0) === 0 && noAbrigo(e).length >= 2,
    peso: () => 1,
    texto: () => 'Sem comida, a família está com fome e com medo. Alguém sugere pensar num jeito de atravessar isso.',
    escolhas: SN('Racionar o que resta', 'Recusar a ideia'),
    resolver(e, esc) {
      if (esc === 'sim') {
        anotar(e, 'Dividem o que sobrou em partes iguais e contam histórias para não pensar na fome. O ânimo sobe.')
        return sanidadeUp(e, presentes(e))
      }
      return anotar(e, 'Recusam a ideia. Ninguém quer falar disso.')
    },
  },
  {
    id: 'mimica', grupo: 'abrigo',
    quando: (e) => esta(e, 'pai', 'filho'),
    peso: () => 1,
    texto: () => 'O filho quer brincar de mímica com o pai, que está de mau humor e não quer nada.',
    escolhas: SN('Aceitar', 'Recusar'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'A brincadeira vira briga e acusações. Os dois saem brigados.')
            sanidadeDown(e, ['pai', 'filho'])
          },
          () => tirarAleatorio(e, rng, 'O filho se debate e derruba objetos'),
        )
      }
      const opcoes = [
        () => darAleatorio(e, rng, 'O pai se recusa, mas o filho acha um suprimento escondido'),
        () => anotar(e, 'O filho sai de casa, mas volta.'),
        () => {
          anotar(e, 'A porta emperra e entra ar contaminado.')
          adoeceAlguns(e, rng, ids(e))
        },
      ]
      if (esta(e, 'filha')) {
        opcoes.push(() => {
          anotar(e, 'A irmã se anima e anima o filho.')
          sanidadeUp(e, ['filho'])
        })
      }
      return sorteia(rng, ...opcoes)
    },
  },
  {
    id: 'limpeza', grupo: 'abrigo',
    quando: (e) => esta(e, 'mae', 'filho') && lido(e, 'baratas') === true,
    peso: () => 1,
    texto: () => 'O filho fez experimentos com baratas mutantes e deixou uma aberta na mesa. A mãe quer dar uma lição.',
    escolhas: SN('Dar a lição', 'Deixar pra lá'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => darAleatorio(e, rng, 'O filho limpa o dia todo e acha um suprimento perdido'),
          () => {
            anotar(e, 'O filho foge para fora e volta enjoado.')
            adoecer(e, 'filho', `${nome(e, 'filho')} fica doente.`)
          },
        )
      }
      return sorteia(
        rng,
        () => anotar(e, 'A mãe limpa sozinha. O filho se arrepende e ajuda no resto.'),
        () => {
          anotar(e, 'O filho finge que dorme. A mãe tropeça ao espanar.')
          ferir(e, 'mae', `${nome(e, 'mae')} se machuca.`)
        },
      )
    },
  },
  {
    id: 'propaganda', grupo: 'abrigo',
    quando: (e) => esta(e, 'filho'),
    peso: () => 1,
    unico: true,
    texto: () => 'As revistas do filho têm heróis de um país rival. A família acha traição e quer jogar tudo fora.',
    escolhas: SN('Expulsar as revistas e o filho', 'Deixar ficar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        return sair(e, 'filho', 'expulso', 'A família expulsa o filho com as revistas. Não se sabe se ele volta.')
      }
      return anotar(e, 'O filho fica. As revistas viram papel higiênico.')
    },
  },
  {
    id: 'casa_vizinha', grupo: 'radio',
    quando: () => true, // a fonte: sem pré-requisito (surge logo após o rádio com gritos e silêncio)
    peso: () => 1,
    unico: true,
    texto: () => 'O rádio pega gritos e depois silêncio. Antes disso, uma mulher deu nome e endereço de uma casa da cidade. Vamos até lá?',
    escolhas: SN('Ir até a casa', 'Não ir'),
    resolver(e, esc) {
      if (esc === 'sim') {
        anotar(e, 'Na casa há roupas de trabalho, patins e suprimentos. No fundo da pia, papéis de um projeto de viagem espacial.')
        darItem(e, 'sopa', 2)
        marca(e, 'conquista.casa_da_moca')
        return anotar(e, 'Conquista: A casa da moça.')
      }
      marca(e, 'libera.nao_sozinho')
      return anotar(e, 'Acham que é armadilha ou brincadeira. Ficam por ali.')
    },
  },
  {
    id: 'sinal_estranho', grupo: 'radio',
    quando: (e) => tem(e, 'radio'),
    peso: () => 1,
    texto: () => 'Sons escondidos atrás da estática. Querem sintonizar?',
    escolhas: SN('Sintonizar', 'Desligar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        return anotar(e, 'O sinal melhora: uma voz de mulher diz que está presa lá em cima e que a tripulação enlouqueceu.')
      }
      return anotar(e, 'Desligam o rádio. O chiado some.')
    },
  },
  {
    id: 'nao_sozinho', grupo: 'cadeia',
    quando: (e) => lido(e, 'libera.nao_sozinho') === true && tem(e, 'gaita'),
    peso: () => 1,
    unico: true,
    texto: () => 'A voz parou, mas o rádio continua com bipes e um som parecido com gaita. Respondemos?',
    escolhas: SN('Responder com a gaita', 'Deixar quieto'),
    resolver(e, esc) {
      if (esc === 'sim') {
        sanidadeUp(e, ids(e))
        marca(e, 'conquista.nao_estamos_sozinhos')
        return anotar(e, 'Tocam a gaita do lado de fora. Luzes respondem no céu. Conquista: Não estamos sozinhos.')
      }
      return anotar(e, 'Ficam com medo do que possa vir.')
    },
  },
  {
    id: 'diario', grupo: 'abrigo',
    quando: (e) => esta(e, 'filha') && tem(e, 'manual'),
    peso: () => 1,
    unico: true,
    texto: () => 'A filha esconde um diário dentro do manual de escoteiro. Lemos em voz alta?',
    escolhas: SN('Ler em voz alta', 'Respeitar a privacidade'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        anotar(e, 'A leitura dá errado e o diário some.')
        sanidadeDown(e, ['filha'])
        const q = sorte(rng, ids(e)) // "membro sorteado": a fonte não diz quem
        if (q) ferir(e, q, `${nome(e, q)} se fere na confusão.`)
        return undefined
      }
      anotar(e, 'A filha agradece, rasga e queima as páginas.')
      return sanidadeUp(e, ['filha'])
    },
  },
  {
    id: 'carta_codigo', grupo: 'cadeia',
    // a fonte diz "alguma expedição em andamento" (a confirmar); mantemos a condição literal
    quando: (e) => lido(e, 'libera.carta_codigo') === true && alguemFora(e) && esta(e, 'mae'),
    peso: () => 1,
    unico: true,
    texto: () => 'A mãe decifrou a mensagem: há um local secreto perto do abrigo, e ela deve ir sozinha.',
    escolhas: SN('Ela vai', 'Ela não vai'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const p = mandarFora(e, 'mae', 'carta', 2)
        const levados = [] // chances não indicadas: 50% cada
        if (rng.chance(0.5)) levados.push('agua', 'agua')
        if (rng.chance(0.5)) levados.push('sopa', 'sopa')
        if (p) p.fora.itens = levados
        sanidadeUp(e, ['mae'])
        marca(e, 'conquista.enigma')
        return anotar(e, 'A mãe sai e volta em dois dias, trazendo o que achou (ou nada). Conquista: Enigma.')
      }
      sanidadeDown(e, ['mae'])
      return anotar(e, 'A mãe deixa o local de lado, mas fica remoendo a ideia.')
    },
  },
  {
    id: 'disputa_familia', grupo: 'cadeia',
    quando: (e) => esta(e, 'mae') && lido(e, 'libera.disputa_familia') === true,
    peso: () => 1,
    unico: true,
    texto: () => 'A mãe ainda está brava com a porta aberta. A família tenta conversar?',
    escolhas: SN('Conversar', 'Deixar pra lá'),
    resolver(e, esc) {
      if (esc === 'sim') {
        vivos(e).forEach((p) => cansar(e, p.id, 2))
        return anotar(e, grupo(e, 'A conversa acalma os ânimos, mas todos ficam cansados.', 'A conversa acalma os ânimos, mas o cansaço chega.'))
      }
      sanidadeDown(e, ids(e))
      return anotar(e, 'A tensão cresce no abrigo.')
    },
  },
  {
    id: 'atividade_extra', grupo: 'expedicao',
    quando: (e) => esta(e, 'filha') && lido(e, 'libera.atividade_extra') === true && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'A filha descobriu o endereço do antigo professor de música, um veterano que mora perto. Ela quer visitar.',
    escolhas: SN('Deixar ir', 'Não'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const p = mandarFora(e, 'filha', 'visita', 1)
        sanidadeUp(e, ['filha'])
        cansar(e, 'filha', 2)
        return sorteia(
          rng,
          () => {
            if (p) p.fora.itens = ['gaita']
            anotar(e, 'A filha volta cansada e animada, com uma gaita de presente do professor.')
          },
          () => {
            if (p) p.fora.itens = ['sopa', 'agua']
            anotar(e, 'A filha volta cansada e animada, com comida e água do professor.')
          },
        )
      }
      return anotar(e, 'A filha fica em casa, sem reclamar muito.')
    },
  },
  {
    id: 'conversa_mae', grupo: 'abrigo',
    quando: (e) => esta(e, 'mae'),
    peso: () => 1,
    texto: () => 'A mãe anda calada. Conversamos com ela?',
    escolhas: SN('Conversar', 'Deixar em paz'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const opcoes = [() => {
          anotar(e, 'A conversa ajuda: ela sorri pela primeira vez no dia.')
          sanidadeUp(e, ['mae'])
        }]
        if (alguemLouco(e)) opcoes.push(() => louqueceu(e, 'mae', 'A conversa vira um surto: a mãe enlouquece.'))
        return sorteia(rng, ...opcoes)
      }
      return sorteia(
        rng,
        () => {
          anotar(e, 'A mãe se acalma sozinha.')
          sanidadeUp(e, ['mae'])
        },
        () => {
          anotar(e, 'Ninguém conversa e a mãe piora.')
          sanidadeDown(e, ['mae'])
        },
        () => louqueceu(e, 'mae', 'A mãe piora e entra em surto.'),
      )
    },
  },
  {
    id: 'conversa_filha', grupo: 'abrigo',
    quando: (e) => esta(e, 'filha'),
    peso: () => 1,
    texto: () => 'A filha ficou em silêncio o dia todo. Vamos conversar?',
    escolhas: SN('Conversar', 'Deixar quieta'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const opcoes = [() => {
          anotar(e, 'A filha se abre um pouco.')
          sanidadeUp(e, ['filha'])
        }]
        if (alguemLouco(e)) opcoes.push(() => louqueceu(e, 'filha', 'A conversa piora tudo: a filha enlouquece.'))
        return sorteia(rng, ...opcoes)
      }
      return sorteia(
        rng,
        () => {
          anotar(e, 'A filha volta a falar.')
          sanidadeUp(e, ['filha'])
        },
        () => {
          anotar(e, 'Ela se fecha ainda mais.')
          sanidadeDown(e, ['filha'])
        },
        () => louqueceu(e, 'filha', 'A filha fica louca.'),
      )
    },
  },
  {
    id: 'conversa_filha_mutante', grupo: 'abrigo',
    // a fonte não diz qual evento transforma a filha; aqui vale o campo mutante do estado
    quando: (e) => esta(e, 'filha') && pessoa(e, 'filha')?.mutante === true,
    peso: () => 1,
    texto: () => 'A filha mudou. Fica parada, sorrindo sem motivo. Tentamos nos aproximar?',
    escolhas: SN('Chegar perto', 'Manter distância'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => anotar(e, 'Tudo parece normal por um instante. (efeito ainda não definido na fonte)'),
          () => {
            anotar(e, 'Ela reage com violência.')
            ferir(e, sorte(rng, ids(e)) ?? 'filha', 'Alguém se fere na reação dela.')
          },
          () => sair(e, 'filha', 'sumiu', 'De manhã a filha sumiu, deixando um bilhete ilegível.'),
        )
      }
      return sorteia(
        rng,
        () => {
          anotar(e, grupo(e, 'O silêncio e a presença dela deixam todos inquietos.', 'O silêncio e a presença dela deixam o abrigo inquieto.'))
          sanidadeDown(e, presentes(e))
        },
        () => sair(e, 'filha', 'sumiu', 'De manhã a filha sumiu e a porta está destruída. Precisa de conserto.'),
      )
    },
  },
  {
    id: 'conversa_filho', grupo: 'abrigo',
    quando: (e) => esta(e, 'filho'),
    peso: () => 1,
    texto: () => 'O filho está abatido, olhando o vazio. Vamos conversar?',
    escolhas: SN('Conversar', 'Deixar pra lá'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const opcoes = [() => {
          anotar(e, 'O filho melhora um pouco.')
          sanidadeUp(e, ['filho'])
        }]
        if (alguemLouco(e)) opcoes.push(() => louqueceu(e, 'filho', 'A conversa piora: o filho fica louco.'))
        return sorteia(rng, ...opcoes)
      }
      return sorteia(
        rng,
        () => {
          anotar(e, 'O filho se abre.')
          sanidadeUp(e, ['filho'])
        },
        () => {
          anotar(e, 'Gritar para ele melhorar não ajuda.')
          sanidadeDown(e, ['filho'])
        },
        () => louqueceu(e, 'filho', 'O filho fica louco.'),
      )
    },
  },
  {
    id: 'rastro_gato', grupo: 'cadeia',
    quando: (e) => gatoNoAbrigo(e),
    peso: () => 1,
    unico: true,
    texto: () => 'A coleira do gato traz um endereço. Vamos até lá?',
    escolhas: SN('Seguir o endereço', 'Deixar o gato em paz'),
    resolver(e, esc) {
      if (esc === 'sim') {
        gatoSai(e, 3)
        return anotar(e, 'Dois homens de sobretudo e chapéu levam o gato de volta ao dono. Dias depois, ele reaparece no abrigo.')
      }
      marca(e, 'libera.fuga_gato')
      return anotar(e, 'O gato fica no abrigo e ronrona.')
    },
  },
  {
    id: 'jogo_gato_damas', grupo: 'abrigo',
    quando: (e) => gatoNoAbrigo(e) && tem(e, 'damas'),
    peso: () => 1,
    texto: () => 'O gato empurra as peças do jogo de damas para o chão a cada poucos segundos. Deixamos ele brincar?',
    escolhas: SN('Deixar brincar', 'Tirar o gato'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => anotar(e, 'O gato se entedia e se deita em cima do tabuleiro.'),
          () => tirarItem(e, 'damas', 1, 'O gato quebra o tabuleiro ao meio.'),
        )
      }
      return tirarItem(e, 'damas', 1, 'O gato fica bravo, a família foge e o tabuleiro fica para trás.')
    },
  },
  {
    id: 'comida_fresca', grupo: 'cadeia',
    quando: (e) => lido(e, 'libera.comida_fresca') === true,
    // a fonte diz "às vezes" sem chance: peso 0.5 (50%, nosso número)
    peso: () => 0.5,
    unico: true,
    texto: () => 'A planta cresce rápido e brilha no escuro. Colhemos o fruto agora?',
    escolhas: SN('Colher agora', 'Esperar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        return darItem(e, 'sopa', 4, 'Colheita: quatro latas de sopa feitas com o fruto.')
      }
      return anotar(e, 'De noite, a planta vira cinza.')
    },
  },
  {
    id: 'fio_gato', grupo: 'cadeia',
    quando: (e) => gatoNoAbrigo(e),
    peso: () => 1,
    unico: true,
    texto: () => 'O gato puxa um fio da parede e arranca um pedaço de reboco. O fio parece importante. Investigamos?',
    escolhas: SN('Seguir o fio', 'Deixar o fio'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'libera.vigilancia')
        return anotar(e, 'O fio leva a um caminhão velho onde dois homens de fones de ouvido espionavam o abrigo.')
      }
      return anotar(e, 'Deixam o fio como está.')
    },
  },
  {
    id: 'grandes_expectativas', grupo: 'abrigo',
    quando: (e) => esta(e, 'mae', 'filha'),
    peso: () => 1,
    texto: () => 'A mãe descobre que a filha não sabe soletrar uma palavra enorme e resolve dar aula.',
    escolhas: SN('Deixar a aula', 'Sem aula'),
    resolver(e, esc) {
      if (esc === 'sim') {
        // "conserta 1 item quebrado": estado.mjs não tem função de consertar; só o diário registra
        anotar(e, 'A aula vira faxina e um conserto no abrigo. Mãe e filha se sentem melhor.')
        sanidadeUp(e, ['mae', 'filha'])
        return cansar(e, 'filha', 2)
      }
      sanidadeDown(e, ['mae', 'filha'])
      return anotar(e, 'Sem aula, a palavra enorme fica sem ser soletrada e ninguém se fala.')
    },
  },
  {
    id: 'show_harmonica', grupo: 'abrigo',
    quando: (e) => tem(e, 'gaita'),
    peso: () => 1,
    texto: () => 'Alguém toca a gaita e, de repente, baratas saem das frestas e dançam no ritmo.',
    escolhas: SN('Deixar tocar', 'Guardar a gaita'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'baratas')
        return anotar(e, 'As baratas mutantes entram no abrigo.')
      }
      return anotar(e, 'Ficam dias em silêncio.')
    },
  },
  {
    id: 'batida_sobrevivencia', grupo: 'porta',
    // cadeia de batidas (início): quem ficou na casa bate na escotilha entre os dias 2 e 6; cada um entra uma vez
    quando: (e) => e.dia >= 2 && e.dia <= 6 && perdidos(e).length > 0,
    peso: () => 1,
    texto: () => 'Alguém bate na escotilha. Quem poderia ser a esta hora? Abrimos?',
    escolhas: SN('Abrir', 'Não abrir'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'nao') return anotar(e, 'Sem resposta, quem bateu vai embora.')
      const opcoes = perdidos(e).map((p) => () => entrar(e, rng, p.id))
      opcoes.push(
        () => anotar(e, 'Não tem ninguém. Era pegadinha.'),
        () => {
          anotar(e, 'Um tiro atravessa a escotilha.')
          const a = sorte(rng, adultosVivos(e).map((p) => p.id))
          if (a) ferir(e, a, `${nome(e, a)} se fere.`)
        },
        () => {
          anotar(e, 'Alguém começa a tossir.')
          const q = sorte(rng, ids(e))
          if (q) adoecer(e, q, `${nome(e, q)} fica doente.`)
        },
        () => darItem(e, 'agua', 2, 'Viajantes de máscara de gás deixam duas garrafas de água.'),
        () => darItem(e, 'sopa', 2, 'Um homem de terno entrega duas latas de sopa.'),
      )
      // os resultados "alguém tosse" e "tiro" podem acontecer junto com outro: simplificado (um resultado por vez)
      return sorteia(rng, ...opcoes)
    },
  },
  {
    id: 'batida_final', grupo: 'porta', // grupo "final" da fonte; o contrato não tem esse valor
    // repete a cada 10 dias, depois que um final de resgate (ou estrelas) começou
    quando: (e) =>
      (e.flags['simnao.batida_final.ultima'] === undefined || e.dia - e.flags['simnao.batida_final.ultima'] >= 10) &&
      RESGATES.some((c) => cadeiaStatus(e, c) === 'andamento') &&
      !e.final,
    peso: () => 1,
    texto: () => 'Batidas insistentes na escotilha. É o resgate ou a última porta a abrir?',
    escolhas: SN('Abrir', 'Ficar em silêncio'),
    resolver(e, esc, rng = e.rng.eventos) {
      marca(e, 'batida_final.ultima', e.dia)
      if (esc === 'nao') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Ignoram a batida. Ninguém dorme direito.')
            sanidadeDown(e, presentes(e))
          },
          () => anotar(e, 'Ficam em silêncio. A batida para e não volta.'),
        )
      }
      // desfechos liberados (sorteio uniforme; chances não indicadas)
      const opcoes = []
      // cachorro: não existe no estado; a opção fica fora até existir
      if (e.flags['simnao.cachorro.no_abrigo'] === true) {
        opcoes.push(() => anotar(e, 'O cachorro late, avança e segura o bando até a família fugir. Ele não volta.'))
      }
      opcoes.push(
        () => saque(e, rng),
        () => terminar(e, 'fim', 'derrota', 'ninguém sobrevive ao bando', 'O bando entra. Ninguém sobrevive.'),
      )
      if (cadeiaStatus(e, 'militar') === 'andamento') {
        opcoes.push(() => terminar(e, 'militar', 'vitoria', 'resgate militar', 'Os militares chegam e levam a família. Resgate!'))
      }
      if (cadeiaStatus(e, 'gemeos') === 'andamento') {
        opcoes.push(() => terminar(e, 'gemeos', 'vitoria', 'resgate pelos gêmeos', 'Os gêmeos levam a família a um novo acampamento.'))
      }
      if (cadeiaStatus(e, 'bunker_vip') === 'andamento') {
        opcoes.push(() => terminar(e, 'bunker_vip', 'vitoria', 'bunker VIP', 'Um comboio leva a família a um bunker de luxo.'))
      }
      if (cadeiaStatus(e, 'estrelas') === 'andamento') {
        // tipo de "estrelas" ainda a confirmar em finais.mjs
        opcoes.push(() => terminar(e, 'estrelas', 'ambiguo', 'estrelas', 'A nave do cientista decola com a família. Para onde, ninguém sabe.'))
      }
      return sorteia(rng, ...opcoes)
    },
  },
  {
    id: 'linguagem', grupo: 'radio',
    quando: (e) => tem(e, 'radio'),
    peso: () => 1,
    texto: () => 'Por trás da estática, uma voz numa língua que ninguém entende. Pode ser alguém hostil?',
    escolhas: SN('Ouvir até o fim', 'Desligar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        sanidadeUp(e, ids(e))
        return anotar(e, 'Alívio geral: são estrangeiros, mas não parecem inimigos.')
      }
      return anotar(e, 'Desligam o rádio.')
    },
  },
  {
    id: 'claustrofobia', grupo: 'cadeia',
    quando: (e) => esta(e, 'pai') && !lido(e, 'claustrofobia_feita'),
    peso: () => 1,
    unico: true,
    texto: () => 'O pai entra em pânico, diz que o abrigo está encolhendo e exige abrir a porta.',
    escolhas: SN('Abrir a porta', 'Manter fechada'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'claustrofobia_feita')
        anotar(e, 'A porta abre e entra ar contaminado. O pai fica doente.')
        adoecer(e, 'pai', `${nome(e, 'pai')} fica doente.`)
        if (esta(e, 'mae')) marca(e, 'libera.disputa_familia')
        return undefined
      }
      marca(e, 'claustrofobia_feita')
      sanidadeDown(e, ['pai'], SAN2)
      return anotar(e, 'A porta fica fechada. O pai afunda numa crise.')
    },
  },
  {
    id: 'aviso_final', grupo: 'radio',
    // a fonte não dá pré-requisito; faz parte do desafio "contagem final" (fora deste arquivo)
    quando: () => true,
    peso: () => 1,
    unico: true,
    texto: () => 'Um homem de sotaque forte avisa no rádio: há um lançamento de suprimentos perto, para quem for resgatado. Corremos?',
    escolhas: SN('Correr', 'Não arriscar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        anotar(e, 'Há briga pelos suprimentos. A família pega o que consegue.')
        darItem(e, 'sopa', 2)
        return darItem(e, 'agua', 2)
      }
      return anotar(e, 'Não arriscam. O estoque vai para outro grupo.')
    },
  },
  {
    id: 'escola_filha', grupo: 'expedicao',
    // a fonte diz "alguma expedição em andamento" (a confirmar); condição literal
    quando: (e) => esta(e, 'filha') && alguemFora(e),
    peso: () => 1,
    texto: () => 'A filha quer voltar à antiga escola de música, mais longe do que a do irmão. Deixamos ir?',
    escolhas: SN('Deixar ir', 'Não'),
    resolver(e, esc) {
      if (esc === 'sim') {
        mandarFora(e, 'filha', 'escola', 3)
        marca(e, 'libera.atividade_extra')
        return anotar(e, 'A filha sai para a escola de música e promete voltar em três dias.')
      }
      sanidadeDown(e, ['filha'])
      return anotar(e, 'A filha bate o pé, fica num canto e faz cara feia.')
    },
  },
  {
    id: 'passeio_cachorro', grupo: 'expedicao',
    // cachorro não existe no estado: evento inativo até existir (quando é falso)
    quando: (e) => e.flags['simnao.cachorro.no_abrigo'] === true,
    peso: () => 1,
    texto: () => 'O cachorro late sem parar e precisa correr. Mandamos para fora?',
    escolhas: SN('Deixar sair', 'Segurar'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        // a opção "munição" entrou no catálogo de itens; "desafio mulher e seu cachorro" fica numa flag
        const opcoes = [
          () => darItem(e, 'agua', 1, 'O cachorro volta com uma garrafa de água.'),
          () => darItem(e, 'sopa', 1, 'O cachorro volta com uma lata de sopa.'),
          () => darItem(e, 'mascara', 1, 'O cachorro volta com uma máscara de gás.'),
          () => darItem(e, 'kit', 1, 'O cachorro volta com um kit médico.'),
          () => darItem(e, 'municao', 1, 'O cachorro volta com um pacote de munição.'),
          () => darItem(e, 'lanterna', 1, 'O cachorro volta com uma lanterna.'),
          () => anotar(e, 'O cachorro volta sem nada, só abanando o rabo.'),
        ]
        if (e.flags['simnao.desafio.mulher_cachorro'] === true) {
          opcoes.push(() => darAleatorio(e, rng, 'O cachorro volta com um presente da mulher do desafio'))
        }
        return sorteia(rng, ...opcoes)
      }
      return anotar(e, 'O cachorro fica deitado no tapete. Sem efeito.')
    },
  },
  {
    id: 'fantasma_mapa', grupo: 'abrigo',
    quando: (e) => tem(e, 'mapa'),
    peso: () => 1,
    texto: () => 'O mapa cai sozinho da parede e revela um cofre escondido atrás. Abrimos?',
    escolhas: SN('Abrir o cofre', 'Deixar fechado'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => darItem(e, 'sopa', 1, 'Dentro do cofre, uma lata de sopa.'),
          () => darItem(e, 'agua', 1, 'Dentro do cofre, uma garrafa de água.'),
          () => darAleatorio(e, rng, 'Dentro do cofre, algo útil'),
          () => tirarItem(e, 'sopa', 1, 'Apagão: a sopa some no escuro.'),
        )
      }
      return anotar(e, 'O mapa volta para a parede sem barulho. Deixam o cofre pra lá.')
    },
  },
  {
    id: 'picnic_casal', grupo: 'abrigo',
    quando: (e) => esta(e, 'pai', 'mae'),
    peso: () => 1,
    texto: () => 'Os dois não têm nenhuma privacidade. Um piquenique num parque destruído ajudaria?',
    escolhas: SN('Fazer o piquenique', 'Não é hora'),
    resolver(e, esc) {
      if (esc === 'sim') {
        sanidadeUp(e, ['pai', 'mae'])
        return anotar(e, 'Piquenique no meio das ruínas. Os dois riem como antigamente.')
      }
      sanidadeDown(e, ['pai', 'mae'])
      return anotar(e, 'Sem privacidade, os dois ficam irritados um com o outro.')
    },
  },
  {
    id: 'fuga_gato', grupo: 'cadeia',
    quando: (e) => lido(e, 'libera.fuga_gato') === true && gatoNoAbrigo(e),
    peso: () => 1,
    unico: true,
    texto: () => 'Barulhos à noite: o gato passa por um buraco na parede e volta de manhã. Seguimos ele na próxima saída?',
    escolhas: SN('Seguir', 'Deixar ir'),
    resolver(e, esc) {
      if (esc === 'sim') {
        gatoSai(e, 2)
        marca(e, 'cientista')
        return anotar(e, 'O gato leva a família a um ferro-velho, onde um cientista maluco vive num ônibus transformado em laboratório. O gato volta depois.')
      }
      return anotar(e, 'O gato segue livre, de noite.')
    },
  },
  {
    id: 'escoteiro', grupo: 'porta',
    // "por favor responda" é de outra lista: lemos o registro de eventos vistos
    quando: (e) => esta(e, 'filho') && visto(e, 'por_favor_responda'),
    peso: () => 1,
    unico: true,
    texto: () => 'Batidas na porta: são os amigos escoteiros do filho, que captaram o sinal que ele mandou pelo rádio.',
    escolhas: SN('Abrir', 'Não abrir'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        darAleatorio(e, rng, 'Os escoteiros deixam um presente')
        sanidadeUp(e, ['filho'])
        return anotar(e, 'O filho sorri pela primeira vez em dias.')
      }
      return anotar(e, 'As batidas param. Ninguém sabe quem era.')
    },
  },
  {
    id: 'mau_humor_mae', grupo: 'abrigo',
    quando: (e) => louco(e, 'mae'),
    peso: () => 1,
    texto: () => 'A mãe está agitada e perigosa. Tentamos acalmá-la ou deixamos de lado?',
    escolhas: SN('Acalmar', 'Deixar de lado'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        // "a confirmar" na fonte nos dois últimos resultados: mantidos como estão
        return sorteia(
          rng,
          () => enlouquecer(e, 'mae', -40, 'A família a acalma. A mãe deixa de estar fora de si.'),
          () => {
            const q = sorte(rng, ids(e))
            if (!q) return anotar(e, 'Ninguém está perto o bastante para se contagiar.')
            return louqueceu(e, q, `${nome(e, q)} enlouquece com a agitação.`)
          },
          () => {
            const q = sorte(rng, ids(e))
            if (!q) return anotar(e, 'Ninguém se fere.')
            return ferir(e, q, `${nome(e, q)} se fere na confusão.`)
          },
        )
      }
      return sorteia(
        rng,
        () => enlouquecer(e, 'mae', -40, 'Com o tempo, a mãe se recupera.'),
        () => anotar(e, 'A família a deixa de lado. Por enquanto, sem efeito.'),
        ...(gatoNoAbrigo(e) ? [() => enlouquecer(e, 'mae', -40, 'O gato se deita no colo dela. Ela se acalma.')] : []),
      )
    },
  },
  {
    id: 'cheiro_buraco', grupo: 'abrigo',
    quando: () => true,
    peso: () => 1,
    texto: () => 'Um tijolo solta e revela um buraco com um cheiro horrível. Investigamos?',
    escolhas: SN('Investigar', 'Tapar de volta'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => darItem(e, 'sopa', 1, 'Um rato morto tentava roubar uma lata. A lata é nossa agora.'),
          () => {
            if (tem(e, 'radio')) return tirarItem(e, 'radio', 1, 'Uma criatura pula, derruba o rádio e some.')
            return anotar(e, 'Uma criatura pula e some. Ainda bem que não tinha rádio para derrubar.')
          },
        )
      }
      // "quem esteve doente recentemente": o estado não guarda histórico; aplica a quem está doente agora
      const doentes = vivos(e).filter((p) => p.doente)
      if (!doentes.length) return anotar(e, 'Ninguém estava doente. Só o cheiro fica.')
      return doentes.forEach((p) => adoecer(e, p.id, `${nome(e, p.id)} sente o enjoo de novo.`))
    },
  },
  {
    id: 'pega_pega', grupo: 'abrigo',
    quando: (e) => esta(e, 'filha', 'filho'),
    peso: () => 1,
    texto: () => 'As crianças estão agitadas e querem correr. Deixamos brincar no pouco espaço?',
    escolhas: SN('Deixar brincar', 'Sentar e quietinho'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        const trombada = (texto) => {
          sanidadeUp(e, ['filha', 'filho'])
          tirarAleatorio(e, rng, texto)
          const q = sorte(rng, ['filha', 'filho'])
          if (q && rng.chance(0.5)) return ferir(e, q, `${nome(e, q)} se machuca na trombada.`) // chance não informada: 50%
          return anotar(e, 'Ninguém se machuca.')
        }
        return sorteia(
          rng,
          () => {
            sanidadeUp(e, ['filha', 'filho'])
            darItem(e, 'sopa', 1, 'Uma lata de sopa aparece no canto.')
          },
          () => {
            sanidadeUp(e, ['filha', 'filho'])
            darItem(e, 'agua', 1, 'Uma garrafa de água aparece no canto.')
          },
          () => trombada('Ao trombarem, derrubam suprimentos'),
          () => trombada('Na correria, uma pilha de caixas cai'),
        )
      }
      sanidadeDown(e, ['filha', 'filho'])
      return anotar(e, 'Sem brincadeira, as crianças ficam irritadas e choram.')
    },
  },
  {
    id: 'carro_pai', grupo: 'cadeia',
    // a fonte diz "alguma expedição em andamento" (a confirmar); condição literal
    quando: (e) => esta(e, 'pai') && alguemFora(e) && lido(e, 'carro_feito') !== true,
    peso: () => 1,
    unico: true,
    texto: () => 'O pai achou chaves no bolso e quer procurar o carro que tinha antes da explosão. Deixamos?',
    escolhas: SN('Deixar procurar', 'Não'),
    resolver(e, esc) {
      marca(e, 'carro_feito')
      if (esc === 'sim') {
        mandarFora(e, 'pai', 'carro', 2) // a fonte não dá prazo: 2 dias, nosso número
        marca(e, 'libera.churrasco')
        return anotar(e, 'O pai sai atrás do carro e não diz quanto tempo vai demorar.')
      }
      sanidadeDown(e, ['pai'])
      return anotar(e, 'O pai fica remoendo a ideia do carro o dia todo.')
    },
  },
  {
    id: 'codigo', grupo: 'cadeia',
    quando: (e) => esta(e, 'mae'),
    peso: () => 1,
    unico: true,
    texto: () => 'Um bilhete cifrado aparece na porta. A mãe quer tentar decifrar?',
    escolhas: SN('Decifrar', 'Esquecer'),
    resolver(e, esc) {
      if (esc === 'sim') {
        cansar(e, 'mae', 2)
        marca(e, 'libera.carta_codigo')
        return anotar(e, 'A mãe passa a noite decifrando o bilhete. Está exausta, mas quase lá.')
      }
      cansar(e, 'mae', 2)
      sanidadeDown(e, ['mae'])
      return anotar(e, 'A mãe tenta na folga, mas o bilhete some de noite.')
    },
  },
  {
    id: 'lado_sombrio_idosos', grupo: 'cadeia',
    // única por cadeia: sai só se nenhuma das três apareceu antes
    quando: (e) => !['lado_sombrio_idosos', 'lado_sombrio_vizinha', 'lado_sombrio_professora'].some((x) => visto(e, x)),
    peso: () => 1,
    unico: true,
    texto: () => 'Os suprimentos acabam. Sabem de um grupo de idosos num asilo em ruínas. Pegamos o que têm?',
    escolhas: SN('Pegar tudo', 'Não'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return ladoSombrioSim(e, rng, [
          'Levam quatro latas de sopa e quatro garrafas de água. Ninguém quer lembrar disso.',
          'Pegam o que sobrou da bagunça.',
          'Atiram para o alto e os velhos fogem sem nada.',
          'Os velhos xingam e saem sem nada. A família se sente mal.',
        ])
      }
      sanidadeUp(e, ids(e))
      return anotar(e, 'Deixam os velhos em paz. Dormem melhor.')
    },
  },
  {
    id: 'lado_sombrio_vizinha', grupo: 'cadeia',
    quando: (e) => !['lado_sombrio_idosos', 'lado_sombrio_vizinha', 'lado_sombrio_professora'].some((x) => visto(e, x)),
    peso: () => 1,
    unico: true,
    texto: () => 'O abrigo da vizinha tem uma escotilha quebrada e pode ter suprimentos. Ela e os filhos talvez tenham entrado, mas a família precisa de comida.',
    escolhas: SN('Entrar', 'Não'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return ladoSombrioSim(e, rng, [
          'Pegam quatro latas de sopa e quatro garrafas de água da casa da vizinha.',
          'Acham um item útil no meio dos cacos.',
          'Armadilha de placas e estilingues. A família foge.',
          'Os armados na escotilha dão um tiro de aviso e a família foge.',
        ])
      }
      sanidadeUp(e, ids(e))
      return anotar(e, 'Ficam do lado de fora. Dormem melhor.')
    },
  },
  {
    id: 'lado_sombrio_professora', grupo: 'cadeia',
    quando: (e) => !['lado_sombrio_idosos', 'lado_sombrio_vizinha', 'lado_sombrio_professora'].some((x) => visto(e, x)),
    peso: () => 1,
    unico: true,
    texto: () => 'Uma professora salvou crianças e as levou para um prédio. Os suprimentos da escola são de todos. Por que não pegar?',
    escolhas: SN('Pegar', 'Não'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return ladoSombrioSim(e, rng, [
          'Os suprimentos da escola ficam com a família: quatro latas de sopa e quatro garrafas de água.',
          'Um item qualquer da sala de aula vai para a mochila.',
          'Um alarme dispara; os adultos atacam com o que têm e a família foge. As crianças ficaram lá dentro.',
          'Os professores batem na família com livros e ela foge.',
        ])
      }
      sanidadeUp(e, ids(e))
      return anotar(e, 'Deixam as crianças e a escola em paz.')
    },
  },
  {
    id: 'telescopio', grupo: 'expedicao',
    quando: (e) => esta(e, 'filho') && jaSaiu(e, 'filho') && !alguemFora(e),
    peso: () => 1,
    texto: () => 'O filho achou um telescópio velho nos escombros e quer olhar as estrelas à noite. Deixamos?',
    escolhas: SN('Deixar sair à noite', 'Não'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        mandarFora(e, 'filho', 'telescopio', 1) // expedição de 1 dia (a fonte não diz)
        anotar(e, 'O filho sai à noite e volta de manhã, cansado.')
        return sorteia(
          rng,
          () => {
            sanidadeUp(e, ['filho'])
            anotar(e, 'Ele jura que viu uma nave.')
          },
          () => anotar(e, 'Ele jura que viu um homem de bigode na lua. Deve ser mancha na lente.'),
        )
      }
      sanidadeDown(e, ['filho'])
      return anotar(e, 'O filho chora, sem o telescópio.')
    },
  },
  {
    id: 'radio_conserto', grupo: 'radio',
    quando: (e) => tem(e, 'radio'),
    peso: () => 1,
    texto: () => 'O rádio está mudo há horas. Mexemos nele?',
    escolhas: SN('Mexer', 'Deixar mudo'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'sim') {
        return sorteia(
          rng,
          () => {
            anotar(e, grupo(e, 'Não resolve. Todos ficam mais tensos.', 'Não resolve. O clima fica pesado.'))
            sanidadeDown(e, ids(e))
          },
          () => quebrarItem(e, 'radio', 'O rádio quebra de vez.'),
        )
      }
      sanidadeDown(e, ids(e))
      return anotar(e, 'A família fica tentando achar uma desculpa técnica.')
    },
  },
  {
    id: 'mala_misteriosa', grupo: 'porta',
    quando: () => true,
    peso: () => 1,
    texto: () => 'De manhã, uma mala sem nome está na porta. Abrimos?',
    escolhas: SN('Abrir', 'Deixar lá'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'nao') return anotar(e, 'Sem efeito. No dia seguinte, a mala some.')
      const alguemAdoece = () => adoecer(e, sorte(rng, ids(e)) ?? 'pai', 'Alguém adoece.')
      return sorteia(
        rng,
        () => darItem(e, 'sopa', 1, 'Uma lata de sopa lá dentro.'),
        () => darItem(e, 'agua', 1, 'Uma garrafa de água lá dentro.'),
        () => darItem(e, 'mala', 1, 'Uma mala extra.'),
        () => darAleatorio(e, rng, 'Dinheiro e joias. A família joga fora o que não serve e fica com'),
        () => {
          anotar(e, 'Sopa vencida.')
          alguemAdoece()
        },
        () => {
          anotar(e, 'Água contaminada.')
          alguemAdoece()
        },
        () => {
          anotar(e, 'A mala é uma armadilha e explode.')
          const q = sorte(rng, ids(e))
          if (q) ferir(e, q, `${nome(e, q)} se fere na explosão.`)
        },
      )
    },
  },
  {
    id: 'gato_entra', grupo: 'porta',
    // "alguma expedição feita após o dia 20": qualquer saída registrada com dia > 20
    quando: (e) => e.dia > 20 && expedicoes(e).some(([, dia]) => typeof dia === 'number' && dia > 20),
    peso: () => 1,
    unico: true,
    texto: () => 'A família volta de expedição e ouve arranhões na escotilha. Um gato sobreviveu perto de um acampamento destruído. Abrimos?',
    escolhas: SN('Deixar entrar', 'Ignorar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'gato.no_abrigo', true)
        return anotar(e, 'O gato entra e se torna mais um membro do abrigo.')
      }
      return anotar(e, 'Os arranhões param e o gato some.')
    },
  },
  {
    id: 'pedra_vendedor', grupo: 'porta',
    quando: () => true,
    peso: () => 1,
    unico: true,
    texto: () => 'Um homem velho e sem casa bate na escotilha e pergunta se queremos comprar uma pedra.',
    escolhas: SN('Comprar a pedra', 'Dizer não'),
    resolver(e, esc) {
      if (esc === 'sim') {
        marca(e, 'pedra')
        // o retorno do vendedor (água para todos) não é evento do catálogo: fica como gancho para o motor
        marca(e, 'vendedor.volta', e.dia + 3)
        return anotar(e, 'Ganham uma pedra de graça. Ele diz que dá sorte e que volta uma hora, sem dizer quando.')
      }
      return anotar(e, 'O homem vai embora sem reclamar.')
    },
  },
  {
    id: 'churrasco', grupo: 'cadeia',
    quando: (e) => lido(e, 'libera.churrasco') === true,
    peso: () => 1,
    unico: true,
    texto: () => 'O pai não achou o carro, mas encontrou uma festa de churrasco num gramado queimado da vizinhança. Espiamos?',
    escolhas: SN('Espiar', 'Não espiar'),
    resolver(e, esc) {
      if (esc === 'sim') {
        voltar(e, 'pai', 'O pai volta desmaiado, com cheiro de bebida de tomate.')
        darItem(e, 'sopa', 2, 'Ele trouxe duas latas de sopa.')
        return sanidadeUp(e, ['pai'])
      }
      voltar(e, 'pai', 'O pai volta de qualquer jeito, com um espeto de rato, e passa mal.')
      adoecer(e, 'pai', `${nome(e, 'pai')} fica doente.`)
      darItem(e, 'sopa', 1, 'Ele também trouxe uma lata de sopa.')
      return sanidadeUp(e, ['pai'])
    },
  },
  {
    id: 'jovens_armados', grupo: 'porta',
    quando: () => true,
    peso: () => 1,
    texto: () => 'Gritos do lado de fora: "em nome da liberdade". Jovens armados perguntam por inimigos na área. Abrimos?',
    escolhas: SN('Abrir', 'Ficar quietos'),
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'nao') return anotar(e, 'Sem resposta, o grupo vai embora.')
      return sorteia(
        rng,
        () => darItem(e, 'agua', 2, 'Não são de nenhum lado e dão duas garrafas de água.'),
        () => darItem(e, 'rifle', 1, 'Deixam um rifle.'),
        () => darItem(e, 'machado', 1, 'Deixam um machado.'),
      )
    },
  },
  {
    id: 'plantacao', grupo: 'cadeia',
    quando: (e) => esta(e, 'filha'),
    peso: () => 1,
    unico: true,
    texto: () => 'A filha acha uma semente escondida. Plantamos com um pouco de água?',
    escolhas: (e) => [
      {id: 'sim', texto: 'Plantar (gasta uma água)', requer: (x) => tem(x, 'agua')},
      {id: 'nao', texto: 'Jogar fora'},
    ],
    resolver(e, esc) {
      if (esc === 'sim') {
        tirarItem(e, 'agua', 1, 'Uma garrafa de água vai para a terra.')
        marca(e, 'libera.comida_fresca')
        marca(e, 'vaso_planta') // vaso não é item do catálogo: só uma flag
        return anotar(e, 'A semente vira uma planta num vaso, no abrigo.')
      }
      sanidadeDown(e, ['filha'])
      return anotar(e, 'A filha se revolta: a semente era dela.')
    },
  },
]

