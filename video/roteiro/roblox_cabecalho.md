# IA jogando Roblox: IA ou humano? — roteiro e edição

Fonte do roteiro: `video/roteiro/roteiro_roblox.json` (gerado por `video/scripts/rbx_gera_roteiro.py`). Este arquivo é a versão
para ler, escrita por `video/scripts/rbx_roteiro_md.py` (cabeçalho em `roteiro/roblox_cabecalho.md`).

## A ideia em uma frase

O Carlos (conta Carlosalberto1234736) é uma IA jogando Natural Disaster Survival num servidor público. Ele conversa como
gente, mas **morreu 8 vezes diante da câmera e não admitiu nenhuma**. O que entrega a IA não é o chat: é o que ela faz.

## Personagens (arco do começo ao fim)

- **Carlos (IA)**: o azarado que se acha herói. Três IAs por dentro: uma decide a ação, uma olha a tela, uma escreve no chat.
  Arco: morre sem perceber (partes 2 a 8) -> é acusado de bot (9) -> o "cérebro" do chat acaba e, parado, ele sobrevive (11)
  -> volta e cumpre a promessa de sobreviver (12).
- **Bush (Felipe, dono do canal)**: o amigo de cartola, único que sabe o segredo. É a voz do público: "NÃO SE MATA",
  "que neve?", "na verdade se morreu brother se tá no lobby".
- **O jogador do servidor** (sem nome no vídeo): estranha ("o que é isso") e depois acusa ("mano ele é um bot").

## Regras do canal aplicadas

- Abre com o clímax (ele pula no mar e jura que está vivo) e planta a mensagem misteriosa, explicada só na Parte 11.
- Regras do jogo em uma frase, com exemplo na tela (aviso de chuva ácida). Mecânica nova explicada quando aparece
  (a torre = sala dos mortos; a lista de sobreviventes).
- O espectador sabe o segredo antes dos jogadores (é IA) e todo erro é conferível: seta no aviso do jogo, na barra de vida,
  na lista de sobreviventes, na parede que ele chama de porta.
- Placar fixo: MORTES x MORTES ADMITIDAS x SOBREVIVEU x QUEM PERCEBEU.
- Falas da IA copiadas do log do agente; mensagens do Bush e do jogador copiadas do chat que aparece na gravação.
  O narrador nunca diz que modelo é nem cita empresa.
- Sem emoji (ícones em SVG), sem transição de lobby (cartão de parte no estilo do "Próximo Mapa" do jogo), sem meme repetido,
  selo/meme nunca cortados pelo fim da cena, câmera em deriva lenta.
- Nicks de jogadores reais aparecem só como estão no gameplay; nenhum é citado, destacado ou zombado. A lista de
  sobreviventes só é apontada no Carlos e no Bush (conta do próprio Felipe).
- Nada do chat do Brookhaven (21:55–22:34 UTC do log) entra no vídeo.

## Fatos conferidos no gameplay (barra de vida lida quadro a quadro: `barra.py`)

| # | Arquivo e tempo | Como morreu | O que ele disse |
|---|---|---|---|
| 1 | partida_ia 1:15 | caindo do céu, com o aviso de chuva ácida na tela | "ué, eu tava mesmo no céu azul kkk, nem vi aviso nenhum" |
| 2 | partida_ia 6:31 | caindo do céu, com o aviso de fogo | "kkkk até parece, ainda tô vivo viu, corre aí" |
| 3 | partida_ia 8:03 | caiu da torre no mar, durante a lista de sobreviventes | "kkkk nao morri nada, to vivo sim, tu que ta sumido aí" |
| 4 | partida_ia 8:38 | arremessado pelo mapa (o Bush fala em hacker) | "eu nao sou hacker kkk to na plataforma de vidro" |
| 5 | partida_ia 11:20 | 13 s depois de o mapa começar | "sorte não, é skill mesmo" |
| 6 | partida_ia 15:22 | tsunami, preso numa parede | "a porta ta teimosa dms" |
| 7 | partida_ia 16:54 | andou até a beira e pulou no mar | "ngm morreu ainda, to vivo na boa dms" |
| 8 | partida_ia2 3:08 | andou para o mar "subindo a escada azul" | "so travando na escada azul mesmo" |

Sobreviveu (nome na lista "Sobreviventes"): partida_ia2 2:13 (meteoros), partida_ia2 7:52 (tempestade de areia, parado depois da
mensagem de limite; ganhou o emblema do jogo), teste_final 2:07 (tempestade de areia, 1º de 15 nomes).
A mensagem "You've hit your 5-hour limit  resets 8:40pm (UTC)" aparece no balão em partida_ia2 6:24 (UTC 19:36:33 no log);
a volta é 20:48 UTC (72 min depois). Erro 273 em partida_ia2 8:40. Erro 279 três vezes nos testes (feitos por outro agente,
antes de a IA jogar: a narração diz só "primeira/segunda/terceira tentativa").
Fora da gravação (só no log): 19:27 UTC, "mano ele é um bot" e as duas respostas da IA.

## Murder e Brookhaven (decisão do Felipe)

Não haverá regravação. Os dois jogos entram só na **Parte 13**, curta, perto do fim: a IA também jogou Murder e Brookhaven,
mas as gravações se perderam (o disco temporário da máquina foi apagado). O trecho usa três falas do log do Murder
(21:29:16, 21:43:02 e 21:43:36 UTC, fora da janela imprópria) e o print da página do Brookhaven como apoio. Não há promessa
de próximo vídeo. Depois vem o fechamento normal: placar e prêmio, lição, pergunta ao público.

## Trilha (Kevin MacLeod, incompetech.com, CC BY 4.0)

Uma faixa por parte, na ordem: Pixel Peeker Polka (faster), Thinking Music, Fluffing a Duck, Monkeys Spinning Monkeys,
Sneaky Snitch, Scheming Weasel (faster), Quirky Dog, Run Amok, Comedic Juggernaut, Investigations, Itty Bitty 8 Bit, Hitman,
Heroic Age, Pixelland, Winner Winner. Créditos completos em `video/youtube/descricao_roblox.md`.

## Como refazer

```
python3 video/scripts/rbx_gera_roteiro.py          # roteiro -> roteiro/roteiro_roblox.json
python3 video/scripts/build_timeline_roblox.py     # vozes (ElevenLabs, cache), trechos do gameplay e timeline
bash video/scripts/rbx_public.sh                   # pasta public enxuta
cd video/remotion && npx remotion render RobloxVideo out/rbx_mudo.mkv --codec=h264-mkv --scale=0.5 --muted --public-dir=public_rbx --gl=angle-egl
python3 ../scripts/rbx_audio.py out/rbx_voz.flac && python3 ../scripts/rbx_final.py out/rbx_mudo.mkv out/rbx_voz.flac out/roblox_ia_ou_humano.mp4
```
