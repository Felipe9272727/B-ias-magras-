// Eventos de ESCOLHER ALGUÉM (8) e MANDAR ALGUÉM (13) do 60 Segundos das IAs: 21 eventos de
// docs/eventos_simnao_pessoas.md (seções 2 e 3).
// Escolher (8): fazenda_formigas, briga_irmaos, maestro, debate_filmes, veiculo_rua, furto_lata, balde, aniversario.
// Mandar (13): nova_esperanca, ligacao, encontro_militar, cafe_expedicao, perigo_selvagem, mapa_pichado,
//   cofre_vizinho, cobaia, reconhecimento, reencontro_gemeos, laco_familiar, tanque_antigo, ilha_tesouro.
//
// Convenções deste arquivo (ver também docs/CONTRATO.md e eventos/simnao.mjs):
// - Escolha = uma por pessoa presente no abrigo (id = id da pessoa) + 'ninguem'. Se a fonte não listou um efeito
//   para aquela pessoa, o evento só registra "não se mete" (sem efeito).
// - Mandar: a pessoa sai numa tarefa fora (p.fora = {local, saiu, volta, itens}, p.noAbrigo = false). Os itens
//   conquistados lá fora vão em p.fora.itens e o motor do abrigo os põe no abrigo na volta.
// - Flags com prefixo 'pessoas.': gemeos.passo (1 = ligação, 2 = nova esperança, 3 = resgate do irmão),
//   militar.liberado, desenho.*, cobaia.<id>, final.<cadeia> = 'andamento' | 'fechado'.
// - Flags lidas de outros arquivos: 'simnao.cientista', 'simnao.gato.*', 'simnao.final.*'. Eventos de outras listas
//   ("por favor responda", "provisões") são lidos por eventosVistos com o id em snake_case: "provisoes" e
//   "por_favor_responda" são nossos palpites de id.
// - Sanidade ↑/↓ = loucura -/+ SAN (15); ↓↓ = SAN2 (30). Números nossos (a fonte não dá).
// - Sorteio sem chance: uniforme (rng.escolher). Binário sem chance: 50% (rng.chance).
// - Efeitos sem função em estado.mjs (fome/sede/cansaço zerados, munição já existe em itens) ficam como texto.
import {ITENS} from '../itens.mjs'
import {
  adoecer, anotar, cansar, darItem, enlouquecer, ferir, matar, nome, noAbrigo, pessoa, sair, tem, tirarItem, vivos,
} from '../estado.mjs'

const SAN = 15
const SAN2 = 30
const LOUCO = 100

// ---------------------------------------------------------------- consultas
const ids = (e) => vivos(e).map((p) => p.id)
const presentes = (e) => noAbrigo(e).map((p) => p.id)
const esta = (e, ...lista) => lista.every((id) => presentes(e).includes(id))
const alguemFora = (e) => e.pessoas.some((p) => p.vivo && p.fora)
const expedicoes = (e) => Object.keys(e.flags).filter((k) => k.startsWith('expedicao.saiu.'))
const jaSaiu = (e) => expedicoes(e).length > 0
const visto = (e, id) => (e.eventosVistos?.[id] ?? 0) > 0
const vezes = (e, id) => e.eventosVistos?.[id] ?? 0
const baixo = (e, item) => (e.itens[item] ?? 0) <= 2 // "nível baixo": limite nosso, a fonte não dá
const cadeiaStatus = (e, c) => {
  const s = ['simnao', 'pessoas'].map((m) => e.flags[`${m}.final.${c}`])
  return s.includes('fechado') ? 'fechado' : s.includes('andamento') ? 'andamento' : null
}

// ---------------------------------------------------------------- escrita de flags e efeitos
const pflag = (e, k, v = true) => {
  e.flags[`pessoas.${k}`] = v
}
const sanidadeUp = (e, lista, pts = SAN) => lista.forEach((id) => enlouquecer(e, id, -pts))
const sanidadeDown = (e, lista, pts = SAN) => lista.forEach((id) => enlouquecer(e, id, pts))
const sorteia = (rng, ...opcoes) => rng.escolher(opcoes)()
const sorte = (rng, lista) => (lista.length ? rng.escolher(lista) : null)
const neutro = (e, id) => anotar(e, `${nome(e, id)} fica de fora e não se mete. Sem efeito.`)

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

// ---------------------------------------------------------------- mandar para fora
// Manda a pessoa numa tarefa fora de `dias` dias. O motor do abrigo traz de volta no dia `volta`.
function mandarFora(e, id, tarefa, dias = 1) {
  const p = pessoa(e, id)
  if (!p?.vivo || !p.noAbrigo) return null
  p.fora = {local: `tarefa:${tarefa}`, saiu: e.dia, volta: e.dia + dias, itens: []}
  p.noAbrigo = false
  cansar(e, id, 2)
  e.flags[`expedicao.saiu.${id}`] = e.dia
  return p
}

// item achado lá fora: vai na mochila da pessoa (p.fora.itens) e entra no abrigo na volta
const levar = (p, item) => {
  if (p) p.fora.itens.push(item)
}
const levarAleatorio = (p, rng) => {
  if (p) p.fora.itens.push(rng.escolher(Object.keys(ITENS)))
}

// ---------------------------------------------------------------- escolhas
const escolherPessoa = (e) => [
  ...presentes(e).map((id) => ({id, texto: nome(e, id)})),
  {id: 'ninguem', texto: 'Ninguém'},
]
const mandarPessoa = (e) => [
  ...presentes(e).map((id) => ({id, texto: `Mandar ${nome(e, id)}`})),
  {id: 'ninguem', texto: 'Ninguém sai'},
]

// ---------------------------------------------------------------- eventos
export const EVENTOS = [
  // ================================================================ ESCOLHER ALGUÉM
  {
    id: 'fazenda_formigas', grupo: 'abrigo',
    quando: (e) => presentes(e).length > 0,
    peso: () => 1,
    texto: (e) => `Do bolso do ${nome(e, 'filho')} saem formigas mutantes. A mãe quer esmagar todas; ele quer uma fazenda. Quem decide?`,
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'filho') {
        if ((e.itens.sopa ?? 0) >= 1) return tirarItem(e, 'sopa', 1, 'As formigas devoram uma lata de sopa e fogem.')
        anotar(e, 'O filho faz um "circo de formigas" e todo mundo ri.')
        return sanidadeUp(e, ids(e))
      }
      if (esc === 'mae') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Ela esmaga todas. O filho chora.')
            sanidadeDown(e, ['filho'])
            sanidadeUp(e, ['mae'])
          },
          () => {
            anotar(e, 'As formigas fogem e uma morde o filho.')
            sanidadeDown(e, ['filho'])
            adoecer(e, 'filho', `${nome(e, 'filho')} fica doente.`)
          },
        )
      }
      if (esc === 'ninguem') {
        anotar(e, 'Uma formiga morde o filho.')
        sanidadeDown(e, ['filho'])
        return adoecer(e, 'filho', `${nome(e, 'filho')} fica doente.`)
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'briga_irmaos', grupo: 'abrigo',
    quando: (e) => esta(e, 'filha', 'filho'),
    peso: () => 1,
    texto: () => 'A filha puxa o cabelo do filho, que chuta a canela dela. Cada um acha que o outro começou. Quem resolve?',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'filho') {
        return sorteia(
          rng,
          () => darItem(e, 'gaita', 1, 'O filho admite que pegou a gaita da irmã e devolve.'),
          () => darItem(e, 'machado', 1, 'A filha pegou um machado para perseguir o irmão. O machado é confiscado.'),
          () => darItem(e, 'sopa', 1, 'Brigavam por uma lata extra. A lata é confiscada.'),
          () => anotar(e, 'Fazem as pazes sozinhos.'),
        )
      }
      if (esc === 'filha') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Os dois gritam, e os gritos deixam todos mais tranquilos.')
            sanidadeUp(e, ids(e))
          },
          () => {
            anotar(e, 'O filho é repreendido, a filha ri.')
            sanidadeDown(e, ['filho'])
            sanidadeUp(e, ['filha'])
          },
          () => darItem(e, 'sopa', 1, 'A lata extra é confiscada.'),
          () => anotar(e, 'Sem efeito.'),
        )
      }
      if (esc === 'ninguem') {
        return sorteia(
          rng,
          () => darItem(e, 'sopa', 1, 'A lata extra é confiscada.'),
          () => anotar(e, 'Fazem as pazes sozinhos.'),
        )
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'maestro', grupo: 'abrigo',
    quando: (e) => tem(e, 'gaita'),
    peso: () => 1,
    texto: () => 'Estão entediados, e a gaita está ali. Quem toca?',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'pai') {
        anotar(e, 'O pai toca e todos se acalmam.')
        return sanidadeUp(e, ids(e))
      }
      if (esc === 'mae') {
        anotar(e, 'O barulho dá dor de cabeça e enjoo.')
        return adoeceAlguns(e, rng, ids(e))
      }
      if (esc === 'filha') {
        // a fonte não lista efeito; só o diário (a fonte sugere cansaço, não marcado)
        return anotar(e, 'Ela se voluntaria, tenta a tarde toda e adormece sem tocar.')
      }
      if (esc === 'filho') {
        anotar(e, 'O filho trava e fica vermelho.')
        return sanidadeDown(e, ['filho'])
      }
      if (esc === 'ninguem') {
        anotar(e, 'Ninguém se sente pronto. O desconforto é de todos.')
        return sanidadeDown(e, ids(e))
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'debate_filmes', grupo: 'abrigo',
    quando: () => true,
    peso: () => 1,
    texto: () => 'O pai e a filha discutem qual personagem venceria numa batalha: um grupo de anões contra bandidos, uma ave contra baratas, dois monstros gigantes ou duas vilãs com armas diferentes. Quem tem razão?',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'filha') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Ela vence no volume.')
            sanidadeUp(e, ['filha'])
            sanidadeDown(e, ['pai'])
          },
          // "+1 munição" da fonte: a quantidade não é dada; aqui um pacote
          () => darItem(e, 'municao', 1, 'Ela marca pontos com botões e pedrinhas e acha um pacote de munição.'),
        )
      }
      if (esc === 'pai') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Ele ganha. A filha aposta uma lata e perde.')
            darItem(e, 'sopa', 1)
          },
          () => tirarAleatorio(e, rng, 'Ele tapa os ouvidos e a filha joga objetos'),
        )
      }
      if (esc === 'ninguem') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Cansam de discutir.')
            sanidadeDown(e, ['pai', 'filha'])
          },
          () => {
            anotar(e, 'Ficam animados com a discussão.')
            sanidadeUp(e, ['pai', 'filha'])
          },
        )
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'veiculo_rua', grupo: 'expedicao',
    // "expedições suficientes": a fonte não diz o número; usamos duas saídas (a confirmar)
    quando: (e) => expedicoes(e).length >= 2,
    peso: () => 1,
    unico: true,
    texto: () => 'Uma expedição viu um veículo estranho parado na rua. Quem vai desenhar o que viu na parede do abrigo?',
    escolhas: escolherPessoa,
    resolver(e, esc) {
      if (esc === 'pai' || esc === 'mae') {
        pflag(e, 'desenho.tanque')
        return anotar(e, `${nome(e, esc)} desenha um tanque na parede do abrigo. A fonte não diz o que o desenho faz.`)
      }
      if (esc === 'filha' || esc === 'filho') {
        pflag(e, 'desenho.caminhao')
        return anotar(e, `${nome(e, esc)} desenha um caminhão de sorvete na parede.`)
      }
      return anotar(e, 'Pode ser armadilha, então ninguém se arrisca.')
    },
  },
  {
    id: 'furto_lata', grupo: 'abrigo',
    quando: () => true,
    peso: () => 1,
    texto: () => 'Na contagem diária, uma lata de sopa sumiu. Quem pegou?',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'pai') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Admite que escondeu e devolve a lata.')
            sanidadeDown(e, ['pai'])
          },
          () => {
            anotar(e, 'Nega, e a lata cai do esconderijo: era ele.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
            sanidadeDown(e, ['pai'])
          },
          () => {
            anotar(e, 'Foi erro na contagem. O pai fica magoado.')
            sanidadeDown(e, ['pai'])
          },
        )
      }
      if (esc === 'mae') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Aponta a bagunça e pede desculpas depois.')
            sanidadeDown(e, ['mae'])
          },
          () => {
            anotar(e, 'A lata foi achada atrás do armário: a culpada é ela.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
            sanidadeDown(e, ['mae'])
          },
          () => {
            anotar(e, 'Foi erro na contagem.')
            sanidadeDown(e, ['mae'])
          },
        )
      }
      if (esc === 'filha') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'A família acusa e a filha se revolta.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
            sanidadeDown(e, ['filha'])
          },
          () => tirarItem(e, 'sopa', 1, 'Ela joga uma lata cheia contra a parede e derrama.'),
          () => {
            anotar(e, 'Foi erro na contagem.')
            sanidadeDown(e, ['filha'])
          },
        )
      }
      if (esc === 'filho') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Ele é proibido de tocar nas latas.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
            sanidadeDown(e, ['filho'])
          },
          () => {
            anotar(e, 'Admite que derramou uma sem querer.')
            tirarItem(e, 'sopa', 1, 'Uma lata de sopa some.')
            sanidadeDown(e, ['filho'])
          },
          () => {
            anotar(e, 'Foi erro na contagem.')
            sanidadeDown(e, ['filho'])
          },
        )
      }
      if (esc === 'ninguem') {
        anotar(e, 'Não vale a briga. A família deixa pra lá.')
        return sanidadeUp(e, ids(e))
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'balde', grupo: 'abrigo',
    quando: (e) => esta(e, 'pai', 'mae'),
    peso: () => 1,
    texto: () => 'Os dois brigam sobre quem deve levar o balde para fora. Ninguém admite que é a vez dele.',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'pai') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'A mãe admite que era a vez dela, mas está indisposta. O pai aceita e ela ri das piadas dele.')
            sanidadeUp(e, ['pai', 'mae'])
          },
          () => {
            anotar(e, 'O pai alega dor nas costas, a mãe insiste, e ele escorrega com o balde.')
            ferir(e, 'pai', `${nome(e, 'pai')} se fere.`)
          },
        )
      }
      if (esc === 'mae') {
        return sorteia(
          rng,
          () => {
            // há alguém desacordado bloqueando a escotilha: a família o tira e acha suprimentos com ele
            anotar(e, 'Há alguém desacordado bloqueando a escotilha. Tiram ele dali e acham um suprimento.')
            darAleatorio(e, rng, 'Com ele, encontram')
            sanidadeDown(e, ['mae'])
          },
          () => {
            anotar(e, 'A mãe pega o balde, o pai tenta ajudar, e os dois escorregam e perdem coisas.')
            tirarAleatorio(e, rng, 'Perdem')
            sanidadeDown(e, ids(e))
          },
        )
      }
      if (esc === 'ninguem') {
        anotar(e, 'O balde enche e o cheiro piora.')
        sanidadeDown(e, ids(e))
        return adoeceAlguns(e, rng, ids(e))
      }
      return neutro(e, esc)
    },
  },
  {
    id: 'aniversario', grupo: 'abrigo',
    quando: (e) => esta(e, 'pai', 'mae'),
    peso: () => 1,
    unico: true,
    texto: () => 'É o aniversário de casamento do casal. Os dois prepararam presentes. Quem abre o seu primeiro?',
    escolhas: escolherPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'pai') {
        anotar(e, 'A mãe dá uma lata de sopa de presente. O pai faz um grafite de coração com as iniciais dos dois na parede do abrigo.')
        return darItem(e, 'sopa', 1)
      }
      if (esc === 'mae') {
        return sorteia(
          rng,
          () => {
            anotar(e, 'Grafite de coração com as iniciais. Ela acha vandalismo, mas fica com a lata de sopa dela.')
            darItem(e, 'sopa', 1)
          },
          () => {
            anotar(e, 'O pai dá uma máscara de gás "elegante" e a mãe dá a lata de sopa.')
            darItem(e, 'mascara', 1)
            darItem(e, 'sopa', 1)
          },
        )
      }
      if (esc === 'ninguem') {
        anotar(e, 'Ninguém abre presente nenhum. Os dois ficam tristes.')
        return sanidadeDown(e, ['pai', 'mae'])
      }
      return neutro(e, esc)
    },
  },

  // ================================================================ MANDAR ALGUÉM
  {
    id: 'nova_esperanca', grupo: 'cadeia',
    // a ligação deixou o passo 1 (alguém foi mandado no evento "ligacao")
    quando: (e) => e.flags['pessoas.gemeos.passo'] === 1 && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'Um bilhete na porta pede que a família mande um representante, desarmado, para um encontro à noite. Mandamos alguém?',
    escolhas: mandarPessoa, // "sem arma": a fonte não diz como checar; ignorado
    resolver(e, esc) {
      if (esc === 'ninguem') return anotar(e, 'Ficam esperando o exército. Sem efeito.')
      const p = mandarFora(e, esc, 'gemeos', 1)
      pflag(e, 'gemeos.passo', 2)
      return anotar(e, p
        ? `${nome(e, esc)} encontra um grupo de sobreviventes liderado por dois irmãos gêmeos. Prometem manter contato.`
        : `${nome(e, esc)} não consegue sair agora.`)
    },
  },
  {
    id: 'ligacao', grupo: 'cadeia',
    quando: (e) => !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'Um telefone de orelhão do outro lado da rua toca. Alguém atende?',
    escolhas: mandarPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') {
        sanidadeDown(e, ids(e))
        return anotar(e, 'O telefone toca por muito tempo. Ninguém aguenta ouvir.')
      }
      const p = mandarFora(e, esc, 'ligacao', 1)
      pflag(e, 'gemeos.passo', 1)
      flagFinal(e, 'gemeos', 'andamento')
      return anotar(e, p
        ? `${nome(e, esc)} atende. Um sobrevivente de outra cidade fala com alívio, mas a ligação cai no meio.`
        : `${nome(e, esc)} não consegue sair agora.`)
    },
  },
  {
    id: 'encontro_militar', grupo: 'cadeia',
    quando: (e) => e.flags['pessoas.militar.liberado'] === true && tem(e, 'radio') && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'Os militares pedem um representante de cada grupo de sobreviventes para responder perguntas antes da evacuação. Mandamos?',
    escolhas: mandarPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') return anotar(e, 'Não arriscam. Sem efeito.')
      mandarFora(e, esc, 'militar', 1)
      flagFinal(e, 'militar', 'andamento')
      return anotar(e, `${nome(e, esc)} responde às perguntas dos soldados. Eles prometem voltar.`)
    },
  },
  {
    id: 'cafe_expedicao', grupo: 'expedicao',
    quando: (e) => esta(e, 'mae') && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'A mãe quer café de verdade. O restaurante que ela gostava foi destruído, mas talvez tenha algum pó. Mandamos alguém?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'Sem café, a mãe suspira e vai para a janela.')
      mandarFora(e, esc, 'cafe', 1)
      return sorteia(
        rng,
        () => {
          // sede e cansaço zerados para todos: sem função em estado.mjs
          anotar(e, 'Volta com café frio. Todos bebem e ficam mais animados.')
          sanidadeUp(e, ids(e))
        },
        () => anotar(e, 'Volta de mãos vazias. O restaurante virou um buraco.'),
      )
    },
  },
  {
    id: 'perigo_selvagem', grupo: 'expedicao',
    quando: (e) => tem(e, 'rifle') && !alguemFora(e),
    peso: () => 1,
    texto: () => 'Ouvem uma manada passando por cima do abrigo, onde antes havia um gramado. Mandamos caçar comida?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'Sem caçada. A manada passa e some.')
      const p = mandarFora(e, esc, 'caca', 1)
      return sorteia(
        rng,
        () => {
          anotar(e, 'Acham a manada e derrubam um bicho que carregava um pacote. Caem três latas de sopa.')
          for (let i = 0; i < 3; i++) levar(p, 'sopa')
        },
        () => {
          // "alimenta todos" (fome zerada) sem função em estado.mjs; a munição gasta fica no texto
          anotar(e, 'Abatem uma criatura que tem gosto de sopa. Todos comem. Gastam munição.')
          tirarItem(e, 'municao', 1, 'Gastam munição.')
        },
        () => anotar(e, 'Erram todos os tiros.'),
        () => {
          anotar(e, 'Era um bando de predadores parecidos com dinossauros. O enviado não volta.')
          tirarItem(e, 'rifle', 1, 'Perdem o rifle.')
          matar(e, esc, 'predadores', `${nome(e, esc)} morre.`)
          if (p) p.fora = null
        },
      )
    },
  },
  {
    id: 'mapa_pichado', grupo: 'expedicao',
    quando: (e) => jaSaiu(e) && !alguemFora(e),
    peso: () => 1,
    texto: () => 'No muro perto do abrigo há um mapa rabiscado com um X. Vale checar?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'Ninguém quer ir atrás de um X no muro.')
      const p = mandarFora(e, esc, 'mapa', 1)
      return sorteia(
        rng,
        () => {
          anotar(e, 'O X marca um esconderijo. Volta com um item.')
          levarAleatorio(p, rng)
        },
        () => {
          anotar(e, 'O X marca um pacote. Volta com um item.')
          levarAleatorio(p, rng)
        },
        () => {
          anotar(e, 'O X marca suprimentos escondidos. Volta com um item.')
          levarAleatorio(p, rng)
        },
        () => anotar(e, 'O esconderijo já foi saqueado. Sem efeito.'),
        () => anotar(e, 'Era brincadeira. Sem efeito.'),
      )
    },
  },
  {
    id: 'cofre_vizinho', grupo: 'expedicao',
    quando: (e) => !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'A família sempre quis saber o que tem no cofre da sala do vizinho, que nunca foi querido. Mandamos alguém roubar?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'Deixam o cofre para lá.')
      const p = mandarFora(e, esc, 'cofre', 1)
      return sorteia(
        rng,
        () => {
          anotar(e, 'A explosão já abriu o cofre. Pega um item; o vizinho não foi achado.')
          levarAleatorio(p, rng)
        },
        () => {
          anotar(e, 'O cofre estava armadilhado: sai fumaça fedida. Pega um item, mas fica doente.')
          levarAleatorio(p, rng)
          adoecer(e, esc, `${nome(e, esc)} fica doente.`)
        },
      )
    },
  },
  {
    id: 'cobaia', grupo: 'cadeia',
    // o "???" da fonte é o cientista de fuga_gato (flag 'simnao.cientista'); repete 3 vezes
    quando: (e) => e.flags['simnao.cientista'] === true && vezes(e, 'cobaia') < 3 && cadeiaStatus(e, 'estrelas') !== 'fechado' && !alguemFora(e),
    peso: () => 1,
    texto: () => 'O cientista pede um voluntário para um experimento sobre doenças da região. Diz que é para um foguete que sai do deserto.',
    escolhas: mandarPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') {
        if (vezes(e, 'cobaia') >= 2) {
          flagFinal(e, 'estrelas', 'fechado')
          return anotar(e, 'Sem voluntário, o cientista perde a paciência. O foguete não sai.')
        }
        return anotar(e, 'Sem voluntário, o cientista vai embora.')
      }
      mandarFora(e, esc, 'cientista', 4)
      flagFinal(e, 'estrelas', 'andamento')
      // "ao voltar": ferido agora; a doença e a loucura do dia seguinte ficam como gancho para o motor
      e.flags[`pessoas.cobaia.${esc}`] = e.dia + 5
      ferir(e, esc, `${nome(e, esc)} volta do experimento ferido.`)
      return anotar(e, 'O experimento dura quatro dias. Ninguém sabe se existe foguete nenhum.')
    },
  },
  {
    id: 'reconhecimento', grupo: 'cadeia',
    // "provisões" é de outra lista: lemos eventosVistos com o id palpite 'provisoes'
    quando: (e) => visto(e, 'provisoes') && vezes(e, 'reconhecimento') < 3 && cadeiaStatus(e, 'bunker_vip') !== 'fechado' && !alguemFora(e),
    peso: () => 1,
    texto: () => 'Os agentes pedem que alguém saia, faça um reconhecimento e anote o que viu. Mandamos?',
    escolhas: mandarPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') {
        if (vezes(e, 'reconhecimento') >= 2) {
          flagFinal(e, 'bunker_vip', 'fechado')
          return anotar(e, 'Os agentes desistem. O refúgio fica fora de alcance.')
        }
        return anotar(e, 'Os agentes esperam, mas ninguém vai.')
      }
      mandarFora(e, esc, 'reconhecimento', 1)
      flagFinal(e, 'bunker_vip', 'andamento')
      ferir(e, esc, `${nome(e, esc)} volta ferido, mas com as anotações.`)
      return undefined
    },
  },
  {
    id: 'reencontro_gemeos', grupo: 'cadeia',
    quando: (e) => (e.flags['pessoas.gemeos.passo'] ?? 0) >= 1 && cadeiaStatus(e, 'gemeos') === 'andamento' && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'Uma jovem de branco pede ajuda para resgatar o irmão gêmeo, preso num acampamento de bandidos por ter desafiado o líder. Ajudamos?',
    escolhas: mandarPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') return anotar(e, 'Sem ajuda, os gêmeos seguem sozinhos.')
      mandarFora(e, esc, 'resgate', 1)
      pflag(e, 'gemeos.passo', 3)
      return anotar(e, 'O grupo resgata o irmão. Ele perdeu uma mão, mas vai sobreviver.')
    },
  },
  {
    id: 'laco_familiar', grupo: 'abrigo',
    quando: (e) => (baixo(e, 'sopa') || baixo(e, 'agua')) && presentes(e).length >= 3,
    peso: () => 1,
    unico: true,
    texto: () => 'O abrigo não cabe todos. Alguém precisa sair e se virar lá fora. Quem?',
    escolhas: escolherPessoa,
    resolver(e, esc) {
      if (esc === 'ninguem') {
        sanidadeUp(e, ids(e))
        return anotar(e, 'Ninguém sai. O abrigo fica cheio, mas em paz.')
      }
      // a fonte não diz se a pessoa volta: tratamos como saída definitiva
      return sair(e, esc, 'laco_familiar', `${nome(e, esc)} sai do abrigo. Não se sabe se volta.`)
    },
  },
  {
    id: 'tanque_antigo', grupo: 'cadeia',
    quando: (e) => jaSaiu(e) && !alguemFora(e),
    peso: () => 1,
    unico: true,
    texto: () => 'A última expedição viu um tanque abandonado entre os escombros. Mandamos alguém investigar?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'Sem efeito. Ninguém quer chegar perto de um tanque.')
      const p = mandarFora(e, esc, 'tanque', 1)
      return sorteia(
        rng,
        () => {
          anotar(e, 'Rações de exército. Volta com comida e água.')
          levar(p, 'sopa')
          levar(p, 'agua')
        },
        () => {
          anotar(e, 'Equipamento de proteção: uma máscara de gás.')
          levar(p, 'mascara')
        },
        () => {
          // "às vezes" na fonte, sem chance: 50% (nosso número)
          if (!rng.chance(0.5)) return anotar(e, 'O rádio do tanque está mudo.')
          levar(p, 'radio')
          pflag(e, 'militar.liberado')
          return anotar(e, 'O rádio funciona e o exército entra em contato, oferecendo ajuda.')
        },
        () => {
          anotar(e, 'Um rifle encostado no canto.')
          levar(p, 'rifle')
        },
        () => anotar(e, 'Munição solta no chão.'),
        () => {
          anotar(e, 'O tanque tinha explosivos. O enviado não volta.')
          matar(e, esc, 'explosivos', `${nome(e, esc)} morre na explosão.`)
          if (p) p.fora = null
        },
      )
    },
  },
  {
    id: 'ilha_tesouro', grupo: 'expedicao',
    quando: (e) => tem(e, 'mapa') && !alguemFora(e),
    peso: () => 1,
    texto: () => 'No mapa há rabiscos com instruções para achar algo enterrado. Mandamos alguém?',
    escolhas: mandarPessoa,
    resolver(e, esc, rng = e.rng.eventos) {
      if (esc === 'ninguem') return anotar(e, 'O mapa volta para a gaveta.')
      const p = mandarFora(e, esc, 'ilha', 1)
      return sorteia(
        rng,
        () => {
          anotar(e, 'Latas enterradas embaixo de uma árvore no quintal de um vizinho. Volta com duas.')
          levar(p, 'sopa')
          levar(p, 'sopa')
        },
        () => {
          anotar(e, 'Um oco numa árvore com um jogo de damas.')
          levar(p, 'damas')
        },
        () => {
          anotar(e, 'No parque destruído, uma lanterna que ainda funciona.')
          levar(p, 'lanterna')
        },
        () => anotar(e, 'Nada. Era brincadeira de criança.'),
        () => {
          anotar(e, 'O enviado tropeça num monte de entulho e perde o mapa.')
          tirarItem(e, 'mapa', 1, 'O mapa se perde.')
        },
      )
    },
  },
]

// status de cadeia de final gravado por este arquivo (leitura compartilhada em simnao.mjs)
function flagFinal(e, cadeia, status) {
  pflag(e, `final.${cadeia}`, status)
}
