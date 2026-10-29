# Extras do replay 3D (replay.mjs)

Cada recurso visual do replay (animação dos bonecos, item na mão, blocos quebrando...) tem duas partes:

## 1. Módulo no Node: `extras/<nome>.mjs`
Carregado pelo `replay.mjs` (em ordem alfabética). Pode exportar:

- `preparar(dados)` — chamado uma vez, antes de filmar. `dados`:
  - `DIR` (pasta da gravação), `t0`, `t1` (trecho filmado, em segundos da partida)
  - `posicoes`: `{ nome: [{t, n, x, y, z, yaw, pitch, v (vida), f (fome), mao (item na mão), arm: [capacete, peito, calça, bota]}] }`
    (um registro a cada ~0,25 s, ordenado por t)
  - `blocos`: `[{t, x, y, z, s (stateId novo), b (nome do bloco novo)}]` ordenado por t (cada IA grava o que vê: há repetições)
  - `mobsPorBot`: por IA, `[{t, l: [{id, m (tipo: zombie, item, creeper...), x, y, z, yaw}]}]` (a cada ~0,5 s)
  - `eventos`: todos os eventos (`decisao` com pensamento/acao/args/obs, `resultado`, `dano` {quem, vida, de}, `morte` {quem}, `servidor` {msg}...)
  - `interp(lista, t)`: posição interpolada; `registro`: prismarine-registry 1.21.4; `NOMES_IA`
- `noQuadro(t, ctx)` — chamado em cada quadro; devolve um objeto que é juntado com o dos outros extras e entregue à página.
  `ctx`: `{ fps, camera, modo, seguido (nome da IA seguida), primeira (câmera em 1ª pessoa), posJogador(nome, t) }`.
  Use chaves com o nome do seu recurso pra não colidir (ex.: `{ anim: {...} }`).
- `ajustarJogador(nome, t, p)` — opcional: troca a posição do jogador (devolva outro objeto) ou esconde (devolva `null`).

## 2. Script na página: `pagina/<nome>.js`
Injetado no Chromium antes do viewer. Registre uma função: `window.__extras.push(extra => { ... })`.
Ela roda em todo quadro, logo antes do desenho, com o objeto juntado dos `noQuadro`.

No navegador há: `window.THREE` (three.js), `window.__v` (o Viewer: `__v.scene`, `__v.camera`,
`__v.entities.entities[id]` = Object3D de cada entidade: `'p_<Nome>'` para as IAs, `'m_<id>'` para mobs),
`window.__ossos[tipo]` = `{ nomeDoOsso: índice }` (índice em `skinnedMesh.skeleton.bones`; tipos: `ia_<Nome>`, `player`,
`zombie`, `skeleton`, `creeper`, `spider`...). O SkinnedMesh do modelo é `entidade.children.find(c => c.isSkinnedMesh)`.
Escala do modelo: 1/16 (as coordenadas dos ossos são em pixels do modelo). Texturas oficiais: `/tex/item/<nome>.png`,
`/tex/block/<nome>.png`, `/tex/block/destroy_stage_<0-9>.png`, `/tex/gui/...`.

## Testar
```
cd minecraft
GL=llvmpipe RAIO=2 node replay.mjs gravacoes/partida1 /caminho/teste.mp4 <t_ini> <t_fim> segue:<Nome> 30 960 540
ffmpeg -v error -y -i /caminho/teste.mp4 -vf "fps=2,scale=480:270,tile=4x2" -frames:v 1 /caminho/folha.png
```
(`DEBUG_REPLAY=1` mostra o console da página, inclusive erros `[extra]`.)

## Primeira pessoa (`40_primeira`)
Com a câmera `olhos:<Nome>`, a página desenha por cima do mundo o braço direito (skin da IA) ou o item na mão
(itens extrudados pixel a pixel, blocos como cubo), com as contas do ItemInHandRenderer do jogo, e aplica FOV 70,
olhos a 1,62, balanço ao andar (bobView) e a inclinação de dano/morte. A mira fica no Remotion (`AberturaMC`).
O `replay.mjs` chama `window.__depois(renderer)` logo depois de desenhar o mundo.
