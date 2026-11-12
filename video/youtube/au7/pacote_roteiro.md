# Pacote de roteiro: Among IA 7 (INCOMPLETO, salvo por pausa)

## ONDE PAREI
- Feito: leitura de partida1.txt, partida2.txt, partida3.txt (até t84), eventos e pensamentos nos .json, memoria.json, pedidos_comentarios.md, roteiro_au2.py, metadados do canal (yt-dlp).
- Falta: (1) revisar o texto abaixo; (2) rodar um verificador de citações (cada aspas abaixo existe no .txt/.json?) - NÃO foi feito; (3) reler partida3 (pode ter terminado, ver se Dourado possuiu alguém após o tiro do t84); (4) fechar a estrutura com minutagem; (5) conferir contagens de votos citadas.
- Anotações: scripts auxiliares em /tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/ (m.py imprime falas e pensamentos de uma reunião: `python3 m.py <partida> <tique> <cores>`); metadados yt em scratchpad/yt/.
- Nenhum subagente Haiku foi usado. Sem commit.
- AVISO: partida1.txt linhas 1-63 são de uma execução descartada (reinício no t12). A reunião do t12 válida vem depois de "RETOMANDO". O .json é a fonte de verdade. No chat o impostor ANUNCIA mortes que não aconteceram (ex.: P2 t17 e t37 "matar Azul", P3 t13 "matar Lima", t33 "matar Coral"): vale só o evento "morte" do json.

## 1. O que o AU2 fez (262 mil views, 14/10, 33 min) e como aplicar
Canal (yt-dlp): AU1 24 mil (8/10), AU2 262 mil, AU3 47 mil (16/10), AU4 24 mil, AU5 Polus 17 mil, AU6 Zumbi 6,9 mil (6/11).
- Título com injustiça entendível em uma frase: "(e o Detetive foi expulso por falar a verdade)". Miniatura repetia: "12 IAs" vermelho + logos + balão "EU FALEI A VERDADE!". Título, miniatura e vídeo prometem o mesmo.
- O vídeo entrega a promessa duas vezes e vira gag ("DE NOVO", trombone triste).
- Abre em cena de reunião com virada (impostor entrega o parceiro), depois os comentários do público.
- Espectador sabe papéis e pensamentos; narrador "fui conferir no log".
- Título-história por parte ("O Detetive que ninguém ouviu"); plantar e colher ("grava essa mentira").
- AU7: usar "20 IAs" + nomes conhecidos (Claude, GPT, DeepSeek, Meta); elenco tem pouca marca famosa. Explicar em 1 linha a falta do Gemini.

## 2. Personagens fixos (cores = modelos fixos nas 3 partidas)
- Herói: Rose (MiMo). P1 Sobrevivente vive; acusa Bordo certo; salva por escudo 2x. P2 Doutor, derruba Banana. P3 Perito, expulsa INOCENTE no t83. Memória dela (P1) diz confiar em Vermelho e Dourado.
- Vilão: Dourado (Nex N2.6). P1 Policial (prende o Caqui 2x), P2 Sobrevivente (chamou a reunião que expulsou a Víbora), P3 Possuidor impostor, último vivo, morto por tiro da Rosa no t84. Pensamento: "ele é um recruta imprestável".
- Azarado/bode expiatório: Bordo (DeepSeek), expulso nas 3 (t39 Chantagista, t18 Engenheiro, t9 Carrasco). Extras: Preto (Haiku) morre antes do t16 nas 3; Laranja (Qwen) impostor nas 3 (sorteio python).
- Gag: Carrasco 0 de 3 e os 3 Carrascos se achavam "Palhaço" (Roxo desde t2, Lima t3, Bordo t9).

## 3. Cenas (por força; falas a conferir no .txt)
1. P1 t32-t77 Possuidor. Amarelo (impostor) expulso no t31; t32 "Possuí Roxo; mantenham a cobertura." Roxo (Carrasco, Qwen) passa a ser GPT-6 Luna. 23 viagens de duto, nenhuma testemunha. Pensamento t39 do Roxo: "sacrificá-lo é melhor para ganhar confiança e continuar sozinho." Cai só ao tentar matar Rose (t74). Selo: "JÁ TINHA SIDO EXPULSO". Ideia de @Lucss144 / @NetheritaCraftBr (possuir vivo).
2. P1 t77 Caqui preso salva Rose. Dourado (Policial) prendeu Caqui t72-77; escudo salvou Rose no t74 (evento). Caqui: "Meu escudo funciona de qualquer sala, não precisa estar lá." Rose diz que foi o Anjo. Votos: Roxo 10, Caqui 3. Selo "VERDADE". Policial: @Ponto-Final-Sem-Final ("Dia 12").
3. P3 t79-t84 final. Dourado usou duto Reator->Lançamento no t79: Coral/Verde (viram entrar) e Rose (viu no Lançamento) disseram a verdade; contradição; Rose expulsa 6 votos (Vermelho vale 2). No t84 Rosa (Xerife) atira e acerta Dourado; Coral (inocente) expulsa 7 votos. Restam 7 vivos; ver se há possessão.
4. P3 t16 e t35. Cinza (Policial) decide prender Laranja ("foi impostor nas duas partidas anteriores") no mesmo tique em que Laranja (Gangster) o recruta. t34 Cinza mata Lima. t35 Dourado o entrega; Cinza: "Vote no Dourado." (verdade). 10 votos em Cinza. Selos: Gangster @ZYX-DDFloornoir.
5. P2 t90 empate 106/107. Falta só a antena da Turquesa (Comunicações). Ela tenta ir t56-t90 e se perde na Descontaminação; repete "a barra está quase cheia". Também deu escudo à impostora Coral.
6. P2 t9 Juiz anula. 12 de 18 votos em Laranja (impostor); Marrom anula. Casal Laranja/Coral: "NAO matem o Coral, ele é meu par do casal." Vermelho vota no parceiro (pensamento: "sacrificá-lo agora").
7. P2 t53-t56 Banana mata Roxo disfarçada de Ciano; Coral acusa Ciano e recua ("Eu sei que quem matou foi Banana disfarçado de Ciano"). Ciano já tinha visto a transformação (t18, t22) e ninguém acreditou.
8. P2 t77 "duas Rose": Banana vira Rose, escudo do fantasma Amarelo salva Rose, Azul vê duas; Banana expulsa 11 votos.
9. P3 t15-t16 tique caótico: Banana teleporta todos para o corpo que ele deixou; Ciano morre na própria bomba com Marrom (que o seguia); Laranja recruta Cinza; Dourado apaga luzes.
10. Engenheiro profissão de risco: P1 t12 Preto 16 votos (Xerife acabara de acertar Turquesa), P2 t18 Bordo 14 votos. P1 t28/31 Amarelo e Laranja dizem "Sou Engenheiro" com o verdadeiro já expulso.
11. P1 t22-t33 Laranja: "o duto era atalho" com 8 testemunhas; dois impostores expulsos seguidos.
12. P3 t9 Dourado mata Branco, denuncia, Bordo (Carrasco) expulso 17 votos pensando "de qualquer jeito é lucro".
13. P2 Lima Palhaço: 1 voto em 6 reuniões. P2 t1: reunião do tique 1, 20 pulos.
14. P3 t45 Anjo Branco salva Rosa de Laranja; Dourado: "pode ser o Camuflador".

## 4. Estrutura proposta (~25 min)
Abertura clímax P1 (Roxo = Amarelo) 15 s; pedido de comentários 20 s; regras com exemplo 20 s; P1 (cenas 1, 2, 11), P2 (6, 7, 8, 5), P3 (9, 4, 12, 3 por último); fechamento: placar, lição, pergunta ("Quem você teria expulsado?"). Reordenar se P3 acabar fraca (então P1 por último).

## 5. Títulos
A. Coloquei 20 IAs pra jogar Among Us (e o impostor expulso voltou no corpo de outra IA). Miniatura: "20 IAs" vermelho, Roxo com contorno amarelo, "JÁ FOI EXPULSO".
B. Coloquei 20 IAs pra jogar Among Us (e a que falou a verdade foi expulsa de novo). Miniatura: Rose ejetada, balão "EU FALEI A VERDADE!". Exige mostrar Caqui, Ciano e Rose.
C. Fiz as 4 funções que vocês pediram no Among Us (e 20 IAs empataram faltando UMA tarefa). Miniatura: "106/107" e ícones SVG.
