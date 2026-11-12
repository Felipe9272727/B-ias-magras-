# NOTA DO FABLE: Among IA 7 (quem continuar, comece por aqui)

## Estado (sessão 2, 12/11): EDIÇÃO PRONTA PARA O RENDER COMPLETO
- [x] Roteiro: `video/roteiro/roteiro_au7.py` (61 cenas: abertura, pedidos+regra, 4 partidas, fechamento).
- [x] Falas conferidas no log: `python3 video/scripts/au7_conferir.py` -> 55 falas/pensamentos, 0 sem origem.
      Fatos da narração conferidos por script no .json (17 votos e voto da Rose/Branco no Roxo, 20 pulos, ordem das
      7 expulsões da P4, tiros do Xerife t20/t49, escudos do anjo Roxo t30/t85, 22 dutos, prisões do Caqui).
- [x] Vozes: 172 mp3 em `video/remotion/public/au7/voz` (`--contar` = 0 caracteres faltando). Pensamento com eco (aecho).
- [x] Timeline: `video/remotion/public/timeline_au7.json`: 36.352 quadros = 20:12 a 30 fps.
- [x] Checagens automáticas: 41 memes, nenhum repetido; nenhum selo/meme/número cortado pelo fim da cena; sem emoji
      na timeline nem nos .tsx; mapa de dia (`TemaMira halloween=false`); `tsc` sem erro no au7.
- [x] Conferência visual: 1 still por cena (59) + 12 das cenas mexidas, em folhas de contato. Tudo renderiza.
- [x] Teste de trecho: 180 quadros em 540p mudo (cena p4_m) renderizaram sem erro.
- [x] Faixa de voz/efeitos: `video/remotion/out/au7_voz.flac` (20:12; fora do git, refazer com o comando abaixo).
- [x] Descrição: `video/youtube/descricao_au7.md` (título, capítulos, créditos das 10 trilhas).
- [ ] Render completo + upscale + mix (outra sessão; comandos abaixo).
- [ ] Revisão dos Haikus a cada ~30 s sobre o render (regra do canal) e conserto dos trechos de nota baixa.
- [ ] Miniatura e Short (não fazem parte desta entrega).
- Nada foi commitado (pedido do Felipe). Arquivos alterados/novos: roteiro, timeline, `src/au7/Telas7.tsx`,
  2 vozes novas, `descricao_au7.md`, esta nota.

## O que a sessão 2 mudou em relação ao commit 85acb061
1. Fim da P4 dividido em 3 cenas (antes era uma de 50 s na mesma câmera): `p4_l` (anjo Roxo protege o último
   impostor), `p4_m` NOVA (o Glutão Verde não consegue devorar o Amarelo, tenta o Lima no t85 e o escudo do
   fantasma do Roxo salva: evento "escudo" do log, medico=Roxo, anjo=true) e `p4_n` (empate, mapa aberto).
   A frase antiga "Mordidas registradas no log: nenhuma" saiu (o log tem a tentativa no Lima).
2. Selos e memes novos nos trechos mais longos sem efeito (p1_b, p2_c, p2_e, p3_f, p4_c, p4_e, p4_f, p4_g).
3. Mesa de reunião: deriva ancorada no topo (o título não sai mais da tela); carimbo e ejeção no feminino para
   Rose, Coral, Banana, Turquesa e Rosa ("ROSE EXPULSA", "não era Impostora"), como o narrador fala.

## Comandos (rodar de `video/remotion`)
Refazer timeline/vozes se o roteiro mudar (usa cache; só gera o que falta):
```
python3 ../scripts/build_timeline_au7.py --contar   # quanto falta de voz, sem gastar
python3 ../scripts/build_timeline_au7.py            # confere falas, gera voz e grava a timeline
```
Stills de conferência (também recria `out/au7_public`, a pasta leve de hardlinks usada no render):
```
node au7_stills.mjs out/au7_stills a1+13 p4_m+25 f1+12
```
Render completo 540p mudo, em 4 partes (cada uma como tarefa em segundo plano da sessão, nunca nohup solto):
```
rm -rf /tmp/remotion-webpack-bundle-*
node au7_stills.mjs out/au7_stills 0                 # garante out/au7_public atualizado
for I in 0 1 2 3; do A=$((I*9088)); B=$((A+9087)); \
  npx remotion render AU7Video out/au7_p$I.mkv --public-dir=out/au7_public --codec=h264-mkv --frames=$A-$B \
  --scale=0.5 --muted --concurrency=4 --timeout=240000 --crf=18 --log=error; done
printf "file 'au7_p%s.mkv'\n" 0 1 2 3 > out/au7_lista.txt
ffmpeg -y -f concat -safe 0 -i out/au7_lista.txt -c copy out/au7_mudo.mkv
```
(36.352 quadros = 4 x 9.088. No teste local, 180 quadros levaram ~10 s. Se o total de quadros mudar, recalcular.)
Voz + efeitos fora do Remotion, juntar, e final (upscale Lanczos 1080p, cor, trilhas com sidechain, -14 LUFS):
```
python3 ../scripts/au7_audio.py out/au7_voz.flac
ffmpeg -y -i out/au7_mudo.mkv -i out/au7_voz.flac -map 0:v -map 1:a -c:v copy -c:a flac out/au7_completo.mkv
python3 ../scripts/au7_final.py out/au7_completo.mkv out/AMONG_IA_7.mp4
```
O upscale é o `scale=1920:1080:flags=lanczos` dentro do `au7_final.py`. Disco: havia ~3 GB livres; apagar
`/tmp/remotion-webpack-bundle-*` e os `out/au7_p*.mkv` depois do concat.

## Avisos
- `au7_render_parte.sh` (render no GitHub Actions) existe, mas NÃO há workflow do AU7 nem `public/au7_pedido.json`:
  para usar o Actions é preciso copiar `zumbi-render.yml` e criar o pedido. O render local acima dispensa isso.
- GIFs (*.gif) e músicas (*.mp3) são ignorados pelo git: se o contêiner reiniciar, baixar de novo (MEMORIA_TECNICA.md).
  Os 41 memes usados existem hoje em `public/gifs`; nenhum é da lista de `media_url` errado.
- Pico da faixa de voz 1,04 antes do mix: o `au7_final.py` normaliza e limita, não precisa mexer.

## O que eu faria com mais tempo (opcional)
- Na mesa de reunião o terço de baixo fica vazio quando ninguém fala: caberia um painel "o que o log diz" com a prova.
- O vídeo tem 20 min; o pacote previa ~29. Cenas do pacote que ficaram de fora e dá para acrescentar: P2 t56
  (a Coral recua sem entregar a Banana), P4 t81 (o Xerife querendo atirar no Bordo), P2 t10 (prisão vira álibi).
- Render final: https://gofile.io/d/ClbtlJBc (AMONG_IA_7.mp4, 1080p, 20:12, 489 MB)
