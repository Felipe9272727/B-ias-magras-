// Cadeias de eventos, visitantes recorrentes e eventos avulsos do "60 Segundos das IAs".
// Fonte: docs/eventos_cadeias_finais.md (seções 1, 2.1 e 4). Textos e nomes são nossos (paráfrase).
//
// CONTAGEM deste arquivo: 79 eventos = 65 de cadeias + 5 de visitantes recorrentes + 9 avulsos.
// (O catálogo fala em 72 entradas: aqui cada PASSO é um evento, e os passos com cópias de variante
//  viraram escolhas do mesmo evento, então a conta não bate com a do catálogo.)
//  - militar (5): militar_1..5
//  - bandidos (3): bandidos_0..2 (0 = aviso, 1 = cerco, 2 = desforra)
//  - radio_espaco (4): radio_espaco_1..4
//  - gemeos (5): gemeos_1..5
//  - lado_sombrio (3): lado_sombrio_1..3 (roubos; cada um cria a mancha)
//  - gatos (6): gatos_1..6 (1 entrada, 2 fio, 3 oferta dos agentes, 4 tarefa, 5 cientista, 6 batida)
//  - cientista (3): cientista_1..3
//  - gatos_final (11): gatos_final_0..8 (geladeira e clones), gatos_final_9 (final), gatos_final_x (fome)
//  - cao (4): cao_1..4
//  - mutacao (4): mutacao_1..4
//  - ferida (3): ferida_1..3 (ferida_3 = agonia)
//  - saida_loucura (4): saida_loucura_1..4
//  - carro (2): carro_1..2
//  - sinal_timmy (2): sinal_timmy_1..2
//  - veiculo (6): veiculo_1..6 (multi-partida simplificada: um passo por dia, na mesma partida)
//  - visitantes recorrentes (5): visitante_seis_bracos, visitante_caco, visitante_caco_volta,
//    visitante_medicos, visitante_medicos_volta
//  - avulsos (9): com_1..com_6 (comércio), auto_1..auto_3 (automáticos, com `automatico: true`)
//
// NOMES (papel original da fonte → nosso nome). Os nomes originais aparecem SÓ neste comentário, para cruzar com a fonte.
//  Família (familia.mjs): Ted = pai (Osvaldo); Dolores = mãe (Celeste); Mary Jane = filha (Juju); Timmy = filho (Tico).
//  Visitantes recorrentes:
//    V1 Seis-braços (mutantes amigos)      → Os Braçudos
//    V2 Jim, o catador de pedras           → Caco
//    V3 Agentes do governo                 → Os Homens de Fone
//    V4 Cientista "Doc"                    → Doutor Basílio
//    V5 Bandidos e Bob                     → Os Sacoleiros; o líder Bob → Zeca Sacola
//    V6 Militares                          → A Patrulha Verde
//    V7 Gêmeos                             → Lia e Leo
//    V8 Cão Pancake                        → Bolinho
//    V9 Gato Sharikov                      → Mingau
//    V10 Clínica de campo (médicos)        → Clínica Ambulante (doutora Odete)
//  Gatos clonados (cadeia gatos_final): Vera → Dona Pelúcia; Beren → Bigodinho; Deerme → Tigrão;
//    Mat → Sardinha; Mith → Miúda; Rad → Rajadinha; Pawka/Solid → Tapioca; Azya → Pé-de-Moleque; Brigadeiro (novo).
//  Comerciante Willy → Seu Valdomiro.
//
// REGRAS DE CHANCE: chance binária sem número na fonte = 50% (rng.chance(0.5)). Lista de desfechos sem
// probabilidade na fonte = sorteio uniforme. Ambos estão comentados no lugar.
//
// LACUNAS DO CATÁLOGO (itens.mjs não tem): munição (tratada como ausente: o rifle serve de defesa e
// nenhum evento gasta munição) e a conquista "Pacifista" etc. (não há sistema de conquistas).
// `estado.mjs` NÃO tem função para mutar uma pessoa: a mutação da filha fica em
// `flags['cadeia.mutacao.mutante']` (ver ehMutante). O motor precisa de um mutar() em estado.mjs.
import {ITENS} from '../itens.mjs'
import {
  pessoa, noAbrigo, tem, nome, anotar, darItem, tirarItem, quebrarItem, adoecer, curar, ferir, cansar,
  enlouquecer, matar, sair, voltar, terminar,
} from '../estado.mjs'

// passo de cadeia cuja espera acabou: peso alto (o motor força o dia a ter esse evento, como o jogo faz com a história)
const PESO_PRONTO = 60
const FAM = ['pai', 'mae', 'filha', 'filho']

// ---------------------------------------------------------------- helpers (só usam as funções de estado.mjs)
const ch = (n) => `cadeia.${n}`
const passo = (e, n) => e.flags[ch(n)]
const andar = (e, n, p) => { e.flags[ch(n)] = p }
const fechar = (e, n) => andar(e, n, 0) // 0 = cadeia encerrada (bloqueada)
const esperar = (e, n, dias) => { e.flags[`${ch(n)}.ate`] = e.dia + dias }
const pronto = (e, n) => e.dia >= (e.flags[`${ch(n)}.ate`] ?? 0)
const conta = (e, k) => (e.flags[k] = (e.flags[k] ?? 0) + 1) // devolve a contagem nova
const dentro = (e, id) => { const p = pessoa(e, id); return !!p && p.vivo && p.noAbrigo }
const dentros = (e) => FAM.filter((id) => dentro(e, id))
const sorteia = (rng, lista) => (lista.length ? rng.escolher(lista) : undefined)
const ehMutante = (e) => !!(pessoa(e, 'filha')?.mutante || e.flags[ch('mutacao.mutante')])
const sharikov = (e) => !!e.flags['visitante.sharikov']
const pancake = (e) => !!e.flags['visitante.pancake']
const seisBracos = (e) => !!e.flags['visitante.seis_bracos']
const mandar = (e) => noAbrigo(e).map((p) => ({id: p.id, texto: `mandar ${p.nome}`}))
const ehPessoa = (id) => FAM.includes(id)
const faltando = (e) => Object.keys(ITENS).filter((k) => !tem(e, k) && k !== 'sopa' && k !== 'agua')
const agonizante = (e) => noAbrigo(e).find((p) => { const m = p.ferido ?? p.doente; return !!m && e.dia - m.desde >= 3 })

// abalar: positivo = sanidade cai (mais loucura); negativo = sanidade sobe. Vale para quem está no abrigo.
function abalar(e, pontos, texto) {
  for (const p of noAbrigo(e)) enlouquecer(e, p.id, pontos)
  anotar(e, texto)
}
// ida: a pessoa sai numa expedição e volta no mesmo dia (o motor não tem expedição por dia aqui)
function ida(e, id, texto) {
  sair(e, id, 'expedicao', `${nome(e, id)} sai numa expedição.`)
  voltar(e, id, texto)
}
// mancha de sangue: roubo do lado sombrio. Cancela o resgate dos gêmeos para sempre.
function mancha(e) {
  e.flags[ch('lado_sombrio.mancha')] = true
  fechar(e, 'gemeos')
}
// mutação de Mary Jane (ver cabeçalho: estado.mjs não tem mutar())
function mutar(e, texto) {
  if (dentro(e, 'filha') && !ehMutante(e)) {
    e.flags[ch('mutacao.mutante')] = true
    anotar(e, texto)
  }
}
// mordida das aranhas e do vazamento: 50% se ela estiver no abrigo (chance não informada na fonte)
function mordida(e, rng, texto) {
  if (dentro(e, 'filha') && rng.chance(0.5)) mutar(e, texto)
}
// troca de comércio: entrega 1 item e recebe uma quantidade de água ou sopa
function comercio(id, quando, texto, tabela) {
  return {
    id, grupo: 'porta', unico: true, quando, texto: () => texto,
    escolhas: (e) => [
      ...Object.entries(tabela).map(([item, [rec, q]]) => ({
        id: item,
        texto: `${q} ${rec === 'agua' ? 'garrafa(s) de água' : 'lata(s) de sopa'} por ${ITENS[item].nome}`,
        requer: (e) => tem(e, item),
      })),
      {id: 'nada', texto: 'recusar'},
    ],
    resolver: (e, escolha) => {
      if (escolha === 'nada') return anotar(e, 'Recusou. O vendedor resmunga e vai embora.')
      const [rec, q] = tabela[escolha]
      tirarItem(e, escolha, 1, `Entregou ${ITENS[escolha].nome}.`)
      darItem(e, rec, q, `Ganhou ${q} ${rec === 'agua' ? 'água' : 'sopa'}.`)
    },
  }
}

// ---------------------------------------------------------------- 1. Militar (cadeia militar)
// Precisa de rádio funcionando no abrigo. Falha = passo se repete, depois de 10 dias.
const MILITAR = [
  {
    id: 'militar_1', peso: () => PESO_PRONTO,
    quando: (e) => (passo(e, 'militar') ?? 1) === 1 && tem(e, 'radio') && pronto(e, 'militar'),
    texto: () => 'Um chiado no rádio, e no meio dele uma voz: militares vêm buscar sobreviventes. Falta captar o sinal, ou achar o ponto de resgate.',
    escolhas: (e) => [
      {id: 'radio', texto: 'sintonizar e responder pelo rádio', requer: (e) => tem(e, 'radio')},
      ...mandar(e).map((m) => ({...m, texto: `${m.texto} até o tanque abandonado`})),
      {id: 'nada', texto: 'ignorar a voz'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'radio') { andar(e, 'militar', 2); return anotar(e, 'Contato feito. Do outro lado pedem para esperar.') }
      if (id === 'nada') { esperar(e, 'militar', 10); return anotar(e, 'Ninguém sintoniza. A voz volta daqui uns dias.') }
      // mandar ao tanque: 6 desfechos sem probabilidade na fonte, então sorteio uniforme
      const d = rng.escolher(['radio', 'comida', 'mascara', 'rifle', 'inseticida', 'armadilha'])
      if (d === 'armadilha') return matar(e, id, 'armadilha', `${nome(e, id)} chega ao tanque e a armadilha explode. Não volta.`)
      sair(e, id, 'expedicao', `${nome(e, id)} sai para o tanque.`)
      if (d === 'radio') { andar(e, 'militar', 2); anotar(e, 'No tanque tem um rádio que ainda funciona. Contato militar!') }
      if (d === 'comida') { darItem(e, 'sopa', 1, 'Uma lata de sopa no tanque.'); darItem(e, 'agua', 1, 'Uma garrafa de água também.') }
      if (d === 'mascara') darItem(e, 'mascara', 1, 'Uma máscara de gás no tanque.')
      if (d === 'rifle') darItem(e, 'rifle', 1, 'Um rifle militar, ainda com a trava.')
      if (d === 'inseticida') darItem(e, 'inseticida', 1, 'Um spray de inseto, no porta-luvas.')
      voltar(e, id, `${nome(e, id)} volta do tanque.`)
    },
  },
  {
    id: 'militar_2', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'militar') === 2 && pronto(e, 'militar') && tem(e, 'radio'),
    texto: () => 'Os militares pedem um sinal visível: uma luz de noite, um mapa com coordenadas ou cartas deixadas no ponto de ônibus.',
    escolhas: () => [
      {id: 'lanterna', texto: 'ficar na rua com a lanterna', requer: (e) => tem(e, 'lanterna')},
      {id: 'mapa', texto: 'marcar o mapa e deixar no lugar', requer: (e) => tem(e, 'mapa')},
      {id: 'baralho', texto: 'deixar o baralho no ponto de ônibus', requer: (e) => tem(e, 'baralho')},
      {id: 'nada', texto: 'não fazer o sinal'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'militar', 10); return anotar(e, 'O sinal não é feito. Os militares pedem de novo depois.') }
      if (id === 'baralho') tirarItem(e, 'baralho', 1, 'As cartas ficam no ponto de ônibus.')
      andar(e, 'militar', 3)
      anotar(e, 'Sinal feito. Alguém lá em cima viu.')
    },
  },
  {
    id: 'militar_3', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'militar') === 3 && pronto(e, 'militar') && tem(e, 'radio'),
    texto: () => 'Os militares querem latas de gás no ponto de ônibus, uma colina com barulho, ou lenha cortada. E as armas de fogo, entregues antes do resgate.',
    escolhas: () => [
      {id: 'mascara', texto: 'levar a máscara de gás com as latas', requer: (e) => tem(e, 'mascara')},
      {id: 'gaita', texto: 'subir a colina e tocar a gaita', requer: (e) => tem(e, 'gaita')},
      {id: 'machado', texto: 'cortar árvores no parque com o machado', requer: (e) => tem(e, 'machado')},
      {id: 'rifle', texto: 'entregar o rifle', requer: (e) => tem(e, 'rifle')},
      // a fonte também tem "sem rifle avança"; não separamos a variante: 'nada' sempre repete (sem brecha)
      {id: 'nada', texto: 'não atender'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'militar', 10); return anotar(e, 'A família não atende. O resgate atrasa.') }
      if (id === 'machado') quebrarItem(e, 'machado', 'O machado racha no meio da árvore.')
      if (id === 'rifle') tirarItem(e, 'rifle', 1, 'O rifle vai para o ponto de entrega.')
      andar(e, 'militar', 4)
      anotar(e, 'A parte chata foi feita. Falta a última.')
    },
  },
  {
    id: 'militar_4', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'militar') === 4 && pronto(e, 'militar') && tem(e, 'radio'),
    texto: () => 'Um militar pede que alguém da família vá a um ponto e responda perguntas sobre o grupo. Pode ser armadilha, pode não ser.',
    escolhas: (e) => [
      ...mandar(e),
      {id: 'nada', texto: 'não mandar ninguém'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'militar', 10); return anotar(e, 'Ninguém vai. O pedido se repete em alguns dias.') }
      ida(e, id, `${nome(e, id)} responde às perguntas e volta com a lista de nomes.`)
      e.flags[ch('militar.encontro')] = e.dia
      andar(e, 'militar', 5)
    },
  },
  {
    id: 'militar_5', peso: () => 3,
    quando: (e) => passo(e, 'militar') === 5 && tem(e, 'radio'),
    texto: () => 'Alguém bate forte na porta. Todo mundo ouve a batida de dois toques, e a família precisa decidir.',
    escolhas: () => [
      {id: 'abrir', texto: 'abrir a porta'},
      {id: 'nao_abrir', texto: 'esperar lá dentro'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nao_abrir') return anotar(e, 'Ninguém abre. Quem bate continua batendo, sem pressa.')
      // página militar: até 10 dias após o encontro, abrir é emboscada; depois, 3 desfechos sorteados (uniforme)
      const desde = e.dia - (e.flags[ch('militar.encontro')] ?? -99)
      const d = desde <= 10 ? 'emboscada' : rng.escolher(['resgate', 'emboscada', 'nada'])
      if (d === 'resgate') return terminar(e, 'militar', 'vitoria', 'resgate militar', 'Os militares entram e levam a família. Você sobreviveu.')
      if (d === 'emboscada') {
        tirarItem(e, 'sopa', e.itens.sopa ?? 0, 'Os bandidos amarram todo mundo e levam a comida.')
        tirarItem(e, 'agua', e.itens.agua ?? 0, 'E a água também.')
        return fechar(e, 'militar')
      }
      anotar(e, 'A porta abre e não tem ninguém. Só um sino de bicicleta ao longe.')
    },
  },
]

// ---------------------------------------------------------------- 2. Bandidos (cerco e desforra)
// Defesa até 10 vezes. Primeiro cerco sem defesa = sequestro; o segundo = invasão (final).
const DEFESAS_MAX = 10
const BANDIDOS = [
  {
    id: 'bandidos_0', automatico: true, unico: true,
    quando: (e) => passo(e, 'bandidos') === undefined && e.dia >= 6,
    // a fonte liga o aviso a uma expedição seguida; sem evento de expedição aqui, usamos o dia 6
    texto: () => 'Um recado no bilhete: alguém seguiu a família na última saída. Não sabem quem.',
    escolhas: () => [{id: 'ok', texto: 'seguir a vida'}],
    resolver: (e) => { andar(e, 'bandidos', 1); anotar(e, 'Os sacoleiros estão de olho na casa.') },
  },
  {
    id: 'bandidos_1', peso: () => 3,
    quando: (e) => passo(e, 'bandidos') === 1,
    texto: () => 'Um grupo de sacoleiros bate com força e pede que a família se renda ou lute. Zeca Sacola está na frente, de óculos azuis, sem dizer nada.',
    escolhas: (e) => {
      const defesas = e.flags[ch('bandidos.defesas')] ?? 0
      const lista = []
      if (defesas < DEFESAS_MAX) {
        lista.push(
          {id: 'cadeado', texto: 'trancar com o cadeado', requer: (e) => tem(e, 'cadeado')},
          {id: 'machado', texto: 'defender com o machado', requer: (e) => tem(e, 'machado')},
          {id: 'rifle', texto: 'atirar com o rifle', requer: (e) => tem(e, 'rifle')},
          {id: 'gaita', texto: 'tocar a gaita bem alto', requer: (e) => tem(e, 'gaita')},
          {id: 'inseticida', texto: 'jogar inseticida na cara deles', requer: (e) => tem(e, 'inseticida')},
          {id: 'mutante', texto: 'deixar a filha mutante lutar', requer: (e) => ehMutante(e) && dentro(e, 'filha')},
          {id: 'cao', texto: 'soltar o Bolinho', requer: (e) => pancake(e)},
          {id: 'aliados', texto: 'chamar Os Braçudos', requer: (e) => seisBracos(e)},
        )
      }
      lista.push({id: 'nada', texto: 'não se defender'})
      return lista
    },
    resolver: (e, id, rng) => {
      const defesas = e.flags[ch('bandidos.defesas')] ?? 0
      e.flags[ch('bandidos.bairro')] = true
      if (id === 'nada' || defesas >= DEFESAS_MAX) {
        if ((e.flags[ch('bandidos.perdas')] ?? 0) === 0) {
          const alvo = sorteia(rng, dentros(e))
          if (alvo) {
            conta(e, ch('bandidos.perdas'))
            sair(e, alvo, 'preso', `Os sacoleiros levam ${nome(e, alvo)} para o acampamento.`)
            return
          }
        }
        return terminar(e, 'invasao', 'derrota', 'invasão', 'Os sacoleiros entram e tomam o abrigo. Você pereceu.')
      }
      conta(e, ch('bandidos.defesas'))
      if (id === 'cadeado') tirarItem(e, 'cadeado', 1, 'O cadeado segura a porta. Foi gasto no processo.')
      if (id === 'machado') quebrarItem(e, 'machado', 'O machado racha de tanto bater na porta.')
      if (id === 'rifle') anotar(e, 'Os tiros afastam os invasores. (Munição fora do catálogo: o rifle não gasta nada.)')
      if (id === 'gaita') {
        if (e.flags[ch('bandidos.gaita')]) { tirarItem(e, 'gaita', 1, 'Na segunda vez, os sacoleiros fogem levando a gaita.') }
        else { e.flags[ch('bandidos.gaita')] = true; anotar(e, 'A música assusta os invasores. Eles baixam as armas, por hoje.') }
      }
      if (id === 'inseticida') {
        tirarItem(e, 'inseticida', 1, 'O spray faz os bandidos tossir. Entram e levam duas latas de sopa.')
        tirarItem(e, 'sopa', 2, 'Duas latas de sopa desaparecem.')
        if (rng.chance(0.5)) ferir(e, sorteia(rng, dentros(e)) ?? 'pai', 'Um dos invasores acerta alguém.') // chance não informada: 50%
      }
      if (id === 'mutante') {
        if (conta(e, ch('bandidos.mutante')) >= 2) matar(e, 'filha', 'perseguida', 'A filha mutante persegue os sacoleiros para fora da rua. Não volta.')
        else anotar(e, 'A filha mutante ataca os sacoleiros. Eles fogem correndo.')
      }
      if (id === 'cao') { e.flags['visitante.pancake'] = false; anotar(e, 'O Bolinho afasta os invasores e sai correndo. Ninguém sabe para onde.') }
      if (id === 'aliados') anotar(e, 'Os Braçudos afastam os sacoleiros com os muitos braços.')
    },
  },
  {
    id: 'bandidos_2', peso: () => 2,
    quando: (e) => passo(e, 'bandidos') === 1 && e.flags[ch('bandidos.bairro')] && (tem(e, 'rifle') || tem(e, 'machado')),
    texto: () => 'O acampamento dos sacoleiros faz barulho perto de casa. Alguém pode ir atacar, com rifle ou machado na mão.',
    escolhas: (e) => [
      ...noAbrigo(e).map((p) => ({id: p.id, texto: `${p.nome} sai armado(a)`, requer: (e) => tem(e, 'rifle') || tem(e, 'machado')})),
      {id: 'nada', texto: 'não se arriscar'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nada') return anotar(e, 'A família decide não se arriscar.')
      const arma = tem(e, 'rifle') ? 'rifle' : 'machado'
      const presos = e.pessoas.filter((p) => p.vivo && p.fugiu === 'preso').map((p) => p.id)
      const d = rng.escolher(presos.length ? ['fracasso', 'saque', 'bravata', 'resgate'] : ['fracasso', 'saque', 'bravata'])
      sair(e, id, 'expedicao', `${nome(e, id)} vai ao acampamento com o ${ITENS[arma].nome}.`)
      if (d === 'fracasso') {
        tirarItem(e, arma, 1, `O ${ITENS[arma].nome} se perde no tiroteio.`)
        if (rng.chance(0.5)) ferir(e, id, `${nome(e, id)} volta com um tiro de raspão.`) // chance não informada: 50%
      } else if (d === 'resgate') {
        const alvo = sorteia(rng, presos)
        voltar(e, alvo, `${nome(e, alvo)} foi resgatado(a) do acampamento!`)
        e.flags[ch('bandidos.libertacao')] = true
      } else {
        const item = rng.escolher(Object.keys(ITENS)) // saque e bravata: item aleatório do acampamento
        darItem(e, item, 1, `No acampamento, pegam ${ITENS[item].nome}.`)
      }
      voltar(e, id, `${nome(e, id)} volta.`)
    },
  },
]

// ---------------------------------------------------------------- 3. Rádio e espaço
const RADIO_ESPACO = [
  {
    id: 'radio_espaco_1', peso: () => 1,
    quando: (e) => (passo(e, 'radio_espaco') ?? 1) === 1 && tem(e, 'radio'),
    texto: () => 'Atrás da estática, sinais estranhos. Uma voz feminina aparece no meio da chiadeira.',
    escolhas: (e) => [
      {id: 'sim', texto: 'sintonizar', requer: (e) => tem(e, 'radio')},
      {id: 'nao', texto: 'desligar o rádio'},
    ],
    resolver: (e, id) => {
      if (id === 'sim') { andar(e, 'radio_espaco', 2); return anotar(e, 'A família sintoniza. A voz fala de uma tripulação que enlouqueceu.') }
      anotar(e, 'Desligam. Talvez seja só o rádio cansado.')
    },
  },
  {
    id: 'radio_espaco_2', peso: () => 2,
    quando: (e) => passo(e, 'radio_espaco') === 2,
    texto: () => 'A voz diz que a tripulação comeu toda a sopa e que agora há sons de ataque. Ela pede uma resposta.',
    escolhas: () => [
      {id: 'sim', texto: 'responder que sim, que vão ver'},
      {id: 'nao', texto: 'não responder'},
    ],
    resolver: (e, id) => {
      if (id === 'sim') {
        darItem(e, 'sopa', 2, 'A voz agradece e manda duas latas de sopa pela fresta.')
        return andar(e, 'radio_espaco', 3)
      }
      // "não": passo termina; a harmônica abre o eco de ajuda
      if (tem(e, 'gaita')) andar(e, 'radio_espaco', 4)
      else fechar(e, 'radio_espaco')
      anotar(e, 'A família prefere não responder.')
    },
  },
  {
    id: 'radio_espaco_3', peso: () => 2,
    quando: (e) => passo(e, 'radio_espaco') === 3,
    texto: () => 'A voz dá um endereço para a família. Dizem que é uma casa lá fora. Ninguém sabe se é boa ideia.',
    escolhas: () => [
      {id: 'ir', texto: 'ir ao endereço'},
      {id: 'nao_ir', texto: 'ficar em casa'},
    ],
    resolver: (e, id) => {
      fechar(e, 'radio_espaco')
      if (id === 'ir') { darItem(e, 'sopa', 2, 'Na casa do endereço tem duas latas de sopa.'); return anotar(e, 'Entram. Ninguém vê o monstro, mas o cheiro é ruim.') }
      anotar(e, 'Ficam em casa. A dúvida continua.')
    },
  },
  {
    id: 'radio_espaco_4', peso: () => 2,
    quando: (e) => passo(e, 'radio_espaco') === 4 && tem(e, 'gaita'),
    texto: () => 'Bipes fracos e algo que parece uma harmônica. A transmissão continua, só que mais perto agora.',
    escolhas: (e) => [
      {id: 'tocar', texto: 'tocar a gaita lá fora', requer: (e) => tem(e, 'gaita')},
      {id: 'nao', texto: 'não tocar'},
    ],
    resolver: (e, id) => {
      fechar(e, 'radio_espaco')
      if (id === 'nao') return anotar(e, 'Ninguém quer chamar atenção no céu. Ficam quietos.')
      abalar(e, -15, 'As luzes do céu piscam em resposta, em uma sequência de pulsos. Todo mundo se acalma.')
    },
  },
]

// ---------------------------------------------------------------- 4. Gêmeos
// Não exige item para começar. Falha = passo se repete a cada ~10 dias. Roubo = cadeia bloqueada.
const GEMEOS = [
  {
    id: 'gemeos_1', peso: () => 2,
    quando: (e) => (passo(e, 'gemeos') ?? 1) === 1,
    texto: () => 'Um orelhão da rua, que sobreviveu à explosão, toca sem parar.',
    escolhas: (e) => [...mandar(e), {id: 'nada', texto: 'deixar tocar'}],
    resolver: (e, id, rng) => {
      if (id === 'nada') return abalar(e, 10, 'O telefone toca a tarde toda. Todo mundo perde a paciência.')
      if (rng.chance(0.5)) { // chance não informada: 50% (ligação cai e a cadeia começa)
        ida(e, id, 'A ligação cai. Alguém do outro lado diz que é de outra cidade.')
        return andar(e, 'gemeos', 2)
      }
      // desfechos que NÃO avançam (variantes da fonte): ferido ou propaganda, sorteio uniforme
      if (rng.escolher(['ferido', 'propaganda']) === 'ferido') {
        sair(e, id, 'expedicao', `${nome(e, id)} atende na rua e um tiro passa perto.`)
        ferir(e, id, `${nome(e, id)} volta ferido(a).`)
        return voltar(e, id, `${nome(e, id)} volta para casa.`)
      }
      ida(e, id, 'A gravação é uma propaganda de sopa. Só isso.')
    },
  },
  {
    id: 'gemeos_2', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'gemeos') === 2 && pronto(e, 'gemeos'),
    texto: () => 'Um pedido de ajuda: a irmã dos gêmeos quer resgatar o irmão do acampamento dos sacoleiros. Querem uma pessoa, uma lata de sopa ou só nada.',
    escolhas: (e) => [
      ...mandar(e),
      {id: 'sopa', texto: 'mandar uma lata de sopa', requer: (e) => tem(e, 'sopa')},
      {id: 'nada', texto: 'esperar os militares'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'gemeos', 10); return anotar(e, 'A família decide esperar. O pedido volta depois.') }
      if (id === 'sopa') tirarItem(e, 'sopa', 1, 'A lata de sopa vai na carta de apoio.')
      else ida(e, id, 'A pessoa volta com o recado: o irmão foi achado.')
      andar(e, 'gemeos', 3)
    },
  },
  {
    id: 'gemeos_3', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'gemeos') === 3 && pronto(e, 'gemeos'),
    texto: () => 'Os gêmeos precisam de ajuda com o acampamento: lenha, remédio ou um mapa para escolher um lugar seguro.',
    escolhas: () => [
      {id: 'machado', texto: 'levar o machado para a lenha', requer: (e) => tem(e, 'machado')},
      {id: 'kit', texto: 'levar o kit médico', requer: (e) => tem(e, 'kit')},
      {id: 'mapa', texto: 'entregar o mapa', requer: (e) => tem(e, 'mapa')},
      {id: 'nada', texto: 'não ajudar'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'gemeos', 10); return anotar(e, 'Sem ajuda. O pedido volta em alguns dias.') }
      if (id === 'machado') quebrarItem(e, 'machado', 'O machado sai da cerca danificado.')
      if (id === 'kit') tirarItem(e, 'kit', 1, 'Curativos e remédios vão para os feridos.')
      if (id === 'mapa') tirarItem(e, 'mapa', 1, 'O mapa fica com os gêmeos. Não volta.')
      andar(e, 'gemeos', 4)
    },
  },
  {
    id: 'gemeos_4', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'gemeos') === 4 && pronto(e, 'gemeos'),
    texto: () => 'Um ninho de baratas mutantes perto do acampamento. As crianças estão entediadas. Os gêmeos pedem ajuda, e pedem brinquedos também.',
    escolhas: () => [
      {id: 'inseticida', texto: 'usar o inseticida no ninho', requer: (e) => tem(e, 'inseticida')},
      {id: 'rifle', texto: 'destruir o ninho com o rifle', requer: (e) => tem(e, 'rifle')},
      {id: 'machado', texto: 'destruir o ninho com o machado', requer: (e) => tem(e, 'machado')},
      {id: 'gaita', texto: 'dar a gaita para as crianças', requer: (e) => tem(e, 'gaita')},
      {id: 'baralho', texto: 'dar o baralho', requer: (e) => tem(e, 'baralho')},
      {id: 'damas', texto: 'dar o tabuleiro de damas', requer: (e) => tem(e, 'damas')},
      {id: 'manual', texto: 'doar o manual do escoteiro para a escola', requer: (e) => tem(e, 'manual')},
      {id: 'nada', texto: 'não ajudar'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'gemeos', 10); return anotar(e, 'Sem ajuda, o ninho continua lá.') }
      if (id === 'inseticida') tirarItem(e, 'inseticida', 1, 'O spray acaba com o ninho.')
      if (id === 'rifle') quebrarItem(e, 'rifle', 'O rifle fica com a coronha rachada, mas o ninho acaba.')
      if (id === 'machado') quebrarItem(e, 'machado', 'O machado quebra no meio do ninho.')
      if (id === 'manual') tirarItem(e, 'manual', 1, 'O manual vai para a escola do acampamento.')
      // gaita, baralho e damas: a fonte não diz se são gastos; mantemos com a família
      andar(e, 'gemeos', 5)
    },
  },
  {
    id: 'gemeos_5', peso: () => 3,
    quando: (e) => passo(e, 'gemeos') === 5,
    texto: () => 'Alguém bate forte na porta. Lia e Leo estão lá fora, com um convite para morar no acampamento.',
    escolhas: () => [
      {id: 'abrir', texto: 'abrir a porta'},
      {id: 'nao_abrir', texto: 'esperar os militares'},
    ],
    resolver: (e, id) => {
      if (id === 'nao_abrir') return anotar(e, 'A família decide esperar. Lá fora, alguém suspira.')
      terminar(e, 'gemeos', 'vitoria', 'resgate dos gêmeos', 'Lia e Leo levam a família para o acampamento. Você sobreviveu, e saiu daqui.')
    },
  },
]

// ---------------------------------------------------------------- 5. Lado sombrio (roubos). Cada um cria a mancha.
const LADO_SOMBRIO = [
  {
    id: 'lado_sombrio_1', peso: () => 1,
    quando: (e) => e.dia >= 3,
    texto: () => 'Um professor abrigou crianças num prédio e tem um estoque de escola. Dá para roubar, se alguém estiver com coragem.',
    escolhas: () => [
      {id: 'roubar', texto: 'roubar o estoque'},
      {id: 'nao', texto: 'deixar quieto'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nao') return abalar(e, -10, 'A família se sente melhor por ter sido decente.')
      // 4 desfechos da fonte, sorteio uniforme
      const d = rng.escolher(['comida', 'agua', 'aleatorio', 'ataque'])
      if (d === 'comida') darItem(e, 'sopa', 4, 'Quatro latas de sopa, do estoque da escola.')
      if (d === 'agua') darItem(e, 'agua', 4, 'Quatro garrafas de água.')
      if (d === 'aleatorio') { const item = rng.escolher(Object.keys(ITENS)); darItem(e, item, 1, `Pegam ${ITENS[item].nome}.`) }
      if (d === 'ataque') { const alvo = sorteia(rng, dentros(e)); if (alvo) ferir(e, alvo, 'Um bloco de tijolo vem voando da janela. Alguém se machuca.') }
      abalar(e, 10, 'A culpa pesa na família.')
      mancha(e)
    },
  },
  {
    id: 'lado_sombrio_2', peso: () => 1,
    quando: (e) => e.dia >= 3,
    texto: () => 'Um grupo de idosos de um asilo tem suprimentos guardados. Eles não parecem fracos.',
    escolhas: () => [
      {id: 'roubar', texto: 'roubar os suprimentos'},
      {id: 'nao', texto: 'deixar os idosos em paz'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nao') return abalar(e, -20, 'Um alívio enorme. A família volta a respirar.')
      const d = rng.escolher(['comida', 'aleatorio', 'fracasso'])
      if (d === 'comida') { darItem(e, 'sopa', 4, 'Quatro latas de sopa.'); darItem(e, 'agua', 4, 'Quatro garrafas de água.') }
      if (d === 'aleatorio') { const item = rng.escolher(Object.keys(ITENS)); darItem(e, item, 1, `Pegam ${ITENS[item].nome}.`) }
      if (d === 'fracasso') { const alvo = sorteia(rng, dentros(e)); if (alvo) ferir(e, alvo, 'Os idosos eram veteranos e batem com força. Alguém se machuca.') }
      abalar(e, 10, 'A família se sente um pouco pior depois disso.')
      mancha(e)
    },
  },
  {
    id: 'lado_sombrio_3', peso: () => 1,
    quando: (e) => e.dia >= 3,
    texto: () => 'Uma vizinha e os filhos têm suprimentos num abrigo com porta quebrada. Alguém sugere roubar.',
    escolhas: () => [
      {id: 'roubar', texto: 'entrar pela porta quebrada'},
      {id: 'nao', texto: 'bater na porta e pedir ajuda'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nao') return abalar(e, -10, 'A família bate na porta. Ninguém atende, mas a consciência fica tranquila.')
      const d = rng.escolher(['comida', 'aleatorio', 'fracasso'])
      if (d === 'comida') { darItem(e, 'sopa', 4, 'Quatro latas de sopa.'); darItem(e, 'agua', 4, 'Quatro garrafas de água.') }
      if (d === 'aleatorio') { const item = rng.escolher(Object.keys(ITENS)); darItem(e, item, 1, `Pegam ${ITENS[item].nome}.`) }
      if (d === 'fracasso') { const alvo = sorteia(rng, dentros(e)); if (alvo) ferir(e, alvo, 'Estilingues e armadilhas. Ninguém leva nada, e alguém sai ferido.') }
      abalar(e, 10, 'O sino da vizinha ainda toca na cabeça de todo mundo.')
      mancha(e)
    },
  },
]

// ---------------------------------------------------------------- 6. Gatos (Mingau)
// Entrada, fio, agentes, cientista e a batida dos agentes. A dona dos gatos está em gatos_final.
const GATOS = [
  {
    id: 'gatos_1', unico: true, peso: () => 2,
    quando: (e) => passo(e, 'gatos') === undefined && !sharikov(e),
    texto: () => 'Um gato sai da ruína de uma favela de bandidos, sujo de sangue, e fica arranhando a porta.',
    escolhas: () => [
      {id: 'entrar', texto: 'deixar o gato entrar'},
      {id: 'nao', texto: 'não deixar'},
    ],
    resolver: (e, id) => {
      if (id === 'nao') return anotar(e, 'O gato some atrás do muro. Ninguém sabe se volta.')
      e.flags['visitante.sharikov'] = true
      if (pancake(e)) { e.flags['visitante.pancake'] = false; anotar(e, 'O Bolinho olha para o gato novo e vai embora, sem dar tchau.') }
      andar(e, 'gatos', 2)
      anotar(e, 'O Mingau entra e ganha uma coleira com nome. Parece que já morava aqui.')
    },
  },
  {
    id: 'gatos_2', peso: () => 2,
    quando: (e) => passo(e, 'gatos') === 2 && sharikov(e),
    texto: () => 'O Mingau puxa um fio do teto. O fio leva para algum lugar na vizinhança.',
    escolhas: () => [
      {id: 'examinar', texto: 'examinar o fio'},
      {id: 'deixar', texto: 'deixar o gato seguir o fio'},
    ],
    resolver: (e, id) => {
      if (id === 'examinar') { andar(e, 'gatos', 3); return anotar(e, 'O fio leva a um caminhão cheio de homens com fones de ouvido.') }
      andar(e, 'gatos', 5)
      anotar(e, 'O gato some pelo buraco da parede. Só volta com uma pista.')
    },
  },
  {
    id: 'gatos_3', peso: () => 2,
    quando: (e) => passo(e, 'gatos') === 3 && sharikov(e),
    texto: () => 'Os Homens de Fone explicam que o gato é suspeito de espionagem, e oferecem um abrigo do governo em troca de tarefas.',
    escolhas: () => [
      {id: 'sim', texto: 'aceitar as tarefas'},
      {id: 'nao', texto: 'recusar'},
    ],
    resolver: (e, id) => {
      if (id === 'nao') return fechar(e, 'gatos')
      e.flags[ch('gatos.tarefas')] = 0
      andar(e, 'gatos', 4)
      anotar(e, 'Os agentes entregam a primeira tarefa, num envelope sem selo.')
    },
  },
  {
    id: 'gatos_4', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'gatos') === 4 && sharikov(e) && pronto(e, 'gatos'),
    texto: () => 'Mais uma tarefa dos agentes: levar um recado, buscar uma caixa, fingir que é ninguém. A família tenta cumprir.',
    escolhas: () => [
      {id: 'cumprir', texto: 'cumprir a tarefa'},
      {id: 'recusar', texto: 'desistir das tarefas'},
    ],
    resolver: (e, id) => {
      if (id === 'recusar') return fechar(e, 'gatos')
      if (conta(e, ch('gatos.tarefas')) >= 3) { andar(e, 'gatos', 6); return anotar(e, 'Última tarefa feita. Agora os agentes têm uma proposta final.') }
      esperar(e, 'gatos', 2)
      anotar(e, 'Tarefa cumprida. Vem outra.')
    },
  },
  {
    id: 'gatos_5', peso: () => 2,
    quando: (e) => passo(e, 'gatos') === 5 && sharikov(e),
    texto: () => 'O gato saiu de noite pelo buraco da parede. Pelo que parece, sabe onde quer ir: um ferro-velho com um ônibus-laboratório.',
    escolhas: () => [
      {id: 'seguir', texto: 'seguir o gato'},
      {id: 'nao_seguir', texto: 'respeitar a independência do gato'},
    ],
    resolver: (e, id) => {
      fechar(e, 'gatos')
      if (id === 'nao_seguir') return anotar(e, 'Deixam o gato em paz. Ele volta na manhã seguinte, com ar de quem sabe.')
      andar(e, 'cientista', 1)
      anotar(e, 'No ferro-velho tem um ônibus com janelas tampadas. Lá dentro, um homem de jaleco.')
    },
  },
  {
    id: 'gatos_6', peso: () => 3,
    quando: (e) => passo(e, 'gatos') === 6 && sharikov(e) && e.dia >= 50,
    texto: () => 'Alguém bate na porta. Os Homens de Fone chegam no fim da tarde, com um carro grande e uma pasta de papel.',
    escolhas: () => [
      {id: 'abrir', texto: 'abrir a porta'},
      {id: 'nao_abrir', texto: 'não abrir'},
    ],
    resolver: (e, id) => {
      if (id === 'nao_abrir') return anotar(e, 'Ninguém abre. Os agentes ficam esperando na calçada.')
      terminar(e, 'agentes', 'ambiguo', 'abrigo do governo', 'Os agentes levam a família para o abrigo presidencial. Você sobreviveu... talvez.')
    },
  },
]

// ---------------------------------------------------------------- 7. Cientista (Doutor Basílio)
const CIENTISTA = [
  {
    id: 'cientista_1', peso: () => 2,
    quando: (e) => passo(e, 'cientista') === 1,
    texto: () => 'Doutor Basílio pede suprimentos para um experimento: quatro garrafas de água ou quatro latas de sopa.',
    escolhas: (e) => [
      {id: 'agua', texto: 'dar quatro garrafas de água', requer: (e) => (e.itens.agua ?? 0) >= 4},
      {id: 'sopa', texto: 'dar quatro latas de sopa', requer: (e) => (e.itens.sopa ?? 0) >= 4},
      {id: 'nada', texto: 'não dar nada'},
    ],
    resolver: (e, id) => {
      if (id === 'agua') { tirarItem(e, 'agua', 4, 'Quatro garrafas somem no ônibus.'); return andar(e, 'cientista', 2) }
      if (id === 'sopa') { tirarItem(e, 'sopa', 4, 'Quatro latas de sopa viram experimento.'); return andar(e, 'cientista', 2) }
      // a fonte: o pedido se repete até 3 vezes e depois a cadeia fecha
      if (conta(e, ch('cientista.pedidos')) >= 3) return fechar(e, 'cientista')
      anotar(e, 'Doutor Basílio pede de novo, mais baixinho.')
    },
  },
  {
    id: 'cientista_2', peso: () => 2,
    quando: (e) => passo(e, 'cientista') === 2,
    texto: () => 'Doutor Basílio pede uma pessoa da família como cobaia. Garante que é rápido.',
    escolhas: (e) => [...mandar(e), {id: 'nada', texto: 'recusar'}],
    resolver: (e, id, rng) => {
      if (id === 'nada') return fechar(e, 'cientista')
      sair(e, id, 'expedicao', `${nome(e, id)} entra no ônibus.`)
      enlouquecer(e, id, 60, `${nome(e, id)} volta com o olhar de quem viu outra coisa.`)
      if (rng.chance(0.5)) ferir(e, id, 'Um corte no braço, de algum instrumento.') // chance não informada: 50%
      if (rng.chance(0.5)) adoecer(e, id, 'Febre de madrugada, sem explicação.') // chance não informada: 50%
      voltar(e, id, `${nome(e, id)} está de volta, mas não está bem.`)
      esperar(e, 'cientista', 3)
      andar(e, 'cientista', 3)
    },
  },
  {
    id: 'cientista_3', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'cientista') === 3 && pronto(e, 'cientista'),
    texto: () => 'Doutor Basílio tem um foguete pronto no ferro-velho. Diz que a família cabe.',
    escolhas: () => [{id: 'decolar', texto: 'entrar no foguete'}],
    resolver: (e) => terminar(e, 'estrelas', 'ambiguo', 'foguete', 'O foguete decola com a família dentro. Seu destino é desconhecido.'),
  },
]

// ---------------------------------------------------------------- 8. Dona dos gatos (Mingau não pode ter feito final)
// Começa no dia 50 com 9 latas de sopa. Cada passo consome sopa e cria gatos. Gatos novos: nomes nossos.
const GELADEIRA = [
  {n: 1, custo: 1, novos: ['Dona Pelúcia'], texto: 'Mais um gato sai da geladeira. Ele rasga a lata de sopa e dá de ombros.'},
  {n: 2, custo: 1, novos: ['Bigodinho'], texto: 'Chega o Bigodinho. A sopa diminui e a família faz a conta sozinha.'},
  {n: 3, custo: 1, novos: ['Tigrão'], texto: 'O Tigrão entra pela janela da cozinha. Agora são três gatos novos.'},
  {n: 4, custo: 1, novos: ['Sardinha'], texto: 'A Sardinha chega cheirando a fita isolante. A família começa a desconfiar da geladeira.'},
  {n: 5, custo: 1, novos: ['Miúda'], texto: 'A Miúda conversa com o Mingau como se fossem velhos conhecidos. Pergunta o que ele sabe.'},
  {n: 6, custo: 1, novos: ['Rajadinha'], texto: 'Da cozinha, a família vê a geladeira clonando mais um gato, bem na frente deles.'},
  {n: 7, custo: 1, novos: ['Tapioca'], texto: 'Uma pessoa da família enlouquece de tanto miado. A Tapioca aparece para fazer companhia.', louca: true},
  {n: 8, custo: 2, novos: ['Brigadeiro', 'Pé-de-Moleque'], texto: 'Dois gatos chegam de uma vez. A sopa acaba mais rápido do que todos gostariam.'},
]
const custoDe = (n) => GELADEIRA.find((g) => g.n === n)?.custo ?? 0
const GATOS_FINAL = [
  {
    id: 'gatos_final_0', peso: () => 2, unico: true,
    quando: (e) => sharikov(e) && e.dia >= 50 && (e.itens.sopa ?? 0) >= 9 && passo(e, 'gatos_final') === undefined
      && e.final == null && passo(e, 'cientista') === undefined, // sem final de Mingau feito
    texto: () => 'A família acha uma geladeira no fundo da garagem. O Mingau entra nela e a geladeira começa a zumbir de um jeito novo.',
    escolhas: () => [{id: 'ok', texto: 'deixar a geladeira ligada'}],
    resolver: (e) => {
      andar(e, 'gatos_final', 1)
      esperar(e, 'gatos_final', 1)
      anotar(e, 'A geladeira vira uma máquina de clonar. Um gato por dia, uma lata de sopa por dia.')
    },
  },
  ...GELADEIRA.map((g) => ({
    id: `gatos_final_${g.n}`, peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'gatos_final') === g.n && pronto(e, 'gatos_final') && (e.itens.sopa ?? 0) >= g.custo,
    texto: () => g.texto,
    escolhas: () => [{id: 'ok', texto: 'seguir o ciclo'}],
    resolver: (e, id, rng) => {
      tirarItem(e, 'sopa', g.custo, `A sopa desce ${g.custo} lata(s) para alimentar a turma.`)
      e.flags[ch('gatos_final.gatos')] = (e.flags[ch('gatos_final.gatos')] ?? 0) + g.novos.length
      anotar(e, `Chegam: ${g.novos.join(', ')}.`)
      if (g.louca) {
        const alvo = sorteia(rng, dentros(e))
        if (alvo) enlouquecer(e, alvo, 40, `${nome(e, alvo)} enlouquece de tanto miado.`)
      }
      andar(e, 'gatos_final', g.n + 1)
      esperar(e, 'gatos_final', 1)
    },
  })),
  {
    id: 'gatos_final_9', peso: () => 5,
    quando: (e) => passo(e, 'gatos_final') === 9 && (e.flags[ch('gatos_final.gatos')] ?? 0) >= 9,
    texto: () => 'Os gatos mantêm todo mundo alimentado, desde que todo mundo obedeça. A família obedece.',
    escolhas: () => [{id: 'ok', texto: 'obedecer'}],
    resolver: (e) => terminar(e, 'dona_dos_gatos', 'ambiguo', 'dona dos gatos', 'Você sobreviveu... meio. Os gatos governam, e a sopa não acaba.'),
  },
  {
    id: 'gatos_final_x', peso: () => 10,
    quando: (e) => {
      const p = passo(e, 'gatos_final')
      return p >= 1 && p <= 8 && (e.itens.sopa ?? 0) < custoDe(p) && e.final == null
    },
    texto: () => 'A sopa acabou antes de os gatos fecharem a conta. Os gatos reúnem a família na sala.',
    escolhas: () => [{id: 'ok', texto: 'aceitar o regime'}],
    resolver: (e) => terminar(e, 'dominacao_felina', 'derrota', 'gatos tomam o abrigo', 'Os gatos instalaram seu regime supremo. Obedecendo, teremos paz e sopa.'),
  },
]

// ---------------------------------------------------------------- 9. Cão (Bolinho)
const CAO = [
  {
    id: 'cao_1', peso: () => 2,
    quando: (e) => (passo(e, 'cao') ?? 1) === 1 && !sharikov(e) && e.dia >= 3,
    texto: () => 'Uma criatura rosna no escuro, na porta de saída. Alguém precisa decidir o que fazer com ela.',
    escolhas: (e) => [
      {id: 'veneno', texto: 'espirrar inseticida', requer: (e) => tem(e, 'inseticida')},
      {id: 'rifle', texto: 'atirar com o rifle', requer: (e) => tem(e, 'rifle')},
      {id: 'lanterna', texto: 'iluminar a criatura com a lanterna', requer: (e) => tem(e, 'lanterna')},
      {id: 'nada', texto: 'gritar e torcer'},
    ],
    resolver: (e, id) => {
      if (id === 'lanterna') {
        // é um cachorro cansado; some de manhã e volta no dia seguinte
        andar(e, 'cao', 2)
        e.flags[ch('cao.ate')] = e.dia + 1
        return anotar(e, 'É um cachorro cansado. A família deixa ele dormir na varanda.')
      }
      if (id === 'veneno') tirarItem(e, 'inseticida', 1, 'O spray afasta a criatura.')
      fechar(e, 'cao')
      anotar(e, 'A criatura foge. Nada mais acontece.')
    },
  },
  {
    id: 'cao_2', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'cao') === 2 && pronto(e, 'cao') && !sharikov(e),
    texto: () => 'O cachorro volta, faminto, batendo na porta. Quer comida.',
    escolhas: (e) => [
      {id: 'sopa', texto: 'dar uma lata de sopa', requer: (e) => tem(e, 'sopa')},
      {id: 'nada', texto: 'não alimentar'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') return fechar(e, 'cao')
      tirarItem(e, 'sopa', 1, 'O cachorro come tudo e ganha o nome de Bolinho.')
      andar(e, 'cao', 3)
    },
  },
  {
    id: 'cao_3', peso: () => 2,
    quando: (e) => passo(e, 'cao') === 3 && !sharikov(e),
    texto: () => 'O Bolinho quer que a família siga ele por uma rua. Ele tem um plano.',
    escolhas: (e) => [
      {id: 'mapa', texto: 'seguir com o mapa', requer: (e) => tem(e, 'mapa')},
      {id: 'rifle', texto: 'seguir com o rifle', requer: (e) => tem(e, 'rifle')},
      {id: 'machado', texto: 'seguir com o machado', requer: (e) => tem(e, 'machado')},
      {id: 'nada', texto: 'não sair'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'nada') return fechar(e, 'cao')
      if (id === 'mapa') {
        darItem(e, 'sopa', tem(e, 'manual') ? 3 : 2, 'O Bolinho guia até uma casa com sopa. Depois ele sai sozinho.')
        return fechar(e, 'cao')
      }
      if (id === 'rifle') {
        const alvo = sorteia(rng, dentros(e))
        if (alvo) ferir(e, alvo, 'Um bandido acerta um tiro. O Bolinho foge e não volta.')
        return fechar(e, 'cao')
      }
      // machado: enfrenta dois bandidos com o cão; 4 água (ou 2, sorteio 50%, sem probabilidade na fonte)
      darItem(e, 'agua', rng.chance(0.5) ? 4 : 2, 'O Bolinho ajuda a espantar dois bandidos. Eles deixam garrafas para trás.')
      andar(e, 'cao', 4)
    },
  },
  {
    id: 'cao_4', peso: () => 3,
    quando: (e) => passo(e, 'cao') === 4 && !sharikov(e),
    texto: () => 'O Bolinho volta ferido a tiros, mancando. Pede remédio com o olhar.',
    escolhas: (e) => [
      {id: 'kit', texto: 'dar o kit médico', requer: (e) => tem(e, 'kit')},
      {id: 'nada', texto: 'não ajudar'},
    ],
    resolver: (e, id) => {
      fechar(e, 'cao')
      if (id === 'kit') {
        tirarItem(e, 'kit', 1, 'O Bolinho se recupera e fica com a família. Ninguém coma ele.')
        e.flags['visitante.pancake'] = true
        return
      }
      anotar(e, 'A família enterra o Bolinho perto da casa.')
    },
  },
]

// ---------------------------------------------------------------- 10. Mutação (Juju)
const MUTACAO = [
  {
    id: 'mutacao_1', peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Aranhas mutantes invadem o abrigo, pelo ralo e pela despensa.',
    escolhas: (e) => [
      {id: 'spray', texto: 'espirrar o inseticida', requer: (e) => tem(e, 'inseticida')},
      {id: 'manual', texto: 'usar o manual do escoteiro para espantar', requer: (e) => tem(e, 'manual')},
      {id: 'kit', texto: 'achar que é alucinação', requer: (e) => tem(e, 'kit')},
      {id: 'nada', texto: 'esmagar com as mãos'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'spray') { tirarItem(e, 'inseticida', 1, 'As aranhas somem. Ainda sobra uma lata de sopa de presente.'); return darItem(e, 'sopa', 1, 'Uma lata de sopa, achada na pia.') }
      if (id === 'manual') {
        if (rng.chance(0.5)) darItem(e, 'sopa', 1, 'As aranhas somem e deixam uma lata de sopa.') // chance não informada: 50%
        else darItem(e, 'agua', 1, 'As aranhas somem e deixam uma garrafa de água.')
        return mordida(e, rng, 'Uma aranha morde a filha no meio da confusão. Ela não fica igual.')
      }
      if (id === 'kit') return anotar(e, 'A família acha que foi alucinação. Nada aconteceu.')
      if (rng.chance(0.5)) cansar(e, sorteia(rng, dentros(e)) ?? 'pai', 2, 'Esmagar aranha cansa.') // chance não informada: 50%
      mordida(e, rng, 'Uma aranha morde a filha ao ser esmagada. Ela começa a sorrir o tempo todo.')
    },
  },
  {
    id: 'mutacao_2', peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Baratas mutantes se espalham pela cozinha. Ninguém quer encostar nelas.',
    escolhas: (e) => [
      {id: 'inseticida', texto: 'espirrar o inseticida', requer: (e) => tem(e, 'inseticida')},
      {id: 'manual', texto: 'esmagar com o manual', requer: (e) => tem(e, 'manual')},
      {id: 'nada', texto: 'deixar as baratas'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'inseticida') return tirarItem(e, 'inseticida', 1, 'As baratas morrem. A cozinha fica com cheiro de limão.')
      if (id === 'manual') return anotar(e, 'As baratas são esmagadas, uma por uma.')
      if (rng.chance(0.5)) adoecer(e, sorteia(rng, dentros(e)) ?? 'pai', 'Alguém passa mal depois de tocar nas baratas.') // chance não informada: 50%
      anotar(e, 'As baratas se espalham pelo abrigo.')
    },
  },
  {
    id: 'mutacao_3', peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Um cano pinga uma coisa verde que come a mesa e a cadeira. A família precisa decidir o que fazer.',
    escolhas: (e) => [
      {id: 'mala', texto: 'tapar com a mala', requer: (e) => tem(e, 'mala')},
      {id: 'manual', texto: 'tapar com o manual', requer: (e) => tem(e, 'manual')},
      {id: 'nada', texto: 'ignorar o vazamento'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'mala') return quebrarItem(e, 'mala', 'O vazamento para, mas a mala fica destruída.')
      if (id === 'manual') return tirarItem(e, 'manual', 1, 'O vazamento é tapado com o manual, que vira papa.')
      mordida(e, rng, 'Algo acontece com a filha enquanto o vazamento come o chão. Ela acorda com outro jeito.')
    },
  },
  {
    id: 'mutacao_4', peso: () => 2,
    quando: (e) => ehMutante(e) && dentro(e, 'filha'),
    texto: () => 'A filha, agora mutante, de pele roxa, senta na mesa e sorri. Ela quer conversar.',
    escolhas: () => [
      {id: 'sim', texto: 'conversar com ela'},
      {id: 'nao', texto: 'ignorar'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'sim') {
        if (conta(e, ch('mutacao.conversas')) === 1) {
          if (rng.chance(0.5)) return sair(e, 'filha', 'mutante', 'Ela sai no meio da conversa, sorrindo.') // chance não informada: 50%
          const alvo = sorteia(rng, dentros(e).filter((id) => id !== 'filha'))
          if (alvo) ferir(e, alvo, 'Ela grita e ataca. Alguém se machuca.')
          return
        }
        return matar(e, 'filha', 'fora do abrigo', 'Na segunda conversa ela sai e persegue alguém lá fora. Não volta.')
      }
      abalar(e, 10, 'Ninguém responde. Na manhã seguinte, a porta quebrada e a filha sumiram.')
      sair(e, 'filha', 'sumiu', 'A filha sumiu.')
    },
  },
]

// ---------------------------------------------------------------- 11. Ferimentos e agonia
const FERIDA = [
  {
    id: 'ferida_1', peso: () => 1,
    quando: (e) => dentro(e, 'filha') && !pessoa(e, 'filha').ferido && !pessoa(e, 'filha').doente && !e.flags[ch('ferida.filha')],
    texto: () => 'A filha volta de uma expedição com um ferimento no antebraço, parecido com mordida.',
    escolhas: (e) => [
      {id: 'machado', texto: 'aquecer o machado e limpar a ferida', requer: (e) => tem(e, 'machado')},
      {id: 'kit', texto: 'usar o kit médico', requer: (e) => tem(e, 'kit')},
      {id: 'nada', texto: 'deixar como está'},
    ],
    resolver: (e, id) => {
      e.flags[ch('ferida.filha')] = true
      if (id === 'machado') { quebrarItem(e, 'machado', 'A lâmina quente limpa a ferida. O machado racha.'); return curar(e, 'filha', 'A ferida melhora no dia seguinte.') }
      if (id === 'kit') { tirarItem(e, 'kit', 1, 'Curativo e remédio. A ferida fecha.'); return curar(e, 'filha', 'Juju respira mais aliviada.') }
      adoecer(e, 'filha', 'A infecção piora. Juju fica pálida.')
    },
  },
  {
    id: 'ferida_2', peso: () => 1,
    quando: (e) => dentro(e, 'mae') && !pessoa(e, 'mae').ferido && !pessoa(e, 'mae').doente && !e.flags[ch('ferida.mae')],
    texto: () => 'Celeste tem um arranhão na perna, de expedição sem kit. Ela diz que não é nada.',
    escolhas: (e) => [
      {id: 'machado', texto: 'aquecer o machado e limpar', requer: (e) => tem(e, 'machado')},
      {id: 'kit', texto: 'usar o kit médico', requer: (e) => tem(e, 'kit')},
      {id: 'nada', texto: 'deixar para depois'},
    ],
    resolver: (e, id) => {
      e.flags[ch('ferida.mae')] = true
      if (id === 'machado') { quebrarItem(e, 'machado', 'O machado esquenta e limpa o arranhão.'); return curar(e, 'mae', 'A infecção melhora.') }
      if (id === 'kit') { tirarItem(e, 'kit', 1, 'Curativo, e a perna fica melhor.'); return curar(e, 'mae', 'Celeste sorri pela primeira vez.') }
      adoecer(e, 'mae', 'A infecção se espalha. Celeste fica doente.')
    },
  },
  {
    id: 'ferida_3', peso: () => 3,
    quando: (e) => !!agonizante(e),
    texto: (e) => {
      const p = agonizante(e)
      return `A ferida de ${p.nome} infeccionou. Sem remédio, o que resta é a agonia.`
    },
    escolhas: (e) => [
      {id: 'kit', texto: 'usar o kit médico', requer: (e) => tem(e, 'kit')},
      {id: 'nada', texto: 'não tratar'},
    ],
    resolver: (e, id) => {
      const p = agonizante(e)
      if (!p) return
      if (id === 'kit') { tirarItem(e, 'kit', 1, `${p.nome} é tratado(a) a tempo.`); return curar(e, p.id, `${p.nome} se recupera.`) }
      if (p.id === 'pai') return matar(e, 'pai', 'agonia', `${p.nome} morre na cama, da infecção.`)
      if (p.id === 'mae') return matar(e, 'mae', 'agonia', `${p.nome} morre, sem remédio.`)
      if (p.id === 'filha') return sair(e, 'filha', 'agonia', 'Juju deixa um bilhete e sai para o Canadá.')
      sair(e, 'filho', 'agonia', 'Tico deixa um bilhete e sai para ser senhor da guerra.')
    },
  },
]

// ---------------------------------------------------------------- 12. Saídas por loucura (automáticas)
// Limite de loucura = 80 (a fonte diz "muitos dias", sem número).
const LOUCURA = 80
const SAIDA = [
  {
    id: 'saida_loucura_1', automatico: true, peso: () => 1,
    quando: (e) => dentro(e, 'pai') && pessoa(e, 'pai').loucura >= LOUCURA,
    texto: (e) => `${nome(e, 'pai')} segue o conselho de um fantoche de meia e fala sozinho.`,
    escolhas: () => [{id: 'ok', texto: 'deixar ir'}],
    resolver: (e) => sair(e, 'pai', 'loucura', `${nome(e, 'pai')} sai pela porta e não volta.`),
  },
  {
    id: 'saida_loucura_2', automatico: true, peso: () => 1,
    quando: (e) => dentro(e, 'mae') && pessoa(e, 'mae').loucura >= LOUCURA,
    texto: (e) => `${nome(e, 'mae')} deixa um bilhete para "procurar o que perdeu".`,
    escolhas: () => [{id: 'ok', texto: 'ler o bilhete'}],
    resolver: (e) => matar(e, 'mae', 'loucura', `${nome(e, 'mae')} sai e não volta. Lá fora, ninguém a encontra.`),
  },
  {
    id: 'saida_loucura_3', automatico: true, peso: () => 1,
    quando: (e) => dentro(e, 'filho') && pessoa(e, 'filho').loucura >= LOUCURA,
    texto: (e) => `${nome(e, 'filho')} aparece na porta com uma capa de papel. Diz que vai ser herói do deserto.`,
    escolhas: () => [{id: 'ok', texto: 'desejar boa sorte'}],
    resolver: (e) => sair(e, 'filho', 'loucura', `${nome(e, 'filho')} sai e não volta.`),
  },
  {
    id: 'saida_loucura_4', automatico: true, peso: () => 1,
    quando: (e) => dentro(e, 'filha') && pessoa(e, 'filha').loucura >= LOUCURA,
    texto: (e) => `${nome(e, 'filha')} diz que vai à aula de tuba semanal. Ninguém lembra de aula de tuba.`,
    escolhas: () => [{id: 'ok', texto: 'deixar ir'}],
    resolver: (e) => sair(e, 'filha', 'loucura', `${nome(e, 'filha')} sai e não volta.`),
  },
]

// ---------------------------------------------------------------- 13. Carro (o pai)
const CARRO = [
  {
    id: 'carro_1', peso: () => 1,
    quando: (e) => (passo(e, 'carro') ?? 1) === 1 && dentro(e, 'pai'),
    texto: (e) => `${nome(e, 'pai')} achou as chaves do carro e quer ver se ele ainda anda.`,
    escolhas: () => [
      {id: 'sim', texto: 'deixar ir'},
      {id: 'nao', texto: 'impedir'},
    ],
    resolver: (e, id) => {
      if (id === 'nao') return enlouquecer(e, 'pai', 10, `${nome(e, 'pai')} fica irritado de ser contrariado.`)
      sair(e, 'pai', 'carro', `${nome(e, 'pai')} sai com as chaves no bolso.`)
      esperar(e, 'carro', 3)
      andar(e, 'carro', 2)
    },
  },
  {
    id: 'carro_2', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'carro') === 2 && pronto(e, 'carro') && !!pessoa(e, 'pai')?.vivo && !dentro(e, 'pai'),
    texto: (e) => `Barulhos lá fora. Faz dias que ${nome(e, 'pai')} saiu de carro e não volta.`,
    escolhas: () => [
      {id: 'procurar', texto: 'ir procurar'},
      {id: 'nao', texto: 'não ir'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'procurar') {
        voltar(e, 'pai', `${nome(e, 'pai')} foi achado desmaiado numa vala, cheirando a sopa e álcool. Invadiu um churrasco de sacoleiros.`)
        darItem(e, 'sopa', 2, 'Duas latas de sopa que ele roubou.')
        return fechar(e, 'carro')
      }
      fechar(e, 'carro')
      // a fonte marca a morte como não confirmada: 50%
      if (rng.chance(0.5)) matar(e, 'pai', 'carro', 'Ninguém sabe o que aconteceu com o pai lá fora.')
      else sair(e, 'pai', 'sumiu', 'O pai some de vez.')
    },
  },
]

// ---------------------------------------------------------------- 14. Sinal do Timmy (Tico)
const SINAL = [
  {
    id: 'sinal_timmy_1', peso: () => 1,
    quando: (e) => (passo(e, 'sinal_timmy') ?? 1) === 1 && e.dia >= 5 && dentro(e, 'filho'),
    texto: (e) => `${nome(e, 'filho')} vê uma sequência de luzes no horizonte. Quer mandar um recado.`,
    escolhas: (e) => [
      {id: 'manual', texto: 'pegar o manual do escoteiro', requer: (e) => tem(e, 'manual')},
      {id: 'nada', texto: 'deixar pra lá'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') return anotar(e, 'Tico volta a brincar com a bola.')
      andar(e, 'sinal_timmy', 2)
      anotar(e, 'Tico escreve uma mensagem curta, com a letra mais caprichada que já se viu.')
    },
  },
  {
    id: 'sinal_timmy_2', peso: () => 2,
    quando: (e) => passo(e, 'sinal_timmy') === 2 && dentro(e, 'filho'),
    texto: (e) => `${nome(e, 'filho')} quer transmitir a mensagem do alto de um caminhão. Precisa de um meio para isso.`,
    escolhas: (e) => [
      {id: 'radio', texto: 'usar o rádio', requer: (e) => tem(e, 'radio')},
      {id: 'gaita', texto: 'usar a gaita (não confirmado na fonte)', requer: (e) => tem(e, 'gaita')},
      {id: 'lanterna', texto: 'usar a lanterna (não confirmado na fonte)', requer: (e) => tem(e, 'lanterna')},
      {id: 'nada', texto: 'desistir'},
    ],
    resolver: (e, id) => {
      fechar(e, 'sinal_timmy')
      if (id === 'nada') return anotar(e, 'Tico desiste. A mensagem fica no bolso.')
      anotar(e, 'Tico sobe no caminhão, transmite a mensagem e volta. A família espera o resto.')
    },
  },
]

// ---------------------------------------------------------------- 15. Veículo (multi-partida, aqui em uma partida, um passo por dia)
const VEICULO = [
  {
    id: 'veiculo_1', peso: () => 1,
    quando: (e) => (passo(e, 'veiculo') ?? 1) === 1 && e.dia >= 4,
    texto: () => 'Uma expedição acha um veículo meio enterrado: um caminhão de sorvete, ou um carro-tanque. Dá para mandar alguém olhar.',
    escolhas: (e) => [...mandar(e), {id: 'nada', texto: 'não enviar ninguém'}],
    resolver: (e, id) => {
      if (id === 'nada') return anotar(e, 'Ninguém vai. O veículo continua lá, pensando.')
      e.flags[ch('veiculo.tipo')] = id === 'pai' || id === 'mae' ? 'tanque' : 'sorvete' // tipo depende de quem vai (fonte)
      ida(e, id, 'A pessoa volta com desenhos do veículo. É um começo.')
      andar(e, 'veiculo', 2)
    },
  },
  {
    id: 'veiculo_2', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'veiculo') === 2 && pronto(e, 'veiculo'),
    texto: () => 'Hora de reforçar o veículo: grades de metal, chapas ou estacas de madeira.',
    escolhas: () => [
      {id: 'lanterna', texto: 'usar a lanterna nas grades', requer: (e) => tem(e, 'lanterna')},
      {id: 'mascara', texto: 'usar a máscara como chapa', requer: (e) => tem(e, 'mascara')},
      {id: 'machado', texto: 'fazer estacas com o machado', requer: (e) => tem(e, 'machado')},
      {id: 'nada', texto: 'não reforçar'},
    ],
    resolver: (e, id) => {
      if (id === 'lanterna') tirarItem(e, 'lanterna', 1, 'As grades ficam firmes.')
      if (id === 'mascara') tirarItem(e, 'mascara', 1, 'A máscara vira chapa de metal.')
      if (id === 'machado') { quebrarItem(e, 'machado', 'O machado racha nas estacas.'); abalar(e, -10, 'As estacas dão um pouco de paz.') }
      andar(e, 'veiculo', 3)
    },
  },
  {
    id: 'veiculo_3', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'veiculo') === 3 && pronto(e, 'veiculo'),
    texto: () => 'Armar o veículo: um canhão improvisado, uma metralhadora ou nada.',
    escolhas: () => [
      {id: 'mapa', texto: 'montar um canhão com o mapa', requer: (e) => tem(e, 'mapa')},
      {id: 'cadeado', texto: 'montar uma metralhadora com o cadeado', requer: (e) => tem(e, 'cadeado')},
      {id: 'nada', texto: 'não armar'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'mapa') {
        tirarItem(e, 'mapa', 1, 'O canhão está pronto, mas todo mundo fica cansado.')
        for (const p of noAbrigo(e)) cansar(e, p.id, 2)
        const alvo = sorteia(rng, dentros(e))
        if (alvo) ferir(e, alvo, `${nome(e, alvo)} se fere no recuo do canhão.`)
      }
      if (id === 'cadeado') tirarItem(e, 'cadeado', 1, 'A metralhadora fica no teto, presa pelo cadeado.')
      andar(e, 'veiculo', 4)
    },
  },
  {
    id: 'veiculo_4', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'veiculo') === 4 && pronto(e, 'veiculo'),
    texto: () => 'Decorar o veículo. Bandeiras, ossos ou grafite. Ninguém sabe o que decora mais.',
    escolhas: () => [
      {id: 'rifle', texto: 'pendurar bandeiras no rifle', requer: (e) => tem(e, 'rifle')},
      {id: 'mala', texto: 'pendurar ossos na mala', requer: (e) => tem(e, 'mala')},
      {id: 'inseticida', texto: 'pintar grafite com o spray', requer: (e) => tem(e, 'inseticida')},
      {id: 'nada', texto: 'não decorar'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'rifle') tirarItem(e, 'rifle', 1, 'As bandeiras tremulam no capô.')
      if (id === 'mala') {
        quebrarItem(e, 'mala', 'Os ossos ficam presos na mala, que vira um enfeite inútil.')
        if (rng.chance(0.5)) adoecer(e, sorteia(rng, dentros(e)) ?? 'pai', 'Alguém passa mal de tanto cheiro de osso.') // chance não informada: 50%
      }
      if (id === 'inseticida') tirarItem(e, 'inseticida', 1, 'O grafite fica bonito, e a família sente um pouco de orgulho.')
      andar(e, 'veiculo', 5)
    },
  },
  {
    id: 'veiculo_5', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'veiculo') === 5 && pronto(e, 'veiculo'),
    texto: () => 'Trocar as rodas. A gaita ou o manual podem ajudar, mas nada garante que as rodas aguentam.',
    escolhas: () => [
      {id: 'gaita', texto: 'usar a gaita como roda', requer: (e) => tem(e, 'gaita')},
      {id: 'manual', texto: 'usar o manual como esteira', requer: (e) => tem(e, 'manual')},
      {id: 'nada', texto: 'manter as rodas velhas'},
    ],
    resolver: (e, id) => {
      if (id === 'gaita') tirarItem(e, 'gaita', 1, 'A gaita vira roda e some na estrada.')
      if (id === 'manual') {
        tirarItem(e, 'manual', 1, 'O manual vira esteira e é destruído.')
        for (const p of noAbrigo(e)) cansar(e, p.id, 2)
      }
      andar(e, 'veiculo', 6)
    },
  },
  {
    id: 'veiculo_6', peso: () => PESO_PRONTO,
    quando: (e) => passo(e, 'veiculo') === 6 && pronto(e, 'veiculo'),
    texto: () => 'O veículo está pronto. Precisa de cinco latas de sopa para dar a partida.',
    escolhas: (e) => [
      {id: 'ligar', texto: 'ligar o veículo com cinco latas', requer: (e) => (e.itens.sopa ?? 0) >= 5},
      {id: 'nada', texto: 'esperar um pouco mais'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { esperar(e, 'veiculo', 2); return anotar(e, 'Ainda não tem como ligar.') }
      tirarItem(e, 'sopa', 5, 'Cinco latas de sopa viram combustível.')
      terminar(e, 'veiculo', 'vitoria', 'veículo', 'O motor pega. Saímos daqui. Quem achar o abrigo pode ficar.')
    },
  },
]

// ---------------------------------------------------------------- 16. Visitantes recorrentes (V1, V2, V10)
const VISITANTES = [
  {
    id: 'visitante_seis_bracos', unico: true, peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Um grupo de mutantes de muitos braços bate pedindo uma lata de sopa. Dizem que, se ajudarem, vão proteger a casa depois.',
    escolhas: (e) => [
      {id: 'sopa', texto: 'dar uma lata de sopa', requer: (e) => tem(e, 'sopa')},
      {id: 'nada', texto: 'fechar a porta'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') return anotar(e, 'Os braços somem pela rua. A porta fica fechada.')
      tirarItem(e, 'sopa', 1, 'Os Braçudos comem a sopa em silêncio e ficam de aliados.')
      e.flags['visitante.seis_bracos'] = true
    },
  },
  {
    id: 'visitante_caco', unico: true, peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Caco, um catador de pedras, bate na porta perguntando se a família quer comprar uma pedra.',
    escolhas: () => [
      {id: 'sim', texto: 'aceitar a pedra'},
      {id: 'nao', texto: 'não'},
    ],
    resolver: (e, id) => {
      if (id === 'nao') return anotar(e, 'Caco dá de ombros e vai embora.')
      e.flags['visitante.caco'] = 'pedra'
      anotar(e, 'Caco dá a primeira pedra de graça, diz que traz sorte, e vai embora.')
    },
  },
  {
    id: 'visitante_caco_volta', peso: () => 4,
    quando: (e) => e.flags['visitante.caco'] === 'pedra' && noAbrigo(e).some((p) => p.semBeber >= 2),
    texto: () => 'Caco voltou, com um galão de água nas costas. Alguém da casa está morrendo de sede.',
    escolhas: () => [{id: 'aceitar', texto: 'receber o galão'}],
    resolver: (e) => {
      e.flags['visitante.caco'] = 'volto'
      darItem(e, 'agua', 1, 'O galão de água chega na hora certa. Caco não cobra nada.')
    },
  },
  {
    id: 'visitante_medicos', unico: true, peso: () => 1,
    quando: (e) => !e.flags['visitante.medicos'] && e.dia >= 3,
    texto: () => 'A Clínica Ambulante chega, de jaleco branco e prancheta. Pedem uma garrafa de água, para a limpeza.',
    escolhas: (e) => [
      {id: 'agua', texto: 'dar uma garrafa de água', requer: (e) => tem(e, 'agua')},
      {id: 'nada', texto: 'não dar nada'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') { e.flags['visitante.medicos'] = 'foram'; return anotar(e, 'Os médicos vão embora. Eram farsantes, pelo jeito.') }
      tirarItem(e, 'agua', 1, 'Uma garrafa de água vai para a pia da clínica.')
      e.flags['visitante.medicos'] = 'voltam'
      e.flags['visitante.medicos.ate'] = e.dia + 30
      anotar(e, 'Os médicos prometem voltar em um mês.')
    },
  },
  {
    id: 'visitante_medicos_volta', peso: () => 4,
    quando: (e) => e.flags['visitante.medicos'] === 'voltam' && e.dia >= (e.flags['visitante.medicos.ate'] ?? 0)
      && noAbrigo(e).some((p) => p.doente),
    texto: () => 'A Clínica Ambulante volta, com injeções. Tem alguém doente na casa.',
    escolhas: () => [{id: 'ok', texto: 'receber as injeções'}],
    resolver: (e) => {
      e.flags['visitante.medicos'] = 'curou'
      const doente = noAbrigo(e).find((p) => p.doente)
      if (doente) curar(e, doente.id, `${doente.nome} recebe a injeção e a cor volta ao rosto.`)
      abalar(e, -10, 'Até as cores parecem mais vivas por um dia.')
    },
  },
]

// ---------------------------------------------------------------- 17. Avulsos da seção 4 (comércio e automáticos)
const AVULSOS = [
  comercio('com_1', (e) => e.dia >= 2, 'Um homem com carrinho de mão cheio de tudo quer trocar algo.', {
    baralho: ['agua', 1], inseticida: ['agua', 1], manual: ['agua', 2], lanterna: ['agua', 1],
  }),
  comercio('com_2', (e) => e.dia >= 2, 'Uma mulher com um camelo de cinco patas quer fazer negócio.', {
    damas: ['agua', 1], radio: ['agua', 4], kit: ['agua', 2],
  }),
  comercio('com_3', (e) => e.dia >= 2, 'Seu Valdomiro, o comerciante de sempre, tem umas trocas para a família.', {
    baralho: ['sopa', 1], damas: ['agua', 1], mascara: ['sopa', 2], rifle: ['agua', 4],
  }),
  comercio('com_4', (e) => e.dia >= 2, 'Um negociante ruivo, com dois guarda-costas, oferece as trocas da lista (a mesma de Seu Valdomiro).', {
    baralho: ['sopa', 1], damas: ['agua', 1], mascara: ['sopa', 2], rifle: ['agua', 4],
  }),
  {
    id: 'com_5', grupo: 'porta', unico: true, peso: () => 1,
    quando: (e) => e.dia >= 2,
    texto: () => 'Um negociante de munição bate na porta. Ele não tem o que vender, só quer ver o que a família tem.',
    // munição não existe em itens.mjs: a troca de munição e o roubo ficam de fora
    escolhas: (e) => [
      {id: 'damas', texto: 'dar o tabuleiro de damas', requer: (e) => tem(e, 'damas')},
      {id: 'baralho', texto: 'dar o baralho', requer: (e) => tem(e, 'baralho')},
      {id: 'nada', texto: 'recusar'},
    ],
    resolver: (e, id) => {
      if (id === 'nada') return anotar(e, 'Ele ajeita o chapéu e vai embora.')
      tirarItem(e, id, 1, `Dá ${ITENS[id].nome} e ele leva. Nada em troca.`)
    },
  },
  {
    id: 'com_6', grupo: 'porta', peso: () => 1,
    quando: (e) => faltando(e).length >= 2,
    texto: () => 'Umas meninas escoteiras vendem biscoitos. Dizem que a família perdeu muita coisa, e oferecem o que faltar.',
    escolhas: () => [
      {id: 'aceitar', texto: 'aceitar o pacote'},
      {id: 'recusar', texto: 'recusar'},
    ],
    resolver: (e, id, rng) => {
      if (id === 'recusar') return anotar(e, 'As meninas vão para a casa seguinte.')
      const a = rng.escolher(faltando(e))
      darItem(e, a, 1, `Ganham ${ITENS[a].nome}.`)
      const b = faltando(e)
      if (b.length) { const extra = rng.escolher(b); darItem(e, extra, 1, `E mais ${ITENS[extra].nome}, de brinde.`) }
    },
  },
  {
    id: 'auto_1', automatico: true, peso: () => 1,
    quando: (e) => sharikov(e) && noAbrigo(e).length > 0,
    texto: () => 'O Mingau deixa um rato brilhante morto na porta. Ninguém quer tocar nele.',
    escolhas: () => [{id: 'ok', texto: 'seguir'}],
    resolver: (e, id, rng) => {
      const alvo = sorteia(rng, dentros(e))
      if (alvo) adoecer(e, alvo, `${nome(e, alvo)} passa mal depois de mexer no rato.`)
    },
  },
  {
    id: 'auto_2', automatico: true, peso: () => 1,
    quando: (e) => sharikov(e),
    texto: () => 'O Mingau mostra um tesouro escondido atrás de um tijolo.',
    escolhas: () => [{id: 'ok', texto: 'pegar o tesouro'}],
    // a fonte tem munição; fora do catálogo, o tesouro é mapa ou inseticida
    resolver: (e, id, rng) => {
      const item = rng.escolher(['mapa', 'inseticida'])
      darItem(e, item, 1, `Atrás do tijolo tem ${ITENS[item].nome}.`)
    },
  },
  {
    id: 'auto_3', automatico: true, peso: () => 1,
    quando: (e) => sharikov(e) && dentro(e, 'pai') && !pessoa(e, 'pai').doente,
    texto: (e) => `${nome(e, 'pai')} começa a espirrar sem parar. O gato, de novo.`,
    escolhas: () => [{id: 'ok', texto: 'seguir'}],
    resolver: (e) => adoecer(e, 'pai', `${nome(e, 'pai')} fica doente de alergia.`),
  },
]

// ---------------------------------------------------------------- exportação
const CRU = [
  ...MILITAR, ...BANDIDOS, ...RADIO_ESPACO, ...GEMEOS, ...LADO_SOMBRIO, ...GATOS, ...CIENTISTA,
  ...GATOS_FINAL, ...CAO, ...MUTACAO, ...FERIDA, ...SAIDA, ...CARRO, ...SINAL, ...VEICULO,
  ...VISITANTES, ...AVULSOS,
]

// valores padrão: grupo 'cadeia', peso 1, sem única, sem automático
export const EVENTOS = CRU.map((ev) => ({
  grupo: ev.id.startsWith('com_') || ev.id.startsWith('visitante_') || ev.id.startsWith('auto_') ? 'porta' : 'cadeia',
  peso: () => 1,
  automatico: false,
  ...ev,
}))
