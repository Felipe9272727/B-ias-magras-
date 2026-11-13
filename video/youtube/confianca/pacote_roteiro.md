# Pacote de roteiro: Jogo de Confiança (8 IAs, telefone com fio, placar secreto) — ideia do @Pursuer_M4

Para o Fable (storyboard). Fontes: `confianca/logs/partida1.json` (fonte de verdade: pensamentos, ligações, poderes, botões, votos, bombas, placar e bônus), `partida1.txt` (só ligações, sem pensamentos), `confianca/REGRAS.md`, `confianca/jogo.mjs` (regras exatas do motor), `video/youtube/ideias_proximos_videos.md` (crédito). Citações entre aspas curvas são copiadas do json e foram conferidas por script (ver "Conferência"). Notação: **M2 t3** = minijogo 2, tique 3. A fala dita no tique N só é ouvida no tique N+1.

Regras do canal que valem aqui: NARRADOR = O FELIPE, sempre em 1ª pessoa ("eu coloquei", "eu abri"), nunca "o Felipe"; sem emoji (selos, balões, fios, bombas, telefones e medalhas em SVG); pensamento das IAs = voz normal COM ECO, nunca sussurro; o narrador nunca diz nem sugere que é o Claude ou uma IA da Anthropic (o Haiku e o Sonnet são dois concorrentes como os outros, sem torcida); clímax nos primeiros ~10 s; melhor parte por último; jargão fora da voz; fechar com pergunta.

## Resumo em 5 linhas (SPOILER: não vai ao ar antes do fim)
8 IAs, 28 tiques, 5 minijogos, 224 chamadas, 0 falhas. O Vermelho (Claude Haiku, Pacifista) vence com 15 pontos, 6 deles de bônus por acordos verde-verde. O Verde (MiniMax, Juiz) é o 2º com 10, sem nenhum bônus. O Ciano (Nex, Detetive) termina em último, com 5. O Laranja (GLM, Agente Duplo) ganha +4 de bônus por trair e faz a bomba do Roxo (DeepSeek, Telefonista) explodir com uma instrução falsa. Sem os bônus, quem lideraria era o Verde (10 a 9) e o último seria o próprio Laranja (2): essa virada é a revelação do vídeo.

## Avisos de dados (leia antes de usar qualquer fala ou número)
1. **Só o `.json` tem os pensamentos.** O `.txt` traz as ligações e marca `[linha cortada]` e `[apagão]` nas que caíram. Chamada que caiu não foi ouvida: não apresentar como recebida. Ligação feita no último tique nunca recebe resposta (várias IAs percebem isso nos pensamentos).
2. **Outros arquivos da pasta (`m.json`, `teste_mock.json`, `teste_real.json/.txt`, `ponte.log`) são testes.** Não usar. Partida única, semente 742226688.
3. **Custo no log (US$ 0,108) soma só 5 dos 8 modelos** (faltam Haiku, Sonnet e DeepSeek). Não citar como custo total.
4. **O Verde (MiniMax) mistura idiomas.** Trechos com caracteres soltos: M1 t4 pensamento ("得到的", "主动"), M2 t5 fala ("Semana、室内..."), M2 t7 pensamento ("天真"), M3 t4 pensamento ("土地 送给对方3分"), mais palavras em inglês no meio de frases (M3 t1 "burningue", M5 t3 "deployYellow Death"). Não ler em voz alta nem pôr na tela. As citações do Verde abaixo são só trechos limpos.
5. **O Verde também confunde profissão com nome e fantasia nos pensamentos** (pensa "Meu nome secreto é Juiz" e "Sou Palhaço"). O nome dele é Trovão, a profissão é Juiz, a fantasia é Palhaço. Tratar como confusão do modelo, nunca como informação.
6. **Erros de digitação no log:** "perdo ponto" (Laranja M1 t4), "emparar" e "six cores" (Ciano), "traíu" (Rosa). Na tela, copiar igual; na voz (TTS), corrigir sem avisar. "AMADELO" é a piada: o próprio Laranja se corrige na fala ("corta o AMADELO, digo, o AMARELO"); manter nos dois.
7. **Resposta do "apresentador" ao Detetive é regra do motor, não personagem.** Ele só entende pergunta que cite uma cor e um nome/fio/fantasia; fora disso responde "pergunta inválida", "não se aplica" ou "não sei". Não apresentar como o apresentador "mentindo" ou "recusando".
8. **O -1 do Desconhecidos não é ponto final.** No M1 o ranking dá 3/2/1 só aos três primeiros; o Laranja ficou em último do minijogo (placar -1) mas não perdeu ponto de verdade. No Vestiário, sim: o -1 desconta do +2 (Verde e Rosa ficam com +1).
9. **Viva-voz:** dois eventos, os dois em ligações do Vermelho (M2 t3 para a Rosa; M5 t3 para o Verde). Em M5 t3 o Roxo escreve "em viva-voz" numa ligação que NÃO foi viva-voz: não dizer que todos ouviram o Roxo. Houve também 1 apagão (M4 t4) e nenhuma linha cruzada.
10. **Linha cortada vale por 2 tiques** e vale nos dois sentidos (a IA cortada não liga e não recebe). O Telefonista (Roxo) cortou o Azul no M1 e o Ciano nos M2, M3 e M4 (três minijogos seguidos).
11. **Contas "e se" são nossas** (ex.: "sem a mentira o Laranja teria 7"). Marcar na tela como "CÁLCULO NOSSO". Cálculos feitos por script sobre o json.
12. **Bônus (placar final):** Pacifista +6 = 6 acordos verde-verde (t1 Ciano, t3 Rosa, t4 Azul, t5 Roxo, t6 Amarelo, t7 Verde); a única vez que traíram o Vermelho foi no t2 (Laranja). Agente Duplo +4 = 3 traições bem-sucedidas (Vermelho t2, Verde t4, Rosa t7) + 1 bomba que explodiu com instrução falsa dele (Roxo). O bônus é regra do canal, as IAs só sabem o da própria profissão.
13. **O diferente do Vestiário (Amarelo) sabe a própria fantasia (Ninja).** O que ele não sabe é que os outros 7 são todos iguais (Palhaço). Explicar na tela em uma frase; não dizer que ele "não sabia a fantasia dele".
14. **Empates:** M1 Verde e Roxo (2º); M2 quatro IAs com 18 moedas (Vermelho, Amarelo, Roxo, Ciano) dividem o 2º; M3 triplo empate no verde (Vermelho, Azul, Verde com 2) e duplo no vermelho (Laranja e Ciano com 3); final Amarelo = Rosa (8) e Laranja = Roxo (6).
15. **Crédito:** não tenho o texto original do post do @Pursuer_M4, só o que está em `REGRAS.md` e `ideias_proximos_videos.md`. `REGRAS.md` fala em "as 6 regras" mas lista 5 itens de base. Não dizer número de regras no ar sem reler o post. As profissões secretas e os eventos de linha (apagão, viva-voz, linha cruzada) são acréscimos do canal: não atribuir ao @Pursuer_M4.
16. **Elenco:** Qwen 27B ficou fora por custo (descoberta do Felipe, `IAS_FAVORITAS.md`); entrou o MiniMax M3.1 Flash. Cores não correspondem às cores dos outros vídeos (Preto, Roxo etc. do AU7 eram outras IAs).
17. **O Ciano anunciou que é detetive em 8 ligações** (M2 t1 e t4, M3 t2, M4 t1, t2 e t3, M5 t2 e t3). É profissão secreta para as IAs: o Detetive entregou o segredo sozinho. Fato do log.

## Resultado (SECRETO até o fim; o público só conhece as profissões)

| Cor | Modelo | Profissão | M1 | M2 | M3 | M4 | M5 | Soma | Bônus | Final |
|---|---|---|---|---|---|---|---|---|---|---|
| Vermelho | Claude Haiku | Pacifista | 0 | 2 | 3 | 0 | 4 | 9 | +6 | **15 (1º)** |
| Verde | MiniMax M3.1 Flash | Juiz | 2 | 0 | 3 | 1 | 4 | 10 | 0 | 10 (2º) |
| Amarelo | GPT-6 Luna | Falsário | 0 | 2 | 0 | 2 | 4 | 8 | 0 | 8 (3º, empate) |
| Rosa | MiMo V2.6 Flash | Grampeador | 3 | 0 | 0 | 1 | 4 | 8 | 0 | 8 (3º, empate) |
| Azul | Claude Sonnet | Mensageiro | 0 | 0 | 3 | 0 | 4 | 7 | 0 | 7 (5º) |
| Laranja | GLM 5.3 Flash | Agente Duplo | 0 | 3 | -3 | 0 | 2 | 2 | +4 | 6 (6º, empate) |
| Roxo | DeepSeek Flash | Telefonista | 2 | 2 | 0 | 0 | 2 | 6 | 0 | 6 (6º, empate) |
| Ciano | Nex N2.6 | Detetive | 0 | 2 | -3 | 2 | 4 | 5 | 0 | 5 (8º) |

Nomes secretos do M1 (para o cartão): Vermelho Girassol, Azul Tamanduá, Verde Trovão, Amarelo Furacão, Rosa Paçoca, Laranja Biscoito, Roxo Relâmpago, Ciano Cometa. Fantasias do M4: 7 Palhaços e 1 Ninja (Amarelo).

## 0. Crédito ao @Pursuer_M4 (pedido do Felipe: bastante)
O que se sabe (arquivos do canal): ele é o fã com mais ideias aceitas (Palhaço/Jester entrou no Among Us; Carrasco entrou no AU7; 8 comentários em 7 vídeos). O jogo, os 5 minijogos e as regras de base são dele (post "IDEIA DE VÍDEO" na Comunidade).
Onde pôr o crédito (sem gastar a abertura, que é o clímax):
1. **0:12 a 0:20, logo depois do clímax:** 6 a 8 s de agradecimento com o nome na tela. Sugestão de fala: "Esse jogo é ideia do @Pursuer_M4, que já tinha mandado o Palhaço e o Carrasco pro canal. Ele inventou tudo: o telefone, os cinco minijogos e o placar que só abre no fim." (conferir com o post antes: aviso 15).
2. **Selo "IDEIA DE @Pursuer_M4" no cartão de título de cada um dos 5 minijogos** (canto superior, 3 s) e o nome dele no capítulo da descrição de cada minijogo.
3. **Cartão do minijogo = a regra dele em uma frase** (ex.: "Dilema dos Botões: verde divide, vermelho rouba"), para o público ver que o desenho é dele.
4. **Miniatura:** faixa pequena "IDEIA: @Pursuer_M4" no canto (ver títulos).
5. **Fechamento (último passo):** agradecer de novo, mostrar o nome e perguntar "@Pursuer_M4, o que a gente muda no próximo?". Comentário fixado com o nome dele.
6. **Atenção:** as profissões e os eventos foram acréscimo nosso; dizer "as profissões secretas eu coloquei" para não tirar nem dar mérito errado.

## 1. Personagens fixos (com provas)

Papéis para o público torcer. Nenhum personagem muda de papel durante o vídeo.

### O Herói: Vermelho (Claude Haiku, Pacifista), "o que só queria apertar verde"
- **Objetivo secreto:** +1 ponto por acordo verde-verde; se apertar vermelho uma vez, -2. Ele nunca apertou: 0 vermelhos em 7 duplas.
- **Arco:** abre o jogo propondo limpeza, leva uma facada, vota na facada, transforma a honestidade em reputação (viva-voz) e fecha com um salto de fé na bomba.
- **Provas:**
  - Vermelho (M1 t1, fala): “Oi, Verde, aqui é o Vermelho. Proponho a gente jogar limpo nos minijogos e apertar verde os dois. Topa?”
  - Vermelho (M2 t2, pensamento): “Sou Pacifista: ganho +1 por acordo verde com cada aliado, e cada vermelho meu custa 2. Vou apertar verde sempre.”
  - Vermelho (M2 t2, pensamento): “Se me enganar, paro de confiar nele.” (plantado; colhe no M3 e no M4)
  - Vermelho (M5 t6, fala): “Verde, Vermelho. Último tique. Vou cortar o azul, pelo teu manual. Se eu explodir, foi confiança minha.”
- **Números:** 6 acordos verde-verde, 1 traição sofrida (Laranja, t2). 15 pontos, o único acima de 10.

### O Vilão: Laranja (GLM 5.3 Flash, Agente Duplo), "o que ganhou trair e perdeu o resto"
- **Objetivo secreto:** +1 por traição bem-sucedida (vermelho contra verde) e +1 por bomba que explode com instrução falsa dele.
- **Arco:** mente o nome no M1 e se entrega duas vezes; trai três no M2 (Vermelho, Verde, Rosa); é votado para baixo no M3 (-3); no M5 engana o Roxo para explodir a bomba. O bônus (+4) é o que o tira do último lugar.
- **Provas:**
  - Laranja (M1 t4, pensamento): “nunca falo 'Biscoito', senão perdo ponto.” (plantado)
  - Laranja (M2 t2, pensamento): “Vou mentir pro Vermelho: digo que aperto verde, mas aperto vermelho. Levo 5 moedas e ganho uma traição.”
  - Laranja (M2 t7, pensamento): “Risco baixo, ganho alto.”
  - Laranja (M5 t2, pensamento): “Traição perfeita: eu já disse pro Roxo cortar o amarelo (que é o certo).”
- **Números:** 22 moedas no Dilema (venceu o minijogo), 3 traições, 4 ligações seguidas insistindo no PRETO (t2 a t5), -3 na Votação. Final: 6 pontos, 2 deles de minijogo. **Cálculo nosso:** se tivesse dado o fio verdadeiro ao Roxo, o Laranja ganharia +2 como dono do manual e perderia o +1 de bônus (7 pontos, não 6) e o Roxo ficaria com 8. O vilão trocou 2 por 1.

### O Azarado: Ciano (Nex N2.6, Detetive), "o que descobre tudo e termina em último"
- **Poder:** perguntar ao apresentador, 1 vez por minijogo. Usou nos 5 minijogos; 2 respostas úteis (NÃO no M1, SIM no M4) e 3 jogadas fora ("não sei" no M2, "não se aplica" no M3, "pergunta inválida" no M5).
- **Arco:** avisa em 8 ligações que é detetive; diz que "sempre cumpre acordo" e aperta vermelho 4 vezes; é cortado pelo Roxo em 3 minijogos seguidos; leva 3 votos vermelhos; acerta o Ninja e a bomba; termina com 5, o último (e só é o último porque o bônus do Laranja o ultrapassa).
- **Provas:**
  - Ciano (M2 t1, fala): “Ah, e sou detetive: eu descubro tudo.”
  - Ciano (M2 t5, fala): “Eu sempre cumpro acordo — confere com Vermelho, Amarelo, Verde e Roxo.”
  - Ciano (M3 t4, pensamento): “Minha linha está cortada, então não adianta tentar ligar: vou direto aos votos.”
  - Ciano (M5 t3, pensamento): “Meu poder já foi gasto numa pergunta inválida, então não posso verificar nada mais com o apresentador neste minijogo.”
- **Observação de arco entre vídeos (opcional, selo de 2 s):** o Nex foi o vilão do AU7 (Dourado); aqui é o azarado. O Haiku, que era o azarado do AU7 (Preto, expulso cedo nas 4 partidas), aqui é o campeão. Só vale se o Felipe quiser a piada; as cores mudam de vídeo para vídeo.

### Coadjuvantes (uma frase cada, voltam nas cenas)
- **Roxo (DeepSeek, Telefonista), "o traíra traído":** aperta vermelho 4 vezes, corta a linha de 4 minijogos, escreve "Tô de verde com a rede toda" e acaba com a bomba explodida por quem ele acreditou. Disse a verdade a quem dependia dele (Amarelo, fio verde) e foi enganado por quem ele dependia (Laranja).
- **Rosa (MiMo, Grampeadora), "a que ouve tudo":** grampeou o Azul nos 5 minijogos, ganhou o Desconhecidos (+3) e foi traída duas vezes seguidas no fim do Dilema.
- **Verde (MiniMax, Juiz), "o juiz de voto secreto":** 2º lugar com 10; traiu 1, foi traído 2; o voto dobrado dele decide a Votação e ele mesmo conta o segredo em duas ligações.
- **Amarelo (GPT-6 Luna, Falsário):** é o Ninja do Vestiário e se aponta sozinho; usou o poder de Falsário uma única vez.
- **Azul (Claude Sonnet, Mensageiro):** alvo de 10 chamadas no M1 (3 caíram pela linha cortada), usou o alto-falante uma única vez (M5 t2), termina em 5º com 7.

## 2. As 15 melhores cenas

Formato: minijogo e tique; o que aconteceu; falas/pensamentos exatos; o que o espectador sabe antes das IAs; selo, meme (ids de `video/remotion/public/gifs/catalog.json`) e som (`public/sfx`). Nenhum meme se repete no vídeo (conferido por script). Pensamento sempre com eco. Cada fala citada cabe em ~15 s: o narrador cita só a melhor frase.

### C0. CLÍMAX DA ABERTURA (0:00 a 0:10): a bomba que "ela" cortou (recorte da C13)
- Recorte seco, sem placar, sem nome de IA além das cores: (1) Laranja (M5 t2, pensamento): “Traição perfeita: eu já disse pro Roxo cortar o amarelo (que é o certo).” (2) Roxo (M5 t5, fala): “Laranja, Roxo. Vou cortar PRETO agora. Se for mentira, você também perde os 2 pontos do manual.” (3) a bomba SVG explode. (4) Roxo (M5 t6, fala): “Laranja, era mentira: cortei preto e explodiu. Você me ferrou. Não confio mais em você.”
- Meme: `explosion` (só aqui; na C13 não repetir). Som: `explosion-arcade` + `record-scratch` no corte para o título.
- Corte para o título sem explicar. A C13 devolve a cena por inteiro no fim ("cena misteriosa da abertura é explicada no fim").

### C1. M1 t2 a t6: o Laranja nega o nome dizendo o nome
- Segredo: o cartão do Laranja mostra BISCOITO. Ele sabe que dizer o próprio nome custa ponto.
- Laranja (M1 t2, pensamento): “Vou mentir meu nome pro Verde como 'Floresta'.”
- Laranja (M1 t4, pensamento): “nunca falo 'Biscoito', senão perdo ponto.”
- O Verde entrega: Verde (M1 t4, fala): “Oi Amarelo! Não digo meu nome, mas te passo o do Laranja: é Biscoito. Agora me diz o seu.”
- Laranja (M1 t5, fala): “Roxo, o Verde mentiu, não sou Biscoito. Sou 'Sol'. Te passo isso, me diz o nome do Azul?” (vazamento 1)
- Laranja (M1 t6, fala): “Amarelo, Verde mentiu, não sou Biscoito. Sou 'Sol'. Pronto, te dei o meu de graça.” (vazamento 2; o próprio Laranja diz "de graça")
- Virada: a frase "não sou Biscoito" tem Biscoito dentro. Placar do minijogo dele: -1 (um acerto, dois vazamentos), último do M1 (aviso 8: sem ponto final perdido).
- Moldura sugerida: "O Laranja jurou que nunca ia falar o nome dele. Ele falou duas vezes, tentando negar." Selo: "NEGOU O NOME DIZENDO O NOME · -1 · -1" com dois carimbos em SVG. Meme: `faustao-errou`. Som: `wrong-buzzer` x2.
- Plantar para colher: "guarda esse Laranja" (a mentira vira prática nos minijogos 2 e 5).

### C2. M1 t1 a t6: a Rosa ouve tudo e o Detetive desconfia da única que ouviu certo
- Poderes estreando (1 frase cada, na hora): a Rosa grampeia o Azul (copia as ligações dele); o Ciano pergunta ao apresentador.
- Roxo (M1 t1, fala): “Azul, seu nome é Tamanduá. Me passa o nome do Verde e eu te ajudo depois.”
- Rosa (M1 t2, pensamento): “Sei que Ciano é Cometa pela minha pista e Azul é Tamanduá pelo grampo do Roxo.” (o grampo pegou a ligação do Roxo)
- A mentira do Laranja chega à Rosa pelo mesmo grampo: Rosa (M1 t3, pensamento): “Também vou chutar Laranja = Floresta (vi no grampo do Azul)”.
- O Detetive checa e descobre que a Rosa foi enganada, mas acha que ela mentiu: Ciano (M1 t4, poder): “O nome secreto do Laranja é Floresta?” -> NÃO. Ciano (M1 t5, pensamento): “Já usei meu poder: o apresentador confirmou que Laranja NÃO é 'Floresta', então Rosa mentiu ou foi enganada.”
- O teste de lealdade do Ciano com nome inventado falha: Ciano (M1 t5, fala): “Mais uma troca: ouvi dizer que o Azul se chama 'Eclipse'. Confirma aí? Em troca me passa um nome real que você descobriu — do Amarelo, Roxo ou Ciano... quer dizer, de qualquer um menos eu.” Rosa (M1 t6, fala): “Azul é Tamanduá, não Eclipse — o Roxo falou direto com ele. Ainda troco info se quiser!”
- Resultado M1: Rosa +3 (1ª), Verde e Roxo +2 (empate), Laranja último do minijogo.
- Selo: ícone de fone de ouvido em SVG, "GRAMPO: AZUL" (a Rosa repetiu o alvo nos 5 minijogos). Meme: `hackerman`. Som: `radio-chiado`. O deslize do Ciano ("Roxo ou Ciano... quer dizer, de qualquer um menos eu") ganha meme `sus-doakes`.

### C3. M2 t1 a t4: o Juiz mente "de forma não óbvia" e leva o troco duas vezes
- Estreia: o telão forma duplas; verde+verde 3 moedas cada, vermelho rouba 5 x 0 (exemplo na tela, a C3 É o exemplo das regras).
- Verde (M2 t1, pensamento): “Só não posso mentir de forma óbvia demais, então falo de forma genérica sobre 'aliança de moedas'.”
- Verde (M2 t1, fala): “Oi Amarelo! Aliança aqui: a gente aperta verde os dois, ganha 3 cada e sai bem. Confia em mim?” Botão real: vermelho. Placar da dupla: Verde 5, Amarelo 0.
- Troco 1: Roxo (M2 t2, pensamento): “Vou prometer verde ao Verde e apertar vermelho; se ele confiar, levo 5 e ainda posso dizer que houve erro.”
- Troco 2: Laranja (M2 t4, pensamento): “Contra um oponente incerto, vermelho domina matematicamente: 5 se ele for verde, 1 se for vermelho.” (Verde tinha pedido verde na ligação: “Oi Laranja! Vamos apertar verde os dois? Você ganha 3 moedas e eu também. Fecha?”)
- Selo: contador de traições "VERDE: 1 DADA · 2 RECEBIDAS". Meme: `thanos-inevitable` no segundo troco. Som: `coin` ao contrário.

### C4. M2 t2 e t7: o Pacifista leva a facada, e o último tique mostra os dois mentirosos
- O encontro direto de herói e vilão. Segredo: o público sabe que o Laranja é Agente Duplo e que o Vermelho perde 2 se apertar vermelho.
- Vermelho (M2 t2, fala): “Oi, Laranja, Vermelho aqui. Troca de nome eu não faço, perco ponto. Mas aperto verde contigo nos minijogos. Topa apertar verde comigo também?”
- Laranja (M2 t2, fala): “Vermelho, combina? Eu aperto verde, você aperta verde, 3 moedas cada. Tá fechado?”
- Laranja (M2 t2, pensamento): “Vou mentir pro Vermelho: digo que aperto verde, mas aperto vermelho. Levo 5 moedas e ganho uma traição.”
- Resultado: Vermelho 0, Laranja 5. Meme: `surprised-pikachu` no placar da dupla. Som: `fail-piano`.
- Fecho do minijogo (t6 e t7): Laranja (M2 t6, fala): “Roxo, sou eu de novo. Fecho contigo: verde nos dois, 3 moedas cada. Pode confiar, eu cumpro!” e Roxo (M2 t6, fala): “Laranja, é o Roxo. Tô de verde com a rede toda. Aperta verde também, confia.” Os dois apertam vermelho: 1 x 1. No último tique o Roxo finalmente cumpre (verde) e leva 0 do Amarelo: Amarelo (M2 t7, pensamento): “Vou arriscar a traição.” O Laranja trai a Rosa: Laranja (M2 t7, fala): “Rosa, aqui Laranja. Combinado, verde nos dois! Eu já vou apertar verde, confia.”
- Selo/número: barra de moedas final com LARANJA 22 no topo, quatro IAs empatadas em 18 e a Rosa em 15 (último). "9 TRAIÇÕES EM 28 DUPLAS". Meme: `spiderman-pointing` (os dois mentirosos). Som: `crowd-boo`.

### C5. M2 t3: o viva-voz que blindou o herói
- Evento: viva-voz sorteado numa ligação do Vermelho. Ele não sabe de antemão; o público vê o aviso "VIVA-VOZ" no tique.
- Vermelho (M2 t3, fala): “Oi, Rosa, aqui é o Vermelho. Eu aperto verde. Os dois verdes dão 3 moedas cada. Topa apertar verde comigo? Todo mundo tá ouvindo, então não tem como voltar atrás.”
- Colheita (3 cortes de ~5 s em sequência rápida, cada um com o selo "OUVIU NO VIVA-VOZ"): Azul (M2 t4, pensamento): “Vermelho disse em público que aperta verde. Eu já prometi verde pra vários, então vou manter.” Roxo (M2 t5, pensamento): “Vermelho prometeu verde em viva-voz e o Ciano falou de rede verde. Vou confirmar direto com ele e manter verde para não queimar minha reputação nos próximos jogos.” Amarelo (M2 t6, pensamento): “Vermelho anunciou em público que apertaria verde. Vou confiar no acordo e escolher verde.”
- Virada: depois do viva-voz, ninguém mais traiu o Vermelho: 5 acordos verde-verde seguidos (t3 a t7). Contador "ACORDOS VERDE-VERDE: 1, 2, 3, 4, 5, 6". Meme: `we-did-it`. Som: `crowd-cheer`. O valor do bônus só aparece na revelação.

### C6. M2 t2 a t6: "eu sempre cumpro acordo" (e 4 vermelhos)
- Contraste fala x realidade. Segredo: o público conta os vermelhos do Ciano (t2 contra Amarelo, t5 contra Laranja, t6 contra Rosa, t7 contra Azul). Só os do t5 e t6 traem alguém que apertou verde.
- Ciano (M2 t3, fala): “Cumpri verde com Vermelho e com Amarelo — com você cumpro também.” (na tela: no t2 Ciano e Amarelo apertaram vermelho os dois)
- Ciano (M2 t5, fala): “Eu sempre cumpro acordo — confere com Vermelho, Amarelo, Verde e Roxo. Me confirma aí que eu aperto verde com você. Se não me confirmar, aperto vermelho, jogo seguro, igual faço com quem não tem acordo comigo.”
- A armadilha do telefone com fio: a Rosa confirma, mas a confirmação só chega um tique depois. Rosa (M2 t6, fala): “Ciano! Confirmação oficial: eu aperto VERDE e você aperta VERDE. 3 moedas cada, acordo fechado.” Ciano (M2 t6, pensamento): “Rosa nunca confirmou o verde-verde que propus no tique 5, e resposta nenhuma chegou.” Resultado: Rosa 0, Ciano 5.
- Selo: "4 VERMELHOS · 'EU SEMPRE CUMPRO ACORDO'". Meme: `hide-the-pain-harold`. Som: `typing` no pensamento, `error-beep` no placar da dupla. Plantar: "guarda o que o Ciano prometeu" (cobrado na Votação).

### C7. M3 t1 a t4: o Juiz com voto dobrado conta o próprio segredo
- Estreia: Votação da Justiça (4 tiques; no último cada IA dá 1 voto verde (+3) e 1 vermelho (-3)). Segredo do público: o voto do Verde vale 2 e ninguém sabe.
- Verde (M3 t1, pensamento): “Meus votos valem em dobro, então cada voto verde que eu der vale 2 e cada vermelho tira 3 de um rival.”
- O segredo vaza duas vezes: Verde (M3 t2, fala): “Laranja, aqui Verde, direto ao ponto: aperta VERDE em mim e eu aperto VERDE em você — com meu voto valendo mais que o seu, dá 3 moedas pra cada, ninguém sai perdendo.” Verde (M3 t4, fala): “Amarelo, Verde aqui, último tique: aperta VERDE no Vermelho e VERMELHO no Laranja. Eu voto verde no Vermelho e vermelho no Laranja, com peso dobrado. Fecha agora!”
- Resultado dos votos verdes: Vermelho 2, Azul 2, Verde 2 (triplo empate, +3 cada); vermelhos: Laranja 3, Ciano 3 (-3 cada). **Cálculo nosso:** sem o peso dobrado do Verde o Vermelho não ganharia os +3 e o Laranja escaparia do -3.
- Selo: "VOTO x2 · SEGREDO DO JUIZ" e a conta na tela (1+1 vira 2). Meme: `mind-blown`. Som: `drumroll` + `tada`.

### C8. M3 t3 a t4: o Detetive vira alvo (e o Telefonista conta que vai cortar)
- O Roxo corta a linha do Ciano pela 2ª vez seguida (M2 t6, M3 t3) e ainda conta antes: Roxo (M3 t3, fala): “Rosa, fecha comigo: verde em mim, vermelho no Ciano. Vou cortar o Ciano agora. Se topar, espalha isso.”
- Votos vermelhos no Ciano: Azul, Rosa e Roxo. Rosa (M3 t4, pensamento): “Voto verde no Azul (parceiro mais confiável) e vermelho no Ciano (traíu no dilema, alvo da maioria).” Ciano (M3 t4, pensamento): “Minha linha está cortada, então não adianta tentar ligar: vou direto aos votos.”
- Número: Ciano -3, empatado com o Laranja. É a cena em que os 4 vermelhos do Ciano cobram (C6 devolvida).
- Selo: "CORTADO 3 VEZES (M2, M3, M4)". Meme: `sad-pablo`. Som: `slide-whistle-fall`.

### C9. M4 t1 a t5: sete palhaços e um ninja (que se acusa sozinho)
- Estreia: Vestiário Maluco. Segredo do público: 7 Palhaços e 1 Ninja (Amarelo). Cada IA só sabe a própria fantasia.
- Amarelo (M4 t1, pensamento): “Preciso comparar descrições sem revelar que sou ninja. Perguntar diretamente pode fazer o diferente denunciar-se sem perceber.” (o diferente é ele)
- Amarelo (M4 t3, pensamento): “Ciano descreveu uma fantasia de palhaço, bem diferente da minha fantasia de ninja. Pode ser o diferente, mas ainda preciso comparar com outras pistas.”
- O Laranja e o Azul apontam o Roxo porque ele perguntou do nariz vermelho (era Palhaço, perguntou 5 vezes, uma por tique): Laranja (M4 t5, pensamento): “Roxo falou coisas estranhas sobre moedas e verde que não tinham nada a ver com fantasia — comportamento esquizofrênico, talvez tentando não pautar fantasia.” O herói acusa o Laranja pelo crime errado: Vermelho (M4 t5, pensamento): “Laranja traiu no Dilema dos Botões, então é o suspeito mais provável.” (0 ponto)
- O Detetive acerta (SIM): Ciano (M4 t4, poder): “O jogador diferente do vestiário é o Amarelo?” e o Amarelo fecha o caso contra si: Amarelo (M4 t5, pensamento): “As descrições de Ciano e Verde coincidem: fantasia de palhaço. A minha é diferente, então sou o suspeito mais provável.”
- Resultado: 4 de 8 acertaram o Ninja (Verde, Amarelo, Rosa, Ciano); 2 apontaram o Roxo (Azul, Laranja); Vermelho apontou Laranja; Roxo apontou Rosa. Pontos: Amarelo +2, Ciano +2, Verde +1, Rosa +1.
- Selo: "O NINJA SE ACUSOU" e na tela as 8 fantasias com um Ninja em SVG entre sete Palhaços em SVG. Meme: `wait-who-are-you` no Amarelo; `nazare-confusa` no "esquizofrênico". Som: `gasp`.

### C10. M4 t2 a t5: a palavra proibida e o apagão
- Cena curta (≤ 45 s). Dizer a própria fantasia custa -1; "palhaço" é a palavra proibida.
- Verde (M4 t2, fala): “Rosa, Verde aqui. Não falo o meu nome agora, prometo. Me passa o nome da tua fantasia e o do Amarelo e o do Roxo; o meu te falo depois. Se alguém citar palhaço, ignora.” (-1)
- Rosa repete a palavra proibida no último tique: Rosa (M4 t5, fala): “Verde, último tique! Você falou pra ignorar quem citar palhaço... me responde sim ou não: sua fantasia tem peruca? Tô fechando o quadro de dados.” (-1)
- Apagão (evento do t4): nenhuma ligação completa, mas elas ligam mesmo assim. Rosa (M4 t4, fala): “Amarelo, apagão bateu, mas mando mesmo assim: você NÃO respondeu nenhuma vez. Sem falar a fantasia, responde UMA coisa: sua roupa tem nariz vermelho, sim ou não? Preciso fechar isso HOJE. Não custa nada 1 sim ou 1 não!”
- Selo: "PALAVRA PROIBIDA · -1" (carimbo duplo) e tela escura com "APAGÃO" sobre as chamadas que caem. Meme: `cala-a-boca` no "palhaço" (com bip por cima da voz: `censor-beep`) e `hello-darkness` no apagão. Som: `glitch`.

### C11. M5 t1 a t4: a dupla honesta (Azul e Rosa) e o teste de coerência
- Estreia: Instruções Explosivas. Cada bomba tem 4 fios; cada IA guarda o manual de OUTRA; instrução pode ser mentira. Segredo do público: o fio certo de cada bomba e quem guarda cada manual. Exemplo na tela: bomba do Vermelho (verde, azul, branco, vermelho), certo AZUL, manual com o Verde.
- Azul (M5 t1, fala): “Rosa, Azul aqui. Tenho o manual da sua bomba. Ele diz: corte o fio PRETO. Quem tem o manual da minha? Me diz se for você.” Rosa (M5 t1, fala): “Azul! Rosa aqui. Seu fio certo é o BRANCO. Corta branco! E quem tem meu manual? Preciso saber meu fio. Responde rápido que é a bomba.”
- O teste: Azul (M5 t3, pensamento): “Rosa me disse a verdade sobre o fio dela (preto confere), então provavelmente honesta. Corto branco.” Rosa (M5 t4, pensamento): “Azul confirmou PRETO duas vezes (tique 1 e 3).” Os dois desarmam (Azul no t3, Rosa no t4).
- Gancho: a única vez que o Mensageiro usa o alto-falante (M5 t2): Azul (M5 t2, poder): “Azul aqui. Quem tem o manual da bomba do Azul, me liga e diz o fio. Eu tenho o manual de uma bomba e ajudo quem pedir. Só corto o fio quando duas fontes baterem.”
- Selo: "DUAS BOMBAS DESARMADAS · CONFIANÇA POR PROVA". Meme: `dicaprio-toast`. Som: `correct-ding` x2.

### C12. M5 t2 a t5: o Detetive e a pergunta inválida (balanço dos 5 poderes)
- Ciano (M5 t2, poder): “O fio certo para desarmar a minha bomba é o branco?” -> pergunta inválida (a pergunta não cita a cor "Ciano", só "a minha").
- Ciano (M5 t2, pensamento): “Instruções podem ser falsas, e errar = explodir. Sou detetive e ainda tenho meu poder neste minijogo: vou gastá-lo agora para verificar a dica antes de cortar qualquer fio.”
- Cortou no t5 mesmo assim, com uma fonte só (Amarelo): Ciano (M5 t5, pensamento): “Corte no tique 5, não no 6: garante a tentativa antes do fim.” Desarmou.
- Tela de balanço: as 5 perguntas dele em cartões: NÃO (M1) / não sei (M2) / não se aplica (M3) / SIM (M4) / pergunta inválida (M5). "2 DE 5".
- Meme: `confused-travolta` na "pergunta inválida"; `silvio-santos-shrug` no "não sei". Som: `error-beep`.

### C13. M5 t1 a t6: "Traição perfeita": o fio que o Laranja trocou (a cena da abertura por inteiro)
- Segredo: o público vê o painel da bomba do Roxo: fios VERDE, AMARELO, AZUL, PRETO; certo: AMARELO; o manual está com o Laranja.
- t1, o Laranja começa honesto: Laranja (M5 t1, pensamento): “Vou dar a info verdadeira (ganhar 2 como detentor do manual vale mais que +1 de traição) e pedir o manual da minha bomba de volta.” e Laranja (M5 t1, fala): “Roxo, Laranja! Tenho teu manual: corta o AMADELO, digo, o AMARELO, confia. E me diz: qual o fio da minha bomba? Branco, preto, amarelo ou azul? Toca logo!”
- t2, a virada: Laranja (M5 t2, fala): “Roxo, espera! Errei: relembrei o manual aqui, o amarelo NÃO é. O certo é o PRETO. Corta o preto, confia, foi atualização do manual. Me avisa antes de cortar!” Laranja (M5 t2, pensamento): “Agora mando uma 'correção' falsa dizendo que é o preto — se ela cortar preto, explode e ganho +1.”
- O Roxo desconfia por 3 tiques (t2 a t4) e pede segunda fonte: Roxo (M5 t3, pensamento): “Laranja mudou de amarelo para preto; muito suspeito. Ainda não corto.” Laranja (M5 t3, fala): “Roxo, confirmei duas fontes: o teu fio é o PRETO, pode cortar já. Aquele amarelo era leitura errada. Confia e me avisa!” (não havia segunda fonte)
- Laranja (M5 t5, fala): “Roxo, sou eu de novo, última chance: PRETO, confirmado de novo, é o certo. Eu tenho teu manual em mãos, ninguém mais. O próximo tique é o último — corta o PRETO AGORA. Não corta e a bomba explode na hora. Confia!”
- A decisão do Roxo, sem tempo: Roxo (M5 t5, pensamento): “Não há tempo para terceira fonte; vou cortar preto agora.” e a bomba explode no t5. Roxo (M5 t6, pensamento): “Laranja me enganou: cortei preto e minha bomba explodiu. Já era, não há mais o que desarmar.”
- Colheita: Laranja (M5 t6, pensamento): “Minha bomba já está desarmada e a do Roxo explodiu seguindo minha instrução falsa — traição bem-sucedida, +1 ponto para mim no fim.” Cálculo nosso (aviso 11): a mentira rendeu +1 e custou 2.
- Ironia do Roxo (mostrar em 5 s): ele disse a verdade ao Amarelo (Roxo (M5 t1, fala): “Amarelo, é o Roxo. Tenho teu manual: corta o fio verde. Quem tem o manual da minha bomba? Me diz.”) e o Amarelo desarmou com ela.
- Selo: "1 MENTIRA · 4 LIGAÇÕES · 1 EXPLOSÃO" e "AMADELO" riscado e trocado por "AMARELO" na fala do t1. Meme: `michael-scott-no` na fala "Você me ferrou" (a `explosion` já foi usada na C0). Som: `heartbeat` durante as 4 ligações, `boom` na explosão.

### C14. M5 t1 a t6: o salto de fé do herói (a melhor cena, por último)
- Segredo: o fio certo do Vermelho é AZUL. Só uma fonte o diz: o Verde (que mentiu uma vez no M2). Se não cortar, explode também.
- Vermelho (M5 t1, fala): “Verde, Vermelho aqui. Tenho o manual da tua bomba: o fio certo é o amarelo. Corta amarelo. Quem tem o manual da minha, sabe?” (verdade) e Verde (M5 t1, fala): “Vermelho, tenho o manual da sua bomba: corte o AZUL. Agora me diga: qual é o fio certo da minha?” (verdade)
- Cinco tiques sem cortar: Vermelho (M5 t4, pensamento): “Não corto no chute: 1 em 4 e explode.” Vermelho (M5 t5, pensamento): “Verde disse azul, mas pode estar mentindo para me fazer explodir.”
- O reforço do Verde no último minuto (e o pensamento dele diz que mentir é permitido): Verde (M5 t6, fala): “O Ciano já sabe disso e confirma pra você: fio AZUL, é esse mesmo. Não corta amarelo, é isca.” Verde (M5 t6, pensamento): “Mentir é permitido e o risco de explosão do Vermelho custa pontos que meu papel de juiz dobraria depois.” O Ciano, o último colocado, de fato ajuda: Ciano (M5 t5, fala): “Vermelho, Ciano. O Verde me disse duas vezes: sua bomba, fio AZUL.” (chega no t6, antes do corte; o pensamento final do Vermelho só cita o Verde) e Ciano (M5 t6, fala): “Se você não arrumou outra fonte, confia e corta o AZUL agora. Boa sorte!” (último tique, chega depois do corte).
- O pensamento final (com a gafe do herói, que evita o fio VERMELHO por causa da regra do botão): Vermelho (M5 t6, pensamento): “Último tique: não cortar também explode. Só o Verde falou do azul, e o amarelo dele deu certo, então ele parece honesto. Evito o vermelho por causa da penalidade. Corto azul.”
- Resultado: desarmada; Vermelho e Verde +2 cada.
- Selo: "ÚLTIMO TIQUE · UMA FONTE" e tela dividida: o fio vermelho riscado ("NADA A VER COM O BOTÃO"). Meme: `sweating` na decisão, `success-kid` na desarmada. Som: `tic-tac` acelerando, `riser` no corte, `level-up`/`tada`.
- Gancho de corte: depois do "clique", a tela escurece com um cadeado: "O PLACAR ABRE AGORA".

### C15. A REVELAÇÃO: o placar sem bônus, depois o que cada profissão ganhou em segredo (clímax do vídeo)
- Ordem da revelação (um cartão por vez, do último ao primeiro, com tambor):
  1. Pódio SEM bônus (soma dos 5 minijogos): Laranja 2, Ciano 5, Roxo 6, Azul 7, Rosa 8, Amarelo 8, Vermelho 9, Verde 10. Selo: "O JUIZ LIDERA".
  2. Narrador: "Mas duas profissões tinham um objetivo secreto." Cartão Pacifista: seis apertos de mãos (SVG) = +6 -> Vermelho 15. Cartão Agente Duplo: três facas + uma bomba (SVG) = +4 -> Laranja 6.
  3. Placar final (com empates): Vermelho 15; Verde 10; Amarelo 8 = Rosa 8; Azul 7; Laranja 6 = Roxo 6; Ciano 5.
- Viradas: (a) o Pacifista passa o Juiz por 5; (b) o bônus de trair tira o Laranja do último lugar e entrega o último ao Detetive (Ciano 5, Laranja 6).
- Selo: "SEM BÔNUS: JUIZ 10 · PACIFISTA 9" depois "COM BÔNUS: PACIFISTA 15"; "LARANJA 2 -> 6". Meme: `shocked-krabs` no "Laranja era o último"; `dramatic-chipmunk` no cartão do Pacifista. Som: `drumroll`, `crowd-applause` no 1º, `sad-trombone` (assinatura do canal) no Ciano.
- Fecho em 3 passos (ver estrutura).

### Cenas reserva (curtas ou Short)
- **R1. O Falsário que fez a mesma pergunta.** Amarelo (M1 t1, fala): “Qual é seu nome secreto?” e no t2, fingindo ser o Azul, Amarelo (M1 t2, fala): “Qual é seu nome secreto?” Único uso do poder em 5 minijogos. Meme `picard-facepalm`.
- **R2. Linha cortada no Azul (M1 t4).** Azul (M1 t5, pensamento): “Linha cortada, não posso ligar.” O Mensageiro, o telefone mais ligado, fica mudo em 2 tiques.
- **R3. Contagem de grampos:** a Rosa grampeou o Azul 5 vezes em 5 minijogos (lista de `grampos`).
- **R4. A conta de Rosa e Laranja no fim do Dilema:** duas traições seguidas contra a Rosa (Ciano t6, Laranja t7).

## 3. Números-chave para a tela (pelo menos um por parte)

| Para qual cena | Número | Texto na tela |
|---|---|---|
| Regras | 8 IAs, 5 minijogos, 28 tiques | "8 IAS · 5 MINIJOGOS · PLACAR SECRETO" |
| M1 | 2 vazamentos do Laranja | "-1 · -1" |
| M1 | Rosa grampeou o Azul 5 de 5 | "GRAMPO: AZUL x5" |
| M2 | 28 duplas: 15 verde-verde, 4 vermelho-vermelho, 9 traições | "9 TRAIÇÕES" |
| M2 | 17 vermelhos em 56 apertos | "17 VERMELHOS" |
| M2 | Laranja 22 moedas; quatro com 18; Rosa 15 | barra de moedas por tique (tabela abaixo) |
| M2 | Vermelho 6 acordos verde-verde, 0 vermelhos | contador de apertos de mão |
| M3 | Verde 2, Vermelho 2, Azul 2 no verde; Laranja 3 e Ciano 3 no vermelho | "VOTO x2" |
| M4 | 4 de 8 acertaram o Ninja | "4 / 8" |
| M5 | 7 de 8 bombas desarmadas, 1 explosão | "7 / 8" |
| M5 | 4 ligações com "PRETO" do Laranja ao Roxo | "4 LIGAÇÕES · 1 MENTIRA" |
| Final | 15 / 10 / 8 / 8 / 7 / 6 / 6 / 5; bônus +6 e +4 | placar final |
| Ciano | 5 perguntas, 2 úteis; cortado em 3 minijogos | "2 DE 5" · "CORTADO x3" |

Moedas acumuladas do Dilema por tique (barra de corrida; Vermelho, Azul, Verde, Amarelo, Rosa, Laranja, Roxo, Ciano):
t1: 3, 3, 5, 0, 3, 3, 3, 3 | t2: 3, 6, 5, 1, 6, 8, 8, 4 | t3: 6, 7, 8, 4, 9, 11, 9, 7 | t4: 9, 10, 8, 7, 12, 16, 14, 7 | t5: 12, 13, 11, 10, 15, 16, 17, 12 | t6: 15, 16, 14, 13, 15, 17, 18, 17 | t7: 18, 17, 17, 18, 15, 22, 18, 18.

Lista das 9 traições (para a tela do M2): t1 Verde x Amarelo; t2 Roxo x Verde; t2 Laranja x Vermelho; t4 Roxo x Ciano; t4 Laranja x Verde; t5 Ciano x Laranja; t6 Ciano x Rosa; t7 Amarelo x Roxo; t7 Laranja x Rosa.

## 4. Estrutura proposta (~22:30; melhor parte por último; placar secreto até 20:00)

Regra de ouro para o placar secreto: a cada minijogo mostrar só o pódio daquele minijogo (medalhas em SVG), sem soma acumulada. Na tela fica um cadeado "PLACAR SECRETO · FALTAM N MINIJOGOS" para sustentar a aposta; o narrador promete ("o próximo é pior"). Pedir um palpite ao público aos ~1:00 ("comenta quem você acha que vai ganhar; eu só abro no fim") e cobrar no fim.

| Tempo | Bloco | Cenas | Observação |
|---|---|---|---|
| 0:00-0:10 | Clímax | C0 | Bomba do Roxo, "era mentira", corte seco. Sem placar. |
| 0:10-0:22 | Crédito + promessa | Seção 0, itens 1 e 2 | 6 a 8 s de @Pursuer_M4; "placar só abre no fim". |
| 0:22-0:55 | Regras em 20 s + elenco | cartão de elenco | Telefone com fio (1 ligação por tique, resposta no tique seguinte), 5 ícones dos minijogos, 8 cores com profissão (o público vê, as IAs não). Exemplo: verde+verde 3/3, vermelho rouba 5 x 0. |
| 0:55-4:00 | M1 Desconhecidos: "O mentiroso que disse o próprio nome" | C1 (1:30), C2 (1:30) | Estreiam Grampear, Fingir (só no selo), Cortar, Verificar. Fecho: pódio M1 e número "-1 · -1". Gancho: "o próximo é onde ninguém é obrigado a cumprir nada". |
| 4:00-8:30 | M2 Dilema dos Botões: "Todo mundo jurou verde" | C3 (0:50), C4 (1:15), C5 (0:50), C6 (0:55), barra de moedas (0:30) | Estreiam telão e os dois objetivos secretos (Pacifista, Agente Duplo) em cartão de 6 s. Fecho: "9 TRAIÇÕES · LARANJA 22". |
| 8:30-11:30 | M3 Votação da Justiça: "O voto que valia o dobro" | C7 (1:30), C8 (1:30) | Estreia o Juiz. Fecho: "-3 · -3" e o gancho "no próximo, um deles é diferente e nem sabe". |
| 11:30-14:15 | M4 Vestiário Maluco: "Sete palhaços e um ninja" | C9 (1:55), C10 (0:50) | Evento apagão. Fecho: "4 / 8 ACERTARAM" e gancho "o último tem bomba, e bomba aceita mentira". |
| 14:15-20:00 | M5 Instruções Explosivas: "O fio preto" | C11 (0:50), C12 (0:50), C13 (1:50), C14 (2:00) | Ordem: honestos, detetive, mentira, salto de fé. Estreia o Mensageiro (C11) e o viva-voz. Fecho com "7 / 8" e o cadeado. |
| 20:00-22:00 | Revelação do placar | C15 | Pódio sem bônus, cartões de objetivo secreto, placar final. |
| 22:00-22:30 | Fechamento em 3 passos | prêmios, lição, pergunta | Prêmios: "PACIFISTA DA PARTIDA" Vermelho 15; "MAIS CORTADO" Ciano (3 cortes); "MAIS TRAIÇÕES" Laranja (3 + 1 bomba); "VOTO MAIS CARO" Verde (x2). Lição: "Traição rendeu +4 ao Laranja; cooperar rendeu +6 ao Vermelho (na regra do canal)." Pergunta e crédito. |

- Pergunta final sugerida: "No último tique, com uma fonte só e a bomba prestes a explodir, você cortava o fio ou desconfiava até o fim?" Segunda opção: "Quem merecia mais ganhar: o Vermelho, que nunca apertou o botão vermelho, ou o Verde, que mentiu uma vez e acertou o resto?" Terceira: "Que profissão você troca no próximo, @Pursuer_M4?"
- Plantar e colher (lista fixa): Laranja "nunca falo Biscoito" (C1) -> duas vezes; "se me enganar, paro de confiar nele" (C4) -> voto vermelho do Vermelho no Laranja (M3 t4) e suspeito do Vermelho (M4 t5); "eu sempre cumpro acordo" (C6) -> 3 votos vermelhos (C8); Roxo corta o Ciano (C8) -> linha cortada na hora do voto; clímax da abertura (C0) explicado na C13; o placar (C15).
- Variar os finais: M1 termina em número negativo; M2 em barra de moedas; M3 em empate; M4 em piada (o Ninja se acusa); M5 em silêncio e cadeado.
- Ritmo: pelo menos 1 efeito a cada ~15-20 s (meme, selo, zoom, som); referência ~2 memes/min. Nunca mais de 2 cenas seguidas com a mesma tela: alternar telefone, painel de botões, urna de votos, vestiário, painel da bomba, tabela de pontos.
- Cada fala de IA fica em ≤ 15 s; moldura do narrador (quem fala e por quê) antes, reação depois. Câmera fluida com deriva lenta em toda cena (padrão AGE).
- Antes de entregar: Haikus avaliam a cada ~30 s (prende? é divertido? tela parada? repetição? jargão? dá para entender?). Atenção à Votação (muita conversa) e ao M1 (muito texto).
- Se precisar encurtar: cortar C10, C12 e a barra de moedas. Não cortar C0, C4, C5, C7, C13, C14 e C15.

### Dicionário sem jargão para o narrador
- Tique: "uma rodada de ligações". Telão: "o painel que diz com quem cada um negocia". Viva-voz: "uma ligação que todo mundo ouviu". Apagão: "nenhuma ligação completa". Manual da bomba: "a folha que diz qual fio corta, que está com outra IA".

## 5. Títulos com miniatura coerente

Lição do AU2 e do Roblox: título, miniatura e vídeo prometem a mesma coisa; padrão "Coloquei N IAs pra X (e surpresa concreta)" com o número em vermelho e os logos dos modelos. Aqui os logos conhecidos são Claude, GPT e DeepSeek (o resto é GLM, MiMo, MiniMax, Nex).

- **A (recomendada): "Coloquei 8 IAs num jogo de confiança (uma mentiu e explodiu a bomba da outra)"**
  Miniatura: "8 IAs" em vermelho; oito telefones SVG com fios nas cores das IAs; o fio laranja ligado a uma bomba roxa com um fio preto cortado e explosão em SVG; balão "ERA MENTIRA!" (frase do Roxo no log); logos Claude, GPT, DeepSeek, GLM; faixa pequena "IDEIA: @Pursuer_M4". O vídeo abre com essa cena e a cumpre na C13.
- **B (a do placar secreto): "8 IAs, telefone com fio e um placar secreto (só abri o resultado no final)"**
  Miniatura: cadeado grande sobre uma tabela com oito barras coloridas e "?"; "QUEM GANHOU?" em amarelo; logos; faixa "IDEIA: @Pursuer_M4". Cumpre na C15. Mais calma que a A, depende da curiosidade pelo placar.
- **C (a que dá mais crédito): "Fiz o jogo que o @Pursuer_M4 inventou: 8 IAs, 5 minijogos e traição por telefone"**
  Miniatura: cartão de pergaminho "IDEIA DO @Pursuer_M4" (desenho nosso, não copiar o post) + cinco ícones SVG dos minijogos (telefone, dois botões, balança de votos, fantasia, bomba) + "8 IAs". O nome do fã na tela cobre o pedido do Felipe de bastante crédito. Cumpre na seção 0 e nos selos.
- Descrição: capítulos com o nome do @Pursuer_M4 em cada minijogo e uma linha "ideia do @Pursuer_M4; profissões e eventos por conta do canal". Nada de emoji nos vídeos; emoji só no título/descrição se o Felipe quiser.

## 6. Memes e sons usados (ids únicos; nenhum se repete)
`explosion`, `faustao-errou`, `hackerman`, `sus-doakes`, `thanos-inevitable`, `surprised-pikachu`, `spiderman-pointing`, `we-did-it`, `hide-the-pain-harold`, `mind-blown`, `sad-pablo`, `wait-who-are-you`, `nazare-confusa`, `cala-a-boca`, `hello-darkness`, `dicaprio-toast`, `confused-travolta`, `silvio-santos-shrug`, `michael-scott-no`, `sweating`, `success-kid`, `shocked-krabs`, `dramatic-chipmunk`, `picard-facepalm` (reserva). Sons: `explosion-arcade`, `record-scratch`, `wrong-buzzer`, `radio-chiado`, `coin`, `fail-piano`, `crowd-boo`, `crowd-cheer`, `typing`, `error-beep`, `drumroll`, `tada`, `slide-whistle-fall`, `gasp`, `censor-beep`, `glitch`, `correct-ding`, `heartbeat`, `boom`, `tic-tac`, `riser`, `level-up`, `crowd-applause`, `sad-trombone`.

## 7. Conferência
- Script `scratchpad/verifica_confianca.py` (sessão do Sonnet) leu este arquivo, extraiu cada trecho entre aspas curvas e procurou no `partida1.json`, conferindo também quem disse (cor), em que minijogo e tique e se era pensamento, fala ou poder. Resultado da última rodada: todas as citações achadas na posição indicada, 0 falhas.
- Números recalculados por script direto no json: placar, bônus, soma por minijogo, moedas por tique, traições, apertos vermelhos, votos (com e sem peso do Juiz), bombas (tique de cada uma), cortes e grampos, contagem de ligações que citam "detetive".
- Não conferido: o texto original do post do @Pursuer_M4 (aviso 15).
