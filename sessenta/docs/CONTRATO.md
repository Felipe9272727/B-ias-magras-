# Contrato do enxame (60 Segundos das IAs)

Leia também ARQUITETURA.md. Todo o código fica em /home/user/B-ias-magras-/sessenta/ (Node ESM, sem dependências).

## Estado
`sessenta/estado.mjs` define o estado da fase do abrigo (`criarEstado`) e as ÚNICAS funções para alterá-lo:
`anotar, darItem, tirarItem, quebrarItem, adoecer, curar, ferir, cansar, enlouquecer, matar, sair, voltar, terminar`
e consultas `pessoa, noAbrigo, vivos, tem, adultosVivos, nome`. Cada efeito recebe um texto para o diário.
`estado.flags` é livre para guardar o passo das cadeias (prefixe a chave com o nome do seu módulo, ex. `militar.passo`).
`estado.rng.eventos/expedicao/estados/geral` são os sorteios (use sempre estes, nunca Math.random).
Pessoas: `pai, mae, filha, filho` (nomes em familia.mjs). Itens: chaves de itens.mjs.

## Evento (sessenta/eventos/*.mjs exportam `export const EVENTOS = [...]`)
```js
{
  id: 'baratas_mutantes',
  grupo: 'porta' | 'abrigo' | 'radio' | 'expedicao' | 'cadeia',
  quando: (e) => boolean,             // pode aparecer hoje? (dia, itens, flags, pessoas)
  peso: (e) => number,                // chance relativa no sorteio do dia (cadeias com passo pendente podem forçar com peso alto)
  unico?: true,                       // só uma vez por partida
  texto: (e) => string,               // situação, 1-3 frases, português, com NOSSAS palavras, usando nome(e, 'pai') etc.
  escolhas: (e) => [{id, texto, requer?: (e) => boolean}],  // a IA escolhe uma; requer false = não aparece
  resolver: (e, escolhaId, rng) => void,  // aplica os efeitos com as funções de estado.mjs (todas anotam no diário)
}
```
- Eventos de "escolher alguém"/"mandar alguém": as escolhas são as pessoas disponíveis (`noAbrigo(e)`), id = id da pessoa.
- Eventos de item: a escolha "usar X" tem `requer: (e) => tem(e, 'X')`; sempre inclua uma escolha sem item (ex.: "ignorar").
- Chances: use `rng.chance(p)`; se a fonte não diz, use 50% e comente `// chance não informada na fonte`.

## Final (sessenta/finais.mjs exporta `export const FINAIS = [...]`)
`{ id, tipo: 'vitoria'|'derrota'|'ambiguo', checar: (e) => motivo|null }` — o motor chama todo fim de dia.
Finais que acontecem DENTRO de um evento usam `terminar(e, id, tipo, motivo, texto)`.

## Textos
Português do Brasil, frases curtas e com humor leve (é um vídeo do YouTube). NUNCA copie frases do jogo nem da wiki.
Não use os nomes originais dos personagens do jogo; para visitantes, crie nomes nossos.

## Teste
Cada módulo deve ter um teste rápido em sessenta/testes/<modulo>.test.mjs rodando com `node` (sem framework):
cria um estado com `criarEstado('teste', {pessoas: ['pai','mae','filha','filho'], itens: {sopa: 4, agua: 4, radio: 1, ...}})`,
roda/resolve os eventos e confere que nada quebra (`node sessenta/testes/<modulo>.test.mjs` deve imprimir OK).

## Git
NÃO faça commit (vários agentes trabalham ao mesmo tempo no mesmo diretório; o coordenador commita).
Só crie/edite os arquivos que o seu pedido manda.
